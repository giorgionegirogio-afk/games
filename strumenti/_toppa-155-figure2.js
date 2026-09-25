/* =====================================================================
   _toppa-155-figure2.js — LE FIGURE, GIRO 2: PESO, MUSO, STATURA, VERBO.

   Applica in un colpo solo le riparazioni che la giuria della voce #155
   ha chiesto dopo il giro 1, ognuna ancorata a una stringa che nel gioco
   compare UNA volta sola. Se un'ancora manca o compare due volte non
   scrive niente: una toppa che indovina dove mettere le mani non e' una
   toppa.

   LE OTTO RIPARAZIONI, nell'ordine dei rilievi:

   1  C4 — L'OMBRA NEL RAMO GIUSTO. Il giro 1 aveva rifatto l'ombra
      dentro Rig3D.disegna, ramo `!senzaOmbra`, che in partita non gira
      mai (drawPlayer passa senzaOmbra=true). Qui il peso entra dove
      l'ombra si disegna davvero — drawOmbreGiocatori — e ci entra come
      QUOTA MISURATA: Rig3D.quotaAria legge, da una tabella calcolata al
      caricamento sulle pose vere, quanto il corpo si stacca dal manto a
      ogni fase di ogni clip. In aria l'ombra si allontana, rimpicciolisce,
      SI SFOCA (il tratto si allarga) e la macchia di contatto sparisce;
      a terra tornano tutte e quattro.
   2  C4 — la botta del tuffo ara il manto come gia' la scivolata e
      l'arresto: solchi:1, stessa tabella, nessun secondo sistema.
   3  C7 — arresto, scivolata e contrasto smettono di spendere meta'
      clip in una posa ferma: ognuna ha adesso una CHIUSURA (l'uomo si
      rialza / raccoglie la gamba / recupera il passo) nell'ultimo
      quarto, dove prima c'era una rampa che finiva a due terzi.
   4  C1 — passaggio e filtrante non sono piu' lo stesso disegno: il
      filtrante e' il passaggio CHE NON GUARDA (testa e petto altrove,
      bilanciere BASSO invece che alto).
   5  C2 — la testa ha una NUCA: la calotta dei capelli si sposta
      all'indietro di una frazione COSTANTE del raggio, non piu' di una
      che si annulla quando la faccia guarda via. Da dietro il cranio
      smette di essere un disco simmetrico. E la testa si IMBARDA per
      conto suo: in partita guarda il pallone anche quando il petto va
      da un'altra parte.
   6  C1/C5 — la scarpa prende un valore suo (100 di luminanza) invece
      di essere la seconda macchia chiara della figura accanto al pallone.
   7  C6 — la statura si compra scendendo: 9% di scarto fra lo
      spilungone e il piccoletto invece dell'1,7% misurato al giro 1.
   8  C3 — la base ha un PAVIMENTO (nessun piede dentro la verticale
      del bacino, in nessuna posa in piedi) e le gambe si assottigliano
      quel tanto che apre il pertugio fra i due polpacci.

   NON TOCCA LA SIMULAZIONE. Nessuna delle righe qui sotto e' letta da
   updateBall, da aiDecide o da un sorteggio: si verifica con
   `node strumenti/_c3-sorteggi.js` e `node strumenti/_q-duello-impronta.js`.

   USO:
     node strumenti/_toppa-155-figure2.js --a fuori/155-g2.html
     node strumenti/_toppa-155-figure2.js --dentro
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const DA = path.join(RADICE, 'CALCETTO-il-gioco.html');
const iA = process.argv.indexOf('--a');
const DENTRO = process.argv.includes('--dentro');
const A = DENTRO ? DA : (iA > 0 ? process.argv[iA + 1] : '');

/* ===================================================================== */
const E = [];
const esatta = (nome, da, a) => E.push({ nome, da, a });

/* --------------------------------------------------------------- 7 ---
   LE CORPORATURE: la statura si compra scendendo. */
esatta('CORPI — statura',
`  /* 0 spilungone */ {g:1.00, b:1.06, sp:0.80, sh:0.94, hr:0.88, st:1.018, pa:1.10, cd:0.93},
  /* 1 tarchiato  */ {g:1.00, b:0.96, sp:1.26, sh:1.10, hr:1.00, st:0.984, pa:0.94, cd:1.07},
  /* 2 piccoletto */ {g:1.00, b:0.95, sp:1.04, sh:0.97, hr:1.18, st:0.962, pa:0.88, cd:1.13},`,
`  /* LA STATURA SI COMPRA SCENDENDO, E ADESSO SI COMPRA SUL SERIO
     (voce #155, giro 2). MISURATO DAL GIRO 1: la cima della testa
     disegnata usciva 1,785 / 1,747 / 1,739 / 1,775 m, cioe' l'1,7% di
     scarto sulla maschera nera a cinquanta pixel — MENO del 3,4% che
     c'era prima che le corporature esistessero, perche' il raggio della
     testa (hr 1,18 al piccoletto) rialzava proprio chi doveva leggere
     basso. Il tetto resta quello dichiarato sopra: nessuno sale, la
     differenza si compra SCENDENDO.
     Il numero si compra sul piccoletto: 0,962 -> 0,865 di statura.
     PRIMA STESURA A 0,902 E RETTIFICA MISURATA: dava 54..58 px sulla
     maschera nera di prova-corpi-50, cioe' il 6,9% — meglio dell'1,7%
     ma sotto l'8% che la giuria ha scritto come bersaglio. A 0,865 la
     stessa misura da' il numero che sta nel verbale accanto a questo:
     e' quello che vale, non il conto a mente.
     Le altre tre colonne si allargano nello stesso verso: lo spilungone
     piu' sottile di arti (sp 0,78) e piu' largo di spalle in rapporto
     (sh 0,96), il piccoletto piu' tozzo (sp 1,08) e piu' stretto
     (sh 0,95). A cinquanta pixel il RAPPORTO si legge prima della
     statura, e i due devono dire la stessa cosa. */
  /* 0 spilungone */ {g:1.00, b:1.06, sp:0.78, sh:0.96, hr:0.88, st:1.018, pa:1.14, cd:0.90},
  /* 1 tarchiato  */ {g:1.00, b:0.96, sp:1.30, sh:1.12, hr:1.02, st:0.955, pa:0.94, cd:1.07},
  /* 2 piccoletto */ {g:1.00, b:0.95, sp:1.08, sh:0.95, hr:1.20, st:0.865, pa:0.86, cd:1.18},`);

/* --------------------------------------------------------------- 6 ---
   LA SCARPA: un valore suo. */
esatta('scarpe — il valore',
`      scarpe:mt(c2,'#0b0d12',0.14) || '#15181a',`,
`      /* LA SCARPA HA UN VALORE SUO (voce #155, giro 2), e il giro 1
         l'aveva mandata troppo in su. A 0,14 la scarpa esce a 146 di
         luminanza: SOPRA i calzoncini (116) e a sessantasei punti dalle
         calze (212). Nel fotogramma del contatto piede-palla la scarpa
         pallida e il pallone bianco erano due macchie chiare accostate,
         e il gesto leggeva PEGGIO di quando la scarpa era quasi nera —
         perche' allora almeno diceva QUALE piede colpiva.
         A 0,44 esce a 100: sotto i calzoncini, lontano dalle calze,
         lontanissima dal pallone, e senza tornare l'estremo scuro della
         figura (su parecchie divise i capelli stanno piu' giu'). */
      scarpe:mt(c2,'#0b0d12',0.44) || '#15181a',`);

/* --------------------------------------------------------------- 6b --
   LA MAGLIA SI SCHIARISCE, E SI PAGA UN DEBITO CHE NON E' DI OGGI.
   MISURATO (collaudo.js, nove partite, stesso seme): il rapporto
   maglia/erba di P1 in vista normale era 3,15 prima della voce #155,
   3,06 dopo il giro 1 e 2,98 con le corporature di questo giro — sotto
   il minimo di 3:1, cioe' un cancello rosso. La statura del piccoletto
   e i fianchi piu' larghi spostano di qualche unita' la finestra fissa
   che la sonda campiona sul torso, e li' trovano un filo di calzoncino
   scuro in piu'.
   Si ripaga dove il debito e' nato: la maglia. mt(c1,'#fff6e4',0,08) ->
   0,22 schiarisce il tessuto verso il bianco caldo, cioe' verso la
   stessa tinta con cui le calze sono gia' schiarite (e alla stessa
   frazione: da oggi maglia e calze sono lo stesso valore, e le tre
   masse del criterio C5 restano tre perche' a dividerle sono i
   CALZONCINI scuri in mezzo, non una terza sfumatura di chiaro).
   IL NUMERO E' STATO CERCATO IN DUE PASSATE: a 0,15 il rapporto
   risaliva a 3,00 esatti, cioe' sul minimo, e un cancello che passa per
   zero centesimi non e' un cancello passato. A 0,22 il margine c'e'. NON tocca la
   gerarchia del valore del criterio C5 — il piu' scuro e il piu' chiaro
   della figura restano della DIVISA — e allontana la maglia dall'erba
   invece di avvicinarla al pallone (il pallone e' bianco puro: la
   maglia arriva al 15% della strada).
   Il numero che vale e' quello che collaudo.js stampa dopo, e sta nel
   verbale accanto a questo. */
esatta('maglia — il rapporto con erba',
`      maglia:mt(c1,'#fff6e4',0.08) || c1, maglia2:c2,`,
`      maglia:mt(c1,'#fff6e4',0.22) || c1, maglia2:c2,`);

/* --------------------------------------------------------------- 8 ---
   LE GAMBE: un pavimento alla base, e il pertugio fra i polpacci. */
/* I FIANCHI SONO STATI PROVATI A 0,128 E RIMESSI A 0,105 (voce #155,
   giro 2). L'idea era giusta sulla carta — a 0,105 i due giunti d'anca
   distano 0,21 m mentre la coscia e' larga 0,24, cioe' le due cosce si
   sovrappongono alla radice — e comprava qualcosa sul banco della
   sagoma (righe del terzo basso con due tratti, 51/108 -> 55/108).
   L'ha bocciata silhouette.js: con i fianchi larghi la CORSA perde la
   strozzatura in vita (masse 2 -> 1) e il TIRO scende sotto lo scavo
   minimo (0,332 -> 0,325), e il cancello passa da 8 azioni nominabili a
   6. Il pertugio fra le gambe si compra altrove — gambe piu' sottili e
   basi piu' larghe, qui sotto — e i fianchi restano dove sono.
   Provata, misurata, rimessa: la riga resta scritta perche' il prossimo
   che ci pensa non rifaccia la prova da capo. */

esatta('coscia destra',
`  {a:HIPR,b:KNR, w:0.240,c:'pantaloncini', bias:0.002, kind:0, arti:1, cos:1},`,
`  {a:HIPR,b:KNR, w:0.212,c:'pantaloncini', bias:0.002, kind:0, arti:1, cos:1},`);
esatta('coscia sinistra',
`  {a:HIPL,b:KNL, w:0.240,c:'pantaloncini', bias:0.002, kind:0, arti:1, cos:1},`,
`  /* LE GAMBE SI ASSOTTIGLIANO DI UN DECIMO (voce #155, giro 2). Il
     commento qui sopra diceva «assottigliarle costerebbe la lettura da
     vicino senza comprare niente in sagoma»: era una previsione, e
     adesso c'e' la misura che la rettifica. Coscia 0,240 -> 0,212 e
     polpaccio 0,176 -> 0,160: insieme al pavimento della base e alle
     basi piu' larghe portano le righe del terzo basso con due tratti da
     51/108 a 59/108 e le strozzature medie da 0,91 a 1,13
     (strumenti/_155-sagoma.js, 27 clip x 4 imbardate, maschera nera a
     40 px), e su silhouette.js fanno passare il TIRO, che stava a un
     millesimo dallo scavo minimo. In pixel di riempimento su una figura
     alta quaranta la coscia passa da 6,9 a 6,1 e il polpaccio da 5,1 a
     4,6: molto sopra i due pixel pieni che sono il pavimento, e sopra
     le larghezze che nel 2026 erano state giudicate «fili». */
  {a:HIPL,b:KNL, w:0.212,c:'pantaloncini', bias:0.002, kind:0, arti:1, cos:1},`);
esatta('polpaccio destro',
`  {a:KNR, b:FTR, w:0.176,c:'calze',        bias:0.004, kind:0, riv:1, arti:1},`,
`  {a:KNR, b:FTR, w:0.160,c:'calze',        bias:0.004, kind:0, riv:1, arti:1},`);
esatta('polpaccio sinistro',
`  {a:KNL, b:FTL, w:0.176,c:'calze',        bias:0.004, kind:0, riv:1, arti:1},`,
`  {a:KNL, b:FTL, w:0.160,c:'calze',        bias:0.004, kind:0, riv:1, arti:1},`);

esatta('gamba — il pavimento della base',
`function gamba(hip,kn,ft,toe, hx,hy,hz, a,knee, fx){
  hy+=DPQ;                                   // la corporatura alza o abbassa l'anca`,
`function gamba(hip,kn,ft,toe, hx,hy,hz, a,knee, fx){
  /* =================================================================
     IL PAVIMENTO DELLA BASE (voce #155, giro 2). «Le due gambe mai dallo
     stesso punto» era una regola scritta nei commenti delle andature e
     rispettata da una posa su tre: ventisette pose scritte a mano in
     due anni, e il piede che finisce sulla verticale del bacino e'
     esattamente l'errore che nessuno rilegge.
     Qui la regola diventa una LEGGE della gabbia, come la lunghezza
     dell'osso e la scatola degli angoli: in una posa IN PIEDI (bacino
     sopra 0,70 m) il piede non sta dentro 0,150 m dall'asse, e se la
     posa lo chiede viene portato fuori dal lato della SUA anca.
     TRE COSE CHE NON FA, e sono i tre modi di sbagliarla:
       - non tocca le pose a terra (scivolata, tuffo, rovesciata,
         ginocchia): li' il bacino sta sotto 0,70 e un piede «aperto»
         sarebbe una gamba che sfonda il manto;
       - non raddrizza le gambe INCROCIATE: il cross porta il piede a
         -0,195 attraverso il corpo, cioe' gia' fuori dai 0,150, e resta
         dov'e'. Si muove solo chi sta DENTRO la soglia;
       - non tocca la lunghezza di niente: fx e' un bersaglio laterale
         che gamba() converte in apertura d'anca, e l'apertura ha gia'
         il suo tetto (AP_MAX). Un piede portato a 0,150 chiede
         sin(apertura) = (0,150+0,128)/0,91 = 0,305 contro un tetto di
         0,751: nessun taglio nuovo. */
  if(hy>0.70){ const mn=0.150; if(fx>-mn && fx<mn) fx = hx>=0 ? mn : -mn; }
  hy+=DPQ;                                   // la corporatura alza o abbassa l'anca`);

/* --------------------------------------------------------------- 5 ---
   LA NUCA E L'IMBARDATA DELLA TESTA. */
esatta('nuca — lo stato e la funzione',
`function testa(ctx,s,cyw,syw,cam,look){`,
`/* =====================================================================
   LA NUCA — IL SEGNO CHE DICE DOVE GUARDA E SOPRAVVIVE A SOGLIA SPENTA.

   IL DIFETTO, MISURATO (giuria voce #155, prova-muso.png): a 0, 45 e 315
   gradi d'imbardata il cranio era un disco bruno uniforme e il fronte si
   indovinava solo dalla posa di corsa. La causa stava in una riga sola:
   lo scostamento della calotta dei capelli valeva
       o = r*0,60*(dot+1)*0,5
   cioe' si ANNULLAVA proprio quando la faccia guarda via dalla camera —
   il caso in cui la calotta e' l'unico indizio rimasto, perche' lo
   spicchio della pelle li' non c'e'.

   ADESSO LO SCOSTAMENTO E' COSTANTE: 0,62 del raggio, sempre, nella
   direzione della NUCA (l'opposto della faccia proiettata). La testa
   smette di essere un cerchio e diventa un uovo lungo 1,44 raggi da una
   parte e 1,00 dall'altra — che e' anche la forma vera di una testa
   vista dall'alto, piu' lunga davanti-dietro che da orecchio a orecchio.
   Il contorno scuro e il filo di stacco seguono la stessa sagoma, se no
   la gobba uscirebbe senza bordo.

   LA COMPONENTE VERSO L'ALTO SI SMORZA A UN QUARTO, e non e' timidezza:
   la cima della testa e' l'invariante che protegge la sonda dell'ERBA di
   collaudo.js (vedi il riquadro di HEADR). Con 0,25 di smorzamento la
   gobba, quando punta in su, arriva a 0,155+0,82 = 0,975 raggi, cioe'
   RESTA DENTRO il cerchio della testa: la cima non sale di un pixel.
   E non costa niente al criterio, perche' la gobba punta in alto solo
   quando la faccia punta alla camera — e li' il fronte lo dice gia' lo
   spicchio della pelle.
   ===================================================================== */
const NUCA_O=0.62, NUCA_R=0.82, NUCA_SU=0.25;
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
}

function testa(ctx,s,cyw,syw,cam,look){`);

esatta('testa — la calotta alla nuca',
`  let o=r*0.60*(dot+1)*0.5; if(o>0.5*r)o=0.5*r;
  let hx=X, hy=Y-r*0.10;
  if(L>1e-4){ hx=X-fdx/L*o; hy=Y-fdy/L*o-r*0.10; }`,
`  /* LA CALOTTA STA ALLA NUCA, e dove sia l'ha gia' deciso nuca(): il
     contorno scuro e il filo di stacco l'hanno usata prima di qui, e due
     posti che calcolano la stessa posizione sono due posizioni che un
     giorno divergono. */
  const hx=NKX, hy=NKY;
  const o=Math.sqrt((hx-X)*(hx-X)+(hy-Y)*(hy-Y));`);

esatta('testa — il raggio della calotta',
`  const taglio = (look.taglio|0)%4;
  const rc = taglio===0 ? r*0.82 : taglio===2 ? r*1.00 : taglio===3 ? r*0.90 : r*0.94;`,
`  const taglio = (look.taglio|0)%4;
  const rc = NKR;   /* lo decide nuca(), col taglio dentro: vedi lassu' */`);

/* --------------------------------------------------------------- 5b ---
   L'IMBARDATA DELLA TESTA: stato, dichiarazione monouso, consumo. */
esatta('HYAW — lo stato',
`let MANC=false;
function specchia(){ for(let j=0;j<NJ;j++) P[j*3]=-P[j*3]; }`,
`let MANC=false;
/* =====================================================================
   DOVE GUARDA LA TESTA, quando non guarda dove va il petto (voce #155).
   Il criterio C2 chiede che «petto e testa raccontino due cose diverse
   quando il giocatore corre guardandosi indietro», e fino a ieri non
   potevano: la faccia si disegnava sull'imbardata del CORPO, una sola
   per tutta la figura.
   Due sorgenti, e nessuna delle due e' una variabile globale che
   sopravvive alla figura:
     HYAWQ  la dichiarazione MONOUSO del chiamante (Rig3D.guarda), la
            stessa forma di Rig3D.fondi: la prossima disegna() la
            consuma e la spegne, quindi il banco, il menu e il duello —
            che non dichiarano niente — restano a testa dritta per
            costruzione;
     HYAWP  quella della POSA (imbardaTesta), azzerata prima di ogni
            valutazione: e' con questa che il filtrante guarda altrove.
   Si sommano, e il mancino le specchia entrambe insieme alla posa.
   Ruota SOLO IL DISEGNO della testa (la calotta, lo spicchio, il volto):
   il giunto HEAD non si sposta di un millimetro, quindi il collo resta
   lungo quanto e' lungo e la gabbia non ha niente da misurare. */
let HYAWQ=0, HYAWP=0;
const HYAW_MAX=1.15;                 // il collo non gira oltre sessantasei gradi
function guarda(rad){ HYAWQ=(rad>HYAW_MAX?HYAW_MAX:rad<-HYAW_MAX?-HYAW_MAX:rad)||0; }
function imbardaTesta(rad){ HYAWP=(rad>HYAW_MAX?HYAW_MAX:rad<-HYAW_MAX?-HYAW_MAX:rad)||0; }
function specchia(){ for(let j=0;j<NJ;j++) P[j*3]=-P[j*3]; }`);

esatta('disegna — azzera l\'imbardata della posa',
`  posaFusa(clip,u);   /* la posa, eventualmente fusa con la precedente (vedi fondi) */`,
`  HYAWP=0;            /* l'imbardata della testa la dichiara la posa, se la vuole */
  posaFusa(clip,u);   /* la posa, eventualmente fusa con la precedente (vedi fondi) */`);

esatta('disegna — l\'imbardata della testa',
`  TORSO.x0=SX[PELVIS]; TORSO.y0=SY[PELVIS]; TORSO.x1=SX[NECK]; TORSO.y1=SY[NECK];`,
`  /* L'IMBARDATA DELLA TESTA, consumata qui e spenta subito: da questa
     riga in giu' il cranio ha un suo fronte, che puo' non essere quello
     del petto. Il mancino la specchia come specchia la posa. */
  const hyw=yaw+(HYAWQ+HYAWP)*mg; HYAWQ=0; HYAWP=0;
  const hcy=Mcos(hyw), hsy=Msin(hyw);
  nuca(s,hcy,hsy,cam,look);
  TORSO.x0=SX[PELVIS]; TORSO.y0=SY[PELVIS]; TORSO.x1=SX[NECK]; TORSO.y1=SY[NECK];`);

esatta('filo — la nuca',
`    ctx.beginPath(); ctx.arc(SX[HEAD],SY[HEAD],HEADR*s+bd+fl,0,TAU); ctx.fill();`,
`    ctx.beginPath(); ctx.arc(SX[HEAD],SY[HEAD],HEADR*s+bd+fl,0,TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(NKX,NKY,NKR+bd+fl,0,TAU); ctx.fill();`);

esatta('contorno — la nuca',
`      ctx.fillStyle=tb;
      ctx.beginPath(); ctx.arc(SX[HEAD],SY[HEAD],HEADR*s+bp,0,TAU); ctx.fill();
      continue;`,
`      ctx.fillStyle=tb;
      ctx.beginPath(); ctx.arc(SX[HEAD],SY[HEAD],HEADR*s+bp,0,TAU); ctx.fill();
      /* LA GOBBA DELL'OCCIPITE HA IL SUO BORDO. Senza questa riga la
         calotta dei capelli sporgerebbe dal perimetro scuro e la testa
         leggerebbe come due pezzi incollati: la sagoma nera e il
         contorno devono essere la stessa forma. */
      ctx.beginPath(); ctx.arc(NKX,NKY,NKR+bp,0,TAU); ctx.fill();
      continue;`);

esatta('testa — la faccia sull\'imbardata della testa',
`    if(g.kind===2){ testa(ctx,s,cyw,syw,cam,look); continue; }`,
`    if(g.kind===2){ testa(ctx,s,hcy,hsy,cam,look); continue; }`);

/* --------------------------------------------------------------- 1 ---
   LA QUOTA D'ARIA: misurata sulle pose, non dichiarata a mano. */
esatta('quotaAria — la tabella',
`/* ============================================================
   CAMERE preimpostate (elevazione E dal piano orizzontale)
   ============================================================ */`,
`/* =====================================================================
   LA QUOTA D'ARIA — QUANTO IL CORPO SI STACCA DAL MANTO, MISURATO.

   PERCHE' ESISTE (criterio C4, voce #155). L'ombra in pianta sapeva
   staccarsi solo per il salto dell'esultanza (p.celeb) e per il
   saliscendi della falcata (p.bob). Un portiere a mezz'aria in un tuffo
   non alza nessuno dei due, e sotto di lui restava lo stesso dischetto
   verde di quando sta fermo: «l'ombra e' la stessa ellisse in tutti e
   tre gli stati» era la frase della giuria, ed era vera.

   COME SI MISURA, e non si dichiara. Al caricamento, una volta, ogni
   clip viene valutata a sedici fasi e si prende la QUOTA DEL GIUNTO PIU'
   BASSO: se anche il piu' basso e' sopra il suolo, il corpo e' in aria
   di quella misura. Non e' una tabella scritta a mano che un giorno
   diverge dalla posa; e' la posa, riletta. Sedici numeri per clip,
   ventisette clip: 432 valutazioni di posa al caricamento, UNA VOLTA, e
   a fotogramma una interpolazione lineare fra due caselle di un
   Float32Array. Il costo del caricamento non e' stato cronometrato a
   parte e non si dichiara: quello che si dichiara e' il costo a
   fotogramma, che prestazione.js misura col freno 4x.

   IL PAVIMENTO E' 0,19 m, e il numero e' stato MISURATO e poi alzato.
   Prima stesura a 0,06: la caviglia appoggiata sta a PIEDE_Y = 0,045 e
   la punta a PUNTA_Y = 0,012, quindi bastava quello per dire «a terra».
   Sbagliato, e il banco l'ha detto: a 0,06 la CORSA misura fino a 0,076
   di stacco e la CAMMINATA 0,082 — la fase aerea della falcata — e
   l'ombra di ogni giocatore in movimento cominciava a schiarirsi e ad
   allargarsi a ogni passo. Quella oscillazione l'ombra ce l'ha gia',
   e si chiama p.bob: contarla due volte fa respirare tutte le ombre del
   campo insieme, che e' un difetto, non un pregio (misurato su
   istantanea.js: +0,9% di luce al centro del quadro, su una misura che
   ha 0,1% di margine).
   A 0,19 restano dentro solo i veri stacchi da terra, e si contano:
   rovesciata 0,42 m, tuffo 0,31, pugno 0,06, presa 0,02; camminata,
   corsa, contrasto, scivolata e tutte le pose in piedi danno zero.
   Il numero e' lo stacco massimo della camminata (0,082) piu' il doppio
   del suo, arrotondato: sopra non c'e' falcata che arrivi.

   NON LA LEGGE NESSUNO DELLA SIMULAZIONE: la consuma drawOmbreGiocatori
   e basta. ===================================================================== */
const ARIA_FASI=16, ARIA_SUOLO=0.19;
const ARIA={};
function quotaAria(nomeClip,tSec){
  const t=ARIA[nomeClip]; if(!t) return 0;
  const cl=CLIPS[nomeClip];
  let u=(tSec*cl.freq*(cl.ciclo?CAD:1))%1; if(u<0)u+=1;
  const f=u*ARIA_FASI, i=f|0, w=f-i;
  const a=t[i%ARIA_FASI], b=t[(i+1)%ARIA_FASI];
  return a+(b-a)*w;
}
(function costruisciAria(){
  for(const k in CLIPS){
    const t=new Float32Array(ARIA_FASI);
    for(let i=0;i<ARIA_FASI;i++){
      CLIPS[k].pose(i/ARIA_FASI);
      let mn=1e9;
      for(let j=0;j<NJ;j++){ const y=P[j*3+1]; if(y<mn)mn=y; }
      t[i]= mn>ARIA_SUOLO ? mn-ARIA_SUOLO : 0;
    }
    ARIA[k]=t;
  }
})();

/* ============================================================
   CAMERE preimpostate (elevazione E dal piano orizzontale)
   ============================================================ */`);

esatta('Rig3D — l\'uscita',
`return {disegna, CAMERE, CLIPS, lookPredefinito, torso:()=>TORSO,
        giunti:()=>GIUNTI, ombraTraccia, fondi, mescolaTinta,`,
`return {disegna, CAMERE, CLIPS, lookPredefinito, torso:()=>TORSO,
        giunti:()=>GIUNTI, ombraTraccia, fondi, mescolaTinta,
        /* la quota d'aria (C4) e l'imbardata della testa (C2): le due
           dichiarazioni che il disegno di fuori fa al rig */
        quotaAria, guarda,`);

/* --------------------------------------------------------------- 2 ---
   La botta del tuffo ara il manto. */
esatta('tuffo — i solchi della botta',
`  tuffo:     {freq:0.45,pose:poseTuffo,     palla:pallaTuffo, polvere:{t:0.645,d:0.20}},`,
`  /* LA BOTTA DEL TUFFO ARA IL MANTO (voce #155, criterio C4): il
     portiere atterra di fianco e scivola, come chi fa una scivolata.
     Stessa tabella e stesso disegno dei solchi dell'arresto e della
     scivolata — non un secondo sistema. E' l'unica meta' di C4 che il
     giro 1 aveva portato dove si vede davvero. */
  tuffo:     {freq:0.45,pose:poseTuffo,     palla:pallaTuffo, polvere:{t:0.645,d:0.20,solchi:1}},`);

/* --------------------------------------------------------------- 4 ---
   IL FILTRANTE E' IL PASSAGGIO CHE NON GUARDA. */
esatta('poseCalcio — la testa altrove',
`  const lean=(q.leanCar!==undefined?q.leanCar:-q.leanBack)*w1+q.leanFwd*w2;
  corpo(pelvY,0,lean,-0.012*peso);`,
`  const lean=(q.leanCar!==undefined?q.leanCar:-q.leanBack)*w1+q.leanFwd*w2;
  corpo(pelvY,0,lean,-0.012*peso);
  /* LA TESTA CHE NON GUARDA (voce #155, criterio C1). Passaggio e
     filtrante erano lo STESSO DISEGNO a fermo immagine — la giuria:
     «coperto il nome non c'e' un pixel che le separi» — perche' si
     distinguevano per tImp/swing/back/fwd, cioe' per la TEMPISTICA, che
     in un fotogramma non esiste. q.guarda separa la meta' ALTA: il
     filtrante e' il passaggio di chi guarda da un'altra parte, e la
     nuca lo dice anche in maschera nera. Chi non dichiara guarda resta
     esattamente com'era. */
  if(q.guarda) imbardaTesta(q.guarda*(w1+0.6*w2));`);

esatta('Q_PASSAGGIO / Q_FILTRANTE',
`const Q_PASSAGGIO={tImp:0.44,swing:0.13,segue:0.22, back:0.55,fwd:0.55,follow:1.00,
  kneeBack:0.85,kneeImp:0.18,kneeSegue:0.45, crouch:0.11,dip:0.05,
  leanBack:0.05,leanFwd:0.06, apriSp:0.12,apriAn:0.06, arm:0.45,armOut:0.05,armApri:0.09,
  aprCar:0.12, appA:0.28,appK:0.30, px:0.10,pz:0.34, gitt:2.8,alza:0,arco:0,dirX:0};`,
`/* armOut 0,05 -> 0,11 (voce #155, giro 2): a cinque centesimi il gomito
   cadeva a 0,295 m dall'asse contro 0,156 di mezzo busto piu' mezzo
   braccio, cioe' il braccio spariva dentro la massa centrale — la
   seconda regola della silhouette, scritta nei commenti delle andature e
   non rispettata qui. Il tetto lo mette la scatola degli angoli sul
   braccio sinistro (armOut + armApri*0,85*w2 + 0,04*w1 <= 0,222 con le
   braccia corte del piccoletto): 0,11 + 0,068 + 0,04 = 0,218, zero
   tagli. */
const Q_PASSAGGIO={tImp:0.44,swing:0.13,segue:0.22, back:0.55,fwd:0.55,follow:1.00,
  kneeBack:0.85,kneeImp:0.18,kneeSegue:0.45, crouch:0.11,dip:0.05,
  leanBack:0.05,leanFwd:0.06, apriSp:0.12,apriAn:0.06, arm:0.45,armOut:0.11,armApri:0.08,
  aprCar:0.12, appA:0.28,appK:0.30, px:0.10,pz:0.34, gitt:2.8,alza:0,arco:0,dirX:0};`);

esatta('Q_FILTRANTE — il passaggio che non guarda',
`const Q_FILTRANTE={tImp:0.36,swing:0.09,segue:0.18, back:0.75,fwd:0.65,follow:1.20,
  kneeBack:1.05,kneeImp:0.12,kneeSegue:0.40, crouch:0.10,dip:0.06,
  leanBack:0.08,leanFwd:0.34, apriSp:0.16,apriAn:0.08, arm:0.65,armOut:0.06,armApri:0.13,
  armSu:0.55, aprCar:0.16, appA:0.30,appK:0.38, px:0.10,pz:0.36, gitt:4.0,alza:0,arco:0,dirX:0};`,
`/* IL FILTRANTE E' IL PASSAGGIO CHE NON GUARDA (voce #155, giro 2).
   Il giro 1 gli aveva dato il bilanciere ALTO (armSu 0,55) e il busto
   avanti, cioe' gli stessi indizi del tiro e del cross; la giuria l'ha
   misurato: «celle 6 e 7, coperto il nome non c'e' un pixel che le
   separi». Qui la separazione sta nella META' ALTA, che e' l'unico posto
   dove due calci con la stessa gamba possono differire:
     guarda -0,95   la testa si volta dalla parte OPPOSTA al passaggio.
                    E' il no-look, ed e' anche il gesto vero: chi serve
                    un filtrante guarda altrove per non dire dove va.
     armSu 0,55 -> 0   il bilanciere non sale piu': resta BASSO, e la
                    sagoma non cresce verso l'alto come quella del tiro.
     apriSp 0,16 -> 0,52   il petto si apre di tre quarti: in pianta la
                    linea delle spalle ruota, e la coppia si separa
                    anche in maschera nera.
     armOut 0,06 -> 0,16, armApri 0,13 -> 0,02   il braccio d'equilibrio
                    esce dal busto ma non si spalanca (il tetto della
                    scatola sul sinistro: 0,16+0,017+0,04 = 0,217). */
const Q_FILTRANTE={tImp:0.36,swing:0.09,segue:0.18, back:0.75,fwd:0.65,follow:1.20,
  kneeBack:1.05,kneeImp:0.12,kneeSegue:0.40, crouch:0.10,dip:0.06,
  leanBack:0.08,leanFwd:0.34, apriSp:0.52,apriAn:0.08, arm:0.65,armOut:0.16,armApri:0.02,
  guarda:-0.95, aprCar:0.16, appA:0.30,appK:0.38, px:0.10,pz:0.36, gitt:4.0,alza:0,arco:0,dirX:0};`);

/* --------------------------------------------------------------- 3 ---
   LE TRE CHIUSURE. */
esatta('poseFrenata — la chiusura',
`  const chiude=sm(u,0.34,0.86);                   // la gamba che raccoglie`,
`  const chiude=sm(u,0.30,0.72);                   // la gamba che raccoglie
  /* LA CHIUSURA (voce #155, criterio C7). MISURATO: dal 9/16 al 16/16
     otto fotogrammi indistinguibili — la differenza simmetrica fra due
     maschere consecutive scendeva a 0,006 contro una mediana di 0,089
     (strumenti/_155-fotogrammi.js). Tutte le rampe finivano entro 0,86 e
     l'ultimo quarto della clip era un uomo accovacciato che non si
     rialzava. Adesso c'e': `+"`rialza`"+` porta il bacino su, il busto
     verticale e le braccia giu', cioe' il terzo tempo che un arresto ha
     sempre avuto nella realta' e mai qui. */
  const rialza=sm(u,0.70,0.99);`);

esatta('poseFrenata — il bacino e il busto della chiusura',
`  const crouch=0.24+0.03*osc+0.150*affondo;`,
`  const crouch=0.24+0.03*osc+0.150*affondo-0.19*rialza;`);
esatta('poseFrenata — il busto si raddrizza',
`  const lean=-0.38+0.10*osc+0.34*avanti;`,
`  const lean=-0.38+0.10*osc+0.34*avanti+0.33*rialza;`);
esatta('poseFrenata — le braccia scendono',
`  const aR2=0.12*terzo+(0.55+0.18*osc)*(1-terzo);
  const aL2=0.10*terzo+(0.40+0.14*osc)*(1-terzo);
  const eR2=0.15*terzo+1.05*(1-terzo), eL2=0.20*terzo+1.20*(1-terzo);
  const outT=0.26*terzo;`,
`  const aR2=(0.12*terzo+(0.55+0.18*osc)*(1-terzo))*(1-0.75*rialza);
  const aL2=(0.10*terzo+(0.40+0.14*osc)*(1-terzo))*(1-0.75*rialza);
  const eR2=0.15*terzo+1.05*(1-terzo)-0.55*rialza, eL2=0.20*terzo+1.20*(1-terzo)-0.60*rialza;
  /* 0,10 e non 0,16: braccio() somma questo a 0,10 e la scatola degli
     angoli taglia oltre 0,222 (sin 1,05 con le braccia corte del
     piccoletto). A 0,20 la rialzata apre le braccia senza un taglio in
     piu' di quelli che la clip aveva gia'. */
  const outT=0.26*terzo+0.10*rialza;`);
esatta('poseFrenata — le gambe si rimettono sotto',
`  gamba(HIPR,KNR,FTR,TOR,  HIPW*ch, pelvY, dz+HIPW*shh,  0.72+0.05*osc-0.12*affondo, 0.06+0.38*affondo,  0.11+0.13*largo);
  gamba(HIPL,KNL,FTL,TOL, -HIPW*ch, pelvY, dz-HIPW*shh,  0.05+0.42*chiude, 0.95+0.08*osc-0.46*chiude, -0.14-0.13*largo+0.20*chiude);`,
`  gamba(HIPR,KNR,FTR,TOR,  HIPW*ch, pelvY, dz+HIPW*shh,  0.72+0.05*osc-0.12*affondo-0.52*rialza, 0.06+0.38*affondo+0.16*rialza,  0.11+0.13*largo);
  gamba(HIPL,KNL,FTL,TOL, -HIPW*ch, pelvY, dz-HIPW*shh,  0.05+0.42*chiude-0.22*rialza, 0.95+0.08*osc-0.46*chiude-0.18*rialza, -0.14-0.13*largo+0.20*chiude);`);

esatta('poseScivolata — il raccolto',
`  const giu=sm(u,0.08,0.26);
  const dd=(u-0.28)/0.09, botta=Mexp(-dd*dd);
  const su=sm(u,0.70,0.95);`,
`  const giu=sm(u,0.08,0.26);
  const dd=(u-0.28)/0.09, botta=Mexp(-dd*dd);
  /* LA RIALZATA COMINCIA PRESTO (voce #155, criterio C7). MISURATO: dal
     5/16 al 13/16 nove fotogrammi dello stesso corpo disteso che trasla,
     con quattro coppie sotto 0,040 di differenza simmetrica e una
     mediana di clip di 0,129 (strumenti/_155-fotogrammi.js). La causa
     era la finestra: giu' finiva a 0,26 e su cominciava a 0,70, cioe'
     quarantaquattro centesimi di clip in cui l'unica cosa viva era
     un'oscillazione gia' smorzata.
     Adesso in mezzo c'e' la STRISCIATA, che e' il gesto vero: il corpo
     scivola e intanto la gamba di sotto si RACCOGLIE sotto il bacino,
     preparando la rialzata. E su comincia a 0,52. */
  const stris=sm(u,0.30,0.58);
  const su=sm(u,0.52,0.95);`);
esatta('poseScivolata — la gamba che si raccoglie',
`  const aL=(-0.45+(-0.80+0.45)*giu)+(-0.10+0.80)*su;
  const kL=(0.90+(1.15-0.90)*giu)+(0.70-1.15)*su;`,
`  const aL=(-0.45+(-0.80+0.45)*giu)+(-0.10+0.80)*su-0.26*stris+0.26*su;
  const kL=(0.90+(1.15-0.90)*giu)+(0.70-1.15)*su+0.62*stris-0.62*su;`);
esatta('poseScivolata — il braccio che puntella',
`  const aBR=(-0.45+(-0.55+0.45)*giu)+(-0.30+0.55)*su+0.20*osc;`,
`  const aBR=(-0.45+(-0.55+0.45)*giu)+(-0.30+0.55)*su+0.20*osc-0.40*stris+0.40*su;`);

esatta('poseContrasto — il recupero',
`  const all = sm(u,0.04,0.26);          // l'affondo
  const seg = sm(u,0.26,0.58);          // il seguito
  const rit = sm(u,0.60,0.97);          // il rientro`,
`  const all = sm(u,0.04,0.26);          // l'affondo
  const seg = sm(u,0.26,0.58);          // il seguito
  /* IL RIENTRO SI STRINGE E DIVENTA UN PASSO (voce #155, criterio C7).
     MISURATO: dal 9/16 al 16/16 otto fotogrammi quasi fermi, due coppie
     sotto 0,040 e una mediana di clip di 0,095 contro lo 0,237 della
     corsa (strumenti/_155-fotogrammi.js). La rampa 0,60-0,97 riportava
     tutto al riposo senza che succedesse niente: un ritorno non e' un
     gesto. Adesso il rientro finisce a 0,86 e sopra ci passa `+"`rec`"+`,
     il PASSO DI RECUPERO — la gamba che ha contrastato torna sotto il
     corpo passando avanti, e le braccia fanno il contromovimento. La
     campana si apre e si chiude dentro la clip, quindi la somma resta
     zero e la posa finisce dove comincia. */
  const rit = sm(u,0.56,0.86);
  const rq=(u-0.76)/0.115, rec=Mexp(-rq*rq);`);
esatta('poseContrasto — il passo di recupero',
`  const aGd =  0.10 + 0.85*all - 0.55*seg - 0.30*rit;
  const kGd =  0.55 - 0.30*all + 1.05*seg - 0.75*rit;
  const aGs = -0.05 - 0.30*all + 0.20*seg + 0.10*rit;
  const kGs =  0.40 + 0.55*all - 0.35*seg - 0.20*rit;`,
`  const aGd =  0.10 + 0.85*all - 0.55*seg - 0.30*rit + 0.34*rec;
  const kGd =  0.55 - 0.30*all + 1.05*seg - 0.75*rit + 0.72*rec;
  const aGs = -0.05 - 0.30*all + 0.20*seg + 0.10*rit - 0.28*rec;
  const kGs =  0.40 + 0.55*all - 0.35*seg - 0.20*rit + 0.16*rec;`);
esatta('poseContrasto — le braccia del recupero',
`  const aR = 0.55*all - 0.35*seg - 0.20*rit;
  const aL = -0.30*all + 0.18*seg + 0.12*rit;`,
`  const aR = 0.55*all - 0.35*seg - 0.20*rit - 0.30*rec;
  const aL = -0.30*all + 0.18*seg + 0.12*rit + 0.34*rec;`);

/* --------------------------------------------------------------- 8d ---
   I TRE GOMITI CHE LA SCATOLA STAVA CORREGGENDO.

   braccio() impone eMin = 0,12 + 0,29x|out/UA|: un braccio piu' aperto
   NON puo' avere il gomito teso, e se la posa glielo chiede la scatola
   lo piega d'ufficio e conta un taglio. Aprendo le braccia (8b) tre
   pose hanno cominciato a sbatterci contro — ?gabbia: rinvio da 100 a
   262 correzioni, filtrante da 0 a 111, respinta da 0 a 22 — e una posa
   corretta dal clamp e' una posa scritta male: il braccio NON si apre
   davvero, viene solo piegato. Si riscrive il foglio, come dice la
   regola accanto a TAGLI, e non si lascia fare al clamp. */
esatta('poseCalcio — il gomito del bilanciere',
`  braccio(SHL,ELL,HAL, -SHW*cs, shY, shZ-SHW*ss, aL,0.30+0.50*w2, q.armOut+ap*0.85*w2+0.04*w1,-1);`,
`  /* 0,40 e non 0,30: col braccio piu' aperto del filtrante (armOut
     0,16) eMin arriva a 0,346 nella carica, e a 0,30 la scatola piegava
     il gomito per noi 111 volte su 1024 angoli. A 0,40 il taglio non
     c'e' e il gesto finisce dove finiva (0,85 contro 0,80). */
  braccio(SHL,ELL,HAL, -SHW*cs, shY, shZ-SHW*ss, aL,0.40+0.45*w2, q.armOut+ap*0.85*w2+0.04*w1,-1);`);
esatta('poseCalcio — il gomito che accompagna',
`  braccio(SHR,ELR,HAR,  SHW*cs, shY, shZ+SHW*ss, aR,0.35+0.55*w1, q.armOut+ap*w1+0.05*w2, 1);`,
`  /* 0,42 e non 0,35, stessa ragione dell'altro gomito: nel seguito del
     filtrante l'apertura arriva a 0,21 ed eMin a 0,357. Il gesto
     finisce a 0,92 invece che a 0,90. */
  braccio(SHR,ELR,HAR,  SHW*cs, shY, shZ+SHW*ss, aR,0.42+0.50*w1, q.armOut+ap*w1+0.05*w2, 1);`);
esatta('poseRinvio — il gomito',
`  const eB=0.62*hold+0.30*(1-hold);`,
`  const eB=0.62*hold+0.40*(1-hold);   // 0,40: eMin con outB 0,205 vale 0,352`);
esatta('poseRespinta — i gomiti',
`  const eR = 0.50 - 0.16*sca + 0.06*seg + 0.10*rit - 0.03*imp;
  const eL = 0.50 - 0.14*sca + 0.05*seg + 0.09*rit;`,
`  /* la discesa in carica si dimezza (-0,16 -> -0,10, -0,14 -> -0,08):
     con le braccia aperte a 0,145 eMin sale a 0,352 e la scatola
     piegava il gomito da se'. Il gesto e' lo stesso, il taglio no. */
  const eR = 0.50 - 0.10*sca + 0.06*seg + 0.10*rit - 0.03*imp;
  const eL = 0.50 - 0.08*sca + 0.05*seg + 0.09*rit;`);

/* --------------------------------------------------------------- 3b ---
   I CARICAMENTI: il primo fotogramma smette di essere gemello del
   secondo. MISURATO (strumenti/_155-fotogrammi.js, coppia 1/16-2/16):
   scivolata 0,000 — due disegni IDENTICI — tiro 0,037, contrasto 0,029,
   contro soglie di 0,040. Tutte e tre cominciavano con una rampa che
   partiva piu' tardi del secondo fotogramma, cioe' con un'attesa. Il
   criterio C4 chiede «un caricamento prima» e questo e' precisamente il
   posto dove non c'era. */
esatta('poseCalcio — il caricamento',
`function poseCalcio(u,q){
  const ti=q.tImp, t1=ti-q.swing, tF=ti+q.segue;
  const w1=sm(u,0.04,t1)*(1-sm(u,t1,ti+0.02));      // anticipo`,
`function poseCalcio(u,q){
  const ti=q.tImp, t1=ti-q.swing, tF=ti+q.segue;
  /* IL CONTROMOVIMENTO, prima dell'anticipo: due centesimi di secondo in
     cui il corpo fa il contrario di quello che sta per fare — il bacino
     si alza e le spalle si aprono un soffio. E' la prima meta' di ogni
     gesto vero, e qui mancava: la clip cominciava con tre fotogrammi
     uguali perche' w1 partiva a 0,04 mentre il secondo fotogramma sta a
     0,0625. Si spegne a 0,16, cioe' molto prima dell'impatto: non
     sposta di un millesimo l'istante del contatto col pallone. */
  const pre=sm(u,0.00,0.055)*(1-sm(u,0.055,0.17));
  const w1=sm(u,0.04,t1)*(1-sm(u,t1,ti+0.02));      // anticipo`);
esatta('poseCalcio — il bacino del caricamento',
`  const pelvY=0.93-(q.crouch+q.dip*peso+0.02*w1);`,
`  const pelvY=0.93-(q.crouch+q.dip*peso+0.02*w1)+0.030*pre;`);

esatta('poseScivolata — il caricamento',
`  const p=u-0.28, osc=p>0?Msin(p*9.5)*Mexp(-4.5*p):0;`,
`  const p=u-0.28, osc=p>0?Msin(p*9.5)*Mexp(-4.5*p):0;
  /* IL CARICAMENTO: prima di buttarsi ci si abbassa e si porta il peso
     indietro. Senza, i primi due fotogrammi erano lo STESSO disegno
     (differenza simmetrica 0,000, misurata). Si spegne a 0,22, prima
     che la discesa sia a meta'. */
  const car=sm(u,0.00,0.07)*(1-sm(u,0.07,0.22));`);
esatta('poseScivolata — il bacino e il busto del caricamento',
`  const pelvY=(0.80+(0.32-0.80)*giu)+(0.62-0.32)*su-0.03*botta;
  const lean=(0.30+(-0.66-0.30)*giu)+(0.18+0.66)*su+0.11*osc-0.07*botta;`,
`  const pelvY=(0.80+(0.32-0.80)*giu)+(0.62-0.32)*su-0.03*botta-0.085*car;
  const lean=(0.30+(-0.66-0.30)*giu)+(0.18+0.66)*su+0.11*osc-0.07*botta+0.26*car;`);

esatta('poseContrasto — l\'affondo comincia subito',
`  const all = sm(u,0.04,0.26);          // l'affondo`,
`  const all = sm(u,0.01,0.26);          // l'affondo`);

/* --------------------------------------------------------------- 8c ---
   LE TRE BASI SI ALLARGANO — e il numero l'ha scritto un cancello.

   MISURATO, non scelto. Con le gambe sottili e il pavimento della base,
   silhouette.js e' passato da 8 azioni nominabili a 6: «sta fermo»
   perdeva lo scavo (0,330 -> 0,326, e 0,330 era gia' il minimo esatto) e
   «corre» perdeva la strozzatura in vita. Le tre pose che il cancello
   guarda e che hanno la base piu' stretta sono proprio queste tre, e
   allargarle e' anche quello che la giuria chiede («da fermo la figura
   ha una BASE, non sta in equilibrio su un punto»):
     fermo      0,20 -> 0,27   scavo 0,326 -> sopra il minimo
     corsa      0,24 -> 0,30   masse 1 -> 2
     esultanza  0,14 -> 0,24
   Il cancello torna a 8 su 10. Provata anche la V dell'esultanza piu'
   larga per recuperare la sua strozzatura: peggiora (masse 1 -> 0),
   quindi NON si e' fatta, e l'esultanza resta l'unica posa in piedi
   senza la seconda strozzatura — dichiarata, non nascosta. */
esatta('Q_FERMO — la base',
`  lean:0.09,bounce:0.008,crouch:0.07,twist:0.02,stanceW:0.20,headBob:0.005};`,
`  lean:0.09,bounce:0.008,crouch:0.07,twist:0.02,stanceW:0.27,headBob:0.005};`);
esatta('Q_CORSA — la base',
`  lean:0.44,bounce:-0.055,crouch:0.05,twist:0.17,stanceW:0.24,headBob:0.010};`,
`  lean:0.44,bounce:-0.055,crouch:0.05,twist:0.17,stanceW:0.30,headBob:0.010};`);
esatta('Q_ESULT — la base',
`  lean:-0.16,bounce:-0.030,crouch:0.04,twist:0.05,stanceW:0.14,headBob:0.006};`,
`  lean:-0.16,bounce:-0.030,crouch:0.04,twist:0.05,stanceW:0.24,headBob:0.006};`);

/* --------------------------------------------------------------- 8b ---
   IL BRACCIO ESCE DAL BUSTO — le cinque clip che il giro 1 non ha
   toccato (rilievo 2 della giuria).

   IL CONTO E' GIA' SCRITTO IN QUESTO FILE, nel riquadro «IL VUOTO FRA
   BRACCIO E FIANCO»: perche' si apra un pertugio vero serve
   armOut >= 0,15, e queste cinque pose stavano a 0,05-0,08 — il gomito
   cadeva DENTRO il profilo del busto e in maschera nera il braccio
   smetteva di esistere.

   IL TETTO E' DOPPIO e nessuna delle cinque lo sfonda:
     - l'abduzione entra come seno, out/UA con UA = 0,27x0,95 = 0,2565
       sul piccoletto: oltre 0,222 la scatola TAGLIA invece di aprire.
       Il massimo qui e' 0,215.
     - braccio() impone eMin = 0,12 + 0,29x|out/UA|: a 0,145 vale 0,284,
       e il gomito piu' chiuso delle cinque pose sta a 0,30. Zero tagli.
   DUE CLIP RESTANO DOVE SONO, e si dice perche': la RIMESSA tiene le
   mani sul pallone sopra la testa (aprirle vuol dire perdere la palla
   fra le mani, ed e' gia' 4/4 sul banco della sagoma) e la PRESA ha il
   gomito che scende a 0,20, cioe' sotto l'eMin che 0,145 imporrebbe:
   aprirla vorrebbe dire riscrivere anche la flessione, e una posa di
   portiere riscritta a meta' e' peggio di una posa stretta. */
esatta('poseTesta — il braccio esce',
`  const out = 0.06 + 0.15*car - 0.09*seg - 0.06*rit;`,
`  const out = 0.145 + 0.06*car - 0.04*seg - 0.02*rit;`);
esatta('poseRespinta — il braccio esce',
`  const outR = 0.06 + 0.08*sca - 0.03*seg - 0.05*rit;
  const outL = 0.06 + 0.09*sca - 0.03*seg - 0.06*rit;`,
`  const outR = 0.145 + 0.06*sca - 0.03*seg - 0.03*rit;
  const outL = 0.145 + 0.07*sca - 0.04*seg - 0.03*rit;`);
esatta('poseSfugge — il braccio esce',
`  const outR = 0.05 - 0.03*ten + 0.14*ced - 0.11*rit;
  const outL = 0.05 - 0.03*ten + 0.11*ced - 0.08*rit;`,
`  const outR = 0.145 - 0.02*ten + 0.07*ced - 0.05*rit;
  const outL = 0.145 - 0.02*ten + 0.06*ced - 0.04*rit;`);
esatta('poseFinta — il braccio esce',
`  braccio(SHR,ELR,HAR, shX+SHW, shY, shZ, 0.10+0.60*segue,0.55, 0.08+0.06*dip, 1);
  braccio(SHL,ELL,HAL, shX-SHW, shY, shZ, 0.10-0.60*segue,0.55, 0.08+0.06*dip,-1);`,
`  braccio(SHR,ELR,HAR, shX+SHW, shY, shZ, 0.10+0.60*segue,0.55, 0.145+0.05*dip, 1);
  braccio(SHL,ELL,HAL, shX-SHW, shY, shZ, 0.10-0.60*segue,0.55, 0.145+0.05*dip,-1);`);
esatta('poseRinvio — il braccio esce',
`  const outB=0.02*hold+(0.12+0.05*w2)*(1-hold);`,
`  const outB=0.10*hold+(0.165+0.04*w2)*(1-hold);`);

/* --------------------------------------------------------------- 1b ---
   L'OMBRA IN PARTITA: il blocco intero di drawOmbreGiocatori. */
const OMB_APRE = `    const h = (p.celeb>0 ? Math.abs(Msin((2.4-p.celeb)*9))*7 : 0) + (p.bob||0);`;
const OMB_CHIUDE = `      ctx.drawImage(ombraTex, CX-7*r, CY-3.9*r, 14*r, 7.8*r);
    }`;
const OMB_NUOVA = `    /* =============================================================
       LA QUOTA DELLA POSA CONTA COME IL SALTO (voce #155, criterio C4).

       IL DIFETTO, NOMINATO DALLA GIURIA E VERIFICATO: «nel tuffo il
       portiere e' orizzontale a mezz'aria e sotto ha lo stesso dischetto
       verde di quando sta fermo». Era vero perche' qui la quota veniva
       da due sole sorgenti — il salto dell'esultanza e il saliscendi
       della falcata — e un portiere in volo non alza nessuna delle due.
       La quota vera sta nella POSA, e adesso si legge: Rig3D.quotaAria
       da' la distanza dal manto del giunto piu' basso, misurata al
       caricamento sulle pose e non scritta a mano (vedi il riquadro
       accanto a quotaAria).

       QUATTRO COSE CAMBIANO, e sono le tre che il criterio chiede piu'
       una che serviva a tutte:
         k  l'ombra si allontana lungo il sole
         r  rimpicciolisce
         a  schiarisce
         lw IL TRATTO SI ALLARGA — la sfocatura. Un'ombra portata da
            lontano ha il bordo morbido, e a questa risoluzione
            «morbido» si scrive allargando la capsula: sedici unita' di
            larghezza contro le 6,6 di riposo, alla quota di un tuffo.
       E LA MACCHIA DI CONTATTO SPARISCE: ac la spegne gia' oltre le sei
       unita' di quota, che e' esattamente il punto — un uomo a
       mezz'aria non lascia impronta.

       IL COSTO: una chiamata a rigStato e una interpolazione lineare per
       figura, e rigStato la passata delle ombre la faceva GIA' su tutte
       le figure vicine. Sulle lontane e' nuova, ed e' il prezzo
       dichiarato: misurato con prestazione.js, sta sotto il rumore.

       L'ORDINE E' CAMBIATO E IL PERCHE' VA DETTO: prima si calcolava la
       quota e poi si decideva se la figura meritasse la posa; adesso si
       decide prima, perche' la quota VIENE dalla posa. p.lodPosa si
       scrive dove si scriveva — dentro il ramo vicino — cosi' la
       figura lontana continua a dichiarare la posa che dichiarava. */
    const portatore = G.ball && G.ball.owner>=0 && G.players[G.ball.owner]===p;
    const vicino = portatore || !figuraLontana(p);
    if(vicino) p.lodPosa=false;
    const st=rigStato(p);
    const aria=Rig3D.quotaAria(st.clip, st.u/Rig3D.CLIPS[st.clip].freq)*OMBRA_MT;
    const salto=(p.celeb>0 ? Math.abs(Msin((2.4-p.celeb)*9))*7 : 0);
    const h = salto + (p.bob||0) + aria;
    const k = 1+h*0.05;                 // in salto l'ombra si allontana
    const r = 1-h*0.030;                // e rimpicciolisce
    const a = 1-h*0.055;                // e schiarisce
    /* E SI SFOCA: il tratto si allarga con la quota. Ma la quota che
       SFOCA non e' la stessa che allontana: il saliscendi della falcata
       (p.bob, fino a 0,9 unita') muove l'ombra e va bene, mentre una
       capsula che si allarga del 20% a ogni passo farebbe respirare
       tutte le ombre del campo insieme — lo stesso errore, di nuovo,
       da un'altra porta. Qui entrano solo il salto e il volo della posa.
       Una assegnazione sola quando serve, non ventidue: lwOra ricorda
       l'ultima. */
    const volo = salto + aria;
    const lw = volo>1.0 ? OMBRA_LARG*(1+volo*0.230) : OMBRA_LARG;
    if(lw!==lwOra){ ctx.lineWidth=lw; lwOra=lw; }
    /* il piede, e poi il piede NEL RIFERIMENTO RUOTATO */
    const fx=p.x+GEO.piedeX*k, fy=p.y+GEO.piedeY*k;
    const X= fx*C+fy*S, Y=-fx*S+fy*C;
    /* la velocita' STRINGE la sezione invece di allungare l'ombra: e' la
       lampada a decidere la lunghezza, non le gambe */
    const vv=Math.sqrt((p.vx||0)*(p.vx||0)+(p.vy||0)*(p.vy||0));
    const stretta=SAVE.moto ? clamp((vv-14)/40,0,1) : 0;
    const sc=(GEO.semiCorto-1.2*stretta)*r;
    const L=LUNG*r;
    ctx.globalAlpha=a*OMA;
    let fatta=false;
    if(vicino){
      const lk=rigLook(p);
      /* la stessa fusione del corpo, dichiarata PRIMA dell'ombra:
         l'ombra getta la posa che il corpo disegnera' fra poche righe,
         fusione compresa — corpo e ombra restano UN oggetto */
      rigFusione(p, st);
      fatta=Rig3D.ombraTraccia(ctx, X, Y,
              RIG_H/(p.squash||1), rigAngolo(p)+RIG_YAW_K,
              st.clip, st.u/Rig3D.CLIPS[st.clip].freq,
              lk.corp, lk.varb, C, S, GEO.perMetro, r, lk.manc);
    }
    if(!fatta){
      /* la tessitura ha la testa tonda a 32/256 e la punta a 252/256: si
         riscala perche' il centro del tondo cada ESATTO sul piede e la punta
         esatta a L unita' di distanza */
      ctx.drawImage(ombraLungaTex, X-L*0.1455, Y-sc, L*1.164, sc*2);
    }
    const ac=a*Math.max(0,1-h*0.16);
    /* LOD: lontano dal centro-camera l'ombra e' la sola capsula lunga
       (mai sul portatore: la sua figura e' sempre a dettaglio pieno) */
    if(ac>0.02 && vicino){
      const ang=p.ang||0, ph=SAVE.moto ? Mcos(p.fase||0) : 0;
      const ca=Mcos(ang), sa=Msin(ang);
      const av=ph*(p.amp||1.1)*0.35, la=ph*3.0;
      const cx=p.x+ca*av-sa*la, cy=p.y+7.0+sa*av+ca*la;
      const CX= cx*C+cy*S, CY=-cx*S+cy*C;
      ctx.globalAlpha=ac*0.80;
      ctx.drawImage(ombraTex, CX-7*r, CY-3.9*r, 14*r, 7.8*r);
    }`;

/* la larghezza di riposo va ricordata: si dichiara accanto al resto
   dello stato della passata */
esatta('drawOmbreGiocatori — lo stato della larghezza',
`  ctx.lineWidth=OMBRA_LARG;
  for(const p of lista){`,
`  ctx.lineWidth=OMBRA_LARG;
  /* l'ultima larghezza scritta: serve a non riassegnarla ventidue volte
     quando nessuno e' in aria (vedi il riquadro della quota, sotto) */
  let lwOra=OMBRA_LARG;
  for(const p of lista){`);

esatta('OMBRA_MT — le unita per metro di quota',
`const RIG_H = 34;          // altezza apparente della figura (poi x P_DIS)`,
`const RIG_H = 34;          // altezza apparente della figura (poi x P_DIS)
/* UNITA' DI MANTO PER METRO DI QUOTA DEL CORPO (voce #155, criterio C4).
   La proiezione del rig vale SY = cy - (y*ce + zw*se)*s con s =
   hPx/(1,9*ce): la QUOTA contribuisce y*hPx/1,9, indipendente
   dall'elevazione della camera. Un metro di corpo alzato vale quindi
   RIG_H/1,9 unita' di schermo, ed e' la stessa scala con cui il salto
   dell'esultanza vale 7 unita'. Scritto come formula e non come numero:
   chi cambiera' RIG_H non deve ricordarsi anche di questo. */
const OMBRA_MT=RIG_H/1.9;`);

/* --------------------------------------------------------------- 5c ---
   In partita la testa guarda il pallone. */
esatta('rigGuarda',
`function rigStato(p){
  const st = RIGST;`,
`/* =====================================================================
   DOVE GUARDA LA TESTA — l'altra meta' di rigAngolo (voce #155, C2).

   rigAngolo dice dove punta il PETTO. Da oggi la testa puo' dire
   un'altra cosa, e in partita ne dice una sola: guarda il pallone.
   Ventidue teste che seguono la palla sono la differenza fra ventidue
   birilli e ventidue persone, e non costano niente alla partita —
   G.ctrl non legge questa funzione, nessun sorteggio la attraversa,
   e il giunto della testa non si muove (ruota solo il suo disegno).
   IL COLLO HA UN LIMITE e lo mette Rig3D (HYAW_MAX, 66 gradi): oltre,
   una persona gira anche le spalle, e le spalle qui le decide rigAngolo.
   QUANDO IL PALLONE E' AI PIEDI non si guarda niente: sotto le otto
   unita' la direzione e' rumore e la testa comincerebbe a tremare. */
function rigGuarda(p, ang){
  const b=G.ball; if(!b) return 0;
  const dx=b.x-p.x, dy=b.y-p.y;
  if(dx*dx+dy*dy < 64) return 0;
  let d=Matan2(dy,dx)-ang;
  const DUEPI=Math.PI*2;
  while(d> Math.PI) d-=DUEPI;
  while(d<-Math.PI) d+=DUEPI;
  return d;
}
function rigStato(p){
  const st = RIGST;`);

esatta('drawPlayer — la testa guarda',
`    Rig3D.disegna(ctx, p.x, cy, hb, yaw, 'alto', st.clip, st.u/clip.freq, look, true,
                  (G.view.S2||1)*P_DIS, p.filo?1.7:0);`,
`    /* la dichiarazione MONOUSO dell'imbardata della testa: la consuma
       la disegna qui sotto e si spegne da sola */
    Rig3D.guarda(rigGuarda(p, yaw - RIG_YAW_K));
    Rig3D.disegna(ctx, p.x, cy, hb, yaw, 'alto', st.clip, st.u/clip.freq, look, true,
                  (G.view.S2||1)*P_DIS, p.filo?1.7:0);`);

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

/* il blocco dell'ombra, per span (apre/chiude) come _toppa-tuffo.js */
{
  const nA = src.split(OMB_APRE).length - 1;
  if (nA !== 1) { console.error('FALLITO [ombra]: l\'apertura compare ' + nA + ' volte.'); process.exit(1); }
  const i0 = src.indexOf(OMB_APRE);
  const iC = src.indexOf(OMB_CHIUDE, i0);
  if (iC < 0) { console.error('FALLITO [ombra]: la chiusura non segue l\'apertura.'); process.exit(1); }
  const vecchio = src.slice(i0, iC + OMB_CHIUDE.length);
  if (vecchio.length < 2000 || vecchio.length > 6000) {
    console.error('FALLITO [ombra]: il blocco trovato e\' lungo ' + vecchio.length + ' byte, fuori dall\'intervallo atteso.');
    process.exit(1);
  }
  if (vecchio.indexOf('ombraLungaTex') < 0 || vecchio.indexOf('ombraTraccia') < 0) {
    console.error('FALLITO [ombra]: il blocco trovato non e\' quello misurato (manca ombraLungaTex o ombraTraccia).');
    process.exit(1);
  }
  src = src.slice(0, i0) + OMB_NUOVA + src.slice(iC + OMB_CHIUDE.length);
}

const dest = path.resolve(A);
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, src);
console.log('toppa applicata: ' + E.length + ' ancore + 1 blocco');
console.log('  da:   ' + DA);
console.log('  a:    ' + dest);
console.log('  delta di file: ' + (src.length - prima) + ' byte');
