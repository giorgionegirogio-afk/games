/* CRITICO: quale carattere disegna DAVVERO il marchio? */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i+1] && !process.argv[i+1].startsWith('--') ? process.argv[i+1] : d; };
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'CALCETTO-il-gioco.html')));
function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (/CALCETTO-il-gioco\.html$/i.test(f)) f = GIOCO;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 915, height: 412 } });
  const pg = await ctx.newPage();
  const cdp = await ctx.newCDPSession(pg);
  await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
  await pg.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html?t=${Date.now()}`, { waitUntil: 'load' });
  await pg.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pg.evaluate(() => document.fonts.ready);
  await pg.evaluate(() => window.__test.dismissSplash());
  await pg.waitForTimeout(400);
  const misure = await pg.evaluate(() => {
    const t = [...document.querySelectorAll('svg text')].filter(e => /CALCETT/i.test(e.textContent||''))[0];
    const tl = t.getAttribute('textLength');
    if (tl) t.removeAttribute('textLength');
    const nat = +t.getComputedTextLength().toFixed(2);
    if (tl) t.setAttribute('textLength', tl);
    const c = document.createElement('canvas').getContext('2d');
    const L = f => { c.font = '400 100px ' + f; return +c.measureText('CALCETT').width.toFixed(2); };
    return { naturaleSVG: nat, dichiarata: getComputedStyle(t).fontFamily,
             canvasArchivo: L("'Archivo Black'"), canvasArialBlack: L("'Arial Black'"),
             canvasSerif: L('serif'), canvasSans: L('sans-serif'), canvasRoboto: L('Roboto') };
  });
  console.log(JSON.stringify(misure, null, 1));
  /* e la verita' vera: quale font il motore ha usato per quel nodo */
  const { root } = await cdp.send('DOM.getDocument', { depth: -1, pierce: true });
  const q = await cdp.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: 'svg text' });
  for (const id of q.nodeIds) {
    try {
      const f = await cdp.send('CSS.getPlatformFontsForNode', { nodeId: id });
      if (f.fonts && f.fonts.length) console.log('  nodo ' + id + ' -> ' + f.fonts.map(x => x.familyName + ' x' + x.glyphCount).join(' | '));
    } catch (e) { /* nodo senza rendering */ }
  }
  await br.close(); srv.chiudi();
})();
