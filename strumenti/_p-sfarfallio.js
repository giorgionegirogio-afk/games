/* =====================================================================
   _p-sfarfallio.js — QUANTO DURA LO SFARFALLIO, E QUANTO LONTANO VA IL
   PALLONE (31 agosto 2026, per PROGETTO-ISTERESI-DISCO).
   La scena di _p-contrasto20 senza dita: portatore CPU a 84 unita' dal
   comandato, palla sua. Si campiona a passo fisso (1/60) per 6 secondi:
     · b.owner (indice o -1) fotogramma per fotogramma;
     · la faccia RISOLTA del disco 0 (touchBtnLayout via __test.pulsanti);
     · la distanza palla-ultimo tocco e palla-comandato.
   Ne escono i numeri che l'isteresi deve coprire: durata delle finestre
   owner==-1, distanza massima palla-toccatore dentro quelle finestre,
   e quante volte la faccia del disco cambia in 6 s di palleggio.
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

  const r = await pag.evaluate(() => {
    const t = window.__test, G = t.G;
    t.dismissSplash && t.dismissSplash();
    if (t.save) t.save.tutorialDone = 1;
    t.startMatch(1, 1);
    t.setPaused && t.setPaused(false);
    for (let i = 0; i < 300 && G.scene !== 'play'; i++) t.simulate(0.1);
    if (G.scene !== 'play') return { errore: 'mai in play' };
    t.setTimeLeft(80);
    const pi = G.ctrl[0]; if (pi < 0) return { errore: 'nessun comandato' };
    const p = G.players[pi];
    for (const q of G.players) { q.vx = 0; q.vy = 0; }
    let portatore = -1, dm = 1e9;
    for (let i = 0; i < G.players.length; i++) {
      const q = G.players[i];
      if (q.team !== 1 || q.out > 0 || q.role === 'gk') continue;
      const d = Math.hypot(q.x - p.x, q.y - p.y);
      if (d < dm) { dm = d; portatore = i; }
    }
    if (portatore < 0) return { errore: 'nessun portatore' };
    const q = G.players[portatore];
    q.x = p.x + 84; q.y = p.y; q.vx = 0; q.vy = 0;
    const b = G.ball;
    b.owner = portatore; b.x = q.x + 8; b.y = q.y; b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0;
    for (let i = 0; i < G.players.length; i++) {
      const z = G.players[i];
      if (i === portatore || i === pi || z.role === 'gk') continue;
      const d = Math.hypot(z.x - b.x, z.y - b.y);
      if (d < 170) { const l = Math.max(1, d); z.x = b.x + (z.x - b.x) / l * 230; z.y = b.y + (z.y - b.y) / l * 230; }
    }
    /* campionamento a passo fisso: 6 s, 360 fotogrammi */
    const rig = [];
    for (let k = 0; k < 360; k++) {
      t.simulate(1 / 60);
      const ultimo = b.lastTouch >= 0 && G.players[b.lastTouch] ? G.players[b.lastTouch] : null;
      rig.push({
        owner: b.owner,
        act: t.pulsanti(0)[0].act,
        dUlt: ultimo ? +Math.hypot(b.x - ultimo.x, b.y - ultimo.y).toFixed(1) : -1,
        dCom: G.ctrl[0] >= 0 ? +Math.hypot(b.x - G.players[G.ctrl[0]].x, b.y - G.players[G.ctrl[0]].y).toFixed(1) : -1,
        ultT: b.lastTouch >= 0 && ultimo ? ultimo.team : -1,
      });
    }
    return { pi, portatore, rig };
  });
  if (r.errore) { console.log('BANCO: ' + r.errore); process.exit(2); }

  /* le finestre owner==-1: durata e distanza massima palla-toccatore */
  const spans = [];
  let cur = null;
  for (let k = 0; k < r.rig.length; k++) {
    const f = r.rig[k];
    if (f.owner < 0) {
      if (!cur) cur = { da: k, n: 0, dMax: 0, ultT: f.ultT };
      cur.n++; cur.dMax = Math.max(cur.dMax, f.dUlt);
    } else if (cur) { spans.push(cur); cur = null; }
  }
  if (cur) spans.push(cur);

  /* i cambi di faccia del disco 0 */
  let flips = 0;
  const flipRighe = [];
  for (let k = 1; k < r.rig.length; k++) {
    if (r.rig[k].act !== r.rig[k - 1].act) {
      flips++;
      flipRighe.push('f' + k + '  ' + r.rig[k - 1].act + '->' + r.rig[k].act +
        '  owner ' + r.rig[k].owner + '  dCom ' + r.rig[k].dCom + '  dUlt ' + r.rig[k].dUlt);
    }
  }

  const owner1 = r.rig.filter(f => f.owner < 0).length;
  console.log('360 fotogrammi campionati (6 s a passo fisso), portatore ' + r.portatore + ', comandato ' + r.pi);
  console.log('owner==-1 in ' + owner1 + ' fotogrammi su 360 (' + (owner1 / 3.6).toFixed(1) + '%), in ' + spans.length + ' finestre:');
  for (const s of spans)
    console.log('  da f' + s.da + '  durata ' + s.n + ' fotogrammi (' + (s.n / 60 * 1000).toFixed(0) + ' ms)  dMax palla-toccatore ' + s.dMax + ' u  squadra ultimo tocco ' + s.ultT);
  console.log('\nfaccia del disco 0 cambiata ' + flips + ' volte:');
  for (const f of flipRighe) console.log('  ' + f);

  await ctx.close(); await browser.close(); srv.chiudi();
})().catch(e => { console.error('FALLITO: ' + e.message); process.exit(2); });
