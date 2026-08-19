/* SONDA POSA 2 — la SAGOMA della figura al variare della velocita'.
   Sfondo di riferimento (figura fuori quadro) e sottrazione: cosi' la
   grana del fotogramma non entra nel conto. Cerca lo scatto alle soglie
   di clip (14 e 62 unita'/s). */
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
  pag.on('pageerror', e => console.log('ERR:', e.message));
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.waitForTimeout(400);

  const out = await pag.evaluate(async () => {
    const t = window.__test, R = {};
    t.dismissSplash && t.dismissSplash(); t.startMatch(1, 1); t.setCpuVsCpu(true); t.simulate(4);
    const P = t.players, C = t.campo, b = t.ball;
    const q = P.find(p => p.team === 0 && p.role !== 'gk');
    for (const p of P) { if (p !== q) { p.x = 25; p.y = 25; p.vx = 0; p.vy = 0; } }
    b.owner = -1; b.x = 25; b.y = 25; b.vx = 0; b.vy = 0; b.z = 0; b.vz = 0;
    const X = C.FW / 2, Y = C.FH / 2;
    const reset = () => { q.fx = 1; q.fy = 0; q.ang = 0; q.squash = 1; q.rollio = 0; q.bob = 0; q.fase = 1.0; q.amp = 5; q.kickT = 0; q.kickB = 0; q.charge = -1; q.slide = -1; q.recover = 0; q.rove = -1; q.frenaT = 0; q.fintaT = 0; q.celeb = 0; q.mesto = 0; q.out = 0; q.dive = 0; };
    q.x = X; q.y = Y; q.vx = 0; q.vy = 0; reset(); t.disegna();
    const cv = document.getElementById('gioco'), cx = cv.getContext('2d');
    const S2 = t.view.S2, Ax = t.view.Ax, Ay = t.view.Ay, dpr = cv.width / cv.clientWidth;
    const sx = (X * S2 + Ax) * dpr, sy = (Y * S2 + Ay) * dpr;
    const W = Math.round(80 * dpr), H = Math.round(110 * dpr);
    const box = { x: Math.round(sx - W / 2), y: Math.round(sy - H * 0.78), w: W, h: H };
    R.box = box;

    const prendi = () => cx.getImageData(box.x, box.y, box.w, box.h).data;
    // sfondo: figura fuori quadro
    q.x = 25; q.y = 25; reset(); t.disegna(); const sfondo = prendi();
    const sagoma = (v) => {
      q.x = X; q.y = Y; q.vx = v; q.vy = 0; reset();
      t.disegna();
      const d = prendi();
      let n = 0, x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1, cxs = 0, cys = 0;
      for (let i = 0, px = 0; i < d.length; i += 4, px++) {
        const dd = Math.abs(d[i] - sfondo[i]) + Math.abs(d[i + 1] - sfondo[i + 1]) + Math.abs(d[i + 2] - sfondo[i + 2]);
        if (dd > 45) { const X0 = px % box.w, Y0 = (px / box.w) | 0; n++; cxs += X0; cys += Y0; if (X0 < x0) x0 = X0; if (X0 > x1) x1 = X0; if (Y0 < y0) y0 = Y0; if (Y0 > y1) y1 = Y0; }
      }
      return { v, area: n, larg: x1 - x0, alt: y1 - y0, cx: +(cxs / Math.max(1, n)).toFixed(1), cy: +(cys / Math.max(1, n)).toFixed(1) };
    };
    // rumore: stessa velocita' due volte
    const a1 = sagoma(30), a2 = sagoma(30);
    R.rumore = { dArea: Math.abs(a1.area - a2.area), dAlt: Math.abs(a1.alt - a2.alt), dCy: +Math.abs(a1.cy - a2.cy).toFixed(2), area: a1.area };
    const vel = [5, 10, 13, 14, 15, 20, 30, 45, 55, 60, 61, 62, 63, 65, 70, 90, 120, 168];
    R.serie = vel.map(sagoma);
    R.salti = [];
    for (let i = 1; i < R.serie.length; i++) {
      const A = R.serie[i - 1], B = R.serie[i];
      R.salti.push({ da: A.v, a: B.v, dArea: B.area - A.area, dAlt: B.alt - A.alt, dLarg: B.larg - A.larg, dCy: +(B.cy - A.cy).toFixed(2) });
    }
    return R;
  });
  console.log(JSON.stringify(out, null, 1));
  await browser.close(); srv.chiudi();
})();
