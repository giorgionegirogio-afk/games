/* =====================================================================
   _q-l13.js — IL CANCELLO DEL TIRO (voce L1.3 di _analisi/agente28.md
   §10): mira nella bocca, rampa continua di potenza, l'anello che
   aggiunge PRECISIONE, la pizzata.

   Sorveglia CINQUE proprieta', e ognuna si legge su un EFFETTO della
   simulazione — dove finisce il pallone, quanto corre, quanto e' alto —
   mai su una bandiera scritta dal codice giudicato:

     A) LA MIRA. Trascinando il dito sul disco TIRA di T px verticali
        (T = -26, -13, 0, +13, +26: cinque valori, una curva e non un
        caso), il punto in cui il pallone attraversa il piano della
        porta deve muoversi CON T, in modo monotono e per almeno 60
        unita' da capo a capo. L'effetto e' la y del pallone al piano
        x = FW-2, letta dalle posizioni vere del volo.
     B) LA RAMPA. La velocita' del pallone al calcio, misurata a DIECI
        tenute (dal tap a oltre la finestra), deve essere MONOTONA e
        senza gradini: nessun salto piu' grande del 35% dell'intera
        escursione. Oggi il tiro e' un cancello a tre valori e il salto
        si misura qui.
     C) LA PRECISIONE. A parita' di potenza (dichiarata e stampata), un
        rilascio DENTRO la finestra deve finire piu' vicino al punto
        mirato di uno fuori tempo — presto O tardi. Si misura la
        dispersione (RMS dalla y mirata al piano della porta), non
        l'intenzione.
     D) LA PIZZATA. Un tap sotto TAP_T con la levetta verso la porta
        deve produrre un TIRO VERO: pallone che parte verso la porta a
        velocita' da tiro (>= 320: sopra i 300 con cui il portiere
        decide di tuffarsi, e sopra le 300 fisse del tocco corto di
        oggi) e che arriva al piano della porta.
     E) NON REGRESSIONE del pallonetto (verde anche oggi): la levetta
        TIRATA INDIETRO dalla meta' campo offensiva alza il pallone
        (b.vz >= 160), la levetta a FONDO CORSA IN AVANTI (sprint) NON
        lo alza (b.vz <= 130). E' la riparazione di ieri — lo sprint
        fuori dalla decisione dell'alzata — che non deve tornare.

   IL VINCOLO FISICO DELLA CASA E' RISPETTATO: il pollice sinistro
   scende sul vetro all'inizio di ogni prova e NON SI ALZA MAI — si
   muove trascinando (verso la porta per la pizzata, indietro per il
   pallonetto, di 8 px — sotto la dead-zone — quando deve stare zitto).
   Ogni pressione del disco e' un SECONDO dito di protocollo, con i due
   punti attivi dichiarati in ogni evento.

   CONTROLLO NEGATIVO: questo cancello e' stato scritto PRIMA della
   toppa e mostrato ROSSO sul gioco di oggi (A, B, C, D rossi; E verde,
   perche' misura una riparazione di ieri). Il referto rosso e' anche la
   misura chiesta dalla voce: quanto vale oggi il salto del cancello a
   tre valori, stampato dalla prova B.

   uso:
     node strumenti/_q-l13.js                      (sul gioco di casa)
     node strumenti/_q-l13.js --gioco fuori/l13.html
     node strumenti/_q-l13.js --testa              (finestra visibile)
   esce 0 se tutto verde, 1 se anche un solo rosso, 2 se il banco e'
   esploso, 3 se una prova e' NULLA (la scena non ha provato niente).
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

/* Playwright non apre file: — serve un server locale (modello di casa:
   strumenti/folla.js e _q-l11.js). Qualunque richiesta del gioco viene
   deviata sul file giudicato. */
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

/* il tempo in mano al banco: performance.now e il rAF appartengono al
   banco. Il gioco avanza con __test.simulate (passo fisso, senza
   disegno): la tenuta del dito vive sull'accumulatore di step(), che e'
   esattamente cio' che la Legge 1 prescrive. */
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

/* ---------------------------------------------------------------------
   LA SONDA: avvolge kickBall, l'imbuto unico di tutti i calci del gioco
   (lo dichiara il gioco stesso sopra b.crossTo). Registra chi calcia e
   la velocita' VERA del pallone dopo il calcio. Non decide: conta.
   --------------------------------------------------------------------- */
function installaSonda() {
  if (window.__sonda) return 'gia';
  if (typeof window.kickBall !== 'function')
    return 'BANCO INVECCHIATO: window.kickBall non esiste piu\'. Il cancello conta i calci avvolgendola.';
  const G = window.__test.G;
  const S = { calci: [], tot: 0 };
  window.__sonda = S;
  const orig = window.kickBall;
  window.kickBall = function (p, nx, ny, speed, spinY) {
    const r = orig.call(this, p, nx, ny, speed, spinY);
    S.tot++;
    if (r) S.calci.push({ chi: G.players.indexOf(p), vx: G.ball.vx, vy: G.ball.vy });
    return r;
  };
  return 'ok';
}

/* ---------------------------------------------------------------------
   LA SCENA: partita in corso, pallone al piede del comandato nel punto
   chiesto, TUTTI gli altri lontani e INCHIODATI fotogramma per
   fotogramma (il portiere avversario nell'angolo alto della sua area:
   non deve toccare i voli che misuriamo — qui si misura la MIRA, non il
   duello). p.tiro = p.tecnica = 62, cioe' fatt() = 1: la rampa si legge
   nuda, senza il moltiplicatore del piede.
   --------------------------------------------------------------------- */
function preparaScena(cfg) {
  const t = window.__test, G = t.G;
  try { t.dismissSplash && t.dismissSplash(); } catch (e) {}
  t.setPaused && t.setPaused(false);
  try { if (t.Tut && t.Tut.active && t.Tut.finish) t.Tut.finish(true); } catch (e) {}
  for (let g = 0; g < 3 && G.scene !== 'play'; g++) {
    for (let i = 0; i < 200 && G.scene !== 'play'; i++) t.simulate(0.1);
    if (G.scene !== 'play') { t.startMatch(1, 1, { size: 5 }); for (let i = 0; i < 80 && G.scene !== 'play'; i++) t.simulate(0.1); }
  }
  if (G.scene !== 'play') return { errore: "la partita non arriva in gioco: scena '" + G.scene + "'" };
  t.setTimeLeft && t.setTimeLeft(400);
  const c0 = t.campo, FW = c0.FW, FH = c0.FH;
  const pi = G.ctrl[0];
  if (pi < 0) return { errore: 'nessun giocatore comandato' };
  const p = G.players[pi];
  if (p.charge !== undefined && p.charge >= 0) { p.charge = -1; p.chargeGo = null; }
  p.slide = -1; p.recover = 0; if (p.rove !== undefined) p.rove = -1;
  p.kickCd = 0; p.out = 0;
  p.tiro = 62; p.tecnica = 62;
  p.x = cfg.x; p.y = cfg.y; p.vx = 0; p.vy = 0; p.fx = 1; p.fy = 0;
  const b = G.ball;
  b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0; b.curve = 0; b.perfectT = 0;
  b.passTo = -1; b.crossTo = -1; b.owner = pi; b.x = p.x + 8; b.y = p.y;
  window.__posti = {};
  for (let i = 0; i < G.players.length; i++) {
    const q = G.players[i];
    if (i === pi) continue;
    if (q.team === 1 && q.role === 'gk') { q.x = FW - 26; q.y = 28; }
    else {
      q.x = Math.max(30, Math.min(FW - 30, b.x - 320 - ((i % 4) * 55)));
      q.y = Math.max(30, Math.min(FH - 30, 40 + ((i * 97) % Math.max(60, FH - 80))));
      if (Math.hypot(q.x - b.x, q.y - b.y) < 280) q.x = Math.max(30, b.x - 340);
    }
    q.vx = 0; q.vy = 0;
    if (q.charge !== undefined && q.charge >= 0) { q.charge = -1; q.chargeGo = null; }
    q.slide = -1; q.recover = 0;
    window.__posti[i] = { x: q.x, y: q.y };
  }
  window.__piScena = pi;
  window.__pianoX = FW - 2;
  window.__pin = function () {
    const G2 = window.__test.G;
    for (const k in window.__posti) {
      const q = G2.players[+k], o = window.__posti[k];
      q.x = o.x; q.y = o.y; q.vx = 0; q.vy = 0;
      if (q.slide !== undefined && q.slide >= 0) q.slide = -1;
    }
  };
  /* n passi di simulazione con gli inchiodati ri-inchiodati a ogni passo */
  window.__passoPin = function (n) {
    n = Math.max(0, Math.round(+n || 0));
    for (let i = 0; i < n; i++) { window.__pin(); window.__test.simulate(1 / 60); }
    const p2 = window.__test.G.players[window.__piScena];
    return p2.charge;
  };
  /* il pallone torna al piede, la carica si chiude: pronto al prossimo */
  window.__pallaAlPiede = function () {
    const G2 = window.__test.G, k = window.__piScena, p2 = G2.players[k], b2 = G2.ball;
    b2.vx = 0; b2.vy = 0; b2.vz = 0; b2.z = 0; b2.curve = 0; b2.perfectT = 0;
    b2.passTo = -1; b2.crossTo = -1; b2.owner = k; b2.x = p2.x + 8; b2.y = p2.y;
    p2.kickCd = 0; p2.kickT = 0;
    if (p2.charge !== undefined && p2.charge >= 0) { p2.charge = -1; p2.chargeGo = null; }
    return true;
  };
  /* il VOLO: si campiona la posizione vera del pallone fotogramma per
     fotogramma e ci si ferma a x >= FW-14 — PRIMA della linea, cosi' il
     gol non scatta e la scena resta in mano al banco. La y al piano
     FW-2 si estrapola dagli ultimi due campioni: al massimo 12 unita'
     di prolungamento su una corda quasi rettilinea. */
  window.__volo = function () {
    const G2 = window.__test.G, b2 = G2.ball, stop = window.__pianoX - 12;
    let prev = { x: b2.x, y: b2.y }, out = null;
    for (let n = 0; n < 110; n++) {
      window.__pin(); window.__test.simulate(1 / 60);
      const cur = { x: b2.x, y: b2.y };
      if (b2.owner >= 0 && b2.owner !== window.__piScena) { out = { presa: true }; break; }
      if (cur.x >= stop) {
        const dx = (cur.x - prev.x) || 1e-9;
        out = { y: cur.y + (cur.y - prev.y) / dx * (window.__pianoX - cur.x),
                vAlPiano: Math.hypot(cur.x - prev.x, cur.y - prev.y) * 60 };
        break;
      }
      prev = cur;
    }
    window.__pallaAlPiede();
    return out || { persa: true };
  };
  const bt = t.pulsanti(0);
  const grande = bt.reduce((a, c) => (c.r || 0) > (a.r || 0) ? c : a, bt[0]);
  const sotto = document.elementFromPoint(grande.x, grande.y);
  if (!sotto || sotto.id !== 'gioco')
    return { errore: 'sul disco (' + grande.x + ',' + grande.y + ') non c\'e\' la tela ma ' + (sotto ? sotto.tagName + '#' + sotto.id : 'niente') };
  if (grande.act !== 'shot')
    return { errore: 'il disco grande offre «' + grande.act + '» invece di «shot»' };
  return { pi, FW, FH, GOAL_H: c0.GOAL_H, disco: { x: grande.x, y: grande.y, r: grande.r } };
}

const n2 = v => (v === null || v === undefined || !isFinite(v)) ? 'n/d' : (Math.round(v * 100) / 100).toString().replace('.', ',');

/* ===================================================================== */
(async () => {
  const srv = await servi();
  const br = await chromium.launch({ headless: !TESTA });
  const ctx = await br.newContext({ viewport: { width: 915, height: 412 },
    deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const eccezioni = [];

  /* LA MANO: due dita di protocollo. Ogni evento dichiara TUTTI i punti
     attivi, come fa il vetro di un telefono. Il SINISTRO (id 1) scende
     all'apertura della prova e non si alza mai. */
  function mano(cdp) {
    const S = { L: null, R: null };
    const pts = () => [S.L, S.R].filter(Boolean).map(p => ({ x: p.x, y: p.y, id: p.id }));
    const manda = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts() });
    return {
      async giuL(x, y) { S.L = { x, y, id: 1 }; await manda('touchStart'); },
      async muoviL(x, y) { S.L.x = x; S.L.y = y; await manda('touchMove'); },
      async giuR(x, y) { S.R = { x, y, id: 2 }; await manda('touchStart'); },
      async muoviR(x, y) { S.R.x = x; S.R.y = y; await manda('touchMove'); },
      /* ATTENZIONE, MISURATO: per il protocollo, in un touchEnd
         «touchPoints» sono i punti CHE SI ALZANO, non quelli che
         restano. Mandare il sinistro qui alzava il sinistro e lasciava
         il destro inchiodato sul disco: tutte le prove uscivano nulle. */
      async suR() { const r = S.R; S.R = null; await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [{ x: r.x, y: r.y, id: r.id }] }); },
      async fine() { try { S.L = null; S.R = null; await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] }); } catch (e) {} },
    };
  }

  const CASA_L = { x: 165, y: 272 };     // erba, lontano dai dischi (come _q-l11 prova E)

  async function apri(cfg) {
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
    const q = await pag.evaluate(preparaScena, cfg);
    if (q.errore) throw new Error('scena: ' + q.errore);
    const m = mano(cdp);
    const passo = n => pag.evaluate(k => window.__passoPin(k), n);
    /* il pollice sinistro scende e resta giu': 8 px di trascinamento —
       promosso a levetta, ma sotto la dead-zone: comando zero */
    await m.giuL(CASA_L.x, CASA_L.y);
    await passo(1);
    await m.muoviL(CASA_L.x + 8, CASA_L.y);
    await passo(2);
    return { pag, cdp, q, m, passo };
  }

  /* UN TIRO: pressione sul centro dichiarato del disco, trascinamento
     opzionale in 10 fotogrammi poi fermo (il campione anteriore di 60 ms
     legge la posizione assestata), rilascio, lettura del calcio dalla
     sonda. levetta = spostamento del pollice sinistro dalla sua origine
     (px), applicato PRIMA della pressione e riportato a 8 px dopo. */
  async function unTiro(ctx2, opts) {
    const { pag, q, m, passo } = ctx2;
    const P = q.disco;
    const riposa = await pag.evaluate(preparaScena, opts.cfg);
    if (riposa.errore) return { errore: riposa.errore };
    if (opts.levetta) { await m.muoviL(CASA_L.x + opts.levetta[0], CASA_L.y + opts.levetta[1]); await passo(2); }
    await pag.evaluate(() => { window.__sonda.calci = []; window.__sonda.tot = 0; });
    await m.giuR(P.x, P.y);
    if (opts.drag && opts.frames >= 12) {
      for (let k = 1; k <= 10; k++) {
        await passo(1);
        await m.muoviR(P.x + opts.drag[0] * k / 10, P.y + opts.drag[1] * k / 10);
      }
      await passo(opts.frames - 10);
    } else {
      await passo(opts.frames);
    }
    const prima = await pag.evaluate(() => ({
      carica: window.__test.G.players[window.__piScena].charge,
      disco: window.__test.pulsanti(0).reduce((a, c) => (c.r || 0) > (a.r || 0) ? c : a).act,
      tiri: window.__test.G.stats.tiri[0],
    }));
    await m.suR();
    const calcio = await pag.evaluate(() => {
      const S = window.__sonda, k = window.__piScena, G = window.__test.G;
      const miei = S.calci.filter(c => c.chi === k);
      return miei.length ? { v: Math.hypot(miei[0].vx, miei[0].vy),
                             ang: Math.atan2(miei[0].vy, miei[0].vx) * 180 / Math.PI,
                             vz: G.ball.vz, n: miei.length, tiri: G.stats.tiri[0] } : null;
    });
    let volo = null;
    if (opts.volo && calcio) volo = await pag.evaluate(() => window.__volo());
    else await pag.evaluate(() => window.__pallaAlPiede());
    if (opts.levetta) { await m.muoviL(CASA_L.x + 8, CASA_L.y); await passo(2); }
    return { prima, calcio, volo };
  }

  const esiti = [];
  const righe = [];
  const stampa = s => { righe.push(s); console.log(s); };

  stampa('=== CANCELLO L1.3 — mira del tiro e potenza continua ===');
  stampa('  gioco: ' + GIOCO);
  stampa('  banco: Chromium 915x412 dpr2, DUE dita di protocollo (il sinistro non si alza mai),');
  stampa('         simulazione a passo fisso 1/60, Math.random a seme 20260819, avversari inchiodati');
  stampa('');

  /* -------------------------------------------------------------------
     A — LA MIRA NELLA BOCCA: cinque trascinamenti, una curva.
     ------------------------------------------------------------------- */
  let okA = null;
  {
    const cfgA = c => ({ x: c.FW - 90, y: c.FH / 2 });
    const ctx2 = await apri({ x: 1060, y: 322 });     // primo giro col campo vero
    const { q } = ctx2;
    const cfg = cfgA(q);
    const T = [-26, -13, 0, 13, 26];
    const punti = [];
    stampa('A) LA MIRA — tenuta 0,65 s (dentro la finestra), trascinamento (-46, T) px, y al piano x = FW-2');
    for (const tt of T) {
      const r = await unTiro(ctx2, { cfg, frames: 39, drag: [-46, tt], volo: true });
      if (r.errore || !r.calcio || !r.volo || r.volo.persa || r.volo.presa) {
        punti.push({ T: tt, y: null, err: r.errore || (r.calcio ? 'volo interrotto' : 'nessun calcio') });
      } else punti.push({ T: tt, y: r.volo.y - q.FH / 2, v: r.calcio.v, carica: r.prima.carica });
    }
    for (const p of punti)
      stampa('   T ' + String(p.T).padStart(4) + ' px  ->  y-centro ' + (p.y === null ? ('NULLA: ' + p.err) : n2(p.y) + ' unita\'' +
             '  (carica ' + n2(p.carica) + ' s, velocita\' ' + n2(p.v) + ')'));
    const buoni = punti.filter(p => p.y !== null);
    if (buoni.length < 5) { okA = null; stampa('   PROVA NULLA: ' + (5 - buoni.length) + ' voli non misurati'); }
    else {
      let mono = true;
      for (let i = 1; i < buoni.length; i++) if (!(buoni[i].y > buoni[i - 1].y + 4)) mono = false;
      const span = buoni[4].y - buoni[0].y;
      const centro = Math.abs(buoni[2].y);
      okA = mono && span >= 60 && centro <= 12;
      stampa('   escursione da capo a capo ' + n2(span) + ' unita\' (bocca ' + n2(q.GOAL_H) + ') · monotona: ' + (mono ? 'si\'' : 'NO') +
             ' · |y(0)| ' + n2(centro));
      stampa('   soglia: monotona, escursione >= 60, |y(0)| <= 12   ->  ' + (okA ? 'VERDE' : 'ROSSO'));
    }
    await ctx2.m.fine(); await ctx2.pag.close();
    esiti.push({ id: 'A', nome: 'la mira nella bocca risponde al trascinamento', ok: okA });
    stampa('');
  }

  /* -------------------------------------------------------------------
     B — LA RAMPA DI POTENZA: dieci tenute, dieci velocita'.
     Il tap (4 fotogrammi) parte con la levetta VERSO la porta: la
     pizzata prende la direzione da li'. Le tenute lunghe con la levetta
     zitta e il trascinamento (-46, 0): mira al centro, f = 0.
     ------------------------------------------------------------------- */
  let okB = null, saltoOggi = null;
  {
    const ctx2 = await apri({ x: 1060, y: 322 });
    const { q } = ctx2;
    const cfg = { x: q.FW - 90, y: q.FH / 2 };
    const FR = [4, 12, 19, 26, 33, 40, 47, 54, 61, 68];
    const vv = [];
    stampa('B) LA RAMPA — velocita\' del pallone al calcio, per dieci tenute (p.tiro 62: fatt = 1)');
    for (const f of FR) {
      const tap = f < 12;
      const r = await unTiro(ctx2, { cfg, frames: f,
        drag: tap ? null : [-46, 0],
        levetta: tap ? [40, 0] : null, volo: false });
      if (r.errore || !r.calcio) vv.push({ f, v: null, err: r.errore || 'nessun calcio' });
      else vv.push({ f, c: r.prima.carica, v: r.calcio.v });
    }
    /* la CARICA MISURATA al rilascio, non quella nominale del banco: il
       gelo del tiro perfetto (0,075 s di fermo d'impatto) congela anche
       l'accumulatore del tiro successivo, quindi tenere N fotogrammi
       non garantisce N/60 di carica. Il verdetto va dato su cio' che il
       gioco ha misurato, non su cio' che il banco ha chiesto. */
    for (const p of vv)
      stampa('   tenuta chiesta ' + n2(p.f / 60) + ' s · carica misurata ' + (p.c === undefined ? 'n/d' : n2(p.c) + ' s') +
             '  ->  ' + (p.v === null ? ('NULLA: ' + p.err) : n2(p.v) + ' unita\'/s'));
    const buoni = vv.filter(p => p.v !== null);
    /* la monotonia si giudica sulla carica MISURATA: e' lei la variabile
       della rampa, non il conto dei fotogrammi del banco */
    buoni.sort((a, b) => (a.c === undefined ? a.f / 60 : a.c) - (b.c === undefined ? b.f / 60 : b.c));
    if (buoni.length < 10) { okB = null; stampa('   PROVA NULLA: ' + (10 - buoni.length) + ' calci non misurati'); }
    else {
      let mono = true, maxSalto = 0;
      for (let i = 1; i < buoni.length; i++) {
        if (buoni[i].v < buoni[i - 1].v - 0.5) mono = false;
        maxSalto = Math.max(maxSalto, Math.abs(buoni[i].v - buoni[i - 1].v));
      }
      const span = buoni[9].v - buoni[0].v;
      saltoOggi = maxSalto;
      okB = mono && span >= 100 && maxSalto <= 0.35 * Math.max(1, span);
      stampa('   escursione ' + n2(span) + ' · salto adiacente massimo ' + n2(maxSalto) +
             ' (tetto 35% dell\'escursione = ' + n2(0.35 * span) + ') · monotona: ' + (mono ? 'si\'' : 'NO'));
      stampa('   soglia: monotona, escursione >= 100, nessun gradino  ->  ' + (okB ? 'VERDE' : 'ROSSO'));
    }
    await ctx2.m.fine(); await ctx2.pag.close();
    esiti.push({ id: 'B', nome: 'la potenza e\' una rampa continua della tenuta', ok: okB });
    stampa('');
  }

  /* -------------------------------------------------------------------
     C — L'ANELLO AGGIUNGE PRECISIONE: 12 rilasci per braccio, mira al
     centro (trascinamento -46,0), dispersione RMS dalla y MIRATA.
     ------------------------------------------------------------------- */
  let okC = null;
  {
    const ctx2 = await apri({ x: 1060, y: 322 });
    const { q } = ctx2;
    const cfg = { x: q.FW - 90, y: q.FH / 2 };
    async function braccio(nome, frames) {
      const errs = [], vels = [];
      for (let i = 0; i < 12; i++) {
        const r = await unTiro(ctx2, { cfg, frames, drag: [-46, 0], volo: true });
        if (r.errore || !r.calcio || !r.volo || r.volo.persa || r.volo.presa) continue;
        errs.push(Math.abs(r.volo.y - q.FH / 2));
        vels.push(r.calcio.v);
      }
      const rms = errs.length ? Math.sqrt(errs.reduce((a, e) => a + e * e, 0) / errs.length) : null;
      const vm = vels.length ? vels.reduce((a, v) => a + v, 0) / vels.length : null;
      return { nome, n: errs.length, rms, vm };
    }
    const bIn = await braccio('ambra (0,78 s)', 47);
    const bPre = await braccio('presto (0,45 s)', 27);
    const bTar = await braccio('tardi (1,10 s)', 66);
    stampa('C) LA PRECISIONE — dispersione RMS dalla y mirata (il centro), al piano della porta');
    for (const b of [bIn, bPre, bTar])
      stampa('   ' + b.nome + ':  ' + b.n + '/12 voli,  RMS ' + n2(b.rms) + ' unita\',  velocita\' media ' + n2(b.vm));
    if (bIn.n < 10 || bPre.n < 10 || bTar.n < 10) { okC = null; stampa('   PROVA NULLA: troppi voli persi'); }
    else {
      const pariPotenza = Math.abs(bIn.vm - bTar.vm) <= 0.03 * bTar.vm;
      okC = bIn.rms <= 8 && bPre.rms >= bIn.rms + 10 && bTar.rms >= bIn.rms + 10 && pariPotenza;
      stampa('   parita\' di potenza ambra/tardi (entro il 3%): ' + (pariPotenza ? 'si\'' : 'NO — scarto ' +
             n2(Math.abs(bIn.vm - bTar.vm) / bTar.vm * 100) + '%'));
      stampa('   soglia: RMS ambra <= 8, presto e tardi >= ambra+10, pari potenza  ->  ' + (okC ? 'VERDE' : 'ROSSO'));
    }
    await ctx2.m.fine(); await ctx2.pag.close();
    esiti.push({ id: 'C', nome: 'l\'anello compra precisione, non potenza', ok: okC });
    stampa('');
  }

  /* -------------------------------------------------------------------
     D — LA PIZZATA: tap (4 fotogrammi) con la levetta verso la porta,
     da distanza da mischia (FW-55).
     ------------------------------------------------------------------- */
  let okD = null;
  {
    const ctx2 = await apri({ x: 1060, y: 322 });
    const { q } = ctx2;
    const cfg = { x: q.FW - 55, y: q.FH / 2 };
    const r = await unTiro(ctx2, { cfg, frames: 4, levetta: [40, 0], volo: true });
    stampa('D) LA PIZZATA — tap di ' + n2(4 / 60) + ' s con la levetta verso la porta, da ' + n2(55) + ' unita\'');
    if (r.errore) { okD = null; stampa('   PROVA NULLA: ' + r.errore); }
    else if (!r.calcio) { okD = false; stampa('   nessun calcio del comandato  ->  ROSSO'); }
    else {
      const versoPorta = Math.abs(r.calcio.ang) <= 30;
      const arrivato = r.volo && !r.volo.persa && !r.volo.presa;
      okD = r.calcio.v >= 320 && versoPorta && arrivato;
      stampa('   velocita\' al calcio ' + n2(r.calcio.v) + ' unita\'/s (il tocco corto di ieri: 300 fisse; il tuffo del portiere: da 300)');
      stampa('   direzione ' + n2(r.calcio.ang) + ' gradi dalla porta · arriva al piano: ' + (arrivato ? ('si\', a ' + n2(r.volo.vAlPiano) + ' unita\'/s') : 'NO') +
             ' · tiri a tabellino: ' + r.prima.tiri + ' -> ' + r.calcio.tiri + ' (contesto, non verdetto)');
      stampa('   soglia: velocita\' >= 320, entro 30 gradi, arriva  ->  ' + (okD ? 'VERDE' : 'ROSSO'));
    }
    await ctx2.m.fine(); await ctx2.pag.close();
    esiti.push({ id: 'D', nome: 'il tap e\' un tiro vero: il gol da mischia esiste', ok: okD });
    stampa('');
  }

  /* -------------------------------------------------------------------
     E — NON REGRESSIONE del pallonetto (dev'essere verde ANCHE OGGI).
     ------------------------------------------------------------------- */
  let okE = null;
  {
    const ctx2 = await apri({ x: 1060, y: 322 });
    const { q } = ctx2;
    const cfg = { x: q.FW - 250, y: q.FH / 2 };
    const r1 = await unTiro(ctx2, { cfg, frames: 39, levetta: [-40, 0], volo: false });
    const r2 = await unTiro(ctx2, { cfg, frames: 39, levetta: [70, 0], volo: false });
    stampa('E) NON REGRESSIONE — il pallonetto e\' la levetta INDIETRO, mai lo sprint');
    if (r1.errore || r2.errore || !r1.calcio || !r2.calcio) {
      okE = null;
      stampa('   PROVA NULLA: ' + (r1.errore || r2.errore || 'calcio mancante'));
    } else {
      okE = r1.calcio.vz >= 160 && r2.calcio.vz <= 130;
      stampa('   levetta indietro (40 px):        b.vz ' + n2(r1.calcio.vz) + '  (pallonetto: >= 160)');
      stampa('   levetta avanti a fondo corsa (70 px, sprint): b.vz ' + n2(r2.calcio.vz) + '  (tiro raso: <= 130)');
      stampa('   ->  ' + (okE ? 'VERDE' : 'ROSSO'));
    }
    await ctx2.m.fine(); await ctx2.pag.close();
    esiti.push({ id: 'E', nome: 'pallonetto: levetta indietro si\', sprint no', ok: okE });
    stampa('');
  }

  await br.close(); srv.chiudi();

  const rossi = esiti.filter(e => e.ok === false);
  const nulle = esiti.filter(e => e.ok === null);
  const verdi = esiti.filter(e => e.ok === true);
  stampa('--- ESITO ---');
  for (const e of esiti) stampa('  ' + (e.ok === null ? 'NULLA' : (e.ok ? 'VERDE' : 'ROSSO')) + '  ' + e.id + '  ' + e.nome);
  if (eccezioni.length) stampa('  eccezioni in pagina: ' + eccezioni.length + ' — ' + eccezioni.slice(0, 3).join(' | '));
  stampa('verdi ' + verdi.length + ' · rossi ' + rossi.length + ' · nulle ' + nulle.length + ' · su ' + esiti.length);
  if (rossi.length) stampa('CANCELLO ROSSO: ' + rossi.length + ' controlli falliti.');
  else if (nulle.length) stampa('CANCELLO NON CONCLUSO: ' + nulle.length + ' prove nulle — da riparare e\' il banco.');
  else stampa('CANCELLO VERDE: ' + esiti.length + ' controlli su ' + esiti.length + '.');
  process.exit(rossi.length ? 1 : (nulle.length ? 3 : 0));
})().catch(e => { console.error('FALLITO: ' + (e && e.stack || e)); process.exit(2); });
