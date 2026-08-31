/* =====================================================================
   DIAG-TITOLO — perche' in home si legge «CALCETT».

   Misura, a piu' larghezze di finestra:
     - il rettangolo del riquadro (.tabellone, .tab-in) e quello del
       logo (.logo-cal svg);
     - la larghezza VERA del testo dentro il marchio (getComputedTextLength
       sul <text> del simbolo), confrontata con i 634 del viewBox;
     - quale carattere ha davvero risolto la pagina;
     - e in coda: OGNI elemento di testo la cui parola esce dal proprio
       contenitore (scrollWidth > clientWidth).

   uso: node strumenti/_diag-titolo.js [--gioco f.html]
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
function arg(n, d) {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
}
const GIOCO_FUORI = (() => {
  const v = arg('gioco', process.env.GIOCO_PROVA || '');
  if (!v) return '';
  const a = path.resolve(v);
  if (!fs.existsSync(a)) { console.error('PROVA NULLA: ' + a); process.exit(3); }
  return a;
})();
const ridirigi = f => (GIOCO_FUORI && /CALCETTO-il-gioco\.html$/i.test(f)) ? GIOCO_FUORI : f;

function servi() {
  return new Promise(ok => {
    const s = http.createServer((rq, rs) => {
      const u = decodeURIComponent(rq.url.split('?')[0]);
      const f = ridirigi(path.join(RADICE, u === '/' ? 'index.html' : u));
      fs.readFile(f, (e, d) => {
        if (e) { rs.writeHead(404); rs.end('no'); return; }
        const t = f.endsWith('.html') ? 'text/html' : f.endsWith('.js') ? 'text/javascript' : 'application/octet-stream';
        rs.writeHead(200, { 'Content-Type': t + '; charset=utf-8', 'Cache-Control': 'no-store' });
        rs.end(d);
      });
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

const TAGLIE = [
  { n: 'OnePlus6 oriz', w: 845, h: 402 },
  { n: 'iPhone oriz  ', w: 915, h: 412 },
  { n: '812x375      ', w: 812, h: 375 },
  { n: '740x360      ', w: 740, h: 360 },
  { n: '360x740 vert ', w: 360, h: 740 },
  { n: '412x915 vert ', w: 412, h: 915 },
  { n: 'tablet 1112  ', w: 1112, h: 834 },
  { n: 'desktop 1440 ', w: 1440, h: 900 },
];

(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  console.log('\n=== DIAG TITOLO ===');
  for (const t of TAGLIE) {
    const pg = await br.newPage({ viewport: { width: t.w, height: t.h } });
    await pg.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html?t=${Date.now()}`, { waitUntil: 'load' });
    await pg.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pg.evaluate(() => window.__test.dismissSplash());
    await pg.waitForTimeout(700);
    const d = await pg.evaluate(() => {
      const r = el => { if (!el) return null; const b = el.getBoundingClientRect(); return { x: +b.x.toFixed(1), y: +b.y.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) }; };
      const tab = document.querySelector('#menu .tabellone');
      const tin = document.querySelector('#menu .tab-in');
      const svg = document.querySelector('#menu .logo-cal svg');
      const kick = document.querySelector('#menu .tab-kick');
      /* la larghezza vera del lettering: si misura il <text> del simbolo,
         che sta nei defs ma e' comunque misurabile */
      const txt = document.querySelector('#lgShape text');
      let len = null, fam = null;
      try { len = +txt.getComputedTextLength().toFixed(1); } catch (e) { len = 'err ' + e.message; }
      try { fam = getComputedStyle(txt).fontFamily; } catch (e) { }
      const disp = [];
      for (const f of ['Archivo Black', 'Arial Black', 'Impact', 'Anton']) {
        try { disp.push(f + '=' + (document.fonts.check('100px "' + f + '"') ? 'si' : 'NO')); } catch (e) { }
      }
      return {
        tab: r(tab), tin: r(tin), svg: r(svg), kick: r(kick),
        kickTesto: kick ? kick.textContent : '',
        kickScroll: kick ? [kick.scrollWidth, kick.clientWidth] : null,
        kickRighe: kick ? Math.round(kick.getBoundingClientRect().height / parseFloat(getComputedStyle(kick).lineHeight)) : null,
        len, fam, disp: disp.join(' '),
        vb: document.querySelector('#menu .logo-cal svg').getAttribute('viewBox'),
      };
    });
    /* la O sta a cx=561 r=38 stroke 20 -> arriva a 609 nel sistema del
       viewBox; il testo dovrebbe finire attorno a 510 */
    const scala = d.svg ? d.svg.w / 634 : 0;
    console.log(`\n  ${t.n}  ${t.w}x${t.h}`);
    console.log(`     tabellone  ${JSON.stringify(d.tab)}`);
    console.log(`     tab-in     ${JSON.stringify(d.tin)}`);
    console.log(`     svg logo   ${JSON.stringify(d.svg)}   viewBox ${d.vb}  scala ${scala.toFixed(4)}`);
    console.log(`     testo 'CALCETT' largo ${d.len} unita' viewBox  (font: ${d.fam})`);
    console.log(`       la O e' disegnata a 523..609 -> il testo dovrebbe fermarsi a ~510`);
    console.log(`       in pixel: testo ${(d.len * scala).toFixed(1)}px, O fino a ${(609 * scala).toFixed(1)}px`);
    console.log(`     kick "${d.kickTesto}" rect ${JSON.stringify(d.kick)} righe~${d.kickRighe} scroll ${JSON.stringify(d.kickScroll)}`);
    console.log(`     font disponibili: ${d.disp}`);
    if (d.svg && d.tin) {
      const ex = (d.svg.x + d.svg.w) - (d.tin.x + d.tin.w);
      console.log(`     sbordo del riquadro a destra: ${ex.toFixed(1)}px (positivo = esce)`);
    }
    await pg.close();
  }
  await br.close(); srv.chiudi();
})();
