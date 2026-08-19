/* _aaa-misura.js — misure d'immagine sugli scatti veri, per il rapporto
   "cosa fa leggere AAA". Sola lettura: apre i PNG, non tocca il gioco.
   uso: node _aaa-misura.js istantanee/istante-01.png ...  */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const lum = (R, G, B) => 0.2126 * (R / 255) + 0.7152 * (G / 255) + 0.0722 * (B / 255);

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
      const W = c.width, H = c.height;
      const d = g.getImageData(0, 0, W, H).data;
      const Y = new Float32Array(W * H);
      const isGrass = new Uint8Array(W * H);
      const colori = new Set();
      let hiCount = 0, tot = 0;
      for (let i = 0, p = 0; i < d.length; i += 4, p++) {
        const R = d[i], G2 = d[i + 1], B = d[i + 2];
        const y = 0.2126 * (R / 255) + 0.7152 * (G2 / 255) + 0.0722 * (B / 255);
        Y[p] = y; tot++;
        if (y > 0.55) hiCount++;
        if (colori.size < 300000) colori.add((R << 16) | (G2 << 8) | B);
        const mx = Math.max(R, G2, B), mn = Math.min(R, G2, B), dl = mx - mn;
        if (mx === 0) continue;
        const sat = dl / mx, val = mx / 255;
        let h = 0;
        if (dl > 0) {
          if (mx === R) h = ((60 * (((G2 - B) / dl) % 6)) + 360) % 360;
          else if (mx === G2) h = 60 * ((B - R) / dl + 2);
          else h = 60 * ((R - G2) / dl + 4);
        }
        if (h >= 60 && h <= 175 && sat >= 0.12 && val >= 0.10) isGrass[p] = 1;
      }
      // ---- profilo di riga e di colonna sui SOLI pixel di manto (fascia centrale)
      const y0 = Math.round(H * 0.18), y1 = Math.round(H * 0.72);
      const x0 = Math.round(W * 0.02), x1 = Math.round(W * 0.98);
      const rowMean = [], colMean = [];
      for (let yy = y0; yy < y1; yy++) {
        let s = 0, n = 0;
        for (let xx = x0; xx < x1; xx++) { const p = yy * W + xx; if (isGrass[p]) { s += Y[p]; n++; } }
        rowMean.push(n > 40 ? s / n : NaN);
      }
      for (let xx = x0; xx < x1; xx++) {
        let s = 0, n = 0;
        for (let yy = y0; yy < y1; yy++) { const p = yy * W + xx; if (isGrass[p]) { s += Y[p]; n++; } }
        colMean.push(n > 40 ? s / n : NaN);
      }
      // ampiezza periodica: per ogni periodo candidato, ampiezza della prima armonica
      const armonica = (arr, T) => {
        let re = 0, ims = 0, n = 0, m = 0, cnt = 0;
        for (let i = 0; i < arr.length; i++) if (!isNaN(arr[i])) { m += arr[i]; cnt++; }
        if (cnt < 100) return NaN;
        m /= cnt;
        for (let i = 0; i < arr.length; i++) {
          if (isNaN(arr[i])) continue;
          const a = 2 * Math.PI * i / T;
          re += (arr[i] - m) * Math.cos(a); ims += (arr[i] - m) * Math.sin(a); n++;
        }
        return 2 * Math.hypot(re, ims) / n / m; // ampiezza relativa alla media
      };
      const scanPeriodi = (arr) => {
        let best = { T: 0, A: 0 };
        for (let T = 24; T <= 260; T += 1) {
          const A = armonica(arr, T);
          if (!isNaN(A) && A > best.A) best = { T, A };
        }
        return best;
      };
      // ---- contrasto locale su manto: |differenza| fra pixel adiacenti
      let dsum = 0, dn = 0, dsum4 = 0, dn4 = 0;
      for (let yy = y0; yy < y1; yy++) {
        for (let xx = x0; xx < x1 - 4; xx++) {
          const p = yy * W + xx;
          if (isGrass[p] && isGrass[p + 1]) { dsum += Math.abs(Y[p] - Y[p + 1]); dn++; }
          if (isGrass[p] && isGrass[p + 4]) { dsum4 += Math.abs(Y[p] - Y[p + 4]); dn4++; }
        }
      }
      // ---- percentili luminanza manto
      const gv = [];
      for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx += 3) { const p = yy * W + xx; if (isGrass[p]) gv.push(Y[p]); }
      gv.sort((a, b) => a - b);
      const q = t => gv.length ? gv[Math.min(gv.length - 1, Math.round(t * (gv.length - 1)))] : NaN;
      // ---- gradiente alto/basso del manto (prospettiva aerea)
      let sT = 0, nT = 0, sB = 0, nB = 0;
      const ym = (y0 + y1) >> 1;
      for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx += 3) {
        const p = yy * W + xx; if (!isGrass[p]) continue;
        if (yy < ym) { sT += Y[p]; nT++; } else { sB += Y[p]; nB++; }
      }
      // ---- quota di quadro: manto / non manto
      let grassAll = 0;
      for (let p = 0; p < W * H; p++) if (isGrass[p]) grassAll++;
      return {
        W, H,
        colori: colori.size,
        altiluce: hiCount / tot,
        manto: grassAll / (W * H),
        righe: scanPeriodi(rowMean),
        colonne: scanPeriodi(colMean),
        d1: dsum / Math.max(1, dn),
        d4: dsum4 / Math.max(1, dn4),
        p05: q(0.05), p50: q(0.50), p95: q(0.95),
        topY: sT / Math.max(1, nT), botY: sB / Math.max(1, nB)
      };
    }, b64);
    r.file = path.basename(f);
    out.push(r);
    console.log(JSON.stringify(r));
  }
  // riepilogo
  const med = k => { const a = out.map(o => (typeof k === 'function' ? k(o) : o[k])).filter(v => !isNaN(v)).sort((x, y) => x - y); return a[a.length >> 1]; };
  console.log('--- MEDIANE su ' + out.length + ' scatti ---');
  console.log('colori distinti      ', med('colori'));
  console.log('quota alte luci >0.55', med('altiluce').toFixed(5));
  console.log('quota manto in quadro', med('manto').toFixed(3));
  console.log('manto Y p05/p50/p95  ', med('p05').toFixed(4), med('p50').toFixed(4), med('p95').toFixed(4));
  console.log('gradiente alto/basso ', (med('topY') / med('botY')).toFixed(3));
  console.log('contrasto adiacente  ', med('d1').toFixed(5), ' a 4px ', med('d4').toFixed(5));
  console.log('periodicita righe    T=', med(o => o.righe.T), ' A=', med(o => o.righe.A).toFixed(4));
  console.log('periodicita colonne  T=', med(o => o.colonne.T), ' A=', med(o => o.colonne.A).toFixed(4));
  await br.close();
})();
