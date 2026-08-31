/* la settima colonna: si puo' o no? Si prova invece di dedurlo. */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');
function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
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
  for (const [w, h] of [[568,320],[640,360],[700,360],[568,470]]) {
    const ctx = await br.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true });
    const pg = await ctx.newPage();
    await pg.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pg.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pg.evaluate(() => window.__test.dismissSplash());
    await pg.evaluate(() => document.fonts.ready);
    await pg.waitForTimeout(250);
    for (const [nome, css] of [
      ['OGGI (6 colonne)', ''],
      ['7 colonne', '#menu .menu-voci{grid-template-columns:1.5fr repeat(6,minmax(0,1fr)) !important}'],
      ['7 colonne pari', '#menu .menu-voci{grid-template-columns:repeat(7,minmax(0,1fr)) !important}'],
      ['4 colonne (2 righe piene)', '#menu .menu-voci{grid-template-columns:repeat(4,minmax(0,1fr)) !important}'],
    ]) {
      const r = await pg.evaluate(async css => {
        document.querySelectorAll('style[data-prova]').forEach(s => s.remove());
        if (css) { const s = document.createElement('style'); s.dataset.prova = '1'; s.textContent = css; document.head.appendChild(s); }
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        const voci = [...document.querySelectorAll('#menu .voce')];
        const righe = {};
        for (const v of voci) { const t = Math.round(v.getBoundingClientRect().top); righe[t] = (righe[t] || 0) + 1; }
        const tagliati = voci.filter(v => {
          const s = v.querySelector('span,b') || v;
          return v.scrollWidth - v.clientWidth > 1;
        }).map(v => (v.textContent||'').trim().split('\n')[0].slice(0,12) + ' sw' + v.scrollWidth + '/cw' + v.clientWidth);
        /* e il testo che sborda davvero: si guarda il nodo di testo del titolo */
        const sborda = voci.map(v => {
          const range = document.createRange(); range.selectNodeContents(v);
          const rb = range.getBoundingClientRect(); const vb = v.getBoundingClientRect();
          return { t: (v.textContent||'').trim().split('\n')[0].slice(0,12),
                   over: +(Math.max(0, vb.left - rb.left) + Math.max(0, rb.right - vb.right)).toFixed(1) };
        }).filter(x => x.over > 1);
        /* quante righe di testo prende ogni etichetta: e' li' che si vede
           se la colonna e' troppo stretta, non nel traboccamento */
        const capo = voci.map(v => {
          const n = [...v.childNodes].find(x => x.nodeType === 3 && x.nodeValue.trim());
          if (!n) return null;
          const range = document.createRange(); range.selectNode(n);
          return { t: n.nodeValue.trim().slice(0, 12), righe: range.getClientRects().length };
        }).filter(Boolean);
        return { righe: Object.entries(righe).map(([y,n]) => n).join('+'), tagliati, sborda,
                 acapo: capo.filter(c => c.righe > 1).map(c => c.t + ' x' + c.righe) };
      }, css);
      console.log(`  ${(w+'x'+h).padEnd(9)} ${nome.padEnd(28)} righe ${r.righe.padEnd(8)} tagliati [${r.tagliati.join(', ')}]  sborda [${r.sborda.map(s=>s.t+' +'+s.over).join(', ')}]  ACAPO [${r.acapo.join(", ")}]`);
    }
    console.log('');
    await ctx.close();
  }
  await br.close(); srv.chiudi();
})();
