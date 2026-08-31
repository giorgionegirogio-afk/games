/* =====================================================================
   _crit8-bugiarda.js — LA DICHIARAZIONE BUGIARDA.

   Costruisce una copia del gioco in cui la pastiglia SI DICHIARA vuota
   esattamente come nella cura, ma SI DIPINGE PIENA come nel gioco
   spedito. Nessun altro cambiamento: stessi dischi, stesse etichette,
   stesso avviso, stesse posizioni, stesso conto di dado().

   Serve a rispondere a una sola domanda: _q-dischi.js misura il DISEGNO
   o la DICHIARAZIONE? Se la copia bugiarda passa il cancello a otto su
   otto, il cancello non vede il difetto che dice di vedere.

   uso: node strumenti/_crit8-bugiarda.js --in fuori/comandi.html
                                          --out fuori/_crit8-bugiarda.html
   ===================================================================== */
const fs = require('fs'), path = require('path');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const inF = path.resolve(RADICE, arg('in', 'fuori/comandi.html'));
const outF = path.resolve(RADICE, arg('out', 'fuori/_crit8-bugiarda.html'));
if (inF === outF) { console.error('FALLITO: --out coincide con --in'); process.exit(2); }

const ANCORE = [
  { nome: 'la pastiglia si dipinge piena, ma si calcola lo stesso',
    cerca: `      const aPas=pressed?1:velaPastiglia(bx0,by0,bt.r);`,
    metti: `      const aPasDICH=pressed?1:velaPastiglia(bx0,by0,bt.r);
      const aPas=1;   /* BUGIA: si dipinge pieno */` },
  { nome: 'ma si DICHIARA vuota come nella cura',
    cerca: `                       dentro:+(aBt*aPas).toFixed(3), rInt:Math.max(0,bt.r-4)};`,
    metti: `                       dentro:+(aBt*aPasDICH).toFixed(3), rInt:Math.max(0,bt.r-4)};` },
];

let src = fs.readFileSync(inF, 'utf8');
const prima = src;
for (const a of ANCORE) {
  const n = src.split(a.cerca).length - 1;
  if (n !== 1) { console.error('FALLITO: «' + a.nome + '» trovato ' + n + ' volte'); process.exit(1); }
  src = src.replace(a.cerca, a.metti);
}
const attesi = [['const aPas=1;', 1], ['ctx.globalAlpha=aBt*aPas;', 1], ['aBt*aPasDICH', 1]];
const rotti = attesi.filter(([s, n]) => (src.split(s).length - 1) !== n);
if (rotti.length) { console.error('FALLITO dopo la sostituzione: ' + JSON.stringify(rotti)); process.exit(1); }
const dp = (prima.match(/\bdado\s*\(/g) || []).length, dd = (src.match(/\bdado\s*\(/g) || []).length;
if (dp !== dd) { console.error('FALLITO: dado() ' + dp + ' -> ' + dd); process.exit(1); }
fs.writeFileSync(outF, src);
console.log('OK  2 ancoraggi · dado() ' + dd + ' invariate · ' + outF);
