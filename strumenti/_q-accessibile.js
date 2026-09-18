/* =====================================================================
   _q-accessibile.js — LE ETICHETTE HANNO UN GIUDICE CHE LE ASPETTA
   (voce #112, compiti 1, 2, 3 e 4 + correzione revisione compito 2,
   ramo voce-112-spiccioli-ux).

   IL PERCHE'. Il cantiere #112 chiude l'onda A del mandato con sei cure
   di UX/accessibilita' a rischio quasi zero (nessuna tocca dado(), una
   decisione di gioco o uno stato che la CPU legge). Il compito 1 ne ha
   portate due, entrambe di puro contorno: aria-pressed sui cinque
   interruttori di IMPOSTAZIONI, e il rettangolo del banner dichiarato
   in zoneInterfaccia(). Il compito 2 aggiunge la terza: le tre
   intensita' della vibrazione. Ogni prova nasce PRIMA dell'attrezzo che
   la applica e la condanna sul gioco di ieri: la terza, aggiunta al
   compito 2, nasce rossa sulla base ec82689 (SAVE.vibInt non esiste
   ancora).

   CORREZIONE REVISIONE COMPITO 2: la prova 3 misura solo lo stato
   LOGICO di #vibRow (classList/SAVE.vibInt), mai il rendering. Il
   compito 2 aveva copiato #vibRow dal pattern .diff-row solo in
   markup+JS, saltando i due selettori CSS della famiglia — i tre
   bottoni .vib rendevano con lo stile di default del browser, e
   .vib.sel non si distingueva mai da .vib. La quarta prova,
   VIBRAZIONE-STILE, chiude il buco misurando getComputedStyle: nasce
   rossa sul commit 24421ca (compito 2 cosi' com'era), verde dopo la
   cura del CSS.

   IL COMPITO 3 aggiunge la quinta: RIVEDI IL TUTORIAL, la voce che
   riapre la lezione vera (Tut) alla prossima amichevole a un giocatore.
   Nasce rossa sul commit 5ee5068 (base del compito 3): #btnRivediTut
   non esiste ancora.

   IL COMPITO 4 aggiunge la sesta: SOTTOTITOLI, il flag SAVE.sott che
   porta a video (via showBanner, sotto l'helper sottotitolo()) i fischi
   che oggi suonano muti — il fischio d'inizio, il piu' esercitato di
   tutti in CPU-CPU. Nasce rossa sul commit 92dc589 (base del compito
   4): SAVE.sott non esiste ancora, il fischio d'inizio non produce
   nessun banner.

   LE SEI PROVE:
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
     4. VIBRAZIONE-STILE (correzione revisione compito 2) — dentro lo
        STESSO pannello IMPOSTAZIONI, confronta via getComputedStyle un
        bottone .vib non selezionato con il bottone .diff non
        selezionato (la riga "Difficolta' predefinita CPU", stesso
        pannello, mai toccata dal compito 2): background-color,
        border-top-color e font-family devono combaciare, perche' sono
        le tre proprieta' che il selettore condiviso
        .diff,.tbtn,.taglia,.ment,.sponde{...} impone e che il default
        del browser per un <button> NON riproduce. Poi confronta .vib
        con .vib.sel: almeno una fra background-color e border-top-color
        deve differire, altrimenti lo stato scelto sarebbe invisibile.
        Zero dado() qui: solo stile, nessuna simulazione.
     5. RIVEDI-TUTORIAL (voce #112, compito 3) — porta il gioco allo
        stato "tutorial gia' visto tre volte e chiuso"
        (t.save.tutorialDone=true; t.save.tutorialVisto=5, il caso reale
        dopo la terza apertura), apre l'ingranaggio (gearBtn -> #extra,
        LA VOLTA CHE NON PASSA DA PREFERENZE: il bottone vive accanto a
        COME SI GIOCA, non nel pannello id=impostazioni) e clicca il
        vero #btnRivediTut col .click() del DOM. Poi verifica TRE cose,
        in un solo voto: (a) ENTRAMBI i flag azzerati — la trappola
        della ricognizione e' che azzerare solo tutorialDone non basta,
        perche' Tut.start() lo rimetterebbe a true prima di mostrare
        niente se tutorialVisto fosse rimasto a TUT_APERTURE o piu'
        (vedi :40513); (b) un toast vero appare (conta i figli di
        #toasts prima e dopo, mai un'attestazione); (c) LA PARTE CHE
        CONTA — non i flag, il tutorial vero: t.startMatch(1,1) e si
        legge t.Tut.active (lo stesso oggetto del gioco, __test lo
        espone bare, non una copia), che deve essere true al kickoff di
        un'amichevole 1 giocatore. Subito dopo, t.startMatch(2,1)
        verifica che la guardia di startMatch (:11156) REGGA: con gli
        stessi flag appena azzerati, a due giocatori il tutorial non
        deve ripartire. Condanna sul gioco di oggi: #btnRivediTut non
        esiste, querySelector torna null, guasto leggibile invece di
        un'eccezione cieca sul .click() di un elemento inesistente.
     6. SOTTOTITOLI (voce #112, compito 4) — chiama t.startMatch(...)
        due volte, la prima con t.save.sott=1 e la seconda con
        t.save.sott=0: il fischio d'inizio (Audio5.whistle(false) dentro
        startMatch) e' il piu' esercitato di tutti in CPU-CPU, non serve
        costruire nessuna scena. Verifica in un solo voto: (a) col flag
        acceso, subito dopo startMatch, t.banner porta {text:'FISCHIO',
        t>0} — sottotitolo() e' sincrona, nessun fotogramma di attesa;
        (b) col flag spento, lo stesso fischio non produce NESSUN banner
        nuovo — startMatch azzera G.banner all'inizio della sua stessa
        chiamata, quindi un banner sopravvissuto sarebbe un guasto vero,
        non un residuo della chiamata precedente; (c) LA PARTE CHE CONTA
        — il flag non spegne i banner preesistenti: showBanner('GOL',...)
        chiamata BARE (come la chiama davvero il gol, la stessa via di
        prova 2) accende G.banner anche con SAVE.sott=0, perche'
        sottotitolo() e' un canale IN PIU', mai un filtro su showBanner.
        Condanna sul gioco di oggi (commit 92dc589, base del compito 4):
        SAVE.sott non esiste, il fischio d'inizio non produce banner.

   ZERO dado() NUOVI in questo file, come in _q-battute.js: nessuna
   delle sei prove decide niente per la CPU, tutte leggono markup,
   stile calcolato, salvataggio e funzioni di interfaccia gia' esistenti
   (o gia' introdotte da un compito precedente dello stesso cantiere).

   IL SEME: 20260918, la data del piano d'esecuzione del cantiere (voce
   #112), default del flag --seme. Non governa nessuna delle sei
   prove (zero dado() coinvolti), ma si semina comunque per coerenza col
   telaio di casa (_q-battute.js) e per lasciare la porta aperta a
   prove future che ne avessero bisogno.

   uso:  node strumenti/_q-accessibile.js
         node strumenti/_q-accessibile.js --gioco fuori/a1-base.html
         node strumenti/_q-accessibile.js --taglia 7 --seme 123
   esce 0 se tutte le prove sono verdi, 1 se almeno una e' rossa,
   2 se il banco stesso e' esploso (pagina, hook mancante, eccezione),
   3 riservato a "prova nulla" sul modello di _q-battute.js — nessuna
   delle sei prove di oggi lo usa.
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

    /* ===================================================================
       PROVA 4 — VIBRAZIONE-STILE (correzione revisione compito 2, voce
       #112). Si torna in IMPOSTAZIONI con la stessa via del dito delle
       prove precedenti (idempotente: goScreen ridisegna la stessa
       schermata se e' gia' quella attiva). Il riferimento e' .diff (la
       riga "Difficolta' predefinita CPU", ~riga 3667), nello STESSO
       pannello di #vibRow e mai toccato dal compito 2: se .vib eredita
       davvero il selettore condiviso, le tre proprieta' che quel
       selettore impone (background-color, border-top-color,
       font-family) devono combaciare esattamente. Sulla base 24421ca
       (compito 2 cosi' com'era, prima di questa correzione) .vib non e'
       elencato nel selettore e rende con lo stile di default del
       browser: questa prova nasce rossa li'. */
    {
      const r = await pag.evaluate(() => {
        document.getElementById('gearBtn').click();
        document.getElementById('btnImpost').click();
        const rif = document.querySelector('.diff:not(.sel)');
        const vib = document.querySelector('.vib:not(.sel)');
        const vibSel = document.querySelector('.vib.sel');
        const leggi = el => {
          if (!el) return null;
          const c = getComputedStyle(el);
          return { backgroundColor: c.backgroundColor, borderTopColor: c.borderTopColor, fontFamily: c.fontFamily };
        };
        return {
          rif: leggi(rif), vib: leggi(vib), vibSel: leggi(vibSel),
          rifTrovato: !!rif, vibTrovato: !!vib, vibSelTrovato: !!vibSel,
        };
      });
      const guasti = [];
      if (!r.rifTrovato) guasti.push('bottone .diff:not(.sel) di riferimento non trovato');
      if (!r.vibTrovato) guasti.push('bottone .vib non selezionato non trovato');
      if (!r.vibSelTrovato) guasti.push('bottone .vib.sel non trovato');
      if (r.rifTrovato && r.vibTrovato) {
        if (r.rif.backgroundColor !== r.vib.backgroundColor)
          guasti.push('.vib background-color=' + r.vib.backgroundColor + ' diverso da .diff=' + r.rif.backgroundColor);
        if (r.rif.borderTopColor !== r.vib.borderTopColor)
          guasti.push('.vib border-top-color=' + r.vib.borderTopColor + ' diverso da .diff=' + r.rif.borderTopColor);
        if (r.rif.fontFamily !== r.vib.fontFamily)
          guasti.push('.vib font-family=' + r.vib.fontFamily + ' diverso da .diff=' + r.rif.fontFamily);
      }
      if (r.vibTrovato && r.vibSelTrovato) {
        const diverso = r.vib.backgroundColor !== r.vibSel.backgroundColor || r.vib.borderTopColor !== r.vibSel.borderTopColor;
        if (!diverso) guasti.push('.vib.sel indistinguibile da .vib non selezionato (stesso background e stesso bordo)');
      }
      di(guasti.length === 0, '4. VIBRAZIONE-STILE — .vib eredita lo stile di .diff/.taglia/.sponde, .vib.sel si distingue da .vib',
        guasti.length ? guasti.join('   ')
          : 'vib: ' + JSON.stringify(r.vib) + '   vib.sel: ' + JSON.stringify(r.vibSel) + '   riferimento .diff: ' + JSON.stringify(r.rif));
    }

    /* ===================================================================
       PROVA 5 — RIVEDI-TUTORIAL (voce #112, compito 3). Il tutorial vero
       (l'oggetto Tut, non la schermata COME SI GIOCA) riparte da solo al
       prossimo fischio d'inizio quando SAVE.tutorialDone e' falso: la
       voce RIVEDI IL TUTORIAL, nel pannello dell'ingranaggio (#extra,
       accanto a COME SI GIOCA — non in PREFERENZE), non fa altro che
       togliere il permesso negato. La guardia che decide SE il tutorial
       parte resta quella di sempre, dentro startMatch (:11156).

       LA TRAPPOLA (ricognizione, voce #112): azzerare solo tutorialDone
       non basterebbe. Tut.start() scrive
       `SAVE.tutorialVisto=(SAVE.tutorialVisto|0)+1; if(>=TUT_APERTURE)
       SAVE.tutorialDone=true;` PRIMA di mostrare qualunque cosa (vedi
       :40513): con tutorialVisto rimasto a 3 o piu', la primissima
       Tut.start() della nuova amichevole richiuderebbe la porta nello
       stesso istante in cui l'ha aperta. Per questo la prova non si
       ferma ai due flag: arriva fino al kickoff vero e legge
       t.Tut.active, che __test espone bare (lo stesso oggetto del
       gioco, non una copia — vedi `G, Duel, Tut,` in fondo a __test).

       Si porta il gioco allo stato "tutorial gia' visto tre volte e
       chiuso" (il caso reale dopo la terza apertura), si clicca il
       vero #btnRivediTut col .click() del DOM (mai una chiamata diretta
       all'handler: e' il bottone che deve esistere ed essere
       raggiungibile, non solo la funzione dietro), poi si verificano in
       un solo voto: i due flag azzerati, un toast vero apparso (conta i
       figli di #toasts, mai un'attestazione), il tutorial che riparte
       DAVVERO in amichevole 1 giocatore, e la guardia che REGGE subito
       dopo a due giocatori (stessi flag appena azzerati: se la guardia
       leggesse solo tutorialDone e non anche G.mode, qui il tutorial
       ripartirebbe anche a due giocatori). Condanna sul gioco di oggi:
       #btnRivediTut non esiste, querySelector torna null, guasto
       leggibile invece di un'eccezione cieca sul .click() di null. */
    {
      const r = await pag.evaluate(({ taglia }) => {
        const t = window.__test;
        /* lo stato reale dopo la terza apertura: chiuso, e la conta gia'
           al soffitto */
        t.save.tutorialDone = true;
        t.save.tutorialVisto = 5;

        document.getElementById('gearBtn').click();
        const bottone = document.querySelector('#btnRivediTut');
        const bottoneTrovato = !!bottone;

        const toastsEl = document.getElementById('toasts');
        const toastPrima = toastsEl ? toastsEl.children.length : -1;
        if (bottone) bottone.click();
        const toastDopo = toastsEl ? toastsEl.children.length : -1;

        const tutorialDoneDopo = bottone ? t.save.tutorialDone : null;
        const tutorialVistoDopo = bottone ? t.save.tutorialVisto : null;

        let tutAttivo1p = null, tutAttivo2p = null;
        if (bottone) {
          t.startMatch(1, 1, { size: taglia });
          tutAttivo1p = t.Tut.active;
          /* la guardia deve reggere anche SUBITO dopo lo stesso
             azzeramento: due giocatori non e' un caso a parte, e' lo
             stesso salvataggio che ha appena riaperto la porta */
          t.startMatch(2, 1, { size: taglia });
          tutAttivo2p = t.Tut.active;
        }

        return { bottoneTrovato, toastPrima, toastDopo, tutorialDoneDopo, tutorialVistoDopo, tutAttivo1p, tutAttivo2p };
      }, { taglia: TAGLIA_BANCO });

      const guasti = [];
      if (!r.bottoneTrovato) guasti.push('#btnRivediTut non trovato nel pannello dell\'ingranaggio (#extra)');
      else {
        if (r.tutorialDoneDopo !== false) guasti.push('SAVE.tutorialDone dopo il click vale ' + r.tutorialDoneDopo + ' invece di false');
        if (r.tutorialVistoDopo !== 0) guasti.push('SAVE.tutorialVisto dopo il click vale ' + r.tutorialVistoDopo + ' invece di 0 (la trappola: solo tutorialDone lo richiuderebbe subito, vedi :40513)');
        if (r.toastDopo <= r.toastPrima) guasti.push('nessun toast di conferma dopo il click (#toasts: ' + r.toastPrima + ' -> ' + r.toastDopo + ')');
        if (r.tutAttivo1p !== true) guasti.push('t.Tut.active=' + r.tutAttivo1p + ' al kickoff dell\'amichevole 1 giocatore: il tutorial non e\' ripartito davvero');
        if (r.tutAttivo2p !== false) guasti.push('t.Tut.active=' + r.tutAttivo2p + ' al kickoff a 2 giocatori: la guardia di :11156 non regge dopo il click');
      }
      di(guasti.length === 0, '5. RIVEDI-TUTORIAL — il bottone azzera ENTRAMBI i flag, un toast conferma, e il tutorial vero riparte al prossimo kickoff 1 giocatore (mai a 2)',
        guasti.length ? guasti.join('   ')
          : 'tutorialDone/Visto dopo il click: ' + r.tutorialDoneDopo + '/' + r.tutorialVistoDopo +
            '   toast: ' + r.toastPrima + ' -> ' + r.toastDopo +
            '   Tut.active 1p=' + r.tutAttivo1p + '  2p=' + r.tutAttivo2p);
    }

    /* ===================================================================
       PROVA 6 — SOTTOTITOLI (voce #112, compito 4). Il fischio d'inizio
       (dentro startMatch, Audio5.whistle(false) subito prima del punto
       in cui questo compito aggiunge sottotitolo('FISCHIO',...)) scatta
       a OGNI kickoff: e' il fischio piu' esercitato di tutti in
       CPU-CPU, quindi non serve costruire nessuna scena, basta
       chiamare t.startMatch(...) due volte, una col flag acceso e una
       spento. startMatch azzera G.banner all'inizio della sua stessa
       chiamata (vedi il commento a "LA STRISCIA DEGLI EVENTI TACE SUL
       GOL" nel file, la stessa riga che azzera banner per il gol vale
       anche qui): un banner rimasto dalla chiamata precedente non puo'
       sopravvivere fino alla lettura, quindi se col flag spento il
       banner resta vuoto e' perche' sottotitolo() ha davvero taciuto.
       L'ULTIMO CONTROLLO e' il piu' importante: showBanner chiamata
       BARE (come PALO!/GOL!/FALLO! la chiamano per davvero, la stessa
       via di prova 2) deve accendere G.banner anche con SAVE.sott=0 --
       il flag AGGIUNGE i fischi muti, non filtra i banner preesistenti.
       IL PRIMO AVVIO si legge PRIMA di toccare niente: nessuna prova
       precedente scrive t.save.sott, quindi il valore letto qui e'
       ancora quello che defaultSave() ha scritto al caricamento della
       pagina — non un valore che questa stessa prova ha appena forzato
       (un t.save.sott=1 esplicito sarebbe vero anche sul gioco di ieri,
       che accetta qualunque proprieta' su un oggetto JS: leggere PRIMA
       di scrivere e' l'unico modo di misurare il default vero). */
    {
      const r = await pag.evaluate(({ taglia }) => {
        const t = window.__test;
        const sottDefault = t.save.sott;

        t.save.sott = 1;
        t.startMatch(1, 1, { size: taglia });
        const accesoConFlag = t.banner;

        t.save.sott = 0;
        t.startMatch(1, 1, { size: taglia });
        const spentoConFlag = t.banner;

        /* il flag non spegne un banner GIA' esistente: showBanner resta
           bare, come lo chiamano davvero PALO!/GOL!/FALLO! */
        showBanner('GOL', '#ffb020', 1.0);
        const bannerVecchioSopravvive = t.banner;

        return { sottDefault, accesoConFlag, spentoConFlag, bannerVecchioSopravvive };
      }, { taglia: TAGLIA_BANCO });

      const guasti = [];
      if (r.sottDefault !== 1) guasti.push('primo avvio: SAVE.sott=' + r.sottDefault + ' invece di 1 (acceso di serie)');
      if (!(r.accesoConFlag && r.accesoConFlag.text === 'FISCHIO' && r.accesoConFlag.t > 0))
        guasti.push('con sott=1 il fischio d\'inizio non produce banner FISCHIO (letto ' + JSON.stringify(r.accesoConFlag) + ')');
      if (r.spentoConFlag && r.spentoConFlag.text === 'FISCHIO' && r.spentoConFlag.t > 0)
        guasti.push('con sott=0 il fischio d\'inizio produce COMUNQUE un banner FISCHIO (letto ' + JSON.stringify(r.spentoConFlag) + ')');
      if (!(r.bannerVecchioSopravvive && r.bannerVecchioSopravvive.text === 'GOL' && r.bannerVecchioSopravvive.t > 0))
        guasti.push('con sott=0 un banner preesistente (GOL, via showBanner bare) non si accende: il flag lo spegnerebbe anche a lui (letto ' + JSON.stringify(r.bannerVecchioSopravvive) + ')');

      di(guasti.length === 0, '6. SOTTOTITOLI — con SAVE.sott acceso il fischio d\'inizio porta G.banner a \'FISCHIO\'; spento lo tace, senza spegnere i banner preesistenti',
        guasti.length ? guasti.join('   ')
          : 'acceso: ' + JSON.stringify(r.accesoConFlag) + '   spento: ' + JSON.stringify(r.spentoConFlag) + '   preesistente (GOL) con sott=0: ' + JSON.stringify(r.bannerVecchioSopravvive));
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
