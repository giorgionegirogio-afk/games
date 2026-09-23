/* =====================================================================
   _crit-motore-piatto.js — UN'IMPRONTA CHE DICE SEMPRE «STESSO MOTORE»
   (voce #142, compito 3: la versione bugiarda del gioco che condanna il
   banco, non il gioco).

   IL FALSO, ED E' QUELLO CHE UN PROGETTISTA IN BUONA FEDE SCRIVEREBBE
   DAVVERO. L'impronta si calcola, si scrive, si legge, il giudice la
   confronta e si astiene come deve: tutta la meccanica e' giusta. Solo,
   le funzioni campionate sono `Math.pow` e `Math.sqrt` — e IEEE-754
   obbliga proprio quelle due a essere CORRETTAMENTE ARROTONDATE, cioe' a
   dare lo stesso bit su qualunque motore conforme.

   Quindi l'impronta e' identica ovunque, il confronto e' sempre vero, il
   giudice non si astiene mai, e l'onesto con l'iPhone continua a perdere
   i punti — con in piu' una riga nel nastro che promette una protezione
   che non c'e'. E' l'attestato perfetto: sembra una misura e non misura
   niente.

   NON E' UN'IPOTESI: E' MISURATO. Un'impronta di sole pow e sqrt vale
   1634607669 su Chromium, su WebKit e su Firefox — lo stesso numero
   (fuori/_sonda-142c.js, voce #142). Le sette funzioni vere valgono
   3274447767, 4281245088 e 1495105755.

   IL BANCO DEVE CADERE SU: C (l'impronta non separa i tre motori), A2
   (il giudice non si astiene e torna ad accusare), F e F2.
   IL BANCO DEVE RESTARE VERDE SU: A1, A1b, B, D (e' stabilissima: e'
   sempre lo stesso numero) ed E (senza la riga 11 ci si astiene ancora).

   uso:  node strumenti/_crit-motore-piatto.js
   ===================================================================== */
require('./_crit-giudice.js').falso({
  nome: 'crit-motore-piatto',
  titolo: 'l\'impronta usa solo pow e sqrt, che sono identiche su ogni motore',
  morde: 'C, A2, F e F2 di _q-motore-nastro.js',
  cerca: `    const v = i * 0.7310127 + 0.13;
    m(Math.hypot(v, v * 1.7));
    m(Math.sin(v));
    m(Math.cos(v));
    m(Math.tan(v));
    m(Math.exp(-v * 0.1));
    m(Math.atan2(v, v * 0.37 - 1.1));
    m(Math.log(v + 1));`,
  metti: `    /* IL FALSO (_crit-motore-piatto.js): sette funzioni come prima,
       ma tutte costruite su pow e sqrt, che IEEE-754 obbliga a essere
       correttamente arrotondate. L'impronta e' perfetta, stabile,
       lunga trentadue bit — e uguale su ogni motore del mondo. */
    const v = i * 0.7310127 + 0.13;
    m(Math.pow(v, 2));
    m(Math.sqrt(v));
    m(Math.sqrt(v * v + (v * 1.7) * (v * 1.7)));
    m(Math.pow(0.35, 3));
    m(Math.sqrt(v + 1) * 2);
    m(Math.pow(v, 0.5) - 1);
    m(Math.sqrt(v * 0.37 + 1.1));`,
  attesi: [
    ["pezzi.push(dT + ',11,' + dMs + ',' + ((r[3]|0) >>> 0));", 1],
    ['function improntaMotore(){', 1],
    /* il giudice guarda eccome: e' l'impronta a essere cieca */
    ["  if(impNastro !== improntaMotore()) return no('INCOMPLETO','motore-js-diverso');", 1],
    ["  if(!impNastro) return no('INCOMPLETO','motore-js-ignoto');", 1],
  ],
});
