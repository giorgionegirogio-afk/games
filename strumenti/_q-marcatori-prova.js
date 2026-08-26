/* prova: dopo N partite, i gol nella rosa salvata sono distribuiti fra piu'
   giocatori o stanno tutti sull'indice 1? Confronta due file di gioco. */
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
    let golTot = 0;
    const registro = [];
    for (let i = 0; i < partite; i++) {
      window.__caso.semina((20260803 + i) >>> 0);
      /* si gioca CPU contro CPU per avere reti da attribuire, poi si
         spegne il flag e si chiama a mano la funzione che accredita:
         faiCrescereRosa esce subito se G.cpu[0] e' acceso, e la cosa da
         misurare e' proprio lei. */
      t.startMatch(1, 1);
      t.setCpuVsCpu(true);
      let sim = 0;
      while (t.state !== 'end' && sim < 600) { t.simulate(10); sim += 10; }
      G.cpu[0] = false;
      faiCrescereRosa();
      registro.push({ p: i, score: [G.score[0], G.score[1]], log: (G.golLog || []).map(g => ({ team: g.team, auto: !!g.auto, idx: g.idx === undefined ? null : g.idx, chi: g.chi })) });
    }
    const rosa = (t.save.rosa || []).map((r, i) => ({ i, nome: r.nome, gol: r.gol | 0, partite: r.partite | 0 }));
    return { rosa, registro, coins: t.save.coins };
  }, [partite]);

  await browser.close(); srv.chiudi();
  if (errori.length) { console.error('ECCEZIONI: ' + errori.join(' | ')); process.exit(1); }

  console.log('=== ' + (provaRel || 'CALCETTO-il-gioco.html') + ' — ' + partite + ' partite ===');
  const conGol = r.rosa.filter(x => x.gol > 0);
  const tot = r.rosa.reduce((s, x) => s + x.gol, 0);
  console.log('  gol in rosa: ' + tot + ' su ' + conGol.length + ' giocatori diversi (rosa di ' + r.rosa.length + ')');
  for (const x of r.rosa) if (x.gol) console.log('    [' + x.i + '] ' + (x.nome || '?').padEnd(18) + x.gol + ' gol');
  const attesi = r.registro.reduce((s, p) => s + p.log.filter(g => g.team === 0 && !g.auto).length, 0);
  const segnati = r.registro.reduce((s, p) => s + p.score[0], 0);
  console.log('  reti squadra 0 sul tabellone: ' + segnati + ' | nel registro (non autoreti): ' + attesi);
  const senzaIdx = r.registro.reduce((s, p) => s + p.log.filter(g => g.idx === null || g.idx === undefined).length, 0);
  console.log('  reti nel registro senza indice: ' + senzaIdx);
})().catch(e => { console.error(e); process.exit(1); });
