/* =====================================================================
   _q-mentalita.js — IL CANCELLO DELLA MENTALITA' DI SQUADRA.

   PERCHE' ESISTE. _eventi.js sa dire se una mentalita' cambia i GOL, e
   lo dice bene (100 partite, semi dichiarati). Non sa dire nessuna delle
   altre cinque cose per cui una tattica o e' vera o e' una didascalia:

     1. che la voce neutra sia DAVVERO neutra — se EQUILIBRIO spostasse
        anche una casella di un'unita', ogni cancello tarato sul gioco di
        ieri starebbe misurando un gioco diverso senza saperlo;
     2. che la FORMA della squadra si muova nel verso promesso, su tutte
        e tre le taglie e non solo su quella che si e' misurata;
     3. che al calcio d'inizio nessuno sconfini nella meta' campo
        avversaria per colpa della postura;
     4. che i comandi esistano e MORDANO — la riga di GIOCA prima del
        fischio, la voce di PAUSA durante;
     5. che un salvataggio manomesso non possa iniettare una mentalita'
        che non esiste;
     6. che la SCHERMATA non menta — aggiunto il 28 agosto 2026, dopo un
        difetto vero. Non basta che i comandi mordano: la riga di
        pastiglie e la voce di pausa mostrano lo STESSO numero in due
        posti, e il punto 4bis percorre col dito PAUSA -> tocco ->
        ABBANDONA -> menu -> GIOCA per verificare che dopo il salto le
        due non si contraddicano. Fino a quel giorno questo cancello
        chiamava refreshMentRow() a mano prima di guardare la riga, ed
        era un falso verde: rendeva verde proprio la cosa rotta. La
        chiamata di comodo e' stata tolta; il punto 4bis, sulla versione
        col difetto, segna due rossi su trentatre.

   LA MISURA DELLA FORMA SI FA SULLE CASELLE, non sulle posizioni dopo
   resetKickoff, e questa riga e' pagata con un errore vero: chi batte il
   calcio d'inizio viene portato al centro del campo, e a 5 e a 7 contro
   7 e' proprio uno degli uomini piu' avanzati. Misurando le posizioni,
   l'uomo piu' avanzato risultava lo STESSO in tutte e tre le mentalita'
   (545 unita' a cinque contro cinque, tre volte su tre) e la forma
   sembrava non cambiare. Si legge formation(0), che e' la funzione dove
   la postura diventa coordinate.

   uso:  node strumenti/_q-mentalita.js
         node strumenti/_q-mentalita.js --gioco fuori/ment.html
   La variabile d'ambiente GIOCO_PROVA vale come --gioco.
   ===================================================================== */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
/* il server serve il repo; --gioco dirotta la richiesta del file di gioco
   (stessa regola di _eventi.js e _q-meta.js) */
function servi(prova) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (prova && /CALCETTO-il-gioco\.html$/i.test(f)) f = prova;
      if ((!f.startsWith(RADICE) && f !== prova) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

let passati = 0, falliti = 0;
const ok = (t, d) => { passati++; console.log('  OK   ' + t + (d ? '  [' + d + ']' : '')); };
const no = (t, d) => { falliti++; console.log('  NO   ' + t + (d ? '  [' + d + ']' : '')); };
const dice = (c, t, d) => (c ? ok : no)(t, d);

(async () => {
  const prova = arg('gioco', process.env.GIOCO_PROVA || '');
  const provaAbs = prova ? path.resolve(prova) : '';
  if (provaAbs && !fs.existsSync(provaAbs)) { console.error('FALLITO: gioco di prova inesistente: ' + provaAbs); process.exit(1); }

  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 } });
  const pag = await ctx.newPage();
  const eccezioni = [];
  pag.on('pageerror', e => eccezioni.push(e.message));

  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });

  console.log('\n=== MENTALITA\' DI SQUADRA ===');
  console.log('  --    gioco: ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)'));

  /* il gioco ha la mentalita'? se no, non c'e' niente da misurare */
  const laHa = await pag.evaluate(() => typeof MENT !== 'undefined' && Array.isArray(MENT));
  if (!laHa) {
    console.log('\n  --    questo gioco non ha la mentalita\' di squadra: niente da misurare.');
    console.log('  --    (e\' il gioco spedito prima di strumenti/_t-mentalita.js)');
    await browser.close(); srv.chiudi();
    process.exit(0);
  }

  /* ---------------- 1. la voce di serie e' la neutra ---------------- */
  const serie = await pag.evaluate(() => ({
    salvato: window.__test.save.mentalita,
    nomi: MENT.map(m => m.n),
    neutra: MENT[1],
  }));
  dice(serie.salvato === 1, 'il valore di serie e\' la voce neutra', 'SAVE.mentalita = ' + serie.salvato);
  dice(serie.nomi.length === 3, 'le mentalita\' sono tre', serie.nomi.join(' / '));
  {
    /* la neutralita' non e' un'opinione: ogni campo della riga di mezzo
       vale 0 (i delta) oppure 1 (i moltiplicatori). Cosi' l'espressione
       torna allo stesso double, non a uno vicino. */
    const n = serie.neutra, storti = [];
    for (const k of ['linea', 'ancora', 'punta']) if (n[k] !== 0) storti.push(k + '=' + n[k] + ' (atteso 0)');
    for (const k of ['blocco', 'largo', 'slancio']) if (n[k] !== 1) storti.push(k + '=' + n[k] + ' (atteso 1)');
    dice(storti.length === 0, 'la voce neutra e\' fatta di soli 0 e 1: l\'aritmetica torna al bit',
      storti.length ? storti.join(', ') : 'linea/ancora/punta 0, blocco/largo/slancio 1');
  }

  /* ---------------- 2. la forma, taglia per taglia ---------------- */
  const forme = await pag.evaluate(() => {
    const t = window.__test, R = {};
    for (const tg of [5, 7, 11]) {
      R[tg] = { FW: 0, FH: 0, m: {} };
      for (const m of [0, 1, 2]) {
        t.save.mentalita = m;
        t.startMatch(1, 1, { size: tg });
        R[tg].FW = FW; R[tg].FH = FH;
        /* le CASELLE, non le posizioni: resetKickoff sposta il battitore */
        const F = formation(0).slice(1);
        const xs = F.map(a => a[0]), ys = F.map(a => a[1]);
        R[tg].m[m] = {
          dietro: Math.min(...xs), avanti: Math.max(...xs),
          prof: Math.max(...xs) - Math.min(...xs),
          largo: Math.max(...ys) - Math.min(...ys),
        };
      }
      /* con EQUILIBRIO le caselle devono essere ESATTAMENTE quelle scritte
         nel modulo: si confronta il double, non il numero arrotondato */
      t.save.mentalita = 1;
      t.startMatch(1, 1, { size: tg });
      const F = formation(0), mod = TAGLIE[tg].modulo;
      let scarti = 0;
      for (let i = 0; i < mod.length; i++) {
        const att = mod[i].gk ? [40, FH / 2] : [FW * mod[i].fx, FH / 2 + FH * mod[i].fy];
        if (F[i][0] !== att[0] || F[i][1] !== att[1]) scarti++;
      }
      R[tg].scartiNeutri = scarti;
    }
    return R;
  });

  console.log('\n  la forma della squadra, in unita\' di campo (caselle di formation, portiere escluso)');
  console.log('    taglia            dietro  avanti  profondita\'  larghezza');
  for (const tg of [5, 7, 11]) {
    for (const m of [0, 1, 2]) {
      const f = forme[tg].m[m];
      console.log('    ' + (tg + ' ' + ['DIFESA', 'EQUILIBRIO', 'ATTACCO'][m]).padEnd(18) +
        String(Math.round(f.dietro)).padStart(6) + String(Math.round(f.avanti)).padStart(8) +
        String(Math.round(f.prof)).padStart(13) + String(Math.round(f.largo)).padStart(11));
    }
  }
  console.log('');

  for (const tg of [5, 7, 11]) {
    const D = forme[tg].m[0], E = forme[tg].m[1], A = forme[tg].m[2], FWn = forme[tg].FW;
    dice(forme[tg].scartiNeutri === 0,
      tg + ' contro ' + tg + ': con EQUILIBRIO le caselle sono quelle del modulo, al bit',
      forme[tg].scartiNeutri + ' caselle fuori posto su ' + (tg === 5 ? 5 : tg === 7 ? 7 : 11));
    dice(D.dietro < E.dietro && E.dietro < A.dietro,
      tg + ' contro ' + tg + ': la linea sale da DIFESA ad ATTACCO',
      Math.round(D.dietro) + ' < ' + Math.round(E.dietro) + ' < ' + Math.round(A.dietro));
    dice(D.largo < E.largo && E.largo < A.largo,
      tg + ' contro ' + tg + ': la squadra si allarga da DIFESA ad ATTACCO',
      Math.round(D.largo) + ' < ' + Math.round(E.largo) + ' < ' + Math.round(A.largo));
    dice(D.prof < E.prof && E.prof < A.prof,
      tg + ' contro ' + tg + ': il blocco si allunga da DIFESA ad ATTACCO',
      Math.round(D.prof) + ' < ' + Math.round(E.prof) + ' < ' + Math.round(A.prof));
    /* al calcio d'inizio nessuno sta nella meta' campo di la' */
    const oltre = [D, E, A].filter(f => f.avanti >= FWn / 2).length;
    dice(oltre === 0, tg + ' contro ' + tg + ': al calcio d\'inizio nessuna casella varca la meta\' campo',
      'piu\' avanzata ' + Math.round(A.avanti) + ' su ' + (FWn / 2));
  }

  /* ---------------- 3. i comandi prima del fischio ----------------
     QUI NON SI CHIAMA refreshMentRow() A MANO, e la riga di codice che
     lo faceva e' stata tolta il 28 agosto 2026 perche' era un FALSO
     VERDE — il secondo di questo cancello, dopo quello del punto 6bis.
     Il commento che la accompagnava diceva «la riga si ridipinge quando
     la si guarda, non solo al caricamento»: era falso nel gioco
     spedito, la riga si ridipingeva solo all'avvio, al click di una
     pastiglia e in AZZERA DATI. Quella chiamata di comodo era esattamente
     cio' che rendeva verde il controllo «ne e' selezionata una sola, ed
     e' la neutra», e teneva nascosto il difetto che il punto 4bis qui
     sotto adesso percorre col dito.
     La selezione che si legge qui e' quindi quella VERA, dipinta
     all'avvio; il punto 2 ha mosso t.save.mentalita ma non ha toccato la
     riga, e la riga deve comunque dire la verita' su cio' che il
     salvataggio porta ADESSO — percio' si rimette il salvataggio sulla
     neutra e si confronta. */
  const gioca = await pag.evaluate(() => {
    const t = window.__test;
    t.save.mentalita = 1;
    const bs = [...document.querySelectorAll('.ment')];
    const sel = () => [...document.querySelectorAll('.ment')].filter(x => x.classList.contains('sel')).map(x => +x.dataset.m);
    const prima = sel();
    bs[2].click();
    const dopo = sel();
    const salvato = t.save.mentalita;
    t.startMatch(1, 1, { size: 11 });
    return { quante: bs.length, prima, dopo, salvato, inPartita: t.mentalita };
  });
  dice(gioca.quante === 3, 'la riga di GIOCA ha tre pastiglie', gioca.quante + ' pastiglie');
  dice(gioca.prima.length === 1 && gioca.prima[0] === 1,
    'ne e\' selezionata una sola, ed e\' la neutra', 'selezionata: ' + gioca.prima.join(','));
  dice(gioca.dopo.length === 1 && gioca.dopo[0] === 2 && gioca.salvato === 2,
    'toccare ATTACCO sposta la selezione e scrive il salvataggio',
    'selezionata ' + gioca.dopo.join(',') + ', salvato ' + gioca.salvato);
  dice(gioca.inPartita[0] === 2 && gioca.inPartita[1] === 1,
    'la partita nasce con la scelta di chi gioca, e la CPU senza avversario resta neutra',
    'G.ment = [' + gioca.inPartita.join(',') + ']');

  /* ---------------- 4. il comando in corsa, dalla PAUSA ---------------- */
  await pag.keyboard.press('Escape');
  await pag.waitForTimeout(120);
  const pausaAperta = await pag.evaluate(() => !document.getElementById('pausa').classList.contains('hidden'));
  const testoPrima = await pag.evaluate(() => document.getElementById('btnPauseMent').textContent);
  dice(pausaAperta && /ATTACCO/.test(testoPrima), 'la PAUSA dichiara la mentalita\' in corso', testoPrima);
  const formaPrima = await pag.evaluate(() => {
    const F = formation(0).slice(1), ys = F.map(a => a[1]);
    return Math.round(Math.max(...ys) - Math.min(...ys));
  });
  await pag.click('#btnPauseMent', { force: true });
  await pag.waitForTimeout(80);
  const giro = await pag.evaluate(() => ({
    testo: document.getElementById('btnPauseMent').textContent,
    ment: window.__test.mentalita,
    salvato: window.__test.save.mentalita,
    largo: (() => { const F = formation(0).slice(1), ys = F.map(a => a[1]); return Math.round(Math.max(...ys) - Math.min(...ys)); })(),
  }));
  dice(giro.ment[0] === 0 && /DIFESA/.test(giro.testo),
    'un tocco in PAUSA gira la mentalita\' e la voce lo dice', giro.testo);
  dice(giro.ment[1] === 1, 'il tocco NON tocca la panchina avversaria', 'G.ment = [' + giro.ment.join(',') + ']');
  dice(giro.salvato === 0, 'la scelta fatta in corsa resta nel salvataggio', 'SAVE.mentalita = ' + giro.salvato);
  dice(giro.largo < formaPrima,
    'e la squadra si stringe DAVVERO, a partita in corso', formaPrima + ' -> ' + giro.largo + ' unita\' di larghezza');

  /* ------- 4bis. LA SCHERMATA NON DEVE MENTIRE SU CIO' CHE E' STATO
     SCELTO IN CORSA — il percorso del dito, non lo stato in memoria.

     Questo e' il controllo che mancava, ed e' quello che ha lasciato
     passare un difetto vero: la voce di PAUSA scriveva SAVE.mentalita e
     ridipingeva SOLO se stessa, cosi' che dopo
       PAUSA -> tocco -> ABBANDONA -> menu -> GIOCA
     la riga di pastiglie restava sulla scelta di prima. La schermata
     dichiarava EQUILIBRIO e il campo giocava ATTACCO, e chi voleva
     EQUILIBRIO non aveva modo di accorgersene: la pastiglia che voleva
     era gia' accesa.
     Si CAMMINA sui bottoni veri: nessuna funzione di ridisegno chiamata
     a mano, se no si torna al falso verde di sopra. Lo stato di
     partenza e' quello che il punto 4 ha lasciato — riga dipinta su
     ATTACCO dal click del punto 3, salvataggio portato a DIFESA dalla
     voce di pausa — che e' esattamente la condizione in cui le due cose
     divergono. -------------------------------------------------- */
  await pag.click('#btnQuit', { force: true });
  await pag.waitForTimeout(200);
  await pag.click('#btnGioca', { force: true });
  await pag.waitForTimeout(250);
  const rientro = await pag.evaluate(() => ({
    aperta: !document.getElementById('gioca').classList.contains('hidden'),
    accese: [...document.querySelectorAll('.ment')].filter(b => b.classList.contains('sel')).map(b => +b.dataset.m),
    salvato: window.__test.save.mentalita,
  }));
  dice(rientro.aperta, 'ABBANDONA e poi GIOCA riportano alla schermata delle scelte');
  dice(rientro.accese.length === 1 && rientro.accese[0] === rientro.salvato,
    'la riga di GIOCA dice la scelta fatta in PAUSA, non quella di prima',
    'accesa [' + rientro.accese.join(',') + '], SAVE.mentalita = ' + rientro.salvato);
  /* e la partita che parte dopo deve giocare la stessa cosa che la
     pastiglia accesa promette: se le due divergessero, la schermata
     sarebbe una didascalia */
  const riparte = await pag.evaluate(() => { window.__test.startMatch(1, 1, { size: 11 }); return window.__test.mentalita; });
  dice(riparte[0] === rientro.accese[0],
    'e la partita che riparte gioca quello che la pastiglia accesa dichiara',
    'pastiglia ' + rientro.accese[0] + ', G.ment = [' + riparte.join(',') + ']');

  /* ---------------- 5. un salvataggio manomesso non passa ------------
     SI CHIAMA loadSave() A MANO, e non si ricarica la pagina, e la
     ragione e' un falso verde preso in faccia: quando la scheda si
     nasconde il gioco SCRIVE il salvataggio (e' voluto, su Android
     un'app in sottofondo puo' essere uccisa senza preavviso). Una
     ricarica fa quindi passare persistSave PRIMA di loadSave, il valore
     manomesso viene sovrascritto da quello buono in memoria, e il
     controllo dichiara vittoria senza aver provato niente.
     Qui si scrive il veleno e si chiede al lettore, subito. */
  const manomesso = await pag.evaluate(() => {
    const casi = [99, -1, 3, '2', 1.5, null, {}, true];
    const letti = [];
    for (const v of casi) {
      try { localStorage.setItem('calcetto_save_v4', JSON.stringify({ mentalita: v })); } catch (e) { }
      letti.push(loadSave().mentalita);
    }
    /* e il valore BUONO deve invece passare, se no il controllo sopra
       sarebbe verde anche con un lettore che ignora sempre il campo */
    localStorage.setItem('calcetto_save_v4', JSON.stringify({ mentalita: 2 }));
    return { veleni: letti, buono: loadSave().mentalita };
  });
  dice(manomesso.veleni.every(v => v === 1),
    'otto salvataggi manomessi ricadono tutti sulla voce neutra', 'letti: ' + manomesso.veleni.join(','));
  dice(manomesso.buono === 2,
    'e un salvataggio legittimo invece passa (il controllo sopra non e\' vuoto)', 'letto ' + manomesso.buono);

  dice(eccezioni.length === 0, 'nessuna eccezione di pagina', eccezioni[0] || '');

  await browser.close(); srv.chiudi();
  console.log('\n' + (passati + falliti) + ' controlli, ' + passati + ' passati, ' + falliti + ' falliti');
  process.exit(falliti ? 1 : 0);
})().catch(e => { console.error('FALLITO: ' + e.message); process.exit(1); });
