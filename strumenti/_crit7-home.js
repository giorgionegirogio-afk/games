/* CRITICO: la home a molte taglie, sul file VERO (non con !important addosso). */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = 'C:/Users/Utenteee/Desktop/GitHub/games';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i+1] && !process.argv[i+1].startsWith('--') ? process.argv[i+1] : d; };
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(GIOCO)) { console.error('non esiste ' + GIOCO); process.exit(3); }
function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const u = decodeURIComponent(req.url.split('?')[0]);
      let f = path.join(RADICE, u);
      if (/CALCETTO-il-gioco\.html$/i.test(f)) f = GIOCO;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
const TAGLIE = [[568,320],[600,320],[640,360],[653,320],[700,360],[700,470],[740,360],[812,375],[845,402],[915,412],[568,470],[480,320],[412,915],[360,640]];
(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  console.log('GIOCO: ' + GIOCO + '\n');
  for (const [w, h] of TAGLIE) {
    const ctx = await br.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true });
    const pg = await ctx.newPage();
    await pg.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html?t=${Date.now()}`, { waitUntil: 'load' });
    await pg.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pg.evaluate(() => window.__test.dismissSplash());
    await pg.evaluate(() => document.fonts.ready);
    await pg.waitForTimeout(300);
    const r = await pg.evaluate(() => {
      const mv = document.querySelector('#menu .menu-voci');
      const cs = mv ? getComputedStyle(mv) : null;
      const voci = [...document.querySelectorAll('#menu .voce')];
      const righe = {};
      for (const v of voci) { const t = Math.round(v.getBoundingClientRect().top); righe[t] = (righe[t]||0)+1; }
      const info = voci.map(v => {
        const b = v.getBoundingClientRect();
        const n = [...v.childNodes].find(x => x.nodeType === 3 && x.nodeValue.trim());
        let nrighe = 0, testo = '';
        if (n) { const rg = document.createRange(); rg.selectNode(n); nrighe = rg.getClientRects().length; testo = n.nodeValue.trim(); }
        const rg2 = document.createRange(); rg2.selectNodeContents(v); const rb = rg2.getBoundingClientRect();
        const over = +(Math.max(0, b.left - rb.left) + Math.max(0, rb.right - b.right)).toFixed(1);
        const centro = { x: Math.round(b.left + b.width/2), y: Math.round(b.top + b.height/2) };
        const hit = document.elementFromPoint(centro.x, centro.y);
        return { testo, x: Math.round(b.left) + '..' + Math.round(b.right), y: Math.round(b.top) + '..' + Math.round(b.bottom),
                 w: +b.width.toFixed(1), h: +b.height.toFixed(1), nrighe, over,
                 sw: v.scrollWidth, cw: v.clientWidth,
                 dentro: b.left >= -0.5 && b.right <= innerWidth + 0.5 && b.top >= -0.5 && b.bottom <= innerHeight + 0.5,
                 tocca: !!(hit && (hit === v || v.contains(hit))) };
      });
      return { cols: cs ? cs.gridTemplateColumns : '-', display: cs ? cs.display : '-',
               righe: Object.values(righe).join('+'), info,
               vw: innerWidth, vh: innerHeight };
    });
    const fuoriV = r.info.filter(i => !i.dentro).map(i => i.testo);
    const acapo = r.info.filter(i => i.nrighe > 1).map(i => i.testo + ' x' + i.nrighe);
    const sborda = r.info.filter(i => i.over > 1).map(i => i.testo + ' +' + i.over);
    const nontocca = r.info.filter(i => !i.tocca).map(i => i.testo);
    console.log(`${(w+'x'+h).padEnd(9)} righe ${r.righe.padEnd(6)} cols[${r.cols.slice(0,70)}]`);
    console.log(`          FUORI[${fuoriV.join(',')}]  ACAPO[${acapo.join(',')}]  SBORDA[${sborda.join(',')}]  NONTOCCA[${nontocca.join(',')}]`);
    if (process.argv.includes('--dettaglio')) for (const i of r.info) console.log(`            ${i.testo.padEnd(13)} x ${i.x.padEnd(11)} y ${i.y.padEnd(11)} ${String(i.w).padStart(6)}x${String(i.h).padEnd(5)} righe${i.nrighe} sw${i.sw}/cw${i.cw}`);
    await ctx.close();
  }
  await br.close(); srv.chiudi();
})();
