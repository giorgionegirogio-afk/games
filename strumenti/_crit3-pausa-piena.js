/* _crit3-pausa-piena.js — LA PAUSA VERA, quella di meta' partita.
   Il blocco #pausaStat (possesso + falli) e' NASCOSTO nei primi secondi e
   compare appena ci sono tre secondi di possesso campionato o un fallo:
   cioe' in ogni pausa vera. Qui si misura la pausa PIENA, con e senza la
   quarta voce di _t-mentalita.js, e si guarda se ABBANDONA resta sullo
   schermo. Il tocco si prova con Touchscreen.tap alle coordinate vere,
   NON con click({force:true}).
   uso: node strumenti/_crit3-pausa-piena.js --gioco fuori/crit-ment.html */
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
  { n: 'Pixel  landscape 915x412', w: 915, h: 412 },
  { n: 'iPhone landscape 812x375', w: 812, h: 375 },
  { n: 'Androi landscape 740x360', w: 740, h: 360 },
];
(async () => {
  const prova = arg('gioco', '');
  const provaAbs = prova ? path.resolve(prova) : '';
  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  console.log('\n=== LA PAUSA DI META\' PARTITA ===  ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)'));
  for (const S of SCHERMI) {
    const ctx = await browser.newContext({ viewport: { width: S.w, height: S.h }, hasTouch: true, isMobile: true });
    const pag = await ctx.newPage();
    const ecc = []; pag.on('pageerror', e => ecc.push(e.message));
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
    await pag.evaluate(() => { window.__test.startMatch(1, 1, { size: 11 }); });
    await pag.waitForTimeout(150);
    /* la pausa di meta' partita: possesso campionato e qualche fallo */
    const seminato = await pag.evaluate(() => {
      if (typeof G === 'undefined' || !G.stats) return false;
      G.stats.possesso = [42, 31];
      G.stats.falli = [2, 1];
      return true;
    });
    await pag.keyboard.press('Escape');
    await pag.waitForTimeout(300);
    const r = await pag.evaluate(() => {
      const ids = ['btnResume', 'btnPauseAudio', 'btnPauseMent', 'btnQuit'];
      const st = document.getElementById('pausaStat');
      const sb = st ? st.getBoundingClientRect() : null;
      const box = document.querySelector('#pausa .box');
      const bb = box.getBoundingClientRect();
      const out = {
        vh: innerHeight, statVisibile: st ? !st.classList.contains('hidden') : false,
        statH: sb ? Math.round(sb.height) : 0,
        boxH: Math.round(bb.height), boxT: Math.round(bb.top), boxB: Math.round(bb.bottom),
        voci: [],
      };
      for (const id of ids) {
        const e = document.getElementById(id);
        if (!e) { out.voci.push({ id, manca: true }); continue; }
        const q = e.getBoundingClientRect();
        const cx = q.left + q.width / 2, cy = q.top + q.height / 2;
        const visibile = Math.max(0, Math.min(q.bottom, innerHeight) - Math.max(q.top, 0));
        let sotto = '';
        if (cx >= 0 && cy >= 0 && cx < innerWidth && cy < innerHeight) {
          const el = document.elementFromPoint(cx, cy);
          sotto = el ? (el === e || e.contains(el) ? 'se stesso' : (el.id || el.className || el.tagName)) : 'niente';
        } else sotto = 'CENTRO FUORI SCHERMO';
        out.voci.push({ id, t: Math.round(q.top), b: Math.round(q.bottom), h: Math.round(q.height), vis: Math.round(visibile), cx: Math.round(cx), cy: Math.round(cy), sotto: String(sotto).slice(0, 34) });
      }
      return out;
    });
    console.log('\n  ' + S.n + '   (stat seminata: ' + seminato + ', blocco visibile: ' + r.statVisibile + ', alto ' + r.statH + ')');
    console.log('    pannello alto ' + r.boxH + '   y ' + r.boxT + '..' + r.boxB + '   schermo ' + r.vh);
    for (const v of r.voci) {
      if (v.manca) { console.log('    ' + v.id.padEnd(14) + ' ASSENTE'); continue; }
      console.log('    ' + v.id.padEnd(14) + ' y ' + String(v.t).padStart(4) + '..' + String(v.b).padStart(4) +
        '  alto ' + String(v.h).padStart(3) + '  visibile ' + String(v.vis).padStart(3) + 'px' +
        (v.vis <= 0 ? '   *** FUORI SCHERMO ***' : (v.vis < v.h ? '   (tagliato)' : '')) +
        '   sotto il centro: ' + v.sotto);
    }
    /* il tocco VERO su ABBANDONA, senza force */
    const q = r.voci.find(v => v.id === 'btnQuit');
    let esito = 'non provato';
    if (q && !q.manca) {
      if (q.cy >= 0 && q.cy < r.vh) {
        try {
          await pag.touchscreen.tap(q.cx, q.cy);
          await pag.waitForTimeout(300);
          const alMenu = await pag.evaluate(() => !document.getElementById('menu').classList.contains('hidden'));
          esito = alMenu ? 'il dito su ABBANDONA torna al menu' : 'il dito su ABBANDONA NON ha fatto niente';
        } catch (e) { esito = 'tap fallito: ' + e.message.slice(0, 60); }
      } else esito = 'CENTRO DI ABBANDONA FUORI SCHERMO: il dito non lo puo\' toccare senza scorrere';
    }
    console.log('    tocco vero (Touchscreen.tap, niente force): ' + esito);
    if (ecc.length) console.log('    ECCEZIONI: ' + ecc[0]);
    await ctx.close();
  }
  await browser.close(); srv.chiudi();
})().catch(e => { console.error('FALLITO: ' + e.message); process.exit(1); });
