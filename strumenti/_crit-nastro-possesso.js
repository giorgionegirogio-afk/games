/* =====================================================================
   _crit-nastro-possesso.js - UNA VERSIONE BUGIARDA DEL GIOCO
   (voce #148, compito 1 - falso per condannare il banco)

   OGNUNO SI METTE IN CASA. Scrive nella riga di tipo 7 la PROPRIA rosa
   per prima e quella dell'altro per seconda, invece di metterle per
   LATO. Sul telefono che ha creato la stanza (lato 'a') e' giusto per
   caso; su quello che e' entrato col codice le due rose sono scambiate.

   E' il difetto che il commento sopra `Dischetto.avvia` mette in guardia
   dal fare («se ognuno si mettesse in casa, i due resolve() leggerebbero
   attributi diversi»), qui portato dentro il NASTRO invece che dentro la
   partita: la serie si gioca bene, i due tabelloni coincidono, e poi il
   giudice rigioca uno dei due nastri con le squadre invertite e dice NON
   TORNA a due persone oneste. E' il difetto peggiore di tutta l'onda D,
   ed e' quello contro cui il mandato del #148 mette in guardia per nome.

   NASCE A META': un capo solo e' bugiardo. Un banco che giudicasse il
   nastro del solo telefono che ha creato la stanza lo promuoverebbe.
   DEVE ESSERE MORSO DA: A2, A3.
   Se non lo e', il buco e' nel banco e si ripara il banco, non il falso.

   SI COSTRUISCE SOPRA LA CURA (strumenti/_toppa-148-differita.js): prima
   della cura l'ancoraggio non esiste, e il falso rifiuta di nascere.

   uso:  node strumenti/_crit-nastro-possesso.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

const COPPIE = [
  [`    try{ Reg.carta(1, 1, rA, rB, indiceCarattere('FUORI')); }catch(e){}`,
   `    try{ Reg.carta(1, 1, mia, S.suoSaluto.rosa, indiceCarattere('FUORI')); }catch(e){}`],
];

const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_crit-nastro-possesso.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('FALSO NON COSTRUITO: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
for (const [cerca, metti] of COPPIE) {
  const n = t.split(cerca).length - 1;
  if (n !== 1) { console.error('FALSO NON COSTRUITO: ancoraggio trovato ' + n + ' volte (ne serve 1)'); process.exit(1); }
  t = t.replace(cerca, metti);
}
fs.writeFileSync(usc, t);
console.log('falso costruito: nastro-possesso, ' + ing + ' -> ' + usc);
