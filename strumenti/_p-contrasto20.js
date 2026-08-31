/* =====================================================================
   _p-contrasto20.js — VENTI CONTRASTI VERI, E CHI HA DETTO NO
   (31 agosto 2026). giocata.js vede il contrasto fallire ~1 volta su 5
   («p.slide resta spento») anche a macchina quieta. Questa sonda rifa'
   VENTI volte lo stesso gesto — dita di protocollo, come il cancello —
   nella stessa pagina, con doSlide AVVOLTO: per ogni rilascio si sa se
   doSlide e' stato chiamato, con che fase, e cos'era vero del mondo in
   quell'istante (distanza dal portatore, stato del comandato, palla).
   Non giudica: censisce. Serve a dare un NOME al no.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');

function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
const attesa = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const srv = await servi();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(s0 => {
    let x = s0 >>> 0 || 1;
    const p = () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x >>> 0; };
    Math.random = () => p() / 4294967296;
  }, 20260831);
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => {
    const t = window.__test;
    t.dismissSplash && t.dismissSplash();
    if (t.save) t.save.tutorialDone = 1;
    t.startMatch(1, 1);
    /* doSlide avvolto: ogni chiamata lascia traccia, qualunque esito */
    window.__ds = [];
    const orig = window.doSlide;
    window.doSlide = function (team, fase) {
      const G = window.__test.G;
      const pi = G.ctrl[0], p = pi >= 0 ? G.players[pi] : null;
      const prima = p ? p.slide : null;
      const r = orig.apply(this, arguments);
      const dopo = p ? p.slide : null;
      window.__ds.push({ fase: fase === undefined ? '(nessuna)' : String(fase), prima, dopo });
      return r;
    };
  });
  await attesa(500);
  const cdp = await ctx.newCDPSession(pag);

  const esiti = [];
  for (let rep = 0; rep < 20; rep++) {
    /* quiete + ripunto, come nel cancello */
    const info = await pag.evaluate(() => {
      const t = window.__test, G = t.G;
      t.setPaused && t.setPaused(false);
      for (let i = 0; i < 300 && G.scene !== 'play'; i++) t.simulate(0.1);
      if (G.scene !== 'play') return { errore: 'mai in play' };
      t.setTimeLeft(80);
      const pi = G.ctrl[0]; if (pi < 0) return { errore: 'nessun comandato' };
      const p = G.players[pi];
      if (p.charge !== undefined && p.charge >= 0) { p.charge = -1; p.chargeT = 0; p.chargeGo = null; }
      for (const q of G.players) { q.vx = 0; q.vy = 0; }
      let portatore = -1, dm = 1e9;
      for (let i = 0; i < G.players.length; i++) {
        const q = G.players[i];
        if (q.team !== 1 || q.out > 0 || q.role === 'gk') continue;
        const d = Math.hypot(q.x - p.x, q.y - p.y);
        if (d < dm) { dm = d; portatore = i; }
      }
      if (portatore < 0) return { errore: 'nessun portatore' };
      const v = t.view, cx = (innerWidth / 2 - v.Ax) / v.S2, dir = cx >= p.x ? 1 : -1;
      const q = G.players[portatore];
      q.x = p.x + dir * 84; q.y = p.y; q.vx = 0; q.vy = 0;
      const b = G.ball;
      b.owner = portatore; b.x = q.x + dir * 8; b.y = q.y; b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0;
      /* avversari e compagni lontani dalla palla */
      for (let i = 0; i < G.players.length; i++) {
        const z = G.players[i];
        if (i === portatore || i === pi || z.role === 'gk') continue;
        const d = Math.hypot(z.x - b.x, z.y - b.y);
        if (d < 170) { const l = Math.max(1, d); z.x = b.x + (z.x - b.x) / l * 230; z.y = b.y + (z.y - b.y) / l * 230; }
      }
      const sx = w => w * v.S2 + v.Ax, sy = w => w * v.S2 + v.Ay;
      window.__ds.length = 0;
      const bt = t.pulsanti(0);
      const gr = bt.reduce((a, z) => (z.r > a.r ? z : a), bt[0]);
      return { pi, portatore,
        grande: { x: Math.round(gr.x), y: Math.round(gr.y), act: gr.act },
        palla: { x: sx(b.x), y: sy(b.y) }, comandato: { x: sx(p.x), y: sy(p.y) } };
    });
    if (info.errore) { esiti.push({ rep, errore: info.errore }); continue; }
    if (info.grande.act !== 'slide') { esiti.push({ rep, errore: 'atto ' + info.grande.act }); continue; }

    await attesa(150);
    /* il gesto del cancello: giu' sul disco, 5 spostamenti verso palla, 60 ms, su */
    let vx = info.palla.x - info.comandato.x, vy = info.palla.y - info.comandato.y;
    const vl = Math.max(1, Math.hypot(vx, vy)); vx /= vl; vy /= vl;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: info.grande.x, y: info.grande.y }] });
    for (let i = 1; i <= 5; i++)
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: Math.round(info.grande.x + vx * 16 * i), y: Math.round(info.grande.y + vy * 16 * i) }] });
    await attesa(60);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await attesa(450);

    const r = await pag.evaluate(([pi, portatore]) => {
      const t = window.__test, G = t.G;
      const p = G.players[pi], q = G.players[portatore];
      const d = p && q ? Math.hypot(q.x - p.x, q.y - p.y) : -1;
      return {
        chiamate: window.__ds.slice(),
        slideOra: p ? p.slide : null,
        recover: p ? p.recover : null, kickCd: p ? p.kickCd : null,
        contrasto: p ? p.contrasto : null,
        distPortatore: +d.toFixed(1),
        owner: G.ball.owner,
        ownerTeam: G.ball.owner >= 0 && G.players[G.ball.owner] ? G.players[G.ball.owner].team : -1,
        ctrl: G.ctrl[0],
      };
    }, [info.pi, info.portatore]);
    /* «scivolata partita» = doSlide chiamato con fase 'scivola': la
       scivolata vera si arma via anticipo, p.slide si accende DOPO la
       chiamata, quindi il prima/dopo sincrono non fa fede */
    const partita = r.chiamate.some(c => c.fase === 'scivola');
    esiti.push({ rep, partita, chiamate: r.chiamate.length,
      dettaglio: r.chiamate.map(c => c.fase).join(','),
      distPortatore: r.distPortatore, ctrlCambiato: r.ctrl !== info.pi,
      owner: r.owner, nostra: r.owner >= 0 ? (r.ownerTeam === 0) : null,
      recover: r.recover, kickCd: r.kickCd });
  }

  let ok = 0;
  for (const e of esiti) {
    if (e.errore) { console.log('rep ' + e.rep + '  BANCO: ' + e.errore); continue; }
    if (e.partita) ok++;
    console.log('rep ' + String(e.rep).padStart(2) + '  ' + (e.partita ? 'SCIVOLA' : 'NIENTE ') +
      '  [' + e.dettaglio + ']' +
      '  dist ' + e.distPortatore + '  ctrlCambiato ' + e.ctrlCambiato +
      '  palla: ' + (e.owner < 0 ? 'libera' : (e.nostra ? 'NOSTRA' : 'loro')) +
      '  recover ' + e.recover + '  kickCd ' + e.kickCd);
  }
  console.log('\n' + ok + ' scivolate su ' + esiti.filter(e => !e.errore).length + ' gesti misurati');
  await ctx.close(); await browser.close(); srv.chiudi();
})().catch(e => { console.error('FALLITO: ' + e.message); process.exit(2); });
