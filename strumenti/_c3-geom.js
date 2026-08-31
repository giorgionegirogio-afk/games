/* misura la geometria vera dei dischi e i margini di presa */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = 'C:/Users/Utenteee/Desktop/GitHub/games';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : d; };
const GIOCO = path.resolve(arg('gioco', RADICE + '/fuori/cmd-terza-base.html'));
const VW = +arg('vw', 915), VH = +arg('vh', 412);
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
(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const pag = await ctx.newPage();
  await pag.goto('http://127.0.0.1:' + srv.porta + '/CALCETTO-il-gioco.html', { waitUntil: 'load' });
  await pag.evaluate(async () => { try { window.__test.dismissSplash(); } catch (e) { } await document.fonts.ready; });
  await new Promise(r => setTimeout(r, 700));
  await pag.evaluate(() => { window.__test.semina(20260828); window.__test.startMatch(1, 1, { size: 11 }); });
  await new Promise(r => setTimeout(r, 500));
  const o = await pag.evaluate(() => {
    return { VW: VW, VH: VH, DPR: DPR, latSx: (typeof latSx !== 'undefined' ? latSx : null),
             btn: window.__test.pulsanti(0), zone: window.__test.zoneInterfaccia ? window.__test.zoneInterfaccia() : null };
  });
  console.log('VW=' + o.VW + ' VH=' + o.VH + ' DPR=' + o.DPR);
  for (const b of o.btn) console.log('  ' + b.act.padEnd(9) + b.label.padEnd(11) + ' x=' + b.x.toFixed(1) + ' y=' + b.y.toFixed(1) + ' r=' + b.r + ' presa=' + (b.r + 10));
  console.log('  margini di presa (dist - prese sommate):');
  for (let i = 0; i < o.btn.length; i++) for (let j = i + 1; j < o.btn.length; j++) {
    const a = o.btn[i], b = o.btn[j];
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    console.log('    ' + a.label + '-' + b.label + '  d=' + d.toFixed(1) + '  prese=' + (a.r + b.r + 20) + '  margine=' + (d - a.r - b.r - 20).toFixed(1));
  }
  /* quanto schermo mangiano i dischi (area delle pastiglie) */
  let area = 0; for (const b of o.btn) area += Math.PI * b.r * b.r;
  console.log('  area dei dischi: ' + area.toFixed(0) + ' px2 su ' + (o.VW * o.VH) + ' = ' + (100 * area / (o.VW * o.VH)).toFixed(2) + '%');
  if (o.zone) { console.log('  zoneInterfaccia:'); for (const z of o.zone) console.log('    ' + JSON.stringify(z)); }
  await br.close(); srv.chiudi();
})();
