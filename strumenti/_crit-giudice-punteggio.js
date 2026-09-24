/* =====================================================================
   _crit-giudice-punteggio.js - UNA VERSIONE BUGIARDA DEL GIOCO
   (voce #148, compito 1 - falso per condannare il banco)

   IL GIUDICE CONFRONTA `G.score` INVECE DEI RIGORI SEGNATI. Apre la
   serie, la rigioca bene, la rigioca tutta - e poi guarda il numero
   sbagliato: dopo una serie `G.score` vale 1-0 o 0-1, perche' e' la rete
   che decide, aggiunta da `programmaRigore` per chiudere la partita.

   E' IL FALSO PIU' SOTTILE DEI SETTE, e si distingue da «serie-cieca»
   proprio per il numero di passi: qui la rigiocata e' corta e giusta,
   quindi A5 resta VERDE e cadono solo A1 e A2. Un banco che mordesse
   tutti e due i falsi con la stessa prova non starebbe distinguendo
   niente.

   E IL BANCO HA DOVUTO PAGARSELO: perche' questo falso morda SEMPRE, la
   serie misurata non puo' finire 1-0 o 0-1 - la' i due numeri
   coinciderebbero e la bugia passerebbe. Il banco cerca una serie con un
   punteggio distinguibile e, se in cinque appuntamenti non la trova,
   dichiara PROVA NULLA invece di inventare un verde.
   DEVE ESSERE MORSO DA: A1, A2.
   Se non lo e', il buco e' nel banco e si ripara il banco, non il falso.

   SI COSTRUISCE SOPRA LA CURA (strumenti/_toppa-148-differita.js): prima
   della cura l'ancoraggio non esiste, e il falso rifiuta di nascere.

   uso:  node strumenti/_crit-giudice-punteggio.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

const COPPIE = [
  [`  const gol = (disco && G.rigori) ? [G.rigori.seg[0]|0, G.rigori.seg[1]|0]
                                  : [G.score[0]|0, G.score[1]|0];`,
   `  const gol = [G.score[0]|0, G.score[1]|0];`],
];

const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_crit-giudice-punteggio.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('FALSO NON COSTRUITO: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
for (const [cerca, metti] of COPPIE) {
  const n = t.split(cerca).length - 1;
  if (n !== 1) { console.error('FALSO NON COSTRUITO: ancoraggio trovato ' + n + ' volte (ne serve 1)'); process.exit(1); }
  t = t.replace(cerca, metti);
}
fs.writeFileSync(usc, t);
console.log('falso costruito: giudice-punteggio, ' + ing + ' -> ' + usc);
