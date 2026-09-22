/* =====================================================================
   _crit-sigillo-timbro.js — IL SIGILLO CHE E' UN TIMBRO
   (voce #134, compito 2). Il falso che condanna la prova C2 di
   `_q-sigillo.js`.

   CHE COSA FALSIFICA: a fine replay il gioco sigilla sempre TORNA,
   qualunque punteggio sia uscito. E' il gemello del `_crit-giudice-cieco`
   della voce #133 — un giudice che dice sempre di si' non e' un giudice,
   e' un timbro — portato dalla parte della SCHERMATA, dove il timbro fa
   un danno diverso ma non minore: chi difende vede «torna» sotto una
   partita che non e' mai successa, e smette di guardare.

   E' IL CASO PEGGIORE: il ramo che difende gli innocenti resta intatto,
   quindi su uno schermo diverso il falso dice ancora NON VERIFICABILE e
   passa C3 e C4b. La lista parla, quindi passa B1, B2 e B3. Cade su C2 —
   il punteggio dichiarato gonfiato di un gol — e su C4a, dove il
   verdetto della schermata e quello del giudice si separano.

   L'ESITO ATTESO: ROSSO su C2, VERDE su C1, C3, C4b e su tutto il
   gruppo B.

   uso:  node strumenti/_crit-sigillo-timbro.js
         node strumenti/_q-sigillo.js --gioco fuori/gioco-sigillo-timbro.html
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = path.resolve(RADICE, arg('out', 'fuori/gioco-sigillo-timbro.html'));

const A = `          Sfida.sigilla(g.id, torna ? 'TORNA' : 'NON TORNA', '');`;
const B = `          Sfida.sigilla(g.id, 'TORNA', '');`;

const src = fs.readFileSync(inFile, 'utf8');
const n = src.split(A).length - 1;
if (n !== 1) { console.error('FALLITO: ancora trovata ' + n + ' volte invece di 1'); process.exit(1); }
const out = src.replace(A, B);
const attesi = [
  ['if(!g.giudicabile){', 1],       /* il ramo che difende gli innocenti resta */
  ["torna ? 'TORNA' : 'NON TORNA'", 0],   /* il confronto e' sparito: e' un timbro */
  ["parola:'NON TORNA'", 2],              /* la riga sa ancora dirlo, se lo dice il server */
  ['<span class="sfsig', 1],
];
const rotti = attesi.filter(([s, k]) => (out.split(s).length - 1) !== k)
  .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  il timbro e\' pronto: a fine replay il sigillo dice sempre TORNA');
console.log('    a    ' + outFile + '  (' + out.length + ' byte, ' + (out.length - src.length) + ')');
console.log('    prova:  node strumenti/_q-sigillo.js --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/'));
console.log('    ATTESO: ROSSO su C2 (e C4a), VERDE su C1, C3, C4b e sul gruppo B');
