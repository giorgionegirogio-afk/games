/* =====================================================================
   _t-fireshot-fantasma.js — LO STESSO TIRO FANTASMA, IN fireShot (voce
   #88, correzione della revisione del compito 9, rilievo ALTO/2, 2
   settembre 2026)

   LA DIAGNOSI. fireShot (~15545-15665, il pallonetto, la CPU e la
   rovesciata) scriveva G.stats.tiri[t]++ SUBITO dopo p.chargeClip, prima
   di qualunque kickBall — e nessuno dei quattro calci della funzione (il
   pallonetto, il perfetto, il debole, il tardivo) controllava l'esito.
   La guardia d'ingresso della funzione ammette fino a KICK_R*1,4 (36,4
   unita', riga ~15547) quando il pallone non e' del giocatore, ma
   kickBall applica la propria soglia, piu' stretta: KICK_R (26) in quello
   stesso caso. Nella fascia 26-36,4 kickBall rifiuta (return false) e
   fireShot proseguiva comunque: tabellino, curva, tiroT, banner e audio
   scritti su un pallone che non si e' mosso — nel ramo del pallonetto
   perfino b.vz veniva riscritto direttamente, un pallone fermo che si
   impenna da solo.

   Il revisore lo classifica raggiungibile in teoria (CPU, rovesciata,
   pallonetto — non la scena del rilascio a vuoto del compito 9, che passa
   da fireShotMirato, gia' curato) ma non lo dichiara "impossibile per
   costruzione": la casa non lascia un difetto noto in piedi perche' oggi
   e' difficile da incontrare.

   LA CURA: stesso schema di fireShotMirato (~15773) e dello stesso
   difetto nel volo (_t-volo-fantasma.js) — si legge l'esito di kickBall
   PRIMA di scrivere qualunque cosa. G.stats.tiri[t]++ si sposta da un
   unico punto in testa alla funzione a QUATTRO punti, uno per ramo, subito
   dopo il kickBall di quel ramo, con `if(!kickBall(...)) return;` davanti
   a ciascuno.

   LEGGE DEI SORTEGGI: kickBall non chiama dado(); i due sorteggi del ramo
   "troppo tardi" (rnd e dado dentro `err`) restano ESATTAMENTE dove erano,
   prima del kickBall che li consuma — questa cura non li tocca.

   uso:  node strumenti/_t-fireshot-fantasma.js --out fuori/fireshot-fantasma.html
         node strumenti/_t-fireshot-fantasma.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/fireshot-fantasma.html'));

const ANCORE = [

/* 1 — via lo scrivi-e-basta in testa alla funzione: il tabellino si
   scrive dopo, dentro ciascun ramo, solo se kickBall e' riuscito */
{
  nome: '1/5 fireShot: via G.stats.tiri[t]++ incondizionato in testa',
  cerca:
`  const pow = (G.cpu[t] ? DIFF[G.diff].shotPow : 1) * fatt(p.tiro,0.10);
  G.stats.tiri[t]++;
  if(lob){`,
  metti:
`  const pow = (G.cpu[t] ? DIFF[G.diff].shotPow : 1) * fatt(p.tiro,0.10);
  /* IL TIRO FANTASMA (rilievo ALTO/2 della revisione del compito 9, 2
     settembre 2026). Il tabellino saliva QUI, prima di sapere se un
     qualunque kickBall dei quattro rami sotto sarebbe riuscito. La
     guardia d'ingresso ammette fino a KICK_R*1,4 (36,4) quando il
     pallone non e' nostro, ma kickBall rifiuta sopra KICK_R (26): nella
     fascia 26-36,4 il tiro veniva contato e il pallone non si muoveva.
     Da qui in poi G.stats.tiri[t]++ si scrive UNA VOLTA PER RAMO, subito
     dopo il kickBall di quel ramo, solo se e' riuscito — stesso schema
     di fireShotMirato. */
  if(lob){`,
},

/* 2 — il pallonetto */
{
  nome: '2/5 fireShot: il pallonetto legge l\'esito prima di b.vz e del tabellino',
  cerca:
`    kickBall(p, nx, ny, potenza, 0);
    b.vz = bl.vz;`,
  metti:
`    if(!kickBall(p, nx, ny, potenza, 0)) return;
    G.stats.tiri[t]++;
    b.vz = bl.vz;`,
},

/* 3 — il perfetto */
{
  nome: '3/5 fireShot: il tiro perfetto legge l\'esito prima della curva e del tabellino',
  cerca:
`    kickBall(p, dx/l, dy/l, tiroVelocita(1, 640*pow, l), 0);
    /* effetto a giro leggero verso l'incrocio + scia colorata */`,
  metti:
`    if(!kickBall(p, dx/l, dy/l, tiroVelocita(1, 640*pow, l), 0)) return;
    G.stats.tiri[t]++;
    /* effetto a giro leggero verso l'incrocio + scia colorata */`,
},

/* 4 — il debole */
{
  nome: '4/5 fireShot: il tiro debole legge l\'esito prima del tabellino',
  cerca:
`    const dx=gx-p.x, dy=goalY-p.y, l=Math.max(1,len(dx,dy));
    kickBall(p, dx/l, dy/l, tiroVelocita(0, 340*pow, l), 0);
    Audio5.kick(0.45);`,
  metti:
`    const dx=gx-p.x, dy=goalY-p.y, l=Math.max(1,len(dx,dy));
    if(!kickBall(p, dx/l, dy/l, tiroVelocita(0, 340*pow, l), 0)) return;
    G.stats.tiri[t]++;
    Audio5.kick(0.45);`,
},

/* 5 — il tardivo/strozzato */
{
  nome: '5/5 fireShot: il tiro strozzato legge l\'esito prima del tabellino',
  cerca:
`    const dOb=Math.max(1,len((t===0?FW:0)-p.x, goalY-p.y));
    kickBall(p, Math.cos(a), Math.sin(a), tiroVelocita(2, 400*pow, dOb), 0);
    Audio5.kick(0.6);`,
  metti:
`    const dOb=Math.max(1,len((t===0?FW:0)-p.x, goalY-p.y));
    if(!kickBall(p, Math.cos(a), Math.sin(a), tiroVelocita(2, 400*pow, dOb), 0)) return;
    G.stats.tiri[t]++;
    Audio5.kick(0.6);`,
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
const contaSub = (s, sub) => s.split(sub).length - 1;
const attesi = [
  /* nel file intero G.stats.tiri[t]++ compare anche altrove (fireShotMirato,
     il volo di updateBall, i rigori...): qui il conto e' RELATIVO — questo
     ancoraggio ne toglie uno (l'incondizionato in testa a fireShot) e ne
     aggiunge quattro (uno per ramo, dopo il kickBall di quel ramo) */
  ['G.stats.tiri[t]++;', contaSub(src, 'G.stats.tiri[t]++;') - 1 + 4],
  ['if(!kickBall(p, nx, ny, potenza, 0)) return;', 1],
  ['if(!kickBall(p, dx/l, dy/l, tiroVelocita(1, 640*pow, l), 0)) return;', 1],
  ['if(!kickBall(p, dx/l, dy/l, tiroVelocita(0, 340*pow, l), 0)) return;', 1],
  ['if(!kickBall(p, Math.cos(a), Math.sin(a), tiroVelocita(2, 400*pow, dOb), 0)) return;', 1],
];
const rotti = attesi.filter(([s, n]) => contaSub(out, s) !== n)
  .map(([s, n]) => s + '  atteso ' + n + ', trovato ' + contaSub(out, s));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
