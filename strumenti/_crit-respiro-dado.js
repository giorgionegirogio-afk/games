/* =====================================================================
   _crit-respiro-dado.js — LA COSMETICA CHE TORNA A MANGIARE I SORTEGGI
   (voce #147, compito 1 — un falso, non una cura)

   CHE COSA FA. Il tremolio dell'arco esce da dado() invece che da
   dadoDeco(): un sorteggio per fotogramma, preso dal generatore DI
   GIOCO invece che da quello della cosmetica.

   PERCHE' ESISTE, ED E' UN DIFETTO GIA' SUCCESSO DUE VOLTE IN QUESTA
   CASA. La voce #98 l'aveva nella folla e nella texture del campo; la
   #129 l'ha curato spostando la cosmetica su DECO; la #132 l'ha
   ritrovato NELL'AUDIO, che mangiava sorteggi. Scrivere dado() invece
   di dadoDeco() e' un errore di sei caratteri che non da' nessun
   sintomo visibile e che manda fuori sincrono due telefoni che
   dovrebbero vedere la stessa partita.

   DEVE ESSERE MORSO DA E4, che conta il delta del contatore dei
   sorteggi di gioco fra una partita col respiro e una senza.
   uso:  node strumenti/_crit-respiro-dado.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_crit-respiro-dado.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('FALSO NON COSTRUITO: ingresso inesistente'); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
const TAGLI = [
  [
    "      ? (dadoDeco() - 0.5) * 0.44 * this.carica : 0;",
    "      ? (dado() - 0.5) * 0.44 * this.carica : 0;   /* IL FALSO */",
    "tremore"
  ]
];
for (const [cerca, metti, nome] of TAGLI) {
  const n = t.split(cerca).length - 1;
  if (n !== 1) { console.error('FALSO NON COSTRUITO: ancora ' + nome + ' trovata ' + n + ' volte'); process.exit(1); }
  t = t.replace(cerca, metti);
}
fs.writeFileSync(usc, t);
console.log('falso costruito: respiro-dado');
