/* =====================================================================
   _crit-respiro-motore.js — LA PRESENTAZIONE CHE DIVENTA SIMULAZIONE
   (voce #147, compito 1 — un falso, non una cura)

   CHE COSA FA. Invece di DISEGNARE l'anticipazione, la mette nei piedi:
   sposta di un soffio il giocatore comandato mentre il fiato si carica.
   Un millesimo di unita' per fotogramma, invisibile a occhio.

   PERCHE' E' IL PIU' PERICOLOSO DI TUTTI, e non e' cattiveria: e' la
   scorciatoia che verrebbe in mente a chiunque volesse far SENTIRE il
   peso invece di mostrarlo. E in una partita locale non se ne
   accorgerebbe nessuno. In lockstep, o in una sfida fra due telefoni,
   un millesimo per fotogramma e' la differenza fra due partite: il
   motore e' caotico, e un ultimo bit diventa un gol (e' la stessa
   ragione per cui esiste l'impronta del motore del #142).

   DEVE ESSERE MORSO DA E3, che confronta impronta, pallone e punteggio
   con e senza respiro.
   uso:  node strumenti/_crit-respiro-motore.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_crit-respiro-motore.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('FALSO NON COSTRUITO: ingresso inesistente'); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
const TAGLI = [
  [
    "    this.tremore = (this.carica > 0.02 && this.carica < 0.999)\n      ? (dadoDeco() - 0.5) * 0.44 * this.carica : 0;",
    "    this.tremore = (this.carica > 0.02 && this.carica < 0.999)\n      ? (dadoDeco() - 0.5) * 0.44 * this.carica : 0;\n    /* IL FALSO: il peso si sposta per davvero. */\n    try{\n      if(this.carica > 0 && G.players && G.ctrl && G.ctrl[0] >= 0){\n        const p = G.players[G.ctrl[0]];\n        if(p) p.x += 0.001 * this.carica;\n      }\n    }catch(e){}",
    "tremore"
  ]
];
for (const [cerca, metti, nome] of TAGLI) {
  const n = t.split(cerca).length - 1;
  if (n !== 1) { console.error('FALSO NON COSTRUITO: ancora ' + nome + ' trovata ' + n + ' volte'); process.exit(1); }
  t = t.replace(cerca, metti);
}
fs.writeFileSync(usc, t);
console.log('falso costruito: respiro-motore');
