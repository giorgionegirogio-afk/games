/* =====================================================================
   _q-l15.js — IL CANCELLO DEL CAMBIO UOMO (voce L1.5 di
   _analisi/agente28.md §10, riga «disco vicino senza palla»).

   Sorveglia CINQUE proprieta', e nessuna di piu':

     A) LA DIREZIONE. Con la levetta spinta in otto direzioni, l'uomo che
        passa sotto il pollice deve essere quello che sta IN QUELLA
        DIREZIONE, e l'errore si misura sull'ANGOLO. Girato a 5 (tre
        candidati a 120 gradi l'uno dall'altro) e a 11 (otto candidati a
        45 gradi), perche' il §13.4 del progetto dichiara che niente e'
        stato verificato oltre il 5 contro 5.
     B) LA LATENZA. Il cambio spara ALLA PRESSIONE: al PRIMO fotogramma
        simulato dopo il tocco l'uomo nuovo deve gia' rispondere al
        pollice. Un fotogramma di ritardo si vede, perche' al primo passo
        risponderebbe ancora il vecchio.
     C) IL RADDOPPIO. Il compagno indicato dal trascinamento deve
        CAMBIARE COMPORTAMENTO: la sua distanza dal portatore avversario,
        misurata prima e dopo, contro un braccio di controllo identico in
        cui il dito preme e rilascia SENZA trascinare.
     D) NON REGRESSIONE. Senza levetta e senza trascinamento il cambio
        deve comunque dare un uomo — uno dei miei, mai il portiere, mai
        nessuno, mai lo stesso di prima.
     E) LA LEGGE 4 SUL DISCO DEL CAMBIO. Nessun tocco su questo disco
        produce mai un calcio o una scivolata, e un touchcancel con il
        trascinamento armato NON comanda il raddoppio.

   ---------------------------------------------------------------------
   COME SI LEGGE UN VERDETTO QUI DENTRO, ED E' LA PARTE CHE CONTA.

   «Chi sto comandando» e' una domanda che il gioco tiene in G.ctrl[t], e
   G.ctrl[t] LO SCRIVE ESATTAMENTE IL CODICE CHE QUESTO CANCELLO GIUDICA.
   Leggerlo come verdetto sarebbe la trappola numero uno di casa: una
   toppa che scrivesse l'indice giusto e non spostasse un uomo passerebbe
   in verde.

   Percio' l'uomo comandato qui NON si legge: si SCOPRE, dall'effetto.
   Due pagine identiche — stesso file, stesso seme, stessa scena scritta
   in chiaro, stessi eventi di tocco fino all'ultimo pixel — ricevono UNA
   sola differenza: dopo la pressione il pollice sinistro della pagina A
   resta sulla direzione D e quello della pagina B va su -D. Poi tutte e
   due fanno correre gli stessi fotogrammi. L'uomo comandato e' quello che
   nelle due pagine FINISCE IN DUE POSTI DIVERSI: e' l'unico che il
   pollice muove. Tutti gli altri, con le stesse decisioni e lo stesso
   flusso di sorteggi, si muovono uguali.
   Da qui vengono i verdetti A, B e D. G.ctrl si stampa accanto come
   contesto, e se non e' d'accordo con l'effetto il referto lo dice.

   Il verdetto C sta su una DISTANZA in unita' di campo, e il verdetto E
   su due contatori installati sopra kickBall e startSlide — le funzioni
   del gioco, non del codice giudicato.

   ---------------------------------------------------------------------
   IL CONTROLLO NEGATIVO. Uno strumento che non e' stato visto fallire non
   e' uno strumento. Questo cancello si sa rompere in tre modi, e li porta
   scritti dentro:
     · sul gioco di oggi (il ciclo orario) A e C sono ROSSI;
     · «--sabota inverso» serve alla pagina una toppa in cui la direzione
       e' presa al contrario: A diventa rosso e B, C, D, E restano verdi,
       cioe' la prova che A misura l'angolo e non la presenza del codice;
     · «--sabota sordo» serve una toppa in cui l'ordine di raddoppio viene
       eseguito e messo a zero: C diventa rosso e gli altri restano verdi.
   Se il testo da sabotare non c'e' (file non toppato) lo strumento ERRA
   con il codice del banco, e non dice «verde».

   ---------------------------------------------------------------------
   uso:
     node strumenti/_q-l15.js                      (sul gioco di casa)
     node strumenti/_q-l15.js --gioco fuori/l15.html
     node strumenti/_q-l15.js --gioco X --sabota inverso
     node strumenti/_q-l15.js --misura             (il censimento, sotto)
     node strumenti/_q-l15.js --testa              (finestra visibile)

   --misura non da' verdetti: e' il CENSIMENTO che serviva prima di
   toccare il codice. Un robot gioca la partita col pollice sinistro
   sempre giu' (il vincolo fisico del progetto), preme il disco del cambio
   quando il disco dice CAMBIO, e ogni volta registra dove puntava la
   levetta e quale uomo gli e' arrivato sotto il pollice. Si gira sul
   gioco di oggi e sulla copia toppata, e le due colonne si confrontano.

   codici d'uscita: 0 tutti verdi · 1 almeno un rosso · 2 il banco e'
   esploso o e' invecchiato · 3 nessun rosso ma almeno una prova nulla.
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
const haFlag = n => process.argv.indexOf('--' + n) > 0;
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'CALCETTO-il-gioco.html')));
const TESTA = haFlag('testa');
const MISURA = haFlag('misura');
const SABOTA = arg('sabota', '');
const SEME = 20260820;
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
               '.png': 'image/png', '.json': 'application/json' };

/* I TRE SABOTAGGI. Non toccano nessun file: riscrivono il testo mentre la
   pagina lo scarica. Ognuno e' una toppa PLAUSIBILE e SBAGLIATA — non un
   codice rotto — perche' un controllo negativo che spegne tutto non
   dimostra niente sulla precisione della misura. */
const SABOTAGGI = {
  inverso: { cerca: 'const par=vx*ux+vy*uy;', metti: 'const par=-(vx*ux+vy*uy);',
             dice: 'la direzione presa al contrario' },
  sordo:   { cerca: 'G.players[k].raddoppio=RADDOPPIO_T;', metti: 'G.players[k].raddoppio=0;',
             dice: 'l\'ordine di raddoppio eseguito e azzerato' },
};

function servi() {
  let testo = fs.readFileSync(GIOCO, 'utf8');
  if (SABOTA) {
    const s = SABOTAGGI[SABOTA];
    if (!s) { console.error('FALLITO: sabotaggio sconosciuto «' + SABOTA + '». Ci sono: ' + Object.keys(SABOTAGGI).join(', ')); process.exit(2); }
    const n = testo.split(s.cerca).length - 1;
    if (n !== 1) {
      console.error('FALLITO: il sabotaggio «' + SABOTA + '» non si puo\' applicare — il testo\n  ' + s.cerca +
                    '\ncompare ' + n + ' volte in ' + GIOCO + ' (ne serve esattamente 1).');
      console.error('  Questo file non e\' toppato con L1.5, oppure la toppa e\' cambiata: da riparare e\' il BANCO.');
      process.exit(2);
    }
    testo = testo.replace(s.cerca, s.metti);
  }
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (/CALCETTO-il-gioco\.html$/i.test(f)) {
        res.writeHead(200, { 'Content-Type': TIPI['.html'], 'Cache-Control': 'no-store' });
        res.end(testo); return;
      }
      if (!f.startsWith(RADICE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('no'); return; }
      res.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* il tempo in mano al banco. La simulazione avanza con __test.simulate,
   che e' l'unico passo fisso del gioco (DT esatto) e chiama step(), cioe'
   anche Touch5.passo: le tenute e il ri-armo battono li' dentro. Il
   requestAnimationFrame resta finto e fermo, cosi' nessun fotogramma
   arriva per conto suo a sfasare due pagine che devono restare gemelle. */
function bancoDiProva() {
  const PASSO = 1000 / 60;
  let t = 0, coda = [];
  window.requestAnimationFrame = cb => { coda.push(cb); return coda.length; };
  window.cancelAnimationFrame = () => {};
  try { performance.now = () => t; } catch (e) {}
  window.__banco = { passo(n) {
    n = Math.max(0, Math.round(+n || 0));
    for (let i = 0; i < n; i++) { const c = coda; coda = []; t += PASSO; for (const f of c) { try { f(t); } catch (e) {} } }
    return t;
  } };
}

/* LE DITA. Protocollo CDP: per touchStart e touchMove si manda la lista
   di TUTTE le dita vive, per touchEnd/touchCancel solo quello che si
   alza. Verificato al banco: mandando la lista dei rimasti al touchEnd si
   alzava il dito sbagliato — la levetta invece del disco. */
function Mano(cdp) {
  const p = new Map();
  const lista = () => [...p.entries()].map(([id, q]) => ({ x: q.x, y: q.y, id: id }));
  return {
    async giu(id, x, y) { p.set(id, { x, y }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: lista() }); },
    async muovi(id, x, y) { p.set(id, { x, y }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: lista() }); },
    async su(id) { const q = p.get(id); if (!q) return; p.delete(id); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [{ x: q.x, y: q.y, id }] }); },
    /* IL PROTOCOLLO NON SA ANNULLARE UN DITO SOLO: «TouchCancel must not
       have any touch points». Quando il sistema si prende lo schermo se
       li prende TUTTI, ed e' anche quello che succede davvero con il
       gesto indietro di Android. Chi lo usa qui dentro rimette giu' il
       pollice sinistro subito dopo, se no la prova misurerebbe la levetta
       spenta invece dell'annullo del disco. */
    async annullaTutto() { p.clear(); await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] }); },
    ha(id) { return p.has(id); },
  };
}

/* ---------------------------------------------------------------------
   LA SONDA. Avvolge kickBall (l'imbuto unico di tutti i calci, lo dice il
   gioco stesso) e startSlide (l'imbuto unico delle scivolate, umane e
   IA). Non decide niente: conta, e dice di chi era il piede.
   --------------------------------------------------------------------- */
function installaSonda() {
  if (window.__sonda) return 'gia';
  if (typeof window.kickBall !== 'function')
    return 'BANCO INVECCHIATO: window.kickBall non esiste piu\'.';
  if (typeof window.startSlide !== 'function')
    return 'BANCO INVECCHIATO: window.startSlide non esiste piu\'.';
  const G = window.__test.G;
  const S = { calci: [], scivolate: [] };
  window.__sonda = S;
  const ok = window.kickBall;
  window.kickBall = function (p, nx, ny, speed, spinY) {
    const r = ok.call(this, p, nx, ny, speed, spinY);
    if (r) S.calci.push({ chi: G.players.indexOf(p), team: p.team });
    return r;
  };
  const os = window.startSlide;
  window.startSlide = function (p, nx, ny) {
    const prima = p.slide;
    const r = os.call(this, p, nx, ny);
    if (p.slide >= 0 && prima < 0) S.scivolate.push({ chi: G.players.indexOf(p), team: p.team });
    return r;
  };
  return 'ok';
}

/* la partita in gioco, alla taglia chiesta */
function avvia(taglia) {
  const t = window.__test, G = t.G;
  try { t.dismissSplash && t.dismissSplash(); } catch (e) {}
  t.setPaused && t.setPaused(false);
  try { if (t.Tut && t.Tut.active && t.Tut.finish) t.Tut.finish(true); } catch (e) {}
  t.startMatch(1, 1, { size: taglia });
  for (let i = 0; i < 200 && G.scene !== 'play'; i++) t.simulate(0.1);
  if (G.scene !== 'play') return { errore: "la partita non arriva in gioco: scena '" + G.scene + "'" };
  t.setTimeLeft && t.setTimeLeft(80);
  const bt = t.pulsanti(0);
  const piccolo = bt.reduce((a, c) => (c.r || 0) < (a.r || 0) ? c : a, bt[0]);
  const sotto = document.elementFromPoint(piccolo.x, piccolo.y);
  if (!sotto || sotto.id !== 'gioco')
    return { errore: 'sul disco (' + piccolo.x + ',' + piccolo.y + ') non c\'e\' la tela ma ' + (sotto ? sotto.tagName + '#' + sotto.id : 'niente') };
  return { taglia: t.campo.taglia, FW: t.campo.FW, FH: t.campo.FH, disco: piccolo, dischi: bt };
}

/* =====================================================================
   LA SCENA, scritta in chiaro e uguale nelle due pagine gemelle.
   Il comandato al centro; il portatore avversario con la palla a
   «dPalla» unita' da lui (oltre KICK_R, se no il disco piccolo direbbe
   PASSAGGIO e non CAMBIO); i compagni sulle direzioni chieste; gli altri
   avversari parcheggiati lontano.
   aiT porta il tempo di reazione dell'IA piu' avanti della finestra di
   misura: nei fotogrammi che contano nessun compagno RIPENSA, quindi
   nessuno pesca un numero casuale e le due pagine restano gemelle fino
   all'ultimo bit tranne che per il pollice.
   ===================================================================== */
function scena(c) {
  const t = window.__test, G = t.G, FW = t.campo.FW, FH = t.campo.FH;
  if (window.__seme) window.__seme(c.seme);
  const miei = [], loro = [];
  G.players.forEach((p, i) => { if (p.role !== 'gk') (p.team === 0 ? miei : loro).push(i); });
  if (miei.length < 2 || loro.length < 1) return { errore: 'squadre troppo corte' };
  const pi = miei[0];
  G.ctrl[0] = pi; G.swLock[0] = 0; G.swTimer[0] = 0;
  const cx = FW / 2, cy = FH / 2;
  for (const i of miei.concat(loro)) {
    const p = G.players[i];
    p.vx = 0; p.vy = 0; p.ax = 0; p.ay = 0; p.slide = -1; p.recover = 0; p.kickCd = 0;
    if (p.charge >= 0) { p.charge = -1; p.chargeGo = null; p.chargeT = 0; p.chargeClip = null; }
    p.corsaArea = 0; p.raddoppio = 0; p.contieni = false; p.contieniT = 0;
    p.out = 0; p.fiato = 100; p.rove = -1; p.aiT = c.aiT;
    /* «ha appena deciso»: aiCarrier non ripensa prima di aiActT, quindi
       il portatore avversario tiene il pallone invece di scaricarlo al
       primo fotogramma. Senza questa riga il banco ha misurato per una
       corsa intera un raddoppio che non poteva partire — al rilascio il
       pallone era gia' di nessuno e non c'era nessun portatore da
       raddoppiare. E' uno stato normale del gioco, non un trucco: un
       portatore che ha appena scelto di portare palla. */
    if (c.aiActT !== undefined) p.aiActT = c.aiActT;
  }
  /* il cambio AUTOMATICO tenuto fermo: la prova misura chi va a
     raddoppiare, non chi sta sotto il pollice, e un cambio automatico in
     mezzo alla finestra sposterebbe il comando su un uomo che stiamo
     misurando. Vale identico in tutti i bracci. */
  if (c.swLock !== undefined) G.swLock[0] = c.swLock;
  G.players[pi].x = cx; G.players[pi].y = cy;
  const R = c.raggio;
  for (let k = 1; k < miei.length; k++) {
    const avanzo = (k - 1) >= c.angoli.length;
    /* i compagni in piu' rispetto alle direzioni chieste non si mettono
       sulle stesse direzioni: andrebbero a pareggiare con i candidati
       veri e la prova non avrebbe piu' una risposta sola. Vanno lontani e
       in mezzo, a meta' fra due direzioni. */
    const a = (c.angoli[(k - 1) % c.angoli.length] + (avanzo ? 22.5 : 0)) * Math.PI / 180;
    const rr = avanzo ? R * 1.9 : R;
    G.players[miei[k]].x = Math.max(30, Math.min(FW - 30, cx + rr * Math.cos(a)));
    G.players[miei[k]].y = Math.max(30, Math.min(FH - 30, cy + rr * Math.sin(a)));
  }
  const ap = c.angoloPalla * Math.PI / 180;
  const ladro = loro[0];
  G.players[ladro].x = cx + c.dPalla * Math.cos(ap);
  G.players[ladro].y = cy + c.dPalla * Math.sin(ap);
  const parch = (c.parcheggio === undefined ? 0.86 : c.parcheggio);
  for (let k = 1; k < loro.length; k++) {
    G.players[loro[k]].x = FW * parch; G.players[loro[k]].y = 40 + (k * 97) % (FH - 80);
  }
  for (const i of miei.concat(loro)) { const p = G.players[i]; p.aiTX = p.x; p.aiTY = p.y; }
  const b = G.ball;
  b.owner = ladro; b.x = G.players[ladro].x; b.y = G.players[ladro].y;
  b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0; b.passTo = -1; b.crossTo = -1; b.curve = 0; b.perfectT = 0;
  G.brain[0].t = 0; G.brain[0].ruoloT = 0; G.brain[1].t = 0; G.brain[1].ruoloT = 0;
  window.__sonda.calci = []; window.__sonda.scivolate = [];
  return {
    pi, miei, loro, ladro,
    pos: G.players.map(p => ({ x: p.x, y: p.y })),
    disco: t.pulsanti(0).reduce((a, q) => (q.r || 0) < (a.r || 0) ? q : a, t.pulsanti(0)[0]),
  };
}

/* la fotografia: dove stanno tutti, chi ha il pallone, cosa hanno fatto i
   piedi. E' l'unica cosa che il banco legge per decidere. */
function fotografia() {
  const G = window.__test.G, S = window.__sonda;
  return {
    pos: G.players.map(p => ({ x: p.x, y: p.y, team: p.team, gk: p.role === 'gk', out: p.out })),
    ctrl: G.ctrl[0], owner: G.ball.owner, palla: { x: G.ball.x, y: G.ball.y },
    calci: S.calci.slice(), scivolate: S.scivolate.slice(),
    disco: window.__test.pulsanti(0).reduce((a, q) => (q.r || 0) < (a.r || 0) ? q : a, window.__test.pulsanti(0)[0]).act,
  };
}

const GRADI = r => r * 180 / Math.PI;
const ang = (x, y) => Math.atan2(y, x) * 180 / Math.PI;
const dAng = (a, b) => { let d = a - b; while (d > 180) d -= 360; while (d < -180) d += 360; return Math.abs(d); };
const n2 = v => (v === null || v === undefined || !isFinite(v)) ? 'n/d' : (Math.round(v * 100) / 100).toString().replace('.', ',');
const mediana = a => { if (!a.length) return null; const b = a.slice().sort((x, y) => x - y); const m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; };

const CASA = { x: 165, y: 272 };     // erba, lontano dai due dischi
const DITO_L = 1, DITO_R = 2;        // pollice sinistro (levetta) e destro (dischi)
const SPINTA = 40;                   // px di levetta: oltre STICK_DEAD 12, sotto STICK_SPRINT 66

/* =====================================================================
   IL BANCO A DUE PAGINE GEMELLE.
   ===================================================================== */
(async () => {
  const srv = await servi();
  const br = await chromium.launch({ headless: !TESTA });
  const ctx = await br.newContext({ viewport: { width: 915, height: 412 },
    deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const eccezioni = [];

  async function apri(taglia, levettaGiu) {
    const pag = await ctx.newPage();
    await pag.addInitScript(seme => {
      let s = seme >>> 0 || 1;
      const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
      Math.random = () => p() / 4294967296;
      window.__seme = n => { s = (n >>> 0) || 1; };
    }, SEME);
    await pag.addInitScript(bancoDiProva);
    pag.on('pageerror', e => eccezioni.push(e.message));
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(() => window.__banco.passo(6));
    const s = await pag.evaluate(installaSonda);
    if (s !== 'ok' && s !== 'gia') { console.error('FALLITO: ' + s); process.exit(2); }
    const cdp = await ctx.newCDPSession(pag);
    const q = await pag.evaluate(avvia, taglia);
    if (q.errore) throw new Error('avvio: ' + q.errore);
    const mano = Mano(cdp);
    /* IL POLLICE SINISTRO SI POSA E NON SI ALZA PIU'. E' il vincolo
       fisico del progetto: ogni banco che alza quel dito misura un gioco
       che non esiste. */
    if (levettaGiu) await mano.giu(DITO_L, CASA.x, CASA.y);
    const passo = n => pag.evaluate(k => window.__test.simulate(k / 60), n);
    return { pag, cdp, mano, passo, q,
             foto: () => pag.evaluate(fotografia),
             prep: c => pag.evaluate(scena, c) };
  }

  const esiti = [];
  const righe = [];
  const stampa = s => { righe.push(s); console.log(s); };

  /* -------------------------------------------------------------------
     IL DUELLO. Una prova, due pagine gemelle, una sola differenza.
     Torna l'indice dell'uomo che il pollice muove davvero, con il margine
     su cui l'ha vinta: se il margine e' magro la prova e' NULLA, perche'
     vuol dire che il banco non e' riuscito a isolare una causa sola.
     ------------------------------------------------------------------- */
  function chiSiMuove(fA, fB) {
    const d = fA.pos.map((p, i) => Math.hypot(p.x - fB.pos[i].x, p.y - fB.pos[i].y));
    let k = -1, best = -1, secondo = -1;
    d.forEach((v, i) => { if (v > best) { secondo = best; best = v; k = i; } else if (v > secondo) secondo = v; });
    return { chi: k, scarto: best, secondo: Math.max(0, secondo) };
  }

  /* QUANDO LA PROVA E' VALIDA. Non una soglia in unita' — a un fotogramma
     dalla pressione lo scarto vero e' di un decimo di unita' e sarebbe
     scambiato per rumore — ma una DOMINANZA: il primo deve valere almeno
     tre volte il secondo, e il secondo, quando le due pagine sono davvero
     gemelle, viene zero esatto. Se due uomini si muovono diverso, il
     banco non ha isolato una causa sola e la prova e' NULLA. */
  const valida = m => m.scarto >= 0.05 && m.scarto >= 3 * m.secondo;

  async function duello(pagine, cfg, fotogrammi, opts) {
    opts = opts || {};
    const out = [];
    for (let i = 0; i < 2; i++) {
      const P = pagine[i];
      const s = await P.prep(cfg);
      if (s.errore) throw new Error('scena: ' + s.errore);
      /* la levetta alla direzione chiesta (o ferma, se la prova la vuole
         ferma: allora il dito resta giu' e non si muove abbastanza per
         essere promosso — 3 px, sotto i 6 della promozione) */
      const d0 = cfg.levetta;
      if (d0) await P.mano.muovi(DITO_L, CASA.x + SPINTA * d0[0], CASA.y + SPINTA * d0[1]);
      else await P.mano.muovi(DITO_L, CASA.x + 3, CASA.y);
      const prima = await P.foto();
      if (prima.disco !== 'swap') return { nulla: 'il disco piccolo offre «' + prima.disco + '» invece di «swap»' };
      await P.mano.giu(DITO_R, s.disco.x, s.disco.y);
      /* il trascinamento sul disco, se la prova ne vuole uno */
      if (opts.trascina) {
        for (let k = 1; k <= 6; k++) {
          await P.passo(1);
          await P.mano.muovi(DITO_R, s.disco.x + opts.trascina[0] * opts.lung * k / 6,
                                     s.disco.y + opts.trascina[1] * opts.lung * k / 6);
        }
        /* si tiene fermo mezzo decimo: la lettura del distacco scarta gli
           ultimi 60 ms, quindi un trascinamento appena finito non c'e'
           ancora tutto nell'anello (misurato: 15 px su 45 senza l'attesa) */
        await P.passo(6);
      } else if (opts.tieni) { await P.passo(opts.tieni); }
      /* LA DIFFERENZA, e l'unica: la pagina B manda il pollice sinistro
         dall'altra parte. Succede DOPO la pressione, quindi il cambio nelle
         due pagine ha letto la stessa levetta. */
      if (i === 1 && cfg.levetta) await P.mano.muovi(DITO_L, CASA.x - SPINTA * cfg.levetta[0], CASA.y - SPINTA * cfg.levetta[1]);
      if (i === 1 && !cfg.levetta && opts.sonda) await P.mano.muovi(DITO_L, CASA.x - SPINTA * opts.sonda[0], CASA.y - SPINTA * opts.sonda[1]);
      if (i === 0 && !cfg.levetta && opts.sonda) await P.mano.muovi(DITO_L, CASA.x + SPINTA * opts.sonda[0], CASA.y + SPINTA * opts.sonda[1]);
      if (opts.rilascia === 'fine') await P.mano.su(DITO_R);
      else if (opts.rilascia === 'annulla') await P.mano.annulla(DITO_R);
      await P.passo(fotogrammi);
      const dopo = await P.foto();
      if (P.mano.ha(DITO_R)) await P.mano.su(DITO_R);
      out.push({ scena: s, prima, dopo });
    }
    const m = chiSiMuove(out[0].dopo, out[1].dopo);
    return { A: out[0], B: out[1], moto: m };
  }

  /* ===================================================================== */
  if (MISURA) { await censimento(); await br.close(); srv.chiudi(); return; }

  stampa('=== CANCELLO L1.5 — il cambio uomo: direzione, latenza, raddoppio ===');
  stampa('  gioco: ' + GIOCO);
  if (SABOTA) stampa('  SABOTAGGIO ATTIVO: «' + SABOTA + '» — ' + SABOTAGGI[SABOTA].dice + ' (controllo negativo)');
  stampa('  banco: due pagine gemelle Chromium 915x412 dpr2, dita di protocollo,');
  stampa('         passo fisso 1/60 via __test.simulate, seme ' + SEME + '.');
  stampa('         L\'uomo comandato non si legge da G.ctrl: si scopre da CHI SI MUOVE.');
  stampa('');

  /* -------------------------------------------------------------------
     A — LA DIREZIONE.
     ------------------------------------------------------------------- */
  async function provaDirezione(taglia, nCand, giri, fotogrammi, titolo) {
    const pagine = [await apri(taglia, true), await apri(taglia, true)];
    const FW = pagine[0].q.FW, FH = pagine[0].q.FH;
    const R = Math.min(FH * 0.30, FW * 0.16);
    const righeP = [];
    let colpi = 0, nulle = 0, tot = 0, nessunCambio = 0;
    const errori = [];
    for (let g = 0; g < giri; g++) {
      for (let d = 0; d < 8; d++) {
        const dir = d * 45;                       // le otto direzioni
        /* LA GEOMETRIA NON RUOTA, RUOTA L'ASSEGNAZIONE. I candidati stanno
           sempre a 360/n gradi l'uno dall'altro con uno esattamente sulla
           direzione chiesta; a ogni giro pero' cambia QUALE INDICE di
           G.players ci finisce sopra. Cosi' una scelta che non guarda la
           levetta — un ciclo, o «sempre il primo» — non puo' azzeccare per
           abitudine, e la prova resta identica al grado. */
        const angoli = [];
        for (let k = 0; k < nCand; k++) angoli.push(dir + ((((k - g) % nCand) + nCand) % nCand) * 360 / nCand);
        const ATTESO = 1 + (g % nCand);          // quale compagno sta sulla direzione
        const rad = dir * Math.PI / 180;
        const cfg = { seme: SEME + g * 100 + d, aiT: 0.5, raggio: R, angoli,
                      angoloPalla: 22.5 + dir, dPalla: 62,
                      levetta: [Math.cos(rad), Math.sin(rad)] };
        const r = await duello(pagine, cfg, fotogrammi, {});
        tot++;
        if (r.nulla) { nulle++; righeP.push('      dir ' + dir + ' giro ' + g + ': PROVA NULLA — ' + r.nulla); continue; }
        const s = r.A.scena;
        const attesoIdx = s.miei[ATTESO];
        const vecchio = s.pi;
        const m = r.moto;
        if (!valida(m)) {
          nulle++;
          righeP.push('      dir ' + dir + ' giro ' + g + ': PROVA NULLA — primo ' + n2(m.scarto) +
                      ' unita\', secondo ' + n2(m.secondo) + ': il banco non isola un uomo solo');
          continue;
        }
        const p0 = s.pos[vecchio], pm = s.pos[m.chi];
        const aUomo = ang(pm.x - p0.x, pm.y - p0.y);
        const err = (m.chi === vecchio) ? null : dAng(aUomo, dir);
        if (m.chi === vecchio) nessunCambio++;    // a rispondere e' ancora quello di prima
        else errori.push(err);
        const ok = m.chi === attesoIdx;
        if (ok) colpi++;
        if (!ok || g === 0)
          righeP.push('      dir ' + String(dir).padStart(3) + ' giro ' + g + ': si muove ' + m.chi +
                      ' (atteso ' + attesoIdx + ', G.ctrl dice ' + r.A.dopo.ctrl + ')' +
                      ' · errore angolare ' + (err === null ? 'n/d (nessun cambio)' : n2(err) + ' gradi') +
                      ' · scarto ' + n2(m.scarto) + ' contro ' + n2(m.secondo) + (ok ? '  OK' : '  NO'));
      }
    }
    for (const P of pagine) await P.pag.close();
    const med = mediana(errori);
    const oltre = errori.filter(e => e > 45).length;
    const buone = tot - nulle;
    const ok = nulle > 0 ? null : (colpi === tot && med !== null && med <= 5);
    /* LA LATENZA E' UN'ALTRA DOMANDA, e va tenuta separata: «a rispondere
       al pollice c'e' gia' un uomo NUOVO», che non dice niente su QUALE.
       Sul gioco di oggi e' verde — il ciclo orario spara alla pressione —
       ed e' esattamente per questo che va misurata da sola: la voce L1.5
       promette di non peggiorarla, e una misura che la impacchetta con la
       direzione non saprebbe distinguere un peggioramento da un difetto
       che non c'entra. */
    const okLat = nulle > 0 ? null : (nessunCambio === 0);
    stampa(titolo);
    stampa('   ' + colpi + ' su ' + tot + ' prove danno l\'uomo che sta nella direzione indicata' +
           (nulle ? ' · ' + nulle + ' prove nulle' : ''));
    stampa('   un uomo NUOVO risponde al pollice in ' + (buone - nessunCambio) + ' prove su ' + buone + ' valide');
    stampa('   errore angolare fra la levetta e l\'uomo che si muove: mediana ' + n2(med) +
           ' gradi · oltre 45 gradi ' + oltre + ' su ' + errori.length +
           (nessunCambio ? ' · nessun cambio in ' + nessunCambio + ' prove' : ''));
    for (const r of righeP.slice(0, 14)) stampa(r);
    if (righeP.length > 14) stampa('      (' + (righeP.length - 14) + ' righe in piu\' non stampate)');
    stampa('   soglia direzione: tutte le prove centrate e mediana <= 5 gradi  ->  ' + (ok === null ? 'PROVA NULLA' : (ok ? 'VERDE' : 'ROSSO')));
    stampa('   soglia latenza:   un uomo nuovo risponde in tutte le prove  ->  ' + (okLat === null ? 'PROVA NULLA' : (okLat ? 'VERDE' : 'ROSSO')));
    stampa('');
    return { ok, okLat, colpi, tot, med };
  }

  {
    const a5 = await provaDirezione(5, 3, 3, 10,
      'A) LA DIREZIONE a 5 contro 5 — tre compagni a 120 gradi, otto direzioni, tre giri');
    esiti.push({ id: 'A5', nome: 'il cambio va dove punta la levetta (taglia 5)', ok: a5.ok });
    const a11 = await provaDirezione(11, 8, 1, 10,
      'A2) LA DIREZIONE a 11 contro 11 — otto compagni a 45 gradi, otto direzioni');
    esiti.push({ id: 'A11', nome: 'il cambio va dove punta la levetta (taglia 11)', ok: a11.ok });
  }

  /* -------------------------------------------------------------------
     B — LA LATENZA: UN SOLO FOTOGRAMMA.
     ------------------------------------------------------------------- */
  {
    const b = await provaDirezione(5, 3, 1, 1,
      'B) LATENZA ZERO — lo stesso, ma la misura si chiude dopo UN fotogramma simulato');
    /* qui il verdetto e' quello della LATENZA, non quello della direzione:
       che al primo passo di simulazione dopo il tocco a rispondere al
       pollice ci sia gia' un uomo nuovo. Il numero della direzione lo
       stampa lo stesso, perche' e' gratis e dice se la direzione regge
       anche nel fotogramma zero. */
    esiti.push({ id: 'B', nome: 'il cambio spara alla pressione (un fotogramma)', ok: b.okLat });
  }

  /* -------------------------------------------------------------------
     C — IL RADDOPPIO, e il suo braccio di controllo.

     La scena e' costruita perche' la risposta sia la stessa comunque
     vada il cambio: il compagno T sta sulla semiretta del trascinamento e
     gli altri due stanno a duecento unita' da quella semiretta.
     ------------------------------------------------------------------- */
  async function provaRaddoppio() {
    /* TRE BRACCI SULLA STESSA SCENA, e la stessa scena vuol dire lo stesso
       seme, le stesse posizioni scritte a mano e lo stesso numero di
       fotogrammi:
         0  trascinamento + rilascio      -> l'ordine deve partire
         1  nessun trascinamento          -> il controllo: niente ordine
         2  trascinamento + touchcancel   -> P7: niente ordine
       Il verdetto C sta fra 0 e 1, il verdetto E2 fra 2 e 1. E2 ha senso
       solo se C e' verde: senza un ordine che funziona, il suo annullo non
       e' misurabile e la prova e' NULLA, non verde. */
    const pagine = [await apri(5, true), await apri(5, true), await apri(5, true)];
    const FW = pagine[0].q.FW, FH = pagine[0].q.FH;
    const R = Math.min(FH * 0.32, FW * 0.18);
    /* LA SCENA, e ogni pezzo ha dovuto guadagnarsi il posto. Costruirla e'
       stata la parte difficile di questo cancello, perche' tre cose
       diverse mascherano l'effetto che si vuole vedere, e le prime due le
       ho viste succedere al banco prima di toglierle:

       1. IL PORTATORE SCAPPA. Lasciato libero punta la propria porta e si
          porta via 190 unita' in un secondo e mezzo (misurato): la
          «distanza da lui» finisce per raccontare dove e' andato LUI. Qui
          il banco lo tiene fermo, in tutti e tre i bracci.
       2. IL PRESSATORE GLIELA RUBA. Con il portatore fermo, il compagno
          che la squadra ha eletto pressatore gli arriva addosso e prende
          il pallone: l'ordine muore (non c'e' piu' un portatore da
          raddoppiare) e la prova diventa nulla — successo, misurato.
          Qui il pressatore E' l'uomo che la levetta seleziona alla
          pressione, cioe' quello che poi resta sotto il pollice fermo:
          quindi non ruba niente e nessun altro dei nostri e' abbastanza
          vicino per arrivarci dentro la finestra.
       3. LA COPERTURA VA GIA' NELLA STESSA DIREZIONE. Se il compagno
          indicato, restando in copertura, si muoverebbe comunque verso il
          portatore, i due bracci si somigliano e la misura non distingue
          niente. Gli altri avversari stanno percio' nella nostra meta'
          campo: il bersaglio di copertura di T resta indietro, mentre
          l'ordine lo manda avanti. La differenza fra i due bracci e'
          allora tutta e sola del dito.

       LA GEOMETRIA. Compagni a 0, 120 e 240 gradi dal comandato; il
       portatore a 375 unita' verso 0 gradi. La levetta punta a 0: il
       cambio prende il compagno di 0 gradi (che e' anche il pressatore).
       Il trascinamento va da lui verso T, quello di 240 gradi: sulla
       semiretta T sta a zero e il piu' vicino degli altri a 89 unita'. */
    const angoli = [0, 120, 240];
    const cfg = { seme: SEME + 7, aiT: 0.25, aiActT: 4, swLock: 3, raggio: R, angoli,
                  angoloPalla: 0, dPalla: 375, parcheggio: 0.22, levetta: [1, 0] };
    const FRAMES = 90;    // 1,50 s: meta' della durata dell'ordine, e prima
                          // che il compagno indicato arrivi a toccare il pallone
    const out = [];
    for (let i = 0; i < 3; i++) {
      const P = pagine[i];
      const s = await P.prep(cfg);
      if (s.errore) throw new Error('scena: ' + s.errore);
      await P.mano.muovi(DITO_L, CASA.x + SPINTA * cfg.levetta[0], CASA.y + SPINTA * cfg.levetta[1]);
      const prima = await P.foto();
      if (prima.disco !== 'swap') { for (const Q of pagine) await Q.pag.close(); return { nulla: 'il disco dice «' + prima.disco + '»' }; }
      const T = s.miei[3], D1 = s.miei[1];
      const dPrimaT = Math.hypot(s.pos[T].x - s.pos[s.ladro].x, s.pos[T].y - s.pos[s.ladro].y);
      /* il trascinamento va dal compagno comandato verso T: e' quello che
         farebbe il pollice, cioe' indicare un uomo sul campo */
      const vt = { x: s.pos[T].x - s.pos[D1].x, y: s.pos[T].y - s.pos[D1].y };
      const vtl = Math.hypot(vt.x, vt.y) || 1;
      const dirT = [vt.x / vtl, vt.y / vtl];
      await P.mano.giu(DITO_R, s.disco.x, s.disco.y);
      if (i === 1) { await P.passo(12); }
      else {
        for (let k = 1; k <= 6; k++) { await P.passo(1); await P.mano.muovi(DITO_R, s.disco.x + 45 * dirT[0] * k / 6, s.disco.y + 45 * dirT[1] * k / 6); }
        /* mezzo decimo fermo: la lettura del distacco scarta gli ultimi
           60 ms, e un trascinamento appena finito non e' ancora tutto
           nell'anello (misurato al banco: 15 px su 45 senza l'attesa) */
        await P.passo(6);
      }
      /* dopo la pressione il pollice sinistro torna a riposo: l'uomo
         comandato si ferma, e cosi' non e' lui a cambiare la scena mentre
         si misura il compagno indicato */
      await P.mano.muovi(DITO_L, CASA.x + 2, CASA.y);
      if (i === 2) {
        /* il sistema si prende TUTTO lo schermo, com'e' davvero il gesto
           indietro di Android; il pollice sinistro torna giu' subito, nello
           stesso istante, cosi' cio' che si misura e' l'annullo del disco e
           non una levetta spenta */
        await P.mano.annullaTutto();
        await P.mano.giu(DITO_L, CASA.x, CASA.y);
        await P.mano.muovi(DITO_L, CASA.x + 2, CASA.y);
      } else await P.mano.su(DITO_R);
      for (let k = 0; k < FRAMES / 15; k++) {
        await P.pag.evaluate(([i, x, y]) => {
          const G = window.__test.G;
          G.swLock[0] = 2;                       // il cambio automatico resta fermo
          const q = G.players[i];                // e il portatore anche
          q.x = x; q.y = y; q.vx = 0; q.vy = 0; q.ax = 0; q.ay = 0;
          G.ball.x = x; G.ball.y = y; G.ball.vx = 0; G.ball.vy = 0;
        }, [s.ladro, s.pos[s.ladro].x, s.pos[s.ladro].y]);
        await P.passo(15);
      }
      const dopo = await P.foto();
      out.push({ s, prima, dopo, T, dPrimaT, ctrlPrima: prima.ctrl, ctrlDopo: dopo.ctrl,
                 ownerFine: dopo.owner, teamFine: dopo.owner >= 0 ? dopo.pos[dopo.owner].team : -1,
                 dDopoT: Math.hypot(dopo.pos[T].x - dopo.pos[s.ladro].x, dopo.pos[T].y - dopo.pos[s.ladro].y) });
    }
    for (const P of pagine) await P.pag.close();
    const [conT, senza, annu] = out;
    const calci0 = out.reduce((a, o) => a + o.dopo.calci.filter(c => c.team === 0).length, 0);
    const sciv0 = out.reduce((a, o) => a + o.dopo.scivolate.filter(c => c.team === 0).length, 0);
    const avvic = o => (senza.dDopoT - senza.dPrimaT) - (o.dDopoT - o.dPrimaT);
    const gC = avvic(conT), gE = avvic(annu);
    /* la scena vale solo se il pallone e' rimasto all'avversario in tutti
       e tre i bracci: l'ordine muore quando non c'e' piu' un portatore da
       raddoppiare, e allora la distanza misurata non parlerebbe di lui */
    const tenuto = out.every(o => o.teamFine === 1);
    const okC = tenuto ? (gC >= 60) : null;
    const okE2 = okC ? (Math.abs(gE) < 25) : null;
    stampa('   scena: il compagno indicato e\' l\'indice ' + conT.T + ', a ' + n2(conT.dPrimaT) +
           ' unita\' dal portatore; il portatore e\' l\'indice ' + conT.s.ladro);
    stampa('   distanza dal portatore dopo ' + n2(FRAMES / 60) + ' s, sui tre bracci:');
    stampa('       trascinamento + rilascio   ' + n2(conT.dDopoT) + ' unita\'   (avvicinamento in piu\' del controllo: ' + n2(gC) + ')');
    stampa('       nessun trascinamento       ' + n2(senza.dDopoT) + ' unita\'   (braccio di controllo)');
    stampa('       trascinamento + touchcancel ' + n2(annu.dDopoT) + ' unita\'   (avvicinamento in piu\' del controllo: ' + n2(gE) + ')');
    stampa('   uomo comandato (contesto, non verdetto): ' + out.map(o => o.ctrlPrima + '->' + o.ctrlDopo).join(' · '));
    stampa('   il pallone e\' rimasto all\'avversario nei tre bracci: ' + out.map(o => o.teamFine === 1 ? 'si' : 'NO').join(' · '));
    stampa('   calci della squadra 0 sui tre bracci: ' + calci0 + ' · scivolate: ' + sciv0);
    stampa('   C  atteso: almeno 60 unita\' di avvicinamento in piu\' del controllo  ->  ' +
           (okC === null ? 'PROVA NULLA — il pallone ha cambiato padrone e l\'ordine muore con lui' : (okC ? 'VERDE' : 'ROSSO')));
    stampa('   E2 atteso: l\'annullo di sistema si comporta come il controllo (meno di 25 unita\')  ->  ' +
           (okE2 === null ? 'PROVA NULLA — senza un ordine che funziona non c\'e\' un annullo da misurare' : (okE2 ? 'VERDE' : 'ROSSO')));
    return { okC, okE2, calci0, sciv0 };
  }

  {
    stampa('C) IL RADDOPPIO — il compagno indicato cambia comportamento?');
    const c = await provaRaddoppio();
    if (c.nulla) {
      esiti.push({ id: 'C', nome: 'il raddoppio comandato avvicina l\'uomo indicato', ok: null });
      esiti.push({ id: 'E2', nome: 'touchcancel con trascinamento armato non comanda niente', ok: null });
      esiti.push({ id: 'E1', nome: 'il disco del cambio non produce calci ne\' scivolate', ok: null });
      stampa('   PROVA NULLA: ' + c.nulla);
    } else {
      esiti.push({ id: 'C', nome: 'il raddoppio comandato avvicina l\'uomo indicato', ok: c.okC });
      esiti.push({ id: 'E2', nome: 'touchcancel con trascinamento armato non comanda niente', ok: c.okE2 });
      const okE = c.calci0 === 0 && c.sciv0 === 0;
      esiti.push({ id: 'E1', nome: 'il disco del cambio non produce calci ne\' scivolate', ok: okE });
      stampa('   E1 LEGGE 4: zero calci e zero scivolate della squadra 0  ->  ' + (okE ? 'VERDE' : 'ROSSO'));
    }
    stampa('');
  }

  /* -------------------------------------------------------------------
     D — SENZA LEVETTA E SENZA TRASCINAMENTO.
     Il dito sinistro resta giu' ma non si muove abbastanza per prendere
     la levetta (3 px, sotto i 6 della promozione): il cambio non ha
     nessuna direzione da leggere. Dopo la pressione la levetta si prende
     davvero, ed e' cosi' che si scopre chi e' finito sotto il pollice.
     Il verdetto NON dice quale uomo: dice che un uomo c'e', che e' dei
     miei, che non e' il portiere e che non e' lo stesso di prima. Un
     cancello di non regressione deve essere verde anche sul gioco di
     oggi, se no non misura una regressione: misura una preferenza.
     ------------------------------------------------------------------- */
  {
    const pagine = [await apri(5, true), await apri(5, true)];
    const FW = pagine[0].q.FW, FH = pagine[0].q.FH;
    const R = Math.min(FH * 0.30, FW * 0.16);
    let buone = 0, tot = 0, nulle = 0;
    const det = [];
    for (let g = 0; g < 6; g++) {
      const angoli = [0 + g * 17, 120 + g * 29, 240 + g * 11];
      const cfg = { seme: SEME + 300 + g, aiT: 0.5, raggio: R, angoli,
                    angoloPalla: 40 + g * 50, dPalla: 62, levetta: null };
      const r = await duello(pagine, cfg, 10, { sonda: [0, -1] });
      tot++;
      if (r.nulla) { nulle++; det.push('      giro ' + g + ': PROVA NULLA — ' + r.nulla); continue; }
      const m = r.moto, s = r.A.scena;
      if (!valida(m)) { nulle++; det.push('      giro ' + g + ': PROVA NULLA — primo ' + n2(m.scarto) + ', secondo ' + n2(m.secondo)); continue; }
      const f = r.A.dopo.pos[m.chi];
      const mio = f.team === 0 && !f.gk && f.out <= 0;
      const cambiato = m.chi !== s.pi;
      const dPalla = Math.hypot(s.pos[m.chi].x - r.A.prima.palla.x, s.pos[m.chi].y - r.A.prima.palla.y);
      let migliore = 1e9;
      for (const i of s.miei) if (i !== s.pi) migliore = Math.min(migliore, Math.hypot(s.pos[i].x - r.A.prima.palla.x, s.pos[i].y - r.A.prima.palla.y));
      if (mio && cambiato) buone++;
      det.push('      giro ' + g + ': si muove ' + m.chi + (cambiato ? '' : ' (NESSUN CAMBIO)') +
               ' · dei miei ' + mio + ' · distanza dal pallone ' + n2(dPalla) +
               ' unita\' (il piu\' vicino disponibile era a ' + n2(migliore) + ')');
    }
    for (const P of pagine) await P.pag.close();
    const ok = nulle === 0 ? (buone === tot) : null;
    esiti.push({ id: 'D', nome: 'senza levetta il cambio da\' comunque un uomo dei miei', ok });
    stampa('D) SENZA LEVETTA E SENZA TRASCINAMENTO — sei scene, il dito sinistro giu\' e fermo');
    stampa('   ' + buone + ' su ' + tot + ' danno un uomo di movimento della mia squadra, diverso da quello di prima' +
           (nulle ? ' · ' + nulle + ' prove nulle' : ''));
    for (const r of det) stampa(r);
    stampa('   atteso: sempre un uomo, mai il portiere, mai nessuno  ->  ' + (ok === null ? 'PROVA NULLA' : (ok ? 'VERDE' : 'ROSSO')));
    stampa('');
  }

  await br.close(); srv.chiudi();

  const rossi = esiti.filter(e => e.ok === false);
  const nulle = esiti.filter(e => e.ok === null || e.ok === undefined);
  stampa('--- ESITO ---');
  for (const e of esiti) stampa('  ' + (e.ok === null || e.ok === undefined ? 'NULLA' : (e.ok ? 'VERDE' : 'ROSSO')) + '  ' + e.id + '  ' + e.nome);
  if (eccezioni.length) stampa('  eccezioni in pagina: ' + eccezioni.length + ' — ' + eccezioni.slice(0, 3).join(' | '));
  stampa('verdi ' + (esiti.length - rossi.length - nulle.length) + ' · rossi ' + rossi.length + ' · nulle ' + nulle.length + ' · su ' + esiti.length);
  if (rossi.length) stampa('CANCELLO ROSSO: ' + rossi.length + ' controlli falliti.');
  else if (nulle.length) stampa('CANCELLO NON CONCLUSO: ' + nulle.length + ' prove nulle — da riparare e\' il banco.');
  else stampa('CANCELLO VERDE: ' + esiti.length + ' controlli su ' + esiti.length + '.');
  process.exit(rossi.length ? 1 : (nulle.length ? 3 : 0));

  /* =====================================================================
     IL CENSIMENTO (--misura). Quante volte il cambio da' un uomo che non
     ha niente a che fare con la direzione che il pollice sta indicando.

     COSA MISURA DAVVERO, detto per bene: il robot tiene la levetta
     puntata dove sta ANDANDO — verso il pallone, che e' cio' che fa
     chiunque difenda — e conta quanto l'uomo che gli arriva sotto il
     pollice sia lontano da quella direzione. NON misura il desiderio di
     una persona, che nessuna macchina sa leggere: misura di QUANTO la
     scelta e' scollegata dall'unica cosa che il gioco sa della tua
     intenzione. Sul ciclo orario quello scollegamento c'e' per
     costruzione — il ciclo la levetta non la guarda proprio — e questa
     colonna dice quanto vale in gradi.
     ===================================================================== */
  async function censimento() {
    console.log('=== CENSIMENTO DEL CAMBIO UOMO (--misura) ===');
    console.log('  gioco: ' + GIOCO);
    console.log('  robot: pollice sinistro sempre giu\' e puntato verso il pallone, pollice destro');
    console.log('         che preme il disco del cambio ogni 0,67 s quando il disco dice CAMBIO.');
    console.log('');
    const SEMI = [SEME, SEME + 1, SEME + 2, SEME + 3, SEME + 4, SEME + 5];
    const eventi = [];
    let premute = 0, fermi = 0;
    for (const sm of SEMI) {
      const P = await apri(5, true);
      await P.pag.evaluate(s => { if (window.__seme) window.__seme(s); }, sm);
      await P.passo(60);
      let prossima = 0;
      for (let f = 0; f < 2400; f += 4) {
        const st = await P.pag.evaluate(() => {
          const t = window.__test, G = t.G, p = G.ctrl[0] >= 0 ? G.players[G.ctrl[0]] : null;
          const bt = t.pulsanti(0);
          const piccolo = bt.reduce((a, q) => (q.r || 0) < (a.r || 0) ? q : a, bt[0]);
          return { scena: G.scene, ctrl: G.ctrl[0], px: p ? p.x : 0, py: p ? p.y : 0,
                   bx: G.ball.x, by: G.ball.y, act: piccolo.act, dx: piccolo.x, dy: piccolo.y,
                   miei: G.players.map((q, i) => ({ i, t: q.team, gk: q.role === 'gk', out: q.out, x: q.x, y: q.y })) };
        });
        if (st.scena !== 'play') { await P.passo(4); continue; }
        /* la levetta punta il pallone */
        let vx = st.bx - st.px, vy = st.by - st.py;
        const vl = Math.hypot(vx, vy) || 1; vx /= vl; vy /= vl;
        await P.mano.muovi(DITO_L, CASA.x + SPINTA * vx, CASA.y + SPINTA * vy);
        if (f >= prossima && st.act === 'swap') {
          prossima = f + 40;
          const lev = await P.pag.evaluate(() => ({ dx: Touch5.stick[0].dx, dy: Touch5.stick[0].dy, attiva: Touch5.stick[0].active }));
          await P.mano.giu(DITO_R, st.dx, st.dy);
          const dopo = await P.pag.evaluate(() => window.__test.G.ctrl[0]);
          await P.passo(3);
          await P.mano.su(DITO_R);
          premute++;
          if (dopo === st.ctrl) fermi++;
          if (lev.attiva && dopo !== st.ctrl && dopo >= 0 && st.ctrl >= 0) {
            const vecchio = st.miei[st.ctrl], nuovo = st.miei[dopo];
            const aLev = ang(lev.dx, lev.dy);
            const aUomo = ang(nuovo.x - vecchio.x, nuovo.y - vecchio.y);
            const dot = (lev.dx * (nuovo.x - vecchio.x) + lev.dy * (nuovo.y - vecchio.y));
            const cand = st.miei.filter(q => q.t === 0 && !q.gk && q.out <= 0 && q.i !== st.ctrl);
            /* QUANTI COMPAGNI STANNO DAVVERO DAVANTI. Serve a separare due
               cose che il numero grezzo confonde: «la scelta ignora la
               levetta» e «dalla parte in cui il pollice spinge non c'e'
               nessuno». La seconda non e' un difetto della scelta — il
               progetto l'aveva gia' misurata (un cono duro e' vuoto nel
               71% degli stati a 5 contro 5) — e il robot ci finisce
               dentro spesso, perche' punta la levetta verso il pallone e
               chi difende ha quasi sempre i compagni ALLE SPALLE. */
            const davanti = cand.filter(q => (q.x - vecchio.x) * lev.dx + (q.y - vecchio.y) * lev.dy > 0).length;
            const dNuovo = Math.hypot(nuovo.x - st.bx, nuovo.y - st.by);
            const dMigliore = Math.min.apply(null, cand.map(q => Math.hypot(q.x - st.bx, q.y - st.by)));
            const dVecchio = Math.hypot(vecchio.x - st.bx, vecchio.y - st.by);
            eventi.push({ err: dAng(aUomo, aLev), opposto: dot < 0, extra: dNuovo - dMigliore,
                          peggiora: dNuovo > dVecchio, cand: cand.length, davanti: davanti,
                          salto: Math.hypot(nuovo.x - vecchio.x, nuovo.y - vecchio.y) });
          }
          await P.passo(1);
        } else await P.passo(4);
      }
      await P.pag.close();
    }
    const err = eventi.map(e => e.err);
    const opp = eventi.filter(e => e.opposto).length;
    const nonPiuVicino = eventi.filter(e => e.extra > 1).length;
    const peggiora = eventi.filter(e => e.peggiora).length;
    const extra = eventi.filter(e => e.extra > 1).map(e => e.extra);
    console.log('  pressioni sul disco CAMBIO: ' + premute + ' · pressioni che NON hanno cambiato uomo: ' + fermi +
                ' · cambi censiti (con la levetta viva): ' + eventi.length + '  [' + SEMI.length + ' partite, taglia 5]');
    console.log('  di quanto ci si sposta: mediana del salto dal vecchio al nuovo uomo ' + n2(mediana(eventi.map(e => e.salto))) + ' unita\'');
    console.log('  errore angolare fra la levetta e l\'uomo che arriva:');
    console.log('     mediana ' + n2(mediana(err)) + ' gradi · oltre 90 gradi ' + err.filter(e => e > 90).length +
                ' su ' + err.length + ' (' + n2(100 * err.filter(e => e > 90).length / Math.max(1, err.length)) + '%)');
    console.log('  l\'uomo scelto sta dalla parte OPPOSTA alla levetta: ' + opp + ' su ' + eventi.length +
                ' (' + n2(100 * opp / Math.max(1, eventi.length)) + '%)');
    console.log('  l\'uomo scelto NON e\' il piu\' vicino al pallone fra i disponibili: ' + nonPiuVicino +
                ' su ' + eventi.length + ' (' + n2(100 * nonPiuVicino / Math.max(1, eventi.length)) + '%)' +
                ', e quando succede sta in media ' + n2(extra.reduce((a, b) => a + b, 0) / Math.max(1, extra.length)) + ' unita\' piu\' lontano');
    console.log('  il cambio ti ALLONTANA dal pallone: ' + peggiora + ' su ' + eventi.length +
                ' (' + n2(100 * peggiora / Math.max(1, eventi.length)) + '%)');
    /* la riga che separa «la scelta ignora la levetta» da «da quella
       parte non c'era nessuno» */
    const conDavanti = eventi.filter(e => e.davanti > 0);
    const presiDavanti = conDavanti.filter(e => !e.opposto).length;
    console.log('  QUANDO UN COMPAGNO DAVANTI C\'E\' DAVVERO (' + conDavanti.length + ' cambi su ' + eventi.length + '):');
    console.log('     l\'uomo scelto sta davanti in ' + presiDavanti + ' casi su ' + conDavanti.length +
                ' (' + n2(100 * presiDavanti / Math.max(1, conDavanti.length)) + '%)' +
                ' · errore angolare mediano ' + n2(mediana(conDavanti.map(e => e.err))) + ' gradi');
  }
})().catch(e => { console.error('FALLITO: ' + (e && e.stack || e)); process.exit(2); });
