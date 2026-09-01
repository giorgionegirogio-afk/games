/* =====================================================================
   _t-aereo2.js — LA PARTENZA ANTICIPATA DELLA PUNTA (stadio A2 della
   voce #72, 1 settembre 2026).

   LA MISURA CHE LO CHIEDE (sonda alle porte, stesso giorno, sul file con
   A+B dentro): a 7 lo stadio A morde — da 0 a 44 fotogrammi CON
   BERSAGLIO — ma a 11 la punta non compare in area NEMMENO PROIETTATA
   (0 su 4 partite, n=0). Il conto: dalla stazione (PUNTA_X=0,70, cioe'
   1610 su 2300) al secondo palo corrono ~500 unita', ~3,5 s al passo di
   gara — piu' del possesso medio d'ala. Col cancello di CROSS_CORSA a
   0,58 la corsa parte quando l'azione e' gia' in rifinitura, e a 11
   muore per strada.

   LA CURA: per la SOLA punta ai campi grandi il cancello della corsa si
   apre prima — dal 58% al 75% del campo (il portatore oltre il quarto
   difensivo avversario... cioe' oltre il 25% dalla porta propria). Per
   tutti gli altri (e per tutte le squadre a 5) non cambia un bit.
   E' l'eco del contratto d'incarico del concorrente (CrossRunAssignment,
   MINIERA-FCM.md §5): l'incarico si emette quando l'attacco si
   costruisce, non quando e' gia' finito.

   SORTEGGI: attaccaArea non pesca; l'anticipo della corsa sposta gli
   esiti nei percorsi CPU come gia' dichiarato per lo stadio A (§4 del
   progetto). Nessuna estrazione nuova.

   uso:  node strumenti/_t-aereo2.js --out fuori/aereo2.html
         node strumenti/_t-aereo2.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/aereo2.html'));

const ANCORE = [
{
  nome: '1/1 il cancello della corsa si apre prima per la punta',
  cerca:
`  if(TAGLIA>=7 && ruoloDi(p)!=='punta') return false;
  const t=p.team, gx=t===0?FW:0;
  if(Math.abs(gx-carrier.x) > FW*CROSS_CORSA) return false;`,
  metti:
`  if(TAGLIA>=7 && ruoloDi(p)!=='punta') return false;
  const t=p.team, gx=t===0?FW:0;
  /* A2 (1 settembre 2026, voce #72): ai campi grandi la punta parte
     PRIMA. Dalla stazione al secondo palo corrono ~500 unita' (~3,5 s),
     piu' del possesso medio d'ala: col cancello a 0,58 la corsa partiva
     in rifinitura e a 11 non arrivava MAI (sonda alle porte: 0
     proiezioni in area su 4 partite, anche con A+B dentro). Per lei il
     cancello si apre al 75% del campo; per tutti gli altri, e a 5,
     restano le stesse righe al bit. */
  const sogliaCorsa = (TAGLIA>=7 && ruoloDi(p)==='punta') ? 0.75 : CROSS_CORSA;
  if(Math.abs(gx-carrier.x) > FW*sogliaCorsa) return false;`,
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
  ['sogliaCorsa', 2],                                   // la dichiarazione e l'uso
  /* il filtro del ramo della palla vagante (:19221) resta suo: la
     partenza anticipata vale per la corsa su un PORTATORE vero */
  ['FW*CROSS_CORSA', 1],
  ["(TAGLIA>=7 && ruoloDi(p)==='punta') ? 0.75", 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
