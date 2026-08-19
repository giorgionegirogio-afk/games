/* =====================================================================
   _z-simmetria.js — SOLA MISURA. La simmetria bilaterale della sagoma,
   sul DISEGNO VERO e non su un'approssimazione.

   PERCHE'. Una figura eretta e' bilateralmente simmetrica; un corpo in
   volo non lo e'. La simmetria e' l'unica proprieta' della sagoma che
   sopravvive a QUALUNQUE imbardata — il ribaltamento z -> -z la
   specchia e basta — e non dipende dalla scala. Se un tuffo misura piu'
   simmetria di un uomo in piedi, e' disegnato come un uomo in piedi, e
   nessuna giuria potra' nominarlo.

   COME. Si chiama Rig3D.disegna su una tela fuori schermo, alla stessa
   altezza in pixel di periferica che la clip ha in campo, con la divisa
   vera del portiere; si prende la maschera dei pixel con alfa > 24 (la
   stessa soglia di _z-verbo.inchiostro); si specchia attorno all'ascissa
   del baricentro della maschera e si misura l'IoU fra la maschera e il
   suo specchio. Nessuna capsula, nessuna semplificazione: e' la figura
   che finisce sullo schermo.

   L'ASSE DELLO SPECCHIO E' IL BARICENTRO, non il punto a terra: una
   figura simmetrica ma spostata di lato deve risultare simmetrica.

   uso:
     node strumenti/_z-simmetria.js --gioco fuori/dopo.html
     node strumenti/_z-simmetria.js --gioco a.html --contro b.html
     ... --clip tuffo --u0 0.08 --u1 0.58
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
function arg(n, d) {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
}
const CLIP = arg('clip', 'tuffo');
const U0 = +arg('u0', 0.08), U1 = +arg('u1', 0.58);
const HDEV = +arg('hdev', 92.7);
/* l'istogramma vero delle imbardate di `tuffo`, misurato da _z-verbo su
   4.276 fotogrammi in dieci partite (bidoni da 15 gradi, in gradi:peso) */
const ISTO = [[0, 138], [15, 285], [30, 78], [60, 59], [75, 5], [90, 145], [105, 39], [120, 63],
  [165, 223], [180, 1780], [195, 279], [210, 72], [240, 55], [255, 25], [270, 125],
  [285, 45], [300, 70], [315, 48], [330, 96], [345, 126]];

function servi(mappa) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const nome = decodeURIComponent(req.url.split('?')[0]);
      const f = mappa[nome] || path.join(RADICE, nome);
      if ((!f.startsWith(RADICE) && !Object.values(mappa).includes(f)) ||
        !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

const SONDA = `(clip, isto, u0, u1, HDEV, clipRif) => {
  const L = 320;
  const cv = document.createElement('canvas'); cv.width = L; cv.height = L;
  const g = cv.getContext('2d', { willReadFrequently: true });
  const gk = G.players.find(p => p.role === 'gk');
  const look = gk ? rigLook(gk) : Rig3D.lookPredefinito;

  function simm(nome, u, yawGradi) {
    g.setTransform(1,0,0,1,0,0); g.clearRect(0,0,L,L);
    Rig3D.disegna(g, L/2, L*0.74, HDEV, yawGradi*Math.PI/180, 'alto', nome,
                  u/Rig3D.CLIPS[nome].freq, look, true, 1, 0);
    const d = g.getImageData(0,0,L,L).data;
    const m = new Uint8Array(L*L);
    let sx = 0, n = 0;
    for (let y=0;y<L;y++) for (let x=0;x<L;x++) {
      if (d[(y*L+x)*4+3] > 24) { m[y*L+x]=1; sx+=x; n++; }
    }
    if (!n) return null;
    const cx = Math.round(sx/n);
    let i=0, u2=0;
    for (let y=0;y<L;y++) for (let x=0;x<L;x++) {
      const xs = 2*cx-x; if (xs<0||xs>=L) continue;
      const a=m[y*L+x], b=m[y*L+xs];
      if (a|b) { u2++; if (a&b) i++; }
    }
    return { s: u2 ? i/u2 : 1, px: n };
  }

  const fasi = []; for (let k=0;k<=10;k++) fasi.push(u0 + (u1-u0)*k/10);
  function pesata(nome, a, b) {
    const ff = []; for (let k=0;k<=10;k++) ff.push(a + (b-a)*k/10);
    let som=0, tot=0, npx=0, nn=0;
    for (const [gr, w] of isto) {
      let s=0, c=0;
      for (const u of ff) { const r = simm(nome, u, gr); if (r) { s+=r.s; npx+=r.px; nn++; c++; } }
      if (c) { som += w*s/c; tot += w; }
    }
    return { simm: tot?som/tot:NaN, pxMed: nn?npx/nn:0 };
  }

  const out = { principale: pesata(clip, u0, u1), rif: {} };
  for (const c of clipRif) out.rif[c] = pesata(c, 0.05, 0.95);
  return out;
}`;

async function misura(browser, porta, nome) {
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(() => {
    let s = 20260818 >>> 0;
    const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => p() / 4294967296;
  });
  await pag.goto(`http://127.0.0.1:${porta}/${nome}`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 30000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(200);
  await pag.evaluate(() => {
    const t = window.__test;
    t.dismissSplash && t.dismissSplash();
    if (t.save) t.save.tutorialDone = 1;
    t.startMatch(1, 1); t.setCpuVsCpu(true);
    for (let i = 0; i < 30; i++) t.simulate(1 / 60);
    t.disegna();
  });
  await pag.evaluate(s => { window.__sim = eval(s); }, SONDA);
  const RIF = ['cielo', 'fermo', 'parata', 'corsa', 'attesaGK', 'scivolata', 'presa', 'tiro'];
  const r = await pag.evaluate(([c, i, a, b, h, rr]) => window.__sim(c, i, a, b, h, rr),
    [CLIP, ISTO, U0, U1, HDEV, RIF]);
  await ctx.close();
  return r;
}

(async () => {
  const G1 = arg('gioco', ''), G2 = arg('contro', '');
  if (!G1) { console.error('FALLITO: manca --gioco'); process.exit(1); }
  const mappa = { '/A.html': path.resolve(G1) };
  if (G2) mappa['/B.html'] = path.resolve(G2);
  for (const f of Object.values(mappa)) if (!fs.existsSync(f)) { console.error('FALLITO: inesistente ' + f); process.exit(1); }

  const srv = await servi(mappa);
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  try {
    const A = await misura(browser, srv.porta, 'A.html');
    const B = G2 ? await misura(browser, srv.porta, 'B.html') : null;
    const f = (x, d) => (isFinite(x) ? x.toFixed(d === undefined ? 3 : d) : '  -');
    console.log('\n=====================================================================');
    console.log(' _z-simmetria — sagoma VERA (Rig3D.disegna, alfa>24), figura a ' + HDEV + ' px');
    console.log(' clip in esame: ' + CLIP + '   fasi u ' + U0 + '-' + U1 + '   imbardate pesate');
    console.log(' sull\'istogramma misurato in campo (4.276 fotogrammi, bidoni da 15 gradi)');
    console.log(' A = ' + path.basename(G1) + (G2 ? '   B = ' + path.basename(G2) : ''));
    console.log('=====================================================================');
    console.log('\n   ' + CLIP.padEnd(12) + '  A ' + f(A.principale.simm) + (B ? '   B ' + f(B.principale.simm) : '') +
      '   (pixel dipinti in media ' + Math.round(A.principale.pxMed) + ')');
    console.log('\n   i riferimenti, alle stesse imbardate pesate, dal file A:');
    for (const c of Object.keys(A.rif))
      console.log('     ' + c.padEnd(12) + f(A.rif[c].simm) + (B ? '     (B ' + f(B.rif[c].simm) + ')' : ''));
    if (B) {
      const d = B.principale.simm - A.principale.simm;
      console.log('\n   variazione su ' + CLIP + ': ' + (d >= 0 ? '+' : '') + f(d) +
        '  (' + (d >= 0 ? '+' : '') + f(d / A.principale.simm * 100, 1) + '%)');
      let peggio = 0, chi = '';
      for (const c of Object.keys(A.rif)) { const q = Math.abs(B.rif[c].simm - A.rif[c].simm); if (q > peggio) { peggio = q; chi = c; } }
      console.log('   controllo: la clip di riferimento che si e\' mossa di piu\' e\' ' + chi +
        ', di ' + f(peggio) + ' — dev\'essere ~0, sono clip che la toppa non tocca.');
    }
    console.log('');
  } finally { await browser.close(); srv.chiudi(); }
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
