/* _crit6-home.js — IL TESTO DELLA HOME STA DENTRO LA SUA CASELLA?
   La toppa _t-campo.js scrive nel gioco, accanto al gradino a 9,5 px:
   «a 568 px con 11 px il testo di SPOGLIATOIO traboccava ancora dalla
   casella, con 9,5 px no». Qui si misura scrollWidth contro clientWidth
   di ogni voce (e del suo <small>), che e' la domanda «il testo entra?»
   posta al DOM.
   uso: node strumenti/_crit6-home.js --a CALCETTO-il-gioco.html --b fuori/campocop.html */
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
const TAGLIE = [[568, 320], [640, 360], [667, 375], [700, 400], [740, 360]];
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
    const r = await pag.evaluate(() => {
      const out = [];
      for (const v of document.querySelectorAll('#menu .voce')) {
        const q = v.getBoundingClientRect();
        /* il testo della voce sta nel nodo di testo diretto; si misura il
           contenitore e, se c'e', lo <small> */
        const sm = v.querySelector('small');
        out.push({
          id: v.id || '(senza id)',
          testo: (v.childNodes[0] && v.childNodes[0].textContent || '').trim().slice(0, 14),
          l: Math.round(q.left), r: Math.round(q.right), w: Math.round(q.width),
          sw: v.scrollWidth, cw: v.clientWidth,
          fuoriVetro: Math.round(q.right) > innerWidth,
          smSw: sm ? sm.scrollWidth : -1, smCw: sm ? sm.clientWidth : -1,
        });
      }
      const g = document.querySelector('#menu .menu-voci');
      const gq = g ? g.getBoundingClientRect() : null;
      return { voci: out, griglia: gq ? Math.round(gq.left) + '..' + Math.round(gq.right) : '—', vw: innerWidth };
    });
    await ctx.close(); srv.chiudi();
    return r;
  };
  console.log('\n=== IL TESTO DELLA HOME STA DENTRO LA SUA CASELLA? ===');
  console.log('  «trabocca» = scrollWidth > clientWidth: il testo e\' piu\' largo della casella e viene tagliato.\n');
  for (const [w, h] of TAGLIE) {
    for (const [eti, file] of [['PRIMA', A], ['DOPO ', B]]) {
      const r = await leggi(file, w, h);
      const cattive = r.voci.filter(v => v.sw > v.cw || v.fuoriVetro || (v.smSw > 0 && v.smSw > v.smCw));
      console.log('  ' + (w + 'x' + h).padEnd(10) + eti + '  griglia ' + r.griglia.padEnd(12) + 'vetro ' + r.vw +
        '   caselle che tagliano il testo: ' + cattive.length);
      for (const v of cattive) console.log('        ' + (v.id + ' «' + v.testo + '»').padEnd(34) +
        'x ' + v.l + '..' + v.r + (v.fuoriVetro ? ' FUORI DAL VETRO' : '') +
        '   testo ' + v.sw + ' px in una casella di ' + v.cw + (v.sw > v.cw ? '  TAGLIATO di ' + (v.sw - v.cw) : '') +
        (v.smSw > v.smCw && v.smSw > 0 ? '   · small ' + v.smSw + ' in ' + v.smCw + ' TAGLIATO di ' + (v.smSw - v.smCw) : ''));
    }
    console.log('');
  }
  await browser.close();
})().catch(e => { console.error('BANCO: ' + e.stack); process.exit(2); });
