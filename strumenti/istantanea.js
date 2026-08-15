/* =====================================================================
   ISTANTANEA — il FREEZE-FRAME TEST, misurato al pixel.

   Perché esiste. Dieci giudici su ventisei hanno scritto la stessa frase
   con parole diverse: «metto in pausa in un istante QUALSIASI dell'azione
   — scelto da me, non coreografato — e il fotogramma deve reggere da solo
   come illustrazione da manifesto. Il giorno in cui il fotogramma casuale
   dell'AZIONE vale quanto la lavagnetta di fine partita, il 9 lo scrivo».
   È, alla lettera, il criterio con cui la giuria ha promesso di riscrivere
   il voto. Finché quel criterio resta un'opinione da guardare a occhio,
   ogni onda di lavoro finisce in una discussione; qui diventa un numero
   che nessuno può discutere, ripetibile al bit.

   Cosa misura, e su che cosa. Otto istanti pescati a caso ma dal SEME —
   quindi gli stessi otto a ogni esecuzione, e diversi se si cambia seme —
   dentro una partita vera CPU contro CPU. Su ognuno, cinque cancelli:

     1. ERBA VUOTA   quanta parte del quadro è manto senza soggetti
                     (griglia di celle: tinta in famiglia prato e poca
                     varianza = cella vuota).            sotto il 50%
     2. PALLA        la palla è fra gli oggetti più chiari del quadro e
                     abbastanza grande da trovarla in un secondo.
                                        luminanza >= 2x la mediana, e
                                        diametro >= 1,8% della larghezza
     3. FIGURA       quanto è alta a schermo la figura del giocatore
                     attivo, misurata sulla sagoma vera che il rig
                     disegna.                      >= 6% dell'altezza
     4. OMBRE        la misura chiave del tema 1: direzione e lunghezza
                     dell'ombra di OGNI figura, lette nei pixel attorno
                     ai piedi.   deviazione standard delle direzioni <= 5
                                 gradi, e lunghezza media >= 1,2 volte
                                 l'altezza della figura
     5. PRATO        il gradiente termico: differenza di tinta fra due
                     zone opposte del quadro.            >= 12 gradi

   COSA DICE OGGI — 15 agosto 2026, otto istanti, seme 20260728, telefono
   in orizzontale 915x412 a due punti per pixel: 24 misure su 40.
     · ERBA VUOTA  55,6-66,0% del quadro contro un tetto del 50%: NO in
       tutti e otto gli istanti. È la prima riga di undici schede della
       giuria («il 60-70% del fotogramma d'azione è erba vuota») e il
       numero misurato è esattamente il loro.
     · OMBRE  NO in tutti e otto: lunghezza 0,73-0,96 volte la figura
       contro 1,2, direzioni disperse fra 4,8 e 58,8 gradi contro 5. Il
       gioco getta ELLISSI SOTTO I PIEDI — drawOmbreGiocatori le posa a
       (+4,2; +7,8) unità con semiassi 18,4 x 9,1 — invece di ombre lunghe
       e parallele; e quel verso (62 gradi) non è nemmeno quello della
       luce che il gioco stesso dichiara (LUCI.oratorio.dir = 0,94/0,34,
       cioè 20 gradi). È la misura chiave del tema 1, ed è rossa.
     · PALLA  OK: 2,9-3,4 volte la mediana del quadro, diametro 2,13-2,30%
       della larghezza (misurato 39-42 px contro i 40,1-40,6 che lo stato
       dichiara: il disegno mantiene la promessa). La giuria però chiede
       il 2,5%, e a quella soglia sarebbe rossa: --pallaDiamMin 0.025.
     · FIGURA  OK e larga: 11,8-15,1% dell'altezza contro il 6%.
     · PRATO  OK, 18-21 gradi di tinta fra le due zone opposte contro 12.
       Non era previsto che passasse: il velo caldo/freddo di
       buildVignette e la luce del manto ci sono già. Tiene anche a 15,
       che è la soglia scritta dalla giuria.
   Uno strumento che dicesse OK sulle ombre sarebbe cieco; uno che dicesse
   NO sul prato per compiacere l'aspettativa lo sarebbe due volte. Dopo
   l'onda della luce questo file dovrà dire OK senza cambiare una riga, ed
   è quello il collaudo del collaudo.

   Ogni istante produce anche una SILHOUETTE (figure di nero puro su
   fondo bianco): serve al test del tema 2, in cui un estraneo deve poter
   dire «corre / tira / contrasta» guardando solo il nero. Non è una
   sagoma ridisegnata a mano — è lo STESSO rig, con la stessa clip, la
   stessa fase e la stessa scala del fotogramma vero, ridipinto in nero:
   se la posa è illeggibile lì, è illeggibile anche in partita.

   RIPRODUCIBILITÀ, la regola già pagata due volte in questa cartella:
   prima che la pagina esegua una riga si sostituisce Math.random con un
   generatore a seme fisso (xorshift32, lo stesso di scatta.js) e si
   prende in mano l'orologio del disegno, così la partita, gli istanti e
   i pixel sono identici a ogni esecuzione. Un cancello che lancia i dadi
   prima o poi copre una regressione vera con una finestra fortunata.

   uso:
     node strumenti/istantanea.js
     node strumenti/istantanea.js --dir istantanee --n 8 --da 3 --a 80
     node strumenti/istantanea.js --soglie
     node strumenti/istantanea.js --dettaglio      (l'ombra figura per figura)
     node strumenti/istantanea.js --controllo      (il banco di prova)
     node strumenti/istantanea.js --pratoHueMin 15 (ogni soglia si sposta)

   --controllo è la prova che lo strumento non sta attestando. Rifà lo
   STESSO istante altre due volte e ci dipinge sopra due falsi dichiarati:
   uno IN MEGLIO (ombre lunghe due volte la figura, tutte a 145 gradi, con
   i corpi ridisegnati sopra perché l'ombra stia sotto la figura come nel
   vero, più un gradiente termico marcato) e uno IN PEGGIO (ogni pixel di
   manto portato alla stessa tinta: un campo senza alcuna legge di luce).
   Le due misure della luce devono dire OK sul primo e NO sul secondo. Se
   non cambiano, non stanno misurando niente, e il banco lo dice.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');

/* =================================================== LE SOGLIE, IN CHIARO
   Una soglia nascosta è una soglia che nessuno può contestare. Qui ci
   sono tutte, cancelli e parametri interni delle misure, e --soglie le
   stampa senza aprire una partita. ==================================== */
const SOGLIE = {
  /* --- i cinque cancelli --- */
  erbaVuotaMax: 0.50,     // frazione di quadro a erba vuota (giuria: 40-50%)
  pallaLumMin: 2.0,       // luminanza della palla / mediana del quadro
  pallaDiamMin: 0.018,    // diametro della palla / larghezza del quadro
  figuraAltMin: 0.06,     // altezza della figura attiva / altezza del quadro
  ombreDevMax: 5.0,       // gradi: deviazione standard delle direzioni
  ombreLungMin: 1.2,      // lunghezza media dell'ombra / altezza della figura
  pratoHueMin: 12.0,      // gradi di tinta fra due zone opposte

  /* --- come si riconosce una cella di erba vuota --- */
  celleX: 24, celleY: 12, // la griglia
  cellaVarMax: 12,        // deviazione standard di luminanza dentro la cella (0-255)
  cellaErbaMin: 0.97,     // frazione di pixel in famiglia prato dentro la cella

  /* --- la famiglia del verde-prato (HSV) ---
     valMin tiene fuori il quasi-nero, che di verde ha solo l'anagrafe: il
     contorno delle figure (8,16,11) e — soprattutto — il nastro dell'HUD,
     che è un verde scurissimo (val 0,10 contro lo 0,45 del manto). Senza
     questo pavimento il nastro contava come prato: come CELLA VUOTA nella
     prima misura, e peggio, come OMBRA nella quarta — la marcia lo
     risaliva per duecentotrenta pixel e assegnava alla figura sotto il
     tabellone un'ombra lunga il doppio, nella direzione sbagliata. */
  hueMin: 80, hueMax: 175, satMin: 0.12, valMin: 0.18,

  /* --- la palla: fin dove si cerca e quanto buio si perdona ---
     il disegno della palla ha pentagoni scuri e un contorno nero: un
     raggio che si fermasse al primo pixel non bianco misurerebbe il
     pentagone, non la palla. Si perdona un buco lungo fino a
     pallaBuco volte il raggio atteso. */
  pallaCerca: 2.6, pallaBuco: 0.40, pallaSatMax: 0.25,

  /* --- come si riconosce un pixel d'ombra: prato IMBRUNITO ---
     le due soglie sono frazioni del prato ILLUMINATO LI' ATTORNO (terzo
     quartile di un blocco di tre celle per tre, vedi la misura 4), non
     di una mediana unica del quadro: sopra la banda è manto al sole,
     sotto è contorno nero o oggetto scuro, e nessuno dei due è ombra. */
  ombraGiu: 0.25, ombraSu: 0.72,
  ombraPixelMin: 150,     // meno di così e l'ombra non c'è: figura scartata
  ombraFigureMin: 2,      // meno di così e la misura non si può dare
  ombraCorsaMax: 4.0,     // fin dove si insegue la punta dell'ombra
  ombraFinestra: 0.12,    // semilarghezza della finestra di marcia (altezze figura)
  ombraFrazione: 0.35,    // quanta parte della finestra dev'essere ombra
  /* quanto vuoto si perdona prima di dichiarare finita l'ombra, in
     frazione dell'altezza della figura: attorno a ogni sagoma c'è l'alone
     di stacco, una striscia CHIARA larga un quinto di figura, e una
     marcia che si arrendesse al primo pixel non scuro morirebbe lì —
     misurato: con sei passi fissi tre ombre lunghe su sei uscivano lunghe
     zero. */
  ombraBuco: 0.35,

  /* --- il gradiente termico: due zone opposte, larghe un terzo di quadro --- */
  zonaFrazione: 0.32,
};

/* ---------------------------------------------------------------- server */
const TIPI = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
};
function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const p = decodeURIComponent(req.url.split('?')[0]);
      const f = path.join(RADICE, p === '/' ? 'index.html' : p);
      if (!f.startsWith(RADICE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        res.writeHead(404); res.end('no'); return;
      }
      res.writeHead(200, {
        'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* ------------------------------------------------------------ argomenti */
function argomenti() {
  const a = process.argv.slice(2), o = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith('--')) o[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : true;
  }
  return o;
}

/* --------------------------------------------------------- il caso, in mano
   xorshift32: la stessa sequenza a ogni esecuzione, in pagina (Math.random)
   e qui (gli istanti da fotografare). Sono due flussi separati apposta —
   cambiare il numero di istanti non deve cambiare la partita. */
function dado(seme) {
  let s = seme >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return (s >>> 0) / 4294967296;
  };
}

/* ====================================================== BANCO DI PROVA ===
   L'orologio del gioco, preso in mano (copia di scatta.js). Senza, fra la
   simulazione e lo scatto passa un numero di fotogrammi che dipende dal
   carico del computer e la stessa istantanea esce diversa a ogni giro. */
function bancoDiProva() {
  const PASSO = 1000 / 60;
  let t = 0, coda = [], muto = false;
  window.requestAnimationFrame = cb => { if (muto) return 0; coda.push(cb); return coda.length; };
  window.cancelAnimationFrame = () => {};
  try { performance.now = () => t; } catch (e) {}
  window.__banco = {
    get tempo() { return t; },
    passo(n) {
      n = Math.max(0, Math.round(+n || 0));
      for (let i = 0; i < n; i++) {
        const c = coda; coda = []; t += PASSO;
        for (const f of c) { try { f(t); } catch (e) {} }
      }
      return t;
    },
    zitto() { muto = true; coda.length = 0; },
  };
}

/* =========================================================================
   LA MISURA, IN PAGINA.
   Tutto quello che segue gira dentro il browser: legge i pixel del canvas
   con getImageData (nessuna libreria, nessun formato di mezzo) e lo stato
   vero del gioco con gli hook __test. Restituisce numeri, non giudizi: i
   cancelli li applica il lato Node, così le soglie stanno in un posto solo.
   ====================================================================== */
function misuraInPagina(arg) {
  const par = arg.par, controllo = arg.controllo;
  /* ---------- accesso allo stato e alla trasformazione della camera ---- */
  const t = window.__test;
  const G = t.G;
  const cv = document.getElementById('gioco');
  const cx = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  const dpr = (typeof DPR !== 'undefined' && DPR) ? DPR : 1;
  const S2 = (G.view.S2 || 1);
  const Ax = (G.view.Ax || 0) + (G.view.sx || 0);
  const Ay = (G.view.Ay || 0) + (G.view.sy || 0);
  /* mondo -> pixel della tela (la tela è grande DPR volte il viewport) */
  const sx = x => (x * S2 + Ax) * dpr;
  const sy = y => (y * S2 + Ay) * dpr;

  /* costanti del disegno delle figure: sono del gioco, non nostre. Se un
     giorno spariscono la misura lo dice invece di inventarsele. */
  const mancanti = [];
  const preso = (nome, v, d) => { if (v === undefined) { mancanti.push(nome); return d; } return v; };
  const P_DIS_ = preso('P_DIS', typeof P_DIS !== 'undefined' ? P_DIS : undefined, 1.18);
  const RIG_H_ = preso('RIG_H', typeof RIG_H !== 'undefined' ? RIG_H : undefined, 34);
  const RIG_PIEDI_ = preso('RIG_PIEDI', typeof RIG_PIEDI !== 'undefined' ? RIG_PIEDI : undefined, 10);
  const RIG_YAW_K_ = preso('RIG_YAW_K', typeof RIG_YAW_K !== 'undefined' ? RIG_YAW_K : undefined, Math.PI / 2);
  const B_R_ = preso('B_R', typeof B_R !== 'undefined' ? B_R : undefined, 8);
  const rig = (typeof Rig3D !== 'undefined') ? Rig3D : null;
  const statoDi = (typeof rigStato === 'function') ? rigStato : null;
  if (!rig) mancanti.push('Rig3D');
  if (!statoDi) mancanti.push('rigStato');

  /* =========================================================== SILHOUETTE
     Le figure ridipinte di nero puro su fondo bianco. Non è una sagoma
     approssimata: è la stessa Rig3D.disegna del fotogramma vero, con la
     stessa clip, la stessa fase, lo stesso yaw e la stessa scala — solo
     con una divisa tutta nera. Serve a tre cose insieme: il test della
     silhouette del tema 2, la maschera dei corpi (sotto un corpo l'ombra
     non si vede, e misurarla lì sarebbe misurare la maglia) e l'altezza
     vera della figura a schermo, presa dal riquadro del nero e non da una
     costante dichiarata. ============================================== */
  const NERO = {
    maglia: '#000', maglia2: '#000', disegno: 'tinta',
    pantaloncini: '#000', calze: '#000', risvolto: '#000',
    pelle: '#000', capelli: '#000', scarpe: '#000',
    palla: null, taglio: 0,
  };
  const sil = document.createElement('canvas');
  sil.width = W; sil.height = H;
  const sc = sil.getContext('2d');
  sc.fillStyle = '#ffffff'; sc.fillRect(0, 0, W, H);
  const scr = document.createElement('canvas');

  const figure = [];
  if (rig && statoDi) {
    /* lo stesso scarto di quadro di render(): chi è fuori non si disegna */
    const qx0 = (-Ax) / S2 - 34, qx1 = (W / dpr - Ax) / S2 + 34;
    const qy0 = (-Ay) / S2 - 34, qy1 = (H / dpr - Ay) / S2 + 34;
    for (const p of G.players) {
      if (p.out > 0) continue;
      if (p.x < qx0 || p.x > qx1 || p.y < qy0 || p.y > qy1) continue;
      if (typeof fermoCoperto === 'function' && fermoCoperto(p)) continue;
      const pi = G.players.indexOf(p);
      const hasBall = G.ball && G.ball.owner === pi;
      const isCtrl = !G.cpu[p.team] && G.ctrl[p.team] === pi;
      const celeb = p.celeb > 0;
      const lod = !isCtrl && !hasBall && !celeb &&
        (typeof figuraLontana === 'function' ? figuraLontana(p) : false);
      /* la posa: la decide il gioco, non noi */
      const st = statoDi(p);
      let clip = st.clip, u = st.u;
      if (lod) { clip = 'fermo'; u = 0.30; }
      /* lo yaw: la stessa catena di casi di drawPlayer */
      const gk = p.role === 'gk';
      let a;
      if (p.dive > 0 || (gk && p.recover > 0)) a = Math.atan2(p.diveDY, p.diveDX);
      else if (p.rove >= 0 || (p.charge >= 0 && p.chargeKind === 'rovesciata'))
        a = Math.atan2(-(p.roveDY || p.fy), -(p.roveDX || p.fx));
      else if (p.slide >= 0 || p.recover > 0) a = Math.atan2(p.slideDY || p.fy, p.slideDX || p.fx);
      else if (celeb) a = Math.PI / 2 + ((p.idx & 1) ? 0.38 : -0.38);
      else a = p.ang;
      const yaw = a + RIG_YAW_K_;
      /* altezza in pixel di tela e punto a terra, con le stesse due scale
         del gioco: quella della camera (S2), quella del disegno (P_DIS) e
         quella della tela (DPR) */
      const hPx = (RIG_H_ / (p.squash || 1)) * P_DIS_ * S2 * dpr;
      const gx = sx(p.x), gy = sy(p.y + RIG_PIEDI_ * P_DIS_);
      const box = Math.max(24, Math.ceil(hPx * 3));
      scr.width = box; scr.height = box;
      const s2 = scr.getContext('2d');
      const cxs = box / 2, cys = box * 0.72;
      const clipDef = rig.CLIPS[clip];
      if (!clipDef) continue;
      /* pxs: il gioco passa (S2 x P_DIS), cioè pixel CSS per unità di
         disegno. Qui l'altezza è già in pixel di tela (DPR volte più
         grandi), quindi 1/DPR riporta la stessa decisione di dettaglio. */
      try {
        s2.save();
        const tilt = (typeof SAVE !== 'undefined' && SAVE.moto) ? (p.rollio || 0) * 0.30 : 0;
        if (tilt > 0.02 || tilt < -0.02) {
          s2.translate(cxs, cys); s2.rotate(tilt); s2.translate(-cxs, -cys);
        }
        rig.disegna(s2, cxs, cys, hPx, yaw, 'alto', clip, u / clipDef.freq, NERO, true, 1 / dpr);
        s2.restore();
      } catch (e) { continue; }
      /* il riquadro del nero: è l'altezza VERA della figura a schermo */
      const d = s2.getImageData(0, 0, box, box).data;
      let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
      for (let y = 0; y < box; y++) {
        for (let x = 0; x < box; x++) {
          if (d[(y * box + x) * 4 + 3] > 24) {
            if (x < x0) x0 = x; if (x > x1) x1 = x;
            if (y < y0) y0 = y; if (y > y1) y1 = y;
          }
        }
      }
      if (x1 < 0) continue;
      const ox = gx - cxs, oy = gy - cys;
      sc.drawImage(scr, ox, oy);
      figure.push({
        idx: p.idx, team: p.team, ruolo: p.role, clip, palla: !!hasBall,
        x0: x0 + ox, y0: y0 + oy, x1: x1 + ox, y1: y1 + oy,
        h: (y1 - y0) + 1, w: (x1 - x0) + 1,
        piedeX: (x0 + x1) / 2 + ox, piedeY: y1 + oy,
      });
    }
  }
  /* il nero si porta a nero puro e il resto a bianco: una silhouette con
     mezzetinte non è una silhouette */
  {
    const im = sc.getImageData(0, 0, W, H), q = im.data;
    for (let i = 0; i < q.length; i += 4) {
      const L = 0.2126 * q[i] + 0.7152 * q[i + 1] + 0.0722 * q[i + 2];
      const nero = L < 200 ? 0 : 255;
      q[i] = q[i + 1] = q[i + 2] = nero; q[i + 3] = 255;
    }
    sc.putImageData(im, 0, 0);
  }

  /* ============================================ I FALSI DICHIARATI
     Solo con --controllo, e mai per conto loro. Servono a dimostrare che
     le due misure della luce non sono costanti travestite da misure:

       controllo 1 — IL FOTOGRAMMA COME SARA' DOPO L'ONDA DELLA LUCE:
         ombre lunghe due volte la figura, tutte parallele, e un prato con
         un gradiente caldo/freddo marcato. Le due misure DEVONO dire OK.
       controllo 2 — IL PRATO SPIANATO: ogni pixel di manto portato alla
         stessa identica tinta, cioè un campo senza alcuna legge di luce,
         ombre comprese. Le due misure DEVONO dire NO.

     Se una misura non cambia fra i due falsi, non sta misurando niente. */
  if (controllo === 1) {
    const ang = 145 * Math.PI / 180;      // sole alto a destra, ombre a sinistra-giù
    cx.save();
    cx.setTransform(1, 0, 0, 1, 0, 0);
    for (const f of figure) {
      const L = 2.0 * f.h;
      cx.save();
      cx.translate(f.piedeX, f.piedeY);
      cx.rotate(ang);
      cx.globalAlpha = 0.45; cx.fillStyle = '#000';
      cx.beginPath(); cx.ellipse(L / 2, 0, L / 2, 0.22 * f.h, 0, 0, 6.2832); cx.fill();
      cx.restore();
    }
    cx.globalAlpha = 1;
    /* e i CORPI si ridisegnano sopra: un'ombra vera sta SOTTO la figura e
       sotto il suo alone di stacco, e la misura deve fare i conti con
       quel pezzo di ombra che non si vede. Un falso più facile del vero
       non dimostrerebbe niente. E' la stessa drawPlayer del gioco, con la
       stessa trasformazione di camera. */
    if (typeof drawPlayer === 'function') {
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx.translate(Ax, Ay); cx.scale(S2, S2);
      const lista = G.players.filter(p => p.out <= 0).slice().sort((a, b) => a.y - b.y);
      for (const p of lista) { try { drawPlayer(p); } catch (e) {} }
      cx.setTransform(1, 0, 0, 1, 0, 0);
    }
    const g = cx.createLinearGradient(0, 0, W, H * 0.35);
    g.addColorStop(0, 'rgba(255,170,60,0.10)');
    g.addColorStop(1, 'rgba(30,90,255,0.10)');
    cx.fillStyle = g; cx.fillRect(0, 0, W, H);
    cx.restore();
  } else if (controllo === 2) {
    const im = cx.getImageData(0, 0, W, H), q = im.data;
    let sr = 0, sg = 0, sb = 0, ng = 0;
    const verde = j => {
      const r = q[j], g = q[j + 1], b = q[j + 2];
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), dl = mx - mn;
      if (!dl) return false;
      let hh;
      if (mx === r) hh = 60 * (((g - b) / dl) % 6);
      else if (mx === g) hh = 60 * ((b - r) / dl + 2);
      else hh = 60 * ((r - g) / dl + 4);
      if (hh < 0) hh += 360;
      return hh >= par.hueMin && hh <= par.hueMax && dl / mx >= par.satMin && mx / 255 >= par.valMin;
    };
    for (let j = 0; j < q.length; j += 4) if (verde(j)) { sr += q[j]; sg += q[j + 1]; sb += q[j + 2]; ng++; }
    if (ng) {
      const mr = Math.round(sr / ng), mg = Math.round(sg / ng), mb = Math.round(sb / ng);
      for (let j = 0; j < q.length; j += 4) if (verde(j)) { q[j] = mr; q[j + 1] = mg; q[j + 2] = mb; }
      cx.save(); cx.setTransform(1, 0, 0, 1, 0, 0);
      cx.putImageData(im, 0, 0);
      cx.restore();
    }
  }

  /* ================================================== I PIXEL DEL QUADRO
     Una passata sola: luminanza, appartenenza alla famiglia del prato e
     tinta. Da qui in poi nessuna misura tocca più il canvas. */
  const dati = cx.getImageData(0, 0, W, H).data;
  const N = W * H;
  const Lm = new Float32Array(N);
  const erba = new Uint8Array(N);
  const Hue = new Float32Array(N);
  const Sat = new Float32Array(N);
  const istL = new Uint32Array(256);
  const istErba = new Uint32Array(256);
  for (let i = 0, j = 0; i < N; i++, j += 4) {
    const r = dati[j], g = dati[j + 1], b = dati[j + 2];
    const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    Lm[i] = L;
    istL[L | 0]++;
    const mx = r > g ? (r > b ? r : b) : (g > b ? g : b);
    const mn = r < g ? (r < b ? r : b) : (g < b ? g : b);
    const dl = mx - mn;
    let hh = 0;
    if (dl > 0) {
      if (mx === r) hh = 60 * (((g - b) / dl) % 6);
      else if (mx === g) hh = 60 * ((b - r) / dl + 2);
      else hh = 60 * ((r - g) / dl + 4);
      if (hh < 0) hh += 360;
    }
    Hue[i] = hh;
    const sat = mx > 0 ? dl / mx : 0;
    Sat[i] = sat;
    if (hh >= par.hueMin && hh <= par.hueMax && sat >= par.satMin && mx / 255 >= par.valMin) {
      erba[i] = 1; istErba[L | 0]++;
    }
  }
  const mediana = ist => {
    let tot = 0; for (let k = 0; k < 256; k++) tot += ist[k];
    if (!tot) return 0;
    let acc = 0;
    for (let k = 0; k < 256; k++) { acc += ist[k]; if (acc >= tot / 2) return k; }
    return 255;
  };
  const Lquadro = mediana(istL);
  const Lprato = mediana(istErba);

  /* maschera dei corpi, dalla silhouette */
  const corpo = new Uint8Array(N);
  {
    const q = sc.getImageData(0, 0, W, H).data;
    for (let i = 0, j = 0; i < N; i++, j += 4) corpo[i] = q[j] < 128 ? 1 : 0;
  }

  /* ============================================== 1. L'ERBA VUOTA
     Una cella è vuota se quasi tutti i suoi pixel stanno nella famiglia
     del prato E la luminanza dentro la cella varia poco: un giocatore,
     una riga di gesso, la palla, un cartellone o un pannello dell'HUD
     rompono l'una o l'altra condizione. */
  let celleVuote = 0;
  const celle = par.celleX * par.celleY;
  const mappaCelle = [];
  const vuota1 = new Uint8Array(celle);
  for (let cy = 0; cy < par.celleY; cy++) {
    let riga = '';
    for (let cxi = 0; cxi < par.celleX; cxi++) {
      const x0 = Math.floor(cxi * W / par.celleX), x1 = Math.floor((cxi + 1) * W / par.celleX);
      const y0 = Math.floor(cy * H / par.celleY), y1 = Math.floor((cy + 1) * H / par.celleY);
      let n = 0, ne = 0, s = 0, s2 = 0;
      for (let y = y0; y < y1; y += 2) {
        for (let x = x0; x < x1; x += 2) {
          const i = y * W + x, L = Lm[i];
          n++; s += L; s2 += L * L; if (erba[i]) ne++;
        }
      }
      const m = s / n, dev = Math.sqrt(Math.max(0, s2 / n - m * m));
      const vuota = (ne / n >= par.cellaErbaMin) && dev <= par.cellaVarMax;
      if (vuota) celleVuote++;
      vuota1[cy * par.celleX + cxi] = vuota ? 1 : 0;
      riga += vuota ? '.' : '#';
    }
    mappaCelle.push(riga);
  }

  /* ================================================ 2. LA PALLA TROVABILE
     Posizione presa dallo stato (mai indovinata dai pixel: se la palla è
     invisibile la misura deve dirlo, non perderla). Luminanza mediana del
     nucleo contro la mediana del quadro; diametro misurato sui pixel con
     sedici raggi, così una palla disegnata più piccola di quanto lo stato
     dichiara non passa lo stesso. */
  const b = G.ball;
  const k = 1 + (b.z || 0) * 0.012;
  const bx = sx(b.x), by = sy(b.y - (b.z || 0) * 0.55);
  const rAtteso = Math.max(2, B_R_ * k * S2 * dpr);
  const dentro = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  /* IL PALLONE E' L'UNICO OGGETTO NEUTRO DEL QUADRO: bianco sporco con
     pentagoni scuri, velo d'ombra e riflesso — croma quasi nulla. Il
     manto, le divise (fluo 0,85 di croma, rosa 0,31), la pelle e i segni
     a terra sono tutti molto più carichi. E' questa la sola cosa che
     separa il pallone dal piede su cui poggia: la maschera dei corpi qui
     NON serve e sarebbe sbagliata, perché drawBall dipinge il pallone
     DOPO tutte le figure — non è mai coperto da nessuno. */
  /* il NUCLEO chiaro del pallone: il novantesimo percentile di luminanza
     là dove lo stato dice che sta. Serve da riferimento per il bordo: si
     misura il DISCO CHIARO, e i pentagoni scuri dentro li scavalca il
     buco tollerato. Senza il pavimento di luminanza il raggio scappava
     nelle SCARPE del portatore — neutre e scure quanto basta — e la
     palla usciva larga 46 px invece di 32. */
  let Lnucleo = 0;
  {
    const v = [];
    const R0 = Math.ceil(Math.max(2, B_R_ * (1 + (G.ball.z || 0) * 0.012) * S2 * dpr));
    const bx0 = Math.round((G.ball.x * S2 + Ax) * dpr);
    const by0 = Math.round(((G.ball.y - (G.ball.z || 0) * 0.55) * S2 + Ay) * dpr);
    for (let dy = -R0; dy <= R0; dy++) for (let dx = -R0; dx <= R0; dx++) {
      if (dx * dx + dy * dy > R0 * R0) continue;
      const x = bx0 + dx, y = by0 + dy;
      if (x < 0 || y < 0 || x >= W || y >= H) continue;
      const i = y * W + x;
      if (!erba[i]) v.push(Lm[i]);
    }
    v.sort((a, b) => a - b);
    Lnucleo = v.length ? v[Math.floor(v.length * 0.9)] : 255;
  }
  const pallosa = i => !erba[i] && Sat[i] < par.pallaSatMax && Lm[i] >= 0.5 * Lnucleo;
  const raccogli = (cx0, cy0, r0, r1, soloPalla) => {
    const v = [];
    const R = Math.ceil(r1);
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
      const d2 = dx * dx + dy * dy;
      if (d2 < r0 * r0 || d2 > r1 * r1) continue;
      const x = Math.round(cx0 + dx), y = Math.round(cy0 + dy);
      if (!dentro(x, y)) continue;
      const i = y * W + x;
      if (soloPalla && !pallosa(i)) continue;
      v.push(Lm[i]);
    }
    v.sort((p, q) => p - q);
    return v;
  };
  const med = v => v.length ? v[v.length >> 1] : 0;
  const attorno = raccogli(bx, by, rAtteso * 2.4, rAtteso * 3.2);
  const Lintorno = med(attorno) || Lprato;
  /* DIAMETRO. Si esce dal centro in sedici direzioni finché il pixel è
     ancora pallone: non manto, poco carico di croma e abbastanza chiaro.
     I pentagoni scuri dentro la sfera li scavalca il buco tollerato (un
     raggio che si fermasse al primo pixel non bianco misurerebbe il
     pentagono, non la palla); il contorno nero, che della palla fa parte,
     lo aggiunge la coda qui sotto. */
  const raggi = [];
  for (let a = 0; a < 16; a++) {
    const th = a * Math.PI / 8, ux = Math.cos(th), uy = Math.sin(th);
    let r = 0;
    for (let d = 0.5; d <= rAtteso * par.pallaCerca; d += 0.5) {
      const x = Math.round(bx + ux * d), y = Math.round(by + uy * d);
      if (!dentro(x, y)) break;
      const i = y * W + x;
      /* senza il filtro sulla croma, con la palla al piede il raggio
         entrava nella maglia del portatore e la palla risultava larga il
         triplo e scura: 70 px misurati invece di 39 */
      if (pallosa(i)) r = d;
      else if (d - r > rAtteso * par.pallaBuco) break;
    }
    /* IL CONTORNO SCURO FA PARTE DEL PALLONE. Il disco chiaro finisce a
       15 px dal centro, ma l'occhio vede la palla fin dove arriva il suo
       profilo nero, due o tre pixel più in là: fermarsi al bianco
       misurava una palla del 25% più piccola di quella disegnata (30 px
       contro i 40 che lo stato dichiara). Si prosegue di poco — non
       abbastanza per arrivare a una scarpa — e si ferma al primo pixel di
       manto, che è dove il pallone finisce davvero. */
    if (r > 0) {
      for (let d = r + 0.5; d <= r + rAtteso * 0.35; d += 0.5) {
        const x = Math.round(bx + ux * d), y = Math.round(by + uy * d);
        if (!dentro(x, y)) break;
        const i2 = y * W + x;
        if (erba[i2] || corpo[i2]) break;   // manto o corpo: il pallone finisce qui
        r = d;
      }
    }
    raggi.push(r);
  }
  raggi.sort((p, q) => p - q);
  /* IL DODICESIMO DEI SEDICI, non la mediana. Quando il pallone sta al
     piede del portatore, quattro o cinque raggi su sedici finiscono
     subito dentro il corpo e la mediana li segue: la palla usciva larga
     30 px invece di 40 in due istanti su otto, e la misura raccontava
     una palla che si rimpicciolisce quando qualcuno la conduce. I raggi
     liberi sono la maggioranza, e sono loro a dire quanto è grande. */
  const rMis = raggi[11];
  /* la luminanza della palla si legge DENTRO il diametro misurato, non
     dentro quello dichiarato dallo stato: se la palla è disegnata più
     piccola, la misura guarda comunque la palla */
  const Lpalla = med(raccogli(bx, by, 0, Math.max(2, rMis * 0.75), true));

  /* ============================================ 3. L'ALTEZZA DELLA FIGURA
     Il giocatore attivo: chi ha la palla, se no il più vicino a lei.
     L'altezza è il riquadro del nero della silhouette, cioè quanto la
     figura occupa davvero sullo schermo. */
  let attivo = null;
  if (figure.length) {
    attivo = figure.find(f => f.palla) || null;
    if (!attivo) {
      let dm = 1e18;
      for (const f of figure) {
        const d = (f.piedeX - bx) * (f.piedeX - bx) + (f.piedeY - by) * (f.piedeY - by);
        if (d < dm) { dm = d; attivo = f; }
      }
    }
  }

  /* ================================================== 4. LE OMBRE
     La misura chiave del tema 1, e la più difficile da fare onesta.

     Un pixel è OMBRA se è prato IMBRUNITO: tinta ancora nella famiglia
     del verde e luminanza fra un quarto e settantadue centesimi del prato
     illuminato lì attorno. Sotto un corpo non si giudica — lì l'ombra non
     si vede — e fuori dal quadro nemmeno.

     Per ogni figura si cerca l'ombra ATTACCATA ai suoi piedi: si marcia
     dai piedi verso ogni direzione con una finestra perpendicolare e
     vince la direzione in cui l'ombra arriva più lontano; poi si affina
     al grado sull'altopiano del massimo e, per l'ultimo grado, col
     baricentro del buio dentro quel corridoio. Direzione e lunghezza
     escono insieme, e sono le due cose che la giuria ha chiesto per
     nome: «tutte parallele entro ±5 gradi, lunghe almeno 1,5 volte la
     figura». Chi sta sul bordo, chi è appiccicato a un altro e chi ha i
     piedi fuori dal manto non si giudica: sono i tre casi in cui il
     numero direbbe qualcosa che non è della luce. */
  /* IL PRATO ILLUMINATO, ZONA PER ZONA. Il confronto non si fa con la
     mediana di tutto il quadro: il manto ha le strisce di rasatura (una
     chiara e una scura, oggi al 15% di distanza) e una velatura che
     scurisce i bordi, e con una soglia sola le strisce scure diventavano
     "ombra" — la marcia le seguiva per tutta la loro lunghezza e misurava
     ombre lunghe come la figura su un gioco che non ne ha nessuna
     (misurato: 0,19x diventava 1,05x, a un passo dal cancello).
     Il riferimento è il TERZO QUARTILE del prato in un blocco di tre
     celle per tre — grande due figure, dove un'ombra non può arrivare a
     essere la maggioranza — cioè "quanto è chiara qui l'erba al sole". */
  const gX = par.celleX, gY = par.celleY;
  const isto = new Uint32Array(gX * gY * 64);
  for (let y = 0; y < H; y += 2) {
    const cy = Math.min(gY - 1, (y * gY / H) | 0);
    for (let x = 0; x < W; x += 2) {
      const i = y * W + x;
      if (!erba[i]) continue;
      const ci = Math.min(gX - 1, (x * gX / W) | 0);
      isto[(cy * gX + ci) * 64 + Math.min(63, Lm[i] / 4 | 0)]++;
    }
  }
  const Lloc = new Float32Array(gX * gY);
  for (let cy = 0; cy < gY; cy++) for (let ci = 0; ci < gX; ci++) {
    const acc = new Uint32Array(64); let tot = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const yy = cy + dy, xx = ci + dx;
      if (yy < 0 || xx < 0 || yy >= gY || xx >= gX) continue;
      const b0 = (yy * gX + xx) * 64;
      for (let k = 0; k < 64; k++) { acc[k] += isto[b0 + k]; tot += isto[b0 + k]; }
    }
    let v = Lprato;
    if (tot >= 200) {
      let a2 = 0;
      for (let k = 0; k < 64; k++) { a2 += acc[k]; if (a2 >= tot * 0.75) { v = k * 4 + 2; break; } }
    }
    Lloc[cy * gX + ci] = v;
  }
  const buio = i => {
    if (corpo[i] || !erba[i]) return 0;
    const x = i % W, y = (i / W) | 0;
    const liv = Lloc[Math.min(gY - 1, (y * gY / H) | 0) * gX + Math.min(gX - 1, (x * gX / W) | 0)];
    const hi2 = par.ombraSu * liv, lo2 = par.ombraGiu * liv;
    const L = Lm[i];
    return (L >= lo2 && L <= hi2) ? (hi2 - L) : 0;
  };
  const ombre = [];
  for (const f of figure) {
    const ax = Math.round(f.piedeX), ay = Math.round(f.piedeY), h = f.h;
    /* CHI STA SUL BORDO NON SI GIUDICA. Se il disco attorno ai piedi esce
       dal quadro, metà dell'ombra non c'è per motivi di inquadratura e il
       baricentro punta sempre verso l'interno: si scarterebbe una figura
       sana o si assolverebbe una malata, a seconda di dove sta. */
    if (ax < 1.0 * h || ay < 1.0 * h || ax > W - 1.0 * h || ay > H - 1.0 * h) {
      ombre.push({ idx: f.idx, pixel: 0, ombra: false, bordo: true, x: ax, y: ay });
      continue;
    }
    /* NEMMENO CHI E' IN DUELLO. Due figure a meno di mezza altezza l'una
       dall'altra hanno le ombre incollate: qualunque cosa si misuri lì è
       la macchia delle due insieme, e la sua inclinazione la decide la
       posizione reciproca, non la luce. Misurato sul banco: una coppia a
       76 px dava 128° e 159° dove tutte le altre davano 145°. */
    let vicino = false;
    for (const g of figure) {
      if (g === f) continue;
      if (Math.hypot(g.piedeX - f.piedeX, g.piedeY - f.piedeY) < 0.7 * h) { vicino = true; break; }
    }
    if (vicino) { ombre.push({ idx: f.idx, pixel: 0, ombra: false, duello: true, x: ax, y: ay }); continue; }
    /* E NEMMENO CHI HA L'OMBRA FUORI DAL MANTO. Un'ombra si legge come
       manto imbrunito: se attorno ai piedi c'è la fascia dei cartelloni,
       la folla o un pulsante dei comandi, lì non c'è niente da imbrunire
       e la misura direbbe "nessuna ombra" a una figura che ce l'ha. */
    {
      let tot = 0, pra = 0;
      const RR = Math.round(1.5 * h);
      for (let dy = -RR; dy <= RR; dy += 3) for (let dx = -RR; dx <= RR; dx += 3) {
        if (dx * dx + dy * dy > RR * RR) continue;
        const x = ax + dx, y = ay + dy;
        if (!dentro(x, y)) continue;
        const i = y * W + x;
        tot++; if (erba[i] || corpo[i]) pra++;
      }
      if (!tot || pra / tot < 0.72) {
        ombre.push({ idx: f.idx, pixel: 0, ombra: false, fuoriManto: true, x: ax, y: ay });
        continue;
      }
    }
    /* DIREZIONE, in due tempi.
       (a) si CERCA il raggio: per ogni angolo si somma il buio lungo una
           striscia che parte dai piedi, e vince l'angolo più scuro. Un
           baricentro secco sul disco intero non basta — misurato: con
           ombre lunghe dipinte tutte a 145 gradi dava 138°±65, perché
           l'ombra del compagno vicino entrava nel disco e tirava il
           baricentro dove voleva lei.
       (b) si AFFINA: baricentro pesato sul buio dentro un cono stretto
           attorno al raggio vinto, saltando la zona sotto i piedi (dove
           sta la macchia di contatto, uguale in tutte le direzioni) e i
           pixel che appartengono più al vicino che a noi. */
    /* più vicino a un altro paio di piedi che ai nostri: non è nostra.
       Senza questa regola l'ombra del compagno vicino entra nel conto e
       la direzione la decide lei. */
    /* NON è una spartizione secca: due figure in duello stanno a mezza
       figura l'una dall'altra e le loro ombre, se sono parallele, si
       accavallano — una spartizione secca ne assegnerebbe una a chi non
       le appartiene e l'altra resterebbe senza. Si reclama tutto ciò che
       non sia MOLTO più vicino a un altro paio di piedi (il doppio):
       l'ombra del vicino sotto i suoi piedi resta sua, la parte lunga che
       passa sopra di noi la contiamo tutt'e due — e siccome quando sono
       parallele contarle insieme non sposta la direzione, va bene così. */
    const mio = (x, y) => {
      const d0 = (x - f.piedeX) * (x - f.piedeX) + (y - f.piedeY) * (y - f.piedeY);
      for (const g of figure) {
        if (g === f) continue;
        const d1 = (x - g.piedeX) * (x - g.piedeX) + (y - g.piedeY) * (y - g.piedeY);
        if (d0 > 4 * d1) return false;      // 4 = (il doppio)²
      }
      return true;
    };
    /* LA MARCIA. Da sotto i piedi, in una direzione, finché la finestra
       perpendicolare smette di essere scura. Restituisce fin dove arriva
       l'ombra ATTACCATA alla figura: è questa la differenza fra un'ombra
       propria e quella del vicino che passa di lì, che nella striscia
       compare per la sua larghezza e poi finisce. */
    const win = Math.max(3, par.ombraFinestra * h);
    const buchiMax = Math.max(4, Math.round(par.ombraBuco * h / 2));
    const marcia = (ux, uy) => {
      const px = -uy, py = ux;
      let lung = 0, buchi = 0;
      for (let d = 2; d <= par.ombraCorsaMax * h; d += 2) {
        let tot = 0, om = 0;
        for (let q = -4; q <= 4; q++) {
          const tt = q * win / 4;
          const x = Math.round(ax + ux * d + px * tt), y = Math.round(ay + uy * d + py * tt);
          /* FUORI DAL QUADRO NON C'E' OMBRA, e non è "non si sa": un
             corridoio che esce dall'inquadratura deve morire lì. Contato
             come ignoto, la marcia usciva dal fotogramma e tornava a
             pescare il buio della barra dell'HUD dall'altra parte,
             regalando due altezze di ombra a una figura che non ce
             l'aveva (misurato: 2,31x nella direzione sbagliata). */
          if (!dentro(x, y)) { tot++; continue; }
          const i = y * W + x;
          if (corpo[i]) continue;           // coperto da un corpo: si sospende il giudizio
          tot++;
          if (buio(i) && mio(x, y)) om++;
        }
        if (tot < 3) continue;
        if (om / tot >= par.ombraFrazione) { lung = d; buchi = 0; }
        else if (++buchi >= buchiMax) break;
      }
      return lung;
    };
    /* (a) IL RAGGIO SI CERCA CON LA MARCIA STESSA, non con la somma del
       buio: vince la direzione in cui l'ombra attaccata arriva PIU'
       LONTANO. Con la somma, un compagno controsole a mezza figura di
       distanza portava via la direzione — la sua ombra passa sopra di noi
       ed è tanto buio quanto la nostra. Con la marcia no: quella del
       vicino attraversa la striscia e finisce, la nostra continua. */
    let miglior = -1, mAng = 0; const profilo = [];
    for (let g = 0; g < 36; g++) {
      const th = g * Math.PI / 18;
      const s = marcia(Math.cos(th), Math.sin(th));
      profilo.push(Math.round(s));
      if (s > miglior) { miglior = s; mAng = th; }
    }
    /* (b) SI AFFINA al grado, sempre con la marcia. Il massimo non è un
       punto ma un altopiano largo qualche grado (l'ombra ha una sua
       larghezza): la direzione è la media circolare degli angoli che
       arrivano almeno al 95% del massimo, pesata sulla lunghezza. Un
       baricentro del buio, provato prima, sbandava di venti gradi quando
       metà ombra finiva sotto un altro corpo. */
    let mx = 0; const prove = [];
    for (let g = -12; g <= 12; g++) {
      const th = mAng + g * Math.PI / 180;
      const s = marcia(Math.cos(th), Math.sin(th));
      prove.push({ th, s });
      if (s > mx) mx = s;
    }
    let sc = 0, ss = 0, sp = 0;
    for (const q of prove) {
      if (q.s < 0.95 * mx || !q.s) continue;
      sc += Math.cos(q.th) * q.s; ss += Math.sin(q.th) * q.s; sp += q.s;
    }
    const pAng = sp ? Math.atan2(ss, sc) : mAng;
    const lung = mx;
    /* (c) L'ASSE DELL'OMBRA. L'altopiano della marcia dà la direzione a
       un paio di gradi; l'ultimo grado lo dà il baricentro del buio
       DENTRO il corridoio appena trovato (cono stretto, e non oltre la
       punta): l'ombra è simmetrica attorno al proprio asse, quindi il suo
       baricentro ci sta sopra. Qui si conta anche quanta ombra c'è: sotto
       una manciata di pixel non si misura niente, e dirlo è meglio che
       dare un numero. */
    const R = Math.round(Math.max(0.8 * h, Math.min(lung, 3 * h)));
    const cux = Math.cos(pAng), cuy = Math.sin(pAng);
    let n = 0, sw = 0, vx = 0, vy = 0;
    for (let dy = -R; dy <= R; dy++) {
      const y = ay + dy; if (y < 0 || y >= H) continue;
      for (let dx = -R; dx <= R; dx++) {
        const x = ax + dx; if (x < 0 || x >= W) continue;
        const rr = Math.sqrt(dx * dx + dy * dy);
        if (rr > R || rr < 0.3 * h) continue;
        if ((dx * cux + dy * cuy) / rr < 0.978) continue;    // cono di ±12 gradi
        const i = y * W + x;
        const w = buio(i);
        if (!w || !mio(x, y)) continue;
        n++; sw += w; vx += w * dx; vy += w * dy;
      }
    }
    const dir = sw > 0 ? Math.atan2(vy, vx) : pAng;
    if (n < par.ombraPixelMin) { ombre.push({ idx: f.idx, pixel: n, ombra: false }); continue; }
    ombre.push({
      idx: f.idx, pixel: n, ombra: true, x: ax, y: ay, profilo,
      dir: dir * 180 / Math.PI,
      lung, h, rapporto: lung / h,
    });
  }

  /* ========================================= 5. LA TEMPERATURA DEL PRATO
     La tinta mediana del prato in due zone opposte. Le coppie sono due
     (sinistra/destra e alto/basso) perché lo strumento non sa da che
     parte il gioco metterà il sole: vince la differenza maggiore.

     SI CAMPIONA SOLO DENTRO LE CELLE DI ERBA VUOTA, ed è la differenza
     fra una misura e un numero qualsiasi. Prendendo tutti i pixel in
     famiglia verde del terzo di quadro usciva uno scarto di 13-14 gradi
     su un campo che ha DUE soli verdi a 2,6 gradi l'uno dall'altro: la
     differenza non era il sole, erano la rete, i cartelloni, la folla e
     le toppe di terra che stanno più da una parte che dall'altra. Dentro
     una cella di erba vuota c'è solo manto, e un gradiente termico vero
     lo sposta tutto insieme. */
  const tintaZona = (ci0, ci1, cj0, cj1) => {
    const ist = new Uint32Array(360);
    let tot = 0;
    for (let cj = cj0; cj < cj1; cj++) for (let ci = ci0; ci < ci1; ci++) {
      if (!vuota1[cj * par.celleX + ci]) continue;
      const x0 = Math.floor(ci * W / par.celleX), x1 = Math.floor((ci + 1) * W / par.celleX);
      const y0 = Math.floor(cj * H / par.celleY), y1 = Math.floor((cj + 1) * H / par.celleY);
      for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) {
        const i = y * W + x;
        if (!erba[i]) continue;
        ist[Math.min(359, Math.max(0, Math.round(Hue[i])))]++; tot++;
      }
    }
    if (tot < 500) return null;
    let acc = 0;
    for (let k2 = 0; k2 < 360; k2++) { acc += ist[k2]; if (acc >= tot / 2) return k2; }
    return null;
  };
  const zf = par.zonaFrazione;
  const nzx = Math.max(1, Math.round(par.celleX * zf)), nzy = Math.max(1, Math.round(par.celleY * zf));
  const hSin = tintaZona(0, nzx, 0, par.celleY);
  const hDes = tintaZona(par.celleX - nzx, par.celleX, 0, par.celleY);
  const hAlt = tintaZona(0, par.celleX, 0, nzy);
  const hBas = tintaZona(0, par.celleX, par.celleY - nzy, par.celleY);
  const dLR = (hSin != null && hDes != null) ? Math.abs(hSin - hDes) : null;
  const dAB = (hAlt != null && hBas != null) ? Math.abs(hAlt - hBas) : null;

  return {
    mancanti,
    vista: { W, H, dpr, S2: +S2.toFixed(3) },
    scena: t.state, punteggio: G.score.slice(), tempo: +G.timeLeft.toFixed(1),
    erba: { vuote: celleVuote, celle, frazione: celleVuote / celle, mappa: mappaCelle },
    palla: {
      Lpalla, Lquadro, Lintorno, rapporto: Lquadro ? Lpalla / Lquadro : 0,
      diamPx: rMis * 2, diamFraz: (rMis * 2) / W, rAtteso: rAtteso * 2,
      z: +(b.z || 0).toFixed(1), fuori: !dentro(Math.round(bx), Math.round(by)),
    },
    figura: attivo ? {
      idx: attivo.idx, altPx: attivo.h, altFraz: attivo.h / H,
      largPx: attivo.w, clip: attivo.clip, palla: attivo.palla,
    } : null,
    figure: figure.length,
    ombre,
    prato: { hSin, hDes, hAlt, hBas, dLR, dAB, delta: Math.max(dLR || 0, dAB || 0) },
    Lprato,
    silhouette: sil.toDataURL('image/png'),
  };
}

/* =========================================================== I CANCELLI
   Applicati qui, in un posto solo, sui numeri che la pagina ha misurato.
   Ogni cancello restituisce {ok, testo, nota}. ======================== */
function statisticaCircolare(gradi) {
  /* deviazione standard circolare: le direzioni sono angoli, e la media
     aritmetica di 179 e -179 gradi non è 0 ma 179. */
  let sc = 0, ss = 0;
  for (const g of gradi) { const r = g * Math.PI / 180; sc += Math.cos(r); ss += Math.sin(r); }
  const n = gradi.length || 1;
  const R = Math.hypot(sc / n, ss / n);
  const media = Math.atan2(ss / n, sc / n) * 180 / Math.PI;
  const dev = R > 0 ? Math.sqrt(Math.max(0, -2 * Math.log(R))) * 180 / Math.PI : 999;
  let peggio = 0;
  for (const g of gradi) {
    let d = Math.abs(g - media); if (d > 180) d = 360 - d;
    if (d > peggio) peggio = d;
  }
  return { media, dev, peggio };
}

function cancelli(m, S) {
  const out = [];
  /* 1 */
  out.push({
    nome: 'erba vuota',
    ok: m.erba.frazione < S.erbaVuotaMax,
    testo: `erba senza soggetti ${(m.erba.frazione * 100).toFixed(1)}% del quadro (tetto ${(S.erbaVuotaMax * 100).toFixed(0)}%)`,
    nota: `${m.erba.vuote} celle vuote su ${m.erba.celle}`,
  });
  /* 2 */
  const p = m.palla;
  const okLum = p.rapporto >= S.pallaLumMin, okDia = p.diamFraz >= S.pallaDiamMin;
  out.push({
    nome: 'palla trovabile',
    ok: okLum && okDia && !p.fuori,
    testo: `palla ${p.rapporto.toFixed(2)}x la mediana del quadro (min ${S.pallaLumMin}), diametro ${(p.diamFraz * 100).toFixed(2)}% della larghezza (min ${(S.pallaDiamMin * 100).toFixed(1)}%)`,
    nota: p.fuori ? 'la palla è fuori dal quadro'
      : `luminanza palla ${p.Lpalla.toFixed(0)}, quadro ${p.Lquadro.toFixed(0)}, intorno ${p.Lintorno.toFixed(0)}; ${p.diamPx.toFixed(1)} px misurati contro ${p.rAtteso.toFixed(1)} attesi dallo stato`,
  });
  /* 3 */
  const f = m.figura;
  out.push({
    nome: 'altezza figura',
    ok: !!f && f.altFraz >= S.figuraAltMin,
    testo: f ? `figura attiva alta ${(f.altFraz * 100).toFixed(2)}% dello schermo, ${f.altPx} px (min ${(S.figuraAltMin * 100).toFixed(0)}%)`
      : 'nessuna figura in quadro',
    nota: f ? `giocatore ${f.idx}, posa "${f.clip}"${f.palla ? ', con la palla' : ''}` : '',
  });
  /* 4 */
  const con = m.ombre.filter(o => o.ombra);
  const dirs = con.map(o => o.dir);
  const st = con.length ? statisticaCircolare(dirs) : { dev: 999, media: 0, peggio: 999 };
  const lungMedia = con.length ? con.reduce((a, o) => a + o.rapporto, 0) / con.length : 0;
  const abbastanza = con.length >= S.ombraFigureMin;
  const scartate = m.ombre.filter(o => !o.ombra);
  const perche = (k, t) => { const q = scartate.filter(o => o[k]).length; return q ? q + ' ' + t : null; };
  const motivi = [perche('bordo', 'sul bordo del quadro'), perche('duello', 'in duello'),
  perche('fuoriManto', 'con i piedi fuori dal manto')].filter(Boolean).join(', ');
  out.push({
    nome: 'ombre parallele',
    ok: abbastanza && st.dev <= S.ombreDevMax && lungMedia >= S.ombreLungMin,
    testo: abbastanza
      ? `ombre: deviazione delle direzioni ${st.dev.toFixed(1)}° (tetto ${S.ombreDevMax}°), lunghezza media ${lungMedia.toFixed(2)}x l'altezza della figura (min ${S.ombreLungMin}x)`
      : `ombre: solo ${con.length} figure su ${m.ombre.length} hanno un'ombra misurabile — con meno di ${S.ombraFigureMin} la misura non si dà`,
    nota: abbastanza
      ? `direzione media ${st.media.toFixed(0)}°, scarto massimo ${st.peggio.toFixed(0)}°, su ${con.length} figure` +
      (motivi ? '; scartate: ' + motivi : '')
      : (motivi ? 'scartate: ' + motivi : 'nessuna figura ha ombra attorno ai piedi'),
  });
  /* 5 */
  const pr = m.prato;
  out.push({
    nome: 'temperatura prato',
    ok: pr.delta >= S.pratoHueMin,
    testo: `tinta del prato: ${pr.delta.toFixed(1)}° di scarto fra due zone opposte (min ${S.pratoHueMin}°)`,
    nota: `sinistra ${pr.hSin}° / destra ${pr.hDes}° = ${pr.dLR}°;  alto ${pr.hAlt}° / basso ${pr.hBas}° = ${pr.dAB}°`,
  });
  return out;
}

/* ================================================================= main = */
(async () => {
  const o = argomenti();
  const S = Object.assign({}, SOGLIE);
  /* le soglie si possono spostare da riga di comando: serve a mostrare che
     l'esito reagisce davvero al numero, e non è scritto nel codice */
  for (const k of Object.keys(S)) if (o[k] !== undefined) S[k] = +o[k];

  if (o.soglie) {
    console.log('\nLE SOGLIE DEL FREEZE-FRAME TEST\n');
    const righe = [
      ['erba vuota', `< ${(S.erbaVuotaMax * 100).toFixed(0)}% del quadro`, 'tema 6 — «l\'erba senza soggetti resta sotto il 40-50%»'],
      ['palla, luminanza', `>= ${S.pallaLumMin}x la mediana del quadro`, 'tema 5 — «un estraneo trova la palla in meno di un secondo»'],
      ['palla, diametro', `>= ${(S.pallaDiamMin * 100).toFixed(1)}% della larghezza`, 'tema 5 — diametro +30/100%'],
      ['altezza figura', `>= ${(S.figuraAltMin * 100).toFixed(0)}% dell\'altezza`, 'tema 6 — «giocatori mai sotto 70-90 px a 1080p»'],
      ['ombre, direzioni', `deviazione <= ${S.ombreDevMax}°`, 'tema 1 — «tutte le ombre parallele entro ±5 gradi»'],
      ['ombre, lunghezza', `>= ${S.ombreLungMin}x l\'altezza della figura`, 'tema 1 — «ombre lunghe 1,5-4 volte la figura»'],
      ['temperatura prato', `>= ${S.pratoHueMin}° di tinta`, 'tema 1 — «col contagocce i due angoli differiscono»'],
    ];
    for (const r of righe) console.log('  ' + r[0].padEnd(20) + r[1].padEnd(34) + r[2]);
    console.log('\nParametri interni delle misure:');
    for (const k of Object.keys(S)) {
      if (['erbaVuotaMax', 'pallaLumMin', 'pallaDiamMin', 'figuraAltMin', 'ombreDevMax', 'ombreLungMin', 'pratoHueMin'].includes(k)) continue;
      console.log('  ' + k.padEnd(20) + S[k]);
    }
    console.log('');
    return;
  }

  const n = Math.max(1, +(o.n || 8));
  const da = +(o.da || 3), a = +(o.a || 80);
  const seme = +(o.seme || 20260728);
  const dir = path.resolve(o.dir || 'istantanee');
  const vista = { w: +(o.w || 915), h: +(o.h || 412), dpr: +(o.dpr || 2) };
  const controllo = !!o.controllo;

  /* gli istanti: casuali ma dal seme, quindi gli stessi a ogni esecuzione */
  const r = dado(seme ^ 0x9e3779b9);
  const istanti = [];
  for (let i = 0; i < n; i++) istanti.push(da + r() * (a - da));
  istanti.sort((x, y) => x - y);

  fs.mkdirSync(dir, { recursive: true });

  const srv = await servi();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: vista.w, height: vista.h },
    deviceScaleFactor: vista.dpr,
    isMobile: true, hasTouch: true, reducedMotion: 'no-preference', locale: 'it-IT',
  });
  const pag = await ctx.newPage();

  /* il caso governato PRIMA di ogni riga di pagina (xorshift32) */
  await pag.addInitScript(s0 => {
    let s = s0 >>> 0 || 1;
    const prossimo = () => {
      s ^= s << 13; s >>>= 0;
      s ^= s >>> 17;
      s ^= s << 5; s >>>= 0;
      return s >>> 0;
    };
    Math.random = () => prossimo() / 4294967296;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues = arr => { for (let i = 0; i < arr.length; i++) arr[i] = prossimo(); return arr; };
    }
  }, seme);
  await pag.addInitScript(bancoDiProva);

  const errori = [];
  pag.on('console', m => { if (m.type() === 'error') errori.push(m.text()); });
  pag.on('pageerror', e => errori.push('ECCEZIONE: ' + e.message));

  const esiti = [];
  let mancantiVisti = [];
  try {
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.waitForTimeout(500);
    await pag.evaluate(() => window.__banco.passo(30));

    /* la partita: vera, CPU contro CPU (per la ripetibilità), senza
       tutorial, con i comandi disegnati come li vede un giocatore */
    await pag.evaluate(taglia => {
      const t = window.__test;
      t.dismissSplash && t.dismissSplash();
      t.startMatch(1, 1, taglia ? { size: taglia } : undefined);
      t.Tut && t.Tut.finish && t.Tut.finish(true);
      t.posaHUD && t.posaHUD(true);
      t.setCpuVsCpu && t.setCpuVsCpu(true);
    }, o.taglia ? +o.taglia : 0);

    console.log(`\n=== FREEZE-FRAME TEST — ${n} istanti fra il secondo ${da} e il secondo ${a}, seme ${seme} ===`);
    console.log(`quadro ${vista.w}x${vista.h}@${vista.dpr}  (tela ${vista.w * vista.dpr}x${vista.h * vista.dpr} px)`);
    if (controllo) {
      console.log('\n!!! BANCO DI PROVA DELLO STRUMENTO — I FOTOGRAMMI SONO FALSIFICATI !!!');
      console.log('    ombre lunghe parallele e prato a gradiente dipinti sopra la scena vera:');
      console.log('    serve solo a verificare che le misure sappiano dire anche OK.\n');
    }

    let orologio = 0;
    for (let i = 0; i < istanti.length; i++) {
      const bersaglio = istanti[i];
      /* si porta la partita all'istante voluto un pezzo per volta */
      const avanti = Math.max(0, bersaglio - orologio);
      const stato = await pag.evaluate(sec => {
        const t = window.__test;
        t.simulate(sec);
        /* se l'istante cade dentro una celebrazione o una moviola si
           aspetta il ritorno in gioco: il freeze-frame test è sull'AZIONE,
           e uno scatto sulla festa direbbe di un'altra scena. Quanto si è
           aspettato viene dichiarato, non nascosto.
           Al rientro si aggiunge un secondo e due decimi: il primo
           fotogramma dopo il fischio è una formazione ferma in mezzo al
           campo — dieci figure in posa d'attesa — e fotografare SEMPRE
           quella sarebbe scegliersi l'istante, cioè il contrario di
           questo collaudo. */
        let extra = 0;
        for (let k = 0; k < 200; k++) {
          const s = t.state;
          if ((s === 'play' || s === 'golden') && !t.moviola) break;
          if (s === 'menu' || s === 'end') break;
          t.simulate(0.12); extra += 0.12;
        }
        if (extra > 0 && (t.state === 'play' || t.state === 'golden')) {
          t.simulate(1.2); extra += 1.2;
        }
        return { scena: t.state, extra: +extra.toFixed(2) };
      }, avanti);
      orologio = bersaglio + stato.extra;
      if (stato.scena === 'menu' || stato.scena === 'end') {
        console.log(`\n--- istante ${i + 1}: la partita è finita prima (${stato.scena}), si smette qui`);
        break;
      }

      /* si disegna UN fotogramma a mano: simulate fa avanzare lo stato ma
         non ridipinge, e senza questa riga si misurerebbe il fotogramma
         di prima */
      const nn = String(i + 1).padStart(2, '0');
      await pag.evaluate(() => { window.__test.disegna(); });

      const m = await pag.evaluate(misuraInPagina, { par: S, controllo: 0 });
      if (m.mancanti.length) mancantiVisti = mancantiVisti.concat(m.mancanti);

      await pag.screenshot({ path: path.join(dir, 'istante-' + nn + '.png') });
      fs.writeFileSync(path.join(dir, 'silhouette-' + nn + '.png'),
        Buffer.from(m.silhouette.split(',')[1], 'base64'));

      const c = cancelli(m, S);
      const passate = c.filter(x => x.ok).length;
      console.log(`\n--- istante ${i + 1}: t=${orologio.toFixed(1)}s  scena ${m.scena}  ` +
        `${m.punteggio[0]}-${m.punteggio[1]}  ${m.figure} figure in quadro  ` +
        `zoom ${m.vista.S2}${stato.extra ? '  (spostato di ' + stato.extra.toFixed(1) + 's per uscire dalla scena del gol)' : ''}`);
      for (const x of c) {
        console.log((x.ok ? '  OK   ' : '  NO   ') + x.testo + (x.nota ? '\n         ' + x.nota : ''));
      }
      console.log(`         ${passate}/5 — istante-${nn}.png, silhouette-${nn}.png`);
      /* --dettaglio: l'ombra figura per figura. Serve a chi ripara, non a
         chi giudica: dice QUALE sagoma esce dal fascio e di quanto. */
      if (o.dettaglio) {
        /* la griglia dell'erba vuota, come la vede la misura: il punto è
           manto senza soggetti, il cancelletto è tutto il resto. Se la
           mappa non somiglia al fotogramma, la misura è cieca e si vede
           a occhio in due secondi. */
        for (const r2 of m.erba.mappa) console.log('           ' + r2);
        for (const ob of m.ombre) {
          console.log('           fig ' + String(ob.idx).padStart(2) +
            (ob.ombra ? `  dir ${ob.dir.toFixed(0).padStart(5)}°  lung ${ob.rapporto.toFixed(2)}x  (${ob.lung} px su ${ob.h} di figura, ${ob.pixel} pixel d'ombra)`
              : `  nessuna ombra trovata (${ob.pixel} pixel)`));
        }
      }
      const riga = { i: i + 1, c, m };

      /* --controllo: lo STESSO fotogramma, altre due volte, falsificato in
         meglio e in peggio. Si ridisegna ogni volta dallo stato (disegna()
         non fa avanzare la fisica), quindi le tre versioni differiscono
         SOLO per la vernice. */
      if (controllo) {
        const lung = x => {
          const v = x.ombre.filter(y => y.ombra);
          return v.length ? v.reduce((s, y) => s + y.rapporto, 0) / v.length : 0;
        };
        await pag.evaluate(() => { window.__test.disegna(); });
        const mA = await pag.evaluate(misuraInPagina, { par: S, controllo: 1 });
        await pag.screenshot({ path: path.join(dir, 'controllo-meglio-' + nn + '.png') });
        await pag.evaluate(() => { window.__test.disegna(); });
        const mB = await pag.evaluate(misuraInPagina, { par: S, controllo: 2 });
        await pag.screenshot({ path: path.join(dir, 'controllo-peggio-' + nn + '.png') });
        const cA = cancelli(mA, S), cB = cancelli(mB, S);
        if (o.dettaglio) {
          for (const ob of mA.ombre) {
            console.log('           [meglio] fig ' + String(ob.idx).padStart(2) + ' @' + (ob.x||0) + ',' + (ob.y||0) +
              (ob.ombra ? `  dir ${ob.dir.toFixed(0).padStart(5)}°  lung ${ob.rapporto.toFixed(2)}x  (${ob.lung}/${ob.h} px, ${ob.pixel} pixel)`
                : `  nessuna ombra trovata (${ob.pixel} pixel)`));
            if (ob.profilo) console.log('                     profilo ' + ob.profilo.join(' '));
          }
        }
        const d = x => (x.ok ? 'OK' : 'NO');
        console.log(`   banco   ombre:  gioco vero ${d(c[3])}   ombre lunghe dipinte ${d(cA[3])}   prato spianato ${d(cB[3])}`);
        const dirdi = x => {
          const v = x.ombre.filter(y => y.ombra);
          if (!v.length) return '—';
          const s = statisticaCircolare(v.map(y => y.dir));
          return s.media.toFixed(0) + '°±' + s.dev.toFixed(0);
        };
        console.log(`           lunghezza ${lung(m).toFixed(2)}x -> ${lung(mA).toFixed(2)}x -> ${lung(mB).toFixed(2)}x, ` +
          `direzione ${dirdi(m)} -> ${dirdi(mA)} -> ${dirdi(mB)}, ` +
          `ombre trovate ${m.ombre.filter(x => x.ombra).length} -> ${mA.ombre.filter(x => x.ombra).length} -> ${mB.ombre.filter(x => x.ombra).length}`);
        console.log(`           prato:  gioco vero ${d(c[4])}   gradiente dipinto ${d(cA[4])}   prato spianato ${d(cB[4])}`);
        console.log(`           tinta ${m.prato.delta.toFixed(0)}° -> ${mA.prato.delta.toFixed(0)}° -> ${mB.prato.delta.toFixed(0)}°`);
        riga.cA = cA; riga.cB = cB;
      }
      esiti.push(riga);
    }
  } finally {
    await ctx.close(); await browser.close(); srv.chiudi();
  }

  /* ------------------------------------------------------------ riepilogo */
  const tot = esiti.length * 5;
  const passate = esiti.reduce((a2, e) => a2 + e.c.filter(x => x.ok).length, 0);
  console.log('\n=== RIEPILOGO ===');
  const nomi = ['erba vuota', 'palla trovabile', 'altezza figura', 'ombre parallele', 'temperatura prato'];
  console.log('  istante   ' + nomi.map(x => x.slice(0, 9).padEnd(10)).join(''));
  for (const e of esiti) {
    console.log('    ' + String(e.i).padEnd(9) +
      e.c.map(x => (x.ok ? 'OK' : 'NO').padEnd(10)).join(''));
  }
  console.log('  ---------');
  console.log('  su ' + esiti.length + '    ' +
    nomi.map((_, k) => (esiti.filter(e => e.c[k].ok).length + '/' + esiti.length).padEnd(10)).join(''));
  console.log(`\n${passate} misure passate su ${tot}.  I PNG stanno in ${dir}`);
  if (mancantiVisti.length) {
    console.log('\nHOOK MANCANTI (la misura ha usato un ripiego): ' +
      Array.from(new Set(mancantiVisti)).join(', '));
  }
  if (errori.length) console.log('ERRORI IN PAGINA: ' + errori.slice(0, 3).join(' | '));

  if (controllo) {
    /* il banco di prova ha un compito solo: dimostrare che le due misure
       della luce non sono costanti travestite. Devono dire OK sul
       fotogramma che le soddisfa e NO su quello che le nega, sullo stesso
       identico istante di partita. Se non cambiano, non misurano. */
    const n2 = esiti.length;
    const omA = esiti.filter(e => e.cA[3].ok).length, omB = esiti.filter(e => !e.cB[3].ok).length;
    const prA = esiti.filter(e => e.cA[4].ok).length, prB = esiti.filter(e => !e.cB[4].ok).length;
    console.log('\n=== BANCO DI PROVA DELLO STRUMENTO ===');
    console.log(`  ombre     sa dire OK su ${omA}/${n2} fotogrammi con le ombre lunghe,  ` +
      `sa dire NO su ${omB}/${n2} col prato spianato`);
    console.log(`  prato     sa dire OK su ${prA}/${n2} fotogrammi col gradiente,        ` +
      `sa dire NO su ${prB}/${n2} col prato spianato`);
    const sano = omA === n2 && omB === n2 && prA === n2 && prB === n2;
    console.log(sano
      ? '  OK   le due misure seguono il fotogramma: sanno passare e sanno fallire.'
      : '  NO   una misura non cambia col fotogramma: non sta misurando niente.');
    process.exit(sano ? 0 : 1);
  }

  if (passate < tot) {
    console.log('\nOgni misura fallita è una riga della scheda della giuria: la luce delle');
    console.log('sette di sera, la palla protagonista, la regia del quadro. Il fotogramma');
    console.log('casuale dell\'azione non regge ancora come manifesto.');
    process.exit(1);
  }
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
