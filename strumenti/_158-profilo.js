/* _158-profilo.js — DOVE STA LA MAGLIA e QUANTO E' CHIARA, sprite contro
   rig (voce #158). Nel provino, stessa clip e imbardata, disegna rig e
   sprite a hCss 420 e stampa per fasce del 5% dell'altezza (dai piedi in
   su): quanti pixel di figura, luminanza media, e il contrasto WCAG
   contro il verde del provino. Serve a decidere la finestra di collaudo.js
   e a capire se la maglia fotografica e' piu' scura della tinta piatta.
   USO: node strumenti/_158-profilo.js [--gioco fuori/sprite/CALCETTO-sprite.html] [--clip fermo] [--yaw 180] */
const { chromium } = require('playwright');
const argv = process.argv.slice(2);
const pren = (n) => { const i = argv.indexOf(n); return i >= 0 && argv[i+1] ? argv[i+1] : null; };
const GIOCO = (pren('--gioco') || 'fuori/sprite/CALCETTO-sprite.html').split('\\').join('/');
const CLIP = pren('--clip') || 'fermo', YAW = +(pren('--yaw') || 180);
const Y = (r, g, b) => { const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1400, height: 900 } });
  await pg.goto('http://127.0.0.1:8777/strumenti/provino.html?gioco=' + encodeURIComponent(GIOCO), { waitUntil: 'load' });
  await pg.waitForFunction(() => window.__provino && window.__provino.pronto, null, { timeout: 30000 }).catch(() => null);
  await pg.waitForTimeout(1500);
  const prendi = async (sprite) => pg.evaluate(([clip, yaw, sprite]) => {
    window.__provino.imposta({ clip, yawDeg: yaw, h: 420, sprite, via: false, u: 0.20, lod: 'off', ombra: false, kit: 0 });
    window.__provino.disegna();
    const c = document.getElementById('tela'); const g = c.getContext('2d');
    const d = g.getImageData(0, 0, c.width, c.height).data;
    const r0 = d[0], g0 = d[1], b0 = d[2];
    const righe = [];
    let y0 = 1e9, y1 = -1;
    for (let y = 0; y < c.height; y++) { let n = 0, sr = 0, sg = 0, sb = 0; for (let x = 0; x < c.width; x++) { const i = (y * c.width + x) * 4; if (Math.abs(d[i] - r0) + Math.abs(d[i+1] - g0) + Math.abs(d[i+2] - b0) > 60) { n++; sr += d[i]; sg += d[i+1]; sb += d[i+2]; } } righe.push(n ? [n, sr / n, sg / n, sb / n] : null); if (n) { if (y < y0) y0 = y; if (y > y1) y1 = y; } }
    return { righe, y0, y1, sfondo: [r0, g0, b0] };
  }, [CLIP, YAW, sprite]);
  const R = await prendi(0), S = await prendi(1);
  const yv = Y(...S.sfondo);
  console.log(`  ${CLIP} yaw ${YAW}  —  fasce dai PIEDI in su (quota 0 = piedi, 1 = testa)   sfondo Y=${yv.toFixed(3)}`);
  console.log('  fascia      rig: px  lum  contr     sprite: px  lum  contr');
  const fascia = (P, a, bq) => { const h = P.y1 - P.y0 + 1; let n = 0, r = 0, g = 0, bb = 0; for (let y = P.y0; y <= P.y1; y++) { const q = (P.y1 - y) / h; if (q >= a && q < bq && P.righe[y]) { const [k, rr, gg, b2] = P.righe[y]; n += k; r += rr * k; g += gg * k; bb += b2 * k; } } if (!n) return '   -    -     - '; r /= n; g /= n; bb /= n; const yy = Y(r, g, bb); const c = (Math.max(yy, yv) + 0.05) / (Math.min(yy, yv) + 0.05); return String(n).padStart(6) + String(Math.round((r + g + bb) / 3)).padStart(5) + c.toFixed(2).padStart(7); };
  for (let q = 0; q < 1; q += 0.05) console.log('  ' + q.toFixed(2) + '-' + (q + 0.05).toFixed(2) + '  ' + fascia(R, q, q + 0.05) + '     ' + fascia(S, q, q + 0.05));
  await b.close();
})().catch(e => { console.log('  ??  esploso:', e.message); process.exit(2); });
