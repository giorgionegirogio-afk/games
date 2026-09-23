/* =====================================================================
   _crit-dischetto-gentile.js — UNA VERSIONE BUGIARDA DEL GIOCO
   (voce #146, compito 3 — falso per condannare il banco)

   IL PIU' CATTIVO DEI SETTE, e va guardato per primo. Non si schianta,
   non stampa un errore, non lascia un buco visibile: la serie finisce, i
   due punteggi coincidono, il nastro e' completo e il giudice dice
   TORNA. Tutto funziona. Solo che rivela SENZA aspettare l'impegno
   dell'altro — cioe' chi parla per secondo vede la mossa del primo e il
   portiere para sempre.

   E' il falso costruito per il caso peggiore perche' toglie UNA
   CONDIZIONE da UN if e non tocca nient'altro: nessun banco che guardi
   «la serie e' finita?» o «i punteggi coincidono?» lo vede.
   DEVE ESSERE MORSO DA: B1.
   Se non lo e', il buco e' nel banco e si ripara il banco, non il falso.

   uso:  node strumenti/_crit-dischetto-gentile.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

const CERCA = `if(S.mandatoI[t] && S.suoiImpegni[t] && !S.mandatoR[t]){`;
const METTI = `if(S.mandatoI[t] && !S.mandatoR[t]){`;

const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_crit-dischetto-gentile.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('FALSO NON COSTRUITO: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
const n = t.split(CERCA).length - 1;
if (n !== 1) { console.error('FALSO NON COSTRUITO: ancoraggio trovato ' + n + ' volte (ne serve 1)'); process.exit(1); }
t = t.replace(CERCA, METTI);
if (t.split(METTI).length - 1 !== 1) { console.error('FALSO NON COSTRUITO: la bugia non e\' entrata una volta sola'); process.exit(1); }
fs.writeFileSync(usc, t);
console.log('falso costruito: gentile, ' + ing + ' -> ' + usc);
