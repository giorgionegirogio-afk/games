/* =====================================================================
   _t-teletrasporto.js — LE FIGURE SMETTONO DI TELETRASPORTARSI
   (29 agosto 2026, famiglia F1 del referto _analisi/ONDA-ANIMAZIONE.md).

   Toppa cerca/sostituisci a DIECI ancoraggi esatti. Legge --in (di serie
   CALCETTO-il-gioco.html) e scrive --out. Senza --dentro non tocca mai
   l'originale. Se un solo ancoraggio non compare ESATTAMENTE UNA VOLTA
   si ferma con codice 1, dice quale, e non scrive niente.

   PARENTELA DICHIARATA: le dieci sostituzioni sono quelle di
   strumenti/_t-fusione.js (20 agosto 2026), che era scritta e non
   innestata. Questo file la riprende per due motivi, e tutti e due sono
   numeri: (1) i suoi commenti — quelli che finiscono DENTRO il gioco —
   citavano misure del 20 agosto (0,424 m, 6,4x, 591 cambi, ~198
   sfarfallii) che sul gioco di oggi non sono piu' quelle, e in questa
   casa un commento che cita un numero deve citarne uno misurato oggi;
   (2) la giustificazione della velocita' levigata era «507 cambi con la
   sola isteresi», e quel numero oggi vale 453 — l'ho rimisurato invece
   di ricopiarlo.

   uso:
     node strumenti/_t-teletrasporto.js --out fuori/anim-prima.html
     node strumenti/_t-teletrasporto.js --in fuori/base.html --out x.html
     node strumenti/_t-teletrasporto.js --spenta --out x.html
            controllo negativo: l'isteresi resta, la fusione va a durata
            ZERO. Serve a dimostrare che il verde di V1 e V3 e' della
            FUSIONE e non della banda morta.
     node strumenti/_t-teletrasporto.js --elenco

   ---------------------------------------------------------------------
   IL FATTO, misurato OGGI (29 agosto 2026) con strumenti/_q-fusione.js
   sul fermo immagine fuori/anim-prima-base.html — 2.327.116 byte, md5
   cec3170c5ef264130025e61cba611913 — a 5 contro 5, 90 s, seme 20260820:

     salto del giunto peggiore fra due fotogrammi, in metri di schermo
       a clip INVARIATA ......... mediana 0,066 m   (n = 27.882)
       al CAMBIO di clip ........ mediana 0,422 m   (n =  1.089)   6,39x
     cambi camminata<->corsa per 90 s ............ 535
     salto mediano su quei cambi ................. 0,384 m
     sfarfallio del portiere attesa<->camminata .. 211 per 90 s

   La causa e' di una riga: rigStato restituisce una coppia (clip, u)
   SENZA memoria e Rig3D.disegna valuta UNA posa a UN istante. Quando la
   clip cambia il corpo si riscrive da capo in un sessantesimo di
   secondo, e il giunto peggiore attraversa mezzo metro.

   LE DUE MANOVRE, distinte e distintamente spegnibili.

   (a) L'ISTERESI DELLE ANDATURE, e la velocita' levigata che la rende
       utile. Le soglie secche 14 e 62 u/s diventano una porta a due
       battenti: si entra in corsa a 66 e se ne esce a 52, si entra in
       camminata a 18 e se ne esce a 10. Lo stato vive in p.rigAnda
       (solo disegno) e la prima lettura lo semina con le soglie
       VECCHIE, cosi' il primo fotogramma disegnato coincide con quello
       di ieri.
       LA BANDA MORTA DA SOLA NON BASTA, ed e' misurato oggi e non
       supposto: con l'isteresi montata sulla velocita' CRUDA i cambi
       per 90 s scendono da 535 a 453 soltanto — il rumore di velocita'
       dell'IA attraversa la banda comunque. Con la stessa isteresi
       montata sulla velocita' levigata a 0,25 s (p.vLisc) scendono a
       49. La fase del passo continua a leggere la v VERA: i piedi non
       slittano di un millimetro in piu' per colpa di questa riga.

   (b) LA FUSIONE FRA DUE POSE, IN DUE TEMPI. Quando la clip DISEGNATA
       cambia (LOD compreso: si giudica p.poseClip, cioe' cio' che
       drawPlayer ha davvero disegnato, non una seconda derivazione della
       regola che un giorno divergerebbe), per FUSIONE_T = 0,12 s il rig
       mescola la posa vecchia — congelata alla fase dell'ultimo
       fotogramma in cui fu disegnata — con la nuova, su una rampa
       levigata w*w*(3-2w).
       PRIMO TEMPO: la miscela convessa delle POSIZIONI dei diciotto
       giunti. E' l'unica che non possa mai mandare un piede sotto
       l'erba, ma ROMPE LE OSSA — la retta fra due posizioni di una
       caviglia non passa per il cerchio su cui la caviglia puo' stare.
       Misurato in partita, e non e' un dettaglio: sui 3.325 corpi fusi
       disegnati in 90 s a 5 contro 5, p90 **-44%**, p99 -64%, peggiore
       -72,7% (una tibia a un quarto della sua lunghezza).
       SECONDO TEMPO: la miscela viene IRRIGIDITA. Colonna, spalle,
       fianchi e braccia tornano esatti a catena; le due gambe si
       risolvono A DUE OSSA con il PIEDE PIANTATO dove la miscela l'ha
       messo, cosi' l'irrigidimento non puo' spingerlo sotto terra. Con
       la sola catena — provata e bocciata — 4.782 pose su 109.296
       finivano sotto il manto, p90 a 9,9 cm.
       Resta una guardia finale (se il giunto piu' basso bucherebbe
       comunque, torna la convessa) e resta il suo prezzo, dichiarato:
       su 109.296 pose fuse di prova, 76 — lo 0,070% — tengono un osso
       accorciato oltre il 25% perche' per quelle coppie ossa esatte e
       piedi sopra l'erba sono incompatibili. La cura sceglie i piedi.
       Il cronometro p.fondT si consuma in aggiornaPosa (nella
       SIMULAZIONE), mai nel disegno: un render ripetuto sullo stesso
       stato produce lo stesso fotogramma, che e' il patto di _posa.js.
       L'ombra di posa (drawOmbreGiocatori -> ombraTraccia) dichiara la
       STESSA fusione prima di gettare la posa a terra: corpo e ombra
       restano un oggetto solo.

   COSA NON FA, dichiarato: non fonde l'IMBARDATA (l'entrata in
   scivolata e in tuffo gira ancora il corpo in un fotogramma); non
   tocca la moviola (rilegge un ring di (clip,u) registrati, e li' il
   cambio resta secco); non tocca il duello dei rigori ne' il menu
   (nessuno dei due dichiara una fusione, quindi restano a posa pura per
   costruzione); non pianta il piede sull'erba — lo slittamento in corsa
   (72 mm mediani per fotogramma, misurato il 29 agosto 2026 da
   strumenti/_g-censo.js e riportato al § 5-F1 di ONDA-ANIMAZIONE.md, non
   da me) e' cinematica inversa ed e' fuori da questa onda: qui cade solo
   la sua discontinuita' al cambio di clip;
   strumenti/istantanea.js, che ridipinge le figure per farsi una
   maschera chiamando rigStato+Rig3D senza dichiarare la fusione, su un
   fotogramma congelato A META' TRANSIZIONE avra' la maschera scostata
   fino a meta' del salto per le sole figure in transizione.

   IL COSTO. La fusione paga UNA valutazione di posa in piu' per figura
   in transizione, per 0,12 s a cambio, per i due lettori (ombra e
   corpo). Non e' "il doppio": e' il doppio SOLO sulle figure che
   transitano, e quante siano si conta con strumenti/_g-fondute.js —
   scritto apposta, e il suo controllo negativo e' un gioco senza
   Rig3D.fondi, dove stampa zero. I numeri misurati stanno nella
   consegna, non qui.

   I CANCELLI. Due, e il secondo l'ho scritto perche' il primo non
   guardava le ossa.
   · strumenti/_q-fusione.js (nato ROSSO sul gioco di oggi) — il salto
     del giunto peggiore al cambio di clip, i cambi d'andatura, lo
     sfarfallio del portiere.
   · strumenti/_q-gabbia-fusa.js (scritto il 29 agosto) — la posa FUSA
     dentro la gabbia delle proporzioni del gioco. Ha il suo rosso
     dimostrato: con --bugiardo la miscela estrapola invece di
     interpolare e il cancello lo vede (osso +42,75%, 1.640 pose sotto
     il manto); su un gioco senza fusione si dichiara CIECO.

   Misurato il 29 agosto 2026, 5 contro 5, 90 s, seme 20260820:

     file                                    V1        V2    V3
     originale                             6,39x      535   0,384 m
     con questa toppa                      0,27x       49   0,008 m
     --spenta (isteresi si', fusione no)   9,30x       49   0,402 m
     isteresi sulla v cruda (variante)     1,47x      453   0,064 m

   La riga --spenta e' la ragione per cui questo file ha un controllo
   negativo: dimostra che V1 e V3 li sposta la FUSIONE, non la banda
   morta, e che chi mettesse solo l'isteresi si prenderebbe un verde su
   V2 e resterebbe rosso dove conta.

   Alle tre taglie, 90 s ciascuna, stesso seme:

     taglia          prima                    dopo
      5 contro 5    6,39x / 535 / 0,384 m    0,27x / 49 / 0,008 m
      7 contro 7    6,22x / 500 / 0,394 m    0,28x / 53 / 0,020 m
     11 contro 11   6,39x / 428 / 0,406 m    0,22x / 22 / 0,012 m
   e lo sfarfallio del portiere attesa<->camminata per 90 s:
     211 -> 9  ·  174 -> 5  ·  68 -> 5.
   L'appaiamento e' AL BIT: punteggio 0-2 e 90.997 sorteggi consumati,
   identici in tutti e quattro i file a pari seme.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;

/* --------------------------------------------------------------------
   GLI ANCORAGGI. Testo esatto cercato, testo esatto messo al suo posto.
   Nessuna espressione regolare, nessun numero di riga. Ogni "metti"
   contiene per intero il suo "cerca": quello che non sta nella stringa
   cercata non puo' stare in quella messa, o verrebbe AGGIUNTO invece
   che rimesso.
   -------------------------------------------------------------------- */
const ANCORE = [

/* 1 — lo scratch della seconda posa e la dichiarazione monouso, dentro Rig3D */
{
  nome: '1/10 Rig3D: lo scratch PFON e la dichiarazione fondi()',
  cerca:
`/* --- scratch riusati: MAI allocati nel frame --- */
const P  = new Float32Array(NJ*3);   // posa locale (x lato, y su, z avanti)
const SX = new Float32Array(NJ);     // proiezione schermo x`,
  metti:
`/* --- scratch riusati: MAI allocati nel frame --- */
const P  = new Float32Array(NJ*3);   // posa locale (x lato, y su, z avanti)
/* LA FUSIONE FRA DUE POSE (le figure non si teletrasportano piu' a ogni
   cambio di clip). PFON e' lo scratch della seconda posa: nasce QUI, una
   volta, mai nel fotogramma. FCLIP/FU/FW sono la dichiarazione MONOUSO
   del chiamante (Rig3D.fondi): la prossima valutazione di posa li
   consuma e li spegne, cosi' il duello, il menu e il banco — che non
   dichiarano niente — restano a posa pura per costruzione. */
const PFON = new Float32Array(NJ*3);
const PSAF = new Float32Array(NJ*3);
let FCLIP='', FU=0, FW=1;
function fondi(nomeClip,u,w){ FCLIP=nomeClip; FU=u; FW=w; }
const SX = new Float32Array(NJ);     // proiezione schermo x`,
},

/* 2 — posaFusa, definita davanti a disegna() */
{
  nome: '2/10 Rig3D: posaFusa davanti a disegna()',
  cerca:
`function disegna(ctx,cx,cy,hPx,yaw,nomeCam,nomeClip,tSec,look,senzaOmbra,pxs,filo){`,
  metti:
`/* =====================================================================
   LA MISCELA FRA DUE POSE, IN DUE TEMPI — e il secondo tempo non e' un
   ornamento, e' la riparazione di un difetto che il primo tempo crea.

   PRIMO TEMPO, la miscela convessa. Si mescolano le POSIZIONI dei
   diciotto giunti, peso FW: 0 = tutta la posa vecchia (congelata alla
   fase dell'ultimo fotogramma disegnato), 1 = tutta la nuova. PERCHE':
   rigStato cambia clip in un fotogramma secco e il giunto peggiore
   saltava di 0,422 m mediani in un sessantesimo, contro 0,066 a clip
   ferma — 6,39 volte tanto (misurato sui giunti DISEGNATI il 29 agosto
   2026, strumenti/_q-fusione.js, 5 contro 5, 90 s, seme 20260820,
   n=1.089 cambi contro 27.882 no).

   SECONDO TEMPO, e sta qui perche' e' stato MISURATO. La retta fra due
   posizioni di una caviglia non passa per il cerchio su cui la caviglia
   puo' stare: a meta' strada la tibia e' PIU' CORTA del vero. Non di
   qualche punto percentuale — misurato in partita sui 3.325 corpi fusi
   davvero disegnati in 90 s (strumenti/_g-fondute.js): mediana 0%, ma
   p90 **-44%**, p99 -64%, peggiore -72,7% (una tibia a un quarto della
   sua lunghezza, in una transizione tiro->corsa). Sulla griglia di tutte
   le 506 coppie di clip il peggiore e' -83,4%
   (strumenti/_q-gabbia-fusa.js). Un arto che si accartoccia per due
   fotogrammi e' un difetto grosso quanto il teletrasporto che stiamo
   togliendo. Percio' la miscela viene IRRIGIDITA: ogni osso torna alla
   sua lunghezza esatta lungo la direzione che la miscela gli ha dato.
   Il gioco riacquista la sua gabbia — la stessa che boccia un osso
   fuori misura di un centesimo — dentro la transizione.

   LE GAMBE NON SI TIRANO DALL'ANCA, SI RISOLVONO COL PIEDE FERMO, e
   questa e' la strada scelta dopo averne bocciate due COI NUMERI
   (misure del 29 agosto 2026, strumenti/_q-gabbia-fusa.js, 109.296 pose
   fuse su tutte e 506 le coppie di clip):
     · miscela convessa e basta ................ ossa: p99 -51%, peggio
       -83%; manto: mai bucato. Un arto accartocciato.
     · irrigidimento a catena anca->ginocchio->piede: ossa perfette
       (peggio -0,00%), ma 4.782 pose su 109.296 finiscono SOTTO il
       manto, p90 a 9,9 cm e la peggiore a 24 cm. Tirare la tibia
       spinge il piede in giu': e' aritmetica, non sfortuna.
     · irrigidimento a catena con la guardia «se buchi torna alla
       convessa»: manto mai bucato, ma la guardia scatta proprio sulle
       coppie peggiori e le ossa tornano a p99 -51%.
   Percio' le due gambe si risolvono a DUE OSSA con il piede PIANTATO
   dove la miscela l'ha messo (gambaIK): anca e piede restano quelli
   della miscela — quindi il piede non puo' scendere di un millimetro
   rispetto a una combinazione convessa, che e' l'unica cosa che il manto
   chiede — e il ginocchio si sposta sul cerchio che rende coscia e tibia
   esatte, dalla parte in cui la miscela lo teneva. Braccia, colonna,
   spalle e fianchi non toccano terra e bastano a catena.
   Resta comunque la GUARDIA finale: se malgrado tutto il giunto piu'
   basso finisse sotto il manto, si torna alla miscela convessa, che e'
   sempre lecita. Quanto scatti lo dice il cancello, non una speranza.

   FW si spegne alla fine, sempre: nessuna fusione sopravvive alla figura
   per cui era stata dichiarata. */
function ossoTeso(a,b,L){
  const A=a*3, B=b*3;
  const dx=P[B]-P[A], dy=P[B+1]-P[A+1], dz=P[B+2]-P[A+2];
  const d=Math.sqrt(dx*dx+dy*dy+dz*dz);
  if(d<1e-6) return;
  const k=L/d;
  P[B]=P[A]+dx*k; P[B+1]=P[A+1]+dy*k; P[B+2]=P[A+2]+dz*k;
}
/* spalle e fianchi non hanno un padre: si allargano attorno al loro
   punto di mezzo, cosi' il busto non slitta di lato */
function ossoSimm(a,b,L){
  const A=a*3, B=b*3;
  const dx=P[B]-P[A], dy=P[B+1]-P[A+1], dz=P[B+2]-P[A+2];
  const d=Math.sqrt(dx*dx+dy*dy+dz*dz);
  if(d<1e-6) return;
  const k=(L/d-1)*0.5, ex=dx*k, ey=dy*k, ez=dz*k;
  P[A]-=ex; P[A+1]-=ey; P[A+2]-=ez;
  P[B]+=ex; P[B+1]+=ey; P[B+2]+=ez;
}
/* LA GAMBA A DUE OSSA, col piede fermo. Anca e piede sono quelli della
   miscela; il ginocchio si mette dove coscia e tibia tornano esatte,
   sul lato in cui la miscela lo teneva (il polo e' la componente del
   ginocchio miscelato perpendicolare all'asse anca-piede). Il piede si
   tocca solo se la distanza anca-piede e' fuori dall'intervallo che due
   ossa possono coprire — e in quel caso si AVVICINA all'anca, cioe' sale,
   mai scende. */
function gambaIK(hip,kn,ft,a,b){
  const H=hip*3, K=kn*3, F=ft*3;
  let ax=P[F]-P[H], ay=P[F+1]-P[H+1], az=P[F+2]-P[H+2];
  let d=Math.sqrt(ax*ax+ay*ay+az*az);
  if(d<1e-6){ ax=0; ay=-1; az=0; d=1; }
  const dmin=(a>b?a-b:b-a)+1e-4, dmax=a+b-1e-4;
  if(d<dmin || d>dmax){
    const k=(d<dmin?dmin:dmax)/d;
    ax*=k; ay*=k; az*=k; d*=k;
    P[F]=P[H]+ax; P[F+1]=P[H+1]+ay; P[F+2]=P[H+2]+az;
  }
  const ux=ax/d, uy=ay/d, uz=az/d;
  const kx=P[K]-P[H], ky=P[K+1]-P[H+1], kz=P[K+2]-P[H+2];
  const pr=kx*ux+ky*uy+kz*uz;
  let qx=kx-pr*ux, qy=ky-pr*uy, qz=kz-pr*uz;
  let pl=Math.sqrt(qx*qx+qy*qy+qz*qz);
  if(pl<1e-6){ qx=0; qy=0; qz=1; pl=1; }   // ginocchio in linea: si piega avanti
  const t=(d*d+a*a-b*b)/(2*d);
  let hh=a*a-t*t; hh = hh>0 ? Math.sqrt(hh)/pl : 0;
  P[K]=P[H]+ux*t+qx*hh; P[K+1]=P[H+1]+uy*t+qy*hh; P[K+2]=P[H+2]+uz*t+qz*hh;
}
function irrigidisci(){
  let y0=1e9; for(let j=0;j<NJ;j++){ const y=P[j*3+1]; if(y<y0) y0=y; }
  PSAF.set(P);
  /* la colonna e' DRITTA per costruzione nella gabbia del gioco: busto
     0,40 = pelvi-torace 0,295 + torace-collo 0,105. Si ricostruisce
     cosi', o irrigidire i due tronconi separati piegherebbe la schiena
     e romperebbe il busto. */
  const px=P[PELVIS*3], py=P[PELVIS*3+1], pz=P[PELVIS*3+2];
  let dx=P[NECK*3]-px, dy=P[NECK*3+1]-py, dz=P[NECK*3+2]-pz;
  const d=Math.sqrt(dx*dx+dy*dy+dz*dz);
  if(d>1e-6){
    const k=0.40/d; dx*=k; dy*=k; dz*=k;
    P[NECK*3]=px+dx; P[NECK*3+1]=py+dy; P[NECK*3+2]=pz+dz;
    P[CHEST*3]=px+dx*0.7375; P[CHEST*3+1]=py+dy*0.7375; P[CHEST*3+2]=pz+dz*0.7375;
  }
  ossoTeso(NECK,HEAD,0.25);
  ossoSimm(SHL,SHR,2*SHW);
  ossoSimm(HIPL,HIPR,2*HIPW);
  ossoTeso(SHL,ELL,UA);  ossoTeso(ELL,HAL,FA);
  ossoTeso(SHR,ELR,UA);  ossoTeso(ELR,HAR,FA);
  gambaIK(HIPL,KNL,FTL,THIGH,SHIN); ossoTeso(FTL,TOL,FOOT);
  gambaIK(HIPR,KNR,FTR,THIGH,SHIN); ossoTeso(FTR,TOR,FOOT);
  let y1=1e9; for(let j=0;j<NJ;j++){ const y=P[j*3+1]; if(y<y1) y1=y; }
  /* -0,05 non e' un numero scelto qui: e' FONDO di strumenti/gabbia.js,
     la tolleranza con cui il repo giudica da sempre le pose SORGENTI.
     La posa fusa non ha diritto a piu' tolleranza di quelle, e se una
     delle due partiva gia' piu' in basso vale quella. */
  if(y1 < (y0<-0.05?y0:-0.05)) P.set(PSAF);   // il piede bucherebbe: torna la convessa
}
function posaFusa(clip,u){
  clip.pose(u);
  if(FW<1){
    const c2=CLIPS[FCLIP];
    if(c2){
      PFON.set(P);                       // la posa NUOVA appena valutata
      let u2=FU%1; if(u2<0)u2+=1;
      c2.pose(u2);                       // la posa VECCHIA, congelata
      const w=FW;
      for(let k=0;k<NJ*3;k++) P[k]+=(PFON[k]-P[k])*w;
      irrigidisci();
    }
  }
  FW=1;
}
function disegna(ctx,cx,cy,hPx,yaw,nomeCam,nomeClip,tSec,look,senzaOmbra,pxs,filo){`,
},

/* 3 — disegna() valuta la posa eventualmente fusa */
{
  nome: '3/10 disegna(): clip.pose(u) diventa posaFusa(clip,u)',
  cerca:
`  clip.pose(u);
  for(let j=0;j<NJ;j++){
    const x=P[j*3], y=P[j*3+1], z=P[j*3+2];
    const xw=x*cyw+z*syw, zw=z*cyw-x*syw;
    SX[j]=cx+xw*s;`,
  metti:
`  posaFusa(clip,u);   /* la posa, eventualmente fusa con la precedente (vedi fondi) */
  for(let j=0;j<NJ;j++){
    const x=P[j*3], y=P[j*3+1], z=P[j*3+2];
    const xw=x*cyw+z*syw, zw=z*cyw-x*syw;
    SX[j]=cx+xw*s;`,
},

/* 4 — l'ombra di posa getta la stessa posa fusa del corpo */
{
  nome: '4/10 ombraTraccia(): clip.pose(u) diventa posaFusa(clip,u)',
  cerca:
`  let u=(tSec*clip.freq)%1; if(u<0)u+=1;
  clip.pose(u);
  const cam=CAMERE.alto;`,
  metti:
`  let u=(tSec*clip.freq)%1; if(u<0)u+=1;
  posaFusa(clip,u);   /* stessa fusione del corpo: l'ombra getta la posa che si disegnera' */
  const cam=CAMERE.alto;`,
},

/* 5 — l'esportazione di fondi */
{
  nome: '5/10 Rig3D esporta fondi',
  cerca:
`return {disegna, CAMERE, CLIPS, lookPredefinito, torso:()=>TORSO,
        giunti:()=>GIUNTI, ombraTraccia,`,
  metti:
`return {disegna, CAMERE, CLIPS, lookPredefinito, torso:()=>TORSO,
        giunti:()=>GIUNTI, ombraTraccia, fondi,`,
},

/* 6 — il cronometro della fusione e la velocita' levigata, nella SIMULAZIONE */
{
  nome: '6/10 aggiornaPosa: p.fondT e p.vLisc coi latch del rig',
  cerca:
`  if(p.frenaT>0) p.frenaT-=dt;
  if(p.fintaT>0) p.fintaT-=dt;`,
  metti:
`  if(p.frenaT>0) p.frenaT-=dt;
  /* il cronometro della fusione di posa si consuma QUI, nella
     simulazione, mai nel disegno: un render ripetuto sullo stesso stato
     deve produrre lo stesso fotogramma (e' il patto di _posa.js). */
  if(p.fondT>0) p.fondT-=dt;
  /* LA VELOCITA' LEVIGATA (0,25 s) PER LA SCELTA DELL'ANDATURA, e senza
     di lei l'isteresi non serve quasi a niente. La velocita' istantanea
     dell'IA balla su e giu' per tutta la banda a ogni urto e correzione
     di rotta: misurato il 29 agosto 2026 (_q-fusione.js, 5 contro 5,
     90 s, seme 20260820), la sola banda morta 66/52 montata sulla v
     CRUDA porta i cambi camminata<->corsa da 535 a 453 per 90 s —
     l'82% del difetto resta. La stessa banda morta montata su questa
     media mobile li porta a 49.
     La fase del passo continua a leggere la v VERA — i piedi non
     slittano di un millimetro in piu' — e la fisica non legge mai
     questo campo: e' memoria di solo disegno. */
  p.vLisc = (p.vLisc===undefined ? v : p.vLisc + (v-p.vLisc)*Math.min(1, dt/0.25));
  if(p.fintaT>0) p.fintaT-=dt;`,
},

/* 7 — FUSIONE_T e rigFusione, accanto alle costanti dell'adattatore */
{
  nome: '7/10 rigFusione e FUSIONE_T accanto a FRENA_T',
  cerca:
`const FRENA_T = 0.5;       // latch della frenata (cosmetico)`,
  metti:
`const FRENA_T = 0.5;       // latch della frenata (cosmetico)
/* =====================================================================
   LA FUSIONE FRA CLIP — il cambio di posa smette di essere un fotogramma
   secco. PERCHE': misurato sui giunti disegnati il 29 agosto 2026
   (_q-fusione.js, 5 contro 5, 90 s, seme 20260820), il giunto peggiore
   saltava di 0,422 m mediani in 1/60 s a ogni cambio di clip, contro
   0,066 a clip ferma: 6,39 volte tanto, su 1.089 cambi in novanta
   secondi. Qui si arma la transizione: la clip vecchia e la sua fase
   CONGELATE al momento del cambio, un cronometro p.fondT che
   aggiornaPosa consuma. Il cambio si riconosce sulla POSA DISEGNATA
   (p.poseClip, scritta da drawPlayer alla fine di ogni figura), LOD
   compreso: si giudica cio' che va sullo schermo, non una seconda
   derivazione della regola che potrebbe divergere. Armare e' idempotente
   nel fotogramma: l'ombra arma per prima, il corpo riarma con gli stessi
   identici valori perche' p.poseClip non e' ancora stato riscritto.
   Solo disegno: la fisica non legge nessuno di questi campi, e a pari
   seme punteggio e conto dei sorteggi restano identici al bit. */
const FUSIONE_T = 0.12;    // durata della transizione fra due clip (s)
function rigFusione(p, st){
  if(p.poseClip && st.clip!==p.poseClip && Rig3D.CLIPS[p.poseClip]){
    p.fondClip=p.poseClip; p.fondU=p.poseU||0; p.fondT=FUSIONE_T;
  }
  if(!(p.fondT>0) || !p.fondClip || p.fondClip===st.clip) return;
  let w=1-p.fondT/FUSIONE_T;
  if(w<0)w=0; else if(w>=1)return;
  w=w*w*(3-2*w);           // rampa levigata: parte piano, arriva piano
  Rig3D.fondi(p.fondClip, p.fondU, w);
}`,
},

/* 8 — l'isteresi delle andature al posto delle soglie secche */
{
  nome: '8/10 rigStato: isteresi delle andature',
  cerca:
`  st.clip = v<14 ? (gk?'attesaGK':'fermo') : v<62 ? 'camminata' : 'corsa';`,
  metti:
`  /* L'ISTERESI DELLE ANDATURE. PERCHE': le soglie secche a 14 e 62 u/s
     facevano sfarfallare la clip sul rumore di velocita' dell'IA —
     misurato il 29 agosto 2026, 535 cambi camminata<->corsa per 90 s e
     211 sfarfallii del portiere attesa<->camminata (_q-fusione.js, 5
     contro 5, seme 20260820). Una soglia per ENTRARE e una piu' bassa
     per USCIRE: corsa a 66, se ne esce a 52; camminata a 18, se ne esce
     a 10. p.rigAnda e' memoria di solo disegno (la fisica non la legge
     mai) e la prima lettura la semina con le soglie VECCHIE, cosi' il
     primo fotogramma coincide con quello di ieri.
     LA SOGLIA LEGGE LA VELOCITA' LEVIGATA (p.vLisc, aggiornata in
     aggiornaPosa dove vive il dt) e non quella vera, e non e' un
     dettaglio: montata sulla v cruda la stessa banda morta lascia 453
     cambi su 535, cioe' non cura niente (misurato). L'andatura e' una
     decisione sul mezzo secondo; la fase del passo, che invece deve
     inchiodare i piedi all'erba, continua a leggere la v vera.
     Idempotente nel fotogramma: a parita' di vg una seconda lettura
     (l'ombra legge prima del corpo) non muove piu' lo stato. */
  const vg = p.vLisc===undefined ? v : p.vLisc;
  let anda = p.rigAnda===undefined ? (vg<14?0 : vg<62?1 : 2) : p.rigAnda;
  if(anda===2){ if(vg<52) anda=(vg<10?0:1); }
  else if(anda===1){ if(vg>=66) anda=2; else if(vg<10) anda=0; }
  else { if(vg>=66) anda=2; else if(vg>=18) anda=1; }
  p.rigAnda=anda;
  st.clip = anda===0 ? (gk?'attesaGK':'fermo') : anda===1 ? 'camminata' : 'corsa';`,
},

/* 9 — l'ombra di posa dichiara la fusione prima di gettarla */
{
  nome: '9/10 drawOmbreGiocatori: la fusione dichiarata prima dell\'ombra',
  cerca:
`      p.lodPosa=false;
      const st=rigStato(p), lk=rigLook(p);
      fatta=Rig3D.ombraTraccia(ctx, X, Y,`,
  metti:
`      p.lodPosa=false;
      const st=rigStato(p), lk=rigLook(p);
      /* la stessa fusione del corpo, dichiarata PRIMA dell'ombra:
         l'ombra getta la posa che il corpo disegnera' fra poche righe,
         fusione compresa — corpo e ombra restano UN oggetto */
      rigFusione(p, st);
      fatta=Rig3D.ombraTraccia(ctx, X, Y,`,
},

/* 10 — drawPlayer arma e dichiara la fusione, DOPO la sostituzione LOD */
{
  nome: '10/10 drawPlayer: rigFusione dopo la sostituzione LOD',
  cerca:
`    if(lod){
      st.clip = gk ? 'attesaGK' : 'fermo';
      st.u = (0.041*(p.idx+11*p.team)+0.13)%1;
    }`,
  metti:
`    if(lod){
      st.clip = gk ? 'attesaGK' : 'fermo';
      st.u = (0.041*(p.idx+11*p.team)+0.13)%1;
    }
    /* LA FUSIONE FRA CLIP: se la posa disegnata sta cambiando rispetto
       all'ultimo fotogramma, per FUSIONE_T secondi il rig mescola la
       vecchia (congelata) con la nuova. Sta DOPO la sostituzione LOD:
       il cambio si giudica su cio' che si disegna davvero, quindi anche
       l'entrata e l'uscita dal dettaglio ridotto smettono di scattare.
       Una figura lontana paga la doppia posa solo per gli 0,12 s della
       sua transizione, poi torna alla posa fissa che il LOD paga oggi. */
    rigFusione(p, st);`,
},

];

/* il controllo negativo: la fusione a durata ZERO, l'isteresi resta */
const SPENTA = {
  cerca: `const FUSIONE_T = 0.12;    // durata della transizione fra due clip (s)`,
  metti: `const FUSIONE_T = 0;       // CONTROLLO NEGATIVO: fusione spenta (--spenta)`,
};

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-teletrasporto.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.teletrasporto.html';
outFile = path.resolve(outFile);
if (!dentro && outFile === inFile) {
  console.error('FALLITO: --out coincide con --in. Senza --dentro non si scrive sull\'originale.');
  process.exit(2);
}

const src = fs.readFileSync(inFile, 'utf8');
let out = src;
const mancanti = [];
for (const a of ANCORE) {
  const n = out.split(a.cerca).length - 1;
  if (n !== 1) { mancanti.push({ nome: a.nome, n, a }); continue; }
  out = out.replace(a.cerca, a.metti);
}
if (mancanti.length) {
  console.error('FALLITO: ancoraggi che non compaiono esattamente una volta — niente e\' stato scritto.');
  for (const m of mancanti) {
    console.error(`  · ${m.nome}: trovato ${m.n} volte`);
    console.error('    testo cercato:\n' + m.a.cerca.split('\n').map(r => '      ' + r).join('\n'));
  }
  process.exit(1);
}
if (haFlag('spenta')) {
  const n = out.split(SPENTA.cerca).length - 1;
  if (n !== 1) { console.error('FALLITO: --spenta non trova la costante da azzerare (' + n + ' volte).'); process.exit(1); }
  out = out.replace(SPENTA.cerca, SPENTA.metti);
}

/* I CONTROLLI DOPO LA SOSTITUZIONE. Non bastano gli ancoraggi: una
   sostituzione puo' riuscire e mettere la cosa giusta nel posto
   sbagliato. Qui si conta quante volte ogni definizione e ogni chiamata
   compaiono nel file uscito, e si pretende il numero esatto. */
const attesi = [
  ['function posaFusa(', 1],
  ['posaFusa(clip,u);', 2],
  ['function irrigidisci(', 1],
  ['irrigidisci();', 1],
  ['function ossoTeso(', 1],
  ['function ossoSimm(', 1],
  ['function gambaIK(', 1],
  ['const PSAF = new Float32Array(NJ*3);', 1],
  ['function fondi(', 1],
  ['ombraTraccia, fondi,', 1],
  ['function rigFusione(', 1],
  ['rigFusione(p, st);', 2],
  ['p.fondT-=dt;', 1],
  ['p.vLisc = (p.vLisc===undefined', 1],
  ['p.rigAnda=anda;', 1],
  ['const FUSIONE_T = ', 1],
  ['v<14 ? (gk?\'attesaGK\':\'fermo\') : v<62 ?', 0],  // la soglia secca non deve piu' esistere
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => `${s} atteso ${n}, trovato ${out.split(s).length - 1}`);
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

/* LA LEGGE SUI SORTEGGI, controllata a testo: nessuna delle dieci
   sostituzioni puo' introdurre una chiamata a dado(). Il conto delle
   occorrenze nel file deve restare identico. */
const dadoPrima = (src.match(/\bdado\s*\(/g) || []).length;
const dadoDopo = (out.match(/\bdado\s*\(/g) || []).length;
if (dadoPrima !== dadoDopo) {
  console.error(`FALLITO: chiamate a dado() ${dadoPrima} -> ${dadoDopo}. La legge sui sorteggi non ammette differenze.`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log(`OK  ${ANCORE.length} ancoraggi applicati` + (haFlag('spenta') ? ' + fusione SPENTA (controllo negativo)' : ''));
console.log(`    dado() nel testo: ${dadoPrima} prima, ${dadoDopo} dopo — invariato`);
console.log(`    da   ${inFile}  (${src.length} byte)`);
console.log(`    a    ${outFile}  (${out.length} byte, ${out.length - src.length >= 0 ? '+' : ''}${out.length - src.length})`);
