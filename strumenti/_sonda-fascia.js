/* sonda usa-e-getta: DOVE sta il portatore CPU, e chi ha in area.
   Serve solo a tarare le soglie del cross. Non e' un cancello. */
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
  const S = { camp:[], n:0 };
  const _step = window.step;
  window.step = function(){
    _step.apply(this, arguments);
    if(!(G.scene==='play'||G.scene==='golden')) return;
    S.n++;
    if(S.n % 6) return;                      // un campione ogni dieci al secondo
    const b=G.ball;
    if(b.owner<0) return;
    const p=G.players[b.owner];
    if(p.role==='gk') return;
    const t=p.team, gx=t===0?FW:0;
    const dg=Math.abs(gx-p.x);
    if(dg>FW*0.55) return;                   // solo il terzo offensivo abbondante
    /* il punto d'atterraggio del cross, esattamente come doCross */
    const lx = gx + (t===0?-55:55);
    const ly = FH/2 + (p.y<FH/2?1:-1)*GOAL_H*0.28;
    const dist=Math.max(1,Math.hypot(lx-p.x, ly-p.y));
    const T=Math.min(0.75,Math.max(0.5,dist/430));
    /* compagno piu' vicino al punto d'atterraggio, previsto a T */
    let dm=1e9, dmOra=1e9;
    for(const q of G.players){
      if(q.team!==t||q===p||q.out>0||q.role==='gk') continue;
      const d=Math.hypot(q.x+q.vx*T-lx, q.y+q.vy*T-ly);
      if(d<dm) dm=d;
      const d0=Math.hypot(q.x-lx, q.y-ly);
      if(d0<dmOra) dmOra=d0;
    }
    /* avversario piu' vicino, e spazio davanti nella direzione del cross */
    const nx=(lx-p.x)/dist, ny=(ly-p.y)/dist;
    let press=1e9, avanti=1e9;
    for(const o of G.players){
      if(o.team===t||o.out>0) continue;
      const dx=o.x-p.x, dy=o.y-p.y, d=Math.hypot(dx,dy);
      if(d<press) press=d;
      const proj=dx*nx+dy*ny, lat=Math.abs(-dx*ny+dy*nx);
      if(proj>0 && proj<160 && lat<40 && proj<avanti) avanti=proj;
    }
    /* il compagno PIU' AVANZATO: quanto dista dalla porta e dall'asse */
    let av=null, avdg=1e9;
    for(const q of G.players){
      if(q.team!==t||q===p||q.out>0||q.role==='gk') continue;
      const d=Math.abs(gx-q.x);
      if(d<avdg){ avdg=d; av=q; }
    }
    S.camp.push([Math.round(dg), Math.round(Math.abs(p.y-FH/2)), Math.round(dm), Math.round(dmOra), Math.round(press), avanti>1e8?-1:Math.round(avanti), Math.round(dist),
                 av?Math.round(avdg):-1, av?Math.round(Math.abs(av.y-FH/2)):-1, av?Math.round(Math.hypot(av.x-p.x,av.y-p.y)):-1]);
  };
  window.__sf={ leggi:()=>S.camp, azzera:()=>{S.camp=[];S.n=0;} };
  return 'ok';
})()`;

(async () => {
  const srv = await servi(path.resolve(GIOCO));
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true });
  const pag = await ctx.newPage();
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
  await pag.evaluate(SONDA);
  let tutti = [];
  for (let i = 0; i < PARTITE; i++) {
    const c = await pag.evaluate(([seme, taglia]) => {
      const t = window.__test;
      window.__caso.semina(seme); window.__sf.azzera();
      t.startMatch(1, 1, taglia !== 5 ? { size: taglia } : undefined);
      t.setCpuVsCpu(true);
      let sim = 0; while (t.state !== 'end' && sim < 600) { t.simulate(10); sim += 10; }
      return window.__sf.leggi();
    }, [(20260803 + i) >>> 0, TAGLIA]);
    tutti = tutti.concat(c);
  }
  await browser.close(); srv.chiudi();

  const FWv = { 5: 1150, 7: 1610, 11: 2300 }[TAGLIA], FHv = { 5: 560, 7: 784, 11: 1120 }[TAGLIA];
  const pct = (a, q) => { const b = a.slice().sort((x, y) => x - y); return b[Math.min(b.length - 1, Math.max(0, Math.round((b.length - 1) * q)))]; };
  console.log(`taglia ${TAGLIA}  FW=${FWv} FH=${FHv}  campioni=${tutti.length} (portatore nel 55% offensivo, 10 Hz, ${PARTITE} partite)`);
  const col = i => tutti.map(r => r[i]);
  const nomi = ['distGoal', '|y-FH/2|', 'compagno@T', 'compagno ora', 'pressione', 'spazio avanti', 'dist cross',
    'avanzato dg', 'avanzato |y|', 'avanzato d(port)'];
  for (let i = 0; i < 10; i++) {
    const v = col(i).filter(x => x >= 0);
    console.log('  ' + nomi[i].padEnd(15) + ' p10=' + String(pct(v, .1)).padStart(5) + ' p25=' + String(pct(v, .25)).padStart(5) +
      ' med=' + String(pct(v, .5)).padStart(5) + ' p75=' + String(pct(v, .75)).padStart(5) + ' p90=' + String(pct(v, .9)).padStart(5) +
      '  (n=' + v.length + ')');
  }
  /* DOVE STA IL COMPAGNO quando il portatore e' davvero fondo e largo */
  console.log('\n  compagno@T (il piu' + "'" + ' vicino al secondo palo) condizionato:');
  for (const fdg of [0.16, 0.22, 0.28, 0.34]) {
    for (const fy of [0.00, 0.14, 0.20, 0.26]) {
      const s = tutti.filter(r => r[0] < FWv * fdg && r[1] > FHv * fy);
      if (!s.length) { console.log(`    dg<${fdg}FW  |y|>${fy}FH   n=0`); continue; }
      const v = s.map(r => r[2]);
      console.log(`    dg<${fdg}FW  |y|>${fy.toFixed(2)}FH   n=${String(s.length).padStart(4)} (${(s.length / tutti.length * 100).toFixed(1)}%)` +
        `  p10=${String(pct(v, .1)).padStart(4)} p25=${String(pct(v, .25)).padStart(4)} med=${String(pct(v, .5)).padStart(4)}` +
        `  distCross med=${pct(s.map(r => r[6]), .5)}`);
    }
  }
  console.log('\n  il COMPAGNO PIU\' AVANZATO quando il portatore e\' fondo e largo:');
  for (const fdg of [0.22, 0.30, 0.38]) {
    for (const fy of [0.00, 0.14, 0.20]) {
      const s = tutti.filter(r => r[0] < FWv * fdg && r[1] > FHv * fy && r[7] >= 0);
      if (!s.length) { console.log(`    dg<${fdg}FW |y|>${fy}FH  n=0`); continue; }
      console.log(`    dg<${fdg}FW |y|>${fy.toFixed(2)}FH  n=${String(s.length).padStart(4)}` +
        `  suo dg: p25=${pct(s.map(r => r[7]), .25)} med=${pct(s.map(r => r[7]), .5)} p75=${pct(s.map(r => r[7]), .75)}` +
        `  suo |y|: med=${pct(s.map(r => r[8]), .5)}` +
        `  dist dal portatore: med=${pct(s.map(r => r[9]), .5)}`);
    }
  }
  console.log('\n  frazione dei campioni che soddisfa le tre condizioni insieme (bersaglio = il compagno):');
  for (const fy of [0.10, 0.16, 0.22]) {
    for (const fa of [0.14, 0.20, 0.26, 0.34]) {
      const n = tutti.filter(r => r[0] < FWv * 0.34 && r[1] > FHv * fy && r[7] >= 0 && r[7] < FWv * fa && (r[5] < 0 || r[5] > 45)).length;
      if (fa === 0.14) process.stdout.write('    dg<0.34FW |y|>' + fy.toFixed(2) + 'FH: ');
      process.stdout.write('  compagno dg<' + fa + 'FW=' + (n / tutti.length * 100).toFixed(2) + '%');
      if (fa === 0.34) process.stdout.write('\n');
    }
  }
  const dentro = tutti.filter(r => r[0] < FWv * 0.28);
  console.log('  campioni nel 28% offensivo: ' + dentro.length + ' (' + (dentro.length / tutti.length * 100).toFixed(0) + '%)');
})();
