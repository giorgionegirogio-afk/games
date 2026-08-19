/* _sil.js — silhouette.js con il FILE come argomento: serve a confrontare
   la base (HEAD) col lavoro di oggi sullo stesso banco. Non e' un cancello,
   e' una lente: stampa la stessa tabella di strumenti/silhouette.js.
   uso: node _sil.js [file.html] [--tutti] */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = __dirname;
const FILE = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'CALCETTO-il-gioco.html';
function servi() {
  return new Promise(ok => {
    const s = http.createServer((rq, rs) => {
      const u = decodeURIComponent(rq.url.split('?')[0]);
      const f = path.join(RADICE, u === '/' ? 'index.html' : u);
      fs.readFile(f, (e, d) => {
        if (e) { rs.writeHead(404); rs.end('no'); return; }
        rs.writeHead(200, { 'Content-Type': (f.endsWith('.html') ? 'text/html' : 'text/javascript') + '; charset=utf-8', 'Cache-Control': 'no-store' });
        rs.end(d);
      });
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  const pg = await br.newPage();
  const righe = [];
  pg.on('console', m => righe.push(m.text()));
  pg.on('pageerror', e => righe.push('ERRORE ' + e.message));
  await pg.goto(`http://127.0.0.1:${srv.porta}/${FILE}?banco=silhouette&t=${Date.now()}`);
  await pg.waitForTimeout(4000);
  await br.close(); srv.chiudi();
  const riga = righe.find(r => r.startsWith('[silhouette] '));
  if (!riga) { console.log('MUTO'); righe.slice(0, 10).forEach(r => console.log('  ' + r)); process.exit(1); }
  if (riga.includes('fallito')) { console.log(riga); process.exit(1); }
  const d = JSON.parse(riga.slice(13));
  console.log('== ' + FILE + ' ==');
  for (const f of d.fig) {
    const male = !(f.ok.inchiostro && f.ok.forma && f.ok.masse && f.ok.arti);
    console.log(`  ${male ? 'X ' : '  '}${f.nome.padEnd(22)} inch ${f.inchiostro.toFixed(3)}${f.ok.inchiostro ? ' ' : '!'} forma ${f.forma.toFixed(2)}${f.ok.forma ? ' ' : '!'} masse ${f.masse}${f.ok.masse ? ' ' : '!'} arti ${f.arti}${f.ok.arti ? '' : '!'} box ${f.bw}x${f.bh}`);
  }
  console.log('  distanza ' + d.distanza + ' (' + d.coppia + ')  giri fuori misura ' + d.nGiri + '/120');
  if (process.argv.includes('--tutti')) for (const g of d.giri) console.log(`     corp ${g.corp} yaw ${String(g.yaw).padStart(4)} ${g.nome.padEnd(22)} inch ${g.inchiostro} forma ${g.forma} masse ${g.masse} arti ${g.arti} box ${g.bw}x${g.bh}`);
  if (process.argv.includes('--profgiri')) for (const g of d.giri) if (g.prof) console.log('  corp ' + g.corp + ' yaw ' + g.yaw + ' ' + g.nome + ' ' + g.bw + 'x' + g.bh + ' masse ' + g.masse + '\n     ' + g.prof.join(' '));
  if (process.argv.includes('--prof')) for (const f of d.fig) console.log('\n  ' + f.nome + ' ' + f.bw + 'x' + f.bh + '\n     ' + (f.prof || []).join(' '));
})();
