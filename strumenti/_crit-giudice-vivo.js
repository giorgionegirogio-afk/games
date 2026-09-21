/* =====================================================================
   _crit-giudice-vivo.js — LE ROSE DAL PROFILO DI OGGI
   (voce #133, compito 1: la versione bugiarda del gioco che condanna il
   banco, non il gioco).

   IL FALSO. Il giudice legge ancora il nastro, lo controlla tutto, tira
   fuori le due mentalita' e l'indice di carattere dalla testa di tipo 7
   — e poi manda in campo la rosa del telefono su cui gira invece di
   quella che il nastro porta.

   E' il secondo punto del contratto, ed e' il difetto che il server ha
   per davvero (tiene la squadra di OGGI di chi ha attaccato, non quella
   del giorno della partita: sta scritto accanto a impaccaRosa). Una rosa
   di carriera cresce a ogni partita per disegno, quindi un giudice cosi'
   direbbe NON TORNA a gente che non ha barato.

   Il banco deve restare rosso sulle prove B e B2 — la pagina che non ha
   mai giocato e quella del difensore hanno due rose diverse, e nessuna
   delle due e' quella che ha giocato — e di conseguenza sulla M, perche'
   senza un solo TORNA i cinque verdetti diventano quattro.
   MISURATO (22 settembre 2026): B da' NON TORNA 2-1 contro 3-4 sulla
   pagina del giudice e 1-3 su quella del difensore.

   uso:  node strumenti/_crit-giudice-vivo.js
   ===================================================================== */
require('./_crit-giudice.js').falso({
  nome: 'crit-giudice-vivo',
  titolo: 'le rose escono dal profilo vivo invece che dal nastro',
  morde: "B, B2 (il nastro vero non torna piu') e M",
  cerca: "      mia: { n:'GIUDIZIO A', c1:colA.maglia, c2:colA.calzoncini, pat:0,\n" +
         "             ment:mentAtt, rosa:p1.rosa },",
  metti: "      /* IL FALSO (_crit-giudice-vivo.js): la rosa e' quella di questo\n" +
         "         telefono, non quella del nastro. */\n" +
         "      mia: { n:'GIUDIZIO A', c1:colA.maglia, c2:colA.calzoncini, pat:0,\n" +
         "             ment:mentAtt, rosa:SAVE.rosa },",
  attesi: [
    ['ment:mentDif, car:carDif, rosa:p2.rosa },', 1],   /* l'altra resta dal nastro */
    ["if(dati.length <= p2.fine) return fermo('INCOMPLETO','carattere-assente');", 1],
  ],
});
