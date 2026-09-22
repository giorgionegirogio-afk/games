/* =====================================================================
   _crit-sigillo-muto.js — LA RIGA CHE NON DICE NIENTE
   (voce #134, compito 2). Il falso che condanna il gruppo B di
   `_q-sigillo.js`.

   CHE COSA FALSIFICA: il gioco legge `verificata`, calcola il sigillo,
   e poi NON LO STAMPA. E' il caso peggiore apposta: `this.sigillo(s)` si
   chiama lo stesso, quindi un banco che si limitasse a chiedere al gioco
   «hai il sigillo?» direbbe di si'. Fra il campo e l'occhio c'e'
   `dipingi`, ed e' quello il pezzo che il gruppo B deve sorvegliare —
   e' la lezione della voce #131, dove una prova passava perche' leggeva
   un contatore invece di guardare lo schermo.

   L'ESITO ATTESO: ROSSO su B1 e su B2 (nessuna parola, quindi nemmeno
   l'accusa dove invece ne serve una), VERDE su B0 e su B3.

   uso:  node strumenti/_crit-sigillo-muto.js
         node strumenti/_q-sigillo.js --gioco fuori/gioco-sigillo-muto.html
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = path.resolve(RADICE, arg('out', 'fuori/gioco-sigillo-muto.html'));

const A = `               '<span class="sfsig ' + sig.tinta + '">' + esc(sig.parola) + '</span></div>' +`;
const B = `               '</div>' +`;

const src = fs.readFileSync(inFile, 'utf8');
const n = src.split(A).length - 1;
if (n !== 1) { console.error('FALLITO: ancora trovata ' + n + ' volte invece di 1'); process.exit(1); }
const out = src.replace(A, B);
const attesi = [['this.sigillo(s)', 1], ['giudicato: {},', 1], ['<span class="sfsig', 0]];
const rotti = attesi.filter(([s, k]) => (out.split(s).length - 1) !== k)
  .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  il gioco muto e\' pronto: il sigillo si calcola e non si stampa');
console.log('    a    ' + outFile + '  (' + out.length + ' byte, ' + (out.length - src.length) + ')');
console.log('    prova:  node strumenti/_q-sigillo.js --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/'));
console.log('    ATTESO: ROSSO su B1 e B2, VERDE su B0 e B3');
