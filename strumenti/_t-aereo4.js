/* =====================================================================
   _t-aereo4.js — STADIO C: IL TETTO DI RACCOLTA SCALA COL CAMPO
   (voce #72, 1 settembre 2026).

   LA PORTA HA IL SUO NOME, come il progetto esigeva per aprire questo
   stadio (§2.C: «solo se l'11 resta sotto i 2 cross... la sonda lo dice
   per nome»). Misurato oggi, con A+B+A2+B2 gia' dentro: a 11 la punta
   arriva in area nei fotogrammi giusti (45 proiezioni in area su 69
   fotogrammi con portatore pronto in zona e fascia) ma sta a 424-1007
   unita' dal crossatore, contro un dMax di 386. Non e' l'occupazione,
   non e' il portiere, non e' il varco: e' il TETTO. Il progetto §1.3
   l'aveva contato: dalla riga laterale al bordo dell'area corrono 409
   unita', gia' oltre dMax — un'ala sulla riga a 11 non poteva crossare
   in area PER COSTRUZIONE.

   LA CURA (§2.C del progetto, numeri calcolati il 31 agosto): CROSS_RACC
   si mette in scala col campo come l'attrito — CROSS_RACC/ATTR_K — lo
   stesso errore gia' curato nel «TAPPO A 500 che non sapeva quant'e'
   grande il campo». dMax diventa 479/592/772 alle tre taglie; a taglia 5
   ATTR_K=1 e il conto e' IDENTICO AL BIT.

   GLI OCCHI APERTI, dichiarati dal progetto (§6.6): al dMax nuovo il
   lancio arriva a 1.032/1.245 u/s — sopra la linea «proiettile» dei
   tiri (860). Il colpo di testa non ha tetto d'ingresso e il cross che
   nessuno tocca rimbalza sui corpi sopra le 420: _eventi --contro
   sorveglia contesi e cambi di possesso, e l'occhio del §5.4 giudica il
   pallone-razzo. Il tappo a 860 resta pronto coi suoi numeri
   (446/493/533) se l'occhio boccia.

   SORTEGGI: crossFinestra non pesca; l'esito nei percorsi CPU cambia
   come gia' dichiarato (§4).

   uso:  node strumenti/_t-aereo4.js --out fuori/aereo4.html
         node strumenti/_t-aereo4.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/aereo4.html'));

const ANCORE = [
{
  nome: '1/1 dMax in scala col campo',
  cerca:
`function crossFinestra(){
  const K = Math.max(0.001, TIRO_ATTR);
  const e = Math.exp(-CROSS_TVOLO*K);
  const c = (1-e)/(CROSS_TVOLO*K);          // strada vera / distanza mirata
  return { K, c, dMax: CROSS_RACC*(1-e)/(K*e) };
}`,
  metti:
`function crossFinestra(){
  const K = Math.max(0.001, TIRO_ATTR);
  const e = Math.exp(-CROSS_TVOLO*K);
  const c = (1-e)/(CROSS_TVOLO*K);          // strada vera / distanza mirata
  /* STADIO C (1 settembre 2026, voce #72): il tetto di raccolta scala
     col campo, come l'attrito da cui e' dedotto — CROSS_RACC/ATTR_K.
     La porta che l'ha aperto ha il nome che il progetto esigeva:
     misurato con A+B dentro, a 11 la punta ARRIVA in area ma sta a
     424-1007 unita' dal crossatore contro un dMax di 386 (dalla riga
     laterale al bordo dell'area corrono gia' 409 unita'). E' lo stesso
     errore del «tappo a 500 che non sapeva quant'e' grande il campo».
     dMax: 479/592/772 alle tre taglie; a taglia 5 ATTR_K=1 e il conto
     e' identico al bit. Il lancio al tetto arriva a 1.032/1.245 u/s:
     dichiarato nel progetto (§6.6), sorvegliato da _eventi --contro e
     dall'occhio; il tappo a 860 resta pronto se l'occhio boccia. */
  return { K, c, dMax: (CROSS_RACC/ATTR_K)*(1-e)/(K*e) };
}`,
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
  ['(CROSS_RACC/ATTR_K)*(1-e)/(K*e)', 1],
  ['dMax: CROSS_RACC*(1-e)', 0],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
