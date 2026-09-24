/* =====================================================================
   _crit-respiro-piatto.js — IL FIATO CHE NON RESPIRA
   (voce #147, compito 1 — un falso, non una cura)

   CHE COSA FA. La carica esiste, si vede, l'arco si disegna — e vale
   sempre la stessa cosa. Il fiato non cresce e non finisce sul tick del
   comando: e' una decorazione ferma con l'aria di essere viva.

   PERCHE' ESISTE. E' il falso che un cancello scritto male promuove
   sempre: se E1 chiedesse «c'e' una carica ed e' fra 0 e 1», questo
   passerebbe. Il progetto d'onda non dice «ci sia un'animazione»: dice
   che l'anticipazione DURA ESATTAMENTE D TICK e FINISCE SUL TICK in cui
   il comando esegue. E1 pretende i tre valori a 0, K/2 e K distinti e
   crescenti, col colmo a uno.

   DEVE ESSERE MORSO DA E1.
   uso:  node strumenti/_crit-respiro-piatto.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_crit-respiro-piatto.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('FALSO NON COSTRUITO: ingresso inesistente'); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
const TAGLI = [
  [
    "        this.carica = (this.K > 0) ? Math.max(0, Math.min(1, 1 - resta / this.K)) : 1;",
    "        /* IL FALSO: la carica non si muove mai. */\n        this.carica = 0.5;",
    "carica"
  ]
];
for (const [cerca, metti, nome] of TAGLI) {
  const n = t.split(cerca).length - 1;
  if (n !== 1) { console.error('FALSO NON COSTRUITO: ancora ' + nome + ' trovata ' + n + ' volte'); process.exit(1); }
  t = t.replace(cerca, metti);
}
fs.writeFileSync(usc, t);
console.log('falso costruito: respiro-piatto');
