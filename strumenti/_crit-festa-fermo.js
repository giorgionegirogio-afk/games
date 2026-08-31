/* _crit-festa-fermo.js — IL FERMO COMPOSTO DEL GOL (moto ridotto).
   Il gioco sceglie a mano le fasi del fermo: pugno tSec 0,73, ginocchia
   0,84, cielo 1,16 — «gesti che reggono anche il fotogramma fermo».
   Quelle tre costanti sono state scelte sulle CURVE VECCHIE. Qui si
   guarda che cosa mostrano adesso.
   uso: node strumenti/_crit-festa-fermo.js --gioco fuori/x.html --tag A */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i+1] && !process.argv[i+1].startsWith('--') ? process.argv[i+1] : d; };
const GIOCO = arg('gioco', 'fuori/anim-terza.html'), TAG = arg('tag', 'A');
function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(RADICE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  const pag = await ctx.newPage();
  const err = []; pag.on('pageerror', e => err.push(String(e)));
  await pag.goto('http://127.0.0.1:' + srv.porta + '/' + GIOCO.replace(/\\/g, '/'), { waitUntil: 'load' });
  await pag.waitForFunction(() => window.__test && window.__test.state);
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.evaluate(() => {
    window.__REG = [];
    const orig = Rig3D.disegna;
    Rig3D.disegna = function (g, cx, cy, hPx, yaw, cam, clip, u) {
      window.__REG.push({ hPx, yaw: +yaw.toFixed(3), cam, clip, t: +u.toFixed(3) });
      return orig.apply(this, arguments);
    };
  });
  await pag.evaluate(() => { window.__test.semina(20260827); window.__test.startMatch('cpu', 1, { size: 5 }); });
  await pag.evaluate(() => { for (let i = 0; i < 360; i++) window.__test.simulate(1 / 60); window.__test.disegna(); });
  await pag.evaluate(() => window.__test.forceGoal(0));
  const dir = path.resolve(RADICE, 'fuori/_crit-fermo-' + TAG);
  fs.mkdirSync(dir, { recursive: true });
  const righe = [];
  for (let k = 0; k <= 26; k++) {
    const reg = await pag.evaluate(() => { const r = window.__REG; window.__REG = []; return r; });
    righe.push({ k, reg });
    await pag.screenshot({ path: path.join(dir, 'f' + String(k).padStart(2, '0') + '.png') });
    await pag.evaluate(() => { for (let i = 0; i < 5; i++) window.__test.simulate(1 / 60); window.__test.disegna(); });
  }
  fs.writeFileSync(path.join(dir, 'reg.json'), JSON.stringify(righe));
  const bassa = righe.filter(r => r.reg.some(q => q.cam === 'bassa'));
  console.log('moto ridotto attivo:', await pag.evaluate(() => (window.SAVE ? SAVE.moto : 'n/d')), '· errori', err.length);
  console.log('fotogrammi in camera bassa:', bassa.length, bassa.length ? JSON.stringify(bassa[Math.floor(bassa.length / 2)].reg) : '');
  await br.close(); srv.chiudi();
})();
