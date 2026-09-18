/* =====================================================================
   _t-vib-css.js — I TRE BOTTONI DELLA VIBRAZIONE EREDITANO LO STILE
   (voce #112, correzione revisione compito 2, ramo voce-112-spiccioli-ux).

   IL PERCHE'. Il compito 2 (commit 24421ca) ha copiato #vibRow dal
   pattern .diff-row solo in markup+JS: tre bottoni con class="vib",
   una refreshVibRow() che ne sincronizza .sel. Ma i due selettori CSS
   della famiglia (~riga 519 e ~riga 530) non sono mai stati toccati:
   .diff,.tbtn,.taglia,.ment,.sponde{...} e
   .diff.sel,.tbtn.sel,.taglia.sel{...} non elencano .vib. Risultato: i
   tre bottoni rendono con lo stile di default del browser (grigio,
   fuori posto nel pannello scuro), e lo stato selezionato e' invisibile
   (.vib.sel mai distinto da .vib). Il banco non l'ha preso perche'
   misura lo stato logico (classList/SAVE.vibInt), non il rendering.

   LA CURA e' un aggiunta di due nomi a due elenchi di selettori GIA'
   ESISTENTI — non una tinta nuova, non una regola concorrente: .vib
   eredita esattamente lo stile di .diff/.taglia/.sponde, .vib.sel
   eredita esattamente lo stile di .diff.sel/.taglia.sel. Zero righe di
   dichiarazioni nuove.

   uso:  node strumenti/_t-vib-css.js --out fuori/a2b-vibcss.html
         node strumenti/_t-vib-css.js --dentro
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/a2b-vibcss.html'));

/* CONTROLLO ANTI-ATTESTAZIONE: se .vib e' gia' nell'elenco della
   famiglia, questo attrezzo si ferma invece di sovrapporsi in silenzio. */
const srcGrezzo = fs.readFileSync(inFile, 'utf8');
if (srcGrezzo.indexOf('.diff,.tbtn,.taglia,.ment,.sponde,.vib{') >= 0) {
  console.error('FALLITO: ".vib" e\' gia\' nel selettore della famiglia — controllare prima di applicare.');
  process.exit(1);
}

const ANCORE = [

/* 1/2 — il selettore della famiglia (~riga 519): .vib eredita font,
   colore, bordo e cursore di .diff/.tbtn/.taglia/.ment/.sponde. */
{
  nome: '1/2 selettore famiglia: .vib aggiunto accanto a .sponde',
  cerca:
`.diff,.tbtn,.taglia,.ment,.sponde{
`,
  metti:
`.diff,.tbtn,.taglia,.ment,.sponde,.vib{
`,
},

/* 2/2 — il selettore dello stato selezionato (~riga 530): .vib.sel
   eredita il gesso pieno di .diff.sel/.tbtn.sel/.taglia.sel. */
{
  nome: '2/2 selettore selezionato: .vib.sel aggiunto accanto a .taglia.sel',
  cerca:
`.diff.sel,.tbtn.sel,.taglia.sel{color:#12210f;background:var(--gesso);border-color:var(--gesso);font-weight:700}`,
  metti:
`.diff.sel,.tbtn.sel,.taglia.sel,.vib.sel{color:#12210f;background:var(--gesso);border-color:var(--gesso);font-weight:700}`,
},

];

const src = fs.readFileSync(inFile, 'utf8');
let out = src;
const mancanti = [];
for (const a of ANCORE) {
  const n = out.split(a.cerca).length - 1;
  if (n !== 1) { mancanti.push({ nome: a.nome, n }); continue; }
  out = out.replace(a.cerca, a.metti);
}
if (mancanti.length) {
  console.error('FALLITO: ancoraggi non trovati esattamente una volta.');
  for (const m of mancanti) console.error('  · ' + m.nome + ': trovato ' + m.n + ' volte');
  process.exit(1);
}

const conta = (testo, s) => testo.split(s).length - 1;
const attesi = [
  ['.diff,.tbtn,.taglia,.ment,.sponde,.vib{', 1],
  ['.diff.sel,.tbtn.sel,.taglia.sel,.vib.sel{', 1],
];
const rotti = attesi.filter(([s, n]) => (conta(out, s) - conta(src, s)) !== n)
  .map(([s, n]) => s + ' atteso +' + n + ', trovato +' + (conta(out, s) - conta(src, s)));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
