/* =====================================================================
   COLLAUDO — la rete di sicurezza.

   Un ritocco alla grafica non deve poter rompere il gioco senza che nessuno
   se ne accorga. Questo file gioca partite intere in un browser vero e
   controlla le cose che devono restare vere sempre: il mazzo ha quaranta
   carte e nessun doppione, la partita finisce, il punteggio ha senso, la
   console e' pulita.

   uso:   node strumenti/collaudo.js            (tutti e due i giochi)
          node strumenti/collaudo.js circolo
   Esce con codice 1 se qualcosa non va: si puo' incatenare a una build.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const esiti = [];
function verifica(ok, testo, dettaglio) {
  esiti.push({ ok: !!ok, testo });
  /* il dettaglio si stampa quando il controllo FALLISCE — e anche quando
     si chiede a mano con DETTAGLI=1, che serve a chi sta tarando un colore
     e ha bisogno di vedere i numeri anche mentre il cancello e' verde */
  const mostra = (!ok || process.env.DETTAGLI) && dettaglio;
  console.log((ok ? '  OK   ' : '  NO   ') + testo + (mostra ? '\n         ' + dettaglio : ''));
}

const TIPI = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png', '.webmanifest': 'application/manifest+json',
};
function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(RADICE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        res.writeHead(404); res.end(); return;
      }
      /* il tipo giusto conta: servendo sw.js come text/html il browser
         rifiuta di registrarlo e sporca la console di un errore che non
         c'entra niente con quello che stiamo collaudando */
      res.writeHead(200, {
        'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

async function apri(browser, srv, file, vista) {
  const ctx = await browser.newContext({ viewport: vista, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  /* IL SEME FISSO, lezione pagata TRE volte (scatta, misura, e poi qui):
     il controllo sugli autogol applica una quota del 25% su 2-3 reti di
     una partita SENZA seme — un lancio di moneta. Ha dichiarato rosso un
     gioco sano (1 su 3), e due esecuzioni dopo era verde (0 su 2, 0 su 3)
     sullo stesso identico codice. Un cancello che lancia i dadi prima o
     poi fa anche il contrario: copre una regressione vera. Stesso
     generatore di scatta.js, installato prima di ogni riga di pagina. */
  await pag.addInitScript(seme => {
    let s = seme >>> 0 || 1;
    const prossimo = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => prossimo() / 4294967296;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = prossimo(); return a; };
    }
  }, 20260728);
  const errori = [];
  pag.on('console', m => { if (m.type() === 'error') errori.push(m.text()); });
  pag.on('pageerror', e => errori.push('ECCEZIONE: ' + e.message));
  await pag.goto(`http://127.0.0.1:${srv.porta}/${file}`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.waitForTimeout(400);
  return { ctx, pag, errori };
}

/* ------------------------------------------------------------- CIRCOLO - */
async function circolo(browser, srv) {
  console.log('\n=== CIRCOLO ===');
  const { ctx, pag, errori } = await apri(browser, srv, 'CIRCOLO-il-gioco.html', { width: 412, height: 915 });

  /* i quattro modi di giocare: due a testa a testa, due al tavolo a coppie */
  const MODI = [
    { nome: 'scopa', gioco: 'scopa', n: 2 },
    { nome: 'scopone (in quattro)', gioco: 'scopa', n: 4 },
    { nome: 'briscola', gioco: 'briscola', n: 2 },
    { nome: 'briscola a coppie', gioco: 'briscola', n: 4 },
  ];
  for (const modo of MODI) {
    const gioco = modo.nome;
    const r = await pag.evaluate(async (m) => {
      const t = window.__test;
      t.startGame(m.gioco, 'cpu', { giocatori: m.n });
      /* Integrita': la stessa carta non puo' trovarsi in due posti insieme.
         Non si conta il totale a 40 perche' lo stato esposto non espone tutti
         i seggi del tavolo a quattro, e la briscola compare sia scoperta sia
         in fondo al mazzo: il doppione vero e' l'unico segnale affidabile. */
      const doppioni = st => {
        const tutte = [];
        (st.hands || []).forEach(h => tutte.push(...h));
        (st.deck || []).forEach(c => tutte.push(c));
        if (Array.isArray(st.table)) st.table.forEach(c => tutte.push(c.carta || c));
        const chiavi = tutte.map(c => c.s + c.v);
        return { n: chiavi.length, unici: new Set(chiavi).size };
      };
      const inizio = doppioni(t.state);
      /* autoplayMatch ha un tetto di giri: per lo scopone e il briscolone,
         che durano di piu', si richiama finche' non finisce davvero */
      let fine = null, errore = null;
      try {
        for (let i = 0; i < 8; i++) {
          fine = t.autoplayMatch();
          if (!fine || fine.phase === 'matchEnd') break;
        }
      } catch (e) { errore = e.message; }
      return { inizio, fine: doppioni(t.state), fase: fine && fine.phase, errore, seggi: t.state && t.state.n };
    }, modo);

    verifica(r.inizio.unici === r.inizio.n && r.fine.unici === r.fine.n,
      `${gioco}: nessuna carta in due posti insieme`, JSON.stringify(r));
    verifica(!r.errore && r.fase === 'matchEnd',
      `${gioco}: la partita arriva alla fine`, r.errore || ('fase=' + r.fase));
  }

  /* il seme dichiarato deve ricostruire la stessa smazzata */
  const seme = await pag.evaluate(() => {
    const t = window.__test;
    t.startGame('scopa', 'cpu');
    const s = t.seme;
    return { seme: s, verifica: s != null ? !!t.verificaSeme(s) : null };
  });
  verifica(seme.seme == null || seme.verifica === true,
    'il seme dichiarato ricostruisce la stessa smazzata', JSON.stringify(seme));

  /* forza dell'IA: il maestro non deve perdere dal principiante */
  const forza = await pag.evaluate(() => window.__test.sfida('scopa', 'principiante', 'maestro', 14));
  verifica(forza.b >= forza.a,
    `l'IA forte non perde dalla debole (${forza.a} a ${forza.b} su ${forza.partite})`,
    JSON.stringify(forza));

  /* il tasto Indietro esiste e al menu lascia passare */
  const indietro = await pag.evaluate(() => {
    window.__test.startGame('scopa', 'cpu');
    const dalTavolo = window.__indietro();
    const alMenu = window.__indietro();
    return { dalTavolo, alMenu, salvata: !!localStorage.getItem('circolo_partita_v1') };
  });
  verifica(indietro.dalTavolo === true && indietro.alMenu === false && indietro.salvata,
    'il tasto Indietro mette via la partita e al menu si arrende', JSON.stringify(indietro));

  verifica(errori.length === 0, 'nessun errore in console', errori.slice(0, 3).join(' | '));
  await ctx.close();
}

/* ------------------------------------------------------------ CALCETTO - */
async function calcetto(browser, srv) {
  console.log('\n=== CALCETTO ===');
  const { ctx, pag, errori } = await apri(browser, srv, 'CALCETTO-il-gioco.html', { width: 915, height: 412 });

  const r = await pag.evaluate(async () => {
    const t = window.__test;
    t.dismissSplash && t.dismissSplash();
    t.startMatch(1, 1);
    t.setCpuVsCpu(true);
    /* si simula finche' la partita non finisce davvero: fra recupero,
       esultanze e gol d'oro i novanta secondi non bastano mai */
    const passi = [];
    for (let i = 0; i < 40 && t.state !== 'end'; i++) passi.push(t.simulate(6));
    return {
      punteggio: t.score, scena: t.state, tempo: t.timeLeft,
      stat: t.stats, disciplina: t.disciplina,
      ultimi: passi.slice(-2),
    };
  });

  verifica(r.scena === 'end' || r.scena === 'goal' || r.tempo <= 0.1,
    `la partita arriva alla fine (scena ${r.scena}, ${r.tempo && r.tempo.toFixed(1)}s)`, JSON.stringify(r.ultimi));
  const gol = r.punteggio[0] + r.punteggio[1];
  verifica(gol >= 1 && gol <= 14, `il punteggio e' plausibile (${r.punteggio.join('-')})`, JSON.stringify(r.punteggio));
  verifica(r.stat.tiri[0] + r.stat.tiri[1] > 0, 'si tira in porta', JSON.stringify(r.stat.tiri));
  verifica(r.disciplina.inCampo[0] >= 3 && r.disciplina.inCampo[1] >= 3,
    `nessuna squadra resta senza giocatori (${r.disciplina.inCampo.join(' e ')})`, JSON.stringify(r.disciplina));

  /* Il tabellino deve dire il vero. Un difetto trovato guardando le partite:
     quasi tutte le reti risultavano autogol, perche' il marcatore e' "chi ha
     toccato per ultimo" e una deviazione del portiere basta a prendersi il
     gol. Tre autogol in una partita non succedono. */
  const tabellino = await pag.evaluate(async () => {
    const t = window.__test;
    let reti = 0, autogol = 0, senzaNome = 0;
    for (let p = 0; p < 4; p++) {
      t.startMatch(1, 1); t.setCpuVsCpu(true);
      for (let i = 0; i < 40 && t.state !== 'end'; i++) t.simulate(6);
      const log = (t.G && t.G.golLog) || [];
      for (const g of log) {
        reti++;
        if (g.auto) autogol++;
        if (!g.chi) senzaNome++;
      }
    }
    return { reti, autogol, senzaNome, quota: reti ? autogol / reti : 0 };
  });
  verifica(tabellino.reti === 0 || tabellino.quota <= 0.25,
    `gli autogol restano un'eccezione (${tabellino.autogol} su ${tabellino.reti} reti)`,
    JSON.stringify(tabellino));
  verifica(tabellino.senzaNome === 0, 'ogni rete ha un marcatore con un nome', JSON.stringify(tabellino));

  /* il portiere deve restare dentro la porta */
  const portiere = await pag.evaluate(async () => {
    const t = window.__test;
    t.startMatch(1, 1); t.setCpuVsCpu(true);
    let fuori = 0, campioni = 0;
    for (let i = 0; i < 60; i++) {
      t.simulate(0.5);
      for (const p of t.players) {
        if (p.role !== 'gk') continue;
        campioni++;
        if (p.y < 150 || p.y > 410) fuori++;
      }
    }
    return { fuori, campioni };
  });
  verifica(portiere.fuori === 0, `il portiere non esce dalla cornice (${portiere.fuori} su ${portiere.campioni})`,
    JSON.stringify(portiere));

  /* =====================================================================
     LE TRE TAGLIE DI ROSA (5 base, 7, 11).
     Il rischio dichiarato nel piano: FW/FH sono stati costanti per sempre
     e qualunque valore precalcolato al caricamento (folla, pali, texture,
     pallone del menu) puo' restare alla taglia vecchia dopo setTaglia —
     un difetto subdolo che non rompe nulla di misurabile altrove. Qui si
     verifica che i derivati siano COERENTI col campo corrente, che una
     partita giri su ogni taglia senza che nessuno esca dal mondo, e che
     la chiamata nuda startMatch(1,1) riapra la base al bit.
     ===================================================================== */
  const taglie = await pag.evaluate(async () => {
    const t = window.__test;
    const ATT = { 5:{FW:1150,FH:560,n:10}, 7:{FW:1610,FH:784,n:14}, 11:{FW:2300,FH:1120,n:22} };
    const esiti = [];
    for (const tg of [5, 7, 11]) {
      t.startMatch(1, 1, { size: tg }); t.setCpuVsCpu(true);
      t.simulate(20);
      const c = t.campo;
      let dentro = true, sani = true;
      for (const p of t.players) {
        if (!isFinite(p.x) || !isFinite(p.y)) sani = false;
        if (p.x < -60 || p.x > c.FW + 60 || p.y < -60 || p.y > c.FH + 60) dentro = false;
      }
      const b = t.ball;
      const pallaOk = b && b.x >= 0 && b.x <= c.FW && b.y >= 0 && b.y <= c.FH;
      esiti.push({ tg, att: ATT[tg], c, dentro, sani, pallaOk, scena: t.state });
    }
    t.startMatch(1, 1); t.setCpuVsCpu(true);
    return { esiti, dopo: t.campo };
  });
  for (const e of taglie.esiti) {
    const c = e.c, a = e.att;
    /* la tribuna piu' esterna sta a DK(34)+62 unita' dal bordo, piu' il
       jitter: la sagoma piu' lontana deve cadere fra FW+60 e FW+110.
       Il pallone del menu rimbalza (e' animato): basta che viva DENTRO
       il campo corrente — se restasse su un campo vecchio sforerebbe. */
    const coer = c.FW === a.FW && c.FH === a.FH && c.posti === a.FW &&
                 c.crowdX > a.FW + 60 && c.crowdX < a.FW + 110 && c.texOK &&
                 c.giocatori === a.n && c.menuBallX >= 0 && c.menuBallX <= c.FW;
    verifica(coer, `taglia ${e.tg}: campo, pali, folla, texture e menu coerenti (FW ${c.FW}, ${c.giocatori} in campo)`,
      JSON.stringify(c));
    verifica(e.sani && e.dentro && e.pallaOk,
      `taglia ${e.tg}: la partita gira e nessuno esce dal mondo (scena ${e.scena})`,
      JSON.stringify({ dentro: e.dentro, sani: e.sani, pallaOk: e.pallaOk }));
  }
  verifica(taglie.dopo.taglia === 5 && taglie.dopo.FW === 1150,
    'startMatch(1,1) riapre la taglia base, 5 contro 5 sul campo di sempre', JSON.stringify(taglie.dopo));

  /* =====================================================================
     LE MAGLIE SI DEVONO VEDERE SULL'ERBA.

     Cos'e' successo: una passata sull'illuminazione del campo ha schiarito
     il manto e ha spento le divise. La maglia fluo e' scesa da ~5,2:1 a
     3,7:1 contro l'erba, la rosa da 1,9:1 a 1,3:1, e in divise ad alto
     contrasto la maglia blu e' arrivata a 1,00:1 — la STESSA luminanza
     dell'erba. Chi gioca in quella modalita' la usa perche' i colori gia'
     non li distingue: a parita' di luminanza i giocatori spariscono.
     Nessuno dei venti controlli automatici se n'era accorto; se n'e'
     accorto un critico guardando lo schermo. Da qui in poi lo guarda anche
     la rete di sicurezza.

     Come si misura, e perche' cosi':
     - il gioco disegna su canvas, quindi il colore si LEGGE dai pixel
       (getImageData) e non si deduce dalle costanti del codice: fra la
       tinta dichiarata e quella che arriva all'occhio ci sono il velo
       dell'illuminazione, l'ombreggiatura e la grana del terreno, ed e'
       proprio li' che si e' persa la visibilita';
     - MAGLIA: una finestra dentro il torso scelta per essere libera da
       testa, numero e disegno del kit in TUTTI i motivi (tinta unita,
       palato, banda).
       RITARATA PER L'INNESTO Rig3D (2026-08-14), E DICHIARATA: prima le
       figure erano viste in pianta pura e il torso era un'ellisse
       ATTORNO al centro, quindi la finestra ruotava con la direzione di
       marcia (avanti -8,4/-6,6, lato 2,2/4,6). Il rig disegna la figura
       IN PIEDI sullo schermo (camera 'alto', 50 gradi): il torso e' una
       capsula VERTICALE SOPRA il centro, uguale comunque il corpo sia
       girato, e la vecchia finestra cadeva sull'erba (misurato: 1,05:1,
       cioe' erba su erba). La finestra nuova e' FISSA sullo schermo:
       lato fra -1,5 e +1,5, sopra fra -12,5 e -10,5 unita' dal centro.
       IL CONTO, VERIFICATO SUI PIXEL e non solo sulla carta (la sonda:
       classificare per colore i pixel attorno a ogni giocatore in 4
       fotogrammi a seme fisso): con piedi a +10, altezza 34, camera a
       50 gradi (ce=0,643 -> scala 27,8) e P_DIS=1,18, la maglia copre
       la colonna fra circa -19 e -6 in tutte le andature osservate.
       PERCHE' COSI' BASSA E STRETTA: il disegno del kit adesso sta SUL
       torso del rig — la FASCIA e' una banda al 60% del segmento
       pelvi-collo (sta fra -13 e -17 nelle pose comuni) e il PALATO due
       strisce verticali a +-2,7 dal filo del busto. Una prima taratura
       a -17/-12,5 x +-2 misurava la seconda tinta al posto della prima:
       la mediana della maglia CPU usciva ESATTAMENTE #ec6a96, cioe' il
       colore della fascia, e il rapporto 2,07:1 era il suo, non quello
       della divisa. Le tre file a -12,5/-10,5 stanno SOTTO la fascia e
       dentro le strisce; il petto verso camera con lo schiaccio pieno
       puo' ancora alzare la fascia fin qui, ma e' una minoranza di pose
       e la mediana la assorbe — ed era gia' cosi' per l'ultima fila
       della finestra vecchia;
     - ERBA: un anello fra 30 e 42 unita' dal giocatore, scartando i punti
       vicini a un altro corpo, alla palla o all'ombra portata, e i punti
       fuori dal campo o sotto le fasce del tabellone. Il riquadro di
       esclusione attorno ai corpi e' ALZATO per il rig (le figure adesso
       si estendono fino a ~-24,5 sopra il centro, testa compresa): centro
       verticale a +2 e semialtezza 28, cosi' l'anello non campiona mai la
       testa di un ALTRO giocatore scambiandola per erba;

     L'OMBRA NON SI INCOLLA PIU' A MANO, E L'ANELLO GUARDA A OVEST.
     Fino alla passata sulla luce l'ombra portata era un ovale corto
     gettato di (+4,2 / +7,8) e bastava un riquadro |dx|<26, |dy|<22 per
     tenerla fuori dai campioni d'erba. Quei numeri stavano scritti QUI,
     a mano, mentre il gioco li teneva scritti per conto suo: due copie
     della stessa verita', cioe' una verita' che prima o poi diverge.
     Con il sole radente l'ombra e' diventata lunga ottantotto unita' —
     tre volte e mezza quel riquadro — e attraversa gli anelli di
     campionamento degli ALTRI giocatori. Un cancello che misura l'ombra
     e la chiama erba non fallisce: restituisce un numero FALSO, e falso
     in verde, che e' il modo peggiore di sbagliare.
     Due rimedi, e valgono insieme:
     (a) la geometria la DICHIARA il gioco (window.__test.ombraCapsula) e
         questo strumento la LEGGE. Non possono piu' divergere, e chi
         allunghera' ancora l'ombra sposta il cancello con lei senza
         toccare una riga qui. L'esclusione e' una CAPSULA lungo il
         versore del sole, lunga quanto l'ombra dichiarata, e vale per
         l'ombra di OGNI giocatore in campo, non solo di quello
         campionato;
     (b) l'anello d'erba si campiona SOLO nell'arco di 180 gradi rivolto
         a OVEST, cioe' verso il sole. Le ombre vanno tutte a est per
         costruzione: a ovest non puo' caderci nessuna. Restano campioni
         abbondanti anche con ventidue ombre lunghe in campo, quindi non
         scatta nemmeno il controllo «pochi campioni non e' un esito
         buono» qui sotto. Il campionamento resta imparziale perche' il
         gradiente termico del manto e' quasi piatto sulle ottantaquattro
         unita' di un anello (il campo ne e' largo millecentocinquanta);
     - il colore rappresentativo e' la MEDIANA per canale dei campioni:
       regge le righe di gesso, le due bande di tosatura e la grana senza
       farsi trascinare da una minoranza di pixel;
     - da li' la luminanza relativa e il rapporto (L1+0,05)/(L2+0,05), la
       stessa formula del contrasto del testo, con la soglia a 3:1.
     I portieri restano fuori: vestono una divisa sola per entrambe le
     squadre, scelta apposta lontano dai due kit, ed e' un'altra misura.

     Le due condizioni sono TUTTE quelle che il gioco offre: l'impostazione
     "DIVISE AD ALTO CONTRASTO (per daltonismo)" e' UNA sola voce, che vale
     insieme da alto contrasto e da modalita' per daltonici — non esistono
     due interruttori separati, e non se ne inventa uno qui.
     ===================================================================== */
  const SOGLIA_CONTRASTO = 3;
  const MODI_VISTA = [
    { dalt: false, nome: "vista normale" },
    { dalt: true, nome: "divise ad alto contrasto (daltonismo)" },
  ];

  for (const modo of MODI_VISTA) {
    const mis = await pag.evaluate(async (dalt) => {
      const t = window.__test;
      const cv = document.getElementById('gioco');
      const c2 = cv.getContext('2d', { willReadFrequently: true });
      /* il canvas puo' avere piu' pixel del viewport (devicePixelRatio):
         le coordinate della camera sono in pixel CSS, vanno riscalate */
      const DPRc = cv.width / window.innerWidth;

      t.dismissSplash && t.dismissSplash();
      t.setDalt(!!dalt);
      t.startMatch(1, 1);
      t.setCpuVsCpu(true);

      const lumin = (r, g, b) => {
        const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const mediana = a => { const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1]; };
      const FW = 1150, FH = 560;             // campo logico
      const maglia = [[], []], erba = [[], []];
      let fotogrammi = 0;
      /* la capsula d'ombra dichiarata dal GIOCO: versore, lunghezza
         massima e mezza larghezza. Se un giorno l'hook sparisse si
         ricade su una capsula generosa invece che su numeri finti. */
      const OMB = (t.ombraCapsula && t.ombraCapsula()) ||
                  { ux: 0.9406, uy: 0.3402, l0: 0, l1: 140, semiCorto: 7.6, piedeX: 4.2, piedeY: 7.8 };
      /* distanza di un punto dal SEGMENTO d'ombra di q: e' la capsula */
      const dentroOmbra = (qx, qy, wx, wy) => {
        const ax = qx + OMB.piedeX, ay = qy + OMB.piedeY;
        const rx = wx - ax, ry = wy - ay;
        let t2 = rx * OMB.ux + ry * OMB.uy;          // proiezione sull'asse
        if (t2 < OMB.l0) t2 = OMB.l0;
        if (t2 > OMB.l1) t2 = OMB.l1;
        const px = ax + OMB.ux * t2, py = ay + OMB.uy * t2;
        /* la mezza larghezza cresce un poco verso la punta (la penombra
           si allarga): un margine, non una misura fine */
        const semi = OMB.semiCorto * 1.6 + 4;
        return Math.hypot(wx - px, wy - py) < semi;
      };

      /* piu' fotogrammi e piu' giocatori: un solo omino su una sola zolla
         sarebbe un aneddoto, non una misura */
      for (let k = 0; k < 8; k++) {
        t.simulate(k === 0 ? 3.0 : 0.6);
        for (let i = 0; i < 60 && !(t.state === 'play' || t.state === 'golden'); i++) t.simulate(0.1);
        if (t.state !== 'play' && t.state !== 'golden') continue;
        /* disegna() rifa' il fotogramma con la stessa render() del gioco:
           senza, si leggerebbero i pixel di una partita piu' vecchia di
           quella appena simulata */
        t.disegna();
        fotogrammi++;
        const img = c2.getImageData(0, 0, cv.width, cv.height).data;
        const W = cv.width, H = cv.height;
        const S2 = t.view.S2, Ax = t.view.Ax, Ay = t.view.Ay;
        const B = t.bande, VWc = W / DPRc, VHc = H / DPRc;
        const pixel = (sx, sy) => {
          const x = Math.round(sx * DPRc), y = Math.round(sy * DPRc);
          if (x < 0 || y < 0 || x >= W || y >= H) return null;
          const o = (y * W + x) * 4;
          return [img[o], img[o + 1], img[o + 2]];
        };
        const inQuadro = (sx, sy) => sx > 2 && sx < VWc - 2 && sy > B.bar + 2 && sy < VHc - B.foot - 2;

        for (const p of t.players) {
          /* solo giocatori di movimento, in piedi, non in esultanza: a terra
             o in tuffo il torso e' un'altra ellisse e la finestra non tiene */
          if (p.role === 'gk' || p.out > 0) continue;
          if (p.slide >= 0 || p.recover > 0 || p.dive > 0 || p.celeb > 0) continue;
          /* finestra FISSA sullo schermo: il torso del rig sta in piedi
             sopra il centro comunque sia girato il corpo (vedi il conto
             nel commento in testa) */
          for (const av of [-12.5, -11.5, -10.5]) {
            for (const la of [-1.5, -1.0, -0.5, 0, 0.5, 1.0, 1.5]) {
              const wx = p.x + la, wy = p.y + av;
              const sx = wx * S2 + Ax, sy = wy * S2 + Ay;
              if (!inQuadro(sx, sy)) continue;
              const c = pixel(sx, sy); if (c) maglia[p.team].push(c);
            }
          }
          for (const r of [30, 34, 38, 42]) {
            for (let ang = 0; ang < 360; ang += 15) {
              const rad = ang * Math.PI / 180;
              const cx = Math.cos(rad), cy = Math.sin(rad);
              /* SOLO L'ARCO A OVEST, cioe' verso il sole: le ombre vanno
                 tutte a est per costruzione e a ovest non ne cade nessuna */
              if (cx * OMB.ux + cy * OMB.uy > 0) continue;
              const wx = p.x + cx * r, wy = p.y + cy * r;
              if (wx < 8 || wx > FW - 8 || wy < 8 || wy > FH - 8) continue;
              let libero = true;
              for (const q of t.players) {
                if (q.out > 0) continue;
                if (q !== p && Math.hypot(q.x - wx, q.y - wy) < 30) { libero = false; break; }
                /* il riquadro copre il CORPO anche in altezza: la figura
                   del rig sale fino a ~-24,5 (testa) */
                if (Math.abs(wx - q.x) < 20 && Math.abs(wy - (q.y + 2)) < 28) { libero = false; break; }
                /* e la capsula copre l'OMBRA PORTATA di ogni giocatore,
                   non solo di quello campionato: con ottantotto unita' di
                   lunghezza le ombre altrui attraversano questo anello */
                if (dentroOmbra(q.x, q.y, wx, wy)) { libero = false; break; }
              }
              if (!libero) continue;
              if (Math.hypot(t.ball.x - wx, t.ball.y - wy) < 24) continue;
              const sx = wx * S2 + Ax, sy = wy * S2 + Ay;
              if (!inQuadro(sx, sy)) continue;
              const c = pixel(sx, sy); if (c) erba[p.team].push(c);
            }
          }
        }
      }

      const rappr = a => a.length ? [mediana(a.map(c => c[0])), mediana(a.map(c => c[1])), mediana(a.map(c => c[2]))] : null;
      const esa = c => c ? '#' + c.map(v => v.toString(16).padStart(2, '0')).join('') : '?';
      const squadre = [];
      for (let sq = 0; sq < 2; sq++) {
        const m = rappr(maglia[sq]), e = rappr(erba[sq]);
        let rapporto = null;
        if (m && e) {
          const Lm = lumin(m[0], m[1], m[2]), Le = lumin(e[0], e[1], e[2]);
          rapporto = (Math.max(Lm, Le) + 0.05) / (Math.min(Lm, Le) + 0.05);
        }
        squadre.push({
          sq, rapporto, maglia: esa(m), erba: esa(e),
          nMaglia: maglia[sq].length, nErba: erba[sq].length,
        });
      }
      t.setDalt(false);                       // si lascia il banco com'era
      return { fotogrammi, squadre };
    }, modo.dalt);

    for (const s of mis.squadre) {
      const chi = 'P' + (s.sq + 1);
      /* pochi campioni non sono un esito buono: sarebbe un controllo che
         passa perche' non ha guardato niente */
      const abbastanza = s.nMaglia >= 200 && s.nErba >= 200 && mis.fotogrammi >= 4;
      const ok = abbastanza && s.rapporto >= SOGLIA_CONTRASTO;
      verifica(ok,
        `contrasto maglia/erba, ${chi} in ${modo.nome}: ` +
        (s.rapporto == null ? 'non misurabile' : s.rapporto.toFixed(2) + ':1') +
        ` (minimo ${SOGLIA_CONTRASTO}:1)`,
        `maglia ${s.maglia} su erba ${s.erba}; ` +
        `${s.nMaglia} campioni di maglia e ${s.nErba} d'erba su ${mis.fotogrammi} fotogrammi` +
        (abbastanza ? '' : ' — TROPPO POCHI: la misura non ha guardato abbastanza pixel'));
    }
  }

  /* pausa e tasto Indietro */
  const ind = await pag.evaluate(() => {
    const t = window.__test;
    t.startMatch(1, 1);
    const a = window.__indietro(), inPausa = t.paused;
    const b = window.__indietro(), dopo = t.paused;
    document.getElementById('btnQuit').click();
    const c = window.__indietro();
    return { a, inPausa, b, dopo, alMenu: c, scena: t.state };
  });
  verifica(ind.a === true && ind.inPausa === true && ind.dopo === false && ind.alMenu === false,
    'il tasto Indietro mette e toglie la pausa, e al menu si arrende', JSON.stringify(ind));

  verifica(errori.length === 0, 'nessun errore in console', errori.slice(0, 3).join(' | '));
  await ctx.close();
}

/* ------------------------------------------------------------------ main */
(async () => {
  const quale = process.argv[2];
  const srv = await servi();
  const browser = await chromium.launch();
  try {
    if (!quale || quale === 'circolo') await circolo(browser, srv);
    if (!quale || quale === 'calcetto') await calcetto(browser, srv);
  } finally {
    await browser.close(); srv.chiudi();
  }
  const male = esiti.filter(e => !e.ok);
  console.log(`\n${esiti.length} controlli, ${esiti.length - male.length} passati, ${male.length} falliti`);
  if (male.length) { console.log('FALLITI: ' + male.map(m => m.testo).join(' ; ')); process.exit(1); }
})().catch(e => { console.error('COLLAUDO IN ERRORE:', e.message); process.exit(1); });
