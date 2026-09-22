/* =====================================================================
   _crit-giudice-accusa.js — IL «NON LO SO» CHE DIVENTA UN'ACCUSA
   (voce #133, correzione di revisione, IMPORTANTE-2: la versione
   bugiarda del gioco che condanna il banco, non il gioco).

   IL FALSO. Il ramo che intercetta il «non lo so» della rigiocata
   (Giudizio.divagata, alzata da startFreeKick quando la rigiocata
   raggiunge un calcio piazzato di cui il nastro non ha i comandi — grep
   «IL GIUDICE NON HA UNO SCHERMO DOVE FERMARSI») non ritorna piu':
   giudica() cade nel confronto finale come se avesse visto tutta la
   partita, e un pareggio a meta' strada diventa un verdetto vero e
   proprio — NON TORNA, quasi sempre, perche' la partita si e' fermata
   prima del fischio.

   PERCHE' SERVE. La revisione finale del cantiere ha trovato che
   NESSUNA prova condannava questo cammino: due mutanti equivalenti a
   questo (uno su 'divagata', uno su 'rigiocata-esplosa') passavano
   18/18. La prova B) non lo vede perche' il nastro vero del banco non
   passa MAI da un duello senza righe; serviva un nastro che lo
   garantisse — la fixture _nastro-duello-congelato.js, con un duello
   naturale dal dischetto, giudicata SENZA le righe di quel duello
   (prova S di _q-giudice.js).

   Il banco deve restare rosso SOLO sulla prova S, e VERDE su tutte le
   altre: il falso morde il cammino giusto, non tutto il giudice.

   uso:  node strumenti/_crit-giudice-accusa.js
   ===================================================================== */
require('./_crit-giudice.js').falso({
  nome: 'crit-giudice-accusa',
  titolo: 'il "non lo so" della rigiocata diventa un\'accusa vera e propria',
  morde: 'S (la sfida congelata senza duello, che ora accusa invece di dire INCOMPLETO/duello-senza-righe)',
  cerca: "  if(divagata) return dico('INCOMPLETO','duello-senza-righe', piu);",
  metti: "  /* IL FALSO (_crit-giudice-accusa.js): il \"non lo so\" della\n" +
         "     rigiocata (Giudizio.divagata) non ferma piu' niente -- il\n" +
         "     giudice accusa come se avesse visto tutta la partita. */\n" +
         "  if(false) return dico('INCOMPLETO','duello-senza-righe', piu);",
  attesi: [
    ["if(false) return dico('INCOMPLETO','duello-senza-righe', piu);", 1],
    /* quel che NON deve essere cambiato: l'altro «non lo so» resta intatto */
    ["if(scoppio) return dico('INCOMPLETO','rigiocata-esplosa', Object.assign({ errore:scoppio }, piu));", 1],
  ],
});
