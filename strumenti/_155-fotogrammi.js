/* =====================================================================
   _155-fotogrammi.js — DOVE UNA CLIP SPENDE I SUOI FOTOGRAMMI.

   PERCHE' ESISTE. Il criterio C7 della giuria della voce #155 chiede due
   cose che nessuno contava: che non ci siano «due fotogrammi consecutivi
   indistinguibili a occhio» e che non ci sia «uno scatto fra l'uno e
   l'altro». Finora la prova era l'occhio su prova-fasi.png, e l'occhio
   ha detto «otto fotogrammi identici» senza poterlo scrivere in un
   numero. Qui il numero c'e'.

   COME MISURA. Sedici fotogrammi per clip — gli STESSI sedici che
   vistaFasi del provino disegna, u = i/16 — riempiti di nero pieno a
   50 px di figura, allineati sulla stessa origine (i piedi), e per ogni
   coppia consecutiva si conta la DIFFERENZA SIMMETRICA di maschera
   divisa per l'unione: 0 = i due fotogrammi sono lo stesso disegno,
   1 = non si sovrappongono per niente.

     morti     coppie sotto 0,040 — «indistinguibili a occhio»
     scatti    coppie sopra 3 volte la mediana della clip — «un salto»
     mediana   quanto si muove un fotogramma tipico
     minimo    la coppia piu' ferma della clip

   Le due soglie sono dichiarate qui e non altrove. 0,040 viene dal
   confronto con l'occhio sul foglio del 25 settembre: le otto coppie
   che la giuria ha chiamato identiche in fasi-frenata stanno tutte
   sotto 0,030, e la prima coppia che un uomo distingue sta a 0,044.

   NON E' UN CANCELLO: stampa e non boccia. Uscite: 0 misurato, 2 banco
   esploso, 3 prova nulla.

   USO (server acceso su 8777):
     node strumenti/_155-fotogrammi.js
     node strumenti/_155-fotogrammi.js --gioco fuori/155-g1.html
   ===================================================================== */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i+1] && !process.argv[i+1].startsWith('--') ? process.argv[i+1] : d; };
const PORTA = arg('porta', '8777');
const GIOCO = arg('gioco', 'CALCETTO-il-gioco.html');
const RADICE = path.resolve(__dirname, '..');
if (!fs.existsSync(path.join(RADICE, GIOCO))) { console.error('PROVA NULLA: manca ' + GIOCO); process.exit(3); }

/* le sei clip che il criterio C7 nomina, piu' la rovesciata che era gia'
   nel fascicolo */
const CLIP = ['tuffo', 'tiro', 'corsa', 'scivolata', 'contrasto', 'frenata', 'rovesciata'];
const MORTO = 0.040;

(async () => {
  let br;
  try { br = await chromium.launch(); }
  catch (e) { console.error('[155-fotogrammi] BANCO: playwright non parte: ' + e.message); process.exit(2); }
  const pg = await br.newPage();
  try {
    await pg.goto('http://127.0.0.1:' + PORTA + '/' + GIOCO + '?provino&t=' + Date.now());
    await pg.waitForFunction('typeof Rig3D==="object"', { timeout: 45000 });
  } catch (e) {
    console.error('[155-fotogrammi] BANCO: il gioco non si e\' aperto: ' + e.message);
    await br.close(); process.exit(2);
  }

  const out = await pg.evaluate(({ CLIP }) => {
    const NERO = '#000';
    const nero = { maglia:NERO, maglia2:NERO, pantaloncini:NERO, calze:NERO, risvolto:NERO,
      pelle:NERO, capelli:NERO, scarpe:NERO, palla:null, taglio:0, corp:3, varb:0, manc:false,
      _lume:NERO, _ombra:NERO,
      _ombS:{ maglia:NERO, maglia2:NERO, calze:NERO, pantaloncini:NERO, pelle:NERO } };
    const CW = 220, CH = 220, H = 50;
    const cv = document.createElement('canvas'); cv.width=CW; cv.height=CH;
    const g = cv.getContext('2d', { willReadFrequently:true });
    function maschera(clip, u) {
      g.clearRect(0,0,CW,CH);
      const cx=CW*0.5, cy=CH*0.72, sc=H/RIG_H;
      g.save(); g.translate(cx,cy); g.scale(sc,sc); g.translate(-cx,-cy);
      Rig3D.disegna(g, cx, cy, RIG_H, 54*Math.PI/180, 'alto', clip,
                    u/Rig3D.CLIPS[clip].freq, nero, true, sc);
      g.restore();
      const d = g.getImageData(0,0,CW,CH).data;
      const m = new Uint8Array(CW*CH);
      for (let i=0;i<CW*CH;i++) if (d[i*4+3]>128) m[i]=1;
      return m;
    }
    const res = [];
    for (const clip of CLIP) {
      const M = []; for (let i=0;i<16;i++) M.push(maschera(clip, i/16));
      const dd = [];
      for (let i=0;i<15;i++) {
        let inter=0, uni=0;
        for (let k=0;k<CW*CH;k++) { const a=M[i][k], b=M[i+1][k];
          if (a|b) { uni++; if (a&b) inter++; } }
        dd.push(uni ? (uni-inter)/uni : 0);
      }
      const ord = dd.slice().sort((a,b)=>a-b);
      const med = ord[7];
      res.push({ clip, dd, med, min: ord[0], max: ord[14] });
    }
    return res;
  }, { CLIP });

  console.log('[155-fotogrammi] file: ' + GIOCO + '  ·  16 fotogrammi, 50 px, nero, imbardata 54 gradi');
  console.log('  clip          morti(<' + MORTO.toFixed(3) + ')  scatti  mediana  minimo  massimo');
  let mTot = 0, sTot = 0;
  for (const r of out) {
    const morti = r.dd.filter(v => v < MORTO).length;
    const scatti = r.dd.filter(v => v > 3 * r.med).length;
    mTot += morti; sTot += scatti;
    console.log('  ' + r.clip.padEnd(12) + String(morti).padStart(8) + String(scatti).padStart(8)
              + '   ' + r.med.toFixed(3) + '   ' + r.min.toFixed(3) + '   ' + r.max.toFixed(3));
    console.log('      ' + r.dd.map((v,i) => (v<MORTO ? '·' : v>3*r.med ? '!' : ' ') + v.toFixed(3)).join(' '));
  }
  console.log('  TOTALE: fotogrammi morti ' + mTot + ' su ' + (out.length*15)
            + ' coppie  ·  scatti ' + sTot);
  await br.close();
  process.exit(0);
})();
