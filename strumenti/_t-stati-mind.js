/* =====================================================================
   _t-stati-mind.js -- GLI STATI: UMORE, NERVI, SPINTA (voce #117, compito
   2, MIND v1). Costruisce p.umore (-1..+1), p.nervi (0..1) per giocatore
   e G.spinta[team] (-1..+1) per squadra: TRE STATI DERIVATI DAI FATTI
   (G.fatti, il registro passivo del compito 1), zero dado() nuovo. Sono
   OSSERVAZIONE PURA in questo compito: non toccano NESSUNA decisione (il
   due-versioni lo prova, atteso 0/60) -- la lettura che li modula
   (manopole) arriva al compito 3.

   MODELLO: strumenti/_t-registro-fatti.js (l'ANCORE con cerca/metti, il
   guardiano che rifiuta se `cerca' non compare ESATTAMENTE una volta).

   LA TRAPPOLA CHE QUESTO ATTREZZO EVITA (il doppio conteggio):
   updatePlayerFisica(p,dt) gira UNA VOLTA PER GIOCATORE PER FRAME (vedi
   il ciclo "for(const p of G.players) updatePlayer(p,dt)" in step()). Se
   l'IMPATTO dei fatti vivesse li' dentro, un fatto verrebbe applicato
   tante volte quanti sono i giocatori. Percio' DUE BLOCCHI, MAI
   MESCOLATI, in DUE posti diversi:
     - L'IMPATTO (discreto, una volta per FATTO) vive in step(), in fondo
       alla funzione: gira UNA volta per FRAME, scorre G.fatti da un
       cursore (G.fattiVisti, contro il totale monotono G.fattiTot) e
       applica applicaImpattoFatto() a ogni fatto nuovo.
     - IL DECAY (continuo, per-giocatore) vive in updatePlayerFisica per
       p.umore/p.nervi; G.spinta invece decade nello STESSO posto del suo
       impatto (in step(): e' un valore di SQUADRA, non ha un ciclo "per
       ogni giocatore" naturale, e l'EMA che il progetto chiede unisce
       impulso e rilassamento nella stessa formula).

   DEVIAZIONE DICHIARATA DALL'ANCORA DI PROGETTO (fidarsi del codice, non
   del numero di riga): il mandato diceva "il decay vive in
   updatePlayerFisica dopo il blocco p.fiato, ~riga 18119". Quel blocco
   NON gira MAI per un portiere (updatePlayerFisica esce verso
   updateKeeper due righe dopo l'apertura, PRIMA di arrivare al fiato) ne'
   per un espulso (esce ancora prima, su p.out>0): un decay messo li'
   lascerebbe lo stato del portiere e dell'espulso congelato per sempre,
   mai piu' rilassato verso zero. Il decay vive invece in CIMA a
   updatePlayerFisica, prima di qualunque ramo d'uscita: gira per OGNI
   giocatore, OGNI frame, senza eccezioni (verificato col grep, vedi
   ancora 6 qui sotto).

   IL MOLTIPLICATORE DI TEMPO e' continuo: 1 + 0.6*(1 - G.timeLeft /
   durataPartita()) -- NON le soglie 60'/85' del mandato (che su una
   partita di 90-180 s non esistono), e NON G.capCond (un fattore fisso
   di condizione per partita, un'altra cosa).

   I PESI DEI TRIGGER (scelti a buon senso, dichiarati, simmetrici,
   sempre clampati -- vedi applicaImpattoFatto/applicaGolSquadra per il
   dettaglio):
     gol fatto        scorer umore +0.50*molt; squadra spinta +0.30*molt;
                       squadra che subisce, OGNI giocatore: umore -0.20*
                       molt, nervi +0.15*molt (applicaGolSquadra)
     autorete          l'autore: umore -0.40*molt, nervi +0.20*molt, PIU'
                       lo stesso applicaGolSquadra del gol (la sua squadra
                       subisce comunque, la beneficiaria spinge)
     rubata pulita     chi ruba: umore +0.20*molt; vittima: umore -0.15*
                       molt
     fallo             vittima: nervi +0.12*molt
     giallo            ammonito: nervi +0.25*molt, umore -0.20*molt
     espulsione        espulso: nervi +0.40*molt, umore -0.35*molt
     parata/presa/     portiere: umore +0.20*molt (la stessa famiglia:
     pugni/respinta     ha tenuto il pallone fuori dalla rete)
     sfugge            portiere: umore -0.15*molt (l'UNICO dei quattro
                       esiti che tentaPresa dichiara un FALLIMENTO, vedi
                       il commento di GK_SFUGGE nel gioco: il segno
                       opposto e' la stessa lettura, non un'invenzione)
   rigore/legno/acciacco/cambio: FUORI PERIMETRO dichiarato per questo
   compito (il vocabolario dei "che" li prevede, ma il mandato non ne
   fissa l'effetto e "buon senso" qui vorrebbe dire indovinare una
   polarita' senza appoggio: restano senza impatto in v1).

   IL VINCOLO #4 (determinismo): gli stati sono deterministici perche' i
   fatti lo sono (compito 1) e qui dentro non c'e' nessun dado() ne'
   nessuna lettura di orologio reale -- solo G.timeLeft/durataPartita()
   (gia' deterministici) e dt (il passo fisso). _q-determinismo.js va
   esteso a leggerli (fuori da questo attrezzo, tocca solo il gioco: vedi
   strumenti/_q-determinismo.js, l'IMPRONTA).

   8 ancore (init giocatore, dichiarazione iniziale su G, azzeramento in
   startMatch, emettiFatto+helpers degli stati, il decay in
   updatePlayerFisica, l'impatto in fondo a step(), il reset in
   faiCambio, la superficie __test).

   uso:  node strumenti/_t-stati-mind.js --in fuori/x.html --out fuori/y.html
         node strumenti/_t-stati-mind.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/stati-mind.html'));

const ANCORE = [

{
  nome: '1. init giocatore: p.umore/p.nervi accanto a p.cond',
  cerca:
`    cond:100,
    acciacco:0,                        // 1 = ha ceduto qualcosa: niente scatto, passo corto`,
  metti:
`    cond:100,
    umore:0, nervi:0,                  // gli stati (voce #117, compito 2): derivati dai fatti, vedi applicaImpattoFatto
    acciacco:0,                        // 1 = ha ceduto qualcosa: niente scatto, passo corto`,
},

{
  nome: '2. dichiarazione iniziale su G: spinta/fattiVisti/fattiTot accanto a fatti',
  cerca:
`  fatti:[],                              // registro dei fatti (voce #117, compito 1): vedi emettiFatto
  rec:[], recT:0, moviola:null,`,
  metti:
`  fatti:[],                              // registro dei fatti (voce #117, compito 1): vedi emettiFatto
  spinta:[0,0], fattiVisti:0, fattiTot:0, // gli stati (voce #117, compito 2): derivati dai fatti, vedi applicaImpattoFatto
  rec:[], recT:0, moviola:null,`,
},

{
  nome: '3. azzeramento in startMatch: G.spinta/fattiVisti/fattiTot accanto a G.fatti',
  cerca:
`  G.fatti.length=0;
  G.rec.length=0; G.recT=0;`,
  metti:
`  G.fatti.length=0;
  G.spinta=[0,0]; G.fattiVisti=0; G.fattiTot=0;
  G.rec.length=0; G.recT=0;`,
},

{
  nome: '4. emettiFatto conta G.fattiTot + gli helper degli stati',
  cerca:
`function emettiFatto(che, chi, dove, esito){
  G.fatti.push({ che, chi, dove, esito, t: durataPartita()-G.timeLeft });
  if(G.fatti.length > FATTI_MAX) G.fatti.shift();
}`,
  metti:
`function emettiFatto(che, chi, dove, esito){
  G.fatti.push({ che, chi, dove, esito, t: durataPartita()-G.timeLeft });
  if(G.fatti.length > FATTI_MAX) G.fatti.shift();
  /* CONTATORE MONOTONO (voce #117, compito 2): non decresce mai, cresce
     PRIMA dello shift qui sopra -- e' la base della robustezza del
     cursore G.fattiVisti in step() contro il tetto FATTI_MAX: la
     LUNGHEZZA dell'array puo' restare ferma o scendere (shift), il
     TOTALE emesso no. */
  G.fattiTot++;
}

/* =====================================================================
   GLI STATI: UMORE, NERVI, SPINTA (voce #117, compito 2 -- MIND v1). Tre
   stati DERIVATI DAI FATTI, nessun sorteggio qui dentro. OSSERVAZIONE PURA in
   questo compito: non toccano nessuna decisione (il canale che li legge
   arriva al compito 3). Vedi la lettera di testa di
   strumenti/_t-stati-mind.js per la tavola completa dei pesi. */
function moltiplicatoreTempo(){
  /* CONTINUO, non le soglie 60'/85' del mandato (che su 90-180 s non
     esistono), e NON G.capCond (fattore fisso di condizione, un'altra
     cosa): l'ampiezza di ogni impatto cresce verso il finale. */
  return 1 + 0.6*(1 - G.timeLeft/durataPartita());
}
function clampStato(v, lo, hi){ return v<lo?lo:(v>hi?hi:v); }
function applicaGolSquadra(teamBeneficiario, molt){
  G.spinta[teamBeneficiario] = clampStato(G.spinta[teamBeneficiario] + 0.30*molt, -1, 1);
  const subisce = 1-teamBeneficiario;
  for(const q of G.players){
    if(q.team===subisce){
      q.umore = clampStato(q.umore - 0.20*molt, -1, 1);
      q.nervi = clampStato(q.nervi + 0.15*molt, 0, 1);
    }
  }
}
function applicaImpattoFatto(f){
  const molt = moltiplicatoreTempo();
  const p = (f.chi>=0 && f.chi<G.players.length) ? G.players[f.chi] : null;
  switch(f.che){
    case 'gol':
      if(p) p.umore = clampStato(p.umore + 0.50*molt, -1, 1);
      applicaGolSquadra(f.esito.team, molt);
      break;
    case 'autorete':
      /* l'autore paga un conto suo, PIU' quello che paga tutta la sua
         squadra (applicaGolSquadra qui sotto, che gira comunque su di
         lui: e' cumulativo, dichiarato -- ha segnato nella propria
         porta, la doppia penalita' e' voluta). */
      if(p){ p.umore = clampStato(p.umore - 0.40*molt, -1, 1); p.nervi = clampStato(p.nervi + 0.20*molt, 0, 1); }
      applicaGolSquadra(f.esito.team, molt);
      break;
    case 'rubata':
      if(p) p.umore = clampStato(p.umore + 0.20*molt, -1, 1);
      if(f.esito && f.esito.vittima>=0 && f.esito.vittima<G.players.length){
        const v=G.players[f.esito.vittima];
        v.umore = clampStato(v.umore - 0.15*molt, -1, 1);
      }
      break;
    case 'fallo':
      if(f.esito && f.esito.vittima>=0 && f.esito.vittima<G.players.length){
        const v=G.players[f.esito.vittima];
        v.nervi = clampStato(v.nervi + 0.12*molt, 0, 1);
      }
      break;
    case 'giallo':
      if(p){ p.nervi = clampStato(p.nervi + 0.25*molt, 0, 1); p.umore = clampStato(p.umore - 0.20*molt, -1, 1); }
      break;
    case 'espulsione':
      if(p){ p.nervi = clampStato(p.nervi + 0.40*molt, 0, 1); p.umore = clampStato(p.umore - 0.35*molt, -1, 1); }
      break;
    /* IL PORTIERE: parata (il duello) e i tre esiti buoni di tentaPresa
       sono la stessa famiglia -- ha tenuto il pallone fuori dalla rete.
       sfugge e' l'UNICO dei quattro esiti che il gioco dichiara un
       FALLIMENTO (vedi il commento di tentaPresa/GK_SFUGGE): il segno
       opposto e' la stessa lettura, non un'invenzione. */
    case 'parata': case 'presa': case 'pugni': case 'respinta':
      if(p) p.umore = clampStato(p.umore + 0.20*molt, -1, 1);
      break;
    case 'sfugge':
      if(p) p.umore = clampStato(p.umore - 0.15*molt, -1, 1);
      break;
  }
}
function decayoSpinta(dt){
  /* SPINTA E' L'EMA STESSA (voce #117, compito 2): a differenza di
     p.umore/p.nervi (impatto discreto in step(), decay continuo in
     updatePlayerFisica -- MAI mescolati), qui i due gesti sono la STESSA
     formula: l'EMA con alpha=1-0.5^(dt/20) e' insieme il modo in cui un
     impatto entra (applicaGolSquadra aggiunge un impulso all'accumulo) E
     il modo in cui rilassa verso zero quando i fatti tacciono -- e' la
     definizione di media mobile esponenziale di un segnale a impulsi.
     Vive qui, non in updatePlayerFisica: e' un valore di SQUADRA, non di
     giocatore, e non ha un ciclo "per ogni giocatore" naturale senza
     rischiare lo stesso doppio conteggio che l'impatto evita altrove. */
  const alpha = 1 - Math.pow(0.5, dt/20);
  G.spinta[0] -= G.spinta[0]*alpha;
  G.spinta[1] -= G.spinta[1]*alpha;
}`,
},

{
  nome: '5. il decay in updatePlayerFisica, in cima (non dopo il fiato: vedi la lettera di testa)',
  cerca:
`function updatePlayerFisica(p,dt){
  /* espulso: aspetta a bordo campo, non tocca palla, non decide, non si disegna */
  if(p.out>0){`,
  metti:
`function updatePlayerFisica(p,dt){
  /* IL RILASSAMENTO DEGLI STATI (voce #117, compito 2): CONTINUO, per
     ogni giocatore, OGNI FRAME -- anche per l'espulso e per il portiere.
     DEVIAZIONE DICHIARATA dall'ancora di progetto ("dopo il blocco
     p.fiato"): quel blocco non gira mai per un portiere (due righe sotto
     p.role==='gk' esce verso updateKeeper) ne' per un espulso (esce
     ancora prima, su p.out>0): un decay messo li' lascerebbe lo stato
     del portiere e dell'espulso congelato per sempre. Qui in cima gira
     per OGNI giocatore, OGNI frame, prima di qualunque ramo d'uscita.
     L'IMPATTO dei fatti vive altrove (in step(), una volta per frame, non
     qui: qui girerebbe una volta per GIOCATORE e conterebbe ogni fatto
     piu' volte) -- decay e impatto non si mescolano mai. Mezza vita 30 s
     per l'umore, 15 s per i nervi (si scaricano prima del morale, come
     nel calcio vero): numeri scelti a buon senso, il mandato non li fissa
     per una partita di 90-180 s. */
  p.umore -= p.umore*(1-Math.pow(0.5, dt/30));
  p.nervi -= p.nervi*(1-Math.pow(0.5, dt/15));
  /* espulso: aspetta a bordo campo, non tocca palla, non decide, non si disegna */
  if(p.out>0){`,
},

{
  nome: '6. l\'impatto dei fatti, una volta per frame, in fondo a step()',
  cerca:
`  if(own>=0) G.stats.possesso[G.players[own].team]++;
  else if(G.ball.lastTouch>=0) G.stats.possesso[G.players[G.ball.lastTouch].team]+=0.35;
}`,
  metti:
`  if(own>=0) G.stats.possesso[G.players[own].team]++;
  else if(G.ball.lastTouch>=0) G.stats.possesso[G.players[G.ball.lastTouch].team]+=0.35;

  /* GLI STATI (voce #117, compito 2): L'IMPATTO DEI FATTI, UNA VOLTA PER
     FRAME -- qui, in fondo a step(), non dentro il ciclo
     "for(const p of G.players) updatePlayer(p,dt)" qui sopra, altrimenti
     ogni fatto verrebbe applicato tante volte quanti sono i giocatori
     invece di una sola. G.fattiTot e' un contatore MONOTONO (incrementato
     in emettiFatto PRIMA dello shift): la differenza da G.fattiVisti dice
     quanti fatti nuovi ci sono, anche se il buffer G.fatti (tetto
     FATTI_MAX=200 con shift) nel frattempo ha scartato i piu' vecchi. Se
     il tetto ha scartato piu' fatti di quanti l'array ne contenga oggi,
     si leggono quelli rimasti in coda -- i soli ancora leggibili -- e si
     perdono (mai due volte, mai fuori indice) quelli scartati: con
     FATTI_MAX=200 e una partita a taglia 5 che ne produce una decina
     (misurato dalla prova REGISTRO del compito 1), questo caso non scatta
     mai in pratica, ma il codice non lo da' per scontato. */
  const fattiNuovi = G.fattiTot - G.fattiVisti;
  if(fattiNuovi > 0){
    const daLeggere = Math.min(fattiNuovi, G.fatti.length);
    for(let fi=G.fatti.length-daLeggere; fi<G.fatti.length; fi++) applicaImpattoFatto(G.fatti[fi]);
    G.fattiVisti = G.fattiTot;
  }
  decayoSpinta(dt);
}`,
},

{
  nome: '7. faiCambio: il rincalzo entra a umore 0, nervi 0',
  cerca:
`  p.cond=100; p.fiato=100; p.acciacco=0; p.rincalzo=1;`,
  metti:
`  p.cond=100; p.fiato=100; p.acciacco=0; p.rincalzo=1;
  /* IL RINCALZO ENTRA A STATI NEUTRI (voce #117, compito 2): un uomo
     appena entrato non eredita l'umore ne' i nervi di chi ha sostituito
     -- sono stati di runtime, mai persistiti, e un rincalzo non ne aveva
     di suoi prima di entrare. */
  p.umore=0; p.nervi=0;`,
},

{
  nome: '8. la superficie __test: get spinta',
  cerca:
`  get stats(){ return G.stats; },`,
  metti:
`  get stats(){ return G.stats; },
  /* GLI STATI (voce #117, compito 2): G.spinta e' gia' esposto per intero
     via lo shorthand "G, Duel, Tut," in fondo a questo oggetto (referenza
     viva: t.G.spinta e t.G.players[i].umore/nervi si leggono gia' senza
     bisogno di questo getter). Questo e' un comodo extra a valore
     immutabile (slice), per un banco che non vuole toccare l'array vivo. */
  get spinta(){ return G.spinta ? G.spinta.slice() : [0,0]; },`,
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

/* CONTEGGI A DELTA. */
const conta = (testo, s) => testo.split(s).length - 1;
const rotti = [];
if (conta(out, 'umore:0, nervi:0,') !== 1) rotti.push('l\'init di p.umore/p.nervi non e\' presente esattamente una volta');
if (conta(out, 'spinta:[0,0], fattiVisti:0, fattiTot:0,') !== 1) rotti.push('la dichiarazione iniziale di G.spinta non e\' presente esattamente una volta');
if (conta(out, 'G.spinta=[0,0]; G.fattiVisti=0; G.fattiTot=0;') !== 1) rotti.push('l\'azzeramento di G.spinta in startMatch non e\' presente esattamente una volta');
if (conta(out, 'G.fattiTot++;') !== 1) rotti.push('il contatore monotono G.fattiTot++ non e\' presente esattamente una volta');
if (conta(out, 'function moltiplicatoreTempo(){') !== 1) rotti.push('moltiplicatoreTempo non e\' presente esattamente una volta');
if (conta(out, 'function clampStato(v, lo, hi){') !== 1) rotti.push('clampStato non e\' presente esattamente una volta');
if (conta(out, 'function applicaGolSquadra(teamBeneficiario, molt){') !== 1) rotti.push('applicaGolSquadra non e\' presente esattamente una volta');
if (conta(out, 'function applicaImpattoFatto(f){') !== 1) rotti.push('applicaImpattoFatto non e\' presente esattamente una volta');
if (conta(out, 'function decayoSpinta(dt){') !== 1) rotti.push('decayoSpinta non e\' presente esattamente una volta');
if (conta(out, 'p.umore -= p.umore*(1-Math.pow(0.5, dt/30));') !== 1) rotti.push('il decay di p.umore non e\' presente esattamente una volta');
if (conta(out, 'p.nervi -= p.nervi*(1-Math.pow(0.5, dt/15));') !== 1) rotti.push('il decay di p.nervi non e\' presente esattamente una volta');
if (conta(out, 'const fattiNuovi = G.fattiTot - G.fattiVisti;') !== 1) rotti.push('il blocco impatto in step() non e\' presente esattamente una volta');
if (conta(out, 'decayoSpinta(dt);') !== 1) rotti.push('la chiamata a decayoSpinta non e\' presente esattamente una volta');
if (conta(out, 'p.umore=0; p.nervi=0;') !== 1) rotti.push('il reset del rincalzo in faiCambio non e\' presente esattamente una volta');
if (conta(out, 'get spinta(){ return G.spinta ? G.spinta.slice() : [0,0]; },') !== 1) rotti.push('il getter __test.spinta non e\' presente esattamente una volta');
if (conta(out, 'dado()') !== conta(src, 'dado()')) rotti.push('il numero di chiamate a dado() e\' cambiato: zero dado() nel codice nuovo e\' un vincolo assoluto');
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
