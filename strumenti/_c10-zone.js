/* _c10-zone.js — tutte le zone d'interfaccia dichiarate, e le distanze
   fra il quinto disco e ogni altra zona. Tre viste, due modi.
   uso: node strumenti/_c10-zone.js --gioco fuori/cmd-terza.html          */
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
const VISTE = [[915, 412], [845, 402], [782, 299], [640, 300]];
(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  for (const [W, H] of VISTE) {
    for (const modo of [1, 2]) {
      const ctx = await br.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
      const pag = await ctx.newPage();
      pag.on('pageerror', e => console.error('  ! ' + e.message));
      await pag.goto('http://127.0.0.1:' + srv.porta + '/CALCETTO-il-gioco.html', { waitUntil: 'load' });
      await pag.evaluate(async () => { try { window.__test.dismissSplash(); } catch (e) { } await document.fonts.ready; });
      await new Promise(r => setTimeout(r, 500));
      const r = await pag.evaluate((m) => {
        const T = window.__test;
        T.semina(20260803); T.startMatch(m, 1);
        T.simulate(2); T.disegna();
        const dischi = [];
        for (let t = 0; t < (m === 2 ? 2 : 1); t++) for (const d of T.pulsanti(t)) dischi.push({ t, ...d });
        return { VW, VH, modo: G.mode, dischi, zone: T.zoneInterfaccia ? T.zoneInterfaccia() : [], comandi: T.comandiTouch };
      }, modo);
      console.log('\n--- ' + W + 'x' + H + ' · modo ' + r.modo + ' · VW ' + r.VW + ' VH ' + r.VH);
      for (const d of r.dischi) console.log('   disco t' + d.t + ' ' + String(d.act).padEnd(8) + ' ' + String(d.label).padEnd(10)
        + ' x ' + Math.round(d.x) + ' y ' + Math.round(d.y) + ' r ' + d.r);
      const q = r.dischi.filter(d => d.act === 'sprint');
      for (const s of q) {
        for (const z of r.zone) {
          if (z.tipo === 'pulsante' || z.tipo === 'stick') continue;
          const cx = Math.max(z.x0, Math.min(s.x, z.x1)), cy = Math.max(z.y0, Math.min(s.y, z.y1));
          const d = Math.hypot(s.x - cx, s.y - cy);
          if (d < s.r + 10) console.log('   >>> il quinto disco t' + s.t + ' INTERSECA la zona «' + z.tipo + '» (alfa ' + z.alfa + ') a ' + d.toFixed(1) + ' px  [' + Math.round(z.x0) + ',' + Math.round(z.y0) + '..' + Math.round(z.x1) + ',' + Math.round(z.y1) + ']');
        }
        const fuori = (s.x - s.r - 10 < 0) || (s.x + s.r + 10 > r.VW) || (s.y - s.r - 10 < 0) || (s.y + s.r + 10 > r.VH);
        if (fuori) console.log('   >>> il quinto disco t' + s.t + ' ESCE dallo schermo');
      }
      const tipi = [...new Set(r.zone.map(z => z.tipo))];
      console.log('   zone dichiarate: ' + tipi.join(', '));
      await ctx.close();
    }
  }
  await br.close(); srv.chiudi();
})();
