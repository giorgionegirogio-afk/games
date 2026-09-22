/* =====================================================================
   _crit-sigillo-fascia.js — LA FASCIA DI RIEPILOGO IN CIMA
   (voce #134, compito 2). Il falso che condanna la prova B3 di
   `_q-sigillo.js`.

   CHE COSA FALSIFICA: invece di mettere il sigillo dentro la riga, il
   gioco mette in cima alla lista una fascia che riassume — «da
   verificare: 3 · verificate: 1 · non tornano: 1». E' la tentazione
   naturale di questo cantiere, ed e' proprio per quello che serve un
   falso: una fascia di riepilogo e' bella in una fotografia e su un
   telefono in orizzontale spinge la prima riga sotto la piega. E' il
   difetto gia' pagato del TORNEO (grep «LE OTTO SQUADRE SOPRA LA
   PIEGA»: il tabellone finiva 17 px sotto il piede opaco dei bottoni e
   l'ottava squadra spariva) e quello della PAUSA (la quarta voce col
   centro a y=433 su uno schermo alto 412: dalla partita non si usciva
   piu').

   E' IL CASO PEGGIORE: la fascia NON toglie il sigillo dalle righe, che
   restano esattamente quelle giuste. Il falso passa B0, B1, B2 e tutto
   il gruppo C — dice le cose vere, con le parole giuste, e non accusa
   nessun innocente. Cade su una cosa sola: dove vanno a finire i pixel.

   L'ESITO ATTESO: ROSSO su B3, VERDE su tutto il resto.

   uso:  node strumenti/_crit-sigillo-fascia.js
         node strumenti/_q-sigillo.js --gioco fuori/gioco-sigillo-fascia.html
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = path.resolve(RADICE, arg('out', 'fuori/gioco-sigillo-fascia.html'));

/* la fascia, col suo CSS */
const A1 = `.sfsig.no{color:var(--ambra);border-color:var(--ambra)}`;
const B1 = `.sfsig.no{color:var(--ambra);border-color:var(--ambra)}
.sfconto{font-family:var(--cond);font-weight:600;font-size:13px;line-height:1.5;
  padding:8px 12px;margin-bottom:6px;border:1px solid var(--linea);background:var(--ardesia);color:var(--grigio)}
.sfconto b{color:var(--gesso)}`;

const A2 = `    let h = '';
    for(const s of this.sfide){
      if(!s) continue;`;
const B2 = `    let n0 = 0, n1 = 0, n2 = 0;
    for(const s of this.sfide){ const v = (s && s.verificata)|0;
      if(v === 1) n1++; else if(v === -1) n2++; else n0++; }
    let h = '<div class="sfconto">' +
              '<div>Da verificare: <b>' + n0 + '</b></div>' +
              '<div>Verificate: <b>' + n1 + '</b></div>' +
              '<div>Non tornano: <b>' + n2 + '</b></div>' +
            '</div>';
    for(const s of this.sfide){
      if(!s) continue;`;

const src = fs.readFileSync(inFile, 'utf8');
for (const [a, i] of [[A1, 1], [A2, 2]]) {
  const n = src.split(a).length - 1;
  if (n !== 1) { console.error('FALLITO: ancora ' + i + ' trovata ' + n + ' volte invece di 1'); process.exit(1); }
}
const out = src.replace(A1, B1).replace(A2, B2);
const attesi = [
  ['<div class="sfconto">', 1],
  ['<span class="sfsig', 1],          /* il sigillo nella riga NON si tocca */
  ["parola:'DA VERIFICARE'", 1],
];
const rotti = attesi.filter(([s, k]) => (out.split(s).length - 1) !== k)
  .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  la fascia e\' pronta: tre righe di riepilogo sopra la lista, i sigilli intatti');
console.log('    a    ' + outFile + '  (' + out.length + ' byte, +' + (out.length - src.length) + ')');
console.log('    prova:  node strumenti/_q-sigillo.js --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/'));
console.log('    ATTESO: ROSSO su B3, VERDE su tutto il resto');
