/* =====================================================================
   _z-traccia-critica.js — LO STESSO CONFRONTO DI fuori/_traccia-l12.js,
   MA RIPETIBILE.

   Il tornello dell'autore entra in partita con un ciclo che si ferma
   «quando la scena e' play»: quanti passi servano non lo controlla
   nessuno, e i due file possono percio' partire da due istanti diversi.
   Misurato: su quattro corse dello strumento dell'autore, DUE dicono
   IDENTICHE e DUE dicono DIVERSE, sempre con la stessa firma (un
   giocatore gia' in moto al campione 0 in un file e fermo nell'altro).

   Qui l'ingresso in partita e' a PASSI FISSI — lo stesso numero per
   tutti i file, sempre — e prima del confronto vero c'e' il CONTROLLO
   DI RISOLUZIONE: lo stesso file contro se' stesso, in due pagine
   diverse. Se quello non e' identico, lo strumento non puo' dire niente
   sugli altri e lo dichiara.

   uso: node strumenti/_z-traccia-critica.js
   ===================================================================== */
const fs = require('fs'), path = require('path'), http = require('http'), crypto = require('crypto');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.json': 'application/json' };

function servi(GIOCO) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (/CALCETTO-il-gioco\.html$/i.test(f)) f = GIOCO;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('no'); return; }
      res.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
function banco() {
  const P = 1000 / 60; let t = 0, coda = [];
  window.requestAnimationFrame = cb => { coda.push(cb); return coda.length; };
  window.cancelAnimationFrame = () => {};
  try { performance.now = () => t; } catch (e) {}
  window.__banco = { passo(n) { for (let i = 0; i < n; i++) { const c = coda; coda = []; t += P; for (const f of c) { try { f(t); } catch (e) {} } } return t; } };
}

async function traccia(GIOCO) {
  const srv = await servi(GIOCO);
  const br = await chromium.launch({ headless: true });
  const ctx = await br.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(s => { let x = s >>> 0 || 1; const p = () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x >>> 0; }; Math.random = () => p() / 4294967296; }, 20260819);
  await pag.addInitScript(banco);
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 25000 });
  await pag.evaluate(() => window.__banco.passo(6));
  const r = await pag.evaluate(() => {
    const t = window.__test, G = t.G;
    try { t.dismissSplash && t.dismissSplash(); } catch (e) {}
    t.setPaused && t.setPaused(false);
    try { if (t.Tut && t.Tut.active && t.Tut.finish) t.Tut.finish(true); } catch (e) {}
    /* INGRESSO A PASSI FISSI: sempre la stessa partita, sempre lo stesso
       numero di passi, qualunque scena si attraversi. Non c'e' nessun
       «finche'»: e' il «finche'» che rende cieco il confronto. */
    t.startMatch(1, 1, { size: 5 });
    for (let i = 0; i < 600; i++) t.simulate(1 / 60);
    const scenaIniziale = G.scene;
    const righe = [];
    const f = v => (Math.round(v * 1e6) / 1e6).toString();
    for (let k = 0; k < 1800; k++) {
      window.__banco.passo(1);
      if (k % 30) continue;
      const b = G.ball;
      righe.push(k + '|' + G.scene + '|' + G.score.join(',') + '|' + f(b.x) + ',' + f(b.y) + ',' + f(b.z) + ',' + f(b.vx) + ',' + f(b.vy) + ',' + b.owner + '|' +
        G.players.map(p => f(p.x) + ',' + f(p.y) + ',' + f(p.vx) + ',' + f(p.vy) + ',' + f(p.fx) + ',' + f(p.fy) + ',' + f(p.slide) + ',' + f(p.charge)).join(';'));
    }
    return { righe, scenaIniziale };
  });
  await br.close(); srv.chiudi();
  return r;
}
const h = r => crypto.createHash('md5').update(r.join('\n')).digest('hex').slice(0, 12);
function confronta(nome, a, b) {
  let d = -1;
  for (let i = 0; i < Math.min(a.righe.length, b.righe.length); i++) if (a.righe[i] !== b.righe[i]) { d = i; break; }
  console.log('  ' + nome + ': ' + (d < 0 ? 'IDENTICHE' : 'DIVERSE dal campione ' + d + ' (fotogramma ' + d * 30 + ')') +
    '   md5 ' + h(a.righe) + ' / ' + h(b.righe) + '   scena all\'avvio ' + a.scenaIniziale + ' / ' + b.scenaIniziale);
  return d < 0;
}
(async () => {
  const A = path.resolve(RADICE, 'CALCETTO-il-gioco.html');
  const B = path.resolve(RADICE, 'fuori/l12.html');
  console.log('=== traccia ripetibile: 1800 fotogrammi, seme 20260819, nessun dito ===');
  console.log('CONTROLLO DI RISOLUZIONE (lo stesso file contro se stesso, due pagine):');
  const a1 = await traccia(A), a2 = await traccia(A);
  const ris = confronta('base vs base ', a1, a2);
  const b1 = await traccia(B), b2 = await traccia(B);
  const ris2 = confronta('toppa vs toppa', b1, b2);
  console.log('CONFRONTO VERO:');
  const v1 = confronta('base vs toppa (prima coppia) ', a1, b1);
  const v2 = confronta('base vs toppa (seconda coppia)', a2, b2);
  if (!ris || !ris2) { console.log('LO STRUMENTO NON PUO\' DIRE NIENTE: non e\' ripetibile nemmeno su se stesso.'); process.exit(3); }
  console.log(v1 && v2 ? 'ESITO: nessuna differenza, e lo strumento e\' ripetibile.' : 'ESITO: DIFFERENZA VERA fra i due file.');
  process.exit(v1 && v2 ? 0 : 1);
})().catch(e => { console.error('FALLITO', e); process.exit(2); });
