/* =====================================================================
   _crit-inv-cronometri.js -- IL GIOCO BUGIARDO, UN CRONOMETRO-FRATELLO
   NON AZZERATO (voce #125, compito 1), sul modello di _crit-mind-tetto.js.

   PERCHE'. Il banco strumenti/_q-invarianti.js dichiara che OGNI cronometro
   della famiglia (G.recT/G.vantaggio/G.swLock/G.swTimer/G.possOwner/
   G.possT/G.pulse/G.crowdSndT, la classe di regressioni #86/#87/#107/#117/
   #122) e' al suo valore di riposo SUBITO DOPO startMatch. Un banco che sa
   solo dire "verde" non prova niente: gli serve un gioco che lasci
   sopravvivere UN cronometro da una partita alla successiva, sulla STESSA
   pagina -- esattamente come le regressioni vere sono nate.

   LA PATCH, E PERCHE' PROPRIO G.pulse (non G.swLock/G.swTimer). Il primo
   tentativo di questo attrezzo toglieva l'azzeramento di G.swLock -- MA
   G.swLock si scrive solo da cambiaGiocatore() e dalla finta (strappo),
   ENTRAMBE raggiungibili solo con G.ctrl[t]>=0, cioe' un dito UMANO
   (CALCETTO-il-gioco.html:17504,17543): un banco CPU-contro-CPU come
   questo (nessun __test.dita) non lo tocca MAI, quindi il bugiardo non
   dava ROSSO -- misurato (8 partite di serie, tutte a riposo), non
   presunto. G.pulse invece si scrive incondizionatamente in cima a
   step(), OGNI fotogramma, per QUALUNQUE scena e QUALUNQUE controllo
   (":17015, G.pulse+=dt;"): al primo simulate() di qualunque partita e'
   gia' diverso da zero. E' il candidato giusto per un bugiardo che deve
   condannarsi in un banco CPU-contro-CPU, non un dettaglio interscambiabile.
   La riga toccata (CALCETTO-il-gioco.html:11116) azzera quattro
   cronometri insieme; questo attrezzo toglie SOLO G.pulse=0, lasciando
   G.possOwner/G.possT/G.crowdSndT come prima.

   PERCHE' NON BASTA UNA PARTITA SOLA. Alla primissima partita dopo il
   caricamento della pagina G.pulse e' gia' 0 per dichiarazione iniziale
   (riga ~16876): il banco deve giocare ALMENO due partite sulla STESSA
   pagina (il banco di casa ne gioca N di serie) perche' la sopravvivenza
   si veda -- e' la stessa condizione delle regressioni vere.

   NON E' UN ATTREZZO A ANCORE-PER-IL-GIOCO-VERO (niente --dentro): il
   file che produce e' PERMANENTEMENTE bugiardo, non va mai applicato al
   gioco vero. Esiste solo perche' _q-invarianti.js lo legga con --gioco e
   dica rosso sulla prova giusta (cronometri-fratelli). Non si committa il
   file generato (fuori/, gitignored), solo questo attrezzo.

   uso:  node strumenti/_crit-inv-cronometri.js
         node strumenti/_crit-inv-cronometri.js --out fuori/altro.html
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = path.resolve(RADICE, arg('out', 'fuori/bugiardo-cronometri.html'));

const CERCA = '  G.possOwner=-1; G.possT=0; G.pulse=0; G.crowdSndT=0;';
const METTI = '  G.possOwner=-1; G.possT=0; G.crowdSndT=0;   // BUGIARDO (voce #125): G.pulse NON azzerato qui apposta';

const src = fs.readFileSync(inFile, 'utf8');
const n = src.split(CERCA).length - 1;
if (n !== 1) {
  console.error('FALLITO: l\'ancora "' + CERCA + '" compare ' + n + ' volte (attesa 1). Il sito si e\' spostato o e\' cambiato.');
  process.exit(1);
}
const out = src.replace(CERCA, METTI);

if (out.split(METTI).length - 1 !== 1) { console.error('FALLITO: la sostituzione non e\' presente esattamente una volta dopo il replace'); process.exit(1); }
/* GUARDIA: questo attrezzo deve toccare SOLO l'azzeramento di G.pulse.
   Nessuna chiamata a dado() nuova o tolta, nessun'altra riga cambiata. */
if ((out.split('dado()').length - 1) !== (src.split('dado()').length - 1)) { console.error('FALLITO: il numero di chiamate a dado() e\' cambiato — questo attrezzo deve toccare SOLO l\'azzeramento di G.pulse'); process.exit(1); }
if (out.length !== src.length - CERCA.length + METTI.length) { console.error('FALLITO: la differenza di lunghezza non corrisponde a UNA sola sostituzione'); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  il gioco bugiardo CRONOMETRO-NON-AZZERATO e\' scritto');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
console.log('    patch: startMatch non azzera piu\' G.pulse (possOwner/possT/crowdSndT restano azzerati)');
