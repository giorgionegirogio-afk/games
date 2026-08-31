/* =====================================================================
   _t-avversario-vero.js — LA SQUADRA DELL'ALTRO SCENDE IN CAMPO DAVVERO
   (28 agosto 2026).

   COS'ERA. L'avversario del gioco ha UN NUMERO SOLO: G.oppForza, da 1 a
   10, che setupPlayers trasforma in quattro attributi identici per tutti
   e undici gli uomini (`const f2 = 52 + G.oppForza*2.2` — la stessa
   cifra su vel, tiro, tecnica e tackle) e poi formaSquadre sparge un
   po'. Va benissimo per un avversario che non esiste.

   PERCHE' NON BASTA PIU'. La sfida asincrona manda contro di te la rosa
   VERA di un'altra persona: undici uomini con i loro nomi, i loro quattro
   numeri e la loro storia di partite e gol. Se quella rosa arrivasse e
   poi il gioco la buttasse per rimettere undici copie di un numero
   medio, la modalita' sarebbe una bugia — «hai battuto la squadra di
   Marco» con in campo undici uomini che non sono i suoi. E il difensore,
   che quella partita la puo' GUARDARE, vedrebbe giocare undici sconosciuti
   con la sua maglia.

   COSA FA, e sono due ancoraggi:
     1. startMatch tiene da parte opts.opp.rosa in G.oppRosa
     2. setupPlayers, per la squadra 1, la legge invece del numero medio

   IL PIATTO NON SI ALZA quando la rosa e' vera, e non e' un dettaglio:
   `p.piatto=1` e' la marca dei cloni, e formaSquadre e' l'unica cosa che
   la legge — sparge gli attributi perche' sa che sono tutti uguali. Su
   una rosa vera quello spargimento cancellerebbe proprio la differenza
   che la rosa porta: il portiere tornerebbe simile all'attaccante.

   COSA NON CAMBIA: senza opts.opp.rosa il gioco fa esattamente quello che
   faceva prima, riga per riga. Torneo, stagione, amichevole e le tre
   taglie non vedono passare niente di nuovo — e i banchi a seme fisso
   nemmeno, perche' il conto dei sorteggi non si muove.

   uso:  node strumenti/_t-avversario-vero.js --out fuori/avv.html
         node strumenti/_t-avversario-vero.js --dentro
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

{
  nome: '1/2 startMatch tiene da parte la rosa dell\'avversario',
  cerca: `  G.oppForza = opts.opp && opts.opp.forza ? opts.opp.forza : 5;`,
  metti:
`  G.oppForza = opts.opp && opts.opp.forza ? opts.opp.forza : 5;
  /* =====================================================================
     LA ROSA DELL'AVVERSARIO, quando ce n'e' una vera.

     La porta la sfida asincrona: undici uomini di un'altra persona, coi
     loro nomi e i loro quattro numeri. Si tiene da parte qui — accanto
     alla forza, che e' la stessa informazione in forma povera — perche'
     setupPlayers gira subito dopo ed e' li' che serve.

     La validazione e' stretta apposta: questa rosa arriva dalla RETE, e
     un solo attributo storto (una stringa, un NaN, un numero enorme)
     diventerebbe un uomo che corre a velocita' infinita o che non si
     muove. Il server valida gia' — ma il server e il gioco sono due
     programmi diversi, e il secondo non deve fidarsi del primo. */
  G.oppRosa = null;
  if(opts.opp && Array.isArray(opts.opp.rosa) && opts.opp.rosa.length >= 4){
    const q = (v, d) => { const n = Math.round(+v); return Number.isFinite(n) ? Math.max(1, Math.min(99, n)) : d; };
    G.oppRosa = opts.opp.rosa.map(r => ({
      nome: (typeof r.nome === 'string' && r.nome.trim()) ? r.nome.trim().slice(0, 24) : 'GIOCATORE',
      vel: q(r && r.vel, 62), tiro: q(r && r.tiro, 62),
      tecnica: q(r && r.tecnica, 62), tackle: q(r && r.tackle, 62),
    }));
  }`,
},

{
  nome: '2/2 setupPlayers manda in campo la rosa vera invece di undici copie',
  cerca: `        const f2 = G.oppForza ? (52 + G.oppForza*2.2) : 62;
        p.nome=avv[i]; p.vel=f2; p.tiro=f2; p.tecnica=f2; p.tackle=f2; p.piatto=1;`,
  metti:
`        /* =================================================================
           GLI UNDICI DELL'AVVERSARIO: la sua rosa se ce l'ha, undici copie
           di un numero medio se non ce l'ha.

           E IL PIATTO NON SI ALZA sulla rosa vera. `+`p.piatto=1`+` e' la marca
           dei cloni e formaSquadre e' l'unica cosa che la legge: sparge
           gli attributi PERCHE' sa che sono tutti uguali. Su una rosa
           vera quello spargimento cancellerebbe proprio la differenza che
           la rosa porta — il portiere tornerebbe simile all'attaccante, e
           «la squadra di quella persona» tornerebbe a essere una squadra
           qualunque con un nome sopra.

           I nomi vengono dalla rosa, non da avv[]: sono i nomi che il
           proprietario ha visto crescere partita dopo partita, ed e'
           quello che rende la sfida sua invece che di nessuno. */
        const R = G.oppRosa;
        if(R){
          const r = R[i % R.length];
          p.nome=r.nome; p.vel=r.vel; p.tiro=r.tiro; p.tecnica=r.tecnica; p.tackle=r.tackle;
        }else{
          const f2 = G.oppForza ? (52 + G.oppForza*2.2) : 62;
          p.nome=avv[i]; p.vel=f2; p.tiro=f2; p.tecnica=f2; p.tackle=f2; p.piatto=1;
        }`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-avversario-vero.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.avv.html';
outFile = path.resolve(RADICE, outFile);
if (!dentro && outFile === inFile) { console.error('FALLITO: --out coincide con --in.'); process.exit(2); }

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

/* --- i controlli --- */
const conta = s => out.split(s).length - 1;
const attesi = [
  ['  G.oppRosa = null;', 1],
  ['        const R = G.oppRosa;', 1],
  /* la strada di prima deve restare, intatta, per chi non ha una rosa */
  ['          const f2 = G.oppForza ? (52 + G.oppForza*2.2) : 62;', 1],
  /* e il piatto si alza SOLO li' dentro: se comparisse anche sul ramo
     della rosa vera, formaSquadre spargerebbe gli attributi e la rosa
     dell'altro tornerebbe una squadra qualunque */
  ['p.tackle=f2; p.piatto=1;', 1],
];
const rotti = attesi.filter(([s, n]) => conta(s) !== n)
  .map(([s, n]) => s.trim().slice(0, 56) + ' atteso ' + n + ', trovato ' + conta(s));

/* la legge sui sorteggi: questa toppa non ne aggiunge e non ne toglie */
const dadoPrima = (src.match(/\bdado\(\)/g) || []).length;
const dadoDopo = (out.match(/\bdado\(\)/g) || []).length;
if (dadoPrima !== dadoDopo) rotti.push('sorteggi: ' + dadoPrima + ' prima, ' + dadoDopo + ' dopo');

if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    sorteggi: dado() ' + dadoPrima + ' prima, ' + dadoDopo + ' dopo');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
