/* =====================================================================
   _crit-traslazione-sorda.js — LA TRASLAZIONE CHE NON TRASLA NIENTE.

   Un falso per `strumenti/_q-ritardo.js`. Non e' un gioco bugiardo: e'
   un BANCO bugiardo, perche' qui la cosa che puo' mentire e' il metro.

   COSTRUITO NEL CASO PEGGIORE, e questa e' la parte che conta. Il falso
   ingenuo sarebbe `function(){}`: non tocca niente, e chiunque lo
   scoprirebbe contando le righe mosse. Questo invece MUOVE LE RIGHE — ne
   muove anche piu' dell'onesto — ma muove ESATTAMENTE quelle che non
   ritardano un comando:

     · i metadati (tipi 5, 7, 9, 10): le due rose, lo schermo, il segno
       del duello, la troncatura. `Reg.esegui` non ha un ramo per
       nessuno di questi, quindi spostarne il tick non fa succedere
       niente a nessun tick.
     · il TICK delle righe del dischetto (tipo 6). Queste sembrano
       comandi — lo sono — ma il loro orologio e' `(nDuello, passo)`,
       cioe' `r[3]` e `r[4]`: `Reg.passoDuello` non guarda mai `r[0]`.
       Durante un duello `Reg.tick` sta fermo, perche' `Reg.passo()` gira
       solo dentro `step()`. Traslarne il tick e' scrivere su un campo
       morto.

   RISULTATO: la partita rigiocata e' IDENTICA AL BIT a quella a K=0,
   per qualunque K. Un banco che guardasse solo «quante righe hai
   toccato?» lo promuoverebbe.

   CHE COSA DEVE MORDERE: la prova 0a di `_q-ritardo.js` (LA TRASLAZIONE
   TRASLA DAVVERO), che non conta le righe mosse ma chiede a ciascuna di
   essere mossa NEL CAMPO GIUSTO. E in seconda battuta la prova 5 (il
   banco vede il ritardo?), perche' a 300 ms la fedelta' non cala di un
   millesimo.

   uso: node strumenti/_q-ritardo.js --bugia strumenti/_crit-traslazione-sorda.js
   ===================================================================== */
module.exports = {
  nome: 'traslazione-sorda',
  descrizione: 'muove i metadati e il tick del dischetto, cioe\' i soli campi che nessuno legge',
  /* che cosa DEVE scattare quando questo falso gira */
  morde: ['0a'],
  traslazione: `function(righe, K){
    if(K <= 0) return;
    for(const r of righe){
      const tipo = r[1];
      /* i metadati: esegui() non ha un ramo per 5, 7, 9, 10 */
      if(tipo===5 || tipo===7 || tipo===9 || tipo===10) r[0] += K;
      /* il tick del dischetto: passoDuello legge r[3] e r[4], mai r[0] */
      else if(tipo===6) r[0] += K;
      /* e i comandi veri restano dove sono */
    }
  }`,
};
