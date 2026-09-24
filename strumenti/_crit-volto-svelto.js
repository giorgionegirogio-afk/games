/* =====================================================================
   _crit-volto-svelto.js — LA CATTURA CHE CHIAMA LE PORTE VERE
   (voce #147, compito 1 — un falso, non una cura)

   CHE COSA FA. Spegne la cattura: il dito arriva alle tre porte vere del
   duello, che risolvono il rigore in locale.

   PERCHE' E' IL PIU' PLAUSIBILE DI TUTTI. E' la prima cosa che
   verrebbe in mente a chi scrive il pannello: il duello ha gia' la sua
   interfaccia, le sue porte funzionano, basta lasciarle fare. E in
   apparenza funziona — il rigore si vede, il pallone parte, il portiere
   si tuffa. Solo che quel rigore l'ha deciso un telefono da solo: il
   duello arriva in fase 'wait', risolviDuello non trovera' mai
   phase==='zone', e il nastro prende due volte le righe di tipo 6.

   DEVE ESSERE MORSO DA D1.
   uso:  node strumenti/_crit-volto-svelto.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_crit-volto-svelto.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('FALSO NON COSTRUITO: ingresso inesistente'); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
const TAGLI = [
  [
    "  catturaAttiva(){\n    const S = this.s;\n    return !!(S && S.fase === 'scegli' && !this.risolvendo && S.ruolo);\n  },",
    "  catturaAttiva(){\n    /* IL FALSO: niente cattura. Il dito va alle porte vere. */\n    return false;\n  },",
    "catturaAttiva"
  ]
];
for (const [cerca, metti, nome] of TAGLI) {
  const n = t.split(cerca).length - 1;
  if (n !== 1) { console.error('FALSO NON COSTRUITO: ancora ' + nome + ' trovata ' + n + ' volte'); process.exit(1); }
  t = t.replace(cerca, metti);
}
fs.writeFileSync(usc, t);
console.log('falso costruito: volto-svelto');
