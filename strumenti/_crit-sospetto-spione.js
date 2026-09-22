/* =====================================================================
   _crit-sospetto-spione.js — IL SOSPETTO CHE ESCE DAL DATABASE
   (voce #137, compito 1).

   IL FALSO. `trova_avversario` restituisce anche il sospetto
   dell'avversario, «cosi' l'endpoint puo' ricontrollare la separazione
   anche lui, e un giorno il gioco puo' avvisare». Suona come una difesa
   in piu'. E' una fuga di dati.

   LA RAGIONE, misurabile in una riga: la tupla che esce da
   `trova_avversario` finisce dritta nel corpo della risposta —
   `rispondi(res, 200, { ok: true, vero: true, seme, taglia,
   avversario: avv })`, rete/api/avversario.js. Una colonna in piu' li'
   dentro e' una colonna sul telefono di un'altra persona. Il server
   nasconde apposta l'identita' degli altri (`attaccante: undefined`), e
   questa e' la stessa regola: quel che non deve uscire non si fa uscire
   dal database, non si fa uscire e poi si cancella.

   E' il falso che spiega perche' la separazione dei sospetti vive
   NELL'SQL e non nel ricontrollo dell'endpoint: fuori dal database non
   si puo' ricontrollare senza portare fuori il dato.

   Costruito nel caso peggiore: il resto dello schema e' intatto, la
   separazione funziona, l'abbinamento e' quello nuovo, il sospetto nasce
   solo da NON TORNA. Cade su D6 e su nient'altro.

   uso:  node strumenti/_crit-sospetto-spione.js
   ===================================================================== */
require('./_crit-sospetto.js').falso({
  nome: 'crit-sospetto-spione',
  titolo: 'il sospetto esce nella tupla dell\'avversario',
  morde: 'D6 (il sospetto non esce dal database)',
  file: 'schema.sql',
  cambi: [
    { cerca: "               modulo text, indole jsonb, forza int, punti int)",
      metti: "               modulo text, indole jsonb, forza int, punti int, sospetto int)" },
    { cerca: "           coalesce(p.punti, 1000) as pt\n",
      metti: "           coalesce(p.punti, 1000) as pt, a.sospetto as sosp\n" },
    { cerca: "  select al, nm, co, ro, mo, ind, fo, pt\n    from buoni",
      metti: "  -- IL FALSO (_crit-sospetto-spione.js): la colonna esce, e da qui\n" +
             "  -- finisce dritta nel corpo della risposta al telefono di un altro.\n" +
             "  select al, nm, co, ro, mo, ind, fo, pt, sosp\n    from buoni" },
  ],
  attesi: [
    ['create or replace function segna_verdetto', 1],
    ['alter table allenatore enable row level security;', 1],
  ],
});
