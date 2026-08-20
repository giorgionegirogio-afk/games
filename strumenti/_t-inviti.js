/* =====================================================================
   _t-inviti.js — GLI INVITI E I TRE PASSI DEL TUTORIAL (voce L3.3 di
   _analisi/agente28.md §5 e §10, onda 3).

   Toppa cerca/sostituisci. Legge CALCETTO-il-gioco.html (o --in),
   sostituisce ANCORAGGI ESATTI e scrive la copia in --out. Senza --out
   scrive accanto all'originale un file col suffisso .inviti.html: mai
   sull'originale, se non con --dentro. Se anche un solo ancoraggio non
   compare ESATTAMENTE UNA VOLTA si ferma con codice 1, dice quale, e non
   scrive niente.

   uso:
     node strumenti/_t-inviti.js --out fuori/inviti.html
     node strumenti/_t-inviti.js --in altro.html --out x.html
     node strumenti/_t-inviti.js --elenco

   ---------------------------------------------------------------------
   IL FATTO. Il tutorial insegnava quattro gesti — levetta, PASSAGGIO,
   TIRA, CONTRASTA — e tutti e quattro hanno oggi un'ETICHETTA sul disco
   o sono manipolazione diretta. Nel frattempo sono entrati tre verbi che
   non hanno nessuna etichetta da nessuna parte, perche' non sono
   pulsanti: sono MODIFICATORI DEL TRASCINAMENTO.

   ---------------------------------------------------------------------
   LA REGOLA CON CUI HO SCELTO I TRE PASSI, ed e' l'unica cosa che questa
   toppa chiede di accettare a parole.

     Un verbo che ha un'ETICHETTA sul disco si scopre leggendo.
     Un verbo che e' MANIPOLAZIONE DIRETTA si scopre toccando.
     Un verbo che e' un MODIFICATORE DEL TRASCINAMENTO non ha etichetta,
     non ha superficie propria, e non si scopre mai.

   Applicata all'inventario di oggi la regola non lascia margini:

     la corsa (levetta)      manipolazione diretta, risponde sotto il
                             dito nel primo secondo.  FUORI — ed e' il
                             progetto stesso a dirlo (§10, L3.3:
                             «il cambio uomo e la corsa si scoprono da
                             soli»).
     il cambio uomo          il disco dice CAMBIO.  FUORI, stessa riga
                             del progetto.
     il passaggio            il disco dice PASSAGGIO.  FUORI.
     il contrasto            il disco dice CONTRASTA.  FUORI.
     ------------------------------------------------------------------
     la TENUTA del tiro      il disco dice TIRA e non dice che si tiene.
                             DENTRO.
     la MIRA del tiro        nessuna superficie: si trascina da un disco
                             che dice un'altra cosa.  DENTRO.
     il RADDOPPIO            idem, sul disco che dice CAMBIO.  DENTRO.

   Sono esattamente tre, e non li ho contati per farli tornare tre: sono
   tre perche' i modificatori del trascinamento entrati oggi sono tre.
   La chiamata (L2.3) non e' nell'elenco per una ragione che non e' di
   gusto: sul file di oggi chiamaGiocatore non la invoca NESSUN ingresso
   umano — l'ingresso e' L1.4, che non e' entrato. Un tutorial non puo'
   insegnare un verbo che il dito non puo' eseguire.

   PERCHE' LA TENUTA E' DAVVERO INVISIBILE, e non solo poco evidente.
   Fino a ieri l'anello del timing era la potenza: prendi la finestra,
   tiri forte. Da oggi (L1.3) l'anello paga in PRECISIONE e la potenza e'
   una rampa continua sulla tenuta. L'anello e' rimasto identico. Quindi
   il gioco mostra un segno che diceva una cosa e adesso ne dice
   un'altra, e non c'e' un pixel che annunci il cambio. Un tap col
   pallone al piede resta un tocco corto (TAP_T = 0,15 s): chi non sa che
   si tiene non tira mai.

   PERCHE' HO TOLTO PASSAGGIO E CONTRASTA, che il progetto (§5) elencava.
   Perche' §5 e' stato scritto prima che i dischi imparassero a dire la
   verita'. Con _t-l04b (entrata) l'etichetta del disco non dice piu' «di
   chi e' il pallone» ma «cosa otterrebbe il dito»: quando il disco dice
   PASSAGGIO, da li' nasce davvero un passaggio, misurato — 60,8% di
   pressioni a vuoto prima, 0,0% dopo. Un'etichetta che non mente E' il
   tutorial di quel verbo, e ripeterla in una fascia costa tempo di
   partita per dire due volte la stessa cosa.

   ---------------------------------------------------------------------
   GLI INVITI. Tre regole, e la terza e' quella che costa codice.

   1. UNA PASTIGLIA PER PARTITA. Non due. Il tetto e' sulla PARTITA, non
      sul verbo: se in novanta secondi il gioco ha gia' parlato una
      volta, tace.
   2. AGGANCIATA ALLA SITUAZIONE, non al cronometro. Ogni invito ha una
      SONDA che conta le OCCASIONI IN CUI QUEL VERBO SAREBBE SERVITO E
      NON E' STATO USATO — tap di tiro per la tenuta, tiri tenuti senza
      trascinamento per la mira, pressioni di CAMBIO senza trascinamento
      con un avversario in possesso per il raddoppio. Sopra la soglia,
      e solo allora, la pastiglia compare.
   3. SI RICORDA, E IL RICORDO SOPRAVVIVE ALLA RICARICA. Due usi del
      verbo e l'invito non torna mai piu': la memoria sta in SAVE.inviti,
      che e' localStorage, whitelistata in loadSave come tutto il resto.
      Piu' un tetto di tre comparse per verbo su tutta la vita del
      salvataggio: chi ignora l'invito tre volte ha risposto, e il gioco
      smette di chiedere.

   I TRE NUMERI DELLE SOGLIE SONO TARATI SU UN CENSIMENTO, e va detto
   subito che cosa quel censimento misura e che cosa no.
   `node strumenti/_q-inviti.js --misura --modo X` fa giocare un robot che
   NON usa mai il verbo e conta le occasioni perse secondo per secondo.
   Misurato il 20 agosto 2026, taglia 5, seme 20260820, 90 secondi:

     tieni      35 occasioni perse in 90 s   (0,39/s)
     mira        4 occasioni perse in 90 s   (0,04/s)
     raddoppio  68 occasioni perse in 90 s   (0,76/s)

   Le soglie messe sopra quei numeri — 5, 3, 10 — fanno comparire la
   pastiglia rispettivamente al secondo 14, 68 e 8 di quella partita.

   QUEL ROBOT NON E' UNA MANO, e il censimento non pretende di esserlo:
   preme il disco appena il disco offre il verbo, cioe' tre volte al
   secondo. Una mano vera tira sei-dieci volte in novanta secondi e preme
   CAMBIO venti-trenta (la stima e' del progetto, §4). Su una mano le
   stesse soglie cadono PIU' TARDI — quanto piu' tardi non l'ho misurato,
   e non lo spaccio. Cio' che il censimento dimostra e' l'unica cosa che
   una macchina puo' dimostrare qui: che le tre soglie vengono
   ATTRAVERSATE dentro una partita, cioe' che non sono codice morto, e
   che nessuna delle tre scatta al primo gesto.

   ---------------------------------------------------------------------
   DOVE STA LA PASTIGLIA, e perche' li' e non altrove.

   Legge 3: la risposta si legge SUL MONDO, mai sotto il dito. La fascia
   bassa (levetta a VH-140, dischi a VH-60 e VH-72) e' del pollice e
   resta del pollice: la pastiglia sta in ALTO, sotto il tabellone, dove
   nessun dito arriva mai. Non e' una scelta di gusto — e' la sola fascia
   dello schermo in cui nessuna delle due mani lavora.

   E si toglie di mezzo come tutto il resto dell'HUD di questa casa: la
   sua alfa E' scartoHUDRett(), la stessa funzione che vela i pulsanti
   quando il pallone ci rotola sopra. Sotto 0,15 il gioco stesso dichiara
   che i pixel sono tornati mondo, e copertura() smette di contarla.
   La geometria si scrive UNA volta (invitoRett) e si legge DUE — il
   dipinto e zoneInterfaccia: e' la lezione della tacca di mira, e vuol
   dire che dichiarazione e pixel non possono divergere.

   ---------------------------------------------------------------------
   IL COSTO IN TEMPO DI PARTITA. Il tetto del tutorial scende da 10 a 9
   secondi (tre passi invece di quattro, tetto per passo invariato a 3 s:
   quel numero non e' mio e non lo tocco). Restano tutte e quattro le
   uscite anticipate gia' scritte — gesto compiuto, primo gol, SALTA,
   fine partita. L'invito aggiunge al massimo INV_DUR secondi UNA volta
   per partita. Le occupazioni vere, misurate al banco, stanno nella
   consegna.

   ---------------------------------------------------------------------
   COSA NON FA QUESTA TOPPA. Non tocca nessun verbo, nessuna fisica,
   nessuna precedenza d'ingresso e nessun disegno del mondo: aggiunge tre
   contatori, una pastiglia in fascia alta e tre righe di testo. Nessuna
   delle righe iniettate pesca un numero casuale — se ne pescasse uno,
   ogni banco a seme fisso si sfaserebbe per il solo fatto di guardare un
   invito.
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

/* 1 — le costanti della memoria, PRIMA di defaultSave/loadSave.
       Devono stare qui e non accanto a Inviti: loadSave gira a :7284 e
       Inviti nasce a :31600, cioe' in zona morta temporale. */
{
  nome: '1/9 le chiavi e le soglie della memoria, sopra il salvataggio',
  cerca:
`const SAVE_KEY='calcetto_save_v4';`,
  metti:
`const SAVE_KEY='calcetto_save_v4';
/* =====================================================================
   L3.3 — LE COSTANTI DEGLI INVITI, e stanno QUI e non accanto a Inviti
   per una ragione di ordine d'esecuzione: loadSave() gira mentre il file
   si carica, l'oggetto Inviti nasce quindicimila righe piu' sotto, e un
   const letto prima della sua riga non e' undefined, e' un errore che
   spegne il gioco. La whitelist del salvataggio deve conoscere le chiavi
   prima che Inviti esista.
   ===================================================================== */
const INV_CHIAVI = ['tieni','mira','raddoppio'];
/* USATO DUE VOLTE = IMPARATO. Uno solo puo' essere un incidente — un
   pollice che scivola di ventidue pixel arma un trascinamento senza che
   nessuno l'abbia voluto. Due volte no. Da li' in avanti l'invito di
   quel verbo non compare mai piu', e il ricordo sta nel salvataggio,
   quindi sopravvive alla ricarica della pagina. */
const INV_IMPARATO = 2;
/* E CHI NON RISPONDE HA RISPOSTO. Tre comparse per verbo su tutta la
   vita del salvataggio, poi silenzio: un invito che torna una quarta
   volta non sta insegnando, sta insistendo. */
const INV_TETTO = 3;`,
},

/* 2 — il campo nel salvataggio di casa */
{
  nome: '2/9 defaultSave: il campo inviti',
  cerca:
`    tutorialDone:false,
    ach:{},`,
  metti:
`    tutorialDone:false,
    /* L3.3 — la memoria degli inviti. u: quante volte il verbo e' stato
       USATO (a INV_IMPARATO l'invito muore per sempre). v: quante volte
       l'invito e' stato MOSTRATO (a INV_TETTO il gioco smette di
       chiedere). Due contatori e non un booleano perche' «imparato» e
       «ignorato» sono due risposte diverse e vanno distinte. */
    inviti:{u:{},v:{}},
    ach:{},`,
},

/* 3 — la rilettura, con la stessa prudenza di tutte le altre chiavi */
{
  nome: '3/9 loadSave: la memoria degli inviti si rilegge whitelistata',
  cerca:
`    if(typeof j.tutorialDone==='boolean') s.tutorialDone=j.tutorialDone;`,
  metti:
`    if(typeof j.tutorialDone==='boolean') s.tutorialDone=j.tutorialDone;
    /* L3.3 — la memoria degli inviti si rilegge come tutto il resto di
       questo blocco: SOLO le chiavi conosciute, SOLO numeri finiti, con
       un tetto. Un salvataggio manomesso non puo' iniettare chiavi nuove
       ne' far crescere un contatore all'infinito. */
    if(j.inviti&&typeof j.inviti==='object'){
      for(const q of ['u','v']){
        const src=j.inviti[q];
        if(!src||typeof src!=='object') continue;
        for(const k of INV_CHIAVI){
          const n=src[k];
          if(typeof n==='number'&&isFinite(n)&&n>0) s.inviti[q][k]=Math.min(99,n|0);
        }
      }
    }`,
},

/* 4 — i tre passi, il tetto, e il salto dei passi che su tastiera non
       esistono */
{
  nome: '4/9 Tut: tre passi al posto di quattro, e il tetto scende a 9 s',
  cerca:
`const Tut={
  active:false, step:0,
  steps:[
    { k:'move',  kb:'Muoviti con <b>W A S D</b>: raggiungi il pallone', tc:'<b>Trascina il dito</b>: lo stick ti fa correre' },
    { k:'pass',  kb:'Premi <b>C</b>: passaggio al compagno pi&ugrave; smarcato', tc:'Premi <b>PASSAGGIO</b>: palla al compagno pi&ugrave; smarcato' },
    { k:'shot',  kb:'Tieni premuto <b>X</b> e rilascia <b>nella finestra</b>: tiro', tc:'Tieni <b>TIRA</b> e lascia sull\\'ambra' },
    { k:'slide', kb:'In difesa premi <b>Z</b>: scivolata (prima met&agrave; = rubata pulita)', tc:'Senza palla: premi <b>CONTRASTA</b>' },
  ],`,
  metti:
`/* =====================================================================
   L3.3 — DA QUATTRO PASSI A TRE, E SONO TRE VERBI DIVERSI.

   I quattro di prima — levetta, PASSAGGIO, TIRA, CONTRASTA — hanno tutti
   una superficie che li annuncia: la levetta risponde sotto il dito nel
   primo secondo, e gli altri tre hanno un'ETICHETTA SUL DISCO che da
   _t-l04b in poi non mente piu' (misurato: pressioni a vuoto su
   PASSAGGIO 60,8% prima, 0,0% dopo). Un'etichetta onesta E' il tutorial
   del suo verbo, e ripeterla in fascia costa tempo di partita per dire
   due volte la stessa cosa. Il progetto lo dice per due di loro (§10,
   L3.3: «il cambio uomo e la corsa si scoprono da soli»); la stessa
   ragione vale per gli altri due.

   Restano dentro i tre verbi che NON HANNO SUPERFICIE: i modificatori
   del trascinamento. Nessuno di loro ha un pulsante, un'etichetta o un
   pixel che li annunci, perche' vivono SOPRA un disco che dice un'altra
   cosa. Sono tre perche' i modificatori entrati oggi sono tre, non
   perche' il conto doveva tornare.

   IL TETTO PER PASSO RESTA 3 SECONDI — non e' un numero mio e non lo
   tocco. Il tetto totale scende da 10 a 9 (TUT_TETTO), che e' 3 x 3: un
   passo in meno, un tetto in meno. Restano tutte le uscite anticipate
   gia' scritte: gesto compiuto, primo gol, SALTA, fine partita.

   IL PASSO CHE SU TASTIERA NON ESISTE SI SALTA. Mira e raddoppio sono
   trascinamenti, e sulla tastiera il trascinamento non c'e': portano
   tocco:true e su tastiera vengono saltati invece di mostrare un testo
   che descrive un gesto impossibile. Il prodotto spedito e' un APK in
   WebView — la tastiera e' la comodita' di chi sviluppa — e questa
   asimmetria e' dichiarata, non subita.
   ===================================================================== */
const TUT_PASSO = 3;      // secondi di GIOCO per passo: era 3, resta 3
const TUT_TETTO = 9;      // tre passi da tre: era 10 su quattro passi
const Tut={
  active:false, step:0,
  steps:[
    { k:'tieni', tocco:false,
      kb:'Tieni premuto <b>X</b>: pi&ugrave; lo tieni, pi&ugrave; forte parte',
      tc:'<b>TIENI</b> il tasto TIRA: pi&ugrave; tieni, pi&ugrave; forte' },
    { k:'mira', tocco:true,
      tc:'Mentre tieni TIRA <b>trascina</b>: miri in porta' },
    { k:'raddoppio', tocco:true,
      tc:'<b>Trascina</b> dal tasto CAMBIO: un compagno pressa' },
  ],`,
},

/* 5 — tick col tetto nuovo, avanza/start/refresh che saltano i passi
       impossibili, e notify che avvisa anche gli inviti */
{
  nome: '5/9 Tut: tick col tetto nuovo, salto dei passi impossibili, notify condiviso',
  cerca:
`  tick(dt){
    if(!this.active) return;
    this.t+=dt; this.tot+=dt;
    if(this.tot>=10){ this.finish(true); return; }
    if(this.t>=3) this.avanza();
  },
  avanza(){
    this.t=0; this.step++;
    /* i passi il cui gesto e' gia' riuscito si saltano: il suggerimento
       di un gesto gia' compiuto e' rumore, non insegnamento */
    while(this.step<this.steps.length && this.fatti[this.steps[this.step].k]) this.step++;
    if(this.step>=this.steps.length) this.finish(false);
    else this.refresh();
  },`,
  metti:
`  tick(dt){
    if(!this.active) return;
    this.t+=dt; this.tot+=dt;
    if(this.tot>=TUT_TETTO){ this.finish(true); return; }
    if(this.t>=TUT_PASSO) this.avanza();
  },
  /* un passo si salta se il gesto e' gia' riuscito OPPURE se su questo
     schema d'ingresso non esiste (i trascinamenti, su tastiera) */
  saltabile(i){
    const s=this.steps[i];
    if(!s) return false;
    if(this.fatti[s.k]) return true;
    return !!s.tocco && !InputPref.touch;
  },
  avanza(){
    this.t=0; this.step++;
    /* i passi il cui gesto e' gia' riuscito si saltano: il suggerimento
       di un gesto gia' compiuto e' rumore, non insegnamento */
    while(this.step<this.steps.length && this.saltabile(this.step)) this.step++;
    if(this.step>=this.steps.length) this.finish(false);
    else this.refresh();
  },`,
},

/* 6 — refresh e notify */
{
  nome: '6/9 Tut: refresh regge il salto, notify avvisa anche gli inviti',
  cerca:
`  refresh(){
    ui.tutStep.innerHTML=this.steps.map((s,i)=>'<i class="'+(i<=this.step?'on':'')+'"></i>').join('');
    ui.tutText.innerHTML=this.steps[this.step][InputPref.touch?'tc':'kb'];
  },
  notify(k){
    if(!this.active) return;
    /* il gesto riuscito si registra SEMPRE, anche fuori dal suo passo:
       cosi' il suggerimento di quel gesto non comparira' mai piu' */
    this.fatti[k]=true;
    if(!this.steps[this.step] || this.steps[this.step].k!==k) return;
    Audio5.beep(760);
    this.avanza();
  },`,
  metti:
`  refresh(){
    /* IL SALTO SI RIFA' ANCHE QUI, e non e' una ripetizione oziosa:
       refresh() la chiamano start() e il cambio di schema d'ingresso
       (:8743 e :31536). Se il dito arriva su una pagina aperta a
       tastiera, il passo corrente puo' essere diventato impossibile da
       un fotogramma all'altro — e viceversa. Senza questo ciclo il
       tutorial mostrerebbe undefined. */
    let g=0;
    while(this.step<this.steps.length && this.saltabile(this.step) && g++<8) this.step++;
    if(this.step>=this.steps.length){ this.finish(false); return; }
    const s=this.steps[this.step];
    const testo = (InputPref.touch ? s.tc : s.kb) || s.tc;
    ui.tutStep.innerHTML=this.steps.map((q,i)=>'<i class="'+(i<=this.step?'on':'')+'"></i>').join('');
    ui.tutText.innerHTML=testo;
  },
  notify(k){
    if(!this.active) return;
    /* il gesto riuscito si registra SEMPRE, anche fuori dal suo passo:
       cosi' il suggerimento di quel gesto non comparira' mai piu' */
    this.fatti[k]=true;
    if(!this.steps[this.step] || this.steps[this.step].k!==k) return;
    Audio5.beep(760);
    this.avanza();
  },`,
},

/* 7 — l'oggetto Inviti, subito sotto Tut */
{
  nome: '7/9 Inviti: la tabella, le sonde, la memoria, la pastiglia',
  cerca:
`$('tutSkip').addEventListener('click', ()=>{ Audio5.unlock(); Tut.finish(true); });`,
  metti:
`$('tutSkip').addEventListener('click', ()=>{ Audio5.unlock(); Tut.finish(true); });

/* =====================================================================
   GLI INVITI — L3.3, seconda meta'.

   COS'E' UN INVITO. Un segno che compare quando il gioco si accorge che
   il giocatore NON sta usando un verbo che gli sarebbe servito, e sparisce
   quando quel verbo viene usato. Non e' un cartello fisso e non e' un
   tutorial obbligatorio: e' una frase sola, agganciata alla SITUAZIONE,
   che il gioco dice una volta e poi si ricorda di aver detto.

   LE TRE REGOLE, in ordine di quanto costano.

   1. UNA PASTIGLIA PER PARTITA. Il tetto e' sulla partita, non sul
      verbo. Novanta secondi sono pochi: se il gioco ha gia' parlato,
      tace fino al fischio.
   2. LA SONDA CONTA LE OCCASIONI PERSE, NON I SECONDI. Nessun invito
      guarda l'orologio. Ognuno ha un contatore che sale quando il verbo
      SAREBBE SERVITO e il dito non l'ha usato — un tap di tiro al posto
      di una tenuta, un tiro tenuto senza trascinamento, una pressione di
      CAMBIO senza trascinamento mentre un avversario porta palla. Sopra
      la soglia, e solo allora, la pastiglia compare. Cosi' l'invito
      insegna quando il verbo serve, non quando il cronometro decide.
   3. SI RICORDA, E IL RICORDO SOPRAVVIVE ALLA RICARICA. Due usi e
      l'invito e' morto per sempre (INV_IMPARATO); tre comparse ignorate
      e il gioco smette di chiedere (INV_TETTO). Tutti e due i contatori
      stanno in SAVE.inviti, cioe' in localStorage, whitelistati in
      loadSave. Un invito che compare due volte dopo che il verbo e'
      stato imparato e' un fastidio, non un aiuto: questa e' la riga di
      codice che lo impedisce.

   DOVE STA, ed e' Legge 3. La fascia bassa e' del pollice — levetta a
   VH-140, dischi a VH-60 e VH-72 — e resta del pollice. La pastiglia sta
   IN ALTO, sotto il tabellone: e' l'unica fascia dello schermo in cui
   nessuna delle due mani lavora, quindi la risposta si legge sul mondo e
   mai sotto il dito. E si vela come tutto l'HUD di questa casa: la sua
   alfa E' scartoHUDRett(), la stessa che toglie di mezzo i pulsanti
   quando il pallone ci rotola sopra.

   NESSUNA RIGA QUI DENTRO PESCA UN NUMERO CASUALE, e nessuna scrive un
   bit della simulazione. Se ne pescasse uno, ogni banco a seme fisso si
   sfaserebbe per il solo fatto di guardare un invito.
   ===================================================================== */
/* QUANTO DURA UNA PASTIGLIA. Secondi di GIOCO, non di orologio: invecchia
   dentro step(), col passo fisso, come il tutorial e il banner (Legge 1).
   Tre secondi e mezzo e' il tempo del banner lungo di questo file, ed e'
   la stessa cosa: una frase corta che si legge e se ne va. */
const INV_DUR = 3.5;
/* la dissolvenza in entrata e in uscita: sotto un quinto di secondo un
   pannello che appare di colpo in fascia alta legge come un difetto */
const INV_FADE = 0.22;
const Inviti={
  /* LA TABELLA. Una riga per verbo. 'soglia' e' il numero di occasioni
     perse che accende l'invito; 'tocco' dice che il verbo non esiste
     sulla tastiera. I testi sono in maiuscolo perche' la pastiglia e'
     una scritta di scena, non un paragrafo. */
  tab:[
    { k:'tieni',     soglia:5, tocco:false,
      testo:'TIENI PREMUTO TIRA: PIU\\' TIENI, PIU\\' FORTE' },
    { k:'mira',      soglia:3, tocco:true,
      testo:'TRASCINA MENTRE TIENI TIRA: MIRI IN PORTA' },
    { k:'raddoppio', soglia:10, tocco:true,
      testo:'TRASCINA DA CAMBIO: UN COMPAGNO VA A PRESSARE' },
  ],
  sonde:{}, vivo:null, spesa:false, muto:false,
  mem(){
    if(!SAVE.inviti) SAVE.inviti={u:{},v:{}};
    if(!SAVE.inviti.u) SAVE.inviti.u={};
    if(!SAVE.inviti.v) SAVE.inviti.v={};
    return SAVE.inviti;
  },
  def(k){ for(const d of this.tab) if(d.k===k) return d; return null; },
  /* il fischio d'inizio azzera le sonde e il gettone della partita, MAI
     la memoria: quella e' la cosa che deve sopravvivere */
  azzeraPartita(){ this.sonde={}; this.vivo=null; this.spesa=false; },
  /* PUO' QUESTO INVITO COMPARIRE ADESSO? Sette rifiuti, e ognuno chiude
     un modo di dare fastidio. */
  candidabile(d){
    if(!d) return false;
    if(this.spesa || this.vivo) return false;            // una per partita
    if(G.cpu[0]) return false;                            // nessuno da istruire
    if(typeof Tut!=='undefined' && Tut.active) return false;  // parla gia' il tutorial
    if(G.scene!=='play' || G.bannerT>0 || G.capT>0) return false;
    if(d.tocco && !InputPref.touch) return false;         // gesto impossibile qui
    const m=this.mem();
    if((m.u[d.k]|0)>=INV_IMPARATO) return false;          // imparato: mai piu'
    if((m.v[d.k]|0)>=INV_TETTO) return false;             // ignorato tre volte: basta
    return true;
  },
  /* IL VERBO E' STATO USATO. Si registra sempre, anche se l'invito non
     era mai comparso e anche se il tutorial e' spento: e' il ricordo che
     impedisce all'invito di tornare in una partita futura. */
  usato(k){
    const m=this.mem();
    const n=(m.u[k]|0);
    if(n<INV_IMPARATO){ m.u[k]=n+1; persistSave(); }
    this.sonde[k]=0;
    /* e la pastiglia di quel verbo sparisce SUBITO: il gesto e' la
       risposta, e continuare a chiederlo dopo la risposta e' rumore */
    if(this.vivo && this.vivo.k===k) this.vivo=null;
  },
  /* UN'OCCASIONE PERSA. La chiamano i tre punti del codice in cui si vede
     che il verbo sarebbe servito e non e' stato usato. */
  occasione(k){
    const d=this.def(k);
    if(!d) return;
    const n=(this.sonde[k]=(this.sonde[k]|0)+1);
    if(n<d.soglia) return;
    if(!this.candidabile(d)) return;
    this.accendi(d);
  },
  accendi(d){
    const m=this.mem();
    m.v[d.k]=(m.v[d.k]|0)+1; persistSave();
    this.spesa=true;
    /* la larghezza si misura UNA volta, all'accensione: il testo non
       cambia piu' e measureText dentro il ciclo caldo sarebbe uno
       spreco per un pannello che vive tre secondi */
    ctx.save(); ctx.font='700 12.5px '+FONT_C;
    const w=Math.ceil(ctx.measureText(d.testo).width); ctx.restore();
    this.vivo={ k:d.k, testo:d.testo, w:w, t:0 };
  },
  /* INVECCHIA COL TEMPO DI GIOCO. Sta dentro step(), col DT fisso: un
     invito contato sui fotogrammi non sarebbe ripetibile al banco, ed e'
     esattamente il difetto che il tutorial ha gia' pagato una volta. */
  passo(dt){
    const v=this.vivo;
    if(!v) return;
    v.t+=dt;
    if(v.t>=INV_DUR || G.scene!=='play') this.vivo=null;
  },
  /* L'ALFA VERA DI QUESTO FOTOGRAMMA: dissolvenza per il tempo, scarto
     per i soggetti. scartoHUDRett satura a 0,10 quando il pannello
     coprirebbe pallone, comandato, porta o portiere — sotto lo 0,15 che
     zoneInterfaccia dichiara come «tornato mondo». */
  alfa(){
    const v=this.vivo;
    if(!v) return 0;
    const r=invitoRett();
    if(!r) return 0;
    const e=Math.min(1, v.t/INV_FADE);
    const u=Math.min(1, Math.max(0, INV_DUR-v.t)/INV_FADE);
    return Math.min(e,u)*scartoHUDRett(r.x0,r.y0,r.x1,r.y1);
  },
  disegna(){
    if(this.muto) return;
    const r=invitoRett();
    if(!r) return;
    const a=this.alfa();
    if(a<=0.02) return;
    const w=r.x1-r.x0, h=r.y1-r.y0;
    ctx.save();
    ctx.globalAlpha=a;
    ardesiaFill(r.x0,r.y0,w,h,null);
    cornice(r.x0,r.y0,w,h,1.5);
    /* l'ambra e' la tinta di cio' che si tocca in tutta questa
       interfaccia: un invito parla di un gesto, quindi e' ambra */
    ctx.font='700 12.5px '+FONT_C;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillStyle=UIM.amb;
    ctx.fillText(this.vivo.testo, r.x0+w/2, r.y0+h/2+0.5);
    ctx.restore();
  },
};
/* LA GEOMETRIA DELLA PASTIGLIA, IN UN POSTO SOLO: la leggono il dipinto
   e zoneInterfaccia — una scrittura, due letture, quindi dichiarazione e
   pixel non possono divergere (la lezione di taccaMira e di _t-l04b).
   La quota e' sotto il tabellone e sopra tutto il resto: Legge 3. */
function invitoRett(){
  const v=Inviti.vivo;
  if(!v) return null;
  const w=Math.min(Math.max(160, v.w+26), Math.max(120, VW-24));
  const h=28;
  const x0=Math.round((VW-w)/2), y0=Math.round(BAR_H+10);
  return { x0:x0, y0:y0, x1:x0+w, y1:y0+h };
}
/* IL VERBO USATO SI DICE UNA VOLTA SOLA A DUE ASCOLTATORI. Il tutorial
   avanza, l'invito muore e il ricordo si scrive: tre effetti, un punto
   di chiamata, quindi non possono divergere. */
function verboUsato(k){
  if(typeof Tut!=='undefined') Tut.notify(k);
  if(typeof Inviti!=='undefined') Inviti.usato(k);
}
function verboMancato(k){
  if(typeof Inviti!=='undefined') Inviti.occasione(k);
}`,
},

/* 8 — i tre agganci: due nel rilascio del tiro, uno nel rilascio del
       disco del cambio */
{
  nome: '8/9 releaseCharge: le sonde della tenuta e della mira',
  cerca:
`  if(lettura===undefined) lettura=letturaTiroViva(t,p);`,
  metti:
`  if(lettura===undefined) lettura=letturaTiroViva(t,p);
  /* =================================================================
     L3.3 — LE DUE SONDE DEL TIRO, e stanno qui perche' qui c'e' tutto
     cio' che serve e non c'e' nient'altro da inventare: 'c' e' la
     tenuta in secondi e 'lettura' e' il trascinamento al distacco,
     tutti e due gia' calcolati due righe sopra per altri motivi.

     LA TENUTA. Sotto TAP_T il rilascio e' un tap: il verbo «tieni» non
     e' stato usato, ed e' un'occasione persa. Sopra, e' stato usato.
     LA MIRA. Si conta solo sui tiri TENUTI — su un tap non c'e' niente
     da mirare, e contarla li' gonfierebbe la sonda con occasioni che
     non erano occasioni. Armato vuol dire trascinamento oltre R_ARMA,
     cioe' l'unico stato in cui la mira esiste (miraTiroF torna null
     sotto la soglia).

     SOLO L'UMANO DELLA SQUADRA 0, e per la mira solo sul TOCCO: su
     tastiera il trascinamento non esiste e una sonda che salisse li'
     accenderebbe un invito che descrive un gesto impossibile.
     ================================================================= */
  if(t===0 && !G.cpu[0]){
    if(c<TAP_T) verboMancato('tieni');
    else{
      verboUsato('tieni');
      if(lettura && lettura.armato) verboUsato('mira');
      else if(InputPref.touch) verboMancato('mira');
    }
  }`,
},

/* 9 — il raddoppio: usato quando parte davvero, mancato quando c'era
       un portatore avversario e il dito non ha trascinato */
{
  nome: '9/9 Touch5.chiudi: la sonda del raddoppio',
  cerca:
`      else if(bt.act==='swap' && !annulla && !G.paused && tr && tr.armato) comandaRaddoppio(bt.t, tr.ux, tr.uy);`,
  metti:
`      else if(bt.act==='swap' && !annulla && !G.paused){
        /* ===============================================================
           L3.3 — LA SONDA DEL RADDOPPIO, ed e' l'unica delle tre che
           legge un ESITO invece di una condizione: comandaRaddoppio
           torna false quando non c'e' nessun portatore avversario da
           raddoppiare, e in quel caso il verbo non e' stato usato — non
           e' stato nemmeno possibile. Si registra come USATO solo se
           l'ordine e' partito davvero.
           L'occasione PERSA si conta all'opposto: il dito ha premuto
           CAMBIO senza trascinare MENTRE un avversario portava palla,
           cioe' esattamente la situazione in cui il raddoppio serviva.
           Con il pallone di nessuno — che in questo gioco e' la maggior
           parte del tempo — non si conta niente: non era un'occasione.
           =============================================================== */
        const b=G.ball;
        const car = (b && b.owner>=0) ? G.players[b.owner] : null;
        if(tr && tr.armato){
          if(comandaRaddoppio(bt.t, tr.ux, tr.uy) && bt.t===0 && !G.cpu[0]) verboUsato('raddoppio');
        }else if(bt.t===0 && !G.cpu[0] && car && car.team!==bt.t){
          verboMancato('raddoppio');
        }
      }`,
},

/* 10 — l'invito invecchia dentro step() */
{
  nome: '10/12 step(): l\'invito invecchia col tempo di gioco',
  cerca:
`  if(typeof Tut!=='undefined' && Tut.active) Tut.tick(dt);`,
  metti:
`  if(typeof Tut!=='undefined' && Tut.active) Tut.tick(dt);
  /* e l'invito invecchia con lo stesso passo fisso, per la stessa
     ragione: un pannello contato sui fotogrammi non e' ripetibile */
  if(typeof Inviti!=='undefined') Inviti.passo(dt);`,
},

/* 11 — il fischio d'inizio azzera le sonde */
{
  nome: '11/12 startMatch: il fischio d\'inizio azzera le sonde, mai la memoria',
  cerca:
`  if(!SAVE.tutorialDone && G.mode===1 && !G.cpu[0]) Tut.start(); else Tut.stop();`,
  metti:
`  if(!SAVE.tutorialDone && G.mode===1 && !G.cpu[0]) Tut.start(); else Tut.stop();
  /* L3.3 — le sonde e il gettone della pastiglia ripartono da zero a
     ogni fischio d'inizio. La MEMORIA no: quella sta nel salvataggio ed
     e' l'unica cosa che deve attraversare le partite e le ricariche. */
  if(typeof Inviti!=='undefined') Inviti.azzeraPartita();`,
},

/* 12 — il dipinto e la dichiarazione */
{
  nome: '12/12 drawHUD dipinge la pastiglia, zoneInterfaccia la dichiara',
  cerca:
`    if(bot!==Tut._bot){ Tut._bot=bot; ui.tut.style.bottom=bot+'px'; }
  }
}`,
  metti:
`    if(bot!==Tut._bot){ Tut._bot=bot; ui.tut.style.bottom=bot+'px'; }
  }
  /* L3.3 — LA PASTIGLIA DELL'INVITO, ultima cosa dell'HUD e quindi sopra
     tutto il resto. Sta in fascia ALTA, sotto il tabellone: la fascia
     bassa e' del pollice (Legge 3) e non la tocca nessun pannello nuovo.
     Si vela da sola quando il pallone, il comandato, la porta o il
     portiere le finiscono sotto: l'alfa E' scartoHUDRett. */
  if(typeof Inviti!=='undefined') Inviti.disegna();
}`,
},

/* 13 — la dichiarazione dentro zoneInterfaccia */
{
  nome: '13/14 zoneInterfaccia: l\'invito si dichiara con la sua alfa vera',
  cerca:
`    /* stick, pulsanti e bussola li tiene gia' TOUCH_ZONE, con la loro
       alfa corrente: si copiano, non si ricalcolano */`,
  metti:
`    /* L3.3 — la pastiglia dell'invito: si dichiara RICALCOLANDO
       invitoRett e Inviti.alfa, cioe' esattamente le due funzioni che la
       dipingono — una scrittura, due letture, quindi dichiarazione e
       pixel non possono divergere. Quando si e' velata sotto 0,15
       copertura() smette di contarla, ed e' giusto: a quell'alfa i pixel
       sono tornati mondo, e la casa lo dichiara gia' cosi' per stick e
       pulsanti. */
    if(typeof Inviti!=='undefined' && Inviti.vivo){
      const iv=invitoRett();
      if(iv) z.push({tipo:'invito', x0:iv.x0, y0:iv.y0, x1:iv.x1, y1:iv.y1,
                     alfa:+Inviti.alfa().toFixed(3)});
    }
    /* stick, pulsanti e bussola li tiene gia' TOUCH_ZONE, con la loro
       alfa corrente: si copiano, non si ricalcolano */`,
},

/* 14 — le chiavi di banco */
{
  nome: '14/14 __test: le tre chiavi di banco degli inviti',
  cerca:
`  G, Duel, Tut,
};`,
  metti:
`  /* =====================================================================
     L3.3 — LE TRE CHIAVI DI BANCO DEGLI INVITI, e vanno lette sapendo
     cosa sono. NESSUNA di queste tre e' un verdetto: il cancello
     _q-inviti.js giudica la comparsa e la posizione della pastiglia
     LEGGENDO I PIXEL della tela, mai questi campi.
       invitoStato   il censimento (--misura): sonde, memoria, gettone.
                     Serve a TARARE le soglie, non a promuovere niente.
       invitoMuto    spegne il DISEGNO della pastiglia e nient'altro:
                     serve a isolarne l'impronta con due fotogrammi
                     gemelli, che e' il modo in cui il cancello scopre
                     dove sta davvero invece di crederci sulla parola.
       invitoProva   accende un invito senza aspettare la sonda. E' un
                     INGRESSO, non una lettura: nessun verdetto sulla
                     comparsa lo usa — le prove A e B fanno giocare il
                     robot e guardano se la pastiglia arriva da sola.
     ===================================================================== */
  get invitoStato(){
    if(typeof Inviti==='undefined') return null;
    const m=Inviti.mem();
    return { sonde:Object.assign({},Inviti.sonde), usi:Object.assign({},m.u),
             viste:Object.assign({},m.v), spesa:!!Inviti.spesa,
             vivo: Inviti.vivo ? { k:Inviti.vivo.k, t:+Inviti.vivo.t.toFixed(3) } : null,
             soglie: Inviti.tab.reduce((o,d)=>{ o[d.k]=d.soglia; return o; },{}) };
  },
  invitoMuto(v){ if(typeof Inviti!=='undefined') Inviti.muto=!!v; return true; },
  invitoProva(k){
    if(typeof Inviti==='undefined') return false;
    const d=Inviti.def(k);
    if(!d || !Inviti.candidabile(d)) return false;
    Inviti.accendi(d); return true;
  },
  /* riporta gli inviti allo stato di SALVATAGGIO VERGINE — gettone
     della partita e memoria — cosi' il banco puo' riaccendere la
     pastiglia decine di volte in istanti diversi senza ricaricare la
     pagina. E' un INGRESSO, e nessun verdetto lo legge. */
  invitoAzzera(){
    if(typeof Inviti==='undefined') return false;
    Inviti.azzeraPartita();
    SAVE.inviti={u:{},v:{}};
    return true;
  },
  G, Duel, Tut,
};`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-inviti.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.inviti.html';
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
    console.error('  · ' + m.nome + ': trovato ' + m.n + ' volte');
    console.error('    testo cercato:\n' + m.a.cerca.split('\n').map(r => '      ' + r).join('\n'));
  }
  process.exit(1);
}
/* un controllo DOPO la sostituzione: le cose nuove devono esserci una
   volta sola e i tre agganci devono essere tre */
const attesi = [
  ['const Inviti={', 1], ['function invitoRett(', 1],
  ['function verboUsato(', 1], ['function verboMancato(', 1],
  ['const INV_CHIAVI', 1], ['const TUT_TETTO', 1],
  ["verboUsato('tieni')", 1], ["verboMancato('tieni')", 1],
  ["verboUsato('mira')", 1], ["verboMancato('mira')", 1],
  ["verboUsato('raddoppio')", 1], ["verboMancato('raddoppio')", 1],
  ['Inviti.disegna()', 1], ['Inviti.passo(dt)', 1], ['Inviti.azzeraPartita()', 2],
  ["tipo:'invito'", 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte, ' + (out.length - src.length >= 0 ? '+' : '') + (out.length - src.length) + ')');
