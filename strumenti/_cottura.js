/* =====================================================================
   _cottura.js — QUANTO COSTA LA COTTURA DEL CAMPO. ATTREZZO (prefisso _).

   PERCHE' ESISTE. Sul banco occupato di oggi prestazione.js --contro
   misura una differenza che scavalca lo zero: il ballo fra repliche
   dello stesso file arriva al 180%, e una modifica che tocca SOLO la
   cottura della tessitura — cioe' zero operazioni a fotogramma — sta
   sotto la risoluzione dell'attrezzo. Dire "+8,5%" o "-4,7%" con quel
   rumore addosso non e' misurare, e' tirare a indovinare.
   Questo attrezzo misura la SOLA COSA CHE E' CAMBIATA: il tempo di
   buildFieldTex(), la cottura, chiamata N volte di fila nella stessa
   pagina. Il rumore del banco resta, ma colpisce N ripetizioni dentro
   lo stesso secondo e si legge nella mediana invece che nel caso.

   COSA NON DICE, e va detto: non dice il costo a fotogramma. Lo dice
   prestazione.js. Questo dice quanto costa la passata di pennello, che
   e' il numero da cui il costo a fotogramma DISCENDE — la cottura si
   paga a ogni panoramica che esce dalla finestra gia' cotta
   (campoVivoDisegna) e a ogni cambio di taglia o di campo.

   uso: node strumenti/_cottura.js A.html B.html [--n 15]
   ===================================================================== */
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
function arg(n, d) {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
}
const N = +arg('n', 15);
const file = process.argv.slice(2).filter(a => !a.startsWith('--') && a.endsWith('.html'));

function servi(dir) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const p = decodeURIComponent(req.url.split('?')[0]);
      let f = path.join(dir, p);
      if (!fs.existsSync(f)) f = path.join(RADICE, p);
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('no'); return; }
      res.writeHead(200, { 'Content-Type': p.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

async function misura(browser, porta, nome) {
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const pg = await ctx.newPage();
  await pg.goto(`http://127.0.0.1:${porta}/${nome}`, { waitUntil: 'load' });
  await pg.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pg.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); t.startMatch(1, 1); });
  await pg.waitForTimeout(600);
  const r = await pg.evaluate(n => {
    if (typeof window.buildFieldTex !== 'function') return { errore: 'buildFieldTex non e\' globale' };
    const v = [];
    for (let i = 0; i < n; i++) {
      const a = performance.now();
      window.buildFieldTex();
      v.push(performance.now() - a);
    }
    v.sort((x, y) => x - y);
    return { mediana: v[v.length >> 1], minimo: v[0], tutti: v.map(x => +x.toFixed(1)) };
  }, N);
  await ctx.close();
  return r;
}

(async () => {
  if (file.length !== 2) { console.error('uso: node strumenti/_cottura.js A.html B.html [--n 15]'); process.exit(2); }
  const dirs = file.map(f => path.dirname(path.resolve(f)));
  const nomi = file.map(f => path.basename(f));
  const browser = await chromium.launch();
  const out = [[], []];
  /* alternati, cosi' una deriva del banco colpisce i due allo stesso modo */
  const GIRI = +arg('giri', 3);
  for (let giro = 0; giro < GIRI; giro++) {
    for (const k of (giro % 2 ? [1, 0] : [0, 1])) {
      const srv = await servi(dirs[k]);
      const r = await misura(browser, srv.porta, nomi[k]);
      srv.chiudi();
      if (r.errore) { console.error(r.errore); process.exit(1); }
      out[k].push(r.mediana);
      console.log(`  giro ${giro + 1}  ${nomi[k].padEnd(12)} cottura mediana ${r.mediana.toFixed(1)} ms  (min ${r.minimo.toFixed(1)})`);
    }
  }
  await browser.close();
  const med = v => { const s = [...v].sort((a, b) => a - b); return s[s.length >> 1]; };
  const A = med(out[0]), B = med(out[1]);
  console.log(`\n  ${nomi[0]}: cottura ${A.toFixed(1)} ms`);
  console.log(`  ${nomi[1]}: cottura ${B.toFixed(1)} ms`);
  console.log(`  differenza ${(100 * (B - A) / A >= 0 ? '+' : '')}${(100 * (B - A) / A).toFixed(1)}%  (${(B - A >= 0 ? '+' : '')}${(B - A).toFixed(1)} ms per cottura)`);
  console.log(`  carico del banco: ${os.loadavg ? '' : ''}${os.cpus().length} cpu`);
})();
