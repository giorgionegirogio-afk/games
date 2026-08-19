/* SONDA DI SOLA LETTURA #4 — la rovesciata: e' raggiungibile o no? */
const http = require('http'); const fs = require('fs'); const path = require('path');
const { chromium } = require('playwright');
const ROOT = 'C:/Users/Utenteee/Desktop/GitHub/games'; const PORT = 8794;
const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/CALCETTO-il-gioco.html';
  fs.readFile(path.join(ROOT, p), (e, d) => {
    if (e) { res.writeHead(404); res.end('no'); return; }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(d);
  });
});
(async () => {
  await new Promise(r => srv.listen(PORT, r));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 915, height: 412 } });
  page.on('pageerror', e => console.log('ERR', String(e)));
  await page.goto(`http://127.0.0.1:${PORT}/CALCETTO-il-gioco.html?cb=${Date.now()}`, { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.__test, null, { timeout: 30000 });
  await page.evaluate(() => { window.__test.dismissSplash(); window.__test.startMatch(1, 1, { size: 5 }); window.__test.simulate(1.5); });

  const r = await page.evaluate(`(()=>{
    const T=window.__test;
    const K=(c,t)=>window.dispatchEvent(new KeyboardEvent(t,{code:c,bubbles:true}));
    const P=T.players, b=T.ball;
    const g=P.filter(p=>p.team===0&&p.role!=='gk');
    const me=g[0];
    const log=[];
    // 1) porta gli altri lontano e fai in modo che il comando passi a "me":
    //    pallone fermo a 25 unita' (troppo lontano per la raccolta, abbastanza
    //    vicino perche' lui sia il piu' vicino) e mezzo secondo di isteresi
    for(let i=0;i<40;i++){
      for(const p of g) if(p!==me){ p.x=60; p.y=40; p.vx=0; p.vy=0; }
      for(const p of P) if(p.team===1){ p.x=200; p.y=60; p.vx=0; p.vy=0; }
      me.x=1060; me.y=340; me.vx=0; me.vy=0; me.fx=1; me.fy=0; me.kickCd=0;
      b.owner=-1; b.passTo=-1; b.x=1085; b.y=340; b.z=0; b.vx=0; b.vy=0; b.vz=0;
      T.simulate(1/60);
    }
    // verifica che il comando sia suo: una carica si apre solo sul comandato
    me.charge=-1;
    K('KeyX','keydown'); const comandato = me.charge>=0; K('KeyX','keyup'); me.charge=-1;
    log.push({comandato});

    // 2) adesso il pallone alto in discesa con moto orizzontale (un cross)
    for(const p of P) if(p.team===1){ p.x=200; p.y=60; p.vx=0; p.vy=0; }
    me.x=1060; me.y=340; me.vx=0; me.vy=0; me.fx=1; me.fy=0; me.kickCd=0; me.charge=-1; me.rove=-1;
    b.owner=-1; b.passTo=-1; b.x=934; b.y=340; b.vx=500; b.vy=0; b.z=39; b.vz=-5;
    const stato0={d:Math.round(Math.hypot(b.x-me.x,b.y-me.y)), z:b.z, vz:b.vz};
    K('KeyX','keydown');
    const roveArmata = (me.charge>=0 && me.chargeKind==='rovesciata') || me.rove>=0;
    log.push({stato0, roveArmata, chargeKind:me.chargeKind, charge:me.charge});
    T.simulate(1.4);
    K('KeyX','keyup');
    return {log, rovesciate:T.stats.rovesciate[0], tiri:T.stats.tiri[0]};
  })()`);
  console.log(JSON.stringify(r, null, 1));
  await browser.close(); srv.close();
})();
