/* sonda usa-e-getta (voce #159 H1): un umano tiene la carica del tiro
   con un avversario addosso e il gioco DISEGNA un fotogramma: i due rami
   toccati (anello in drawPlayer, arco del disco in drawTouchButtons)
   devono girare senza eccezioni di pagina. Non e' un cancello. */
const path = require('path');
const { chromium } = require('playwright');
const RADICE = 'C:/Users/Utenteee/Desktop/GitHub/games';
const { semeFisso, servi } = require(RADICE + '/strumenti/_posa.js');
(async () => {
  const srv = await servi();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(semeFisso, 20261102);
  const ecc = []; pag.on('pageerror', e => ecc.push(e.message));
  const porta = srv.porta || srv.port || (srv.address && srv.address().port);
  await pag.goto(`http://127.0.0.1:${porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  const r = await pag.evaluate(() => {
    const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1;
    t.semina(1); t.startMatch(1, 1, { size: 5 }); t.setCpuVsCpu(true);
    for (let i = 0; i < 900 && t.state !== 'play'; i++) t.simulate(1 / 60);
    const P = G.players, p = P.find(u => u.team === 0 && u.role !== 'gk'), o = P.find(u => u.team === 1 && u.role !== 'gk');
    const pi = P.indexOf(p);
    G.cpu[0] = false; G.ctrl[0] = pi; G.paused = false;
    o.x = p.x - 4; o.y = p.y; o.slide = -1; o.out = 0;
    Object.assign(G.ball, { owner: pi, x: p.x + 6, y: p.y, z: 0, vx: 0, vy: 0, vz: 0, passTo: -1, crossTo: -1, lastTouch: pi, toccoPiede: true });
    p.charge = 0.6; p.chargeKind = 'tiro'; p.chargeT = SHOT_MIN; p.chargeGo = null; p.chargeClip = 'tiro';
    const larg = finestraTiro(p);
    t.disegna(); t.disegna();
    return { scena: t.state, larg, press: pressioneSu(p), ctrl: G.ctrl[0], cpu0: G.cpu[0] };
  });
  await browser.close(); srv.chiudi ? srv.chiudi() : srv.close();
  console.log(JSON.stringify(r), ' eccezioni di pagina:', ecc.length ? ecc.join(' | ') : 'nessuna');
  process.exit(ecc.length ? 1 : 0);
})().catch(e => { console.error('BANCO ESPLOSO:', e.message); process.exit(2); });
