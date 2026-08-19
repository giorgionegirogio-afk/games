/* sonda usa-e-getta: QUALE CLAUSOLA di crossCPU respinge, contata su
   ogni fotogramma con un portatore. Non e' un cancello: e' un metro per
   tarare le soglie. */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');
const RADICE = 'C:/Users/Utenteee/Desktop/GitHub/games';
const GIOCO = process.argv[2];
const TAGLIA = +(process.argv[3] || 5);
const PARTITE = +(process.argv[4] || 8);

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
  const C = {};
  const K = ['tot','zona','fascia','nessuno','fuoriTiro','laterale','indietro','corta','lunga','portiere','varco','ok'];
  const azzera = () => { for(const k of K) C[k]=0; C.dist=[]; };
  azzera();
  const _step = window.step;
  window.step = function(){
    _step.apply(this, arguments);
    if(!(G.scene==='play'||G.scene==='golden')) return;
    const b=G.ball;
    if(b.owner<0) return;
    const p=G.players[b.owner];
    if(p.role==='gk') return;
    const t=p.team, opGoalX = t===0?FW:0;
    C.tot++;
    const dgP=Math.abs(opGoalX-p.x);
    if(dgP > FW*CROSS_ZONA){ C.zona++; return; }
    if(Math.abs(p.y-FH/2) < GOAL_H){ C.fascia++; return; }
    const KK=Math.max(0.001, 1.0498*ATTR_K);
    const eK=Math.exp(-CROSS_T*KK);
    const c=(1-eK)/(CROSS_T*KK);
    const dMin=430*CROSS_T*c, dMax=CROSS_RACCOLTA*(1-eK)/(KK*eK);
    let bx=0,by=0,bd=0,bdg=1e9,trovato=false;
    let vFuori=0,vLat=0,vIndi=0,vCorta=0,vLunga=0;
    for(const q of G.players){
      if(q.team!==t || q===p || q.out>0 || q.role==='gk') continue;
      const qx=q.x+q.vx*CROSS_T, qy=q.y+q.vy*CROSS_T;
      if(!zonaTiro(qx, qy, opGoalX)){ vFuori++; continue; }
      if(Math.abs(qy-FH/2) >= Math.abs(p.y-FH/2)){ vLat++; continue; }
      const dgQ=Math.abs(opGoalX-qx);
      if(dgQ > dgP + FW*CROSS_DIETRO){ vIndi++; continue; }
      const d=Math.hypot(qx-p.x, qy-p.y);
      C.dist.push(Math.round(d));
      if(d<dMin){ vCorta++; continue; }
      if(d>dMax){ vLunga++; continue; }
      if(dgQ<bdg){ bdg=dgQ; bx=qx; by=qy; bd=d; trovato=true; }
    }
    if(!trovato){
      if(vCorta) C.corta++; else if(vLunga) C.lunga++;
      else if(vIndi) C.indietro++; else if(vLat) C.laterale++;
      else if(vFuori) C.fuoriTiro++; else C.nessuno++;
      return;
    }
    const nx=(bx-p.x)/bd, ny=(by-p.y)/bd;
    const dA=bd/c;
    const gk=portiereDi(1-t);
    if(gk && Math.hypot(gk.x-bx, gk.y-by) < GK_REACH+B_R+P_R){ C.portiere++; return; }
    const t0=(CROSS_T-Math.sqrt(CROSS_T*CROSS_T-4*Z_SOPRA_TESTA/280))/2;
    const varco=(dA/CROSS_T)*(1-Math.exp(-KK*t0))/KK;
    for(const o of G.players){
      if(o.team===t || o.out>0) continue;
      const ox=o.x-p.x, oy=o.y-p.y;
      const lungo=ox*nx+oy*ny;
      if(lungo<=0 || lungo>=varco) continue;
      if(Math.abs(-ox*ny+oy*nx) < P_R+B_R){ C.varco++; return; }
    }
    C.ok++;
  };
  window.__cd={ leggi:()=>C, azzera, chiavi:K };
  return 'ok';
})()`;

(async () => {
  const srv = await servi(path.resolve(GIOCO));
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true });
  const pag = await ctx.newPage();
  pag.on('pageerror', e => console.log('ECCEZIONE: ' + e.message));
  await pag.addInitScript(seme => {
    let s = seme >>> 0 || 1;
    const pr = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => pr() / 4294967296;
    window.__caso = { semina(n) { s = n >>> 0 || 1; } };
  }, 20260803);
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => { window.__test.dismissSplash && window.__test.dismissSplash(); });
  const ok = await pag.evaluate(SONDA);
  if (ok !== 'ok') throw new Error('sonda: ' + ok);
  const tot = {}; let dist = [];
  for (let i = 0; i < PARTITE; i++) {
    const c = await pag.evaluate(([seme, taglia]) => {
      const t = window.__test;
      window.__caso.semina(seme); window.__cd.azzera();
      t.startMatch(1, 1, taglia !== 5 ? { size: taglia } : undefined);
      t.setCpuVsCpu(true);
      let sim = 0; while (t.state !== 'end' && sim < 600) { t.simulate(10); sim += 10; }
      return window.__cd.leggi();
    }, [(20260803 + i) >>> 0, TAGLIA]);
    for (const k in c) { if (k === 'dist') { dist = dist.concat(c.dist); continue; } tot[k] = (tot[k] || 0) + c[k]; }
  }
  await browser.close(); srv.chiudi();
  const pc = n => ((n || 0) / Math.max(1, tot.tot) * 100).toFixed(2) + '%';
  console.log(`taglia ${TAGLIA}, ${PARTITE} partite — fotogrammi con un portatore: ${tot.tot}`);
  const etich = {
    zona: 'ZONA: il portatore e\' troppo lontano', fascia: 'FASCIA: e\' dentro la banda del tiro',
    fuoriTiro: 'nessun compagno nella zona di tiro', laterale: 'il compagno non e\' piu\' centrale',
    indietro: 'il compagno e\' troppo indietro', corta: 'DISTANZA: sotto il minimo (non scavalca)',
    lunga: 'DISTANZA: sopra il massimo (arriva forte)', nessuno: 'nessun compagno disponibile',
    portiere: 'il pallone cadrebbe in mano al portiere', varco: 'un corpo nel varco', ok: 'PASSANO TUTTE'
  };
  for (const k of ['zona', 'fascia', 'nessuno', 'fuoriTiro', 'laterale', 'indietro', 'corta', 'lunga', 'portiere', 'varco', 'ok'])
    console.log('  ' + etich[k].padEnd(42) + String(tot[k] || 0).padStart(7) + '  ' + pc(tot[k]));
  const s = dist.slice().sort((a, b) => a - b);
  const q = f => s.length ? s[Math.round((s.length - 1) * f)] : -1;
  console.log(`  distanza portatore-compagno candidato (n=${s.length}): p10=${q(.1)} p25=${q(.25)} med=${q(.5)} p75=${q(.75)} p90=${q(.9)}`);
})();
