/* _crit6-testo.js — il TESTO (i glifi, non la casella) sta dentro?
   scrollWidth non basta: si misura il rettangolo vero dei caratteri con
   un Range sul nodo di testo, e lo si confronta col riquadro di contenuto
   della casella e col vetro.
   uso: node strumenti/_crit6-testo.js --a CALCETTO-il-gioco.html --b fuori/campocop.html */
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
const TAGLIE = [[568, 320], [640, 360], [667, 375], [700, 400]];
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
    await pag.waitForTimeout(200);
    return await pag.evaluate(() => {
      const out = [];
      const larghezzaTesto = n => { const r = document.createRange(); r.selectNodeContents(n); const q = r.getBoundingClientRect(); return q; };
      for (const v of document.querySelectorAll('#menu .voce')) {
        const st = getComputedStyle(v);
        const q = v.getBoundingClientRect();
        const dentroL = q.left + parseFloat(st.paddingLeft) + parseFloat(st.borderLeftWidth);
        const dentroR = q.right - parseFloat(st.paddingRight) - parseFloat(st.borderRightWidth);
        for (const n of v.childNodes) {
          if (n.nodeType === 3 && n.textContent.trim()) {
            const t = larghezzaTesto(n);
            out.push({ id: v.id || '?', txt: n.textContent.trim().slice(0, 16), tipo: 'voce',
              tl: Math.round(t.left), tr: Math.round(t.right), tw: Math.round(t.width),
              cl: Math.round(dentroL), cr: Math.round(dentroR), cw: Math.round(dentroR - dentroL), fs: st.fontSize });
          }
        }
        const sm = v.querySelector('small');
        if (sm && getComputedStyle(sm).display !== 'none') {
          const sst = getComputedStyle(sm), sq = sm.getBoundingClientRect();
          const t = larghezzaTesto(sm);
          out.push({ id: v.id || '?', txt: sm.textContent.trim().slice(0, 20), tipo: 'small',
            tl: Math.round(t.left), tr: Math.round(t.right), tw: Math.round(t.width),
            cl: Math.round(sq.left), cr: Math.round(sq.right), cw: Math.round(sq.width), fs: sst.fontSize });
        }
      }
      return { out, vw: innerWidth };
    }).finally(async () => { await ctx.close(); srv.chiudi(); });
  };
  console.log('\n=== I GLIFI DELLA HOME STANNO DENTRO LA CASELLA? ===');
  console.log('  «sborda» = il rettangolo dei caratteri e\' piu\' largo del riquadro di contenuto della casella.\n');
  for (const [w, h] of TAGLIE) {
    for (const [eti, file] of [['PRIMA', A], ['DOPO ', B]]) {
      const r = await leggi(file, w, h);
      const male = r.out.filter(v => v.tw > v.cw + 0.5 || v.tr > r.vw);
      console.log('  ' + (w + 'x' + h).padEnd(10) + eti + '  glifi che sbordano: ' + male.length + ' su ' + r.out.length);
      for (const v of male) console.log('        ' + (v.id + '/' + v.tipo + ' «' + v.txt + '»').padEnd(42) +
        'testo ' + v.tw + ' px x ' + v.tl + '..' + v.tr + '   casella ' + v.cw + ' px x ' + v.cl + '..' + v.cr +
        '   SBORDA di ' + (v.tw - v.cw) + ' px   (' + v.fs + ')' + (v.tr > r.vw ? '  E ESCE DAL VETRO ' + r.vw : ''));
    }
    console.log('');
  }
  await browser.close();
})().catch(e => { console.error('BANCO: ' + e.stack); process.exit(2); });
