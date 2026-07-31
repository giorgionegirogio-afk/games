/* =====================================================================
   FILMATO — il movimento come lo vede chi gioca.

   La striscia (strumenti/striscia.js) serve ai revisori, che sanno
   leggere un passo di corsa da sei fotogrammi affiancati. Ma il giudizio
   vero su un'animazione lo da' l'occhio in tempo reale: si guarda una
   volta e si capisce se il gioco ha peso o se scivola.

   Qui si registra il gioco mentre gira davvero, a velocita' normale.
   Non serve installare niente: la registrazione e' quella di playwright.

   uso:
     node strumenti/filmato.js --scena azione --out filmati/azione.webm
     node strumenti/filmato.js --scena gol --sec 5
     node strumenti/filmato.js --elenco
   ===================================================================== */
const fs = require('fs');
const os = require('os');
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

/* che partita mettere in scena, e quanto lasciarla correre da sola */
const POSE = {
  azione: { posa: `t.startMatch(1,1); t.setCpuVsCpu(true);`, salta: 5 },
  kickoff: { posa: `t.startMatch(1,1); t.setCpuVsCpu(true);`, salta: 0 },
  gol: { posa: `t.startMatch(1,1); t.setCpuVsCpu(true);`, salta: 2, poi: `t.forceGoal(0);` },
  tiro: { posa: `t.startMatch(1,1); t.setCpuVsCpu(true);`, salta: 9 },
  rigori: { posa: `t.startMatch(1,1); t.rigori && t.rigori();`, salta: 0 },
  fine: { posa: `t.startMatch(1,1); t.setCpuVsCpu(true); t.forceGoal(0); t.forceGoal(1); t.setTimeLeft(1.5);`, salta: 0 },
  partita: { posa: `t.startMatch(1,1); t.setCpuVsCpu(true);`, salta: 25 },
  giocata: { posa: `t.startMatch(1,1);`, salta: 0 },   // squadra 0 comandata a mano
};

(async () => {
  if (process.argv.includes('--elenco')) { console.log(Object.keys(POSE).join('\n')); return; }
  const nome = arg('scena', 'azione');
  const sec = +arg('sec', 5);
  const s = POSE[nome];
  if (!s) { console.error('scene: ' + Object.keys(POSE).join(', ')); process.exit(1); }
  const uscita = path.resolve(arg('out', 'filmati/' + nome + '.webm'));

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'filmato-'));
  const srv = await servi();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 915, height: 412 }, deviceScaleFactor: 1,
    isMobile: true, hasTouch: true, locale: 'it-IT',
    recordVideo: { dir: tmp, size: { width: 915, height: 412 } },
  });
  const pag = await ctx.newPage();
  await pag.addInitScript(seme => {
    let x = seme >>> 0 || 1;
    const p = () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x >>> 0; };
    Math.random = () => p() / 4294967296;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = p(); return a; };
    }
  }, 20260731);

  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.waitForTimeout(600);

  /* la posa si raggiunge a passo fisso, cosi' non si spreca filmato ad
     aspettare; da li' in poi il gioco corre da solo e si registra */
  await pag.evaluate(`(() => { const t = window.__test;
    t.dismissSplash && t.dismissSplash(); ${s.posa}
    if (${s.salta}) t.simulate(${s.salta}); })()`);
  await pag.waitForTimeout(400);
  if (s.poi) await pag.evaluate(`(() => { const t = window.__test; ${s.poi} })()`);

  await pag.waitForTimeout(sec * 1000);

  /* il video si chiude solo insieme al contesto, ma va salvato PRIMA che
     si chiuda il browser: dopo, non c'e' piu' nessuno a cui chiederlo */
  const video = pag.video();
  await ctx.close();
  fs.mkdirSync(path.dirname(uscita), { recursive: true });
  await video.saveAs(uscita);
  await browser.close();
  srv.chiudi();
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`${uscita}  (${sec}s, ${(fs.statSync(uscita).size / 1024).toFixed(0)} kB)`);
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
