/* =====================================================================
   _crit-sospetto-incompleto.js — IL SOSPETTO CHE NASCE DA UN «NON LO SO»
   (voce #137, compito 1: la versione bugiarda del server che condanna il
   banco, non il server).

   IL FALSO, ed e' il piu' importante degli otto perche' e' il difetto che
   questo cantiere esiste per non fare. Tutto il resto funziona: i
   verdetti sono cinque, TORNA chiude la riga, NON TORNA disfa i punti e
   accusa, la guardia contro il doppio conteggio regge, l'abbinamento e'
   quello nuovo, lo schema e' chiuso, il sospetto non esce. Solo
   INCOMPLETO — «il nastro non basta a decidere» — alza il sospetto,
   «perche' se il nastro non basta qualcosa avranno da nascondere».

   E' il ragionamento che sembra prudente e che segna un innocente: un
   nastro incompleto e' un nastro scritto prima di una cura, o una
   finestra di misura diversa, o un registro troncato. Nessuna delle tre
   e' un imbroglio.

   COSTRUITO NEL CASO PEGGIORE, e i due tocchi servono tutti e due:

     1. la tavola dice che INCOMPLETO vale un sospetto — ma da sola non
        basterebbe a far danno, perche' `applica` si ferma prima sui «non
        lo so» e il falso resterebbe visibile solo al gruppo A;
     2. `applica` lo credita lo stesso, SENZA chiudere la riga. E' la
        versione «prudente» che qualcuno scriverebbe davvero — «non
        decido, ma me lo segno» — ed e' quella che accusa un innocente
        senza lasciare traccia nella colonna, cioe' rompendo l'invariante
        che rende un'accusa riproducibile.

   `verificata` resta 0 e i punti non si muovono, quindi il falso passa
   B1, B2, B6, B7, B8, B9, B11, B12, tutto il gruppo C e tutto il gruppo
   D. Cade solo dove deve.

   uso:  node strumenti/_crit-sospetto-incompleto.js
   ===================================================================== */
const B = require('./_crit-sospetto.js');

B.falso({
  nome: 'crit-sospetto-incompleto',
  titolo: 'il sospetto nasce anche da INCOMPLETO',
  morde: 'A4 e A5 (la tavola dei cinque), B5 (i tre «non lo so») e B10 (l\'invariante)',
  file: 'lib/verdetto.js',
  cambi: [
    { cerca: "  'INCOMPLETO':   { verificata:  0, sospetto: 0, disfa: false },",
      metti: "  /* IL FALSO (_crit-sospetto-incompleto.js): un «non lo so» accusa. */\n" +
             "  'INCOMPLETO':   { verificata:  0, sospetto: 1, disfa: false }," },
    { cerca: B.GATE_CERCA, metti: B.GATE_METTI },
  ],
  attesi: [
    ["  'NON TORNA':    { verificata: -1, sospetto: 1, disfa: true  },", 1],
    ["  'ALTRO MOTORE': { verificata:  0, sospetto: 0, disfa: false },", 1],
    ["  'NON FINISCE':  { verificata:  0, sospetto: 0, disfa: false },", 1],
  ],
});
