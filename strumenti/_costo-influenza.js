/* =====================================================================
   _costo-influenza.js — QUANTO COSTA LA MAPPA, misurato invece che stimato.

   Carica il gioco con la toppa dello spazio, avvia una partita vera,
   la fa avanzare fino a meta' (cosi' gli uomini sono sparsi come in
   gioco e non allineati al calcio d'inizio), poi cronometra:
     · costruisciInfluenza  — il costo per RICOSTRUZIONE, che avviene
       quattro volte al secondo (BRAIN_HZ), non a ogni fotogramma;
     · influenza            — il costo di UNA LETTURA;
     · step                 — il costo di un fotogramma intero di fisica,
       che e' il metro contro cui i due numeri sopra vanno letti.
   Conta anche le CASELLE TOCCATE per ricostruzione, che e' il numero
   scritto nel commento della toppa.

   uso: node strumenti/_costo-influenza.js --gioco fuori/sp-tutto.html --taglia 11
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};

function servi(prova) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (prova && /CALCETTO-il-gioco\.html$/i.test(f)) f = prova;
      if ((!f.startsWith(RADICE) && f !== prova) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

(async () => {
  const gioco = arg('gioco', 'fuori/sp-tutto.html');
  const prova = path.resolve(RADICE, gioco);
  if (!fs.existsSync(prova)) { console.error('non esiste ' + prova); process.exit(1); }
  const srv = await servi(prova);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  pag.on('pageerror', e => { console.error('ECCEZIONE: ' + e.message); });
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });

  for (const taglia of [5, 7, 11]) {
    const r = await pag.evaluate(tg => {
      const t = window.__test;
      t.startMatch(1, 1, tg !== 5 ? { size: tg } : undefined);
      t.setCpuVsCpu(true);
      t.simulate(60);                       // meta' partita: uomini sparsi
      /* CASELLE TOCCATE: si conta rifacendo lo stesso ciclo di
         costruisciInfluenza senza scrivere niente. E' una copia del
         ciclo, e va tenuta allineata a mano: serve solo a stampare un
         numero per il commento, non a far girare il gioco. */
      let celle = 0;
      {
        const cw = FW / INF_X, ch = FH / INF_Y;
        for (const p of G.players) {
          if (p.out > 0) continue;
          const px = p.x + p.vx * INF_LEAD, py = p.y + p.vy * INF_LEAD;
          let i0 = Math.floor((px - INF_R) / cw), i1 = Math.floor((px + INF_R) / cw);
          let j0 = Math.floor((py - INF_R) / ch), j1 = Math.floor((py + INF_R) / ch);
          if (i0 < 0) i0 = 0; if (i1 > INF_X - 1) i1 = INF_X - 1;
          if (j0 < 0) j0 = 0; if (j1 > INF_Y - 1) j1 = INF_Y - 1;
          for (let j = j0; j <= j1; j++) { const dy = (j + 0.5) * ch - py; if (dy * dy >= INF_R2) continue; celle += (i1 - i0 + 1); }
        }
      }
      const K = 4000;
      /* riscaldamento: il primo giro paga la compilazione */
      for (let i = 0; i < 400; i++) { INF_T = 0; costruisciInfluenza(1 / 60); }
      let t0 = performance.now();
      for (let i = 0; i < K; i++) { INF_T = 0; costruisciInfluenza(1 / 60); }
      const usCostr = (performance.now() - t0) * 1000 / K;
      let acc = 0;
      for (let i = 0; i < 2000; i++) acc += presidio((i * 37) % FW, (i * 53) % FH, i & 1);
      t0 = performance.now();
      for (let i = 0; i < 200000; i++) acc += presidio((i * 37) % FW, (i * 53) % FH, i & 1);
      const nsLett = (performance.now() - t0) * 1e6 / 200000;
      /* un fotogramma intero di fisica, per avere il metro */
      for (let i = 0; i < 60; i++) step();
      t0 = performance.now();
      for (let i = 0; i < 600; i++) step();
      const usStep = (performance.now() - t0) * 1000 / 600;
      return { taglia: tg, celle, usCostr, nsLett, usStep, acc };
    }, taglia);
    console.log('  taglia ' + String(r.taglia).padStart(2) +
      '   caselle toccate ' + String(Math.round(r.celle)).padStart(4) +
      '   costruzione ' + r.usCostr.toFixed(1).padStart(6) + ' us' +
      '   lettura ' + r.nsLett.toFixed(1).padStart(5) + ' ns' +
      '   fotogramma ' + r.usStep.toFixed(1).padStart(6) + ' us' +
      '   -> ' + (r.usCostr * (4 / 60) / r.usStep * 100).toFixed(2) + '% della fisica' +
      ', ' + (r.usCostr * (4 / 60) / 16000 * 100).toFixed(4) + '% dei 16 ms');
  }
  await ctx.close(); await browser.close(); srv.chiudi();
  console.log('\n  (la costruzione avviene 4 volte al secondo e il fotogramma 60, quindi');
  console.log('   la spesa ammortizzata a fotogramma e\' costruzione*4/60. Il PICCO e\'');
  console.log('   la costruzione intera, che cade su un fotogramma su quindici.)');
})();
