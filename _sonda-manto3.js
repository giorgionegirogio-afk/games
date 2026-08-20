/* _sonda-manto3.js — i costi CON FLUSH e lo zoom della posa standard.
   1. buildFieldTex com'e' oggi, flushato;
   2. l'atlante di gioco: campo±72 a 1,108*DPR px/unita', intero e a strisce;
   3. lo zoom S2 alla posa standard (posaFerma) alle tre taglie, e le
      costanti della forbice (Z_MURO, Z_BORDO, Z_FIG40);
   4. blit a schermo: atlante nearest ~1:1 contro fieldTex nearest ~1.6x.
   uso: node _sonda-manto3.js [--gioco FILE]                                 */
const path = require('path');
const { chromium } = require('playwright');
const { servi, bancoDiProva, semeFisso, posaFerma } = require(path.resolve(__dirname, 'strumenti/_posa.js'));

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
    await posaFerma(pag, { taglia });
    const posa = await pag.evaluate(() => ({
      S2: +(G.view.S2||0).toFixed(4), DPR, fieldTexTS: +fieldTexTS.toFixed(4),
      Z_MURO: +Z_MURO.toFixed(4), Z_BORDO: +Z_BORDO.toFixed(4), Z_FIG40: +Z_FIG40.toFixed(4),
      S2_MIN_DEV, S2_MAX_DEV, scena: G.scene,
      rapportoOggi: +(((G.view.S2||0)*DPR)/fieldTexTS).toFixed(3),
    }));
    console.log(`\n=== TAGLIA ${taglia} ===`);
    console.log('posa standard:', JSON.stringify(posa));

    const costi = await pag.evaluate(() => {
      const out = {};
      const TH = FIELDS[G.fieldIdx].th;
      const flushOf = (c) => c.getImageData(0, 0, 2, 2);
      /* 1. buildFieldTex flushato (2 giri, minimo) */
      {
        const t = [];
        for (let k = 0; k < 2; k++) {
          const salva = INSEGNE_LIVE.slice();
          const t0 = Date.now(); buildFieldTex(); flushOf(fieldTex.getContext('2d'));
          t.push(Date.now() - t0);
          INSEGNE_LIVE.length = 0; for (const v of salva) INSEGNE_LIVE.push(v);
        }
        out.buildOggiFlush = Math.min(...t);
      }
      /* 2. l'atlante di gioco: campo±72, TS = 1.108*DPR */
      const M = 72, TS = 1.108 * DPR;
      const w = FW + M*2, h = FH + M*2;
      out.atlantePx = Math.ceil(w*TS) + 'x' + Math.ceil(h*TS) +
        ' (' + (w*TS*h*TS/1e6).toFixed(1) + ' Mpx, ' + (w*TS*h*TS*4/1048576).toFixed(0) + ' MB)';
      const cv = document.createElement('canvas');
      cv.width = Math.ceil(w*TS); cv.height = Math.ceil(h*TS);
      const c = cv.getContext('2d');
      /* intero */
      {
        const salva = INSEGNE_LIVE.slice();
        const t0 = Date.now();
        c.setTransform(TS,0,0,TS, M*TS, M*TS);
        c.save(); c.beginPath(); c.rect(-M,-M,w,h); c.clip();
        const mr = Math.random; let sm = 0x2f6e2b1|0;
        Math.random = function(){ sm=(sm+0x6D2B79F5)|0; let t=Math.imul(sm^(sm>>>15),1|sm);
          t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; };
        try { paintField(c, TH, PADX, PADY, 1, true); } finally { Math.random = mr; }
        c.restore(); flushOf(c);
        out.atlanteInteroMs = Date.now() - t0;
        c.setTransform(1,0,0,1,0,0);
        INSEGNE_LIVE.length = 0; for (const v of salva) INSEGNE_LIVE.push(v);
      }
      /* a strisce: 16 verticali, tempo per striscia (prime 4, poi stima) */
      {
        const NST = 16, t = [];
        for (let s = 0; s < 4; s++) {
          const salva = INSEGNE_LIVE.slice();
          const sx0 = -M + w*s/NST, sx1 = -M + w*(s+1)/NST;
          const t0 = Date.now();
          c.setTransform(TS,0,0,TS, M*TS, M*TS);
          c.save(); c.beginPath(); c.rect(sx0,-M, sx1-sx0, h); c.clip();
          const mr = Math.random; let sm = 0x2f6e2b1|0;
          Math.random = function(){ sm=(sm+0x6D2B79F5)|0; let q=Math.imul(sm^(sm>>>15),1|sm);
            q=(q+Math.imul(q^(q>>>7),61|q))^q; return ((q^(q>>>14))>>>0)/4294967296; };
          try { paintField(c, TH, PADX, PADY, 1, true); } finally { Math.random = mr; }
          c.restore(); flushOf(c);
          t.push(Date.now() - t0);
          c.setTransform(1,0,0,1,0,0);
          INSEGNE_LIVE.length = 0; for (const v of salva) INSEGNE_LIVE.push(v);
        }
        out.strisce4di16 = t;
      }
      /* 4. blit a schermo: atlante ~1:1 contro fieldTex di oggi */
      {
        const dst = document.createElement('canvas');
        dst.width = Math.round(VW*DPR); dst.height = Math.round(VH*DPR);
        const d = dst.getContext('2d');
        d.imageSmoothingEnabled = false;
        const S2 = G.view.S2 || 1.15;
        const mis = (src, sw, sh) => {
          const N = 30; const t0 = Date.now();
          for (let k = 0; k < N; k++)
            d.drawImage(src, (k%5), (k%3), sw, sh, 0, 0, dst.width, dst.height);
          d.getImageData(0,0,1,1);
          return +((Date.now()-t0)/N).toFixed(2);
        };
        /* la porzione di sorgente che il quadro inquadra davvero */
        out.blitAtlante = mis(cv, dst.width/(S2*DPR)*TS, dst.height/(S2*DPR)*TS);
        out.blitOggi   = mis(fieldTex, dst.width/(S2*DPR)*fieldTexTS, dst.height/(S2*DPR)*fieldTexTS);
        dst.width = 1;
      }
      cv.width = 1;
      return out;
    });
    console.log('costi:', JSON.stringify(costi));
  }
  await br.close(); srv.chiudi();
})().catch(e => { console.error('FALLITO:', e); process.exit(1); });
