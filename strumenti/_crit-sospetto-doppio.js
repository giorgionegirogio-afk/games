/* =====================================================================
   _crit-sospetto-doppio.js — IL VERDETTO CHE CONTA DUE VOLTE
   (voce #137, compito 1).

   IL FALSO. La tavola dei cinque e' giusta: solo NON TORNA accusa.
   Quello che manca e' la GUARDIA — «questa riga e' gia' stata
   giudicata?» — e senza, il verificatore che ripassa sulla stessa sfida,
   o due processi che partono insieme, tolgono i punti due volte e
   scrivono due sospetti per una partita sola.

   E' il difetto che non si vede mai in prova e che si vede solo in
   produzione, perche' in prova un verdetto si applica una volta. La
   stessa classe di sbaglio che /api/sfida ha gia' pagato: li' l'impegno
   si consuma con un DELETE che restituisce le righe tolte, «cosi'
   sappiamo di essere stati noi a toglierlo».

   Costruito nel caso peggiore: tutto il resto funziona, e il falso e'
   invisibile a chiunque applichi un verdetto una volta sola.

   uso:  node strumenti/_crit-sospetto-doppio.js
   ===================================================================== */
require('./_crit-sospetto.js').falso({
  nome: 'crit-sospetto-doppio',
  titolo: 'un verdetto applicato due volte conta due volte',
  morde: 'B6 (il doppio conteggio), B7 (la riga chiusa che si riapre) e B10 (l\'invariante)',
  file: 'lib/verdetto.js',
  cerca: "  if (s.verificata !== 0) return niente('gia-giudicata');",
  metti: "  /* IL FALSO (_crit-sospetto-doppio.js): la guardia non c'e'. */",
  attesi: [
    ["  'NON TORNA':    { verificata: -1, sospetto: 1, disfa: true  },", 1],
    ["export function conseguenza(verdetto) {", 1],
  ],
});
