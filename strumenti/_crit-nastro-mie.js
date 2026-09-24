/* =====================================================================
   _crit-nastro-mie.js - UNA VERSIONE BUGIARDA DEL GIOCO
   (voce #148, compito 1 - falso per condannare il banco)

   DUE VOLTE LA PROPRIA ROSA. Nella riga di tipo 7 finisce `mia` in tutti
   e due i posti: la squadra dell'altro nel nastro non entra.

   E' la bugia piu' grossolana delle tre, ed e' qui apposta: e' il
   CONTROLLO che le altre due siano state costruite nel caso peggiore. Se
   il banco mordesse solo questa e non «scambiate», starebbe misurando
   la grossolanita' e non la proprieta'.
   DEVE ESSERE MORSO DA: A1, A2, A3.
   Se non lo e', il buco e' nel banco e si ripara il banco, non il falso.

   SI COSTRUISCE SOPRA LA CURA (strumenti/_toppa-148-differita.js): prima
   della cura l'ancoraggio non esiste, e il falso rifiuta di nascere.

   uso:  node strumenti/_crit-nastro-mie.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

const COPPIE = [
  [`    try{ Reg.carta(1, 1, rA, rB, indiceCarattere('FUORI')); }catch(e){}`,
   `    try{ Reg.carta(1, 1, mia, mia, indiceCarattere('FUORI')); }catch(e){}`],
];

const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_crit-nastro-mie.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('FALSO NON COSTRUITO: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
for (const [cerca, metti] of COPPIE) {
  const n = t.split(cerca).length - 1;
  if (n !== 1) { console.error('FALSO NON COSTRUITO: ancoraggio trovato ' + n + ' volte (ne serve 1)'); process.exit(1); }
  t = t.replace(cerca, metti);
}
fs.writeFileSync(usc, t);
console.log('falso costruito: nastro-mie, ' + ing + ' -> ' + usc);
