/* ritaglio + stiramento del contrasto: serve solo a GUARDARE da vicino il
   punto che la misura accusa. Con --buio dipinge di rosso i pixel piu'
   scuri della mediana locale, che e' cio' che istantanea.js chiama ombra. */
const fs = require('fs');
const { chromium } = require('playwright');
const [src, x, y, w, h, out, scala, modo] = process.argv.slice(2);
(async () => {
  const b64 = fs.readFileSync(src).toString('base64');
  const br = await chromium.launch();
  const pg = await br.newPage();
  const d = await pg.evaluate(async ([b64, x, y, w, h, k, modo]) => {
    const im = new Image();
    im.src = 'data:image/png;base64,' + b64;
    await im.decode();
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(im, x, y, w, h, 0, 0, w, h);
    const id = g.getImageData(0, 0, w, h), p = id.data;
    if (modo) {
      /* la luminanza mediana della finestra, poi ogni pixel in falso colore
         attorno a lei: rosso = piu' scuro del 12%, che e' la scala su cui
         un'ombra portata si stacca dal manto */
      const L = new Float32Array(w * h); const ord = [];
      for (let i = 0, j = 0; i < w * h; i++, j += 4) {
        L[i] = 0.2126 * p[j] + 0.7152 * p[j + 1] + 0.0722 * p[j + 2]; ord.push(L[i]);
      }
      ord.sort((a, b) => a - b);
      const med = ord[ord.length >> 1];
      for (let i = 0, j = 0; i < w * h; i++, j += 4) {
        const r = L[i] / med;
        let v;
        if (r < 0.55) v = [180, 0, 200];
        else if (r < 0.72) v = [255, 0, 0];
        else if (r < 0.88) v = [255, 170, 0];
        else if (r < 1.06) v = [30, 90, 40];
        else v = [230, 255, 230];
        p[j] = v[0]; p[j + 1] = v[1]; p[j + 2] = v[2];
      }
    }
    g.putImageData(id, 0, 0);
    const c2 = document.createElement('canvas');
    c2.width = w * k; c2.height = h * k;
    const g2 = c2.getContext('2d');
    g2.imageSmoothingEnabled = false;
    g2.drawImage(c, 0, 0, w * k, h * k);
    return { u: c2.toDataURL('image/png'), W: im.width, H: im.height };
  }, [b64, +x, +y, +w, +h, +(scala || 1), modo || '']);
  console.log('sorgente', d.W + 'x' + d.H);
  fs.writeFileSync(out, Buffer.from(d.u.split(',')[1], 'base64'));
  await br.close();
})();
