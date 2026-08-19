/* IL DITO ALZATO — misura sola lettura.
   Domanda: se una persona smette di giocare (posa il pollice e lo alza
   mezzo secondo dopo, senza flick), il gioco calcia il pallone?
   Il calcio si riconosce dal CAMBIO DI PROPRIETARIO del pallone, non
   dalla sua velocita': un portatore che cammina trascina la palla a
   168 u/s senza averla calciata (era l'errore della prima stesura). */
const http = require('http'); const fs = require('fs'); const path = require('path');
const { chromium } = require('playwright');
const ROOT = 'C:/Users/Utenteee/Desktop/GitHub/games'; const PORT = 8843;
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
  fire(tipo, id, x, y){
    const tc = new Touch({identifier:id, target:window.__S.cv, clientX:x, clientY:y, pageX:x, pageY:y});
    window.__S.cv.dispatchEvent(new TouchEvent(tipo,{changedTouches:[tc], touches:tipo==='touchend'?[]:[tc],
      targetTouches:tipo==='touchend'?[]:[tc], bubbles:true, cancelable:true}));
  },
  /* stato realistico: il comandato ha palla a centrocampo, tre compagni
     sparsi davanti, gli avversari a distanza di marcatura (90-140 u) */
  piazza(){
    const T=window.__test, P=T.players, b=T.ball;
    const mi=P.filter(p=>p.team===0&&p.role!=='gk');
    const av=P.filter(p=>p.team===1&&p.role!=='gk');
    const me=mi[0];
    const posMi=[[560,280],[700,180],[700,380],[430,230],[430,330],[820,280]];
    const posAv=[[650,240],[650,330],[780,200],[780,360],[520,300],[880,280]];
    for(let i=0;i<24;i++){
      mi.forEach((p,k)=>{ const q=posMi[k%posMi.length]; p.x=q[0]; p.y=q[1]; p.vx=0; p.vy=0; });
      av.forEach((p,k)=>{ const q=posAv[k%posAv.length]; p.x=q[0]; p.y=q[1]; p.vx=0; p.vy=0; });
      me.x=560; me.y=280; me.vx=0; me.vy=0; me.fx=1; me.fy=0;
      me.kickCd=0; me.charge=-1; me.slide=-1; me.recover=0;
      b.owner=P.indexOf(me); b.passTo=-1; b.x=me.x+16; b.y=me.y; b.z=0; b.vx=0; b.vy=0; b.vz=0;
      T.simulate(1/60);
    }
    return P.indexOf(me);
  }
};
`;
(async () => {
  await new Promise(r => srv.listen(PORT, r));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  page.on('pageerror', e => console.log('ERR', String(e)));
  await page.goto(`http://127.0.0.1:${PORT}/CALCETTO-il-gioco.html?cb=${Date.now()}`, { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.__test, null, { timeout: 30000 });
  await page.evaluate(() => { window.__test.dismissSplash(); window.__test.startMatch(1, 1, { size: 5 }); window.__test.simulate(1.5); });
  await page.evaluate(HELP);

  const out = [];
  for (const d of [0, 8, 20, 46, 70]) {
    let calci = 0, avversario = 0, prove = 10;
    for (let k = 0; k < prove; k++) {
      await page.evaluate(() => { window.__S.piazza(); });
      await page.evaluate(() => { window.__S.fire('touchstart', 77, 200, 300); });
      await page.waitForTimeout(40);
      if (d > 0) await page.evaluate(dd => { window.__S.fire('touchmove', 77, 200 + dd, 300); }, d);
      await page.waitForTimeout(500);           // il dito RESTA FERMO: non sta giocando
      const e = await page.evaluate(dd => {
        const T = window.__test, b = T.ball;
        const own0 = b.owner;
        window.__S.fire('touchend', 77, 200 + dd, 300);
        T.simulate(8 / 60);                      // > PASS_CAR_U (50 ms) + margine
        const calcio = (b.owner !== own0) || b.passTo >= 0;
        T.simulate(1.2);
        const av = b.owner >= 0 ? (T.players[b.owner].team === 1) : false;
        return { calcio, av };
      }, d);
      if (e.calcio) calci++;
      if (e.av) avversario++;
    }
    out.push({ corsaLevettaPx: d, prove, rilasciCheCalciano: calci, palloneAllAvversarioDopo1_2s: avversario });
  }
  /* CONTROPROVA: senza dito, lo stesso stato per lo stesso tempo */
  let senzaDito = 0;
  for (let k = 0; k < 10; k++) {
    const e = await page.evaluate(() => {
      const T = window.__test, b = T.ball;
      window.__S.piazza();
      const own0 = b.owner;
      T.simulate(8 / 60);
      const calcio = (b.owner !== own0) || b.passTo >= 0;
      T.simulate(1.2);
      return { calcio, av: b.owner >= 0 ? (T.players[b.owner].team === 1) : false };
    });
    if (e.av) senzaDito++;
  }
  console.log(JSON.stringify({ rilasci: out, controprovaSenzaDito_palloneAllAvversario: senzaDito + '/10' }, null, 1));
  await browser.close(); srv.close();
})();
