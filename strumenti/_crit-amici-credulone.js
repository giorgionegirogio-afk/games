/* =====================================================================
   _crit-amici-credulone.js — IL CODICE RISCRIVE IL TUO PUNTEGGIO (voce
   #136, compito 2). Il falso che condanna C6.

   CHE COSA FALSIFICA. Il ricordo delle proprie sfide non viene piu'
   guardato: quel che dice il codice che torna indietro vale sempre,
   anche per il punteggio di CHI LEGGE. E' la versione «semplice» della
   funzione — un campo in meno da controllare, una riga in meno da
   scrivere — e apre l'unica strada per barare che questa voce potesse
   chiudere: chi risponde puo' dichiarare che avevi chiuso 0-5 e
   prendersi una vittoria che non ha vinto.

   E' IL CASO PEGGIORE: `ricordaMia` resta al suo posto e continua a
   riempire `SAVE.amici.mie`, quindi il salvataggio ha esattamente la
   stessa forma, i tetti reggono, l'additivita' regge. Nessuno se ne
   accorge guardando il disco: si vede solo mettendo alla prova un
   codice che mente.

   L'ESITO ATTESO: ROSSO su C6, VERDE su tutto il resto.

   uso:  node strumenti/_crit-amici-credulone.js
         node strumenti/_q-amici.js --solo C --gioco fuori/gioco-amici-credulone.html
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = path.resolve(RADICE, arg('out', 'fuori/gioco-amici-credulone.html'));

const A = `      const mia = this.miaDi(o.seme);
      if(mia && (mia.a !== o.sfA || mia.d !== o.sfD)){
        avviso = 'Il codice dice che avevi chiuso ' + o.sfA + '-' + o.sfD +
                 ', ma questo telefono si ricorda ' + mia.a + '-' + mia.d + ': vale il ricordo.';
        miei = [mia.a, mia.d];
      }`;
const B = `      /* IL FALSO (voce #136, _crit-amici-credulone): quel che dice il
         codice vale sempre, anche sul punteggio di chi legge. Una riga
         in meno, e una strada in piu' per barare. */`;

const src = fs.readFileSync(inFile, 'utf8');
const n = src.split(A).length - 1;
if (n !== 1) { console.error('FALLITO: ancora trovata ' + n + ' volte invece di 1'); process.exit(1); }
const out = src.replace(A, B);
const attesi = [
  ['this.miaDi(o.seme)', 0],
  ['  ricordaMia(seme, ga, gd){', 1],     /* il ricordo si scrive ancora: il salvataggio e' identico */
  ['  miaDi(seme){', 1],
  ['const AMICI_MIE = 20;', 1],
];
const rotti = attesi.filter(([s, k]) => (out.split(s).length - 1) !== k)
  .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  il codice che torna puo\' riscrivere il punteggio di chi legge');
console.log('    a    ' + outFile + '  (' + out.length + ' caratteri, ' + (out.length - src.length) + ')');
console.log('    prova:  node strumenti/_q-amici.js --solo C --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/'));
console.log('    ATTESO: ROSSO su C6, VERDE su tutto il resto');
