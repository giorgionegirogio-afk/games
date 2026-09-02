/* =====================================================================
   _t-tira-out.js — puoTirare NON CONTROLLA p.out>0 (voce #88, correzione
   della revisione del compito 9, rilievo MEDIO, 2 settembre 2026)

   LA DIAGNOSI. La guardia di apertura di puoTirare (~14084) e'
   `if(!p || p.slide>=0 || p.recover>0 || p.rove>=0) return false;` — manca
   p.out>0, che quasi tutte le funzioni gemelle hanno: puoPassare (~14162)
   `if(!p || p.out>0 || p.slide>=0 || p.recover>0 || p.rove>=0)`,
   puoContrastare (~14171) la stessa forma, anticipa (~15834) la stessa
   guardia di nuovo. E' un difetto preesistente (non introdotto dal
   compito 9), ma il brief del compito 9 chiedeva esplicitamente di
   verificarlo e il rapporto non lo menzionava.

   LA CURA: si allinea puoTirare alle sue gemelle, un solo termine
   aggiunto alla stessa guardia, nella stessa posizione (subito dopo !p,
   come fanno tutte le altre).

   LEGGE DEI SORTEGGI: p.out e' un campo letto, zero chiamate a dado().

   uso:  node strumenti/_t-tira-out.js --out fuori/tira-out.html
         node strumenti/_t-tira-out.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/tira-out.html'));

const ANCORE = [

/* 1 — puoTirare: manca p.out>0, presente in tutte le guardie gemelle */
{
  nome: '1/1 puoTirare: aggiunge p.out>0 alla guardia di apertura',
  cerca:
`  if(!p || p.slide>=0 || p.recover>0 || p.rove>=0) return false;`,
  metti:
`  /* MANCAVA p.out>0 (rilievo MEDIO della revisione del compito 9, 2
     settembre 2026): presente in puoPassare, puoContrastare e anticipa,
     assente qui. Preesistente al compito 9, ma il brief chiedeva di
     verificarlo esplicitamente. */
  if(!p || p.out>0 || p.slide>=0 || p.recover>0 || p.rove>=0) return false;`,
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
const contaSub = (s, sub) => s.split(sub).length - 1;
const attesi = [
  /* la stessa identica guardia vive gia' in puoPassare e puoContrastare
     (e in un terzo posto, riga 11888): il conto e' RELATIVO, +1 per la
     nuova occorrenza in puoTirare */
  ['if(!p || p.out>0 || p.slide>=0 || p.recover>0 || p.rove>=0) return false;', contaSub(src, 'if(!p || p.out>0 || p.slide>=0 || p.recover>0 || p.rove>=0) return false;') + 1],
  ['if(!p || p.slide>=0 || p.recover>0 || p.rove>=0) return false;', 0],
];
const rotti = attesi.filter(([s, n]) => contaSub(out, s) !== n)
  .map(([s, n]) => s + '  atteso ' + n + ', trovato ' + contaSub(out, s));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
