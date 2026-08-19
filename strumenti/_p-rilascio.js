/* =====================================================================
   _p-rilascio.js — QUANTI CALCI ESCONO DA UN DITO CHE SI ALZA.

   LA DOMANDA. Il committente dice: «alzo il pollice dalla levetta e
   parte un passaggio che non ho chiesto; arriva una notifica e parte
   lo stesso». Sono due frasi che si possono contare, e finche' non si
   contano restano opinioni. Questo banco le conta:

     200 RILASCI      il dito trascina, si ferma, si stacca (touchend)
     200 ANNULLAMENTI il dito trascina, si ferma, e il sistema glielo
                      toglie (touchcancel: il gesto indietro di Android,
                      una notifica, una chiamata)
     200 CONTROLLI    identici ai primi, MA IL DITO NON SI ALZA

   Il terzo braccio e' la parte che rende la misura una misura. Senza,
   un calcio contato dopo un rilascio potrebbe essere della partita che
   va avanti per conto suo — e il numero direbbe «rotto» anche su un
   gioco sano. Col controllo si sa quanto vale il fondo: il braccio
   «fermo» ha esattamente la stessa preparazione, la stessa attesa e la
   stessa finestra di conteggio, e l'UNICA cosa che gli manca e' il dito
   che si stacca. Quello che avanza fra i due e' causato dal rilascio,
   non correlato con lui.

   COME CONTA, e perche' non e' un'attestazione.
     · Il dito e' vero: Input.dispatchTouchEvent, gli stessi eventi che
       manda il vetro di un telefono. Nessuna funzione del gioco viene
       chiamata per agire.
     · Il calcio e' vero: si avvolgono le funzioni globali del gioco
       (kickBall, startSlide, fireShot, doPass, doFiltrante,
       releaseCharge, cambiaGiocatore) e si registra CHI le ha chiamate.
       Si contano solo gli atti del GIOCATORE COMANDATO della squadra 0
       — l'unico che il dito comanda. La CPU non puo' sporcare il conto:
       nel gioco il ramo del portatore e' spento sul comandato da umano
       (`if(carrier===p && !controllatoDaUmano) aiCarrier(...)`) e la
       scivolata dell'IA e' dietro a `isCpuTeam`.
     · I falli si contano dal tabellino (G.stats.falli), perche' la
       richiesta era «mai un calcio, mai un fallo, mai niente».
     · GLI EVENTI DI ANNULLAMENTO SI CONTANO ALL'ARRIVO. Il banco tiene
       un contatore dei touchcancel che la pagina ha DAVVERO ricevuto:
       se il protocollo non li consegnasse, la prova direbbe «zero
       calci» per il motivo sbagliato, cioe' sarebbe verde perche'
       cieca. Se ne arrivano meno di quanti ne ho mandati, lo strumento
       esce con 1 e lo dice.
     · SANITA' DELLA SONDA: se in tutta la corsa nessuno — nemmeno la
       CPU — ha chiamato kickBall, l'avvolgimento non ha preso e la
       misura non vale. Anche qui si esce con 1.

   E MISURA ANCHE LA COSA DA NON ROMPERE. Il committente muove il
   giocatore «tenendo il pollice premuto a sinistra e trascinando»:
   quel gesto non deve cambiare. Ogni prova registra di quante unita' di
   mondo si e' spostato il comandato durante il trascinamento, e la
   mediana si stampa. Piu' il braccio PULSANTE, che preme il pulsante
   piccolo col possesso e conta i palloni giocati: e' li' che il
   passaggio e' traslocato, e un passaggio che non parte piu' e' un
   danno peggiore del difetto.

   uso:
     node strumenti/_p-rilascio.js
     node strumenti/_p-rilascio.js --gioco fuori/dopo.html --etichetta DOPO
     node strumenti/_p-rilascio.js --prove 50            (corsa breve)
     node strumenti/_p-rilascio.js --json fuori/prima.json
     node strumenti/_p-rilascio.js --contro fuori/prima.json

   IL CANCELLO: dopo un rilascio e dopo un annullamento il giocatore
   comandato non deve calciare ne' scivolare piu' di quanto faccia col
   dito ancora premuto. Se lo fa, esce con 1.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png' };

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const attesa = ms => new Promise(r => setTimeout(r, ms));
const mediana = a => { const o = [...a].sort((x, y) => x - y); return o.length ? (o.length % 2 ? o[(o.length - 1) / 2] : (o[o.length / 2 - 1] + o[o.length / 2]) / 2) : 0; };

const PROVE = +arg('prove', 200);
const ETICHETTA = arg('etichetta', '');
const JSONOUT = arg('json', '');
const CONTRO = arg('contro', '');
/* il gioco da provare puo' stare fuori dal repo (una copia toppata) */
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'CALCETTO-il-gioco.html')));

/* --- i tempi del gesto, scelti sul codice dell'input e dichiarati ---
   FERMO 260 ms: la finestra del flick e' 90 ms e la deroga del
   campione unico vale solo se l'ultimo movimento e' piu' recente di
   90 ms. A 260 il dito e' fermo per davvero, quindi questo NON e' un
   flick: e' il rilascio che il committente descrive.
   FINESTRA 260 ms: l'anticipo umano del passaggio e' 50 ms
   (PASS_CAR_U) e quello della scivolata 60 (SLIDE_CAR_U); 260 li
   contiene quattro volte. */
const FERMO = 260, FINESTRA = 260;

function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (/CALCETTO-il-gioco\.html$/i.test(f)) f = GIOCO;
      if ((!f.startsWith(RADICE) && f !== GIOCO) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* dita di protocollo: gli stessi eventi del vetro di un telefono */
const dito = {
  giu: (cdp, x, y) => cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }),
  sposta: (cdp, x, y) => cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] }),
  su: cdp => cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }),
  annulla: cdp => cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] }),
  /* pulizia di fine prova: se il dito e' gia' andato via (perche' la
     prova stessa lo ha alzato o annullato) il protocollo protesta, e
     quella protesta non e' un dato — si ignora */
  suSicuro: async cdp => { try { await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); } catch (e) { } },
};

/* ---------------------------------------------------------------------
   LA SONDA, installata nella pagina dopo il caricamento. Avvolge le
   funzioni globali del gioco e conta gli eventi del touch che la pagina
   riceve DAVVERO. Non pesca numeri casuali e non decide niente: legge.
   --------------------------------------------------------------------- */
function installaSonda() {
  if (window.__sonda) return 'gia installata';
  const G = window.__test.G;
  const S = { ev: [], t0: 0, tot: { kickBall: 0 }, rice: { touchstart: 0, touchmove: 0, touchend: 0, touchcancel: 0 } };
  window.__sonda = S;
  const cv = document.getElementById('gioco');
  for (const n of ['touchstart', 'touchmove', 'touchend', 'touchcancel'])
    cv.addEventListener(n, () => { S.rice[n]++; }, true);   // in cattura: prima del gioco

  const mio = p => { const i = G.ctrl[0]; return i >= 0 && G.players[i] === p; };
  const mioT = t => (t | 0) === 0;
  const nota = (n, m, ok) => { S.ev.push({ n, m: !!m, ok: ok !== false, t: performance.now() }); };

  const avvolgiP = n => { const o = window[n]; window[n] = function (p, ...a) { const r = o.call(this, p, ...a); if (n === 'kickBall') { S.tot.kickBall++; if (r) nota(n, mio(p)); } else nota(n, mio(p)); return r; }; };
  const avvolgiT = n => { const o = window[n]; window[n] = function (t, ...a) { const r = o.call(this, t, ...a); nota(n, mioT(t)); return r; }; };
  for (const n of ['kickBall', 'startSlide', 'fireShot']) avvolgiP(n);
  for (const n of ['doPass', 'doFiltrante', 'releaseCharge', 'cambiaGiocatore']) avvolgiT(n);
  return 'ok';
}

/* la quiete governata: partita in corso, palla al piede del comandato,
   avversari allontanati. Ricalcata su strumenti/giocata.js
   (preparaQuiete), che e' gia' il modo di casa di fermare il mondo. */
function preparaQuiete() {
  const t = window.__test, G = t.G;
  t.setPaused && t.setPaused(false);
  try { if (t.Tut && t.Tut.active && t.Tut.finish) t.Tut.finish(true); } catch (e) { }
  /* IL MONDO PUO' INCASTRARSI, e non e' un difetto del gioco: una
     punizione ('freekick') o la serie dai dischetti ASPETTANO un dito,
     e simulare all'infinito non le smuove — il banco resterebbe li' per
     sempre, oppure (peggio) direbbe «fallito» addossando al gioco una
     cosa che ha fatto lui. Dopo due passate di simulazione la partita si
     RICOMINCIA, e quante volte e' successo si stampa: e' rumore
     dichiarato, non nascosto. */
  window.__sonda.ripartenze = window.__sonda.ripartenze || 0;
  for (let giro = 0; giro < 3 && G.scene !== 'play'; giro++) {
    for (let i = 0; i < 200 && G.scene !== 'play'; i++) t.simulate(0.1);
    if (G.scene !== 'play') { window.__sonda.ripartenze++; t.startMatch(1, 1, { size: 5 }); for (let i = 0; i < 80 && G.scene !== 'play'; i++) t.simulate(0.1); }
  }
  if (G.scene !== 'play') return { errore: "la partita non arriva in gioco: scena '" + G.scene + "'" };
  t.setTimeLeft && t.setTimeLeft(80);
  const pi = G.ctrl[0];
  if (pi < 0) return { errore: 'nessun giocatore comandato' };
  const p = G.players[pi];
  const c0 = t.campo;
  if (p.charge !== undefined && p.charge >= 0) { p.charge = -1; p.chargeKind = 'tiro'; p.chargeT = 0; p.chargeGo = null; p.chargeClip = null; }
  p.slide = -1; p.recover = 0;
  for (const q of G.players) { q.vx = 0; q.vy = 0; }
  /* IL COMANDATO TORNA AL CENTRO DEL CAMPO A OGNI PROVA, e non e' un
     vezzo: senza questa riga il banco ha mentito su una voce. Il
     trascinamento spinge sempre in una direzione, il giocatore in poche
     prove arriva alla linea, clampPlayer lo inchioda li' e da quel
     momento la corsa misurata e' ZERO — cioe' il banco avrebbe scritto
     "il gesto del committente non muove piu' nessuno" mentre il gesto
     funzionava benissimo. Trovato guardando la mediana a 0,0 unita' su
     200 prove dopo che a 6 prove diceva 76. */
  p.x = c0.FW * 0.5; p.y = c0.FH * 0.5;
  const b = G.ball;
  b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0; b.curve = 0; b.passTo = -1;
  const v = t.view;
  const cx = (innerWidth / 2 - v.Ax) / v.S2;
  const dir = cx >= p.x ? 1 : -1;
  b.owner = pi; b.x = p.x + dir * 8; b.y = p.y;
  for (const q of G.players) {
    if (q.team === 0) continue;
    const d = Math.hypot(q.x - b.x, q.y - b.y);
    if (d < 170) { const l = Math.max(1, d); q.x = b.x + (q.x - b.x) / l * 230; q.y = b.y + (q.y - b.y) / l * 230; }
  }
  const S = window.__sonda;
  S.ev = []; S.t0 = performance.now();
  const bt = t.pulsanti(0);
  const grande = bt.reduce((a, c) => (c.r || 0) > (a.r || 0) ? c : a, bt[0]);
  const piccolo = bt.find(c => c !== grande) || grande;
  return { px: p.x, py: p.y, falli: (G.stats.falli || [0, 0]).slice(),
           grande: { x: grande.x, y: grande.y, label: grande.label },
           piccolo: { x: piccolo.x, y: piccolo.y, label: piccolo.label } };
}

/* apre la finestra di conteggio: da qui in poi si registra */
function apriFinestra() {
  const S = window.__sonda, G = window.__test.G;
  S.ev = []; S.t0 = performance.now();
  return { falli: (G.stats.falli || [0, 0]).slice() };
}

/* chiude e riassume SOLO gli atti del comandato dentro la finestra */
function chiudiFinestra(f0) {
  const S = window.__sonda, G = window.__test.G, t = window.__test;
  const pi = G.ctrl[0];
  const p = pi >= 0 ? G.players[pi] : null;
  const c = { calci: 0, scivolate: 0, tiri: 0, passi: 0, cambi: 0, quali: [] };
  for (const e of S.ev) {
    if (!e.m) continue;
    if (e.n === 'kickBall') c.calci++;
    else if (e.n === 'startSlide') c.scivolate++;
    else if (e.n === 'fireShot') c.tiri++;
    else if (e.n === 'doPass' || e.n === 'doFiltrante') c.passi++;
    else if (e.n === 'cambiaGiocatore') c.cambi++;
    if (c.quali.length < 4) c.quali.push(e.n);
  }
  const f1 = G.stats.falli || [0, 0];
  c.falli = (f1[0] - f0[0]) + (f1[1] - f0[1]);
  /* una carica di tiro rimasta APERTA senza dito e' il congelamento:
     il giocatore va al 45% e SHOT_HARDCAP la fa partire da sola */
  c.caricaOrfana = !!(p && p.charge >= 0 && !p.chargeGo && p.chargeKind === 'tiro') ? 1 : 0;
  c.px = p ? p.x : 0; c.py = p ? p.y : 0;
  c.passTo = G.ball.passTo;
  c.rice = Object.assign({}, S.rice);
  c.totKick = S.tot.kickBall;
  return c;
}

(async () => {
  const srv = await servi();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 915, height: 412 }, deviceScaleFactor: 1,
    isMobile: true, hasTouch: true, locale: 'it-IT',
  });
  const pag = await ctx.newPage();
  /* il caso e' governato, come in collaudo.js e scatta.js */
  await pag.addInitScript(seme => {
    let s = seme >>> 0 || 1;
    const pr = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => pr() / 4294967296;
  }, 20260818);
  const errori = [];
  pag.on('pageerror', e => errori.push('ECCEZIONE: ' + e.message));
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.__test.dismissSplash && window.__test.dismissSplash(); window.__test.startMatch(1, 1, { size: 5 }); });
  await pag.waitForTimeout(600);
  const sonda = await pag.evaluate(installaSonda);
  if (sonda !== 'ok') { console.error('FALLITO: la sonda non si e\' installata (' + sonda + ')'); process.exit(1); }
  const cdp = await ctx.newCDPSession(pag);

  const VW = 915, VH = 412;
  const CASA = { x: Math.round(VW * 0.18), y: Math.round(VH * 0.66) };   // dove si posa il pollice sinistro

  console.log('=== RILASCIO — quanti calci escono da un dito che si alza ===\n');
  console.log('gioco:      ' + GIOCO + (ETICHETTA ? '   [' + ETICHETTA + ']' : ''));
  console.log('banco:      ' + VW + 'x' + VH + ' · 5 contro 5 · seme 20260818');
  console.log('gesto:      pollice giu\' a (' + CASA.x + ',' + CASA.y + '), trascina 44 px, FERMO ' + FERMO + ' ms, poi l\'atto');
  console.log('finestra:   ' + FINESTRA + ' ms dopo l\'atto · si contano solo gli atti del GIOCATORE COMANDATO\n');

  /* --------------------------------------------------------------- */
  /* LA DIREZIONE GIRA DI PROVA IN PROVA (angolo aureo, 137,5 gradi):
     cosi' nessuna prova eredita la direzione della precedente e il
     trascinamento copre tutte le direzioni invece di spingere sempre
     dalla stessa parte. */
  async function trascina(i) {
    const a = (i * 137.5) * Math.PI / 180;
    const ux = Math.cos(a), uy = Math.sin(a);
    await dito.giu(cdp, CASA.x, CASA.y);
    /* otto passi da 5,5 px: si supera la zona morta (12), si arriva
       alla corsa piena (46) e si resta SOTTO la soglia dello scatto
       (66), che e' come si muove chi gioca */
    for (let k = 1; k <= 8; k++) { await dito.sposta(cdp, CASA.x + ux * k * 5.5, CASA.y + uy * k * 5.5); await attesa(18); }
  }

  async function braccio(nome, atto) {
    const K = { calci: 0, scivolate: 0, tiri: 0, passi: 0, cambi: 0, falli: 0, orfane: 0, prove: 0, corse: [], quali: {} };
    for (let i = 0; i < PROVE; i++) {
      const q = await pag.evaluate(preparaQuiete);
      if (q.errore) { console.error('FALLITO: ' + q.errore); process.exit(1); }
      await trascina(i);
      await attesa(FERMO);
      const f = await pag.evaluate(apriFinestra);
      await atto();
      await attesa(FINESTRA);
      const c = await pag.evaluate(chiudiFinestra, f.falli);
      K.calci += c.calci; K.scivolate += c.scivolate; K.tiri += c.tiri;
      K.passi += c.passi; K.cambi += c.cambi; K.falli += c.falli; K.orfane += c.caricaOrfana;
      for (const n of c.quali) K.quali[n] = (K.quali[n] || 0) + 1;
      K.corse.push(Math.hypot(c.px - q.px, c.py - q.py));
      K.prove++;
      /* il braccio col dito ancora giu' va ripulito FUORI dalla
         finestra: quello che succede adesso non si conta */
      if (nome === 'fermo') { await dito.suSicuro(cdp); await attesa(180); }
      K.rice = c.rice; K.totKick = c.totKick;
    }
    K.corsaMediana = mediana(K.corse);
    return K;
  }

  const R = {};
  console.log('--- ' + PROVE + ' RILASCI (touchend) ---');
  R.rilascio = await braccio('rilascio', () => dito.su(cdp));
  console.log('    calci ' + R.rilascio.calci + ' · scivolate ' + R.rilascio.scivolate + ' · falli ' + R.rilascio.falli);

  console.log('--- ' + PROVE + ' ANNULLAMENTI (touchcancel) ---');
  R.annulla = await braccio('annulla', () => dito.annulla(cdp));
  console.log('    calci ' + R.annulla.calci + ' · scivolate ' + R.annulla.scivolate + ' · falli ' + R.annulla.falli);

  console.log('--- ' + PROVE + ' CONTROLLI (il dito NON si alza) ---');
  R.fermo = await braccio('fermo', async () => { });
  console.log('    calci ' + R.fermo.calci + ' · scivolate ' + R.fermo.scivolate + ' · falli ' + R.fermo.falli);

  /* ---------------------------------------------------------------
     E ADESSO L'ALTRA SUPERFICIE. Fin qui si e' annullato il dito sulla
     LEVETTA; ma la richiesta era «touchcancel != touchend su OGNI
     superficie». Il pulsante grande col possesso e' l'unico comando
     che vive davvero sul rilascio — la carica del tiro e' un gesto che
     il dito tiene aperto apposta — quindi e' li' che la differenza si
     vede meglio: END deve tirare, CANCEL non deve tirare NE' lasciare
     la carica aperta. La finestra qui e' lunga 1200 ms perche' una
     carica orfana non resta orfana in silenzio: a SHOT_HARDCAP (1,25 s)
     parte da sola, e un banco con la finestra corta non la vedrebbe. */
  const NG = Math.min(PROVE, 60);
  async function braccioGrande(nome, atto) {
    const K = { calci: 0, tiri: 0, orfane: 0, prove: 0, etichetta: '' };
    for (let i = 0; i < NG; i++) {
      const q = await pag.evaluate(preparaQuiete);
      if (q.errore) { console.error('FALLITO: ' + q.errore); process.exit(1); }
      K.etichetta = q.grande.label;
      const f = await pag.evaluate(apriFinestra);
      await dito.giu(cdp, q.grande.x, q.grande.y);
      await attesa(300);                       // dentro la finestra dolce? no: e' prima. Serve solo che la carica sia APERTA.
      await atto();
      await attesa(1200);                      // oltre SHOT_HARDCAP (1,25 s dall'inizio della carica)
      const c = await pag.evaluate(chiudiFinestra, f.falli);
      K.calci += c.calci; K.tiri += c.tiri; K.orfane += c.caricaOrfana; K.prove++;
      await dito.suSicuro(cdp); await attesa(120);
    }
    return K;
  }
  console.log('--- ' + NG + ' RILASCI SUL PULSANTE GRANDE (touchend: DEVE tirare) ---');
  R.tiroFine = await braccioGrande('tiroFine', () => dito.su(cdp));
  console.log('    etichetta ' + R.tiroFine.etichetta + ' · tiri ' + R.tiroFine.tiri + ' su ' + R.tiroFine.prove);
  console.log('--- ' + NG + ' ANNULLAMENTI SUL PULSANTE GRANDE (touchcancel: NON deve tirare) ---');
  R.tiroAnnulla = await braccioGrande('tiroAnnulla', () => dito.annulla(cdp));
  console.log('    tiri ' + R.tiroAnnulla.tiri + ' su ' + R.tiroAnnulla.prove + ' · cariche orfane ' + R.tiroAnnulla.orfane);

  /* --- il braccio del PULSANTE: e' li' che il passaggio deve vivere --- */
  console.log('--- ' + Math.min(PROVE, 60) + ' PRESSIONI DEL PULSANTE PICCOLO COL POSSESSO ---');
  const NB = Math.min(PROVE, 60);
  const B = { calci: 0, passi: 0, bersaglio: 0, prove: 0, etichetta: '' };
  for (let i = 0; i < NB; i++) {
    const q = await pag.evaluate(preparaQuiete);
    if (q.errore) { console.error('FALLITO: ' + q.errore); process.exit(1); }
    B.etichetta = q.piccolo.label;
    await trascina(i);                      // la levetta e' tenuta, come si gioca
    await attesa(120);
    const f = await pag.evaluate(apriFinestra);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: CASA.x + 44, y: CASA.y }, { x: q.piccolo.x, y: q.piccolo.y }] });
    await attesa(70);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [{ x: CASA.x + 44, y: CASA.y }] });
    await attesa(FINESTRA);
    const c = await pag.evaluate(chiudiFinestra, f.falli);
    B.calci += c.calci; B.passi += c.passi; if (c.passTo >= 0) B.bersaglio++;
    B.prove++;
    await dito.suSicuro(cdp); await attesa(120);
  }
  R.pulsante = B;
  console.log('    etichetta del pulsante: ' + B.etichetta);
  console.log('    palloni giocati ' + B.calci + ' su ' + B.prove + ' · con un compagno designato ' + B.bersaglio);

  /* la fotografia FINALE dei contatori: e' su questa che si giudica se
     la sonda ha visto qualcosa, non su un braccio a meta' corsa */
  const FINE = await pag.evaluate(() => ({ rice: Object.assign({}, window.__sonda.rice), totKick: window.__sonda.tot.kickBall, ripartenze: window.__sonda.ripartenze | 0 }));

  await browser.close(); srv.chiudi();

  /* ================================================================= */
  const perc = (a, b) => b ? (a / b * 100).toFixed(0) + '%' : '—';
  console.log('\n--- LA TAVOLA ---\n');
  console.log('                          calci  scivolate  falli*  cariche orfane   corsa mediana');
  console.log('  (* falli = tabellino di CAMPO dentro la finestra, di CHIUNQUE — contesto, non cancello)');
  const riga = (n, K) => console.log('  ' + n.padEnd(22) +
    String(K.calci).padStart(5) + String(K.scivolate).padStart(11) + String(K.falli).padStart(7) +
    String(K.orfane).padStart(16) + '   ' + K.corsaMediana.toFixed(1) + ' unita\'');
  riga('rilascio (touchend)', R.rilascio);
  riga('annulla (touchcancel)', R.annulla);
  riga('fermo (controllo)', R.fermo);
  console.log('\n  e sul PULSANTE GRANDE, ' + NG + ' prove per braccio:');
  console.log('    touchend   -> ' + R.tiroFine.tiri + ' tiri, ' + R.tiroFine.orfane + ' cariche orfane   (deve tirare)');
  console.log('    touchcancel-> ' + R.tiroAnnulla.tiri + ' tiri, ' + R.tiroAnnulla.orfane + ' cariche orfane   (non deve tirare)');
  console.log('\n  su ' + PROVE + ' prove per braccio.');
  console.log('  rilasci che hanno prodotto un calcio:      ' + perc(R.rilascio.calci, PROVE));
  console.log('  annullamenti che hanno prodotto un calcio: ' + perc(R.annulla.calci, PROVE));
  console.log('  fondo misurato col dito ancora premuto:    ' + perc(R.fermo.calci, PROVE));
  const quali = K => Object.keys(K.quali).length ? Object.entries(K.quali).map(([k, v]) => k + '×' + v).join(', ') : '(niente)';
  console.log('\n  cosa e\' stato chiamato, per braccio:');
  console.log('    rilascio  ' + quali(R.rilascio));
  console.log('    annulla   ' + quali(R.annulla));
  console.log('    fermo     ' + quali(R.fermo));

  /* ---------- l'autodiagnosi: la sonda ha davvero visto? ---------- */
  console.log('\n--- LA SONDA HA VISTO? ---');
  const rice = FINE.rice || {};
  const attesiCancel = PROVE + NG;
  console.log('  eventi touch arrivati alla pagina: start ' + rice.touchstart + ' · move ' + rice.touchmove +
    ' · end ' + rice.touchend + ' · CANCEL ' + rice.touchcancel);
  console.log('  chiamate a kickBall in tutta la corsa (chiunque): ' + FINE.totKick);
  console.log('  partite ricominciate perche\' il mondo si era incastrato: ' + FINE.ripartenze);
  let cieca = 0;
  if (rice.touchcancel < attesiCancel) {
    console.log('  NO   i touchcancel arrivati (' + rice.touchcancel + ') sono meno di quelli mandati (' + attesiCancel + '):');
    console.log('       il braccio dell\'annullamento non ha provato niente.');
    cieca++;
  } else console.log('  OK   tutti i ' + attesiCancel + ' touchcancel sono arrivati alla pagina');
  if (!FINE.totKick) { console.log('  NO   kickBall non e\' mai stata chiamata da nessuno: l\'avvolgimento non ha preso'); cieca++; }
  else console.log('  OK   l\'avvolgimento di kickBall e\' vivo');
  if (errori.length) { console.log('  NO   eccezioni in pagina: ' + errori.slice(0, 3).join(' | ')); cieca++; }
  else console.log('  OK   nessuna eccezione in pagina');

  /* ---------------------------- il verdetto ---------------------------- */
  console.log('\n--- VERDETTO ---');
  let male = 0;
  const dimmi = (ok, t, extra) => { if (!ok) male++; console.log((ok ? '  OK   ' : '  NO   ') + t + (extra ? '\n         ' + extra : '')); };
  dimmi(R.rilascio.calci <= R.fermo.calci,
    'un RILASCIO non produce piu\' calci del dito fermo: ' + R.rilascio.calci + ' contro ' + R.fermo.calci,
    R.rilascio.calci > R.fermo.calci ? 'staccare il pollice batte un pallone che nessuno ha chiesto' : '');
  dimmi(R.annulla.calci <= R.fermo.calci,
    'un ANNULLAMENTO non produce piu\' calci del dito fermo: ' + R.annulla.calci + ' contro ' + R.fermo.calci,
    R.annulla.calci > R.fermo.calci ? 'una notifica o il gesto indietro battono un pallone' : '');
  /* IL FALLO SI ATTRIBUISCE A CHI LO COMMETTE, e il tabellino non lo
     sa dire: G.stats.falli somma le due squadre, quindi una scivolata
     della CPU sul mio uomo dentro la finestra finiva addebitata al
     rilascio. E' successo davvero — 2 falli su 200 prove in un file
     dove il rilascio e' gia' INERTE, cioe' dove non poteva averli
     prodotti: il cancello stava accusando un innocente.
     Il fallo del comandato passa per forza da startSlide, che qui si
     conta per giocatore. Se il comandato non ha scivolato, non ha fatto
     falli. La colonna del tabellino resta stampata come CONTESTO — dice
     quanto si menavano in campo — ma non e' piu' il cancello. */
  dimmi(R.rilascio.scivolate + R.annulla.scivolate === 0,
    'ne\' rilascio ne\' annullamento producono SCIVOLATE (e quindi FALLI) del comandato: '
    + (R.rilascio.scivolate + R.annulla.scivolate),
    'falli di campo dentro le finestre, di chiunque: rilascio ' + R.rilascio.falli
    + ' · annulla ' + R.annulla.falli + ' · fermo ' + R.fermo.falli + '  (contesto, non cancello)');
  dimmi(R.annulla.orfane === 0,
    'un annullamento non lascia cariche di tiro orfane: ' + R.annulla.orfane,
    R.annulla.orfane ? 'il giocatore resta al 45% di velocita\' e SHOT_HARDCAP tirera\' da solo' : '');
  dimmi(R.rilascio.corsaMediana > 8,
    'IL GESTO DEL COMMITTENTE NON E\' CAMBIATO: trascinando, il comandato corre ' + R.rilascio.corsaMediana.toFixed(1) + ' unita\'');
  dimmi(R.tiroFine.tiri >= R.tiroFine.prove * 0.9,
    'sul pulsante grande il TOUCHEND ESEGUE: ' + R.tiroFine.tiri + ' tiri su ' + R.tiroFine.prove,
    R.tiroFine.tiri < R.tiroFine.prove * 0.9 ? 'il tiro non parte piu\': la riparazione ha rotto il comando' : '');
  dimmi(R.tiroAnnulla.tiri === 0,
    'sul pulsante grande il TOUCHCANCEL ANNULLA: ' + R.tiroAnnulla.tiri + ' tiri su ' + R.tiroAnnulla.prove,
    R.tiroAnnulla.tiri ? 'una notifica mentre carichi il tiro fa partire il tiro' : '');
  dimmi(R.tiroAnnulla.orfane === 0,
    'e non lascia la carica aperta: ' + R.tiroAnnulla.orfane + ' cariche orfane su ' + R.tiroAnnulla.prove);
  dimmi(B.calci >= B.prove * 0.6,
    'il pulsante piccolo col possesso GIOCA IL PALLONE: ' + B.calci + ' su ' + B.prove + ' (' + perc(B.calci, B.prove) + ')',
    B.calci < B.prove * 0.6 ? 'il passaggio non ha un posto dove vivere' : '');
  dimmi(cieca === 0, 'la sonda ha visto (nessun braccio cieco)');

  if (JSONOUT) {
    const d = path.resolve(JSONOUT);
    fs.mkdirSync(path.dirname(d), { recursive: true });
    fs.writeFileSync(d, JSON.stringify({ gioco: GIOCO, etichetta: ETICHETTA, prove: PROVE, R }, null, 1));
    console.log('\n  crudo in ' + d);
  }
  if (CONTRO && fs.existsSync(CONTRO)) {
    const P = JSON.parse(fs.readFileSync(CONTRO, 'utf8'));
    console.log('\n--- CONTRO ' + (P.etichetta || CONTRO) + ' ---');
    console.log('                          prima   oggi');
    for (const b of ['rilascio', 'annulla', 'fermo']) {
      console.log('  calci da ' + b.padEnd(15) + String(P.R[b].calci).padStart(5) + String(R[b].calci).padStart(7));
    }
    if (P.R.tiroFine) console.log('  tiri, grande+end     ' + String(P.R.tiroFine.tiri).padStart(5) + String(R.tiroFine.tiri).padStart(7));
    if (P.R.tiroAnnulla) console.log('  tiri, grande+cancel  ' + String(P.R.tiroAnnulla.tiri).padStart(5) + String(R.tiroAnnulla.tiri).padStart(7));
    if (P.R.pulsante) console.log('  palloni dal piccolo  ' + String(P.R.pulsante.calci).padStart(5) + String(R.pulsante.calci).padStart(7));
  }

  console.log('\n' + (male === 0 ? 'tutti i controlli passati' : male + ' controlli falliti'));
  console.log('Questo NON dice se il gioco e\' piacevole: dice quanti palloni partono da');
  console.log('un dito che si alza, e quanti da un dito a cui il sistema lo ha tolto.');
  if (male) process.exit(1);
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
