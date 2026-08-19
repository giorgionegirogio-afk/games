/* _sonda-glifo.js — ATTREZZO (prefisso _), non un cancello.
   Replica ESATTAMENTE la finestra del torso con cui collaudo.js misura il
   contrasto maglia/erba (file -12,5/-11,5/-10,5 per colonne -1,5..+1,5) e
   conta quanti di quei campioni sono pixel CHIARI, cioe' non maglia. Serve
   a sapere se il numero sulla schiena sporca la sonda del cancello.
   uso: node strumenti/_sonda-glifo.js file.html [--dalt] */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');
const PROVA = path.resolve(process.argv[2]);
const DALT = process.argv.includes('--dalt');
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
function servi() {
  return new Promise(ok => {
    const s = http.createServer((rq, rs) => {
      let f = path.join(RADICE, decodeURIComponent(rq.url.split('?')[0]));
      if (/CALCETTO-il-gioco\.html$/i.test(f)) f = PROVA;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { rs.writeHead(404); rs.end(); return; }
      rs.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(rs);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
(async () => {
  const srv = await servi(); const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const pg = await ctx.newPage();
  await pg.addInitScript(() => { let s = 20260728; const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; }; Math.random = () => p() / 4294967296; });
  await pg.addInitScript(() => {
    const P = 1000 / 60; let t = 0, c = [];
    window.requestAnimationFrame = f => { c.push(f); return c.length; };
    window.cancelAnimationFrame = () => {}; try { performance.now = () => t; } catch (e) {}
    window.__banco = { passo(n) { for (let i = 0; i < n; i++) { const q = c; c = []; t += P; for (const f of q) { try { f(t); } catch (e) {} } } return t; } };
  });
  await pg.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pg.waitForFunction('window.__test!==undefined', null, { timeout: 20000 });
  await pg.waitForTimeout(400);
  await pg.evaluate(d => {
    const t = window.__test; t.dismissSplash && t.dismissSplash();
    t.setDalt(!!d); t.startMatch(1, 1);
    t.Tut && t.Tut.finish && t.Tut.finish(true); t.posaHUD && t.posaHUD(true); t.setCpuVsCpu && t.setCpuVsCpu(true);
  }, DALT);
  const tot = [ {n:0,chiari:0,scuri:0,px:[],S2:[]}, {n:0,chiari:0,scuri:0,px:[],S2:[]} ];
  for (let k = 0; k < 24; k++) {
    await pg.evaluate(() => window.__banco.passo(27));
    const r = await pg.evaluate(() => {
      const t = window.__test, cv = document.getElementById('gioco');
      const cx = cv.getContext('2d', { willReadFrequently: true });
      const W = cv.width, H = cv.height, D = W / window.innerWidth;
      if (t.state !== 'play' && t.state !== 'golden') return null;
      const img = cx.getImageData(0, 0, W, H).data;
      const S2 = t.view.S2, Ax = t.view.Ax, Ay = t.view.Ay, B = t.bande;
      const VWc = W / D, VHc = H / D;
      const px = (sx, sy) => { const x = Math.round(sx * D), y = Math.round(sy * D);
        if (x < 0 || y < 0 || x >= W || y >= H) return null; const o = (y * W + x) * 4; return [img[o], img[o+1], img[o+2]]; };
      const dentro = (sx, sy) => sx > 2 && sx < VWc - 2 && sy > B.bar + 2 && sy < VHc - B.foot - 2;
      const out = [[0,0,0],[0,0,0]]; const pix=[[],[]];
      for (const p of t.players) {
        if (p.role === 'gk' || p.out > 0) continue;
        if (p.slide >= 0 || p.recover > 0 || p.dive > 0 || p.celeb > 0) continue;
        for (const av of [-12.5, -11.5, -10.5]) for (const la of [-1.5,-1,-0.5,0,0.5,1,1.5]) {
          const sx = (p.x + la) * S2 + Ax, sy = (p.y + av) * S2 + Ay;
          if (!dentro(sx, sy)) continue;
          const c = px(sx, sy); if (!c) continue;
          const L = 0.2126*c[0] + 0.7152*c[1] + 0.0722*c[2];
          out[p.team][0]++;
          if (L > 200) out[p.team][1]++;         // pixel CHIARO: alone o cifra bianca
          if (L < 45)  out[p.team][2]++;         // pixel SCURO: contorno o cifra nera
          pix[p.team].push(c);
        }
      }
      return { out, S2, pix };
    });
    if (!r) continue;
    for (let s = 0; s < 2; s++) { tot[s].n += r.out[s][0]; tot[s].chiari += r.out[s][1]; tot[s].scuri += r.out[s][2]; for(const c of r.pix[s]) tot[s].px.push(c); }
    tot[0].S2.push(+r.S2.toFixed(3));
  }
  console.log(`\n${path.basename(PROVA)}${DALT ? '  [daltonici]' : ''}  — finestra del torso di collaudo.js`);
  for (let s = 0; s < 2; s++) {
    console.log(`  P${s+1}: ${tot[s].n} campioni,  ${tot[s].chiari} CHIARI (L>200) = ` +
      `${(100*tot[s].chiari/Math.max(1,tot[s].n)).toFixed(2)}%,  ${tot[s].scuri} SCURI (L<45) = ` +
      `${(100*tot[s].scuri/Math.max(1,tot[s].n)).toFixed(2)}%`);
  }
  const med=a=>{const s=a.slice().sort((x,y)=>x-y);return s[s.length>>1];};
  for(let s=0;s<2;s++){ if(!tot[s].px.length) continue;
    const m=[0,1,2].map(i=>med(tot[s].px.map(c=>c[i])));
    const lin=c=>{c/=255;return c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4);};
    const Yv=0.2126*lin(m[0])+0.7152*lin(m[1])+0.0722*lin(m[2]);
    console.log('  P'+(s+1)+' MEDIANA maglia #'+m.map(v=>v.toString(16).padStart(2,'0')).join('')+'  Y '+Yv.toFixed(4));}
  console.log('  zoom camera S2 visti: ' + [...new Set(tot[0].S2)].sort((a,b)=>a-b).join(' '));
  await br.close(); srv.chiudi();
})();
