/* due fotografie della home stretta: com'e' oggi e come sarebbe con la
   settima colonna. Si guarda, non si deduce. */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');
function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  for (const [w, h] of [[568,320],[640,360]]) {
    const ctx = await br.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    const pg = await ctx.newPage();
    await pg.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pg.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pg.evaluate(() => window.__test.dismissSplash());
    await pg.evaluate(() => document.fonts.ready);
    await pg.waitForTimeout(600);
    await pg.screenshot({ path: `fuori/deb-home-${w}x${h}-oggi.png` });
    await pg.evaluate(() => {
      const s = document.createElement('style');
      s.textContent = '#menu .menu-voci{grid-template-columns:1.5fr repeat(6,minmax(0,1fr)) !important}';
      document.head.appendChild(s);
    });
    await pg.waitForTimeout(400);
    await pg.screenshot({ path: `fuori/deb-home-${w}x${h}-sette.png` });
    await ctx.close();
    console.log('scritte fuori/deb-home-' + w + 'x' + h + '-{oggi,sette}.png');
  }
  await br.close(); srv.chiudi();
})();
