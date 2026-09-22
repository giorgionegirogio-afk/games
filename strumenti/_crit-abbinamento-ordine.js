/* =====================================================================
   _crit-abbinamento-ordine.js — IL PIU' VICINO, SEMPRE
   (voce #137, compito 1).

   IL FALSO. Invece di sorteggiare dentro la banda, prende il candidato
   col punteggio piu' vicino al proprio. Gli abbinamenti diventano
   ANCORA piu' stretti — la prova di vicinanza la passa a mani basse, con
   numeri migliori di quelli della cura vera — e la cosa che si rompe non
   e' un numero: e' che due giocatori della stessa fascia si incontrano
   all'infinito. Sempre lo stesso avversario, partita dopo partita.

   E' l'`order by random()` di `trova_avversario`, e il perche' e'
   scritto sopra quella funzione dal primo giorno: «se prendessimo
   sempre il piu' vicino, due giocatori della stessa fascia si
   incontrerebbero all'infinito».

   E' il falso che dimostra che un banco fatto solo di soglie sul
   «quanto sono vicini» premierebbe un difetto. Deve cadere su C7, e
   passare tutto il resto — misura compresa.

   uso:  node strumenti/_crit-abbinamento-ordine.js
   ===================================================================== */
require('./_crit-sospetto.js').falso({
  nome: 'crit-abbinamento-ordine',
  titolo: 'dentro la banda prende il piu\' vicino invece di sorteggiare',
  morde: 'C7 (la varieta\': duecento ricerche, un avversario solo)',
  file: 'lib/abbinamento.js',
  cerca: "    const scelto = buoni[Math.floor(dado() * buoni.length)];",
  metti: "    /* IL FALSO (_crit-abbinamento-ordine.js): il piu' vicino, sempre.\n" +
         "       I numeri della vicinanza MIGLIORANO, e due della stessa fascia\n" +
         "       si incontrano per sempre. */\n" +
         "    const scelto = buoni.slice().sort((x, y) =>\n" +
         "      Math.abs(puntiDi(x) - puntiDi(io)) - Math.abs(puntiDi(y) - puntiDi(io)))[0];",
  attesi: [
    ["  { forza: 99, punti: Infinity },", 1],
    ["export function ammissibile(io, c, gradino) {", 1],
  ],
});
