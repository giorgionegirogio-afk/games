/* Il conto dei sorteggi A RUNTIME, con SEME acceso: la stessa partita sul
   gioco spedito e sulla copia curata, contro l'avversario ANONIMO (il
   ramo dei banchi) e contro una squadra col carattere. */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const R = 'C:/Users/Utenteee/Desktop/GitHub/games';

function servi(prova) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(R, decodeURIComponent(req.url.split('?')[0]));
      if (prova && /CALCETTO-il-gioco\.html$/i.test(f)) f = prova;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

(async () => {
  const out = {};
  for (const [et, file] of [['SPEDITO', null], ['CURATA', path.join(R, 'fuori/carattere2.html')]]) {
    const srv = await servi(file);
    const br = await chromium.launch();
    const ctx = await br.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
    const pag = await ctx.newPage();
    const err = []; pag.on('pageerror', e => err.push(e.message));
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
    await pag.waitForTimeout(150);
    await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
    const r = await pag.evaluate(() => {
      const t = window.__test, res = {};
      const casi = [
        ['anonimo t5', 5, undefined],
        ['anonimo t11', 11, undefined],
        ['BORGO ALTO t11', 11, TOUR_POOL.find(o => o.n === 'BORGO ALTO')],
        ['PRATI BASSI t11', 11, TOUR_POOL.find(o => o.n === 'PRATI BASSI')],
      ];
      for (const [nome, size, opp] of casi) {
        t.semina(20260803);
        const o = opp ? { size, opp } : { size };
        t.startMatch(1, 1, o);
        t.setCpuVsCpu(true);
        let sim = 0;
        while (t.state !== 'end' && sim < 900) { t.simulate(10); sim += 10; }
        res[nome] = { sorteggi: t.sorteggi, punteggio: t.score.slice(), tiri: G.stats.tiri.slice() };
        t.desemina();
      }
      return res;
    });
    out[et] = r;
    if (err.length) console.log(et + ' ECCEZIONI: ' + err.join(' | '));
    await br.close(); srv.chiudi();
  }
  console.log('caso'.padEnd(18) + 'sorteggi SPEDITO -> CURATA     punteggio      tiri');
  for (const k of Object.keys(out.SPEDITO)) {
    const a = out.SPEDITO[k], b = out.CURATA[k];
    const seg = a.sorteggi === b.sorteggi && JSON.stringify(a.punteggio) === JSON.stringify(b.punteggio) ? '  IDENTICA' : '  DIVERSA';
    console.log(k.padEnd(18) + String(a.sorteggi).padStart(8) + ' -> ' + String(b.sorteggi).padEnd(9) +
      '  ' + a.punteggio.join('-') + ' -> ' + b.punteggio.join('-') +
      '   ' + a.tiri.join('/') + ' -> ' + b.tiri.join('/') + seg);
  }
})();
