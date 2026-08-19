/* =====================================================================
   SONDA FOLLA — perche' la tribuna e' diventata muta.

   folla.js e' un CANCELLO: dice rosso o verde e ha il percorso del gioco
   scritto dentro. Questa e' una SONDA: prende il file che le si dice
   (--gioco), rifa' la stessa identica posa di folla.js, e invece di
   giudicare STAMPA le grandezze da cui i due numeri dipendono.

   Serve perche' la bisezione ha dato un colpevole (la toppa del cross) ma
   nessuna riga della toppa nomina la folla: la causa e' indiretta, e senza
   vedere le grandezze si tira a indovinare.

   uso:  node strumenti/_sonda-folla.js --gioco fuori/pre-cross.html
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const GIOCO = arg('gioco', 'CALCETTO-il-gioco.html');

const TIPI = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8',
               '.png':'image/png', '.json':'application/json' };
function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const p = decodeURIComponent(req.url.split('?')[0]);
      const f = path.join(RADICE, p === '/' ? 'index.html' : p);
      if (!f.startsWith(RADICE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        res.writeHead(404); res.end('no'); return; }
      res.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream',
                           'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
function bancoDiProva() {
  const PASSO = 1000 / 60;
  let t = 0, coda = [];
  window.requestAnimationFrame = cb => { coda.push(cb); return coda.length; };
  window.cancelAnimationFrame = () => {};
  try { performance.now = () => t; } catch (e) {}
  window.__banco = { passo(n) { n = Math.max(0, Math.round(+n || 0));
    for (let i = 0; i < n; i++) { const c = coda; coda = []; t += PASSO;
      for (const f of c) { try { f(t); } catch (e) {} } } return t; } };
}

(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 915, height: 412 },
    deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(seme => { let s = seme >>> 0 || 1;
    const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => p() / 4294967296; }, 20260728);
  await pag.addInitScript(bancoDiProva);
  await pag.goto(`http://127.0.0.1:${srv.porta}/${GIOCO}`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 15000 });
  await pag.waitForTimeout(400);
  await pag.evaluate(() => window.__banco.passo(30));

  /* posa identica a folla.js, riga per riga */
  await pag.evaluate(() => {
    window.__test.dismissSplash && window.__test.dismissSplash();
    window.__test.startMatch(1, 1);
    window.__test.Tut && window.__test.Tut.finish && window.__test.Tut.finish(true);
    window.__test.setCpuVsCpu(true);
    window.__test.simulate(4.0);
    window.__test.setTimeLeft(30);
    const G = window.__test.G;
    G.ball.x = FW * 0.42; G.ball.y = FH - 8; G.ball.vx = 0; G.ball.vy = 0; G.ball.z = 0;
    for (const p of G.players) p.y = Math.min(p.y, FH - 14);
  });
  await pag.evaluate(() => window.__test.setPaused(true));
  await pag.evaluate(() => window.__banco.passo(200));
  await pag.evaluate(() => window.__test.setPaused(false));

  /* LA CAMERA INCHIODATA — il controllo decisivo.
     folla.js lascia che la camera si posi dove la porta la partita. Se
     bastasse inchiodarla nello stesso punto perche' i due file diano gli
     stessi numeri, allora il cancello non stava misurando la folla: stava
     misurando DOVE FINISCE LA CAMERA, e qualunque modifica al gioco che
     sposti un giocatore lo fa cadere. */
  const CAM = arg('camera', null);
  if (CAM) {
    const [cx, cy, cz] = CAM.split(',').map(Number);
    await pag.evaluate(([cx, cy, cz]) => {
      const c = window.__test.cam; c.x = cx; c.y = cy; if (cz) c.z = cz;
      window.__test.disegna();
    }, [cx, cy, cz]);
  }
  /* IL CARTELLO SPENTO — la cura da provare. */
  if (process.argv.includes('--senza-cartello')) {
    await pag.evaluate(() => {
      const G = window.__test.G; G.banner = ''; G.bannerT = 0;
      window.__test.disegna();
    });
  }
  /* RITAGLIO DELLA FASCIA — perche' un numero che cambia di sei volte si
     guarda, non si deduce */
  const SALVA = arg('salva', null);

  /* LE GRANDEZZE. Tutto cio' che entra nei due numeri, letto dal vivo. */
  const D = await pag.evaluate(() => {
    const v = window.__test.view, G = window.__test.G;
    const fuori = (typeof CROWD !== 'undefined') ? CROWD : null;
    const S2 = v.S2 || 1, Ax = v.Ax || 0, Ay = v.Ay || 0;
    const wx0 = (-Ax)/S2-14, wx1 = (VW-Ax)/S2+14, wy0 = (-Ay)/S2-14, wy1 = (VH-Ay)/S2+14;
    let inQuadro = 0, disegnati = 0;
    const passo = (typeof CROWD_PASSO !== 'undefined') ? CROWD_PASSO : 1;
    const rado = (typeof CROWD_RADO !== 'undefined') ? CROWD_RADO : null;
    if (fuori) for (let i = 0; i < fuori.length; i += passo) {
      const d = fuori[i];
      if (d.x < wx0 || d.x > wx1 || d.y < wy0 || d.y > wy1) continue;
      inQuadro++;
      if (!(rado && (d.i % 3) === 0)) disegnati++;
    }
    return {
      scena: G.scene, S2, Ax, Ay,
      zBordo: (typeof Z_BORDO !== 'undefined') ? Z_BORDO : null,
      zMuro:  (typeof Z_MURO  !== 'undefined') ? Z_MURO  : null,
      rado, passo,
      crowdLen: fuori ? fuori.length : null,
      crowdLarg: (typeof CROWD_LARG !== 'undefined') ? CROWD_LARG : null,
      inQuadro, disegnati,
      moto: window.__test.SAVE ? window.__test.SAVE.moto : (typeof SAVE !== 'undefined' ? SAVE.moto : null),
      cam: { x: G.cam.x, y: G.cam.y, z: G.cam.z },
      ballx: G.ball.x, bally: G.ball.y,
      FH: FH, FW: FW, VH: VH, VW: VW,
      pulse: G.pulse,
      /* le due finestre, in pixel css */
      yDiff0: Math.max(0, Math.round(Ay + (FH + 70) * S2)),
      yDiff1: Math.min(VH, Math.round(Ay + (FH + 108) * S2)),
      ySag0:  Math.max(0, Math.round(Ay + (FH + 50) * S2)),
      ySag1:  Math.min(VH, Math.round(Ay + (FH + 108) * S2)),
    };
  });

  const pixel = r => pag.evaluate(r => {
    const c = document.getElementById('gioco').getContext('2d');
    return Array.from(c.getImageData(r.x*2, r.y*2, r.w*2, r.h*2).data); }, r);
  const R  = { x:0, y:D.yDiff0, w:915, h:D.yDiff1-D.yDiff0 };
  const RS = { x:0, y:D.ySag0,  w:915, h:D.ySag1 -D.ySag0  };

  /* misura 1: due fotogrammi consecutivi, luci spente */
  await pag.evaluate(() => { window.__test.setTimeLeft(80); window.__test.setPaused(true); window.__test.disegna(); });
  const A = await pixel(R);
  await pag.evaluate(() => { const G=window.__test.G, c=window.__test.cam;
    const s={x:c.x,y:c.y,z:c.z}; G.pulse += 1/60; window.__test.disegna(); c.x=s.x;c.y=s.y;c.z=s.z; });
  const B = await pixel(R);
  await pag.evaluate(() => { window.__test.setPaused(false); window.__test.setTimeLeft(30); window.__test.disegna(); });
  let div = 0;
  for (let i = 0; i < A.length; i += 4)
    if (Math.abs(A[i]-B[i])+Math.abs(A[i+1]-B[i+1])+Math.abs(A[i+2]-B[i+2]) > 6) div++;
  const qDiff = 100*div/(A.length/4);

  /* misura 2: la sagoma allo scoppio */
  const A0 = await pixel(RS);
  await pag.evaluate(() => { window.__test.G.crowdHype = 2.35; window.__test.disegna(); });
  const A1 = await pixel(RS);
  let px0=0, px1=0;
  for (let i = 0; i < A0.length; i += 4) {
    if (A0[i]+A0[i+1]+A0[i+2] > 380) px0++;
    if (A1[i]+A1[i+1]+A1[i+2] > 380) px1++;
  }
  const cresc = px0 ? 100*(px1/px0-1) : 0;

  console.log('\n=== SONDA FOLLA — ' + GIOCO + ' ===');
  console.log(`  scena ${D.scena}   moto ${D.moto}   pulse ${D.pulse.toFixed(3)}`);
  console.log(`  camera  x ${D.cam.x.toFixed(1)}  y ${D.cam.y.toFixed(1)}  z ${(D.cam.z||0).toFixed(3)}`);
  console.log(`  vista   S2 ${D.S2.toFixed(4)}  Ax ${D.Ax.toFixed(1)}  Ay ${D.Ay.toFixed(1)}`);
  console.log(`  zoom    Z_BORDO ${D.zBordo}  Z_MURO ${D.zMuro}  ->  rado ${D.rado}`);
  console.log(`  folla   totale ${D.crowdLen}  passo ${D.passo}  larg ${D.crowdLarg}`);
  console.log(`          in quadro ${D.inQuadro}  effettivamente disegnati ${D.disegnati}`);
  console.log(`  finestre  diff  y ${D.yDiff0}..${D.yDiff1}  (${D.yDiff1-D.yDiff0} px)`);
  console.log(`            sagoma y ${D.ySag0}..${D.ySag1}  (${D.ySag1-D.ySag0} px)`);
  console.log(`  pixel accesi in sagoma: riposo ${px0}   scoppio ${px1}`);
  console.log('  ---');
  console.log(`  DIFF FOTOGRAMMI  ${qDiff.toFixed(2)}%   (minimo 1.00)`);
  console.log(`  CRESCITA SAGOMA  ${cresc.toFixed(1)}%   (minimo 8.0)`);

  if (SALVA) {
    await pag.evaluate(() => { window.__test.G.crowdHype = 0; window.__test.disegna(); });
    await pag.screenshot({ path: SALVA, clip: { x: 0, y: RS.y, width: 915, height: RS.h } });
    console.log(`  ritaglio della fascia salvato in ${SALVA}`);
  }

  await br.close(); srv.chiudi();
})();
