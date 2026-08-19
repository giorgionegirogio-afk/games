/* =====================================================================
   _t-bordi.js — LA TOPPA "LA PRESA DEI COMANDI NON STA PIU' DENTRO LA
   STRISCIA DEL SISTEMA".

   TERZA EDIZIONE. Ricostruita sulla base 804328ee32d205024df6c265465e4ef5,
   cioe' DOPO il rifacimento di Touch5 (end/cancel/chiudi separati, flick
   spariti, PASSAGGIO sul pulsante piccolo, riadozione della levetta in
   move): tutti e venti gli ancoraggi sono stati riverificati su quel
   file, e i cinque che vivono dentro Touch5 (due in start, uno in move,
   due in chiudi) sono proprio quelli riscritti da quel rifacimento.
   ORDINE DI COMMIT, che non e' un dettaglio: sul gioco COMMITTATO
   (81c7247a) questa toppa NON si applica — mancano quattro ancoraggi, i
   numeri 4, 7, 8 e 9 — perche' il rifacimento di Touch5 e' ancora nella
   copia di lavoro. Deve entrare prima o insieme.
   Rispetto alla seconda edizione cambiano tre cose, tutte chieste dal
   critico: la toppa alla shell Android adesso SI RIFIUTA DI ESEGUIRSI
   invece di dirlo in un commento; il cambio 13 non spedisce piu' dentro
   il gioco i numeri di una corsa sola (il banco che li produceva non e'
   ripetibile, e adesso lo dichiara e ha un cancello che lo dice); e i
   commenti bugiardi rettificati passano da quattro a nove — quattro
   erano fuori dal blocco che il critico stava leggendo.

   META' DELLA PRIMA EDIZIONE E' STATA BUTTATA.
   La prima edizione faceva due cose: spostava i comandi dentro il bordo
   E riparava `touchcancel`, che chiamava la porta del rilascio e quindi
   trasformava un tocco rubato in un calcio. Quella seconda meta' NON
   ESISTE PIU' QUI: mentre questa toppa aspettava, il gioco l'ha gia'
   riparata da se' e meglio — Touch5 oggi ha tre porte separate
   (end ESEGUE, cancel ANNULLA, release INERTE), misurate da
   strumenti/_p-rilascio.js su 200 prove per braccio. Ricopiarla sarebbe
   stato scrivere due volte la stessa riparazione; e i numeri della prima
   edizione su quel punto (0/7 e 0/8 contro 8/8) sono numeri di un gioco
   che non c'e' piu' e non si spediscono.
   Resta la META' GEOMETRICA, che nessuno ha toccato; e si aggiungono il
   TETTO sul margine dal fondo (il suo VERSO e' misurato, la sua taglia
   no — vedi TETTO_BOT e il cambio 13), la legatura
   delle due costanti della presa — che erano DUE e non una sola, +10 in
   Touch5.start e +18 in due punti diversi — la misura del furto, e la
   rettifica di NOVE commenti che dopo lo spostamento avrebbero detto il
   falso. Sette dei nove ripetono la stessa coppia di affermazioni —
   «giocata.js preme (vw-66, vh-140) e (vw-70, vh-232)» e «i comandi non
   si spostano di un pixel» — e vanno smontate una per volta: la prima e'
   falsa DA IERI, perche' giocata.js chiede window.__test.pulsanti(0) e
   tiene quelle due coordinate solo come ripiego per i file d'archivio;
   la seconda resta vera nel senso in cui e' scritta (il comando non
   scappa da sotto il pollice) ma smette di essere vera nel senso in cui
   si legge, cioe' «quei due centri sono costanti»: da qui in poi
   dipendono dai bordi dello schermo.

   IL DIFETTO, misurato e non dedotto.
   L'HTML dichiara `viewport-fit=cover` — cioe' CHIEDE al sistema di
   disegnare fin sotto la tacca e sotto le barre — e poi non legge NEMMENO
   UNA VOLTA `env(safe-area-inset-*)`: zero occorrenze nel file.
   Ha preso la deroga e non ha pagato il prezzo che la deroga comporta.
   Il conto, in due righe:
     · pulsante GRANDE: centro (VW-64, VH-60), raggio 40, e Touch5.start
       accetta il tocco fino a `bt.r+10`. Quindi la PRESA arriva a
       VW-14 e VH-10: QUATTORDICI px CSS dal bordo destro e DIECI dal
       fondo.
     · su Android 10+ la striscia del gesto «indietro» e' larga circa 24
       dp su ciascun bordo verticale, e la maniglia dell'home vive nei
       primi ~20 dp dal fondo. Su una WebView a `width=device-width,
       initial-scale=1` un px CSS E' un dp: quindi la presa del comando
       principale sta DENTRO tutte e due.
   Chi appoggia il pollice li' non preme TIRA: apre il gesto di sistema.
   Oggi il gioco non ci calcia piu' sopra (vedi sopra), ma il COMANDO
   RESTA NON PREMIBILE: il pollice apre l'animazione dell'«indietro»
   invece di tirare. Il danno e' cambiato di specie, non e' sparito.

   COSA FA QUESTA TOPPA, in quattro mosse (venti cambi).
   1. Il CSS ESPONE gli inserti. Un canvas non ha layout, quindi
      `env(safe-area-inset-*)` non puo' entrare in nessuna regola utile:
      si mette una sonda invisibile il cui PADDING vale gli inserti, e la
      si legge con getComputedStyle. E' l'unico modo di portare quei
      quattro numeri dentro un gioco che disegna a mano.
   2. Il gioco accetta anche gli inserti del GESTO, che il CSS non
      conosce: `window.__insertiSistema`, scritto dalla shell Android che
      legge `WindowInsets.getSystemGestureInsets()` (toppa
      _t-bordi-java.js, che NON si applica oggi — vedi in fondo).
   3. UN MINIMO CHE VALE COMUNQUE: 24 px CSS di lato e 20 dal fondo.
      Serve perche' senza la shell la lettura dice zero, e un margine che
      si annulla appena lo strumento tace e' esattamente un cancello
      superato per la via piu' corta. Il minimo non e' una stima della
      realta': e' il pavimento sotto cui la geometria non scende mai.
   4. LA GEOMETRIA SI RICAVA, NON SI RISCRIVE:
        offset = margine + raggio + presa
      col massimo contro la quota storica, E CON UN TETTO SUL FONDO —
      vedi TETTO_BOT qui sotto, che e' la riserva numero due del critico
      e la sola parte di questa toppa che non c'era nella prima edizione.
      DEL TETTO SI SA IL VERSO E NON LA TAGLIA, e va detto qui: il banco
      (_t-bordi-prova.js --porta --ripeti 3) ripete che TOGLIERLO peggiora
      — su tutte le corse e in tutte e due le celle — ma NON sa dire
      quanto valga in assoluto, perche' fra una corsa e l'altra vaga piu'
      di quanto misura. Vedi il cambio 13, dove la differenza fra il
      gioco con e senza questa toppa risulta infatti indistinguibile dal
      rumore.

   COSA QUESTA TOPPA NON FA, dichiarato.
   Non impedisce ad Android di rubare il tocco: quello lo farebbe la
   toppa _t-bordi-java.js con setSystemGestureExclusionRects. QUELLA
   TOPPA OGGI SI RIFIUTA DI APPLICARSI — e non con un commento: lanciata
   esce 3 e non scrive niente, salvo che qualcuno imposti a mano la
   variabile d'ambiente TOPPA_JAVA_BORDI_RIMISURATA. Il divieto e'
   eseguibile perche' la sua ragione e' una misura sul telefono, rifatta
   il 19 agosto 2026 su questa base e su questa toppa (OnePlus 6,
   Android 11, dita scritte sul kernel, il telefono messo a tre tasti per
   riprodurre «senza furto» e verificato con navigation_mode = 0):
   togliendo il furto, una strisciata dal bordo destro all'altezza del
   comando grande produce 3 CALCI SU 6 e 3 comandi non chiesti su 6 —
   e lo stesso identico numero col gioco base e col gioco toppato,
   perche' la causa non e' dove sta il comando. Il primo touchstart
   consegnato alla pagina arriva fino a 47,5 px PIU' DENTRO del punto in
   cui il dito e' sceso, e 47,5 e' meno di 50, cioe' cade dentro la
   presa qualunque margine si scelga. Col furto (com'e' oggi): 0 calci
   su 6 e 0 comandi su 6, ma la partita va in pausa 3 volte su 6.
   Questa toppa si regge da sola su un altro fronte, e li' il guadagno e'
   misurato: col furto acceso, sul gioco BASE il comando risponde solo a
   partire da 15 px dal bordo destro mentre il sistema si prende i primi
   16 — cioe' non e' premibile — e col gioco TOPPATO risponde da 25, fuori
   dalla striscia. Sul telefono vero quel cancello passa da rosso a verde.

   E QUATTRO COSE CHE RESTANO APERTE, scritte qui perche' non si
   perdano — nessuna delle quattro e' chiusa da questa toppa.
     a) In DUE GIOCATORI, sul bordo SINISTRO. La striscia che il
        OnePlus 6 si prende a sinistra e' stata misurata a 40 dp (contro
        16 a destra e 16 dal fondo: il bordo sinistro e' il piu' ghiotto
        di tutti, e nessuno se l'aspettava). Il margine sinistro vale 24
        px senza tacca e 29 su quel telefono, che in orizzontale dichiara
        env(safe-area-inset-left) = 29: restano dentro il furto 16 px
        oppure 11. E il canale che alzerebbe quel margine — gli inserti
        del gesto consegnati dalla shell — e' proprio quello bloccato qui
        sopra. Il banco lo sa dire: _t-bordi-prova.js --banco --striscia 40
        accende un cancello ROSSO apposta.
     b) Il margine dal fondo e' una COSTANTE di 20 px (MIN_BOT e
        TETTO_BOT coincidono): non si adatta a niente, ed e' tarato sui
        16 dp misurati su un telefono solo.
     c) I contatori del furto non vedono Touch5.azzera(), cioe' non
        vedono il gesto HOME; e "salvati" usa la porta di kickBall
        mentre il rilascio carico passa da fireShot. Sgonfiano.
     d) Il duello dei rigori: pointercancel abbandona la mira. Fallisce
        in sicurezza, perde il gesto, e questa toppa non lo tocca.

   uso: node strumenti/_t-bordi.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

const CAMBI = [];
function cambio(nome, cerca, sostituisci) { CAMBI.push({ nome, cerca, sostituisci }); }

/* ------------------------------------------------------------------ 1
   IL CSS ESPONE GLI INSERTI. */
cambio('1. CSS — la sonda che rende leggibili gli env(safe-area-inset-*)',
`canvas#gioco{display:block;position:fixed;inset:0;touch-action:none}`,
`canvas#gioco{display:block;position:fixed;inset:0;touch-action:none}
/* =====================================================================
   LA SONDA DEGLI INSERTI DI SICUREZZA.
   Il documento dichiara viewport-fit=cover, cioe' si prende anche lo
   spazio sotto la tacca e sotto le barre di sistema. Il prezzo di quella
   deroga sono gli env(safe-area-inset-*), e un gioco che disegna tutto su
   un canvas non ha nessuna regola di layout in cui infilarli.
   Questo elemento serve solo a quello: non si vede (visibility:hidden),
   non riceve tocchi (pointer-events:none), non occupa flusso (fixed a 0,0
   con larghezza e altezza nulle), e il suo PADDING vale esattamente i
   quattro inserti. leggiInserti() lo legge con getComputedStyle e passa i
   numeri alla geometria dei comandi. Il selettore per id batte il
   *{padding:0} di sopra per specificita', quindi i valori arrivano
   davvero — e questo non e' un ragionamento, e' una misura: il banco
   sostituisce le env() con due letterali (30px e 34px) e verifica che
   getComputedStyle li restituisca. Senza quella prova i due stati «la
   regola vince» e «la regola perde» sarebbero indistinguibili, perche' in
   un browser da scrivania env(safe-area-inset-*) vale 0 ed e' DEFINITA:
   il fallback non scatta mai e uno zero giusto e uno zero sbagliato si
   scrivono uguale.
   ===================================================================== */
#inserti{
  position:fixed;left:0;top:0;width:0;height:0;
  visibility:hidden;pointer-events:none;
  padding-left:env(safe-area-inset-left,0px);
  padding-right:env(safe-area-inset-right,0px);
  padding-top:env(safe-area-inset-top,0px);
  padding-bottom:env(safe-area-inset-bottom,0px);
}`);

/* ------------------------------------------------------------------ 2
   La sonda nel documento, accanto alla tela. */
cambio('2. DOM — la sonda accanto alla tela',
`<canvas id="gioco"></canvas>`,
`<canvas id="gioco"></canvas>
<!-- la sonda degli inserti di sicurezza: vedi #inserti nel CSS -->
<div id="inserti" aria-hidden="true"></div>`);

/* ------------------------------------------------------------------ 3
   Lo stato dei bordi e la lettura, subito sopra la geometria che li usa. */
cambio('3. BORDI — lo stato, la lettura, i margini e il tetto',
`function touchBtnLayout(t){
  const right = (G.mode===2) ? (t===1) : true;`,
`/* =====================================================================
   I BORDI DEL TELEFONO — dove il gioco finisce e comincia il sistema.

   Tre numeri diversi, e confonderli e' il modo piu' facile di sbagliare:
     · SAFE AREA (env(safe-area-inset-*)): lo spazio che il DISEGNO non
       dovrebbe occupare — tacca, angoli stondati, barre. Il CSS lo sa.
     · INSERTI DEL GESTO (WindowInsets.getSystemGestureInsets): la
       striscia in cui il TOCCO non arriva all'app perche' se lo prende
       il sistema. Il CSS NON lo sa: non esiste una env() per questo. Lo
       puo' dire solo la shell, e lo scrive in window.__insertiSistema.
     · IL MINIMO DI CASA: 24 px CSS di lato, 20 dal fondo. Non e' una
       misura, e' un pavimento — vale quando gli altri due tacciono,
       cioe' su ogni banco senza inserti e su ogni APK senza la shell
       nuova. Senza di lui il margine sarebbe zero proprio dove nessuno
       guarda, che e' la definizione del cancello superato per la via
       piu' corta.
   Su una WebView a width=device-width e initial-scale=1 un px CSS e' un
   dp: i tre numeri sono confrontabili senza conversioni, e il piu' grande
   vince.

   E C'E' UN TETTO, che nella prima edizione mancava.
   Il margine dal fondo alza il pulsante grande, e sopra al pulsante
   grande c'e' LA BOCCA DELLA PORTA ATTACCATA — il soggetto che il gioco
   ha scritto a chiare lettere di non voler mai coprire. Un margine senza
   tetto e' alimentato da un numero che l'utente cambia dalle impostazioni
   del telefono (la sensibilita' del gesto «indietro»): a inserto 48 il
   disco sarebbe salito di 28 px e sarebbe finito DENTRO la fascia in cui
   la bocca vive. Cioe' piu' la toppa funzionava, piu' riapriva il difetto
   che la disposizione ad angolo era stata fatta per chiudere.
   TETTO_BOT e' il fondo scala: oltre quello il margine smette di alzare
   il comando. Sopra il tetto la protezione dal gesto la deve dare la
   shell (esclusione) o niente — ma non si paga con la porta coperta.

   E QUI VA DETTA UNA COSA SCOMODA, invece di lasciarla scoprire a chi
   legge il codice fra due anni: COL TETTO A 20 E IL PAVIMENTO A 20, IL
   MARGINE DAL FONDO E' UNA COSTANTE. Math.min(20, Math.max(20, ins.b,
   gest.b)) fa venti e basta, per ogni valore degli inserti. I due numeri
   che il gioco legge dal fondo — env(safe-area-inset-bottom) e
   __insertiSistema.b — si leggono e si buttano, e il disco grande sta
   alla stessa quota su qualunque telefono. Il meccanismo qui sotto e'
   scritto come se fosse adattivo e non lo e': lo diventerebbe soltanto
   il giorno che TETTO_BOT salisse sopra MIN_BOT, e alzarlo costa
   copertura della bocca della porta.
   QUINDI, IN CHIARO: il fondo e' protetto da VENTI px fissi. Sono stati
   scelti contro i SEDICI dp che la maniglia dell'home si e' presa su UN
   solo telefono (OnePlus 6, Android 11, misurati con
   _t-bordi-prova.js --telefono). Quattro px di franco, nessun
   adattamento, e nessun cancello che diventi rosso su un dispositivo che
   ne rubi di piu': quello resta un difetto aperto, non una cosa risolta.
   ===================================================================== */
const BORDI = {
  ins:  { l:0, r:0, t:0, b:0 },   // env(safe-area-inset-*), px CSS
  gest: { l:0, r:0, b:0 },        // inserti del gesto, dalla shell
  MIN_LAT: 24,                    // il pavimento laterale (dp = px CSS)
  MIN_BOT: 20,                    // il pavimento dal fondo
  TETTO_BOT: 20,                  // ... e il suo fondo scala (vedi sopra)
  presa: 10,                      // quanto la presa sborda dal disco: bt.r + presa
  ANELLO: 8,                      // quanto l'anello di esclusione sborda OLTRE la presa
  /* L'ANELLO DI ESCLUSIONE E' LEGATO ALLA PRESA, e prima non lo era.
     In Touch5 c'erano DUE numeri magici, non uno: bt.r+10 (il tocco e'
     preso) e bt.r+18 (il tocco e' ignorato, per non far nascere una
     levetta a filo del pulsante). Legandone uno solo, alzare BORDI.presa
     a 20 avrebbe spento l'anello in silenzio — la presa avrebbe scavalcato
     l'esclusione — senza un errore e senza che nessun banco lo vedesse.
     La differenza fissa era 8, e 8 resta: qui e' scritta una volta. */
  get escl(){ return this.presa + this.ANELLO; },
  mL: 24, mR: 24, mB: 20,         // i margini davvero applicati
  letto: false,
  annullati: 0,                   // tocchi che il sistema ci ha strappato
  salvati: 0,                     // ... e quanti di quei furti avrebbero calciato
};
function leggiInserti(){
  let el = document.getElementById('inserti');
  if(!el && document.body){
    el = document.createElement('div');
    el.id = 'inserti'; el.setAttribute('aria-hidden','true');
    document.body.appendChild(el);
  }
  const num = v => { const x = parseFloat(v); return (isFinite(x) && x > 0) ? x : 0; };
  if(el){
    const cs = getComputedStyle(el);
    BORDI.ins = { l:num(cs.paddingLeft), r:num(cs.paddingRight),
                  t:num(cs.paddingTop),  b:num(cs.paddingBottom) };
    BORDI.letto = true;
  }
  /* SE LA SHELL TACE, GLI INSERTI DEL GESTO TORNANO A ZERO — e non e' un
     dettaglio. Tenendo l'ultimo valore letto, un margine largo
     sopravviverebbe alla ragione che lo giustificava: si passa dalla
     navigazione a gesti a quella a tre tasti, il sistema non ruba piu'
     niente, e i comandi resterebbero arretrati per sempre senza che
     nessuno sappia perche'. Il banco l'ha trovato apposta (prova (c) di
     _t-bordi-prova.js): togliendo window.__insertiSistema il margine
     restava a 40 invece di tornare a 24. */
  const g = window.__insertiSistema;
  BORDI.gest = (g && typeof g === 'object')
    ? { l:num(g.l), r:num(g.r), b:num(g.b) }
    : { l:0, r:0, b:0 };
  BORDI.mL = Math.max(BORDI.MIN_LAT, BORDI.ins.l, BORDI.gest.l);
  BORDI.mR = Math.max(BORDI.MIN_LAT, BORDI.ins.r, BORDI.gest.r);
  /* IL FONDO SI TAPPA. Di lato no: a destra e a sinistra sopra i comandi
     non c'e' nessun soggetto chiave (la porta attaccata sta in ALTO
     rispetto ai dischi, non di fianco), quindi allargare non copre
     niente e il massimo puo' correre. */
  /* ATTENZIONE A QUESTA RIGA: oggi vale SEMPRE 20, perche' MIN_BOT e
     TETTO_BOT sono lo stesso numero (vedi il commento sopra). ins.b e
     gest.b entrano e non escono. E' scritta cosi' e non come una
     costante perche' il giorno che TETTO_BOT sale il meccanismo c'e'
     gia' — ma finche' i due numeri coincidono, chi legge non deve
     credere che il fondo si adatti al telefono: non si adatta. */
  BORDI.mB = Math.min(BORDI.TETTO_BOT,
                      Math.max(BORDI.MIN_BOT, BORDI.ins.b, BORDI.gest.b));
  return BORDI;
}
/* la shell puo' consegnare gli inserti del gesto DOPO il primo resize (il
   listener di WindowInsets arriva quando arriva). Quando lo fa chiama
   questa, e i comandi si ricollocano al fotogramma successivo: la
   geometria si rilegge a ogni touchBtnLayout, non e' cotta da nessuna
   parte. */
window.__insertiCambiati = function(){ return leggiInserti(); };
/* i due margini che valgono per la colonna dei comandi del lato scelto */
function margComandi(right){
  if(!BORDI.letto) leggiInserti();
  return { x: right ? BORDI.mR : BORDI.mL, y: BORDI.mB };
}
function touchBtnLayout(t){
  const right = (G.mode===2) ? (t===1) : true;`);

/* ------------------------------------------------------------------ 4
   La geometria dei due comandi, ricavata invece che riscritta. */
cambio('4. touchBtnLayout — la presa sta dentro il bordo',
`  return [
    poss ? { act:'shot',    label:'TIRA',      x:bx+s*64,  y:VH-60, r:40 }
         : { act:'slide',   label:'CONTRASTA', x:bx+s*64,  y:VH-60, r:40 },
    poss ? { act:'through', label:'PASSAGGIO', x:bx+s*158, y:VH-72, r:30 }
         : { act:'swap',    label:'CAMBIO',    x:bx+s*158, y:VH-72, r:30 },
  ];`,
`  /* ===================================================================
     LA PRESA STA DENTRO IL BORDO — e l'offset si CALCOLA.

     Le quattro costanti di prima (64, 60, 158, 72) erano giuste su uno
     schermo senza sistema operativo attorno. Con i gesti di Android la
     presa del GRANDE — che vale bt.r + BORDI.presa, cioe' 50 px attorno
     al centro — finiva a 14 px dal bordo destro e a 10 dal fondo: dentro
     la striscia del gesto «indietro» e dentro quella della maniglia.
     Adesso ogni offset e'
         margine + raggio + presa
     preso al MASSIMO con la quota storica, cosi':
       · su un banco senza inserti (margine = il minimo 24/20) il grande
         arretra di dieci pixel e il piccolo di dieci, e basta;
       · su un telefono che dichiara una tacca i comandi si spostano di
         quanto serve e non di piu';
       · nessuno schermo puo' spingerli PIU' FUORI di dove stavano;
       · e IN ALTO NON SALGONO OLTRE IL TETTO (BORDI.TETTO_BOT), perche'
         sopra di loro c'e' la bocca della porta.

     IL VARCO FRA I DUE DISCHI E' UN'INVARIANTE, NON UNA COINCIDENZA.
     Il commento in testa a questa funzione pretende sopra i 90 px fra i
     centri (40+30 di raggi, piu' 2x10 di margine di tocco) perche' sotto
     quella soglia un pollice preme due comandi insieme. Spostando solo il
     grande la distanza sarebbe scesa a radice(84^2+2^2) = 84,0: SOTTO la
     soglia, e la toppa avrebbe riaperto un difetto chiuso mentre ne
     chiudeva un altro. Qui l'offset del piccolo e' max(158, oxG+94):
     l'ampiezza orizzontale fra i centri non scende mai sotto 94, quindi
     la distanza non scende mai sotto 94,0 qualunque cosa dicano gli
     inserti. Col minimo di casa esce esattamente radice(94^2+2^2) = 94,0.

     LA QUOTA DEL PICCOLO NON SALE. Il piccolo aveva gia' la presa a 32 px
     dal fondo (72-40), sopra il minimo di 20: max(72, 20+30+10) = 72,
     quindi il disco PASSAGGIO/CAMBIO resta dove il conto sulla bocca
     della porta l'aveva messo. Sale solo il grande, di dieci pixel: il
     suo bordo alto passa da y 312 a y 302 su una tela di 412. Con il
     tetto quei dieci pixel sono TUTTO il movimento verticale possibile:
     nessun inserto, per quanto grande, ne aggiunge un undicesimo.
     =================================================================== */
  const M = margComandi(right), P = BORDI.presa;
  const oxG = Math.max(64,  M.x + 40 + P);
  const oyG = Math.max(60,  M.y + 40 + P);
  const oxP = Math.max(158, oxG + 94);
  const oyP = Math.max(72,  M.y + 30 + P);
  return [
    poss ? { act:'shot',    label:'TIRA',      x:bx+s*oxG, y:VH-oyG, r:40 }
         : { act:'slide',   label:'CONTRASTA', x:bx+s*oxG, y:VH-oyG, r:40 },
    poss ? { act:'through', label:'PASSAGGIO', x:bx+s*oxP, y:VH-oyP, r:30 }
         : { act:'swap',    label:'CAMBIO',    x:bx+s*oxP, y:VH-oyP, r:30 },
  ];`);

/* ------------------------------------------------------------------ 5
   La presa non e' piu' un 10 scritto a mano. */
cambio('5. Touch5.start — la presa e\' una sola costante',
`        const d=len(x-bt.x,y-bt.y);
        if(d<=bt.r+10){`,
`        const d=len(x-bt.x,y-bt.y);
        /* la presa e' BORDI.presa e non piu' un 10 sparso: la geometria
           che tiene i comandi dentro il bordo deve usare LO STESSO numero
           che decide se il tocco e' preso, se no la toppa proteggerebbe
           un riquadro diverso da quello che il dito trova. */
        if(d<=bt.r+BORDI.presa){`);

/* ------------------------------------------------------------------ 6
   L'anello di esclusione, in Touch5.start. */
cambio('6. Touch5.start — l\'anello di esclusione segue la presa',
`        if(d<=bt.r+18) return;`,
`        /* BORDI.escl, non 18: se la presa cresce e l'anello resta fermo,
           l'anello sparisce sotto la presa senza un errore e senza che
           nessun banco lo veda. __test.bordi() lo dichiara apposta. */
        if(d<=bt.r+BORDI.escl) return;`);

/* ------------------------------------------------------------------ 7
   L'anello di esclusione, nella RIADOZIONE — la seconda occorrenza, che
   la critica non aveva contato ma che si sarebbe slegata allo stesso modo. */
cambio('7. Touch5.move — l\'anello di esclusione della riadozione',
`        for(const bt of touchBtnLayout(tr)){ if(len(x-bt.x,y-bt.y)<=bt.r+18){ suPulsante=true; break; } }`,
`        /* stesso anello di start(), stessa costante: erano due 18 scritti
           a mano in due punti diversi, e slegarne uno solo avrebbe fatto
           divergere l'adozione dal primo tocco. */
        for(const bt of touchBtnLayout(tr)){ if(len(x-bt.x,y-bt.y)<=bt.r+BORDI.escl){ suPulsante=true; break; } }`);

/* ------------------------------------------------------------------ 8
   Il furto si CONTA. Il gioco lo ripara gia' da se': qui si aggiunge solo
   la misura, perche' oggi nessuno sa quante volte succede. */
cambio('8. Touch5.chiudi — il furto si conta',
`  chiudi(id,annulla){
    const bt=this.btnTouch[id];`,
`  /* I DUE CONTATORI DEL FURTO, e cosa NON contano.
     La riparazione del touchcancel e' gia' nel gioco (end/cancel/release
     sono tre porte diverse, e release e' inerte). Quello che mancava era
     la MISURA: quante volte il sistema si prende un dito, e quante di
     quelle volte quel dito stava per calciare. Senza il conteggio
     «touchcancel e' innocuo» resta una lettura del codice, e la
     frequenza del furto — che e' il motivo per cui questa toppa sposta i
     comandi — non la sa nessuno.
     LA LEVETTA NON PUO' CONTRIBUIRE A "salvati", ed e' giusto che sia
     zero: release(t,s) torna false senza fare niente, quindi un furto
     sulla levetta non ha mai un calcio da salvare. Un contatore che
     incrementasse li' gonfierebbe il difetto — ed e' esattamente
     l'errore che questa riga evita.

     E ADESSO CIO' CHE QUESTI DUE CONTATORI NON VEDONO, scritto qui
     perche' chi legge il numero sappia di che numero si tratta.
     Contano solo dentro chiudi. Ma Touch5.azzera() svuota btnTouch
     SENZA passare di qui — e azzera() e' quello che gira su blur, su
     visibilitychange e dentro setPaused. Cioe' proprio il gesto HOME
     dal fondo, quello che manda l'app dietro e che sul telefono e' il
     furto piu' facile da fare col pollice, e' INVISIBILE a questa
     misura: dito giu', app in secondo piano, annullati resta zero.
     Chi vuole contare anche quello deve contarlo in azzera(), e non lo
     fa questa toppa: la riparazione e' un'altra passata, e un numero
     che si sa incompleto e' meglio di un numero che finge. */
  chiudi(id,annulla){
    if(annulla) BORDI.annullati++;
    const bt=this.btnTouch[id];`);

cambio('9. Touch5.chiudi — salvati guarda il pallone, non l\'intenzione',
`      if(bt.act==='shot'){
        if(annulla) this.annullaCarica(bt.t);
        else if(!G.paused) releaseCharge(bt.t);
      }`,
`      if(bt.act==='shot'){
        if(annulla){
          /* SAREBBE PARTITO DAVVERO UN CALCIO? Non basta che ci fosse un
             dito sul pulsante: releaseCharge finisce in kickBall o in
             fireShot, e kickBall si rifiuta se il pallone non e' del
             giocatore ne' a portata (owner != p e d > KICK_R). Qui si
             ricopia la condizione di kickBall — se no il contatore
             misura l'intenzione invece dell'effetto, e il difetto
             risulta piu' grande di quello che e'.

             MA NON E' LA STESSA CONDIZIONE, E VA DETTO. Il rilascio
             CARICO non passa da kickBall: passa da fireShot, la cui
             porta e' KICK_R*1.4 = 36,4 e non KICK_R = 26. Nella banda
             fra 26 e 36,4 fireShot entra lo stesso e fa cose che il
             giocatore non ha chiesto — segna un tiro nel tabellino
             (G.stats.tiri), stende lo striscione, fa vibrare — anche se
             poi kickBall si rifiuta di muovere il pallone. Quei furti
             qui NON si contano.
             IL VERSO PERO' E' SICURO: questo contatore SGONFIA, non
             gonfia. Un difetto puo' risultare piu' piccolo del vero, mai
             piu' grande — che e' l'unico errore che una misura del
             genere puo' permettersi. Allinearlo a fireShot e' una riga,
             ma cambierebbe il significato del numero e va fatto insieme
             al banco che lo verifica, non di straforo qui. */
          const p=ctrlPlayer(bt.t);
          if(p && p.charge>=0 && !p.chargeGo &&
             (G.ball.owner===G.players.indexOf(p) ||
              len(G.ball.x-p.x,G.ball.y-p.y)<=KICK_R)) BORDI.salvati++;
          this.annullaCarica(bt.t);
        }
        else if(!G.paused) releaseCharge(bt.t);
      }`);

/* ------------------------------------------------------------------ 10
   Gli inserti si rileggono a ogni resize: la rotazione li cambia. */
cambio('10. resize — gli inserti si rileggono a ogni misura della finestra',
`  VW=innerWidth; VH=innerHeight;
  cv.width=Math.round(VW*DPR); cv.height=Math.round(VH*DPR);`,
`  VW=innerWidth; VH=innerHeight;
  /* gli inserti cambiano con la ROTAZIONE (in orizzontale la tacca passa
     da sopra a un fianco) e con la modalita' di navigazione. Qui e'
     l'unico punto in cui il gioco riconosce che la finestra e' cambiata:
     e' anche l'unico punto giusto per rileggerli. */
  leggiInserti();
  cv.width=Math.round(VW*DPR); cv.height=Math.round(VH*DPR);`);

/* ------------------------------------------------------------------ 11
   Il gioco DICHIARA i bordi: un banco li misura invece di ricordarseli. */
cambio('11. __test.bordi — i margini, l\'anello e il furto, dichiarati',
`  get comandiTouch(){ return TOUCH_ZONE.map(z=>Object.assign({},z)); },`,
`  get comandiTouch(){ return TOUCH_ZONE.map(z=>Object.assign({},z)); },
  /* =====================================================================
     I BORDI, DICHIARATI DAL GIOCO.

     Un banco che volesse verificare «la presa sta almeno 24 dp dai bordi»
     avrebbe due modi: rifare il conto per conto suo (e invecchiare in
     silenzio il giorno che la geometria cambia) oppure chiederlo a chi lo
     sa. Questa funzione restituisce quello che il gioco ha davvero usato:
     gli inserti letti, i margini applicati, la presa, L'ANELLO DI
     ESCLUSIONE (che e' un raggio diverso e va dichiarato a parte, se no
     un banco che legge solo "presa" crede di misurare un riquadro e ne
     misura un altro), e per ogni comando i due rettangoli con le loro
     distanze dai bordi dello schermo.
     annullati/salvati sono la misura del furto: quanti tocchi il sistema
     si e' preso, e quanti di quei furti avrebbero prodotto un calcio.
     DUE LIMITI DICHIARATI, per chi legge questi due numeri:
       · contano solo i furti che passano da Touch5.chiudi. Touch5.azzera
         (blur, visibilitychange, pausa — cioe' il gesto HOME) svuota le
         dita senza passare di li' e non incrementa niente;
       · "salvati" ricopia la porta di kickBall (KICK_R) mentre il
         rilascio carico passa da fireShot (KICK_R*1.4): fra i due raggi
         il furto non viene contato. Sgonfia, non gonfia.
     ===================================================================== */
  bordi(t){
    const right = (G.mode===2) ? (((t|0)===1)) : true;
    const M = margComandi(right);
    const P = BORDI.presa, E = BORDI.escl;
    const pres = touchBtnLayout((t|0)===1?1:0).map(b=>({
      act:b.act, label:b.label, x:b.x, y:b.y, r:b.r,
      x0:b.x-b.r-P, y0:b.y-b.r-P, x1:b.x+b.r+P, y1:b.y+b.r+P,
      daSinistra:+(b.x-b.r-P).toFixed(2),
      daDestra:  +(VW-(b.x+b.r+P)).toFixed(2),
      daSopra:   +(b.y-b.r-P).toFixed(2),
      daFondo:   +(VH-(b.y+b.r+P)).toFixed(2),
      /* l'anello: dove un tocco NON e' preso ma nemmeno diventa levetta */
      esclDaDestra:+(VW-(b.x+b.r+E)).toFixed(2),
      esclDaFondo: +(VH-(b.y+b.r+E)).toFixed(2),
      discoSopra:  +(b.y-b.r).toFixed(2),
    }));
    let varco = null;
    if(pres.length>=2) varco = +Math.hypot(pres[0].x-pres[1].x, pres[0].y-pres[1].y).toFixed(2);
    return {
      vw:VW, vh:VH, dpr:window.devicePixelRatio||1,
      inserti:Object.assign({},BORDI.ins),
      gesto:Object.assign({},BORDI.gest),
      minimi:{lat:BORDI.MIN_LAT, fondo:BORDI.MIN_BOT, tettoFondo:BORDI.TETTO_BOT},
      margini:{sinistra:BORDI.mL, destra:BORDI.mR, fondo:BORDI.mB},
      presa:P, anello:E, shell:!!window.__insertiSistema,
      comandi:pres, varco,
      annullati:BORDI.annullati, salvati:BORDI.salvati,
    };
  },
  azzeraBordi(){ BORDI.annullati=0; BORDI.salvati=0; return true; },`);

/* ------------------------------------------------------------------ 12
   I COMMENTI CHE ADESSO MENTIREBBERO. Tre punti del gioco raccontano le
   vecchie coordinate come se fossero ancora vere. Una toppa che sposta i
   comandi e lascia in piedi la prosa che li descrive fabbrica il difetto
   che questa casa chiama «attestare invece di misurare», solo scritto in
   italiano invece che in JavaScript. */
cambio('12. il commento della coppia in diagonale — le quote diventano un intervallo',
`     · GRANDE  (VW-64, VH-60)  r 40  ->  y 312-392 su 412, x VW-104..VW-24
     · PICCOLO (VW-158, VH-72) r 30  ->  y 310-370,       x VW-188..VW-128`,
`     · GRANDE  (VW-oxG, VH-oyG) r 40   · PICCOLO (VW-oxP, VH-oyP) r 30
   LE QUATTRO QUOTE NON SONO PIU' COSTANTI, e questo commento non le puo'
   piu' elencare: le calcola touchBtnLayout dai margini dei bordi (vedi
   BORDI, poco sopra), perche' la presa del grande cadeva dentro la
   striscia del gesto «indietro» di Android. Su uno schermo senza inserti
   valgono (VW-74, VH-70) e (VW-168, VH-72), cioe' il grande copre
   y 302-382 su 412 e il piccolo y 310-370; con inserti piu' larghi il
   grande arretra di lato e NON sale oltre y 302 (BORDI.TETTO_BOT).
   Chi vuole i numeri di ADESSO li chiede a __test.pulsanti() o a
   __test.bordi(): sono la stessa cosa che il gioco usa per disegnare.`);

cambio('13. la fascia della bocca: otto fermi immagine diventano una distribuzione',
`   cui la porta e' in quadro la sua bocca finisce fra y 296 e y 302 (il
   pallone sta nel terzo centrale, quindi la bocca non puo' scendere
   molto piu' in basso senza che la palla esca dal terzo). I due dischi
   cominciano a 310 e 312: dieci pixel sotto il caso peggiore misurato.`,
`   cui la porta e' in quadro la sua bocca finisce fra y 296 e y 302.
   QUELLA FASCIA NON ESISTE, e la riga si rettifica qui invece di
   restare in piedi. I due numeri vengono da otto fermi immagine: la
   bocca segue la camera e la camera segue il pallone, quindi non abita
   nessuna fascia. Campionata in partita vera (CPU contro CPU,
   strumenti/_t-bordi-prova.js --porta --ripeti 3, tre corse da 60 s per
   cella, quattro celle, 19 agosto 2026) il bordo BASSO della bocca ha
   spazzato quasi tutta l'altezza dello schermo: da y 1 a y 384 su una
   tela alta 384, da y 2 a y 412 su una tela alta 412. Percio' «dieci
   pixel sotto il caso peggiore» non e' mai stato vero: la bocca arriva
   al fondo dello schermo, sotto tutti e due i dischi.

   E DA QUI IN GIU' NON C'E' NESSUNA PERCENTUALE, DI PROPOSITO. La
   seconda meta' della rettifica vale quanto la prima, e' che il banco
   che quella percentuale la produrrebbe NON E' RIPETIBILE — e adesso lo
   dichiara da se'. Tre corse dello stesso identico comando hanno visto
   la bocca in quadro fra il 21% e il 31% dei fotogrammi a 810x384; a
   915x412 in cinque contro cinque la quota di fotogrammi in cui finisce
   sotto un comando e' passata dal 7% al 67% senza che cambiasse una
   riga; a 810x384 in undici contro undici, in due corse su tre la bocca
   non e' MAI entrata in quadro. La differenza fra il gioco con questa
   toppa e senza vale pochi punti e cade dentro quel rumore: ha cambiato
   SEGNO fra una corsa e l'altra nelle due celle in cui e' diversa da
   zero. Il cancello di ripetibilita' di --porta e' rosso su quel
   confronto, e un numero che il suo strumento ha gia' dichiarato non
   valido non si scrive dentro un file che nessuno rimisurera' per anni.
   Chi lo vuole, lo rifa'.

   CIO' CHE IL BANCO RIPETE, ed e' la sola ragione del TETTO: il
   confronto fra assetti e' APPAIATO — dentro una corsa gli assetti si
   giudicano sugli STESSI campioni — e TOGLIENDO il tetto il disco
   grande sale e la bocca gli finisce sotto PIU' spesso. In tutte e
   dieci le corse valide delle quattro celle, senza eccezioni: fra mezzo
   punto e nove punti percentuali in piu' con un inserto di 32, fra uno
   e tredici con un inserto di 48. Il VERSO e' solido; la taglia no, ed
   e' per questo che qui non c'e'.
   I due dischi cominciano a 310 e 312 su uno schermo senza inserti; con
   i bordi di sistema il grande sale a 302 e non oltre (BORDI.TETTO_BOT).`);

cambio('14. il commento del tasto premuto — non piu\' due coordinate scritte a mano',
`         LE POSIZIONI NON CAMBIANO DI UN PIXEL: giocata.js preme
         (vw-66, vh-140) e (vw-70, vh-232), e li trova.`,
`         LE POSIZIONI NON CAMBIANO PER LA PRESSIONE: il disco scende di
         2 px e risale, e nient'altro si muove. Dove stiano quei dischi
         lo dice touchBtnLayout, che li ricava dai bordi dello schermo:
         giocata.js infatti non scrive piu' due coordinate a mano, chiede
         __test.pulsanti(0).`);

cambio('15. il commento dello scarto col pallone — stessa bugia, secondo punto',
`      /* LO SCARTO COL PALLONE. Il pulsante non si sposta di un pixel —
         giocata.js preme (vw-66, vh-140) e (vw-70, vh-232) e li deve
         trovare — quindi qui la regola e' la sfumatura. Il tocco non
         cambia: la mappa dei tocchi non legge questo alfa. */`,
`      /* LO SCARTO COL PALLONE. Il pulsante non si sposta di un pixel
         quando il pallone gli arriva addosso — chi lo cerca lo trova
         dove touchBtnLayout dice che sia — quindi qui la regola e' la
         SFUMATURA. Il tocco non cambia: la mappa dei tocchi non legge
         questo alfa, e infatti un comando velato resta premibile.
         E' anche la mitigazione dichiarata del prezzo di BORDI: il disco
         grande sale di 10 px e si avvicina alla bocca della porta, e
         quando gliela copre e' questo alfa a togliersi di mezzo. Quanto
         spesso succeda lo misura _t-bordi-prova.js --porta; non e' una
         cosa da dedurre da qui. */`);

/* ------------------------------------------------------------------ 16
   LA QUINTA BUGIA, trovata dal critico dentro lo stesso commento che il
   cambio 12 riscrive, settanta righe piu' sotto. Un avviso operativo
   scaduto e' peggio di nessun avviso: manda a riparare una cosa gia'
   riparata, e insegna a non fidarsi degli avvisi. */
cambio('16. l\'avviso ai cancelli era scaduto: giocata.js chiede i pulsanti da ieri',
`   ATTENZIONE, PER CHI TIENE I CANCELLI: strumenti/giocata.js preme
   ancora (vw-66, vh-140) e (vw-70, vh-232) scritti a mano. Quelle due
   coordinate NON sono piu' i centri, e il cancello va aggiornato a
   leggere __test.comandiTouch — che il gioco esporta da sempre proprio
   per questo. Un cancello che attesta una posizione invece di misurarla
   e' la trappola di casa numero quattro, e qui presenta il conto.`,
`   PER CHI TIENE I CANCELLI: NON CI SONO PIU' COORDINATE DA RICOPIARE, e
   soprattutto NON CE NE SONO PIU' DI FISSE. Qui c'era scritto che
   strumenti/giocata.js premeva ancora (vw-66, vh-140) e (vw-70, vh-232)
   scritti a mano e che il cancello andava aggiornato: e' stato
   aggiornato, giocata.js chiede window.__test.pulsanti(0) e tiene quelle
   due coordinate solo come ripiego per i file d'archivio che quella
   funzione non la esportano. L'avviso era rimasto in piedi dopo la
   riparazione che chiedeva — cioe' era diventato lui la trappola numero
   quattro. Da oggi c'e' una ragione in piu' per chiedere invece di
   ricordare: i centri dipendono dai bordi del telefono (vedi BORDI, piu'
   sotto), quindi non sono piu' costanti nemmeno in linea di principio.`);

/* ------------------------------------------------------------------ 17-20
   E QUATTRO CHE IL CRITICO NON HA CONTATO PERCHE' STANNO ALTROVE NEL
   FILE, ma che questa toppa rende false lo stesso: dicono tutte che i
   comandi «non si spostano di un pixel» e che giocata.js preme le loro
   coordinate. La prima meta' era gia' falsa prima (i centri erano
   (VW-64, VH-60), non (VW-66, VH-140): li aveva spostati un'onda
   precedente senza raddrizzare la prosa); la seconda diventa falsa QUI,
   perche' da adesso i centri dipendono dagli inserti dello schermo.
   Il ragionamento che quelle righe portano — quando il pallone arriva
   addosso a un comando e' il comando a sfumare, non a spostarsi — resta
   valido parola per parola: cambia solo il MOTIVO per cui il comando non
   si sposta. Non si sposta perche' e' un comando, non perche' un
   cancello ne ha memorizzato la posizione. */
cambio('17. la minimappa: TIRA non e\' "inchiodato", e non lo era gia\' prima',
`     Nell'angolo destro l'aggancio sopra la fascia delle insegne spingeva
     il radar SOTTO il pulsante TIRA, che vive inchiodato a (VW-66,
     VH-140) — giocata.js preme quelle coordinate e non si spostano. La`,
`     Nell'angolo destro l'aggancio sopra la fascia delle insegne spingeva
     il radar SOTTO il pulsante TIRA. Dove viva TIRA lo dice
     touchBtnLayout e nessun altro: NON e' inchiodato a due costanti (le
     due che stavano scritte qui, VW-66 e VH-140, erano vecchie di
     un'onda) e da quando i comandi rientrano dai bordi del telefono
     dipende anche dagli inserti. La`);

cambio('18. la minimappa, secondo punto: la colonna dei comandi non e\' due numeri',
`       · basso-destra e alto-destra sono la colonna dei comandi (TIRA vive
         inchiodato a VW-66, VH-140 e giocata.js preme quelle coordinate);`,
`       · basso-destra e alto-destra sono la colonna dei comandi (dove
         stia TIRA lo dice touchBtnLayout, che lo ricava dai bordi dello
         schermo; giocata.js glielo chiede con __test.pulsanti);`);

cambio('19. lo scarto dell\'HUD: perche\' i comandi non si spostano',
`   SPOSTARSI (torna in fascia bassa, dove non copre niente); se anche li'
   il pallone la raggiunge, e per stick e pulsanti — che non si possono
   spostare di un pixel, perche' giocata.js preme quelle coordinate —
   resta la SFUMATURA:`,
`   SPOSTARSI (torna in fascia bassa, dove non copre niente); se anche li'
   il pallone la raggiunge, e per stick e pulsanti — che non si spostano
   perche' sono i COMANDI, e un comando che scappa da sotto il pollice e'
   peggio del pallone coperto: dove stiano lo decide touchBtnLayout e non
   un cancello che se li e' ricopiati —
   resta la SFUMATURA:`);

cambio('20. lo scarto dell\'HUD, secondo punto: "posizioni FISSE" non lo sono piu\'',
`     · IN BASSO STICK E PULSANTI stanno in posizioni FISSE che
       giocata.js preme al pixel, e la camera non li puo' evitare: li'
       si fa da parte l'interfaccia, con lo stesso scarto morbido che
       gia' esisteva per il pallone.`,
`     · IN BASSO STICK E PULSANTI stanno dove il pollice li cerca — non
       si spostano MAI per far passare qualcosa, e da quando rientrano
       dai bordi del telefono la loro posizione non e' nemmeno piu' una
       costante: la ricava touchBtnLayout dagli inserti dello schermo, e
       chi li deve premere la chiede a __test.pulsanti. La camera non li
       puo' evitare, quindi li' si fa da parte l'interfaccia, con lo
       stesso scarto morbido che gia' esisteva per il pallone.`);

/* ------------------------------------------------------------------ */
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_t-bordi.js ingresso.html uscita.html'); process.exit(2); }
let t = fs.readFileSync(ing, 'utf8');
const guai = [];
for (const c of CAMBI) {
  const n = t.split(c.cerca).length - 1;
  if (n !== 1) { guai.push(`${c.nome}: ancoraggio trovato ${n} volte (ne serve 1)`); continue; }
  t = t.replace(c.cerca, c.sostituisci);
}
if (guai.length) { console.error('TOPPA NON APPLICATA:\n  ' + guai.join('\n  ')); process.exit(1); }
fs.writeFileSync(usc, t);
console.log(`toppa applicata: ${CAMBI.length} cambi, ${ing} -> ${usc}`);
