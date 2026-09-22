/* =====================================================================
   _crit-amici-centrato.js — IL PANNELLO CENTRATO CHE PERDE LA CIMA
   (voce #136, compito 3). Il falso che condanna D4.

   CHE COSA FALSIFICA. Il pannello della sfida di carta torna al
   centraggio verticale, che e' com'era nel gioco spedito e com'e'
   ancora il pannello del cambio telefono: «e' piu' bello al centro».

   E' IL CASO PEGGIORE perche' e' vero: quando la carta ci sta, al
   centro sta meglio. Ma questa carta e' alta 678 px e la piega di un
   telefono in orizzontale e' 412 o 360, e con align-items:center un
   figlio piu' alto del contenitore viene centrato con la CIMA sopra lo
   zero — dove nessuno scorrimento arriva, perche' scrollTop non va
   sotto zero. Misurato (fuori/_sonda-136-pannello.js): top a -65 e a
   -91 prima delle aggiunte, e il titolo a -44.

   Tutto il resto passa: il codice, la classifica, il giro, la piega
   della schermata SFIDA, la rete che non c'e'. Il bottone SEGNA IL
   RISULTATO si vede perfino MEGLIO, perche' il centraggio tira su il
   fondo della carta. Si perde solo quel che spiega che cos'e' questa
   funzione — cioe' tutto il senso di un pannello.

   L'ESITO ATTESO: ROSSO su D4, VERDE su tutto il resto.

   uso:  node strumenti/_crit-amici-centrato.js
         node strumenti/_q-amici.js --solo D --gioco fuori/gioco-amici-centrato.html
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = path.resolve(RADICE, arg('out', 'fuori/gioco-amici-centrato.html'));

const A = `#sfidaCarta{align-items:flex-start}`;
const B = `/* IL FALSO (voce #136, _crit-amici-centrato): «e' piu' bello al
   centro». Lo e', finche' la carta ci sta. */
#sfidaCarta{align-items:center}`;

const src = fs.readFileSync(inFile, 'utf8');
const n = src.split(A).length - 1;
if (n !== 1) { console.error('FALLITO: ancora trovata ' + n + ' volte invece di 1'); process.exit(1); }
const out = src.replace(A, B);
const attesi = [
  ['#sfidaCarta{align-items:center}', 1],
  ['#sfidaCarta{align-items:flex-start}', 0],
  ['id="btnSfCartaSegna"', 1],      /* le aggiunte ci sono ancora tutte */
  ['id="claAmici"', 1],
  ['  dipingiAmici(){', 1],
];
const rotti = attesi.filter(([s, k]) => (out.split(s).length - 1) !== k)
  .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  il pannello torna al centro, e la sua cima torna irraggiungibile');
console.log('    a    ' + outFile + '  (' + out.length + ' caratteri, ' + (out.length - src.length) + ')');
console.log('    prova:  node strumenti/_q-amici.js --solo D --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/'));
console.log('    ATTESO: ROSSO su D4, VERDE su tutto il resto');
