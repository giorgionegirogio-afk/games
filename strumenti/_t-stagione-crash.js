/* =====================================================================
   _t-stagione-crash.js — LA STAGIONE MUORE ALLA SECONDA APERTURA
   (31 agosto 2026, dal censimento del manuale — verificato dal vivo).

   IL DIFETTO. buildStagioneUI scrive $('seaPlaySub').textContent e
   SUBITO DOPO sovrascrive btnSeaPlay.innerHTML con uno <small> SENZA
   id: il primo giro consuma l'elemento statico, dal secondo giro
   $('seaPlaySub') e' null e la funzione muore in TypeError («Cannot set
   properties of null») gia' sul percorso NUOVA STAGIONE → menu →
   STAGIONE. A cascata: l'etichetta di GIOCA LA GIORNATA resta ferma
   allo stile dell'avversaria precedente, e il toggle di visibilita' di
   btnSeaRisultati — che sta DOPO la riga che esplode — non gira mai
   piu': «RISULTATI DELL'ULTIMA GIORNATA» non e' mai comparso per
   nessuno. Una funzione intera irraggiungibile dall'interfaccia.

   LA CURA, minima: l'id viaggia DENTRO l'innerHTML, in tutti e due i
   rami che riscrivono il bottone, e la riga orfana sparisce. Cosi'
   l'elemento non muore mai e le righe dopo di lui tornano a girare.
   (Il gemello del torneo, tourPlaySub, ha la stessa malattia ma senza
   crash — nessuno lo riscrive dopo la perdita: registrato nel registro
   delle incoerenze, non toccato qui. Patch minima.)

   Prova: aprire STAGIONE due volte di fila con una giornata da giocare
   non deve produrre nessun errore di pagina, e $('seaPlaySub') deve
   esistere dopo ogni costruzione.

   uso:  node strumenti/_t-stagione-crash.js --out fuori/stagione.html
         node strumenti/_t-stagione-crash.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/stagione.html'));

const ANCORE = [

/* 1 — il ramo vivo: l'id dentro l'innerHTML, via la riga che esplode */
{
  nome: '1/2 il ramo della giornata da giocare',
  cerca:
`    $('seaPlaySub').textContent = o.stile || '';
    $('btnSeaPlay').innerHTML='GIOCA LA GIORNATA <small>'+esc(o.stile||'')+'</small>';`,
  metti:
`    /* L'ID VIAGGIA DENTRO L'innerHTML (31 agosto 2026). Qui prima si
       scriveva il textContent di seaPlaySub e SUBITO DOPO si riscriveva
       il bottone con uno small senza id: il primo giro consumava
       l'elemento, dal secondo la funzione moriva in TypeError e tutto
       cio' che sta sotto — compreso il toggle di RISULTATI DELL'ULTIMA
       GIORNATA — non girava mai piu'. Verificato dal vivo sul percorso
       NUOVA STAGIONE → menu → STAGIONE. */
    $('btnSeaPlay').innerHTML='GIOCA LA GIORNATA <small id="seaPlaySub">'+esc(o.stile||'')+'</small>';`,
},

/* 2 — il ramo della stagione finita: stessa regola, o l'id muore qui */
{
  nome: '2/2 il ramo della stagione conclusa',
  cerca:
`    $('btnSeaPlay').innerHTML='NUOVA STAGIONE <small>nuovo calendario</small>';`,
  metti:
`    $('btnSeaPlay').innerHTML='NUOVA STAGIONE <small id="seaPlaySub">nuovo calendario</small>';`,
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
  ['<small id="seaPlaySub">', 3],       // lo statico + i due rami riscritti
  ["$('seaPlaySub')", 0],               // la riga che esplodeva non esiste piu'
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
