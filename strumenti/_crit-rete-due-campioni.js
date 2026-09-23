/* =====================================================================
   _crit-rete-due-campioni.js — IL METRO CHE DICHIARA VERDE CON DUE
   CAMPIONI.

   Un falso per `strumenti/_q-rete-latenza.js`.

   COSTRUITO NEL CASO PEGGIORE, e i due modi ingenui sono scartati:

     · «accetta qualunque cosa» morirebbe subito contro 0b (la sorgente
       locale) e contro 0j (il percorso che non va fra pari): quelle due
       porte restano APERTE qui dentro, intatte;
     · «inventa i numeri» morirebbe contro 0f (il metro deve variare) e
       contro 0c (la coda): qui i numeri sono quelli onesti, tutti.

   Questo toglie UNA riga sola: il cancello della numerosita'. Tutto il
   resto del metro e' quello vero — i percentili giusti, la coda intera,
   la censura a destra, la conversione giusta per relay e per p2p, il
   verdetto giusto quando il campione e' grande.

   E i due campioni che gli si danno sono BUONI: 40 e 45 ms. Non c'e'
   niente da vedere nei valori. E' il modo in cui questo errore capita
   davvero: si fanno due giri di prova in un pomeriggio, escono bassi, e
   quel numero finisce in un documento e poi in una decisione. La
   dispersione non si guarda perche' con due misure la dispersione non
   si vede.

   Chi scrive un metro cosi' non e' distratto: e' uno che ha misurato
   qualcosa e ha creduto di aver misurato la rete.

   CHE COSA DEVE MORDERE: la prova 0a. Due campioni buoni non fanno un
   p95 — con due misure il novantacinquesimo percentile non ha nemmeno
   un estremo superiore di confidenza, e un numero senza estremo non si
   trascrive da nessuna parte.

   uso: node strumenti/_q-rete-latenza.js --bugia strumenti/_crit-rete-due-campioni.js
   ===================================================================== */
module.exports = {
  nome: 'rete-due-campioni',
  descrizione: 'metro onesto in tutto, tranne il cancello della numerosita\': due misure buone bastano',
  morde: ['0a'],
  patch(M) {
    const giudicaVero = M.giudica;
    M.giudica = function (r) {
      const g = giudicaVero(r);
      /* la porta della sorgente e quella del percorso restano chiuse:
         un falso che le aprisse verrebbe preso da 0b o da 0j, e non
         proverebbe niente sulla numerosita' */
      if (r.causa === 'sorgente-locale' || r.causa === 'percorso-non-fra-pari') return g;
      if (g.esito !== 'PROVA-NULLA') return g;
      if (g.causa !== 'campione-corto' && g.causa !== 'ic-troppo-largo') return g;
      /* «il campione e' corto ma i numeri sono buoni»: si passa oltre,
         e si giudica con le soglie vere. Nessuna cifra e' toccata. */
      const finto = Object.assign({}, r, { nMinimo: 0, icSemiampiezza: 0 });
      return giudicaVero(finto);
    };
    return M;
  }
};
