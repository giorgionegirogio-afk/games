/* misura, sul gioco indicato, i numeri che i commenti di _t-campo.js
   dichiarano: eccedenza di #gioca, altezza delle pastiglie, la home
   stretta e la sesta casella. Niente stime. */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');   // mai un percorso cablato: ha gia' fatto sbagliare una bisezione
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const prova = arg('gioco', '') ? path.resolve(RADICE, arg('gioco', '')) : '';

function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (prova && /CALCETTO-il-gioco\.html$/i.test(f)) f = prova;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

const TAGLIE = [[811,384],[915,412],[812,375],[740,360],[640,360],[568,320],[412,915],[360,740],[1024,600],[1280,800],[800,1280]];

(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  console.log('gioco: ' + (prova || 'CALCETTO-il-gioco.html (repo)'));
  console.log('\n  taglia     ecced.#gioca  chevron  pall.w  .diff h  .taglia h  .ment h   CAMBIACAMPO y');
  for (const [w, h] of TAGLIE) {
    const ctx = await br.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true });
    const pg = await ctx.newPage();
    await pg.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pg.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pg.evaluate(() => window.__test.dismissSplash());
    await pg.evaluate(() => document.fonts.ready);
    await pg.waitForTimeout(250);
    const r = await pg.evaluate(() => {
      const g = document.getElementById('gioca');
      if (typeof goScreen === 'function') goScreen(g); else { document.querySelectorAll('.ov').forEach(o=>o.classList.add('hidden')); g.classList.remove('hidden'); }
      return new Promise(res => requestAnimationFrame(() => requestAnimationFrame(() => {
        const alt = s => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().height) : null; };
        const pall = document.querySelector('#gioca .giocapall');
        const cc = document.getElementById('btnCambiaCampo');
        const rr = cc ? cc.getBoundingClientRect() : null;
        res({
          ecc: g.scrollHeight - g.clientHeight,
          chev: !g.classList.contains('senzafade'),
          pall: pall ? Math.round(pall.getBoundingClientRect().width) : 0,
          diff: alt('#gioca .diff'), taglia: alt('#gioca .taglia'), ment: alt('#gioca .ment'),
          cc: rr ? Math.round(rr.top) + '..' + Math.round(rr.bottom) : '-',
          ccHit: rr ? (() => { const el = document.elementFromPoint(rr.left + rr.width/2, rr.top + rr.height/2); return el ? (el.id || el.className || el.tagName) : 'null'; })() : '-',
        });
      })));
    });
    console.log(`  ${(w+'x'+h).padEnd(10)} ${String(r.ecc).padStart(8)}     ${(r.chev?'SI':'no').padEnd(6)} ${String(r.pall).padStart(5)}  ${String(r.diff).padStart(6)}  ${String(r.taglia).padStart(8)}  ${String(r.ment).padStart(7)}   ${r.cc}  -> ${String(r.ccHit).slice(0,22)}`);
    await ctx.close();
  }

  /* la home stretta: la sesta casella */
  console.log('\n  --- la HOME a 568x320 e dintorni: dove finisce NEGOZIO, e quanto vogliono le sei voci');
  for (const [w, h] of [[568,320],[640,360],[740,360],[915,412]]) {
    const ctx = await br.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true });
    const pg = await ctx.newPage();
    await pg.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pg.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pg.evaluate(() => window.__test.dismissSplash());
    await pg.evaluate(() => document.fonts.ready);
    await pg.waitForTimeout(250);
    const r = await pg.evaluate(() => {
      const griglia = document.querySelector('#menu .menu-voci');
      const voci = [...document.querySelectorAll('#menu .voce')];
      /* min-content vero della griglia: si misura clonandola e chiedendo
         width:min-content, che e' esattamente cio' che un 1fr non scende */
      const c = griglia.cloneNode(true);
      c.style.cssText = 'position:absolute;left:-9999px;top:0;width:min-content;grid-template-columns:none;display:flex';
      document.body.appendChild(c);
      const minc = Math.round(c.getBoundingClientRect().width);
      c.remove();
      /* larghezza di min-content di ogni voce, una per una */
      const larghi = voci.map(v => {
        const k = v.cloneNode(true);
        k.style.cssText = getComputedStyle(v).cssText;
        k.style.position = 'absolute'; k.style.left = '-9999px'; k.style.width = 'max-content';
        document.body.appendChild(k);
        const wv = k.getBoundingClientRect().width; k.remove();
        return { t: (v.textContent||'').trim().split('\n')[0].slice(0,12), w: +wv.toFixed(1),
                 x0: Math.round(v.getBoundingClientRect().left), x1: Math.round(v.getBoundingClientRect().right),
                 sw: v.scrollWidth, cw: v.clientWidth };
      });
      const gr = griglia.getBoundingClientRect();
      return { minc, larghi, gx: Math.round(gr.left) + '..' + Math.round(gr.right),
               colonne: getComputedStyle(griglia).gridTemplateColumns,
               scorre: (document.querySelector('#menu .box').scrollHeight - document.querySelector('#menu .box').clientHeight) };
    });
    console.log(`\n  ${w}x${h}: griglia x ${r.gx} (finestra ${w})  colonne ${r.colonne}`);
    console.log('     somma max-content delle voci: ' + r.larghi.reduce((a,b)=>a+b.w,0).toFixed(1) + ' px');
    for (const l of r.larghi) console.log(`       ${l.t.padEnd(13)} max-content ${String(l.w).padStart(6)}  in pagina x ${l.x0}..${l.x1}  sw/cw ${l.sw}/${l.cw}`);
  }

  await br.close(); srv.chiudi();
})();
