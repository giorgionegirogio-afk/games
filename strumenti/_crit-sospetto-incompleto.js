/* =====================================================================
   _crit-sospetto-incompleto.js — IL SOSPETTO CHE NASCE DA UN «NON LO SO»
   (voce #137, compito 1: la versione bugiarda del server che condanna il
   banco, non il server).

   IL FALSO, ed e' il piu' importante dei sette perche' e' il difetto che
   questo cantiere esiste per non fare. Tutto il resto funziona: i
   verdetti sono cinque, TORNA chiude la riga, NON TORNA disfa i punti,
   la guardia contro il doppio conteggio regge, l'abbinamento e' quello
   nuovo, lo schema e' chiuso. Solo INCOMPLETO — «il nastro non basta a
   decidere» — alza il sospetto, «perche' se il nastro non basta
   qualcosa avranno da nascondere».

   E' il ragionamento che sembra prudente e che segna un innocente: un
   nastro incompleto e' un nastro scritto prima di una cura, o una
   finestra di misura diversa, o un registro troncato. Nessuna delle tre
   e' un imbroglio.

   E' costruito nel CASO PEGGIORE: `verificata` resta 0 e i punti non si
   muovono, quindi il falso passa B1, B2, B6, B7, B8, B9, B11, B12 e
   tutto il gruppo C e il gruppo D. Cade solo dove deve.

   uso:  node strumenti/_crit-sospetto-incompleto.js
   ===================================================================== */
require('./_crit-sospetto.js').falso({
  nome: 'crit-sospetto-incompleto',
  titolo: 'il sospetto nasce anche da INCOMPLETO',
  morde: 'A4 e A5 (la tavola dei cinque), B5 (i tre «non lo so») e B10 (l\'invariante)',
  file: 'lib/verdetto.js',
  cerca: "  'INCOMPLETO':   { verificata:  0, sospetto: 0, disfa: false },",
  metti: "  /* IL FALSO (_crit-sospetto-incompleto.js): un «non lo so» accusa. */\n" +
         "  'INCOMPLETO':   { verificata:  0, sospetto: 1, disfa: false },",
  attesi: [
    ["  'NON TORNA':    { verificata: -1, sospetto: 1, disfa: true  },", 1],
    ["  'ALTRO MOTORE': { verificata:  0, sospetto: 0, disfa: false },", 1],
    ["  'NON FINISCE':  { verificata:  0, sospetto: 0, disfa: false },", 1],
  ],
});
