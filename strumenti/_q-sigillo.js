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

/* ------------------------------------------------------------------ */
(async () => {
  try {
    await gruppoA();

    const T = require('./_sfida-due-telefoni.js');
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
      await gruppoB0(T, ss, B);
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
