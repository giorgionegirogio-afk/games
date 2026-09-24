/* =====================================================================
   _crit-nastro-scambiate.js - UNA VERSIONE BUGIARDA DEL GIOCO
   (voce #148, compito 1 - falso per condannare il banco)

   LE DUE ROSE SCAMBIATE, E SUI DUE TELEFONI ALLO STESSO MODO. Scrive rB
   dove va rA e viceversa.

   E' IL CASO PEGGIORE, piu' cattivo del falso «possesso»: la bugia e'
   COERENTE, quindi le due righe di tipo 7 restano identiche carattere
   per carattere e la prova che le confronta (A3) resta VERDE. Nessun
   confronto fra i due capi puo' vederlo: lo vede solo chi RIGIOCA il
   nastro e guarda il punteggio che ne esce.

   Serve a condannare un banco che si accontentasse di «le due rose
   coincidono»: due rose sbagliate coincidono benissimo.
   DEVE ESSERE MORSO DA: A1, A2.
   Se non lo e', il buco e' nel banco e si ripara il banco, non il falso.

   SI COSTRUISCE SOPRA LA CURA (strumenti/_toppa-148-differita.js): prima
   della cura l'ancoraggio non esiste, e il falso rifiuta di nascere.

   uso:  node strumenti/_crit-nastro-scambiate.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

const COPPIE = [
  [`    try{ Reg.carta(1, 1, rA, rB, indiceCarattere('FUORI')); }catch(e){}`,
   `    try{ Reg.carta(1, 1, rB, rA, indiceCarattere('FUORI')); }catch(e){}`],
];

const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_crit-nastro-scambiate.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('FALSO NON COSTRUITO: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
for (const [cerca, metti] of COPPIE) {
  const n = t.split(cerca).length - 1;
  if (n !== 1) { console.error('FALSO NON COSTRUITO: ancoraggio trovato ' + n + ' volte (ne serve 1)'); process.exit(1); }
  t = t.replace(cerca, metti);
}
fs.writeFileSync(usc, t);
console.log('falso costruito: nastro-scambiate, ' + ing + ' -> ' + usc);
