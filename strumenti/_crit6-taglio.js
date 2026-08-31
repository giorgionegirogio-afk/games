/* =====================================================================
   _crit6-taglio.js — IL TESTO ENTRA NELLA CASELLA *TAGLIATA*?

   Ogni .voce del gioco porta, dalla riga 435 del foglio di stile:
     .taglio,.voce,.btnA{clip-path:polygon(14px 0,100% 0,calc(100% - 14px) 100%,0 100%)}
   cioe' e' un PARALLELOGRAMMA: il bordo destro utile non e' «larghezza -
   padding», ma scende in diagonale fino a «larghezza - 14px» in fondo. E
   il testo della home sta IN FONDO (justify-content:flex-end).
   Chi misura getBoundingClientRect o scrollWidth non vede il taglio e
   legge «entra» su una parola che sullo schermo perde l'ultima lettera.

   Qui il bordo destro si calcola alla y VERA della riga di testo.
   uso: node strumenti/_crit6-taglio.js --gioco fuori/campocop.html --w 568 --h 320
   ===================================================================== */
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
const TAGLIE = [[568, 320], [640, 360], [667, 375], [700, 400], [740, 360], [811, 384]];
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
    await pag.waitForTimeout(250);
    const r = await pag.evaluate(() => {
      const out = [];
      const provaClip = el => {
        const cp = getComputedStyle(el).clipPath || '';
        const m = cp.match(/polygon\(([^)]*)\)/);
        return m ? m[1] : '';
      };
      const misuraTesto = (v, n) => {
        const rg = document.createRange(); rg.selectNodeContents(n);
        return rg.getBoundingClientRect();
      };
      for (const v of document.querySelectorAll('#menu .voce')) {
        const q = v.getBoundingClientRect();
        const clip = provaClip(v);
        /* il taglio del gioco: il vertice basso-destro sta a (100% - 14px).
           Il bordo destro utile alla quota y e':
             right - 14 * (y - top) / altezza                            */
        const pezzi = [];
        for (const n of v.childNodes) if (n.nodeType === 3 && n.textContent.trim()) pezzi.push({ t: n.textContent.trim(), n, kind: 'voce' });
        const sm = v.querySelector('small');
        if (sm && getComputedStyle(sm).display !== 'none') pezzi.push({ t: sm.textContent.trim(), n: sm, kind: 'small' });
        for (const p of pezzi) {
          const b = misuraTesto(v, p.n);
          const yBasso = b.bottom;                       /* la riga peggiore e' la piu' bassa */
          const f = q.height ? (yBasso - q.top) / q.height : 0;
          const destroUtile = q.right - 14 * Math.max(0, Math.min(1, f));
          const sinistroUtile = q.left + 14 * (1 - Math.max(0, Math.min(1, (b.top - q.top) / (q.height || 1))));
          out.push({
            id: v.id || '?', kind: p.kind, txt: p.t.slice(0, 26),
            tl: +b.left.toFixed(1), tr: +b.right.toFixed(1),
            dl: +sinistroUtile.toFixed(1), dr: +destroUtile.toFixed(1),
            tagliatoDx: +Math.max(0, b.right - destroUtile).toFixed(1),
            tagliatoSx: +Math.max(0, sinistroUtile - b.left).toFixed(1),
            clip: clip ? 'si' : 'no',
            fs: getComputedStyle(p.kind === 'small' ? p.n : v).fontSize,
          });
        }
      }
      return { out, vw: innerWidth };
    });
    await ctx.close(); srv.chiudi();
    return r;
  };
  console.log('\n=== IL TESTO DELLA HOME ENTRA NELLA CASELLA TAGLIATA? ===');
  console.log('  il taglio: clip-path:polygon(14px 0,100% 0,calc(100% - 14px) 100%,0 100%)');
  console.log('  «mangiato» = px di glifi oltre il bordo del parallelogramma, alla quota della riga.\n');
  for (const [w, h] of TAGLIE) {
    for (const [eti, file] of [['PRIMA', A], ['DOPO ', B]]) {
      const r = await leggi(file, w, h);
      const male = r.out.filter(v => v.tagliatoDx > 0.5 || v.tagliatoSx > 0.5);
      console.log('  ' + (w + 'x' + h).padEnd(10) + eti + '  parole mangiate dal taglio: ' + male.length + ' su ' + r.out.length);
      for (const v of male) console.log('        ' + (v.id + '/' + v.kind + ' «' + v.txt + '»').padEnd(46) +
        'testo ' + v.tl + '..' + v.tr + '   taglio ' + v.dl + '..' + v.dr +
        '   MANGIATO ' + (v.tagliatoSx > .5 ? v.tagliatoSx + ' px a sinistra ' : '') + (v.tagliatoDx > .5 ? v.tagliatoDx + ' px a destra' : '') + '   (' + v.fs + ')');
    }
    console.log('');
  }
  await browser.close();
})().catch(e => { console.error('BANCO: ' + e.stack); process.exit(2); });
