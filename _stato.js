/* _stato.js — quale pezzo di stato NON viene azzerato da startMatch?
   Fotografa tutti i campi primitivi di G subito dopo startMatch, due volte
   di seguito (con rAF vero in mezzo), e ne stampa la differenza.        */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname);
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(RADICE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
const SNAP = () => {
  const t = window.__test;
  window.__risemina(20260728);
  t.dismissSplash && t.dismissSplash();
  t.setDalt(true); t.startMatch(1, 1); t.setCpuVsCpu(true);
  const G = t.G, o = {};
  for (const k in G) {
    const v = G[k];
    if (v == null || typeof v === 'number' || typeof v === 'boolean' || typeof v === 'string') o['G.' + k] = v;
    else if (Array.isArray(v) && v.every(x => typeof x === 'number' || typeof x === 'boolean')) o['G.' + k] = JSON.stringify(v);
    else if (Array.isArray(v)) o['G.' + k + '.len'] = v.length;
    else if (typeof v === 'object') { for (const j in v) { const w = v[j]; if (typeof w === 'number' || typeof w === 'boolean' || typeof w === 'string') o['G.' + k + '.' + j] = w; } }
  }
  /* la camera dopo UN disegno: e' li' che si vedeva la differenza */
  t.disegna();
  o['view.S2'] = t.view.S2; o['view.Ax'] = t.view.Ax; o['view.Ay'] = t.view.Ay;
  o['cam.x'] = G.cam.x; o['cam.y'] = G.cam.y; o['cam.z'] = G.cam.z;
  t.setDalt(false);
  return o;
};
(async () => {
  const srv = await servi();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(seme => {
    let s = seme >>> 0 || 1;
    window.__risemina = n => { s = (n >>> 0) || 1; };
    const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => p() / 4294967296;
  }, 20260728);
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.waitForTimeout(400);
  const a = await pag.evaluate(SNAP);
  await pag.waitForTimeout(250);
  const b = await pag.evaluate(SNAP);
  await pag.waitForTimeout(430);
  const c = await pag.evaluate(SNAP);
  const chiavi = new Set([...Object.keys(a), ...Object.keys(b), ...Object.keys(c)]);
  console.log('DIFFERENZE fra la 1a e la 2a chiamata (e la 3a):');
  for (const k of chiavi) {
    if (JSON.stringify(a[k]) !== JSON.stringify(b[k]) || JSON.stringify(b[k]) !== JSON.stringify(c[k]))
      console.log(`  ${k}: ${JSON.stringify(a[k])} | ${JSON.stringify(b[k])} | ${JSON.stringify(c[k])}`);
  }
  await browser.close(); srv.chiudi();
})().catch(e => { console.error(e); process.exit(1); });
