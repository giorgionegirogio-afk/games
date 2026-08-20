/* _x-l23-identico.js — verifica INDIPENDENTE della sola affermazione su
   cui poggia tutta la consegna: «finche' nessuno chiama, il gioco toppato
   e' identico al bit».
   E' anche l'unico guardiano dell'ancoraggio 10, che RISCRIVE codice
   esistente (il ciclo dello scansamento nel ramo dello smarcato di
   aiDecide): nessuno dei sei verdetti del cancello lo sorveglia.

   Metodo: partita CPU contro CPU a seme fisso, passo fisso 1/60, la
   stessa identica sequenza sui due file. A ogni fotogramma si prende
   un'impronta di TUTTO lo stato osservabile — pallone (x,y,z,vx,vy,vz,
   owner,passTo,crossTo), punteggio, uomo comandato, e per ogni giocatore
   (x,y,vx,vy,out,slide,charge,fiato) — e si confronta.

   uso: node _x-l23-identico.js --a CALCETTO-il-gioco.html --b fuori/l23.html
*/
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = 'C:/Users/Utenteee/Desktop/GitHub/games';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const A = path.resolve(arg('a', path.join(RADICE, 'CALCETTO-il-gioco.html')));
const B = path.resolve(arg('b', path.join(RADICE, 'fuori/l23.html')));
const SEC = +arg('sec', 60);
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.json': 'application/json' };

function servi(gioco) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (/CALCETTO-il-gioco\.html$/i.test(f)) f = gioco;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('no'); return; }
      res.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
function semeFisso(s0) {
  let s = s0 >>> 0 || 1;
  const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
  Math.random = () => p() / 4294967296;
}

async function traccia(br, porta, taglia, sec) {
  const ctx = await br.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(semeFisso, 20260820);
  await pag.goto('http://127.0.0.1:' + porta + '/CALCETTO-il-gioco.html', { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 60000 });
  const r = await pag.evaluate(cfg => {
    const t = window.__test, G = t.G;
    try { t.dismissSplash && t.dismissSplash(); } catch (e) {}
    try { t.setPaused(false); } catch (e) {}
    try { if (t.Tut && t.Tut.active && t.Tut.finish) t.Tut.finish(true); } catch (e) {}
    t.startMatch(1, 1, { size: cfg.taglia });
    for (let i = 0; i < 200 && G.scene !== 'play'; i++) t.simulate(0.1);
    t.setCpuVsCpu(true);
    const q = v => Math.round(v * 1e6) / 1e6;
    const righe = [];
    for (let f = 0; f < cfg.sec * 60; f++) {
      t.simulate(1 / 60);
      const b = G.ball;
      let r = [q(b.x), q(b.y), q(b.z), q(b.vx), q(b.vy), q(b.vz), b.owner, b.passTo, b.crossTo,
               G.score ? G.score.join('-') : '', G.ctrl.join('/'), G.scene].join(',');
      for (const p of G.players) r += '|' + [q(p.x), q(p.y), q(p.vx), q(p.vy), q(p.out), q(p.slide), q(p.charge), q(p.fiato)].join(',');
      righe.push(r);
    }
    return { righe, n: righe.length, taglia: t.taglia };
  }, { taglia, sec });
  await ctx.close();
  return r;
}

(async () => {
  const br = await chromium.launch({ headless: true });
  let totale = 0, diff = 0;
  for (const taglia of [5, 7, 11]) {
    const sa = await servi(A); const ra = await traccia(br, sa.porta, taglia, SEC); sa.chiudi();
    const sb = await servi(B); const rb = await traccia(br, sb.porta, taglia, SEC); sb.chiudi();
    let primo = -1, n = 0;
    const L = Math.min(ra.righe.length, rb.righe.length);
    for (let i = 0; i < L; i++) if (ra.righe[i] !== rb.righe[i]) { if (primo < 0) primo = i; n++; }
    totale += L; diff += n;
    console.log('taglia ' + taglia + ' (chiesta) / ' + ra.taglia + '-' + rb.taglia + ' (vera)  ·  ' + L + ' fotogrammi  ·  divergenze ' + n +
                (primo >= 0 ? '  ·  prima al fotogramma ' + primo : ''));
    if (primo >= 0) {
      console.log('   A: ' + ra.righe[primo].slice(0, 200));
      console.log('   B: ' + rb.righe[primo].slice(0, 200));
    }
  }
  console.log('TOTALE ' + totale + ' fotogrammi confrontati, ' + diff + ' divergenze');
  await br.close();
})().catch(e => { console.error('ESPLOSO: ' + (e && e.stack || e)); process.exit(2); });
