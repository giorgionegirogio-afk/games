/* =====================================================================
   _crit-schermi-pixel.js — REGISTRA L'ATTO E RIGIOCA DAL PIXEL
   (voce #144, compito 1).

   IL FALSO. Il nastro porta un atto risolto onesto — squadra, esito,
   disco — e accanto, in coda ai campi, il PIXEL di chi ha registrato. In
   rilettura il riproduttore usa quello invece di chiedere a
   `Touch5.puntoDi` dove cade l'atto su QUESTA geometria.

   E' la cura che passa la revisione a occhio: il formato e' nuovo, i
   campi ci sono tutti, la squadra viaggia. Ed e' esattamente il difetto
   di prima con un vestito nuovo — ed e' il piu' probabile di tutti,
   perche' «tanto il punto ce l'ho gia'» e' la frase che lo produce.

   E QUESTO FALSO HA CONDANNATO IL BANCO PRIMA DI ESSERE CONDANNATO DA
   LUI. Alla prima corsa passava con 21 prove su 24, **identiche a quelle
   della cura onesta**: una volta che l'atto porta l'esito e il disco, il
   punto ricostruito non decide piu' il punteggio, e un banco che
   guardasse solo verdetti e punteggi lo avrebbe promosso. La prova G —
   «dove cade il dito, dopo» — e' nata da questa misura.

   MISURATO dopo la prova G: morde G1, G2, G4, G5 e G6 (259 pose di
   disco su 259 cadono FUORI dal disco che l'atto nomina, la peggiore a
   790 px col pollice al massimo), e lascia verde il controllo G3, dove
   il pixel del registratore e' anche il pixel di chi rilegge.

   uso:  node strumenti/_crit-schermi-pixel.js
   ===================================================================== */
const C = require('./_crit-schermi.js');
C.falso({
  nome: 'crit-schermi-pixel',
  titolo: 'il nastro porta anche il pixel, e la rilettura usa quello',
  morde: 'G1 G2 G4 G5 G6 — cinque prove su trenta, e NON il controllo (MISURATO)',
  cambi: [
    { nome: 'la porta scrive anche il pixel', cerca: C.ANCORA_SCRIVE,
      metti:
`        /* IL FALSO (_crit-schermi-pixel.js): accanto all'atto viaggia
           il pixel del registratore, in coda ai campi. */
        if(Reg.modo === 1) Reg.scrivi(12, [idA, atto.t, atto.esito, atto.slot,
                                           Math.round(atto.ux * 1000), Math.round(atto.uy * 1000), b, c]);` },
    { nome: 'il riproduttore usa il pixel', cerca: C.ANCORA_LEGGE,
      metti:
`      const atto = { t: r[4]|0, esito: r[5]|0, slot: r[6]|0, ux: (r[7]|0)/1000, uy: (r[8]|0)/1000 };
      /* IL FALSO (_crit-schermi-pixel.js): il punto NON si ricostruisce,
         si prende dal nastro — cioe' si rimette dov'era sullo schermo di
         qualcun altro. */
      const p = (r.length > 9) ? [r[9]|0, r[10]|0] : Touch5.puntoDi(atto);` },
    { nome: 'il formato porta i due campi in piu', cerca:
`        pezzi.push(dT + ',12,' + dMs + ',' + id12 + ',' + (r[4]|0) + ',' + (r[5]|0) + ',' +
                   (r[6]|0) + ',' + (r[7]|0) + ',' + (r[8]|0));`,
      metti:
`        pezzi.push(dT + ',12,' + dMs + ',' + id12 + ',' + (r[4]|0) + ',' + (r[5]|0) + ',' +
                   (r[6]|0) + ',' + (r[7]|0) + ',' + (r[8]|0) + ',' + (r[9]|0) + ',' + (r[10]|0));` },
    { nome: 'e la lettura li rimette', cerca:
`        this.righe.push([tick, 12, ms, v[3], v[4], v[5], v[6], v[7], v[8]]);`,
      metti:
`        this.righe.push([tick, 12, ms, v[3], v[4], v[5], v[6], v[7], v[8], v[9], v[10]]);` },
  ],
});
