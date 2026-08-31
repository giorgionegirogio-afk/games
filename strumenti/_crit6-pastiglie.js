/* _crit6-pastiglie.js — quanto e' alto il bersaglio del pollice, prima e dopo.
   Il progetto si e' dato un pavimento dichiarato: «mai sotto i quarantasei
   pixel» (FISCHIO FINALE, citato dalla toppa stessa nel pezzo E). Il pezzo
   C della toppa toglie 3 px di imbottitura per lato alle pastiglie. Quanto
   restano?
   uso: node strumenti/_crit6-pastiglie.js --a CALCETTO-il-gioco.html --b fuori/campocop.html */
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
const TAGLIE = [[811,384],[915,412],[812,375],[740,360],[640,360],[667,375],[568,320],[1024,600]];
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
      const q = s => { const e = document.querySelector('#gioca ' + s); return e ? Math.round(e.getBoundingClientRect().height) : -1; };
      return { diff: q('.diff'), taglia: q('.taglia'), ment: q('.ment'), btnA: q('.azioni .btnA'), cc: (() => { const e = document.getElementById('btnCambiaCampo'); return e ? Math.round(e.getBoundingClientRect().height) : -1; })() };
    });
    await ctx.close(); srv.chiudi();
    return r;
  };
  console.log('\n=== L\'ALTEZZA DEL BERSAGLIO DEL POLLICE (px), PRIMA -> DOPO ===');
  console.log('  pavimento dichiarato dal progetto: 46 px («mai sotto i quarantasei pixel»)\n');
  console.log('  taglia      DIFFICOLTA\'      ROSA          MENTALITA\'     CAMBIA CAMPO   bottone barra');
  for (const [w, h] of TAGLIE) {
    const a = await leggi(A, w, h), b = await leggi(B, w, h);
    const f = (x, y) => (String(x) + '->' + String(y) + (y < 46 ? ' !' : '  ')).padEnd(14);
    console.log('  ' + (w + 'x' + h).padEnd(11) + f(a.diff, b.diff) + f(a.taglia, b.taglia) + f(a.ment, b.ment) + f(a.cc, b.cc) + f(a.btnA, b.btnA));
  }
  console.log('\n  «!» = sotto i 46 px del pavimento dichiarato.');
  await browser.close();
})().catch(e => { console.error('BANCO: ' + e.stack); process.exit(2); });
