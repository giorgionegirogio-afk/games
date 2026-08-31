/* apre la partita nella scheda GIA' APERTA del telefono (senza toccare
   le schede degli altri agenti) e la lascia in gioco per la fotografia */
const { chromium } = require('playwright');
(async () => {
  const br = await chromium.connectOverCDP('http://127.0.0.1:9333');
  const ctx = br.contexts()[0];
  const pag = ctx.pages().find(p => p.url().includes('cmd-terza.html'));
  if (!pag) { console.error('la mia scheda non c\'e\' piu\''); process.exit(1); }
  await pag.bringToFront();
  const o = await pag.evaluate(() => {
    const t = window.__test;
    try { t.dismissSplash(); } catch (e) { }
    t.semina(20260829);
    t.startMatch(1, 1, { size: 5 });
    return { scena: t.state, vw: innerWidth, vh: innerHeight, dpr: window.devicePixelRatio };
  });
  console.log(JSON.stringify(o));
  await new Promise(r => setTimeout(r, 2500));
  const o2 = await pag.evaluate(() => {
    const t = window.__test;
    try { if (typeof Tut !== 'undefined' && Tut.active) Tut.finish(true); } catch (e) { }
    const P = G.players;
    let mio = -1, suo = -1;
    for (let i = 0; i < P.length; i++) { const p = P[i]; if (p.role === 'gk') continue; if (p.team === 0 && mio < 0) mio = i; else if (p.team === 1 && suo < 0) suo = i; }
    G.ctrl[0] = mio;
    const A = P[mio], D = P[suo], b = G.ball;
    A.x = FW * 0.5; A.y = FH / 2; A.vx = 0; A.vy = 0; A.fx = 1; A.fy = 0;
    D.x = A.x + 55; D.y = A.y + 8; D.vx = -70; D.vy = 0;
    b.owner = mio; b.x = A.x + 16; b.y = A.y; b.z = 0; b.vx = 0; b.vy = 0;
    Touch5.used = true;
    G.banner = ''; G.bannerT = 0; G.capT = 0;
    const d5 = t.pulsanti(0).find(z => z.act === 'sprint');
    return { d5, dischi: t.pulsanti(0).map(z => z.label + '@' + Math.round(z.x) + ',' + Math.round(z.y) + ' r' + z.r), scena: t.state };
  });
  console.log(JSON.stringify(o2));
  await br.close();
})();
