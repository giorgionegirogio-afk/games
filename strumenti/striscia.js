/* =====================================================================
   STRISCIA — guarda il movimento, non la posa.

   Tutto il giudizio dato finora e' stato dato su fotogrammi fermi, e su
   un fermo immagine l'animazione non esiste: una corsa senza passo, un
   tiro senza caricamento, un tuffo senza anticipo sembrano identici a
   una figura ben disegnata. Ma e' esattamente li' che si vede la
   differenza fra un gioco fatto in casa e uno di mestiere.

   Questo strumento prende una scena, fa avanzare il gioco a passo fisso
   e monta i fotogrammi in una striscia sola, con il tempo scritto sotto
   ciascuno: chi guarda vede il movimento distendersi.

   uso:
     node strumenti/striscia.js --scena calcetto/azione --out s.png
     node strumenti/striscia.js --scena calcetto/gol --n 12 --passo 0.06
     node strumenti/striscia.js --scena calcetto/rigori --ritaglio 0.45,0.2,0.35,0.6
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png' };

function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(RADICE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

function arg(n, d) {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
}

/* le pose: che partita mettere in scena prima di cominciare a montare */
const POSE = {
  'calcetto/azione': `t.startMatch(1,1); t.setCpuVsCpu(true); t.simulate(5);`,
  'calcetto/kickoff': `t.startMatch(1,1); t.setCpuVsCpu(true);`,
  'calcetto/gol': `t.startMatch(1,1); t.setCpuVsCpu(true); t.simulate(2); t.forceGoal(0);`,
  'calcetto/tiro': `t.startMatch(1,1); t.setCpuVsCpu(true); t.simulate(9);`,
  'calcetto/rigori': `t.startMatch(1,1); t.rigori && t.rigori();`,
  'calcetto/moviola': `t.startMatch(1,1); t.setCpuVsCpu(true); t.simulate(3); t.forceGoal(0); t.simulate(2.2);`,
  'calcetto/tarda': `t.startMatch(1,1); t.setCpuVsCpu(true); t.simulate(30);`,
};

(async () => {
  const scena = arg('scena', 'calcetto/azione');
  const n = +arg('n', 10);
  const passo = +arg('passo', 0.08);          // secondi di gioco fra un fotogramma e l'altro
  const uscita = path.resolve(arg('out', 'striscia.png'));
  const colonne = +arg('colonne', 5);
  const rit = (arg('ritaglio', null) || '').split(',').map(Number);
  const posa = POSE[scena];
  if (!posa) { console.error('scena senza posa: ' + scena + '\ndisponibili: ' + Object.keys(POSE).join(', ')); process.exit(1); }

  const srv = await servi();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 915, height: 412 }, deviceScaleFactor: 2,
    isMobile: true, hasTouch: true, locale: 'it-IT',
  });
  const pag = await ctx.newPage();

  /* stesso caso governato del banco di prova, cosi' la striscia e' ripetibile */
  await pag.addInitScript(seme => {
    let s = seme >>> 0 || 1;
    const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => p() / 4294967296;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = p(); return a; };
    }
  }, 20260731);

  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.waitForTimeout(700);
  await pag.evaluate(`(async () => { const t = window.__test;
    t.dismissSplash && t.dismissSplash(); ${posa} })()`);

  /* La transizione a bande fra una schermata e l'altra copre il campo per
     quasi un secondo. Congelandola si ottiene una striscia ripetibile e
     CIECA: dieci fotogrammi di due triangoli colorati. Si aspetta che sia
     finita davvero, e si aspetta la condizione, non l'orologio. */
  await pag.waitForFunction(() => {
    const w = document.getElementById('wipe');
    if (w && w.classList.contains('on')) return false;
    return document.getAnimations().filter(a => {
      const d = a.effect && a.effect.getTiming().duration;
      return typeof d === 'number' && isFinite(d) && a.playState === 'running';
    }).length === 0;
  }, null, { timeout: 15000 }).catch(() => {});
  await pag.waitForTimeout(250);

  /* si zittisce il ciclo di disegno e si comanda a mano: un passo di
     fisica, un disegno, uno scatto. Cosi' i fotogrammi sono distanziati
     di un tempo noto e non di quanto era carico il computer. */
  await pag.evaluate(() => {
    const st = document.createElement('style');
    st.textContent = '*,*::before,*::after{animation-play-state:paused !important;transition:none !important}';
    document.head.appendChild(st);
    window.requestAnimationFrame = () => 0;
  });

  const fotogrammi = [];
  for (let i = 0; i < n; i++) {
    await pag.evaluate(([p, primo]) => {
      const t = window.__test;
      if (!primo) t.simulate(p);
      t.disegna && t.disegna();
    }, [passo, i === 0]);
    const opz = {};
    if (rit.length === 4 && rit.every(x => !isNaN(x))) {
      opz.clip = { x: 915 * rit[0], y: 412 * rit[1], width: 915 * rit[2], height: 412 * rit[3] };
    }
    fotogrammi.push((await pag.screenshot(opz)).toString('base64'));
  }
  await ctx.close();

  /* montaggio: una griglia con il tempo scritto sotto ogni fotogramma */
  const mont = await browser.newPage();
  const celle = fotogrammi.map((b, i) =>
    `<figure><img src="data:image/png;base64,${b}"><figcaption>+${(i * passo).toFixed(2)}s</figcaption></figure>`).join('');
  await mont.setContent(`
    <style>
      body{margin:0;background:#101215;font:600 12px ui-monospace,Consolas,monospace;color:#c8d2da}
      h1{font-size:13px;margin:0;padding:9px 12px;background:#080a0c;color:#eef3f7;letter-spacing:.12em}
      .g{display:grid;grid-template-columns:repeat(${colonne},1fr);gap:3px;padding:3px}
      figure{margin:0;background:#181b1f}
      img{width:100%;height:auto;display:block}
      figcaption{padding:4px 6px;color:#8ea0ad;letter-spacing:.08em}
    </style>
    <h1>${scena} — ${n} fotogrammi, uno ogni ${passo}s di gioco</h1>
    <div class="g">${celle}</div>`);
  await mont.setViewportSize({ width: 1700, height: 200 });
  const h = await mont.evaluate(() => document.body.scrollHeight);
  await mont.setViewportSize({ width: 1700, height: Math.min(6000, h) });
  fs.mkdirSync(path.dirname(uscita), { recursive: true });
  await mont.screenshot({ path: uscita, fullPage: true });

  await browser.close(); srv.chiudi();
  console.log(`${uscita}  (${n} fotogrammi, ${(fs.statSync(uscita).size / 1024).toFixed(0)} kB)`);
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
