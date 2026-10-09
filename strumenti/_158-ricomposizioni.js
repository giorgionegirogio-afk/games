/* _158-ricomposizioni.js — QUANTE VOLTE AL SECONDO si ricompone una figura
   con pelle e capelli in una partita vera (voce #158, compito 4). Avvia
   una partita CPU contro CPU a taglia 5, lascia correre 20 s di orologio
   vero e legge il contatore di Sprite3D prima e dopo. Se escono migliaia
   al secondo la chiave della cache non e' stabile; se ~100-200 il costo
   della persona sta nelle ricomposizioni attese (una ogni cambio di
   fotogramma per chi corre). Non e' un cancello.
   USO: node strumenti/_158-ricomposizioni.js [--gioco CALCETTO-il-gioco.html] [--secondi 20] */
const { chromium } = require('playwright');
const argv = process.argv.slice(2);
const pren = (n) => { const i = argv.indexOf(n); return i >= 0 && argv[i+1] ? argv[i+1] : null; };
const GIOCO = (pren('--gioco') || 'CALCETTO-il-gioco.html').split(String.fromCharCode(92)).join('/');
const SEC = +(pren('--secondi') || 20);
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 800, height: 370 } });
  await pg.goto('http://127.0.0.1:8777/' + GIOCO, { waitUntil: 'load' });
  await pg.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pg.waitForTimeout(800);
  await pg.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); t.startMatch(1, 1, { size: 5 }); t.Tut && t.Tut.finish && t.Tut.finish(true); t.posaHUD && t.posaHUD(true); t.setCpuVsCpu && t.setCpuVsCpu(true); });
  await pg.waitForTimeout(3000);
  const s0 = await pg.evaluate(() => ({ r: window.__test.sprite.ricomposizioni, p: window.__test.sprite.persone, t: performance.now() }));
  await pg.waitForTimeout(SEC * 1000);
  const s1 = await pg.evaluate(() => ({ r: window.__test.sprite.ricomposizioni, p: window.__test.sprite.persone, t: performance.now() }));
  const dt = (s1.t - s0.t) / 1000;
  console.log('  ' + SEC + ' s di partita: ' + (s1.r - s0.r) + ' ricomposizioni (' + ((s1.r - s0.r) / dt).toFixed(1) + ' al secondo), ' + s1.p + ' look con persona');
  await b.close();
})().catch(e => { console.log('  ??  esploso:', e.message); process.exit(2); });
