/* CRITICO: LA LEGGE SUI SORTEGGI misurata a RUNTIME, non contando le
   righe: si avvolge dado() e si conta quante volte viene chiamato in una
   partita seminata identica, piu' il punteggio finale. Due file devono
   dare lo stesso numero e lo stesso punteggio. */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i+1] && !process.argv[i+1].startsWith('--') ? process.argv[i+1] : d; };
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'CALCETTO-il-gioco.html')));
function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (/CALCETTO-il-gioco\.html$/i.test(f)) f = GIOCO;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  const out = [];
  for (const seme of [11, 77]) {
    const ctx = await br.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true });
    const pg = await ctx.newPage();
    await pg.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html?t=${Date.now()}`, { waitUntil: 'load' });
    await pg.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pg.evaluate(() => window.__test.dismissSplash());
    await pg.waitForTimeout(200);
    const r = await pg.evaluate(async (seme) => {
      const t = window.__test;
      /* si avvolge il dado dalla pagina: e' l'unico modo di contare le
         CHIAMATE invece delle righe di sorgente */
      let n = 0;
      const orig = window.dado;
      if (typeof orig !== 'function') return { errore: 'dado non e\' globale' };
      window.dado = function () { n++; return orig.apply(this, arguments); };
      t.semina(seme);
      if (typeof window.startMatch === 'function') window.startMatch(1, 1);
      let r = null;
      for (let g = 0; g < 60 && (!r || r.scene !== 'end'); g++) r = t.simulate(20);
      const fine = { avvolti: n, semeN: window.SEME ? window.SEME.n : null,
                     punteggio: r ? r.score : null, scena: r ? r.scene : null };
      window.dado = orig;
      return fine;
    }, seme);
    out.push({ seme, ...r });
    await ctx.close();
  }
  await br.close(); srv.chiudi();
  console.log(path.basename(GIOCO) + '  ' + JSON.stringify(out));
})();
