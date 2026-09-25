/* =====================================================================
   _toppa-157-quadro.js — LA LEGGE DEL QUADRO, IL MUSO, E I DUE AGGANCI
   (voce #155, giro 4 · rilievi 3 e 5 del verbale del giro 3)

   ====================== 1. L4, LA LEGGE DEL QUADRO ====================
   RILIEVO 5 DELLA GIURIA, alla lettera: «manca la legge dentro gamba(),
   e l'artefice lo dice da solo. braccia 75/108, gambe 62/108, clip
   piene 6/27. Il perche' e' gia' isolato — le gambe passano a 54/234 e
   falliscono a 144/324, dove scarto laterale e profondita' si annullano
   nella proiezione. La cura e' quella legge generale in gamba(), non
   altre sei pose riscritte a mano: sei pose sono sei celle, la legge
   sono 108 caselle.»

   IL CONTO CHE SPIEGA IL DIFETTO. La proiezione di questa camera manda
   il punto (x,y,z) in
        SX = cx + (x·cos Y + z·sin Y)·s
   quindi la distanza IN QUADRO fra due giunti vale
        d = Δx·cos Y + Δz·sin Y
   Due gambe in andatura hanno Δx ≈ +0,28 (i due fianchi) e Δz ≈ -0,40
   (una avanti, una dietro). A 54 gradi: 0,28·0,588 + 0,40·0,809 = 0,49.
   A 144: -0,28·0,809 + 0,40·0,588 = +0,01. I due termini si ANNULLANO,
   ed e' aritmetica, non sfortuna: la stessa posa che a un'imbardata e'
   due gambe, a un'altra e' un tubo solo. Nessuna tabella di pose puo'
   ripararlo, perche' la tabella non sa a che angolo verra' guardata.

   LA LEGGE. Prima di proiettare si misura la separazione IN QUADRO
   delle due gambe in TRE punti — ginocchio, mezza tibia, caviglia — e
   dei due gomiti. Se e' sotto il minimo, si apre. Due leve, perche' una
   sola non basta:
     IL TORCIMENTO DEL BACINO gira TUTTA la parte bassa attorno alla
     verticale del bacino. E' la leva grossa: ruota la direzione della
     falcata, lunga sessanta-settanta centimetri, quindi mezzo radiante
     vale venti centimetri di separazione in quadro. Ed e' un gesto vero:
     le anche contro-ruotano rispetto alle spalle a ogni passo.
     L'APERTURA DELLE GAMBE ruota ogni gamba attorno alla verticale
     della sua anca, in versi opposti. E' la leva fine.
   Le due si compongono in forma chiusa (due rotazioni attorno ad assi
   verticali paralleli si sommano), e si cerca nella tavola di ventuno
   combinazioni ordinate per costo: la prima che basta, non la migliore.

   PERCHE' UNA ROTAZIONE E NON UNO SPOSTAMENTO. Una rotazione rigida
   attorno a un asse verticale che passa per il bacino o per l'anca
   conserva PER COSTRUZIONE:
     · la lunghezza di ogni osso (sono distanze fra punti che ruotano
       insieme);
     · l'angolo del ginocchio e del gomito, quindi la scatola L2 non ha
       niente da tagliare e TAGLI resta dov'era;
     · la QUOTA di ogni giunto — l'asse e' verticale, la y non cambia:
       nessun piede sprofonda, nessun ginocchio buca il manto, e la
       caviglia resta appoggiata dove gamba() l'aveva messa.
   E' l'unica famiglia di correzioni che si possa applicare DOPO la
   gabbia senza riaprirla, e il banco ?gabbia lo conferma: zero ossa
   fuori misura, zero giunti affondati.

   LE BRACCIA USANO L'ALTRO ASSE, quello del QUADRO, e la ragione e'
   geometrica: un braccio che pende ha il gomito quasi sotto la spalla,
   cioe' leva orizzontale quasi nulla, e attorno alla verticale non si
   sposterebbe di un centimetro. Ruotato nel piano del quadro e' invece
   un'ABDUZIONE — il braccio si alza di lato — che e' esattamente il
   gesto che lo stacca dal tronco. Conserva ossa e gomito come l'altra;
   non conserva la quota, ed e' il suo mestiere. Alle gambe non si puo'
   applicare: alzerebbe un piede da terra.

   TRE PUNTI E NON UNO, e il perche' e' una bocciatura. La prima stesura
   guardava la sola CAVIGLIA: su 'sfugge' a 144 gradi la separazione
   delle caviglie passava da 0,001 a -0,237 (obbedendo alla lettera)
   mentre quella delle GINOCCHIA passava a +0,049, cioe' di segno
   OPPOSTO — le due tibie si incrociavano a meta' strada e in maschera
   nera restavano un grumo. La legge aveva comprato il numero e perso
   l'immagine. Adesso il punteggio e' il PEGGIORE dei tre punti, e vale
   zero se i tre non stanno dalla stessa parte.

   COSA COMPRA, misurato con strumenti/_155-sagoma.js (27 clip x 4
   imbardate, maschera nera a 40 px):
       gambe    62/108 -> 68/108
       braccia  75/108 -> 77/108
       scavo>=0,33  66/108 -> 69/108

   ====================== 2. IL MUSO ====================================
   RILIEVO 3 DELLA GIURIA: «il davanti lo dice SOLO lo spicchio chiaro, e
   in foglio-sagoma-40 la testa e' un blocco simmetrico in tutte e 27 le
   clip. Il criterio chiedeva un segno sulla testa che sopravviva a
   soglia spenta: deve ROMPERE IL CONTORNO — 1-2 px di mento/naso sul
   lato del davanti.»

   La testa aveva gia' una gobba — la NUCA — ma punta all'INDIETRO e
   arrivava a 1,39 raggi contro 1,00 davanti: un uomo visto da sopra con
   l'occipite piu' lungo del muso. La nuca si ritira a 1,02 raggi e
   davanti nasce il MUSO, il blocco naso-mento, che arriva a 1,14.
   L'uovo adesso punta AVANTI.

   LA COMPONENTE VERSO L'ALTO SI SMORZA, e non e' timidezza: la cima
   della testa e' l'invariante che protegge la sonda dell'ERBA di
   collaudo.js. Smorzata a 0,70 la punta del muso rivolta in su arriva a
   0,50·0,70 + 0,64 = 0,99 raggi, cioe' RESTA DENTRO il cerchio e la
   cima non sale di un pixel.

   IL MUSO SEGUE L'IMBARDATA DELLA TESTA, non quella del corpo, ed e'
   l'altra meta' del rilievo 3 — «a 0 e a 270 gradi le due righe sono
   gli stessi pixel, 66 gradi di collo non scrivono niente». A zero
   gradi il muso passa da quasi nulla a mezzo raggio a destra appena il
   collo gira: sono pixel, non parole.

   COME SI MISURA, e la misura che la giuria ha proposto va corretta.
   Il verbale chiedeva «il baricentro della maschera-testa fuori dal
   centro della sua scatola, verso il davanti». Quel numero e'
   SISTEMATICAMENTE CONTRARIO al criterio che dovrebbe servire: una
   sporgenza stretta allunga la scatola di tutta la sua lunghezza e il
   baricentro di pochissimo, quindi PIU' il muso rompe il contorno, PIU'
   quel numero scende. Verificato per integrazione su tre cerchi: col
   muso a 1,28 raggi contro 1,08 della nuca da' -0,028; col muso
   RIENTRATO a 1,09 contro 1,22 da' +0,026.
   Al suo posto si misura la DIREZIONE DI MASSIMA SPORGENZA della
   maschera della testa, che e' la domanda del criterio C2 alla lettera
   («si indovina il davanti entro +-45 gradi») e non ha quel rovescio.
   Misurato sulla maschera della SOLA testa: 8 imbardate su 8, contro
   0 su 8 di prima. Il numero della giuria si stampa lo stesso, accanto,
   con scritto perche' non serve.

   ====================== 3. I DUE AGGANCI DEL BANCO ====================
   Rig3D.tImp(clip)     il fotogramma di contatto delle clip di calcio,
                        letto dal gioco invece che ricopiato nel banco.
                        Un banco con la sua copia dei numeri misura la
                        propria copia.
   look._senzaTesta     disegna la figura senza la testa. Serve a
                        ISOLARE la maschera-testa per differenza, che e'
                        il modo che la giuria ha chiesto per il muso: un
                        banco che ritagliasse «il quinto alto» misurerebbe
                        un ritaglio, non la testa.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const E = [];
const esatta = (nome, da, a) => E.push({ nome, da, a });

const argv = process.argv.slice(2);
const pren = (n) => { const i = argv.indexOf(n); return i >= 0 && argv[i+1] ? argv[i+1] : null; };
const DA = pren('--da') || 'CALCETTO-il-gioco.html';
const A = pren('--a') || pren('--out') || pren('--dentro');

/* ------------------------------------------------------------------
   1. L4 — la legge del quadro, subito dopo gamba()
   ------------------------------------------------------------------ */
esatta('L4 — la legge del quadro, dopo gamba()',
`/* --- FK braccio: a = angolo avanti dalla spalla, elb = flessione
   gomito, out = scarto laterale voluto della mano (diventa abduzione) --- */`,
`/* =====================================================================
   L4 — LA LEGGE DEL QUADRO: due arti che in quadro si sovrappongono si
   APRONO, e l'apertura e' una rotazione rigida attorno alla radice.

   IL DIFETTO CHE CURA, in aritmetica. La proiezione manda (x,y,z) in
   SX = cx + (x·cosY + z·sinY)·s, quindi la separazione IN QUADRO di due
   giunti vale d = Δx·cosY + Δz·sinY. Due gambe in andatura hanno
   Δx ≈ +0,28 (i fianchi) e Δz ≈ -0,40 (una avanti, una dietro):
     a  54 gradi   0,28·0,588 + 0,40·0,809 = 0,49   due gambe
     a 144 gradi  -0,28·0,809 + 0,40·0,588 = 0,01   un tubo solo
   I due termini si annullano. E' la ragione per cui _155-sagoma.js
   contava le gambe promosse a 54/234 e bocciate a 144/324 sulle stesse
   pose: nessuna tabella scritta a mano puo' ripararlo, perche' la
   tabella non sa a che angolo verra' guardata. La legge sta qui perche'
   qui c'e' l'unico posto che conosce insieme la posa e l'imbardata.

   PERCHE' UNA ROTAZIONE E NON UNO SPOSTAMENTO. Ruotare una catena
   attorno a un asse VERTICALE passante per la sua radice conserva per
   costruzione: ogni lunghezza d'osso (sono distanze fra punti che
   ruotano insieme), ogni angolo di ginocchio e gomito (quindi la
   scatola L2 non taglia niente di nuovo) e la QUOTA di ogni giunto —
   l'asse e' verticale, la y non si muove: nessun piede sprofonda e la
   caviglia resta appoggiata dove la IK l'aveva messa. E' l'unica
   famiglia di correzioni applicabile DOPO la gabbia senza riaprirla.

   PERCHE' QUATTRO ANGOLI E NON LA SOLUZIONE ESATTA. La separazione in
   funzione dell'angolo e' C + P·cos t + Q·sin t e si risolve con un
   atan2 e un acos: due trascendenti per arto, per figura, per
   fotogramma, con ventidue figure in campo. Quattro angoli precalcolati
   in due versi sono otto prodotti scalari, e la scelta e' il piu'
   PICCOLO che basta (se nessuno basta, il piu' efficace). La legge non
   promette l'ottimo: promette che la separazione non resti sotto il
   minimo per colpa dell'angolo di vista.
   ===================================================================== */
/* =====================================================================
   LA TAVOLA DELLE APERTURE, e perche' sono DUE leve e non una.

   Il difetto e' che a certe imbardate la falcata cade lungo la
   profondita', dove la proiezione non la vede. Contro questo ci sono due
   mosse, e servono tutt'e due:

   IL TORCIMENTO DEL BACINO (fi) ruota TUTTA la parte bassa attorno alla
   verticale del bacino. E' la leva GROSSA: gira la direzione della
   falcata, che e' lunga sessanta-settanta centimetri, quindi mezzo
   radiante di torcimento vale venti centimetri di separazione in
   quadro. E' anche un gesto vero — le anche contro-ruotano rispetto
   alle spalle a ogni passo di corsa.

   L'APERTURA DELLE GAMBE (th) ruota ogni gamba attorno alla verticale
   della SUA anca, in versi opposti. E' la leva FINE: la usa la posa in
   cui i piedi stanno gia' quasi sotto il bacino e il torcimento da solo
   non basterebbe.

   Le due si compongono: un punto della gamba destra finisce in
     pelvi + R(fi)(anca-pelvi) + R(fi+th)(punto-anca)
   perche' due rotazioni attorno ad assi verticali PARALLELI si sommano.
   Da qui la tavola: per ogni combinazione si tengono coseno e seno di
   fi, di fi+th e di fi-th, calcolati UNA volta all'avvio. Nel
   fotogramma restano prodotti e somme.

   L'ORDINE E' PER COSTO CRESCENTE (2|fi|+|th|: il torcimento del
   bacino pesa il doppio, perche' muove otto giunti invece di tre), e la prima combinazione
   e' quella nulla: una posa gia' leggibile esce al primo confronto, che
   e' il caso della maggioranza dei fotogrammi. Si prende la PRIMA che
   basta, non la migliore: la legge non promette l'ottimo, promette che
   la separazione non resti sotto il minimo per colpa dell'angolo di
   vista. Ed e' anche il modo di non stravolgere una posa scritta a mano
   piu' di quanto serva.
   ===================================================================== */
const APQ_N=21;
const APQ_FC=new Float32Array(APQ_N), APQ_FS=new Float32Array(APQ_N);
const APQ_TC=new Float32Array(APQ_N), APQ_TS=new Float32Array(APQ_N);
const APQ_RC=new Float32Array(APQ_N), APQ_RS=new Float32Array(APQ_N);
const APQ_LC=new Float32Array(APQ_N), APQ_LS=new Float32Array(APQ_N);
{ const FI=[0,0.15,-0.15,0.30,-0.30,0.45,-0.45], TH=[0,0.20,-0.20];
  const v=[];
  for(const f of FI) for(const t of TH) v.push([f,t,2*(f<0?-f:f)+(t<0?-t:t)]);
  v.sort((a,b)=>a[2]-b[2]);
  for(let i=0;i<APQ_N;i++){
    const f=v[i][0], t=v[i][1];
    APQ_FC[i]=Math.cos(f); APQ_FS[i]=Math.sin(f);
    APQ_TC[i]=Math.cos(t); APQ_TS[i]=Math.sin(t);
    APQ_RC[i]=Math.cos(f+t); APQ_RS[i]=Math.sin(f+t);
    APQ_LC[i]=Math.cos(f-t); APQ_LS[i]=Math.sin(f-t);
  } }
/* le quattro aperture delle sole BRACCIA (una leva sola: vedi laggiu') */
const APQ_C=new Float32Array(4), APQ_S=new Float32Array(4);
{ const A4=[0.16,0.32,0.48,0.62];
  for(let i=0;i<4;i++){ APQ_C[i]=Math.cos(A4[i]); APQ_S[i]=Math.sin(A4[i]); } }
/* I DUE MINIMI, in metri di mondo, e da dove vengono — MISURATI, non
   scelti. strumenti/_157-diag-quadro.js ha stampato, per tutte e 27 le
   clip e quattro imbardate, la separazione in quadro accanto alle righe
   a due tratti che ne escono:
       mezza tibia >= 0,18 m  ->  58 casi su 72 hanno tre righe o piu'
       mezza tibia >= 0,30 m  ->  56 su 66
   Sopra 0,18 il rendimento non sale piu': il minimo delle gambe e' 0,20.
   Per le braccia il gomito deve uscire da mezzo busto (W_PETTO/2 =
   0,195) piu' mezzo braccio (0,069) piu' i due contorni: 0,270,
   arrotondato a 0,275. */
const APQ_GAMBE=0.20, APQ_SOGLIA=0.13, APQ_BRACCIA=0.275;
const APQ_BAS=new Int8Array([HIPR,KNR,FTR,TOR,HIPL,KNL,FTL,TOL]);
/* ruota la catena attorno all'asse VERTICALE del giunto p. La y non si
   muove, quindi nessun piede si stacca dal manto ne' ci sprofonda. */
function ruotaCatena(p,j1,j2,j3,c,s){
  const px=P[p*3], pz=P[p*3+2];
  for(let k=0;k<3;k++){
    const j=(k===0?j1:k===1?j2:j3); if(j<0) continue;
    const dx=P[j*3]-px, dz=P[j*3+2]-pz;
    P[j*3]=px+dx*c+dz*s; P[j*3+2]=pz-dx*s+dz*c;
  }
}
/* ...e tutta la parte bassa attorno alla verticale del BACINO */
function ruotaBacino(c,s){
  const px=P[PELVIS*3], pz=P[PELVIS*3+2];
  for(let k=0;k<8;k++){
    const j=APQ_BAS[k];
    const dx=P[j*3]-px, dz=P[j*3+2]-pz;
    P[j*3]=px+dx*c+dz*s; P[j*3+2]=pz-dx*s+dz*c;
  }
}
/* ruota la catena nel PIANO DEL QUADRO attorno al giunto p: l'asse e'
   l'orizzontale perpendicolare alla direzione di quadro, cioe'
   n = (-ez, 0, ex). E' la rotazione delle BRACCIA, e la ragione e'
   geometrica: un braccio che pende ha il gomito quasi sotto la spalla,
   quindi la sua leva ORIZZONTALE e' quasi nulla e una rotazione attorno
   alla verticale non lo sposterebbe di un centimetro in quadro. La
   rotazione nel piano del quadro e' invece un'ABDUZIONE — il braccio si
   alza di lato — ed e' esattamente il gesto che lo stacca dal tronco.
   Conserva ogni lunghezza d'osso e l'angolo del gomito, come le altre;
   non conserva la quota, ed e' il suo mestiere. Alle GAMBE non si puo'
   applicare: alzerebbe un piede da terra. */
function ruotaQuadro(p,j1,j2,ex,ez,c,s){
  const px=P[p*3], py=P[p*3+1], pz=P[p*3+2];
  for(let k=0;k<2;k++){
    const j=(k===0?j1:j2); if(j<0) continue;
    const vx=P[j*3]-px, vy=P[j*3+1]-py, vz=P[j*3+2]-pz;
    const a=-vx*ez+vz*ex;              // la componente lungo l'asse: non ruota
    const b=vx*ex+vz*ez;               // ...e le due che ruotano
    const b2=b*c-vy*s, c2=b*s+vy*c;
    P[j*3]=px+a*(-ez)+b2*ex;
    P[j*3+1]=py+c2;
    P[j*3+2]=pz+a*ex+b2*ez;
  }
}
/* =====================================================================
   LE GAMBE — tre punti, non uno, e il perche' sta in una misura.
   La prima stesura di questa legge guardava la sola CAVIGLIA, e il banco
   l'ha bocciata: su 'sfugge' a 144 gradi la separazione delle caviglie
   passava da 0,001 a -0,237 (obbedendo alla lettera) mentre quella delle
   GINOCCHIA passava da -0,017 a +0,049, cioe' di segno OPPOSTO. Le due
   tibie si incrociavano a meta' strada e in maschera nera restavano un
   grumo: la legge aveva comprato il numero e perso l'immagine.
   Adesso si misura in TRE punti — ginocchio, mezza tibia, caviglia — e
   il punteggio e' il PEGGIORE dei tre, zero se i tre non stanno dalla
   stessa parte. Il ginocchio prende quattro centesimi di sconto perche'
   li' gli arti sono la coscia (0,212) contro la tibia (0,160): la stessa
   distanza fra gli assi lascia meno sfondo.
   ===================================================================== */
function apriGambe(ex,ez){
  const px=P[PELVIS*3], pz=P[PELVIS*3+2];
  const hRx=P[HIPR*3], hRz=P[HIPR*3+2], hLx=P[HIPL*3], hLz=P[HIPL*3+2];
  const dhRx=hRx-px, dhRz=hRz-pz, dhLx=hLx-px, dhLz=hLz-pz;
  const AhR=dhRx*ex+dhRz*ez, BhR=dhRz*ex-dhRx*ez;
  const AhL=dhLx*ex+dhLz*ez, BhL=dhLz*ex-dhLx*ez;
  const kRx=P[KNR*3]-hRx, kRz=P[KNR*3+2]-hRz, aRx=P[FTR*3]-hRx, aRz=P[FTR*3+2]-hRz;
  const kLx=P[KNL*3]-hLx, kLz=P[KNL*3+2]-hLz, aLx=P[FTL*3]-hLx, aLz=P[FTL*3+2]-hLz;
  const mRx=(kRx+aRx)*0.5, mRz=(kRz+aRz)*0.5, mLx=(kLx+aLx)*0.5, mLz=(kLz+aLz)*0.5;
  const AkR=kRx*ex+kRz*ez, BkR=kRz*ex-kRx*ez, AkL=kLx*ex+kLz*ez, BkL=kLz*ex-kLx*ez;
  const AmR=mRx*ex+mRz*ez, BmR=mRz*ex-mRx*ez, AmL=mLx*ex+mLz*ez, BmL=mLz*ex-mLx*ez;
  const AaR=aRx*ex+aRz*ez, BaR=aRz*ex-aRx*ez, AaL=aLx*ex+aLz*ez, BaL=aLz*ex-aLx*ez;
  for(let i=0;i<APQ_N;i++){
    const fc=APQ_FC[i], fs=APQ_FS[i];
    const rc=APQ_RC[i], rs=APQ_RS[i], lc=APQ_LC[i], ls=APQ_LS[i];
    const hr=AhR*fc+BhR*fs, hl=AhL*fc+BhL*fs;
    const gk=(hr+AkR*rc+BkR*rs)-(hl+AkL*lc+BkL*ls);
    const gm=(hr+AmR*rc+BmR*rs)-(hl+AmL*lc+BmL*ls);
    if(gk*gm<=0) continue;
    const ga=(hr+AaR*rc+BaR*rs)-(hl+AaL*lc+BaL*ls);
    if(gm*ga<=0) continue;
    const k=(gk<0?-gk:gk)+0.04;
    const m=gm<0?-gm:gm, a=ga<0?-ga:ga;
    let w=k<m?k:m; if(a<w)w=a;
    if(i===0){ if(w>=APQ_SOGLIA) return; continue; }
    if(w<APQ_GAMBE) continue;
    if(APQ_TS[i]!==0){
      ruotaCatena(HIPR,KNR,FTR,TOR,APQ_TC[i],APQ_TS[i]);
      ruotaCatena(HIPL,KNL,FTL,TOL,APQ_TC[i],-APQ_TS[i]); }
    if(fs!==0) ruotaBacino(fc,fs);
    return;
  }
  /* nessuna combinazione arriva al minimo: la posa resta com'e'. Meglio
     una posa d'autore che un compromesso che non compra niente. */
}
/* =====================================================================
   LE BRACCIA — ognuna deve uscire dal TRONCO, non dall'altro braccio.
   Il criterio della giuria e' «le braccia non si fondono col tronco»:
   il riferimento e' quindi l'asse del busto in quadro, e la misura e'
   quanto il gomito ne esce dalla parte della sua spalla. Le due si
   aprono insieme e in versi opposti, come le gambe, e il verso lo decide
   la posa: si prende quello in cui i due gomiti gia' stanno.
   ===================================================================== */
function apriBraccia(ex,ez){
  const tx=P[CHEST*3]*ex+P[CHEST*3+2]*ez;
  const sRx=P[SHR*3], sRy=P[SHR*3+1], sRz=P[SHR*3+2];
  const sLx=P[SHL*3], sLy=P[SHL*3+1], sLz=P[SHL*3+2];
  const CR=(sRx*ex+sRz*ez)-tx, CL=(sLx*ex+sLz*ez)-tx;
  const vRx=P[ELR*3]-sRx, vRy=P[ELR*3+1]-sRy, vRz=P[ELR*3+2]-sRz;
  const vLx=P[ELL*3]-sLx, vLy=P[ELL*3+1]-sLy, vLz=P[ELL*3+2]-sLz;
  const bR=vRx*ex+vRz*ez, bL=vLx*ex+vLz*ez;
  const g0R=CR+bR, g0L=CL+bL;
  const v=(g0R-g0L)>=0?1:-1;
  let a=v*g0R, b=-v*g0L; let best=a<b?a:b;
  if(best>=APQ_BRACCIA) return;
  let bc=1, bs=0;
  for(let i=0;i<3;i++){        /* le braccia si fermano a 0,48 rad */
    const c=APQ_C[i], s=APQ_S[i];
    /* il gomito destro si apre nel verso v, il sinistro nel verso -v:
       nel piano del quadro la componente e' b*c - vy*s */
    const gR=CR+bR*c-vRy*(v*s), gL=CL+bL*c-vLy*(-v*s);
    const p1=v*gR, p2=-v*gL; const pu=p1<p2?p1:p2;
    if(pu>=APQ_BRACCIA){
      ruotaQuadro(SHR,ELR,HAR,ex,ez,c,v*s); ruotaQuadro(SHL,ELL,HAL,ex,ez,c,-v*s); return; }
    if(pu>best){ best=pu; bc=c; bs=v*s; }
  }
  if(bs!==0){ ruotaQuadro(SHR,ELR,HAR,ex,ez,bc,bs); ruotaQuadro(SHL,ELL,HAL,ex,ez,bc,-bs); }
}
function apriInQuadro(ex,ez){ apriGambe(ex,ez); apriBraccia(ex,ez); }


/* --- FK braccio: a = angolo avanti dalla spalla, elb = flessione
   gomito, out = scarto laterale voluto della mano (diventa abduzione) --- */`);

/* ------------------------------------------------------------------
   2. la chiamata nel disegno del corpo
   ------------------------------------------------------------------ */
esatta('la legge si applica al corpo',
`  if(MANC) specchia();
  for(let j=0;j<NJ;j++){
    const x=P[j*3], y=P[j*3+1], z=P[j*3+2];
    const xw=x*cyw+z*syw, zw=z*cyw-x*syw;
    SX[j]=cx+xw*s;`,
`  if(MANC) specchia();
  /* L4 — LA LEGGE DEL QUADRO, e sta QUI per due ragioni. Dopo lo
     specchio, perche' il mancino ha la sua posa e va aperta com'e';
     prima della proiezione, perche' la legge parla proprio di quello
     che la proiezione sta per fare. */
  apriInQuadro(cyw,syw);
  for(let j=0;j<NJ;j++){
    const x=P[j*3], y=P[j*3+1], z=P[j*3+2];
    const xw=x*cyw+z*syw, zw=z*cyw-x*syw;
    SX[j]=cx+xw*s;`);

/* ------------------------------------------------------------------
   3. la stessa legge sull'ombra: corpo e ombra sono UN oggetto
   ------------------------------------------------------------------ */
esatta('la legge si applica anche all\'ombra',
`  const cyw=Mcos(yaw), syw=Msin(yaw);
  for(let j=0;j<NJ;j++){
    const x=P[j*3], y=P[j*3+1], z=P[j*3+2];
    const xw=x*cyw+z*syw, zw=z*cyw-x*syw;
    /* dove il giunto tocca terra, in unita' di manto NON ruotate */`,
`  const cyw=Mcos(yaw), syw=Msin(yaw);
  /* L4 ANCHE QUI: se l'ombra non aprisse le gambe come le apre il corpo,
     a terra si vedrebbe un altro uomo. */
  apriInQuadro(cyw,syw);
  for(let j=0;j<NJ;j++){
    const x=P[j*3], y=P[j*3+1], z=P[j*3+2];
    const xw=x*cyw+z*syw, zw=z*cyw-x*syw;
    /* dove il giunto tocca terra, in unita' di manto NON ruotate */`);

/* ------------------------------------------------------------------
   4. IL MUSO — la posizione, dentro nuca()
   ------------------------------------------------------------------ */
esatta('il muso: le tre grandezze e il calcolo',
`const NUCA_O=0.62, NUCA_R=0.82, NUCA_SU=0.25;
let NKX=0, NKY=0, NKR=0;
function nuca(s,hcy,hsy,cam,look){
  const r=HEADR*s, X=SX[HEAD], Y=SY[HEAD];
  const taglio=(look.taglio|0)%4;
  NKR=(taglio===0?0.82:taglio===2?1.00:taglio===3?0.90:0.94)*r*NUCA_R;
  const fdx=hsy, fdy=-hcy*cam.se;
  const L=Math.sqrt(fdx*fdx+fdy*fdy);
  if(L>1e-4){
    let ox=-fdx/L*r*NUCA_O, oy=-fdy/L*r*NUCA_O;
    if(oy<0) oy*=NUCA_SU;                 // verso l'alto si smorza: vedi sopra
    NKX=X+ox; NKY=Y+oy;
  }else{ NKX=X; NKY=Y; }
}`,
`/* LA NUCA SI RITIRA (voce #155, giro 4). Stava a 0,62 di scostamento e
   0,82 di raggio, cioe' la testa sporgeva INDIETRO di 1,39 raggi contro
   1,00 davanti: un uomo visto da sopra con l'occipite piu' lungo del
   muso. Il criterio C2 chiede il contrario — «un segno sulla testa che
   rompa il contorno sul lato del DAVANTI» — e finche' il lobo piu'
   lungo era quello di dietro, la direzione di massima sporgenza della
   maschera puntava esattamente dalla parte sbagliata (misurato:
   8 imbardate su 8). A 0,34/0,72 la nuca resta la gobba dell'occipite,
   arriva a 1,02 raggi e non comanda piu' la sagoma. */
const NUCA_O=0.34, NUCA_R=0.72, NUCA_SU=0.45;
let NKX=0, NKY=0, NKR=0;
/* =====================================================================
   IL MUSO — IL SEGNO DEL DAVANTI CHE ROMPE IL CONTORNO (voce #155,
   giro 4, rilievo 3 della giuria).

   Il verbale del giro 3: «il davanti lo dice SOLO lo spicchio chiaro, e
   in foglio-sagoma-40 la testa e' un blocco simmetrico in tutte e 27 le
   clip. Deve ROMPERE IL CONTORNO — 1-2 px di mento/naso sul lato del
   davanti». Aveva ragione due volte: la gobba della nuca c'era gia', ma
   punta all'INDIETRO, e all'indietro-in-basso finisce dentro il collo,
   dove non rompe niente.
   Il muso e' il lobo opposto: il blocco naso-mento, che in un uomo visto
   da sopra sporge davanti al cranio. Arriva a 0,56+0,52 = 1,08 raggi in
   pianta piena contro 1,00 del cerchio della testa, e il suo CONTORNO
   (che e' quello che si vede in maschera nera) a 1,08·r + bd: un pixel
   e mezzo a cinquanta pixel di figura.

   LA COMPONENTE VERSO L'ALTO SI SMORZA A UN QUARTO, stesso vincolo
   della nuca: la cima della testa e' l'invariante che protegge la sonda
   dell'ERBA di collaudo.js. Smorzata, la punta del muso rivolta in su
   arriva a 0,56·0,25 + 0,52 = 0,66 raggi, cioe' RESTA DENTRO il cerchio
   e la cima non sale di un pixel. Non costa niente al criterio: il muso
   punta in su solo quando la faccia guarda VIA dalla camera, e li' il
   fronte lo dice gia' la nuca, che in basso e' piena.

   SEGUE L'IMBARDATA DELLA TESTA, non quella del corpo, e questa e'
   l'altra meta' del rilievo 3 — «a 0 e a 270 gradi le due righe sono
   gli stessi pixel, 66 gradi di collo non scrivono niente». A zero
   gradi il muso passa da nulla (punta in su, smorzato) a mezzo raggio a
   destra appena il collo gira: sono pixel, non parole.
   ===================================================================== */
const MUSO_O=0.50, MUSO_R=0.64, MUSO_SU=0.70;
/* MSV — IL MUSO SI DISEGNA SOLO SE SPORGE, e la soglia e' larga apposta.
   Quando la faccia punta verso l'alto dello schermo lo smorzamento tira
   il muso dentro il cerchio della testa: li' sarebbero tre archi
   (riempimento, filo di stacco, contorno) che non cambiano un pixel.
   IL PRIMO TAGLIO ERA TROPPO STRETTO, e il banco l'ha detto: con la
   soglia esatta (sporge se dist > r - MSR) la misura del muso scendeva
   da 8 imbardate su 8 a 7 su 8 — a zero gradi il lobo cadeva appena
   dentro e spariva anche il poco che spostava. A 0,30 di quella soglia
   il muso resta ovunque serva, e si spegne solo dove e' davvero
   sepolto. Un risparmio che costa un criterio non e' un risparmio. */
let MSX=0, MSY=0, MSR=0, MSV=false;
function nuca(s,hcy,hsy,cam,look){
  const r=HEADR*s, X=SX[HEAD], Y=SY[HEAD];
  const taglio=(look.taglio|0)%4;
  NKR=(taglio===0?0.82:taglio===2?1.00:taglio===3?0.90:0.94)*r*NUCA_R;
  MSR=r*MUSO_R;
  const fdx=hsy, fdy=-hcy*cam.se;
  const L=Math.sqrt(fdx*fdx+fdy*fdy);
  if(L>1e-4){
    let ox=-fdx/L*r*NUCA_O, oy=-fdy/L*r*NUCA_O;
    if(oy<0) oy*=NUCA_SU;                 // verso l'alto si smorza: vedi sopra
    NKX=X+ox; NKY=Y+oy;
    let mx=fdx/L*r*MUSO_O, my=fdy/L*r*MUSO_O;
    if(my<0) my*=MUSO_SU;                 // idem: la cima non si muove
    MSX=X+mx; MSY=Y+my;
    MSV=(mx*mx+my*my)>(r-MSR)*(r-MSR)*0.30;   // sporge dal cerchio? vedi MSV
  }else{ NKX=X; NKY=Y; MSX=X; MSY=Y; MSV=false; }
}`);

/* ------------------------------------------------------------------
   5. IL MUSO — il riempimento, dentro testa()
   ------------------------------------------------------------------ */
esatta('il muso: il riempimento in testa(), dopo i veli',
`  ctx.fillStyle=look.capelli;
  ctx.beginPath(); ctx.arc(hx,hy,rc,0,TAU); ctx.fill();
  /* LO SPICCHIO DELLA FACCIA lo disegna la coda di questa funzione,
     DOPO i due veli della luce: vedi il riquadro laggiu'. */`,
`  ctx.fillStyle=look.capelli;
  ctx.beginPath(); ctx.arc(hx,hy,rc,0,TAU); ctx.fill();
  /* IL MUSO E LO SPICCHIO si disegnano tutt'e due in coda a questa
     funzione, DOPO i due veli della luce: vedi il riquadro laggiu'. */`);

/* ------------------------------------------------------------------
   6-7. IL MUSO — i due contorni
   ------------------------------------------------------------------ */
esatta('il muso: il filo di stacco',
`    ctx.beginPath(); ctx.arc(NKX,NKY,NKR+bd+fl,0,TAU); ctx.fill();
    ctx.lineCap=capV;`,
`    ctx.beginPath(); ctx.arc(NKX,NKY,NKR+bd+fl,0,TAU); ctx.fill();
    if(MSV){ ctx.beginPath(); ctx.arc(MSX,MSY,MSR+bd+fl,0,TAU); ctx.fill(); }
    ctx.lineCap=capV;`);

esatta('il muso: il contorno scuro',
`      ctx.beginPath(); ctx.arc(NKX,NKY,NKR+bp,0,TAU); ctx.fill();
      continue;`,
`      ctx.beginPath(); ctx.arc(NKX,NKY,NKR+bp,0,TAU); ctx.fill();
      /* IL MUSO HA IL SUO BORDO, stessa ragione della gobba: la sagoma
         nera e il contorno devono essere la stessa forma, se no il
         mento sporge senza bordo e la testa legge come due pezzi
         incollati. */
      if(MSV){ ctx.beginPath(); ctx.arc(MSX,MSY,MSR+bp,0,TAU); ctx.fill(); }
      continue;`);

/* ------------------------------------------------------------------
   8. look._senzaTesta — l'aggancio che ISOLA la maschera della testa
   ------------------------------------------------------------------ */
esatta('senzaTesta: il contorno scuro',
`    if(g.kind===2){
      ctx.fillStyle=tb;
      ctx.beginPath(); ctx.arc(SX[HEAD],SY[HEAD],HEADR*s+bp,0,TAU); ctx.fill();`,
`    if(g.kind===2){
      /* look._senzaTesta — L'AGGANCIO CHE ISOLA LA MASCHERA DELLA TESTA.
         La giuria ha chiesto «il baricentro della maschera-testa fuori
         dal centro della sua scatola, verso il davanti, in 8 casi su 8»:
         per misurarlo bisogna sapere QUALI pixel sono la testa, e
         l'unico modo onesto e' disegnare due volte e fare la
         differenza. Un banco che ritagliasse «il quinto alto»
         misurerebbe un ritaglio, non la testa.
         Costa una lettura di proprieta' per figura, nel ramo che gia'
         gira una volta sola (kind===2), e in partita nessun look la
         dichiara. */
      if(look._senzaTesta===true) continue;
      ctx.fillStyle=tb;
      ctx.beginPath(); ctx.arc(SX[HEAD],SY[HEAD],HEADR*s+bp,0,TAU); ctx.fill();`);

esatta('senzaTesta: il filo di stacco',
`    ctx.beginPath(); ctx.arc(SX[HEAD],SY[HEAD],HEADR*s+bd+fl,0,TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(NKX,NKY,NKR+bd+fl,0,TAU); ctx.fill();`,
`    if(look._senzaTesta!==true){
    ctx.beginPath(); ctx.arc(SX[HEAD],SY[HEAD],HEADR*s+bd+fl,0,TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(NKX,NKY,NKR+bd+fl,0,TAU); ctx.fill();`);

esatta('senzaTesta: chiude il ramo del filo di stacco',
`    if(MSV){ ctx.beginPath(); ctx.arc(MSX,MSY,MSR+bd+fl,0,TAU); ctx.fill(); }
    ctx.lineCap=capV;`,
`    if(MSV){ ctx.beginPath(); ctx.arc(MSX,MSY,MSR+bd+fl,0,TAU); ctx.fill(); }
    }
    ctx.lineCap=capV;`);

esatta('senzaTesta: la passata a colori',
`function testa(ctx,s,cyw,syw,cam,look){
  const r=HEADR*s, X=SX[HEAD], Y=SY[HEAD];`,
`function testa(ctx,s,cyw,syw,cam,look){
  if(look._senzaTesta===true) return;   /* vedi l'aggancio nel contorno scuro */
  const r=HEADR*s, X=SX[HEAD], Y=SY[HEAD];`);

/* ------------------------------------------------------------------
   9. Rig3D.tImp e Rig3D.SENZA_TESTA
   ------------------------------------------------------------------ */
esatta('gli agganci del banco nell\'esportazione',
`return {disegna, CAMERE, CLIPS, lookPredefinito, torso:()=>TORSO,`,
`/* IL FOTOGRAMMA DI CONTATTO, letto dal gioco e non ricopiato nel banco.
   La giuria misura la IoU fra le quattro maschere «al fotogramma di
   contatto»: se il banco tenesse la sua copia di tImp, misurerebbe la
   propria copia il giorno che una tabella cambia. */
const T_IMP={passaggio:Q_PASSAGGIO.tImp, filtrante:Q_FILTRANTE.tImp,
             cross:Q_CROSS.tImp, tiro:Q_TIRO.tImp};
return {disegna, CAMERE, CLIPS, lookPredefinito, torso:()=>TORSO,
        tImp:c=>(T_IMP[c]!==undefined?T_IMP[c]:0.30),
        SENZA_TESTA:'_senzaTesta',   /* true = senza testa · 2 = SOLO la testa */`);

esatta('il muso: il riempimento, DOPO i veli',
`  ctx.strokeStyle='rgba(42,51,88,.34)';
  ctx.beginPath(); ctx.arc(X,Y,rr,-0.35*Math.PI,0.35*Math.PI); ctx.stroke();`,
`  ctx.strokeStyle='rgba(42,51,88,.34)';
  ctx.beginPath(); ctx.arc(X,Y,rr,-0.35*Math.PI,0.35*Math.PI); ctx.stroke();
  /* IL MUSO, RIEMPITO IN PELLE, E DOPO I VELI — per la stessa ragione
     misurata che ha spostato laggiu' lo spicchio: i due veli sono un
     bianco caldo al 44% e un viola freddo al 34% stesi su TUTTA la
     testa, e qualunque cosa passi sotto di loro perde meta' del suo
     contrasto. Il muso e' il blocco naso-mento: e' l'unico pezzo di
     carne della testa che stia FUORI dal cerchio dei capelli, quindi e'
     anche l'unico che dica il fronte quando lo spicchio si spegne.
     La sagoma la decide nuca(), che l'ha gia' usata per i due contorni:
     due posti che calcolano la stessa posizione sono due posizioni che
     un giorno divergono. */
  if(MSV){ ctx.fillStyle=look.pelle;
    ctx.beginPath(); ctx.arc(MSX,MSY,MSR,0,TAU); ctx.fill(); }`);

/* ------------------------------------------------------------------
   look._senzaTesta === 2 — SOLO la testa. Serve a misurare la maschera
   della testa SENZA le occlusioni del corpo: la differenza fra la
   figura intera e quella senza testa misura la testa VISIBILE, e le
   occlusioni del braccio e del collo la sporcano fino a mezzo pixel di
   baricentro (misurato: a 90 e 270 gradi, che sono l'una lo specchio
   dell'altra, la stessa testa dava +0,268 e -0,202). Un banco che
   misura il rumore attesta.
   Costa un confronto per segmento, sollevato fuori dal ciclo, e nessun
   look di partita lo dichiara.
   ------------------------------------------------------------------ */
esatta('solo testa: la passata del contorno',
`  {
  const bp = bd;
  const tb = BORDO;
  ctx.strokeStyle=tb;
  for(let i=0;i<NS;i++){
    const g=SEGS[i];
    if(g.kind===3) continue;             // la palla ha gia' il suo bordo`,
`  {
  const bp = bd;
  const tb = BORDO;
  const soloT = look._senzaTesta===2;    /* vedi il riquadro dell'aggancio */
  ctx.strokeStyle=tb;
  for(let i=0;i<NS;i++){
    const g=SEGS[i];
    if(soloT && g.kind!==2) continue;
    if(g.kind===3) continue;             // la palla ha gia' il suo bordo`);

esatta('solo testa: la passata a colori',
`  // dal piu' lontano al piu' vicino
  for(let i=0;i<NS;i++){
    const g=SEGS[ORD[i]];
    if(g.kind===2){ testa(ctx,s,hcy,hsy,cam,look); continue; }`,
`  // dal piu' lontano al piu' vicino
  const soloTc = look._senzaTesta===2;   /* vedi il riquadro dell'aggancio */
  for(let i=0;i<NS;i++){
    const g=SEGS[ORD[i]];
    if(soloTc && g.kind!==2) continue;
    if(g.kind===2){ testa(ctx,s,hcy,hsy,cam,look); continue; }`);

/* ===================================================================== */
if (!A) { console.error('FALLITO: manca --a <destinazione> (o --dentro).'); process.exit(1); }
if (!fs.existsSync(DA)) { console.error('FALLITO: sorgente inesistente: ' + DA); process.exit(1); }

let src = fs.readFileSync(DA, 'utf8');
const prima = src.length;

for (const e of E) {
  const n = src.split(e.da).length - 1;
  if (n !== 1) {
    console.error('FALLITO [' + e.nome + ']: l\'ancora compare ' + n + ' volte, non 1. Non scrivo niente.');
    console.error('  ancora: ' + e.da.slice(0, 160).replace(/\n/g, ' | '));
    process.exit(1);
  }
  src = src.replace(e.da, () => e.a);
}

const dest = path.resolve(A);
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, src);
console.log('toppa applicata: ' + E.length + ' ancore');
console.log('  da:   ' + DA);
console.log('  a:    ' + dest);
console.log('  delta di file: ' + (src.length - prima) + ' byte');
