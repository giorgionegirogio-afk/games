/* SONDA — le due sorgenti dei pulsanti si possono incrociare?
   Confronta __test.pulsanti(0) (ricalcolato) con __test.comandiTouch
   (riempito DENTRO il disegno) in piu' scene e momenti.
   uso: node strumenti/_sonda-comandi.js [--dir <cartella>] */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const RADICE = path.resolve(arg('dir', path.resolve(__dirname, '..')));
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png' };
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
const attesa = ms => new Promise(r => setTimeout(r, ms));

const leggi = () => {
  const t = window.__test;
  const p = (typeof t.pulsanti === 'function') ? t.pulsanti(0) : null;
  const z = (t.comandiTouch || []).filter(q => q.tipo === 'pulsante');
  return {
    scena: t.scena ? t.scena : (window.G && window.G.scene),
    pulsanti: p ? p.map(b => ({ act: b.act, label: b.label, x: +b.x.toFixed(2), y: +b.y.toFixed(2), r: b.r })) : null,
    zone: z.map(q => ({ act: q.act, label: q.label, team: q.team, x: +q.x.toFixed(2), y: +q.y.toFixed(2), r: q.r, premuto: q.premuto, alpha: q.alpha })),
    nZoneTot: (t.comandiTouch || []).length,
  };
};

(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.waitForTimeout(400);
  console.log('--- MENU (prima di startMatch) ---');
  console.log(JSON.stringify(await pag.evaluate(leggi), null, 1));
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); t.startMatch(1, 1); });
  await pag.waitForTimeout(400);
  console.log('--- SUBITO DOPO startMatch(1,1) ---');
  console.log(JSON.stringify(await pag.evaluate(leggi), null, 1));
  await pag.waitForTimeout(1500);
  console.log('--- 1,5 s DOPO ---');
  console.log(JSON.stringify(await pag.evaluate(leggi), null, 1));
  /* con il possesso forzato: il contesto cambia label/act */
  await pag.evaluate(() => {
    const t = window.__test, G = t.stato ? null : null;
  });
  /* durante una pressione vera */
  const cdp = await ctx.newCDPSession(pag);
  const b = await pag.evaluate(() => window.__test.pulsanti(0)[0]);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: Math.round(b.x), y: Math.round(b.y), id: 1 }] });
  await attesa(200);
  console.log('--- CON IL DITO GIU\' SUL GRANDE ---');
  console.log(JSON.stringify(await pag.evaluate(leggi), null, 1));
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await attesa(300);
  /* pausa */
  await pag.evaluate(() => window.__test.setPaused(true));
  await pag.waitForTimeout(400);
  console.log('--- IN PAUSA ---');
  console.log(JSON.stringify(await pag.evaluate(leggi), null, 1));
  await pag.evaluate(() => window.__test.setPaused(false));
  await br.close(); srv.chiudi();
})();
