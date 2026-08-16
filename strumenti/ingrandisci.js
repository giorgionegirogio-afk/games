/* INGRANDISCI — un PNG ridisegnato N volte piu' grande a pixel netti
   (nessuna interpolazione), per guardare con l'occhio quello che il
   banco ha misurato con i numeri. Serve alle silhouette: 25x45 px sullo
   schermo di chi legge non si giudicano.
   USO: node strumenti/ingrandisci.js dentro.png fuori.png [scala] */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const [, , src, dst, scalaArg] = process.argv;
const K = +(scalaArg || 4);
(async () => {
  const b64 = fs.readFileSync(path.resolve(src)).toString('base64');
  const br = await chromium.launch();
  const pg = await br.newPage();
  const out = await pg.evaluate(async ({ b64, K }) => {
    const im = new Image();
    await new Promise(ok => { im.onload = ok; im.src = 'data:image/png;base64,' + b64; });
    const c = document.createElement('canvas');
    c.width = im.width * K; c.height = im.height * K;
    const g = c.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
    g.imageSmoothingEnabled = false;
    g.drawImage(im, 0, 0, c.width, c.height);
    return c.toDataURL('image/png');
  }, { b64, K });
  await br.close();
  fs.writeFileSync(path.resolve(dst), Buffer.from(out.slice(out.indexOf(',') + 1), 'base64'));
  console.log('scritto ' + dst);
})();
