/* =====================================================================
   _crit-volto-ansioso.js — L'IMPEGNO CHE PARTE A GESTO NON FINITO
   (voce #147, compito 1 — un falso, non una cura)

   CHE COSA FA. Si impegna appena il dito lascia la mira, con la barra
   ancora in corsa e ps a zero, invece di aspettare che il dito la fermi.
   La serie funziona: i tiri escono, il punteggio si muove, i due
   telefoni coincidono. Solo che l'impegno parte a meta' gesto.

   PERCHE' E' CATTIVO, e perche' e' il falso giusto per il VOLTO. La
   proprieta' «non vedo la mossa dell'altro prima di essermi impegnato»
   e' del protocollo (#146) e il pannello non la puo' rompere: la
   rivelazione dell'altro non arriva finche' il mio impegno non e'
   partito. Ma il pannello puo' rompere QUANDO parte il mio impegno — e
   allora la rivelazione dell'altro arriva mentre il dito e' ancora sulla
   barra. Chi tiene la barra ferma a guardare vede il tuffo del portiere
   prima di scegliere la potenza.

   DEVE ESSERE MORSO DA C1.
   uso:  node strumenti/_crit-volto-ansioso.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_crit-volto-ansioso.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('FALSO NON COSTRUITO: ingresso inesistente'); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
const TAGLI = [
  [
    "    this.barra = { z: z|0, u: Math.round(uu * 1000), v: Math.round(vv * 1000),\n                   ps: 0, cur: 0, dir: 1 };",
    "    this.barra = { z: z|0, u: Math.round(uu * 1000), v: Math.round(vv * 1000),\n                   ps: 0, cur: 0, dir: 1 };\n    /* IL FALSO: l'impegno parte adesso, col gesto a meta'. */\n    this.scegli({ ruolo:'t', z:this.barra.z, u:this.barra.u, v:this.barra.v, ps:0 });",
    "manoMira"
  ]
];
for (const [cerca, metti, nome] of TAGLI) {
  const n = t.split(cerca).length - 1;
  if (n !== 1) { console.error('FALSO NON COSTRUITO: ancora ' + nome + ' trovata ' + n + ' volte'); process.exit(1); }
  t = t.replace(cerca, metti);
}
fs.writeFileSync(usc, t);
console.log('falso costruito: volto-ansioso');
