/* prova: la lavagnetta di fine partita elenca tutto quello che il saldo
   incassa? Somma delle righe contro variazione vera delle monete. */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : d; };

function servi(prova) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (prova && /CALCETTO-il-gioco\.html$/i.test(f)) f = prova;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

(async () => {
  const provaRel = arg('gioco', '');
  const partite = parseInt(arg('partite', '14'), 10);
  const srv = await servi(provaRel ? path.resolve(RADICE, provaRel) : '');
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const errori = []; pag.on('pageerror', e => errori.push(e.message));
  await pag.addInitScript(() => {
    let s = 20260803 >>> 0;
    const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => p() / 4294967296;
    window.__caso = { semina(n) { s = n >>> 0 || 1; } };
  });
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);

  const r = await pag.evaluate(async ([partite]) => {
    const t = window.__test;
    t.dismissSplash && t.dismissSplash();
    t.resetSave(); t.save.tutorialDone = 1;
    const righe = [];
    for (let i = 0; i < partite; i++) {
      window.__caso.semina((20260803 + i) >>> 0);
      const prima = t.save.coins | 0;
      t.startMatch(1, 1);
      t.setCpuVsCpu(true);
      let sim = 0;
      while (t.state !== 'end' && sim < 600) { t.simulate(10); sim += 10; }
      G.cpu[0] = false;
      const rew = applyMatchRewards();   // la funzione del conto
      const dopo = t.save.coins | 0;
      if (rew) righe.push({
        p: i, prima, dopo, vero: dopo - prima,
        gain: rew.gain, somma: rew.br.reduce((s, b) => s + b[1], 0),
        saldoDichiarato: rew.saldo,
        voci: rew.br.map(b => b[0] + '=' + b[1]).join(' · '),
      });
    }
    return righe;
  }, [partite]);

  await browser.close(); srv.chiudi();
  if (errori.length) { console.error('ECCEZIONI: ' + errori.join(' | ')); process.exit(1); }

  console.log('=== ' + (provaRel || 'CALCETTO-il-gioco.html') + ' — ' + r.length + ' partite ===');
  let storte = 0;
  for (const x of r) {
    const ok = x.vero === x.gain && x.gain === x.somma && x.saldoDichiarato === x.dopo;
    if (!ok) storte++;
    console.log('  p' + String(x.p).padStart(2) + '  righe=' + String(x.somma).padStart(4) +
      '  totale dichiarato=' + String(x.gain).padStart(4) +
      '  incasso VERO=' + String(x.vero).padStart(4) +
      '  saldo ' + x.prima + '->' + x.dopo + (ok ? '   ok' : '   << NON TORNA'));
    if (!ok) console.log('        voci: ' + x.voci);
  }
  console.log('  partite in cui il conto non torna: ' + storte + ' su ' + r.length);
})().catch(e => { console.error(e); process.exit(1); });
