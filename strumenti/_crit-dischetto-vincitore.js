/* =====================================================================
   _crit-dischetto-vincitore.js — UNA VERSIONE BUGIARDA DEL GIOCO
   (voce #146, compito 3 — falso per condannare il banco)

   QUANDO L'ALTRO SPARISCE ASSEGNA LA VITTORIA A CHI RESTA. E' la
   decisione che sembra piu' naturale del mondo — «ha abbandonato, ha
   perso» — ed e' esattamente il modo piu' corto per far vincere
   FACENDO CADERE LA RETE DELL'ALTRO. E' lo stesso argomento con cui il
   #137 rifiuto' un endpoint capace di dire «questa sfida non torna»: un
   abbandono puo' essere una galleria, e davanti a un dubbio ci si
   astiene.

   Nota che questo falso lascia la CAUSA giusta («incompiuta») e cambia
   solo l'esito: e' costruito perche' un banco che guardasse solo la
   parola, e non i punti, lo promuovesse.
   DEVE ESSERE MORSO DA: G5.
   Se non lo e', il buco e' nel banco e si ripara il banco, non il falso.

   uso:  node strumenti/_crit-dischetto-vincitore.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

const CERCA = `      S.fase = 'fine'; S.causa = 'incompiuta'; S.fine = null;`;
const METTI = `      S.fase = 'fine'; S.causa = 'incompiuta'; S.fine = 'vinta';`;

const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_crit-dischetto-vincitore.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('FALSO NON COSTRUITO: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
const n = t.split(CERCA).length - 1;
if (n !== 1) { console.error('FALSO NON COSTRUITO: ancoraggio trovato ' + n + ' volte (ne serve 1)'); process.exit(1); }
t = t.replace(CERCA, METTI);
if (t.split(METTI).length - 1 !== 1) { console.error('FALSO NON COSTRUITO: la bugia non e\' entrata una volta sola'); process.exit(1); }
fs.writeFileSync(usc, t);
console.log('falso costruito: vincitore, ' + ing + ' -> ' + usc);
