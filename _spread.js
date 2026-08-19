/* _spread.js — quanto e' ROBUSTA la misura, non solo quanto e' ripetibile.
   Inchiodare il seme rende il numero ripetibile; ma se cambiando seme il
   numero balla fra 2,4 e 5,1 il cancello e' una lotteria con un biglietto
   solo. Qui si misura la dispersione fra semi diversi al variare del
   numero di fotogrammi campionati.
   uso: node _spread.js <nFotogrammi> [seme1,seme2,...]                  */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname);
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(RADICE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

const MISURA = (opz) => {
  const { dalt, seme, nFot } = opz;
  const t = window.__test;
  const cv = document.getElementById('gioco');
  const c2 = cv.getContext('2d', { willReadFrequently: true });
  const DPRc = cv.width / window.innerWidth;
  t.dismissSplash && t.dismissSplash();
  const avvia = () => { t.setDalt(!!dalt); t.startMatch(1, 1); t.setCpuVsCpu(true); };
  const avanza = sec => { const n = Math.round(sec * 60); for (let i = 0; i < n; i++) { t.simulate(1 / 60); t.disegna(); } };
  window.__risemina(seme); avvia(); avanza(1.5);          // riscaldamento
  window.__risemina(seme); avvia();

  const lumin = (r, g, b) => { const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const mediana = a => { const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1]; };
  const FW = 1150, FH = 560;
  const maglia = [[], []], erba = [[], []];
  let fotogrammi = 0;
  const OMB = t.ombraCapsula();
  const dentroOmbra = (qx, qy, wx, wy) => {
    const ax = qx + OMB.piedeX, ay = qy + OMB.piedeY;
    let t2 = (wx - ax) * OMB.ux + (wy - ay) * OMB.uy;
    if (t2 < OMB.l0) t2 = OMB.l0; if (t2 > OMB.l1) t2 = OMB.l1;
    const px = ax + OMB.ux * t2, py = ay + OMB.uy * t2;
    return Math.hypot(wx - px, wy - py) < OMB.semiCorto * 1.6 + 4;
  };
  const DUR = 7.2, passo = DUR / nFot;
  for (let k = 0; k < nFot; k++) {
    avanza(k === 0 ? 3.0 : passo);
    for (let i = 0; i < 60 && !(t.state === 'play' || t.state === 'golden'); i++) avanza(0.1);
    if (t.state !== 'play' && t.state !== 'golden') continue;
    fotogrammi++;
    const img = c2.getImageData(0, 0, cv.width, cv.height).data;
    const W = cv.width, H = cv.height;
    const S2 = t.view.S2, Ax = t.view.Ax, Ay = t.view.Ay;
    const B = t.bande, VWc = W / DPRc, VHc = H / DPRc;
    const pixel = (sx, sy) => { const x = Math.round(sx * DPRc), y = Math.round(sy * DPRc); if (x < 0 || y < 0 || x >= W || y >= H) return null; const o = (y * W + x) * 4; return [img[o], img[o + 1], img[o + 2]]; };
    const inQuadro = (sx, sy) => sx > 2 && sx < VWc - 2 && sy > B.bar + 2 && sy < VHc - B.foot - 2;
    for (const p of t.players) {
      if (p.role === 'gk' || p.out > 0) continue;
      if (p.slide >= 0 || p.recover > 0 || p.dive > 0 || p.celeb > 0) continue;
      for (const av of [-12.5, -11.5, -10.5]) for (const la of [-1.5, -1.0, -0.5, 0, 0.5, 1.0, 1.5]) {
        const sx = (p.x + la) * S2 + Ax, sy = (p.y + av) * S2 + Ay;
        if (!inQuadro(sx, sy)) continue;
        const c = pixel(sx, sy); if (c) maglia[p.team].push(c);
      }
      for (const r of [30, 34, 38, 42]) for (let ang = 0; ang < 360; ang += 15) {
        const rad = ang * Math.PI / 180, cx = Math.cos(rad), cy = Math.sin(rad);
        if (cx * OMB.ux + cy * OMB.uy > 0) continue;
        const wx = p.x + cx * r, wy = p.y + cy * r;
        if (wx < 8 || wx > FW - 8 || wy < 8 || wy > FH - 8) continue;
        let libero = true;
        for (const q of t.players) {
          if (q.out > 0) continue;
          if (q !== p && Math.hypot(q.x - wx, q.y - wy) < 30) { libero = false; break; }
          if (Math.abs(wx - q.x) < 20 && Math.abs(wy - (q.y + 2)) < 28) { libero = false; break; }
          if (dentroOmbra(q.x, q.y, wx, wy)) { libero = false; break; }
        }
        if (!libero) continue;
        if (Math.hypot(t.ball.x - wx, t.ball.y - wy) < 24) continue;
        const sx = wx * S2 + Ax, sy = wy * S2 + Ay;
        if (!inQuadro(sx, sy)) continue;
        const c = pixel(sx, sy); if (c) erba[p.team].push(c);
      }
    }
  }
  const rappr = a => a.length ? [mediana(a.map(c => c[0])), mediana(a.map(c => c[1])), mediana(a.map(c => c[2]))] : null;
  const esa = c => c ? '#' + c.map(v => v.toString(16).padStart(2, '0')).join('') : '?';
  const out = [];
  for (let sq = 0; sq < 2; sq++) {
    const m = rappr(maglia[sq]), e = rappr(erba[sq]);
    const Lm = lumin(m[0], m[1], m[2]), Le = lumin(e[0], e[1], e[2]);
    out.push({ r: +(((Math.max(Lm, Le) + 0.05) / (Math.min(Lm, Le) + 0.05)).toFixed(3)), m: esa(m), e: esa(e), nM: maglia[sq].length, nE: erba[sq].length });
  }
  t.setDalt(false);
  return { fotogrammi, out };
};

(async () => {
  const nFot = +(process.argv[2] || 8);
  const semi = (process.argv[3] || '20260728,1,2,3,4,5').split(',').map(Number);
  const srv = await servi();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(seme => {
    let s = seme >>> 0 || 1;
    window.__risemina = n => { s = (n >>> 0) || 1; };
    const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => p() / 4294967296;
  }, 20260728);
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.waitForTimeout(400);
  console.log(`fotogrammi campionati: ${nFot}`);
  const v = [[], []];
  for (const seme of semi) {
    const t0 = Date.now();
    const r = await pag.evaluate(MISURA, { dalt: true, seme, nFot });
    console.log(`  seme ${seme}: P1=${r.out[0].r} (${r.out[0].m}/${r.out[0].e}, ${r.out[0].nM}/${r.out[0].nE})  P2=${r.out[1].r} (${r.out[1].m}/${r.out[1].e}, ${r.out[1].nM}/${r.out[1].nE})  fot=${r.fotogrammi}  ${Date.now() - t0}ms`);
    v[0].push(r.out[0].r); v[1].push(r.out[1].r);
  }
  for (const sq of [0, 1]) {
    const a = v[sq], mu = a.reduce((x, y) => x + y, 0) / a.length;
    const sd = Math.sqrt(a.reduce((s, x) => s + (x - mu) ** 2, 0) / a.length);
    console.log(`  P${sq + 1}: min ${Math.min(...a).toFixed(2)}  max ${Math.max(...a).toFixed(2)}  media ${mu.toFixed(2)}  scarto ${sd.toFixed(2)}`);
  }
  await browser.close(); srv.chiudi();
})().catch(e => { console.error(e); process.exit(1); });
