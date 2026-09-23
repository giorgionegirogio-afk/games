/* =====================================================================
   _crit-rete-potatore.js — IL METRO CHE TOGLIE I CAMPIONI PEGGIORI
   PRIMA DI CONTARE.

   Un falso per `strumenti/_q-rete-latenza.js`.

   COSTRUITO NEL CASO PEGGIORE, e i due modi ingenui sono scartati:

     · «butta meta' campione» si vedrebbe a occhio nella numerosita':
       qui se ne toglie il 5%, e un campione da 1.900 invece che da
       2.000 non ha mai insospettito nessuno;
     · «tieni solo i migliori» sballerebbe anche la mediana e cadrebbe
       su 0f: qui la mediana, la media e il p50 restano corretti al
       millesimo. Solo la CODA sparisce.

   Toglie il 5% peggiore. E' il gesto piu' innocente del mondo — si
   chiama «togliere gli outlier», ha un nome rispettabile in ogni
   manuale di statistica, e su una distribuzione normale sarebbe persino
   ragionevole. Ma le latenze di rete non sono normali: sono una
   montagna stretta con una coda lunghissima, e **tutto cio' che decide
   se un lockstep si puo' giocare sta in quella coda**. Il p95 stampato
   qui e' in realta' il p90 vero, e il p99,83 — quello da cui dipende lo
   stallo — non esiste piu' affatto, perche' quei pacchetti sono
   precisamente quelli buttati.

   E il numero che stampa e' QUASI GIUSTO: su una rete buona la
   differenza fra il p95 potato e quello vero e' di pochi millisecondi,
   e chi legge non ha modo di accorgersi. La bugia si vede solo dove
   conta, cioe' sulle reti a singhiozzo, cioe' esattamente sulla rete
   mobile italiana che questo cantiere non puo' misurare.

   CHE COSA DEVE MORDERE: la prova 0c. Una distribuzione con il 6% dei
   pacchetti a 900 ms ha il p95 DENTRO la coda, e vale 900. Il potatore
   ne stampa 60.
   (E cade anche su 0i, che e' la prova dello stallo, per la stessa
   ragione: chi pota la coda non vede mai uno stallo. Si dichiara 0c
   perche' e' la prova che guarda il NUMERO invece del verdetto, ed e'
   quella che isola la causa.)

   uso: node strumenti/_q-rete-latenza.js --bugia strumenti/_crit-rete-potatore.js
   ===================================================================== */
module.exports = {
  nome: 'rete-potatore',
  descrizione: 'toglie il 5% peggiore prima di contare: mediana perfetta, coda sparita, stallo invisibile',
  morde: ['0c'],
  patch(M) {
    const refertoVero = M.referto;
    M.referto = function (c) {
      const mis = ((c && c.misure) || []).slice().sort((a, b) => a - b);
      if (mis.length >= 20) {
        const taglia = Math.floor(mis.length * 0.05);
        const potati = mis.slice(0, mis.length - taglia);
        /* «filtra gli outlier, poi calcola le statistiche»: il gesto sta
           in due righe di qualunque foglio di calcolo, e il referto che
           ne esce non ha niente di strano da nessuna parte */
        c = Object.assign({}, c, { misure: potati });
      }
      return refertoVero(c);
    };
    return M;
  }
};
