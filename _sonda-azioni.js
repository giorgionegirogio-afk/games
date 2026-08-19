/* SONDA DI SOLA LETTURA: conta, in partite CPU contro CPU, quante volte
   ciascuna azione del gioco viene davvero invocata. Non tocca il gioco. */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = 'C:/Users/Utenteee/Desktop/GitHub/games';
const PORT = 8791;

const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/CALCETTO-il-gioco.html';
  const f = path.join(ROOT, p);
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); res.end('no'); return; }
    const ext = path.extname(f);
    res.writeHead(200, {
      'Content-Type': ext === '.html' ? 'text/html; charset=utf-8' : 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(d);
  });
});

(async () => {
  await new Promise(r => srv.listen(PORT, r));
  const browser = await chromium.launch();
  const risultati = [];
  for (const cfg of [{ size: 5, diff: 1 }, { size: 5, diff: 2 }, { size: 7, diff: 2 }, { size: 11, diff: 2 }]) {
    for (let rip = 0; rip < 3; rip++) {
      const page = await browser.newPage({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 1 });
      const errs = [];
      page.on('pageerror', e => errs.push(String(e)));
      await page.goto(`http://127.0.0.1:${PORT}/CALCETTO-il-gioco.html?cb=${Date.now()}_${rip}`, { waitUntil: 'load' });
      await page.waitForFunction(() => !!window.__test, null, { timeout: 30000 });
      const out = await page.evaluate(async (cfg) => {
        const T = window.__test;
        T.dismissSplash && T.dismissSplash();
        T.startMatch(1, cfg.diff, { size: cfg.size });
        T.setCpuVsCpu(true);
        // 90 secondi di partita + eventuale supplementare
        let g = 0;
        for (let i = 0; i < 40 && T.state !== 'end' && T.state !== 'menu'; i++) {
          g = T.simulate(5);
        }
        const s = T.stats;
        const c = k => (s[k] ? [s[k][0], s[k][1]] : null);
        return {
          scene: T.state, score: T.score,
          tiri: c('tiri'), inPorta: c('inPorta'), perfetti: c('perfetti'),
          parate: c('parate'), rubate: c('rubate'), falli: c('falli'),
          gialli: c('gialli'), espulsi: c('espulsi'),
          filtranti: c('filtranti'), cross: c('cross'),
          pallonetti: c('pallonetti'), volee: c('volee'), rovesciate: c('rovesciate'),
        };
      }, cfg);
      out.size = cfg.size; out.diff = cfg.diff; out.rip = rip; out.errs = errs;
      risultati.push(out);
      console.log(JSON.stringify(out));
      await page.close();
    }
  }
  await browser.close();
  srv.close();
  // somma
  const tot = {};
  for (const r of risultati) {
    for (const k of ['tiri','inPorta','perfetti','parate','rubate','falli','gialli','espulsi','filtranti','cross','pallonetti','volee','rovesciate']) {
      if (!r[k]) continue;
      tot[k] = (tot[k] || 0) + r[k][0] + r[k][1];
    }
  }
  console.log('TOTALE 12 PARTITE CPU-vs-CPU:', JSON.stringify(tot));
})();
