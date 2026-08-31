/* =====================================================================
   _t-cinque-cronometri.js — startMatch AZZERA ANCHE I QUATTRO FRATELLI
   DI recT (31 agosto 2026, voce di lavoro #65).

   LA DIAGNOSI, dal 27 agosto (strumenti/_diag-campi.js): fra una partita
   e la successiva sopravvivono cinque campi che startMatch non azzera —
   possOwner, possT, pulse, crowdSndT, recT. Il quinto ha gia' avuto la
   sua cura (riga «G.rec.length=0; G.recT=0;», col verbale sulla fase in
   virgola mobile che faceva divergere le partite). Gli altri quattro no.

   I PRIMI DUE NON SONO COSMETICI: aiDecide li legge. Dalla seconda
   partita in poi l'intelligenza comincia credendo che qualcuno abbia il
   pallone da mezzo secondo quando il fischio d'inizio deve ancora
   arrivare. Misurato il 27 agosto: due partite identiche per seme,
   comandi e salvataggio divergono al passo 87, e la divergenza nasce
   dentro aiDecide.

   RIMISURATO OGGI CON UNA SONDA DIRETTA, perche' _diag-campi.js diceva
   «nessuna differenza» — ma quel banco fa girare un giro REGISTRATO in
   mezzo ai due che confronta, e Reg.accendi() azzera i campi con la sua
   tura: la diagnostica si ingannava da sola. La sonda diretta (partita,
   1800 passi, startMatch nudo, lettura immediata) dice:
       possT      0,45   sopravvive
       pulse      30,283 sopravvive
       crowdSndT  0,133  sopravvive
       recT       0      azzerato (dalla cura gemella)
   possOwner in quell'istante era -1 per caso (palla libera al momento
   del taglio), ma il meccanismo e' lo stesso dei fratelli.

   LA CURA: quattro azzeramenti accanto a quello di recT, nello stesso
   punto di startMatch. Azzerare non consuma sorteggi, quindi i banchi a
   seme fisso non si sfasano; ma dalla SECONDA partita in poi le
   decisioni dell'intelligenza cambiano (e' il punto della cura), quindi
   le distribuzioni vanno rimisurate:
       node strumenti/_eventi.js --taglia 5 --partite 100 --seme 20260803
       node strumenti/_q-meta.js --tre-taglie

   La tura nel registro (Reg.azzeraComandi) RESTA: e' idempotente, e il
   registro deve poter contare su uno stato pulito anche se un giorno si
   accendesse lontano da startMatch. Il suo verbale viene rettificato in
   chiaro, non riscritto.

   uso:  node strumenti/_t-cinque-cronometri.js --out fuori/cronometri.html
         node strumenti/_t-cinque-cronometri.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/cronometri.html'));

const ANCORE = [

/* 1 — la cura, accanto alla gemella di recT dentro startMatch */
{
  nome: '1/2 i quattro azzeramenti in startMatch',
  cerca:
`  G.rec.length=0; G.recT=0;
  G.netBulge[0]={t:9,y:FH/2,mag:0}; G.netBulge[1]={t:9,y:FH/2,mag:0};`,
  metti:
`  G.rec.length=0; G.recT=0;
  /* I QUATTRO CRONOMETRI FRATELLI DI recT (31 agosto 2026). Stessa
     malattia del verbale qui sopra, altri quattro nomi: possOwner e
     possT (chi ha il pallone e da quanto — aiDecide li LEGGE, e dalla
     seconda partita in poi l'intelligenza partiva credendo il possesso
     della partita prima: divergenza misurata al passo 87, dentro
     aiDecide), pulse (la fase delle pulsazioni di scena) e crowdSndT
     (il cronometro del coro). Misurati sopravvivere a startMatch con
     una sonda diretta il 31 agosto: possT 0,45 · pulse 30,283 ·
     crowdSndT 0,133 ancora vivi subito dopo la chiamata. La tura nel
     registro (Reg.azzeraComandi) resta: idempotente, e il registro ha
     diritto a uno stato pulito anche acceso lontano da qui. Azzerare
     non consuma sorteggi: i banchi a seme fisso non si sfasano. */
  G.possOwner=-1; G.possT=0; G.pulse=0; G.crowdSndT=0;
  G.netBulge[0]={t:9,y:FH/2,mag:0}; G.netBulge[1]={t:9,y:FH/2,mag:0};`,
},

/* 2 — il verbale della tura si rettifica in chiaro, non si riscrive */
{
  nome: '2/2 la rettifica nel verbale della tura',
  cerca:
`       QUESTO E' UN DIFETTO DEL GIOCO, non solo del replay: dalla seconda
       partita in poi l'intelligenza parte con in testa il possesso della
       partita prima. Qui si tura per il registro, che e' dove fa danno
       subito; la correzione dentro startMatch va fatta a parte e
       misurata, perche' cambia il gioco anche per chi non va in rete.
       ===================================================================== */`,
  metti:
`       QUESTO E' UN DIFETTO DEL GIOCO, non solo del replay: dalla seconda
       partita in poi l'intelligenza parte con in testa il possesso della
       partita prima. Qui si tura per il registro, che e' dove fa danno
       subito; la correzione dentro startMatch va fatta a parte e
       misurata, perche' cambia il gioco anche per chi non va in rete.

       FATTA, 31 agosto 2026: startMatch adesso li azzera, accanto alla
       cura gemella di G.recT (cerca «I QUATTRO CRONOMETRI FRATELLI DI
       recT»). Questa tura resta apposta — e' idempotente, e il registro
       deve poter contare su uno stato pulito anche se un giorno si
       accendesse lontano da startMatch.
       ===================================================================== */`,
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
const attesi = [
  ['G.possOwner=-1; G.possT=0; G.pulse=0; G.crowdSndT=0;', 1],
  /* la frase intera «... DI recT» sta su UNA riga solo nella cura; nella
     rettifica va a capo dopo «DI» — si conta il pezzo che non si spezza */
  ['I QUATTRO CRONOMETRI FRATELLI', 2],   // la cura e il richiamo nella rettifica
  // la tura nel registro resta intatta, spaziatura compresa
  ['G.possOwner = -1; G.possT = 0;', 1],
  ['G.pulse = 0; G.crowdSndT = 0; G.recT = 0;', 1],
  // e la cura gemella di recT non si e' mossa
  ['G.rec.length=0; G.recT=0;', 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
