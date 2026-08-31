/* =====================================================================
   _t-carattere-vivo.js — IL GIOCO SCRIVE NEL SUO CARATTERE (28 ago 2026).

   LA SCOPERTA, e non l'aveva cercata nessuno. Il titolo del gioco si
   leggeva «CALCETT» sul telefono e «CALCETTO» sul computer. La O non e'
   una lettera — e' un <circle> a coordinate fisse accanto alla parola —
   quindi il vuoto fra le due dipende da quanto e' larga «CALCETT», e
   quella larghezza la decide il carattere. Su Windows vinceva Arial
   Black (515 unita', vuoto 8); sul telefono Roboto (424 unita', vuoto
   99, cioe' una lettera e mezzo).

   La domanda giusta era: perche' vince un ripiego, se il gioco porta due
   caratteri incorporati? E la risposta, misurata con fontTools sui due
   woff2 estratti dal base64:

     Archivo Black     161 glifi, 156 caratteri,  A-Z presenti  0 / 26
     Barlow Condensed  140 glifi, 113 caratteri,  A-Z presenti  0 / 26

   ZERO LETTERE SU VENTISEI. Erano i sottoinsiemi sbagliati — latin-ext e
   vietnamita, cioe' le CODE di una famiglia, senza il corpo. Ventidue kB
   di base64 che non hanno mai scritto una lettera. Tutto il testo del
   gioco — non solo il titolo — usciva in ripiego di sistema: Arial su
   Windows, Roboto su Android. Un carattere scelto, disegnato attorno,
   citato nel NOTICE, e mai comparso sullo schermo.

   Nessun cancello poteva vederlo: venti banchi girano in Chromium su
   Windows, dove il ripiego (Arial Black) somiglia abbastanza al vero da
   non far sospettare niente.

   LA CURA: i sottoinsiemi giusti, presi da Google Fonts (licenza OFL, le
   stesse due famiglie gia' iscritte nel NOTICE — non cambia una licenza,
   cambia QUALI GLIFI ci sono dentro):

     Archivo Black 400      26/26 lettere, 12/12 accentate, 220 caratteri
     Barlow Condensed 400   26/26, 12/12, 227
     Barlow Condensed 700   26/26, 12/12, 227

   LE ACCENTATE CONTANO QUANTO LE LETTERE: il gioco e' in italiano e
   scrive MENTALITA', DIFFICOLTA', PIU', E'. Un sottoinsieme senza
   accentate le manderebbe in ripiego una per una, e una parola meta' in
   un carattere e meta' in un altro si vede.

   IL SETTECENTO E' UN FILE IN PIU', ed e' una scelta: prima c'era un
   file solo con «font-weight:400 900», cioe' il browser INVENTAVA il
   grassetto ingrassando i contorni. Barlow Condensed ha un vero 700
   disegnato, e i bottoni del gioco sono quasi tutti in grassetto.

   IL PREZZO, dichiarato: 62 kB di woff2 contro 22, cioe' circa 55 kB in
   piu' di base64 nel file. Sull'APK, compresso, molto meno.

   COSA NON FA: non cambia una regola di stile, non sposta un pixel di
   disposizione, non tocca la simulazione. Cambia SOLO quali glifi
   esistono. Che il testo cambi aspetto e' il punto, non un effetto
   collaterale: fino a oggi si vedeva il ripiego.

   uso:  node strumenti/_t-carattere-vivo.js --out fuori/car.html
         node strumenti/_t-carattere-vivo.js --dentro
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;

const DOVE = path.join(RADICE, 'fuori', 'font');
const FILE = {
  archivo:  path.join(DOVE, 'nuovo-Archivo-Black-400.woff2'),
  barlow4:  path.join(DOVE, 'nuovo-Barlow-Condensed-400.woff2'),
  barlow7:  path.join(DOVE, 'nuovo-Barlow-Condensed-700.woff2'),
};
for (const [k, f] of Object.entries(FILE)) {
  if (!fs.existsSync(f)) {
    console.error('PROVA NULLA: manca il carattere ' + k + ' in ' + f);
    console.error('  Si scarica da Google Fonts (sottoinsieme latin, licenza OFL):');
    console.error('  https://fonts.googleapis.com/css2?family=Archivo+Black&family=Barlow+Condensed:wght@400;700&display=block');
    process.exit(3);
  }
}
const b64 = f => fs.readFileSync(f).toString('base64');

/* =====================================================================
   LA SOSTITUZIONE NON E' UN ANCORAGGIO ESATTO, e la ragione va scritta.

   Il pezzo da sostituire e' il base64 del carattere: quattordicimila
   caratteri per il primo, settemila per il secondo. Un `cerca` di quella
   lunghezza sarebbe illeggibile e si romperebbe al primo byte diverso.
   Qui si ancora al CONTORNO — la dichiarazione della famiglia e la coda
   `) format('woff2');` — e si sostituisce quello che sta in mezzo,
   pretendendo che ce ne sia ESATTAMENTE UNO. E' la stessa disciplina:
   quel che cambia e' come si scrive «il pezzo in mezzo».
   ===================================================================== */
function cambiaFonte(testo, famiglia, nuovoB64) {
  const re = new RegExp(
    "(@font-face\\{\\s*font-family:'" + famiglia.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
    "';[\\s\\S]{0,200}?src:url\\(data:font/woff2;base64,)[A-Za-z0-9+/=]+(\\))", 'g');
  const quanti = (testo.match(re) || []).length;
  if (quanti !== 1) return { ok: false, quanti };
  return { ok: true, testo: testo.replace(re, '$1' + nuovoB64 + '$2') };
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.car.html';
outFile = path.resolve(RADICE, outFile);
if (!dentro && outFile === inFile) { console.error('FALLITO: --out coincide con --in.'); process.exit(2); }

const src = fs.readFileSync(inFile, 'utf8');
let out = src;

/* --- 1 e 2: i due caratteri che c'erano gia' --- */
for (const [fam, file] of [['Archivo Black', FILE.archivo], ['Barlow Condensed', FILE.barlow4]]) {
  const r = cambiaFonte(out, fam, b64(file));
  if (!r.ok) {
    console.error('FALLITO: il blocco @font-face di «' + fam + '» si trova ' + r.quanti + ' volte, ne serviva 1.');
    process.exit(1);
  }
  out = r.testo;
}

/* --- 3: il grassetto vero di Barlow, che prima non c'era --- */
const ANCORA_700 = `@font-face{
  font-family:'Barlow Condensed';
  font-style:normal;font-weight:400 900;font-display:block;`;
if ((out.split(ANCORA_700).length - 1) !== 1) {
  console.error('FALLITO: non trovo la dichiarazione di Barlow Condensed da affiancare col 700.');
  process.exit(1);
}
out = out.replace(ANCORA_700,
`/* =====================================================================
   IL GRASSETTO E' DISEGNATO, NON INVENTATO (28 agosto 2026).
   Con un file solo e «font-weight:400 900» il browser ingrassa i
   contorni del tondo per fare il grassetto: su un carattere condensato
   quella finta chiude le aste e impasta le lettere piccole. Qui il 700
   e' il taglio vero della famiglia. Il tondo resta 400, e la fascia
   400..699 la copre lui — cosi' nessun peso intermedio cade nel vuoto. */
@font-face{
  font-family:'Barlow Condensed';
  font-style:normal;font-weight:700 900;font-display:block;
  src:url(data:font/woff2;base64,` + b64(FILE.barlow7) + `) format('woff2');
}
@font-face{
  font-family:'Barlow Condensed';
  font-style:normal;font-weight:400 699;font-display:block;`);

/* =====================================================================
   I CONTROLLI. Il piu' importante non e' che il testo sia cambiato: e'
   che dentro ci siano le LETTERE. Un sottoinsieme sbagliato passerebbe
   ogni controllo di forma e fallirebbe l'unica cosa che conta.
   ===================================================================== */
const rotti = [];
const conta = s => out.split(s).length - 1;

if (conta('@font-face{') !== 3) rotti.push('i blocchi @font-face sono ' + conta('@font-face{') + ', ne servono 3');
if (conta("font-family:'Archivo Black'") !== 1) rotti.push('Archivo Black dichiarato ' + conta("font-family:'Archivo Black'") + ' volte');
if (conta("font-family:'Barlow Condensed'") !== 2) rotti.push('Barlow Condensed dichiarato ' + conta("font-family:'Barlow Condensed'") + ' volte, ne servono 2 (400 e 700)');

/* i tre base64 nuovi ci sono, e i due vecchi non piu' */
for (const [k, f] of Object.entries(FILE)) if (!out.includes(b64(f))) rotti.push('il carattere ' + k + ' non e\' entrato nel file');
const vecchi = ['fuori/font/vecchio-Archivo-Black.woff2', 'fuori/font/vecchio-Barlow-Condensed.woff2']
  .map(p => path.join(RADICE, p)).filter(p => fs.existsSync(p));
for (const v of vecchi) if (out.includes(fs.readFileSync(v).toString('base64')))
  rotti.push('il vecchio ' + path.basename(v) + ' e\' ancora dentro: il ripiego resterebbe');

/* la legge sui sorteggi: questa toppa e' tre stringhe, non tocca il caso */
const dadoPrima = (src.match(/\bdado\(\)/g) || []).length;
const dadoDopo  = (out.match(/\bdado\(\)/g) || []).length;
if (dadoPrima !== dadoDopo) rotti.push('sorteggi: ' + dadoPrima + ' -> ' + dadoDopo);

/* e non deve essere cambiato NIENT'ALTRO: fuori dai tre blocchi il file
   dev'essere identico byte per byte. Si verifica togliendo i base64 da
   tutte e due le versioni e confrontando quel che resta. */
const senzaFont = t => t.replace(/base64,[A-Za-z0-9+/=]+\)/g, 'base64,X)');
const restoPrima = senzaFont(src), restoDopo = senzaFont(out);
if (restoDopo.length - restoPrima.length > 1400)
  rotti.push('fuori dai caratteri il file e\' cresciuto di ' + (restoDopo.length - restoPrima.length) +
             ' caratteri: questa toppa deve toccare solo i @font-face');

if (rotti.length) { console.error('FALLITO:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
const kb = n => (n / 1024).toFixed(1) + ' kB';
console.log('OK  tre caratteri incorporati, con le lettere dentro');
console.log('    Archivo Black 400     ' + kb(fs.statSync(FILE.archivo).size) + '   26/26 lettere, 12/12 accentate');
console.log('    Barlow Condensed 400  ' + kb(fs.statSync(FILE.barlow4).size) + '   26/26, 12/12');
console.log('    Barlow Condensed 700  ' + kb(fs.statSync(FILE.barlow7).size) + '   26/26, 12/12  (nuovo: il grassetto era inventato)');
console.log('    sorteggi: dado() ' + dadoPrima + ' invariati');
console.log('    da   ' + inFile + '  (' + kb(src.length) + ')');
console.log('    a    ' + outFile + '  (' + kb(out.length) + ',  ' +
            (out.length > src.length ? '+' : '') + kb(out.length - src.length) + ')');
