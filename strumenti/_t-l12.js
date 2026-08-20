/* =====================================================================
   _t-l12.js — L1.2, IL DISCO DIFENSIVO: CONTRASTO, CONTENIMENTO,
   SCIVOLATA. Tre verbi in fila su un dito solo, e nessuno dei tre nasce
   da una soglia sull'orologio.

   Toppa cerca/sostituisci. Legge CALCETTO-il-gioco.html (o --in),
   sostituisce DODICI ancoraggi ESATTI e scrive la copia in --out. Senza
   --out scrive accanto all'originale un file col suffisso .l12.html:
   mai sull'originale, se non con --dentro. Se anche un solo ancoraggio
   non compare ESATTAMENTE UNA VOLTA si ferma con codice 1, dice quale, e
   non scrive niente.

   uso:
     node strumenti/_t-l12.js --out fuori/l12.html
     node strumenti/_t-l12.js --in altro.html --out x.html
     node strumenti/_t-l12.js --dentro
     node strumenti/_t-l12.js --elenco

   ---------------------------------------------------------------------
   LA TESI, ED E' CONTROINTUITIVA. Non si distingue il colpetto dalla
   tenuta: SI METTONO IN FILA.

     PRESSIONE  contrasto in piedi, subito. Nessun corpo a terra.
     TENUTA     contenimento: si rallenta e si tiene la faccia addosso.
     RILASCIO   niente. A meno che il dito abbia TRASCINATO: allora, e
                solo allora, la scivolata, e nella direzione trascinata.

   Un telefono in affanno non puo' produrre il verbo sbagliato, perche'
   non c'e' un verbo sbagliato da produrre: entrambi accadono, e
   nell'ordine in cui il calcio li mette. Questo chiude in una riga il
   giudizio che sedici pareri hanno ripetuto quattro volte — «premo
   CONTRASTA e resto un attimo di troppo, sono per terra e loro segnano».

   PRIMA DI QUESTA TOPPA, misurato con strumenti/_q-l12.js sul gioco di
   oggi (md5 30279089de83, seme 20260819, corsa lunga):
     · premere CONTRASTA manda a terra il corpo in 138 pressioni su 140,
       entro tre fotogrammi. Correndo addosso all'uomo: 60 su 60;
     · DUECENTO gesti senza il minimo trascinamento producono DUECENTO
       scivolate e DUECENTO falli;
     · il trascinamento non conta niente: la scivolata punta il pallone,
       e l'errore fra dove il dito ha tirato e dove il corpo e' andato e'
       la mediana di 90 gradi su otto direzioni (0 gradi se tiri verso il
       pallone, 180 se tiri dalla parte opposta);
     · rientrare col dito prima di rilasciare non disfa niente: quaranta
       prove su quaranta scivolano lo stesso, e quaranta fanno fallo;
     · un annullo di sistema (touchcancel) scivola come un rilascio:
       quaranta su quaranta, con quaranta falli.
   DOPO: gli stessi numeri sono 0 su 140, 0 su 200, mediana 0 gradi
   (massimo 0 su ventiquattro trascinamenti), 0 su 40 e 0 su 40; e il
   pallone si conquista in 102 pressioni su 140 dove a dito fermo se ne
   conquista 1 su 140.

   ---------------------------------------------------------------------
   LE QUATTRO DECISIONI CHE COSTANO, E VANNO DETTE.

   1. LA TASTIERA NON CAMBIA DI UN BIT. Il tasto Z resta la scivolata di
      sempre, con la sua mira rifatta sul pallone. Cambia il DISCO, che
      e' l'oggetto di cui parla questa voce: doSlide prende una FASE, e
      senza fase e' la funzione di ieri, riga per riga. Il controllo H
      del cancello lo misura sul gioco toppato premendo il tasto vero.

   2. LA MIRA DEL DITO NON SI RIFA' SUL PALLONE. lanciaScivolata
      ricalcolava sempre la direzione verso il pallone, «perche' fra la
      decisione e il lancio il pallone si e' mosso». Per l'IA e per la
      tastiera resta cosi'. Per il dito no: se il trascinamento non
      comandasse la direzione, il trascinamento non sarebbe un comando —
      e la misura D del cancello sarebbe verde su un gioco che ignora il
      dito. Il costo dichiarato: una scivolata mirata male manca il
      pallone, e adesso lo manca DAVVERO invece di essere corretta di
      nascosto. E' il prezzo di avere 360 gradi.

   3. IL CONTENIMENTO SI SPEGNE QUANDO IL DISCO SMETTE DI DIRE
      «CONTRASTA», e non e' una scelta di questa toppa: e' il ri-armo di
      L1.1, che uccide l'atto quando il verbo sotto il dito cambia. In
      pratica il contenimento vive finche' il pallone sta oltre
      KICK_R*1,4 = 36,4 unita' — perche' da li' in dentro il disco offre
      TIRA, che e' la verita' (a quella distanza un calcio parte davvero,
      vedi la toppa L0.4b). Non e' un difetto: e' la distanza a cui si
      contiene. Quando ci si avvicina, il verbo diventa un altro.
      LA FINESTRA DEL CONTRASTO INVECE SOPRAVVIVE al ri-armo, ed e' il
      motivo per cui il verbo funziona: si preme mentre si arriva, non
      quando si e' arrivati.

   4. LA CONQUISTA DEL PALLONE COL CONTRASTO IN PIEDI NON ENTRA NELLE
      STATISTICHE. G.stats.rubate conta oggi le sole rubate PULITE della
      scivolata, e ci sta appeso un trofeo («10 rubate»). Contarci anche
      il contrasto vorrebbe dire cambiare il ritmo di un trofeo, che non
      e' argomento di questa voce; non contarcelo vuol dire che il
      tabellino sotto-conta i recuperi. Ho scelto di NON toccare il
      tabellino, e lo dichiaro invece di nasconderlo.

   ---------------------------------------------------------------------
   DOVE VENGONO I NUMERI. Le tre costanti del contrasto (0,18 s di
   finestra, x1,8 di fronte, 0,22 s di pausa se fallisce) e il fattore
   0,62 del contenimento sono del progetto approvato, §4 di
   _analisi/agente28.md: sono di partenza, non tarati, e questa toppa non
   li ha tarati. La base 0,42 di stealP, il x0,55 «da dietro», i
   cooldown 0,35/0,5 e la velocita' 380 della spazzata NON sono numeri
   nuovi: sono gli stessi che il gioco usa gia' per il furto col corpo
   (updateBall) e per la spazzata della scivolata (checkSlideContact).
   La copia e' voluta: due modi di togliere il pallone allo stesso
   avversario non possono avere due tarature diverse.

   IL RAGGIO DEL CONTRASTO E' KICK_R, e non un numero nuovo: si contrasta
   dove si calcia. Il furto col corpo, che e' la versione passiva della
   stessa cosa, arriva a P_R+B_R+1 = 22 unita'; il piede teso arriva a
   26. La differenza fra le due e' precisamente cio' che il dito compra.

   ---------------------------------------------------------------------
   I DUE PATH CHE NON SI POSSONO INCROCIARE. Il contrasto attivo gira in
   updatePlayerFisica, il furto col corpo in updateBall, e i giocatori si
   aggiornano PRIMA del pallone: quindi il contrasto va per primo e, in
   qualunque modo finisca, scrive p.kickCd (0,35 se prende, 0,22 se
   fallisce). Il furto col corpo pretende kickCd<=0. Non possono percio'
   sparare nello stesso fotogramma, e nessuno paga due sorteggi per un
   gesto solo. Questa toppa NON tocca una riga di updateBall.

   IL SORTEGGIO SI CONSUMA SOLO SE C'E' UN CONTRASTO DA RISOLVERE: le
   guardie (pausa, distanza, padrone del pallone) vengono prima del
   Math.random. E la finestra la apre soltanto un DITO su un disco
   (Touch5.start -> doSlide 'premi'): senza dita non si apre mai, quindi
   non si consuma un bit e nessun banco a seme fisso si sfasa.
   MISURATO, non dedotto: mille e ottocento fotogrammi a seme fisso senza
   toccare niente, sessanta campioni di tutto lo stato (pallone,
   possesso, posizione, velocita', faccia, scivolata e carica di ogni
   giocatore, punteggio, scena). Fra il gioco di oggi e la copia toppata:
   ZERO differenze in ZERO campioni, e lo stesso md5 della traccia. Due
   corse, tutt'e due identiche. (Il valore dell'md5 CAMBIA da una corsa
   all'altra e non si scrive qui: dipende da quanti passi serve al banco
   per entrare in partita, che il banco non controlla. Cio' che e'
   stabile, ed e' cio' che conta, e' che i DUE FILE diano lo stesso.)
   Attrezzo: fuori/_traccia-l12.js.
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
   Nessuna espressione regolare, nessun numero di riga.
   -------------------------------------------------------------------- */
const ANCORE = [

/* 1 — i due campi nuovi del giocatore */
{
  nome: '1/12 makePlayer: i due campi del disco difensivo',
  cerca:
`    slide:-1,                          // -1 = no; >=0 tempo trascorso in scivolata
    slideDX:0, slideDY:0,
    recover:0,                         // a terra dopo la scivolata
    kickCd:0,                          // cooldown tocco palla`,
  metti:
`    slide:-1,                          // -1 = no; >=0 tempo trascorso in scivolata
    slideDX:0, slideDY:0,
    /* L1.2 — la direzione della scivolata l'ha scelta un DITO, quindi
       lanciaScivolata non la deve rifare sul pallone. Vale per una
       scivolata sola e si spegne da se': la scrive startSlide, la legge
       e la cancella lanciaScivolata. */
    slideMirata:false,
    recover:0,                         // a terra dopo la scivolata
    kickCd:0,                          // cooldown tocco palla
    /* L1.2 — secondi residui della finestra del CONTRASTO IN PIEDI: il
       piede resta teso dopo la pressione, cosi' si preme mentre si
       arriva sull'uomo e non quando ci si e' gia' arrivati. E' una
       durata della SIMULAZIONE (scende di dt in updatePlayerFisica,
       accanto a kickCd), mai dell'orologio degli eventi: Legge 1. */
    contrasto:0,`,
},

/* 2 — il contrasto in piedi, la spazzata, e il nuovo doSlide */
{
  nome: '2/12 doSlide: la pressione diventa contrasto in piedi, il rilascio scivolata mirata',
  cerca:
`/* --- scivolata --- */
function doSlide(t){
  const p=ctrlPlayer(t);
  if(!p) return;
  let [mx,my]=humanMove(t);
  if(!mx&&!my){ mx=p.fx; my=p.fy; }
  const l=Math.max(0.001,len(mx,my));
  startSlide(p, mx/l, my/l);
}`,
  metti:
`/* =====================================================================
   L1.2 — IL DISCO DIFENSIVO. Tre verbi in fila su un dito solo.

     PRESSIONE  contrasto in piedi, subito, e NESSUN corpo a terra;
     TENUTA     contenimento (vedi updatePlayerFisica);
     RILASCIO   niente — a meno che il dito abbia trascinato.

   PERCHE' IN FILA E NON IN ALTERNATIVA. Distinguere il colpetto dalla
   tenuta vuol dire mettere una soglia sulla DURATA, e una soglia sulla
   durata su un telefono in affanno misura il telefono: a CPU rallentata
   sei volte, 23 colpetti su 24 vengono letti come tenute, e l'errore va
   tutto da una parte (Legge 1). Qui non c'e' niente da distinguere:
   entrambi i verbi accadono, nell'ordine in cui il calcio li mette. Un
   telefono lento non produce il verbo sbagliato perche' non c'e' un
   verbo sbagliato da produrre.
   ===================================================================== */
const CONTRASTO_FIN = 0.18;   // s: quanto resta teso il piede dopo la pressione
const CONTRASTO_K   = 1.8;    // stealP moltiplicato, quando si e' faccia a faccia
const CONTRASTO_CD  = 0.22;   // s di pausa quando il contrasto fallisce
const JOCKEY_V      = 0.62;   // fattore di velocita' di chi contiene
/* la spazzata parte alla stessa velocita' con cui la scivolata gia'
   spazza un pallone libero (checkSlideContact): e' lo stesso gesto,
   fatto in piedi invece che per terra, e non merita un numero suo */
const SPAZZ_V       = 380;

/* il portatore AVVERSARIO, o null. Una domanda sola, scritta una volta,
   perche' la fanno in due: il contrasto (chi provo a spogliare) e il
   contenimento (chi guardo). */
function portatoreAvverso(p){
  const b=G.ball;
  if(b.owner<0) return null;
  const o=G.players[b.owner];
  return (o && o.team!==p.team && o.out<=0) ? o : null;
}
/* il proprio terzo. La squadra 0 difende x=0 (opGoalX = team===0 ? FW : 0
   dice che attacca a destra), la squadra 1 difende x=FW. */
function nelProprioTerzo(p){
  return p.team===0 ? p.x < FW/3 : p.x > FW*2/3;
}

/* =====================================================================
   UN PASSO DI CONTRASTO IN PIEDI — e la spazzata, che e' lo stesso
   gesto su un pallone che non e' di nessuno.

   IL RAGGIO E' KICK_R, e non e' un numero nuovo: si contrasta dove si
   calcia. Il furto col corpo che il gioco ha gia' (updateBall) arriva a
   P_R+B_R+1 = 22 unita' ed e' passivo — succede se gli corri addosso.
   Il piede teso arriva a 26. Quelle quattro unita', piu' il x1,8 di
   fronte, sono precisamente cio' che il dito compra.

   LE PROBABILITA' SONO QUELLE DEL FURTO COL CORPO, non altre: base 0,42,
   x0,55 quando si insegue da dietro (le due facce concordi). Il x1,8
   faccia a faccia e' l'unica cosa nuova, ed e' del progetto (§4).
   Due modi di togliere il pallone allo stesso avversario non possono
   avere due tarature diverse.

   IL SORTEGGIO SI CONSUMA PER ULTIMO. Tutte le guardie — pausa,
   distanza, di chi e' il pallone — stanno prima del Math.random: una
   partita in cui nessuno preme non tira un dado in piu', e nessun banco
   a seme fisso si sfasa per il solo fatto che questa funzione esista.

   NON SI CHIAMA anticipa(): un contrasto in piedi che si prepara e'
   proprio la cosa che questa voce toglie di mezzo. Alla pressione il
   piede e' gia' fuori.
   ===================================================================== */
function contrastoPasso(p){
  if(p.kickCd>0) return 'freddo';
  const b=G.ball;
  if(len(b.x-p.x, b.y-p.y)>KICK_R) return 'lontano';
  if(b.owner<0){
    /* SPAZZATA — contesto puro, zero ingressi nuovi: pallone di nessuno
       a portata di piede, e sei nel tuo terzo. La direzione non ha un
       numero da tarare: e' il vettore che va DALLA PROPRIA PORTA al
       pallone, quindi lungo e largo insieme, che e' l'unica cosa che si
       chiede a una spazzata. Fuori dal proprio terzo non e' una
       spazzata: e' un pallone da giocare, e il disco non lo butta via. */
    if(!nelProprioTerzo(p)) return 'niente';
    const gx = p.team===0 ? 0 : FW;
    let nx=b.x-gx, ny=b.y-FH/2;
    let l=len(nx,ny);
    if(l<1){ nx = p.team===0 ? 1 : -1; ny=0; l=1; }
    kickBall(p, nx/l, ny/l, SPAZZ_V, 0);
    return 'spazzata';
  }
  const o=G.players[b.owner];
  if(!o || o.team===p.team || o.out>0) return 'nostro';
  let sp=0.42;
  /* la stessa quantita' che updateBall legge per l'inseguimento da
     dietro, letta anche dall'altra parte: concordi (>0,5) vuol dire che
     gli stai correndo dietro e rubi molto meno; opposte (<0) vuol dire
     che gli sei davanti, ed e' li' che il contrasto vale. */
  const faccia=p.fx*o.fx + p.fy*o.fy;
  if(faccia>0.5) sp*=0.55;
  else if(faccia<0) sp*=CONTRASTO_K;
  if(Math.random()>=sp){ p.kickCd=CONTRASTO_CD; return 'fallito'; }
  b.owner=G.players.indexOf(p); b.passTo=-1;
  p.kickCd=0.35; o.kickCd=0.5;         // gli stessi due numeri del furto col corpo
  segnaTocco(G.players.indexOf(p));
  Audio5.beep(320);
  return 'preso';
}

/* --- scivolata --- */
/* LA FASE DICE CHI STA CHIAMANDO, e senza fase questa funzione e'
   identica a ieri riga per riga: il tasto Z della tastiera continua a
   scivolare come ha sempre fatto, mira sul pallone compresa. Cambia il
   DISCO, che e' l'oggetto di cui parla L1.2.
     (nessuna fase)  tastiera: la scivolata di sempre
     'premi'         il dito si posa sul disco: CONTRASTO IN PIEDI
     'scivola'       il dito si alza DOPO aver trascinato: scivolata
                     mirata, con la direzione del trascinamento */
function doSlide(t, fase, L){
  const p=ctrlPlayer(t);
  if(!p) return;
  if(fase==='premi'){
    /* un corpo a terra, espulso o gia' impegnato non contrasta: sono le
       stesse condizioni che puoContrastare chiede alla scivolata, meno
       la carica — una carica di tiro aperta non impedisce di stendere il
       piede, e non c'e' niente da chiudere perche' qui non si prepara
       nessun gesto. */
    if(p.out>0 || p.slide>=0 || p.recover>0 || p.rove>=0) return;
    p.contrasto=CONTRASTO_FIN;
    contrastoPasso(p);
    return;
  }
  if(fase==='scivola'){
    /* SI ARRIVA QUI SOLO CON UN TRASCINAMENTO ARMATO. Chi chiama
       (Touch5.chiudi) ha gia' escluso l'annullo di sistema e l'atto
       morto: qui non si decide piu' niente, si esegue. */
    if(!L) return;
    startSlide(p, L.ux, L.uy, true);
    return;
  }
  let [mx,my]=humanMove(t);
  if(!mx&&!my){ mx=p.fx; my=p.fy; }
  const l=Math.max(0.001,len(mx,my));
  startSlide(p, mx/l, my/l);
}`,
},

/* 3 — startSlide impara a ricordare chi ha mirato */
{
  nome: '3/12 startSlide: la mira del dito si ricorda',
  cerca:
`function startSlide(p, nx, ny){
  /* La guardia che c'era qui non comprendeva quella di anticipa (uomo
     espulso, in rovesciata), e chargeDX/chargeDY si scrivevano anche
     quando nessuna preparazione si apriva — una scrittura che nessuno
     leggeva, perche' lanciaScivolata gira solo se l'anticipo e' nato.
     puoContrastare porta dentro tutte e due le guardie e prende un
     GIOCATORE, non una squadra, perche' questa funzione la chiama anche
     l'IA con un uomo che non e' il controllato. */
  if(!puoContrastare(p)) return;`,
  metti:
`/* L1.2 — «mirata» vuol dire: la direzione l'ha scelta un DITO, e non va
   rifatta sul pallone al momento del lancio. La chiede solo il rilascio
   del disco difensivo; l'IA e la tastiera chiamano con tre argomenti,
   come sempre, e per loro non cambia niente. */
function startSlide(p, nx, ny, mirata){
  /* La guardia che c'era qui non comprendeva quella di anticipa (uomo
     espulso, in rovesciata), e chargeDX/chargeDY si scrivevano anche
     quando nessuna preparazione si apriva — una scrittura che nessuno
     leggeva, perche' lanciaScivolata gira solo se l'anticipo e' nato.
     puoContrastare porta dentro tutte e due le guardie e prende un
     GIOCATORE, non una squadra, perche' questa funzione la chiama anche
     l'IA con un uomo che non e' il controllato. */
  if(!puoContrastare(p)) return;
  /* si spegne QUI e non altrove: cosi' una scivolata che non e' nata
     (anticipa rifiuta) non lascia la bandiera accesa addosso a quella
     dopo, che sarebbe una mira di un altro gesto. */
  p.slideMirata=false;`,
},

/* 4 — e la scrive solo se l'anticipo e' nato davvero */
{
  nome: '4/12 startSlide: la bandiera si accende solo se l\'anticipo nasce',
  cerca:
`  const umano = !G.cpu[p.team] && G.ctrl[p.team]===G.players.indexOf(p);
  p.chargeDX=nx; p.chargeDY=ny;
  anticipa(p, 'scivolata', umano?SLIDE_CAR_U:SLIDE_CAR, lanciaScivolata);
}`,
  metti:
`  const umano = !G.cpu[p.team] && G.ctrl[p.team]===G.players.indexOf(p);
  p.chargeDX=nx; p.chargeDY=ny;
  if(anticipa(p, 'scivolata', umano?SLIDE_CAR_U:SLIDE_CAR, lanciaScivolata)) p.slideMirata=!!mirata;
}`,
},

/* 5 — lanciaScivolata rispetta il dito */
{
  nome: '5/12 lanciaScivolata: la mira del dito non si rifa\' sul pallone',
  cerca:
`  const bx=b.x+b.vx*0.06-p.x, by=b.y+b.vy*0.06-p.y, bl=len(bx,by);
  if(bl>1 && bl<200){ nx=bx/bl; ny=by/bl; }
  p.slide=0; p.slideDX=nx; p.slideDY=ny;`,
  metti:
`  const bx=b.x+b.vx*0.06-p.x, by=b.y+b.vy*0.06-p.y, bl=len(bx,by);
  /* L1.2 — LA CORREZIONE AUTOMATICA SALTA SE HA MIRATO UN DITO.
     Il ricalcolo qui sopra esiste perche' fra la decisione e il lancio
     il pallone si e' mosso, e vale per l'IA e per la tastiera, che
     mirano il pallone e basta. Il trascinamento no: quello e' una
     direzione VOLUTA su 360 gradi, e correggerla verso il pallone
     vorrebbe dire che il dito non comanda. Misurato prima della toppa
     (strumenti/_q-l12.js, prova D): con la correzione sempre accesa
     l'errore fra il trascinamento e la direzione vera del corpo ha
     mediana 90 gradi su otto direzioni.
     Il costo, dichiarato: una scivolata mirata male adesso manca il
     pallone davvero, invece di essere raddrizzata di nascosto. */
  if(!p.slideMirata && bl>1 && bl<200){ nx=bx/bl; ny=by/bl; }
  p.slideMirata=false;
  p.slide=0; p.slideDX=nx; p.slideDY=ny;`,
},

/* 6 — la pressione sul disco */
{
  nome: '6/12 Touch5.start: la pressione sul disco difensivo e\' il contrasto',
  cerca:
`        else if(bt.act==='slide') doSlide(t);`,
  metti:
`        /* L1.2 — la pressione fa il CONTRASTO IN PIEDI, non la
           scivolata: nessun corpo a terra puo' nascere da un dito che
           si posa. La scivolata vive sul trascinamento (Touch5.chiudi). */
        else if(bt.act==='slide') doSlide(t,'premi');`,
},

/* 7 — il rilascio del disco difensivo */
{
  nome: '7/12 Touch5.chiudi: il rilascio scivola SOLO se il dito ha trascinato',
  cerca:
`      const a=this.atti[id];
      delete this.atti[id];
      if(bt.act==='shot'){
        if(a && !a.carica){ /* la carica non e' di questo dito: non si tocca */ }
        else if(annulla || (a && a.morto)){ if(a) this.chiudiCarica(a.carica); else this.annullaCarica(bt.t); }
        else if(!G.paused) releaseCharge(bt.t);
      }
      return;`,
  metti:
`      const a=this.atti[id];
      /* =================================================================
         L1.2 — LA LETTURA DEL TRASCINAMENTO SI PRENDE PRIMA CHE L'ATTO
         SPARISCA, e non e' pignoleria: Touch5.trascina cerca l'atto per
         identificativo dentro this.atti, e dopo la riga «delete» qui
         sotto quell'identificativo non esiste piu' — la lettura
         tornerebbe null e nessuna scivolata partirebbe MAI. E' successo:
         prima corsa della prova D del cancello, 0 scivolate su 8, con
         tutto il resto verde. Un difetto che nessuna delle altre prove
         poteva vedere, perche' tutte le altre pretendono che NON succeda
         niente.
         Le quattro condizioni sono tutte necessarie, e ognuna chiude una
         via per cui un corpo finirebbe a terra senza che nessuno
         l'avesse chiesto:
           · NON un annullo di sistema. touchcancel non e' touchend, ed
             e' la Legge 4: una notifica che si prende il dito non puo'
             far commettere un fallo. Misurato prima della toppa: dieci
             annulli su dieci scivolavano, e nove facevano fallo.
           · NON un atto morto. Chi ha trascinato oltre R_ANNULLA se n'e'
             andato dal pulsante: ha gia' detto di no.
           · NON a gioco fermo, come per il tiro qui sotto.
           · e soprattutto ARMATO (si controlla piu' sotto): sotto
             R_ARMA non c'e' nessun trascinamento, quindi non c'e' niente
             da eseguire, quindi non succede NIENTE.
         La lettura e' quella FINALE — il campione anteriore di 60 ms al
         distacco — perche' negli ultimi 60 ms il polpastrello rotola
         verso la punta e sposterebbe la direzione di 6-18 px in un verso
         fisso, proprio nell'istante della decisione.
         ================================================================= */
      const tras = (bt.act==='slide' && !annulla && a && !a.morto && !G.paused)
                   ? this.trascina(id,true) : null;
      delete this.atti[id];
      if(bt.act==='shot'){
        if(a && !a.carica){ /* la carica non e' di questo dito: non si tocca */ }
        else if(annulla || (a && a.morto)){ if(a) this.chiudiCarica(a.carica); else this.annullaCarica(bt.t); }
        else if(!G.paused) releaseCharge(bt.t);
      }
      /* =================================================================
         L1.2 — LA SCIVOLATA E' UN TRASCINAMENTO; IL RILASCIO E' SOLTANTO
         IL SUO ISTANTE.
         Qui resta una sola domanda, perche' le altre tre le ha gia'
         fatte la lettura qui sopra: il trascinamento e' ARMATO?
         Smettere di contenere e' gratis, e il DISFARE non ha bisogno di
         una riga — se il dito e' rientrato sotto R_ARMA, «armato» e'
         falso e da qui non esce niente.
         ================================================================= */
      else if(bt.act==='slide'){
        if(tras && tras.armato) doSlide(bt.t,'scivola',tras);
      }
      return;`,
},

/* 8 — la domanda del contenimento */
{
  nome: '8/12 Touch5.contiene: c\'e\' un dito che tiene il disco difensivo?',
  cerca:
`  /* chiude una carica di tiro SENZA calciare, su un GIOCATORE indicato,
     invece che su «quello comandato adesso». Gemella di annullaCarica,`,
  metti:
`  /* =====================================================================
     L1.2 — IL CONTENIMENTO E' UNA DOMANDA, NON UNA BANDIERA.

     «C'e' un dito, di questa squadra, che sta tenendo il disco
     difensivo?» si risponde guardando gli atti vivi, e non c'e' nessuno
     stato da accendere alla pressione e da spegnere al rilascio. Vale
     doppio: uno stato acceso a mano sopravvive a un touchcancel
     dimenticato, a un ri-armo, a un azzeramento da secondo piano — e
     lascerebbe un giocatore contenuto per sempre. Qui non puo'
     succedere, perche' quando l'atto smette di esistere la risposta
     cambia da sola.

     E si spegne anche quando il DISCO cambia verbo sotto il dito: il
     ri-armo di L1.1 riscrive a.act, quindi avvicinandosi al pallone —
     dove il disco offre TIRA — il contenimento finisce. E' la distanza
     a cui si contiene, non un difetto: da li' in dentro il verbo e' un
     altro.
     ===================================================================== */
  contiene(t){
    for(const id in this.atti){
      const a=this.atti[id];
      if(a.t===t && a.act==='slide' && !a.morto && this.btnTouch[id]) return true;
    }
    return false;
  },

  /* chiude una carica di tiro SENZA calciare, su un GIOCATORE indicato,
     invece che su «quello comandato adesso». Gemella di annullaCarica,`,
},

/* 9 — la finestra scorre accanto al cooldown */
{
  nome: '9/12 updatePlayerFisica: la finestra del contrasto scorre sull\'orologio della simulazione',
  cerca:
`  p.kickCd=Math.max(0,p.kickCd-dt);`,
  metti:
`  p.kickCd=Math.max(0,p.kickCd-dt);
  /* L1.2 — LA FINESTRA DEL CONTRASTO IN PIEDI. Sta QUI, accanto a
     kickCd, perche' qui c'e' l'unico orologio che la Legge 1 ammette
     sotto una decisione: dt, il passo fisso della simulazione. E sta
     PRIMA dei rami della rovesciata, della scivolata e della rialzata,
     cosi' un piede teso mentre ti stendono scade lo stesso invece di
     restare aperto ad aspettarti in piedi. */
  if(p.contrasto>0) p.contrasto=Math.max(0,p.contrasto-dt);`,
},

/* 10 — il contrasto che matura, il contenimento, e la faccia */
{
  nome: '10/12 updatePlayerFisica: il contrasto matura, si contiene e si guarda il portatore',
  cerca:
`  const pi=G.players.indexOf(p);
  const isCpuTeam = G.cpu[p.team];
  const isHuman = !isCpuTeam && G.ctrl[p.team]===pi;
  let ix=0, iy=0;`,
  metti:
`  /* =====================================================================
     L1.2 — IL CONTRASTO CHE MATURA MENTRE ARRIVI.
     Sta DOPO le uscite anticipate qui sopra (espulso, rovesciata,
     scivolata, rialzata) apposta: chi e' per terra non contrasta.
     E sta PRIMA che il pallone si aggiorni (updateBall gira dopo tutti i
     giocatori), quindi in qualunque modo finisca scrive p.kickCd e il
     furto col corpo di updateBall — che pretende kickCd<=0 — non puo'
     sparare nello stesso fotogramma. Un gesto, un sorteggio.
     ===================================================================== */
  if(p.contrasto>0) contrastoPasso(p);

  const pi=G.players.indexOf(p);
  const isCpuTeam = G.cpu[p.team];
  const isHuman = !isCpuTeam && G.ctrl[p.team]===pi;
  /* =====================================================================
     L1.2 — IL CONTENIMENTO (jockey). Il dito resta giu' sul disco
     difensivo: il corpo rallenta e tiene la faccia sul portatore.
     Rallenta perche' chi contiene non si butta — sposta il peso, non lo
     impegna — e il fattore e' quello del progetto (§4).
     La domanda la fa Touch5, che sa quali dita sono giu'; qui si legge
     e basta. Costa un giro su al massimo due atti, e solo per l'uomo
     comandato di una squadra umana: a mani libere non esiste.
     NOTA: il concetto vive gia' nel gioco per la CPU (p.contieni piu'
     D.standoff, in aiDecide), ma li' e' una POSIZIONE da tenere, decisa
     dall'IA. Per una persona la posizione la decide il pollice sinistro:
     prendergliela per «contenere meglio» vorrebbe dire togliere il
     comando proprio nel momento in cui serve. Qui il contenimento tocca
     solo le due cose che il pollice non dice — quanto vai forte e dove
     guardi — e p.contieni/standoff restano affare della CPU.
     ===================================================================== */
  const contieni = isHuman && Touch5.contiene(p.team);
  const portato = contieni ? portatoreAvverso(p) : null;
  let ix=0, iy=0;`,
},

/* 11 — la velocita' di chi contiene */
{
  nome: '11/12 updatePlayerFisica: chi contiene va piu\' piano',
  cerca:
`  /* carica del tiro: ci si muove piano */
  const slow = p.charge>=0 ? 0.45 : 1;`,
  metti:
`  /* carica del tiro: ci si muove piano.
     E chi CONTIENE pure (L1.2): non e' una punizione, e' la postura —
     si sposta il peso senza impegnarlo, che e' l'unico modo di non farsi
     saltare. La carica batte il contenimento perche' e' piu' lenta: fra
     due rallentamenti vince quello che impegna di piu' il corpo. */
  const slow = p.charge>=0 ? 0.45 : (contieni ? JOCKEY_V : 1);`,
},

/* 12 — la faccia di chi contiene */
{
  nome: '12/12 updatePlayerFisica: chi contiene guarda il portatore',
  cerca:
`    let tfx=0, tfy=0;
    if(ix||iy){ const l=len(ix,iy); tfx=ix/l; tfy=iy/l; }
    else { const v=len(p.vx,p.vy); if(v>18){ tfx=p.vx/v; tfy=p.vy/v; } }`,
  metti:
`    let tfx=0, tfy=0;
    /* L1.2 — CHI CONTIENE GUARDA IL PORTATORE, non dove sta correndo.
       E' il gesto: si scivola di lato tenendogli gli occhi addosso.
       Passa dallo stesso inseguimento d'angolo di tutti gli altri (0,07
       s), quindi la testa non scatta: gira. Se il portatore sparisce —
       passaggio, pallone perso — questa riga non trova niente e il corpo
       torna a guardare dove va, senza un ramo in piu'. */
    if(portato){ const dx=portato.x-p.x, dy=portato.y-p.y, dl=len(dx,dy); if(dl>1){ tfx=dx/dl; tfy=dy/dl; } }
    if(!tfx && !tfy){
      if(ix||iy){ const l=len(ix,iy); tfx=ix/l; tfy=iy/l; }
      else { const v=len(p.vx,p.vy); if(v>18){ tfx=p.vx/v; tfy=p.vy/v; } }
    }`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-l12.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.l12.html';
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
/* un controllo DOPO la sostituzione: le funzioni nuove devono esistere
   una volta sola e i loro chiamanti devono essere quelli previsti. Serve
   a scoprire subito una sostituzione che e' andata a segno nel posto
   sbagliato, che un conteggio PRIMA non puo' vedere. */
const attesi = [
  ['function contrastoPasso(', 1], ['function portatoreAvverso(', 1],
  ['function nelProprioTerzo(', 1], ['function doSlide(t, fase, L){', 1],
  ['function startSlide(p, nx, ny, mirata){', 1],
  ['contrastoPasso(p)', 3],            // la definizione, la pressione, la finestra che matura
  ['doSlide(t,\'premi\')', 1], ['doSlide(bt.t,\'scivola\',tras)', 1], ['const tras = (bt.act===\'slide\'', 1],
  ['doSlide(t);', 1],                  // e la tastiera, che resta com'era
  ['Touch5.contiene(p.team)', 1], ['contiene(t){', 1],
  ['p.slideMirata', 4], ['p.contrasto', 5],
  ['JOCKEY_V', 2], ['CONTRASTO_FIN', 2], ['CONTRASTO_K', 2], ['CONTRASTO_CD', 2],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => `${s} atteso ${n}, trovato ${out.split(s).length - 1}`);
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log(`OK  ${ANCORE.length} ancoraggi applicati`);
console.log(`    da   ${inFile}  (${src.length} byte)`);
console.log(`    a    ${outFile}  (${out.length} byte, ${out.length - src.length >= 0 ? '+' : ''}${out.length - src.length})`);
