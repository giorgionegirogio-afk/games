/* _158-fumo.js — prova di fumo degli sprite (voce #158): il gioco con la
   toppa si apre, Sprite3D decodifica l'atlante, nessun errore in console.
   USO: node strumenti/_158-fumo.js [--gioco fuori/sprite/CALCETTO-sprite.html]
   Serve il server locale (python -m http.server 8777 --bind 127.0.0.1).
   Esce 0 verde, 1 rosso, 2 banco esploso. */
const { chromium } = require('playwright');
const argv = process.argv.slice(2);
const pren = (n) => { const i = argv.indexOf(n); return i >= 0 && argv[i+1] ? argv[i+1] : null; };
const GIOCO = (pren('--gioco') || process.env.GIOCO_PROVA || 'fuori/sprite/CALCETTO-sprite.html').split('\\').join('/');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 800, height: 450 } });
  /* il 404 dello script del service worker (sw.js) NON e' degli sprite:
     la copia di prova in fuori/ non ha sw.js accanto. Si scarta quello
     e solo quello; ogni altro errore resta rosso. */
  const err = []; pg.on('pageerror', e => err.push(String(e)));
  pg.on('console', m => { if (m.type() === 'error' && !/fetching the script|sw\.js/.test(m.text())) err.push(m.text()); });
  await pg.goto('http://127.0.0.1:8777/' + GIOCO, { waitUntil: 'load' });
  await pg.waitForTimeout(2500);
  const s = await pg.evaluate(() => window.__test && window.__test.sprite);
  console.log('  sprite:', JSON.stringify(s));
  if (!s) { console.log('  ??  window.__test.sprite assente'); await b.close(); process.exit(2); }
  const rosso = !s.pronto || s.fallito || err.length > 0;
  console.log('  errori in console:', err.length, err.slice(0, 5).join(' | '));
  console.log(rosso ? '  ROSSO' : '  VERDE');
  await b.close(); process.exit(rosso ? 1 : 0);
})().catch(e => { console.log('  ??  esploso:', e.message); process.exit(2); });
