/* =====================================================================
   _t-conti-del-duello.js — IL DISCHETTO ENTRA IN CONTABILITA'
   (31 agosto 2026, voce di lavoro #80).

   TRE CONTI CHE NON TORNAVANO, dal censimento del manuale:

   1. Un duello segnato non incrementava mai «Nello specchio»
      (G.stats.inPorta chiede ball.tiroT, che il duello non imposta):
      la riga «Precisione» del tabellino veniva DILUITA da ogni
      punizione e da ogni rigore — il tiro contava (stopPower), lo
      specchio no. Un gol e' nello specchio per definizione; una parata
      anche. Solo il «fuori» resta fuori.

   2. Una parata del duello non esisteva: ne' per G.stats.parate, ne'
      per la riga del tabellino, ne' per la crescita del portiere
      (faiCrescereRosa legge le parate). Il portiere che para un rigore
      cresceva quanto uno che ha dormito.

   3. Il MARCATORE della punizione poteva non essere chi ha tirato:
      addGoal accredita l'ultimo toccatore del registro tocchi (di
      solito chi ha subito il fallo), mentre la targa in scena dice
      «TIRA <il rigorista>». Tabellino, «Gol decisivo» e gol personali
      potevano finire a un uomo diverso da quello mostrato. Adesso il
      tocco del rigorista si segna PRIMA di addGoal: chi tira, segna.

   DOVE: nel blocco di chiusura dell'esito (resultT>2.0), che gira una
   volta — con un chiavistello (s.contato) per non contare mai doppio.
   Il rigorista lo dice duelloUomini(), la stessa funzione della targa:
   una sola verita' per scena e tabellino.

   LEGGE DEI SORTEGGI: nessun dado() nuovo — solo contatori e un tocco
   segnato. Il duello non appartiene ai percorsi a seme fisso.

   Prova: duello segnato -> inPorta +1 e marcatore = rigorista della
   targa; duello parato -> inPorta +1 e parate del portiere +1;
   duello fuori -> nessuno dei due.

   uso:  node strumenti/_t-conti-del-duello.js --out fuori/conti.html
         node strumenti/_t-conti-del-duello.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/conti.html'));

const ANCORE = [

/* 1 — il chiavistello nasce chiuso a ogni duello */
{
  nome: '1/3 il chiavistello in Duel.start',
  cerca:
`    this.aimU=0; this.aimV=0.50; this.dito=-1; this.mira=false; this.mirato=false;`,
  metti:
`    this.aimU=0; this.aimV=0.50; this.dito=-1; this.mira=false; this.mirato=false;
    this.contato=false;   /* i conti dell'esito si fanno UNA volta (#80) */`,
},

/* 2 — i conti, nel blocco di chiusura che gira una volta */
{
  nome: '2/3 specchio e parate del duello',
  cerca:
`      if(s.resultT>2.0){
        s.shown=false;
        hide(ui.duel);`,
  metti:
`      if(s.resultT>2.0){
        s.shown=false;
        hide(ui.duel);
        /* IL DISCHETTO ENTRA IN CONTABILITA' (31 agosto 2026, #80).
           stopPower conta gia' il tiro; qui si conta il resto: un gol
           e' nello specchio per definizione, una parata anche — e la
           parata e' del portiere, per il tabellino e per la sua
           crescita. Solo il «fuori» resta fuori dallo specchio. Il
           chiavistello evita ogni doppio conto. */
        if(!s.contato){
          s.contato=true;
          if(s.outcome!=='fuori') G.stats.inPorta[s.shooter]=(G.stats.inPorta[s.shooter]||0)+1;
          if(s.outcome==='parata') G.stats.parate[s.keeper]++;
        }`,
},

/* 3 — chi tira, segna: il tocco del rigorista prima di addGoal */
{
  nome: '3/3 il marcatore e\' il rigorista',
  cerca:
`          b.vy = 0; b.z=0; b.vz=0;
          addGoal(s.shooter);`,
  metti:
`          b.vy = 0; b.z=0; b.vz=0;
          /* CHI TIRA, SEGNA (31 agosto 2026, #80): addGoal accredita
             l'ultimo toccatore, che qui era chi aveva SUBITO il fallo.
             Il rigorista lo dice duelloUomini() — la stessa verita'
             della targa TIRA in scena — e il suo tocco si segna qui. */
          { const u=duelloUomini(); if(u && u.tir) segnaTocco(G.players.indexOf(u.tir)); }
          addGoal(s.shooter);`,
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
  ['this.contato=false;', 1],
  ['if(!s.contato){', 1],
  ["if(s.outcome!=='fuori') G.stats.inPorta[s.shooter]", 1],
  ["if(s.outcome==='parata') G.stats.parate[s.keeper]++;", 1],
  ['segnaTocco(G.players.indexOf(u.tir));', 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
