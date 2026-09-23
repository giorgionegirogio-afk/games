/* =====================================================================
   _crit-giudice-sbadato.js — IL MOTORE DIVERSO NON SI GUARDA
   (voce #133, compito 1: la versione bugiarda del gioco che condanna il
   banco, non il gioco).

   IL FALSO. Il nastro porta la versione del motore, il giudice la legge
   e la mette perfino nel suo esito (`motoreV`) — e non la confronta con
   quella di oggi. Un nastro registrato con un altro motore viene
   rigiocato lo stesso, sugli stessi comandi ma su regole diverse.

   E' la voce #96, chiusa dalla voce #107 e riaperta qui: il punteggio
   che non torna non sarebbe colpa di chi ha giocato, sarebbe colpa del
   gioco cambiato sotto ai suoi comandi. Un verificatore cosi' toglie
   punti a tutti quelli che hanno giocato prima dell'ultimo
   aggiornamento.

   E' costruito nel caso peggiore apposta: il nastro della prova G e' lo
   STESSO nastro vero, con la sola versione cambiata in testa. Rigiocato
   da questo falso torna eccome — quindi la prova G non lo becca per un
   punteggio sbagliato, lo becca perche' il verdetto ALTRO MOTORE non
   esce piu'. Un falso che facesse anche sbagliare il punteggio sarebbe
   piu' facile da prendere, e proverebbe meno.

   Il banco deve restare rosso sulle prove G e M.

   uso:  node strumenti/_crit-giudice-sbadato.js
   ===================================================================== */
require('./_crit-giudice.js').falso({
  nome: 'crit-giudice-sbadato',
  titolo: 'la versione del motore si legge e non si guarda',
  morde: 'G (ALTRO MOTORE) e M (i cinque verdetti)',
  cerca: "  if(motoreV !== MOTORE_V) return fermo('ALTRO MOTORE','motore-diverso');",
  metti: "  /* IL FALSO (_crit-giudice-sbadato.js): la versione si legge, si\n" +
         "     riporta nell'esito, e non si confronta con niente. */\n" +
         "  if(false && motoreV !== MOTORE_V) return fermo('ALTRO MOTORE','motore-diverso');",
  attesi: [
    ['const motoreV = Reg.motoreV|0;', 1],
    ['const MOTORE_V = ', 1],
  ],
});
