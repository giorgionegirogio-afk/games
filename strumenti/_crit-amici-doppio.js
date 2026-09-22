/* =====================================================================
   _crit-amici-doppio.js — LO STESSO CODICE CONTA DUE VOLTE (voce #136,
   compito 2). Il falso che condanna C2.

   CHE COSA FALSIFICA. La memoria dei semi sparisce: la riga si scrive,
   la lista si tappa, tutto funziona — solo che chi incolla due volte lo
   stesso codice si segna due vittorie. E' lo sbaglio piu' probabile di
   tutti: un messaggio si rilegge, un pollice ripete, e un codice di
   ventuno caratteri si incolla in un secondo.

   E' IL CASO PEGGIORE perche' non si vede da nessun'altra parte: il
   codice e' identico, la classifica si compila, le due si specchiano,
   il salvataggio e' additivo, i tetti reggono, il riavvio regge. Un
   banco che guardasse solo «la riga c'e'» non lo prenderebbe mai.

   L'ESITO ATTESO: ROSSO su C2, VERDE su tutto il resto.

   uso:  node strumenti/_crit-amici-doppio.js
         node strumenti/_q-amici.js --solo A,B,C --gioco fuori/gioco-amici-doppio.html
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = path.resolve(RADICE, arg('out', 'fuori/gioco-amici-doppio.html'));

const A = `    if(r.semi.indexOf(seme) >= 0) return { errore:'gia-segnata', nome:nome, riga:r };
    r.semi.push(seme);`;
const B = `    /* IL FALSO (voce #136, _crit-amici-doppio): la guardia del doppione
       non c'e'. I semi si ricordano lo stesso — cosi' il tetto di C7
       regge e il falso non cade dove non deve — ma nessuno li guarda. */
    r.semi.push(seme);`;

const src = fs.readFileSync(inFile, 'utf8');
const n = src.split(A).length - 1;
if (n !== 1) { console.error('FALLITO: ancora trovata ' + n + ' volte invece di 1'); process.exit(1); }
const out = src.replace(A, B);
const attesi = [
  ["errore:'gia-segnata'", 0],
  ['    r.semi.push(seme);', 1],
  ['while(r.semi.length > AMICI_SEMI) r.semi.shift();', 1],
  ['const Amici = {', 1],
];
const rotti = attesi.filter(([s, k]) => (out.split(s).length - 1) !== k)
  .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  il doppione passa: la guardia del seme non c\'e\' piu\'');
console.log('    a    ' + outFile + '  (' + out.length + ' caratteri, ' + (out.length - src.length) + ')');
console.log('    prova:  node strumenti/_q-amici.js --solo C --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/'));
console.log('    ATTESO: ROSSO su C2, VERDE su tutto il resto');
