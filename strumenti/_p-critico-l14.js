/* =====================================================================
   _p-critico-l14.js — LA SONDA DEL CRITICO DI L1.4. Due misure che il
   cancello _q-l14.js NON fa:

   R) IL RI-ARMO SUL VERBO 'through'. Un altro critico ha misurato che il
      ri-armo di L1.1 azzera la tenuta (R_ARMA crolla a 22 px) e il dito
      che corregge la propria deriva arma un atto non voluto: 8/20 sulla
      scivolata. Qui si misura la stessa scena sul passaggio:
        - dito giu' sul disco piccolo in contesto LORO (verbo 'swap');
        - il mondo cambia: la palla passa al comandato (contesto IO);
        - il ri-armo scatta ('swap' -> 'through');
        - braccio DERIVA: correzione di 28 px, rilascio rapido (0,2 s):
          parte un passaggio non voluto? (si contano i CALCI veri, dalla
          sonda su kickBall);
        - braccio MIRA: trascinamento DELIBERATO di 46 px verso un
          compagno e rilascio: parte il passaggio VOLUTO?
        - braccio CONTROLLO: stessa scena, ma il dito si ALZA e ripreme
          dopo il cambio di contesto, stesso trascinamento: parte?
      Se DERIVA=0 e MIRA=0 e CONTROLLO>0, il ri-armo su 'through' non
      produce l'atto non voluto MA produce un dito MORTO: il verbo
      ri-armato non puo' passare mai (apriPassaggioL14 vive solo in
      Touch5.start).

   C) LA CAROTA CLAMPATA (la classe di difetto del critico di L2.3):
      chiamaCorsaL14 clampa la destinazione a [30, FW-30]x[30, FH-30].
      Compagno vicino alla riga laterale, chiamata verso la riga
      (chiama-senza-passare, oltre 96 px): dove corre, e quanto tempo
      resta FERMO sul bordo mentre la chiamata vive? Confronto con un
      compagno al centro.

   uso: node strumenti/_p-critico-l14.js [--gioco fuori/critico-l14.html]
   Banco: Chromium 915x412 dpr2, dita di protocollo, passo fisso 1/60,
   Math.random a seme fisso (modello _q-l14.js). Solo diagnosi: stampa
   numeri, esce 0 sempre (il verdetto lo scrive il critico, non la sonda).
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
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'fuori', 'critico-l14.html')));
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };

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

const dito = {
  giu:    (cdp, x, y) => cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }),
  sposta: (cdp, x, y) => cdp.send('Input.dispatchTouchEvent', { type: 'touchMove',  touchPoints: [{ x, y }] }),
  su:     cdp => cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }),
  suSicuro: async cdp => { try { await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); } catch (e) {} },
};

function installaSonda() {
  if (window.__sonda) return 'gia';
  if (typeof window.kickBall !== 'function') return 'BANCO INVECCHIATO: kickBall non esiste';
  const G = window.__test.G;
  const S = { calci: [], tot: 0 };
  window.__sonda = S;
  const orig = window.kickBall;
  window.kickBall = function (p, nx, ny, speed, spinY) {
    const r = orig.call(this, p, nx, ny, speed, spinY);
    S.tot++;
    if (r) S.calci.push({ chi: G.players.indexOf(p) });
    return r;
  };
  return 'ok';
}

/* SCENA LORO: partita in gioco, palla IN PIEDI a un avversario lontano,
   comandato al centro. Il disco piccolo deve offrire 'swap'. */
function scenaLoro() {
  const t = window.__test, G = t.G;
  try { t.dismissSplash && t.dismissSplash(); } catch (e) {}
  t.setPaused && t.setPaused(false);
  try { if (t.Tut && t.Tut.active && t.Tut.finish) t.Tut.finish(true); } catch (e) {}
  for (let giro = 0; giro < 3 && G.scene !== 'play'; giro++) {
    for (let i = 0; i < 200 && G.scene !== 'play'; i++) t.simulate(0.1);
    if (G.scene !== 'play') { t.startMatch(1, 1, { size: 5 }); for (let i = 0; i < 80 && G.scene !== 'play'; i++) t.simulate(0.1); }
  }
  if (G.scene !== 'play') return { errore: "scena '" + G.scene + "'" };
  t.setTimeLeft && t.setTimeLeft(80);
  const pi = G.ctrl[0];
  if (pi < 0) return { errore: 'nessun comandato' };
  const p = G.players[pi];
  const C = t.campo;
  if (p.charge !== undefined && p.charge >= 0) { p.charge = -1; p.chargeKind = 'tiro'; p.chargeT = 0; p.chargeGo = null; p.chargeClip = null; }
  p.slide = -1; p.recover = 0;
  for (const q of G.players) { q.vx = 0; q.vy = 0; if (q.chiamataT !== undefined) q.chiamataT = 0; }
  p.x = C.FW * 0.42; p.y = C.FH * 0.5;
  /* la palla in piedi a un avversario di movimento, lontano e inchiodato */
  let avv = -1;
  for (let i = 0; i < G.players.length; i++) {
    const q = G.players[i];
    if (q.team === 1 && q.role !== 'gk' && q.out <= 0) { avv = i; break; }
  }
  if (avv < 0) return { errore: 'nessun avversario di movimento' };
  const a = G.players[avv];
  a.x = Math.min(C.FW - 24, p.x + 430); a.y = p.y;
  const b = G.ball;
  b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0; b.curve = 0; b.passTo = -1; b.crossTo = -1;
  b.owner = avv; b.x = a.x + 8; b.y = a.y;
  for (const q of G.players) {
    if (q.team === 1 && q.out <= 0) { q.aiT = 30; q.aiTX = q.x; q.aiTY = q.y; }
    if (q.team === 0 && q.out <= 0) { q.aiT = 30; q.aiTX = q.x; q.aiTY = q.y; }
  }
  window.__sonda.calci = []; window.__sonda.tot = 0;
  const bt = t.pulsanti(0);
  const piccolo = bt.reduce((x, c) => (c.r || 0) < (x.r || 0) ? c : x, bt[0]);
  const sotto = document.elementFromPoint(piccolo.x, piccolo.y);
  if (!sotto || sotto.id !== 'gioco') return { errore: 'sul disco non c\'e\' la tela' };
  return { pi, disco: { x: piccolo.x, y: piccolo.y }, act: piccolo.act, FW: C.FW, FH: C.FH };
}

/* L'INIEZIONE: mentre il dito e' giu', la palla passa al comandato.
   Compagni nelle posizioni chieste, avversari spinti via e inchiodati.
   E' lo stesso genere di scrittura di stato che fa preparaScena del
   cancello. Torna la fotografia dei compagni di movimento. */
function iniettaPossesso(mates) {
  const t = window.__test, G = t.G, C = t.campo;
  const pi = G.ctrl[0];
  if (pi < 0) return { errore: 'nessun comandato' };
  const p = G.players[pi];
  if (p.charge !== undefined && p.charge >= 0) { p.charge = -1; p.chargeKind = 'tiro'; p.chargeT = 0; p.chargeGo = null; p.chargeClip = null; }
  p.slide = -1; p.recover = 0;
  p.x = C.FW * 0.42; p.y = C.FH * 0.5; p.vx = 0; p.vy = 0;
  const b = G.ball;
  b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0; b.curve = 0; b.passTo = -1; b.crossTo = -1;
  b.owner = pi; b.x = p.x + 8; b.y = p.y;
  const mi = [];
  for (let i = 0; i < G.players.length; i++) {
    const q = G.players[i];
    if (q.team === 0 && i !== pi && q.role !== 'gk' && q.out <= 0) mi.push(i);
  }
  mates.forEach((m, k) => {
    if (k < mi.length) {
      const q = G.players[mi[k]];
      q.x = Math.max(24, Math.min(C.FW - 24, p.x + m[0]));
      q.y = Math.max(20, Math.min(C.FH - 20, p.y + m[1]));
      q.vx = 0; q.vy = 0; q.aiT = 0.06; q.aiTX = q.x; q.aiTY = q.y;
      if (q.chiamataT !== undefined) q.chiamataT = 0;
    }
  });
  for (const q of G.players) {
    if (q.team !== 0 && q.out <= 0) {
      const d = Math.hypot(q.x - b.x, q.y - b.y);
      if (d < 390) {
        const l = Math.max(1, d);
        q.x = Math.max(24, Math.min(C.FW - 24, b.x + (q.x - b.x) / l * 400));
        q.y = Math.max(20, Math.min(C.FH - 20, b.y + (q.y - b.y) / l * 400));
      }
      q.vx = 0; q.vy = 0; q.aiT = 30; q.aiTX = q.x; q.aiTY = q.y;
    }
  }
  window.__sonda.calci = []; window.__sonda.tot = 0;
  return { pi, mates: mi };
}

const n1 = v => (v === null || v === undefined || !isFinite(v)) ? 'n/d' : (Math.round(v * 10) / 10).toString().replace('.', ',');

(async () => {
  const srv = await servi();
  const br = await chromium.launch({ headless: true });
  const ctx = await br.newContext({ viewport: { width: 915, height: 412 },
    deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const eccezioni = [];

  async function apri(seme) {
    const pag = await ctx.newPage();
    await pag.addInitScript(s0 => {
      let s = s0 >>> 0 || 1;
      const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
      Math.random = () => p() / 4294967296;
    }, seme || 20260820);
    await pag.addInitScript(bancoDiProva);
    pag.on('pageerror', e => eccezioni.push(e.message));
    await pag.goto('http://127.0.0.1:' + srv.porta + '/CALCETTO-il-gioco.html', { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(() => window.__banco.passo(6));
    const sonda = await pag.evaluate(installaSonda);
    if (sonda !== 'ok' && sonda !== 'gia') { console.error('FALLITO (banco): ' + sonda); process.exit(2); }
    const cdp = await ctx.newCDPSession(pag);
    const passo = n => pag.evaluate(k => window.__banco.passo(k), n);
    return { pag, cdp, passo };
  }

  const MATES = [[150, 0], [-120, 10], [30, -160]];   /* la scala del cancello */

  /* -------------------------------------------------------------------
     R — IL RI-ARMO SU 'through'
     ------------------------------------------------------------------- */
  const SOLO_CAROTA = process.argv.includes('--solo-carota');
  console.log('=== R) IL RI-ARMO SUL PASSAGGIO ===');
  console.log('  gioco: ' + GIOCO);
  if (SOLO_CAROTA) console.log('  (saltato: --solo-carota)');
  async function provaRiarmo(modo, k) {
    const { pag, cdp, passo } = await apri(30001 + k * 7);
    const q = await pag.evaluate(scenaLoro);
    if (q.errore) { await pag.close(); return { errore: q.errore }; }
    if (q.act !== 'swap') { await pag.close(); return { errore: 'il disco piccolo offre <' + q.act + '> invece di <swap>' }; }
    const P = q.disco;
    await dito.giu(cdp, P.x, P.y);       /* esegue cambiaGiocatore alla pressione: e' il contesto LORO */
    await passo(10);
    const inj = await pag.evaluate(iniettaPossesso, MATES);
    if (inj.errore) { await pag.close(); return { errore: inj.errore }; }
    await passo(2);                       /* qui il ri-armo 'swap' -> 'through' scatta in Touch5.passo */
    const verbo = await pag.evaluate(() => {
      const bt = window.__test.pulsanti(0);
      const pk = bt.reduce((x, c) => (c.r || 0) < (x.r || 0) ? c : x, bt[0]);
      return pk.act;
    });
    let mossa;
    if (modo === 'controllo') {
      /* il dito si alza e ripreme: pressione FRESCA sul verbo nuovo */
      await dito.su(cdp);
      await passo(2);
      await dito.giu(cdp, P.x, P.y);
      await passo(1);
      mossa = 'fresca';
    }
    /* la mossa: DERIVA = correzione di 28 px in direzione k*18 gradi,
       rilascio a 0,2 s (R_ARMA ~26,6: la correzione E' armata, come
       nella misura della scivolata). MIRA/CONTROLLO = 46 px deliberati
       verso il compagno davanti. */
    if (modo === 'deriva') {
      const ang = k * 18 * Math.PI / 180, ux = Math.cos(ang), uy = Math.sin(ang);
      for (let i = 1; i <= 3; i++) { await passo(1); await dito.sposta(cdp, P.x + ux * 28 * i / 3, P.y + uy * 28 * i / 3); }
      for (let i = 0; i < 9; i++) await passo(1);
    } else {
      for (let i = 1; i <= 4; i++) { await passo(1); await dito.sposta(cdp, P.x + 46 * i / 4, P.y); }
      for (let i = 0; i < 8; i++) await passo(1);
    }
    const chiamatiPrima = await pag.evaluate(() =>
      window.__test.G.players.filter(z => z.chiamataT > 0).length);
    await dito.su(cdp);
    await passo(6);
    const esito = await pag.evaluate(pi0 => {
      const G = window.__test.G;
      return { calci: window.__sonda.calci.filter(c => c.chi === pi0).length,
               owner: G.ball.owner,
               chiamati: G.players.filter(z => z.chiamataT > 0).length };
    }, inj.pi);
    await dito.suSicuro(cdp);
    await pag.close();
    return { verbo, calci: esito.calci, owner: esito.owner, pi: inj.pi,
             chiamati: Math.max(chiamatiPrima, esito.chiamati) };
  }

  for (const modo of SOLO_CAROTA ? [] : ['deriva', 'mira', 'controllo']) {
    let calciTot = 0, prove = 0, chiamateTot = 0, verbiGiusti = 0, errori = [];
    for (let k = 0; k < 20; k++) {
      const r = await provaRiarmo(modo, k);
      if (r.errore) { errori.push(r.errore); continue; }
      prove++;
      if (r.calci > 0) calciTot++;
      if (r.chiamati > 0) chiamateTot++;
      if (r.verbo === 'through') verbiGiusti++;
    }
    console.log('  braccio ' + modo.toUpperCase().padEnd(9) +
      ' prove valide ' + prove + '/20' +
      ' · il disco offriva <through> dopo il cambio: ' + verbiGiusti + '/' + prove +
      ' · rilasci che CALCIANO: ' + calciTot + '/' + prove +
      ' · tenute con un chiamato in corsa (chiamataT>0): ' + chiamateTot + '/' + prove +
      (errori.length ? ' · errori: ' + errori.slice(0, 2).join('; ') : ''));
  }
  console.log('');

  /* -------------------------------------------------------------------
     C — LA CAROTA CLAMPATA AL BORDO
     ------------------------------------------------------------------- */
  console.log('=== C) LA CAROTA CLAMPATA — chiamata verso la riga laterale ===');
  /* scena come il cancello (preparaScena semplificata): qui riuso
     iniettaPossesso su una partita gia' in play, senza contesto LORO. */
  async function provaCarota(nome, mateBersaglio, seme) {
    const { pag, cdp, passo } = await apri(seme);
    const q0 = await pag.evaluate(scenaLoro);      /* porta la partita in play */
    if (q0.errore) { await pag.close(); return { errore: q0.errore }; }
    /* niente dito in LORO: si inietta subito il possesso al comandato */
    const inj = await pag.evaluate(iniettaPossesso, mateBersaglio.mates);
    if (inj.errore) { await pag.close(); return { errore: inj.errore }; }
    await passo(2);
    const sc = await pag.evaluate(() => {
      const t = window.__test, G = t.G;
      const bt = t.pulsanti(0);
      const pk = bt.reduce((x, c) => (c.r || 0) < (x.r || 0) ? c : x, bt[0]);
      return { act: pk.act, x: pk.x, y: pk.y, FH: t.campo.FH, FW: t.campo.FW };
    });
    if (sc.act !== 'through') { await pag.close(); return { errore: 'disco <' + sc.act + '>' }; }
    const bi = inj.mates && inj.mates[mateBersaglio.indice];
    if (bi === undefined || bi === null) { await pag.close(); return { errore: 'bi mancante: inj=' + JSON.stringify(inj) }; }
    /* direzione del trascinamento: dal portatore al compagno bersaglio, in px CSS */
    const dir = await pag.evaluate(([pi0, bi0]) => {
      const G = window.__test.G;
      const p = G.players[pi0], m = G.players[bi0];
      if (!p || !m) return { errore: 'giocatori: pi0=' + pi0 + ' bi0=' + bi0 + ' n=' + G.players.length };
      const dx = m.x - p.x, dy = m.y - p.y, l = Math.max(1, Math.hypot(dx, dy));
      return [dx / l, dy / l, m.x, m.y];
    }, [inj.pi, bi]);
    if (dir && dir.errore) { await pag.close(); return { errore: dir.errore }; }
    await dito.giu(cdp, sc.x, sc.y);
    /* fino a 60 px (armato, chiamata partita), poi oltre 96 (l'atto muore:
       chiama-senza-passare), rilascio: nessun calcio, la corsa resta */
    for (let i = 1; i <= 6; i++) { await passo(1); await dito.sposta(cdp, sc.x + dir[0] * 60 * i / 6, sc.y + dir[1] * 60 * i / 6); }
    for (let i = 0; i < 4; i++) await passo(1);
    const chiamata = await pag.evaluate(bi0 => {
      const m = window.__test.G.players[bi0];
      if (!m) return { errore: 'chiamata: G.players[' + bi0 + '] non esiste' };
      return { t: m.chiamataT, cx: m.chiamataX, cy: m.chiamataY, x0: m.x, y0: m.y };
    }, bi);
    if (chiamata.errore) { await pag.close(); return { errore: chiamata.errore }; }
    for (let i = 1; i <= 4; i++) { await passo(1); await dito.sposta(cdp, sc.x + dir[0] * 120 * i / 4, sc.y + dir[1] * 120 * i / 4); }
    await dito.su(cdp);
    /* si segue il chiamato per 2 s a passi di 0,1 s: posizione e velocita' */
    const traccia = await pag.evaluate(bi0 => {
      const t = window.__test, G = t.G, m = G.players[bi0];
      if (!m) return { errore: 'traccia: G.players[' + bi0 + '] non esiste (n=' + G.players.length + ')' };
      const T = [];
      for (let s = 0; s < 20; s++) {
        for (let f = 0; f < 6; f++) t.simulate(1 / 60);
        T.push({ x: m.x, y: m.y, v: Math.hypot(m.vx, m.vy), ct: m.chiamataT || 0 });
      }
      return { T, calci: window.__sonda.calci.length };
    }, bi);
    await dito.suSicuro(cdp);
    await pag.close();
    if (traccia.errore) return { errore: traccia.errore };
    /* quanti decimi di secondo il chiamato sta FERMO (v<15) mentre la
       chiamata vive, e dove */
    let fermi = 0, ymin = 1e9, finale = traccia.T[traccia.T.length - 1];
    let percorso = 0, prev = { x: chiamata.x0, y: chiamata.y0 };
    for (const s of traccia.T) {
      if (s.ct > 0 && s.v < 15) fermi++;
      if (s.y < ymin) ymin = s.y;
      percorso += Math.hypot(s.x - prev.x, s.y - prev.y);
      prev = s;
    }
    return { nome, chiamata, finale, fermi, ymin, percorso, FH: sc.FH, calci: traccia.calci,
             partenza: { x: chiamata.x0, y: chiamata.y0 } };
  }

  /* bordo: il compagno davanti-alto, a 60 unita' dalla riga in alto
     (offset y = 60 - FH/2 con FH letto dalla prima pagina). Serve FH:
     lo leggo con una pagina usa-e-getta. */
  const { pag: pgF } = await apri(1);
  const FH = await pgF.evaluate(() => window.__test.campo.FH);
  const FW = await pgF.evaluate(() => window.__test.campo.FW);
  await pgF.close();
  console.log('  campo: FW=' + FW + '  FH=' + FH + '  (il morsetto della chiamata e\' [30, FW-30]x[30, FH-30])');

  const scenari = [
    { nome: 'BORDO ', mates: [[150, 60 - FH / 2], [-120, 10], [30, -160]], indice: 0 },
    { nome: 'CENTRO', mates: [[150, -100], [-120, 10], [30, -160]], indice: 0 },
  ];
  for (const s of scenari) {
    for (const seme of [40001, 40007]) {
      const r = await provaCarota(s.nome, s, seme);
      if (r.errore) { console.log('  ' + s.nome + ' seme ' + seme + ': ERRORE ' + r.errore); continue; }
      console.log('  ' + r.nome + ' seme ' + seme +
        '  parte da (' + n1(r.partenza.x) + ', ' + n1(r.partenza.y) + ')' +
        '  carota (' + n1(r.chiamata.cx) + ', ' + n1(r.chiamata.cy) + ')' +
        '  y minima raggiunta ' + n1(r.ymin) +
        '  finale (' + n1(r.finale.x) + ', ' + n1(r.finale.y) + ')' +
        '  fermo con chiamata viva: ' + n1(r.fermi / 10) + ' s' +
        '  percorso ' + n1(r.percorso) + ' u' +
        '  calci dopo annullo: ' + r.calci);
    }
  }

  await br.close(); srv.chiudi();
  if (eccezioni.length) console.log('  ECCEZIONI DI PAGINA: ' + eccezioni.slice(0, 5).join(' | '));
  process.exit(0);
})().catch(e => { console.error('LA SONDA E\' CADUTA: ' + (e && e.stack || e)); process.exit(2); });
