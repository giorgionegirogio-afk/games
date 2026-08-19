/* critica.js — la combinazione che _sonda-duello.js non prova mai:
   push-in == 1 (fasi 'zone', e 'power'/'wait' a poseT=0) CON la scossa attiva. */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');

const DIR = path.resolve(process.argv[2]);
const FILE = process.argv[3];
const VW = +(process.argv[4] || 915), VH = +(process.argv[5] || 412), DPR = 2;
const SEME = 20260819;

const CASI = [
  { id: 'zone  SENZA scossa', phase: 'zone', poseT: 0.0, rt: 0, scossa: false },
  { id: 'zone  CON scossa', phase: 'zone', poseT: 0.0, rt: 0, scossa: true },
  { id: 'power poseT=0 CON scossa', phase: 'power', poseT: 0.0, rt: 0, scossa: true },
  { id: 'power poseT=.45 CON scossa', phase: 'power', poseT: 0.45, rt: 0, scossa: true },
  { id: 'wait  poseT=0 CON scossa', phase: 'wait', poseT: 0.0, rt: 0, scossa: true },
  { id: 'result rt=0 CON scossa', phase: 'result', poseT: 0.9, rt: 0.0, scossa: true },
];

function servi(radice) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(radice, decodeURIComponent(req.url.split('?')[0]));
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('no'); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

(async () => {
  const srv = await servi(DIR);
  const browser = await chromium.launch();
  const ctxb = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: DPR });
  await ctxb.addInitScript((seme) => {
    let s = seme >>> 0;
    Math.random = function () {
      s = (s + 0x6D2B79F5) >>> 0; let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }, SEME);
  const pag = await ctxb.newPage();
  await pag.goto(`http://127.0.0.1:${srv.porta}/${FILE}`, { waitUntil: 'load' });
  await pag.waitForFunction(() => window.__test && window.__test.state, null, { timeout: 30000 });
  await pag.evaluate(() => window.__test.rigori());
  await pag.waitForFunction(() => typeof Duel !== 'undefined' && Duel.phase !== 'off', null, { timeout: 30000 });
  await pag.waitForTimeout(400);
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(200);

  console.log(`${FILE}  vista ${VW}x${VH} dpr ${DPR}  (tela ${VW * DPR}x${VH * DPR})`);
  console.log('caso                            push      trapassa (nero vs bianco)');
  console.log('-'.repeat(78));
  for (const c of CASI) {
    const r = await pag.evaluate((c) => {
      const D = Duel;
      const cs = () => {
        D.phase = c.phase; D.resultT = c.rt; D.poseT = c.poseT;
        D.aimU = 0; D.aimV = 0.5; D.outcome = c.phase === 'result' ? 'gol' : '';
        D.dito = -1; D.mira = false;
        G.pulse = 20; G.sceneT = 3; G.timeLeft = 60; D.cpuT = 0.5;
        // scossa come la produce un FALLO vero: scossa(7.4,0.30,dx,dy), un
        // fotogramma dopo l'urto (tt=DT), che e' quando l'ampiezza e' massima
        if (c.scossa) { G.shake = 0.30 - 1 / 60; G.shakeDur = 0.30; G.shakeMag = 7.4; G.shakeDX = 0.80; G.shakeDY = 0.60; }
        else { G.shake = 0; }
      };
      cs(); misuraDuel(); misuraDuel(); misuraDuel();
      duelBg[0].key = ''; duelBg[1].key = '';
      for (let i = 0; i < 4; i++) { cs(); render(); }

      // quanto vale davvero il push-in e lo scarto della scossa in questo caso
      cs();
      const SC = scossaOff().slice();
      let push = 1;
      if (SAVE.moto) {
        if (D.phase === 'power' || D.phase === 'wait') push = 1 + 0.035 * Math.min(1, Math.max(0, (D.poseT || 0) / 0.90));
        else if (D.phase === 'result') push = 1 + 0.035 + 0.075 * Math.min(1, Math.max(0, D.resultT / 0.30)) - 0.085 * Math.min(1, Math.max(0, (D.resultT - 0.80) / 0.70));
      }

      const W = cv.width, H = cv.height;
      const primaC = (col) => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); ctx.restore(); };
      const scatta = () => Uint8Array.from(ctx.getImageData(0, 0, W, H).data);
      cs(); primaC('#000000'); render(); const SN = scatta();
      cs(); primaC('#ffffff'); render(); const SB = scatta();
      let passa = 0, max = 0, x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1;
      for (let i = 0, px = 0; i < SN.length; i += 4, px++) {
        const d = Math.max(Math.abs(SN[i] - SB[i]), Math.abs(SN[i + 1] - SB[i + 1]), Math.abs(SN[i + 2] - SB[i + 2]));
        if (d > 0) {
          passa++; if (d > max) max = d;
          const x = px % W, y = (px / W) | 0;
          if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
      }
      return { passa, max, x0, x1, y0, y1, SC, push, moto: SAVE.moto };
    }, c);
    const dove = r.passa ? `x${r.x0}-${r.x1} y${r.y0}-${r.y1} Δ${r.max}` : '';
    console.log(c.id.padEnd(32) + r.push.toFixed(4).padEnd(10) +
      String(r.passa).padStart(8) + ' px  ' + dove +
      `   [SC ${r.SC[0].toFixed(2)},${r.SC[1].toFixed(2)}]`);
  }
  await browser.close(); srv.chiudi();
})();
