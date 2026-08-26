/* =====================================================================
   _t-marcatori.js — LE RETI VANNO A CHI LE HA FATTE (26 agosto 2026).

   IL DIFETTO, dal censimento del 20 agosto (§3.5.1 voce 7, «la schermata
   che promette identita' e' quella che mente sull'identita'») e
   verificato riga per riga oggi:

     33329:  if(G.score[0]>0) SAVE.rosa[1].gol=(SAVE.rosa[1].gol|0)+G.score[0];

   TUTTE le reti della squadra del giocatore finiscono all'uomo di indice
   1 della rosa, chiunque abbia segnato. Chi apre la schermata della rosa
   dopo dieci partite trova un giocatore con tutti i gol e nove a zero, e
   quella schermata e' esattamente il posto in cui il gioco promette che
   i suoi undici sono persone diverse.

   E LA COSA PIU' AMARA E' CHE IL GIOCO GIA' SAPEVA. addGoal chiama
   attribuisciRete(team), che risale la finestra dei tocchi (TOCCO_FIN),
   distingue il marcatore dall'autorete, e ripiega sull'ultimo tocco
   quando la finestra e' vuota. Il risultato finisce in G.goalChi,
   G.goalNum e G.goalIdx, si stampa nel tabellino a fine partita e si
   scrive nel registro delle reti (G.golLog). Il nome giusto era gia'
   sullo schermo: solo il salvataggio non lo leggeva.

   LA CURA, due ancoraggi.
     1. il registro delle reti porta anche l'INDICE di chi ha segnato
        (idx: G.goalIdx), che addGoal ha gia' calcolato due righe sopra e
        buttava via. Zero costo, zero sorteggi.
     2. faiCrescereRosa smette di sommare G.score[0] su rosa[1] e conta
        il registro una rete alla volta. Il legame fra il campo e la rosa
        e' diretto e gia' scritto (riga ~8056: `if(t===0 && SAVE.rosa[i])`
        copia nome e attributi nel giocatore i), quindi l'indice del
        modulo E' l'indice della rosa.

   COSA NON DIVENTA UN GOL, e ognuna e' una scelta:
     · le AUTORETI (g.auto): una rete regalata non e' di nessuno dei miei;
     · le reti della squadra avversaria (g.team!==0), autoreti dei miei
       comprese — nessuno si vede accreditare un autogol come gol;
     · i tiri dal dischetto della lotteria, che non passano da addGoal e
       non entrano nel registro. Nel calcio vero i rigori della serie
       finale non contano nelle statistiche personali, e qui neanche.

   LA GUARDIA. Se per qualunque ragione il registro fosse vuoto ma il
   tabellone dicesse che abbiamo segnato — un gol arrivato da una strada
   che non passa da addGoal, oggi non ne esistono — le reti non si
   perdono: si contano come prima, sull'uomo di indice 1, e la cosa e'
   scritta qui invece che scoperta fra un mese.

   Cancello: strumenti/_q-meta.js (stagione e rosa).
   uso:  node strumenti/_t-marcatori.js --out fuori/marcatori.html
         node strumenti/_t-marcatori.js --dentro
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
  nome: '1/2 il registro delle reti porta l\'indice del marcatore',
  cerca:
`    G.golLog.push({ team, min:G.goalMin, chi:G.goalChi, num:G.goalNum,
                    auto:G.goalAuto, s0:G.score[0], s1:G.score[1] });`,
  metti:
`    /* L'INDICE DI CHI HA SEGNATO entra nel registro (26 ago 2026).
       G.goalIdx e' gia' calcolato tre righe piu' su — G.players.indexOf
       del giocatore che attribuisciRete ha riconosciuto — e finora
       moriva col fotogramma successivo. Serve a fine partita, quando la
       rosa salvata deve sapere a chi accreditare la rete: senza di lui
       faiCrescereRosa dava tutto all'uomo di indice 1. */
    G.golLog.push({ team, min:G.goalMin, chi:G.goalChi, num:G.goalNum,
                    auto:G.goalAuto, idx:G.goalIdx, s0:G.score[0], s1:G.score[1] });`,
},

{
  nome: '2/2 faiCrescereRosa accredita ogni rete al suo autore',
  cerca:
`  if(G.score[0]>0) SAVE.rosa[1].gol=(SAVE.rosa[1].gol|0)+G.score[0];
}`,
  metti:
`  /* =====================================================================
     LE RETI VANNO A CHI LE HA FATTE (26 ago 2026).
     Qui c'era: if(G.score[0]>0) SAVE.rosa[1].gol += G.score[0], cioe'
     tutte le reti della squadra all'uomo di indice 1, chiunque avesse
     segnato — e la schermata della rosa e' proprio quella in cui il
     gioco promette che i suoi undici sono persone diverse. Il nome
     giusto lo si aveva gia': attribuisciRete lo trova a ogni gol
     risalendo la finestra dei tocchi, e da oggi l'indice viaggia nel
     registro delle reti. Il legame fra campo e rosa e' diretto (vedi la
     riga che copia SAVE.rosa[i] dentro il giocatore i), quindi l'indice
     del modulo e' l'indice della rosa.
     Non diventano gol di nessuno dei miei: le autoreti (di chiunque) e
     le reti della squadra avversaria. I tiri della lotteria dal
     dischetto non passano da addGoal e non entrano nel registro, come
     nel calcio vero. */
  let accreditate=0;
  if(Array.isArray(G.golLog)){
    for(const g of G.golLog){
      if(!g || g.team!==0 || g.auto) continue;
      const pl = (g.idx>=0 && G.players[g.idx]) ? G.players[g.idx] : null;
      if(!pl || pl.team!==0) continue;
      const r = SAVE.rosa[pl.idx];
      if(!r) continue;
      r.gol=(r.gol|0)+1; accreditate++;
    }
  }
  /* LA GUARDIA: se il tabellone dice che abbiamo segnato e il registro
     non sa dirci da chi — una rete arrivata per una strada che non passa
     da addGoal, oggi inesistente — le reti non si perdono. Si contano
     come si contavano ieri, e questo ramo e' il posto dove si scoprira'
     che quella strada e' nata. */
  if(G.score[0]>accreditate) SAVE.rosa[1].gol=(SAVE.rosa[1].gol|0)+(G.score[0]-accreditate);
}`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-marcatori.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.marcatori.html';
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
const attesi = [
  ['auto:G.goalAuto, idx:G.goalIdx,', 1],
  ['r.gol=(r.gol|0)+1; accreditate++;', 1],
  ['if(G.score[0]>0) SAVE.rosa[1].gol=(SAVE.rosa[1].gol|0)+G.score[0];', 0],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
