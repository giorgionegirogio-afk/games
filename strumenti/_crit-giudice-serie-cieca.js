/* =====================================================================
   _crit-giudice-serie-cieca.js - UNA VERSIONE BUGIARDA DEL GIOCO
   (voce #148, compito 1 - falso per condannare il banco)

   IL GIUDICE NON APRE LA SERIE. Le tre righe ci sono tutte, le
   testimonianze pure, l'impronta torna: il vaglio passa, e poi la
   rigiocata macina novanta secondi di calcio dentro i quali i comandi
   del duello non hanno nessun duello in cui cadere.

   E' IL GIOCO DI IERI PIU' LE TRE RIGHE, cioe' esattamente la cura che
   il #147 aveva stimato e che la misura ha bocciato
   (strumenti/_sonda-148-differita.js: NON TORNA, atteso [4,3],
   rigiocato [3,2], 8462 passi). Averlo qui come falso non e' una
   ricostruzione storica: e' la prova che il banco distingue «il nastro
   porta tutto» da «la serie si rigioca davvero», che sono due cose
   diverse e che a occhio si confondono.

   A5 lo morde da un'altra parte, ed e' il suo lato piu' istruttivo: la
   rigiocata costa migliaia di passi invece di qualche centinaio.
   DEVE ESSERE MORSO DA: A1, A2, A5.
   Se non lo e', il buco e' nel banco e si ripara il banco, non il falso.

   SI COSTRUISCE SOPRA LA CURA (strumenti/_toppa-148-differita.js): prima
   della cura l'ancoraggio non esiste, e il falso rifiuta di nascere.

   uso:  node strumenti/_crit-giudice-serie-cieca.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

const COPPIE = [
  [`    if(disco){
      G.kickTeam = disco.primo;
      avviaRigori();
    }`,
   `    if(disco && disco.v === -1){
      G.kickTeam = disco.primo;
      avviaRigori();
    }`],
];

const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_crit-giudice-serie-cieca.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('FALSO NON COSTRUITO: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
for (const [cerca, metti] of COPPIE) {
  const n = t.split(cerca).length - 1;
  if (n !== 1) { console.error('FALSO NON COSTRUITO: ancoraggio trovato ' + n + ' volte (ne serve 1)'); process.exit(1); }
  t = t.replace(cerca, metti);
}
fs.writeFileSync(usc, t);
console.log('falso costruito: giudice-serie-cieca, ' + ing + ' -> ' + usc);
