/* =====================================================================
   EQUITA' — la promessa del modello di guadagno, misurata.

   CALCETTO vendera' oggetti estetici: campi, divise, cori, sponsor. La
   promessa al giocatore e' che NESSUN oggetto comprato dia vantaggio in
   campo. Una promessa cosi' non si dichiara: si misura. Questo strumento
   gioca N partite CPU contro CPU in due configurazioni — A quella base,
   B quella con gli oggetti attivi — e confronta la differenza reti media
   delle due. Se comprare sposta il risultato, il cancello dice NO.

   IL CONFRONTO E' APPAIATO: la partita i di A e la partita i di B usano
   lo STESSO seme (seme base + i), quindi pescano la stessa identica
   sequenza di numeri casuali. Con 200 partite per lato, la varianza del
   caso si elide quasi tutta e resta visibile solo l'effetto della
   configurazione. Senza appaiamento servirebbero migliaia di partite per
   distinguere un vantaggio piccolo dal rumore.

   IL CASO, GOVERNATO: Math.random e' sostituito con xorshift32 a seme
   fisso PRIMA che la pagina esegua una riga (stesso generatore di
   scatta.js), e in piu' e' ri-seminabile per partita da window.__caso.

   IL CICLO DI DISEGNO, SPENTO: frame() fa avanzare la fisica con
   l'orologio a muro; se restasse vivo, fra una chiamata e l'altra dello
   strumento la partita avanzerebbe di nascosto e in modo non
   riproducibile. Qui requestAnimationFrame viene azzerato dopo il
   caricamento: tutta la fisica passa SOLO da __test.simulate, a blocchi
   grandi, senza mai disegnare. E' cio' che rende ogni partita identica a
   se stessa e veloce.

   LA PROVA CHE SA FALLIRE, incorporata: senza --conf-b, il lato B e'
   identico ad A, e con semi appaiati le coppie DEVONO uscire identiche
   reti a reti. Se anche una differisce, lo strumento stesso e' diventato
   non deterministico ed e' cieco: NO. Uno strumento che attesta invece
   di misurare e' peggio di nessuno strumento.

   uso:  node strumenti/equita.js
         node strumenti/equita.js --partite 20 --soglia 0.15 --seme 7
         node strumenti/equita.js --conf-b "frammento JS eseguito nella
              pagina dopo il caricamento del lato B (es. attiva oggetti)"
   Esce con codice 1 se la differenza fra le medie supera la soglia
   (default 0,15 gol a partita), se una partita non finisce, o se il
   confronto A contro A non e' identico.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
/* --- innesto di _q-banco.js: la radice resta il repo, ma il gioco puo'
   arrivare da fuori. Nessun altro comportamento e' toccato. --- */
const __PROVA = process.env.GIOCO_PROVA ? require('path').resolve(process.env.GIOCO_PROVA) : '';
const __rid = f => (__PROVA && /CALCETTO-il-gioco\.html$/i.test(f)) ? __PROVA : f;

function arg(n, d) {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
}
function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = __rid(path.join(RADICE, decodeURIComponent(req.url.split('?')[0])));
      if ((!f.startsWith(RADICE) && f !== __PROVA) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

const esiti = [];
function verifica(ok, testo, dettaglio) {
  esiti.push(!!ok);
  console.log((ok ? '  OK   ' : '  NO   ') + testo + (dettaglio ? '\n         ' + dettaglio : ''));
}

/* Un lato del confronto: una pagina nuova, N partite sulla stessa pagina.
   Il contesto e' fresco (salvataggio vuoto), cosi' A e B partono dallo
   stesso identico stato e la progressione fra le partite — monete, rosa —
   evolve allo stesso modo nei due lati, se davvero niente cambia. */
async function giocaLato(browser, porta, nome, conf, partite, semeBase) {
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push('ECCEZIONE: ' + e.message));

  /* il caso si governa prima di ogni riga di pagina, come in scatta.js;
     in piu' qui il generatore si puo' ri-seminare per partita */
  await pag.addInitScript(seme => {
    let s = seme >>> 0 || 1;
    const prossimo = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => prossimo() / 4294967296;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = prossimo(); return a; };
    }
    window.__caso = { semina(n) { s = n >>> 0 || 1; } };
  }, semeBase);

  await pag.goto(`http://127.0.0.1:${porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });

  /* si spegne il ciclo di disegno: da qui in poi la fisica avanza solo
     dentro simulate(). Il fotogramma gia' prenotato sfuma nell'attesa. */
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => {
    const t = window.__test;
    t.dismissSplash && t.dismissSplash();
    if (t.save) t.save.tutorialDone = 1;   // il tutorial non deve entrare in campo
  });

  /* la configurazione del lato: un frammento JS libero, eseguito una
     volta, dopo il caricamento e prima di ogni partita */
  if (conf) await pag.evaluate(fr => { (0, eval)(fr); }, conf);

  const risultati = [];
  const inizio = Date.now();
  for (let i = 0; i < partite; i++) {
    const r = await pag.evaluate(seme => {
      const t = window.__test;
      window.__caso.semina(seme);
      t.startMatch(1, 1);
      t.setCpuVsCpu(true);
      /* a blocchi da dieci secondi simulati fino al fischio finale;
         600 secondi bastano a 90 di gara + golden goal + rigori, e sono
         il tetto che trasforma un'eventuale partita infinita in un NO */
      let sim = 0;
      while (t.state !== 'end' && sim < 600) { t.simulate(10); sim += 10; }
      return { r0: t.score[0], r1: t.score[1], scena: t.state, sim };
    }, (semeBase + i) >>> 0);
    risultati.push(r);
    if ((i + 1) % 20 === 0) console.log(`  --    lato ${nome}: ${i + 1}/${partite} partite`);
  }
  const ms = Date.now() - inizio;

  await ctx.close();
  return { nome, risultati, ms, errori };
}

(async () => {
  const partite = Math.max(1, +arg('partite', 200) | 0);
  const soglia = +arg('soglia', 0.15);
  const semeBase = +arg('seme', 20260803);
  const confB = arg('conf-b', '');

  const srv = await servi();
  const browser = await chromium.launch();

  console.log(`\n=== EQUITA' — ${partite} partite per lato, semi appaiati (base ${semeBase}) ===`);
  console.log(confB ? `  --    lato B: ${confB.slice(0, 100)}${confB.length > 100 ? '...' : ''}`
                    : '  --    lato B senza --conf-b: identico ad A (autodiagnosi del determinismo)');

  /* un lato alla volta: un solo browser, una sola pagina viva per volta */
  const A = await giocaLato(browser, srv.porta, 'A', '', partite, semeBase);
  const B = await giocaLato(browser, srv.porta, 'B', confB, partite, semeBase);

  await browser.close(); srv.chiudi();

  const media = lato => lato.risultati.reduce((s, r) => s + (r.r0 - r.r1), 0) / lato.risultati.length;
  const reti = lato => lato.risultati.reduce((s, r) => s + r.r0 + r.r1, 0) / lato.risultati.length;
  const nonFinite = lato => lato.risultati.filter(r => r.scena !== 'end');

  const mA = media(A), mB = media(B);
  for (const l of [A, B]) {
    console.log(`\n  --    lato ${l.nome}: media differenza reti ${(l === A ? mA : mB) >= 0 ? '+' : ''}${(l === A ? mA : mB).toFixed(3)}` +
      ` (squadra 0 meno squadra 1), ${reti(l).toFixed(2)} reti totali a partita,` +
      ` ${(l.ms / 1000).toFixed(1)} s in tutto = ${(l.ms / l.risultati.length / 1000).toFixed(2)} s a partita`);
  }
  console.log('');

  /* --- 1. ogni partita deve arrivare al fischio finale --- */
  const nfA = nonFinite(A), nfB = nonFinite(B);
  verifica(nfA.length === 0 && nfB.length === 0,
    `tutte le ${partite * 2} partite arrivano al fischio finale`,
    (nfA.length + nfB.length) ? `bloccate: A ${nfA.length}, B ${nfB.length} (prima scena bloccata: ${(nfA[0] || nfB[0]).scena})` : '');

  /* --- 2. nessuna eccezione di pagina --- */
  verifica(A.errori.length === 0 && B.errori.length === 0, 'nessuna eccezione nelle pagine',
    (A.errori[0] || B.errori[0] || ''));

  /* --- 3. senza conf-b, A e B DEVONO essere identici coppia a coppia:
     se non lo sono lo strumento ha perso il determinismo ed e' cieco --- */
  const identiche = A.risultati.filter((r, i) => r.r0 === B.risultati[i].r0 && r.r1 === B.risultati[i].r1).length;
  if (!confB) {
    verifica(identiche === partite,
      `autodiagnosi: A contro A da' coppie identiche (${identiche}/${partite})`,
      identiche < partite ? 'il gioco attinge a un caso non governato dal seme: la misura non e\' riproducibile' : '');
  } else {
    console.log(`  --    coppie identiche A/B: ${identiche}/${partite} (con conf-b possono differire)`);
  }

  /* --- 4. IL CANCELLO: la configurazione B non deve spostare il risultato --- */
  const delta = Math.abs(mA - mB);
  verifica(delta <= soglia,
    `la differenza fra le medie e' ${delta.toFixed(3)} gol a partita, ${delta <= soglia ? 'entro' : 'OLTRE'} la soglia ${soglia}`,
    delta > soglia ? 'la configurazione B sposta il risultato in campo: il vantaggio comprato esiste' : '');

  const male = esiti.filter(x => !x).length;
  console.log(`\n${esiti.length} controlli, ${esiti.length - male} passati, ${male} falliti`);
  if (male) {
    console.log('\nSe il cancello e\' rosso, la promessa del modello di guadagno e\' rotta:');
    console.log('un oggetto in vendita cambia le partite. Non si vende finche\' non torna verde.');
    process.exit(1);
  }
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
