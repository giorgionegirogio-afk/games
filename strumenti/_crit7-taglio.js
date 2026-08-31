/* CRITICO: nella fessura che testo-fuori.js NON copre (larghezza<=700 E
   altezza<=470) il testo della home viene tagliato? Si misura il nodo di
   testo con un Range, non il contenitore, e si fotografa. */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i+1] && !process.argv[i+1].startsWith('--') ? process.argv[i+1] : d; };
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'CALCETTO-il-gioco.html')));
const TAG = arg('tag', 'x');
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
  for (const [w, h] of [[568,320],[640,360],[700,470],[480,320]]) {
    const ctx = await br.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true });
    const pg = await ctx.newPage();
    await pg.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html?t=${Date.now()}`, { waitUntil: 'load' });
    await pg.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pg.evaluate(() => window.__test.dismissSplash());
    await pg.evaluate(() => document.fonts.ready);
    await pg.waitForTimeout(350);
    const r = await pg.evaluate(() => {
      const out = [];
      for (const v of document.querySelectorAll('#menu .voce')) {
        const vb = v.getBoundingClientRect();
        for (const n of v.childNodes) {
          let nodo = null, et = '';
          if (n.nodeType === 3 && n.nodeValue.trim()) { nodo = n; et = 'titolo'; }
          else if (n.nodeType === 1 && n.tagName === 'SMALL' && getComputedStyle(n).display !== 'none') { nodo = n; et = 'small'; }
          if (!nodo) continue;
          const rg = document.createRange();
          if (nodo.nodeType === 3) rg.selectNode(nodo); else rg.selectNodeContents(nodo);
          const rb = rg.getBoundingClientRect();
          out.push({ voce: (v.textContent||'').trim().split('\n')[0].slice(0,12), et,
            testo: (nodo.textContent||'').trim().slice(0, 24),
            largo: +rb.width.toFixed(1), cella: +vb.width.toFixed(1),
            fuoriSx: +Math.max(0, vb.left - rb.left).toFixed(1),
            fuoriDx: +Math.max(0, rb.right - vb.right).toFixed(1),
            righe: rg.getClientRects().length,
            oltreVetro: +Math.max(0, rb.right - innerWidth).toFixed(1) });
        }
      }
      return out;
    });
    const guai = r.filter(x => x.fuoriSx > 0.5 || x.fuoriDx > 0.5 || x.righe > 1 || x.oltreVetro > 0.5);
    console.log(`${(w+'x'+h).padEnd(9)} ${r.length} nodi di testo, guai: ${guai.length}`);
    for (const g of guai) console.log(`    X ${g.voce}/${g.et} «${g.testo}» largo ${g.largo} in cella ${g.cella} — sx ${g.fuoriSx} dx ${g.fuoriDx} righe ${g.righe} oltre vetro ${g.oltreVetro}`);
    const stretti = r.filter(x => x.cella - x.largo < 6);
    for (const s of stretti) console.log(`    ~ ${s.voce}/${s.et} «${s.testo}» largo ${s.largo} in cella ${s.cella} (margine ${(s.cella-s.largo).toFixed(1)} px)`);
    await pg.screenshot({ path: path.join(RADICE, `fuori/crit7-home-${w}x${h}-${TAG}.png`) });
    await ctx.close();
  }
  await br.close(); srv.chiudi();
})();
