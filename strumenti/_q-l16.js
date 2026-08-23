/* =====================================================================
   _q-l16.js — IL CANCELLO DELLA PULSANTIERA A QUATTRO DISCHI (L1.6).

   Il mandato del committente, 23 agosto 2026: «mancano ancora tutti i
   tasti che ci sono in un controller — al momento solo due tasti e la
   direzione». La toppa _t-l16.js porta i dischi da due a quattro:

     disco 0 (r40)  TIRA      / CONTRASTA     — INTOCCATO
     disco 1 (r30)  PASSAGGIO / CAMBIO        — INTOCCATO
     disco 2 (r26)  PASSA     / PRESSA        — nuovo
     disco 3 (r26)  CROSS     / SCIVOLATA     — nuovo

   Questo cancello sorveglia SEI proprieta', e nessuna di piu':

     A) LA GEOMETRIA. In tutti e due i contesti (palla mia, palla loro)
        il gioco dichiara QUATTRO dischi; i primi due sono quelli di
        sempre, atto per atto e raggio per raggio; le prese (r+10) sono
        disgiunte A COPPIE — la mezzaluna che _t-precedenza ha chiuso non
        deve rinascere fra dischi nuovi — e ogni presa sta dentro gli
        inserti (24 px dai lati, 20 dal basso).
     B) PASSA. Palla al comandato, un compagno smarcato davanti: la
        pressione produce un CALCIO vero (kickBall) fra 300 e 540 u/s
        con b.passTo su un compagno. Non si legge un flag: si conta il
        calcio dall'imbuto del gioco.
     C) CROSS. Stessa scena: la pressione produce un calcio che ALZA il
        pallone (vz>0) con un DESTINATARIO (b.crossTo su un compagno) e
        il tabellino dei cross che avanza. E' la differenza fra un cross
        che parte e un cross che ARRIVA.
     D) PRESSA. Portatore avversario a 110 unita': la pressione mette un
        ordine di raddoppio (p.raddoppio>0) su un compagno CHE NON E' il
        comandato. E il ramo dichiarato: senza portatore la pressione
        non ordina niente a nessuno (il verbo raddoppia SU UN UOMO).
     E) SCIVOLATA. Pallone del portatore avversario a 60 unita' (oltre
        KICK_R*1,4, dove il disco grande dice CONTRASTA): la pressione
        del disco nuovo manda il corpo in scivolata entro 14 fotogrammi.
        E' la scivolata IMMEDIATA di sempre (doSlide senza fase), quella
        che L1.2 ha tolto dalla pressione del disco grande: chi la vuole
        subito adesso ha il suo tasto.
     F) NON REGRESSIONE. Nella scena d'attacco premere PASSAGGIO produce
        ancora un calcio (il verbo di ieri non e' morto nel trasloco).

   IL CONTROLLO NEGATIVO E' IL GIOCO DI OGGI: girato su un file senza la
   toppa, A trova due dischi e il cancello esce ROSSO (1). E' stato visto
   fallire cosi' PRIMA di applicare la toppa, come da regola di casa.

   Esce 0 verde, 1 rosso, 2 banco esploso, 3 prova nulla.

   uso:
     node strumenti/_q-l16.js                       (sul gioco di casa)
     node strumenti/_q-l16.js --gioco fuori/l16.html
     node strumenti/_q-l16.js --testa               (finestra visibile)
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
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
               '.png': 'image/png', '.json': 'application/json' };

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

/* il tempo in mano al banco: un fotogramma per chiamata (vedi _q-l12.js) */
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

/* le dita di protocollo, a piu' contatti (vedi _q-l12.js) */
function mano(cdp) {
  const giu = new Map();
  const punti = () => [...giu.entries()].map(([id, p]) => ({ x: p.x, y: p.y, id }));
  return {
    async posa(id, x, y) { giu.set(id, { x, y }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: punti() }); },
    async alzaTutte() { giu.clear(); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); },
    async sicuro() { try { giu.clear(); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); } catch (e) {} },
  };
}

/* L'IMBUTO DEI CALCI: kickBall e' l'unico punto da cui parte un calcio
   del gioco. Il verdetto di B, C ed F si legge da qui, non da un flag. */
function installaContaCalci() {
  if (window.__calci) return 'gia';
  if (typeof window.kickBall !== 'function')
    return 'BANCO INVECCHIATO: window.kickBall non esiste piu\'.';
  window.__calci = [];
  const ok = window.kickBall;
  window.kickBall = function (p, nx, ny, speed, spinY) {
    const r = ok.call(this, p, nx, ny, speed, spinY);
    if (r) window.__calci.push({ chi: window.__test.G.players.indexOf(p), v: Math.round(speed) });
    return r;
  };
  return 'ok';
}

/* ---------------------------------------------------------------------
   LE DUE SCENE. Come in _q-l12: si scrive lo stato vero del gioco, e
   cio' che serve fermo si ferma con i campi che il gioco stesso usa
   (kickCd, aiActT), mai con flag inventati dal banco.
   --------------------------------------------------------------------- */
function scenaAttacco() {
  const t = window.__test, G = t.G, FW = t.campo.FW, FH = t.campo.FH;
  for (let i = 0; i < 900 && G.scene !== 'play'; i++) t.simulate(1 / 60);
  if (G.scene !== 'play') return { errore: 'la partita non e\' in gioco: scena \'' + G.scene + '\'' };
  G.freeze = 0; t.setTimeLeft && t.setTimeLeft(80);
  const pi = G.ctrl[0];
  if (pi < 0) return { errore: 'nessun comandato' };
  const p = G.players[pi], b = G.ball;
  const pulisci = q => {
    q.slide = -1; q.recover = 0; q.out = 0; q.rove = -1;
    q.kickCd = 0; q.kickT = 0; q.kickB = 0; q.raddoppio = 0;
    q.vx = 0; q.vy = 0; q.ax = 0; q.ay = 0; q.fiato = 100; q.sprint = false;
    if (q.charge >= 0) { q.charge = -1; q.chargeT = 0; q.chargeGo = null; q.chargeClip = null; }
    if (q.contrasto !== undefined) q.contrasto = 0;
  };
  pulisci(p);
  p.x = FW * 0.55; p.y = FH * 0.5; p.fx = 1; p.fy = 0;
  let ci = -1;
  for (let i = 0; i < G.players.length; i++) {
    const q = G.players[i];
    if (q.team === 0 && i !== pi && q.role !== 'gk' && q.out <= 0) { ci = i; break; }
  }
  if (ci < 0) return { errore: 'nessun compagno di movimento' };
  const c = G.players[ci];
  pulisci(c);
  c.x = p.x + 190; c.y = p.y - 40; c.aiTX = c.x; c.aiTY = c.y;
  for (let i = 0; i < G.players.length; i++) {
    const q = G.players[i];
    if (i === pi || i === ci || q.role === 'gk') continue;
    pulisci(q);
    q.x = q.team === 0 ? FW * 0.2 : FW * 0.92;
    q.y = 40 + (i * 53) % (FH - 80);
    q.aiTX = q.x; q.aiTY = q.y; q.kickCd = 3; q.aiActT = 2.5;
  }
  b.owner = pi; b.x = p.x + 14; b.y = p.y;
  b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0; b.passTo = -1; b.crossTo = -1;
  window.__calci.length = 0;
  return { pi, ci };
}

function scenaDifesa(dist) {
  const t = window.__test, G = t.G, FW = t.campo.FW, FH = t.campo.FH;
  for (let i = 0; i < 900 && G.scene !== 'play'; i++) t.simulate(1 / 60);
  if (G.scene !== 'play') return { errore: 'la partita non e\' in gioco: scena \'' + G.scene + '\'' };
  G.freeze = 0; t.setTimeLeft && t.setTimeLeft(80);
  const pi = G.ctrl[0];
  if (pi < 0) return { errore: 'nessun comandato' };
  const p = G.players[pi], b = G.ball;
  const pulisci = q => {
    q.slide = -1; q.recover = 0; q.out = 0; q.rove = -1;
    q.kickCd = 0; q.kickT = 0; q.kickB = 0; q.raddoppio = 0;
    q.vx = 0; q.vy = 0; q.ax = 0; q.ay = 0; q.fiato = 100; q.sprint = false;
    if (q.charge >= 0) { q.charge = -1; q.chargeT = 0; q.chargeGo = null; q.chargeClip = null; }
    if (q.contrasto !== undefined) q.contrasto = 0;
  };
  pulisci(p);
  p.x = FW * 0.5; p.y = FH * 0.5;
  let oi = -1;
  for (let i = 0; i < G.players.length; i++) {
    const q = G.players[i];
    if (q.team === 0 || q.out > 0 || q.role === 'gk') continue;
    oi = i; break;
  }
  if (oi < 0) return { errore: 'nessun avversario di movimento' };
  const o = G.players[oi];
  pulisci(o);
  const bx = p.x + dist, by = p.y;
  o.fx = -1; o.fy = 0;                    // guarda il comandato
  o.x = bx + 16; o.y = by;                // pallone davanti ai piedi
  o.aiTX = o.x; o.aiTY = o.y; o.kickCd = 3; o.aiActT = 2.5;
  b.owner = oi; b.x = bx; b.y = by;
  b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0; b.passTo = -1; b.crossTo = -1;
  p.fx = 1; p.fy = 0;                     // faccia sul portatore
  /* un compagno DISPONIBILE al raddoppio, nella direzione del portatore
     visto dal comandato (e' quella che comandaPressa chiedera') */
  let ci = -1;
  for (let i = 0; i < G.players.length; i++) {
    const q = G.players[i];
    if (q.team !== 0 || i === pi || q.role === 'gk' || q.out > 0) continue;
    ci = i; break;
  }
  if (ci < 0) return { errore: 'nessun compagno di movimento' };
  const c = G.players[ci];
  pulisci(c);
  c.x = p.x + 60; c.y = p.y + 140; c.aiTX = c.x; c.aiTY = c.y;
  for (let i = 0; i < G.players.length; i++) {
    const q = G.players[i];
    if (i === pi || i === oi || i === ci || q.role === 'gk') continue;
    pulisci(q);
    q.x = q.team === 0 ? FW * 0.15 : FW * 0.9;
    q.y = 40 + (i * 53) % (FH - 80);
    q.aiTX = q.x; q.aiTY = q.y; q.kickCd = 3; q.aiActT = 2.5;
  }
  window.__calci.length = 0;
  return { pi, oi, ci };
}

/* ===================================================================== */
const n2 = v => (v === null || v === undefined || !isFinite(v)) ? 'n/d' : (Math.round(v * 100) / 100).toString().replace('.', ',');

(async () => {
  const srv = await servi();
  const br = await chromium.launch({ headless: !TESTA });
  const ctx = await br.newContext({ viewport: { width: 915, height: 412 },
    deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const eccezioni = [];
  const esiti = [];
  let nulla = false;

  const pag = await ctx.newPage();
  await pag.addInitScript(seme => {
    let s = seme >>> 0 || 1;
    const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => p() / 4294967296;
  }, 20260823);
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
  const conta = await pag.evaluate(installaContaCalci);
  if (conta !== 'ok' && conta !== 'gia') { console.error('FALLITO: ' + conta); await br.close(); srv.chiudi(); process.exit(2); }
  const cdp = await ctx.newCDPSession(pag);
  const passo = n => pag.evaluate(k => window.__banco.passo(k), n);
  const dita = mano(cdp);
  const dischi = () => pag.evaluate(() => window.__test.pulsanti(0).map(b => ({ x: b.x, y: b.y, r: b.r, act: b.act, label: b.label })));
  const disco = (bt, atto) => bt.find(b => b.act === atto) || null;

  try {

    /* ============================== A =============================== */
    const sA = await pag.evaluate(scenaAttacco);
    if (sA.errore) throw new Error('A/scena attacco: ' + sA.errore);
    await passo(2);
    const btA = await dischi();
    const sD = await pag.evaluate(scenaDifesa, 110);
    if (sD.errore) throw new Error('A/scena difesa: ' + sD.errore);
    await passo(2);
    const btD = await dischi();
    const [vw, vh] = await pag.evaluate(() => [innerWidth, innerHeight]);

    const attiA = btA.map(b => b.act).join(',');
    const attiD = btD.map(b => b.act).join(',');
    const attesiA = 'shot,through,pass,cross', attesiD = 'slide,swap,press,tackle';
    let coppieOk = true, coppiaRotta = '';
    for (const bt of [btA, btD]) {
      for (let i = 0; i < bt.length; i++) for (let j = i + 1; j < bt.length; j++) {
        const d = Math.hypot(bt[i].x - bt[j].x, bt[i].y - bt[j].y);
        if (d < (bt[i].r + 10) + (bt[j].r + 10)) { coppieOk = false; coppiaRotta = bt[i].act + '-' + bt[j].act + ' a ' + n2(d) + ' px'; }
      }
    }
    let insertiOk = true, insertoRotto = '';
    for (const b of [...btA, ...btD]) {
      const presa = b.r + 10;
      if (b.x + presa > vw - 24 || b.x - presa < 24 || b.y + presa > vh - 20) { insertiOk = false; insertoRotto = b.act; }
    }
    const vecchiOk = btA.length >= 2 && btD.length >= 2 &&
      btA[0].act === 'shot' && btA[0].r === 40 && btA[1].act === 'through' && btA[1].r === 30 &&
      btD[0].act === 'slide' && btD[0].r === 40 && btD[1].act === 'swap' && btD[1].r === 30;
    const okA = btA.length === 4 && btD.length === 4 && attiA === attesiA && attiD === attesiD &&
                coppieOk && insertiOk && vecchiOk;
    esiti.push({ id: 'A', nome: 'quattro dischi, atti giusti nei due contesti, prese disgiunte, dentro gli inserti, i due vecchi intoccati', ok: okA });
    console.log('A) GEOMETRIA — attacco [' + attiA + '] difesa [' + attiD + ']');
    console.log('   dischi: ' + btA.length + ' e ' + btD.length + ' (attesi 4 e 4)  ·  prese disgiunte: ' + (coppieOk ? 'si\'' : 'NO — ' + coppiaRotta) +
                '  ·  inserti: ' + (insertiOk ? 'si\'' : 'NO — ' + insertoRotto) + '  ·  dischi 0/1 come ieri: ' + (vecchiOk ? 'si\'' : 'NO'));
    console.log('   atteso: 4+4, [' + attesiA + '] e [' + attesiD + ']  ->  ' + (okA ? 'VERDE' : 'ROSSO'));

    if (btA.length !== 4) {
      /* senza i dischi nuovi le prove B-E non hanno niente da premere:
         si dichiara e si chiude, il rosso di A basta */
      console.log('\n   (B-E saltate: senza quattro dischi non c\'e\' niente da premere)');
    } else {

    /* ============================== B =============================== */
    {
      const s = await pag.evaluate(scenaAttacco);
      if (s.errore) throw new Error('B/scena: ' + s.errore);
      await passo(2);
      const d = disco(await dischi(), 'pass');
      if (!d) { nulla = true; esiti.push({ id: 'B', nome: 'PASSA', ok: null }); }
      else {
        await dita.posa(1, d.x, d.y);
        await passo(8);
        const r = await pag.evaluate(() => {
          const G = window.__test.G, b = G.ball;
          return { calci: window.__calci.slice(), passTo: b.passTo, vz: b.vz, z: b.z };
        });
        await dita.alzaTutte(); await passo(6);
        const calcio = r.calci[0];
        const ok = r.calci.length === 1 && calcio.chi === s.pi &&
                   calcio.v >= 300 && calcio.v <= 540 &&
                   r.passTo >= 0 && r.passTo !== s.pi &&
                   await pag.evaluate(k => window.__test.G.players[k].team === 0, r.passTo);
        esiti.push({ id: 'B', nome: 'PASSA calcia fra 300 e 540 con b.passTo su un compagno', ok });
        console.log('\nB) PASSA — calci: ' + r.calci.length + (calcio ? ' (chi ' + calcio.chi + ' a ' + calcio.v + ' u/s, comandato ' + s.pi + ')' : '') +
                    '  ·  passTo: ' + r.passTo + '  ·  quota: vz ' + n2(r.vz));
        console.log('   atteso: UN calcio del comandato, 300-540 u/s, passTo su un compagno  ->  ' + (ok ? 'VERDE' : 'ROSSO'));
      }
    }

    /* ============================== C =============================== */
    {
      const s = await pag.evaluate(scenaAttacco);
      if (s.errore) throw new Error('C/scena: ' + s.errore);
      await passo(2);
      const d = disco(await dischi(), 'cross');
      if (!d) { nulla = true; esiti.push({ id: 'C', nome: 'CROSS', ok: null }); }
      else {
        const primaCross = await pag.evaluate(() => window.__test.G.stats.cross[0] | 0);
        await dita.posa(1, d.x, d.y);
        await passo(8);
        const r = await pag.evaluate(() => {
          const G = window.__test.G, b = G.ball;
          return { calci: window.__calci.slice(), crossTo: b.crossTo, vz: b.vz, z: b.z,
                   cross0: G.stats.cross[0] | 0,
                   destTeam: b.crossTo >= 0 && G.players[b.crossTo] ? G.players[b.crossTo].team : -1 };
        });
        await dita.alzaTutte(); await passo(6);
        const inAria = (r.vz > 0 || r.z > 0);
        const ok = r.calci.length === 1 && r.calci[0].chi === s.pi && inAria &&
                   r.crossTo >= 0 && r.destTeam === 0 && r.cross0 === primaCross + 1;
        esiti.push({ id: 'C', nome: 'CROSS alza il pallone con un destinatario e il tabellino avanza', ok });
        console.log('\nC) CROSS — calci: ' + r.calci.length + '  ·  in aria: ' + (inAria ? 'si\' (vz ' + n2(r.vz) + ', z ' + n2(r.z) + ')' : 'NO') +
                    '  ·  crossTo: ' + r.crossTo + ' (squadra ' + r.destTeam + ')  ·  tabellino: ' + primaCross + ' -> ' + r.cross0);
        console.log('   atteso: UN calcio, pallone in aria, crossTo su un compagno, tabellino +1  ->  ' + (ok ? 'VERDE' : 'ROSSO'));
      }
    }

    /* ============================== D =============================== */
    {
      const s = await pag.evaluate(scenaDifesa, 110);
      if (s.errore) throw new Error('D/scena: ' + s.errore);
      await passo(2);
      const d = disco(await dischi(), 'press');
      if (!d) { nulla = true; esiti.push({ id: 'D', nome: 'PRESSA', ok: null }); }
      else {
        await dita.posa(1, d.x, d.y);
        await passo(4);
        const r = await pag.evaluate(k => {
          const G = window.__test.G;
          const chi = [];
          for (let i = 0; i < G.players.length; i++) {
            const q = G.players[i];
            if (q.team === 0 && q.raddoppio > 0) chi.push(i);
          }
          return { chi, comandato: G.ctrl[0] };
        }, 0);
        await dita.alzaTutte(); await passo(4);
        /* IL RAMO DICHIARATO: pallone di NESSUNO, la pressione tace */
        const s2 = await pag.evaluate(scenaDifesa, 110);
        if (s2.errore) throw new Error('D2/scena: ' + s2.errore);
        await pag.evaluate(() => { const b = window.__test.G.ball; b.owner = -1; });
        await passo(2);
        const d2 = disco(await dischi(), 'press');
        let tace = null;
        if (d2) {
          await dita.posa(1, d2.x, d2.y);
          await passo(4);
          tace = await pag.evaluate(() => {
            const G = window.__test.G;
            let n = 0;
            for (const q of G.players) if (q.team === 0 && q.raddoppio > 0) n++;
            return n === 0;
          });
          await dita.alzaTutte(); await passo(4);
        }
        const ok = r.chi.length >= 1 && !r.chi.includes(r.comandato) && tace === true;
        esiti.push({ id: 'D', nome: 'PRESSA ordina il raddoppio a un compagno non comandato; senza portatore tace', ok });
        console.log('\nD) PRESSA — raddoppio su: [' + r.chi.join(',') + '] (comandato ' + r.comandato + ')  ·  a pallone libero tace: ' + (tace === null ? 'n/d' : (tace ? 'si\'' : 'NO')));
        console.log('   atteso: almeno un compagno non comandato col cronometro acceso; zero a pallone libero  ->  ' + (ok ? 'VERDE' : 'ROSSO'));
      }
    }

    /* ============================== E =============================== */
    {
      const s = await pag.evaluate(scenaDifesa, 60);
      if (s.errore) throw new Error('E/scena: ' + s.errore);
      await passo(2);
      const d = disco(await dischi(), 'tackle');
      if (!d) { nulla = true; esiti.push({ id: 'E', nome: 'SCIVOLATA', ok: null }); }
      else {
        await dita.posa(1, d.x, d.y);
        const r = await pag.evaluate(pi => {
          let primo = -1;
          for (let k = 0; k < 14; k++) {
            window.__banco.passo(1);
            const p = window.__test.G.players[pi];
            if (p.slide >= 0) { primo = k; break; }
          }
          return { primo };
        }, s.pi);
        await dita.alzaTutte(); await passo(20);
        const ok = r.primo >= 0;
        esiti.push({ id: 'E', nome: 'SCIVOLATA manda il corpo in scivolata alla pressione', ok });
        console.log('\nE) SCIVOLATA — corpo in scivolata al fotogramma: ' + (r.primo >= 0 ? r.primo : 'MAI (14 guardati)'));
        console.log('   atteso: scivolata entro 14 fotogrammi  ->  ' + (ok ? 'VERDE' : 'ROSSO'));
      }
    }

    /* ============================== F =============================== */
    {
      const s = await pag.evaluate(scenaAttacco);
      if (s.errore) throw new Error('F/scena: ' + s.errore);
      await passo(2);
      const d = disco(await dischi(), 'through');
      if (!d) { nulla = true; esiti.push({ id: 'F', nome: 'PASSAGGIO', ok: null }); }
      else {
        await dita.posa(1, d.x, d.y);
        await passo(8);
        const r = await pag.evaluate(() => ({ calci: window.__calci.length }));
        await dita.alzaTutte(); await passo(6);
        const ok = r.calci === 1;
        esiti.push({ id: 'F', nome: 'PASSAGGIO calcia ancora (non regressione)', ok });
        console.log('\nF) NON REGRESSIONE — PASSAGGIO: calci ' + r.calci);
        console.log('   atteso: UN calcio  ->  ' + (ok ? 'VERDE' : 'ROSSO'));
      }
    }

    }/* fine B-E */

  } catch (e) {
    console.error('\nFALLITO, il banco e\' esploso: ' + e.message);
    await dita.sicuro(); await br.close(); srv.chiudi();
    process.exit(2);
  }

  await dita.sicuro();
  await br.close(); srv.chiudi();

  if (eccezioni.length) {
    console.error('\nECCEZIONI DI PAGINA (' + eccezioni.length + '):');
    for (const e of [...new Set(eccezioni)].slice(0, 5)) console.error('  · ' + e);
  }

  console.log('\n--- ESITO ---');
  let verdi = 0, rossi = 0, nulle = 0;
  for (const e of esiti) {
    const s = e.ok === null ? 'NULLA ' : (e.ok ? 'VERDE ' : 'ROSSO ');
    if (e.ok === null) nulle++; else if (e.ok) verdi++; else rossi++;
    console.log('  ' + s + ' ' + e.id + '  ' + e.nome);
  }
  console.log('verdi ' + verdi + ' · rossi ' + rossi + ' · nulle ' + nulle + ' · su ' + esiti.length);
  if (eccezioni.length || rossi) { console.log('CANCELLO ROSSO.'); process.exit(1); }
  if (nulle || nulla) { console.log('PROVA NULLA.'); process.exit(3); }
  console.log('CANCELLO VERDE: ' + verdi + ' controlli su ' + verdi + '.');
  process.exit(0);
})();
