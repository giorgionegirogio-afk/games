/* =====================================================================
   _crit-staffetta-numero.js — LA STAFFETTA CHE MANDA IL NUMERO
   (voce #138, compito 1).

   IL FALSO. Invece della parola manda il valore della colonna: 1 per
   TORNA, -1 per NON TORNA, 0 per gli altri tre. E' la traduzione che
   sembra ovvia — «tanto nel database e' un int» — e che la voce #137 ha
   scritto di non volere, con queste parole, sopra `segna_verdetto`:

     «Chi scrivera' il verificatore differito potrebbe sbagliare a
      chiamare conseguenza() e passare un -1 a mano; questa funzione non
      gli crederebbe comunque, perche' non accetta -1 — accetta la
      parola 'NON TORNA'.»

   QUESTO FALSO E' QUEL CHIAMANTE. Serve a far vedere che le due porte
   non sono una ripetizione per sbaglio: il database non gli crede, e
   NESSUNA riga si chiude. Il difetto e' piu' silenzioso di quel che
   sembra — non accusa nessuno, non perde nessuna riga, non rompe
   nessuna invariante: fa semplicemente **zero lavoro**, e la coda a
   `verificata = 0` resta tale e quale mentre il referto racconta sei
   verdetti giusti.

   COSTRUITO NEL CASO PEGGIORE: il verdetto RIFERITO resta quello vero
   (B1 passa, il gruppo A passa, il gruppo C passa sui verdetti), il
   taccuino si riempie regolarmente (D passa: le righe non si perdono e
   non si raddoppiano), il freno si rispetta (E passa), le porte restano
   chiuse (F passa). Cade sui conti (B2), sul sospetto (B3), sui punti
   che non tornano indietro (B5) e sulla parola che non e' una parola
   (B6).

   uso:  node strumenti/_crit-staffetta-numero.js
   ===================================================================== */
const B = require('./_crit-staffetta.js');

B.falso({
  nome: 'numero',
  titolo: 'manda 1 / -1 / 0 invece della parola',
  morde: 'MISURATO: B2, B3, B4, B5 (niente si chiude e i punti non tornano), ' +
         'B6 (non e\' una parola), D1 e D3b (le righe che non si chiudono tornano per sempre)',
  cambi: [
    { cerca: B.A_PAROLA,
      metti: "        /* IL FALSO (_crit-staffetta-numero.js): «tanto nel database e'\n" +
             "           un int». Le due porte esistono per non credergli. */\n" +
             "        const tavola = { 'TORNA': 1, 'NON TORNA': -1 };\n" +
             "        const parola = tavola[String(vv.verdetto || '')] !== undefined\n" +
             "          ? tavola[String(vv.verdetto || '')] : 0;" },
  ],
  attesi: [
    [B.A_MISURA, 1],
    [B.A_RICORDA, 1],
    [B.A_FRENO, 1],
    ["const esito = { id: r.id, verdetto: String(vv.verdetto || ''), parola: parola,", 1],
  ],
});
