/* =====================================================================
   _crit-glicko-cresce.js — L'INCERTEZZA CHE VA DALLA PARTE SBAGLIATA
   (voce #140, compito 4).

   IL FALSO. La deviation nuova e' calcolata bene — serve al rating, e
   il rating deve restare giusto, se no il falso si tradirebbe subito —
   ma quella RESTITUITA si specchia dall'altra parte del punto di
   partenza: invece di 151,52 esce 248,48, cioe' «giocare mi ha reso
   meno sicuro di te». E' un segno invertito su una riga sola, ed e'
   esattamente il genere di errore che passa una rilettura.

   COSTRUITO NEL CASO PEGGIORE. Il rating resta ESATTO: A9 (r' =
   1464,06) passa, e passa anche tutto il gruppo che guarda dove va il
   rating — battere un forte, battere un debole, la simmetria del segno,
   la volatilita'. Niente NaN, niente numeri assurdi, il tetto e il
   pavimento funzionano ancora. Un falso che facesse esplodere i numeri
   non proverebbe niente: proverebbe solo che il banco sa accorgersi di
   un infinito.

   Morde A8 — cioe' il riferimento pubblicato — e la famiglia di prove
   sulla certezza che si impara. E' la firma che lo identifica: **il
   rating e' giusto, la certezza va dalla parte sbagliata**.

   uso:  node strumenti/_crit-glicko-cresce.js
   ===================================================================== */
require('./_crit-sospetto.js').falso({
  nome: 'crit-glicko-cresce',
  cancello: '_q-glicko.js',
  titolo: 'l\'incertezza cresce invece di calare quando giochi',
  morde: 'A8 (RD\' del paper) e la famiglia della certezza che si impara. PASSA A9: il rating resta esatto',
  file: 'lib/glicko.js',
  cerca: "  const incertezza = Math.min(RD0, Math.max(RD_MIN, grezza));",
  metti: "  /* IL FALSO (_crit-glicko-cresce.js): la deviation si specchia\n" +
         "     dall'altra parte del punto di partenza. Il rating resta esatto\n" +
         "     — e' calcolato da `grezza`, che non si tocca — e soltanto la\n" +
         "     certezza va dalla parte sbagliata: giocare rende il sistema\n" +
         "     meno sicuro invece che piu' sicuro. Un segno invertito su una\n" +
         "     riga sola. */\n" +
         "  const incertezza = Math.min(RD0, Math.max(RD_MIN, 2 * rd - grezza));",
  attesi: [
    ["export function inattivo(me, periodi) {", 1],
    ["export const TAU = 0.5;", 1],
    ["const sigma2 = nuovaVolatilita(phi, v, delta, sigma, TAU);", 1],
    ["const phi2 = 1 / Math.sqrt(1 / (phiStar * phiStar) + 1 / v);", 1],
  ],
});
