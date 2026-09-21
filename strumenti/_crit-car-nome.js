/* =====================================================================
   _crit-car-nome.js — L'INDICE NEL NASTRO, MA IN RILETTURA ANCORA IL
   NOME (voce #132, compito 2: la versione bugiarda del gioco che
   condanna il banco, non il gioco).

   IL FALSO, ed e' il piu' cattivo che questa cura possa produrre:
   `Sfida.gioca` calcola l'indice, lo scrive in coda al tipo 7 e lo passa
   a startMatch — il nastro e' PERFETTO, un controllo sul formato lo
   promuove — ma `Sfida.guarda` non lo passa: la squadra 1 del replay
   ricade su `caratterePer(G.oppName)`, cioe' sul nome di OGGI.

   E' la regressione plausibile di domani: due capi, uno solo aggiornato.
   Un banco che guarda solo se il nastro CONTIENE l'indice passerebbe
   qui — ed e' esattamente l'errore che la revisione della voce #131 ha
   bocciato. Il banco deve chiedere anche che la partita rigiocata
   FINISCA come quella giocata (prova B) e che la CPU del replay abbia lo
   stesso carattere (prova C).

   uso:  node strumenti/_crit-car-nome.js
         node strumenti/_crit-car-nome.js --out fuori/crit-car-nome.html

   PRIMA DELLA CURA DEL COMPITO 2 QUESTO ATTREZZO NON SI APPLICA, e lo
   dice: il passaggio che deve togliere non esiste ancora.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = path.resolve(RADICE, arg('out', 'fuori/crit-car-nome.html'));

const CERCA = `             ment:mentDif, car:carDif, rosa:rosaDif },`;
const METTI = `             /* IL FALSO (_crit-car-nome.js): l'indice c'e' nel nastro, e'
                stato letto in carDif, e qui non si passa. La squadra 1
                del replay ricade sul NOME di oggi. */
             ment:mentDif, rosa:rosaDif },`;

const src = fs.readFileSync(inFile, 'utf8');
const n = src.split(CERCA).length - 1;
if (n !== 1) {
  console.error('FALLITO: l\'ancora di opp.car non si trova esattamente una volta (trovata ' + n + ').');
  if (n === 0) console.error('  Prima del compito 2 e\' NORMALE: la cura non e\' ancora applicata.');
  process.exit(1);
}
const out = src.replace(CERCA, METTI);
const attesi = [
  ['car:carDif, rosa:rosaDif },', 0],                        /* tolto in rilettura */
  ['if(dati.length > p2.fine) carDif = dati[p2.fine];', 1],  /* ma letto lo stesso */
  ['impaccaRosa(a.rosa), [iCarSua]));', 1],                  /* e scritto lo stesso */
  ['car: iCarSua,', 1],                                      /* e usato in registrazione */
];
const rotti = attesi.filter(([s, k]) => (out.split(s).length - 1) !== k)
  .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  falso costruito: l\'indice e\' nel nastro, ma il replay legge ancora il nome');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
console.log('    prova:  node strumenti/_t-carattere-nastro.js --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/'));
console.log('    DEVE uscire 1. Un verde qui vorrebbe dire che il banco non discrimina.');
