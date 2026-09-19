/* =====================================================================
   _t-sott-onesto.js — IL SOTTOTESTO DI SOTTOTITOLI DICE SOLO IL VERO
   (voce #122, #116, cantierino "spiccioli seguiti").

   IL PERCHE'. Puro contorno, zero simulazione (il due-versioni resta
   0/60 a ogni taglia: e' testo statico, non una decisione -- non tocca
   dado(), una decisione di gioco o uno stato che la CPU legge).

   IL NUMERO FANTASMA (ricognizione del 19 settembre 2026). Il sottotesto
   del bottone SOTTOTITOLI, scritto in due punti identici del file
   (markup statico :3677 e refreshImpostUI :42096, entrambi nati col
   compito 4 della voce #112, _t-sottotitoli.js), dice
       «fischio, gol, palo — a video»
   ma il flag SAVE.sott governa SOLO l'helper sottotitolo(testo,col,dur)
   (funzione dedicata, voce #112 compito 4): un cancello unico che oggi
   protegge tre soli banner, tutti col testo 'FISCHIO' o
   'FISCHIO FINALE' (fischio d'inizio in startMatch, fischio finale in
   endMatch, fischio di ripresa nei due rami gemelli dentro step()).
   GOL e PALO hanno i loro banner SEMPRE attivi, chiamati bare via
   showBanner() -- mai attraverso sottotitolo(), quindi mai spenti dal
   flag: showBanner('PALO!',...) a :20152 e il festino della rete
   (G.goalCine/drawGoals) restano identici con SOTTOTITOLI: NO. Un
   giocatore che spegne SOTTOTITOLI aspettandosi di perdere anche
   gol/palo scoprirebbe che non e' cosi': il sottotesto promette piu' di
   quanto il flag mantiene.

   LA CURA. Le due stringhe identiche diventano
       «fischio — a video»
   che nomina solo cio' che il flag governa davvero. Nessuna geometria,
   nessuno stato nuovo: due sostituzioni di testo, verbatim.

   uso:
     node strumenti/_t-sott-onesto.js --elenco
     node strumenti/_t-sott-onesto.js --out fuori/sott-onesto.html
     node strumenti/_t-sott-onesto.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/sott-onesto.html'));

/* CONTROLLO ANTI-ATTESTAZIONE: se il testo onesto esiste gia' nel file,
   questo attrezzo si ferma invece di sovrapporsi. */
if (!haFlag('elenco')) {
  const srcGrezzo = fs.readFileSync(inFile, 'utf8');
  if (srcGrezzo.indexOf('fischio — a video') >= 0) {
    console.error('FALLITO: "fischio — a video" esiste gia\' nel file — controllare prima di applicare.');
    process.exit(1);
  }
}

const ANCORE = [

/* 1/2 — markup statico del bottone (id="btnSetSott"), voce #112 compito 4. */
{
  nome: '1/2 markup: sottotesto onesto di btnSetSott',
  cerca:
`<button class="voce sw sola" id="btnSetSott">SOTTOTITOLI: S&Igrave; <small>fischio, gol, palo — a video</small></button>`,
  metti:
`<button class="voce sw sola" id="btnSetSott">SOTTOTITOLI: S&Igrave; <small>fischio — a video</small></button>`,
},

/* 2/2 — refreshImpostUI, il testo che si riscrive ad ogni apertura del
   pannello e ad ogni click sull'interruttore. */
{
  nome: '2/2 refreshImpostUI: sottotesto onesto di btnSetSott',
  cerca:
`  $('btnSetSott').innerHTML='SOTTOTITOLI: '+(SAVE.sott?'SÌ':'NO')+' <small>fischio, gol, palo — a video</small>';`,
  metti:
`  $('btnSetSott').innerHTML='SOTTOTITOLI: '+(SAVE.sott?'SÌ':'NO')+' <small>fischio — a video</small>';`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-sott-onesto.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

const src = fs.readFileSync(inFile, 'utf8');
let out = src;
const mancanti = [];
for (const a of ANCORE) {
  const n = out.split(a.cerca).length - 1;
  if (n !== 1) { mancanti.push({ nome: a.nome, n, a }); continue; }
  out = out.replace(a.cerca, a.metti);
}
if (mancanti.length) {
  console.error('FALLITO: ancoraggi che non compaiono esattamente una volta — niente e\' stato scritto.');
  for (const m of mancanti) {
    console.error(`  · ${m.nome}: trovato ${m.n} volte`);
    console.error('    testo cercato:\n' + m.a.cerca.split('\n').map(r => '      ' + r).join('\n'));
  }
  process.exit(1);
}

/* controlli dopo la sostituzione: il testo nuovo compare 2 volte, il
   vecchio 0. */
const conta = (testo, s) => testo.split(s).length - 1;
const rotti = [];
if (conta(out, 'fischio — a video') !== 2) rotti.push('"fischio — a video" atteso 2 volte, trovato ' + conta(out, 'fischio — a video'));
if (conta(out, 'fischio, gol, palo — a video') !== 0) rotti.push('"fischio, gol, palo — a video" residuo: ' + conta(out, 'fischio, gol, palo — a video') + ' occorrenze');
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
