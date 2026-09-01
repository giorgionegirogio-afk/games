/* =====================================================================
   _t-aereo6.js — STADIO C3: IN FASCIA IL CROSS SI GUARDA A OGNI
   FOTOGRAMMA ANCHE DENTRO LA ZONA DI TIRO (voce #72, 1 settembre 2026).

   LA PORTA, misurata (sonda della punta + sonda alle porte, stesso
   giorno, sul file con A+B+A2+B2+C+C2): a 11 esistono 14 fotogrammi CON
   BERSAGLIO in 4 partite — e crossBersaglio nel gioco vivo viene
   consultata ZERO volte a segno. Il perche': quei fotogrammi stanno
   nella STRISCIA CONTESA — in fascia (|dy|>=GOAL_H, quindi fuori dallo
   specchio) ma dentro zonaTiro (|dy| < FH*0,40) — dove il ramo
   per-fotogramma del cross non entra (guardia !zonaTiro) e il ritmo
   delle decisioni (0,22-0,4 s) non coincide mai con finestre da pochi
   fotogrammi. A 11 la striscia vale meta' della fascia utile.

   LA CURA, lo stesso principio della rettifica C2: in fascia il tiro e'
   una preghiera d'angolo e il cross con un uomo VERO in area lo batte
   per mestiere. Il ramo per-fotogramma si apre anche nella striscia:
   la guardia diventa «fuori da zonaTiro, OPPURE in fascia». Nello
   specchio vero (|dy|<GOAL_H) non cambia niente: li' crossCPU rifiuta
   comunque per costruzione (la sua seconda guardia), e il tiro tiene
   tutta la precedenza di sempre.

   SORTEGGI, dichiarato: quando il ramo torna vero in un fotogramma dove
   prima non veniva consultato, aiCarrier esce PRIMA dei dadi del ramo
   tiro — a valle le partite a seme fisso divergono, come gia' messo a
   verbale per gli stadi A/B/C (§4 del progetto).

   uso:  node strumenti/_t-aereo6.js --out fuori/aereo6.html
         node strumenti/_t-aereo6.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/aereo6.html'));

const ANCORE = [
{
  nome: '1/1 il ramo per-fotogramma si apre alla striscia contesa',
  cerca:
`  if(p.kickCd<=0 && !zonaTiro(p.x, p.y, opGoalX, p.team) && crossCPU(p, opGoalX)){
    p.aiActT=Math.max(p.aiActT||0, 0.30);   // non decide altro mentre il piede va
    return;
  }`,
  metti:
`  /* C3 (1 settembre 2026, voce #72): il ramo si apre anche alla
     STRISCIA CONTESA — in fascia ma dentro zonaTiro — dove stavano
     TUTTI i fotogrammi con bersaglio misurati a 11 (14 su 4 partite) e
     dove il ritmo delle decisioni non arrivava mai in tempo. In fascia
     il cross con un uomo vero in area batte il tiro d'angolo per
     mestiere (la rettifica C2 dentro crossCPU); nello specchio vero
     niente cambia: crossCPU rifiuta per costruzione sotto GOAL_H. */
  if(p.kickCd<=0 && (!zonaTiro(p.x, p.y, opGoalX, p.team) || Math.abs(p.y-FH/2)>=GOAL_H)
     && crossCPU(p, opGoalX)){
    p.aiActT=Math.max(p.aiActT||0, 0.30);   // non decide altro mentre il piede va
    return;
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
  ["(!zonaTiro(p.x, p.y, opGoalX, p.team) || Math.abs(p.y-FH/2)>=GOAL_H)", 1],
  ['STRISCIA CONTESA', 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
