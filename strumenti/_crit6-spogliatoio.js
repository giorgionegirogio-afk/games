/* _crit6-spogliatoio.js — la parola SPOGLIATOIO entra o viene tagliata?
   uso: node strumenti/_crit6-spogliatoio.js --gioco fuori/campocop.html --w 568 --h 320 */
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
(async () => {
  const { chromium } = require('playwright');
  const prova = arg('gioco', ''); const provaAbs = prova ? path.resolve(prova) : '';
  const W = +arg('w', 568), H = +arg('h', 320);
  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true });
  const pag = await ctx.newPage();
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 25000 });
  await pag.evaluate(() => { const t = window.__test; if (t.dismissSplash) t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
  await pag.waitForTimeout(250);
  const r = await pag.evaluate(() => {
    const out = [];
    for (const v of document.querySelectorAll('#menu .voce')) {
      const st = getComputedStyle(v), q = v.getBoundingClientRect();
      const n = [...v.childNodes].find(x => x.nodeType === 3 && x.textContent.trim());
      let righe = 0, tw = 0, tl = 0, tr = 0, testo = '';
      if (n) {
        const rg = document.createRange(); rg.selectNodeContents(n);
        const rects = [...rg.getClientRects()];
        righe = rects.length;
        const b = rg.getBoundingClientRect();
        tw = Math.round(b.width); tl = Math.round(b.left); tr = Math.round(b.right);
        testo = n.textContent.trim();
      }
      const cl = q.left + parseFloat(st.paddingLeft), cr = q.right - parseFloat(st.paddingRight);
      out.push({
        id: v.id || '?', testo, righe,
        cella: Math.round(q.left) + '..' + Math.round(q.right) + ' (' + Math.round(q.width) + ')',
        contenuto: Math.round(cl) + '..' + Math.round(cr) + ' (' + Math.round(cr - cl) + ')',
        testoRett: tl + '..' + tr + ' (' + tw + ')',
        sborda: Math.round(Math.max(0, tr - cr) + Math.max(0, cl - tl)),
        ovf: st.overflow, ws: st.whiteSpace, fs: st.fontSize, ls: st.letterSpacing,
        altezzaRiga: st.lineHeight, hCella: Math.round(q.height),
        clipVerticale: v.scrollHeight > v.clientHeight ? (v.scrollHeight - v.clientHeight) : 0,
      });
    }
    return { out, vw: innerWidth, vh: innerHeight };
  });
  console.log('\n=== LE SEI VOCI DELLA HOME a ' + W + 'x' + H + ' ===  ' + (provaAbs || 'repo'));
  for (const v of r.out) {
    console.log('\n  ' + v.id + '  «' + v.testo + '»');
    console.log('    cella      ' + v.cella + '   contenuto ' + v.contenuto);
    console.log('    testo      ' + v.testoRett + '   righe di testo: ' + v.righe + (v.sborda ? '   SBORDA di ' + v.sborda + ' px' : ''));
    console.log('    stile      corpo ' + v.fs + '  spaziatura ' + v.ls + '  overflow ' + v.ovf + '  a capo ' + v.ws +
      '   taglio verticale ' + v.clipVerticale + ' px (cella alta ' + v.hCella + ', riga ' + v.altezzaRiga + ')');
  }
  await browser.close(); srv.chiudi();
})().catch(e => { console.error('BANCO: ' + e.stack); process.exit(2); });
