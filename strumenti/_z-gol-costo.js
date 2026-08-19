/* =====================================================================
   _z-gol-costo.js — QUANTO COSTA LA SCENA DEL GOL. ATTREZZO (prefisso _).

   PERCHE' ESISTE. prestazione.js misura la PARTITA: tre finestre da dieci
   secondi in cui la scena del gol vale meno di un fotogramma su venti, e
   su un banco che balla del 78% quella frazione sparisce nel rumore. La
   scena del gol pero' dura pochi secondi ed e' il momento in cui il gioco
   deve essere piu' fluido: e' proprio li' che il costo va misurato.

   COSA FA. Entra nella ripresa del gol, congela il tempo di simulazione e
   chiama __test.disegna() N volte di fila: sempre lo stesso fotogramma,
   quindi la cache del fondale e' calda e cio' che si misura e' il COSTO A
   FOTOGRAMMA della scena e nient'altro. I due file si alternano
   A/B/B/A dentro lo stesso minuto, come fa prestazione.js appaiato,
   perche' il rumore del banco colpisca tutt'e due allo stesso modo.

   MISURA ANCHE LA COTTURA, separatamente: il primo fotogramma dopo un
   cambio di campo e' quello che ricuoce il fondale (cielo, prato,
   tosatura, 570 figurine di tribuna, grana, luci). E' un costo che si
   paga una volta per campo, non a fotogramma, e va letto come tale.

   uso: node strumenti/_z-gol-costo.js A.html B.html [--n 240] [--giri 4]
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
function arg(n, d) {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : d;
}
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };

function servi(mappa) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const p = decodeURIComponent(req.url.split('?')[0]);
      let f = path.join(RADICE, p === '/' ? 'index.html' : p);
      if (/CALCETTO-il-gioco\.html$/i.test(f) && mappa.file) f = mappa.file;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('no'); return; }
      res.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

const N = +arg('n', 240);
const GIRI = +arg('giri', 4);
const [A, B] = process.argv.slice(2).filter(a => a.endsWith('.html'));
if (!A || !B) { console.error('uso: node strumenti/_z-gol-costo.js A.html B.html'); process.exit(2); }

async function misura(br, file, campi) {
  const srv = await servi({ file: path.resolve(file) });
  const pg = await br.newPage({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2 });
  await pg.addInitScript(() => {
    let s = 12345;
    Math.random = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  });
  await pg.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pg.waitForFunction(() => window.__test && window.__test.state, null, { timeout: 30000 });
  const r = await pg.evaluate(async ({ n, campi }) => {
    const T = window.__test;
    T.dismissSplash && T.dismissSplash();
    T.startMatch(1, 1);
    T.setCpuVsCpu && T.setCpuVsCpu(true);
    for (let i = 0; i < 90; i++) T.simulate(1 / 60);
    T.forceGoal(0);
    for (let i = 0; i < 100 && !T.G.ripresa; i++) T.simulate(1 / 60);
    if (!T.G.ripresa) return { errore: 'la ripresa non e\' partita' };
    T.G.ripresa.dur = 1e6;                    // la ripresa non scade sotto la misura
    for (let i = 0; i < 30; i++) T.disegna(); // scalda cache e JIT
    const t = [];
    for (let i = 0; i < n; i++) { const a = performance.now(); T.disegna(); t.push(performance.now() - a); }
    t.sort((x, y) => x - y);
    const med = t[t.length >> 1];
    const q = t.slice(Math.floor(t.length * 0.4), Math.ceil(t.length * 0.6));
    const tip = q.reduce((s, v) => s + v, 0) / q.length;
    /* LA COTTURA: cambiare campo invalida la chiave del fondale (nel file
       patchato) e il primo fotogramma dopo il cambio la ripaga. Si misura
       il primo fotogramma dopo ogni cambio, meno il fotogramma tipico. */
    const cot = [], ver = [];
    if (campi) {
      for (let k = 0; k < 6; k++) {
        T.G.fieldIdx = k % 3;
        const a = performance.now(); T.disegna(); cot.push(performance.now() - a);
        T.disegna();
      }
      cot.sort((x, y) => x - y);
      T.G.fieldIdx = 0; T.disegna();
      /* IL VERSO CHE SI ROVESCIA: e' quel che succede quando a segnare e'
         l'altra squadra. Con due caselle in cache si paga una cottura per
         verso e poi mai piu'; con una sola si paga a ogni alternanza. */
      for (let k = 0; k < 8; k++) {
        T.G.ripresa.ax = (k % 2) ? -1 : 1;
        const a = performance.now(); T.disegna(); ver.push(performance.now() - a);
      }
    }
    return { med, tip, p95: t[Math.floor(t.length * 0.95)], n: t.length,
             cot: cot.length ? cot[cot.length >> 1] : null,
             ver: ver.length ? ver.map(v => +v.toFixed(1)) : null };
  }, { n: N, campi });
  await pg.close();
  srv.chiudi();
  return r;
}

(async () => {
  const br = await chromium.launch();
  const rA = [], rB = [];
  console.log(`COSTO DELLA SCENA DEL GOL — ${N} fotogrammi per presa, ${GIRI} giri appaiati A/B/B/A`);
  console.log(`  A = ${A}\n  B = ${B}\n`);
  for (let g = 0; g < GIRI; g++) {
    const ordine = (g % 2) ? [['B', B], ['A', A], ['A', A], ['B', B]] : [['A', A], ['B', B], ['B', B], ['A', A]];
    for (const [nome, f] of ordine) {
      const r = await misura(br, f, false);
      if (r.errore) { console.error('  ' + r.errore); process.exit(1); }
      (nome === 'A' ? rA : rB).push(r.tip);
      console.log(`  giro ${g + 1} ${nome}: tipico ${r.tip.toFixed(2)} ms  (mediana ${r.med.toFixed(2)}, p95 ${r.p95.toFixed(2)})`);
    }
  }
  const med = a => { const b = a.slice().sort((x, y) => x - y); return b[b.length >> 1]; };
  const mA = med(rA), mB = med(rB);
  console.log(`\n  fotogramma tipico della scena del gol:  A ${mA.toFixed(2)} ms   B ${mB.toFixed(2)} ms   differenza ${(100 * (mB - mA) / mA >= 0 ? '+' : '')}${(100 * (mB - mA) / mA).toFixed(1)}%`);
  const disp = a => (Math.max(...a) - Math.min(...a)) / med(a) * 100;
  console.log(`  ballo fra repliche dello stesso file: A ${disp(rA).toFixed(1)}%  B ${disp(rB).toFixed(1)}%`);
  console.log(`  (differenze piu' piccole del ballo non vanno credute)`);

  const cA = await misura(br, A, true), cB = await misura(br, B, true);
  console.log(`\n  primo fotogramma dopo un cambio di campo (la COTTURA del fondale):`);
  console.log(`    A ${cA.cot.toFixed(1)} ms   B ${cB.cot.toFixed(1)} ms   (fotogramma tipico: A ${cA.tip.toFixed(2)}, B ${cB.tip.toFixed(2)})`);
  console.log(`  otto reti a marcatore alternato (il verso dell'obiettivo si rovescia ogni volta), ms per fotogramma:`);
  console.log(`    A ${cA.ver.join(' ')}\n    B ${cB.ver.join(' ')}`);
  await br.close();
})();
