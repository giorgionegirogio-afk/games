/* =====================================================================
   _crit-mind-tetto.js -- IL GIOCO BUGIARDO (i), TETTO VIOLATO (voce #117,
   compito 5, MIND v1), sul modello di _crit-festa-dado.js.

   PERCHE'. Il banco strumenti/_q-umore.js dichiara un tetto per ciascuna
   delle tre manopole di manopolaDi(p) (passErr +-15%, slideP +25%,
   standoff -12%) e la prova TETTI misura il MASSIMO scarto osservato su
   N partite. Un banco che sappia solo dire "verde" non prova niente: gli
   ci vuole un gioco che sfonda il tetto DI PROPOSITO, e la prova TETTI
   deve accorgersene da sola. Questo attrezzo produce quel gioco: una
   patch testuale che porta il coefficiente di passErr da 0.15 a 0.60 (il
   QUADRUPLO del tetto dichiarato) in manopolaDi(p) -- la STESSA formula
   che il compito 3 ha scritto, un solo numero cambiato.

   NON E' UN ATTREZZO A ANCORE-PER-IL-GIOCO-VERO (niente --dentro): il
   file che produce e' PERMANENTEMENTE bugiardo, non va mai applicato al
   gioco vero. Esiste solo perche' _q-umore.js lo legga con --gioco e
   dica rosso sulla prova giusta (TETTI). Non si committa il file
   generato (fuori/), solo questo attrezzo.

   uso:  node strumenti/_crit-mind-tetto.js
         node strumenti/_crit-mind-tetto.js --out fuori/altro.html
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = path.resolve(RADICE, arg('out', 'fuori/bugiardo-tetto.html'));

const CERCA = '    passErr: D.passErr / (1 + 0.15*p.umore),';
const METTI = '    passErr: D.passErr / (1 + 0.60*p.umore),   // BUGIARDO (voce #117, compito 5): tetto dichiarato 0.15, qui 0.60';

const src = fs.readFileSync(inFile, 'utf8');
const n = src.split(CERCA).length - 1;
if (n !== 1) {
  console.error('FALLITO: l\'ancora "' + CERCA + '" compare ' + n + ' volte (attesa 1). Il sito si e\' spostato o e\' cambiato.');
  process.exit(1);
}
const out = src.replace(CERCA, METTI);

if (out.split(METTI).length - 1 !== 1) { console.error('FALLITO: la sostituzione non e\' presente esattamente una volta dopo il replace'); process.exit(1); }
/* NOTA: "0.15*p.umore" resta nel COMMENTO della lettera di testa di
   manopolaDi (dichiara il tetto vero, non tocca il codice): il guardiano
   verifica il SITO DI CODICE via CERCA/METTI qui sopra (gia' contato
   esattamente 1), non l'assenza della sottostringa nell'intero file. */
if ((out.split('dado()').length - 1) !== (src.split('dado()').length - 1)) { console.error('FALLITO: il numero di chiamate a dado() e\' cambiato — questo attrezzo deve toccare SOLO il coefficiente del tetto'); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  il gioco bugiardo (i) TETTO VIOLATO e\' scritto');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
console.log('    patch: passErr diviso (1 + 0.15*umore) -> diviso (1 + 0.60*umore)  (tetto dichiarato: 0.15)');
