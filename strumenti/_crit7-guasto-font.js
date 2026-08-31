/* CRITICO: IL GUASTO VERO, non un surrogato.
   Il difetto costato un mese era «il woff2 non contiene una lettera A-Z».
   Qui lo si riproduce alla lettera, con una unicode-range che toglie
   l'alfabeto ai tre caratteri incorporati: i file restano, si caricano,
   document.fonts.check continua a dire true, e ogni lettera scende al
   ripiego di sistema. E' la forma esatta del difetto del 28 luglio.
   uso: node strumenti/_crit7-guasto-font.js --out fuori/crit-font-vuoto.html
        [--solo archivo]   tocca solo Archivo Black (il marchio) */
const fs = require('fs'), path = require('path');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i+1] && !process.argv[i+1].startsWith('--') ? process.argv[i+1] : d; };
const inFile = path.join(RADICE, 'CALCETTO-il-gioco.html');
const outFile = path.resolve(RADICE, arg('out', 'fuori/crit-font-vuoto.html'));
const solo = arg('solo', '');
if (outFile === inFile) { console.error('FALLITO: --out coincide con --in'); process.exit(2); }
const src = fs.readFileSync(inFile, 'utf8');

/* l'ancoraggio: la riga di stile di ciascuna @font-face. Si aggiunge
   unicode-range dopo font-display, senza toccare il base64. */
const ANCORE = [
  { fam: 'archivo', cerca: `  font-family:'Archivo Black';\n  font-style:normal;font-weight:400 900;font-display:block;\n` },
  { fam: 'barlow7', cerca: `  font-family:'Barlow Condensed';\n  font-style:normal;font-weight:700 900;font-display:block;\n` },
  { fam: 'barlow4', cerca: `  font-family:'Barlow Condensed';\n  font-style:normal;font-weight:400 699;font-display:block;\n` },
];
const RANGE = `  unicode-range:U+0100-017F;\n`;
let out = src, tocchi = 0;
for (const a of ANCORE) {
  if (solo && a.fam !== solo) continue;
  const n = out.split(a.cerca).length - 1;
  if (n !== 1) { console.error('FALLITO: ancoraggio ' + a.fam + ' trovato ' + n + ' volte'); process.exit(1); }
  out = out.replace(a.cerca, a.cerca + RANGE);
  tocchi++;
}
if (!tocchi) { console.error('FALLITO: niente da rompere'); process.exit(1); }
/* controlli dopo: il base64 non si tocca, dado() non si tocca */
if ((out.match(/base64/g) || []).length !== (src.match(/base64/g) || []).length) { console.error('FALLITO: i base64 sono cambiati'); process.exit(1); }
if ((out.match(/\bdado\(\)/g) || []).length !== (src.match(/\bdado\(\)/g) || []).length) { console.error('FALLITO: il conto dei dado() e\' cambiato'); process.exit(1); }
if (out.length !== src.length + tocchi * RANGE.length) { console.error('FALLITO: il file e\' cambiato piu\' del previsto'); process.exit(1); }
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('scritto il GUASTO in ' + outFile + ' (' + tocchi + ' @font-face senza alfabeto A-Z, base64 intatti)');
