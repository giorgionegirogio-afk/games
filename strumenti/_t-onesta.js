/* =====================================================================
   _t-onesta.js — DUE COSE CHE IL GIOCO DICEVA E NON FACEVA (27 ago 2026).

   Trovate confrontando CALCETTO con EA SPORTS FC Mobile: non sono
   mancanze rispetto al concorrente, sono BUGIE nostre, e le bugie si
   riparano prima di aggiungere qualunque cosa.

   ---------------------------------------------------------------------
   PRIMA: IL TORNEO TIRA A MONETA, LA STAGIONE NO.

   Le due strade del meta-gioco decidono le partite che il giocatore non
   gioca in due modi diversi, e uno dei due e' sbagliato:

     stagione   [ga,gb] = simulaPartita(forza[a], forza[b])
                cioe' due Poisson con attesa 1,15 + (fa-fb)*0,13
     torneo     m.w = Math.random()<0.5 ? m.a : m.b
                cioe' una moneta, e la forza non entra affatto

   Il tabellone del torneo MOSTRA la forza di ogni squadra (la schermata
   la stampa: «forza 9/10»), e poi le fa vincere a testa o croce. La
   squadra piu' forte del torneo e la piu' debole hanno la stessa
   probabilita' di arrivare in finale — e chi guarda il tabellone non
   puo' saperlo.

   LA CURA usa la funzione che il gioco ha gia': simulaPartita, la stessa
   della stagione. Le due strade smettono di contraddirsi, e la forza che
   si legge sul tabellone comincia a contare. Il pareggio non esiste in un
   tabellone a eliminazione: a parita' di reti passa la squadra piu'
   forte, e a parita' di forza il sorteggio resta — ma e' l'ultimo
   spareggio, non la regola.

   QUANTO CONTA, misurato su 20.000 partite per riga (la funzione e' pura,
   si misura fuori dal browser):

     forza      prima (moneta)   dopo (sulla forza)
     10 vs 1        50,0%              98,3%
      9 vs 3        50,0%              93,8%
      8 vs 5        50,0%              81,4%
      7 vs 6        50,0%              70,5%
      5 vs 5        50,0%              50,1%   <- giustamente ancora una moneta

   L'ultima riga e' la prova che la cura non ha esagerato: fra pari resta
   il caso, com'e' giusto. E la seconda dice che una squadra da 9 contro
   una da 3 non e' piu' un lancio: passa nove volte su dieci.

   I SORTEGGI CAMBIANO DI NUMERO, ed e' dichiarato: prima ogni partita
   costava UN Math.random, adesso ne costa da due a sedici (la Poisson ne
   pesca uno per gol piu' uno). Le partite giocate col dito non sono
   toccate — advanceTournament gira solo sulle partite ALTRUI, a fine
   partita, fuori dalla simulazione. I banchi che misurano il gioco
   (_eventi.js, _q-meta.js) non passano di qui.

   ---------------------------------------------------------------------
   SECONDA: IL TUTORIAL SI CONSUMA ANCHE SE NON LO HAI VISTO.

   `SAVE.tutorialDone = true` si scrive in DUE posti: finish(), che e'
   giusto (i passi sono finiti), e stop(), che e' sbagliato. E stop() lo
   chiamano il fischio finale (endMatch) e il pulsante ABBANDONA del menu
   di pausa. Cioe':

     · chi finisce la prima partita senza aver completato i passi (bastano
       tre secondi di gioco per passo, ma i passi si saltano solo facendo
       i gesti) perde il tutorial per sempre;
     · chi abbandona la prima partita a meta' — cioe' esattamente chi non
       ha ancora capito i comandi — lo perde per sempre.

   E l'unico modo di riaverlo e' AZZERA TUTTI I DATI, che porta via
   monete, campi, trofei e statistiche.

   LA CURA: stop() chiude il tutorial e non lo consuma. Lo consuma
   finish(), che e' arrivato in fondo. Ma non basta, perche' un tutorial
   che riparte all'infinito e' fastidioso quanto uno che sparisce: si
   consuma anche alla TERZA volta che si e' aperto. Chi ha visto tre volte
   gli stessi inviti li ha visti, e il contatore vive nel salvataggio
   accanto alla bandierina.

   ---------------------------------------------------------------------
   Cancelli: strumenti/_q-meta.js (torneo e stagione), strumenti/tutti.js.
   uso:  node strumenti/_t-onesta.js --out fuori/onesta.html
         node strumenti/_t-onesta.js --dentro
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

/* 1 — il torneo smette di tirare a moneta */
{
  nome: '1/6 le partite altrui del torneo si giocano sulla forza',
  cerca:
`  /* le altre partite del turno si giocano da sole */
  for(const m of R){ if(m.w<0) m.w = Math.random()<0.5?m.a:m.b; }`,
  metti:
`  /* LE ALTRE PARTITE DEL TURNO SI GIOCANO DA SOLE, E SULLA FORZA
     (27 ago 2026). Qui c'era  m.w = Math.random()<0.5 ? m.a : m.b  —
     una moneta. Il tabellone pero' STAMPA la forza di ogni squadra, e poi
     le faceva passare a testa o croce: la piu' forte del torneo e la piu'
     debole avevano la stessa probabilita' di arrivare in finale, e chi
     leggeva il tabellone non poteva saperlo.
     Adesso si usa simulaPartita, la STESSA funzione con cui la stagione
     gioca le partite che il giocatore non vede (due Poisson con attesa
     1,15 + differenza di forza per 0,13). Le due strade del meta-gioco
     smettono di contraddirsi.
     IL PAREGGIO NON ESISTE in un tabellone a eliminazione: a parita' di
     reti passa la piu' forte, e solo a parita' anche di forza resta il
     sorteggio — che diventa l'ultimo spareggio invece della regola.
     I sorteggi pescati cambiano di numero, ed e' scritto nel cappello
     della toppa: questa funzione gira a fine partita, fuori dalla
     simulazione, e nessun banco a seme fisso passa di qui. */
  for(const m of R){
    if(m.w>=0) continue;
    const fa = forzaSquadraTorneo(T, m.a), fb = forzaSquadraTorneo(T, m.b);
    const [ga, gb] = simulaPartita(fa, fb);
    m.w = ga>gb ? m.a : (gb>ga ? m.b : (fa>fb ? m.a : (fb>fa ? m.b : (Math.random()<0.5?m.a:m.b))));
  }`,
},

/* 2 — la forza di una squadra del tabellone, letta dove sta */
{
  nome: '2/6 forzaSquadraTorneo dichiarata accanto a simulaPartita',
  cerca:
`function registraRisultato(tab, ia, ib, ga, gb){`,
  metti:
`/* =====================================================================
   LA FORZA DI UNA SQUADRA DEL TABELLONE (27 ago 2026).
   L'indice 0 e' sempre il giocatore, e la sua forza non e' scritta da
   nessuna parte: si ricava dalla rosa, che e' l'unica cosa vera che
   possiede. La media dei quattro attributi sta fra 0 e 100 e la scala del
   torneo va da 1 a 10, quindi si divide per dieci e si tiene dentro i
   bordi. Le altre squadre la portano gia' addosso (opp.forza), com'e'
   scritto nella schermata che la stampa.
   ===================================================================== */
function forzaSquadraTorneo(T, idx){
  if(idx===0){
    const r = SAVE.rosa;
    if(!r || !r.length) return 5;
    let s=0; for(const g of r) s += (g.vel+g.tiro+g.tecnica+g.tackle)/4;
    return clamp(Math.round(s/r.length/10), 1, 10);
  }
  const q = T.teams[idx];
  return (q && q.forza) ? q.forza : 5;
}

function registraRisultato(tab, ia, ib, ga, gb){`,
},

/* 3 — il tutorial non si consuma quando lo si chiude */
{
  nome: '3/6 stop() chiude il tutorial senza consumarlo',
  cerca:
`  stop(){
    if(!this.active) return;
    this.active=false; hide(ui.tut);
    SAVE.tutorialDone=true; persistSave();
  },`,
  metti:
`  stop(){
    if(!this.active) return;
    this.active=false; hide(ui.tut);
    /* CHIUDERE NON E' AVER VISTO (27 ago 2026). Qui c'era
       SAVE.tutorialDone=true, e stop() lo chiamano il fischio finale
       (endMatch) e il pulsante ABBANDONA del menu di pausa: chi finiva la
       prima partita senza completare i passi, e soprattutto chi
       abbandonava a meta' — cioe' esattamente chi non aveva ancora capito
       i comandi — perdeva il tutorial PER SEMPRE, e l'unico modo di
       riaverlo era azzerare tutti i dati, monete e trofei compresi.
       Adesso il tutorial si consuma dove ha senso: in finish(), che e'
       arrivato in fondo. Ma nemmeno riparte all'infinito, perche' un
       invito che torna ogni volta stanca quanto uno che sparisce: alla
       terza apertura si considera visto. Il contatore vive nel
       salvataggio accanto alla bandierina, e si alza in start(). */
    persistSave();
  },`,
},

/* 4 — la costante delle aperture */
{
  nome: '4/6 TUT_APERTURE dichiarata accanto a TUT_PASSO',
  cerca:
`const TUT_PASSO = 3;      // secondi di GIOCO per passo: era 3, resta 3`,
  metti:
`const TUT_PASSO = 3;      // secondi di GIOCO per passo: era 3, resta 3
/* quante volte il tutorial puo' aprirsi prima di considerarsi visto anche
   se non e' mai arrivato in fondo. Tre: chi ha visto tre volte gli stessi
   inviti li ha visti, e la quarta e' fastidio. La conta la tiene
   SAVE.tutorialVisto, che si alza in start(). Vedi Tut.stop(). */
const TUT_APERTURE = 3;`,
},

/* 5 — il contatore nel salvataggio, col suo valore di partenza e la sua lettura */
{
  nome: '5/6 il salvataggio ricorda le aperture del tutorial',
  cerca:
`    tutorialDone:false,`,
  metti:
`    tutorialDone:false,
    /* quante volte il tutorial si e' APERTO. Serve perche' stop() non
       consuma piu' la bandierina (chiudere non e' aver visto): senza
       questa conta un tutorial mai portato a termine ripartirebbe a ogni
       partita per sempre. A TUT_APERTURE si considera visto. */
    tutorialVisto:0,`,
},

/* 6 — start() alza la conta e chiude da se' quando ha finito il credito */
{
  nome: '6/6 start() conta le aperture e alla terza consuma la bandierina',
  cerca:
`  start(){
    this.active=true; this.step=0; this.t=0; this.tot=0; this.fatti={};`,
  metti:
`  start(){
    /* LA CONTA DELLE APERTURE (27 ago 2026). stop() non consuma piu' il
       tutorial — chiudere non e' aver visto — quindi il credito lo tiene
       questa riga: alla terza apertura la bandierina si scrive comunque,
       e la quarta partita non vede piu' niente. Si scrive PRIMA di
       mostrare, cosi' la conta vale anche se il giocatore chiude l'app
       senza passare da nessuna delle due uscite. */
    SAVE.tutorialVisto = (SAVE.tutorialVisto|0) + 1;
    if(SAVE.tutorialVisto >= TUT_APERTURE) SAVE.tutorialDone = true;
    persistSave();
    this.active=true; this.step=0; this.t=0; this.tot=0; this.fatti={};`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-onesta.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.onesta.html';
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
  ['function forzaSquadraTorneo(T, idx){', 1],
  ['const [ga, gb] = simulaPartita(fa, fb);', 1],
  ['const TUT_APERTURE = 3;', 1],
  ['tutorialVisto:0,', 1],
  ['SAVE.tutorialVisto = (SAVE.tutorialVisto|0) + 1;', 1],
  ['m.w = Math.random()<0.5?m.a:m.b;', 0],
  /* la bandierina si scrive ancora in finish(): un posto solo, piu' la
     riga del credito esaurito in start() */
  ['SAVE.tutorialDone=true; persistSave();', 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
