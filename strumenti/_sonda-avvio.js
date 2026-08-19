/* =====================================================================
   SONDA AVVIO — dove finiscono davvero i secondi prima della palla.

   IL PERCHE'.
   `avvio.js` misura la cosa giusta (il tempo fra l'icona e la palla) e la
   spezza in fasi. Ma la prima fase la chiama, testualmente, «ANALISI =
   navigationStart -> DOMContentLoaded. E' il costo di LEGGERE e COMPILARE
   il file: la fase che cresce col peso». Questa frase e' una mezza verita',
   e la meta' che manca cambia la cura.

   DOMContentLoaded non scatta quando il motore ha finito di compilare:
   scatta quando ha finito di ESEGUIRE ogni script in linea. Dentro
   «analisi» ci sono quindi tre lavori diversi sommati in un numero solo:

     1. leggere e impaginare i 2.886 righe di HTML e CSS che stanno prima
        dello script (dentro cui vivono i font e le immagini in base64);
     2. COMPILARE il megabyte e mezzo di JavaScript;
     3. ESEGUIRE tutto il primo livello di quel JavaScript — che in questo
        gioco non e' poco: applyKit, montaTabelloni, buildFieldRow,
        refreshImpostUI, la generazione delle icone SVG su ogni .vico, piu'
        ogni tabella che si costruisce in un `const` di primo livello.

   La differenza non e' accademica: e' la differenza fra due cure opposte.
   Se il peso comanda, si dimagrisce il file. Se comanda l'esecuzione, si
   RIMANDA il lavoro a dopo il primo disegno — e dimagrire non serve a
   niente. Con un numero solo non si puo' scegliere, e per settimane la
   sorveglianza e' stata un tetto in kilobyte: la stanza sbagliata.

   COME SI SEPARANO, senza toccare il file su disco.
   Il gioco ha due soli blocchi <script>, e nessuno dei due ha src. Il
   motore DEVE aver compilato per intero un blocco prima di eseguirne la
   prima istruzione. Quindi bastano quattro timbri:

     testa   un <script> minuscolo infilato SUBITO PRIMA del blocco grande
     s1      la prima istruzione DENTRO il blocco grande
     e1      l'ultima istruzione DENTRO il blocco grande
     dcl     DOMContentLoaded

   e le tre fasi si leggono per sottrazione:

     testa - 0        leggere e impaginare HTML e CSS
     s1 - testa       COMPILARE il blocco grande        <- il peso
     e1 - s1          ESEGUIRE il primo livello          <- il lavoro
     dcl - e1         il blocco piccolo in coda, e la coda del browser

   Il file su disco non viene mai toccato: i timbri vivono solo nel buffer
   che il server locale spedisce, come fa la zavorra di avvio.js.

   E POI IL PROFILO. Sapere che l'esecuzione costa N millisecondi non dice
   ancora quali. Con --profilo il campionatore della V8 gira per tutto il
   caricamento e si stampano le funzioni per tempo PROPRIO (self time), che
   e' l'unica colonna che indica dove sta il lavoro invece di dove sta
   l'attesa.

   CIO' CHE QUESTA SONDA NON SA FARE, dichiarato invece che nascosto:
     — non e' un telefono. Il banco disegna in software; i millisecondi
       assoluti non sono quelli di un telefono. Serve per le PROPORZIONI
       fra le fasi, che sono molto piu' stabili dei valori assoluti.
     — il timbro `testa` arriva dopo che il browser ha gia' cominciato a
       leggere il blocco grande in avanti (il parser HTML fa lookahead),
       quindi «compilare» qui e' il costo di compilazione VISIBILE, non
       necessariamente tutto.
     — se il banco e' occupato, questi numeri ballano come tutti gli altri.
       Per questo si misura piu' volte e si stampa la dispersione, e per
       questo il verdetto e' sulle PROPORZIONI e non sui millisecondi.

   uso:  node strumenti/_sonda-avvio.js
         node strumenti/_sonda-avvio.js --freno 4     rallentamento CPU
         node strumenti/_sonda-avvio.js --giri 3      esecuzioni
         node strumenti/_sonda-avvio.js --profilo     chi consuma il tempo
         node strumenti/_sonda-avvio.js --quante 25   quante funzioni stampare
         node strumenti/_sonda-avvio.js --file X.html quale gioco
         node strumenti/_sonda-avvio.js --conta a,b   quante volte, e da dove
         node strumenti/_sonda-avvio.js --partita     tira dritto FINO ALLA
                                                      PALLA, non solo fino a
                                                      DOMContentLoaded
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const bandiera = n => process.argv.includes('--' + n);

const GIOCO = arg('file', 'CALCETTO-il-gioco.html');
const FILE = path.join(RADICE, GIOCO);
if (!fs.existsSync(FILE)) { console.error(`non trovo ${GIOCO} dentro ${RADICE}`); process.exit(2); }
const CONTA = String(arg('conta', '')).split(',').map(s => s.trim()).filter(Boolean);

/* ---------------------------------------------------------------------
   I TIMBRI — infilati nel buffer, non nel file.
   Si rifiuta di procedere se la forma del documento non e' quella che
   crede: due blocchi <script> senza src. Se domani il gioco viene spezzato
   in piu' script, questa sonda deve FERMARSI e dirlo, non misurare la cosa
   sbagliata con l'aria di saperla.
   --------------------------------------------------------------------- */
function timbra(html) {
  const aperture = [...html.matchAll(/<script(\s[^>]*)?>/g)];
  if (aperture.length !== 2) {
    throw new Error(`mi aspetto due blocchi <script>, ne trovo ${aperture.length}. ` +
      `La sonda si ferma invece di misurare una forma che non conosce.`);
  }
  for (const a of aperture) {
    if (a[1] && /\ssrc\s*=/.test(a[1])) throw new Error('un blocco <script> ha src: questa sonda misura solo script in linea');
  }
  const apre = aperture[0].index;
  const dopoApre = apre + aperture[0][0].length;
  const chiude = html.indexOf('</script>', dopoApre);
  if (chiude < 0) throw new Error('il primo blocco <script> non si chiude');

  const TESTA = '<script>window.__F={testa:performance.now()};window.__K={};' +
    'window.__k=function(n,t,p){var k=__K[n]||(__K[n]={n:0,ms:0,quando:[],pile:[]});k.n++;k.ms+=t;' +
    'if(k.quando.length<12)k.quando.push(Math.round(performance.now()));' +
    'if(p&&k.pile.length<4){var r=String(p).split("\\n").slice(2,5).map(function(s){' +
    'var m=s.match(/at\\s+([^\\s(]+)[^:]*:(\\d+):/);return m?(m[1]+" r."+m[2]):s.trim().slice(0,40);})' +
    '.join(" <- ");k.pile.push(Math.round(performance.now())+" ms: "+r);}};</script>\n';
  const S1 = '__F.s1=performance.now();\n';
  const E1 = '\n__F.e1=performance.now();';
  const CODA = '\n<script>__F.coda=performance.now();' +
    'document.addEventListener("DOMContentLoaded",()=>{__F.dcl=performance.now();},true);' +
    'window.addEventListener("load",()=>{__F.load=performance.now();},true);' +
    'try{new PerformanceObserver(l=>{for(const e of l.getEntries()){' +
    'if(e.name==="first-paint"&&__F.fp===undefined)__F.fp=e.startTime;' +
    'if(e.name==="first-contentful-paint"&&__F.fcp===undefined)__F.fcp=e.startTime;}})' +
    '.observe({type:"paint",buffered:true});}catch(e){}</script>';

  let corpoScript = html.slice(dopoApre, chiude);
  if (CONTA.length) corpoScript = cronometra(corpoScript, CONTA);

  return html.slice(0, apre) + TESTA + html.slice(apre, dopoApre) + S1 +
    corpoScript + E1 + html.slice(chiude, chiude + 9) + CODA +
    html.slice(chiude + 9);
}

/* ---------------------------------------------------------------------
   IL CRONOMETRO PER FUNZIONE — quante volte, e per quanto.

   Il profilo a campionamento dice DOVE il processore macina, ma non dice
   QUANTE VOLTE una funzione e' stata chiamata: e la differenza fra «costa
   troppo» e «viene rifatta quattro volte» sono due cure opposte — la prima
   si ottimizza, la seconda si smette. Qui ogni funzione nominata viene
   avvolta in un cronometro nel buffer servito: si contano le chiamate, il
   tempo TOTALE (inclusi i figli, e va detto: non e' tempo proprio) e
   l'istante di ognuna delle prime dodici, che e' quello che fa vedere se
   il lavoro e' ripetuto o solo lungo.

   Si RIFIUTA di procedere se un nome non si trova esattamente una volta:
   un cronometro attaccato alla funzione sbagliata e' peggio di nessun
   cronometro, ed e' la regola di casa numero quattro.
   --------------------------------------------------------------------- */
function cronometra(src, nomi) {
  for (const nome of nomi) {
    const re = new RegExp('function\\s+' + nome + '\\s*\\(([^)]*)\\)\\s*\\{', 'g');
    const trovate = [...src.matchAll(re)];
    if (trovate.length !== 1) {
      throw new Error(`--conta ${nome}: la dichiarazione si trova ${trovate.length} volte, ne serve esattamente una. ` +
        `Un cronometro attaccato alla funzione sbagliata e' peggio di nessun cronometro.`);
    }
    const m = trovate[0];
    const params = m[1];
    /* il corpo si rinomina e si avvolge: nessuna riscrittura del corpo,
       quindi nessun rischio di rompere una parentesi o una stringa */
    const involucro = `function ${nome}(${params}){const __t0=performance.now();` +
      `try{return __orig_${nome}.apply(this,arguments);}finally{__k('${nome}',performance.now()-__t0,new Error().stack);}}\n` +
      `function __orig_${nome}(${params}){`;
    src = src.slice(0, m.index) + involucro + src.slice(m.index + m[0].length);
  }
  return src;
}

/* pesi delle tre parti del documento, in byte veri */
function pesi(html) {
  const a = html.indexOf('<script>');
  const c = html.indexOf('</script>', a);
  const B = s => Buffer.byteLength(s, 'utf8');
  return { prima: B(html.slice(0, a)), script: B(html.slice(a, c)), dopo: B(html.slice(c)) };
}

function servi(corpo) {
  return new Promise(ok => {
    const buf = Buffer.from(corpo, 'utf8');
    const s = http.createServer((req, res) => {
      const p = req.url.split('?')[0];
      const f = path.join(RADICE, decodeURIComponent(p));
      if (path.basename(f) === GIOCO) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Length': buf.length });
        res.end(buf); return;
      }
      if (!f.startsWith(RADICE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      const t = { '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.webmanifest': 'application/manifest+json' }[path.extname(f)];
      res.writeHead(200, { 'Content-Type': t || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* ---------------------------------------------------------------------
   IL PROFILO — tempo PROPRIO, non tempo totale.
   Il tempo totale di una funzione contiene quello dei suoi figli: la
   radice ha sempre il 100% e non dice niente. Il tempo proprio dice dove
   il processore sta davvero macinando.
   --------------------------------------------------------------------- */
function riassumiProfilo(p, quante) {
  const perNodo = new Map();
  for (const n of p.nodes) perNodo.set(n.id, n);
  const conta = new Map();
  /* i campioni sono una lista di id: il conteggio per id, moltiplicato per
     l'intervallo di campionamento, e' il tempo proprio */
  const dt = p.timeDeltas || [];
  const s = p.samples || [];
  for (let i = 0; i < s.length; i++) conta.set(s[i], (conta.get(s[i]) || 0) + (dt[i] || 0) / 1000);
  const righe = [];
  for (const [id, ms] of conta) {
    const n = perNodo.get(id);
    if (!n) continue;
    const f = n.callFrame || {};
    let nome = f.functionName || '(anonima)';
    if (nome === '(program)' || nome === '(idle)' || nome === '(garbage collector)' || nome === '(root)') nome = nome;
    const riga = f.lineNumber >= 0 ? f.lineNumber + 1 : '?';
    righe.push({ nome, riga, ms, url: f.url || '' });
  }
  righe.sort((a, b) => b.ms - a.ms);
  const tot = righe.reduce((a, r) => a + r.ms, 0);
  return { righe: righe.slice(0, quante), tot };
}

async function unGiro(browser, srv, { freno, profilo, quante, partita, dopo }) {
  const ctx = await browser.newContext({
    viewport: { width: 915, height: 412 }, deviceScaleFactor: 2,
    isMobile: true, hasTouch: true, locale: 'it-IT',
  });
  const pag = await ctx.newPage();
  const cdp = await ctx.newCDPSession(pag);
  if (freno > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: freno });
  if (profilo) {
    await cdp.send('Profiler.enable');
    await cdp.send('Profiler.setSamplingInterval', { interval: 200 });
    await cdp.send('Profiler.start');
  }
  const errori = [];
  pag.on('pageerror', e => errori.push(e.message));
  await pag.goto(`http://127.0.0.1:${srv.porta}/${GIOCO}?t=${Date.now()}_${Math.random()}`, { waitUntil: 'commit', timeout: 180000 });
  await pag.waitForFunction('window.__F && window.__F.dcl !== undefined', null, { timeout: 180000 });
  /* si aspetta anche il primo disegno, con pazienza dichiarata: senza, la
     fase grafica resterebbe fuori dal conto e il totale sarebbe piu' bello
     del vero */
  await pag.waitForFunction('window.__F && window.__F.fcp !== undefined', null, { timeout: 30000 }).catch(() => { });
  /* ------------------------------------------------------------------
     FINO ALLA PALLA, non fino a DOMContentLoaded.
     Le quattro fasi qui sopra si fermano a DCL, e DCL non e' il momento in
     cui l'utente aspetta: il primo pixel arriva quasi tre secondi PRIMA, e
     la palla toccabile parecchi secondi DOPO. Su un avvio misurato a 8872
     ms, DCL ne spiega 3811: i restanti cinquemila erano un buco nero.
     Qui si avvia la partita con lo stesso criterio DICHIARATO di avvio.js
     — scena 'kickoff' o 'play', palla con coordinate vere, e almeno un
     comando disegnato sotto il pollice — e i contatori delle funzioni,
     che vivono nella pagina, continuano a contare anche in questo tratto.
     ------------------------------------------------------------------ */
  if (partita) {
    await pag.evaluate(() => new Promise(fine => {
      const A = window.__F, t = window.__test;
      A.avvioPartita = performance.now();
      if (!t) { A.notaPartita = 'window.__test non esiste: niente partita'; return fine(); }
      try { t.dismissSplash && t.dismissSplash(); } catch (e) { }
      try { t.startMatch(1, 1); } catch (e) { A.notaPartita = 'startMatch: ' + e.message; }
      let giri = 0;
      (function guarda() {
        let scena = null, palla = null, comandi = null;
        try { scena = t.state; palla = t.ball; comandi = t.comandiTouch; } catch (e) { }
        if ((scena === 'kickoff' || scena === 'play') && palla && typeof palla.x === 'number' && comandi && comandi.length > 0) {
          A.giocabile = performance.now(); return fine();
        }
        if (++giri > 1200) { A.notaPartita = 'mai giocabile: scena=' + scena; return fine(); }
        if (giri % 30 === 0) { try { t.dismissSplash && t.dismissSplash(); t.startMatch(1, 1); } catch (e) { } }
        requestAnimationFrame(guarda);
      })();
    })).catch(() => { });
  }

  /* --dopo: si resta a guardare ANCHE dopo il traguardo. Serve per il
     lavoro RIMANDATO: una ricottura spostata in un momento di quiete non
     si vede se il cronometro si ferma al traguardo, e «non l'ho vista»
     verrebbe scambiato per «non succede piu'». Un lavoro rimandato che
     non avviene mai non e' una cura, e' una funzione rotta. */
  if (dopo > 0) await pag.waitForTimeout(dopo);
  const F = await pag.evaluate(() => ({ ...window.__F }));
  const K = await pag.evaluate(() => JSON.parse(JSON.stringify(window.__K || {})));
  let prof = null;
  if (profilo) {
    const r = await cdp.send('Profiler.stop');
    prof = riassumiProfilo(r.profile, quante);
  }
  if (freno > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  await ctx.close();
  return { F, K, prof, errori };
}

const mediana = a => { const o = [...a].sort((x, y) => x - y); return o.length % 2 ? o[(o.length - 1) / 2] : (o[o.length / 2 - 1] + o[o.length / 2]) / 2; };
const ms = v => (v === undefined || v === null || v < 0 ? '   n/d' : v.toFixed(0).padStart(6));

(async () => {
  /* DUE FRENI, E NON PER COMPLETEZZA.
     I millisecondi di questo banco non sono quelli di un telefono, quindi
     l'unica cosa che si puo' portare via da qui sono le PROPORZIONI fra le
     fasi. Ma una proporzione va creduta solo se regge quando il banco
     cambia: se passando da 1x a 4x la torta si ridisegna, quella torta
     descriveva il banco e non il file. Per questo la misura si fa a due
     freni e le due torte si stampano ACCANTO, con lo scarto. */
  const freni = String(arg('freni', arg('freno', '1,4'))).split(',').map(Number).filter(n => n > 0);
  const giri = +arg('giri', 3);
  const profilo = bandiera('profilo');
  const partita = bandiera('partita');
  const dopo = +arg('dopo', 0);
  const quante = +arg('quante', 25);

  const html = fs.readFileSync(FILE, 'utf8');
  const P = pesi(html);
  const tot = P.prima + P.script + P.dopo;

  console.log('=== SONDA AVVIO — dove finiscono i secondi ===\n');
  console.log(`file   ${GIOCO}   ${(tot / 1024).toFixed(0)} kB`);
  console.log(`  HTML e CSS prima dello script   ${(P.prima / 1024).toFixed(0).padStart(5)} kB   ${(P.prima / tot * 100).toFixed(1)}%`);
  console.log(`  il blocco JavaScript grande     ${(P.script / 1024).toFixed(0).padStart(5)} kB   ${(P.script / tot * 100).toFixed(1)}%`);
  console.log(`  il resto                        ${(P.dopo / 1024).toFixed(0).padStart(5)} kB   ${(P.dopo / tot * 100).toFixed(1)}%`);
  console.log(`\nCPU rallentata ${freni.join('x e ')}x, ${giri} esecuzioni per freno. I millisecondi assoluti non sono`);
  console.log(`quelli di un telefono: quello che vale qui sono le PROPORZIONI fra le fasi, e i due`);
  console.log(`freni servono a sapere se quelle proporzioni descrivono il file o descrivono il banco.\n`);

  let corpo;
  try { corpo = timbra(html); } catch (e) { console.error('FALLITO: ' + e.message); process.exit(2); }
  const srv = await servi(corpo);
  const browser = await chromium.launch();

  let ultimoProfilo = null, frenoProfilo = 0, ultimoConto = null, frenoConto = 0;
  const perFreno = {};
  for (const freno of freni) {
    console.log(`--- freno ${freno}x ---`);
    const tutti = [];
    for (let i = 0; i < giri; i++) {
      const vuoiProfilo = profilo && i === giri - 1 && freno === freni[freni.length - 1];
      const g = await unGiro(browser, srv, { freno, profilo: vuoiProfilo, quante, partita, dopo });
      tutti.push(g.F);
      if (g.prof) { ultimoProfilo = g.prof; frenoProfilo = freno; }
      if (CONTA.length && i === giri - 1) { ultimoConto = g.K; frenoConto = freno; }
      const F = g.F;
      console.log(`  giro ${i + 1}   testa ${ms(F.testa)}   compila ${ms(F.s1 - F.testa)}   esegue ${ms(F.e1 - F.s1)}   dopo ${ms(F.dcl - F.e1)}   DCL ${ms(F.dcl)}   disegno ${ms(F.fcp)}${partita ? '   GIOCABILE ' + ms(F.giocabile) : ''}` +
        (g.errori.length ? `\n           ECCEZIONE: ${g.errori.slice(0, 2).join(' | ')}` : ''));
    }
    const v = f => tutti.map(f).filter(x => typeof x === 'number' && isFinite(x) && x >= 0);
    const sparso = f => { const a = v(f); return a.length > 1 ? (Math.max(...a) - Math.min(...a)) / mediana(a) * 100 : -1; };
    perFreno[freno] = {
      testa: mediana(v(F => F.testa)),
      compila: mediana(v(F => F.s1 - F.testa)),
      esegue: mediana(v(F => F.e1 - F.s1)),
      dopo: mediana(v(F => F.dcl - F.e1)),
      dcl: mediana(v(F => F.dcl)),
      fcp: v(F => F.fcp).length ? mediana(v(F => F.fcp)) : -1,
      ballo: { testa: sparso(F => F.testa), compila: sparso(F => F.s1 - F.testa), esegue: sparso(F => F.e1 - F.s1), dcl: sparso(F => F.dcl) },
    };
    const M = perFreno[freno];
    console.log(`  MEDIANA  testa ${ms(M.testa)}   compila ${ms(M.compila)}   esegue ${ms(M.esegue)}   dopo ${ms(M.dopo)}   DCL ${ms(M.dcl)}   disegno ${ms(M.fcp)}`);
    console.log(`           dispersione: testa ${M.ballo.testa.toFixed(1)}%, compila ${M.ballo.compila.toFixed(1)}%, esegue ${M.ballo.esegue.toFixed(1)}%, DCL ${M.ballo.dcl.toFixed(1)}%\n`);
  }
  await browser.close();
  srv.chiudi();

  /* ------------------------------------------------------------------
     LE QUATTRO FASI, IN PERCENTUALE, A DUE FRENI.
     La quarta fase — «dopo» — e' quella che questo strumento esiste per
     far vedere: e' il tempo che passa fra l'ULTIMA ISTRUZIONE del gioco e
     DOMContentLoaded. Non e' peso e non e' primo livello: sono i primi
     fotogrammi (il rAF finale del gioco parte prima che il parser abbia
     chiuso il documento), la cottura del manto, e la quota di stallo che
     il freno inserisce. Chiamarla «analisi» come fa oggi avvio.js e'
     l'errore che ha tenuto in piedi per settimane un tetto in kilobyte.
     ------------------------------------------------------------------ */
  const NOMI = [
    ['leggere HTML e CSS', 'testa', 'PESO', 'i font e le immagini in base64 stanno qui'],
    ['COMPILARE il blocco grande', 'compila', 'PESO', 'l\'unica fase che il tetto in kB sorvegliava'],
    ['ESEGUIRE il primo livello', 'esegue', 'lavoro', 'si puo\' RIMANDARE a dopo il primo disegno'],
    ['DOPO l\'ultima istruzione', 'dopo', 'lavoro', 'primi fotogrammi, cottura del manto, stallo del freno'],
  ];
  console.log('--- LE QUATTRO FASI, in percentuale di DOMContentLoaded ---\n');
  console.log('  fase                                 ' + freni.map(f => `${f}x`.padStart(8)).join('') + '     scarto');
  for (const [nome, chiave] of NOMI) {
    const q = freni.map(f => perFreno[f].dcl > 0 ? perFreno[f][chiave] / perFreno[f].dcl * 100 : 0);
    const scarto = Math.max(...q) - Math.min(...q);
    console.log('  ' + nome.padEnd(36) + q.map(x => (x.toFixed(1) + '%').padStart(8)).join('') + '   ' + scarto.toFixed(1).padStart(5) + ' punti');
  }
  console.log('  ' + 'DOMContentLoaded, in ms'.padEnd(36) + freni.map(f => perFreno[f].dcl.toFixed(0).padStart(8)).join(''));
  console.log('  ' + 'primo disegno (fcp), in ms'.padEnd(36) + freni.map(f => (perFreno[f].fcp > 0 ? perFreno[f].fcp.toFixed(0) : 'n/d').padStart(8)).join(''));

  const scartoMax = Math.max(...NOMI.map(([, c]) => {
    const q = freni.map(f => perFreno[f].dcl > 0 ? perFreno[f][c] / perFreno[f].dcl * 100 : 0);
    return Math.max(...q) - Math.min(...q);
  }));
  if (freni.length > 1) {
    console.log(`\n  Lo scarto peggiore fra i freni e' ${scartoMax.toFixed(1)} punti percentuali. ` +
      (scartoMax <= 12
        ? 'Le proporzioni reggono al cambio di banco:\n  descrivono il file, e si possono portare via da qui.'
        : 'Le proporzioni NON reggono al cambio di banco:\n  qui si sta misurando il banco, non il file. Rifare a banco scarico prima di credergli.'));
  }

  /* ------------------------------------------------------------------
     IL VERDETTO, e la sua prima versione sbagliata.
     La prima stesura di questo blocco confrontava «lettura + compilazione»
     contro la sola «esecuzione del primo livello» e dichiarava «IL PESO
     COMANDA» — lasciando fuori dal confronto la fase piu' grossa delle
     quattro, quella dopo l'ultima istruzione. Cioe' faceva esattamente
     quello che questo strumento e' nato per smascherare in avvio.js:
     dividere il tempo in due mucchi e dimenticarne uno.
     La domanda giusta e' una sola: se il file dimagrisse fino a sparire,
     quanto dell'avvio resterebbe? Quindi PESO = lettura + compilazione, e
     TUTTO IL RESTO sta dall'altra parte.
     ------------------------------------------------------------------ */
  const dec = freni[freni.length - 1], M = perFreno[dec];
  console.log('\n--- COSA VUOL DIRE ---\n');
  const peso = M.testa + M.compila, resto = M.esegue + M.dopo;
  console.log(`  costo di compilazione: ${(M.compila / (P.script / 1024)).toFixed(3)} ms per kB di script a ${dec}x.`);
  console.log(`  peso (lettura + compilazione): ${peso.toFixed(0)} ms, cioe' il ${(peso / M.dcl * 100).toFixed(1)}% di DOMContentLoaded.`);
  console.log(`  tutto il resto:                ${resto.toFixed(0)} ms, cioe' il ${(resto / M.dcl * 100).toFixed(1)}%.`);
  if (resto > peso) {
    console.log(`\n  IL PESO NON COMANDA. Anche se il file dimagrisse FINO A SPARIRE resterebbero`);
    console.log(`  ${resto.toFixed(0)} ms su ${M.dcl.toFixed(0)}: il tetto in kilobyte sorvegliava il ${(peso / M.dcl * 100).toFixed(0)}% del problema.`);
    console.log(`  Il lavoro sta in cosa il gioco FA prima di essere toccabile, e quella parte`);
    console.log(`  si RIMANDA a dopo il primo fotogramma, non si dimagrisce.`);
  } else {
    console.log(`\n  IL PESO COMANDA: e' ${(peso / resto).toFixed(1)} volte il resto. Qui dimagrire serve davvero, e la voce`);
    console.log(`  piu' grossa e' ${M.testa > M.compila ? `l'HTML e il CSS (${M.testa.toFixed(0)} ms)` : `la compilazione del JavaScript (${M.compila.toFixed(0)} ms)`}.`);
  }
  if (M.fcp > 0 && M.fcp < M.dcl) {
    console.log(`\n  E DA LEGGERE BENE: il primo pixel arriva a ${M.fcp.toFixed(0)} ms, cioe' ${(M.dcl - M.fcp).toFixed(0)} ms PRIMA di`);
    console.log(`  DOMContentLoaded. Chi guarda lo schermo vede qualcosa molto prima di quando`);
    console.log(`  «analisi» finisce. DOMContentLoaded non e' il momento in cui l'utente aspetta.`);
  }

  if (ultimoConto) {
    console.log(`\n--- QUANTE VOLTE, E QUANDO (freno ${frenoConto}x, ultimo giro) ---\n`);
    console.log('  ' + 'funzione'.padEnd(22) + 'volte'.padStart(6) + 'ms tot'.padStart(9) + '  istanti delle chiamate (ms da navigationStart)');
    const voci = Object.entries(ultimoConto).sort((a, b) => b[1].ms - a[1].ms);
    for (const [n, k] of voci) {
      console.log('  ' + n.slice(0, 21).padEnd(22) + String(k.n).padStart(6) + k.ms.toFixed(0).padStart(9) +
        '  ' + k.quando.join(', ') + (k.n > k.quando.length ? ', ...' : ''));
      /* DA DOVE ARRIVA LA CHIAMATA. «due volte» non basta a decidere: una
         seconda cottura chiesta da chi cambia campo e' dovuta, una chiesta
         dall'avvio della partita su un campo che non e' cambiato e' sprecata.
         Le righe sono quelle del documento timbrato, spostate di poco. */
      for (const p of (k.pile || [])) console.log('  ' + ' '.repeat(22) + '   ' + p);
    }
    for (const n of CONTA) if (!ultimoConto[n]) console.log('  ' + n.slice(0, 21).padEnd(22) + '     0        0  mai chiamata durante il caricamento');
    console.log('\n  «ms tot» include i figli: non e\' tempo proprio, e due righe possono contare lo stesso lavoro.');
    console.log('  La colonna che decide e\' «volte»: due chiamate allo stesso istante sono lavoro RIPETUTO,');
    console.log('  e il lavoro ripetuto non si ottimizza, si smette.');
  }

  if (ultimoProfilo) {
    console.log(`\n--- CHI CONSUMA IL TEMPO (tempo PROPRIO, freno ${frenoProfilo}x, ultimo giro, ${ultimoProfilo.tot.toFixed(0)} ms campionati) ---\n`);
    console.log('  ' + 'funzione'.padEnd(34) + 'riga'.padStart(7) + '    ms'.padStart(8) + '     % ');
    for (const r of ultimoProfilo.righe) {
      if (r.ms < 1) continue;
      console.log('  ' + String(r.nome).slice(0, 33).padEnd(34) + String(r.riga).padStart(7) +
        r.ms.toFixed(0).padStart(8) + (r.ms / ultimoProfilo.tot * 100).toFixed(1).padStart(7) + '%');
    }
    console.log('\n  COME SI LEGGONO QUESTE RIGHE, perche' + ' due voci ingannano:');
    console.log('  «(program)» e' + ' il motore stesso — compilazione, impaginazione, raccolta — non codice del gioco.');
    if (frenoProfilo > 1) {
      console.log(`  «(idle)» a freno ${frenoProfilo}x NON e' il gioco che aspetta: il rallentamento della CPU si ottiene`);
      console.log(`  stallando il filo principale, e quegli stalli finiscono qui. A ${frenoProfilo}x ci si aspetta circa il`);
      console.log(`  ${((1 - 1 / frenoProfilo) * 100).toFixed(0)}% di (idle) anche su una pagina che lavora senza sosta. Non e' tempo recuperabile.`);
    }
    console.log('  Le righe si riferiscono al DOCUMENTO timbrato, quindi sono spostate di poco rispetto al file su disco.');
  } else if (!profilo) {
    console.log('\n  (--profilo dice anche QUALI funzioni consumano quei millisecondi)');
  }
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
