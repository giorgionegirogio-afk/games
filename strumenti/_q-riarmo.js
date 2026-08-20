/* =====================================================================
   _q-riarmo.js — LA GUARDIA DEL RI-ARMO: il dito che corregge la propria
   deriva NON deve armare il verbo nuovo; il dito che trascina apposta SI'.

   IL DIFETTO SORVEGLIATO (misurato da un critico avversario su
   fuori/l12.html, referto fuori/_crit/X34.txt, prova X3). Il ri-armo di
   L1.1 azzera la tenuta quando il contesto cambia sotto il dito, e
   R_ARMA = 22 + 14*min(1, tenuta/0,60): la soglia CROLLA da 36 a 22 px
   proprio nell'istante in cui il pollice e' giu' da piu' tempo — cioe'
   quando il progetto la voleva PIU' ALTA (un pollice appoggiato a lungo
   rotola, agente28.md §3.1). Conseguenza: il dito che torna al proprio
   punto di posa dopo una deriva di ~30 px arma il verbo nuovo nella
   direzione della correzione. Il critico l'ha visto sulla scivolata:
   8 armate su 20, direzione 180 gradi, contro 0 su 20 senza ri-armo.

   PERCHE' QUESTO CANCELLO COMPONE LE TOPPE PRONTE. Sul gioco di oggi
   (md5 30279089de83) Touch5.trascina non ha consumatori: il difetto e'
   LATENTE e nessun effetto lo puo' mostrare. Ma tre toppe sono pronte a
   entrare (_t-l12 scivolata, _t-l14 passaggio, _t-l15 raddoppio) e tutte
   e tre leggono trascina(id,true).armato al rilascio. Questo cancello
   giudica il MOTORE del file --gioco: per ciascun atto applica la toppa
   corrispondente a una COPIA temporanea (o usa il file cosi' com'e', se
   il consumatore e' gia' dentro — lo dice il marcatore) e misura
   l'EFFETTO nella simulazione: p.slide acceso, p.raddoppio acceso, un
   calcio contato sull'imbuto kickBall. Mai una bandiera scritta dal
   codice giudicato: «armato» viene stampato come CONTESTO, il verdetto
   sta sul corpo che va a terra o non ci va.

   LE PROVE:
     A1  scivolata — tenuta 0,7 s con deriva di 32 px, furto che cambia
         il contesto (shot -> slide), il dito TORNA al punto di posa,
         rilascio: NESSUNA scivolata, in venti prove (20 direzioni).
     A2  raddoppio — stessa mano sul disco piccolo: tenuta su CAMBIO,
         palla data al comandato (swap -> through), rubata di nuovo
         (through -> swap: e' l'ultimo ri-armo che conta), correzione,
         rilascio: NESSUN raddoppio, in venti prove.
     A3  passaggio — tenuta su CAMBIO, palla al comandato (swap ->
         through), correzione, rilascio: nessun calcio, nessuna posa di
         passaggio, nessuna chiamata. NOTA ONESTA, misurata: con la
         L1.4 di oggi questo ramo NON manifesta il difetto nemmeno senza
         guardia, perche' eseguiPassaggioL14 pretende una posa (a.passa)
         che solo la PRESSIONE apre e che nessun ri-armo apre. La prova
         resta: sorveglia il giorno in cui quel vincolo cambiasse.
     B1  scivolata APPOSTA — stessa scena di A1 ma senza deriva: dopo il
         ri-armo il dito trascina 60 px di proposito -> la scivolata DEVE
         uscire, 8 direzioni. E' la prova che la guardia non cura troppo:
         un rimedio a tempo morto (rimedio a) qui sarebbe rosso.
     B2  raddoppio APPOSTA — idem sul disco piccolo -> il raddoppio esce.
     B3  passaggio NORMALE senza ri-armo — pressione su PASSAGGIO con la
         palla al piede, tenuta 0,75 s, trascinamento di 60 px, rilascio
         -> il calcio esce. Non-regressione: la guardia non deve toccare
         di un bit gli atti mai ri-armati.
     PREZZO (stampato, NON giudicato) — trascinamento VOLUTO di 33 px,
         0,3 s dopo il ri-armo: oggi arma (33 > ~29), con la guardia no
         (33 < 36). E' il prezzo dichiarato del rimedio (b), ed e' lo
         stesso prezzo che il progetto gia' paga per una tenuta lunga
         senza ri-armo. Si stampa perche' chi legge lo sappia.
     D   non-regressione del ri-armo stesso: strumenti/_q-l11.js sul
         file --gioco, atteso 8/8 (si salta con --senza-l11, e allora
         l'esito D e' NON PROVATO, non verde).

   COME SI LEGGE UN VERDETTO. Effetti della simulazione: p.slide>=0
   (scritto da lanciaScivolata), p.raddoppio>0 (scritto da
   comandaRaddoppio), p.chiamataT>0, p.chargeKind==='passo', e i calci
   contati avvolgendo kickBall — l'imbuto unico di tutti i calci, lo
   stesso di _q-l11.js. La validita' di ogni scena e' CHIESTA AL GIOCO
   (l'etichetta del disco e l'atto sotto il dito prima e dopo ogni
   cambio): una scena che non produce il contesto che dichiara e' una
   prova NULLA — ne' verde ne' rossa, e il cancello esce col codice 3.

   IL BANCO E' QUELLO DI _q-l11.js: Chromium 915x412 dpr2, dita di
   protocollo (Input.dispatchTouchEvent), un requestAnimationFrame per
   passo con DT=1/60 esatto, Math.random a seme fisso 20260820. Due
   corse danno gli stessi numeri.

   uso:
     node strumenti/_q-riarmo.js                        (gioco di casa)
     node strumenti/_q-riarmo.js --gioco fuori/riarmo.html
     node strumenti/_q-riarmo.js --senza-l11            (salta la prova D)
     node strumenti/_q-riarmo.js --testa                (finestra visibile)
   esce 0 se tutto verde, 1 se almeno un rosso, 2 se il banco esplode,
   3 se nessun rosso ma almeno una prova nulla.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const os = require('os');
const { spawnSync } = require('child_process');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'CALCETTO-il-gioco.html')));
const TESTA = process.argv.includes('--testa');
const SENZA_L11 = process.argv.includes('--senza-l11');
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
               '.png': 'image/png', '.json': 'application/json' };

if (!fs.existsSync(GIOCO)) { console.error('FALLITO: non esiste ' + GIOCO); process.exit(2); }

/* ---------------------------------------------------------------------
   LA COMPOSIZIONE. Per ogni atto serve un consumatore del trascinamento.
   Se il file --gioco lo contiene gia' (marcatore), si usa cosi' com'e';
   altrimenti si applica la toppa pronta a una copia temporanea. La
   composizione viene stampata: chi legge il referto deve sapere su quale
   file ogni numero e' stato misurato.
   --------------------------------------------------------------------- */
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'q-riarmo-'));
function componi(sigla, toppa, marcatore) {
  const src = fs.readFileSync(GIOCO, 'utf8');
  if (src.includes(marcatore))
    return { file: GIOCO, come: 'consumatore gia\' dentro (' + marcatore + ')' };
  const out = path.join(TMP, 'con-' + sigla + '.html');
  const r = spawnSync(process.execPath, [path.join(__dirname, toppa), '--in', GIOCO, '--out', out],
                      { encoding: 'utf8' });
  if (r.status !== 0)
    return { errore: toppa + ' non si applica a ' + GIOCO + ':\n' + (r.stderr || r.stdout || '').slice(0, 800) };
  return { file: out, come: toppa + ' applicata a una copia' };
}

function servi() {
  return new Promise(ok => {
    let bersaglio = GIOCO;
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (/CALCETTO-il-gioco\.html$/i.test(f)) f = bersaglio;
      if ((!f.startsWith(RADICE) && f !== bersaglio) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        res.writeHead(404); res.end('no'); return;
      }
      res.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream',
                           'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({
      porta: s.address().port, chiudi: () => s.close(), punta: f => { bersaglio = f; },
    }));
  });
}

/* il tempo in mano al banco — identico a _q-l11.js */
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
  suSicuro: async cdp => { try { await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); } catch (e) {} },
};

/* ---------------------------------------------------------------------
   GLI AIUTI IN PAGINA. La sonda avvolge kickBall (l'imbuto unico dei
   calci) e conta; le scene scrivono lo stato della partita come fa
   _q-l11.js — «si copia quello vero del gioco», stessi numeri di kickCd
   del furto vero. Nessuna funzione qui dentro decide un verdetto.
   --------------------------------------------------------------------- */
function installaAiuti() {
  if (window.__qr) return 'gia';
  if (typeof window.kickBall !== 'function')
    return 'BANCO INVECCHIATO: window.kickBall non esiste piu\' — la sonda dei calci non ha piu\' un imbuto da avvolgere.';
  const T = window.__test, G = T.G;
  const S = { calci: [], tot: 0 };
  window.__sonda = S;
  const orig = window.kickBall;
  window.kickBall = function (p, nx, ny, speed, spinY) {
    const r = orig.call(this, p, nx, ny, speed, spinY);
    S.tot++;
    if (r) S.calci.push({ chi: G.players.indexOf(p), team: p.team });
    return r;
  };
  window.__qr = {
    /* porta la partita in gioco, come preparaQuiete di _q-l11.js */
    scena() {
      try { T.dismissSplash && T.dismissSplash(); } catch (e) {}
      T.setPaused && T.setPaused(false);
      try { if (T.Tut && T.Tut.active && T.Tut.finish) T.Tut.finish(true); } catch (e) {}
      for (let giro = 0; giro < 3 && G.scene !== 'play'; giro++) {
        for (let i = 0; i < 200 && G.scene !== 'play'; i++) T.simulate(0.1);
        if (G.scene !== 'play') { T.startMatch(1, 1, { size: 5 }); for (let i = 0; i < 80 && G.scene !== 'play'; i++) T.simulate(0.1); }
      }
      return G.scene;
    },
    /* azzera cio' che una prova precedente puo' aver lasciato acceso:
       sono i campi che le prove leggono come EFFETTO, e vanno spenti
       PRIMA, se no il verdetto conterebbe il passato */
    zero() {
      T.setTimeLeft && T.setTimeLeft(80);
      for (const q of G.players) {
        q.vx = 0; q.vy = 0; q.slide = -1; q.recover = 0; q.kickCd = 0;
        if (q.rove !== undefined && q.rove >= 0) q.rove = -1;
        if (q.charge !== undefined && q.charge >= 0) { q.charge = -1; q.chargeKind = 'tiro'; q.chargeT = 0; q.chargeGo = null; q.chargeClip = null; }
        if (q.contrasto !== undefined) q.contrasto = 0;
        if (q.raddoppio !== undefined) q.raddoppio = 0;
        if (q.chiamataT !== undefined) q.chiamataT = 0;
      }
      const b = G.ball;
      b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0; b.curve = 0; b.passTo = -1; b.crossTo = -1;
      S.calci = []; S.tot = 0;
    },
    /* palla al piede del comandato, al centro; tutti gli altri a 240+ */
    pallaMia() {
      const st = this.scena(); if (st !== 'play') return { errore: 'scena ' + st };
      this.zero();
      const pi = G.ctrl[0]; if (pi < 0) return { errore: 'nessun comandato' };
      const p = G.players[pi], c = T.campo, b = G.ball;
      p.x = c.FW * 0.5; p.y = c.FH * 0.5;
      b.owner = pi; b.x = p.x + 8; b.y = p.y;
      for (const q of G.players) {
        if (q === p) continue;
        const d = Math.hypot(q.x - b.x, q.y - b.y);
        if (d < 230) { const l = Math.max(1, d); q.x = b.x + (q.x - b.x) / l * 240; q.y = b.y + (q.y - b.y) / l * 240; }
      }
      const bt = T.pulsanti(0);
      const grande = bt.reduce((a, k) => (k.r || 0) > (a.r || 0) ? k : a, bt[0]);
      const piccolo = bt.reduce((a, k) => (k.r || 0) < (a.r || 0) ? k : a, bt[0]);
      const sotto = document.elementFromPoint(grande.x, grande.y);
      if (!sotto || sotto.id !== 'gioco') return { errore: 'sul disco non c\'e\' la tela ma ' + (sotto ? sotto.tagName + '#' + sotto.id : 'niente') };
      return { pi, grande: { x: grande.x, y: grande.y, act: grande.act },
                   piccolo: { x: piccolo.x, y: piccolo.y, act: piccolo.act } };
    },
    /* palla a un avversario di campo, 150 unita' A OVEST del comandato:
       la squadra 1 attacca x=0, quindi il portatore corre VIA dal
       comandato e il contesto «swap» resta stabile per tutta la tenuta.
       kickCd=2 s sul portatore: non puo' calciare durante la prova. */
    pallaLoro() {
      const st = this.scena(); if (st !== 'play') return { errore: 'scena ' + st };
      this.zero();
      const pi = G.ctrl[0]; if (pi < 0) return { errore: 'nessun comandato' };
      const p = G.players[pi], c = T.campo, b = G.ball;
      p.x = c.FW * 0.5; p.y = c.FH * 0.5;
      let k = -1, dm = 1e9;
      for (let i = 0; i < G.players.length; i++) {
        const o = G.players[i];
        if (o.team === p.team || o.out > 0 || o.role === 'gk') continue;
        const d = Math.hypot(o.x - p.x, o.y - p.y);
        if (d < dm) { dm = d; k = i; }
      }
      if (k < 0) return { errore: 'nessun avversario di campo' };
      const o = G.players[k];
      o.x = Math.max(30, p.x - 150); o.y = p.y; o.vx = 0; o.vy = 0; o.kickCd = 2.0;
      b.owner = k; b.x = o.x + 8; b.y = o.y;
      for (const q of G.players) {
        if (q === p || q === o) continue;
        const d = Math.hypot(q.x - b.x, q.y - b.y);
        if (d < 250) { const l = Math.max(1, d); q.x = b.x + (q.x - b.x) / l * 260; q.y = b.y + (q.y - b.y) / l * 260; }
      }
      const bt = T.pulsanti(0);
      const piccolo = bt.reduce((a, q2) => (q2.r || 0) < (a.r || 0) ? q2 : a, bt[0]);
      const sotto = document.elementFromPoint(piccolo.x, piccolo.y);
      if (!sotto || sotto.id !== 'gioco') return { errore: 'sul disco non c\'e\' la tela ma ' + (sotto ? sotto.tagName + '#' + sotto.id : 'niente') };
      return { pi, k, piccolo: { x: piccolo.x, y: piccolo.y, act: piccolo.act } };
    },
    /* IL FURTO — la forma e' quella di _q-l11.js, che l'ha copiata dal
       gioco (b.owner=k, kickCd 0,5 sul derubato). UNA differenza voluta
       e misurata: al ladro si da' kickCd 2,0 invece dello 0,35 del furto
       vero, perche' qui il ladro deve TENERE il pallone fino al rilascio
       — sonda del 20/8: con 0,35 il ladro calciava via il pallone
       durante la correzione, il portatore diventava nessuno
       (comandaRaddoppio -> false) e in una prova su tre il pallone in
       volo ripassava vicino al comandato e ri-armava il disco a un
       fotogramma dal rilascio. E' un perno di scena, non una regola del
       gioco. */
    furto(lontano) {
      const pi = G.ctrl[0], p = G.players[pi], b = G.ball;
      let k = -1, dm = 1e9;
      for (let i = 0; i < G.players.length; i++) {
        const o = G.players[i];
        if (o.team === p.team || o.out > 0) continue;
        const d = Math.hypot(o.x - b.x, o.y - b.y);
        if (d < dm) { dm = d; k = i; }
      }
      if (k < 0) return { errore: 'nessun avversario' };
      b.owner = k; b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0; b.passTo = -1;
      G.players[k].kickCd = 2.0; p.kickCd = 0.5;
      let bx = b.x, by = b.y;
      if (lontano > 0) {
        const FW = T.campo.FW;
        const verso = (p.x < FW / 2) ? 1 : -1;
        bx = Math.max(20, Math.min(FW - 20, p.x + verso * lontano)); by = p.y;
      }
      b.x = bx; b.y = by;
      G.players[k].x = bx; G.players[k].y = by; G.players[k].vx = 0; G.players[k].vy = 0;
      S.calci = []; S.tot = 0;
      return { k };
    },
    /* la palla arriva al piede del comandato (il contesto diventa NOSTRO) */
    dai() {
      const pi = G.ctrl[0], p = G.players[pi], b = G.ball;
      if (b.owner >= 0 && b.owner !== pi) G.players[b.owner].kickCd = 0.5;
      b.owner = pi; b.x = p.x + 8; b.y = p.y; b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0; b.passTo = -1;
      p.kickCd = 0;
      return { pi };
    },
    azzeraSonda() { S.calci = []; S.tot = 0; },
    /* GLI EFFETTI — i campi della simulazione che i verbi scrivono */
    stato() {
      let sciv = 0, radd = 0, chiam = 0, posePasso = 0;
      for (const q of G.players) {
        if (q.team !== 0) continue;
        if (q.slide >= 0) sciv++;
        if (q.raddoppio !== undefined && q.raddoppio > 0) radd++;
        if (q.chiamataT !== undefined && q.chiamataT > 0) chiam++;
        if (q.charge !== undefined && q.charge >= 0 && q.chargeKind === 'passo') posePasso++;
      }
      return { sciv, radd, chiam, posePasso,
               calci0: S.calci.filter(c => c.team === 0).length, tot: S.tot, owner: G.ball.owner };
    },
    /* CONTESTO, non verdetto: cosa dice il motore del trascinamento */
    lettura() {
      if (typeof Touch5 === 'undefined' || typeof Touch5.trascina !== 'function') return null;
      const id = Object.keys(Touch5.atti || {})[0];
      return id === undefined ? null : Touch5.trascina(id, true);
    },
    atto() {
      if (typeof Touch5 === 'undefined' || !Touch5.btnTouch) return null;
      const k = Object.keys(Touch5.btnTouch)[0];
      return k === undefined ? null : Touch5.btnTouch[k].act;
    },
  };
  return 'ok';
}

const n2 = v => (v === null || v === undefined || !isFinite(v)) ? 'n/d' : (Math.round(v * 100) / 100).toString().replace('.', ',');

/* ===================================================================== */
(async () => {
  const composizioni = {
    slide:   componi('l12', '_t-l12.js', "doSlide(bt.t,'scivola'"),
    swap:    componi('l15', '_t-l15.js', 'comandaRaddoppio('),
    through: componi('l14', '_t-l14.js', 'eseguiPassaggioL14('),
  };

  const srv = await servi();
  const br = await chromium.launch({ headless: !TESTA });
  const ctx = await br.newContext({ viewport: { width: 915, height: 412 },
    deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const eccezioni = [];

  async function apri(file) {
    srv.punta(file);
    const pag = await ctx.newPage();
    await pag.addInitScript(seme => {
      let s = seme >>> 0 || 1;
      const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
      Math.random = () => p() / 4294967296;
    }, 20260820);
    await pag.addInitScript(bancoDiProva);
    pag.on('pageerror', e => eccezioni.push(e.message));
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(() => window.__banco.passo(6));
    const aiuti = await pag.evaluate(installaAiuti);
    if (aiuti !== 'ok' && aiuti !== 'gia') { console.error('FALLITO: ' + aiuti); process.exit(2); }
    const cdp = await ctx.newCDPSession(pag);
    const passo = n => pag.evaluate(k => window.__banco.passo(k), n);
    return { pag, cdp, passo };
  }

  const righe = [];
  const stampa = s => { righe.push(s); console.log(s); };
  const esiti = [];

  stampa('=== CANCELLO RI-ARMO — la soglia non crolla sotto il dito ===');
  stampa('  gioco: ' + GIOCO);
  stampa('  banco: Chromium 915x412 dpr2, dita di protocollo, DT=1/60 in mano, seme 20260820');
  for (const k of ['slide', 'swap', 'through'])
    stampa('  atto ' + k + ': ' + (composizioni[k].errore ? 'NON COMPONIBILE — ' + composizioni[k].errore.split('\n')[0] : composizioni[k].come));
  stampa('');

  /* i movimenti del dito: una posizione ogni 3 fotogrammi in tenuta
     (l'anello tiene comunque una posizione per fotogramma di evento),
     ogni 2 in correzione/trascinamento, e 4 fotogrammi fermi in coda
     perche' la lettura del distacco (60 ms) cada sul punto pieno */
  async function tenuta(cdp, passo, P, dx, dy) {
    for (let i = 1; i <= 14; i++) { await passo(3); await dito.sposta(cdp, P.x + dx * i / 14, P.y + dy * i / 14); }
  }
  async function tenutaFerma(passo) { await passo(42); }
  async function correzione(cdp, passo, P, dx, dy) {
    for (let i = 1; i <= 6; i++) { await passo(2); await dito.sposta(cdp, P.x + dx * (1 - i / 6), P.y + dy * (1 - i / 6)); }
    await passo(4);
  }
  async function trascinaDa(cdp, passo, x0, y0, dx, dy) {
    for (let i = 1; i <= 6; i++) { await passo(2); await dito.sposta(cdp, x0 + dx * i / 6, y0 + dy * i / 6); }
    await passo(4);
  }
  const dentro = (x, y) => x >= 2 && x <= 913 && y >= 2 && y <= 410;

  /* GLI EFFETTI SI LEGGONO SU UNA FINESTRA, NON SU UN ISTANTE — sonda
     del 20/8 su questo stesso banco: la scivolata del rilascio nasce
     ~5 fotogrammi DOPO il rilascio (l'anticipo di startSlide matura) e
     p.slide torna spento entro ~15: una lettura unica la manca da tutte
     e due le parti. Si campiona ogni 3 fotogrammi per 24 e si tiene il
     massimo; i calci sono comunque cumulativi nella sonda. */
  async function effettiDopo(pag, passo) {
    const dopo = { sciv: 0, radd: 0, chiam: 0, posePasso: 0, calci0: 0 };
    for (let k = 0; k < 8; k++) {
      await passo(3);
      const s = await pag.evaluate(() => window.__qr.stato());
      for (const c of ['sciv', 'radd', 'chiam', 'posePasso', 'calci0']) dopo[c] = Math.max(dopo[c], s[c]);
    }
    return dopo;
  }

  /* ------------------------------------------------------------------
     UNA PROVA SUL DISCO GRANDE (atto slide). fase:
       'correzione'  deriva D px durante la tenuta, furto, ritorno al
                     punto di posa, rilascio -> effetto atteso: NIENTE
       'apposta'     tenuta ferma, furto, trascinamento voluto di D px,
                     rilascio -> effetto atteso: la scivolata ESCE
     ------------------------------------------------------------------ */
  async function provaSlide(pag, cdp, passo, fase, dir, D) {
    const q = await pag.evaluate(() => window.__qr.pallaMia());
    if (q.errore) return { nulla: q.errore };
    if (q.grande.act !== 'shot') return { nulla: 'il disco grande offre ' + q.grande.act };
    const P = q.grande, dx = Math.cos(dir) * D, dy = Math.sin(dir) * D;
    if (!dentro(P.x + dx, P.y + dy)) return { nulla: 'la deriva uscirebbe dallo schermo' };
    await dito.giu(cdp, P.x, P.y); await passo(1);
    if (fase === 'correzione') await tenuta(cdp, passo, P, dx, dy);
    else await tenutaFerma(passo);
    const a0 = await pag.evaluate(() => window.__qr.atto());
    if (a0 !== 'shot') { await dito.suSicuro(cdp); return { nulla: 'alla tenuta il dito tiene ' + a0 }; }
    const f = await pag.evaluate(() => window.__qr.furto(90));
    if (f.errore) { await dito.suSicuro(cdp); return { nulla: f.errore }; }
    await passo(1);
    const a1 = await pag.evaluate(() => window.__qr.atto());
    if (a1 !== 'slide') { await dito.suSicuro(cdp); return { nulla: 'dopo il furto il dito tiene ' + a1 }; }
    await passo(2);   /* due fotogrammi FERMI dopo il ri-armo: qualunque
                         criterio «parta da fermo» (rimedio c) qui e'
                         gia' soddisfatto, e la correzione arma lo stesso */
    if (fase === 'correzione') await correzione(cdp, passo, P, dx, dy);
    else await trascinaDa(cdp, passo, P.x, P.y, dx, dy);
    const let1 = await pag.evaluate(() => window.__qr.lettura());
    const aRil = await pag.evaluate(() => window.__qr.atto());
    if (aRil !== 'slide') { await dito.suSicuro(cdp); return { nulla: 'il contesto non ha retto fino al rilascio: atto ' + aRil }; }
    const prima = await pag.evaluate(() => window.__qr.stato());
    if (prima.sciv > 0) { await dito.suSicuro(cdp); return { nulla: 'scivolata gia\' accesa prima del rilascio' }; }
    await dito.su(cdp);
    const dopo = await effettiDopo(pag, passo);
    await dito.suSicuro(cdp);
    return { armata: dopo.sciv > 0 ? 1 : 0, lett: let1 };
  }

  /* ------------------------------------------------------------------
     UNA PROVA SUL DISCO PICCOLO. atto finale:
       'swap'     tenuta su CAMBIO -> palla al comandato (ri-armo a
                  through) -> rubata via (ri-armo a swap, l'ULTIMO) ->
                  correzione o trascinamento -> rilascio.
                  Effetto: p.raddoppio (scritto da comandaRaddoppio).
       'through'  tenuta su CAMBIO -> palla al comandato (ri-armo a
                  through) -> correzione -> rilascio.
                  Effetti: calci squadra 0, pose 'passo', chiamate.
     ------------------------------------------------------------------ */
  async function provaPiccolo(pag, cdp, passo, attoFinale, fase, dir, D) {
    const q = await pag.evaluate(() => window.__qr.pallaLoro());
    if (q.errore) return { nulla: q.errore };
    if (q.piccolo.act !== 'swap') return { nulla: 'il disco piccolo offre ' + q.piccolo.act };
    const P = q.piccolo, dx = Math.cos(dir) * D, dy = Math.sin(dir) * D;
    if (!dentro(P.x + dx, P.y + dy)) return { nulla: 'la deriva uscirebbe dallo schermo' };
    await dito.giu(cdp, P.x, P.y); await passo(1);
    if (fase === 'correzione') await tenuta(cdp, passo, P, dx, dy);
    else await tenutaFerma(passo);
    const a0 = await pag.evaluate(() => window.__qr.atto());
    if (a0 !== 'swap') { await dito.suSicuro(cdp); return { nulla: 'alla tenuta il dito tiene ' + a0 }; }
    await pag.evaluate(() => window.__qr.dai()); await passo(1);
    const a1 = await pag.evaluate(() => window.__qr.atto());
    if (a1 !== 'through') { await dito.suSicuro(cdp); return { nulla: 'dopo la palla il dito tiene ' + a1 }; }
    if (attoFinale === 'swap') {
      await passo(1);
      const f = await pag.evaluate(() => window.__qr.furto(150));
      if (f.errore) { await dito.suSicuro(cdp); return { nulla: f.errore }; }
      await passo(1);
      const a2 = await pag.evaluate(() => window.__qr.atto());
      if (a2 !== 'swap') { await dito.suSicuro(cdp); return { nulla: 'dopo il furto il dito tiene ' + a2 }; }
    }
    await passo(2);   /* fermi dopo l'ultimo ri-armo, come sopra */
    if (fase === 'correzione') await correzione(cdp, passo, P, dx, dy);
    else await trascinaDa(cdp, passo, P.x, P.y, dx, dy);
    const let1 = await pag.evaluate(() => window.__qr.lettura());
    const aRil = await pag.evaluate(() => window.__qr.atto());
    if (aRil !== attoFinale) { await dito.suSicuro(cdp); return { nulla: 'il contesto non ha retto fino al rilascio: atto ' + aRil }; }
    await pag.evaluate(() => window.__qr.azzeraSonda());
    const prima = await pag.evaluate(() => window.__qr.stato());
    if (attoFinale === 'swap' && prima.radd > 0) { await dito.suSicuro(cdp); return { nulla: 'raddoppio gia\' acceso prima del rilascio' }; }
    await dito.su(cdp);
    const dopo = await effettiDopo(pag, passo);
    await dito.suSicuro(cdp);
    if (attoFinale === 'swap') return { armata: dopo.radd > 0 ? 1 : 0, lett: let1 };
    return { armata: (dopo.calci0 > 0 || dopo.posePasso > 0 || dopo.chiam > 0) ? 1 : 0,
             dett: dopo, lett: let1 };
  }

  /* B3 — il passaggio NORMALE, senza nessun ri-armo: pressione su
     PASSAGGIO con la palla al piede, tenuta lunga, trascinamento, e il
     calcio DEVE uscire. Non-regressione della guardia sugli atti mai
     ri-armati (posato==tenuta per costruzione: qui niente puo' cambiare). */
  async function provaPassaggioNormale(pag, cdp, passo, dir) {
    const q = await pag.evaluate(() => window.__qr.pallaMia());
    if (q.errore) return { nulla: q.errore };
    if (q.piccolo.act !== 'through') return { nulla: 'il disco piccolo offre ' + q.piccolo.act };
    const P = q.piccolo, dx = Math.cos(dir) * 60, dy = Math.sin(dir) * 60;
    if (!dentro(P.x + dx, P.y + dy)) return { nulla: 'il trascinamento uscirebbe dallo schermo' };
    await dito.giu(cdp, P.x, P.y); await passo(1);
    await passo(44);
    await pag.evaluate(() => window.__qr.azzeraSonda());
    await trascinaDa(cdp, passo, P.x, P.y, dx, dy);
    const let1 = await pag.evaluate(() => window.__qr.lettura());
    await dito.su(cdp);
    const dopo = await effettiDopo(pag, passo);
    await dito.suSicuro(cdp);
    return { armata: dopo.calci0 > 0 ? 1 : 0, lett: let1 };
  }

  /* ------------------- il giro delle prove ------------------- */
  const DIR20 = Array.from({ length: 20 }, (_, i) => i * Math.PI / 10);
  /* per i trascinamenti voluti si resta nel semipiano alto/sinistro:
     verso destra e verso il basso il bordo dello schermo e' vicino */
  const DIR8 = [112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270].map(g => g * Math.PI / 180);

  function riassunto(nome, esitiProva) {
    const valide = esitiProva.filter(e => !e.nulla);
    const nulle = esitiProva.filter(e => e.nulla);
    const armate = valide.reduce((s, e) => s + e.armata, 0);
    const rArma = valide.map(e => e.lett ? e.lett.rArma : null).filter(v => v !== null);
    const lVal  = valide.map(e => e.lett ? e.lett.l : null).filter(v => v !== null);
    return { nome, valide: valide.length, nulle: nulle.length, armate,
             rArmaMin: rArma.length ? Math.min(...rArma) : null,
             rArmaMax: rArma.length ? Math.max(...rArma) : null,
             lMin: lVal.length ? Math.min(...lVal) : null,
             lMax: lVal.length ? Math.max(...lVal) : null,
             perche: nulle.slice(0, 3).map(e => e.nulla) };
  }

  /* — disco grande: A1, B1, PREZZO — */
  if (composizioni.slide.errore) {
    esiti.push({ id: 'A1', nome: 'la correzione della deriva non scivola', ok: null, ctx: 'composizione fallita' });
    esiti.push({ id: 'B1', nome: 'il trascinamento voluto scivola', ok: null, ctx: 'composizione fallita' });
    stampa('A1/B1) SALTATE: ' + composizioni.slide.errore.split('\n')[0]);
  } else {
    const { pag, cdp, passo } = await apri(composizioni.slide.file);
    const a1 = []; for (const d of DIR20) a1.push(await provaSlide(pag, cdp, passo, 'correzione', d, 32));
    const b1 = []; for (const d of DIR8) b1.push(await provaSlide(pag, cdp, passo, 'apposta', d, 60));
    const pr = []; for (const d of [180, 202.5, 225, 247.5].map(g => g * Math.PI / 180)) pr.push(await provaSlide(pag, cdp, passo, 'apposta', d, 33));
    await pag.close();
    const rA = riassunto('A1', a1), rB = riassunto('B1', b1), rP = riassunto('PREZZO', pr);
    const okA = rA.valide >= 18 && rA.armate === 0;
    const okB = rB.valide >= 7 && rB.armate === rB.valide;
    esiti.push({ id: 'A1', nome: 'la correzione della deriva non scivola', ok: okA });
    esiti.push({ id: 'B1', nome: 'il trascinamento voluto scivola ancora', ok: okB });
    stampa('A1) DERIVA E CORREZIONE sul disco grande — tenuta 0,7 s, deriva 32 px, furto, ritorno alla posa, rilascio');
    stampa('    scivolate dal rilascio: ' + rA.armate + ' su ' + rA.valide + ' prove valide (' + rA.nulle + ' nulle' + (rA.perche.length ? ': ' + rA.perche.join(' | ') : '') + ')');
    stampa('    contesto del motore al rilascio: R_ARMA ' + n2(rA.rArmaMin) + '..' + n2(rA.rArmaMax) + ' px · spostamento letto ' + n2(rA.lMin) + '..' + n2(rA.lMax) + ' px');
    stampa('    atteso: 0 scivolate  ->  ' + (okA ? 'VERDE' : 'ROSSO'));
    stampa('B1) TRASCINAMENTO VOLUTO di 60 px dopo il ri-armo — la scivolata deve uscire');
    stampa('    scivolate: ' + rB.armate + ' su ' + rB.valide + ' (' + rB.nulle + ' nulle)  ·  atteso: tutte  ->  ' + (okB ? 'VERDE' : 'ROSSO'));
    stampa('PREZZO (stampato, non giudicato): trascinamento voluto di 33 px, ~0,3 s dopo il ri-armo');
    stampa('    scivolate: ' + rP.armate + ' su ' + rP.valide + '  ·  R_ARMA al rilascio ' + n2(rP.rArmaMin) + '..' + n2(rP.rArmaMax) + ' px');
    stampa('');
  }

  /* — disco piccolo, raddoppio: A2, B2 — */
  if (composizioni.swap.errore) {
    esiti.push({ id: 'A2', nome: 'la correzione della deriva non comanda un raddoppio', ok: null, ctx: 'composizione fallita' });
    esiti.push({ id: 'B2', nome: 'il trascinamento voluto comanda il raddoppio', ok: null, ctx: 'composizione fallita' });
    stampa('A2/B2) SALTATE: ' + composizioni.swap.errore.split('\n')[0]);
  } else {
    const { pag, cdp, passo } = await apri(composizioni.swap.file);
    const a2 = []; for (const d of DIR20) a2.push(await provaPiccolo(pag, cdp, passo, 'swap', 'correzione', d, 32));
    const b2 = []; for (const d of DIR8) b2.push(await provaPiccolo(pag, cdp, passo, 'swap', 'apposta', d, 60));
    await pag.close();
    const rA = riassunto('A2', a2), rB = riassunto('B2', b2);
    const okA = rA.valide >= 18 && rA.armate === 0;
    const okB = rB.valide >= 7 && rB.armate === rB.valide;
    esiti.push({ id: 'A2', nome: 'la correzione della deriva non comanda un raddoppio', ok: okA });
    esiti.push({ id: 'B2', nome: 'il trascinamento voluto comanda il raddoppio', ok: okB });
    stampa('A2) DERIVA E CORREZIONE sul disco piccolo — CAMBIO tenuto, palla data (->PASSAGGIO) e rubata (->CAMBIO), correzione, rilascio');
    stampa('    raddoppi dal rilascio: ' + rA.armate + ' su ' + rA.valide + ' prove valide (' + rA.nulle + ' nulle' + (rA.perche.length ? ': ' + rA.perche.join(' | ') : '') + ')');
    stampa('    contesto del motore al rilascio: R_ARMA ' + n2(rA.rArmaMin) + '..' + n2(rA.rArmaMax) + ' px · spostamento letto ' + n2(rA.lMin) + '..' + n2(rA.lMax) + ' px');
    stampa('    atteso: 0 raddoppi  ->  ' + (okA ? 'VERDE' : 'ROSSO'));
    stampa('B2) TRASCINAMENTO VOLUTO di 60 px dopo il ri-armo — il raddoppio deve uscire');
    stampa('    raddoppi: ' + rB.armate + ' su ' + rB.valide + ' (' + rB.nulle + ' nulle)  ·  atteso: tutti  ->  ' + (okB ? 'VERDE' : 'ROSSO'));
    stampa('');
  }

  /* — disco piccolo, passaggio: A3, B3 — */
  if (composizioni.through.errore) {
    esiti.push({ id: 'A3', nome: 'la correzione della deriva non produce passaggi ne\' chiamate', ok: null, ctx: 'composizione fallita' });
    esiti.push({ id: 'B3', nome: 'il passaggio normale funziona ancora', ok: null, ctx: 'composizione fallita' });
    stampa('A3/B3) SALTATE: ' + composizioni.through.errore.split('\n')[0]);
  } else {
    const { pag, cdp, passo } = await apri(composizioni.through.file);
    const a3 = []; for (const d of DIR20) a3.push(await provaPiccolo(pag, cdp, passo, 'through', 'correzione', d, 32));
    const b3 = []; for (const d of DIR8) b3.push(await provaPassaggioNormale(pag, cdp, passo, d));
    await pag.close();
    const rA = riassunto('A3', a3), rB = riassunto('B3', b3);
    const okA = rA.valide >= 18 && rA.armate === 0;
    const okB = rB.valide >= 7 && rB.armate === rB.valide;
    esiti.push({ id: 'A3', nome: 'la correzione della deriva non produce passaggi ne\' chiamate', ok: okA });
    esiti.push({ id: 'B3', nome: 'il passaggio normale (mai ri-armato) funziona ancora', ok: okB });
    stampa('A3) DERIVA E CORREZIONE sul disco piccolo — CAMBIO tenuto, palla data (->PASSAGGIO), correzione, rilascio');
    stampa('    calci/pose/chiamate fantasma: ' + rA.armate + ' su ' + rA.valide + ' prove valide (' + rA.nulle + ' nulle' + (rA.perche.length ? ': ' + rA.perche.join(' | ') : '') + ')');
    stampa('    NOTA MISURATA: con la L1.4 di oggi il rilascio del PASSAGGIO pretende una posa che solo la');
    stampa('    pressione apre (a.passa) e che nessun ri-armo apre: qui ci si aspetta 0 ANCHE SENZA guardia.');
    stampa('    La prova sorveglia il giorno in cui quel vincolo cambiasse.');
    stampa('    atteso: 0  ->  ' + (okA ? 'VERDE' : 'ROSSO'));
    stampa('B3) PASSAGGIO NORMALE senza ri-armo — pressione su PASSAGGIO, tenuta 0,75 s, trascinamento 60 px, rilascio');
    stampa('    calci usciti: ' + rB.armate + ' su ' + rB.valide + ' (' + rB.nulle + ' nulle)  ·  atteso: tutti  ->  ' + (okB ? 'VERDE' : 'ROSSO'));
    stampa('');
  }

  await br.close(); srv.chiudi();

  /* — D: la non-regressione del ri-armo stesso, _q-l11.js 8/8 — */
  if (SENZA_L11) {
    esiti.push({ id: 'D', nome: '_q-l11.js sul file in esame', ok: null, ctx: 'saltata con --senza-l11' });
    stampa('D) _q-l11.js: SALTATA (--senza-l11). L\'esito D e\' NON PROVATO, non verde.');
  } else {
    stampa('D) _q-l11.js sul file in esame (il ri-armo deve restare vivo: C1, C2, C3 comprese)...');
    const r = spawnSync(process.execPath, [path.join(__dirname, '_q-l11.js'), '--gioco', GIOCO],
                        { encoding: 'utf8', timeout: 10 * 60 * 1000 });
    const coda = (r.stdout || '').trim().split('\n').slice(-3).join('\n   ');
    stampa('   ' + coda);
    const ok = r.status === 0;
    esiti.push({ id: 'D', nome: '_q-l11.js sul file in esame', ok });
    stampa('   atteso: esce 0  ->  ' + (ok ? 'VERDE' : 'ROSSO (esce ' + r.status + ')'));
  }
  stampa('');

  const rossi = esiti.filter(e => e.ok === false);
  const nulle = esiti.filter(e => e.ok === null);
  const verdi = esiti.filter(e => e.ok === true);
  stampa('--- ESITO ---');
  for (const e of esiti) stampa('  ' + (e.ok === null ? 'NULLA' : (e.ok ? 'VERDE' : 'ROSSO')) + '  ' + e.id + '  ' + e.nome + (e.ctx ? '  (' + e.ctx + ')' : ''));
  if (eccezioni.length) stampa('  eccezioni in pagina: ' + eccezioni.length + ' — ' + eccezioni.slice(0, 3).join(' | '));
  stampa('verdi ' + verdi.length + ' · rossi ' + rossi.length + ' · nulle ' + nulle.length + ' · su ' + esiti.length);
  if (rossi.length) stampa('CANCELLO ROSSO: ' + rossi.length + ' controlli falliti.');
  else if (nulle.length) stampa('CANCELLO NON CONCLUSO: ' + nulle.length + ' prove nulle o saltate.');
  else stampa('CANCELLO VERDE: ' + esiti.length + ' controlli su ' + esiti.length + '.');
  try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (e) {}
  process.exit(rossi.length ? 1 : (nulle.length ? 3 : 0));
})().catch(e => { console.error('FALLITO: ' + (e && e.stack || e)); try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (x) {} process.exit(2); });
