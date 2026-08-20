/* =====================================================================
   AVVIO-TELEFONO — il cancello dell'avvio, misurato sul telefono vero.

   IL PERCHE', in una riga: il cancello e la sonda avevano i ruoli
   scambiati.

   Fino a oggi il tempo di avvio lo giudicava `strumenti/avvio.js`, che
   misura dentro un Chromium da tavolo con la CPU rallentata 4x — cioe' un
   SIMULATORE di telefono — e bocciava sopra i 2000 ms. Ma il telefono c'e'
   ed e' attaccato al cavo. Un simulatore che condanna mentre il condannato
   e' nella stanza accanto non e' prudenza, e' pigrizia.
   E il simulatore, per sua stessa ammissione, non sapeva ripetersi: il
   censimento del 20 agosto lo ha colto a dichiarare 2083 ms con dispersione
   205,1% e, alla riesecuzione sullo stesso identico file, 4018 ms con
   dispersione 19,2%. La regola 15 di questa casa — «un numero con la
   dispersione fuori soglia non si scrive da nessuna parte» — era violata
   proprio dallo strumento che l'aveva insegnata.

   Da qui in poi: IL CANCELLO E' QUESTO FILE, e misura il telefono. Il banco
   a 4x resta come sonda (`avvio.js`), stampa e non boccia.

   ------------------------------------------------------------------
   DA QUANDO A QUANDO. Due eventi, definiti perche' chiunque li rifaccia
   uguali. Entrambi letti sull'OROLOGIO DEL TELEFONO, mai su quello del
   computer: fra i due, oggi, ci sono 3,4 secondi di scarto, e un avvio
   misurato a cavallo dei due orologi sarebbe pura invenzione.

     ICONA PREMUTA  = la riga di logcat
                      «ActivityTaskManager: START u0 {...cmp=<pacchetto>/<attivita>}»,
                      letta con `logcat -v epoch`. E' l'istante in cui il
                      sistema accetta la richiesta di lancio: esattamente
                      cio' che succede quando il dito lascia l'icona.
                      Non e' un istante scelto da noi: lo scrive Android.

     PALLONE TOCCABILE = il primo fotogramma in cui valgono tutte e tre
                      queste cose, lette da dentro la pagina:
                        a) la scena e' 'kickoff' oppure 'play';
                        b) window.__test.ball esiste con coordinate vere;
                        c) window.__test.comandiTouch non e' vuoto — cioe'
                           l'HUD e' stato DISEGNATO almeno una volta e
                           sotto il pollice c'e' davvero un comando.
                      Sono le stesse tre condizioni che la casa usa da
                      sempre: non le ho cambiate, cosi' il numero nuovo e
                      quello vecchio parlano della stessa cosa.
                      Il timbro lo mette la pagina con performance.now(),
                      convertito in orologio di sistema con
                      performance.timeOrigin. Nessun millisecondo di questo
                      numero passa dal cavo USB.

   COSA NON C'E' DENTRO, dichiarato invece che nascosto:
     — i 2600 ms di splash automatico. Sono regia, non costo di avvio, e
       chi tocca lo schermo li salta. Qui li saltiamo anche noi.
     — il tempo di reazione dell'essere umano fra il menu e il dito. Non e'
       lavoro del gioco e non si puo' ripetere uguale.
     — l'installazione dell'APK. Si misura un'app gia' installata, che e'
       la condizione in cui vive.

   ------------------------------------------------------------------
   COME SI FA A CRONOMETRARE DA DENTRO UN AVVIO A FREDDO.

   Il problema vero, e la ragione per cui nessuno l'aveva mai fatto: per
   timbrare da dentro la pagina bisogna esserci PRIMA che il gioco parta, e
   a freddo il processo non esiste ancora. La strada che sembra ovvia —
   attaccarsi con DevTools e ricaricare la pagina — e' quella che usa
   `avvio.js` oggi, e misura una WebView GIA' CALDA: motore acceso, cache
   piena, file gia' letto una volta. Non e' un avvio.

   Qui si fa cosi', e le tre righe seguenti sono il cuore dello strumento:
     1. si accende l'app e, NELLA STESSA sessione di shell (zero viaggi di
        andata e ritorno sul cavo), si aspetta che compaia il socket di
        debug della WebView. Compare quando la WebView viene creata, cioe'
        prima che l'HTML sia letto;
     2. ci si attacca e si spedisce UNA domanda sola, che installa la sonda.
        Quella domanda si accoda sul filo principale della pagina;
     3. da li' in poi ogni timbro e' della pagina.
   Nel 4 casi su 5 misurati, la sonda atterra 700-850 ms PRIMA che il gioco
   diventi programma: siamo dentro l'avvio, non dopo.

   E QUANDO SI ARRIVA TARDI, il giro non vale. La sonda se ne accorge da
   sola: se `window.__test` esiste gia' nell'istante in cui viene installata,
   vuol dire che il file era gia' stato eseguito e i timbri a monte sono
   nostri, non del gioco. Quel giro esce come NULLO e non entra in nessuna
   mediana. Non e' un dettaglio: e' successo al primo dei cinque giri di
   prova, e quel giro da solo portava la dispersione dal 17% al 38%.

   ------------------------------------------------------------------
   LA CATENA DI CUSTODIA, cioe' «stai misurando il gioco di oggi?».
   Un cancello sul telefono ha una bugia in piu' a disposizione rispetto a
   uno sul banco: puo' misurare, benissimo e con dispersione bassa, un APK
   di tre giorni fa. Quindi prima di ogni corsa si verificano tre anelli:
     1. l'md5 del file HTML dentro apk/CALCETTO.apk deve essere l'md5 del
        gioco su disco;
     2. l'md5 dell'APK installato SUL TELEFONO (letto con md5sum via adb
        sul percorso che dice `pm path`) deve essere l'md5 di
        apk/CALCETTO.apk;
     3. e i due numeri si stampano.
   Se un anello si spezza, l'esito e' PROVA NULLA (uscita 3), mai verde e
   mai rosso: non si condanna un gioco che non si e' misurato.

   ------------------------------------------------------------------
   I CODICI DI USCITA, che in questa casa distinguono il rosso dal buio:
     0  verde
     1  IL GIOCO E' ROSSO: l'avvio misurato sfora la soglia
     2  il banco e' esploso (adb si comporta in modo imprevisto)
     3  LA PROVA E' NULLA: niente adb, niente telefono, APK diverso dal
        gioco, troppi giri non validi, oppure — ed e' il punto — una
        dispersione fuori soglia. Un numero che balla non si scrive: non
        assolve e non condanna.

   ------------------------------------------------------------------
   COSA HA MISURATO, IL 20 AGOSTO 2026.
   Telefono: OnePlus 6 (ONEPLUS A6003), Android 11, schermo 1080x2280,
   seriale 01c8eb5a. Gioco md5 30279089de83, 1753 kB distesi, dentro
   l'APK md5 25921752f8c5 che e' anche quello installato.

     da icona premuta a pallone toccabile, mediana su 7 avvii a freddo:
       corsa 1   1215 ms   dispersione  7,9%   7 giri buoni su 7
       corsa 2   1222 ms   dispersione  7,0%   7 su 7
       corsa 3   1264 ms   dispersione  8,0%   7 su 7  (dentro tutti.js,
                                               banco del PC occupato 1,4-3,8x)
       corsa 4   1239 ms   dispersione 11,3%   7 su 7
     Fra le quattro corse ballano 49 ms, cioe' il 4,0% della mediana. E'
     il confronto che conta: il banco a 4x, sullo stesso identico file,
     era passato da 2083 a 4018 ms. La misura sul telefono NON e' rumorosa
     quanto quella sul banco, ed e' anche insensibile al carico del PC —
     la corsa 3 e' stata presa con il banco occupato fino a 3,8 volte.

     le fasi, mediane della corsa 4:
       icona -> primo fotogramma dell'attivita'     401 ms
       icona -> la WebView apre l'HTML              273 ms   (sta PRIMA del
                 fotogramma dell'attivita': i due si sovrappongono, ed e' la
                 ragione per cui i vecchi numeri cuciti «TotalTime + WebView»
                 sovracontavano di qualche centinaio di millisecondi)
       icona -> il file e' letto ed eseguito       1192 ms
       leggere/analizzare/eseguire il file          918 ms = 0,524 ms per kB
       da programma a pallone                        50 ms
       ICONA -> PALLONE                            1239 ms

   I CONTROLLI NEGATIVI, cioe' le volte in cui l'ho visto fallire:
     — --sabota 2000 (lavoro sincrono vero fra «programma» e «pallone»):
       ROSSO, uscita 1, 3 giri su 3, avvio 3273 ms, e il sabotaggio si
       legge nella colonna giusta (salto 2053 ms, dispersione 0,1%);
     — --adb su un percorso inesistente: uscita 3;
     — --seriale di un telefono che non c'e': uscita 3;
     — --apk su una costruzione diversa da quella installata: uscita 3;
     — --ballo 0,5 (dispersione ammessa impossibile): uscita 3, e il numero
       viene RIFIUTATO invece che scritto;
     — e una volta non l'ho nemmeno cercato: il cavo si e' staccato a meta'
       corsa e sono usciti sette giri nulli di fila. Uscita 3. Non verde.

   uso:  node strumenti/avvio-telefono.js
         --giri 7            avvii a freddo MISURATI (default 7)
         --scaldata 2        avvii a freddo buttati prima di misurare (2)
         --soglia 2000       il cancello, in ms
         --ballo 20          dispersione ammessa, in %
         --seriale 01c8eb5a  quale telefono, se ce n'e' piu' d'uno
         --adb C:\...\adb.exe  quale adb
         --sabota 2000       CONTROLLO NEGATIVO: N ms di lavoro sincrono
                             VERO dentro la pagina. Se con --sabota 2000
                             questo file dice ancora OK, e' rotto.
         --osservatore       CONTROLLO DELL'EFFETTO OSSERVATORE: misura la
                             stessa catena SENZA attaccarsi presto, e
                             confronta. Dice quanto costa guardare.
         --installa          reinstalla apk/CALCETTO.apk prima di misurare
         --apk file.apk      contro QUALE costruzione vale la catena di
                             custodia (per provarne una fuori dal repo, e
                             per far uscire rosso di custodia questo file)
         --gioco f.html      contro QUALE gioco vale la catena di custodia
                             (lo passa tutti.js quando misura una copia:
                             se non e' il file dentro l'APK installato,
                             l'esito e' PROVA NULLA, mai un verde rubato)
         --senza-custodia    misura anche se gli md5 non tornano. Da usare
                             solo sapendo che il numero non dira' di quale
                             gioco parla.
         --passi             stampa quanto ci ho messo ad attaccarmi, passo
                             per passo: serve quando i giri escono tardivi
         --diario file.json  scrive il referto grezzo
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const RADICE = path.resolve(__dirname, '..');
const APK = path.join(RADICE, 'apk', 'CALCETTO.apk');
const PACCHETTO = 'it.dopolavoro.calcetto';
const ATTIVITA = 'it.dopolavoro.gioco.Gioco';

/* uscite di casa: 0 verde, 1 il gioco e' rosso, 2 il banco e' esploso,
   3 la prova e' nulla. Le costanti hanno un nome perche' ogni process.exit
   di questo file si legga senza andare a cercare la leggenda. */
const VERDE = 0, ROSSO = 1, BANCO = 2, NULLA = 3;

function arg(n, d) {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
}
const bandiera = n => process.argv.includes('--' + n);

if (bandiera('aiuto') || process.argv.includes('-h')) {
  console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0].split('uso:')[1].replace(/^/, '  uso:'));
  process.exit(VERDE);
}

/* --- IL GIOCO PUO' ARRIVARE DA FUORI: --gioco <file> oppure GIOCO_PROVA.
   PERCHE': tutti.js da oggi passa --gioco a OGNI cancello, e questo era
   l'unico dei quattordici a ignorarlo — cioe' a verificare la catena di
   custodia contro il gioco DEL REPO mentre la batteria credeva di stare
   misurando una copia di fuori. Un cancello che misura in silenzio un
   file diverso da quello chiesto e' la malattia esatta (il bersaglio che
   si muove) per cui tutti.js esiste. Con --gioco, la custodia si verifica
   contro il file indicato: se non e' quello dentro l'APK installato,
   l'esito e' PROVA NULLA (uscita 3) — che e' il verdetto giusto, perche'
   il telefono non sta eseguendo quel file e quindi non lo si e' misurato. */
const GIOCO_FUORI = (() => {
  const i = process.argv.indexOf('--gioco');
  const v = i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')
    ? process.argv[i + 1] : (process.env.GIOCO_PROVA || '');
  if (!v) return '';
  const a = path.resolve(v);
  /* uscita 3 = prova nulla: non e' il gioco a essere rosso, e' il banco
     che non ha niente da misurare (codici di casa) */
  if (!fs.existsSync(a)) { console.error('PROVA NULLA: il gioco indicato non esiste: ' + a); process.exit(3); }
  return a;
})();

const pausa = ms => new Promise(r => setTimeout(r, ms));
const mediana = a => { const o = [...a].sort((x, y) => x - y); return o.length % 2 ? o[(o.length - 1) / 2] : (o[o.length / 2 - 1] + o[o.length / 2]) / 2; };
/* la dispersione di casa: forbice fra il piu' rapido e il piu' lento,
   in percentuale della mediana. Su UNA sola misura non esiste, e vale -1:
   dichiararla 0% sarebbe la bugia comoda che questo file esiste per non
   dire. */
const dispersione = a => (a.length > 1 ? (Math.max(...a) - Math.min(...a)) / mediana(a) * 100 : -1);
const msTxt = v => (v === undefined || v === null || v < 0 ? '   n/d' : v.toFixed(0).padStart(5) + ' ms');

/* muore dichiarando PERCHE', col codice giusto: la differenza fra «il
   gioco e' lento» e «non ho potuto misurare» e' tutto il valore di questo
   strumento, e va detta sulla riga, non dedotta dal codice di uscita. */
function nulla(perche, aggiunta) {
  console.log('\n--- VERDETTO ---');
  console.log('  PROVA NULLA (uscita 3): ' + perche);
  if (aggiunta) console.log('  ' + aggiunta);
  console.log('  Questo non e\' un rosso del gioco. Un cancello che diventa verde quando non');
  console.log('  puo\' misurare e\' peggio di nessun cancello, quindi qui non diventa verde.');
  process.exit(NULLA);
}

/* ---------------------------------------------------------------------
   TROVARE ADB. Se non c'e', l'esito e' NULLA — non verde.
   E' la riga che il mandato chiama «il punto che vale piu' di tutti».
   --------------------------------------------------------------------- */
function trovaAdb() {
  const scelto = arg('adb', '');
  if (scelto) return fs.existsSync(scelto) ? scelto : null;
  const sdk = (process.env.ANDROID_SDK || process.env.ANDROID_HOME || path.join(process.env.USERPROFILE || '', 'Android', 'Sdk')).replace(/\\/g, '/');
  for (const c of ['adb', sdk + '/platform-tools/adb.exe', sdk + '/platform-tools/adb']) {
    try { execFileSync(c, ['version'], { stdio: 'pipe', timeout: 20000 }); return c; } catch (e) { }
  }
  return null;
}

/* ---------------------------------------------------------------------
   IL FILO CON LA WEBVIEW. node ha WebSocket globale: nessuna dipendenza.
   Il filo muore da solo quando la pagina se ne va, e la morte si vede
   subito invece di restare appesa fino alla scadenza — e' la ferita che
   avvio.js ha gia' pagato tre volte su tre.
   --------------------------------------------------------------------- */
function apriFilo(url) {
  return new Promise((ok, no) => {
    const ws = new WebSocket(url);
    let n = 0, morto = false; const attesa = new Map();
    const scaduto = setTimeout(() => no(new Error('la WebView non risponde')), 15000);
    const uccidi = () => {
      morto = true; clearTimeout(scaduto);
      for (const [, r] of attesa) r({ morto: true });
      attesa.clear();
    };
    ws.onclose = uccidi;
    ws.onopen = () => {
      clearTimeout(scaduto);
      ok({
        get morto() { return morto; },
        manda(metodo, params) {
          if (morto) return Promise.resolve({ morto: true });
          const id = ++n;
          try { ws.send(JSON.stringify({ id, method: metodo, params: params || {} })); }
          catch (e) { uccidi(); return Promise.resolve({ morto: true }); }
          return new Promise(res => {
            attesa.set(id, res);
            setTimeout(() => { if (attesa.has(id)) { attesa.delete(id); res({ scaduto: true }); } }, 60000);
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
   LA SONDA — vive dentro la pagina del telefono e mette tutti i timbri.

   Ogni riga qui dentro deve reggere il motore della WebView di Android 11:
   niente sintassi che il trasporto via CDP possa storpiare, e nessuna
   costante dichiarata dopo il punto in cui la si usa (quella trappola —
   il «temporal dead zone» su un const letto da una funzione chiamata
   prima — e' viva in `avvio.js` e sul banco non si vede solo perche' li'
   la sonda arriva sempre a documento vuoto: qui arrivava a meta' e faceva
   esplodere il giro).
   --------------------------------------------------------------------- */
function SONDA(sabota) {
  var A = { fasi: {}, note: [], origine: performance.timeOrigin };
  A.installata = performance.now();
  /* IL GIRO E' TARDIVO? Se il gioco e' gia' diventato programma prima che
     io arrivassi, i timbri a monte sarebbero miei e non suoi. Me ne accorgo
     qui, e chi sta sopra butta il giro invece di scrivere un numero falso. */
  A.tardi = !!window.__test;
  window.__avvio = A;

  var marca = function (n) { if (A.fasi[n] === undefined) A.fasi[n] = performance.now(); };

  /* DOMContentLoaded: se e' gia' passato lo leggo dal registro di
     navigazione (e' bufferizzato, non si perde); se non e' passato lo
     aspetto. Cosi' il timbro c'e' in tutti e due i casi. */
  var nav = performance.getEntriesByType('navigation')[0];
  if (nav && nav.domContentLoadedEventEnd > 0) A.fasi.dcl = nav.domContentLoadedEventEnd;
  else document.addEventListener('DOMContentLoaded', function () { marca('dcl'); }, true);

  /* il primo pixel della PAGINA, che sul telefono NON e' il primo pixel del
     gioco: misurato, arriva a 352 ms, cioe' mentre il file gigante non e'
     ancora stato eseguito. E' il guscio HTML, e si chiama cosi' per non
     confonderlo mai piu' con il gioco che appare. */
  var dip = performance.getEntriesByType('paint');
  for (var i = 0; i < dip.length; i++) if (dip[i].name === 'first-contentful-paint') A.fasi.guscio = dip[i].startTime;
  try {
    new PerformanceObserver(function (l) {
      var e = l.getEntries();
      for (var k = 0; k < e.length; k++) if (e[k].name === 'first-contentful-paint') marca('guscio');
    }).observe({ type: 'paint', buffered: true });
  } catch (e) { A.note.push('paint non esposto da questa WebView'); }

  var giri = 0;
  /* il file e' un unico script gigante: questo timer non puo' scattare
     prima che il motore l'abbia finito. 'hook' e' quindi l'istante in cui
     il gioco ha smesso di essere testo ed e' diventato programma. */
  (function cerca() {
    if (!window.__test) { setTimeout(cerca, 0); return; }
    marca('hook');
    /* un fotogramma di respiro prima di chiedere la partita: chiamare
       startMatch nell'istante esatto in cui __test compare ha gia' fatto
       morire il giro di disegno con «arc: radius negative» su banco lento,
       due esecuzioni su tre. Qui si aspetta che il gioco abbia disegnato
       almeno una volta — che e' anche quello che fa un essere umano: vede,
       poi tocca. */
    requestAnimationFrame(function () { marca('fotogramma'); parti(); });
  })();

  function parti() {
    var t = window.__test;
    /* CONTROLLO NEGATIVO, e sta QUI per una ragione precisa.
       Lavoro sincrono VERO — non una costante aggiunta a un totale — messo
       nel tratto che il cancello attribuisce al gioco: fra «il file e'
       diventato programma» e «la palla e' toccabile». E' esattamente dove
       cadrebbe un difetto vero (una partita che ci mette due secondi a
       mettersi in piedi), quindi se il cancello non diventa rosso qui, non
       diventerebbe rosso nemmeno con quel difetto.
       La prima stesura lo metteva all'ingresso della sonda: li' funzionava
       solo nei giri in cui la sonda entrava presto, e nei giri tardivi il
       sabotaggio cadeva FUORI dal tratto misurato e il cancello restava
       verde. Un controllo negativo che passa a intermittenza non e' un
       controllo negativo. */
    if (sabota > 0) { var f0 = Date.now(); while (Date.now() - f0 < sabota); A.sabotata = sabota; }
    marca('comando');
    try { if (t.dismissSplash) t.dismissSplash(); } catch (x) { A.note.push('dismissSplash: ' + x.message); }
    try { t.startMatch(1, 1); } catch (x) { A.note.push('startMatch: ' + x.message); }
    requestAnimationFrame(function guarda() {
      var scena = null, palla = null, comandi = null;
      try { scena = t.state; palla = t.ball; comandi = t.comandiTouch; } catch (x) { }
      var pronto = (scena === 'kickoff' || scena === 'play') &&
        palla && typeof palla.x === 'number' &&
        comandi && comandi.length > 0;
      if (pronto) {
        marca('giocabile');
        A.prova = { scena: scena, comandi: comandi.length, x: +palla.x.toFixed(1), y: +palla.y.toFixed(1) };
        return;
      }
      if (++giri > 900) {
        A.fasi.giocabile = -1;
        A.note.push('MAI GIOCABILE dopo 900 fotogrammi: scena=' + scena + ' comandi=' + (comandi && comandi.length));
        return;
      }
      /* se la partita non e' partita (splash, salvataggio, menu) si ritenta
         ogni mezzo secondo circa, senza martellare */
      if (giri % 30 === 0) { try { if (t.dismissSplash) t.dismissSplash(); t.startMatch(1, 1); } catch (x) { } }
      requestAnimationFrame(guarda);
    });
  }
}

/* ---------------------------------------------------------------------
   UN AVVIO A FREDDO, dall'inizio alla fine.
   `presto` = ci si attacca durante il caricamento (la misura vera).
   `presto` falso = ci si attacca DOPO, a giochi fatti: serve solo al
   controllo dell'effetto osservatore, dove la parte interattiva non si
   misura perche' sarebbe contaminata.
   --------------------------------------------------------------------- */
async function unAvvio(ctx, opzioni) {
  const { adb, dev } = ctx;
  const presto = opzioni.presto !== false;
  const sh = (...a) => execFileSync(adb, ['-s', dev, ...a], { encoding: 'utf8', timeout: 300000, maxBuffer: 64 * 1024 * 1024 });
  try { sh('shell', 'am', 'force-stop', PACCHETTO); } catch (e) { return { nullo: 'force-stop fallito: ' + String(e.message).split('\n')[0] }; }
  try { sh('forward', '--remove', 'tcp:9222'); } catch (e) { }
  try { sh('logcat', '-b', 'all', '-c'); } catch (e) { try { sh('logcat', '-c'); } catch (x) { } }
  /* un respiro fra lo spegnimento e l'accensione: senza, Android a volte
     riusa il processo che sta morendo e l'avvio non e' piu' a freddo */
  await pausa(1500);

  const t0 = Date.now();
  const passi = [];
  const passo = n => passi.push(n + ' ' + (Date.now() - t0) + 'ms');

  let sock = null;
  if (presto) {
    /* am start E attesa del socket nella STESSA sessione di shell: fra
       l'accensione e la scoperta non passa nessun viaggio sul cavo, che
       costa 50-150 ms l'uno e verrebbe pagato proprio nell'istante che
       stiamo cronometrando.
       IL SOCKET SI CERCA COL PID, non col primo che capita. Il nome del
       socket astratto porta dentro il pid del processo; dopo un force-stop
       il socket del processo che sta morendo resta elencato in
       /proc/net/unix ancora per un po', e un `head -1` puo' pescare quello.
       Chi pesca quello si attacca a una pagina che non esiste, aspetta i
       due secondi di scadenza e arriva tardi: e' cosi' che due giri su tre
       uscivano NULLI nella prima stesura. */
    const cmd = 'am start -n ' + PACCHETTO + '/' + ATTIVITA + ' >/dev/null 2>&1 & i=0; while [ $i -lt 4000 ]; do ' +
      'q=$(pidof ' + PACCHETTO + '); for z in $q; do if grep -q "webview_devtools_remote_$z" /proc/net/unix; then echo "SOCK=webview_devtools_remote_$z"; exit 0; fi; done; i=$((i+1)); done';
    let out = '';
    try { out = sh('shell', cmd); } catch (e) { return { nullo: 'am start fallito: ' + String(e.message).split('\n')[0] }; }
    sock = (out.match(/SOCK=(\S+)/) || [])[1];
    passo('socket');
    if (!sock) return { nullo: 'la WebView non ha esposto il socket di debug del processo appena acceso' };
  } else {
    try { sh('shell', 'am', 'start', '-n', PACCHETTO + '/' + ATTIVITA); } catch (e) { return { nullo: 'am start fallito' }; }
    await pausa(6000);
    let unix = '';
    try { unix = sh('shell', 'cat', '/proc/net/unix'); } catch (e) { return { nullo: 'lettura di /proc/net/unix fallita' }; }
    sock = (unix.match(/@(webview_devtools_remote\S*)/) || [])[1];
    if (!sock) return { nullo: 'la WebView non ha esposto il socket di debug' };
  }

  try { sh('forward', 'tcp:9222', 'localabstract:' + sock); } catch (e) { return { nullo: 'adb forward fallito' }; }
  passo('forward');

  let pagina = null;
  for (let i = 0; i < 200 && !pagina; i++) {
    try {
      const l = await (await fetch('http://127.0.0.1:9222/json/list')).json();
      pagina = l.find(x => x.type === 'page' && x.webSocketDebuggerUrl);
    } catch (e) { }
    if (!pagina) await pausa(10);
  }
  passo('pagina');
  if (!pagina) return { nullo: 'nessuna pagina dentro la WebView' };

  const filo = await apriFilo(pagina.webSocketDebuggerUrl).catch(() => null);
  passo('filo');
  if (!filo) return { nullo: 'nessun filo con la WebView' };

  /* LA DOMANDA CHE SI ACCODA. Se il filo principale sta gia' masticando il
     megabyte e mezzo, questa risposta arriva quando ha finito; se non ha
     ancora cominciato, arriva subito. In tutti e due i casi la sonda e'
     dentro, e il caso «arrivata tardi» se lo dichiara da sola. */
  const risposta = await filo.manda('Runtime.evaluate', {
    expression: '(' + SONDA.toString() + ')(' + (opzioni.sabota || 0) + ')',
    returnByValue: true,
  });
  passo('sonda');
  if (risposta.morto || risposta.scaduto) { filo.chiudi(); return { nullo: 'il filo e\' morto prima di installare la sonda' }; }
  if (bandiera('passi')) console.log('         [passi: ' + passi.join('  ') + ']');

  let A = null;
  const scadenza = Date.now() + 120000;
  while (Date.now() < scadenza) {
    const r = await filo.manda('Runtime.evaluate', { expression: 'JSON.stringify(window.__avvio||null)', returnByValue: true });
    if (r.morto) break;
    const v = r.result && r.result.result && r.result.result.value;
    if (v) { A = JSON.parse(v); if (A.fasi.giocabile !== undefined) break; }
    await pausa(200);
  }
  filo.chiudi();

  /* i due istanti che scrive Android, non noi */
  let log = '';
  try { log = sh('logcat', '-d', '-v', 'epoch', '-s', 'ActivityTaskManager:I'); } catch (e) { return { nullo: 'logcat non leggibile' }; }
  let start = null, mostrato = null;
  for (const r of log.split('\n')) {
    if (r.indexOf(PACCHETTO) < 0) continue;
    const m = r.match(/^\s*(\d+\.\d+)/);
    if (!m) continue;
    const t = Math.round(+m[1] * 1000);
    if (/START u0/.test(r) && start === null) start = t;
    if (/Displayed/.test(r) && mostrato === null) mostrato = t;
  }
  try { sh('shell', 'am', 'force-stop', PACCHETTO); } catch (e) { }

  if (!A) return { nullo: 'la WebView non ha risposto entro 120 s' };
  if (start === null) return { nullo: 'logcat non contiene la riga START del pacchetto: manca l\'istante «icona premuta»' };
  if (A.fasi.dcl === undefined) return { nullo: 'DOMContentLoaded non registrato: manca l\'istante «programma»' };
  /* i due orologi devono essere lo stesso orologio: se navigationStart non
     cade dentro la finestra dell'avvio, uno dei due timbri viene da
     un'altra corsa e il giro non vale */
  if (!(A.origine > start && A.origine < start + 30000)) {
    return { nullo: 'navigationStart (' + A.origine.toFixed(0) + ') non cade dentro la finestra dello START (' + start + '): timbri di corse diverse' };
  }
  return { A, start, mostrato, presto };
}

/* ---------------------------------------------------------------------
   LA CATENA DI CUSTODIA — l'md5 del gioco, dell'APK e di cio' che sta
   davvero sul telefono. Vedi il preambolo: senza questi tre anelli un
   numero bassissimo puo' venire da un gioco di tre giorni fa.
   --------------------------------------------------------------------- */
function htmlDentroApk(file) {
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
    const nome = b.toString('utf8', p + 46, p + 46 + lung);
    if (nome.endsWith('CALCETTO-il-gioco.html')) {
      const off = b.readUInt32LE(p + 42);
      const nl = b.readUInt16LE(off + 26), xl = b.readUInt16LE(off + 28);
      const dati = b.slice(off + 30 + nl + xl, off + 30 + nl + xl + b.readUInt32LE(p + 20));
      const crudo = b.readUInt16LE(p + 10) === 8 ? zlib.inflateRawSync(dati) : dati;
      return { nome, byte: crudo.length, md5: crypto.createHash('md5').update(crudo).digest('hex'), compresso: b.readUInt32LE(p + 20) };
    }
    p += 46 + lung + extra + com;
  }
  return null;
}
const md5File = f => crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex');

(async () => {
  const giri = +arg('giri', 7);
  const scaldata = +arg('scaldata', 2);
  const soglia = +arg('soglia', 2000);
  const ballo = +arg('ballo', 20);
  const sabota = +arg('sabota', 0);

  console.log('=== AVVIO-TELEFONO — dall\'icona al pallone, sul telefono vero ===\n');

  const adb = trovaAdb();
  if (!adb) nulla('adb non trovato ne\' nel PATH ne\' nell\'SDK Android.',
    'Con --adb <percorso> si indica a mano. Senza telefono questo cancello non stima: tace.');
  let lista = '';
  try { lista = execFileSync(adb, ['devices'], { encoding: 'utf8', timeout: 60000 }); }
  catch (e) { nulla('«adb devices» non risponde: ' + String(e.message).split('\n')[0]); }
  const collegati = lista.split('\n').slice(1).map(r => r.trim()).filter(r => /\tdevice$/.test(r)).map(r => r.split('\t')[0]);
  if (!collegati.length) nulla('adb c\'e\' ma NESSUN telefono e\' collegato (o e\' in stato «unauthorized»/«offline»).',
    'Il cancello dell\'avvio ora vive sul telefono: senza telefono non c\'e\' misura, e senza misura non c\'e\' verdetto.');
  const voluto = arg('seriale', '');
  const dev = voluto || collegati[0];
  if (voluto && !collegati.includes(voluto)) nulla('il telefono «' + voluto + '» non e\' fra quelli collegati: ' + collegati.join(', '));
  const ctx = { adb, dev };
  const sh = (...a) => execFileSync(adb, ['-s', dev, ...a], { encoding: 'utf8', timeout: 300000, maxBuffer: 64 * 1024 * 1024 });

  let modello = '?', android = '?', schermo = '?';
  try {
    modello = sh('shell', 'getprop', 'ro.product.model').trim();
    android = sh('shell', 'getprop', 'ro.build.version.release').trim();
    schermo = (sh('shell', 'wm', 'size').match(/(\d+x\d+)/) || [])[1] || '?';
  } catch (e) { }
  console.log('telefono   ' + modello + '  ·  Android ' + android + '  ·  schermo ' + schermo + '  ·  seriale ' + dev);
  console.log('adb        ' + (adb === 'adb' ? 'dal PATH' : adb));

  /* --- catena di custodia --- */
  /* con --gioco la custodia vale contro QUEL file: vedi la nota in testa */
  const fileGioco = GIOCO_FUORI || path.join(RADICE, 'CALCETTO-il-gioco.html');
  if (!fs.existsSync(fileGioco)) nulla('il gioco non c\'e\' su disco: ' + fileGioco);
  if (GIOCO_FUORI) console.log('gioco      (fuori repo, da --gioco) ' + GIOCO_FUORI);
  const md5Gioco = md5File(fileGioco);
  const byteGioco = fs.statSync(fileGioco).size;
  /* --apk <percorso>: contro QUALE costruzione si verifica la custodia.
     Serve a due cose oneste — provare una costruzione che non e' quella
     del repo, e mostrare questo cancello ROSSO di custodia puntandolo su
     un APK che non e' quello installato. Un controllo che non si sa
     mostrare rosso non e' un controllo. */
  const apkScelto = arg('apk', '') ? path.resolve(arg('apk', '')) : APK;
  if (!fs.existsSync(apkScelto)) nulla('l\'APK indicato non esiste: ' + apkScelto);
  const dentro = htmlDentroApk(apkScelto);
  if (!dentro) nulla(path.relative(RADICE, apkScelto) + ' non contiene CALCETTO-il-gioco.html: non so cosa misurerei.');
  const md5Apk = md5File(apkScelto);
  if (bandiera('installa')) { console.log('installo   ' + apkScelto + ' ...'); try { sh('install', '-r', apkScelto); } catch (e) { nulla('installazione fallita: ' + String(e.message).split('\n')[0]); } }
  let md5Telefono = '';
  try {
    const percorso = sh('shell', 'pm', 'path', PACCHETTO).trim().replace(/^package:/, '');
    if (!percorso) nulla('il pacchetto ' + PACCHETTO + ' non e\' installato sul telefono.', 'Con --installa lo installo io da apk/CALCETTO.apk.');
    md5Telefono = (sh('shell', 'md5sum', percorso).trim().split(/\s+/)[0] || '');
  } catch (e) { nulla('non riesco a leggere l\'APK installato sul telefono: ' + String(e.message).split('\n')[0]); }

  console.log('');
  console.log('CATENA DI CUSTODIA — sto misurando il gioco di oggi?');
  console.log('  gioco su disco        ' + (byteGioco / 1024).toFixed(0) + ' kB   md5 ' + md5Gioco);
  console.log('  HTML dentro l\'APK     ' + (dentro.byte / 1024).toFixed(0) + ' kB   md5 ' + dentro.md5 + '   (' + (dentro.compresso / 1024).toFixed(0) + ' kB compressi nello zip)');
  console.log('  APK di riferimento             md5 ' + md5Apk + '   (' + path.relative(RADICE, apkScelto) + ')');
  console.log('  APK sul telefono               md5 ' + md5Telefono);
  if (!bandiera('senza-custodia')) {
    if (dentro.md5 !== md5Gioco) nulla('l\'APK porta un gioco DIVERSO da quello su disco.',
      'Ricostruisci l\'APK (android/costruisci.py) prima di far decidere qualcosa a questo cancello.');
    if (md5Telefono.toLowerCase() !== md5Apk.toLowerCase()) nulla('sul telefono c\'e\' un APK diverso da quello di riferimento.',
      'Rilancia con --installa, oppure installa a mano: la misura di un\'altra costruzione non dice niente su questa.');
  }
  console.log('  --> i tre anelli tengono: il numero qui sotto riguarda il gioco md5 ' + md5Gioco.slice(0, 12) + '.');
  console.log('');

  if (sabota) {
    console.log('CONTROLLO NEGATIVO ATTIVO: ' + sabota + ' ms di lavoro sincrono vero dentro la pagina.');
    console.log('Se con questo il cancello resta verde, il cancello e\' rotto e va buttato.\n');
  }

  console.log('gli istanti, tutti sull\'orologio DEL TELEFONO:');
  console.log('  icona     = ActivityTaskManager START in logcat: il sistema accetta il lancio.');
  console.log('  mostrata  = ActivityTaskManager Displayed: primo fotogramma dell\'attivita\'.');
  console.log('  legge     = navigationStart: la WebView comincia a leggere l\'HTML.');
  console.log('  guscio    = primo pixel della PAGINA (non del gioco: il file non e\' ancora eseguito).');
  console.log('  programma = DOMContentLoaded: il megabyte e mezzo ha finito di essere letto ed eseguito.');
  console.log('  salto     = da programma a pallone: un fotogramma di respiro, startMatch, e l\'HUD disegnato.');
  console.log('  PALLONE   = scena in campo + palla con coordinate + comandi disegnati sotto il pollice.');
  console.log('');
  console.log('--- ' + scaldata + ' avvii di scaldata (buttati) e ' + giri + ' avvii a freddo misurati ---');

  const buoni = [], nulli = [], rossi = [];
  for (let i = 0; i < scaldata; i++) {
    /* il primo avvio dopo un periodo di riposo paga il disco freddo e la
       frequenza di CPU al minimo: si butta, e si dichiara che si butta */
    const r = await unAvvio(ctx, { sabota });
    console.log('  scaldata ' + (i + 1) + ': ' + (r.nullo ? 'NULLO (' + r.nullo + ')' : 'ok, buttato'));
  }
  for (let i = 0; i < giri; i++) {
    const r = await unAvvio(ctx, { sabota });
    if (r.nullo) { nulli.push(r.nullo); console.log('  giro ' + (i + 1) + ': NULLO — ' + r.nullo); continue; }
    const { A, start, mostrato } = r;
    const f = A.fasi;
    const ep = v => (v === undefined ? -1 : A.origine + v - start);
    /* IL PALLONE, IN DUE MODI, E IL PERCHE' DI TUTTI E DUE.

       DIRETTO = l'istante vero in cui la palla e' diventata toccabile,
       letto sull'orologio del telefono. E' il numero piu' bello che si
       possa avere — ma vale SOLO se la sonda e' entrata prima che il gioco
       diventasse programma. Se e' entrata dopo, i millisecondi che ho
       impiegato ad attaccarmi finiscono dentro il numero e lo gonfiano di
       tanto quanto sono arrivato tardi. Quel ritardo lo stampo su ogni
       giro (voce «ritardo»), cosi' non e' una possibilita' teorica: e' un
       numero che chi legge vede.

       RICOSTRUITO = «programma» + «quanto ci mette il gioco, da programma
       a palla toccabile». Il primo pezzo (DOMContentLoaded) e' scritto nel
       registro di navigazione, che e' bufferizzato: lo leggo quando voglio
       e nessuna gara puo' sporcarlo. Il secondo pezzo e' un INTERVALLO
       tutto interno alla pagina (giocabile meno hook), e un intervallo non
       si sposta se lo guardo un secondo dopo.
       Quindi il ricostruito e' immune al mio ritardo, e sui giri in cui il
       diretto vale si puo' controllare che i due coincidano — che e' il
       modo di questa casa per non credere a un modello sulla parola.

       Il cancello giudica il RICOSTRUITO; il diretto gli fa da testimone. */
    const diretto = (f.giocabile > 0 && !A.tardi) ? ep(f.giocabile) : -1;
    const salto = (f.giocabile > 0 && f.hook !== undefined) ? f.giocabile - f.hook : -1;
    const ricostruito = salto > 0 ? ep(f.dcl) + salto : -1;
    const riga = {
      icona: 0, mostrata: mostrato === null ? -1 : mostrato - start, legge: A.origine - start,
      guscio: ep(f.guscio), programma: ep(f.dcl), disegna: ep(f.fotogramma), comando: ep(f.comando),
      salto, ricostruito, diretto, presto: !A.tardi,
      /* positivo = la sonda e' entrata PRIMA che il file finisse di essere
         eseguito (il giro e' pulito); negativo = sono arrivato tardi di
         tanti millisecondi, ed e' esattamente quanto il DIRETTO sarebbe
         gonfio se lo usassi. Si registra sempre, anche quando e' brutto. */
      anticipo: f.dcl - A.installata, prova: A.prova || null, note: A.note,
    };
    if (ricostruito > 0) buoni.push(riga); else rossi.push(riga);
    console.log('  giro ' + (i + 1) + ':  mostrata ' + msTxt(riga.mostrata) + '   legge ' + msTxt(riga.legge) +
      '   programma ' + msTxt(riga.programma) + '   +salto ' + msTxt(salto) +
      '   PALLONE ' + (ricostruito > 0 ? msTxt(ricostruito) : ' MAI  ') +
      /* «tardi» vuol dire: quando la sonda e' entrata, window.__test
         c'era gia'. Puo' succedere anche pochi millisecondi PRIMA di
         DOMContentLoaded, perche' il gioco si dichiara programma un attimo
         prima che il documento si chiuda — per questo qui non stampo un
         ritardo col segno meno, che si leggerebbe al contrario: dico che
         il diretto e' inservibile e di quanto sono entrato vicino a DCL. */
      (A.tardi ? '   [sonda entrata DOPO che il gioco era programma (' + riga.anticipo.toFixed(0) +
        ' ms da DCL): il diretto sarebbe gonfio del mio ritardo, il ricostruito no]'
        : '   [sonda dentro ' + riga.anticipo.toFixed(0) + ' ms prima del programma; diretto ' + msTxt(diretto) + ']'));
    if (A.note.length) console.log('           note: ' + A.note.slice(0, 3).join(' | '));
  }

  /* --- controllo dell'effetto osservatore --- */
  let osservatore = null;
  if (bandiera('osservatore')) {
    console.log('\n--- EFFETTO OSSERVATORE: quanto costa guardare ---');
    console.log('  Stessa catena, ma SENZA attaccarsi durante il caricamento: ci si attacca a giochi');
    console.log('  fatti e si legge il registro di navigazione, che e\' bufferizzato e non si perde.');
    console.log('  Se «programma» viene uguale, guardare non ha spostato la misura.');
    const senza = [];
    for (let i = 0; i < Math.max(2, Math.floor(giri / 2)); i++) {
      const r = await unAvvio(ctx, { presto: false });
      if (r.nullo) { console.log('  giro ' + (i + 1) + ': NULLO — ' + r.nullo); continue; }
      const v = r.A.origine + r.A.fasi.dcl - r.start;
      senza.push(v);
      console.log('  giro ' + (i + 1) + ': programma ' + msTxt(v) + ' (attacco tardivo, nessuna sonda durante il caricamento)');
    }
    const con = buoni.map(b => b.programma).filter(v => v > 0);
    if (senza.length && con.length) {
      const a = mediana(con), b = mediana(senza);
      osservatore = { con: a, senza: b, scarto: a - b, quanti: senza.length };
      console.log('  mediana con sonda ' + msTxt(a) + '   senza sonda ' + msTxt(b) + '   scarto ' + (a - b).toFixed(0) + ' ms (' + ((a - b) / b * 100).toFixed(1) + '%)');
    } else console.log('  non abbastanza giri validi per il confronto: NON MISURATO');
  }

  /* si lascia il telefono come lo si e' trovato: l'inoltro su tcp:9222 e'
     una risorsa condivisa, e telefono.js e giocatore.js la usano dopo di me */
  try { sh('forward', '--remove', 'tcp:9222'); } catch (e) { }

  /* --- il referto --- */
  console.log('\n--- LA MISURA ---');
  const validi = buoni.length + rossi.length;
  if (validi === 0) nulla('nessuno dei ' + giri + ' avvii ha prodotto una misura valida.',
    'Motivi raccolti: ' + [...new Set(nulli)].slice(0, 4).join(' | '));
  if (buoni.length === 0) {
    console.log('  su ' + validi + ' avvii validi, il pallone non e\' MAI diventato toccabile.');
    console.log('\n--- VERDETTO ---');
    console.log('  ROSSO (uscita 1): il gioco non arriva alla palla sul telefono vero.');
    process.exit(ROSSO);
  }

  const voce = n => buoni.map(b => b[n]).filter(v => v > 0);
  const tabella = [
    ['icona -> mostrata (primo fotogramma dell\'attivita\')', 'mostrata'],
    ['icona -> legge    (la WebView apre l\'HTML)', 'legge'],
    ['icona -> guscio   (primo pixel della pagina)', 'guscio'],
    ['icona -> programma (il file e\' letto ed eseguito)', 'programma'],
    ['   salto  programma -> pallone (lavoro del gioco)', 'salto'],
    ['icona -> PALLONE  (la promessa)', 'ricostruito'],
  ];
  for (const [testo, campo] of tabella) {
    const v = voce(campo);
    if (!v.length) { console.log('  ' + testo.padEnd(52) + '   n/d'); continue; }
    const d = dispersione(v);
    console.log('  ' + testo.padEnd(52) + msTxt(mediana(v)) + '   dispersione ' + (d < 0 ? 'non calcolabile' : d.toFixed(1) + '%'));
  }
  const kB = byteGioco / 1024;
  const lettura = voce('programma').length && voce('legge').length ? mediana(voce('programma')) - mediana(voce('legge')) : -1;
  if (lettura > 0) console.log('\n  leggere, analizzare ed eseguire il file sul telefono: ' + lettura.toFixed(0) + ' ms su ' +
    kB.toFixed(0) + ' kB = ' + (lettura / kB).toFixed(3) + ' ms per kB. Non stimato: misurato.');
  /* L'EFFETTO OSSERVATORE, DETTO SEMPRE E NON SOLO QUANDO LO SI CHIEDE.
     Attaccarsi con DevTools durante il caricamento costa qualcosa al
     telefono. Misurato il 20 agosto con --osservatore su questo stesso
     apparecchio: «programma» 1173 ms guardando contro 1126 ms senza
     guardare, cioe' 47 ms, il 4,2%. Il segno e' quello giusto — la misura
     e' PESSIMISTICA, il gioco e' un filo piu' rapido di come lo racconto —
     ma un numero senza la sua ombra e' mezzo numero. */
  console.log('  effetto osservatore: guardare costa circa 47 ms (4,2%) sulla fase di lettura, misurato');
  console.log('  il 20 agosto con --osservatore. Va a sfavore del gioco, quindi il numero qui sopra e\' prudente.');
  const p = voce('ricostruito');
  const med = mediana(p);
  const disp = dispersione(p);
  console.log('\n  ' + buoni.length + ' avvii buoni su ' + giri + ' misurati' +
    (rossi.length ? ', ' + rossi.length + ' senza pallone' : '') + (nulli.length ? ', ' + nulli.length + ' nulli' : '') + '.');
  console.log('  i numeri grezzi: [' + p.map(v => v.toFixed(0)).join(', ') + '] ms');

  /* IL TESTIMONE. Sui giri in cui la sonda e' entrata in tempo esiste anche
     la lettura diretta, che non e' ricostruita da niente. Se le due dicono
     la stessa cosa, il modo di ricostruire e' sano; se divergono, lo dico
     invece di far finta di niente — un modello che nessuno controlla e'
     una fede. */
  const dir = buoni.filter(b => b.diretto > 0);
  if (dir.length) {
    const md = mediana(dir.map(b => b.diretto));
    const mr = mediana(dir.map(b => b.ricostruito));
    console.log('  testimone: sui ' + dir.length + ' giri in cui la sonda e\' entrata in tempo, la lettura DIRETTA da\' ' +
      md.toFixed(0) + ' ms, la ricostruita ' + mr.toFixed(0) + ' ms: scarto ' + (md - mr).toFixed(0) + ' ms.');
    if (Math.abs(md - mr) > 60) console.log('  ATTENZIONE: le due letture divergono di piu\' di 60 ms. Il modo di ricostruire va guardato.');
  } else {
    console.log('  testimone: NESSUN giro con la sonda entrata in tempo, quindi la ricostruzione non e\' stata controllata in questa corsa.');
  }

  const diario = arg('diario', '');
  if (diario) {
    fs.writeFileSync(path.resolve(diario), JSON.stringify({
      quando: new Date().toISOString(), telefono: modello, seriale: dev, android,
      md5gioco: md5Gioco, md5apk: md5Apk, md5telefono: md5Telefono,
      soglia, ballo, sabota, giri, scaldata, buoni, rossi: rossi.length, nulli, osservatore,
    }, null, 1));
    console.log('  referto grezzo in ' + path.resolve(diario));
  }

  /* --- il verdetto --- */
  console.log('\n--- VERDETTO ---');

  /* LA REGOLA 15 APPLICATA A SE STESSA. Un numero che balla piu' del
     consentito non si scrive: non assolve e non condanna. E' il difetto
     per cui questo cancello e' stato riscritto, quindi qui la regola vale
     PRIMA di ogni altra cosa. */
  if (disp < 0) nulla('una sola misura valida (' + buoni.length + '): la dispersione non e\' calcolabile.',
    'Con --giri N si chiedono piu\' avvii. Un numero senza dispersione non e\' un cancello.');
  if (disp > ballo) {
    console.log('  MISURA RIFIUTATA: dispersione ' + disp.toFixed(1) + '% su ' + buoni.length + ' avvii, oltre il ' + ballo + '% ammesso.');
    console.log('  La mediana sarebbe ' + med.toFixed(0) + ' ms, e NON VA SCRITTA DA NESSUNA PARTE: e\' la regola 15');
    console.log('  di questa casa, e vale anche — soprattutto — per lo strumento che la applica.');
    console.log('  Cosa fare: rifare a telefono fermo, schermo acceso, senza altre app in avvio, con --giri piu\' alto.');
    process.exit(NULLA);
  }
  console.log('  la misura sta ferma: dispersione ' + disp.toFixed(1) + '% su ' + buoni.length + ' avvii (ammesso ' + ballo + '%).');
  if (rossi.length) console.log('  NO   ' + rossi.length + ' avvii su ' + validi + ' non sono mai arrivati al pallone.');
  else console.log('  OK   tutti gli avvii validi arrivano al pallone. Criterio: scena \'' +
    (buoni[buoni.length - 1].prova || {}).scena + '\', ' + (buoni[buoni.length - 1].prova || {}).comandi +
    ' comandi disegnati, palla a (' + (buoni[buoni.length - 1].prova || {}).x + ', ' + (buoni[buoni.length - 1].prova || {}).y + ').');

  const passa = rossi.length === 0 && med <= soglia;
  if (med <= soglia) console.log('  OK   da icona premuta a pallone toccabile: ' + med.toFixed(0) + ' ms (soglia ' + soglia + ' ms), sul telefono vero.');
  else console.log('  NO   da icona premuta a pallone toccabile: ' + med.toFixed(0) + ' ms, cioe\' ' + (med - soglia).toFixed(0) + ' ms oltre la soglia di ' + soglia + '.');

  /* LA RIGA CHE LA BATTERIA SA LEGGERE. `strumenti/tutti.js` estrae dal
     fiume di stampa le righe della forma «N controlli, M passati» e le usa
     per il cricchetto (peggiorare rispetto all'ultima corsa registrata
     toglie il verde semplice). Senza questa riga il referto d'insieme
     mostrava «OK avvio-telefono 37s» e nemmeno un millisecondo: un
     cancello che passa senza dire il suo numero e' un cancello che non si
     puo' sorvegliare. */
  const quanti = 3, passati = (rossi.length === 0 ? 1 : 0) + (med <= soglia ? 1 : 0) + 1;
  console.log('\n  ' + quanti + ' controlli, ' + passati + ' passati, ' + (quanti - passati) + ' falliti' +
    '  —  avvio ' + med.toFixed(0) + ' ms (dispersione ' + disp.toFixed(1) + '% su ' + buoni.length +
    ' avvii a freddo, ' + modello + ', gioco md5 ' + md5Gioco.slice(0, 12) + ')');

  if (passa) { console.log('\n  VERDE. E questa volta il numero viene dal telefono, non da un simulatore.'); process.exit(VERDE); }
  console.log('\n  ROSSO. Un gioco che si vende con «si apre in un secondo» e ci mette il doppio non e\' lento: mente.');
  process.exit(ROSSO);
})().catch(e => {
  /* qualunque cosa esploda qui e' il BANCO, non il gioco: uscita 2 */
  console.error('\n--- VERDETTO ---');
  console.error('  IL BANCO E\' ESPLOSO (uscita 2): ' + e.message);
  console.error('  Non e\' un giudizio sul gioco.');
  process.exit(BANCO);
});
