/* =====================================================================
   _t-nastro-versione.js -- IL NASTRO CONOSCE IL SUO MOTORE (voce #107,
   compito 4). Chiude la voce #96.

   IL PROBLEMA. Le cure dei compiti 1-3 (area vera, retropassaggio,
   vantaggio) cambiano la SIMULAZIONE: gli STESSI comandi, sullo stesso
   seme, possono finire in un punteggio diverso da prima -- per
   costruzione, non per un bug (i due-versioni dei compiti 1-3 lo
   dichiarano DIVERGE per ogni cura). Un nastro registrato PRIMA di
   queste cure, rigiocato oggi via Sfida.guarda, muoverebbe gli STESSI
   comandi su un motore diverso: se il punteggio non torna, chiudiSfida
   (CALCETTO-il-gioco.html, grep S.atteso) incolpa "la squadra di chi ti
   ha attaccato e' cambiata da allora" -- un'accusa INGIUSTA quando la
   causa vera e' il motore, non il profilo cresciuto.

   LA CURA, in quattro punti:
     1. MOTORE_V = 1 (costante nuova, accanto a Reg/SEME): sale di uno
        a ogni ramo che tocca la simulazione. Nasce a 1 con la voce
        #107 (i rami #87 e #107 hanno gia' cambiato il motore: i nastri
        di ieri sono gia' invalidi di fatto, MOTORE_V a 0 direbbe il
        falso).
     2. Reg.serializza() porta MOTORE_V in testa al nastro, in un campo
        NUOVO dopo il marcatore di formato che c'era gia' ('1|...'):
        nessun tipo-riga nuovo, la testa esisteva gia'.
     3. Reg.deserializza(testo) legge quel campo in this.motoreV: se il
        nastro e' vecchio (3 pezzi invece di 4, il campo manca) vale
        VERSIONE 0, mai un errore -- il formato resta retrocompatibile
        alla lettura.
     4. Sfida.guarda(id) confronta Reg.motoreV con MOTORE_V SUBITO dopo
        aver deserializzato, PRIMA di startMatch: se non combaciano,
        chiude con un messaggio a CAUSA VERA ("motore diverso", non
        "profilo cresciuto") e ZERO PENALITA' -- niente partita
        avviata, niente punti, niente classifica, niente invio al
        server (un replay non paga mai, vedi chiudiSfida qualche riga
        sopra): si perde solo il film, come per il caso gia' esistente
        del duello dal dischetto (fermaReplayAlDischetto).

   RETROCOMPATIBILITA'. Un nastro scritto con questo formato NUOVO resta
   deserializzabile (prova A del banco, strumenti/_q-nastro-versione.js
   se esistesse -- qui e' prova A del banco _q-regole.js, tredicesima:
   NASTRO-VERSIONE). Un nastro VECCHIO (senza il campo, 3 pezzi) si
   legge comunque: this.motoreV vale 0 e nessuna eccezione nuova nasce
   da p.length.

   uso:  node strumenti/_t-nastro-versione.js --out fuori/nastro-versione.html
         node strumenti/_t-nastro-versione.js --dentro
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/nastro-versione.html'));

const ANCORE = [

/* 1. LA COSTANTE, accanto a Reg (che sta subito dopo, nello stesso
      commento di intestazione "IL REGISTRO DEI COMANDI"). */
{
  nome: 'costante MOTORE_V, subito prima di Reg',
  cerca:
`suo posto in rilettura — vedi oraGioco().
   ===================================================================== */
const Reg = {`,
  metti:
`suo posto in rilettura — vedi oraGioco().
   ===================================================================== */

/* =====================================================================
   LA VERSIONE DEL MOTORE (voce #107, compito 4, 18 settembre 2026).

   Un numero solo, che sale di uno a ogni ramo che tocca la SIMULAZIONE
   (le regole del gioco -- area, retropassaggio, vantaggio, fisica, IA)
   in un modo che puo' cambiare come una partita FINISCE. Un nastro
   registrato con un motore vecchio, rigiocato su un motore nuovo, puo'
   dare un punteggio diverso non per colpa di chi ha giocato ma perche'
   il gioco stesso e' cambiato sotto ai suoi comandi: il nastro la
   porta con se' (vedi Reg.serializza/deserializza qui sotto), cosi'
   chi rilegge (Sfida.guarda, piu' avanti nel file) sa SUBITO se puo'
   fidarsi, invece di scoprirlo da un punteggio che non torna.

   NASCE A 1 con la voce #107: i rami #87 (rimesse/angoli) e #107
   (area/retropassaggio/vantaggio) hanno gia' cambiato il motore prima
   che questa costante esistesse -- ogni nastro di ieri e' gia' di
   fatto invalido, e nascere a 1 lo dice alla prima occasione utile
   invece di fingere che 0 fosse un motore vero. VERSIONE 0 resta
   riservata ai nastri che non portano nessun campo di versione
   (quelli scritti prima di oggi: vedi Reg.deserializza). */
const MOTORE_V = 1;

const Reg = {`,
},

/* 2. IL CAMPO SUL REGISTRO, dove Reg tiene gia' i suoi stati (this.tasti
      e' il vicino piu' naturale: entrambi si azzerano solo quando si
      legge/scrive un nastro da capo, mai a meta' partita). */
{
  nome: 'Reg.motoreV: il campo che ricorda la versione del nastro appena letto',
  cerca:
`  tasti: [],        /* i codici dei tasti incontrati, per non ripeterli */`,
  metti:
`  tasti: [],        /* i codici dei tasti incontrati, per non ripeterli */
  motoreV: 0,       /* la versione del motore del nastro appena letto (voce #107): 0 se nessun nastro e' mai stato deserializzato, o se l'ultimo non portava il campo */`,
},

/* 3. serializza() scrive MOTORE_V in un campo di testa nuovo, dopo il
      marcatore di formato che c'era gia' ('1'): niente tipo-riga
      nuovo, la testa del formato esisteva gia'. */
{
  nome: 'Reg.serializza(): MOTORE_V in testa, dopo il marcatore di formato',
  cerca:
`  serializza(){
    let s = '1|' + this.tasti.join(',') + '|';`,
  metti:
`  serializza(){
    /* LA VERSIONE DEL MOTORE VIAGGIA IN TESTA (voce #107, compito 4):
       un campo in piu' dopo il marcatore di formato che c'era gia',
       PRIMA dei tasti -- il posto meno invasivo, non un tipo-riga
       nuovo. Il resto del formato (virgole, punti e virgola) resta
       quello di sempre: vedi Reg.deserializza per la lettura
       simmetrica e retrocompatibile. */
    let s = '1|' + MOTORE_V + '|' + this.tasti.join(',') + '|';`,
},

/* 4. deserializza() legge il campo nuovo quando c'e' (4 pezzi), e
      RIPIEGA su versione 0 quando manca (3 pezzi, un nastro di prima
      di oggi) -- mai un errore nuovo, il formato resta leggibile. */
{
  nome: 'Reg.deserializza(): legge MOTORE_V, ripiega su 0 sui nastri vecchi',
  cerca:
`  deserializza(testo){
    const p = String(testo).split('|');
    if(p[0] !== '1') throw new Error('registro di un\\'altra versione');
    this.tasti = p[1] ? p[1].split(',') : [];
    this.righe = [];
    let tPrec = 0, msPrec = 0;
    const ux = new Map(), uy = new Map();
    for(const pezzo of (p[2] || '').split(';')){`,
  metti:
`  deserializza(testo){
    const p = String(testo).split('|');
    if(p[0] !== '1') throw new Error('registro di un\\'altra versione');
    /* LA VERSIONE DEL MOTORE (voce #107, compito 4): un campo di testa
       in piu' rispetto a prima, DOPO il marcatore di formato. Un
       nastro di PRIMA di oggi non lo porta -- si riconosce dalla
       lunghezza (3 pezzi invece di 4) e vale VERSIONE 0, mai un
       errore qui: il formato resta retrocompatibile alla lettura, ed
       e' Sfida.guarda (grep motoreV, piu' avanti nel file) che decide
       se una versione diversa da MOTORE_V basta a non fidarsi del
       replay. */
    let iTasti, iPezzi;
    if(p.length >= 4){ this.motoreV = parseInt(p[1],10) || 0; iTasti = 2; iPezzi = 3; }
    else { this.motoreV = 0; iTasti = 1; iPezzi = 2; }
    this.tasti = p[iTasti] ? p[iTasti].split(',') : [];
    this.righe = [];
    let tPrec = 0, msPrec = 0;
    const ux = new Map(), uy = new Map();
    for(const pezzo of (p[iPezzi] || '').split(';')){`,
},

/* 5. Sfida.guarda(): la versione si controlla SUBITO dopo che il
      nastro si e' aperto, PRIMA di qualunque altra lettura del suo
      contenuto (il controllo del duello dal dischetto compreso) --
      un motore diverso rende inaffidabile OGNI comando del nastro,
      non solo quelli del duello. */
{
  nome: 'Sfida.guarda(): la versione del motore si controlla prima di fidarsi del nastro',
  cerca:
`    if(righe < 0){
      Reg.spegni();
      this.stato('Il nastro di questa partita non si riesce ad aprire: è di una forma che questo gioco non sa leggere.', true);
      return;
    }`,
  metti:
`    if(righe < 0){
      Reg.spegni();
      this.stato('Il nastro di questa partita non si riesce ad aprire: è di una forma che questo gioco non sa leggere.', true);
      return;
    }
    /* =====================================================================
       IL MOTORE CAMBIA, E IL NASTRO LO SA (voce #107, compito 4, chiude
       la voce #96).

       Reg.deserializza ha appena letto Reg.motoreV dalla testa del
       nastro: 0 se il nastro non porta nessuna versione (di prima
       della voce #107), altrimenti il numero che chi ha giocato aveva
       quando ha registrato. Le cure dei compiti 1-3 (area vera,
       retropassaggio, vantaggio) cambiano la SIMULAZIONE: se la
       versione non combacia con MOTORE_V di questo telefono, gli
       STESSI comandi possono muovere la partita in un modo diverso da
       come si mosse allora -- un punteggio che non torna non sarebbe
       colpa della rosa cresciuta di chi ha attaccato, sarebbe colpa
       del motore cambiato sotto ai comandi. CHIUDERE QUI, PRIMA di
       startMatch, e' l'accusa GIUSTA al posto di quella sbagliata:
       lasciata correre, la partita rigiocata finirebbe comunque, e
       piu' sotto in chiudiSfida (grep S.atteso) il controllo di fine
       partita direbbe "la squadra di chi ti ha attaccato e' cambiata
       da allora" -- vero in alcuni casi, ma non in questo.
       ZERO PENALITA': come il caso gia' esistente del duello dal
       dischetto qui sopra (fermaReplayAlDischetto), non si avvia
       nessuna partita, non si tocca nessun punto, non si manda niente
       al server (un replay non paga mai comunque, vedi chiudiSfida) --
       si perde solo il film, il risultato resta quello scritto nella
       lista. */
    if(Reg.motoreV !== MOTORE_V){
      Reg.spegni();
      this.vistoQui[id|0] = 1;
      this.stato('Questa partita è stata giocata con un\\'altra versione del motore: rigiocarla oggi darebbe un\\'altra partita, non quella che hai subito davvero. Il risultato resta quello scritto qui sotto.', true);
      this.dipingi();
      return;
    }`,
},

/* 6. UN GETTER SOLO PER IL BANCO (come registroModo/registroRighe qui
      accanto): espone Reg.motoreV senza aggiungere nessun comportamento
      -- serve alla prova NASTRO-VERSIONE (strumenti/_q-regole.js) per
      controllare la versione letta senza doverla dedurre dal solo
      testo del messaggio. */
{
  nome: '__test.registroMotoreV: il getter di prova, accanto a registroRighe',
  cerca:
`  get registroRighe(){ return Reg.righe.length; },`,
  metti:
`  get registroRighe(){ return Reg.righe.length; },
  get registroMotoreV(){ return Reg.motoreV; },   /* solo lettura, per il banco (voce #107) */`,
},

];

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

/* CONTEGGI A DELTA. */
const conta = (testo, s) => testo.split(s).length - 1;
const rotti = [];
if (conta(out, 'const MOTORE_V = 1;') !== 1) rotti.push('MOTORE_V non e\' dichiarata esattamente una volta');
if (conta(out, 'motoreV: 0,') !== 1) rotti.push('Reg.motoreV non e\' inizializzata esattamente una volta');
if (conta(out, "let s = '1|' + MOTORE_V + '|' + this.tasti.join(',') + '|';") !== 1) rotti.push('serializza() non scrive MOTORE_V esattamente una volta');
if (conta(out, 'if(p.length >= 4){ this.motoreV = parseInt(p[1],10) || 0; iTasti = 2; iPezzi = 3; }') !== 1) rotti.push('deserializza() non legge MOTORE_V esattamente una volta');
if (conta(out, 'if(Reg.motoreV !== MOTORE_V){') !== 1) rotti.push('Sfida.guarda() non confronta la versione esattamente una volta');
if (conta(out, 'get registroMotoreV(){ return Reg.motoreV; },') !== 1) rotti.push('__test.registroMotoreV non e\' presente esattamente una volta');
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
