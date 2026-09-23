/* =====================================================================
   _crit-dischetto-fidato.js — UNA VERSIONE BUGIARDA DEL GIOCO
   (voce #146, compito 3 — falso per condannare il banco)

   CREDE ALL'ESITO CHE L'ALTRO DICHIARA invece di fidarsi del proprio.
   Il calcolo locale c'e' ancora, il duello si gioca davvero, il nastro
   e' completo: manca solo il confronto fra i due esiti. Chi bara vince
   scrivendo la parola «gol», e nessuno dei due telefoni si lamenta.

   E' anche il falso che spiega perche' il confronto degli esiti non e'
   un lusso: senza di lui la divergenza fra due motori JS — che il #142
   ha costruito l'impronta apposta per riconoscere — passerebbe
   inosservata e diventerebbe un punteggio sbagliato invece di
   un'astensione.
   DEVE ESSERE MORSO DA: C6.
   Se non lo e', il buco e' nel banco e si ripara il banco, non il falso.

   uso:  node strumenti/_crit-dischetto-fidato.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

const CERCA = `      const suoE = S.suoiEsiti[t];
      if(suoE && suoE !== S.esiti[t-1].esito){`;
const METTI = `      const suoE = S.suoiEsiti[t];
      if(suoE && suoE === '@mai@'){`;

const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_crit-dischetto-fidato.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('FALSO NON COSTRUITO: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
const n = t.split(CERCA).length - 1;
if (n !== 1) { console.error('FALSO NON COSTRUITO: ancoraggio trovato ' + n + ' volte (ne serve 1)'); process.exit(1); }
t = t.replace(CERCA, METTI);
if (t.split(METTI).length - 1 !== 1) { console.error('FALSO NON COSTRUITO: la bugia non e\' entrata una volta sola'); process.exit(1); }
fs.writeFileSync(usc, t);
console.log('falso costruito: fidato, ' + ing + ' -> ' + usc);
