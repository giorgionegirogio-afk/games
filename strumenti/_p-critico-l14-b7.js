/* =====================================================================
   _p-critico-l14-b7.js — il censimento B del cancello _q-l14.js, SOLO
   taglia 7, eseguito DUE volte sullo stesso file: serve a distinguere
   «la toppa cambia le partite CPU contro CPU» da «il censimento a
   taglia 7 non e' ripetibile». Stessa pagina, stesso seme (20260820),
   stessa aritmetica del cancello, copiata parola per parola.

   uso: node strumenti/_p-critico-l14-b7.js --gioco <file> [--giri 2]
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'CALCETTO-il-gioco.html')));
const GIRI = +arg('giri', 2);
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };

function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (/CALCETTO-il-gioco\.html$/i.test(f)) f = GIOCO;
      if ((!f.startsWith(RADICE) && f !== GIOCO) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        res.writeHead(404); res.end('no'); return;
      }
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
  window.__banco = { passo(n) {
    n = Math.max(0, Math.round(+n || 0));
    for (let i = 0; i < n; i++) { const c = coda; coda = []; t += PASSO;
      for (const f of c) { try { f(t); } catch (e) {} } }
    return t;
  } };
}
const n1 = v => (v === null || v === undefined || !isFinite(v)) ? 'n/d' : (Math.round(v * 10) / 10).toString().replace('.', ',');

(async () => {
  const srv = await servi();
  const br = await chromium.launch({ headless: true });
  const ctx = await br.newContext({ viewport: { width: 915, height: 412 },
    deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });

  console.log('=== censimento B, SOLO taglia 7, ' + GIRI + ' giri sullo stesso file ===');
  console.log('  gioco: ' + GIOCO);
  for (let giro = 1; giro <= GIRI; giro++) {
    const pag = await ctx.newPage();
    await pag.addInitScript(s0 => {
      let s = s0 >>> 0 || 1;
      const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
      Math.random = () => p() / 4294967296;
    }, 20260820);
    await pag.addInitScript(bancoDiProva);
    await pag.goto('http://127.0.0.1:' + srv.porta + '/CALCETTO-il-gioco.html', { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(() => window.__banco.passo(6));
    const dati = await pag.evaluate(async (tg) => {
      const t = window.__test, G = t.G;
      try { t.dismissSplash && t.dismissSplash(); } catch (e) {}
      t.setPaused && t.setPaused(false);
      try { if (t.Tut && t.Tut.active && t.Tut.finish) t.Tut.finish(true); } catch (e) {}
      t.startMatch(1, 1, { size: tg });
      for (let i = 0; i < 80 && G.scene !== 'play'; i++) t.simulate(0.1);
      if (G.scene !== 'play') return { errore: 'scena ' + G.scene };
      t.setCpuVsCpu(true);
      const gaps = [];
      let sUsciti = -1, scenaUscita = '';
      for (let s = 0; s < 170; s++) {
        t.simulate(0.5);
        if (!(G.scene === 'play' || G.scene === 'golden')) { sUsciti = s; scenaUscita = G.scene; break; }
        const oi = G.ball.owner;
        if (oi < 0) continue;
        const p = G.players[oi];
        for (let k = 0; k < 12; k++) {
          const a = k * Math.PI / 6, ux = Math.cos(a), uy = Math.sin(a);
          let s1 = -1e9, s2 = -1e9, n = 0;
          for (const q of G.players) {
            if (q.team !== p.team || q === p || q.out > 0 || q.role === 'gk') continue;
            n++;
            let sc = 0;
            for (const o of G.players) {
              if (o.team === p.team || o.out > 0) continue;
              sc += Math.max(0, Math.min(220, Math.hypot(o.x - q.x, o.y - q.y)));
              const ax = q.x - p.x, ay = q.y - p.y, al = Math.max(1, Math.hypot(ax, ay));
              const px = o.x - p.x, py = o.y - p.y;
              const t2 = Math.max(0, Math.min(1, (px * ax + py * ay) / (al * al)));
              const dL = Math.hypot(px - ax * t2, py - ay * t2);
              if (dL < 40 && t2 > 0.1 && t2 < 0.95) sc -= 260;
            }
            sc += (p.team === 0 ? q.x - p.x : p.x - q.x) * 0.9;
            const d = Math.hypot(q.x - p.x, q.y - p.y);
            sc -= Math.abs(d - 170) * 0.4;
            const dx = q.x - p.x, dy = q.y - p.y, l = Math.max(1, Math.hypot(dx, dy));
            sc += 220 * ((dx * ux + dy * uy) / l) * 1;
            if (sc > s1) { s2 = s1; s1 = sc; } else if (sc > s2) s2 = sc;
          }
          if (n >= 2) gaps.push(s1 - s2);
        }
      }
      return { gaps, sUsciti, scenaUscita, punteggio: G.score ? G.score.join('-') : 'n/d' };
    }, 7);
    await pag.close();
    if (dati.errore) { console.log('  giro ' + giro + ': ' + dati.errore); continue; }
    const g = dati.gaps.slice().sort((a, b) => a - b);
    const med = g.length ? g[Math.floor(g.length / 2)] : NaN;
    const entro20 = g.length ? g.filter(v => v < 20).length / g.length * 100 : NaN;
    console.log('  giro ' + giro + ':  campioni ' + g.length +
      '  mediana ' + n1(med) + '  entro 20: ' + n1(entro20) + '%' +
      '  uscita dal ciclo: ' + (dati.sUsciti < 0 ? 'mai (170 passi)' : 'al passo ' + dati.sUsciti + " (scena '" + dati.scenaUscita + "')") +
      '  punteggio ' + dati.punteggio);
  }
  await br.close(); srv.chiudi();
  process.exit(0);
})().catch(e => { console.error('CADUTO: ' + (e && e.stack || e)); process.exit(2); });
