/* _aaa-misura2.js — ombre e divise. Sola lettura.
   1) manto in ombra contro manto in luce: densita', tinta, croma
   2) morbidezza del bordo d'ombra: larghezza 10-90% su scansioni orizzontali
   3) divise: dispersione del valore dentro i pixel della maglia
   uso: node _aaa-misura2.js istantanee/istante-*.png */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const files = process.argv.slice(2);
  const br = await chromium.launch();
  const pg = await br.newPage();
  const out = [];
  for (const f of files) {
    const b64 = fs.readFileSync(path.resolve(f)).toString('base64');
    const r = await pg.evaluate(async (b64) => {
      const im = new Image();
      await new Promise(ok => { im.onload = ok; im.src = 'data:image/png;base64,' + b64; });
      const c = document.createElement('canvas');
      c.width = im.width; c.height = im.height;
      const g = c.getContext('2d', { willReadFrequently: true });
      g.drawImage(im, 0, 0);
      const W = c.width, H = c.height, d = g.getImageData(0, 0, W, H).data;
      const hsv = (R, G2, B) => {
        const mx = Math.max(R, G2, B), mn = Math.min(R, G2, B), dl = mx - mn;
        let h = 0;
        if (dl > 0) {
          if (mx === R) h = ((60 * (((G2 - B) / dl) % 6)) + 360) % 360;
          else if (mx === G2) h = 60 * ((B - R) / dl + 2);
          else h = 60 * ((R - G2) / dl + 4);
        }
        return [h, mx === 0 ? 0 : dl / mx, mx / 255];
      };
      const Y = new Float32Array(W * H), Hh = new Float32Array(W * H), Ss = new Float32Array(W * H);
      const grass = new Uint8Array(W * H);
      for (let i = 0, p = 0; i < d.length; i += 4, p++) {
        const R = d[i], G2 = d[i + 1], B = d[i + 2];
        Y[p] = 0.2126 * (R / 255) + 0.7152 * (G2 / 255) + 0.0722 * (B / 255);
        const [h, s, v] = hsv(R, G2, B);
        Hh[p] = h; Ss[p] = s;
        if (h >= 60 && h <= 175 && s >= 0.10 && v >= 0.08) grass[p] = 1;
      }
      const y0 = Math.round(H * 0.16), y1 = Math.round(H * 0.72), x0 = 20, x1 = W - 20;
      // soglia ombra: mediana del manto, poi split sui quartili estremi
      const vals = [];
      for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx += 2) { const p = yy * W + xx; if (grass[p]) vals.push(Y[p]); }
      vals.sort((a, b) => a - b);
      const qq = t => vals[Math.round(t * (vals.length - 1))];
      const loT = qq(0.12), hiT = qq(0.75);
      let nl = 0, nh = 0, hl = 0, hh2 = 0, sl = 0, sh = 0, yl = 0, yh = 0;
      for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx += 2) {
        const p = yy * W + xx; if (!grass[p]) continue;
        if (Y[p] <= loT) { nl++; hl += Hh[p]; sl += Ss[p]; yl += Y[p]; }
        else if (Y[p] >= hiT) { nh++; hh2 += Hh[p]; sh += Ss[p]; yh += Y[p]; }
      }
      // larghezza del bordo d'ombra: su ogni riga, cerca transizioni monotone
      // fra livello scuro (<=loT) e chiaro (>=hiT) e conta i pixel intermedi
      const larghezze = [];
      for (let yy = y0; yy < y1; yy += 3) {
        let xx = x0;
        while (xx < x1 - 60) {
          const p = yy * W + xx;
          if (grass[p] && Y[p] <= loT) {
            let j = xx + 1, ok = true;
            while (j < x1 && grass[j % W === 0 ? j : yy * W + j] && Y[yy * W + j] < hiT) {
              if (Y[yy * W + j] < Y[yy * W + j - 1] - 0.004) { ok = false; break; }
              j++;
              if (j - xx > 120) { ok = false; break; }
            }
            if (ok && j < x1 && grass[yy * W + j] && Y[yy * W + j] >= hiT && j - xx >= 1) larghezze.push(j - xx);
            xx = j + 1;
          } else xx++;
        }
      }
      larghezze.sort((a, b) => a - b);
      // divise: famiglie di tinta blu (190-230) e rosa (320-350), sat alta
      const kit = (lo, hi) => {
        const v = [];
        for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) {
          const p = yy * W + xx; const h = Hh[p];
          if (h >= lo && h <= hi && Ss[p] >= 0.35 && Y[p] > 0.04) v.push(Y[p]);
        }
        v.sort((a, b) => a - b);
        if (v.length < 200) return null;
        const Q = t => v[Math.round(t * (v.length - 1))];
        return { n: v.length, p10: Q(0.10), p50: Q(0.50), p90: Q(0.90), spread: Q(0.90) - Q(0.10) };
      };
      return {
        ombraY: yl / Math.max(1, nl), luceY: yh / Math.max(1, nh),
        ombraH: hl / Math.max(1, nl), luceH: hh2 / Math.max(1, nh),
        ombraS: sl / Math.max(1, nl), luceS: sh / Math.max(1, nh),
        bordoN: larghezze.length,
        bordoMediano: larghezze.length ? larghezze[larghezze.length >> 1] : NaN,
        bordoP90: larghezze.length ? larghezze[Math.round(0.9 * (larghezze.length - 1))] : NaN,
        blu: kit(190, 235), rosa: kit(310, 350)
      };
    }, b64);
    r.file = path.basename(f);
    out.push(r);
    console.log(r.file,
      'ombraY', r.ombraY.toFixed(4), 'luceY', r.luceY.toFixed(4),
      'rapporto', (r.luceY / r.ombraY).toFixed(2),
      '| tinta', r.ombraH.toFixed(1), '->', r.luceH.toFixed(1),
      '| croma', r.ombraS.toFixed(3), '->', r.luceS.toFixed(3),
      '| bordo px mediano', r.bordoMediano, 'p90', r.bordoP90, 'n', r.bordoN);
    if (r.blu) console.log('   maglia blu  n=' + r.blu.n, 'Y p10/p50/p90', r.blu.p10.toFixed(3), r.blu.p50.toFixed(3), r.blu.p90.toFixed(3), 'spread', r.blu.spread.toFixed(3));
    if (r.rosa) console.log('   maglia rosa n=' + r.rosa.n, 'Y p10/p50/p90', r.rosa.p10.toFixed(3), r.rosa.p50.toFixed(3), r.rosa.p90.toFixed(3), 'spread', r.rosa.spread.toFixed(3));
  }
  const med = k => { const a = out.map(k).filter(v => v != null && !isNaN(v)).sort((x, y) => x - y); return a[a.length >> 1]; };
  console.log('--- MEDIANE ---');
  console.log('rapporto luce/ombra sul manto', med(o => o.luceY / o.ombraY).toFixed(3));
  console.log('delta tinta luce-ombra (gradi)', (med(o => o.luceH) - med(o => o.ombraH)).toFixed(2));
  console.log('delta croma luce-ombra', (med(o => o.luceS) - med(o => o.ombraS)).toFixed(4));
  console.log('bordo ombra px di periferica (mediano)', med(o => o.bordoMediano));
  console.log('spread Y maglia blu', med(o => o.blu ? o.blu.spread : NaN));
  console.log('spread Y maglia rosa', med(o => o.rosa ? o.rosa.spread : NaN));
  await br.close();
})();
