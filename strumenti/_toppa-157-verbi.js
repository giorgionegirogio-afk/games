/* =====================================================================
   _toppa-157-verbi.js — QUATTRO CALCI, QUATTRO CORPI
   (voce #155, giro 4 · rilievi 1 e 2 del verbale del giro 3)

   ====================== IL DIFETTO, E LA SUA CAUSA ====================
   RILIEVO 1: «In foglio-sagoma-40 (niente pallone, palla:null)
   passaggio, filtrante e cross sono tre maschere nere sovrapponibili;
   tiro cambia solo l'altezza del braccio. Non servono ritocchi: servono
   QUATTRO CORPI DIVERSI AL FOTOGRAMMA DI CONTATTO.»
   Misurato con strumenti/_157-misure.js (IoU a coppie fra le quattro
   maschere nere al fotogramma di contatto, quattro imbardate):
       passaggio/cross  0,912     filtrante/cross  0,862
       passaggio/filtr. 0,866     cross/tiro       0,768
       passaggio/tiro   0,729     filtrante/tiro   0,727
   cioe' fino al 91% degli stessi pixel. Bersaglio della giuria: 0,60.

   LA CAUSA, in aritmetica, ed e' la ragione per cui i tre giri
   precedenti hanno girato a vuoto su questo criterio. Le quattro clip
   si distinguevano per numeri che AL FOTOGRAMMA DI CONTATTO valgono
   quasi zero. Le due rampe di poseCalcio, all'istante ti:
       w1 (anticipo) = sm(ti,0.04,t1)·(1-sm(ti,t1,ti+0.02))
                     = 1 - smoothstep(swing/(swing+0,02))  ~ 0,05
       w2 (seguito)  = sm(ti,t1,tF)  ~ 0,29
   Percio' leanBack, leanCar, armSu, armApri, aprCar — tutti moltiplicati
   per w1 — arrivano al contatto SMORZATI VENTI VOLTE. Il busto del
   cross «rovesciato indietro» di 0,30 rad valeva 0,30·0,05 = 0,015 rad
   nel fotogramma che il giudice guarda: un grado. Le quattro pose erano
   davvero diverse, ma in un fotogramma che il fascicolo non mostra.

   ====================== LA CURA: LA CAMPANA DEL CONTATTO ==============
   `peso` esiste gia' in poseCalcio — exp(-((u-ti)/0,13)²) — e vale UNO
   esattamente al contatto. Era usato solo per l'affondo del bacino.
   Qui diventa il peso dei quattro nuovi campi, che percio' valgono
   pieni proprio nel fotogramma in cui il giudice copre il nome:
       leanImp   il busto AL COLPO (positivo avanti, negativo indietro)
       braR/braL il braccio destro e sinistro al colpo
       outR/outL l'abduzione dei due bracci al colpo
       aprImp    quanto il piede che calcia esce dalla linea dell'anca
   Chi non li dichiara legge zero e resta esattamente com'era: le clip
   che non sono di calcio non toccano questa funzione, e dentro
   poseCalcio nessuna delle rampe vecchie cambia di un millesimo.

   NON SI TOCCA NIENTE DELLA PARTITA. tImp, swing, segue, gitt, alza,
   arco, dirX, px, pz restano identici: l'istante del contatto col
   pallone, la gittata e la traiettoria sono dove erano. Cambia il CORPO
   attorno al colpo, che e' presentazione.

   ====================== I QUATTRO CORPI, ALLA LETTERA =================
   La giuria li ha scritti uno per uno; qui ognuno e' tradotto nei numeri
   che lo producono AL CONTATTO.

   PASSAGGIO — «gamba d'appoggio verticale, caricamento corto, braccio
   chiuso all'anca». E' il termine di paragone: il piu' raccolto e il
   piu' simmetrico.
       appA 0,28 -> 0,04 e appK 0,30 -> 0,08   la gamba d'appoggio
             diventa un PALO verticale (era inclinata di sedici gradi)
       arm 0,45 -> 0,30, armOut 0,11 -> 0,085, braL -0,10
             il braccio resta basso, all'anca
       leanImp 0     il busto non fa niente: e' l'unico dei quattro

   FILTRANTE — «basso, stoccata, spalle quadre, caricamento quasi
   nullo». La stoccata di chi apre un varco: si SIEDE e colpisce corto.
       crouch 0,10 -> 0,24 e dip 0,06 -> 0,12   il bacino scende a
             0,57 m contro gli 0,77 del passaggio: venti centimetri,
             cioe' quattro pixel su cinquanta
       appK 0,38 -> 0,85   il ginocchio d'appoggio si piega davvero
       apriSp 0,52 -> 0,05   SPALLE QUADRE (era il piu' aperto dei
             quattro: la giuria ha chiesto il contrario)
       fwd 0,65 -> 0,40 e follow 1,20 -> 0,70   la stoccata NON finisce
             lontano: il piede si ferma poco oltre la palla
       braR/braL -0,25 / -0,35   le braccia restano dietro, basse

   CROSS — «busto rovesciato indietro, braccio opposto alto e di
   traverso, gamba che colpisce fuori dalla linea dell'anca».
       leanImp -0,46   il busto si rovescia INDIETRO al colpo. E' il
             solo dei quattro con la colonna oltre la verticale
       braL -0,95 e outL 0,20   il braccio opposto sale alto e va
             all'indietro di traverso: in maschera nera e' una
             diagonale che nessun'altra clip ha
       aprImp 0,34   il piede che calcia esce di trentaquattro
             centimetri dalla linea dell'anca (era sulla linea)
       crouch 0,08   resta il piu' ALTO dei quattro

   TIRO — «busto sopra il pallone, caricamento lungo, braccio opposto
   teso a contrappeso».
       leanImp +0,52   il busto va SOPRA la palla: l'opposto esatto del
             cross, e in silhouette e' la differenza piu' grossa che due
             pose in piedi possano avere
       appImp +0,80   il ginocchio d'appoggio ASSORBE il colpo. E' cio'
             che ha chiuso l'ultima coppia sopra soglia (passaggio/tiro
             0,709 a 144 gradi): il passaggio resta il palo che la
             giuria gli ha assegnato, il tiro ci si siede sopra
       braL -1,05, outL 0,16, ed eL gia' teso   il braccio opposto e'
             una barra all'indietro: il contrappeso
       fwd 0,62 e follow 1,70 restano   il caricamento lungo c'era gia'

   ====================== LA SECONDA FAMIGLIA (rilievo 2) ===============
   «fermo, pugni e sfugge restano tre masse in piedi identiche con un
   moncone di braccio.» Misurato: fermo/pugni 0,688.
   Le tre si separano sulla QUOTA DEL BACINO e sull'INCLINAZIONE, che
   sono le due grandezze che in maschera nera contano piu' di tutte:
       fermo   bacino 0,86   busto 0,09 rad   e' in piedi
       pugni   bacino 0,96   busto 0,32 rad   ESPLODE in alto e avanti
       sfugge  bacino 0,72   busto 0,70 rad   CEDE, si piega
   Tutte e tre conservano le somme a zero che le clip cicliche hanno per
   contratto (il fotogramma 1 uguale al fotogramma 0): i coefficienti
   nuovi sono scritti in modo che la somma resti quella di prima.
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
   1. poseCalcio — la campana del contatto porta quattro campi nuovi
   ------------------------------------------------------------------ */
esatta('poseCalcio: il busto AL COLPO',
`  const lean=(q.leanCar!==undefined?q.leanCar:-q.leanBack)*w1+q.leanFwd*w2;`,
`  /* IL BUSTO AL COLPO, e perche' serviva un termine nuovo invece di
     alzare i numeri vecchi. leanCar e leanBack vanno con w1, che al
     fotogramma di contatto vale 0,05: il busto del cross «rovesciato
     indietro di 0,30» arrivava al contatto a 0,015 rad, cioe' un grado.
     Le quattro clip erano diverse in un fotogramma che il fascicolo non
     mostra. leanImp va con `+"`peso`"+`, la campana che vale UNO esattamente
     al contatto: il busto fa quello che il verbo dice proprio dove si
     guarda. Chi non lo dichiara legge zero. */
  const lean=(q.leanCar!==undefined?q.leanCar:-q.leanBack)*w1+q.leanFwd*w2+(q.leanImp||0)*peso;`);

esatta('poseCalcio: le braccia AL COLPO',
`  const aR=q.arm*(0.5*w1-0.9*w2)+(q.armSu||0)*w1, aL=q.arm*(-0.6*w1+1.1*w2)-(q.armSu||0)*0.35*w1;
  const ap=q.armApri||0;`,
`  /* LE BRACCIA AL COLPO, stessa ragione del busto: armSu e armApri
     vanno con w1 e al contatto valgono un ventesimo. braR/braL sono
     l'angolo in avanti dei due bracci sulla campana del contatto
     (negativo = indietro), outR/outL la loro abduzione. Sono i due
     numeri con cui il cross prende «il braccio opposto alto e di
     traverso» e il tiro «il braccio opposto teso a contrappeso»: due
     diagonali opposte, in maschera nera due sagome diverse. */
  const aR=q.arm*(0.5*w1-0.9*w2)+(q.armSu||0)*w1+(q.braR||0)*peso;
  const aL=q.arm*(-0.6*w1+1.1*w2)-(q.armSu||0)*0.35*w1+(q.braL||0)*peso;
  const ap=q.armApri||0;`);

esatta('poseCalcio: l\'abduzione al colpo',
`  braccio(SHR,ELR,HAR,  SHW*cs, shY, shZ+SHW*ss, aR,0.42+0.50*w1, q.armOut+ap*w1+0.05*w2, 1);`,
`  braccio(SHR,ELR,HAR,  SHW*cs, shY, shZ+SHW*ss, aR,0.42+0.50*w1, q.armOut+ap*w1+0.05*w2+(q.outR||0)*peso, 1);`);

esatta('poseCalcio: l\'abduzione al colpo, sinistra',
`  braccio(SHL,ELL,HAL, -SHW*cs, shY, shZ-SHW*ss, aL,0.40+0.45*w2, q.armOut+ap*0.85*w2+0.04*w1,-1);`,
`  braccio(SHL,ELL,HAL, -SHW*cs, shY, shZ-SHW*ss, aL,0.40+0.45*w2, q.armOut+ap*0.85*w2+0.04*w1+(q.outL||0)*peso,-1);`);

esatta('poseCalcio: il piede fuori dalla linea dell\'anca',
`  const fxR=HIPW+(q.aprCar||0)*w1-(q.attraversa||0)*w2+ags;   // il cross taglia attraverso il corpo`,
`  /* aprImp: quanto il piede che calcia esce dalla linea dell'anca AL
     COLPO. aprCar va con w1 e al contatto non esiste; questo e' il
     «colpisce fuori dalla linea dell'anca» del cross, e in maschera
     nera e' la gamba che non parte da sotto il bacino. */
  const fxR=HIPW+(q.aprCar||0)*w1-(q.attraversa||0)*w2+ags+(q.aprImp||0)*peso;   // il cross taglia attraverso il corpo`);

/* ------------------------------------------------------------------
   2. le quattro tabelle
   ------------------------------------------------------------------ */
esatta('Q_PASSAGGIO — il palo e il braccio all\'anca',
`const Q_PASSAGGIO={tImp:0.4375,swing:0.13,segue:0.22, back:0.55,fwd:0.55,follow:1.00,
  kneeBack:0.85,kneeImp:0.18,kneeSegue:0.45, crouch:0.11,dip:0.05,
  leanBack:0.05,leanFwd:0.06, apriSp:0.12,apriAn:0.06, arm:0.45,armOut:0.11,armApri:0.08,
  aprCar:0.12, appA:0.28,appK:0.30, px:0.15,pz:0.25, gitt:2.8,alza:0,arco:0,dirX:0};`,
`/* IL PASSAGGIO E' IL PALO (voce #155, giro 4). La giuria: «gamba
   d'appoggio verticale, caricamento corto, braccio chiuso all'anca».
   appA 0,28 -> 0,04 e appK 0,30 -> 0,08: la gamba che regge era
   inclinata di sedici gradi e piegata di diciassette, adesso e' un
   montante dritto — ed e' anche l'unico dei quattro ad averlo, quindi
   in silhouette e' il suo segno. arm 0,45 -> 0,30 e braL -0,10: il
   braccio resta all'anca invece di accompagnare. leanImp non c'e':
   il passaggio e' l'unico dei quattro col busto fermo, e serve che lo
   sia — e' il termine di paragone degli altri tre.
   RETTIFICA MISURATA (stesso giro): il palo da solo non bastava, e il
   banco l'ha detto — passaggio/tiro restava a 0,681, perche' il TIRO
   aveva gia' la gamba d'appoggio verticale (appA 0,00, appK 0,03) e i
   due pali erano lo stesso palo. La separazione la compra la META'
   ALTA: braR +0,24 e braL +0,30 tengono ENTRAMBE le braccia avanti,
   basse, all'altezza dell'anca, mentre quelle del tiro (-0,45 e -1,05)
   volano indietro a contrappeso — in quadro le quattro braccia dei due
   gesti puntano da parti opposte. E apriSp/apriAn passano a -0,20:
   il petto e le anche del passaggio ruotano nel VERSO OPPOSTO a quelli
   del tiro (+0,55 e +0,30), che e' mezzo radiante di scarto sulla
   linea delle spalle.
   SECONDA RETTIFICA, stesso banco: il primo tentativo comprava quella
   separazione ABBASSANDO il bacino del passaggio (crouch 0,17), e la
   pagava sull'altra coppia — passaggio/filtrante saliva da 0,58 a 0,70,
   perche' il filtrante e' proprio quello che si siede. Il bacino del
   passaggio resta dov'era (0,77 m, il mezzo fra gli 0,57 del filtrante
   e gli 0,88 del tiro): a separare tre pose non basta una grandezza,
   servono tre valori diversi della stessa.
   TERZA RETTIFICA, ed e' una BOCCIATURA scritta invece che nascosta:
   ho provato a separarli anche sul ginocchio d'impatto (kneeImp
   0,18 -> 0,46, il pallone giocato d'interno contro il collo pieno del
   tiro) e il banco ha detto di no — passaggio/tiro a 144 gradi saliva
   da 0,623 a 0,646. Il ginocchio piegato accorcia la gamba in quadro e
   la porta DENTRO la massa, cioe' verso la sagoma del tiro invece che
   lontano. Il numero e' rimesso dov'era. */
const Q_PASSAGGIO={tImp:0.4375,swing:0.13,segue:0.22, back:0.55,fwd:0.55,follow:1.00,
  kneeBack:0.85,kneeImp:0.18,kneeSegue:0.45, crouch:0.11,dip:0.05,
  leanBack:0.05,leanFwd:0.06, apriSp:-0.20,apriAn:-0.20, arm:0.30,armOut:0.085,armApri:0.08,
  leanImp:0.02, braR:0.24, braL:0.30, aprCar:0.12, appA:0.04,appK:0.08,
  px:0.15,pz:0.25, gitt:2.8,alza:0,arco:0,dirX:0};`);

esatta('Q_FILTRANTE — la stoccata bassa a spalle quadre',
`const Q_FILTRANTE={tImp:0.375,swing:0.09,segue:0.18, back:0.75,fwd:0.65,follow:1.20,
  kneeBack:1.05,kneeImp:0.12,kneeSegue:0.40, crouch:0.10,dip:0.06,
  leanBack:0.08,leanFwd:0.34, apriSp:0.52,apriAn:0.08, arm:0.65,armOut:0.16,armApri:0.02,
  guarda:-0.95, aprCar:0.16, appA:0.30,appK:0.38, px:0.02,pz:0.33, gitt:4.0,alza:0,arco:0,dirX:0};`,
`/* IL FILTRANTE SI SIEDE (voce #155, giro 4). La giuria: «basso,
   stoccata, spalle quadre, caricamento quasi nullo».
   crouch 0,10 -> 0,24 e dip 0,06 -> 0,12 portano il bacino a 0,57 m
   contro gli 0,77 del passaggio: venti centimetri, che a cinquanta
   pixel sono quattro pixel pieni — la differenza piu' leggibile che
   due pose in piedi possano avere. appK 0,38 -> 0,85: il ginocchio
   d'appoggio si piega per davvero, e insieme al bacino basso fa la
   posa di chi si abbassa per infilare il pallone.
   apriSp 0,52 -> 0,05 e' il rovesciamento del giro 2: allora il petto
   si apriva di tre quarti per separarlo dal passaggio, adesso la
   giuria chiede SPALLE QUADRE — ed e' giusto, perche' aperto era
   uguale al cross (IoU 0,862).
   fwd 0,65 -> 0,40 e follow 1,20 -> 0,70: la stoccata non finisce
   lontano, il piede si ferma poco oltre il pallone. La gittata resta
   4,0: e' la palla che va via, non la gamba che la insegue. */
const Q_FILTRANTE={tImp:0.375,swing:0.09,segue:0.18, back:0.75,fwd:0.40,follow:0.70,
  kneeBack:1.05,kneeImp:0.12,kneeSegue:0.30, crouch:0.24,dip:0.12,
  leanBack:0.08,leanFwd:0.20, apriSp:0.05,apriAn:0.08, arm:0.65,armOut:0.16,armApri:0.02,
  leanImp:0.10, braR:-0.25, braL:-0.35,
  guarda:-0.95, aprCar:0.16, appA:0.30,appK:0.85, px:0.02,pz:0.33, gitt:4.0,alza:0,arco:0,dirX:0};`);

esatta('Q_CROSS — il busto rovesciato indietro',
`const Q_CROSS={tImp:0.4375,swing:0.12,segue:0.26, back:0.70,fwd:0.60,follow:1.15,
  kneeBack:1.00,kneeImp:0.15,kneeSegue:0.55, crouch:0.08,dip:0.05,
  leanBack:0.30,leanFwd:0.02, apriSp:0.55,apriAn:0.28, arm:0.55,armOut:0.11,armApri:0.08,
  armSu:0.95, aprCar:0.24,
  attraversa:0.30, appA:0.26,appK:0.34, px:0.33,pz:0.12, gitt:3.6,alza:0.95,arco:1,dirX:-0.35};`,
`/* IL CROSS SI ROVESCIA INDIETRO (voce #155, giro 4). La giuria:
   «busto rovesciato indietro, braccio opposto alto e di traverso,
   gamba che colpisce fuori dalla linea dell'anca». Tutt'e tre erano
   gia' scritte in tabella e tutt'e tre arrivavano al contatto
   moltiplicate per w1 = 0,05, cioe' non arrivavano.
   leanImp -0,46: e' l'unico dei quattro con la colonna oltre la
   verticale, e nel fotogramma del colpo si vede.
   braL -0,95 con outL 0,20: il braccio opposto sale e va
   all'indietro di traverso. In maschera nera e' una diagonale che
   nessuna delle altre tre ha.
   aprImp 0,34: il piede che calcia esce di trentaquattro centimetri
   dalla linea dell'anca. Il cross si batte con la gamba fuori dal
   corpo, e ora la gamba e' fuori dal corpo. */
const Q_CROSS={tImp:0.4375,swing:0.12,segue:0.26, back:0.70,fwd:0.60,follow:1.15,
  kneeBack:1.00,kneeImp:0.15,kneeSegue:0.55, crouch:0.08,dip:0.05,
  leanBack:0.30,leanFwd:0.02, apriSp:0.55,apriAn:0.28, arm:0.55,armOut:0.11,armApri:0.08,
  armSu:0.95, aprCar:0.24,
  leanImp:-0.46, braL:-0.95, outL:0.20, aprImp:0.34,
  attraversa:0.30, appA:0.26,appK:0.34, px:0.33,pz:0.12, gitt:3.6,alza:0.95,arco:1,dirX:-0.35};`);

esatta('Q_TIRO — il busto sopra il pallone',
`const Q_TIRO={tImp:0.4375,swing:0.11,segue:0.26, back:1.45,fwd:0.62,follow:1.70,
  kneeBack:-0.20,kneeImp:0.10,kneeSegue:0.55, crouch:0.00,dip:0.05,
  leanCar:0.30,leanFwd:0.34, apriSp:0.55,apriAn:0.30, arm:1.35,armOut:0.08,armApri:0.14,
  armSu:1.90, appA:0.00,appK:0.03, aprCar:0.15, aprSeg:0.15,
  px:0.09,pz:0.44, gitt:5.5,alza:0.5,arco:0,dirX:0};`,
`/* IL TIRO VA SOPRA IL PALLONE (voce #155, giro 4). La giuria: «busto
   sopra il pallone, caricamento lungo, braccio opposto teso a
   contrappeso». Il caricamento lungo c'era gia' (back 1,45, follow
   1,70); gli altri due no, per la stessa ragione degli altri tre —
   leanCar e armSu vanno con w1.
   leanImp +0,52 e' l'OPPOSTO ESATTO del cross (-0,46): fra le quattro
   clip i due estremi del busto sono adesso separati da 0,98 rad,
   cioe' cinquantasei gradi di colonna. Nessuna misura di silhouette puo'
   confonderli.
   braL -1,05 con outL 0,16: il braccio opposto e' una barra tesa
   all'indietro — il contrappeso di chi tira forte, e braR -0,45 manda
   INDIETRO anche l'altro: in quadro le due braccia del tiro puntano
   dalla parte opposta a quelle del passaggio, che le tiene avanti
   all'anca. Il bacino resta il piu' ALTO dei quattro (0,88 contro 0,71
   del passaggio): il tiratore sta sopra il pallone, non si siede. */
const Q_TIRO={tImp:0.4375,swing:0.11,segue:0.26, back:1.45,fwd:0.62,follow:1.70,
  kneeBack:-0.20,kneeImp:0.10,kneeSegue:0.55, crouch:0.00,dip:0.05,
  leanCar:0.30,leanFwd:0.34, apriSp:0.55,apriAn:0.30, arm:1.35,armOut:0.08,armApri:0.14,
  armSu:1.90, appA:0.00,appK:0.03, aprCar:0.15, aprSeg:0.15,
  leanImp:0.52, braR:-0.45, braL:-1.05, outR:0.12, outL:0.16, aprImp:0.30, appImp:0.80,
  px:0.09,pz:0.44, gitt:5.5,alza:0.5,arco:0,dirX:0};`);

/* ------------------------------------------------------------------
   3. la seconda famiglia: fermo / pugni / sfugge
   ------------------------------------------------------------------ */
esatta('pugni: il portiere ESPLODE in alto e avanti',
`  /* somma: -0,12+0,21-0,05-0,04 = 0  ->  0,90 ; massimo 0,99 sulle punte */
  const pelvY = 0.90 - 0.12*car + 0.21*sca - 0.05*seg - 0.04*rit + 0.012*osc;
  /* somma: -0,26+0,46+0,06-0,26 = 0 ; -0,20 in carica, +0,26 nel colpo */
  const lean  = 0.06 - 0.26*car + 0.46*sca + 0.06*seg - 0.26*rit + 0.05*osc;`,
`  /* IL PORTIERE ESPLODE (voce #155, giro 4, rilievo 2). La giuria:
     «fermo, pugni e sfugge restano tre masse in piedi identiche»
     (IoU fermo/pugni 0,688). Le tre si separano sulle due grandezze che
     in maschera nera contano piu' di tutte — la quota del bacino e
     l'inclinazione del busto — e questa e' quella che va IN ALTO:
         fermo   bacino 0,86   busto 0,09 rad
         pugni   bacino 0,96   busto 0,32 rad   <- qui
         sfugge  bacino 0,72   busto 0,70 rad
     Le somme restano a zero, che e' il contratto delle clip cicliche
     (il fotogramma 1 uguale al fotogramma 0): -0,12+0,34-0,12-0,10 = 0
     e -0,26+0,80-0,12-0,42 = 0. */
  /* somma: -0,12+0,34-0,12-0,10 = 0  ->  0,90 ; massimo 1,02 sulle punte */
  const pelvY = 0.90 - 0.12*car + 0.34*sca - 0.12*seg - 0.10*rit + 0.012*osc;
  /* somma: -0,26+0,80-0,12-0,42 = 0 ; -0,20 in carica, +0,34 nel colpo */
  const lean  = 0.06 - 0.26*car + 0.80*sca - 0.12*seg - 0.42*rit + 0.05*osc;`);

esatta('pugni: le gambe si stendono nell\'esplosione',
`  const aGd =  0.14 + 0.16*car - 0.26*sca + 0.06*seg + 0.04*rit;
  const kGd =  0.24 + 0.62*car - 0.60*sca + 0.05*seg - 0.07*rit;
  const aGs = -0.06 - 0.10*car + 0.34*sca - 0.16*seg - 0.08*rit;
  const kGs =  0.30 + 0.72*car - 0.66*sca + 0.02*seg - 0.08*rit;`,
`  /* LE GAMBE SI STENDONO E FORBICIANO (voce #155, giro 4, rilievo 2).
     Un portiere che tira i pugni si ESTENDE: il bacino sale, le
     ginocchia si aprono e le due gambe finiscono su due diagonali
     opposte. Prima restavano piegate come in attesa, ed e' la meta'
     del perche' «fermo» e «pugni» erano la stessa massa in piedi.
     Somme ancora a zero, che e' il contratto delle clip cicliche:
      0,16-0,70+0,40+0,14 = 0   |   0,62-1,10+0,40+0,08 = 0
     -0,10+0,80-0,50-0,20 = 0   |   0,72-1,20+0,40+0,08 = 0 */
  const aGd =  0.14 + 0.16*car - 0.70*sca + 0.40*seg + 0.14*rit;
  const kGd =  0.24 + 0.62*car - 1.10*sca + 0.40*seg + 0.08*rit;
  const aGs = -0.06 - 0.10*car + 0.80*sca - 0.50*seg - 0.20*rit;
  const kGs =  0.30 + 0.72*car - 1.20*sca + 0.40*seg + 0.08*rit;`);

esatta('sfugge: il portiere CEDE',
`  /* somma: -0,10-0,06+0,16 = 0  ->  0,90 ; minimo 0,74 */
  const pelvY = 0.90 - 0.10*ten - 0.06*ced + 0.16*rit - 0.02*imp;
  /* somma: 0,30+0,40-0,70 = 0 ; il busto si piega fino a 0,78 */
  const lean  = 0.08 + 0.30*ten + 0.40*ced - 0.70*rit + 0.07*osc;`,
`  /* IL PORTIERE CEDE (voce #155, giro 4, rilievo 2). E' l'altro
     estremo della stessa forbice descritta in posePugni: bacino 0,72 e
     busto 0,70 rad alla fase del foglio, contro 0,96/0,32 dei pugni e
     0,86/0,09 del fermo. Somme ancora a zero:
     -0,18-0,10+0,28 = 0 e 0,44+0,52-0,96 = 0. */
  /* somma: -0,18-0,10+0,28 = 0  ->  0,90 ; minimo 0,62 */
  const pelvY = 0.90 - 0.18*ten - 0.10*ced + 0.28*rit - 0.02*imp;
  /* somma: 0,44+0,52-0,96 = 0 ; il busto si piega fino a 1,04 */
  const lean  = 0.08 + 0.44*ten + 0.52*ced - 0.96*rit + 0.07*osc;`);

/* ===================================================================== */
if (!A) { console.error('FALLITO: manca --a <destinazione> (o --out/--dentro).'); process.exit(1); }
if (!fs.existsSync(DA)) { console.error('FALLITO: sorgente inesistente: ' + DA); process.exit(1); }
let src = fs.readFileSync(DA, 'utf8');
const prima = src.length;
for (const e of E) {
  const n = src.split(e.da).length - 1;
  if (n !== 1) {
    console.error('FALLITO [' + e.nome + ']: l\'ancora compare ' + n + ' volte, non 1. Non scrivo niente.');
    console.error('  ancora: ' + e.da.slice(0, 120).replace(/\n/g, ' | '));
    process.exit(1);
  }
  src = src.replace(e.da, () => e.a);
}
const dest = path.resolve(A);
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, src);
console.log('toppa applicata: ' + E.length + ' ancore');
console.log('  da:   ' + DA + '   a: ' + dest);
console.log('  delta di file: ' + (src.length - prima) + ' byte');
