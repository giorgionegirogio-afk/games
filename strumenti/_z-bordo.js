/* =====================================================================
   _z-bordo.js — DOVE, ESATTAMENTE, TRAPASSA IL BORDO.

   _zz-critica.js dice QUANTI pixel lasciano passare cio' che sta sotto.
   Questo dice DOVE stanno e CON CHE STATO della scena, perche' sullo
   stesso file (md5 identico) quel conteggio e' uscito 1451 in una cartella
   e 16884 in un'altra — cioe' il banco non e' ripetibile e finche' non si
   sa PERCHE' nessuno dei due numeri vale.

   Stampa, per il caso 'zone' con la scossa accesa:
     · i pixel diversi contati per riga (prime e ultime 10) e per colonna
       (prime e ultime 10): un bordo scoperto si vede subito, uno sporco
       sparso no;
     · lo stato che decide la copertura del MONDO nella costruzione non
       toppata: Ax, Ay, S2, sx, sy, il rettangolo delle quattro fasce,
       se fieldTex e' cotta, il colore di fondo, la scena;
     · lo stesso conto ripetuto N volte NELLA STESSA PAGINA, per separare
       il rumore del rasterizzatore dalla variabilita' dello stato.

   uso: node strumenti/_z-bordo.js <cartella> <file.html> [w] [h] [giri]
   ===================================================================== */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');

const DIR = path.resolve(process.argv[2]);
const FILE = process.argv[3];
const VW = +(process.argv[4] || 915), VH = +(process.argv[5] || 412), DPR = 2;
const GIRI = +(process.argv[6] || 3);
const SEME = 20260819;

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
  const FERMO = process.argv.includes('--fermo');
  await pag.evaluate((f) => { window.__fermaCamera = f; }, FERMO);
  console.log(FERMO ? 'camera INCHIODATA fra i due scatti' : 'camera LIBERA fra i due scatti (come _zz-critica.js)');

  console.log(`${FILE}  vista ${VW}x${VH} dpr ${DPR}  (tela ${VW * DPR}x${VH * DPR})  ${GIRI} giri nella STESSA pagina`);

  for (let giro = 1; giro <= GIRI; giro++) {
    const r = await pag.evaluate(() => {
      const D = Duel;
      const cs = () => {
        D.phase = 'zone'; D.resultT = 0; D.poseT = 0;
        D.aimU = 0; D.aimV = 0.5; D.outcome = '';
        D.dito = -1; D.mira = false;
        G.pulse = 20; G.sceneT = 3; G.timeLeft = 60; D.cpuT = 0.5;
        G.shake = 0.30 - 1 / 60; G.shakeDur = 0.30; G.shakeMag = 7.4; G.shakeDX = 0.80; G.shakeDY = 0.60;
      };
      cs(); misuraDuel(); misuraDuel(); misuraDuel();
      duelBg[0].key = ''; duelBg[1].key = '';
      for (let i = 0; i < 4; i++) { cs(); render(); }
      /* LA CAMERA SI INCHIODA, e questa riga e' la scoperta di questa
         passata. updateCamera() sta DENTRO render(): ogni chiamata la
         muove. Nella costruzione NON toppata la striscia del bordo mostra
         il MONDO — l'unica parte del quadro che dipende dalla camera,
         perche' tutto il resto e' la tessitura in cache del duello — e
         quindi fra lo scatto su nero e quello su bianco quella striscia
         CAMBIA anche se e' perfettamente coperta. Il metodo nero-contro-
         bianco lo legge come «trapassa», ed e' un falso positivo: non
         misura la copertura, misura la deriva della camera.
         Con la camera ferma il falso positivo sparisce e resta solo la
         copertura vera. */
      if (window.__fermaCamera) window.updateCamera = function () { };

      /* lo stato che decide la copertura del MONDO, letto con le stesse
         formule di render() (:21963-21982) */
      cs();
      const SC = scossaOff().slice();
      const S2 = SCALE * G.cam.z;
      const th = FIELDS[Math.max(0, Math.min(FIELDS.length - 1, G.fieldIdx | 0))].th;
      const stato = {
        scena: G.scene, frozen: !!G.frozen, moviola: !!G.moviola,
        camz: +G.cam.z.toFixed(5), S2: +S2.toFixed(5),
        Ax: +G.view.Ax.toFixed(3), Ay: +G.view.Ay.toFixed(3),
        sx: +SC[0].toFixed(3), sy: +SC[1].toFixed(3),
        fieldTex: !!(typeof fieldTex !== 'undefined' && fieldTex),
        bg: th.bg, VW, VH, DPR,
      };
      if (stato.fieldTex) {
        const fx = G.view.Ax + SC[0] - PADX * S2, fy = G.view.Ay + SC[1] - PADY * S2;
        stato.fascia = {
          x0: Math.max(0, Math.ceil(fx)), y0: Math.max(0, Math.ceil(fy)),
          x1: Math.min(VW, Math.floor(fx + (FW + PADX * 2) * S2)),
          y1: Math.min(VH, Math.floor(fy + (FH + PADY * 2) * S2)),
        };
      }

      const W = cv.width, H = cv.height;
      const primaC = (col) => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); ctx.restore(); };
      const scatta = () => Uint8Array.from(ctx.getImageData(0, 0, W, H).data);
      cs(); primaC('#000000'); render(); const SN = scatta();
      cs(); primaC('#ffffff'); render(); const SB = scatta();

      const righe = new Int32Array(H), colonne = new Int32Array(W);
      let passa = 0, max = 0;
      for (let i = 0, px = 0; i < SN.length; i += 4, px++) {
        const d = Math.max(Math.abs(SN[i] - SB[i]), Math.abs(SN[i + 1] - SB[i + 1]), Math.abs(SN[i + 2] - SB[i + 2]));
        if (d > 0) { passa++; if (d > max) max = d; righe[(px / W) | 0]++; colonne[px % W]++; }
      }
      const top = (arr, n) => {
        const v = [];
        for (let i = 0; i < arr.length; i++) if (arr[i]) v.push([i, arr[i]]);
        v.sort((a, b) => b[1] - a[1]);
        return v.slice(0, n);
      };
      return { passa, max, stato, righeTop: top(righe, 8), colTop: top(colonne, 8), nRighe: righe.filter(x => x).length, nCol: colonne.filter(x => x).length, W, H };
    });
    console.log(`\n--- giro ${giro} ---  trapassa ${r.passa} px  Δmax ${r.max}`);
    console.log('stato: ' + JSON.stringify(r.stato));
    console.log(`righe toccate ${r.nRighe}/${r.H}   colonne toccate ${r.nCol}/${r.W}`);
    console.log('righe piu' + "'" + ' cariche  (y:conteggio): ' + r.righeTop.map(a => a[0] + ':' + a[1]).join('  '));
    console.log('colonne piu' + "'" + ' cariche (x:conteggio): ' + r.colTop.map(a => a[0] + ':' + a[1]).join('  '));
  }

  await browser.close(); srv.chiudi();
})();
