/* =====================================================================
   IDENTITA' — «di che squadra e' quell'uomo, e QUALE uomo e'».

   PERCHE' ESISTE. Il giudice della giuria a 26 che valuta chi gioca con
   due pollici in piedi sull'autobus ha nominato questo come la prima cosa
   che toglie punti, e l'ha detto con due frasi che sono due misure
   diverse, non una:

     «LE DUE SQUADRE USANO GLI STESSI NUMERI. Azzurro 2, 3, 5. Rosa 2, 3,
      5. Il numero non distingue niente: distingue solo il ruolo.»
     «In istante-04 e istante-05 il rosa e' desaturato verso il grigio e
      l'azzurro e' quasi nero. Alla luce del tramonto le due squadre hanno
      lo stesso colore.»

   Il freeze-frame test (istantanea.js) non poteva accorgersene: misura
   erba vuota, palla, figura, ombre, prato e centro-sera — sei cose che
   riguardano la SCENA, nessuna che riguardi la distinzione fra due
   uomini. Questo attrezzo misura esattamente le due cose nominate, sugli
   STESSI OTTO ISTANTI (stesso seme, stessa finestra, stessa camera), cosi'
   che i due strumenti parlino dello stesso fotogramma.

   ---------------------------------------------------------------------
   COSA MISURA, E IN CHE SPAZIO

   1. DISTANZA PERCETTIVA FRA MAGLIE. Per ogni giocatore in quadro si
      legge il colore della maglia dai PIXEL — non dalla costante del
      kit — nella stessa finestra del torso che usa collaudo.js per il
      contrasto maglia/erba (tre file sopra il centro, sotto il numero,
      dentro le strisce del palato). Un pixel letto porta addosso tutto
      quello che l'occhio riceve: il velo della sera, l'ombreggiatura del
      rig, la vignettatura del quadro. Il colore rappresentativo e' la
      MEDIANA per canale, che regge il numero bianco e la seconda tinta
      senza farsi trascinare da una minoranza di pixel.
      Lo spazio e' OKLab, non RGB: in RGB crudo #808080 e #8a8a8a distano
      quanto #ff0000 e #ff1400, cioe' la distanza non dice niente
      sull'occhio. OKLab e' percettivamente quasi uniforme e — questo e'
      il motivo vero di questa scelta per QUESTO difetto — separa la
      chiarezza (L) dal colore (a,b), quindi sa dire se due squadre si
      confondono perche' hanno la stessa tinta o perche' hanno la stessa
      luminanza. Si riporta dE x100 (L va da 0 a 1: x100 mette la scala
      in cifre leggibili) e la scomposizione in OKLCh — dL chiarezza,
      dC saturazione, dh tinta in gradi — che sono le tre parole che il
      giudice ha usato.
      Si riporta LA COPPIA PEGGIORE per istante: un fotogramma vale quanto
      la sua confusione peggiore, non quanto la sua media.

   2. NUMERI AMBIGUI. Per ogni giocatore in quadro: c'e' un avversario in
      quadro che porta lo stesso numero? Il numero lo DICHIARA il gioco
      (p.numero); se il campo non c'e' — cioe' sul file di PRIMA, che il
      numero non lo dichiarava — si ricade su idx+1, che e' alla lettera
      cio' che quel file disegnava. Non e' una stima: e' la stessa riga.

   ---------------------------------------------------------------------
   I PORTIERI STANNO IN UNA RIGA A PARTE, ed e' una scelta dichiarata.
   Le due porte hanno UNA sola divisa (GK_UNICA, scelta lontano dalle due
   maglie, dal prato e dalla palla): due portieri in quadro hanno per
   costruzione distanza quasi zero, e metterli nel mucchio farebbe vincere
   sempre a loro la classifica della coppia peggiore, nascondendo il
   difetto vero — che e' fra i giocatori DI MOVIMENTO. La loro distanza si
   riporta lo stesso, su una riga sua, perche' un numero taciuto e' un
   numero truccato. Sull'AMBIGUITA' DEL NUMERO invece i portieri contano
   eccome, e ci stanno dentro: se i due portieri portano lo stesso numero
   e la stessa divisa, non li distingue piu' niente.

   ---------------------------------------------------------------------
   COME DIMOSTRA DI SAPER FALLIRE
     node strumenti/_identita.js --guasto
   dipinge la squadra 1 con le DUE tinte e il MOTIVO della squadra 0: due
   squadre identiche addosso. La distanza deve crollare a ridosso dello
   zero. Se resta alta, lo strumento non sta guardando le maglie e ogni
   suo numero verde e' una bugia.
     node strumenti/_identita.js --oro
   misura la coppia GIALLO/CELESTE delle divise per daltonici, che nessun
   giudice ha mai contestato: e' l'ANCORAGGIO ALTO della scala, cioe' il
   valore che questa misura assume su una coppia ritenuta buona in casa.

   ---------------------------------------------------------------------
   LA SCALA, rimisurata il 18 agosto 2026 sugli otto istanti del seme
   20260728 contro il file da 1.658.240 byte — perche' un dE senza
   ancoraggi non dice a nessuno se e' tanto o poco:

     due squadre vestite UGUALI (--guasto)      peggiore  0,1   media  2,9
     le divise di serie prima della passata
       dell'identita'                                     9,3         12,6
     le divise per DALTONICI (--oro)                      8,6         15,8
     le divise di serie dopo quella passata              14,5         15,5

   Sotto il 3 due uomini di squadre diverse sono la stessa macchia (lo
   dice il banco di prova: due squadre vestite uguali danno 0,1). La
   coppia disegnata apposta per chi non distingue i colori sta a 8,6 sul
   caso peggiore ed e' l'ancoraggio alto. Non e' una soglia di legge: e'
   un metro con due estremi noti, ed e' cio' che serve per non discutere
   a occhio.

   UNA RETTIFICA, con la data. Una stesura precedente di questa stessa
   intestazione dava il PRIMA a 5,1 e il guasto a 0,3. Erano misure vere
   su una base ANTERIORE alla passata della luce: nel frattempo e'
   cambiato quanto il contorno scuro del numero annerisce il torso, e con
   esso il PRIMA. La riga che NON si e' mossa — il PRIMA con il numero non
   disegnato, 10,9 in tutt'e due le misure — dice che il colore di
   partenza e' rimasto identico e che a muoversi e' stata la vernice.
   Chi rimisura dopo aver toccato la luce, il glifo o le divise si aspetti
   che questa scala si sposti, e la riscriva invece di ereditarla.

   ---------------------------------------------------------------------
   UN AVVERTIMENTO A CHI CAMBIA IL NUMERO SULLA SCHIENA. La finestra del
   torso usata qui — e quella, piu' stretta, di collaudo.js — NON e'
   libera dal glifo del numero quanto il gioco dichiara. Misurato con
   strumenti/_sonda-glifo.js contro una copia del gioco col numero non
   disegnato: il contorno scuro del numero toglieva alla mediana della
   maglia della squadra 1 il 24% di luminanza. Chi tocca colore, spessore
   o ancora del numero rimisuri PRIMA con quella sonda, o scambiera' un
   effetto della vernice per un effetto della divisa.

   uso:
     node strumenti/_identita.js                        (il file del repo)
     GIOCO_PROVA=... node strumenti/_identita.js        (una copia fuori)
     node strumenti/_identita.js --guasto | --oro | --json esito.json
     node strumenti/_identita.js --da 46 --a 88         (il secondo tempo,
                                                         dove la sera e'
                                                         davvero scesa)
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const PROVA = process.env.GIOCO_PROVA ? path.resolve(process.env.GIOCO_PROVA) : '';
const rid = f => (PROVA && /CALCETTO-il-gioco\.html$/i.test(f)) ? PROVA : f;

const TIPI = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png', '.webmanifest': 'application/manifest+json',
};
function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = rid(path.join(RADICE, decodeURIComponent(req.url.split('?')[0])));
      if ((!f.startsWith(RADICE) && f !== PROVA) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        res.writeHead(404); res.end(); return;
      }
      res.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* lo stesso generatore, lo stesso seme e la stessa regola di scelta degli
   istanti di istantanea.js: i due strumenti devono guardare gli STESSI
   otto fotogrammi, se no non parlano della stessa cosa. */
function dado(seme) {
  let s = seme >>> 0 || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}

/* IL BANCO — copia ALLA LETTERA di quello di istantanea.js (che a sua
   volta viene da scatta.js), e la prima stesura di questo file ha pagato
   il prezzo di averlo riscritto «equivalente» invece che copiato.
   La versione sbagliata chiamava simulate()+disegna() lasciando VIVO il
   requestAnimationFrame del gioco: fra una pag.evaluate() e l'altra il
   ciclo vero continuava a girare sull'orologio VERO, la partita avanzava
   di quanto ci metteva la macchina, e due esecuzioni dello stesso file
   davano otto istanti DIVERSI — nella prova: istante 1 a ora 10% con
   erba #284b2f e coppia peggiore 12,9, e alla corsa dopo (identica, con
   in piu' uno screenshot per istante) ora 11%, erba #294e2f e 13,2.
   Uno strumento che si sposta quando gli si aggiunge una fotografia non
   misura niente. Qui il gioco NON ha piu' un orologio suo: rAF e
   performance.now li tiene il banco, e un fotogramma avviene solo quando
   passo() lo dice. */
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

/* copia di istantanea.js (che copia scatta.js): le animazioni CSS si
   fermano a un istante FISSO — le finite alla fine, le infinite all'inizio */
function congelaAnimazioni() {
  const st = document.createElement('style');
  st.textContent = '*,*::before,*::after{animation-play-state:paused !important;' +
    'transition:none !important;caret-color:transparent !important}';
  document.head.appendChild(st);
  if (!document.getAnimations) return;
  for (const an of document.getAnimations()) {
    try {
      const c = an.effect && an.effect.getComputedTiming ? an.effect.getComputedTiming() : null;
      const infinita = !c || c.iterations === Infinity || !isFinite(c.endTime);
      an.pause();
      an.currentTime = infinita ? 0 : c.endTime;
    } catch (e) {}
  }
}

/* ---------------------------------------------------------------- misura
   Gira DENTRO la pagina, su un fotogramma gia' disegnato: non disegna
   niente e non fa avanzare niente, cosi' il fotogramma misurato e'
   esattamente quello che il banco ha appena messo sulla tela. */
function misuraInPagina() {
  const t = window.__test;
  const cv = document.getElementById('gioco');
  const cx = cv.getContext('2d', { willReadFrequently: true });
  const W = cv.width, H = cv.height;
  const DPRc = W / window.innerWidth;
  const img = cx.getImageData(0, 0, W, H).data;
  const S2 = t.view.S2, Ax = t.view.Ax, Ay = t.view.Ay;
  const B = t.bande, VWc = W / DPRc, VHc = H / DPRc;

  const pixel = (sx, sy) => {
    const x = Math.round(sx * DPRc), y = Math.round(sy * DPRc);
    if (x < 0 || y < 0 || x >= W || y >= H) return null;
    const o = (y * W + x) * 4;
    return [img[o], img[o + 1], img[o + 2]];
  };
  /* «in quadro» vuol dire: dentro la tela E non sotto le fasce
     dell'interfaccia. Un uomo coperto dal tabellone non e' un uomo che
     si puo' confondere con un altro: non e' in scena. */
  const inQuadro = (sx, sy) => sx > 2 && sx < VWc - 2 && sy > B.bar + 2 && sy < VHc - B.foot - 2;
  const mediana = a => { const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1]; };

  /* LA FINESTRA DEL TORSO — la STESSA di collaudo.js, allargata di due
     file. Tre file (-12,5/-11,5/-10,5) sono ventuno pixel: bastano a una
     mediana di luminanza, sono pochini per una mediana di TINTA, dove un
     pixel di bordo pesa. Cinque file (-13,5 .. -9,5) per sette colonne
     fanno trentacinque campioni e restano tutte sotto il numero (che sta
     al 70-80% del segmento pelvi-collo, cioe' piu' in alto) e dentro il
     corpo del busto in tutte le andature. Non e' la finestra del
     cancello 3:1 e non pretende di esserlo: quella misura una luminanza
     contro l'erba, questa un colore contro un altro colore.
     LE DUE FILE IN PIU' VANNO IN BASSO E NON IN ALTO, ed e' costato una
     stesura: con -13,5 in cima la mediana pescava la frangia scura del
     contorno del numero (che il gioco dichiara a ~1,2 unita' sopra la
     fila -12,5) e due maglie diverse tornavano piu' simili di quanto
     sono. Il torso del rig copre la colonna fra -19 e -6: -9,5 e -8,5
     ci stanno dentro larghe e non incontrano nessun glifo. */
  const AV = [-12.5, -11.5, -10.5, -9.5, -8.5];
  const LA = [-1.5, -1.0, -0.5, 0, 0.5, 1.0, 1.5];

  const uomini = [];
  const scartati = [];
  for (const p of t.players) {
    if (p.out > 0) { scartati.push({ idx: p.idx, team: p.team, perche: 'espulso' }); continue; }
    /* LA STESSA ESCLUSIONE DI collaudo.js, e per la stessa ragione: a
       terra, in scivolata, in tuffo o in esultanza il torso non e' la
       capsula verticale che questa finestra presume, e si finisce a
       misurare l'erba. Prova d'accusa dalla prima stesura, che non
       filtrava: all'istante 6 la maglia della squadra 0 usciva #2c3f27,
       cioe' prato — e quella riga faceva media con le altre. */
    if (p.slide >= 0 || p.recover > 0 || p.dive > 0 || p.celeb > 0) {
      scartati.push({ idx: p.idx, team: p.team, perche: 'posa non in piedi' }); continue;
    }
    const camp = [];
    let dentro = 0, totale = 0;
    for (const av of AV) for (const la of LA) {
      const sx = (p.x + la) * S2 + Ax, sy = (p.y + av) * S2 + Ay;
      totale++;
      if (!inQuadro(sx, sy)) continue;
      const c = pixel(sx, sy);
      if (c) { camp.push(c); dentro++; }
    }
    /* meno di due terzi della finestra dentro il quadro = figura al bordo,
       tagliata: il suo colore medio e' quello di mezza maglia e mentirebbe */
    if (dentro < totale * 0.67) {
      scartati.push({ idx: p.idx, team: p.team, perche: 'fuori quadro',
        sx: Math.round((p.x) * S2 + Ax), sy: Math.round((p.y - 11.5) * S2 + Ay), dentro, totale });
      continue;
    }
    uomini.push({
      idx: p.idx, team: p.team, gk: p.role === 'gk',
      /* IL NUMERO LO DICHIARA IL GIOCO. Il ripiego idx+1 non e' una
         stima: e' alla lettera la riga che il file di PRIMA disegnava
         (String(p.idx+1)), quindi sul file vecchio la misura e' esatta. */
      numero: (p.numero != null) ? p.numero : (p.idx + 1),
      rgb: [mediana(camp.map(c => c[0])), mediana(camp.map(c => c[1])), mediana(camp.map(c => c[2]))],
      n: camp.length,
    });
  }

  /* il manto, per sapere quanto e' buio questo fotogramma: la mediana di
     una griglia larga di punti d'erba lontani da ogni corpo */
  const erba = [];
  for (let gx = 0.08; gx < 0.95; gx += 0.06) for (let gy = 0.18; gy < 0.95; gy += 0.08) {
    const sx = gx * VWc, sy = B.bar + gy * (VHc - B.bar - B.foot);
    const wx = (sx - Ax) / S2, wy = (sy - Ay) / S2;
    let libero = true;
    for (const q of t.players) { if (q.out > 0) continue; if (Math.abs(wx - q.x) < 34 && Math.abs(wy - q.y) < 40) { libero = false; break; } }
    if (!libero) continue;
    const c = pixel(sx, sy); if (c) erba.push(c);
  }
  const erbaRGB = erba.length ? [mediana(erba.map(c => c[0])), mediana(erba.map(c => c[1])), mediana(erba.map(c => c[2]))] : null;

  return { uomini, scartati, erbaRGB, ora: t.ora, scena: t.state, S2,
           quadro: { VWc: Math.round(VWc), VHc: Math.round(VHc), bar: B.bar, foot: B.foot } };
}

/* ---------------------------------------------------------------- OKLab
   Fuori dalla pagina: sui numeri, non sui pixel. */
function lin(c) { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
function oklab(rgb) {
  const R = lin(rgb[0]), G = lin(rgb[1]), B = lin(rgb[2]);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
          1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
          0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s];
}
function oklch(rgb) {
  const [L, a, b] = oklab(rgb);
  let h = Math.atan2(b, a) * 180 / Math.PI; if (h < 0) h += 360;
  return { L, C: Math.hypot(a, b), h };
}
/* dE OKLab x100. E' la distanza euclidea nello spazio in cui e' stata
   costruita per essere euclidea: nessun peso inventato qui sopra. */
function dE(rgb1, rgb2) {
  const A = oklab(rgb1), B = oklab(rgb2);
  return 100 * Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]);
}
function scomponi(rgb1, rgb2) {
  const A = oklch(rgb1), B = oklch(rgb2);
  let dh = Math.abs(A.h - B.h); if (dh > 180) dh = 360 - dh;
  return { dL: 100 * (A.L - B.L), dC: 100 * (A.C - B.C), dh };
}
const esa = c => '#' + c.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
const nn = (v, d) => (v == null ? '  n.d.' : v.toFixed(d == null ? 1 : d).replace('.', ','));

/* ==================================================================== */
(async function main() {
  const argv = process.argv.slice(2), o = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const k = argv[i].slice(2);
      o[k] = (argv[i + 1] && !argv[i + 1].startsWith('--')) ? argv[++i] : true;
    }
  }
  const n = Math.max(1, +(o.n || 8));
  const da = +(o.da || 3), a = +(o.a || 80);
  const seme = +(o.seme || 20260728);
  const vista = { w: +(o.w || 915), h: +(o.h || 412), dpr: +(o.dpr || 2) };
  const guasto = !!o.guasto, oro = !!o.oro;

  /* -------------------------------------------------------------------
     GLI OTTO ISTANTI ERANO SEI, ANCHE QUI.

     Questo strumento e' nato copiando il campionamento di istantanea.js, e
     ne ha ereditato il difetto insieme al resto: gli istanti si pescavano
     UNIFORMI (due potevano cadere vicinissimi) e il passo da fare era
     `max(0, bersaglio - orologio)` — cosi' un istante spostato in avanti
     per uscire da una celebrazione lasciava il successivo ALLE SUE SPALLE,
     il passo diventava zero e si rimisurava lo stesso fotogramma.

     Si vedeva nella tabella e nessuno l'aveva guardata: gli istanti 4 e 5
     cadevano tutti e due al secondo 38 con la stessa identica coppia
     peggiore (dE 15,0, sq0 n.3 #92cbd9 contro sq1 n.9 #e39dcc), e 7 e 8
     tutti e due al 49 (dE 14,5). Sei fotogrammi che si dichiaravano otto,
     e un «0 su 52 giocatori» che in realta' contava due volte tredici
     uomini.

     La cura e' la stessa gia' pagata in istantanea.js — stratificato, uno
     per fetta, con lo scarto confinato nel 70% centrale della fetta, piu'
     un passo minimo dichiarato — e sta qui perche' una ferita chiusa in
     un file e lasciata aperta in quello accanto e' una ferita aperta.
     ------------------------------------------------------------------- */
  const r = dado(seme ^ 0x9e3779b9);
  const PASSO_MIN = 2.0;                       // secondi di partita, dichiarati
  const istanti = [];
  const fetta = (a - da) / n;
  for (let i = 0; i < n; i++) istanti.push(da + fetta * (i + 0.15 + 0.70 * r()));
  istanti.sort((x, y) => x - y);

  const srv = await servi();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: vista.w, height: vista.h }, deviceScaleFactor: vista.dpr,
    isMobile: true, hasTouch: true, reducedMotion: 'no-preference', locale: 'it-IT',
  });
  const pag = await ctx.newPage();
  await pag.addInitScript(s0 => {
    let s = s0 >>> 0 || 1;
    const prossimo = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => prossimo() / 4294967296;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues = arr => { for (let i = 0; i < arr.length; i++) arr[i] = prossimo(); return arr; };
    }
  }, seme);
  await pag.addInitScript(bancoDiProva);

  const righe = [];
  try {
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.waitForTimeout(500);
    await pag.evaluate(() => window.__banco.passo(30));
    await pag.evaluate(arg => {
      const t = window.__test;
      t.dismissSplash && t.dismissSplash();
      if (arg.oro) t.setDalt(true);
      t.startMatch(1, 1);
      t.Tut && t.Tut.finish && t.Tut.finish(true);
      t.posaHUD && t.posaHUD(true);
      t.setCpuVsCpu && t.setCpuVsCpu(true);
      /* IL GUASTO: la squadra 1 vestita ESATTAMENTE come la squadra 0 —
         due tinte e motivo. Se dopo questo la distanza non crolla, lo
         strumento non sta leggendo le maglie. */
      if (arg.guasto) { TEAMCOL[1] = TEAMCOL[0]; TEAMCOL2[1] = TEAMCOL2[0]; TEAMPAT[1] = TEAMPAT[0]; refreshTeamRGB(); }
    }, { guasto, oro });
    try {
      await pag.waitForFunction(() => {
        const w = document.getElementById('wipe');
        if (w && getComputedStyle(w).display !== 'none') return false;
        const s = document.getElementById('splash');
        if (s) { const cs = getComputedStyle(s); if (cs.display !== 'none' && +cs.opacity > 0.02) return false; }
        return true;
      }, null, { polling: 60, timeout: 15000 });
    } catch (e) {}
    await pag.evaluate(congelaAnimazioni);

    console.log(`\n=== IDENTITA' — ${n} istanti fra il secondo ${da} e il secondo ${a}, seme ${seme} ===`);
    console.log(`quadro ${vista.w}x${vista.h}@${vista.dpr}` +
      (guasto ? '   !!! GUASTO: le due squadre vestite UGUALI (banco di prova dello strumento) !!!' : '') +
      (oro ? '   [divise per daltonici: l\'ancoraggio alto della scala]' : ''));

    let orologio = 0;
    for (let i = 0; i < istanti.length; i++) {
      /* IL PASSO NON PUO' ESSERE ZERO. Se il bersaglio e' gia' alle spalle
         (l'istante precedente e' stato portato avanti per uscire da una
         celebrazione) si avanza comunque di PASSO_MIN, e lo si dichiara
         nella riga: meglio un istante spostato e detto che un doppione
         taciuto. */
      const dovuto = istanti[i] - orologio;
      const avanti = Math.max(PASSO_MIN, dovuto);
      const forzato = dovuto < PASSO_MIN;
      const stato = await pag.evaluate(arg => {
        const t = window.__test, banco = window.__banco;
        /* il guasto si RIDIPINGE prima di ogni tratto: applyKit() rimette
           il kit vero a ogni fischio d'inizio, e un gol in mezzo lo
           rimetterebbe senza dirlo */
        const dipingi = () => { if (arg.guasto) { TEAMCOL[1] = TEAMCOL[0]; TEAMCOL2[1] = TEAMCOL2[0]; TEAMPAT[1] = TEAMPAT[0]; refreshTeamRGB(); } };
        dipingi();
        banco.passo(Math.round(arg.sec * 60));
        let extra = 0;
        for (let k = 0; k < 200; k++) {
          const s = t.state;
          if ((s === 'play' || s === 'golden') && !t.moviola) break;
          if (s === 'menu' || s === 'end') break;
          dipingi(); banco.passo(7); extra += 7 / 60;
        }
        if (extra > 0 && (t.state === 'play' || t.state === 'golden')) { dipingi(); banco.passo(72); extra += 1.2; }
        /* UN fotogramma in piu' SOLO nel banco di prova, e va detto: serve
           perche' l'ultimo disegnato porti addosso le tinte falsificate.
           Sposta l'istante di 1/60 di secondo — nella corsa vera non c'e'. */
        if (arg.guasto) { dipingi(); banco.passo(1); }
        return { scena: t.state, extra: +extra.toFixed(2) };
      }, { sec: avanti, guasto });
      /* l'orologio si SOMMA, non si indovina: prima valeva
         `istanti[i] + extra`, cioe' il bersaglio VOLUTO — e quando il passo
         veniva forzato quel numero tornava indietro, stampando un
         cronometro che scorreva all'incontrario. */
      orologio = orologio + avanti + stato.extra;
      if (stato.scena === 'menu' || stato.scena === 'end') {
        console.log(`\n--- istante ${i + 1}: la partita e' finita prima (${stato.scena}), si smette qui`);
        break;
      }
      const m = await pag.evaluate(misuraInPagina);
      /* la fotografia DOPO la misura e senza ridisegnare: e' lo stesso
         fotogramma che i numeri descrivono, non uno successivo */
      if (o.dir) {
        fs.mkdirSync(String(o.dir), { recursive: true });
        await pag.screenshot({ path: path.join(String(o.dir), 'ident-' + String(i + 1).padStart(2, '0') + '.png') });
      }
      righe.push({ i: i + 1, t: orologio, forzato, ...m });
    }
  } finally {
    await browser.close(); srv.chiudi();
  }

  /* -------------------------------------------------------- il rapporto */
  const esito = { istanti: [], guasto, oro };
  console.log('\n' + 'ist'.padEnd(5) + 'ora'.padEnd(7) + 'erba'.padEnd(10) +
    'in quadro'.padEnd(12) + 'COPPIA PEGGIORE (movimento, squadre diverse)'.padEnd(46) + 'numeri ambigui');
  console.log('-'.repeat(122));

  for (const R of righe) {
    const mov = R.uomini.filter(u => !u.gk);
    const por = R.uomini.filter(u => u.gk);
    let peggio = null;
    for (const A of mov) for (const B of mov) {
      if (A.team >= B.team) continue;
      const d = dE(A.rgb, B.rgb);
      if (!peggio || d < peggio.d) peggio = { d, A, B, s: scomponi(A.rgb, B.rgb) };
    }
    /* portieri: una riga a parte, perche' vestono la stessa divisa per
       costruzione e vincerebbero sempre la classifica */
    let dPor = null;
    if (por.length >= 2) {
      for (const A of por) for (const B of por) { if (A.team >= B.team) continue;
        const d = dE(A.rgb, B.rgb); if (dPor == null || d < dPor) dPor = d; }
    }
    /* i numeri ambigui: TUTTI i giocatori in quadro, portieri compresi */
    let ambigui = 0;
    for (const A of R.uomini) if (R.uomini.some(B => B.team !== A.team && B.numero === A.numero)) ambigui++;

    const cop = peggio
      ? `${nn(peggio.d)}  (sq0 n.${peggio.A.numero} ${esa(peggio.A.rgb)} vs sq1 n.${peggio.B.numero} ${esa(peggio.B.rgb)})`
      : 'nessuna coppia in quadro';
    console.log(String(R.i).padEnd(5) + nn(R.ora * 100, 0).padEnd(7) +
      (R.erbaRGB ? esa(R.erbaRGB) : '  ?  ').padEnd(10) +
      `${mov.length}mov+${por.length}gk`.padEnd(12) + cop.padEnd(46) +
      `${ambigui}/${R.uomini.length}`);
    if (peggio) {
      console.log('     '.padEnd(34) + `scomposta: dL ${nn(peggio.s.dL)}  dC ${nn(peggio.s.dC)}  dh ${nn(peggio.s.dh, 0)} gradi` +
        (dPor != null ? `      [portieri fra loro: ${nn(dPor)}]` : ''));
    }
    if (process.env.DETTAGLI) {
      console.log('     in quadro: ' + R.uomini.map(u => `sq${u.team}n${u.numero}${u.gk ? 'G' : ''}=${esa(u.rgb)}`).join(' '));
      if (R.scartati.length) console.log('     scartati: ' + R.scartati.map(s => `sq${s.team}i${s.idx}(${s.perche}${s.sx != null ? ' ' + s.sx + ',' + s.sy : ''})`).join(' ') +
        `   quadro ${R.quadro.VWc}x${R.quadro.VHc} bar ${R.quadro.bar} foot ${R.quadro.foot}`);
    }
    esito.istanti.push({
      i: R.i, ora: R.ora, erba: R.erbaRGB ? esa(R.erbaRGB) : null,
      mov: mov.length, gk: por.length,
      peggiore: peggio ? { dE: +peggio.d.toFixed(2), ...peggio.s,
        a: { team: 0, numero: peggio.A.numero, rgb: esa(peggio.A.rgb) },
        b: { team: 1, numero: peggio.B.numero, rgb: esa(peggio.B.rgb) } } : null,
      portieri: dPor != null ? +dPor.toFixed(2) : null,
      ambigui, inQuadro: R.uomini.length,
    });
  }

  /* -------- la sintesi: il peggio del peggio, e quanto si stringe di sera */
  const conCoppia = esito.istanti.filter(x => x.peggiore);
  if (conCoppia.length) {
    const peggioAssoluto = conCoppia.reduce((m, x) => x.peggiore.dE < m.peggiore.dE ? x : m);
    /* «l'istante piu' chiaro e il piu' scuro»: si ordina sulla LUMINANZA
       OKLab del manto misurato, che e' la sera vista dai pixel e non
       l'orologio della partita — un fotogramma puo' cadere in una zona
       d'ombra o sotto un faro. */
    const conErba = conCoppia.filter(x => x.erba);
    let chiaro = null, scuro = null;
    if (conErba.length >= 2) {
      const conL = conErba.map(x => ({ x, L: oklab([parseInt(x.erba.slice(1, 3), 16), parseInt(x.erba.slice(3, 5), 16), parseInt(x.erba.slice(5, 7), 16)])[0] }));
      conL.sort((p, q) => p.L - q.L);
      scuro = conL[0]; chiaro = conL[conL.length - 1];
    }
    const somma = conCoppia.reduce((s, x) => s + x.peggiore.dE, 0) / conCoppia.length;
    const ambTot = esito.istanti.reduce((s, x) => s + x.ambigui, 0);
    const inqTot = esito.istanti.reduce((s, x) => s + x.inQuadro, 0);
    console.log('\n' + '='.repeat(122));
    console.log(`COPPIA PEGGIORE DI TUTTI GLI OTTO: dE ${nn(peggioAssoluto.peggiore.dE)} all'istante ${peggioAssoluto.i}` +
      `  (dL ${nn(peggioAssoluto.peggiore.dL)}  dC ${nn(peggioAssoluto.peggiore.dC)}  dh ${nn(peggioAssoluto.peggiore.dh, 0)} gradi)`);
    console.log(`MEDIA delle coppie peggiori: dE ${nn(somma)}`);
    if (chiaro && scuro) {
      console.log(`QUANTO SI STRINGE DI SERA: istante piu' CHIARO (${chiaro.x.i}, erba ${chiaro.x.erba}) dE ${nn(chiaro.x.peggiore.dE)}` +
        `  ->  piu' SCURO (${scuro.x.i}, erba ${scuro.x.erba}) dE ${nn(scuro.x.peggiore.dE)}` +
        `   = ${nn(100 * (scuro.x.peggiore.dE / chiaro.x.peggiore.dE - 1), 0)}%`);
    }
    console.log(`NUMERI AMBIGUI: ${ambTot} su ${inqTot} giocatori in quadro negli otto istanti` +
      ` (istante per istante: ${esito.istanti.map(x => x.ambigui).join(' ')})`);
    esito.sintesi = { peggiore: peggioAssoluto.peggiore.dE, media: +somma.toFixed(2), ambigui: ambTot, inQuadro: inqTot,
      chiaro: chiaro ? chiaro.x.peggiore.dE : null, scuro: scuro ? scuro.x.peggiore.dE : null };
  }
  console.log('');
  if (o.json) fs.writeFileSync(String(o.json), JSON.stringify(esito, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
