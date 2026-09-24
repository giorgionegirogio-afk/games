/* =====================================================================
   _t-147-motorev.js — MOTORE_V VA ALZATO? LA MISURA, NEI DUE VERSI
   (voce #147, compito 4)

   LA DOMANDA, ESATTA. Il compito 4 mette nel nastro due tipi di riga che
   prima non ci arrivavano: il 14 (la testimonianza dell'impegno, che
   `Dischetto.testimonia` scriveva in memoria e che la serializzazione
   buttava) e il 15 (la carta d'identita' della serie). Il criterio
   scritto in casa e' «MOTORE_V si incrementa quando una cura cambia
   l'esito di sequenze di comandi identiche». Nessuna delle due righe e'
   un comando.

   MA «NON DOVREBBE» NON E' UN NUMERO. Il #144 ha dimostrato quanto costa
   crederci: li' la cura era neutra nel verso 1 (quattro nastri su
   quattro identici) e nel verso 2 il gioco di ieri ne leggeva 170 su
   2749, cioe' finiva in una partita diversa. Senza quella misura il
   gioco avrebbe detto NON TORNA a un onesto.

   QUESTO ATTREZZO NON RISCRIVE NIENTE: lancia i due che esistono gia' e
   che fanno esattamente le due domande, coi file di QUESTO cantiere.

     VERSO 1 — LA CURA E' NEUTRA?
       Nastri registrati sul merge-base, rigiocati sul curato. Lo misura
       `_t-144-motorev.js`.

     VERSO 2 — UN TELEFONO RIMASTO INDIETRO CHE COSA LEGGE?
       Un nastro del curato, con dentro le 14 e la 15 di una serie di
       rigori vera fra due telefoni, letto dal gioco di ieri. Lo misura
       `_t-146-motorev.js`, col suo testimone (un nastro sporcato in un
       comando DEVE dare una partita diversa: se non la desse,
       «identici» vorrebbe dire «il banco non guarda»).

   IL MERGE-BASE DI QUESTO CANTIERE E' 999fbf8, e va estratto prima:
     git show 999fbf8:CALCETTO-il-gioco.html > fuori/999fbf8.html

   uso:  node strumenti/_t-147-motorev.js [--vecchio fuori/999fbf8.html]
   esce  0 se MOTORE_V puo' restare 4 · 1 se deve salire ·
         2 se un banco e' esploso · 3 prova nulla
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const VECCHIO = arg('vecchio', 'fuori/999fbf8.html');

if (!fs.existsSync(path.resolve(RADICE, VECCHIO))) {
  console.error('PROVA NULLA: manca il gioco del merge-base: ' + VECCHIO);
  console.error('  si costruisce con:  git show 999fbf8:CALCETTO-il-gioco.html > ' + VECCHIO);
  process.exit(3);
}

function corri(nome, argomenti) {
  console.log('\n===== ' + nome + ' =====');
  const r = spawnSync(process.execPath, argomenti, { cwd: RADICE, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  process.stdout.write(r.stdout || '');
  if (r.stderr) process.stderr.write(r.stderr);
  return r.status;
}

const u1 = corri('VERSO 1 — la cura e\' neutra? (nastri di ieri sul curato)',
  ['strumenti/_t-144-motorev.js', '--vecchio', VECCHIO]);
const u2 = corri('VERSO 2 — che cosa legge un telefono rimasto indietro?',
  ['strumenti/_t-146-motorev.js', '--vecchio', VECCHIO]);

console.log('\n===== IL VERDETTO SU MOTORE_V (voce #147) =====');
if (u1 === 3 || u2 === 3) { console.log('  PROVA NULLA: uno dei due versi non ha misurato niente.'); process.exit(3); }
if (u1 === 2 || u2 === 2) { console.log('  UN BANCO E\' ESPLOSO: non si conclude niente.'); process.exit(2); }
if (u1 === 0 && u2 === 0) {
  console.log('  MOTORE_V PUO\' RESTARE 4, e lo dice la misura nei due versi.');
  console.log('  I tipi 14 e 15 non sono comandi: il gioco di ieri li butta in silenzio —');
  console.log('  deserializza aggiorna i due delta PRIMA di smistare il tipo, quindi una riga');
  console.log('  sconosciuta non sposta di un tick quelle dopo — e rigioca la stessa partita.');
  console.log('  IL PREZZO, dichiarato: un giudice di ieri non controlla le testimonianze.');
  console.log('  Non accusa un innocente (e\' quel che MOTORE_V protegge); assolve un');
  console.log('  colpevole. Per quello c\'e\' DISCHETTO_V, che si accorge PRIMA.');
  process.exit(0);
}
console.log('  MOTORE_V DEVE SALIRE A 5: verso 1 uscita ' + u1 + ', verso 2 uscita ' + u2 + '.');
process.exit(1);
