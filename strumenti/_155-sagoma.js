/* =====================================================================
   _155-sagoma.js — LA SAGOMA A QUARANTA PIXEL, MISURATA CLIP PER CLIP.

   PERCHE' ESISTE. Il criterio C3 della giuria della voce #155 chiede due
   cose precise, e nessuno strumento le contava: «in nessuna clip le
   braccia si fondono col tronco o le due gambe in un unico blocco».
   silhouette.js guarda dieci pose all'angolo di presentazione e conta
   le STROZZATURE del profilo di riga; qui si contano invece i TRATTI —
   quanti pezzi di nero separati incontra una scansione orizzontale —
   che e' la domanda «l'arto si e' staccato, si' o no», su tutte e 27 le
   clip e su quattro imbardate.

   COSA MISURA, su maschera nera piena a 40 px di figura:
     bracciaOK   quante delle quattro imbardate hanno almeno DUE righe,
                 nella meta' ALTA, con tre o piu' tratti (tronco + due
                 braccia staccate) oppure due tratti per almeno quattro
                 righe (un braccio staccato dal solo lato visibile)
     gambeOK     quante imbardate hanno almeno TRE righe, nel terzo
                 BASSO, con due o piu' tratti (le gambe non partono
                 dallo stesso punto)
     masse       le strozzature del profilo di riga, stesso conto di
                 ?banco=silhouette (per confronto)
     inchiostro  frazione piena della scatola

   NON E' UN CANCELLO: non ha una soglia che bocci il gioco, stampa i
   numeri e la riga «promosse» perche' il confronto prima/dopo sia un
   conto e non un aggettivo. Uscite: 0 ha misurato, 2 il banco non e'
   riuscito ad aprire il gioco, 3 prova nulla.

   USO (server acceso su 8777):
     node strumenti/_155-sagoma.js
     node strumenti/_155-sagoma.js --gioco fuori/155-g1.html
   ===================================================================== */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i+1] && !process.argv[i+1].startsWith('--') ? process.argv[i+1] : d; };
const PORTA = arg('porta', '8777');
const GIOCO = arg('gioco', 'CALCETTO-il-gioco.html');
const RADICE = path.resolve(__dirname, '..');
if (!fs.existsSync(path.join(RADICE, GIOCO))) {
  console.error('PROVA NULLA: il file non esiste: ' + GIOCO); process.exit(3);
}

/* la fase e' 0,300 su tutte, la stessa del fascicolo della giuria: un
   provino a fase casuale misura il fotogramma di passaggio, non il gesto */
const FASE = 0.300;
const IMBARDATE = [54, 144, 234, 324];
const ALTEZZA = 40;

(async () => {
  let br;
  try { br = await chromium.launch(); }
  catch (e) { console.error('[155-sagoma] BANCO: playwright non parte: ' + e.message); process.exit(2); }
  const pg = await br.newPage();
  const guai = [];
  pg.on('pageerror', e => guai.push(e.message));
  try {
    await pg.goto('http://127.0.0.1:' + PORTA + '/' + GIOCO + '?provino&t=' + Date.now());
    await pg.waitForFunction('typeof Rig3D==="object" && typeof rigLook==="function"', { timeout: 45000 });
  } catch (e) {
    console.error('[155-sagoma] BANCO: il gioco non si e\' aperto (server su ' + PORTA + '?): ' + e.message);
    await br.close(); process.exit(2);
  }

  const out = await pg.evaluate(({ FASE, IMBARDATE, H }) => {
    const NERO = '#000';
    const nero = { maglia:NERO, maglia2:NERO, pantaloncini:NERO, calze:NERO, risvolto:NERO,
      pelle:NERO, capelli:NERO, scarpe:NERO, palla:null, taglio:0, corp:3, varb:0, manc:false,
      _lume:NERO, _ombra:NERO,
      _ombS:{ maglia:NERO, maglia2:NERO, calze:NERO, pantaloncini:NERO, pelle:NERO } };
    const CW = 130, CH = 130;
    const cv = document.createElement('canvas');
    cv.width = CW; cv.height = CH;
    const g = cv.getContext('2d', { willReadFrequently:true });

    function disegna(clip, u, yawDeg) {
      g.clearRect(0,0,CW,CH);
      const cx = CW*0.5, cy = CH*0.84;
      const sc = H / RIG_H;
      g.save();
      g.translate(cx,cy); g.scale(sc,sc); g.translate(-cx,-cy);
      Rig3D.disegna(g, cx, cy, RIG_H, yawDeg*Math.PI/180, 'alto', clip,
                    u/Rig3D.CLIPS[clip].freq, nero, true, sc);
      g.restore();
    }
    function misura() {
      const d = g.getImageData(0,0,CW,CH).data;
      const m = new Uint8Array(CW*CH);
      let x0=CW, x1=-1, y0=CH, y1=-1, tot=0;
      for (let y=0;y<CH;y++) for (let x=0;x<CW;x++) {
        if (d[(y*CW+x)*4+3] > 128) { m[y*CW+x]=1; tot++;
          if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
      }
      if (tot < 20) return null;
      const bw = x1-x0+1, bh = y1-y0+1;
      const prof = new Int32Array(bh), tratti = new Int32Array(bh);
      for (let y=0;y<bh;y++) {
        let c=0, t=0, prev=0;
        for (let x=x0;x<=x1;x++) { const v=m[(y+y0)*CW+x]; if(v){c++; if(!prev)t++;} prev=v; }
        prof[y]=c; tratti[y]=t;
      }
      /* le braccia: righe della META' ALTA con tre tratti (tronco piu'
         due braccia) oppure con due tratti (un braccio solo staccato) */
      let r3=0, r2=0;
      for (let y=0;y<Math.floor(bh*0.55);y++) { if(tratti[y]>=3) r3++; else if(tratti[y]===2) r2++; }
      /* le gambe: righe del TERZO BASSO con due o piu' tratti */
      let gb=0;
      for (let y=Math.floor(bh*0.66);y<bh;y++) if (tratti[y]>=2) gb++;
      /* LO SCAVO — la frazione del guscio CONVESSO che resta sfondo.
         E' il criterio che silhouette.js dichiara «l'unico che separi le
         tre nominate dalle quattro fuse», con soglia 0,33: qui si
         ricalcola clip per clip invece che sulle sole dieci pose
         dell'angolo di presentazione. Il guscio si prende per righe e
         per colonne insieme (l'inviluppo dei due estremi per riga e per
         colonna): non e' il guscio convesso esatto, e' il suo
         sovrainsieme piu' stretto che si calcoli in due passate — e la
         differenza, misurata, sta sotto il mezzo punto percentuale. */
      let guscio = 0;
      {
        /* IL GUSCIO CONVESSO VERO, con la catena monotona di Andrew. La
           prima stesura prendeva l'INTERSEZIONE della banda di riga con
           quella di colonna, ed era sbagliata nel caso per cui esiste:
           il vuoto fra le due gambe sta dentro la banda di riga ma SOTTO
           l'ultimo pixel nero della sua colonna, quindi veniva escluso e
           lo scavo usciva 0,015 su tutte e ventisette le clip — un
           numero che non discrimina e' un numero che attesta. */
        const pts = [];
        for (let y=0;y<bh;y++) {
          let L=-1, R=-1;
          for (let x=x0;x<=x1;x++) if (m[(y+y0)*CW+x]) { L=x; break; }
          if (L<0) continue;
          for (let x=x1;x>=x0;x--) if (m[(y+y0)*CW+x]) { R=x; break; }
          pts.push([L, y+y0]); pts.push([R, y+y0]);
        }
        pts.sort((p,q)=> p[0]-q[0] || p[1]-q[1]);
        const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
        const lo=[], up=[];
        for (const p of pts) { while(lo.length>=2 && cr(lo[lo.length-2],lo[lo.length-1],p)<=0) lo.pop(); lo.push(p); }
        for (let i=pts.length-1;i>=0;i--) { const p=pts[i];
          while(up.length>=2 && cr(up[up.length-2],up[up.length-1],p)<=0) up.pop(); up.push(p); }
        lo.pop(); up.pop();
        const H2 = lo.concat(up);
        if (H2.length >= 3) {
          for (let y=y0;y<=y1;y++) for (let x=x0;x<=x1;x++) {
            let dentro = true;
            for (let i=0;i<H2.length;i++) {
              const A=H2[i], B=H2[(i+1)%H2.length];
              if ((B[0]-A[0])*(y-A[1])-(B[1]-A[1])*(x-A[0]) < -0.5) { dentro=false; break; }
            }
            if (dentro) guscio++;
          }
        } else guscio = tot;
      }
      const scavo = guscio>0 ? (guscio-tot)/guscio : 0;
      /* le strozzature, stesso conto di ?banco=silhouette */
      let picco=0; for(let y=0;y<bh;y++) if(prof[y]>picco)picco=prof[y];
      let masse=0;
      for (let y=2;y<bh-2;y++) {
        if (prof[y]<=prof[y-1] && prof[y]<=prof[y+1] && prof[y]>0) {
          let sx=prof[y]; for(let k=y-1;k>=0;k--){ if(prof[k]>sx)sx=prof[k]; if(prof[k]<prof[y])break; }
          let dx=prof[y]; for(let k=y+1;k<bh;k++){ if(prof[k]>dx)dx=prof[k]; if(prof[k]<prof[y])break; }
          const alto=Math.min(sx,dx);
          if (alto>0 && (alto-prof[y])/alto>=0.25 && alto>=0.25*picco) { masse++; y+=2; }
        }
      }
      return { bw, bh, inch: tot/(bw*bh), r3, r2, gb, masse, scavo };
    }

    const righe = [];
    for (const clip of Object.keys(Rig3D.CLIPS)) {
      const r = { clip, braccia:0, gambe:0, scavo:0, scavoOK:0, masse:0, inch:0, det:[] };
      for (const yaw of IMBARDATE) {
        disegna(clip, FASE, yaw);
        const m = misura();
        if (!m) { r.det.push(null); continue; }
        const bOK = (m.r3 >= 2) || (m.r2 >= 4);
        const gOK = m.gb >= 3;
        if (bOK) r.braccia++;
        if (gOK) r.gambe++;
        r.masse += m.masse; r.inch += m.inch; r.scavo += m.scavo;
        if (m.scavo >= 0.33) r.scavoOK++;
        /* il dettaglio PER IMBARDATA: senza, si sa che una clip vale 2 su
           4 ma non QUALI due, e si gira una manopola al buio. Lo stampa
           --det; il conto di sopra non cambia di un bit. */
        r.det.push({ yaw, r3:m.r3, r2:m.r2, gb:m.gb, bOK, gOK, masse:m.masse });
      }
      r.masse /= IMBARDATE.length; r.inch /= IMBARDATE.length; r.scavo /= IMBARDATE.length;
      righe.push(r);
    }
    return righe;
  }, { FASE, IMBARDATE, H: ALTEZZA });

  console.log('[155-sagoma] file: ' + GIOCO + '  ·  figura ' + ALTEZZA + ' px, nero pieno, fase ' + FASE.toFixed(3)
            + ', imbardate ' + IMBARDATE.join('/'));
  console.log('  clip            braccia/4  gambe/4  scavo>=0,33  scavo  masse  inchiostro');
  let bTot=0, gTot=0, mTot=0, sTot=0, sOK=0, pien=0;
  for (const r of out) {
    console.log('  ' + r.clip.padEnd(16) + String(r.braccia).padStart(4) + '     '
              + String(r.gambe).padStart(5) + '        ' + String(r.scavoOK).padStart(3)
              + '     ' + r.scavo.toFixed(3) + '  ' + r.masse.toFixed(2).padStart(5)
              + '   ' + r.inch.toFixed(3));
    if (process.argv.includes('--det')) {
      console.log('      ' + r.det.map(d => d ? (d.yaw + ':' + (d.bOK ? 'B' : 'b') + (d.gOK ? 'G' : 'g')
                + '(' + d.r3 + '/' + d.r2 + '/' + d.gb + ')') : '-').join('  '));
    }
    bTot += r.braccia; gTot += r.gambe; mTot += r.masse; sTot += r.scavo; sOK += r.scavoOK;
    if (r.braccia >= 3 && r.scavoOK === 4) pien++;
  }
  const N = out.length;
  console.log('  TOTALE: braccia ' + bTot + '/' + (N*4) + '  ·  gambe ' + gTot + '/' + (N*4)
            + '  ·  scavo>=0,33 ' + sOK + '/' + (N*4) + ' (medio ' + (sTot/N).toFixed(3) + ')'
            + '  ·  masse medie ' + (mTot/N).toFixed(2)
            + '  ·  clip PIENE (braccia>=3/4 e scavo 4/4): ' + pien + '/' + N);
  if (guai.length) console.log('  errori di pagina: ' + JSON.stringify(guai.slice(0,3)));
  await br.close();
  process.exit(0);
})();
