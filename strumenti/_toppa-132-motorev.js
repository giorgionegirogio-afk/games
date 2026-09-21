/* =====================================================================
   _toppa-132-motorev.js — LA MISURA ACCANTO AL NUMERO
   (voce #132, compito 5). Un'ancora, solo commento.

   MOTORE_V resta 2, e la ragione non e' un'opinione: e' la misura di
   strumenti/_t-132-motorev.js, due versioni, 30 nastri su 30 identici.
   Qui la si scrive accanto alla costante, come la voce #131 ha fatto con
   la sua — cosi' chi arrivera' dopo trova il numero E il modo in cui e'
   stato ottenuto, e sa con quale strumento rimisurarlo.

   uso:  node strumenti/_toppa-132-motorev.js --out fuori/x.html
         node strumenti/_toppa-132-motorev.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/132-motorev.html'));

const ANCORE = [
{
  nome: '1/1 la misura della voce #132 accanto a MOTORE_V',
  cerca:
`   Quindi 2 resta 2, e si rimisura con quello strumento il giorno che
   qualcuno tocchi di nuovo il duello o il registro.
   ===================================================================== */
const MOTORE_V = 2;`,
  metti:
`   Quindi 2 resta 2, e si rimisura con quello strumento il giorno che
   qualcuno tocchi di nuovo il duello o il registro.

   E LA VOCE #132 HA RIMISURATO, perche' ha toccato di nuovo il registro.
   Cinque cure: la mentalita' nel nastro (tipo 8), l'indice di carattere
   in coda al tipo 7, la scala degli attributi di rosa posata alla
   sorgente, il marchio di troncatura (tipo 9) coi suoi due rifiuti, e il
   rumore bianco che non pesca piu' dal dado seminato.

   La catena che dice ancora di si': due tipi di riga NUOVI (8 e 9) che
   un nastro vecchio non ha; un campo in CODA al tipo 7, dove un nastro
   vecchio finisce prima (e allora startMatch ricade su
   caratterePer(G.oppName), cioe' su quel che faceva ieri); una scala che
   su un salvataggio sano e' l'identita' (nuovaRosa nasce in 50..75,
   faiCrescereRosa incrementa di uno e si ferma a 99); e un rumore che
   nel gioco spedito non toccava comunque il flusso seminato, perche' lo
   sblocco dell'audio precede SEME.accendi.

   MISURATO il 21 settembre 2026 con strumenti/_t-132-motorev.js: 30
   nastri registrati sul gioco di prima (main 3deb807) e rigiocati sul
   curato, a taglia 5, 3600 passi, semi da 20260801, **30 su 30
   identici** — impronta, punteggio e conto dei sorteggi. Zero nulli; uno
   dei trenta passa dal dischetto. La differenza col banco del #131 e'
   voluta: li' i semi col duello si scartavano (erano rifiutati a monte
   dal marchio di tipo 5), qui no — dal #131 il duello e' nel nastro, e
   una partita che ne ha uno esercita piu' motore di una che non ne ha.
   ===================================================================== */
const MOTORE_V = 2;`,
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
  ['const MOTORE_V = 2;', 1],
  ['E LA VOCE #132 HA RIMISURATO', 1],
  ['strumenti/_t-132-motorev.js', 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati (solo commento: nessuna riga di codice cambia)');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
