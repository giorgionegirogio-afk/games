/* =====================================================================
   _crit-dischetto-cieco.js — UNA VERSIONE BUGIARDA DEL GIOCO
   (voce #146, compito 3 — falso per condannare il banco)

   PARLA ALLA RETE APPENA SI APRE IL PANNELLO, prima che un dito abbia
   premuto niente. E' la cosa piu' comoda da scrivere («precarico la
   stanza, cosi' quando premono e' gia' pronta») e rompe la regola che
   questa casa tiene da sempre: zero rete finche' non lo chiede una
   persona. Il gioco funziona identico — la richiesta in piu' non si vede
   e non si sente — e per questo serve un cancello che la conti.
   DEVE ESSERE MORSO DA: F1.
   Se non lo e', il buco e' nel banco e si ripara il banco, non il falso.

   uso:  node strumenti/_crit-dischetto-cieco.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

const CERCA = `  apri(){ if(!this.s) this.s = this.vuoto(); return true; },`;
const METTI = `  apri(){ if(!this.s) this.s = this.vuoto(); try{ Rete.chiama('/api/dischetto?stanza=AAAAAA&da=0','GET'); }catch(e){} return true; },`;

const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_crit-dischetto-cieco.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('FALSO NON COSTRUITO: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
const n = t.split(CERCA).length - 1;
if (n !== 1) { console.error('FALSO NON COSTRUITO: ancoraggio trovato ' + n + ' volte (ne serve 1)'); process.exit(1); }
t = t.replace(CERCA, METTI);
if (t.split(METTI).length - 1 !== 1) { console.error('FALSO NON COSTRUITO: la bugia non e\' entrata una volta sola'); process.exit(1); }
fs.writeFileSync(usc, t);
console.log('falso costruito: cieco, ' + ing + ' -> ' + usc);
