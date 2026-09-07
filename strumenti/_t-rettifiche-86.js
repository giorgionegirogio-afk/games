/* =====================================================================
   _t-rettifiche-86.js — QUATTRO COMMENTI CHE IL RAMO HA RESO FALSI (o
   stale), RETTIFICATI IN CHIARO (voce #86, ritocchi della revisione
   finale, 7 settembre 2026).

   IL PERCHE'. La revisione dell'intero ramo voce-86-proporzioni ha
   trovato quattro commenti del gioco che parlano ancora della vernice
   VECCHIA (kPasso, letterali 118/230/112/136/153) mentre il CODICE
   accanto legge gia' la tavola VERNICE con le misure vere (173/268/361
   dal compito 5). Zero righe di codice eseguibile cambiano: e' testo di
   commento, in stile edizioni — l'affermazione superata si rettifica in
   chiaro, col fatto nuovo e la data accanto, invece di sparire in
   silenzio.

   I QUATTRO RILIEVI:
   1. (~27662-27663) "l'area segue kPasso ... i numeri restano
      118/230/112": doppiamente falso. L'area non segue kPasso da un
      pezzo (compito 2, VERNICE.areaProf) e i numeri del campo base non
      sono 118/230/112 ma 173/268/361 per taglia (tavola del compito 5).
      RETTIFICATO col fatto nuovo e la data.
   2. (~18635-18636) "fuori dall'area su tutte e tre le taglie (GK_AREA_X
      vale 118, 136, 153)": con l'area vera (173/268/361) il rinvio a
      pugno (atterraggio fra 242 e 590 unita') PUO' cadere dentro l'area
      a 7 e a 11 — a 5 resta sempre fuori. La proprieta' storica "sempre
      fuori" non vale piu' a 7/11: RETTIFICATO coi numeri nuovi, e la
      decisione rimandata alla voce a registro (MANUALE.md, voce #86).
   3. (~18303) la coda "(scala con kPasso)" sulla dichiarazione di
      GK_AREA_X: stale dal compito 5, ora scala con la tavola
      (VERNICE.areaProf), non con kPasso. Solo la parentesi cambia.
   4. (~19247-19250) "quattro volte il corpo" per SEP_R=54: vero a 5/7
      (54 = 4x13,5, P_R=13), falso a 11 dove P_R=5 rende SEP_R=54 pari a
      5,4 diametri (2*P_R=10). SEP_R resta di proposito un letterale
      indipendente dalla taglia (gia' dichiarato innocuo dal compito 6,
      `_t-leva-corpi.js`): RETTIFICATO con questi numeri e la data; il
      letterale stesso NON cambia.

   QUESTO COMPITO NON CAMBIA UN SOLO VALORE ESEGUIBILE: le quattro
   ancore toccano solo testo di commento (le righe di codice `let`/
   `const` accanto restano IDENTICHE bit per bit; l'ancora 3 tocca solo
   la parentesi finale del commento in coda alla riga, non il codice che
   la precede). Il confronto due-versioni (_c3-sorteggi) deve restare a
   ZERO partite divergenti: se cambia anche un bit, questo attrezzo ha
   sbagliato, non il gioco.

   LEGGE DEI SORTEGGI: zero chiamate nuove a dado(). Le quattro ancore
   sono commenti (o una loro coda), niente altro.

   uso:  node strumenti/_t-rettifiche-86.js --out fuori/rettifiche-86.html
         node strumenti/_t-rettifiche-86.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/rettifiche-86.html'));

const ANCORE = [

/* 1 — l'area non segue piu' kPasso (compito 2) e il campo base non ha
   piu' i numeri 118/230/112 (compito 5 li porta a 173/268/361). */
{
  nome: '1/4 area/dischetto: kPasso e 118/230/112 rettificati',
  cerca:
`  /* area e dischetto: l'area segue kPasso (uscita del portiere) e la sua
     ALTEZZA la luce della porta — sul campo base i numeri restano 118/230/112 */`,
  metti:
`  /* RETTIFICATO (voce #86, ritocchi della revisione finale, 7 settembre
     2026): l'area NON segue piu' kPasso — dal compito 2 viene dalla
     tavola VERNICE (VERNICE.areaProf), e dal compito 5 quella tavola
     porta le misure vere: 173/268/361 a 5/7/11, non piu' i vecchi
     118/230/112 del campo base. ALTEZZA resta la luce della porta. */`,
},

/* 2 — con l'area vera il rinvio a pugno PUO' cadere dentro l'area a 7 e
   a 11 (prima cadeva sempre fuori, coi vecchi 118/136/153). */
{
  nome: '2/4 rinvio a pugno: GK_AREA_X 118/136/153 rettificati',
  cerca:
`       e il pallone tocca terra fra 242 e 590 unita' dal portiere: fuori
       dall'area su tutte e tre le taglie (GK_AREA_X vale 118, 136, 153). */`,
  metti:
`       e il pallone tocca terra fra 242 e 590 unita' dal portiere.
       RETTIFICATO (voce #86, ritocchi della revisione finale, 7
       settembre 2026): con l'area vera GK_AREA_X vale 173, 268, 361 a
       5/7/11 — a 5 l'atterraggio resta sempre fuori dall'area
       (242>173), ma a 7 e a 11 PUO' cadere dentro (242-268 a 7,
       242-361 a 11). La proprieta' storica "sempre fuori dall'area" non
       vale piu' a 7/11: decisione rimandata alla voce a registro
       (MANUALE.md, voce #86). */`,
},

/* 3 — la coda "(scala con kPasso)" e' stale dal compito 5: GK_AREA_X
   scala con la tavola VERNICE.areaProf, non con kPasso. */
{
  nome: '3/4 GK_AREA_X: coda "(scala con kPasso)" stale',
  cerca:
`// quanto lontano dalla linea puo' uscire (scala con kPasso)`,
  metti:
`// quanto lontano dalla linea puo' uscire (scala con la tavola VERNICE.areaProf, dal compito 5)`,
},

/* 4 — "quattro volte il corpo" e' vero a 5/7 (P_R=13) ma non a 11
   (P_R=5, dove SEP_R=54 e' 5,4 diametri): SEP_R resta un letterale
   indipendente dalla taglia, per costruzione (compito 6). */
{
  nome: '4/4 SEP_R: "quattro volte il corpo" rettificato per l\'11',
  cerca:
`/* raggio entro cui due compagni si respingono a vicenda: quattro volte
   il corpo, cioe' la distanza sotto la quale due omini a schermo si
   leggono come una macchia sola */`,
  metti:
`/* raggio entro cui due compagni si respingono a vicenda: quattro volte
   il corpo, cioe' la distanza sotto la quale due omini a schermo si
   leggono come una macchia sola.
   RETTIFICATO (voce #86, ritocchi della revisione finale, 7 settembre
   2026): vero a 5/7 (54 = 4x13,5, con P_R=13), ma a 11 P_R vale 5 e 54
   e' 5,4 diametri (2*P_R=10), non quattro corpi. SEP_R resta di
   proposito un letterale indipendente dalla taglia (gia' dichiarato
   innocuo dal compito 6, _t-leva-corpi.js): qui si rettifica solo la
   prosa, non il numero. */`,
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
/* CONTEGGI A DELTA (come in _t-usura-vernice.js): il file arriva qui
   con gli altri compiti della voce #86 gia' dentro. Tre delle quattro
   ancore (1, 2, 4) sono rettifiche in stile edizioni e portano la
   parola RETTIFICATO; la 3 e' una correzione minima della sola
   parentesi, senza il bollo di edizione. */
const conta = (testo, s) => testo.split(s).length - 1;
const attesi = [
  ['RETTIFICATO', 3],
  ['118/230/112', 0],
  ['GK_AREA_X vale 118, 136, 153', -1],
  ['(scala con kPasso)', -1],
  ['(scala con la tavola VERNICE.areaProf, dal compito 5)', 1],
];
const rotti = attesi.filter(([s, n]) => (conta(out, s) - conta(src, s)) !== n)
  .map(([s, n]) => s + ' atteso +' + n + ', trovato +' + (conta(out, s) - conta(src, s)));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
