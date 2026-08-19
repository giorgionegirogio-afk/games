/* SONDA POSA — c'e' uno scatto di disegno quando la velocita' attraversa
   le soglie di clip (14 e 62 u/s)? Si misura in pixel, non a occhio.
   Stessa scena, stesso fotogramma, cambia solo p.vx. */
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
    const t = window.__test, R = {};
    t.dismissSplash && t.dismissSplash(); t.startMatch(1, 1); t.setCpuVsCpu(true); t.simulate(4);
    const P = t.players, C = t.campo, b = t.ball;
    const q = P.find(p => p.team === 0 && p.role !== 'gk');
    // tutti gli altri fuori dal quadro, palla lontana, camera ferma al centro
    for (const p of P) { if (p === q) { continue; } p.x = 20; p.y = 20; p.vx = 0; p.vy = 0; }
    b.owner = -1; b.x = 20; b.y = 20; b.vx = 0; b.vy = 0; b.z = 0; b.vz = 0;
    q.x = C.FW / 2; q.y = C.FH / 2; q.fx = 1; q.fy = 0; q.ang = 0;
    q.squash = 1; q.rollio = 0; q.bob = 0; q.fase = 1.0; q.amp = 5;
    q.kickT = 0; q.kickB = 0; q.charge = -1; q.slide = -1; q.recover = 0; q.rove = -1;
    q.frenaT = 0; q.fintaT = 0; q.celeb = 0; q.mesto = 0; q.out = 0; q.dive = 0;
    t.disegna();
    const cv = document.getElementById('gioco');
    const cx = cv.getContext('2d');
    const S2 = t.view.S2, Ax = t.view.Ax, Ay = t.view.Ay;
    const dpr = cv.width / cv.clientWidth;
    const sx = (q.x * S2 + Ax) * dpr, sy = (q.y * S2 + Ay) * dpr;
    const RB = Math.round(70 * dpr);
    const box = { x: Math.max(0, Math.round(sx - RB)), y: Math.max(0, Math.round(sy - RB * 1.4)), w: RB * 2, h: Math.round(RB * 2.2) };
    R.box = box; R.canvas = { w: cv.width, h: cv.height, dpr };

    const scatta = (v) => {
      q.vx = v; q.vy = 0; q.fx = 1; q.fy = 0; q.ang = 0;
      q.squash = 1; q.rollio = 0; q.bob = 0; q.fase = 1.0;
      q.x = C.FW / 2; q.y = C.FH / 2;
      t.disegna();
      return cx.getImageData(box.x, box.y, box.w, box.h).data;
    };
    const diff = (a, c) => { let s = 0, n = 0; for (let i = 0; i < a.length; i += 4) { const d = Math.abs(a[i] - c[i]) + Math.abs(a[i + 1] - c[i + 1]) + Math.abs(a[i + 2] - c[i + 2]); if (d > 12) n++; s += d; } return { pixDiversi: n, sommaMedia: +(s / (a.length / 4)).toFixed(2) }; };

    // rumore di fondo: due disegni identici
    const n1 = scatta(30), n2 = scatta(30);
    R.rumore = diff(n1, n2);

    const vel = [5, 10, 12, 13, 14, 15, 16, 20, 30, 40, 50, 55, 58, 60, 61, 62, 63, 64, 66, 70, 80, 100, 130, 168];
    const img = vel.map(scatta);
    R.serie = [];
    for (let i = 1; i < vel.length; i++) R.serie.push({ da: vel[i - 1], a: vel[i], ...diff(img[i - 1], img[i]) });
    return R;
  });
  console.log(JSON.stringify(out, null, 1));
  await browser.close(); srv.chiudi();
})();
