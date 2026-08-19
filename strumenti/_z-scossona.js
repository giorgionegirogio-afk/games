/* _z-scossona.js — LO STESSO CONTROLLO DI _zz-critica.js, MA CON LA SCOSSA
   PIU' GROSSA CHE IL GIOCO SA PRODURRE, e con la camera inchiodata.
   Il fallo scuote con mag 7,4 e lo scarto massimo e' ~6 px css; ma scossa()
   viene chiamata anche con mag 14 (l'impatto), e una toppa che copre 6 px e
   non 17 non e' una toppa, e' una coincidenza. Qui si spazza mag da 7,4 a
   20 nella fase 'zone', dove il push-in vale 1 e non aiuta. */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');

const DIR = path.resolve(process.argv[2]);
const FILE = process.argv[3];
const VW = +(process.argv[4] || 915), VH = +(process.argv[5] || 412), DPR = 2;
const SEME = 20260819;

/* LE QUATTRO DIREZIONI, e perche' ce ne sono quattro invece di una.
   La stesura scorsa inchiodava shakeDX=0.80 e shakeDY=0.60 — tutti e due
   POSITIVI — e lasciava che il segno arrivasse solo dalla fase del seno.
   Il risultato e' che SC finiva sempre sulla diagonale (+,+) o (-,-): le
   bande da riempire erano sempre due opposte, e il caso A SEGNI MISTI —
   banda sinistra e banda inferiore insieme, cioe' l'angolo — non veniva
   MAI eseguito. Era corretto per costruzione, si poteva leggere nel
   codice; ma «dedotto» e' esattamente cio' che questo deposito ha gia'
   bocciato una volta in questa stessa regione, e con lo stesso movente.
   Adesso i quattro quadranti si eseguono, e in fondo il file DICHIARA
   quali ha visto davvero — letti da scossaOff(), non dai parametri. */
const DIREZIONI = [
  { s: '(+,+)', dx: 0.80, dy: 0.60 },
  { s: '(-,+)', dx: -0.80, dy: 0.60 },
  { s: '(+,-)', dx: 0.80, dy: -0.60 },
  { s: '(-,-)', dx: -0.80, dy: -0.60 },
];
const CASI = [];
for (const d of DIREZIONI)
  for (const mag of [7.4, 10, 14, 20])
    for (const tt of [1/60, 2/60, 3/60, 5/60])
      CASI.push({ id: `zone ${d.s} mag ${mag} t+${(tt*60)|0}f`, phase: 'zone', poseT: 0, rt: 0, scossa: true, mag, tt, dx: d.dx, dy: d.dy });
CASI.push({ id: 'zone SENZA scossa', phase: 'zone', poseT: 0, rt: 0, scossa: false, mag: 0, tt: 0, dx: 0.80, dy: 0.60 });

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
  console.log('caso                                 push      trapassa (nero vs bianco)');
  console.log('-'.repeat(86));
  /* i quadranti di SC visti DAVVERO, letti da scossaOff() a ogni caso */
  const quadranti = new Map();
  let peggiore = 0, casiRotti = 0, scMax = 0;
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
        if (c.scossa) { G.shake = 0.30 - c.tt; G.shakeDur = 0.30; G.shakeMag = c.mag; G.shakeDX = c.dx; G.shakeDY = c.dy; }
        else { G.shake = 0; }
      };
      cs(); misuraDuel(); misuraDuel(); misuraDuel();
      duelBg[0].key = ''; duelBg[1].key = '';
      G.renderDT = 1/60;
      for (let i = 0; i < 40; i++) { cs(); G.renderDT = 1/60; render(); }
      window.updateCamera = function () { };   // la camera si inchioda: vedi _z-bordo.js

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
    console.log(c.id.padEnd(37) + r.push.toFixed(4).padEnd(10) +
      String(r.passa).padStart(8) + ' px  ' + dove +
      `   [SC ${r.SC[0].toFixed(2)},${r.SC[1].toFixed(2)}]`);
    const sgn = v => v > 0 ? '+' : (v < 0 ? '-' : '0');
    const q = `(${sgn(r.SC[0])},${sgn(r.SC[1])})`;
    quadranti.set(q, (quadranti.get(q) || 0) + 1);
    if (r.passa) { casiRotti++; if (r.passa > peggiore) peggiore = r.passa; }
    scMax = Math.max(scMax, Math.abs(r.SC[0]), Math.abs(r.SC[1]));
  }
  /* IL RIEPILOGO CHE DICE COSA E' STATO ESEGUITO, non cosa si sperava.
     Senza questa riga «tutte e quattro le bande» era un'affermazione del
     rapporto e non un esito dello strumento: si poteva scriverla con la
     spazzata inchiodata su un quadrante solo, ed e' quello che era
     successo. Qui i quadranti sono contati da scossaOff(), cioe' dallo
     spostamento vero applicato alla tela. */
  console.log('\nQUADRANTI DI SC ESEGUITI (contati da scossaOff(), non dai parametri):');
  for (const [q, n] of [...quadranti].sort()) console.log(`   ${q}  ${n} casi`);
  const misti = [...quadranti.keys()].filter(q => q === '(-,+)' || q === '(+,-)').reduce((a, q) => a + quadranti.get(q), 0);
  console.log(`   a segni misti (angolo: una banda orizzontale e una verticale adiacenti): ${misti} casi`);
  if (!misti) console.log('   ATTENZIONE: nessun caso a segni misti eseguito. La spazzata non prova gli angoli.');
  console.log(`\nscarto massimo raggiunto: ${scMax.toFixed(2)} px css   ·   casi che trapassano: ${casiRotti}/${CASI.length}` +
    (casiRotti ? `   peggiore ${peggiore} px` : ''));
  await browser.close(); srv.chiudi();
  process.exit(casiRotti ? 1 : 0);
})();
