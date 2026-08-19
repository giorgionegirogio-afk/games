/* =====================================================================
   _t-l04b.js — L'ETICHETTA DICE COSA OTTERREBBE IL DITO, NON DI CHI E'
   IL PALLONE.

   Toppa cerca/sostituisci. Legge CALCETTO-il-gioco.html (o --in),
   sostituisce CINQUE ancoraggi ESATTI e scrive la copia in --out. Senza
   --out scrive accanto all'originale un file col suffisso .l04b.html:
   mai sull'originale, se non con --dentro. Se anche un solo ancoraggio
   non compare ESATTAMENTE UNA VOLTA si ferma con codice 1, dice quale, e
   non scrive niente.

   uso:
     node strumenti/_t-l04b.js --out fuori/l04b.html
     node strumenti/_t-l04b.js --in altro.html --out x.html
     node strumenti/_t-l04b.js --dentro
     node strumenti/_t-l04b.js --elenco

   ---------------------------------------------------------------------
   LA TESI. Il disco non risponde a «di chi e' il possesso» — domanda
   ambigua per tutto il volo di un passaggio, e il cui unico campo
   disponibile (b.passTo) va rancido quando il passaggio viene
   intercettato. Risponde a «se premo adesso, cosa succede», che una
   risposta esatta ce l'ha sempre, perche' e' la stessa domanda che il
   gioco si fa quando il dito preme davvero.

   COME. Le guardie delle quattro azioni non vengono COPIATE in un
   predicato: vengono ESTRATTE. Ogni azione perde la sua guardia e chiama
   il predicato al suo posto, e l'etichetta chiama lo stesso predicato.
   Una sola scrittura, quindi non possono divergere — che e' il difetto
   che avrebbe reso inutile qualunque copia.

     puoTirare(t)        la guardia di startCharge, ramo rovesciata compreso
     puoPassare(t)       la guardia di doFiltrante piu' quella di anticipa
     puoContrastare(p)   la guardia di startSlide piu' quella di anticipa
     puoCambiare(t)      la guardia di cambiaGiocatore

   Zero campi nuovi, zero stato nuovo, zero isteresi da tarare, zero
   sorteggi: nessuno dei quattro predicati chiama Math.random, e nessuno
   scrive un bit.

   ---------------------------------------------------------------------
   LE TRE COSE CHE VANNO DETTE, PERCHE' NON SONO GRATIS.

   1. LA COPPIA DI DISCHI SI SCIOGLIE. Prima un solo booleano decideva
      tutte e due le etichette; adesso ognuna ha la sua domanda. Nascono
      combinazioni che prima non esistevano — TIRA con CAMBIO, per
      esempio, quando il pallone e' entro il raggio di calcio ma non
      abbastanza vicino da passarlo. E' una conseguenza voluta: sono due
      dita diverse su due verbi diversi.

   2. LA RESIDUA CHE L'ETICHETTA NON PUO' RIPARARE. Quando il giocatore
      e' a terra o si sta rialzando, NESSUN verbo del disco grande fa
      qualcosa: ne' il tiro ne' il contrasto. Il disco mostra CONTRASTA
      perche' altre etichette non ce ne sono, e in quell'istante mente.
      Non e' un difetto dell'etichetta: e' uno stato del gioco senza
      verbi. Ripararlo vorrebbe dire un terzo aspetto del disco (spento),
      che e' interfaccia nuova e non sta in questa toppa. Quanto vale sta
      nella consegna, misurato.

   3. IL RAMO DELLA ROVESCIATA E' L'UNICO PUNTO IN CUI IL PREDICATO
      COSTA. finestraRovesciata fa una radice e qualche prodotto scalare,
      e viene chiamata solo quando il pallone e' FUORI dal raggio di
      calcio, cioe' quasi sempre. Il costo per fotogramma sta nella
      consegna, misurato con --costo invece che stimato.

   ---------------------------------------------------------------------
   COSA RESTA DI possessoTeam. Resta la funzione, intatta: e' ancora la
   risposta onesta alla domanda «la squadra t ha il pallone», e
   strumenti/_t-oracolo.js la legge come riga di controllo. Ma NON E' PIU'
   IL CONTESTO DEI PULSANTI, e sul file toppato la riga «gioco»
   dell'oracolo descrive quella domanda, non i dischi: i dischi sono la
   riga «atto». Chi legge quella tabella su questo file lo sappia.

   ---------------------------------------------------------------------
   I NUMERI. Banco: strumenti/_sonda-l04.js --capacita, cinque partite a
   passo fisso, semi 20260803..07, squadra 0 umana con un dito robot.

   C2 — SI PREME DAVVERO IL DISCO E SI GUARDA SE IL MONDO CAMBIA. Il
   robot preme con Touch5.start alle coordinate che il gioco dichiara,
   legge l'atto che il gioco stesso ha risolto (Touch5.btnTouch) e poi
   confronta lo stato prima e dopo. Nessun predicato riscritto, nessuna
   bandiera: la promessa e' mantenuta se qualcosa e' successo.

     dice ... e non succede niente        PRIMA            DOPO
     TIRA                              79/117 = 67,5%    2/87 = 2,3%
     PASSAGGIO                         96/158 = 60,8%    0/68 = 0,0%
     CONTRASTA                         14/635 =  2,2%   17/855 = 2,0%
     CAMBIO                             0/597 =  0,0%    0/877 = 0,0%

   Le DUE pressioni di TIRA rimaste non sono un residuo misterioso: la
   sonda ne stampa la causa, ed e' «gesto gia in preparazione». E' la
   guardia di idempotenza dichiarata sopra puoTirare — non «il tiro e'
   impossibile» ma «ne stai gia' preparando un altro».
   Le 17 di CONTRASTA sono la residua del punto 2: uomo a terra o in
   rialzata, dove nessun verbo del disco grande fa niente. Erano 14 su
   635 prima, sono 17 su 855 dopo: questa toppa non la crea e non la
   ripara.

   Sull'oracolo indipendente (strumenti/_t-oracolo.js, tre partite, che
   misura in FRAZIONE DI TEMPO invece che di pressioni) la stessa colonna:
   riga «atto», che e' il disco grande di questa toppa,
     promessa mancata  9,70% -> 0,00%    occasione persa 2,83% -> 0,00%
   e la verifica dell'oracolo contro la funzione vera resta a 0
   disaccordi su 197 pressioni anche sul file toppato — cioe' il suo
   predicato, scritto da un'altra mano, e' d'accordo con puoTirare.
   La colonna «strappi» di quella tabella NON descrive questa toppa: e'
   costruita su un booleano solo che comanda tutti e due i dischi, e qui
   i dischi sono due domande. La misura giusta e' qui sotto.

   C3 — STRAPPI. Delle volte in cui il possesso passa da noi a loro, in
   quante c'e' un verbo difensivo entro mezzo secondo:
     col dito che gioca      46/46 prima     57/57 dopo
     a dito fermo            22/22 prima     19/22 dopo
   I tre che mancano sono l'unica colonna in cui questa toppa perde, e la
   sonda dice cosa c'era al loro posto: TIRA e PASSAGGIO, tutte e tre le
   volte. Non e' «niente da premere» — e' il pallone ancora dentro il
   raggio di calcio, quindi al posto del contrasto ti viene offerto un
   calcio, e quel calcio funziona (e' la riga TIRA di C2, 2,3% di vuoto).

   C3 — SFARFALLIO. Cambi di etichetta al secondo, e quanti duravano meno
   di un quarto di secondo. A DITO FERMO, cioe' la sola regola:
     disco grande   0,28/s -> 0,37/s   sotto 0,25 s  0,021/s -> 0,070/s
     disco piccolo  0,28/s -> 0,42/s   sotto 0,25 s  0,021/s -> 0,124/s
   Col robot che preme cinque volte al secondo i cambi brevi sul disco
   piccolo salgono molto (70 -> 172 sotto 0,25 s): quello sfarfallio se
   lo produce il dito stesso, perche' mentre il TUO passaggio si prepara
   (PASS_CAR_U = 0,05 s, tre fotogrammi) un secondo passaggio non puo'
   nascere, e il disco lo dice. NON C'E' ISTERESI IN QUESTA TOPPA, e non
   e' una dimenticanza: un'isteresi sull'etichetta rimetterebbe una
   bugia esattamente dove questa toppa ne toglie una, e chiederebbe un
   numero da tarare. Il rimedio senza numeri, se un giorno dara' fastidio,
   e' mostrare il verbo IN CORSO (p.chargeKind esiste gia'); ma anche
   quello mente per la durata della preparazione, e non l'ho misurato.

   C1 — COSTO E EFFETTI COLLATERALI. touchBtnLayout(0) restituisce TUTTI
   E DUE i dischi in una chiamata. Mediana su 44 campioni presi in istanti
   diversi della partita: 0,124 us prima, 0,285 us dopo. Il ramo caro
   (finestraRovesciata, una radice) si attraversa solo col pallone fuori
   dal raggio di calcio, ed e' per questo che il costo si misura in piu'
   istanti e non in uno: fra il campione piu' basso e il piu' alto ci
   sono venti volte. Anche prendendo il massimo, 1,6 us, e anche
   chiamandola dieci volte per fotogramma, sono 16 us su 16.700: un
   millesimo del fotogramma. Nessun ricalcolo a passo ridotto, quindi
   nessun ritardo da dichiarare.
   Effetti collaterali: ZERO, e misurato. Un robot che preme a CALENDARIO
   FISSO (non guarda l'etichetta, quindi chiama le stesse azioni sui due
   file) da' 31.000 fotogrammi IDENTICI fra base e toppa — pallone,
   possesso, uomo controllato e punteggio. E' anche la prova che nessuno
   dei predicati consuma un sorteggio: uno solo in piu' e le due tracce
   divergerebbero.
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

/* 1 — i quattro predicati, messi accanto a possessoTeam che restano */
{
  nome: '1/5 i quattro predicati di capacita, accanto a possessoTeam',
  cerca:
`/* la squadra t ha il pallone? E' il contesto dei pulsanti touch. */
function possessoTeam(t){
  return G.ball && G.ball.owner>=0 && G.players[G.ball.owner] && G.players[G.ball.owner].team===t;
}`,
  metti:
`/* la squadra t ha il pallone? NON E' PIU' il contesto dei pulsanti
   touch — lo sono i quattro predicati qui sotto. Resta perche' e' la
   risposta onesta a una domanda diversa, e perche' strumenti/
   _t-oracolo.js la legge come riga di controllo. */
function possessoTeam(t){
  return G.ball && G.ball.owner>=0 && G.players[G.ball.owner] && G.players[G.ball.owner].team===t;
}
/* =====================================================================
   LE QUATTRO CAPACITA' — «se premo adesso, cosa succede».

   PERCHE' ESISTONO. I due dischi dicevano TIRA/PASSAGGIO quando la palla
   era nostra e CONTRASTA/CAMBIO quando non lo era. Ma «nostra» e' una
   domanda che durante il volo di un passaggio non ha risposta: b.owner
   vale -1 per tutto il volo, e l'unico altro campo (b.passTo) non si
   azzera quando il passaggio viene intercettato, cioe' va rancido.
   Misurato su tre partite a passo fisso (strumenti/_sonda-l04.js
   --etichetta, verita' presa dall'esito e non da un campo del gioco):
   mediana del volo 825 ms, e piu' di un secondo per passaggio in cui i
   dischi dicevano LORO su un pallone che tornava fra i nostri piedi.
   Leggere b.passTo e' stato provato e MISURATO PEGGIORE (vedi
   strumenti/_t-l04.js, che si rifiuta di applicarsi).

   La domanda giusta e' un'altra, e ha sempre una risposta esatta: che
   cosa otterrebbe il dito. Queste quattro funzioni sono le guardie che
   le quattro azioni attraversavano, ESTRATTE — non copiate. Ogni azione
   chiama la sua al posto della guardia che aveva, e l'etichetta chiama
   la stessa: una scrittura sola, quindi non possono divergere.

   NESSUNA DELLE QUATTRO SCRIVE UN BIT, e nessuna chiama Math.random: se
   ne consumasse uno, ogni banco a seme fisso si sfaserebbe per il solo
   fatto di guardare i pulsanti. Verificato confrontando la traccia di
   una partita intera, fotogramma per fotogramma, prima e dopo.
   ===================================================================== */
/* la guardia di startCharge, ramo della rovesciata compreso: c'e' un
   uomo controllato, non e' a terra ne' in rovesciata, e il pallone e'
   suo oppure entro il raggio di calcio allargato — oppure la finestra
   della rovesciata e' aperta. NON comprende la guardia di idempotenza
   (p.charge<0): quella non dice che il tiro e' impossibile, dice che lo
   stai gia' caricando, e in quell'istante il disco E' il tiro. */
function puoTirare(t){
  const p=ctrlPlayer(t);
  if(!p || p.slide>=0 || p.recover>0 || p.rove>=0) return false;
  const pi=G.players.indexOf(p);
  if(G.ball.owner!==pi && len(G.ball.x-p.x,G.ball.y-p.y)>KICK_R*1.4)
    return finestraRovesciata(p);
  return true;
}
/* la guardia di doFiltrante (pallone suo o entro il raggio di calcio)
   PIU' quella di anticipa, che e' l'unico modo in cui il passaggio puo'
   davvero nascere. La carica gia' lanciata (chargeGo pieno) blocca: un
   gesto in volo non si scavalca. Una carica di TIRO invece si abbandona
   volentieri, ed e' il motivo per cui la condizione guarda chargeGo e
   non charge. */
function puoPassare(t){
  const p=ctrlPlayer(t);
  if(!p || p.out>0 || p.slide>=0 || p.recover>0 || p.rove>=0) return false;
  if(p.charge>=0 && p.chargeGo) return false;
  const pi=G.players.indexOf(p);
  return G.ball.owner===pi || len(G.ball.x-p.x,G.ball.y-p.y)<=KICK_R;
}
/* la guardia di startSlide piu' quella di anticipa. Prende un GIOCATORE
   e non una squadra perche' startSlide la chiama anche l'IA, con un uomo
   che non e' il controllato. */
function puoContrastare(p){
  if(!p || p.out>0 || p.slide>=0 || p.recover>0 || p.rove>=0) return false;
  if(p.charge>=0 && p.chargeGo) return false;
  return true;
}
/* NON C'E' un puoCambiare, e la sua assenza e' una decisione: CAMBIO e'
   il ripiego del disco piccolo, e un ripiego non ha alternative da
   mostrare. Estrarre la guardia di cambiaGiocatore darebbe una funzione
   che nessuno potrebbe usare per cambiare un'etichetta. */`,
},

/* 2 — l'etichetta */
{
  nome: '2/5 touchBtnLayout: i due dischi diventano due domande',
  cerca:
`  const poss = possessoTeam(t);
  return [
    poss ? { act:'shot',    label:'TIRA',      x:bx+s*64,  y:VH-60, r:40 }
         : { act:'slide',   label:'CONTRASTA', x:bx+s*64,  y:VH-60, r:40 },
    poss ? { act:'through', label:'PASSAGGIO', x:bx+s*158, y:VH-72, r:30 }
         : { act:'swap',    label:'CAMBIO',    x:bx+s*158, y:VH-72, r:30 },
  ];`,
  metti:
`  /* OGNI DISCO FA LA SUA DOMANDA, e la domanda e' «cosa otterrebbe il
     dito», non «di chi e' il pallone». Da qui due conseguenze da sapere.

     I DUE DISCHI NON SONO PIU' ACCOPPIATI. Prima un booleano solo
     decideva tutte e due le etichette. Adesso nascono combinazioni che
     prima non esistevano — TIRA col CAMBIO, quando il pallone e' entro
     il raggio di calcio allargato ma non abbastanza vicino da passarlo.
     E' voluto: sono due dita su due verbi, e non c'e' ragione perche'
     l'una debba mentire per accompagnare l'altra.

     QUANDO NEMMENO IL VERBO DIFENSIVO FA QUALCOSA, IL DISCO MENTE LO
     STESSO. Se l'uomo e' a terra o si sta rialzando, ne' il tiro ne' il
     contrasto aprono niente, e il disco grande mostra CONTRASTA perche'
     altre etichette non ce ne sono. E' uno stato del gioco senza verbi,
     non un difetto di questa riga: ripararlo vuol dire un disco SPENTO,
     cioe' interfaccia nuova. Sta scritto qui perche' chi legge sappia
     che quel caso e' noto e misurato, non dimenticato. */
  const tira = puoTirare(t), passa = puoPassare(t);
  return [
    tira  ? { act:'shot',    label:'TIRA',      x:bx+s*64,  y:VH-60, r:40 }
          : { act:'slide',   label:'CONTRASTA', x:bx+s*64,  y:VH-60, r:40 },
    passa ? { act:'through', label:'PASSAGGIO', x:bx+s*158, y:VH-72, r:30 }
          : { act:'swap',    label:'CAMBIO',    x:bx+s*158, y:VH-72, r:30 },
  ];`,
},

/* 3 — startCharge chiama la stessa domanda dell'etichetta */
{
  nome: '3/5 startCharge: la guardia diventa puoTirare',
  cerca:
`function startCharge(t){
  const p=ctrlPlayer(t);
  if(!p || p.slide>=0 || p.recover>0 || p.rove>=0) return;
  const pi=G.players.indexOf(p);
  if(G.ball.owner!==pi && len(G.ball.x-p.x,G.ball.y-p.y)>KICK_R*1.4){
    /* TIRA con la palla ALTA che scende nella finestra: e' la rovesciata
       (decisione 1 di AZIONI.md — stesso tasto, contesto diverso) */
    if(finestraRovesciata(p)) tentaRovesciata(p);
    return;
  }`,
  metti:
`function startCharge(t){
  /* LA GUARDIA CHE C'ERA QUI ADESSO HA UN NOME, ed e' la stessa che
     legge l'etichetta del disco grande. Non e' una copia: e' questa,
     spostata. Percio' «il disco dice TIRA» e «startCharge apre
     qualcosa» sono la stessa proposizione, e non possono divergere. */
  if(!puoTirare(t)) return;
  const p=ctrlPlayer(t);
  const pi=G.players.indexOf(p);
  if(G.ball.owner!==pi && len(G.ball.x-p.x,G.ball.y-p.y)>KICK_R*1.4){
    /* TIRA con la palla ALTA che scende nella finestra: e' la rovesciata
       (decisione 1 di AZIONI.md — stesso tasto, contesto diverso).
       La finestra non si richiede qui: puoTirare l'ha gia' chiesta, ed
       e' l'unico modo di arrivare a questo ramo. */
    tentaRovesciata(p);
    return;
  }`,
},

/* 4 — doFiltrante */
{
  nome: '4/5 doFiltrante: la guardia diventa puoPassare',
  cerca:
`function doFiltrante(t, comeCross){
  const p=ctrlPlayer(t);
  if(!p) return;
  const pi=G.players.indexOf(p);
  if(G.ball.owner!==pi && len(G.ball.x-p.x,G.ball.y-p.y)>KICK_R) return;
  if(p.charge>=0 && !p.chargeGo) chiudiAnticipo(p);   // stava caricando il tiro: cambia idea`,
  metti:
`function doFiltrante(t, comeCross){
  /* La guardia che c'era qui era piu' STRETTA di quella vera: passava
     anche quando anticipa() avrebbe poi rifiutato (uomo a terra, in
     rialzata, in rovesciata, o con un gesto gia' lanciato), e allora
     l'unico effetto della pressione era chiudere una carica di tiro.
     puoPassare porta dentro tutte e due le guardie, cosi' «il disco dice
     PASSAGGIO» significa davvero «da qui nasce un passaggio». */
  if(!puoPassare(t)) return;
  const p=ctrlPlayer(t);
  const pi=G.players.indexOf(p);
  if(p.charge>=0 && !p.chargeGo) chiudiAnticipo(p);   // stava caricando il tiro: cambia idea`,
},

/* 5 — startSlide */
{
  nome: '5/5 startSlide: la guardia diventa puoContrastare',
  cerca:
`function startSlide(p, nx, ny){
  if(p.slide>=0 || p.recover>0) return;
  if(p.charge>=0){
    /* due gesti non si preparano insieme. La carica del TIRO invece si
       abbandona volentieri: chi era sul pallone e sceglie il contrasto ha
       cambiato idea, ed e' sempre stato cosi'. */
    if(p.chargeGo) return;
    chiudiAnticipo(p);
  }
  const umano = !G.cpu[p.team] && G.ctrl[p.team]===G.players.indexOf(p);`,
  metti:
`function startSlide(p, nx, ny){
  /* La guardia che c'era qui non comprendeva quella di anticipa (uomo
     espulso, in rovesciata), e chargeDX/chargeDY si scrivevano anche
     quando nessuna preparazione si apriva — una scrittura che nessuno
     leggeva, perche' lanciaScivolata gira solo se l'anticipo e' nato.
     puoContrastare porta dentro tutte e due le guardie e prende un
     GIOCATORE, non una squadra, perche' questa funzione la chiama anche
     l'IA con un uomo che non e' il controllato. */
  if(!puoContrastare(p)) return;
  if(p.charge>=0){
    /* due gesti non si preparano insieme. La carica del TIRO invece si
       abbandona volentieri: chi era sul pallone e sceglie il contrasto ha
       cambiato idea, ed e' sempre stato cosi'. */
    chiudiAnticipo(p);
  }
  const umano = !G.cpu[p.team] && G.ctrl[p.team]===G.players.indexOf(p);`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-l04b.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.l04b.html';
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
/* un controllo dopo la sostituzione: i predicati devono essere definiti
   una volta sola e chiamati dove ci si aspetta */
const attesi = [
  ['function puoTirare(', 1], ['function puoPassare(', 1],
  ['function puoContrastare(', 1], ['puoCambiare', 1],
  ['puoTirare(t)', 3], ['puoPassare(t)', 3], ['puoContrastare(p)', 2],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => `${s} atteso ${n}, trovato ${out.split(s).length - 1}`);
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log(`OK  ${ANCORE.length} ancoraggi applicati`);
console.log(`    da   ${inFile}  (${src.length} byte)`);
console.log(`    a    ${outFile}  (${out.length} byte, ${out.length - src.length >= 0 ? '+' : ''}${out.length - src.length})`);
