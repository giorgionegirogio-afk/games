/* =====================================================================
   _t-usura-vernice.js — LE CHIAZZE D'USURA SEGUONO LA TAVOLA DELLE
   VERNICI (voce #86, correzione revisione compito 1).

   IL RILIEVO DELLA REVISIONE. Il compito 1 ha portato il pennello del
   campo (dipingiCampo, dentro paintField) a leggere l'area e il
   dischetto dalla tavola VERNICE invece dei letterali scritti a mano —
   ma solo nel PRIMO punto che li usa (AREA_W/DISCH, riga del gesso). Un
   SECONDO punto dello stesso pennello, poco piu' sotto, ricalcola la
   stessa profondita' e la stessa distanza per posizionare le chiazze di
   usura ai dischetti e alle mezzelune d'area:

     const AREA_Wu=Math.round(118*KPASSO), DISCHu=Math.round(112*KPASSO);

   OGGI e' identico al bit per costruzione (la tavola VERNICI del
   compito 1 replica gli stessi 118/112 scalati). Ma dai compiti 4 e 5,
   quando VERNICI passera' alle misure vere, questa riga resterebbe
   ferma sui vecchi letterali: le chiazze si staccherebbero in silenzio
   dall'area e dal dischetto veri, mentre il gesso si sarebbe gia'
   mosso. LA CURA e' la stessa gia' fatta per AREA_W/DISCH: leggere
   VERNICE.areaProf e VERNICE.dischetto anche qui.

   VERNICE E' LEGGIBILE IN QUESTO SCOPE: e' un `let` a livello di modulo
   (dichiarato dal compito 1, `_t-tavola-vernice.js`), paintField e' una
   funzione dello stesso script top-level, e le tre chiamate a
   paintField (buildFieldTex, il primo piano vivo, le anteprime CAMPI)
   girano tutte DOPO che setTaglia ha gia' riassegnato VERNICE=VERNICI[n]
   (setTaglia lo fa prima di RESIZE_FORZA=true; resize(), che e' cio' che
   ricuoce fieldTex). Lo stesso letterale AREA_W/DISCH, poche righe sopra
   in questo stesso pennello, gia' legge VERNICE cosi' dal compito 1.

   QUESTO COMPITO NON CAMBIA UN SOLO VALORE: oggi VERNICI[taglia] replica
   al bit i letterali 118*KPASSO/112*KPASSO per ogni taglia, quindi il
   confronto due-versioni (_c3-sorteggi) deve restare a ZERO partite
   divergenti: se cambia anche un bit, questo attrezzo ha sbagliato, non
   il gioco.

   LEGGE DEI SORTEGGI: zero chiamate nuove a dado(). La riga toccata e'
   una dichiarazione di due costanti locali, niente altro.

   uso:  node strumenti/_t-usura-vernice.js --out fuori/usura-vernice.html
         node strumenti/_t-usura-vernice.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/usura-vernice.html'));

const ANCORE = [

/* 1 — il secondo punto del pennello che ricalcola area/dischetto per le
   chiazze di usura: legge VERNICE come il gesso poco sopra, invece dei
   letterali vecchi. */
{
  nome: '1/1 AREA_Wu/DISCHu leggono VERNICE come il gesso',
  cerca:
`    const AREA_Wu=Math.round(118*KPASSO), DISCHu=Math.round(112*KPASSO);`,
  metti:
`    /* LE CHIAZZE D'USURA SEGUONO LA TAVOLA DELLE VERNICI, come il gesso
       poco sopra (voce #86, correzione revisione compito 1): cosi'
       quando l'area si muove (compiti 4/5) si muovono anche loro, invece
       di restare ferme sui vecchi letterali. */
    const AREA_Wu=VERNICE.areaProf, DISCHu=VERNICE.dischetto;`,
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
/* CONTEGGI A DELTA (come in _t-tavola-vernice.js): il file arriva qui
   con gli altri compiti della voce #86 gia' dentro. */
const conta = (testo, s) => testo.split(s).length - 1;
const attesi = [
  ['const AREA_Wu=VERNICE.areaProf, DISCHu=VERNICE.dischetto;', 1],
];
const rotti = attesi.filter(([s, n]) => (conta(out, s) - conta(src, s)) !== n)
  .map(([s, n]) => s + ' atteso +' + n + ', trovato +' + (conta(out, s) - conta(src, s)));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
