/* =====================================================================
   _crit-giudice-cieco.js — IL GIUDICE CHE DICE SEMPRE DI SI'
   (voce #133, compito 1: la versione bugiarda del gioco che condanna il
   banco, non il gioco).

   IL FALSO. Tutto il resto del giudice funziona: il nastro si legge, le
   rose escono dal nastro, i rifiuti rifiutano, il tetto e' quello della
   taglia, il salvataggio non si muove. Solo l'ultima riga — quella in
   cui il verdetto nasce dal confronto — dice TORNA comunque.

   E' il modo piu' facile di costruire un verificatore che non verifica:
   la classifica resterebbe sporca e nessuna prova di forma se ne
   accorgerebbe. Il banco deve restare rosso sulle prove C, H e M.

   uso:  node strumenti/_crit-giudice-cieco.js
         node strumenti/_crit-giudice-cieco.js --out fuori/x.html
   ===================================================================== */
require('./_crit-giudice.js').falso({
  nome: 'crit-giudice-cieco',
  titolo: 'il giudice dice sempre TORNA',
  morde: 'C (punteggio gonfiato), H (altro seme) e M (i cinque verdetti)',
  cerca: "  return dico((gol[0] === gA && gol[1] === gD) ? 'TORNA' : 'NON TORNA', '', piu);",
  metti: "  /* IL FALSO (_crit-giudice-cieco.js): il confronto non si fa. */\n" +
         "  return dico('TORNA', '', piu);",
  attesi: [
    ["if(!finita) return dico('NON FINISCE','tetto-raggiunto', piu);", 1],
    ["if(motoreV !== MOTORE_V) return fermo('ALTRO MOTORE','motore-diverso');", 1],
  ],
});
