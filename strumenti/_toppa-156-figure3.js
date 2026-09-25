/* =====================================================================
   _toppa-156-figure3.js — LE FIGURE, GIRO 3.

   Applica le riparazioni che la giuria della voce #155 ha chiesto dopo
   il giro 2, ognuna ancorata a una stringa che nel gioco compare UNA
   volta sola. Se un'ancora manca o compare due volte non scrive niente:
   una toppa che indovina dove mettere le mani non e' una toppa.

   L'ORDINE E' QUELLO DEI RILIEVI DELLA GIURIA.

   USO:
     node strumenti/_toppa-156-figure3.js --a fuori/p1.html
     node strumenti/_toppa-156-figure3.js --dentro
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const DA = path.join(RADICE, 'CALCETTO-il-gioco.html');
const iA = process.argv.indexOf('--a');
const DENTRO = process.argv.includes('--dentro');
const A = DENTRO ? DA : (iA > 0 ? process.argv[iA + 1] : '');

const E = [];
const esatta = (nome, da, a) => E.push({ nome, da, a });

/* =====================================================================
   1 — C3, LA SAGOMA: LA SPALLA SI STACCA DAL BUSTO.

   IL RILIEVO: «a 40 px il tronco deve essere piu' largo degli arti; la
   leva provata e rimessa era HIPW, la leva giusta e' il rapporto
   SPALLE/ARTI, non il bacino».

   IL CONTO CHE LA RENDE UNA LEVA E NON UN GUSTO. Perche' un braccio si
   stacchi in maschera nera serve, alla riga del gomito:
       SHW + out  >  mezzo busto + mezzo braccio + due contorni
   Con i numeri di ieri (SHW 0,220, mezzo busto alla riga del gomito
   0,116, mezzo braccio 0,069, contorno 0,033 per lato) serviva
   out > 0,051; con SHW 0,250 e il busto allargato in cima serve
   out > 0,014. Non e' una posa aggiustata: e' la STESSA posa che adesso
   si stacca. Ed e' il motivo per cui le sei pose riscritte piu' sotto
   comprano molto di piu' di quanto comprerebbero da sole.

   E IL BACINO SMETTE DI ESSERE LA PARTE PIU' LARGA. Misurato con
   strumenti/_156-profilo.js sulla clip 'fermo' a 40 px: la barra dei
   fianchi usciva 14,4 px contro i 9,8 del petto, cioe' la figura era
   una PERA. A 0,235 la barra sta sotto le spalle e la V esiste.
   ===================================================================== */
esatta('misure — spalle',
`const N_THIGH=0.46, N_SHIN=0.45, N_UA=0.27, N_FA=0.25, N_FOOT=0.145,
      N_SHW=0.22, N_HEADR=0.179;`,
`/* =====================================================================
   LE SPALLE SALGONO DA 0,22 A 0,25 (voce #155, giro 3), E IL BUSTO
   SALE CON LORO. Il riquadro qui sopra raccontava la manovra di ieri
   (0,20 -> 0,22) e si ferma li': questo e' il suo seguito, e la ragione
   non e' «un po' di piu'», e' una DISUGUAGLIANZA.
   Perche' un braccio appeso si stacchi dal tronco in maschera nera
   serve, alla riga del gomito:
       SHW + out  >  mezzo busto li' + mezzo braccio + due contorni
   A 0,220 il secondo membro valeva 0,218 e serviva out > 0,051: cioe'
   NESSUNA posa a braccia rilassate poteva staccarsi, per geometria.
   A 0,250 serve out > 0,014. Le pose non sono cambiate di un grado e
   l'arto si vede: e' la leva che la giuria ha nominato.
   NON E' UN FRIGORIFERO, e il conto e' lo stesso di allora: il rapporto
   spalle/petto resta 0,250/0,390 = 0,64, identico a 0,220/0,345. La
   figura si allarga in cima del 13% MANTENENDO le sue proporzioni, e la
   vita non si muove — cioe' la V si apre invece di sparire. */
const N_THIGH=0.46, N_SHIN=0.45, N_UA=0.27, N_FA=0.25, N_FOOT=0.145,
      N_SHW=0.25, N_HEADR=0.179;`);

esatta('misure — MSH',
`let MSP=1;       // moltiplicatore di SPESSORE degli arti (solo disegno)`,
`let MSP=1;       // moltiplicatore di SPESSORE degli arti (solo disegno)
/* LA CARRUCOLA DELLE SPALLE (voce #155, giro 3, criterio C6). La giuria
   ha misurato che «sh 1,12 non arriva alla maschera»: era vero, perche'
   sh spostava soltanto il GIUNTO della spalla, mentre le due larghezze
   che in nero si vedono davvero — la cima del trapezio del busto e la
   barra dei fianchi — erano costanti per tutti e quattro.
   MSH le fa seguire la corporatura. NON tocca W_VITA: la finestra della
   sonda del contrasto di collaudo.js sta al PIEDE del tronco, dove il
   trapezio e' largo W_VITA, e quella larghezza resta la stessa per
   tutti — il tarchiato si compra in cima, dove nessuna sonda guarda. */
let MSH=1;       // moltiplicatore di LARGHEZZA di spalle e bacino`);

esatta('corpora — MSH',
`  MSP=q.sp;`,
`  MSP=q.sp; MSH=q.sh;`);

esatta('W_PETTO',
`const W_PETTO=0.345, W_VITA=0.195;`,
`/* W_PETTO 0,345 -> 0,390 E SEGUE LA CORPORATURA (voce #155, giro 3).
   Le spalle sono uscite a 0,250 (vedi il riquadro delle misure): un
   trapezio fermo a 0,345 avrebbe lasciato fra il tronco e i due
   deltoidi una gola che a quaranta pixel legge come un buco, non come
   una spalla. Il rapporto spalle/petto resta quello di ieri.
   W_VITA NON SI MUOVE, e non e' pigrizia: la finestra della sonda del
   contrasto di collaudo.js pesca al PIEDE del tronco, dove il trapezio
   e' largo W_VITA. Stringere li' varrebbe mezzo pixel di sagoma e
   costerebbe il cancello del contrasto — che e' il primo dei rischi
   dichiarati dell'onda. */
const W_PETTO=0.390, W_VITA=0.195;`);

esatta('troncoQuad — MSH',
`  const wa=W_VITA*s*0.5+extra, wb=W_PETTO*s*0.5+extra;`,
`  const wa=W_VITA*s*0.5+extra, wb=W_PETTO*MSH*s*0.5+extra;`);

esatta('motivo — MSH',
`    const oa=0.607*W_VITA*0.5*s, ob=0.607*W_PETTO*0.5*s, w=0.0717*s;`,
`    const oa=0.607*W_VITA*0.5*s, ob=0.607*W_PETTO*MSH*0.5*s, w=0.0717*s;`);

esatta('SEGS — barra dei fianchi',
`  {a:HIPL,  b:HIPR, w:0.30, c:'pantaloncini', bias: 0.100, kind:0},`,
`  /* LA BARRA RESTA 0,30, E IL PERCHE' E' UN ROSSO PAGATO (voce #155,
     giro 3). Provata a 0,235 con questa ragione: a quaranta pixel la
     barra usciva 14,4 px di estensione contro i 9,8 del petto, cioe'
     la parte PIU' LARGA della figura stava al bacino — una pera, non
     un atleta. Misurato con strumenti/silhouette.js: il cancello e'
     passato da verde a 5 azioni nominabili su 10, e le 65 righe fuori
     misura erano TUTTE «masse». Il riquadro qui sopra lo diceva gia' e
     aveva ragione: «un minimo locale esiste solo se sotto di lui
     RISALE una massa». Stringendo il bacino la vita smette di essere
     un minimo e la figura torna un ovale con le gambe.
     La pera si cura dall'altro capo, e cosi' e' stata curata: il petto
     e' salito a 0,390 e le spalle a 0,250, quindi la parte piu' larga
     e' tornata in alto senza togliere niente alla V della vita.
     lar:1 = la larghezza segue la corporatura (MSH): e' meta' di come
     il tarchiato compra la sua larghezza in maschera nera. */
  {a:HIPL,  b:HIPR, w:0.30, c:'pantaloncini', bias: 0.100, kind:0, lar:1},`);

esatta('larghezza — passata del contorno',
`    const w=g.w*(g.arti?MSP:1)*s*((lodOn&&(g.b===HAR||g.b===HAL))?0.80:1);
    ctx.lineWidth=(w<1.1?1.1:w)+2*bp;`,
`    const w=g.w*(g.arti?MSP:g.lar?MSH:1)*s*((lodOn&&(g.b===HAR||g.b===HAL))?0.80:1);
    ctx.lineWidth=(w<1.1?1.1:w)+2*bp;`);

esatta('larghezza — passata a colori',
`    const w=g.w*(g.arti?MSP:1)*s*((lodOn&&(g.b===HAR||g.b===HAL))?0.80:1), W=w<1.1?1.1:w;`,
`    const w=g.w*(g.arti?MSP:g.lar?MSH:1)*s*((lodOn&&(g.b===HAR||g.b===HAL))?0.80:1), W=w<1.1?1.1:w;`);

/* =====================================================================
   1bis — C2/C3, LA TESTA SI STACCA DALLE SPALLE. IL CONTO, AL PIXEL.

   IL RILIEVO: «C2 arriva a 4 quando la testa smette di essere un disco
   con una fetta e acquista COLLO e volume». E guardando il foglio in
   nero a quaranta pixel si vede anche perche' C3 non saliva: in tutte e
   ventisette le celle la cima della figura e' UN GROSSO GRUMO — testa,
   collo e spalle saldati in una cappa sola. Non c'era una riga in cui
   ci fosse soltanto il collo, e il perche' e' aritmetica.

   LA CAMERA SCRIVE LE DUE DIREZIONI CON DUE SCALE DIVERSE. La quota
   rende hPx/1,9 = 21,05 px al metro; la LARGHEZZA rende
   hPx/(1,9 cos42) = 28,3, perche' la s la normalizza. La testa e' una
   SFERA, quindi il suo raggio a schermo lo scrive la seconda scala; il
   collo e' verticale puro e lo scrive la prima. A quaranta pixel:
       fondo del cranio sotto il suo centro  0,179 x 28,3 + 0,93 = 5,99
       cima del tronco sotto lo stesso       0,25  x 21,05      = 5,26
   cioe' il cranio finiva 0,73 px DENTRO il tronco. Nessun allungamento
   del collo sotto 0,285 m poteva aprire quella riga: era impossibile
   per geometria, non difficile. Il giro precedente era passato da 0,19
   a 0,25 e aveva comprato mezzo pixel su una soglia di 0,285.

   LE DUE MANOPOLE, GIRATE INSIEME:
     HEADR  0,179 -> 0,160   il cranio scende a 5,46 px di raggio
     collo  0,25  -> 0,32    il tronco finisce a 6,74 px
   Restano 1,28 px di sole righe di collo: a quaranta pixel e' una riga
   piena, a cinquanta (la taglia della partita) sono due.

   E LA CIMA DELLA TESTA NON SALE PIU' DI QUANTO SCENDE. E' l'invariante
   che protegge la sonda dell'ERBA di collaudo.js, e va contata, non
   promessa: il centro del cranio sale di 7 cm e il raggio cala di
   1,9 cm, quindi la cima sale di 5,1 cm — 1,07 unita' di schermo. Il
   margine dichiarato nel riquadro di HEADR e' di 1,7 unita'. Sta
   dentro, ed e' MISURATO dal cancello, non dedotto: se collaudo.js
   diventa rosso questa riga non ha pagato il suo prezzo e va rifatta.

   LA TESTA DIVENTA ANCHE PIU' PICCOLA DELLE SPALLE, che e' la seconda
   meta' del rilievo C3. Con la nuca il cranio misura 11,7 px di
   larghezza contro i 12,9 della cima del tronco: prima erano 12,9
   contro 10,7, cioe' la parte piu' larga della meta' alta era la testa.
   ===================================================================== */
esatta('misure — il cranio',
`      N_SHW=0.25, N_HEADR=0.179;`,
`      N_SHW=0.27, N_HEADR=0.160;`);

esatta('corpo — il tronco scende, la testa resta dov\'e\'',
`  setJ(PELVIS, sway+0.06*dx, pelvY+0.06*ey, 0.06*ez);
  setJ(CHEST,  sway+0.355*dx, pelvY+0.355*ey, 0.355*ez);
  setJ(NECK,   sway+0.46*dx, pelvY+0.46*ey, 0.46*ez);`,
`  /* IL TRONCO FINISCE PIU' IN BASSO E LA CIMA DELLA TESTA NON SI MUOVE
     (voce #155, giro 3). Il collo va allungato a 0,32 perche' il fondo
     del cranio esca dal tronco (il conto sta nel riquadro di N_HEADR),
     e ci sono due modi: alzare la testa o abbassare il collo. Il primo
     e' stato PROVATO E BOCCIATO dal banco ?gabbia — la cima della testa
     saliva a -35,40 unita' contro il riferimento -34,6, cioe' capelli
     dentro l'anello d'erba della sonda di collaudo.js. Il secondo non
     tocca la cima di un millimetro: NECK scende da 0,46 a 0,39, il
     collo si allunga da 0,25 a 0,32, e 0,39+0,32 = 0,71 e' esattamente
     dove il cranio stava ieri.
     CHEST scende in proporzione (resta al 73,75% del tronco), e le
     SPALLE scendono con lui — vedi SPALLA_GIU dentro braccio(). */
  setJ(PELVIS, sway+0.06*dx, pelvY+0.06*ey, 0.06*ez);
  setJ(CHEST,  sway+0.3034*dx, pelvY+0.3034*ey, 0.3034*ez);
  setJ(NECK,   sway+0.39*dx, pelvY+0.39*ey, 0.39*ez);`);

esatta('corpo — il cranio resta a 0,71',
`  setJ(HEAD, sway+0.46*dx+0.25*hx, pelvY+0.46*ey+0.25*hk*chl, 0.46*ez+0.25*hk*shl);`,
`  setJ(HEAD, sway+0.39*dx+0.32*hx, pelvY+0.39*ey+0.32*hk*chl, 0.39*ez+0.32*hk*shl);`);

/* LE SPALLE NON SCENDONO, E IL PERCHE' E' DUE ROSSI MISURATI. Il
   tronco finisce adesso a 0,39 mentre i giunti delle spalle restano a
   0,44, cioe' cinque centimetri SOPRA la cima del trapezio: le due
   calotte del deltoide sporgono ai lati del collo come due bozzi, che
   e' anche come sta fatta una spalla vista dall'alto.
   FARLE SCENDERE ERA LA PRIMA STESURA, ed e' stata bocciata da due
   banchi diversi con un giro solo di misura:
     ?gabbia      rovesciata e tuffo mandavano la mano a -0,098 e -0,053
                  sotto il manto (il tetto e' -0,050): sei centimetri di
                  spalla in meno sono sei centimetri di mano in meno, e
                  in quelle due clip la mano e' gia' per terra;
     silhouette   «sta fermo» perdeva una strozzatura (masse 2 -> 1) e
                  il cancello scendeva da 8 azioni nominabili a 7. La
                  causa, letta riga per riga con _156-profilo.js: la
                  mano abbassata di sei centimetri cadeva ESATTAMENTE
                  sulla riga della barra dei fianchi e ne riempiva il
                  minimo — la V della vita passava da 28% di profondita'
                  a 21%, sotto il 25% che il criterio chiede.
   Il collo si compra abbassando il TRONCO, e basta: le spalle restano
   dove stavano da un anno. */
esatta('OSSA — il tronco nel foglio del banco',
`  {n:'busto',        a:PELVIS,b:NECK, f:()=>0.40},
  {n:'pelvi-torace', a:PELVIS,b:CHEST,f:()=>0.295},
  {n:'torace-collo', a:CHEST, b:NECK, f:()=>0.105},`,
`  /* IL TRONCO SI ACCORCIA DI SETTE CENTIMETRI E IL COLLO SE LI PRENDE
     (voce #155, giro 3): 0,40 -> 0,33, e 0,25 -> 0,32. La somma non si
     muove — 0,65 collo compreso — quindi la cima della testa resta dove
     stava e l'anello d'erba di collaudo.js misura le stesse cose. E'
     la terza volta che queste quattro righe si spostano insieme, ed e'
     sempre lo stesso conto: il fondo del cranio deve uscire dal tronco
     in maschera nera. */
  {n:'busto',        a:PELVIS,b:NECK, f:()=>0.33},
  {n:'pelvi-torace', a:PELVIS,b:CHEST,f:()=>0.2434},
  {n:'torace-collo', a:CHEST, b:NECK, f:()=>0.0866},`);

esatta('CENNO — il fattore segue il collo',
`const CENNO=1/0.25;`,
`/* 1/0,32 e non piu' 1/0,25: il fattore converte la vecchia QUOTA del
   cenno nell'angolo che sposta la testa altrettanto, e dipende dalla
   lunghezza del collo. Con il collo allungato (vedi il riquadro della
   testa, sopra) un fattore fermo a 1/0,25 avrebbe fatto oscillare la
   testa del 28% in piu' su tutte le clip che dichiarano headBob. */
const CENNO=1/0.32;`);

esatta('OSSA — il collo nel foglio del banco',
`  {n:'collo',        a:NECK,  b:HEAD, f:()=>0.25},`,
`  /* 0,25 -> 0,32 (voce #155, giro 3): vedi il riquadro accanto a
     N_HEADR. Qui il numero si RIDICHIARA, non si allenta — il banco
     continua a bocciare un osso che vari di un centesimo. */
  {n:'collo',        a:NECK,  b:HEAD, f:()=>0.32},`);

/* =====================================================================
   2 — C3, LE GAMBE: LA BASE SI SFALSA ANCHE IN PROFONDITA'.

   IL RILIEVO E IL CONTO. Il pavimento del giro 2 («nessun piede dentro
   0,150 m dall'asse») separa i piedi DI LATO, e di lato basta a due
   imbardate su quattro. Alle altre due il corpo e' di tre quarti e lo
   scarto laterale si proietta quasi a zero: le due gambe si impilano e
   la maschera nera legge una colonna sola. Misurato con
   strumenti/_156-profilo.js sulla clip 'fermo' a 144 gradi: dalla riga
   27 alla 34 un solo tratto, larghezza 13-15 px.
   Quello che a tre quarti si vede e' la PROFONDITA': la proiezione
   manda z sull'asse x dello schermo con 23,1 px al metro contro i 16,5
   dello scarto laterale. Percio' la base vuole due scarti, non uno —
   uno di lato (c'e' gia') e uno AVANTI-INDIETRO.
   legOfsR/legOfsL sono quello, e sono la copia esatta di armOfsR/armOfsL
   che le braccia hanno da un anno: uno scarto costante in radianti sul
   solo lato dichiarato. Chi non li dichiara legge zero e non cambia di
   un bit — camminata e corsa non li dichiarano.
   ===================================================================== */
esatta('poseLoco — sfalsamento in profondita\'',
`  const aR=q.leg*PASSO*sw+q.legOfs, aL=-q.leg*PASSO*sw+q.legOfs;`,
`  const aR=q.leg*PASSO*sw+q.legOfs+(q.legOfsR||0), aL=-q.leg*PASSO*sw+q.legOfs+(q.legOfsL||0);`);

esatta('Q_FERMO — la base sfalsata',
`const Q_FERMO={leg:0.08,legOfs:0.02,knee0:0.31,kneeA:0.04,kneeLag:3.7,
  arm:0.05,armOfs:0,armOfsR:0.95,armOfsL:-0.70,elb0:0.72,elbA:0.04,armOut:0.220,
  lean:0.09,bounce:0.008,crouch:0.07,twist:0.02,stanceW:0.27,headBob:0.005};`,
`/* LA BASE SI SFALSA, E NON E' UN PASSO (voce #155, giro 3). Un uomo
   fermo non tiene i piedi in squadra: ne porta uno mezzo piede avanti.
   legOfsR +0,13 / legOfsL -0,13 lo scrivono come uno scarto COSTANTE,
   cioe' 24 cm di profondita' fra i due piedi — sette pixel a quaranta,
   proprio dove prima le due gambe si impilavano. La FORBICE che nel
   2026 era stata misurata come «un passo» (ventiquattro gradi) resta
   fuori: l'oscillazione leg vale 0,08 e non si tocca, e la differenza
   fra le due cosce e' costante nel tempo — una forbice che non si apre
   e non si chiude non e' una falcata, e' una posizione. */
const Q_FERMO={leg:0.08,legOfs:0.02,legOfsR:0.13,legOfsL:-0.13,
  knee0:0.31,kneeA:0.04,kneeLag:3.7,
  arm:0.05,armOfs:0,armOfsR:0.95,armOfsL:-0.70,elb0:0.72,elbA:0.04,armOut:0.220,
  lean:0.09,bounce:0.008,crouch:0.07,twist:0.02,stanceW:0.27,headBob:0.005};`);

/* =====================================================================
   3 — C1, I TRE PIANI DI BRACCIA DELLE POSE IN PIEDI.

   IL RILIEVO: «fermo/pugni/sfugge sono la stessa sagoma con lo stesso
   braccio color carne dallo stesso lato; ai tre in piedi servono tre
   PIANI di braccia diversi, non pochi gradi di scarto».
   Misurato alla fase del fascicolo (u 0,300), i tre stavano cosi':
     fermo    braccio vicino avanti 0,90 rad, lontano indietro -0,65
     pugni    tutt'e due avanti a 1,05 / 0,96, gomiti fuori 0,135
     sfugge   tutt'e due avanti a 1,11 / 1,03, gomiti fuori 0,156
   cioe' DUE piani, non tre, e i due che collassano sono i due del
   portiere. Qui diventano tre, e ognuno e' anche il gesto giusto:
     fermo    uno avanti e uno indietro (resta com'e')
     pugni    LA GUARDIA: tutt'e due avanti, ma i gomiti spalancati a
              0,21 — il rombo del pugile, che a quaranta pixel apre due
              triangoli di sfondo fra gli avambracci e il petto
     sfugge   IL CONTRAPPESO: il braccio vicino scatta avanti-basso
              dietro il pallone che se ne va, il lontano vola indietro.
   ===================================================================== */
esatta('pugni — i gomiti spalancati',
`  const outR = 0.06 + 0.12*car - 0.09*sca - 0.02*seg - 0.01*rit;
  const outL = 0.06 + 0.09*car - 0.06*sca - 0.02*seg - 0.01*rit;`,
`  /* 0,12 -> 0,15 sul destro (voce #155, giro 3): il rombo della guardia
     si apre fino a 0,21 di scarto, cioe' un'abduzione di 0,819 sul
     seno contro il tetto 0,8674 del piccoletto — dentro la scatola, e
     il gomito minimo che ne consegue (0,358) sta sotto il gomito vero
     della carica (1,35). Zero tagli, verificato dal banco ?gabbia.
     Somme: 0,15-0,12-0,02-0,01 = 0  e  0,12-0,09-0,02-0,01 = 0 */
  const outR = 0.06 + 0.15*car - 0.12*sca - 0.02*seg - 0.01*rit;
  const outL = 0.06 + 0.12*car - 0.09*sca - 0.02*seg - 0.01*rit;`);

esatta('sfugge — il contrappeso',
`  const aR = 0.30 + 1.05*ten - 0.55*ced - 0.50*rit + 0.08*osc;
  const aL = 0.30 + 0.92*ten - 0.44*ced - 0.48*rit + 0.06*osc;`,
`  /* IL LONTANO VA INDIETRO (voce #155, giro 3). Le due braccia
     andavano tutt'e due avanti a un radiante, cioe' lo stesso piano dei
     pugni: due clip del portiere con la stessa meta' alta sono una
     clip sola. Il gesto vero e' l'altro — chi si vede sfuggire il
     pallone allunga il braccio dietro di lui e getta l'altro indietro
     a non cadere — e in nero sono due arti su due diagonali opposte.
     Somme: 0,95-0,45-0,50 = 0  e  -0,85+0,20+0,65 = 0 */
  const aR = 0.30 + 0.95*ten - 0.45*ced - 0.50*rit + 0.08*osc;
  const aL = 0.30 - 0.85*ten + 0.20*ced + 0.65*rit + 0.06*osc;`);

/* =====================================================================
   4 — C3, LE DUE VITTORIE A BUON MERCATO CHE LA GIURIA HA NOMINATO.
   «delusione ha braccia 0/4 e ginocchia ha gambe 0/4 — basta portare un
   braccio e una gamba fuori dalla linea del corpo.»
   ===================================================================== */
esatta('delusione — la mano sola',
`  for(let s=-1;s<=1;s+=2){
    const sh=s>0?SHR:SHL, el=s>0?ELR:ELL, ha=s>0?HAR:HAL;
    const d=s>0?0.05:-0.05;                 // i due lati non fanno la stessa cosa
    const u0x=s*0.34, u0y=-0.94, u0z=0.12+d;   // riposo: pende, ma staccato
    const v0x=s*0.22, v0y=-0.95, v0z=0.22+d;
    const u1x=s*0.44, u1y=0.50+d, u1z=s*0.74;  // culmine: gomito su, fuori, in z
    const v1x=-s*0.34, v1y=0.56, v1z=-s*0.74;  // la mano torna alla testa
    braccioDir(sh,el,ha, s*SHW, shY, shZ,
      u0x+(u1x-u0x)*su, u0y+(u1y-u0y)*su, u0z+(u1z-u0z)*su,
      v0x+(v1x-v0x)*su, v0y+(v1y-v0y)*su, v0z+(v1z-v0z)*su);
  }`,
`  /* UNA MANO ALLA TESTA, L'ALTRA PENZOLA FUORI (voce #155, giro 3).
     Il banco della sagoma dava a questa clip BRACCIA 0 SU 4: due mani
     che tornano tutt'e due alla nuca sono due arti che rientrano nel
     profilo, e in maschera nera la figura restava un birillo con una
     gobba. La giuria l'ha chiamata «vittoria a buon mercato», e lo e':
     basta che UNO dei due esca.
     E' anche il gesto piu' vero dei due. Chi ha appena sbagliato si
     porta una mano alla testa e lascia cadere l'altra — le due mani
     dietro la nuca sono la posa del rigore parato in televisione, non
     quella dell'attaccante che si volta. L'asimmetria e' il gesto.
     La mano che sale resta la DESTRA (s>0), che e' anche il lato del
     braccio vicino alla camera all'angolo di presentazione; il mancino
     specchia tutto insieme alla posa, come sempre. */
  for(let s=-1;s<=1;s+=2){
    const sh=s>0?SHR:SHL, el=s>0?ELR:ELL, ha=s>0?HAR:HAL;
    const d=s>0?0.05:-0.05;                 // i due lati non fanno la stessa cosa
    const u0x=s*0.34, u0y=-0.94, u0z=0.12+d;   // riposo: pende, ma staccato
    const v0x=s*0.22, v0y=-0.95, v0z=0.22+d;
    /* il destro sale alla nuca; il sinistro CADE e si allontana dal
       fianco — gomito fuori di lato e indietro, avambraccio a piombo */
    const u1x=s>0? 0.44 : -1.05, u1y=s>0? 0.50+d : -0.34, u1z=s>0? 0.74 : -0.42;
    const v1x=s>0?-0.34 : -0.62, v1y=s>0? 0.56   : -0.86, v1z=s>0?-0.74 : -0.12;
    braccioDir(sh,el,ha, s*SHW, shY, shZ,
      u0x+(u1x-u0x)*su, u0y+(u1y-u0y)*su, u0z+(u1z-u0z)*su,
      v0x+(v1x-v0x)*su, v0y+(v1y-v0y)*su, v0z+(v1z-v0z)*su);
  }`);

esatta('ginocchia — le due gambe smettono di essere una',
`  const aR=0.30-0.35*giu+0.80*passo-0.45*su;
  const kR=0.55+1.40*giu-0.95*passo-0.45*su+0.20*botta;
  const aL=0.10-0.15*giu+0.15*su;
  const kL=0.55+1.45*giu-1.45*su+0.20*botta;
  gamba(HIPR,KNR,FTR,TOR,  HIPW, pelvY, 0, aR,kR,  0.10);
  gamba(HIPL,KNL,FTL,TOL, -HIPW, pelvY, 0, aL,kL, -0.12);`,
`  /* LE DUE GAMBE NON CADONO NELLO STESSO MODO (voce #155, giro 3). Il
     banco della sagoma dava GAMBE 0 SU 4: alla fase del fascicolo le
     due anche stavano a -0,05 rad tutt'e due e i due ginocchi a 2,00 e
     2,05, cioe' un blocco unico. Chi cade in ginocchio non atterra in
     squadra: un ginocchio va sotto e l'altra gamba si apre di lato con
     la tibia che struscia. Qui il destro si raccoglie sotto il bacino
     (flessione 2,15) e il sinistro resta aperto e piu' disteso (0,62 di
     coscia avanti, flessione 1,43) con il piede a 0,36 dall'asse.
     Le somme tornano a zero sul giro, come tutte le altre di questa
     posa: aR -0,35+0,80-0,45 · kR 1,55-0,95-0,60 · aL 0,52-0,15-0,37 ·
     kL 0,85+0,25-1,10. */
  const aR=0.30-0.35*giu+0.80*passo-0.45*su;
  const kR=0.55+1.55*giu-0.95*passo-0.60*su+0.20*botta;
  const aL=0.10+0.52*giu-0.15*passo-0.37*su;
  const kL=0.55+0.85*giu+0.25*passo-1.10*su+0.12*botta;
  gamba(HIPR,KNR,FTR,TOR,  HIPW, pelvY, 0, aR,kR,  0.08);
  gamba(HIPL,KNL,FTL,TOL, -HIPW, pelvY, 0, aL,kL, -0.36);`);

/* =====================================================================
   5 — C3, LE QUATTRO CLIP CON SCAVO ZERO SU QUATTRO.
   «finta, presa, parata, rimessa: vanno RIPOSATE, non ritoccate; presa
   a 40 px e' un rettangolo senza tratti.»
   Lo SCAVO e' la frazione del guscio convesso che resta sfondo: una
   posa con scavo basso e' una posa che riempie il proprio inviluppo,
   cioe' una macchia. Non si compra con un grado in piu': si compra
   rompendo la simmetria fra i due arti della stessa coppia, che e' cio'
   che apre una tasca di sfondo in mezzo.
   ===================================================================== */
esatta('finta — il busto e le due braccia',
`  braccio(SHR,ELR,HAR, shX+SHW, shY, shZ, 0.10+0.60*segue,0.55, 0.145+0.05*dip, 1);
  braccio(SHL,ELL,HAL, shX-SHW, shY, shZ, 0.10-0.60*segue,0.55, 0.145+0.05*dip,-1);`,
`  /* LE DUE BRACCIA SI SEPARANO SUL PESO, NON SOLO SUL SEGUITO (voce
     #155, giro 3). Alla fase del fascicolo il SEGUITO vale -0,40 e i due
     bracci finivano a 0,34 e -0,14 rad con lo STESSO gomito: due tratti
     paralleli attaccati al busto, e lo scavo usciva 0,231 contro un
     pavimento di 0,33. Qui entra anche il PESO — che e' il termine di
     ANTICIPO, quello che parte prima della palla — con segno opposto
     sui due lati, e i due gomiti si dividono (0,35 contro 0,80).
     Resta antisimmetrico, quindi la seconda meta' del giro (il secondo
     tocco, dall'altra parte) e' la specchiata della prima: la finta e'
     un doppio, e una posa che non si specchia da sola qui sarebbe un
     difetto nuovo. */
  braccio(SHR,ELR,HAR, shX+SHW, shY, shZ, 0.10+0.60*segue+0.55*peso,0.35, 0.175+0.04*dip, 1);
  braccio(SHL,ELL,HAL, shX-SHW, shY, shZ, 0.10-0.60*segue-0.55*peso,0.80, 0.175+0.04*dip,-1);`);

esatta('finta — il bacino non si accovaccia',
`  const pelvY=0.79-0.07*dip;
  const swP=0.18*peso;`,
`  /* 0,79 -> 0,84: a 0,79 l'inchiostro usciva 0,528 contro il tetto di
     0,52 che il cancello della silhouette dichiara — un uomo
     accovacciato, a quaranta pixel, e' una macchia. La finta e' un
     cambio di appoggio, non un'accosciata: il peso si sposta DI LATO
     (swP, e il busto che pende), non in basso. */
  const pelvY=0.84-0.07*dip;
  const swP=0.18*peso;`);

esatta('finta — il busto pende di piu\'',
`  const dLat=0.12*(segue-peso);`,
`  const dLat=0.19*(segue-peso);`);

esatta('parata — le due braccia si dividono',
`  const aB=0.55+0.10*mol-0.28*giu+0.18*su+0.12*imp+0.14*osc;
  const eB=0.55-0.10*mol-0.45*giu+0.55*su+0.10*imp;
  const outB=0.10+0.05*giu-0.05*su;
  braccio(SHR,ELR,HAR,  SHW, shY, shZ, aB,eB, outB, 1);
  braccio(SHL,ELL,HAL, -SHW, shY, shZ, aB+0.06*osc,eB, outB,-1);`,
`  /* UN BRACCIO PARA E L'ALTRO BILANCIA (voce #155, giro 3). I due
     bracci avevano lo stesso angolo, lo stesso gomito e lo stesso
     scarto: un disegno solo, e lo scavo usciva 0 su 4 imbardate. Il
     gesto vero e' asimmetrico — la mano bassa va sul pallone, l'altra
     vola indietro a tenere il corpo — e in maschera nera diventa due
     diagonali opposte con una tasca di sfondo in mezzo.
     LA SCATOLA DEGLI ANGOLI E' STATA CONTATA PRIMA: lo scarto del
     destro arriva a 0,209, cioe' un seno di 0,815 contro il tetto
     0,8674 del piccoletto, e il gomito minimo che ne consegue (0,356)
     sta sotto il gomito vero (0,583). Zero tagli.
     Ogni termine in giu' ha il suo -su: la posa finisce dove comincia. */
  const aB=0.55+0.10*mol-0.28*giu+0.18*su+0.12*imp+0.14*osc;
  const eB=0.55-0.10*mol-0.45*giu+0.55*su+0.10*imp;
  const outB=0.10+0.05*giu-0.05*su;
  braccio(SHR,ELR,HAR,  SHW, shY, shZ,
          aB+0.55*giu-0.55*su, eB+0.62*giu-0.62*su, outB+0.09*giu-0.09*su, 1);
  braccio(SHL,ELL,HAL, -SHW, shY, shZ,
          aB-0.62*giu+0.62*su+0.06*osc, eB+0.30*giu-0.30*su, outB-0.03*giu+0.03*su,-1);`);

esatta('presa — il salto raccolto',
`  const aB=0.35-0.50*dip+2.75*alza-1.90*ritira-0.35*fine;
  const eB=0.35-0.15*alza+1.00*ritira-0.85*fine+0.15*pres;
  const outB=0.055-0.04*alza+0.04*ritira;
  braccio(SHR,ELR,HAR,  SHW, shY, shZ, aB,eB, outB, 1);
  braccio(SHL,ELL,HAL, -SHW, shY, shZ, aB,eB, outB,-1);
  const kG=0.40+0.45*dip-0.30*salto+0.35*disc+0.65*att-0.50*fine;
  const aR=0.16+0.10*salto-0.10*fine, aL=0.16-0.06*salto+0.06*fine;
  gamba(HIPR,KNR,FTR,TOR,  HIPW, pelvY, 0, aR,kG,  0.11);
  gamba(HIPL,KNL,FTL,TOL, -HIPW, pelvY, 0, aL,kG+0.10*salto-0.10*fine, -0.11);`,
`  /* «PRESA A 40 PX E' UN RETTANGOLO SENZA TRATTI» — ed era vero, al
     pixel (voce #155, giro 3). Alla fase del fascicolo la clip aveva:
     due braccia allo stesso angolo con lo scarto a 0,019 (cioe' unite
     sopra la testa), due gambe alla stessa flessione e il bacino a
     1,18 — un blocco verticale, inchiostro 0,554 e scavo 0 su 4.
     Un portiere che salta a prendere non e' fatto cosi': le braccia
     salgono a V per fare una CESTA, e le gambe si raccolgono in modo
     opposto — un ginocchio su davanti, l'altra gamba che pende dietro.
     Sono le due cose che aprono lo sfondo dentro l'inviluppo.
       braccia   scarto 0,019 -> 0,154 (la V) e i due bracci a due
                 angoli diversi; il gomito sale con loro perche' il
                 minimo della scatola con quello scarto e' 0,294
       gambe     ginocchio destro 1,25 contro 0,60 del sinistro, e i
                 due piedi a 0,13 e -0,20 invece che a 0,11 simmetrici
     Tutte le somme restano zero sul giro. */
  const aB=0.35-0.50*dip+2.75*alza-1.90*ritira-0.35*fine;
  const eB=0.35+0.18*alza+1.00*ritira-1.18*fine+0.15*pres;
  const outB=0.055+0.11*alza-0.11*ritira;
  braccio(SHR,ELR,HAR,  SHW, shY, shZ,
          aB+0.22*alza-0.22*ritira, eB, outB, 1);
  braccio(SHL,ELL,HAL, -SHW, shY, shZ,
          aB-0.26*alza+0.26*ritira, eB+0.20*alza-0.20*ritira, outB-0.035*alza+0.035*ritira,-1);
  const kR2=0.40+1.15*dip-0.30*salto+0.35*disc+0.65*att-1.20*fine;
  const kL2=0.40+0.30*dip-0.10*salto+0.35*disc+0.65*att-0.55*fine;
  const aR=0.16+0.45*salto-0.45*fine, aL=0.16-0.30*salto+0.30*fine;
  gamba(HIPR,KNR,FTR,TOR,  HIPW, pelvY, 0, aR,kR2,  0.13);
  gamba(HIPL,KNL,FTL,TOL, -HIPW, pelvY, 0, aL,kL2, -0.20);`);

esatta('rimessa — i gomiti fuori e la base sfalsata',
`  const outB=0.05+0.05*su;              // vicine, non una V aperta: la palla sta fra le mani
  braccio(SHR,ELR,HAR,  SHW, shY, shZ, aB,eB, outB, 1);
  braccio(SHL,ELL,HAL, -SHW, shY, shZ, aB,eB, outB,-1);
  // gambe ferme divaricate: angoli fissi, il lancio non le anima
  gamba(HIPR,KNR,FTR,TOR,  HIPW, pelvY, 0,  0.12, 0.22,  0.16);
  gamba(HIPL,KNL,FTL,TOL, -HIPW, pelvY, 0, -0.12, 0.22, -0.16);`,
`  /* LE MANI RESTANO VICINE, I GOMITI NO (voce #155, giro 3). Lo scarto
     a 0,10 teneva anche i gomiti addosso alla testa, e la clip usciva
     con scavo 0 su 4: un'unica massa dal bacino alle mani. Il gesto
     vero della rimessa e' proprio il contrario — le mani si toccano
     dietro la nuca e i GOMITI si spalancano, ed e' quella V rovesciata
     ad aprire le due tasche di sfondo che la maschera nera cerca.
     Le mani restano insieme perche' l'avambraccio rientra del 45%
     dentro braccio(): con lo scarto a 0,19 i gomiti escono a 0,19 e le
     mani a 0,10 dall'asse, cioe' venti centimetri l'una dall'altra —
     la palla ci sta in mezzo.
     LA SCATOLA: 0,19/0,2565 = 0,741 di seno contro il tetto 0,8674, e
     il gomito minimo che ne segue (0,335) sta sotto il gomito della
     posa (0,40). Zero tagli.
     E I PIEDI SI SFALSANO: chi fa una rimessa non sta in squadra, tiene
     un piede avanti. 0,12 / -0,12 diventano 0,46 / -0,30, cioe'
     trentacinque centimetri di profondita' fra i due piedi. */
  const outB=0.05+0.14*su;              // le mani restano vicine, i gomiti si aprono
  braccio(SHR,ELR,HAR,  SHW, shY, shZ, aB,eB, outB, 1);
  braccio(SHL,ELL,HAL, -SHW, shY, shZ, aB-0.10*su,eB+0.12*su, outB,-1);
  // gambe ferme e SFALSATE: angoli fissi, il lancio non le anima
  gamba(HIPR,KNR,FTR,TOR,  HIPW, pelvY, 0,  0.46, 0.30,  0.17);
  gamba(HIPL,KNL,FTL,TOL, -HIPW, pelvY, 0, -0.30, 0.16, -0.17);`);

/* =====================================================================
   6 — C1, IL PALLONE VA DOVE LO METTE LA CLIP, E IL CONTATTO ESISTE.

   IL RILIEVO, IN DUE PEZZI:
   (b) «il pallone va messo DOVE LO METTE LA CLIP: al collo del piede
       per il passaggio, largo e dietro per il cross, in uscita per il
       tiro — oggi sta nello stesso punto in tutte e quattro.» Era vero
       al centesimo: px 0,10 e pz 0,34-0,36 su tre clip su quattro.
   (c) «il fotogramma del contatto non esiste ancora.» Anche questo era
       vero, ed era un fatto di CAMPIONAMENTO, non di disegno: il foglio
       delle fasi prende sedici fotogrammi a u = i/16, e l'istante
       d'impatto stava a 0,44 e 0,46 — cioe' FRA il 7/16 (0,4375) e
       l'8/16 (0,500). Il contatto c'era e non veniva mai fotografato.
       Qui i quattro tImp cadono ESATTI su un fotogramma del foglio
       (7/16 e 6/16), e la schiacciata si allarga da +-0,05 a +-0,075 di
       fase perche' un contatto che dura meno del passo di campionamento
       e' un contatto che nessuno vedra' mai.
   ===================================================================== */
esatta('pallaCalcio — la schiacciata dura quanto un fotogramma',
`  const dw=Math.abs(u-ti);
  out[3]=dw<0.05?0.40*(1-dw/0.05):0;     // schiacciata sul collo del piede`,
`  /* +-0,075 E NON +-0,05 (voce #155, giro 3). Il foglio delle fasi
     campiona ogni 0,0625 di giro: una schiacciata larga 0,05 puo'
     cadere tutta fra due fotogrammi, ed e' esattamente quello che
     faceva — «il fotogramma del contatto non esiste». A 0,075 il
     fotogramma piu' vicino all'impatto porta sempre almeno il 17%
     della deformazione, e quello esatto (adesso tImp cade su un
     multiplo di 1/16) la porta tutta. */
  const dw=Math.abs(u-ti);
  out[3]=dw<0.075?0.45*(1-dw/0.075):0;   // schiacciata sul collo del piede`);

esatta('Q_PASSAGGIO — la palla al collo del piede',
`  aprCar:0.12, appA:0.28,appK:0.30, px:0.10,pz:0.34, gitt:2.8,alza:0,arco:0,dirX:0};`,
`  aprCar:0.12, appA:0.28,appK:0.30, px:0.15,pz:0.25, gitt:2.8,alza:0,arco:0,dirX:0};`);
esatta('Q_PASSAGGIO — l\'impatto su un fotogramma del foglio',
`const Q_PASSAGGIO={tImp:0.44,swing:0.13,`, `const Q_PASSAGGIO={tImp:0.4375,swing:0.13,`);

esatta('Q_FILTRANTE — la palla avanti e centrale',
`  guarda:-0.95, aprCar:0.16, appA:0.30,appK:0.38, px:0.10,pz:0.36, gitt:4.0,alza:0,arco:0,dirX:0};`,
`  guarda:-0.95, aprCar:0.16, appA:0.30,appK:0.38, px:0.02,pz:0.33, gitt:4.0,alza:0,arco:0,dirX:0};`);
esatta('Q_FILTRANTE — l\'impatto su un fotogramma del foglio',
`const Q_FILTRANTE={tImp:0.36,swing:0.09,`, `const Q_FILTRANTE={tImp:0.375,swing:0.09,`);

esatta('Q_CROSS — la palla larga e dietro',
`  attraversa:0.30, appA:0.26,appK:0.34, px:0.14,pz:0.34, gitt:3.6,alza:0.95,arco:1,dirX:-0.35};`,
`  attraversa:0.30, appA:0.26,appK:0.34, px:0.33,pz:0.12, gitt:3.6,alza:0.95,arco:1,dirX:-0.35};`);
esatta('Q_CROSS — l\'impatto su un fotogramma del foglio',
`const Q_CROSS={tImp:0.44,swing:0.12,`, `const Q_CROSS={tImp:0.4375,swing:0.12,`);

esatta('Q_TIRO — la palla in uscita',
`  px:0.10,pz:0.36, gitt:5.5,alza:0.5,arco:0,dirX:0};`,
`  px:0.09,pz:0.44, gitt:5.5,alza:0.5,arco:0,dirX:0};`);
esatta('Q_TIRO — l\'impatto su un fotogramma del foglio',
`const Q_TIRO={tImp:0.46,swing:0.11,`, `const Q_TIRO={tImp:0.4375,swing:0.11,`);

/* =====================================================================
   7 — C7, IL SEGUITO DEL CALCIO SMETTE DI ESSERE UNA POSA FERMA.
   «in tiro la gamba resta alzata uguale dal 10/16 al 14/16.» La coda
   della clip era una rampa liscia (smoothstep) che porta al riposo: una
   smoothstep e' PIATTA AI DUE ESTREMI per costruzione, quindi i primi
   tre fotogrammi dopo il seguito sono indistinguibili fra loro.
   Il rimedio non e' accorciare la rampa: e' metterci dentro un GESTO —
   il piede che rientra sotto il corpo passa dal ginocchio piegato, e
   una campana 4r(1-r) lo dice senza spostare ne' l'inizio ne' la fine
   (vale zero a tutt'e due gli estremi: la posa finisce dove finiva).
   ===================================================================== */
esatta('poseCalcio — il rientro e\' un passo, non una rampa',
`  else{ const r=sm(u,tF,0.99); aG=q.follow*(1-r); kG=q.kneeSegue+(0.25-q.kneeSegue)*r; }`,
`  else{ const r=sm(u,tF,0.94);
    /* la campana del RECUPERO: il ginocchio si piega mentre il piede
       torna sotto il corpo, e la coscia lo accompagna un soffio
       indietro. Vale zero ai due estremi, quindi non sposta ne'
       l'inizio ne' la fine della rampa. */
    const rec=4*r*(1-r);
    aG=q.follow*(1-r)-0.26*rec; kG=q.kneeSegue+(0.25-q.kneeSegue)*r+0.55*rec; }`);

/* =====================================================================
   8 — C4, L'ATTERRAGGIO HA UN'OMBRA SUA.

   IL RILIEVO: «il volo e' curato bene e per la ragione giusta. Ma
   l'atterraggio ha l'ombra del FERMO: serve uno stato suo, l'ombra che
   si STRINGE e si SCURISCE sul fotogramma d'impatto e si rilassa in
   3-4 fotogrammi.» Era esatto al bit: appoggio e atterraggio uscivano
   con quota 0,00, distanza x1,000, taglia x1,000, alfa x1,000.

   L'IMPATTO SI MISURA COME SI MISURA LA QUOTA, cioe' dalla POSA. La
   tabella ARIA sa gia', per ogni clip e per sedici fasi, di quanto il
   giunto piu' basso sta sopra il manto. L'istante d'impatto e' la fase
   in cui quel numero SMETTE di essere positivo: non c'e' niente da
   scrivere a mano e niente che un giorno diverga dalla posa. La
   campana che ne esce dura quattro fasi (1 · 0,55 · 0,25 · 0,08), cioe'
   proprio i «3-4 fotogrammi» chiesti sul foglio da sedici.

   E I QUATTRO NUMERI DELL'OMBRA DIVENTANO UNA FUNZIONE SOLA. Prima
   stavano scritti due volte — una in drawOmbreGiocatori e una dentro il
   provino, che li ricopiava per poterli stampare. Due copie della
   stessa formula sono una verita' che diverge, e la giuria l'ha gia'
   dichiarato motivo di nullita' del fascicolo («se il disegno del
   provino diverge dal gioco»). ombraParam e' quella sorgente: il gioco
   la chiama, il provino la chiama, e i numeri stampati sotto le colonne
   sono gli stessi che disegnano.
   ===================================================================== */
esatta('ARIA — la tabella dell\'impatto',
`(function costruisciAria(){
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
})();`,
`/* L'IMPATTO — la stessa tabella, letta al contrario (voce #155, giro 3).
   La coda della campana e' scritta qui una volta sola e vale per tutte
   le clip: il fotogramma in cui la quota smette di essere positiva vale
   1, i tre dopo 0,55 / 0,25 / 0,08. Con sedici fasi per giro e' proprio
   l'«si rilassa in 3-4 fotogrammi» del rilievo, e siccome e' la POSA a
   dire dov'e' l'impatto, una clip che un giorno volasse in un altro
   momento porterebbe l'ombra con se' senza che nessuno riscriva niente.
   Le clip che non lasciano mai il manto hanno la tabella tutta a zero e
   non pagano un'operazione in piu': ombraParam le vede come prima. */
const IMP={};
const IMP_CODA=[1,0.55,0.25,0.08];
function impatto(nomeClip,tSec){
  const t=IMP[nomeClip]; if(!t) return 0;
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
    const q=new Float32Array(ARIA_FASI);
    for(let i=0;i<ARIA_FASI;i++){
      if(t[i]===0 && t[(i-1+ARIA_FASI)%ARIA_FASI]>0){
        for(let c=0;c<IMP_CODA.length;c++){
          const j=(i+c)%ARIA_FASI;
          if(IMP_CODA[c]>q[j]) q[j]=IMP_CODA[c];
        }
      }
    }
    IMP[k]=q;
  }
})();`);

esatta('Rig3D — l\'impatto esce dal modulo',
`        quotaAria, guarda,`,
`        quotaAria, impatto, guarda,`);

esatta('ombraParam — la sorgente unica dei quattro numeri',
`function ombraAlfa(){ return OMBRA_ALFA*(1+0.34*oraPartita()); }`,
`function ombraAlfa(){ return OMBRA_ALFA*(1+0.34*oraPartita()); }
/* =====================================================================
   I QUATTRO NUMERI DELL'OMBRA, IN UN POSTO SOLO (voce #155, giro 3).
     h     la quota totale (salto + saliscendi della falcata + volo
           della posa): allontana, rimpicciolisce, schiarisce
     volo  la sola quota che SFOCA (salto e volo, mai il saliscendi:
           una capsula che si allarga a ogni passo farebbe respirare
           tutte le ombre del campo insieme)
     imp   L'ATTERRAGGIO. Il corpo e' appena arrivato a terra: l'ombra
           si STRINGE (taglia -22%, tratto -30%: il bordo torna netto
           perche' il corpo e' vicino al manto) e si SCURISCE (+55% di
           alfa), e la macchia di contatto pesa quasi il doppio (+85%)
           perche' e' lei a dire «ha pesato LI'». In tre o quattro
           fotogrammi torna tutto a riposo.
   Scratch riusato: zero allocazioni per figura, come tutto il resto di
   questa passata. Lo legge anche il provino — una formula scritta due
   volte e' una formula che un giorno diverge. */
const OMB_P={h:0,volo:0,imp:0,k:1,r:1,a:1,lw:0,ac:0};
function ombraParam(h,volo,imp){
  const i=imp>0?(imp>1?1:imp):0;
  OMB_P.h=h; OMB_P.volo=volo; OMB_P.imp=i;
  OMB_P.k=1+h*0.05;
  OMB_P.r=(1-h*0.030)*(1-0.22*i);
  OMB_P.a=(1-h*0.055)*(1+0.55*i);
  OMB_P.lw=(volo>1.0?OMBRA_LARG*(1+volo*0.230):OMBRA_LARG)*(1-0.30*i);
  OMB_P.ac=(1-h*0.055)*Math.max(0,1-h*0.16)*(1+0.85*i);
  return OMB_P;
}`);

esatta('drawOmbreGiocatori — legge la sorgente unica',
`    const salto=(p.celeb>0 ? Math.abs(Msin((2.4-p.celeb)*9))*7 : 0);
    const h = salto + (p.bob||0) + aria;
    const k = 1+h*0.05;                 // in salto l'ombra si allontana
    const r = 1-h*0.030;                // e rimpicciolisce
    const a = 1-h*0.055;                // e schiarisce`,
`    const salto=(p.celeb>0 ? Math.abs(Msin((2.4-p.celeb)*9))*7 : 0);
    const h = salto + (p.bob||0) + aria;
    /* L'ATTERRAGGIO, dalla stessa tabella della quota: vedi il riquadro
       di ombraParam e quello di IMP dentro il rig. */
    const imp = Rig3D.impatto(st.clip, st.u/Rig3D.CLIPS[st.clip].freq);
    const PA = ombraParam(h, salto + aria, imp);
    const k = PA.k;                     // in salto l'ombra si allontana
    const r = PA.r;                     // rimpicciolisce, e sull'impatto si stringe
    const a = PA.a;                     // schiarisce, e sull'impatto si scurisce`);

esatta('drawOmbreGiocatori — il tratto viene dalla sorgente unica',
`    const volo = salto + aria;
    const lw = volo>1.0 ? OMBRA_LARG*(1+volo*0.230) : OMBRA_LARG;
    if(lw!==lwOra){ ctx.lineWidth=lw; lwOra=lw; }`,
`    const lw = PA.lw;
    if(lw!==lwOra){ ctx.lineWidth=lw; lwOra=lw; }`);

esatta('drawOmbreGiocatori — la macchia di contatto pesa sull\'impatto',
`    const ac=a*Math.max(0,1-h*0.16);`,
`    const ac=PA.ac;`);

esatta('drawOmbreGiocatori — la macchia si allarga sull\'impatto',
`      ctx.globalAlpha=ac*0.80;
      ctx.drawImage(ombraTex, CX-7*r, CY-3.9*r, 14*r, 7.8*r);`,
`      /* LA MACCHIA SI ALLARGA MENTRE LA CAPSULA SI STRINGE, ed e' la
         stessa cosa che fa una massa che arriva a terra: il contatto si
         spiaccica, l'ombra portata si raccoglie. rc e' la taglia della
         sola macchia, e a impatto nullo vale r esatto. */
      const rc=r*(1+0.40*PA.imp);
      ctx.globalAlpha=ac*0.80;
      ctx.drawImage(ombraTex, CX-7*rc, CY-3.9*rc, 14*rc, 7.8*rc);`);

esatta('polvere — i solchi si vedono a cinquanta pixel',
`          ctx.globalAlpha=0.50*(1-pv); ctx.strokeStyle='#cdd9b9';
          const lw=0.05*s; ctx.lineWidth=lw<1?1:lw;
          const lm=(0.14+0.10*pv)*s;`,
`          /* 0,05 -> 0,13 DI SPESSORE E 0,14 -> 0,26 DI LUNGHEZZA (voce
             #155, giro 3). Il conto che la giuria ha fatto, ed e'
             giusto: in partita s vale 24,08 unita' e la trasformazione
             del quadro ~1,37, quindi il vecchio solco usciva 1,65 px di
             spessore e 4,6 di lunghezza — «un pixel», cioe' niente.
             A 0,13 e 0,26 il segno esce 4,3 px per 8,6: si vede senza
             ingrandire, che era la richiesta. L'alfa scende da 0,50 a
             0,42 perche' un segno tre volte piu' grosso alla stessa
             opacita' sarebbe una macchia bianca sull'erba. */
          ctx.globalAlpha=0.42*(1-pv); ctx.strokeStyle='#cdd9b9';
          const lw=0.13*s; ctx.lineWidth=lw<1?1:lw;
          const lm=(0.26+0.18*pv)*s;`);

/* =====================================================================
   9 — C5, GLI ESTREMI DEL VALORE APPARTENGONO ALLA DIVISA.

   IL RILIEVO ERA DOPPIO, e la giuria aveva gia' scritto le DUE strade:
   «Porta un capo della divisa sotto 81 (CALZONCINI, O UN PANNELLO SCURO
   DI SPALLA) e apri almeno 40 livelli fra pelle e maglia.»

   LA PRIMA STRADA E' STATA PROVATA E MISURATA, E NON SI PUO' PERCORRERE.
   Calzoncini scuriti del 62% invece che del 34%: escono a 74 di
   luminanza, sotto i capelli (81) e sotto le scarpe (100), e il criterio
   C5 sarebbe soddisfatto alla lettera. Ma collaudo.js scende da 3,04:1 a
   2,95:1 sul primo giocatore in vista normale, contro un minimo di 3:1.
   ROSSO. E la causa non e' un caso sfortunato, e' la geometria della
   sonda, che qui va scritta per esteso perche' tre commenti di questo
   file la raccontano in tre modi diversi e nessuno dei tre e' esatto:
     la finestra campiona a -10,5 / -11,5 / -12,5 unita' di MONDO dal
     punto a terra del giocatore. Quelle unita' diventano unita' di rig
     moltiplicate per P_DIS (1,18) e si convertono in quota dividendo
     per 17,89 al metro: 0,693 / 0,759 / 0,825 m sopra il manto.
     Il bacino sta a 0,93 m e il calzoncino copre la coscia fino al 54%,
     cioe' fino a 0,68 m. LA FINESTRA E' TUTTA DENTRO IL CALZONCINO.
   Il «contrasto maglia/erba» misura, su questa geometria, il contrasto
   CALZONCINO/erba. Scurire i calzoncini e' esattamente il modo di
   romperlo. Provato anche ad allungare l'orlo della maglia fino a
   coprire la finestra: a t = -0,76 il trapezio sarebbe largo 4,7 cm
   contro i 14,6 della finestra — una striscia, non un orlo.

   SI PRENDE LA SECONDA STRADA, che la giuria aveva nominato per prima:
   IL PANNELLO SCURO DI SPALLA. La MANICA prende la seconda tinta della
   squadra scurita del 62% — 74 di luminanza, sotto i capelli (81) e
   sotto le scarpe (100) — e sta a un metro e trenta da terra, cioe'
   mezzo metro sopra la finestra della sonda: il cancello non la vede
   (misurato: 3,03:1, la stessa cifra di prima a un centesimo).
   E paga anche il secondo rilievo, meglio di quanto chiesto: fra la
   manica (74) e la pelle dell'avambraccio (195) ci sono CENTOVENTUNO
   livelli, contro i quaranta che il criterio chiede. Il braccio smette
   di essere un tubo di un grigio solo e diventa spalla scura piu'
   avambraccio chiaro — cioe' un gomito che si legge anche desaturato.
   LA MANICA NON E' UNA QUINTA TINTA INVENTATA: e' la seconda tinta
   della squadra, la stessa dei calzoncini e del risvolto. Le divise
   restano due e restano lontane (lo verifica _q-divise.js).
   CHI NON LA DICHIARA NON LA VEDE: i banchi in maschera nera passano un
   look senza manica e il disegno ricade sulla maglia, cioe' sul nero.
   ===================================================================== */
esatta('SEGS — le maniche',
`  {a:SHR,b:ELR, w:0.138,c:'maglia', bias:0.005, kind:0, arti:1, pi:1},`,
`  /* man:1 = LA MANICA ha un valore suo (voce #155, giro 3, criterio
     C5): vedi il riquadro dentro rigLook. Il segmento resta quello, la
     larghezza resta quella, cambia la tinta — e chi non dichiara la
     manica nel look ricade sulla maglia. */
  {a:SHR,b:ELR, w:0.138,c:'maglia', bias:0.005, kind:0, arti:1, pi:1, man:1},`);
esatta('SEGS — le maniche, lato sinistro',
`  {a:SHL,b:ELL, w:0.138,c:'maglia', bias:0.005, kind:0, arti:1, pi:1},`,
`  {a:SHL,b:ELL, w:0.138,c:'maglia', bias:0.005, kind:0, arti:1, pi:1, man:1},`);

esatta('disegno — la manica prende la sua tinta',
`    let tinta=look[g.c];`,
`    /* la MANICA (voce #155, giro 3): stesso segmento, tinta sua. Il
       ripiego su look[g.c] non e' prudenza, e' il contratto con i
       banchi in maschera nera, che un look senza manica lo passano. */
    const chiave = (g.man && look.manica) ? 'manica' : g.c;
    let tinta=look[chiave];`);

esatta('disegno — l\'ombra della manica',
`      const alt=look._ombS[g.c];`,
`      const alt=look._ombS[chiave]||look._ombS[g.c];`);

esatta('lumiLook — la manica in ombra',
`  look._ombS={
    maglia:       look._ombra,`,
`  look._ombS={
    maglia:       look._ombra,
    manica:       look.manica ? mescolaTinta(look.manica, SOLE.tintaOmbra,0.34) : null,`);

esatta('rigLook — i calzoncini e la manica',
`      pantaloncini:mt(c2,'#0e1018',0.34),
      calze:mt(c1,'#fff6e4',0.22), risvolto:c2,`,
`      /* I CALZONCINI SI SCHIARISCONO, 0,34 -> 0,26, ED E' L'OPPOSTO DI
         QUELLO CHE SEMBRAVA SERVIRE. La finestra della sonda del
         contrasto di collaudo.js sta a 0,693-0,825 m da terra — il
         conto per esteso e' nel riquadro in cima alla toppa — cioe'
         TUTTA dentro il calzoncino: quel cancello, su questa geometria,
         misura il contrasto CALZONCINO/erba. Scurirli del 62% (la
         prima idea, per il criterio C5) lo portava da 3,04:1 a 2,95:1;
         lasciarli dov'erano, con le corporature piu' larghe di questo
         giro, lo lasciava a 3,00:1, cioe' sul filo. A 0,26 escono a 128
         di luminanza e il cancello torna ad avere margine.
         E NON COSTA NIENTE AL CRITERIO C5, perche' l'estremo scuro
         della figura non sono piu' loro: e' la MANICA (74). I
         calzoncini fanno il mezzo tono fra la maglia (216) e la manica,
         che e' precisamente il loro mestiere nelle tre masse. */
      pantaloncini:mt(c2,'#0e1018',0.26),
      /* LA MANICA E' IL PANNELLO SCURO DI SPALLA (criterio C5): la
         seconda tinta della squadra scurita del 62%, cioe' 74 di
         luminanza — l'estremo scuro della figura, e finalmente un capo
         della DIVISA invece dei capelli (81) o delle scarpe (100).
         Sta a un metro e trenta da terra, mezzo metro sopra la finestra
         della sonda: costa zero al cancello del contrasto (misurato,
         3,03:1). E fra manica e pelle dell'avambraccio ci sono 121
         livelli contro i 40 che il criterio chiede: il braccio si
         divide in due valori e il gomito si legge anche desaturato. */
      manica:mt(c2,'#0e1018',0.62),
      calze:mt(c1,'#fff6e4',0.22), risvolto:c2,`);

/* =====================================================================
   10 — C6, UN ALTO-SOTTILE E UN BASSO-LARGO, LEGGIBILI IN NERO.

   IL RILIEVO: «spilungone 59 px, neutro 59, tarchiato 58: tre su quattro
   alti uguali, si legge solo il piccoletto. E il tarchiato e' largo 40
   px come lo spilungone. Compra la statura SCENDENDO anche sul
   tarchiato, e la sua larghezza sulle SPALLE.»
   Le due meta' della riparazione:
     la statura   tarchiato 0,955 -> 0,925 e piccoletto 0,865 -> 0,855.
                  Nessuno sale: il tetto della cima della testa e'
                  dichiarato nel riquadro di N_HEADR e resta.
     la larghezza sh arriva adesso ALLA MASCHERA (MSH, in cima a questa
                  toppa: la cima del trapezio e la barra dei fianchi
                  seguono la corporatura). Qui si allarga la forbice:
                  spilungone 0,96 -> 0,90, tarchiato 1,12 -> 1,20.
   ===================================================================== */
esatta('CORPI — un alto-sottile e un basso-largo',
`  /* 0 spilungone */ {g:1.00, b:1.06, sp:0.78, sh:0.96, hr:0.88, st:1.018, pa:1.14, cd:0.90},
  /* 1 tarchiato  */ {g:1.00, b:0.96, sp:1.30, sh:1.12, hr:1.02, st:0.955, pa:0.94, cd:1.07},
  /* 2 piccoletto */ {g:1.00, b:0.95, sp:1.08, sh:0.95, hr:1.20, st:0.865, pa:0.86, cd:1.18},`,
`  /* LA FORBICE DELLE SPALLE ARRIVA ALLA MASCHERA (voce #155, giro 3).
     Fino a ieri sh spostava il solo GIUNTO della spalla e la giuria
     l'ha misurato: «il tarchiato e' largo 40 px come lo spilungone».
     Adesso sh muove anche la cima del trapezio del busto e la barra dei
     fianchi (MSH, vedi il riquadro in cima al file), e la forbice si
     apre: 0,84 contro 1,30, cioe' META' di differenza in larghezza fra
     i due estremi — e lo spessore degli arti va nello stesso verso
     (0,72 contro 1,38) insieme al raggio della testa (0,84 contro
     1,06). MISURATO su prova-corpi-50 (maschera nera a cinquanta
     pixel): lo spilungone riempie il 44% della sua scatola, il
     tarchiato il 53%. E' quella la differenza che si legge in nero fra
     due uomini alti quasi uguali — non i due pixel di statura. La statura si compra scendendo, com'e' dichiarato
     nel riquadro delle colonne: 1,018 / 0,925 / 0,855 / 1,000. */
  /* 0 spilungone */ {g:1.00, b:1.06, sp:0.72, sh:0.84, hr:0.84, st:1.018, pa:1.14, cd:0.90},
  /* 1 tarchiato  */ {g:1.00, b:0.96, sp:1.38, sh:1.30, hr:1.06, st:0.925, pa:0.94, cd:1.07},
  /* 2 piccoletto */ {g:1.00, b:0.95, sp:1.08, sh:0.97, hr:1.20, st:0.855, pa:0.86, cd:1.18},`);

/* =====================================================================
   11 — C1, IL PORTIERE PRONTO SMETTE DI ESSERE IL GEMELLO DI CHI STA
   FERMO.

   IL FATTO, MISURATO CON strumenti/silhouette.js: la coppia piu' vicina
   del foglio e' «sta fermo / il portiere aspetta», e con il busto
   allargato di questo giro e' scesa da 0,221 a 0,166 — sotto il
   pavimento di 0,18 che il cancello chiede. La causa non e' una posa
   sbagliata: e' che il TRONCO occupa adesso una fetta piu' grossa della
   maschera, e il tronco e' la parte che le due pose hanno in comune.
   Allargare le spalle compra la lettura degli ARTI e vende, in cambio,
   un pezzo della distanza fra due pose che stanno tutt'e due in piedi.
   E' un baratto, e si paga dove si e' venduto: sulla POSA.

   IL PORTIERE SCENDE E SI APRE. Era gia' accucciato (bacino 0,640) e
   adesso lo e' sul serio (0,585), con la base a 0,26 invece di 0,18 e i
   due ginocchi piu' piegati. La forma passa da 1,02 a circa 1,10, cioe'
   resta dentro la banda dichiarata (il tetto e' 1,15) ma dalla parte
   giusta: una figura BASSA E LARGA accanto a una ALTA E STRETTA.
   E' anche il gesto vero — un portiere che aspetta un tiro sta piu'
   basso di un uomo che aspetta un passaggio — ed e' esattamente cio'
   che il criterio C1 chiede: due clip che un estraneo separa senza
   etichetta.
   ===================================================================== */
esatta('attesaGK — il portiere scende e si apre',
`  const pelvY=0.640+0.014*c2;
  corpo(pelvY, 0.035*dond, 0.22, 0.006*c2);`,
`  const pelvY=0.560+0.014*c2;
  corpo(pelvY, 0.035*dond, 0.22, 0.006*c2);`);

esatta('attesaGK — la base e le ginocchia',
`  gamba(HIPR,KNR,FTR,TOR,  HIPW, pelvY, 0,  0.86, 1.75,  0.18+0.025*dond);
  gamba(HIPL,KNL,FTL,TOL, -HIPW, pelvY, 0, -0.16, 1.35, -0.18+0.025*dond);`,
`  /* LA BASE TORNA A ±0,26 (voce #155, giro 3) e i ginocchi si piegano
     con lei. Il riquadro qui sopra spiega perche' ±0,52 non leggeva —
     la larghezza laterale diventa una diagonale — ma a ±0,18, con il
     bacino sceso a 0,585, le due cosce tornavano a uscire dallo stesso
     punto. A ±0,26 l'abduzione d'anca chiede sin = (0,105+0,26)/0,91 =
     0,401 contro il tetto 0,751: nessun taglio nuovo. */
  gamba(HIPR,KNR,FTR,TOR,  HIPW, pelvY, 0,  0.98, 2.05,  0.285+0.025*dond);
  gamba(HIPL,KNL,FTL,TOL, -HIPW, pelvY, 0, -0.28, 1.65, -0.285+0.025*dond);`);

/* =====================================================================
   12 — C5, L'ORLO DELLA MAGLIA SI ALLUNGA, E NON E' UN GUSTO: E' IL
   PREZZO DEI CALZONCINI SCURI, PAGATO DOVE VA PAGATO.

   L'ORLO SI E' ACCORCIATO DA SOLO, SENZA CHE NESSUNO LO VOLESSE, ED E'
   IL GENERE DI COSA CHE SI VEDE SOLO MISURANDO. t0 e' una FRAZIONE
   della lunghezza del tronco, e il tronco e' passato da 0,40 a 0,33 per
   fare posto al collo (voce 1bis): gli stessi -0,22 valevano 8,8 cm di
   orlo e adesso ne varrebbero 7,3. Una riparazione che ne rompe
   un'altra dalla porta di servizio.

   t0 -0,22 -> -0,40, cioe' 13,2 cm di maglia sotto la cintura: l'orlo
   torna piu' lungo di com'era, non piu' corto. Non cambia la sagoma di
   un pixel — a t = -0,40 il trapezio e' largo 0,117 m contro i 0,30
   della barra dei fianchi, quindi sta DENTRO il calzoncino — e cambia
   solo cio' che la finestra della sonda trova sulla sua riga piu' alta
   (0,825 m, l'unica delle tre che l'orlo raggiunge).
   ===================================================================== */
esatta('orlo — il filo di stacco',
`    troncoQuad(ctx,s,bd+fl,0,1,-0.22,1);`,
`    troncoQuad(ctx,s,bd+fl,0,1,-0.40,1);`);
esatta('orlo — il contorno',
`    if(g.kind===1){ ctx.fillStyle=tb; troncoQuad(ctx,s,bp,0,1,-0.22,1); continue; }`,
`    if(g.kind===1){ ctx.fillStyle=tb; troncoQuad(ctx,s,bp,0,1,-0.40,1); continue; }`);
esatta('orlo — il colore',
`    if(g.kind===1){ ctx.fillStyle=tinta; troncoQuad(ctx,s,0,0,1,-0.22,1); }`,
`    if(g.kind===1){ ctx.fillStyle=tinta; troncoQuad(ctx,s,0,0,1,-0.40,1); }`);

/* =====================================================================
   13 — LA MAGLIA SALE DI UN ALTRO FILO, E IL PERCHE' E' IL CANCELLO.

   IL CONTO, MISURATO CON collaudo.js (nove partite per numero, stesso
   seme, P1 in vista normale):
       prima di questo giro ................. 3,04:1   (minimo 3:1)
       con i calzoncini a 0,62 .............. 2,95:1   ROSSO
       + orlo a -0,40 ....................... 2,95:1   (non bastava)
       + maglia a 0,30 ...................... 3,00:1   (ancora rosso)
       calzoncini rimessi, manica scura ..... 3,03:1   VERDE
   La maglia a 0,30 resta perche' e' quella che tiene il margine: da
   sola ha comprato cinque centesimi di rapporto, e il rapporto oggi
   passa per un pelo. E' anche la manovra giusta per il criterio C5, che
   vuole l'estremo CHIARO della figura dentro la divisa. Le due divise
   si schiariscono della stessa frazione, quindi restano lontane fra
   loro (lo verifica _q-divise.js).
   La riga vale finche' collaudo.js resta verde: se un giorno non lo
   fosse, va rifatta, non spiegata.
   ===================================================================== */
esatta('maglia — il filo di bianco',
`      maglia:mt(c1,'#fff6e4',0.22) || c1, maglia2:c2,`,
`      maglia:mt(c1,'#fff6e4',0.30) || c1, maglia2:c2,`);
esatta('calze — lo stesso filo',
`      calze:mt(c1,'#fff6e4',0.22), risvolto:c2,`,
`      calze:mt(c1,'#fff6e4',0.30), risvolto:c2,`);

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
