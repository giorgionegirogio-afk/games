/* SONDA DI SOLA LETTURA #6 — flick veri (misurando la velocita' ottenuta)
   e che cosa fa davvero un dito sulla minimappa. */
const http = require('http'); const fs = require('fs'); const path = require('path');
const { chromium } = require('playwright');
const ROOT = 'C:/Users/Utenteee/Desktop/GitHub/games'; const PORT = 8796;
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
  fire(tipo,id,x,y){
    const tc=new Touch({identifier:id,target:window.__S.cv,clientX:x,clientY:y,pageX:x,pageY:y});
    window.__S.cv.dispatchEvent(new TouchEvent(tipo,{changedTouches:[tc],touches:tipo==='touchend'?[]:[tc],targetTouches:tipo==='touchend'?[]:[tc],bubbles:true,cancelable:true}));
  },
  a(ms){ return new Promise(r=>setTimeout(r,ms)); },
  piazza(x,y,fx,fy){
    const T=window.__test,P=T.players,b=T.ball;
    const g=P.filter(p=>p.team===0&&p.role!=='gk'); const me=g[0];
    for(let i=0;i<30;i++){
      for(const p of g) if(p!==me){ p.x=60; p.y=40; p.vx=0; p.vy=0; }
      for(const p of P) if(p.team===1){ p.x=180; p.y=60; p.vx=0; p.vy=0; }
      me.x=x; me.y=y; me.vx=0; me.vy=0; me.fx=fx; me.fy=fy; me.kickCd=0; me.charge=-1;
      b.owner=P.indexOf(me); b.passTo=-1; b.x=me.x+16*fx; b.y=me.y+16*fy; b.z=0; b.vx=0; b.vy=0; b.vz=0;
      T.simulate(1/60);
    }
    return me;
  },
  /* flick: quattro campioni con passo grande, e riporta la velocita' vera
     misurata con la STESSA aritmetica di Touch5.release */
  async flick(id, x0, y0, dx, dy, passi, attesa){
    const S=window.__S; const punti=[];
    S.fire('touchstart',id,x0,y0); punti.push({x:x0,y:y0,t:performance.now()});
    for(let i=1;i<=passi;i++){
      await S.a(attesa);
      const x=x0+dx*i, y=y0+dy*i;
      S.fire('touchmove',id,x,y); punti.push({x,y,t:performance.now()});
    }
    const now=performance.now();
    let a=punti[punti.length-1], b=a;
    for(let i=punti.length-1;i>=0;i--){ if(now-punti[i].t<=90) b=punti[i]; else break; }
    if(b===a && punti.length>1 && now-a.t<=90) b=punti[punti.length-2];
    const dt=Math.max(1,a.t-b.t);
    const v=Math.hypot((a.x-b.x)/dt*1000,(a.y-b.y)/dt*1000);
    S.fire('touchend',id,a.x,a.y);
    return Math.round(v);
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
  const e = {};

  e.flickTiro = await page.evaluate(async () => {
    const T = window.__test, S = window.__S;
    S.piazza(600, 280, 1, 0);
    const t0 = T.stats.tiri[0];
    const v = await S.flick(11, 150, 200, 70, 0, 4, 8);
    T.simulate(0.5);
    return { vFlick: v, tiri: T.stats.tiri[0] - t0 };
  });

  e.flickCross = await page.evaluate(async () => {
    const T = window.__test, S = window.__S;
    S.piazza(900, 120, 1, 0);
    const c0 = T.stats.cross[0];
    const v = await S.flick(12, 200, 90, 0, 60, 4, 8);
    T.simulate(0.5);
    return { vFlick: v, cross: T.stats.cross[0] - c0 };
  });

  e.flickScivolata = await page.evaluate(async () => {
    const T = window.__test, S = window.__S;
    const me = S.piazza(600, 280, 1, 0);
    // pallone all'avversario: senza possesso il flick e' scivolata
    const P = T.players, b = T.ball;
    const avv = P.find(p => p.team === 1 && p.role !== 'gk');
    avv.x = me.x + 70; avv.y = me.y; avv.vx = 0; avv.vy = 0;
    b.owner = P.indexOf(avv); b.x = avv.x + 16; b.y = avv.y;
    T.simulate(1 / 60);
    const slidePrima = me.slide;
    const v = await S.flick(13, 150, 200, 70, 0, 4, 8);
    T.simulate(0.10);
    return { vFlick: v, scivolataArmata: (me.slide >= 0 || me.chargeKind === 'scivolata'), slidePrima };
  });

  e.minimappaTap = await page.evaluate(async () => {
    const T = window.__test, S = window.__S;
    S.piazza(600, 280, 1, 0);
    T.disegna();
    const mm = T.comandiTouch.find(z => z.tipo === 'minimappa');
    S.fire('touchstart', 14, mm.x, mm.y);
    T.simulate(1 / 60); T.disegna();
    const zone = T.comandiTouch.map(z => ({ tipo: z.tipo, x: Math.round(z.x), y: Math.round(z.y) }));
    const stick = zone.find(z => z.tipo === 'stick');
    S.fire('touchend', 14, mm.x, mm.y);
    return { minimappa: [Math.round(mm.x), Math.round(mm.y)], stickNato: stick || null };
  });

  await browser.close(); srv.close();
  console.log(JSON.stringify(e, null, 1));
})();
