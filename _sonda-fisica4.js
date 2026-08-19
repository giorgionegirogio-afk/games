/* SONDA FISICA 4 — (a) il cross vero, col tasto, non con la formula
   ricopiata; (b) quante volte in una partita la palla attraversa un corpo. */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = __dirname;
function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(RADICE) || !fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
(async () => {
  const srv = await servi();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(seme => { let s = seme >>> 0 || 1; const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; }; Math.random = () => p() / 4294967296; }, 20260728);
  pag.on('pageerror', e => console.log('ERR:', e.message));
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.waitForTimeout(400);

  const out = await pag.evaluate(async () => {
    const t = window.__test, R = {}, L = Math.hypot;
    t.dismissSplash && t.dismissSplash(); t.startMatch(1, 1); t.simulate(3);
    const b = t.ball, P = t.players, C = t.campo;
    const tasto = (c, g) => window.dispatchEvent(new KeyboardEvent(g ? 'keydown' : 'keyup', { code: c, bubbles: true }));
    const pre = P.map(p => p.vx); tasto('KeyD', true); t.simulate(12 / 60); tasto('KeyD', false);
    let idx = -1, best = -1;
    for (let i = 0; i < P.length; i++) { const d = P[i].vx - pre[i]; if (P[i].team === 0 && d > best) { best = d; idx = i; } }
    const q = P[idx];

    /* --- (a) il cross vero --- */
    function crossVero(px, py) {
      for (const p of P) { if (p !== q && p.role !== 'gk') { p.x = 60; p.y = 60 + p.idx * 9; p.vx = 0; p.vy = 0; } }
      q.x = px; q.y = py; q.vx = 0; q.vy = 0; q.ax = 0; q.ay = 0; q.fx = 1; q.fy = 0;
      q.charge = -1; q.kickCd = 0; q.recover = 0; q.slide = -1;
      b.owner = idx; b.x = px + 16; b.y = py; b.z = 0; b.vz = 0; b.passTo = -1;
      const goalX = C.FW, lx = goalX - 55, ly = C.FH / 2 + (py < C.FH / 2 ? 1 : -1) * C.GOAL_H * 0.28;
      tasto('ShiftLeft', true); tasto('KeyE', true);
      let partito = false, apice = 0, f0 = 0, nf = 0, v0 = 0, x0 = 0, y0 = 0;
      for (let i = 0; i < 150; i++) {
        t.simulate(1 / 60); nf++;
        if (!partito && b.owner < 0 && b.vz > 0) { partito = true; f0 = nf; v0 = L(b.vx, b.vy); x0 = b.x; y0 = b.y; tasto('KeyE', false); tasto('ShiftLeft', false); }
        if (partito) { if (b.z > apice) apice = b.z; if (b.z <= 0 || b.owner >= 0) break; }
      }
      tasto('KeyE', false); tasto('ShiftLeft', false);
      if (!partito) return { da: [px, py], esito: 'nessun cross' };
      const dist = L(lx - x0, ly - y0);
      return {
        da: [px | 0, py | 0], voluto: [lx | 0, ly | 0], atterra: [b.x | 0, b.y | 0],
        v0: v0 | 0, distVoluta: dist | 0, percorso: L(b.x - x0, b.y - y0) | 0,
        resa: +(L(b.x - x0, b.y - y0) / dist).toFixed(3),
        mancato: L(b.x - lx, b.y - ly) | 0, volo: +((nf - f0) / 60).toFixed(3), apice: +apice.toFixed(1),
        preso: b.owner >= 0
      };
    }
    R.crossVero = [crossVero(700, 100), crossVero(780, 460), crossVero(880, 150)];

    /* --- (b) la palla attraversa i corpi: quante volte in 60 s --- */
    t.setCpuVsCpu(true); t.simulate(2);
    let att = 0, attVel = [], frames = 60 * 60, tocchi = 0;
    let px = b.x, py = b.y, pOwn = b.owner, pv = L(b.vx, b.vy);
    for (let f = 0; f < frames; f++) {
      const preV = { x: b.x, y: b.y, vx: b.vx, vy: b.vy, own: b.owner };
      t.simulate(1 / 60);
      if (b.owner >= 0 || preV.own >= 0) { px = b.x; py = b.y; continue; }
      const dx = b.x - preV.x, dy = b.y - preV.y, dd = dx * dx + dy * dy;
      if (dd < 1) continue;
      const cambiata = L(b.vx - preV.vx, b.vy - preV.vy) > 25;
      if (cambiata) { tocchi++; continue; }
      if (b.z > 26) continue;                        // sopra le teste: giusto che passi
      for (const p of P) {
        if (p.out > 0) continue;
        const u = Math.max(0, Math.min(1, ((p.x - preV.x) * dx + (p.y - preV.y) * dy) / dd));
        const cx = preV.x + dx * u, cy = preV.y + dy * u;
        if (L(cx - p.x, cy - p.y) < 13 + 8 - 2) { att++; attVel.push(L(preV.vx, preV.vy)); break; }
      }
    }
    attVel.sort((a, c) => a - c);
    R.attraversamenti = {
      secondi: 60, eventi: att, alMinuto: att,
      velMediana: attVel.length ? +attVel[(attVel.length * .5) | 0].toFixed(0) : null,
      velMax: attVel.length ? +attVel[attVel.length - 1].toFixed(0) : null,
      sopra300: attVel.filter(v => v > 300).length, tocchiVeri: tocchi
    };
    return R;
  });
  console.log(JSON.stringify(out, null, 1));
  await browser.close(); srv.chiudi();
})();
