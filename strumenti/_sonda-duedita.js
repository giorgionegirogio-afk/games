/* =====================================================================
   SONDA: DUE DITA VERE, E IL CROSS CHE OGGI VIVE SUL PULSANTE.

   Serve a decidere una cosa sola, e a deciderla MISURANDO:
   il cross del gioco di oggi non e' piu' un flick del rilascio (Touch5
   .release torna false, CALCETTO-il-gioco.html:8994) ma il PULSANTE
   PICCOLO premuto MENTRE lo scatto e' tenuto, dalla meta' campo
   offensiva (doFiltrante -> comeCross, :9187). Lo scatto su touch e'
   la levetta spinta oltre 66 px (humanSprint, :8665), cioe' UN SECONDO
   DITO che resta giu'.
   Quindi: (1) Input.dispatchTouchEvent regge due punti insieme? (2) la
   pagina li vede come due Touch distinti? (3) humanSprint diventa vero?
   (4) il contatore dei cross sale e la palla prende quota?

   uso:  node strumenti/_sonda-duedita.js
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png' };
function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(RADICE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
const attesa = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(s0 => {
    let x = s0 >>> 0 || 1;
    const p = () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x >>> 0; };
    Math.random = () => p() / 4294967296;
  }, 20260731);
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.waitForTimeout(400);
  await pag.evaluate(() => {
    const t = window.__test;
    t.dismissSplash && t.dismissSplash();
    t.startMatch(1, 1);
    window.__vd = [];
    for (const tipo of ['touchstart', 'touchmove', 'touchend', 'touchcancel']) {
      addEventListener(tipo, e => {
        window.__vd.push({ tipo, n: e.touches.length, cambiati: [...e.changedTouches].map(t => t.identifier) });
      }, { capture: true, passive: true });
    }
  });
  await pag.waitForTimeout(400);
  const cdp = await ctx.newCDPSession(pag);
  const ev = (type, punti) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: punti });

  /* campo governato: comandato in meta' offensiva, col pallone, fermo */
  const info = await pag.evaluate(() => {
    const t = window.__test, G = t.G;
    t.setPaused && t.setPaused(false);
    try { if (t.Tut && t.Tut.active && t.Tut.finish) t.Tut.finish(true); } catch (e) { }
    for (let i = 0; i < 300 && G.scene !== 'play'; i++) t.simulate(0.1);
    t.setTimeLeft && t.setTimeLeft(80);
    const pi = G.ctrl[0], p = G.players[pi], c = t.campo;
    p.x = c.FW * 0.68; p.y = c.FH * 0.26;
    for (const q of G.players) { q.vx = 0; q.vy = 0; }
    const b = G.ball;
    b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0; b.curve = 0; b.passTo = -1;
    b.owner = pi; b.x = p.x - 8; b.y = p.y;
    for (let i = 0; i < G.players.length; i++) {
      const q = G.players[i];
      if (q.team === 0) continue;
      const d = Math.hypot(q.x - b.x, q.y - b.y);
      if (d < 170) { const l = Math.max(1, d); q.x = b.x + (q.x - b.x) / l * 230; q.y = b.y + (q.y - b.y) / l * 230; }
    }
    const bt = t.pulsanti(0);
    const pc = bt.reduce((a, z) => (z.r < a.r ? z : a), bt[0]);
    return { pc, scena: G.scene, pi, px: p.x, meta: p.x > c.FW / 2, cross: (G.stats.cross && G.stats.cross[0]) || 0 };
  });
  console.log('preparato:  scena ' + info.scena + '  ·  comandato ' + info.pi + ' a x=' + info.px.toFixed(0) +
    ' (meta offensiva: ' + info.meta + ')  ·  piccolo (' + Math.round(info.pc.x) + ',' + Math.round(info.pc.y) + ') act ' + info.pc.act);

  /* ---- 1) dito A giu' e spinto: la levetta oltre 66 px ---- */
  const AX = 240, AY = 250;
  await ev('touchStart', [{ x: AX, y: AY, id: 1 }]);
  for (let i = 1; i <= 5; i++) { await ev('touchMove', [{ x: AX, y: AY + i * 18, id: 1 }]); await attesa(16); }
  const s1 = await pag.evaluate(() => {
    const T = window.__test;
    const st = (T.Touch5 || window.Touch5 || {}).stick;
    return { vd: window.__vd.slice(), stick: st ? { a: st[0].active, dx: st[0].dx, dy: st[0].dy } : null };
  });
  console.log('dopo il dito A:  ' + JSON.stringify(s1.stick) + '   eventi visti: ' +
    s1.vd.map(e => e.tipo + '/' + e.n).join(' '));

  /* ---- 2) dito B sul pulsante piccolo, MENTRE A resta giu' ---- */
  const BX = Math.round(info.pc.x), BY = Math.round(info.pc.y);
  await ev('touchStart', [{ x: AX, y: AY + 90, id: 1 }, { x: BX, y: BY, id: 2 }]);
  await attesa(80);
  const s2 = await pag.evaluate(() => {
    const G = window.__test.G;
    return {
      n: window.__vd.length,
      ultimi: window.__vd.slice(-4),
      carica: G.players[G.ctrl[0]] ? G.players[G.ctrl[0]].chargeKind + '/' + G.players[G.ctrl[0]].charge : null,
      clip: G.players[G.ctrl[0]] ? G.players[G.ctrl[0]].chargeClip : null,
    };
  });
  console.log('dopo il dito B:  ' + JSON.stringify(s2.ultimi) + '  carica ' + s2.carica + '  clip ' + s2.clip);

  /* ---- 3) si alza B, poi A ---- */
  await ev('touchEnd', [{ x: AX, y: AY + 90, id: 1 }]);
  await attesa(40);
  await ev('touchEnd', []);
  await attesa(1200);
  const fine = await pag.evaluate(() => {
    const G = window.__test.G, b = G.ball;
    return {
      cross: (G.stats.cross && G.stats.cross[0]) || 0,
      filtranti: (G.stats.filtranti && G.stats.filtranti[0]) || 0,
      z: b.z, vz: b.vz, v: Math.hypot(b.vx, b.vy), owner: b.owner,
      eventi: window.__vd.map(e => e.tipo + '/' + e.n + '[' + e.cambiati.join(',') + ']'),
    };
  });
  console.log('cross a tabellino: ' + info.cross + ' -> ' + fine.cross + '   filtranti: ' + fine.filtranti +
    '   palla v=' + fine.v.toFixed(0) + ' z=' + fine.z.toFixed(1) + ' owner=' + fine.owner);
  console.log('la pagina ha visto: ' + fine.eventi.join('  '));

  await br.close(); srv.chiudi();
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
