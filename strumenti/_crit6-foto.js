/* fotografa la barra delle voci a formati scelti e ritaglia la striscia
   bassa, dove sta la guida. uso: node strumenti/_crit6-foto.js <gioco> <w> <h> <nome> */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');
const prova = path.resolve(process.argv[2]);
const W = +process.argv[3], H = +process.argv[4], NOME = process.argv[5];

function serviGioco(prova) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (prova && /CALCETTO-il-gioco\.html$/i.test(f)) f = prova;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
(async () => {
  const sg = await serviGioco(prova);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, isMobile: W < 1000, hasTouch: true, locale: 'it-IT', deviceScaleFactor: 3 });
  const pag = await ctx.newPage();
  await pag.goto(`http://127.0.0.1:${sg.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
  await pag.waitForTimeout(150);
  const el = await pag.$('#menu .menu-voci');
  await el.screenshot({ path: path.join(RADICE, 'fuori', NOME) });
  console.log('scritto fuori/' + NOME);
  await browser.close(); sg.chiudi();
})();
