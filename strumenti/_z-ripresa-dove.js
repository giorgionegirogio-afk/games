/* =====================================================================
   _z-ripresa-dove.js — SE IL FONDALE E' OPACO, CHI LASCIA PASSARE?

   Domanda secca. Dopo il sigillo dell'orizzonte la tessitura di duelFondo
   e' OPACA (0 texel sotto 255, misurato), e drawRipresaGol la stende su
   (0,0,VW,VH) senza traslazione: il fondale, da solo, dovrebbe coprire
   ogni pixel. Eppure la ripresa del gol lascia ancora passare qualche
   migliaio di pixel anche contando SOLO i pixel deterministici. Delle due
   l'una: o il fondale non copre la tela quanto si crede, o e' qualcuno che
   disegna DOPO.

   Questo file separa le due cose. Sulla stessa pagina e sullo stesso
   stato:
     A) solo il fondale — setTransform(DPR) e una drawImage, niente altro;
     B) il fotogramma intero della ripresa.
   Se A copre e B no, il colpevole sta a valle del fondale, e si stampa
   dove.

   uso: node strumenti/_z-ripresa-dove.js <cartella> <file.html> [w] [h]
   ===================================================================== */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const DIR = path.resolve(process.argv[2]), FILE = process.argv[3];
const VWa = +(process.argv[4] || 915), VHa = +(process.argv[5] || 412), DPRa = 2;

function servi(r) {
  return new Promise(ok => {
    const s = http.createServer((q, res) => {
      const f = path.join(r, decodeURIComponent(q.url.split('?')[0]));
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
(async () => {
  const srv = await servi(DIR);
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: VWa, height: VHa }, deviceScaleFactor: DPRa });
  await c.addInitScript(() => {
    let s = 20260819 >>> 0;
    Math.random = function () { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  });
  const p = await c.newPage();
  await p.goto(`http://127.0.0.1:${srv.porta}/${FILE}`, { waitUntil: 'load' });
  await p.waitForFunction(() => window.__test && window.__test.state, null, { timeout: 30000 });
  await p.evaluate(() => window.__test.start ? window.__test.start() : window.__test.rigori());
  await p.waitForTimeout(600);
  await p.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await p.waitForTimeout(200);

  const r = await p.evaluate(() => {
    Duel.phase = 'off';
    G.goalTeam = 0; G.goalIdx = G.players.findIndex(q => q.team === 0 && q.role !== 'gk');
    G.goalSpot = { x: 300, y: 200 };
    avviaRipresa();
    const set = () => { G.scene = 'goal'; G.ripresa.t = 0.9; G.pulse = 20; G.sceneT = 3; G.timeLeft = 60; G.shake = 0; Duel.phase = 'off'; };
    set(); duelBg[0].key = ''; duelBg[1].key = '';
    for (let i = 0; i < 24; i++) { set(); render(); }
    window.updateCamera = function () { };
    for (let i = 0; i < 3; i++) { set(); render(); }

    const W = cv.width, H = cv.height;
    const prm = (col) => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); ctx.restore(); };
    const sh = () => Uint8Array.from(ctx.getImageData(0, 0, W, H).data);

    const R = G.ripresa, g = ripresaGeo();
    const soloFondale = () => {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(duelFondo(g, R.ax, R.ay), 0, 0, VW, VH);
    };
    const conta = (X, Y) => {
      const rr = new Int32Array(H), cc = new Int32Array(W);
      let n = 0, mx = 0;
      for (let i = 0, px = 0; i < X.length; i += 4, px++) {
        const d = Math.max(Math.abs(X[i] - Y[i]), Math.abs(X[i + 1] - Y[i + 1]), Math.abs(X[i + 2] - Y[i + 2]));
        if (d > 0) { n++; if (d > mx) mx = d; rr[(px / W) | 0]++; cc[px % W]++; }
      }
      const t = (a) => { const v = []; for (let i = 0; i < a.length; i++) if (a[i]) v.push([i, a[i]]); v.sort((x, y) => y[1] - x[1]); return v.slice(0, 8).map(z => z[0] + ':' + z[1]); };
      return { n, mx, righe: t(rr), col: t(cc) };
    };

    /* A) solo il fondale */
    set(); prm('#000000'); soloFondale(); const FA = sh();
    set(); prm('#ffffff'); soloFondale(); const FB = sh();
    const soloF = conta(FA, FB);

    /* B) il fotogramma intero */
    set(); prm('#000000'); render(); const A = sh();
    set(); prm('#ffffff'); render(); const B = sh();
    const pieno = conta(A, B);

    /* quale casella del fondale usa la ripresa, e quanto e' grande */
    const iBg = (R.ax === undefined || R.ax >= 0) ? 0 : 1;
    const T = duelBg[iBg].tex;
    let sotto = 0, minA = 255;
    if (T) { const dd = T.getContext('2d').getImageData(0, 0, T.width, T.height).data; for (let i = 3; i < dd.length; i += 4) if (dd[i] < 255) { sotto++; if (dd[i] < minA) minA = dd[i]; } }

    /* l'ALFA della tela finita: se dopo il fotogramma restano pixel con
       alfa<255, quei pixel al giro dopo si compongono sopra il fotogramma
       precedente — cioe' il fotogramma precedente TRASPARE. Il contesto e'
       creato senza {alpha:false}, quindi la tela l'alfa ce l'ha. */
    set(); render();
    const fin = ctx.getImageData(0, 0, W, H).data;
    let aSotto = 0, aMin = 255; const aRig = new Int32Array(H), aCol = new Int32Array(W);
    for (let i = 3, px = 0; i < fin.length; i += 4, px++) {
      if (fin[i] < 255) { aSotto++; if (fin[i] < aMin) aMin = fin[i]; aRig[(px / W) | 0]++; aCol[px % W]++; }
    }
    const tp = (a) => { const v = []; for (let i = 0; i < a.length; i++) if (a[i]) v.push([i, a[i]]); v.sort((x, y) => y[1] - x[1]); return v.slice(0, 8).map(z => z[0] + ':' + z[1]); };

    return {
      alfaTela: { sotto: aSotto, min: aSotto ? aMin : 255, righe: tp(aRig), col: tp(aCol) },
      soloF, pieno, W, H, VW, VH, DPR, iBg, ax: R.ax,
      tex: T ? (T.width + 'x' + T.height) : 'niente', texSotto: sotto, texMin: sotto ? minA : 255,
    };
  });
  console.log(`${FILE}   tela ${r.W}x${r.H}   VW/VH ${r.VW}x${r.VH}   DPR ${r.DPR}`);
  console.log(`fondale usato: duelBg[${r.iBg}] (R.ax=${r.ax})  tessitura ${r.tex}  texel alfa<255: ${r.texSotto}${r.texSotto ? ' (min ' + r.texMin + ')' : ''}`);
  console.log(`A) SOLO IL FONDALE      trapassa ${r.soloF.n} px  Δmax ${r.soloF.mx}`);
  if (r.soloF.n) { console.log('   righe ' + r.soloF.righe.join('  ')); console.log('   colonne ' + r.soloF.col.join('  ')); }
  console.log(`B) FOTOGRAMMA INTERO    trapassa ${r.pieno.n} px  Δmax ${r.pieno.mx}`);
  if (r.pieno.n) { console.log('   righe ' + r.pieno.righe.join('  ')); console.log('   colonne ' + r.pieno.col.join('  ')); }
  console.log(`ALFA DELLA TELA FINITA: ${r.alfaTela.sotto} px con alfa<255` + (r.alfaTela.sotto ? `, minima ${r.alfaTela.min}/255` : '  — la tela e\' opaca'));
  if (r.alfaTela.sotto) { console.log('   righe ' + r.alfaTela.righe.join('  ')); console.log('   colonne ' + r.alfaTela.col.join('  ')); }
  await b.close(); srv.chiudi();
})();
