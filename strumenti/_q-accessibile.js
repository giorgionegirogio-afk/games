/* =====================================================================
   _q-accessibile.js — LE ETICHETTE HANNO UN GIUDICE CHE LE ASPETTA
   (voce #112, compito 1, primo compito del ramo voce-112-spiccioli-ux).

   IL PERCHE'. Il cantiere #112 chiude l'onda A del mandato con sei cure
   di UX/accessibilita' a rischio quasi zero (nessuna tocca dado(), una
   decisione di gioco o uno stato che la CPU legge). Questo compito ne
   porta due, entrambe di puro contorno: aria-pressed sui cinque
   interruttori di IMPOSTAZIONI, e il rettangolo del banner dichiarato
   in zoneInterfaccia(). Questo banco nasce PRIMA dell'attrezzo che le
   applica (strumenti/_t-aria-etichette.js) e le condanna: sul gioco di
   oggi (zero aria-pressed nel file, banner mai dichiarato) le due prove
   sono rosse per costruzione.

   LE DUE PROVE:
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

   ZERO dado() NUOVI in questo file, come in _q-battute.js: nessuna
   delle due prove decide niente per la CPU, entrambe leggono markup e
   una funzione di interfaccia gia' esistente.

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
