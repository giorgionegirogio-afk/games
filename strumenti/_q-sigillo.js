/* =====================================================================
   _q-sigillo.js — IL VERDETTO ARRIVA FINO ALL'OCCHIO?
   (voce #134). Nasce ROSSO: il `GET /api/sfida` non restituisce la
   colonna `verificata`, quindi il verdetto del giudice non esce dal
   database e la riga della lista non ha niente da dire.

   CHE COSA MISURA, e perche' non lo misura nessun altro cancello.
   L'onda D ha costruito il giudizio in tre voci: il metro (#130), il
   duello dentro al nastro (#131), i cinque canali che facevano divergere
   una rigiocata onesta (#132), il giudice coi cinque verdetti (#133).
   `_q-giudice.js` sorveglia il giudice e basta: gli passa un nastro e
   legge una stringa, SENZA SCHERMO e senza server. `_q-sfida.js`
   sorveglia la schermata e il giro del nastro fra due telefoni, ma della
   verifica non sa niente.
   In mezzo c'e' un tubo che non esiste: la colonna `verificata` sta
   nello schema da mesi (`rete/schema.sql:125`) e `grep verificata
   rete/api/` trova UNA occorrenza, dentro a un commento. Un giudice che
   lavora e nessuno che veda il suo lavoro e' una promessa scritta piu'
   in piccolo, non una promessa mantenuta.

   TRE GRUPPI DI PROVE, uno per ogni pezzo del tubo.

   A) IL SERVER. Non c'e' nessun server finto: si carica il modulo VERO
      `rete/api/sfida.js` (ESM, `import()` dinamico) e gli si mette al
      posto di `db` un finto che si comporta come PostgREST — cioe' che
      ONORA LA `select`. E' il punto che rende questa prova una misura
      invece di un attestato: un finto che restituisse la riga intera
      direbbe verde anche con la colonna fuori dalla `select`, ed e'
      esattamente il difetto che questo cancello deve trovare.

   B) LA LISTA. Tre righe con `verificata` 1, -1 e 0 devono dare tre
      parole diverse sulla schermata, `NON TORNA` deve comparire UNA
      volta sola (quella del -1), e l'azione primaria deve restare sopra
      la piega.

   C) GUARDA. Il replay che gia' avviene deve lasciare un verdetto, e il
      verdetto deve essere quello del GIUDICE — non di un secondo giudice
      scritto accanto.

   NESSUN INNOCENTE ACCUSATO, ANCHE NELLE PAROLE: `NON TORNA` e' l'unico
   verdetto che puo' muovere punti, e dev'essere l'unica parola che
   accusa. `INCOMPLETO`, `ALTRO MOTORE` e `NON FINISCE` sono «non lo so»
   e la lista li deve dire senza dare la colpa a nessuno.

   uso:  node strumenti/_q-sigillo.js
         node strumenti/_q-sigillo.js --gioco fuori/x.html
         node strumenti/_q-sigillo.js --api fuori/api-sfida-sordo.mjs
   esce 0 se passa tutto, 1 se una prova fallisce, 2 se il banco esplode,
   3 se il gioco indicato non ha la schermata (prova nulla).
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const provaRel = arg('gioco', process.env.GIOCO_PROVA || '');
const apiRel = arg('api', 'rete/api/sfida.js');

let ok = 0, no = 0;
const di = (buono, nome, det) => {
  if (buono) { ok++; console.log('  OK  ' + nome + (det ? '  [' + det + ']' : '')); }
  else { no++; console.log('  NO  ' + nome + (det ? '  [' + det + ']' : '')); }
};
const titolo = t => console.log('\n' + t);

/* =====================================================================
   GRUPPO A — IL SERVER VERO, CON UN DATABASE DI CARTA.

   `rete/` e' `"type": "module"`: da qui (CommonJS) si carica con
   `import()` dinamico. Le due variabili d'ambiente vanno messe PRIMA,
   perche' `comuni.js` le legge quando viene valutato e `configurato()`
   senza di loro fa rispondere 503 'spento' a ogni endpoint.

   IL FINTO ONORA LA `select`, ed e' tutta la differenza fra misurare e
   attestare: PostgREST restituisce SOLO le colonne chieste, e un banco
   che restituisse la riga intera non si accorgerebbe mai che la colonna
   non e' stata chiesta.
   ===================================================================== */
function proietta(riga, query) {
  const m = /(?:^|&)select=([^&]*)/.exec(query || '');
  if (!m) return Object.assign({}, riga);
  const fuori = {};
  for (const c of m[1].split(',')) if (c && (c in riga)) fuori[c] = riga[c];
  return fuori;
}

async function gruppoA() {
  titolo('A) IL VERDETTO ESCE DAL DATABASE — il modulo vero, con un db di carta');

  process.env.SUPABASE_URL = 'http://database.di.carta';
  process.env.SUPABASE_SERVICE_KEY = 'chiave-di-carta';

  const comuni = await import(pathToFileURL(path.join(RADICE, 'rete/lib/comuni.js')).href);
  const apiAbs = path.resolve(RADICE, apiRel);
  if (!fs.existsSync(apiAbs)) { console.error('non trovo ' + apiAbs); process.exit(3); }
  const mod = await import(pathToFileURL(apiAbs).href);
  const handler = mod.default;
  if (typeof handler !== 'function') { console.error('il modulo non esporta un handler'); process.exit(2); }

  const IO = '11111111-1111-4111-8111-111111111111';
  const ALTRO = '22222222-2222-4222-8222-222222222222';
  const SEGRETO = 'segreto-di-carta';

  /* una chiamata al GET, col database di carta e il freno che dice quel
     che gli si dice di dire */
  async function chiamaGET(verificata, frenoPassa) {
    const visto = { query: [], frena: [] };
    const riga = {
      id: 7, attaccante: ALTRO, difensore: IO, seme: '424242', taglia: 5,
      gol_a: 3, gol_d: 2, replay: 'AAAA', peso: 4,
      giocata: '2026-09-22T10:00:00Z', vista: false, verificata: verificata,
      delta_a: 20, delta_d: -10,
    };
    comuni.db.leggi = async (tab, q) => {
      visto.query.push(tab + '?' + q);
      if (tab === 'allenatore') return [{ id: IO, segreto: comuni.digest(SEGRETO), bandito: false }];
      if (tab === 'sfida') return [proietta(riga, q)];
      if (tab === 'squadra') return [{ allenatore: ALTRO, nome: 'GLI ALTRI', colori: { maglia: '#aa3355' } }];
      return [];
    };
    comuni.db.chiama = async (f, a) => {
      if (f === 'frena') { visto.frena.push(a); return frenoPassa; }
      return null;
    };
    const req = { method: 'GET', headers: { authorization: 'Calcetto ' + IO + '.' + SEGRETO }, query: {} };
    let stato = 0, corpo = null;
    const res = {
      setHeader() {}, status(s) { stato = s; return this; },
      send(t) { corpo = JSON.parse(t); },
    };
    await handler(req, res);
    return { stato, corpo, visto };
  }

  /* A1 — il valore della colonna arriva davvero fuori, tutti e tre */
  const tre = [];
  for (const v of [0, 1, -1]) {
    const r = await chiamaGET(v, true);
    const s = r.corpo && Array.isArray(r.corpo.sfide) ? r.corpo.sfide[0] : null;
    tre.push({ chiesto: v, tornato: s ? s.verificata : undefined, stato: r.stato });
  }
  di(tre.every(t => t.stato === 200) && tre.every(t => t.tornato === t.chiesto),
     'A1) GET /api/sfida restituisce `verificata` col valore della riga (0, 1, -1)',
     tre.map(t => t.chiesto + '->' + String(t.tornato)).join(' · '));

  /* A2 — e la colonna e' stata CHIESTA a PostgREST. Si legge dalla query
     che il db di carta ha ricevuto, non dal testo del file: un banco che
     legge il sorgente attesta, uno che guarda la query misura. */
  const r0 = await chiamaGET(-1, true);
  const qSfida = r0.visto.query.filter(q => q.startsWith('sfida?'))[0] || '';
  di(/[?&]select=[^&]*\bverificata\b/.test(qSfida),
     'A2) la `select` chiesta al database contiene `verificata`',
     (/select=([^&]*)/.exec(qSfida) || [, '(nessuna select)'])[1]);

  /* A3 — il freno. Ogni endpoint ha il suo, perche' le funzioni Vercel
     non condividono memoria: un GET senza freno e' un endpoint che
     chiunque puo' battere a mitraglia. */
  const frenoChiesto = r0.visto.frena[0] || null;
  di(!!frenoChiesto && /^sfl:/.test(String(frenoChiesto.k)) &&
     frenoChiesto.tetto === 60 && frenoChiesto.secondi === 60,
     'A3a) il GET interroga il freno (sfl:<id>, 60 al minuto)',
     frenoChiesto ? JSON.stringify(frenoChiesto) : 'il freno non e\' stato interrogato');

  const rFrenato = await chiamaGET(0, false);
  di(rFrenato.stato === 429 && rFrenato.corpo && rFrenato.corpo.errore === 'troppe',
     'A3b) e se il freno dice di no, la risposta e\' 429/troppe',
     rFrenato.stato + ' ' + JSON.stringify(rFrenato.corpo));
}

/* =====================================================================
   GRUPPO B0 — IL CAMPO ARRIVA FINO AL TELEFONO.

   Il client oggi salva le righe come arrivano e questa prova passerebbe
   da sola: esiste perche' domani qualcuno potrebbe rimappare quelle
   righe campo per campo (`{id, seme, taglia, ...}`) e chiudere il tubo
   senza che nessuno se ne accorga. Le prove che costano poco e che
   vegliano su una regressione silenziosa valgono il loro posto.
   ===================================================================== */
async function gruppoB0(T, ss, B) {
  titolo('B0) IL CAMPO ARRIVA FINO AL TELEFONO');
  const idB = await B.pag.evaluate(() => window.__test.rete.mem().id);
  ss.db.sfide.length = 0;
  for (const v of [1, -1, 0]) {
    ss.db.sfide.push({
      id: ss.db.sfide.length + 1, attaccante: [...ss.db.squadre.keys()].filter(k => k !== idB)[0] || idB,
      difensore: idB, seme: '9' + v, taglia: 5, gol_a: 2, gol_d: 1,
      replay: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      giocata: new Date().toISOString(), vista: true, verificata: v,
    });
  }
  const letti = await B.pag.evaluate(async () => {
    await window.__test.sfida.aggiorna();
    return window.__test.sfida.sfide.map(s => s.verificata);
  });
  di(letti.length === 3 && letti[0] === 1 && letti[1] === -1 && letti[2] === 0,
     'B0) Sfida.sfide porta `verificata` riga per riga', JSON.stringify(letti));
}

/* =====================================================================
   GRUPPO B — LA RIGA DELLA LISTA.

   Si legge quel che c'e' SCRITTO sullo schermo, non quel che il gioco
   sa: fra il campo e l'occhio c'e' `Sfida.dipingi`, ed e' quello il
   pezzo che questo gruppo sorveglia.
   ===================================================================== */
const SIGILLI = ['DA VERIFICARE', 'VERIFICATA', 'NON TORNA', 'TORNA', 'NON VERIFICABILE'];

/* il testo del sigillo di ogni riga, nell'ordine in cui sono dipinte */
const sigilliDipinti = P => P.pag.evaluate(() =>
  [...document.querySelectorAll('#sfLista .sfriga')].map(r => {
    const s = r.querySelector('.sfsig');
    return s ? s.textContent.trim() : '';
  }));

async function gruppoB(T, ss, B, idB) {
  titolo('B) LA RIGA DELLA LISTA — tre valori, tre parole, una sola accusa');

  const parole = await B.pag.evaluate(async () => {
    await window.__test.sfida.aggiorna();
    return [...document.querySelectorAll('#sfLista .sfriga')].map(r => {
      const s = r.querySelector('.sfsig');
      return s ? s.textContent.trim() : '';
    });
  });

  /* le tre righe seminate da B0 sono, in ordine, verificata 1, -1, 0 */
  di(parole.length === 3 && parole[0] === 'VERIFICATA' && parole[1] === 'NON TORNA' &&
     parole[2] === 'DA VERIFICARE',
     'B1) tre valori di `verificata` danno tre parole diverse sulla riga',
     JSON.stringify(parole));

  /* NESSUN INNOCENTE ACCUSATO, ANCHE NELLE PAROLE. `NON TORNA` e' il
     solo verdetto che puo' muovere punti e dev'essere la sola parola che
     accusa: una lista che la scrivesse anche sul «non lo so» darebbe del
     baro a chi ha solo un nastro che il giudice non sa leggere. */
  const accuse = parole.filter(p => /NON TORNA/.test(p)).length;
  di(accuse === 1 && /NON TORNA/.test(parole[1]),
     'B2) `NON TORNA` compare UNA volta sola, sulla riga del -1',
     accuse + ' accuse su 3 righe');

  /* B3 — LA PIEGA. Il difetto gia' pagato sta scritto nel commento del
     TORNEO (CALCETTO-il-gioco.html, «LE OTTO SQUADRE SOPRA LA PIEGA»):
     il tabellone finiva 17 px sotto il piede opaco dei bottoni e
     l'ottava squadra spariva. La tentazione di questo cantiere e' la
     fascia di riepilogo in cima — «3 da verificare, 1 non torna» — che
     spinge tutto il resto sotto la piega su un telefono in orizzontale.
     Misurato prima della cura (fuori/_sonda-134-piega.js): a 800x360
     CERCA AVVERSARIO chiude a 220 e la prima riga a ~314, cioe' 46 px di
     margine. */
  const C = await T.apri(ss.browser, ss.portaGioco, { width: 800, height: 360 });
  try {
    await T.collega(C, ss.porta, 'DIFENSORI');
    await C.pag.evaluate(c => window.__test.rete.accettaTrasferimento(c), ss.codiceB);
    ss.db.sfide.length = 0;
    for (let i = 0; i < 5; i++) ss.db.sfide.push({
      id: i + 1, attaccante: ss.idA, difensore: idB, seme: '77' + i, taglia: 5,
      gol_a: 3, gol_d: 2, replay: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      giocata: new Date().toISOString(), vista: i > 1, verificata: i % 3 === 0 ? 0 : (i % 3 === 1 ? 1 : -1),
    });
    /* LA SCHERMATA SI APRE DAVVERO: un rettangolo preso su un pannello
       nascosto e' tutto zero, e un banco che misurasse quello direbbe
       sempre «sopra la piega». E' la trappola gemella di quella di
       tocco.js — chiedere al DOM dove finiscono i bersagli solo quando i
       bersagli esistono per davvero. */
    const piega = await C.pag.evaluate(async () => {
      const t = window.__test;
      t.sfida.apri();
      for (let i = 0; i < 100 && t.sfida.occupato; i++) await new Promise(r => setTimeout(r, 50));
      t.sfida.dipingi();
      const r = e => { const x = e && e.getBoundingClientRect(); return x ? Math.round(x.bottom) : -1; };
      return {
        h: innerHeight, righe: document.querySelectorAll('#sfLista .sfriga').length,
        cerca: r(document.getElementById('btnSfidaCerca')),
        primaRiga: r(document.querySelector('#sfLista .sfriga')),
        primoGuarda: r(document.querySelector('#sfLista [data-guarda]')),
        altezzaRiga: (() => { const x = document.querySelector('#sfLista .sfriga');
                              return x ? Math.round(x.getBoundingClientRect().height) : 0; })(),
      };
    });
    di(piega.righe === 5 && piega.cerca > 0 && piega.cerca <= piega.h &&
       piega.primaRiga > 0 && piega.primaRiga <= piega.h &&
       piega.primoGuarda > 0 && piega.primoGuarda <= piega.h,
       'B3) a 800x360 con cinque righe, CERCA AVVERSARIO e la prima riga restano sopra la piega',
       'piega ' + piega.h + ' · cerca chiude a ' + piega.cerca + ' · prima riga a ' + piega.primaRiga +
       ' · GUARDA a ' + piega.primoGuarda + ' · riga alta ' + piega.altezzaRiga + ' px');
  } finally { await C.ctx.close(); }
}

/* =====================================================================
   GRUPPO C — GUARDA VERIFICA MENTRE MOSTRA.

   Una sfida VERA, giocata a due telefoni: un banco che scrivesse il
   nastro a mano proverebbe il banco, non il gioco.
   ===================================================================== */
const sigilloDi = (P, id) => P.pag.evaluate(i => {
  const g = window.__test.sfida.giudicato || {};
  return g[i] || null;
}, id);

const giudizioDi = (P, nastro, atteso, opz) => P.pag.evaluate(([n, a, o]) => {
  const r = window.__test.giudica(n, a, o);
  return { verdetto: r.verdetto, causa: r.causa, gol: r.gol };
}, [nastro, atteso, opz]);

async function gruppoC(T, N, ss, A, B, browser) {
  titolo('C) GUARDA VERIFICA MENTRE MOSTRA — il verdetto e\' quello del giudice');

  ss.db.sfide.length = 0;
  const g1 = await T.giocaUna(A, ss);
  if (!g1.partita || !g1.riga) { console.error('nessuna sfida arrivata al fischio finale'); process.exit(3); }
  const id = g1.id, riga = g1.riga;
  const crudo = N.allarga(riga.replay);
  if (!crudo || crudo.indexOf('|') < 0) { console.error('il nastro non si e\' allargato'); process.exit(2); }
  const opz = { seme: String(riga.seme), taglia: riga.taglia | 0 };

  /* C1 — lo stesso schermo, il punteggio vero: TORNA */
  await B.pag.evaluate(async () => { await window.__test.sfida.aggiorna(); });
  await T.guardaUna(B, id);
  const s1 = await sigilloDi(B, id);
  di(!!s1 && s1.verdetto === 'TORNA',
     'C1) il replay guardato dal difensore, sullo stesso schermo, sigilla TORNA',
     s1 ? s1.verdetto + (s1.causa ? '/' + s1.causa : '') : 'nessun sigillo');

  /* C4a — e il sigillo e' quello del GIUDICE sullo stesso nastro */
  const gi1 = await giudizioDi(B, crudo, [riga.gol_a | 0, riga.gol_d | 0], opz);
  di(!!s1 && s1.verdetto === gi1.verdetto && (s1.causa || '') === (gi1.causa || ''),
     'C4a) lo stesso verdetto di __test.giudica sullo stesso nastro — una porta sola',
     'schermata ' + (s1 ? s1.verdetto : '—') + ' · giudice ' + gi1.verdetto);

  /* C2 — il punteggio dichiarato gonfiato di un gol: NON TORNA */
  riga.gol_a = (riga.gol_a | 0) + 1;
  await B.pag.evaluate(async () => { await window.__test.sfida.aggiorna(); });
  await T.guardaUna(B, id);
  const s2 = await sigilloDi(B, id);
  di(!!s2 && s2.verdetto === 'NON TORNA',
     'C2) col punteggio dichiarato gonfiato di un gol il sigillo dice NON TORNA',
     s2 ? s2.verdetto + (s2.causa ? '/' + s2.causa : '') : 'nessun sigillo');
  riga.gol_a = (riga.gol_a | 0) - 1;

  /* C3 — UNO SCHERMO DIVERSO NON E' UN'ACCUSA.
     Misurato dalla voce #133: 800x360 contro 915x412 da' 0-3 dove il
     tabellone dice 3-4, e la rosa non c'entra niente. In produzione due
     telefoni con lo stesso schermo sono l'ECCEZIONE: senza questa
     distinzione la lista direbbe «non torna» a quasi tutti. */
  const D = await T.apri(browser, ss.portaGioco, { width: 800, height: 360 });
  let s3 = null, gi3 = null;
  try {
    await T.collega(D, ss.porta, 'DIFENSORI');
    await D.pag.evaluate(c => window.__test.rete.accettaTrasferimento(c), ss.codiceB);
    await D.pag.evaluate(async () => { await window.__test.sfida.aggiorna(); });
    await T.guardaUna(D, id);
    s3 = await sigilloDi(D, id);
    gi3 = await giudizioDi(D, crudo, [riga.gol_a | 0, riga.gol_d | 0], opz);
    const parole = await sigilliDipinti(D);
    di(!!s3 && s3.verdetto !== 'NON TORNA' && /schermo/.test(String(s3.causa)) &&
       !parole.some(p => /NON TORNA/.test(p)),
       'C3) guardata da uno schermo diverso: MAI NON TORNA, e la causa vera',
       (s3 ? s3.verdetto + '/' + s3.causa : 'nessun sigillo') + ' · in lista: ' + JSON.stringify(parole));
    di(!!s3 && !!gi3 && s3.verdetto === gi3.verdetto && (s3.causa || '') === (gi3.causa || ''),
       'C4b) e anche li\' il sigillo e\' quello di __test.giudica',
       'schermata ' + (s3 ? s3.verdetto + '/' + s3.causa : '—') +
       ' · giudice ' + (gi3 ? gi3.verdetto + '/' + gi3.causa : '—'));
  } finally { await D.ctx.close(); }

  /* C5 — L'AUTORITA' E' DEL SERVER. Chi difende e' parte in causa: il
     suo telefono puo' dire che cosa ha visto, non puo' sovrascrivere il
     verdetto del giudice differito, che una squadra in classifica non ce
     l'ha. */
  riga.verificata = 1;
  const parole5 = await B.pag.evaluate(async () => {
    await window.__test.sfida.aggiorna();
    return [...document.querySelectorAll('#sfLista .sfriga')].map(r => {
      const s = r.querySelector('.sfsig');
      return s ? s.textContent.trim() : '';
    });
  });
  const s5 = await sigilloDi(B, id);
  di(parole5.length >= 1 && parole5[0] === 'VERIFICATA' && !!s5 && s5.verdetto === 'NON TORNA',
     'C5) dove il server ha gia\' deciso, il sigillo locale non lo sovrascrive',
     'in lista «' + parole5[0] + '», in memoria ' + (s5 ? s5.verdetto : '—'));
}

/* ------------------------------------------------------------------ */
(async () => {
  try {
    await gruppoA();

    const T = require('./_sfida-due-telefoni.js');
    const N = require('./_nastri-bugiardi.js');
    const { chromium } = require('playwright');
    const prova = provaRel ? path.resolve(RADICE, provaRel) : '';
    if (prova && !fs.existsSync(prova)) { console.error('non trovo ' + prova); process.exit(3); }

    const g = await T.serviGioco(prova);
    const ss = await T.serviServer();
    const browser = await chromium.launch();
    const A = await T.apri(browser, g.porta);
    const B = await T.apri(browser, g.porta);
    try {
      await T.collega(A, ss.porta, 'ATTACCANTI');
      await T.collega(B, ss.porta, 'DIFENSORI');
      await T.entra(A); await T.pubblica(A);
      await T.entra(B); await T.pubblica(B);
      const idB = await B.pag.evaluate(() => window.__test.rete.mem().id);
      /* le maniglie che i gruppi B e C si passano fra loro */
      ss.browser = browser; ss.portaGioco = g.porta;
      ss.idA = await A.pag.evaluate(() => window.__test.rete.mem().id);
      ss.codiceB = await B.pag.evaluate(() => window.__test.rete.codiceTrasferimento());
      await gruppoB0(T, ss, B);
      await gruppoB(T, ss, B, idB);
      await gruppoC(T, N, ss, A, B, browser);
    } finally {
      await browser.close(); ss.chiudi(); g.chiudi();
    }

    console.log('\n' + (ok + no) + ' controlli, ' + ok + ' passati, ' + no + ' falliti');
    process.exit(no ? 1 : 0);
  } catch (e) {
    console.error('\nBANCO ESPLOSO: ' + (e && e.stack || e));
    process.exit(2);
  }
})();
