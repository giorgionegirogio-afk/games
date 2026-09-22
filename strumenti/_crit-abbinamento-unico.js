/* =====================================================================
   _crit-abbinamento-unico.js — LA FINESTRA GIUSTA CHE LASCIA QUALCUNO
   CON UN AVVERSARIO SOLO (voce #137, compito 2).

   IL FALSO. E' la cura di questo cantiere COME ERA SCRITTA NEL PROGETTO,
   prima che il banco trovasse il prezzo: la scala a due coordinate,
   esatta, senza il pavimento del mazzo. Un gradino si accontenta di
   trovare QUALCUNO.

   E ha numeri MIGLIORI della cura vera: scarto mediano 60 invece di 60,
   abbinamenti entro 150 punti 100% invece di 99%, chiamate al database
   1,00 invece di 1,01. Su ogni grandezza che il progetto aveva previsto
   di misurare, questo falso VINCE.

   Quel che rompe non e' una media: e' il PEGGIO SERVITO. Misurato su
   400 allenatori, avversari distinti in 200 ricerche — oggi il peggio
   servito ne ha 10, con questo falso ne ha UNO. Uno solo, tutte le
   sere. E' esattamente la cosa che l'`order by random()` di
   `trova_avversario` esiste per impedire, arrivata pero' dalla FINESTRA
   invece che dall'ordinamento, cioe' da una porta che nessuno guardava.

   E' il falso che dimostra perche' C7 guarda tutta la popolazione e non
   la media: una cura puo' migliorare ogni numero dichiarato e
   peggiorare la vita di nove persone su quattrocento.

   uso:  node strumenti/_crit-abbinamento-unico.js
   ===================================================================== */
require('./_crit-sospetto.js').falso({
  nome: 'crit-abbinamento-unico',
  titolo: 'la scala giusta, senza il pavimento del mazzo',
  morde: 'C7 (il peggio servito: da sette avversari possibili a uno)',
  file: 'lib/abbinamento.js',
  cerca: "  { forza:  8, punti:  120, minimo: 6 },\n" +
         "  { forza: 20, punti:  300, minimo: 4 },\n" +
         "  { forza: 40, punti:  700, minimo: 2 },",
  metti: "  /* IL FALSO (_crit-abbinamento-unico.js): basta trovarne UNO. Ogni\n" +
         "     numero del progetto migliora, e c'e' chi si ritrova con un\n" +
         "     avversario solo per sempre. */\n" +
         "  { forza:  8, punti:  120, minimo: 1 },\n" +
         "  { forza: 20, punti:  300, minimo: 1 },\n" +
         "  { forza: 40, punti:  700, minimo: 1 },",
  attesi: [
    ["  { forza: 99, punti: Infinity, minimo: 1 },", 1],
    ["export const SOSPETTO_SEPARA = 3;", 1],
  ],
});
