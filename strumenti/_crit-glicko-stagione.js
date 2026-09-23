/* =====================================================================
   _crit-glicko-stagione.js — IL PERIODO SCAMBIATO PER UNA STAGIONE
   (voce #140, compito 4).

   IL FALSO. Quando il periodo di rating cambia — cioe' ogni notte — si
   riparte da 1500 con incertezza 350. «Comincia un periodo nuovo, si
   ricomincia»: e' la lettura sbagliata piu' facile del mandato, che al
   §163 parla davvero di `season reset every 4 weeks`, e l'unica cosa
   che il progetto di questo cantiere avvisa per nome.

   E' PLAUSIBILE FINO A FARE MALE. Non nomina la stagione, non nomina un
   azzeramento, non tocca la matematica: chiama `nuovo()`, che e' una
   funzione onesta del modulo, nel posto in cui un lettore distratto la
   metterebbe. Il gruppo D, che cerca proprio quelle parole, non ha
   niente da dire. E il difetto non si vede nemmeno giocando: chi gioca
   tutti i giorni non se ne accorge mai, perche' per lui il periodo non
   cambia mai fra una sfida e l'altra. Se ne accorge solo chi sta fermo
   una notte — cioe' quasi tutti, una volta ogni tanto.

   QUESTO FALSO HA TROVATO UN BUCO NEL BANCO, ed e' la ragione per cui i
   falsi si costruiscono. Alla prima costruzione passava TUTTE E
   CINQUANTASETTE le prove: il gruppo E provava `inattivo` da sola (che
   qui e' intatta) e `dopoLaSfida` solo nel giorno stesso, dove il
   periodo non cambia. Nessuna riga chiedeva la cosa che conta — **il
   rating di ieri sopravvive alla notte** — e senza quella riga il banco
   avrebbe dichiarato verde una classifica che si riscrive ogni notte.
   La prova E4b e' nata da qui.

   uso:  node strumenti/_crit-glicko-stagione.js
   ===================================================================== */
require('./_crit-sospetto.js').falso({
  nome: 'crit-glicko-stagione',
  cancello: '_q-glicko.js',
  titolo: 'il periodo di rating trattato come una stagione: ogni notte si riparte da 1500',
  morde: 'E4b (il rating di ieri sopravvive alla notte). PASSA tutto il resto, D10 compreso',
  file: 'lib/glicko.js',
  cerca: "  const quando = data || oggi();\n" +
         "  const saltati = mio && mio.periodo ? Math.max(0, giorni(mio.periodo, quando) - 1) : 0;\n" +
         "  const prima = {\n" +
         "    nascosto: nascostoDi(mio),\n" +
         "    incertezza: inattivo(mio, saltati),\n" +
         "    volatilita: volatilitaDi(mio),\n" +
         "  };",
  metti: "  const quando = data || oggi();\n" +
         "  const saltati = mio && mio.periodo ? Math.max(0, giorni(mio.periodo, quando) - 1) : 0;\n" +
         "  /* IL FALSO (_crit-glicko-stagione.js): se il periodo e' cambiato,\n" +
         "     si riparte. Non nomina niente di sospetto e chiama una funzione\n" +
         "     onesta del modulo, nel posto in cui un lettore distratto la\n" +
         "     metterebbe — e riscrive la classifica ogni notte. */\n" +
         "  const cambiato = mio && mio.periodo ? giorni(mio.periodo, quando) > 0 : false;\n" +
         "  const prima = cambiato ? nuovo() : {\n" +
         "    nascosto: nascostoDi(mio),\n" +
         "    incertezza: inattivo(mio, saltati),\n" +
         "    volatilita: volatilitaDi(mio),\n" +
         "  };",
  attesi: [
    ["export function inattivo(me, periodi) {", 1],
    ["export function aggiorna(me, partite) {", 1],
    ["export const TAU = 0.5;", 1],
  ],
});
