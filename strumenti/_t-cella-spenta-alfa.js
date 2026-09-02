/* =====================================================================
   _t-cella-spenta-alfa.js — IL COMANDO INTERO SI ATTENUA (voce #88,
   correzione del compito 4, rilievo MINORE 2 della revisione, 2
   settembre 2026).

   IL DIFETTO TROVATO. Il Passo 5 del brief chiedeva di attenuare il
   comando INTERO quando la cella e' spenta (esempio dato:
   ctx.globalAlpha *= 0.45). L'implementazione del compito 4 toccava
   solo aPas, cioe' la sola PASTIGLIA: la ghiera e l'etichetta restavano
   a piena opacita' su un disco che dichiara di essere spento. Il
   revisore ha verificato che l'anello di carica non e' comunque mai
   disegnato per questi due dischi quando sono spenti (nessun aggravio
   visibile la', ma il difetto sulla ghiera/etichetta resta).

   LA CURA: aOff diventa la SOLA fonte del fattore di attenuazione (0,42,
   lo stesso valore gia' scelto dal compito 4 — il brief lo dava solo
   come esempio, «per esempio 0.45»), e si applica in tutti e due i
   punti in cui il disco si dipinge: la pastiglia (dove gia' stava) e il
   "comando intero" (ghiera, fili, arco di carica, etichetta), dove
   prima mancava. Nessuna posizione cambia, nessun nome cambia: solo
   quanto e' acceso.
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/cella-alfa.html'));

const ANCORE = [

/* 1 — aOff diventa la sola fonte del fattore, la pastiglia la legge */
{
  nome: '1/2 aOff nasce, la pastiglia la legge',
  cerca:
`      const aPas=(pressed?1:velaPastiglia(bx0,by0,bt.r)) * (bt.off?0.42:1);`,
  metti:
`      /* L'INTERO COMANDO SI ATTENUA, NON SOLO LA PASTIGLIA (voce #88,
         correzione del compito 4, minore 2 della revisione, 2 settembre
         2026). Il brief chiedeva di attenuare il comando intero
         (ctx.globalAlpha *= 0.45); la prima stesura toccava solo aPas,
         lasciando ghiera ed etichetta a piena opacita' su una cella che
         dichiara di essere spenta. aOff e' la SOLA fonte del fattore, e
         si applica qui alla pastiglia e piu' sotto alla ghiera e
         all'etichetta, cosi' il disco spento si vede spento ovunque. */
      const aOff=bt.off?0.42:1;
      const aPas=(pressed?1:velaPastiglia(bx0,by0,bt.r)) * aOff;`,
},

/* 2 — il comando intero (ghiera, fili, arco, etichetta) legge aOff */
{
  nome: '2/2 il comando intero legge aOff',
  cerca:
`      ctx.globalAlpha=aBt;
      /* la ghiera: ambra a riposo, gesso da premuta. Anche lei tre stop —`,
  metti:
`      ctx.globalAlpha=aBt*aOff;
      /* la ghiera: ambra a riposo, gesso da premuta. Anche lei tre stop —`,
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
const conta = (testo, s) => testo.split(s).length - 1;
const attesi = [
  ['const aOff=bt.off?0.42:1;', 1],
  ['ctx.globalAlpha=aBt*aOff;', 1],
];
const rotti = attesi.filter(([s, n]) => (conta(out, s) - conta(src, s)) !== n)
  .map(([s, n]) => s + ' atteso +' + n + ', trovato +' + (conta(out, s) - conta(src, s)));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
