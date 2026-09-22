/* =====================================================================
   _crit-sospetto-altromotore.js — «SE HA UN ALTRO MOTORE, QUALCOSA
   NASCONDE» (voce #137, compito 1).

   IL FALSO. Il sospetto sale su ALTRO MOTORE, cioe' su un nastro scritto
   con un `MOTORE_V` diverso da quello di oggi. E' il ragionamento piu'
   seducente dei tre, perche' un motore diverso PUO' essere un motore
   modificato — ma e' quasi sempre il contrario: e' il gioco di ieri, non
   ancora aggiornato, o un nastro rimasto in coda da prima di una cura.
   La versione del motore e' finita nel nastro (voce #96) proprio per
   poter dire «non e' confrontabile» invece di dire «non torna»: usarla
   per accusare disfa la ragione per cui e' li'.

   Due tocchi, come gli altri due fratelli: la tavola che accusa, e
   `applica` che credita il sospetto senza chiudere la riga — la versione
   «non decido, ma me lo segno», che e' quella che fa danno davvero.

   uso:  node strumenti/_crit-sospetto-altromotore.js
   ===================================================================== */
const B = require('./_crit-sospetto.js');

B.falso({
  nome: 'crit-sospetto-altromotore',
  titolo: 'il sospetto nasce anche da ALTRO MOTORE',
  morde: 'A4 e A5 (la tavola dei cinque), B5 (i tre «non lo so») e B10 (l\'invariante)',
  file: 'lib/verdetto.js',
  cambi: [
    { cerca: "  'ALTRO MOTORE': { verificata:  0, sospetto: 0, disfa: false },",
      metti: "  /* IL FALSO (_crit-sospetto-altromotore.js): un «non lo so» accusa. */\n" +
             "  'ALTRO MOTORE': { verificata:  0, sospetto: 1, disfa: false }," },
    { cerca: B.GATE_CERCA, metti: B.GATE_METTI },
  ],
  attesi: [
    ["  'NON TORNA':    { verificata: -1, sospetto: 1, disfa: true  },", 1],
    ["  'INCOMPLETO':   { verificata:  0, sospetto: 0, disfa: false },", 1],
    ["  'NON FINISCE':  { verificata:  0, sospetto: 0, disfa: false },", 1],
  ],
});
