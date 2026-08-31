/* =====================================================================
   _crit9-vetri.js — LA SOGLIA DI 66 PX SU VETRI CHE NON SONO 915x412.

   TRASCINA_SU = 66 e R_ANNULLA = 96 sono px CSS FISSI. I dischi no: si
   posano dove lo schermo li mette. Il banco dell'agente ha misurato UN
   vetro solo (915x412). Il telefono di casa (OnePlus 6, 2280x1080 a
   dpr 3) e' 760x360 px CSS, cioe' 52 px piu' basso.

   Per ogni vetro si stampa: dove sta il disco TIRA di ognuna delle due
   squadre, quanto spazio ha SOPRA di se' prima del bordo, e se un
   trascinamento di 66 px (soglia) e di 94 px (poco sotto R_ANNULLA)
   resta dentro il vetro. Poi si prova davvero il gesto e si misura la
   quota del pallone.

   uso: node strumenti/_crit9-vetri.js --gioco fuori/cmd-seconda.html
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
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'fuori', 'cmd-seconda.html')));
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
               '.png': 'image/png', '.json': 'application/json' };

const VETRI = [
  { w: 915, h: 412, dpr: 2, nome: 'il vetro del banco (quello che l\'agente ha provato)' },
  { w: 760, h: 360, dpr: 3, nome: 'OnePlus 6 — 2280x1080 dpr3, IL TELEFONO DI CASA' },
  { w: 667, h: 375, dpr: 2, nome: 'iPhone SE/8 sdraiato' },
  { w: 640, h: 360, dpr: 3, nome: 'HD sdraiato, il piu\' piccolo comune' },
  { w: 1024, h: 600, dpr: 2, nome: 'tavoletta' },
];

function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (/CALCETTO-il-gioco\.html$/i.test(f)) f = GIOCO;
      if ((!f.startsWith(RADICE) && f !== GIOCO) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        res.writeHead(404); res.end('no'); return;
      }
      res.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
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
    for (let i = 0; i < n; i++) { const c = coda; coda = []; t += PASSO; for (const f of c) { try { f(t); } catch (e) {} } }
    return t;
  } };
}
const dito = {
  giu:  (cdp, pts) => cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts }),
  muovi:(cdp, pts) => cdp.send('Input.dispatchTouchEvent', { type: 'touchMove',  touchPoints: pts }),
  su:   (cdp, pts) => cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd',   touchPoints: pts || [] }),
  sicuro: async cdp => { try { await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); } catch (e) {} },
};

function scena(cfg) {
  const t = window.__test, G = t.G;
  try { t.dismissSplash && t.dismissSplash(); } catch (e) {}
  t.setPaused && t.setPaused(false);
  try { if (t.Tut && t.Tut.active && t.Tut.finish) t.Tut.finish(true); } catch (e) {}
  for (let giro = 0; giro < 3 && G.scene !== 'play'; giro++) {
    for (let i = 0; i < 300 && G.scene !== 'play'; i++) t.simulate(0.1);
    if (G.scene !== 'play') { t.startMatch(cfg.modo || 1, 1, { size: 5 }); for (let i = 0; i < 120 && G.scene !== 'play'; i++) t.simulate(0.1); }
  }
  if (G.scene !== 'play') return { errore: "scena '" + G.scene + "'" };
  t.setTimeLeft && t.setTimeLeft(80);
  const SQ = cfg.squadra || 0;
  const pi = G.ctrl[SQ];
  if (pi < 0) return { errore: 'nessun comandato per la squadra ' + SQ };
  const p = G.players[pi], C = t.campo;
  if (p.charge !== undefined && p.charge >= 0) { p.charge = -1; p.chargeKind = 'tiro'; p.chargeT = 0; p.chargeGo = null; p.chargeClip = null; }
  p.slide = -1; p.recover = 0; p.kickCd = 0;
  for (const q of G.players) { q.vx = 0; q.vy = 0; if (q.chiamata !== undefined) q.chiamata = 0; }
  p.x = C.FW * (SQ === 0 ? 0.74 : 0.26); p.y = C.FH * 0.5;
  const b = G.ball;
  b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0; b.curve = 0; b.passTo = -1; b.crossTo = -1;
  b.owner = pi; b.x = p.x + (SQ === 0 ? 8 : -8); b.y = p.y;
  for (let i = 0; i < G.players.length; i++) {
    const q = G.players[i];
    if (i === pi || q.out > 0) continue;
    const d = Math.hypot(q.x - b.x, q.y - b.y);
    if (d < 390 && q.role !== 'gk') {
      const l = Math.max(1, d);
      q.x = Math.max(24, Math.min(C.FW - 24, b.x + (q.x - b.x) / l * 400));
      q.y = Math.max(20, Math.min(C.FH - 20, b.y + (q.y - b.y) / l * 400));
    }
    q.vx = 0; q.vy = 0; q.aiT = 30; q.aiTX = q.x; q.aiTY = q.y;
  }
  const bt = t.pulsanti(SQ);
  const D = bt.filter(x => x.act === 'shot')[0] || null;
  if (!D) return { errore: 'nessun disco shot per la squadra ' + SQ + ' (atti: ' + bt.map(x => x.act).join(',') + ')' };
  const sotto = document.elementFromPoint(D.x, D.y);
  return { pi, D: { x: D.x, y: D.y, r: D.r },
           W: window.innerWidth, H: window.innerHeight,
           sotto: sotto ? (sotto.tagName + '#' + sotto.id) : 'niente',
           dischi: bt.map(x => x.act + '@' + Math.round(x.x) + ',' + Math.round(x.y) + ' r' + Math.round(x.r)).join(' · ') };
}

const n1 = v => (v === null || v === undefined || !isFinite(v)) ? 'n/d' : (Math.round(v * 10) / 10).toString().replace('.', ',');

(async () => {
  const srv = await servi();
  const br = await chromium.launch({ headless: true });
  console.log('=== LA SOGLIA DI 66 PX SU CINQUE VETRI ===');
  console.log('  gioco: ' + GIOCO);
  console.log('');
  let male = 0;
  for (const V of VETRI) {
    const ctx = await br.newContext({ viewport: { width: V.w, height: V.h },
      deviceScaleFactor: V.dpr, isMobile: true, hasTouch: true, locale: 'it-IT' });
    for (const SQ of [0, 1]) {
      const pag = await ctx.newPage();
      const ecc = [];
      pag.on('pageerror', e => ecc.push(e.message));
      await pag.addInitScript(s0 => {
        let s = s0 >>> 0 || 1;
        const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
        Math.random = () => p() / 4294967296;
      }, 20260991);
      await pag.addInitScript(bancoDiProva);
      await pag.goto('http://127.0.0.1:' + srv.porta + '/CALCETTO-il-gioco.html', { waitUntil: 'load' });
      await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
      await pag.evaluate(() => window.__banco.passo(6));
      const cdp = await ctx.newCDPSession(pag);
      const passo = n => pag.evaluate(k => window.__banco.passo(k), n);
      const q = await pag.evaluate(scena, { squadra: SQ, modo: SQ === 1 ? 2 : 1 });
      if (q.errore) { console.log('  ' + V.w + 'x' + V.h + ' sq' + SQ + '  ERRORE ' + q.errore); await pag.close(); male++; continue; }
      const spazio = q.D.y;                    // px liberi sopra il centro del disco
      /* il gesto vero: 76 px in su */
      await dito.giu(cdp, [{ x: q.D.x, y: q.D.y, id: 2 }]);
      for (let i = 0; i < 30; i++) await passo(1);
      for (let i = 1; i <= 6; i++) { await dito.muovi(cdp, [{ x: q.D.x, y: q.D.y - 76 * i / 6, id: 2 }]); await passo(1); }
      for (let i = 0; i < 8; i++) await passo(1);
      const tr = await pag.evaluate(() => {
        let out = null;
        for (const id in Touch5.atti) { const a = Touch5.atti[id];
          if (a.act === 'shot') { const t = Touch5.trascina(id, false); out = { dy: t.dy, l: t.l, armato: t.armato, morto: t.morto }; } }
        return out;
      });
      await dito.su(cdp, [{ x: q.D.x, y: q.D.y - 76, id: 2 }]);
      const r = await pag.evaluate(() => {
        const t = window.__test, G = t.G;
        let zMax = 0, v0 = Math.hypot(G.ball.vx, G.ball.vy);
        for (let fr = 0; fr < 140; fr++) { t.simulate(1 / 60); if (G.ball.z > zMax) zMax = G.ball.z; if (fr === 0) v0 = Math.hypot(G.ball.vx, G.ball.vy); }
        return { zMax, v0 };
      });
      await dito.sicuro(cdp);
      const ok = r.zMax > 20;
      if (!ok) male++;
      console.log('  ' + String(V.w + 'x' + V.h).padEnd(9) + ' sq' + SQ + '  disco TIRA (' + Math.round(q.D.x) + ',' + Math.round(q.D.y) + ') r' + Math.round(q.D.r) +
                  '  spazio sopra ' + Math.round(spazio) + ' px' +
                  '  lettura dy ' + (tr ? n1(tr.dy) : 'n/d') + ' l ' + (tr ? n1(tr.l) : 'n/d') + (tr && tr.morto ? ' MORTO' : '') +
                  '  ->  quota ' + n1(r.zMax) + '  ' + (ok ? 'PALLONETTO' : 'niente') + (ecc.length ? ('  ECCEZIONE ' + ecc[0]) : ''));
      if (SQ === 0) console.log('            dischi: ' + q.dischi + '   (' + V.nome + ')');
      await pag.close();
    }
    await ctx.close();
  }
  await br.close(); srv.chiudi();
  console.log('');
  console.log(male === 0 ? 'TUTTI I VETRI ALZANO IL PALLONETTO' : 'VETRI/SQUADRE CHE NON ALZANO: ' + male);
  process.exit(male === 0 ? 0 : 1);
})().catch(e => { console.error('IL BANCO E\' CADUTO: ' + (e && e.stack || e)); process.exit(2); });
