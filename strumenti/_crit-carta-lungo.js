/* =====================================================================
   _crit-carta-lungo.js — IL CODICE CHE NON STA IN UN MESSAGGIO
   (voce #135, compito 2). Il falso che condanna A2 di `_q-carta.js`.

   CHE COSA FALSIFICA. Gli attributi smettono di viaggiare in sette bit
   e viaggiano come si scrivono: tre cifre decimali per numero, un
   simbolo per cifra. E' l'implementazione «naturale» — quella che viene
   in mente per prima a chiunque, ed e' la stessa scelta che si fa
   scrivendo JSON e poi mettendolo in base64. Quaranta attributi da tre
   simboli invece che da un simbolo e mezzo: il codice passa da 79 a 143
   caratteri.

   E' IL CASO PEGGIORE perche' non sbaglia nient'altro: il giro resta
   l'identita' (A1, sono cambiate INSIEME le due funzioni), il controllo
   e' sempre di quattro simboli e cattura come prima (A3), i rifiuti
   dicono le stesse cause (A4), le serrature tengono (A5), l'identita'
   non c'entra (tutto B) e la partita e' la stessa su ogni telefono
   (tutto C).

   Cade su A2, e basta guardare il codice per capire perche': 143
   caratteri entrano ancora in un SMS, ma non sono piu' una cosa che si
   legge, si ricopia o si riconosce a colpo d'occhio — e il tetto di
   questo cantiere e' 100 apposta, con la misura di 79 dichiarata
   accanto.

   L'ESITO ATTESO: ROSSO su A2, VERDE su tutto il resto.

   uso:  node strumenti/_crit-carta-lungo.js
         node strumenti/_q-carta.js --solo A,B,C --gioco fuori/gioco-carta-lungo.html
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = path.resolve(RADICE, arg('out', 'fuori/gioco-carta-lungo.html'));

const coppie = [
  [`  for(const g of rA.concat(rD)){
    met(attrRosa(g && g.vel) & 127, 7);
    met(attrRosa(g && g.tiro) & 127, 7);
    met(attrRosa(g && g.tecnica) & 127, 7);
    met(attrRosa(g && g.tackle) & 127, 7);
  }`,
   `  /* IL FALSO (voce #135, _crit-carta-lungo): gli attributi come si
     scrivono, tre cifre decimali l'uno, un simbolo per cifra. */
  const cifre = v => { const s = String(attrRosa(v)).padStart(3, '0');
                       for(let i=0;i<3;i++) met(s.charCodeAt(i) - 48, 5); };
  for(const g of rA.concat(rD)){
    cifre(g && g.vel); cifre(g && g.tiro); cifre(g && g.tecnica); cifre(g && g.tackle);
  }`],
  [`    for(let i=0;i<n;i++) r.push({ vel:leggi(7), tiro:leggi(7), tecnica:leggi(7), tackle:leggi(7) });`,
   `    const cif = () => (leggi(5)*100 + leggi(5)*10 + leggi(5));
    for(let i=0;i<n;i++) r.push({ vel:cif(), tiro:cif(), tecnica:cif(), tackle:cif() });`],
];

const src = fs.readFileSync(inFile, 'utf8');
const guai = [];
coppie.forEach(([a], i) => {
  const n = src.split(a).length - 1;
  if (n !== 1) guai.push('ancora ' + (i + 1) + ': trovata ' + n + ' volte invece di 1');
});
if (guai.length) { console.error('FALLITO:\n  ' + guai.join('\n  ')); process.exit(1); }
let out = src;
for (const [a, b] of coppie) out = out.replace(a, b);
const attesi = [
  ['const cifre = v =>', 1],
  ['const cif = () =>', 1],
  ['met(attrRosa(g && g.vel) & 127, 7);', 0],
  ['sim.push((c>>>15) & 31', 1],          /* il controllo resta di quattro simboli */
  ['function componiCarta(seme, taglia){', 1],
];
const rotti = attesi.filter(([s, k]) => (out.split(s).length - 1) !== k)
  .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  il codice che non sta in un messaggio e\' pronto (tre simboli per attributo)');
console.log('    a    ' + outFile + '  (' + out.length + ' caratteri, ' + (out.length - src.length) + ')');
console.log('    prova:  node strumenti/_q-carta.js --solo A,B,C --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/'));
console.log('    ATTESO: ROSSO su A2, VERDE su tutto il resto');
