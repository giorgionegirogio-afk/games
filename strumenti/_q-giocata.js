/* =====================================================================
   GIOCATA — il tocco del gioco, misurato con le dita.

   Tutto il collaudo finora ha guardato la CPU giocare contro se' stessa:
   fotografie, filmati, misure — mai un dito sullo schermo. Ma un gioco
   di calcio si giudica toccandolo: quanto tarda il giocatore a partire
   quando il dito lo trascina, quanto tarda la palla quando il dito la
   chiede, se la carica del tiro esiste sotto il dito o solo nel codice.
   Questo strumento manda gesti touch VERI (eventi di protocollo, non
   funzioni chiamate a mano) sul canvas del gioco, campiona lo stato a
   60 volte al secondo e trasforma "com'e' il tocco" in numeri: la
   LATENZA fra il gesto e la prima variazione di velocita' del bersaglio,
   e la RISPOSTA (velocita' massima raggiunta dalla palla dopo il gesto).

   Le giocate sono scritte su come il gioco E', non su come lo si
   immagina. Dal codice dell'input, LO SCHEMA UNICO: stick virtuale
   ovunque sul canvas (tap col pallone = passaggio, flick veloce verso
   la porta = tiro, flick TRASVERSALE col pallone dalla meta' campo
   offensiva = cross, rilascio lento = niente) piu' DUE pulsanti
   contestuali sempre vivi nell'angolo basso a destra. DOVE stiano
   ESATTAMENTE non e' scritto qui: lo chiede il banco al gioco, con
   __test.pulsanti, e lo preme li' (vedi _toppa-giocata.js). Le
   coordinate qui sotto sono quelle storiche e restano come ripiego per
   i file d'archivio: il grande a (vw-66, vh-140) — TIRA
   col possesso, con la carica a finestra dolce 0,50-0,80 s; CONTRASTA
   senza — e il piccolo a (vw-70, vh-232) — FILTR. col possesso, CAMBIO
   senza. Il contesto si risolve al touchstart, e cosi' anche la misura.

   Il cancello: se il bersaglio della giocata non risponde entro 500 ms
   dal momento in cui il gesto COMANDA, la giocata e' NO e lo strumento
   esce con 1. Il momento che comanda non e' sempre l'inizio del gesto:
   per tap, flick e carica e' il rilascio — e' il dito che tiene aperta
   la carica, misurare dall'appoggio boccerebbe per costruzione anche
   una carica perfetta — mentre per il trascinamento e per i pulsanti
   contestuali (l'azione parte al touchstart) e' l'appoggio del dito.
   Si stampano entrambe le distanze.

   La risposta non basta: dev'essere l'azione GIUSTA, e lo dice lo STATO
   del gioco, non l'impressione. Il tiro e la carica pretendono il
   contatore dei tiri; la filtrante il contatore delle filtranti e una
   palla rasoterra piu' rapida del passaggio; il cross il contatore dei
   cross e una palla che prende quota (b.z); il cambio un indice del
   comandato diverso; il contrasto un p.slide acceso sul comandato.

   La prova che sa fallire: --pausa esegue le stesse giocate col gioco
   in pausa (e rende l'overlay trasparente ai tocchi, se no il dito
   premerebbe RIPRENDI e la prova non proverebbe niente). Se anche una
   sola giocata dice OK in pausa, lo strumento sta attestando: va
   riparato, non consegnato.

   uso:
     node strumenti/giocata.js --giocata tiro
     node strumenti/giocata.js --tutte
     node strumenti/giocata.js --tutte --filmato filmati/giocate.webm --json giocate.json
     node strumenti/giocata.js --tutte --pausa     (deve dire NO e uscire con 1)
     node strumenti/giocata.js --elenco
   ===================================================================== */
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
/* --- innesto di _q-banco.js: la radice resta il repo, ma il gioco puo'
   arrivare da fuori. Nessun altro comportamento e' toccato. --- */
const __PROVA = process.env.GIOCO_PROVA ? require('path').resolve(process.env.GIOCO_PROVA) : '';
const __rid = f => (__PROVA && /CALCETTO-il-gioco\.html$/i.test(f)) ? __PROVA : f;

const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png' };

function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = __rid(path.join(RADICE, decodeURIComponent(req.url.split('?')[0])));
      if ((!f.startsWith(RADICE) && f !== __PROVA) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

function arg(n, d) {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
}
const attesa = ms => new Promise(r => setTimeout(r, ms));
const dentro = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const esiti = [];
function verifica(ok, testo, dettaglio) {
  esiti.push(!!ok);
  console.log((ok ? '  OK   ' : '  NO   ') + testo + (dettaglio ? '\n         ' + dettaglio : ''));
}

/* --------------------------------------------------- dita di protocollo
   Un solo dito, mosso con Input.dispatchTouchEvent: sono gli stessi
   eventi che manda lo schermo di un telefono, non chiamate alle funzioni
   del gioco. Se il gioco non li ascolta, qui non risponde niente. */
const dito = {
  giu: (cdp, x, y) => cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }),
  sposta: (cdp, x, y) => cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] }),
  su: (cdp) => cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }),
};

/* ============================================================ GIOCATE ==
   Ognuna: come si prepara il campo (possesso o palla libera davanti),
   quale bersaglio deve rispondere, quale istante del gesto comanda
   ('inizio' = appoggio del dito, 'fine' = rilascio), e il gesto stesso.
   ====================================================================== */
const GIOCATE = {
  tocco: {
    titolo: 'tap semplice vicino alla palla (col pallone al piede = passaggio)',
    possesso: true, avanti: 0, bersaglio: 'palla', comando: 'fine',
    async gesto(cdp, pag, info) {
      const x = dentro(info.palla.x + 26, 15, info.vw - 15);
      const y = dentro(info.palla.y + 8, 60, info.vh - 60);
      await dito.giu(cdp, x, y);
      await attesa(80);
      await dito.su(cdp);
    },
  },
  trascina: {
    titolo: 'trascinamento del giocatore verso la palla libera',
    possesso: false, avanti: 110, bersaglio: 'giocatore', comando: 'inizio',
    async gesto(cdp, pag, info) {
      let x = info.comandato.x, y = info.comandato.y;
      const dx = info.palla.x - x, dy = info.palla.y - y, l = Math.max(1, Math.hypot(dx, dy));
      const px = dx / l, py = dy / l;
      await dito.giu(cdp, x, y);
      /* 14 passi da 7 px: si supera la zona morta dello stick (12 px),
         si arriva alla corsa piena (46 px) e oltre (sprint a 66 px) */
      for (let i = 0; i < 14; i++) {
        x = dentro(x + px * 7, 15, info.vw - 15);
        y = dentro(y + py * 7, 60, info.vh - 60);
        await dito.sposta(cdp, x, y);
        await attesa(28);
      }
      /* il dito resta fermo prima di alzarsi: il rilascio lento non e'
         un flick, quindi non parte nessun tiro o scivolata per sbaglio */
      await attesa(350);
      await dito.su(cdp);
    },
  },
  tiro: {
    titolo: 'flick veloce verso la porta col pallone al piede',
    possesso: true, avanti: 0, bersaglio: 'palla', comando: 'fine', richiedeTiro: true,
    async gesto(cdp, pag, info) {
      /* la squadra 0 attacca verso destra: il flick deve andare a destra
         (nx > 0.25) e superare i 650 px/s negli ultimi 90 ms. I punti si
         spediscono in RAFFICA, senza aspettare il giro di ogni chiamata:
         aspettandolo, ogni evento costava decine di millisecondi di
         viaggio (di piu' con la registrazione video accesa), il flick
         usciva lento e il gioco lo leggeva — a ragione — come un
         rilascio semplice, cioe' un passaggio. In quel caso lo strumento
         stava bocciando la lentezza del proprio dito, non il gioco.
         L'ordine sul protocollo e' comunque garantito. */
      let x = dentro(info.comandato.x, 15, info.vw - 250);
      const y = dentro(info.comandato.y, 60, info.vh - 60);
      await dito.giu(cdp, x, y);
      const invii = [];
      for (let i = 0; i < 5; i++) {
        x += 44;
        invii.push(dito.sposta(cdp, x, y));
      }
      invii.push(dito.su(cdp));
      await Promise.all(invii);
    },
  },
  carica: {
    titolo: 'pressione tenuta ~600 ms sul pulsante grande col pallone (TIRA), poi rilascio',
    possesso: true, avanti: 0, bersaglio: 'palla', comando: 'fine', richiedeTiro: true,
    async gesto(cdp, pag, info) {
      /* lo schema touch e' unico e il bottone GRANDE col possesso e'
         TIRA. Dove stia lo dice il gioco (info.grande), non questa riga:
         vedi il cappello di _toppa-giocata.js. setTouchButtons e' uno
         shim senza effetto; la chiamata resta per compatibilita' con le
         versioni vecchie del gioco. 600 ms cadono dentro la finestra
         dolce 500-800 ms. */
      await pag.evaluate(() => window.__test.setTouchButtons(true));
      const x = info.grande.x, y = info.grande.y;    // bottone grande (TIRA), squadra 0
      await dito.giu(cdp, x, y);
      await attesa(600);
      await dito.su(cdp);
      await pag.evaluate(() => window.__test.setTouchButtons(false));
    },
  },
  filtrante: {
    titolo: 'pulsante piccolo col pallone (FILTR.) -> palla tesa a un compagno, piu\' rapida del passaggio',
    possesso: true, bersaglio: 'palla', comando: 'inizio', mira: true, richiedeFiltrante: true,
    async gesto(cdp, pag, info) {
      /* il pulsante PICCOLO: il centro lo dice il gioco (info.piccolo).
         L'azione parte al TOCCO, non al rilascio: comanda l'appoggio,
         con i 50 ms dell'anticipo umano davanti. La mira viene dal corpo
         (nessuna levetta attiva): la quiete ha gia' girato la faccia del
         comandato verso un compagno, perche' la filtrante pretende un
         bersaglio con dot > 0,5. */
      await dito.giu(cdp, info.piccolo.x, info.piccolo.y);
      await attesa(80);
      await dito.su(cdp);
    },
  },
  cross: {
    titolo: 'flick trasversale col pallone dalla fascia offensiva -> palla alta verso l\'area',
    possesso: true, bersaglio: 'palla', comando: 'fine', zonaOffensiva: true, richiedeCross: true,
    async gesto(cdp, pag, info) {
      /* flick VERTICALE puro: nx = 0 non supera mai lo 0,25 del tiro,
         |ny| = 1 supera lo 0,6 del trasversale — e dalla meta' campo
         offensiva (dove la quiete ha portato il comandato) e' cross.
         In RAFFICA come il tiro: aspettare il giro di ogni evento
         renderebbe lento il dito dello strumento, non il gioco. Il dito
         parte a un terzo dello schermo, lontano dai pulsanti di destra:
         il flick dello stick vale ovunque sul canvas. */
      const x = Math.round(info.vw * 0.30);
      let y = 80;
      await dito.giu(cdp, x, y);
      const invii = [];
      for (let i = 0; i < 5; i++) { y += 44; invii.push(dito.sposta(cdp, x, y)); }
      invii.push(dito.su(cdp));
      await Promise.all(invii);
    },
  },
  cambio: {
    titolo: 'pulsante piccolo senza pallone (CAMBIO) -> il comando passa a un altro giocatore',
    possesso: false, avanti: 80, bersaglio: 'ctrl', comando: 'inizio', compagniLontani: true,
    async gesto(cdp, pag, info) {
      /* stesso pulsante della filtrante, contesto opposto: senza
         possesso di squadra l'atto risolto al touchstart e' 'swap'.
         Il bersaglio qui non e' una velocita': e' l'INDICE del
         comandato, che deve cambiare. La quiete tiene i compagni ad
         almeno 170 unita' dalla palla perche' il cambio AUTOMATICO non
         possa rubare la misura al cambio chiesto col dito. */
      await dito.giu(cdp, info.piccolo.x, info.piccolo.y);
      await attesa(80);
      await dito.su(cdp);
    },
  },
  contrasto: {
    titolo: 'pulsante grande senza pallone (CONTRASTA) vicino al portatore -> scivolata',
    possesso: false, bersaglio: 'giocatore', comando: 'inizio', portatore: true, compagniLontani: true, richiedeScivolata: true,
    async gesto(cdp, pag, info) {
      /* stesso pulsante della carica, contesto opposto: senza possesso
         l'atto e' 'slide'. La quiete ha messo il PORTATORE avversario a
         84 unita' dal comandato: la scivolata si abbassa (0,06 s di
         anticipo umano) e poi parte, rimirata sul pallone di adesso. */
      await dito.giu(cdp, info.grande.x, info.grande.y);
      await attesa(80);
      await dito.su(cdp);
    },
  },
};

/* ------------------------------------------------------------- sonda --
   Vive nella pagina: un ciclo rAF che campiona palla, giocatore
   comandato e giocatore piu' vicino alla palla, piu' un orecchio in
   cattura sugli eventi touch per sapere QUANDO la pagina li ha visti
   davvero (la latenza si misura da li', non da quando il nodo li ha
   spediti). */
function installaSonda() {
  window.__sonda = { campioni: [], eventi: [], via: false };
  for (const tipo of ['touchstart', 'touchmove', 'touchend']) {
    addEventListener(tipo, e => {
      if (!window.__sonda.via) return;
      const c = e.changedTouches && e.changedTouches[0];
      window.__sonda.eventi.push({ tipo, t: performance.now(), x: c ? c.clientX : null, y: c ? c.clientY : null });
    }, { capture: true, passive: true });
  }
  window.__sondaVia = () => {
    const S = window.__sonda;
    S.campioni.length = 0; S.eventi.length = 0; S.via = true;
    const G = window.__test.G;
    const giro = () => {
      if (!S.via) return;
      const pi = G.ctrl[0];
      const p = pi >= 0 ? G.players[pi] : null;
      let vic = null, vi = -1, dm = 1e9;
      for (let i = 0; i < G.players.length; i++) {
        const q = G.players[i];
        const d = Math.hypot(q.x - G.ball.x, q.y - G.ball.y);
        if (d < dm) { dm = d; vic = q; vi = i; }
      }
      const b = G.ball;
      S.campioni.push({
        t: performance.now(),
        /* z e passTo sono le firme delle azioni nuove: il cross esiste
           solo se la palla prende quota, la filtrante solo se resta a
           terra e con un destinatario assegnato */
        palla: { x: b.x, y: b.y, vx: b.vx, vy: b.vy, z: b.z || 0, owner: b.owner, passTo: b.passTo !== undefined ? b.passTo : null },
        comandato: p ? { i: pi, x: p.x, y: p.y, vx: p.vx, vy: p.vy, carica: p.charge !== undefined ? p.charge : null, slide: p.slide !== undefined ? p.slide : null } : null,
        vicino: vic ? { i: vi, x: vic.x, y: vic.y, vx: vic.vx, vy: vic.vy } : null,
        scena: G.scene, pausa: !!G.paused,
      });
      requestAnimationFrame(giro);
    };
    requestAnimationFrame(giro);
  };
  window.__sondaAlt = () => {
    window.__sonda.via = false;
    return { campioni: window.__sonda.campioni, eventi: window.__sonda.eventi };
  };
}

/* --------------------------------------------------- quiete sul campo --
   Ogni giocata parte da uno stato governato: partita in corso, palla
   ferma (al piede o libera davanti al giocatore comandato), avversari
   allontanati quanto basta a non rubare la misura nei 500 ms del
   cancello. Tutto con gli hook __test: il file del gioco non si tocca. */
function preparaQuiete(opz) {
  const t = window.__test, G = t.G;
  t.setPaused && t.setPaused(false);
  try { if (t.Tut && t.Tut.active && t.Tut.finish) t.Tut.finish(true); } catch (e) {}
  for (let i = 0; i < 300 && G.scene !== 'play'; i++) t.simulate(0.1);
  if (G.scene !== 'play') return { errore: "la partita non arriva mai in gioco: scena '" + G.scene + "'" };
  t.setTimeLeft && t.setTimeLeft(80);      // mai a ridosso del fischio finale
  const pi = G.ctrl[0];
  if (pi < 0) return { errore: 'nessun giocatore comandato (G.ctrl[0] = -1)' };
  const p = G.players[pi];
  /* una carica rimasta aperta dalla giocata precedente bloccherebbe
     l'anticipo del gesto nuovo: si chiude come farebbe chiudiAnticipo */
  if (p.charge !== undefined && p.charge >= 0) { p.charge = -1; p.chargeKind = 'tiro'; p.chargeT = 0; p.chargeGo = null; }
  /* il cross esiste solo dalla meta' campo offensiva: il comandato si
     porta in fascia (y sotto il centro, x ben oltre FW/2) PRIMA di
     ricevere palla. Punto fisso = giocata ripetibile. */
  if (opz.zonaOffensiva) { const c = t.campo; p.x = c.FW * 0.68; p.y = c.FH * 0.26; }
  for (const q of G.players) { q.vx = 0; q.vy = 0; }
  const b = G.ball;
  b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0; b.curve = 0; b.passTo = -1;
  /* la palla si mette dal lato del centro dello schermo, cosi' il gesto
     resta dentro il viewport qualunque sia la posizione del comandato */
  const v = t.view;
  const cx = (innerWidth / 2 - v.Ax) / v.S2;
  const dir = cx >= p.x ? 1 : -1;
  let portatore = -1;
  if (opz.portatore) {
    /* il contrasto si prova sul PORTATORE: il pallone va all'avversario
       di movimento piu' vicino, messo a 84 unita' dal comandato —
       dentro il raggio (140) in cui la scivolata ha un bersaglio onesto */
    let dm = 1e9;
    for (let i = 0; i < G.players.length; i++) {
      const q = G.players[i];
      if (q.team !== 1 || q.out > 0 || q.role === 'gk') continue;
      const d = Math.hypot(q.x - p.x, q.y - p.y);
      if (d < dm) { dm = d; portatore = i; }
    }
    if (portatore < 0) return { errore: 'nessun avversario di movimento a cui dare il pallone' };
    const q = G.players[portatore];
    q.x = p.x + dir * 84; q.y = p.y;
    b.owner = portatore; b.x = q.x + dir * 8; b.y = q.y;
  } else if (opz.possesso) { b.owner = pi; b.x = p.x + dir * 8; b.y = p.y; }
  else { b.owner = -1; b.x = p.x + dir * (opz.avanti || 0); b.y = p.y; }
  for (let i = 0; i < G.players.length; i++) {
    const q = G.players[i];
    if (q.team === 0 || i === portatore) continue;
    const d = Math.hypot(q.x - b.x, q.y - b.y);
    if (d < 170) {
      const l = Math.max(1, d);
      q.x = b.x + (q.x - b.x) / l * 230;
      q.y = b.y + (q.y - b.y) / l * 230;
    }
  }
  if (opz.compagniLontani) {
    /* anche i COMPAGNI si scostano dalla palla: il cambio automatico
       scatta quando un altro e' piu' vicino di 14 unita' per 200 ms, e
       ruberebbe la misura del cambio manuale (o il comandato al
       contrasto a meta' finestra) */
    for (let i = 0; i < G.players.length; i++) {
      const q = G.players[i];
      if (q.team !== 0 || i === pi || q.role === 'gk') continue;
      const d = Math.hypot(q.x - b.x, q.y - b.y);
      if (d < 170) {
        const l = Math.max(1, d);
        q.x = b.x + (q.x - b.x) / l * 230;
        q.y = b.y + (q.y - b.y) / l * 230;
      }
    }
  }
  if (opz.mira) {
    /* la filtrante senza levetta parte dove GUARDA il corpo, e pretende
       un compagno con dot > 0,5: la faccia si gira dritta sul compagno
       di movimento piu' vicino, e il bersaglio esiste per costruzione.
       Da fermo e senza input la faccia non ruota piu' da sola. */
    let mig = null, md = 1e9;
    for (const q of G.players) {
      if (q.team !== 0 || q === p || q.out > 0 || q.role === 'gk') continue;
      const d = Math.hypot(q.x - p.x, q.y - p.y);
      if (d < md) { md = d; mig = q; }
    }
    if (!mig) return { errore: 'nessun compagno di movimento a cui filtrare' };
    const dx = mig.x - p.x, dy = mig.y - p.y, l = Math.max(1, Math.hypot(dx, dy));
    p.fx = dx / l; p.fy = dy / l;
  }
  const sx = w => w * v.S2 + v.Ax, sy = w => w * v.S2 + v.Ay;
  /* DOVE SONO I COMANDI, chiesto al gioco invece che ricordato a
     memoria. __test.pulsanti(0) restituisce lo stesso array che il
     gioco usa per disegnarli e per risolvere il tocco: centro, raggio,
     atto. Il ripiego sulle coordinate storiche serve solo ai file
     d'archivio che non esportano la funzione. */
  let bottoni = null;
  try { bottoni = window.__test.pulsanti ? window.__test.pulsanti(0) : null; } catch (e) { bottoni = null; }
  if (!bottoni || !bottoni.length) {
    bottoni = [ { act: 'shot', x: innerWidth - 66, y: innerHeight - 140, r: 40 },
                { act: 'through', x: innerWidth - 70, y: innerHeight - 232, r: 30 } ];
  }
  return {
    pi,
    palla: { x: sx(b.x), y: sy(b.y) },
    comandato: { x: sx(p.x), y: sy(p.y) },
    vw: innerWidth, vh: innerHeight,
    grande: { x: Math.round(bottoni[0].x), y: Math.round(bottoni[0].y), r: bottoni[0].r },
    piccolo: { x: Math.round(bottoni[1].x), y: Math.round(bottoni[1].y), r: bottoni[1].r },
  };
}

/* ------------------------------------------------------------ analisi --
   La latenza si conta dall'istante in cui il gesto comanda alla prima
   variazione del VETTORE velocita' del bersaglio rispetto alla base
   presa in quell'istante. Le soglie tengono fuori il tremolio: un calcio
   vero vale centinaia di unita' al secondo. */
const SOGLIA_PALLA = 40, SOGLIA_GIOC = 15;   // unita' mondo al secondo
function analizza(dati, comando, bersaglio) {
  const ev = dati.eventi || [];
  if (!ev.length) return { errore: 'nessun evento touch e\' arrivato alla pagina' };
  const inizio = ev.find(e => e.tipo === 'touchstart');
  const fine = [...ev].reverse().find(e => e.tipo === 'touchend');
  const comandoT = comando === 'inizio' ? (inizio && inizio.t) : (fine && fine.t);
  if (comandoT == null) return { errore: 'gesto incompleto: alla pagina manca il touch' + (comando === 'inizio' ? 'start' : 'end') };
  const C = dati.campioni || [];
  if (!C.length) return { errore: 'nessun campione: la sonda non ha girato' };
  let base = null;
  for (const c of C) { if (c.t <= comandoT) base = c; else break; }
  if (!base) base = C[0];
  const vel = c => bersaglio === 'palla'
    ? [c.palla.vx || 0, c.palla.vy || 0]
    : [c.comandato ? c.comandato.vx || 0 : 0, c.comandato ? c.comandato.vy || 0 : 0];
  const [bx, by] = vel(base);
  const soglia = bersaglio === 'palla' ? SOGLIA_PALLA : SOGLIA_GIOC;
  let risp = null;
  for (const c of C) {
    if (c.t <= comandoT) continue;
    const [vx, vy] = vel(c);
    if (Math.hypot(vx - bx, vy - by) > soglia) { risp = c; break; }
  }
  let vmax = 0, caricaMax = 0;
  for (const c of C) {
    if (c.t <= comandoT - 700) continue;   // la carica matura PRIMA del rilascio
    if (c.comandato && c.comandato.carica != null) caricaMax = Math.max(caricaMax, c.comandato.carica);
    if (c.t > comandoT) vmax = Math.max(vmax, Math.hypot(c.palla.vx || 0, c.palla.vy || 0));
  }
  /* le firme di stato delle azioni nuove, lette DOPO l'istante che
     comanda: quota della palla NEL VOLO del nostro calcio (cross alto,
     filtrante rasoterra), primo p.slide acceso (contrasto), primo
     cambio dell'indice comandato (cambio), primo destinatario di
     passaggio assegnato (filtrante). La quota si guarda solo dal
     rilascio del pallone alla presa successiva: dopo, il compagno che
     ha ricevuto puo' calciare a sua volta e mettere una z che non e'
     del nostro gesto. */
  let zVoloMax = 0, inVolo = false, voloFinito = false;
  let scivolataMs = null, cambioMs = null, nuovoIndice = null, passToVisto = null;
  const baseIdx = base.comandato ? base.comandato.i : null;
  for (const c of C) {
    if (c.t <= comandoT) continue;
    if (!voloFinito && c.palla) {
      if (!inVolo && c.palla.owner < 0) inVolo = true;
      else if (inVolo && c.palla.owner >= 0) voloFinito = true;
      if (inVolo && !voloFinito && c.palla.z != null) zVoloMax = Math.max(zVoloMax, c.palla.z);
    }
    if (scivolataMs == null && c.comandato && c.comandato.slide != null && c.comandato.slide >= 0) scivolataMs = c.t - comandoT;
    if (cambioMs == null && baseIdx != null && c.comandato && c.comandato.i !== baseIdx) { cambioMs = c.t - comandoT; nuovoIndice = c.comandato.i; }
    if (passToVisto == null && c.palla && c.palla.passTo != null && c.palla.passTo >= 0) passToVisto = c.palla.passTo;
  }
  /* velocita' del flick COME L'HA VISTA LA PAGINA: stessi 90 ms che
     guarda il gioco al rilascio. Serve a distinguere "il gioco non legge
     il tiro" da "il dito dello strumento era lento". */
  let flickPxS = null;
  if (fine) {
    const mosse = ev.filter(e => e.tipo !== 'touchend' && e.x != null && fine.t - e.t <= 90);
    if (mosse.length >= 2) {
      const a0 = mosse[0], a1 = mosse[mosse.length - 1];
      flickPxS = Math.hypot(a1.x - a0.x, a1.y - a0.y) / Math.max(1, a1.t - a0.t) * 1000;
    }
  }
  return {
    /* per il bersaglio 'ctrl' la risposta non e' una velocita': e' il
       cambio dell'indice del comandato, e la latenza si conta da li' */
    latenzaMs: bersaglio === 'ctrl' ? cambioMs : (risp ? risp.t - comandoT : null),
    dallInizioMs: risp && inizio ? risp.t - inizio.t : null,
    rispostaMax: vmax,
    caricaMax,
    flickPxS,
    zVoloMax, scivolataMs, cambioMs, nuovoIndice, passToVisto,
  };
}

/* ================================================================ main = */
(async () => {
  if (process.argv.includes('--elenco')) {
    for (const k of Object.keys(GIOCATE)) console.log(k.padEnd(10) + GIOCATE[k].titolo);
    return;
  }
  const inPausa = process.argv.includes('--pausa');
  const nomi = process.argv.includes('--tutte')
    ? Object.keys(GIOCATE)
    : [arg('giocata', null)].filter(Boolean);
  if (!nomi.length) { console.error('serve --giocata <nome> oppure --tutte oppure --elenco'); process.exit(1); }
  for (const n of nomi) {
    if (!GIOCATE[n]) { console.error('giocata sconosciuta: ' + n + '\ngiocate: ' + Object.keys(GIOCATE).join(', ')); process.exit(1); }
  }
  const fileFilmato = arg('filmato', null);
  const fileJson = arg('json', null);
  const seme = +arg('seme', 20260731);

  const tmp = fileFilmato ? fs.mkdtempSync(path.join(os.tmpdir(), 'giocata-')) : null;
  const srv = await servi();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 915, height: 412 }, deviceScaleFactor: 1,
    isMobile: true, hasTouch: true, locale: 'it-IT',
    ...(fileFilmato ? { recordVideo: { dir: tmp, size: { width: 915, height: 412 } } } : {}),
  });
  const pag = await ctx.newPage();

  /* il caso, governato: stesso generatore a seme fisso di scatta.js,
     installato PRIMA che la pagina esegua una sola riga */
  await pag.addInitScript(s0 => {
    let x = s0 >>> 0 || 1;
    const p = () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x >>> 0; };
    Math.random = () => p() / 4294967296;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = p(); return a; };
    }
  }, seme);

  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.waitForTimeout(500);
  await pag.evaluate(installaSonda);
  await pag.evaluate(() => {
    const t = window.__test;
    t.dismissSplash && t.dismissSplash();
    t.startMatch(1, 1);                     // 1 giocatore: la squadra 0 e' del dito
  });
  await pag.waitForTimeout(400);

  const cdp = await ctx.newCDPSession(pag);
  const raccolta = [];

  console.log(`\n=== GIOCATE COL DITO${inPausa ? ' — GIOCO IN PAUSA (deve fallire)' : ''} ===\n`);

  for (const nome of nomi) {
    const g = GIOCATE[nome];
    const info = await pag.evaluate(preparaQuiete, {
      possesso: !!g.possesso, avanti: g.avanti || 0,
      zonaOffensiva: !!g.zonaOffensiva, portatore: !!g.portatore,
      compagniLontani: !!g.compagniLontani, mira: !!g.mira,
    });
    if (info.errore) {
      verifica(false, `${nome}: ${g.titolo}`, info.errore);
      raccolta.push({ nome, esito: 'NO', errore: info.errore });
      continue;
    }
    if (inPausa) {
      /* pausa vera, e overlay trasparente ai tocchi: se il dito premesse
         RIPRENDI la pausa cadrebbe e la prova non proverebbe niente.
         Cosi' gli eventi ARRIVANO al canvas ed e' il gioco a doverli
         ignorare perche' G.paused — il collaudo piu' severo possibile. */
      await pag.evaluate(() => {
        window.__test.setPaused(true);
        const el = document.getElementById('pausa');
        if (el) el.style.pointerEvents = 'none';
      });
    }
    /* il tabellino prima del gesto: la velocita' della palla non basta —
       anche un passaggio la muove. Fanno fede i contatori del gioco:
       tiri per 'tiro' e 'carica', filtranti e cross per le giocate
       omonime, e l'indice del comandato per 'cambio'. Se il contatore
       giusto non sale, il gesto e' stato letto come ALTRO. */
    const contatori = () => pag.evaluate(() => {
      const G = window.__test.G;
      return {
        tiri: G.stats.tiri[0], perfetti: G.stats.perfetti[0],
        filtranti: G.stats.filtranti ? (G.stats.filtranti[0] || 0) : 0,
        cross: G.stats.cross ? (G.stats.cross[0] || 0) : 0,
        ctrl: G.ctrl[0],
      };
    });
    const prima = await contatori();
    await pag.evaluate(() => window.__sondaVia());
    await attesa(150);                       // base di quiete prima del gesto
    await g.gesto(cdp, pag, info);
    await attesa(1300);                      // finestra di risposta
    const dati = await pag.evaluate(() => window.__sondaAlt());
    const dopo = await contatori();
    const tiriFatti = dopo.tiri - prima.tiri, perfettiFatti = dopo.perfetti - prima.perfetti;
    const filtrantiFatte = dopo.filtranti - prima.filtranti, crossFatti = dopo.cross - prima.cross;
    const a = analizza(dati, g.comando, g.bersaglio);

    if (a.errore) {
      verifica(false, `${nome}: ${g.titolo}`, a.errore);
      raccolta.push({ nome, esito: 'NO', errore: a.errore, campioni: dati.campioni, eventi: dati.eventi });
      continue;
    }
    const rispondeInTempo = a.latenzaMs != null && a.latenzaMs <= 500;
    /* oltre alla risposta in tempo, l'azione dev'essere quella GIUSTA:
       lo dicono i contatori del gioco e lo stato campionato, non la
       nostra impressione sul movimento della palla */
    const flickTxt = a.flickPxS != null ? ` (flick visto dalla pagina: ${a.flickPxS.toFixed(0)} px/s, al gioco ne servono 650)` : '';
    let azioneNo = null;
    if (g.richiedeTiro && tiriFatti < 1)
      azioneNo = "la palla si muove ma il tabellino non segna tiri: il gesto e' stato letto come altro" + flickTxt;
    if (!azioneNo && g.richiedeFiltrante) {
      if (filtrantiFatte < 1) azioneNo = "il contatore delle filtranti non sale: il gesto e' stato letto come altro (passaggio normale?)";
      else if (a.rispostaMax < 420) azioneNo = `filtrante a tabellino ma palla a ${a.rispostaMax.toFixed(0)} unita'/s: sotto il minimo (420) che la fa piu' rapida del passaggio normale`;
      else if (a.zVoloMax > 5) azioneNo = `filtrante a tabellino ma la palla prende quota (z max ${a.zVoloMax.toFixed(1)}): la filtrante e' rasoterra per definizione`;
    }
    if (!azioneNo && g.richiedeCross) {
      if (crossFatti < 1) azioneNo = "il contatore dei cross non sale: il flick trasversale e' stato letto come altro" + flickTxt;
      else if (!(a.zVoloMax > 10)) azioneNo = `cross a tabellino ma la palla non prende quota (z max ${a.zVoloMax.toFixed(1)}: sopra le teste serve 26)`;
    }
    if (!azioneNo && g.richiedeScivolata && (a.scivolataMs == null || a.scivolataMs > 500))
      azioneNo = a.scivolataMs == null
        ? 'il comandato non entra mai in scivolata (p.slide resta spento)'
        : `la scivolata parte solo dopo ${a.scivolataMs.toFixed(0)} ms`;
    const passa = rispondeInTempo && !azioneNo;
    const chi = g.bersaglio === 'palla' ? 'la palla' : g.bersaglio === 'ctrl' ? "l'indice del comandato" : 'il giocatore comandato';
    const daQuando = g.comando === 'inizio' ? "dall'appoggio del dito" : 'dal rilascio';
    verifica(passa, `${nome}: ${g.titolo}`,
      a.latenzaMs == null
        ? (g.bersaglio === 'ctrl'
            ? `${chi} non cambia mai dopo il gesto: nessuna risposta`
            : `${chi} non cambia mai velocita' dopo il gesto: nessuna risposta`)
        : !rispondeInTempo
          ? `risposta a ${a.latenzaMs.toFixed(0)} ms: oltre il cancello dei 500`
          : azioneNo
            ? azioneNo + ` (latenza ${a.latenzaMs.toFixed(0)} ms)`
            : `latenza ${a.latenzaMs.toFixed(0)} ms ${daQuando}` +
              (a.dallInizioMs != null && g.comando !== 'inizio' ? ` (${a.dallInizioMs.toFixed(0)} ms dall'inizio del gesto)` : '') +
              (g.bersaglio === 'ctrl' ? '' : ` — risposta: palla fino a ${a.rispostaMax.toFixed(0)} unita'/s`) +
              (g.richiedeTiro ? ` — tiri a tabellino +${tiriFatti}, perfetti +${perfettiFatti}` : '') +
              (nome === 'tiro' && a.flickPxS != null ? ` — flick ${a.flickPxS.toFixed(0)} px/s` : '') +
              (nome === 'carica' ? ` — carica maturata ${a.caricaMax.toFixed(2)} s (finestra dolce 0,50-0,80)` : '') +
              (g.richiedeFiltrante ? ` — filtranti a tabellino +${filtrantiFatte}, rasoterra (z max ${a.zVoloMax.toFixed(1)})` +
                (a.passToVisto != null ? `, diretta al compagno ${a.passToVisto}` : '') : '') +
              (g.richiedeCross ? ` — cross a tabellino +${crossFatti}, quota massima z ${a.zVoloMax.toFixed(1)} (sopra le teste da 26)` +
                (a.flickPxS != null ? `, flick ${a.flickPxS.toFixed(0)} px/s` : '') : '') +
              (g.bersaglio === 'ctrl' ? ` — comandato: indice ${prima.ctrl} -> ${a.nuovoIndice}` : '') +
              (g.richiedeScivolata ? ` — p.slide acceso ${a.scivolataMs.toFixed(0)} ms dopo il tocco` : ''));
    raccolta.push({
      nome, esito: passa ? 'OK' : 'NO',
      latenzaMs: a.latenzaMs, dallInizioMs: a.dallInizioMs,
      rispostaMaxUnitaAlSecondo: a.rispostaMax, caricaMaturataSec: a.caricaMax,
      flickPxS: a.flickPxS, tiriATabellino: tiriFatti, tiriPerfetti: perfettiFatti,
      filtrantiATabellino: filtrantiFatte, crossATabellino: crossFatti,
      quotaMaxPalla: a.zVoloMax, scivolataMs: a.scivolataMs,
      passTo: a.passToVisto, ctrlPrima: prima.ctrl, ctrlNuovo: a.nuovoIndice,
      comando: g.comando, bersaglio: g.bersaglio,
      campioni: dati.campioni, eventi: dati.eventi,
    });
  }

  /* video: si salva DOPO la chiusura del contesto ma PRIMA di quella del
     browser — dopo, non c'e' piu' nessuno a cui chiederlo */
  const video = fileFilmato ? pag.video() : null;
  await ctx.close();
  if (fileFilmato) {
    const uscita = path.resolve(fileFilmato);
    fs.mkdirSync(path.dirname(uscita), { recursive: true });
    await video.saveAs(uscita);
    console.log(`\nfilmato: ${uscita} (${(fs.statSync(uscita).size / 1024).toFixed(0)} kB)`);
  }
  await browser.close();
  srv.chiudi();
  if (tmp) fs.rmSync(tmp, { recursive: true, force: true });

  if (fileJson) {
    const uscita = path.resolve(fileJson);
    fs.mkdirSync(path.dirname(uscita), { recursive: true });
    fs.writeFileSync(uscita, JSON.stringify({ data: new Date().toISOString(), seme, pausa: inPausa, giocate: raccolta }, null, 1));
    console.log(`json: ${uscita} (${raccolta.reduce((s, g) => s + (g.campioni ? g.campioni.length : 0), 0)} campioni a 60 Hz)`);
  }

  const male = esiti.filter(x => !x).length;
  console.log(`\n${esiti.length} giocate, ${esiti.length - male} passate, ${male} fallite`);
  if (male) {
    console.log("Una giocata fallita vuol dire che il dito ha chiesto e il gioco non ha risposto entro mezzo secondo.");
    process.exit(1);
  }
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
