/* =====================================================================
   _crit-schermi-ricalcola.js — LA SQUADRA VIAGGIA E POI SI BUTTA
   (voce #144, compito 1).

   IL FALSO. L'atto porta la squadra, il nastro la scrive, il formato la
   legge — e poi `applica` non la usa: la ricalcola con `teamOf(x)` dal
   punto ricostruito, cioe' da `innerWidth/2`.

   E' il piu' subdolo dei cinque perche' il campo C'E'. Chi controllasse
   il formato — e il banco lo controlla, prova E2 — lo troverebbe pieno e
   giusto. Il difetto sta un passo piu' in la', dov'e' sempre stato:
   nella deduzione.

   Morde una prova sola, ed e' l'unica che gira in MODALITA' 2: in
   modalita' 1 `teamOf` risponde 0 a qualunque ascissa, quindi
   ricalcolare non costa niente e nessun altro braccio se ne accorge. E'
   anche il motivo per cui la prova F esiste.

   uso:  node strumenti/_crit-schermi-ricalcola.js
   ===================================================================== */
const C = require('./_crit-schermi.js');
C.falso({
  nome: 'crit-schermi-ricalcola',
  titolo: 'la squadra sta nel comando, ma in rilettura si deduce di nuovo dalla x',
  morde: 'F1 e F2, DUE prove su trenta, e nessun altro braccio (MISURATO)',
  cambi: [
    { nome: 'applica deduce la squadra', cerca:
`  applica(id, atto, x, y){
    const t=atto.t;`,
      metti:
`  applica(id, atto, x, y){
    /* IL FALSO (_crit-schermi-ricalcola.js): il campo c'e', si legge, e
       poi si butta — la squadra torna a essere una deduzione da
       innerWidth/2. */
    const t=this.teamOf(x);` },
    { nome: 'e il riproduttore non la impone', cerca:
`      this.squadraOra = atto.t;
      try{ Touch5.avvia(r[3], atto, p[0], p[1]); } finally { this.squadraOra = -1; }`,
      metti:
`      /* IL FALSO (_crit-schermi-ricalcola.js): squadraOra resta spento,
         cosi' anche l'avvolgimento di teamOf torna a dedurre. */
      this.squadraOra = -1;
      try{ Touch5.avvia(r[3], atto, p[0], p[1]); } finally { this.squadraOra = -1; }` },
  ],
});
