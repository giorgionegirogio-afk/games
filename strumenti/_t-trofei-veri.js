/* =====================================================================
   _t-trofei-veri.js — I TROFEI SI VINCONO, NON SI GUARDANO
   (31 agosto 2026, voci di lavoro #81 e le due condizioni generose).

   TRE DIFETTI, una famiglia: il trofeo scattava per una condizione piu'
   larga di quella promessa.

   1. NEL REPLAY DI UNA SFIDA I TROFEI SI SBLOCCANO GUARDANDO.
      RIPRODOTTO oggi (sonda diretta): con Reg.modo=2 (rilettura) un
      gol della «mia» squadra sblocca PRIMO GOL e paga 20 monete —
      {prima:false, dopo:true, monete:+20}. G.matchRewarded spegne solo
      i trofei di FINE partita; i cinque sblocchi a meta' partita
      (primo_gol, tripletta, perfetti5 x2, rubate10, punizione)
      controllano solo !G.cpu[0], che nel replay e' false.
      CURA: la guardia Reg.modo!==2 nei cinque punti. Guardare una
      partita non e' giocarla.

   2. MORTE IMPROVVISA («Vinci una partita al golden goal») scattava
      anche vincendo AI RIGORI: G.golden resta alzato quando dopo 40
      secondi si passa alla serie. CURA: && !G.rigori — al golden si
      vince SOLO col golden gol.

   3. FREDDO DAL DISCHETTO («Segna una punizione-duello») scattava
      anche col rigore della serie — che il gioco stesso, tre schermate
      piu' in la', chiama RIGORE e non PUNIZIONE. CURA: && !G.rigori.

   LEGGE DEI SORTEGGI: le guardie non consumano sorteggi e non toccano
   la simulazione: solo lo sblocco (interfaccia + salvataggio).

   Prova: la stessa sonda della riproduzione deve dare dopo:false e
   monete:0 col replay attivo, e dopo:true col gioco vero.

   uso:  node strumenti/_t-trofei-veri.js --out fuori/trofei.html
         node strumenti/_t-trofei-veri.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/trofei.html'));

const ANCORE = [

/* 1 — primo gol e tripletta, dentro addGoal */
{
  nome: '1/6 primo gol e tripletta non nel replay',
  cerca:
`  /* trofei del giocatore (solo se la squadra 0 e' umana) */
  if(team===0 && !G.cpu[0]){
    unlockAch('primo_gol');
    if(G.score[0]>=3) unlockAch('tripletta');
  }`,
  metti:
`  /* trofei del giocatore (solo se la squadra 0 e' umana, e NON in
     rilettura: nel replay di una sfida G.cpu[0] e' false ma a giocare
     e' il nastro — riprodotto il 31 agosto: guardare sbloccava e
     pagava. Guardare una partita non e' giocarla.) */
  if(team===0 && !G.cpu[0] && Reg.modo!==2){
    unlockAch('primo_gol');
    if(G.score[0]>=3) unlockAch('tripletta');
  }`,
},

/* 2 — il cecchino del tiro perfetto (primo gemello) */
{
  nome: '2/6 perfetti5 non nel replay (tiro)',
  cerca:
`    G.stats.perfetti[t]++;
    if(t===0 && !G.cpu[0] && G.stats.perfetti[0]>=5) unlockAch('perfetti5');
    /* LA MIRA SCEGLIE LA CORSIA (26 ago 2026).`,
  metti:
`    G.stats.perfetti[t]++;
    if(t===0 && !G.cpu[0] && Reg.modo!==2 && G.stats.perfetti[0]>=5) unlockAch('perfetti5');
    /* LA MIRA SCEGLIE LA CORSIA (26 ago 2026).`,
},

/* 3 — il cecchino del tiro perfetto (secondo gemello) */
{
  nome: '3/6 perfetti5 non nel replay (pallonetto)',
  cerca:
`    G.stats.perfetti[t]++;
    if(t===0 && !G.cpu[0] && G.stats.perfetti[0]>=5) unlockAch('perfetti5');
    const fCur=(f!==null)?f:(p.y<goalY?1:-1);`,
  metti:
`    G.stats.perfetti[t]++;
    if(t===0 && !G.cpu[0] && Reg.modo!==2 && G.stats.perfetti[0]>=5) unlockAch('perfetti5');
    const fCur=(f!==null)?f:(p.y<goalY?1:-1);`,
},

/* 4 — le mani pulite */
{
  nome: '4/6 rubate10 non nel replay',
  cerca:
`        if(p.team===0 && !G.cpu[0] && SAVE.stats.rubate+G.stats.rubate[0]>=10) unlockAch('rubate10');`,
  metti:
`        if(p.team===0 && !G.cpu[0] && Reg.modo!==2 && SAVE.stats.rubate+G.stats.rubate[0]>=10) unlockAch('rubate10');`,
},

/* 5 — freddo dal dischetto: la punizione, non il rigore della serie */
{
  nome: '5/6 la punizione non e\' il rigore',
  cerca:
`          if(s.shooter===0 && s.shooterHuman && !G.cpu[0]) unlockAch('punizione');`,
  metti:
`          /* solo la PUNIZIONE-duello: il rigore della serie il gioco
             stesso lo titola RIGORE, e un trofeo che promette una cosa
             e ne accetta un'altra e' una bugia (31 agosto 2026). E non
             nel replay, per la stessa legge dei cinque qui sopra. */
          if(s.shooter===0 && s.shooterHuman && !G.cpu[0] && !G.rigori && Reg.modo!==2) unlockAch('punizione');`,
},

/* 6 — morte improvvisa: il golden, non i rigori */
{
  nome: '6/6 il golden non sono i rigori',
  cerca:
`  if(won){
    if(G.golden) unlockAch('golden');`,
  metti:
`  if(won){
    /* al GOLDEN si vince solo col golden gol: G.golden resta alzato
       anche quando dopo 40 secondi si passa ai rigori, e il trofeo
       scattava pure li' (31 agosto 2026) */
    if(G.golden && !G.rigori) unlockAch('golden');`,
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
  /* zero prima della cura (contato con grep), cinque guardie aggiunte
     (le ancore 1-5; la 6 non la contiene) */
  ['Reg.modo!==2', 5],
  ["G.golden && !G.rigori) unlockAch('golden')", 1],
  ["!G.rigori && Reg.modo!==2) unlockAch('punizione')", 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
