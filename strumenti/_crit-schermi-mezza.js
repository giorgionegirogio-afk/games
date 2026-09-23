/* =====================================================================
   _crit-schermi-mezza.js — LA MEZZA CURA
   (voce #144, compito 1). **E' il falso che conta.**

   IL FALSO. Il punto non viaggia piu' in pixel assoluti: viaggia in
   pixel contati dall'ANGOLO in basso a destra della finestra, cioe'
   `VW - x` e `VH - y`. E' esatta come cura del canale della FINESTRA, e
   non per caso: i dischi sono ancorati proprio a quell'angolo
   (`x = bx + s*64`, `y = VH - 60`), quindi un punto contato di li' cade
   sullo stesso disco a 800x360, a 844x390, a 915x412 e a 1280x720.

   E lascia aperti gli altri due canali, che dall'angolo non dipendono:
   il POLLICE, che scala i raggi e allontana i centri, e la TACCA, che
   sposta tutto il grappolo di trentacinque pixel verso il campo.

   E' LA CURA CHE CHIUNQUE SCRIVEREBBE leggendo solo il #133, che parla
   di `innerWidth`/`innerHeight` e non nomina ne' il pollice ne' la
   tacca. Se il banco la promuovesse, la voce #144 spedirebbe un canale
   chiuso su tre e lo dichiarerebbe chiuso — e nel live 1v1 gli altri due
   sono esattamente quelli che due telefoni diversi hanno per forza.

   uso:  node strumenti/_crit-schermi-mezza.js
   ===================================================================== */
const C = require('./_crit-schermi.js');
C.falso({
  nome: 'crit-schermi-mezza',
  titolo: 'normalizza solo la finestra, e lascia aperti pollice e tacca',
  morde: 'i due bracci gemelli (B5 B6 C5 C6 e D), NON quelli di sola finestra',
  cambi: [
    { nome: 'la porta scrive il punto dall angolo', cerca: C.ANCORA_SCRIVE,
      metti:
`        /* IL FALSO (_crit-schermi-mezza.js): il punto si conta
           dall'angolo della finestra invece che dalla geometria dei
           comandi. Chiude la finestra, lascia aperti pollice e tacca. */
        if(Reg.modo === 1) Reg.scrivi(12, [idA, atto.t, atto.esito, atto.slot,
                                           Math.round(VW - b), Math.round(VH - c)]);` },
    { nome: 'il riproduttore conta dall angolo', cerca: C.ANCORA_LEGGE,
      metti:
`      const atto = { t: r[4]|0, esito: r[5]|0, slot: r[6]|0, ux: (r[7]|0)/1000, uy: (r[8]|0)/1000 };
      /* IL FALSO (_crit-schermi-mezza.js): il punto si rifa' dall'angolo
         della finestra di qui, e la geometria dei comandi non si guarda
         nemmeno. */
      const p = [Math.round(VW - (r[7]|0)), Math.round(VH - (r[8]|0))];` },
  ],
});
