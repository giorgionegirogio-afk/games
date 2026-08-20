/* _x-l23-difesa.js — SONDA AVVERSARIA: cosa fa una chiamata viva quando
   il pallone si libera.

   Il ramo nuovo di aiDecide sta SOPRA due rami che il gioco protegge a
   mano quando accende il suo meccanismo gemello (la corsa in area):
     · il punto di chiamata di attaccaArea e' guardato da
       «ruoloDi(p)!=='pressa'» — chi deve andare sul pallone non si
       distrae;
     · dentro attaccaArea la prima riga utile e'
       «if(ruoloDi(p)==='ultimo') return false;» — l'ultimo uomo non sale.
   Il ramo della chiamata non ha ne' l'una ne' l'altra guardia, e la
   chiamata muore solo se il pallone finisce IN PIEDI all'avversario: un
   pallone LIBERO la lascia viva.

   D1 · pallone libero nella nostra meta', chiamata addosso all'uomo piu'
        vicino al pallone, nel verso opposto.
   D2 · pallone libero che rotola verso la nostra porta, chiamata «vai
        avanti» addosso all'uomo piu' arretrato.

   OGNI BRACCIO SU UNA PAGINA NUOVA. Con una pagina sola lo stato del
   cervello di squadra sopravvive fra un braccio e l'altro e i numeri
   ballano: misurato, mi e' successo.

   uso: node _x-l23-difesa.js --gioco fuori/l23.html
*/
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = 'C:/Users/Utenteee/Desktop/GitHub/games';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'fuori/l23.html')));
const TAGLIA = +arg('taglia', 5);
const SEME = +arg('seme', 20260820);
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.json': 'application/json' };

function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (/CALCETTO-il-gioco\.html$/i.test(f)) f = GIOCO;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('no'); return; }
      res.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
function semeFisso(s0) {
  let s = s0 >>> 0 || 1;
  const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
  Math.random = () => p() / 4294967296;
  window.__seme = v => { s = (v >>> 0) || 1; };
}
function attrezzi() {
  window.__X = {
    avvia(tg) {
      const t = window.__test, G = t.G;
      try { t.dismissSplash && t.dismissSplash(); } catch (e) {}
      try { t.setPaused(false); } catch (e) {}
      try { if (t.Tut && t.Tut.active && t.Tut.finish) t.Tut.finish(true); } catch (e) {}
      for (let g = 0; g < 3 && (G.scene !== 'play' || t.taglia !== tg); g++) {
        if (G.scene !== 'play' || t.taglia !== tg) t.startMatch(1, 1, { size: tg });
        for (let i = 0; i < 200 && G.scene !== 'play'; i++) t.simulate(0.1);
      }
      window.__K = { kx: t.campo.FW / 1150, ky: t.campo.FH / 560 };
      return { scene: G.scene, taglia: t.taglia, FW: t.campo.FW, FH: t.campo.FH, sa: typeof window.chiamaGiocatore === 'function' };
    },
    P(x, y) { return [x * window.__K.kx, y * window.__K.ky]; },
    posa(cfg) {
      const t = window.__test, G = t.G;
      t.setTimeLeft(80);
      t.setCpuVsCpu(true);
      const P = G.players, noi = [], loro = [];
      for (let i = 0; i < P.length; i++) {
        const p = P[i];
        p.vx = p.vy = p.ax = p.ay = p.pvx = p.pvy = 0;
        p.slide = -1; p.recover = 0; p.rove = -1; p.out = 0;
        p.fiato = 100; p.kickCd = 0; p.kickT = 0; p.kickB = 0; p.celeb = 0;
        p.aiT = 0; p.sprint = false;
        try { chiudiAnticipo(p); } catch (e) {}
        if (p.corsaArea !== undefined) p.corsaArea = 0;
        if (p.chiamata !== undefined) p.chiamata = 0;
        if (p.role === 'gk') { p.x = p.team === 0 ? 40 : t.campo.FW - 40; p.y = t.campo.FH / 2; continue; }
        (p.team === 0 ? noi : loro).push(i);
      }
      for (let k = 0; k < noi.length; k++) { const q = cfg.noi[k]; P[noi[k]].x = q[0]; P[noi[k]].y = q[1]; P[noi[k]].fx = 1; P[noi[k]].fy = 0; }
      for (let k = 0; k < loro.length; k++) { const q = cfg.loro[k]; P[loro[k]].x = q[0]; P[loro[k]].y = q[1]; P[loro[k]].fx = -1; P[loro[k]].fy = 0; }
      const b = G.ball;
      b.owner = -1; b.vx = cfg.bv ? cfg.bv[0] : 0; b.vy = cfg.bv ? cfg.bv[1] : 0; b.vz = 0; b.z = 0;
      b.curve = 0; b.perfectT = 0; b.passTo = -1; b.crossTo = -1; b.tiroT = -1;
      b.x = cfg.ball[0]; b.y = cfg.ball[1];
      try { G.brain[0].t = 0; G.brain[0].ruoloT = 0; G.brain[1].t = 0; G.brain[1].ruoloT = 0; } catch (e) {}
      return { noi, loro };
    },
  };
}
const n2 = v => (v === null || v === undefined || !isFinite(v)) ? 'n/d' : (Math.round(v * 100) / 100).toString().replace('.', ',');

(async () => {
  const srv = await servi();
  const br = await chromium.launch({ headless: true });
  async function apri() {
    const ctx = await br.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
    const pag = await ctx.newPage();
    await pag.addInitScript(semeFisso, SEME);
    await pag.addInitScript(attrezzi);
    await pag.goto('http://127.0.0.1:' + srv.porta + '/CALCETTO-il-gioco.html', { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 60000 });
    const av = await pag.evaluate(t => window.__X.avvia(t), TAGLIA);
    return { ctx, pag, av };
  }

  /* ---------------- D1 ---------------- */
  async function d1(chiama) {
    const { ctx, pag } = await apri();
    const r = await pag.evaluate(cfg => {
      const X = window.__X, t = window.__test, G = t.G;
      window.__seme(cfg.seme);
      const s = X.posa({
        ball: X.P(470, 280),
        noi: [X.P(400, 300), X.P(300, 120), X.P(300, 440), X.P(200, 280)],
        loro: [X.P(670, 280), X.P(760, 140), X.P(760, 420), X.P(880, 280)],
      });
      const b = G.ball;
      let vi = -1, vd = 1e9;
      for (const i of s.noi) { const d = Math.hypot(G.players[i].x - b.x, G.players[i].y - b.y); if (d < vd) { vd = d; vi = i; } }
      let li = -1, ld = 1e9;
      for (const i of s.loro) { const d = Math.hypot(G.players[i].x - b.x, G.players[i].y - b.y); if (d < ld) { ld = d; li = i; } }
      if (cfg.chiama) { if (typeof window.chiamaGiocatore !== 'function') return { senzaMotore: true }; chiamaGiocatore(G.players[vi], -1, 0); }
      let f0 = -1, sq = -1, minNoi = 1e9, minAltri = 1e9, minAltriPrima = 1e9;
      for (let f = 0; f < 480; f++) {
        t.simulate(1 / 60);
        for (const i of s.noi) {
          const d = Math.hypot(G.players[i].x - b.x, G.players[i].y - b.y);
          minNoi = Math.min(minNoi, d);
          if (i !== vi) { minAltri = Math.min(minAltri, d); if (f0 < 0) minAltriPrima = Math.min(minAltriPrima, d); }
        }
        if (f0 < 0 && b.owner >= 0) { f0 = f + 1; sq = G.players[b.owner].team; }
      }
      return { vi, vd, li, ld, t0: f0 > 0 ? f0 / 60 : null, sq, minNoi, minAltri, minAltriPrima };
    }, { chiama, seme: SEME });
    await ctx.close();
    return r;
  }
  const a1 = await d1(false), b1 = await d1(true);
  console.log('gioco: ' + GIOCO);
  console.log('');
  console.log('D1) PALLONE LIBERO nella nostra meta\'. Il nostro uomo piu\' vicino sta a ' + n2(a1.vd) + ' unita\', il loro a ' + n2(a1.ld) + '.');
  const chi = r => r.t0 === null ? 'nessuno in 8,00 s' : (r.sq === 0 ? 'NOI' : 'LORO') + ' a ' + n2(r.t0) + ' s';
  console.log('   SENZA chiamata:  primo possesso ' + chi(a1) + '  ·  min nostra ' + n2(a1.minNoi) + '  ·  min degli ALTRI (escluso quell uomo) prima del possesso ' + n2(a1.minAltriPrima));
  if (b1.senzaMotore) console.log('   CON la chiamata: n/d — chiamaGiocatore non esiste');
  else console.log('   CON la chiamata (verso opposto al pallone, su quello stesso uomo): primo possesso ' + chi(b1) + '  ·  min nostra ' + n2(b1.minNoi) + '  ·  min degli ALTRI prima del possesso ' + n2(b1.minAltriPrima));
  console.log('');

  /* ---------------- D2 ---------------- */
  async function d2(chiama) {
    const { ctx, pag } = await apri();
    const r = await pag.evaluate(cfg => {
      const X = window.__X, t = window.__test, G = t.G;
      window.__seme(cfg.seme);
      const s = X.posa({
        ball: X.P(560, 280), bv: [-140, 0],
        noi: [X.P(620, 200), X.P(620, 360), X.P(760, 280), X.P(300, 280)],
        loro: [X.P(600, 240), X.P(620, 330), X.P(700, 180), X.P(720, 400)],
      });
      let ui = -1, ux = 1e9;
      for (const i of s.noi) if (G.players[i].x < ux) { ux = G.players[i].x; ui = i; }
      if (cfg.chiama) { if (typeof window.chiamaGiocatore !== 'function') return { senzaMotore: true }; chiamaGiocatore(G.players[ui], 1, 0); }
      const x0 = G.players[ui].x;
      let maxAvanti = 0, bxMin = 1e9, tiri0 = null;
      for (let f = 0; f < 240; f++) {
        t.simulate(1 / 60);
        maxAvanti = Math.max(maxAvanti, G.players[ui].x - x0);
        bxMin = Math.min(bxMin, G.ball.x);
      }
      return { ui, x0, xF: G.players[ui].x, maxAvanti, bxMin, gol: G.score ? G.score.slice() : null };
    }, { chiama, seme: SEME });
    await ctx.close();
    return r;
  }
  const a2 = await d2(false), b2 = await d2(true);
  console.log('D2) L\'ULTIMO UOMO. Pallone libero che rotola verso la nostra porta, loro in quattro davanti.');
  console.log('   SENZA chiamata:  l\'ultimo uomo sale al massimo di ' + n2(a2.maxAvanti) + ' unita\' (parte da x ' + n2(a2.x0) + ', finisce a ' + n2(a2.xF) + ') · il pallone arriva a x ' + n2(a2.bxMin));
  if (b2.senzaMotore) console.log('   CON la chiamata: n/d');
  else console.log('   CON la chiamata «vai avanti»: sale al massimo di ' + n2(b2.maxAvanti) + ' unita\' (parte da x ' + n2(b2.x0) + ', finisce a ' + n2(b2.xF) + ') · il pallone arriva a x ' + n2(b2.bxMin));
  console.log('');
  await br.close(); srv.chiudi();
})().catch(e => { console.error('ESPLOSO: ' + (e && e.stack || e)); process.exit(2); });
