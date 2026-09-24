/* =====================================================================
   _crit-nastro-solo-a.js - UNA VERSIONE BUGIARDA DEL GIOCO
   (voce #148, compito 1 - falso per condannare il banco)

   LE TRE RIGHE SOLO SU UN TELEFONO. Il lato 'a' - quello che ha creato
   la stanza - scrive la carta d'identita'; il lato 'b' no.

   E' il falso che condanna un banco PIGRO, e la pigrizia sarebbe
   naturale: si gioca la serie, si prende il nastro di chi ha creato la
   stanza, si giudica quello. Il nastro dell'altro capo pero' e' l'altra
   meta' della prova - in una sfida dal dischetto non c'e' un server che
   tenga IL nastro, ce ne sono DUE, e tutti e due devono valere.
   DEVE ESSERE MORSO DA: A2, A3.
   Se non lo e', il buco e' nel banco e si ripara il banco, non il falso.

   SI COSTRUISCE SOPRA LA CURA (strumenti/_toppa-148-differita.js): prima
   della cura l'ancoraggio non esiste, e il falso rifiuta di nascere.

   uso:  node strumenti/_crit-nastro-solo-a.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

const COPPIE = [
  [`    try{ Reg.carta(1, 1, rA, rB, indiceCarattere('FUORI')); }catch(e){}`,
   `    if(S.lato === 'a'){ try{ Reg.carta(1, 1, rA, rB, indiceCarattere('FUORI')); }catch(e){} }`],
];

const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_crit-nastro-solo-a.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('FALSO NON COSTRUITO: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
for (const [cerca, metti] of COPPIE) {
  const n = t.split(cerca).length - 1;
  if (n !== 1) { console.error('FALSO NON COSTRUITO: ancoraggio trovato ' + n + ' volte (ne serve 1)'); process.exit(1); }
  t = t.replace(cerca, metti);
}
fs.writeFileSync(usc, t);
console.log('falso costruito: nastro-solo-a, ' + ing + ' -> ' + usc);
