/* SONDA DI SOLA LETTURA #5 — lo schema TOUCH: pulsanti, flick, minimappa. */
const http = require('http'); const fs = require('fs'); const path = require('path');
const { chromium } = require('playwright');
const ROOT = 'C:/Users/Utenteee/Desktop/GitHub/games'; const PORT = 8795;
const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/CALCETTO-il-gioco.html';
  fs.readFile(path.join(ROOT, p), (e, d) => {
    if (e) { res.writeHead(404); res.end('no'); return; }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(d);
  });
});

const HELP = `
window.__S = {
  cv: document.getElementById('gioco'),
  t(id,x,y){ return new Touch({identifier:id, target:window.__S.cv, clientX:x, clientY:y, pageX:x, pageY:y}); },
  fire(tipo, id, x, y){
    const tc = window.__S.t(id,x,y);
    window.__S.cv.dispatchEvent(new TouchEvent(tipo,{changedTouches:[tc], touches:tipo==='touchend'?[]:[tc], targetTouches:tipo==='touchend'?[]:[tc], bubbles:true, cancelable:true}));
  },
  attesa(ms){ return new Promise(r=>setTimeout(r,ms)); },
  piazza(x,y,fx,fy){
    const T=window.__test, P=T.players, b=T.ball;
    const g=P.filter(p=>p.team===0&&p.role!=='gk'); const me=g[0];
    for(let i=0;i<30;i++){
      for(const p of g) if(p!==me){ p.x=60; p.y=40; p.vx=0; p.vy=0; }
      for(const p of P) if(p.team===1){ p.x=180; p.y=60; p.vx=0; p.vy=0; }
      me.x=x; me.y=y; me.vx=0; me.vy=0; me.fx=fx; me.fy=fy; me.kickCd=0; me.charge=-1;
      b.owner=P.indexOf(me); b.passTo=-1; b.x=me.x+16*fx; b.y=me.y+16*fy; b.z=0; b.vx=0; b.vy=0; b.vz=0;
      T.simulate(1/60);
    }
    return me;
  }
};
`;

(async () => {
  await new Promise(r => srv.listen(PORT, r));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 915, height: 412 }, hasTouch: true, isMobile: true });
  page.on('pageerror', e => console.log('ERR', String(e)));
  await page.goto(`http://127.0.0.1:${PORT}/CALCETTO-il-gioco.html?cb=${Date.now()}`, { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.__test, null, { timeout: 30000 });
  await page.evaluate(() => { window.__test.dismissSplash(); window.__test.startMatch(1, 1, { size: 5 }); window.__test.simulate(1.5); });
  await page.evaluate(HELP);

  const esiti = {};

  // dove sono i comandi, dichiarati dal gioco
  esiti.comandi = await page.evaluate(() => {
    window.__test.disegna();
    return window.__test.comandiTouch.map(z => ({ tipo: z.tipo, act: z.act, label: z.label, x: Math.round(z.x), y: Math.round(z.y), r: z.r, x0: Math.round(z.x0), y0: Math.round(z.y0), x1: Math.round(z.x1), y1: Math.round(z.y1) }));
  });

  // 1) FLICK verso la porta col pallone = tiro
  esiti.flickTiro = await page.evaluate(async () => {
    const T = window.__test, S = window.__S;
    S.piazza(600, 280, 1, 0);
    const t0 = T.stats.tiri[0];
    S.fire('touchstart', 1, 200, 200);
    for (let i = 1; i <= 4; i++) { await S.attesa(16); S.fire('touchmove', 1, 200 + i * 22, 200); }
    S.fire('touchend', 1, 288, 200);
    T.simulate(0.5);
    return { tiriPrima: t0, tiriDopo: T.stats.tiri[0] };
  });

  // 2) FLICK trasversale dalla meta' campo offensiva = cross
  esiti.flickCross = await page.evaluate(async () => {
    const T = window.__test, S = window.__S;
    S.piazza(900, 120, 1, 0);
    const c0 = T.stats.cross[0];
    S.fire('touchstart', 2, 200, 120);
    for (let i = 1; i <= 4; i++) { await S.attesa(16); S.fire('touchmove', 2, 200, 120 + i * 22); }
    S.fire('touchend', 2, 200, 208);
    T.simulate(0.5);
    return { crossPrima: c0, crossDopo: T.stats.cross[0] };
  });

  // 3) rilascio SEMPLICE (senza flick) = passaggio
  esiti.rilascioPassaggio = await page.evaluate(async () => {
    const T = window.__test, S = window.__S;
    const me = S.piazza(600, 280, 1, 0);
    const b = T.ball, own0 = b.owner;
    S.fire('touchstart', 3, 200, 200);
    await S.attesa(120);
    S.fire('touchmove', 3, 206, 200);
    await S.attesa(200);
    S.fire('touchend', 3, 206, 200);
    T.simulate(0.4);
    return { possessoPrima: own0 >= 0, palloneInVolo: Math.round(Math.hypot(b.vx, b.vy)) };
  });

  // 4) PULSANTE GRANDE con possesso = carica del tiro
  esiti.pulsanteTira = await page.evaluate(async () => {
    const T = window.__test, S = window.__S;
    const me = S.piazza(600, 280, 1, 0);
    const bt = T.pulsanti(0)[0];
    S.fire('touchstart', 4, bt.x, bt.y);
    const cari = me.charge;
    await S.attesa(600);
    S.fire('touchend', 4, bt.x, bt.y);
    T.simulate(0.4);
    return { etichetta: bt.label, caricaApertaSubito: cari >= 0, tiri: T.stats.tiri[0] };
  });

  // 5) PULSANTE PICCOLO senza possesso = cambio uomo
  esiti.pulsanteSenzaPossesso = await page.evaluate(async () => {
    const T = window.__test;
    const b = T.ball; b.owner = -1; b.vx = 0; b.vy = 0;
    T.simulate(1 / 60);
    return T.pulsanti(0).map(x => ({ act: x.act, label: x.label }));
  });

  // 6) TAP sulla MINIMAPPA: fa qualcosa?
  esiti.minimappa = await page.evaluate(async () => {
    const T = window.__test, S = window.__S;
    S.piazza(600, 280, 1, 0);
    T.disegna();
    const mm = T.comandiTouch.find(z => z.tipo === 'minimappa');
    if (!mm) return { presente: false };
    const b = T.ball; const prima = { x: b.x, y: b.y, owner: b.owner };
    S.fire('touchstart', 6, mm.x, mm.y);
    await S.attesa(150);
    S.fire('touchend', 6, mm.x, mm.y);
    T.simulate(0.3);
    return { presente: true, centro: [Math.round(mm.x), Math.round(mm.y)],
             pallaCambiata: (b.x !== prima.x || b.y !== prima.y),
             possessoCambiato: b.owner !== prima.owner };
  });

  await browser.close(); srv.close();
  console.log(JSON.stringify(esiti, null, 1));
})();
