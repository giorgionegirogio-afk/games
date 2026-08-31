/* =====================================================================
   _c3-foto.js — le tre fotografie della terza famiglia:
     1  i cinque dischi, con SCATTO in cima alla colonna
     2  lo SCUDO: l'etichetta cambiata, il corpo girato, il pallone dietro
     3  l'ARCO dello scatto acceso attorno alla levetta
   Non e' un cancello: e' l'occhio. I numeri stanno in _p-scatto.js e
   _p-scudo.js.
   uso: node strumenti/_c3-foto.js --gioco fuori/cmd-terza.html --dove fuori/foto-cmd3
   ===================================================================== */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const GIOCO = path.resolve(arg('gioco', RADICE + '/fuori/cmd-terza.html'));
const DOVE = path.resolve(arg('dove', RADICE + '/fuori/foto-cmd3'));
const VW = +arg('vw', 915), VH = +arg('vh', 412);
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png' };
function servi() {
  return new Promise(ok => {
    const s = http.createServer((rq, rs) => {
      const u = decodeURIComponent(rq.url.split('?')[0]);
      let f = path.join(RADICE, u === '/' ? 'index.html' : u);
      if (/CALCETTO-il-gioco\.html$/i.test(f)) f = GIOCO;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { rs.writeHead(404); rs.end(); return; }
      rs.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(rs);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
const dita = {
  giu: (cdp, punti) => cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: punti }),
  sposta: (cdp, punti) => cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: punti }),
  su: (cdp, punti) => cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: punti || [] }),
};
const attesa = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  fs.mkdirSync(DOVE, { recursive: true });
  const srv = await servi();
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  /* IL CICLO DI DISEGNO PASSA IN MANO AL BANCO — lo stesso impianto di
     _q-dischi.js. Senza, il rAF del gioco continua a girare fra una
     riga e l'altra dello script: la scena che si pianta a mano dura
     qualche millisecondo e la fotografia esce da un'altra partita. */
  await ctx.addInitScript(() => {
    const PASSO = 1000 / 60;
    let t = 0, coda = [];
    window.requestAnimationFrame = cb => { coda.push(cb); return coda.length; };
    window.cancelAnimationFrame = () => {};
    try { performance.now = () => t; } catch (e) {}
    window.__banco = { passo(n){ n = Math.max(0, Math.round(+n || 0));
      for (let i = 0; i < n; i++) { const c = coda; coda = []; t += PASSO; for (const f of c) { try { f(t); } catch (e) {} } }
      return t; } };
  });
  const pag = await ctx.newPage();
  const cdp = await ctx.newCDPSession(pag);
  pag.on('pageerror', e => console.error('  ! ' + e.message));
  await pag.goto('http://127.0.0.1:' + srv.porta + '/CALCETTO-il-gioco.html', { waitUntil: 'load' });
  await pag.evaluate(async () => { try { window.__test.dismissSplash(); } catch (e) { } await document.fonts.ready; });
  await attesa(900); await pag.evaluate(() => window.__banco.passo(8));
  await pag.evaluate(() => { window.__test.semina(20260829); window.__test.startMatch(1, 1, { size: 5 }); });
  /* il sipario del cambio scena vive nel ciclo dei fotogrammi: se non lo
     si lascia finire, la fotografia esce con mezza tela coperta */
  await pag.evaluate(() => window.__banco.passo(200));

  /* la scena: il comandato col pallone, un avversario addosso */
  const scena = await pag.evaluate(() => {
    const t = window.__test;
    t.simulate(1.4);
    window.__scena = () => {
    const P = G.players;
    let mio = -1, suo = -1, mioCasa = -1, suoCasa = -1;
    for (let i = 0; i < P.length; i++) {
      const p = P[i];
      if (p.role === 'gk') continue;
      if (p.team === 0 && mio < 0) { mio = i; continue; }
      if (p.team === 1 && suo < 0) { suo = i; continue; }
      if (p.team === 0 && mioCasa < 0) { mioCasa = i; continue; }
      if (p.team === 1 && suoCasa < 0) { suoCasa = i; continue; }
      p.out = 99; p.x = -200; p.y = -200; p.vx = 0; p.vy = 0;
    }
    for (const [k, gx] of [[mioCasa, 70], [suoCasa, FW - 70]]) {
      if (k < 0) continue;
      const q = P[k]; q.out = 0; q.x = gx; q.y = FH / 2; q.vx = 0; q.vy = 0; q.slide = -1; q.recover = 0;
    }
    if (G.brain[0]) G.brain[0].ruoloT = -1;
    if (G.brain[1]) G.brain[1].ruoloT = -1;
    G.ctrl[0] = mio; G.cpu[0] = false; G.cpu[1] = true; G.swTimer[0] = 0; G.swLock[0] = 0;
    const A = P[mio], D = P[suo];
    A.x = FW * 0.5; A.y = FH / 2; A.vx = 0; A.vy = 0; A.fx = 1; A.fy = 0; A.fiato = 100; A.out = 0;
    D.x = A.x + 52; D.y = A.y + 8; D.vx = -70; D.vy = 0; D.fx = -1; D.fy = 0; D.out = 0;
    const b = G.ball; b.owner = mio; b.x = A.x + 16; b.y = A.y; b.z = 0; b.vx = 0; b.vy = 0; b.vz = 0;
    Touch5.used = true;
    /* la fotografia guarda i COMANDI: si spengono le cose di scena che
       passano sopra (il nastro dell'evento, la targa, la moviola) */
    G.banner=''; G.bannerT=0; G.capT=0; G.moviola=null; G.goalCine=null;
    try{ if(typeof Tut!=='undefined' && Tut.active) Tut.finish(true); }catch(e){}
    };
    window.__scena();
    const d5 = t.pulsanti(0).find(z => z.act === 'sprint');
    return { d5 };
  });
  console.log('disco sprint: ' + JSON.stringify(scena.d5));

  /* 1 — i cinque dischi, nessun dito */
  /* IL SIPARIO DEL CAMBIO SCENA vive nel ciclo dei fotogrammi, non nella
     simulazione: si lascia scorrere col banco, poi la scena si ripianta. */
  await pag.evaluate(() => window.__banco.passo(90));
  await pag.evaluate(() => { window.__scena(); window.__test.disegna(); });
  const soloTela = { clip: { x: 0, y: 0, width: VW, height: VH } };
  /* si fotografa la TELA, non il documento: i pannelli di DOM (tutorial,
     inviti) non fanno parte dei comandi e coprirebbero il grappolo */
  const tela = await pag.$('#gioco');
  await tela.screenshot({ path: path.join(DOVE, '1-cinque-dischi.png') });

  /* 2 — lo SCUDO: dito sul quinto disco, levetta ferma */
  await pag.evaluate(() => window.__scena());
  await dita.giu(cdp, [{ x: scena.d5.x, y: scena.d5.y, id: 7 }]);
  await pag.evaluate(() => { for (let i = 0; i < 26; i++) window.__test.simulate(1 / 60); window.__test.disegna(); });
  const st2 = await pag.evaluate(() => {
    const t = window.__test, P = G.players, p = P[G.ctrl[0]], b = G.ball;
    const d5 = t.pulsanti(0).find(z => z.act === 'sprint');
    return { etichetta: d5 ? d5.label : '?', fx: +p.fx.toFixed(2), fy: +p.fy.toFixed(2),
             dPalla: +Math.hypot(b.x - p.x, b.y - p.y).toFixed(1), fiato: +p.fiato.toFixed(1),
             tenuta: Touch5.scatta(0), clip: (typeof rigStato === 'function') ? rigStato(p).clip : '?',
             ctrl: G.ctrl[0], owner: G.ball.owner, mossa: humanMove(0).map(v=>+v.toFixed(2)),
             attivo: scudoAttivo(p), chiesto: scudoChiesto(p), scena: G.scene };
  });
  await tela.screenshot({ path: path.join(DOVE, '2-scudo.png') });
  console.log('scudo: ' + JSON.stringify(st2));

  /* 3 — lo SCATTO: stesso dito sul disco, levetta spinta */
  const ox = Math.round(VW * 0.20), oy = Math.round(VH * 0.62);
  await pag.evaluate(() => window.__scena());
  await dita.giu(cdp, [{ x: ox, y: oy, id: 1 }, { x: scena.d5.x, y: scena.d5.y, id: 7 }]);
  for (let k = 1; k <= 8; k++) {
    await dita.sposta(cdp, [{ x: ox + 14 * k, y: oy, id: 1 }, { x: scena.d5.x, y: scena.d5.y, id: 7 }]);
    await pag.evaluate(() => { window.__test.simulate(1 / 60); });
  }
  await pag.evaluate(() => { for (let i = 0; i < 20; i++) window.__test.simulate(1 / 60); window.__test.disegna(); });
  const st3 = await pag.evaluate(() => {
    const t = window.__test, p = G.players[G.ctrl[0]];
    const d5 = t.pulsanti(0).find(z => z.act === 'sprint');
    return { etichetta: d5 ? d5.label : '?', sprint: !!p.sprint, fiato: +p.fiato.toFixed(1), arco: humanSprint(0) };
  });
  await tela.screenshot({ path: path.join(DOVE, '3-scatto.png') });
  console.log('scatto: ' + JSON.stringify(st3));
  await dita.su(cdp, []);
  await br.close(); srv.chiudi();
  console.log('foto in ' + DOVE);
})();
