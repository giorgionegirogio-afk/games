/* =====================================================================
   _157-misure.js — LE TRE MISURE CHE LA GIURIA HA CHIESTO PER NOME
   (voce #155, giro 4 · rilievi 1, 2, 3 e 6 del verbale del giro 3)

   La giuria non ha scritto «migliora»: ha scritto tre misure, con la
   soglia accanto. Questo attrezzo le fa tutte e tre in una sola
   apertura del gioco, perche' tre banchi che aprono tre volte lo stesso
   file sono tre occasioni di misurare tre stati diversi.

   ------------------------------------------------------------------
   A. IOU — «quattro corpi diversi al fotogramma di contatto»
   ------------------------------------------------------------------
   Testo del rilievo 1: «aggiungi una colonna che stampi la IoU a coppie
   fra le quattro maschere nere al fotogramma di contatto, su tutte e
   quattro le imbardate, e chiedi IoU massima < 0,60».
   E il rilievo 2 chiede lo stesso per la seconda famiglia: fermo,
   pugni, sfugge.

   PERCHE' LA IOU E NON UNA SOMIGLIANZA A OCCHIO. Le quattro maschere si
   disegnano nello STESSO punto del riquadro, alla stessa scala, con lo
   stesso ancoraggio: Rig3D.disegna riceve lo stesso (cx,cy,hPx). Quindi
   l'intersezione su unione misura esattamente la domanda «queste due
   pose occupano gli stessi pixel», che e' cio' che il giudice fa
   coprendo il nome sotto la cella. Nessun allineamento, nessuna
   normalizzazione: normalizzare sarebbe regalare al gioco una
   somiglianza che l'occhio non perdona.

   IL FOTOGRAMMA DI CONTATTO e' tImp della clip, letto dal gioco
   (Rig3D.tImp) e non copiato qui: un banco che tiene una seconda copia
   dei numeri misura la propria copia.

   ------------------------------------------------------------------
   B. IL MUSO — SI INDOVINA IL DAVANTI DALLA SOLA TESTA?
   ------------------------------------------------------------------
   Testo del rilievo 3: «metti le 8 imbardate di fermo sul foglio in
   nero e chiedi che il baricentro della maschera-testa stia fuori dal
   centro della sua scatola, verso il davanti, in 8 casi su 8».

   QUELLA MISURA NON SERVE AL CRITERIO CHE DOVREBBE SERVIRE, e va detto
   invece di aggirarlo. Il baricentro contro il centro della scatola e'
   SISTEMATICAMENTE contrario alla richiesta: una sporgenza stretta
   allunga la scatola di tutta la sua lunghezza e sposta il baricentro
   di pochissimo, quindi PIU' il muso rompe il contorno, PIU' quel
   numero scende. Verificato per integrazione numerica sull'unione di
   tre cerchi (il cranio, la nuca, il muso), prima di toccare il gioco:
       muso a 1,29 raggi contro 1,09 della nuca   ->  -0,028
       muso RIENTRATO a 1,09 contro 1,31          ->  +0,029
   Cioe' la testa che il criterio vuole prende il voto peggiore.

   LA MISURA CHE VALE e' la domanda di C2 alla lettera — «in 8 casi su 8
   si indovina il davanti entro +-45 gradi» — tradotta in un numero: la
   DIREZIONE DI MASSIMA SPORGENZA della maschera della testa, dal suo
   baricentro, confrontata con la direzione del davanti in quadro.
   Si stampano tutt'e due, e accanto alla seconda c'e' scritto perche'
   non decide. Un banco che tace il numero che gli hanno chiesto sta
   scegliendo il verdetto; uno che lo stampa senza dire che e' storto
   sta attestando.

   COME SI ISOLA LA TESTA. Si disegna la figura con look._senzaTesta = 2
   (solo la testa), che il gioco espone come Rig3D.SENZA_TESTA. La
   prima stesura faceva la differenza fra la figura intera e quella
   senza testa, e misurava la testa VISIBILE: le occlusioni del braccio
   e del collo sporcavano il baricentro fino a mezzo pixel, tanto che a
   90 e 270 gradi — che sono l'una lo specchio dell'altra — la stessa
   testa dava +0,268 e -0,202. Un banco che misura il rumore attesta.

   IL DAVANTI IN QUADRO. L'imbardata yaw manda il davanti del corpo in
   direzione (sin(yaw), -cos(yaw)*cam.se) sullo schermo, con cam.se il
   seno dell'inclinazione della camera, letto da Rig3D.CAMERE.

   ------------------------------------------------------------------
   C. LE QUATTRO STATURE — «lo spilungone non e' il piu' alto»
   ------------------------------------------------------------------
   Testo del rilievo 6: «sagome 56 / 54 / 50 / 57 px — il neutro (57)
   supera lo spilungone (56)». Qui si ricontano, sulla stessa maschera
   nera a cinquanta pixel del provino, e si stampa se l'ordine e'
   giusto: lungo > neutro > tarchiato > piccoletto.

   USCITE: 0 ha misurato · 2 il banco non e' riuscito ad aprire il
   gioco · 3 prova nulla (manca un aggancio che serve).

   USO (server acceso su 8777):
     node strumenti/_157-misure.js
     node strumenti/_157-misure.js --gioco fuori/155-g3.html
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

/* le quattro imbardate del foglio della giuria, piu' le otto del muso */
const IMB4 = [54, 144, 234, 324];
const IMB8 = [0, 45, 90, 135, 180, 225, 270, 315];
const FAM_CALCI = ['passaggio', 'filtrante', 'cross', 'tiro'];
const FAM_PIEDI = ['fermo', 'pugni', 'sfugge'];
const SOGLIA_IOU = 0.60;

(async () => {
  let br;
  try { br = await chromium.launch(); }
  catch (e) { console.error('[157-misure] BANCO: playwright non parte: ' + e.message); process.exit(2); }
  const pg = await br.newPage();
  const guai = [];
  pg.on('pageerror', e => guai.push(e.message));
  try {
    await pg.goto('http://127.0.0.1:' + PORTA + '/' + GIOCO + '?provino&t=' + Date.now());
    await pg.waitForFunction('typeof Rig3D==="object" && typeof rigLook==="function"', { timeout: 45000 });
  } catch (e) {
    console.error('[157-misure] BANCO: il gioco non si e\' aperto (server su ' + PORTA + '?): ' + e.message);
    await br.close(); process.exit(2);
  }

  const out = await pg.evaluate(({ IMB4, IMB8, FAM_CALCI, FAM_PIEDI }) => {
    const NERO = '#000';
    const nero = { maglia:NERO, maglia2:NERO, manica:NERO, pantaloncini:NERO, calze:NERO, risvolto:NERO,
      pelle:NERO, capelli:NERO, scarpe:NERO, palla:null, taglio:0, corp:3, varb:0, manc:false,
      _lume:NERO, _ombra:NERO,
      _ombS:{ maglia:NERO, maglia2:NERO, calze:NERO, pantaloncini:NERO, pelle:NERO } };
    const CW = 160, CH = 160;
    const cv = document.createElement('canvas');
    cv.width = CW; cv.height = CH;
    const g = cv.getContext('2d', { willReadFrequently:true });

    /* la scala del provino: la figura alta H px dentro la cella, con la
       trasformazione DICHIARATA al rig (ultimo argomento), che e' cio'
       che spegne il dettaglio per la legge del LOD. */
    function disegna(clip, u, yawDeg, H, lk, cy0) {
      g.clearRect(0,0,CW,CH);
      const cx = CW*0.5, cy = CH*(cy0===undefined?0.84:cy0);
      const sc = H / RIG_H;
      g.save();
      g.translate(cx,cy); g.scale(sc,sc); g.translate(-cx,-cy);
      Rig3D.disegna(g, cx, cy, RIG_H, yawDeg*Math.PI/180, 'alto', clip,
                    u/Rig3D.CLIPS[clip].freq, lk || nero, true, sc);
      g.restore();
    }
    function maschera() {
      const d = g.getImageData(0,0,CW,CH).data;
      const m = new Uint8Array(CW*CH);
      let n = 0;
      for (let i=0;i<CW*CH;i++) if (d[i*4+3] > 128) { m[i]=1; n++; }
      return { m, n };
    }
    function scatola(m) {
      let x0=CW, x1=-1, y0=CH, y1=-1;
      for (let y=0;y<CH;y++) for (let x=0;x<CW;x++) if (m[y*CW+x]) {
        if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
      return { x0, x1, y0, y1, w:x1-x0+1, h:y1-y0+1 };
    }

    /* --------------------- A. IOU ------------------------------- */
    function iouFamiglia(clips, fase) {
      const righe = [];
      for (const yaw of IMB4) {
        const M = clips.map(c => {
          /* fase: se e' una funzione, la calcola per clip (il contatto) */
          const u = (typeof fase === 'function') ? fase(c) : fase;
          disegna(c, u, yaw, 40);
          return maschera();
        });
        const coppie = [];
        for (let i=0;i<M.length;i++) for (let j=i+1;j<M.length;j++) {
          let inter=0, uni=0;
          const a=M[i].m, b=M[j].m;
          for (let k=0;k<CW*CH;k++) { const p=a[k], q=b[k];
            if (p&&q) inter++; if (p||q) uni++; }
          coppie.push({ a:clips[i], b:clips[j], iou: uni? inter/uni : 0 });
        }
        righe.push({ yaw, coppie });
      }
      return righe;
    }
    /* il fotogramma di contatto: lo dichiara il gioco, non questo file */
    const tImp = (Rig3D.tImp) ? Rig3D.tImp : null;
    const faseContatto = tImp ? (c => tImp(c)) : null;

    /* --------------------- B. IL MUSO --------------------------- */
    const cam = Rig3D.CAMERE ? Rig3D.CAMERE.alto : null;
    let muso = null;
    if (cam && Rig3D.SENZA_TESTA !== undefined) {
      muso = [];
      const lkT = Object.assign({}, nero); lkT[Rig3D.SENZA_TESTA] = 2;   /* SOLO la testa */
      for (const yaw of IMB8) {
        disegna('fermo', 0.30, yaw, 50, lkT, 0.80);
        const A = maschera();
        if (A.n < 12) { muso.push(null); continue; }
        const b = scatola(A.m);
        let sx=0, sy=0;
        for (let y=b.y0;y<=b.y1;y++) for (let x=b.x0;x<=b.x1;x++) if (A.m[y*CW+x]) { sx+=x; sy+=y; }
        sx/=A.n; sy/=A.n;
        const ccx = (b.x0+b.x1)/2, ccy = (b.y0+b.y1)/2;
        const r = yaw*Math.PI/180;
        /* il davanti del corpo, in quadro: (sin yaw, -cos yaw * se) */
        let dx = Math.sin(r), dy = -Math.cos(r)*cam.se;
        const L = Math.hypot(dx,dy) || 1; dx/=L; dy/=L;
        const semi = Math.abs(dx)*(b.w/2) + Math.abs(dy)*(b.h/2);
        const sporg = ((sx-ccx)*dx + (sy-ccy)*dy) / (semi||1);
        /* LA PORTATA: quanto lontano arriva la maschera dal suo
           baricentro, lungo il DAVANTI e lungo il DIETRO. E' la misura
           che dice «il muso rompe il contorno piu' della nuca», cioe'
           esattamente cio' che il criterio chiede. */
        let avanti=0, dietro=0, maxR=0, maxA=0;
        const GIRI=72;
        const rag=new Float64Array(GIRI);
        for (let y=b.y0;y<=b.y1;y++) for (let x=b.x0;x<=b.x1;x++) {
          if (!A.m[y*CW+x]) continue;
          const vx=x-sx, vy=y-sy, d=Math.hypot(vx,vy);
          const p = vx*dx+vy*dy;
          if (p>avanti) avanti=p;
          if (-p>dietro) dietro=-p;
          let k=Math.round((Math.atan2(vy,vx)+Math.PI)/(2*Math.PI)*GIRI)%GIRI;
          if (d>rag[k]) rag[k]=d;
        }
        for (let k=0;k<GIRI;k++) if (rag[k]>maxR) { maxR=rag[k]; maxA=k; }
        /* la direzione di massima sporgenza, e di quanto sbaglia il
           davanti: e' la domanda del criterio C2, «si indovina il
           davanti entro +-45 gradi», tradotta in un numero */
        const ang = (maxA/GIRI)*2*Math.PI - Math.PI;
        let err = ang - Math.atan2(dy,dx);
        while (err>Math.PI) err-=2*Math.PI;
        while (err<-Math.PI) err+=2*Math.PI;
        const errG = Math.abs(err)*180/Math.PI;
        muso.push({ yaw, n:A.n, sporgenza: sporg, avanti, dietro,
                    rapporto: dietro>0.01 ? avanti/dietro : 9,
                    errore: errG, ok: errG <= 45, okBar: sporg > 0 });
      }
    }

    /* --------------------- C. LE QUATTRO STATURE ---------------- */
    const corpi = [];
    for (let c=0;c<4;c++) {
      const lk = Object.assign({}, nero, { corp:c });
      disegna('fermo', 0.30, 54, 50, lk, 0.80);
      const M = maschera();
      if (M.n < 20) { corpi.push(null); continue; }
      const b = scatola(M.m);
      corpi.push({ corp:c, h:b.h, w:b.w, pieno: M.n/(b.w*b.h) });
    }

    return {
      calci: faseContatto ? iouFamiglia(FAM_CALCI, faseContatto) : null,
      piedi: iouFamiglia(FAM_PIEDI, 0.30),
      hasTImp: !!tImp,
      muso, corpi,
      hasSenzaTesta: (Rig3D.SENZA_TESTA !== undefined),
    };
  }, { IMB4, IMB8, FAM_CALCI, FAM_PIEDI });

  console.log('[157-misure] file: ' + GIOCO);
  let nulla = 0;

  /* ------------------------------ A ------------------------------ */
  console.log('\nA. IOU FRA LE MASCHERE NERE — soglia: IoU massima < ' + SOGLIA_IOU.toFixed(2));
  function stampaFam(nome, righe, quando) {
    if (!righe) { console.log('  ' + nome + ': PROVA NULLA (manca Rig3D.tImp nel gioco)'); nulla++; return; }
    let peggio = 0, peggioNome = '';
    console.log('  ' + nome + '  (' + quando + ')');
    for (const r of righe) {
      const s = r.coppie.map(c => c.a.slice(0,4) + '/' + c.b.slice(0,4) + ' ' + c.iou.toFixed(3)).join('  ');
      console.log('    ' + String(r.yaw).padStart(3) + '째  ' + s);
      for (const c of r.coppie) if (c.iou > peggio) { peggio = c.iou; peggioNome = c.a + '/' + c.b + ' @' + r.yaw; }
    }
    console.log('    IoU MASSIMA: ' + peggio.toFixed(3) + '  (' + peggioNome + ')  '
              + (peggio < SOGLIA_IOU ? 'PASSA' : 'NON PASSA'));
    return peggio;
  }
  const pC = stampaFam('i quattro calci', out.calci, 'fotogramma di contatto, tImp dal gioco');
  const pP = stampaFam('fermo / pugni / sfugge', out.piedi, 'fase 0,300');

  /* ------------------------------ B ------------------------------ */
  console.log('\nB. IL MUSO — si indovina il davanti dalla sola maschera della testa?');
  if (!out.muso) {
    console.log('  PROVA NULLA: il gioco non espone Rig3D.SENZA_TESTA / Rig3D.CAMERE,');
    console.log('  e un banco che ritaglia «il quinto alto» misura un ritaglio, non la testa.');
    nulla++;
  } else {
    let ok = 0, okB = 0;
    console.log('  imbardata  px   avanti/dietro   direzione di massima sporgenza   baricentro');
    for (const m of out.muso) {
      if (!m) { console.log('  (una imbardata non ha disegnato niente)'); nulla++; continue; }
      console.log('  ' + String(m.yaw).padStart(6) + '째 ' + String(m.n).padStart(5)
                + '   ' + m.rapporto.toFixed(2).padStart(5)
                + '        sbaglia ' + m.errore.toFixed(0).padStart(3) + '째  ' + (m.ok?'SI ':'no ')
                + '      ' + (m.sporgenza>=0?'+':'') + m.sporgenza.toFixed(3) + ' ' + (m.okBar?'SI':'no'));
      if (m.ok) ok++;
      if (m.okBar) okB++;
    }
    console.log('  DIREZIONE giusta entro +-45째: ' + ok + '/8  ' + (ok === 8 ? 'PASSA' : 'NON PASSA'));
    console.log('  BARICENTRO oltre il centro scatola: ' + okB + '/8  ' + (okB === 8 ? 'passa' : 'non passa'));
    console.log('  NOTA SULLA SECONDA MISURA, e va detta perche\' e\' la misura che la');
    console.log('  giuria ha proposto: il baricentro contro il centro della scatola e\'');
    console.log('  SISTEMATICAMENTE contrario al criterio che dovrebbe servire. Una');
    console.log('  sporgenza stretta allunga la scatola di tutta la sua lunghezza e il');
    console.log('  baricentro di pochissimo, quindi PIU\' il muso rompe il contorno, PIU\'');
    console.log('  quel numero scende. Verificato per integrazione su tre cerchi');
    console.log('  (strumenti/_157-lobi.js): col muso che sporge 1,28 raggi contro 1,08');
    console.log('  della nuca il baricentro da\' -0,028; col muso RIENTRATO a 1,09 contro');
    console.log('  1,22 della nuca da\' +0,026. La prima misura — dove punta la massima');
    console.log('  sporgenza della maschera — e\' la domanda del criterio («si indovina il');
    console.log('  davanti entro +-45 gradi») e non ha quel rovescio.');
  }

  /* ------------------------------ C ------------------------------ */
  console.log('\nC. LE QUATTRO STATURE — maschera nera a 50 px, clip fermo, 54째');
  const NOMI = ['spilungone', 'tarchiato', 'piccoletto', 'neutro'];
  const hh = [];
  for (const c of out.corpi) {
    if (!c) { console.log('  (una corporatura non ha disegnato niente)'); nulla++; continue; }
    console.log('  ' + NOMI[c.corp].padEnd(12) + ' alta ' + String(c.h).padStart(3) + ' px   larga '
              + String(c.w).padStart(3) + ' px   pieno ' + c.pieno.toFixed(3));
    hh[c.corp] = c.h;
  }
  if (hh.length === 4) {
    const ordine = hh[0] > hh[3] && hh[3] > hh[1] && hh[1] > hh[2];
    console.log('  ordine chiesto: spilungone > neutro > tarchiato > piccoletto   '
              + (ordine ? 'PASSA' : 'NON PASSA')
              + '   (' + hh.join(' / ') + ')');
    console.log('  forbice: ' + (((hh[0]-hh[2])/hh[2])*100).toFixed(1) + '% fra il lungo e il corto');
  }

  if (guai.length) console.log('\n  errori di pagina: ' + JSON.stringify(guai.slice(0,3)));
  await br.close();
  process.exit(nulla ? 3 : 0);
})();
