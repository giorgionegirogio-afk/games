/* _crit6-zoom.js — ritaglia la barra delle voci della home ad alta risoluzione.
   uso: node strumenti/_crit6-zoom.js --gioco fuori/campocop.html --w 568 --h 320 --png fuori/_crit-zoom.png */
const http = require('http'); const fs = require('fs'); const path = require('path');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
function servi(prova) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (prova && /CALCETTO-il-gioco\.html$/i.test(f)) f = prova;
      if ((!f.startsWith(RADICE) && f !== prova) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
(async () => {
  const { chromium } = require('playwright');
  const prova = arg('gioco', ''); const provaAbs = prova ? path.resolve(prova) : '';
  const W = +arg('w', 568), H = +arg('h', 320);
  const png = path.resolve(arg('png', 'fuori/_crit-zoom.png'));
  const sel = arg('sel', '#menu .menu-voci');
  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 5 });
  const pag = await ctx.newPage();
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 25000 });
  await pag.evaluate(() => { const t = window.__test; if (t.dismissSplash) t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
  await pag.waitForTimeout(400);
  const el = await pag.$(sel);
  if (!el) { console.error('non trovo ' + sel); process.exit(3); }
  await el.screenshot({ path: png });
  console.log('scritto ' + png);
  await browser.close(); srv.chiudi();
})().catch(e => { console.error('BANCO: ' + e.stack); process.exit(2); });
