/* =====================================================================
   _crit-anim-costo.js — IL CRONOMETRO, IN PANINI A-B-B-A.

   Misura il tempo di UN disegna() a partita viva, alternando i due file
   nello stesso processo e nella stessa macchina (A B B A ...), cosi' il
   riscaldamento e il rumore della macchina cadono sui due allo stesso
   modo. Per ogni giro: 900 fotogrammi, si scarta il primo terzo
   (riscaldamento) e si tiene la MEDIANA dei per-fotogramma.

   uso: node strumenti/_crit-anim-costo.js --a fuori/x.html --b fuori/y.html
                                           [--taglia 11] [--giri 4]
   ===================================================================== */
const path = require('path');
const { servi, bancoDiProva, semeFisso } = require('./_posa.js');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const A = path.resolve(arg('a', '')), B = path.resolve(arg('b', ''));
const N = +arg('taglia', 11), GIRI = +arg('giri', 4), FR = +arg('fr', 900);

async function giro(browser, srv, file) {
  const rel = path.relative(RADICE, file).split(path.sep).join('/');
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2 });
  const pag = await ctx.newPage();
  /* IL BANCO STUBBA performance.now (passo fisso): l'orologio VERO va
     salvato PRIMA, o si cronometra un contatore che non scorre. */
  await pag.addInitScript(() => { const f = performance.now.bind(performance); window.__veroOra = f; });
  await pag.addInitScript(bancoDiProva);
  await pag.addInitScript(semeFisso, 20260820);
  await pag.addInitScript(() => { window.requestIdleCallback = () => 0; window.cancelIdleCallback = () => {}; });
  await pag.goto('http://127.0.0.1:' + srv.porta + '/' + rel + '?q=' + Date.now(), { waitUntil: 'load' });
  await pag.evaluate(() => window.__banco.passo(30));
  await pag.evaluate((n) => {
    window.__test.dismissSplash && window.__test.dismissSplash();
    window.__test.startMatch(1, 1, { size: n });
    window.__test.Tut && window.__test.Tut.finish && window.__test.Tut.finish(true);
    window.__test.setCpuVsCpu(true); window.__test.setTimeLeft(300);
  }, N);
  const r = await pag.evaluate((fr) => {
    /* performance.now() e' arrotondato: si cronometra a BLOCCHI di 30
       fotogrammi e si divide, poi mediana dei blocchi. */
    const BL = 30, nb = Math.floor(fr / BL);
    const t = [];
    for (let b = 0; b < nb; b++) {
      for (let i = 0; i < BL; i++) window.__test.simulate(1 / 60);
      const t0 = window.__veroOra();
      for (let i = 0; i < BL; i++) window.__test.disegna();
      t.push((window.__veroOra() - t0) / BL);
    }
    const u = t.slice(Math.floor(nb / 3)).sort((a, b) => a - b);
    return { med: u[u.length >> 1], p90: u[Math.floor(u.length * 0.9)], n: u.length,
             sc: window.__test.G.score.join('-') };
  }, FR);
  await ctx.close();
  return r;
}

(async () => {
  const { chromium } = require('playwright');
  const srv = await servi();
  const browser = await chromium.launch();
  const res = { A: [], B: [] };
  for (let g = 0; g < GIRI; g++) {
    const ordine = (g % 2 === 0) ? ['A', 'B'] : ['B', 'A'];   // A B  B A  A B  B A
    for (const q of ordine) {
      const r = await giro(browser, srv, q === 'A' ? A : B);
      res[q].push(r.med);
      process.stderr.write(`  giro ${g} ${q}: ${r.med.toFixed(3)} ms (p90 ${r.p90.toFixed(3)}, ${r.sc})\n`);
    }
  }
  await browser.close(); srv.chiudi();
  const med = a => { const u = a.slice().sort((x, y) => x - y); return u.length % 2 ? u[u.length >> 1] : (u[u.length / 2 - 1] + u[u.length / 2]) / 2; };
  const mA = med(res.A), mB = med(res.B);
  console.log('CRONOMETRO — taglia ' + N + ', ' + FR + ' fotogrammi per giro, ' + GIRI * 2 + ' giri alternati');
  console.log('  A ' + path.basename(A) + ':  ' + res.A.map(x => x.toFixed(3)).join('  ') + '   mediana ' + mA.toFixed(3) + ' ms');
  console.log('  B ' + path.basename(B) + ':  ' + res.B.map(x => x.toFixed(3)).join('  ') + '   mediana ' + mB.toFixed(3) + ' ms');
  console.log('  differenza B-A: ' + (mB - mA >= 0 ? '+' : '') + (mB - mA).toFixed(3) + ' ms  (' + (mB - mA >= 0 ? '+' : '') + (100 * (mB - mA) / mA).toFixed(1) + '%)');
  const vinceB = res.A.map((x, i) => res.B[i] > x);
  console.log('  panini in cui B costa piu di A: ' + vinceB.filter(Boolean).length + ' su ' + vinceB.length);
})().catch(e => { console.error('FALLITO: ' + (e && e.message || e)); process.exit(1); });
