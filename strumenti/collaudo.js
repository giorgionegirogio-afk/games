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
  console.log((ok ? '  OK   ' : '  NO   ') + testo + (ok || !dettaglio ? '' : '\n         ' + dettaglio));
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
       testa, disco del numero e disegno del kit in TUTTI i motivi (tinta
       unita, palato, banda). In coordinate del giocatore ruotate sulla
       direzione di marcia: avanti fra -8,4 e -6,6 unita', lato fra 2,2 e
       4,6 in valore assoluto.
       LA FINESTRA E' ARRETRATA (era -5,4 / -3,6) PERCHE' CAMPIONAVA LA
       TESTA. Il punto piu' interno stava a 4,2 unita' dal centro; la
       calotta ha raggio 4,5, il suo velo d'ombra arriva a ~5,4, e con la
       figura disegnata a P_DIS=1,18 tutto cio' cresce fino a ~6,4. In
       posa ferma la mediana reggeva; su un giocatore che gira o carica la
       finestra scivolava sulla calotta scura e misurava i capelli, non la
       maglia — mediane da 0,42x della tinta vera, verificato ritagliando
       il canvas nel fotogramma incriminato. Con la camera avvicinata i
       giocatori inquadrati sono soprattutto quelli sul pallone (che
       girano di continuo) e il dado usciva sbagliato una volta su tre.
       A -8,4/-6,6 la finestra sta oltre il velo della testa (r minima
       7,1 > 6,4) e dentro il busto (semiasse 12,4 x P_DIS = 14,6) anche
       con lo schiacciamento al massimo; l'ultima fila puo' sfiorare il
       blocco della seconda tinta del kit, che e' comunque maglia e la
       mediana lo assorbe;
     - ERBA: un anello fra 30 e 42 unita' dal giocatore, scartando i punti
       vicini a un altro corpo, alla palla o all'ombra portata (che cade
       in basso a destra, +4,2/+7,8) e i punti fuori dal campo o sotto le
       fasce del tabellone;
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
          const a = Math.atan2(p.fy, p.fx), ca = Math.cos(a), sa = Math.sin(a);
          for (const av of [-8.4, -7.8, -7.2, -6.6]) {
            for (const la of [-4.6, -4.0, -3.4, -2.8, -2.2, 2.2, 2.8, 3.4, 4.0, 4.6]) {
              const wx = p.x + av * ca - la * sa, wy = p.y + av * sa + la * ca;
              const sx = wx * S2 + Ax, sy = wy * S2 + Ay;
              if (!inQuadro(sx, sy)) continue;
              const c = pixel(sx, sy); if (c) maglia[p.team].push(c);
            }
          }
          for (const r of [30, 34, 38, 42]) {
            for (let ang = 0; ang < 360; ang += 15) {
              const rad = ang * Math.PI / 180;
              const wx = p.x + Math.cos(rad) * r, wy = p.y + Math.sin(rad) * r;
              if (wx < 8 || wx > FW - 8 || wy < 8 || wy > FH - 8) continue;
              let libero = true;
              for (const q of t.players) {
                if (q.out > 0) continue;
                if (q !== p && Math.hypot(q.x - wx, q.y - wy) < 30) { libero = false; break; }
                if (Math.abs(wx - (q.x + 4.2)) < 26 && Math.abs(wy - (q.y + 7.8)) < 22) { libero = false; break; }
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
