/* sonda critica: quanto vale la perdita di corsaArea e quanto sprinta la CPU */
const fs = require('fs'); const path = require('path'); const http = require('http');
const { chromium } = require('playwright');
const RADICE = 'C:/Users/Utenteee/Desktop/GitHub/games';

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
  const S = { frames:0, sprint:0, corsa:0, corsaSenzaPalla:0, fiatoBasso:0, uomini:0, crossFatti:0,
              paloBanner:0, paloFisico:0, gelo:0 };
  window.__s = S;
  const _step = window.step;
  const _hitPosts = window.hitPosts;
  const _gelo = window.gelo;
  const _showBanner = window.showBanner;
  window.gelo = function(){ S.gelo++; return _gelo.apply(this, arguments); };
  window.showBanner = function(t){ if(t==='PALO!') S.paloBanner++; return _showBanner.apply(this, arguments); };
  window.hitPosts = function(b){
    const vx=b.vx, vy=b.vy, x=b.x, y=b.y;
    const r=_hitPosts.apply(this, arguments);
    if(b.x!==x||b.y!==y||b.vx!==vx||b.vy!==vy) S.paloFisico++;
    return r;
  };
  window.step = function(){
    _step.apply(this, arguments);
    if(!(G.scene==='play'||G.scene==='golden')) return;
    S.frames++;
    const own = G.ball.owner>=0 ? G.players[G.ball.owner] : null;
    for(const p of G.players){
      if(p.role==='gk') continue;
      S.uomini++;
      if(p.sprint) S.sprint++;
      if(p.corsaArea){ S.corsa++; if(!own || own.team!==p.team) S.corsaSenzaPalla++; }
      if(p.fiato<25) S.fiatoBasso++;
    }
  };
  return 'ok';
})()`;

async function gioca(porta, taglia, partite, seme) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true });
  const pag = await ctx.newPage();
  const err = []; pag.on('pageerror', e => err.push(e.message));
  await pag.addInitScript(s0 => { let s = s0 >>> 0; const pr = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; }; Math.random = () => pr() / 4294967296; window.__caso = { semina(n){ s = n>>>0||1; } }; }, seme);
  await pag.goto(`http://127.0.0.1:${porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
  const ok = await pag.evaluate(SONDA);
  if (ok !== 'ok') throw new Error('sonda ko');
  const out = [];
  for (let i = 0; i < partite; i++) {
    const r = await pag.evaluate(([sm, tg]) => {
      window.__caso.semina(sm);
      const S = window.__s; for (const k in S) S[k] = 0;
      const t = window.__test;
      t.startMatch(1, 1, tg !== 5 ? { size: tg } : undefined);
      t.setCpuVsCpu(true);
      let sim = 0; while (t.state !== 'end' && sim < 600) { t.simulate(10); sim += 10; }
      return JSON.parse(JSON.stringify(S));
    }, [(seme + i) >>> 0, taglia]);
    out.push(r);
  }
  await browser.close();
  return { out, err };
}

(async () => {
  const gioco = process.argv[2];
  const taglia = +process.argv[3] || 5;
  const partite = +process.argv[4] || 6;
  const srv = await servi(gioco === 'repo' ? '' : path.resolve(gioco));
  const { out, err } = await gioca(srv.porta, taglia, partite, 20260803);
  srv.chiudi();
  const som = k => out.reduce((s, x) => s + x[k], 0);
  const F = som('uomini') || 1;
  console.log(`gioco=${gioco} taglia=${taglia} partite=${partite}`);
  console.log(`  fotogrammi-uomo           ${som('uomini')}`);
  console.log(`  sprint                    ${(som('sprint') / F * 100).toFixed(2)}%`);
  console.log(`  corsaArea attiva          ${(som('corsa') / F * 100).toFixed(2)}%`);
  console.log(`  corsaArea SENZA PALLA     ${(som('corsaSenzaPalla') / F * 100).toFixed(2)}%  <-- perdita`);
  console.log(`  fiato < 25                ${(som('fiatoBasso') / F * 100).toFixed(2)}%`);
  console.log(`  urti col palo (fisica)    ${som('paloFisico')}`);
  console.log(`  banner PALO!              ${som('paloBanner')}`);
  console.log(`  gelo() chiamate           ${som('gelo')}`);
  if (err.length) console.log('  ECCEZIONI: ' + err[0]);
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
