/* =====================================================================
   _t-area-unica.js — L'UNICA COSTANTE DELL'AREA (voce #86, compito 2,
   ramo voce-86-proporzioni).

   IL PERCHE'. Il compito 1 ha messo profondita' e dischetto della
   vernice dentro la tavola VERNICI, ma la REGOLA (dentroArea, GK_AREA_X)
   restava un patto fra formule separate:

     - il pennello disegna VERNICE.areaProf (la riga bianca);
     - setTaglia ricuoceva GK_AREA_X=Math.round(118*KPASSO) — la STESSA
       formula scritta una seconda volta a mano;
     - dentroArea usava GOAL_H*0.77 per la semilarghezza, un terzo numero
       che oggi coincide col pennello (AREA_H) solo perche' nessuno l'ha
       mai spostato.

   Oggi i tre producono lo stesso numero PER COINCIDENZA (118*kPasso
   scritto due volte, GOAL_H*0.77 mai divergente): il banco
   _q-proporzioni.js lo verifica gia' (prova "area disegnata = area
   applicata"), ed e' verde per caso, non per costruzione — la stessa
   coincidenza che i compiti 4/5 romperebbero in silenzio se non si
   toglie qui.

   LA CURA. GK_AREA_X non ricalcola piu' la formula: legge
   VERNICE.areaProf, la STESSA variabile che il pennello gia' disegna
   (setTaglia ha gia' fatto VERNICE=VERNICI[n] due righe sopra — vedi il
   Passo 1 del compito: l'ordine e' verificato col grep prima di scrivere
   questa ancora). dentroArea legge VERNICE.areaSemi per la semilarghezza,
   col ripiego GOAL_H*0.77 finche' areaSemi vale 0 (il compito 5 decidera'
   il valore vero) — lo STESSO ripiego che il pennello usa dal compito 1
   per AREA_H, letto qui per nome, non riscritto una seconda volta.

   QUESTO COMPITO NON CAMBIA UN SOLO VALORE: con areaSemi:0 in ogni riga
   di VERNICI, (VERNICE.areaSemi || GOAL_H*0.77) vale sempre GOAL_H*0.77,
   e VERNICE.areaProf e' gia' oggi uguale a Math.round(118*KPASSO) (il
   compito 1 l'ha costruito cosi'). Il confronto due-versioni
   (_c3-sorteggi) deve restare a ZERO partite divergenti su tutte le
   taglie: se cambia anche un bit, questo attrezzo ha sbagliato, non il
   gioco.

   IL COMMENTO SOPRA dentroArea era gia' un po' vecchio: citava
   "AREA_Wu = Math.round(118*KPASSO)", una formula che la correzione
   della revisione del compito 1 aveva gia' sostituito con
   VERNICE.areaProf senza toccare questa riga di commento (drift
   normale: il codice si e' mosso, il commento no). Questo attrezzo lo
   riallinea nello stesso momento in cui la promessa che descrive smette
   di essere "un patto fra formule che oggi coincidono" e diventa "la
   stessa variabile letta due volte".

   LEGGE DEI SORTEGGI: zero chiamate nuove a dado(). setTaglia e
   dentroArea non ne fanno mai (letto qui prima di scrivere l'attrezzo).

   uso:  node strumenti/_t-area-unica.js --out fuori/area-unica.html
         node strumenti/_t-area-unica.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/area-unica.html'));

const ANCORE = [

/* 1 — setTaglia: GK_AREA_X non ricalcola piu' 118*KPASSO, legge
   VERNICE.areaProf. VERNICE=VERNICI[n] e' gia' assegnato due righe sopra
   in questa stessa funzione (verificato col grep del Passo 1: l'ordine
   e' quello giusto, VERNICE e' gia' ricotta quando questa riga gira). */
{
  nome: '1/2 setTaglia: GK_AREA_X legge VERNICE.areaProf',
  cerca:
`  GK_AREA_X=Math.round(118*KPASSO);`,
  metti:
`  GK_AREA_X=VERNICE.areaProf;`,
},

/* 2 — dentroArea: la semilarghezza legge VERNICE.areaSemi (ripiego
   GOAL_H*0.77 finche' vale 0, come il pennello dal compito 1), e il
   commento sopra la funzione smette di citare la vecchia formula
   Math.round(118*KPASSO) — gia' sostituita in AREA_Wu dalla correzione
   della revisione del compito 1, mai riallineata qui — e riscrive la
   promessa "se uno si muove, si muovono tutti e due" come quello che e'
   diventata: non un patto fra formule che oggi coincidono per caso, ma
   la stessa variabile letta due volte. */
{
  nome: '2/2 dentroArea: semilarghezza da VERNICE.areaSemi, commento riallineato',
  cerca:
`/* =====================================================================
   L'AREA — la scatola dentro cui un cross vale qualcosa.

   E' la stessa che finestraRovesciata usava scritta a mano, ed e' la
   stessa che il disegno del campo usa per la riga bianca (AREA_Wu =
   Math.round(118*KPASSO): cercalo per nome, non per numero di riga — i
   numeri di riga di questo file invecchiano in un giorno).
   Scriverla una volta sola non e' pulizia: e' il modo di garantire che
   "il cross cade in area" e "la rovesciata si puo' aprire" parlino dello
   stesso rettangolo. Se un giorno uno dei due si muove, si muovono tutti
   e due.
   ===================================================================== */
function dentroArea(team, x, y){
  const gx = team===0?FW:0;
  return Math.abs(x-gx) <= GK_AREA_X && Math.abs(y-FH/2) <= GOAL_H*0.77;
}`,
  metti:
`/* =====================================================================
   L'AREA — la scatola dentro cui un cross vale qualcosa.

   E' la stessa che finestraRovesciata usava scritta a mano, ed e' la
   stessa che il disegno del campo usa per la riga bianca (AREA_Wu =
   VERNICE.areaProf: cercalo per nome, non per numero di riga — i numeri
   di riga di questo file invecchiano in un giorno).
   FINO AL COMPITO 1 la profondita' (GK_AREA_X) e la vernice (AREA_W,
   AREA_Wu) erano la STESSA formula scritta due volte a mano (118*kPasso
   in ciascuna): coincidevano per caso, non per costruzione. DAL COMPITO
   2 (voce #86) GK_AREA_X si ricuoce leggendo VERNICE.areaProf in
   setTaglia, e la semilarghezza qui sotto legge VERNICE.areaSemi (col
   ripiego GOAL_H*0.77 finche' la tavola non decide un valore vero): non
   e' piu' un patto fra formule che oggi coincidono per caso, e' la
   stessa variabile letta due volte. Se un giorno uno dei due si muove,
   si muovono tutti e due perche' non possono fare altrimenti.
   ===================================================================== */
function dentroArea(team, x, y){
  const gx = team===0?FW:0;
  return Math.abs(x-gx) <= GK_AREA_X && Math.abs(y-FH/2) <= (VERNICE.areaSemi || GOAL_H*0.77);
}`,
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
/* CONTEGGI A DELTA (come in _t-usura-vernice.js): il file arriva qui con
   gli altri compiti della voce #86 gia' dentro. */
const conta = (testo, s) => testo.split(s).length - 1;
const attesi = [
  ['GK_AREA_X=VERNICE.areaProf;', 1],
  ['Math.abs(y-FH/2) <= (VERNICE.areaSemi || GOAL_H*0.77);', 1],
];
const rotti = attesi.filter(([s, n]) => (conta(out, s) - conta(src, s)) !== n)
  .map(([s, n]) => s + ' atteso +' + n + ', trovato +' + (conta(out, s) - conta(src, s)));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
