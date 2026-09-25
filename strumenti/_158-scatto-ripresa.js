/* _158-scatto-ripresa.js — LA RIPRESA DEL GOL, stesso istante, due grafiche
   (voce #158, compito 3). Avvia una partita CPU contro CPU a taglia 5 e
   aspetta il primo gol: quando G.ripresa si accende lascia correre la
   scena per un secondo e mezzo e scatta con gli sprite e col rig (il
   rubinetto __test.spriteOn). Scatti in strumenti/_158-prove/ripresa-*.png.
   USO: node strumenti/_158-scatto-ripresa.js [--gioco CALCETTO-il-gioco.html] [--attesa 240]
   Non e' un cancello: e' uno scatto per l'occhio. Esce 2 se in --attesa
   secondi non arriva un gol (non accusa il gioco). */
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const argv = process.argv.slice(2);
const pren = (n) => { const i = argv.indexOf(n); return i >= 0 && argv[i+1] ? argv[i+1] : null; };
const GIOCO = (pren('--gioco') || 'CALCETTO-il-gioco.html').split(String.fromCharCode(92)).join('/');
const ATTESA = +(pren('--attesa') || 240);
const FUORI = path.join(__dirname, '_158-prove');
(async () => {
  fs.mkdirSync(FUORI, { recursive: true });
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 800, height: 370 }, deviceScaleFactor: 2.5, isMobile: true, hasTouch: true });
  await pg.goto('http://127.0.0.1:8777/' + GIOCO, { waitUntil: 'load' });
  await pg.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pg.waitForTimeout(800);
  await pg.evaluate(() => {
    const t = window.__test;
    t.dismissSplash && t.dismissSplash();
    t.startMatch(1, 1, { size: 5 });
    t.Tut && t.Tut.finish && t.Tut.finish(true);
    t.posaHUD && t.posaHUD(true);
    t.setCpuVsCpu && t.setCpuVsCpu(true);
  });
  const t0 = Date.now(); let presa = false;
  while (Date.now() - t0 < ATTESA * 1000) {
    await pg.waitForTimeout(400);
    const r = await pg.evaluate(() => !!(typeof G !== 'undefined' && G.ripresa));
    if (r) { presa = true; break; }
  }
  if (!presa) { console.log('  ??  nessun gol in ' + ATTESA + ' s: niente ripresa da fotografare'); await b.close(); process.exit(2); }
  await pg.waitForTimeout(1500);
  await pg.screenshot({ path: path.join(FUORI, 'ripresa-sprite.png') });
  await pg.evaluate(() => window.__test.spriteOn(false));
  await pg.waitForTimeout(120);
  await pg.screenshot({ path: path.join(FUORI, 'ripresa-rig.png') });
  await pg.evaluate(() => window.__test.spriteOn(true));
  const st = await pg.evaluate(() => ({ ripresa: !!G.ripresa, scena: window.__test.state, tinte: window.__test.sprite.tinte }));
  console.log('  ripresa fotografata dopo ' + ((Date.now() - t0) / 1000).toFixed(0) + ' s:', JSON.stringify(st));
  await b.close();
})().catch(e => { console.log('  ??  esploso:', e.message); process.exit(2); });
