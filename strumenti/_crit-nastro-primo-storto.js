/* =====================================================================
   _crit-nastro-primo-storto.js - UNA VERSIONE BUGIARDA DEL GIOCO
   (voce #148, compito 1 - falso per condannare il banco)

   LA RIGA 15 DICHIARA IL TIRATORE SBAGLIATO. Scrive `1 - G.kickTeam`
   invece di `G.kickTeam`: sempre l'altro.

   IL «SEMPRE» NON E' CATTIVERIA IN PIU', E' MISURABILITA'. Un falso che
   scrivesse un numero FISSO (per esempio zero) sbaglierebbe solo la
   meta' delle serie - quelle in cui il seme ha scelto l'altro lato - e
   un banco che gioca una serie sola lo morderebbe una volta su due. Un
   falso che morde a caso non condanna nessuno: condanna chi lo rilancia.
   Qui sbaglia sempre, e il rosso e' ripetibile.

   E' il falso che prova che il primo tiratore SERVE: senza, la serie
   rigiocata e' un'altra serie, e il verdetto e' un'accusa.
   DEVE ESSERE MORSO DA: A1, A2.
   Se non lo e', il buco e' nel banco e si ripara il banco, non il falso.

   SI COSTRUISCE SOPRA LA CURA (strumenti/_toppa-148-differita.js): prima
   della cura l'ancoraggio non esiste, e il falso rifiuta di nascere.

   uso:  node strumenti/_crit-nastro-primo-storto.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

const COPPIE = [
  [`    try{ Reg.scrivi(15, [DISCHETTO_V, G.kickTeam]); }catch(e){}`,
   `    try{ Reg.scrivi(15, [DISCHETTO_V, 1 - G.kickTeam]); }catch(e){}`],
];

const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_crit-nastro-primo-storto.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('FALSO NON COSTRUITO: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
for (const [cerca, metti] of COPPIE) {
  const n = t.split(cerca).length - 1;
  if (n !== 1) { console.error('FALSO NON COSTRUITO: ancoraggio trovato ' + n + ' volte (ne serve 1)'); process.exit(1); }
  t = t.replace(cerca, metti);
}
fs.writeFileSync(usc, t);
console.log('falso costruito: nastro-primo-storto, ' + ing + ' -> ' + usc);
