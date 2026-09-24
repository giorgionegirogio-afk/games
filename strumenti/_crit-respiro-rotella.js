/* =====================================================================
   _crit-respiro-rotella.js — IL FIATO CHE SI AZZERA QUANDO LA PARTITA SI FERMA
   (voce #147, compito 1 — un falso, non una cura)

   CHE COSA FA. Quando l'orologio della simulazione non avanza — cioe'
   esattamente quando si sta aspettando l'altro telefono — la carica va
   a zero. L'anello smette di respirare, e chi guarda vede un gioco
   bloccato.

   PERCHE' E' IL FALSO PIU' VICINO ALLA VERITA'. E' il comportamento
   NATURALE di quasi tutte le animazioni: si legano al fotogramma, e
   quando non succede niente si spengono. Il progetto d'onda chiede
   l'opposto, ed e' l'unica cosa che distingue «il gioco si e' bloccato»
   da «sta per succedere qualcosa»: quando la simulazione si ferma,
   l'anticipazione TIENE. Il congelamento deve sembrare un fiato
   trattenuto, non un blocco — e mai una rotella.

   DEVE ESSERE MORSO DA E2.
   uso:  node strumenti/_crit-respiro-rotella.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_crit-respiro-rotella.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('FALSO NON COSTRUITO: ingresso inesistente'); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
const TAGLI = [
  [
    "  passo(){\n    if(!this.on){ this.azzera(); return; }",
    "  passo(){\n    if(!this.on){ this.azzera(); return; }\n    /* IL FALSO: se l'orologio non e' avanzato, il fiato si spegne. */\n    if(this.tickPrec === Ritardo.tick){ this.carica = 0; this.tremore = 0; return; }\n    this.tickPrec = Ritardo.tick;",
    "passo"
  ]
];
for (const [cerca, metti, nome] of TAGLI) {
  const n = t.split(cerca).length - 1;
  if (n !== 1) { console.error('FALSO NON COSTRUITO: ancora ' + nome + ' trovata ' + n + ' volte'); process.exit(1); }
  t = t.replace(cerca, metti);
}
fs.writeFileSync(usc, t);
console.log('falso costruito: respiro-rotella');
