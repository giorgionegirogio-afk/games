/* SONDA FISICA 3 — cinematica pulita (controllo bloccato dal possesso),
   trasparenza del corpo alla palla, separazione solo sui contatti veri. */
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
  await pag.addInitScript(seme => { let s = seme >>> 0 || 1; const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; }; Math.random = () => p() / 4294967296; }, 20260728);
  pag.on('pageerror', e => console.log('ERRORE PAGINA:', e.message));
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.waitForTimeout(400);

  const out = await pag.evaluate(async () => {
    const t = window.__test, R = {}, L = Math.hypot;
    t.dismissSplash && t.dismissSplash(); t.startMatch(1, 1); t.simulate(3);
    const b = t.ball, P = t.players, C = t.campo;
    const tasto = (c, g) => window.dispatchEvent(new KeyboardEvent(g ? 'keydown' : 'keyup', { code: c, bubbles: true }));
    const pre = P.map(p => p.vx);
    tasto('KeyD', true); t.simulate(12 / 60); tasto('KeyD', false);
    let idx = -1, best = -1;
    for (let i = 0; i < P.length; i++) { const d = P[i].vx - pre[i]; if (P[i].team === 0 && d > best) { best = d; idx = i; } }
    const Q = () => P[idx];

    const via = () => { for (const p of P) { if (p === Q()) continue; p.x = p.team === 0 ? 60 : 90; p.y = 60 + p.idx * 8; p.vx = 0; p.vy = 0; } };
    const posa = (x, y, vx, vy, fx, fy) => {
      const q = Q(); q.x = x; q.y = y; q.vx = vx; q.vy = vy; q.ax = 0; q.ay = 0; q.fx = fx; q.fy = fy;
      q.fiato = 100; q.charge = -1; q.slide = -1; q.recover = 0; q.kickCd = 0; q.rove = -1;
      b.owner = idx; b.x = x + fx * 16; b.y = y + fy * 16; b.z = 0; b.vz = 0; b.passTo = -1; via();
    };
    function corri(code, sprint, n) {
      const s = [];
      if (sprint) tasto('ShiftLeft', true);
      tasto(code, true);
      for (let i = 0; i < n; i++) { const q = Q(); s.push({ i, v: +L(q.vx, q.vy).toFixed(2), vx: +q.vx.toFixed(2), vy: +q.vy.toFixed(2), a: Math.atan2(q.fy, q.fx) }); via(); t.simulate(1 / 60); }
      tasto(code, false); if (sprint) tasto('ShiftLeft', false);
      return s;
    }
    const dv = s => s.slice(1).map((r, i) => (r.v - s[i].v) * 60);

    /* --- 1. partenza da fermo, passo normale e sprint --- */
    posa(250, C.FH * 0.5, 0, 0, 1, 0);
    const A = corri('KeyD', false, 120);
    const vA = Math.max(...A.map(r => r.v));
    posa(250, C.FH * 0.5, 0, 0, 1, 0);
    const B = corri('KeyD', true, 120);
    const vB = Math.max(...B.map(r => r.v));
    const cerca = (s, f) => { const i = s.findIndex(r => r.v >= f); return i < 0 ? null : +(i / 60).toFixed(3); };
    R.partenza = {
      passo: { vmax: +vA.toFixed(1), t50: cerca(A, 0.5 * vA), t63: cerca(A, 0.63 * vA), t95: cerca(A, 0.95 * vA), accPicco: +Math.max(...dv(A)).toFixed(0), primoFrame: A[1].v },
      sprint: { vmax: +vB.toFixed(1), t63: cerca(B, 0.63 * vB), t95: cerca(B, 0.95 * vB), accPicco: +Math.max(...dv(B)).toFixed(0) },
      profiloPasso: A.filter(r => r.i % 4 === 0 && r.i < 80).map(r => r.v)
    };

    /* --- 2. inversione a 180 e virata a 90 --- */
    posa(C.FW * 0.55, C.FH * 0.5, vA, 0, 1, 0);
    const I = corri('KeyA', false, 90);
    const fz = I.findIndex(r => r.vx <= 0), fp = I.findIndex(r => r.vx <= -0.95 * vA);
    posa(C.FW * 0.40, C.FH * 0.5, vA, 0, 1, 0);
    const V = corri('KeyS', false, 70);
    const vmin = Math.min(...V.slice(0, 40).map(r => r.v));
    R.inversione = { tZero: fz < 0 ? null : +(fz / 60).toFixed(3), tPiena: fp < 0 ? null : +(fp / 60).toFixed(3), decelMax: +Math.min(...dv(I)).toFixed(0), vx: I.filter(r => r.i % 5 === 0).map(r => r.vx) };
    R.virata90 = { vCalo: +vmin.toFixed(1), quotaPersa: +(1 - vmin / vA).toFixed(2), v: V.filter(r => r.i % 4 === 0).map(r => r.v), vy: V.filter(r => r.i % 4 === 0).map(r => r.vy) };

    /* --- 3. la palla attraversa i corpi? --- */
    function muro(vel, stato) {
      const q = Q(); const X = C.FW * 0.5, Y = C.FH * 0.5;
      posa(X, Y, 0, 0, -1, 0);
      b.owner = -1; b.passTo = -1; b.x = X - 130; b.y = Y; b.vx = vel; b.vy = 0; b.z = 0; b.vz = 0;
      let prev = { vx: b.vx, vy: b.vy }, ev = null, minD = 1e9;
      for (let i = 0; i < 90; i++) {
        q.x = X; q.y = Y; q.vx = 0; q.vy = 0; q.fx = -1; q.fy = 0;
        if (stato === 'kickCd') q.kickCd = 9;
        if (stato === 'recover') q.recover = 9;
        t.simulate(1 / 60);
        minD = Math.min(minD, L(b.x - X, b.y - Y));
        const d = L(b.vx - prev.vx, b.vy - prev.vy);
        if (b.owner >= 0) { ev = { tipo: 'preso', vPrima: +L(prev.vx, prev.vy).toFixed(0) }; break; }
        if (d > 30) { ev = { tipo: 'rimpallo', vPrima: +L(prev.vx, prev.vy).toFixed(0), vDopo: +L(b.vx, b.vy).toFixed(0), e: +(L(b.vx, b.vy) / L(prev.vx, prev.vy)).toFixed(2), vz: +b.vz.toFixed(0) }; break; }
        prev = { vx: b.vx, vy: b.vy };
        if (b.x > X + 60) { ev = { tipo: 'ATTRAVERSA', vAlCorpo: +L(prev.vx, prev.vy).toFixed(0) }; break; }
      }
      return { lancio: vel, stato, minD: +minD.toFixed(1), ev };
    }
    R.muro = [muro(300, 'normale'), muro(300, 'kickCd'), muro(300, 'recover'), muro(700, 'normale'), muro(700, 'kickCd'), muro(900, 'kickCd')];

    /* --- 4. il calcio: quanto salta la velocita' della palla in un frame --- */
    (() => {
      const q = Q(); posa(C.FW * 0.62, C.FH * 0.5, 0, 0, 1, 0);
      let prev = 0, ev = null;
      tasto('KeyX', true);
      for (let i = 0; i < 45; i++) { via(); t.simulate(1 / 60); if (i === 35) tasto('KeyX', false); const v = L(b.vx, b.vy); if (v - prev > 100) { ev = { frame: i, vPrima: +prev.toFixed(0), vDopo: +v.toFixed(0), accEquiv: +((v - prev) * 60).toFixed(0), vz: +b.vz.toFixed(0) }; break; } prev = v; }
      tasto('KeyX', false);
      R.calcio = ev;
    })();

    /* --- 5. separazione: solo fra corpi davvero in contatto --- */
    t.setCpuVsCpu(true); t.simulate(1);
    const tel = [], dvC = [];
    let cont = 0;
    for (let f = 0; f < 60 * 30; f++) {
      const pr = P.map(p => ({ x: p.x, y: p.y, vx: p.vx, vy: p.vy, out: p.out }));
      const vicini = new Set();
      for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++)
        if (P[i].out <= 0 && P[j].out <= 0 && L(P[i].x - P[j].x, P[i].y - P[j].y) < 26) { vicini.add(i); vicini.add(j); cont++; }
      t.simulate(1 / 60);
      for (const i of vicini) {
        const p = P[i]; if (p.out > 0 || pr[i].out > 0) continue;
        const d = L(p.x - (pr[i].x + p.vx / 60), p.y - (pr[i].y + p.vy / 60));
        if (d < 60) tel.push(d);
        dvC.push(L(p.vx - pr[i].vx, p.vy - pr[i].vy) * 60);
      }
    }
    tel.sort((a, c) => a - c); dvC.sort((a, c) => a - c);
    R.separazione = {
      frames: 1800, contatti: cont, campioni: tel.length,
      telP50: +tel[(tel.length * .5) | 0].toFixed(2), telP95: +tel[(tel.length * .95) | 0].toFixed(2), telMax: +tel[tel.length - 1].toFixed(2),
      telP50_uSec: +(tel[(tel.length * .5) | 0] * 60).toFixed(0),
      dvP50: +dvC[(dvC.length * .5) | 0].toFixed(0), dvP95: +dvC[(dvC.length * .95) | 0].toFixed(0)
    };
    return R;
  });
  console.log(JSON.stringify(out, null, 1));
  await browser.close(); srv.chiudi();
})();
