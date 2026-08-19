/* =====================================================================
   _q-l11.js — IL CANCELLO DEL MOTORE D'INGRESSO (voce L1.1 di
   _analisi/agente28.md §10).

   Sorveglia TRE proprieta' del motore che sta SOTTO i verbi, e nessuna
   di piu':
     A) lo SCARTO DEI 60 ms: il trascinamento si legge sul campione piu'
        recente ANTERIORE di 60 ms al distacco, quindi la deriva distale
        dell'ellisse di contatto — che arriva tutta nell'ultima finestra —
        non entra nella direzione;
     B) l'ANNULLO PER SPOSTAMENTO e non per percorso: 30 px avanti e 30
        indietro (percorso 60, spostamento 0) NON annullano; 100 px in
        linea annullano;
     C) il RI-ARMO sul cambio di contesto: se mentre il dito e' giu' la
        palla cambia squadra, l'atto congelato muore, il rilascio non
        produce un tiro, e nessuna carica resta aperta a congelare il
        giocatore comandato.

   COME SI LEGGE UN VERDETTO, QUI DENTRO. Ogni verdetto sta su un EFFETTO
   della simulazione, mai su una bandiera scritta dal codice giudicato:
     · «il pallone parte o no» — si conta kickBall, che e' l'imbuto unico
       di tutti i calci del gioco (lo dice il gioco stesso, sopra
       b.crossTo), e si guarda chi e' il padrone del pallone dopo;
     · «dove va il pallone» — per A si legge la velocita' e lo
       spostamento VERI del pallone dopo il calcio;
     · «il giocatore e' congelato o no» — p.charge>=0 vale slow=0,45 in
       updatePlayer (riga «const slow = p.charge>=0 ? 0.45 : 1»), ed e'
       la stessa misura che strumenti/_p-rilascio.js chiama caricaOrfana.
   L'unica lettura non-effetto e' l'ETICHETTA DEL DISCO, che si prende da
   window.__test.pulsanti() — funzione del gioco che esisteva prima di
   L1.1 — ed e' stampata come CONTESTO, non come verdetto.

   IL BRACCIO «SENZA SCARTO» DI A NON PASSA DAL CODICE GIUDICATO: e'
   aritmetica che questo file fa sulle coordinate che ha spedito lui.
   Percio' il confronto con/senza e' onesto anche se il motore mente.

   uso:
     node strumenti/_q-l11.js                       (sul gioco di casa)
     node strumenti/_q-l11.js --gioco fuori/dopo.html
     node strumenti/_q-l11.js --testa               (finestra visibile)
   esce 0 se tutti i verdetti sono verdi, 1 se anche uno solo e' rosso.

   IL BANCO E' UN BROWSER, NON UN VETRO. Chromium senza inserti di
   sistema, dita scritte con Input.dispatchTouchEvent del protocollo,
   tempo preso in mano a passo fisso (un requestAnimationFrame per
   chiamata, DT = 1/60 esatto) e Math.random a seme fisso: due corse
   danno gli stessi numeri. Nessuna di queste prove tocca vetro.
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
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'CALCETTO-il-gioco.html')));
const TESTA = process.argv.includes('--testa');
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
               '.png': 'image/png', '.json': 'application/json' };

/* Playwright non apre file: — serve un server locale. Qualunque richiesta
   del gioco viene deviata sul file che stiamo giudicando, cosi' la stessa
   pagina serve base e copia toppata senza copiare niente in giro. */
function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (/CALCETTO-il-gioco\.html$/i.test(f)) f = GIOCO;
      if ((!f.startsWith(RADICE) && f !== GIOCO) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        res.writeHead(404); res.end('no'); return;
      }
      res.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream',
                           'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* il tempo in mano al banco: un fotogramma per chiamata, 1000/60 ms,
   cioe' esattamente un passo di step() per passo(1) */
function bancoDiProva() {
  const PASSO = 1000 / 60;
  let t = 0, coda = [];
  window.requestAnimationFrame = cb => { coda.push(cb); return coda.length; };
  window.cancelAnimationFrame = () => {};
  try { performance.now = () => t; } catch (e) {}
  window.__banco = { passo(n) {
    n = Math.max(0, Math.round(+n || 0));
    for (let i = 0; i < n; i++) { const c = coda; coda = []; t += PASSO;
      for (const f of c) { try { f(t); } catch (e) {} } }
    return t;
  } };
}

/* dita di protocollo: gli stessi eventi che manda il vetro di un telefono */
const dito = {
  giu:    (cdp, x, y) => cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }),
  sposta: (cdp, x, y) => cdp.send('Input.dispatchTouchEvent', { type: 'touchMove',  touchPoints: [{ x, y }] }),
  su:     cdp => cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }),
  annulla:cdp => cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] }),
  suSicuro: async cdp => { try { await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); } catch (e) {} },
};

/* ---------------------------------------------------------------------
   LA SONDA. Avvolge kickBall — l'imbuto unico di tutti i calci — e
   registra chi calcia e con che velocita'. Non decide niente: conta.
   --------------------------------------------------------------------- */
function installaSonda() {
  if (window.__sonda) return 'gia';
  /* =====================================================================
     QUESTO BANCO NON RICOSTRUISCE NIENTE FUORI DAL GIOCO.
     Carica la pagina vera da un server vero, manda dita di protocollo e
     legge lo stato del gioco vivo. Non estrae sorgente, non chiama
     new Function, non tiene una copia di nessuna funzione: quindi la
     fragilita' che ha ucciso strumenti/_q-precedenza.js — una toppa da'
     a touchBtnLayout una dipendenza nuova, il pezzo estratto non ce l'ha,
     e nove cancelli accusano il gioco di «puoTirare is not defined» — qui
     non puo' esistere per costruzione.
     Resta una fragilita' PIU' PICCOLA e di altra specie: questo file
     chiama per nome tre cose della pagina — kickBall, Touch5.trascina,
     puoTirare. Le ultime due sono gia' sotto typeof e degradano dicendo
     «non esiste su questo gioco». kickBall no, ed e' il perno di ogni
     verdetto: se sparisse o cambiasse nome, senza questa riga la sonda
     esploderebbe con un messaggio che sembra un difetto del gioco. Con
     questa riga dice che a essere invecchiato e' il BANCO, ed esce con
     il codice del banco (2), non con quello del gioco (1).
     ===================================================================== */
  if (typeof window.kickBall !== 'function')
    return 'BANCO INVECCHIATO: window.kickBall non esiste piu\'. Questo cancello conta i calci avvolgendola; se il gioco ha cambiato l\'imbuto dei calci, va aggiornato il banco.';
  const G = window.__test.G;
  const S = { calci: [], tot: 0 };
  window.__sonda = S;
  const orig = window.kickBall;
  window.kickBall = function (p, nx, ny, speed, spinY) {
    const r = orig.call(this, p, nx, ny, speed, spinY);
    S.tot++;
    /* SI REGISTRA L'INDICE DI CHI CALCIA, non «e' il comandato adesso».
       Al furto del pallone il gioco CAMBIA GIOCATORE COMANDATO da solo:
       un conteggio legato a G.ctrl[0] attribuirebbe i calci all'uomo
       sbagliato — e proprio nella prova C, dove tutto il punto e' che
       l'uomo che ha premuto non e' piu' quello comandato. */
    if (r) S.calci.push({ chi: G.players.indexOf(p), mio: G.ctrl[0] >= 0 && G.players[G.ctrl[0]] === p,
                          vx: G.ball.vx, vy: G.ball.vy });
    return r;
  };
  return 'ok';
}

/* la quiete governata, ricalcata su strumenti/_p-rilascio.js: partita in
   corso, palla al piede del comandato al centro del campo, TUTTI gli
   altri (compagni compresi) spinti a 230 unita'. I compagni si spingono
   via perche' in A il pallone deve volare senza che nessuno lo raccolga
   a meta' strada: un ricevente cambierebbe la direzione misurata. */
function preparaQuiete() {
  const t = window.__test, G = t.G;
  /* LA SCHERMATA D'APERTURA E' UN PANNELLO DEL DOCUMENTO, NON UN
     DISEGNO: finche' sta li' copre la tela, e ogni dito di protocollo
     cade su di lei invece che sul gioco. Senza questa riga il cancello
     ha misurato per una corsa intera un gioco che non riceveva un solo
     touchstart, e ha chiamato «verde» un tiro che non era mai partito
     perche' nessuno aveva premuto. Da qui l'asserto sotto, che rifiuta
     di misurare se il punto del disco non appartiene alla tela. */
  try { t.dismissSplash && t.dismissSplash(); } catch (e) {}
  t.setPaused && t.setPaused(false);
  try { if (t.Tut && t.Tut.active && t.Tut.finish) t.Tut.finish(true); } catch (e) {}
  for (let giro = 0; giro < 3 && G.scene !== 'play'; giro++) {
    for (let i = 0; i < 200 && G.scene !== 'play'; i++) t.simulate(0.1);
    if (G.scene !== 'play') { t.startMatch(1, 1, { size: 5 }); for (let i = 0; i < 80 && G.scene !== 'play'; i++) t.simulate(0.1); }
  }
  if (G.scene !== 'play') return { errore: "la partita non arriva in gioco: scena '" + G.scene + "'" };
  t.setTimeLeft && t.setTimeLeft(80);
  const pi = G.ctrl[0];
  if (pi < 0) return { errore: 'nessun giocatore comandato' };
  const p = G.players[pi];
  const c0 = t.campo;
  if (p.charge !== undefined && p.charge >= 0) { p.charge = -1; p.chargeKind = 'tiro'; p.chargeT = 0; p.chargeGo = null; p.chargeClip = null; }
  p.slide = -1; p.recover = 0;
  for (const q of G.players) { q.vx = 0; q.vy = 0; }
  p.x = c0.FW * 0.5; p.y = c0.FH * 0.5;
  const b = G.ball;
  b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0; b.curve = 0; b.passTo = -1; b.crossTo = -1;
  b.owner = pi; b.x = p.x + 8; b.y = p.y;
  for (const q of G.players) {
    if (q === p) continue;
    const d = Math.hypot(q.x - b.x, q.y - b.y);
    if (d < 230) { const l = Math.max(1, d); q.x = b.x + (q.x - b.x) / l * 240; q.y = b.y + (q.y - b.y) / l * 240; }
  }
  window.__sonda.calci = []; window.__sonda.tot = 0;
  const bt = t.pulsanti(0);
  const grande = bt.reduce((a, c) => (c.r || 0) > (a.r || 0) ? c : a, bt[0]);
  /* il dito deve poter arrivare alla tela: se sopra il disco c'e' un
     pannello, la prova non e' nulla — e' finta */
  const sotto = document.elementFromPoint(grande.x, grande.y);
  if (!sotto || sotto.id !== 'gioco')
    return { errore: 'sul disco (' + grande.x + ',' + grande.y + ') non c\'e\' la tela ma ' + (sotto ? sotto.tagName + '#' + sotto.id : 'niente') };
  if (grande.act !== 'shot')
    return { errore: 'il disco grande offre «' + grande.act + '» invece di «shot»: la palla non e\' al piede del comandato' };
  return { pi, px: p.x, py: p.y, disco: { x: grande.x, y: grande.y, r: grande.r, act: grande.act, label: grande.label } };
}

const ang = (x, y) => Math.atan2(y, x) * 180 / Math.PI;
const dAng = (a, b) => { let d = a - b; while (d > 180) d -= 360; while (d < -180) d += 360; return Math.abs(d); };
const n2 = v => (v === null || v === undefined || !isFinite(v)) ? 'n/d' : (Math.round(v * 100) / 100).toString().replace('.', ',');

/* ===================================================================== */
(async () => {
  const srv = await servi();
  const br = await chromium.launch({ headless: !TESTA });
  const ctx = await br.newContext({ viewport: { width: 915, height: 412 },
    deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const eccezioni = [];

  async function apri() {
    const pag = await ctx.newPage();
    await pag.addInitScript(seme => {
      let s = seme >>> 0 || 1;
      const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
      Math.random = () => p() / 4294967296;
    }, 20260819);
    await pag.addInitScript(bancoDiProva);
    pag.on('pageerror', e => eccezioni.push(e.message));
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(() => window.__banco.passo(6));
    const sonda = await pag.evaluate(installaSonda);
    if (sonda !== 'ok' && sonda !== 'gia') { console.error('FALLITO: ' + sonda); process.exit(2); }
    const cdp = await ctx.newCDPSession(pag);
    const q = await pag.evaluate(preparaQuiete);
    if (q.errore) throw new Error('quiete: ' + q.errore);
    const passo = n => pag.evaluate(k => window.__banco.passo(k), n);
    return { pag, cdp, q, passo };
  }

  const esiti = [];
  const righe = [];
  const stampa = s => { righe.push(s); console.log(s); };

  stampa('=== CANCELLO L1.1 — il motore d\'ingresso ===');
  stampa('  gioco: ' + GIOCO);
  stampa('  banco: Chromium 915x412 dpr2, dita di protocollo, DT=1/60 in mano, seme 20260819');
  stampa('');

  /* -------------------------------------------------------------------
     A — LO SCARTO DEI 60 ms.
     Trascinamento vero: 60 px verso l'ALTO (-90 gradi) in otto
     fotogrammi. Poi, nei QUATTRO fotogrammi finali (66,7 ms > 60), una
     deriva di 15 px verso SINISTRA: e' il collasso dell'ellisse di
     contatto verso la punta del pollice, in direzione fissa, iniettato
     esattamente nell'istante della decisione.
     Con lo scarto la direzione letta deve restare -90; senza, la somma
     dei due vettori la porta a -104.
     L'EFFETTO: la direzione letta si consegna a kickBall — la funzione
     del gioco, non del motore — e si misurano la velocita' del pallone e
     lo spostamento vero dopo 0,2 s di simulazione.
     ------------------------------------------------------------------- */
  {
    const { pag, cdp, q, passo } = await apri();
    const P = q.disco;
    const VERO = -90;                      // la direzione che il dito sta dicendo
    const MAIN = 60, DERIVA = 15, NF = 8, ND = 4;
    await dito.giu(cdp, P.x, P.y);
    for (let i = 1; i <= NF; i++) { await passo(1); await dito.sposta(cdp, P.x, P.y - MAIN * i / NF); }
    for (let i = 1; i <= ND; i++) { await passo(1); await dito.sposta(cdp, P.x - DERIVA * i / ND, P.y - MAIN); }
    const ultimo = { x: P.x - DERIVA, y: P.y - MAIN };

    /* SENZA SCARTO: aritmetica di questo file sulle coordinate che ha
       spedito lui. Non passa da nessuna riga del motore. */
    const senza = ang(ultimo.x - P.x, ultimo.y - P.y);
    const errSenza = dAng(senza, VERO);

    const let60 = await pag.evaluate(() => (typeof Touch5 !== 'undefined' && typeof Touch5.trascina === 'function')
      ? Touch5.trascina(Object.keys(Touch5.atti || {})[0], true) : null);

    let errCon = null, angPalla = null, angVolo = null, velPalla = null;
    if (let60) {
      const eff = await pag.evaluate(([ux, uy]) => {
        const G = window.__test.G, p = G.players[G.ctrl[0]];
        const x0 = G.ball.x, y0 = G.ball.y;
        kickBall(p, ux, uy, 300, 0);
        const v = { vx: G.ball.vx, vy: G.ball.vy };
        for (let i = 0; i < 12; i++) window.__test.simulate(1 / 60);
        return { v, dx: G.ball.x - x0, dy: G.ball.y - y0, owner: G.ball.owner };
      }, [let60.ux, let60.uy]);
      angPalla = ang(eff.v.vx, eff.v.vy);
      angVolo = ang(eff.dx, eff.dy);
      velPalla = Math.hypot(eff.v.vx, eff.v.vy);
      errCon = dAng(angPalla, VERO);
    }
    await dito.annulla(cdp);
    await pag.close();

    const ok = let60 !== null && errCon !== null && errCon <= 3 && errSenza >= 8;
    esiti.push({ id: 'A', nome: 'scarto dei 60 ms', ok });
    stampa('A) SCARTO DEI 60 ms — trascinamento vero ' + VERO + ' gradi, deriva di ' + DERIVA + ' px negli ultimi ' + ND + ' fotogrammi (' + n2(ND * 1000 / 60) + ' ms)');
    stampa('   errore angolare SENZA scarto (aritmetica del banco):  ' + n2(errSenza) + ' gradi');
    stampa('   errore angolare CON   scarto (letto sul pallone):     ' + (errCon === null ? 'n/d — Touch5.trascina non esiste su questo gioco' : n2(errCon) + ' gradi'));
    if (let60) {
      stampa('   effetto: pallone a ' + n2(velPalla) + ' unita'.concat("'", '/s, direzione della velocita\' ') + n2(angPalla) +
             ' gradi, direzione dello spostamento dopo 0,2 s ' + n2(angVolo) + ' gradi');
      stampa('   lettura: |trascinamento| ' + n2(let60.l) + ' px, eta\' del campione ' + n2(let60.eta * 1000) + ' ms, R_ARMA ' + n2(let60.rArma) + ' px, armato ' + let60.armato);
    }
    stampa('   soglia: CON <= 3 gradi  e  SENZA >= 8 gradi   ->  ' + (ok ? 'VERDE' : 'ROSSO'));
    stampa('');
  }

  /* -------------------------------------------------------------------
     B — L'ANNULLO VIVE SULLO SPOSTAMENTO, NON SUL PERCORSO.
     Due casi, due verdetti, sullo stesso verbo — il tiro, che oggi e'
     l'unico verbo del gioco che vive sul RILASCIO.
       b1  30 px su + 30 px giu' (percorso 60, spostamento 0) e poi si
           tiene fermo fino a 0,6 s: il tiro DEVE uscire.
       b2  100 px in linea (spostamento 100 > R_ANNULLA 96): il tiro NON
           deve uscire, e il pallone deve restare al piede.
     ------------------------------------------------------------------- */
  async function provaB(nome, punti, freniFinali, attesoCalcio) {
    const { pag, cdp, q, passo } = await apri();
    const P = q.disco;
    await dito.giu(cdp, P.x, P.y);
    let percorso = 0, prec = { x: P.x, y: P.y };
    for (const pt of punti) {
      await passo(1);
      await dito.sposta(cdp, P.x + pt[0], P.y + pt[1]);
      percorso += Math.hypot(P.x + pt[0] - prec.x, P.y + pt[1] - prec.y);
      prec = { x: P.x + pt[0], y: P.y + pt[1] };
    }
    for (let i = 0; i < freniFinali; i++) await passo(1);
    const spost = Math.hypot(prec.x - P.x, prec.y - P.y);
    const prima = await pag.evaluate(() => {
      const G = window.__test.G, p = G.players[G.ctrl[0]];
      window.__sonda.calci = []; window.__sonda.tot = 0;
      window.__piPress = G.ctrl[0];
      const L = (typeof Touch5 !== 'undefined' && typeof Touch5.trascina === 'function')
        ? Touch5.trascina(Object.keys(Touch5.atti || {})[0], true) : null;
      return { carica: p.charge, owner: G.ball.owner, pi: G.ctrl[0], L };
    });
    await dito.su(cdp);
    await passo(3);
    const dopo = await pag.evaluate(() => {
      const G = window.__test.G, k = window.__piPress, p = G.players[k];
      const S = window.__sonda;
      return { miei: S.calci.filter(c => c.chi === k).length, tutti: S.tot,
               owner: G.ball.owner, pi: k,
               vel: Math.hypot(G.ball.vx, G.ball.vy), carica: p.charge };
    });
    await dito.suSicuro(cdp);
    await pag.close();
    const uscito = dopo.miei >= 1;
    const ok = uscito === attesoCalcio;
    stampa('   ' + nome + ': percorso ' + n2(percorso) + ' px, spostamento finale ' + n2(spost) + ' px, carica al rilascio ' + n2(prima.carica) + ' s');
    stampa('       calci del comandato: ' + dopo.miei + '  ·  padrone del pallone dopo: ' + (dopo.owner === dopo.pi ? 'ancora il comandato' : (dopo.owner < 0 ? 'nessuno (in volo)' : 'altri')) +
           '  ·  velocita\' del pallone ' + n2(dopo.vel) + ' unita\'/s');
    if (prima.L) stampa('       lettura del motore: |trascinamento| ' + n2(prima.L.l) + ' px, morto ' + prima.L.morto + ', armato ' + prima.L.armato + ', R_ARMA ' + n2(prima.L.rArma) + ' px');
    else stampa('       lettura del motore: n/d — Touch5.trascina non esiste su questo gioco');
    stampa('       atteso: ' + (attesoCalcio ? 'il tiro ESCE' : 'il tiro NON esce') + '  ->  ' + (ok ? 'VERDE' : 'ROSSO'));
    return ok;
  }

  {
    stampa('B) ANNULLO PER SPOSTAMENTO (R_ANNULLA = 96 px di spostamento dal punto di posa)');
    const andata = [], ritorno = [], linea = [];
    for (let i = 1; i <= 12; i++) andata.push([0, -30 * i / 12]);
    for (let i = 1; i <= 12; i++) ritorno.push([0, -30 + 30 * i / 12]);
    for (let i = 1; i <= 24; i++) linea.push([0, -100 * i / 24]);
    const b1 = await provaB('b1  30 px su + 30 px giu\'', andata.concat(ritorno), 12, true);
    const b2 = await provaB('b2  100 px in linea      ', linea, 12, false);
    esiti.push({ id: 'B1', nome: 'percorso 60 / spostamento 0 non annulla', ok: b1 });
    esiti.push({ id: 'B2', nome: 'spostamento 100 annulla', ok: b2 });
    stampa('');
  }
  /* -------------------------------------------------------------------
     C — IL RI-ARMO SUL CAMBIO DI CONTESTO, E IL SUO CONTRARIO.

     COSA E' CAMBIATO IL 19 AGOSTO 2026, E PERCHE' QUESTA SCENA E' STATA
     RIFATTA. Con la toppa L0.4b l'etichetta dei dischi non risponde piu'
     a «di chi e' il pallone» ma a «cosa otterrebbe il dito»: la scrive
     puoTirare(t), che e' vera ANCHE quando la palla e' di un avversario,
     purche' resti entro KICK_R*1.4 = 36,4 unita' — perche' li' premere
     un calcio lo produce davvero.
     La vecchia scena di questo cancello toglieva il possesso e lasciava
     il pallone al piede, a diciannove unita'. Con l'etichetta nuova il
     disco continua a dire TIRA, E HA RAGIONE. Il ri-armo non scattava
     perche' non c'era niente da ri-armare, e il banco — che pure lo
     dichiarava, «prova nulla» — contava rosso lo stesso: accusava il
     gioco di un difetto della propria scena. Un banco che fa cosi' e'
     peggio di uno che tace, e questo era il difetto da riparare.

     ADESSO IL FURTO PORTA VIA IL PALLONE. Il ladro se lo porta a
     LONTANO unita' dall'uomo che ha premuto — oltre KICK_R*1.4 — e la
     scena CHIEDE AL GIOCO, con la sua puoTirare, se il contesto e'
     cambiato davvero. Se non e' cambiato la prova e' NULLA: ne' verde
     ne' rossa, e il cancello esce con un codice suo (3) che dice «il
     banco non e' riuscito a mettere alla prova», non «il gioco e' rotto».

     E LA SCENA SIMMETRICA, c3, che prima non c'era. Il possesso cambia
     ma il pallone resta A PORTATA: li' il disco deve continuare a dire
     TIRA e il ri-armo NON deve scattare, e il tiro al rilascio deve
     uscire davvero. Senza c3 questo cancello premierebbe una cura che
     spegne troppo — un ri-armo che scatta a ogni cambio di padrone
     ucciderebbe il tiro di chi ha il piede sul pallone conteso, che e'
     mezzo calcetto.

     I TRE VERDETTI STANNO SU EFFETTI:
       · il pallone parte o no (kickBall, imbuto unico di tutti i calci);
       · la carica resta aperta o no sull'uomo CHE HA PREMUTO — che al
         furto non e' piu' quello comandato, perche' il gioco cambia uomo
         da solo — e una carica aperta vale «const slow = p.charge>=0 ?
         0.45 : 1» in updatePlayer, cioe' un uomo della propria squadra
         al 45% per il resto della partita;
       · quanto quell'uomo CORRE davvero nei due decimi dopo il furto.
     ------------------------------------------------------------------- */
  const KICK_R = 26, ARMATO_R = 26 * 1.4;

  async function provaC(nome, opts) {
    const { pag, cdp, q, passo } = await apri();
    const P = q.disco;
    await dito.giu(cdp, P.x, P.y);
    await passo(18);
    const attoPrima = await pag.evaluate(() => {
      const t = window.__test;
      window.__piPress = t.G.ctrl[0];
      const p = t.G.players[t.G.ctrl[0]];
      window.__posa = { x: p.x, y: p.y };
      return { disco: t.pulsanti(0)[0].act, carica: p.charge, pi: t.G.ctrl[0],
               puoTirare: (typeof puoTirare === 'function') ? puoTirare(0) : null };
    });
    /* IL FURTO. Si copia quello vero del gioco — «b.owner=qi;
       q.kickCd=0.35; o.kickCd=0.5», i due numeri sono suoi, non miei —
       e poi, se la prova lo chiede, il ladro SE LO PORTA VIA: ladro e
       pallone insieme, a «lontano» unita' dall'uomo che ha premuto,
       lungo l'asse lungo del campo e dalla parte che tiene tutto piu'
       dentro le linee. Senza portarlo via il contesto non cambia. */
    const furto = await pag.evaluate(lontano => {
      const t = window.__test, G = t.G, pi = G.ctrl[0], p = G.players[pi], b = G.ball;
      let k = -1, dm = 1e9;
      for (let i = 0; i < G.players.length; i++) {
        const o = G.players[i];
        if (o.team === p.team || o.out > 0) continue;
        const d = Math.hypot(o.x - b.x, o.y - b.y);
        if (d < dm) { dm = d; k = i; }
      }
      if (k < 0) return { errore: 'nessun avversario' };
      b.owner = k; b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0; b.passTo = -1;
      G.players[k].kickCd = 0.35; p.kickCd = 0.5;
      let bx = b.x, by = b.y;
      if (lontano > 0) {
        const FW = t.campo.FW;
        const verso = (p.x < FW / 2) ? 1 : -1;          // si va verso il lato con piu' spazio
        bx = Math.max(20, Math.min(FW - 20, p.x + verso * lontano));
        by = p.y;
      }
      b.x = bx; b.y = by;
      G.players[k].x = bx; G.players[k].y = by; G.players[k].vx = 0; G.players[k].vy = 0;
      window.__sonda.calci = []; window.__sonda.tot = 0;
      return { ladro: k, dSubito: Math.hypot(bx - p.x, by - p.y) };
    }, opts.lontano || 0);
    if (furto.errore) throw new Error('furto: ' + furto.errore);
    /* IL RI-ARMO E' UN EVENTO DELLA SIMULAZIONE, non dell'evento di
       tocco: succede al primo passo di step() dopo il cambio. Si legge
       dopo passo(1), e insieme si legge la carica — perche' la
       proprieta' vera e' che la carica muore ADESSO, al furto, non al
       rilascio. */
    await passo(1);
    const attoDopo = await pag.evaluate(() => {
      const t = window.__test, G = t.G, k = window.__piPress;
      const T = (typeof Touch5 !== 'undefined' && Touch5.btnTouch) ? Touch5.btnTouch[Object.keys(Touch5.btnTouch)[0]] : null;
      return { disco: t.pulsanti(0)[0].act, dito: T ? T.act : null,
               puoTirare: (typeof puoTirare === 'function') ? puoTirare(0) : null,
               carica: G.players[k].charge,
               dPalla: Math.hypot(G.ball.x - G.players[k].x, G.ball.y - G.players[k].y) };
    });
    await passo(Math.max(0, opts.frame - 1));
    /* LA DISTANZA NELL'ISTANTE DEL RILASCIO, e non dopo. kickBall
       rifiuta un calcio su un pallone che non e' tuo oltre KICK_R: se
       nel frattempo il ladro se l'e' portato via, «il tiro non esce» e'
       vero e non dice niente sul ri-armo. Questa lettura e' l'unico modo
       di distinguere «non e' uscito perche' il motore l'ha spento» da
       «non e' uscito perche' il pallone era lontano», e senza di lei la
       prova c3 usciva rossa accusando il gioco di un difetto della
       scena — lo stesso errore che questa riscrittura esiste per
       togliere di mezzo. */
    const alRilascio = await pag.evaluate(() => {
      const G = window.__test.G, k = window.__piPress, p = G.players[k];
      return { dPalla: Math.hypot(G.ball.x - p.x, G.ball.y - p.y), carica: p.charge };
    });
    if (opts.rilascia) { await dito.su(cdp); await passo(3); }
    const dopo = await pag.evaluate(() => {
      const G = window.__test.G, S = window.__sonda, k = window.__piPress;
      const p = G.players[k], o = window.__posa;
      return { suoi: S.calci.filter(c => c.chi === k).length, tutti: S.tot,
               carica: p.charge, dPalla: Math.hypot(G.ball.x - p.x, G.ball.y - p.y),
               corsa: Math.hypot(p.x - o.x, p.y - o.y),
               owner: G.ball.owner, ctrlOra: G.ctrl[0], piPress: k };
    });
    await dito.suSicuro(cdp);
    await pag.close();

    /* LA VALIDITA' DELLA SCENA, chiesta al gioco e non dedotta. */
    const eraTiro = attoPrima.disco === 'shot';
    const oraTiro = attoDopo.disco === 'shot';
    const raggiungibile = alRilascio.dPalla <= KICK_R;
    const valida = eraTiro && (opts.attesoRiarmo ? !oraTiro : (oraTiro && raggiungibile));
    const orfana = dopo.carica >= 0 ? 1 : 0;

    let ok = null, atteso;
    if (!valida) {
      atteso = opts.attesoRiarmo
        ? 'il furto doveva TOGLIERE il tiro al disco, e non l\'ha tolto'
        : (!oraTiro ? 'il disco doveva dire ancora TIRA col pallone a portata, e non lo dice'
                    : 'al rilascio il pallone era a ' + n2(alRilascio.dPalla) + ' unita\', oltre KICK_R ' + KICK_R + ': nessun tiro poteva uscire comunque');
    } else if (opts.attesoRiarmo) {
      /* il ri-armo deve scattare: la carica muore al furto, non al
         rilascio; e il dito passa al verbo nuovo */
      ok = attoDopo.carica < 0 && attoDopo.dito !== 'shot' && dopo.suoi === 0 && orfana === 0;
      atteso = 'carica chiusa entro un fotogramma, verbo nuovo sotto il dito, zero calci, zero cariche aperte';
    } else {
      /* il ri-armo NON deve scattare: il dito tiene ancora il tiro, e il
         tiro al rilascio esce davvero */
      ok = attoDopo.carica >= 0 && attoDopo.dito === 'shot' && dopo.suoi >= 1 && orfana === 0;
      atteso = 'nessun ri-armo, e al rilascio il tiro ESCE';
    }

    stampa('   ' + nome);
    stampa('       scena: disco prima «' + attoPrima.disco + '» (puoTirare ' + attoPrima.puoTirare + ')' +
           ' -> dopo il furto «' + attoDopo.disco + '» (puoTirare ' + attoDopo.puoTirare + ')' +
           ' · pallone a ' + n2(attoDopo.dPalla) + ' unita\' (KICK_R ' + KICK_R + ', armato ' + n2(ARMATO_R) + ')');
    stampa('       un fotogramma dopo il furto: atto sotto il dito «' + attoDopo.dito + '» · carica ' + n2(attoDopo.carica) + ' s');
    stampa('       comandato alla pressione ' + dopo.piPress + ', al verdetto ' + dopo.ctrlOra +
           (dopo.ctrlOra !== dopo.piPress ? ' (il gioco ha cambiato uomo da solo)' : '') +
           ' · corsa dell\'uomo che ha premuto ' + n2(dopo.corsa) + ' unita\'');
    stampa('       nell\'istante del rilascio: pallone a ' + n2(alRilascio.dPalla) + ' unita\' (' + (raggiungibile ? 'a portata di calcio' : 'FUORI portata') + ') · carica ' + n2(alRilascio.carica) + ' s');
    stampa('       calci dell\'uomo che ha premuto: ' + dopo.suoi + ' · carica ancora aperta su di lui (slow 0,45): ' + orfana +
           ' (' + n2(dopo.carica) + ' s) · pallone a ' + n2(dopo.dPalla) + ' unita\'');
    stampa('       atteso: ' + atteso + '  ->  ' + (ok === null ? 'PROVA NULLA' : (ok ? 'VERDE' : 'ROSSO')));
    return ok;
  }

  {
    stampa('C) RI-ARMO SUL CAMBIO DI CONTESTO — e il caso simmetrico');
    /* c1 rilascia dopo TRE fotogrammi (50 ms): mezzo attimo dopo il
       furto, che e' l'istante in cui il dito e' ancora giu' e la
       paralisi che il ri-armo esiste per togliere sarebbe massima. */
    const c1 = await provaC('c1  il ladro porta via il pallone · rilascio 50 ms dopo', { lontano: 90, frame: 3, rilascia: true, attesoRiarmo: true });
    const c2 = await provaC('c2  il ladro porta via il pallone · dito tenuto fino a 1,40 s (oltre SHOT_HARDCAP 1,25 s)', { lontano: 90, frame: 66, rilascia: false, attesoRiarmo: true });
    /* c3 rilascia dopo TRE fotogrammi come c1, e per la ragione opposta:
       il ladro corre, e in 0,20 s si era gia' portato il pallone a 63,16
       unita' — misurato — cioe' fuori da KICK_R, dove nessun tiro sarebbe
       uscito comunque e il verde sarebbe stato dell'aria. A 50 ms il
       pallone e' ancora sotto il piede di chi tiene il dito giu', ed e'
       esattamente il caso che si vuole difendere: pallone conteso, dito
       sul tiro, il possesso balla — e il tiro deve restare suo. */
    const c3 = await provaC('c3  il possesso cambia MA il pallone resta a portata · rilascio 50 ms dopo', { lontano: 0, frame: 3, rilascia: true, attesoRiarmo: false });
    esiti.push({ id: 'C1', nome: 'il furto che cambia contesto ri-arma e non calcia', ok: c1 });
    esiti.push({ id: 'C2', nome: 'la carica non sopravvive al furto che cambia contesto', ok: c2 });
    esiti.push({ id: 'C3', nome: 'possesso cambiato ma pallone a portata: nessun ri-armo, il tiro esce', ok: c3 });
    stampa('');
  }

  /* -------------------------------------------------------------------
     D — NON REGRESSIONE, e non e' un ornamento: L1.1 mette le mani
     dentro Touch5.chiudi, cioe' esattamente dove vive la legge che
     touchcancel non e' touchend. Se un annullo di sistema tornasse a
     calciare, tutto il resto non conterebbe niente.
     ------------------------------------------------------------------- */
  {
    const { pag, cdp, q, passo } = await apri();
    const P = q.disco;
    await dito.giu(cdp, P.x, P.y);
    await passo(36);
    await pag.evaluate(() => { window.__sonda.calci = []; window.__sonda.tot = 0; window.__piPress = window.__test.G.ctrl[0]; });
    await dito.annulla(cdp);
    await passo(3);
    const d = await pag.evaluate(() => {
      const G = window.__test.G, k = window.__piPress, p = G.players[k], S = window.__sonda;
      return { miei: S.calci.filter(c => c.chi === k).length, carica: p.charge, owner: G.ball.owner, pi: k };
    });
    await dito.suSicuro(cdp);
    await pag.close();
    const ok = d.miei === 0 && d.carica < 0 && d.owner === d.pi;
    esiti.push({ id: 'D', nome: 'touchcancel non calcia e non lascia cariche', ok });
    stampa('D) NON REGRESSIONE — touchcancel dopo 0,6 s di carica');
    stampa('   calci del comandato: ' + d.miei + '  ·  carica dopo l\'annullo: ' + n2(d.carica) + ' s  ·  pallone: ' + (d.owner === d.pi ? 'ancora al piede' : 'via'));
    stampa('   atteso: zero calci, carica chiusa, pallone al piede  ->  ' + (ok ? 'VERDE' : 'ROSSO'));
    stampa('');
  }

  /* -------------------------------------------------------------------
     E — NON REGRESSIONE, la seconda: la levetta comanda ancora.
     L1.1 mette una riga in cima a Touch5.move, dove passano TUTTI i
     touchmove — quelli dei dischi e quelli dell'erba. Se il ramo nuovo
     inghiottisse anche i secondi, il pollice sinistro smetterebbe di
     comandare e nessuna delle prove qui sopra se ne accorgerebbe.
     L'effetto misurato e' la CORSA VERA del giocatore comandato in
     0,5 s, in unita' di campo.
     ------------------------------------------------------------------- */
  {
    const { pag, cdp, q, passo } = await apri();
    const CASA = { x: 165, y: 272 };            // erba, lontano dai due dischi
    const p0 = await pag.evaluate(() => { const G = window.__test.G, p = G.players[G.ctrl[0]]; return { x: p.x, y: p.y, pi: G.ctrl[0] }; });
    await dito.giu(cdp, CASA.x, CASA.y);
    for (let k = 1; k <= 8; k++) { await passo(1); await dito.sposta(cdp, CASA.x + k * 5.5, CASA.y); }
    await passo(30);
    const d = await pag.evaluate(k => {
      const G = window.__test.G, p = G.players[k];
      const st = (typeof Touch5 !== 'undefined') ? Touch5.stick[0] : null;
      return { x: p.x, y: p.y, viva: st ? st.active : null, dx: st ? st.dx : null };
    }, p0.pi);
    await dito.suSicuro(cdp);
    await pag.close();
    const corsa = Math.hypot(d.x - p0.x, d.y - p0.y);
    const ok = d.viva === true && corsa >= 20;
    esiti.push({ id: 'E', nome: 'la levetta comanda ancora', ok });
    stampa('E) NON REGRESSIONE — la levetta: dito sull\'erba, trascinato 44 px, poi 0,5 s');
    stampa('   levetta viva: ' + d.viva + '  ·  dx della levetta ' + n2(d.dx) + ' px  ·  corsa del comandato ' + n2(corsa) + ' unita\' di campo');
    stampa('   atteso: levetta viva e corsa >= 20 unita\'  ->  ' + (ok ? 'VERDE' : 'ROSSO'));
    stampa('');
  }

  await br.close(); srv.chiudi();

  /* =====================================================================
     TRE ESITI, NON DUE, E TRE CODICI D'USCITA.
     Una prova NULLA e' una prova che il banco non e' riuscito a
     imbastire: la scena non ha prodotto la situazione che diceva di
     produrre. Non e' verde — non ha verificato niente — e soprattutto
     NON E' ROSSA, perche' rossa vorrebbe dire «il gioco e' rotto» e il
     gioco non c'entra. Ha un codice suo, il 3, cosi' chi lancia questo
     file sa che deve riparare il BANCO e non il gioco.
       0  tutti verdi
       1  almeno un rosso: il gioco non regge una proprieta'
       2  il banco e' esploso
       3  nessun rosso, ma almeno una prova nulla: proprieta' non provate
     ===================================================================== */
  const rossi = esiti.filter(e => e.ok === false);
  const nulle = esiti.filter(e => e.ok === null);
  const verdi = esiti.filter(e => e.ok === true);
  stampa('--- ESITO ---');
  for (const e of esiti) stampa('  ' + (e.ok === null ? 'NULLA' : (e.ok ? 'VERDE' : 'ROSSO')) + '  ' + e.id + '  ' + e.nome);
  if (eccezioni.length) stampa('  eccezioni in pagina: ' + eccezioni.length + ' — ' + eccezioni.slice(0, 3).join(' | '));
  stampa('verdi ' + verdi.length + ' · rossi ' + rossi.length + ' · nulle ' + nulle.length + ' · su ' + esiti.length);
  if (rossi.length) stampa('CANCELLO ROSSO: ' + rossi.length + ' controlli falliti.');
  else if (nulle.length) stampa('CANCELLO NON CONCLUSO: ' + nulle.length + ' prove nulle — la scena non ha messo alla prova il gioco. Da riparare e\' il banco.');
  else stampa('CANCELLO VERDE: ' + esiti.length + ' controlli su ' + esiti.length + '.');
  process.exit(rossi.length ? 1 : (nulle.length ? 3 : 0));
})().catch(e => { console.error('FALLITO: ' + (e && e.stack || e)); process.exit(2); });
