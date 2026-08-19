/* _manto.js — IL CONTAGOCCE DEL GIUDICE, sui soli pixel di manto.
   Mediana di saturazione, valore e tinta (HSV) sui pixel che stanno nella
   famiglia del prato (tinta 90-175, sat>=0.12, v>=0.18) — la stessa
   famiglia che usa istantanea.js. Interfaccia e corpi restano fuori:
   le divise, il gesso, l'ambra, la pelle e il legno non sono in famiglia.
   uso: node _manto.js a.png b.png ... */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const files = process.argv.slice(2);
  const br = await chromium.launch();
  const pg = await br.newPage();
  for (const f of files) {
    const b64 = fs.readFileSync(path.resolve(f)).toString('base64');
    const r = await pg.evaluate(async (b64) => {
      const im = new Image();
      await new Promise(ok => { im.onload = ok; im.src = 'data:image/png;base64,' + b64; });
      const c = document.createElement('canvas');
      c.width = im.width; c.height = im.height;
      const g = c.getContext('2d', { willReadFrequently: true });
      g.drawImage(im, 0, 0);
      const d = g.getImageData(0, 0, c.width, c.height).data;
      const S = [], V = [], H = [];
      for (let i = 0; i < d.length; i += 4) {
        const R = d[i], G = d[i + 1], B = d[i + 2];
        const mx = Math.max(R, G, B), mn = Math.min(R, G, B), dl = mx - mn;
        if (mx === 0) continue;
        const sat = dl / mx, val = mx / 255;
        let h = 0;
        if (dl > 0) {
          if (mx === R) h = ((60 * (((G - B) / dl) % 6)) + 360) % 360;
          else if (mx === G) h = 60 * ((B - R) / dl + 2);
          else h = 60 * ((R - G) / dl + 4);
        }
        if (h < 90 || h > 175 || sat < 0.12 || val < 0.18) continue;
        S.push(sat); V.push(val); H.push(h);
      }
      const med = a => { a.sort((x, y) => x - y); return a.length ? a[a.length >> 1] : NaN; };
      return { n: S.length, tot: c.width * c.height, w: c.width, h: c.height,
               s: med(S), v: med(V), t: med(H) };
    }, b64);
    console.log(`${path.basename(f).padEnd(30)} sat ${r.s.toFixed(3)}  val ${r.v.toFixed(3)}  tinta ${r.t.toFixed(1)}   (manto ${(100 * r.n / r.tot).toFixed(1)}% di ${r.w}x${r.h})`);
  }
  await br.close();
})();
