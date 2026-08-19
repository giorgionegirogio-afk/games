/* la RIPRESA DEL GOL usa lo stesso duelFondo del duello (:27633), ma usciva
   gia' presto: sotto il suo orizzonte all'8% non c'e' MAI stato il mondo.
   Il rapporto non la misura. Qui si misura. */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const DIR = path.resolve(process.argv[2]), FILE = process.argv[3];
const VW = +(process.argv[4] || 915), VH = +(process.argv[5] || 412), DPR = 2;

function servi(r) {
  return new Promise(ok => {
    const s = http.createServer((q, res) => {
      const f = path.join(r, decodeURIComponent(q.url.split('?')[0]));
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
(async () => {
  const srv = await servi(DIR);
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: DPR });
  await c.addInitScript(() => {
    let s = 20260819 >>> 0;
    Math.random = function () { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  });
  const p = await c.newPage();
  await p.goto(`http://127.0.0.1:${srv.porta}/${FILE}`, { waitUntil: 'load' });
  await p.waitForFunction(() => window.__test && window.__test.state, null, { timeout: 30000 });
  await p.evaluate(() => window.__test.start ? window.__test.start() : window.__test.rigori());
  await p.waitForTimeout(600);
  await p.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await p.waitForTimeout(200);

  const r = await p.evaluate(() => {
    Duel.phase = 'off';
    G.goalTeam = 0; G.goalIdx = G.players.findIndex(q => q.team === 0 && q.role !== 'gk');
    G.goalSpot = { x: 300, y: 200 };
    avviaRipresa();
    G.scene = 'goal'; G.ripresa.t = 0.9; G.pulse = 20; G.sceneT = 3; G.timeLeft = 60; G.shake = 0;
    duelBg[0].key = ''; duelBg[1].key = '';
    const set = () => { G.scene = 'goal'; G.ripresa.t = 0.9; G.pulse = 20; G.sceneT = 3; G.timeLeft = 60; G.shake = 0; Duel.phase = 'off'; };
    for (let i = 0; i < 4; i++) { set(); render(); }
    const W = cv.width, H = cv.height;
    const prm = (col) => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); ctx.restore(); };
    const sh = () => Uint8Array.from(ctx.getImageData(0, 0, W, H).data);
    set(); prm('#000000'); render(); const A = sh();
    set(); prm('#ffffff'); render(); const B = sh();
    let n = 0, mx = 0, y0 = 1e9, y1 = -1;
    for (let i = 0, px = 0; i < A.length; i += 4, px++) {
      const d = Math.max(Math.abs(A[i] - B[i]), Math.abs(A[i + 1] - B[i + 1]), Math.abs(A[i + 2] - B[i + 2]));
      if (d > 0) { n++; if (d > mx) mx = d; const y = (px / W) | 0; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    return { n, mx, y0, y1, W, H, rip: !!G.ripresa };
  });
  console.log(`${FILE.padEnd(14)} RIPRESA DEL GOL  tela ${r.W}x${r.H}  ->  trapassa ${r.n} px  Δmax ${r.mx}  righe y${r.y0}-${r.y1}`);
  await b.close(); srv.chiudi();
})();
