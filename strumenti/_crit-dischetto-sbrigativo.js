/* =====================================================================
   _crit-dischetto-sbrigativo.js — UNA VERSIONE BUGIARDA DEL GIOCO
   (voce #150, compito 1 — falso per condannare il banco)

   LA MEZZA CURA, ed e' il falso piu' importante di questo cantiere.
   Il #149 ha scritto che «una mezza cura del protocollo e' peggio del
   buco dichiarato»: questa e' quella mezza cura, costruita apposta per
   provare che il banco la riconosce.

   CHE COSA FA. Impegna il nonce come si deve — la busta del saluto porta
   `hn` e non il nonce, e chi guardasse SOLO la cassetta direbbe «curato»
   — e poi RIVELA lo stesso, senza aspettare l'impegno dell'altro. Toglie
   una condizione da un if e non tocca nient'altro: il protocollo gira,
   l'appuntamento si chiude, il seme esce, la serie parte. Solo che chi
   arriva per secondo vede il nonce dell'altro prima di scegliere il
   proprio, ed e' esattamente il difetto che il cantiere doveva curare —
   travestito da cura.

   E' IL GEMELLO DI `gentile` (#146), che toglie la stessa condizione
   dalla rivelazione dei TIRI. Due bugie con la stessa forma: se il banco
   morde l'una e non l'altra, il buco e' nel banco.

   DEVE ESSERE MORSO DA: S5, e SOLO da S5. Misurato: 20 appuntamenti su
   20 chiusi col baro paziente, e il bit vinto 20 volte su 20.

   E S1 NON LO MORDE, che e' la cosa da capire di questo falso. Il baro
   di S1 legge il SALUTO dell'altro, e anche nella mezza cura il saluto
   porta solo un impegno: macinare quattromila nonce contro un hash non
   serve a niente, e infatti S1 resta verde (44 su 80). A farsi servire
   e' solo chi si RIFIUTA di impegnarsi e aspetta — ed e' per questo che
   S5 e' secca e non statistica. Una mezza cura che il banco vede solo
   col braccio giusto: senza S5 questo falso sarebbe passato per cura.
   Se non e' morso, il buco e' nel banco e si ripara il banco.

   SI COSTRUISCE SOPRA LA CURA (strumenti/_toppa-seme-due-mani.js):
   prima della cura l'ancoraggio non esiste e il falso rifiuta di nascere.

   uso:  node strumenti/_crit-dischetto-sbrigativo.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

const CERCA = `    if(S.suoSaluto && !S.mandatoN){`;
const METTI = `    if(!S.mandatoN){`;

const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_crit-dischetto-sbrigativo.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('FALSO NON COSTRUITO: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
const n = t.split(CERCA).length - 1;
if (n !== 1) { console.error('FALSO NON COSTRUITO: ancoraggio trovato ' + n + ' volte (ne serve 1)'); process.exit(1); }
t = t.replace(CERCA, METTI);
if (t.split(METTI).length - 1 !== 1) { console.error('FALSO NON COSTRUITO: la bugia non e\' entrata una volta sola'); process.exit(1); }
fs.writeFileSync(usc, t);
console.log('falso costruito: sbrigativo, ' + ing + ' -> ' + usc);
