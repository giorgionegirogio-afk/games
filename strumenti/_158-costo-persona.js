/* _158-costo-persona.js — DOVE VA IL TEMPO dello strato persona (voce #158,
   compito 4). Cronometra separatamente, a cache piena: la sola divisa
   (look senza pelle), persona() da sola (chiave + LRU), il drawImage dallo
   strato, e la figura intera con pelle e capelli. Non e' un cancello.
   USO: node strumenti/_158-costo-persona.js [--gioco CALCETTO-il-gioco.html] */
const { chromium } = require('playwright');
const argv = process.argv.slice(2);
const pren = (n) => { const i = argv.indexOf(n); return i >= 0 && argv[i+1] ? argv[i+1] : null; };
const GIOCO = (pren('--gioco') || 'CALCETTO-il-gioco.html').split(String.fromCharCode(92)).join('/');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 800, height: 370 } });
  await pg.goto('http://127.0.0.1:8777/' + GIOCO, { waitUntil: 'load' });
  await pg.waitForFunction(() => window.__test && window.__test.sprite && window.__test.sprite.pronto, null, { timeout: 20000 });
  const r = await pg.evaluate(() => {
    const SP = Sprite3D, N = 2000;
    const L0 = { maglia: '#d62828', maglia2: '#ffffff', pantaloncini: '#1b1b3a', disegno: 'tinta' };
    const L1 = Object.assign({ pelle: '#8d5a3b', capelli: '#4a3220' }, L0);
    const c = document.createElement('canvas'); c.width = 400; c.height = 300; const g = c.getContext('2d');
    const mis = (fn) => { fn(); fn(); const t0 = performance.now(); for (let i = 0; i < N; i++) fn(i); return +((performance.now() - t0) / N * 1000).toFixed(1); };
    const out = {};
    out.divisa = mis(i => SP.disegna(g, 200, 200, 40, (i % 8) * Math.PI / 4, 'alto', 'corsa', (i % 40) * 0.01, L0, true, 1.18, 0));
    out.figuraIntera = mis(i => SP.disegna(g, 200, 200, 40, (i % 8) * Math.PI / 4, 'alto', 'corsa', (i % 40) * 0.01, L1, true, 1.18, 0));
    const v = SP.voce('corsa').v; const fr = v[2]; const f = fr[0];
    out.personaSola = mis(() => SP.persona(SP.tela(L1), f, L1));
    const pc = SP.persona(SP.tela(L1), f, L1); const cel = SP.TAV.cella;
    out.drawStrato = mis(() => g.drawImage(pc, 0, 0, cel, cel, 180, 180, 46, 46));
    /* la ricomposizione a ogni cambio di fotogramma: e' il costo vero per giocatore, ~10 volte al secondo */
    const fr2 = v[2];
    out.ricomposizione = mis(i => SP.persona(SP.tela(L1), fr2[(i || 0) % fr2.length], L1));
    out.drawDivisa = mis(() => g.drawImage(SP.tela(L0), 0, 0, cel, cel, 180, 180, 46, 46));
    out.persone = SP.stato().persone;
    return out;
  });
  console.log('  µs per chiamata (Chromium headless, PC):', JSON.stringify(r));
  await b.close();
})().catch(e => { console.log('  ??  esploso:', e.message); process.exit(2); });
