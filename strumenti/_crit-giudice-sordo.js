/* =====================================================================
   _crit-giudice-sordo.js — IL RIPIEGO DI Sfida.guarda DENTRO AL GIUDICE
   (voce #133, compito 1: la versione bugiarda del gioco che condanna il
   banco, non il gioco).

   IL FALSO, ed e' il piu' insidioso dei sette perche' e' PLAUSIBILE:
   quando la testa di tipo 7 manca, invece di rifiutare si fa quel che fa
   Sfida.guarda — si ripiega sul profilo di oggi. Li' e' la scelta
   giusta: meglio un film approssimato che nessun film. Qui no: un film
   approssimato costa niente, un verdetto approssimato costa punti a
   qualcuno.

   E' costruito nel caso peggiore: il nastro vero continua a tornare (la
   testa c'e' e vince lei), quindi B, B2 e C restano VERDI. Un falso che
   rompe anche l'asse principale non direbbe quale prova morde — e' il
   rilievo che la revisione della voce #132 ha gia' pagato una volta. Il
   banco deve restare rosso sulla sola prova F.

   uso:  node strumenti/_crit-giudice-sordo.js
   ===================================================================== */
require('./_crit-giudice.js').falso({
  nome: 'crit-giudice-sordo',
  titolo: 'senza la testa di tipo 7 si ripiega sul profilo vivo invece di rifiutare',
  morde: 'F (rose-assenti)',
  cerca: "  if(!(dati && dati.length > 6)) return fermo('INCOMPLETO','rose-assenti');",
  metti: "  /* IL FALSO (_crit-giudice-sordo.js): il ripiego di Sfida.guarda,\n" +
         "     portato dentro al giudice. */\n" +
         "  if(!(dati && dati.length > 6))\n" +
         "    dati = [0,7,0,1,1].concat(impaccaRosa(SAVE.rosa), impaccaRosa(SAVE.rosa), [-1]);",
  attesi: [
    ["if(righe === 0) return fermo('INCOMPLETO','nastro-vuoto');", 1],
    ["if(Reg.troncato) return fermo('INCOMPLETO','nastro-troncato');", 1],
  ],
});
