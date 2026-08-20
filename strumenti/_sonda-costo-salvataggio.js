/* sonda: quanto costa UNA scrittura del salvataggio. Non e' un cancello.
   Misura il corpo di persistSave (JSON.stringify di SAVE + setItem), che
   e' tutto cio' che quella funzione fa oltre a due assegnamenti. */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');
const srv = http.createServer((req, res) => {
  const f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(RADICE) || !fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  fs.createReadStream(f).pipe(res);
});
srv.listen(0, '127.0.0.1', async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('http://127.0.0.1:' + srv.address().port + '/CALCETTO-il-gioco.html', { waitUntil: 'load' });
  await p.waitForFunction('window.__test !== undefined', null, { timeout: 30000 });
  const r = await p.evaluate(() => {
    const t = window.__test;
    t.dismissSplash && t.dismissSplash();
    t.startMatch(1, 1); t.simulate(6); t.forceWinMatch();   // un salvataggio realistico, non vergine
    const k = t.saveKey, S = t.save, v = [];
    for (let i = 0; i < 200; i++) {
      const a = performance.now();
      localStorage.setItem(k, JSON.stringify(S));
      v.push(performance.now() - a);
    }
    v.sort((x, y) => x - y);
    return { byte: JSON.stringify(S).length, mediana: v[100], p90: v[180], max: v[199] };
  });
  console.log('salvataggio di ' + r.byte + ' byte — mediana ' + r.mediana.toFixed(3) +
    ' ms, p90 ' + r.p90.toFixed(3) + ' ms, massimo ' + r.max.toFixed(3) + ' ms (200 scritture)');
  await b.close(); srv.close();
});
