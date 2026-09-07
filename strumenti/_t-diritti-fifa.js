/* =====================================================================
   _t-diritti-fifa.js — LA PAROLA CHE NON PUO' STARE NEMMENO IN UN
   COMMENTO (voce #86, compito 7, 7 settembre 2026).

   IL PERCHE'. La batteria completa del compito 7 (`node strumenti/tutti.js
   --solo ...`) ha trovato `diritti` ROSSO: 3 occorrenze della parola
   "FIFA" dentro CALCETTO-il-gioco.html, tutte in commenti scritti nei
   compiti 4 e 5 di questa stessa voce (righe 3842, 3887, 27821 di oggi,
   commit 8bb50de e 79e3c4c) per citare la fonte della misura ufficiale
   (FIFA Futsal Laws of the Game, vedi _analisi/MISURE-UFFICIALI.md A2).
   La regola R1 di strumenti/diritti.js vieta il termine OVUNQUE nel
   file, "anche nei commenti" (agente7.md §5): un rosso vero, non un
   banco tarato su una vernice vecchia — nato dal lavoro di questa voce,
   va curato in questa voce prima di dichiararla chiusa.

   LA CURA non tocca alcun numero e nessun comportamento: sostituisce il
   nome del regolamento con una perifrasi che dice la stessa fonte senza
   il marchio (IFAB e UISP restano: non sono nella lista R1). La fonte
   vera resta scritta per intero in _analisi/MISURE-UFFICIALI.md, che non
   e' il file distribuito e non ha questo vincolo.

   LEGGE DEI SORTEGGI: zero chiamate a dado() qui, e il cambio e' solo
   testo di commento — nessun byte eseguibile si sposta, quindi
   determinismo e due-versioni restano quello che erano prima di questo
   attrezzo (verificato dopo: stessi verdetti di _q-determinismo/_c3).

   uso:  node strumenti/_t-diritti-fifa.js --out fuori/diritti-fifa.html
         node strumenti/_t-diritti-fifa.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/diritti-fifa.html'));

const ANCORE = [

{
  nome: '1/3 il tetto della porta (commento TAGLIE, compito 5)',
  cerca:
`   committente il 6 settembre 2026 (FIFA Futsal 3 m, UISP 5,5 m, IFAB`,
  metti:
`   committente il 6 settembre 2026 (regolamento futsal 3 m, UISP 5,5 m, IFAB`,
},
{
  nome: '2/3 il commento della tavola VERNICI (compito 4)',
  cerca:
`   le misure vere di FIFA Futsal/UISP/IFAB, non piu' i valori storici`,
  metti:
`   le misure vere di regolamento futsal/UISP/IFAB, non piu' i valori storici`,
},
{
  nome: '3/3 il secondo dischetto del pennello (compito 4)',
  cerca:
`  /* SECONDO DISCHETTO (SOLO 5, FIFA Futsal Laws/A2: 10 m): un punto`,
  metti:
`  /* SECONDO DISCHETTO (SOLO 5, regolamento futsal/A2: 10 m): un punto`,
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
const conta = (testo, s) => testo.split(s).length - 1;
const attesi = [
  ['regolamento futsal 3 m, UISP', 1],
  ['regolamento futsal/UISP/IFAB', 1],
  ['regolamento futsal/A2: 10 m', 1],
];
const rotti = attesi.filter(([s, n]) => (conta(out, s) - conta(src, s)) !== n)
  .map(([s, n]) => s + ' atteso +' + n + ', trovato +' + (conta(out, s) - conta(src, s)));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }
if (conta(out, 'FIFA') !== 0) { console.error('FALLITO: "FIFA" sopravvive nel file (' + conta(out, 'FIFA') + ' volte).'); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati, zero "FIFA" residue');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
