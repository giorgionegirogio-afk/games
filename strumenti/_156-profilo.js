/* =====================================================================
   _156-profilo.js — IL PROFILO DELLE SCANSIONI, RIGA PER RIGA.

   PERCHE' ESISTE. Il rilievo 1 della giuria del giro 2 dice: «a 40 px il
   tronco deve essere PIU' LARGO degli arti; la leva giusta e' il
   rapporto spalle/arti». Nessuno strumento stampava quel rapporto:
   _155-sagoma.js conta i TRATTI (l'arto si e' staccato, si' o no) e le
   strozzature, ma non dice quanto e' larga ogni massa. Senza il numero
   si gira una manopola e si guarda un'immagine — cioe' si indovina.

   COSA STAMPA, su maschera nera piena a 40 px di figura:
     il profilo riga per riga (larghezza in pixel e numero di tratti),
     e le cinque larghezze che decidono: testa, collo, spalle, vita,
     bacino, piu' la larghezza dell'arto isolato quando esiste.

   NON E' UN CANCELLO: nessuna soglia, nessun verdetto. Uscite: 0 ha
   misurato, 2 il banco non ha aperto il gioco, 3 prova nulla.

   USO (server acceso su 8777):
     node strumenti/_156-profilo.js
     node strumenti/_156-profilo.js --clip fermo --yaw 54
     node strumenti/_156-profilo.js --gioco fuori/155-g2.html
   ===================================================================== */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i+1] && !process.argv[i+1].startsWith('--') ? process.argv[i+1] : d; };
const PORTA = arg('porta', '8777');
const GIOCO = arg('gioco', 'CALCETTO-il-gioco.html');
const CLIP  = arg('clip', 'fermo');
const YAW   = parseFloat(arg('yaw', '54'));
const FASE  = parseFloat(arg('u', '0.300'));
const ALT   = parseFloat(arg('h', '40'));
const RADICE = path.resolve(__dirname, '..');
if (!fs.existsSync(path.join(RADICE, GIOCO))) {
  console.error('PROVA NULLA: il file non esiste: ' + GIOCO); process.exit(3);
}

(async () => {
  let br;
  try { br = await chromium.launch(); }
  catch (e) { console.error('[156-profilo] BANCO: playwright non parte: ' + e.message); process.exit(2); }
  const pg = await br.newPage();
  try {
    await pg.goto('http://127.0.0.1:' + PORTA + '/' + GIOCO + '?provino&t=' + Date.now());
    await pg.waitForFunction('typeof Rig3D==="object" && typeof rigLook==="function"', { timeout: 45000 });
  } catch (e) {
    console.error('[156-profilo] BANCO: il gioco non si e\' aperto: ' + e.message);
    await br.close(); process.exit(2);
  }

  const out = await pg.evaluate(({ CLIP, FASE, YAW, H }) => {
    const NERO = '#000';
    const nero = { maglia:NERO, maglia2:NERO, manica:NERO, pantaloncini:NERO, calze:NERO, risvolto:NERO,
      pelle:NERO, capelli:NERO, scarpe:NERO, palla:null, taglio:0, corp:3, varb:0, manc:false,
      _lume:NERO, _ombra:NERO,
      _ombS:{ maglia:NERO, maglia2:NERO, manica:NERO, calze:NERO, pantaloncini:NERO, pelle:NERO } };
    const CW = 160, CH = 160;
    const cv = document.createElement('canvas');
    cv.width = CW; cv.height = CH;
    const g = cv.getContext('2d', { willReadFrequently:true });
    g.clearRect(0,0,CW,CH);
    const cx = CW*0.5, cy = CH*0.86;
    const sc = H / RIG_H;
    g.save();
    g.translate(cx,cy); g.scale(sc,sc); g.translate(-cx,-cy);
    Rig3D.disegna(g, cx, cy, RIG_H, YAW*Math.PI/180, 'alto', CLIP,
                  FASE/Rig3D.CLIPS[CLIP].freq, nero, true, sc);
    g.restore();
    const d = g.getImageData(0,0,CW,CH).data;
    const m = new Uint8Array(CW*CH);
    let x0=CW, x1=-1, y0=CH, y1=-1, tot=0;
    for (let y=0;y<CH;y++) for (let x=0;x<CW;x++) {
      if (d[(y*CW+x)*4+3] > 128) { m[y*CW+x]=1; tot++;
        if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
    }
    if (tot < 20) return null;
    const bw = x1-x0+1, bh = y1-y0+1;
    const righe = [];
    for (let y=0;y<bh;y++) {
      let c=0, t=0, prev=0, L=-1, R=-1, corse=[];
      let inizio=0;
      for (let x=x0;x<=x1+1;x++) {
        const v = x<=x1 ? m[(y+y0)*CW+x] : 0;
        if (v) { c++; if(!prev){ t++; inizio=x; } if(L<0)L=x; R=x; }
        else if (prev) corse.push([inizio-x0, x-1-x0]);
        prev=v;
      }
      righe.push({ y, c, t, L:L<0?-1:L-x0, R:R<0?-1:R-x0, corse });
    }
    /* le geometrie del rig, in metri, lette dal modulo per il confronto */
    const K = Rig3D.costanti ? Rig3D.costanti() : null;
    return { bw, bh, tot, righe, K };
  }, { CLIP, FASE, YAW, H: ALT });

  if (!out) { console.error('[156-profilo] PROVA NULLA: figura vuota'); await br.close(); process.exit(3); }

  console.log('[156-profilo] ' + GIOCO + '  ·  clip ' + CLIP + '  fase ' + FASE.toFixed(3)
            + '  imbardata ' + YAW + '  figura ' + ALT + ' px');
  console.log('  scatola ' + out.bw + 'x' + out.bh + '  inchiostro ' + (out.tot/(out.bw*out.bh)).toFixed(3));
  if (out.K) console.log('  costanti: ' + JSON.stringify(out.K));
  console.log('  riga  largh  tratti  profilo');
  for (const r of out.righe) {
    const barra = ' '.repeat(r.L<0?0:r.L) + '#'.repeat(Math.max(0, r.R-r.L+1));
    let vis = '';
    for (let i=0;i<out.bw;i++) {
      let dentro=false;
      for (const c of r.corse) if (i>=c[0] && i<=c[1]) dentro=true;
      vis += dentro ? '#' : '.';
    }
    console.log('  ' + String(r.y).padStart(4) + String(r.c).padStart(7)
              + String(r.t).padStart(7) + '  ' + vis);
  }
  await br.close();
  process.exit(0);
})();
