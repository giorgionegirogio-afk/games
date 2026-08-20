/* =====================================================================
   _z-critica-l12.js — LE MISURE DEL CRITICO su L1.2.

   Non giudica la toppa contro il progetto: misura DUE COSE che il
   cancello _q-l12.js non guarda, e che decidono se il gioco e' piu'
   bello o solo piu' giusto.

   X1 — QUANTO COSTA TENERE. Il progetto (§4) mette il contenimento
        «dopo il contrasto»; la toppa lo accende dal PRIMO fotogramma
        della pressione, senza nessun limite di distanza. Qui si misura
        di quante unita' si accorcia (o non si accorcia) la distanza dal
        portatore in un secondo, con il dito TENUTO contro il dito
        ALZATO, a tre distanze: 200 unita' (rincorsa lunga), 90 (arrivo)
        e 400 (mezzo campo). Il movimento lo comanda la TASTIERA, come
        fa la prova A2 del cancello, perche' il protocollo del banco non
        sa alzare un dito solo.

   X2 — IL DITO TENUTO ADDOSSO A UN ARRIVO. Stessa scena di A2 ma con
        una tenuta LUNGA (1 s) invece di 0,4 s: quante conquiste, e in
        quanti fotogrammi, tenendo contro colpetto contro niente.

   uso: node strumenti/_z-critica-l12.js --gioco fuori/l12.html
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
function mano(cdp) {
  const giu = new Map();
  const punti = () => [...giu.entries()].map(([id, p]) => ({ x: p.x, y: p.y, id }));
  return {
    async posa(id, x, y) { giu.set(id, { x, y }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: punti() }); },
    async alzaTutte() { giu.clear(); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); },
    async sicuro() { try { giu.clear(); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); } catch (e) {} },
  };
}
/* la sonda: un campione per fotogramma, avvolgendo updateBall */
function installaSonda() {
  if (window.__sonda) return 'gia';
  if (typeof window.updateBall !== 'function') return 'BANCO INVECCHIATO';
  const G = window.__test.G;
  const S = { pi: -1, oi: -1, tr: [], n: 0, attivo: false };
  window.__sonda = S;
  const orig = window.updateBall;
  window.updateBall = function (dt) {
    const r = orig.call(this, dt);
    if (S.attivo) {
      const ci = G.ctrl[0], c = ci >= 0 ? G.players[ci] : null;
      const o = S.oi >= 0 ? G.players[S.oi] : null;
      const b = G.ball;
      S.tr.push({ n: S.n++, ci,
        cv: c ? Math.hypot(c.vx, c.vy) : null, cx: c ? c.x : null, cy: c ? c.y : null,
        cs: c ? c.slide : null,
        ox: o ? o.x : null, oy: o ? o.y : null, ov: o ? Math.hypot(o.vx, o.vy) : null,
        bo: b.owner, bx: b.x, by: b.y });
    }
    return r;
  };
  return 'ok';
}
/* scena: comandato al centro, portatore a distanza d verso EST */
function posaScena(o) {
  const t = window.__test, G = t.G;
  const FW = t.campo.FW, FH = t.campo.FH;
  for (let i = 0; i < 900 && G.scene !== 'play'; i++) t.simulate(1 / 60);
  if (G.scene !== 'play') return { errore: 'scena ' + G.scene };
  G.freeze = 0;
  t.setTimeLeft && t.setTimeLeft(80);
  const pi = G.ctrl[0];
  if (pi < 0) return { errore: 'nessun comandato' };
  const p = G.players[pi], b = G.ball;
  const pulisci = q => { q.slide = -1; q.recover = 0; q.out = 0; q.rove = -1;
    q.kickCd = 0; q.kickT = 0; q.kickB = 0; q.vx = 0; q.vy = 0; q.ax = 0; q.ay = 0;
    q.fiato = 100; q.sprint = false;
    if (q.charge >= 0) { q.charge = -1; q.chargeKind = 'tiro'; q.chargeT = 0; q.chargeGo = null; q.chargeClip = null; } };
  pulisci(p);
  p.x = FW * 0.30; p.y = FH * 0.5;
  b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0; b.curve = 0; b.perfectT = 0;
  b.passTo = -1; b.crossTo = -1; b.saveRolled = false;
  const bx = p.x + o.d, by = p.y;
  let oi = -1;
  for (let i = 0; i < G.players.length; i++) {
    const q = G.players[i];
    if (q.team === p.team || q.out > 0 || q.role === 'gk') continue;
    oi = i; break;
  }
  if (oi < 0) return { errore: 'nessun avversario' };
  const q = G.players[oi];
  pulisci(q);
  q.fx = -1; q.fy = 0;                     // guarda il difensore
  q.x = bx + 16; q.y = by;
  q.aiTX = q.x; q.aiTY = q.y; q.kickCd = 3; q.aiActT = 2.5;
  b.owner = oi; b.x = bx; b.y = by;
  p.fx = 1; p.fy = 0;
  for (let i = 0; i < G.players.length; i++) {
    const z = G.players[i];
    if (i === pi || i === oi || z.role === 'gk') continue;
    pulisci(z);
    const dx = z.x - b.x, dy = z.y - b.y, dd = Math.max(1, Math.hypot(dx, dy));
    if (dd < 380) { z.x = Math.max(12, Math.min(FW - 12, b.x + dx / dd * 400));
                    z.y = Math.max(12, Math.min(FH - 12, b.y + dy / dd * 400)); }
    z.aiTX = z.x; z.aiTY = z.y;
  }
  G.stats.falli[0] = 0; G.stats.falli[1] = 0;
  const S = window.__sonda;
  S.pi = pi; S.oi = oi; S.tr = []; S.n = 0; S.attivo = true;
  const bt = t.pulsanti(0);
  const grande = bt.reduce((x, c) => (c.r || 0) > (x.r || 0) ? c : x, bt[0]);
  return { pi, oi, disco: { x: grande.x, y: grande.y, r: grande.r, act: grande.act },
           d: Math.hypot(b.x - p.x, b.y - p.y) };
}
function esito() {
  const S = window.__sonda, tr = S.tr;
  if (!tr.length) return { vuota: true };
  const u = tr[tr.length - 1];
  let presa = 0, terra = 0, primaPresa = -1;
  for (const r of tr) { if (r.bo === S.pi) { presa++; if (primaPresa < 0) primaPresa = r.n; }
                        if (r.cs !== null && r.cs >= 0) terra++; }
  const d0 = Math.hypot(tr[0].bx - tr[0].cx, tr[0].by - tr[0].cy);
  const d1 = Math.hypot(u.bx - u.cx, u.by - u.cy);
  let sv = 0, nv = 0;
  for (const r of tr) if (r.n >= 20 && r.cv !== null) { sv += r.cv; nv++; }
  return { n: tr.length, d0, d1, presa, primaPresa, terra, velMedia: nv ? sv / nv : null };
}
const n2 = v => (v === null || v === undefined || !isFinite(v)) ? 'n/d' : (Math.round(v * 100) / 100).toString().replace('.', ',');
const mediana = v => { if (!v.length) return null; const s = [...v].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

(async () => {
  const srv = await servi();
  const br = await chromium.launch({ headless: true });
  const ctx = await br.newContext({ viewport: { width: 915, height: 412 },
    deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
  async function apri() {
    const pag = await ctx.newPage();
    await pag.addInitScript(seme => { let s = seme >>> 0 || 1;
      const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
      Math.random = () => p() / 4294967296; }, 20260819);
    await pag.addInitScript(bancoDiProva);
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 25000 });
    await pag.evaluate(() => window.__banco.passo(6));
    await pag.evaluate(() => {
      const t = window.__test, G = t.G;
      try { t.dismissSplash && t.dismissSplash(); } catch (e) {}
      t.setPaused && t.setPaused(false);
      try { if (t.Tut && t.Tut.active && t.Tut.finish) t.Tut.finish(true); } catch (e) {}
      for (let g = 0; g < 3 && G.scene !== 'play'; g++) {
        for (let i = 0; i < 200 && G.scene !== 'play'; i++) t.simulate(0.1);
        if (G.scene !== 'play') { t.startMatch(1, 1, { size: 5 }); for (let i = 0; i < 80 && G.scene !== 'play'; i++) t.simulate(0.1); }
      }
    });
    const s = await pag.evaluate(installaSonda);
    if (s !== 'ok' && s !== 'gia') { console.error('FALLITO: ' + s); process.exit(2); }
    const cdp = await ctx.newCDPSession(pag);
    return { pag, cdp, passo: n => pag.evaluate(k => window.__banco.passo(k), n), dita: mano(cdp) };
  }

  console.log('=== CRITICA L1.2 — quanto costa TENERE ===');
  console.log('  gioco: ' + GIOCO);
  console.log('');

  /* X1 — la rincorsa, con il dito tenuto e senza */
  for (const D of [400, 200, 90]) {
    const N = 12, FRAMES = 60;
    const { pag, passo, dita } = await apri();
    const q0 = await pag.evaluate(posaScena, { d: D });
    if (q0.errore) throw new Error('X1: ' + q0.errore);
    const P = q0.disco;
    await pag.keyboard.down('KeyD');
    async function braccio(tieni) {
      const chiusi = [], vel = [], prese = [];
      let terra = 0, nulle = 0;
      for (let k = 0; k < N; k++) {
        const q = await pag.evaluate(posaScena, { d: D });
        if (q.errore || q.disco.act !== 'slide') { nulle++; await dita.sicuro(); continue; }
        if (tieni) await dita.posa(1, P.x, P.y);
        await passo(FRAMES);
        const r = await pag.evaluate(esito);
        await dita.sicuro();
        await passo(1);
        if (r.vuota) { nulle++; continue; }
        chiusi.push(r.d0 - r.d1); vel.push(r.velMedia); prese.push(r.presa > 0 ? 1 : 0);
        if (r.terra > 0) terra++;
      }
      return { chiuso: mediana(chiusi), vel: mediana(vel), prese: prese.reduce((a, b) => a + b, 0), terra, nulle, n: chiusi.length };
    }
    const tenuto = await braccio(true);
    const libero = await braccio(false);
    await pag.keyboard.up('KeyD');
    await dita.sicuro();
    await pag.close();
    console.log('X1) RINCORSA da ' + D + ' unita\', un secondo di corsa verso EST (tastiera), disco «' + q0.disco.act + '»');
    console.log('   dito TENUTO sul disco : distanza chiusa (mediana) ' + n2(tenuto.chiuso) + ' unita\'  ·  velocita\' media ' + n2(tenuto.vel) +
                '  ·  conquiste ' + tenuto.prese + '/' + tenuto.n + '  ·  corpi a terra ' + tenuto.terra);
    console.log('   dito ALZATO           : distanza chiusa (mediana) ' + n2(libero.chiuso) + ' unita\'  ·  velocita\' media ' + n2(libero.vel) +
                '  ·  conquiste ' + libero.prese + '/' + libero.n + '  ·  corpi a terra ' + libero.terra);
    const rap = (libero.chiuso && Math.abs(libero.chiuso) > 1) ? tenuto.chiuso / libero.chiuso : null;
    console.log('   rapporto TENUTO/ALZATO della distanza chiusa: ' + n2(rap) +
                '   ·   rapporto delle velocita\': ' + n2(libero.vel ? tenuto.vel / libero.vel : null));
    console.log('');
  }

  /* X2 — la tenuta lunga addosso a un arrivo */
  {
    const N = 30, D = 45;
    const { pag, passo, dita } = await apri();
    const q0 = await pag.evaluate(posaScena, { d: D });
    if (q0.errore) throw new Error('X2: ' + q0.errore);
    const P = q0.disco;
    await pag.keyboard.down('KeyD');
    async function braccio(modo) {
      let presi = 0, terra = 0, nulle = 0; const quando = [];
      for (let k = 0; k < N; k++) {
        const q = await pag.evaluate(posaScena, { d: D });
        if (q.errore || q.disco.act !== 'slide') { nulle++; await dita.sicuro(); continue; }
        if (modo !== 'niente') await dita.posa(1, P.x, P.y);
        if (modo === 'colpetto') { await passo(3); await dita.alzaTutte(); await passo(57); }
        else await passo(60);
        const r = await pag.evaluate(esito);
        await dita.sicuro(); await passo(1);
        if (r.vuota) { nulle++; continue; }
        if (r.presa > 0) { presi++; quando.push(r.primaPresa); }
        if (r.terra > 0) terra++;
      }
      return { presi, terra, nulle, mediana: mediana(quando) };
    }
    const colpetto = await braccio('colpetto');
    const tenuto = await braccio('tenuto');
    const niente = await braccio('niente');
    await pag.keyboard.up('KeyD');
    await dita.sicuro(); await pag.close();
    console.log('X2) ARRIVO da ' + D + ' unita\', UN SECONDO intero (60 fotogrammi), ' + N + ' ripetizioni per braccio');
    for (const [nome, b] of [['colpetto', colpetto], ['tenuto  ', tenuto], ['niente  ', niente]])
      console.log('   ' + nome + ': conquiste ' + b.presi + '/' + (N - b.nulle) + '  ·  fotogramma mediano della conquista ' + n2(b.mediana) + '  ·  corpi a terra ' + b.terra);
    console.log('');
  }

  await br.close(); srv.chiudi();
})().catch(e => { console.error('FALLITO: ' + (e && e.stack || e)); process.exit(2); });
