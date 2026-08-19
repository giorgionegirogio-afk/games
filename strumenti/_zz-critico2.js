/* sonda critica 2: verifica le contro-affermazioni della seconda stesura */
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
  const S = { frames:0, uomini:0, corsa:0, corsaAvv:0, corsaLibera:0, corsaNostra:0,
              maxConc:0, conc2:0, crossToVivo:0, crossToFermo:0,
              crossTot:0, crossInZonaTiro:0, crossFuoriZona:0,
              tiriTot:0, zonaTiroFrames:0, portaCopre:0, portaTot:0 };
  window.__s2 = S;
  const _step = window.step;
  /* quante volte crossCPU parte da dentro la zona di tiro (il punto 7b) */
  const _cross = window.crossCPU;
  if(_cross) window.crossCPU = function(p, opGoalX){
    const r = _cross.apply(this, arguments);
    if(r){ S.crossTot++;
      if(zonaTiro(p.x,p.y,opGoalX)) S.crossInZonaTiro++; else S.crossFuoriZona++; }
    return r;
  };
  const _gk = window.crossPortiereCopre;
  if(_gk) window.crossPortiereCopre = function(){
    const r=_gk.apply(this, arguments); S.portaTot++; if(r) S.portaCopre++; return r;
  };
  window.step = function(){
    _step.apply(this, arguments);
    if(!(G.scene==='play'||G.scene==='golden')) return;
    S.frames++;
    const b=G.ball;
    const own = b.owner>=0 ? G.players[b.owner] : null;
    let conc=[0,0];
    for(const p of G.players){
      if(p.out>0) continue;
      if(p.role==='gk') continue;
      S.uomini++;
      if(p.corsaArea>0){
        S.corsa++; conc[p.team]++;
        if(own && own.team!==p.team) S.corsaAvv++;        // LA PERDITA VERA
        else if(!own) S.corsaLibera++;                    // pallone di nessuno
        else S.corsaNostra++;                             // palla nostra
      }
    }
    const m=Math.max(conc[0],conc[1]);
    if(m>S.maxConc) S.maxConc=m;
    if(conc[0]>1||conc[1]>1) S.conc2++;
    /* crossTo: resta scritto su un pallone che non vola piu'? */
    if(b.crossTo>=0){ if(b.owner<0 && b.z>0) S.crossToVivo++; else S.crossToFermo++; }
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
      const S = window.__s2; for (const k in S) S[k] = 0;
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
  const partite = +process.argv[4] || 12;
  const srv = await servi(path.resolve(gioco));
  const { out, err } = await gioca(srv.porta, taglia, partite, 20260803);
  srv.chiudi();
  const som = k => out.reduce((s, x) => s + x[k], 0);
  const F = som('uomini') || 1;
  const pc = k => (som(k) / F * 100).toFixed(3) + '%';
  console.log(`gioco=${path.basename(gioco)} taglia=${taglia} partite=${partite}`);
  console.log(`  fotogrammi-uomo             ${som('uomini')}`);
  console.log(`  corsaArea attiva            ${pc('corsa')}`);
  console.log(`    con palla all'AVVERSARIO  ${pc('corsaAvv')}   <== la perdita (rivendicata 0,04%)`);
  console.log(`    con pallone di NESSUNO    ${pc('corsaLibera')}`);
  console.log(`    con palla NOSTRA          ${pc('corsaNostra')}`);
  console.log(`  max uomini insieme in corsa ${Math.max(...out.map(o=>o.maxConc))}   (fotogrammi con >1: ${som('conc2')})`);
  console.log(`  crossTo scritto, palla in volo   ${som('crossToVivo')} fotogrammi`);
  console.log(`  crossTo scritto, palla FERMA/PRESA ${som('crossToFermo')} fotogrammi  <== indirizzo stantio`);
  console.log(`  cross partiti               ${som('crossTot')}  (dentro zona tiro: ${som('crossInZonaTiro')}, fuori: ${som('crossFuoriZona')})`);
  console.log(`  crossPortiereCopre  morde   ${som('portaCopre')} su ${som('portaTot')}`);
  if (err.length) console.log('  ECCEZIONI: ' + err[0]);
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
