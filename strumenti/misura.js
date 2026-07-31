/* =====================================================================
   MISURA — il movimento in numeri, non a occhio.

   "Le figure scivolano" e' un'opinione e si puo' discutere. Questo
   strumento la trasforma in un fatto: campiona lo stato del gioco a
   sessanta volte al secondo e dice, per ogni cosa che si muove, se c'e'
   una curva di accelerazione o se la velocita' e' una funzione a
   gradini, se il corpo ruota, se qualcosa si deforma, e se prima di un
   calcio esiste un fotogramma di carica.

   I numeri non hanno bisogno di occhi e un critico non puo' discuterli.

   uso:  node strumenti/misura.js
         node strumenti/misura.js --sec 4 --scena tiro
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
function arg(n, d) {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
}
function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(RADICE) || !fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

const esiti = [];
function verifica(ok, testo, dettaglio) {
  esiti.push(!!ok);
  console.log((ok ? '  OK   ' : '  NO   ') + testo + (dettaglio ? '\n         ' + dettaglio : ''));
}

(async () => {
  const sec = +arg('sec', 6);
  const srv = await servi();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.waitForTimeout(500);

  /* si campiona a passo fisso: un sessantesimo per volta, e a ogni passo
     si annota tutto quello che il gioco espone di ogni giocatore */
  const dati = await pag.evaluate(async (secondi) => {
    const t = window.__test;
    t.dismissSplash && t.dismissSplash();
    t.startMatch(1, 1); t.setCpuVsCpu(true);
    t.simulate(4);
    const passi = Math.round(secondi * 60);
    const serie = [];
    for (let i = 0; i < passi; i++) {
      t.simulate(1 / 60);
      const g = (t.players || []).map(p => ({
        i: p.idx, sq: p.team, ruolo: p.role,
        x: p.x, y: p.y, vx: p.vx, vy: p.vy,
        ang: p.ang !== undefined ? p.ang : (p.dir !== undefined ? p.dir : null),
        /* qualunque campo che somigli a una fase di animazione o a una
           deformazione: se non esiste, e' esattamente il difetto */
        fase: p.fase !== undefined ? p.fase : (p.anim !== undefined ? p.anim : (p.passo !== undefined ? p.passo : null)),
        schiaccia: p.squash !== undefined ? p.squash : (p.scala !== undefined ? p.scala : null),
        carica: p.charge !== undefined ? p.charge : (p.carica !== undefined ? p.carica : null),
      }));
      const b = t.ball || {};
      serie.push({ g, palla: { x: b.x, y: b.y, vx: b.vx, vy: b.vy, rot: b.rot !== undefined ? b.rot : (b.spin !== undefined ? b.spin : null) } });
    }
    return serie;
  }, sec);

  await ctx.close(); await browser.close(); srv.chiudi();

  console.log(`\n=== MOVIMENTO, ${dati.length} campioni a 60 al secondo ===\n`);

  /* --- 1. esistono i campi dell'animazione? --- */
  const primo = dati[0].g[0] || {};
  verifica(primo.fase !== null && primo.fase !== undefined,
    'i giocatori hanno una fase di animazione (un ciclo di corsa)',
    primo.fase == null ? "nessun campo di fase: la figura non puo' cambiare posa" : 'campo presente');
  verifica(primo.schiaccia !== null && primo.schiaccia !== undefined,
    'i giocatori hanno una deformazione (schiaccia e allunga)',
    primo.schiaccia == null ? 'nessun campo di deformazione: la figura e\' rigida' : 'campo presente');
  verifica(primo.carica !== null && primo.carica !== undefined,
    'esiste una carica prima del calcio (anticipo)',
    primo.carica == null ? 'nessun campo di carica: il tiro parte senza preparazione' : 'campo presente');

  /* --- 2. la velocita' ha una curva o e' a gradini? --- */
  const n = dati[0].g.length;
  let scattiTot = 0, campioniTot = 0, accelMax = 0;
  const modulo = p => Math.hypot(p.vx || 0, p.vy || 0);
  for (let k = 0; k < n; k++) {
    for (let i = 1; i < dati.length; i++) {
      const a = dati[i - 1].g[k], b = dati[i].g[k];
      if (!a || !b || a.ruolo === 'gk') continue;
      const va = modulo(a), vb = modulo(b);
      const acc = Math.abs(vb - va) * 60;             // variazione al secondo
      accelMax = Math.max(accelMax, acc);
      campioniTot++;
      /* uno "scatto" e' un cambio di velocita' cosi' brusco da non poter
         essere una curva: e' il segno della velocita' imposta a mano */
      if (va > 1 && acc > va * 60 * 0.9) scattiTot++;
    }
  }
  const quotaScatti = campioniTot ? scattiTot / campioniTot : 0;
  verifica(quotaScatti < 0.02,
    `la velocita' cambia con una curva, non a gradini (${(quotaScatti * 100).toFixed(1)}% di scatti bruschi)`,
    `accelerazione massima osservata ${accelMax.toFixed(0)} unita' al secondo quadrato`);

  /* --- 3. il corpo ruota mentre cambia direzione? --- */
  let ruota = 0, cambi = 0;
  for (let k = 0; k < n; k++) {
    for (let i = 2; i < dati.length; i++) {
      const a = dati[i - 2].g[k], b = dati[i].g[k];
      if (!a || !b || a.ang == null) continue;
      const dirA = Math.atan2(a.vy || 0, a.vx || 0), dirB = Math.atan2(b.vy || 0, b.vx || 0);
      if (modulo(a) < 1 || modulo(b) < 1) continue;
      const dDir = Math.abs(Math.atan2(Math.sin(dirB - dirA), Math.cos(dirB - dirA)));
      if (dDir > 0.15) { cambi++; if (Math.abs(b.ang - a.ang) > 0.05) ruota++; }
    }
  }
  verifica(cambi === 0 || ruota / cambi > 0.5,
    `il corpo si orienta quando cambia direzione (${cambi ? Math.round(ruota / cambi * 100) : 0}% dei cambi)`,
    `${cambi} cambi di direzione osservati`);

  /* --- 4. il pallone ruota? --- */
  const rot = dati.map(d => d.palla.rot).filter(r => r != null);
  verifica(rot.length > 0 && new Set(rot.map(r => Math.round(r * 100))).size > 5,
    'il pallone ruota mentre si muove',
    rot.length ? 'valori distinti: ' + new Set(rot.map(r => Math.round(r * 100))).size : 'nessun campo di rotazione sul pallone');

  /* --- 5. quante pose diverse assume una figura? --- */
  const fasi = dati.map(d => d.g[0] && d.g[0].fase).filter(f => f != null);
  verifica(new Set(fasi.map(f => Math.round(f * 20))).size >= 4,
    `una figura assume piu' pose mentre corre (${new Set(fasi.map(f => Math.round(f * 20))).size} pose distinte)`,
    fasi.length ? '' : 'nessuna fase: la figura e\' sempre la stessa immagine spostata');

  const male = esiti.filter(x => !x).length;
  console.log(`\n${esiti.length} misure, ${esiti.length - male} passate, ${male} fallite`);
  if (male) {
    console.log('\nOgni misura fallita e\' una delle quattro cose che separano un gioco animato');
    console.log('da uno in cui le figure scivolano: anticipo, peso, seguito, deformazione.');
    process.exit(1);
  }
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
