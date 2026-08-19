/* SONDA DI SOLA LETTURA #7 — QUANTO IN ALTO ARRIVA IL PALLONE.
   GOAL_Z vale 52; la traversa si riconosce con |z-52|<7 e la palla e'
   "ALTA" sopra 52. Qui si misura la quota massima che il gioco produce. */
const http = require('http'); const fs = require('fs'); const path = require('path');
const { chromium } = require('playwright');
const ROOT = 'C:/Users/Utenteee/Desktop/GitHub/games'; const PORT = 8797;
const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/CALCETTO-il-gioco.html';
  fs.readFile(path.join(ROOT, p), (e, d) => {
    if (e) { res.writeHead(404); res.end('no'); return; }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(d);
  });
});
(async () => {
  await new Promise(r => srv.listen(PORT, r));
  const browser = await chromium.launch();
  const out = {};

  // A) CPU contro CPU: quota massima e banner visti
  {
    const page = await browser.newPage({ viewport: { width: 915, height: 412 } });
    await page.goto(`http://127.0.0.1:${PORT}/CALCETTO-il-gioco.html?cb=${Date.now()}`, { waitUntil: 'load' });
    await page.waitForFunction(() => !!window.__test, null, { timeout: 30000 });
    out.cpu = await page.evaluate(() => {
      const T = window.__test;
      T.dismissSplash(); T.startMatch(1, 2, { size: 5 }); T.setCpuVsCpu(true);
      let zmax = 0; const banner = {};
      for (let i = 0; i < 6000 && T.state !== 'end' && T.state !== 'menu'; i++) {
        T.simulate(1 / 60);
        const z = T.ball.z || 0; if (z > zmax) zmax = z;
        const b = T.banner; if (b && b.text) banner[b.text] = (banner[b.text] || 0) + 1;
      }
      return { zMax: +zmax.toFixed(2), banner: Object.keys(banner) };
    });
    await page.close();
  }

  // B) CROSS piu' lungo possibile + PALLONETTO perfetto: quota massima
  {
    const page = await browser.newPage({ viewport: { width: 915, height: 412 }, hasTouch: true });
    await page.goto(`http://127.0.0.1:${PORT}/CALCETTO-il-gioco.html?cb=${Date.now()}`, { waitUntil: 'load' });
    await page.waitForFunction(() => !!window.__test, null, { timeout: 30000 });
    out.gestiAlti = await page.evaluate(() => {
      const T = window.__test;
      const K = (c, t) => window.dispatchEvent(new KeyboardEvent(t, { code: c, bubbles: true }));
      T.dismissSplash(); T.startMatch(1, 1, { size: 11 }); T.simulate(1.6);
      const P = T.players, b = T.ball;
      const g = P.filter(p => p.team === 0 && p.role !== 'gk'); const me = g[0];
      const posa = (x, y) => { for (let i = 0; i < 30; i++) {
        for (const p of g) if (p !== me) { p.x = 60; p.y = 40; p.vx = 0; p.vy = 0; }
        for (const p of P) if (p.team === 1) { p.x = 200; p.y = 60; p.vx = 0; p.vy = 0; }
        me.x = x; me.y = y; me.vx = 0; me.vy = 0; me.fx = 1; me.fy = 0; me.kickCd = 0; me.charge = -1;
        b.owner = P.indexOf(me); b.passTo = -1; b.x = me.x + 16; b.y = me.y; b.z = 0; b.vx = 0; b.vy = 0; b.vz = 0;
        T.simulate(1 / 60);
      } };
      const campo = T.campo;
      const misura = () => { let z = 0; for (let i = 0; i < 90; i++) { T.simulate(1 / 60); if ((b.z || 0) > z) z = b.z; } return +z.toFixed(2); };
      // cross dal punto piu' lontano possibile dalla porta (meta' campo offensiva)
      posa(campo.FW / 2 + 10, 60);
      K('ShiftLeft', 'keydown'); K('KeyE', 'keydown'); K('KeyE', 'keyup');
      const zCross = misura(); K('ShiftLeft', 'keyup');
      // pallonetto perfetto
      posa(campo.FW * 0.75, campo.FH / 2);
      K('KeyX', 'keydown'); T.simulate(0.62); K('ShiftLeft', 'keydown'); K('KeyX', 'keyup');
      const zLob = misura(); K('ShiftLeft', 'keyup');
      return { FW: campo.FW, zCrossMax: zCross, zPallonettoMax: zLob,
               cross: T.stats.cross[0], pallonetti: T.stats.pallonetti[0] };
    });
    await page.close();
  }

  await browser.close(); srv.close();
  console.log(JSON.stringify(out, null, 1));
})();
