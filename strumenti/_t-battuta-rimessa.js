/* =====================================================================
   _t-battuta-rimessa.js — LA RIMESSA NASCE (voce #87, compito 2, ramo
   voce-87-rimesse-angoli).

   IL PERCHE'. Il compito 1 ha portato l'interruttore (SAVE.sponde,
   G.campoVero) e il banco _q-battute.js, nato apposta rosso su 5 delle
   sette prove. Questo attrezzo costruisce la macchina della rimessa: la
   sponda lunga (fascia) a campo vero smette di rimbalzare, si ferma la
   partita in una scena nuova ('battuta', gemella di 'kickoff'), chi ha
   diritto alla rimessa si piazza sul punto (posaBattuta), e la battuta
   si scioglie da sola entro pochi secondi (anti-stallo) o al primo
   tocco vero (kickBall e' l'unico imbuto). Dopo questo attrezzo le
   prove RIMESSA e ANTI-STALLO diventano verdi; FONDO-ANGOLO,
   FONDO-RINVIO e TIRA-SPENTO restano rosse (compiti 3-4), INTERRUTTORE
   e GABBIA restano verdi come dal compito 1.

   UNA SOLA SCENA, DALL'APERTURA ALLA RIPRESA: la battuta resta scena
   'battuta' (mondo fermo, gemello del kickoff) per tutto il tempo che
   serve - il minimo duraBattuta() e poi, se serve, l'anti-stallo - e
   torna 'play' SOLO nello stesso fotogramma in cui il tocco vero e'
   gia' avvenuto (G.battuta e' gia' null). Non e' spezzata in un fermo
   breve seguito da una finestra scoperta dentro 'play': provato a
   costruirla cosi' (fermo fisso a 0,8 s, poi una finestra di hold
   dentro il ciclo di gioco vivo) la prova ANTI-STALLO usciva rossa per
   costruzione, perche' misura lo stato ESATTAMENTE al fotogramma in cui
   la scena smette di essere 'battuta' - se in quel fotogramma la
   battuta e' ancora pendente (il tocco vero arriva qualche fotogramma
   dopo, a scena gia' 'play'), il giudice la legge come mai sciolta.
   Tenerle insieme (il ramo unico sotto) le fa scadere sullo stesso
   fotogramma per costruzione.

   PERIMETRO DICHIARATO: il battitore umano NON ha ancora i verbi di
   battuta (arrivano al compito 3, pulsantiera dedicata): in questo
   compito l'anti-stallo lo fa battere con la stessa auto-battuta della
   CPU, a fine hold. E' uno stadio del cantiere, non una svista - vedi
   il commento della sezione LA BATTUTA sotto.

   ZERO dado() nuovi nei rami di classificazione (fascia -> rimessa) e
   nei fallback (chi<0 -> squadra 0, regola fissa commentata). L'unico
   dado() che gira sul percorso e' quello gia' esistente dentro
   eseguiAiPass (chiamata dall'anti-stallo): e' lo stesso percorso della
   CPU normale, non un canale nuovo - da cui la divergenza dichiarata
   del due-versioni a 11 (campo vero obbligatorio, quindi il ramo nuovo
   gira sempre, anche in CPU-vs-CPU).

   UNA GUARDIA IN PIU' TROVATA A RE-GREP: setPaused(v) ha una propria
   copia dell'elenco "scene di partita" (identica, in altri quattro
   posti del file: __indietro, checkOrientation, forceWinMatch, e la
   coppia setScene/aggiornaBottoniHUD sopra). Senza aggiungere 'battuta'
   anche li', il gate 5 del piano (pausa/ripresa durante il fermo)
   sarebbe un'illusione: t.setPaused(true) si rifiuterebbe in silenzio
   perche' 'battuta' non e' nell'elenco, e la "ripresa senza saltare"
   non proverebbe nulla (il gioco non si sarebbe mai fermato). Le altre
   tre copie sorelle (__indietro, checkOrientation, forceWinMatch) NON
   sono toccate: nessun cancello di questo compito le esercita, restano
   un'osservazione per chi fara' un giro di pulizia su quella duplicazione
   (dichiarata nel rapporto, non nascosta).

   uso:  node strumenti/_t-battuta-rimessa.js --out fuori/battuta.html
         node strumenti/_t-battuta-rimessa.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/battuta.html'));

const ANCORE = [

/* 1 — resetKickoff: il fischio del gol (o di un fermo pieno) uccide una
   battuta pendente. Precedente dichiarato del piano: senza questa riga
   G.battuta potrebbe sopravvivere a un calcio d'inizio nuovo, puntando
   a un battitore che nel frattempo e' tornato in formazione. */
{
  nome: '1/9 resetKickoff: G.battuta=null in testa alla funzione',
  cerca:
`function resetKickoff(){
  if(G.ball) G.ball.tiroT=-1;             // nessun tiro sopravvive al fischio
`,
  metti:
`function resetKickoff(){
  /* IL FISCHIO DEL GOL UCCIDE UNA BATTUTA PENDENTE (voce #87, compito 2):
     resetKickoff riparte sempre da zero dopo un gol o un fermo pieno, e
     una battuta in sospeso (rimessa oggi, angolo/rinvio nei prossimi
     compiti) non avrebbe piu' senso su un campo appena rimesso in
     formazione. */
  G.battuta=null;
  if(G.ball) G.ball.tiroT=-1;             // nessun tiro sopravvive al fischio
`,
},

/* 2 — setScene: la scena 'battuta' e' partita a tutti gli effetti (non
   spegne lo schermo, come kickoff/goal/freekick/golden/play). */
{
  nome: '2/9 setScene: inMatch impara \'battuta\'',
  cerca:
`  const inMatch = s==='play'||s==='kickoff'||s==='golden'||s==='goal'||s==='freekick';
  /* niente schermo che si spegne in mezzo a una partita da 90 secondi */
`,
  metti:
`  const inMatch = s==='play'||s==='kickoff'||s==='battuta'||s==='golden'||s==='goal'||s==='freekick';
  /* niente schermo che si spegne in mezzo a una partita da 90 secondi */
`,
},

/* 3 — kickBall: l'unico imbuto di tutti i calci del gioco (umano, CPU,
   auto-battuta). Se il battitore in attesa e' proprio chi sta calciando,
   la battuta pendente si chiude qui - ogni via converge in questo punto. */
{
  nome: '3/9 kickBall: la battuta pendente si chiude al primo tocco vero',
  cerca:
`function kickBall(p, nx, ny, speed, spinY){
  const b=G.ball;
  const d=len(b.x-p.x, b.y-p.y);
  if(G.ball.owner!==G.players.indexOf(p) && d>KICK_R) return false;
  b.owner=-1; segnaTocco(G.players.indexOf(p));
`,
  metti:
`function kickBall(p, nx, ny, speed, spinY){
  const b=G.ball;
  const d=len(b.x-p.x, b.y-p.y);
  if(G.ball.owner!==G.players.indexOf(p) && d>KICK_R) return false;
  /* LA BATTUTA SI CHIUDE QUI (voce #87, compito 2): kickBall e' l'unico
     imbuto di tutti i calci del gioco (umano, CPU, auto-battuta) - se il
     battitore in attesa e' proprio p, la battuta pendente e' consumata. */
  if(G.battuta && G.players[G.battuta.battitore]===p) G.battuta=null;
  b.owner=-1; segnaTocco(G.players.indexOf(p));
`,
},

/* 4 — il ciclo principale: il fermo della scena 'battuta', gemello del
   kickoff appena sopra, con l'anti-stallo DENTRO lo stesso ramo (vedi il
   commento in testa al file: e' la forma che fa scadere "scena lasciata"
   e "battuta risolta" sullo stesso fotogramma, il che la prova
   ANTI-STALLO misura alla lettera). Inserito subito dopo il ramo
   kickoff e prima del ramo goal, sopra la guardia play/golden che segue
   piu' sotto. */
{
  nome: '4/9 ciclo principale: il ramo battuta, con l\'anti-stallo dentro',
  cerca:
`    if(G.sceneT>=(TAGLIA>5?1.5:1.0)){ setScene('play'); }
    return;
  }
  if(G.scene==='goal'){
`,
  metti:
`    if(G.sceneT>=(TAGLIA>5?1.5:1.0)){ setScene('play'); }
    return;
  }
  if(G.scene==='battuta'){
    /* IL FERMO DELLA BATTUTA (voce #87, compito 2), gemello del kickoff
       qui sopra: il ciclo esce subito, fisica e IA del resto del campo
       sospese. Il fermo dura ALMENO duraBattuta() (0,8 s per rimessa e
       rinvio; l'angolo del compito 4 legge la taglia); scaduto quel
       minimo parte l'anti-stallo, che forza la battuta entro
       BATTUTA_HOLD secondi dall'apertura del fermo - la CPU (e, in
       questo compito, anche l'umano: i verbi di battuta arrivano al
       compito 3) battono con la stessa auto-battuta. Zero dado() nuovo
       qui: eseguiAiPass ne usa uno suo, lo stesso percorso della CPU
       normale (manopoleDi, la sorgente per squadra che l'IA usa gia'
       accanto ad aiPass). kickBall stacca G.battuta al primo tocco
       vero, da qualunque via arrivi - ed e' per questo che si puo'
       tornare a 'play' subito dopo averlo chiamato, nello stesso
       fotogramma: se ha funzionato, G.battuta e' gia' null. */
    const scaduto = G.sceneT>=duraBattuta();
    if(scaduto && G.battuta){
      G.battuta.hold-=dt;
      const bp=G.players[G.battuta.battitore];
      const cpu=G.cpu[G.battuta.team];
      if(bp && ((cpu && G.battuta.hold<=BATTUTA_HOLD-BATTUTA_CPU) || G.battuta.hold<=0)){
        eseguiAiPass(bp, manopoleDi(G.battuta.team));
      }
    }
    if(scaduto && !G.battuta) setScene('play');
    return;
  }
  if(G.scene==='goal'){
`,
},

/* 6 — la sezione nuova LA BATTUTA, piazzata sopra ballWalls: le
   costanti, duraBattuta, pallaFuori, posaBattuta. Funzioni a
   dichiarazione (issate in cima allo scope): l'ordine testuale rispetto
   a chi le chiama piu' sopra non conta. */
{
  nome: '5/9 sezione nuova LA BATTUTA, sopra ballWalls',
  cerca: `function ballWalls(b){\n`,
  metti:
`/* =====================================================================
   LA BATTUTA (voce #87, compito 2) - quando il campo e' vero (G.campoVero)
   la palla che esce dalla sponda lunga non rimbalza piu': si ferma un
   istante (scena 'battuta', gemella del kickoff) e la riprende chi ha
   diritto alla rimessa. Angolo e rinvio dal fondo restano ai compiti 3
   e 4: oggi ballWalls() non tocca ancora il ramo del fondo fuori dalla
   luce, e posaBattuta() sa piazzare solo il tipo 'rimessa'.

   G.battuta = {tipo, team, battitore, x, y, hold} oppure null.
     tipo       'rimessa' oggi; 'angolo'/'rinvio' nei prossimi compiti.
     team       la squadra che ha diritto alla battuta.
     battitore  indice in G.players di chi tocchera' per primo.
     x,y        il punto di battuta.
     hold       secondi residui, scaduto il minimo del fermo, prima che
                l'auto-battuta scatti da sola (l'anti-stallo dentro il
                ramo 'battuta' del ciclo principale, qui sotto).

   PERIMETRO DICHIARATO: il battitore umano non ha ancora i verbi di
   battuta (arrivano al compito 3, pulsantiera dedicata): l'anti-stallo
   lo fa battere con la stessa auto-battuta della CPU a fine hold. E'
   uno stadio del cantiere, non una svista - la palla non resta mai
   bloccata, solo l'agenzia del dito arriva dopo. */
const BATTUTA_T = { rimessa:0.8, rinvio:0.8 };   // il binario rapido del paragone
const BATTUTA_HOLD = 3.0;    // anti-stallo: entro questo tempo la battuta parte da sola
const BATTUTA_CPU = 0.5;     // la CPU batte quando restano questi secondi di hold
const BATTUTA_RAGGIO = 60;   // gli avversari vengono spinti fuori da questo raggio

/* la durata del fermo a scena 'battuta'. rimessa e rinvio: sempre 0,8 s
   (BATTUTA_T). L'angolo (compito 4) allunga il fermo sulle taglie grandi
   come il kickoff: la funzione nasce completa anche se oggi la chiama
   solo il ramo rimessa. */
function duraBattuta(){
  const st=G.battuta;
  if(!st) return 0;
  if(st.tipo==='angolo') return TAGLIA>5?1.5:1.2;
  return BATTUTA_T[st.tipo] || 0.8;
}

/* la palla esce dal campo vero: pulisce il pallone (lo stesso blocco di
   pulizia di ballOverBar, poco sotto), apre G.battuta, piazza chi batte
   (posaBattuta) e ferma il gioco un istante. */
function pallaFuori(tipo, team, x, y){
  const b=G.ball;
  b.z=0; b.vz=0; b.curve=0; b.perfectT=0; b.passTo=-1; b.crossTo=-1; b.saveRolled=false;
  b.vx=0; b.vy=0;
  G.battuta = { tipo, team, battitore:-1, x, y, hold:BATTUTA_HOLD };
  posaBattuta();
  showBanner(tipo.toUpperCase(), TEAMCOL[team], 0.9);
  Audio5.whistle(false);
  setScene('battuta');
}

/* piazza il battitore e la palla sul punto di uscita. Per ora solo il
   tipo 'rimessa' (angolo e rinvio arrivano ai compiti 3 e 4): il
   battitore e' il compagno di movimento (mai il portiere, mai chi e'
   fuori per un'espulsione) piu' vicino al punto; gli avversari entro
   BATTUTA_RAGGIO vengono spinti fuori radialmente, senza pressare chi
   batte durante la finestra. */
function posaBattuta(){
  const st=G.battuta;
  if(!st || st.tipo!=='rimessa') return;
  const team=st.team;
  let bt=null, bd=1e9;
  for(const q of G.players){
    if(q.team!==team || q.out>0 || q.role==='gk') continue;
    const d=len(q.x-st.x, q.y-st.y);
    if(d<bd){ bd=d; bt=q; }
  }
  if(!bt) return;
  const bi=G.players.indexOf(bt);
  st.battitore=bi;
  bt.x = clamp(st.x, B_R+P_R, FW-(B_R+P_R));
  bt.y = clamp(st.y, B_R+P_R, FH-(B_R+P_R));
  bt.vx=0; bt.vy=0;
  const dir = team===0?1:-1;
  bt.fx=dir; bt.fy=0;
  const b=G.ball;
  b.owner=bi; b.x=bt.x+dir*CARRY_DIST; b.y=bt.y;
  segnaTocco(bi);
  /* gli stessi latch che il fischio azzera in resetKickoff (voce #87,
     precedente dichiarato): il battitore non eredita una scivolata o un
     anticipo aperto da prima del fermo. */
  bt.slide=-1; bt.recover=0; chiudiAnticipo(bt); bt.rove=-1; bt.kickT=0; bt.kickB=0;
  for(const q of G.players){
    if(q.team===team) continue;
    const dx=q.x-bt.x, dy=q.y-bt.y, d=Math.max(1,len(dx,dy));
    if(d<BATTUTA_RAGGIO){ q.x=bt.x+dx/d*BATTUTA_RAGGIO; q.y=bt.y+dy/d*BATTUTA_RAGGIO; }
  }
  if(!G.cpu[team]) G.ctrl[team]=bi;
}

function ballWalls(b){
`,
},

/* 7 — ballWalls, le sponde lunghe: a campo vero chiamano pallaFuori() e
   ritornano; il ramo gabbia resta INTATTO carattere per carattere. Il
   ramo else del fondo (sponde corte, fuori dalla luce) non si tocca:
   e' il compito 4. */
{
  nome: '6/9 ballWalls: le sponde lunghe imparano il campo vero',
  cerca:
`  if(b.y<B_R){ b.y=B_R; b.vy=Math.abs(b.vy)*0.82; hitWall(sp,false,0,1); }
  if(b.y>FH-B_R){ b.y=FH-B_R; b.vy=-Math.abs(b.vy)*0.82; hitWall(sp,false,0,-1); }
`,
  metti:
`  /* LE SPONDE LUNGHE (voce #87, compito 2): a campo vero la fascia non
     rimbalza piu', la palla si ferma e la riprende la squadra opposta
     all'ultimo tocco (rimessa). In GABBIA il ramo sotto resta identico
     al bit: zero dado() nuovi, il due-versioni a 5/7-gabbia non vede
     differenza. */
  if(b.y<B_R){
    if(G.campoVero){
      /* REGOLA FISSA, non dado(): se squadraDelPallone() non sa dire chi
         ha toccato per ultimo (chi<0, mai vero dopo il calcio d'inizio,
         che gia' semina un tocco in resetKickoff) la rimessa va alla
         squadra 0. Un pareggio di casi si scioglie con un letterale
         dichiarato, non con un sorteggio (legge dei sorteggi, voce #87). */
      const chi=squadraDelPallone();
      pallaFuori('rimessa', chi>=0?1-chi:0, b.x, 0);
      return;
    }
    b.y=B_R; b.vy=Math.abs(b.vy)*0.82; hitWall(sp,false,0,1);
  }
  if(b.y>FH-B_R){
    if(G.campoVero){
      const chi=squadraDelPallone();
      pallaFuori('rimessa', chi>=0?1-chi:0, b.x, FH);
      return;
    }
    b.y=FH-B_R; b.vy=-Math.abs(b.vy)*0.82; hitWall(sp,false,0,-1);
  }
`,
},

/* 8 — la camera: lo stacco del kickoff impara la battuta. La ripresa e'
   sul pallone, che al fermo E' il punto di battuta - stesso trucco della
   carrellata di kickoff, nessuna geometria nuova da disegnare. */
{
  nome: '7/9 camera: cerimonia impara la scena battuta',
  cerca: `  const cerimonia = (G.scene==='kickoff' || G.capT>0);\n`,
  metti: `  const cerimonia = (G.scene==='kickoff' || G.scene==='battuta' || G.capT>0);\n`,
},

/* 9 — la camera: lo snap rigido (nessuna molla) vale anche per battuta. */
{
  nome: '8/9 camera: lo snap del kickoff vale anche per battuta',
  cerca: `  if(G.scene==='kickoff'){ G.cam.x=tx; G.cam.y=ty; G.cam.z=tz; return; }\n`,
  metti: `  if(G.scene==='kickoff' || G.scene==='battuta'){ G.cam.x=tx; G.cam.y=ty; G.cam.z=tz; return; }\n`,
},

/* 10 — setPaused: una guardia in piu' trovata a re-grep (vedi il
   commento in testa al file). Senza questa voce il gate 5 del piano
   (pausa/ripresa durante il fermo) sarebbe un'illusione: la pausa si
   rifiuterebbe in silenzio durante 'battuta' e la "ripresa senza
   saltare" non proverebbe nulla. */
{
  nome: '9/9 setPaused: la battuta e\' un fermo di partita pausabile',
  cerca:
`function setPaused(v){
  v=!!v;
  if(v===G.paused) return;
  const inMatch = G.scene==='play'||G.scene==='kickoff'||G.scene==='golden'||
                  G.scene==='goal'||G.scene==='freekick';
  if(v && !inMatch) return;
`,
  metti:
`function setPaused(v){
  v=!!v;
  if(v===G.paused) return;
  /* BATTUTA E' UN FERMO DI PARTITA COME KICKOFF (voce #87, compito 2):
     senza questa voce in piu' la pausa si sarebbe rifiutata in silenzio
     durante il fermo della rimessa. Le sorelle di questa stessa lista
     (__indietro, checkOrientation, forceWinMatch) non sono toccate:
     nessun cancello di questo compito le esercita - osservazione per un
     giro di pulizia dedicato, non un obbligo qui. */
  const inMatch = G.scene==='play'||G.scene==='kickoff'||G.scene==='battuta'||G.scene==='golden'||
                  G.scene==='goal'||G.scene==='freekick';
  if(v && !inMatch) return;
`,
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

/* CONTEGGI A DELTA (come in _t-sponde-interruttore.js): marker distintivi
   di ciascuna sostituzione, ognuno atteso +1 fra src e out. */
const conta = (testo, s) => testo.split(s).length - 1;
const attesi = [
  ["IL FISCHIO DEL GOL UCCIDE UNA BATTUTA PENDENTE", 1],
  ["s==='kickoff'||s==='battuta'||s==='golden'", 1],
  ['LA BATTUTA SI CHIUDE QUI (voce #87, compito 2): kickBall', 1],
  ["if(G.scene==='battuta'){", 1],
  ['const scaduto = G.sceneT>=duraBattuta();', 1],
  ['eseguiAiPass(bp, manopoleDi(G.battuta.team));', 1],
  ['function pallaFuori(tipo, team, x, y){', 1],
  ['function posaBattuta(){', 1],
  ['function duraBattuta(){', 1],
  ['const BATTUTA_RAGGIO = 60;', 1],
  ["pallaFuori('rimessa', chi>=0?1-chi:0, b.x, 0);", 1],
  ["pallaFuori('rimessa', chi>=0?1-chi:0, b.x, FH);", 1],
  ["G.scene==='kickoff' || G.scene==='battuta' || G.capT>0", 1],
  ["G.scene==='kickoff' || G.scene==='battuta'){ G.cam.x=tx", 1],
  ["G.scene==='kickoff'||G.scene==='battuta'||G.scene==='golden'||", 1],
];
const rotti = attesi.filter(([s, n]) => (conta(out, s) - conta(src, s)) !== n)
  .map(([s, n]) => s + ' atteso +' + n + ', trovato +' + (conta(out, s) - conta(src, s)));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
