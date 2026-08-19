/* =====================================================================
   MISURA APPAIATA — due file, stesso banco, stesso minuto.

   Perche' esiste. prestazione.js confronta il gioco di oggi con un
   RIFERIMENTO conservato su disco (16,7 ms), preso quando il banco era
   libero. Oggi il banco non lo e': il committente ha un server di
   sviluppo Next.js acceso che tiene la CPU all'80%. In quelle condizioni
   il confronto col riferimento accusa il gioco di un costo che non ha —
   ed e' esattamente la TERZA AVVERTENZA scritta in testa a prestazione.js
   ("16,7 -> 33,3 ms, +99%" e' la firma del banco occupato, non del gioco).

   La cura non e' aspettare un banco libero che non arrivera': e' misurare
   i DUE file uno accanto all'altro, alternati, cosi' che il rumore del
   banco colpisca entrambi allo stesso modo e la DIFFERENZA resti onesta.

   COME DIMOSTRA DI NON MENTIRE (obbligo di casa, pagato dieci volte):
     --prova-uguale   misura lo STESSO file contro se' stesso: deve dire
                      una differenza vicina a zero. Se dice altro, il
                      rumore del banco e' piu' grande del segnale e
                      nessun numero di questo attrezzo va creduto.
     --prova-zavorra  misura un file contro lo stesso file con dentro una
                      zavorra dichiarata (un ciclo che brucia N ms per
                      fotogramma): deve VEDERLA. Se non la vede, e' cieco.

   uso:
     node _appaiata.js A.html B.html [--freno 4] [--sec 8] [--giri 3]
     node _appaiata.js A.html --prova-uguale
     node _appaiata.js A.html --prova-zavorra 8
   ===================================================================== */
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

function arg(n, d) {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
}

const FRENO = +arg('freno', 4);
const SEC = +arg('sec', 8);
const GIRI = +arg('giri', 3);
const TAGLIA = +arg('taglia', 5);

/* La zavorra: un lavoro dichiarato dentro il giro di disegno del gioco.
   Non tocca la logica, brucia solo tempo — cosi' l'attrezzo puo' provare
   di saperlo vedere. */
function conZavorra(html, ms) {
  const iniezione = `<script>(function(){
    var R = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = function(f){ return R(function(t){
      var fine = performance.now() + ${ms}; var x = 0;
      while (performance.now() < fine) x += Math.sqrt(x + 1);
      window.__zavorra = x; return f(t);
    }); };
  })();</script>`;
  return html.replace('</body>', iniezione + '</body>');
}

function servi(dir) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(dir, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(dir) || !fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* una finestra di misura su un file: stessa procedura di prestazione.js,
   stesso schermo, stesso freno, stessa partita a semi fissi */
async function misura(browser, porta, nome) {
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const cdp = await ctx.newCDPSession(pag);
  await pag.goto(`http://127.0.0.1:${porta}/${nome}`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 30000 });
  await pag.waitForTimeout(600);
  await pag.evaluate((tg) => {
    const t = window.__test;
    t.dismissSplash && t.dismissSplash();
    if (tg === 5) t.startMatch(1, 1); else t.startMatch(1, 1, { size: tg });
    t.setCpuVsCpu(true);
  }, TAGLIA);
  await pag.waitForTimeout(1200);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: FRENO });
  const tempi = await pag.evaluate(async (secondi) => {
    const t = []; let ultimo = performance.now();
    return await new Promise(fine => {
      const inizio = ultimo;
      function giro(ora) {
        t.push(ora - ultimo); ultimo = ora;
        if (ora - inizio < secondi * 1000) requestAnimationFrame(giro); else fine(t.slice(3));
      }
      requestAnimationFrame(giro);
    });
  }, SEC);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  await ctx.close();
  if (!tempi.length) throw new Error('nessun fotogramma misurato su ' + nome);
  const ord = [...tempi].sort((a, b) => a - b);
  const perc = q => ord[Math.min(ord.length - 1, Math.floor(ord.length * q))];
  return {
    n: tempi.length,
    media: tempi.reduce((a, b) => a + b, 0) / tempi.length,
    meta: perc(0.5),
    p95: perc(0.95),
  };
}

const centrale = a => [...a].sort((x, y) => x - y)[(a.length - 1) >> 1];

(async () => {
  const liberi = process.argv.slice(2).filter(x => !x.startsWith('--') && /\.html$/i.test(x));
  const provaUguale = process.argv.includes('--prova-uguale');
  const provaZavorra = process.argv.includes('--prova-zavorra');
  const msZavorra = +arg('prova-zavorra', 8);

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'appaiata-'));
  let etichettaA, etichettaB;

  if (provaUguale) {
    if (liberi.length < 1) { console.error('serve un file'); process.exit(1); }
    fs.copyFileSync(liberi[0], path.join(dir, 'A.html'));
    fs.copyFileSync(liberi[0], path.join(dir, 'B.html'));
    etichettaA = 'A = ' + path.basename(liberi[0]);
    etichettaB = 'B = LO STESSO FILE (prova di onesta\')';
  } else if (provaZavorra) {
    if (liberi.length < 1) { console.error('serve un file'); process.exit(1); }
    const html = fs.readFileSync(liberi[0], 'utf8');
    fs.writeFileSync(path.join(dir, 'A.html'), html);
    fs.writeFileSync(path.join(dir, 'B.html'), conZavorra(html, msZavorra));
    etichettaA = 'A = ' + path.basename(liberi[0]);
    etichettaB = `B = lo stesso file + ZAVORRA dichiarata di ${msZavorra} ms per fotogramma`;
  } else {
    if (liberi.length < 2) { console.error('servono due file .html'); process.exit(1); }
    fs.copyFileSync(liberi[0], path.join(dir, 'A.html'));
    fs.copyFileSync(liberi[1], path.join(dir, 'B.html'));
    etichettaA = 'A = ' + liberi[0];
    etichettaB = 'B = ' + liberi[1];
  }

  console.log(`\nMISURA APPAIATA — freno ${FRENO}x, ${GIRI} giri alternati da ${SEC} s, partita ${TAGLIA} contro ${TAGLIA}`);
  console.log(`  ${etichettaA}`);
  console.log(`  ${etichettaB}\n`);

  const srv = await servi(dir);
  const browser = await chromium.launch();
  const A = [], B = [];
  for (let g = 0; g < GIRI; g++) {
    /* alternati, e l'ordine si inverte a giri dispari: se il banco va
       peggiorando durante la corsa, la deriva non si scarica tutta su B */
    const primo = g % 2 === 0 ? 'A' : 'B';
    for (const q of [primo, primo === 'A' ? 'B' : 'A']) {
      const m = await misura(browser, srv.porta, q + '.html');
      (q === 'A' ? A : B).push(m);
      console.log(`  giro ${g + 1} ${q}: ${String(m.n).padStart(3)} fotogrammi — media ${m.media.toFixed(1)} ms, meta' ${m.meta.toFixed(1)}, p95 ${m.p95.toFixed(1)}`);
    }
  }
  await browser.close(); srv.chiudi();
  fs.rmSync(dir, { recursive: true, force: true });

  console.log('\n  mediana dei giri');
  let peggiore = 0;
  for (const voce of ['media', 'meta', 'p95']) {
    const a = centrale(A.map(x => x[voce]));
    const b = centrale(B.map(x => x[voce]));
    const d = (b - a) / a * 100;
    if (d > peggiore) peggiore = d;
    console.log(`  ${voce.padEnd(6)}  A ${a.toFixed(1)} ms   B ${b.toFixed(1)} ms   differenza ${d >= 0 ? '+' : ''}${d.toFixed(1)}%`);
  }
  console.log('');
  if (provaUguale) {
    const ok = Math.abs(peggiore) < 10;
    console.log(ok
      ? `  ONESTO: lo stesso file contro se' stesso da' al massimo ${peggiore.toFixed(1)}% — sotto il 10%, il rumore del banco non copre il segnale.`
      : `  INAFFIDABILE: lo stesso file contro se' stesso da' ${peggiore.toFixed(1)}%. Il rumore e' piu' grande del segnale: non credere a nessun numero di questo attrezzo finche' il banco non si calma.`);
    process.exit(ok ? 0 : 1);
  }
  if (provaZavorra) {
    const ok = peggiore > 20;
    console.log(ok
      ? `  VEDENTE: la zavorra di ${msZavorra} ms si vede come +${peggiore.toFixed(1)}%.`
      : `  CIECO: la zavorra di ${msZavorra} ms produce solo ${peggiore.toFixed(1)}%. L'attrezzo non sa vedere un rallentamento vero.`);
    process.exit(ok ? 0 : 1);
  }
  console.log(`  la voce che cresce di piu': ${peggiore >= 0 ? '+' : ''}${peggiore.toFixed(1)}%`);
})();
