/* quante righe occupa un testo, e quante ne occuperebbe su una riga sola.
   uso: node strumenti/_diag-acapo.js <file.html> <schermo> <selettore> [larg] [alt] */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const PROVA = path.resolve(process.argv[2]);
const SCHERMO = process.argv[3], SEL = process.argv[4];
const W = +(process.argv[5] || 845), H = +(process.argv[6] || 402);

function servi() {
  return new Promise(ok => {
    const s = http.createServer((rq, rs) => {
      let f = path.join(RADICE, decodeURIComponent(rq.url.split('?')[0]));
      if (/CALCETTO-il-gioco\.html$/i.test(f)) f = PROVA;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { rs.writeHead(404); rs.end(); return; }
      rs.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(rs);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: W, height: H }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pg = await ctx.newPage();
  await pg.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html?t=${Date.now()}`, { waitUntil: 'load' });
  await pg.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pg.evaluate(() => document.fonts.ready);
  await pg.evaluate(() => window.__test.dismissSplash());
  await pg.waitForTimeout(300);
  await pg.evaluate(() => { for (const n of ['buildNegozioUI', 'buildCampiUI', 'buildRosaUI', 'buildTorneoUI', 'buildTrofeiUI', 'buildStatsUI', 'refreshImpostUI']) { try { window[n] && window[n](); } catch (e) {} } });
  await pg.evaluate(i => { const el = document.getElementById(i); if (el && typeof goScreen === 'function') goScreen(el); }, SCHERMO);
  await pg.waitForTimeout(250);
  const out = await pg.evaluate(sel => {
    const r = [];
    for (const el of document.querySelectorAll(sel)) {
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      if (rect.width < 1) continue;
      /* quante righe: si contano i rettangoli che il testo occupa davvero */
      const rng = document.createRange(); rng.selectNodeContents(el);
      const cassette = [...rng.getClientRects()].filter(x => x.height > 1);
      const cime = [...new Set(cassette.map(x => Math.round(x.top)))];
      /* la larghezza su UNA riga sola, misurata su un clone senza a capo */
      const c = el.cloneNode(true);
      c.style.cssText = cs.cssText;
      c.style.position = 'absolute'; c.style.left = '-9999px'; c.style.width = 'auto';
      c.style.whiteSpace = 'nowrap'; c.style.maxWidth = 'none';
      document.body.appendChild(c);
      const unaRiga = c.getBoundingClientRect().width;
      c.remove();
      r.push({
        testo: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40),
        classe: el.className, w: +rect.width.toFixed(1), h: +rect.height.toFixed(1),
        righe: cime.length, unaRiga: +unaRiga.toFixed(1),
        manca: +(unaRiga - rect.width).toFixed(1),
        padre: el.parentElement ? el.parentElement.className + ' ' + (+el.parentElement.getBoundingClientRect().width.toFixed(1)) : '',
      });
    }
    return r;
  }, SEL);
  console.log(`FILE ${path.basename(PROVA)}  ${W}x${H}  schermo ${SCHERMO}  selettore ${SEL}`);
  for (const x of out) {
    console.log(`  «${x.testo}»`);
    console.log(`     largo ${x.w} alto ${x.h}  RIGHE ${x.righe}  su una riga sola servirebbero ${x.unaRiga} (mancano ${x.manca})   padre ${x.padre}`);
  }
  if (!out.length) console.log('  (nessun elemento)');
  await br.close(); srv.chiudi();
})().catch(e => { console.error('ESPLOSO: ' + e.stack); process.exit(2); });
