/* =====================================================================
   _p-scatto.js — IL BANCO DELLO SCATTO: e' una scelta o e' lo stato di
   chi corre?

   La voce 3 del confronto con FC Mobile dice: «0 pulsanti dedicati: lo
   scatto e' la levetta spinta oltre STICK_SPRINT = 66 px». E la levetta
   si ricentra a MAXR = 70 (Touch5.move). Fra 66 e 70 ci sono quattro
   pixel: l'accusa e' che chi corre a fondo corsa e' SEMPRE in scatto,
   cioe' che lo scatto non e' un verbo ma uno stato.

   Questo banco non lo deduce: manda un dito VERO sul vetro
   (Input.dispatchTouchEvent, gli stessi eventi di protocollo di
   giocata.js), lo trascina come si trascina giocando — corse lunghe,
   correzioni corte, cambi di direzione, passettini — e campiona a ogni
   fotogramma la lunghezza della levetta che il gioco legge, p.sprint
   sull'uomo comandato e il suo fiato.

   IL BANCO E' RIPETIBILE, e la prima stesura non lo era: il ciclo di
   disegno del gioco girava per conto suo fra una riga e l'altra dello
   script, quindi la partita sotto il dito non era la stessa a ogni
   corsa. Misurato il 29 agosto 2026 sullo STESSO file: due corse davano
   61,6% e 72,1% di scatto acceso — undici punti di scarto senza che il
   gioco fosse cambiato di un bit. Adesso rAF e performance.now passano
   in mano al banco (lo stesso impianto di _q-dischi.js e di scatta.js):
   ogni fotogramma lo fa avanzare questo file, uno alla volta, dopo aver
   mandato il tocco. Due corse dello stesso file danno lo stesso numero,
   ed e' una cosa che questo banco STAMPA (--ripeti 2) invece di
   sperarla.

   Il verdetto e' una percentuale: su quanti fotogrammi COL DITO SUL
   VETRO E LA LEVETTA FUORI DALLA ZONA MORTA l'uomo sta scattando.

   --scatto 1 tiene premuto, con un SECONDO dito, il disco che offre
   l'atto 'sprint' (se il gioco ce l'ha): serve a misurare il dopo.
   --nodito 1 non preme il disco ma il dito resta uno: e' il braccio di
   controllo del dopo, quello che dice se lo scatto si e' spento davvero.

   uso:
     node strumenti/_p-scatto.js --gioco fuori/cmd-terza-base.html
     node strumenti/_p-scatto.js --gioco fuori/cmd-terza.html --scatto 1
   ===================================================================== */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'CALCETTO-il-gioco.html')));
const SEMI = String(arg('semi', '20260828,20260829,20260830')).split(',').map(Number);
const VW = +arg('vw', 915), VH = +arg('vh', 412);
const TAGLIA = +arg('taglia', 11);
const TIENI_SCATTO = +arg('scatto', 0);
const RIPETI = +arg('ripeti', 1);
const JSONOUT = arg('json', '');
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png' };

function servi() {
  return new Promise(ok => {
    const s = http.createServer((rq, rs) => {
      const u = decodeURIComponent(rq.url.split('?')[0]);
      let f = path.join(RADICE, u === '/' ? 'index.html' : u);
      if (/CALCETTO-il-gioco\.html$/i.test(f)) f = GIOCO;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { rs.writeHead(404); rs.end(); return; }
      rs.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(rs);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* IL COPIONE DEL POLLICE — sette gesti, e sono quelli di una partita:
   la corsa lunga, la correzione corta, il cambio di direzione secco, il
   passettino. Le distanze sono px di schermo, i tempi fotogrammi. */
const COPIONE = [
  { nome: 'corsa lunga',         dx: 120,  dy: 0,   passi: 10, tieni: 90 },
  { nome: 'correzione corta',    dx: 22,   dy: 0,   passi: 4,  tieni: 50 },
  { nome: 'diagonale piena',     dx: 90,   dy: -90, passi: 10, tieni: 90 },
  { nome: 'passettino',          dx: 12,   dy: 8,   passi: 3,  tieni: 50 },
  { nome: 'cambio di direzione', dx: -140, dy: 0,   passi: 12, tieni: 90 },
  { nome: 'mezza corsa',         dx: 45,   dy: 25,  passi: 6,  tieni: 70 },
  { nome: 'affondo',             dx: 200,  dy: 60,  passi: 14, tieni: 110 },
];

const attesa = ms => new Promise(r => setTimeout(r, ms));
const dita = {
  giu: (cdp, punti) => cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: punti }),
  sposta: (cdp, punti) => cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: punti }),
  su: (cdp, punti) => cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: punti || [] }),
};

/* IL CAMPIONE — gira NELLA pagina: fa avanzare n fotogrammi col BANCO
   (non col rAF vero) e legge le tre cose dalle sorgenti del gioco
   (Touch5.stick, G.ctrl, G.players). */
const CAMPIONA = `(n) => {
  const out = [];
  for (let k = 0; k < n; k++) {
    window.__banco.passo(1);
    const s = Touch5.stick[0];
    const l = (s && s.active) ? Math.hypot(s.dx, s.dy) : -1;
    const i = G.ctrl[0];
    const p = (i >= 0 && G.players[i]) ? G.players[i] : null;
    out.push({ l: +l.toFixed(2), attiva: !!(s && s.active),
               sprint: p ? !!p.sprint : false,
               fiato: p ? +p.fiato.toFixed(1) : -1,
               scena: G.scene });
  }
  return out;
}`;

(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  /* IL CICLO DI DISEGNO PASSA IN MANO AL BANCO: senza, il gioco avanza
     anche fra un tocco e l'altro e la partita sotto il dito non e' la
     stessa a ogni corsa (misurato: 61,6% contro 72,1% sullo stesso file). */
  await ctx.addInitScript(() => {
    const PASSO = 1000 / 60;
    let t = 0, coda = [];
    window.requestAnimationFrame = cb => { coda.push(cb); return coda.length; };
    window.cancelAnimationFrame = () => {};
    try { performance.now = () => t; } catch (e) {}
    window.__banco = { passo(n){ n = Math.max(0, Math.round(+n || 0));
      for (let i = 0; i < n; i++) { const c = coda; coda = []; t += PASSO; for (const f of c) { try { f(t); } catch (e) {} } }
      return t; } };
  });
  const pag = await ctx.newPage();
  const cdp = await ctx.newCDPSession(pag);
  pag.on('pageerror', e => console.error('  ! errore di pagina: ' + e.message));

  const righe = [];
  let discoScatto = null;
  for (const seme of SEMI) {
    await pag.goto('http://127.0.0.1:' + srv.porta + '/CALCETTO-il-gioco.html', { waitUntil: 'load' });
    await pag.evaluate(async () => {
      try { window.__test.dismissSplash && window.__test.dismissSplash(); } catch (e) { }
      window.__banco.passo(4);
      await document.fonts.ready;
    });
    /* LA QUIETE PRIMA DEL SEME (la stessa di _q-dischi.js): il carattere
       si carica quando gli pare e la sua promessa ricuoce la tessitura
       del campo, che tira decine di migliaia di numeri dal generatore
       comune. Si aspetta che il conto dei sorteggi stia fermo per due
       giri, poi si semina davvero. */
    await pag.evaluate(async () => {
      const t = window.__test; let fermi = 0;
      for (let g = 0; g < 20 && fermi < 2; g++) {
        const a = t.sorteggi;
        await new Promise(r => setTimeout(r, 300));
        fermi = (t.sorteggi === a) ? fermi + 1 : 0;
      }
    });
    await pag.evaluate(([seme, taglia]) => {
      window.__test.semina(seme);
      window.__test.startMatch(1, 1, { size: taglia });
      for (let i = 0; i < 900; i++) { window.__banco.passo(1); if (window.__test.state === 'play') break; }
      window.__banco.passo(60);
    }, [seme, TAGLIA]);
    /* il disco dello scatto, se esiste */
    discoScatto = await pag.evaluate(() => {
      const b = window.__test.pulsanti(0).find(z => z.act === 'sprint' || z.act === 'dash');
      return b ? { x: b.x, y: b.y, r: b.r, label: b.label } : null;
    });

    const ox = Math.round(VW * 0.22), oy = Math.round(VH * 0.62);
    for (const g of COPIONE) {
      const extra = (TIENI_SCATTO && discoScatto) ? [{ x: discoScatto.x, y: discoScatto.y, id: 2 }] : [];
      if (extra.length) { await dita.giu(cdp, extra); await pag.evaluate(`(${CAMPIONA})(1)`); }
      await dita.giu(cdp, [{ x: ox, y: oy, id: 1 }].concat(extra));
      await pag.evaluate(`(${CAMPIONA})(1)`);
      for (let k = 1; k <= g.passi; k++) {
        const px = ox + g.dx * k / g.passi, py = oy + g.dy * k / g.passi;
        await dita.sposta(cdp, [{ x: px, y: py, id: 1 }].concat(extra));
        const d = await pag.evaluate(`(${CAMPIONA})(1)`);
        for (const r of d) righe.push(Object.assign({ seme, gesto: g.nome, fase: 'muove' }, r));
      }
      const d2 = await pag.evaluate(`(${CAMPIONA})(${g.tieni})`);
      for (const r of d2) righe.push(Object.assign({ seme, gesto: g.nome, fase: 'tiene' }, r));
      await dita.su(cdp, extra);
      if (extra.length) { await pag.evaluate(`(${CAMPIONA})(1)`); await dita.su(cdp, []); }
      await pag.evaluate(`(${CAMPIONA})(6)`);
    }
  }
  await br.close(); srv.chiudi();

  /* ------------------------------------------------------------------ */
  const vivi = righe.filter(r => r.attiva && r.l > 8 && r.scena === 'play');
  const spr = vivi.filter(r => r.sprint).length;
  const out = {
    gioco: path.basename(GIOCO), tieniScatto: !!TIENI_SCATTO,
    discoScatto, campioni: righe.length, vivi: vivi.length,
    sprintPct: +(100 * spr / (vivi.length || 1)).toFixed(1),
    oltre66Pct: +(100 * vivi.filter(r => r.l > 66).length / (vivi.length || 1)).toFixed(1),
  };
  console.log('\n=== LO SCATTO E\' UNA SCELTA? — ' + path.basename(GIOCO)
    + (TIENI_SCATTO ? ' (disco SCATTO tenuto)' : '') + ' ===');
  console.log('    disco con atto sprint: ' + (discoScatto ? discoScatto.label + ' a (' + discoScatto.x.toFixed(0) + ',' + discoScatto.y.toFixed(0) + ') r' + discoScatto.r : 'NON ESISTE'));
  console.log('    ' + righe.length + ' fotogrammi campionati, ' + vivi.length + ' con la levetta fuori dalla zona morta e la partita in corso');
  console.log('    SCATTO ACCESO: ' + spr + '/' + vivi.length + ' = ' + out.sprintPct + '%');
  const ls = vivi.map(r => r.l).sort((a, b) => a - b);
  const q = p => ls.length ? ls[Math.min(ls.length - 1, Math.floor(p * ls.length))] : -1;
  console.log('    |levetta|: min ' + q(0).toFixed(1) + ' · mediana ' + q(0.5).toFixed(1) + ' · max ' + q(0.999).toFixed(1));
  console.log('    fotogrammi con |levetta| > 66 (la soglia di oggi): ' + out.oltre66Pct + '%');
  const perGesto = {};
  for (const r of vivi) { const k = r.gesto; (perGesto[k] = perGesto[k] || { n: 0, s: 0, lmax: 0 }); perGesto[k].n++; if (r.sprint) perGesto[k].s++; perGesto[k].lmax = Math.max(perGesto[k].lmax, r.l); }
  out.perGesto = {};
  console.log('    per gesto (scatto acceso · |levetta| massima):');
  for (const k in perGesto) {
    out.perGesto[k] = { sprintPct: +(100 * perGesto[k].s / perGesto[k].n).toFixed(0), lmax: +perGesto[k].lmax.toFixed(1), n: perGesto[k].n };
    console.log('      ' + k.padEnd(20) + ' ' + String(out.perGesto[k].sprintPct).padStart(3) + '%   ' + perGesto[k].lmax.toFixed(1));
  }
  const fi = righe.filter(r => r.fiato >= 0).map(r => r.fiato);
  if (fi.length) {
    out.fiatoMin = +Math.min.apply(null, fi).toFixed(1);
    out.fiatoStancoPct = +(100 * fi.filter(v => v < 25).length / fi.length).toFixed(1);
    console.log('    fiato: minimo ' + out.fiatoMin + ' · fotogrammi sotto 25 (uomo stanco) ' + out.fiatoStancoPct + '%');
  }
  if (JSONOUT) { fs.writeFileSync(path.resolve(RADICE, JSONOUT), JSON.stringify(out, null, 1)); console.log('    -> ' + JSONOUT); }
})();
