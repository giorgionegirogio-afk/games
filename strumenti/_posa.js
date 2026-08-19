/* =====================================================================
   POSA — congelare il gioco per poterlo fotografare due volte.

   IL PERCHE'. Oggi due lavori diversi si sono fermati sullo stesso
   scoglio: fare DUE scatti del gioco che differiscano per UNA cosa sola.
   Senza quello nessun confronto visivo vale niente, perche' fra i due
   scatti si muovono anche l'erba, la folla, la camera e il passo dei
   giocatori, e si finisce per confrontare due partite diverse.
   Uno dei due tentativi ha misurato quanto costa sbagliare: con posa
   fissa e camera inchiodata, due scatti consecutivi differivano ancora
   su 4.508 pixel su 16.240.

   LA STRADA CHE FUNZIONA e' fatta di CINQUE cose, non di tre. Le prime
   tre c'erano gia' (vivevano dentro folla.js e nessuno fuori di li' le
   conosceva) e da sole davano 1 controllo su 4; le ultime due sono le
   sorgenti che mancavano, e sono le uniche che contano.

     1. IL BANCO A PASSO FISSO. Si sostituisce requestAnimationFrame con
        una coda che avanza a comando: cosi' il tempo lo fa scorrere chi
        misura, non l'orologio della macchina.
     2. LA PAUSA DEL GIOCO. `__test.setPaused(true)` ferma la
        simulazione: i giocatori non camminano, il pallone non rotola.
     3. IL SEME FISSO, installato prima di ogni riga di pagina.
     4. IL DISEGNO RESO IDEMPOTENTE — la sorgente grossa, sul canvas.
     5. IL SIPARIO ASPETTATO — la sorgente grossa, sul DOM.

   Le due sorgenti nuove sono su due strati diversi, e questa e' la
   ragione per cui erano sfuggite: chi guardava il canvas non vedeva la
   tenda, e chi guardava il PNG di pagina vedeva le due cose sommate.

   ---------------------------------------------------------------------
   LA SCOPERTA: `disegna()` NON E' UNA FOTOGRAFIA, E' UN PASSO DI TEMPO.

   Con le prime tre cose in piedi, due scatti consecutivi differivano su
   216.029 pixel su 1.507.920 — il 14,3% del quadro — e la differenza era
   SPARSA OVUNQUE: barra del punteggio, tribuna, prato, fascia dei
   comandi, tutto insieme. Una differenza distribuita cosi' non e' rumore
   di un elemento: e' il quadro intero che scivola.

   Il perche' si e' misurato confrontando lo stato del gioco prima e dopo
   UN SOLO disegna(). Cinque campi cambiano, e sono sempre gli stessi:

     G.cam.z    1,67136632 -> 1,67071465
     G.cam.y  390,81629091 -> 390,81868079
     G.view.Ax, G.view.Ay, G.view.S2   (derivati dei primi due)

   `render()` chiama `updateCamera(G.renderDT)` PRIMA di dipingere, e
   updateCamera e' un inseguimento esponenziale: a ogni chiamata la
   camera fa un passo verso il suo bersaglio. La pausa del gioco non la
   ferma — `setPaused` ferma `step()`, e la camera non vive in step(),
   vive in render(). Quindi ogni disegna() zooma e trasla di un
   sottopixel, e un sottopixel di zoom sposta OGNI pixel dello schermo
   che non sia in tinta piatta. Da qui il 14,3% sparso ovunque.

   E la camera non e' sola: la stessa forma (`k = 1-2^(-rdt/semivita)`,
   poi `x += (bersaglio-x)*k`) governa anche G.miniY, TAB_VELO e il
   decadimento di G.camPunch. Sono tutti passi di tempo dentro il
   disegno.

   ---------------------------------------------------------------------
   LA CURA, E PERCHE' STA FUORI DAL GIOCO.

   Tutti quegli inseguimenti leggono lo stesso numero: `G.renderDT`.
   Basta far leggere ZERO. Con rdt = 0 vale `k = 1-2^0 = 0`, e ogni
   inseguimento moltiplica il suo passo per zero: la camera resta dov'e',
   TAB_VELO resta dov'e', camPunch non decade. Non serve sapere QUANTI
   inseguimenti ci sono ne' dove stanno — si chiude la sorgente comune.

   `__test.disegna()` pero' scrive `G.renderDT = DT` da se', quindi non
   basta assegnare: si mette un ACCESSORIO che restituisce zero e ignora
   la scrittura, si disegna, e lo si toglie subito dopo. Sta acceso solo
   per la durata del disegno, cosi' la posa si compone con il tempo vero
   (se no la camera non arriverebbe mai a inquadrare l'azione).

   Il ripristino della camera dopo il disegno resta, come cintura oltre
   alle bretelle: se un giorno nascesse un inseguimento con la semivita
   scritta a mano invece che presa da renderDT, la camera — che e' cio'
   che sposta tutto lo schermo — sarebbe comunque inchiodata. Misurato:
   le due cure funzionano anche PRESE DA SOLE (0 pixel di differenza su
   1.507.920 ciascuna, tre coppie di disegni consecutivi).

   ---------------------------------------------------------------------
   LA SECONDA SORGENTE: LA TENDA, CHE NON PASSA DAL CANVAS.

   Chiuso il passo di tempo, il canvas diventa ripetibile al pixel — ma il
   PNG di pagina no, perche' `pag.screenshot()` fotografa anche il DOM.
   `startMatch` chiama `playWipe()`, che apre #wipe: cinque bande di
   colore piatto a schermo intero, animate in CSS e chiuse da un
   setTimeout di 560 ms all'orologio VERO, che il banco non governa.
   Il primo scatto la prendeva a meta' corsa e il secondo no.

   LA FIRMA E' NEI BYTE, e vale la pena saperla leggere: il primo PNG
   pesava il 40-75% MENO del secondo (188.810 byte contro 1.040.849 nel
   caso peggiore misurato). Colore piatto si comprime benissimo. Un PNG
   molto piu' LEGGERO non vuol dire «al quadro manca qualcosa»: vuol dire
   che qualcosa di uniforme ci sta SOPRA. Guardare l'immagine invece dei
   byte lo dice in un secondo — il disegno sotto e' completo.
   E la taglia del primo scatto NON SI RIPETE fra un giro e l'altro
   (misurati 188.810, 260.665, 260.734, 322.904, 326.166, 352.709,
   380.464, 412.226, 476.093, 497.631, 498.179, 641.581, 654.137): una
   grandezza che non si ripete e' una corsa contro l'orologio vero, non
   un elemento che manca.

   DUE CURE, tutte e due nel banco:
     · posaFerma aspetta che la coda dei setTimeout sia VUOTA (sipario),
       invece di aspettare un numero di millisecondi scritto a mano;
     · gli scatti si prendono con `animations:'disabled'`, che porta a
       fine corsa animazioni e transizioni CSS invece di coglierle a
       meta'. Presa da sola ciascuna delle due basta, misurato.

   ---------------------------------------------------------------------
   CIO' CHE E' STATO CERCATO E NON C'ERA. Vale la pena scriverlo, perche'
   erano i sospettati principali e hanno rubato tempo a due lavori.

     · Math.random durante il disegno: ZERO chiamate per disegna(),
       contate (window.__quanti). La risemina prima di ogni scatto NON
       serviva, e infatti non bastava. Resta perche' costa nulla e
       protegge dal giorno in cui una ne comparira'.
     · Date.now / new Date / performance.now nel disegno: ZERO, contate.
     · requestIdleCallback (la ricottura del manto per i caratteri,
       riga 17127 del gioco): parte UNA volta e ha gia' girato prima che
       la posa sia composta. Fra due scatti non fa niente — verificato
       lasciando passare 1,5 secondi REALI fra uno scatto e l'altro: 0
       pixel di differenza, con la spia dei setTimeout che nel frattempo
       ne conta uno eseguito.
     · Cotture pigre (buildFieldTex, buildVignette, campoVivoDisegna):
       nessuna scatta fra due scatti. Il PRIMO disegno dopo la posa e il
       secondo danno gia' 0 pixel di differenza, a tutte e tre le taglie.
     · UNA COTTURA PIGRA DELLE DIVISE, cercata apposta il 19 agosto 2026
       quando la toppa strumenti/_t-divise.js sembrava aver rotto questo
       cancello: NON C'E'. Il primissimo disegno dopo startMatch — cioe'
       dopo applyKit(), che e' dove le tinte nuove entrano in scena — e'
       gia' identico al secondo, 0 pixel su 1.507.920, sia sul file
       toppato sia su _bisez/pre-divise.html. Quella «regressione» era
       questa tenda: senza le due cure qui sopra FALLISCE ANCHE
       pre-divise, nove coppie su nove, e il 4 su 4 che gli era stato
       misurato era la fortuna di un giro solo. Nessuno sfarfallio nel
       gioco vero, e la toppa delle divise e' innocente.

   ---------------------------------------------------------------------
   ATTENZIONE — `avanzaDisegno` NON E' UN CONTROLLO NEGATIVO VALIDO, e la
   stesura precedente di questo file ci si era appoggiata.

   Far avanzare `G.pulse` (l'orologio delle animazioni) NON cambia UN
   SOLO PIXEL nella posa di partita: misurato a +1/60, +2/60, +4/60,
   +8/60, +1/4, +1/2, +1 e +2 secondi, e anche portando G.pulse a
   12.345,678 — sempre 0 pixel su 1.507.920. G.pulse viene letto UNA
   volta sola in tutto un disegna(), da drawCrowd, e da li' in giu' le
   onde della tribuna sono moltiplicate per `hype` (che a gioco fermo
   vale 0) oppure riguardano gradinate e quartiere che a quella
   inquadratura sono fuori quadro. Nel MENU, dove la gabbia e il
   quartiere sono in scena, lo stesso +1 secondo muove 10.039 pixel: il
   pomello non e' rotto, e' fuori quadro.

   Il controllo negativo di questo file percio' fa avanzare IL GIOCO di
   un sessantesimo di secondo, che e' la domanda giusta («il disegno
   segue lo stato?»): misurato, 139.130 pixel su 1.507.920 (9,2%).

   uso come modulo:
     const { posaFerma, scattoRipetibile } = require('./_posa.js');
   uso come prova:
     node strumenti/_posa.js            verifica che due scatti coincidano
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');

const RADICE = path.resolve(__dirname, '..');
const TIPI = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8',
               '.png':'image/png', '.json':'application/json', '.webmanifest':'application/manifest+json' };

/* il servitore: Playwright non apre file:, e questa e' la ragione per cui
   ogni strumento di casa ne porta uno dentro */
function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(RADICE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        res.writeHead(404); res.end('no'); return; }
      res.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream',
                           'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* il banco a passo fisso, da installare con addInitScript PRIMA del gioco */
function bancoDiProva() {
  const PASSO = 1000 / 60;
  let t = 0, coda = [];
  window.requestAnimationFrame = cb => { coda.push(cb); return coda.length; };
  window.cancelAnimationFrame = () => {};
  try { performance.now = () => t; } catch (e) {}
  /* ===================================================================
     I TIMER RESTANO ALL'ORA VERA, E BISOGNA SAPERLO.
     Il banco governa rAF e performance.now, non setTimeout: il gioco
     scandisce con setTimeout cose che si VEDONO — la piu' grossa e' la
     TENDA DEL PASSAGGIO (#wipe), un pannello DOM a schermo intero che
     startMatch apre a ogni partita e che un setTimeout di 560 ms chiude.
     Misurato: alla fine di posaFerma resta pendente esattamente UN
     timer, quello, e il pannello e' ancora display:block sopra il gioco;
     sparisce fra i 400 e gli 800 ms di orologio VERO. Fotografare in
     quella finestra vuol dire fotografare una tenda che si alza, e la
     tenda non passa dal canvas: e' DOM, quindi nessuna cura sul disegno
     la puo' vedere. Era questa, e solo questa, la differenza rimasta
     alle taglie 2 e 3 (776.241 byte contro 1.082.543 sullo stesso PNG).
     Qui i timer si contano soltanto; a svuotarli ci pensa posaFerma. */
  const P = new Set();
  const st = window.setTimeout, ct = window.clearTimeout;
  window.setTimeout = function (f, ms) {
    let id;
    id = st.call(window, function () { P.delete(id);
      return typeof f === 'function' ? f.apply(this, arguments) : eval(f); }, ms);
    P.add(id); return id;
  };
  window.clearTimeout = function (id) { P.delete(id); return ct.call(window, id); };
  window.__banco = {
    passo(n) { n = Math.max(0, Math.round(+n || 0));
      for (let i = 0; i < n; i++) { const c = coda; coda = []; t += PASSO;
        for (const f of c) { try { f(t); } catch (e) {} } } return t; },
    /* quanti timer a orologio VERO devono ancora scattare */
    pendenti() { return P.size; },
  };
}

/* il seme, da installare anch'esso prima del gioco */
function semeFisso(seme) {
  let s = seme >>> 0 || 1, n = 0;
  const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; n++; return s >>> 0; };
  Math.random = () => p() / 4294967296;
  /* LA RISEMINA E IL CONTATORE. `__risemina` rimette il generatore al
     punto di partenza; `__quanti` dice quanti numeri sono stati estratti.
     Il secondo serve a smentire il primo: contati con __quanti, i
     sorteggi consumati da un disegna() sono ZERO — quindi la risemina
     non e' cio' che rende ripetibile lo scatto, e chi la vede qui non
     deve credere di aver trovato la cura. Resta perche' costa nulla. */
  window.__risemina = k => { s = (k >>> 0) || (seme >>> 0) || 1; };
  window.__quanti = () => n;
}

/* ---------------------------------------------------------------------
   LA POSA. Porta il gioco in partita, lo ferma, e lascia la camera posata.
   `secondi` di simulazione decidono che partita si sta guardando: zero
   vuol dire il calcio d'inizio, e al calcio d'inizio la camera sta ancora
   sulla presentazione e inquadra fuori dal campo. Chi non lo sa ci perde
   tre scatti (mi e' successo).
   `assesta` sono i fotogrammi che si lasciano girare A TEMPO VERO dopo la
   pausa: servono proprio perche' la camera e' un inseguimento, e senza
   quelli la posa sarebbe un'inquadratura in viaggio. La cura del disegno
   idempotente si accende DOPO, uno scatto alla volta.
   --------------------------------------------------------------------- */
async function posaFerma(pag, opz = {}) {
  const { secondi = 3.0, taglia = 5, cronometro = 89, cpu = true, assesta = 60 } = opz;
  /* LA TAGLIA SI SCRIVE IN GIOCATORI, 5 / 7 / 11, e non 1 / 2 / 3.
     `setTaglia` nel gioco fa `n = (n===7||n===11) ? n : 5`: qualunque
     altro numero diventa CINQUE, in silenzio. La prima stesura di questo
     file passava 1, 2 e 3, e i suoi «tre controlli a tre taglie» erano
     lo stesso cinque contro cinque fotografato tre volte — con le taglie
     2 e 3 che davano PNG identici al byte (1.082.543 e 1.082.543), che
     e' la firma dell'inganno. `__test.campo` lo dichiarava: taglia 5,
     dieci giocatori, FW 1150, per tutti e tre i giri.
     1/2/3 si accettano ancora, tradotti, perche' qualcuno li avra' gia'
     scritti da qualche parte. */
  const N = { 1: 5, 2: 7, 3: 11 }[taglia] || taglia;
  await pag.evaluate(() => window.__banco.passo(30));
  await pag.evaluate(([taglia, cpu, cron, sec]) => {
    window.__test.dismissSplash && window.__test.dismissSplash();
    /* LA TAGLIA NON E' IL PRIMO ARGOMENTO. `startMatch(taglia, 1)` misura
       sempre il cinque contro cinque: lezione gia' pagata una volta. */
    window.__test.startMatch(1, 1, { size: taglia });
    window.__test.Tut && window.__test.Tut.finish && window.__test.Tut.finish(true);
    if (cpu) window.__test.setCpuVsCpu(true);
    if (sec > 0) window.__test.simulate(sec);
    window.__test.setTimeLeft(cron);
  }, [N, cpu, cronometro, secondi]);
  await pag.evaluate(() => window.__test.setPaused(true));
  await pag.evaluate(n => window.__banco.passo(n), assesta);
  await sipario(pag);
  await disegnaFermo(pag);
}

/* ---------------------------------------------------------------------
   SI ASPETTA CHE IL SIPARIO SIA SALITO. I timer del gioco vanno all'ora
   vera (vedi bancoDiProva): finche' ne resta uno pendente c'e' un
   pannello DOM che puo' essere a meta' strada sopra la scena. Non si
   aspetta un numero di millisecondi scritto a mano — si aspetta che la
   coda sia vuota, che e' la condizione giusta e non invecchia.
   Se qualcosa si riaccoda all'infinito si va avanti lo stesso dopo il
   tetto: meglio uno scatto dichiarato che un cancello appeso.
   --------------------------------------------------------------------- */
async function sipario(pag, tetto = 6000) {
  try {
    await pag.waitForFunction(() => window.__banco.pendenti() === 0, null,
                              { timeout: tetto, polling: 50 });
    return true;
  } catch (e) { return false; }
}

/* ---------------------------------------------------------------------
   IL DISEGNO IDEMPOTENTE — la cura, in una funzione sola.
   Si esegue dentro la pagina; `avanzaPulse` sposta l'orologio delle
   animazioni (e vedi il cappello: nella posa di partita non muove
   niente), `avanzaGioco` fa avanzare LA PARTITA di tanti secondi, che e'
   l'unico modo onesto di dimostrare che il disegno e' vivo.
   --------------------------------------------------------------------- */
function disegnaFermo(pag, opz = {}) {
  const { avanzaPulse = 0, avanzaGioco = 0 } = opz;
  return pag.evaluate(([dp, dg]) => {
    const G = window.__test.G, c = G.cam;
    if (dg > 0) {
      /* simulate() si rifiuta di girare a gioco in pausa: la si toglie e
         la si rimette, cosi' il fermo resta quello di prima */
      const era = window.__test.paused;
      if (era) window.__test.setPaused(false);
      window.__test.simulate(dg);
      if (era) window.__test.setPaused(true);
    }
    if (dp) G.pulse += dp;
    const sc = { x: c.x, y: c.y, z: c.z };
    const desc = Object.getOwnPropertyDescriptor(G, 'renderDT');
    /* IL PASSO DI TEMPO DEL DISEGNO MESSO A ZERO — vedi il cappello.
       E' un ACCESSORIO e non un'assegnazione perche' __test.disegna()
       scrive G.renderDT da se': l'accessorio ignora la scrittura. */
    Object.defineProperty(G, 'renderDT', { get: () => 0, set: () => {}, configurable: true });
    try { window.__test.disegna(); }
    finally {
      delete G.renderDT;
      if (desc) Object.defineProperty(G, 'renderDT', desc); else G.renderDT = 1 / 60;
      /* la camera si rimette dov'era: mezzo pixel di scivolamento fa
         «differire» ogni pixel dello schermo, e il confronto passerebbe
         anche con una scena dipinta a mano */
      c.x = sc.x; c.y = sc.y; c.z = sc.z;
    }
  }, [avanzaPulse, avanzaGioco]);
}

/* ---------------------------------------------------------------------
   LO SCATTO RIPETIBILE. Ridisegna e fotografa, senza far avanzare NIENTE.
   --------------------------------------------------------------------- */
async function scattoRipetibile(pag, dove, opz = {}) {
  const { avanzaDisegno = 0, avanzaGioco = 0, seme = 20260819 } = opz;
  /* La risemina non e' la cura (i sorteggi consumati da un disegno sono
     zero, contati): e' una cintura per il giorno in cui ne comparira' uno. */
  await pag.evaluate(k => { if (window.__risemina) window.__risemina(k); }, seme);
  await disegnaFermo(pag, { avanzaPulse: avanzaDisegno, avanzaGioco });
  /* `animations:'disabled'` e' la cintura sul lato DOM: porta a fine corsa
     animazioni e transizioni CSS invece di fotografarle a meta'. Le brette
     sono l'attesa del sipario in posaFerma — quella toglie il pannello,
     questa toglie il fotogramma intermedio di quelli che restano. */
  const opzScatto = { animations: 'disabled' };
  if (dove) opzScatto.clip = dove;
  return pag.screenshot(opzScatto);
}

/* ---------------------------------------------------------------------
   LA VERIFICA. Non si dichiara che la posa e' ferma: si misura.
   Due scatti senza avanzare niente devono coincidere BYTE PER BYTE. Se
   non coincidono, qualunque confronto costruito sopra e' aria.
   --------------------------------------------------------------------- */
async function verificaPosa(pag, dove) {
  const a = await scattoRipetibile(pag, dove);
  const b = await scattoRipetibile(pag, dove);
  return { uguali: Buffer.compare(a, b) === 0, byteA: a.length, byteB: b.length };
}

module.exports = { servi, bancoDiProva, semeFisso, posaFerma, sipario,
                   disegnaFermo, scattoRipetibile, verificaPosa };

/* ------------------------------------------------------------ la prova */
if (require.main === module) {
  (async () => {
    const { chromium } = require('playwright');
    const arg = (n, d) => { const i = process.argv.indexOf('--' + n);
      return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
    const GIOCO = arg('gioco', 'CALCETTO-il-gioco.html');
    const srv = await servi();
    const br = await chromium.launch();
    const ctx = await br.newContext({ viewport: { width: 915, height: 412 },
      deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
    const pag = await ctx.newPage();
    await pag.addInitScript(semeFisso, 20260819);
    await pag.addInitScript(bancoDiProva);
    await pag.goto(`http://127.0.0.1:${srv.porta}/${GIOCO}`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 15000 });
    await pag.waitForTimeout(400);

    console.log('\n=== POSA: due scatti devono coincidere byte per byte ===');
    let esiti = 0, tot = 0;
    for (const taglia of [5, 7, 11]) {
      await posaFerma(pag, { taglia });
      const q0 = await pag.evaluate(() => window.__quanti());
      const v = await verificaPosa(pag, null);
      const q1 = await pag.evaluate(() => window.__quanti());
      tot++; if (v.uguali) esiti++;
      console.log(`  ${v.uguali ? 'OK  ' : 'NO  '} taglia ${taglia}: due scatti ${v.uguali ? 'IDENTICI' : 'DIVERSI'} (${v.byteA} e ${v.byteB} byte)` +
                  `  [sorteggi consumati dai due disegni: ${q1 - q0}]`);
    }
    /* IL CONTROLLO NEGATIVO: si fa avanzare IL GIOCO di un sessantesimo di
       secondo e i due scatti DEVONO differire. Se restassero uguali
       vorrebbe dire che la posa e' ferma perche' il disegno e' morto, non
       perche' e' governato — e questo strumento sarebbe una decorazione.
       NON si fa avanzando G.pulse: quello, misurato, non muove un pixel
       in questa posa (vedi il cappello del file). */
    await posaFerma(pag, { taglia: 5 });
    const a = await scattoRipetibile(pag, null);
    const b = await scattoRipetibile(pag, null, { avanzaGioco: 1 / 60 });
    const diverso = Buffer.compare(a, b) !== 0;
    tot++; if (diverso) esiti++;
    console.log(`  ${diverso ? 'OK  ' : 'NO  '} controllo negativo: avanzando il gioco di un sessantesimo di secondo i due scatti ${diverso ? 'DIFFERISCONO' : 'restano uguali'}`);

    console.log(`\n${tot} controlli, ${esiti} passati, ${tot - esiti} falliti`);
    await br.close(); srv.chiudi();
    process.exit(esiti === tot ? 0 : 1);
  })();
}
