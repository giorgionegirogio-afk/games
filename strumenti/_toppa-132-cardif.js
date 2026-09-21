/* =====================================================================
   _toppa-132-cardif.js — carDif RICADE COL RESTO (voce #132, correzione
   di revisione). Un'ancora.

   IL DIFETTO, TROVATO IN REVISIONE. Nel ripiego di Sfida.guarda (quando
   il nastro non porta una rosa valida, tipicamente una testa di tipo 7
   malformata) si rimettono mentAtt, mentDif, rosaAtt e rosaDif ai valori
   di ieri — ma non carDif, che resta quello letto da quella stessa testa
   malformata invece di ricadere anche lui.

   IL DANNO E' PICCOLO MA REALE. carPerIndice limita carDif fuori range a
   CAR_NEUTRO, quindi il caso peggiore e' un carattere sbagliato-ma-valido
   dentro un cammino gia' degradato (la rosa non valida), raggiungibile
   solo con un nastro corrotto o OSTILE. In un'onda dove i nastri ostili
   contano (nessun innocente accusato, ma anche nessun colpevole lasciato
   entrare da una porta socchiusa), l'asimmetria si chiude.

   LA CURA. Un `carDif = undefined;` in coda al ripiego, per simmetria
   con gli altri quattro valori: dopo la cura startMatch ricade su
   caratterePer(dif.nome) come faceva prima della voce #132, esattamente
   come gia' fa per mentAtt/mentDif/rosaAtt/rosaDif.

   uso:  node strumenti/_toppa-132-cardif.js --out fuori/x.html
         node strumenti/_toppa-132-cardif.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/132-cardif.html'));

const ANCORE = [

/* 1 — il ripiego rimette tutto, ora anche carDif */
{
  nome: '1/1 il ripiego azzera anche carDif',
  cerca:
`    if(!(Array.isArray(rosaAtt) && rosaAtt.length >= 4)){
      mentAtt = mentDaIndole(att.indole); mentDif = mentDaIndole(dif && dif.indole);
      rosaAtt = att.rosa; rosaDif = nomiDif;
    }`,
  metti:
`    if(!(Array.isArray(rosaAtt) && rosaAtt.length >= 4)){
      /* CORREZIONE DI REVISIONE (voce #132, 21 settembre 2026): questo
         ripiego rimetteva mentAtt/mentDif/rosaAtt/rosaDif ma non carDif,
         che restava quello letto da una testa di tipo 7 malformata.
         carPerIndice lo limita comunque (fuori range -> CAR_NEUTRO), ma
         un nastro corrotto o OSTILE non deve lasciare in vita NESSUNO dei
         cinque valori di una testa scartata: per simmetria con gli altri
         quattro, ricade anche lui, e startMatch torna su
         caratterePer(dif.nome), come faceva prima della voce #132. */
      mentAtt = mentDaIndole(att.indole); mentDif = mentDaIndole(dif && dif.indole);
      rosaAtt = att.rosa; rosaDif = nomiDif; carDif = undefined;
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
  ['rosaAtt = att.rosa; rosaDif = nomiDif; carDif = undefined;', 1],
  ['rosaAtt = att.rosa; rosaDif = nomiDif;\n    }', 0],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggio applicato');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
