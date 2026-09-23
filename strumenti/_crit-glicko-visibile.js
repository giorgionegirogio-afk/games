/* =====================================================================
   _crit-glicko-visibile.js — SI ABBINA COL NUMERO SBAGLIATO (voce #140,
   compito 4). E' IL FALSO CHE CONTA PIU' DI TUTTI, perche' e' quello
   che ASSOMIGLIA A UNA CURA.

   IL FALSO. C'e' tutto, e tutto funziona: i tre numeri di Glicko-2, il
   periodo, la volatilita', le colonne, `posa_nascosto` con la sua
   guardia, il rating che si aggiorna a ogni sfida e non si muove contro
   i fantasmi. C'e' la terza coordinata nella scala, c'e' il gradino
   d'atterraggio, c'e' il pavimento. C'e' `atteso_glicko` in SQL, c'e'
   il predicato in `trova_avversario`, c'e' l'argomento nell'endpoint.

   Solo che l'atteso si calcola sui PUNTI VISIBILI invece che sul rating
   nascosto. Il rating viene tenuto perfettamente aggiornato — e non
   serve a niente.

   E IL FALSO CAMBIA TUTTE E DUE LE LINGUE, JavaScript e SQL, nello
   stesso modo. E' la lezione di `_crit-abbinamento-largo` (voce #137):
   un falso che cambiasse solo il JS cadrebbe sul gruppo D, che confronta
   i due testi, e allora il banco sembrerebbe discriminare mentre in
   realta' starebbe solo notando un'incoerenza. Cambiando tutte e due,
   D e' contento: le due lingue dicono la stessa cosa, e dicono la stessa
   cosa sbagliata.

   Resta in piedi tutto il resto: A, B, D ed E passano interi. Cade solo
   LA MISURA — il gruppo C — perche' i punti visibili non sono un rating
   e abbinare su di loro rende molto meno.

   uso:  node strumenti/_crit-glicko-visibile.js
   ===================================================================== */
require('./_crit-sospetto.js').falso({
  nome: 'crit-glicko-visibile',
  cancello: '_q-glicko.js',
  titolo: 'la terza coordinata c\'e\', ma guarda i punti visibili invece del rating nascosto',
  morde: 'C4 e C6 (la misura). PASSA A, B, D ed E',
  cambi: [
    /* --- 0) l'import, perche' un implementatore vero lo scriverebbe --- */
    {
      file: 'lib/abbinamento.js',
      cerca: "import { atteso } from './glicko.js';",
      metti: "import { atteso, incertezzaDi } from './glicko.js';",
    },
    /* --- 1) il JavaScript --- */
    {
      file: 'lib/abbinamento.js',
      cerca: "  if (!Number.isFinite(gradino.equilibrio)) return true;      /* nessun limite */\n" +
             "  return Math.abs(atteso(io, c) - 0.5) <= gradino.equilibrio;",
      metti: "  if (!Number.isFinite(gradino.equilibrio)) return true;      /* nessun limite */\n" +
             "  /* IL FALSO (_crit-glicko-visibile.js): l'atteso si calcola sui\n" +
             "     PUNTI, non sul rating nascosto. Il rating continua a essere\n" +
             "     tenuto aggiornato con cura, e non serve a niente. */\n" +
             "  return Math.abs(atteso({ nascosto: puntiDi(io) + 500, incertezza: incertezzaDi(io) },\n" +
             "                         { nascosto: puntiDi(c) + 500, incertezza: incertezzaDi(c) }) - 0.5)\n" +
             "         <= gradino.equilibrio;",
    },
    /* --- 2) e l'SQL, nello stesso identico modo, cosi' il gruppo D non
       ha niente da ridire: le due lingue dicono la stessa cosa --- */
    {
      file: 'schema.sql',
      cerca: "       and (equilibrio is null or abs(atteso_glicko(\n" +
             "              mia.nc, mia.ic,\n" +
             "              coalesce(p.nascosto, 1500), coalesce(p.incertezza, 350)\n" +
             "            ) - 0.5) <= equilibrio)",
      metti: "       -- IL FALSO (_crit-glicko-visibile.js): i due primi argomenti\n" +
             "       -- sono i PUNTI, non il rating nascosto. La formula e' la\n" +
             "       -- stessa, la funzione e' la stessa, il JavaScript dice la\n" +
             "       -- stessa cosa: le due lingue concordano, e concordano male.\n" +
             "       and (equilibrio is null or abs(atteso_glicko(\n" +
             "              mia.pt + 500, mia.ic,\n" +
             "              coalesce(p.punti, 1000) + 500, coalesce(p.incertezza, 350)\n" +
             "            ) - 0.5) <= equilibrio)",
    },
  ],
  attesi: [],
});
