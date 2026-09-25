/* _158-costo-tinta.js — QUANTO COSTA la tela tinta di una divisa (voce #158).
   Sprite3D prepara, alla prima figura di ogni divisa, una copia dell'atlante
   gia' tinta: un passaggio su tutti i pixel. Qui si misura, nel gioco con
   la toppa, il tempo di tela() per tre look nuovi e di un drawImage di
   fotogramma, con performance.now(). Non e' un cancello: e' il numero da
   scrivere nel verbale al posto di «da misurare».
   USO: node strumenti/_158-costo-tinta.js [--gioco fuori/sprite/CALCETTO-sprite.html] */
const { chromium } = require('playwright');
const argv = process.argv.slice(2);
const pren = (n) => { const i = argv.indexOf(n); return i >= 0 && argv[i+1] ? argv[i+1] : null; };
const GIOCO = (pren('--gioco') || 'fuori/sprite/CALCETTO-sprite.html').split(String.fromCharCode(92)).join('/');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 800, height: 370 } });
  await pg.goto('http://127.0.0.1:8777/' + GIOCO, { waitUntil: 'load' });
  await pg.waitForFunction(() => window.__test && window.__test.sprite && window.__test.sprite.pronto, null, { timeout: 20000 });
  const r = await pg.evaluate(() => {
    const SP = Sprite3D; const out = { atlante: SP.TAV.colonne * SP.TAV.cella + 'x' + SP.TAV.righe * SP.TAV.cella, tele: [], draw: 0 };
    const looks = [
      { maglia: '#d62828', maglia2: '#ffffff', pantaloncini: '#1b1b3a', disegno: 'tinta' },
      { maglia: '#1d4ed8', maglia2: '#f5f5f5', pantaloncini: '#0b0f2a', disegno: 'strisce' },
      { maglia: '#f2c400', maglia2: '#111111', pantaloncini: '#202020', disegno: 'fascia' },
    ];
    for (const lk of looks) { const t0 = performance.now(); SP.tela(lk); out.tele.push(+(performance.now() - t0).toFixed(1)); }
    const c = document.createElement('canvas'); c.width = 400; c.height = 300; const g = c.getContext('2d');
    const t1 = performance.now();
    for (let i = 0; i < 2200; i++) SP.disegna(g, 200, 200, 40, (i % 8) * Math.PI / 4, 'alto', 'corsa', i * 0.01, looks[i % 3], true, 1.18, 0);
    out.draw = +((performance.now() - t1) / 2200 * 1000).toFixed(1);   // microsecondi per figura
    return out;
  });
  console.log('  atlante ' + r.atlante + '  ·  tela tinta per divisa: ' + r.tele.join(' / ') + ' ms  ·  disegna(): ' + r.draw + ' µs per figura (Chromium headless, PC)');
  await b.close();
})().catch(e => { console.log('  ??  esploso:', e.message); process.exit(2); });
