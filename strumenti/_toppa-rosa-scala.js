/* =====================================================================
   _toppa-rosa-scala.js — LA SCALA SI POSA ALLA SORGENTE
   (voce #132, compito 3). Cinque ancore.

   IL DIFETTO, misurato porta per porta (strumenti/_q-rosa-scala.js,
   promosso a cancello di qualita' il 21 settembre 2026 —
   strumenti/_t-rosa-scala.js prima della promozione — otto
   casi, sei discordi su otto):

     ingresso    salvataggio   nastro   campo    replay
     250              250         99      250        99
     0                  0          1        0         1
     -5                -5          1       -5         1
     "abc"            "abc"        1     "abc"       62

   Quattro risposte diverse allo stesso numero. In una sfida Sfida.gioca
   non passa mia.rosa, quindi setupPlayers legge SAVE.rosa GREZZA: la
   partita si gioca con 250 e il nastro registra 99. Registrato e
   rigiocato sono due cose diverse, e chi rigioca non puo' saperlo —
   misurato, il replay finisce 3-2 dove il tabellone dice 2-1.

   LA CURA E' LA DOTTRINA GIA' SCRITTA NEL GIOCO per il pixel intero
   (:43497) e applicata dalla voce #131 al dischetto: SI QUANTIZZA DOVE
   NASCE IL DATO. Una funzione sola, attrRosa, e la porta del
   salvataggio — l'unico ingresso non sorvegliato di SAVE.rosa, in un
   blocco che per ogni altra chiave dichiara «un salvataggio manomesso
   non puo' chiedere una quarta intensita'». Con SAVE.rosa pulita alla
   nascita, setupPlayers puo' continuare a leggerla grezza e il numero
   giocato e quello registrato sono lo stesso PER COSTRUZIONE.

   uso:  node strumenti/_toppa-rosa-scala.js --out fuori/x.html
         node strumenti/_toppa-rosa-scala.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/rosa-scala.html'));

const ANCORE = [

/* 1 — una regola sola, scritta una volta */
{
  nome: '1/5 attrRosa, la regola unica',
  cerca:
`function loadSave(){
  let j=null;`,
  metti:
`/* =====================================================================
   UN ATTRIBUTO DI ROSA, E UNA SOLA REGOLA PER TUTTI (voce #132, c.3).

   Erano quattro porte con quattro regole: il salvataggio non guardava
   niente, setupPlayers copiava grezzo, impaccaRosa faceva
   max(1,min(99,v|0)), startMatch arrotondava e ripiegava su 62. Allo
   stesso ingresso rispondevano cose diverse — misurato, sei casi su
   otto discordi — e in una sfida questo vuol dire GIOCARE un numero e
   REGISTRARNE un altro.

   Qui la regola e' una: arrotonda, stringi in 1..99, e se non e' un
   numero (o non c'e') ripiega. Chiamata alla SORGENTE — la porta del
   salvataggio — rende superfluo controllare piu' a valle: SAVE.rosa non
   puo' piu' contenere un numero fuori scala, quindi il campo e il nastro
   vedono lo stesso, per costruzione e non per fortuna.

   ASSENTE E' DIVERSO DA ZERO, e va detto: null e undefined tornano il
   ripiego (62, un uomo qualunque), mentre uno ZERO scritto per davvero
   diventa 1, il pavimento della scala. Zero e' una scelta di chi ha
   scritto il salvataggio; assente e' una mancanza.
   ===================================================================== */
function attrRosa(v, d){
  const rip = (d === undefined) ? 62 : d;
  if(v === null || v === undefined) return rip;
  const n = Math.round(+v);
  return Number.isFinite(n) ? Math.max(1, Math.min(99, n)) : rip;
}
function loadSave(){
  let j=null;`,
},

/* 2 — la sorgente: il salvataggio */
{
  nome: '2/5 loadSave stringe la rosa alla nascita',
  cerca:
`    if(Array.isArray(j.rosa)&&(j.rosa.length===4||j.rosa.length===5)) s.rosa=j.rosa;`,
  metti:
`    /* LA ROSA, CON I NUMERI GUARDATI (voce #132, compito 3). Era
       l'unica chiave di questo blocco che entrava senza che nessuno
       leggesse i suoi valori — in mezzo a venti righe che dichiarano
       «un salvataggio manomesso non puo' chiedere...». Da qui in poi
       SAVE.rosa sta in 1..99, e setupPlayers puo' continuare a copiarla
       grezza senza che il campo e il nastro possano divergere.
       Le voci che non sono oggetti restano com'erano: sono una rosa
       rotta, e rotta era gia' prima di questa toppa. */
    if(Array.isArray(j.rosa)&&(j.rosa.length===4||j.rosa.length===5))
      s.rosa=j.rosa.map(g=>{
        if(!g || typeof g!=='object') return g;
        const o=Object.assign({}, g);
        o.vel=attrRosa(o.vel); o.tiro=attrRosa(o.tiro);
        o.tecnica=attrRosa(o.tecnica); o.tackle=attrRosa(o.tackle);
        return o;
      });`,
},

/* 3 — e le altre tre porte chiamano la stessa regola */
{
  nome: '3/5 impaccaRosa usa attrRosa',
  cerca:
`  const q = v => Math.max(1, Math.min(99, v|0));`,
  metti:
`  /* LA STESSA REGOLA DELLA SORGENTE (voce #132, compito 3): qui era
     «v|0», che tronca invece di arrotondare e che su NaN da' 1 invece
     del ripiego. Con SAVE.rosa gia' pulita questa chiamata e'
     l'identita' — ed e' proprio il punto: due porte che non possono
     rispondere diverso perche' sono la stessa porta. */
  const q = v => attrRosa(v);`,
},
{
  nome: '4/5 startMatch, la rosa di casa',
  cerca:
`    const q = (v, d) => { const n = Math.round(+v); return Number.isFinite(n) ? Math.max(1, Math.min(99, n)) : d; };
    G.miaRosa = opts.mia.rosa.map(r => ({`,
  metti:
`    const q = (v, d) => attrRosa(v, d);   /* la stessa regola della sorgente (voce #132, compito 3) */
    G.miaRosa = opts.mia.rosa.map(r => ({`,
},
{
  nome: '5/5 startMatch, la rosa avversaria',
  cerca:
`    const q = (v, d) => { const n = Math.round(+v); return Number.isFinite(n) ? Math.max(1, Math.min(99, n)) : d; };
    G.oppRosa = opts.opp.rosa.map(r => ({`,
  metti:
`    const q = (v, d) => attrRosa(v, d);   /* la stessa regola della sorgente (voce #132, compito 3) */
    G.oppRosa = opts.opp.rosa.map(r => ({`,
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
  ['function attrRosa(v, d){', 1],
  ['o.vel=attrRosa(o.vel); o.tiro=attrRosa(o.tiro);', 1],
  ['const q = v => attrRosa(v);', 1],
  ['const q = (v, d) => attrRosa(v, d);', 2],
  /* nessuna delle tre regole vecchie deve sopravvivere */
  ['const q = v => Math.max(1, Math.min(99, v|0));', 0],
  ['const q = (v, d) => { const n = Math.round(+v); return Number.isFinite(n) ? Math.max(1, Math.min(99, n)) : d; };', 0],
  ['if(Array.isArray(j.rosa)&&(j.rosa.length===4||j.rosa.length===5)) s.rosa=j.rosa;', 0],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
