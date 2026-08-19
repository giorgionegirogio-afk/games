/* SONDA FISICA — misura, non attesta.
   Sei esperimenti sul motore di CALCETTO, a passo fisso 1/60, seme fisso.
   uso: node _sonda-fisica.js
*/
const fs = require('fs');
const path = require('path');
const http = require('http');
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
  await pag.addInitScript(seme => {
    let s = seme >>> 0 || 1;
    const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => p() / 4294967296;
  }, 20260728);
  pag.on('pageerror', e => console.log('ERRORE PAGINA:', e.message));
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.waitForTimeout(400);

  const out = await pag.evaluate(async () => {
    const t = window.__test;
    const R = {};
    const L = (x, y) => Math.hypot(x, y);
    t.dismissSplash && t.dismissSplash();
    t.startMatch(1, 1);
    t.setCpuVsCpu(true);
    t.simulate(3);                       // esce dal calcio d'inizio
    const b = t.ball, P = t.players;
    const C = t.campo;
    R.campo = { FW: C.FW, FH: C.FH, taglia: C.taglia, n: C.giocatori };

    const parcheggia = (yy) => { for (const p of P) { if (p.role === 'gk') continue; p.x = C.FW * 0.5; p.y = yy; p.vx = 0; p.vy = 0; } };

    /* ---------- A. ATTRITO: a terra contro in volo ---------- */
    function corsa(vz0) {
      parcheggia(C.FH - 40);
      b.owner = -1; b.passTo = -1; b.x = 80; b.y = 55; b.z = 0; b.vz = vz0;
      b.vx = 600; b.vy = 0; b.curve = 0; b.perfectT = 0;
      const s = [];
      for (let i = 0; i < 120; i++) {
        s.push({ i, x: b.x, y: b.y, z: b.z, vx: b.vx, vz: b.vz, own: b.owner });
        if (b.owner >= 0) break;
        t.simulate(1 / 60);
      }
      return s;
    }
    const aTerra = corsa(0);
    const inAria = corsa(260);
    const rid = s => s.filter(r => r.i % 10 === 0).map(r => ({ i: r.i, x: +r.x.toFixed(1), z: +r.z.toFixed(1), vx: +r.vx.toFixed(1) }));
    R.attrito = {
      terra: rid(aTerra), aria: rid(inAria),
      // lambda misurato = -ln(v1/v0)/dt su tutta la finestra
      lamTerra: +(-Math.log(aTerra[Math.min(60, aTerra.length - 1)].vx / aTerra[0].vx) / (Math.min(60, aTerra.length - 1) / 60)).toFixed(4),
      lamAria: +(-Math.log(inAria[Math.min(60, inAria.length - 1)].vx / inAria[0].vx) / (Math.min(60, inAria.length - 1) / 60)).toFixed(4),
    };

    /* ---------- B. CROSS: dove va contro dove voleva andare ---------- */
    function crossFinto(px, py) {
      parcheggia(C.FH - 40);
      const goalX = C.FW, lx = goalX - 55, ly = C.FH / 2 + (py < C.FH / 2 ? 1 : -1) * C.GOAL_H * 0.28;
      const dx = lx - px, dy = ly - py, dist = Math.max(1, L(dx, dy));
      const T = Math.min(0.75, Math.max(0.5, dist / 430));
      b.owner = -1; b.passTo = -1; b.x = px; b.y = py; b.z = 0;
      b.vx = dx / dist * (dist / T); b.vy = dy / dist * (dist / T); b.vz = 280 * T;
      b.curve = 0; b.perfectT = 0;
      let apex = 0, nf = 0;
      for (let i = 0; i < 200; i++) {
        t.simulate(1 / 60); nf++;
        if (b.z > apex) apex = b.z;
        if (b.owner >= 0) break;
        if (b.z <= 0 && nf > 3) break;
      }
      return {
        da: [+px.toFixed(0), +py.toFixed(0)], voluto: [+lx.toFixed(0), +ly.toFixed(0)],
        atterra: [+b.x.toFixed(0), +b.y.toFixed(0)], dist: +dist.toFixed(0),
        percorso: +L(b.x - px, b.y - py).toFixed(0), T: +T.toFixed(3),
        volo: +(nf / 60).toFixed(3), apice: +apex.toFixed(1),
        mancato: +L(b.x - lx, b.y - ly).toFixed(0), preso: b.owner >= 0
      };
    }
    R.cross = [crossFinto(700, 90), crossFinto(760, 470), crossFinto(900, 120)];

    /* ---------- C. CINEMATICA DEL GIOCATORE (comando umano) ---------- */
    t.setCpuVsCpu(false);
    const tasto = (code, giu) => window.dispatchEvent(new KeyboardEvent(giu ? 'keydown' : 'keyup', { code, bubbles: true }));
    const me = () => P[0].role === 'gk' ? P[1] : P[0];
    // prendi il controllo di un giocatore di movimento e portalo al centro
    const p0 = P.find(p => p.team === 0 && p.role !== 'gk');
    const idx = P.indexOf(p0);
    t.players; // no-op
    window.__idx = idx;
    b.owner = -1; b.x = 50; b.y = 50; b.vx = 0; b.vy = 0; b.z = 0; b.vz = 0;
    p0.x = C.FW * 0.5; p0.y = C.FH * 0.5; p0.vx = 0; p0.vy = 0; p0.ax = 0; p0.ay = 0;
    // il gioco deve controllare proprio lui
    try { t.setControllato && t.setControllato(0, idx); } catch (e) { }

    function profilo(codeGiu, frames, prima) {
      const s = [];
      if (prima) prima();
      tasto(codeGiu, true);
      for (let i = 0; i < frames; i++) {
        const q = P[idx];
        s.push({ i, v: +L(q.vx, q.vy).toFixed(2), vx: +q.vx.toFixed(2), vy: +q.vy.toFixed(2), fx: +q.fx.toFixed(3), fy: +q.fy.toFixed(3), x: +q.x.toFixed(2), y: +q.y.toFixed(2) });
        t.simulate(1 / 60);
      }
      tasto(codeGiu, false);
      return s;
    }
    const acc = profilo('KeyD', 100, () => { const q = P[idx]; q.vx = 0; q.vy = 0; q.ax = 0; q.ay = 0; q.x = 200; q.y = C.FH * 0.5; });
    // inversione: parte lanciato a destra, poi tutto a sinistra
    const inv = profilo('KeyA', 90, () => { const q = P[idx]; q.x = C.FW * 0.6; q.y = C.FH * 0.5; q.vx = 168; q.vy = 0; q.ax = 0; q.ay = 0; q.fx = 1; q.fy = 0; });
    const vmaxA = Math.max(...acc.map(r => r.v));
    const t63 = acc.findIndex(r => r.v >= 0.63 * vmaxA), t95 = acc.findIndex(r => r.v >= 0.95 * vmaxA);
    const tZero = inv.findIndex(r => r.vx <= 0), tPiena = inv.findIndex(r => r.vx <= -0.95 * vmaxA);
    const accMax = Math.max(...acc.slice(1).map((r, i) => Math.abs(r.v - acc[i].v) * 60));
    R.cinematica = {
      vmax: +vmaxA.toFixed(1), t63: +(t63 / 60).toFixed(3), t95: +(t95 / 60).toFixed(3),
      accPicco: +accMax.toFixed(0),
      invZero: +(tZero / 60).toFixed(3), invPiena: +(tPiena / 60).toFixed(3),
      // di quanto ruota la faccia rispetto alla velocita' durante l'inversione
      campioniInv: inv.filter(r => r.i % 6 === 0).map(r => ({ i: r.i, vx: r.vx, fx: r.fx, fy: r.fy })),
      campioniAcc: acc.filter(r => r.i % 6 === 0).map(r => ({ i: r.i, v: r.v }))
    };

    /* ---------- D. RICEZIONE: lo scatto della palla che si incolla ---------- */
    function ricezione(vel) {
      const q = P[idx];
      q.x = C.FW * 0.5; q.y = C.FH * 0.5; q.vx = 0; q.vy = 0; q.ax = 0; q.ay = 0; q.kickCd = 0; q.recover = 0; q.slide = -1;
      b.owner = -1; b.passTo = -1; b.z = 0; b.vz = 0; b.curve = 0; b.perfectT = 0;
      b.x = q.x - 220; b.y = q.y; b.vx = vel; b.vy = 0;
      let prev = { vx: b.vx, vy: b.vy, x: b.x, y: b.y }, salto = 0, vPrima = 0, nf = 0, preso = false;
      for (let i = 0; i < 90; i++) {
        t.simulate(1 / 60); nf++;
        const dv = L(b.vx - prev.vx, b.vy - prev.vy);
        if (b.owner === idx && !preso) { preso = true; salto = dv; vPrima = L(prev.vx, prev.vy); break; }
        prev = { vx: b.vx, vy: b.vy, x: b.x, y: b.y };
      }
      return { velLancio: vel, preso, frame: nf, vPrimaDelTocco: +vPrima.toFixed(0), saltoVel: +salto.toFixed(0), acc: +(salto * 60).toFixed(0) };
    }
    R.ricezione = [150, 300, 415, 500].map(ricezione);

    /* ---------- E. CORPI: quanta posizione NON viene dalla velocita' ---------- */
    t.setCpuVsCpu(true);
    t.simulate(1);
    const prevPos = P.map(p => ({ x: p.x, y: p.y, vx: p.vx, vy: p.vy }));
    let telMax = 0, telSomma = 0, telN = 0, telFrames = 0, contatti = 0, campioni = 0;
    const accHist = [];
    for (let f = 0; f < 60 * 25; f++) {
      const pre = P.map(p => ({ x: p.x, y: p.y, vx: p.vx, vy: p.vy }));
      t.simulate(1 / 60);
      let unoQui = false;
      for (let i = 0; i < P.length; i++) {
        const p = P[i], a = pre[i];
        if (p.out > 0) continue;
        campioni++;
        const dvx = p.vx - a.vx, dvy = p.vy - a.vy;
        accHist.push(L(dvx, dvy) * 60);
        // scarto fra lo spostamento vero e quello che la velocita' spiega
        const attesoX = a.x + p.vx / 60, attesoY = a.y + p.vy / 60;
        const tel = L(p.x - attesoX, p.y - attesoY);
        if (tel > 0.05) { telSomma += tel; telN++; unoQui = true; if (tel > telMax) telMax = tel; }
        for (let j = i + 1; j < P.length; j++) { if (P[j].out > 0) continue; if (L(P[j].x - p.x, P[j].y - p.y) < 26) contatti++; }
      }
      if (unoQui) telFrames++;
    }
    accHist.sort((a, c) => a - c);
    const pc = q => +accHist[Math.floor(accHist.length * q)].toFixed(0);
    R.corpi = {
      frames: 60 * 25, campioni, telFrames, telN,
      telMedio: +(telSomma / Math.max(1, telN)).toFixed(2), telMax: +telMax.toFixed(2),
      contattiPerFrame: +(contatti / (60 * 25)).toFixed(2),
      accP50: pc(0.50), accP95: pc(0.95), accP99: pc(0.99), accMax: +accHist[accHist.length - 1].toFixed(0),
      accSopra900: +(accHist.filter(v => v > 900).length / accHist.length * 100).toFixed(2)
    };

    /* ---------- F. QUOTA: la palla in aria paga l'erba? ---------- */
    // gia' in A; qui il conto puro del volo di un pallonetto
    return R;
  });

  console.log(JSON.stringify(out, null, 1));
  await browser.close();
  srv.chiudi();
})();
