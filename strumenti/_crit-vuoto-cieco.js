/* =====================================================================
   _crit-vuoto-cieco.js — UNA VERSIONE BUGIARDA DEL GIOCO
   (voce #149, compito 3 — il falso che condanna la prova C di
   _q-nastro-tronco)

   VIA LA GUARDIA DEL NASTRO VUOTO, e niente altro. `vagliaNastro` non
   dice piu' `INCOMPLETO/nastro-vuoto`: il nastro senza comandi tira
   avanti e si ferma piu' giu', dove capita.

   PERCHE' ESISTE. Fino al #149 la prova C era verde per il motivo
   sbagliato: il nastro finto era `'1|2||'`, e a respingerlo era
   `motoreV !== MOTORE_V`, non la guardia del vuoto. Con questo falso si
   misura che la prova curata DISCRIMINA: se la riga sparisce, C deve
   diventare rossa. Se restasse verde, la cura non avrebbe curato
   niente.

   DEVE ESSERE MORSO DA: la prova C di strumenti/_q-nastro-tronco.js.
   DEVONO RESTARE VERDI: A, B e D — il marchio di troncatura e il nastro
   normale non c'entrano niente con questa riga.

   uso:  node strumenti/_crit-vuoto-cieco.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

const CERCA = `  if(righe === 0) return no('INCOMPLETO','nastro-vuoto');`;
const METTI = `  /* IL FALSO (_crit-vuoto-cieco.js): la guardia del nastro vuoto non c'e' piu'. */`;

const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_crit-vuoto-cieco.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('FALSO NON COSTRUITO: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
const n = t.split(CERCA).length - 1;
if (n !== 1) { console.error('FALSO NON COSTRUITO: ancoraggio trovato ' + n + ' volte (ne serve 1)'); process.exit(1); }
t = t.replace(CERCA, METTI);
/* e le due guardie vicine devono restare: un falso che rompe tutto non
   dice QUALE prova morde */
for (const [ago, quante] of [["no('INCOMPLETO','nastro-troncato')", 1], ["no('ALTRO MOTORE','motore-diverso')", 1]]) {
  if (t.split(ago).length - 1 !== quante) {
    console.error('FALSO NON COSTRUITO: «' + ago + '» non e\' rimasta al suo posto');
    process.exit(1);
  }
}
fs.writeFileSync(usc, t);
console.log('falso costruito: vuoto-cieco, ' + ing + ' -> ' + usc);
