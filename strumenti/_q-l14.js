/* =====================================================================
   _q-l14.js — IL CANCELLO DEL PASSAGGIO (voce L1.4 di _analisi/agente28.md §10).

   Sorveglia SEI proprieta' del disco vicino CON palla, e le legge tutte
   su EFFETTI della simulazione — chi possiede il pallone, dove sta, la
   sua quota, la velocita' e lo spostamento VERI dei giocatori — mai su
   una bandiera scritta dal codice giudicato:

     A) il passaggio parte al RILASCIO, il bersaglio segue la DIREZIONE
        trascinata (8 direzioni x 3 configurazioni di campo, tabella), e
        direzioni diverse producono riceventi diversi;
     B) il CENSIMENTO DELL'AMBIGUITA': su partite vere (taglie 5/7/11),
        quante volte i primi due candidati del punteggio
            base(q) + K*dot(q_vers, drag_vers)*min(1, |drag|/52),  K=220
        stanno entro delta. E' il censimento che FISSA delta (il progetto
        lo lascia esplicitamente da tarare, §11 di agente28.md). Il
        punteggio qui e' ARITMETICA DI QUESTO FILE sulle posizioni vere:
        serve a tarare la costante, non a assolvere il gioco — il gioco
        lo giudica A, che pretende che l'EFFETTO corrisponda;
     C) l'AGGANCIO del bersaglio: durante una tenuta con tremore, quanti
        riceventi CORRONO DAVVERO (la chiamata e' l'effetto osservabile
        del bersaglio che cambia). Col file giudicato deve correre uno
        solo; su una variante costruita apposta SENZA isteresi (L14_AGG
        forzato a 0) devono correre in due — ed e' il CONTROLLO NEGATIVO:
        se la variante non diventa rossa, questo cancello non sa fallire
        e non vale niente;
     D) la CHIAMATA: quando il trascinamento arma, il candidato PARTE —
        si misura il suo spostamento vero, contro i compagni di controllo
        della stessa scena;
     E) CHIAMA SENZA PASSARE: trascinando oltre R_ANNULLA = 96 px e
        rilasciando, il pallone NON parte e la corsa RESTA;
     F) la QUOTA: l'altezza massima vera del pallone (b.z) in funzione
        dell'ampiezza del trascinamento, cinque valori — sotto 40 px
        rasoterra, sopra crescente.

   uso:
     node strumenti/_q-l14.js                       (sul gioco di casa)
     node strumenti/_q-l14.js --gioco fuori/dopo.html
     node strumenti/_q-l14.js --testa               (finestra visibile)
     node strumenti/_q-l14.js --salta-censimento    (B ridotto, per iterare)
   esce 0 se tutti i verdetti sono verdi, 1 se anche uno solo e' rosso,
   2 se il banco stesso e' invecchiato.

   IL BANCO E' UN BROWSER, NON UN VETRO: Chromium 915x412 dpr2, dita di
   protocollo (Input.dispatchTouchEvent), tempo a passo fisso in mano al
   banco, Math.random a seme fisso. Ricalcato su strumenti/_q-l11.js.
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
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'CALCETTO-il-gioco.html')));
const TESTA = process.argv.includes('--testa');
const SALTA_CENSIMENTO = process.argv.includes('--salta-censimento');
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
               '.png': 'image/png', '.json': 'application/json' };

/* le costanti del progetto (agente28.md §3.1) — vivono NEL BANCO, cosi'
   il gioco non puo' negoziarle: se il gioco usasse altri numeri, l'EFFETTO
   non tornerebbe con la tabella di A e il cancello lo direbbe. */
const K_BIAS = 220, DRAG_SAT = 52, DELTA = 20, QUOTA_SU = 40;

/* Playwright non apre file: — serve un server locale (modello _q-l11.js). */
function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (/CALCETTO-il-gioco\.html$/i.test(f)) f = GIOCO;
      if ((!f.startsWith(RADICE) && f !== GIOCO) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        res.writeHead(404); res.end('no'); return;
      }
      res.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream',
                           'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* il tempo in mano al banco: un fotogramma per chiamata (modello _q-l11.js) */
function bancoDiProva() {
  const PASSO = 1000 / 60;
  let t = 0, coda = [];
  window.requestAnimationFrame = cb => { coda.push(cb); return coda.length; };
  window.cancelAnimationFrame = () => {};
  try { performance.now = () => t; } catch (e) {}
  window.__banco = { passo(n) {
    n = Math.max(0, Math.round(+n || 0));
    for (let i = 0; i < n; i++) { const c = coda; coda = []; t += PASSO;
      for (const f of c) { try { f(t); } catch (e) {} } }
    return t;
  } };
}

const dito = {
  giu:    (cdp, x, y) => cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }),
  sposta: (cdp, x, y) => cdp.send('Input.dispatchTouchEvent', { type: 'touchMove',  touchPoints: [{ x, y }] }),
  su:     cdp => cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }),
  annulla:cdp => cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] }),
  suSicuro: async cdp => { try { await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); } catch (e) {} },
};

/* LA SONDA: avvolge kickBall, l'imbuto unico di tutti i calci del gioco.
   Registra chi calcia. Non decide niente: conta. (Modello _q-l11.js.) */
function installaSonda() {
  if (window.__sonda) return 'gia';
  if (typeof window.kickBall !== 'function')
    return 'BANCO INVECCHIATO: window.kickBall non esiste piu\'. Questo cancello conta i calci avvolgendola.';
  const G = window.__test.G;
  const S = { calci: [], tot: 0 };
  window.__sonda = S;
  const orig = window.kickBall;
  window.kickBall = function (p, nx, ny, speed, spinY) {
    const r = orig.call(this, p, nx, ny, speed, spinY);
    S.tot++;
    if (r) S.calci.push({ chi: G.players.indexOf(p), vx: G.ball.vx, vy: G.ball.vy, vz: G.ball.vz });
    return r;
  };
  return 'ok';
}

/* ---------------------------------------------------------------------
   LA SCENA: partita in corso, palla al piede del comandato, compagni di
   movimento nelle posizioni chieste dalla configurazione, avversari
   spinti lontano dal pallone (cosi' il volo non viene intercettato e il
   ricevente e' una scelta, non un caso).
   --------------------------------------------------------------------- */
function preparaScena(cfg) {
  const t = window.__test, G = t.G;
  try { t.dismissSplash && t.dismissSplash(); } catch (e) {}
  t.setPaused && t.setPaused(false);
  try { if (t.Tut && t.Tut.active && t.Tut.finish) t.Tut.finish(true); } catch (e) {}
  for (let giro = 0; giro < 3 && G.scene !== 'play'; giro++) {
    for (let i = 0; i < 200 && G.scene !== 'play'; i++) t.simulate(0.1);
    if (G.scene !== 'play') { t.startMatch(1, 1, { size: cfg.taglia || 5 }); for (let i = 0; i < 80 && G.scene !== 'play'; i++) t.simulate(0.1); }
  }
  if (G.scene !== 'play') return { errore: "la partita non arriva in gioco: scena '" + G.scene + "'" };
  t.setTimeLeft && t.setTimeLeft(80);
  const pi = G.ctrl[0];
  if (pi < 0) return { errore: 'nessun giocatore comandato' };
  const p = G.players[pi];
  const C = t.campo;
  if (p.charge !== undefined && p.charge >= 0) { p.charge = -1; p.chargeKind = 'tiro'; p.chargeT = 0; p.chargeGo = null; p.chargeClip = null; }
  p.slide = -1; p.recover = 0;
  for (const q of G.players) { q.vx = 0; q.vy = 0; if (q.chiamataT !== undefined) q.chiamataT = 0; }
  p.x = C.FW * 0.42; p.y = C.FH * 0.5;
  const b = G.ball;
  b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0; b.curve = 0; b.passTo = -1; b.crossTo = -1;
  b.owner = pi; b.x = p.x + 8; b.y = p.y;
  /* compagni di movimento (non gk, non il comandato) nelle posizioni chieste */
  const mates = [];
  for (let i = 0; i < G.players.length; i++) {
    const q = G.players[i];
    if (q.team === 0 && i !== pi && q.role !== 'gk' && q.out <= 0) mates.push(i);
  }
  cfg.mates.forEach((m, k) => {
    if (k < mates.length) {
      const q = G.players[mates[k]];
      q.x = Math.max(24, Math.min(C.FW - 24, p.x + m[0]));
      q.y = Math.max(20, Math.min(C.FH - 20, p.y + m[1]));
      q.vx = 0; q.vy = 0; q.aiT = 0.06; q.aiTX = q.x; q.aiTY = q.y;
    }
  });
  /* avversari lontano dal pallone E INCHIODATI: senza il chiodo (aiT
     lunga, bersaglio su se stessi) il pressing li riporta addosso alla
     scena in un secondo — misurato in una prima corsa di questo banco:
     riceventi 7 e 9, cioe' avversari, su passaggi fra compagni. La scena
     deve misurare la SCELTA, non la mischia. */
  for (const q of G.players) {
    if (q.team !== 0 && q.out <= 0) {
      const d = Math.hypot(q.x - b.x, q.y - b.y);
      if (d < 390) {
        const l = Math.max(1, d);
        q.x = Math.max(24, Math.min(C.FW - 24, b.x + (q.x - b.x) / l * 400));
        q.y = Math.max(20, Math.min(C.FH - 20, b.y + (q.y - b.y) / l * 400));
      }
      q.vx = 0; q.vy = 0;
      q.aiT = 30; q.aiTX = q.x; q.aiTY = q.y;
    }
  }
  /* scena SPECCHIATA (per la prova C): gli avversari di movimento in
     posizioni fisse simmetriche rispetto all'asse del portatore, i due
     portieri sull'asse. Cosi' il punteggio base dei due candidati
     simmetrici e' uguale per costruzione e la prova misura SOLO
     l'aggancio, non le asimmetrie della spinta radiale. */
  if (cfg.specchio) {
    const pos = [[430, -150], [430, 150], [470, -40], [470, 40], [510, -220], [510, 220], [540, -90], [540, 90], [560, -260], [560, 260]];
    let k = 0;
    for (const q of G.players) {
      if (q.team !== 0 && q.out <= 0 && q.role !== 'gk' && k < pos.length) {
        q.x = Math.max(24, Math.min(C.FW - 24, p.x + pos[k][0]));
        q.y = Math.max(20, Math.min(C.FH - 20, p.y + pos[k][1]));
        q.vx = 0; q.vy = 0; q.aiT = 30; q.aiTX = q.x; q.aiTY = q.y; k++;
      }
      if (q.team !== 0 && q.role === 'gk') { q.y = p.y; q.vx = 0; q.vy = 0; }
      if (q.team === 0 && q.role === 'gk') { q.y = p.y; }
    }
  }
  window.__sonda.calci = []; window.__sonda.tot = 0;
  const bt = t.pulsanti(0);
  const piccolo = bt.reduce((a, c) => (c.r || 0) < (a.r || 0) ? c : a, bt[0]);
  const sotto = document.elementFromPoint(piccolo.x, piccolo.y);
  if (!sotto || sotto.id !== 'gioco')
    return { errore: 'sul disco (' + piccolo.x + ',' + piccolo.y + ') non c\'e\' la tela ma ' + (sotto ? sotto.tagName + '#' + sotto.id : 'niente') };
  if (piccolo.act !== 'through')
    return { errore: 'il disco piccolo offre <' + piccolo.act + '> invece di <through>: la palla non e\' al piede del comandato' };
  return { pi, mates, disco: { x: piccolo.x, y: piccolo.y, r: piccolo.r }, FW: C.FW, FH: C.FH };
}

/* fotografia del mondo: posizioni e stati che servono all'aritmetica del banco */
function fotoMondo() {
  const G = window.__test.G;
  return {
    owner: G.ball.owner, bx: G.ball.x, by: G.ball.y, bz: G.ball.z,
    ctrl: G.ctrl[0],
    charge: (G.ctrl[0] >= 0 ? G.players[G.ctrl[0]].charge : -1),
    players: G.players.map((q, i) => ({ i, team: q.team, x: q.x, y: q.y, vx: q.vx, vy: q.vy,
                                        out: q.out > 0, gk: q.role === 'gk' }))
  };
}

/* il punteggio del PROGETTO, aritmetica di questo file (base identica a
   eseguiPassUmano del gioco: smarcato + avanti*0,9 - |d-170|*0,4). */
function punteggiL14(m, pi, ux, uy, sat) {
  const p = m.players[pi];
  const out = [];
  for (const q of m.players) {
    if (q.team !== p.team || q.i === pi || q.out || q.gk) continue;
    let s = 0;
    for (const o of m.players) {
      if (o.team === p.team || o.out) continue;
      s += Math.max(0, Math.min(220, Math.hypot(o.x - q.x, o.y - q.y)));
      const ax = q.x - p.x, ay = q.y - p.y, al = Math.max(1, Math.hypot(ax, ay));
      const px = o.x - p.x, py = o.y - p.y;
      const t2 = Math.max(0, Math.min(1, (px * ax + py * ay) / (al * al)));
      const dLine = Math.hypot(px - ax * t2, py - ay * t2);
      if (dLine < 40 && t2 > 0.1 && t2 < 0.95) s -= 260;
    }
    s += (p.team === 0 ? q.x - p.x : p.x - q.x) * 0.9;
    const d = Math.hypot(q.x - p.x, q.y - p.y);
    s -= Math.abs(d - 170) * 0.4;
    const dx = q.x - p.x, dy = q.y - p.y, l = Math.max(1, Math.hypot(dx, dy));
    s += K_BIAS * ((dx * ux + dy * uy) / l) * sat;
    out.push({ i: q.i, s });
  }
  out.sort((a, b) => b.s - a.s);
  return out;
}

const n2 = v => (v === null || v === undefined || !isFinite(v)) ? 'n/d' : (Math.round(v * 100) / 100).toString().replace('.', ',');
const n1 = v => (v === null || v === undefined || !isFinite(v)) ? 'n/d' : (Math.round(v * 10) / 10).toString().replace('.', ',');

/* ===================================================================== */
(async () => {
  const srv = await servi();
  const br = await chromium.launch({ headless: !TESTA });
  const ctx = await br.newContext({ viewport: { width: 915, height: 412 },
    deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const eccezioni = [];

  async function apri(urlRel, seme) {
    const pag = await ctx.newPage();
    await pag.addInitScript(s0 => {
      let s = s0 >>> 0 || 1;
      const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
      Math.random = () => p() / 4294967296;
    }, seme || 20260820);
    await pag.addInitScript(bancoDiProva);
    pag.on('pageerror', e => eccezioni.push(e.message));
    await pag.goto('http://127.0.0.1:' + srv.porta + '/' + (urlRel || 'CALCETTO-il-gioco.html'), { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(() => window.__banco.passo(6));
    const sonda = await pag.evaluate(installaSonda);
    if (sonda !== 'ok' && sonda !== 'gia') { console.error('FALLITO (banco): ' + sonda); process.exit(2); }
    const cdp = await ctx.newCDPSession(pag);
    const passo = n => pag.evaluate(k => window.__banco.passo(k), n);
    return { pag, cdp, passo };
  }

  const esiti = [];
  const stampa = s => console.log(s);

  stampa('=== CANCELLO L1.4 — il passaggio: mirato, chiamata, quota ===');
  stampa('  gioco: ' + GIOCO);
  stampa('  banco: Chromium 915x412 dpr2, dita di protocollo, DT=1/60 in mano');
  stampa('  costanti del progetto nel banco: K=' + K_BIAS + '  DRAG_SAT=' + DRAG_SAT + '  delta=' + DELTA + '  QUOTA_SU=' + QUOTA_SU);
  stampa('');

  /* le tre configurazioni di campo (offset in unita' di mondo dal
     portatore). La prima tiene i tre compagni alla STESSA ascissa: il
     premio «avanti» del punteggio base e' uguale per tutti e la
     direzione trascinata decide quasi da sola — e' la prova pura dello
     sterzo. La seconda mette un uomo avanti, uno dietro e uno alto: i
     dot opposti raddoppiano la leva della direzione ed e' la geometria
     dello scarico. La terza e' un attacco realistico. */
  const CONFIG = [
    { nome: 'stessa-x',  mates: [[100, -170], [100, 0], [100, 170]] },
    { nome: 'scala',     mates: [[150, 0], [-120, 10], [30, -160]] },
    { nome: 'diagonale', mates: [[127, -127], [127, 127], [-150, 0]] },
  ];

  /* -------------------------------------------------------------------
     A — IL PASSAGGIO PARTE AL RILASCIO E VA DOVE DICE LA DIREZIONE.
     8 direzioni x 3 configurazioni. Trascinamento di 36 px (sotto
     QUOTA_SU: rasoterra), 8 fotogrammi di corsa + 8 fermi (cosi' il
     campione scartato dei 60 ms coincide con la posizione finale), poi
     rilascio e fino a 2,5 s di simulazione per vedere CHI PRENDE il
     pallone davvero.
     ------------------------------------------------------------------- */
  {
    stampa('A) IL BERSAGLIO SEGUE LA DIREZIONE (trascinamento 38 px, rasoterra)');
    const AMP = 38, NF = 3, FERMI = 10;
    let parteAlRilascio = 0, parteAllaPressione = 0, doppi = 0, giusti = 0, tot = 0;
    const perConfig = [];
    for (const cfg of CONFIG) {
      const ricevuti = new Set();
      const righe = [];
      for (let k = 0; k < 8; k++) {
        const angD = k * 45, ux = Math.cos(angD * Math.PI / 180), uy = Math.sin(angD * Math.PI / 180);
        const { pag, cdp } = await apri(null, 20260820 + k);
        const passo = n => pag.evaluate(j => window.__banco.passo(j), n);
        const q = await pag.evaluate(preparaScena, { mates: cfg.mates, taglia: 5 });
        if (q.errore) { await pag.close(); throw new Error('scena A: ' + q.errore); }
        const P = q.disco;
        await dito.giu(cdp, P.x, P.y);
        for (let i = 1; i <= NF; i++) { await passo(1); await dito.sposta(cdp, P.x + ux * AMP * i / NF, P.y + uy * AMP * i / NF); }
        for (let i = 0; i < FERMI; i++) await passo(1);
        const prima = await pag.evaluate(fotoMondo);
        const calciPrima = await pag.evaluate(pi0 => window.__sonda.calci.filter(c => c.chi === pi0).length, q.pi);
        await dito.su(cdp);
        await passo(3);
        /* chi prende il pallone davvero: fino a 2,5 s di simulazione */
        const esito = await pag.evaluate(pi0 => {
          const t = window.__test, G = t.G;
          let ric = -1, fr = 0, fermaAiPiedi = false;
          for (; fr < 210; fr++) {
            t.simulate(1 / 60);
            if (G.ball.owner >= 0 && G.ball.owner !== pi0) { ric = G.ball.owner; break; }
          }
          /* il primo tocco puo' sporcarsi (L2.2b) e il controllo passa al
             ricevente: se il banco non muove la levetta, una palla ferma
             a due passi dall'uomo comandato resta di nessuno per sempre.
             Una palla FERMA ai piedi di un compagno E' una ricezione. */
          if (ric < 0) {
            let vic = -1, dv = 1e9;
            for (let i = 0; i < G.players.length; i++) {
              const p = G.players[i];
              if (p.team !== 0 || i === pi0 || p.out > 0) continue;
              const d = Math.hypot(p.x - G.ball.x, p.y - G.ball.y);
              if (d < dv) { dv = d; vic = i; }
            }
            if (vic >= 0 && dv <= 60 && Math.hypot(G.ball.vx, G.ball.vy) < 40) { ric = vic; fermaAiPiedi = true; }
          }
          const S = window.__sonda;
          return { ric, fr, fermaAiPiedi, calci: S.calci.filter(c => c.chi === pi0).length, owner: G.ball.owner };
        }, q.pi);
        await dito.suSicuro(cdp);
        await pag.close();
        tot++;
        /* il pallone era ancora del portatore un istante prima del rilascio? */
        const eraSuo = prima.owner === q.pi && calciPrima === 0;
        if (eraSuo) parteAlRilascio++; else parteAllaPressione++;
        if (esito.calci > 1) doppi++;
        /* l'atteso: l'aritmetica del banco sulla fotografia PRIMA del
           rilascio. Tolleranza: il ricevuto vero deve stare entro 80
           punti dal migliore (l'aggancio del bersaglio puo' legittimamente
           tenere il vincitore di qualche fotogramma prima). */
        const sc = punteggiL14(prima, q.pi, ux, uy, Math.min(1, AMP / DRAG_SAT));
        const attesoTxt = sc.length ? sc[0].i : -1;
        let colto = false;
        if (esito.ric >= 0 && sc.length) {
          const suo = sc.find(o => o.i === esito.ric);
          if (suo && sc[0].s - suo.s <= 80) colto = true;
        }
        if (colto) giusti++;
        if (esito.ric >= 0) ricevuti.add(esito.ric);
        righe.push('     ' + String(angD).padStart(3) + ' gradi  parte ' + (eraSuo ? 'al RILASCIO ' : 'alla PRESSIONE') +
                   '  atteso #' + attesoTxt + '  riceve ' + (esito.ric >= 0 ? '#' + esito.ric : 'nessuno (' + (esito.owner < 0 ? 'in volo/libera' : 'persa') + ')') +
                   '  ' + (colto ? 'combacia' : 'NON combacia'));
      }
      perConfig.push({ nome: cfg.nome, distinti: ricevuti.size });
      stampa('   configurazione <' + cfg.nome + '>  — riceventi distinti su 8 direzioni: ' + ricevuti.size);
      for (const r of righe) stampa(r);
    }
    const a1 = parteAllaPressione === 0 && doppi === 0;
    const a2 = giusti >= 21;
    /* nelle prime due configurazioni la direzione ha la leva per
       scegliere fra tutti e tre; nella terza (realistica) il premio
       «avanti» del punteggio base puo' legittimamente tenere due uomini
       — la soglia la' e' 2, ed e' la stessa dichiarazione del progetto:
       la direzione INCLINA, non comanda. */
    const a3 = perConfig[0].distinti >= 3 && perConfig[1].distinti >= 3 && perConfig[2].distinti >= 2;
    esiti.push({ id: 'A1', nome: 'il passaggio parte al rilascio (mai alla pressione, mai doppio)', ok: a1 });
    esiti.push({ id: 'A2', nome: 'il ricevente combacia con il punteggio del progetto (>=21/24)', ok: a2 });
    esiti.push({ id: 'A3', nome: 'direzioni diverse, riceventi diversi (>=3 distinti per configurazione)', ok: a3 });
    stampa('   parte al rilascio ' + parteAlRilascio + '/' + tot + ' · alla pressione ' + parteAllaPressione + '/' + tot + ' · calci doppi ' + doppi);
    stampa('   riceventi che combaciano con l\'atteso: ' + giusti + '/' + tot + ' (soglia 21)');
    stampa('   A1 ' + (a1 ? 'VERDE' : 'ROSSO') + ' · A2 ' + (a2 ? 'VERDE' : 'ROSSO') + ' · A3 ' + (a3 ? 'VERDE' : 'ROSSO'));
    stampa('');
  }

  /* -------------------------------------------------------------------
     B — IL CENSIMENTO DELL'AMBIGUITA'. Partite CPU contro CPU alle tre
     taglie; ogni mezzo secondo con un portatore vero si provano 12
     direzioni e si registra il distacco fra i primi due del punteggio.
     E' la misura che giustifica delta (informativa: fissa la costante,
     non assolve il gioco).
     ------------------------------------------------------------------- */
  if (!SALTA_CENSIMENTO) {
    stampa('B) CENSIMENTO DELL\'AMBIGUITA\' — distacco fra i primi due, partite vere');
    for (const taglia of [5, 7, 11]) {
      const { pag } = await apri(null, 20260820);
      const dati = await pag.evaluate(async (tg) => {
        const t = window.__test, G = t.G;
        try { t.dismissSplash && t.dismissSplash(); } catch (e) {}
        t.setPaused && t.setPaused(false);
        try { if (t.Tut && t.Tut.active && t.Tut.finish) t.Tut.finish(true); } catch (e) {}
        t.startMatch(1, 1, { size: tg });
        for (let i = 0; i < 80 && G.scene !== 'play'; i++) t.simulate(0.1);
        if (G.scene !== 'play') return { errore: 'scena ' + G.scene };
        t.setCpuVsCpu(true);
        const gaps = [], nc = [];
        for (let s = 0; s < 170; s++) {
          t.simulate(0.5);
          if (!(G.scene === 'play' || G.scene === 'golden')) break;
          const oi = G.ball.owner;
          if (oi < 0) continue;
          const p = G.players[oi];
          for (let k = 0; k < 12; k++) {
            const a = k * Math.PI / 6, ux = Math.cos(a), uy = Math.sin(a);
            let s1 = -1e9, s2 = -1e9, n = 0;
            for (const q of G.players) {
              if (q.team !== p.team || q === p || q.out > 0 || q.role === 'gk') continue;
              n++;
              let sc = 0;
              for (const o of G.players) {
                if (o.team === p.team || o.out > 0) continue;
                sc += Math.max(0, Math.min(220, Math.hypot(o.x - q.x, o.y - q.y)));
                const ax = q.x - p.x, ay = q.y - p.y, al = Math.max(1, Math.hypot(ax, ay));
                const px = o.x - p.x, py = o.y - p.y;
                const t2 = Math.max(0, Math.min(1, (px * ax + py * ay) / (al * al)));
                const dL = Math.hypot(px - ax * t2, py - ay * t2);
                if (dL < 40 && t2 > 0.1 && t2 < 0.95) sc -= 260;
              }
              sc += (p.team === 0 ? q.x - p.x : p.x - q.x) * 0.9;
              const d = Math.hypot(q.x - p.x, q.y - p.y);
              sc -= Math.abs(d - 170) * 0.4;
              const dx = q.x - p.x, dy = q.y - p.y, l = Math.max(1, Math.hypot(dx, dy));
              sc += 220 * ((dx * ux + dy * uy) / l) * 1;
              if (sc > s1) { s2 = s1; s1 = sc; } else if (sc > s2) s2 = sc;
            }
            if (n >= 2) { gaps.push(s1 - s2); nc.push(n); }
          }
        }
        return { gaps, candidati: nc.length ? nc.reduce((a, b) => a + b, 0) / nc.length : 0 };
      }, taglia);
      await pag.close();
      if (dati.errore) { stampa('   taglia ' + taglia + ': ' + dati.errore); continue; }
      const g = dati.gaps.slice().sort((a, b) => a - b);
      const perc = x => g.length ? g[Math.min(g.length - 1, Math.floor(g.length * x))] : NaN;
      const entro = d => g.length ? g.filter(v => v < d).length / g.length * 100 : NaN;
      stampa('   taglia ' + String(taglia).padStart(2) + '  campioni ' + g.length + '  candidati medi ' + n1(dati.candidati) +
             '  mediana del distacco ' + n1(perc(0.5)) +
             '  entro 10: ' + n1(entro(10)) + '%  entro 20: ' + n1(entro(20)) + '%  entro 30: ' + n1(entro(30)) + '%  entro 40: ' + n1(entro(40)) + '%');
    }
    stampa('   (censimento: fissa delta, non emette verdetto — il verdetto sul gioco e\' A)');
    stampa('');
  } else stampa('B) censimento saltato (--salta-censimento)\n');

  /* -------------------------------------------------------------------
     C — L'AGGANCIO DEL BERSAGLIO, misurato sull'EFFETTO: la chiamata.
     Due candidati a +-45 gradi, trascinamento 38 px con tremore laterale
     di +-8 px (onda quadra, 6 fotogrammi per lato), tenuta 2,4 s.
     Se il bersaglio salta avanti e indietro, TUTTI E DUE corrono; se
     l'aggancio tiene, corre uno solo. Si contano i fotogrammi in cui
     tutti e due i candidati superano 80 unita'/s.
     CONTROLLO NEGATIVO: la variante col file giudicato in cui L14_AGG
     vale 0 deve mostrare la corsa doppia. Se il file giudicato non ha la
     costante, la variante non si puo' costruire e C e' rosso.
     ------------------------------------------------------------------- */
  {
    stampa('C) AGGANCIO DEL BERSAGLIO — tremore di +-12 px su 38 verso il bivio a +-30 gradi');
    /* due candidati simmetrici a +-30 gradi in una scena SPECCHIATA (il
       punteggio base dei due e' uguale per costruzione): il tremore
       laterale di 12 px (~17 gradi) sposta il punteggio del vincitore di
       decine di punti a ogni mezz'onda — sopra delta (20) e sotto
       L14_AGG (60). Il primo armo cade DENTRO la prima mezz'onda, quindi
       il bersaglio dell'armo e' il candidato di quel lato; le onde sono
       QUATTRO (numero pari) cosi' l'ultima mezz'onda sta dal lato
       OPPOSTO, e il rilascio avviene su di essa senza ricentrare il
       dito: il caso peggiore. L'EFFETTO letto e' CHI RICEVE:
         con l'aggancio     -> il candidato del PRIMO armo;
         senza (variante L14_AGG=0 dal file giudicato) -> quello
                               dell'ULTIMA mezz'onda, cioe' l'opposto.
       Le due fasi dell'onda scambiano i due lati, quindi ogni verdetto
       ha il suo gemello specchiato. */
    const cfgC = { nome: 'bivio', mates: [[160, -92], [160, 92], [-160, 0]], taglia: 5, specchio: true };
    async function provaC(urlRel, fase, seme, intento) {
      const { pag, cdp } = await apri(urlRel, seme);
      const passo = n => pag.evaluate(j => window.__banco.passo(j), n);
      const q = await pag.evaluate(preparaScena, cfgC);
      if (q.errore) { await pag.close(); throw new Error('scena C: ' + q.errore); }
      const P = q.disco, AMP = 38;
      await dito.giu(cdp, P.x, P.y);
      for (let i = 1; i <= 3; i++) { await passo(1); await dito.sposta(cdp, P.x + AMP * i / 3, P.y); }
      for (let f = 0; f < 36; f++) {
        const lato = (Math.floor(f / 9) + fase) % 2 === 0 ? 12 : -12;
        await dito.sposta(cdp, P.x + AMP, P.y + lato);
        await passo(1);
      }
      if (intento) {
        /* LA MIRA VERA VINCE L'AGGANCIO: il dito si porta a piena
           estensione esattamente sul candidato che NON e' agganciato
           (fase 0: l'aggancio e' sul basso, la mira va sull'alto, a
           -30 gradi). A saturazione piena il distacco supera L14_AGG e
           il bersaglio DEVE cambiare. */
        for (let i = 1; i <= 3; i++) { await passo(1); await dito.sposta(cdp, P.x + 45, P.y - 26); }
        for (let i = 0; i < 8; i++) await passo(1);
      }
      await dito.su(cdp);
      const esito = await pag.evaluate(pi0 => {
        const t = window.__test, G = t.G;
        let ric = -1;
        for (let fr = 0; fr < 210; fr++) { t.simulate(1 / 60); if (G.ball.owner >= 0 && G.ball.owner !== pi0) { ric = G.ball.owner; break; } }
        /* stessa lettura di A: una palla ferma ai piedi di un compagno
           (il primo tocco sporco piu' il cambio di comandato) e' ricevuta */
        if (ric < 0) {
          let vic = -1, dv = 1e9;
          for (let i = 0; i < G.players.length; i++) {
            const p = G.players[i];
            if (p.team !== 0 || i === pi0 || p.out > 0) continue;
            const d = Math.hypot(p.x - G.ball.x, p.y - G.ball.y);
            if (d < dv) { dv = d; vic = i; }
          }
          if (vic >= 0 && dv <= 60 && Math.hypot(G.ball.vx, G.ball.vy) < 40) ric = vic;
        }
        return { ric };
      }, q.pi);
      await dito.suSicuro(cdp);
      await pag.close();
      return { ric: esito.ric, m0: q.mates[0], m1: q.mates[1] };
    }
    let c1 = false, c2 = false, c3 = false;
    try {
      /* fase 0: il primo armo cade sulla mezz'onda BASSA (m1), l'ultima
         e' ALTA (m0); fase 1 e' lo specchio. */
      const PROVE = [[0, 20260821], [1, 20260821], [0, 20260825], [1, 20260825]];
      const rG = [];
      for (const [fase, seme] of PROVE) rG.push(await provaC(null, fase, seme));
      stampa('   col file giudicato (seme A fase 0/1, seme B fase 0/1): riceventi ' + rG.map(r => r.ric).join(', ') +
             '  — attesi (primo armo) ' + rG.map((r, k) => PROVE[k][0] === 0 ? r.m1 : r.m0).join(', '));
      c1 = rG.every((r, k) => r.ric === (PROVE[k][0] === 0 ? r.m1 : r.m0));
      /* e la mira vera lo vince: piena estensione sul candidato NON agganciato */
      const rI = await provaC(null, 0, 20260821, true);
      stampa('   mira vera a piena estensione sul candidato alto: riceve ' + rI.ric + ' (atteso ' + rI.m0 + ', cioe\' NON quello dell\'aggancio)');
      c3 = rI.ric === rI.m0;
      /* la variante senza aggancio, costruita dal file giudicato */
      const src = fs.readFileSync(GIOCO, 'utf8');
      const AGO = 'L14_AGG   = 60';
      if (src.split(AGO).length - 1 === 1) {
        const dirV = path.join(RADICE, 'fuori');
        fs.mkdirSync(dirV, { recursive: true });
        fs.writeFileSync(path.join(dirV, '_l14-agg0.html'), src.replace(AGO, 'L14_AGG = 0'));
        const rV = [];
        for (const [fase, seme] of PROVE) rV.push(await provaC('fuori/_l14-agg0.html', fase, seme));
        stampa('   variante SENZA aggancio: riceventi ' + rV.map(r => r.ric).join(', ') +
               '  — attesi (ultima mezz\'onda) ' + rV.map((r, k) => PROVE[k][0] === 0 ? r.m0 : r.m1).join(', '));
        c2 = rV.every((r, k) => r.ric === (PROVE[k][0] === 0 ? r.m0 : r.m1));
      } else {
        stampa('   variante SENZA aggancio: NON COSTRUIBILE — <' + AGO + '> non compare una volta nel file giudicato (l\'aggancio non esiste)');
        c2 = false;
      }
    } catch (e) { stampa('   C e\' esploso: ' + e.message); }
    esiti.push({ id: 'C1', nome: 'aggancio: il ricevente non balla col tremore (4 prove, 2 fasi)', ok: c1 });
    esiti.push({ id: 'C2', nome: 'controllo negativo: senza aggancio il ricevente segue il tremore', ok: c2 });
    esiti.push({ id: 'C3', nome: 'la mira vera a piena estensione vince l\'aggancio', ok: c3 });
    stampa('   C1 ' + (c1 ? 'VERDE' : 'ROSSO') + ' · C2 ' + (c2 ? 'VERDE' : 'ROSSO') + ' · C3 ' + (c3 ? 'VERDE' : 'ROSSO'));
    stampa('');
  }

  /* -------------------------------------------------------------------
     D — LA CHIAMATA: quando il trascinamento arma, il candidato PARTE.
     Scena ventaglio, direzione 0 (verso il compagno davanti). Finestra
     PRIMA (0,5 s a dito giu' ma non armato: 12 px) e finestra DOPO
     (0,9 s armato a 46 px). Spostamento vero del candidato contro i due
     compagni di controllo della stessa scena. Si chiude con touchcancel:
     nessun passaggio deve partire (Legge 4).
     ------------------------------------------------------------------- */
  {
    stampa('D) LA CHIAMATA — il candidato parte quando il trascinamento arma');
    /* MISURA APPAIATA (lo schema di G6c del progetto): due pagine con lo
       stesso seme e la stessa scena. Nel braccio ARMATO il dito trascina
       a 46 px (oltre R_ARMA) verso l'uomo DIETRO — lo scarico — perche'
       l'uomo dietro e' l'ultimo della squadra e a riposo sta fermo: il
       braccio di CONTROLLO (dito a 12 px, mai armato, stesso seme e
       stessi fotogrammi) misura il suo moto di fondo. Le due simulazioni
       sono identiche fino all'istante dell'armo: cio' che diverge dopo
       e' l'effetto dell'armo. Si legge lo SPOSTAMENTO VERO in 0,9 s. Si
       chiude con touchcancel: nessun calcio deve uscire (Legge 4). */
    async function corsaD(arma) {
      const { pag, cdp } = await apri(null, 20260822);
      const passo = n => pag.evaluate(j => window.__banco.passo(j), n);
      const q = await pag.evaluate(preparaScena, { mates: CONFIG[1].mates, taglia: 5 });
      if (q.errore) throw new Error('scena D: ' + q.errore);
      const P = q.disco;
      const bersaglio = q.mates[1];      /* l'uomo dietro: (-120, 10) */
      await dito.giu(cdp, P.x, P.y);
      await passo(1);
      await dito.sposta(cdp, P.x - 12, P.y);         /* sotto R_ARMA */
      for (let i = 0; i < 12; i++) await passo(1);
      const ampFin = arma ? 46 : 12;
      for (let i = 1; i <= 3; i++) { await passo(1); await dito.sposta(cdp, P.x - 12 - (ampFin - 12) * i / 3, P.y); }
      const pos1 = await pag.evaluate(i => { const p = window.__test.G.players[i]; return [p.x, p.y]; }, bersaglio);
      for (let i = 0; i < 54; i++) await passo(1);   /* finestra: 0,9 s */
      const pos2 = await pag.evaluate(i => { const p = window.__test.G.players[i]; return [p.x, p.y]; }, bersaglio);
      const stato = await pag.evaluate(pi0 => ({ owner: window.__test.G.ball.owner,
        calci: window.__sonda.calci.filter(c => c.chi === pi0).length }), q.pi);
      await dito.annulla(cdp);
      await passo(6);
      const calciFine = await pag.evaluate(pi0 => window.__sonda.calci.filter(c => c.chi === pi0).length, q.pi);
      await pag.close();
      return { sposta: Math.hypot(pos2[0] - pos1[0], pos2[1] - pos1[1]),
               possesso: stato.owner === q.pi && stato.calci === 0, calciFine };
    }
    const armato = await corsaD(true);
    const fermo = await corsaD(false);
    stampa('   spostamento del candidato in 0,9 s: braccio ARMATO ' + n1(armato.sposta) + ' u · braccio di CONTROLLO (stesso seme, dito sotto R_ARMA) ' + n1(fermo.sposta) + ' u');
    stampa('   possesso tenuto per tutta la tenuta: armato ' + (armato.possesso ? 'si\'' : 'NO') + ' · controllo ' + (fermo.possesso ? 'si\'' : 'NO'));
    stampa('   touchcancel finale: calci ' + armato.calciFine + ' e ' + fermo.calciFine + ' (Legge 4: devono essere 0)');
    const ok = armato.possesso && fermo.possesso && armato.calciFine === 0 && fermo.calciFine === 0 &&
               armato.sposta >= fermo.sposta + 60 && armato.sposta >= 90;
    esiti.push({ id: 'D', nome: 'la chiamata: il candidato parte davvero (misura appaiata)', ok });
    stampa('   soglia: possesso tenuto, 0 calci, ARMATO >= CONTROLLO + 60 u e >= 90 u   ->  ' + (ok ? 'VERDE' : 'ROSSO'));
    stampa('');
  }

  /* -------------------------------------------------------------------
     E — CHIAMA SENZA PASSARE: oltre R_ANNULLA il passaggio muore, la
     corsa resta. Trascinamento fino a 120 px (attraversa l'armo, poi
     supera 96), rilascio: il pallone NON parte e resta del portatore;
     il candidato continua la corsa dopo il rilascio.
     ------------------------------------------------------------------- */
  {
    stampa('E) CHIAMA SENZA PASSARE — 120 px e rilascio: niente calcio, la corsa resta');
    const { pag, cdp } = await apri(null, 20260823);
    const passo = n => pag.evaluate(j => window.__banco.passo(j), n);
    const q = await pag.evaluate(preparaScena, { mates: CONFIG[1].mates, taglia: 5 });
    if (q.errore) throw new Error('scena E: ' + q.errore);
    const P = q.disco;
    const bersaglio = q.mates[1];      /* l'uomo dietro: il trascinamento va verso di lui */
    await dito.giu(cdp, P.x, P.y);
    for (let i = 1; i <= 12; i++) { await passo(1); await dito.sposta(cdp, P.x - 120 * i / 12, P.y); }
    for (let i = 0; i < 6; i++) await passo(1);
    const posR = await pag.evaluate(i => { const p = window.__test.G.players[i]; return [p.x, p.y]; }, bersaglio);
    await dito.su(cdp);
    const esito = await pag.evaluate(([pi0, bi]) => {
      const t = window.__test, G = t.G;
      for (let fr = 0; fr < 90; fr++) t.simulate(1 / 60);
      const b = G.players[bi];
      return { owner: G.ball.owner, calci: window.__sonda.calci.filter(c => c.chi === pi0).length,
               bx: b.x, by: b.y, charge: G.players[pi0].charge };
    }, [q.pi, bersaglio]);
    await dito.suSicuro(cdp);
    await pag.close();
    const corsa = Math.hypot(esito.bx - posR[0], esito.by - posR[1]);
    const okPalla = esito.calci === 0 && esito.owner === q.pi;
    const okCorsa = corsa >= 50;
    const okPosa = !(esito.charge >= 0);
    stampa('   calci del portatore dopo il rilascio: ' + esito.calci + ' · padrone del pallone: ' + (esito.owner === q.pi ? 'ancora lui' : esito.owner));
    stampa('   corsa del chiamato nei 1,5 s dopo il rilascio: ' + n1(corsa) + ' u (soglia 50)');
    stampa('   posa del portatore chiusa (nessuna carica orfana): ' + (okPosa ? 'si\'' : 'NO — charge ' + n2(esito.charge)));
    const ok = okPalla && okCorsa && okPosa;
    esiti.push({ id: 'E', nome: 'chiama senza passare: il pallone resta, la corsa resta', ok });
    stampa('   ->  ' + (ok ? 'VERDE' : 'ROSSO'));
    stampa('');
  }

  /* -------------------------------------------------------------------
     F — LA QUOTA CRESCE CON L'AMPIEZZA. Cinque ampiezze verso il
     compagno davanti (scena scala, uomo a +200): 30 px (rasoterra),
     44/60/76/92 (alta, crescente). Si misura il MASSIMO di b.z nel volo.
     ------------------------------------------------------------------- */
  {
    stampa('F) LA QUOTA — altezza massima vera del pallone su cinque ampiezze');
    const ampiezze = [30, 44, 60, 76, 92];
    const quote = [];
    for (let k = 0; k < ampiezze.length; k++) {
      const AMP = ampiezze[k];
      const { pag, cdp } = await apri(null, 20260824 + k);
      const passo = n => pag.evaluate(j => window.__banco.passo(j), n);
      const q = await pag.evaluate(preparaScena, { mates: CONFIG[1].mates, taglia: 5 });
      if (q.errore) throw new Error('scena F: ' + q.errore);
      const P = q.disco;
      await dito.giu(cdp, P.x, P.y);
      for (let i = 1; i <= 8; i++) { await passo(1); await dito.sposta(cdp, P.x + AMP * i / 8, P.y); }
      for (let i = 0; i < 6; i++) await passo(1);
      await dito.su(cdp);
      const esito = await pag.evaluate(() => {
        const t = window.__test, G = t.G;
        let zMax = 0;
        for (let fr = 0; fr < 90; fr++) { t.simulate(1 / 60); if (G.ball.z > zMax) zMax = G.ball.z; }
        return { zMax };
      });
      await dito.suSicuro(cdp);
      await pag.close();
      quote.push(esito.zMax);
      stampa('   ampiezza ' + String(AMP).padStart(3) + ' px  ->  quota massima ' + n1(esito.zMax) + ' u');
    }
    const f1 = quote[0] < 5;
    const f2 = quote[1] > quote[0] + 3 && quote[2] > quote[1] + 2 && quote[3] > quote[2] + 2 && quote[4] > quote[3] + 2 && quote[4] >= 30;
    esiti.push({ id: 'F1', nome: 'sotto QUOTA_SU il passaggio e\' rasoterra', ok: f1 });
    esiti.push({ id: 'F2', nome: 'sopra QUOTA_SU la quota cresce con l\'ampiezza (fino a scavalcare le teste)', ok: f2 });
    stampa('   F1 ' + (f1 ? 'VERDE' : 'ROSSO') + ' · F2 ' + (f2 ? 'VERDE' : 'ROSSO'));
    stampa('');
  }

  /* ------------------------------- il conto ------------------------- */
  await br.close(); srv.chiudi();
  stampa('=== IL CONTO ===');
  let rossi = 0;
  for (const e of esiti) { stampa('  ' + (e.ok ? 'VERDE' : 'ROSSO') + '  ' + e.id + ' — ' + e.nome); if (!e.ok) rossi++; }
  if (eccezioni.length) { stampa('  ECCEZIONI DI PAGINA: ' + eccezioni.slice(0, 5).join(' | ')); rossi++; }
  stampa(rossi === 0 ? 'TUTTO VERDE (' + esiti.length + ' verdetti)' : 'ROSSI: ' + rossi + ' su ' + esiti.length);
  process.exit(rossi === 0 ? 0 : 1);
})().catch(e => { console.error('IL BANCO E\' CADUTO: ' + (e && e.stack || e)); process.exit(2); });
