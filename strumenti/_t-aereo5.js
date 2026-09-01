/* =====================================================================
   _t-aereo5.js — STADIO C2: IN FASCIA, IL CROSS CON BERSAGLIO VERO
   ABBANDONA ANCHE LA CARICA DI TIRO (voce #72, 1 settembre 2026).

   L'IMBUTO, misurato coi consumatori avvolti (sonda della punta, stesso
   giorno, 1 partita a seme fisso per taglia sul file con A+B+A2+B2+C):
     5v5   crossBersaglio trova 8 · crossCPU apre 1 · doCross fuoca 1
           · rifiuti per carica non-appoggio: 11
     7v7   trova 1 · apre 0 · rifiuti 1
   Il collo non e' piu' trovare il bersaglio: e' la guardia della carica.
   La regola «si cambia idea solo su un APPOGGIO, mai su un tiro» dentro
   crossCPU — dove il portatore e' PER COSTRUZIONE in fascia, fuori
   dallo specchio (la guardia |p.y-FH/2|>=GOAL_H sta due righe sopra) —
   fa vincere una preghiera d'angolo su un cross con un uomo VERO in
   area.

   LA CURA: dentro crossCPU ogni carica si abbandona per un cross con
   bersaglio, TRANNE il cross stesso (il cross non annulla se stesso).
   La precedenza del tiro resta intatta dove il tiro e' vero: nello
   specchio il ramo per-fotogramma del cross non entra (negazione esatta
   di zonaTiro), e al ritmo delle decisioni il dado del tiro parla PRIMA
   che il cross venga consultato. Cambia solo il caso della carica
   APERTA IN PRECEDENZA che sopravviveva alla finestra del cross.

   SORTEGGI: nessuna estrazione nuova; l'esito nei percorsi CPU cambia
   come gia' dichiarato per gli stadi A/B/C (§4 del progetto).

   uso:  node strumenti/_t-aereo5.js --out fuori/aereo5.html
         node strumenti/_t-aereo5.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/aereo5.html'));

const ANCORE = [
{
  nome: '1/1 la guardia della carica in crossCPU, col verbale rettificato',
  cerca:
`     Il gioco questa mossa la fa gia': doFiltrante chiude la carica aperta
     quando il dito chiede un'altra cosa (dentro doFiltrante, la riga
     "stava caricando il tiro: cambia idea"). Qui vale la stessa regola con un limite in piu': si
     cambia idea solo su un APPOGGIO, mai su un tiro — il tiro ha la
     precedenza, e questa e' la terza riga che glielo garantisce.
     La clip 'cross' distingue la carica del cross da quella
     dell'appoggio, cosi' il cross non annulla se stesso. */
  if(p.charge>=0){
    if(p.chargeKind!=='passo' || p.chargeClip==='cross') return false;
    chiudiAnticipo(p);
  }`,
  metti:
`     Il gioco questa mossa la fa gia': doFiltrante chiude la carica aperta
     quando il dito chiede un'altra cosa (dentro doFiltrante, la riga
     "stava caricando il tiro: cambia idea"). La prima stesura aggiungeva
     un limite: «si cambia idea solo su un APPOGGIO, mai su un tiro — il
     tiro ha la precedenza, e questa e' la terza riga che glielo
     garantisce».

     RETTIFICA (1 settembre 2026, voce #72, stadio C2). Misurato coi
     consumatori avvolti, a seme fisso: a 5 contro 5 crossBersaglio
     trovava un bersaglio VERO 8 volte e questa guardia apriva UN solo
     anticipo — 11 rifiuti per carica non-appoggio; a 7 e a 11 il cross
     della macchina non esisteva. Ma DENTRO questa funzione il portatore
     e' per costruzione in fascia, fuori dallo specchio (la guardia
     |p.y-FH/2|>=GOAL_H, due righe sopra): il tiro che si stava
     caricando li' e' una preghiera d'angolo, e un cross con un uomo
     vero in area lo batte per mestiere. La precedenza del tiro resta
     dove il tiro e' vero — nello specchio il ramo per-fotogramma non
     entra (negazione esatta di zonaTiro), e al ritmo delle decisioni il
     dado del tiro parla PRIMA che il cross venga consultato. Qui ogni
     carica si abbandona; la clip 'cross' continua a distinguere il
     cross, che non annulla se stesso. */
  if(p.charge>=0){
    if(p.chargeClip==='cross') return false;
    chiudiAnticipo(p);
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
  ["if(p.chargeClip==='cross') return false;", 1],
  ["if(p.chargeKind!=='passo' || p.chargeClip==='cross') return false;", 0],
  ['stadio C2', 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
