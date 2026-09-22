/* =====================================================================
   _crit-staffetta-filo.js — L'ARGOMENTO CHE SI CHIAMA COME LA COLONNA
   (voce #138, compito 3).

   IL FALSO. Una sola parola: nel corpo della chiamata a
   `segna_verdetto` l'argomento si chiama `id` invece di `s_id`. E'
   l'errore che si fa scrivendo di getto — la colonna della tabella si
   chiama `id`, e sembra ovvio che l'argomento si chiami come lei.

   PERCHE' E' IL DIFETTO PIU' SILENZIOSO DI TUTTO IL CANTIERE. Non
   accusa nessuno, non perde nessuna riga, non rompe nessuna invariante,
   e non si vede in nessuna prova che non passi dal filo: la staffetta
   pesca, apre la finestra giusta, giudica bene, riferisce sei verdetti
   corretti — e **nessuna riga si chiude mai**, perche' PostgREST non
   trova la funzione e risponde 400. Tutto il resto del banco resta
   verde: il database in memoria dei gruppi A-F non passa da
   `bancoVero`, e non se ne accorgerebbe mai.

   E' la ragione per cui il gruppo G esiste. Fino al compito 3 del #138
   la spec dichiarava «PostgREST non si interroga: di `bancoVero` si
   misura la forma, non il viaggio» — e questo falso e' esattamente cio'
   che passava da quel buco.

   COSTRUITO NEL CASO PEGGIORE: la pesca resta giusta (G2 passa), il
   freno resta giusto (G4 passa), le intestazioni restano giuste (G5
   passa), e i gruppi A, B, C, D, E ed F passano interi. Cade su G1, G3,
   G6 e G7, cioe' su tutto e solo cio' che tocca `segna_verdetto`.

   uso:  node strumenti/_crit-staffetta-filo.js
   ===================================================================== */
const B = require('./_crit-staffetta.js');

B.falso({
  nome: 'filo',
  titolo: 'l\'argomento di segna_verdetto si chiama id invece di s_id',
  morde: 'MISURATO (sweep del 22 settembre 2026, banco a 42 controlli): G1 G3 G4 G6 G7 — 5 su 42 — tutto e solo il gruppo G: A B C D E F passano interi',
  cambi: [
    { cerca: "        method: 'POST', body: JSON.stringify({ s_id: id, verdetto: String(parola) }),",
      metti: '        /* IL FALSO (_crit-staffetta-filo.js): «la colonna si chiama id,\n' +
             "           l'argomento si chiamera' id». */\n" +
             "        method: 'POST', body: JSON.stringify({ id: id, verdetto: String(parola) })," },
  ],
  attesi: [
    [B.A_PAROLA, 1],
    [B.A_MISURA, 1],
    [B.A_RICORDA, 1],
    [B.A_FRENO, 1],
    /* la pesca e il freno restano intatti: il falso taglia UN filo, non
       la matassa */
    ["'/sfida?verificata=eq.0'", 1],
    ["k: 'staffetta:' + nome", 1],
  ],
});
