/* =====================================================================
   TELEFONO — la misura sul dispositivo vero, non la stima.

   IL PERCHE'.
   Per tutta la vita di questo progetto ogni numero di prestazione e' stato
   una STIMA: il banco disegna in software, senza scheda grafica, e per
   avvicinarsi a un telefono si rallentava la CPU di quattro volte via
   DevTools. Quella stima e' costata cara. L'avvio ha portato per due
   giorni l'etichetta «dieci secondi contro un tetto di due», e sul
   telefono vero vale 1424 ms. Il tetto in kilobyte, che ha governato il
   progetto per settimane, sorvegliava un decimo del problema.

   Adesso c'e' un telefono attaccato. Questo file smette di stimare.

   E LA STIMA SBAGLIAVA ANCHE SUI PIXEL, ma nel verso opposto a quello che
   sembrava. Lo schermo di questo dispositivo e' 1080x2280 a densita' 450,
   cioe' dpr 2,8125: in orizzontale sono 2,46 megapixel, e sembrava che il
   telefono dovesse dipingerne il 63% in piu' del banco (1,51 Mpx). Detto
   cosi' era falso, e l'ho scritto io prima di misurare. MISURATO: il gioco
   limita la tela a scala 2, quindi disegna 1620x768 = 1,24 Mpx — il 18%
   MENO del banco, e il 71% della risoluzione lineare vera dello schermo.
   L'immagine viene ingrandita.
   Sono due fatti insieme e vanno tenuti tutti e due: il costo per
   fotogramma e' piu' basso di quanto si temesse, e c'e' nitidezza lasciata
   sul tavolo che si puo' comprare — al prezzo esatto di 1,98 volte i pixel
   di adesso.

   E IL LAVORO NON E' L'INTERVALLO. Su uno schermo a 60 Hz l'intervallo fra
   due fotogrammi vale 16,7 ms qualunque cosa il gioco faccia: e' il vsync,
   non il gioco. Misurando solo quello si scrive «60 al secondo» senza poter
   dire una parola sul MARGINE, che e' l'unica cosa che serve sapere prima
   di spenderlo. Qui si avvolge la funzione di fotogramma e si cronometra il
   lavoro vero: misurato, 3,2 ms a 5 contro 5 e 3,7 a 11 contro 11, cioe'
   quattro quinti del budget liberi su un telefono del 2018.

   COSA MISURA:
     - il tempo di fotogramma DENTRO il gioco, letto da requestAnimationFrame
       nella WebView vera, per ogni taglia di partita (5, 7, 11);
     - la mediana, il tipico (quinto centrale), il novantacinquesimo e il
       peggiore; e i fotogrammi PERSI, che sono la cosa che il pollice
       sente davvero;
     - la fotografia dello schermo, presa da Chromium e non da screencap
       (screencap restituisce nero sui livelli accelerati: pagato).

   LA TRAPPOLA DEL TELEFONO, che sul banco non esiste: IL CALORE. Un
   telefono che scalda abbassa la frequenza e i numeri peggiorano da soli,
   senza che il gioco sia cambiato. E' l'equivalente del banco occupato,
   e va trattato allo stesso modo: si legge la temperatura della batteria
   PRIMA e DOPO ogni misura, e se sale oltre la soglia il referto lo
   dichiara. Un numero preso a telefono caldo non si scrive da nessuna
   parte — e' la regola di casa numero 15, pagata sull'avvio.

   LA PROVA CHE SA FALLIRE: --sabota N inietta N millisecondi di lavoro
   sincrono vero dentro ogni fotogramma. Se con --sabota 20 questo file
   dice ancora che va tutto bene, il file e' rotto e va buttato.

   uso:  node strumenti/telefono.js
         node strumenti/telefono.js --taglie 5,7,11
         node strumenti/telefono.js --sec 12          durata per taglia
         node strumenti/telefono.js --giri 2          ripetizioni
         node strumenti/telefono.js --foto fuori/     salva le fotografie
         node strumenti/telefono.js --sabota 20       la prova che sa fallire
         node strumenti/telefono.js --caldo 4         gradi ammessi di salita
         node strumenti/telefono.js --installa        reinstalla l'APK prima
         node strumenti/telefono.js --rigore          la scena del duello dal
                                                      dischetto invece della
                                                      partita (vedi SONDA_RIGORE)
         node strumenti/telefono.js --apk X.apk --nome dopo --rigore
                                                      misura una costruzione
                                                      che non e' quella del repo
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const RADICE = path.resolve(__dirname, '..');
const PACCHETTO = 'it.dopolavoro.calcetto';
const ATTIVITA = 'it.dopolavoro.gioco.Gioco';
const APK = path.join(RADICE, 'apk', 'CALCETTO.apk');

const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const bandiera = n => process.argv.includes('--' + n);

function trovaAdb() {
  const sdk = (process.env.ANDROID_SDK || process.env.ANDROID_HOME ||
    path.join(process.env.USERPROFILE || '', 'Android', 'Sdk')).replace(/\\/g, '/');
  for (const c of ['adb', sdk + '/platform-tools/adb.exe', sdk + '/platform-tools/adb']) {
    try { execFileSync(c, ['version'], { stdio: 'pipe', timeout: 20000 }); return c; } catch (e) { }
  }
  return null;
}

/* ---------------------------------------------------------------------
   IL FILO CON LA WEBVIEW. Node ha WebSocket globale, quindi nessuna
   dipendenza. Il filo MUORE dopo un reload — la WebView butta giu' il
   bersaglio e ne apre un altro un paio di secondi dopo — quindi la
   chiusura si vede subito e chi sta sopra sa che deve riattaccare.
   --------------------------------------------------------------------- */
function apriFilo(url) {
  return new Promise((ok, no) => {
    const ws = new WebSocket(url);
    let n = 0, morto = false;
    const attesa = new Map();
    const scaduto = setTimeout(() => no(new Error('la WebView non risponde')), 20000);
    const uccidi = () => {
      morto = true; clearTimeout(scaduto);
      for (const [, r] of attesa) r({ morto: true });
      attesa.clear();
    };
    ws.onclose = uccidi;
    ws.onerror = () => { clearTimeout(scaduto); if (!morto) { morto = true; no(new Error('websocket rifiutato')); } };
    ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && attesa.has(m.id)) { attesa.get(m.id)(m); attesa.delete(m.id); } };
    ws.onopen = () => {
      clearTimeout(scaduto);
      ok({
        get morto() { return morto; },
        manda(metodo, params = {}, quanto = 120000) {
          if (morto) return Promise.resolve({ morto: true });
          const id = ++n;
          try { ws.send(JSON.stringify({ id, method: metodo, params })); }
          catch (e) { uccidi(); return Promise.resolve({ morto: true }); }
          return new Promise(res => {
            attesa.set(id, res);
            setTimeout(() => { if (attesa.has(id)) { attesa.delete(id); res({ scaduto: true }); } }, quanto);
          });
        },
        chiudi() { try { ws.close(); } catch (e) { } },
      });
    };
  });
}

const pausa = ms => new Promise(r => setTimeout(r, ms));
const mediana = a => { const o = [...a].sort((x, y) => x - y); return o.length % 2 ? o[(o.length - 1) / 2] : (o[o.length / 2 - 1] + o[o.length / 2]) / 2; };
const quant = (a, q) => { const o = [...a].sort((x, y) => x - y); return o[Math.min(o.length - 1, Math.floor(o.length * q))]; };

/* ---------------------------------------------------------------------
   LA SONDA — cronometra DENTRO la pagina, su requestAnimationFrame.
   Non si misura da fuori: il viaggio del protocollo costerebbe
   millisecondi su una misura che deve distinguere 16 da 20.
   --------------------------------------------------------------------- */
function SONDA(taglia, secondi, sabota) {
  return `(async () => {
    const t = window.__test;
    if (!t) return JSON.stringify({errore:'window.__test non esiste'});
    try { t.dismissSplash && t.dismissSplash(); } catch(e){}
    /* LA TAGLIA STA IN opts.size, NON NEL PRIMO ARGOMENTO. La firma e'
       startMatch(mode, diff, opts) e la prima stesura di questo file
       chiamava startMatch(11,1): mode=11 non esiste, quindi cadeva sul
       predefinito e misurava TRE VOLTE IL CINQUE CONTRO CINQUE dichiarando
       tre taglie diverse. Il referto lo diceva pure — "10 uomini" su tutte
       e tre le righe — e nessuno l'aveva letto. Adesso la taglia si passa
       come si deve e si RILEGGE dal gioco: se non e' quella chiesta, la
       misura si butta invece di essere spacciata. */
    try { t.startMatch(1, 1, {size: ${taglia}}); } catch(e){ return JSON.stringify({errore:'startMatch: '+e.message}); }

    /* si aspetta che la partita sia DAVVERO in piedi: misurare i primi
       fotogrammi vuol dire misurare la cottura del manto, non il gioco */
    for (let i=0; i<240; i++) {
      await new Promise(r=>requestAnimationFrame(r));
      if ((t.state==='play'||t.state==='kickoff') && t.ball) break;
    }
    for (let i=0; i<60; i++) await new Promise(r=>requestAnimationFrame(r));

    /* IL LAVORO, NON L'INTERVALLO — e questa e' la differenza fra sapere
       e credere di sapere.
       L'intervallo fra due requestAnimationFrame e' INCHIODATO al refresh
       dello schermo: su un telefono a 60 Hz vale 16,7 ms qualunque cosa il
       gioco faccia, che usi tre millisecondi o quindici. La prima stesura
       di questo file misurava solo quello e stampava «60 al secondo» con
       aria soddisfatta, senza poter dire UNA PAROLA sul margine — che e'
       l'unica cosa che serve sapere prima di spendere il margine in
       grafica.
       Qui si avvolge la funzione di fotogramma del gioco e si cronometra
       quanto ci mette DAVVERO. Funziona perche' il gioco richiama
       requestAnimationFrame(frame) risolvendo il nome ogni volta sul
       legame globale: sostituendo quel legame, il giro successivo passa
       dalla nostra. */
    const lavoro = [];
    let ripristina = null;
    if (typeof window.frame === 'function') {
      const orig = window.frame;
      window.frame = function () {
        const a = performance.now();
        try { return orig.apply(this, arguments); }
        finally {
          /* IL SABOTAGGIO VA DENTRO LA FUNZIONE AVVOLTA, non nel giro della
             sonda. Alla prima stesura stava fuori: con --sabota 20
             l'intervallo saliva a 26,8 ms e i fotogrammi persi al 94,6%,
             ma la misura del LAVORO continuava a dire 3,8 ms — cioe' la
             prova non provava proprio la misura nuova. Un falso che non
             tocca la cosa da falsificare non e' severo, e' decorativo. */
          ${sabota > 0 ? `{ const f = performance.now(); while (performance.now() - f < ${sabota}); }` : ''}
          lavoro.push(performance.now() - a);
        }
      };
      ripristina = () => { window.frame = orig; };
    }

    const dt = [];
    let prec = performance.now();
    const fine = prec + ${secondi} * 1000;
    while (performance.now() < fine) {
      await new Promise(r=>requestAnimationFrame(r));
      const ora = performance.now();
      dt.push(ora - prec);
      prec = ora;
    }
    if (ripristina) ripristina();

    let scena = null, quanti = 0, tagliaVera = null;
    try { scena = t.state; quanti = (t.players||[]).length; } catch(e){}
    try { const g = t.geometria || t.campo || null; tagliaVera = g && g.taglia; } catch(e){}
    if (tagliaVera == null) { try { tagliaVera = t.taglia; } catch(e){} }
    return JSON.stringify({ dt, lavoro, scena, quanti, tagliaVera,
      avvolto: !!ripristina, dpr: window.devicePixelRatio,
      largo: window.innerWidth, alto: window.innerHeight,
      tela: (function(){ const c=document.querySelector('canvas'); return c ? c.width+'x'+c.height : '?'; })() });
  })()`;
}

/* ---------------------------------------------------------------------
   LA SONDA DEL RIGORE — la stessa cosa, su un'altra scena.

   PERCHE' SERVE. La sonda qui sopra misura una PARTITA: chiama startMatch
   e cronometra i fotogrammi della vista dall'alto. C'e' una scena in cui
   non entra mai — il DUELLO DAL DISCHETTO, cioe' il rigore visto di fronte
   — e ci sono toppe che toccano solo quella. Misurare la partita per
   giudicarle darebbe zero: un numero vero e inutile, cioe' la vittoria
   sulla colonna che ci si e' scelti.

   LA FASE SI RILEGGE DAL GIOCO A OGNI FOTOGRAMMA, e se i fotogrammi non
   sono di duello la misura si butta invece di essere spacciata. E' la
   stessa trappola in cui questo file e' gia' caduto una volta con le
   taglie — tre righe di referto che dicevano 11, 7 e 5 misurando tre volte
   il cinque contro cinque.

   LA FASE SI INCHIODA SU 'zone'. E' quella in cui il dito mira, la piu'
   lunga del duello, e quella in cui il push-in vale 1. Senza inchiodarla
   il duello scorre in 'power'/'result' e poi finisce, e la mediana
   diventerebbe il miscuglio di scene diverse — piu' la partita che
   ricomincia dopo.
   --------------------------------------------------------------------- */
function SONDA_RIGORE(secondi, sabota) {
  return `(async () => {
    const t = window.__test;
    if (!t) return JSON.stringify({errore:'window.__test non esiste'});
    try { t.dismissSplash && t.dismissSplash(); } catch(e){}
    if (!t.rigori) return JSON.stringify({errore:'window.__test.rigori non esiste'});
    try { t.rigori(); } catch(e){ return JSON.stringify({errore:'rigori(): '+e.message}); }

    /* Duel non e' esposto da __test: nella WebView il contesto globale e'
       lo stesso, quindi si legge di li'. Se un domani non ci fosse, questa
       funzione torna null e la misura si butta — non si stima. */
    const fase = () => { try { return (typeof Duel!=='undefined') ? Duel.phase : null; } catch(e){ return null; } };
    for (let i=0; i<600; i++) {
      await new Promise(r=>requestAnimationFrame(r));
      if (fase() && fase() !== 'off') break;
    }
    if (!fase() || fase()==='off') return JSON.stringify({errore:'il duello non e\\' partito'});
    for (let i=0; i<30; i++) await new Promise(r=>requestAnimationFrame(r));

    const lavoro = [];
    const fasi = {};
    let ripristina = null;
    if (typeof window.frame === 'function') {
      const orig = window.frame;
      window.frame = function () {
        try { if (typeof Duel!=='undefined') { Duel.phase='zone'; Duel.resultT=0; Duel.dito=-1; Duel.mira=false; } } catch(e){}
        const a = performance.now();
        try { return orig.apply(this, arguments); }
        finally {
          ${sabota > 0 ? `{ const f = performance.now(); while (performance.now() - f < ${sabota}); }` : ''}
          lavoro.push(performance.now() - a);
          const p = fase(); fasi[p] = (fasi[p]||0)+1;
        }
      };
      ripristina = () => { window.frame = orig; };
    }

    const dt = [];
    let prec = performance.now();
    const fine = prec + ${secondi} * 1000;
    while (performance.now() < fine) {
      await new Promise(r=>requestAnimationFrame(r));
      const ora = performance.now();
      dt.push(ora - prec);
      prec = ora;
    }
    if (ripristina) ripristina();

    let scena = null;
    try { scena = t.state; } catch(e){}
    return JSON.stringify({ dt, lavoro, scena, fasi,
      avvolto: !!ripristina, dpr: window.devicePixelRatio,
      largo: window.innerWidth, alto: window.innerHeight,
      tela: (function(){ const c=document.querySelector('canvas'); return c ? c.width+'x'+c.height : '?'; })() });
  })()`;
}

/* ---------------------------------------------------------------------
   IL CALORE — la trappola che sul banco non esiste.
   --------------------------------------------------------------------- */
function temperatura(sh) {
  try {
    const d = sh('shell', 'dumpsys', 'battery');
    const m = d.match(/temperature:\s*(\d+)/);
    if (m) return +m[1] / 10;
  } catch (e) { }
  return null;
}

(async () => {
  const taglie = String(arg('taglie', '5,7,11')).split(',').map(Number).filter(n => n > 0);
  const secondi = +arg('sec', 10);
  const giri = +arg('giri', 2);
  const sabota = +arg('sabota', 0);
  const caldoMax = +arg('caldo', 4);
  const dirFoto = arg('foto', '');

  const adb = trovaAdb();
  if (!adb) { console.error('adb non trovato ne nel PATH ne nell\'SDK.'); process.exit(2); }
  const lista = execFileSync(adb, ['devices'], { encoding: 'utf8', timeout: 60000 });
  const disp = lista.split('\n').slice(1).map(r => r.trim()).filter(r => /\tdevice$/.test(r)).map(r => r.split('\t')[0]);
  if (!disp.length) { console.error('nessun telefono collegato: questo strumento non stima, quindi si ferma.'); process.exit(2); }
  const dev = disp[0];
  const sh = (...a) => execFileSync(adb, ['-s', dev, ...a], { encoding: 'utf8', timeout: 300000 });

  const modello = sh('shell', 'getprop', 'ro.product.model').trim();
  const android = sh('shell', 'getprop', 'ro.build.version.release').trim();
  const soc = sh('shell', 'getprop', 'ro.board.platform').trim();
  const schermo = (sh('shell', 'wm', 'size').match(/(\d+x\d+)/) || [])[1] || '?';
  const dens = (sh('shell', 'wm', 'density').match(/(\d+)/) || [])[1] || '?';

  console.log('=== TELEFONO — la misura sul dispositivo vero ===\n');
  console.log(`dispositivo  ${modello}  ·  Android ${android}  ·  ${soc}`);
  console.log(`schermo      ${schermo} a densita' ${dens}  (dpr ${(dens / 160).toFixed(4)})`);
  /* --apk <file>: si misura una costruzione che NON e' quella del repo.
     Serve a confrontare prima/dopo una toppa senza scrivere nel gioco:
     stesso pacchetto e stessa chiave, quindi il telefono la accetta come
     aggiornamento e si torna indietro reinstallando apk/CALCETTO.apk. */
  const apkFuori = arg('apk', '');
  if (apkFuori) {
    const f = path.resolve(apkFuori);
    if (!fs.existsSync(f)) { console.error('APK non trovato: ' + f); process.exit(2); }
    console.log(`installo     ${f} ...`);
    sh('install', '-r', f);
    if (arg('nome', '')) console.log(`costruzione  ${arg('nome', '')}`);
  } else if (bandiera('installa')) {
    console.log(`installo     ${path.relative(RADICE, APK)} ...`);
    sh('install', '-r', APK);
  }
  if (sabota) console.log(`SABOTAGGIO ATTIVO: ${sabota} ms di lavoro sincrono in ogni fotogramma`);
  console.log('');

  /* il socket della WebView: l'APK accende setWebContentsDebuggingEnabled */
  sh('shell', 'am', 'force-stop', PACCHETTO);
  sh('shell', 'am', 'start', '-W', '-n', `${PACCHETTO}/${ATTIVITA}`);
  await pausa(2500);
  const unix = sh('shell', 'cat', '/proc/net/unix');
  const presa = (unix.match(/@(webview_devtools_remote\S*)/) || [])[1];
  if (!presa) { console.error('la WebView non espone il socket di debug: mi fermo invece di stimare.'); process.exit(2); }
  sh('forward', 'tcp:9222', 'localabstract:' + presa);

  /* L'INOLTRO VA RIFATTO A OGNI RIAVVIO DELL'APP, e questa riga e' costata
     una corsa intera a vuoto. Il socket astratto della WebView porta nel
     nome il pid del processo: se l'app si ferma e riparte, il nome cambia
     e l'inoltro resta agganciato a un socket che non esiste piu'. Da fuori
     si vede solo «nessun filo con la WebView», sei volte su sei, e sembra
     un difetto del telefono. */
  const rinnovaInoltro = () => {
    for (let i = 0; i < 20; i++) {
      try {
        const u = sh('shell', 'cat', '/proc/net/unix');
        const p = (u.match(/@(webview_devtools_remote\S*)/) || [])[1];
        if (p) {
          try { execFileSync(adb, ['-s', dev, 'forward', '--remove', 'tcp:9222'], { stdio: 'pipe' }); } catch (e) { }
          sh('forward', 'tcp:9222', 'localabstract:' + p);
          return p;
        }
      } catch (e) { }
      execFileSync(adb, ['-s', dev, 'shell', 'sleep', '0.4'], { stdio: 'pipe' });
    }
    return null;
  };

  const riattacca = async () => {
    if (!rinnovaInoltro()) return null;
    for (let i = 0; i < 25; i++) {
      try {
        const l = await (await fetch('http://127.0.0.1:9222/json/list')).json();
        const p = l.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
        if (p) return await apriFilo(p.webSocketDebuggerUrl).catch(() => null);
      } catch (e) { }
      await pausa(400);
    }
    return null;
  };

  /* ------------------------------------------------------------------
     --rigore: la stessa misura, sulla scena del duello dal dischetto.
     Blocco a se': il percorso normale qui sotto non e' toccato di una
     riga. Si esce da qui e non si arriva mai alle taglie.
     ------------------------------------------------------------------ */
  if (bandiera('rigore')) {
    const t0r = temperatura(sh);
    let tFr = t0r;
    const tutti = [];
    console.log(`SCENA: RIGORE (duello dal dischetto), fase 'zone' inchiodata.`);
    console.log(`Le taglie non c'entrano: il duello e' una scena sola.\n`);
    try {
      for (let g = 0; g < giri; g++) {
        sh('shell', 'am', 'force-stop', PACCHETTO);
        sh('shell', 'am', 'start', '-W', '-n', `${PACCHETTO}/${ATTIVITA}`);
        await pausa(2500);
        const c = await riattacca();
        if (!c) { console.log(`  giro ${g + 1}: nessun filo con la WebView`); continue; }
        await c.manda('Runtime.enable');
        let pronto = false;
        for (let i = 0; i < 60 && !pronto; i++) {
          const r = await c.manda('Runtime.evaluate', { expression: '!!window.__test', returnByValue: true });
          pronto = !!(r.result && r.result.result && r.result.result.value);
          if (!pronto) await pausa(300);
        }
        if (!pronto) { console.log(`  giro ${g + 1}: il gioco non e' arrivato a __test`); c.chiudi(); continue; }
        const r = await c.manda('Runtime.evaluate', {
          expression: SONDA_RIGORE(secondi, sabota), awaitPromise: true, returnByValue: true,
        }, (secondi + 60) * 1000);
        c.chiudi();
        const v = r.result && r.result.result && r.result.result.value;
        if (!v) { console.log(`  giro ${g + 1}: nessuna risposta`); continue; }
        const o = JSON.parse(v);
        if (o.errore) { console.log(`  giro ${g + 1}: ${o.errore}`); continue; }
        const dt = o.dt.slice(1).filter(x => x > 0 && x < 5000);
        const lav = (o.lavoro || []).slice(2).filter(x => x >= 0 && x < 5000);
        if (dt.length < 30) { console.log(`  giro ${g + 1}: solo ${dt.length} fotogrammi, non basta`); continue; }
        /* LA SCENA SI RILEGGE DAL GIOCO. Se i fotogrammi cronometrati non
           erano di duello, la misura si butta: attribuirla al duello
           sarebbe vincere sulla colonna che ci si e' scelti. */
        const tot = Object.values(o.fasi || {}).reduce((a, b) => a + b, 0);
        const zone = (o.fasi || {}).zone || 0;
        if (!tot || zone / tot < 0.98) {
          console.log(`  giro ${g + 1}: BUTTATA — solo ${zone}/${tot} fotogrammi in fase 'zone' (${JSON.stringify(o.fasi)})`);
          continue;
        }
        if (!o.avvolto) { console.log(`  giro ${g + 1}: BUTTATA — non sono riuscito ad avvolgere la funzione di fotogramma`); continue; }
        const persi = dt.filter(x => x > 25).length;
        tutti.push({
          giro: g + 1, n: dt.length, med: mediana(dt), persi, quotaPersi: persi / dt.length * 100,
          lav: mediana(lav), lav95: quant(lav, 0.95), lavPeggio: Math.max(...lav), nLav: lav.length,
          zone, tot, tela: o.tela, dpr: o.dpr, largo: o.largo, alto: o.alto,
        });
        const e = tutti[tutti.length - 1];
        console.log(`  giro ${g + 1}   ${e.n} fotogr.  fase 'zone' ${e.zone}/${e.tot}   intervallo ${e.med.toFixed(1)} ms   persi ${e.persi} (${e.quotaPersi.toFixed(1)}%)   ` +
          `LAVORO ${e.lav.toFixed(2)} ms  p95 ${e.lav95.toFixed(2)}  peggiore ${e.lavPeggio.toFixed(1)}`);
        tFr = temperatura(sh);
      }
    } finally {
      try { execFileSync(adb, ['-s', dev, 'forward', '--remove', 'tcp:9222'], { stdio: 'pipe' }); } catch (e) { }
      try { sh('shell', 'am', 'force-stop', PACCHETTO); } catch (e) { }
    }
    if (!tutti.length) { console.error('\nnessuna misura riuscita: non invento niente.'); process.exit(1); }
    const M = {
      lav: mediana(tutti.map(e => e.lav)), lav95: mediana(tutti.map(e => e.lav95)),
      peggio: Math.max(...tutti.map(e => e.lavPeggio)), persi: mediana(tutti.map(e => e.quotaPersi)),
      med: mediana(tutti.map(e => e.med)),
    };
    const ballo = tutti.length > 1 ? (Math.max(...tutti.map(e => e.lav)) - Math.min(...tutti.map(e => e.lav))) / M.lav * 100 : -1;
    console.log(`\n--- RIGORE, MEDIANA DI ${tutti.length} GIRI ---\n`);
    console.log(`  vista ${tutti[0].largo}x${tutti[0].alto} dpr ${tutti[0].dpr}  ·  tela ${tutti[0].tela}`);
    console.log(`  LAVORO per fotogramma  ${M.lav.toFixed(2)} ms   p95 ${M.lav95.toFixed(2)}   peggiore ${M.peggio.toFixed(1)}`);
    console.log(`  intervallo ${M.med.toFixed(1)} ms   fotogrammi persi ${M.persi.toFixed(1)}%   margine ${(100 - M.lav / 16.67 * 100).toFixed(0)}%`);
    if (ballo >= 0) console.log(`  ballo fra i giri ${ballo.toFixed(1)}%`);
    if (t0r != null && tFr != null) {
      const s = tFr - t0r;
      console.log(`  batteria ${t0r.toFixed(1)}°C -> ${tFr.toFixed(1)}°C (${s >= 0 ? '+' : ''}${s.toFixed(1)}°C)` +
        (s > caldoMax ? '  OLTRE LA SOGLIA: numeri di un telefono caldo, rifare a freddo' : ''));
    } else console.log('  temperatura della batteria non leggibile: non la invento.');
    if (sabota) console.log(`\n  NOTA: il sabotaggio era attivo (${sabota} ms). Se il lavoro qui sopra e' ancora basso, questo strumento e' rotto.`);
    console.log(`\n  MISURA_RIGORE ${JSON.stringify({ nome: arg('nome', ''), lav: +M.lav.toFixed(2), p95: +M.lav95.toFixed(2), peggio: +M.peggio.toFixed(1), persi: +M.persi.toFixed(1), giri: tutti.length })}`);
    process.exit(0);
  }

  const esiti = [];
  const t0 = temperatura(sh);
  let tFine = t0;

  try {
    for (const taglia of taglie) {
      for (let g = 0; g < giri; g++) {
        /* pagina nuova a ogni misura: un secondo tempo, una moviola o una
           festa lasciata a meta' cambierebbero il carico senza dirlo */
        sh('shell', 'am', 'force-stop', PACCHETTO);
        sh('shell', 'am', 'start', '-W', '-n', `${PACCHETTO}/${ATTIVITA}`);
        await pausa(2000);
        const c = await riattacca();
        if (!c) { console.log(`  ${taglia} contro ${taglia}, giro ${g + 1}: nessun filo con la WebView`); continue; }
        await c.manda('Runtime.enable');
        /* si aspetta che il gioco sia diventato programma */
        let pronto = false;
        for (let i = 0; i < 60 && !pronto; i++) {
          const r = await c.manda('Runtime.evaluate', { expression: '!!window.__test', returnByValue: true });
          pronto = !!(r.result && r.result.result && r.result.result.value);
          if (!pronto) await pausa(300);
        }
        if (!pronto) { console.log(`  ${taglia} contro ${taglia}, giro ${g + 1}: il gioco non e' arrivato a __test`); c.chiudi(); continue; }

        const r = await c.manda('Runtime.evaluate', {
          expression: SONDA(taglia, secondi, sabota), awaitPromise: true, returnByValue: true,
        }, (secondi + 40) * 1000);
        c.chiudi();
        const v = r.result && r.result.result && r.result.result.value;
        if (!v) { console.log(`  ${taglia} contro ${taglia}, giro ${g + 1}: nessuna risposta`); continue; }
        const o = JSON.parse(v);
        if (o.errore) { console.log(`  ${taglia} contro ${taglia}, giro ${g + 1}: ${o.errore}`); continue; }

        /* IL PRIMO FOTOGRAMMA SI BUTTA: contiene l'assestamento del
           motore dopo l'attesa, non il gioco. Dichiarato, non nascosto. */
        const dt = o.dt.slice(1).filter(x => x > 0 && x < 5000);
        if (dt.length < 30) { console.log(`  ${taglia} contro ${taglia}, giro ${g + 1}: solo ${dt.length} fotogrammi, non basta`); continue; }
        /* LA TAGLIA SI RILEGGE DAL GIOCO. Se il gioco dice un'altra cosa,
           la misura si butta: un numero attribuito alla taglia sbagliata
           e' peggio di nessun numero. */
        if (o.tagliaVera != null && o.tagliaVera !== taglia) {
          console.log(`  ${taglia} contro ${taglia}, giro ${g + 1}: BUTTATA — il gioco dice taglia ${o.tagliaVera}, non ${taglia}`);
          continue;
        }
        if (!o.avvolto) console.log(`  ${taglia} contro ${taglia}, giro ${g + 1}: attenzione, non sono riuscito ad avvolgere la funzione di fotogramma: niente misura del lavoro`);
        const lav = (o.lavoro || []).slice(2).filter(x => x >= 0 && x < 5000);
        const med = mediana(dt);
        /* FOTOGRAMMI PERSI: quelli che durano piu' di una volta e mezzo il
           tempo di un fotogramma pieno a 60 Hz. E' la voce che il pollice
           sente: uno scatto non e' una media, e' un fotogramma singolo. */
        const persi = dt.filter(x => x > 25).length;
        esiti.push({
          taglia, giro: g + 1, n: dt.length, med, tip: mediana(dt.filter(x => x >= quant(dt, 0.2) && x <= quant(dt, 0.8))),
          p95: quant(dt, 0.95), peggio: Math.max(...dt), persi, quotaPersi: persi / dt.length * 100,
          fps: 1000 / med, dpr: o.dpr, tela: o.tela, quanti: o.quanti, largo: o.largo, alto: o.alto,
          lav: lav.length ? mediana(lav) : -1, lav95: lav.length ? quant(lav, 0.95) : -1,
          lavPeggio: lav.length ? Math.max(...lav) : -1, nLav: lav.length,
        });
        const e = esiti[esiti.length - 1];
        console.log(`  ${taglia}v${taglia} giro ${g + 1}   ${e.n} fotogr.   intervallo ${e.med.toFixed(1)} ms (${e.fps.toFixed(0)}/s)   persi ${e.persi} (${e.quotaPersi.toFixed(1)}%)   ` +
          (e.lav >= 0 ? `LAVORO ${e.lav.toFixed(2)} ms  p95 ${e.lav95.toFixed(2)}  peggiore ${e.lavPeggio.toFixed(1)}  margine ${(100 - e.lav / 16.67 * 100).toFixed(0)}%` : 'LAVORO non misurato'));

        if (dirFoto && g === 0) {
          const c2 = await riattacca();
          if (c2) {
            const f = await c2.manda('Page.captureScreenshot', { format: 'png' });
            const b = f.result && f.result.result && f.result.result.data;
            if (b) {
              fs.mkdirSync(dirFoto, { recursive: true });
              const nome = path.join(dirFoto, `telefono-${taglia}v${taglia}.png`);
              fs.writeFileSync(nome, Buffer.from(b, 'base64'));
              console.log(`             fotografia: ${nome}`);
            }
            c2.chiudi();
          }
        }
        tFine = temperatura(sh);
      }
    }
  } finally {
    try { execFileSync(adb, ['-s', dev, 'forward', '--remove', 'tcp:9222'], { stdio: 'pipe' }); } catch (e) { }
    try { sh('shell', 'am', 'force-stop', PACCHETTO); } catch (e) { }
  }

  if (!esiti.length) { console.error('\nnessuna misura riuscita: non invento niente.'); process.exit(1); }

  console.log('\n--- MEDIANE PER TAGLIA ---\n');
  console.log('  taglia  uomini   intervallo   persi      LAVORO/fotogr.   p95    peggiore   MARGINE');
  const perTaglia = {};
  for (const t of taglie) {
    const g = esiti.filter(e => e.taglia === t);
    if (!g.length) { console.log(`  ${t} contro ${t}: nessuna misura valida`); continue; }
    const m = {
      med: mediana(g.map(e => e.med)), tip: mediana(g.map(e => e.tip)),
      p95: mediana(g.map(e => e.p95)), peggio: Math.max(...g.map(e => e.peggio)),
      persi: mediana(g.map(e => e.quotaPersi)),
      lav: mediana(g.filter(e => e.lav >= 0).map(e => e.lav)),
      lav95: mediana(g.filter(e => e.lav >= 0).map(e => e.lav95)),
      lavPeggio: Math.max(...g.map(e => e.lavPeggio)),
      /* la dispersione fra i giri: se balla, il numero non e' un cancello */
      ballo: g.length > 1 ? (Math.max(...g.map(e => e.med)) - Math.min(...g.map(e => e.med))) / mediana(g.map(e => e.med)) * 100 : -1,
      quanti: g[0].quanti,
    };
    perTaglia[t] = m;
    const marg = m.lav > 0 ? (100 - m.lav / 16.67 * 100) : null;
    console.log(`  ${String(t).padStart(2)}v${t}  ${String(m.quanti).padStart(5)}  ${m.med.toFixed(1).padStart(7)} ms  ${m.persi.toFixed(1).padStart(5)}%  ${(m.lav > 0 ? m.lav.toFixed(2) : 'n/d').padStart(13)} ms  ${(m.lav95 > 0 ? m.lav95.toFixed(2) : 'n/d').padStart(5)}  ${(m.lavPeggio > 0 ? m.lavPeggio.toFixed(1) : 'n/d').padStart(8)}  ${(marg != null ? marg.toFixed(0) + '%' : 'n/d').padStart(7)}` +
      (m.ballo >= 0 ? `   (ballo ${m.ballo.toFixed(1)}%)` : ''));
  }

  const e0 = esiti[0];
  const px = (() => { const [a, b] = String(e0.tela).split('x').map(Number); return a * b; })();
  const pxSchermo = (() => { const [a, b] = String(schermo).split('x').map(Number); return a * b; })();
  console.log(`\n--- I PIXEL, e qui c'e' una cosa da sapere ---\n`);
  console.log(`  tela ${e0.tela} = ${(px / 1e6).toFixed(2)} Mpx  ·  viewport ${e0.largo}x${e0.alto} CSS  ·  devicePixelRatio ${e0.dpr}`);
  console.log(`  banco 1830x824 = 1,51 Mpx  ·  schermo fisico ${schermo} = ${(pxSchermo / 1e6).toFixed(2)} Mpx`);
  const scala = e0.largo ? (Number(String(e0.tela).split('x')[0]) / e0.largo) : 0;
  if (scala && pxSchermo) {
    console.log(`  Il gioco limita la tela a scala ${scala.toFixed(2)} mentre il dispositivo ne chiede ${e0.dpr}:`);
    console.log(`  disegna il ${(px / pxSchermo * 100).toFixed(0)}% dei pixel dello schermo, cioe' il ${(Math.sqrt(px / pxSchermo) * 100).toFixed(0)}% della risoluzione`);
    console.log(`  lineare, e il resto lo fa l'ingrandimento. Portare la tela alla risoluzione vera`);
    console.log(`  costa ${(pxSchermo / px).toFixed(2)} volte i pixel di adesso: e' la voce di spesa piu' grossa che ci sia,`);
    console.log(`  ed e' anche la piu' redditizia in nitidezza. Col margine misurato qui sopra si decide.`);
  }

  /* --- il calore, che e' il banco occupato del telefono --- */
  console.log('\n--- IL CALORE ---');
  if (t0 == null || tFine == null) {
    console.log('  la temperatura della batteria non e\' leggibile su questo dispositivo: non la invento.');
  } else {
    const salita = tFine - t0;
    console.log(`  batteria ${t0.toFixed(1)}°C all'inizio, ${tFine.toFixed(1)}°C alla fine: ${salita >= 0 ? '+' : ''}${salita.toFixed(1)}°C.`);
    if (salita > caldoMax) {
      console.log(`  OLTRE LA SOGLIA di ${caldoMax}°C. Un telefono che scalda abbassa la frequenza da solo:`);
      console.log('  questi numeri descrivono un telefono caldo, non il gioco. Rifare a freddo.');
    } else {
      console.log(`  entro la soglia di ${caldoMax}°C: la frequenza non e' calata per il calore mentre misuravo.`);
    }
  }

  /* --- il verdetto --- */
  console.log('\n--- VERDETTO ---');
  let male = 0;
  const dimmi = (ok, testo, extra) => { if (!ok) male++; console.log((ok ? '  OK   ' : '  NO   ') + testo + (extra ? '\n         ' + extra : '')); };
  for (const t of taglie) {
    const m = perTaglia[t];
    if (!m) continue;
    dimmi(m.med <= 20, `${t} contro ${t}: fotogramma mediano ${m.med.toFixed(1)} ms (tetto 20, cioe' 50 al secondo)`);
    dimmi(m.persi <= 2, `${t} contro ${t}: fotogrammi persi ${m.persi.toFixed(1)}% (tetto 2%)`,
      m.persi > 2 ? 'uno scatto non e\' una media: e\' il singolo fotogramma che il pollice sente' : '');
    /* IL CANCELLO CHE CONTA, e che i primi due non sanno dare.
       L'intervallo e i fotogrammi persi vedono solo quando il gioco ha GIA'
       sfondato il budget: fino a quel momento restano inchiodati a 16,7 ms
       e dicono «tutto bene» sia che il gioco usi tre millisecondi sia che ne
       usi quindici. Il tetto di 11 ms e' due terzi di un fotogramma a 60 Hz:
       il terzo che resta e' quello che serve al sistema, al compositore e
       agli imprevisti. Sotto quel tetto c'e' margine da spendere; sopra, si
       sta correndo sul filo anche se il contatore dice ancora sessanta. */
    if (m.lav > 0) dimmi(m.lav <= 11,
      `${t} contro ${t}: LAVORO per fotogramma ${m.lav.toFixed(2)} ms, p95 ${m.lav95.toFixed(2)} (tetto 11 = due terzi del budget a 60 Hz) — margine ${(100 - m.lav / 16.67 * 100).toFixed(0)}%`,
      m.lav > 11 ? 'l\'intervallo restava a 16,7 ms e diceva che andava tutto bene: e\' questa la riga che dice il vero' : '');
    else console.log('  --   ' + t + ' contro ' + t + ': lavoro per fotogramma NON MISURATO (non sono riuscito ad avvolgere la funzione di fotogramma)');
  }
  if (sabota) {
    console.log('\n  NOTA: il sabotaggio era attivo. Se qui sopra e\' tutto OK, questo strumento e\' rotto.');
  }
  console.log(`\n${male === 0 ? 'tutti i controlli passati' : male + ' controlli falliti'}`);
  console.log('\nCosa questo strumento NON misura, dichiarato: la resa a occhio, il calore su una');
  console.log('partita lunga, il consumo di batteria, e il comportamento con altre app aperte.');
  if (male) process.exit(1);
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
