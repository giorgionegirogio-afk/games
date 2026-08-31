/* =====================================================================
   _crit-festa-pixel.js — IL CRITICO GUARDA I PIXEL DELLA FESTA VERA.
   Avvolge Rig3D.disegna (l'unica porta) e registra CHI viene disegnato,
   dove, con che clip/fase/imbardata/hPx. Poi ritaglia dal fotogramma
   vero il riquadro della figura che ci interessa.

   uso: node strumenti/_crit-festa-pixel.js --gioco fuori/x.html --tag A
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i+1] && !process.argv[i+1].startsWith('--') ? process.argv[i+1] : d; };
const GIOCO = arg('gioco', 'fuori/anim-terza.html');
const TAG = arg('tag', 'A');
const SEME = +arg('seme', 20260827);
const TAGLIA = +arg('taglia', 5);
const AVVIO = +arg('avvio', 6);
const OUT = arg('out', 'fuori/_crit-festa');
const CLIPS = (arg('clip', 'pugno,cielo')).split(',');

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
  const ctx = await br.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2 });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push(String(e)));
  await pag.goto('http://127.0.0.1:' + srv.porta + '/' + GIOCO.replace(/\\/g, '/'), { waitUntil: 'load' });
  await pag.waitForFunction(() => window.__test && window.__test.state);
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });

  await pag.evaluate(() => {
    window.__REG = [];
    const orig = Rig3D.disegna;
    Rig3D.disegna = function (g, cx, cy, hPx, yaw, cam, clip, u, look, ombra, sc) {
      let m = null; try { m = g.getTransform(); } catch (e) {}
      const sy = m ? Math.hypot(m.b, m.d) : 1, sx = m ? Math.hypot(m.a, m.c) : 1;
      window.__REG.push({ cx, cy, hPx, yaw, cam, clip, u,
        px: m ? (m.a * cx + m.c * cy + m.e) : cx,
        py: m ? (m.b * cx + m.d * cy + m.f) : cy,
        hDev: hPx * sy, sx, sy });
      return orig.apply(this, arguments);
    };
  });

  await pag.evaluate(([s, t]) => { window.__test.semina(s); window.__test.startMatch('cpu', 1, { size: t }); }, [SEME, TAGLIA]);
  await pag.evaluate((a) => { for (let i = 0; i < 60 * a; i++) window.__test.simulate(1 / 60); window.__test.disegna(); }, AVVIO);
  const ok = await pag.evaluate(() => window.__test.forceGoal(0));

  const dir = path.resolve(RADICE, OUT + '-' + TAG);
  fs.mkdirSync(dir, { recursive: true });
  const log = [];
  for (let k = 0; k <= 30; k++) {
    const reg = await pag.evaluate(() => { const r = window.__REG; window.__REG = []; return r; });
    log.push({ k, t: +(k * 0.08).toFixed(3), reg });
    // ritaglio della prima figura con clip d'interesse
    const bersagli = reg.filter(r => CLIPS.includes(r.clip));
    if (bersagli.length) {
      for (let j = 0; j < Math.min(2, bersagli.length); j++) {
        const b = bersagli[j];
        const h = Math.max(40, b.hDev * 1.9);
        const x = Math.round(b.px - h * 0.6), y = Math.round(b.py - h * 1.15);
        const cl = { x: Math.max(0, Math.min(1830 - 4, x)), y: Math.max(0, Math.min(824 - 4, y)),
                     width: Math.round(h * 1.2), height: Math.round(h * 1.45) };
        cl.width = Math.min(cl.width, 1830 - cl.x); cl.height = Math.min(cl.height, 824 - cl.y);
        try {
          await pag.screenshot({ path: path.join(dir, 'c' + String(k).padStart(2, '0') + '-' + b.clip + '-' + j + '.png'), clip: cl });
        } catch (e) {}
      }
    }
    await pag.screenshot({ path: path.join(dir, 'f' + String(k).padStart(2, '0') + '.png') });
    await pag.evaluate(() => { for (let i = 0; i < 5; i++) window.__test.simulate(1 / 60); window.__test.disegna(); });
  }
  fs.writeFileSync(path.join(dir, 'reg.json'), JSON.stringify(log));
  const conta = {};
  for (const r of log) for (const q of r.reg) conta[q.clip] = (conta[q.clip] || 0) + 1;
  console.log('gol:', ok, '· errori:', errori.length, '· clip disegnate:', JSON.stringify(conta));
  const hs = log.flatMap(r => r.reg.filter(q => CLIPS.includes(q.clip)).map(q => q.hDev));
  if (hs.length) console.log('hDev delle clip bersaglio: min ' + Math.min(...hs).toFixed(1) + ' med ' + (hs.reduce((a, b) => a + b, 0) / hs.length).toFixed(1) + ' max ' + Math.max(...hs).toFixed(1) + '  (n=' + hs.length + ')');
  await br.close(); srv.chiudi();
})();
