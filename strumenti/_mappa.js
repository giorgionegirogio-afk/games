/* =====================================================================
   _mappa.js — ATTREZZO DI DIAGNOSI (prefisso _, non e' un cancello).

   Rilegge un PNG gia' scattato e stampa la GRIGLIA 24x12 di istantanea.js
   con lo stesso identico criterio (righe 1030-1049 di quel file):
     '.' cella di erba vuota, '#' cella che qualcosa rompe.
   Per ogni cella vuota stampa anche quale delle due condizioni la tiene
   vuota e di quanto: la frazione di pixel in famiglia prato e la
   deviazione di luminanza. Serve a sapere DOVE mettere le cose, invece
   di indovinare e rimisurare.

   uso: node strumenti/_mappa.js file1.png [file2.png ...]
        node strumenti/_mappa.js --dettaglio file.png
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const PAR = { celleX: 24, celleY: 12, cellaVarMax: 12, cellaErbaMin: 0.97,
              hueMin: 90, hueMax: 175, satMin: 0.12, valMin: 0.18 };

(async () => {
  const args = process.argv.slice(2);
  const dettaglio = args.includes('--dettaglio');
  const file = args.filter(a => !a.startsWith('--'));
  const b = await chromium.launch();
  const pg = await b.newPage();
  for (const f of file) {
    const dati = 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
    const r = await pg.evaluate(async ([src, par]) => {
      const im = new Image();
      await new Promise(ok => { im.onload = ok; im.src = src; });
      const cv = document.createElement('canvas');
      cv.width = im.width; cv.height = im.height;
      const c = cv.getContext('2d', { willReadFrequently: true });
      c.drawImage(im, 0, 0);
      const W = cv.width, H = cv.height, d = c.getImageData(0, 0, W, H).data;
      const righe = [], celle = [];
      let vuote = 0;
      for (let cy = 0; cy < par.celleY; cy++) {
        let riga = '';
        for (let cx = 0; cx < par.celleX; cx++) {
          const x0 = Math.floor(cx * W / par.celleX), x1 = Math.floor((cx + 1) * W / par.celleX);
          const y0 = Math.floor(cy * H / par.celleY), y1 = Math.floor((cy + 1) * H / par.celleY);
          let n = 0, ne = 0, s = 0, s2 = 0;
          for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) {
            const i = (y * W + x) * 4, R = d[i], G = d[i + 1], B = d[i + 2];
            const L = 0.2126 * R + 0.7152 * G + 0.0722 * B;
            n++; s += L; s2 += L * L;
            const mx = Math.max(R, G, B), mn = Math.min(R, G, B), dl = mx - mn;
            let hh = 0;
            if (dl > 0) {
              if (mx === R) hh = 60 * (((G - B) / dl) % 6);
              else if (mx === G) hh = 60 * ((B - R) / dl + 2);
              else hh = 60 * ((R - G) / dl + 4);
              if (hh < 0) hh += 360;
            }
            const sat = mx > 0 ? dl / mx : 0;
            if (hh >= par.hueMin && hh <= par.hueMax && sat >= par.satMin && mx / 255 >= par.valMin) ne++;
          }
          const m = s / n, dev = Math.sqrt(Math.max(0, s2 / n - m * m));
          const fr = ne / n;
          const v = fr >= par.cellaErbaMin && dev <= par.cellaVarMax;
          if (v) vuote++;
          riga += v ? '.' : '#';
          celle.push({ cx, cy, fr: +fr.toFixed(3), dev: +dev.toFixed(1), L: +m.toFixed(0), v });
        }
        righe.push(riga);
      }
      return { W, H, righe, vuote, celle, tot: par.celleX * par.celleY };
    }, [dati, PAR]);
    console.log('\n=== ' + path.basename(f) + '  (' + r.W + 'x' + r.H + ')');
    console.log('erba vuota ' + (100 * r.vuote / r.tot).toFixed(1) + '%  (' + r.vuote + '/' + r.tot + ')');
    console.log('    ' + '0123456789012345678901234'.slice(0, PAR.celleX));
    r.righe.forEach((ri, i) => console.log(String(i).padStart(3) + ' ' + ri));
    if (dettaglio) {
      /* le celle vuote piu' FRAGILI: quelle a cui manca poco per cadere */
      const vuote = r.celle.filter(c => c.v).sort((a, b2) => (b2.dev - a.dev));
      console.log('  celle vuote, le 12 con piu\' deviazione (vicine a rompersi da sole):');
      for (const c of vuote.slice(0, 12)) console.log(`    (${c.cx},${c.cy}) erba ${c.fr} dev ${c.dev} L ${c.L}`);
      const q = r.celle.filter(c => c.v);
      const medL = q.reduce((a, c) => a + c.L, 0) / Math.max(1, q.length);
      console.log(`  luminanza media delle celle vuote: ${medL.toFixed(1)}`);
    }
  }
  await b.close();
})();
