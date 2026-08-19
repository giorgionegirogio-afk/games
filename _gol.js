/* _gol.js — LA LENTE SULLA SCENA DEL GOL (non e' un cancello).
   Mette in posa la stessa scena di scatta.js 'calcetto/gol', salva il PNG e
   misura sulla TELA tre cose che il critico ha contestato a numero:
     · il grigio mediano della fascia UI in basso e quello del manto sopra
       (in bianco e nero devono distare almeno 25 livelli);
     · quanti pixel di manto sono OMBRA (sotto l'85% del terzo quartile del
       prato illuminato): sotto un cono di luce dichiarato non possono
       essere zero;
     · l'altezza a schermo di ogni figura, per vedere la gerarchia.
   uso: node _gol.js [file.html] [--out foto-coda1/gol.png] */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = __dirname;
const FILE = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'CALCETTO-il-gioco.html';
function arg(n, d) { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : d; }
const OUT = arg('out', 'foto-coda1/gol.png');
function servi() {
  return new Promise(ok => {
    const s = http.createServer((rq, rs) => {
      const f = path.join(RADICE, decodeURIComponent(rq.url.split('?')[0]));
      fs.readFile(f, (e, d) => {
        if (e) { rs.writeHead(404); rs.end('no'); return; }
        rs.writeHead(200, { 'Content-Type': (f.endsWith('.html') ? 'text/html' : 'text/javascript') + '; charset=utf-8', 'Cache-Control': 'no-store' });
        rs.end(d);
      });
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  const ctxb = await br.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2 });
  await ctxb.addInitScript(seme => {
    let s = seme >>> 0 || 1;
    const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => p() / 4294967296;
    /* l'orologio del disegno in mano, come nel banco di scatta.js */
    const PASSO = 1000 / 60; let t = 0, coda = [];
    window.requestAnimationFrame = cb => { coda.push(cb); return coda.length; };
    window.cancelAnimationFrame = () => {};
    try { performance.now = () => t; } catch (e) {}
    window.__banco = { passo(n) { for (let i = 0; i < Math.round(n); i++) { const c = coda; coda = []; t += PASSO; for (const f of c) { try { f(t); } catch (e) {} } } return t; } };
  }, 20260728);
  const pg = await ctxb.newPage();
  const err = [];
  pg.on('pageerror', e => err.push(String(e)));
  await pg.goto(`http://127.0.0.1:${srv.porta}/${FILE}?t=${Date.now()}`);
  await pg.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pg.evaluate(() => {
    window.__test.dismissSplash && window.__test.dismissSplash();
    window.__test.startMatch(1, 1);
    window.__test.setCpuVsCpu && window.__test.setCpuVsCpu(true);
    window.__banco.passo(90);
    window.__test.forceGoal(0);
    window.__banco.passo(96);
  });
  const m = await pg.evaluate(() => {
    const cv = document.getElementById('gioco');
    const cx = cv.getContext('2d');
    const W = cv.width, H = cv.height, D = cx.getImageData(0, 0, W, H).data;
    const gr = i => 0.2126 * D[i] + 0.7152 * D[i + 1] + 0.0722 * D[i + 2];
    const med = v => { if (!v.length) return null; v.sort((a, b) => a - b); return v[v.length >> 1]; };
    const verde = i => {
      const r = D[i], g = D[i + 1], b = D[i + 2];
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), dl = mx - mn;
      if (mx <= 0 || dl / mx < 0.10 || mx / 255 < 0.06) return false;
      let h = 0;
      if (dl > 0) { if (mx === r) h = 60 * (((g - b) / dl) % 6); else if (mx === g) h = 60 * ((b - r) / dl + 2); else h = 60 * ((r - g) / dl + 4); if (h < 0) h += 360; }
      return h >= 90 && h <= 175;
    };
    /* la fascia UI: il gioco la dichiara alta VH*0,185 + 12 px di margine */
    const FBH = Math.min(96, Math.max(56, Math.round(412 * 0.185)));
    const y0 = Math.round((412 - FBH - 12) * (H / 412)), y1 = Math.round((412 - 12) * (H / 412));
    const ui = [], prato = [], pratoTutto = [];
    for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) {
      const i = (y * W + x) * 4;
      if (y > y0 + 6 && y < y1 - 6) { if (x > W * 0.02 && x < W * 0.98) ui.push(gr(i)); }
      else if (verde(i) && y > H * 0.30 && y < y0 - 4) { prato.push(gr(i)); pratoTutto.push(gr(i)); }
    }
    const q3 = (() => { const v = pratoTutto.slice().sort((a, b) => a - b); return v.length ? v[Math.floor(v.length * 0.75)] : 0; })();
    let ombra = 0;
    for (const v of prato) if (v < q3 * 0.85) ombra++;
    return {
      ui: med(ui), prato: med(prato), q3: +q3.toFixed(1),
      ombraFraz: prato.length ? +(ombra / prato.length).toFixed(3) : 0,
      nPrato: prato.length,
    };
  });
  fs.mkdirSync(path.dirname(path.join(RADICE, OUT)), { recursive: true });
  await pg.screenshot({ path: path.join(RADICE, OUT) });
  await br.close(); srv.chiudi();
  console.log('== scena gol · ' + FILE + ' ==');
  console.log('  grigio fascia UI  ' + (m.ui === null ? '-' : m.ui.toFixed(1)));
  console.log('  grigio del manto  ' + (m.prato === null ? '-' : m.prato.toFixed(1)) +
    '   distanza ' + (m.ui === null || m.prato === null ? '-' : Math.abs(m.ui - m.prato).toFixed(1)) + ' (minimo 25)');
  console.log('  manto in ombra    ' + (m.ombraFraz * 100).toFixed(1) + '% dei ' + m.nPrato + ' campioni di prato (q3 ' + m.q3 + ')');
  if (err.length) console.log('  ERRORI IN PAGINA: ' + err.slice(0, 3).join(' | '));
  console.log('  ' + path.join(RADICE, OUT));
})();
