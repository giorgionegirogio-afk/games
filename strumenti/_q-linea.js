/* =====================================================================
   _q-linea.js — IL CANCELLO DELLA LINEA (voce L3.1 di _analisi/agente28
   §10): l'unico oggetto che porta la scoperta dei verbi.

   La tesi da sorvegliare e' quella del G2 del progetto: L'ANTEPRIMA DEVE
   DIRE LA VERITA', e si legge DAI PIXEL — mai da una bandiera scritta
   dal codice giudicato. Si preme, si legge dai pixel dove la linea
   punta, si rilascia, e si guarda dove il pallone e' andato DAVVERO.

   CINQUE PROVE:

     A) LA LINEA DEL TIRO. 120 pressioni sul disco TIRA (9 trascinamenti
        verticali x 12 ripetizioni con rumore deterministico, piu' 12
        senza trascinamento: la scelta base). Tenuta 0,65 s (dentro la
        finestra: li' l'errore angolare del gioco e' zero e la promessa
        della linea e' esatta). PRIMA del rilascio si fotografa il
        fotogramma e si leggono i pixel AMBRA su due strisce verticali a
        35% e 65% del tragitto palla->porta: dai due centroidi esce la y
        che la linea promette al piano della porta. Poi si rilascia e si
        misura la y VERA del volo allo stesso piano (posizioni del
        pallone, non intenzioni). «Diversa» se |promessa - vera| > 15
        unita' — 15 = mezza bocca/5, dichiarata cosi': la tacca e' alta
        18 unita' di schermo e il giro del tiro perfetto sposta
        l'arrivo di ~8 unita' a mira piena (misurato qui sotto, colonna
        «scarto»). Linea ASSENTE = diversa. Cancello: diverse <= 2%.

     B) IL PASSAGGIO MOSTRA CHI. 36 pressioni su PASSAGGIO con la
        levetta verso uno di tre compagni piazzati a -40/0/+40 gradi.
        Nel fotogramma dell'anticipo si leggono i pixel GESSO su un
        anello di raggio 60 unita' attorno al pallone (semiarco verso la
        levetta: il corpo del portatore sta dall'altra parte) -> l'angolo
        che la linea promette. Poi il calcio vero (sonda su kickBall,
        l'imbuto unico dichiarato dal gioco) -> l'angolo vero, e il
        ricevente vero (b.passTo, scritto dall'esecutore del gioco, non
        dall'anteprima). «Diversa» se |angoli| > 14 gradi o se il
        ricevente non e' il compagno che la linea indicava. <= 2%.

     C) L'ARCO DEL CROSS. 12 pressioni su PASSAGGIO con lo sprint tenuto
        dalla meta' campo offensiva: il verbo e' il cross e il pallone
        SI ALZA. I pixel CIANO nel riquadro della corda devono stare
        SOPRA la corda (>= 4 unita' al centro: la forma dice «si alza»)
        e il punto piu' avanzato del segno deve cadere entro 30 unita'
        dall'atterraggio VERO (simulato: il primo fotogramma con z che
        torna a terra). 12 su 12.

     D) IL RIFIUTO VISIBILE. 15 pressioni su CONTRASTA con l'uomo in
        rialzata (recover > 0: il caso in cui il disco mente, misurato
        da _t-l04b al 2%) -> nessuna scivolata nasce (EFFETTO: charge e
        slide restano spenti) e il segno ROSSO del no deve comparire
        entro 2 fotogrammi nei pixel attorno al comandato. 15 pressioni
        SANE di controllo -> la scivolata nasce e il segno NON compare.
        Piu' 6 rilasci di CAMBIO trascinato senza portatore avversario
        (comandaRaddoppio torna false: lo dice il gioco, non l'anteprima)
        -> il segno compare. Ogni riquadro si pre-verifica VUOTO di
        rosso prima della pressione, se no la prova e' NULLA, non verde.

     E) EQUITA' AL BIT. 1200 passi con un robot a calendario fisso
        (dita vere via CDP, pressioni e trascinamenti su entrambi i
        dischi, disegno ogni 7 passi) su --gioco e su --contro, stesso
        seme: pallone, controllo e punteggio devono coincidere passo per
        passo. L'anteprima e' disegno: se scrivesse un bit nella
        simulazione, qui diverge. (Sul gioco di oggi --gioco e --contro
        coincidono e la prova e' verde per costruzione: dichiarato.)

     --costo) IL PREZZO. Per le taglie 5/7/11: dito armato sul TIRA
        (linea accesa, il caso persistente), 3 giri alternati di 200
        __test.disegna() su --gioco e su --contro -> delta delle
        mediane; piu' la misura diretta di disegnaLineaGuida (3000
        chiamate sotto la trasformazione vera del mondo) dove esiste.
        Budget della voce: <= 0,5 ms per fotogramma.

   CONTROLLO NEGATIVO: questo cancello e' stato scritto PRIMA della
   toppa e mostrato ROSSO sul gioco di oggi (A, B, C, D rossi — la linea
   non esiste; E verde per costruzione, dichiarato sopra).

   uso:
     node strumenti/_q-linea.js                        (sul gioco di casa)
     node strumenti/_q-linea.js --gioco fuori/linea.html
     node strumenti/_q-linea.js --gioco fuori/linea.html --costo
     node strumenti/_q-linea.js --contro CALCETTO-il-gioco.html
   esce 0 se tutto verde, 1 se anche un solo rosso, 2 se il banco e'
   esploso, 3 se una prova e' NULLA (la scena non ha provato niente).
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
const CONTRO = path.resolve(arg('contro', path.join(RADICE, 'CALCETTO-il-gioco.html')));
const TESTA = process.argv.includes('--testa');
const COSTO = process.argv.includes('--costo');
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
               '.png': 'image/png', '.json': 'application/json' };

/* Playwright non apre file: — serve un server locale (modello di casa:
   _q-l13.js). Qualunque richiesta del gioco viene deviata sul file
   passato come secondo argomento di servi(). */
function servi(file) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (/CALCETTO-il-gioco\.html$/i.test(f)) f = file;
      if ((!f.startsWith(RADICE) && f !== file) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        res.writeHead(404); res.end('no'); return;
      }
      res.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream',
                           'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* il tempo in mano al banco: rAF e performance.now appartengono al
   banco; la simulazione avanza con __test.simulate / __passoPin. */
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

/* LA SONDA: avvolge kickBall, l'imbuto unico di tutti i calci (lo
   dichiara il gioco stesso sopra b.crossTo). Registra chi calcia, la
   velocita' vera e il vz del pallone DOPO il gesto. Conta, non decide. */
function installaSonda() {
  if (window.__sonda) return 'gia';
  if (typeof window.kickBall !== 'function')
    return 'BANCO INVECCHIATO: window.kickBall non esiste piu\'.';
  const G = window.__test.G;
  const S = { calci: [], tot: 0 };
  window.__sonda = S;
  const orig = window.kickBall;
  window.kickBall = function (p, nx, ny, speed, spinY) {
    const r = orig.call(this, p, nx, ny, speed, spinY);
    S.tot++;
    if (r) S.calci.push({ chi: G.players.indexOf(p), vx: G.ball.vx, vy: G.ball.vy });
    return r;
  };
  return 'ok';
}

/* ---------------------------------------------------------------------
   LA SCENA (modello _q-l13): partita in corso, comandato dove chiede la
   prova, tutti gli altri INCHIODATI fotogramma per fotogramma — e il
   cambio automatico BLOCCATO (swLock rialzato a ogni passo), perche' con
   la palla libera lontana il controllo scapperebbe su una comparsa e il
   disco comanderebbe un uomo che la prova non guarda.
   cfg:
     x,y            dove sta il comandato
     compagni       [[dx,dy],..] fino a 3 compagni di movimento accanto
     pallaLibera    [x,y] la palla non e' di nessuno, sta li'
     recover        secondi di rialzata da imporre al comandato
     taglia         5|7|11 (solo al primo avvio della pagina)
   --------------------------------------------------------------------- */
function preparaScena(cfg) {
  const t = window.__test, G = t.G;
  try { t.dismissSplash && t.dismissSplash(); } catch (e) {}
  t.setPaused && t.setPaused(false);
  try { if (t.Tut && t.Tut.active && t.Tut.finish) t.Tut.finish(true); } catch (e) {}
  for (let g = 0; g < 3 && G.scene !== 'play'; g++) {
    for (let i = 0; i < 200 && G.scene !== 'play'; i++) t.simulate(0.1);
    if (G.scene !== 'play') { t.startMatch(1, 1, cfg.taglia ? { size: cfg.taglia } : undefined); for (let i = 0; i < 80 && G.scene !== 'play'; i++) t.simulate(0.1); }
  }
  if (G.scene !== 'play') return { errore: "la partita non arriva in gioco: scena '" + G.scene + "'" };
  /* il contatore degli eventi tocco: la mano del banco ASPETTA che ogni
     evento CDP sia davvero arrivato alla pagina prima di fare il passo
     successivo — senza, l'ordine evento/passo e' una gara e la prova E
     divergeva fra due corse identiche */
  if (!window.__contaEventi && window.__contaEventi !== 0) {
    window.__contaEventi = 0;
    for (const tp of ['touchstart', 'touchmove', 'touchend', 'touchcancel'])
      document.addEventListener(tp, () => { window.__contaEventi++; }, true);
  }
  t.setTimeLeft && t.setTimeLeft(400);
  /* movimento ridotto: niente lampi, zolle, scia e scossa — i pixel che
     il cancello legge non devono contenere i coriandoli del rilascio
     precedente, e la linea (che e' informazione, non movimento) deve
     esserci lo stesso: se sparisse a moto ridotto sarebbe un difetto
     vero e questo cancello lo vedrebbe come assenza */
  t.setMoto && t.setMoto(0);
  const c0 = t.campo, FW = c0.FW, FH = c0.FH;
  const players = G.players, ball = G.ball;
  const pi = G.ctrl[0];
  if (pi < 0) return { errore: 'nessun giocatore comandato' };
  const p = players[pi];
  if (p.charge !== undefined && p.charge >= 0) { p.charge = -1; p.chargeGo = null; }
  p.slide = -1; p.recover = 0; if (p.rove !== undefined) p.rove = -1;
  p.kickCd = 0; p.out = 0;
  p.tiro = 62; p.tecnica = 62;
  p.x = cfg.x; p.y = cfg.y; p.vx = 0; p.vy = 0; p.fx = 1; p.fy = 0;
  const b = ball;
  b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0; b.curve = 0; b.perfectT = 0;
  b.passTo = -1; b.crossTo = -1;
  if (cfg.pallaLibera) { b.owner = -1; b.x = cfg.pallaLibera[0]; b.y = cfg.pallaLibera[1]; }
  else { b.owner = pi; b.x = p.x + 8; b.y = p.y; }
  /* le comparse: compagni della prova accanto, tutti gli altri lontani
     e registrati in __posti per l'inchiodatura passo per passo */
  window.__posti = {};
  let nComp = 0;
  for (let i = 0; i < players.length; i++) {
    const q = players[i];
    if (i === pi) continue;
    if (q.team === 0 && q.role !== 'gk' && cfg.compagni && nComp < cfg.compagni.length) {
      q.x = Math.max(30, Math.min(FW - 30, cfg.x + cfg.compagni[nComp][0]));
      q.y = Math.max(30, Math.min(FH - 30, cfg.y + cfg.compagni[nComp][1]));
      nComp++;
    } else if (q.team === 1 && q.role === 'gk') { q.x = FW - 26; q.y = 28; }
    else if (q.team === 0) {
      q.x = Math.max(30, cfg.x - 420 - ((i % 3) * 60));
      q.y = Math.max(30, Math.min(FH - 30, 60 + ((i * 131) % Math.max(60, FH - 120))));
    } else {
      q.x = Math.max(30, Math.min(FW - 30, cfg.x - 360 - ((i % 4) * 55)));
      q.y = Math.max(30, Math.min(FH - 30, 40 + ((i * 97) % Math.max(60, FH - 80))));
      if (Math.hypot(q.x - b.x, q.y - b.y) < 300) q.x = Math.max(30, b.x - 380);
    }
    q.vx = 0; q.vy = 0; q.chiamata = 0;
    if (q.charge !== undefined && q.charge >= 0) { q.charge = -1; q.chargeGo = null; }
    q.slide = -1; q.recover = 0;
    window.__posti[i] = { x: q.x, y: q.y };
  }
  window.__piScena = pi;
  window.__pianoX = FW - 2;
  window.__pin = function () {
    const G2 = window.__test.G;
    const pl = G2.players;
    /* il controllo resta sull'uomo della scena: swLock rialzato ferma il
       cambio AUTOMATICO (quello manuale del disco non lo legge) */
    G2.swLock[0] = 5;
    for (const k in window.__posti) {
      const q = pl[+k], o = window.__posti[k];
      q.x = o.x; q.y = o.y; q.vx = 0; q.vy = 0; q.chiamata = 0;
      if (q.slide !== undefined && q.slide >= 0) q.slide = -1;
      if (q.charge !== undefined && q.charge >= 0 && q.team === 1) { q.charge = -1; q.chargeGo = null; }
    }
  };
  window.__passoPin = function (n) {
    n = Math.max(0, Math.round(+n || 0));
    for (let i = 0; i < n; i++) { window.__pin(); window.__test.simulate(1 / 60); }
    return window.__test.G.players[window.__piScena].charge;
  };
  if (cfg.recover) p.recover = cfg.recover;
  window.__volo = function () {
    const b2 = window.__test.G.ball, stop = window.__pianoX - 12;
    let prev = { x: b2.x, y: b2.y }, out = null;
    for (let n = 0; n < 130; n++) {
      window.__pin(); window.__test.simulate(1 / 60);
      const cur = { x: b2.x, y: b2.y };
      if (b2.owner >= 0 && b2.owner !== window.__piScena) { out = { presa: true }; break; }
      if (cur.x >= stop) {
        const dx = (cur.x - prev.x) || 1e-9;
        out = { y: cur.y + (cur.y - prev.y) / dx * (window.__pianoX - cur.x) };
        break;
      }
      prev = cur;
    }
    return out || { persa: true };
  };
  window.__atterra = function () {
    const b2 = window.__test.ball;
    let su = false;
    for (let n = 0; n < 110; n++) {
      const z0 = b2.z || 0;
      window.__pin(); window.__test.simulate(1 / 60);
      if ((b2.z || 0) > 0.5) su = true;
      if (su && (b2.z || 0) <= 0.01) return { x: b2.x, y: b2.y };
      if (b2.owner >= 0) return { presa: true, x: b2.x, y: b2.y };
    }
    return { persa: true };
  };
  window.__riposa = function (cx, cy) {
    const pl = window.__test.players, k = window.__piScena, p2 = pl[k], b2 = window.__test.ball;
    p2.x = cx; p2.y = cy; p2.vx = 0; p2.vy = 0; p2.recover = 0; p2.slide = -1;
    p2.kickCd = 0; p2.kickT = 0;
    b2.vx = 0; b2.vy = 0; b2.vz = 0; b2.z = 0; b2.curve = 0; b2.perfectT = 0;
    b2.passTo = -1; b2.crossTo = -1; b2.owner = k; b2.x = p2.x + 8; b2.y = p2.y;
    if (p2.charge !== undefined && p2.charge >= 0) { p2.charge = -1; p2.chargeGo = null; }
    return true;
  };
  /* --- lettura dei pixel per CLASSE di colore, in coordinate MONDO ---
     classi: 1 ambra (255,176,32), 2 gesso (242,245,239),
             3 ciano (57,211,230), 4 rosso (255,77,77) — le tinte della
     lingua dei segni del gioco (COL), lette con margini larghi perche'
     la linea sta sopra l'erba con uno zoccolo scuro. */
  /* le classi sono STRETTE apposta, e ogni stretta ha una ragione
     misurata su questo banco:
       · ambra: b <= 75 e g <= 190, perche' le pozze dei fari al sodio
         della sera sono (255,197,85) e cadevano nella classe larga;
       · rosso: r >= 228, perche' il kit cremisi della squadra 0 e'
         (204,66,100) e cadeva nella classe larga. Il segno del no
         a piena alfa resta a r ~236. */
  window.__classe = function (r, g, bb) {
    if (r >= 190 && g >= 125 && g <= 190 && bb <= 75) return 1;
    if (r >= 205 && g >= 205 && bb >= 195) return 2;
    if (r <= 140 && g >= 160 && bb >= 185) return 3;
    if (r >= 228 && g <= 118 && bb <= 118) return 4;
    return 0;
  };
  /* centroide dei pixel di una classe dentro un rettangolo di MONDO,
     con ESCLUSIONI: i cerchi attorno ai corpi vivi. Le maglie sono
     libere di essere celesti o rosse (il kit CELESTE ha gia' fatto
     scattare un falso ciano su questo banco: il portiere inchiodato
     viene riportato dalla sua logica sulla linea di porta, dentro il
     riquadro della prova C), quindi i pixel entro r unita' da un corpo
     non si contano MAI. La geometria dell'esclusione vive nel banco e
     si stampa qui: raggio 36 = sagoma piu' larga (13) + alone (18) +
     margine.
     Ritorna {n, cx, cy, xmax (mondo del pixel piu' a est), ymax} */
  window.__escVivi = function (r) {
    const pl = window.__test.G.players, out = [];
    for (const q of pl) { if (q.out > 0) continue; out.push({ x: q.x, y: q.y, r: (r || 36) }); }
    return out;
  };
  /* LA FOTO DI RIFERIMENTO — il campo non e' neutro: questo banco ha
     trovato arte statica del manto in celeste #8ad9ff nella zona
     dell'area e pozze dei fari al sodio (255,197,85) che cadevano nelle
     classi. La cura non e' inseguire ogni tinta: si SCATTA il riquadro
     PRIMA della pressione (camera assestata) e poi si contano solo i
     pixel la cui classe e' NUOVA rispetto alla foto — con un intorno di
     2 px, per la deriva subpixel della camera. Cio' che sta fermo si
     annulla da solo. */
  window.__scatta = function (wx0, wy0, wx1, wy1) {
    window.__test.disegna();
    const cv = document.getElementById('gioco'), c2 = cv.getContext('2d');
    const v = window.__test.view, dpr = cv.width / innerWidth;
    const sx0 = Math.max(0, Math.floor((wx0 * v.S2 + v.Ax) * dpr));
    const sy0 = Math.max(0, Math.floor((wy0 * v.S2 + v.Ay) * dpr));
    const sx1 = Math.min(cv.width, Math.ceil((wx1 * v.S2 + v.Ax) * dpr));
    const sy1 = Math.min(cv.height, Math.ceil((wy1 * v.S2 + v.Ay) * dpr));
    if (sx1 <= sx0 || sy1 <= sy0) { window.__rifFoto = null; return false; }
    const W = sx1 - sx0, H = sy1 - sy0;
    const img = c2.getImageData(sx0, sy0, W, H).data;
    const cls = new Uint8Array(W * H);
    for (let i = 0, j = 0; i < W * H; i++, j += 4) cls[i] = window.__classe(img[j], img[j + 1], img[j + 2]);
    window.__rifFoto = { sx0, sy0, W, H, cls };
    return true;
  };
  window.__leggi = function (wx0, wy0, wx1, wy1, classe, esc, nuovi) {
    const cv = document.getElementById('gioco'), c2 = cv.getContext('2d');
    const v = window.__test.view, dpr = cv.width / innerWidth;
    const sx0 = Math.max(0, Math.floor((wx0 * v.S2 + v.Ax) * dpr));
    const sy0 = Math.max(0, Math.floor((wy0 * v.S2 + v.Ay) * dpr));
    const sx1 = Math.min(cv.width, Math.ceil((wx1 * v.S2 + v.Ax) * dpr));
    const sy1 = Math.min(cv.height, Math.ceil((wy1 * v.S2 + v.Ay) * dpr));
    if (sx1 <= sx0 || sy1 <= sy0) return { fuori: true, n: 0 };
    const W = sx1 - sx0, H = sy1 - sy0;
    const img = c2.getImageData(sx0, sy0, W, H).data;
    let n = 0, sxs = 0, sys = 0, xm = -1e9, ym = 0;
    const inv = 1 / (v.S2 * dpr);
    const R = nuovi ? window.__rifFoto : null;
    for (let y = 0; y < H; y++) {
      const wy = (sy0 + y) * inv - v.Ay / v.S2;
      for (let x = 0; x < W; x++) {
        const o = (y * W + x) * 4;
        if (window.__classe(img[o], img[o + 1], img[o + 2]) !== classe) continue;
        if (esc) {
          const wx = (sx0 + x) * inv - v.Ax / v.S2;
          let dentro = false;
          for (const e of esc) { const dx = wx - e.x, dy = wy - e.y; if (dx * dx + dy * dy < e.r * e.r) { dentro = true; break; } }
          if (dentro) continue;
        }
        if (R) {
          /* era della stessa classe gia' PRIMA della pressione, entro
             2 px? Allora e' campo, non anteprima */
          const rx = (sx0 + x) - R.sx0, ry = (sy0 + y) - R.sy0;
          let visto = false;
          for (let dy2 = -2; dy2 <= 2 && !visto; dy2++) for (let dx2 = -2; dx2 <= 2; dx2++) {
            const qx = rx + dx2, qy = ry + dy2;
            if (qx >= 0 && qy >= 0 && qx < R.W && qy < R.H && R.cls[qy * R.W + qx] === classe) { visto = true; break; }
          }
          if (visto) continue;
        }
        n++; sxs += x; sys += y;
        if (x > xm) { xm = x; ym = y; }
      }
    }
    if (!n) return { n: 0 };
    return { n: n,
      cx: (sx0 + sxs / n) * inv - v.Ax / v.S2 + 0.5 * inv,
      cy: (sy0 + sys / n) * inv - v.Ay / v.S2 + 0.5 * inv,
      xmax: (sx0 + xm) * inv - v.Ax / v.S2,
      ymax: (sy0 + ym) * inv - v.Ay / v.S2 };
  };
  const bt = t.pulsanti(0);
  const grande = bt.reduce((a, c) => (c.r || 0) > (a.r || 0) ? c : a, bt[0]);
  const piccolo = bt.reduce((a, c) => (c.r || 0) < (a.r || 0) ? c : a, bt[0]);
  const sotto = document.elementFromPoint(grande.x, grande.y);
  if (!sotto || sotto.id !== 'gioco')
    return { errore: 'sul disco (' + grande.x + ',' + grande.y + ') non c\'e\' la tela ma ' + (sotto ? sotto.tagName + '#' + sotto.id : 'niente') };
  return { pi, FW, FH, GOAL_H: c0.GOAL_H,
           px: players[pi].x, py: players[pi].y,
           grande: { x: grande.x, y: grande.y, r: grande.r, act: grande.act },
           piccolo: { x: piccolo.x, y: piccolo.y, r: piccolo.r, act: piccolo.act } };
}

const n2 = v => (v === null || v === undefined || !isFinite(v)) ? 'n/d' : (Math.round(v * 100) / 100).toString().replace('.', ',');
/* rumore deterministico del banco (non tocca il Math.random del gioco) */
function lcg(seme) { let s = seme >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

(async () => {
  const srv = await servi(GIOCO);
  const br = await chromium.launch({ headless: !TESTA });
  const ctx = await br.newContext({ viewport: { width: 915, height: 412 },
    deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const eccezioni = [];

  function mano(cdp, pag) {
    const S = { L: null, R: null };
    let attesi = 0;
    const pts = () => [S.L, S.R].filter(Boolean).map(p => ({ x: p.x, y: p.y, id: p.id }));
    /* ogni invio ASPETTA che la pagina abbia contato l'evento: il
       protocollo consegna in modo asincrono e senza questa attesa
       l'ordine evento/passo e' una gara (E divergeva per questo) */
    const manda = async (type, punti) => {
      attesi++;
      await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: punti });
      await pag.waitForFunction(n => window.__contaEventi >= n, attesi, { timeout: 5000 });
    };
    return {
      async giuL(x, y) { S.L = { x, y, id: 1 }; await manda('touchStart', pts()); },
      async muoviL(x, y) { S.L.x = x; S.L.y = y; await manda('touchMove', pts()); },
      async giuR(x, y) { S.R = { x, y, id: 2 }; await manda('touchStart', pts()); },
      async muoviR(x, y) { S.R.x = x; S.R.y = y; await manda('touchMove', pts()); },
      /* in un touchEnd i touchPoints sono i punti CHE SI ALZANO (lezione
         di _q-l13, misurata) */
      async suR() { const r = S.R; S.R = null; await manda('touchEnd', [{ x: r.x, y: r.y, id: r.id }]); },
      async fine() { try { S.L = null; S.R = null; await manda('touchCancel', []); } catch (e) {} },
    };
  }

  const CASA_L = { x: 165, y: 272 };

  async function apri(cfg, file) {
    const pag = await ctx.newPage();
    /* il salvataggio si azzera PRIMA del gioco: senza, la prima pagina
       lascia tutorial e trofei nel localStorage dell'origine e la
       successiva parte da uno stato diverso — E divergeva per questo */
    await pag.addInitScript(() => { try { localStorage.clear(); } catch (e) {} });
    await pag.addInitScript(seme => {
      let s = seme >>> 0 || 1;
      const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
      Math.random = () => p() / 4294967296;
    }, 20260820);
    await pag.addInitScript(bancoDiProva);
    pag.on('pageerror', e => eccezioni.push(e.message));
    const porta = file ? (await serviCache(file)).porta : srv.porta;
    await pag.goto('http://127.0.0.1:' + porta + '/CALCETTO-il-gioco.html', { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(() => window.__banco.passo(6));
    const sonda = await pag.evaluate(installaSonda);
    if (sonda !== 'ok' && sonda !== 'gia') { console.error('FALLITO: ' + sonda); process.exit(2); }
    const cdp = await ctx.newCDPSession(pag);
    const q = await pag.evaluate(preparaScena, cfg);
    if (q.errore) throw new Error('scena: ' + q.errore);
    const m = mano(cdp, pag);
    const passo = n => pag.evaluate(k => window.__passoPin(k), n);
    await m.giuL(CASA_L.x, CASA_L.y);
    await passo(1);
    await m.muoviL(CASA_L.x + 8, CASA_L.y);
    await passo(2);
    return { pag, cdp, q, m, passo };
  }
  /* un server per il file di confronto (E, costo) */
  const cacheSrv = {};
  async function serviCache(file) {
    if (!cacheSrv[file]) cacheSrv[file] = await servi(file);
    return cacheSrv[file];
  }

  const esiti = [];
  const righe = [];
  const stampa = s => { righe.push(s); console.log(s); };

  stampa('=== CANCELLO L3.1 — la linea, il cambio di forma, l\'arco, il rifiuto ===');
  stampa('  gioco:  ' + GIOCO);
  stampa('  contro: ' + CONTRO + (GIOCO === CONTRO ? '  (lo stesso file: E verde per costruzione)' : ''));
  stampa('  banco: Chromium 915x412 dpr2, due dita di protocollo (il sinistro non si alza mai),');
  stampa('         passo fisso 1/60, Math.random a seme 20260820, comparse inchiodate');
  stampa('');

  /* ===================================================================
     A — LA LINEA DEL TIRO DICE IL VERO
     =================================================================== */
  let okA = null;
  {
    const rnd = lcg(101);
    const ctx2 = await apri({ x: 800, y: 300 });   // primo giro: si legge il campo vero
    const { q, m, passo, pag } = ctx2;
    const cfg = { x: q.FW - 260, y: q.FH / 2 };
    const T = [-26, -19, -13, -6, 0, 6, 13, 19, 26];
    let tot = 0, assenti = 0, diverse = 0, nulle = 0;
    const scarti = [];
    stampa('A) LA LINEA DEL TIRO — 120 pressioni, tenuta 0,65 s, promessa letta dai pixel su due strisce');
    const prove = [];
    for (let g = 0; g < 12; g++) {
      for (const tt of T) prove.push({ drag: [-46 + (rnd() * 10 - 5), tt + (rnd() * 4 - 2)], jx: rnd() * 10 - 5, jy: rnd() * 10 - 5 });
      prove.push({ drag: null, jx: rnd() * 10 - 5, jy: rnd() * 10 - 5 });   // la scelta base
    }
    /* 12 giri x (9 armate + 1 base) = 120 pressioni */
    for (const pr of prove) {
      const rip = await pag.evaluate(preparaScena, cfg);
      if (rip.errore) { nulle++; continue; }
      const P = rip.grande;
      if (P.act !== 'shot') { nulle++; continue; }
      /* la camera si assesta (30 passi a scena ferma), poi la FOTO DI
         RIFERIMENTO: da qui in poi contano solo i pixel NUOVI */
      await passo(30);
      await pag.evaluate(() => {
        const b = window.__test.ball, FW2 = window.__pianoX + 2, fh = window.__test.campo.FH;
        window.__scatta(b.x + 20, fh / 2 - 135, FW2, fh / 2 + 135);
      });
      await pag.evaluate(() => { window.__sonda.calci = []; });
      await m.giuR(P.x + pr.jx, P.y + pr.jy);
      if (pr.drag) {
        for (let k = 1; k <= 10; k++) {
          await passo(1);
          await m.muoviR(P.x + pr.jx + pr.drag[0] * k / 10, P.y + pr.jy + pr.drag[1] * k / 10);
        }
        await passo(29);
      } else await passo(39);
      /* la promessa, dai pixel: QUATTRO strisce adattive — un corpo
         (il portiere che la sua logica riporta in zona) puo' coprirne
         una, e i suoi pixel sono comunque esclusi per geometria */
      const lettura = await pag.evaluate(() => {
        window.__test.disegna();
        const b = window.__test.ball, FW2 = window.__pianoX + 2;
        const fh = window.__test.campo.FH;
        const esc = window.__escVivi(36);
        const strisce = [];
        for (const fr of [0.25, 0.40, 0.55, 0.70]) {
          const x = b.x + (FW2 - b.x) * fr;
          const s = window.__leggi(x - 1.5, fh / 2 - 130, x + 1.5, fh / 2 + 130, 1, esc, true);
          if (s.n >= 3) strisce.push({ x: x, cy: s.cy });
        }
        return { bx: b.x, by: b.y, strisce };
      });
      await m.suR();
      const volo = await pag.evaluate(() => window.__volo());
      tot++;
      if (!volo || volo.persa || volo.presa) { nulle++; tot--; continue; }
      if (lettura.strisce.length < 2) { assenti++; diverse++; continue; }
      const s1 = lettura.strisce[0], s2 = lettura.strisce[lettura.strisce.length - 1];
      const pend = (s2.cy - s1.cy) / (s2.x - s1.x);
      const yProm = s2.cy + pend * ((q.FW - 2) - s2.x);
      const d = Math.abs(yProm - volo.y);
      scarti.push(d);
      if (d > 15) diverse++;
    }
    if (tot < 100) { okA = null; stampa('   PROVA NULLA: solo ' + tot + ' pressioni misurate (' + nulle + ' scene rotte)'); }
    else {
      scarti.sort((a, b) => a - b);
      const med = scarti.length ? scarti[Math.floor(scarti.length / 2)] : null;
      const mx = scarti.length ? scarti[scarti.length - 1] : null;
      okA = (diverse / tot) <= 0.02;
      stampa('   pressioni ' + tot + ' · linea assente ' + assenti + ' · promessa!=esito ' + diverse + ' (' + n2(diverse / tot * 100) + '%)');
      stampa('   scarto |promessa-vera| al piano: mediana ' + n2(med) + ' u, massimo ' + n2(mx) + ' u (soglia 15)');
      stampa('   soglia: diverse <= 2%   ->  ' + (okA ? 'VERDE' : 'ROSSO'));
    }
    await ctx2.m.fine(); await ctx2.pag.close();
    esiti.push({ id: 'A', nome: 'la linea del tiro punta dove il pallone va', ok: okA });
    stampa('');
  }

  /* ===================================================================
     B — IL PASSAGGIO MOSTRA CHI
     =================================================================== */
  let okB = null;
  {
    const ctx2 = await apri({ x: 700, y: 300 });
    const { q, m, passo, pag } = ctx2;
    const ANG = [-0.6981, 0, 0.6981];        // -40, 0, +40 gradi
    const comp = ANG.map(a => [Math.cos(a) * 180, Math.sin(a) * 180]);
    const cfg = { x: q.FW * 0.30, y: q.FH * 0.62, compagni: comp };
    let tot = 0, assenti = 0, diverse = 0, nulle = 0;
    const dAng = [];
    stampa('B) IL PASSAGGIO MOSTRA CHI — 36 pressioni, tre compagni a -40/0/+40 gradi, linea letta su un anello di 60 u');
    for (let g = 0; g < 12; g++) {
      for (let ai = 0; ai < 3; ai++) {
        const rip = await pag.evaluate(preparaScena, cfg);
        if (rip.errore) { nulle++; continue; }
        const P = rip.piccolo;
        if (P.act !== 'through') { nulle++; continue; }
        const a = ANG[ai];
        /* camera assestata, mira con la levetta, FOTO DI RIFERIMENTO
           dell'intorno del pallone, e solo allora la pressione */
        await passo(30);
        await m.muoviL(CASA_L.x + Math.cos(a) * 40, CASA_L.y + Math.sin(a) * 40);
        await passo(2);
        await pag.evaluate(() => {
          const b = window.__test.ball;
          window.__scatta(b.x - 75, b.y - 75, b.x + 75, b.y + 75);
        });
        await pag.evaluate(() => { window.__sonda.calci = []; });
        await m.giuR(P.x, P.y);
        await passo(1);
        const lettura = await pag.evaluate(dir => {
          window.__test.disegna();
          const b = window.__test.ball;
          /* semiarco di 150 gradi attorno alla direzione chiesta, r 55-65:
             il corpo del portatore sta dall'altra parte; i corpi vivi
             sono comunque esclusi per geometria */
          const esc = window.__escVivi(30);
          let n = 0, vx = 0, vy = 0;
          for (let k = -38; k <= 38; k++) {
            const a2 = dir + k * 0.0345;
            for (const r of [55, 60, 65]) {
              const wx = b.x + Math.cos(a2) * r, wy = b.y + Math.sin(a2) * r;
              const c = window.__leggi(wx - 1.2, wy - 1.2, wx + 1.2, wy + 1.2, 2, esc, true);
              if (c.n) { n += c.n; vx += Math.cos(a2) * c.n; vy += Math.sin(a2) * c.n; }
            }
          }
          return { n, ang: n ? Math.atan2(vy, vx) : null };
        }, a);
        /* fino alla maturazione dell'anticipo (PASS_CAR_U = 3 fotogrammi) */
        await passo(5);
        const calcio = await pag.evaluate(() => {
          const S = window.__sonda, k = window.__piScena;
          const miei = S.calci.filter(c => c.chi === k);
          const b = window.__test.ball;
          return miei.length ? { ang: Math.atan2(miei[0].vy, miei[0].vx), passTo: b.passTo } : null;
        });
        await m.suR();
        await passo(3);
        await m.muoviL(CASA_L.x + 8, CASA_L.y);
        await passo(1);
        tot++;
        if (!calcio) { nulle++; tot--; continue; }
        if (!lettura.n || lettura.ang === null) { assenti++; diverse++; continue; }
        let d = Math.abs(calcio.ang - lettura.ang) * 180 / Math.PI;
        if (d > 180) d = 360 - d;
        dAng.push(d);
        /* il ricevente indicato dalla linea: il compagno col minimo
           scarto angolare rispetto all'angolo LETTO DAI PIXEL */
        const attesi = await pag.evaluate(al => {
          const pl = window.__test.players, b = window.__test.ball, k = window.__piScena;
          let mi = -1, ms = 1e9;
          for (let i = 0; i < pl.length; i++) {
            const p2 = pl[i];
            if (p2.team !== 0 || i === k || p2.role === 'gk' || p2.out > 0) continue;
            let da = Math.abs(Math.atan2(p2.y - b.y, p2.x - b.x) - al);
            if (da > Math.PI) da = 2 * Math.PI - da;
            if (da < ms) { ms = da; mi = i; }
          }
          return mi;
        }, lettura.ang);
        if (d > 14 || calcio.passTo !== attesi) diverse++;
      }
    }
    if (tot < 30) { okB = null; stampa('   PROVA NULLA: solo ' + tot + ' pressioni misurate (' + nulle + ' scene rotte)'); }
    else {
      dAng.sort((x, y) => x - y);
      okB = (diverse / tot) <= 0.02;
      stampa('   pressioni ' + tot + ' · linea assente ' + assenti + ' · promessa!=esito ' + diverse + ' (' + n2(diverse / tot * 100) + '%)');
      stampa('   scarto angolare linea/calcio: mediana ' + n2(dAng.length ? dAng[Math.floor(dAng.length / 2)] : null) + ' gradi (soglia 14)');
      stampa('   soglia: diverse <= 2%   ->  ' + (okB ? 'VERDE' : 'ROSSO'));
    }
    await ctx2.m.fine(); await ctx2.pag.close();
    esiti.push({ id: 'B', nome: 'la linea del passaggio indica il ricevente vero', ok: okB });
    stampa('');
  }

  /* ===================================================================
     C — L'ARCO DEL CROSS
     =================================================================== */
  let okC = null;
  {
    const rnd = lcg(303);
    const ctx2 = await apri({ x: 700, y: 300 });
    const { q, m, passo, pag } = ctx2;
    let tot = 0, buone = 0, nulle = 0;
    const dettagli = [];
    stampa('C) L\'ARCO DEL CROSS — 12 pressioni con lo sprint dalla meta\' offensiva: la forma si alza, il segno cade dove cade il pallone');
    for (let g = 0; g < 12; g++) {
      const cfg = { x: q.FW - 380 + (rnd() * 80 - 40), y: q.FH - 90 - rnd() * 30 };
      const rip = await pag.evaluate(preparaScena, cfg);
      if (rip.errore) { nulle++; continue; }
      const P = rip.piccolo;
      if (P.act !== 'through') { nulle++; continue; }
      /* camera assestata e FOTO DI RIFERIMENTO del riquadro della corda;
         lo sprint si chiede DOPO lo scatto e la pressione arriva subito,
         cosi' fra foto e lettura passa un solo passo di corsa (< 1 px
         di deriva della camera, dentro l'intorno di 2) */
      await passo(30);
      await pag.evaluate(() => {
        const b = window.__test.ball, pl = window.__test.players, k = window.__piScena;
        const p2 = pl[k];
        const FW2 = window.__pianoX + 2, fh = window.__test.campo.FH;
        const gy = fh / 2 + (p2.y < fh / 2 ? 1 : -1) * window.__test.campo.GOAL_H * 0.28;
        window.__scatta(b.x + 5, Math.min(b.y, gy) - 85, FW2 - 65, Math.max(b.y, gy) + 35);
      });
      await m.muoviL(CASA_L.x + 74, CASA_L.y);      // sprint: oltre 66 px
      await pag.evaluate(() => { window.__sonda.calci = []; });
      await m.giuR(P.x, P.y);
      await passo(1);
      const lettura = await pag.evaluate(() => {
        window.__test.disegna();
        const b = window.__test.ball, pl = window.__test.players, k = window.__piScena;
        const p2 = pl[k];
        /* la corda palla -> zona del secondo palo; il riquadro copre la
           corda e sale di 80 unita' (l'arco sta sopra), si ferma a
           FW-70 (il portiere vive sulla linea di porta) e i corpi vivi
           sono esclusi per geometria */
        const FW2 = window.__pianoX + 2, fh = window.__test.campo.FH;
        const gy = fh / 2 + (p2.y < fh / 2 ? 1 : -1) * window.__test.campo.GOAL_H * 0.28;
        const esc = window.__escVivi(36);
        const c = window.__leggi(b.x + 10, Math.min(b.y, gy) - 80, FW2 - 70, Math.max(b.y, gy) + 30, 3, esc, true);
        return { n: c.n, cx: c.n ? c.cx : null, cy: c.n ? c.cy : null,
                 xmax: c.n ? c.xmax : null, ymax: c.n ? c.ymax : null,
                 bx: b.x, by: b.y };
      });
      await passo(5);
      const parte = await pag.evaluate(() => {
        const S = window.__sonda, k = window.__piScena;
        return S.calci.filter(c => c.chi === k).length > 0;
      });
      await m.suR();
      const att = parte ? await pag.evaluate(() => window.__atterra()) : null;
      await m.muoviL(CASA_L.x + 8, CASA_L.y);
      await passo(1);
      tot++;
      if (!parte || !att || att.persa) { nulle++; tot--; continue; }
      if (!lettura.n) { dettagli.push('assente'); continue; }
      /* forma: il centroide del segno deve stare SOPRA la corda di >= 4 u */
      const t2 = (lettura.cx - lettura.bx) / Math.max(1, (att.x - lettura.bx));
      const yCorda = lettura.by + (att.y - lettura.by) * Math.min(1, Math.max(0, t2));
      const alza = (yCorda - lettura.cy) >= 4;
      /* fine del segno vs atterraggio vero */
      const dFine = Math.hypot(lettura.xmax - att.x, lettura.ymax - att.y);
      if (alza && dFine <= 30) buone++;
      else dettagli.push('alza=' + alza + ' dFine=' + n2(dFine));
    }
    if (tot < 10) { okC = null; stampa('   PROVA NULLA: solo ' + tot + ' cross misurati (' + nulle + ' scene rotte)'); }
    else {
      okC = buone === tot;
      stampa('   cross ' + tot + ' · con arco che si alza e fine sul punto di caduta: ' + buone +
             (dettagli.length ? ' · difetti: ' + dettagli.slice(0, 4).join(' | ') : ''));
      stampa('   soglia: ' + tot + ' su ' + tot + '   ->  ' + (okC ? 'VERDE' : 'ROSSO'));
    }
    await ctx2.m.fine(); await ctx2.pag.close();
    esiti.push({ id: 'C', nome: 'il cross si annuncia come arco e cade dove promette', ok: okC });
    stampa('');
  }

  /* ===================================================================
     D — IL RIFIUTO VISIBILE
     =================================================================== */
  let okD = null;
  {
    const ctx2 = await apri({ x: 700, y: 300 });
    const { q, m, passo, pag } = ctx2;
    let rifNo = 0, rifSi = 0, saneNo = 0, saneSi = 0, radNo = 0, radSi = 0, nulle = 0;
    stampa('D) IL RIFIUTO VISIBILE — CONTRASTA in rialzata, CONTRASTA sano, CAMBIO trascinato senza portatore');
    /* il conto e' un DELTA prima/dopo attorno a ogni uomo di movimento
       di squadra 0 (fermi per costruzione): cosi' una divisa rossa non
       inquina — contribuisce uguale ai due lati */
    const contaRossi = () => pag.evaluate(() => {
      window.__test.disegna();
      const pl = window.__test.players, out = {};
      for (let i = 0; i < pl.length; i++) {
        const p2 = pl[i];
        if (p2.team !== 0 || p2.role === 'gk' || p2.out > 0) continue;
        out[i] = window.__leggi(p2.x - 16, p2.y + 6, p2.x + 16, p2.y + 32, 4).n || 0;
      }
      return out;
    });
    const deltaRossi = (pr, dp) => {
      let mx = 0;
      for (const k in dp) mx = Math.max(mx, (dp[k] || 0) - (pr[k] || 0));
      return mx;
    };
    /* D1: 15 rifiutate (recover) — palla LONTANA, disco grande = CONTRASTA */
    for (let g = 0; g < 15; g++) {
      const rip = await pag.evaluate(preparaScena,
        { x: q.FW * 0.45, y: q.FH * 0.45, pallaLibera: [q.FW * 0.45 - 260, q.FH * 0.3], recover: 0.7 });
      if (rip.errore || rip.grande.act !== 'slide') { nulle++; continue; }
      const prima = await contaRossi();
      await m.giuR(rip.grande.x, rip.grande.y);
      await passo(2);
      const st = await pag.evaluate(() => {
        const p2 = window.__test.players[window.__piScena];
        return { charge: p2.charge, slide: p2.slide };
      });
      const dopo = await contaRossi();
      await m.suR();
      await passo(24);              // il latch decade (0,30 s = 18 passi)
      if (st.charge >= 0 || st.slide >= 0) { nulle++; continue; }   // la scivolata e' nata: scena sbagliata
      if (deltaRossi(prima, dopo) >= 10) rifSi++; else rifNo++;
    }
    /* D2: 15 sane — stessa scena senza recover: la scivolata NASCE, il segno NO */
    for (let g = 0; g < 15; g++) {
      const rip = await pag.evaluate(preparaScena,
        { x: q.FW * 0.45, y: q.FH * 0.45, pallaLibera: [q.FW * 0.45 - 260, q.FH * 0.3] });
      if (rip.errore || rip.grande.act !== 'slide') { nulle++; continue; }
      const prima = await contaRossi();
      await m.giuR(rip.grande.x, rip.grande.y);
      await passo(2);
      const st = await pag.evaluate(() => {
        const p2 = window.__test.players[window.__piScena];
        return { charge: p2.charge, slide: p2.slide };
      });
      const dopo = await contaRossi();
      await m.suR();
      await passo(30);
      if (st.charge < 0 && st.slide < 0) { nulle++; continue; }     // non e' nata: scena sbagliata
      if (deltaRossi(prima, dopo) >= 10) saneSi++; else saneNo++;
    }
    /* D3: 6 rilasci di CAMBIO trascinato con palla DI NESSUNO: il
       raddoppio dice no (comandaRaddoppio torna false) e si deve vedere */
    for (let g = 0; g < 6; g++) {
      const rip = await pag.evaluate(preparaScena,
        { x: q.FW * 0.45, y: q.FH * 0.5, pallaLibera: [q.FW * 0.45 - 300, q.FH * 0.35] });
      if (rip.errore || rip.piccolo.act !== 'swap') { nulle++; continue; }
      const prima = await contaRossi();
      await m.giuR(rip.piccolo.x, rip.piccolo.y);
      for (let k = 1; k <= 6; k++) { await passo(1); await m.muoviR(rip.piccolo.x + 44 * k / 6, rip.piccolo.y); }
      await passo(6);
      await m.suR();
      await passo(2);
      const dopo = await contaRossi();
      await passo(24);
      if (deltaRossi(prima, dopo) >= 10) radSi++; else radNo++;
    }
    const provati = rifSi + rifNo + saneSi + saneNo + radSi + radNo;
    if (provati < 24) {
      okD = null;
      stampa('   PROVA NULLA: misurate ' + provati + ' pressioni, scene rotte ' + nulle);
    } else {
      okD = (rifNo === 0 && saneSi === 0 && radNo === 0);
      stampa('   CONTRASTA rifiutato: segno presente ' + rifSi + ', assente ' + rifNo + ' (serve 0 assenze)');
      stampa('   CONTRASTA sano:      segno presente ' + saneSi + ' (serve 0), scivolate nate ' + (saneSi + saneNo));
      stampa('   CAMBIO senza uomo:   segno presente ' + radSi + ', assente ' + radNo + ' (serve 0 assenze)');
      stampa('   ->  ' + (okD ? 'VERDE' : 'ROSSO'));
    }
    await ctx2.m.fine(); await ctx2.pag.close();
    esiti.push({ id: 'D', nome: 'il no del gioco si vede sul mondo', ok: okD });
    stampa('');
  }

  /* ===================================================================
     E — EQUITA' AL BIT: il disegno non tocca la simulazione
     =================================================================== */
  let okE = null;
  {
    stampa('E) EQUITA\' AL BIT — robot a calendario fisso, 1200 passi, disegno ogni 7: --gioco contro --contro');
    async function corsa(file) {
      /* OGNI corsa ha il suo server, cioe' la sua ORIGINE: due corse
         sulla stessa origine condividono cio' che il browser tiene per
         origine, e una sonda dedicata ha mostrato le stesse due corse
         IDENTICHE su origini separate e divergenti sull'origine
         condivisa. Qui si compra l'isolamento, non si indaga oltre. */
      const s2 = await servi(file);
      const pag = await ctx.newPage();
      await pag.addInitScript(() => { try { localStorage.clear(); } catch (e) {} });
      await pag.addInitScript(seme => {
        let s = seme >>> 0 || 1;
        const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
        Math.random = () => p() / 4294967296;
      }, 20260820);
      await pag.addInitScript(bancoDiProva);
      pag.on('pageerror', e => eccezioni.push('E:' + e.message));
      await pag.goto('http://127.0.0.1:' + s2.porta + '/CALCETTO-il-gioco.html', { waitUntil: 'load' });
      await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
      await pag.evaluate(() => window.__banco.passo(6));
      const cdp = await ctx.newCDPSession(pag);
      const q = await pag.evaluate(preparaScena, { x: 700, y: 300 });
      if (q.errore) throw new Error('scena E: ' + q.errore);
      const m = mano(cdp, pag);
      await m.giuL(CASA_L.x, CASA_L.y);
      await pag.evaluate(() => window.__passoPin(1));
      await m.muoviL(CASA_L.x + 8, CASA_L.y);
      await pag.evaluate(() => { window.__tracce = []; });
      const passo1 = async () => {
        await pag.evaluate(() => {
          window.__pin(); window.__test.simulate(1 / 60);
          const b = window.__test.ball;
          window.__tracce.push(b.x, b.y, b.vx, b.vy, b.owner);
        });
      };
      const G = q.grande, Pi = q.piccolo;
      for (let s3 = 0; s3 < 1200; s3++) {
        const f = s3 % 120;
        if (f === 0) await m.giuR(G.x, G.y);
        else if (f >= 2 && f <= 11) await m.muoviR(G.x - 4 * (f - 1), G.y - 2 * (f - 1));
        else if (f === 38) await m.suR();
        else if (f === 60) await m.giuR(Pi.x, Pi.y);
        else if (f === 66) await m.suR();
        else if (f === 90) await m.muoviL(CASA_L.x + 40, CASA_L.y - 10);
        else if (f === 110) await m.muoviL(CASA_L.x + 8, CASA_L.y);
        await passo1();
        if (s3 % 7 === 3) await pag.evaluate(() => window.__test.disegna());
      }
      const tr = await pag.evaluate(() => window.__tracce);
      await m.fine(); await pag.close();
      s2.chiudi();
      return tr;
    }
    try {
      const trG = await corsa(GIOCO);
      const trC = await corsa(CONTRO);
      let primo = -1;
      const n = Math.min(trG.length, trC.length);
      for (let i = 0; i < n; i++) if (trG[i] !== trC[i]) { primo = i; break; }
      okE = (primo < 0 && trG.length === trC.length);
      stampa('   campioni confrontati: ' + n + ' (5 numeri x 1200 passi)' +
             (okE ? ' — IDENTICI' : ' — DIVERGONO al campione ' + primo + ' (passo ' + Math.floor(primo / 5) + ')'));
      stampa('   ->  ' + (okE ? 'VERDE' : 'ROSSO'));
    } catch (e) { okE = null; stampa('   PROVA NULLA: ' + e.message); }
    esiti.push({ id: 'E', nome: 'il disegno non scrive un bit nella simulazione', ok: okE });
    stampa('');
  }

  /* ===================================================================
     COSTO (--costo) — il prezzo del fotogramma, alle tre taglie
     =================================================================== */
  if (COSTO) {
    stampa('COSTO — dito armato sul TIRA (linea accesa), 3 giri alternati di 200 disegna() per lato');
    for (const taglia of [5, 7, 11]) {
      async function scena(file) {
        const s2 = await servi(file);       // origine fresca, come in E
        const pag = await ctx.newPage();
        await pag.addInitScript(() => { try { localStorage.clear(); } catch (e) {} });
        await pag.addInitScript(seme => {
          let s = seme >>> 0 || 1;
          const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
          Math.random = () => p() / 4294967296;
        }, 20260820);
        await pag.addInitScript(bancoDiProva);
        await pag.goto('http://127.0.0.1:' + s2.porta + '/CALCETTO-il-gioco.html', { waitUntil: 'load' });
        await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
        await pag.evaluate(() => window.__banco.passo(6));
        await pag.evaluate(installaSonda);
        const cdp = await ctx.newCDPSession(pag);
        const q = await pag.evaluate(preparaScena, { x: 700, y: 300, taglia: taglia });
        if (q.errore) throw new Error('scena costo: ' + q.errore);
        const cfg2 = { x: q.FW - 260, y: q.FH / 2 };
        const rip = await pag.evaluate(preparaScena, cfg2);
        const m = mano(cdp, pag);
        await m.giuL(CASA_L.x, CASA_L.y);
        await pag.evaluate(() => window.__passoPin(1));
        await m.muoviL(CASA_L.x + 8, CASA_L.y);
        await m.giuR(rip.grande.x, rip.grande.y);
        for (let k = 1; k <= 10; k++) { await pag.evaluate(() => window.__passoPin(1)); await m.muoviR(rip.grande.x - 46 * k / 10, rip.grande.y + 18 * k / 10); }
        await pag.evaluate(() => window.__passoPin(8));   // carica aperta, trascinamento armato, linea accesa
        return { pag, m };
      }
      const giro = pg => pg.evaluate(() => {
        /* performance.now e' del banco (finto): si usa Date.now vero */
        const d0 = Date.now();
        for (let i = 0; i < 200; i++) window.__test.disegna();
        return (Date.now() - d0) / 200;
      });
      try {
        const A2 = await scena(GIOCO), B2 = await scena(CONTRO);
        const a = [], b = [];
        for (let r = 0; r < 3; r++) { a.push(await giro(A2.pag)); b.push(await giro(B2.pag)); }
        a.sort((x, y) => x - y); b.sort((x, y) => x - y);
        const micro = await A2.pag.evaluate(() => {
          if (typeof window.disegnaLineaGuida !== 'function') return null;
          const cv = document.getElementById('gioco'), c2 = cv.getContext('2d');
          const v = window.__test.view, dpr = cv.width / innerWidth;
          c2.save();
          c2.setTransform(dpr * v.S2, 0, 0, dpr * v.S2, dpr * v.Ax, dpr * v.Ay);
          const d0 = Date.now();
          for (let i = 0; i < 3000; i++) { window.disegnaLineaGuida(0); window.disegnaLineaGuida(1); }
          const d = (Date.now() - d0) / 3000;
          c2.restore();
          return d;
        });
        stampa('   taglia ' + taglia + ': fotogramma intero  gioco ' + n2(a[1]) + ' ms  contro ' + n2(b[1]) +
               ' ms  (giri gioco ' + a.map(n2).join('/') + ', contro ' + b.map(n2).join('/') + ')' +
               '  delta mediane ' + n2(a[1] - b[1]) + ' ms');
        stampa('             misura diretta di disegnaLineaGuida (2 squadre): ' +
               (micro === null ? 'n/d (la funzione non esiste su questo file)' : n2(micro) + ' ms/fotogramma'));
        await A2.m.fine(); await A2.pag.close(); await B2.m.fine(); await B2.pag.close();
      } catch (e) { stampa('   taglia ' + taglia + ': misura saltata — ' + e.message); }
    }
    stampa('');
  }

  /* ------------------------------------------------------------------ */
  stampa('=== RIEPILOGO ===');
  let rossi = 0, nulli = 0;
  for (const e of esiti) {
    const s = e.ok === null ? 'NULLA' : (e.ok ? 'VERDE' : 'ROSSO');
    if (e.ok === null) nulli++; else if (!e.ok) rossi++;
    stampa('  ' + s.padEnd(6) + e.id + ' — ' + e.nome);
  }
  if (eccezioni.length) {
    stampa('  ECCEZIONI DI PAGINA (' + eccezioni.length + '): ' + eccezioni.slice(0, 3).join(' | '));
  }
  stampa(esiti.filter(e => e.ok === true).length + ' su ' + esiti.length + ' verdi');

  for (const k in cacheSrv) cacheSrv[k].chiudi();
  srv.chiudi();
  await br.close();
  process.exit(eccezioni.length ? 2 : (rossi ? 1 : (nulli ? 3 : 0)));
})().catch(e => { console.error('BANCO ESPLOSO: ' + (e && e.stack || e)); process.exit(2); });
