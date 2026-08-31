/* _c10-tut.js — la barra del tutorial (#tut, .tutbox ha pointer-events:auto)
   contro il quinto disco: si misura la sovrapposizione fotogramma per
   fotogramma nella PRIMA partita, quella in cui il tutorial gira.
   uso: node strumenti/_c10-tut.js --gioco fuori/cmd-terza.html            */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'fuori/cmd-terza.html')));
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png' };
function servi() {
  return new Promise(ok => {
    const s = http.createServer((rq, rs) => {
      const u = decodeURIComponent(rq.url.split('?')[0]);
      let f = path.join(RADICE, u === '/' ? 'index.html' : u);
      if (/CALCETTO-il-gioco\.html$/i.test(f)) f = GIOCO;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { rs.writeHead(404); rs.end(); return; }
      rs.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(rs);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
const VISTE = [[915, 412], [845, 402], [782, 299]];
(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  for (const [W, H] of VISTE) {
    const ctx = await br.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
    const pag = await ctx.newPage();
    pag.on('pageerror', e => console.error('  ! ' + e.message));
    await pag.goto('http://127.0.0.1:' + srv.porta + '/CALCETTO-il-gioco.html', { waitUntil: 'load' });
    await pag.evaluate(async () => { try { window.__test.dismissSplash(); } catch (e) { } await document.fonts.ready; });
    await new Promise(r => setTimeout(r, 500));
    const r = await pag.evaluate(() => {
      const T = window.__test;
      try { localStorage.clear(); } catch (e) { }
      if (typeof SAVE !== 'undefined') SAVE.tutorialDone = false;
      T.semina(20260803); T.startMatch(1, 1);
      const el = document.getElementById('tut');
      let attivo = 0, peggio = 0, dove = null, bots = {};
      for (let f = 0; f < 900; f++) {
        T.simulate(1 / 60); T.disegna();
        if (typeof Tut === 'undefined' || !Tut.active) continue;
        attivo++;
        const box = el.querySelector('.tutbox') || el;
        const b = box.getBoundingClientRect();
        bots[el.style.bottom || '(css)'] = (bots[el.style.bottom || '(css)'] || 0) + 1;
        for (const d of T.pulsanti(0)) {
          const R = d.r + 4;
          const ox = Math.max(0, Math.min(b.right, d.x + R) - Math.max(b.left, d.x - R));
          const oy = Math.max(0, Math.min(b.bottom, d.y + R) - Math.max(b.top, d.y - R));
          const a = ox * oy;
          if (a > peggio) { peggio = a; dove = { act: d.act, label: d.label, dx: Math.round(d.x), dy: Math.round(d.y), ox: +ox.toFixed(1), oy: +oy.toFixed(1), box: [Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)] }; }
        }
      }
      return { VW, VH, attivo, peggio: +peggio.toFixed(0), dove, bots, pe: getComputedStyle(el.querySelector('.tutbox') || el).pointerEvents };
    });
    console.log('\n--- ' + W + 'x' + H + '  (VW ' + r.VW + ' VH ' + r.VH + ')  tutorial vivo in ' + r.attivo + ' fotogrammi su 900');
    console.log('   pointer-events della .tutbox: ' + r.pe + '   ·   quote «bottom» viste: ' + JSON.stringify(r.bots));
    console.log('   sovrapposizione peggiore col riquadro dichiarato di un disco: ' + r.peggio + ' px2  ' + (r.dove ? JSON.stringify(r.dove) : ''));
    await ctx.close();
  }
  await br.close(); srv.chiudi();
})();
