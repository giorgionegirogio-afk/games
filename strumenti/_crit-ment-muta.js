/* =====================================================================
   _crit-ment-muta.js — IL NASTRO CHE DICHIARA E NON RIMETTE IN SCENA
   (voce #132, compito 1: la versione bugiarda del gioco che condanna il
   banco, non il gioco).

   A COSA SERVE UN FALSO. `_q-ment-nastro.js` (`_t-ment-nastro.js` prima
   della promozione a cancello, 21 settembre 2026) dira', a cura applicata,
   «la mentalita' torna». Un banco che dice sempre di si' non prova
   niente: bisogna costruirgli davanti un gioco sbagliato IN UN MODO
   PLAUSIBILE e verificare che lo bocci.

   IL FALSO, ed e' il piu' cattivo che questa cura possa produrre: la
   riga di tipo 8 si SCRIVE, si serializza, si deserializza — il nastro
   e' perfetto, un controllo sul formato lo promuove — ma `Reg.esegui`
   non ha il ramo che la rimette in scena. E' la regressione che un
   rinomina-e-sposta produrrebbe domani: il formato sopravvive, la
   riproduzione no.

   E' PROPRIO LA TRAPPOLA CHE LA REVISIONE DELLA VOCE #131 HA BOCCIATO:
   una prova che guarda solo se il nastro CONTIENE la riga passerebbe
   qui. Il banco deve chiedere anche che la partita rigiocata FINISCA
   come quella giocata — la prova B e la prova C.

   La seconda meta' della cura (il pollice di chi guarda ignorato in
   rilettura) resta intatta di proposito: un falso che rompe tutto non
   dice QUALE prova morde.

   uso:  node strumenti/_crit-ment-muta.js
         node strumenti/_crit-ment-muta.js --out fuori/crit-ment-muta.html

   PRIMA DELLA CURA DEL COMPITO 1 QUESTO ATTREZZO NON SI APPLICA, e lo
   dice: il ramo che deve togliere non esiste ancora.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = path.resolve(RADICE, arg('out', 'fuori/crit-ment-muta.html'));

const CERCA =
`    /* LA MENTALITA' CAMBIATA IN PAUSA (voce #132, compito 1). Non muove
       niente da sola: posa un numero che mentDi leggera' al passo dopo,
       esattamente come fece dal vivo. */
    else if(tipo === 8) posaMentalita(r[3], r[4]);`;
const METTI =
`    /* IL FALSO (_crit-ment-muta.js): la riga di tipo 8 si scrive e si
       legge, ma qui non succede niente. Il nastro dichiara e non
       rimette in scena. */`;

const src = fs.readFileSync(inFile, 'utf8');
const n = src.split(CERCA).length - 1;
if (n !== 1) {
  console.error('FALLITO: l\'ancora del ramo di tipo 8 non si trova esattamente una volta (trovata ' + n + ').');
  if (n === 0) console.error('  Prima del compito 1 e\' NORMALE: il ramo non esiste ancora.');
  process.exit(1);
}
const out = src.replace(CERCA, METTI);
const attesi = [
  ['else if(tipo === 8) posaMentalita(r[3], r[4]);', 0],
  ['Reg.scrivi(8, [0, mNuova]);', 1],                                 /* si scrive ancora */
  ["pezzi.push(dT + ',8,' + dMs + ',' + (r[3]|0) + ',' + (r[4]|0));", 1],  /* e si serializza */
  ['else if(tipo === 8)   this.righe.push([tick, 8, ms, v[3], v[4]]);', 1], /* e si rilegge */
];
const rotti = attesi.filter(([s, k]) => (out.split(s).length - 1) !== k)
  .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  falso costruito: il tipo 8 si scrive e si legge, ma non si rimette in scena');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
console.log('    prova:  node strumenti/_q-ment-nastro.js --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/'));
console.log('    DEVE uscire 1. Un verde qui vorrebbe dire che il banco non discrimina.');
