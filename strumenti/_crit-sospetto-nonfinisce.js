/* =====================================================================
   _crit-sospetto-nonfinisce.js — «SE NON FINISCE, L'HA COSTRUITA
   APPOSTA» (voce #137, compito 1).

   IL FALSO. Il sospetto sale su NON FINISCE, cioe' quando la rigiocata
   non arriva in fondo entro il tetto della taglia. Sembra il piu'
   difendibile dei tre — un nastro che non finisce mai puo' essere un
   nastro costruito per non finire — e invece e' quello che accusa la
   nostra macchina invece della persona: il tetto e' un numero nostro
   (`TETTI_GIUDIZIO`), e una macchina lenta o un tetto stretto per
   sbaglio producono lo stesso verdetto.

   Il giudice stesso lo dice, e sta scritto nel gioco: «un tetto stretto
   per sbaglio non puo' far danno a nessuno, perche' NON FINISCE non
   muove punti». Questo falso disfa quella frase.

   Due tocchi, come gli altri due fratelli: la tavola che accusa, e
   `applica` che credita il sospetto senza chiudere la riga.

   uso:  node strumenti/_crit-sospetto-nonfinisce.js
   ===================================================================== */
const B = require('./_crit-sospetto.js');

B.falso({
  nome: 'crit-sospetto-nonfinisce',
  titolo: 'il sospetto nasce anche da NON FINISCE',
  morde: 'A4 e A5 (la tavola dei cinque), B5 (i tre «non lo so») e B10 (l\'invariante)',
  file: 'lib/verdetto.js',
  cambi: [
    { cerca: "  'NON FINISCE':  { verificata:  0, sospetto: 0, disfa: false },",
      metti: "  /* IL FALSO (_crit-sospetto-nonfinisce.js): un «non lo so» accusa. */\n" +
             "  'NON FINISCE':  { verificata:  0, sospetto: 1, disfa: false }," },
    { cerca: B.GATE_CERCA, metti: B.GATE_METTI },
  ],
  attesi: [
    ["  'NON TORNA':    { verificata: -1, sospetto: 1, disfa: true  },", 1],
    ["  'INCOMPLETO':   { verificata:  0, sospetto: 0, disfa: false },", 1],
    ["  'ALTRO MOTORE': { verificata:  0, sospetto: 0, disfa: false },", 1],
  ],
});
