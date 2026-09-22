/* =====================================================================
   _crit-staffetta-accusa.js — LA STAFFETTA CHE ACCUSA SU UN «NON LO SO»
   (voce #138, compito 1: la versione bugiarda che condanna il banco,
   non la staffetta).

   IL FALSO, ed e' il piu' importante dei sei perche' e' il difetto che
   tutta l'onda D esiste per non fare. Tutto il resto funziona: pesca le
   righe giuste, apre la misura giusta, raggruppa, rispetta il freno,
   tiene il taccuino, riparte bene. Solo che al momento di passare la
   parola ragiona cosi':

     «TORNA vuol dire che torna. Tutto il resto vuol dire che NON torna.»

   E' il ragionamento che sembra prudente — anzi, sembra RIGOROSO — e che
   segna un innocente. Un INCOMPLETO e' un nastro scritto prima di una
   cura, o una finestra di misura diversa, o un registro troncato. Un
   ALTRO MOTORE e' il gioco di ieri. Un NON FINISCE puo' essere un tetto
   nostro troppo stretto. Nessuna delle tre e' un imbroglio, e chi le
   scrive come NON TORNA toglie punti e scrive un sospetto a gente che
   non ha fatto niente.

   COSTRUITO NEL CASO PEGGIORE, e va detto che cosa lo rende cattivo:
   il falso NON tocca il verdetto che la staffetta RIFERISCE. Il referto
   continua a dire INCOMPLETO e ALTRO MOTORE, uno per uno, giusti. Cioe'
   il falso passa B1 (i sei verdetti, uno per uno), passa B6 (manda una
   parola della tavola dei cinque — «NON TORNA» ci sta), passa tutto il
   gruppo A, tutto il D, tutto l'E e tutto l'F. E L'INVARIANTE del #137
   regge lo stesso (B4), perche' il sospetto continua a essere il conto
   delle righe a -1: sono le righe a essere sbagliate.

   Cade solo dove deve: sui CONTI (B2), sul SOSPETTO PER PERSONA (B3) e
   sulle due righe che non dovevano accusare nessuno e sono finite a -1
   (C3, lo schermo ignoto; C5, la finestra sbagliata).

   uso:  node strumenti/_crit-staffetta-accusa.js
   ===================================================================== */
const B = require('./_crit-staffetta.js');

B.falso({
  nome: 'accusa',
  titolo: 'i tre «non lo so» diventano NON TORNA',
  morde: 'MISURATO il 22 settembre 2026: B2, B3, B7 (i conti e il sospetto), C3 e C5 (i due «non lo so» finiti a -1), D3 e D3b (con tutto chiuso non restano ingiudicabili da saltare)',
  cambi: [
    { cerca: B.A_PAROLA,
      metti: "        /* IL FALSO (_crit-staffetta-accusa.js): «TORNA vuol dire che\n" +
             "           torna, tutto il resto vuol dire che NON torna». */\n" +
             "        const parola = String(vv.verdetto || '') === 'TORNA' ? 'TORNA' : 'NON TORNA';" },
  ],
  attesi: [
    [B.A_MISURA, 1],
    [B.A_RICORDA, 1],
    [B.A_FRENO, 1],
    /* il verdetto RIFERITO resta quello vero: e' quel che rende il falso
       cattivo invece che goffo */
    ["const esito = { id: r.id, verdetto: String(vv.verdetto || ''), parola: parola,", 1],
  ],
});
