/* =====================================================================
   _t-seme.js — IL CASO DIVENTA RIPETIBILE (27 agosto 2026).

   PERCHE' ESISTE. Il gioco e' gia' deterministico — misurato oggi con
   strumenti/_q-determinismo.js, sei controlli su sei, 123 campioni per
   partita (posizione di ogni uomo, del pallone, punteggio, cronometro),
   e passa anche fra DUE PAGINE diverse. Ma lo e' solo sul BANCO, perche'
   e' il banco a sostituire Math.random con un generatore seminato. Nel
   gioco vero il caso viene dal browser, e due telefoni non vedranno mai
   la stessa partita.

   Questa toppa sposta quel determinismo dentro il gioco. Da qui in poi
   il caso passa da una porta sola — dado() — e quella porta si puo'
   seminare. Senza questo pezzo NON esistono:
     · la sfida asincrona (due telefoni, stessa partita, avversario che
       dorme);
     · il replay (una partita in quattro kB invece che in un video);
     · la verifica di un risultato (rigiocarlo e vedere se torna);
     · il tempo reale in lockstep (sulla rete passano i comandi, non lo
       stato di ventidue uomini sessanta volte al secondo).

   LA REGOLA CHE TIENE IN PIEDI TUTTI I BANCHI, e va letta prima di
   toccare questa toppa. dado() chiama Math.random() QUANDO NON E'
   SEMINATO. Non e' pigrizia: e' cio' che tiene identici i venti banchi a
   seme fisso del progetto, che funzionano sostituendo Math.random dalla
   pagina. Il conto dei sorteggi non cambia, l'ordine non cambia, il
   valore restituito non cambia — cambia solo di quante funzioni e'
   passato prima di arrivare a destinazione. La prova sta qui sotto, ed
   e' la sola cosa che questa toppa deve dimostrare.

   LA MISURA, cento partite a semi fissi, gioco prima e gioco dopo:
     node strumenti/_eventi.js --taglia 11 --partite 100 --seme 20260803
   I due esiti devono essere IDENTICI riga per riga. Se non lo sono, la
   toppa e' sbagliata e va buttata: non c'e' nessun compromesso da
   accettare qui, perche' un banco che si sfasa rende ciechi tutti gli
   altri.

   COSA FA, in due mosse:
     1. Sostituisce le 84 chiamate a Math.random() con dado(). Sono
        TUTTE, e non e' una scelta stilistica: se ne restasse una, la
        partita seminata divergerebbe da quella rigiocata proprio sul
        sorteggio piu' difficile da trovare. La sostituzione e' globale
        e non ancorata, perche' 84 ancoraggi puntuali si romperebbero
        alla prima toppa che tocca una di quelle righe.
     2. Apre la porta: SEME.accendi(n) / SEME.spegni(), e il contatore
        SEME.n — che serve a chi un giorno dovra' capire DOVE due
        esecuzioni hanno smesso di essere la stessa partita.

   COSA NON FA. Non registra i comandi (e' _t-registro.js), non parla con
   la rete, non cambia una virgola del gioco quando il seme e' spento.
   Il gioco offline resta identico al bit.

   uso:  node strumenti/_t-seme.js --out fuori/seme.html
         node strumenti/_t-seme.js --dentro
         node strumenti/_t-seme.js --elenco
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;

/* =====================================================================
   MOSSA 1 — la sostituzione globale.

   Si salta quel che sta dentro un commento a blocco: tre occorrenze di
   Math.random() vivono nei commenti che raccontano cure vecchie, e
   riscriverle vorrebbe dire falsificare il racconto di come stavano le
   cose allora.
   ===================================================================== */
function sostituisci(src) {
  /* le fasce di commento, calcolate una volta */
  const fasce = [];
  const re = /\/\*[\s\S]*?\*\//g;
  let m;
  while ((m = re.exec(src))) fasce.push([m.index, m.index + m[0].length]);
  const inCommento = i => fasce.some(([a, b]) => i >= a && i < b);

  let out = '', ultimo = 0, fatte = 0, saltate = 0;
  const re2 = /Math\.random\(\)/g;
  while ((m = re2.exec(src))) {
    if (inCommento(m.index)) { saltate++; continue; }
    out += src.slice(ultimo, m.index) + 'dado()';
    ultimo = m.index + m[0].length;
    fatte++;
  }
  out += src.slice(ultimo);
  return { out, fatte, saltate };
}

/* =====================================================================
   MOSSA 2 — la porta.

   xorshift32, e la scelta non e' per la qualita' statistica: e' per il
   fatto che sta in quattro righe, non ha stato nascosto, e da' lo stesso
   numero su qualunque telefono. Un Mersenne Twister sarebbe piu' bello e
   avrebbe 624 parole di stato da serializzare in un replay che deve
   pesare quattro kB.

   Il contatore n serve a una cosa sola e importante: quando un replay
   non torna, dice a QUALE sorteggio le due esecuzioni si sono divise. E'
   la differenza fra «diverge» e «diverge al sorteggio 41.207».
   ===================================================================== */
const PORTA =
`/* =====================================================================
   IL CASO PASSA DA UNA PORTA SOLA (27 agosto 2026).

   Tutto il caso del gioco — 84 sorteggi, dal rimbalzo del pallone al
   colore di un ciuffo d'erba — passa di qui. Serve al multigiocatore, e
   serve in un modo che vale la pena scrivere per esteso.

   Il gioco e' deterministico: misurato, sei controlli su sei, la stessa
   partita giocata due volte con lo stesso seme da' le stesse 123
   impronte (strumenti/_q-determinismo.js). Quindi due telefoni che
   partono dallo stesso seme e ricevono gli stessi comandi vedono la
   STESSA partita, e sulla rete non serve mandare dove sono ventidue
   uomini sessanta volte al secondo: bastano i comandi, che sono
   qualche byte. Da qui vengono la sfida asincrona (l'avversario non deve
   essere sveglio), il replay in quattro kB, e la verifica di un
   risultato — che si fa rigiocandolo.

   QUANDO IL SEME E' SPENTO, dado() E' Math.random(). Non e' una
   scorciatoia: e' la riga che tiene identici i venti banchi di prova del
   progetto, che seminano il caso sostituendo Math.random dalla pagina.
   Il conto dei sorteggi, il loro ordine e i valori restituiti restano
   quelli di prima — cambia soltanto da quante funzioni passano. Chi
   tocca questa riga rimisuri _eventi.js su cento partite prima e dopo:
   se un solo numero si sposta, la modifica e' sbagliata.
   ===================================================================== */
const SEME = {
  on: false, s: 1, n: 0,
  accendi(v){ this.s = (v>>>0) || 1; this.on = true; this.n = 0; },
  spegni(){ this.on = false; },
};
function dado(){
  if(!SEME.on) return Math.random();
  SEME.n++;
  let s = SEME.s;
  s ^= s << 13; s >>>= 0;
  s ^= s >>> 17;
  s ^= s <<  5; s >>>= 0;
  SEME.s = s;
  return s / 4294967296;
}
`;

const ANCORE = [

/* 1 — la porta nasce accanto a rnd(a,b), che e' il primo che la usa */
{
  nome: '1/2 la porta del caso, dichiarata prima del primo sorteggio',
  cerca: `const rnd=(a,b)=>a+dado()*(b-a);`,
  metti: PORTA + `const rnd=(a,b)=>a+dado()*(b-a);`,
},

/* 2 — il banco deve poterla aprire, e deve poter LEGGERE il contatore:
       senza, un replay che non torna dice solo «non torna» */
{
  nome: '2/2 __test espone il seme e il contatore dei sorteggi',
  cerca: `window.__test = {
  get state(){ return G.scene; },`,
  metti: `window.__test = {
  get state(){ return G.scene; },
  /* IL SEME — la porta del caso, aperta al banco e alla rete.
     semina(n) rende la partita ripetibile: stesso seme e stessi comandi,
     stessa partita, su qualunque telefono. desemina() torna al caso del
     browser, che e' il modo normale del gioco offline.
     Il contatore dei sorteggi non e' una curiosita': quando due
     esecuzioni della stessa partita divergono, e' il numero che dice
     DOVE si sono divise. */
  semina(n){ SEME.accendi(n); return SEME.s; },
  desemina(){ SEME.spegni(); },
  get seminato(){ return SEME.on; },
  get sorteggi(){ return SEME.n; },`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-seme.js — 1 sostituzione globale + ' + ANCORE.length + ' ancoraggi:');
  console.log('  · 0/2 Math.random() -> dado(), tutte quelle fuori dai commenti');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.seme.html';
outFile = path.resolve(RADICE, outFile);
if (!dentro && outFile === inFile) { console.error('FALLITO: --out coincide con --in.'); process.exit(2); }

const src = fs.readFileSync(inFile, 'utf8');

/* --- mossa 1 --- */
const { out: dopoSost, fatte, saltate } = sostituisci(src);
if (fatte < 60) {
  console.error('FALLITO: solo ' + fatte + ' sostituzioni. Ne erano attese ~84: o la toppa e\' gia\'');
  console.error('         applicata, o il file non e\' quello che credo.');
  process.exit(1);
}

/* --- mossa 2 --- */
let out = dopoSost;
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

/* =====================================================================
   I CONTROLLI DOPO LA SOSTITUZIONE.

   Il piu' importante e' il terzo: fuori dai commenti deve restare UNA
   SOLA Math.random(), quella dentro dado(). Se ne restasse un'altra, la
   partita rigiocata divergerebbe da quella giocata — e divergerebbe
   proprio sul sorteggio piu' difficile da trovare, perche' sarebbe
   l'unico rimasto fuori dalla porta.
   ===================================================================== */
function fuoriDaiCommenti(testo, ago) {
  const fasce = [];
  const re = /\/\*[\s\S]*?\*\//g; let m;
  while ((m = re.exec(testo))) fasce.push([m.index, m.index + m[0].length]);
  let n = 0;
  const re2 = new RegExp(ago.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  while ((m = re2.exec(testo))) if (!fasce.some(([a, b]) => m.index >= a && m.index < b)) n++;
  return n;
}

const restate = fuoriDaiCommenti(out, 'Math.random()');
const attesi = [
  ['function dado(){', 1],
  ['const SEME = {', 1],
  ['  semina(n){ SEME.accendi(n); return SEME.s; },', 1],
  ['const rnd=(a,b)=>a+dado()*(b-a);', 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (restate !== 1) rotti.push('Math.random() fuori dai commenti: atteso 1 (quella dentro dado), trovato ' + restate);

/* La porta deve stare PRIMA del primo sorteggio nel testo. `function
   dado` sarebbe issata comunque, ma `const SEME` no: se un sorteggio
   girasse a livello alto prima di questa riga, il gioco morirebbe
   all'apertura con un errore che nessun banco vedrebbe, perche' i banchi
   partono a pagina caricata. */
const posPorta = out.indexOf('const SEME = {');
const posPrimo = out.indexOf('dado()', out.indexOf('function dado(){') + 200);
if (posPorta < 0 || (posPrimo >= 0 && posPrimo < posPorta))
  rotti.push('la porta del caso non e\' dichiarata prima del primo sorteggio');

if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + fatte + ' sorteggi passati per la porta, ' + saltate + ' lasciati nei commenti');
console.log('    ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
console.log('');
console.log('ADESSO LA PROVA CHE CONTA, e senza questa la toppa non vale:');
console.log('  node strumenti/_eventi.js --taglia 11 --partite 100 --seme 20260803');
console.log('  sul gioco prima e sul gioco dopo. I due esiti devono essere IDENTICI.');
