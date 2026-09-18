/* =====================================================================
   _q-regole.js -- LE REGOLE A LEVA CORTA (voce #107, compito 1).

   IL PERCHE'. Il cantiere #107 porta a codice quattro cure piccole con
   le leve gia' in casa (mandato, _analisi/MAPPA-MANDATO.md area 1; lo
   spec docs/superpowers/specs/2026-09-18-regole-leva-corta-design.md).
   Questo file e' il banco NUOVO che le mette alla prova, sul telaio di
   strumenti/_q-battute.js (voce #87): server locale, seme fisso da
   _posa.js, flag --gioco/--taglia/--seme. Come li', un banco che
   nascesse verde su tutto non avrebbe misurato niente: qui la condanna
   e' il prodotto del compito 1, non un incidente.

   SEI PROVE (nomi vincolanti del piano; le prove 4 e 5 nascono nel
   compito 2, voce #107 -- RETRO-TESTA e RETRO-AVVERSARIO):

     1. RIGORE-DENTRO -- fallo da scivolata DENTRO l'area vera
        (VERNICE.areaProf/areaSemi, letta da t.proporzioni(), la stessa
        tavola che dentroArea() gia' usa altrove nel file -- ramo #86):
        deve aprire il duello (G.scene diventa 'freekick', via
        startFreeKick). E' verde ANCHE sul gioco di oggi -- a x=60 dalla
        porta e y sul centro campo, sia la vecchia fascia
        (zonaCalda=|goalX-p.x|<260) sia l'area vera dicono "dentro":
        e' il CONTROLLO DISCRIMINANTE, non la condanna.
     2. RIGORE-FUORI -- LA CONDANNA. Fallo alla STESSA x=60 (dentro la
        fascia 260 e dentro la profondita' dell'area vera a ogni
        taglia: 173/268/361) ma a y FUORI dalla semilarghezza dell'area
        (areaSemi: 216/288/441 a 5/7/11) -- una divergenza PURA a ogni
        taglia, perche' zonaCalda guarda solo la x mentre l'area vera
        guarda anche la y. Sul gioco di oggi il fallo apre comunque il
        duello (la fascia non vede la y): rossa per costruzione. Dopo
        la cura deve dare punizione rapida (G.scene resta 'play').
     3. RETRO-PRESA -- un compagno passa al portiere COL PIEDE
        (kickBall, l'imbuto vero di ogni calcio -- CALCETTO-il-gioco.
        html ~14493): oggi tentaPresa non legge mai l'ultimo tocco, e
        la presa avviene comunque. Rossa fino al compito 2 (mandato
        SS6.5/App. D, che dara' a b un campo tipo b.tockind scritto da
        kickBall stesso).
     4. RETRO-TESTA -- un compagno CROSSA/RILANCIA DI TESTA verso il
        portiere (colpoDiTesta, CALCETTO-il-gioco.html ~18218): la presa
        con le mani resta lecita, perche' non e' un calcio di piede.
        CONTROLLO DISCRIMINANTE: verde ANCHE sul gioco di oggi (che
        prende tutto senza guardare l'ultimo tocco) e verde dopo la cura
        del compito 2 (che nega solo sul piede di un compagno, mai sulla
        testa) -- prova che la negazione non sia diventata troppo larga.
     5. RETRO-AVVERSARIO -- un AVVERSARIO tocca/passa col piede verso il
        portiere: la presa resta lecita, perche' la regola vale solo sui
        compagni. CONTROLLO DISCRIMINANTE, verde prima e dopo la cura --
        prova che la negazione guardi la SQUADRA dell'ultimo tocco, non
        solo se e' stato un piede.
     6. VANTAGGIO-FISCHIA-SEMPRE -- fallo mentre l'azione dell'attacco
        prosegue (la vittima avanza col pallone): oggi punizioneRapida
        azzera SEMPRE la velocita' del pallone
        (CALCETTO-il-gioco.html, punizioneRapida: "b.vx=0;b.vy=0;
        b.vz=0;", nessuna eccezione) e la stringa 'VANTAGGIO' non esiste
        nel file (grep fatto prima di scrivere questa prova: zero
        occorrenze come banner di gioco). Rossa fino al compito 3.

   RETTIFICA (voce #107, correzione di revisione compito 2, 18 settembre
   2026): il rilievo del revisore ha misurato un caso di mezzo che
   RETRO-PRESA non isolava mai -- un retropassaggio a velocita' 40, quasi
   fermo, che si ferma a distanza P_R+B_R dal portiere per una cinquantina
   di fotogrammi prima che un compagno qualunque lo raggiunga e il gioco
   torni vivo. IL FILE GUADAGNA LA SETTIMA PROVA, il controllo dedicato:
     7. RETRO-FERMO -- CONTROLLO DISCRIMINANTE, nasce verde: non esercita
        codice nuovo, misura il caso di mezzo con tre condanne che
        RETRO-PRESA non copriva -- il portiere non deve mai prendere con
        le mani, il pallone non deve mai attraversarlo (distanza mai
        sotto P_R+B_R, con tolleranza, mentre il regime di negazione e'
        attivo) e il pallone deve tornare vivo entro 5 s, cosi' un fermo
        che non si scioglie mai non passerebbe per una regola sana.
   Il file e' adesso a sette prove.

   ZERO dado() NUOVI. Le scene si scrivono direttamente sullo stato del
   gioco (G.players/G.ball, la stessa tecnica di _q-battute.js) e il
   fallo da scivolata si ottiene con un'entrata DA DIETRO: la vittima
   guarda verso la propria porta d'attacco (carrier.fx=-1,fy=0) e
   l'entrata arriva nella STESSA direzione (slideDX=-1,slideDY=0) --
   checkSlideContact (CALCETTO-il-gioco.html ~18108) manda sempre al
   ramo del fallo quando "daDietro" e' vero
   (p.slideDX*carrier.fx+p.slideDY*carrier.fy > DIETRO_DOT), qualunque
   sia il sorteggio del tackle: non serve pescare dado() per garantire
   il fallo, basta la geometria.

   uso:  node strumenti/_q-regole.js
         node strumenti/_q-regole.js --gioco fuori/r1-base.html
         node strumenti/_q-regole.js --taglia 7 --seme 123
   esce 0 se tutte le prove sono verdi, 1 se almeno una e' rossa,
   2 se il banco stesso e' esploso (pagina, hook mancante, eccezione).
   Il 3 resta riservato (convenzione di _q-battute.js/_q-replay.js) e
   non e' usato da nessuna delle sette prove di oggi.
   ===================================================================== */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { semeFisso } = require('./_posa.js');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};

const SEME_CANTIERE = 20260918;   // il seme dichiarato della voce #107, default del flag --seme
const TAGLIA_BANCO = +arg('taglia', 5);   // taglia delle scene
const SEME = +arg('seme', SEME_CANTIERE);

function servi(prova) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (prova && /CALCETTO-il-gioco\.html$/i.test(f)) f = prova;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

const esiti = [];
const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '\n         ' + det : '')); };

/* =====================================================================
   LE SCENE, INIETTATE UNA VOLTA SOLA NELLA PAGINA (window.SCENA_*),
   perche' leggono G/checkSlideContact/kickBall per riferimento bare --
   vivono lato browser, come SCENA_FASCIA/SCENA_FONDO in _q-battute.js.

   SCENA_FALLO(modo): costruisce un fallo da scivolata garantito (entrata
   da dietro, zero dado()) a una x fissa (60 unita' dalla porta che la
   vittima attacca), con la y decisa dal modo:
     'dentro'  -- y sul centro campo: dentro l'area vera E dentro la
                  vecchia fascia a ogni taglia (controllo discriminante).
     'fuori'   -- y a 30 unita' oltre la semilarghezza dell'area vera:
                  ancora dentro la vecchia fascia (x=60<260) ma fuori
                  dall'area vera -- la divergenza pura del compito 1.
     'lontano' -- x al 70% del campo: fuori da fascia E area di
                  ENTRAMBE le porte, per la prova del vantaggio (che non
                  deve dipendere dalla cura del rigore).
   La vittima e' un giocatore di movimento della squadra 1 (attacca la
   porta a x=0); l'autore del fallo e' un giocatore di movimento della
   squadra 0 (difende quella porta). G.stats.falli si azzera qui: il
   cumulo falli (dal terzo in su si tira comunque, MANUALE SS6) non deve
   inquinare una misura che vuole isolare la sola decisione dell'area.
   ===================================================================== */
function INIETTA_SCENE() {
  window.SCENA_FALLO = function (modo) {
    const t = window.__test;
    const prop = t.proporzioni();
    const V = prop.VERNICE;
    let x, y;
    if (modo === 'lontano') { x = prop.FW * 0.7; y = prop.FH / 2; }
    else {
      x = 60;
      y = modo === 'dentro' ? prop.FH / 2 : (prop.FH / 2 - V.areaSemi - 30);
    }
    const vittima = t.players.find(p => p.team === 1 && p.role !== 'gk');
    const tackler = t.players.find(p => p.team === 0 && p.role !== 'gk');
    if (!vittima || !tackler) return { errore: 'giocatori non trovati (team 1/team 0 di movimento)' };
    const vi = t.players.indexOf(vittima), ti = t.players.indexOf(tackler);
    Object.assign(vittima, {
      x, y, fx: -1, fy: 0, vx: 0, vy: 0,
      slide: -1, recover: 0, rove: -1, charge: -1, out: 0,
    });
    Object.assign(tackler, {
      x: x + 6, y, fx: 1, fy: 0, vx: 0, vy: 0,
      slide: 0, slideDX: -1, slideDY: 0, recover: 0, rove: -1, charge: -1, out: 0, kickCd: 0,
    });
    Object.assign(t.ball, { owner: vi, x, y, z: 0, vx: 0, vy: 0, vz: 0 });
    G.stats.falli = [0, 0];
    return {
      ok: true, vittimaIdx: vi, tacklerIdx: ti, x, y,
      areaProf: V.areaProf, areaSemi: V.areaSemi, FH: prop.FH, FW: prop.FW,
    };
  };
  /* SCENA_RETROPASSO: un compagno del portiere gli passa la palla COL
     PIEDE, chiamando kickBall -- l'imbuto vero di ogni calcio del
     gioco, non un canale sintetico inventato per il banco. Il compagno
     nasce a 40 unita' dal portiere, sulla sua stessa fascia orizzontale
     (dy=0), e calcia a velocita' 220 (sotto sogliaPresa=330): un
     appoggio lento, la firma del retropassaggio. */
  window.SCENA_RETROPASSO = function () {
    const t = window.__test;
    const gk = t.players.find(p => p.team === 0 && p.role === 'gk');
    const compagno = t.players.find(p => p.team === 0 && p.role !== 'gk');
    if (!gk || !compagno) return { errore: 'portiere o compagno non trovati (squadra 0)' };
    const gi = t.players.indexOf(gk), ci = t.players.indexOf(compagno);
    const dir = gk.x < compagno.x ? -1 : 1;   // verso il portiere, qualunque sia il lato
    Object.assign(compagno, {
      x: gk.x - dir * 40, y: gk.y, fx: dir, fy: 0, vx: 0, vy: 0,
      slide: -1, recover: 0, rove: -1, charge: -1, out: 0, kickCd: 0,
    });
    Object.assign(t.ball, { owner: ci, x: compagno.x, y: compagno.y, z: 0, vx: 0, vy: 0, vz: 0 });
    kickBall(compagno, dir, 0, 220, 0);
    return { ok: true, gkIdx: gi, compagnoIdx: ci };
  };
  /* SCENA_RETROTESTA: un compagno del portiere colpisce di testa,
     chiamando colpoDiTesta -- il gesto vero, non un canale sintetico --
     cosi' b.lastTouch/b.toccoPiede portano la verita' del colpo (falso:
     non e' un piede). colpoDiTesta punta SEMPRE alla porta che la
     squadra ATTACCA (mai alla propria: non accetta una direzione a
     scelta come kickBall), quindi il pallone riparte lontano dal
     portiere -- lo si teletrasporta DOPO, sulla fascia del portiere e
     a velocita' lenta (220, sotto sogliaPresa), la STESSA tecnica di
     teletrasporto gia' usata da SCENA_FALLO: i due bit del tocco restano
     quelli scritti dalla funzione vera, solo la posizione si sposta. */
  window.SCENA_RETROTESTA = function () {
    const t = window.__test;
    const gk = t.players.find(p => p.team === 0 && p.role === 'gk');
    const compagno = t.players.find(p => p.team === 0 && p.role !== 'gk');
    if (!gk || !compagno) return { errore: 'portiere o compagno non trovati (squadra 0)' };
    const gi = t.players.indexOf(gk), ci = t.players.indexOf(compagno);
    Object.assign(compagno, {
      x: t.ball.x, y: t.ball.y, fx: 1, fy: 0, vx: 0, vy: 0,
      slide: -1, recover: 0, rove: -1, charge: -1, out: 0, kickCd: 0,
    });
    Object.assign(t.ball, { owner: -1, x: compagno.x, y: compagno.y, z: 30, vx: 0, vy: 0, vz: 0 });
    colpoDiTesta(compagno, ci, t.ball);   // scrive lastTouch=ci, toccoPiede=false: la verita' del gesto
    const dir = gk.x < compagno.x ? -1 : 1;
    Object.assign(t.ball, { x: gk.x - dir * 40, y: gk.y, z: 0, vx: dir * 220, vy: 0, vz: 0 });
    return { ok: true, gkIdx: gi, compagnoIdx: ci };
  };
  /* SCENA_RETROAVVERSARIO: un giocatore della squadra AVVERSARIA passa
     col piede verso il portiere -- stessa tecnica di SCENA_RETROPASSO
     (kickBall, l'imbuto vero), ma il battitore e' di squadra 1, non 0:
     lastTouch resta di piede (vero) ma di una squadra DIVERSA da quella
     del portiere, il controllo discriminante della regola. */
  window.SCENA_RETROAVVERSARIO = function () {
    const t = window.__test;
    const gk = t.players.find(p => p.team === 0 && p.role === 'gk');
    const avversario = t.players.find(p => p.team === 1 && p.role !== 'gk');
    if (!gk || !avversario) return { errore: 'portiere o avversario non trovati (squadra 1 di movimento)' };
    const gi = t.players.indexOf(gk), ai = t.players.indexOf(avversario);
    const dir = gk.x < avversario.x ? -1 : 1;
    Object.assign(avversario, {
      x: gk.x - dir * 40, y: gk.y, fx: dir, fy: 0, vx: 0, vy: 0,
      slide: -1, recover: 0, rove: -1, charge: -1, out: 0, kickCd: 0,
    });
    Object.assign(t.ball, { owner: ai, x: avversario.x, y: avversario.y, z: 0, vx: 0, vy: 0, vz: 0 });
    kickBall(avversario, dir, 0, 220, 0);
    return { ok: true, gkIdx: gi, avversarioIdx: ai };
  };
  /* SCENA_RETROFERMO (voce #107, correzione di revisione compito 2): il
     retropassaggio QUASI FERMO che il caso RETRO-PRESA non isolava mai --
     lento abbastanza da non essere ne' presa ne' rinvio, un caso di
     mezzo che il rilievo del revisore ha misurato a parte (velocita' 40,
     ben sotto sogliaPresa=330 e sotto anche il rinvio). Il compagno
     calcia DAVVERO (kickBall, l'imbuto vero: lastTouch/toccoPiede sono
     il gesto, non un canale sintetico), poi il pallone si teletrasporta
     -- STESSA TECNICA di SCENA_RETROTESTA -- a portata del portiere,
     ancora alla velocita' dichiarata: a 40 unita'/s l'attrito del campo
     spegnerebbe il pallone entro una ventina di unita' di corsa (misurato:
     lanciato da 60 unita' di distanza si ferma sotto il solo attrito a
     ~44 dal portiere, mai dentro l'ellisse di tentaPresa), e nel
     frattempo un compagno qualunque -- non il portiere -- lo
     raccoglierebbe per conto suo: la scena non arriverebbe mai a
     esercitare il ramo che nega la presa. Il teletrasporto arriva a
     P_R+B_R+9 dal portiere, sulla sua stessa fascia orizzontale: dentro
     il semiasse lungo dell'ellisse (GK_REACH+B_R), fuori dal raggio di
     riposo (P_R+B_R) -- cosi' la prova osserva davvero l'avvicinamento e
     l'arresto, non parte gia' ferma. */
  window.SCENA_RETROFERMO = function () {
    const t = window.__test;
    const gk = t.players.find(p => p.team === 0 && p.role === 'gk');
    const compagno = t.players.find(p => p.team === 0 && p.role !== 'gk');
    if (!gk || !compagno) return { errore: 'portiere o compagno non trovati (squadra 0)' };
    const gi = t.players.indexOf(gk), ci = t.players.indexOf(compagno);
    const dir = gk.x < compagno.x ? -1 : 1;
    Object.assign(compagno, {
      x: gk.x - dir * 40, y: gk.y, fx: dir, fy: 0, vx: 0, vy: 0,
      slide: -1, recover: 0, rove: -1, charge: -1, out: 0, kickCd: 0,
    });
    Object.assign(t.ball, { owner: ci, x: compagno.x, y: compagno.y, z: 0, vx: 0, vy: 0, vz: 0 });
    kickBall(compagno, dir, 0, 40, 0);
    const raggioFermo = P_R + B_R, offerta = raggioFermo + 9;
    Object.assign(t.ball, { x: gk.x - dir * offerta, y: gk.y, z: 0, vx: dir * 40, vy: 0, vz: 0 });
    return { ok: true, gkIdx: gi, compagnoIdx: ci, raggioFermo };
  };
}

/* fa scorrere n fotogrammi e torna lo stato finale -- copre il fermo del
   kickoff (1,0-1,5 s secondo la taglia, CALCETTO-il-gioco.html: step())
   PRIMA che la scena costruita in kickoff possa muoversi davvero. */
const CORRI = (n) => `
(function(){
  const t = window.__test;
  for(let i=0;i<${n};i++) t.simulate(1/60);
  return { stato: t.state };
})()`;

/* come CORRI ma traccia, fotogramma per fotogramma, se il pallone e'
   mai passato nelle mani del portiere (owner===gkIdx) -- la presa puo'
   avvenire su un fotogramma solo e poi il portiere rinvia, quindi lo
   stato FINALE non basterebbe. */
const CORRI_TRACCIA_PRESA = (n, gkIdx) => `
(function(){
  const t = window.__test;
  let presa = false, fotogramma = -1;
  for(let i=0;i<${n};i++){
    t.simulate(1/60);
    if(t.ball.owner===${gkIdx}){ presa = true; fotogramma = i; break; }
  }
  return { presa, fotogramma, statoFinale: t.state };
})()`;

/* per il vantaggio: campiona a ogni fotogramma il banner (cerca la
   stringa 'VANTAGGIO', maiuscole/minuscole) e se la velocita' del
   pallone e' mai stata azzerata di netto (la firma di punizioneRapida,
   che scrive b.vx=0;b.vy=0;b.vz=0; senza eccezioni). */
const CORRI_TRACCIA_VANTAGGIO = (n) => `
(function(){
  const t = window.__test;
  let vistoVantaggio = false, fermata = false, fotogrammaFermata = -1;
  for(let i=0;i<${n};i++){
    t.simulate(1/60);
    const ban = t.banner;
    if(ban && ban.text && String(ban.text).toUpperCase().indexOf('VANTAGGIO')>=0) vistoVantaggio = true;
    if(!fermata && t.ball.vx===0 && t.ball.vy===0){ fermata = true; fotogrammaFermata = i; }
  }
  return { vistoVantaggio, fermata, fotogrammaFermata, statoFinale: t.state };
})()`;

/* per RETRO-FERMO: traccia, fotogramma per fotogramma, TRE cose --
   (i) se la presa e' MAI avvenuta (b.owner===gkIdx, come CORRI_TRACCIA_PRESA);
   (ii) la distanza minima dal portiere MENTRE IL REGIME DI NEGAZIONE E'
   ATTIVO (pallone libero, toccoPiede vero, ultimo tocco ancora il
   compagno che ha calciato) -- fuori da quella finestra un compagno puo'
   benissimo dribblare vicino al proprio portiere senza che sia un
   attraversamento, quindi la soglia non si applica li';
   (iii) il primo fotogramma in cui il pallone torna vivo (posseduto da
   qualcuno o piu' veloce di 50), a partire dal fischio d'inizio. */
const CORRI_TRACCIA_RETROFERMO = (n, gkIdx, ciIdx) => `
(function(){
  const t = window.__test;
  let presa = false, minDistRegime = Infinity, vivo = false, vivoFotogramma = -1;
  for(let i=0;i<${n};i++){
    t.simulate(1/60);
    const b = t.ball, gk = t.players[${gkIdx}];
    const d = Math.hypot(b.x-gk.x, b.y-gk.y);
    const regimeAttivo = b.owner<0 && b.toccoPiede===true && b.lastTouch===${ciIdx};
    if(regimeAttivo && d<minDistRegime) minDistRegime=d;
    if(b.owner===${gkIdx}) presa = true;
    if(!vivo && (b.owner>=0 || Math.hypot(b.vx,b.vy)>50)){ vivo = true; vivoFotogramma = i; }
  }
  return { presa, minDistRegime, vivo, vivoFotogramma };
})()`;

const FOTOGRAMMI_ATTESA = 200;   // 3,33 s: copre il kickoff piu' lungo (1,5 s a 7/11) con largo margine

(async () => {
  const provaRel = arg('gioco', '');
  const provaAbs = provaRel ? path.resolve(RADICE, provaRel) : '';
  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(semeFisso, SEME);
  const ecc = []; pag.on('pageerror', e => ecc.push(e.message));
  console.log('\n=== LE REGOLE A LEVA CORTA ===  ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)') + '  -- taglia ' + TAGLIA_BANCO + ', seme ' + SEME);

  try {
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(() => {
      const t = window.__test;
      t.dismissSplash && t.dismissSplash();
      if (t.save) t.save.tutorialDone = 1;
    });
    await pag.evaluate(INIETTA_SCENE);

    const nuovaScenaFallo = (modo) => pag.evaluate(({ seme, taglia, modo }) => {
      const t = window.__test;
      t.semina(seme);
      t.setCpuVsCpu(true);
      t.startMatch(1, 1, { size: taglia });
      return SCENA_FALLO(modo);
    }, { seme: SEME, taglia: TAGLIA_BANCO, modo }).catch(e => ({ errore: e.message }));

    /* ===================================================================
       PROVA 1 -- RIGORE-DENTRO. Controllo discriminante: fallo a x=60,
       y=centro campo. Dentro l'area vera E dentro la vecchia fascia a
       ogni taglia: deve aprire il duello sia oggi sia dopo la cura. */
    {
      const scena = await nuovaScenaFallo('dentro');
      if (scena.errore) { di(false, '1. RIGORE-DENTRO', 'BANCO: scena non costruita -- ' + scena.errore); }
      else {
        const r = await pag.evaluate(CORRI(FOTOGRAMMI_ATTESA));
        const ok = r.stato === 'freekick';
        di(ok, '1. RIGORE-DENTRO -- fallo a x=' + scena.x + ',y=' + scena.y + ' (centro campo): parte il duello (CONTROLLO DISCRIMINANTE, verde anche pre-cura)',
          'stato dopo il fallo: ' + r.stato + ' (atteso freekick) -- areaProf=' + scena.areaProf + ', areaSemi=' + scena.areaSemi + ', FH=' + scena.FH);
      }
    }

    /* ===================================================================
       PROVA 2 -- RIGORE-FUORI. LA CONDANNA. Fallo alla stessa x=60 ma a
       y = FH/2 - areaSemi - 30: fuori dall'area vera, ancora dentro la
       vecchia fascia (x=60<260). Sul gioco di oggi la fascia (solo-x)
       non vede la y e apre comunque il duello: rossa per costruzione.
       Dopo la cura deve dare punizione rapida (scena resta 'play'). */
    {
      const scena = await nuovaScenaFallo('fuori');
      if (scena.errore) { di(false, '2. RIGORE-FUORI', 'BANCO: scena non costruita -- ' + scena.errore); }
      else {
        const r = await pag.evaluate(CORRI(FOTOGRAMMI_ATTESA));
        const ok = r.stato === 'play';
        const confineY = scena.FH / 2 - scena.areaSemi;
        di(ok, '2. RIGORE-FUORI -- fallo a x=' + scena.x + ',y=' + scena.y + ' (fuori area, dentro fascia 260): punizione rapida, niente duello',
          'stato dopo il fallo: ' + r.stato + ' (atteso play, NON freekick) -- confine y dell\'area: ' + confineY +
          ' (y del fallo sta ' + (confineY - scena.y) + ' unita\' oltre) -- x=' + scena.x + ' e\' dentro sia la fascia (260) sia la profondita\' dell\'area (' + scena.areaProf + ')');
      }
    }

    /* ===================================================================
       PROVA 3 -- RETRO-PRESA. Un compagno del portiere gli passa la
       palla col piede (kickBall, l'imbuto vero). Oggi tentaPresa non
       legge mai l'ultimo tocco: la presa avviene. Rossa fino al
       compito 2 (mandato SS6.5/App. D). */
    {
      const scena = await pag.evaluate(({ seme, taglia }) => {
        const t = window.__test;
        t.semina(seme);
        t.setCpuVsCpu(true);
        t.startMatch(1, 1, { size: taglia });
        return SCENA_RETROPASSO();
      }, { seme: SEME, taglia: TAGLIA_BANCO }).catch(e => ({ errore: e.message }));
      if (scena.errore) { di(false, '3. RETRO-PRESA', 'BANCO: scena non costruita -- ' + scena.errore); }
      else {
        const r = await pag.evaluate(CORRI_TRACCIA_PRESA(FOTOGRAMMI_ATTESA, scena.gkIdx));
        const ok = !r.presa;
        di(ok, '3. RETRO-PRESA -- compagno passa col piede al portiere: la presa con le mani NON deve avvenire',
          r.presa ? ('presa avvenuta al fotogramma ' + r.fotogramma + ' (oggi tentaPresa non guarda l\'ultimo tocco)')
                  : ('mai presa in ' + FOTOGRAMMI_ATTESA + ' fotogrammi'));
      }
    }

    /* ===================================================================
       PROVA 4 -- RETRO-TESTA. Un compagno del portiere colpisce di
       testa (colpoDiTesta): toccoPiede resta falso, quindi la presa con
       le mani DEVE restare lecita. CONTROLLO DISCRIMINANTE: verde sia
       oggi (che prende tutto) sia dopo la cura (che nega solo il piede
       di un compagno, mai la testa). */
    {
      const scena = await pag.evaluate(({ seme, taglia }) => {
        const t = window.__test;
        t.semina(seme);
        t.setCpuVsCpu(true);
        t.startMatch(1, 1, { size: taglia });
        return SCENA_RETROTESTA();
      }, { seme: SEME, taglia: TAGLIA_BANCO }).catch(e => ({ errore: e.message }));
      if (scena.errore) { di(false, '4. RETRO-TESTA', 'BANCO: scena non costruita -- ' + scena.errore); }
      else {
        const r = await pag.evaluate(CORRI_TRACCIA_PRESA(FOTOGRAMMI_ATTESA, scena.gkIdx));
        const ok = r.presa;
        di(ok, '4. RETRO-TESTA -- compagno colpisce di testa verso il portiere: la presa con le mani resta lecita (CONTROLLO DISCRIMINANTE)',
          r.presa ? ('presa avvenuta al fotogramma ' + r.fotogramma)
                  : ('mai presa in ' + FOTOGRAMMI_ATTESA + ' fotogrammi -- la negazione ha morso anche sulla testa: troppo larga'));
      }
    }

    /* ===================================================================
       PROVA 5 -- RETRO-AVVERSARIO. Un avversario passa col piede verso
       il portiere: toccoPiede e' vero ma la squadra dell'ultimo tocco e'
       diversa da quella del portiere, quindi la presa resta lecita.
       CONTROLLO DISCRIMINANTE, verde prima e dopo la cura. */
    {
      const scena = await pag.evaluate(({ seme, taglia }) => {
        const t = window.__test;
        t.semina(seme);
        t.setCpuVsCpu(true);
        t.startMatch(1, 1, { size: taglia });
        return SCENA_RETROAVVERSARIO();
      }, { seme: SEME, taglia: TAGLIA_BANCO }).catch(e => ({ errore: e.message }));
      if (scena.errore) { di(false, '5. RETRO-AVVERSARIO', 'BANCO: scena non costruita -- ' + scena.errore); }
      else {
        const r = await pag.evaluate(CORRI_TRACCIA_PRESA(FOTOGRAMMI_ATTESA, scena.gkIdx));
        const ok = r.presa;
        di(ok, '5. RETRO-AVVERSARIO -- avversario passa col piede verso il portiere: la presa resta lecita (CONTROLLO DISCRIMINANTE)',
          r.presa ? ('presa avvenuta al fotogramma ' + r.fotogramma)
                  : ('mai presa in ' + FOTOGRAMMI_ATTESA + ' fotogrammi -- la negazione ha morso anche sull\'avversario: guarda solo il piede, non la squadra'));
      }
    }

    /* ===================================================================
       PROVA 6 -- VANTAGGIO-FISCHIA-SEMPRE. Fallo lontano da ogni area/
       fascia (niente duello, solo punizione rapida) MENTRE la vittima
       avanza col pallone (vx=-300, verso la propria porta d'attacco).
       Un vantaggio vero lascerebbe proseguire l'azione (banner
       VANTAGGIO, nessun azzeramento). Oggi punizioneRapida azzera
       SEMPRE la velocita' del pallone e 'VANTAGGIO' non esiste nel
       file: rossa fino al compito 3. */
    {
      const scena = await pag.evaluate(({ seme, taglia }) => {
        const t = window.__test;
        t.semina(seme);
        t.setCpuVsCpu(true);
        t.startMatch(1, 1, { size: taglia });
        const s = SCENA_FALLO('lontano');
        if (s.errore) return s;
        const vitt = t.players[s.vittimaIdx];
        vitt.vx = -300; vitt.vy = 0;   // l'azione prosegue: la vittima avanza col pallone
        return s;
      }, { seme: SEME, taglia: TAGLIA_BANCO }).catch(e => ({ errore: e.message }));
      if (scena.errore) { di(false, '4. VANTAGGIO-FISCHIA-SEMPRE', 'BANCO: scena non costruita -- ' + scena.errore); }
      else {
        const r = await pag.evaluate(CORRI_TRACCIA_VANTAGGIO(FOTOGRAMMI_ATTESA));
        const ok = r.vistoVantaggio;
        di(ok, '6. VANTAGGIO-FISCHIA-SEMPRE -- fallo con azione che prosegue: atteso banner VANTAGGIO, nessun fischio',
          'banner VANTAGGIO visto: ' + r.vistoVantaggio + '   pallone azzerato di netto: ' + r.fermata +
          (r.fermata ? (' al fotogramma ' + r.fotogrammaFermata) : '') + ' (punizioneRapida azzera sempre, oggi; "VANTAGGIO" assente dal file)');
      }
    }

    /* ===================================================================
       PROVA 7 -- RETRO-FERMO (voce #107, correzione di revisione compito
       2). CONTROLLO DISCRIMINANTE, nasce verde: non esercita codice
       nuovo, misura il caso di mezzo -- un retropassaggio a velocita' 40,
       quasi fermo -- che RETRO-PRESA non isolava mai. Tre condanne
       possibili, tutte diverse dal semplice "presa si'/no" di RETRO-PRESA:
       (i) il portiere non deve MAI prendere con le mani; (ii) il pallone
       non deve MAI attraversarlo (distanza dal portiere mai sotto
       P_R+B_R, con una tolleranza), mentre il regime di negazione e'
       attivo; (iii) entro 5 s (300 fotogrammi) il pallone deve tornare
       vivo -- posseduto da qualcuno o piu' veloce di 50 -- perche' un
       fermo che non si scioglie mai sarebbe uno stallo, non una regola. */
    {
      const scena = await pag.evaluate(({ seme, taglia }) => {
        const t = window.__test;
        t.semina(seme);
        t.setCpuVsCpu(true);
        t.startMatch(1, 1, { size: taglia });
        return SCENA_RETROFERMO();
      }, { seme: SEME, taglia: TAGLIA_BANCO }).catch(e => ({ errore: e.message }));
      if (scena.errore) { di(false, '7. RETRO-FERMO', 'BANCO: scena non costruita -- ' + scena.errore); }
      else {
        const TOLLERANZA_FERMO = 2;   // assorbe il rumore in virgola mobile del rimbalzo, non un vero attraversamento
        const r = await pag.evaluate(CORRI_TRACCIA_RETROFERMO(300, scena.gkIdx, scena.compagnoIdx));
        const okPresa = !r.presa;
        const okAttraversa = r.minDistRegime >= (scena.raggioFermo - TOLLERANZA_FERMO);
        const okVivo = r.vivo && r.vivoFotogramma < 300;
        const ok = okPresa && okAttraversa && okVivo;
        const f2 = v => (isFinite(v) ? v.toFixed(2) : 'n/d');
        di(ok, "7. RETRO-FERMO -- retropassaggio quasi fermo (velocita' 40): niente presa, niente attraversamento, il pallone torna vivo entro 5 s",
          'presa: ' + r.presa + ' (atteso false)   distanza minima nel regime di negazione: ' + f2(r.minDistRegime) +
          ' (atteso >= ' + f2(scena.raggioFermo - TOLLERANZA_FERMO) + ' = P_R+B_R-' + TOLLERANZA_FERMO + ')   ' +
          'vivo: ' + r.vivo + (r.vivo ? (' al fotogramma ' + r.vivoFotogramma) : '') + ' su 300 (5 s)');
      }
    }

    if (ecc.length) { di(false, 'BANCO -- nessuna eccezione di pagina', 'eccezione: ' + ecc[0]); }
  } catch (e) {
    console.error('FALLITO: ' + e.message);
    await browser.close(); srv.chiudi();
    process.exit(2);
  }

  await ctx.close(); await browser.close(); srv.chiudi();
  const rossi = esiti.filter(v => !v).length;
  console.log('\n' + (esiti.length - rossi) + ' prove su ' + esiti.length + ' -- ' + (rossi ? 'CANCELLO ROSSO' : 'CANCELLO VERDE'));
  process.exit(rossi ? 1 : 0);
})();
