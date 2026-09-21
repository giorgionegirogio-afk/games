/* =====================================================================
   _crit-giudice-lento.js — IL TETTO RAGGIUNTO DIVENTA UN'ACCUSA
   (voce #133, compito 1: la versione bugiarda del gioco che condanna il
   banco, non il gioco).

   IL FALSO. Il tetto c'e', il ciclo si ferma quando lo tocca, e il
   verdetto NON FINISCE non esce: si confronta lo stesso il punteggio di
   una partita rimasta a meta' con quello dichiarato, e viene fuori NON
   TORNA.

   E' il terzo punto del contratto rotto nel modo peggiore: NON TORNA e'
   l'unico verdetto che puo' muovere punti, e qui lo si emette su una
   partita che il giudice non ha nemmeno finito di guardare. «Non lo so»
   travestito da «hai barato».

   Il banco deve restare rosso sulle prove I e M.

   uso:  node strumenti/_crit-giudice-lento.js
   ===================================================================== */
require('./_crit-giudice.js').falso({
  nome: 'crit-giudice-lento',
  titolo: 'una rigiocata che non finisce diventa NON TORNA',
  morde: 'I (NON FINISCE) e M (i cinque verdetti)',
  cerca: "  if(!finita) return dico('NON FINISCE','tetto-raggiunto', piu);",
  metti: "  /* IL FALSO (_crit-giudice-lento.js): il verdetto NON FINISCE non\n" +
         "     esce, e si confronta una partita rimasta a meta'. */",
  attesi: [
    ["if(divagata) return dico('INCOMPLETO','duello-senza-righe', piu);", 1],
    ["return dico((gol[0] === gA && gol[1] === gD) ? 'TORNA' : 'NON TORNA', '', piu);", 1],
  ],
});
