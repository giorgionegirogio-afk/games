/* =====================================================================
   _crit-glicko-sorda.js — IL TERZO NUMERO CHE NON SI MUOVE MAI (voce
   #140, compito 4).

   IL FALSO. La volatilita' c'e': sta nella firma, sta nella colonna,
   viaggia avanti e indietro, entra nel passo 6 come phi* = sqrt(phi^2 +
   sigma^2). Solo che non si ricalcola: resta 0,06 per sempre, per
   tutti. E' un Glicko-1 con tre colonne — che e' precisamente il
   sistema che il mandato chiede di SUPERARE.

   ED E' IL FALSO CHE PASSA IL GRUPPO A, il che lo rende il piu' utile
   dei sei. Nell'esempio lavorato di Glickman la volatilita' nuova vale
   0,059996 e il paper la stampa 0,05999: la differenza fra ricalcolarla
   e lasciarla a 0,06 e' quattro milionesimi, sotto la precisione con
   cui il riferimento e' pubblicato. Una verifica contro il paper, DA
   SOLA, non lo vede — e r' e RD' escono giusti alla seconda cifra.

   E' la ragione per cui il gruppo B esiste: contro il riferimento si
   verifica la matematica, ma le PROPRIETA' si misurano a parte. Qui
   basta guardare il verso: la volatilita' deve salire su chi da'
   risultati assurdi e scendere su chi e' regolare. Con questo falso
   sono tutte e due esattamente 0,06, per sempre.

   uso:  node strumenti/_crit-glicko-sorda.js
   ===================================================================== */
require('./_crit-sospetto.js').falso({
  nome: 'crit-glicko-sorda',
  cancello: '_q-glicko.js',
  titolo: 'la volatilita\' c\'e\', viaggia, entra nel conto — e non cambia mai',
  morde: 'B8 e B8b (la volatilita\' che si muove). PASSA il gruppo A',
  file: 'lib/glicko.js',
  cerca: "  const sigma2 = nuovaVolatilita(phi, v, delta, sigma, TAU);",
  metti: "  /* IL FALSO (_crit-glicko-sorda.js): il terzo numero resta quello\n" +
         "     di partenza, sempre. Entra ancora nel passo 6 (phi* = sqrt(phi^2\n" +
         "     + sigma^2)), quindi il conto continua a tornare — e nell'esempio\n" +
         "     del paper la differenza e' di quattro milionesimi, sotto la\n" +
         "     precisione con cui il riferimento e' pubblicato. */\n" +
         "  const sigma2 = sigma;",
  attesi: [
    ["export function nuovaVolatilita(phi, v, delta, sigma, tau) {", 1],
    ["const phiStar = Math.sqrt(phi * phi + sigma2 * sigma2);", 1],
    ["export function inattivo(me, periodi) {", 1],
  ],
});
