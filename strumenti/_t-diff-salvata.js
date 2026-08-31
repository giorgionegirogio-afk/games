/* =====================================================================
   _t-diff-salvata.js — LA DIFFICOLTA' SCELTA VA SU DISCO, QUELLA
   IMPOSTA DAL CALENDARIO NO (31 agosto 2026, dal censimento).

   DUE DIFETTI SPECULARI, stessa radice: la guardia di persistSave
   protegge SAVE.diff solo per matchCtx 'tour'.

   1. Una partita di STAGIONE impone la difficolta' dalla forza
      dell'avversaria (forza 9 → DURO), e persistSave la scrive in
      SAVE.diff come fosse una scelta: dopo una giornata dura le
      amichevoli restano su DURO senza che nessuno l'abbia chiesto.
      Anche il ripristino a fine partita valeva solo per 'tour'.

   2. matchCtx resta 'tour'/'season' da fine partita fino al PROSSIMO
      startMatch: chi esce da un torneo, apre GIOCA e tocca «Duro»
      vede la pastiglia accesa ma SAVE.diff non si scrive (la guardia
      crede di proteggere il torneo che non c'e' piu'); chiusa l'app,
      la scelta e' persa. Si sana tornando al menu: il contesto di una
      partita finita non e' piu' un contesto.

   LE CURE, tre righe:
   · la guardia copre anche 'season';
   · il ripristino di fine partita copre anche 'season';
   · MENU dal tabellino di fine partita azzera matchCtx a 'friendly'.
   Nessun sorteggio consumato, nessun effetto sulla simulazione.

   uso:  node strumenti/_t-diff-salvata.js --out fuori/diff.html
         node strumenti/_t-diff-salvata.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/diff.html'));

const ANCORE = [

/* 1 — la guardia copre anche la stagione */
{
  nome: '1/3 la guardia di persistSave',
  cerca:
`  if(G.matchCtx!=='tour') SAVE.diff=G.diff;`,
  metti:
`  /* anche 'season': la difficolta' di una giornata la impone la forza
     dell'avversaria, non e' una scelta da ricordare (31 agosto 2026) */
  if(G.matchCtx!=='tour' && G.matchCtx!=='season') SAVE.diff=G.diff;`,
},

/* 2 — il ripristino a fine partita copre anche la stagione */
{
  nome: '2/3 il ripristino a fine partita',
  cerca:
`  if(G.matchCtx==='tour'){ G.diff=clamp(SAVE.diff|0,0,2); refreshDiffRows(); }`,
  metti:
`  if(G.matchCtx==='tour'||G.matchCtx==='season'){ G.diff=clamp(SAVE.diff|0,0,2); refreshDiffRows(); }`,
},

/* 3 — tornare al menu chiude il contesto della partita finita */
{
  nome: '3/3 il menu azzera il contesto',
  cerca:
`$('btnMenuEnd').addEventListener('click', ()=>{
  playWipe();
  goScreen(ui.menu); setScene('menu'); Audio5.crowdLevel(0);
});`,
  metti:
`$('btnMenuEnd').addEventListener('click', ()=>{
  playWipe();
  /* il contesto della partita FINITA non deve sopravvivere al menu:
     restava 'tour' e faceva credere alla guardia di persistSave di
     proteggere un torneo che non c'era piu' — la difficolta' toccata
     in GIOCA si accendeva a schermo ma non si scriveva su disco */
  G.matchCtx='friendly';
  goScreen(ui.menu); setScene('menu'); Audio5.crowdLevel(0);
});`,
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
const attesi = [
  ["G.matchCtx!=='tour' && G.matchCtx!=='season'", 1],
  ["G.matchCtx==='tour'||G.matchCtx==='season'", 1],
  /* startMatch usa il ternario, non il letterale: questa e' l'unica */
  ["G.matchCtx='friendly';", 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
