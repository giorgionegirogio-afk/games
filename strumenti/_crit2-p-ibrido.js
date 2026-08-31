/* =====================================================================
   _p-strappo.js — IL BANCO DEL DUELLO: un portatore, un difensore, un
   pollice che strappa.

   PERCHE' NON BASTA _eventi.js. Quello strumento misura partite CPU
   contro CPU: il pollice non c'e', quindi una cura che vive SOLO sotto
   il dito umano non ci si vede — ne' in bene ne' in male. Su _eventi.js
   una cura umana deve uscire IDENTICA AL BIT, ed e' esattamente la
   prova che non ha sporcato niente. Il rendimento va misurato altrove,
   ed e' qui.

   COS'E' UN DUELLO, in questo banco. Si spegne tutto tranne quattro
   uomini (i due portieri restano in porta, gli altri escono con out>0,
   che nel gioco vuol dire «espulso, non tocca palla e non decide»):
   resta un PORTATORE umano lanciato verso la porta avversaria e UN
   DIFENSORE piazzato a distanza, angolo e velocita' dichiarati. Il
   pollice e' uno script: trenta fotogrammi dritto — cosi' la memoria
   della levetta si assesta e il difensore si impegna — poi LO STRAPPO
   (la levetta attraversa il centro e riappare dall'altra parte, che e'
   il gesto vero: chi gira "arcuando" fuori non strappa), poi novanta
   fotogrammi di corsa nella direzione nuova.

   COSA SI MISURA, alla fine del secondo e mezzo:
     mio      il pallone e' ancora di un uomo della squadra 0
     loro     l'ha il difensore (o un suo compagno: qui non ce ne sono)
     libero   non e' di nessuno (rotola: nessuno dei due l'ha presa)
     stacco   quante unita' di campo separano portatore e difensore alla
              fine, MENO quelle che li separavano allo strappo. E' il
              guadagno vero: e' per quello che si fa una finta.
     avanti   quanto e' avanzato il pallone verso la porta avversaria
     staccato se il pallone si e' DISTACCATO dal piede nel fotogramma
              dello strappo (nel gioco spedito non succede mai: il
              pallone e' cucito a una molla)

   I DUE BRACCI SONO LO STESSO SCRIPT. Il pollice fa lo stesso identico
   gesto sul gioco spedito e su quello curato, con lo stesso seme per
   ogni duello: la differenza che si legge e' la cura, non il caso.

   ---------------------------------------------------------------------
   IL BRACCIO DI TASTIERA (--tastiera), AGGIUNTO IL 28 AGOSTO 2026 PERCHE'
   LA SUA ASSENZA HA LASCIATO PASSARE UN DIFETTO INTERO.

   Il banco qui sopra muove SOLO Touch5.stick. E' l'ingresso giusto per
   misurare il RENDIMENTO della finta — la finta e' un gesto di pollice —
   ma il gioco ha DUE ingressi, e il secondo non passava di qui. Il
   riconoscimento dello strappo leggeva humanMove, che e' l'unione dei
   due, e da tastiera humanMove torna -1/0/+1 normalizzati: fra un tasto e
   l'altro il comando e' nullo, e la prima stesura leggeva quel nullo come
   «il pollice ha attraversato il centro della levetta». Risultato: OGNI
   virata di tastiera staccava il pallone dal piede, 88,1% su 540 virate,
   e nessun numero di questo banco poteva vederlo perche' questo banco
   non premeva un tasto.

   Il braccio di tastiera fa la cosa piu' banale che esista — corri a
   destra, MOLLA, due fotogrammi di buco, premi su — e stampa una colonna
   sola come cancello: PALLONE DISTACCATO DAL PIEDE, che deve valere 0,0%
   esattamente come sul gioco spedito. Piu' una colonna che il gioco
   spedito non ha nemmeno come campo: STRAPPO ACCESO (p.strappoCd>0), che
   e' il testimone diretto — solo provaStrappo lo scrive.

   Chi aggiungera' una cura sull'ingresso: si corre PRIMA di spedire, e i
   due bracci si guardano insieme. Un banco che tocca un solo ingresso su
   due non e' un banco piu' piccolo, e' un banco cieco da un occhio.

   uso:
     node strumenti/_p-strappo.js
     node strumenti/_p-strappo.js --gioco fuori/strappo.html --etichetta DOPO
     node strumenti/_p-strappo.js --contro fuori/_strappo-prima.json
     node strumenti/_p-strappo.js --json fuori/_strappo-dopo.json
     node strumenti/_p-strappo.js --costo        misura i ms per fotogramma
     node strumenti/_p-strappo.js --tastiera     540 virate di TASTIERA
     node strumenti/_p-strappo.js --tastiera --gioco fuori/strappo2.html
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;

function servi(prova) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (prova && /CALCETTO-il-gioco\.html$/i.test(f)) f = prova;
      if ((!f.startsWith(RADICE) && f !== prova) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* =====================================================================
   LA GRIGLIA. Cinque distanze, sei angoli d'arrivo, tre impegni, tre
   tagli, tre difficolta': 5x6x3x3x3 = 810 duelli per braccio. Le
   distanze partono da 26 (il difensore e' gia' addosso: lo strappo
   arriva TARDI e deve fallire) e arrivano a 70 (troppo presto: la
   finta si fa a nessuno). L'impegno 0 e' il difensore FERMO, che e'
   il caso in cui una finta non deve regalare niente.
   ===================================================================== */
const GRIGLIA = haFlag('rapido') ? {
  /* LA GRIGLIA RAPIDA serve a TARARE, non a giudicare: 144 duelli in una
     quarantina di secondi, per scegliere fra varianti. Il numero che si
     spedisce si prende sempre sulla griglia intera — le due non si
     confrontano fra loro, e chi le mescolasse leggerebbe la griglia
     invece della cura. */
  dist: [26, 44, 70],
  ang: [0, 90, -90, 140],
  impegno: [0, 168],
  taglio: [90, 175],
  diff: [0, 1, 2],
} : {
  dist: [26, 34, 44, 56, 70],
  ang: [0, 40, -40, 90, -90, 140],       // gradi: 0 = frontale, 180 = alle spalle
  impegno: [0, 120, 168],                // u/s con cui il difensore punta il portatore
  taglio: [90, -90, 175],                // gradi dello strappo rispetto alla marcia
  diff: [0, 1, 2],
};

/* la griglia del braccio di tastiera: la stessa geometria, ma il "taglio"
   non e' un angolo qualunque — sono i due soli tasti che una virata di 90
   gradi puo' premere dopo D. 5x6x3x2x3 = 540 virate. */
const GRIGLIA_KB = {
  dist: [26, 34, 44, 56, 70],
  ang: [0, 40, -40, 90, -90, 140],
  impegno: [0, 120, 168],
  tasto: ['su', 'giu'],
  diff: [0, 1, 2],
};

/* LA FUNZIONE DI PAGINA E' UNA FUNZIONE VERA, NON UNA STRINGA. Passando
   una stringa Playwright non le consegna l'argomento e torna undefined —
   provato, e costa mezz'ora a capirlo. Qui la si scrive come funzione e
   la si lascia serializzare da toString: G, FW, P_SPEED e Touch5 sono
   `const` di primo livello del gioco, cioe' non proprieta' del globale
   ma LEGGIBILI per nome da qualunque script dello stesso realm — la
   stessa cosa che fa la sonda di _eventi.js. */
/* eslint-disable no-undef */
const BANCO = (cfg) => {
  const T = window.__test;
  const DT = 1/60;
  const out = [];
  for(const c of cfg){
    window.__caso.semina(c.seme);
    T.startMatch(1, c.diff);
    /* si entra in gioco: il calcio d'inizio ha una sua coreografia e
       non e' il duello che vogliamo misurare */
    T.simulate(1.2);
    if(T.state!=='play' && T.state!=='kickoff'){ out.push({salta:T.state}); continue; }

    const P = G.players;
    /* IL CAMPO SI SVUOTA FINO A QUATTRO UOMINI DI MOVIMENTO, DUE PER
       PARTE — e i due di troppo non sono un lusso.
       Con UN SOLO uomo di movimento per squadra il cervello di squadra
       lo nomina ULTIMO UOMO (e' il piu' vicino alla propria porta:
       e' l'unico) e nessuno diventa PRESSATORE: misurato sulla prima
       stesura di questo banco, il "difensore" si ritirava a casa e il
       distacco mediano usciva 256 unita' in un secondo e mezzo, cioe' il
       banco stava misurando una ritirata, non un duello.
       Adesso ogni squadra tiene un ultimo uomo PARCHEGGIATO sulla propria
       linea — cosi' il ruolo di ultimo va a lui — e il duello lo fanno gli
       altri due. Il compagno del portatore serve anche a un'altra
       domanda: il cambio automatico puo' rubargli il comando mentre la
       palla e' di nessuno? (colonna «comando rubato»).
       out>0 nel gioco vuol dire espulso: l'uomo aspetta a bordo campo,
       non tocca palla e non decide. E' il modo del gioco stesso di
       togliere un uomo, non un trucco del banco. */
    let mio=-1, suo=-1, mioCasa=-1, suoCasa=-1;
    for(let i=0;i<P.length;i++){
      const p=P[i];
      if(p.role==='gk'){ continue; }
      if(p.team===0 && mio<0){ mio=i; continue; }
      if(p.team===1 && suo<0){ suo=i; continue; }
      if(p.team===0 && mioCasa<0){ mioCasa=i; continue; }
      if(p.team===1 && suoCasa<0){ suoCasa=i; continue; }
      p.out=99; p.x=-200; p.y=-200; p.vx=0; p.vy=0;
    }
    const A=P[mio], D=P[suo];
    for(const [k,gx] of [[mioCasa,70],[suoCasa,FW-70]]){
      if(k<0) continue;
      const q=P[k];
      q.out=0; q.x=gx; q.y=FH/2; q.vx=0; q.vy=0; q.ax=0; q.ay=0;
      q.slide=-1; q.recover=0; q.kickCd=0; q.charge=-1;
    }
    G.ctrl[0]=mio; G.cpu[0]=false; G.cpu[1]=true; G.swTimer[0]=0; G.swLock[0]=0;

    /* il portatore, lanciato verso la porta avversaria (squadra 0 -> +x) */
    A.x=FW*0.42; A.y=FH/2; A.vx=P_SPEED; A.vy=0; A.ax=0; A.ay=0;
    A.fx=1; A.fy=0; A.out=0; A.slide=-1; A.recover=0; A.kickCd=0; A.charge=-1;
    A.fiato=100;
    const b=G.ball;
    b.owner=mio; b.passTo=-1; b.crossTo=-1; b.x=A.x+16; b.y=A.y; b.z=0;
    b.vx=0; b.vy=0; b.vz=0; b.curve=0; b.perfectT=0;

    /* il pollice: dritto verso la porta. La levetta e' un oggetto del
       gioco (Touch5.stick) e si scrive come la scriverebbe un dito. */
    const S=Touch5.stick[0];
    S.active=true; S.id=1; S.ox=100; S.oy=300; S.dx=50; S.dy=0; S.hist=[];

    /* i ruoli si riassegnano SUBITO sul campo appena svuotato: se no
       restano quelli del calcio d'inizio, che parlano di uomini che
       adesso sono a bordo campo */
    if(G.brain[0]) G.brain[0].ruoloT=-1;
    if(G.brain[1]) G.brain[1].ruoloT=-1;

    /* TRENTA FOTOGRAMMI DRITTI: la memoria del comando si assesta e il
       difensore, che ripianifica ogni D.react, si impegna sulla linea. */
    for(let f=0;f<30;f++) T.simulate(DT);

    /* IL DIFENSORE SI PIAZZA ESATTO, un fotogramma prima dello strappo:
       cosi' la geometria del duello e' quella dichiarata e non quella
       che l'IA ha prodotto per conto suo. La sua velocita' punta il
       portatore: e' l'IMPEGNO, cioe' la cosa su cui una finta vive. */
    const ra = c.ang*Math.PI/180;
    D.x = A.x + Math.cos(ra)*c.dist;
    D.y = A.y + Math.sin(ra)*c.dist;
    D.out=0; D.slide=-1; D.recover=0; D.kickCd=0; D.charge=-1;
    {
      const dx=A.x-D.x, dy=A.y-D.y, dl=Math.max(1,Math.sqrt(dx*dx+dy*dy));
      D.vx=dx/dl*c.impegno; D.vy=dy/dl*c.impegno;
      D.ax=0; D.ay=0; D.fx=dx/dl; D.fy=dy/dl;
    }

    const d0 = Math.hypot(A.x-D.x, A.y-D.y);
    const bx0 = b.x;
    const ax0 = A.x;
    const own0 = b.owner;

    /* LO STRAPPO: la levetta ATTRAVERSA IL CENTRO. Due fotogrammi nel
       morto (e' il dito che passa dal mezzo: e' quello che distingue
       uno strappo da una virata arcuata) e poi riappare nella
       direzione nuova. */
    S.dx=0; S.dy=0;
    T.simulate(DT); T.simulate(DT);
    const rt = c.taglio*Math.PI/180;
    S.dx = Math.cos(rt)*50; S.dy = Math.sin(rt)*50;
    T.simulate(DT);
    const staccato = (G.ball.owner<0 && own0>=0) ? 1 : 0;

    /* =====================================================================
       E POI SI RADDRIZZA VERSO LA PORTA — ed e' la correzione piu'
       importante che questo banco abbia avuto.

       La prima stesura teneva la levetta nella direzione del taglio per
       tutto il secondo e mezzo. Ma nessuno gioca cosi': si taglia per
       TOGLIERSI DA DAVANTI a un uomo, e appena lo si e' passato si torna
       a puntare la porta. Con la levetta bloccata di traverso il banco
       misurava una FUGA — «quanto mi allontano» — e la fuga la fa meglio
       chi ha il pallone cucito ai piedi, cioe' il gioco spedito, per
       costruzione: qualunque distacco del pallone e' una perdita secca.
       Con quella domanda nessuna finta di nessun gioco potrebbe mai
       vincere, e il banco lo diceva (tenuta 65,3% contro 52-62 di tutte e
       cinque le varianti) senza che il numero volesse dire niente.
       Adesso: quindici fotogrammi nel taglio — il tempo del gesto — e poi
       la levetta punta la porta avversaria, aggiornata a ogni fotogramma
       come farebbe un pollice. La domanda diventa quella giusta:
       L'HO PASSATO, o no?
       (Il ritorno verso la porta non puo' riaccendere uno strappo: il
       comando cambia verso senza passare dal centro, e senza traversata
       non c'e' strappo. E' la stessa proprieta' che rende innocua la
       virata arcuata.) */
    const gx = FW;   // la squadra 0 attacca +x
    for(let f=0;f<15;f++) T.simulate(DT);
    for(let f=0;f<75;f++){
      const dx=gx-A.x, dy=FH/2-A.y, dl=Math.max(1,Math.sqrt(dx*dx+dy*dy));
      S.dx=dx/dl*50; S.dy=dy/dl*50;
      T.simulate(DT);
    }

    const bb=G.ball;
    let esito='libero';
    if(bb.owner>=0) esito = (P[bb.owner].team===0) ? 'mio' : 'loro';
    /* QUANDO IL PALLONE E' ANCORA DI NESSUNO la partita non e' finita, e
       dire «libero» e basta butta via l'informazione: chi ci sta arrivando
       decide chi l'avra' fra un decimo di secondo.
       SI GUARDANO SOLO I DUE DEL DUELLO. La prima stesura guardava tutti
       gli uomini in campo e i due PARCHEGGIATI vincevano sempre: il
       pallone rotola verso la porta avversaria, quindi il piu' vicino
       risultava l'ultimo uomo avversario a casa sua, e la colonna
       tornava «ci arrivo io 0%» in tutti e 810 i duelli — un numero che
       non parlava del duello ma della geometria del parcheggio. */
    const dMio=Math.hypot(A.x-bb.x, A.y-bb.y), dSuo=Math.hypot(D.x-bb.x, D.y-bb.y);
    const vic = dMio<=dSuo ? 0 : 1;
    /* L'HO PASSATO? Tre condizioni insieme, e nessuna basta da sola:
       il pallone e' mio (o libero e ci arrivo io), il difensore e'
       DIETRO di me rispetto alla porta, e sono piu' avanti di dove ero
       quando ho strappato. E' la definizione di «saltare un uomo». */
    const mioOra = (bb.owner>=0 ? P[bb.owner].team===0 : vic===0);
    const superato = (mioOra && D.x < A.x-P_R && A.x > ax0) ? 1 : 0;
    const d1 = Math.hypot(A.x-D.x, A.y-D.y);
    out.push({
      esito: esito,
      staccato: staccato,
      stacco: d1-d0,
      avanti: bb.x-bx0,
      ctrl: (G.ctrl[0]===mio) ? 0 : 1,
      vicino: vic, dMio: dMio, dSuo: dSuo, superato: superato,
      dist:c.dist, ang:c.ang, impegno:c.impegno, taglio:c.taglio, diff:c.diff,
    });
    S.active=false; S.dx=0; S.dy=0;
  }
  return out;
};

/* =====================================================================
   IL BRACCIO DI TASTIERA. Stesso duello, stessa geometria, stessi semi:
   cambia SOLO il dito, che qui e' un tasto. La levetta resta spenta
   (S.active=false), quindi il comando passa interamente per Keys/KMAP.

   LA VIRATA E' QUELLA DI TUTTI I GIORNI: si tiene D per trenta
   fotogrammi, si MOLLA, passano `buco` fotogrammi a comando nullo — che
   e' quello che succede a chiunque muova le dita, e il critico l'ha
   misurato a 0, 1, 2, 5 e 10 — e si preme il tasto nuovo. Nessuno ha
   chiesto una finta: e' una virata.

   E POI SI RADDRIZZA SENZA BUCHI, come farebbe una mano vera: si AGGIUNGE
   D al tasto della virata (diagonale piena, comando mai nullo) e poi si
   molla il tasto della virata. Se il raddrizzamento passasse per un altro
   buco, il banco misurerebbe due virate invece di una e non si saprebbe
   quale ha acceso cosa.
   ===================================================================== */
const BANCO_KB = (cfg) => {
  let nCasoIbrido = 0;
  const T = window.__test;
  const DT = 1/60;
  const out = [];
  const KM = KMAP[0];
  const giu = k => { Keys[k] = true; };
  const su  = k => { delete Keys[k]; };
  for(const c of cfg){
    for(const k of [KM.up, KM.dn, KM.lf, KM.rt, KM.sprint]) su(k);
    window.__caso.semina(c.seme);
    T.startMatch(1, c.diff);
    T.simulate(1.2);
    if(T.state!=='play' && T.state!=='kickoff'){ out.push({salta:T.state}); continue; }

    const P = G.players;
    let mio=-1, suo=-1, mioCasa=-1, suoCasa=-1;
    for(let i=0;i<P.length;i++){
      const p=P[i];
      if(p.role==='gk'){ continue; }
      if(p.team===0 && mio<0){ mio=i; continue; }
      if(p.team===1 && suo<0){ suo=i; continue; }
      if(p.team===0 && mioCasa<0){ mioCasa=i; continue; }
      if(p.team===1 && suoCasa<0){ suoCasa=i; continue; }
      p.out=99; p.x=-200; p.y=-200; p.vx=0; p.vy=0;
    }
    const A=P[mio], D=P[suo];
    for(const [k,gx] of [[mioCasa,70],[suoCasa,FW-70]]){
      if(k<0) continue;
      const q=P[k];
      q.out=0; q.x=gx; q.y=FH/2; q.vx=0; q.vy=0; q.ax=0; q.ay=0;
      q.slide=-1; q.recover=0; q.kickCd=0; q.charge=-1;
    }
    G.ctrl[0]=mio; G.cpu[0]=false; G.cpu[1]=true; G.swTimer[0]=0; G.swLock[0]=0;

    A.x=FW*0.42; A.y=FH/2; A.vx=P_SPEED; A.vy=0; A.ax=0; A.ay=0;
    A.fx=1; A.fy=0; A.out=0; A.slide=-1; A.recover=0; A.kickCd=0; A.charge=-1;
    A.fiato=100;
    const b=G.ball;
    b.owner=mio; b.passTo=-1; b.crossTo=-1; b.x=A.x+16; b.y=A.y; b.z=0;
    b.vx=0; b.vy=0; b.vz=0; b.curve=0; b.perfectT=0;

    /* IL DITO E' PARCHEGGIATO NELLA BANDA MORTA — IL CASO IBRIDO.
       La levetta e' VIVA (si accende a SOGLIA_LEVETTA = 6 px) ma humanMove
       restituisce ancora i TASTI (li sovrascrive solo sopra STICK_DEAD =
       12 px). Il dito non si muove piu': tutta la virata la comanda la
       tastiera. */
    Touch5.azzera(); Touch5.pend={};
    const S=Touch5.stick[0];
    S.active=false; S.id=-1; S.dx=0; S.dy=0; S.hist=[]; S.riadotta=null;
    const TID = 900 + (nCasoIbrido++);
    Touch5.start(TID, 120, 300);
    Touch5.move(TID, 128, 300);

    if(G.brain[0]) G.brain[0].ruoloT=-1;
    if(G.brain[1]) G.brain[1].ruoloT=-1;

    /* trenta fotogrammi col tasto DESTRA giu': si corre verso la porta */
    giu(KM.rt);
    for(let f=0;f<30;f++) T.simulate(DT);

    const ra = c.ang*Math.PI/180;
    D.x = A.x + Math.cos(ra)*c.dist;
    D.y = A.y + Math.sin(ra)*c.dist;
    D.out=0; D.slide=-1; D.recover=0; D.kickCd=0; D.charge=-1;
    {
      const dx=A.x-D.x, dy=A.y-D.y, dl=Math.max(1,Math.sqrt(dx*dx+dy*dy));
      D.vx=dx/dl*c.impegno; D.vy=dy/dl*c.impegno;
      D.ax=0; D.ay=0; D.fx=dx/dl; D.fy=dy/dl;
    }

    const d0 = Math.hypot(A.x-D.x, A.y-D.y);
    const bx0 = b.x;
    const ax0 = A.x;
    const own0 = b.owner;

    /* LA VIRATA: si molla, passa il buco, si preme il tasto nuovo. */
    su(KM.rt);
    for(let f=0;f<c.buco;f++) T.simulate(DT);
    const kNuovo = (c.tasto==='su') ? KM.up : KM.dn;
    giu(kNuovo);
    /* IL CANCELLO SI LEGGE SUI TRE FOTOGRAMMI DOPO IL TASTO NUOVO, non
       su uno solo: lo strappo scatta nel primo, ma il distacco lo si
       vede comunque anche se un domani lo si spostasse di un passo. */
    let staccato=0, acceso=0;
    for(let f=0;f<3;f++){
      T.simulate(DT);
      if(G.ball.owner<0 && own0>=0) staccato=1;
      if(A.strappoCd>0) acceso=1;
    }

    /* dodici fotogrammi nella direzione nuova (quindici in tutto col
       gruppo di sopra, come il braccio di levetta), poi si raddrizza
       AGGIUNGENDO destra e mollando il tasto della virata: nessun
       fotogramma a comando nullo, quindi nessuna seconda virata. */
    for(let f=0;f<12;f++) T.simulate(DT);
    giu(KM.rt);
    T.simulate(DT); T.simulate(DT);
    su(kNuovo);
    for(let f=0;f<73;f++) T.simulate(DT);

    const bb=G.ball;
    let esito='libero';
    if(bb.owner>=0) esito = (P[bb.owner].team===0) ? 'mio' : 'loro';
    const dMio=Math.hypot(A.x-bb.x, A.y-bb.y), dSuo=Math.hypot(D.x-bb.x, D.y-bb.y);
    const vic = dMio<=dSuo ? 0 : 1;
    const mioOra = (bb.owner>=0 ? P[bb.owner].team===0 : vic===0);
    const superato = (mioOra && D.x < A.x-P_R && A.x > ax0) ? 1 : 0;
    const d1 = Math.hypot(A.x-D.x, A.y-D.y);
    out.push({
      esito: esito,
      staccato: staccato,
      acceso: acceso,
      stacco: d1-d0,
      avanti: bb.x-bx0,
      ctrl: (G.ctrl[0]===mio) ? 0 : 1,
      vicino: vic, dMio: dMio, dSuo: dSuo, superato: superato,
      dist:c.dist, ang:c.ang, impegno:c.impegno, buco:c.buco, tasto:c.tasto, diff:c.diff,
    });
    for(const k of [KM.up, KM.dn, KM.lf, KM.rt, KM.sprint]) su(k);
    Touch5.end(TID);
  }
  return out;
};

/* il costo: quanti millisecondi costa un fotogramma di duello, misurato
   sullo STESSO stato ripetuto molte volte. Non e' il costo del gioco
   intero (quello lo misura prestazione.js): e' il delta che questa cura
   aggiunge al ciclo del pollice. */
const COSTO = (n) => {
  const T = window.__test;
  const DT = 1/60;
  window.__caso.semina(20260827);
  T.startMatch(1, 1);
  T.simulate(1.2);
  const S=Touch5.stick[0];
  S.active=true; S.id=1; S.ox=100; S.oy=300; S.dx=50; S.dy=0; S.hist=[];
  /* riscaldamento */
  for(let i=0;i<600;i++){ T.setTimeLeft(9999); T.simulate(DT); }
  const prove=[];
  for(let k=0;k<5;k++){
    /* IL CRONOMETRO SI RIARMA A OGNI FINESTRA, e senza questa riga la
       misura era una bugia: 3000 passi sono 50 secondi di gioco, la
       partita ne dura 90, e dalla terza finestra in poi la scena era
       'end' — simulate() usciva alla prima riga e il banco leggeva
       0,0009 ms per passo, cioe' il costo di NON simulare. Si vedeva
       nelle cinque finestre stampate: 0,0009 0,0012 0,0573 0,1640
       0,1751, tre ordini di grandezza di forbice. */
    const t0=performance.now();
    for(let i=0;i<n;i++){
      /* la levetta gira come un pollice vero: cosi' il ramo dello
         strappo viene attraversato, non saltato */
      const a=i*0.11;
      S.dx=Math.cos(a)*50; S.dy=Math.sin(a)*50;
      T.setTimeLeft(9999);
      T.simulate(DT);
    }
    prove.push((performance.now()-t0)/n);
  }
  prove.sort((a,b)=>a-b);
  return { msPerPasso: prove[2], tutte: prove, n:n };
};
/* eslint-enable no-undef */

/* --------------------------------------------------------------- misura */
async function passata(browser, porta, etichetta) {
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push('ECCEZIONE: ' + e.message));
  await pag.addInitScript(seme => {
    let s = seme >>> 0 || 1;
    const prossimo = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => prossimo() / 4294967296;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = prossimo(); return a; };
    }
    window.__caso = { semina(n) { s = n >>> 0 || 1; } };
  }, 20260827);
  await pag.goto(`http://127.0.0.1:${porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });

  if (haFlag('costo')) {
    const c = await pag.evaluate(COSTO, 3000);
    await ctx.close();
    return { costo: c, errori };
  }

  if (haFlag('tastiera')) {
    /* LA GRIGLIA DI TASTIERA: 5 distanze x 6 angoli x 3 impegni x 2 tasti
       x 3 difficolta' = 540 virate, tutte col buco di DUE fotogrammi che
       e' la virata normale. Piu' un ventaglio di buchi (0,1,2,5,10) a 56
       unita' — la distanza a cui il difetto vecchio dava il 100% — per
       controllare che non ci sia una via d'uscita a un buco diverso. */
    const casiK = [];
    let nk = 0;
    for (const dist of GRIGLIA_KB.dist)
      for (const ang of GRIGLIA_KB.ang)
        for (const impegno of GRIGLIA_KB.impegno)
          for (const tasto of GRIGLIA_KB.tasto)
            for (const diff of GRIGLIA_KB.diff)
              casiK.push({ dist, ang, impegno, tasto, diff, buco: 2, seme: (20260827 + (nk++)) >>> 0 });
    const casiB = [];
    let nb = 0;
    for (const buco of [0, 1, 2, 5, 10])
      for (const tasto of ['su', 'giu'])
        for (const diff of [0, 1, 2])
          casiB.push({ dist: 56, ang: 0, impegno: 168, tasto, diff, buco, seme: (20260901 + (nb++)) >>> 0 });

    const risK = [];
    for (let i = 0; i < casiK.length; i += 30) {
      const r = await pag.evaluate(BANCO_KB, casiK.slice(i, i + 30));
      for (const x of r) risK.push(x);
      if ((i / 30) % 5 === 0) console.log(`  --    ${etichetta}: ${Math.min(i + 30, casiK.length)}/${casiK.length} virate di tastiera`);
    }
    const risB = await pag.evaluate(BANCO_KB, casiB);
    await ctx.close();
    return { tastiera: risK, buchi: risB, errori };
  }

  /* la griglia, a blocchi: un evaluate solo per tutti gli 810 duelli
     terrebbe la pagina occupata troppo a lungo */
  const casi = [];
  let n = 0;
  for (const dist of GRIGLIA.dist)
    for (const ang of GRIGLIA.ang)
      for (const impegno of GRIGLIA.impegno)
        for (const taglio of GRIGLIA.taglio)
          for (const diff of GRIGLIA.diff)
            casi.push({ dist, ang, impegno, taglio, diff, seme: (20260827 + (n++)) >>> 0 });

  const ris = [];
  const BLOCCO = 30;
  for (let i = 0; i < casi.length; i += BLOCCO) {
    const r = await pag.evaluate(BANCO, casi.slice(i, i + BLOCCO));
    for (const x of r) ris.push(x);
    if ((i / BLOCCO) % 5 === 0) console.log(`  --    ${etichetta}: ${Math.min(i + BLOCCO, casi.length)}/${casi.length} duelli`);
  }
  await ctx.close();
  return { duelli: ris, errori };
}

function pct(a, f) { return a.length ? (a.filter(f).length / a.length * 100) : 0; }
function med(a) { if (!a.length) return 0; const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1]; }
/* IL PUNTEGGIO UNICO, e serve perche' «mio 64% loro 10% libero 26%» non
   si confronta a occhio con «mio 61% loro 14% libero 25%»: il pallone
   libero va a chi ci sta arrivando. Un duello vale 1 se il pallone e'
   mio o sto arrivando io, 0 se e' loro o stanno arrivando loro. */
function tenuta(a) {
  if (!a.length) return 0;
  const b = a.filter(x => x.esito === 'mio' || (x.esito === 'libero' && x.vicino === 0));
  return b.length / a.length * 100;
}

function stampa(nome, d) {
  const buoni = d.filter(x => !x.salta);
  console.log(`\n  ${nome} — ${buoni.length} duelli`);
  console.log(`    pallone ancora MIO           ${pct(buoni, x => x.esito === 'mio').toFixed(1)}%`);
  console.log(`    pallone LORO                 ${pct(buoni, x => x.esito === 'loro').toFixed(1)}%`);
  console.log(`    pallone LIBERO               ${pct(buoni, x => x.esito === 'libero').toFixed(1)}%  (di cui ci arrivo io ${pct(buoni.filter(x => x.esito === 'libero'), x => x.vicino === 0).toFixed(0)}%)`);
  console.log(`    TENUTA (mio + libero mio)    ${tenuta(buoni).toFixed(1)}%`);
  console.log(`    UOMO SUPERATO (palla+dietro) ${pct(buoni, x => x.superato === 1).toFixed(1)}%`);
  console.log(`    pallone DISTACCATO dal piede ${pct(buoni, x => x.staccato === 1).toFixed(1)}%`);
  console.log(`    stacco dal difensore (med)   ${med(buoni.map(x => x.stacco)).toFixed(1)} unita'`);
  console.log(`    avanzamento palla (med)      ${med(buoni.map(x => x.avanti)).toFixed(1)} unita'`);
  console.log(`    comando rubato a un compagno ${pct(buoni, x => x.ctrl === 1).toFixed(1)}%`);
  /* le due tabelle che dicono DOVE la finta rende e dove no */
  console.log('    per distanza del difensore allo strappo:');
  for (const dd of GRIGLIA.dist) {
    const s = buoni.filter(x => x.dist === dd);
    console.log(`      ${String(dd).padStart(3)} u   superato ${pct(s, x => x.superato === 1).toFixed(0).padStart(3)}%   tenuta ${tenuta(s).toFixed(0).padStart(3)}%   loro ${pct(s, x => x.esito === 'loro').toFixed(0).padStart(3)}%   stacco ${med(s.map(x => x.stacco)).toFixed(1).padStart(6)}`);
  }
  console.log("    per impegno del difensore (u/s con cui ti punta):");
  for (const im of GRIGLIA.impegno) {
    const s = buoni.filter(x => x.impegno === im);
    console.log(`      ${String(im).padStart(3)}     superato ${pct(s, x => x.superato === 1).toFixed(0).padStart(3)}%   tenuta ${tenuta(s).toFixed(0).padStart(3)}%   loro ${pct(s, x => x.esito === 'loro').toFixed(0).padStart(3)}%   stacco ${med(s.map(x => x.stacco)).toFixed(1).padStart(6)}`);
  }
  console.log('    per taglio dello strappo:');
  for (const tg of GRIGLIA.taglio) {
    const s = buoni.filter(x => x.taglio === tg);
    const nome2 = Math.abs(tg) > 150 ? 'suola ' : 'scarto';
    console.log(`      ${String(tg).padStart(4)} ${nome2}  superato ${pct(s, x => x.superato === 1).toFixed(0).padStart(3)}%   tenuta ${tenuta(s).toFixed(0).padStart(3)}%   loro ${pct(s, x => x.esito === 'loro').toFixed(0).padStart(3)}%   stacco ${med(s.map(x => x.stacco)).toFixed(1).padStart(6)}`);
  }
  console.log('    per difficolta\':');
  for (const df of GRIGLIA.diff) {
    const s = buoni.filter(x => x.diff === df);
    console.log(`      ${['Facile ', 'Normale', 'Duro   '][df]}  superato ${pct(s, x => x.superato === 1).toFixed(0).padStart(3)}%   tenuta ${tenuta(s).toFixed(0).padStart(3)}%   loro ${pct(s, x => x.esito === 'loro').toFixed(0).padStart(3)}%   stacco ${med(s.map(x => x.stacco)).toFixed(1).padStart(6)}`);
  }
}

/* LA STAMPA DEL BRACCIO DI TASTIERA. Due colonne sole contano, e sono
   CANCELLI e non indicatori: «pallone distaccato dal piede» e «strappo
   acceso» devono valere 0,0% — nessuno ha chiesto una finta. Il resto e'
   contesto, e serve a dire che la virata di tastiera continua a essere
   la stessa virata di prima e non e' peggiorata di nascosto. */
function stampaKB(nome, d, buchi) {
  const buoni = d.filter(x => !x.salta);
  console.log(`\n  ${nome} — ${buoni.length} VIRATE DI TASTIERA (nessuna finta chiesta)`);
  console.log(`    >> pallone DISTACCATO dal piede  ${pct(buoni, x => x.staccato === 1).toFixed(1)}%   (cancello: 0,0%)`);
  console.log(`    >> STRAPPO ACCESO (strappoCd>0)  ${pct(buoni, x => x.acceso === 1).toFixed(1)}%   (cancello: 0,0%)`);
  console.log(`    pallone ancora MIO           ${pct(buoni, x => x.esito === 'mio').toFixed(1)}%`);
  console.log(`    pallone LORO                 ${pct(buoni, x => x.esito === 'loro').toFixed(1)}%`);
  console.log(`    TENUTA (mio + libero mio)    ${tenuta(buoni).toFixed(1)}%`);
  console.log(`    UOMO SUPERATO (palla+dietro) ${pct(buoni, x => x.superato === 1).toFixed(1)}%`);
  console.log('    distaccato per distanza del difensore:');
  for (const dd of GRIGLIA_KB.dist) {
    const s = buoni.filter(x => x.dist === dd);
    console.log(`      ${String(dd).padStart(3)} u   distaccato ${pct(s, x => x.staccato === 1).toFixed(1).padStart(5)}%   acceso ${pct(s, x => x.acceso === 1).toFixed(1).padStart(5)}%   tenuta ${tenuta(s).toFixed(0).padStart(3)}%`);
  }
  if (buchi && buchi.length) {
    const bb = buchi.filter(x => !x.salta);
    console.log('    ventaglio dei BUCHI fra i due tasti (a 56 u, impegno 168):');
    for (const bu of [0, 1, 2, 5, 10]) {
      const s = bb.filter(x => x.buco === bu);
      if (!s.length) continue;
      console.log(`      ${String(bu).padStart(2)} fotogrammi   distaccato ${pct(s, x => x.staccato === 1).toFixed(1).padStart(5)}%   acceso ${pct(s, x => x.acceso === 1).toFixed(1).padStart(5)}%   (${s.length} prove)`);
    }
  }
}

(async () => {
  const prova = arg('gioco', process.env.GIOCO_PROVA || '');
  const provaAbs = prova ? path.resolve(RADICE, prova) : '';
  if (provaAbs && !fs.existsSync(provaAbs)) { console.error('FALLITO: non esiste ' + provaAbs); process.exit(1); }
  const etichetta = arg('etichetta', provaAbs ? 'DOPO' : 'PRIMA');
  const srv = await servi(provaAbs);
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  try {
    console.log(`\n_p-strappo — ${etichetta}${provaAbs ? '  (' + path.basename(provaAbs) + ')' : '  (gioco spedito)'}`);
    const r = await passata(browser, srv.porta, etichetta);
    if (r.errori.length) { for (const e of r.errori) console.error('  !! ' + e); }
    if (r.tastiera) {
      stampaKB(etichetta, r.tastiera, r.buchi);
      const jf = arg('json', '');
      if (jf) { fs.mkdirSync(path.dirname(path.resolve(RADICE, jf)), { recursive: true }); fs.writeFileSync(path.resolve(RADICE, jf), JSON.stringify({ tastiera: r.tastiera, buchi: r.buchi })); console.log('\n  --    crudo salvato in ' + jf); }
      const cf = arg('contro', '');
      if (cf) {
        const prima = JSON.parse(fs.readFileSync(path.resolve(RADICE, cf), 'utf8'));
        stampaKB('CONTRO (' + path.basename(cf) + ')', prima.tastiera, prima.buchi);
      }
    } else if (r.costo) {
      console.log(`\n  COSTO: ${r.costo.msPerPasso.toFixed(4)} ms per passo di simulazione (mediana di 5 finestre da ${r.costo.n})`);
      console.log(`         tutte: ${r.costo.tutte.map(x => x.toFixed(4)).join('  ')}`);
    } else {
      stampa(etichetta, r.duelli);
      const jf = arg('json', '');
      if (jf) { fs.mkdirSync(path.dirname(path.resolve(RADICE, jf)), { recursive: true }); fs.writeFileSync(path.resolve(RADICE, jf), JSON.stringify(r.duelli)); console.log('\n  --    crudo salvato in ' + jf); }
      const cf = arg('contro', '');
      if (cf) {
        const prima = JSON.parse(fs.readFileSync(path.resolve(RADICE, cf), 'utf8'));
        stampa('CONTRO (' + path.basename(cf) + ')', prima);
      }
    }
  } finally {
    await browser.close(); srv.chiudi();
  }
})();
