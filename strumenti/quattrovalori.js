/* =====================================================================
   QUATTRO VALORI — la verifica del Tema 3, misurata invece che guardata.

   La giuria scrive: «lo screenshot d'azione convertito in scala di grigi
   deve lasciare quattro valori distinguibili (squadra A, squadra B,
   prato, interfaccia)». Questo strumento lo fa sul serio: apre il gioco,
   fa girare una partita, ridisegna il fotogramma e LEGGE I PIXEL,
   classificandoli nelle quattro famiglie con le stesse finestre di
   campionamento che usa collaudo.js per il contrasto maglia/erba (le
   uniche gia' verificate sui pixel, non dedotte sulla carta).

   Che cosa stampa: per ognuna delle quattro famiglie il VALORE DI GRIGIO
   mediano (0-255, luminanza relativa convertita in grigio percettivo) e
   la distanza minima fra due famiglie qualsiasi. La soglia dichiarata e'
   25 livelli su 255: sotto quella distanza due campiture, viste in
   bianco e nero da un metro, sono la stessa cosa.

   uso: node strumenti/quattrovalori.js
   ===================================================================== */
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  /* --file <percorso> misura una copia diversa del gioco: serve a dare
     il PRIMA accanto al DOPO senza spostare il file di lavoro */
  const iF = process.argv.indexOf('--file');
  const quale = iF > 0 && process.argv[iF + 1] ? process.argv[iF + 1] : 'CALCETTO-il-gioco.html';
  const file = 'file://' + path.resolve(process.cwd(), quale).split('\\').join('/');
  const br = await chromium.launch();
  const ctxb = await br.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2 });
  const pag = await ctxb.newPage();
  /* IL SEME FISSO, la stessa lezione di collaudo.js: senza, due
     esecuzioni pescano fotogrammi diversi e i valori ballano di
     qualche livello — una misura che non si ripete non e' una misura. */
  await pag.addInitScript(seme => {
    let s = seme >>> 0 || 1;
    const prossimo = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => prossimo() / 4294967296;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = prossimo(); return a; };
    }
  }, 20260728);
  const errori = [];
  pag.on('pageerror', e => errori.push(String(e)));
  await pag.goto(file);
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });

  const mis = await pag.evaluate(async () => {
    const t = window.__test;
    const cv = document.getElementById('gioco');
    const c2 = cv.getContext('2d', { willReadFrequently: true });
    const DPRc = cv.width / window.innerWidth;
    t.dismissSplash && t.dismissSplash();
    t.posaHUD(true);                     // i comandi si disegnano: sono interfaccia
    t.startMatch(1, 1);
    t.setCpuVsCpu(true);

    const lumin = (r, g, b) => {
      const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    /* dalla luminanza relativa al GRIGIO che si vede: la conversione
       inversa della curva sRGB, cioe' il pixel che una foto in bianco e
       nero stamperebbe al posto di quel colore */
    const grigio = L => Math.round(255 * (L <= 0.0031308 ? L * 12.92 : 1.055 * Math.pow(L, 1 / 2.4) - 0.055));
    const mediana = a => { const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1]; };

    const FW = 1150, FH = 560;
    const fam = { magliaA: [], magliaB: [], prato: [], ui: [] };
    let fotogrammi = 0;
    const OMB = (t.ombraCapsula && t.ombraCapsula()) ||
                { ux: 0.9406, uy: 0.3402, l0: 0, l1: 140, semiCorto: 7.6, piedeX: 4.2, piedeY: 7.8 };
    const dentroOmbra = (qx, qy, wx, wy) => {
      const ax = qx + OMB.piedeX, ay = qy + OMB.piedeY;
      const rx = wx - ax, ry = wy - ay;
      let t2 = rx * OMB.ux + ry * OMB.uy;
      if (t2 < OMB.l0) t2 = OMB.l0;
      if (t2 > OMB.l1) t2 = OMB.l1;
      const px = ax + OMB.ux * t2, py = ay + OMB.uy * t2;
      return Math.hypot(wx - px, wy - py) < OMB.semiCorto * 1.6 + 4;
    };

    for (let k = 0; k < 6; k++) {
      t.simulate(k === 0 ? 3.0 : 0.6);
      for (let i = 0; i < 60 && !(t.state === 'play' || t.state === 'golden'); i++) t.simulate(0.1);
      if (t.state !== 'play' && t.state !== 'golden') continue;
      t.disegna();
      fotogrammi++;
      const img = c2.getImageData(0, 0, cv.width, cv.height).data;
      const W = cv.width, H = cv.height;
      const S2 = t.view.S2, Ax = t.view.Ax, Ay = t.view.Ay;
      const B = t.bande, VWc = W / DPRc, VHc = H / DPRc;
      const pixel = (sx, sy) => {
        const x = Math.round(sx * DPRc), y = Math.round(sy * DPRc);
        if (x < 0 || y < 0 || x >= W || y >= H) return null;
        const o = (y * W + x) * 4;
        return lumin(img[o], img[o + 1], img[o + 2]);
      };
      const inQuadro = (sx, sy) => sx > 2 && sx < VWc - 2 && sy > B.bar + 2 && sy < VHc - B.foot - 2;

      /* --- maglie e prato: le finestre gia' tarate di collaudo.js --- */
      for (const p of t.players) {
        if (p.role === 'gk' || p.out > 0) continue;
        if (p.slide >= 0 || p.recover > 0 || p.dive > 0 || p.celeb > 0) continue;
        const dove = p.team === 0 ? fam.magliaA : fam.magliaB;
        for (const av of [-12.5, -11.5, -10.5]) {
          for (const la of [-1.5, -1.0, -0.5, 0, 0.5, 1.0, 1.5]) {
            const sx = (p.x + la) * S2 + Ax, sy = (p.y + av) * S2 + Ay;
            if (!inQuadro(sx, sy)) continue;
            const c = pixel(sx, sy); if (c != null) dove.push(c);
          }
        }
        for (const r of [30, 34, 38, 42]) {
          for (let ang = 0; ang < 360; ang += 15) {
            const rad = ang * Math.PI / 180, cx = Math.cos(rad), cy = Math.sin(rad);
            if (cx * OMB.ux + cy * OMB.uy > 0) continue;
            const wx = p.x + cx * r, wy = p.y + cy * r;
            if (wx < 8 || wx > FW - 8 || wy < 8 || wy > FH - 8) continue;
            let libero = true;
            for (const q of t.players) {
              if (q.out > 0) continue;
              if (q !== p && Math.hypot(q.x - wx, q.y - wy) < 30) { libero = false; break; }
              if (Math.abs(wx - q.x) < 20 && Math.abs(wy - (q.y + 2)) < 28) { libero = false; break; }
              if (dentroOmbra(q.x, q.y, wx, wy)) { libero = false; break; }
            }
            if (!libero) continue;
            if (Math.hypot(t.ball.x - wx, t.ball.y - wy) < 24) continue;
            const sx = wx * S2 + Ax, sy = wy * S2 + Ay;
            if (!inQuadro(sx, sy)) continue;
            const c = pixel(sx, sy); if (c != null) fam.prato.push(c);
          }
        }
      }

      /* --- interfaccia: il corpo dei due comandi e il tabellone ---
         nel disco si campiona la CORONA fra 0,45 e 0,80 del raggio, che
         sta dentro la pastiglia e fuori dall'etichetta di gesso; nel
         tabellone due bande orizzontali lontane da cifre e nomi */
      const btn = [{ x: VWc - 66, y: VHc - 140, r: 40 }, { x: VWc - 70, y: VHc - 232, r: 30 }];
      for (const b of btn) {
        for (let rr = 0.45; rr <= 0.80; rr += 0.07) {
          for (let a = 0; a < 360; a += 10) {
            const rad = a * Math.PI / 180;
            const sx = b.x + Math.cos(rad) * b.r * rr, sy = b.y + Math.sin(rad) * b.r * rr;
            const c = pixel(sx, sy); if (c != null) fam.ui.push(c);
          }
        }
      }
      for (const fy of [0.30, 0.52]) {
        const yy = B.bar * fy;
        for (let sx = VWc * 0.36; sx < VWc * 0.44; sx += 1.5) {
          const c = pixel(sx, yy); if (c != null) fam.ui.push(c);
        }
      }
    }

    const out = {};
    for (const k in fam) out[k] = { n: fam[k].length, grigio: fam[k].length ? grigio(mediana(fam[k])) : null };
    return { fotogrammi, out };
  });

  const nomi = { magliaA: 'squadra A (maglia)', magliaB: 'squadra B (maglia)', prato: 'prato', ui: 'interfaccia' };
  console.log('=== QUATTRO VALORI IN SCALA DI GRIGI (0-255) ===');
  const vals = [];
  for (const k of ['ui', 'prato', 'magliaB', 'magliaA']) {
    const v = mis.out[k];
    console.log('  ' + nomi[k].padEnd(22) + String(v.grigio).padStart(4) + '   (' + v.n + ' campioni)');
    if (v.grigio != null) vals.push({ k, g: v.grigio });
  }
  vals.sort((a, b) => a.g - b.g);
  let peggio = 1e9, coppia = '';
  for (let i = 1; i < vals.length; i++) {
    const d = vals[i].g - vals[i - 1].g;
    if (d < peggio) { peggio = d; coppia = nomi[vals[i - 1].k] + ' / ' + nomi[vals[i].k]; }
  }
  const SOGLIA = 25;
  console.log('  distanza minima: ' + peggio + ' livelli (' + coppia + '), soglia ' + SOGLIA);
  console.log('  fotogrammi: ' + mis.fotogrammi + ' · errori in console: ' + errori.length);
  console.log(peggio >= SOGLIA && vals.length === 4 && !errori.length
    ? 'ESITO: quattro valori distinguibili — PASSA'
    : 'ESITO: due famiglie si confondono — FALLISCE');
  await br.close();
  process.exit(peggio >= SOGLIA && vals.length === 4 && !errori.length ? 0 : 1);
})();
