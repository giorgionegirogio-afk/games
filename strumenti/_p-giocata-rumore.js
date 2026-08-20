/* =====================================================================
   _p-giocata-rumore.js — SONDA, non cancello.

   giocata.js --tutte esce 6/7 una corsa su tre-quattro sullo stesso
   file (md5 2febbc9807c9), e a fallire e' sempre la FILTRANTE, con tre
   firme diverse (contatore fermo, passTo mai visto, z 5,3). Da sola la
   filtrante passa 20/20. Quindi il rumore sta nello STATO che le
   giocate precedenti lasciano sul campo, non nel gesto.

   Questa sonda riproduce ESATTAMENTE il percorso della batteria fino
   alla filtrante (passaggio -> trascina -> carica -> filtrante, stessi
   tempi, stessi gesti di protocollo) e in piu' misura, corsa per corsa:
     · quanti sorteggi (Math.random + getRandomValues) il gioco ha
       consumato al caricamento e all'avvio — per vedere se lo stato
       di partenza e' gia' diverso fra corse;
     · la geometria del campo alla quiete della filtrante: dove sta il
       comandato, dove sta il compagno mirato, con che dot e distanza;
     · fotogramma per fotogramma, il MIGLIOR dot fra i compagni rispetto
       alla faccia del comandato — la stessa grandezza che
       eseguiFiltrante rilegge quando l'anticipo di 50 ms matura;
     · l'esito con la stessa logica del cancello.
   Il confronto fra corse OK e corse NO dice QUALE grandezza oscilla.

   uso: node strumenti/_p-giocata-rumore.js --corse 15 --json uscita.json
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png' };

/* il server e' quello di giocata.js: stessi header, stessa radice */
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

/* dita di protocollo: identiche a giocata.js, il gioco deve vedere gli
   stessi eventi che vede nella batteria */
const dito = {
  giu: (cdp, x, y) => cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }),
  sposta: (cdp, x, y) => cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] }),
  su: (cdp) => cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }),
};

/* preparaQuiete: COPIA FEDELE di giocata.js (stesse mosse, stessi
   numeri), perche' la sonda deve riprodurre il banco, non migliorarlo */
function preparaQuiete(opz) {
  const t = window.__test, G = t.G;
  t.setPaused && t.setPaused(false);
  try { if (t.Tut && t.Tut.active && t.Tut.finish) t.Tut.finish(true); } catch (e) {}
  for (let i = 0; i < 300 && G.scene !== 'play'; i++) t.simulate(0.1);
  if (G.scene !== 'play') return { errore: "la partita non arriva mai in gioco: scena '" + G.scene + "'" };
  t.setTimeLeft && t.setTimeLeft(80);
  const pi = G.ctrl[0];
  if (pi < 0) return { errore: 'nessun giocatore comandato' };
  const p = G.players[pi];
  if (p.charge !== undefined && p.charge >= 0) { p.charge = -1; p.chargeKind = 'tiro'; p.chargeT = 0; p.chargeGo = null; }
  for (const q of G.players) { q.vx = 0; q.vy = 0; }
  const b = G.ball;
  b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0; b.curve = 0; b.passTo = -1;
  const v = t.view;
  const cx = (innerWidth / 2 - v.Ax) / v.S2;
  const dir = cx >= p.x ? 1 : -1;
  if (opz.possesso) { b.owner = pi; b.x = p.x + dir * 8; b.y = p.y; }
  else { b.owner = -1; b.x = p.x + dir * (opz.avanti || 0); b.y = p.y; }
  for (let i = 0; i < G.players.length; i++) {
    const q = G.players[i];
    if (q.team === 0) continue;
    const d = Math.hypot(q.x - b.x, q.y - b.y);
    if (d < 170) {
      const l = Math.max(1, d);
      q.x = b.x + (q.x - b.x) / l * 230;
      q.y = b.y + (q.y - b.y) / l * 230;
    }
  }
  if (opz.mira) {
    let mig = null, md = 1e9;
    for (const q of G.players) {
      if (q.team !== 0 || q === p || q.out > 0 || q.role === 'gk') continue;
      const d = Math.hypot(q.x - p.x, q.y - p.y);
      if (d < md) { md = d; mig = q; }
    }
    if (!mig) return { errore: 'nessun compagno di movimento a cui filtrare' };
    const dx = mig.x - p.x, dy = mig.y - p.y, l = Math.max(1, Math.hypot(dx, dy));
    p.fx = dx / l; p.fy = dy / l;
  }
  if (opz.miraVuota) {
    const compagni = [];
    for (const q of G.players) {
      if (q.team !== 0 || q === p || q.out > 0 || q.role === 'gk') continue;
      compagni.push(q);
    }
    if (!compagni.length) return { errore: 'nessun compagno di movimento' };
    let miglior = null, peggioreDot = 2;
    for (let k = 0; k < 72; k++) {
      const an = k * Math.PI / 36, mx = Math.cos(an), my = Math.sin(an);
      let peggio = -2;
      for (const q of compagni) {
        const ddx = q.x - p.x, ddy = q.y - p.y, ll = Math.max(1, Math.hypot(ddx, ddy));
        peggio = Math.max(peggio, (ddx * mx + ddy * my) / ll);
      }
      if (peggio < peggioreDot) { peggioreDot = peggio; miglior = [mx, my]; }
    }
    if (!(peggioreDot <= 0.35)) return { errore: 'nessuna direzione vuota: dot ' + peggioreDot.toFixed(2) };
    p.fx = miglior[0]; p.fy = miglior[1];
  }
  const sx = w => w * v.S2 + v.Ax, sy = w => w * v.S2 + v.Ay;
  let bottoni = null;
  try { bottoni = window.__test.pulsanti(0); } catch (e) { return { errore: 'pulsanti(0) esploso: ' + e.message }; }
  const bGrande = bottoni.reduce((a, z) => (z.r > a.r ? z : a), bottoni[0]);
  const bPiccolo = bottoni.filter(z => z !== bGrande)[0];
  return {
    pi,
    palla: { x: sx(b.x), y: sy(b.y) },
    comandato: { x: sx(p.x), y: sy(p.y) },
    vw: innerWidth, vh: innerHeight,
    grande: { x: Math.round(bGrande.x), y: Math.round(bGrande.y) },
    piccolo: { x: Math.round(bPiccolo.x), y: Math.round(bPiccolo.y) },
  };
}

/* IL DUMP DEL CAMPO: la geometria che eseguiFiltrante rileggera'.
   bestDot e' calcolato con la STESSA formula del gioco (dot col vettore
   faccia, esclusi portiere ed espulsi), perche' e' quel numero che
   decide filtrante-o-ripiego quando l'anticipo matura. */
function dumpCampo() {
  const t = window.__test, G = t.G;
  const pi = G.ctrl[0], p = G.players[pi];
  const sq = [];
  let bestDot = -2, bestIdx = -1, bestDist = 0;
  for (let i = 0; i < G.players.length; i++) {
    const q = G.players[i];
    if (q.team !== 0 || i === pi || q.out > 0 || q.role === 'gk') continue;
    const dx = q.x - p.x, dy = q.y - p.y, l = Math.max(1, Math.hypot(dx, dy));
    const dot = (dx * p.fx + dy * p.fy) / l;
    sq.push({ i, x: +q.x.toFixed(1), y: +q.y.toFixed(1), dist: +l.toFixed(1), dot: +dot.toFixed(3) });
    if (dot > bestDot) { bestDot = dot; bestIdx = i; bestDist = l; }
  }
  return {
    sorteggi: window.__sorteggi(),
    comandato: { i: pi, x: +p.x.toFixed(1), y: +p.y.toFixed(1), fx: +p.fx.toFixed(3), fy: +p.fy.toFixed(3) },
    palla: { x: +G.ball.x.toFixed(1), y: +G.ball.y.toFixed(1), owner: G.ball.owner },
    compagni: sq,
    bestDot: +bestDot.toFixed(3), bestIdx, bestDist: +bestDist.toFixed(1),
  };
}

/* la sonda a 60 Hz di giocata.js, ESTESA: ogni campione porta anche il
   miglior dot del momento e la faccia del comandato — cosi' si vede la
   grandezza che oscilla DENTRO la finestra dei 50 ms dell'anticipo */
function installaSonda() {
  window.__sonda = { campioni: [], eventi: [], via: false };
  for (const tipo of ['touchstart', 'touchmove', 'touchend']) {
    addEventListener(tipo, e => {
      if (!window.__sonda.via) return;
      window.__sonda.eventi.push({ tipo, t: performance.now() });
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
      let bestDot = -2, bestIdx = -1, bestDist = 0;
      if (p) {
        for (let i = 0; i < G.players.length; i++) {
          const q = G.players[i];
          if (q.team !== 0 || i === pi || q.out > 0 || q.role === 'gk') continue;
          const dx = q.x - p.x, dy = q.y - p.y, l = Math.max(1, Math.hypot(dx, dy));
          const dot = (dx * p.fx + dy * p.fy) / l;
          if (dot > bestDot) { bestDot = dot; bestIdx = i; bestDist = l; }
        }
      }
      const b = G.ball;
      S.campioni.push({
        t: performance.now(),
        palla: { x: +b.x.toFixed(1), y: +b.y.toFixed(1), vx: +(b.vx || 0).toFixed(1), vy: +(b.vy || 0).toFixed(1), z: +(b.z || 0).toFixed(2), vz: +(b.vz || 0).toFixed(1), owner: b.owner, passTo: b.passTo !== undefined ? b.passTo : null },
        ultimoTocco: (G.touches && G.touches.length) ? G.touches[G.touches.length - 1].t : null,
        comandato: p ? { i: pi, x: +p.x.toFixed(1), y: +p.y.toFixed(1), vx: +p.vx.toFixed(1), vy: +p.vy.toFixed(1), fx: +p.fx.toFixed(3), fy: +p.fy.toFixed(3), carica: p.charge !== undefined ? p.charge : null } : null,
        bestDot: +bestDot.toFixed(3), bestIdx, bestDist: +bestDist.toFixed(1),
        filtranti: G.stats.filtranti ? (G.stats.filtranti[0] || 0) : 0,
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

/* una corsa intera: browser nuovo, pagina nuova, stesso percorso della
   batteria fino alla filtrante inclusa */
async function unaCorsa(porta, seme) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 915, height: 412 }, deviceScaleFactor: 1,
    isMobile: true, hasTouch: true, locale: 'it-IT',
  });
  const pag = await ctx.newPage();
  /* lo stesso generatore a seme fisso di giocata.js, piu' un CONTATORE:
     quanti sorteggi il gioco ha gia' consumato quando la misura comincia
     e' il candidato numero due del mandato, e senza contatore resta un
     sospetto */
  await pag.addInitScript(s0 => {
    let x = s0 >>> 0 || 1, n = 0;
    const p = () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x >>> 0; };
    Math.random = () => { n++; return p() / 4294967296; };
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) { n++; a[i] = p(); } return a; };
    }
    window.__sorteggi = () => n;
  }, seme);

  await pag.goto('http://127.0.0.1:' + porta + '/CALCETTO-il-gioco.html', { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.waitForTimeout(500);
  const sorteggiCarico = await pag.evaluate(() => window.__sorteggi());
  await pag.evaluate(installaSonda);
  await pag.evaluate(() => {
    const t = window.__test;
    t.dismissSplash && t.dismissSplash();
    t.startMatch(1, 1);
  });
  await pag.waitForTimeout(400);
  const sorteggiAvvio = await pag.evaluate(() => window.__sorteggi());
  const cdp = await ctx.newCDPSession(pag);

  const centroPulsante = async quale => {
    const c = await pag.evaluate(q => {
      const bt = window.__test.pulsanti(0);
      const gr = bt.reduce((a, z) => (z.r > a.r ? z : a), bt[0]);
      const pc = bt.filter(z => z !== gr)[0];
      const b = q === 'grande' ? gr : pc;
      return { x: Math.round(b.x), y: Math.round(b.y) };
    }, quale);
    return c;
  };
  const premi = async (quale, tenuta) => {
    const c = await centroPulsante(quale);
    await dito.giu(cdp, c.x, c.y);
    await attesa(tenuta);
    await dito.su(cdp);
  };

  /* le quattro giocate nella STESSA sequenza e con gli STESSI tempi
     della batteria: quiete -> sonda -> 150 ms -> gesto -> 1300 ms */
  const passi = [
    { nome: 'passaggio', opz: { possesso: true, miraVuota: true }, gesto: () => premi('piccolo', 80) },
    { nome: 'trascina', opz: { possesso: false, avanti: 110 }, gesto: async info => {
      let x = info.comandato.x, y = info.comandato.y;
      const dx = info.palla.x - x, dy = info.palla.y - y, l = Math.max(1, Math.hypot(dx, dy));
      const px = dx / l, py = dy / l;
      await dito.giu(cdp, x, y);
      for (let i = 0; i < 14; i++) {
        x = dentro(x + px * 7, 15, info.vw - 15);
        y = dentro(y + py * 7, 60, info.vh - 60);
        await dito.sposta(cdp, x, y);
        await attesa(28);
      }
      await attesa(350);
      await dito.su(cdp);
    } },
    { nome: 'carica', opz: { possesso: true }, gesto: async () => {
      await pag.evaluate(() => window.__test.setTouchButtons(true));
      await premi('grande', 600);
      await pag.evaluate(() => window.__test.setTouchButtons(false));
    } },
    { nome: 'filtrante', opz: { possesso: true, mira: true }, gesto: () => premi('piccolo', 80) },
  ];

  let referto = null;
  for (const passo of passi) {
    const info = await pag.evaluate(preparaQuiete, passo.opz);
    if (info.errore) { referto = { errore: passo.nome + ': ' + info.errore }; break; }
    const quiete = passo.nome === 'filtrante' ? await pag.evaluate(dumpCampo) : null;
    const prima = await pag.evaluate(() => {
      const G = window.__test.G;
      return { filtranti: G.stats.filtranti ? (G.stats.filtranti[0] || 0) : 0, cross: G.stats.cross ? (G.stats.cross[0] || 0) : 0 };
    });
    await pag.evaluate(() => window.__sondaVia());
    await attesa(150);
    await passo.gesto(info);
    await attesa(1300);
    const dati = await pag.evaluate(() => window.__sondaAlt());
    const dopo = await pag.evaluate(() => {
      const G = window.__test.G;
      return { filtranti: G.stats.filtranti ? (G.stats.filtranti[0] || 0) : 0, cross: G.stats.cross ? (G.stats.cross[0] || 0) : 0 };
    });
    if (passo.nome !== 'filtrante') continue;

    /* l'analisi della filtrante, con la logica del cancello e in piu'
       la traccia del dot dentro la finestra dell'anticipo */
    const ev = dati.eventi || [];
    const inizio = ev.find(e => e.tipo === 'touchstart');
    const comandoT = inizio ? inizio.t : null;
    const C = dati.campioni || [];
    let base = null;
    for (const c of C) { if (comandoT != null && c.t <= comandoT) base = c; else break; }
    if (!base) base = C[0];
    let latenza = null;
    for (const c of C) {
      if (comandoT == null || c.t <= comandoT) continue;
      if (Math.hypot((c.palla.vx || 0) - (base.palla.vx || 0), (c.palla.vy || 0) - (base.palla.vy || 0)) > 40) { latenza = c.t - comandoT; break; }
    }
    /* la finestra del volo, come nel cancello */
    let zVoloMax = 0, inVolo = false, voloFinito = false, toccoNostro = null, passToVisto = null;
    for (const c of C) {
      if (comandoT == null || c.t <= comandoT) continue;
      if (!voloFinito && c.palla) {
        if (!inVolo) { if (c.palla.owner < 0) { inVolo = true; toccoNostro = c.ultimoTocco; } }
        else if (c.palla.owner >= 0 || c.ultimoTocco !== toccoNostro) voloFinito = true;
        if (inVolo && !voloFinito && c.palla.z != null) zVoloMax = Math.max(zVoloMax, c.palla.z);
      }
      if (passToVisto == null && c.palla && c.palla.passTo != null && c.palla.passTo >= 0) passToVisto = c.palla.passTo;
    }
    /* la traccia del dot: dalla pressione a +200 ms, campione per
       campione — e' il film di cio' che eseguiFiltrante vedra' */
    const traccia = C.filter(c => comandoT != null && c.t >= comandoT - 40 && c.t <= comandoT + 200)
      .map(c => ({ dt: +(c.t - comandoT).toFixed(0), bestDot: c.bestDot, bestIdx: c.bestIdx, bestDist: c.bestDist,
                   owner: c.palla.owner, passTo: c.palla.passTo, z: c.palla.z, vz: c.palla.vz,
                   filtranti: c.filtranti, carica: c.comandato ? c.comandato.carica : null }));
    const filtrantiFatte = dopo.filtranti - prima.filtranti;
    const esito = (latenza != null && latenza <= 500 && filtrantiFatte >= 1 && zVoloMax <= 5 && passToVisto != null) ? 'OK'
      : 'NO';
    const perche = filtrantiFatte < 1 ? 'contatore fermo'
      : zVoloMax > 5 ? 'quota z ' + zVoloMax.toFixed(1)
      : passToVisto == null ? 'passTo mai visto'
      : (latenza == null || latenza > 500) ? 'latenza' : '';
    referto = {
      esito, perche, latenzaMs: latenza != null ? +latenza.toFixed(0) : null,
      filtrantiFatte, zVoloMax: +zVoloMax.toFixed(2), passToVisto,
      sorteggiCarico, sorteggiAvvio, quiete, traccia,
    };
  }

  await ctx.close();
  await browser.close();
  return referto;
}

(async () => {
  const N = +arg('corse', 15);
  const seme = +arg('seme', 20260731);
  const fileJson = arg('json', null);
  const srv = await servi();
  const referti = [];
  for (let i = 1; i <= N; i++) {
    const r = await unaCorsa(srv.porta, seme);
    referti.push(r);
    console.log('corsa ' + String(i).padStart(2) + ':  ' + (r.errore ? 'ERRORE ' + r.errore :
      r.esito + (r.perche ? ' (' + r.perche + ')' : '') +
      '  lat ' + r.latenzaMs + ' ms  filtranti +' + r.filtrantiFatte +
      '  z ' + r.zVoloMax + '  passTo ' + r.passToVisto +
      '  sorteggi carico/avvio ' + r.sorteggiCarico + '/' + r.sorteggiAvvio +
      '  mira i' + (r.quiete ? r.quiete.bestIdx : '?') + ' dist ' + (r.quiete ? r.quiete.bestDist : '?') +
      ' dot ' + (r.quiete ? r.quiete.bestDot : '?')));
  }
  srv.chiudi();
  if (fileJson) {
    fs.writeFileSync(path.resolve(fileJson), JSON.stringify({ data: new Date().toISOString(), seme, referti }, null, 1));
    console.log('json: ' + path.resolve(fileJson));
  }
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
