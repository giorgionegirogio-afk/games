/* _sonda-manto2.js — la politica della finestra viva, simulata su una
   traccia VERA di camera, piu' il costo REALE (con flush) della ricottura.
   1. registra 3600 fotogrammi di partita CPU/CPU per taglia: S2, cam, scena;
   2. misura la ricottura finestrata CON getImageData dentro il cronometro;
   3. simula in Node la politica (copertura, banda di zoom, cottura a zoom
      fermo, cooldown, margine predittivo) e conta ricotture e copertura.
   uso: node _sonda-manto2.js [--gioco FILE]                                 */
const path = require('path');
const { chromium } = require('playwright');
const { servi, bancoDiProva, semeFisso } = require(path.resolve(__dirname, 'strumenti/_posa.js'));

const arg = (n, d) => { const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i+1] && !process.argv[i+1].startsWith('--') ? process.argv[i+1] : d; };
const GIOCO = arg('gioco', 'CALCETTO-il-gioco.html');

(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport:{width:915,height:412}, deviceScaleFactor:2,
    isMobile:true, hasTouch:true, locale:'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(semeFisso, 20260819);
  await pag.addInitScript(bancoDiProva);
  await pag.goto(`http://127.0.0.1:${srv.porta}/${GIOCO}`, { waitUntil:'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout:15000 });
  await pag.waitForTimeout(400);

  for (const taglia of [5, 7, 11]) {
    await pag.evaluate(() => window.__banco.passo(30));
    await pag.evaluate((N) => {
      window.__test.dismissSplash && window.__test.dismissSplash();
      window.__test.startMatch(1, 1, { size: N });
      window.__test.Tut && window.__test.Tut.finish && window.__test.Tut.finish(true);
      window.__test.setCpuVsCpu(true);
      window.__test.simulate(3);
      window.__test.setTimeLeft(89);
    }, taglia);

    const st = await pag.evaluate(() => ({
      FW, FH, PADX, PADY, VW, VH, DPR, fieldTexTS, SCALE,
    }));

    /* 1. la traccia completa */
    const tr = await pag.evaluate(() => {
      const T = [];
      for (let i = 0; i < 3600; i++) {
        window.__banco.passo(1);
        T.push([G.view.S2||0, G.cam.x, G.cam.y, G.scene==='play'||G.scene==='golden' ? 1 : 0]);
      }
      return T;
    });

    /* 2. il costo vero della ricottura finestrata, CON flush nel cronometro */
    const costo = await pag.evaluate(() => {
      const TH = FIELDS[G.fieldIdx].th;
      const S2 = Math.max(G.view.S2||0, 1.15);           // zoom tipico di gioco
      const vw = VW/S2, vh = VH/S2, mx = vw*0.22, my = vh*0.22;
      const x0 = G.cam.x - vw/2 - mx, y0 = G.cam.y - vh/2 - my;
      const w = vw + 2*mx, h = vh + 2*my;
      const t2 = S2*DPR;
      const cv = document.createElement('canvas');
      cv.width = Math.ceil(w*t2); cv.height = Math.ceil(h*t2);
      const c2 = cv.getContext('2d', { willReadFrequently: false });
      const t = [];
      for (let k = 0; k < 5; k++) {
        const salva = INSEGNE_LIVE.slice();
        const t0 = Date.now();
        c2.setTransform(t2,0,0,t2,-x0*t2,-y0*t2);
        c2.save(); c2.beginPath(); c2.rect(x0,y0,w,h); c2.clip();
        paintField(c2, TH, PADX, PADY, 1, true);
        c2.restore();
        c2.getImageData(0, 0, 2, 2);                     // il flush sta DENTRO il cronometro
        t.push(Date.now() - t0);
        c2.setTransform(1,0,0,1,0,0);
        INSEGNE_LIVE.length = 0; for (const v of salva) INSEGNE_LIVE.push(v);
      }
      t.sort((a,b)=>a-b);
      /* e il costo del disegno della finestra a schermo, nearest 1:1 */
      const dst = document.createElement('canvas');
      dst.width = Math.round(VW*DPR); dst.height = Math.round(VH*DPR);
      const d = dst.getContext('2d');
      d.imageSmoothingEnabled = false;
      const N = 30; const d0 = Date.now();
      for (let k = 0; k < N; k++) d.drawImage(cv, -((k%3)), -((k%2)));  // offset vario: niente cache furba
      d.getImageData(0,0,1,1);
      const blit = (Date.now()-d0)/N;
      dst.width = 1; cv.width = 1;
      return { finestra: cv.width, px: Math.ceil(w*t2)+'x'+Math.ceil(h*t2),
               ms: t, mediana: t[2], blitNearest: +blit.toFixed(2) };
    });

    console.log(`\n=== TAGLIA ${taglia} ===  fieldTexTS ${st.fieldTexTS.toFixed(3)}  ricottura finestrata ${JSON.stringify(costo.ms)} ms (mediana ${costo.mediana}, ${costo.px})  blit nearest ${costo.blitNearest} ms`);

    /* 3. la simulazione della politica sulla traccia vera */
    const { FW, FH, PADX, PADY, VW, VH, DPR, fieldTexTS } = st;
    for (const [MARG, BANDA, COOL, PRED] of [
      [0.22, 0.05, 24, 0], [0.22, 0.05, 24, 10], [0.30, 0.05, 24, 12],
      [0.22, 0.08, 36, 10], [0.30, 0.08, 36, 12], [0.30, 0.10, 48, 14]]) {
      let R = null, ric = 0, vivi = 0, gioco = 0, S2p = 0, eta = -999;
      let popFermi = 0;   // transizioni stantio->vivo con camera quasi ferma
      let stalePrec = true;
      for (let i = 0; i < tr.length; i++) {
        const [S2, cx, cy, inPlay] = tr[i];
        if (!inPlay || !(S2 > 0) || S2*DPR <= fieldTexTS*1.22) { S2p = S2; stalePrec = true; continue; }
        gioco++;
        const vw = VW/S2, vh = VH/S2;
        const vx0 = cx - vw/2, vy0 = cy - vh/2;
        const copre = R && vx0 >= R.x0 && vy0 >= R.y0 && vx0+vw <= R.x1 && vy0+vh <= R.y1;
        const rap = copre ? S2*DPR/R.ts : 0;
        let vivo = copre && rap >= 1-BANDA && rap <= 1.055;
        if (!vivo) {
          const fermo = S2p > 0 && Math.abs(S2-S2p)/S2 <= 0.006;
          if (fermo && i-eta >= COOL) {
            /* margine predittivo: il centro si sposta nel verso del moto */
            const j = Math.max(0, i-1);
            const velx = cx - tr[j][1], vely = cy - tr[j][2];
            const mx = vw*MARG, my = vh*MARG;
            const ox = Math.max(-mx*0.6, Math.min(mx*0.6, velx*PRED));
            const oy = Math.max(-my*0.6, Math.min(my*0.6, vely*PRED));
            let x0 = Math.max(-PADX, vx0-mx+ox), y0 = Math.max(-PADY, vy0-my+oy);
            let x1 = Math.min(FW+PADX, vx0+vw+mx+ox), y1 = Math.min(FH+PADY, vy0+vh+my+oy);
            if (vx0 >= x0 && vy0 >= y0 && vx0+vw <= x1 && vy0+vh <= y1 &&
                (x1-x0)*(y1-y0)*S2*DPR*S2*DPR <= 4.6e6) {
              R = { x0, y0, x1, y1, ts: S2*DPR }; ric++; eta = i; vivo = true;
            }
          }
        }
        if (vivo) {
          vivi++;
          if (stalePrec) {
            const j = Math.max(0, i-1);
            const vel = Math.hypot(cx-tr[j][1], cy-tr[j][2]) * S2 * DPR;
            if (vel < 1.0) popFermi++;
          }
        }
        stalePrec = !vivo;
        S2p = S2;
      }
      console.log(`  marg ${MARG} banda ${BANDA} cool ${COOL} pred ${PRED}: ` +
        `ricotture ${ric} (${(ric/60).toFixed(2)}/s), vive ${vivi}/${gioco} (${(100*vivi/gioco).toFixed(1)}%), ` +
        `pop da fermo ${popFermi}, costo medio ~${(ric*costo.mediana/60/60).toFixed(2)} ms/fotogramma`);
    }
  }
  await br.close(); srv.chiudi();
})().catch(e => { console.error('FALLITO:', e); process.exit(1); });
