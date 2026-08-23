/* =====================================================================
   _t-manto-tv.js — IL MANTO TV: croma a luminanza costante, verso il
   verde dei video del committente (23 agosto 2026).

   LA MISURA CHE COMANDA (da _analisi/fc25-video.md, fonti: i DUE video
   locali del committente): il prato di FC 25 in partita sta a media
   (84,134,60) con dominante verde (G - max(R,B)) ~ +50; il nostro,
   misurato sul telefono e sul banco, a dominante +27..+40. La LUMINANZA
   non si puo' inseguire — il cancello del contrasto maglia/erba (3:1,
   collaudo.js) la inchioda — ma la DOMINANTE si': la saturazione non
   tocca i rapporti di luminanza.

   LA PROVA, sul banco delle pose (fuori/_manto-prova.js, quinta
   stesura — le prime quattro sono la storia di un banco che accusava
   l'innocente: bistabile per tendine a orologio vero, poi cieco perche'
   serviva sempre il file di casa; tutta la caccia sta nel registro):
     base           mediana erba RGB(47,86,43)   lum 74,6  dom +39
     A (#0e6e10)    mediana erba RGB(37,85,35)   lum 71,2  dom +48/+50
     D (#2a8a2e)    lum 87-94 (BOCCIATO: compra dominante pagando
                    luminanza, cioe' i rapporti delle maglie)
   Il candidato A raggiunge la dominante dei video A LUMINANZA FERMA.
   All'occhio (fuori/manto-occhio-*.png): il prato smette di leggere
   come palude e legge come erba, l'usura passa da muffa a terra calda,
   figure e righe intatte.

   Tre prati a strisce, tre cure della stessa specie:
     · ORATORIO  #1c6a20/#1c6b21 -> #0e6e10/#0e6f11  (il prato di casa)
     · GABBIA    #042f13 x2      -> #023008 x2
       (4,47,19)->(2,48,8): Y lineare 0,0209 -> 0,0212 (+1,4%), R e B
       giu', G su di uno. La coppia precedente era stata cercata a forza
       bruta per TENERE Y e tinta: questa tiene Y e SPOSTA la tinta, che
       e' il punto della toppa. A luminanze cosi' basse il passo a 8 bit
       e' grossolano: +1,4% e' il minimo scarto raggiungibile.
     · NOTTURNO  gia' saturo dalla sua taratura (#031e0d): non si tocca.

   E DUE TESTI RIMASTI A DUE DISCHI (trovati fotografando il banco):
   il suggerimento del pannello PAUSA e la coda della lavagna dei gesti
   parlavano ancora di due pulsanti — L1.6 ne ha messi quattro.

   Cancelli a valle: collaudo.js (contrasto maglia/erba) e la batteria
   intera. Se una divisa scendesse sotto il 3:1 la toppa torna indietro.

   uso:  node strumenti/_t-manto-tv.js --out fuori/mantotv.html
         node strumenti/_t-manto-tv.js --dentro
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;

const ANCORE = [

/* 1 — l'oratorio, il prato di casa */
{
  nome: '1/4 oratorio: croma su, luminanza ferma',
  cerca: "th:{ g1:'#1c6a20', g2:'#1c6b21', fuori:'#131008', grad:'#1a150c',",
  metti: "th:{ g1:'#0e6e10', g2:'#0e6f11', fuori:'#131008', grad:'#1a150c',",
},

/* 2 — la gabbia, il prato dell'identita' */
{
  nome: '2/4 gabbia: croma su, luminanza ferma (+1,4%, minimo del passo a 8 bit)',
  cerca: "th:{ g1:'#042f13', g2:'#042f13', fuori:'#07120c', grad:'#0a1a12',",
  metti: "th:{ g1:'#023008', g2:'#023008', fuori:'#07120c', grad:'#0a1a12',",
},

/* 3 — il suggerimento della PAUSA impara i quattro dischi */
{
  nome: '3/4 pausa: il suggerimento dice quattro dischi',
  cerca: "? 'Stick a sinistra · TIRA/CONTRASTA e PASSAGGIO/CAMBIO cambiano col possesso'",
  metti: "? 'Stick a sinistra · quattro dischi che cambiano col possesso: TIRA, PASSAGGIO, PASSA e CROSS'",
},

/* 4 — la coda della lavagna dei gesti smette di dire «due pulsanti» */
{
  nome: '4/4 lavagna: i gesti si battono coi dischi',
  cerca: 'Alzare il dito dalla levetta non fa mai partire niente: i gesti si battono coi due pulsanti.',
  metti: 'Alzare il dito dalla levetta non fa mai partire niente: i gesti si battono coi dischi.',
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-manto-tv.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.mantotv.html';
outFile = path.resolve(outFile);
if (!dentro && outFile === inFile) { console.error('FALLITO: --out coincide con --in.'); process.exit(2); }

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
  ["g1:'#0e6e10'", 1], ["g1:'#023008'", 1],
  ["g1:'#1c6a20'", 0], ["g1:'#042f13'", 0],
  ['quattro dischi che cambiano col possesso: TIRA, PASSAGGIO, PASSA e CROSS', 1],
  ['coi due pulsanti', 0],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
