/* misura una FOTO del telefono: dove cominciano e finiscono i bottoni.
   Serve a decidere una questione di fatto — «i due bottoni della stessa
   fila hanno larghezze diverse?» — senza fidarsi dell'occhio.
   Decodifica il PNG dentro Chromium (canvas), che e' l'unico decodificatore
   presente in casa.

   COME DISTINGUE. Il campo dietro e' VERDE (il canale G stacca dagli altri
   due); il bottone e' ardesia e le sue lettere sono bianche, e ne' l'uno
   ne' le altre sono verdi. Quindi: «non campo» = G non domina. Con questo
   verso le lettere bianche NON spezzano piu' il bottone in tronconi, che
   era il difetto della prima versione di questo diagnostico.

   uso: node strumenti/_diag-foto-righe.js fuori/tel-spogliatoio.png 300,405 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const FOTO = path.resolve(process.argv[2]);
const RIGHE = (process.argv[3] || '').split(',').filter(Boolean).map(Number);
const CAMPIONI = (process.argv[4] || '').split(';').filter(Boolean).map(s => s.split(',').map(Number));

(async () => {
  const b64 = fs.readFileSync(FOTO).toString('base64');
  const br = await chromium.launch();
  const pg = await br.newPage();
  await pg.setContent('<body></body>');
  const out = await pg.evaluate(async ({ b64, RIGHE, CAMPIONI }) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const cv = document.createElement('canvas');
    cv.width = img.naturalWidth; cv.height = img.naturalHeight;
    const cx = cv.getContext('2d', { willReadFrequently: true });
    cx.drawImage(img, 0, 0);
    const D = cx.getImageData(0, 0, cv.width, cv.height).data;
    const px = (x, y) => { const i = (y * cv.width + x) * 4; return [D[i], D[i + 1], D[i + 2]]; };
    /* CAMPO = verde: il canale G domina gli altri due. Tutto il resto
       (ardesia del bottone, bianco delle lettere, legno dell'ombra) e' bottone. */
    const campo = (r, g, b) => (g - Math.max(r, b)) > 10;
    const righe = {};
    for (const y of RIGHE) {
      const run = [];
      let dentro = false, ini = 0;
      for (let x = 0; x < cv.width; x++) {
        const q = !campo(...px(x, y));
        if (q && !dentro) { dentro = true; ini = x; }
        else if (!q && dentro) { dentro = false; if (x - ini > 25) run.push([ini, x - 1, x - ini]); }
      }
      if (dentro && cv.width - ini > 25) run.push([ini, cv.width - 1, cv.width - ini]);
      righe[y] = run;
    }
    /* profilo verticale: quante colonne «non campo» per riga di pixel */
    const prof = [];
    for (let y = 0; y < cv.height; y += 2) {
      let n = 0;
      for (let x = 0; x < cv.width; x += 4) if (!campo(...px(x, y))) n++;
      prof.push([y, n]);
    }
    return { w: cv.width, h: cv.height, righe, prof, campioni: CAMPIONI.map(([x, y]) => [x, y, px(x, y)]) };
  }, { b64, RIGHE, CAMPIONI });
  await br.close();

  console.log(`FOTO ${path.basename(FOTO)}  ${out.w}x${out.h}`);
  for (const [x, y, c] of out.campioni) console.log(`  campione (${x},${y}) = rgb(${c.join(',')})`);
  for (const y of RIGHE) {
    const r = out.righe[y];
    console.log(`  y=${y}: ${r.length} blocchi  ` + r.map(([a, b, w]) => `${a}..${b} (largo ${w})`).join('   '));
    if (r.length > 1) {
      const ws = r.map(x => x[2]);
      console.log(`         larghezze ${ws.join(' / ')}   scarto ${Math.max(...ws) - Math.min(...ws)} px`);
    }
  }
  const soglia = Math.round(out.w / 4 * 0.03);
  const bande = [];
  let dentro = false, ini = 0;
  for (const [y, n] of out.prof) {
    if (n > soglia && !dentro) { dentro = true; ini = y; }
    else if (n <= soglia && dentro) { dentro = false; if (y - ini > 6) bande.push([ini, y]); }
  }
  if (dentro) bande.push([ini, out.h]);
  console.log(`\n  BANDE VERTICALI con contenuto non-campo (soglia ${soglia} colonne su ${Math.round(out.w / 4)}):`);
  let prec = null;
  for (const [a, b] of bande) {
    if (prec !== null && a - prec > 20) console.log(`     ---- VUOTO ${a - prec} px (${((a - prec) / out.h * 100).toFixed(0)}% dell'altezza) ----`);
    console.log(`     ${a}..${b}  (alta ${b - a})`);
    prec = b;
  }
})().catch(e => { console.error('ESPLOSO: ' + e.stack); process.exit(2); });
