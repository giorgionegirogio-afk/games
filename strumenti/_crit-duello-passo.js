/* =====================================================================
   _crit-duello-passo.js — IL MUTANTE DA UN FOTOGRAMMA
   (voce #131, compito 1: la versione bugiarda del gioco che condanna il
   banco, non il gioco).

   A COSA SERVE UN MUTANTE. `_t-duello-nastro.js` dira', dopo il compito
   5, «la serie rigiocata e' la stessa». Ma un banco che dice sempre di
   si' non prova niente: bisogna costruirgli davanti un gioco SBAGLIATO
   in un modo plausibile e verificare che lo bocci. Un falso troppo
   gentile non condanna nessuno — qui il falso e' il piu' cattivo che
   esista in questo cantiere.

   IL FALSO. `Reg.passoDuello()` e' la prima istruzione di `Duel.update`:
   deve girare PRIMA che il cursore della barra avanzi (:22480), perche'
   `stopPower` legge `this.cursor` ALL'ISTANTE della chiamata (:22366) e
   dal vivo il dito arriva FRA due aggiornamenti. Questo mutante la
   sposta DOPO il corpo dell'aggiornamento — un fotogramma, 16,7 ms.

   PERCHE' E' IL FALSO PEGGIORE. In REGISTRAZIONE non cambia un numero:
   `Duel.passo` viene incrementato una volta per aggiornamento comunque,
   e il dito legge lo stesso valore. Un gioco cosi' sembra funzionare
   perfettamente a chi gioca. E' solo in RILETTURA che il comando viene
   rimesso in scena un aggiornamento troppo tardi, quando il cursore ha
   gia' fatto un altro passo: 0,01917 di corsa, cioe' fra il 10% e il 20%
   della banda. MISURATO nel dossier: cambia 6 esiti su 132 (5%), il
   conto dei sorteggi in 5 partite su 40 e il PUNTEGGIO FINALE in 2 su 40.

   Il 5% sugli esiti non basterebbe a farlo cadere su quattro rigori: e'
   per questo che `_t-duello-nastro.js` confronta il CURSORE a cinque
   decimali e non solo il gol. Un aggiornamento di scarto sul cursore si
   vede sempre, al primo duello.

   uso:  node strumenti/_crit-duello-passo.js
         node strumenti/_crit-duello-passo.js --out fuori/crit-duello-passo.html
   poi:  node strumenti/_t-duello-nastro.js --gioco fuori/crit-duello-passo.html
         -> DEVE uscire 1. Se esce 0, il banco attesta invece di misurare.

   PRIMA DEL COMPITO 5 QUESTO ATTREZZO NON SI APPLICA, e lo dice: il
   gancio che deve spostare non esiste ancora.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = path.resolve(RADICE, arg('out', 'fuori/crit-duello-passo.html'));

const CERCA =
`      Reg.passoDuello();
      return veroUpdate.call(this, dt);`;
const METTI =
`      /* IL FALSO: il gancio dopo il corpo invece che prima. In
         registrazione non cambia niente; in rilettura ogni comando
         del duello arriva un aggiornamento in ritardo. */
      const esito = veroUpdate.call(this, dt);
      Reg.passoDuello();
      return esito;`;

const src = fs.readFileSync(inFile, 'utf8');
const n = src.split(CERCA).length - 1;
if (n !== 1) {
  console.error('FALLITO: l\'ancora del gancio non si trova esattamente una volta (trovata ' + n + ').');
  if (n === 0) console.error('  Prima del compito 5 e\' NORMALE: Reg.passoDuello() non e\' ancora dentro Duel.update.');
  process.exit(1);
}
const out = src.replace(CERCA, METTI);
if (out.split('Reg.passoDuello();').length - 1 !== 1) {
  console.error('FALLITO dopo la sostituzione: Reg.passoDuello() non compare esattamente una volta.');
  process.exit(1);
}
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  mutante costruito: il gancio del duello e\' spostato di UN aggiornamento');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
console.log('    prova:  node strumenti/_t-duello-nastro.js --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/'));
console.log('    DEVE uscire 1. Un verde qui vorrebbe dire che il banco non discrimina.');
