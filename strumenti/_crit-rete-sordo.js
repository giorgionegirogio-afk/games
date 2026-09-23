/* =====================================================================
   _crit-rete-sordo.js — IL METRO CHE CONTA SOLO I PACCHETTI TORNATI.

   Un falso per `strumenti/_q-rete-latenza.js`.

   E' il difetto di ogni registro che scrive le richieste RIUSCITE: chi
   non e' tornato non lascia una riga, quindi non esiste, quindi la
   perdita e' zero e la coda e' bellissima.

   Su un lockstep e' fatale due volte. **Una**, perche' un pacchetto
   perso e' precisamente uno stallo: e' il caso in cui la simulazione si
   ferma ad aspettare, cioe' la cosa che questo cantiere doveva
   misurare. **Due**, perche' i pacchetti che non tornano non sono
   pescati a caso: sono i piu' lenti, quelli che hanno sforato il tetto.
   Buttarli non toglie rumore — toglie esattamente la coda, e la
   toglie in modo piu' selettivo di quanto sappia fare un potatore.

   COSTRUITO NEL CASO PEGGIORE, e i tre modi ingenui sono scartati:

     · «dichiara perdita zero sempre» cadrebbe su qualunque campione
       senza persi, perche' la perdita zero la' e' giusta e non
       proverebbe niente;
     · «nascondi il numero dei persi» si vedrebbe: qui il conteggio dei
       persi e' RIPORTATO, giusto, in un campo suo. Solo che non entra
       nel conto della percentuale ne' in quello dei percentili;
     · «sbaglia i percentili» cadrebbe su 0c: qui i percentili sui
       tornati sono calcolati alla perfezione.

   Il referto che esce e' coerente con se' stesso in ogni riga: 880
   misure, p50 60 ms, p95 73 ms, coda corta, perdita 0,0%. Non c'e' un
   solo numero che contraddica un altro. Manca solo il fatto che 120
   pacchetti su 1.000 non sono mai arrivati.

   CHE COSA DEVE MORDERE: la prova 0e. Con il 12% perso il p95 chiede il
   rango 950 su mille, e quel rango cade DENTRO i persi: il p95 vale
   infinito, non 73. Un metro che stampa 73 sta dicendo «il 95% dei
   comandi arriva entro 73 ms» di una rete dove il 12% non arriva
   affatto.

   uso: node strumenti/_q-rete-latenza.js --bugia strumenti/_crit-rete-sordo.js
   ===================================================================== */
module.exports = {
  nome: 'rete-sordo',
  descrizione: 'i persi restano scritti in un campo, ma non entrano ne\' nella percentuale ne\' nei percentili',
  morde: ['0e'],
  patch(M) {
    const refertoVero = M.referto;
    M.referto = function (c) {
      const persi = (c && c.persi) | 0;
      if (!persi) return refertoVero(c);
      /* si misura su chi e' tornato — gli altri non hanno lasciato una riga */
      const r = refertoVero(Object.assign({}, c, { persi: 0 }));
      r.persi = persi;                    /* riportato, onestissimo, e inerte */
      r.perditaPct = 0;
      return r;
    };
    return M;
  }
};
