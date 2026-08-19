/* =====================================================================
   _sonda-cross2.js — PERCHE' IL CROSS NON PARTE, clausola per clausola.

   Non attesta niente: chiama le funzioni della toppa dall'esterno
   (dentroArea, crossFinestra, crossBersaglio, crossPortiereCopre,
   crossVarcoLibero) su OGNI fotogramma in cui c'e' un portatore, e
   conta dove si ferma la catena. Se una clausola boccia il 100% dei casi
   si vede subito quale.

   Misura anche, per ogni cross partito, la distanza fra il punto di
   caduta e il compagno piu' vicino nell'istante in cui il pallone tocca
   terra: e' il numero che dice se "arrivare" e' un problema di mira o di
   gambe.

   uso: node strumenti/_sonda-cross2.js <gioco.html> [taglia] [partite]
   ===================================================================== */
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
  const S = { frames:0, conPortatore:0, inZonaX:0, inFascia:0,
              conCompagnoInArea:0, passaDistanza:0, passaPortiere:0, passaVarco:0,
              bocciaDistanza:0, bocciaPortiere:0, bocciaVarco:0,
              bersaglioOK:0, kickCd:0, occasioni:0,
              crossPartiti:0, cadutaDg:[], cadutaVicino:[], cadutaVicinoInArea:0,
              corsaAttiva:0, uominiFrame:0, corsaSenzaPalla:0,
              distRunnerArea:[], sprint:0,
              corseDur:[], corseDa:[], corseA:[], corseInArea:0 };
  window.__s = S;
  const CORSA = new Map();   // giocatore -> {t, da, min}
  const _step = window.step;
  const _doCross = window.doCross;
  const P = [];   // cross in volo
  S.cpuChiam=0; S.cpuVero=0; S.bersDecide=0; S.bersRilascio=0; S.bersNull=0;
  S.fuoriZonaTiro=0; S.veroBersaglio=0; S.mioBersaglio=0;
  S.verKick=0; S.verCarica=0; S.verLibero=0; S.verCpu=0;
  let _cbPuro=null;
  if(typeof crossCPU==='function'){
    const _cc = window.crossCPU, _cb = window.crossBersaglio;
    _cbPuro=_cb;
    let dentro=0;
    window.crossCPU = function(){ S.cpuChiam++; dentro=1; const r=_cc.apply(this,arguments); dentro=0; if(r) S.cpuVero++; return r; };
    window.crossBersaglio = function(){ const r=_cb.apply(this,arguments); if(dentro) S.bersDecide++; else S.bersRilascio++; if(!r) S.bersNull++; return r; };
  }

  window.doCross = function(p,nx,ny,mira){
    const r=_doCross.apply(this, arguments);
    S.crossPartiti++;
    P.push({team:p.team, giu:false, t:0});
    return r;
  };

  window.step = function(){
    _step.apply(this, arguments);
    if(!(G.scene==='play'||G.scene==='golden')) return;
    S.frames++;
    const b=G.ball;
    const own = b.owner>=0 ? G.players[b.owner] : null;

    for(const p of G.players){
      if(p.role==='gk'||p.out>0) continue;
      S.uominiFrame++;
      if(p.sprint) S.sprint++;
      const gx=p.team===0?FW:0, dg=Math.abs(gx-p.x);
      if(p.corsaArea){
        S.corsaAttiva++;
        if(own && own.team!==p.team) S.corsaSenzaPalla++;
        S.distRunnerArea.push(Math.round(dg));
        let c=CORSA.get(p);
        if(!c){ c={t:0, da:dg, min:dg}; CORSA.set(p,c); }
        c.t++; if(dg<c.min) c.min=dg;
      }else{
        const c=CORSA.get(p);
        if(c){
          S.corseDur.push(c.t); S.corseDa.push(Math.round(c.da)); S.corseA.push(Math.round(c.min));
          if(c.min<=GK_AREA_X) S.corseInArea++;
          CORSA.delete(p);
        }
      }
    }

    /* la catena del cross, valutata da fuori sul portatore */
    if(own && typeof crossBersaglio==='function'){
      S.conPortatore++;
      const t=own.team, opGoalX = t===0?FW:0;
      if(Math.abs(opGoalX-own.x) <= FW*0.48){
        S.inZonaX++;
        if(Math.abs(own.y-FH/2) >= GOAL_H){
          S.inFascia++;
          const F=crossFinestra();
          let compagnoInArea=false, okDist=false, okGk=false, okVarco=false;
          for(const q of G.players){
            if(q.team!==t || q===own || q.out>0 || q.role==='gk') continue;
            const qx=q.x+q.vx*0.75, qy=q.y+q.vy*0.75;
            if(!dentroArea(t,qx,qy)) continue;
            compagnoInArea=true;
            const d=Math.hypot(qx-own.x, qy-own.y);
            if(d<F.dMin || d>F.dMax) continue;
            okDist=true;
            if(crossPortiereCopre(t,qx,qy)) continue;
            okGk=true;
            const nx=(qx-own.x)/d, ny=(qy-own.y)/d;
            if(!crossVarcoLibero(own,nx,ny,d/F.c)) continue;
            okVarco=true;
          }
          const fz = (typeof zonaTiro==='function') && !zonaTiro(own.x, own.y, opGoalX);
          if(fz) S.fuoriZonaTiro++;
          if(okVarco) S.mioBersaglio++;
          if(fz && _cbPuro && _cbPuro(own, opGoalX)){
            S.veroBersaglio++;
            if(own.kickCd>0) S.verKick++;
            if(own.charge>=0) S.verCarica++;
            if(own.kickCd<=0 && own.charge<0) S.verLibero++;
            if(G.cpu[own.team]) S.verCpu++;
          }
          if(compagnoInArea){
            S.conCompagnoInArea++;
            if(okDist) S.passaDistanza++; else S.bocciaDistanza++;
            if(okDist){ if(okGk) S.passaPortiere++; else S.bocciaPortiere++; }
            if(okGk){ if(okVarco) S.passaVarco++; else S.bocciaVarco++; }
            if(okVarco){ S.bersaglioOK++; if(own.kickCd>0) S.kickCd++; else S.occasioni++; }
          }
        }
      }
    }

    /* dove cade, e chi c'e' */
    for(let i=P.length-1;i>=0;i--){
      const c=P[i]; c.t++;
      if(!c.giu && b.z<=0){
        c.giu=true;
        const gx=c.team===0?FW:0;
        S.cadutaDg.push(Math.round(Math.abs(gx-b.x)));
        let vic=1e9, vicP=null;
        for(const q of G.players){
          if(q.team!==c.team || q.role==='gk' || q.out>0) continue;
          const d=Math.hypot(q.x-b.x, q.y-b.y);
          if(d<vic){ vic=d; vicP=q; }
        }
        S.cadutaVicino.push(Math.round(vic));
        if(vicP && dentroArea(c.team, vicP.x, vicP.y)) S.cadutaVicinoInArea++;
      }
      if(c.t>150) P.splice(i,1);
    }
  };
  return 'ok';
})()`;

async function gioca(porta, taglia, partite, seme) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true });
  const pag = await ctx.newPage();
  const err = []; pag.on('pageerror', e => err.push(e.message));
  await pag.addInitScript(s0 => { let s = s0 >>> 0; const pr = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; }; Math.random = () => pr() / 4294967296; window.__caso = { semina(n) { s = n >>> 0 || 1; } }; }, seme);
  await pag.goto(`http://127.0.0.1:${porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
  if (await pag.evaluate(SONDA) !== 'ok') throw new Error('sonda ko');
  const out = [];
  for (let i = 0; i < partite; i++) {
    out.push(await pag.evaluate(([sm, tg]) => {
      window.__caso.semina(sm);
      const S = window.__s;
      for (const k in S) { if (Array.isArray(S[k])) S[k].length = 0; else S[k] = 0; }
      const t = window.__test;
      t.startMatch(1, 1, tg !== 5 ? { size: tg } : undefined);
      t.setCpuVsCpu(true);
      let sim = 0; while (t.state !== 'end' && sim < 600) { t.simulate(10); sim += 10; }
      return JSON.parse(JSON.stringify(S));
    }, [(seme + i) >>> 0, taglia]));
  }
  await browser.close();
  return { out, err };
}

(async () => {
  const gioco = process.argv[2];
  const taglia = +process.argv[3] || 5;
  const partite = +process.argv[4] || 12;
  const srv = await servi(gioco === 'repo' ? '' : path.resolve(gioco));
  const { out, err } = await gioca(srv.porta, taglia, partite, 20260803);
  srv.chiudi();
  const som = k => out.reduce((s, x) => s + (Array.isArray(x[k]) ? 0 : x[k]), 0);
  const cat = k => out.reduce((a, x) => a.concat(x[k]), []);
  const med = a => { if (!a.length) return null; const b = a.slice().sort((x, y) => x - y); return b[b.length >> 1]; };
  const pct = (n, d) => d ? (n / d * 100).toFixed(2) + '%' : '-';
  const F = som('uominiFrame') || 1;
  console.log(`\ngioco=${path.basename(gioco)} taglia=${taglia} partite=${partite} (semi 20260803..)`);
  console.log(`  fotogrammi di gioco vivo        ${som('frames')}`);
  console.log(`  ...con un portatore             ${som('conPortatore')}`);
  console.log(`  ...nel 48% offensivo            ${som('inZonaX')}`);
  console.log(`  ...e fuori dalla banda porta    ${som('inFascia')}   <- la posizione da cui si crossa`);
  console.log(`  ...con un compagno IN AREA      ${som('conCompagnoInArea')}   ${pct(som('conCompagnoInArea'), som('inFascia'))} di quelli`);
  console.log(`       passa la distanza          ${som('passaDistanza')}  (bocciati ${som('bocciaDistanza')})`);
  console.log(`       passa il portiere          ${som('passaPortiere')}  (bocciati ${som('bocciaPortiere')})`);
  console.log(`       passa il varco             ${som('passaVarco')}  (bocciati ${som('bocciaVarco')})`);
  console.log(`  OCCASIONI DI CROSS complete     ${som('bersaglioOK')}   (di cui ${som('kickCd')} con kickCd>0)`);
  console.log(`  ...e FUORI dalla zona di tiro   ${som('fuoriZonaTiro')}   (da li' e' lecito crossare)`);
  console.log(`  bersaglio buono: mia copia      ${som('mioBersaglio')}   crossBersaglio del gioco ${som('veroBersaglio')}`);
  console.log(`       di quelli: kickCd>0 ${som('verKick')}  charge>=0 ${som('verCarica')}  LIBERO ${som('verLibero')}  squadra CPU ${som('verCpu')}`);
  console.log(`  crossCPU chiamata               ${som('cpuChiam')}   ha aperto l'anticipo ${som('cpuVero')}`);
  console.log(`  crossBersaglio: alla decisione  ${som('bersDecide')}   AL RILASCIO ${som('bersRilascio')}   nulli ${som('bersNull')}`);
  console.log(`  CROSS PARTITI                   ${som('crossPartiti')}`);
  console.log(`  punto di caduta: dg mediana     ${med(cat('cadutaDg'))}  n=${cat('cadutaDg').length}`);
  console.log(`  compagno piu' vicino alla caduta mediana ${med(cat('cadutaVicino'))}  (raccolta a 20,8)`);
  console.log(`  ...e stava in area              ${som('cadutaVicinoInArea')}`);
  console.log(`  corsaArea attiva                ${pct(som('corsaAttiva'), F)}   senza palla ${pct(som('corsaSenzaPalla'), F)}`);
  console.log(`  sprint                          ${pct(som('sprint'), F)}`);
  console.log(`  chi corre in area: dg mediana   ${med(cat('distRunnerArea'))}  (l'area finisce a GK_AREA_X)`);
  const dur = cat('corseDur');
  console.log(`  CORSE IN AREA: quante           ${dur.length}   durata mediana ${med(dur)} fotogrammi (${dur.length ? (med(dur) / 60).toFixed(2) : '-'} s)`);
  console.log(`       dg alla partenza mediana   ${med(cat('corseDa'))}   dg MINIMO raggiunto mediana ${med(cat('corseA'))}`);
  console.log(`       corse che ENTRANO in area  ${som('corseInArea')} su ${dur.length}   ${pct(som('corseInArea'), dur.length)}`);
  if (err.length) console.log('  ECCEZIONI: ' + err[0]);
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
