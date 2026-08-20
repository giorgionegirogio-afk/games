/* _sonda-manto7.js — identita' della simulazione: stesso seme, stessa
   partita. Se la toppa consumasse UN sorteggio del caso comune, le due
   tracce divergerebbero. Confronta pallone, punteggio e posizioni di
   tutti i giocatori dopo 30 s simulati, alle tre taglie. */
const path = require('path');
const { chromium } = require('playwright');
const { servi, bancoDiProva, semeFisso } = require(path.resolve(__dirname, 'strumenti/_posa.js'));

(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  const firma = async (file) => {
    const ctx = await br.newContext({ viewport:{width:915,height:412}, deviceScaleFactor:2,
      isMobile:true, hasTouch:true, locale:'it-IT' });
    const pag = await ctx.newPage();
    await pag.addInitScript(semeFisso, 20260819);
    await pag.addInitScript(bancoDiProva);
    await pag.goto(`http://127.0.0.1:${srv.porta}/${file}`, { waitUntil:'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout:15000 });
    await pag.waitForTimeout(400);
    const out = {};
    for (const taglia of [5, 7, 11]) {
      await pag.evaluate(() => window.__banco.passo(30));
      out[taglia] = await pag.evaluate((N) => {
        window.__test.dismissSplash && window.__test.dismissSplash();
        window.__test.startMatch(1, 1, { size: N });
        window.__test.Tut && window.__test.Tut.finish && window.__test.Tut.finish(true);
        window.__test.setCpuVsCpu(true);
        window.__test.simulate(30);
        const b = G.ball;
        let s = G.score[0]+'-'+G.score[1]+'|'+b.x.toFixed(6)+','+b.y.toFixed(6);
        for (const p of G.players) s += '|'+p.x.toFixed(6)+','+p.y.toFixed(6);
        return s;
      }, taglia);
    }
    await ctx.close();
    return out;
  };
  const A = await firma('CALCETTO-il-gioco.html');
  const B = await firma('fuori/manto.html');
  let ok = true;
  for (const t of [5, 7, 11]) {
    const uguali = A[t] === B[t];
    if (!uguali) ok = false;
    console.log(`taglia ${t}: tracce dopo 30 s simulati ${uguali ? 'IDENTICHE' : 'DIVERSE'}` +
      (uguali ? '' : `\n  A: ${A[t].slice(0,120)}...\n  B: ${B[t].slice(0,120)}...`));
  }
  await br.close(); srv.chiudi();
  process.exit(ok ? 0 : 1);
})().catch(e => { console.error('FALLITO:', e); process.exit(1); });
