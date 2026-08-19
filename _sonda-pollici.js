/* =====================================================================
   SONDA POLLICI — tre misure che servono al progetto dei comandi.

   1) GEOMETRIA VERA a 915x412: centri e raggi dei due dischi, bande
      dell'HUD, rettangolo della bussola. Chiesta al gioco
      (__test.pulsanti / __test.comandiTouch / __test.bande), mai
      ricopiata a mano.
   2) LA LENTE DELLA PRECEDENZA: esiste un punto che sta DENTRO la presa
      del disco piccolo e DENTRO l'anello di esclusione del disco grande.
      Il ciclo di Touch5.start prova i pulsanti in ordine e il grande e'
      il primo: se l'anello del grande risponde per primo, il tocco
      muore e la pressione legittima sul piccolo non arriva. Qui si
      preme quel punto e si guarda se il piccolo risulta premuto.
   3) IL TOCCO ANNULLATO DAL SISTEMA: con il pallone al piede e il dito
      appoggiato (levetta viva), si manda touchCancel — quello che manda
      il telefono quando cala la tendina delle notifiche o parte la
      gesture di sistema. Si guarda se parte un passaggio.

   uso:  node _sonda-pollici.js
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = __dirname;
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png' };
function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(RADICE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
const attesa = ms => new Promise(r => setTimeout(r, ms));

function preparaPossesso() {
  const t = window.__test, G = t.G;
  t.setPaused && t.setPaused(false);
  for (let i = 0; i < 300 && G.scene !== 'play'; i++) t.simulate(0.1);
  if (G.scene !== 'play') return { errore: 'scena ' + G.scene };
  t.setTimeLeft && t.setTimeLeft(80);
  const pi = G.ctrl[0];
  if (pi < 0) return { errore: 'nessun comandato' };
  const p = G.players[pi];
  if (p.charge !== undefined && p.charge >= 0) { p.charge = -1; p.chargeT = 0; p.chargeGo = null; }
  for (const q of G.players) { q.vx = 0; q.vy = 0; }
  const b = G.ball;
  b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0; b.curve = 0; b.passTo = -1;
  const v = t.view;
  const cx = (innerWidth / 2 - v.Ax) / v.S2;
  const dir = cx >= p.x ? 1 : -1;
  b.owner = pi; b.x = p.x + dir * 8; b.y = p.y;
  for (let i = 0; i < G.players.length; i++) {
    const q = G.players[i];
    if (i === pi || q.role === 'gk') continue;
    const d = Math.hypot(q.x - b.x, q.y - b.y);
    if (d < 170) { const l = Math.max(1, d); q.x = b.x + (q.x - b.x) / l * 230; q.y = b.y + (q.y - b.y) / l * 230; }
  }
  return { ok: true, owner: b.owner, ctrl: pi };
}

const dito = {
  giu: (cdp, x, y) => cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }),
  sposta: (cdp, x, y) => cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] }),
  su: (cdp) => cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }),
  annulla: (cdp) => cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] }),
};

(async () => {
  const srv = await servi();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 915, height: 412 }, deviceScaleFactor: 2,
    isMobile: true, hasTouch: true, locale: 'it-IT',
  });
  const pag = await ctx.newPage();
  await pag.addInitScript(s0 => {
    let x = s0 >>> 0 || 1;
    const p = () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x >>> 0; };
    Math.random = () => p() / 4294967296;
  }, 20260818);
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.waitForTimeout(400);
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); t.startMatch(1, 1); });
  await pag.waitForTimeout(500);
  const cdp = await ctx.newCDPSession(pag);

  const out = {};

  /* ---------- 1. geometria ---------- */
  await pag.evaluate(preparaPossesso);
  await pag.waitForTimeout(300);
  out.geometria = await pag.evaluate(() => {
    const t = window.__test;
    const z = t.comandiTouch;
    const mini = z.filter(q => q.tipo === 'minimappa')[0] || null;
    return {
      vw: innerWidth, vh: innerHeight, dpr: devicePixelRatio,
      bande: t.bande,
      pulsanti: t.pulsanti(0),
      zone: z.map(q => ({ tipo: q.tipo, act: q.act, x: q.x, y: q.y, r: q.r, x0: q.x0, y0: q.y0, x1: q.x1, y1: q.y1, alpha: q.alpha })),
      mini,
      taglia: t.taglia,
    };
  });

  /* ---------- 2. la lente della precedenza ---------- */
  {
    const [G0, P0] = out.geometria.pulsanti;   // grande, piccolo
    const dx = P0.x - G0.x, dy = P0.y - G0.y;
    const L = Math.hypot(dx, dy);
    const ux = dx / L, uy = dy / L;
    /* punto sul segmento fra i centri, a 39 px dal PICCOLO:
       dista L-39 dal GRANDE. Con L=94,8 sono 55,8: dentro l'anello di
       esclusione del grande (r+18 = 58) e dentro la presa del piccolo
       (r+10 = 40). E' esattamente la direzione da cui arriva il pollice
       destro che riposa sul grande e allunga verso il piccolo. */
    const px = P0.x - ux * 39, py = P0.y - uy * 39;
    out.lente = { L: +L.toFixed(2), punto: { x: +px.toFixed(1), y: +py.toFixed(1) },
                  dGrande: +(L - 39).toFixed(2), dPiccolo: 39,
                  presaGrande: G0.r + 10, esclGrande: G0.r + 18, presaPiccolo: P0.r + 10 };
    /* il segnale buono non e' `premuto` (l'atto memorizzato smette di
       combaciare con l'etichetta appena il possesso cambia): e' il
       CONTATORE delle filtranti, che sale solo se doFiltrante e' partito
       davvero, piu' la nascita o meno della levetta. */
    const premiIn = async (x, y) => {
      await pag.evaluate(preparaPossesso);
      await pag.waitForTimeout(250);
      const prima = await pag.evaluate(() => ({
        filtranti: window.__test.G.stats.filtranti ? window.__test.G.stats.filtranti[0] : 0,
        owner: window.__test.G.ball.owner,
      }));
      await dito.giu(cdp, x, y);
      await pag.waitForTimeout(140);
      const dopo = await pag.evaluate(() => ({
        filtranti: window.__test.G.stats.filtranti ? window.__test.G.stats.filtranti[0] : 0,
        owner: window.__test.G.ball.owner,
        stickVivo: window.__test.comandiTouch.some(q => q.tipo === 'stick'),
      }));
      await dito.su(cdp);
      await pag.waitForTimeout(250);
      return { x: +x.toFixed(1), y: +y.toFixed(1), filtrantiDelta: dopo.filtranti - prima.filtranti,
               stickVivo: dopo.stickVivo, ownerPrima: prima.owner, ownerDopo: dopo.owner };
    };
    out.lente.suLente = await premiIn(px, py);
    out.lente.alCentroPiccolo = await premiIn(P0.x, P0.y);
    /* terzo punto: appena FUORI dalla lente, dal lato opposto del
       piccolo (stessa distanza dal centro del piccolo, ma lontano dal
       grande). Se qui la filtrante parte e sulla lente no, la causa e'
       l'anello del grande e non la distanza dal piccolo. */
    out.lente.oppostoStessaDistanza = await premiIn(P0.x + ux * 39, P0.y + uy * 39);
  }

  /* ---------- 3. il tocco annullato dal sistema ---------- */
  const provaRilascio = async (modo) => {
    const pre = await pag.evaluate(preparaPossesso);
    if (pre.errore) return { errore: pre.errore };
    await pag.waitForTimeout(200);
    const prima = await pag.evaluate(() => ({ owner: window.__test.G.ball.owner, ctrl: window.__test.G.ctrl[0] }));
    /* dito appoggiato lontano dai due dischi e dalla bussola: meta'
       sinistra alta, dove nasce la levetta */
    let x = 300, y = 200;
    await dito.giu(cdp, x, y);
    for (let i = 0; i < 6; i++) { x += 5; await dito.sposta(cdp, x, y); await attesa(25); }
    await attesa(220);                    // fermo: non e' un flick
    /* la prova vale solo se il pallone e' ANCORA del comandato quando il
       dito si stacca: se un avversario l'ha rubato nel frattempo, il
       tentativo si butta invece di essere contato */
    const alDistacco = await pag.evaluate(() => ({ owner: window.__test.G.ball.owner, ctrl: window.__test.G.ctrl[0] }));
    if (alDistacco.owner !== alDistacco.ctrl) {
      if (modo === 'annulla') await dito.annulla(cdp); else await dito.su(cdp);
      return { scartato: 'palla persa prima del distacco', alDistacco };
    }
    if (modo === 'annulla') await dito.annulla(cdp); else await dito.su(cdp);
    await attesa(50);
    const sub = await pag.evaluate(() => {
      const b = window.__test.G.ball;
      return { owner: b.owner, sp: +Math.hypot(b.vx, b.vy).toFixed(1), passTo: b.passTo };
    });
    return { prima, alDistacco, subito: sub,
             passaggioPartito: sub.owner < 0 && sub.sp > 250 };
  };
  out.rilascioNormale = [];
  out.rilascioAnnullato = [];
  for (let i = 0; i < 4; i++) out.rilascioNormale.push(await provaRilascio('su'));
  for (let i = 0; i < 4; i++) out.rilascioAnnullato.push(await provaRilascio('annulla'));

  console.log(JSON.stringify(out, null, 2));
  await browser.close();
  srv.chiudi();
})();
