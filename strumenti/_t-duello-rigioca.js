/* =====================================================================
   _t-duello-rigioca.js — LA SERIE INTERA SI RIGIOCA, ESITO PER ESITO
   (voce #131, compito 5). Nasce ROSSO.

   _t-duello-nastro.js chiede la domanda grossa («si rigioca?»). Questo
   file chiede le tre domande che restano quando la risposta e' si', e
   sono quelle da cui dipende se un giudice puo' fidarsi.

     A) UNA SERIE INTERA, ESITO PER ESITO. Non il punteggio finale: ogni
        singolo rigore, col suo cursore a cinque decimali, il suo powerQ,
        il terzo scelto e il terzo del portiere. Il punteggio finale puo'
        tornare per caso — due errori che si compensano — il cursore no.
     B) IL NASTRO TRONCATO SI FERMA CON CAUSA VERA. Si tolgono a mano le
        righe di un duello COL TIRATORE UMANO (non uno qualunque: vedi
        troncaDuelloDelTiratore) e si verifica che il gioco lo SAPPIA —
        Reg.righeDuello risponde di no, che e' la condizione che arma
        fermaReplayAlDischetto — e che non inventi un esito. E' la prova
        che il ripiego e' stato conservato e riarmato, non cancellato.
     C) I MUTANTI. _crit-duello-scarto.js rimette in scena il solo
        stopPower un aggiornamento piu' tardi: DEVE far divergere la
        riproduzione, su ogni seme. _crit-duello-passo.js sposta il
        gancio intero: MISURATO, il gioco lo sopravvive, e il perche' sta
        scritto accanto alla misura — non si spaccia per letale un falso
        che non lo e'.

   PERCHE' C1) E' LA PROVA PIU' IMPORTANTE DEL CANTIERE. Registrazione e
   riproduzione sono la stessa riga di codice: un banco che confronta una
   cosa con se stessa dice sempre di si'. Il mutante e' l'unico modo di
   sapere se il banco guarda davvero.

   QUESTO BANCO NON COPRE LA QUANTIZZAZIONE DELLA MIRA (dichiarato, 21
   settembre 2026, voce #131, correzione di revisione): il COPIONE qui
   sotto porta u,v gia' a TRE decimali, quindi la quantizzazione a un
   millesimo del compito 3 (duelMira) e' invisibile a questo banco — la
   copre strumenti/_t-duello-tacca.js.

   uso:  node strumenti/_t-duello-rigioca.js
   esce 0 verde, 1 rosso, 2 banco esploso.
   ===================================================================== */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');
const { semeFisso } = require('./_posa.js');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const GIOCO = arg('gioco', process.env.GIOCO_PROVA || 'CALCETTO-il-gioco.html');
/* =====================================================================
   I DUE FALSI, e perche' sono due.

   `scarto` e' quello LETALE: rimette in scena il solo stopPower un
   aggiornamento dopo gli altri. E' il caso che il dossier #131 aveva
   misurato («spostare stopPower di 1 aggiornamento cambia 6/132
   esiti»). Il banco DEVE bocciarlo.

   `passo` e' quello UNIFORME: sposta il gancio Reg.passoDuello() dopo il
   corpo di Duel.update, cosi' TUTTI i comandi arrivano un aggiornamento
   piu' tardi. Il dossier lo dava per letale; MISURATO qui, non lo e', e
   la ragione e' una proprieta' vera del duello: pickZone azzera il
   cursore, quindi il cursore che stopPower legge dipende solo da QUANTI
   aggiornamenti stanno FRA i due comandi, e uno spostamento uniforme
   quell'intervallo lo conserva. Non si tiene come cancello (sarebbe un
   verde che dichiara letale cio' che non lo e'): si tiene come MISURA
   dichiarata, e si verifica che il mutante sia davvero applicato —
   il suo nastro deve differire da quello del gioco sano — se no il
   giorno che l'attrezzo smettesse di mordere nessuno se ne accorgerebbe.
   ===================================================================== */
const MUTANTI = [
  { nome: 'scarto', letale: true, script: '_crit-duello-scarto.js', file: 'fuori/crit-duello-scarto.html',
    che: 'il solo stopPower un aggiornamento piu\' tardi' },
  { nome: 'passo', letale: false, script: '_crit-duello-passo.js', file: 'fuori/crit-duello-passo.html',
    che: 'il gancio dopo il corpo: TUTTI i comandi un aggiornamento piu\' tardi' },
];
const TAGLIA = 5, MAXF = 24000;
/* tre semi: una sola serie puo' finire in quattro rigori, e quattro non
   bastano a smascherare uno scarto che si vede nel 5% dei casi */
const SEMI = [20260921, 20260922, 20260923];

const COPIONE = {
  passoZone: 30, passoPower: 45, attesaKeeper: 15,
  mire: [
    { z: 0, u: -0.731, v: 0.343 }, { z: 2, u: 0.810, v: 0.629 },
    { z: 1, u: 0.112, v: 0.487 }, { z: 2, u: 1.046, v: 0.251 },
    { z: 0, u: -1.119, v: 0.714 }, { z: 1, u: -0.294, v: 0.551 },
  ],
  tuffi: [1, 0, 2, 2, 1, 0],
};

function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

function unGiro({ seme, taglia, maxf, cop, copione, nastro }) {
  const t = window.__test;
  t.fermaRegistro && t.fermaRegistro();
  for (const k of Object.keys(t.save)) if (!(k in window.__save0)) delete t.save[k];
  for (const k in window.__save0) t.save[k] = JSON.parse(JSON.stringify(window.__save0[k]));
  if (typeof Reg !== 'undefined') Reg.azzeraComandi();

  if (nastro) t.rigioca(nastro); else t.registra();
  t.semina(seme);
  t.startMatch(1, 1, { size: taglia, sponde: 'gabbia', miraGuidata: 'pieno' });
  t.rigori();

  const duelli = [];
  const haRighe = [];
  let toccate = 0;
  let nD = 1, passo = 0, fasePrec = Duel.phase, faseCorr = Duel.phase, passoFase = 0;
  let fattoZone = false, fattoPower = false, fattoKeeper = false, vistoRes = false;
  let f = 0;
  for (; f < maxf && t.state !== 'end'; f++) {
    t.simulate(1 / 60);
    const ph = Duel.phase;
    const nuovo = (ph === 'zone' && fasePrec !== 'zone');
    fasePrec = ph;
    if (nuovo) {
      nD++; passo = 0; faseCorr = ph; passoFase = 0;
      fattoZone = fattoPower = fattoKeeper = vistoRes = false;
      /* LA DOMANDA CHE ARMA IL RIPIEGO, letta nell'istante esatto in cui
         il gioco vero la fa: il duello si e' appena aperto e non ha
         ancora consumato nessuna riga. */
      if (nastro && typeof Reg !== 'undefined' && Reg.righeDuello)
        haRighe.push([Duel.nDuello, !!Reg.righeDuello(Duel.nDuello),
                      !!Duel.shooterHuman, !!Duel.keeperHuman]);
      continue;
    }
    if (ph === 'off') continue;
    passo++;
    if (ph !== faseCorr) { faseCorr = ph; passoFase = passo; }
    if (cop) {
      const m = copione.mire[(nD - 1) % copione.mire.length];
      if (!fattoZone && ph === 'zone' && Duel.shooterHuman && passo >= copione.passoZone) {
        fattoZone = true; toccate++; Duel.pickZone(m.z, m.u, m.v);
      } else if (!fattoPower && Duel.phase === 'power' && Duel.shooterHuman && passo >= copione.passoPower) {
        fattoPower = true; toccate++; Duel.stopPower();
      } else if (!fattoKeeper && Duel.phase === 'wait' && Duel.keeperHuman && Duel.keeperZone < 0 &&
                 (passo - passoFase) >= copione.attesaKeeper) {
        fattoKeeper = true; toccate++; Duel.pickKeeper(copione.tuffi[(nD - 1) % copione.tuffi.length]);
      }
    }
    if (Duel.phase === 'result' && !vistoRes) {
      vistoRes = true;
      duelli.push({
        n: nD, passo, esito: Duel.outcome,
        cursor: +Duel.cursor.toFixed(5), powerQ: +Duel.powerQ.toFixed(5),
        z: Duel.zone, kz: Duel.keeperZone, mirato: !!Duel.mirato,
        aimU: +Duel.aimU.toFixed(5), aimV: +Duel.aimV.toFixed(5),
      });
    }
  }
  const out = {
    duelli, toccate, fotogrammi: f, stato: t.state,
    punteggio: [G.score[0], G.score[1]], sorteggi: t.sorteggi,
    appeso: (Duel.phase !== 'off' && t.state !== 'end'), fase: Duel.phase,
    haRighe, nDuelloFine: (typeof Duel.nDuello === 'number' ? Duel.nDuello : -1),
  };
  if (!nastro) { out.nastro = t.nastro(); }
  t.fermaRegistro();
  return out;
}

/* =====================================================================
   IL TRONCAMENTO si fa sul TESTO del nastro, che e' cio' che viaggia
   davvero.

   E SI TOGLIE UN DUELLO COL TIRATORE UMANO, non uno qualunque: e' una
   correzione pagata con una prova che passava per il motivo sbagliato.
   Togliere le righe di un duello in cui l'umano era solo il PORTIERE non
   lo blocca affatto — Duel.update ha il ripiego a cpuT=3,0 e tuffa da
   solo dopo tre secondi, quindi il duello si risolve lo stesso (male, ma
   si risolve) e la partita arriva in fondo. Il caso in cui davvero non
   arriva nessuno a decidere e' il TIRATORE umano: senza pickZone la fase
   'zone' non finisce, perche' li' il motore non ha nessun ripiego.
   Si riconosce dal verbo 0 fra le righe di quel duello.
   ===================================================================== */
function troncaDuelloDelTiratore(testo) {
  const p = String(testo).split('|');
  const iP = p.length >= 4 ? 3 : 2;
  const pezzi = (p[iP] || '').split(';').filter(Boolean);
  const perDuello = new Map();
  for (const pz of pezzi) {
    const v = pz.split(',').map(Number);
    if (v[1] !== 6) continue;
    if (!perDuello.has(v[3])) perDuello.set(v[3], []);
    perDuello.get(v[3]).push(v);
  }
  /* l'ULTIMO duello che ha un verbo 0 (la mira: c'era un tiratore umano) */
  let scelto = -1;
  for (const [n, righe] of perDuello) if (righe.some(v => v[5] === 0) && n > scelto) scelto = n;
  if (scelto < 0) return null;
  const tenuti = pezzi.filter(pz => {
    const v = pz.split(',').map(Number);
    return !(v[1] === 6 && v[3] === scelto);
  });
  p[iP] = tenuti.join(';');
  return { testo: p.join('|'), nDuelloTolto: scelto, tolte: pezzi.length - tenuti.length };
}

const esiti = [];
const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '\n         ' + det : '')); };

/* =====================================================================
   IL CAMPO `passo` NON SI CONFRONTA, E VA SPIEGATO INVECE CHE NASCOSTO.

   `passo` qui e' il fotogramma in cui QUESTO BANCO ha visto il duello
   entrare in fase 'result'. Dal vivo il dito cade FRA due aggiornamenti:
   il banco chiama stopPower dopo simulate(), quindi la risoluzione
   avviene alla fine del fotogramma k e il banco la vede subito, al
   fotogramma k. In rilettura lo stesso comando parte all'INIZIO
   dell'aggiornamento k+1 — che e' l'unico istante in cui il cursore vale
   ancora esattamente k passi, ed e' tutto il punto della cura — quindi
   il banco la vede al fotogramma k+1.

   E' uno sfasamento dell'OSSERVATORE, non del gioco, e la prova che lo
   e' sta accanto: il CURSORE, il powerQ, i due terzi, il punto di mira e
   l'esito devono coincidere alla cifra. Se lo sfasamento fosse del gioco,
   il cursore sarebbe diverso di 0,01917 — che e' esattamente cio' che il
   mutante fa vedere.

   Lo scarto ammesso e' quindi 0 o +1, e il banco lo STAMPA: se un giorno
   diventasse -1 o +2, vorrebbe dire un'altra cosa e va vista.
   ===================================================================== */
const CAMPI_SFASABILI = ['passo'];

function scartiDuello(a, b) {
  const fuori = [];
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++)
    for (const k of Object.keys(a[i]))
      if (a[i][k] !== b[i][k] && !CAMPI_SFASABILI.includes(k))
        fuori.push('duello ' + (i + 1) + ', campo ' + k + ': ' + a[i][k] + ' -> ' + b[i][k]);
  if (a.length !== b.length)
    fuori.push('la serie ha ' + a.length + ' duelli registrati e ' + b.length + ' rigiocati');
  return fuori;
}

function sfasamenti(a, b) {
  const s = [];
  for (let i = 0; i < Math.min(a.length, b.length); i++) s.push(b[i].passo - a[i].passo);
  return s;
}

function primoScarto(a, b) {
  const f = scartiDuello(a, b);
  return f.length ? f[0] : null;
}

(async () => {
  const srv = await servi();
  let browser, apri, risultati = [], tronco = null;
  try {
    browser = await chromium.launch();
    apri = async (file, seme) => {
      const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
      const pag = await ctx.newPage();
      await pag.addInitScript(semeFisso, seme);
      const ecc = []; pag.on('pageerror', e => ecc.push(e.message));
      await pag.goto(`http://127.0.0.1:${srv.porta}/${file}`, { waitUntil: 'load' });
      await pag.waitForFunction('window.__test !== undefined', null, { timeout: 30000 });
      await pag.evaluate(() => {
        const t = window.__test;
        t.dismissSplash && t.dismissSplash();
        if (t.save) t.save.tutorialDone = 1;
        window.__save0 = JSON.parse(JSON.stringify(t.save));
      });
      return { ctx, pag, ecc };
    };
    const gira = (P, p) => P.pag.evaluate(new Function('p', 'return (' + unGiro.toString() + ')(p)'), p);

    console.log('=== LA SERIE SI RIGIOCA, ESITO PER ESITO (voce #131, compito 5) ===');
    console.log('    gioco ' + GIOCO + ', taglia ' + TAGLIA + ', semi ' + SEMI.join('/'));

    /* A) le tre serie, registrate e rigiocate */
    for (const seme of SEMI) {
      const base = { seme, taglia: TAGLIA, maxf: MAXF, copione: COPIONE };
      const A = await apri(GIOCO, seme);
      const reg = await gira(A, { ...base, cop: true, nastro: null });
      const B = await apri(GIOCO, seme);
      const rip = await gira(B, { ...base, cop: false, nastro: reg.nastro });
      if (A.ecc.length || B.ecc.length) throw new Error('eccezione di pagina: ' + (A.ecc[0] || B.ecc[0]));
      risultati.push({ seme, reg, rip });
      await A.ctx.close(); await B.ctx.close();
    }

    /* B) il nastro troncato */
    const campione = risultati.find(r => r.reg.duelli.length >= 2) || risultati[0];
    const tr = troncaDuelloDelTiratore(campione.reg.nastro);
    if (tr) {
      const C = await apri(GIOCO, campione.seme);
      const r = await gira(C, { seme: campione.seme, taglia: TAGLIA, maxf: 3000, copione: COPIONE, cop: false, nastro: tr.testo });
      tronco = { ...tr, ...r, seme: campione.seme };
      await C.ctx.close();
    }

    /* C) i due mutanti, su tutti i semi */
    for (const m of MUTANTI) {
      try {
        m.costruito = execFileSync(process.execPath,
          [path.join(RADICE, 'strumenti', m.script), '--out', m.file],
          { cwd: RADICE, encoding: 'utf8' });
      } catch (e) {
        m.costruito = 'FALLITO: ' + (e.stdout || '') + (e.stderr || '') + (e.message || '');
      }
      if (!fs.existsSync(path.join(RADICE, m.file))) continue;
      m.giri = [];
      for (const seme of SEMI) {
        const base = { seme, taglia: TAGLIA, maxf: MAXF, copione: COPIONE };
        const A = await apri(m.file, seme);
        const reg = await gira(A, { ...base, cop: true, nastro: null });
        const B = await apri(m.file, seme);
        const rip = await gira(B, { ...base, cop: false, nastro: reg.nastro });
        m.giri.push({ seme, reg, rip });
        await A.ctx.close(); await B.ctx.close();
      }
    }
  } catch (e) {
    console.error('FALLITO (banco): ' + e.message);
    if (browser) await browser.close();
    srv.chiudi(); process.exit(2);
  }
  await browser.close(); srv.chiudi();

  /* ---------------------------------------------------------- A) */
  let totDuelli = 0, totToccate = 0, scarti = [], tuttiSfas = [];
  for (const { seme, reg, rip } of risultati) {
    totDuelli += reg.duelli.length; totToccate += reg.toccate;
    const s = primoScarto(reg.duelli, rip.duelli);
    const sf = sfasamenti(reg.duelli, rip.duelli);
    tuttiSfas = tuttiSfas.concat(sf);
    const ok = s === null && !rip.appeso && reg.punteggio.join() === rip.punteggio.join();
    console.log('    seme ' + seme + ': registrato [' + reg.duelli.map(d => d.esito[0]).join('') + '] ' +
      reg.punteggio.join('-') + '   rigiocato [' + rip.duelli.map(d => d.esito[0]).join('') + '] ' +
      rip.punteggio.join('-') + '   sfasamento osservatore ' + sf.join(',') +
      (rip.appeso ? '  APPESO in \'' + rip.fase + '\'' : '') + (ok ? '' : '   <<<'));
    if (!ok) scarti.push('seme ' + seme + ': ' + (rip.appeso ? 'appeso in \'' + rip.fase + '\'' : (s || 'punteggio diverso')));
  }
  di(totDuelli >= 6 && totToccate >= 10,
    'CONTROLLO) c\'e\' materiale da rigiocare',
    totDuelli + ' duelli e ' + totToccate + ' decisioni umane su ' + SEMI.length + ' serie');
  di(scarti.length === 0,
    'A) la serie intera si rigioca esito per esito, cursore compreso (cinque decimali)',
    scarti.length === 0 ? totDuelli + ' duelli identici campo per campo (esito, cursore, powerQ, terzi, mira)'
                        : scarti.slice(0, 3).join('  |  '));
  di(tuttiSfas.every(v => v === 0 || v === 1),
    'A bis) lo sfasamento dell\'osservatore e\' 0 o +1 fotogramma, come deve essere',
    'sfasamenti osservati: ' + [...new Set(tuttiSfas)].sort().join(', ') +
    ' — dal vivo il dito cade FRA due aggiornamenti, in rilettura il comando parte all\'inizio del successivo;' +
    ' il cursore, che e\' il numero che conta, coincide alla cifra');

  /* ---------------------------------------------------------- B) */
  const intero = risultati.find(r => r.rip.haRighe && r.rip.haRighe.length);
  if (!tronco || !intero) {
    di(false, 'B) il nastro troncato si ferma con causa vera',
      'nessuna riga di tipo 6 da togliere, o Reg.righeDuello non esiste: la cura non c\'e\' ancora');
  } else {
    /* B1 — su un nastro INTERO, la domanda che arma il ripiego risponde
       sempre di si' per i duelli con un umano dentro. Senza questa meta',
       un «no» sul nastro troncato non proverebbe niente: potrebbe
       rispondere no sempre. */
    const conUmano = intero.rip.haRighe.filter(h => h[2] || h[3]);
    di(conUmano.length > 0 && conUmano.every(h => h[1]),
      'B1) su un nastro intero, il nastro ha righe per OGNI duello con un umano dentro',
      conUmano.filter(h => h[1]).length + ' su ' + conUmano.length + ' duelli con umano hanno righe' +
      ' (seme ' + intero.seme + ')');

    /* B2 — tolte le righe del duello col TIRATORE umano, il gioco lo sa
       (righeDuello dice no: e' la condizione che arma
       fermaReplayAlDischetto) e non si inventa un esito. */
    const h = (tronco.haRighe || []).find(x => x[0] === tronco.nDuelloTolto);
    const sa = !!h && h[1] === false;
    const nonInventa = tronco.duelli.length < tronco.nDuelloTolto;
    di(sa && nonInventa,
      'B2) tolte le righe di un duello col tiratore umano, il gioco lo SA e non inventa un esito',
      'tolte ' + tronco.tolte + ' righe del duello ' + tronco.nDuelloTolto + ' (seme ' + tronco.seme + '): ' +
      (h ? 'Reg.righeDuello(' + h[0] + ')=' + h[1] + (h[1] ? ' — NON se ne accorge' : ' — e\' la condizione che arma il ripiego') : 'quel duello non si e\' mai aperto') +
      ', ' + tronco.duelli.length + ' duelli risolti su ' + tronco.nDuelloTolto + ' attesi, ' +
      (tronco.appeso ? 'poi fermo in \'' + tronco.fase + '\': in una sfida vera qui scatta fermaReplayAlDischetto'
                     : 'stato \'' + tronco.stato + '\''));
  }

  /* ---------------------------------------------------------- C) */
  const M = {};
  for (const m of MUTANTI) {
    if (!m.giri) { M[m.nome] = null; continue; }
    const fuori = [];
    for (const g of m.giri) {
      const s = primoScarto(g.reg.duelli, g.rip.duelli);
      if (s !== null || g.rip.appeso || g.reg.punteggio.join() !== g.rip.punteggio.join())
        fuori.push('seme ' + g.seme + ': ' + (g.rip.appeso ? 'appeso' : (s || 'punteggio diverso')));
    }
    M[m.nome] = { divergenti: fuori, giri: m.giri.length, costruito: m.costruito };
  }

  /* C1 — il falso LETALE deve cadere */
  const L = M['scarto'], mL = MUTANTI.find(m => m.nome === 'scarto');
  if (!L) {
    di(false, 'C1) IL MUTANTE LETALE E\' BOCCIATO (il banco discrimina)',
      'non e\' stato costruito:\n         ' + String(mL.costruito).trim().split('\n').join('\n         '));
  } else {
    di(L.divergenti.length === L.giri,
      'C1) IL MUTANTE LETALE E\' BOCCIATO su ogni seme — ' + mL.che,
      L.divergenti.length === L.giri
        ? L.giri + ' semi su ' + L.giri + ' divergono: ' + L.divergenti[0] +
          ' — il banco discrimina un solo aggiornamento, quindi il verde di A) vuol dire qualcosa'
        : L.divergenti.length + ' semi su ' + L.giri + ' divergono: sugli altri IL MUTANTE PASSA,' +
          ' e in quei casi il banco attesta invece di misurare');
  }

  /* C2 — il falso UNIFORME: si misura e si dichiara, non si finge letale */
  const U = M['passo'], mU = MUTANTI.find(m => m.nome === 'passo');
  if (!U) {
    di(false, 'C2) il mutante uniforme e\' costruito (l\'attrezzo morde ancora)',
      'non e\' stato costruito:\n         ' + String(mU.costruito).trim().split('\n').join('\n         '));
  } else {
    /* che sia davvero applicato lo dice il nastro: nel mutante uniforme
       il conto dei passi slitta, quindi il testo registrato NON puo'
       essere identico a quello del gioco sano */
    const sanoN = risultati.map(r => r.reg.nastro).join('#');
    const mutN = mU.giri.map(g => g.reg.nastro).join('#');
    di(sanoN !== mutN,
      'C2) il mutante uniforme e\' davvero applicato (il suo nastro non e\' quello del gioco sano)',
      sanoN !== mutN ? 'i nastri differiscono: il gancio e\' spostato davvero'
                     : 'NASTRI IDENTICI: l\'attrezzo non morde piu\', e la misura qui sotto non vale niente');
    console.log('  --  MISURA DICHIARATA: il mutante uniforme (' + mU.che + ')');
    console.log('      diverge su ' + U.divergenti.length + ' semi su ' + U.giri + '.' +
      (U.divergenti.length === 0
        ? ' Il gioco lo SOPRAVVIVE, e non e\' un buco del banco:\n' +
          '      pickZone azzera il cursore, quindi il cursore che stopPower legge dipende solo\n' +
          '      dall\'INTERVALLO fra i due comandi, e uno spostamento uniforme lo conserva.\n' +
          '      Rettifica al dossier #131, che lo dava per letale.'
        : ' ' + U.divergenti[0]));
  }

  const rossi = esiti.filter(v => !v).length;
  console.log('\n' + (esiti.length - rossi) + ' prove su ' + esiti.length + ' — ' +
    (rossi ? 'ROSSO' : 'VERDE: la serie si rigioca, e il banco sa distinguere un fotogramma'));
  process.exit(rossi ? 1 : 0);
})();
