/* SONDA DI SOLA LETTURA #3 — tutto dentro un solo evaluate, cosi' nessun
   fotogramma del rAF si intromette fra il piazzamento e il tasto. */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = 'C:/Users/Utenteee/Desktop/GitHub/games';
const PORT = 8793;
const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/CALCETTO-il-gioco.html';
  fs.readFile(path.join(ROOT, p), (e, d) => {
    if (e) { res.writeHead(404); res.end('no'); return; }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(d);
  });
});

const PRELUDIO = `
  const T=window.__test;
  const K=(code,tipo)=>window.dispatchEvent(new KeyboardEvent(tipo,{code,bubbles:true}));
  const P=()=>T.players, B=()=>T.ball;
  const mio=()=>P().filter(p=>p.team===0&&p.role!=='gk');
  const altrove=(tenuto)=>{ for(const p of mio()) if(p!==tenuto){ p.x=60; p.y=40; p.vx=0; p.vy=0; } };
`;

async function prova(browser, nome, corpo) {
  const page = await browser.newPage({ viewport: { width: 915, height: 412 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  await page.goto(`http://127.0.0.1:${PORT}/CALCETTO-il-gioco.html?cb=${Date.now()}`, { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.__test, null, { timeout: 30000 });
  await page.evaluate(() => { window.__test.dismissSplash(); window.__test.startMatch(1, 1, { size: 5 }); window.__test.simulate(1.5); });
  const r = await page.evaluate(`(()=>{${PRELUDIO}${corpo}})()`);
  await page.close();
  return { nome, r, errs };
}

(async () => {
  await new Promise(r => srv.listen(PORT, r));
  const browser = await chromium.launch();
  const out = [];

  // 1. FILTRANTE con un compagno davvero davanti
  out.push(await prova(browser, 'filtrante', `
    const g=mio(); const me=g[0], amico=g[1];
    altrove(me); amico.x=820; amico.y=250; amico.vx=0; amico.vy=0;
    me.x=620; me.y=280; me.vx=0; me.vy=0; me.fx=1; me.fy=0; me.kickCd=0; me.charge=-1;
    const b=B(); b.x=me.x+16; b.y=me.y; b.z=0; b.vx=0; b.vy=0; b.vz=0; b.owner=P().indexOf(me);
    T.simulate(0.05);
    K('KeyE','keydown'); K('KeyE','keyup');
    T.simulate(0.5);
    return {filtranti:T.stats.filtranti[0], ballV:[Math.round(b.vx),Math.round(b.vy)]};
  `));

  // 2. ROVESCIATA: pallone alto in DISCESA con moto orizzontale (come un cross)
  out.push(await prova(browser, 'rovesciata', `
    const g=mio(); const me=g[0]; altrove(me);
    me.x=1060; me.y=340; me.vx=0; me.vy=0; me.fx=1; me.fy=0; me.kickCd=0; me.charge=-1; me.rove=-1;
    const b=B(); b.owner=-1; b.passTo=-1; b.x=934; b.y=340; b.vx=500; b.vy=0; b.z=39; b.vz=-5;
    T.simulate(0.017);
    const d0=Math.hypot(b.x-me.x,b.y-me.y);
    K('KeyX','keydown');
    T.simulate(1.4);
    K('KeyX','keyup');
    return {rovesciate:T.stats.rovesciate[0], tiri:T.stats.tiri[0], dPrima:Math.round(d0), zPrima:Math.round(b.z)};
  `));

  // 3. TIRO AL VOLO: carica aperta su pallone fermo vicino, poi arriva un pallone veloce
  out.push(await prova(browser, 'volo-carica-preesistente', `
    const g=mio(); const me=g[0]; altrove(me);
    me.x=760; me.y=280; me.vx=0; me.vy=0; me.fx=1; me.fy=0; me.kickCd=0; me.charge=-1;
    const b=B(); b.owner=-1; b.passTo=-1; b.lastTouch=-1;
    b.x=me.x+30; b.y=me.y; b.z=0; b.vx=0; b.vy=0; b.vz=0;   // fermo a 30 unita': carica ammessa
    T.simulate(0.017);
    K('KeyX','keydown');                       // la carica si apre
    T.simulate(0.30);
    // adesso arriva un pallone veloce: lo si riposiziona lontano e in corsa
    b.owner=-1; b.passTo=-1; b.lastTouch=-1; b.x=me.x-120; b.y=me.y; b.vx=300; b.vy=0; b.z=0; b.vz=0;
    me.kickCd=0;
    T.simulate(0.7);
    K('KeyX','keyup');
    return {volee:T.stats.volee[0], tiri:T.stats.tiri[0]};
  `));

  // 4. TIRO AL VOLO "da manuale": si preme il tiro MENTRE il pallone arriva
  out.push(await prova(browser, 'volo-come-da-istruzioni', `
    const g=mio(); const me=g[0]; altrove(me);
    me.x=760; me.y=280; me.vx=0; me.vy=0; me.fx=1; me.fy=0; me.kickCd=0; me.charge=-1;
    const b=B(); b.owner=-1; b.passTo=-1; b.lastTouch=-1;
    b.x=560; b.y=280; b.z=0; b.vx=300; b.vy=0; b.vz=0;
    T.simulate(0.017);
    K('KeyX','keydown');                       // premuto quando il pallone e' a 200 unita'
    const caricaSubito = me.charge;
    T.simulate(1.0);
    K('KeyX','keyup');
    return {volee:T.stats.volee[0], caricaAlTasto:caricaSubito, possesso:b.owner>=0};
  `));

  // 5. quanto vale davvero il raggio: la carica si apre solo se il pallone e' vicino
  out.push(await prova(browser, 'raggio-di-carica', `
    const g=mio(); const me=g[0]; altrove(me);
    const b=B(); b.owner=-1; b.passTo=-1; b.vx=0; b.vy=0; b.z=0; b.vz=0;
    const esiti={};
    for(const d of [20,30,36,37,40,60,120]){
      me.x=600; me.y=280; me.vx=0; me.vy=0; me.charge=-1; me.kickCd=0; me.rove=-1;
      b.x=600+d; b.y=280; b.owner=-1;
      K('KeyX','keydown'); esiti[d]= me.charge>=0; K('KeyX','keyup');
      me.charge=-1;
    }
    return esiti;
  `));

  await browser.close();
  srv.close();
  console.log(JSON.stringify(out, null, 1));
})();
