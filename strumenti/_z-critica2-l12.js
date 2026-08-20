/* =====================================================================
   _z-critica2-l12.js — LA SECONDA MISURA DEL CRITICO su L1.2.

   X3 — IL DITO TORNA DOVE SI E' POSATO E PARTE UNA SCIVOLATA.
        Il ri-armo di L1.1 sposta il PUNTO DI POSA sotto il dito e azzera
        la tenuta ogni volta che il disco cambia verbo. Finche' dal
        rilascio non usciva niente, era innocuo. Con L1.2 dal rilascio
        esce una SCIVOLATA, cioe' un fallo possibile. Qui si misura il
        caso pulito: il dito si posa, deriva di 30 px mentre contiene
        (deriva che il gioco ignora, perche' a tenuta piena R_ARMA vale
        36), il disco cambia verbo due volte (il pallone entra e riesce
        dai 36,4 di KICK_R*1,4), e poi il dito TORNA ESATTAMENTE DOVE SI
        ERA POSATO e si alza. Spostamento totale dal punto di posa
        originale: ZERO.
        Braccio di controllo: identico, senza le due escursioni del
        pallone — cioe' senza ri-armo. Li' non deve uscire niente.

   X4 — LA SPAZZATA DI UN PALLONE CHE STA IN ARIA.
        contrastoPasso guarda solo la distanza nel piano: non guarda
        b.z. Si mette un pallone libero a 80 unita' di QUOTA sopra il
        proprio terzo e si preme. Si confronta con il gioco di oggi,
        dove lo stesso gesto produce una scivolata (che a sua volta
        spazza ignorando la quota).

   uso: node strumenti/_z-critica2-l12.js --gioco fuori/l12.html
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'CALCETTO-il-gioco.html')));
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
               '.png': 'image/png', '.json': 'application/json' };

function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (/CALCETTO-il-gioco\.html$/i.test(f)) f = GIOCO;
      if ((!f.startsWith(RADICE) && f !== GIOCO) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('no'); return; }
      res.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
function bancoDiProva() {
  const PASSO = 1000 / 60; let t = 0, coda = [];
  window.requestAnimationFrame = cb => { coda.push(cb); return coda.length; };
  window.cancelAnimationFrame = () => {};
  try { performance.now = () => t; } catch (e) {}
  window.__banco = { passo(n) { n = Math.max(0, Math.round(+n || 0));
    for (let i = 0; i < n; i++) { const c = coda; coda = []; t += PASSO; for (const f of c) { try { f(t); } catch (e) {} } } return t; } };
}
function mano(cdp) {
  const giu = new Map();
  const punti = () => [...giu.entries()].map(([id, p]) => ({ x: p.x, y: p.y, id }));
  return {
    async posa(id, x, y) { giu.set(id, { x, y }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: punti() }); },
    async sposta(id, x, y) { giu.set(id, { x, y }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: punti() }); },
    async alzaTutte() { giu.clear(); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); },
    async sicuro() { try { giu.clear(); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); } catch (e) {} },
  };
}
function installaSonda() {
  if (window.__sonda) return 'gia';
  if (typeof window.updateBall !== 'function') return 'BANCO INVECCHIATO';
  const G = window.__test.G;
  const S = { pi: -1, tr: [], n: 0, attivo: false, calci: [] };
  window.__sonda = S;
  if (typeof window.kickBall === 'function') {
    const ok = window.kickBall;
    window.kickBall = function (p, nx, ny, speed, spinY) {
      const r = ok.call(this, p, nx, ny, speed, spinY);
      if (S.attivo && r) S.calci.push(S.n + ':' + G.players.indexOf(p) + '@' + Math.round(speed));
      return r;
    };
  }
  const orig = window.updateBall;
  window.updateBall = function (dt) {
    const r = orig.call(this, dt);
    if (S.attivo) {
      const p = S.pi >= 0 ? G.players[S.pi] : null, b = G.ball;
      S.tr.push({ n: S.n++, ps: p ? p.slide : null, sdx: p ? p.slideDX : null, sdy: p ? p.slideDY : null,
                  bo: b.owner, bx: b.x, by: b.y, bz: b.z, bvx: b.vx, bvy: b.vy,
                  f0: G.stats.falli[0], f1: G.stats.falli[1] });
    }
    return r;
  };
  return 'ok';
}
function posaScena(o) {
  const t = window.__test, G = t.G;
  const FW = t.campo.FW, FH = t.campo.FH;
  for (let i = 0; i < 900 && G.scene !== 'play'; i++) t.simulate(1 / 60);
  if (G.scene !== 'play') return { errore: 'scena ' + G.scene };
  G.freeze = 0; t.setTimeLeft && t.setTimeLeft(80);
  const pi = G.ctrl[0];
  if (pi < 0) return { errore: 'nessun comandato' };
  const p = G.players[pi], b = G.ball;
  const pulisci = q => { q.slide = -1; q.recover = 0; q.out = 0; q.rove = -1; q.kickCd = 0; q.kickT = 0; q.kickB = 0;
    q.vx = 0; q.vy = 0; q.ax = 0; q.ay = 0; q.fiato = 100; q.sprint = false;
    if (q.charge >= 0) { q.charge = -1; q.chargeKind = 'tiro'; q.chargeT = 0; q.chargeGo = null; q.chargeClip = null; } };
  pulisci(p);
  p.x = o.px !== undefined ? o.px : FW * 0.5; p.y = o.py !== undefined ? o.py : FH * 0.5;
  b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0; b.curve = 0; b.perfectT = 0; b.passTo = -1; b.crossTo = -1; b.saveRolled = false;
  const a = (o.ang || 0) * Math.PI / 180;
  const bx = p.x + Math.cos(a) * o.d, by = p.y + Math.sin(a) * o.d;
  let oi = -1;
  if (o.conPortatore) {
    for (let i = 0; i < G.players.length; i++) { const q = G.players[i];
      if (q.team === p.team || q.out > 0 || q.role === 'gk') continue; oi = i; break; }
    if (oi < 0) return { errore: 'nessun avversario' };
    const q = G.players[oi]; pulisci(q);
    const ux = p.x - bx, uy = p.y - by, ul = Math.max(1e-6, Math.hypot(ux, uy));
    q.fx = ux / ul; q.fy = uy / ul; q.x = bx - q.fx * 16; q.y = by - q.fy * 16;
    q.aiTX = q.x; q.aiTY = q.y; q.kickCd = 3; q.aiActT = 2.5;
    b.owner = oi; b.x = bx; b.y = by;
    p.fx = -q.fx; p.fy = -q.fy;
  } else { b.owner = -1; b.x = bx; b.y = by; p.fx = Math.cos(a); p.fy = Math.sin(a); }
  for (let i = 0; i < G.players.length; i++) { const q = G.players[i];
    if (i === pi || i === oi || q.role === 'gk') continue; pulisci(q);
    const dx = q.x - b.x, dy = q.y - b.y, d = Math.max(1, Math.hypot(dx, dy));
    if (d < 300) { q.x = Math.max(12, Math.min(FW - 12, b.x + dx / d * 320)); q.y = Math.max(12, Math.min(FH - 12, b.y + dy / d * 320)); }
    q.aiTX = q.x; q.aiTY = q.y; }
  G.stats.falli[0] = 0; G.stats.falli[1] = 0;
  const S = window.__sonda; S.pi = pi; S.tr = []; S.n = 0; S.calci = []; S.attivo = true;
  const bt = t.pulsanti(0);
  const grande = bt.reduce((x, c) => (c.r || 0) > (x.r || 0) ? c : x, bt[0]);
  return { pi, oi, disco: { x: grande.x, y: grande.y, r: grande.r, act: grande.act }, FW };
}
function avvicina(dNuova) {
  const t = window.__test, G = t.G, S = window.__sonda;
  const p = G.players[S.pi], b = G.ball;
  const dx = b.x - p.x, dy = b.y - p.y, l = Math.max(1e-6, Math.hypot(dx, dy));
  const nx = dx / l, ny = dy / l;
  const bx = p.x + nx * dNuova, by = p.y + ny * dNuova;
  if (G.ball.owner >= 0) { const q = G.players[G.ball.owner];
    q.fx = -nx; q.fy = -ny; q.x = bx + nx * 16; q.y = by + ny * 16; q.vx = 0; q.vy = 0; q.ax = 0; q.ay = 0;
    q.aiTX = q.x + nx * 200; q.aiTY = q.y + ny * 200; }
  b.x = bx; b.y = by; b.vx = 0; b.vy = 0;
  return { d: Math.hypot(b.x - p.x, b.y - p.y), att: t.pulsanti(0)[0].act };
}
function statoAtto() {
  /* Touch5 e' una const di script: non sta su window, ma il nome nudo si
     risolve lo stesso (e' cosi' che la legge anche _q-l12.js, prova B). */
  const A = Touch5.atti;
  for (const id in A) { const a = A[id];
    return { act: a.act, tenuta: a.tenuta, posaX: a.posaX, posaY: a.posaY, x: a.x, y: a.y, morto: a.morto,
             rArma: Touch5.rArma(a), l: Math.hypot(a.x - a.posaX, a.y - a.posaY) }; }
  return null;
}
function esito() {
  const S = window.__sonda, tr = S.tr;
  if (!tr.length) return { vuota: true };
  let terra = 0, primo = -1, sdx = null, sdy = null;
  for (const r of tr) if (r.ps !== null && r.ps >= 0) { terra++; if (primo < 0) { primo = r.n; sdx = r.sdx; sdy = r.sdy; } }
  const u = tr[tr.length - 1];
  return { n: tr.length, terra, primo, sdx, sdy, falli: (u.f0 - tr[0].f0) + (u.f1 - tr[0].f1),
           bv: Math.hypot(u.bvx, u.bvy), bz: u.bz, calci: S.calci.join(' ') };
}
const n2 = v => (v === null || v === undefined || !isFinite(v)) ? 'n/d' : (Math.round(v * 100) / 100).toString().replace('.', ',');
const gradi = (dx, dy) => Math.atan2(dy, dx) * 180 / Math.PI;

(async () => {
  const srv = await servi();
  const br = await chromium.launch({ headless: true });
  const ctx = await br.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
  async function apri() {
    const pag = await ctx.newPage();
    await pag.addInitScript(s => { let x = s >>> 0 || 1;
      const p = () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x >>> 0; };
      Math.random = () => p() / 4294967296; }, 20260819);
    await pag.addInitScript(bancoDiProva);
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 25000 });
    await pag.evaluate(() => window.__banco.passo(6));
    await pag.evaluate(() => { const t = window.__test, G = t.G;
      try { t.dismissSplash && t.dismissSplash(); } catch (e) {}
      t.setPaused && t.setPaused(false);
      try { if (t.Tut && t.Tut.active && t.Tut.finish) t.Tut.finish(true); } catch (e) {}
      for (let g = 0; g < 3 && G.scene !== 'play'; g++) {
        for (let i = 0; i < 200 && G.scene !== 'play'; i++) t.simulate(0.1);
        if (G.scene !== 'play') { t.startMatch(1, 1, { size: 5 }); for (let i = 0; i < 80 && G.scene !== 'play'; i++) t.simulate(0.1); } } });
    const s = await pag.evaluate(installaSonda);
    if (s !== 'ok' && s !== 'gia') { console.error('FALLITO: ' + s); process.exit(2); }
    const cdp = await ctx.newCDPSession(pag);
    return { pag, cdp, passo: n => pag.evaluate(k => window.__banco.passo(k), n), dita: mano(cdp) };
  }

  console.log('=== CRITICA L1.2 (2) ===');
  console.log('  gioco: ' + GIOCO);
  console.log('');

  /* X3 — il dito torna al punto di posa e scivola lo stesso */
  {
    const N = 20, DRIFT = 30;
    const { pag, passo, dita } = await apri();
    const q0 = await pag.evaluate(posaScena, { d: 70, ang: 0, conPortatore: true });
    if (q0.errore) throw new Error('X3: ' + q0.errore);
    const P = q0.disco;
    async function braccio(conRiarmo) {
      let terra = 0, falli = 0, nulle = 0, riarmi = 0; const dirs = []; const rarme = [];
      for (let k = 0; k < N; k++) {
        const q = await pag.evaluate(posaScena, { d: 70, ang: 0, conPortatore: true });
        if (q.errore || q.disco.act !== 'slide') { nulle++; await dita.sicuro(); continue; }
        await dita.posa(1, P.x, P.y);
        await passo(60);                                        // tenuta 1 s: R_ARMA = 36
        for (let j = 1; j <= 8; j++) { await passo(1); await dita.sposta(1, P.x + DRIFT * j / 8, P.y); }
        await passo(6);
        const s1 = await pag.evaluate(statoAtto);               // deriva ignorata?
        if (conRiarmo) {
          await pag.evaluate(avvicina, 30); await passo(2);     // il disco diventa TIRA
          const m = await pag.evaluate(statoAtto);
          if (m && m.act === 'shot') riarmi++;
          await pag.evaluate(avvicina, 70); await passo(2);     // e torna CONTRASTA
        } else { await passo(4); }
        /* il dito TORNA ESATTAMENTE DOVE SI ERA POSATO */
        for (let j = 7; j >= 0; j--) { await passo(1); await dita.sposta(1, P.x + DRIFT * j / 8, P.y); }
        await passo(6);
        const s2 = await pag.evaluate(statoAtto);
        if (s2) rarme.push(n2(s2.rArma) + '/' + n2(s2.l));
        await dita.alzaTutte();
        await passo(12);
        const r = await pag.evaluate(esito);
        await dita.sicuro(); await passo(1);
        if (r.vuota) { nulle++; continue; }
        if (r.terra > 0) { terra++; dirs.push(Math.round(gradi(r.sdx, r.sdy))); }
        falli += r.falli;
      }
      return { terra, falli, nulle, riarmi, dirs, rarme: rarme.slice(0, 4) };
    }
    const con = await braccio(true);
    const senza = await braccio(false);
    await dita.sicuro(); await pag.close();
    console.log('X3) IL DITO TORNA AL PUNTO DI POSA — tenuta 1 s, deriva ' + DRIFT + ' px, ritorno a ZERO, poi rilascio; ' + N + ' prove per braccio');
    console.log('   CON ri-armo (il pallone entra e riesce dai 36,4): ri-armi visti ' + con.riarmi + '/' + (N - con.nulle) +
                '  ·  scivolate ' + con.terra + '/' + (N - con.nulle) + '  ·  falli ' + con.falli +
                '  ·  direzioni [' + [...new Set(con.dirs)].join(' ') + '] gradi');
    console.log('      R_ARMA/spostamento al rilascio (primi campioni): ' + con.rarme.join('  ·  '));
    console.log('   SENZA ri-armo (controllo, stessa mano):             scivolate ' + senza.terra + '/' + (N - senza.nulle) + '  ·  falli ' + senza.falli);
    console.log('      R_ARMA/spostamento al rilascio (primi campioni): ' + senza.rarme.join('  ·  '));
    console.log('   il dito finisce ESATTAMENTE dove si era posato in tutti e due i bracci: spostamento dal punto di posa ORIGINALE = 0 px.');
    console.log('');
  }

  /* X4 — la spazzata di un pallone che sta in aria */
  {
    const N = 20, Z = 80;
    const { pag, passo, dita } = await apri();
    const q0 = await pag.evaluate(posaScena, { d: 45, ang: 180, conPortatore: false, px: 287, py: 280 });
    if (q0.errore) throw new Error('X4: ' + q0.errore);
    const P = q0.disco;
    let calciati = 0, nulle = 0, terra = 0; const vel = [], quote = [];
    for (let k = 0; k < N; k++) {
      const q = await pag.evaluate(posaScena, { d: 45, ang: 180, conPortatore: false, px: 287, py: 280 });
      if (q.errore || q.disco.act !== 'slide') { nulle++; await dita.sicuro(); continue; }
      await pag.evaluate(z => { window.__test.G.ball.z = z; window.__test.G.ball.vz = 0; }, Z);
      await dita.posa(1, P.x, P.y);
      await pag.evaluate(avvicina, 20);
      await pag.evaluate(z => { window.__test.G.ball.z = z; window.__test.G.ball.vz = 0; }, Z);
      await passo(4);
      const r = await pag.evaluate(esito);
      await dita.alzaTutte(); await passo(1);
      if (r.vuota) { nulle++; continue; }
      if (r.terra > 0) terra++;
      if (r.bv > 60) { calciati++; vel.push(r.bv); quote.push(r.bz); }
    }
    await dita.sicuro(); await pag.close();
    console.log('X4) PALLONE LIBERO A ' + Z + ' UNITA\' DI QUOTA, nel proprio terzo, a 20 unita\' nel piano — ' + N + ' prove');
    console.log('   pallone calciato lo stesso: ' + calciati + '/' + (N - nulle) + '  ·  corpi a terra ' + terra +
                '  ·  velocita\' del primo campione ' + n2(vel[0]) + '  ·  quota al momento ' + n2(quote[0]));
    console.log('   (contrastoPasso e checkSlideContact guardano solo la distanza nel PIANO: b.z non entra in nessuna delle due)');
    console.log('');
  }

  await br.close(); srv.chiudi();
})().catch(e => { console.error('FALLITO: ' + (e && e.stack || e)); process.exit(2); });
