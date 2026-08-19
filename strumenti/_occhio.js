/* _occhio.js — contagocce: stampa i colori piu' frequenti di un riquadro
   di un PNG, con tinta/saturazione/luminanza e se stanno nella famiglia
   del prato del banco (90-175 gradi). ATTREZZO (prefisso _).
   uso: node strumenti/_occhio.js file.png x y w h [quanti] */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const [, , src, X, Y, W, H, N] = process.argv;
(async () => {
  const b64 = fs.readFileSync(path.resolve(src)).toString('base64');
  const br = await chromium.launch();
  const pg = await br.newPage();
  const r = await pg.evaluate(async (a) => {
    const im = new Image();
    await new Promise(ok => { im.onload = ok; im.src = 'data:image/png;base64,' + a.b64; });
    const c = document.createElement('canvas');
    c.width = im.width; c.height = im.height;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(im, 0, 0);
    const d = g.getImageData(a.x, a.y, a.w, a.h).data;
    const conta = new Map();
    for (let i = 0; i < d.length; i += 4) {
      const k = (d[i] >> 2) + '|' + (d[i + 1] >> 2) + '|' + (d[i + 2] >> 2);
      const v = conta.get(k) || [0, 0, 0, 0];
      v[0]++; v[1] += d[i]; v[2] += d[i + 1]; v[3] += d[i + 2];
      conta.set(k, v);
    }
    const tot = a.w * a.h;
    return [...conta.values()].sort((p, q) => q[0] - p[0]).slice(0, a.n).map(v => ({
      n: v[0], f: v[0] / tot, R: v[1] / v[0], G: v[2] / v[0], B: v[3] / v[0],
    }));
  }, { b64, x: +X, y: +Y, w: +W, h: +H, n: +(N || 12) });
  for (const v of r) {
    const mx = Math.max(v.R, v.G, v.B), mn = Math.min(v.R, v.G, v.B), dl = mx - mn;
    let h = 0;
    if (dl > 0) {
      if (mx === v.R) h = 60 * ((((v.G - v.B) / dl) % 6) + 6) % 360;
      else if (mx === v.G) h = 60 * ((v.B - v.R) / dl + 2);
      else h = 60 * ((v.R - v.G) / dl + 4);
    }
    const sat = mx > 0 ? dl / mx : 0;
    const L = 0.2126 * v.R + 0.7152 * v.G + 0.0722 * v.B;
    const prato = h >= 90 && h <= 175 && sat >= 0.12 && mx / 255 >= 0.18;
    console.log(`${(100 * v.f).toFixed(2).padStart(6)}%  rgb(${v.R.toFixed(0).padStart(3)},${v.G.toFixed(0).padStart(3)},${v.B.toFixed(0).padStart(3)})  tinta ${h.toFixed(0).padStart(3)}  sat ${sat.toFixed(2)}  L ${L.toFixed(1).padStart(5)}  ${prato ? 'PRATO' : '-'}`);
  }
  await br.close();
})();
