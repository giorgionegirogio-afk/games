/* _crit-festa-dado.js — LA LEGGE SUI SORTEGGI, verificata dal critico
   con il proprio conto e il proprio rosso.
   Confronta A e B su tre taglie: sorteggi consumati, punteggio, e una
   IMPRONTA della partita (somma pesata di posizioni e stati, campionata
   ogni 30 fotogrammi) — cosi' una divergenza si vede anche se il conto
   dei dadi tornasse per caso.
   Poi costruisce il GIOCO BUGIARDO (un sorteggio in piu' per fotogramma)
   e pretende il rosso.
   uso: node strumenti/_crit-festa-dado.js */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i+1] && !process.argv[i+1].startsWith('--') ? process.argv[i+1] : d; };
const A = arg('a', 'fuori/_anim-terza-PRIMA.html'), B = arg('b', 'fuori/anim-terza.html');
const SEC = +arg('sec', 90);

function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(RADICE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

const CORSA = (taglia, sec) => `(async ([t,s])=>{
  window.__test.semina(20260827);
  window.__test.startMatch('cpu',1,{size:t});
  let h=0, n=0;
  const N=Math.round(s*60);
  for(let i=0;i<N;i++){
    window.__test.simulate(1/60);
    if(i%30===0){
      const P=window.__test.players, b=window.__test.ball;
      let v=(b.x*7.1+b.y*13.3+(b.z||0)*29.7);
      for(const p of P) v+= p.x*1.7+p.y*3.1+(p.ang||0)*5.3+(p.celeb||0)*11.9+(p.dive||0)*17.3;
      h=(h*31+Math.round(v*1000))%2147483647; n++;
    }
  }
  return {sorteggi:window.__test.sorteggi, score:window.__test.score.join('-'),
          scene:window.__test.state, impronta:h, campioni:n};
})([${taglia},${sec}])`;

async function apri(br, srv, file) {
  const ctx = await br.newContext({ viewport: { width: 915, height: 412 } });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:' + srv.porta + '/' + file.replace(/\\/g, '/'), { waitUntil: 'load' });
  await p.waitForFunction(() => window.__test && window.__test.state);
  await p.evaluate(() => { window.requestAnimationFrame = () => 0; });
  return p;
}

(async () => {
  /* il gioco bugiardo: un sorteggio in piu' per fotogramma di gioco */
  const bug = path.resolve(RADICE, 'fuori/_crit-bugiardo.html');
  const src = fs.readFileSync(path.resolve(RADICE, B), 'utf8');
  const ANC = 'function step(){';
  if (src.split(ANC).length - 1 !== 1) { console.error('ancoraggio del bugiardo non unico'); process.exit(1); }
  fs.writeFileSync(bug, src.replace(ANC, ANC + ' dado();'), 'utf8');

  const srv = await servi();
  const br = await chromium.launch();
  const pa = await apri(br, srv, A), pb = await apri(br, srv, B), pz = await apri(br, srv, 'fuori/_crit-bugiardo.html');
  console.log('=== LA LEGGE SUI SORTEGGI — ' + SEC + ' s per taglia, seme 20260827 ===');
  let tutto = true;
  for (const t of [5, 7, 11]) {
    const ra = await pa.evaluate(CORSA(t, SEC));
    const rb = await pb.evaluate(CORSA(t, SEC));
    const ok = ra.sorteggi === rb.sorteggi && ra.score === rb.score && ra.impronta === rb.impronta;
    tutto = tutto && ok;
    console.log('  taglia ' + String(t).padStart(2) + '  A: ' + ra.sorteggi + ' sorteggi, ' + ra.score + ', impronta ' + ra.impronta +
      '\n            B: ' + rb.sorteggi + ' sorteggi, ' + rb.score + ', impronta ' + rb.impronta + '   ' + (ok ? 'IDENTICI' : '*** DIVERSI ***'));
  }
  const rz = await pz.evaluate(CORSA(5, SEC));
  const ra5 = await pa.evaluate(CORSA(5, SEC));
  console.log('  ROSSO: il bugiardo (un dado() in piu\' per step) a taglia 5: ' + rz.sorteggi + ' sorteggi, ' + rz.score +
    ', impronta ' + rz.impronta + '   ' + (rz.sorteggi !== ra5.sorteggi || rz.impronta !== ra5.impronta ? 'ROSSO, come deve' : '*** IL BANCO NON SA FALLIRE ***'));
  console.log(tutto ? '\nVERDE: sorteggi, punteggi e impronte identici su tutte e tre le taglie.' : '\nROSSO.');
  await br.close(); srv.chiudi();
})();
