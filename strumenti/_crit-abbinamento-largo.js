/* =====================================================================
   _crit-abbinamento-largo.js — LA DIMENSIONE CHE C'E' E NON FILTRA
   (voce #137, compito 1). E' il falso che conta piu' di tutti, perche'
   e' quello che ASSOMIGLIA A UNA CURA.

   IL FALSO. C'e' tutto: la colonna dei punti nella scala, il parametro
   `banda_punti` che arriva all'SQL, il predicato nello schema, il
   ricontrollo nell'endpoint, i commenti. Solo che le bande sono
   2000/4000/6000 invece di 120/300/700, cioe' piu' larghe dell'intera
   forbice di Elo che una base di giocatori puo' avere. La dimensione
   nuova non esclude mai nessuno.

   PASSA IL GRUPPO A (la tavola dei verdetti non c'entra), PASSA IL
   GRUPPO B (il sospetto funziona), PASSA IL GRUPPO D (lo schema e'
   identico, il predicato c'e', le porte sono chiuse), e passa anche C1,
   C3, C7, C8, C9, C10. Cade soltanto sulla MISURA: C2, C4, C4b, C5.

   E' il difetto che un cancello scritto male non vede MAI, perche' un
   cancello scritto male controlla che il codice ci sia. Questo controlla
   che gli abbinamenti siano davvero piu' vicini, e un numero non si
   lascia convincere da un commento.

   uso:  node strumenti/_crit-abbinamento-largo.js
   ===================================================================== */
require('./_crit-sospetto.js').falso({
  nome: 'crit-abbinamento-largo',
  titolo: 'la dimensione punti c\'e\', ma le bande non filtrano niente',
  morde: 'C2 (i due lontani che restano un abbinamento), C4, C4b e C5 (la misura)',
  file: 'lib/abbinamento.js',
  cerca: "  { forza:  8, punti:  120 },\n" +
         "  { forza: 20, punti:  300 },\n" +
         "  { forza: 40, punti:  700 },",
  metti: "  /* IL FALSO (_crit-abbinamento-largo.js): le bande ci sono, i\n" +
         "     commenti ci sono, il parametro arriva all'SQL — e non escludono\n" +
         "     nessuno, perche' 2000 punti di Elo sono piu' dell'intera forbice\n" +
         "     che una base di giocatori riesce a produrre. */\n" +
         "  { forza:  8, punti: 2000 },\n" +
         "  { forza: 20, punti: 4000 },\n" +
         "  { forza: 40, punti: 6000 },",
  attesi: [
    ["  { forza: 99, punti: Infinity },", 1],
    ["export const SOSPETTO_SEPARA = 3;", 1],
  ],
});
