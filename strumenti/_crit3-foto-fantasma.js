/* _crit3-foto-fantasma.js — la prova per immagini del terzo fantasma.
   Mette il duello nello stato: mira laterale (u -0,8 v 0,42), banda 0,3,
   portiere sul terzo CENTRALE. Il codice dice GOL CERTO (kz 1 !== zone 0),
   ma la riga nuova `s.aimU=A.u` porta il pallone disegnato a u -0,344,
   cioe' dentro il terzo centrale, ad altezza 0,517 (il petto sta a 0,56).
   Disegna il fotogramma dell'impatto e lo salva.
   uso: node strumenti/_crit3-foto-fantasma.js <file.html> <cartella-uscita>
*/
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const PROVA = process.argv[2] ? path.resolve(RADICE, process.argv[2]) : '';
const DEST = process.argv[3] ? path.resolve(RADICE, process.argv[3]) : path.join(RADICE, 'fuori');

function servi(prova) {
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
  const srv = await servi(PROVA);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push('ECCEZIONE: ' + e.message));
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.waitForTimeout(200);

  await pag.evaluate(() => { window.__test.dismissSplash && window.__test.dismissSplash(); });
  await pag.waitForTimeout(900);
  const info = await pag.evaluate(() => {
    const t = window.__test;
    if (t.save) t.save.tutorialDone = 1;
    t.semina(20260803);
    t.startMatch(1, 1, { size: 11 });
    const D = t.Duel, G = t.G;
    D.start(0);
    D.shooterHuman = true; D.keeperHuman = false;
    D.phase = 'zone';
    D.aimU = -0.80; D.aimV = 0.42;
    if ('mirato' in D) D.mirato = true;
    D.zone = 0; D.keeperZone = 1; D.powerQ = 0.3; D.shown = false;
    D.resolve();
    const fuoriEsito = D.outcome;
    /* fermiamo il tempo al momento dell'impatto */
    G.scene = 'freekick';
    D.phase = 'result'; D.resultT = 0.60; D.poseT = 0.60;
    window.requestAnimationFrame = () => 0;
    window.render();
    return { esito: fuoriEsito, aimU: D.aimU, aimV: D.aimV, zone: D.zone, keeperZone: D.keeperZone };
  });
  console.log(JSON.stringify(info));
  const nome = path.join(DEST, 'crit3-fantasma-' + (PROVA ? path.basename(PROVA, '.html') : 'spedito') + '.png');
  fs.mkdirSync(DEST, { recursive: true });
  await pag.screenshot({ path: nome });
  console.log('foto: ' + nome);
  if (errori.length) console.log('ECCEZIONI: ' + errori.join(' | '));
  await ctx.close(); await browser.close(); srv.chiudi();
})();
