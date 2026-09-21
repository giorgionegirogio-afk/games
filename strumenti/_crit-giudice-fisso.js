/* =====================================================================
   _crit-giudice-fisso.js — IL TETTO DI TAGLIA 5 A OGNI TAGLIA
   (voce #133, compito 1: la versione bugiarda del gioco che condanna il
   banco, non il gioco).

   IL FALSO. Il tetto dei fotogrammi torna a essere un numero solo,
   18.000, come prima della voce #130. A taglia 5 non cambia niente —
   tutte le altre prove restano verdi — e a taglia 11 una sfida legittima
   che chieda piu' di 18.000 fotogrammi diventerebbe NON FINISCE.

   E' il difetto che ha aperto il cantiere #130, ripetuto dentro al
   giudice: un tetto tarato su una taglia boccia le altre. NON FINISCE
   non toglie punti, quindi il danno non e' un'accusa — e' una sfida che
   non si riesce mai a verificare, cioe' un buco permanente nella
   classifica alla taglia piu' grande.

   Il banco deve restare rosso sulla sola prova K.

   uso:  node strumenti/_crit-giudice-fisso.js
   ===================================================================== */
require('./_crit-giudice.js').falso({
  nome: 'crit-giudice-fisso',
  titolo: "il tetto e' 18.000 a qualunque taglia",
  morde: 'K (il tetto per taglia)',
  cerca: '  return TETTI_GIUDIZIO[(taglia===7 || taglia===11) ? taglia : 5];',
  metti: '  /* IL FALSO (_crit-giudice-fisso.js): un numero solo, come prima\n' +
         '     della voce #130. */\n' +
         '  return 18000;',
  attesi: [
    ['const TETTI_GIUDIZIO = { 5: 18000, 7: 21000, 11: 27000 };', 1],
    ["if(!finita) return dico('NON FINISCE','tetto-raggiunto', piu);", 1],
  ],
});
