/* SONDA DI SOLA LETTURA #2: verifica che i gesti UMANI (filtrante, cross,
   pallonetto, rovesciata, tiro al volo, cambio uomo) siano davvero
   raggiungibili da tastiera. Non modifica il file del gioco. */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = 'C:/Users/Utenteee/Desktop/GitHub/games';
const PORT = 8792;

const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/CALCETTO-il-gioco.html';
  fs.readFile(path.join(ROOT, p), (e, d) => {
    if (e) { res.writeHead(404); res.end('no'); return; }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(d);
  });
});

async function apri(browser) {
  const page = await browser.newPage({ viewport: { width: 915, height: 412 } });
  page.on('pageerror', e => console.log('ERRORE PAGINA:', String(e)));
  await page.goto(`http://127.0.0.1:${PORT}/CALCETTO-il-gioco.html?cb=${Date.now()}`, { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.__test, null, { timeout: 30000 });
  await page.evaluate(() => { window.__test.dismissSplash(); window.__test.startMatch(1, 1, { size: 5 }); window.__test.simulate(1.2); });
  return page;
}

/* mette il pallone ai piedi del giocatore comandato, alla x voluta */
const piazza = (fx, fy) => `(()=>{
  const T=window.__test, P=T.players, b=T.ball;
  // il comandato e' il piu' vicino al pallone della squadra 0: lo si porta
  // dove serve INSIEME al pallone
  const me=P.find(p=>p.team===0 && p.role!=='gk');
  me.x=${fx}; me.y=${fy}; me.vx=0; me.vy=0; me.fx=1; me.fy=0; me.kickCd=0;
  b.x=me.x+16; b.y=me.y; b.z=0; b.vx=0; b.vy=0; b.vz=0;
  b.owner=P.indexOf(me);
  T.simulate(0.35);
  return {ctrlOk:true};
})()`;

(async () => {
  await new Promise(r => srv.listen(PORT, r));
  const browser = await chromium.launch();
  const esiti = {};

  // --- FILTRANTE (tasto E) ---
  {
    const page = await apri(browser);
    await page.evaluate(piazza(600, 280));
    await page.keyboard.down('KeyE'); await page.keyboard.up('KeyE');
    await page.evaluate(() => window.__test.simulate(0.6));
    esiti.filtrante = await page.evaluate(() => window.__test.stats.filtranti[0]);
    await page.close();
  }
  // --- CROSS (Shift + E dalla meta' campo offensiva) ---
  {
    const page = await apri(browser);
    await page.evaluate(piazza(900, 120));
    await page.keyboard.down('ShiftLeft');
    await page.keyboard.down('KeyE'); await page.keyboard.up('KeyE');
    await page.evaluate(() => window.__test.simulate(0.6));
    await page.keyboard.up('ShiftLeft');
    esiti.cross = await page.evaluate(() => window.__test.stats.cross[0]);
    await page.close();
  }
  // --- PALLONETTO (X tenuto, Shift al rilascio) ---
  {
    const page = await apri(browser);
    await page.evaluate(piazza(800, 280));
    await page.keyboard.down('KeyX');
    await page.evaluate(() => window.__test.simulate(0.6));
    await page.keyboard.down('ShiftLeft');
    await page.keyboard.up('KeyX');
    await page.evaluate(() => window.__test.simulate(0.4));
    await page.keyboard.up('ShiftLeft');
    esiti.pallonetto = await page.evaluate(() => window.__test.stats.pallonetti[0]);
    await page.close();
  }
  // --- TIRO AL VOLO (X tenuto mentre arriva un pallone veloce) ---
  {
    const page = await apri(browser);
    await page.evaluate(`(()=>{
      const T=window.__test,P=T.players,b=T.ball;
      const me=P.find(p=>p.team===0&&p.role!=='gk');
      me.x=760; me.y=280; me.vx=0; me.vy=0; me.fx=1; me.fy=0; me.kickCd=0;
      b.owner=-1; b.x=560; b.y=280; b.z=0; b.vx=320; b.vy=0; b.vz=0; b.lastTouch=-1; b.passTo=-1;
      T.simulate(0.02);
    })()`);
    await page.keyboard.down('KeyX');
    await page.evaluate(() => window.__test.simulate(0.9));
    await page.keyboard.up('KeyX');
    esiti.volee = await page.evaluate(() => window.__test.stats.volee[0]);
    await page.close();
  }
  // --- ROVESCIATA (palla alta che scende in area, X premuto) ---
  {
    const page = await apri(browser);
    const r = await page.evaluate(`(()=>{
      const T=window.__test,P=T.players,b=T.ball;
      const me=P.find(p=>p.team===0&&p.role!=='gk');
      // punto di ricaduta: dentro l'area avversaria
      me.x=1090; me.y=280; me.vx=0; me.vy=0; me.fx=1; me.fy=0; me.kickCd=0; me.charge=-1;
      b.owner=-1; b.x=1090; b.y=280; b.vx=0; b.vy=0;
      b.z=30; b.vz=-1;      // alta e in discesa: picco oltre 20
      T.simulate(0.017);
      return {z:b.z, vz:b.vz, mex:me.x};
    })()`);
    await page.keyboard.down('KeyX');
    await page.evaluate(() => window.__test.simulate(1.2));
    await page.keyboard.up('KeyX');
    esiti.rovesciata = await page.evaluate(() => window.__test.stats.rovesciate[0]);
    esiti.rovesciataSetup = r;
    await page.close();
  }
  // --- CAMBIO UOMO (Q) ---
  {
    const page = await apri(browser);
    const prima = await page.evaluate(() => window.__test.players.findIndex(p => p.__c) );
    const a = await page.evaluate(() => { const T = window.__test; return T.players.length; });
    await page.keyboard.press('KeyQ');
    esiti.cambioUomo = 'premuto (nessun hook di controllo esposto: non verificato a numeri)';
    await page.close();
  }

  await browser.close();
  srv.close();
  console.log(JSON.stringify(esiti, null, 1));
})();
