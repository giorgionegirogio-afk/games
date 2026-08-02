/* =====================================================================
   GIOCATA — il tocco del gioco, misurato con le dita.

   Tutto il collaudo finora ha guardato la CPU giocare contro se' stessa:
   fotografie, filmati, misure — mai un dito sullo schermo. Ma un gioco
   di calcio si giudica toccandolo: quanto tarda il giocatore a partire
   quando il dito lo trascina, quanto tarda la palla quando il dito la
   chiede, se la carica del tiro esiste sotto il dito o solo nel codice.
   Questo strumento manda gesti touch VERI (eventi di protocollo, non
   funzioni chiamate a mano) sul canvas del gioco, campiona lo stato a
   60 volte al secondo e trasforma "com'e' il tocco" in numeri: la
   LATENZA fra il gesto e la prima variazione di velocita' del bersaglio,
   e la RISPOSTA (velocita' massima raggiunta dalla palla dopo il gesto).

   Le giocate sono scritte su come il gioco E', non su come lo si
   immagina. Dal codice dell'input: stick virtuale ovunque sul canvas
   (tap col pallone = passaggio, flick veloce verso la porta = tiro,
   rilascio lento = niente); la carica tenuta col dito esiste SOLO in
   modalita' pulsanti (__test.setTouchButtons), sul bottone TIRA, con
   finestra dolce fra 0,50 e 0,80 secondi di pressione.

   Il cancello: se il bersaglio della giocata non cambia velocita' entro
   500 ms dal momento in cui il gesto COMANDA, la giocata e' NO e lo
   strumento esce con 1. Il momento che comanda non e' sempre l'inizio
   del gesto: per tap, flick e carica e' il rilascio — e' il dito che
   tiene aperta la carica, misurare dall'appoggio boccerebbe per
   costruzione anche una carica perfetta — mentre per il trascinamento
   e' l'appoggio del dito. Si stampano entrambe le distanze.

   La prova che sa fallire: --pausa esegue le stesse giocate col gioco
   in pausa (e rende l'overlay trasparente ai tocchi, se no il dito
   premerebbe RIPRENDI e la prova non proverebbe niente). Se anche una
   sola giocata dice OK in pausa, lo strumento sta attestando: va
   riparato, non consegnato.

   uso:
     node strumenti/giocata.js --giocata tiro
     node strumenti/giocata.js --tutte
     node strumenti/giocata.js --tutte --filmato filmati/giocate.webm --json giocate.json
     node strumenti/giocata.js --tutte --pausa     (deve dire NO e uscire con 1)
     node strumenti/giocata.js --elenco
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
const attesa = ms => new Promise(r => setTimeout(r, ms));
const dentro = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const esiti = [];
function verifica(ok, testo, dettaglio) {
  esiti.push(!!ok);
  console.log((ok ? '  OK   ' : '  NO   ') + testo + (dettaglio ? '\n         ' + dettaglio : ''));
}

/* --------------------------------------------------- dita di protocollo
   Un solo dito, mosso con Input.dispatchTouchEvent: sono gli stessi
   eventi che manda lo schermo di un telefono, non chiamate alle funzioni
   del gioco. Se il gioco non li ascolta, qui non risponde niente. */
const dito = {
  giu: (cdp, x, y) => cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }),
  sposta: (cdp, x, y) => cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] }),
  su: (cdp) => cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }),
};

/* ============================================================ GIOCATE ==
   Ognuna: come si prepara il campo (possesso o palla libera davanti),
   quale bersaglio deve rispondere, quale istante del gesto comanda
   ('inizio' = appoggio del dito, 'fine' = rilascio), e il gesto stesso.
   ====================================================================== */
const GIOCATE = {
  tocco: {
    titolo: 'tap semplice vicino alla palla (col pallone al piede = passaggio)',
    possesso: true, avanti: 0, bersaglio: 'palla', comando: 'fine',
    async gesto(cdp, pag, info) {
      const x = dentro(info.palla.x + 26, 15, info.vw - 15);
      const y = dentro(info.palla.y + 8, 60, info.vh - 60);
      await dito.giu(cdp, x, y);
      await attesa(80);
      await dito.su(cdp);
    },
  },
  trascina: {
    titolo: 'trascinamento del giocatore verso la palla libera',
    possesso: false, avanti: 110, bersaglio: 'giocatore', comando: 'inizio',
    async gesto(cdp, pag, info) {
      let x = info.comandato.x, y = info.comandato.y;
      const dx = info.palla.x - x, dy = info.palla.y - y, l = Math.max(1, Math.hypot(dx, dy));
      const px = dx / l, py = dy / l;
      await dito.giu(cdp, x, y);
      /* 14 passi da 7 px: si supera la zona morta dello stick (12 px),
         si arriva alla corsa piena (46 px) e oltre (sprint a 66 px) */
      for (let i = 0; i < 14; i++) {
        x = dentro(x + px * 7, 15, info.vw - 15);
        y = dentro(y + py * 7, 60, info.vh - 60);
        await dito.sposta(cdp, x, y);
        await attesa(28);
      }
      /* il dito resta fermo prima di alzarsi: il rilascio lento non e'
         un flick, quindi non parte nessun tiro o scivolata per sbaglio */
      await attesa(350);
      await dito.su(cdp);
    },
  },
  tiro: {
    titolo: 'flick veloce verso la porta col pallone al piede',
    possesso: true, avanti: 0, bersaglio: 'palla', comando: 'fine', richiedeTiro: true,
    async gesto(cdp, pag, info) {
      /* la squadra 0 attacca verso destra: il flick deve andare a destra
         (nx > 0.25) e superare i 650 px/s negli ultimi 90 ms. I punti si
         spediscono in RAFFICA, senza aspettare il giro di ogni chiamata:
         aspettandolo, ogni evento costava decine di millisecondi di
         viaggio (di piu' con la registrazione video accesa), il flick
         usciva lento e il gioco lo leggeva — a ragione — come un
         rilascio semplice, cioe' un passaggio. In quel caso lo strumento
         stava bocciando la lentezza del proprio dito, non il gioco.
         L'ordine sul protocollo e' comunque garantito. */
      let x = dentro(info.comandato.x, 15, info.vw - 250);
      const y = dentro(info.comandato.y, 60, info.vh - 60);
      await dito.giu(cdp, x, y);
      const invii = [];
      for (let i = 0; i < 5; i++) {
        x += 44;
        invii.push(dito.sposta(cdp, x, y));
      }
      invii.push(dito.su(cdp));
      await Promise.all(invii);
    },
  },
  carica: {
    titolo: 'pressione tenuta ~600 ms sul bottone TIRA (modalita\' pulsanti), poi rilascio',
    possesso: true, avanti: 0, bersaglio: 'palla', comando: 'fine', richiedeTiro: true,
    async gesto(cdp, pag, info) {
      /* la carica col dito esiste solo coi 3 pulsanti virtuali: si
         accende l'opzione, si preme TIRA, la si rispegne alla fine.
         600 ms cadono dentro la finestra dolce 500-800 ms del gioco. */
      await pag.evaluate(() => window.__test.setTouchButtons(true));
      const x = info.vw - 66, y = info.vh - 140;     // bottone TIRA, squadra 0
      await dito.giu(cdp, x, y);
      await attesa(600);
      await dito.su(cdp);
      await pag.evaluate(() => window.__test.setTouchButtons(false));
    },
  },
};

/* ------------------------------------------------------------- sonda --
   Vive nella pagina: un ciclo rAF che campiona palla, giocatore
   comandato e giocatore piu' vicino alla palla, piu' un orecchio in
   cattura sugli eventi touch per sapere QUANDO la pagina li ha visti
   davvero (la latenza si misura da li', non da quando il nodo li ha
   spediti). */
function installaSonda() {
  window.__sonda = { campioni: [], eventi: [], via: false };
  for (const tipo of ['touchstart', 'touchmove', 'touchend']) {
    addEventListener(tipo, e => {
      if (!window.__sonda.via) return;
      const c = e.changedTouches && e.changedTouches[0];
      window.__sonda.eventi.push({ tipo, t: performance.now(), x: c ? c.clientX : null, y: c ? c.clientY : null });
    }, { capture: true, passive: true });
  }
  window.__sondaVia = () => {
    const S = window.__sonda;
    S.campioni.length = 0; S.eventi.length = 0; S.via = true;
    const G = window.__test.G;
    const giro = () => {
      if (!S.via) return;
      const pi = G.ctrl[0];
      const p = pi >= 0 ? G.players[pi] : null;
      let vic = null, vi = -1, dm = 1e9;
      for (let i = 0; i < G.players.length; i++) {
        const q = G.players[i];
        const d = Math.hypot(q.x - G.ball.x, q.y - G.ball.y);
        if (d < dm) { dm = d; vic = q; vi = i; }
      }
      const b = G.ball;
      S.campioni.push({
        t: performance.now(),
        palla: { x: b.x, y: b.y, vx: b.vx, vy: b.vy, owner: b.owner },
        comandato: p ? { i: pi, x: p.x, y: p.y, vx: p.vx, vy: p.vy, carica: p.charge !== undefined ? p.charge : null } : null,
        vicino: vic ? { i: vi, x: vic.x, y: vic.y, vx: vic.vx, vy: vic.vy } : null,
        scena: G.scene, pausa: !!G.paused,
      });
      requestAnimationFrame(giro);
    };
    requestAnimationFrame(giro);
  };
  window.__sondaAlt = () => {
    window.__sonda.via = false;
    return { campioni: window.__sonda.campioni, eventi: window.__sonda.eventi };
  };
}

/* --------------------------------------------------- quiete sul campo --
   Ogni giocata parte da uno stato governato: partita in corso, palla
   ferma (al piede o libera davanti al giocatore comandato), avversari
   allontanati quanto basta a non rubare la misura nei 500 ms del
   cancello. Tutto con gli hook __test: il file del gioco non si tocca. */
function preparaQuiete([possesso, avanti]) {
  const t = window.__test, G = t.G;
  t.setPaused && t.setPaused(false);
  try { if (t.Tut && t.Tut.active && t.Tut.finish) t.Tut.finish(true); } catch (e) {}
  for (let i = 0; i < 300 && G.scene !== 'play'; i++) t.simulate(0.1);
  if (G.scene !== 'play') return { errore: "la partita non arriva mai in gioco: scena '" + G.scene + "'" };
  t.setTimeLeft && t.setTimeLeft(80);      // mai a ridosso del fischio finale
  const pi = G.ctrl[0];
  if (pi < 0) return { errore: 'nessun giocatore comandato (G.ctrl[0] = -1)' };
  const p = G.players[pi];
  for (const q of G.players) { q.vx = 0; q.vy = 0; }
  const b = G.ball;
  b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0; b.curve = 0; b.passTo = -1;
  /* la palla si mette dal lato del centro dello schermo, cosi' il gesto
     resta dentro il viewport qualunque sia la posizione del comandato */
  const v = t.view;
  const cx = (innerWidth / 2 - v.Ax) / v.S2;
  const dir = cx >= p.x ? 1 : -1;
  if (possesso) { b.owner = pi; b.x = p.x + dir * 8; b.y = p.y; }
  else { b.owner = -1; b.x = p.x + dir * avanti; b.y = p.y; }
  for (const q of G.players) {
    if (q.team === 0) continue;
    const d = Math.hypot(q.x - b.x, q.y - b.y);
    if (d < 170) {
      const l = Math.max(1, d);
      q.x = b.x + (q.x - b.x) / l * 230;
      q.y = b.y + (q.y - b.y) / l * 230;
    }
  }
  const sx = w => w * v.S2 + v.Ax, sy = w => w * v.S2 + v.Ay;
  return {
    pi,
    palla: { x: sx(b.x), y: sy(b.y) },
    comandato: { x: sx(p.x), y: sy(p.y) },
    vw: innerWidth, vh: innerHeight,
  };
}

/* ------------------------------------------------------------ analisi --
   La latenza si conta dall'istante in cui il gesto comanda alla prima
   variazione del VETTORE velocita' del bersaglio rispetto alla base
   presa in quell'istante. Le soglie tengono fuori il tremolio: un calcio
   vero vale centinaia di unita' al secondo. */
const SOGLIA_PALLA = 40, SOGLIA_GIOC = 15;   // unita' mondo al secondo
function analizza(dati, comando, bersaglio) {
  const ev = dati.eventi || [];
  if (!ev.length) return { errore: 'nessun evento touch e\' arrivato alla pagina' };
  const inizio = ev.find(e => e.tipo === 'touchstart');
  const fine = [...ev].reverse().find(e => e.tipo === 'touchend');
  const comandoT = comando === 'inizio' ? (inizio && inizio.t) : (fine && fine.t);
  if (comandoT == null) return { errore: 'gesto incompleto: alla pagina manca il touch' + (comando === 'inizio' ? 'start' : 'end') };
  const C = dati.campioni || [];
  if (!C.length) return { errore: 'nessun campione: la sonda non ha girato' };
  let base = null;
  for (const c of C) { if (c.t <= comandoT) base = c; else break; }
  if (!base) base = C[0];
  const vel = c => bersaglio === 'palla'
    ? [c.palla.vx || 0, c.palla.vy || 0]
    : [c.comandato ? c.comandato.vx || 0 : 0, c.comandato ? c.comandato.vy || 0 : 0];
  const [bx, by] = vel(base);
  const soglia = bersaglio === 'palla' ? SOGLIA_PALLA : SOGLIA_GIOC;
  let risp = null;
  for (const c of C) {
    if (c.t <= comandoT) continue;
    const [vx, vy] = vel(c);
    if (Math.hypot(vx - bx, vy - by) > soglia) { risp = c; break; }
  }
  let vmax = 0, caricaMax = 0;
  for (const c of C) {
    if (c.t <= comandoT - 700) continue;   // la carica matura PRIMA del rilascio
    if (c.comandato && c.comandato.carica != null) caricaMax = Math.max(caricaMax, c.comandato.carica);
    if (c.t > comandoT) vmax = Math.max(vmax, Math.hypot(c.palla.vx || 0, c.palla.vy || 0));
  }
  /* velocita' del flick COME L'HA VISTA LA PAGINA: stessi 90 ms che
     guarda il gioco al rilascio. Serve a distinguere "il gioco non legge
     il tiro" da "il dito dello strumento era lento". */
  let flickPxS = null;
  if (fine) {
    const mosse = ev.filter(e => e.tipo !== 'touchend' && e.x != null && fine.t - e.t <= 90);
    if (mosse.length >= 2) {
      const a0 = mosse[0], a1 = mosse[mosse.length - 1];
      flickPxS = Math.hypot(a1.x - a0.x, a1.y - a0.y) / Math.max(1, a1.t - a0.t) * 1000;
    }
  }
  return {
    latenzaMs: risp ? risp.t - comandoT : null,
    dallInizioMs: risp && inizio ? risp.t - inizio.t : null,
    rispostaMax: vmax,
    caricaMax,
    flickPxS,
  };
}

/* ================================================================ main = */
(async () => {
  if (process.argv.includes('--elenco')) {
    for (const k of Object.keys(GIOCATE)) console.log(k.padEnd(10) + GIOCATE[k].titolo);
    return;
  }
  const inPausa = process.argv.includes('--pausa');
  const nomi = process.argv.includes('--tutte')
    ? Object.keys(GIOCATE)
    : [arg('giocata', null)].filter(Boolean);
  if (!nomi.length) { console.error('serve --giocata <nome> oppure --tutte oppure --elenco'); process.exit(1); }
  for (const n of nomi) {
    if (!GIOCATE[n]) { console.error('giocata sconosciuta: ' + n + '\ngiocate: ' + Object.keys(GIOCATE).join(', ')); process.exit(1); }
  }
  const fileFilmato = arg('filmato', null);
  const fileJson = arg('json', null);
  const seme = +arg('seme', 20260731);

  const tmp = fileFilmato ? fs.mkdtempSync(path.join(os.tmpdir(), 'giocata-')) : null;
  const srv = await servi();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 915, height: 412 }, deviceScaleFactor: 1,
    isMobile: true, hasTouch: true, locale: 'it-IT',
    ...(fileFilmato ? { recordVideo: { dir: tmp, size: { width: 915, height: 412 } } } : {}),
  });
  const pag = await ctx.newPage();

  /* il caso, governato: stesso generatore a seme fisso di scatta.js,
     installato PRIMA che la pagina esegua una sola riga */
  await pag.addInitScript(s0 => {
    let x = s0 >>> 0 || 1;
    const p = () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x >>> 0; };
    Math.random = () => p() / 4294967296;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = p(); return a; };
    }
  }, seme);

  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.waitForTimeout(500);
  await pag.evaluate(installaSonda);
  await pag.evaluate(() => {
    const t = window.__test;
    t.dismissSplash && t.dismissSplash();
    t.startMatch(1, 1);                     // 1 giocatore: la squadra 0 e' del dito
  });
  await pag.waitForTimeout(400);

  const cdp = await ctx.newCDPSession(pag);
  const raccolta = [];

  console.log(`\n=== GIOCATE COL DITO${inPausa ? ' — GIOCO IN PAUSA (deve fallire)' : ''} ===\n`);

  for (const nome of nomi) {
    const g = GIOCATE[nome];
    const info = await pag.evaluate(preparaQuiete, [g.possesso, g.avanti]);
    if (info.errore) {
      verifica(false, `${nome}: ${g.titolo}`, info.errore);
      raccolta.push({ nome, esito: 'NO', errore: info.errore });
      continue;
    }
    if (inPausa) {
      /* pausa vera, e overlay trasparente ai tocchi: se il dito premesse
         RIPRENDI la pausa cadrebbe e la prova non proverebbe niente.
         Cosi' gli eventi ARRIVANO al canvas ed e' il gioco a doverli
         ignorare perche' G.paused — il collaudo piu' severo possibile. */
      await pag.evaluate(() => {
        window.__test.setPaused(true);
        const el = document.getElementById('pausa');
        if (el) el.style.pointerEvents = 'none';
      });
    }
    /* il tabellino prima del gesto: per 'tiro' e 'carica' la velocita'
       della palla non basta — anche un passaggio la muove. Fa fede il
       contatore dei tiri del gioco: se non sale, il gesto non e' stato
       letto come tiro, qualunque cosa abbia fatto la palla. */
    const prima = await pag.evaluate(() => ({
      tiri: window.__test.G.stats.tiri[0], perfetti: window.__test.G.stats.perfetti[0],
    }));
    await pag.evaluate(() => window.__sondaVia());
    await attesa(150);                       // base di quiete prima del gesto
    await g.gesto(cdp, pag, info);
    await attesa(1300);                      // finestra di risposta
    const dati = await pag.evaluate(() => window.__sondaAlt());
    const dopo = await pag.evaluate(() => ({
      tiri: window.__test.G.stats.tiri[0], perfetti: window.__test.G.stats.perfetti[0],
    }));
    const tiriFatti = dopo.tiri - prima.tiri, perfettiFatti = dopo.perfetti - prima.perfetti;
    const a = analizza(dati, g.comando, g.bersaglio);

    if (a.errore) {
      verifica(false, `${nome}: ${g.titolo}`, a.errore);
      raccolta.push({ nome, esito: 'NO', errore: a.errore, campioni: dati.campioni, eventi: dati.eventi });
      continue;
    }
    const rispondeInTempo = a.latenzaMs != null && a.latenzaMs <= 500;
    const passa = rispondeInTempo && (!g.richiedeTiro || tiriFatti >= 1);
    const chi = g.bersaglio === 'palla' ? 'la palla' : 'il giocatore comandato';
    const daQuando = g.comando === 'inizio' ? "dall'appoggio del dito" : 'dal rilascio';
    verifica(passa, `${nome}: ${g.titolo}`,
      a.latenzaMs == null
        ? `${chi} non cambia mai velocita' dopo il gesto: nessuna risposta`
        : !passa
          ? `la palla si muove (latenza ${a.latenzaMs.toFixed(0)} ms) ma il tabellino non segna tiri: il gesto e' stato letto come altro` +
            (a.flickPxS != null ? ` (flick visto dalla pagina: ${a.flickPxS.toFixed(0)} px/s, al gioco ne servono 650)` : '')
          : `latenza ${a.latenzaMs.toFixed(0)} ms ${daQuando}` +
            (a.dallInizioMs != null && g.comando !== 'inizio' ? ` (${a.dallInizioMs.toFixed(0)} ms dall'inizio del gesto)` : '') +
            ` — risposta: palla fino a ${a.rispostaMax.toFixed(0)} unita'/s` +
            (g.richiedeTiro ? ` — tiri a tabellino +${tiriFatti}, perfetti +${perfettiFatti}` : '') +
            (nome === 'tiro' && a.flickPxS != null ? ` — flick ${a.flickPxS.toFixed(0)} px/s` : '') +
            (nome === 'carica' ? ` — carica maturata ${a.caricaMax.toFixed(2)} s (finestra dolce 0,50-0,80)` : ''));
    raccolta.push({
      nome, esito: passa ? 'OK' : 'NO',
      latenzaMs: a.latenzaMs, dallInizioMs: a.dallInizioMs,
      rispostaMaxUnitaAlSecondo: a.rispostaMax, caricaMaturataSec: a.caricaMax,
      flickPxS: a.flickPxS, tiriATabellino: tiriFatti, tiriPerfetti: perfettiFatti,
      comando: g.comando, bersaglio: g.bersaglio,
      campioni: dati.campioni, eventi: dati.eventi,
    });
  }

  /* video: si salva DOPO la chiusura del contesto ma PRIMA di quella del
     browser — dopo, non c'e' piu' nessuno a cui chiederlo */
  const video = fileFilmato ? pag.video() : null;
  await ctx.close();
  if (fileFilmato) {
    const uscita = path.resolve(fileFilmato);
    fs.mkdirSync(path.dirname(uscita), { recursive: true });
    await video.saveAs(uscita);
    console.log(`\nfilmato: ${uscita} (${(fs.statSync(uscita).size / 1024).toFixed(0)} kB)`);
  }
  await browser.close();
  srv.chiudi();
  if (tmp) fs.rmSync(tmp, { recursive: true, force: true });

  if (fileJson) {
    const uscita = path.resolve(fileJson);
    fs.mkdirSync(path.dirname(uscita), { recursive: true });
    fs.writeFileSync(uscita, JSON.stringify({ data: new Date().toISOString(), seme, pausa: inPausa, giocate: raccolta }, null, 1));
    console.log(`json: ${uscita} (${raccolta.reduce((s, g) => s + (g.campioni ? g.campioni.length : 0), 0)} campioni a 60 Hz)`);
  }

  const male = esiti.filter(x => !x).length;
  console.log(`\n${esiti.length} giocate, ${esiti.length - male} passate, ${male} fallite`);
  if (male) {
    console.log("Una giocata fallita vuol dire che il dito ha chiesto e il gioco non ha risposto entro mezzo secondo.");
    process.exit(1);
  }
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
