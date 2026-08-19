/* =====================================================================
   _q-l22.js — IL BANCO DELLE TRE ACCUSE DELLA VOCE L2.2.

   Misura, sul gioco vero e con la fisica vera, le tre cose che la voce
   L2.2 del progetto accusa. Non legge MAI una bandiera scritta dal
   codice giudicato: legge dove il pallone CADE, quanta velocita' PERDE,
   e se il padrone del pallone CAMBIA.

   uso:
     node strumenti/_q-l22.js --a                       (il cross)
     node strumenti/_q-l22.js --b --partite 6           (il primo tocco)
     node strumenti/_q-l22.js --c --partite 4           (il tiro al volo)
     node strumenti/_q-l22.js --tutte
     node strumenti/_q-l22.js --a --gioco /fuori/l22-a.html
     node strumenti/_q-l22.js --json fuori/misura.json

   COME NON MENTE. Server http locale (Playwright non apre file:), seme
   fisso su Math.random, banco a passo fisso al posto di
   requestAnimationFrame: due corse danno gli stessi numeri. Il gioco si
   pilota con window.__test e — per il tiro al volo — con veri
   KeyboardEvent sulla finestra, cioe' passando dai listener del gioco e
   non chiamando startCharge a mano.

   E' STATO VISTO FALLIRE — ed e' questo, e non la sua lunghezza, che lo
   rende uno strumento. Corse del 19 agosto 2026, taglia 5, 915x412@2:
     --a  gioco base            ROSSO   cade dal 21,5% al 31,2% corto
          fuori/l22-a.html      VERDE   0,0-2,2% (e il 2,2 e' il passo
                                        del fotogramma, non l'attrito)
     --b  gioco base            ROSSO   0 controlli sporchi su 359, e
                                        0 su 900 nella scena a caselle
          fuori/l22-b.html      VERDE   14 su 347 in partita (4,0%),
                                        e la scala 0/6/8/16/12/30% sulle
                                        sei caselle di difficolta'
     --c  gioco base            VERDE   la carica si apre a 35,3 di
                                        mediana, 3 voli su 20 in scena
          fuori/l22-accusa-c.html ROSSO 23,6 di mediana, 2 voli su 20
   Le versioni si costruiscono con strumenti/_t-l22.js (--solo a, --solo
   b, --guasta c).

   E DUE VOLTE HA CORRETTO CHI LO USAVA, che e' il vero collaudo:
     · la prima stesura della regola (b) faceva saturare la probabilita'
       contro un tetto, e tecnica 40 e tecnica 62 finivano identiche
       (54% contro 56%). La casella «TECNICA» della scena l'ha visto.
     · la prima stesura del robot del volo passava il 58% della partita
       fermo dentro un duello dal dischetto che nessuno chiudeva, e
       contava zero tiri al volo per quel motivo e non per il gioco.

   ---------------------------------------------------------------------
   MISURA A — DOVE CADE UN CROSS.
   Banco deterministico, non partita. Si mette il crossatore in un punto
   noto, si mandano fuori campo tutti gli altri (p.out>0: nessuno
   intercetta, nessun portiere), si chiama il CROSS VERO del gioco
   (window.doCross con una mira esplicita, cosi' la distanza voluta e' un
   dato e non una stima) e si conta di fotogramma in fotogramma finche'
   la quota non torna a zero. Il numero letto e' la distanza percorsa a
   terra fra il piede e il primo rimbalzo: un EFFETTO, misurato in
   unita' di campo.
   Il riferimento non e' un gusto: doCross calcola il tempo di volo
   T=clamp(dist/430,0.5,0.75) e la quota b.vz=280*T, e con g=560 il volo
   balistico dura 2*vz/g = T esatto. Il punto di caduta VOLUTO e' quindi
   la mira, al centesimo. Lo scarto e' il difetto.

   ---------------------------------------------------------------------
   MISURA B — QUANTO SPESSO IL PRIMO TOCCO SI SPORCA.
   Due bracci, e servono tutti e due. Il primo e' una SCENA a caselle —
   cento ricezioni identiche per casella, e una sola variabile che cambia
   fra una riga e l'altra — perche' in partita vera i due undici hanno
   quasi la stessa tecnica e la forbice fra un tecnico e un mediano non si
   vedrebbe mai. Il secondo sono PARTITE VERE CPU contro CPU, perche' una
   scena dice se la regola funziona e solo una partita dice quanto pesa.
   In tutti e due, ogni fotogramma si legge (owner, lastTouch, velocita'
   del pallone) e si classifica per EFFETTO:
     · RICEZIONE PULITA — owner passa da -1 a un giocatore.
     · TOCCO SPORCO     — lastTouch cambia, owner resta -1, il pallone
       era vicino a quel giocatore e la sua velocita' e' CROLLATA (meno
       del 60% di prima). E' la firma di un controllo mancato, e non e'
       una bandiera: e' il pallone che rallenta e cambia strada.
   I rimpalli sul corpo (il muro dei tiri) hanno la firma opposta — la
   palla riparte, non crolla — e la soglia di velocita' li separa.

   ---------------------------------------------------------------------
   MISURA C — QUANTI TIRI AL VOLO NASCONO.
   Due bracci anche qui. Una SCENA di venti situazioni costruite (palla a
   terra a quattro velocita' per tre distanze, palla che scende per otto
   combinazioni) e quattro PARTITE VERE con la squadra 0 in mano a un
   ROBOT che gioca solo il volo: insegue il pallone con WASD e prova ad
   armare il tiro quando il pallone e' libero, veloce e in arrivo.
   Il numero letto e' quante volte il pallone e' stato COLPITO DI PRIMA —
   non G.stats.volee da solo, ma volee che cresce E la velocita' del
   pallone che sale nello stesso fotogramma: un tiro al volo che non
   accelera il pallone non e' un tiro al volo.
   Il VERDETTO pero' non e' quel numero, ed e' una lezione della misura:
   fra il gioco di oggi e la versione accusata i voli colpiti sono 3
   contro 2 su venti, una differenza che il rumore si mangia. Quello che
   la soglia cambia davvero e' la DISTANZA a cui la carica riesce ad
   aprirsi (35,3 contro 23,6 di mediana), perche' e' esattamente li' che
   morde. Il verdetto legge quella, e pretende comunque che almeno un volo
   esista: un banco che non ha mai visto un tiro al volo non sta
   misurando i tiri al volo.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
               '.png': 'image/png', '.json': 'application/json' };
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const ha = n => process.argv.includes('--' + n);

/* IL PERCORSO DEL GIOCO, normalizzato. Su Git Bash un argomento che
   comincia con «/» viene tradotto in un percorso di Windows prima ancora
   che node lo veda («/fuori/x.html» diventa «C:/Program Files/Git/fuori/
   x.html»), e la navigazione finiva su un URL impossibile. Qui si accetta
   qualunque forma — relativa, assoluta, con o senza slash — e si ricava
   il percorso RELATIVO ALLA RADICE, che e' l'unica cosa che il server
   locale sa servire. */
const GIOCO = (() => {
  const grezzo = arg('gioco', 'CALCETTO-il-gioco.html');
  let f = path.resolve(RADICE, grezzo.replace(/^\//, ''));
  if (!f.startsWith(RADICE)) f = path.join(RADICE, path.basename(grezzo));
  return '/' + path.relative(RADICE, f).split(path.sep).join('/');
})();
const PARTITE = Math.max(1, parseInt(arg('partite', '6'), 10) || 6);
const JSONOUT = arg('json', null);
const TUTTE = ha('tutte');
const FAI = { a: TUTTE || ha('a'), b: TUTTE || ha('b'), c: TUTTE || ha('c') };
if (!FAI.a && !FAI.b && !FAI.c) { FAI.a = FAI.b = FAI.c = true; }

/* SOGLIE, e da dove vengono. Non sono gusto: sono il confine fra il
   difetto misurato sulla base e il comportamento voluto.
   A — la base cade dal 21,5% al 31,2% corto (sei distanze, tutte); una
       riparazione che lasci piu' del 5% non ha riparato niente.
   B — la base fa 0 controlli sporchi su qualunque numero di ricezioni.
       La forchetta voluta e' quella di un calcio vero: sotto il 3% non
       si vede in partita, sopra il 25% e' una lotteria e il gioco
       frustra. IL 3 E' UNA RITRATTAZIONE: era 4, e la toppa misurata
       dava esattamente 4,0 — un cancello appoggiato sul proprio valore
       misurato non sorveglia niente, e la tentazione era di ritoccare le
       costanti della toppa finche' il numero non veniva bello. Si e'
       mosso il cancello, non la fisica, e si e' scritto perche'.
   C — su 4 partite il robot del volo deve portare a casa almeno un tiro
       al volo, se no la misura non ha misurato niente. */
const A_MAX_CORTO = 5.0;      // %
const B_MIN = 3.0, B_MAX = 25.0;  // %
const C_MIN = 1;
/* C_D_MIN — la carica del tiro deve potersi aprire OLTRE KICK_R. La
   soglia accusata (KICK_R secco = 26) la chiude a 26 esatte, e sulla
   scena la mediana misurata e' 23,5; quella di oggi (KICK_R*1.4 = 36,4)
   da' 34,5. Trenta sta in mezzo, e nessuna delle due ci arriva per caso. */
const C_D_MIN = 30;

function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const p = decodeURIComponent(req.url.split('?')[0]);
      let f = path.join(RADICE, p === '/' ? 'index.html' : p);
      /* IL SERVICE WORKER STA IN RADICE, IL GIOCO TOPPATO STA IN fuori/.
         Il gioco registra 'sw.js' con un percorso RELATIVO: servito da
         /fuori/ quel percorso diventa /fuori/sw.js e non esiste. Il 404
         non rompe niente (la registrazione e' dentro un try) ma finisce
         nella console, e questo banco erra se la console parla. Quindi
         i file di CONTORNO si cercano anche in radice — e solo quelli:
         un .html mancante resta 404, se no una toppa che sbaglia nome
         verrebbe misurata al posto di quella giusta. */
      if (!fs.existsSync(f) && path.extname(f) !== '.html') {
        const r = path.join(RADICE, path.basename(f));
        if (fs.existsSync(r)) f = r;
      }
      if (!f.startsWith(RADICE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        res.writeHead(404); res.end('no'); return;
      }
      res.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream',
                           'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* il banco a passo fisso di folla.js/scatta.js: il tempo lo fa avanzare
   questo file, un fotogramma alla volta */
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

async function apri(br, porta, seme) {
  const ctx = await br.newContext({ viewport: { width: 915, height: 412 },
    deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  /* IL SEME SI PUO' RIMETTERE, ed e' obbligatorio farlo.
     Il seme fisso da solo NON basta: fra il caricamento e la misura
     girano i timer VERI del gioco (setTimeout(dismissSplash,2600), lo
     sblocco dell'audio, la costruzione della texture del campo) e ognuno
     puo' pescare un numero. Quanti ne pescano dipende da quanto e' durato
     il caricamento, cioe' dal carico della macchina — e infatti due corse
     di seguito davano 152 e 164 ricezioni. Un banco non ripetibile non e'
     un banco meno preciso: e' un banco che RENDE CIECHI senza che si
     veda. Con __reseme il generatore si riporta al punto di partenza
     nell'istante esatto in cui la misura comincia, e i timer di prima non
     contano piu' niente. */
  await pag.addInitScript(s => {
    let z = s >>> 0 || 1;
    const p = () => { z ^= z << 13; z >>>= 0; z ^= z >>> 17; z ^= z << 5; z >>>= 0; return z >>> 0; };
    Math.random = () => p() / 4294967296;
    window.__reseme = v => { z = (v >>> 0) || 1; return true; };
  }, seme);
  await pag.addInitScript(bancoDiProva);
  const errori = [];
  pag.on('pageerror', e => errori.push('ECCEZIONE: ' + e.message));
  pag.on('console', m => { if (m.type() === 'error') errori.push(m.text()); });
  await pag.goto('http://127.0.0.1:' + porta + GIOCO, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => window.__banco.passo(20));
  return { pag, ctx, errori };
}

/* ===================================================================== */
/* MISURA A                                                              */
/* ===================================================================== */
async function misuraA(br, porta) {
  const { pag, ctx, errori } = await apri(br, porta, 20260819);
  await pag.evaluate(() => {
    window.__reseme(20260819);          // il seme si rimette QUI, non al caricamento
    window.__test.dismissSplash && window.__test.dismissSplash();
    window.__test.startMatch(1, 1);
    window.__test.Tut && window.__test.Tut.finish && window.__test.Tut.finish(true);
    window.__test.setCpuVsCpu(true);
  });
  await pag.evaluate(() => window.__banco.passo(120));

  const righe = await pag.evaluate(() => {
    window.__reseme(31);                // e di nuovo nell'istante in cui la misura comincia
    const T = window.__test, G = T.G, out = [];
    const FH = T.campo.FH;
    for (const dist of [150, 200, 260, 320, 380, 430]) {
      G.scene = 'play'; G.paused = false;
      const ps = T.players, ci = 0;
      /* tutti fuori campo tranne il crossatore: nessuno intercetta e non
         esiste piu' nessun portiere (portiereDi vuole out<=0) */
      for (let i = 0; i < ps.length; i++) { if (i !== ci) { ps[i].out = 999; ps[i].x = -4000; ps[i].y = -4000; } }
      const p = ps[ci];
      p.out = 0; p.slide = -1; p.recover = 0; p.rove = -1; p.charge = -1; p.kickCd = 0;
      const x0 = 60, y0 = FH / 2;
      p.x = x0; p.y = y0; p.vx = 0; p.vy = 0; p.fx = 1; p.fy = 0;
      const b = T.ball;
      b.x = x0; b.y = y0; b.z = 0; b.vz = 0; b.vx = 0; b.vy = 0;
      b.owner = ci; b.passTo = -1; b.crossTo = -1; b.perfectT = 0; b.curve = 0;
      if (typeof window.doCross !== 'function') return [{ errore: 'doCross non e\' globale' }];
      window.doCross(p, 1, 0, [x0 + dist, y0]);
      const vz0 = b.vz, vx0 = b.vx;
      if (!(vz0 > 0)) { out.push({ dist: dist, errore: 'il cross non e\' partito' }); continue; }
      let salito = false, atterra = null, n = 0;
      while (n < 400) {
        /* si riparcheggiano tutti a ogni fotogramma: l'IA li rimetterebbe
           in campo, e un piede in mezzo falserebbe la caduta */
        for (let i = 0; i < ps.length; i++) { ps[i].out = 999; ps[i].x = -4000; ps[i].y = -4000; }
        T.simulate(1 / 60); n++;
        if (b.z > 0.5) salito = true;
        if (salito && b.z <= 0) { atterra = { x: b.x, n: n }; break; }
      }
      out.push({ dist: dist, vx0: +vx0.toFixed(1), vz0: +vz0.toFixed(1),
                 caduta: atterra ? +(atterra.x - x0).toFixed(1) : null,
                 corto: atterra ? +(100 * (1 - (atterra.x - x0) / dist)).toFixed(1) : null,
                 volo: atterra ? +(atterra.n / 60).toFixed(3) : null });
    }
    return out;
  });
  await ctx.close();
  const validi = righe.filter(r => r.corto !== null && r.corto !== undefined);
  const peggio = validi.length ? Math.max(...validi.map(r => Math.abs(r.corto))) : null;
  return { righe, errori, peggio,
           verde: validi.length === righe.length && peggio !== null && peggio <= A_MAX_CORTO };
}

/* ===================================================================== */
/* MISURA B                                                              */
/* ===================================================================== */
/* SCENA DEL PRIMO TOCCO — la regola messa alla prova una variabile per
   volta. In partita vera i due undici hanno quasi la stessa tecnica e la
   differenza fra un tecnico e un mediano non si vede: qui si vede,
   perche' cambia una cosa sola alla volta e tutto il resto e' identico
   al centesimo. Cento ricezioni per casella, e quello che si legge e'
   se il pallone e' diventato SUO oppure e' schizzato via. */
async function misuraBscena(br, porta, prove) {
  const { pag, ctx, errori } = await apri(br, porta, 20260819);
  await pag.evaluate(() => {
    window.__reseme(20260819);
    window.__test.dismissSplash && window.__test.dismissSplash();
    window.__test.startMatch(1, 1);
    window.__test.Tut && window.__test.Tut.finish && window.__test.Tut.finish(true);
  });
  await pag.evaluate(() => window.__banco.passo(120));
  const righe = await pag.evaluate(N => {
    window.__reseme(4242);
    const T = window.__test, G = T.G, b = T.ball, out = [];
    const FH = T.campo.FH, FW = T.campo.FW;
    const ps = T.players;
    let ci = -1, avv = -1;
    for (let i = 0; i < ps.length; i++) if (ps[i].team === 0 && ps[i].role !== 'gk') { ci = i; break; }
    for (let i = 0; i < ps.length; i++) if (ps[i].team === 1 && ps[i].role !== 'gk') { avv = i; break; }
    /* le caselle: si muove UNA variabile per volta rispetto alla prima riga */
    const casi = [
      { eti: 'lento 200, in faccia, libero  ', V: 200, faccia: 1, press: 999, tec: 62 },
      { eti: 'medio 320, in faccia, libero  ', V: 320, faccia: 1, press: 999, tec: 62 },
      { eti: 'forte 410, in faccia, libero  ', V: 410, faccia: 1, press: 999, tec: 62 },
      { eti: 'forte 410, DA DIETRO, libero  ', V: 410, faccia: -1, press: 999, tec: 62 },
      { eti: 'forte 410, in faccia, PRESSATO', V: 410, faccia: 1, press: 22, tec: 62 },
      { eti: 'forte 410, DA DIETRO, PRESSATO', V: 410, faccia: -1, press: 22, tec: 62 },
      { eti: 'peggiore, TECNICA 40 (scarso) ', V: 410, faccia: -1, press: 22, tec: 40 },
      { eti: 'peggiore, TECNICA 62 (medio)  ', V: 410, faccia: -1, press: 22, tec: 62 },
      { eti: 'peggiore, TECNICA 80 (fuori.) ', V: 410, faccia: -1, press: 22, tec: 80 },
    ];
    for (const c of casi) {
      let sporchi = 0, puliti = 0, nulli = 0;
      for (let k = 0; k < N; k++) {
        G.scene = 'play'; G.paused = false;
        for (let i = 0; i < ps.length; i++) { ps[i].out = 999; ps[i].x = -4000; ps[i].y = -4000; ps[i].charge = -1; }
        const p = ps[ci];
        p.out = 0; p.slide = -1; p.recover = 0; p.rove = -1; p.charge = -1; p.kickCd = 0;
        p.x = FW / 2; p.y = FH / 2; p.vx = 0; p.vy = 0;
        p.tecnica = c.tec;
        const q = ps[avv];
        if (c.press < 900) { q.out = 0; q.slide = -1; q.recover = 0; q.rove = -1; q.kickCd = 9; q.x = p.x; q.y = p.y - c.press; }
        b.x = p.x + 40; b.y = p.y; b.z = 0; b.vz = 0; b.vx = -c.V; b.vy = 0;
        b.owner = -1; b.passTo = -1; b.crossTo = -1; b.perfectT = 0; b.curve = 0;
        b.lastTouch = avv;
        let esito = 0, n = 0;
        while (n < 40) {
          /* il verso in cui guarda e la posa dell avversario si rimettono a
             ogni fotogramma: se no updatePlayer li muove e la casella non
             sarebbe piu' la casella */
          p.fx = c.faccia; p.fy = 0; p.vx = 0; p.vy = 0; p.x = FW / 2; p.y = FH / 2;
          if (c.press < 900) { q.kickCd = 9; q.x = p.x; q.y = p.y - c.press; }
          const spPrima = Math.hypot(b.vx, b.vy);
          T.simulate(1 / 60); n++;
          if (b.owner === ci) { esito = 1; break; }                       // preso: controllo pulito
          const sp = Math.hypot(b.vx, b.vy);
          if (b.lastTouch === ci && b.owner < 0 && sp < spPrima * 0.6) { esito = 2; break; }  // schizzato via
        }
        if (esito === 1) puliti++; else if (esito === 2) sporchi++; else nulli++;
      }
      out.push({ eti: c.eti, V: c.V, tec: c.tec, sporchi: sporchi, puliti: puliti, nulli: nulli,
                 perc: +(100 * sporchi / Math.max(1, sporchi + puliti)).toFixed(1) });
    }
    return out;
  }, prove);
  await ctx.close();
  return { righe, errori };
}

async function misuraB(br, porta, partite) {
  const tot = { ricezioni: 0, sporchi: 0, perGiocatore: {}, fotogrammi: 0,
                scarti: { muro: 0, portiere: 0, scivolata: 0, lontano: 0 } };
  const errori = [];
  for (let m = 0; m < partite; m++) {
    const s = await apri(br, porta, 20260819 + m * 7919);
    errori.push(...s.errori);
    await s.pag.evaluate(sm => {
      window.__reseme(sm);              // il seme si rimette QUI, non al caricamento
      window.__test.dismissSplash && window.__test.dismissSplash();
      window.__test.startMatch(1, 1);
      window.__test.Tut && window.__test.Tut.finish && window.__test.Tut.finish(true);
      window.__test.setCpuVsCpu(true);
      window.__test.setTimeLeft(150);
    }, 20260819 + m * 7919);
    const r = await s.pag.evaluate(sm => {
      window.__reseme(sm);              // e di nuovo nell'istante in cui la misura comincia
      const T = window.__test, G = T.G;
      const b = T.ball;
      let ricezioni = 0, sporchi = 0, fot = 0;
      const perG = {};
      const posa = () => T.players.map(p => ({ x: p.x, y: p.y, gk: p.role === 'gk',
                                               slide: p.slide, out: p.out }));
      let prevOwner = b.owner, prevTouch = b.lastTouch;
      let prevSp = Math.hypot(b.vx, b.vy), prevPassTo = b.passTo;
      let prevPos = posa();
      const scarti = { muro: 0, portiere: 0, scivolata: 0, lontano: 0 };
      for (let i = 0; i < 60 * 150; i++) {
        if (G.scene === 'end' || G.scene === 'menu') break;
        T.simulate(1 / 60); fot++;
        if (G.scene === 'freekick') { prevPos = posa(); continue; }   // il duello non e' una ricezione
        const owner = b.owner, touch = b.lastTouch;
        const sp = Math.hypot(b.vx, b.vy);
        /* RICEZIONE PULITA: il padrone del pallone passa da nessuno a
           qualcuno. E' l'effetto, non una bandiera. */
        if (prevOwner < 0 && owner >= 0) ricezioni++;
        /* TOCCO SPORCO: il pallone e' stato toccato (lastTouch cambia),
           NON e' stato preso (owner resta -1), e la velocita' e' CROLLATA
           sotto il 60%. Poi si tolgono, uno per uno, i tre altri modi che
           il gioco ha di produrre la stessa firma — e si CONTANO, perche'
           un filtro che non dice quanto ha buttato via non e' un filtro:
             · IL MURO sul corpo (updateBall, sp>420): esiste solo sopra
               420 e mai per il destinatario designato del passaggio;
             · IL PORTIERE che respinge: e' un altro gesto, sta in
               updateKeeper, e la toppa (b) lo lascia fuori apposta;
             · LA SCIVOLATA: chi era gia' a terra non stava controllando.
           Resta la firma della sola raccolta mancata. */
        if (owner < 0 && touch >= 0 && touch !== prevTouch && prevSp > 1) {
          const q = prevPos[touch];
          const d = q ? Math.hypot(b.x - q.x, b.y - q.y) : 1e9;
          if (sp < prevSp * 0.6) {
            if (!q || d >= 40) scarti.lontano++;
            else if (q.gk) scarti.portiere++;
            else if (q.slide >= 0) scarti.scivolata++;
            else if (prevSp > 420 && prevPassTo !== touch) scarti.muro++;
            else { sporchi++; perG[touch] = (perG[touch] || 0) + 1; }
          }
        }
        prevOwner = owner; prevTouch = touch; prevSp = sp; prevPassTo = b.passTo;
        prevPos = posa();
      }
      const tec = {};
      T.players.forEach((p, i) => { tec[i] = p.tecnica; });
      return { ricezioni: ricezioni, sporchi: sporchi, fotogrammi: fot, perG: perG,
               tecnica: tec, scarti: scarti };
    }, 31 + m * 7919);
    tot.ricezioni += r.ricezioni; tot.sporchi += r.sporchi; tot.fotogrammi += r.fotogrammi;
    for (const k in r.perG) tot.perGiocatore[k] = (tot.perGiocatore[k] || 0) + r.perG[k];
    for (const k in r.scarti) tot.scarti[k] += r.scarti[k];
    await s.ctx.close();
  }
  const contatti = tot.ricezioni + tot.sporchi;
  const perc = contatti ? +(100 * tot.sporchi / contatti).toFixed(1) : 0;
  return { ...tot, contatti, perc, errori, verde: perc >= B_MIN && perc <= B_MAX };
}

/* ===================================================================== */
/* MISURA C                                                              */
/* ===================================================================== */
/* SCENA DEL VOLO — banco deterministico, venti situazioni.
   Il pallone parte verso un giocatore fermo, a terra o per aria, e il
   robot prova ad armare il volo. Quello che si legge e' se il pallone
   RIPARTE colpito di prima: un effetto, non un contatore. */
async function misuraCscena(br, porta) {
  const { pag, ctx, errori } = await apri(br, porta, 20260819);
  await pag.evaluate(() => {
    window.__reseme(20260819);          // il seme si rimette QUI, non al caricamento
    window.__test.dismissSplash && window.__test.dismissSplash();
    window.__test.startMatch(1, 1);
    window.__test.Tut && window.__test.Tut.finish && window.__test.Tut.finish(true);
  });
  await pag.evaluate(() => window.__banco.passo(120));
  const righe = await pag.evaluate(() => {
    window.__reseme(31);                // e di nuovo nell'istante in cui la misura comincia
    const T = window.__test, G = T.G, b = T.ball, out = [];
    const FH = T.campo.FH, FW = T.campo.FW;
    const giu = {};
    const premi = c => { if (!giu[c]) { giu[c] = 1; window.dispatchEvent(new KeyboardEvent('keydown', { code: c })); } };
    const molla = c => { if (giu[c]) { giu[c] = 0; window.dispatchEvent(new KeyboardEvent('keyup', { code: c })); } };
    const scene = [];
    /* A TERRA: la palla rasoterra, dalle quattro velocita' che il gioco
       usa davvero (passaggio 320-520, tiro 340-640) e da tre distanze. */
    for (const V of [300, 380, 460, 540]) for (const D of [60, 90, 120]) scene.push({ V: V, D: D, Z: 0 });
    /* PER ARIA: la palla che scende, che e' il cibo naturale del volo —
       finche' sta sopra la testa la raccolta non la vede e il volo e'
       l'unica cosa che si puo' fare. */
    for (const V of [300, 420]) for (const D of [90, 140]) for (const Z of [160, 220]) scene.push({ V: V, D: D, Z: Z });
    for (const s of scene) {
      G.scene = 'play'; G.paused = false;
      const ps = T.players;
      let ci = -1;
      /* IL GIOCATORE E' DI MOVIMENTO, NON IL PORTIERE. G.players[0] e' il
         portiere, e updateKeeper lo riporta in area a ogni fotogramma:
         una prima stesura di questa scena misurava un uomo che scappava
         verso la propria porta, e il pallone non lo raggiungeva mai. */
      for (let i = 0; i < ps.length; i++) { if (ps[i].team === 0 && ps[i].role !== 'gk') { ci = i; break; } }
      for (let i = 0; i < ps.length; i++) { if (i !== ci) { ps[i].out = 999; ps[i].x = -4000; ps[i].y = -4000; } }
      G.ctrl[0] = ci; G.cpu[0] = false;
      const p = ps[ci];
      p.out = 0; p.slide = -1; p.recover = 0; p.rove = -1; p.charge = -1; p.kickCd = 0;
      p.x = FW / 2; p.y = FH / 2; p.vx = 0; p.vy = 0; p.fx = 1; p.fy = 0;
      b.x = p.x + s.D; b.y = p.y; b.z = s.Z > 0 ? 1 : 0; b.vz = s.Z;
      b.vx = -s.V; b.vy = 0; b.owner = -1; b.passTo = -1; b.crossTo = -1;
      b.perfectT = 0; b.curve = 0; b.tiroT = -1;
      b.lastTouch = (ci + 1) % ps.length;   // non l'ha toccata lui: se no il volo lo rifiuta
      molla('KeyX');
      let volPrima = (G.stats.volee && G.stats.volee[0]) | 0;
      let spPrima = Math.hypot(b.vx, b.vy);
      let colpito = 0, armato = 0, dArmo = null, tenuto = 0, n = 0, rifiuti = 0;
      while (n < 150) {
        const dx = b.x - p.x, dy = b.y - p.y, d = Math.hypot(dx, dy);
        const sp = Math.hypot(b.vx, b.vy);
        const avv = (b.vx * dx + b.vy * dy) < 0;
        /* IL ROBOT. Finche' la carica non si apre ripreme; appena si apre
           TIENE, e non molla piu' finche' il volo non parte o finche' non
           e' passato mezzo secondo. Un giocatore che ha armato il volo non
           disarma perche' il pallone e' arrivato: e' il momento in cui lo
           voleva. La prima stesura mollava appena il pallone diventava di
           qualcuno, e cosi' misurava il proprio riflesso invece del gioco. */
        if (p.charge >= 0) { armato = 1; tenuto++; premi('KeyX'); }
        else if (tenuto === 0 && b.owner < 0 && sp > 200 && avv && d < 150) {
          molla('KeyX'); premi('KeyX');
          if (p.charge < 0) rifiuti++; else if (dArmo === null) dArmo = +d.toFixed(1);
        } else if (tenuto > 30) { molla('KeyX'); }
        for (let i = 0; i < ps.length; i++) { if (i !== ci) { ps[i].out = 999; ps[i].x = -4000; ps[i].y = -4000; } }
        T.simulate(1 / 60); n++;
        const volOra = (G.stats.volee && G.stats.volee[0]) | 0;
        const spOra = Math.hypot(b.vx, b.vy);
        if (volOra > volPrima && spOra > spPrima) { colpito = 1; break; }
        volPrima = volOra; spPrima = spOra;
      }
      molla('KeyX');
      out.push({ V: s.V, D: s.D, Z: s.Z, colpito: colpito, armato: armato,
                 dArmo: dArmo, rifiuti: rifiuti, frame: n });
    }
    return out;
  });
  await ctx.close();
  const voli = righe.filter(r => r.colpito).length;
  const armati = righe.filter(r => r.armato).length;
  const terra = righe.filter(r => r.Z === 0);
  const aria = righe.filter(r => r.Z > 0);
  const dd = righe.filter(r => r.dArmo !== null).map(r => r.dArmo).sort((x, y) => x - y);
  const dMed = dd.length ? dd[dd.length >> 1] : null;
  return { righe, voli, armati, scene: righe.length, dMediana: dMed,
           voliTerra: terra.filter(r => r.colpito).length, terra: terra.length,
           voliAria: aria.filter(r => r.colpito).length, aria: aria.length, errori };
}

async function misuraC(br, porta, partite) {
  const tot = { voli: 0, occasioni: 0, pressioni: 0, rifiutate: 0, aperte: 0,
                distanze: [], distRifiutate: [], fotogrammi: 0 };
  const errori = [];
  for (let m = 0; m < partite; m++) {
    const s = await apri(br, porta, 20260819 + m * 104729);
    errori.push(...s.errori);
    await s.pag.evaluate(sm => {
      window.__reseme(sm);              // il seme si rimette QUI, non al caricamento
      window.__test.dismissSplash && window.__test.dismissSplash();
      window.__test.startMatch(1, 1);      // squadra 0 all'uomo, squadra 1 alla CPU
      window.__test.Tut && window.__test.Tut.finish && window.__test.Tut.finish(true);
      window.__test.setTimeLeft(150);
    }, 20260819 + m * 104729);
    const r = await s.pag.evaluate(sm => {
      window.__reseme(sm);              // e di nuovo nell'istante in cui la misura comincia
      const T = window.__test, G = T.G;
      const b = T.ball;
      const DIR = ['KeyW', 'KeyS', 'KeyA', 'KeyD'];   // su, giu', sinistra, destra
      const SHOT = 'KeyX';
      const giu = {};
      const premi = c => { if (!giu[c]) { giu[c] = 1; window.dispatchEvent(new KeyboardEvent('keydown', { code: c })); } };
      const molla = c => { if (giu[c]) { giu[c] = 0; window.dispatchEvent(new KeyboardEvent('keyup', { code: c })); } };
      let voli = 0, occasioni = 0, pressioni = 0, rifiutate = 0, aperte = 0, fot = 0;
      const distanze = [], distRifiutate = [];
      let volPrima = (G.stats.volee && G.stats.volee[0]) | 0;
      let spPrima = Math.hypot(b.vx, b.vy);
      let occAperta = false;
      /* IL DUELLO DAL DISCHETTO VA GIOCATO, se no la partita non riparte.
         Sulla scena 'freekick' il gioco aspetta due tasti dall'umano —
         il terzo di porta e poi la potenza — e finche' non arrivano il
         tempo non scorre. Senza queste tre righe il robot passava il 58%
         della partita (5.237 fotogrammi su 9.000) fermo dentro un duello
         che nessuno chiudeva, e il conto dei tiri al volo era zero non
         perche' il volo sia impossibile ma perche' NON SI GIOCAVA. Il
         numero sbagliato non si era visto: sembrava una misura. */
      const grezzo = c => { window.dispatchEvent(new KeyboardEvent('keydown', { code: c }));
                            window.dispatchEvent(new KeyboardEvent('keyup', { code: c })); };
      for (let i = 0; i < 60 * 150; i++) {
        if (G.scene === 'end' || G.scene === 'menu') break;
        if (G.scene === 'freekick') { grezzo('KeyD'); grezzo('KeyX'); T.simulate(1 / 60); fot++; continue; }
        const pi = G.ctrl[0];
        const p = T.players[pi];
        if (!p) { T.simulate(1 / 60); fot++; continue; }
        const dx = b.x - p.x, dy = b.y - p.y;
        const d = Math.hypot(dx, dy);
        const sp = Math.hypot(b.vx, b.vy);
        /* IL ROBOT DEL VOLO. Corre verso il pallone e prova ad armare il
           tiro quando il pallone e' LIBERO, VELOCE e in AVVICINAMENTO: e'
           esattamente la situazione in cui un giocatore vuole il volo, ed
           e' la sola che questa misura riguarda.

           PERCHE' RIPREME INVECE DI TENERE PREMUTO, e perche' non e' un
           trucco. Il gioco ignora l'auto-ripetizione della tastiera
           (if(e.repeat) return), quindi un tasto TENUTO chiama startCharge
           UNA VOLTA SOLA: se in quell'istante il pallone era troppo
           lontano la carica non si apre mai piu', e l'occasione muore
           anche quando il pallone arriva addosso. Un giocatore vero vede
           che la barra della carica non e' comparsa e ripreme — e su
           vetro il pulsante fa lo stesso, un touchstart per volta. Il
           robot ripreme finche' la carica non si apre, e poi TIENE.
           Rileggere p.charge per decidere se ripremere non e' leggere una
           bandiera nascosta: e' la stessa barra che il gioco DISEGNA sullo
           schermo di chi gioca. Il verdetto, invece, non la guarda: e' il
           pallone che riparte. */
        molla('KeyW'); molla('KeyS'); molla('KeyA'); molla('KeyD');
        if (Math.abs(dy) > 6) premi(dy > 0 ? 'KeyS' : 'KeyW');
        if (Math.abs(dx) > 6) premi(dx > 0 ? 'KeyD' : 'KeyA');
        const avvicina = (b.vx * dx + b.vy * dy) < 0;   // il pallone viene verso di lui
        const vuole = b.owner < 0 && sp > 200 && avvicina && d < 26 * 3;
        if (vuole) {
          if (!occAperta) { occasioni++; occAperta = true; }
          if (p.charge < 0) {
            /* la carica non e' aperta: si ripreme. Un keyup su una carica
               chiusa non produce nessun gesto (releaseCharge esce subito
               se charge<0), quindi ripremere non costa un calcio. */
            molla(SHOT);
            premi(SHOT);
            pressioni++;
            distanze.push(+d.toFixed(1));
            /* IL RIFIUTO: dopo il keydown la carica e' ancora chiusa e il
               pallone non e' suo. La soglia l'ha respinto. */
            if (p.charge < 0 && b.owner !== pi) { rifiutate++; distRifiutate.push(+d.toFixed(1)); }
            else aperte++;
          } else premi(SHOT);
        } else {
          molla(SHOT);
          occAperta = false;
        }
        T.simulate(1 / 60); fot++;
        /* IL VOLO LETTO COME EFFETTO: il contatore dei voli sale E il
           pallone ACCELERA nello stesso fotogramma. Un contatore che sale
           senza che il pallone riparta non e' un tiro al volo. */
        const volOra = (G.stats.volee && G.stats.volee[0]) | 0;
        const spOra = Math.hypot(b.vx, b.vy);
        if (volOra > volPrima && spOra > spPrima) voli++;
        volPrima = volOra; spPrima = spOra;
      }
      molla(SHOT); DIR.forEach(molla);
      return { voli: voli, occasioni: occasioni, pressioni: pressioni,
               rifiutate: rifiutate, aperte: aperte,
               distanze: distanze, distRifiutate: distRifiutate, fotogrammi: fot };
    }, 31 + m * 104729);
    tot.voli += r.voli; tot.occasioni += r.occasioni;
    tot.pressioni += r.pressioni; tot.rifiutate += r.rifiutate; tot.aperte += r.aperte;
    tot.fotogrammi += r.fotogrammi;
    tot.distanze.push(...r.distanze);
    tot.distRifiutate.push(...r.distRifiutate);
    await s.ctx.close();
  }
  const dd = tot.distanze.slice().sort((x, y) => x - y);
  const med = dd.length ? dd[dd.length >> 1] : null;
  /* quante armature cadono nella FASCIA CONTESA, cioe' fra KICK_R e
     KICK_R*1.4: sono esattamente quelle che la soglia accusata rifiuta e
     quella di oggi accetta */
  const contesa = dd.filter(x => x > 26 && x <= 36.4).length;
  const oltre = dd.filter(x => x > 36.4).length;
  return { ...tot, mediana: med, contesa, oltre, errori, verde: tot.voli >= C_MIN };
}

/* ===================================================================== */
(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  const R = { gioco: GIOCO, partite: PARTITE, quando: new Date().toISOString() };
  let rosso = 0;

  console.log('BANCO L2.2 — gioco: ' + GIOCO);
  console.log('');

  if (FAI.a) {
    const a = await misuraA(br, srv.porta);
    R.a = a;
    console.log('(a) DOVE CADE UN CROSS — banco deterministico, cross vero');
    console.log('    mirato   caduto   corto     volo');
    for (const r of a.righe) {
      if (r.errore) { console.log('    ' + String(r.dist).padStart(5) + '    ' + r.errore); continue; }
      console.log('    ' + String(r.dist).padStart(5) + '   ' + String(r.caduta).padStart(6) +
                  '   ' + String(r.corto).padStart(5) + '%   ' + String(r.volo).padStart(5) + ' s');
    }
    console.log('    peggiore scarto: ' + a.peggio + '%   (soglia ' + A_MAX_CORTO + '%)');
    console.log('    ' + (a.verde ? 'VERDE' : 'ROSSO'));
    if (!a.verde) rosso++;
    console.log('');
  }

  if (FAI.b) {
    const sb = await misuraBscena(br, srv.porta, 100);
    R.bScena = sb;
    console.log('(b) IL PRIMO TOCCO — scena deterministica, 100 ricezioni per casella');
    console.log('    casella                          sporchi  puliti   quota');
    for (const r of sb.righe) {
      console.log('    ' + r.eti + '  ' + String(r.sporchi).padStart(7) +
                  String(r.puliti).padStart(8) + String(r.perc).padStart(7) + '%');
    }
    console.log('');
    const b = await misuraB(br, srv.porta, PARTITE);
    R.b = b;
    console.log('(b) IL PRIMO TOCCO — ' + PARTITE + ' partite CPU contro CPU, ' + b.fotogrammi + ' fotogrammi');
    console.log('    ricezioni pulite : ' + b.ricezioni);
    console.log('    controlli sporchi: ' + b.sporchi);
    console.log('    contatti totali  : ' + b.contatti);
    console.log('    quota sporca     : ' + b.perc + '%   (forchetta ' + B_MIN + '-' + B_MAX + '%)');
    console.log('    scartati (altra firma): muro=' + b.scarti.muro + ' portiere=' + b.scarti.portiere +
                ' scivolata=' + b.scarti.scivolata + ' lontano=' + b.scarti.lontano);
    const chiavi = Object.keys(b.perGiocatore).sort((x, y) => b.perGiocatore[y] - b.perGiocatore[x]);
    if (chiavi.length) console.log('    per giocatore    : ' +
      chiavi.slice(0, 6).map(k => '#' + k + '=' + b.perGiocatore[k]).join(' '));
    console.log('    ' + (b.verde ? 'VERDE' : 'ROSSO'));
    if (!b.verde) rosso++;
    console.log('');
  }

  if (FAI.c) {
    const sc = await misuraCscena(br, srv.porta);
    R.cScena = sc;
    console.log('(c) IL TIRO AL VOLO — scena deterministica, ' + sc.scene + ' situazioni');
    console.log('    situazione            armata   volo colpito   distanza d armo   rifiuti');
    for (const r of sc.righe) {
      const eti = (r.Z > 0 ? 'aria vz=' + r.Z : 'terra    ') + ' V=' + String(r.V).padStart(3) + ' D=' + String(r.D).padStart(3);
      console.log('    ' + eti.padEnd(22) + String(r.armato ? 'si' : 'NO').padStart(6) +
                  String(r.colpito ? 'SI' : 'no').padStart(14) +
                  String(r.dArmo === null ? '-' : r.dArmo).padStart(18) +
                  String(r.rifiuti).padStart(10));
    }
    console.log('    ARMATE: ' + sc.armati + '/' + sc.scene + '   VOLI COLPITI: ' + sc.voli + '/' + sc.scene +
                '   (a terra ' + sc.voliTerra + '/' + sc.terra + ', per aria ' + sc.voliAria + '/' + sc.aria + ')');
    console.log('    distanza MEDIANA a cui la carica si apre: ' + sc.dMediana +
                ' unita   (soglia ' + C_D_MIN + ')');
    console.log('');
    const c = await misuraC(br, srv.porta, PARTITE);
    R.c = c;
    c.scena = { voli: sc.voli, armati: sc.armati, scene: sc.scene };
    /* IL VERDETTO DI (c) NON E' IL NUMERO DI VOLI, ed e' una lezione di
       questa misura: fra il gioco di oggi e la versione accusata i voli
       colpiti sono 3 contro 2 su venti situazioni, una differenza che il
       rumore si mangia. Quello che cambia davvero e' la DISTANZA a cui la
       carica riesce ad aprirsi — mediana 34,5 contro 23,5 — perche' e'
       esattamente li' che la soglia morde. Il verdetto legge quella, e
       pretende comunque che almeno un volo esista: un banco che non ha
       mai visto un tiro al volo non sta misurando i tiri al volo. */
    c.verde = sc.voli >= C_MIN && sc.dMediana !== null && sc.dMediana >= C_D_MIN;
    console.log('(c) IL TIRO AL VOLO — ' + PARTITE + ' partite col robot del volo, ' + c.fotogrammi + ' fotogrammi');
    console.log('    occasioni di volo: ' + c.occasioni);
    console.log('    armature tentate : ' + c.pressioni + '   aperte: ' + c.aperte +
                '   RIFIUTATE dalla soglia: ' + c.rifiutate);
    console.log('    distanza mediana : ' + c.mediana + ' unita\'  (KICK_R=26, KICK_R*1.4=36,4)');
    console.log('    nella fascia contesa 26 < d <= 36,4: ' + c.contesa +
                '   oltre 36,4: ' + c.oltre);
    console.log('    TIRI AL VOLO COLPITI in partita (contatore su E pallone che accelera): ' + c.voli);
    console.log('    TIRI AL VOLO COLPITI in scena: ' + sc.voli + '/' + sc.scene);
    console.log('    ' + (c.verde ? 'VERDE' : 'ROSSO') + '   (minimo ' + C_MIN + ')');
    if (!c.verde) rosso++;
    console.log('');
  }

  const tuttiErrori = [].concat(R.a ? R.a.errori : [], R.b ? R.b.errori : [],
                               R.c ? R.c.errori : [], R.cScena ? R.cScena.errori : [],
                               R.bScena ? R.bScena.errori : []);
  if (tuttiErrori.length) {
    console.log('ECCEZIONI IN PAGINA (' + tuttiErrori.length + '), la misura NON vale:');
    for (const e of [...new Set(tuttiErrori)].slice(0, 8)) console.log('    ' + e);
    rosso++;
  }
  R.rosso = rosso;
  if (JSONOUT) {
    fs.mkdirSync(path.dirname(path.resolve(JSONOUT)), { recursive: true });
    fs.writeFileSync(path.resolve(JSONOUT), JSON.stringify(R, null, 1));
    console.log('scritto: ' + path.resolve(JSONOUT));
  }
  console.log(rosso ? ('ESITO: ' + rosso + ' misure ROSSE.') : 'ESITO: tutte VERDI.');
  await br.close(); srv.chiudi();
  process.exit(rosso ? 1 : 0);
})();
