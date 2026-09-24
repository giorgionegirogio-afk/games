/* =====================================================================
   _crit-volto-rete.js — IL PANNELLO CHE PARLA ALLA RETE APPENA SI APRE
   (voce #147, compito 1 — un falso, non una cura)

   CHE COSA FA. mostra() crea la sfida da se': aprire il pannello conia
   un codice e imbuca il saluto nella cassetta.

   PERCHE' E' UNA TENTAZIONE VERA. Aprire il pannello e trovare il
   codice gia' pronto e' piu' comodo di premere un bottone, e sembra un
   regalo all'utente. Ma «zero rete all'avvio» in questa casa e' un
   cancello che conta (senza-rete, conta:true) e un principio scritto: la
   prima richiesta parte quando un dito CHIEDE una sfida. Un pannello
   che parla da se' fa partire una richiesta a chi ha solo aperto una
   schermata per guardarla — e lo fa anche a chi non ha campo.

   DEVE ESSERE MORSO DA F1.
   uso:  node strumenti/_crit-volto-rete.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_crit-volto-rete.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('FALSO NON COSTRUITO: ingresso inesistente'); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
const TAGLI = [
  [
    "  mostra(){\n    this.apri();\n    this.ridipingi();",
    "  mostra(){\n    this.apri();\n    /* IL FALSO: la rete si tocca all'apertura. */\n    this.crea();\n    this.ridipingi();",
    "mostra"
  ]
];
for (const [cerca, metti, nome] of TAGLI) {
  const n = t.split(cerca).length - 1;
  if (n !== 1) { console.error('FALSO NON COSTRUITO: ancora ' + nome + ' trovata ' + n + ' volte'); process.exit(1); }
  t = t.replace(cerca, metti);
}
fs.writeFileSync(usc, t);
console.log('falso costruito: volto-rete');
