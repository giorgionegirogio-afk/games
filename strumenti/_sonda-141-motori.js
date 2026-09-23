/* =====================================================================
   _sonda-141-motori.js — DOVE, esattamente, i tre motori si dividono.
   Sonda diagnostica usa-e-getta (voce #141, compito 1). Non e' un
   cancello: non ha soglie e non esce rosso. Serve a non scrivere «i
   motori divergono» senza saper dire per colpa di quale funzione.

   Tre domande:
     1) QUALI trascendenti differiscono, funzione per funzione, bit per bit
     2) A CHE TICK il conto dei sorteggi si divide
     3) SE SI RIMETTE A POSTO la funzione colpevole, i motori convergono?
        (Math.hypot riscritto come Math.sqrt(x*x+y*y): sqrt e' l'unica
        radice che IEEE-754 obbliga a essere correttamente arrotondata,
        quindi la riscrittura e' identica in tutti i motori PER NORMA.)
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const playwright = require('playwright');
const RADICE = path.resolve(__dirname, '..');
const MOTORI = ['chromium', 'webkit', 'firefox'];
const SEME = 20260923;

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

const FUNZIONI = `(() => {
  const bit = x => { const f=new Float64Array(1); f[0]=x;
                     return new BigUint64Array(f.buffer)[0].toString(16); };
  const V = []; for(let i=1;i<=200;i++) V.push(i*0.7310127 + 0.13);
  const F = {
    hypot:  v => Math.hypot(v, v*1.7),
    pow:    v => Math.pow(0.35, v*0.0166667*3.2),
    sin:    v => Math.sin(v),
    cos:    v => Math.cos(v),
    tan:    v => Math.tan(v),
    atan2:  v => Math.atan2(v, v*0.37-1.1),
    sqrt:   v => Math.sqrt(v),
    exp:    v => Math.exp(-v*0.1),
    log:    v => Math.log(v+1),
    cbrt:   v => Math.cbrt(v),
    asin:   v => Math.asin(1/(v+1)),
    acos:   v => Math.acos(1/(v+1)),
    atan:   v => Math.atan(v),
    sinh:   v => Math.sinh(v*0.01),
    'x*x+y*y': v => Math.sqrt(v*v + (v*1.7)*(v*1.7)),
  };
  const out = {};
  for(const k in F) out[k] = V.map(v => bit(F[k](v))).join(' ');
  return out;
})()`;

const PER_TICK = `((seme, n, toppa) => {
  const t = window.__test;
  if(toppa) Math.hypot = (x,y) => Math.sqrt(x*x + y*y);
  t.semina(seme);
  t.startMatch(1, 1, undefined);
  t.setCpuVsCpu(true);
  const s = [], imp = [];
  for(let i=0;i<n;i++){
    t.simulate(1/60);
    s.push(t.sorteggi);
    const b = G.ball;
    imp.push([Math.round(b.x*1e6), Math.round(b.y*1e6), Math.round(b.vx*1e6), Math.round(b.vy*1e6),
              G.players.map(p=>Math.round(p.x*1e6)+':'+Math.round(p.y*1e6)).join('|')].join(','));
  }
  return { s, imp, fine: t.sorteggi };
})`;

(async () => {
  const srv = await servi();
  const apri = async nome => {
    const b = await playwright[nome].launch();
    const c = await b.newContext({ viewport: { width: 915, height: 412 }, hasTouch: true, locale: 'it-IT' });
    const p = await c.newPage();
    await p.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await p.waitForFunction('window.__test !== undefined', null, { timeout: 40000 });
    await p.evaluate(() => { window.requestAnimationFrame = () => 0; });
    await p.waitForTimeout(200);
    await p.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); });
    return { nome, b, p };
  };
  const M = [];
  for (const n of MOTORI) M.push(await apri(n));

  console.log('=== 1) QUALI TRASCENDENTI DIFFERISCONO (200 valori, bit per bit) ===\n');
  const fn = {};
  for (const m of M) fn[m.nome] = await m.p.evaluate(F => new Function('return ' + F)(), FUNZIONI);
  const chiavi = Object.keys(fn[MOTORI[0]]);
  for (const k of chiavi) {
    const a = fn['chromium'][k].split(' ');
    const righe = [];
    for (const n of ['webkit', 'firefox']) {
      const b = fn[n][k].split(' ');
      let d = 0, primo = -1;
      for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) { d++; if (primo < 0) primo = i; }
      righe.push(n + ': ' + d + '/' + a.length + (d ? ' (primo @' + primo + ' ' + a[primo] + ' vs ' + b[primo] + ')' : ''));
    }
    const wkFf = fn['webkit'][k] === fn['firefox'][k];
    console.log('  ' + k.padEnd(10) + ' chromium vs ' + righe.join(' | ') + '   [webkit==firefox: ' + (wkFf ? 'SI' : 'NO') + ']');
  }

  for (const toppa of [false, true]) {
    console.log('\n=== ' + (toppa ? '3) CON Math.hypot RISCRITTO come sqrt(x*x+y*y) IN TUTTI E TRE'
                                   : '2) COM\'E\' OGGI') + ' — primo tick di scarto ===\n');
    const r = {};
    for (const m of M) r[m.nome] = await m.p.evaluate(([P, s, n, tp]) => new Function('return ' + P)()(s, n, tp),
                                                      [PER_TICK, SEME, 600, toppa]);
    for (const n of ['webkit', 'firefox']) {
      const a = r['chromium'], b = r[n];
      let tS = -1, tI = -1;
      for (let i = 0; i < a.s.length; i++) { if (a.s[i] !== b.s[i]) { tS = i; break; } }
      for (let i = 0; i < a.imp.length; i++) { if (a.imp[i] !== b.imp[i]) { tI = i; break; } }
      console.log('  chromium vs ' + n.padEnd(8) +
        ' sorteggi divergono al tick ' + (tS < 0 ? 'MAI' : tS) +
        ' · stato al tick ' + (tI < 0 ? 'MAI' : tI) +
        ' · sorteggi finali ' + a.fine + ' vs ' + b.fine);
    }
    const wf = r['webkit'], ff = r['firefox'];
    let t2 = -1; for (let i = 0; i < wf.imp.length; i++) if (wf.imp[i] !== ff.imp[i]) { t2 = i; break; }
    console.log('  webkit   vs firefox  stato al tick ' + (t2 < 0 ? 'MAI' : t2) +
      ' · sorteggi finali ' + wf.fine + ' vs ' + ff.fine);
  }

  for (const m of M) await m.b.close();
  srv.chiudi();
})().catch(e => { console.error('sonda esplosa: ' + e.message); process.exit(2); });
