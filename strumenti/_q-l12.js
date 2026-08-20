/* =====================================================================
   _q-l12.js — IL CANCELLO DEL DISCO DIFENSIVO (voce L1.2 di
   _analisi/agente28.md §4, riga «CONTRASTA»).

   Sorveglia le cinque proprieta' del disco lontano SENZA palla, piu' tre
   controlli di non regressione:

     A) alla PRESSIONE il contrasto avviene DAVVERO — il pallone cambia
        padrone — e NESSUNO finisce a terra;
     B) TENENDO si contiene: chi contiene rallenta e tiene la faccia sul
        portatore, misurato sulle velocita' e sugli angoli veri;
     C) il RILASCIO SENZA TRASCINAMENTO non produce ne' scivolata ne'
        fallo, in duecento prove;
     D) il TRASCINAMENTO ARMATO produce la scivolata NELLA DIREZIONE
        trascinata (angolo fra trascinamento e p.slideDX/DY);
     E) RIENTRANDO sotto R_ARMA prima del rilascio la scivolata non parte;
     F) SPAZZATA: pallone libero a portata nel proprio terzo, il contrasto
        lo manda VIA dalla propria porta, e senza corpo a terra;
     G) touchcancel con trascinamento armato: niente (Legge 4);
     H) la TASTIERA (Z) scivola ancora come oggi — non regressione.

   ---------------------------------------------------------------------
   COME SI LEGGE UN VERDETTO, QUI DENTRO. Ogni numero e' un EFFETTO della
   simulazione, e nessuno e' una bandiera scritta dal codice giudicato:
     · «il corpo e' a terra»          p.slide >= 0 (il campo che la
       fisica legge per inchiodare il giocatore in updatePlayerFisica);
     · «il pallone ha cambiato padrone» G.ball.owner;
     · «dove va la scivolata»         p.slideDX/p.slideDY, cioe' il
       vettore con cui updatePlayerFisica muove davvero il corpo;
     · «chi contiene rallenta»        Math.hypot(p.vx,p.vy) fotogramma
       per fotogramma, contro un BRACCIO DI CONTROLLO identico senza il
       dito destro;
     · «la faccia e' sul portatore»   l'angolo fra (p.fx,p.fy) e la
       direzione vera verso il portatore;
     · «il fallo»                     G.stats.falli, che e' il conto che
       il gioco stesso mostra a schermo;
     · «la spazzata»                  la velocita' vera del pallone e il
       segno della sua componente lungo l'asse lungo del campo.
   NESSUN campo nuovo della toppa viene letto: questo file gira identico
   sul gioco di oggi e su quello toppato.

   IL CONTROLLO NEGATIVO, E PERCHE' CE N'E' UNO PER OGNI VERDETTO CHE LO
   AMMETTE. Uno strumento che non e' stato visto fallire non e' uno
   strumento: A e B hanno un braccio a DITO FERMO — stessa scena, stesso
   seme, stesso istante, senza il dito sul disco — e il verdetto pretende
   che i due bracci siano DIVERSI. Cosi' «verde» non si compra spegnendo
   il verbo (il braccio premuto crollerebbe) ne' accendendolo sempre (il
   braccio di controllo salirebbe).

   uso:
     node strumenti/_q-l12.js                       (sul gioco di casa)
     node strumenti/_q-l12.js --gioco fuori/dopo.html
     node strumenti/_q-l12.js --testa               (finestra visibile)
     node strumenti/_q-l12.js --corte               (meno ripetizioni)
   esce 0 se tutti i verdetti sono verdi, 1 se anche uno solo e' rosso,
   2 se il banco e' esploso, 3 se una scena non ha messo alla prova nulla.

   IL BANCO E' UN BROWSER, NON UN VETRO. Chromium senza inserti di
   sistema, dita scritte con Input.dispatchTouchEvent del protocollo,
   tempo preso in mano a passo fisso (un requestAnimationFrame per
   chiamata, DT = 1/60 esatto) e Math.random a seme fisso: due corse
   danno gli stessi numeri. Nessuna di queste prove tocca vetro.

   IL POLLICE SINISTRO NON SI ALZA MAI, in nessuna prova che lo usa (B):
   si posa una volta sull'erba, si trascina, e resta giu' fino alla fine
   della scena. E' il vincolo fisico del progetto, e un banco che alzasse
   il dito misurerebbe un gioco che non esiste.
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
const CORTE = process.argv.includes('--corte');
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
               '.png': 'image/png', '.json': 'application/json' };

/* Playwright non apre file: — serve un server locale. Qualunque richiesta
   del gioco viene deviata sul file che stiamo giudicando, cosi' la stessa
   pagina serve base e copia toppata senza copiare niente in giro. */
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

/* il tempo in mano al banco: un fotogramma per chiamata, 1000/60 ms,
   cioe' esattamente un passo di step() per passo(1) */
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

/* ---------------------------------------------------------------------
   LE DITA DI PROTOCOLLO, A PIU' CONTATTI.
   Input.dispatchTouchEvent vuole, a ogni touchStart/touchMove, TUTTI i
   contatti vivi: il browser ricava da solo quali sono cambiati. Percio'
   il banco tiene una mappa dei contatti e la spedisce intera ogni volta.
   Un touchEnd senza punti alza tutte le dita insieme, ed e' l'unico modo
   che il protocollo offre: le prove che devono alzare UN dito solo (B)
   non alzano niente fino alla fine della scena, che e' anche cio' che
   fa un pollice vero.
   --------------------------------------------------------------------- */
function mano(cdp) {
  const giu = new Map();
  const punti = () => [...giu.entries()].map(([id, p]) => ({ x: p.x, y: p.y, id }));
  return {
    async posa(id, x, y) { giu.set(id, { x, y }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: punti() }); },
    async sposta(id, x, y) { giu.set(id, { x, y }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: punti() }); },
    async alzaTutte() { giu.clear(); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); },
    async annullaTutte() { giu.clear(); await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] }); },
    async sicuro() { try { giu.clear(); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); } catch (e) {} },
    vive: () => giu.size,
  };
}

/* ---------------------------------------------------------------------
   LA SONDA. Avvolge updateBall — l'ultima cosa che il passo di
   simulazione fa dopo aver mosso tutti i giocatori — e prende UN
   CAMPIONE PER FOTOGRAMMA dello stato vero. Non decide niente: registra.
   Si avvolge updateBall e non step() perche' step() sceglie da solo
   quanti passi fare, mentre updateBall gira esattamente una volta per
   passo di simulazione: un campione per passo, mai due, mai zero.
   --------------------------------------------------------------------- */
function installaSonda() {
  if (window.__sonda) return 'gia';
  /* Se il gioco cambiasse il nome dell'imbuto della fisica del pallone,
     a essere invecchiato sarebbe IL BANCO, non il gioco: si esce col
     codice del banco (2) e col nome scritto, invece di esplodere con un
     messaggio che sembra un difetto del gioco. */
  if (typeof window.updateBall !== 'function')
    return 'BANCO INVECCHIATO: window.updateBall non esiste piu\'. Questa sonda prende un campione per fotogramma avvolgendola; se il gioco ha cambiato il passo del pallone, va aggiornato il banco.';
  const G = window.__test.G;
  const S = { pi: -1, oi: -1, tr: [], n: 0, attivo: false, calci: [] };
  window.__sonda = S;
  /* IL SECONDO IMBUTO: kickBall e' l'unico punto da cui parte un calcio
     del gioco (lo dice il gioco stesso, sopra b.crossTo). Registrarlo
     serve a due cose: la spazzata di F si legge sulla velocita' vera del
     pallone, e una scena che si scioglie — il portatore che calcia
     mentre si misura il contenimento — si vede invece di restare un
     mistero. */
  if (typeof window.kickBall === 'function') {
    const ok = window.kickBall;
    window.kickBall = function (p, nx, ny, speed, spinY) {
      const r = ok.call(this, p, nx, ny, speed, spinY);
      if (S.attivo && r) S.calci.push({ n: S.n, chi: G.players.indexOf(p), v: Math.round(speed) });
      return r;
    };
  }
  const orig = window.updateBall;
  window.updateBall = function (dt) {
    const r = orig.call(this, dt);
    if (S.attivo) {
      const p = S.pi >= 0 ? G.players[S.pi] : null;
      const o = S.oi >= 0 ? G.players[S.oi] : null;
      const ci = G.ctrl[0], c = ci >= 0 ? G.players[ci] : null;
      const b = G.ball;
      S.tr.push({
        n: S.n++,
        ps: p ? p.slide : null, pr: p ? p.recover : null,
        pv: p ? Math.hypot(p.vx, p.vy) : null,
        px: p ? p.x : null, py: p ? p.y : null,
        pfx: p ? p.fx : null, pfy: p ? p.fy : null,
        sdx: p ? p.slideDX : null, sdy: p ? p.slideDY : null,
        ci: ci, cv: c ? Math.hypot(c.vx, c.vy) : null,
        cx: c ? c.x : null, cy: c ? c.y : null,
        cfx: c ? c.fx : null, cfy: c ? c.fy : null,
        cs: c ? c.slide : null,
        ov: o ? Math.hypot(o.vx, o.vy) : null, ox: o ? o.x : null, oy: o ? o.y : null,
        os: o ? o.slide : null, oout: o ? o.out : null, orove: o ? o.rove : null, okc: o ? o.kickCd : null,
        /* IL PORTATORE VERO DI QUESTO FOTOGRAMMA, non quello che la scena
           aveva scelto: se il pallone passa di piede, «di fronte a chi»
           cambia, e un banco che continuasse a misurare l'angolo verso il
           primo uomo accuserebbe il gioco di guardare dalla parte
           sbagliata mentre guarda esattamente quella giusta. */
        qx: (b.owner >= 0 && G.players[b.owner] && G.players[b.owner].team !== 0) ? G.players[b.owner].x : null,
        qy: (b.owner >= 0 && G.players[b.owner] && G.players[b.owner].team !== 0) ? G.players[b.owner].y : null,
        bo: b.owner, bx: b.x, by: b.y, bvx: b.vx, bvy: b.vy,
        f0: G.stats.falli[0], f1: G.stats.falli[1], sc: G.scene,
      });
    }
    return r;
  };
  return 'ok';
}

/* ---------------------------------------------------------------------
   LA SCENA. Una funzione sola, chiamata prima di ogni ripetizione: mette
   il comandato al centro, un avversario col pallone alla distanza e
   all'angolo chiesti, e SPINGE VIA tutti gli altri (portieri esclusi:
   spostare un portiere vuol dire misurare un altro gioco).
   Torna anche cosa OFFRE il disco grande in quell'istante — chiesto al
   gioco con __test.pulsanti, non dedotto qui — cosi' una scena che non
   offre CONTRASTA si dichiara NULLA invece di accusare il gioco.
   --------------------------------------------------------------------- */
function posaScena(o) {
  const t = window.__test, G = t.G;
  const FW = t.campo.FW, FH = t.campo.FH;
  for (let i = 0; i < 900 && G.scene !== 'play'; i++) t.simulate(1 / 60);
  if (G.scene !== 'play') return { errore: 'la partita non e\' in gioco: scena \'' + G.scene + '\'' };
  G.freeze = 0;
  t.setTimeLeft && t.setTimeLeft(80);
  const pi = G.ctrl[0];
  if (pi < 0) return { errore: 'nessun giocatore comandato' };
  const p = G.players[pi], b = G.ball;
  const pulisci = q => {
    q.slide = -1; q.recover = 0; q.out = 0; q.rove = -1;
    q.kickCd = 0; q.kickT = 0; q.kickB = 0;
    q.vx = 0; q.vy = 0; q.ax = 0; q.ay = 0; q.fiato = 100; q.sprint = false;
    if (q.charge >= 0) { q.charge = -1; q.chargeKind = 'tiro'; q.chargeT = 0; q.chargeGo = null; q.chargeClip = null; }
  };
  pulisci(p);
  p.x = o.px !== undefined ? o.px : FW * 0.5;
  p.y = o.py !== undefined ? o.py : FH * 0.5;
  b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0; b.curve = 0; b.perfectT = 0;
  b.passTo = -1; b.crossTo = -1; b.saveRolled = false;
  const a = (o.ang || 0) * Math.PI / 180;
  const bx = p.x + Math.cos(a) * o.d, by = p.y + Math.sin(a) * o.d;
  let oi = -1;
  if (o.conPortatore) {
    for (let i = 0; i < G.players.length; i++) {
      const q = G.players[i];
      if (q.team === p.team || q.out > 0 || q.role === 'gk') continue;
      oi = i; break;
    }
    if (oi < 0) return { errore: 'nessun avversario di movimento' };
    const q = G.players[oi];
    pulisci(q);
    /* il portatore GUARDA il comandato, e il pallone gli sta davanti ai
       piedi a CARRY_DIST: e' dove updateBall lo rimette ogni fotogramma,
       quindi metterlo altrove sarebbe una posa che il gioco disfa subito */
    const ux = p.x - bx, uy = p.y - by, ul = Math.max(1e-6, Math.hypot(ux, uy));
    q.fx = ux / ul; q.fy = uy / ul;
    q.x = bx - q.fx * 16; q.y = by - q.fy * 16;
    /* IL PORTATORE HA APPENA TOCCATO IL PALLONE: kickCd alto vuol dire
       che per tutta la scena non passa e non tira (ogni ramo di calcio
       dell'IA pretende kickCd<=0). Non e' un blocco inventato dal banco,
       e' uno stato che il gioco produce da solo dopo ogni tocco; serve
       perche' una scena in cui il pallone cambia piede a meta' misura
       un'altra cosa. Corre e dribbla come sempre. */
    q.aiTX = q.x; q.aiTY = q.y; q.kickCd = 3;
    /* E HA APPENA DECISO. aiActT e' il campo con cui il gioco stesso
       tiene ferma una decisione della CPU («non decide altro mentre
       carica», scritto in aiDecide): finche' e' positivo il portatore
       non sceglie un gesto nuovo. Senza, la CPU scarica il pallone
       appena si sente pressata — misurato: con un difensore a 70 unita'
       passa entro 0,35 s — e la scena si scioglie prima di aver
       misurato qualcosa. Corre, dribbla ed e' contrastabile come
       sempre: e' il PENSIERO che sta fermo, non il corpo. */
    q.aiActT = 2.5;
    b.owner = oi; b.x = bx; b.y = by;
    p.fx = -q.fx; p.fy = -q.fy;        // faccia a faccia: il caso del contrasto
  } else {
    b.owner = -1; b.x = bx; b.y = by;
    p.fx = Math.cos(a); p.fy = Math.sin(a);
  }
  for (let i = 0; i < G.players.length; i++) {
    const q = G.players[i];
    if (i === pi || i === oi || q.role === 'gk') continue;
    pulisci(q);
    const dx = q.x - b.x, dy = q.y - b.y, d = Math.max(1, Math.hypot(dx, dy));
    if (d < 300) {
      q.x = Math.max(12, Math.min(FW - 12, b.x + dx / d * 320));
      q.y = Math.max(12, Math.min(FH - 12, b.y + dy / d * 320));
    }
    q.aiTX = q.x; q.aiTY = q.y;
  }
  G.stats.falli[0] = 0; G.stats.falli[1] = 0;
  const S = window.__sonda;
  S.pi = pi; S.oi = oi; S.tr = []; S.n = 0; S.calci = []; S.attivo = true;
  const bt = t.pulsanti(0);
  const grande = bt.reduce((x, c) => (c.r || 0) > (x.r || 0) ? c : x, bt[0]);
  return { pi, oi, disco: { x: grande.x, y: grande.y, r: grande.r, act: grande.act, label: grande.label },
           d: Math.hypot(b.x - p.x, b.y - p.y), px: p.x, py: p.y, bx: b.x, by: b.y, FW, FH };
}

/* avvicina il pallone (e chi ce l'ha) al comandato, a distanza voluta e
   sulla stessa retta: e' il modo in cui il banco fa succedere, in mezzo a
   una pressione, cio' che nella partita succede correndo. */
function avvicina(dNuova) {
  const t = window.__test, G = t.G, S = window.__sonda;
  const p = G.players[S.pi], b = G.ball;
  const dx = b.x - p.x, dy = b.y - p.y, l = Math.max(1e-6, Math.hypot(dx, dy));
  const nx = dx / l, ny = dy / l;
  const bx = p.x + nx * dNuova, by = p.y + ny * dNuova;
  if (S.oi >= 0) {
    const q = G.players[S.oi];
    q.fx = -nx; q.fy = -ny;
    q.x = bx + nx * 16; q.y = by + ny * 16;
    q.vx = 0; q.vy = 0; q.ax = 0; q.ay = 0;
    q.aiTX = q.x + nx * 200; q.aiTY = q.y + ny * 200;   // il portatore vuole allontanarsi
  }
  b.x = bx; b.y = by; b.vx = 0; b.vy = 0;
  p.fx = nx; p.fy = ny;
  return { d: Math.hypot(b.x - p.x, b.y - p.y), att: t.pulsanti(0)[0].act };
}

/* il riassunto di una ripetizione, calcolato IN PAGINA sulla traccia:
   cosi' fra il banco e il browser passa un oggetto piccolo e non
   duecento tracce intere. */
function riassunto() {
  const S = window.__sonda, tr = S.tr, G = window.__test.G;
  if (!tr.length) return { vuota: true };
  let aTerra = 0, primaTerra = -1, presa = 0, primaPresa = -1;
  let sdx = null, sdy = null;
  for (const r of tr) {
    if (r.ps !== null && r.ps >= 0) { aTerra++; if (primaTerra < 0) { primaTerra = r.n; sdx = r.sdx; sdy = r.sdy; } }
    if (r.bo === S.pi) { presa++; if (primaPresa < 0) primaPresa = r.n; }
  }
  const u = tr[tr.length - 1];
  return {
    n: tr.length, aTerra, primaTerra, presa, primaPresa, sdx, sdy,
    falli: (u.f0 - tr[0].f0) + (u.f1 - tr[0].f1),
    falli0: u.f0 - tr[0].f0,
    owner: u.bo, ci: u.ci, ciCambi: tr.filter((r, i) => i > 0 && r.ci !== tr[i - 1].ci).length,
    bv: Math.hypot(u.bvx, u.bvy), bvx: u.bvx, bvy: u.bvy,
    scena: u.sc,
  };
}

/* la finestra di misura del contenimento: media della velocita' del
   COMANDATO e dell'angolo fra la sua faccia e la direzione vera verso il
   portatore, sui fotogrammi da «da» a «a». */
function traccia() {
  const S = window.__sonda, tr = S.tr;
  return {
    righe: tr.map(r => ({ n: r.n, cv: r.cv, cx: r.cx, cy: r.cy, cfx: r.cfx, cfy: r.cfy,
                          qx: r.qx, qy: r.qy, ci: r.ci, cs: r.cs, ov: r.ov, bo: r.bo })),
    calci: S.calci.map(c => c.n + ':' + c.chi + '@' + c.v).join(' '),
  };
}

/* ===================================================================== */
const n2 = v => (v === null || v === undefined || !isFinite(v)) ? 'n/d' : (Math.round(v * 100) / 100).toString().replace('.', ',');
const gradi = (dx, dy) => Math.atan2(dy, dx) * 180 / Math.PI;
const dAng = (a, b) => { let d = a - b; while (d > 180) d -= 360; while (d < -180) d += 360; return Math.abs(d); };
const mediana = v => { if (!v.length) return null; const s = [...v].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

(async () => {
  const srv = await servi();
  const br = await chromium.launch({ headless: !TESTA });
  const ctx = await br.newContext({ viewport: { width: 915, height: 412 },
    deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const eccezioni = [];

  async function apri() {
    const pag = await ctx.newPage();
    await pag.addInitScript(seme => {
      let s = seme >>> 0 || 1;
      const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
      Math.random = () => p() / 4294967296;
    }, 20260819);
    await pag.addInitScript(bancoDiProva);
    pag.on('pageerror', e => eccezioni.push(e.message));
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 25000 });
    await pag.evaluate(() => window.__banco.passo(6));
    await pag.evaluate(() => {
      const t = window.__test, G = t.G;
      try { t.dismissSplash && t.dismissSplash(); } catch (e) {}
      t.setPaused && t.setPaused(false);
      try { if (t.Tut && t.Tut.active && t.Tut.finish) t.Tut.finish(true); } catch (e) {}
      for (let g = 0; g < 3 && G.scene !== 'play'; g++) {
        for (let i = 0; i < 200 && G.scene !== 'play'; i++) t.simulate(0.1);
        if (G.scene !== 'play') { t.startMatch(1, 1, { size: 5 }); for (let i = 0; i < 80 && G.scene !== 'play'; i++) t.simulate(0.1); }
      }
    });
    const sonda = await pag.evaluate(installaSonda);
    if (sonda !== 'ok' && sonda !== 'gia') { console.error('FALLITO: ' + sonda); await br.close(); srv.chiudi(); process.exit(2); }
    const cdp = await ctx.newCDPSession(pag);
    const passo = n => pag.evaluate(k => window.__banco.passo(k), n);
    return { pag, cdp, passo, dita: mano(cdp) };
  }

  /* la tela dev'essere davvero sotto il punto che si preme: se sopra c'e'
     un pannello, la prova non e' nulla — e' finta. */
  async function controllaTela(pag, P) {
    return pag.evaluate(([x, y]) => {
      const el = document.elementFromPoint(x, y);
      return el ? el.tagName + '#' + el.id : 'niente';
    }, [P.x, P.y]);
  }

  const esiti = [];
  const righe = [];
  const stampa = s => { righe.push(s); console.log(s); };

  stampa('=== CANCELLO L1.2 — il disco difensivo: contrasto, contenimento, scivolata ===');
  stampa('  gioco: ' + GIOCO);
  stampa('  banco: Chromium 915x412 dpr2, dita di protocollo, DT=1/60 in mano, seme 20260819' + (CORTE ? '  [--corte]' : ''));
  stampa('');

  /* -------------------------------------------------------------------
     A — IL CONTRASTO ALLA PRESSIONE, E NESSUN CORPO A TERRA.

     La scena: il portatore avversario a 40 unita' dal comandato (oltre
     KICK_R*1,4 = 36,4, quindi il disco grande offre davvero CONTRASTA —
     e lo si CHIEDE al gioco, non lo si deduce). Si preme. Poi il banco
     porta il portatore a 25 unita', cioe' dentro il raggio di calcio ma
     FUORI dal raggio del furto col corpo (P_R+B_R+1 = 22): quello che in
     partita si ottiene correndogli addosso.
     Quattro fotogrammi dopo si guarda chi ha il pallone e chi e' per
     terra.

     IL BRACCIO DI CONTROLLO E' LA META' DELLA MISURA: stessa scena,
     stesso seme, stessa distanza, DITO FERMO. A 25 unita' il furto col
     corpo non arriva, quindi senza il dito il pallone non deve cambiare
     padrone quasi mai. Se cambiasse anche li', il verbo non starebbe
     facendo niente e il verde sarebbe dell'aria.
     ------------------------------------------------------------------- */
  {
    const N = CORTE ? 40 : 140;
    const { pag, cdp, passo, dita } = await apri();
    const q0 = await pag.evaluate(posaScena, { d: 40, ang: 0, conPortatore: true });
    if (q0.errore) throw new Error('A/scena: ' + q0.errore);
    const P = q0.disco;
    const tela = await controllaTela(pag, P);
    if (tela !== 'CANVAS#gioco') throw new Error('A: sul disco (' + P.x + ',' + P.y + ') non c\'e\' la tela ma ' + tela);

    async function braccio(premi) {
      let presi = 0, terra = 0, nulle = 0, falli = 0;
      for (let k = 0; k < N; k++) {
        const q = await pag.evaluate(posaScena, { d: 40, ang: 0, conPortatore: true });
        if (q.errore || q.disco.act !== 'slide') { nulle++; await dita.sicuro(); continue; }
        if (premi) await dita.posa(1, P.x, P.y);
        await pag.evaluate(avvicina, 25);
        await passo(4);
        const r = await pag.evaluate(riassunto);
        if (premi) await dita.alzaTutte();
        await passo(1);
        if (r.vuota) { nulle++; continue; }
        if (r.presa > 0) presi++;
        if (r.aTerra > 0) terra++;
        falli += r.falli;
      }
      return { presi, terra, nulle, falli };
    }
    const conDito = await braccio(true);
    const senza = await braccio(false);
    await dita.sicuro();
    await pag.close();

    const valide = N - conDito.nulle;
    const ok = valide >= N * 0.8 && conDito.terra === 0 &&
               conDito.presi >= valide * 0.45 && senza.presi <= (N - senza.nulle) * 0.12;
    esiti.push({ id: 'A', nome: 'il contrasto alla pressione prende il pallone e non manda nessuno a terra', ok });
    stampa('A) CONTRASTO ALLA PRESSIONE — portatore a 40 unita\' (disco «' + q0.disco.act + '»), poi portato a 25; quattro fotogrammi');
    stampa('   con il dito :  pallone conquistato ' + conDito.presi + '/' + (N - conDito.nulle) +
           '  ·  corpo a terra ' + conDito.terra + '/' + (N - conDito.nulle) + '  ·  falli ' + conDito.falli + '  ·  scene nulle ' + conDito.nulle);
    stampa('   a dito fermo:  pallone conquistato ' + senza.presi + '/' + (N - senza.nulle) +
           '  ·  corpo a terra ' + senza.terra + '/' + (N - senza.nulle) + '  ·  falli ' + senza.falli + '  ·  scene nulle ' + senza.nulle);
    stampa('   atteso: col dito >= 45% di conquiste, a dito fermo <= 12%, e ZERO corpi a terra col dito  ->  ' + (ok ? 'VERDE' : 'ROSSO'));
    stampa('');
  }

  /* -------------------------------------------------------------------
     A2 — LO STESSO CONTRASTO, MA CHIESTO MENTRE SI ARRIVA.

     A mette il portatore a portata con la mano del banco. Qui no: il
     POLLICE SINISTRO porta il difensore addosso all'avversario, e il
     contrasto deve maturare da solo dentro la sua finestra di 0,18 s.
     E' la prova che il verbo esiste in partita e non solo in scena,
     perche' c'e' un incastro da guardare in faccia: il disco offre
     CONTRASTA solo oltre KICK_R*1,4 = 36,4 unita' (da li' in dentro
     offre TIRA, e ha ragione: un calcio parte davvero), mentre il piede
     del contrasto arriva a KICK_R = 26. Quelle 10,4 unita' si coprono
     correndo, dentro la finestra, o non si coprono affatto.

     Braccio di controllo: identico, pollice compreso, senza il dito
     destro. Li' resta solo il furto col corpo di updateBall, che arriva
     a 22 unita' e vale 0,42: la differenza fra i due bracci e' tutto
     cio' che il dito compra.
     ------------------------------------------------------------------- */
  {
    const N = CORTE ? 16 : 60;
    const D = 45;
    const { pag, cdp, passo, dita } = await apri();
    const q0 = await pag.evaluate(posaScena, { d: D, ang: 0, conPortatore: true });
    if (q0.errore) throw new Error('A2/scena: ' + q0.errore);
    const P = q0.disco;
    /* LA CORSA LA COMANDA LA TASTIERA, e va detto perche'. Il protocollo
       del banco non sa alzare UN dito solo (touchEnd li alza tutti):
       per rilasciare il disco tenendo giu' il pollice servirebbe una cosa
       che Input.dispatchTouchEvent non offre. Il movimento passa allora
       da Keys, che e' lo stesso imbuto — humanMove(0) — e cosi' nessun
       dito si alza mai quando non deve. La levetta vera la prova B. */
    await pag.keyboard.down('KeyD');
    async function braccio(modo) {
      let presi = 0, terra = 0, nulle = 0, falli = 0, quando = [];
      for (let k = 0; k < N; k++) {
        const q = await pag.evaluate(posaScena, { d: D, ang: 0, conPortatore: true });
        if (q.errore || q.disco.act !== 'slide') { nulle++; await dita.sicuro(); continue; }
        if (modo !== 'niente') await dita.posa(1, P.x, P.y);
        if (modo === 'colpetto') { await passo(3); await dita.alzaTutte(); await passo(21); }
        else await passo(24);
        const r = await pag.evaluate(riassunto);
        await dita.sicuro();
        await passo(1);
        if (r.vuota) { nulle++; continue; }
        if (r.presa > 0) { presi++; if (quando.length < 6) quando.push(r.primaPresa); }
        if (r.aTerra > 0) terra++;
        falli += r.falli;
      }
      return { presi, terra, nulle, falli, quando };
    }
    const colpetto = await braccio('colpetto');
    const tenuto = await braccio('tenuto');
    const niente = await braccio('niente');
    await pag.keyboard.up('KeyD');
    await dita.sicuro();
    await pag.close();
    /* IL VERDETTO STA SU CIO' CHE E' ROBUSTO, e la differenza fra i
       bracci NON lo e': misurata su sessanta ripetizioni per braccio,
       24 / 23 / 21 conquiste, cioe' dentro il rumore. E' un risultato,
       non un guasto — in un arrivo frontale il furto col corpo (raggio
       22, gia' nel gioco) arriva comunque entro 0,4 s, quindi il piede
       teso non ha molto da aggiungere. Quanto vale il dito si misura
       dove il furto col corpo NON arriva, ed e' la prova A: 102 su 140
       contro 1 su 140. Qui il verdetto e' l'altra meta' della promessa,
       che invece e' netta: PREMENDO E CORRENDO ADDOSSO A UN UOMO NON SI
       FINISCE PER TERRA, ne' col colpetto ne' tenendo. Oggi si finisce
       per terra 60 volte su 60. */
    const ok = (N - colpetto.nulle) >= N * 0.8 &&
               colpetto.terra === 0 && tenuto.terra === 0 && niente.terra === 0 &&
               colpetto.presi >= (N - colpetto.nulle) * 0.15;
    esiti.push({ id: 'A2', nome: 'chiedere il contrasto correndo addosso non manda mai a terra, e il pallone si conquista lo stesso', ok });
    stampa('A2) CONTRASTO CHIESTO MENTRE SI ARRIVA — portatore a ' + D + ' unita\', il difensore corre addosso, 24 fotogrammi (0,4 s) dalla pressione');
    stampa('   Tre bracci, stessa scena, stesso seme, stessa corsa. Il disco offre CONTRASTA solo oltre KICK_R*1,4 = 36,4 unita\',');
    stampa('   il piede del contrasto arriva a KICK_R = 26, la finestra dura 0,18 s (11 fotogrammi): 45 unita\' e\' la distanza');
    stampa('   da cui si chiede il contrasto STANDO PER ARRIVARE.');
    for (const [nome, b] of [['colpetto (premi e lasci)', colpetto], ['tenuto   (premi e tieni) ', tenuto], ['dito fermo (controllo)  ', niente]]) {
      stampa('   ' + nome + ': conquiste ' + b.presi + '/' + (N - b.nulle) + '  ·  corpo a terra ' + b.terra + '  ·  falli ' + b.falli +
             '  ·  fotogramma della conquista (primi campioni): [' + b.quando.join(' ') + ']');
    }
    stampa('   LE TRE CONQUISTE NON SI DEVONO CONFRONTARE FRA LORO: in un arrivo frontale il furto col corpo che il gioco ha');
    stampa('       gia\' (raggio 22, updateBall) arriva comunque entro 0,4 s, quindi il piede teso ha poco da aggiungere e la');
    stampa('       differenza fra i tre bracci sta dentro il rumore. Quanto vale il dito si legge nella prova A, dove il furto');
    stampa('       col corpo NON arriva. Qui si misura l\'altra meta\' della promessa, e quella e\' netta.');
    stampa('   atteso: ZERO corpi a terra in tutti e tre i bracci, e il pallone si conquista lo stesso  ->  ' + (ok ? 'VERDE' : 'ROSSO'));
    stampa('');
  }

  /* -------------------------------------------------------------------
     B — IL CONTENIMENTO: SI RALLENTA E SI TIENE LA FACCIA.

     Due bracci identici, e in tutti e due IL POLLICE SINISTRO NON SI
     ALZA MAI: si posa sull'erba, spinge 50 px (oltre STICK_FULL = 46,
     sotto STICK_SPRINT = 66: corsa piena, nessuno scatto) verso l'alto,
     cioe' PERPENDICOLARE alla direzione del portatore, e resta giu' fino
     alla fine della scena.
       · braccio TIENE:     piu' un secondo dito fermo sul disco grande;
       · braccio CONTROLLO: solo il pollice.

     PERCHE' IL PORTATORE STA A 110 UNITA' E NON A 70. A 70 la scena non
     tiene: misurato su questo stesso banco, con un difensore a 70 unita'
     la CPU scarica il pallone entro 0,35 s (il ramo «scarica se pressato»
     di aiDecide, che con un avversario sotto le 80 unita' passa col 75%
     a ogni decisione), e da li' in poi non c'e' piu' un portatore da
     contenere. A 110 il portatore resta tale abbastanza a lungo perche'
     la misura significhi qualcosa. In tutti e due i casi il pallone e'
     ben oltre KICK_R*1,4 = 36,4, quindi il disco offre CONTRASTA per
     tutta la scena e nessun contrasto puo' riuscire: cio' che si misura
     e' il CONTENIMENTO e nient'altro.

     LA FINESTRA SI ADATTA, ED E' LA STESSA PER I DUE BRACCI. Comincia al
     quattordicesimo fotogramma (l'accelerazione si e' assestata) e
     finisce all'ULTIMO fotogramma in cui, IN TUTTI E DUE I BRACCI, il
     pallone e' ancora di un avversario. Se resta corta sotto i dodici
     fotogrammi la prova e' NULLA: il banco non e' riuscito a imbastirla,
     e dirlo e' l'unica cosa onesta da fare.
     ------------------------------------------------------------------- */
  {
    const ERBA = { x: 165, y: 272 };
    const DIST = 110;
    async function braccio(conDisco) {
      const { pag, cdp, passo, dita } = await apri();
      const q = await pag.evaluate(posaScena, { d: DIST, ang: 0, conPortatore: true });
      if (q.errore) throw new Error('B/scena: ' + q.errore);
      const P = q.disco;
      const tela = await controllaTela(pag, P);
      if (tela !== 'CANVAS#gioco') throw new Error('B: sul disco non c\'e\' la tela ma ' + tela);
      await dita.posa(1, ERBA.x, ERBA.y);
      for (let k = 1; k <= 8; k++) { await passo(1); await dita.sposta(1, ERBA.x, ERBA.y - 50 * k / 8); }
      if (conDisco) await dita.posa(2, P.x, P.y);
      await passo(60);
      const tr = await pag.evaluate(traccia);
      const stato = await pag.evaluate(() => ({
        levetta: Touch5.stick[0].active, dx: Touch5.stick[0].dx, dy: Touch5.stick[0].dy,
        dita: Object.keys(Touch5.btnTouch).length, atto: Touch5.btnTouch[2] ? Touch5.btnTouch[2].act : null,
        disco: window.__test.pulsanti(0)[0].act,
      }));
      await dita.sicuro();
      await pag.close();
      return { tr, stato, disco: q.disco.act };
    }
    /* l'ultimo fotogramma in cui il pallone e' ancora di un avversario,
       senza interruzioni dall'inizio: dopo, non c'e' piu' niente da
       contenere e ogni angolo misurato sarebbe verso un uomo qualsiasi */
    const ultimoConPortatore = t => { let u = -1; for (const r of t.righe) { if (r.qx === null) break; u = r.n; } return u; };
    const misura = (t, da, aFin) => {
      let nv = 0, sv = 0, na = 0, sa = 0, nov = 0, sov = 0, cambi = 0, aTerra = 0;
      for (let i = 0; i < t.righe.length; i++) {
        const r = t.righe[i];
        if (i > 0 && r.ci !== t.righe[i - 1].ci) cambi++;
        if (r.cs !== null && r.cs >= 0) aTerra++;
        if (r.n < da || r.n > aFin) continue;
        if (r.cv !== null) { sv += r.cv; nv++; }
        if (r.ov !== null) { sov += r.ov; nov++; }
        if (r.cfx !== null && r.qx !== null) {
          const dx = r.qx - r.cx, dy = r.qy - r.cy, l = Math.hypot(dx, dy);
          if (l > 1) { let d = Math.atan2(dy, dx) - Math.atan2(r.cfy, r.cfx);
            while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
            sa += Math.abs(d) * 180 / Math.PI; na++; } }
      }
      return { vel: nv ? sv / nv : null, ang: na ? sa / na : null, velPort: nov ? sov / nov : null,
               n: nv, cambi, aTerra };
    };
    const tiene = await braccio(true);
    const libero = await braccio(false);
    const DA = 14;
    const A = Math.min(49, ultimoConPortatore(tiene.tr), ultimoConPortatore(libero.tr));
    const scenaOk = A - DA + 1 >= 12;
    const ft = misura(tiene.tr, DA, A), fl = misura(libero.tr, DA, A);
    const rap = (ft.vel !== null && fl.vel > 1) ? ft.vel / fl.vel : null;
    /* IL RAPPORTO CHE FA TESTO E' QUELLO DELLA CODA, non quello di tutta
       la finestra: nella prima parte i due bracci stanno ancora salendo
       verso la loro velocita' di regime, e chi sale verso un tetto piu'
       basso ci arriva prima — il rapporto sull'intera finestra risulta
       percio' piu' alto del fattore vero. Sugli ultimi dodici fotogrammi
       tutti e due sono a regime e il rapporto e' il fattore. */
    const ct = misura(tiene.tr, A - 11, A), cl = misura(libero.tr, A - 11, A);
    const rapCoda = (ct.vel !== null && cl.vel > 1) ? ct.vel / cl.vel : null;
    const ok = scenaOk && rapCoda !== null && rapCoda >= 0.55 && rapCoda <= 0.70 &&
               ft.ang !== null && ft.ang <= 25 &&
               fl.ang !== null && fl.ang >= 40 &&
               ft.aTerra === 0;
    esiti.push({ id: 'B', nome: 'tenendo si contiene: velocita\' per 0,62 e faccia sul portatore', ok: scenaOk ? ok : null });
    stampa('B) CONTENIMENTO — pollice sull\'erba a 50 px (corsa piena, nessuno scatto), portatore a ' + DIST + ' unita\'; finestra adattiva ' + DA + '..' + A + ' (' + (A - DA + 1) + ' fotogrammi)');
    stampa('   TIENE     : velocita\' media ' + n2(ft.vel) + ' unita\'/s  ·  angolo faccia-portatore ' + n2(ft.ang) + ' gradi  ·  corpo a terra ' + ft.aTerra + ' fotogrammi' +
           '  ·  cambi di comandato ' + ft.cambi + '  ·  disco alla posa «' + tiene.disco + '», alla fine «' + tiene.stato.disco + '»' +
           '  ·  levetta viva ' + tiene.stato.levetta + ' (dx ' + n2(tiene.stato.dx) + ', dy ' + n2(tiene.stato.dy) + ')');
    stampa('   CONTROLLO : velocita\' media ' + n2(fl.vel) + ' unita\'/s  ·  angolo faccia-portatore ' + n2(fl.ang) + ' gradi  ·  corpo a terra ' + fl.aTerra + ' fotogrammi' +
           '  ·  cambi di comandato ' + fl.cambi + '  ·  levetta viva ' + libero.stato.levetta);
    stampa('   rapporto delle velocita\' TIENE/CONTROLLO: ' + n2(rapCoda) + ' sugli ultimi dodici fotogrammi (' + n2(ct.vel) + ' contro ' + n2(cl.vel) + ' unita\'/s)' +
           '  ·  ' + n2(rap) + ' su tutta la finestra   —   il progetto dice 0,62');
    stampa('   il pallone resta a un avversario fino al fotogramma ' + ultimoConPortatore(tiene.tr) + ' (TIENE) e ' + ultimoConPortatore(libero.tr) + ' (CONTROLLO)' +
           '  ·  calci nella scena, fotogramma:chi@velocita — TIENE [' + tiene.tr.calci + '] CONTROLLO [' + libero.tr.calci + ']');
    stampa('   PER CONTESTO, e senza verdetto: velocita\' media del PORTATORE ' + n2(ft.velPort) + ' contro ' + n2(fl.velPort) + ' unita\'/s.');
    stampa('       Il progetto (§4) mette il fattore 0,62 su CHI CONTIENE, non sul portatore: qui il portatore e\' comandato dalla CPU e questa voce non lo tocca.');
    stampa('   atteso: rapporto di coda in [0,55 · 0,70], angolo TIENE <= 25 gradi, angolo CONTROLLO >= 40 gradi, nessun corpo a terra  ->  ' + (!scenaOk ? 'PROVA NULLA — la finestra utile e\' di ' + (A - DA + 1) + ' fotogrammi, sotto i dodici richiesti' : (ok ? 'VERDE' : 'ROSSO')));
    stampa('');
  }

  /* -------------------------------------------------------------------
     C — IL RILASCIO SENZA TRASCINAMENTO NON PRODUCE NIENTE.
     Duecento prove, durate di tenuta BIMODALI (colpetti e tenute vere,
     che e' come le fa una mano), dito FERMO sul disco: nessun
     trascinamento, mai. Alla fine si conta quante volte QUALCUNO e'
     finito a terra e quanti falli sono stati fischiati.
     Si conta anche, a parte, quante scivolate cominciano DOPO l'istante
     del rilascio: e' la Legge 4 alla lettera. Il verdetto sta sul totale,
     perche' la promessa della voce e' piu' forte — «premo CONTRASTA e
     resto un attimo di troppo» non deve mettere a terra nessuno, ne'
     alla pressione ne' al rilascio.
     ------------------------------------------------------------------- */
  {
    const N = CORTE ? 40 : 200;
    const { pag, cdp, passo, dita } = await apri();
    const q0 = await pag.evaluate(posaScena, { d: 70, ang: 0, conPortatore: true });
    if (q0.errore) throw new Error('C/scena: ' + q0.errore);
    const P = q0.disco;
    let terra = 0, falli = 0, nulle = 0, dopoRilascio = 0, terraFrame = [];
    for (let k = 0; k < N; k++) {
      const q = await pag.evaluate(posaScena, { d: 70, ang: 0, conPortatore: true });
      if (q.errore || q.disco.act !== 'slide') { nulle++; await dita.sicuro(); continue; }
      /* durate bimodali: due terzi colpetti (3-9 fotogrammi), un terzo
         tenute vere (24-84). Con una sola distribuzione il banco
         proverebbe una cosa sola e non saprebbe di averlo fatto. */
      const tenuta = (k % 3 === 2) ? 24 + (k * 7) % 60 : 3 + (k * 5) % 7;
      await dita.posa(1, P.x, P.y);
      await passo(tenuta);
      const nRil = await pag.evaluate(() => window.__sonda.n);
      await dita.alzaTutte();
      await passo(12);
      const r = await pag.evaluate(riassunto);
      if (r.vuota) { nulle++; continue; }
      if (r.aTerra > 0) { terra++; if (terraFrame.length < 5) terraFrame.push(r.primaTerra + '/' + nRil); if (r.primaTerra >= nRil) dopoRilascio++; }
      falli += r.falli;
    }
    await dita.sicuro();
    await pag.close();
    const valide = N - nulle;
    const ok = valide >= N * 0.8 && terra === 0 && falli === 0;
    esiti.push({ id: 'C', nome: 'il rilascio senza trascinamento non produce ne\' scivolata ne\' fallo', ok });
    stampa('C) RILASCIO SENZA TRASCINAMENTO — ' + N + ' prove, tenute bimodali (colpetti 3-9 fotogrammi, tenute 24-84), dito fermo');
    stampa('   scivolate: ' + terra + '/' + valide + '   di cui cominciate DOPO il rilascio: ' + dopoRilascio +
           (terraFrame.length ? '   (fotogramma di partenza / fotogramma del rilascio: ' + terraFrame.join(' · ') + ')' : ''));
    stampa('   falli fischiati: ' + falli + '   ·   scene nulle: ' + nulle);
    stampa('   atteso: ZERO scivolate e ZERO falli  ->  ' + (ok ? 'VERDE' : 'ROSSO'));
    stampa('');
  }

  /* -------------------------------------------------------------------
     D — IL TRASCINAMENTO ARMATO VA DOVE IL DITO L'HA TIRATO.
     Otto direzioni per tre ripetizioni, trascinamento di 40 px (sopra
     R_ARMA, che a tenuta breve vale 22-25 px) in otto fotogrammi, poi sei
     fotogrammi fermi — piu' dei 60 ms che il motore scarta — e rilascio.
     Il pallone sta a EST del comandato e a 70 unita': se la direzione
     venisse rifatta sul pallone invece che sul dito, tutte e otto le
     misure convergerebbero verso zero gradi, e l'errore si vedrebbe.
     ------------------------------------------------------------------- */
  {
    const DIR = [0, 45, 90, 135, 180, 225, 270, 315];
    const RIP = CORTE ? 1 : 3;
    const { pag, cdp, passo, dita } = await apri();
    const q0 = await pag.evaluate(posaScena, { d: 70, ang: 0, conPortatore: true });
    if (q0.errore) throw new Error('D/scena: ' + q0.errore);
    const P = q0.disco;
    const err = [], perDir = {}, mancate = [];
    let nulle = 0;
    for (let r = 0; r < RIP; r++) for (const th of DIR) {
      const q = await pag.evaluate(posaScena, { d: 70, ang: 0, conPortatore: true });
      if (q.errore || q.disco.act !== 'slide') { nulle++; await dita.sicuro(); continue; }
      const a = th * Math.PI / 180, L = 40;
      await dita.posa(1, P.x, P.y);
      for (let k = 1; k <= 8; k++) { await passo(1); await dita.sposta(1, P.x + Math.cos(a) * L * k / 8, P.y + Math.sin(a) * L * k / 8); }
      await passo(6);
      await dita.alzaTutte();
      await passo(8);
      const res = await pag.evaluate(riassunto);
      if (res.vuota) { nulle++; continue; }
      if (res.aTerra === 0 || res.sdx === null) { mancate.push(th); continue; }
      const e = dAng(gradi(res.sdx, res.sdy), th);
      err.push(e);
      (perDir[th] = perDir[th] || []).push(e);
    }
    await dita.sicuro();
    await pag.close();
    const tot = DIR.length * RIP;
    const med = mediana(err), max = err.length ? Math.max(...err) : null;
    const ok = nulle === 0 && mancate.length === 0 && err.length === tot && med !== null && med <= 10 && max <= 25;
    esiti.push({ id: 'D', nome: 'il trascinamento armato scivola nella direzione trascinata', ok });
    stampa('D) TRASCINAMENTO ARMATO -> DIREZIONE — 8 direzioni x ' + RIP + ', trascinamento di 40 px, pallone a EST (0 gradi) e a 70 unita\'');
    stampa('   scivolate partite: ' + err.length + '/' + tot + (mancate.length ? '   non partite alle direzioni: ' + mancate.join(', ') : '') + (nulle ? '   scene nulle ' + nulle : ''));
    stampa('   errore angolare  mediano ' + n2(med) + ' gradi  ·  massimo ' + n2(max) + ' gradi');
    stampa('   per direzione: ' + DIR.map(d => d + ' gradi -> ' + (perDir[d] ? n2(mediana(perDir[d])) : 'n/d')).join('  ·  '));
    stampa('   atteso: tutte partite, mediana <= 10 gradi e massimo <= 25 gradi  ->  ' + (ok ? 'VERDE' : 'ROSSO'));
    stampa('');
  }

  /* -------------------------------------------------------------------
     E — LA SCIVOLATA SI DISFA.
     Si esce a 40 px (armato), si rientra a 5 px dal punto di posa, si
     resta fermi dieci fotogrammi — piu' dei 60 ms scartati, se no il
     motore leggerebbe ancora il campione armato — e si rilascia.
     ------------------------------------------------------------------- */
  {
    const N = CORTE ? 10 : 40;
    const { pag, cdp, passo, dita } = await apri();
    const q0 = await pag.evaluate(posaScena, { d: 70, ang: 0, conPortatore: true });
    if (q0.errore) throw new Error('E/scena: ' + q0.errore);
    const P = q0.disco;
    let terra = 0, falli = 0, nulle = 0;
    for (let k = 0; k < N; k++) {
      const q = await pag.evaluate(posaScena, { d: 70, ang: 0, conPortatore: true });
      if (q.errore || q.disco.act !== 'slide') { nulle++; await dita.sicuro(); continue; }
      const th = (k * 45) % 360, a = th * Math.PI / 180;
      await dita.posa(1, P.x, P.y);
      for (let j = 1; j <= 8; j++) { await passo(1); await dita.sposta(1, P.x + Math.cos(a) * 40 * j / 8, P.y + Math.sin(a) * 40 * j / 8); }
      await passo(2);
      for (let j = 8; j >= 1; j--) { await passo(1); await dita.sposta(1, P.x + Math.cos(a) * 5 * j / 8, P.y + Math.sin(a) * 5 * j / 8); }
      await passo(10);
      await dita.alzaTutte();
      await passo(10);
      const r = await pag.evaluate(riassunto);
      if (r.vuota) { nulle++; continue; }
      if (r.aTerra > 0) terra++;
      falli += r.falli;
    }
    await dita.sicuro();
    await pag.close();
    const valide = N - nulle;
    const ok = valide >= N * 0.8 && terra === 0 && falli === 0;
    esiti.push({ id: 'E', nome: 'rientrando sotto R_ARMA la scivolata non parte', ok });
    stampa('E) DISFARE LA SCIVOLATA — ' + N + ' prove: fuori a 40 px, dentro a 5 px, dieci fotogrammi fermi, poi rilascio');
    stampa('   scivolate: ' + terra + '/' + valide + '   ·   falli: ' + falli + '   ·   scene nulle: ' + nulle);
    stampa('   atteso: ZERO scivolate  ->  ' + (ok ? 'VERDE' : 'ROSSO'));
    stampa('');
  }

  /* -------------------------------------------------------------------
     F — LA SPAZZATA.
     Comandato nel PROPRIO terzo (squadra 0 difende x=0), pallone LIBERO
     fra lui e la propria porta. Si preme a 45 unita' — dove il disco
     offre CONTRASTA — e il banco porta il pallone a 20: quello che in
     partita fa un pallone che rotola verso di te.
     Il verdetto sta su DOVE VA IL PALLONE: deve partire (velocita' vera)
     e andare VIA dalla propria porta (componente x positiva per la
     squadra 0). Una spazzata che spinge il pallone verso la propria
     porta e' peggio di nessuna spazzata, ed e' esattamente cio' che fa
     una scivolata mirata sul pallone quando il pallone e' dietro di te.
     ------------------------------------------------------------------- */
  {
    const N = CORTE ? 8 : 30;
    const { pag, cdp, passo, dita } = await apri();
    const q0 = await pag.evaluate(posaScena, { d: 45, ang: 180, conPortatore: false, px: 287, py: 280 });
    if (q0.errore) throw new Error('F/scena: ' + q0.errore);
    const P = q0.disco;
    let via = 0, indietro = 0, ferme = 0, terra = 0, nulle = 0;
    const vel = [];
    for (let k = 0; k < N; k++) {
      const q = await pag.evaluate(posaScena, { d: 45, ang: 180, conPortatore: false, px: 287, py: 280 });
      if (q.errore || q.disco.act !== 'slide') { nulle++; await dita.sicuro(); continue; }
      await dita.posa(1, P.x, P.y);
      await pag.evaluate(avvicina, 20);
      await passo(4);
      const r = await pag.evaluate(riassunto);
      await dita.alzaTutte();
      await passo(1);
      if (r.vuota) { nulle++; continue; }
      if (r.aTerra > 0) terra++;
      if (r.bv < 60) ferme++;
      else { vel.push(r.bv); if (r.bvx > 0) via++; else indietro++; }
    }
    await dita.sicuro();
    await pag.close();
    const valide = N - nulle;
    const ok = valide >= N * 0.8 && terra === 0 && ferme === 0 && indietro === 0 && via === valide;
    esiti.push({ id: 'F', nome: 'la spazzata manda il pallone via dalla propria porta, senza corpo a terra', ok });
    stampa('F) SPAZZATA — comandato a x=287 (terzo difensivo: FW/3 = ' + n2(q0.FW / 3) + '), pallone LIBERO fra lui e la propria porta, portato a 20 unita\'');
    stampa('   pallone mandato VIA dalla propria porta: ' + via + '/' + valide + '  ·  spinto INDIETRO verso la propria porta: ' + indietro + '  ·  rimasto fermo: ' + ferme);
    stampa('   velocita\' mediana del pallone spazzato: ' + n2(mediana(vel)) + ' unita\'/s  ·  corpi a terra: ' + terra + '  ·  scene nulle: ' + nulle);
    stampa('   atteso: tutte VIA, nessuna indietro, nessuna ferma, ZERO corpi a terra  ->  ' + (ok ? 'VERDE' : 'ROSSO'));
    stampa('');
  }

  /* -------------------------------------------------------------------
     G — NON REGRESSIONE, LEGGE 4: touchcancel non e' touchend.
     Si arma il trascinamento (40 px) e poi il SISTEMA si prende il dito.
     Da un annullo di sistema non puo' uscire una scivolata, mai.
     ------------------------------------------------------------------- */
  {
    const N = CORTE ? 10 : 40;
    const { pag, cdp, passo, dita } = await apri();
    const q0 = await pag.evaluate(posaScena, { d: 70, ang: 0, conPortatore: true });
    if (q0.errore) throw new Error('G/scena: ' + q0.errore);
    const P = q0.disco;
    let terra = 0, falli = 0, nulle = 0;
    for (let k = 0; k < N; k++) {
      const q = await pag.evaluate(posaScena, { d: 70, ang: 0, conPortatore: true });
      if (q.errore || q.disco.act !== 'slide') { nulle++; await dita.sicuro(); continue; }
      const a = ((k * 45) % 360) * Math.PI / 180;
      await dita.posa(1, P.x, P.y);
      for (let j = 1; j <= 8; j++) { await passo(1); await dita.sposta(1, P.x + Math.cos(a) * 40 * j / 8, P.y + Math.sin(a) * 40 * j / 8); }
      await passo(6);
      await dita.annullaTutte();
      await passo(10);
      const r = await pag.evaluate(riassunto);
      if (r.vuota) { nulle++; continue; }
      if (r.aTerra > 0) terra++;
      falli += r.falli;
    }
    await dita.sicuro();
    await pag.close();
    const valide = N - nulle;
    const ok = valide >= N * 0.8 && terra === 0 && falli === 0;
    esiti.push({ id: 'G', nome: 'touchcancel con trascinamento armato non produce scivolate (Legge 4)', ok });
    stampa('G) NON REGRESSIONE — touchcancel su un trascinamento ARMATO, ' + N + ' prove');
    stampa('   scivolate: ' + terra + '/' + valide + '   ·   falli: ' + falli + '   ·   scene nulle: ' + nulle);
    stampa('   atteso: ZERO scivolate  ->  ' + (ok ? 'VERDE' : 'ROSSO'));
    stampa('');
  }

  /* -------------------------------------------------------------------
     H — NON REGRESSIONE, LA TASTIERA.
     Questa voce cambia il DISCO, non il tasto Z: chi gioca da tastiera
     deve continuare a scivolare come oggi. Si preme Z per davvero — un
     evento della tastiera, non una chiamata di funzione — e si guarda se
     il corpo va a terra.
     ------------------------------------------------------------------- */
  {
    const { pag, cdp, passo, dita } = await apri();
    const q = await pag.evaluate(posaScena, { d: 70, ang: 0, conPortatore: true });
    if (q.errore) throw new Error('H/scena: ' + q.errore);
    await pag.keyboard.press('KeyZ');
    await passo(12);
    const r = await pag.evaluate(riassunto);
    const dir = (r.sdx !== null) ? gradi(r.sdx, r.sdy) : null;
    await pag.close();
    const ok = !r.vuota && r.aTerra > 0;
    esiti.push({ id: 'H', nome: 'la tastiera (Z) scivola ancora', ok });
    stampa('H) NON REGRESSIONE — il tasto Z');
    stampa('   corpo a terra in ' + r.aTerra + ' fotogrammi su ' + r.n + '  ·  primo fotogramma ' + r.primaTerra + '  ·  direzione della scivolata ' + n2(dir) + ' gradi (il pallone sta a 0 gradi)');
    stampa('   atteso: la scivolata da tastiera parte, come oggi  ->  ' + (ok ? 'VERDE' : 'ROSSO'));
    stampa('');
  }

  await br.close(); srv.chiudi();

  /* =====================================================================
     TRE ESITI, NON DUE. Una prova NULLA e' una prova che il banco non e'
     riuscito a imbastire: non e' verde (non ha verificato niente) e non
     e' rossa (rossa vorrebbe dire «il gioco e' rotto», e il gioco non
     c'entra). Ha un codice suo, il 3.
       0  tutti verdi
       1  almeno un rosso: il gioco non regge una proprieta'
       2  il banco e' esploso
       3  nessun rosso, ma almeno una prova nulla
     ===================================================================== */
  const rossi = esiti.filter(e => e.ok === false);
  const nulle = esiti.filter(e => e.ok === null);
  const verdi = esiti.filter(e => e.ok === true);
  stampa('--- ESITO ---');
  for (const e of esiti) stampa('  ' + (e.ok === null ? 'NULLA' : (e.ok ? 'VERDE' : 'ROSSO')) + '  ' + e.id + '  ' + e.nome);
  if (eccezioni.length) stampa('  eccezioni in pagina: ' + eccezioni.length + ' — ' + eccezioni.slice(0, 3).join(' | '));
  stampa('verdi ' + verdi.length + ' · rossi ' + rossi.length + ' · nulle ' + nulle.length + ' · su ' + esiti.length);
  if (rossi.length) stampa('CANCELLO ROSSO: ' + rossi.length + ' controlli falliti.');
  else if (nulle.length) stampa('CANCELLO NON CONCLUSO: ' + nulle.length + ' prove nulle — la scena non ha messo alla prova il gioco. Da riparare e\' il banco.');
  else stampa('CANCELLO VERDE: ' + esiti.length + ' controlli su ' + esiti.length + '.');
  process.exit(rossi.length ? 1 : (nulle.length ? 3 : 0));
})().catch(e => { console.error('FALLITO: ' + (e && e.stack || e)); process.exit(2); });
