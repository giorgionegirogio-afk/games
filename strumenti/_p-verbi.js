/* =====================================================================
   _p-verbi.js — I SEI VERBI ESISTONO ANCORA? Uno per uno, col dito.

   PERCHE'. La toppa del rilascio (strumenti/_t-rilascio.js) spegne
   quattro gesti che nascevano dal dito che si stacca dalla levetta:
   tiro-col-flick, scivolata-col-flick, cross-col-flick e passaggio-al-
   rilascio. La frase che accompagna quella toppa e' «nessun verbo
   perso: sono tutti sui due pulsanti». Una frase cosi', scritta e non
   misurata, e' esattamente il modo in cui si perde una funzione senza
   accorgersene — e poi la ritrova un giocatore, tre settimane dopo.

   Qui i sei verbi si provano UNO PER UNO con eventi touch veri, e
   ciascuno pretende la sua PROVA DI STATO dentro il gioco, non
   l'impressione che sia successo qualcosa:

     TIRA        pulsante grande col possesso, tenuto 600 ms
                 -> il contatore dei tiri sale
     PASSAGGIO   pulsante piccolo col possesso, levetta ferma al centro
                 -> la palla parte e ha un ricevitore designato
     FILTRANTE   pulsante piccolo col possesso, levetta PUNTATA su un
                 compagno -> il contatore delle filtranti sale
     CROSS       pulsante piccolo col possesso, levetta oltre la soglia
                 dello scatto (66 px), dalla meta' campo offensiva
                 -> il contatore dei cross sale e la palla prende quota
     CONTRASTA   pulsante grande SENZA possesso, vicino al portatore
                 -> sul comandato si accende p.slide
     CAMBIO      pulsante piccolo SENZA possesso
                 -> G.ctrl[0] cambia indice

   Il dito e' di protocollo (Input.dispatchTouchEvent): nessuna funzione
   del gioco viene chiamata per agire. Lo stato si prepara con gli hook
   __test, come fa strumenti/giocata.js.

   uso:
     node strumenti/_p-verbi.js
     node strumenti/_p-verbi.js --gioco fuori/dopo.html --etichetta DOPO
     node strumenti/_p-verbi.js --giri 5
   Esce con 1 se anche un solo verbo non risponde.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png' };
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const attesa = ms => new Promise(r => setTimeout(r, ms));
const GIRI = +arg('giri', 5);
const ETICHETTA = arg('etichetta', '');
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'CALCETTO-il-gioco.html')));

function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (/CALCETTO-il-gioco\.html$/i.test(f)) f = GIOCO;
      if ((!f.startsWith(RADICE) && f !== GIOCO) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
const dito = {
  giu: (cdp, p) => cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: p }),
  muovi: (cdp, p) => cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: p }),
  su: (cdp, p) => cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: p || [] }),
};

/* prepara e restituisce tutto quello che serve al gesto: dove sono i
   pulsanti, dov'e' il compagno da mirare, i contatori di partenza */
function prepara(o) {
  const t = window.__test, G = t.G;
  t.setPaused && t.setPaused(false);
  try { if (t.Tut && t.Tut.active && t.Tut.finish) t.Tut.finish(true); } catch (e) { }
  for (let giro = 0; giro < 3 && G.scene !== 'play'; giro++) {
    for (let i = 0; i < 200 && G.scene !== 'play'; i++) t.simulate(0.1);
    if (G.scene !== 'play') { t.startMatch(1, 1, { size: 5 }); for (let i = 0; i < 80 && G.scene !== 'play'; i++) t.simulate(0.1); }
  }
  if (G.scene !== 'play') return { errore: "scena '" + G.scene + "'" };
  t.setTimeLeft && t.setTimeLeft(80);
  const pi = G.ctrl[0]; if (pi < 0) return { errore: 'nessun comandato' };
  const p = G.players[pi], c = t.campo, b = G.ball;
  if (p.charge >= 0) { p.charge = -1; p.chargeKind = 'tiro'; p.chargeT = 0; p.chargeGo = null; p.chargeClip = null; }
  p.slide = -1; p.recover = 0; p.rove = -1;
  for (const q of G.players) { q.vx = 0; q.vy = 0; }
  b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0; b.curve = 0; b.passTo = -1;
  /* il comandato va dove serve al verbo: il cross vuole la meta' campo
     offensiva, gli altri stanno bene al centro */
  p.x = o.offensiva ? c.FW * 0.68 : c.FW * 0.5;
  p.y = o.offensiva ? c.FH * 0.26 : c.FH * 0.5;
  /* UN COMPAGNO IN UNA POSIZIONE NOTA: la filtrante pretende un bersaglio
     con dot>0,5 nella direzione chiesta, quindi la direzione deve
     esistere e va restituita a chi muove il dito. */
  let amico = null;
  for (const q of G.players) { if (q.team === 0 && q !== p && q.role !== 'gk' && q.out <= 0) { amico = q; break; } }
  if (!amico) return { errore: 'nessun compagno di movimento' };
  amico.x = p.x + (o.offensiva ? 40 : 150); amico.y = p.y + (o.offensiva ? 90 : 0);
  let avv = -1;
  if (o.portatore) {
    let dm = 1e9;
    for (let i = 0; i < G.players.length; i++) { const q = G.players[i]; if (q.team !== 1 || q.out > 0 || q.role === 'gk') continue; const d = Math.hypot(q.x - p.x, q.y - p.y); if (d < dm) { dm = d; avv = i; } }
    if (avv < 0) return { errore: 'nessun avversario di movimento' };
    const q = G.players[avv];
    q.x = p.x + 84; q.y = p.y;
    b.owner = avv; b.x = q.x + 8; b.y = q.y;
  } else if (o.possesso) { b.owner = pi; b.x = p.x + 8; b.y = p.y; }
  else { b.owner = -1; b.x = p.x + 40; b.y = p.y; }
  for (let i = 0; i < G.players.length; i++) {
    const q = G.players[i];
    if (q.team === 0 || i === avv) continue;
    const d = Math.hypot(q.x - b.x, q.y - b.y);
    if (d < 200) { const l = Math.max(1, d); q.x = b.x + (q.x - b.x) / l * 260; q.y = b.y + (q.y - b.y) / l * 260; }
  }
  const bt = t.pulsanti(0);
  const grande = bt.reduce((a, x) => (x.r || 0) > (a.r || 0) ? x : a, bt[0]);
  const piccolo = bt.find(x => x !== grande) || grande;
  const v = t.view;
  const sx = w => v.Ax + w * v.S2;
  const sy = (w, z) => v.Ay + (w - (z || 0)) * v.S2;   // basta l'ordine di grandezza: serve la DIREZIONE
  return {
    grande: { x: grande.x, y: grande.y, label: grande.label },
    piccolo: { x: piccolo.x, y: piccolo.y, label: piccolo.label },
    /* la direzione schermo verso il compagno: la levetta si punta cosi' */
    dirx: sx(amico.x) - sx(p.x), diry: sy(amico.y) - sy(p.y),
    ctrl: pi,
    st: { tiri: G.stats.tiri[0] | 0, filtranti: (G.stats.filtranti || [0])[0] | 0, cross: (G.stats.cross || [0])[0] | 0 },
  };
}
function leggi(pi0) {
  const t = window.__test, G = t.G, b = G.ball;
  const p = G.ctrl[0] >= 0 ? G.players[G.ctrl[0]] : null;
  const v = pi0 >= 0 ? G.players[pi0] : null;
  return {
    tiri: G.stats.tiri[0] | 0, filtranti: (G.stats.filtranti || [0])[0] | 0, cross: (G.stats.cross || [0])[0] | 0,
    passTo: b.passTo, sp: Math.hypot(b.vx, b.vy), z: b.z, zmax: b.z,
    ctrl: G.ctrl[0], slide: v ? v.slide : -9, recover: v ? v.recover : 0, own: b.owner,
    /* IL PALLONE E' ARRIVATO A UN COMPAGNO? A 410 ms dal gesto un
       passaggio corto E' GIA' STATO RICEVUTO: passTo torna a -1 e la
       velocita' crolla, e un banco che guardasse solo quelli due
       direbbe "non e' partito niente" proprio quando e' andato tutto
       bene. Il segno che resta e' il possesso passato di mano fra due
       compagni. */
    ricevuto: (b.owner >= 0 && G.players[b.owner].team === 0 && b.owner !== pi0),
  };
}

(async () => {
  const srv = await servi();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(seme => { let s = seme >>> 0 || 1; const pr = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; }; Math.random = () => pr() / 4294967296; }, 20260819);
  const errori = [];
  pag.on('pageerror', e => errori.push('ECCEZIONE: ' + e.message));
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.__test.dismissSplash && window.__test.dismissSplash(); window.__test.startMatch(1, 1, { size: 5 }); });
  await pag.waitForTimeout(600);
  const cdp = await ctx.newCDPSession(pag);

  const VW = 915, VH = 412;
  const CASA = { x: Math.round(VW * 0.18), y: Math.round(VH * 0.66) };

  console.log('=== I SEI VERBI, uno per uno, col dito ===\n');
  console.log('gioco: ' + GIOCO + (ETICHETTA ? '   [' + ETICHETTA + ']' : ''));
  console.log('giri per verbo: ' + GIRI + '\n');

  /* la levetta si tiene giu' a una certa spinta: e' cosi' che si mira e
     cosi' che si scatta (oltre 66 px). null = niente levetta. */
  async function conLevetta(spinta, dirx, diry) {
    if (spinta <= 0) return false;
    const l = Math.max(1, Math.hypot(dirx, diry));
    const ux = dirx / l, uy = diry / l;
    await dito.giu(cdp, [{ x: CASA.x, y: CASA.y, id: 1 }]);
    const passi = 8;
    for (let k = 1; k <= passi; k++) {
      await dito.muovi(cdp, [{ x: CASA.x + ux * spinta * k / passi, y: CASA.y + uy * spinta * k / passi, id: 1 }]);
      await attesa(16);
    }
    return true;
  }

  /* ---------------------------------------------------------------------
     LA SOGLIA PER VERBO, e perche' «almeno una volta» non e' un cancello.

     La prima stesura dichiarava un verbo vivo con `ok > 0`: bastava che
     rispondesse UNA volta su dieci. Un banco che accetta 1/10 non puo'
     reggere la copertura che gli si affida — dice «il verbo c'e'» mentre
     nove dita su dieci non producono niente, che dal punto di vista di chi
     gioca vuol dire che il comando NON c'e'.

     Le soglie non sono tutte uguali, e ognuna ha il suo perche' scritto
     accanto, perche' una soglia senza motivo e' un numero tondo travestito
     da misura:

       TIRA, FILTRANTE, CROSS, CAMBIO -> GIRI su GIRI, cioe' tutte.
         Sono deterministici: premi il pulsante, il contatore sale. Se
         falliscono anche una volta sola c'e' un difetto, non rumore.

       PASSAGGIO -> il 70%. Non e' deterministico per costruzione: il
         gioco sceglie il destinatario con `smarcato()`, e se in
         quell'istante nessun compagno supera la soglia di apertura il
         passaggio non parte. E' una decisione del gioco, non un comando
         perso. Il 70% e' il pavimento sotto cui la scelta smette di essere
         una decisione e diventa un guasto.

       CONTRASTA -> il 60%. Il piu' basso di tutti, e il motivo e' fisico:
         il contrasto richiede che un avversario sia a portata NELL'ISTANTE
         del tocco. Il banco mette il dito, non muove il mondo: in parte
         delle prove l'avversario semplicemente non c'e'.

       ZERO-DITA -> 1 su 1: e' un si/no, non un conteggio.
     --------------------------------------------------------------------- */
  const SOGLIA = {
    TIRA: g => g, FILTRANTE: g => g, CROSS: g => g, CAMBIO: g => g,
    PASSAGGIO: g => Math.ceil(g * 0.70),
    CONTRASTA: g => Math.ceil(g * 0.60),
    SCIVOLATA: g => Math.ceil(g * 0.60),
    'ZERO-DITA': () => 1,
  };
  const soglia = nome => (SOGLIA[nome] || (g => Math.ceil(g * 0.70)))(GIRI);

  const VERBI = {
    TIRA: { prep: { possesso: true }, spinta: 0, quale: 'grande', tieni: 600,
      prova: (a, b) => b.tiri > a.tiri, dice: 'il contatore dei tiri sale' },
    PASSAGGIO: { prep: { possesso: true }, spinta: 0, quale: 'piccolo', tieni: 70,
      prova: (a, b) => b.passTo >= 0 || b.sp > 60 || b.ricevuto, dice: 'la palla parte verso un compagno (o gli e\' gia\' arrivata)' },
    FILTRANTE: { prep: { possesso: true }, spinta: 40, quale: 'piccolo', tieni: 70,
      prova: (a, b) => b.filtranti > a.filtranti, dice: 'il contatore delle filtranti sale' },
    CROSS: { prep: { possesso: true, offensiva: true }, spinta: 78, quale: 'piccolo', tieni: 70,
      prova: (a, b) => b.cross > a.cross, dice: 'il contatore dei cross sale' },
    /* LA SCIVOLATA E' GIA' FINITA QUANDO LA GUARDO, e la prima stesura di
       questo banco l'ha dichiarata «verbo perso» per questo — su tutt'e
       due i file, prima e dopo, che e' il segno che il difetto era del
       banco. SLIDE_T dura 0,20 s e l'anticipo 0,06: a 410 ms dalla
       pressione p.slide e' gia' tornato a -1. Quello che RESTA e'
       p.recover (SLIDE_REC = 0,45 s), che esiste solo dopo una
       scivolata: e' quello il segno che il gesto e' avvenuto. */
    CONTRASTA: { prep: { portatore: true }, spinta: 0, quale: 'grande', tieni: 70,
      prova: (a, b) => b.slide >= 0 || b.recover > 0, dice: 'sul comandato si accende la scivolata (o il suo recupero)' },
    CAMBIO: { prep: {}, spinta: 0, quale: 'piccolo', tieni: 70,
      prova: (a, b, pi0) => b.ctrl !== pi0, dice: 'il comando passa a un altro uomo' },
  };

  const esiti = [];
  for (const [nome, V] of Object.entries(VERBI)) {
    let ok = 0; let etichetta = '?';
    for (let g = 0; g < GIRI; g++) {
      const q = await pag.evaluate(prepara, V.prep);
      if (q.errore) { console.error('FALLITO: preparazione — ' + q.errore); process.exit(1); }
      const bott = V.quale === 'grande' ? q.grande : q.piccolo;
      etichetta = bott.label;
      const conLev = await conLevetta(V.spinta, q.dirx, q.diry);
      const prima = await pag.evaluate(leggi, q.ctrl);
      const punti = conLev
        ? [{ x: CASA.x + q.dirx / Math.max(1, Math.hypot(q.dirx, q.diry)) * V.spinta, y: CASA.y + q.diry / Math.max(1, Math.hypot(q.dirx, q.diry)) * V.spinta, id: 1 }, { x: bott.x, y: bott.y, id: 2 }]
        : [{ x: bott.x, y: bott.y, id: 2 }];
      await dito.giu(cdp, punti);
      await attesa(V.tieni);
      await dito.su(cdp, conLev ? [punti[0]] : []);
      await attesa(340);
      const dopo = await pag.evaluate(leggi, q.ctrl);
      if (V.prova(prima, dopo, q.ctrl)) ok++;
      if (conLev) { try { await dito.su(cdp, []); } catch (e) { } }
      await attesa(120);
    }
    const S = soglia(nome);
    esiti.push({ nome, ok, soglia: S, etichetta });
    console.log('  ' + (ok >= S ? 'OK  ' : 'NO  ') + nome.padEnd(11) + ' ' + String(ok) + '/' + GIRI +
      ' (serve ' + S + ')   (pulsante ' + V.quale + ', etichetta «' + etichetta + '»; prova: ' + V.dice + ')');
  }

  /* ===================================================================
     E LA COSA CHE NON E' UN VERBO: LO STATO A ZERO DITA.
     Quando l'app va in secondo piano o la finestra perde il fuoco, il
     touchend NON ARRIVA MAI. La levetta resta attiva con l'ultimo dx,dy
     addosso e al ritorno il giocatore parte da solo nella direzione di
     prima: e' il difetto (c), e non si vede in nessuna delle prove qui
     sopra perche' li' il dito si alza sempre.
     Qui si trascina, si tiene giu', e si manda alla pagina il segnale
     che il sistema manderebbe — blur e visibilitychange — SENZA nessun
     touchend. Poi si guarda se il giocatore continua a correre.
     DICHIARATO: i due eventi sono sintetici (dispatchEvent). Provano
     che il gestore e' agganciato e fa la cosa giusta; non provano che
     Android li mandi. Quella parte va guardata sul telefono. */
  console.log('\n=== ZERO DITA: la finestra perde il fuoco mentre la levetta e\' premuta ===');
  {
    const q = await pag.evaluate(prepara, { possesso: true });
    if (q.errore) { console.error('FALLITO: ' + q.errore); process.exit(1); }
    await conLevetta(50, 1, 0);                 // trascina a destra e TIENE
    await attesa(200);
    const a0 = await pag.evaluate(() => { const G = window.__test.G; const p = G.players[G.ctrl[0]]; return { x: p.x, y: p.y }; });
    await pag.evaluate(() => {
      window.dispatchEvent(new Event('blur'));
      try { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); } catch (e) { }
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await attesa(700);                          // sette decimi di secondo di nessuno che comanda
    /* LA DOMANDA VERA NON E' «SI E' MOSSO», E' «LA LEVETTA COMANDA
       ANCORA». Il gioco mette gia' in pausa quando la scheda si
       nasconde, e in pausa nessuno si muove: guardare solo la corsa
       misurerebbe la pausa, non la levetta, e direbbe verde su tutt'e
       due i file. humanMove(0) e' la funzione che il gioco stesso legge
       ogni fotogramma per sapere dove va il giocatore comandato:
       chiederglielo e' leggere l'input, non simularlo. A dita alzate
       deve tornare [0,0]. */
    const a1 = await pag.evaluate(() => {
      const G = window.__test.G; const p = G.players[G.ctrl[0]];
      let mv = [null, null]; try { mv = window.humanMove(0); } catch (e) { }
      return { x: p.x, y: p.y, charge: p.charge, paused: !!G.paused, mv: [mv[0], mv[1]] };
    });
    /* si toglie il dito e si rimette la pagina in chiaro per non lasciare
       il banco in uno stato strano */
    try { await dito.su(cdp, []); } catch (e) { }
    await pag.evaluate(() => { try { Object.defineProperty(document, 'hidden', { value: false, configurable: true }); } catch (e) { } document.dispatchEvent(new Event('visibilitychange')); window.__test.setPaused(false); });
    const corsa = Math.hypot(a1.x - a0.x, a1.y - a0.y);
    const spinta = Math.hypot(a1.mv[0] || 0, a1.mv[1] || 0);
    console.log('  humanMove(0), cioe\' il comando che il gioco legge ogni fotogramma: ['
      + (a1.mv[0] === null ? '?' : a1.mv[0].toFixed(3)) + ', ' + (a1.mv[1] === null ? '?' : a1.mv[1].toFixed(3)) + ']');
    console.log('  il comandato ha percorso ' + corsa.toFixed(1) + ' unita\' nei 700 ms  ·  in pausa: '
      + (a1.paused ? 'si' : 'no') + '  ·  carica aperta: ' + (a1.charge >= 0 ? 'SI' : 'no'));
    const neutro = spinta < 0.001 && corsa < 12 && a1.charge < 0;
    console.log('  ' + (neutro ? 'OK  ' : 'NO  ') + 'a zero dita lo stato e\' NEUTRO: la levetta non comanda piu\' niente'
      + (neutro ? '' : '\n       la levetta e\' rimasta premuta (spinta ' + spinta.toFixed(3) + '): al ritorno il giocatore riparte da solo'));
    esiti.push({ nome: 'ZERO-DITA', ok: neutro ? 1 : 0, soglia: 1, etichetta: 'spinta ' + spinta.toFixed(3) });
  }

  await browser.close(); srv.chiudi();
  /* PERSO VUOL DIRE SOTTO LA SUA SOGLIA, non «mai riuscito nemmeno una
     volta». Vedi il cappello di SOGLIA: un verbo che risponde una volta su
     dieci, per chi tiene il telefono in mano, non risponde. */
  const persi = esiti.filter(e => e.ok < (e.soglia == null ? 1 : e.soglia));
  console.log('\n' + (persi.length
    ? 'VERBI PERSI: ' + persi.map(e => e.nome + ' (' + e.ok + '/' + GIRI + ', serviva ' + e.soglia + ')').join(', ')
    : 'tutti e ' + esiti.length + ' i verbi rispondono al dito, ognuno sopra la propria soglia'));
  if (errori.length) console.log('eccezioni in pagina: ' + errori.slice(0, 3).join(' | '));
  if (persi.length || errori.length) process.exit(1);
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
