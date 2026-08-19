/* sonda critica: la toppa tocca anche la squadra del GIOCATORE UMANO? */
const fs = require('fs'); const path = require('path'); const http = require('http');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');

function servi(prova) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (prova && /CALCETTO-il-gioco\.html$/i.test(f)) f = prova;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

const SONDA = `(() => {
  const S = { frames:0, corsaUmana:0, uominiUmani:0, crossUmani:0, crossCpu:0 };
  window.__s = S;
  const _step = window.step, _doCross = window.doCross;
  window.doCross = function(p){ if(p.team===0) S.crossUmani++; else S.crossCpu++; return _doCross.apply(this, arguments); };
  window.step = function(){
    _step.apply(this, arguments);
    if(!(G.scene==='play'||G.scene==='golden')) return;
    S.frames++;
    for(const p of G.players){
      if(p.team!==0 || p.role==='gk') continue;
      S.uominiUmani++;
      if(p.corsaArea) S.corsaUmana++;
    }
  };
  return 'ok';
})()`;

(async () => {
  const gioco = process.argv[2];
  const partite = +process.argv[3] || 4;
  const srv = await servi(gioco === 'repo' ? '' : path.resolve(gioco));
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true });
  const pag = await ctx.newPage();
  const err = []; pag.on('pageerror', e => err.push(e.message));
  await pag.addInitScript(() => { let s = 20260803 >>> 0; const pr = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; }; Math.random = () => pr() / 4294967296; window.__caso = { semina(n){ s = n>>>0||1; } }; });
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
  await pag.evaluate(SONDA);
  const out = [];
  for (let i = 0; i < partite; i++) {
    out.push(await pag.evaluate(sm => {
      window.__caso.semina(sm);
      const S = window.__s; for (const k in S) S[k] = 0;
      const t = window.__test;
      t.startMatch(1, 1);          /* squadra 0 = UMANA (nessun setCpuVsCpu) */
      const umano = !G.cpu[0], cpu1 = !!G.cpu[1];
      let sim = 0; while (t.state !== 'end' && sim < 600) { t.simulate(10); sim += 10; }
      return Object.assign(JSON.parse(JSON.stringify(S)), { umano, cpu1 });
    }, (20260803 + i) >>> 0));
  }
  await browser.close(); srv.chiudi();
  const som = k => out.reduce((s, x) => s + x[k], 0);
  console.log(`gioco=${gioco} partite=${partite}  squadra0 umana=${out[0].umano} squadra1 cpu=${out[0].cpu1}`);
  console.log(`  fotogrammi-uomo squadra UMANA   ${som('uominiUmani')}`);
  console.log(`  corsaArea sui COMPAGNI dell'umano ${(som('corsaUmana') / Math.max(1, som('uominiUmani')) * 100).toFixed(2)}%`);
  console.log(`  doCross partiti dalla squadra UMANA ${som('crossUmani')}   dalla CPU ${som('crossCpu')}`);
  if (err.length) console.log('  ECCEZIONI: ' + err[0]);
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
