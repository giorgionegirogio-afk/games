/* =====================================================================
   _crit9-cmd2.js — IL BANCO AVVERSARIO della famiglia 2 (verbo trascinato)

   Va a cercare quello che _q-cmd2.js NON guarda:
     A) le TRE TAGLIE (5, 7, 11): il pallonetto chiesto e la quota del
        passaggio alto su campi diversi da quello a 5.
     B) LA SQUADRA 1 (due giocatori umani): i dischi della squadra 1
        devono fare la stessa cosa.
     C) L'ARCO DEL PALLONETTO NEI PIXEL — _q-cmd2 C6 misura solo l'arco
        del PASSAGGIO. L'arco AMBRA del tiro non ha nessun cancello.
     D) PROMESSA CONTRO ESECUZIONE del pallonetto: dove finisce l'arco
        dichiarato e dove cade davvero il pallone.
     E) IL PALLONETTO DA TASTIERA (levetta indietro) — l'agente dice
        «parola per parola come ieri» e _q-l13 prova E meta' 1 e' rossa,
        quindi nessun cancello lo guarda piu'.
     F) LA FINESTRA UTILE del gesto: da 66 a R_ANNULLA=96 px.

   uso: node strumenti/_crit9-cmd2.js --gioco fuori/cmd-seconda.html
        --solo A,B,C,D,E,F
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
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'fuori', 'cmd-seconda.html')));
const SOLO = arg('solo', '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
const fai = c => !SOLO.length || SOLO.indexOf(c.toUpperCase()) >= 0;
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
               '.png': 'image/png', '.json': 'application/json' };
const Z_LOB = 20;

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
  giu:  (cdp, pts) => cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts }),
  muovi:(cdp, pts) => cdp.send('Input.dispatchTouchEvent', { type: 'touchMove',  touchPoints: pts }),
  su:   (cdp, pts) => cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd',   touchPoints: pts || [] }),
  sicuro: async cdp => { try { await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); } catch (e) {} },
};

/* la scena, uguale a quella di _q-cmd2 ma con TAGLIA e SQUADRA a scelta */
function preparaScena(cfg) {
  const t = window.__test, G = t.G;
  const SQ = cfg.squadra || 0;
  try { t.dismissSplash && t.dismissSplash(); } catch (e) {}
  t.setPaused && t.setPaused(false);
  try { if (t.Tut && t.Tut.active && t.Tut.finish) t.Tut.finish(true); } catch (e) {}
  for (let giro = 0; giro < 3 && G.scene !== 'play'; giro++) {
    for (let i = 0; i < 300 && G.scene !== 'play'; i++) t.simulate(0.1);
    if (G.scene !== 'play') { t.startMatch(cfg.modo || 1, 1, { size: cfg.taglia || 5 }); for (let i = 0; i < 120 && G.scene !== 'play'; i++) t.simulate(0.1); }
  }
  if (G.scene !== 'play') return { errore: "la partita non arriva in gioco: scena '" + G.scene + "'" };
  t.setTimeLeft && t.setTimeLeft(80);
  const pi = G.ctrl[SQ];
  if (pi < 0) return { errore: 'nessun giocatore comandato per la squadra ' + SQ };
  const p = G.players[pi];
  const C = t.campo;
  if (p.charge !== undefined && p.charge >= 0) { p.charge = -1; p.chargeKind = 'tiro'; p.chargeT = 0; p.chargeGo = null; p.chargeClip = null; }
  p.slide = -1; p.recover = 0; p.kickCd = 0;
  for (const q of G.players) { q.vx = 0; q.vy = 0; if (q.chiamata !== undefined) q.chiamata = 0; }
  /* «avanti» = meta' campo offensiva DELLA SUA squadra */
  const fxDef = cfg.avanti ? (SQ === 0 ? 0.74 : 0.26) : (SQ === 0 ? 0.42 : 0.58);
  p.x = C.FW * (cfg.fx !== undefined ? (SQ === 0 ? cfg.fx : 1 - cfg.fx) : fxDef);
  p.y = C.FH * (cfg.fy !== undefined ? cfg.fy : 0.5);
  const b = G.ball;
  b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0; b.curve = 0; b.passTo = -1; b.crossTo = -1;
  b.owner = pi; b.x = p.x + (SQ === 0 ? 8 : -8); b.y = p.y;
  const mates = [];
  for (let i = 0; i < G.players.length; i++) {
    const q = G.players[i];
    if (q.team === SQ && i !== pi && q.role !== 'gk' && q.out <= 0) mates.push(i);
  }
  (cfg.mates || []).forEach((m, k) => {
    if (k < mates.length) {
      const q = G.players[mates[k]];
      q.x = Math.max(24, Math.min(C.FW - 24, p.x + (SQ === 0 ? m[0] : -m[0])));
      q.y = Math.max(20, Math.min(C.FH - 20, p.y + m[1]));
      q.vx = 0; q.vy = 0; q.aiT = 0.06; q.aiTX = q.x; q.aiTY = q.y;
    }
  });
  /* tutti gli ALTRI (compagni non piazzati + avversari) lontani e fermi */
  const piazzati = (cfg.mates || []).map((m, k) => mates[k]).filter(v => v !== undefined);
  for (let i = 0; i < G.players.length; i++) {
    const q = G.players[i];
    if (i === pi || piazzati.indexOf(i) >= 0) continue;
    if (q.out > 0) continue;
    if (q.role === 'gk' && q.team !== SQ) { q.vx = 0; q.vy = 0; q.aiT = 30; q.aiTX = q.x; q.aiTY = q.y; continue; }
    const d = Math.hypot(q.x - b.x, q.y - b.y);
    if (d < 390) {
      const l = Math.max(1, d);
      q.x = Math.max(24, Math.min(C.FW - 24, b.x + (q.x - b.x) / l * 400));
      q.y = Math.max(20, Math.min(C.FH - 20, b.y + (q.y - b.y) / l * 400));
    }
    q.vx = 0; q.vy = 0; q.aiT = 30; q.aiTX = q.x; q.aiTY = q.y;
  }
  const bt = t.pulsanti(SQ);
  const trova = a => bt.filter(x => x.act === a)[0] || null;
  const D = trova(cfg.disco);
  if (!D) return { errore: 'nessun disco <' + cfg.disco + '> per la squadra ' + SQ + ': gli atti sono ' + bt.map(x => x.act).join(',') };
  const sotto = document.elementFromPoint(D.x, D.y);
  if (!sotto || sotto.id !== 'gioco')
    return { errore: 'sul disco (' + D.x + ',' + D.y + ') non c\'e\' la tela ma ' + (sotto ? sotto.tagName + '#' + sotto.id : 'niente') };
  const v = G.view;
  return { pi, disco: { x: D.x, y: D.y, r: D.r, act: D.act },
           FW: C.FW, FH: C.FH, px: p.x, py: p.y, n: G.players.length,
           vista: v ? { S2: v.S2, Ax: v.Ax, Ay: v.Ay } : null };
}

function puntoErba(SQ) {
  const t = window.__test;
  const bt = t.pulsanti(0).concat(t.pulsanti(1));
  const W = window.innerWidth, H = window.innerHeight;
  for (const c of [[W * 0.46, H * 0.52], [W * 0.30, H * 0.55], [W * 0.22, H * 0.45], [W * 0.40, H * 0.35], [W * 0.52, H * 0.30]]) {
    let ok = true;
    for (const b of bt) if (Math.hypot(c[0] - b.x, c[1] - b.y) <= b.r + 30) ok = false;
    if (ok) return { x: c[0], y: c[1] };
  }
  return null;
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
      let n = 0;
      Math.random = () => { n++; return p() / 4294967296; };
      window.__nrand = () => n;
      window.__riseme = v => { s = (v >>> 0) || 1; n = 0; };
    }, seme || 20260829);
    await pag.addInitScript(bancoDiProva);
    pag.on('pageerror', e => eccezioni.push(e.message));
    await pag.goto('http://127.0.0.1:' + srv.porta + '/CALCETTO-il-gioco.html', { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(() => window.__banco.passo(6));
    const cdp = await ctx.newCDPSession(pag);
    const passo = n => pag.evaluate(k => window.__banco.passo(k), n);
    return { pag, cdp, passo };
  }

  const esiti = [];
  const stampa = s => console.log(s);
  const verdetto = (id, nome, ok, dett) => { esiti.push({ id, nome, ok }); stampa('   -> ' + id + ' ' + (ok ? 'VERDE' : 'ROSSO') + (dett ? '  ' + dett : '')); stampa(''); };

  stampa('=== BANCO AVVERSARIO — famiglia 2, quello che _q-cmd2 non guarda ===');
  stampa('  gioco: ' + GIOCO);
  stampa('');

  /* --------- il pallonetto col dito, su una taglia e una squadra --------- */
  async function lobDito(taglia, SQ, dragDy, dragDx, seme, fx, fy) {
    const { pag, cdp, passo } = await apri(seme);
    const cfg = { taglia, squadra: SQ, disco: 'shot', fx: fx || 0.74, fy: fy || 0.5,
                  mates: [[120, -140], [120, 140], [-90, 0]],
                  modo: SQ === 1 ? 2 : 1 };
    const q = await pag.evaluate(preparaScena, cfg);
    if (q.errore) { await pag.close(); return { errore: q.errore }; }
    const E = await pag.evaluate(puntoErba, SQ);
    if (!E) { await pag.close(); return { errore: 'nessun punto d\'erba libero' }; }
    const D = q.disco;
    await dito.giu(cdp, [{ x: D.x, y: D.y, id: 2 }]);
    for (let i = 0; i < 30; i++) await passo(1);
    for (let i = 1; i <= 6; i++) {
      await dito.muovi(cdp, [{ x: D.x + dragDx * i / 6, y: D.y + dragDy * i / 6, id: 2 }]);
      await passo(1);
    }
    for (let i = 0; i < 8; i++) await passo(1);
    const pre = await pag.evaluate(pi0 => {
      const t = window.__test, G = t.G;
      const s = (typeof segniGuida === 'function') ? segniGuida(G.players[pi0].team) : [];
      const a = s.filter(x => x.tipo === 'arco-tiro' || x.tipo === 'linea-tiro')[0] || null;
      return { carica: G.players[pi0].charge, segno: a ? { tipo: a.tipo, x1w: a.x1w, y1w: a.y1w, picco: a.picco || 0, dentro: !!a.dentro } : null };
    }, q.pi);
    await dito.su(cdp, [{ x: D.x + dragDx, y: D.y + dragDy, id: 2 }]);
    const r = await pag.evaluate(() => {
      const t = window.__test, G = t.G, b = G.ball;
      const bx0 = b.x, by0 = b.y;
      const vv = Math.max(1e-6, Math.hypot(b.vx, b.vy));
      const ux0 = b.vx / vv, uy0 = b.vy / vv;
      let zMax = 0, v0 = vv, lx = b.x, ly = b.y, atterrato = false, toccato = -1;
      for (let fr = 0; fr < 150; fr++) {
        const zPrima = b.z, vxP = b.vx, vyP = b.vy, owP = b.owner;
        t.simulate(1 / 60);
        if (b.z > zMax) zMax = b.z;
        if (!atterrato && toccato < 0) {
          const dv = Math.hypot(b.vx - vxP, b.vy - vyP);
          if (dv > 1.5 || b.owner !== owP) toccato = fr;
        }
        if (!atterrato && zPrima > 0.5 && b.z <= 0.001) { atterrato = true; lx = b.x; ly = b.y; }
        if (fr === 0) v0 = Math.hypot(b.vx, b.vy);
      }
      return { zMax, v0, lx, ly, atterrato, bx0, by0, ux0, uy0, toccato };
    });
    await dito.sicuro(cdp);
    await pag.close();
    return { zMax: r.zMax, v0: r.v0, lx: r.lx, ly: r.ly, atterrato: r.atterrato,
             bx0: r.bx0, by0: r.by0, ux0: r.ux0, uy0: r.uy0, toccato: r.toccato,
             carica: pre.carica, segno: pre.segno, n: q.n, FW: q.FW, FH: q.FH, px: q.px, py: q.py };
  }

  /* --------- il passaggio alto, su una taglia --------- */
  async function passoAlto(taglia, AMP, seme) {
    const { pag, cdp, passo } = await apri(seme);
    const q = await pag.evaluate(preparaScena, { taglia, squadra: 0, disco: 'through',
      avanti: false, mates: [[150, 0], [-120, 10], [30, -160]], modo: 1 });
    if (q.errore) { await pag.close(); return { errore: q.errore }; }
    const D = q.disco;
    await dito.giu(cdp, [{ x: D.x, y: D.y, id: 1 }]);
    for (let i = 1; i <= 8; i++) { await passo(1); await dito.muovi(cdp, [{ x: D.x + AMP * i / 8, y: D.y, id: 1 }]); }
    for (let i = 0; i < 6; i++) await passo(1);
    await dito.su(cdp, []);
    const r = await pag.evaluate(pi0 => {
      const t = window.__test, G = t.G;
      let zMax = 0, ric = -1;
      for (let fr = 0; fr < 200; fr++) {
        t.simulate(1 / 60);
        if (G.ball.z > zMax) zMax = G.ball.z;
        if (ric < 0 && G.ball.owner >= 0 && G.ball.owner !== pi0) ric = G.ball.owner;
      }
      return { zMax, ric };
    }, q.pi);
    await dito.sicuro(cdp);
    await pag.close();
    return { zMax: r.zMax, ric: r.ric, n: q.n };
  }

  /* =============== A) LE TRE TAGLIE =============== */
  if (fai('A')) {
    stampa('A) LE TRE TAGLIE — il pallonetto chiesto (dito su TIRA, 76 px in su) e il passaggio alto (92 px)');
    let male = [];
    for (const tg of [5, 7, 11]) {
      const L = await lobDito(tg, 0, -76, 0, 20260901 + tg);
      const P = await passoAlto(tg, 92, 20260911 + tg);
      const lErr = L.errore ? ('ERRORE ' + L.errore) : '';
      const pErr = P.errore ? ('ERRORE ' + P.errore) : '';
      stampa('   taglia ' + String(tg).padStart(2) + '  (' + (L.n || P.n || '?') + ' uomini)  pallonetto quota ' + n1(L.zMax) + ' v0 ' + n1(L.v0) + ' ' + lErr +
             '   ·  passaggio alto quota ' + n1(P.zMax) + ' ricevente ' + P.ric + ' ' + pErr);
      if (L.errore || !(L.zMax > Z_LOB)) male.push('taglia ' + tg + ' pallonetto ' + (L.errore || n1(L.zMax)));
      if (P.errore || !(P.zMax > Z_LOB) || P.ric < 0) male.push('taglia ' + tg + ' passaggio ' + (P.errore || (n1(P.zMax) + '/ric' + P.ric)));
    }
    verdetto('A', 'il verbo nuovo funziona su tutte e tre le taglie, e il passaggio alto trova un ricevente',
             male.length === 0, male.length ? '[' + male.join(' ; ') + ']' : '[3 taglie su 3]');
  }

  /* =============== B) LA SQUADRA 1 =============== */
  if (fai('B')) {
    stampa('B) DUE GIOCATORI — il pallonetto della SQUADRA 1 col suo disco');
    const L0 = await lobDito(5, 0, -76, 0, 20260931);
    const L1 = await lobDito(5, 1, -76, 0, 20260931);
    stampa('   squadra 0  quota ' + n1(L0.zMax) + ' v0 ' + n1(L0.v0) + (L0.errore ? '  ERRORE ' + L0.errore : ''));
    stampa('   squadra 1  quota ' + n1(L1.zMax) + ' v0 ' + n1(L1.v0) + (L1.errore ? '  ERRORE ' + L1.errore : ''));
    verdetto('B', 'anche il secondo umano puo\' chiedere il pallonetto col dito',
             !L1.errore && L1.zMax > Z_LOB, '[squadra1 quota ' + n1(L1.zMax) + ']');
  }

  /* =============== C) L'ARCO DEL PALLONETTO NEI PIXEL =============== */
  if (fai('C')) {
    stampa("C) L'ARCO AMBRA DEL PALLONETTO NEI PIXEL — nessun cancello di casa lo guarda");
    const { pag, cdp, passo } = await apri(20260941);
    const q = await pag.evaluate(preparaScena, { taglia: 5, squadra: 0, disco: 'shot',
      fx: 0.70, fy: 0.5, mates: [[120, -140], [120, 140], [-90, 0]], modo: 1 });
    if (q.errore) throw new Error('scena C: ' + q.errore);
    const D = q.disco;
    const TEN = parseInt(arg('tenuta', '30'), 10);
    await dito.giu(cdp, [{ x: D.x, y: D.y, id: 2 }]);
    for (let i = 0; i < TEN; i++) await passo(1);
    for (let i = 1; i <= 6; i++) { await dito.muovi(cdp, [{ x: D.x, y: D.y - 76 * i / 6, id: 2 }]); await passo(1); }
    for (let i = 0; i < 6; i++) await passo(1);
    const r = await pag.evaluate(() => {
      const t = window.__test, G = t.G, v = G.view;
      const segni = (typeof segniGuida === 'function') ? segniGuida(0) : [];
      const s = segni.filter(x => x.tipo === 'arco-tiro' || x.tipo === 'linea-tiro')[0] || null;
      if (!s) return { errore: 'nessun segno di tiro dichiarato: ' + segni.map(x => x.tipo).join(',') };
      const cv = document.getElementById('gioco');
      const dpr = cv.width / cv.clientWidth;
      const img = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height);
      const px = (x, y) => { const i = ((y | 0) * img.width + (x | 0)) * 4; return [img.data[i], img.data[i + 1], img.data[i + 2]]; };
      /* ambra: rosso e verde alti, blu basso. ciano: blu alto. */
      const ambra = c => (c[0] > 150 && c[1] > 90 && c[2] < c[0] - 60);
      const ciano = c => (c[2] > 120 && c[2] > c[0] + 60 && c[1] > c[0] + 40);
      const x0 = (s.x0w * v.S2 + v.Ax) * dpr, y0 = (s.y0w * v.S2 + v.Ay) * dpr;
      const x1 = (s.x1w * v.S2 + v.Ax) * dpr, y1 = (s.y1w * v.S2 + v.Ay) * dpr;
      const piccoPx = (s.picco || 0) * v.S2 * dpr;
      let colonne = 0, sopraA = 0, sopraC = 0, altMax = 0;
      const N = 120;
      for (let k = 1; k < N; k++) {
        const f = k / N;
        const cx = x0 + (x1 - x0) * f, cy = y0 + (y1 - y0) * f;
        if (cx < 2 || cx > img.width - 3 || cy < 2 || cy > img.height - 3) continue;
        colonne++;
        const H = Math.max(10 * dpr, piccoPx * 2 + 8 * dpr);
        for (let d = 5 * dpr; d <= H; d++) {
          const yy = cy - d; if (yy < 2) break;
          const c = px(cx, yy);
          if (ambra(c)) { sopraA++; if (d > altMax) altMax = d; break; }
          if (ciano(c)) { sopraC++; if (d > altMax) altMax = d; break; }
        }
      }
      /* IL BOLLO IN FONDO ALL'ARCO: quanti pixel CIANO e quanti AMBRA in
         un disco di 7 px attorno al capo dell'arco. Il commento nuovo
         dice «ciano e' la palla che vola verso un compagno»; questo e'
         un TIRO. */
      let bolloC = 0, bolloA = 0;
      const R = Math.round(5 * dpr);
      for (let ddx = -R; ddx <= R; ddx++) for (let ddy = -R; ddy <= R; ddy++) {
        if (ddx * ddx + ddy * ddy > R * R) continue;
        const xx = x1 + ddx, yy = y1 + ddy;
        if (xx < 2 || xx > img.width - 3 || yy < 2 || yy > img.height - 3) continue;
        const c = px(xx, yy);
        if (ciano(c)) bolloC++; else if (ambra(c)) bolloA++;
      }
      return { tipo: s.tipo, dentro: !!s.dentro, picco: s.picco || 0, piccoPx, colonne, sopraA, sopraC, altMax, bolloC, bolloA, x1, y1 };
    });
    await dito.sicuro(cdp); await pag.close();
    if (r.errore) throw new Error('C: ' + r.errore);
    stampa('   segno dichiarato: ' + r.tipo + ' dentro=' + r.dentro + '  picco ' + n1(r.picco) + ' u (' + n1(r.piccoPx) + ' px di tela)');
    stampa('   colonne utili ' + r.colonne + ' · AMBRA sopra la corda ' + r.sopraA + ' · CIANO sopra la corda ' + r.sopraC + " · la piu' alta " + n1(r.altMax) + ' px');
    verdetto('C', "l'arco del pallonetto e' DIPINTO in ambra sopra la corda",
             r.tipo === 'arco-tiro' && r.sopraA >= 30 && r.altMax >= r.piccoPx * 0.5,
             '[' + r.sopraA + ' ambra / ' + r.sopraC + ' ciano, alt ' + n1(r.altMax) + ' su ' + n1(r.piccoPx) + ']');
    stampa('   bollo in fondo all-arco: ' + r.bolloC + ' pixel CIANO, ' + r.bolloA + ' AMBRA (disco di 5 px CSS attorno al capo)');
    verdetto('C-bollo', "il capo dell'arco del TIRO non e' dipinto col ciano del passaggio",
             r.bolloC === 0, '[' + r.bolloC + ' pixel ciano sul capo di un arco-tiro]');
  }

  /* =============== D) PROMESSA CONTRO ESECUZIONE =============== */
  if (fai('D')) {
    stampa('D) PROMESSA CONTRO ESECUZIONE — fine dell\'arco dichiarato contro il punto di caduta vero');
    const scarti = [];
    for (const S of [[0.62, 0.50], [0.70, 0.34], [0.78, 0.66], [0.66, 0.42]]) {
      const L = await lobDito(5, 0, -76, 0, 20260951 + Math.round(S[0] * 100), S[0], S[1]);
      if (L.errore) { stampa('   ERRORE ' + L.errore); continue; }
      if (!L.segno) { stampa('   nessun segno dichiarato'); continue; }
      const d = L.atterrato ? Math.hypot(L.lx - L.segno.x1w, L.ly - L.segno.y1w) : NaN;
      const pdx = L.segno.x1w - L.bx0, pdy = L.segno.y1w - L.by0;
      const pl = Math.max(1e-6, Math.hypot(pdx, pdy));
      const cos = (pdx / pl) * L.ux0 + (pdy / pl) * L.uy0;
      const gradi = Math.acos(Math.max(-1, Math.min(1, cos))) * 180 / Math.PI;
      const gv = Math.hypot(L.lx - L.bx0, L.ly - L.by0);
      scarti.push({ d: d, gradi: gradi, gp: pl, gv: gv, toc: L.toccato });
      stampa('   p a ' + S[0] + '/' + S[1] + '  arco (' + Math.round(L.segno.x1w) + ',' + Math.round(L.segno.y1w) +
             ')  caduta (' + Math.round(L.lx) + ',' + Math.round(L.ly) + ')  scarto ' + n1(d) +
             ' u · angolo ' + n1(gradi) + ' gradi · arco lungo ' + n1(pl) + ' volo vero ' + n1(gv) +
             (L.toccato >= 0 ? ('  TOCCATO al fotogramma ' + L.toccato) : '  mai toccato'));
    }
    const puliti = scarti.filter(s => s.toc < 0);
    const angPeggio = Math.max.apply(null, scarti.map(s => s.gradi));
    const gitPeggio = puliti.length ? Math.max.apply(null, puliti.map(s => Math.abs(s.gv - s.gp))) : NaN;
    verdetto('D-angolo', 'la direzione promessa e quella calciata coincidono (meno di 3 gradi)',
             angPeggio < 3, '[angolo peggiore ' + n1(angPeggio) + ' gradi]');
    verdetto('D-gittata', 'la LUNGHEZZA dell\'arco promesso e quella vera coincidono (meno di 40 u), sui tiri mai toccati',
             isFinite(gitPeggio) && gitPeggio <= 40, '[' + puliti.length + ' tiri puliti, scarto peggiore ' + n1(gitPeggio) + ' u]');
  }

  /* =============== E) IL PALLONETTO DA TASTIERA =============== */
  if (fai('E')) {
    stampa('E) IL PALLONETTO DA TASTIERA — levetta indietro, nessun dito. L\'agente dice «parola per parola come ieri».');
    const { pag, passo } = await apri(20260961);
    const q = await pag.evaluate(preparaScena, { taglia: 5, squadra: 0, disco: 'shot',
      fx: 0.74, fy: 0.5, mates: [[120, -140], [120, 140], [-90, 0]], modo: 1 });
    if (q.errore) throw new Error('scena E: ' + q.errore);
    /* tasti veri: KMAP[0].left tenuto (levetta indietro), shot premuto e rilasciato */
    const r = await pag.evaluate(() => {
      const t = window.__test, G = t.G;
      const K = (typeof KMAP !== 'undefined') ? KMAP[0] : null;
      if (!K) return { errore: 'KMAP non raggiungibile' };
      const giu = code => dispatchEvent(new KeyboardEvent('keydown', { code }));
      const su  = code => dispatchEvent(new KeyboardEvent('keyup',   { code }));
      giu(K.lf);
      giu(K.shot);
      for (let i = 0; i < 36; i++) t.simulate(1 / 60);       // 0,6 s di carica
      const car = G.players[G.ctrl[0]].charge;
      const mv = humanMove(0);
      su(K.shot);
      let zMax = 0, v0 = Math.hypot(G.ball.vx, G.ball.vy);
      for (let fr = 0; fr < 150; fr++) { t.simulate(1 / 60); if (G.ball.z > zMax) zMax = G.ball.z; if (fr === 0) v0 = Math.hypot(G.ball.vx, G.ball.vy); }
      su(K.lf);
      return { zMax, v0, car, tasti: K.lf + '/' + K.shot + ' mx=' + mv[0] };
    });
    await pag.close();
    if (r.errore) throw new Error('E: ' + r.errore);
    stampa('   tasti ' + r.tasti + '  carica al rilascio ' + n1(r.car) + '  quota ' + n1(r.zMax) + '  v0 ' + n1(r.v0));
    verdetto('E', 'da tastiera la levetta indietro alza ANCORA il pallonetto (regola di ieri intatta)',
             r.zMax > Z_LOB, '[quota ' + n1(r.zMax) + ']');
  }

  /* =============== F) LA FINESTRA UTILE DEL GESTO =============== */
  if (fai('F')) {
    stampa('F) LA FINESTRA UTILE — quanto in su si puo\' trascinare prima che R_ANNULLA=96 uccida l\'atto');
    const righe = [];
    for (const dy of [-60, -66, -70, -76, -86, -94, -100]) {
      const L = await lobDito(5, 0, dy, 0, 20260971);
      righe.push([dy, L.zMax, L.v0, L.errore]);
      stampa('   dy ' + String(dy).padStart(5) + ' px  ->  quota ' + n1(L.zMax) + '  v0 ' + n1(L.v0) + (L.errore ? '  ERRORE ' + L.errore : ''));
    }
    const dentro = righe.filter(r => r[0] <= -66 && r[0] >= -94 && r[1] > Z_LOB).length;
    const fuori = righe.filter(r => r[0] === -60 && r[1] > Z_LOB).length;
    verdetto('F', 'la finestra 66..94 alza sempre, e 60 no',
             dentro === 5 && fuori === 0, '[' + dentro + ' su 5 dentro la finestra, ' + fuori + ' sotto]');
  }

  await br.close(); srv.chiudi();
  stampa('=== IL CONTO ===');
  let rossi = 0;
  for (const e of esiti) { stampa('  ' + (e.ok ? 'VERDE' : 'ROSSO') + '  ' + e.id + ' — ' + e.nome); if (!e.ok) rossi++; }
  if (eccezioni.length) { stampa('  ECCEZIONI DI PAGINA: ' + eccezioni.slice(0, 5).join(' | ')); rossi++; }
  stampa(rossi === 0 ? 'TUTTO VERDE' : 'ROSSI: ' + rossi);
  process.exit(rossi === 0 ? 0 : 1);
})().catch(e => { console.error('IL BANCO E\' CADUTO: ' + (e && e.stack || e)); process.exit(2); });
