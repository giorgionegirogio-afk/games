/* =====================================================================
   _crit-tronco-muto.js — IL MARCHIO C'E' E NESSUNO LO GUARDA
   (voce #132, compito 4: la versione bugiarda del gioco che condanna il
   banco, non il gioco).

   IL FALSO. La riga di tipo 9 si scrive quando il tetto si tocca, si
   serializza, si deserializza, e `Reg.troncato` si riaccende leggendo il
   nastro — il formato e' PERFETTO, e un controllo che guardi solo «il
   nastro porta il marchio» passerebbe. Ma `Sfida.guarda` non lo legge:
   il replay parte lo stesso, arriva a meta' coi comandi e poi finisce da
   solo, e il confronto di fine replay accusa la rosa cresciuta di chi ha
   attaccato.

   E' la meta' che conta: un marchio che nessuno guarda non e' un
   marchio, e' un commento. Il banco deve restare rosso sulla prova B.

   Il rifiuto del nastro VUOTO resta in piedi di proposito: un falso che
   rompe tutto non dice QUALE prova morde.

   uso:  node strumenti/_crit-tronco-muto.js
         node strumenti/_crit-tronco-muto.js --out fuori/crit-tronco-muto.html

   PRIMA DELLA CURA DEL COMPITO 4 QUESTO ATTREZZO NON SI APPLICA, e lo
   dice: il controllo che deve togliere non esiste ancora.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = path.resolve(RADICE, arg('out', 'fuori/crit-tronco-muto.html'));

const CERCA = `    if(Reg.troncato){`;
const METTI = `    /* IL FALSO (_crit-tronco-muto.js): il marchio c'e' nel nastro,
       Reg.troncato e' acceso, e qui non lo guarda nessuno. */
    if(false && Reg.troncato){`;

const src = fs.readFileSync(inFile, 'utf8');
const n = src.split(CERCA).length - 1;
if (n !== 1) {
  console.error('FALLITO: l\'ancora del rifiuto non si trova esattamente una volta (trovata ' + n + ').');
  if (n === 0) console.error('  Prima del compito 4 e\' NORMALE: la cura non e\' ancora applicata.');
  process.exit(1);
}
const out = src.replace(CERCA, METTI);
const attesi = [
  ['if(false && Reg.troncato){', 1],
  ['this.troncato = this.righe.some(r => r[1] === 9);', 1],   /* la bandiera si accende ancora */
  ["pezzi.push(dT + ',9,' + dMs);", 1],                       /* e il marchio viaggia ancora */
  ['if(Reg.righe.length === 0){', 1],                         /* il vuoto resta rifiutato */
];
const rotti = attesi.filter(([s, k]) => (out.split(s).length - 1) !== k)
  .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  falso costruito: il nastro porta il marchio, e chi guarda non lo legge');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
console.log('    prova:  node strumenti/_t-nastro-tronco.js --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/'));
console.log('    DEVE uscire 1. Un verde qui vorrebbe dire che il banco non discrimina.');
