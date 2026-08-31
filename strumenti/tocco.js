/* =====================================================================
   TOCCO — IL DITO ARRIVA DOVE VEDE?

   IL PERCHE', e sono due difetti veri nello stesso giorno.

   28 agosto 2026, PAUSA: la quarta voce faceva crescere il pannello oltre
   lo schermo e ABBANDONA finiva col centro a y=433 su uno schermo alto
   412. Il tocco non era consegnabile: chi metteva in pausa non aveva modo
   di uscire dalla partita.
   Stesso giorno, GIOCA: la riga MENTALITA' spingeva la sezione CAMPO
   sotto la barra dei bottoni. Li' il centro era SULLO SCHERMO — y=341 su
   412 — ma sopra c'era la fascia adesiva delle azioni, quindi il dito
   arrivava a lei. Sul telefono si leggeva «CA...» dietro «2 GIOCATORI»:
   una scelta visibile e non selezionabile.

   I due difetti sono la stessa specie e nessun cancello di casa li
   vedeva. collaudo.js apre le schermate e conta i nodi; istantanea.js le
   fotografa e giudica la luce; nessuno CHIEDE AL DOM dove finiscono i
   bersagli. Una schermata puo' essere verde 36 su 36, bella in
   fotografia, e non lasciarsi usare.

   ==================== LE TRE DOMANDE, E PERCHE' TRE ====================

   A. RAGGIUNGIBILE. Esiste una posizione di scorrimento in cui il centro
      del bersaglio sta sullo schermo E il colpo in quel punto arriva a
      lui? Se no, quel comando NON ESISTE per chi ha solo un dito. E' il
      difetto della pausa, ed e' il piu' grave: nessun gesto lo aggira.

   B. A RIPOSO NON MENTE. Appena aperta la schermata (scrollTop 0), ogni
      bersaglio il cui centro e' SULLO SCHERMO deve ricevere il colpo in
      quel punto. Un bersaglio sotto la piega non e' un difetto — la
      sfumatura e la pastiglia col chevron dicono che la lista continua, e
      quello e' il linguaggio dichiarato del gioco per le liste lunghe
      (ISTRUZIONI e' quattro schermate di manuale). Un bersaglio che si
      VEDE e non si tocca invece e' una bugia: e' il difetto di GIOCA, ed
      e' quello che l'occhio non distingue da uno funzionante.

   C. IN FONDO NON MENTE. Scorso tutto (scrollTop massimo), la stessa
      domanda di B. Serve a prendere il caso in cui la fascia adesiva
      copre l'ULTIMA voce per sempre: li' scorrere non e' piu' un rimedio,
      perche' non c'e' piu' niente da scorrere.

   B e C sono la stessa domanda in due posti, e non sono ridondanti: una
   schermata puo' essere pulita a riposo e sporca in fondo (una voce che
   entra sotto la fascia solo dopo lo scorrimento) e viceversa.

   ==================== COSA CONTA COME BERSAGLIO ====================
   button, input, select, textarea, a[href], [role=button], e in piu'
   ogni elemento con cursor:pointer che non abbia GIA' UN BERSAGLIO SOPRA
   DI SE' — le schede dei campi e le caselle del kit sono div, e un
   cancello che guardasse solo i <button> non vedrebbe meta' del negozio.
   La condizione sull'antenato non e' un dettaglio: cursor SI EREDITA, e
   senza di lei ogni <path> dentro l'icona SVG di un bottone diventava un
   bersaglio a se' — misurato, 62 falsi rossi su una taglia sola, tutti
   della forma «path coperto da path». Un cancello che grida sessantadue
   volte a vuoto viene spento il primo giorno.
   Fuori anche il contenuto SVG: li' dentro non c'e' nessun comando, c'e'
   il disegno del comando che sta fuori.
   Fuori: cio' che e' display:none, visibility:hidden, .hidden, o piu'
   piccolo di 2x2 px.

   ==================== LE MISURE, E PERCHE' QUESTE ====================
   Le taglie sono FORME DI APPARECCHI, non una griglia cartesiana. Una
   griglia fitta trova rotture in finestre che nessun apparecchio ha
   (360x412 non e' un telefono: un telefono da 360 in orizzontale e'
   640x360 e in verticale 360x740) e insegna a ignorare il cancello.
   Le undici taglie sono scritte in TAGLIE, ognuna col nome dell'apparecchio
   che rappresenta. Le prime due sono lo stesso telefono di casa letto in
   due modi: vedi la nota dentro TAGLIE, che non e' un dettaglio.

   uso:
     node strumenti/tocco.js
     node strumenti/tocco.js --gioco fuori/campocop.html
     node strumenti/tocco.js --scena gioca          una sola schermata
     node strumenti/tocco.js --taglia 915x412       una sola misura
     node strumenti/tocco.js --tutte                anche le taglie lente
     node strumenti/tocco.js --guasto               il controllo negativo

   CODICI DI USCITA (quelli di casa): 0 verde · 1 il gioco e' rosso ·
   2 il banco e' esploso · 3 la prova e' nulla.
   ===================================================================== */
const http = require('http');
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;

/* ------------------------------ LE TAGLIE ------------------------------
   lento:true = fuori dalla corsa breve. Sono le tre dei tablet: costano un
   caricamento intero a testa e il difetto che cercano si e' sempre visto
   prima su un telefono. --tutte le rimette dentro. */
const TAGLIE = [
  /* LE DUE MISURE DEL TELEFONO DI CASA, e sono diverse.
     Il progetto scrive da sempre «915x412, il telefono in orizzontale che
     il progetto misura». Chiesto all'apparecchio il 28 agosto 2026:
       adb shell wm size     -> Physical size: 1080x2280
       adb shell wm density  -> Physical density: 450   (nessun override)
     Con density-independent pixel = fisico / (dpi/160) e la riga 5 del
     gioco che dichiara «width=device-width, initial-scale=1», la pagina
     vede 2280/2,8125 = 810,7 px di larghezza e 1080/2,8125 = 384 di
     altezza. Cioe' 811x384, non 915x412 — quest'ultima e' la stessa
     misura a 400 dpi.
     Si tengono TUTTE E DUE, e per due ragioni diverse: 811x384 e' cio'
     che il telefono ha davvero sotto il vetro, 915x412 e' il numero
     rispetto a cui e' tarata ogni misura scritta nel progetto (compresa
     quella della PAUSA di stamattina), e cambiarlo di nascosto
     renderebbe incomparabili i referti di ieri. */
  { w: 811, h: 384, n: 'OnePlus 6 coricato — 1080x2280 a 450 dpi, la misura vera' },
  { w: 915, h: 412, n: 'OnePlus 6 coricato a 400 dpi — la misura storica del progetto' },
  { w: 812, h: 375, n: 'telefono medio coricato' },
  { w: 740, h: 360, n: 'telefono piccolo coricato' },
  { w: 640, h: 360, n: '16:9 coricato, il piu\' stretto che si vende' },
  { w: 568, h: 320, n: 'telefono vecchio coricato — la sola taglia sotto i 340 px' },
  { w: 412, h: 915, n: 'OnePlus 6 in piedi' },
  { w: 360, h: 740, n: 'telefono piccolo in piedi' },
  { w: 1024, h: 600, n: 'tablet coricato', lento: true },
  { w: 1280, h: 800, n: 'tablet grande coricato', lento: true },
  { w: 800, h: 1280, n: 'tablet in piedi', lento: true },
];

/* ---------------------------- LE SCHERMATE ----------------------------
   Il percorso e' fatto di CLIC VERI sui bottoni della navigazione, non di
   goScreen(): meta' di queste schermate riempie il proprio contenuto nel
   gestore del bottone che le apre (le schede dei campi, i cartellini del
   negozio, la lista dei trofei), e una schermata aperta di soppiatto
   sarebbe misurata vuota — cioe' senza i bersagli che il difetto colpisce.
   Il clic e' fatto in JS e non col dito APPOSTA: se un bottone di
   navigazione fosse coperto, un dito non arriverebbe e il cancello si
   fermerebbe prima di aver misurato le schermate che stanno dietro. La
   copertura di quel bottone la denuncia comunque la schermata in cui
   vive. */
const SCHERMATE = [
  { id: 'menu',         via: [] },
  { id: 'gioca',        via: ['btnGioca'] },
  { id: 'stagione',     via: ['btnStagione'] },
  { id: 'torneo',       via: ['btnTorneo'] },
  { id: 'spogliatoio',  via: ['btnSpogliatoio'] },
  { id: 'squadra',      via: ['btnSpogliatoio', 'btnSquadra'] },
  { id: 'rosa',         via: ['btnSpogliatoio', 'btnRosa'] },
  { id: 'campi',        via: ['btnSpogliatoio', 'btnCampi'] },
  { id: 'bacheca',      via: ['btnBacheca'] },
  { id: 'trofei',       via: ['btnBacheca', 'btnTrofei'] },
  { id: 'statistiche',  via: ['btnBacheca', 'btnStatsScr'] },
  { id: 'negozio',      via: ['btnNegozio'] },
  { id: 'extra',        via: ['gearBtn'] },
  { id: 'impostazioni', via: ['gearBtn', 'btnImpost'] },
  { id: 'howto',        via: ['gearBtn', 'btnHow'] },
  { id: 'crediti',      via: ['gearBtn', 'btnCrediti'] },
  /* la PAUSA non si raggiunge dal menu: si gioca. E va misurata proprio
     lei, perche' e' il difetto gemello di stamattina — e senza il blocco
     del possesso (che compare da solo dopo POSSESSO_MIN campioni) il
     pannello e' 51 px piu' corto e il difetto NON si vede. */
  { id: 'pausa',        speciale: 'pausa' },
  /* il FISCHIO FINALE: e' la schermata che la gente condivide, ed e' la
     piu' alta del gioco (tabellino a due colonne piu' le monete). */
  { id: 'end',          speciale: 'fine' },
];

/* Il ROVISTATORE, che gira dentro la pagina. Sta in una stringa sola
   perche' e' passata a page.evaluate: se fosse spezzata in funzioni di
   Node non arriverebbe di la'. */
const ROVISTA = function (idScena) {
  const el = document.getElementById(idScena);
  if (!el) return { manca: true };
  const vh = innerHeight, vw = innerWidth;
  const SEL = 'button,input,select,textarea,a[href],[role="button"]';
  const cand = new Set();
  for (const b of el.querySelectorAll(SEL)) cand.add(b);
  for (const b of el.querySelectorAll('*')) {
    if (b.namespaceURI !== 'http://www.w3.org/1999/xhtml') continue;   /* dentro l'SVG c'e' il disegno, non il comando */
    if (b.closest('svg')) continue;
    if (getComputedStyle(b).cursor !== 'pointer') continue;
    /* cursor si eredita: conta solo chi non ha gia' un bersaglio sopra */
    let sopra = false;
    for (let p = b.parentElement; p && p !== el; p = p.parentElement) {
      if (p.matches(SEL) || getComputedStyle(p).cursor === 'pointer') { sopra = true; break; }
    }
    if (!sopra) cand.add(b);
  }
  const vivi = [];
  for (const b of cand) {
    if (b.closest('.hidden')) continue;
    const st = getComputedStyle(b);
    if (st.display === 'none' || st.visibility === 'hidden' || +st.opacity === 0) continue;
    const q = b.getBoundingClientRect();
    if (q.width < 2 || q.height < 2) continue;
    vivi.push(b);
  }
  /* il nome si legge da getAttribute('class') e non da .className: sugli
     elementi SVG className e' un SVGAnimatedString, e stampava
     «.[object.SVGAnimatedString]» al posto della classe */
  const cls = n => (n && n.getAttribute && n.getAttribute('class')) ? String(n.getAttribute('class')).trim().split(/\s+/) : [];
  const nome = b => (b.id ? '#' + b.id
    : (b.tagName.toLowerCase() + (cls(b).length ? '.' + cls(b).join('.') : ''))) +
    (b.textContent && b.textContent.trim() ? ' «' + b.textContent.trim().replace(/\s+/g, ' ').slice(0, 22) + '»' : '');
  const misura = b => {
    const q = b.getBoundingClientRect();
    const cx = q.left + q.width / 2, cy = q.top + q.height / 2;
    const dentro = cy > 0 && cy < vh && cx > 0 && cx < vw;
    /* elementFromPoint fuori dal riquadro torna null: si chiede solo
       dentro, se no «coperto da niente» direbbe una cosa falsa.
       E IL PUNTO SI ARROTONDA DENTRO IL VETRO, non a caso: a 811x384 —
       la misura vera del telefono di casa — il centro di ABBANDONA cade
       a y=383,5, che e' DENTRO uno schermo alto 384; Math.round lo
       portava a 384, cioe' un pixel oltre l'ultima riga, elementFromPoint
       tornava null e il cancello scriveva «il colpo va a niente» su un
       bottone che il dito prende benissimo. Un mezzo pixel di
       arrotondamento non e' un difetto del gioco, ed e' esattamente il
       tipo di falso rosso che fa spegnere un cancello. */
    const px = Math.min(vw - 1, Math.max(0, Math.round(cx)));
    const py = Math.min(vh - 1, Math.max(0, Math.round(cy)));
    const sopra = dentro ? document.elementFromPoint(px, py) : null;
    /* IL COLPO ARRIVA SOLO SE elementFromPoint TORNA IL BERSAGLIO O UN SUO
       DISCENDENTE. Un <small> dentro il bottone va bene: l'evento nasce
       li' e RISALE fino al bottone, che e' chi ascolta.
       UN ANTENATO NO, e questa riga e' costata il controllo negativo:
       nella prima stesura valeva anche «sopra.contains(b)», e col
       sabotaggio addosso il cancello restava verde. Il motivo e' che una
       lastra fatta con ::after non e' un elemento suo — elementFromPoint
       restituisce l'elemento che LA GENERA, cioe' il contenitore, che e'
       antenato del bottone. Ma se e' il contenitore a ricevere il colpo,
       l'evento parte da lui e RISALE: al bottone, che sta piu' in basso,
       non arriva mai. Un antenato sopra il bersaglio e' copertura. */
    const suo = sopra && (sopra === b || b.contains(sopra));
    return {
      t: Math.round(q.top), b: Math.round(q.bottom), cx: Math.round(cx), cy: Math.round(cy),
      dentro, colpito: !!(dentro && suo),
      chi: dentro ? (sopra ? (sopra.id ? '#' + sopra.id : (cls(sopra).length ? '.' + cls(sopra)[0] : sopra.tagName)) : 'niente') : '-',
    };
  };
  const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
  const partenza = el.scrollTop;

  /* B — a riposo */
  el.scrollTop = 0;
  const aRiposo = vivi.map(b => ({ nome: nome(b), m: misura(b) }));
  /* C — in fondo */
  el.scrollTop = maxScroll;
  const inFondo = vivi.map(b => ({ nome: nome(b), m: misura(b) }));
  /* A — raggiungibile: si prova ogni gradino di scorrimento, e ci si
     ferma al primo che consegna il colpo */
  const passi = [];
  for (let k = 0; k <= 16; k++) passi.push(Math.round(maxScroll * k / 16));
  const raggiungibili = vivi.map(b => {
    for (const s of passi) { el.scrollTop = s; const m = misura(b); if (m.colpito) return { nome: nome(b), ok: true, a: s }; }
    el.scrollTop = 0;
    return { nome: nome(b), ok: false, m: misura(b) };
  });
  el.scrollTop = partenza;
  return { bersagli: vivi.length, vh, sh: el.scrollHeight, ch: el.clientHeight, aRiposo, inFondo, raggiungibili };
};

function servi(prova) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (prova && /CALCETTO-il-gioco\.html$/i.test(f)) f = prova;
      if ((!f.startsWith(RADICE) && f !== prova) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* IL CONTROLLO NEGATIVO. Un cancello che non sa fallire non e' un
   cancello.
   Il sabotaggio NON si mette su GIOCA — li' un difetto c'e' stato per
   davvero, e un controllo negativo che si accende anche sul gioco sano
   non dimostra niente. Si mette su SPOGLIATOIO, che e' verde su tutte e
   nove le taglie: una lastra trasparente sopra le sue tre voci. Le tre
   voci restano visibili e perdono il tocco — che e' esattamente la forma
   del difetto di oggi. Se il cancello resta verde con questa addosso,
   non sta guardando niente. */
const GUASTO = `#spogliatoio .box{position:relative}
#spogliatoio .box::after{content:"";position:absolute;left:0;right:0;top:20%;height:60%;background:transparent;z-index:9}`;

(async () => {
  let chromium;
  try { ({ chromium } = require('playwright')); }
  catch (e) { console.error('BANCO: playwright non e\' installato: ' + e.message); process.exit(2); }

  const prova = arg('gioco', process.env.GIOCO_PROVA || '');
  const provaAbs = prova ? path.resolve(prova) : '';
  if (provaAbs && !fs.existsSync(provaAbs)) { console.error('PROVA NULLA: non esiste ' + provaAbs); process.exit(3); }
  const soloScena = arg('scena', '');
  const soloTaglia = arg('taglia', '');
  const tutte = haFlag('tutte');
  const guasto = haFlag('guasto');

  let taglie = TAGLIE.filter(t => tutte || !t.lento);
  if (soloTaglia) {
    taglie = TAGLIE.filter(t => (t.w + 'x' + t.h) === soloTaglia);
    if (!taglie.length) { console.error('PROVA NULLA: taglia sconosciuta ' + soloTaglia + '. Ci sono: ' + TAGLIE.map(t => t.w + 'x' + t.h).join(' ')); process.exit(3); }
  }
  const scene = soloScena ? SCHERMATE.filter(s => s.id === soloScena) : SCHERMATE;
  if (!scene.length) { console.error('PROVA NULLA: schermata sconosciuta ' + soloScena); process.exit(3); }

  const srv = await servi(provaAbs);
  let browser;
  try { browser = await chromium.launch(); }
  catch (e) { srv.chiudi(); console.error('BANCO: il browser non parte: ' + e.message); process.exit(2); }

  console.log('\n=== TOCCO — il dito arriva dove vede? ===');
  console.log('    ' + (provaAbs || path.join(RADICE, 'CALCETTO-il-gioco.html')));
  console.log('    ' + taglie.length + ' taglie x ' + scene.length + ' schermate' + (guasto ? '   [--guasto: il cancello DEVE uscire rosso]' : ''));

  const rossi = [];      /* A: irraggiungibili */
  const bugie = [];      /* B e C: si vede e non si tocca */
  const esplosi = [];
  const nonPertinenti = [];
  let misurati = 0, scenePassate = 0;

  for (const T of taglie) {
    const ctx = await browser.newContext({ viewport: { width: T.w, height: T.h }, hasTouch: true, isMobile: true });
    const pag = await ctx.newPage();
    const ecc = []; pag.on('pageerror', e => ecc.push(e.message));
    try {
      await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
      await pag.waitForFunction('window.__test !== undefined', null, { timeout: 25000 });
    } catch (e) { esplosi.push(T.w + 'x' + T.h + ': la pagina non si e\' caricata (' + e.message.slice(0, 60) + ')'); await ctx.close(); continue; }
    await pag.evaluate(() => { const t = window.__test; if (t.dismissSplash) t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
    if (guasto) await pag.evaluate(c => { const s = document.createElement('style'); s.textContent = c; document.head.appendChild(s); }, GUASTO);

    console.log('\n  ' + (T.w + 'x' + T.h).padEnd(9) + T.n);
    for (const S of scene) {
      /* IN VERTICALE LA PARTITA NON SI GIOCA, E NON E' UN DIFETTO.
         checkOrientation() alza l'overlay #ruota su tutto lo schermo
         appena la scena e' di gioco e l'apparecchio e' in piedi, e tiene
         fermo il cronometro (G.rotateHold). PAUSA e FISCHIO FINALE quindi
         non esistono in verticale: senza questa riga il cancello
         dichiarava dodici comandi «coperti da #ruota», cioe' accusava il
         gioco di aver nascosto una schermata che ha deciso di non
         mostrare. Non si contano ne' verdi ne' rossi: si dicono. */
      if (S.speciale && T.h > T.w) {
        nonPertinenti.push(T.w + 'x' + T.h + ' / ' + S.id);
        console.log('    -- ' + S.id.padEnd(13) + 'non pertinente: in verticale il gioco chiede di ruotare (#ruota) e la partita non parte');
        continue;
      }
      let pronto = true;
      try {
        /* LA PAUSA SI CHIUDE DAVVERO PRIMA DELLA SCENA DOPO, e non e' una
           precauzione: startMatch() rimette G.paused a false ma NON
           nasconde l'overlay #pausa, che e' position:fixed inset:0 —
           misurato, il FISCHIO FINALE risultava con i due bottoni
           «coperti da SMALL», e quel SMALL era la voce di una pausa
           rimasta appesa sopra. Un cancello che accusa il gioco di un
           difetto del proprio banco e' peggio di nessun cancello. */
        await pag.evaluate(() => {
          if (typeof G !== 'undefined' && G.paused && typeof setPaused === 'function') setPaused(false);
          for (const id of ['pausa', 'end', 'duel']) { const e = document.getElementById(id); if (e) e.classList.add('hidden'); }
        });
        if (S.speciale === 'pausa') {
          await pag.evaluate(() => { window.__test.startMatch(1, 1, { size: 5 }); });
          /* si GIOCA finche' il blocco del possesso non compare da solo:
             e' la riga che fa crescere il pannello, e senza di lei il
             difetto della pausa non si vede (vedi _crit3-abbandona.js) */
          for (let g = 0; g < 60; g++) {
            await pag.waitForTimeout(500);
            const c = await pag.evaluate(() => (typeof G !== 'undefined' && G.stats && G.stats.possesso) ? (G.stats.possesso[0] | 0) + (G.stats.possesso[1] | 0) : -1);
            if (c >= 180) break;
          }
          await pag.keyboard.press('Escape');
          await pag.waitForTimeout(350);
        } else if (S.speciale === 'fine') {
          await pag.evaluate(() => { window.__test.startMatch(1, 1, { size: 5 }); });
          await pag.waitForTimeout(400);
          await pag.evaluate(() => { window.__test.forceGoal(0); });
          await pag.waitForTimeout(300);
          await pag.evaluate(() => { window.__test.setTimeLeft(0.05); });
          await pag.waitForFunction("document.getElementById('end') && !document.getElementById('end').classList.contains('hidden')", null, { timeout: 20000 });
          await pag.waitForTimeout(500);
        } else {
          /* si torna sempre al menu prima di ripartire: le schermate di
             secondo livello si aprono solo dalla loro madre */
          await pag.evaluate(() => { if (typeof goScreen === 'function') goScreen(document.getElementById('menu')); });
          await pag.waitForTimeout(60);
          for (const b of S.via) {
            await pag.evaluate(id => { const e = document.getElementById(id); if (e) e.click(); }, b);
            await pag.waitForTimeout(140);
          }
          await pag.waitForTimeout(120);
          const visibile = await pag.evaluate(id => { const e = document.getElementById(id); return !!e && !e.classList.contains('hidden'); }, S.id);
          if (!visibile) { pronto = false; esplosi.push(T.w + 'x' + T.h + ' / ' + S.id + ': la schermata non si e\' aperta dal suo percorso'); }
        }
      } catch (e) { pronto = false; esplosi.push(T.w + 'x' + T.h + ' / ' + S.id + ': ' + e.message.slice(0, 70)); }
      if (!pronto) continue;

      const r = await pag.evaluate(new Function('id', 'return (' + ROVISTA.toString() + ')(id)'), S.id);
      if (r.manca) { esplosi.push(T.w + 'x' + T.h + ' / ' + S.id + ': l\'elemento non esiste'); continue; }
      misurati += r.bersagli;

      const irr = r.raggiungibili.filter(x => !x.ok);
      const bugiaR = r.aRiposo.filter(x => x.m.dentro && !x.m.colpito);
      const bugiaF = r.inFondo.filter(x => x.m.dentro && !x.m.colpito);
      const male = irr.length + bugiaR.length + bugiaF.length;
      if (!male) scenePassate++;
      console.log('    ' + (male ? 'NO ' : 'ok ') + S.id.padEnd(13) + String(r.bersagli).padStart(3) + ' bersagli   ' +
        (r.sh > r.ch ? 'scorre ' + (r.sh - r.ch) + ' px' : 'non scorre'));
      for (const x of irr) {
        rossi.push({ t: T.w + 'x' + T.h, s: S.id, x });
        console.log('       ROSSO A  ' + x.nome + '  irraggiungibile: nel migliore scorrimento il centro sta a y=' + x.m.cy +
          (x.m.dentro ? ' e il colpo va a ' + x.m.chi : ' — fuori dallo schermo alto ' + r.vh));
      }
      for (const x of bugiaR) {
        bugie.push({ t: T.w + 'x' + T.h, s: S.id, dove: 'a riposo', x });
        console.log('       ROSSO B  ' + x.nome + '  a riposo si VEDE (y ' + x.m.t + '..' + x.m.b + ', centro ' + x.m.cy + ' su ' + r.vh + ') ma il colpo va a ' + x.m.chi);
      }
      for (const x of bugiaF) {
        bugie.push({ t: T.w + 'x' + T.h, s: S.id, dove: 'in fondo', x });
        console.log('       ROSSO C  ' + x.nome + '  scorso tutto si VEDE (centro ' + x.m.cy + ' su ' + r.vh + ') ma il colpo va a ' + x.m.chi);
      }
    }
    if (ecc.length) esplosi.push(T.w + 'x' + T.h + ': eccezione nella pagina — ' + ecc[0].slice(0, 80));
    await ctx.close();
  }
  await browser.close(); srv.chiudi();

  /* -------------------------------- il verdetto ------------------------ */
  const totScene = taglie.length * scene.length - nonPertinenti.length;
  console.log('\n  ' + misurati + ' bersagli misurati su ' + totScene + ' schermate-taglia, ' + scenePassate + ' passate' +
    (nonPertinenti.length ? '   (' + nonPertinenti.length + ' non pertinenti: partita in verticale)' : ''));
  console.log('  A irraggiungibili: ' + rossi.length + '   ·   B/C si-vede-e-non-si-tocca: ' + bugie.length);

  if (esplosi.length) {
    console.log('\n  IL BANCO NON HA MISURATO TUTTO:');
    for (const e of esplosi.slice(0, 10)) console.log('    ' + e);
    if (esplosi.length > 10) console.log('    ... e altri ' + (esplosi.length - 10));
  }

  if (guasto) {
    /* il controllo negativo si giudica al contrario: col sabotaggio
       addosso il cancello DEVE gridare, se no non sta guardando niente */
    const visto = rossi.length + bugie.length;
    console.log('\n  CONTROLLO NEGATIVO: sabotaggio addosso, guai visti ' + visto);
    if (!visto) { console.log('  NO: il cancello e\' cieco — col sabotaggio addosso e\' rimasto verde.'); process.exit(1); }
    console.log('  OK: il cancello sa fallire.');
    process.exit(0);
  }

  if (esplosi.length && !rossi.length && !bugie.length) {
    console.log('\n  PROVA NULLA: nessun guaio visto, ma ' + esplosi.length + ' schermate-taglia non sono state misurate.');
    process.exit(3);
  }
  if (rossi.length || bugie.length) {
    console.log('\n  ROSSO: ' + (rossi.length ? rossi.length + ' comand' + (rossi.length > 1 ? 'i' : 'o') + ' che il dito non puo\' raggiungere in nessun modo. ' : '') +
      (bugie.length ? bugie.length + (bugie.length > 1 ? ' bersagli che si vedono e non si toccano.' : ' bersaglio che si vede e non si tocca.') : ''));
    process.exit(1);
  }
  console.log('\n  VERDE: su tutte le schermate e tutte le taglie il dito arriva dove vede.');
  process.exit(0);
})().catch(e => { console.error('BANCO: ' + (e && e.stack ? e.stack : e)); process.exit(2); });
