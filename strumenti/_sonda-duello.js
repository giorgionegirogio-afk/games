/* =====================================================================
   _sonda-duello.js — IL FONDALE DEL DUELLO COPRE OGNI PIXEL? CONTIAMOLI.

   SECONDA STESURA. La prima diceva «COPERTURA PIENA» ed era verde per il
   motivo sbagliato. Quello che segue e' scritto per intero perche' e' la
   parte da cui si impara qualcosa.

   Questa sonda esiste per rispondere a DUE domande, quelle da cui dipende
   se la toppa _t-duello.js e' lecita o e' una regressione muta:

     1. saltando il disegno del mondo sotto il duello, resta scoperto
        anche un solo pixel?
     2. l'immagine del duello e' la stessa, prima e dopo?

   =====================================================================
   IL BUCO CHE QUESTA SONDA NON VEDEVA, e come si era chiuso da sola gli
   occhi. Va letto prima del codice.

   La prima stesura dichiarava, per iscritto, in testa a questo file:

       «IL CASO CHE PUO' ROMPERE TUTTO E' COMPRESO APPOSTA: la scossa. La
        sonda forza G.shake al massimo — anche in fasi in cui il gioco non
        lo farebbe — proprio per aprire quella striscia se e' apribile.»

   Era falso. La scossa era accesa SOLO nei cinque casi 'result'. E il
   push-in del duello (drawDuelScene) vale 1,035 proprio e solo in fase
   'result'; in 'zone' non c'e' nemmeno il ramo, push resta 1. Cioe': la
   sonda accendeva la scossa esattamente e solo dove il push-in la copriva
   per costruzione, e provava push==1 esattamente e solo dove la scossa era
   spenta. LA COMBINAZIONE PERICOLOSA — push==1 con la scossa accesa — non
   veniva provata mai. Il verde era vero e vuoto.
   Ed e' lo stesso errore del magenta che la prima stesura raccontava con
   orgoglio di aver corretto, un ripiano piu' in basso: un cancello
   superato per la via piu' corta.

   Adesso i casi con la scossa e push==1 ci sono, e sono i primi tre:
   'zone', 'power' a poseT=0, 'wait' a poseT=0. Sulla costruzione toppata
   dalla PRIMA stesura questa sonda esce 1 e stampa 17.712 pixel scoperti.

   =====================================================================
   IL SECONDO ERRORE DI QUESTO BANCO: LA CAMERA CHE SI MUOVE FRA I DUE
   SCATTI. Trovato in questa passata, e spiega numeri contraddittori.

   La prova di copertura disegna lo stesso fotogramma DUE volte, su fondo
   nero e su fondo bianco, e conta i pixel che cambiano. Regge su un
   presupposto: che i due fotogrammi siano LO STESSO fotogramma. Ma
   updateCamera() sta DENTRO render(), quindi ogni chiamata a render()
   muove la camera. Nella costruzione NON toppata la striscia del bordo
   mostra il MONDO — l'unica parte del quadro che dipende dalla camera,
   perche' tutto il resto e' la tessitura in cache del duello — e quindi
   fra lo scatto su nero e quello su bianco quella striscia cambia ANCHE
   SE E' PERFETTAMENTE COPERTA.
   Misurato (strumenti/_z-bordo.js) sullo stesso file, md5 identico:

       camera libera, tre giri di fila: 17455, 1504, 19 px «trapassati»
       camera inchiodata, tre giri:         0,    0,  0

   Cioe' il falso positivo valeva fino a diciassettemila pixel e si
   spegneva da solo man mano che la camera si assestava. Un banco cosi'
   assolve e condanna a caso. Da qui in poi la camera si inchioda —
   window.updateCamera diventa una funzione vuota — dopo il riscaldamento
   e prima degli scatti, e si rimette a posto per la misura del costo.

   =====================================================================
   IL TERZO: IL CANCELLO DI DETERMINISMO. Il metodo nero-contro-bianco non
   puo' funzionare se lo stesso fotogramma, disegnato due volte sullo
   stesso fondo, da' due immagini diverse. Adesso si scatta il nero DUE
   volte, una prima e una dopo il bianco: se le due non coincidono, il
   banco ha uno stato nascosto, il conteggio non misura la copertura, e la
   sonda lo DICE e esce 1 invece di stampare un numero. (Nella scena del
   gol questo cancello scatta davvero: vedi strumenti/_z-ripresa.js.)

   =====================================================================
   LA MISURA CHE NON HA BISOGNO DI UN BANCO: L'ALFA DELLA TESSITURA.
   Il fondale e' una drawImage di una tessitura cotta. Se quella tessitura
   ha un texel con alfa<255, il fondale e' trasparente li' — e si legge
   direttamente dal canale alfa, senza scatti, senza camera, senza stato.
   E' la prova piu' corta che esista per il sigillo dell'orizzonte, e vale
   anche per la ripresa del gol, che usa la stessa tessitura.

   =====================================================================
   LE ALTRE DUE COSE CHE IL BANCO DEVE AVERE, gia' nella prima stesura e
   ancora vere:

   IL SEME. Due caricamenti di pagina hanno due flussi di Math.random, e
   dal caso escono la tribuna cotta nell'atlante, i colori delle maglie, i
   nomi sul tabellone e la banda della barra di potenza. Math.random viene
   sostituito PRIMA di ogni script della pagina con un generatore a seme
   fisso: due caricamenti qualunque diventano identici al bit.

   IL CONTROLLO. Si misura sempre lo STESSO file caricato due volte: se il
   controllo non da' zero differenze, la sonda lo dice, invece di
   attribuire alla toppa una differenza che e' del banco.

   LO STATO DEL DUELLO SI FORZA A MANO, ed e' l'altra meta' della
   ripetibilita': un rigore giocato davvero passa per fasi che durano
   decimi di secondo e non si riprende due volte lo stesso istante.

   uso:
     node strumenti/_sonda-duello.js --prima X.html --dopo Z.html
     ... --sigillo Y.html        (la colonna «solo il sigillo»; costruiscila
                                  con _t-duello.js --solo c)
     ... --png cartella --w 915 --h 412 --dpr 2 --seme 12345

   Esce 1 se un pixel resta scoperto, se il cancello di determinismo
   scatta, se il controllo non e' pulito o se le immagini differiscono:
   non stampa un verde che non ha verificato.
   ===================================================================== */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

function argomenti() {
  const a = process.argv.slice(2), o = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith('--')) o[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : true;
  }
  return o;
}
const o = argomenti();
const PRIMA = path.resolve(o.prima || '');
const DOPO = path.resolve(o.dopo || '');
if (!fs.existsSync(PRIMA) || !fs.existsSync(DOPO)) {
  console.error('serve --prima <file.html> --dopo <file.html> (entrambi esistenti)');
  process.exit(2);
}
const VISTA = { w: +(o.w || 915), h: +(o.h || 412), dpr: +(o.dpr || 2) };
const SEME = +(o.seme || 20260819);
const PNGDIR = o.png ? path.resolve(o.png) : null;
if (PNGDIR) fs.mkdirSync(PNGDIR, { recursive: true });

/* --------------------------------------------------------------- server */
function servi(radice) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const p = decodeURIComponent(req.url.split('?')[0]);
      const f = path.join(radice, p);
      if (!f.startsWith(radice) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('no'); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* -------------------------------------------------------------- i casi
   I PRIMI TRE SONO IL MOTIVO DI QUESTA STESURA: scossa accesa dove il
   push-in NON c'e'. Il valore della scossa non e' «al massimo» a caso: e'
   quello che produce il FALLO vero — scossa(7.4, 0.30, dx, dy) — letto un
   fotogramma dopo l'urto, che e' quando l'ampiezza e' massima. Il fallo
   chiama scossa() e startFreeKick() nello stesso fotogramma e niente
   azzera G.shake in mezzo: 17 fotogrammi di fase 'zone' su 24 hanno la
   scossa accesa (misurato, strumenti/_zz-fallo.js). Non e' un caso di
   laboratorio: e' il percorso piu' comune per entrare in un duello.
   'result' tiene la scossa vecchia (0,26 di 0,30, mag 14) perche' li' la
   scossa e' quella dell'impatto, non quella del fallo. */
const FALLO = { shake: 0.30 - 1 / 60, dur: 0.30, mag: 7.4, dx: 0.80, dy: 0.60 };
const IMPATTO = { shake: 0.26, dur: 0.30, mag: 14, dx: 0.8, dy: 0.6 };
const CASI = [
  { id: 'zone',              phase: 'zone',   rt: 0,    poseT: 0.0,  aimU: 0.0,  esito: '',       sc: null },
  { id: 'zone-SCOSSA',       phase: 'zone',   rt: 0,    poseT: 0.0,  aimU: 0.0,  esito: '',       sc: FALLO },
  { id: 'power-0-SCOSSA',    phase: 'power',  rt: 0,    poseT: 0.0,  aimU: -0.7, esito: '',       sc: FALLO },
  { id: 'wait-0-SCOSSA',     phase: 'wait',   rt: 0,    poseT: 0.0,  aimU: 0.7,  esito: '',       sc: FALLO },
  { id: 'power',             phase: 'power',  rt: 0,    poseT: 0.45, aimU: -0.7, esito: '',       sc: FALLO },
  { id: 'wait',              phase: 'wait',   rt: 0,    poseT: 0.90, aimU: 0.7,  esito: '',       sc: FALLO },
  { id: 'result-000',        phase: 'result', rt: 0.00, poseT: 0.90, aimU: 0.5,  esito: 'gol',    sc: IMPATTO },
  { id: 'result-030',        phase: 'result', rt: 0.30, poseT: 0.90, aimU: 0.5,  esito: 'gol',    sc: IMPATTO },
  { id: 'result-070',        phase: 'result', rt: 0.70, poseT: 0.90, aimU: -0.5, esito: 'gol',    sc: IMPATTO },
  { id: 'result-120-parato', phase: 'result', rt: 1.20, poseT: 0.90, aimU: 0.0,  esito: 'parato', sc: IMPATTO },
  { id: 'result-160-fuori',  phase: 'result', rt: 1.60, poseT: 0.90, aimU: 0.9,  esito: 'fuori',  sc: IMPATTO },
];

/* --------------------------------------------------- un giro su un file */
async function giro(url, etichetta) {
  const browser = await chromium.launch();
  const ctxb = await browser.newContext({ viewport: { width: VISTA.w, height: VISTA.h }, deviceScaleFactor: VISTA.dpr });
  /* IL SEME, PRIMA DI OGNI SCRIPT DELLA PAGINA */
  await ctxb.addInitScript((seme) => {
    let s = seme >>> 0;
    Math.random = function () {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }, SEME);
  const pag = await ctxb.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push(String(e)));
  await pag.goto(url, { waitUntil: 'load' });
  await pag.waitForFunction(() => window.__test && window.__test.state, null, { timeout: 30000 });

  await pag.evaluate(() => window.__test.rigori());
  await pag.waitForFunction(() => typeof Duel !== 'undefined' && Duel.phase !== 'off', null, { timeout: 30000 });
  await pag.waitForTimeout(400);

  /* IL CICLO SI FERMA: si toglie requestAnimationFrame, il ciclo
     principale si richiama da solo di li' e al giro dopo non riparte. Da
     questo momento il fotogramma lo decide la sonda. */
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(200);

  const esiti = [];
  for (const c of CASI) {
    const r = await pag.evaluate((c) => {
      const D = Duel;
      /* GLI INGRESSI DEL FOTOGRAMMA, tutti quanti, riscritti prima di ogni
         singolo render: la fase del duello, gli orologi che il disegno
         legge (G.pulse per i lampi in tribuna, G.sceneT, G.timeLeft per
         l'ora e la luce, D.cpuT), la scossa, e G.renderDT — che decide di
         quanto la camera avanza a ogni chiamata e che senza il ciclo di
         animazione resterebbe al valore casuale dell'ultimo fotogramma
         vero. */
      const cs = () => {
        D.phase = c.phase; D.resultT = c.rt; D.poseT = c.poseT;
        D.aimU = c.aimU; D.aimV = 0.5; D.outcome = c.esito;
        D.dito = -1; D.mira = false;
        G.pulse = 20; G.sceneT = 3; G.timeLeft = 60; D.cpuT = 0.5;
        G.renderDT = 1 / 60;
        if (c.sc) { G.shake = c.sc.shake; G.shakeDur = c.sc.dur; G.shakeMag = c.sc.mag; G.shakeDX = c.sc.dx; G.shakeDY = c.sc.dy; }
        else { G.shake = 0; }
      };
      cs();

      /* LA GEOMETRIA DEL DUELLO SI ASSESTA E IL FONDALE SI RICUOCE.
         duelGeo() non e' pura: legge l'altezza vera di .duelhead e
         .duelfoot dal DOM, e nei primi fotogrammi l'impaginazione non e'
         ancora ferma. Il fondale viene cotto UNA volta e messo in cache
         con una chiave che tronca a intero (g.hz|0): se la prima cottura
         e' capitata su una geometria di mezzo pixel diversa, la cache non
         se ne accorge. Qui si fa convergere la misura e si butta la
         cache. */
      misuraDuel(); misuraDuel(); misuraDuel();
      duelBg[0].key = ''; duelBg[1].key = '';

      /* riscaldamento: lo stato della tela e la camera si assestano su
         quello che QUESTA costruzione produce a regime */
      for (let i = 0; i < 40; i++) { cs(); render(); }

      /* LA CAMERA SI INCHIODA. Vedi la spiegazione in testa al file: senza
         questa riga la striscia del bordo cambia fra i due scatti perche'
         updateCamera() gira dentro render(), e il conteggio misura la
         deriva della camera invece della copertura. Si rimette a posto
         dopo, per la misura del costo. */
      const cameraVera = window.updateCamera;
      window.updateCamera = function () { };
      cs(); render();

      /* L'ALFA DELLA TESSITURA DEL FONDALE, che non dipende dal banco */
      let alfa = null;
      {
        const T = duelBg[0].tex || duelBg[1].tex;
        if (T) {
          const dd = T.getContext('2d').getImageData(0, 0, T.width, T.height).data;
          let sotto = 0, minA = 255;
          for (let i = 3; i < dd.length; i += 4) if (dd[i] < 255) { sotto++; if (dd[i] < minA) minA = dd[i]; }
          alfa = { w: T.width, h: T.height, sotto, minA: sotto ? minA : 255 };
        }
      }

      const W = cv.width, H = cv.height;
      const prima = (col) => {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = col; ctx.fillRect(0, 0, W, H);
        ctx.restore();
      };
      const scatta = () => Uint8Array.from(ctx.getImageData(0, 0, W, H).data);

      /* LA PROVA DI COPERTURA: NERO CONTRO BIANCO, e non il magenta.
         La prima versione contava i pixel rimasti ESATTAMENTE magenta:
         dava zero anche dove il fondale era trasparente all'8%, perche' un
         pixel coperto al 92% non e' piu' magenta esatto.
         La prova giusta disegna lo stesso fotogramma su fondo nero e su
         fondo bianco e confronta: un pixel che cambia lascia passare cio'
         che sta sotto, e di quanto cambia dice quanto ne lascia passare.
         IL TERZO SCATTO — di nuovo nero, dopo il bianco — e' il cancello
         di determinismo: se non torna uguale al primo, i due scatti non
         erano lo stesso fotogramma e il conto non vuol dire niente. */
      cs(); prima('#000000'); render(); const SN = scatta();
      cs(); prima('#ffffff'); render(); const SB = scatta();
      cs(); prima('#000000'); render(); const SN2 = scatta();

      window.updateCamera = cameraVera;

      let deriva = 0;
      for (let i = 0; i < SN.length; i += 4)
        if (SN[i] !== SN2[i] || SN[i + 1] !== SN2[i + 1] || SN[i + 2] !== SN2[i + 2]) deriva++;

      let passa = 0, passaMax = 0, pX = -1, pY = -1, x0 = -1, x1 = -1, y0 = -1, y1 = -1;
      const rgb = new Uint8Array(W * H * 3);
      for (let i = 0, px = 0; i < SN.length; i += 4, px++) {
        const R = SN[i], Gc = SN[i + 1], B = SN[i + 2];
        rgb[px * 3] = R; rgb[px * 3 + 1] = Gc; rgb[px * 3 + 2] = B;
        const d0 = Math.abs(R - SB[i]), d1 = Math.abs(Gc - SB[i + 1]), d2 = Math.abs(B - SB[i + 2]);
        const dd = d0 > d1 ? (d0 > d2 ? d0 : d2) : (d1 > d2 ? d1 : d2);
        if (dd > 0) {
          passa++; if (dd > passaMax) passaMax = dd;
          const x = px % W, y = (px / W) | 0;
          if (pX < 0) { pX = x; pY = y; x0 = x1 = x; y0 = y1 = y; }
          else { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        }
      }
      /* lo stato che decide la copertura, stampato accanto al numero:
         senza questi due un «0 px» non si sa se e' merito della toppa o
         del fatto che il caso non metteva niente alla prova */
      const SC = scossaOff().slice();
      let push = 1;
      if (SAVE.moto) {
        if (D.phase === 'power' || D.phase === 'wait') push = 1 + 0.035 * Math.min(1, Math.max(0, (D.poseT || 0) / 0.90));
        else if (D.phase === 'result') push = 1 + 0.035 + 0.075 * Math.min(1, Math.max(0, D.resultT / 0.30)) - 0.085 * Math.min(1, Math.max(0, (D.resultT - 0.80) / 0.70));
      }

      let bin = '';
      const CH = 0x8000;
      for (let i = 0; i < rgb.length; i += CH) bin += String.fromCharCode.apply(null, rgb.subarray(i, i + CH));
      return {
        passa, passaMax, pX, pY, x0, x1, y0, y1, W, H, tot: W * H, deriva, alfa,
        push: +push.toFixed(4), scx: +SC[0].toFixed(2), scy: +SC[1].toFixed(2), moto: SAVE.moto,
        b64: btoa(bin), png: cv.toDataURL('image/png'),
      };
    }, c);
    if (PNGDIR) fs.writeFileSync(path.join(PNGDIR, `${etichetta}-${c.id}.png`), Buffer.from(r.png.split(',')[1], 'base64'));
    esiti.push({ caso: c.id, ...r, buf: Buffer.from(r.b64, 'base64'), b64: undefined, png: undefined });
  }

  /* ------------------------------------------------- il costo, a parte
     AVVERTENZA CHE VALE PIU' DEI NUMERI. Questo e' un banco headless senza
     scheda grafica: i millisecondi non dicono niente sul telefono, e la
     passata scorsa ha provato che nemmeno il RAPPORTO regge — misurando il
     fotogramma di duello DOPO uno di partita usciva 26 ms anche sulla
     costruzione toppata, cioe' su un ramo che fa una drawImage e due
     figure. Quindi qui si stampano due numeri e un controllo di coerenza,
     e SE il controllo non passa il rapporto NON si stampa affatto: un
     numero dichiarato invalido non si mette sotto gli occhi di nessuno,
     perche' finisce copiato. Per i millisecondi c'e' il telefono:
     node strumenti/telefono.js. */
  const costo = await pag.evaluate(() => {
    const misura = (n) => {
      for (let i = 0; i < 30; i++) render();
      const t0 = performance.now();
      for (let i = 0; i < n; i++) render();
      return (performance.now() - t0) / n;
    };
    const scena0 = G.scene;
    Duel.phase = 'result'; Duel.resultT = 0.4; Duel.outcome = 'gol'; G.shake = 0;
    const duello = misura(60);
    Duel.phase = 'off'; G.scene = 'play';
    const partita = misura(60);
    Duel.phase = 'result'; G.scene = scena0;
    return { duello, partita };
  });

  await browser.close();
  return { esiti, costo, errori };
}

/* --------------------------------------------------------- il confronto */
function confronta(a, b) {
  const A = a.buf, B = b.buf;
  if (A.length !== B.length) return { diversi: -1, maxd: 255, x0: 0, y0: 0, x1: 0, y1: 0 };
  let diversi = 0, maxd = 0, x0 = -1, y0 = -1, x1 = -1, y1 = -1;
  const W = a.W;
  for (let px = 0, i = 0; i < A.length; i += 3, px++) {
    const d0 = Math.abs(A[i] - B[i]), d1 = Math.abs(A[i + 1] - B[i + 1]), d2 = Math.abs(A[i + 2] - B[i + 2]);
    const d = d0 > d1 ? (d0 > d2 ? d0 : d2) : (d1 > d2 ? d1 : d2);
    if (d) {
      diversi++;
      if (d > maxd) maxd = d;
      const x = px % W, y = (px / W) | 0;
      if (x0 < 0) { x0 = x1 = x; y0 = y1 = y; }
      else { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
  }
  return { diversi, maxd, x0, y0, x1, y1 };
}

/* -------------------------------------------------------------------- */
(async () => {
  const radice = path.dirname(PRIMA);
  if (path.dirname(DOPO) !== radice) { console.error('prima e dopo devono stare nella stessa cartella'); process.exit(2); }
  const SIG = o.sigillo ? path.resolve(o.sigillo) : null;
  const srv = await servi(radice);
  const base = `http://127.0.0.1:${srv.porta}/`;

  console.log(`vista ${VISTA.w}x${VISTA.h} dpr ${VISTA.dpr}  (tela ${VISTA.w * VISTA.dpr}x${VISTA.h * VISTA.dpr})  seme ${SEME}`);
  console.log('giro  prima ...');
  const A = await giro(base + path.basename(PRIMA), 'prima');
  console.log('giro  prima, di nuovo (CONTROLLO: il fondo di rumore del banco) ...');
  const C = await giro(base + path.basename(PRIMA), 'controllo');
  let S = null;
  if (SIG) { console.log('giro  solo sigillo ...'); S = await giro(base + path.basename(SIG), 'sigillo'); }
  console.log('giro  dopo (toppa piena) ...');
  const B = await giro(base + path.basename(DOPO), 'dopo');
  srv.chiudi();

  const s = (d) => d.diversi === 0 ? 'identiche' : `${d.diversi} px Δ${d.maxd} y${d.y0}-${d.y1}`;

  /* -------------- 0. il cancello di determinismo, prima di tutto ------- */
  let derive = 0;
  for (const [n, r] of [['prima', A], ['controllo', C], ['sigillo', S], ['dopo', B]]) {
    if (!r) continue;
    for (const e of r.esiti) if (e.deriva) { derive++; console.log(`DERIVA  ${n} / ${e.caso}: lo stesso fotogramma disegnato due volte sullo stesso fondo differisce in ${e.deriva} px`); }
  }

  /* ---------------- 1. la copertura, costruzione per costruzione ------- */
  console.log('\n1) COPERTURA — lo stesso fotogramma su fondo nero e su fondo bianco.');
  console.log('   Un pixel che cambia e\' un pixel che lascia passare cio\' che sta sotto.');
  console.log('   push e scossa sono stampati accanto: un «nessuno» dove non c\'e\' scossa e');
  console.log('   il push e\' 1,035 non prova niente, e questo banco l\'ha gia\' imparato.\n');
  const col = ['prima', SIG ? 'sigillo' : null, 'dopo'].filter(Boolean);
  console.log('caso                 push    scossa        ' + col.map(n => ('trapassa ' + n).padEnd(24)).join(''));
  console.log('-'.repeat(41 + col.length * 24));
  let perde = 0;
  for (let i = 0; i < CASI.length; i++) {
    const riga = [A, S, B].filter(Boolean).map(r => {
      const e = r.esiti[i];
      return (e.passa === 0 ? 'nessuno' : `${e.passa} px Δ${e.passaMax} y${e.y0}-${e.y1}`).padEnd(24);
    });
    if (B.esiti[i].passa !== 0) perde++;
    const e0 = B.esiti[i];
    console.log(CASI[i].id.padEnd(21) + e0.push.toFixed(4).padEnd(8) +
      (`${e0.scx},${e0.scy}`).padEnd(14) + riga.join(''));
  }

  /* -------- 1bis. l'alfa della tessitura: la prova che non ha banco ---- */
  console.log('\n1bis) ALFA DELLA TESSITURA del fondale — letta, non dedotta.');
  console.log('      Un texel con alfa<255 e\' un fondale trasparente li\', in qualunque scena');
  console.log('      lo si usi: duelFondo lo stende sia il duello sia la ripresa del gol.\n');
  for (const [n, r] of [['prima', A], ['sigillo', S], ['dopo', B]]) {
    if (!r) continue;
    const al = r.esiti[0].alfa;
    console.log('   ' + n.padEnd(10) + (al ? `${al.w}x${al.h}: ${al.sotto} texel con alfa<255` + (al.sotto ? `, alfa minima ${al.minA}/255` : '  — OPACA') : 'tessitura non trovata'));
  }

  /* ---------------- 2. le immagini, confronto fra costruzioni ---------- */
  console.log('\n2) IMMAGINE — confronto pixel per pixel (fotogramma su fondo nero).\n');
  console.log('caso                 CONTROLLO           ' + (S ? 'SOLO IL TAGLIO      SOLO IL SIGILLO     ' : '') + 'TOPPA PIENA');
  console.log('                     prima|prima         ' + (S ? 'sigillo|dopo        prima|sigillo       ' : '') + 'prima|dopo');
  console.log('-'.repeat(S ? 101 : 61));
  let banco = 0, taglio = 0;
  for (let i = 0; i < CASI.length; i++) {
    const dc = confronta(A.esiti[i], C.esiti[i]);
    const dt = S ? confronta(S.esiti[i], B.esiti[i]) : null;
    const ds = S ? confronta(A.esiti[i], S.esiti[i]) : null;
    const db = confronta(A.esiti[i], B.esiti[i]);
    if (dc.diversi !== 0) banco++;
    if (dt && dt.diversi !== 0) taglio++;
    console.log(CASI[i].id.padEnd(21) + s(dc).padEnd(20) + (S ? s(dt).padEnd(20) + s(ds).padEnd(20) : '') + s(db));
  }

  const t = A.esiti[0];
  console.log('\ntela: ' + t.W + 'x' + t.H + ' = ' + t.tot + ' pixel per fotogramma');

  /* ------------------------------ il costo, con la museruola ----------- */
  console.log('\ncosto di render() — BANCO HEADLESS. Non sono i millisecondi del telefono.');
  console.log(`   prima      partita ${A.costo.partita.toFixed(2)} ms   duello ${A.costo.duello.toFixed(2)} ms`);
  console.log(`   dopo       partita ${B.costo.partita.toFixed(2)} ms   duello ${B.costo.duello.toFixed(2)} ms`);
  const rp = Math.max(A.costo.partita, B.costo.partita) / Math.min(A.costo.partita, B.costo.partita);
  if (rp > 1.5) {
    console.log(`   RAPPORTO NON STAMPATO: il fotogramma di partita misura ${A.costo.partita.toFixed(2)} contro`);
    console.log(`   ${B.costo.partita.toFixed(2)} ms nei due giri, ma le due costruzioni li' eseguono lo STESSO codice.`);
    console.log(`   Il banco ha sbandato: qualunque rapporto di questa passata sarebbe un numero`);
    console.log(`   inventato, e i numeri inventati finiscono copiati. Per i millisecondi:`);
    console.log(`   node strumenti/telefono.js --rigore --apk <file.apk>`);
  } else {
    /* IL RAPPORTO NON SI STAMPA NEMMENO QUANDO IL CONTROLLO PASSA, e va
       spiegato perche' e' un cambio di rotta. La prima stesura stampava
       «da 48 a 78 volte piu' leggero», il numero e' finito nel rapporto e
       poi inciso nel sorgente del gioco. Poi il telefono ha misurato la
       STESSA scena: 2,50 ms prima, 2,00 dopo. Un quinto, non
       settantottesimi. Il banco headless disegna in software e sbaglia il
       duello di un fattore dieci in valore assoluto — e sbagliando i due
       termini in modo diverso sbaglia anche il rapporto.
       Regola di casa 5: un numero che una misura migliore ha superato non
       si spedisce. Il rapporto di questo banco e' superato dal telefono, e
       allora non lo si stampa: se lo si stampa, qualcuno lo copia. */
    console.log(`   RAPPORTO NON STAMPATO PER SCELTA. Il banco headless disegna in software:`);
    console.log(`   sullo stesso fotogramma di duello legge decine di millisecondi dove il`);
    console.log(`   telefono ne legge 2,8 (OnePlus 6, misurato con telefono.js --rigore). I due`);
    console.log(`   numeri qui sopra servono a vedere che il lavoro sparisce, non quanto.`);
    console.log(`   Per i millisecondi: node strumenti/telefono.js --rigore --apk <file.apk>`);
  }
  for (const [n, r] of [['prima', A], ['controllo', C], ['sigillo', S], ['dopo', B]]) if (r && r.errori.length) console.log(`errori di pagina ${n}: ` + r.errori.join(' | '));

  console.log('');
  if (banco) console.log(`NOTA SUL BANCO: ${banco} casi su ${CASI.length} differiscono fra due caricamenti dello STESSO file.\n   E' il fondo di rumore del rasterizzatore headless: qualunque differenza dello\n   stesso ordine NON e' della toppa.`);
  else console.log('banco ripetibile: lo stesso file caricato due volte da immagini identiche al pixel.');

  let stato = 0;
  if (derive) {
    console.log(`DETERMINISMO ROTTO in ${derive} casi: i due scatti non erano lo stesso fotogramma.\n   I numeri di copertura qui sopra NON valgono. Non usarli.`);
    stato = 1;
  }
  if (perde) { console.log(`COPERTURA INCOMPLETA: ${perde} casi su ${CASI.length} lasciano passare cio' che sta sotto.`); stato = 1; }
  else if (!derive) console.log(`COPERTURA PIENA: in tutti e ${CASI.length} i casi — compresi i tre con la scossa\n   accesa e il push-in a 1, che la stesura scorsa non provava — il duello riscrive\n   ogni pixel: sotto non trapela niente.`);
  if (S) {
    if (taglio) { console.log(`IL TAGLIO CAMBIA L'IMMAGINE in ${taglio} casi su ${CASI.length}.`); }
    else console.log(`IL TAGLIO NON CAMBIA UN PIXEL: a parita' di sigillo, ${CASI.length} casi su ${CASI.length} identici.`);
  }
  process.exit(stato);
})();
