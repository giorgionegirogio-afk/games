/* =====================================================================
   _crit-rete-mezzo-giro.js — IL METRO CHE DIMEZZA IL RELAY.

   Un falso per `strumenti/_q-rete-latenza.js`.

   E' IL FALSO CHE SEMBRA RIGORE, e per questo e' il piu' difficile da
   trovare in revisione. Chi lo scrive sta applicando una regola giusta
   nel posto sbagliato, e la sta applicando con orgoglio:

     «quel numero e' un round-trip. A noi serve la SOLA ANDATA. Quindi
      si divide per due, come si e' sempre fatto col ping.»

   Ed e' vero — per un P2P. Fra due pari il percorso utile A->B e' UNA
   gamba, e l'eco A->B->A ne misura due: li' si divide, e il metro
   onesto divide.

   Ma su un RELAY il percorso utile non e' una gamba: e' A->server->B,
   cioe' DUE. E l'eco contro un relay, A->server->A, ne misura
   esattamente due. **Quel numero E' GIA' la sola andata utile.**
   Dividerlo per due non toglie un giro di troppo: toglie una gamba che
   nella partita vera c'e'.

   COSTRUITO NEL CASO PEGGIORE, e i due modi ingenui sono scartati:

     · «dimezza tutto» cadrebbe sul p2p di 0d, dove il dimezzamento e'
       giusto: qui il p2p resta CORRETTO, intatto;
     · «dimezza anche i percentili grezzi» si vedrebbe subito nel
       referto, dove p95 e andata non tornerebbero con le misure: qui i
       percentili grezzi sono quelli veri, ed e' solo la conversione a
       mentire.

   E c'e' un dettaglio che lo rende realistico fino alla crudelta': il
   testo del campo `percorso` continua a dire «nessuna divisione».
   Il commento dice la cosa giusta e il codice fa quella sbagliata —
   che e' il modo in cui questo errore sopravvive alle revisioni, perche'
   chi rilegge legge il commento e passa oltre.

   IL PREZZO DELLA BUGIA, in numeri: su un campione a 240 ms di relay il
   metro onesto stampa D_rete = 15,4 tick (dentro S1, fuori S2) e questo
   ne stampa 7,7 (dentro tutte e due). **Dimezza il verdetto**: fa
   diventare «si con margine» una rete che il margine non ce l'ha.

   CHE COSA DEVE MORDERE: la prova 0d, che guarda le due direzioni
   insieme apposta — relay e p2p sullo stesso numero grezzo — perche'
   un metro che non converte mai e uno che converte sempre sono due
   guasti diversi e vanno distinti.

   uso: node strumenti/_q-rete-latenza.js --bugia strumenti/_crit-rete-mezzo-giro.js
   ===================================================================== */
module.exports = {
  nome: 'rete-mezzo-giro',
  descrizione: 'dimezza il relay «perche\' era un round-trip»: il p2p resta giusto, i percentili grezzi pure',
  morde: ['0d'],
  patch(M) {
    const refertoVero = M.referto;
    M.referto = function (c) {
      const r = refertoVero(c);
      if (r.tipo !== 'relay' || r.causa || !isFinite(r.andata_p95)) return r;
      /* «era un round-trip, lo porto a sola andata» */
      r.fattore = 0.5;
      for (const k of ['andata_p50', 'andata_p95', 'andata_p99', 'andata_pStallo', 'andata_max']) r[k] = r[k] / 2;
      r.buffer = r.andata_p99 - r.andata_p95;
      r.D_rete_ms = r.andata_p95 + r.buffer + M.TICK_MS;
      r.D_rete_tick = r.D_rete_ms / M.TICK_MS;
      r.D_stallo_ms = r.andata_pStallo + M.TICK_MS;
      r.D_stallo_tick = r.D_stallo_ms / M.TICK_MS;
      r.stalloPiuLungo_ms = r.andata_max - r.D_rete_ms;
      /* e il testo del percorso resta quello di prima: dice ancora
         «nessuna divisione», e nessuno lo rilegge */
      return r;
    };
    return M;
  }
};
