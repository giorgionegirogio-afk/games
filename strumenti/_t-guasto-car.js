/* =====================================================================
   _t-guasto-car.js — IL GUASTO CHE DIMOSTRA IL ROSSO DI _q-carattere.js
   (28 agosto 2026, sera).

   PERCHE' ESISTE. _q-carattere.js e' nato stamattina per il difetto piu'
   caro dell'anno: per un mese i due woff2 del gioco non hanno contenuto
   una sola lettera A-Z e tutto usciva in ripiego di sistema. La sua
   ultima prova — «la O del marchio non si stacca dalla parola» —
   misurava getComputedTextLength() del <text> del marchio. Ma quel
   <text> porta textLength="515", che OBBLIGA il browser a stendere i
   glifi su 515 unita' qualunque carattere vinca la cascata: la
   larghezza misurata era per costruzione quella dichiarata, il vuoto era
   per costruzione 8, e IL CONTROLLO NON POTEVA CADERE. Il referto lo
   scriveva pure, in chiaro, e nessuno l'ha letto:
     «la O del marchio non si stacca dalla parola [vuoto 8 unita' (la
      parola misura 515, dichiarata 515)]»
   Un controllo che stampa il dichiarato come se fosse il misurato e'
   un timbro.

   IL GUASTO, e perche' e' questo. Si cambia il CARATTERE del marchio —
   e solo quello — mettendo al posto di Archivo Black il condensato che
   il gioco ha gia' in casa: Barlow Condensed scrive «CALCETT» in 319,6
   unita' contro le 515 di Archivo Black (misurato oggi). La geometria
   NON si muove (textLength resta, il cerchio resta a cx=561), quindi:
     · il controllo VECCHIO — il vuoto — resta a 8 e resta verde;
     · il controllo NUOVO — lo stiramento — va a 1,611 e diventa rosso.
   Cioe' questo file dimostra due cose in una corsa: che la prova nuova
   sa cadere, e che la vecchia da sola non sapeva.

   COSA SI VEDE A SCHERMO, che e' la ragione per cui e' un difetto e non
   una curiosita': i glifi vengono stirati del 61% in larghezza per
   arrivare a 515. Il marchio del gioco diventa un altro marchio.

   uso:  node strumenti/_t-guasto-car.js --out fuori/car-rotto.html
         node strumenti/_q-carattere.js --gioco fuori/car-rotto.html
         node strumenti/testo-fuori.js  --gioco fuori/car-rotto.html
   Misurato il 28 agosto 2026: _q-carattere 7 su 8 (rosso lo stiramento,
   verde il vuoto), testo-fuori rosso su 2 marchi su 2.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
if (process.argv.indexOf('--dentro') > 0) {
  console.error('FALLITO: questo file scrive un GUASTO. Non entra nel gioco per nessuna ragione.');
  process.exit(2);
}

const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
const outFile = path.resolve(RADICE, arg('out', 'fuori/car-rotto.html'));
if (outFile === inFile) { console.error('FALLITO: --out coincide con --in.'); process.exit(2); }
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

/* L'ANCORAGGIO E' L'ATTRIBUTO, e dev'esserci DUE volte: il marchio e'
   fatto di due <text> sovrapposti (uno fa ombra e contorni, l'altro il
   riempimento a due tinte) e il gioco stesso scrive, accanto, che «i due
   <text> del marchio devono portare gli stessi due attributi». Un guasto
   che ne rompesse uno solo mostrerebbe un difetto che non esiste. */
const CERCA = `font-family="'Archivo Black','Arial Black',sans-serif"`;
const METTI = `font-family="'Barlow Condensed',sans-serif"`;

const src = fs.readFileSync(inFile, 'utf8');
const n = src.split(CERCA).length - 1;
if (n !== 2) {
  console.error('FALLITO: l\'ancoraggio del marchio si trova ' + n + ' volte, ne servono 2. Il guasto non si inietta alla cieca.');
  process.exit(1);
}
const out = src.split(CERCA).join(METTI);

/* e i controlli dopo, come per una toppa vera: un guasto che sbaglia
   bersaglio dimostra il rosso di un'altra cosa */
const rotti = [];
if ((out.split(METTI).length - 1) !== 2) rotti.push('il carattere non e\' stato sostituito due volte');
if (out.split('textLength="515"').length - 1 !== 2) rotti.push('textLength non e\' piu\' su tutti e due i <text>: il guasto cambierebbe anche la geometria, e non e\' quello che deve dimostrare');
if (out.split('<circle cx="561" cy="82" r="38"/>').length - 1 !== 1) rotti.push('il cerchio della O si e\' mosso');
if ((out.match(/\bdado\(\)/g) || []).length !== (src.match(/\bdado\(\)/g) || []).length) rotti.push('il conto dei dado() e\' cambiato');
if (out.length !== src.length + 2 * (METTI.length - CERCA.length)) rotti.push('il file e\' cambiato piu\' del previsto');
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('scritto il GUASTO in ' + outFile + '  (2 <text> del marchio passati al condensato, geometria intatta)');
console.log('adesso questi due DEVONO essere rossi:');
console.log('  node strumenti/_q-carattere.js --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/'));
console.log('  node strumenti/testo-fuori.js  --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/'));
