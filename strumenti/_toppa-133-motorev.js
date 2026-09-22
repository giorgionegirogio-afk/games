/* =====================================================================
   _toppa-133-motorev.js — LA MISURA SI SCRIVE ACCANTO AL NUMERO
   (voce #133, compito 4).

   MOTORE_V vale 2. La voce #131 e la voce #132 lo hanno lasciato li'
   dopo averlo MISURATO, e hanno scritto la misura accanto alla costante
   invece che solo nel verbale: chi legge il sorgente deve trovare la
   ragione dove trova il numero. Questa toppa fa la stessa cosa per la
   voce #133.

   uso:  node strumenti/_toppa-133-motorev.js --out fuori/x.html
         node strumenti/_toppa-133-motorev.js --dentro
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const dentro = process.argv.includes('--dentro');
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = dentro ? inFile : path.resolve(RADICE, arg('out', 'fuori/gioco-133-motorev.html'));

const CERCA = `   una partita che ne ha uno esercita piu' motore di una che non ne ha.
   ===================================================================== */
const MOTORE_V = 2;`;

const METTI = `   una partita che ne ha uno esercita piu' motore di una che non ne ha.

   E LA VOCE #133 HA RIMISURATO, perche' ha toccato di nuovo il registro
   (la riga di tipo 10, lo schermo di chi ha giocato) e ha aggiunto il
   GIUDICE — giudica(), il verificatore differito reso chiamabile senza
   schermo.

   La catena che dice ancora di si': un tipo di riga NUOVO (il 10) che un
   nastro vecchio non ha e per cui esegui non ha un ramo; una funzione
   nuova che nessuna partita chiama mai da se'; e due rami «if» nel
   motore che si accendono solo quando Giudizio.attivo e' vero, cioe' mai
   in una partita vera. La sesta ancora — la causa vera al posto di
   quella sbagliata nel cartello di fine replay — e' testo, non
   simulazione.

   MISURATO il 22 settembre 2026 con strumenti/_t-132-motorev.js,
   puntato sul gioco di prima con --prima fuori/gioco-133-base.html
   (main e7aa605): 30 nastri registrati sul gioco di prima e rigiocati
   sul curato, taglia 5, 3600 passi, semi da 20260801, **30 su 30
   identici** — impronta, punteggio e conto dei sorteggi. Zero nulli; uno
   dei trenta passa dal dischetto. Non si e' scritto un
   _t-133-motorev.js: sarebbe stata la copia di un attrezzo di trecento
   righe per cambiare un valore di default, e in questa casa una copia e'
   un posto in piu' dove la stessa ferita si riapre da sola.
   ===================================================================== */
const MOTORE_V = 2;`;

const src = fs.readFileSync(inFile, 'utf8');
const n = src.split(CERCA).length - 1;
if (n !== 1) { console.error('FALLITO: l\'ancora non si trova esattamente una volta (trovata ' + n + ').'); process.exit(1); }
const out = src.replace(CERCA, METTI);
const attesi = [
  ['const MOTORE_V = 2;', 1],
  ['--prima fuori/gioco-133-base.html', 1],
  ['**30 su 30\n   identici**', 2],      /* quella del #132 e quella nuova */
];
const rotti = attesi.filter(([s, k]) => (out.split(s).length - 1) !== k)
  .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  la misura e\' accanto al numero: +' + (out.length - src.length) + ' byte di commento, zero di codice');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
