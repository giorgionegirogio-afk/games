/* =====================================================================
   SCATTA — mette in posa i due giochi e li fotografa.

   Serve perche' un giudizio visivo va dato su un'immagine, non su una
   descrizione, e perche' piu' revisori devono poter guardare le stesse
   identiche scene senza pestarsi i piedi: ogni invocazione apre il proprio
   browser e il proprio server su una porta libera, quindi se ne possono
   lanciare quante se ne vuole in parallelo.

   uso:
     node strumenti/scatta.js --scena circolo/menu --out foto/x.png
     node strumenti/scatta.js --tutte circolo --dir foto/
     node strumenti/scatta.js --elenco
     node strumenti/scatta.js --scena calcetto/azione --out x.png --w 2340 --h 1080 --dpr 1

   Le scene si mettono in posa con gli hook window.__test dei due giochi,
   non a forza di clic.

   RIPRODUCIBILITA'. Questo commento diceva "cosi' la stessa scena viene
   identica ogni volta" e NON ERA VERO: le scene che avviano una partita
   vera pescavano una smazzata e un avversario diversi a ogni esecuzione.
   Rieseguendo lo stesso identico codice il confronto prima/dopo cambiava
   dell'11-41 per cento su nove scene su ventisei, cioe' il rumore era pari
   o superiore al segnale e quei confronti non dicevano niente. Adesso il
   caso e' governato: prima che la pagina esegua una sola riga si sostituisce
   Math.random con un generatore a seme fisso (--seme per cambiarlo), quindi
   smazzata, avversario, coriandoli e ogni altra scelta casuale sono le
   stesse a ogni scatto. Chi confronta due immagini vede solo cio' che e'
   cambiato davvero nel codice.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');

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

/* ------------------------------------------------------- misure standard */
const TELEFONO_V = { w: 412, h: 915, dpr: 2 };      // telefono in verticale
const TELEFONO_O = { w: 915, h: 412, dpr: 2 };      // telefono in orizzontale
const TABLET_V = { w: 834, h: 1112, dpr: 2 };
const TABLET_O = { w: 1112, h: 834, dpr: 2 };
const STRETTO_V = { w: 360, h: 640, dpr: 2 };        // il telefono piccolo che tutti dimenticano
const LUNGO_O = { w: 960, h: 400, dpr: 2 };         // 21:9, i telefoni di oggi

/* ============================================================== SCENE ====
   Ogni scena: dove sta, che misura, cosa fare nella pagina, quanto aspettare.
   `prepara` gira dentro la pagina; puo' essere asincrona.
   ======================================================================= */
const A = {};   // scorciatoia per costruire le scene

/* ---------------------------------------------------------- CIRCOLO ---- */
const CIRCOLO = 'CIRCOLO-il-gioco.html';
const C = (nome, vista, prepara, attesa) =>
  (A['circolo/' + nome] = { file: CIRCOLO, vista, prepara, attesa: attesa || 900 });

C('menu', TELEFONO_V, `null`);
C('menu-stretto', STRETTO_V, `null`);
C('menu-tablet', TABLET_V, `null`);

/* un tavolo di scopa messo in posa a mano: mano interessante, tavolo ricco */
const TAVOLO_SCOPA = `window.__test.setupScenario({
  gioco:'scopa', mode:'cpu',
  hands:[[{s:'denari',v:7},{s:'spade',v:1},{s:'bastoni',v:10}],
         [{s:'coppe',v:3},{s:'spade',v:5},{s:'denari',v:9}]],
  table:[{s:'coppe',v:7},{s:'bastoni',v:4},{s:'spade',v:3},{s:'denari',v:1}],
  deck:[{s:'coppe',v:2},{s:'bastoni',v:6},{s:'spade',v:8},{s:'denari',v:5},
        {s:'coppe',v:10},{s:'bastoni',v:9}],
  prese:[[{s:'coppe',v:1},{s:'spade',v:7},{s:'bastoni',v:1}],
         [{s:'denari',v:2},{s:'coppe',v:5}]],
  scope:[1,0], matchScore:[4,2], turn:0 })`;

C('scopa-tavolo', TELEFONO_V, TAVOLO_SCOPA);
C('scopa-tavolo-stretto', STRETTO_V, TAVOLO_SCOPA);
C('scopa-tavolo-tablet', TABLET_V, TAVOLO_SCOPA);

/* il momento della scelta: una carta che puo' prendere in piu' modi */
C('scopa-scelta', TELEFONO_V, `
  window.__test.setupScenario({
    gioco:'scopa', mode:'cpu',
    hands:[[{s:'denari',v:7},{s:'spade',v:2},{s:'bastoni',v:10}],
           [{s:'coppe',v:3},{s:'spade',v:5},{s:'denari',v:9}]],
    table:[{s:'coppe',v:7},{s:'bastoni',v:4},{s:'spade',v:3},{s:'denari',v:5},{s:'coppe',v:2}],
    deck:[{s:'bastoni',v:6},{s:'spade',v:8}], prese:[[],[]], turn:0 });
  window.__test.playCard(0);`, 1100);

C('scopa-presa', TELEFONO_V, TAVOLO_SCOPA + `; window.__test.playCard(0);`, 1300);

/* Scopone e Briscola a coppie NON sono giochi a se': sono scopa e briscola
   al tavolo di quattro. Chiamarli con un nome inventato dava una partita
   fantasma che non finiva mai. */
C('scopone', TELEFONO_V, `window.__test.startGame('scopa','cpu',{giocatori:4})`, 1500);
C('scopone-tablet', TABLET_V, `window.__test.startGame('scopa','cpu',{giocatori:4})`, 1500);
C('briscola', TELEFONO_V, `window.__test.startGame('briscola','cpu')`, 1400);
C('briscola-coppie', TELEFONO_V, `window.__test.startGame('briscola','cpu',{giocatori:4})`, 1500);
C('briscola-stretto', STRETTO_V, `window.__test.startGame('briscola','cpu')`, 1400);

/* Il conteggio va fotografato DOPO una smazzata vera: messo in posa con due
   carte in mano e nessuna presa dava un foglio di calcolo azzerato — 0 a 0,
   Carte 0 0, Settebello — — — e nessuno vedeva il difetto vero, che è come si
   legge un conteggio pieno. */
C('conteggio', TELEFONO_V, `
  window.__test.startGame('scopa','cpu');
  window.__test.autoplayRound();`, 1600);

C('fine', TELEFONO_V, `window.__test.startGame('scopa','cpu'); window.__test.winCurrentGame();`, 1800);

C('trofei', TELEFONO_V, `document.getElementById('btn-trofei').click()`);
C('statistiche', TELEFONO_V, `document.getElementById('btn-stats').click()`);

/* Trofei e statistiche a bacheca VUOTA dicono poco: queste due scene le
   guardano con un po' di storia alle spalle, che e' come le vede chi gioca
   davvero da qualche settimana. */
const STORIA = `
  localStorage.setItem('circolo_stats_v3', JSON.stringify({
    scopa:{giocate:18,vinte:11,scope:37,settebelli:9},
    briscola:{giocate:12,vinte:7,sommaPunti:874,mani:14},
    tornei:{giocati:2,vinti:1}, albo:[],
    ach:{prima_vittoria:1,prima_scopa:1,tre_scope:1,cento:1},
    setteFila:1, vitEsperto:3, sbloccoMazzi:false,
    ultime:[1,0,1,1,0,1,1,1,0,1] }));
  window.caricaMemoria();`;
C('statistiche-piene', TELEFONO_V, STORIA + `window.apriStatistiche();`);
C('trofei-parziali', TELEFONO_V, STORIA + `window.apriTrofei();`);
C('impostazioni', TELEFONO_V, `document.getElementById('btn-impostazioni').click()`);
C('regole', TELEFONO_V, `document.getElementById('btn-regole') && document.getElementById('btn-regole').click()`);
/* Il tavolino delle figure: le dodici carte vestite tutte insieme, a misura
   grande. Serve per controllare a occhio che ogni figura di ogni seme sia un
   disegno diverso e che l'oggetto del seme si riconosca. */
C('figure', TABLET_V, `
  const s=document.getElementById('screen-menu');
  s.innerHTML = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:12px;width:100%">'+
    [8,9,10].map(v=>['denari','coppe','spade','bastoni'].map(se=>
      '<div style="width:100%">'+window.cartaSVG({s:se,v:v,id:se+v})+'</div>').join('')).join('')+
    '</div>';
  s.style.padding='0'; s.style.display='block'; s.style.overflow='hidden';`);

/* Accessibilita': ogni effetto nuovo deve spegnersi (movimento ridotto) o
   lasciare spazio alle scritte (testo grande). Due scene per controllarlo
   guardando, non fidandosi. */
C('scopa-testo-grande', TELEFONO_V, `
  PREFS.testo=130; applicaComfort();
  ` + TAVOLO_SCOPA, 1100);
C('scopa-moto-ridotto', TELEFONO_V, `
  PREFS.menoMovimento=true; applicaComfort();
  ` + TAVOLO_SCOPA + `; window.__test.playCard(0);`, 1400);

C('torneo', TELEFONO_V, `window.__test.startTournament('scopa','8')`, 1200);
C('riprendi', TELEFONO_V, TAVOLO_SCOPA + `; window.__indietro();`, 1200);

/* --------------------------------------------------------- CALCETTO ---- */
/* CALCETTO disegna su canvas dentro un ciclo requestAnimationFrame che
   avanza con l'orologio: fra la posa della scena e lo scatto passava un
   numero di fotogrammi che dipendeva da quanto era carico il computer, e
   il pallone e i giocatori si erano spostati. Misurato: 5 scene stabili
   su 25 — su venti scene su venticinque, chi vedeva una differenza fra
   due immagini stava guardando il caso, non una modifica.
   Rimedio: `banco:true` accende in pagina l'orologio a passo fisso qui
   sotto (bancoDiProva) e da quel momento il tempo del gioco lo fa
   avanzare questo file, un fotogramma alla volta. Le attese in millisecondi
   restano scritte in millisecondi — si convertono in fotogrammi a 60 Hz —
   cosi' le scene mostrano esattamente la stessa cosa di prima. */
const CALCETTO = 'CALCETTO-il-gioco.html';
const K = (nome, vista, prepara, attesa) =>
  (A['calcetto/' + nome] = { file: CALCETTO, vista, prepara, attesa: attesa || 900, banco: true });

/* millisecondi di gioco -> fotogrammi a passo fisso. Sostituisce le attese
   `await new Promise(r=>setTimeout(r,N))`: stessa quantita' di partita, ma
   contata in fotogrammi invece che sull'orologio del computer. */
const F = ms => `window.__banco.passo(${Math.round(ms * 0.06)});`;

const VIA = `window.__test.dismissSplash && window.__test.dismissSplash();`;

K('menu', TELEFONO_O, VIA);
K('menu-lungo', LUNGO_O, VIA);
K('menu-tablet', TABLET_O, VIA);

/* qualche secondo di partita vera, poi si ferma sul fotogramma */
/* Una scena d'AZIONE deve inquadrare l'azione. Se nel frattempo e' arrivato
   un gol, allo scadere dell'attesa si e' in mezzo alla celebrazione o alla
   moviola: si aspetta il ritorno in gioco prima di scattare, se no la
   fotografia dell'azione tarda diventa la fotografia di un replay. */
/* Il tempo si fa avanzare a passo fisso con __test.simulate, non aspettando
   l'orologio: aspettando, la stessa scena dava una posizione di palla diversa
   a ogni scatto e il confronto prima/dopo misurava il tremolio invece della
   modifica. Con simulate la partita e' identica a ogni esecuzione. */
/* `size` sceglie la taglia di rosa (5/7/11). Quando manca, la chiamata resta
   la nuda startMatch(1,1) di sempre: stessa stringa, stesse scene al bit. */
const AZIONE = (sec, extra, size) => VIA + `
  window.__test.startMatch(1,1${size ? `,{size:${size}}` : ''});
  window.__test.setCpuVsCpu && window.__test.setCpuVsCpu(true);
  window.__test.simulate(${(sec / 1000).toFixed(2)});
  for(let i=0;i<90;i++){
    const s=window.__test.state;
    if((s==='play'||s==='golden') && !window.__test.moviola) break;
    window.__test.simulate(0.12);
  }
  ${extra || ''}
  window.__test.setPaused && window.__test.setPaused(false);`;

K('kickoff', TELEFONO_O, VIA + `window.__test.startMatch(1,1);`, 1200);
K('azione', TELEFONO_O, AZIONE(5000), 300);
K('azione-lungo', LUNGO_O, AZIONE(5000), 300);
K('azione-tablet', TABLET_O, AZIONE(5000), 300);
K('azione-tarda', TELEFONO_O, AZIONE(12000), 300);

/* LE TAGLIE NUOVE, FOTOGRAFATE. Il 7v7 e l'11v11 esistono solo se si
   vedono: il kickoff mostra il modulo schierato (1-3-3 e 1-4-4-2), l'azione
   mostra campo, porte e minimappa alla taglia grande. Il 5v5 resta la
   chiamata nuda di sempre e non ha bisogno di un doppione. */
K('kickoff-7v7', TELEFONO_O, VIA + `window.__test.startMatch(1,1,{size:7});`, 1200);
K('azione-7v7', TELEFONO_O, AZIONE(5000, '', 7), 300);
K('kickoff-11v11', TELEFONO_O, VIA + `window.__test.startMatch(1,1,{size:11});`, 1200);
K('azione-11v11', TELEFONO_O, AZIONE(5000, '', 11), 300);

K('gol', TELEFONO_O, VIA + `
  window.__test.startMatch(1,1);
  window.__test.setCpuVsCpu && window.__test.setCpuVsCpu(true);
  ` + F(1500) + `
  window.__test.forceGoal(0);
  ` + F(900), 300);

K('moviola', TELEFONO_O, VIA + `
  window.__test.startMatch(1,1);
  window.__test.setCpuVsCpu && window.__test.setCpuVsCpu(true);
  ` + F(3000) + `
  window.__test.forceGoal(0);
  ` + F(2200), 300);

K('rigori', TELEFONO_O, VIA + `
  window.__test.startMatch(1,1);
  window.__test.rigori && window.__test.rigori();
  ` + F(1400), 300);

/* la serie a meta': serve a vedere il tabellone dei tiri, non lo
   striscione d'apertura. Senza questa scena i rigori restavano una
   modalita' che non aveva mai guardato nessuno. */
K('rigori-serie', TELEFONO_O, VIA + `
  window.__test.startMatch(1,1);
  window.__test.setCpuVsCpu && window.__test.setCpuVsCpu(true);
  window.__test.rigori && window.__test.rigori();
  ` + F(5200), 300);

K('pausa', TELEFONO_O, VIA + `
  window.__test.startMatch(1,1);
  ` + F(2500) + `
  window.__test.setPaused(true);`, 500);

/* Tre gol vanno INTERVALLATI. forceGoal accetta la rete solo in gioco, e
   dopo il primo gol la scena resta 'goal' per qualche secondo: chiamandolo
   tre volte di fila due gol finivano nel cestino e la schermata finale
   mostrava 1-0 con zero tiri e zero possesso — una squadra che vince
   senza mai toccare la palla. Qui si aspetta il ritorno in gioco. */
K('fine', TELEFONO_O, VIA + `
  window.__test.startMatch(1,1);
  window.__test.setCpuVsCpu && window.__test.setCpuVsCpu(true);
  const inGioco = () => {
    for(let i=0;i<80;i++){
      const s=window.__test.state;
      if(s==='play'||s==='kickoff'||s==='golden') return true;
      ` + F(120) + `
    }
    return false;
  };
  for(const t of [0,0,1]){
    inGioco();
    /* qualche secondo di gioco vero fra un gol e l'altro: se no la
       tabella finale mostra zero tiri e zero parate */
    ` + F(3400) + `
    window.__test.forceGoal(t);
  }
  inGioco();
  ` + F(1200) + `
  window.__test.setTimeLeft(0.6);
  ` + F(4000), 400);

/* accessibilita': gli effetti nuovi devono spegnersi quando il giocatore
   chiede movimento ridotto e divise ad alto contrasto. Una scena per
   ciascuna cosa, cosi' la regola si controlla guardando, non fidandosi. */
K('gol-moto-ridotto', TELEFONO_O, VIA + `
  window.__test.setMoto(false);
  window.__test.startMatch(1,1);
  window.__test.setCpuVsCpu && window.__test.setCpuVsCpu(true);
  ` + F(1500) + `
  window.__test.forceGoal(0);
  ` + F(900), 300);
K('azione-contrasto', TELEFONO_O, VIA + `
  window.__test.setDalt(true);
  window.__test.startMatch(1,1);
  window.__test.setCpuVsCpu && window.__test.setCpuVsCpu(true);
  ` + F(4000), 300);

K('gioca', TELEFONO_O, VIA + `document.getElementById('btnGioca').click()`);
K('campi', TELEFONO_O, VIA + `document.getElementById('btnCampi').click()`);
K('negozio', TELEFONO_O, VIA + `document.getElementById('btnNegozio').click()`);
K('squadra', TELEFONO_O, VIA + `document.getElementById('btnSquadra') ? document.getElementById('btnSquadra').click() : document.getElementById('btnRosa').click()`);
K('rosa', TELEFONO_O, VIA + `document.getElementById('btnRosa').click()`);
K('trofei', TELEFONO_O, VIA + `document.getElementById('btnTrofei').click()`);
K('statistiche', TELEFONO_O, VIA + `document.getElementById('btnStatsScr').click()`);
K('impostazioni', TELEFONO_O, VIA + `document.getElementById('btnImpost').click()`);
K('torneo', TELEFONO_O, VIA + `window.__test.newTournament && window.__test.newTournament(); document.getElementById('btnTorneo') && document.getElementById('btnTorneo').click();`, 1200);
K('istruzioni', TELEFONO_O, VIA + `document.getElementById('btnHow').click()`);

/* ====================================================== BANCO DI PROVA ===
   L'orologio del gioco, preso in mano.

   Un gioco che disegna dentro requestAnimationFrame avanza con l'orologio:
   fra la posa e lo scatto passano N fotogrammi, N dipende dal carico del
   computer, e la stessa scena esce diversa a ogni esecuzione. Qui rAF viene
   sostituito con una coda che NON parte da sola: i fotogrammi li fa scorrere
   __banco.passo(n), uno alla volta, con un passo di 1/60 di secondo esatto.
   Anche performance.now segue quel passo, cosi' il dt che il ciclo calcola
   e' sempre lo stesso numero e la fisica non sa piu' che ora e'.
   __banco.zitto() spegne la coda per sempre: da li' in poi sullo schermo
   resta l'ultimo fotogramma disegnato a mano.
   Va installato PRIMA di ogni riga della pagina, se no il ciclo e' gia'
   partito con l'orologio vero. ======================================== */
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

/* Le animazioni CSS in volo sono l'altra meta' del tremolio: metterle in
   'paused' le congela dove capita, cioe' in un punto che dipende
   dall'orologio. Qui, oltre a fermarle, ognuna viene portata a un istante
   FISSO: alla fine quelle che finiscono — una schermata gia' arrivata e'
   cio' che la scena vuole mostrare — e all'inizio del ciclo quelle
   infinite, per le quali un istante vale l'altro. */
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
    } catch (e) { /* un'animazione che non si lascia spostare non e' un motivo per non scattare */ }
  }
}

/* ================================================================= main = */
function argomenti() {
  const a = process.argv.slice(2), o = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith('--')) o[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : true;
  }
  return o;
}

async function scatta(browser, srv, nome, uscita, forza) {
  const s = A[nome];
  if (!s) throw new Error('scena sconosciuta: ' + nome);
  const v = {
    w: +(forza.w || s.vista.w), h: +(forza.h || s.vista.h),
    dpr: +(forza.dpr || s.vista.dpr),
  };
  const ctx = await browser.newContext({
    viewport: { width: v.w, height: v.h },
    deviceScaleFactor: v.dpr,
    isMobile: true, hasTouch: true,
    reducedMotion: 'no-preference',
    locale: 'it-IT',
  });
  const pag = await ctx.newPage();

  /* Il caso, governato. Va installato PRIMA che la pagina esegua qualsiasi
     riga, altrimenti la smazzata e l'avversario sono gia' stati pescati.
     xorshift32: due righe, nessuna dipendenza, sempre la stessa sequenza. */
  await pag.addInitScript(seme => {
    let s = seme >>> 0 || 1;
    const prossimo = () => {
      s ^= s << 13; s >>>= 0;
      s ^= s >>> 17;
      s ^= s << 5; s >>>= 0;
      return s >>> 0;
    };
    Math.random = () => prossimo() / 4294967296;
    /* CIRCOLO prende il seme della smazzata da crypto.getRandomValues, che
       Math.random non copre: va governato anche quello, altrimenti le carte
       cambiano a ogni scatto e il confronto prima/dopo non dice niente. */
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = prossimo(); return a; };
    }
  }, +(forza.seme || 20260728));

  /* l'orologio del gioco preso in mano: solo dove serve, e prima di tutto */
  if (s.banco) await pag.addInitScript(bancoDiProva);

  const errori = [];
  pag.on('console', m => { if (m.type() === 'error') errori.push(m.text()); });
  pag.on('pageerror', e => errori.push('ECCEZIONE: ' + e.message));

  await pag.goto(`http://127.0.0.1:${srv.porta}/${s.file}`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 15000 });
  /* mezzo secondo perche' caratteri, misure e immagini si posino. Col banco
     acceso questa attesa NON fa avanzare il gioco: il ciclo di disegno e'
     gia' in mano nostra e non gira finche' non lo si fa girare. */
  await pag.waitForTimeout(500);
  if (s.banco) await pag.evaluate(() => window.__banco.passo(30));

  if (s.prepara && s.prepara !== 'null') {
    await pag.evaluate(`(async () => { ${s.prepara} })()`);
  }

  if (s.banco) {
    /* La coda della scena, a passo fisso. L'attesa resta scritta in
       millisecondi ma si paga in fotogrammi, quindi la scena mostra la
       stessa cosa di prima senza piu' dipendere dal carico del computer. */
    await pag.evaluate(n => window.__banco.passo(n), Math.round(s.attesa * 0.06));
    /* Poi si aspetta che abbiano finito le cose che NON passano dal ciclo di
       disegno e vanno a timer del DOM: la transizione a bande fra una
       schermata e l'altra e lo splash che si dissolve. Col banco acceso
       questo tempo non muove ne' il pallone ne' la camera — il canvas e'
       gia' fermo — quindi non rimette in gioco il caso.
       SI ASPETTA LA CONDIZIONE, NON L'OROLOGIO: con un'attesa a
       millisecondi fissi capitava che i fotogrammi a passo fisso tenessero
       occupato il thread della pagina, i timer slittassero, e allo scatto
       le bande fossero ancora in mezzo allo schermo — una fotografia
       coperta non mostra niente, ripetibile o no. */
    try {
      await pag.waitForFunction(() => {
        const w = document.getElementById('wipe');
        if (w && getComputedStyle(w).display !== 'none') return false;
        return document.getAnimations().every(a => {
          const c = a.effect && a.effect.getComputedTiming ? a.effect.getComputedTiming() : null;
          return !c || c.iterations === Infinity || !isFinite(c.endTime) || a.playState === 'finished';
        });
      }, null, { polling: 80, timeout: 12000 });
    } catch (e) {
      /* una scena che non si posa non e' un motivo per non scattare: la si
         fotografa lo stesso, e sara' l'elenco delle mobili a dirlo */
    }
    await pag.evaluate(congelaAnimazioni);
    /* si zittisce il ciclo e si disegna UN fotogramma a mano: dopo
       simulate() lo stato e' avanzato ma sullo schermo c'e' ancora il
       fotogramma vecchio, e la fotografia mostrerebbe una partita diversa
       da quella simulata. Nessuna attesa dell'orologio da qui allo scatto. */
    await pag.evaluate(() => { window.__banco.zitto(); window.__test.disegna(); });
  } else {
    await pag.waitForTimeout(s.attesa);

    /* Fermare il tempo prima di scattare. Anche a stato identico, un gioco che
       anima di continuo (carte che si posano, coriandoli, folla, pallone) da'
       un fotogramma diverso a ogni scatto, e chi confronta due immagini non
       distingue il cambiamento vero dal tremolio. Qui si congelano le
       animazioni CSS e si zittisce il ciclo di disegno: il fotogramma resta
       l'ultimo disegnato, sempre lo stesso a parita' di codice. */
    await pag.evaluate(() => {
      const st = document.createElement('style');
      st.textContent = '*,*::before,*::after{animation-play-state:paused !important;' +
        'transition:none !important;caret-color:transparent !important}';
      document.head.appendChild(st);
      window.requestAnimationFrame = () => 0;
    });
    await pag.waitForTimeout(160);
  }

  fs.mkdirSync(path.dirname(uscita), { recursive: true });
  await pag.screenshot({ path: uscita });
  await ctx.close();
  return { file: uscita, misura: `${v.w}x${v.h}@${v.dpr}`, errori };
}

(async () => {
  const o = argomenti();

  if (o.elenco) {
    for (const k of Object.keys(A)) console.log(k + '   ' + A[k].vista.w + 'x' + A[k].vista.h);
    return;
  }

  /* --ripetibilita <gioco>: scatta ogni scena DUE volte e dice quali sono
     identiche. Serve a sapere di quali confronti prima/dopo ci si puo'
     fidare: su una scena che cambia da sola, un critico che vede una
     differenza non sta guardando una modifica, sta guardando il caso. */
  if (o.ripetibilita) {
    const srv2 = await servi();
    const br = await chromium.launch();
    const nomi = Object.keys(A).filter(k => k.startsWith(o.ripetibilita + '/'));
    const stabili = [], mobili = [];
    try {
      for (const nome of nomi) {
        const base = path.resolve('.ripet', nome.replace('/', '-'));
        await scatta(br, srv2, nome, base + '-1.png', o);
        await scatta(br, srv2, nome, base + '-2.png', o);
        const a = fs.readFileSync(base + '-1.png'), b = fs.readFileSync(base + '-2.png');
        const uguale = a.length === b.length && a.equals(b);
        (uguale ? stabili : mobili).push(nome);
        console.log((uguale ? '  stabile   ' : '  MOBILE    ') + nome);
      }
    } finally { await br.close(); srv2.chiudi(); }
    fs.writeFileSync('strumenti/scene-stabili.json',
      JSON.stringify({ stabili, mobili }, null, 1));
    console.log(`\n${stabili.length} scene stabili, ${mobili.length} mobili.` +
      `\nSui confronti delle scene MOBILI non si puo' concludere niente: elenco in strumenti/scene-stabili.json`);
    return;
  }

  const srv = await servi();
  const browser = await chromium.launch();
  const esiti = [];
  try {
    let lista;
    if (o.tutte) lista = Object.keys(A).filter(k => k.startsWith(o.tutte + '/'));
    else if (o.scena) lista = [o.scena];
    else throw new Error('serve --scena <nome> oppure --tutte <gioco> oppure --elenco');

    for (const nome of lista) {
      const uscita = o.out && lista.length === 1
        ? path.resolve(o.out)
        : path.resolve(o.dir || 'foto', nome.replace('/', '-') + '.png');
      const r = await scatta(browser, srv, nome, uscita, o);
      esiti.push({ nome, ...r });
      const kb = (fs.statSync(uscita).size / 1024).toFixed(0);
      console.log(`${nome.padEnd(28)} ${r.misura.padEnd(14)} ${kb.padStart(5)} kB  ${uscita}`);
      if (r.errori.length) console.log('   ERRORI IN PAGINA: ' + r.errori.slice(0, 3).join(' | '));
    }
  } finally {
    await browser.close();
    srv.chiudi();
  }
  const conErrori = esiti.filter(e => e.errori.length).length;
  console.log(`\n${esiti.length} scene, ${conErrori} con errori in pagina`);
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
