/* =====================================================================
   _t-sottotitoli-sola.js — LA RIGA DEI SOTTOTITOLI NON RESTA ORFANA.

   Toppa cerca/sostituisci nel formato di casa (modello _t-rivedi-
   tutorial.js). Legge CALCETTO-il-gioco.html (o --in), sostituisce UN
   ancoraggio ESATTO e scrive la copia in --out. Senza --out scrive
   accanto all'originale un file col suffisso .sott-sola.html: MAI
   sull'originale, se non con --dentro. Se l'ancoraggio non compare
   ESATTAMENTE UNA VOLTA si ferma con codice 1 e non scrive niente.

   ---------------------------------------------------------------------
   IL PERCHE'. Trovato mentre si chiudeva l'onda A (voce #112, compito 6,
   eseguendo per la prima volta la batteria intera su questo cantiere):
   `strumenti/disposizione.js` (gia' in batteria da prima di #112) e'
   ROSSO sul gioco di oggi — VERDE sul merge-base 73c1c64 — con "1
   ORFANO, 1 BUCATA" sulla riga di #btnSetSott: "1 voce/i in 2 colonne —
   vuoto 0 a sinistra e 323.5 a destra, sbilancio 50.5% su un massimo di
   25%". Una VERA regressione di questo cantiere, non un difetto
   preesistente: prima del compito 4 la sezione "Accessibilita'" del
   pannello IMPOSTAZIONI aveva DUE voci (MOVIMENTO, ALTO CONTRASTO), un
   numero pari che riempiva la griglia a due colonne senza resti. Il
   compito 4 ha aggiunto SOTTOTITOLI come terza voce della stessa
   sezione: dispari, e l'ultima resta sola sulla sua riga — esattamente
   la forma che il CSS gia' anticipava (:2267-2277, .setwrap>.sola):
   "UNA VOCE SOLA NELLA SUA SEZIONE PRENDE TUTTA LA RIGA... chi domani
   aggiunge una sezione da una voce scrive class='voce sola' e ha
   finito". Il compito 4 ha aggiunto una voce senza applicare quella
   stessa regola gia' scritta per l'occasione — non serviva una riga di
   CSS nuova, serviva la classe che gia' esisteva.

   COSA FA: aggiunge "sola" alle classi del bottone SOTTOTITOLI, accanto
   a "voce sw" (il modificatore di stile "sw", aria-pressed compreso,
   resta intatto — "sola" e' un modificatore di GRIGLIA, non di stile
   del bottone). Nessun'altra riga, nessuna sezione, nessuna classe CSS
   nuova: la regola .setwrap>.sola{grid-column:1/-1} gia' esiste ed e'
   gia' condivisa con #btnSetComandi (la sezione "Comandi", una voce
   sola dal compito che l'ha introdotta).

   COSA NON TOCCA: refreshImpostUI, il flag SAVE.sott, sottotitolo(),
   aria-pressed (il modificatore "sw" resta l'unico che li governa).
   Zero dado(), zero stato che la CPU legge, zero pixel di gioco: solo
   la griglia del pannello IMPOSTAZIONI, chiusa quando il gioco e' in
   pausa o al menu.

   uso:
     node strumenti/_t-sottotitoli-sola.js --elenco
     node strumenti/_t-sottotitoli-sola.js --out fuori/sott-sola.html
     node strumenti/_t-sottotitoli-sola.js --dentro
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;

const ANCORE = [

/* 1 — SOTTOTITOLI diventa una sezione-da-una-voce dichiarata, come
   #btnSetComandi. La classe "sw" resta (aria-pressed, stile toggle);
   "sola" si aggiunge, non sostituisce. */
{
  nome: '1/1 SOTTOTITOLI prende "sola" (non piu\' orfana nella griglia a due colonne)',
  cerca:
`      <button class="voce sw" id="btnSetSott">SOTTOTITOLI: S&Igrave; <small>fischio, gol, palo — a video</small></button>`,
  metti:
`      <button class="voce sw sola" id="btnSetSott">SOTTOTITOLI: S&Igrave; <small>fischio, gol, palo — a video</small></button>`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-sottotitoli-sola.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.sott-sola.html';
outFile = path.resolve(outFile);
if (!dentro && outFile === inFile) {
  console.error('FALLITO: --out coincide con --in. Senza --dentro non si scrive sull\'originale.');
  process.exit(2);
}

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
/* controlli dopo la sostituzione */
const attesi = [
  ['class="voce sw sola" id="btnSetSott"', 1],
  ['class="voce sw" id="btnSetSott"', 0],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => `${s.slice(0, 50)} atteso ${n}, trovato ${out.split(s).length - 1}`);
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log(`OK  ${ANCORE.length} ancoraggi applicati`);
console.log(`    da   ${inFile}  (${src.length} byte)`);
console.log(`    a    ${outFile}  (${out.length} byte, ${out.length - src.length >= 0 ? '+' : ''}${out.length - src.length})`);
console.log('    ora: node strumenti/disposizione.js   deve tornare VERDE');
