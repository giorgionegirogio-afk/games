/* =====================================================================
   _crit-duello-contatore.js — IL MUTANTE SENZA AZZERAMENTO
   (voce #131, correzione di revisione del 21 settembre 2026, compito D).

   A COSA SERVE. La revisione finale del cantiere #131 ha trovato la
   prova D di _t-duello-contatore.js VUOTA: leggeva Duel.nDuello dopo
   Reg.accendi() su una pagina che non aveva mai giocato un duello, dove
   il contatore vale gia' zero per conto suo. Un gioco identico in tutto
   tranne l'azzeramento vero passa comunque l'asserzione === 0 — questo
   file costruisce esattamente quel gioco, per condannare il banco
   corretto invece di credergli sulla parola.

   IL FALSO. In Reg.azzeraComandi() (CALCETTO-il-gioco.html:13406) la
   riga

     try{ Duel.nDuello = 0; Duel.passo = 0; }catch(e){}

   diventa

     try{ Duel.passo = 0; }catch(e){}

   cioe' l'azzeramento di Duel.passo resta (per non toccare la prova B),
   ma Duel.nDuello NON viene piu' rimesso a zero quando comincia un
   nastro (Reg.accendi/Reg.deserializza). E' il falso descritto dal
   revisore, verbatim.

   uso:  node strumenti/_crit-duello-contatore.js
         node strumenti/_crit-duello-contatore.js --out fuori/crit-duello-contatore.html

   prova:  node strumenti/_t-duello-contatore.js --gioco fuori/crit-duello-contatore.html
   DEVE uscire 1 (rosso sulla prova D). Un verde qui vorrebbe dire che
   il banco non discrimina.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = path.resolve(RADICE, arg('out', 'fuori/crit-duello-contatore.html'));

const CERCA = `try{ Duel.nDuello = 0; Duel.passo = 0; }catch(e){}`;
const METTI = `try{ /* IL FALSO (voce #131, correzione di revisione): Duel.nDuello
       non si azzera piu' quando comincia un nastro. */ Duel.passo = 0; }catch(e){}`;

const src = fs.readFileSync(inFile, 'utf8');
const n = src.split(CERCA).length - 1;
if (n !== 1) {
  console.error('FALLITO: l\'ancora dell\'azzeramento non si trova esattamente una volta (trovata ' + n + ').');
  process.exit(1);
}
const out = src.replace(CERCA, METTI);
if (out.includes('Duel.nDuello = 0')) {
  console.error('FALLITO dopo la sostituzione: Duel.nDuello = 0 e\' ancora presente.');
  process.exit(1);
}
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  mutante costruito: Duel.nDuello non si azzera piu\' in Reg.azzeraComandi');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
console.log('    prova:  node strumenti/_t-duello-contatore.js --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/'));
console.log('    DEVE uscire 1. Un verde qui vorrebbe dire che il banco non discrimina.');
