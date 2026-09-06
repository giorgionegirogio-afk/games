/* =====================================================================
   _q-proporzioni.js — IL CAMPO E' NELLA SCALA DEI CAMPI VERI? (voce #86,
   compito 1, primo compito del ramo voce-86-proporzioni).

   IL COMMITTENTE SCRIVE (6 settembre 2026): «le proporzioni tra
   giocatori, campo da calcio, linee del campo di gioco e dimensioni
   porte non sono corrette, ci sono le dimensioni ufficiali per un campo
   a 11, un campo a 7 e un campo a 5 giocatori». Questo banco misura
   esattamente quel reclamo: per ogni taglia, ogni elemento della vernice
   (cerchio, angolo, dArco, dischetto, area) e i corpi (giocatore,
   pallone) si confrontano con la misura ufficiale, passando per lo
   stesso METODO del committente — un rapporto unita'/metro ricavato
   dalla lunghezza del campo, poi lo scarto di ogni elemento da quel
   rapporto.

   QUESTO BANCO NASCE PER CONDANNARE. Il compito 1 e' un rinomino puro
   (la tavola VERNICI replica i valori di oggi al bit — vedi
   _t-tavola-vernice.js): il banco deve uscire ROSSO su questo stesso
   codice, sugli stessi identici numeri che il gioco disegnava PRIMA
   della tavola. Diventera' verde, riga per riga, mano a mano che i
   compiti 2-6 di questa voce portano i VALORI dentro VERNICI alle
   misure vere. Un banco che nascesse verde sarebbe un banco rotto: non
   avrebbe misurato niente, o misurerebbe la bugia con lo stesso
   righello che l'ha scritta.

   LA FONTE DI OGNI NUMERO UFFICIALE E' _analisi/MISURE-UFFICIALI.md
   (PARTE A, misure con fonte primaria), con UNA scelta del committente
   sopra quel documento: per la taglia 7 (che non ha un regolamento
   mondiale — ne' IFAB ne' FIFA lo fissano, vedi A3) il piano della voce
   #86 usa l'ancora UISP amatoriale adulto (60 m di lunghezza, dentro il
   44-65 UISP) invece della FIGC-SGS Pulcini che il documento raccomanda
   di default: CALCETTO non ha nessuna meccanica da "attivita' di base"
   (portieri, regole ridotte da 11, nessun fuorigioco disattivato), e i
   suoi tre tagli sono tre livelli dello stesso gioco adulto, non tre
   fasce d'eta'. Questa scelta e' gia' scritta nella "tavola dei
   bersagli" del piano (voce #86-compito-1-brief.md) e va copiata qui,
   non ridedotta: e' il committente che sceglie l'ancora, non il banco.

   METODO (lo stesso di MISURE-UFFICIALI.md PARTE C, e quindi dello
   stesso committente): rapporto_u_m = FW / lunghezza_reale_m (dichiarato
   per taglia, sotto); scarto = (valore_nel_gioco / rapporto_u_m) /
   ufficiale_m − 1. Scarto 0% = stessa scala del campo; negativo =
   l'elemento e' troppo PICCOLO, positivo = troppo GRANDE.
   Per il corpo del giocatore e del pallone (P_R, B_R) il confronto e'
   sul DIAMETRO (2*raggio), perche' la misura ufficiale (A4, A2) e' un
   diametro/larghezza, non un raggio — confermato incrociando i numeri
   del piano: 2*13/21,90 / 0,41 − 1 = +189,5%, esattamente il valore che
   la tavola dei bersagli dichiara per il giocatore a 11.

   SOGLIE (decise dal committente il 6 settembre 2026, vedi vincoli
   globali del piano): ±10% per la vernice (cerchio, angolo, dArco,
   dischetto, area — tutto cio' che vive dentro VERNICI); ±20% per
   GOAL_H (la porta); ±15% per FH a 11 (come larghezza reale del campo)
   e per i corpi P_R/B_R a 11.

   LE TRE CONVENZIONI DEL 7 (cerchio, angolo, dArco — nessuna fonte da'
   un numero per queste tre voci a 7, vedi A3 "non trovato"): non sono
   misure, sono una scelta dichiarata del piano, e si verificano per
   UGUAGLIANZA al valore convenuto, non per scarto percentuale — marcate
   "convenzione" nel nome della prova, e NON contano nel verdetto ±10%.

   NIENTE SEME. __test.proporzioni() legge TAGLIA/FW/FH/GOAL_H/GK_AREA_X/
   P_R/B_R/KICK_R/POST_R/SEP_R/P_SPEED/VERNICE: tutti valori che setTaglia
   fissa in modo deterministico dalla sola taglia scelta, mai da dado().
   startMatch chiama dado() una volta (G.kickTeam), ma quella scelta non
   tocca nessuno dei campi che questo banco legge — verificato leggendo
   setTaglia e proporzioni() prima di scrivere questo banco.

   uso:  node strumenti/_q-proporzioni.js
         node strumenti/_q-proporzioni.js --gioco fuori/dopo.html
   esce 0 se tutte le prove sono verdi, 1 se almeno una e' rossa,
   2 se il banco stesso e' esploso (o non trova __test.proporzioni).
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

/* =====================================================================
   LA TAVOLA DEI RIFERIMENTI — copiata dalla "tavola dei bersagli" del
   piano (voce #86, brief del compito 1), che a sua volta viene da
   _analisi/MISURE-UFFICIALI.md PARTE A. Ogni numero porta la sua fonte
   nel commento accanto, non nel nome della prova: il nome della prova
   resta leggibile, la fonte sta qui per chi deve controllare.
   ===================================================================== */

/* IL RAPPORTO UNITA'/METRO, per taglia — ancora dichiarata dal piano:
     5: campo FIFA futsal 40x20 m (FW 1150)              -> 1150/40
     7: ancora UISP 60 m di lunghezza (dentro il 44-65)  -> 1610/60
        (la larghezza implicita 784/26,83=29,2 m cade nel 25-40 UISP)
    11: campo IFAB "standard" 105x68 m (FW 2300)         -> 2300/105
   Sono TRE CIFRE DECISE DAL COMMITTENTE, non ricalcolate qui: il banco
   le userebbe comunque uguali se le ricalcolasse (1150/40=28,75 ecc.),
   ma scriverle come costanti e' piu' onesto — dice esplicitamente da
   dove viene il numero, invece di nasconderlo dentro una divisione. */
const RAPPORTO = { 5: 28.75, 7: 26.83, 11: 21.90 };

/* ELEMENTI DELLA VERNICE (tolleranza ±10%): campo dentro VERNICE, valore
   ufficiale in metri per taglia (null = non applicabile a quella taglia),
   fonte per taglia. */
const VERNICE_UFF = [
  { campo: 'cerchio', nome: 'cerchio di centrocampo (raggio)',
    uff: { 5: 3.00, 11: 9.15 },
    fonte: { 5: 'FIFA Futsal Laws/A2: raggio 3 m', 11: 'IFAB Regola 1/A1: raggio 9,15 m' } },
  { campo: 'angolo', nome: 'arco del calcio d\'angolo (raggio)',
    uff: { 5: 0.25, 11: 1.00 },
    fonte: { 5: 'FIFA Futsal Laws/A2: raggio 0,25 m', 11: 'IFAB Regola 1/A1: raggio 1 m' } },
  { campo: 'dArco', nome: 'arco dell\'area, la "D" (raggio dal dischetto)',
    /* a 5 NIENTE: il futsal non ha la "D" (l'area e' un quarto di
       cerchio raggio 6 m da ogni palo, non una mezzaluna sul dischetto:
       geometria diversa, non misurabile con questo stesso elemento) */
    uff: { 11: 9.15 },
    fonte: { 11: 'IFAB Regola 1/A1: raggio 9,15 m dal dischetto' } },
  { campo: 'dischetto', nome: 'dischetto del rigore (distanza dalla porta)',
    uff: { 5: 6.00, 7: 8.00, 11: 11.00 },
    fonte: { 5: 'FIFA Futsal Laws/A2: 6 m', 7: 'UISP/A3: 8 m dalla linea di porta', 11: 'IFAB Regola 1/A1: 11 m dal centro della porta' } },
  { campo: 'areaProf', nome: 'area di rigore (profondita\')',
    uff: { 5: 6.00, 7: 10.00, 11: 16.50 },
    fonte: { 5: 'FIFA Futsal Laws/A2: profondita\' risultante ~6 m', 7: 'UISP/A3: profondita\' ~10 m', 11: 'IFAB Regola 1/A1: profondita\' 16,5 m' } },
];

/* LE TRE CONVENZIONI DEL 7 — uguaglianza, non scarto (A3: "non trovato"
   per cerchio/angolo/D a 7; il piano sceglie una convenzione dichiarata:
   cerchio e D alla stessa frazione di larghezza del campo dell'11
   (9,15/68=13,46% di 784=106), angolo al valore famiglia-11 (1 m in
   unita' della taglia 7: 1,00*26,83=26,83 -> 27). */
const CONVENZIONI_7 = [
  { campo: 'cerchio', nome: 'cerchio di centrocampo', atteso: 106 },
  { campo: 'angolo', nome: 'arco d\'angolo', atteso: 27 },
  { campo: 'dArco', nome: 'arco della "D"', atteso: 106 },
];

/* LA PORTA (tolleranza ±20%, non e' un campo di VERNICE ma di TAGLIE) */
const GOAL_UFF = { 5: 3.00, 7: 5.50, 11: 7.32 };
const GOAL_FONTE = {
  5: 'FIFA Futsal Laws/A2: porta 3x2 m',
  7: 'UISP/A3: porta 5-6 m, centro 5,5 m',
  11: 'IFAB Regola 1/A1: porta 7,32x2,44 m',
};

/* FH A 11 COME LARGHEZZA REALE DEL CAMPO (tolleranza ±15%, solo a 11:
   a 5 e 7 il piano dichiara FH "invariato", nessun bersaglio) */
const FH11_UFF = 68.0;   // IFAB Regola 1/A1: campo standard 105x68 m

/* I CORPI A 11 (tolleranza ±15%, confronto sul DIAMETRO — vedi il
   commento di metodo in testa al file) */
const P_R_DIAM_UFF = 0.41;   // A4: larghezza spalle (proxy), arrotondata
const B_R_DIAM_UFF = 0.22;   // A2: pallone, diametro fisico

const TOLL_VERNICE = 0.10, TOLL_GOAL = 0.20, TOLL_CORPO = 0.15;
const scarto = (valoreUnita, rapporto, ufficialeM) => (valoreUnita / rapporto) / ufficialeM - 1;
const pct = x => (x * 100).toFixed(1) + '%';

(async () => {
  const provaRel = arg('gioco', '');
  const provaAbs = provaRel ? path.resolve(RADICE, provaRel) : '';
  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const ecc = []; pag.on('pageerror', e => ecc.push(e.message));
  console.log('\n=== IL CAMPO E\' NELLA SCALA DEI CAMPI VERI? ===  ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)'));
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  if (!(await pag.evaluate(() => typeof window.__test.proporzioni === 'function'))) {
    console.log('BANCO: __test.proporzioni() non esiste — l\'attrezzo _t-tavola-vernice.js non e\' applicato.');
    await browser.close(); srv.chiudi(); process.exit(2);
  }
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });

  /* PER OGNI TAGLIA: si entra in partita a quella taglia (la via di
     _crit10: startMatch(1,1,{size:n})) e si legge SUBITO __test.proporzioni().
     Non serve simulare fotogrammi: setTaglia scrive TUTTI questi valori in
     modo sincrono, dentro startMatch, prima che un solo fotogramma giri. */
  const prop = {};
  for (const taglia of [5, 7, 11]) {
    const r = await pag.evaluate((n) => {
      const t = window.__test;
      t.startMatch(1, 1, { size: n });
      return t.proporzioni();
    }, taglia);
    if (!r || r.TAGLIA !== taglia) { console.log('BANCO: startMatch({size:' + taglia + '}) non ha portato la taglia attesa'); await browser.close(); srv.chiudi(); process.exit(2); }
    prop[taglia] = r;
  }
  if (ecc.length) { console.log('BANCO: eccezione di pagina — ' + ecc[0]); await browser.close(); srv.chiudi(); process.exit(2); }

  /* ---- gli elementi della vernice, tolleranza ±10% ---- */
  for (const taglia of [5, 7, 11]) {
    const p = prop[taglia], rapp = RAPPORTO[taglia];
    for (const el of VERNICE_UFF) {
      const uff = el.uff[taglia];
      if (uff == null) continue;   // non applicabile a questa taglia (NIENTE, o non misurato)
      const v = p.VERNICE[el.campo];
      const sc = scarto(v, rapp, uff);
      di(Math.abs(sc) <= TOLL_VERNICE, el.nome + ' a ' + taglia + '  (fonte: ' + el.fonte[taglia] + ')',
        v + 'u / ' + rapp + 'u/m = ' + (v / rapp).toFixed(2) + 'm contro ' + uff.toFixed(2) + 'm ufficiali, scarto ' + pct(sc) + ' (tetto ±10%)');
    }
  }

  /* ---- la porta (GOAL_H), tolleranza ±20% ---- */
  for (const taglia of [5, 7, 11]) {
    const p = prop[taglia], rapp = RAPPORTO[taglia];
    const uff = GOAL_UFF[taglia];
    const sc = scarto(p.GOAL_H, rapp, uff);
    di(Math.abs(sc) <= TOLL_GOAL, 'porta, luce (GOAL_H) a ' + taglia + '  (fonte: ' + GOAL_FONTE[taglia] + ')',
      p.GOAL_H + 'u / ' + rapp + 'u/m = ' + (p.GOAL_H / rapp).toFixed(2) + 'm contro ' + uff.toFixed(2) + 'm ufficiali, scarto ' + pct(sc) + ' (tetto ±20%)');
  }

  /* ---- le tre convenzioni del 7: uguaglianza, non scarto ---- */
  for (const c of CONVENZIONI_7) {
    const v = prop[7].VERNICE[c.campo];
    di(v === c.atteso, 'convenzione — ' + c.nome + ' a 7 (valore convenuto ' + c.atteso + ', nessuna fonte non lo misura)',
      'oggi VERNICE.' + c.campo + '=' + v + (v === c.atteso ? '' : ', atteso ' + c.atteso));
  }

  /* ---- area disegnata = area applicata: stessa costante, letta dallo
     stesso proporzioni(), su ogni taglia (il compito 2 la rende
     STRUTTURALMENTE una sola variabile; oggi le due formule esistono
     ancora separate e possono coincidere solo per coincidenza numerica) ---- */
  for (const taglia of [5, 7, 11]) {
    const p = prop[taglia];
    di(p.VERNICE.areaProf === p.GK_AREA_X, 'area disegnata = area applicata a ' + taglia,
      'VERNICE.areaProf=' + p.VERNICE.areaProf + '  GK_AREA_X=' + p.GK_AREA_X);
  }

  /* ---- area di porta presente a 11 (SOLO 11: a 5/7 non e' un elemento
     del campo reale, vedi la tavola dei bersagli — "-") ---- */
  {
    const v = prop[11].VERNICE;
    di(v.portaProf > 0 && v.portaLargh > 0, 'area di porta presente a 11 (fonte: IFAB Regola 1/A1: 5,5x5,5 m)',
      'portaProf=' + v.portaProf + ' portaLargh=' + v.portaLargh);
  }

  /* ---- FH a 11 come larghezza reale del campo, tolleranza ±15% ---- */
  {
    const p = prop[11], rapp = RAPPORTO[11];
    const sc = scarto(p.FH, rapp, FH11_UFF);
    di(Math.abs(sc) <= TOLL_CORPO, 'FH a 11 come larghezza reale del campo  (fonte: IFAB Regola 1/A1: 105x68 m)',
      p.FH + 'u / ' + rapp + 'u/m = ' + (p.FH / rapp).toFixed(2) + 'm contro ' + FH11_UFF.toFixed(2) + 'm ufficiali, scarto ' + pct(sc) + ' (tetto ±15%)');
  }

  /* ---- i corpi a 11, tolleranza ±15%, confronto sul DIAMETRO ---- */
  {
    const p = prop[11], rapp = RAPPORTO[11];
    const scP = scarto(2 * p.P_R, rapp, P_R_DIAM_UFF);
    di(Math.abs(scP) <= TOLL_CORPO, 'corpo del giocatore (diametro) a 11  (fonte: A4, larghezza spalle proxy 0,41 m)',
      (2 * p.P_R) + 'u / ' + rapp + 'u/m = ' + (2 * p.P_R / rapp).toFixed(2) + 'm contro ' + P_R_DIAM_UFF.toFixed(2) + 'm ufficiali, scarto ' + pct(scP) + ' (tetto ±15%)');
    const scB = scarto(2 * p.B_R, rapp, B_R_DIAM_UFF);
    di(Math.abs(scB) <= TOLL_CORPO, 'corpo del pallone (diametro) a 11  (fonte: A2, pallone 0,22 m)',
      (2 * p.B_R) + 'u / ' + rapp + 'u/m = ' + (2 * p.B_R / rapp).toFixed(2) + 'm contro ' + B_R_DIAM_UFF.toFixed(2) + 'm ufficiali, scarto ' + pct(scB) + ' (tetto ±15%)');
  }

  await ctx.close(); await browser.close(); srv.chiudi();
  const rossi = esiti.filter(v => !v).length;
  console.log('\n' + (esiti.length - rossi) + ' prove su ' + esiti.length + ' — ' + (rossi ? 'CANCELLO ROSSO' : 'CANCELLO VERDE'));
  process.exit(rossi ? 1 : 0);
})().catch(e => { console.error('FALLITO: ' + e.message); process.exit(2); });
