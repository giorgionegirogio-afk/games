/* =====================================================================
   _crit-dischetto-vecchio.js — UNA VERSIONE BUGIARDA DEL GIOCO
   (voce #150, compito 1 — falso per condannare il banco)

   ACCETTA UNA SERIE DI VERSIONE VECCHIA SENZA DIRLO. Il #150 porta
   DISCHETTO_V da 1 a 2: i nastri registrati col protocollo vecchio non si
   possono piu' rigiocare, perche' il seme li nasceva in un altro modo.
   La casa vuole che quei nastri siano RIFIUTATI CON CAUSA VERA
   (INCOMPLETO / dischetto-versione), mai accusati. Questo falso toglie la
   guardia: il giudice apre la serie vecchia, la rigioca col protocollo
   nuovo e dice quel che gli pare.

   E' COSTRUITO NEL CASO PEGGIORE, e va detto perche' si capisca la
   differenza con `mezza-guardia` (#149): quello toglie TRE guardie
   insieme, e un banco grossolano lo prende per una delle altre due.
   Questo ne toglie UNA SOLA — la versione — e lascia in piedi tutto il
   resto. E' il piu' difficile da mordere dei due, ed e' quello che dice
   se B8 misura davvero la versione o e' verde per compagnia.

   DEVE ESSERE MORSO DA: B8 di _q-nastro-differito.
   DEVONO RESTARE VERDI: B1, B5, B6, B7.
   Se non e' cosi', il buco e' nel banco e si ripara il banco.

   uso:  node strumenti/_crit-dischetto-vecchio.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

const CERCA = `  if(disco && disco.v !== DISCHETTO_V) return no('INCOMPLETO','dischetto-versione');`;
const METTI = `  /* il vecchio non guarda che protocollo dichiari il nastro */`;

const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_crit-dischetto-vecchio.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('FALSO NON COSTRUITO: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
const n = t.split(CERCA).length - 1;
if (n !== 1) { console.error('FALSO NON COSTRUITO: ancoraggio trovato ' + n + ' volte (ne serve 1)'); process.exit(1); }
t = t.replace(CERCA, METTI);
if (t.split(METTI).length - 1 !== 1) { console.error('FALSO NON COSTRUITO: la bugia non e\' entrata una volta sola'); process.exit(1); }
fs.writeFileSync(usc, t);
console.log('falso costruito: vecchio, ' + ing + ' -> ' + usc);
