/* =====================================================================
   _q-inviti.js — IL CANCELLO DEGLI INVITI E DEI TRE PASSI (voce L3.3 di
   _analisi/agente28.md §5 e §10).

   Sorveglia CINQUE proprieta', e nessuna di piu'.

     A) L'INVITO COMPARE QUANDO DEVE, E SOLO ALLORA. Due bracci gemelli,
        stesso seme, stessa partita: nel primo il robot tira SEMPRE di
        tap (il verbo «tieni» non lo usa mai) e la pastiglia deve
        comparire; nel secondo tiene il tasto (il verbo lo usa) e la
        pastiglia NON deve comparire. Una volta sola per partita.
     B) L'INVITO NON RICOMPARE, E IL RICORDO SOPRAVVIVE ALLA RICARICA.
        Dopo INV_IMPARATO usi del verbo la pastiglia non torna nella
        partita dopo; e non torna nemmeno su una PAGINA NUOVA aperta
        sullo stesso salvataggio. Con il controllo che rende la prova
        onesta: su un salvataggio VERGINE lo stesso identico braccio la
        fa comparire, se no B passerebbe perche' non compare mai.
     C) L'INVITO NON COPRE IL GIOCO. Nessun pixel della pastiglia dentro
        i dischi del pollice ne' nella fascia bassa (Legge 3), nessuno
        sopra il pallone, e dopo INV_DUR secondi di gioco non ne resta
        nemmeno uno: se ne va da sola.
     D) IL TUTORIAL RESTA TRE PASSI E SE NE VA. La fascia compare alla
        prima partita, porta tre pallini, si chiude da sola entro il suo
        tetto, e alla seconda partita non torna piu'.
     E) IL COSTO IN TEMPO DI PARTITA. Quanti dei novanta secondi il
        giocatore passa con qualcosa scritto sopra. Misurato, non
        stimato, e con un tetto: tutorial piu' pastiglia non possono
        superare TUT_TETTO + INV_DUR + un secondo di grazia.

   ---------------------------------------------------------------------
   COME SI LEGGE UN VERDETTO QUI DENTRO, ED E' LA PARTE CHE CONTA.

   «La pastiglia c'e' ed e' li'» sarebbe una domanda facilissima da fare
   al gioco: c'e' perfino un campo, __test.invitoStato.vivo. Leggerlo
   sarebbe la trappola numero uno di casa — una toppa che accende un
   booleano e non dipinge un pixel passerebbe in verde.

   Percio' la pastiglia NON si chiede: si SCOPRE, dai pixel della tela.
   A ogni campione il banco disegna lo STESSO identico stato due volte,
   una con la pastiglia e una senza (__test.invitoMuto spegne il solo
   disegno), e sottrae le due immagini. I pixel che cambiano SONO la
   pastiglia: la sua esistenza, il suo riquadro, la sua fine. Da li'
   vengono tutti i verdetti di A, B e C.

   E IL BANCO DIMOSTRA DI NON ESSERE CIECO PRIMA DI PARLARE: a ogni
   campione disegna anche una TERZA volta a pastiglia spenta e sottrae
   le due immagini spente fra loro. Se quel confronto non e' vuoto, il
   fotogramma non e' ripetibile e la sottrazione non misura la pastiglia
   ma il rumore: il campione viene dichiarato SPORCO e il referto lo
   stampa. Un banco con campioni sporchi non promuove niente.

   __test.invitoMuto e __test.invitoProva sono INGRESSI, non letture:
   il primo spegne un disegno, il secondo accende un invito senza
   aspettare la sonda. Nessun verdetto sulla COMPARSA li usa — in A e in
   B il robot gioca e la pastiglia arriva da sola o non arriva.
   invitoProva serve solo a C, dove la domanda non e' «arriva?» ma
   «dov'e'?», e a D/E, dove serve il caso peggiore.

   ---------------------------------------------------------------------
   IL CONTROLLO NEGATIVO. Uno strumento mai visto FALLIRE non e' uno
   strumento. Questo cancello si sa rompere in quattro modi:
     · sul gioco di oggi (nessun invito esiste) A e D sono ROSSI e B, C
       restano NULLI — mai verdi: una prova che non ha potuto correre
       non e' una prova passata;
     · --sabota smemorato   la memoria non si scrive su disco: B2 rosso,
                            tutto il resto verde;
     · --sabota ostinato    l'invito torna anche dopo che il verbo e'
                            stato imparato: B1 rosso, il resto verde;
     · --sabota invadente   la pastiglia scende in fascia bassa: C1
                            rosso, il resto verde.
   Se il testo da sabotare non c'e' (file non toppato) lo strumento ERRA
   col codice del banco, e non dice «verde».

   ---------------------------------------------------------------------
   uso:
     node strumenti/_q-inviti.js                        (sul gioco di casa)
     node strumenti/_q-inviti.js --gioco fuori/inviti.html
     node strumenti/_q-inviti.js --gioco X --sabota invadente
     node strumenti/_q-inviti.js --gioco X --misura     (il censimento)

   --misura non da' verdetti: e' il CENSIMENTO che serviva PRIMA di
   scegliere le soglie. Un robot gioca una partita intera senza mai usare
   i tre verbi e il banco stampa, secondo per secondo, quante occasioni
   perse ha prodotto ciascuna sonda. Le soglie della toppa sono tarate
   li' sopra.

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
const SEC = +arg('sec', 90);
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
               '.png': 'image/png', '.json': 'application/json' };

/* I TRE SABOTAGGI. Non toccano nessun file: riscrivono il testo mentre la
   pagina lo scarica. Ognuno e' una toppa PLAUSIBILE e SBAGLIATA — non un
   codice rotto — perche' un controllo negativo che spegne tutto non
   dimostra niente sulla precisione della misura. */
const SABOTAGGI = {
  smemorato: { cerca: 'if(n<INV_IMPARATO){ m.u[k]=n+1; persistSave(); }',
               metti: 'if(n<INV_IMPARATO){ m.u[k]=n+1; }',
               dice: 'il ricordo dell\'uso resta in memoria e non arriva su disco' },
  ostinato:  { cerca: 'if((m.u[d.k]|0)>=INV_IMPARATO) return false;          // imparato: mai piu\'',
               metti: 'if(false) return false;                               // imparato: mai piu\'',
               dice: 'l\'invito torna anche dopo che il verbo e\' stato imparato' },
  invadente: { cerca: 'const x0=Math.round((VW-w)/2), y0=Math.round(BAR_H+10);',
               metti: 'const x0=Math.round((VW-w)/2), y0=Math.round(VH-150);',
               dice: 'la pastiglia scende in fascia bassa, sotto il pollice' },
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
      console.error('  Questo file non e\' toppato con L3.3, oppure la toppa e\' cambiata: da riparare e\' il BANCO.');
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

/* il tempo in mano al banco: il rAF resta finto e fermo, cosi' nessun
   fotogramma arriva per conto suo. La simulazione avanza solo con
   __test.simulate, che e' l'unico passo fisso del gioco. */
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

/* LE DITA. Protocollo CDP: per touchStart/touchMove la lista di TUTTE le
   dita vive, per touchEnd solo quello che si alza. */
function Mano(cdp) {
  const p = new Map();
  const lista = () => [...p.entries()].map(([id, q]) => ({ x: q.x, y: q.y, id: id }));
  return {
    async giu(id, x, y) { p.set(id, { x, y }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: lista() }); },
    async muovi(id, x, y) { p.set(id, { x, y }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: lista() }); },
    async su(id) { const q = p.get(id); if (!q) return; p.delete(id); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [{ x: q.x, y: q.y, id }] }); },
    ha(id) { return p.has(id); },
  };
}

/* =====================================================================
   L'IMPRONTA — la pastiglia letta dai PIXEL e non chiesta al gioco.
   Si installa una volta per pagina; torna, a ogni chiamata:
     n       quanti pixel cambiano fra il fotogramma con e senza pastiglia
     x0..y1  il loro riquadro, in px CSS
     basso   quanti di quei pixel stanno nella fascia bassa del pollice
     dischi  quanti stanno dentro un disco dei comandi (raggio + 24 px di
             polpastrello)
     palla   quanti stanno sul disco del pallone, la cui posizione la
             calcola IL BANCO dalla posizione di mondo e dalla camera
     sporco  quanti pixel cambiano fra DUE fotogrammi spenti: se non e'
             zero il campione non e' ripetibile e non vale
   ===================================================================== */
function installaImpronta() {
  const c = document.getElementById('gioco');
  if (!c) return 'BANCO INVECCHIATO: non c\'e\' la tela #gioco';
  const t = window.__test;
  if (!t || typeof t.disegna !== 'function') return 'BANCO INVECCHIATO: __test.disegna non esiste';
  const g = c.getContext('2d');
  const dpr = c.width / (window.innerWidth || 1);
  /* =====================================================================
     IL DISEGNO FERMO, e le DUE lezioni che ci sono volute.

     LA PRIMA e' gia' scritta in strumenti/_posa.js: __test.disegna() non
     e' una fotografia, e' un passo di tempo. render() chiama
     updateCamera(G.renderDT) e altri inseguimenti esponenziali, e due
     disegni consecutivi differiscono su 330.000 pixel su 377.000
     (misurato qui, prima della cura). Si azzera la sorgente comune,
     G.renderDT, con un accessorio che ignora anche la scrittura che
     disegna() fa da se', e si rimette la camera dov'era.

     LA SECONDA E' NUOVA, ED E' COSTATA TRE CORSE DEL CANCELLO. Con
     renderDT a ZERO restavano 16.000 pixel di differenza per fotogramma,
     tutti in due bande: y 0-56 (il tabellone) e y 320-400 (la
     minimappa). Le due righe colpevoli si leggono in chiaro nel gioco:

         G.miniY += (myVoluto-G.miniY)*(1-2^(-(G.renderDT||0.016)/0.12))
         const k = 1-2^(-(G.renderDT||0.016)/0.12)          [velaTabellone]

     `G.renderDT||0.016` — con renderDT a zero il ripiego vale 0,016, e
     i due inseguimenti continuano a correre COME SE il tempo passasse.
     Non e' un difetto del gioco: e' una difesa contro un renderDT non
     ancora scritto. Ma rende inutile la cura di _posa.js su qualunque
     scena in cui quei due valori NON sono gia' arrivati a destinazione —
     e in una partita viva non ci arrivano mai, perche' i corpi passano
     di continuo sotto il tabellone.
     _posa.js non lo vede perche' pone il gioco IN PAUSA su una scena in
     cui il tabellone e' gia' saturo a 1: (1-1)*k fa zero comunque.

     LA CURA: renderDT non torna zero, torna UN MILIARDESIMO. Il ripiego
     `||` non scatta (1e-9 e' vero), k vale 5,8e-9, e il passo di ogni
     inseguimento e' cinque miliardesimi del divario — dieci ordini di
     grandezza sotto il gradino di un pixel a 8 bit. Misurato: da 16.000
     pixel di rumore a ZERO.
     ===================================================================== */
  function fermo() {
    const G = t.G, cam = G.cam, sc = { x: cam.x, y: cam.y, z: cam.z };
    const desc = Object.getOwnPropertyDescriptor(G, 'renderDT');
    Object.defineProperty(G, 'renderDT', { get: () => 1e-9, set: () => {}, configurable: true });
    try { t.disegna(); }
    finally {
      delete G.renderDT;
      if (desc) Object.defineProperty(G, 'renderDT', desc); else G.renderDT = 1 / 60;
      cam.x = sc.x; cam.y = sc.y; cam.z = sc.z;
    }
  }
  window.__impronta = function () {
    const muto = typeof t.invitoMuto === 'function';
    const leggi = () => g.getImageData(0, 0, c.width, c.height).data;
    if (muto) t.invitoMuto(true);
    fermo(); const B0 = leggi();
    fermo(); const B1 = leggi();
    if (muto) t.invitoMuto(false);
    fermo(); const A = leggi();
    if (muto) t.invitoMuto(false);
    /* il pallone in pixel di schermo, calcolato QUI dalla posizione di
       mondo e dalla camera: nessun campo dell'imputato */
    const G = t.G, v = G.view;
    let pal = null;
    if (v && v.S2 && G.ball) pal = { x: (G.ball.x * v.S2 + v.Ax) * dpr,
                                     y: ((G.ball.y - (G.ball.z || 0) * 0.55) * v.S2 + v.Ay) * dpr,
                                     r: 16 * dpr };
    const dischi = (t.pulsanti ? t.pulsanti(0) : []).map(b => ({ x: b.x * dpr, y: b.y * dpr, r: (b.r + 24) * dpr }));
    const BASSO = c.height - 160 * dpr;      // la fascia del pollice, generosa
    let n = 0, sporco = 0, basso = 0, sudDischi = 0, suPalla = 0;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    const W = c.width, H = c.height;
    for (let y = 0; y < H; y++) {
      const ry = y * W * 4;
      for (let x = 0; x < W; x++) {
        const i = ry + x * 4;
        if (B0[i] !== B1[i] || B0[i + 1] !== B1[i + 1] || B0[i + 2] !== B1[i + 2]) { sporco++; continue; }
        if (A[i] === B1[i] && A[i + 1] === B1[i + 1] && A[i + 2] === B1[i + 2]) continue;
        n++;
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
        if (y >= BASSO) basso++;
        for (const d of dischi) { const dx = x - d.x, dy = y - d.y; if (dx * dx + dy * dy <= d.r * d.r) { sudDischi++; break; } }
        if (pal) { const dx = x - pal.x, dy = y - pal.y; if (dx * dx + dy * dy <= pal.r * pal.r) suPalla++; }
      }
    }
    if (window.__diag) {
      /* diagnostica: dove stanno i pixel che cambiano fra due fotogrammi
         a pastiglia spenta. Serve solo a capire chi non e' ripetibile. */
      const fasce = {};
      let sx0 = 1e9, sy0 = 1e9, sx1 = -1, sy1 = -1;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        if (B0[i] !== B1[i] || B0[i + 1] !== B1[i + 1] || B0[i + 2] !== B1[i + 2]) {
          const f = (y / 40 | 0) * 40; fasce[f] = (fasce[f] | 0) + 1;
          if (x < sx0) sx0 = x; if (x > sx1) sx1 = x; if (y < sy0) sy0 = y; if (y > sy1) sy1 = y;
        }
      }
      window.__diagUltimo = { sporco: sporco, fasce: fasce, sx0: sx0, sy0: sy0, sx1: sx1, sy1: sy1,
                              scena: G.scene, moviola: !!G.moviola, ripresa: !!G.ripresa,
                              cine: !!G.goalCine, shake: G.shake, dpr: dpr, W: W, H: H };
    }
    if (!n) return { n: 0, sporco: sporco, basso: 0, dischi: 0, palla: 0, x0: 0, y0: 0, x1: 0, y1: 0 };
    return { n: n, sporco: sporco, basso: basso, dischi: sudDischi, palla: suPalla,
             x0: +(x0 / dpr).toFixed(1), y0: +(y0 / dpr).toFixed(1),
             x1: +(x1 / dpr).toFixed(1), y1: +(y1 / dpr).toFixed(1) };
  };
  return 'ok';
}

/* la fascia del tutorial: si legge dal DOM come la vede l'occhio —
   visibile, con area, e con i suoi pallini. Non e' una bandiera: e' il
   rettangolo che il browser dichiara di aver disegnato. */
function fasciaTut() {
  const d = document.getElementById('tut');
  if (!d) return { c: false, n: 0 };
  const st = getComputedStyle(d);
  const r = d.getBoundingClientRect();
  const viva = st.display !== 'none' && st.visibility !== 'hidden' && +st.opacity > 0.05 && r.width > 8 && r.height > 4;
  const pal = document.getElementById('tutStep');
  return { c: viva, n: pal ? pal.children.length : 0, y0: Math.round(r.top), y1: Math.round(r.bottom),
           testo: (document.getElementById('tutText') || {}).textContent || '' };
}

const n2 = v => (v === null || v === undefined || !isFinite(v)) ? 'n/d' : (Math.round(v * 100) / 100).toString().replace('.', ',');

/* =====================================================================
   IL REFERTO
   ===================================================================== */
const righe = [];
let rossi = 0, nulle = 0;
function verdetto(cod, esito, testo, dett) {
  righe.push({ cod, esito, testo, dett });
  if (esito === 'NO') rossi++;
  if (esito === 'nulla') nulle++;
  const tag = esito === 'OK' ? '  OK   ' : esito === 'NO' ? '  NO   ' : '  ---  ';
  console.log(tag + cod + '  ' + testo + (dett ? '\n              ' + dett : ''));
}

const CASA = { x: 165, y: 272 };     // erba, lontano dai due dischi
const DITO_L = 1, DITO_R = 2;

(async () => {
  const srv = await servi();
  const br = await chromium.launch({ headless: !TESTA });
  const url = 'http://127.0.0.1:' + srv.porta + '/CALCETTO-il-gioco.html';
  const eccezioni = [];

  async function nuovoContesto() {
    return await br.newContext({ viewport: { width: 915, height: 412 },
      deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'it-IT' });
  }
  async function apri(ctx) {
    const pag = await ctx.newPage();
    await pag.addInitScript(seme => {
      let s = seme >>> 0 || 1;
      Math.random = function () { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
      window.__seme = q => { s = (q >>> 0) || 1; };
    }, SEME);
    await pag.addInitScript(bancoDiProva);
    pag.on('pageerror', e => eccezioni.push(e.message));
    await pag.goto(url, { waitUntil: 'load' });
    await pag.waitForFunction(() => !!window.__test, null, { timeout: 25000 });
    const cdp = await pag.context().newCDPSession(pag);
    if (haFlag('diag')) await pag.evaluate(() => { window.__diag = true; });
    const esito = await pag.evaluate(installaImpronta);
    if (esito !== 'ok') { console.error('FALLITO: ' + esito); process.exit(2); }
    return { pag, cdp };
  }

  /* -------------------------------------------------------------------
     LA PARTITA COL ROBOT.
       modo 'tap'   ogni pressione del disco grande dura 0,10 s (sotto
                    TAP_T 0,15): il verbo «tieni» non viene mai usato
       modo 'tieni' ogni pressione dura 0,62 s: il verbo viene usato
     Il pollice sinistro sta giu' per tutta la partita, come pretende il
     progetto, e spinge verso la porta avversaria.
     Il campionamento dei pixel gira su un CALENDARIO FISSO — ogni
     `passoFoto` secondi simulati — e non guarda nessun campo del gioco
     per decidere quando guardare: se guardasse, una pastiglia dipinta
     senza dichiararsi sfuggirebbe.
     ------------------------------------------------------------------- */
  async function partita(p, opt) {
    const { pag, cdp } = p;
    const modo = opt.modo, dur = opt.sec === undefined ? SEC : opt.sec;
    const passoFoto = opt.passoFoto || 1.0;
    const mano = Mano(cdp);
    const avvio = await pag.evaluate(() => {
      const t = window.__test;
      try { t.dismissSplash && t.dismissSplash(); } catch (e) {}
      t.setPaused && t.setPaused(false);
      t.startMatch(1, 1, { size: 5 });
      for (let i = 0; i < 200 && t.G.scene !== 'play'; i++) t.simulate(0.1);
      return { scena: t.G.scene, dischi: t.pulsanti(0) };
    });
    if (avvio.scena !== 'play') return { errore: 'la partita non arriva in gioco: ' + avvio.scena };
    if (!opt.tutorial) await pag.evaluate(() => { try { if (window.__test.Tut.active) window.__test.Tut.finish(true); } catch (e) {} });
    /* il pollice sinistro: giu' e spinto verso la porta avversaria */
    await mano.giu(DITO_L, CASA.x, CASA.y);
    await mano.muovi(DITO_L, CASA.x + 46, CASA.y);

    const grande = avvio.dischi.reduce((a, c) => (c.r || 0) > (a.r || 0) ? c : a, avvio.dischi[0]);
    const piccolo = avvio.dischi.reduce((a, c) => (c.r || 0) < (a.r || 0) ? c : a, avvio.dischi[0]);
    /* il disco su cui lavora il pollice destro, e quanto lo tiene:
         tap     disco grande, 0,10 s — sotto TAP_T: la tenuta non c'e'
         tieni   disco grande, 0,62 s — dentro la finestra: la tenuta c'e'
         cambio  disco piccolo, 0,10 s — senza trascinamento: nessun
                 raddoppio, e ogni pressione con un avversario in
                 possesso e' un'occasione persa */
    const disco = modo === 'cambio' ? piccolo : grande;
    const ATTO = modo === 'cambio' ? 'swap' : 'shot';
    const TENUTA = (modo === 'tieni' || modo === 'mira') ? 0.62 : 0.10;
    /* 'mira' e' 'tieni' PIU' il trascinamento: sessanta pixel, cioe'
       sopra R_ARMA (22-36, cresce col tempo del pollice) e sotto
       R_ANNULLA (96, oltre il quale l'atto muore). E' il braccio in cui
       il robot usa TUTTI E DUE i verbi del tiro. */
    const TRASCINA = modo === 'mira' ? 60 : 0;
    const campioni = [], sonde = [];
    let premuto = false, tenuto = 0, tSim = 0, prossimaFoto = passoFoto, riposo = 0;

    const dt = 1 / 30;
    while (tSim < dur) {
      /* un solo viaggio per passo: si avanza la simulazione e si torna
         con cio' che il disco grande offre ADESSO */
      const st = await pag.evaluate(([s, grosso]) => {
        const t = window.__test;
        t.simulate(s);
        const bt = t.pulsanti(0);
        const b = grosso ? bt.reduce((a, c) => (c.r || 0) > (a.r || 0) ? c : a, bt[0])
                         : bt.reduce((a, c) => (c.r || 0) < (a.r || 0) ? c : a, bt[0]);
        return { act: b.act, scena: t.G.scene };
      }, [dt, modo !== 'cambio']);
      tSim += dt;
      if (st.scena !== 'play' && st.scena !== 'kickoff' && st.scena !== 'goal' && st.scena !== 'golden') break;
      if (premuto) {
        const prima = tenuto; tenuto += dt;
        if (TRASCINA && prima < 0.15 && tenuto >= 0.15) await mano.muovi(DITO_R, disco.x, disco.y - TRASCINA);
        if (tenuto >= TENUTA) { await mano.su(DITO_R); premuto = false; riposo = 0.20; }
      }
      else if (riposo > 0) riposo -= dt;
      else if (st.act === ATTO) { await mano.giu(DITO_R, disco.x, disco.y); premuto = true; tenuto = 0; }
      if (tSim >= prossimaFoto) {
        prossimaFoto += passoFoto;
        /* SI FOTOGRAFA SOLO IN GIOCO, e la ragione e' misurata: durante
           il gol il replay e la ripresa dedicata avanzano di un
           fotogramma A OGNI DISEGNO, e non passano da G.renderDT — cioe'
           la cura di _posa.js non li ferma. Su una partita da tredici
           reti quei fotogrammi sono la maggioranza, e infatti la prima
           corsa di questo cancello dichiarava 83 campioni sporchi su 90.
           La pastiglia, per costruzione, vive solo in 'play': fuori di
           li' non c'e' niente da fotografare. */
        if (st.scena === 'play') {
          const f = await pag.evaluate(() => ({ imp: window.__impronta(), tut: window.__fasciaTut(),
                                                st: window.__test.invitoStato || null,
                                                diag: window.__diag ? window.__diagUltimo : null }));
          campioni.push({ t: +tSim.toFixed(2), imp: f.imp, tut: f.tut });
          sonde.push({ t: +tSim.toFixed(2), st: f.st });
          if (f.diag) console.log('  DIAG t=' + tSim.toFixed(2) + ' ' + JSON.stringify(f.diag));
        }
      }
    }
    if (premuto) await mano.su(DITO_R);
    await mano.su(DITO_L);
    return { campioni, sonde, dur: tSim };
  }

  /* il rettangolo che riassume tutte le comparse: quanti campioni con
     pastiglia, e il riquadro complessivo */
  function riassunto(campioni) {
    const con = campioni.filter(c => c.imp && c.imp.n > 0);
    const sporchi = campioni.filter(c => c.imp && c.imp.sporco > 0);
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, basso = 0, dischi = 0, palla = 0;
    for (const c of con) {
      x0 = Math.min(x0, c.imp.x0); y0 = Math.min(y0, c.imp.y0);
      x1 = Math.max(x1, c.imp.x1); y1 = Math.max(y1, c.imp.y1);
      basso += c.imp.basso; dischi += c.imp.dischi; palla += c.imp.palla;
    }
    /* le comparse: gruppi di campioni consecutivi con la pastiglia */
    let comparse = 0, prima = -9;
    for (const c of con) { if (c.t - prima > 2.5) comparse++; prima = c.t; }
    const spPx = campioni.reduce((a, c) => a + ((c.imp && c.imp.sporco) | 0), 0);
    return { campioni: campioni.length, con: con.length, sporchi: sporchi.length, spPx: spPx, comparse,
             x0, y0, x1, y1, basso, dischi, palla,
             primo: con.length ? con[0].t : null, ultimo: con.length ? con[con.length - 1].t : null };
  }

  await (async () => {

    /* =================================================================
       IL CENSIMENTO
       ================================================================= */
    if (MISURA) {
      const ctx = await nuovoContesto();
      const p = await apri(ctx);
      await p.pag.evaluate(() => { window.__fasciaTut = () => ({ c: false, n: 0 }); });
      const MODO = arg('modo', 'tap');
      console.log('CENSIMENTO — robot «' + MODO + '», ' + SEC + ' s, seme ' + SEME + '\n');
      const r = await partita(p, { modo: MODO, passoFoto: 5 });
      if (r.errore) { console.error('FALLITO: ' + r.errore); process.exit(2); }
      console.log('  sec    tieni  mira  raddoppio   pastiglia');
      for (const s of r.sonde) {
        const q = s.st ? s.st.sonde : {};
        console.log('  ' + String(s.t).padStart(5) + '  ' + String(q.tieni | 0).padStart(5) +
                    '  ' + String(q.mira | 0).padStart(4) + '  ' + String(q.raddoppio | 0).padStart(9) +
                    '   ' + (s.st && s.st.vivo ? s.st.vivo.k : '-'));
      }
      const ult = r.sonde[r.sonde.length - 1];
      console.log('\n  memoria a fine partita: ' + JSON.stringify(ult && ult.st ? { usi: ult.st.usi, viste: ult.st.viste } : null));
      const ri = riassunto(r.campioni);
      console.log('  pastiglia vista in ' + ri.con + ' campioni su ' + ri.campioni + ', ' + ri.comparse + ' comparse');
      await br.close(); srv.chiudi();
      process.exit(0);
    }

    /* =================================================================
       A — L'INVITO COMPARE QUANDO DEVE
       ================================================================= */
    console.log('\nA — L\'INVITO COMPARE QUANDO DEVE, E SOLO ALLORA');
    const ctxA = await nuovoContesto();
    const pA = await apri(ctxA);
    await pA.pag.evaluate(fn => { window.__fasciaTut = new Function('return (' + fn + ')()'); }, fasciaTut.toString());
    const senza = await partita(pA, { modo: 'tap' });
    if (senza.errore) { console.error('FALLITO: ' + senza.errore); process.exit(2); }
    const rs = riassunto(senza.campioni);
    const ultA = senza.sonde[senza.sonde.length - 1];

    if (rs.sporchi > 0)
      verdetto('A0', 'NO', 'il banco non e\' ripetibile: ' + rs.sporchi + ' campioni sporchi su ' + rs.campioni + ' (' + rs.spPx + ' px in tutto)',
               'due fotogrammi a pastiglia spenta non sono uguali: la sottrazione misura rumore, non la pastiglia');
    else
      verdetto('A0', 'OK', 'il banco e\' ripetibile: 0 campioni sporchi su ' + rs.campioni,
               'due fotogrammi a pastiglia spenta sono identici pixel per pixel');

    verdetto('A1', rs.con > 0 ? 'OK' : 'NO',
             'senza mai usare il verbo, la pastiglia COMPARE',
             rs.con > 0 ? ('vista in ' + rs.con + ' campioni su ' + rs.campioni + ', dal secondo ' + n2(rs.primo) + ' al ' + n2(rs.ultimo) +
                           ', riquadro ' + n2(rs.x0) + ',' + n2(rs.y0) + '-' + n2(rs.x1) + ',' + n2(rs.y1) + ' px CSS')
                        : ('mai vista in ' + rs.campioni + ' campioni. Sonde a fine partita: ' +
                           JSON.stringify(ultA && ultA.st ? ultA.st.sonde : 'nessuna')));
    verdetto('A2', rs.comparse <= 1 ? (rs.comparse === 1 ? 'OK' : 'nulla') : 'NO',
             'una pastiglia per partita, non due',
             rs.comparse + ' comparse distinte');
    await ctxA.close();

    const ctxB = await nuovoContesto();
    const pB = await apri(ctxB);
    await pB.pag.evaluate(fn => { window.__fasciaTut = new Function('return (' + fn + ')()'); }, fasciaTut.toString());
    const con = await partita(pB, { modo: 'mira' });
    if (con.errore) { console.error('FALLITO: ' + con.errore); process.exit(2); }
    const rc = riassunto(con.campioni);
    const ultC = con.sonde[con.sonde.length - 1];
    const usiC = ultC && ultC.st ? (ultC.st.usi.tieni | 0) : 0;
    const usiM = ultC && ultC.st ? (ultC.st.usi.mira | 0) : 0;
    verdetto('A3', (usiC > 0 && usiM > 0) ? 'OK' : 'nulla',
             'il braccio di controllo USA davvero i verbi',
             'usi registrati: tieni ' + usiC + ', mira ' + usiM +
             ' (se fossero zero, A4 passerebbe per la ragione sbagliata)');
    verdetto('A4', rc.con === 0 ? 'OK' : 'NO',
             'usando i verbi, la pastiglia NON compare',
             rc.con === 0 ? 'mai vista in ' + rc.campioni + ' campioni'
                          : 'vista in ' + rc.con + ' campioni su ' + rc.campioni + ', dal secondo ' + n2(rc.primo));
    await ctxB.close();

    /* =================================================================
       B — NON RICOMPARE, E IL RICORDO SOPRAVVIVE ALLA RICARICA
       ================================================================= */
    console.log('\nB — L\'INVITO NON RICOMPARE, E IL RICORDO ATTRAVERSA LA RICARICA');
    /* B1: stesso contesto, prima partita col verbo usato, seconda senza */
    const ctxD = await nuovoContesto();
    const pD = await apri(ctxD);
    await pD.pag.evaluate(fn => { window.__fasciaTut = new Function('return (' + fn + ')()'); }, fasciaTut.toString());
    /* SI GIOCA FINCHE' IL VERBO E' IMPARATO DAVVERO, e non un numero
       fisso di secondi. Il robot manda i tocchi via CDP, cioe' in modo
       asincrono rispetto ai passi della simulazione: quanti tiri gli
       riescono in trenta secondi non e' ripetibile, e una corsa su due
       si fermava a un uso solo — B1 e B2 diventavano nulle per colpa del
       banco e non del gioco. */
    let memD = null, d1 = null;
    for (let giro = 0; giro < 5; giro++) {
      d1 = await partita(pD, { modo: 'mira', sec: 20 });
      if (d1.errore) break;
      memD = await pD.pag.evaluate(() => window.__test.invitoStato);
      if (memD && (memD.usi.tieni | 0) >= 2) break;
    }
    const d2 = await partita(pD, { modo: 'tap' });
    const rd = riassunto(d2.campioni);
    const impararoD = memD ? (memD.usi.tieni | 0) : 0;
    verdetto('B1', impararoD >= 2 ? (rd.con === 0 ? 'OK' : 'NO') : 'nulla',
             'imparato il verbo, la pastiglia non torna nella partita dopo',
             'usi dopo la prima partita: ' + impararoD + ' · comparse nella seconda: ' + rd.comparse);

    /* B2: PAGINA NUOVA, stesso salvataggio. E' la ricarica. */
    const pE = await apri(ctxD);
    await pE.pag.evaluate(fn => { window.__fasciaTut = new Function('return (' + fn + ')()'); }, fasciaTut.toString());
    const memE = await pE.pag.evaluate(() => window.__test.invitoStato);
    const e1 = await partita(pE, { modo: 'tap' });
    const re = riassunto(e1.campioni);
    const ricordoE = memE ? (memE.usi.tieni | 0) : 0;
    verdetto('B2', ricordoE >= 2 ? (re.con === 0 ? 'OK' : 'NO') : 'NO',
             'su una PAGINA NUOVA il ricordo c\'e\' ancora, e la pastiglia non torna',
             'usi riletti dal salvataggio: ' + ricordoE + ' · comparse: ' + re.comparse +
             (ricordoE >= 2 ? '' : '  ← il ricordo non e\' arrivato su disco'));
    verdetto('B3', rs.con > 0 ? 'OK' : 'nulla',
             'il controllo: su salvataggio vergine lo stesso braccio la fa comparire',
             'e\' la prova A1: ' + rs.con + ' campioni con pastiglia. Senza questo, B2 sarebbe verde anche su un gioco che non mostra mai niente');
    await ctxD.close();

    /* =================================================================
       C — NON COPRE IL GIOCO
       ================================================================= */
    console.log('\nC — L\'INVITO NON COPRE IL GIOCO');
    const ctxF = await nuovoContesto();
    const pF = await apri(ctxF);
    await pF.pag.evaluate(fn => { window.__fasciaTut = new Function('return (' + fn + ')()'); }, fasciaTut.toString());
    /* qui la domanda non e' «arriva?» ma «dov'e'?»: la pastiglia si
       accende dall'ingresso di banco e si guarda dove finisce, in cento
       istanti diversi della partita — camera in ogni posizione, pallone
       ovunque. */
    const posti = await pF.pag.evaluate((nGiri) => {
      const t = window.__test, out = [];
      try { t.dismissSplash && t.dismissSplash(); } catch (e) {}
      t.setPaused && t.setPaused(false);
      t.startMatch(1, 1, { size: 5 });
      for (let i = 0; i < 200 && t.G.scene !== 'play'; i++) t.simulate(0.1);
      try { if (t.Tut.active) t.Tut.finish(true); } catch (e) {}
      /* la partita corre da sola con il dito fermo — la squadra 0 resta
         UMANA, perche' un invito non si accende su una partita senza
         nessuno da istruire — e la pastiglia va a cadere su ventiquattro
         configurazioni diverse di camera e di pallone */
      for (let g = 0; g < nGiri; g++) {
        /* IL CRONOMETRO SI RIMETTE INDIETRO A OGNI GIRO. Ventiquattro
           giri da cinque secondi e mezzo fanno piu' di due minuti, e la
           partita ne dura novanta: senza questa riga la seconda meta'
           della prova girava a partita finita, e infatti la prima corsa
           dichiarava 17 istanti validi su 24 e C3 nulla. */
        if (t.setTimeLeft) t.setTimeLeft(80);
        t.simulate(1.3);
        /* si aspetta il gioco vero: fuori da 'play' il replay del gol
           avanza a ogni disegno e il fotogramma non e' ripetibile. E si
           DISEGNA mentre si aspetta, se no il replay — che avanza sui
           fotogrammi e non sui passi — non finisce mai. Se dopo quindici
           secondi la scena e' ancora altrove (duello, fine partita) si
           rifa' il fischio d'inizio invece di perdere il giro. */
        for (let k = 0; k < 60 && t.G.scene !== 'play'; k++) { t.simulate(0.25); t.disegna(); }
        if (t.G.scene !== 'play') {
          t.startMatch(1, 1, { size: 5 });
          for (let k = 0; k < 200 && t.G.scene !== 'play'; k++) { t.simulate(0.1); t.disegna(); }
          try { if (t.Tut.active) t.Tut.finish(true); } catch (e) {}
        }
        if (t.G.scene !== 'play') continue;
        /* il gettone e la memoria tornano vergini: e' un INGRESSO di
           banco, non una lettura, e serve solo a riaccendere */
        let acceso = false;
        try { t.invitoAzzera && t.invitoAzzera(); } catch (e) {}
        try { acceso = t.invitoProva ? t.invitoProva('raddoppio') : false; } catch (e) {}
        /* mezzo secondo perche' la dissolvenza in entrata sia finita: a
           t = 0 la pastiglia e' trasparente, e misurarla li' vorrebbe
           dire misurare zero pixel e chiamarlo «non copre» */
        t.simulate(0.5);
        const imp = window.__impronta();
        out.push({ acceso: acceso, imp: imp,
                   palla: { x: Math.round(t.G.ball.x), y: Math.round(t.G.ball.y) } });
        t.simulate(3.8);                       // la pastiglia si consuma
      }
      return out;
    }, 24);
    const validi = posti.filter(q => q.imp && q.imp.n > 0);
    const sporchiF = posti.filter(q => q.imp && q.imp.sporco > 0).length;
    const bassoTot = validi.reduce((a, q) => a + q.imp.basso, 0);
    const dischiTot = validi.reduce((a, q) => a + q.imp.dischi, 0);
    const pallaTot = validi.reduce((a, q) => a + q.imp.palla, 0);
    const yMax = validi.length ? Math.max(...validi.map(q => q.imp.y1)) : null;
    verdetto('C1', (validi.length && sporchiF === 0) ? ((bassoTot === 0 && dischiTot === 0) ? 'OK' : 'NO') : 'nulla',
             'Legge 3: nessun pixel della pastiglia sotto il pollice',
             (validi.length && sporchiF === 0)
               ? (validi.length + ' istanti · fascia bassa ' + bassoTot + ' px · dentro i dischi ' + dischiTot +
                  ' px · quota piu\' bassa raggiunta ' + n2(yMax) + ' px CSS su 412')
               : (sporchiF ? (sporchiF + ' istanti sporchi: fotogramma non ripetibile, prova nulla')
                           : 'la pastiglia non si e\' mai accesa: prova nulla'));
    verdetto('C2', validi.length ? (pallaTot === 0 ? 'OK' : 'NO') : 'nulla',
             'la pastiglia non copre il pallone',
             validi.length ? (pallaTot + ' px sul disco del pallone, in ' + validi.length + ' istanti')
                           : 'prova nulla');
    /* C3: se ne va da sola, e QUANTO dura si MISURA invece di crederci */
    /* SI RIPROVA FINCHE' LA FINESTRA E' PULITA. Una rete in mezzo alla
       misura la interrompe — la pastiglia muore quando la scena lascia
       'play', ed e' voluto — quindi il banco cerca una finestra di sei
       secondi senza reti invece di dichiarare nulla al primo tentativo. */
    const via = await pF.pag.evaluate(() => {
      const t = window.__test;
      /* LA MOVIOLA SI SPEGNE, ed e' una cura non un trucco: il replay del
         gol avanza di un fotogramma A OGNI DISEGNO, e questo banco fa
         scorrere il tempo con simulate() senza disegnare. Con la moviola
         accesa la scena resta incastrata sul replay e non torna mai in
         'play': misurato, tredici tentativi su quattordici persi cosi'.
         Il replay non e' cio' che C misura. */
      try { if (t.save) t.save.moviola = 0; } catch (e) {}
      const motivi = [];
      /* SI TORNA IN GIOCO, E SE NON SI TORNA SI RICOMINCIA. Fuori da
         'play' il gioco puo' essere in tre posti da cui il banco NON
         esce da solo: il replay del gol (avanza sui fotogrammi, non sui
         passi), il duello del calcio piazzato (aspetta un dito che qui
         non c'e') e la fine partita. La prima corsa ci si e' incastrata
         al primo tentativo su quattordici. La cura e' brutale e onesta:
         si disegna mentre si aspetta, e se dopo venti secondi di gioco
         la scena non e' tornata 'play' si rifa' il fischio d'inizio. */
      function inGioco() {
        for (let k = 0; k < 80 && t.G.scene !== 'play'; k++) { t.simulate(0.25); t.disegna(); }
        if (t.G.scene === 'play') return true;
        t.startMatch(1, 1, { size: 5 });
        for (let k = 0; k < 200 && t.G.scene !== 'play'; k++) { t.simulate(0.1); t.disegna(); }
        try { if (t.Tut.active) t.Tut.finish(true); } catch (e) {}
        return t.G.scene === 'play';
      }
      let ult = { acceso: false, a: 0, ultimo: 0, tagliato: true, vita: 0, b: 0, tentativi: 0 };
      for (let giro = 0; giro < 14; giro++) {
        if (t.setTimeLeft) t.setTimeLeft(80);
        if (!inGioco()) { motivi.push('giro ' + giro + ': non si torna in gioco, scena ' + t.G.scene); continue; }
        let acceso = false;
        try { t.invitoAzzera && t.invitoAzzera(); } catch (e) {}
        try { acceso = t.invitoProva ? t.invitoProva('mira') : false; } catch (e) {}
        /* candidabile() rifiuta anche con una scritta di scena in corso
           (banner del gol, targa dei capitani): si lascia passare un
           secondo di gioco invece di consumare il tentativo a vuoto */
        if (!acceso) {
          motivi.push('giro ' + giro + ': scena ' + t.G.scene + ' banner ' + (+t.G.bannerT).toFixed(2) +
                      ' cap ' + (+t.G.capT).toFixed(2) + ' cpu0 ' + t.G.cpu[0] +
                      ' stato ' + JSON.stringify(t.invitoStato && { spesa: t.invitoStato.spesa, vivo: t.invitoStato.vivo, usi: t.invitoStato.usi, viste: t.invitoStato.viste }));
          t.simulate(1); continue;
        }
        t.simulate(0.25);
        let vita = 0.25;
        if (t.G.scene !== 'play') continue;
        const a = window.__impronta().n;
        /* IL CRITERIO NON E' «la finestra intera e' pulita» MA «la
           pastiglia e' sparita e resta sparita». Con tredici reti a
           partita una finestra di cinque secondi senza gol si trova
           raramente, e la prima stesura dichiarava nulla quattordici
           tentativi su quattordici. Basta molto meno: l'ultimo pixel
           visto, poi TRE campioni consecutivi a zero — tre quarti di
           secondo di assenza confermata — e la domanda «se ne va da
           sola?» ha gia' la sua risposta. */
        let ultimo = a > 0 ? vita : 0, zeri = a > 0 ? 0 : 1, tagliato = false;
        for (let i = 0; i < 20; i++) {         // fino a 20 passi da 0,25 s
          t.simulate(0.25); vita += 0.25;
          if (t.G.scene !== 'play') { tagliato = true; break; }
          if (window.__impronta().n > 0) { ultimo = vita; zeri = 0; } else zeri++;
          if (a > 0 && zeri >= 3) break;
        }
        const buono = a > 0 && zeri >= 3;
        ult = { acceso: acceso, a: a, ultimo: +ultimo.toFixed(2), tagliato: !buono && tagliato,
                buono: buono, vita: +vita.toFixed(2), b: buono ? 0 : 1, tentativi: giro + 1 };
        if (buono) break;
      }
      ult.motivi = motivi.slice(0, 4);
      return ult;
    });
    const c3buono = !!via.buono;
    verdetto('C3', c3buono ? (via.b === 0 ? 'OK' : 'NO') : 'nulla',
             'la pastiglia se ne va da sola',
             c3buono ? (via.a + ' px accesa · ultimo pixel visto a ' + n2(via.ultimo) +
                        ' s di gioco dall\'accensione · dopo ' + n2(via.vita) + ' s ne restano ' + via.b)
                     : ('prova nulla in ' + via.tentativi + ' tentativi — ' + JSON.stringify(via)));
    const VITA = c3buono ? via.ultimo + 0.25 : null;
    await ctxF.close();

    /* =================================================================
       D + E — IL TUTORIAL E IL SUO COSTO IN TEMPO DI PARTITA
       ================================================================= */
    console.log('\nD — IL TUTORIAL: TRE PASSI, E SE NE VA');
    const ctxG = await nuovoContesto();
    const pG = await apri(ctxG);
    await pG.pag.evaluate(fn => { window.__fasciaTut = new Function('return (' + fn + ')()'); }, fasciaTut.toString());
    /* prima partita col tutorial acceso, robot che NON fa nessuno dei
       gesti insegnati: e' il caso peggiore, quello in cui il tutorial
       arriva al suo tetto */
    const g1 = await pG.pag.evaluate(async () => {
      const t = window.__test;
      try { t.dismissSplash && t.dismissSplash(); } catch (e) {}
      t.setPaused && t.setPaused(false);
      t.startMatch(1, 1, { size: 5 });
      for (let i = 0; i < 200 && t.G.scene !== 'play'; i++) t.simulate(0.1);
      const tracce = [];
      let acceso = 0;
      for (let s = 0; s < 900; s++) {           // 90 s a passi di 0,1
        t.simulate(0.1);
        t.disegna();
        const f = window.__fasciaTut();
        if (f.c) acceso += 0.1;
        if (s % 5 === 0) tracce.push({ t: +(s * 0.1).toFixed(1), c: f.c, n: f.n, testo: f.testo.slice(0, 40) });
        if (t.G.scene === 'end' || t.G.scene === 'menu') break;
      }
      return { acceso: +acceso.toFixed(2), pallini: (tracce.find(q => q.c) || {}).n || 0,
               testi: [...new Set(tracce.filter(q => q.c).map(q => q.testo))],
               fine: t.G.scene, tot: (t.G.timeLeft !== undefined ? t.G.timeLeft : null) };
    });
    verdetto('D1', g1.pallini === 3 ? 'OK' : 'NO',
             'la fascia del tutorial porta TRE pallini',
             'pallini contati nel DOM: ' + g1.pallini + ' · testi mostrati: ' + JSON.stringify(g1.testi));
    verdetto('D2', g1.acceso > 0 && g1.acceso <= 9.6 ? 'OK' : 'NO',
             'il tutorial si chiude da solo entro il suo tetto',
             'acceso per ' + n2(g1.acceso) + ' s di GIOCO (tetto TUT_TETTO 9 s, piu\' mezzo secondo di grazia sul passo)');
    /* seconda partita nella stessa pagina: mai piu' */
    const g2 = await pG.pag.evaluate(async () => {
      const t = window.__test;
      t.startMatch(1, 1, { size: 5 });
      for (let i = 0; i < 200 && t.G.scene !== 'play'; i++) t.simulate(0.1);
      let acceso = 0;
      for (let s = 0; s < 300; s++) { t.simulate(0.1); t.disegna(); if (window.__fasciaTut().c) acceso += 0.1; }
      return +acceso.toFixed(2);
    });
    verdetto('D3', g2 === 0 ? 'OK' : 'NO',
             'alla seconda partita il tutorial non torna',
             'acceso per ' + n2(g2) + ' s');

    console.log('\nE — IL COSTO IN TEMPO DI PARTITA');
    /* i due addendi sono TUTTI E DUE misurati: la fascia col cronometro
       del DOM sul caso peggiore, la pastiglia coi pixel in C3 */
    const costo = (VITA === null) ? null : g1.acceso + VITA;
    verdetto('E1', costo === null ? 'nulla' : (costo <= 9 + 3.5 + 1 ? 'OK' : 'NO'),
             'tutorial piu\' pastiglia stanno nel tetto dichiarato (9 + 3,5 + 1 s)',
             costo === null ? 'la pastiglia non si e\' accesa: il secondo addendo manca'
                            : ('caso peggiore ' + n2(costo) + ' s su ' + SEC + ' (' + n2(costo / SEC * 100) +
                               '% della partita) = ' + n2(g1.acceso) + ' s di fascia (DOM) + ' + n2(VITA) + ' s di pastiglia (pixel)'));
    await ctxG.close();

  })();

  if (eccezioni.length) {
    console.log('\nECCEZIONI IN PAGINA: ' + eccezioni.length);
    for (const e of eccezioni.slice(0, 5)) console.log('  · ' + e);
  }
  const ok = righe.filter(r => r.esito === 'OK').length;
  console.log('\n' + righe.length + ' controlli, ' + ok + ' verdi, ' + rossi + ' rossi, ' + nulle + ' nulli' +
              (SABOTA ? '   [SABOTATO: ' + SABOTAGGI[SABOTA].dice + ']' : ''));
  await br.close(); srv.chiudi();
  process.exit(rossi ? 1 : (nulle ? 3 : 0));
})().catch(e => { console.error('BANCO ESPLOSO: ' + (e && e.stack || e)); process.exit(2); });
