/* =====================================================================
   _c3-sorteggi.js — LA LEGGE SUI SORTEGGI, verificata invece che
   dedotta: il conto delle chiamate a dado() a fine partita, CPU contro
   CPU, deve essere lo STESSO numero prima e dopo la toppa.

   Non basta che i tabellini coincidano: due partite possono finire
   uguali avendo speso il generatore in modo diverso, e la divergenza si
   vedrebbe solo alla partita dopo. Qui si legge il contatore
   (__test.sorteggi) alla fine di ogni partita, insieme al punteggio.

   uso: node strumenti/_c3-sorteggi.js --a fuori/cmd-terza-base.html --b fuori/cmd-terza.html
   ===================================================================== */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const A = path.resolve(arg('a', RADICE + '/fuori/cmd-terza-base.html'));
const B = path.resolve(arg('b', RADICE + '/fuori/cmd-terza.html'));
const N = +arg('partite', 20);
const SEME0 = +arg('seme', 20260803);
const TAGLIE = String(arg('taglie', '5,7,11')).split(',').map(Number);
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png' };

function servi(gioco) {
  return new Promise(ok => {
    const s = http.createServer((rq, rs) => {
      const u = decodeURIComponent(rq.url.split('?')[0]);
      let f = path.join(RADICE, u === '/' ? 'index.html' : u);
      if (/CALCETTO-il-gioco\.html$/i.test(f)) f = gioco;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { rs.writeHead(404); rs.end(); return; }
      rs.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(rs);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

const SONDA = (cfg) => {
  const t = window.__test;
  const out = [];
  for (const taglia of cfg.taglie) {
    for (let k = 0; k < cfg.n; k++) {
      const seme = cfg.seme0 + k;
      t.semina(seme);
      const s0 = t.sorteggi;
      t.setCpuVsCpu(true);
      t.startMatch(1, 1, { size: taglia });
      for (let g = 0; g < 400; g++) { t.simulate(1); if (t.state === 'end') break; }
      out.push({ taglia, seme, sorteggi: t.sorteggi - s0, score: t.score.join('-'), scena: t.state });
    }
  }
  return out;
};

(async () => {
  const risultati = {};
  for (const [nome, gioco] of [['A', A], ['B', B]]) {
    const srv = await servi(gioco);
    const br = await chromium.launch();
    const ctx = await br.newContext({ viewport: { width: 845, height: 402 }, deviceScaleFactor: 1 });
    const pag = await ctx.newPage();
    pag.on('pageerror', e => console.error('  ! ' + e.message));
    await pag.goto('http://127.0.0.1:' + srv.porta + '/CALCETTO-il-gioco.html', { waitUntil: 'load' });
    await pag.evaluate(async () => { try { window.__test.dismissSplash(); } catch (e) { } await document.fonts.ready; });
    await new Promise(r => setTimeout(r, 900));
    /* la quiete prima del seme: la cottura del manto tira decine di
       migliaia di sorteggi e non si deve mescolare al conto */
    await pag.evaluate(async () => {
      const t = window.__test; let fermi = 0;
      for (let g = 0; g < 20 && fermi < 2; g++) { const a = t.sorteggi; await new Promise(r => setTimeout(r, 300)); fermi = (t.sorteggi === a) ? fermi + 1 : 0; }
    });
    risultati[nome] = await pag.evaluate(`(${SONDA})(${JSON.stringify({ n: N, seme0: SEME0, taglie: TAGLIE })})`);
    await br.close(); srv.chiudi();
  }
  const a = risultati.A, b = risultati.B;
  let diversi = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i].sorteggi !== b[i].sorteggi || a[i].score !== b[i].score || a[i].scena !== b[i].scena) {
      diversi++;
      if (diversi <= 5) console.log('  DIVERSO  taglia ' + a[i].taglia + ' seme ' + a[i].seme
        + '  sorteggi ' + a[i].sorteggi + ' -> ' + b[i].sorteggi
        + '  punteggio ' + a[i].score + ' -> ' + b[i].score);
    }
  }
  const tot = a.reduce((s, r) => s + r.sorteggi, 0);
  console.log('\n=== IL CONTO DEI SORTEGGI ===');
  console.log('  ' + path.basename(A) + '  contro  ' + path.basename(B));
  console.log('  ' + a.length + ' partite CPU contro CPU (taglie ' + TAGLIE.join(',') + ', semi ' + SEME0 + '..' + (SEME0 + N - 1) + ')');
  console.log('  sorteggi spesi in totale: ' + tot + ' contro ' + b.reduce((s, r) => s + r.sorteggi, 0));
  console.log('  partite con un conto diverso: ' + diversi);
  console.log(diversi === 0 ? '\nVERDE: il conto delle chiamate a dado() non e\' cambiato in nessuna partita.'
                            : '\nROSSO: il conto dei sorteggi e\' cambiato.');
  process.exit(diversi === 0 ? 0 : 1);
})();
