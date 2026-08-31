/* =====================================================================
   _q-cross.js — UN CROSS PASSA SOPRA LE TESTE? (29 agosto 2026)

   PERCHE' SERVE UN BANCO APPOSTA. In partita il cross parte da tre
   strade: due umane (doCrossUmano, doFiltrante col trascinamento) e una
   della macchina (crossCPU, :19057). Ma la CPU crossa **solo da lontano**
   — crossFinestra() le da' una distanza minima oltre la quale
   dist/430 supera sempre il tetto — quindi in CPU contro CPU si misura
   un solo punto della curva, il piu' alto, e proprio i traversoni corti
   restano invisibili. Sono quelli che sbagliavano. Per vederli bisogna
   tirarli a mano, a distanze scelte.

   (RETTIFICA del 29 agosto: questa intestazione diceva «il cross e' un
   verbo SOLO UMANO, in CPU contro CPU non parte MAI». Falso: una sonda
   che avvolge doCross ne conta 2 a partita. L'errore veniva da un grep
   troncato a dieci righe, con la chiamata vera all'undicesima.)

   COSA MISURA. Chiama doCross a distanze crescenti e segue il pallone
   fino a terra, campionando a 1/60. Per ogni distanza stampa:
     · la QUOTA MASSIMA raggiunta;
     · se quella quota entra nella FINESTRA DELLA TESTA, 26..46 — la
       sola fascia in cui un colpo di testa puo' esistere;
     · dove il pallone e' atterrato rispetto a dove mirava (l'errore di
       gittata: una cura che alza il pallone e sballa la mira non e' una
       cura).

   IL CONTO CHE STA SOTTO, e che si puo' rifare a mente. La gravita' e'
   560 (riga «b.vz-=560*dt»), il cross parte con b.vz = 280*T, quindi
   il tempo di volo vale 2*280*T/560 = T esatto — il coefficiente 280
   e' scelto apposta perche' T sia davvero il tempo — e la quota di
   culmine vale h = 560*(T/2)^2/2 = 70*T^2.
       h = 26  ->  T = 0,609
       h = 46  ->  T = 0,811
   La finestra della testa, tradotta in tempo di volo, e' [0,609 0,811].
   Oggi il gioco clampa T fra 0,50 e 0,75 (L14_T0/L14_T1 e il clamp di
   doCross): la meta' bassa di quella corsa sta SOTTO i corpi.

   uso:  node strumenti/_q-cross.js
         node strumenti/_q-cross.js --gioco fuori/cross.html
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const GIOCO = arg('gioco', 'CALCETTO-il-gioco.html');
const Z_SOPRA_TESTA = 26, Z_TESTA_MAX = 46;

function esplode(m) { console.log('\nBANCO NON VALIDO - ' + m); console.log('Non e\' un giudizio sul gioco: non ho potuto misurarlo.'); process.exit(2); }

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

async function apri(browser, porta) {
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const err = [];
  pag.on('pageerror', e => err.push(e.message));
  await pag.addInitScript(() => {
    let s = 20260803 >>> 0;
    const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => p() / 4294967296;
  });
  await pag.goto('http://127.0.0.1:' + porta + '/' + GIOCO, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
  if (err.length) esplode('la pagina e\' partita con un errore: ' + err[0].slice(0, 160));
  return { ctx, pag };
}

async function unCross(pag, dist, taglia) {
  return pag.evaluate(([dist, taglia]) => {
    const t = window.__test;
    t.startMatch(1, 1, taglia !== 5 ? { size: taglia } : undefined);
    let giri = 0;
    while (t.state !== 'play' && giri < 600) { t.simulate(1 / 60); giri++; }
    if (t.state !== 'play') return { errore: 'la partita non entra in gioco' };
    const p = ctrlPlayer(0);
    if (!p) return { errore: 'nessun giocatore controllato' };
    const b = G.ball;
    /* si mette il crossatore sulla fascia e gli si da' il pallone: e'
       la situazione del cross, senza chiedere all'IA di produrla */
    p.x = 120; p.y = 40; p.out = 0; p.slide = -1; p.recover = 0; p.rove = -1;
    p.kickCd = 0; p.charge = -1; p.contrasto = 0; p.kickT = 0; p.kickB = 0;
    b.owner = G.players.indexOf(p); b.x = p.x; b.y = p.y; b.z = 0;
    b.vx = 0; b.vy = 0; b.vz = 0;
    /* LA MIRA E' UN ARRAY [x,y], NON UN OGGETTO. doCross legge pc[0] e
       pc[1]; passandogli {x,y} si ottengono due undefined, poi NaN, e il
       pallone finisce fuori dai numeri — la prima stesura di questo
       banco lo faceva, e stampava gittate NaN e quote costanti a 44 a
       qualunque distanza. Erano il rinvio e la rimessa che seguivano il
       pallone perduto: il banco misurava sé stesso. */
    const daX = p.x, daY = p.y;
    doCross(p, 1, 0, [p.x + dist, p.y], undefined);
    const partito = (b.owner < 0) && isFinite(b.vx) && isFinite(b.vz);
    if (!partito) return { partito: false, perche: 'owner ' + b.owner + ' vx ' + b.vx + ' vz ' + b.vz };
    let zMax = 0, passi = 0, tVolo = 0, salito = false;
    let gittata = 0;
    while (passi < 60 * 8) {
      t.simulate(1 / 60); passi++;
      const z = b.z || 0;
      if (z > zMax) zMax = z;
      if (z > 2) salito = true;
      /* SI FERMA AL PRIMO ATTERRAGGIO, non alla fine del tempo: dopo
         il primo tocco a terra quello che si misura non e' piu' il
         cross, e' quello che il gioco ci fa dopo. */
      if (salito && z <= 1) { tVolo = passi / 60; gittata = Math.hypot(b.x - daX, b.y - daY); break; }
    }
    if (!tVolo) { tVolo = passi / 60; gittata = Math.hypot(b.x - daX, b.y - daY); }
    return { partito, zMax, tVolo, gittata, chiesta: dist };
  }, [dist, taglia]);
}

(async () => {
  if (!fs.existsSync(path.resolve(RADICE, GIOCO))) esplode('manca il file ' + GIOCO);
  const srv = await servi();
  const browser = await chromium.launch();
  const { ctx, pag } = await apri(browser, srv.porta);
  console.log('=== UN CROSS PASSA SOPRA LE TESTE? ===');
  console.log('gioco: ' + GIOCO);
  console.log('la finestra del colpo di testa e\' ' + Z_SOPRA_TESTA + '..' + Z_TESTA_MAX
              + ' (sopra i corpi, sotto la fronte)\n');
  console.log('  distanza | quota max |  volo  | gittata (chiesta) | verdetto');
  console.log('  ' + '-'.repeat(74));
  let dentro = 0, tot = 0, erroreMax = 0;
  for (const d of [150, 200, 260, 320, 400, 500, 650]) {
    const r = await unCross(pag, d, 5);
    if (r.errore) esplode(r.errore);
    if (!r.partito) { console.log('  ' + String(d).padStart(8) + '   il cross NON E\' PARTITO (doCross ha rifiutato)'); continue; }
    tot++;
    const ok = r.zMax >= Z_SOPRA_TESTA && r.zMax <= Z_TESTA_MAX;
    if (ok) dentro++;
    const err = Math.abs(r.gittata - d);
    if (err > erroreMax) erroreMax = err;
    console.log('  ' + String(d).padStart(8) + ' | ' + r.zMax.toFixed(1).padStart(9) + ' | '
      + r.tVolo.toFixed(2).padStart(5) + 's | ' + r.gittata.toFixed(0).padStart(7) + ' (' + String(d).padStart(3) + ')'
      + '      | ' + (ok ? 'DENTRO la finestra' : (r.zMax < Z_SOPRA_TESTA ? 'passa SOTTO i corpi' : 'sopra la fronte')));
  }
  console.log('\n  ' + dentro + ' cross su ' + tot + ' entrano nella finestra della testa.');
  console.log('  errore di gittata peggiore: ' + erroreMax.toFixed(0) + ' unita\'.');
  console.log('  (il secondo numero conta quanto il primo: un cross che si alza e sbaglia');
  console.log('   il bersaglio non e\' un cross migliore, e\' un altro difetto.)');
  await ctx.close(); await browser.close(); srv.chiudi();
  /* NON esce 1 quando i cross sono bassi: questo file MISURA, non
     giudica. La soglia di «quanti cross devono passare sopra» e' una
     decisione, e sta scritta dove si prende — nella voce di lavoro #72
     e nel referto — non dentro uno strumento. Esce 1 solo se non e'
     partito nemmeno un cross, che vorrebbe dire banco cieco. */
  process.exit(tot === 0 ? 1 : 0);
})().catch(e => esplode(e.message));
