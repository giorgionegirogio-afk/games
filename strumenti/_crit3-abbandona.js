/* _crit3-abbandona.js — SI ESCE ANCORA DALLA PARTITA?
   Niente stato seminato: si GIOCA per davvero finche' il blocco possesso
   della pausa non compare da solo (POSSESSO_MIN = 180 campioni), poi ESC,
   poi si prova a uscire con un dito vero: Touchscreen.tap sulle coordinate
   del bottone, e — se il centro e' fuori schermo — si prova prima a
   scorrere l'overlay con un trascinamento vero.
   uso: node strumenti/_crit3-abbandona.js --gioco fuori/crit-ment.html */
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
(async () => {
  const prova = arg('gioco', '');
  const W = +arg('w', 915), H = +arg('h', 412);
  const provaAbs = prova ? path.resolve(prova) : '';
  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true });
  const pag = await ctx.newPage();
  const ecc = []; pag.on('pageerror', e => ecc.push(e.message));
  console.log('\n=== SI ESCE ANCORA DALLA PARTITA? ===  ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)') + '   ' + W + 'x' + H);
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
  await pag.evaluate(() => { window.__test.startMatch(1, 1, { size: 11 }); });

  /* SI GIOCA DAVVERO, finche' il possesso non e' campionato abbastanza */
  let campioni = 0, giri = 0;
  while (giri++ < 60) {
    await pag.waitForTimeout(500);
    campioni = await pag.evaluate(() => (typeof G !== 'undefined' && G.stats && G.stats.possesso) ? (G.stats.possesso[0] | 0) + (G.stats.possesso[1] | 0) : -1);
    if (campioni >= 180) break;
  }
  console.log('  campioni di possesso accumulati giocando: ' + campioni + '   (soglia POSSESSO_MIN 180)  in ' + (giri * 0.5).toFixed(1) + ' s');

  await pag.keyboard.press('Escape');
  await pag.waitForTimeout(350);
  const st = await pag.evaluate(() => {
    const s = document.getElementById('pausaStat');
    const q = document.getElementById('btnQuit').getBoundingClientRect();
    const m = document.getElementById('btnPauseMent');
    const mq = m ? m.getBoundingClientRect() : null;
    return {
      statVisibile: !s.classList.contains('hidden'), statTesto: s.textContent.trim().slice(0, 40),
      quit: { t: Math.round(q.top), b: Math.round(q.bottom), cx: Math.round(q.left + q.width / 2), cy: Math.round(q.top + q.height / 2) },
      ment: mq ? { t: Math.round(mq.top), b: Math.round(mq.bottom), cx: Math.round(mq.left + mq.width / 2), cy: Math.round(mq.top + mq.height / 2) } : null,
      vh: innerHeight,
      ovSH: document.getElementById('pausa').scrollHeight, ovCH: document.getElementById('pausa').clientHeight,
      ovTA: getComputedStyle(document.getElementById('pausa')).touchAction,
      bodyTA: getComputedStyle(document.body).touchAction,
    };
  });
  console.log('  blocco possesso visibile da solo: ' + st.statVisibile + '   «' + st.statTesto.replace(/\s+/g, ' ') + '»');
  console.log('  ABBANDONA  y ' + st.quit.t + '..' + st.quit.b + '  centro y=' + st.quit.cy + '   schermo alto ' + st.vh +
    '   -> ' + (st.quit.cy < st.vh ? 'centro sullo schermo' : 'CENTRO FUORI SCHERMO'));
  if (st.ment) console.log('  MENTALITA\' y ' + st.ment.t + '..' + st.ment.b + '  centro y=' + st.ment.cy +
    '   -> ' + (st.ment.cy < st.vh ? 'centro sullo schermo' : 'CENTRO FUORI SCHERMO'));
  console.log('  overlay: scrollHeight ' + st.ovSH + ' clientHeight ' + st.ovCH + '   touch-action overlay=' + st.ovTA + ' body=' + st.bodyTA);

  /* 1) il dito, secco, dove il bottone dovrebbe essere */
  let uscito = false;
  if (st.quit.cy < st.vh) {
    await pag.touchscreen.tap(st.quit.cx, st.quit.cy);
    await pag.waitForTimeout(300);
    uscito = await pag.evaluate(() => !document.getElementById('menu').classList.contains('hidden'));
    console.log('  tocco secco sul centro di ABBANDONA: ' + (uscito ? 'SI ESCE' : 'non esce'));
  } else {
    console.log('  tocco secco sul centro di ABBANDONA: IMPOSSIBILE, il centro e\' sotto il bordo dello schermo');
  }

  /* 2) il trascinamento: si puo' scorrere l'overlay col dito? */
  if (!uscito) {
    const prima = await pag.evaluate(() => document.getElementById('pausa').scrollTop);
    await pag.touchscreen.tap(1, 1).catch(() => {});
    const cx = Math.round(st.quit.cx), y0 = Math.round(st.vh * 0.75), y1 = Math.round(st.vh * 0.25);
    const cdp = await pag.context().newCDPSession(pag);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: y0 }] });
    for (let i = 1; i <= 8; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx, y: Math.round(y0 + (y1 - y0) * i / 8) }] });
      await pag.waitForTimeout(20);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await pag.waitForTimeout(400);
    const dopo = await pag.evaluate(() => ({
      scrollTop: document.getElementById('pausa').scrollTop,
      q: (() => { const r = document.getElementById('btnQuit').getBoundingClientRect(); return { cy: Math.round(r.top + r.height / 2) }; })(),
      inPausa: !document.getElementById('pausa').classList.contains('hidden'),
    }));
    console.log('  trascinamento col dito sull\'overlay: scrollTop ' + prima + ' -> ' + dopo.scrollTop +
      '   centro di ABBANDONA ora a y=' + dopo.q.cy + (dopo.inPausa ? '' : '   (la pausa si e\' chiusa!)'));
    if (dopo.inPausa && dopo.q.cy < st.vh && dopo.q.cy > 0) {
      await pag.touchscreen.tap(st.quit.cx, dopo.q.cy);
      await pag.waitForTimeout(300);
      uscito = await pag.evaluate(() => !document.getElementById('menu').classList.contains('hidden'));
      console.log('  dopo aver scorso, il tocco su ABBANDONA: ' + (uscito ? 'SI ESCE' : 'non esce'));
    } else if (dopo.inPausa) {
      console.log('  dopo il trascinamento ABBANDONA e\' ANCORA fuori schermo');
    }
  }
  console.log('  ESITO: ' + (uscito ? 'dalla partita si esce col dito' : 'COL DITO NON SI ESCE DALLA PARTITA'));
  if (ecc.length) console.log('  ECCEZIONI: ' + ecc[0]);
  await browser.close(); srv.chiudi();
})().catch(e => { console.error('FALLITO: ' + e.message); process.exit(1); });
