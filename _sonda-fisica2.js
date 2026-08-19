/* SONDA FISICA 2 — cinematica del corpo comandato, ricezione, rimpallo,
   guinzaglio del dribbling, separazione fra corpi. Passo fisso, seme fisso. */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = __dirname;
function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(RADICE) || !fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
(async () => {
  const srv = await servi();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(seme => {
    let s = seme >>> 0 || 1;
    const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => p() / 4294967296;
  }, 20260728);
  pag.on('pageerror', e => console.log('ERRORE PAGINA:', e.message));
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.waitForTimeout(400);

  const out = await pag.evaluate(async () => {
    const t = window.__test, R = {}, L = Math.hypot;
    t.dismissSplash && t.dismissSplash();
    t.startMatch(1, 1);
    t.simulate(3);
    const b = t.ball, P = t.players, C = t.campo;
    const tasto = (code, giu) => window.dispatchEvent(new KeyboardEvent(giu ? 'keydown' : 'keyup', { code, bubbles: true }));
    const lontano = (salvo) => { for (const p of P) { if (p === salvo || p.role === 'gk') continue; p.x = 40 + (p.idx * 17) % 60; p.y = 40 + (p.team * 30); p.vx = 0; p.vy = 0; } };

    /* --- chi comanda? lo si scopre premendo --- */
    const pre = P.map(p => ({ vx: p.vx, vy: p.vy }));
    tasto('KeyD', true); t.simulate(12 / 60); tasto('KeyD', false);
    let idx = -1, best = -1;
    for (let i = 0; i < P.length; i++) { const d = P[i].vx - pre[i].vx; if (P[i].team === 0 && d > best) { best = d; idx = i; } }
    R.comandato = { idx, ruolo: P[idx].role, dvx: +best.toFixed(1) };
    const Q = () => P[idx];

    const preparo = (x, y, vx, vy, fx, fy) => {
      const q = Q(); q.x = x; q.y = y; q.vx = vx; q.vy = vy; q.ax = 0; q.ay = 0;
      q.fx = fx === undefined ? 1 : fx; q.fy = fy === undefined ? 0 : fy;
      q.sprint = false; q.fiato = 100; q.charge = -1; q.slide = -1; q.recover = 0; q.kickCd = 0;
      b.owner = -1; b.passTo = -1; b.x = 30; b.y = C.FH - 30; b.vx = 0; b.vy = 0; b.z = 0; b.vz = 0;
      lontano(q);
    };

    /* --- C1. partenza da fermo, senza sprint --- */
    function corsa(code, sprint, frames) {
      const s = [];
      if (sprint) tasto('ShiftLeft', true);
      tasto(code, true);
      for (let i = 0; i < frames; i++) {
        const q = Q();
        s.push({ i, v: +L(q.vx, q.vy).toFixed(2), vx: +q.vx.toFixed(2), fx: +q.fx.toFixed(3), fy: +q.fy.toFixed(3) });
        b.x = 30; b.y = C.FH - 30; b.owner = -1;      // la palla non deve entrare in scena
        t.simulate(1 / 60);
      }
      tasto(code, false); if (sprint) tasto('ShiftLeft', false);
      return s;
    }
    preparo(200, C.FH * 0.5, 0, 0);
    const a1 = corsa('KeyD', false, 110);
    const vmax1 = Math.max(...a1.map(r => r.v));
    const f63 = a1.findIndex(r => r.v >= 0.63 * vmax1), f95 = a1.findIndex(r => r.v >= 0.95 * vmax1);
    const accPicco = Math.max(...a1.slice(1).map((r, i) => Math.abs(r.v - a1[i].v) * 60));
    R.partenza = { vmax: +vmax1.toFixed(1), t63: +(f63 / 60).toFixed(3), t95: +(f95 / 60).toFixed(3), accPicco: +accPicco.toFixed(0), profilo: a1.filter(r => r.i % 5 === 0).map(r => r.v) };

    /* --- C2. inversione a 180 gradi da velocita' piena --- */
    preparo(C.FW * 0.6, C.FH * 0.5, vmax1, 0, 1, 0);
    const a2 = corsa('KeyA', false, 90);
    const fz = a2.findIndex(r => r.vx <= 0), fp = a2.findIndex(r => r.vx <= -0.95 * vmax1);
    R.inversione = { tZero: +(fz / 60).toFixed(3), tPiena: +(fp / 60).toFixed(3), vx: a2.filter(r => r.i % 4 === 0).map(r => r.vx), faccia: a2.filter(r => r.i % 4 === 0).map(r => +Math.atan2(r.fy, r.fx).toFixed(2)) };

    /* --- C3. curva a 90 gradi: quanto scarroccia --- */
    preparo(C.FW * 0.4, C.FH * 0.5, vmax1, 0, 1, 0);
    const a3 = corsa('KeyS', false, 60);
    R.curva90 = { vx: a3.filter(r => r.i % 4 === 0).map(r => r.vx), v: a3.filter(r => r.i % 4 === 0).map(r => r.v) };

    /* --- D. RICEZIONE: il corpo e' inchiodato, la palla arriva --- */
    function ricezione(vel) {
      const q = Q();
      const X = C.FW * 0.5, Y = C.FH * 0.5;
      preparo(X, Y, 0, 0, -1, 0);
      b.x = X - 240; b.y = Y; b.vx = vel; b.vy = 0; b.owner = -1; b.z = 0; b.vz = 0;
      let prev = { vx: b.vx, vy: b.vy }, esito = null;
      for (let i = 0; i < 120; i++) {
        q.x = X; q.y = Y; q.vx = 0; q.vy = 0; q.fx = -1; q.fy = 0;   // inchiodato
        t.simulate(1 / 60);
        const dv = L(b.vx - prev.vx, b.vy - prev.vy);
        if (b.owner >= 0 || dv > 60) {
          esito = { frame: i, chi: b.owner, vPrima: +L(prev.vx, prev.vy).toFixed(0), vDopo: +L(b.vx, b.vy).toFixed(0), salto: +dv.toFixed(0), accEquiv: +(dv * 60).toFixed(0), dist: +L(b.x - X, b.y - Y).toFixed(1) };
          break;
        }
        prev = { vx: b.vx, vy: b.vy };
      }
      return { lancio: vel, esito };
    }
    R.ricezione = [150, 300, 400, 419, 460, 600].map(ricezione);

    /* --- E. GUINZAGLIO: quanto resta indietro la palla mentre si corre --- */
    (() => {
      const q = Q(); const X = 200, Y = C.FH * 0.5;
      preparo(X, Y, 0, 0, 1, 0);
      b.x = X + 16; b.y = Y; b.owner = idx;
      const s = [];
      tasto('ShiftLeft', true); tasto('KeyD', true);
      for (let i = 0; i < 120; i++) { t.simulate(1 / 60); if (b.owner === idx) s.push(+L(b.x - (q.x + q.fx * 16), b.y - (q.y + q.fy * 16)).toFixed(2)); }
      tasto('KeyD', false); tasto('ShiftLeft', false);
      R.guinzaglio = { campioni: s.length, ultimo: s.slice(-10), max: Math.max(...s), vGiocatore: +L(q.vx, q.vy).toFixed(0) };
    })();

    /* --- F. RIMPALLO sul corpo: restituzione misurata --- */
    (() => {
      const q = Q(); const X = C.FW * 0.5, Y = C.FH * 0.5;
      preparo(X, Y, 0, 0, -1, 0);
      b.x = X - 200; b.y = Y; b.vx = 600; b.owner = -1;
      q.kickCd = 9;    // cosi' non raccoglie: deve solo fare da muro
      let prev = { vx: b.vx, vy: b.vy }, r = null;
      for (let i = 0; i < 90; i++) {
        q.x = X; q.y = Y; q.vx = 0; q.vy = 0; q.kickCd = 9;
        t.simulate(1 / 60);
        if (L(b.vx - prev.vx, b.vy - prev.vy) > 60) { r = { vPrima: +L(prev.vx, prev.vy).toFixed(0), vDopo: +L(b.vx, b.vy).toFixed(0), vz: +b.vz.toFixed(0), e: +(L(b.vx, b.vy) / L(prev.vx, prev.vy)).toFixed(2) }; break; }
        prev = { vx: b.vx, vy: b.vy };
      }
      R.rimpallo = r;
    })();

    /* --- G. SEPARAZIONE: teletrasporto per fotogramma, senza espulsioni --- */
    t.setCpuVsCpu(true); t.simulate(1);
    const tel = [];
    let cont = 0;
    for (let f = 0; f < 60 * 30; f++) {
      const pr = P.map(p => ({ x: p.x, y: p.y, out: p.out }));
      t.simulate(1 / 60);
      for (let i = 0; i < P.length; i++) {
        const p = P[i]; if (p.out > 0 || pr[i].out > 0) continue;
        const d = L(p.x - (pr[i].x + p.vx / 60), p.y - (pr[i].y + p.vy / 60));
        if (d > 0.05) tel.push(d);
        for (let j = i + 1; j < P.length; j++) if (P[j].out <= 0 && L(P[j].x - p.x, P[j].y - p.y) < 26) cont++;
      }
    }
    tel.sort((a, c) => a - c);
    R.separazione = {
      frames: 1800, eventi: tel.length, perFrame: +(tel.length / 1800).toFixed(2),
      p50: +tel[(tel.length * 0.5) | 0].toFixed(2), p95: +tel[(tel.length * 0.95) | 0].toFixed(2),
      max: +tel[tel.length - 1].toFixed(2), sopra5u: tel.filter(v => v > 5).length,
      contattiPerFrame: +(cont / 1800).toFixed(2)
    };
    return R;
  });
  console.log(JSON.stringify(out, null, 1));
  await browser.close(); srv.chiudi();
})();
