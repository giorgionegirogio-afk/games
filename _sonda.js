/* _sonda.js — attrezzo di diagnosi (ignorato da git, prefisso _)
   Ripete la misura del contrasto maglia/erba MOLTE volte nello stesso
   processo, con attese di durata diversa in mezzo, e stampa lo stato al
   momento del campionamento. Serve a capire che cosa distingue le due
   modalita' bimodali (2,81/3,10) e (3,74/3,66).                        */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname);
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
               '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
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

const MISURA = async (opz) => {
  const dalt = opz.dalt, RISEMINA = opz.risemina, CATCHUP = opz.catchup | 0;
  const t = window.__test;
  const cv = document.getElementById('gioco');
  const c2 = cv.getContext('2d', { willReadFrequently: true });
  const DPRc = cv.width / window.innerWidth;
  const nrand0 = window.__nrand, nraf0 = window.__nraf;

  t.dismissSplash && t.dismissSplash();
  if (opz.riscaldo) {
    window.__risemina(20260728);
    t.setDalt(!!dalt); t.startMatch(1, 1); t.setCpuVsCpu(true);
    for (let i = 0; i < 90; i++) { t.simulate(1 / 60); t.disegna(); }
  }
  if (RISEMINA) window.__risemina(20260728);
  t.setDalt(!!dalt);
  t.startMatch(1, 1);
  t.setCpuVsCpu(true);
  /* passo accoppiato: un disegno ogni passo di fisica, come il gioco vero */
  const avanza = sec => { const n = Math.round(sec * 60); for (let i = 0; i < n; i++) { t.simulate(1 / 60); t.disegna(); } };
  const kickTeam = t.G ? t.G.kickTeam : null;
  const nrandDopoStart = window.__nrand;

  const lumin = (r, g, b) => {
    const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const mediana = a => { const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1]; };
  const FW = 1150, FH = 560;
  const maglia = [[], []], erba = [[], []];
  let fotogrammi = 0;
  const diario = [];
  const OMB = (t.ombraCapsula && t.ombraCapsula()) ||
              { ux: 0.9406, uy: 0.3402, l0: 0, l1: 140, semiCorto: 7.6, piedeX: 4.2, piedeY: 7.8 };
  const dentroOmbra = (qx, qy, wx, wy) => {
    const ax = qx + OMB.piedeX, ay = qy + OMB.piedeY;
    const rx = wx - ax, ry = wy - ay;
    let t2 = rx * OMB.ux + ry * OMB.uy;
    if (t2 < OMB.l0) t2 = OMB.l0;
    if (t2 > OMB.l1) t2 = OMB.l1;
    const px = ax + OMB.ux * t2, py = ay + OMB.uy * t2;
    const semi = OMB.semiCorto * 1.6 + 4;
    return Math.hypot(wx - px, wy - py) < semi;
  };

  const ACC = !!opz.accoppiato;
  for (let k = 0; k < 8; k++) {
    if (ACC) avanza(k === 0 ? 3.0 : 0.6); else t.simulate(k === 0 ? 3.0 : 0.6);
    let attese = 0;
    for (let i = 0; i < 60 && !(t.state === 'play' || t.state === 'golden'); i++) { if (ACC) avanza(0.1); else t.simulate(0.1); attese++; }
    if (t.state !== 'play' && t.state !== 'golden') { diario.push({ k, saltato: t.state }); continue; }
    for (let d = 0; d < CATCHUP; d++) t.disegna();
    t.disegna();
    fotogrammi++;
    const img = c2.getImageData(0, 0, cv.width, cv.height).data;
    const W = cv.width, H = cv.height;
    const S2 = t.view.S2, Ax = t.view.Ax, Ay = t.view.Ay;
    const B = t.bande, VWc = W / DPRc, VHc = H / DPRc;
    const pixel = (sx, sy) => {
      const x = Math.round(sx * DPRc), y = Math.round(sy * DPRc);
      if (x < 0 || y < 0 || x >= W || y >= H) return null;
      const o = (y * W + x) * 4;
      return [img[o], img[o + 1], img[o + 2]];
    };
    const inQuadro = (sx, sy) => sx > 2 && sx < VWc - 2 && sy > B.bar + 2 && sy < VHc - B.foot - 2;
    const magliaK = [[], []];
    const chi = [];

    for (const p of t.players) {
      if (p.role === 'gk' || p.out > 0) continue;
      if (p.slide >= 0 || p.recover > 0 || p.dive > 0 || p.celeb > 0) continue;
      chi.push({ idx: p.idx, team: p.team, nome: p.nome, x: +p.x.toFixed(1), y: +p.y.toFixed(1),
                 corp: p.corp, clip: p.poseClip, u: p.poseU != null ? +p.poseU.toFixed(2) : null });
      for (const av of [-12.5, -11.5, -10.5]) {
        for (const la of [-1.5, -1.0, -0.5, 0, 0.5, 1.0, 1.5]) {
          const wx = p.x + la, wy = p.y + av;
          const sx = wx * S2 + Ax, sy = wy * S2 + Ay;
          if (!inQuadro(sx, sy)) continue;
          const c = pixel(sx, sy); if (c) { maglia[p.team].push(c); magliaK[p.team].push(c); }
        }
      }
      for (const r of [30, 34, 38, 42]) {
        for (let ang = 0; ang < 360; ang += 15) {
          const rad = ang * Math.PI / 180;
          const cx = Math.cos(rad), cy = Math.sin(rad);
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
    if (k === 7) window.__ultimo = cv.toDataURL('image/png');
    const mm = a => a.length ? [mediana(a.map(c => c[0])), mediana(a.map(c => c[1])), mediana(a.map(c => c[2]))] : null;
    diario.push({ k, attese, stato: t.state, tempo: +t.timeLeft.toFixed(2), ora: +t.ora.toFixed(3),
                  score: t.score.join('-'), S2: +S2.toFixed(4), Ax: +Ax.toFixed(1), Ay: +Ay.toFixed(1),
                  cam: t.cam ? { x: +t.cam.x.toFixed(1), y: +t.cam.y.toFixed(1), z: t.cam.z != null ? +t.cam.z.toFixed(4) : null } : null,
                  nGioc: chi.length, m0: mm(magliaK[0]), m1: mm(magliaK[1]),
                  fari: t.fari ? t.fari.map(v => +v.toFixed(2)) : null,
                  chi });
  }

  const rappr = a => a.length ? [mediana(a.map(c => c[0])), mediana(a.map(c => c[1])), mediana(a.map(c => c[2]))] : null;
  const esa = c => c ? '#' + c.map(v => v.toString(16).padStart(2, '0')).join('') : '?';
  const squadre = [];
  for (let sq = 0; sq < 2; sq++) {
    const m = rappr(maglia[sq]), e = rappr(erba[sq]);
    let rapporto = null;
    if (m && e) {
      const Lm = lumin(m[0], m[1], m[2]), Le = lumin(e[0], e[1], e[2]);
      rapporto = (Math.max(Lm, Le) + 0.05) / (Math.min(Lm, Le) + 0.05);
    }
    squadre.push({ sq, rapporto: rapporto == null ? null : +rapporto.toFixed(3), maglia: esa(m), erba: esa(e),
                   nMaglia: maglia[sq].length, nErba: erba[sq].length });
  }
  t.setDalt(false);
  return { fotogrammi, squadre, diario, nrand0, nraf0, nrandDopoStart, kickTeam,
           nrandFine: window.__nrand, nrafFine: window.__nraf };
};

(async () => {
  const N = +(process.argv[2] || 6);
  const RISEMINA = process.argv.includes('risemina');
  const CATCHUP = +((process.argv.find(a => a.startsWith('catchup=')) || '').split('=')[1] || 0);
  const srv = await servi();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(seme => {
    let s = seme >>> 0 || 1;
    window.__nrand = 0; window.__nraf = 0;
    window.__risemina = n => { s = (n >>> 0) || 1; };
    const prossimo = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => { window.__nrand++; return prossimo() / 4294967296; };
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = prossimo(); return a; };
    }
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = cb => raf(t => { window.__nraf++; cb(t); });
  }, 20260728);
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.waitForTimeout(400);

  const righe = [];
  for (let i = 0; i < N; i++) {
    /* attese di durata DIVERSA: se la modalita' dipende dal tempo reale
       trascorso (fotogrammi rAF che consumano il generatore), qui si vede */
    await pag.waitForTimeout(i * 97);
    const t0 = Date.now();
    const r = await pag.evaluate(MISURA, { dalt: true, risemina: RISEMINA, catchup: CATCHUP,
      riscaldo: process.argv.includes('riscaldo'), accoppiato: process.argv.includes('accoppiato') });
    r.ms = Date.now() - t0;
    /* il fotogramma CAMPIONATO, non uno scatto successivo: preso dentro
       la misura con toDataURL, cosi' e' esattamente quello letto a pixel */
    const dati = await pag.evaluate(() => window.__ultimo || '');
    if (dati) fs.writeFileSync(path.join(RADICE, `_fot-${process.argv.includes('accoppiato') ? 'acc' : 'salt'}-${i}.png`),
      Buffer.from(dati.split(',')[1], 'base64'));
    righe.push({ i, r });
    console.log(`\n--- corsa ${i} (attesa ${i * 97} ms) -------------------------------`);
    console.log(`  rand prima=${r.nrand0}  dopo startMatch=${r.nrandDopoStart}  fine=${r.nrandFine}  rAF=${r.nraf0}->${r.nrafFine}`);
    console.log(`  fotogrammi=${r.fotogrammi}  kickTeam=${r.kickTeam}`);
    for (const s of r.squadre) console.log(`  P${s.sq + 1}: ${s.rapporto}:1  maglia ${s.maglia} erba ${s.erba}  (${s.nMaglia}/${s.nErba})`);
    for (const d of r.diario) {
      if (d.saltato) { console.log(`    k=${d.k} SALTATO stato=${d.saltato}`); continue; }
      console.log(`    k=${d.k} att=${d.attese} ${d.stato} t=${d.tempo} ora=${d.ora} sc=${d.score} S2=${d.S2} Ax=${d.Ax} Ay=${d.Ay} n=${d.nGioc} m0=${JSON.stringify(d.m0)} m1=${JSON.stringify(d.m1)} fari=${JSON.stringify(d.fari)}`);
    }
  }
  fs.writeFileSync(path.join(RADICE, '_sonda.json'), JSON.stringify(righe, null, 1));
  console.log('\nRIEPILOGO');
  for (const x of righe) console.log(`  ${x.i}: P1=${x.r.squadre[0].rapporto} P2=${x.r.squadre[1].rapporto} fot=${x.r.fotogrammi} kick=${x.r.kickTeam} rand0=${x.r.nrand0} nM=${x.r.squadre[0].nMaglia}/${x.r.squadre[1].nMaglia} ${x.r.ms}ms`);
  await browser.close(); srv.chiudi();
})().catch(e => { console.error('SONDA IN ERRORE:', e); process.exit(1); });
