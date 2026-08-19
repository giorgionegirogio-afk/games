/* _perche.js — perche' un pixel NON e' erba per istantanea.js.
   Conta i pixel di un riquadro per motivo di scarto.
   uso: node _perche.js file.png [x y w h] */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
(async () => {
  const [, , src, X, Y, W2, H2] = process.argv;
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
    const x = a.x | 0, y = a.y | 0, w = a.w || c.width, h = a.h || c.height;
    const d = g.getImageData(x, y, w, h).data;
    const m = { erba: 0, hueBassa: 0, hueAlta: 0, satBassa: 0, valBasso: 0, altro: 0 };
    for (let i = 0; i < d.length; i += 4) {
      const R = d[i], G = d[i + 1], B = d[i + 2];
      const mx = Math.max(R, G, B), mn = Math.min(R, G, B), dl = mx - mn;
      let hh = 0;
      if (dl > 0) {
        if (mx === R) hh = ((60 * (((G - B) / dl) % 6)) + 360) % 360;
        else if (mx === G) hh = 60 * ((B - R) / dl + 2);
        else hh = 60 * ((R - G) / dl + 4);
      }
      const sat = mx > 0 ? dl / mx : 0, val = mx / 255;
      if (hh >= 90 && hh <= 175 && sat >= 0.12 && val >= 0.18) { m.erba++; continue; }
      if (val < 0.18) m.valBasso++;
      else if (sat < 0.12) m.satBassa++;
      else if (hh < 90) m.hueBassa++;
      else if (hh > 175) m.hueAlta++;
      else m.altro++;
    }
    return { m, tot: w * h, w, h };
  }, { b64, x: +X || 0, y: +Y || 0, w: +W2 || 0, h: +H2 || 0 });
  const t = r.tot;
  const p = k => (100 * r.m[k] / t).toFixed(1).padStart(5) + '%';
  console.log(`${path.basename(src)}  ${r.w}x${r.h}  erba ${p('erba')}  |  val<0.18 ${p('valBasso')}  sat<0.12 ${p('satBassa')}  tinta<90 ${p('hueBassa')}  tinta>175 ${p('hueAlta')}`);
  await br.close();
})();
