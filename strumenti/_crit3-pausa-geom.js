/* _crit3-pausa-geom.js — LA PAUSA CI STA ANCORA NELLO SCHERMO?
   La toppa _t-mentalita.js aggiunge una QUARTA voce al menu di pausa, che
   ne aveva tre. La sonda dell'agente clicca tutto con {force:true}, che
   in Playwright SPEGNE i controlli di raggiungibilita': un bottone fuori
   schermo o coperto viene cliccato lo stesso e la sonda resta verde.
   Qui si misura la geometria vera, su piu' schermi, e si confronta col
   gioco spedito.
   uso: node strumenti/_crit3-pausa-geom.js --gioco fuori/crit-ment.html */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
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
const SCHERMI = [
  { n: 'Pixel landscape 915x412', w: 915, h: 412 },
  { n: 'iPhone X landscape 812x375', w: 812, h: 375 },
  { n: 'Android economico 740x360', w: 740, h: 360 },
  { n: 'Android stretto 640x360', w: 640, h: 360 },
];
(async () => {
  const prova = arg('gioco', '');
  const provaAbs = prova ? path.resolve(prova) : '';
  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  console.log('\n=== GEOMETRIA DELLA PAUSA ===  ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)'));
  for (const S of SCHERMI) {
    const ctx = await browser.newContext({ viewport: { width: S.w, height: S.h }, hasTouch: true, isMobile: true });
    const pag = await ctx.newPage();
    const ecc = [];
    pag.on('pageerror', e => ecc.push(e.message));
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
    await pag.evaluate(() => { window.__test.startMatch(1, 1, { size: 11 }); });
    await pag.waitForTimeout(150);
    await pag.keyboard.press('Escape');
    await pag.waitForTimeout(250);
    const r = await pag.evaluate(() => {
      const ids = ['btnResume', 'btnPauseAudio', 'btnPauseMent', 'btnQuit'];
      const box = document.querySelector('#pausa .box');
      const bb = box ? box.getBoundingClientRect() : null;
      const out = { vh: innerHeight, vw: innerWidth, box: bb ? { t: Math.round(bb.top), b: Math.round(bb.bottom), h: Math.round(bb.height) } : null, voci: [] };
      const ov = document.getElementById('pausa');
      out.ovScroll = ov ? { sh: ov.scrollHeight, ch: ov.clientHeight, overflowY: getComputedStyle(ov).overflowY } : null;
      out.boxScroll = box ? { sh: box.scrollHeight, ch: box.clientHeight, overflowY: getComputedStyle(box).overflowY } : null;
      for (const id of ids) {
        const e = document.getElementById(id);
        if (!e) { out.voci.push({ id, manca: true }); continue; }
        const q = e.getBoundingClientRect();
        const cx = q.left + q.width / 2, cy = q.top + q.height / 2;
        const dentro = q.top >= 0 && q.bottom <= innerHeight && q.left >= 0 && q.right <= innerWidth;
        let colpito = false, chi = '';
        if (cx >= 0 && cy >= 0 && cx < innerWidth && cy < innerHeight) {
          const el = document.elementFromPoint(cx, cy);
          colpito = !!el && (el === e || e.contains(el));
          chi = el ? (el.id || el.className || el.tagName) : 'niente';
        } else { chi = 'centro fuori dal viewport'; }
        out.voci.push({
          id, t: Math.round(q.top), b: Math.round(q.bottom), h: Math.round(q.height),
          dentro, colpito, chi: String(chi).slice(0, 40),
        });
      }
      return out;
    });
    console.log('\n  ' + S.n + '   viewport reale ' + r.vw + 'x' + r.vh);
    if (r.box) console.log('    pannello: top ' + r.box.t + '  bottom ' + r.box.b + '  alto ' + r.box.h + '   (schermo ' + r.vh + ')');
    console.log('    overlay #pausa: scrollHeight ' + r.ovScroll.sh + ' clientHeight ' + r.ovScroll.ch + ' overflow-y ' + r.ovScroll.overflowY);
    console.log('    box .pannello : scrollHeight ' + r.boxScroll.sh + ' clientHeight ' + r.boxScroll.ch + ' overflow-y ' + r.boxScroll.overflowY);
    for (const v of r.voci) {
      if (v.manca) { console.log('    ' + v.id.padEnd(15) + ' ASSENTE'); continue; }
      console.log('    ' + v.id.padEnd(15) + ' y ' + String(v.t).padStart(5) + '..' + String(v.b).padStart(5) +
        '  alto ' + String(v.h).padStart(3) +
        '   dentro:' + (v.dentro ? 'SI ' : 'NO ') + '  raggiungibile:' + (v.colpito ? 'SI' : 'NO  -> sotto il dito c\'e\': ' + v.chi));
    }
    if (ecc.length) console.log('    ECCEZIONI: ' + ecc[0]);
    await ctx.close();
  }
  await browser.close(); srv.chiudi();
})().catch(e => { console.error('FALLITO: ' + e.message); process.exit(1); });
