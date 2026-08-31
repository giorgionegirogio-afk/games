/* =====================================================================
   _t-festa-corpo.js — GLI ARTI ESCONO DAL CORPO NEL FOTOGRAMMA CHE IL
   GIOCO HA COSTRUITO PER ESSERE GUARDATO   (29 agosto 2026, famiglia F3).

   LA COSA, in una riga: nella ripresa del gol due delle quattro pose di
   festa — `pugno` e `cielo` — sono macchie nere, e il gioco stesso non
   riesce a distinguerle da UN UOMO CHE STA FERMO.

   =====================================================================
   IL DIFETTO, MISURATO CON IL METRO CHE QUESTA CASA HA PAGATO CON UN
   PROVINO CIECO UMANO (17 agosto 2026, cappello di strumenti/silhouette.js).

   Il criterio si chiama SCAVO — la frazione del guscio convesso della
   sagoma occupata da SFONDO, cioe' «quanto vuoto passa fra un arto e la
   massa» — e' l'unico dei cinque che separi le tre pose che l'uomo ha
   NOMINATO dalle quattro che ha visto FUSE, e nel cancello e' un VETO:
   almeno 0,33. Misurato all'IMBARDATA VERA della festa (rigAngolo, riga
   31929: pi/2 +- 0,38, che sommato a RIG_YAW_K = pi/2 fa pi +- 0,38) e
   alle FASI VERE che rigStato manda nei primi 1,6 secondi dal gol,
   diciotto campioni per clip:

     clip         scavo medio    campioni sopra 0,33
     pugno            0,132           0 su 18
     cielo            0,261           1 su 18
     ginocchia        0,233           2 su 18
     esultanza        0,339          14 su 18

   E all'angolo di presentazione del provino (yaw 0,95, corporatura 3),
   dove il cancello della sagoma giudica per davvero:

     clip        inchiostro (banda 0,28-0,52)   forma (0,35-1,15)   scavo (>=0,33)
     pugno            0,727   FUORI BANDA            0,378              0,096  BOCCIATO
     cielo            0,482   dentro                 0,500              0,275  BOCCIATO
     esultanza        0,413   dentro                 0,740              0,408  passa

   `pugno` sarebbe bocciata su DUE criteri su cinque, `cielo` sul veto.
   Non lo erano perche' le dieci celle del provino non le contengono: il
   cancello della sagoma non ha mai guardato le pose di festa tranne una.

   E il colpo che chiude il discorso — la DISTINZIONE, l'altro veto del
   cancello (Hamming su griglie 32x32, minimo 0,18). Alla stessa
   imbardata della festa, la sagoma piu' vicina a queste due pose era
   `fermo`, cioe' un uomo in piedi che non fa niente:

     cielo, fasi 0,33 / 0,55 / 0,77   0,177 / 0,171 / 0,164  con `fermo`  SOTTO IL VETO
     pugno, fase 0,77                 0,156                  con `fermo`  SOTTO IL VETO

   Tradotto: la festa piu' vistosa del gioco — le braccia al cielo — era
   misurabilmente la stessa figura di un uomo fermo.

   =====================================================================
   PERCHE' NON HO SEGUITO LA STRADA CHE IL REFERTO PROPONE, e i numeri.

   Il referto `_analisi/ONDA-ANIMAZIONE.md` (voce 38) accusa le stesse
   due clip, ma con l'ALTRO metro: la REGOLA SAGITTALE di _z-leggibile,
   px = dz_med x hPx/1,9 x |sin(imbardata)|, che le da' a 8,6 e 6,0 px
   contro un tratto di 11. Quella regola, su queste due clip, e' un falso
   positivo dichiarato — lo scrive il cappello di _z-leggibile.js stesso:
   «una posa che sull'asse sagittale non mette quasi niente non ha quasi
   niente da perdere, e la regola la marca illeggibile lo stesso... la
   stessa tabella li da' leggibili a qualunque imbardata».
   Percio' il difetto e' stato ri-cercato con lo scavo, e il difetto
   C'E' — ma la cura giusta non e' la stessa che suggerirebbe la regola
   sagittale da sola. Le tre strade bocciate stanno in fondo a questo
   cappello, coi numeri.

   =====================================================================
   LA CURA. Nessun gesto nuovo: gli stessi due gesti, con gli arti che
   ESCONO dalla massa. E' la regola che il provino cieco ha dettato
   parola per parola — «le pose che funzionano sono quelle in cui UN ARTO
   ESCE NETTO DALLA SAGOMA».

   PUGNO AL CIELO
     · il braccio che NON tira il pugno smetteva di esistere: stava a
       0,09 di scarto laterale, incollato al fianco («la sinistra resta
       bassa, in contrasto»). Adesso si apre a 0,22 e va INDIETRO (-0,78
       rad): fra braccio e busto passa lo sfondo, e il corpo guadagna
       profondita' sull'asse che la camera perde.
     · le gambe erano un piedistallo: piedi a +-0,11, cioe' 0,005 di
       apertura d'anca su un massimo di 0,75 — praticamente due colonne
       attaccate. Adesso si aprono a +-0,30 e si sfalsano avanti/indietro
       (+0,64 / -0,42 rad): una forbice, non un tronco di cono.
     · il pugno esce dalla colonna della testa (scarto laterale da 0,11
       a 0,20) invece di sfiorarla.
     · l'anticipo dura meno — la carica finisce a u 0,12 invece che 0,20
       e il pugno e' su a u 0,21 invece che 0,32, cioe' 0,38 s dopo il
       gol invece di 0,58 — e il pugno RESTA su piu' a lungo (il rientro
       parte a u 0,84 invece che 0,66). La struttura del tempo non
       cambia: anticipo, esplosione accelerata (t*t), peso, seguito.

   ESULTANZA AL CIELO
     · lo scarto laterale delle braccia chiedeva 0,26 contro un massimo
       di abduzione di 0,2225 sul corpo con le braccia piu' corte: la
       scatola degli angoli riscriveva la posa 404 volte sui 1024 angoli
       valutati per clip (64 fasi x 4 corporature x 4 arti). Adesso
       chiede 0,215 e i tagli sono ZERO. Non e' un dettaglio contabile:
       una posa corretta dal clamp e' una posa in cui i numeri scritti
       non sono i numeri disegnati.
     · le gambe erano strette per scelta dichiarata («strette: il corpo
       resta una figura, non una campana»). Quella scelta era sbagliata e
       si misura: a piedi stretti la sagoma non si distingue da `fermo`
       (0,171 contro un veto di 0,18). Adesso i piedi vanno a +-0,28 e si
       sfalsano (+0,40 / -0,30 rad).
     · le braccia salgono prima: `su` finisce a u 0,20 invece che 0,24.

   =====================================================================
   I NUMERI, PRIMA E DOPO — tutti misurati oggi con
   `node strumenti/_t3-forgia.js --clip <clip> [--cand <file>]`
   sul fermo immagine `fuori/anim-terza.html`
   (2.327.831 byte, md5 71b95d6451797cead99f3ef3266ae027, 29 ago 2026 15:04).

     PUGNO                              prima      dopo
     scavo medio (18 campioni)          0,132      0,323
     campioni sopra il veto 0,33        0 / 18     13 / 18
     scavo all'angolo di presentazione  0,096      0,385     (veto 0,33)
     inchiostro, stesso angolo          0,727      0,400     (banda 0,28-0,52)
     forma, stesso angolo               0,378      0,930     (banda 0,35-1,15)
     distinzione peggiore               0,156      0,227     (veto 0,18)
     ...e con chi                       `fermo`    `esultanza`
     dz_med (estensione sagittale)      0,3153     1,0323    (x 3,27)
     tagli della scatola degli angoli   115        0

     CIELO                              prima      dopo
     scavo medio (18 campioni)          0,261      0,316
     campioni sopra il veto 0,33        1 / 18     13 / 18
     scavo all'angolo di presentazione  0,275      0,413
     inchiostro, stesso angolo          0,482      0,388
     forma, stesso angolo               0,500      0,642
     distinzione peggiore               0,164      0,237
     ...e con chi                       `fermo`    `frenata`
     dz_med                             0,4571     0,7238    (x 1,58)
     tagli                              404        0

   E siccome dz_med e' anche il fattore per clip della regola sagittale
   del referto, quella cade da se': `pugno` passa da 6,0 a 19,6 px
   sagittali e `cielo` da 8,6 a 13,6, contro un tratto di 11. Le due
   clip che stavano sotto il tratto nel 91,4% e nel 100,0% dei loro
   inizi ci passano sopra sempre — e non perche' il numero sia stato
   inseguito, ma perche' la stessa apertura che fa passare lo sfondo fra
   gli arti mette anche profondita' sull'asse che la camera schiaccia.

   =====================================================================
   LE STRADE BOCCIATE, COI NUMERI.

   1. «Girare la festa di TRE QUARTI veri.» Bocciata.
      rigAngolo dichiara «la festa va verso la curva sud di TRE QUARTI» e
      poi scrive +-0,38 rad, cioe' 21,8 gradi: quasi frontale. Portarla a
      45 gradi raddoppia il |sin| della regola sagittale (0,37 -> 0,71) e
      sembrava gratis. Misurato lo scavo sulla spazzata d'imbardata
      (_t3-scavo.js, campioni sopra 0,33 nei primi 1,6 s):
                       0,00   0,20   0,38   0,55   0,70   0,85   1,00
        cielo           67%    17%     6%     0%     0%     0%     6%
        ginocchia       56%    56%    11%     6%     6%     0%     0%
        esultanza       78%   100%    78%    44%    17%    17%    11%
      Girare di piu' PEGGIORA tutte e tre. Le due misure sono
      anticorrelate, e quella che decide e' quella col provino umano
      dietro. La camera non e' la leva.

   2. «Far scegliere al portiere `parata` invece di `tuffo` quando il
      tuffo non si vede» (voce 14 del referto, indicata come «il primo
      passo che rende»). Bocciata: sposterebbe i fotogrammi dalla posa
      migliore alla peggiore. Scavo misurato agli angoli veri:
                     |sin| 0,20   0,50   0,95
        tuffo u0,42     0,429   0,409   0,336
        tuffo u0,30     0,434   0,413   0,357
        parata u0,30    0,321   0,294   0,271
        parata u0,50    0,312   0,296   0,268
      `parata` sta SOTTO il veto 0,33 a ogni angolo, `tuffo` sopra a ogni
      angolo — l'esatto contrario di quello che dice la regola sagittale
      (40,2 px contro 12,1). Chi tocca quella soglia peggiora la sagoma
      mentre migliora il numero.

   3. «Il portiere si butta per pochi centimetri e lo disegniamo in
      volo.» Bocciata perche' non e' vero. Misurata la strada che il
      corpo deve fare nell'istante in cui il tuffo si arma, 130 tuffi su
      8 partite (_t3-tuffi.js): mediana 65,4 unita', q25 35,5, e solo il
      10,8% sotto 16 unita'. I tuffi corti quasi non esistono: non c'e'
      niente da riclassificare.

   =====================================================================
   IL RISULTATO SULLA CATENA DEL REFERTO, cioe' sul metro che la cura
   NON ha inseguito. Sedici partite per parte, seme 20260827, 111.902
   fotogrammi, 806.974 figure — identiche prima e dopo, fotogramma per
   fotogramma (`_t3-verbo.js` + `_z-leggibile.js`, 29 ago 2026).
   Tratto di riferimento 11 px prima E dopo (q10 delle corde piene).

     INIZI DI VERBO SOTTO IL TRATTO      prima     dopo
     tutti, soglia costante              14,8%     6,0%    (121 -> 49 su 816)
     tutti, soglia riscalata             20,1%    11,3%    (164 -> 92 su 816)
     `esulta`, costante                  52,2%     7,5%
     `esulta`, riscalata                 81,4%    36,6%

     FOTOGRAMMI DI VERBO SOTTO IL TRATTO
     tutti, soglia costante              22,3%    17,8%    (6195 -> 4950 su 27.798)
     tutti, soglia riscalata             32,5%    25,4%    (9024 -> 7073)
     `esulta`, costante                  26,1%     0,2%
     `esulta`, riscalata                 78,3%    37,7%

   E CLIP PER CLIP, che e' la tavola della voce 38 rifatta:

     inizi           n     px sagittali MED      sotto il tratto
     cielo          40      8,6  ->  13,7        100,0%  ->  0,0%
     pugno          35      6,0  ->  19,7         91,4%  ->  0,0%
     ginocchia      59     11,2  ->  11,2         20,3%  ->  20,3%   (non toccata)
     esultanza      27     15,5  ->  15,5          0,0%  ->   0,0%   (non toccata)

     fotogrammi      n     px sagittali MED      sotto il tratto
     cielo         939     11,9  ->  19,1         25,3%  ->  0,0%
     pugno        1129      8,4  ->  27,7         89,2%  ->  0,0%
     ginocchia    1813     15,7  ->  15,7          0,7%  ->  0,7%    (non toccata)
     esultanza     926     21,6  ->  21,6          0,0%  ->  0,0%    (non toccata)

   Gli altri quattro verbi non si muovono di una cifra: `tira` 2,2%,
   `para` 42,5 / 45,3%, `crossa` 1,9%, `scivola` 7,0 / 7,5% prima e dopo.
   La cura e' isolata dove doveva esserlo.

   UNA BANDIERA DA LEGGERE E NON DA CREDERE. `_z-leggibile` stampa
   «ogni imbardata e ogni hPx identici, fotogramma per fotogramma: NO».
   Non e' la cura: sono 107 record su 46.513 (lo 0,23%), tutti nella
   scena `freekick` in camera `bassa` — che la regola sagittale esclude
   due volte, per scena e per camera — e tutti con lo stesso unico valore
   d'imbardata che differisce, 3,4755 contro 3,4792. La causa e'
   misurata: quell'imbardata dipende da `G.pulse`, che al banco parte
   con l'offset dei fotogrammi di splash trascorsi prima che il banco
   congeli requestAnimationFrame. Sullo STESSO file, tre corse di fila
   danno G.pulse alla stessa scena = 730,650 / 730,667 / 730,617, cioe'
   tre fotogrammi di spread; fra prima e dopo la differenza e' di DUE.
   E' rumore del banco, e sta dentro il suo.

   =====================================================================
   COSA NON CAMBIA. Nessuna riga di simulazione, nessun sorteggio: le
   due funzioni toccate sono pose, cioe' pura geometria di disegno, e
   prendono solo `u`.

   LA LEGGE SUI SORTEGGI, VERIFICATA E NON SPERATA
   (`node strumenti/_t3-sorteggi.js --a <prima> --b <dopo> --taglie 5,7,11`):

     taglia  5   11.094 sorteggi, 2-1, 5400 fotogrammi   IDENTICI
     taglia  7   87.774 sorteggi, 1-0, 5400 fotogrammi   IDENTICI
     taglia 11  110.261 sorteggi, 0-0, 5400 fotogrammi   IDENTICI

   col ROSSO DIMOSTRATO, perche' un cancello che non sa fallire e' un
   timbro: allo stesso gioco e' stato aggiunto UN Math.random() per
   fotogramma di gioco, e il conto e' passato a 12.200 col punteggio da
   2-1 a 1-1. Rosso.
   In piu', sui sedici match del banco lungo, i fotogrammi per partita e
   gli inizi di verbo per partita coincidono tutti e sedici; e 130 tuffi
   armati su 8 partite hanno lunghezza e direzione identiche al bit.

   IL COSTO, PRESO SUL TELEFONO E NON STIMATO. OnePlus 6, WebView vera,
   due cicli appaiati A-B-A-B da 4 giri (`_t3-tel-costo.js`), 22 figure x
   600 fotogrammi a 30 px, batteria ferma a 38,3 gradi:

     clip                 prima      dopo     scarto
     pugno   (toccata)    3,055     3,078     +0,75%
     cielo   (toccata)    3,063     3,090     +0,88%
     corsa   (controllo)  3,081     3,080     -0,02%
     tuffo   (controllo)  3,552     3,521     -0,87%
     esultanza(controllo) 3,124     3,119     -0,18%

   Le due pose nuove costano 0,023 e 0,027 ms per fotogramma su 22
   figure — dentro la banda delle clip non toccate, e lo 0,16% di un
   fotogramma da 16,7 ms, solo mentre si festeggia un gol. E il lavoro
   per fotogramma in partita (`strumenti/telefono.js`) resta 8,60 ->
   8,50 ms a 5 contro 5 e 9,50 -> 9,70 a 11 contro 11, margine 48->49%
   e 43->42%.
   Da sapere: sul telefono il rig costa TRE volte quello che costa in
   Chromium (3,1 contro 1,1 ms). Il numero desktop e' un ordinamento.

   Cancelli:  node strumenti/gabbia.js      --gioco fuori/anim-terza.html
              node strumenti/silhouette.js  --gioco fuori/anim-terza.html
              node strumenti/_t3-forgia.js  --clip pugno / --clip cielo
   Misura:    node strumenti/_t3-verbo.js --gioco <f> --partite 16 --seme 20260827
              node strumenti/_z-leggibile.js --prima-... --dopo-...

   uso:  node strumenti/_t-festa-corpo.js --in fuori/anim-terza.html \
                                          --out fuori/anim-terza.html
         node strumenti/_t-festa-corpo.js --elenco
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;

const ANCORE = [

/* 1 — PUGNO AL CIELO. Il cappello va cambiato insieme alla posa: quello
       di prima dichiarava «la sinistra resta bassa, in contrasto», che
       da oggi sarebbe falso, e questa casa non spedisce commenti che
       raccontano un'altra posa. */
{
  nome: '1/2 posePugno — il braccio libero e le gambe escono dalla massa',
  cerca:
`/* PUGNO AL CIELO: ANTICIPO la carica accucciata col pugno armato
   dietro, l'esplosione accelerata (t*t) col saltello, il pugno che
   OLTREPASSA la verticale e si assesta con l'oscillata smorzata
   (SEGUITO), PESO l'affondo sulle ginocchia all'atterraggio, la
   faccia che segue il pugno, infine il braccio che torna giu'. */
function posePugno(u){
  const ca=sm(u,0.04,0.20);                // la carica
  let t=(u-0.20)/0.12; if(t<0)t=0; else if(t>1)t=1;
  const fr=t*t;                            // l'esplosione, accelerata
  const cad=sm(u,0.34,0.50);               // la ricaduta
  const dd=(u-0.50)/0.06, att=Math.exp(-dd*dd);   // il peso dell'atterraggio
  const p=u-0.32, osc=p>0?Math.sin(p*10)*Math.exp(-4.5*p):0;  // l'overshoot del pugno
  const giu2=sm(u,0.66,0.88);              // il braccio torna giu'
  const pelvY=0.90-0.22*ca+0.48*fr-0.26*cad-0.055*att;
  const lean=0.08+0.20*ca-0.37*fr+0.17*cad+0.04*att;
  corpo(pelvY,0,lean,0);
  const hold=fr-giu2;
  cenno(-0.29*hold);                       // la faccia segue il pugno
  const sl=Math.sin(lean), cl=Math.cos(lean);
  const shY=pelvY+0.44*cl, shZ=0.44*sl;
  const aR=0.12-0.62*ca+3.62*fr-3.00*giu2+0.16*osc;
  const eR=0.30+1.55*ca-1.72*fr+0.17*giu2;
  const aL=0.12-0.55*ca+0.35*fr+0.20*giu2;   // la sinistra resta bassa, in contrasto
  const eL=0.35+0.75*ca-0.35*fr-0.40*giu2;
  braccio(SHR,ELR,HAR,  SHW, shY, shZ, aR,eR, 0.055+0.055*fr-0.055*giu2, 1);
  braccio(SHL,ELL,HAL, -SHW, shY, shZ, aL,eL, 0.09,-1);
  const kG=0.32+0.88*ca-1.20*fr+0.32*cad+0.55*att;
  const aRl=0.14+0.12*ca-0.26*fr+0.14*cad;
  const aLl=0.10-0.12*ca+0.10*fr+0.02*cad;
  gamba(HIPR,KNR,FTR,TOR,  HIPW, pelvY, 0, aRl,kG,  0.11);
  gamba(HIPL,KNL,FTL,TOL, -HIPW, pelvY, 0, aLl,kG+0.06*fr-0.06*giu2, -0.11);
}`,
  metti:
`/* PUGNO AL CIELO: ANTICIPO la carica accucciata col pugno armato
   dietro, l'esplosione accelerata (t*t) col saltello, il pugno che
   OLTREPASSA la verticale e si assesta con l'oscillata smorzata
   (SEGUITO), PESO l'affondo sulle ginocchia all'atterraggio, la
   faccia che segue il pugno, infine il braccio che torna giu'.

   GLI ARTI ESCONO DALLA MASSA, E NON E' GUSTO (29 agosto 2026).
   Questa posa era una MACCHIA NERA, e si misura col criterio che il
   provino cieco del 17 agosto ha lasciato in eredita' — lo SCAVO, la
   frazione del guscio convesso occupata da sfondo, veto 0,33 in
   strumenti/silhouette.js. All'imbardata vera della festa (pi +- 0,38)
   e alle fasi vere dei primi 1,6 s dal gol: scavo medio 0,132, ZERO
   campioni su diciotto sopra il veto. All'angolo di presentazione
   l'inchiostro valeva 0,727 contro una banda 0,28-0,52: non «una posa
   poco leggibile», un BLOCCO. E la distinzione dalla sagoma di «fermo»
   valeva 0,156 contro un veto di 0,18: il gioco non sapeva distinguere
   il suo pugno al cielo da un uomo in piedi che non fa niente.

   Le tre cose cambiate, e perche' ognuna:
     il braccio libero  stava a 0,09 di scarto laterale, incollato al
        fianco. Adesso si apre a 0,22 e va INDIETRO (-0,78 rad): fra
        braccio e busto passa lo sfondo. E' l'arto che «esce netto».
     le gambe  erano a +-0,11, cioe' 0,005 di apertura d'anca su un
        massimo di 0,75: due colonne attaccate. Adesso +-0,30 e sfalsate
        avanti/indietro (+0,64 / -0,42 rad).
     il pugno  esce dalla colonna della testa (scarto da 0,11 a 0,20).
   E il tempo: la carica finisce a u 0,12 invece che 0,20, il pugno e'
   su a u 0,21 (0,38 s dal gol invece di 0,58) e ci RESTA fino a u 0,84
   invece che 0,66 — la ripresa del gol dura 2,4 s e prima ne spendeva
   un quarto in un uomo che non ha ancora cominciato.
   Dopo: scavo medio 0,323, 13 campioni su 18 sopra il veto, inchiostro
   0,400, distinzione 0,227 (col vicino che adesso e' «esultanza», non
   «fermo»), e i tagli della scatola degli angoli da 115 a ZERO.
   I coefficienti di rientro restano risolti perche' il giro si chiuda:
   con ca=fr=cad=giu2=1 la somma dei termini non costanti fa zero in
   ognuna delle undici curve. */
function posePugno(u){
  const ca=sm(u,0.02,0.12);                // la carica
  let t=(u-0.12)/0.09; if(t<0)t=0; else if(t>1)t=1;
  const fr=t*t;                            // l'esplosione, accelerata
  const cad=sm(u,0.24,0.40);               // la ricaduta
  const dd=(u-0.40)/0.06, att=Math.exp(-dd*dd);   // il peso dell'atterraggio
  const p=u-0.21, osc=p>0?Math.sin(p*10)*Math.exp(-4.5*p):0;  // l'overshoot del pugno
  const giu2=sm(u,0.84,0.98);              // il braccio torna giu'
  const cr=ca*(1-fr);                      // «solo mentre carica»
  const pelvY=0.90-0.22*ca+0.48*fr-0.26*cad-0.055*att;
  const lean=0.08+0.20*ca-0.55*fr+0.35*cad+0.04*att;   // al culmine il petto si inarca
  corpo(pelvY,0,lean,0);
  const hold=fr-giu2;
  cenno(-0.29*hold);                       // la faccia segue il pugno
  const sl=Math.sin(lean), cl=Math.cos(lean);
  const shY=pelvY+0.44*cl, shZ=0.44*sl;
  const aR=0.12-0.62*ca+3.62*fr-3.00*giu2+0.16*osc;
  const eR=0.34+1.51*ca-1.39*fr-0.12*giu2;
  /* la sinistra NON resta bassa: si apre e va indietro. E' il
     contrappeso vero del pugno, ed e' l'arto che fa passare lo sfondo */
  const aL=0.12-0.55*ca-0.35*fr+0.90*giu2;
  const eL=0.40+0.70*ca-0.28*fr-0.42*giu2;
  /* gli scarti laterali stanno sotto 0,2225 = AB_MAX x UA del corpo con
     le braccia piu' corte (b 0,95): sopra quel numero la scatola taglia
     invece di aprire, ed e' cosi' che «cielo» si prendeva 404 correzioni */
  braccio(SHR,ELR,HAR,  SHW, shY, shZ, aR,eR, 0.13+0.05*cr+0.07*fr-0.07*giu2, 1);
  braccio(SHL,ELL,HAL, -SHW, shY, shZ, aL,eL, 0.15+0.04*cr+0.07*fr-0.07*giu2,-1);
  const kG=0.36+0.84*ca-1.12*fr+0.28*cad+0.55*att;
  const aRl=0.24+0.12*ca+0.28*fr-0.40*giu2;
  const aLl=-0.06-0.12*ca-0.24*fr+0.36*giu2;
  const apri=0.19+0.05*cr+0.11*fr-0.11*giu2;   // la forbice, non il piedistallo
  gamba(HIPR,KNR,FTR,TOR,  HIPW, pelvY, 0, aRl,kG,  apri);
  gamba(HIPL,KNL,FTL,TOL, -HIPW, pelvY, 0, aLl,kG+0.06*fr-0.06*giu2, -apri);
}`,
},

/* 2 — ESULTANZA AL CIELO */
{
  nome: '2/2 poseCielo — via i 404 tagli, e i piedi si aprono',
  cerca:
`   scende, le mani vibrano appena. Il giro non si chiude: freq 0,5 e la
   ripresa dura meno del giro, quindi u non torna mai a zero. */
function poseCielo(u){
  const ca=sm(u,0.02,0.10);                 // la carica: mezzo affondo
  const su=sm(u,0.08,0.24);                 // le braccia salgono, il petto si apre
  const p=u-0.24, osc=p>0?Math.sin(p*9.5)*Math.exp(-4.2*p):0;   // la piantata
  const resp=p>0?Math.sin(p*4.6):0;         // il respiro da fermo
  const pelvY=0.90-0.10*ca+0.03*su+0.012*resp*su;
  const lean=0.06+0.16*ca-0.36*su-0.035*osc-0.012*resp;  // petto in fuori: arco indietro
  corpo(pelvY,0,lean,0);
  cenno(-0.46*su);                                       // la faccia al cielo
  const sl=Math.sin(lean), cl=Math.cos(lean);
  const shY=pelvY+0.44*cl, shZ=0.44*sl;
  /* braccia: giu' in carica, poi su a V APERTA — gomiti piegati e fuori,
     mani sopra la testa, larghe; il respiro le fa vibrare appena */
  const aB=0.14-0.40*ca+(2.62+0.14*osc+0.03*resp)*su;
  const eB=0.30+0.45*ca+(0.36+0.06*osc-0.45*ca)*su;      // ~0.66 a regime
  const outB=0.05+0.21*su;
  braccio(SHR,ELR,HAR,  SHW, shY, shZ, aB,eB, outB, 1);
  braccio(SHL,ELL,HAL, -SHW, shY, shZ, aB*0.97,eB*1.04, outB,-1);
  /* gambe: piantate, quasi tese, una mezza avanti — un piedistallo,
     non un passo (strette: il corpo resta una figura, non una campana) */
  const kG=0.14+0.75*ca-0.06*su;
  gamba(HIPR,KNR,FTR,TOR,  HIPW, pelvY, 0,  0.16-0.05*su, kG+0.05,  0.11);
  gamba(HIPL,KNL,FTL,TOL, -HIPW, pelvY, 0, -0.10+0.03*su, kG,      -0.11);
}`,
  metti:
`   scende, le mani vibrano appena. Il giro non si chiude: freq 0,5 e la
   ripresa dura meno del giro, quindi u non torna mai a zero.

   DUE CORREZIONI MISURATE (29 agosto 2026).

   (a) LO SCARTO LATERALE DELLE BRACCIA ERA FUORI DALLA SCATOLA. Chiedeva
   0,26, e braccio() ammette |out| <= AB_MAX x UA: con le braccia piu'
   corte (corporatura 2, b 0,95) il massimo e' 0,2225. La scatola degli
   angoli riscriveva questa posa 404 volte sui 1024 angoli valutati per
   clip (64 fasi x 4 corporature x 4 arti) — il secondo peggior numero
   di tutto il catalogo dopo la scivolata — cioe' i numeri scritti qui
   sopra NON erano i numeri disegnati. Adesso chiede 0,215 e i tagli
   sono ZERO.

   (b) I PIEDI STRETTI ERANO UNA SCELTA SBAGLIATA, e si misura. Il
   commento diceva «strette: il corpo resta una figura, non una
   campana». Con i piedi a +-0,11 — cioe' 0,005 di apertura d'anca su un
   massimo di 0,75 — la sagoma di questa posa distava 0,171 da quella di
   «fermo», sotto il veto di distinzione del cancello (0,18): il gioco
   non sapeva distinguere «braccia al cielo» da «sta in piedi». E lo
   SCAVO, il criterio VETO nato dal provino cieco, valeva 0,275 contro
   un minimo di 0,33 all'angolo di presentazione, con UN campione su
   diciotto sopra la soglia all'imbardata vera della festa.
   Adesso i piedi vanno a +-0,28 e si sfalsano (+0,40 / -0,30 rad):
   scavo 0,413 all'angolo di presentazione, 13 campioni su 18 sopra il
   veto, distinzione 0,237 (e il vicino non e' piu' «fermo»). La figura
   non e' diventata una campana: il rapporto forma sta a 0,642, dentro
   la banda 0,35-1,15.

   L'estensione sagittale mediana passa da 0,4571 a 0,7238 senza che
   nessuno la inseguisse: e' la stessa apertura, letta sull'altro asse. */
function poseCielo(u){
  const ca=sm(u,0.02,0.10);                 // la carica: mezzo affondo
  const su=sm(u,0.06,0.20);                 // le braccia salgono, il petto si apre
  const p=u-0.20, osc=p>0?Math.sin(p*9.5)*Math.exp(-4.2*p):0;   // la piantata
  const resp=p>0?Math.sin(p*4.6):0;         // il respiro da fermo
  const pelvY=0.90-0.10*ca+0.03*su+0.012*resp*su;
  const lean=0.06+0.16*ca-0.36*su-0.035*osc-0.012*resp;  // petto in fuori: arco indietro
  corpo(pelvY,0,lean,0);
  cenno(-0.46*su);                                       // la faccia al cielo
  const sl=Math.sin(lean), cl=Math.cos(lean);
  const shY=pelvY+0.44*cl, shZ=0.44*sl;
  /* braccia: giu' in carica, poi su a V APERTA — gomiti piegati e fuori,
     mani sopra la testa, larghe; il respiro le fa vibrare appena.
     outB resta sotto 0,2225: vedi (a) nel cappello */
  const aB=0.14-0.40*ca+(2.62+0.14*osc+0.03*resp)*su;
  const eB=0.32+0.43*ca+(0.34+0.06*osc-0.43*ca)*su;      // ~0.66 a regime
  const outB=0.13+0.085*su;
  braccio(SHR,ELR,HAR,  SHW, shY, shZ, aB,eB, outB, 1);
  braccio(SHL,ELL,HAL, -SHW, shY, shZ, aB*0.97,eB*1.04, outB,-1);
  /* gambe: piantate, quasi tese, APERTE e sfalsate — un uomo che si
     pianta per gridare, non una colonna. Vedi (b) nel cappello */
  const kG=0.14+0.75*ca-0.06*su;
  const apri=0.19+0.09*su;
  gamba(HIPR,KNR,FTR,TOR,  HIPW, pelvY, 0,  0.24+0.16*su, kG+0.05,  apri);
  gamba(HIPL,KNL,FTL,TOL, -HIPW, pelvY, 0, -0.16-0.14*su, kG,      -apri);
}`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-festa-corpo.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
if (dentro) { console.error('FALLITO: --dentro non e\' ammesso. Si prova su copia, con --out.'); process.exit(3); }
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.festa.html';
outFile = path.resolve(RADICE, outFile);
if (path.resolve(inFile) === path.resolve(RADICE, 'CALCETTO-il-gioco.html') &&
    path.resolve(outFile) === path.resolve(inFile)) {
  console.error('FALLITO: non si scrive sul gioco spedito.'); process.exit(3);
}

const src = fs.readFileSync(inFile, 'utf8');
let out = src;
const mancanti = [];
for (const a of ANCORE) {
  const n = out.split(a.cerca).length - 1;
  if (n !== 1) { mancanti.push({ nome: a.nome, n }); continue; }
  out = out.replace(a.cerca, a.metti);
}
if (mancanti.length) {
  console.error('FALLITO: ancoraggi non trovati esattamente una volta.');
  for (const m of mancanti) console.error('  · ' + m.nome + ': trovato ' + m.n + ' volte');
  process.exit(1);
}

/* i controlli DOPO la sostituzione. Non «il file e' cambiato»: i pezzi
   vecchi devono essere spariti e i nuovi devono esserci, una volta sola. */
const attesi = [
  ['function posePugno(u){', 1],
  ['function poseCielo(u){', 1],
  ['// la sinistra resta bassa, in contrasto', 0],
  ['const outB=0.05+0.21*su;', 0],
  ['const outB=0.13+0.085*su;', 1],
  ['const apri=0.19+0.05*cr+0.11*fr-0.11*giu2;', 1],
  ['const apri=0.19+0.09*su;', 1],
  ['gamba(HIPR,KNR,FTR,TOR,  HIPW, pelvY, 0,  0.16-0.05*su, kG+0.05,  0.11);', 0],
  ['gamba(HIPL,KNL,FTL,TOL, -HIPW, pelvY, 0, -0.10+0.03*su, kG,      -0.11);', 0],
  /* la frase vecchia resta UNA volta, ma come CITAZIONE dentro il
     commento nuovo che la smentisce coi numeri: e' la differenza fra
     cancellare una scelta e scrivere perche' era sbagliata. Se ne
     comparissero due, una sarebbe ancora quella che governa la posa. */
  ['strette: il corpo resta una figura', 1],
  /* la legge dei sorteggi, verificata sul testo prima ancora che a banco:
     nessuna delle due pose puo' pescare un numero */
  ['dado(', out.split('dado(').length - 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + '  atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

/* controllo aggiuntivo: il conto dei sorteggi nel FILE non e' cambiato */
for (const nome of ['dado(', 'Math.random(', 'rnd(']) {
  const a = src.split(nome).length - 1, b = out.split(nome).length - 1;
  if (a !== b) { console.error('FALLITO: ' + nome + ' era ' + a + ', adesso ' + b); process.exit(1); }
}

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
console.log('    sorteggi nel testo: invariati (dado / Math.random / rnd)');
