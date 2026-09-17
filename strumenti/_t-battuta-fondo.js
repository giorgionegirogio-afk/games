/* =====================================================================
   _t-battuta-fondo.js — IL FONDO E' UNA LINEA VERA: L'ANGOLO E IL RINVIO
   (voce #87, compito 4, ramo voce-87-rimesse-angoli).

   IL PERCHE'. I compiti 2/3 hanno portato al campo la rimessa laterale
   (fascia lunga) con la scena 'battuta' e i verbi di casa. Questo
   compito completa il fondo: la fetta di fondocampo fuori dalla luce
   della porta (il ramo 'else' di ballWalls, oggi un rimbalzo secco)
   diventa, a campo vero, un angolo (tocco della difesa) o un rinvio dal
   fondo (tocco dell'attacco) - squadraDelPallone() decide, zero dado().
   posaBattuta() impara a piazzare anche questi due tipi (oggi sapeva
   solo 'rimessa'); la finestra viva dell'auto-battuta impara a battere
   l'angolo col piede (doCross, come un cross umano) invece che con
   eseguiAiPass; il rinvio non passa mai da quella finestra, perche' la
   scena 'battuta' lo scioglie gia' da sola all'uscita (ramo esistente,
   :16701, non toccato) e il flusso di rinvioPortiere esistente fa il
   resto. duraBattuta() ha gia' il ramo angolo dal compito 1: si consuma
   senza toccarlo.

   PERCHE' DELEGATE INVECE DI ANNIDATE. posaBattuta() oggi si ferma con
   "if(!st || st.tipo!=='rimessa') return;" e prosegue con un corpo
   flat, non annidato in un if. Racchiudere quel corpo in un
   "if(st.tipo==='rimessa'){...}" lo avrebbe lasciato con l'indentazione
   di prima (un debito di leggibilita' che l'attrezzo non puo' correggere
   riga per riga senza rifare l'intera funzione). ANGOLO e RINVIO vivono
   quindi in due funzioni sorelle, posaBattutaAngolo(st)/
   posaBattutaRinvio(st): il ramo rimessa resta IDENTICO carattere per
   carattere, tranne la riga di apertura che smista.

   LE SEI ANCORE (A+B condividono una voce sola, sono due if consecutivi
   nello stesso blocco):
     A+B. ballWalls, sponde corte sinistra e destra (b.x<B_R / b.x>FW-B_R)
        - a campo vero: squadraDelPallone() decide angolo (la difesa di
        quella porta ha toccato) o rinvio (l'attacco, o chi<0: regola
        fissa, zero dado()).
     C. pallaFuori: il banner impara il grigio di casa per 'rinvio' (lo
        stesso hex di ALTA!, :19268); angolo e rimessa restano nel
        colore della squadra che batte.
     D. posaBattuta: il commento di testa + la riga di apertura smista
        ai tre tipi (angolo/rinvio delegano, rimessa prosegue flat).
     E. Le due funzioni nuove, posaBattutaAngolo/posaBattutaRinvio,
        inserite subito dopo la chiusura di posaBattuta e prima di
        ballWalls.
     F. la finestra viva dell'auto-battuta (:16847-16858): si ramifica
        per tipo. 'angolo' batte con doCross(bp,0,0,null,dest), dest = il
        compagno in area piu' vicino al dischetto di rigore della porta
        attaccata (pattern di doCrossUmano, bersaglio fisso invece di
        puntoCross); tutti gli altri tipi che arrivano qui (oggi solo
        'rimessa': 'rinvio' non ci arriva mai, si scioglie prima) restano
        su eseguiAiPass. La guardia di salvataggio (nessun compagno
        valido -> calcio al centro) resta DOPO l'if/else, condivisa.
     G. updateCamera: 'battuta' entra in inPlay. RILIEVO MISURATO (non nel
        piano, scoperto qui): la scena 'battuta' NON era mai entrata
        nell'elenco inPlay (:29602, dal compito 2) - la guardia poco sotto
        ("if(!(inPlay || G.moviola) || !G.ball)", :29902) intercetta 'battuta'
        PRIMA di arrivare al codice che gia' esiste per snappare la camera
        sul pallone ("cerimonia", :30479-30495, che GIA' controlla
        G.scene==='battuta' - scritto al compito 2 ma MAI raggiunto). La
        camera cadeva quindi sulla vista da home/menu (centro campo fisso),
        non sul punto di battuta - misurato con uno screenshot vero durante
        il fermo, a 11 e a 5, PRIMA di questa riga: il cerchio di meta'
        campo, non l'angolo ne' il portiere. Una parola aggiunta all'OR
        basta a raggiungere il codice gia' scritto: zero dado(), zero
        impatto sui sorteggi (inPlay non serve ad altro che a questa scelta
        di camera, verificato con un solo altro uso nel file, riga 29902).

   ZERO dado() NUOVO: ballWalls/posaBattuta/posaBattutaAngolo/
   posaBattutaRinvio/pallaFuori/la finestra/updateCamera non chiamano mai
   dado() direttamente. doCross non ne consuma (verificato leggendo la sua
   definizione, :15532-15559); eseguiAiPass ne consumava gia' uno suo
   prima di questo compito (percorso normale della CPU), invariato. Il
   due-versioni a 5/7-gabbia deve restare a 0 divergenze: il ramo campo
   vero del fondo non e' mai attraversato in GABBIA, e la riga di camera
   non tocca in nessun modo la fisica o l'IA.

   uso:  node strumenti/_t-battuta-fondo.js --out fuori/battuta-fondo.html
         node strumenti/_t-battuta-fondo.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/battuta-fondo.html'));

const ANCORE = [

/* A — ballWalls, sponda corta sinistra: a campo vero, angolo o rinvio
   invece del rimbalzo. Difende il team 0 (formation(), :10442 e succ.):
   chi===0 (la difesa ha toccato per ultima) -> angolo per l'avversario
   (team 1); altrimenti (attacco, o chi<0 - regola fissa, zero dado(),
   lo stesso letterale gia' scelto per le fasce lunghe) -> rinvio dal
   fondo per chi difende (team 0). Include anche B (il ramo destro), lo
   specchio: sono due if consecutivi nello stesso blocco 'else', un'unica
   ancora sull'intero blocco evita l'ambiguita' di due 'cerca' vicini e
   quasi identici. */
{
  nome: 'A+B/6 ballWalls: sponde corte, angolo/rinvio a campo vero',
  cerca:
`    if(b.x<B_R){
      b.x=B_R; b.vx=Math.abs(b.vx)*0.82;
      hitWall(sp, Math.abs(b.y-GY0)<16||Math.abs(b.y-GY1)<16, 1, 0);
    }
    if(b.x>FW-B_R){
      b.x=FW-B_R; b.vx=-Math.abs(b.vx)*0.82;
      hitWall(sp, Math.abs(b.y-GY0)<16||Math.abs(b.y-GY1)<16, -1, 0);
    }
`,
  metti:
`    /* IL FONDO E' UNA LINEA VERA (voce #87, compito 4): a campo vero il
       fondo fuori dalla luce non rimbalza piu'. squadraDelPallone()
       (:14309) dice chi ha toccato per ultimo: la difesa di quella porta
       -> angolo per l'avversario; l'attacco - O chi<0, regola fissa
       commentata, zero dado(), lo stesso letterale gia' scelto per le
       fasce lunghe - -> rinvio dal fondo per chi difende. In GABBIA i
       due rami sotto restano identici al bit. */
    if(b.x<B_R){
      if(G.campoVero){
        const chi=squadraDelPallone();
        if(chi===0) pallaFuori('angolo', 1, 0, b.y<FH/2?0:FH);
        else pallaFuori('rinvio', 0, 0, b.y);
        return;
      }
      b.x=B_R; b.vx=Math.abs(b.vx)*0.82;
      hitWall(sp, Math.abs(b.y-GY0)<16||Math.abs(b.y-GY1)<16, 1, 0);
    }
    if(b.x>FW-B_R){
      if(G.campoVero){
        const chi=squadraDelPallone();
        if(chi===1) pallaFuori('angolo', 0, FW, b.y<FH/2?0:FH);
        else pallaFuori('rinvio', 1, FW, b.y);
        return;
      }
      b.x=FW-B_R; b.vx=-Math.abs(b.vx)*0.82;
      hitWall(sp, Math.abs(b.y-GY0)<16||Math.abs(b.y-GY1)<16, -1, 0);
    }
`,
},

/* C — pallaFuori: il banner. RINVIO e' grigio di casa (come ALTA! di
   ballOverBar, stesso hex, stesso evento in sostanza); rimessa e angolo
   restano nel colore della squadra che batte. */
{
  nome: 'C/6 pallaFuori: banner grigio per rinvio, colore squadra altrove',
  cerca:
`  showBanner(tipo.toUpperCase(), TEAMCOL[team], 0.9);
`,
  metti:
`  /* RINVIO E' GRIGIO DI CASA (voce #87, compito 4), lo stesso hex di
     ALTA! (ballOverBar, :19268) - in sostanza e' lo stesso evento, un
     rinvio dal fondo. Rimessa e angolo restano nel colore della squadra
     che batte, invariato dal compito 2. */
  showBanner(tipo.toUpperCase(), tipo==='rinvio'?'#96ab9e':TEAMCOL[team], 0.9);
`,
},

/* D — posaBattuta: il commento di testa + la riga di apertura smista ai
   tre tipi. Il corpo del ramo rimessa (tutto cio' che segue "const
   team=st.team;" fino alla chiusura di funzione) NON e' toccato da
   questa ancora: resta identico carattere per carattere. */
{
  nome: 'D/6 posaBattuta: commento di testa + apertura ai tre tipi',
  cerca:
`/* piazza il battitore e la palla sul punto di uscita. Per ora solo il
   tipo 'rimessa' (angolo e rinvio arrivano ai compiti 3 e 4): il
   battitore e' il compagno di movimento (mai il portiere, mai chi e'
   fuori per un'espulsione) piu' vicino al punto; gli avversari entro
   BATTUTA_RAGGIO vengono spinti fuori radialmente, senza pressare chi
   batte durante la finestra. */
function posaBattuta(){
  const st=G.battuta;
  if(!st || st.tipo!=='rimessa') return;
  const team=st.team;
`,
  metti:
`/* piazza il battitore e la palla sul punto di uscita. RIMESSA (sotto,
   invariata dal compito 2): il battitore e' il compagno di movimento
   (mai il portiere, mai chi e' fuori per un'espulsione) piu' vicino al
   punto; gli avversari entro BATTUTA_RAGGIO vengono spinti fuori
   radialmente, senza pressare chi batte durante la finestra. ANGOLO e
   RINVIO (voce #87, compito 4) vivono nelle due funzioni sorelle qui
   sotto, posaBattutaAngolo/posaBattutaRinvio - delegate invece di
   annidate, cosi' il ramo rimessa resta carattere per carattere quello
   di sempre (vedi il commento in testa all'attrezzo per il perche'). */
function posaBattuta(){
  const st=G.battuta;
  if(!st) return;
  if(st.tipo==='angolo') return posaBattutaAngolo(st);
  if(st.tipo==='rinvio') return posaBattutaRinvio(st);
  if(st.tipo!=='rimessa') return;
  const team=st.team;
`,
},

/* E — le due funzioni nuove, inserite subito dopo la chiusura di
   posaBattuta e prima di ballWalls (stesso punto dove il compito 2
   aveva gia' messo posaBattuta). */
{
  nome: 'E/6 posaBattutaAngolo + posaBattutaRinvio, nuove, prima di ballWalls',
  cerca:
`  if(!G.cpu[team]) G.ctrl[team]=bi;
}

function ballWalls(b){
`,
  metti:
`  if(!G.cpu[team]) G.ctrl[team]=bi;
}

/* ANGOLO (voce #87, compito 4): st.x/st.y sono gia' il quadrante esatto
   (0/FW, 0/FH) scritto da ballWalls - qui si traduce nel punto vero
   sull'arco, 10 unita' dentro la linea di fondo e la fascia (gli archi
   da 14 sono gia' dipinti, :27894). Battitore = compagno di movimento
   piu' vicino all'arco. ATTACCANTI IN AREA: i 2 (taglia 5) o 3 (7/11)
   compagni di movimento (battitore escluso) piu' avanzati verso la
   porta attaccata, alle tre quote fisse del brief. DIFENSORI: per
   ciascun attaccante piazzato, l'avversario di movimento piu' vicino
   (non ancora assegnato a un altro attaccante) va a marcarlo 18 unita'
   verso la propria porta. PORTIERE sulla linea. Gli altri restano dove
   sono. Tutto deterministico, zero dado(). */
function posaBattutaAngolo(st){
  const team=st.team, dif=1-team;
  const gx = st.x;                          // 0 = porta sinistra, FW = destra
  const dirIn = gx===0 ? 1 : -1;             // dalla linea di fondo verso il centro
  const bx = gx===0 ? 10 : FW-10;
  const by = st.y===0 ? 10 : FH-10;
  let bt=null, bd=1e9;
  for(const q of G.players){
    if(q.team!==team || q.out>0 || q.role==='gk') continue;
    const d=len(q.x-bx, q.y-by);
    if(d<bd){ bd=d; bt=q; }
  }
  if(!bt) return;
  const bi=G.players.indexOf(bt);
  st.battitore=bi;
  bt.x=bx; bt.y=by; bt.vx=0; bt.vy=0;
  bt.fx=dirIn; bt.fy=0;
  const b=G.ball;
  b.owner=bi; b.x=bt.x+dirIn*CARRY_DIST; b.y=bt.y;
  segnaTocco(bi);
  /* gli stessi latch che il fischio azzera in resetKickoff (voce #87,
     precedente dichiarato in posaBattuta): il battitore non eredita una
     scivolata o un anticipo aperto da prima del fermo. */
  bt.slide=-1; bt.recover=0; chiudiAnticipo(bt); bt.rove=-1; bt.kickT=0; bt.kickB=0; bt.rimT=0;
  const N = TAGLIA>5?3:2;
  const areaY=[0,-44,44];
  const attaccanti = G.players
    .filter(q=>q.team===team && q.out<=0 && q.role!=='gk' && q!==bt)
    .sort((p,q)=>Math.abs(p.x-gx)-Math.abs(q.x-gx))
    .slice(0,N);
  const marcati=new Set();
  for(let i=0;i<attaccanti.length;i++){
    const a=attaccanti[i];
    a.x = gx + dirIn*VERNICE.areaProf*0.6;
    a.y = FH/2 + areaY[i];
    a.vx=0; a.vy=0;
    let dm=null, dd=1e9;
    for(const r of G.players){
      if(r.team!==dif || r.out>0 || r.role==='gk' || marcati.has(r)) continue;
      const d=len(r.x-a.x, r.y-a.y);
      if(d<dd){ dd=d; dm=r; }
    }
    if(dm){
      marcati.add(dm);
      dm.x = a.x - dirIn*18; dm.y = a.y;
      dm.vx=0; dm.vy=0;
    }
  }
  const gk = portiereDi(dif);
  if(gk){ gk.x = gx + dirIn*8; gk.y = FH/2; gk.vx=0; gk.vy=0; }
  if(!G.cpu[team]) G.ctrl[team]=bi;
}

/* RINVIO DAL FONDO (voce #87, compito 4): la palla torna fra le mani del
   portiere (o del piu' arretrato, pattern di ballOverBar, :19277-19290)
   - y=FH/2 FISSO, NIENTE rnd(-70,70): ballOverBar lo usa perche' nasce a
   meta' di un'azione viva e la variazione serve a non sembrare un
   teletrasporto meccanico; questo invece e' un fermo dichiarato con la
   camera sul punto - il centro della porta e' gia' la posizione onesta,
   non serve mascherare nulla con un dado. Il flusso esistente
   (owner===portiere && kickCd<=0 -> rinvioPortiere) fa il resto con la
   sua clip: nessuna guardia G.ctrl qui, il rinvio del portiere e' sempre
   automatico, umano o CPU che sia (censimento RIMESSE-E-ANGOLI.md §4). */
function posaBattutaRinvio(st){
  const team=st.team;
  const gx = team===0?0:FW;
  let deep=portiereDi(team), dd=1e9;
  if(!deep) for(const q of G.players){
    if(q.team!==team||q.out>0) continue;
    const d=Math.abs(q.x-gx);
    if(d<dd){ dd=d; deep=q; }
  }
  if(!deep) return;
  const bi=G.players.indexOf(deep);
  st.battitore=bi;
  deep.x = team===0? 58 : FW-58;
  deep.y = FH/2;
  deep.vx=0; deep.vy=0;
  const b=G.ball;
  b.owner=bi; b.x=deep.x+(team===0?1:-1)*CARRY_DIST; b.y=deep.y;
  deep.kickCd=0.5;
  segnaTocco(bi);
}

function ballWalls(b){
`,
},

/* F — la finestra viva dell'auto-battuta: si ramifica per tipo. */
{
  nome: 'F/6 finestra viva: angolo batte con doCross, gli altri con eseguiAiPass',
  cerca:
`    if(bp && ((cpu && G.battuta.hold<=BATTUTA_HOLD-BATTUTA_CPU) || G.battuta.hold<=0)){
      eseguiAiPass(bp, manopoleDi(G.battuta.team));
      if(G.battuta){
`,
  metti:
`    if(bp && ((cpu && G.battuta.hold<=BATTUTA_HOLD-BATTUTA_CPU) || G.battuta.hold<=0)){
      /* L'ANGOLO SI BATTE COL PIEDE (voce #87, compito 4): stesso verbo
         del cross umano (doCrossUmano), ma con un bersaglio FISSO al
         posto della normale puntoCross - il dischetto di rigore della
         porta attaccata (VERNICE.dischetto), cosi' il destinatario e'
         sempre qualcuno piazzato in area da posaBattutaAngolo, non chi
         capita vicino al secondo palo calcolato per un cross a meta'
         azione. Zero dado() nuovo: doCross non ne consuma. Il tipo
         'rinvio' non arriva mai qui - G.battuta e' gia' azzerato
         all'uscita dalla scena 'battuta' (ramo qui sopra, :16701) -
         quindi questo blocco vede solo rimessa/angolo. */
      if(G.battuta.tipo==='angolo'){
        const gx = bp.team===0?FW:0;
        const dischX = gx===0?VERNICE.dischetto:FW-VERNICE.dischetto;
        let dest, bd=1e9;
        for(let i=0;i<G.players.length;i++){
          const w=G.players[i];
          if(w.team!==bp.team || w===bp || w.out>0 || w.role==='gk') continue;
          const d=len(w.x-dischX, w.y-FH/2);
          if(d<bd){ bd=d; dest=i; }
        }
        doCross(bp, 0, 0, null, dest);
      }else{
        eseguiAiPass(bp, manopoleDi(G.battuta.team));
      }
      if(G.battuta){
`,
},

/* G — updateCamera: 'battuta' entra in inPlay, cosi' la scena raggiunge
   il codice "cerimonia" gia' scritto al compito 2 (:30479-30495), che
   gia' controlla G.scene==='battuta' ma non veniva mai raggiunto -
   vedi il rilievo in testa all'attrezzo. */
{
  nome: 'G/6 updateCamera: battuta entra in inPlay (raggiunge il codice gia\' scritto)',
  cerca:
`  const inPlay = G.scene==='play'||G.scene==='golden'||G.scene==='kickoff'||G.scene==='freekick';
`,
  metti:
`  /* 'battuta' manca qui dal compito 2 (voce #87): senza, la guardia poco
     sotto ("if(!(inPlay || G.moviola) || !G.ball)") intercetta la scena
     PRIMA che arrivi al codice "cerimonia" che gia' esiste per snappare
     la camera sul pallone (piu' sotto, controlla gia' G.scene==='battuta'
     ma non veniva mai raggiunto) - misurato con uno screenshot vero
     durante il fermo: senza questa riga la camera mostra il centro
     campo della vista home, non il punto di battuta. */
  const inPlay = G.scene==='play'||G.scene==='golden'||G.scene==='kickoff'||G.scene==='freekick'||G.scene==='battuta';
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

/* CONTEGGI A DELTA: marker distintivi di ciascuna sostituzione, ognuno
   atteso +1 fra src e out. */
const conta = (testo, s) => testo.split(s).length - 1;
const attesi = [
  ["if(chi===0) pallaFuori('angolo', 1, 0, b.y<FH/2?0:FH);", 1],
  ["if(chi===1) pallaFuori('angolo', 0, FW, b.y<FH/2?0:FH);", 1],
  ["showBanner(tipo.toUpperCase(), tipo==='rinvio'?'#96ab9e':TEAMCOL[team], 0.9);", 1],
  ["  if(!st) return;\n  if(st.tipo==='angolo') return posaBattutaAngolo(st);", 1],
  ["function posaBattutaAngolo(st){", 1],
  ["function posaBattutaRinvio(st){", 1],
  ["deep.kickCd=0.5;", 1],
  ["if(G.battuta.tipo==='angolo'){", 1],
  ["doCross(bp, 0, 0, null, dest);", 1],
  ["||G.scene==='battuta';", 1],
];
const rotti = attesi.filter(([s, n]) => (conta(out, s) - conta(src, s)) !== n)
  .map(([s, n]) => s + ' atteso +' + n + ', trovato +' + (conta(out, s) - conta(src, s)));
/* le forme vecchie devono sparire (sostituite, non duplicate) */
const scomparsi = [
  "if(!st || st.tipo!=='rimessa') return;",
  "  showBanner(tipo.toUpperCase(), TEAMCOL[team], 0.9);\n",
  "      eseguiAiPass(bp, manopoleDi(G.battuta.team));\n      if(G.battuta){\n        /* nessun compagno valido",
];
for (const s of scomparsi) {
  if (conta(out, s) !== 0) rotti.push(s + ' atteso 0 in uscita, trovato ' + conta(out, s));
}
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
