/* _crit6-pallone.js — quanto misura davvero il pallone-eroe, prima e dopo.
   La toppa dice «A 915x412 non cambia un pixel». Vero. Ma non dice niente
   del VERTICALE, dove min(52vh,27vw) e' governato da 27vw.
   uso: node strumenti/_crit6-pallone.js --a CALCETTO-il-gioco.html --b fuori/campocop.html */
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
const TAGLIE = [
  [412, 915, 'OnePlus 6 IN PIEDI — il telefono del progetto'],
  [360, 740, 'telefono piccolo in piedi'],
  [800, 1280, 'tablet in piedi'],
  [915, 412, 'coricato, la misura storica'],
  [811, 384, 'coricato, il telefono vero'],
  [1024, 600, 'tablet coricato'],
  [1280, 800, 'tablet grande coricato'],
];
(async () => {
  const { chromium } = require('playwright');
  const A = path.resolve(arg('a', 'CALCETTO-il-gioco.html'));
  const B = path.resolve(arg('b', 'fuori/campocop.html'));
  const browser = await chromium.launch();
  const leggi = async (file, w, h) => {
    const srv = await servi(file);
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
    const pag = await ctx.newPage();
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 25000 });
    await pag.evaluate(() => { const t = window.__test; if (t.dismissSplash) t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
    await pag.evaluate(() => { document.getElementById('btnGioca').click(); });
    await pag.waitForTimeout(250);
    const r = await pag.evaluate(() => {
      const p = document.querySelector('#gioca .giocapall');
      const g = document.getElementById('gioca');
      const st = p ? getComputedStyle(p) : null;
      const q = p ? p.getBoundingClientRect() : null;
      const col = document.querySelector('#gioca .giocariga > *:not(.giocapall)');
      return {
        vis: st ? st.display !== 'none' : false,
        w: q ? Math.round(q.width) : 0, h: q ? Math.round(q.height) : 0,
        colonna: col ? Math.round(col.getBoundingClientRect().width) : 0,
        ecc: g.scrollHeight - g.clientHeight,
      };
    });
    await ctx.close(); srv.chiudi();
    return r;
  };
  console.log('\n=== IL PALLONE-EROE, PRIMA E DOPO ===');
  console.log('  A = ' + A + '\n  B = ' + B + '\n');
  console.log('  taglia      pallone prima -> dopo      colonna prima -> dopo   eccedenza');
  for (const [w, h, n] of TAGLIE) {
    const a = await leggi(A, w, h), b = await leggi(B, w, h);
    const f = r => r.vis ? (r.w + 'x' + r.h) : 'NASCOSTO';
    console.log('  ' + (w + 'x' + h).padEnd(10) + f(a).padEnd(12) + '-> ' + f(b).padEnd(14) +
      String(a.colonna).padStart(4) + ' -> ' + String(b.colonna).padStart(4) + '        ' +
      String(a.ecc).padStart(4) + ' -> ' + String(b.ecc).padStart(4) + '   ' + n);
  }
  await browser.close();
})().catch(e => { console.error('BANCO: ' + e.stack); process.exit(2); });
