/* _z-primer.js — IL PRIMER TRAPELA DAVVERO, O E' SOLO LA SCENA CHE SI MUOVE?
   Sequenza N N B B N N B B: un processo a periodo 2 finisce in tutti e due i
   gruppi e si autoesclude. Un pixel conta come TRAPASSO solo se i quattro
   scatti su nero sono identici fra loro, i quattro su bianco sono identici
   fra loro, e i due gruppi differiscono.
   uso: node _z-primer.js <cartella> <file.html> [w] [h] [scena]   scena=gol|duello */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const DIR = path.resolve(process.argv[2]), FILE = process.argv[3];
const VW = +(process.argv[4] || 915), VH = +(process.argv[5] || 412), DPR = 2;
const SCENA = process.argv[6] || 'gol';

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
  const c = await b.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: DPR });
  await c.addInitScript(() => {
    let s = 20260819 >>> 0;
    Math.random = function () { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  });
  const p = await c.newPage();
  await p.goto(`http://127.0.0.1:${srv.porta}/${FILE}`, { waitUntil: 'load' });
  await p.waitForFunction(() => window.__test && window.__test.state, null, { timeout: 30000 });
  await p.evaluate(() => window.__test.rigori());
  await p.waitForTimeout(600);
  await p.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await p.waitForTimeout(200);

  const r = await p.evaluate((SCENA) => {
    let set;
    if (SCENA === 'gol') {
      Duel.phase = 'off';
      G.goalTeam = 0; G.goalIdx = G.players.findIndex(q => q.team === 0 && q.role !== 'gk');
      G.goalSpot = { x: 300, y: 200 };
      avviaRipresa();
      set = () => { G.scene = 'goal'; G.ripresa.t = 0.9; G.pulse = 20; G.sceneT = 3; G.timeLeft = 60; G.shake = 0; G.renderDT = 1 / 60; Duel.phase = 'off'; };
    } else {
      set = () => {
        const D = Duel;
        D.phase = 'zone'; D.resultT = 0; D.poseT = 0; D.aimU = 0; D.aimV = 0.5; D.outcome = '';
        D.dito = -1; D.mira = false;
        G.pulse = 20; G.sceneT = 3; G.timeLeft = 60; D.cpuT = 0.5; G.renderDT = 1 / 60;
        G.shake = 0.30 - 1 / 60; G.shakeDur = 0.30; G.shakeMag = 7.4; G.shakeDX = 0.80; G.shakeDY = 0.60;
      };
      misuraDuel(); misuraDuel(); misuraDuel();
    }
    set();
    duelBg[0].key = ''; duelBg[1].key = '';
    for (let i = 0; i < 24; i++) { set(); render(); }
    window.updateCamera = function () { };
    for (let i = 0; i < 3; i++) { set(); render(); }

    const W = cv.width, H = cv.height;
    const prm = (col) => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); ctx.restore(); };
    const sh = (col) => { set(); prm(col); render(); return Uint8Array.from(ctx.getImageData(0, 0, W, H).data); };

    /* N N B B N N B B */
    const S = [sh('#000000'), sh('#000000'), sh('#ffffff'), sh('#ffffff'),
               sh('#000000'), sh('#000000'), sh('#ffffff'), sh('#ffffff')];
    const N = [0, 1, 4, 5], B = [2, 3, 6, 7];

    let leak = 0, mxLeak = 0, instabN = 0, instabB = 0, stabili = 0;
    const righe = new Int32Array(H), colonne = new Int32Array(W);
    for (let i = 0, px = 0; i < S[0].length; i += 4, px++) {
      let okN = true, okB = true;
      for (const k of N.slice(1)) if (S[k][i] !== S[0][i] || S[k][i + 1] !== S[0][i + 1] || S[k][i + 2] !== S[0][i + 2]) { okN = false; break; }
      for (const k of B.slice(1)) if (S[k][i] !== S[2][i] || S[k][i + 1] !== S[2][i + 1] || S[k][i + 2] !== S[2][i + 2]) { okB = false; break; }
      if (!okN) instabN++;
      if (!okB) instabB++;
      if (okN && okB) {
        stabili++;
        const d = Math.max(Math.abs(S[0][i] - S[2][i]), Math.abs(S[0][i + 1] - S[2][i + 1]), Math.abs(S[0][i + 2] - S[2][i + 2]));
        if (d > 0) { leak++; if (d > mxLeak) mxLeak = d; righe[(px / W) | 0]++; colonne[px % W]++; }
      }
    }
    /* e l'alfa della tela finita */
    let alfaSotto = 0;
    { const dd = ctx.getImageData(0, 0, W, H).data; for (let i = 3; i < dd.length; i += 4) if (dd[i] < 255) alfaSotto++; }
    const rr = []; for (let i = 0; i < H; i++) if (righe[i]) rr.push(i + ':' + righe[i]);
    const cc = []; for (let i = 0; i < W; i++) if (colonne[i]) cc.push([i, colonne[i]]);
    cc.sort((a, b2) => b2[1] - a[1]);
    return { W, H, leak, mxLeak, instabN, instabB, stabili, alfaSotto, nRighe: rr.length, righe: rr.slice(0, 14), nCol: cc.length, colTop: cc.slice(0, 10).map(a => a[0] + ':' + a[1]) };
  }, SCENA);

  console.log(`${FILE}  scena ${SCENA}  tela ${r.W}x${r.H} = ${r.W * r.H} px`);
  console.log(`  instabili fra i 4 scatti su nero: ${r.instabN}   su bianco: ${r.instabB}   stabili in tutti e due: ${r.stabili}`);
  console.log(`  TRAPASSO VERO (stabile e dipendente dal primer): ${r.leak} px  Δmax ${r.mxLeak}`);
  console.log(`  pixel con alfa<255 sulla tela finita: ${r.alfaSotto}`);
  if (r.leak) {
    console.log(`  righe toccate ${r.nRighe}/${r.H}: ` + r.righe.join('  '));
    console.log(`  colonne toccate ${r.nCol}/${r.W}: ` + r.colTop.join('  '));
  }
  await b.close(); srv.chiudi();
})();
