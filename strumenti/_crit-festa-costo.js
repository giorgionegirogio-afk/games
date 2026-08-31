/* =====================================================================
   _crit-festa-costo.js — IL COSTO DOVE LA FESTA SI DISEGNA DAVVERO.

   Il banco ?rigcosto del gioco misura 22 figure a **30 px senza ombra**.
   Le due clip toccate, in partita, si vedono SOLO nella ripresa del gol,
   dove il gioco le disegna a 105-232 px di periferica CON ombra
   (misurato: _crit-festa-pixel.js). Un costo preso a 30 px non e' il
   costo di quella scena: il riempimento va col quadrato dell'altezza.
   Qui si misura alla taglia vera, appaiato A-B-A-B, e in piu' si
   cronometra la render() vera dei fotogrammi della festa.

   uso: node strumenti/_crit-festa-costo.js --a fuori/_anim-terza-PRIMA.html
                                            --b fuori/anim-terza.html
   ===================================================================== */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i+1] && !process.argv[i+1].startsWith('--') ? process.argv[i+1] : d; };
const A = arg('a', 'fuori/_anim-terza-PRIMA.html'), B = arg('b', 'fuori/anim-terza.html');
const GIRI = +arg('giri', 6);
const HPX = +arg('hpx', 200);
const TAGLIA = +arg('taglia', 11);

function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(RADICE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

const BENCH = (clip, hpx) => `((clip,H)=>{
  const cv=document.createElement('canvas'); cv.width=1830; cv.height=824;
  const g=cv.getContext('2d'); const lk=Rig3D.lookPredefinito;
  // scaldata
  for(let f=0;f<40;f++){ g.clearRect(0,0,1830,824);
    for(let i=0;i<5;i++) Rig3D.disegna(g, 200+i*330, 620, H, Math.PI+(i&1?0.38:-0.38), 'alto', clip, (f/60+i*0.13)/Rig3D.CLIPS[clip].freq, lk, true, 2); }
  const t0=performance.now();
  for(let f=0;f<300;f++){ g.clearRect(0,0,1830,824);
    for(let i=0;i<5;i++) Rig3D.disegna(g, 200+i*330, 620, H, Math.PI+(i&1?0.38:-0.38), 'alto', clip, (f/60+i*0.13)/Rig3D.CLIPS[clip].freq, lk, true, 2); }
  return (performance.now()-t0)/300;
})(${JSON.stringify(clip)},${hpx})`;

async function apri(br, srv, file) {
  const ctx = await br.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:' + srv.porta + '/' + file.replace(/\\/g, '/'), { waitUntil: 'load' });
  await p.waitForFunction(() => window.__test && window.__test.state);
  await p.evaluate(() => { window.requestAnimationFrame = () => 0; });
  return p;
}

(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  const pa = await apri(br, srv, A), pb = await apri(br, srv, B);

  const CLIP = ['pugno', 'cielo', 'esultanza', 'corsa'];
  const res = {};
  for (const c of CLIP) res[c] = { a: [], b: [] };
  for (let g = 0; g < GIRI; g++) {
    for (const c of CLIP) {
      res[c].a.push(await pa.evaluate(BENCH(c, HPX)));
      res[c].b.push(await pb.evaluate(BENCH(c, HPX)));
    }
  }
  const med = v => { const s = v.slice().sort((x, y) => x - y); return s[s.length >> 1]; };
  console.log('=== RIG alla taglia della ripresa del gol: 5 figure x ' + HPX + ' px CON ombra, 300 fotogrammi, ' + GIRI + ' giri A-B ===');
  console.log('  clip          PRIMA    DOPO    scarto');
  for (const c of CLIP) {
    const a = med(res[c].a), b = med(res[c].b);
    console.log('  ' + c.padEnd(12) + a.toFixed(3).padStart(7) + b.toFixed(3).padStart(8) + ('  ' + (100 * (b - a) / a).toFixed(2) + '%').padStart(10) +
      '   (a: ' + res[c].a.map(x => x.toFixed(2)).join('/') + '  b: ' + res[c].b.map(x => x.toFixed(2)).join('/') + ')');
  }

  /* ---- la render() vera durante la festa, 11 contro 11 ---- */
  console.log('\n=== render() VERA: gol a ' + TAGLIA + ' contro ' + TAGLIA + ', i 2,4 s di festa ===');
  const scena = async (p) => {
    await p.evaluate(([t]) => { window.__test.semina(20260827); window.__test.startMatch('cpu', 1, { size: t }); }, [TAGLIA]);
    await p.evaluate(() => { for (let i = 0; i < 60 * 6; i++) window.__test.simulate(1 / 60); window.__test.disegna(); });
    await p.evaluate(() => window.__test.forceGoal(0));
    return await p.evaluate(() => {
      const out = [];
      for (let k = 0; k < 130; k++) {
        const t0 = performance.now();
        window.__test.disegna();
        out.push(performance.now() - t0);
        window.__test.simulate(1 / 60);
      }
      out.sort((x, y) => x - y);
      return { med: out[out.length >> 1], p90: out[(out.length * 0.9) | 0], max: out[out.length - 1],
               somma: out.reduce((s, v) => s + v, 0) / out.length };
    });
  };
  const rA = [], rB = [];
  for (let g = 0; g < 3; g++) { rA.push(await scena(pa)); rB.push(await scena(pb)); }
  const mm = (arr, k) => med(arr.map(x => x[k]));
  console.log('  mediana  PRIMA ' + mm(rA, 'med').toFixed(3) + ' ms   DOPO ' + mm(rB, 'med').toFixed(3) + ' ms   scarto ' + (100 * (mm(rB, 'med') - mm(rA, 'med')) / mm(rA, 'med')).toFixed(2) + '%');
  console.log('  p90      PRIMA ' + mm(rA, 'p90').toFixed(3) + ' ms   DOPO ' + mm(rB, 'p90').toFixed(3) + ' ms');
  console.log('  max      PRIMA ' + mm(rA, 'max').toFixed(3) + ' ms   DOPO ' + mm(rB, 'max').toFixed(3) + ' ms');
  console.log('  crudi A: ' + rA.map(x => x.med.toFixed(2)).join('/') + '   B: ' + rB.map(x => x.med.toFixed(2)).join('/'));

  await br.close(); srv.chiudi();
})();
