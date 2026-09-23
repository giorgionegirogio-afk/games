/* =====================================================================
   _crit-motore-accusa.js — SE NE ACCORGE, E ACCUSA LO STESSO
   (voce #142, compito 3: la versione bugiarda del gioco che condanna il
   banco, non il gioco).

   IL FALSO. Il giudice legge l'impronta, la confronta, si accorge
   benissimo che il motore non e' il suo — e invece di dire «non lo so»
   dice NON TORNA, con la causa giusta. Tutto funziona: la riga c'e', il
   confronto c'e', la causa e' vera. Sbaglia solo il VERDETTO, e il
   verdetto e' l'unica cosa che muove punti.

   NON E' UN FALSO DI FANTASIA: E' IL DIFETTO DEL #133, GIA' PAGATO UNA
   VOLTA IN REVISIONE. Un banco che chiedesse soltanto «il verdetto
   cambia quando il motore e' diverso?» passerebbe questo falso a pieni
   voti, e avremmo scritto una cura che continua a togliere i punti a
   due persone e ad alzare un sospetto che non decade mai. La prova deve
   chiedere INCOMPLETO per NOME, non «un verdetto diverso».

   E' CATTIVO ANCHE NELL'ALTRA META': l'astensione per impronta ASSENTE
   resta intatta, quindi la prova E passa. Un falso che rompesse tutte e
   due le strade non direbbe quale prova morde.

   IL BANCO DEVE CADERE SU: A2 (le accuse restano), F (la causa c'e' ma
   il verdetto e' un'accusa), F2 (il referto non porta l'impronta, perche'
   giudica la restituisce solo sugli INCOMPLETO).
   IL BANCO DEVE RESTARE VERDE SU: A1, A1b, B, C, D, E.

   uso:  node strumenti/_crit-motore-accusa.js
   ===================================================================== */
require('./_crit-giudice.js').falso({
  nome: 'crit-motore-accusa',
  titolo: 'il giudice vede il motore diverso e accusa invece di astenersi',
  morde: 'A2, F e F2 di _q-motore-nastro.js',
  cerca: `  if(impNastro !== improntaMotore()) return no('INCOMPLETO','motore-js-diverso');`,
  metti: `  /* IL FALSO (_crit-motore-accusa.js): se ne accorge e accusa lo
     stesso. E' il difetto del #133, e costa i punti a due persone. */
  if(impNastro !== improntaMotore()) return no('NON TORNA','motore-js-diverso');`,
  attesi: [
    ["pezzi.push(dT + ',11,' + dMs + ',' + ((r[3]|0) >>> 0));", 1],
    ['function improntaMotore(){', 1],
    /* l'altra meta' resta in piedi: l'astensione per impronta assente */
    ["  if(!impNastro) return no('INCOMPLETO','motore-js-ignoto');", 1],
  ],
});
