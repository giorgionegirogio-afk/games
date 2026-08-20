/* =====================================================================
   MISURA — il movimento in numeri, non a occhio.

   "Le figure scivolano" e' un'opinione e si puo' discutere. Questo
   strumento la trasforma in un fatto: campiona lo stato del gioco a
   sessanta volte al secondo e dice, per ogni cosa che si muove, se c'e'
   una curva di accelerazione o se la velocita' e' una funzione a
   gradini, se il corpo ruota, se qualcosa si deforma, e se prima di un
   calcio esiste un fotogramma di carica.

   I numeri non hanno bisogno di occhi e un critico non puo' discuterli.

   RIPRODUCIBILITA', lezione pagata due volte e ora pagata qui: questa
   misura campionava una partita SENZA seme fisso, quindi quali tiri
   cadessero nella finestra era un lancio di dadi. Tre esecuzioni sullo
   stesso identico codice: 8, 20 e 8 valori distinti di carica — e una
   quarta, in mano a un verificatore, ne ha visti 1 e ha dichiarato rosso
   un gioco sano. Un cancello che lancia dadi prima o poi fa anche il
   contrario: copre una regressione vera con una finestra fortunata.
   Adesso Math.random e' sostituito con un generatore a seme fisso PRIMA
   che la pagina esegua una riga (lo stesso di scatta.js): stessa partita,
   stessi numeri, a ogni esecuzione. --seme per cambiare partita.

   uso:  node strumenti/misura.js
         node strumenti/misura.js --sec 4 --seme 7
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
/* --- IL GIOCO PUO' ARRIVARE DA FUORI: --gioco <file> oppure GIOCO_PROVA.
   PERCHE': il percorso del gioco era scritto qui dentro, e un percorso
   cablato ha gia' fatto sbagliare una bisezione — tre misure «prima»
   erano identiche perche' leggevano tutte lo stesso file. Con --gioco lo
   stesso cancello misura una copia fuori dal repo (una toppa da provare,
   la versione di ieri) senza scambiare file a mano. Senza --gioco non
   cambia un byte: il default resta il file del repo. --- */
const GIOCO_FUORI = (() => {
  const v = arg('gioco', process.env.GIOCO_PROVA || '');
  if (!v) return '';
  const a = path.resolve(v);
  /* uscita 3 = prova nulla: non e' il gioco a essere rosso, e' il banco
     che non ha niente da misurare (codici di casa: 0 verde, 1 rosso,
     2 banco esploso, 3 prova nulla) */
  if (!fs.existsSync(a)) { console.error('PROVA NULLA: il gioco indicato non esiste: ' + a); process.exit(3); }
  return a;
})();
const ridirigi = f => (GIOCO_FUORI && /CALCETTO-il-gioco\.html$/i.test(f)) ? GIOCO_FUORI : f;
function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = ridirigi(path.join(RADICE, decodeURIComponent(req.url.split('?')[0])));
      if ((!f.startsWith(RADICE) && f !== GIOCO_FUORI) || !fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
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
  /* il caso si governa prima di ogni riga di pagina, come in scatta.js */
  await pag.addInitScript(seme => {
    let s = seme >>> 0 || 1;
    const prossimo = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => prossimo() / 4294967296;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = prossimo(); return a; };
    }
  }, +arg('seme', 20260728));
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

  /* --- 1. i campi dell'animazione VARIANO davvero? ---
     Le prime tre misure controllavano solo che il campo ESISTESSE sul
     primo giocatore al primo fotogramma. Un critico se n'e' accorto e
     aveva ragione: un campo che c'e' ma resta sempre allo stesso valore
     non anima niente, e infatti la carica del tiro valeva -1 per tutti i
     600 fotogrammi mentre la misura diceva "campo presente". Adesso si
     conta quanti valori distinti assume, su tutti i giocatori e per
     tutta la durata: e' la differenza fra attestare e misurare. */
  const distinti = (chiave, scala) => {
    const v = new Set();
    for (const d of dati) for (const g of d.g) {
      const x = g[chiave];
      if (x != null && isFinite(x)) v.add(Math.round(x * scala));
    }
    return v.size;
  };
  const nFase = distinti('fase', 20);
  const nSchiaccia = distinti('schiaccia', 100);
  const nCarica = distinti('carica', 100);

  verifica(nFase >= 8, `la fase di animazione cambia davvero (${nFase} valori distinti)`,
    nFase === 0 ? "nessun campo di fase: la figura non puo' cambiare posa"
      : nFase < 8 ? 'il campo esiste ma resta quasi fermo: non anima niente' : '');
  verifica(nSchiaccia >= 5, `la deformazione lavora (${nSchiaccia} valori distinti)`,
    nSchiaccia === 0 ? "nessun campo di deformazione: la figura e' rigida"
      : nSchiaccia < 5 ? 'il campo esiste ma non varia: nessuno schiacciamento reale' : '');
  verifica(nCarica >= 3, `la carica prima del calcio varia, cioe' l'anticipo esiste (${nCarica} valori distinti)`,
    nCarica === 0 ? 'nessun campo di carica: il tiro parte senza preparazione'
      : nCarica < 3 ? "il campo di carica c'e' ma vale sempre lo stesso numero: e' un anticipo dichiarato, non fatto" : '');

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
