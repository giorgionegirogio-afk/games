/* =====================================================================
   _crit-staffetta-sprecona.js — UN CONTESTO PER RIGA (voce #138,
   compito 1).

   IL FALSO. Il raggruppamento c'e', la misura si legge, la finestra che
   si apre e' quella giusta riga per riga — e proprio per questo ogni
   riga diventa un gruppo per conto suo, e si riapre il browser da capo.
   E' la staffetta che qualcuno scriverebbe se il raggruppamento gli
   sembrasse una complicazione inutile: «tanto la misura la leggo
   comunque, che differenza fa raggrupparle?».

   LA DIFFERENZA E' MISURATA, e sta in due numeri della sonda del 22
   settembre 2026: aprire un contesto e caricare il gioco costa 1165 ms,
   un giudizio 1039 ms, un secondo giudizio sulla stessa pagina 938 ms.
   Riaprire per ogni riga porta il costo per riga da ~1,0 s a ~2,2 s, e
   su una coda che cresce e' la differenza fra una staffetta che sta
   dietro e una che resta indietro per sempre.

   PERCHE' UN FALSO PER UNA PROVA DI COSTO. Perche' la regola di casa
   dice che ogni cosa che si asserisce deve avere il suo falso, e C4 —
   «tre contesti per sei righe» — era l'unica asserzione del banco che
   nessuno dei sei falsi condannava. Un'asserzione senza falso e' un
   attestato: passa e basta, e il giorno in cui smette di essere vera
   nessuno se ne accorge.

   COSTRUITO NEL CASO PEGGIORE: tutti i verdetti restano giusti (B passa
   tutto, C1, C2, C3 e C5 passano), i punti si muovono come devono, la
   ripartenza funziona, il freno si rispetta, le porte restano chiuse.
   Cade su A4 (sei righe, sei gruppi invece di tre) e su C4, che e' la
   sua conseguenza.

   uso:  node strumenti/_crit-staffetta-sprecona.js
   ===================================================================== */
const B = require('./_crit-staffetta.js');

B.falso({
  nome: 'sprecona',
  titolo: 'ogni riga e\' un gruppo per conto suo, e il browser si riapre da capo',
  morde: 'MISURATO (sweep del 22 settembre 2026, banco a 42 controlli): A4 C4 — 2 su 42 — sei gruppi invece di tre, e sei contesti per sei righe',
  cambi: [
    { cerca: "    const chiave = m ? (m[0] + 'x' + m[1]) : 'ignota';",
      metti: '    /* IL FALSO (_crit-staffetta-sprecona.js): «tanto la misura la\n' +
             "       leggo comunque, che differenza fa raggrupparle?». */\n" +
             "    const chiave = (m ? (m[0] + 'x' + m[1]) : 'ignota') + '#' + (r && r.id);" },
  ],
  attesi: [
    [B.A_PAROLA, 1],
    [B.A_MISURA, 1],
    [B.A_RICORDA, 1],
    [B.A_FRENO, 1],
  ],
});
