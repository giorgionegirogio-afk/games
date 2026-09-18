/* =====================================================================
   _q-accessibile.js — LE ETICHETTE HANNO UN GIUDICE CHE LE ASPETTA
   (voce #112, compiti 1 e 2 del ramo voce-112-spiccioli-ux).

   IL PERCHE'. Il cantiere #112 chiude l'onda A del mandato con sei cure
   di UX/accessibilita' a rischio quasi zero (nessuna tocca dado(), una
   decisione di gioco o uno stato che la CPU legge). Il compito 1 ne ha
   portate due, entrambe di puro contorno: aria-pressed sui cinque
   interruttori di IMPOSTAZIONI, e il rettangolo del banner dichiarato
   in zoneInterfaccia(). Il compito 2 aggiunge la terza: le tre
   intensita' della vibrazione. Ogni prova nasce PRIMA dell'attrezzo che
   la applica e la condanna sul gioco di ieri: la terza, aggiunta oggi,
   nasce rossa sulla base ec82689 (SAVE.vibInt non esiste ancora).

   LE TRE PROVE:
     1. ARIA — apre IMPOSTAZIONI (gearBtn -> PREFERENZE, la via vera del
        dito), e per ognuno dei cinque .voce.sw (btnSetAudio/Vib/Moto/
        Dalt/Moviola) verifica che aria-pressed esista E combaci con
        classList.contains('on'); poi CLICCA l'interruttore (il vero
        .click() del DOM, non un tocco sintetico) e verifica che
        aria-pressed segua il nuovo stato. Un solo voto per le cinque,
        coi dettagli di ognuna nel referto.
     2. BANNER-DICHIARATO — accende un banner vero chiamando showBanner
        (la stessa funzione che il gioco chiama per PALO!/GOL!/FALLO!/
        TIRO PERFETTO!, non uno stato inventato: e' la via che il brief
        stesso nomina come pulita), poi verifica che
        __test.zoneInterfaccia() contenga una zona {tipo:'banner'} con
        un rettangolo non degenere (x1>x0, y1>y0).
     3. VIBRAZIONE — una spia su navigator.vibrate (installata via
        addInitScript PRIMA che il gioco carichi) registra ogni chiamata
        vera. Rientrati in IMPOSTAZIONI, si sceglie il bottone .vib
        forte (data-vi=2) col vero .click() del DOM: si verifica
        SAVE.vibInt===2 e che buzz(20) — chiamato bare, come showBanner
        in prova 2 — vibri per ~32ms (20 x 1.6). Poi si sceglie leggera
        (data-vi=0) e si verifica ~10ms (20 x 0.5). In mezzo, un
        controllo dell'interruttore ON/OFF: con SAVE.vib=false, buzz(20)
        non deve toccare navigator.vibrate — vibInt non ha voce in
        capitolo finche' la vibrazione stessa e' spenta. Zero dado() qui:
        un bottone, un salvataggio e uno spione sull'hardware finto.

   ZERO dado() NUOVI in questo file, come in _q-battute.js: nessuna
   delle tre prove decide niente per la CPU, tutte leggono markup e
   funzioni di interfaccia gia' esistenti (o gia' introdotte da un
   compito precedente dello stesso cantiere).

   IL SEME: 20260918, la data del piano d'esecuzione del cantiere (voce
   #112), default del flag --seme. Non governa nessuna delle due prove
   (zero dado() coinvolti), ma si semina comunque per coerenza col
   telaio di casa (_q-battute.js) e per lasciare la porta aperta a
   prove future che ne avessero bisogno.

   uso:  node strumenti/_q-accessibile.js
         node strumenti/_q-accessibile.js --gioco fuori/a1-base.html
         node strumenti/_q-accessibile.js --taglia 7 --seme 123
   esce 0 se tutte le prove sono verdi, 1 se almeno una e' rossa,
   2 se il banco stesso e' esploso (pagina, hook mancante, eccezione),
   3 riservato a "prova nulla" sul modello di _q-battute.js — nessuna
   delle due prove di oggi lo usa.
   ===================================================================== */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { semeFisso } = require('./_posa.js');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};

const SEME_CANTIERE = 20260918;   // la data del piano d'esecuzione della voce #112, default del flag --seme
const TAGLIA_BANCO = +arg('taglia', 5);
const SEME = +arg('seme', SEME_CANTIERE);

function servi(prova) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (prova && /CALCETTO-il-gioco\.html$/i.test(f)) f = prova;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

const esiti = [];
const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '\n         ' + det : '')); };

const INTERRUTTORI = ['btnSetAudio', 'btnSetVib', 'btnSetMoto', 'btnSetDalt', 'btnSetMoviola'];

(async () => {
  const provaRel = arg('gioco', '');
  const provaAbs = provaRel ? path.resolve(RADICE, provaRel) : '';
  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(semeFisso, SEME);
  /* LA SPIA SU navigator.vibrate, installata PRIMA che il gioco carichi
     (voce #112, compito 2). window.__vibChiamate accumula ogni valore
     passato a navigator.vibrate cosi' com'e' (numero o array): e'
     l'unico modo di misurare cosa buzz() manda DAVVERO all'hardware
     finto senza inventare uno stato che il gioco non ha. */
  await pag.addInitScript(() => {
    window.__vibChiamate = [];
    navigator.vibrate = (x) => { window.__vibChiamate.push(x); return true; };
  });
  const ecc = []; pag.on('pageerror', e => ecc.push(e.message));
  console.log('\n=== LE ETICHETTE HANNO UN GIUDICE CHE LE ASPETTA ===  ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)'));

  try {
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(({ seme }) => {
      const t = window.__test;
      t.semina(seme);
      t.dismissSplash && t.dismissSplash();
      if (t.save) t.save.tutorialDone = 1;
    }, { seme: SEME });

    /* ===================================================================
       PROVA 1 — ARIA. Si e' ancora al menu (nessuna partita avviata):
       IMPOSTAZIONI si apre esattamente come farebbe un dito vero,
       gearBtn -> PREFERENZE, il bottone visibile solo fuori dalla
       partita. */
    {
      await pag.evaluate(() => {
        document.getElementById('gearBtn').click();
        document.getElementById('btnImpost').click();
      });
      const r = await pag.evaluate((ids) => {
        const leggi = id => {
          const el = document.getElementById(id);
          return el ? { esiste: true, aria: el.getAttribute('aria-pressed'), on: el.classList.contains('on') }
                     : { esiste: false, aria: null, on: null };
        };
        const righe = [];
        for (const id of ids) {
          const prima = leggi(id);
          const el = document.getElementById(id);
          if (el) el.click();
          const dopo = leggi(id);
          righe.push({ id, prima, dopo });
        }
        return righe;
      }, INTERRUTTORI);
      const guasti = [];
      for (const riga of r) {
        const { id, prima, dopo } = riga;
        if (!prima.esiste) { guasti.push(id + ': elemento non trovato'); continue; }
        if (prima.aria === null) guasti.push(id + ': nessun aria-pressed prima del click');
        else if ((prima.aria === 'true') !== prima.on) guasti.push(id + ': aria-pressed=' + prima.aria + ' ma classList.on=' + prima.on + ' (prima del click)');
        if (dopo.aria === null) guasti.push(id + ': nessun aria-pressed dopo il click');
        else if ((dopo.aria === 'true') !== dopo.on) guasti.push(id + ': aria-pressed=' + dopo.aria + ' ma classList.on=' + dopo.on + ' (dopo il click)');
        if (prima.aria !== null && dopo.aria !== null && prima.aria === dopo.aria)
          guasti.push(id + ': il click non ha cambiato aria-pressed (resta ' + prima.aria + ')');
      }
      di(guasti.length === 0, '1. ARIA — i 5 .voce.sw hanno aria-pressed sincronizzato con lo stato, prima e dopo il click',
        guasti.length ? guasti.join('   ')
          : r.map(x => x.id + ': ' + x.prima.aria + ' -> ' + x.dopo.aria).join('   '));
    }

    /* ===================================================================
       PROVA 2 — BANNER-DICHIARATO. Una partita vera (VW/VH/MINI_RECT
       nascono dal resize legato al canvas di gioco: startMatch e' il
       contesto in cui il banner appare per davvero). showBanner e' una
       funzione di primo livello del gioco (non un membro di __test):
       come segnaTocco in _q-battute.js, e' raggiungibile bare dentro
       page.evaluate perche' lo script del gioco non e' un modulo. E' la
       stessa via che PALO!/GOL!/FALLO! usano per davvero: nessuno stato
       fabbricato. */
    {
      const r = await pag.evaluate(({ taglia }) => {
        const t = window.__test;
        t.startMatch(1, 1, { size: taglia });
        showBanner('PROVA BANNER', '#ffb020', 1.4);
        const stato = t.banner;
        const zone = t.zoneInterfaccia();
        const b = zone.find(z => z.tipo === 'banner');
        return { stato, trovato: !!b, zona: b || null, tipi: zone.map(z => z.tipo) };
      }, { taglia: TAGLIA_BANCO });
      const bannerAcceso = r.stato && r.stato.t > 0 && !!r.stato.text;
      const geomOk = !!r.zona && r.zona.x1 > r.zona.x0 && r.zona.y1 > r.zona.y0;
      const ok = bannerAcceso && r.trovato && geomOk;
      di(ok, '2. BANNER-DICHIARATO — G.banner attivo (via showBanner) produce una zona tipo:banner in zoneInterfaccia()',
        'banner attivo: ' + JSON.stringify(r.stato) + '   zona trovata: ' + JSON.stringify(r.zona) +
        '   tipi presenti in zoneInterfaccia: [' + r.tipi.join(', ') + ']');
    }

    /* ===================================================================
       PROVA 3 — VIBRAZIONE (voce #112, compito 2). Si torna in
       IMPOSTAZIONI con la stessa via del dito di prova 1 (gearBtn ->
       PREFERENZE -> IMPOSTAZIONI): funziona anche a partita in corso
       perche' sono .click() DOM veri, non i controlli di visibilita' di
       un dito. buzz() e' bare come showBanner in prova 2: e' una
       funzione di primo livello del gioco, si chiama diretta dentro
       page.evaluate. La spia su navigator.vibrate (installata PRIMA del
       goto, vedi sopra) e' il solo giudice: registra la durata VERA che
       arriva all'hardware finto.
       Prova 1 ha gia' cliccato btnSetVib una volta (default true ->
       false): si sfrutta quello stato per il controllo ON/OFF prima di
       riaccenderlo — vibInt non deve avere voce in capitolo mentre la
       vibrazione stessa e' spenta.
       I bottoni .vib si cercano con querySelector (mai un .click() alla
       cieca): sulla base ec82689 la riga #vibRow non esiste ancora, e
       questa prova deve dichiararlo con un guasto leggibile — non far
       esplodere il banco intero con un'eccezione su null. */
    {
      const r = await pag.evaluate(() => {
        const t = window.__test;
        document.getElementById('gearBtn').click();
        document.getElementById('btnImpost').click();
        const vibIntDefault = t.save.vibInt;

        /* ON/OFF ancora primo cancello: a vib spento (l'eredita' di
           prova 1) buzz(20) non deve toccare navigator.vibrate. */
        const vibEraSpenta = (t.save.vib === false);
        window.__vibChiamate.length = 0;
        buzz(20);
        const chiamateAVibSpenta = window.__vibChiamate.length;

        /* si riaccende con un vero click su btnSetVib prima di misurare
           le intensita': a vib spenta nessuna intensita' vibrerebbe. */
        document.getElementById('btnSetVib').click();
        const vibRiaccesa = (t.save.vib !== false);

        const bForte = document.querySelector('.vib[data-vi="2"]');
        if (bForte) bForte.click();
        const vibIntForte = t.save.vibInt;
        window.__vibChiamate.length = 0;   // pulisce l'assaggio del click appena fatto
        buzz(20);
        const chiamataForte = window.__vibChiamate[window.__vibChiamate.length - 1];

        const bLeggera = document.querySelector('.vib[data-vi="0"]');
        if (bLeggera) bLeggera.click();
        const vibIntLeggera = t.save.vibInt;
        window.__vibChiamate.length = 0;
        buzz(20);
        const chiamataLeggera = window.__vibChiamate[window.__vibChiamate.length - 1];

        return { vibIntDefault, vibEraSpenta, chiamateAVibSpenta, vibRiaccesa,
                 bottoneForteTrovato: !!bForte, bottoneLeggeraTrovato: !!bLeggera,
                 vibIntForte, chiamataForte, vibIntLeggera, chiamataLeggera };
      });
      const guasti = [];
      if (r.vibIntDefault !== 1) guasti.push('default SAVE.vibInt=' + r.vibIntDefault + ' invece di 1 (Normale)');
      if (!r.vibEraSpenta) guasti.push('SAVE.vib non risultava spenta dopo prova 1: il controllo ON/OFF non e\' stato provato davvero');
      if (r.chiamateAVibSpenta !== 0) guasti.push('a vib spento buzz(20) ha comunque chiamato navigator.vibrate ' + r.chiamateAVibSpenta + ' volte');
      if (!r.vibRiaccesa) guasti.push('btnSetVib non ha riacceso SAVE.vib');
      if (!r.bottoneForteTrovato) guasti.push('bottone .vib[data-vi="2"] non trovato: la riga #vibRow non esiste');
      if (!r.bottoneLeggeraTrovato) guasti.push('bottone .vib[data-vi="0"] non trovato: la riga #vibRow non esiste');
      if (r.vibIntForte !== 2) guasti.push('click su data-vi=2 non ha scritto SAVE.vibInt=2 (letto ' + r.vibIntForte + ')');
      if (!(Math.abs(r.chiamataForte - 32) <= 1)) guasti.push('buzz(20) a vibInt=2 vale ' + r.chiamataForte + ' invece di ~32 (20 x 1.6)');
      if (r.vibIntLeggera !== 0) guasti.push('click su data-vi=0 non ha scritto SAVE.vibInt=0 (letto ' + r.vibIntLeggera + ')');
      if (!(Math.abs(r.chiamataLeggera - 10) <= 1)) guasti.push('buzz(20) a vibInt=0 vale ' + r.chiamataLeggera + ' invece di ~10 (20 x 0.5)');
      di(guasti.length === 0, '3. VIBRAZIONE — SAVE.vibInt a tre valori, buzz(p) scala la durata prima di navigator.vibrate, ON/OFF resta il primo cancello',
        guasti.length ? guasti.join('   ')
          : 'default=' + r.vibIntDefault + '   vib spento: buzz muto (' + r.chiamateAVibSpenta + ' chiamate)   ' +
            'forte: buzz(20)=' + r.chiamataForte + '   leggera: buzz(20)=' + r.chiamataLeggera);
    }

    if (ecc.length) { di(false, 'BANCO — nessuna eccezione di pagina', 'eccezione: ' + ecc[0]); }
  } catch (e) {
    console.error('FALLITO: ' + e.message);
    await browser.close(); srv.chiudi();
    process.exit(2);
  }

  await ctx.close(); await browser.close(); srv.chiudi();
  const rossi = esiti.filter(v => !v).length;
  console.log('\n' + (esiti.length - rossi) + ' prove su ' + esiti.length + ' — ' + (rossi ? 'CANCELLO ROSSO' : 'CANCELLO VERDE'));
  process.exit(rossi ? 1 : 0);
})();
