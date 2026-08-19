/* _crop.js — ritaglia un riquadro da un PNG e lo ridisegna ingrandito.
   ATTREZZO (prefisso _), serve solo a GUARDARE quello che il banco misura.
   uso: node strumenti/_crop.js dentro.png fuori.png x y w h [scala] */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const [, , src, dst, X, Y, W, H, K] = process.argv;
(async () => {
  const b64 = fs.readFileSync(path.resolve(src)).toString('base64');
  const br = await chromium.launch();
  const pg = await br.newPage();
  const out = await pg.evaluate(async (a) => {
    const im = new Image();
    await new Promise(ok => { im.onload = ok; im.src = 'data:image/png;base64,' + a.b64; });
    const c = document.createElement('canvas');
    c.width = a.w * a.k; c.height = a.h * a.k;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.drawImage(im, a.x, a.y, a.w, a.h, 0, 0, c.width, c.height);
    return c.toDataURL('image/png');
  }, { b64, x: +X, y: +Y, w: +W, h: +H, k: +(K || 2) });
  fs.writeFileSync(path.resolve(dst), Buffer.from(out.split(',')[1], 'base64'));
  await br.close();
  console.log('scritto ' + dst);
})();
