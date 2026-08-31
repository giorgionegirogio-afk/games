/* banco avversario: misura indipendente della pagina COMANDI */
const { chromium } = require('playwright');
const path = require('path');
const URL0 = 'http://127.0.0.1:8791/fuori/';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i+1] && !process.argv[i+1].startsWith('--') ? process.argv[i+1] : d; };
const FILE = arg('gioco', 'cmd-prima.html');

(async () => {
  const b = await chromium.launch();
  const out = [];
  async function apri(w,h){
    const ctx = await b.newContext({ viewport:{width:w,height:h}, deviceScaleFactor:1, hasTouch:true });
    const pg = await ctx.newPage();
    pg.on('pageerror', e => out.push('PAGEERROR '+w+'x'+h+': '+e.message));
    pg.on('console', m => { if(m.type()==='error') out.push('CONSOLEERR '+w+'x'+h+': '+m.text()); });
    await pg.goto(URL0+FILE+'?v='+Date.now(), { waitUntil:'load' });
    await pg.waitForFunction('window.__test && window.__test.state', null, {timeout:20000});
    return { ctx, pg };
  }

  /* ---- 1. errori a caricamento nudo su piu' finestre, anche verticali ---- */
  for (const [w,h] of [[915,412],[412,915],[360,640],[640,360],[812,375],[1280,720],[320,480]]) {
    const { ctx, pg } = await apri(w,h);
    const r = await pg.evaluate(() => {
      const o = {};
      try { o.mis = __test.misurePollice(); } catch(e){ o.misErr = String(e); }
      try { o.pol = __test.pollice; } catch(e){ o.polErr = String(e); }
      try { o.puls = __test.pulsanti(0); } catch(e){ o.pulsErr = String(e); }
      o.VW = innerWidth; o.VH = innerHeight;
      o.state = __test.state;
      return o;
    });
    out.push('WIN '+w+'x'+h+' '+JSON.stringify(r));
    await ctx.close();
  }

  console.log(out.join('\n'));
  await b.close();
})();
