/* QUANTO SI STACCANO LE STRISCE DI RASATURA dal prato che le circonda.
   istantanea.js chiama "ombra" un pixel d'erba fra il 25% e l'85% del
   terzo quartile locale: se una striscia scura ci finisce sotto, la marcia
   la segue per tutta la sua lunghezza e la scambia per un'ombra lunga.
   Qui si misura il profilo orizzontale della luminanza su una banda di
   prato, e il rapporto fra minimo e terzo quartile locale. */
const fs = require('fs');
const { chromium } = require('playwright');
const [src, y0, y1] = process.argv.slice(2);
(async () => {
  const b64 = fs.readFileSync(src).toString('base64');
  const br = await chromium.launch();
  const pg = await br.newPage();
  const d = await pg.evaluate(async ([b64, y0, y1]) => {
    const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode();
    const c = document.createElement('canvas');
    c.width = im.width; c.height = im.height;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(im, 0, 0);
    const p = g.getImageData(0, 0, im.width, im.height).data;
    const col = [];
    for (let x = 0; x < im.width; x++) {
      const v = [];
      for (let y = y0; y < y1; y++) {
        const j = (y * im.width + x) * 4;
        const r = p[j], gg = p[j + 1], b = p[j + 2];
        const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b);
        if (mx === 0) continue;
        let hh = 0, dl = mx - mn;
        if (dl > 0) {
          if (mx === r) hh = 60 * (((gg - b) / dl) % 6);
          else if (mx === gg) hh = 60 * ((b - r) / dl + 2);
          else hh = 60 * ((r - gg) / dl + 4);
          if (hh < 0) hh += 360;
        }
        if (hh < 70 || hh > 190 || dl / mx < 0.12) continue;   // solo famiglia prato
        v.push(0.2126 * r + 0.7152 * gg + 0.0722 * b);
      }
      v.sort((a, b) => a - b);
      col.push(v.length > 8 ? v[v.length >> 1] : null);
    }
    return { col, W: im.width };
  }, [b64, +y0, +y1]);
  await br.close();
  const c = d.col;
  /* il terzo quartile in una finestra larga come tre celle della griglia
     di istantanea.js (24 colonne su 1830 px => 3 celle = 229 px) */
  const WIN = 229;
  let peggio = 1, dove = 0;
  const righe = [];
  for (let x = 0; x < d.W; x += 20) {
    if (c[x] == null) continue;
    const v = [];
    for (let k = x - WIN; k <= x + WIN; k++) if (c[k] != null) v.push(c[k]);
    if (v.length < 40) continue;
    v.sort((a, b) => a - b);
    const q3 = v[Math.floor(v.length * 0.75)];
    const r = c[x] / q3;
    righe.push(`  x=${String(x).padStart(4)}  L=${c[x].toFixed(1).padStart(6)}  q3loc=${q3.toFixed(1).padStart(6)}  L/q3=${r.toFixed(3)}${r <= 0.85 ? '   <= 0,85: LA MISURA LA CHIAMA OMBRA' : ''}`);
    if (r < peggio) { peggio = r; dove = x; }
  }
  console.log(righe.join('\n'));
  console.log(`\n  minimo rapporto ${peggio.toFixed(3)} a x=${dove}  (soglia d'ombra 0,85)`);
})();
