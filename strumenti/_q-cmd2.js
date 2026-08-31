/* =====================================================================
   _q-cmd2.js — IL CANCELLO DEL TRASCINAMENTO CHE SCEGLIE IL VERBO
   (famiglia 2 del confronto COMANDI, 29 agosto 2026).

   SEI CONTROLLI, e cinque su sei leggono FISICA VERA (la quota del
   pallone, fotogramma per fotogramma) oppure PIXEL DIPINTI. Nessuno
   legge G.stats.pallonetti ne' un campo che il gioco si scrive da se':
   e' esattamente la trappola che in questa casa ha gia' timbrato tre
   cancelli.

     C1  EQUITA' AL BIT — partite CPU contro CPU a semi fissi: numero di
         chiamate a dado(), a rnd() e punteggio finale. Devono essere
         IDENTICI prima e dopo (la legge sui sorteggi). Si stampa una
         riga sola, da confrontare fra due corse.
     C2  IL PALLONETTO INVOLONTARIO — levetta tenuta INDIETRO a 44 px
         (sotto lo sprint, che sta a 66), dito sul disco TIRA che tiene
         0,6 s e rilascia SENZA trascinare. Si misura la quota massima
         VERA del pallone. Un pallonetto passa i 20; un tiro forte non
         puo' (kickBall gli da' al massimo vz 130, cioe' picco 15,1).
         DA SOLO C2 NON DIMOSTRA NIENTE: lo passa anche un gioco che non
         alza mai il pallone (il bugiardo «quota» lo fa). Vale in coppia
         con C3, che nello stesso banco pretende il contrario.
     C2b LA MIRA NON E' UN PALLONETTO — il gesto della mira di questa
         casa (trascinamento INDIETRO di 46 px con 26 di verticale) non
         deve alzare niente. E' il controllo che ha bocciato la prima
         stesura di questa toppa, che metteva il pallonetto sul settore
         indietro.
     C3  IL PALLONETTO CHIESTO — levetta AVANTI (nessuna richiesta da
         li'), dito sul disco TIRA che tiene 0,6 s, trascina IN SU di
         76 px e rilascia. Stessa misura.
     C4  LA QUOTA DEL PASSAGGIO — cinque ampiezze sul disco FILTRANTE
         (40/60/70/80/92 px) e la quota massima vera del pallone.
         Sotto TRASCINA_SU il passaggio e' rasoterra; sopra cresce.
     C5  IL RASOTERRA NON E' CAMBIATO — ampiezza 52 px, cioe' la
         direzione a piena autorita' (L14_SAT) e ancora sotto la soglia
         della quota: il ricevente scelto e la quota devono essere
         quelli di ieri. E' il controllo di NON regressione.
     C6  L'ARCO ESISTE NEI PIXEL — mentre il dito tiene FILTRANTE a 86
         px, si fotografa la tela e si contano i pixel CIANO sopra la
         corda che unisce pallone e ricevente. Una linea dritta non ne
         ha nessuno sopra la corda; un arco si'.

   IL GIOCO BUGIARDO — e senza questo il cancello non varrebbe niente.
   Con --bugiardo <che> il banco NON misura: costruisce una variante del
   gioco fatta apposta per mentirgli e la scrive accanto. Le tre
   varianti, tutte con le dichiarazioni PERFETTE:
     quota   b.vz forzato a zero nei due esecutori (passaggio alto e
             pallonetto). Il risolutore sceglie, le statistiche contano,
             gli archi si dichiarano: solo il pallone non si alza.
             Devono diventare rossi C2/C3/C4.
     arco    il disegno torna a curvare solo l'arco del cross, ma
             zoneInterfaccia continua a dichiarare l'arco col suo picco.
             Deve diventare rosso C6.
     scelta  verboTrascinato torna sempre il verbo semplice; tutto il
             resto resta. Devono diventare rossi C3 e C4.

   uso:
     node strumenti/_q-cmd2.js --gioco fuori/cmd-seconda.html
     node strumenti/_q-cmd2.js --gioco fuori/cmd-seconda-base.html
     node strumenti/_q-cmd2.js --bugiardo quota --gioco fuori/cmd-seconda.html
     node strumenti/_q-cmd2.js --solo C2,C3        (per iterare)
   esce 0 se tutti i verdetti sono verdi, 1 se anche uno e' rosso,
   2 se il banco stesso e' invecchiato.

   IL BANCO E' UN BROWSER, NON UN VETRO: Chromium 915x412 dpr2, dita di
   protocollo (Input.dispatchTouchEvent), tempo a passo fisso in mano al
   banco, Math.random a seme fisso. Ricalcato su strumenti/_q-l14.js.
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
const SOLO = arg('solo', '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
const BUGIARDO = arg('bugiardo', '');
const fai = c => !SOLO.length || SOLO.indexOf(c.toUpperCase()) >= 0;
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
               '.png': 'image/png', '.json': 'application/json' };

/* le costanti del PROGETTO vivono nel banco, cosi' il gioco non puo'
   negoziarle: se il gioco ne usasse altre, la fisica misurata non
   tornerebbe con la tabella e il cancello lo direbbe. */
const TRASCINA_SU = 66, L14_PIENO = 88;
const Z_LOB = 20;      // sopra questa quota il pallone e' stato ALZATO apposta:
                       // kickBall da' al massimo vz 130 a un tiro forte (picco 15,1)

/* --------------------------------------------------------------------
   IL GIOCO BUGIARDO. Tre varianti, tutte con le dichiarazioni intatte.
   -------------------------------------------------------------------- */
if (BUGIARDO) {
  const src = fs.readFileSync(GIOCO, 'utf8');
  const RICETTE = {
    quota: [
      ['b.vz=alto ? 280*T : 0;', 'b.vz=0;/*BUGIA*/'],
      ['b.vz = bl.vz;', 'b.vz = 0;/*BUGIA*/'],
    ],
    arco: [
      ['const arco=(s.picco>0);', "const arco=(s.tipo==='arco-cross');/*BUGIA*/"],
    ],
    scelta: [
      ["  if(act==='shot')\n    return { act:(tr.dy <= -TRASCINA_SU ? 'pallonetto' : 'tiro'), su:0 };",
       "  if(act==='shot') return { act:'tiro', su:0 };/*BUGIA*/"],
      ["  if(act==='through')\n    return { act:(tr.l>=TRASCINA_SU ? 'passoAlto' : 'passo'),\n             su: clamp((tr.l-TRASCINA_SU)/(L14_PIENO-TRASCINA_SU), 0, 1) };",
       "  if(act==='through') return { act:'passo', su:0 };/*BUGIA*/"],
    ],
  };
  const r = RICETTE[BUGIARDO];
  if (!r) { console.error('FALLITO: bugiardo sconosciuto <' + BUGIARDO + '>. Sono: ' + Object.keys(RICETTE).join(', ')); process.exit(2); }
  let out = src;
  for (const [a, b] of r) {
    if ((out.split(a).length - 1) !== 1) { console.error('FALLITO: l\'ancoraggio del bugiardo non e\' unico: ' + JSON.stringify(a.slice(0, 60))); process.exit(2); }
    out = out.replace(a, b);
  }
  const dest = path.join(RADICE, 'fuori', 'cmd2-bugiardo-' + BUGIARDO + '.html');
  fs.writeFileSync(dest, out);
  console.log('BUGIARDO <' + BUGIARDO + '> scritto: ' + dest + '  (' + out.length + ' byte, ' + r.length + ' sostituzioni)');
  console.log('adesso:  node strumenti/_q-cmd2.js --gioco fuori/cmd2-bugiardo-' + BUGIARDO + '.html');
  process.exit(0);
}

/* Playwright non apre file: — serve un server locale (modello _q-l14.js). */
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

/* il tempo in mano al banco: un fotogramma per chiamata */
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
  giu:  (cdp, pts) => cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts }),
  muovi:(cdp, pts) => cdp.send('Input.dispatchTouchEvent', { type: 'touchMove',  touchPoints: pts }),
  su:   (cdp, pts) => cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd',   touchPoints: pts || [] }),
  sicuro: async cdp => { try { await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); } catch (e) {} },
};

/* LA SONDA DEI SORTEGGI. Si conta Math.random, che e' l'UNICA sorgente
   del caso in questa pagina: il banco l'ha gia' sostituita con una
   successione a seme fisso (vedi apri()), e dado() ci cade dentro
   finche' il seme interno del gioco resta spento. Contare anche rnd()
   sarebbe stato piu' fine e non si puo': rnd e' un const, quindi non e'
   una proprieta' di window e dall'esterno non lo si avvolge. dado()
   invece si', ed e' contato a parte quando c'e'. */
function installaSorteggi() {
  if (window.__sort) return 'gia';
  if (typeof window.__nrand !== 'function')
    return 'BANCO INVECCHIATO: il contatore di Math.random non e\' stato installato.';
  const S = { dado: 0 };
  window.__sort = S;
  if (typeof window.dado === 'function') {
    const d0 = window.dado;
    window.dado = function () { S.dado++; return d0.apply(this, arguments); };
  }
  return 'ok';
}

/* ---------------------------------------------------------------------
   LA SCENA. Partita in corso, palla al piede del comandato, compagni
   dove serve, avversari lontani e inchiodati.
   «avanti» sposta il portatore nella meta' campo offensiva (per il
   tiro), «indietro» lo lascia dov'e' (per il passaggio).
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
  p.slide = -1; p.recover = 0; p.kickCd = 0;
  for (const q of G.players) { q.vx = 0; q.vy = 0; if (q.chiamata !== undefined) q.chiamata = 0; }
  p.x = C.FW * (cfg.fx !== undefined ? cfg.fx : (cfg.avanti ? 0.74 : 0.42));
  p.y = C.FH * (cfg.fy !== undefined ? cfg.fy : 0.5);
  const b = G.ball;
  b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0; b.curve = 0; b.passTo = -1; b.crossTo = -1;
  b.owner = pi; b.x = p.x + 8; b.y = p.y;
  const mates = [];
  for (let i = 0; i < G.players.length; i++) {
    const q = G.players[i];
    if (q.team === 0 && i !== pi && q.role !== 'gk' && q.out <= 0) mates.push(i);
  }
  (cfg.mates || []).forEach((m, k) => {
    if (k < mates.length) {
      const q = G.players[mates[k]];
      q.x = Math.max(24, Math.min(C.FW - 24, p.x + m[0]));
      q.y = Math.max(20, Math.min(C.FH - 20, p.y + m[1]));
      q.vx = 0; q.vy = 0; q.aiT = 0.06; q.aiTX = q.x; q.aiTY = q.y;
    }
  });
  /* avversari lontani E INCHIODATI: la scena misura una SCELTA, non una
     mischia. Il portiere avversario resta al suo posto: e' lui che
     rende il pallonetto una cosa sensata. */
  for (const q of G.players) {
    if (q.team !== 0 && q.out <= 0 && q.role !== 'gk') {
      const d = Math.hypot(q.x - b.x, q.y - b.y);
      if (d < 390) {
        const l = Math.max(1, d);
        q.x = Math.max(24, Math.min(C.FW - 24, b.x + (q.x - b.x) / l * 400));
        q.y = Math.max(20, Math.min(C.FH - 20, b.y + (q.y - b.y) / l * 400));
      }
      q.vx = 0; q.vy = 0; q.aiT = 30; q.aiTX = q.x; q.aiTY = q.y;
    }
  }
  /* i dischi, cercati per ATTO e non per raggio: l'elenco ne ha quattro
     da L1.6 e il piu' piccolo non e' piu' quello che serve. */
  const bt = t.pulsanti(0);
  const trova = a => bt.filter(x => x.act === a)[0] || null;
  const tira = trova('shot'), filt = trova('through');
  if (cfg.disco === 'shot' && !tira)
    return { errore: 'nessun disco <shot>: il disco grande offre <' + (bt[0] && bt[0].act) + '>' };
  if (cfg.disco === 'through' && !filt)
    return { errore: 'nessun disco <through>: gli atti sono ' + bt.map(x => x.act).join(',') };
  const D = cfg.disco === 'shot' ? tira : filt;
  const sotto = document.elementFromPoint(D.x, D.y);
  if (!sotto || sotto.id !== 'gioco')
    return { errore: 'sul disco (' + D.x + ',' + D.y + ') non c\'e\' la tela ma ' + (sotto ? sotto.tagName + '#' + sotto.id : 'niente') };
  const v = G.view;
  return { pi, disco: { x: D.x, y: D.y, r: D.r, act: D.act },
           FW: C.FW, FH: C.FH, px: p.x, py: p.y,
           vista: v ? { S2: v.S2, Ax: v.Ax, Ay: v.Ay } : null };
}

/* dove appoggiare il dito della LEVETTA: lontano dai quattro dischi e
   dalle loro zone di esclusione, in mezzo alla tela. */
function puntoErba() {
  const t = window.__test;
  const bt = t.pulsanti(0);
  const W = window.innerWidth, H = window.innerHeight;
  for (const c of [[W * 0.30, H * 0.55], [W * 0.22, H * 0.45], [W * 0.40, H * 0.35]]) {
    let ok = true;
    for (const b of bt) if (Math.hypot(c[0] - b.x, c[1] - b.y) <= b.r + 30) ok = false;
    if (ok) return { x: c[0], y: c[1] };
  }
  return null;
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

  async function apri(seme) {
    const pag = await ctx.newPage();
    await pag.addInitScript(s0 => {
      let s = s0 >>> 0 || 1;
      const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
      let n = 0;
      Math.random = () => { n++; return p() / 4294967296; };
      window.__nrand = () => n;
      /* IL SEME SI RIMETTE A ZERO QUANDO VUOLE CHI MISURA, e senza
         questo C1 non varrebbe niente. Il caricamento della pagina
         (caratteri, splash, primi fotogrammi) consuma un numero di
         sorteggi che NON e' sempre lo stesso: misurato, due corse dello
         stesso file danno due firme diverse. Rimettendo il seme
         all'istante esatto in cui la partita comincia, la successione
         riparte da capo e la firma diventa una proprieta' del GIOCO
         invece che del caricamento. */
      window.__riseme = v => { s = (v >>> 0) || 1; n = 0; };
    }, seme || 20260829);
    await pag.addInitScript(bancoDiProva);
    pag.on('pageerror', e => eccezioni.push(e.message));
    await pag.goto('http://127.0.0.1:' + srv.porta + '/CALCETTO-il-gioco.html', { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(() => window.__banco.passo(6));
    const cdp = await ctx.newCDPSession(pag);
    const passo = n => pag.evaluate(k => window.__banco.passo(k), n);
    return { pag, cdp, passo };
  }

  const esiti = [];
  const stampa = s => console.log(s);
  const verdetto = (id, nome, ok, dett) => { esiti.push({ id, nome, ok }); stampa('   -> ' + id + ' ' + (ok ? 'VERDE' : 'ROSSO') + (dett ? '  ' + dett : '')); stampa(''); };

  stampa('=== CANCELLO COMANDI/2 — il trascinamento sceglie il verbo ===');
  stampa('  gioco: ' + GIOCO);
  stampa('  banco: Chromium 915x412 dpr2, dita di protocollo, DT=1/60 in mano');
  stampa('  soglie del banco: TRASCINA_SU=' + TRASCINA_SU + '  L14_PIENO=' + L14_PIENO + '  quota-pallonetto>' + Z_LOB);
  stampa('');

  /* ------------------------------------------------------------------
     C1 — EQUITA' AL BIT: i sorteggi di una partita CPU contro CPU.
     ------------------------------------------------------------------ */
  if (fai('C1')) {
    stampa('C1) EQUITA\' AL BIT — sorteggi e punteggio di 4 partite CPU contro CPU');
    const righe = [];
    for (let k = 0; k < 4; k++) {
      const { pag } = await apri(20260803 + k);
      const s = await pag.evaluate(installaSorteggi);
      if (s !== 'ok' && s !== 'gia') { console.error('FALLITO (banco): ' + s); process.exit(2); }
      const r = await pag.evaluate(sm => {
        const t = window.__test, G = t.G;
        try { t.dismissSplash && t.dismissSplash(); } catch (e) {}
        window.__riseme(sm);
        t.startMatch(1, 1, { size: 5 });
        window.__sort.dado = 0; const n0 = window.__nrand();
        for (let i = 0; i < 3600; i++) t.simulate(1 / 60);
        return { dado: window.__sort.dado, rnd: window.__nrand() - n0,
                 gol: G.score[0] + '-' + G.score[1],
                 bx: Math.round(G.ball.x * 1000), by: Math.round(G.ball.y * 1000) };
      }, 20260803 + k);
      await pag.close();
      righe.push(r);
      stampa('   seme ' + (20260803 + k) + '  dado ' + r.dado + '  Math.random ' + r.rnd + '  ' + r.gol + '  palla ' + r.bx + '/' + r.by);
    }
    const firma = righe.map(r => r.dado + '|' + r.rnd + '|' + r.gol + '|' + r.bx + '|' + r.by).join('  ');
    stampa('   FIRMA: ' + firma);
    esiti.push({ id: 'C1', nome: 'equita\' al bit (firma da confrontare fra due corse)', ok: true, firma });
    stampa('   -> C1 e\' una MISURA, non un verdetto: si confronta la FIRMA fra prima e dopo.');
    stampa('');
  }

  /* ------------------------------------------------------------------
     C2/C3 — IL PALLONETTO. Chi lo chiede, e chi non lo chiede.
     ------------------------------------------------------------------ */
  /* le CINQUE scene del tiro: cinque posti diversi della meta' campo
     offensiva e cinque sbandate diverse del gesto, cosi' i cinque
     campioni sono cinque e non uno ripetuto cinque volte. «sb» e' la
     componente orizzontale che si somma al trascinamento chiesto: un
     dito non tira mai perfettamente dritto. */
  const SCENE_TIRO = [
    { fx: 0.74, fy: 0.50, sb:   0 },
    { fx: 0.66, fy: 0.34, sb: -24 },
    { fx: 0.82, fy: 0.66, sb:  24 },
    { fx: 0.70, fy: 0.62, sb: -14 },
    { fx: 0.78, fy: 0.38, sb:  14 },
  ];
  /* drag = [dx, dy] chiesto, oppure null per «dito fermo». Alla dy si
     somma niente e alla dx la sbandata della scena. */
  async function provaTiro(nome, semeBase, stickDx, drag, n) {
    const quote = [], calci = [];
    for (let k = 0; k < n; k++) {
      const S = SCENE_TIRO[k % SCENE_TIRO.length];
      const dragAmp = drag ? 1 : 0;
      const dragDx = drag ? drag[0] + S.sb : 0;
      const dragDy = drag ? drag[1] : 0;
      const { pag, cdp, passo } = await apri(semeBase + k);
      const q = await pag.evaluate(preparaScena, { taglia: 5, fx: S.fx, fy: S.fy, disco: 'shot', mates: [[120, -140], [120, 140], [-90, 0]] });
      if (q.errore) { await pag.close(); throw new Error('scena ' + nome + ': ' + q.errore); }
      const E = await pag.evaluate(puntoErba);
      if (!E) { await pag.close(); throw new Error('scena ' + nome + ': nessun punto d\'erba libero'); }
      const D = q.disco;
      /* dito 1: la levetta. Si posa, si muove oltre SOGLIA_LEVETTA e va
         a stickDx px dal punto di posa. */
      await dito.giu(cdp, [{ x: E.x, y: E.y, id: 1 }]);
      await passo(1);
      for (let i = 1; i <= 4; i++) {
        await dito.muovi(cdp, [{ x: E.x + stickDx * i / 4, y: E.y, id: 1 }]);
        await passo(1);
      }
      /* dito 2: il disco del tiro. Tiene 0,6 s (finestra 0,50-0,80). */
      await dito.giu(cdp, [{ x: E.x + stickDx, y: E.y, id: 1 }, { x: D.x, y: D.y, id: 2 }]);
      for (let i = 0; i < 30; i++) await passo(1);
      /* il trascinamento, se c'e': 6 fotogrammi di corsa + 8 fermi,
         cosi' il campione anteriore di 60 ms e' gia' a destinazione. */
      if (dragAmp) {
        for (let i = 1; i <= 6; i++) {
          await dito.muovi(cdp, [{ x: E.x + stickDx, y: E.y, id: 1 },
                                 { x: D.x + dragDx * i / 6, y: D.y + dragDy * i / 6, id: 2 }]);
          await passo(1);
        }
      }
      for (let i = 0; i < 8; i++) await passo(1);
      const carica = await pag.evaluate(pi0 => window.__test.G.players[pi0].charge, q.pi);
      /* SI ALZA SOLO IL DITO DEL DISCO, e l'elenco di un touchEnd sono i
         punti che si STACCANO (misurato: touchEnd con [id1] genera
         touchend:1 e lascia attivo id2). La levetta resta giu': e' lei
         l'imputata di C2, e deve essere ancora premuta nell'istante in
         cui il tiro parte. */
      await dito.su(cdp, [{ x: D.x + dragDx, y: D.y + dragDy, id: 2 }]);
      const r = await pag.evaluate(() => {
        const t = window.__test, G = t.G;
        let zMax = 0, v0 = Math.hypot(G.ball.vx, G.ball.vy);
        for (let fr = 0; fr < 120; fr++) { t.simulate(1 / 60); if (G.ball.z > zMax) zMax = G.ball.z;
          if (fr === 0) v0 = Math.hypot(G.ball.vx, G.ball.vy); }
        return { zMax, v0 };
      });
      await dito.sicuro(cdp);
      await pag.close();
      quote.push(r.zMax); calci.push(r.v0);
      if (!(carica > 0.4 && carica < 1.0)) throw new Error('scena ' + nome + ': la carica al rilascio vale ' + carica + ', fuori dalla finestra voluta');
    }
    const lob = quote.filter(z => z > Z_LOB).length;
    stampa('   quote massime: ' + quote.map(n1).join(' · ') + '   (soglia pallonetto ' + Z_LOB + ')');
    stampa('   velocita\' del calcio: ' + calci.map(v => Math.round(v)).join(' · '));
    return { lob, n, quote };
  }

  if (fai('C2')) {
    stampa('C2) IL PALLONETTO INVOLONTARIO — levetta indietro 44 px, dito FERMO sul disco');
    const r = await provaTiro('C2', 20260810, -44, null, 5);
    verdetto('C2', 'la levetta da sola non alza piu\' nessun pallonetto', r.lob === 0,
             '[' + r.lob + ' pallonetti su ' + r.n + ']');
  }
  if (fai('C2b')) {
    /* IL CONTROLLO CHE HA BOCCIATO LA PRIMA STESURA. Il gesto della
       MIRA di questa casa e' un trascinamento INDIETRO di 46 px con
       fino a 26 px di verticale (il generatore di _q-linea prova A):
       se il pallonetto vivesse sul settore indietro, questa sarebbe una
       richiesta di pallonetto. Non deve esserlo. */
    stampa('C2b) LA MIRA NON E\' UN PALLONETTO — trascinamento indietro 46 px, verticale 26 (il gesto della mira)');
    const r = await provaTiro('C2b', 20260810, +44, [-46, -26], 5);
    verdetto('C2b', 'il gesto della mira non alza nessun pallonetto', r.lob === 0,
             '[' + r.lob + ' pallonetti su ' + r.n + ']');
  }
  if (fai('C3')) {
    stampa('C3) IL PALLONETTO CHIESTO — levetta AVANTI, trascinamento IN SU di 76 px sul disco');
    const r = await provaTiro('C3', 20260810, +44, [0, -76], 5);
    verdetto('C3', 'il trascinamento in su sul disco TIRA alza il pallonetto', r.lob === r.n,
             '[' + r.lob + ' pallonetti su ' + r.n + ']');
  }

  /* ------------------------------------------------------------------
     C4/C5 — IL PASSAGGIO: la quota dall'ampiezza, e il rasoterra.
     ------------------------------------------------------------------ */
  async function provaPasso(AMP, seme) {
    const { pag, cdp, passo } = await apri(seme);
    const q = await pag.evaluate(preparaScena, { taglia: 5, avanti: false, disco: 'through',
                                                 mates: [[150, 0], [-120, 10], [30, -160]] });
    if (q.errore) { await pag.close(); throw new Error('scena passo: ' + q.errore); }
    const D = q.disco;
    await dito.giu(cdp, [{ x: D.x, y: D.y, id: 1 }]);
    for (let i = 1; i <= 8; i++) { await passo(1); await dito.muovi(cdp, [{ x: D.x + AMP * i / 8, y: D.y, id: 1 }]); }
    for (let i = 0; i < 6; i++) await passo(1);
    const prima = await pag.evaluate(() => {
      const G = window.__test.G;
      return { pal: [G.ball.x, G.ball.y] };
    });
    await dito.su(cdp, []);
    const r = await pag.evaluate(pi0 => {
      const t = window.__test, G = t.G;
      let zMax = 0, ric = -1;
      for (let fr = 0; fr < 150; fr++) {
        t.simulate(1 / 60);
        if (G.ball.z > zMax) zMax = G.ball.z;
        if (ric < 0 && G.ball.owner >= 0 && G.ball.owner !== pi0) ric = G.ball.owner;
      }
      return { zMax, ric, passTo: G.ball.passTo, ovest: G.players.length };
    }, q.pi);
    await dito.sicuro(cdp);
    await pag.close();
    return r;
  }

  if (fai('C4')) {
    stampa('C4) LA QUOTA DEL PASSAGGIO — cinque ampiezze sul disco FILTRANTE');
    const AMP = [40, 60, 70, 80, 92], quote = [];
    for (let k = 0; k < AMP.length; k++) {
      const r = await provaPasso(AMP[k], 20260824 + k);
      quote.push(r.zMax);
      stampa('   ampiezza ' + String(AMP[k]).padStart(3) + ' px  ->  quota massima ' + n1(r.zMax) + ' u   (ricevente ' + r.ric + ')');
    }
    const c1 = quote[0] < 5 && quote[1] < 5;
    const c2 = quote[2] > 10 && quote[3] > quote[2] + 4 && quote[4] > quote[3] + 4 && quote[4] >= 30;
    verdetto('C4a', 'sotto TRASCINA_SU il passaggio e\' rasoterra', c1,
             '[' + n1(quote[0]) + ' u a 40 px, ' + n1(quote[1]) + ' u a 60 px]');
    verdetto('C4b', 'sopra TRASCINA_SU la quota cresce con l\'ampiezza e scavalca le teste', c2,
             '[' + quote.map(n1).join(' · ') + ']');
  }

  if (fai('C5')) {
    stampa('C5) IL RASOTERRA NON E\' CAMBIATO — ampiezza 52 px (direzione a piena autorita\', sotto TRASCINA_SU)');
    const r = await provaPasso(52, 20260824);
    stampa('   quota massima ' + n1(r.zMax) + ' u · ricevente ' + r.ric);
    verdetto('C5', 'a 52 px il passaggio resta quello di ieri: rasoterra, con un ricevente',
             r.zMax < 5 && r.ric >= 0, '[quota ' + n1(r.zMax) + ', ricevente ' + r.ric + ']');
  }

  /* ------------------------------------------------------------------
     C6 — L'ARCO ESISTE NEI PIXEL. Non «il gioco dichiara un arco»: i
     pixel ciano SOPRA la corda fra pallone e ricevente.
     ------------------------------------------------------------------ */
  if (fai('C6')) {
    stampa("C6) L'ARCO ESISTE NEI PIXEL — dito fermo su FILTRANTE a 86 px, tela letta a pixel");
    const { pag, cdp, passo } = await apri(20260824);
    const q = await pag.evaluate(preparaScena, { taglia: 5, avanti: false, disco: 'through',
                                                 mates: [[150, 0], [-120, 10], [30, -160]] });
    if (q.errore) { await pag.close(); throw new Error('scena C6: ' + q.errore); }
    const D = q.disco, AMP = 86;
    await dito.giu(cdp, [{ x: D.x, y: D.y, id: 1 }]);
    for (let i = 1; i <= 8; i++) { await passo(1); await dito.muovi(cdp, [{ x: D.x + AMP * i / 8, y: D.y, id: 1 }]); }
    for (let i = 0; i < 6; i++) await passo(1);
    /* LA TELA SI LEGGE DOVE IL GIOCO L'HA APPENA DIPINTA: getImageData
       sul canvas vero, non su una fotografia ricodificata. E la corda si
       ricava dal segno DICHIARATO — cosi' il gioco puo' dichiarare
       quello che vuole: se i pixel non ci sono sopra la corda, il
       cancello diventa rosso lo stesso. */
    const r = await pag.evaluate(() => {
      const t = window.__test, G = t.G, v = G.view;
      const segni = (typeof segniGuida === 'function') ? segniGuida(0) : [];
      const s = segni.filter(x => x.tipo === 'linea-passaggio' || x.tipo === 'arco-passaggio')[0] || null;
      if (!s) return { errore: 'nessun segno di passaggio dichiarato' };
      const cv = document.getElementById('gioco');
      if (!cv) return { errore: 'nessuna tela #gioco' };
      const dpr = cv.width / cv.clientWidth;
      const cx2 = cv.getContext('2d');
      const img = cx2.getImageData(0, 0, cv.width, cv.height);
      const px = (x, y) => { const i = ((y | 0) * img.width + (x | 0)) * 4; return [img.data[i], img.data[i + 1], img.data[i + 2]]; };
      const ciano = c => (c[2] > 120 && c[2] > c[0] + 60 && c[1] > c[0] + 40);
      const x0 = (s.x0w * v.S2 + v.Ax) * dpr, y0 = (s.y0w * v.S2 + v.Ay) * dpr;
      const x1 = (s.x1w * v.S2 + v.Ax) * dpr, y1 = (s.y1w * v.S2 + v.Ay) * dpr;
      const piccoPx = (s.picco || 0) * v.S2 * dpr;
      let sulla = 0, sopra = 0, colonne = 0, altMax = 0;
      const N = 120;
      for (let k = 1; k < N; k++) {
        const f = k / N;
        const cx = x0 + (x1 - x0) * f, cy = y0 + (y1 - y0) * f;
        if (cx < 2 || cx > img.width - 3 || cy < 2 || cy > img.height - 3) continue;
        colonne++;
        for (let d = -2; d <= 2; d++) if (ciano(px(cx, cy + d))) { sulla++; break; }
        const H = Math.max(10 * dpr, piccoPx * 2 + 8 * dpr);
        for (let d = 5 * dpr; d <= H; d++) {
          const yy = cy - d;
          if (yy < 2) break;
          if (ciano(px(cx, yy))) { sopra++; if (d > altMax) altMax = d; break; }
        }
      }
      return { tipo: s.tipo, picco: s.picco || 0, piccoPx, dpr, colonne, sulla, sopra, altMax };
    });
    await dito.sicuro(cdp);
    await pag.close();
    if (r.errore) throw new Error('C6: ' + r.errore);
    stampa('   segno dichiarato: ' + r.tipo + '  picco ' + n1(r.picco) + ' u (' + n1(r.piccoPx) + ' px di tela)');
    stampa('   colonne utili ' + r.colonne + ' · con pixel ciano SULLA corda ' + r.sulla +
           " · SOPRA la corda " + r.sopra + " (la piu' alta a " + n1(r.altMax) + ' px)');
    verdetto('C6', "l'arco e' DIPINTO, non solo dichiarato (pixel ciano sopra la corda)",
             r.tipo === 'arco-passaggio' && r.sopra >= 30 && r.altMax >= r.piccoPx * 0.5,
             '[' + r.sopra + " colonne sopra la corda, la piu' alta " + n1(r.altMax) + ' px su ' + n1(r.piccoPx) + ' promessi]');
  }

  /* ------------------------------- il conto ------------------------- */
  await br.close(); srv.chiudi();
  stampa('=== IL CONTO ===');
  let rossi = 0;
  for (const e of esiti) { if (e.firma) { stampa('  MISURA ' + e.id + ' — ' + e.firma); continue; }
    stampa('  ' + (e.ok ? 'VERDE' : 'ROSSO') + '  ' + e.id + ' — ' + e.nome + (e.nullo ? ' (NULLO)' : '')); if (!e.ok) rossi++; }
  if (eccezioni.length) { stampa('  ECCEZIONI DI PAGINA: ' + eccezioni.slice(0, 5).join(' | ')); rossi++; }
  stampa(rossi === 0 ? 'TUTTO VERDE' : 'ROSSI: ' + rossi);
  process.exit(rossi === 0 ? 0 : 1);
})().catch(e => { console.error('IL BANCO E\' CADUTO: ' + (e && e.stack || e)); process.exit(2); });
