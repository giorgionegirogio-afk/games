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

   SEMBRAVA IL FALSO PEGGIORE. In REGISTRAZIONE non cambia un numero:
   `Duel.passo` viene incrementato una volta per aggiornamento comunque,
   e il dito legge lo stesso valore. E' solo in RILETTURA che i comandi
   vengono rimessi in scena un aggiornamento piu' tardi, quando il
   cursore ha gia' fatto un altro passo — 0,01917 di corsa, fra il 10% e
   il 20% della banda. Il dossier #131 lo dava per letale, e questo
   attrezzo e' nato per quello.

   RETTIFICA A EDIZIONI (21 settembre 2026, voce #131, compito 5).
   MISURATO: NON e' letale. Su tre semi e otto duelli
   (_t-duello-rigioca.js) la partita rigiocata sul mutante e' identica a
   quella registrata sul mutante, esito per esito e cursore alla quinta
   cifra.

   E la ragione non e' che il banco non guarda: e' una proprieta' vera
   del duello. pickZone AZZERA il cursore (`this.cursor=0`, :22344).
   Quindi il cursore che stopPower legge non dipende da QUANDO cadono i
   due comandi, ma solo da QUANTI aggiornamenti stanno FRA l'uno e
   l'altro — e uno spostamento UNIFORME li sposta tutti e due,
   conservando l'intervallo. Misurato: 15 aggiornamenti prima, 15 dopo,
   cursore 0,2875 in tutti e due i casi.

   Il falso che il dossier aveva davvero misurato — «spostare stopPower
   di 1 aggiornamento cambia 6/132 esiti» — e' un'altra cosa: sposta UN
   verbo solo, quindi l'intervallo cambia. Quello vive in
   _crit-duello-scarto.js, ed e' il mutante che il banco deve bocciare.

   A COSA SERVE ANCORA QUESTO FILE. A tenere onesta la misura qui sopra:
   _t-duello-rigioca.js lo costruisce a ogni corsa e verifica che il suo
   nastro DIFFERISCA da quello del gioco sano. Se un giorno l'attrezzo
   smettesse di mordere, la frase «il gioco lo sopravvive» diventerebbe
   vera per il motivo sbagliato e nessuno se ne accorgerebbe.

   uso:  node strumenti/_crit-duello-passo.js
         node strumenti/_crit-duello-passo.js --out fuori/crit-duello-passo.html

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
