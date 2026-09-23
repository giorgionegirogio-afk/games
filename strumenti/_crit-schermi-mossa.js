/* =====================================================================
   _crit-schermi-mossa.js — L'ATTO SI', IL TRASCINAMENTO NO
   (voce #144, compito 1).

   IL FALSO. Le pose diventano atti risolti, per bene; i MOVIMENTI
   restano in pixel assoluti dello schermo di chi ha registrato. E' la
   mezza implementazione piu' naturale di tutte — «le pose erano il
   problema, i movimenti sono solo delta» — e non e' vero: un movimento
   in pixel assoluti letto a partire da una posa ricostruita altrove fa
   un vettore di levetta che non e' mai esistito.

   Passa il braccio di CONTROLLO, dove il punto ricostruito e quello
   registrato coincidono, e cade su tutti gli altri. Serve anche a una
   seconda cosa: se cadesse anche il controllo, il falso sarebbe rotto
   invece che bugiardo, e non direbbe quale prova morde.

   uso:  node strumenti/_crit-schermi-mossa.js
   ===================================================================== */
const C = require('./_crit-schermi.js');
C.falso({
  nome: 'crit-schermi-mossa',
  titolo: 'le pose sono atti, i trascinamenti restano pixel',
  morde: 'tutti i bracci tranne il controllo (B, C e D di _q-schermi.js)',
  cambi: [
    { nome: 'la porta scrive il pixel del movimento', cerca:
`          const idM = Reg.idDi(a), o = Reg.origine[idM];
          if(o) Reg.scrivi(13, [idM, b - o[0], c - o[1]]);
          else Reg.scrivi(1, [idM, b, c]);`,
      metti:
`          /* IL FALSO (_crit-schermi-mossa.js): lo scostamento non si
             conta, il pixel si scrive tale e quale. */
          const idM = Reg.idDi(a);
          Reg.scrivi(13, [idM, b, c]);` },
    { nome: 'il riproduttore rimette il pixel', cerca:
`        try{ Touch5.move(r[3], o[0] + (r[4]|0), o[1] + (r[5]|0)); } finally { this.squadraOra = -1; }`,
      metti:
`        /* IL FALSO (_crit-schermi-mossa.js): il pixel del registratore
           si rimette dov'era, e l'origine ricostruita non serve a
           niente. */
        try{ Touch5.move(r[3], r[4]|0, r[5]|0); } finally { this.squadraOra = -1; }` },
  ],
});
