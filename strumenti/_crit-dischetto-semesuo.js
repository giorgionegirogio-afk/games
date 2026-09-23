/* =====================================================================
   _crit-dischetto-semesuo.js — UNA VERSIONE BUGIARDA DEL GIOCO
   (voce #146, compito 3 — falso per condannare il banco)

   CALCOLA IL SEME DAL PROPRIO NONCE SOLTANTO. Il nonce dell'altro
   arriva, viene letto, viene messo da parte — e non entra nel conto. Il
   risultato e' che ognuno dei due si sceglie la partita, e chi ha la
   pazienza di ricreare la stanza finche' non esce il seme che gli piace
   gioca sempre quella che gli conviene.

   E' costruito nel caso peggiore perche' non rompe niente di visibile:
   la serie parte, i tiri si giocano, la fine arriva. Solo i DUE semi non
   coincidono, e senza un banco che li confronti fra i due telefoni non
   se ne accorge nessuno.
   DEVE ESSERE MORSO DA: A3.
   Se non lo e', il buco e' nel banco e si ripara il banco, non il falso.

   uso:  node strumenti/_crit-dischetto-semesuo.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

const CERCA = `    S.seme = dsMescola(na, nb);`;
const METTI = `    S.seme = dsMescola(S.mioNonce, S.mioNonce);`;

const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_crit-dischetto-semesuo.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('FALSO NON COSTRUITO: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
const n = t.split(CERCA).length - 1;
if (n !== 1) { console.error('FALSO NON COSTRUITO: ancoraggio trovato ' + n + ' volte (ne serve 1)'); process.exit(1); }
t = t.replace(CERCA, METTI);
if (t.split(METTI).length - 1 !== 1) { console.error('FALSO NON COSTRUITO: la bugia non e\' entrata una volta sola'); process.exit(1); }
fs.writeFileSync(usc, t);
console.log('falso costruito: semesuo, ' + ing + ' -> ' + usc);
