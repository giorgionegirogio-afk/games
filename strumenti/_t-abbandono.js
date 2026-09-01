/* =====================================================================
   _t-abbandono.js — L'ABBANDONO HA UNA CONSEGUENZA
   (Contenuto 2 dell'onda, 1 settembre 2026; progetto in
   _analisi/PROGETTO-ONDA-CONTENUTI-1.md §3).

   LA DIAGNOSI: la schermata del torneo promette «eliminazione diretta»
   e il gestore di ABBANDONA non ha nessun ramo di contesto — si
   abbandona a meta' e si rigioca il turno identico, all'infinito. Con
   le divisioni in arrivo il buco diventa voragine: la scala misurerebbe
   la pazienza, non il gioco.

   LA REGOLA (quella del calcio vero): abbandonare in TORNEO o in
   STAGIONE vale sconfitta a tavolino 0-3 — o il punteggio corrente se
   gia' peggiore, perche' il tavolino non e' mai un condono.
   L'amichevole resta libera: li' il gioco non ha promesso niente.
   La conferma e' il gesto di casa (il doppio tocco di AZZERA DATI),
   non un dialog.

   SORTEGGI, dichiarato (§5.2 del progetto): nessuna chiamata nuova a
   dado(), un MOMENTO nuovo per chiamate esistenti — alla rinuncia
   girano advanceTournament/chiudiGiornata, che pescano gia' oggi a
   fine partita. abbandonaSfida() spegne il seme PRIMA del ramo serio,
   quindi quei dadi girano a SEME spento e SEME.n non si muove.
   _crit3-abbandona.js esce da un'amichevole: ramo serio spento, resta
   verde senza ritocchi.

   uso:  node strumenti/_t-abbandono.js --out fuori/abbandono.html
         node strumenti/_t-abbandono.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/abbandono.html'));

const ANCORE = [

/* 1 — il piccolo del bottone diventa scrivibile */
{
  nome: '1/6 il markup del bottone',
  cerca:
`      <button class="voce" id="btnQuit">ABBANDONA <small>torna al menu</small></button>`,
  metti:
`      <button class="voce" id="btnQuit">ABBANDONA <small id="quitSub">torna al menu</small></button>`,
},

/* 2 — il braccio armato, dichiarato accanto a setPaused */
{
  nome: '2/6 quitArmato nasce prima di setPaused',
  cerca:
`function setPaused(v){
  v=!!v;
  if(v===G.paused) return;`,
  metti:
`/* IL DOPPIO TOCCO DELL'ABBANDONO (Contenuto 2, 1 settembre 2026): la
   prima pressione arma, la seconda esegue — il gesto di AZZERA DATI.
   Si disarma a ogni apertura della pausa: un'armatura non sopravvive
   mai a una ripresa di gioco. Stato di interfaccia, mai letto dalla
   simulazione. */
let quitArmato=false;
function setPaused(v){
  v=!!v;
  if(v===G.paused) return;`,
},

/* 3 — all'apertura della pausa: il prezzo scritto sul bottone, e il disarmo */
{
  nome: '3/6 il bottone dice il prezzo del contesto',
  cerca:
`  if(v){
    show(ui.pausa); refreshPauseAudio(); refreshPauseMent(); refreshPauseStats();`,
  metti:
`  if(v){
    show(ui.pausa); refreshPauseAudio(); refreshPauseMent(); refreshPauseStats();
    /* ABBANDONA dice il prezzo del contesto (Contenuto 2): in torneo e
       stagione la rinuncia vale tavolino, e il bottone lo dichiara
       PRIMA del tocco, non dopo. Il doppio tocco si disarma qui. */
    quitArmato=false;
    { const qs=document.getElementById('quitSub');
      if(qs){
        const serio=(G.matchCtx==='tour'||G.matchCtx==='season') && !G.matchRewarded;
        qs.textContent = serio ? 'vale sconfitta a tavolino 0-3' : 'torna al menu';
      } }`,
},

/* 4 — il gestore: il ramo serio */
{
  nome: '4/6 il gestore di ABBANDONA col tavolino',
  cerca:
`$('btnQuit').addEventListener('click', ()=>{
  G.paused=false; hide(ui.pausa);
  /* USCIRE DA UNA SFIDA NON E' GRATIS PER IL GIOCO, ed e' qui che si
     paga: senza questa riga il seme resterebbe acceso e tutte le
     amichevoli successive sarebbero la stessa identica partita, e il
     cronometro resterebbe su quello di rete. Il difetto non si vede
     finche' non si gioca due volte di fila. */
  abbandonaSfida();
  Tut.stop();
  playWipe();
  hideAllScreens(); hide(ui.duel); show(ui.menu);
  refreshCoinVals();
  setScene('menu'); Audio5.crowdLevel(0);
});`,
  metti:
`$('btnQuit').addEventListener('click', ()=>{
  /* L'ABBANDONO HA UNA CONSEGUENZA (Contenuto 2, 1 settembre 2026).
     La schermata del torneo promette «eliminazione diretta» dal primo
     giorno, e questo gestore non la manteneva: nessun ramo di contesto,
     si rigiocava il turno all'infinito. Adesso in torneo e stagione la
     rinuncia vale SCONFITTA A TAVOLINO 0-3 — o il punteggio corrente se
     gia' peggiore: il tavolino non e' mai un condono. Niente monete,
     niente crescita, stats.partite ferma: la partita non e' stata
     giocata, e' stata lasciata. L'amichevole resta libera. */
  const serio = (G.matchCtx==='tour' || G.matchCtx==='season') && !G.matchRewarded;
  if(serio && !quitArmato){
    quitArmato=true;
    const qs=document.getElementById('quitSub');
    if(qs) qs.textContent='SICURO? tocca di nuovo: vale 0-3';
    return;
  }
  G.paused=false; hide(ui.pausa);
  /* USCIRE DA UNA SFIDA NON E' GRATIS PER IL GIOCO, ed e' qui che si
     paga: senza questa riga il seme resterebbe acceso e tutte le
     amichevoli successive sarebbero la stessa identica partita, e il
     cronometro resterebbe su quello di rete. Il difetto non si vede
     finche' non si gioca due volte di fila.
     E L'ORDINE E' LEGGE: abbandonaSfida() spegne il seme PRIMA del ramo
     serio, cosi' i dadi di chiudiGiornata/advanceTournament girano a
     seme spento e SEME.n non si muove (la legge dei sorteggi del
     dopo-partita, verbale dentro advanceTournament). */
  abbandonaSfida();
  if(serio){
    /* il tavolino: 0-3, salvo un campo gia' peggiore. chiudiGiornata
       riceve il punteggio dal punto di vista del giocatore, come lo
       passa applyMatchRewards. */
    let ga = G.score[0], gb = G.score[1];
    if(gb - ga < 3){ ga = 0; gb = 3; }
    if(G.matchCtx==='season') chiudiGiornata(ga, gb);
    else advanceTournament(false);
    G.matchRewarded = true;      // cintura: nessun premio puo' piu' scattare
    persistSave();
  }
  Tut.stop();
  playWipe();
  hideAllScreens(); hide(ui.duel); show(ui.menu);
  refreshCoinVals();
  setScene('menu'); Audio5.crowdLevel(0);
});`,
},

/* 5 — la promessa del torneo si completa */
{
  nome: '5/6 la regola scritta nell\'intro del torneo',
  cerca:
`      <div class="frase">Otto squadre di quartiere, <b>eliminazione diretta</b>. Quarti facili, finale durissima. Chi alza il trofeo entra nell'<b>albo d'oro</b>.</div>`,
  metti:
`      <div class="frase">Otto squadre di quartiere, <b>eliminazione diretta</b>. Quarti facili, finale durissima. Chi alza il trofeo entra nell'<b>albo d'oro</b>. Abbandonare a met&agrave; vale <b>sconfitta a tavolino</b>.</div>`,
},

/* 6 — la gemella nella stagione */
{
  nome: '6/6 la regola scritta nell\'intro della stagione',
  cerca:
`      <div class="frase">Otto squadre di quartiere, <b>andata e ritorno</b>: 14 giornate, tre punti a vittoria. Le altre partite si giocano davvero, simulate con la forza delle squadre. Chi chiude primo alza la <b>coppa del quartiere</b>.</div>`,
  metti:
`      <div class="frase">Otto squadre di quartiere, <b>andata e ritorno</b>: 14 giornate, tre punti a vittoria. Le altre partite si giocano davvero, simulate con la forza delle squadre. Chi chiude primo alza la <b>coppa del quartiere</b>. Abbandonare una giornata vale <b>0-3 a tavolino</b>.</div>`,
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
  ['quitArmato', 4],                       // dichiarazione, disarmo, guardia, armatura
  ['id="quitSub"', 1],
  ["getElementById('quitSub')", 2],        // setPaused e il gestore
  ['sconfitta a tavolino 0-3', 1],         // il testo del bottone
  ['SICURO? tocca di nuovo: vale 0-3', 1],
  ['chiudiGiornata(ga, gb)', 1],
  ['advanceTournament(false)', 2],         // quello vecchio del dopo-partita e questo
  ['vale <b>sconfitta a tavolino</b>', 1],
  ['vale <b>0-3 a tavolino</b>', 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
