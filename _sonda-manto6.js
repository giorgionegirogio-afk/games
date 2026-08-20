/* _sonda-manto6.js — fumo a tempo reale sulla copia toppata: l'atlante si
   accende in partita vera (rAF vero, niente banco), il gol non rompe niente,
   la console resta pulita, e quanto costa startMatch con la cottura dentro. */
const path = require('path');
const { chromium } = require('playwright');
const { servi } = require(path.resolve(__dirname, 'strumenti/_posa.js'));
const arg = (n, d) => { const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i+1] && !process.argv[i+1].startsWith('--') ? process.argv[i+1] : d; };
const GIOCO = arg('gioco', 'fuori/manto.html');

(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport:{width:915,height:412}, deviceScaleFactor:2,
    isMobile:true, hasTouch:true, locale:'it-IT' });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('console', m => { if (m.type() === 'error') errori.push(m.text()); });
  pag.on('pageerror', e => errori.push('pageerror: ' + e.message));
  await pag.goto(`http://127.0.0.1:${srv.porta}/${GIOCO}`, { waitUntil:'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout:15000 });
  await pag.waitForTimeout(600);
  for (const taglia of [5, 11]) {
    const t0 = Date.now();
    await pag.evaluate((N) => {
      window.__test.dismissSplash && window.__test.dismissSplash();
      window.__test.startMatch(1, 1, { size: N });
      window.__test.Tut && window.__test.Tut.finish && window.__test.Tut.finish(true);
      window.__test.setCpuVsCpu(true);
    }, taglia);
    const durata = Date.now() - t0;
    await pag.waitForTimeout(2500);                    // rAF vero: kickoff -> play
    const m1 = await pag.evaluate(() => Object.assign({scena:G.scene}, window.__test.manto));
    /* la seconda partita alla stessa taglia NON deve ricuocere */
    const t1 = Date.now();
    await pag.evaluate((N) => window.__test.startMatch(1, 1, { size: N }), taglia);
    const durata2 = Date.now() - t1;
    await pag.waitForTimeout(1200);
    /* il gol: scena dedicata con campoVivo sopra l'atlante */
    await pag.evaluate(() => window.__test.forceGoal(0));
    await pag.waitForTimeout(2000);
    const m2 = await pag.evaluate(() => Object.assign({scena:G.scene}, window.__test.manto));
    console.log(`taglia ${taglia}: startMatch ${durata} ms (ricuoce), poi ${durata2} ms (chiave uguale)`);
    console.log(`  in partita: ${JSON.stringify(m1)}`);
    console.log(`  al gol:     ${JSON.stringify(m2)}`);
  }
  /* di nuovo al menu: l'atlante non deve comandare la' */
  await pag.evaluate(() => { window.__test.startMatch(1,1,{size:5}); });
  await pag.waitForTimeout(800);
  console.log('errori console:', errori.length ? errori : 'nessuno');
  await br.close(); srv.chiudi();
  process.exit(errori.length ? 1 : 0);
})().catch(e => { console.error('FALLITO:', e); process.exit(1); });
