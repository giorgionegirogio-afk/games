/* =====================================================================
   AVVIO — quanto tempo passa fra il tocco sull'icona e il primo tocco
   sulla palla. La promessa di vendita, finalmente misurata.

   IL PERCHÉ.
   Il gioco si vende dicendo «si apre in un secondo». Per due settimane
   quella promessa è stata sorvegliata con un tetto sul PESO del file,
   scritto a mano: prima 900 kB, poi 1500 quando 900 non bastavano più.
   Ma un tetto in kilobyte non è la promessa: ne è un surrogato, e per di
   più un surrogato tarato su un vincolo che qui non esiste. Il committente
   l'ha chiarito: il gioco gira come APK dentro un telefono, e lì il file
   È GIÀ SUL DISPOSITIVO. Non si scarica niente. Il tempo di rete, che è
   l'unica cosa che un tetto in kilobyte misura davvero, vale zero.

   Quello che il giocatore aspetta, invece, è un'altra cosa: il tempo che
   la WebView impiega a LEGGERE, ANALIZZARE ed ESEGUIRE un megabyte e mezzo
   di HTML prima che il campo sia in piedi e la palla si possa toccare.
   Quel tempo nessuno l'aveva mai misurato. Questo strumento sostituisce il
   fantasma (i kilobyte) con la cosa vera (i millisecondi), e lo fa
   separando le fasi, perché è la separazione che rende utile la misura:
   se domani l'avvio peggiora, si deve poter dire SE è colpa del peso
   (fase di analisi) o di quello che il gioco fa dopo (cottura dei volti,
   texture del manto, prima partita) — sono due lavori diversi.

   LE FASI, misurate dentro la pagina, non dal di fuori:
     1. ANALISI      navigationStart -> DOMContentLoaded. È il costo di
                     leggere e compilare il file: la fase che cresce col
                     peso, e l'unica che il tetto in kB pretendeva di
                     rappresentare.
     2. PRIMO DISEGNO first-contentful-paint (Performance API); se il
                     browser non lo espone, il primo requestAnimationFrame
                     dopo l'avvio della partita, dichiarato come tale.
     3. GIOCABILE    il momento in cui si può toccare la palla. Criterio
                     DICHIARATO, non a sentimento: appena esiste
                     window.__test si congeda lo splash e si avvia una
                     partita, e la LOGICA è pronta al primo fotogramma in
                     cui valgono tutte e tre queste cose —
                       a) la scena è 'kickoff' o 'play';
                       b) window.__test.ball esiste con coordinate vere;
                       c) window.__test.comandiTouch non è vuoto, cioè
                          l'HUD è stato DISEGNATO almeno una volta e sotto
                          il pollice c'è davvero un comando.
                     Ma «pronto» non basta, e questa riga è costata una
                     correzione alla prima misura: la logica risulta pronta
                     PRIMA che un solo pixel arrivi sullo schermo (1402 ms
                     contro 2178 di primo disegno, al banco scarico). Un
                     dito non tocca una palla che non vede. Quindi
                       GIOCABILE = il più tardo fra «logica pronta» e
                       «primo disegno».
                     I 2600 ms di splash automatico NON contano: sono una
                     scelta di regia, non costo di avvio, e chi tocca lo
                     schermo li salta. Qui li saltiamo anche noi, e lo
                     diciamo.

   LA LEZIONE DI prestazione.js, che vale identica qui: questo banco
   disegna in software, senza scheda grafica. I millisecondi assoluti che
   legge non sono i millisecondi di un telefono. Per questo la misura si
   ripete con la CPU rallentata via CDP a 1x, 4x e 6x: un telefono di
   fascia media sta GROSSO MODO fra 4x e 6x rispetto a un computer da
   tavolo, ed è una STIMA dichiarata, non una verità. Il cancello è posato
   a 4x, che è la lettura prudente di «si apre in un secondo».

   E quando c'è un telefono o un emulatore attaccato ad adb si smette di
   stimare, su due livelli. Il primo è `am start -W`, che dà il TotalTime:
   il tempo fino al primo fotogramma dell'attività — cioè fino a quando la
   WebView è in piedi, PRIMA che l'HTML venga letto. Il secondo è la parte
   che nessuno aveva mai guardato: l'APK accende
   setWebContentsDebuggingEnabled (android/Gioco.java), quindi la stessa
   sonda si inietta DENTRO la WebView vera via DevTools e riporta le stesse
   fasi misurate sul dispositivo. Lì il costo di lettura del file non è più
   un fattore da credere sulla parola: è un numero.
   Due avvertenze pagate sul campo, tutte e due dall'emulatore:
     — la WebView chiude il bersaglio DevTools circa due secondi dopo un
       reload, quindi il filo va riattaccato o la misura esce vuota;
     — un emulatore SENZA finestra non dipinge mai, quindi le Paint Timing
       non esistono e l'HUD non arriva a disegnarsi. Lì vale la lettura del
       file, non la promessa intera, e lo strumento lo dichiara invece di
       riempire il buco.

   LA REGOLA DI CASA, pagata nove volte in questo progetto: uno strumento
   che ATTESTA invece di MISURARE è peggio di nessuno strumento. Per questo
   c'è --sabota, che inietta lavoro sincrono vero prima della pagina: se
   con --sabota 3000 questo file dice ancora OK, il file è rotto e va
   buttato. E per questo si misura più volte e si stampa la DISPERSIONE:
   una misura che balla più del 20% fra due esecuzioni non è un cancello,
   è un oroscopo, e viene dichiarata tale.

   uso:  node strumenti/avvio.js
         node strumenti/avvio.js --soglia 2000     il cancello, in ms
         node strumenti/avvio.js --freni 1,4,6     rallentamenti CPU
         node strumenti/avvio.js --cancello 4      su quale freno decide
         node strumenti/avvio.js --giri 3          esecuzioni per freno
         node strumenti/avvio.js --ballo 20        dispersione ammessa, %
         node strumenti/avvio.js --pendenza        misura QUANTO costa un
                                                   kilobyte in più, servendo
                                                   il gioco appesantito con
                                                   zavorra vera (il file su
                                                   disco non viene toccato)
         node strumenti/avvio.js --zavorra 512     appesantisce di N kB
         node strumenti/avvio.js --attesa 600      ms in più fra il primo
                                                   disegno e l'avvio della
                                                   partita (solo diagnosi)
         node strumenti/avvio.js --sabota 3000     la prova che sa fallire
         node strumenti/avvio.js --senza-adb       salta la misura sul telefono
         node strumenti/avvio.js --solo-telefono   SOLO la misura via adb,
                                                   senza browser: un emulatore
                                                   acceso ruba i core e sfigura
                                                   la misura nel browser, le due
                                                   vanno fatte separate
   Esce con codice 1 se il gioco non è giocabile entro la soglia al freno
   del cancello, o se la misura balla più del consentito.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const zlib = require('zlib');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
/* --- innesto di _z-banco.js: la radice resta il repo, ma il gioco puo'
   arrivare da fuori. Nessun altro comportamento e' toccato. --- */
const __PROVA = process.env.GIOCO_PROVA ? require('path').resolve(process.env.GIOCO_PROVA) : '';
const __rid = f => (__PROVA && /CALCETTO-il-gioco\.html$/i.test(f)) ? __PROVA : f;

const APK = path.join(RADICE, 'apk', 'CALCETTO.apk');
const PACCHETTO = 'it.dopolavoro.calcetto';
const ATTIVITA = 'it.dopolavoro.gioco.Gioco';

function arg(n, d) {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
}

/* --file: QUALE gioco si misura, e perche' l'opzione esiste.
   Il nome era inchiodato qui dentro, e con un nome solo questo banco puo'
   dire "diecimila millisecondi" ma non puo' dire SE sono colpa del lavoro
   di oggi o del computer di oggi. Un tempo assoluto su una macchina che
   non e' quella di ieri non e' una misura, e' un aneddoto: e' la stessa
   ferita che prestazione.js ha gia' pagato, quando ha accusato il gioco
   di aver dimezzato il fotogramma mentre il costo vero era un decimo.
   Con --file si misurano DUE file uno dopo l'altro sullo stesso banco
   nello stesso minuto — per esempio la versione dell'ultimo commit
   contro quella di adesso — e la differenza resta onesta anche quando il
   numero assoluto non lo e'. */
const GIOCO = arg('file', 'CALCETTO-il-gioco.html');
if (!fs.existsSync(path.join(RADICE, GIOCO))) {
  console.error(`non trovo ${GIOCO} dentro ${RADICE}`); process.exit(2);
}
const bandiera = n => process.argv.includes('--' + n);

if (bandiera('aiuto') || process.argv.includes('-h')) {
  console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0].split('uso:')[1].replace(/^/, '  uso:'));
  process.exit(0);
}

const esiti = [];
function verifica(ok, testo, dettaglio) {
  esiti.push(!!ok);
  console.log((ok ? '  OK   ' : '  NO   ') + testo + (dettaglio ? '\n         ' + dettaglio : ''));
}

/* ---------------------------------------------------------------------
   LA ZAVORRA — per sapere quanto costa crescere bisogna far crescere.

   Con una sola misura su una sola dimensione, «quanto può ancora crescere
   il file» sarebbe aritmetica su un punto solo: si dividerebbe il tempo di
   analisi per i kilobyte e si spaccerebbe il quoziente per una pendenza.
   È sbagliato, perché una parte di quel tempo è FISSA (accendere il
   motore, costruire il DOM, cuocere le texture) e non cresce col peso.
   Qui invece il gioco viene servito appesantito di 0, N e 2N kilobyte, e
   la pendenza si LEGGE da tre punti.
   La zavorra è un modello, e va dichiarato: due terzi funzioni mai
   chiamate (che il motore pre-analizza, come fa con la maggior parte del
   codice di un file così), un terzo fra tabelle di numeri e una stringa
   lunga in base64, che è il modo in cui questo file è cresciuto finora
   (font, immagini, tavole). Il file su disco NON viene toccato: la
   zavorra vive solo nel buffer che il server locale spedisce.
   --------------------------------------------------------------------- */
function zavorra(kB) {
  if (!kB) return '';
  const bersaglio = kB * 1024;
  let s = 0, pezzi = ['<script>\n/* zavorra di misura: nessuna di queste righe viene eseguita dal gioco */\n'];
  let n = 0;
  const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let seme = 20260817;
  const casuale = () => { seme ^= seme << 13; seme >>>= 0; seme ^= seme >>> 17; seme ^= seme << 5; seme >>>= 0; return seme / 4294967296; };
  while (s < bersaglio) {
    n++;
    let p;
    if (n % 3 !== 0) {
      /* funzione mai chiamata: il motore la pre-analizza e basta */
      p = `function zav_${n}(a,b,c){\n` +
        Array.from({ length: 24 }, (_, i) =>
          `  const v${i} = Math.sin(a*${(casuale() * 9).toFixed(4)} + b*${(casuale() * 3).toFixed(4)}) * ${(casuale() * 100).toFixed(3)};\n` +
          `  if (v${i} > c) { a = a*0.5 + v${i}; } else { b = b + v${i}*${(casuale() * 2).toFixed(4)}; }\n`).join('') +
        `  return a + b;\n}\n`;
    } else if (n % 6 === 3) {
      /* tabella di numeri: analizzata ED eseguita una volta */
      p = `const zavT_${n} = [` + Array.from({ length: 700 }, () => (casuale() * 1000).toFixed(4)).join(',') + `];\n`;
    } else {
      /* stringa lunga come quelle dei font e delle immagini gia' dentro */
      p = `const zavB_${n} = "` + Array.from({ length: 5000 }, () => B64[(casuale() * 64) | 0]).join('') + `";\n`;
    }
    pezzi.push(p); s += p.length;
  }
  pezzi.push('</script>\n');
  return pezzi.join('');
}

/* ---------------------------------------------------------------------
   IL SERVER — proprio, su porta libera, senza cache.
   Serve il gioco da un buffer (per poter iniettare la zavorra senza
   toccare il file) e tutto il resto dal disco col tipo giusto.
   --------------------------------------------------------------------- */
const TIPI = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png', '.webmanifest': 'application/manifest+json',
};
function servi(sorgente) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const [percorso, query] = req.url.split('?');
      const f = __rid(path.join(RADICE, decodeURIComponent(percorso)));
      if (path.basename(f) === GIOCO) {
        const kB = +((query || '').match(/zavorra=(\d+)/) || [])[1] || 0;
        /* la zavorra entra PRIMA dello script del gioco: e' il modello
           onesto della crescita, perche' ritarda tutto quello che segue */
        const corpo = kB ? sorgente.replace('<script>', zavorra(kB) + '<script>') : sorgente;
        const buf = Buffer.from(corpo, 'utf8');
        res.writeHead(200, { 'Content-Type': TIPI['.html'], 'Cache-Control': 'no-store', 'Content-Length': buf.length });
        res.end(buf);
        return;
      }
      if ((!f.startsWith(RADICE) && f !== __PROVA) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* ---------------------------------------------------------------------
   LA SONDA — cronometra DENTRO la pagina.
   Misurare dal lato di Node significherebbe pagare il viaggio di andata e
   ritorno del protocollo su ogni lettura: qualche millisecondo di rumore
   su una misura che deve distinguere 1800 da 2000. Qui i timbri li mette
   la pagina stessa, con performance.now(), che parte da navigationStart.
   --------------------------------------------------------------------- */
function SONDA() {
  const A = { fasi: {}, note: [] };
  window.__avvio = A;
  const marca = n => { if (A.fasi[n] === undefined) A.fasi[n] = performance.now(); };
  document.addEventListener('DOMContentLoaded', () => marca('dcl'), true);
  window.addEventListener('load', () => marca('load'), true);
  try {
    new PerformanceObserver(l => {
      for (const e of l.getEntries()) {
        if (e.name === 'first-paint') marca('fp');
        if (e.name === 'first-contentful-paint') { marca('fcp'); chiudi(); }
      }
    }).observe({ type: 'paint', buffered: true });
  } catch (e) { A.note.push('paint non esposto da questo browser'); }

  /* GIOCABILE = il piu' tardo fra la logica pronta e il primo disegno.
     I due traguardi arrivano in ordine imprevedibile — al banco scarico la
     logica arriva PRIMA dei pixel — quindi il timbro finale lo mette
     chiunque dei due arrivi per ultimo. */
  function chiudi() {
    if (A.fasi.giocabile !== undefined) return;
    if (A.fasi.logica === undefined) return;
    if (A.fasi.fcp !== undefined) { A.fasi.giocabile = Math.max(A.fasi.logica, A.fasi.fcp); return; }
    if (A.senzaDisegno) {
      /* niente disegno da misurare: si toglie ESATTAMENTE l'attesa che
         abbiamo imposto noi (partenza - hook), perche' quei millisecondi
         sono pazienza dello strumento, non lavoro del gioco. Il numero che
         resta e' il tempo della logica, e va letto per quello che e'. */
      A.fasi.giocabile = A.fasi.logica - (A.fasi.partenza - A.fasi.hook);
    }
  }
  /* la pazienza si conta DALLA LOGICA, non dall'inizio della pagina.
     Contandola dall'inizio (primo errore di questo file) il timer scadeva
     mentre il primo disegno era ancora in strada, e la misura si chiudeva
     su un traguardo solo: dichiarava 3042 ms dove i pixel arrivavano a
     4668. Un cronometro che si ferma prima del traguardo non e' prudente,
     e' bugiardo. */
  function pazienza() {
    if (A.fasi.giocabile !== undefined) return;
    if (A.fasi.fcp === undefined) {
      A.senzaDisegno = true;
      A.note.push('primo disegno MAI riportato dopo 10 s dalla logica: giocabile e\' la sola logica');
      chiudi();
    }
  }

  let giri = 0;
  (function cerca() {
    /* il file e' un unico script gigante: questo timer non puo' scattare
       prima che il motore l'abbia finito. Il timbro 'hook' e' quindi il
       momento in cui il gioco ha smesso di essere testo ed e' diventato
       programma. */
    if (!window.__test) { setTimeout(cerca, 0); return; }
    marca('hook');
    attendiDisegno();
  })();

  /* QUANDO SI AVVIA LA PARTITA, e perche' non nell'istante zero.
     Il primo tentativo di questo file chiamava startMatch nell'istante
     esatto in cui __test compariva — cioe' mentre il gioco stava ancora
     finendo di mettersi in piedi. A CPU rallentata il gioco rispondeva con
     un'eccezione dentro il disegno ("arc: radius negative"), il giro di
     requestAnimationFrame moriva li' e la palla non arrivava mai: due
     esecuzioni su tre perse. Il resto della casa (collaudo.js,
     prestazione.js) aspetta 600 ms dopo il hook, e non per superstizione.
     Ma una costante scritta a mano e' un altro fantasma: 600 ms su questo
     banco sono una cosa, su un telefono un'altra.
     Qui l'attesa non e' una costante, e' un FATTO: si aspetta che il gioco
     abbia disegnato qualcosa (il primo first-contentful-paint), che e'
     anche esattamente quello che fa un essere umano — vede il menu, poi
     tocca. Il cronometro NON si ferma durante l'attesa e non le si sconta
     niente: in quei millisecondi il gioco lavora davvero (cuoce le texture,
     disegna il menu), e il telefono li paga tutti.
     --attesa aggiunge altri millisecondi sopra, per diagnosi. */
  /* L'ATTESA SI CONTA IN TEMPO, NON IN GIRI. Prima versione: un contatore
     di iterazioni moltiplicato per 8 ms, sul presupposto che un
     setTimeout(8) scatti ogni 8 ms. Dentro la WebView di un emulatore
     SENZA SCHERMO i timer vengono rallentati e quel conteggio non e' mai
     arrivato in fondo: la misura sul telefono e' rimasta appesa oltre
     cento secondi con la scena ferma sul menu. Un tempo si misura con un
     orologio, non contando i passi e sperando che siano lunghi uguali. */
  const GRAZIA = 3000;
  function attendiDisegno() {
    if (A.fasi.fcp === undefined) {
      if (performance.now() - A.fasi.hook < GRAZIA) { setTimeout(attendiDisegno, 16); return; }
      /* Nessun primo disegno DAVVERO: succede sull'emulatore senza schermo,
         dove la WebView non dipinge e le Paint Timing non esistono. Non e'
         un difetto del gioco e non va spacciato per tale. */
      A.senzaDisegno = true;
      A.note.push('questo dispositivo non riporta il primo disegno: giocabile e\' la sola logica');
    }
    setTimeout(parti, window.__attesaAvvio || 0);
  }

  function parti() {
    const t = window.__test;
    marca('partenza');
    try { t.dismissSplash && t.dismissSplash(); } catch (e) { }
    try { t.startMatch(1, 1); } catch (e) { A.note.push('startMatch: ' + e.message); }
    requestAnimationFrame(function guarda() {
      marca('raf1');
      let scena = null, palla = null, comandi = null;
      try { scena = t.state; palla = t.ball; comandi = t.comandiTouch; } catch (e) { }
      const pronto = (scena === 'kickoff' || scena === 'play') &&
        palla && typeof palla.x === 'number' &&
        comandi && comandi.length > 0;
      if (pronto) {
        marca('logica');
        A.prova = { scena, comandi: comandi.length, palla: { x: +palla.x.toFixed(1), y: +palla.y.toFixed(1) } };
        setTimeout(pazienza, 10000);
        chiudi();
        return;
      }
      if (++giri > 900) { A.fasi.giocabile = -1; A.note.push('mai giocabile: scena=' + scena + ' comandi=' + (comandi && comandi.length)); return; }
      /* se la partita non e' partita (splash, salvataggio, menu) si
         ritenta ogni mezzo secondo circa, senza martellare */
      if (giri % 30 === 0) { try { t.dismissSplash && t.dismissSplash(); t.startMatch(1, 1); } catch (e) { } }
      requestAnimationFrame(guarda);
    });
  }
}

async function misura(browser, srv, { freno, sabota, zav, attesa }) {
  const ctx = await browser.newContext({
    viewport: { width: 915, height: 412 }, deviceScaleFactor: 2,
    isMobile: true, hasTouch: true, locale: 'it-IT',
  });
  const pag = await ctx.newPage();
  const cdp = await ctx.newCDPSession(pag);
  /* il freno si tira PRIMA di navigare: qui interessa il caricamento, che
     e' l'esatto contrario di prestazione.js dove il freno arriva dopo */
  if (freno > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: freno });
  await pag.addInitScript(a => { window.__attesaAvvio = a; }, attesa || 0);
  await pag.addInitScript(SONDA);
  if (sabota > 0) {
    /* lavoro sincrono VERO, prima di ogni riga della pagina: e' il modo
       piu' onesto di chiedere allo strumento «sai dire di no?» */
    await pag.addInitScript(ms => { const f = Date.now(); while (Date.now() - f < ms); }, sabota);
  }
  const errori = [];
  /* con la RIGA, non solo col messaggio: il gioco e' un unico script dentro
     il documento, quindi il numero di riga dello stack e' la riga vera del
     file. Un'eccezione all'avvio senza la sua riga costringe chi legge a
     ricominciare la caccia da capo. */
  pag.on('pageerror', e => {
    const r = (String(e.stack || '').match(/:(\d+):(\d+)/) || []);
    errori.push(e.message + (r[1] ? `   [riga ${r[1]} del documento]` : ''));
  });
  const url = `http://127.0.0.1:${srv.porta}/${GIOCO}?zavorra=${zav || 0}&t=${Date.now()}_${Math.random()}`;
  const t0 = Date.now();
  await pag.goto(url, { waitUntil: 'commit', timeout: 180000 });
  let scaduto = false;
  try {
    await pag.waitForFunction('window.__avvio && window.__avvio.fasi.giocabile !== undefined', null, { timeout: 180000 });
  } catch (e) { scaduto = true; }
  const r = await pag.evaluate(() => {
    const n = performance.getEntriesByType('navigation')[0] || {};
    return {
      fasi: window.__avvio.fasi, note: window.__avvio.note, prova: window.__avvio.prova || null,
      nav: {
        risposta: n.responseEnd || 0, dcl: n.domContentLoadedEventEnd || 0,
        completo: n.domComplete || 0, carico: n.loadEventEnd || 0,
        trasferiti: n.transferSize || 0, decodificati: n.decodedBodySize || 0,
      },
    };
  }).catch(() => null);
  if (freno > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  await ctx.close();
  if (!r) throw new Error('la pagina non ha risposto');
  const f = r.fasi;
  return {
    analisi: r.nav.dcl || f.dcl || 0,
    disegno: f.fcp !== undefined ? f.fcp : (f.raf1 || 0),
    disegnoStimato: f.fcp === undefined,
    hook: f.hook || 0,
    logica: f.logica !== undefined ? f.logica : -1,
    giocabile: (f.giocabile !== undefined && f.giocabile > 0) ? f.giocabile : -1,
    carico: r.nav.carico || 0,
    muro: Date.now() - t0,
    prova: r.prova, note: (r.note || []).concat(errori.map(e => 'ECCEZIONE: ' + e)),
    scaduto,
  };
}

const mediana = a => { const o = [...a].sort((x, y) => x - y); return o.length % 2 ? o[(o.length - 1) / 2] : (o[o.length / 2 - 1] + o[o.length / 2]) / 2; };
const ms = v => (v < 0 ? '  n/d ' : (v).toFixed(0).padStart(5) + ' ms');

/* ---------------------------------------------------------------------
   IL PESO — quello vero, e quello compresso.
   Dentro un APK il file NON sta disteso: sta sgonfiato con deflate, e la
   WebView lo rigonfia leggendolo. Il numero che conta per lo spazio e'
   quello compresso; il numero che conta per il TEMPO e' quello disteso,
   perche' il motore analizza i byte gonfi. Sono due numeri diversi e qui
   si stampano tutti e due, per non confonderli mai piu'.
   --------------------------------------------------------------------- */
function dentroApk(file, nome) {
  /* lettura minima della directory centrale dello zip: nessuna
     dipendenza, e dice il peso VERO che il telefono si porta dietro */
  if (!fs.existsSync(file)) return null;
  const b = fs.readFileSync(file);
  let e = -1;
  for (let i = b.length - 22; i >= 0 && i > b.length - 66000; i--) if (b.readUInt32LE(i) === 0x06054b50) { e = i; break; }
  if (e < 0) return null;
  let p = b.readUInt32LE(e + 16);
  const quante = b.readUInt16LE(e + 10);
  for (let k = 0; k < quante; k++) {
    if (b.readUInt32LE(p) !== 0x02014b50) return null;
    const lung = b.readUInt16LE(p + 28), extra = b.readUInt16LE(p + 30), com = b.readUInt16LE(p + 32);
    const n = b.toString('utf8', p + 46, p + 46 + lung);
    if (n.endsWith(nome)) return { nome: n, compresso: b.readUInt32LE(p + 20), disteso: b.readUInt32LE(p + 24), metodo: b.readUInt16LE(p + 10) };
    p += 46 + lung + extra + com;
  }
  return null;
}

/* ---------------------------------------------------------------------
   IL TELEFONO VERO — quando c'e'.
   'am start -W' riporta TotalTime: il tempo fino al PRIMO FOTOGRAMMA
   dell'attivita'. Va detto con chiarezza che NON e' il nostro 'giocabile':
   dentro quel fotogramma la WebView ha appena cominciato a leggere l'HTML.
   Il tempo vero sul telefono e' TotalTime PIU' il costo della WebView, che
   e' quello che il banco stima coi freni. Chi legge il numero senza questa
   frase lo legge sbagliato.
   --------------------------------------------------------------------- */
/* Un filo di WebSocket verso la WebView, come fa android/cdp.js: node ha
   WebSocket globale, quindi non serve nessuna dipendenza. */
function apriFilo(url) {
  return new Promise((ok, no) => {
    const ws = new WebSocket(url);
    let n = 0, morto = false; const attesa = new Map();
    const scaduto = setTimeout(() => no(new Error('la WebView non risponde')), 20000);
    /* IL FILO MUORE, ed e' normale: dopo un Page.reload la WebView butta
       giu' il bersaglio DevTools e ne apre un altro, circa due secondi
       dopo. Alla prima stesura ogni domanda successiva restava appesa fino
       alla scadenza e la misura sul telefono usciva vuota tre volte su tre.
       Qui la chiusura si vede subito: le domande in coda vengono liberate
       e chi sta sopra sa che deve riattaccare il filo. */
    const uccidi = () => {
      morto = true; clearTimeout(scaduto);
      for (const [id, r] of attesa) r({ morto: true });
      attesa.clear();
    };
    ws.onclose = uccidi;
    ws.onopen = () => {
      clearTimeout(scaduto);
      ok({
        get morto() { return morto; },
        manda(metodo, params = {}) {
          if (morto) return Promise.resolve({ morto: true });
          const id = ++n;
          try { ws.send(JSON.stringify({ id, method: metodo, params })); } catch (e) { uccidi(); return Promise.resolve({ morto: true }); }
          return new Promise(res => {
            attesa.set(id, res);
            setTimeout(() => { if (attesa.has(id)) { attesa.delete(id); res({ scaduto: true }); } }, 20000);
          });
        },
        chiudi() { try { ws.close(); } catch (e) { } },
      });
    };
    ws.onerror = () => { clearTimeout(scaduto); if (!morto) { morto = true; no(new Error('websocket rifiutato')); } };
    ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && attesa.has(m.id)) { attesa.get(m.id)(m); attesa.delete(m.id); } };
  });
}

/* ---------------------------------------------------------------------
   DENTRO LA WEBVIEW DEL TELEFONO — la misura che non stima niente.

   'am start -W' si ferma al primo fotogramma dell'attivita': da li' in poi
   la WebView legge l'HTML e nessuno la guarda. Ma l'APK accende
   setWebContentsDebuggingEnabled(true) (android/Gioco.java), quindi la
   stessa sonda che gira sul banco si puo' iniettare NELLA WEBVIEW VERA e
   leggere le stesse fasi sul telefono. Niente piu' fattore 4x da credere
   sulla parola: qui il numero e' il numero.

   Un limite, e va detto invece che nascosto: la sonda si installa a
   processo gia' acceso e poi si ricarica la pagina. Quindi questi
   millisecondi sono a WEBVIEW CALDA. Il costo di LEGGERE, ANALIZZARE ed
   ESEGUIRE il file e' vero e completo; il costo di accendere il processo
   e la WebView non c'e' dentro — quello e' il TotalTime di 'am start', e
   i due si sommano.
   --------------------------------------------------------------------- */
async function dentroWebView(adb, dev, giri) {
  const sh = (...a) => execFileSync(adb, ['-s', dev, ...a], { encoding: 'utf8', timeout: 120000 });
  let presa = null;
  try {
    const unix = sh('shell', 'cat', '/proc/net/unix');
    const m = unix.match(/@(webview_devtools_remote_\S+)/);
    if (!m) { console.log('  --    la WebView non espone il socket di debug: salto la misura interna'); return null; }
    presa = m[1];
    sh('forward', 'tcp:9222', 'localabstract:' + presa);
    let pagina = null;
    for (let i = 0; i < 30 && !pagina; i++) {
      try {
        const l = await (await fetch('http://127.0.0.1:9222/json/list')).json();
        pagina = l.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
      } catch (e) { }
      if (!pagina) await new Promise(r => setTimeout(r, 500));
    }
    if (!pagina) { console.log('  --    nessuna pagina nella WebView: salto'); return null; }

    /* riattacca il filo al bersaglio corrente, qualunque sia */
    const riattacca = async () => {
      for (let i = 0; i < 20; i++) {
        try {
          const l = await (await fetch('http://127.0.0.1:9222/json/list')).json();
          const p = l.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
          if (p) return await apriFilo(p.webSocketDebuggerUrl);
        } catch (e) { }
        await new Promise(r => setTimeout(r, 400));
      }
      return null;
    };

    const esiti = [];
    for (let g = 0; g < giri; g++) {
      let c = await apriFilo(pagina.webSocketDebuggerUrl).catch(() => null);
      if (!c) c = await riattacca();
      if (!c) { console.log(`        giro ${g + 1}: nessun filo con la WebView`); continue; }
      await c.manda('Page.enable');      // senza questo l'init script NON viene installato
      await c.manda('Runtime.enable');
      await c.manda('Page.addScriptToEvaluateOnNewDocument', { source: '(' + SONDA.toString() + ')()' });
      await c.manda('Page.reload', { ignoreCache: true });
      let fasi = null, parziale = null;
      /* UN GIRO A META' VALE PIU' DI NIENTE. Alla prima stesura il giro
         veniva buttato via se 'giocabile' non arrivava — e su un emulatore
         senza schermo non arriva mai, perche' l'HUD non si disegna. Cosi'
         si perdeva anche l'unico numero che sul telefono nessuno aveva mai
         avuto: quanto costa DAVVERO leggere e compilare il file su Android.
         Adesso quello che c'e' si tiene, e quello che manca si dichiara. */
      const fine = Date.now() + 180000;   // tre minuti per giro, poi si molla
      while (Date.now() < fine) {
        await new Promise(r => setTimeout(r, 400));
        const r = await c.manda('Runtime.evaluate', {
          expression: 'JSON.stringify(window.__avvio ? {f:window.__avvio.fasi, n:window.__avvio.note, sd:!!window.__avvio.senzaDisegno} : null)',
          returnByValue: true,
        });
        if (r.morto || r.scaduto) {
          const n = await riattacca();
          if (!n) break;
          c.chiudi(); c = n;
          continue;
        }
        const v = r.result && r.result.result && r.result.result.value;
        const o = v ? JSON.parse(v) : null;
        if (o && o.f && o.f.hook !== undefined) parziale = o;
        if (o && o.f && o.f.giocabile !== undefined && o.f.giocabile > 0) { fasi = o; break; }
        /* dopo quaranta secondi, se la lettura del file c'e' ma la palla no,
           si tiene quello che c'e' e si dichiara cosa manca */
        if (parziale && Date.now() > fine - 140000) break;
      }
      c.chiudi();
      if (!fasi && !parziale) { console.log(`        giro ${g + 1}: nessuna risposta dalla WebView`); continue; }
      const f = (fasi || parziale).f;
      const gioc = (f.giocabile !== undefined && f.giocabile > 0) ? f.giocabile : -1;
      esiti.push({ analisi: f.dcl || 0, disegno: f.fcp === undefined ? -1 : f.fcp, hook: f.hook || 0, giocabile: gioc, sd: !!(fasi || parziale).sd });
      console.log(`        giro ${g + 1}: analisi ${(f.dcl || 0).toFixed(0)} ms, pronto ${(f.hook || 0).toFixed(0)} ms, ` +
        (f.fcp === undefined ? 'disegno NON RIPORTATO da questo dispositivo' : `disegno ${f.fcp.toFixed(0)} ms`) +
        `, giocabile ${gioc > 0 ? gioc.toFixed(0) + ' ms' : 'MAI (la partita non arriva a disegnare i comandi qui)'}`);
    }
    if (!esiti.length) return null;
    const soloVeri = n => esiti.map(e => e[n]).filter(x => x > 0);
    return {
      analisi: soloVeri('analisi').length ? mediana(soloVeri('analisi')) : -1,
      hook: soloVeri('hook').length ? mediana(soloVeri('hook')) : -1,
      disegno: soloVeri('disegno').length ? mediana(soloVeri('disegno')) : -1,
      giocabile: soloVeri('giocabile').length ? mediana(soloVeri('giocabile')) : -1,
      quanti: esiti.length, senzaDisegno: esiti.every(e => e.sd),
    };
  } catch (e) {
    console.log('  --    misura dentro la WebView fallita (' + String(e.message).split('\n')[0] + '): salto, senza inventare');
    return null;
  } finally {
    if (presa) { try { execFileSync(adb, ['-s', dev, 'forward', '--remove', 'tcp:9222'], { stdio: 'pipe' }); } catch (e) { } }
  }
}

function trovaAdb() {
  const candidati = ['adb'];
  const sdk = (process.env.ANDROID_SDK || process.env.ANDROID_HOME || path.join(process.env.USERPROFILE || '', 'Android', 'Sdk')).replace(/\\/g, '/');
  candidati.push(sdk + '/platform-tools/adb.exe', sdk + '/platform-tools/adb');
  for (const c of candidati) {
    try { execFileSync(c, ['version'], { stdio: 'pipe', timeout: 20000 }); return c; } catch (e) { }
  }
  return null;
}
async function adbSuTelefono(giri) {
  const adb = trovaAdb();
  if (!adb) { console.log('  --    adb non trovato ne\' nel PATH ne\' nell\'SDK: misura sul telefono SALTATA (non inventata)'); return null; }
  console.log(`  --    adb: ${adb === 'adb' ? 'dal PATH' : adb}`);
  let lista = '';
  try { lista = execFileSync(adb, ['devices'], { encoding: 'utf8', timeout: 60000 }); } catch (e) { console.log('  --    adb devices non risponde: SALTO'); return null; }
  const disp = lista.split('\n').slice(1).map(r => r.trim()).filter(r => /\tdevice$/.test(r)).map(r => r.split('\t')[0]);
  if (!disp.length) { console.log('  --    adb c\'e\' ma NESSUN dispositivo o emulatore e\' collegato: misura sul telefono SALTATA (non inventata)'); return null; }
  const dev = disp[0];
  console.log(`  --    dispositivo: ${dev}`);
  const sh = (...a) => execFileSync(adb, ['-s', dev, ...a], { encoding: 'utf8', timeout: 300000 });
  try {
    const pacchetti = sh('shell', 'pm', 'list', 'packages', PACCHETTO);
    if (!pacchetti.includes(PACCHETTO)) {
      if (!fs.existsSync(APK)) { console.log('  --    ' + APK + ' non esiste: niente da installare, SALTO'); return null; }
      console.log('  --    installo ' + path.relative(RADICE, APK) + ' ...');
      sh('install', '-r', APK);
    }
    /* il primo avvio dopo l'installazione paga la compilazione: si scarta */
    sh('shell', 'am', 'force-stop', PACCHETTO);
    sh('shell', 'am', 'start', '-W', '-n', `${PACCHETTO}/${ATTIVITA}`);
    sh('shell', 'am', 'force-stop', PACCHETTO);
    const tot = [], att = [];
    for (let g = 0; g < giri; g++) {
      const out = sh('shell', 'am', 'start', '-W', '-S', '-n', `${PACCHETTO}/${ATTIVITA}`);
      const t = (out.match(/TotalTime:\s*(\d+)/) || [])[1];
      const w = (out.match(/WaitTime:\s*(\d+)/) || [])[1];
      if (t) tot.push(+t); if (w) att.push(+w);
      console.log(`        giro ${g + 1}: TotalTime ${t || '?'} ms, WaitTime ${w || '?'} ms`);
      sh('shell', 'am', 'force-stop', PACCHETTO);
    }
    if (!tot.length) { console.log('  --    am start non ha riportato TotalTime: SALTO'); return null; }
    /* e adesso la parte che nessuno aveva mai guardato: dentro la WebView */
    sh('shell', 'am', 'start', '-W', '-n', `${PACCHETTO}/${ATTIVITA}`);
    console.log('  --    dentro la WebView (sonda iniettata via CDP, pagina ricaricata):');
    const dentro = await dentroWebView(adb, dev, Math.min(3, giri));
    sh('shell', 'am', 'force-stop', PACCHETTO);
    return { dev, tot: mediana(tot), att: att.length ? mediana(att) : -1, giri: tot, dentro };
  } catch (e) {
    console.log('  --    adb ha fallito (' + String(e.message).split('\n')[0] + '): SALTO, senza inventare');
    return null;
  }
}

(async () => {
  const soglia = +arg('soglia', 2000);
  const freni = String(arg('freni', '1,4,6')).split(',').map(Number).filter(n => n > 0);
  const cancello = +arg('cancello', 4);
  const giri = +arg('giri', 3);
  const ballo = +arg('ballo', 20);
  const sabota = +arg('sabota', 0);
  const zav = +arg('zavorra', 0);
  const attesa = +arg('attesa', 0);
  if (!freni.includes(cancello)) freni.push(cancello);

  const file = path.join(RADICE, GIOCO);
  const sorgente = fs.readFileSync(file, 'utf8');
  const grezzo = fs.statSync(file).size;
  const gz = zlib.gzipSync(Buffer.from(sorgente, 'utf8'), { level: 9 }).length;
  const kB = grezzo / 1024;

  console.log('=== AVVIO — il tempo fra l\'icona e la palla ===\n');
  console.log(`file      ${GIOCO}`);
  console.log(`peso      ${(grezzo / 1024).toFixed(0)} kB disteso  (${grezzo} byte)`);
  console.log(`compresso ${(gz / 1024).toFixed(0)} kB gzip -9     (${(gz / grezzo * 100).toFixed(1)}% dell'originale)`);
  const dentro = dentroApk(APK, GIOCO);
  if (dentro) {
    const eta = fs.statSync(APK).mtime, etaFile = fs.statSync(file).mtime;
    console.log(`nell'APK  ${(dentro.compresso / 1024).toFixed(0)} kB compressi su ${(dentro.disteso / 1024).toFixed(0)} kB distesi (metodo ${dentro.metodo === 8 ? 'deflate' : dentro.metodo})`);
    if (dentro.disteso !== grezzo) {
      console.log(`          ATTENZIONE: l'APK porta una versione VECCHIA del gioco (${(dentro.disteso / 1024).toFixed(0)} kB contro ${(grezzo / 1024).toFixed(0)} kB).`);
      console.log(`          APK del ${eta.toISOString().slice(0, 10)}, gioco del ${etaFile.toISOString().slice(0, 10)}: va ricostruito prima di credere ai numeri del telefono.`);
    }
  } else console.log(`nell'APK  ${fs.existsSync(APK) ? 'non leggibile' : 'nessun APK in apk/'}`);
  console.log(`cancello  giocabile entro ${soglia} ms con la CPU rallentata ${cancello}x`);
  console.log(`          (${cancello}x e' la STIMA di un telefono di fascia media contro questo banco: fra 4x e 6x. Stima, non verita'.)`);
  if (sabota) console.log(`SABOTAGGIO ATTIVO: ${sabota} ms di lavoro sincrono iniettati prima della pagina`);
  if (zav) console.log(`ZAVORRA ATTIVA: +${zav} kB serviti prima dello script del gioco`);
  console.log('');
  console.log('le colonne, tutte da navigationStart:');
  console.log('  analisi   = DOMContentLoaded: leggere e compilare il file. E\' la fase che cresce col peso.');
  console.log('  pronto    = window.__test esiste: il testo e\' diventato programma.');
  console.log('  logica    = partita avviata, palla in campo, comandi disegnati.');
  console.log('  disegno   = first-contentful-paint: il primo pixel sullo schermo.');
  console.log('  GIOCABILE = il piu\' tardo fra logica e disegno: un dito non tocca una palla che non vede.');
  console.log('');

  /* --solo-telefono esiste per una ragione misurata: un emulatore acceso
     mangia i core del banco, e la misura nel browser ne esce sfigurata
     (dispersione dal 5% al 40% nella stessa mezz'ora). Le due misure vanno
     fatte in due momenti, non nella stessa corsa. */
  const soloTelefono = bandiera('solo-telefono');
  const srv = soloTelefono ? null : await servi(sorgente);
  const browser = soloTelefono ? null : await chromium.launch();
  const perFreno = {};

  for (const freno of (soloTelefono ? [] : freni.sort((a, b) => a - b))) {
    console.log(`--- CPU rallentata ${freno}x, ${giri} esecuzioni ---`);
    const g = [];
    for (let i = 0; i < giri; i++) {
      const r = await misura(browser, srv, { freno, sabota, zav, attesa });
      g.push(r);
      console.log(`  giro ${i + 1}   analisi ${ms(r.analisi)}   pronto ${ms(r.hook)}   logica ${ms(r.logica)}   disegno ${ms(r.disegno)}${r.disegnoStimato ? '*' : ' '}   GIOCABILE ${ms(r.giocabile)}` +
        (r.note.length ? '\n           note: ' + r.note.slice(0, 3).join(' | ') : ''));
    }
    /* SOLO I VALORI VERI entrano nella mediana. Alla prima stesura i -1
       delle esecuzioni fallite ci entravano dentro, e una mediana calcolata
       su un segnaposto e' un numero inventato con l'aria di un numero
       misurato: esattamente il difetto che questo file esiste per non
       avere. */
    const voce = n => g.map(x => x[n]).filter(x => x > 0);
    const gioc = g.map(x => x.giocabile);
    const buoni = gioc.filter(x => x > 0);
    const med = {
      analisi: mediana(voce('analisi')), disegno: voce('disegno').length ? mediana(voce('disegno')) : -1,
      logica: voce('logica').length ? mediana(voce('logica')) : -1,
      hook: mediana(voce('hook')), giocabile: buoni.length ? mediana(buoni) : -1,
      /* la dispersione su UNA sola misura non esiste: dichiararla 0% e'
         una bugia comoda. Qui vale -1, e il verdetto la tratta come
         "non calcolabile", non come "perfetta". */
      dispersione: buoni.length > 1 ? (Math.max(...buoni) - Math.min(...buoni)) / mediana(buoni) * 100 : -1,
      validi: buoni.length,
      mai: gioc.filter(x => x < 0).length, prova: g[g.length - 1].prova, stimato: g[0].disegnoStimato,
      guai: [].concat(...g.map(x => x.note)).filter(n => /ECCEZIONE|mai giocabile|startMatch/.test(n)),
    };
    perFreno[freno] = med;
    console.log(`  MEDIANA  analisi ${ms(med.analisi)}   pronto ${ms(med.hook)}   logica ${ms(med.logica)}   disegno ${ms(med.disegno)}   GIOCABILE ${ms(med.giocabile)}`);
    /* la dispersione VOCE PER VOCE, non solo sul totale: e' l'unico modo
       per distinguere «il gioco e' peggiorato» da «il banco ha singhiozzato
       mentre rasterizzava». Se balla solo il disegno, non e' il gioco. */
    const sparso = n => { const v = g.map(x => x[n]).filter(x => x > 0); return v.length > 1 ? (Math.max(...v) - Math.min(...v)) / mediana(v) * 100 : 0; };
    console.log(`           dispersione: analisi ${sparso('analisi').toFixed(1)}%, logica ${sparso('logica').toFixed(1)}%, disegno ${sparso('disegno').toFixed(1)}%, GIOCABILE ${med.dispersione < 0 ? 'non calcolabile (' + med.validi + ' misure valide)' : med.dispersione.toFixed(1) + '%'}`);
    console.log(`           costo di analisi: ${(med.analisi / kB).toFixed(3)} ms per kB\n`);
  }

  /* --- la pendenza vera, da tre pesi diversi --- */
  let pendenza = null;
  if (bandiera('pendenza') && !soloTelefono) {
    console.log(`--- PENDENZA: quanto costa un kilobyte in piu' (freno ${cancello}x) ---`);
    const punti = [];
    const volute = Math.max(2, giri - 1);
    for (const extra of [0, 512, 1024]) {
      /* qui si RIPROVA, e la differenza col cancello e' di sostanza: il
         cancello deve contare i fallimenti (sono il verdetto), la pendenza
         deve raccogliere punti validi. Le riprove si dichiarano. */
      const b = [], an = []; let tentativi = 0;
      while (b.length < volute && tentativi < volute * 3) {
        tentativi++;
        const r = await misura(browser, srv, { freno: cancello, sabota: 0, zav: extra, attesa });
        if (r.analisi > 0) an.push(r.analisi);
        if (r.giocabile > 0) b.push(r.giocabile);
      }
      const y = b.length ? mediana(b) : -1;
      const a = an.length ? mediana(an) : -1;
      /* il RUMORE di questo peso: la forbice fra la misura piu' rapida e la
         piu' lenta a parita' di file. Serve dopo, per sapere se la pendenza
         che si legge e' segnale o e' il banco che respira. */
      punti.push({
        kB: kB + extra, y, a,
        rumoreY: b.length > 1 ? Math.max(...b) - Math.min(...b) : Infinity,
        rumoreA: an.length > 1 ? Math.max(...an) - Math.min(...an) : Infinity,
      });
      /* si stampa ANCHE l'analisi, e non per completezza: e' la prova che
         la zavorra sta arrivando davvero al motore. Se l'analisi non cresce
         coi kilobyte, il server non li sta servendo e tutta la pendenza e'
         un numero su niente. */
      console.log(`  ${(kB + extra).toFixed(0)} kB  ->  analisi ${ms(a)}   giocabile ${ms(y)}   (${b.map(v => v.toFixed(0)).join(', ') || 'nessuna valida'}` +
        (tentativi > b.length ? `; ${tentativi - b.length} esecuzioni perse su ${tentativi}` : '') + ')');
    }
    /* LA PENDENZA SI RIFIUTA DI ESSERE CALCOLATA quando non c'e'.
       Alla prima stesura questo blocco stampava qualunque retta gli
       uscisse: in una corsa a banco carico ha prodotto -1,821 ms/kB, cioe'
       «piu' il file e' grosso, piu' l'avvio e' rapido». Nessuno l'avrebbe
       creduto letto cosi', ma il numero sarebbe finito in un rapporto, e da
       li' in una decisione. Tre paletti, e se non li passa non c'e' nessuna
       pendenza da consegnare:
         1. servono almeno due pesi con misure valide;
         2. il SEGNALE (la differenza fra il peso piu' leggero e il piu'
            pesante) deve superare il RUMORE (la forbice peggiore a parita'
            di peso): sotto quella soglia si sta misurando il banco;
         3. la pendenza dev'essere POSITIVA, perche' un file piu' grosso non
            puo' analizzarsi piu' in fretta: una pendenza negativa non e'
            una scoperta, e' una confessione di rumore. */
    const retta = (pt, campo, campoRumore, nome) => {
      const v = pt.filter(p => p[campo] > 0);
      if (v.length < 2) { console.log(`  ${nome}: meno di due pesi validi, nessuna pendenza`); return null; }
      const mx = v.reduce((a, p) => a + p.kB, 0) / v.length;
      const my = v.reduce((a, p) => a + p[campo], 0) / v.length;
      const num = v.reduce((a, p) => a + (p.kB - mx) * (p[campo] - my), 0);
      const den = v.reduce((a, p) => a + (p.kB - mx) ** 2, 0);
      const m = num / den, fisso = my - m * mx;
      const ord = [...v].sort((a, b) => a.kB - b.kB);
      const segnale = Math.abs(ord[ord.length - 1][campo] - ord[0][campo]);
      const rumore = Math.max(...v.map(p => p[campoRumore]));
      if (!(segnale > rumore)) {
        console.log(`  ${nome}: NON MISURABILE oggi. Segnale ${segnale.toFixed(0)} ms fra ${ord[0].kB.toFixed(0)} e ${ord[ord.length - 1].kB.toFixed(0)} kB,`);
        console.log(`             rumore del banco ${isFinite(rumore) ? rumore.toFixed(0) + ' ms' : 'non stimabile'}. Il banco copre il fenomeno: piu' ripetizioni, o banco scarico.`);
        return null;
      }
      if (m <= 0) {
        console.log(`  ${nome}: pendenza NEGATIVA (${m.toFixed(3)} ms/kB). Un file piu' grosso non si analizza piu' in fretta:`);
        console.log(`             questo non e' un risultato, e' rumore. Scartata.`);
        return null;
      }
      return { ms: m, fisso, punti: v.length, segnale, rumore };
    };
    const rA = retta(punti, 'a', 'rumoreA', 'ANALISI  ');
    if (rA) console.log(`  ANALISI:   ${rA.ms.toFixed(3)} ms per kB, parte fissa ${rA.fisso.toFixed(0)} ms   <- la zavorra arriva davvero al motore, la prova e' questa crescita`);
    const rG = retta(punti, 'y', 'rumoreY', 'GIOCABILE');
    if (rG) {
      pendenza = rG;
      console.log(`  GIOCABILE: ${rG.ms.toFixed(3)} ms per kB, parte fissa ${rG.fisso.toFixed(0)} ms`);
      if (rA && rG.ms < rA.ms * 0.5) {
        console.log(`  DA LEGGERE BENE: l'avvio cresce col peso MOLTO meno di quanto cresca l'analisi.`);
        console.log(`  Vuol dire che il collo di bottiglia non sono i kilobyte: e' il lavoro che il gioco`);
        console.log(`  fa DOPO aver letto il file. Un tetto in kB sorveglia la stanza sbagliata.`);
      }
    }
    console.log('');
  }

  if (browser) await browser.close();
  if (srv) srv.chiudi();

  /* --- il telefono vero --- */
  console.log('--- IL TELEFONO VERO (adb) ---');
  const tel = bandiera('senza-adb') ? (console.log('  --    saltato su richiesta (--senza-adb)'), null) : await adbSuTelefono(Math.min(3, giri));
  if (tel) {
    console.log(`  --    TotalTime mediano: ${tel.tot} ms${tel.att >= 0 ? `, WaitTime ${tel.att} ms` : ''}`);
    console.log(`  --    TotalTime e' il tempo fino al PRIMO FOTOGRAMMA dell'attivita': fino a quando la WebView e' in`);
    console.log(`        piedi. La lettura dell'HTML comincia LI', e non e' dentro questo numero.`);
    if (tel.dentro) {
      const d = tel.dentro;
      console.log(`  --    DENTRO la WebView, a webview calda (${d.quanti} misure): analisi ${d.analisi > 0 ? d.analisi.toFixed(0) + ' ms' : 'n/d'}, pronto ${d.hook > 0 ? d.hook.toFixed(0) + ' ms' : 'n/d'},`);
      console.log(`        ${d.disegno > 0 ? 'primo disegno ' + d.disegno.toFixed(0) + ' ms' : 'primo disegno NON RIPORTATO (schermo assente: emulatore senza finestra)'}, giocabile ${d.giocabile > 0 ? d.giocabile.toFixed(0) + ' ms' : 'non raggiunto qui'}.`);
      if (d.analisi > 0) {
        const kbApk = (dentroApk(APK, GIOCO) || {}).disteso;
        if (kbApk) console.log(`  --    COSTO DI LETTURA SUL DISPOSITIVO: ${(d.analisi / (kbApk / 1024)).toFixed(3)} ms per kB su ${(kbApk / 1024).toFixed(0)} kB. Questo numero non e' stimato: e' misurato.`);
      }
      if (d.senzaDisegno) {
        console.log(`  --    Su questo dispositivo NON c'e' un primo disegno da aspettare: la WebView non dipinge (emulatore`);
        console.log(`        senza finestra), quindi la parte grafica dell'avvio qui non e' misurabile e non viene inventata.`);
        console.log(`        Vale la LETTURA del file; per la promessa intera serve un telefono con lo schermo acceso.`);
      }
      if (d.giocabile > 0) {
        console.log(`  --    SOMMA onesta di un avvio da icona spenta: ${tel.tot} + ${d.giocabile.toFixed(0)} = ${(tel.tot + d.giocabile).toFixed(0)} ms circa.`);
        console.log(`        (circa, perche' i due pezzi sono misurati in due momenti e il secondo e' a processo gia' acceso)`);
      }
      const q = dentroApk(APK, GIOCO);
      if (q && q.disteso !== grezzo) {
        console.log(`  --    E QUESTO NUMERO NON E' IL GIOCO DI OGGI: l'APK porta ${(q.disteso / 1024).toFixed(0)} kB contro i ${(grezzo / 1024).toFixed(0)} kB attuali.`);
        console.log(`        Ricostruire l'APK prima di usarlo per decidere qualcosa.`);
      }
    }
  }
  console.log('');

  /* --- il verdetto --- */
  console.log('--- VERDETTO ---');
  const c = perFreno[cancello];
  if (soloTelefono) {
    /* nessun cancello senza la misura nel browser: --solo-telefono
       raccoglie un numero, non emette una sentenza */
    console.log('  --    solo telefono: nessun cancello emesso, il verdetto ha bisogno della misura nel browser');
    return;
  }
  verifica(c && c.mai === 0, `il gioco diventa giocabile a ${cancello}x in tutte le ${giri} esecuzioni`,
    c && c.mai ? `${c.mai} esecuzioni su ${giri} non hanno mai raggiunto la palla` +
      (c.guai.length ? '\n         ' + [...new Set(c.guai)].slice(0, 3).join('\n         ') : '')
      : (c && c.prova ? `criterio: scena '${c.prova.scena}', ${c.prova.comandi} comandi disegnati, palla a (${c.prova.palla.x}, ${c.prova.palla.y})` : ''));
  verifica(c && c.giocabile > 0 && c.giocabile <= soglia,
    `giocabile in ${c && c.giocabile > 0 ? c.giocabile.toFixed(0) : 'n/d'} ms a ${cancello}x (soglia ${soglia} ms)`,
    c && c.giocabile > soglia ? `sforo di ${(c.giocabile - soglia).toFixed(0)} ms` : '');
  /* una dispersione non calcolabile NON e' una dispersione buona */
  verifica(c && c.dispersione >= 0 && c.dispersione <= ballo,
    `la misura non balla: dispersione ${c && c.dispersione >= 0 ? c.dispersione.toFixed(1) + '%' : 'NON CALCOLABILE'} su ${giri} esecuzioni (ammesso ${ballo}%)`,
    !c || c.dispersione < 0 ? `servono almeno due misure valide, ce ne sono ${c ? c.validi : 0}` :
      (c.dispersione > ballo ? 'una misura che balla piu\' del consentito non e\' un cancello: rifare a banco scarico' : ''));

  /* --- quanto puo' ancora crescere ---
     Due numeri, e vanno tenuti separati o si dicono sciocchezze:
       la PENDENZA (ms per kB) dice quanto costa crescere;
       la PARTE FISSA dice quanto costerebbe l'avvio anche a file vuoto.
     Se la parte fissa da sola supera la soglia, dimagrire non serve a
     niente e dirlo e' piu' utile che stampare un margine negativo. */
  const p = pendenza !== null ? pendenza.ms : (c ? c.analisi / kB : 0);
  const comeStimata = pendenza !== null ? 'MISURATA con la zavorra su tre pesi' : 'DEDOTTA dal solo costo di analisi — --pendenza la misura davvero';
  if (c && c.giocabile > 0 && p > 0) {
    const margine = (soglia - c.giocabile) / p;
    console.log('');
    console.log(`  costo per kilobyte a ${cancello}x: ${p.toFixed(3)} ms/kB   (${comeStimata})`);
    if (margine >= 0) {
      console.log(`  margine: il file puo' crescere ancora di +${margine.toFixed(0)} kB prima di sfondare i ${soglia} ms a ${cancello}x,`);
      console.log(`           cioe' fino a circa ${((kB + margine) / 1024).toFixed(2)} MB distesi (oggi ${(kB / 1024).toFixed(2)} MB).`);
    } else {
      console.log(`  margine: NEGATIVO. Il file e' gia' ${(-margine).toFixed(0)} kB oltre il punto in cui l'avvio sta nei ${soglia} ms a ${cancello}x.`);
      console.log(`           Per rientrare solo dimagrendo bisognerebbe scendere a ${((kB + margine) / 1024).toFixed(2)} MB.`);
    }
    if (pendenza !== null) {
      console.log(`  parte fissa: ${pendenza.fisso.toFixed(0)} ms — quello che l'avvio costa anche se il file non pesasse niente.`);
      if (pendenza.fisso > soglia) {
        console.log(`           E' GIA' SOPRA LA SOGLIA da sola: dimagrire il file NON puo' bastare, ${(pendenza.fisso - soglia).toFixed(0)} ms`);
        console.log(`           resterebbero comunque. Il lavoro sta nell'avvio, non nei kilobyte.`);
      } else {
        console.log(`           la soglia lascia ${(soglia - pendenza.fisso).toFixed(0)} ms al peso, cioe' ${((soglia - pendenza.fisso) / p).toFixed(0)} kB di file in tutto.`);
      }
    }
    console.log(`           E' un'estrapolazione LINEARE da misure fatte fra ${kB.toFixed(0)} e ${(kB + (pendenza ? 1024 : 0)).toFixed(0)} kB: piu' ci si allontana, meno vale.`);
  }

  const male = esiti.filter(x => !x).length;
  console.log(`\n${esiti.length} controlli, ${esiti.length - male} passati, ${male} falliti`);
  if (male) {
    console.log('\nUn gioco che si vende con «si apre in un secondo» e ci mette il doppio non e\' lento: e\' un gioco che mente.');
    process.exit(1);
  }
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
