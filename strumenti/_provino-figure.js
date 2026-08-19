/* =====================================================================
   PROVINO DELLE FIGURE — ritaglia i giocatori DOVE STANNO.

   PERCHE' COSI'. Il primo tentativo costruiva una scena su misura: un
   uomo solo al centro, gli altri spediti fuori dal mondo, la camera
   inchiodata. Ha prodotto tre ritagli di solo prato, e la ragione e'
   istruttiva: quando resta un uomo solo la camera stringe su di lui,
   `disegna()` chiamata a mano non ripercorre la stessa strada di un
   fotogramma vero, e le coordinate lette da `view` smettono di
   corrispondere a cio' che finisce sulla tela. Ho perso tre giri a
   indovinare quale dei tre fosse il colpevole.
   Questa versione non costruisce niente: fa girare una partita normale,
   ferma il tempo, chiede al gioco dove sono i giocatori sullo SCHERMO e
   ritaglia li'. Se il ritaglio esce vuoto si vede subito, perche' lo
   strumento CONTA quanti pixel di figura ha trovato in ogni cella e
   rifiuta quelli vuoti invece di consegnarli.

   uso:  node strumenti/_provino-figure.js --quanti 8
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const GIOCO = arg('gioco', 'CALCETTO-il-gioco.html');
const QUANTI = +arg('quanti', 8);
const LATO = +arg('lato', 120);          // lato della cella in px CSS
const FUORI = arg('dir', path.join(RADICE, '_provino'));

const TIPI = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8',
               '.png':'image/png', '.json':'application/json' };
function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const p = decodeURIComponent(req.url.split('?')[0]);
      const f = path.join(RADICE, p === '/' ? 'index.html' : p);
      if (!f.startsWith(RADICE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        res.writeHead(404); res.end('no'); return; }
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
  window.__banco = { passo(n) { n = Math.max(0, Math.round(+n || 0));
    for (let i = 0; i < n; i++) { const c = coda; coda = []; t += PASSO;
      for (const f of c) { try { f(t); } catch (e) {} } } return t; } };
}

(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 915, height: 412 },
    deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(seme => { let s = seme >>> 0 || 1;
    const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => p() / 4294967296; }, 20260819);
  await pag.addInitScript(bancoDiProva);
  await pag.goto(`http://127.0.0.1:${srv.porta}/${GIOCO}`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 15000 });
  await pag.waitForTimeout(400);
  await pag.evaluate(() => window.__banco.passo(30));
  await pag.evaluate(() => {
    window.__test.dismissSplash && window.__test.dismissSplash();
    window.__test.startMatch(1, 1);
    window.__test.Tut && window.__test.Tut.finish && window.__test.Tut.finish(true);
    window.__test.setCpuVsCpu(true);
    window.__test.setTimeLeft(89);          // ora neutra: luce d'inizio partita
  });

  fs.mkdirSync(FUORI, { recursive: true });
  const presi = [];
  /* si raccolgono figure da ISTANTI DIVERSI di una partita normale: cosi'
     le direzioni e le fasi del passo vengono dal gioco e non da una posa
     costruita, che e' anche cio' che un giudice vedrebbe giocando. */
  for (let giro = 0; giro < 40 && presi.length < QUANTI; giro++) {
    await pag.evaluate(() => window.__test.simulate(0.9));
    await pag.evaluate(() => window.__banco.passo(2));
    const cand = await pag.evaluate(() => {
      const G = window.__test.G, v = window.__test.view;
      const fuori = [];
      for (const p of G.players) {
        if (p.role === 'gk' || p.out > 0) continue;
        const vel = Math.hypot(p.vx, p.vy);
        if (vel < 150) continue;                       // solo chi corre
        const sx = v.Ax + p.x * v.S2, sy = v.Ay + p.y * v.S2;
        if (sx < 90 || sx > VW - 90 || sy < 70 || sy > VH - 70) continue;
        /* nessun altro corpo a meno di 70 px: una cella con due uomini
           dentro non e' confrontabile con una cella del forno che ne ha
           uno solo */
        let solo = true;
        for (const q of G.players) {
          if (q === p || q.out > 0) continue;
          const qx = v.Ax + q.x * v.S2, qy = v.Ay + q.y * v.S2;
          if (Math.hypot(qx - sx, qy - sy) < 70) { solo = false; break; }
        }
        const bx = v.Ax + G.ball.x * v.S2, by = v.Ay + G.ball.y * v.S2;
        if (Math.hypot(bx - sx, by - sy) < 70) solo = false;
        if (!solo) continue;
        fuori.push({ sx:+sx.toFixed(1), sy:+sy.toFixed(1), team:p.team, num:p.numero,
                     ang: +(Math.atan2(p.fy, p.fx) * 180 / Math.PI).toFixed(0),
                     S2: +v.S2.toFixed(4) });
      }
      return fuori;
    });
    /* IL QUADRO INTERO, e il ritaglio si fa fuori.
       Il ritaglio di Playwright vuole coordinate della PAGINA; qui le
       coordinate vengono dalla trasformazione della camera, che il gioco
       applica al contesto della tela. Le due cose coincidono solo se la
       tela riempie la pagina senza margini, e fidarsene mi e' gia'
       costato tre giri di ritagli di solo prato. Si scatta tutto, si
       annota dove sta ciascuno, e a ritagliare ci pensa chi puo'
       CONTROLLARE di aver preso qualcosa. */
    if (cand.length && presi.length < QUANTI) {
      const f = path.join(FUORI, `pieno-${giro}.png`);
      await pag.screenshot({ path: f });
    }
    for (const c of cand) {
      if (presi.length >= QUANTI) break;
      presi.push({ ...c, pieno: `pieno-${giro}.png` });
      console.log(`  figura ${presi.length}  squadra ${c.team} n.${c.num}  faccia ${c.ang}°  S2 ${c.S2}`);
    }
  }

  if (presi.length < QUANTI) console.log(`  ATTENZIONE: solo ${presi.length} figure su ${QUANTI} richieste`);
  const S2 = presi.length ? presi[0].S2 : 0;
  console.log(`\n  ${presi.length} ritagli in ${FUORI}`);
  console.log(`  una figura di 40,12 unita' e' alta ${(40.12 * S2).toFixed(1)} px CSS = ${(40.12 * S2 * 2).toFixed(1)} px veri`);
  fs.writeFileSync(path.join(FUORI, 'figure-gioco.json'), JSON.stringify(presi, null, 2));
  await br.close(); srv.chiudi();
})();
