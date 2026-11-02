/* =====================================================================
   _t-159-portiere-anticipo.js -- IL PORTIERE NON SI PREPARA (voce #159,
   P2 e P3: voci #7/#9 e #8 dell'elenco del realismo del 24/9).

   IL DIFETTO, LETTO SUL CODICE. In updateKeeper il tuffo si arma SOLO
   su un pallone a piu' di 300 unita' al secondo («if(sp>300 &&
   versoPorta && b.owner<0 ...)»). Sotto quella velocita' -- filtranti
   lente, rimpalli, respinte che ricadono in area, palloni fermi -- il
   portiere passa al solo posizionamento, che e' una retta verso il
   centro porta («ty = FH/2 + dy*0.55») con un'uscita che CRESCE con la
   distanza del pallone («uscita = clamp(dl*0.10, 16, ...)», cioe' 16
   unita' dalla linea quando il pallone e' vicino e 80 quando e'
   lontano: inversa al pericolo). Un pallone libero e lento in area
   resta li' finche' non arriva un uomo di movimento: il portiere lo
   guarda da 16 unita'. E lateralmente non va mai oltre 30 unita' dal
   palo («p.y=clamp(p.y, GY0-30, GY1+30)»), mentre il tuffo si concede
   46: alla fine di un tuffo largo il corpo salta di 16 unita' in un
   fotogramma per rientrare nel margine stretto.

   LE SCENE. Tutti gli uomini di movimento delle due squadre vengono
   parcheggiati a piu' di quattro quinti di campo dalla porta in esame
   (a 200 unita' al secondo servono quattro secondi per tornare: le
   scene durano meno), il portiere viene messo in posizione d'attesa
   (16 unita' dalla linea, al centro) e il pallone LIBERO viene posato
   con una velocita' e una direzione dichiarate -- lastTouch e
   toccoPiede azzerati (lezione 21), passTo/crossTo/tiroT spenti. Poi
   si simula fotogramma per fotogramma, leggendo gol, presa, fatti del
   portiere (emettiFatto avvolto) e distanza minima. Le distanze delle
   scene sono in unita' di taglia 5 e scalano con FW/1150, cosi' la
   geometria resta la stessa alle tre taglie (l'attrito scala allo
   stesso modo, TIRO_ATTR = 1,0498 * 1150/FW).

     A  FERMA-IN-AREA      pallone fermo a 60 u dalla linea, al centro
                           della bocca. CONDANNA di P2 (uscita): oggi
                           resta li' finche' la scena dura; dopo, il
                           portiere lo raccoglie entro 1 s (presa).
     B  FERMA-LATERALE     pallone fermo a 40 u dalla linea, 20 u FUORI
                           dal palo (dentro il margine del tuffo, fuori
                           da quello di oggi). CONDANNA di P2+P3: dopo
                           la cura lo raccoglie entro 1,5 s.
     C  LENTA-CHE-MUORE    pallone a 150 u/s da 200 u verso il centro
                           della bocca: con l'attrito (150/1,05 = 143 u
                           di corsa) si spegne a ~57 u dalla linea, a 41
                           u da un portiere che aspetta a 16 -- fuori dal
                           semiasse lungo delle mani (34). CONDANNA di
                           P2: dopo la cura esce e lo prende. (La prima
                           stesura lo lanciava a 250 u/s: 238 u di corsa
                           arrivano fin dentro il corpo del portiere, ed
                           era una presa anche oggi -- misurato, 0,95 s.)
     D  LENTA-AL-PALO      pallone a 280 u/s da 150 u verso l'angolo
                           basso del primo palo. CONTROLLO: anche oggi
                           il portiere arriva sulla palla (la retta
                           verso il centro lo lascia a ~18 u, dentro il
                           corpo), e l'esito e' una respinta o una
                           presa: dopo la cura, sul punto di passaggio,
                           deve essere una PRESA (nessun rimpallo
                           regalato) e mai un gol.
     E  DIAGONALE-LENTA    pallone a 290 u/s che attraversa l'area in
                           diagonale verso il secondo palo. CONTROLLO
                           DISCRIMINANTE: nessun gol ne' prima ne' dopo.
     F  SALTO-DOPO-TUFFO   (P3, il margine laterale) il portiere ha
                           appena finito un tuffo largo, corpo a GY0-46
                           (dove il tuffo si concede di arrivare) e un
                           soffio di recupero residuo; il pallone e'
                           lontano. Al passo in cui torna in piedi la
                           legge di posizionamento di oggi lo stringe a
                           GY0-30: SEDICI unita' in un fotogramma, un
                           teletrasporto che nessuna gamba fa (GK_SPEED
                           150 u/s = 2,5 u a fotogramma). CONDANNA di
                           P3: dopo la cura il passo piu' lungo di quel
                           rientro resta sotto le 4 unita'.

   Ogni scena si gioca per le DUE squadre (porta a sinistra e porta a
   destra, scena specchiata): l'esito deve essere lo stesso, perche' la
   cura legge dir/goalX e mai team===0.

   A TAGLIA 11 LA LETTURA MORBIDA E' SPENTA PER DICHIARAZIONE (GK_MORBIDA_
   CORPO nel gioco: vale solo se P_R+B_R >= 10, e a 11 il corpo e' 7,5).
   La ragione e' il conto dei gol, misurato con _eventi.js e scritto
   accanto alla costante: a 11 la cura toglieva meta' delle reti. Quindi
   con un corpo sotto la soglia le scene A-D si stampano come
   INFORMAZIONE (l'esito atteso li' e' quello di oggi: il portiere NON
   esce, e il banco lo pretende: una presa entro la finestra sarebbe la
   prova che il cancello non regge), mentre E (non-gol) e F (il margine
   laterale, P3) restano asserzioni piene a ogni taglia.

   ZERO dado() dal banco. ORDINE SACRO: startMatch PRIMA, setCpuVsCpu
   DOPO.

   uso:  node strumenti/_t-159-portiere-anticipo.js
         node strumenti/_t-159-portiere-anticipo.js --gioco fuori/159/prima.html
         node strumenti/_t-159-portiere-anticipo.js --taglia 7 --seme 123
   esce 0 verde · 1 rosso (il gioco) · 2 banco esploso · 3 prova nulla
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
const SEME = +arg('seme', 20261102);
const TAGLIA = +arg('taglia', 5);
const CORPO_MORBIDA = 10;   // GK_MORBIDA_CORPO del gioco: sotto, la lettura morbida e' spenta per dichiarazione

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

/* LE SCENE, in unita' di taglia 5 relative alla porta in esame:
   dist = distanza dalla linea, y0 = scarto dal centro all'inizio,
   yT = scarto dal centro del punto mirato sulla linea (in frazione
   della semiluce, cosi' scala con GOAL_H), v = velocita' (0 = ferma). */
const SCENE = [
  { nome: 'A FERMA-IN-AREA',   dist: 60,  y0: 0,    yT: 0,     v: 0,   durata: 2.0, attesa: 'presa', entro: 1.0 },
  { nome: 'B FERMA-LATERALE',  dist: 40,  y0: null, yT: -1.39, v: 0,   durata: 2.5, attesa: 'presa', entro: 1.5 },
  { nome: 'C LENTA-CHE-MUORE', dist: 200, y0: 0,    yT: 0,     v: 150, durata: 2.5, attesa: 'presa', entro: 2.5 },
  { nome: 'D LENTA-AL-PALO',   dist: 150, y0: 40,   yT: -0.84, v: 280, durata: 2.0, attesa: 'presa', entro: 2.0 },
  { nome: 'E DIAGONALE-LENTA', dist: 120, y0: -140, yT: 0.80,  v: 290, durata: 2.0, attesa: 'non-gol', entro: 2.0 },
  { nome: 'F SALTO-DOPO-TUFFO', tipo: 'salto', attesa: 'passo', passoMax: 4 },
];

/* dentro la pagina */
function SCENA_PORTIERE(seme, taglia, squadra, sc) {
  const t = window.__test;
  if (!window.__fattiInstallato) {
    const f0 = window.emettiFatto;
    window.emettiFatto = function (che, chi, dove, esito) {
      if (window.__fatti) window.__fatti.push({ che, chi, t: window.__fattiT });
      return f0.apply(this, arguments);
    };
    window.__fattiInstallato = true;
  }
  t.semina(seme);
  t.startMatch(1, 1, { size: taglia });
  t.setCpuVsCpu(true);
  t.simulate(3);
  if (t.state !== 'play') return { errore: 'scena non in play dopo 3 s: ' + t.state };
  const C = t.campo, P = t.proporzioni();
  const FW = C.FW, FH = C.FH, GY0 = C.GY0, GY1 = C.GY1, semi = C.GOAL_H / 2;
  const k = FW / 1150;                       // scala delle distanze
  const goalX = squadra === 0 ? 0 : FW, dir = squadra === 0 ? 1 : -1;
  const gk = t.players.find(p => p.team === squadra && p.role === 'gk');
  if (!gk) return { errore: 'portiere non trovato' };
  const gi = t.players.indexOf(gk);
  /* tutti gli uomini di movimento lontani dalla porta in esame */
  let n = 0;
  for (const q of t.players) {
    if (q.role === 'gk') continue;
    Object.assign(q, { x: goalX + dir * (FW * 0.82 + (n % 4) * 10 * k), y: FH * 0.2 + (n * 37 % 100) / 100 * FH * 0.6,
                       vx: 0, vy: 0, slide: -1, recover: 0, rove: -1, charge: -1, kickCd: 0 });
    n++;
  }
  /* F -- il rientro dopo un tuffo largo: corpo a GY0-46, un soffio di
     recupero, pallone fermo e lontano (a meta' campo, libero). Si
     misura il passo piu' lungo del corpo nei dodici fotogrammi che
     seguono: una gamba fa al massimo GK_SPEED*dt = 2,5 unita'. */
  if (sc.tipo === 'salto') {
    Object.assign(gk, { x: goalX + dir * 20, y: GY0 - 46, vx: 0, vy: 0, dive: 0, recover: 0.01, charge: -1, kickCd: 0, gkT: 0 });
    Object.assign(t.ball, { owner: -1, x: FW / 2, y: FH / 2, z: 0, vx: 0, vy: 0, vz: 0, passTo: -1, crossTo: -1, lastTouch: -1, toccoPiede: false,
                            tiroT: -1, curve: 0, perfectT: 0, saveRolled: false });
    let maxPasso = 0, px = gk.x, py = gk.y; const passi = [];
    for (let i = 0; i < 12; i++) {
      t.simulate(1 / 60);
      const d = Math.hypot(gk.x - px, gk.y - py); px = gk.x; py = gk.y;
      passi.push(+d.toFixed(1)); if (d > maxPasso) maxPasso = d;
    }
    return { gi, esito: 'passo-max ' + maxPasso.toFixed(1), maxPasso: +maxPasso.toFixed(2), passi, tEsito: null, minDist: 0,
             gk: { distLinea: +(Math.abs(gk.x - goalX)).toFixed(1), dy: +(gk.y - FH / 2).toFixed(1) }, fermaA: null, fatti: [] };
  }
  /* il portiere in attesa */
  Object.assign(gk, { x: goalX + dir * 16, y: FH / 2, vx: 0, vy: 0, dive: 0, recover: 0, charge: -1, kickCd: 0, gkT: 0 });
  /* il pallone, libero: lastTouch/toccoPiede azzerati (lezione 21) */
  const y0 = sc.y0 === null ? (FH / 2 + sc.yT * semi) : (FH / 2 + sc.y0 * k);
  const bx = goalX + dir * sc.dist * k, by = y0;
  const txL = goalX, tyL = FH / 2 + sc.yT * semi;
  let vx = 0, vy = 0;
  if (sc.v > 0) { const ddx = txL - bx, ddy = tyL - by, l = Math.max(1, Math.hypot(ddx, ddy)); vx = ddx / l * sc.v; vy = ddy / l * sc.v; }
  Object.assign(t.ball, { owner: -1, x: bx, y: by, z: 0, vx, vy, vz: 0, passTo: -1, crossTo: -1, lastTouch: -1, toccoPiede: false,
                          tiroT: -1, curve: 0, perfectT: 0, saveRolled: false });
  const score0 = t.score[0] + t.score[1];
  window.__fatti = []; window.__fattiT = 0;
  let esito = 'niente', tEsito = -1, minDist = 1e9, fermaA = null;
  const N = Math.round(sc.durata * 60);
  for (let i = 0; i < N; i++) {
    window.__fattiT = +((i + 1) / 60).toFixed(3);
    t.simulate(1 / 60);
    const b = t.ball;
    const d = Math.hypot(b.x - gk.x, b.y - gk.y);
    if (d < minDist) minDist = d;
    if (t.score[0] + t.score[1] > score0 || t.state === 'goal') { esito = 'gol'; tEsito = (i + 1) / 60; break; }
    if (b.owner === gi) { esito = 'presa'; tEsito = (i + 1) / 60; break; }
    const f = window.__fatti.find(f => f.chi === gi && (f.che === 'respinta' || f.che === 'pugni' || f.che === 'sfugge'));
    if (f) { esito = f.che; tEsito = f.t; break; }
    if (b.owner >= 0 && b.owner !== gi) { esito = 'altri:' + t.players[b.owner].team; tEsito = (i + 1) / 60; break; }
    if (t.state !== 'play') { esito = 'scena:' + t.state; tEsito = (i + 1) / 60; break; }
  }
  const b = t.ball;
  if (esito === 'niente') fermaA = { distLinea: +(Math.abs(b.x - goalX)).toFixed(1), v: +Math.hypot(b.vx, b.vy).toFixed(0) };
  const fatti = window.__fatti.filter(f => f.chi === gi).map(f => f.che + '@' + f.t);
  window.__fatti = null;
  return { gi, esito, tEsito: tEsito >= 0 ? +tEsito.toFixed(2) : null, minDist: +minDist.toFixed(1),
           gk: { distLinea: +(Math.abs(gk.x - goalX)).toFixed(1), dy: +(gk.y - FH / 2).toFixed(1) }, fermaA, fatti,
           corpo: P.P_R + P.B_R };
}

(async () => {
  const provaRel = arg('gioco', process.env.GIOCO_PROVA || '');
  const provaAbs = provaRel ? path.resolve(RADICE, provaRel) : '';
  if (provaAbs && !fs.existsSync(provaAbs)) { console.error('PROVA NULLA: manca il gioco ' + provaAbs); process.exit(3); }
  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(semeFisso, SEME);
  const ecc = []; pag.on('pageerror', e => ecc.push(e.message));
  console.log('\n=== IL PORTIERE NON SI PREPARA (voce #159, P2/P3) ===  ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)') +
              '  -- taglia ' + TAGLIA + ', seme ' + SEME);
  let rossi = 0, esploso = null;
  const verdetto = (ok, nome, dett) => { console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (dett ? '  ' + dett : '')); if (!ok) rossi++; };
  try {
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
    await pag.waitForTimeout(150);
    await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
    await pag.evaluate('window.SCENA_PORTIERE = ' + SCENA_PORTIERE.toString() + ';');

    for (const sc of SCENE) {
      console.log('\n  ' + sc.nome + '  (attesa: ' + (sc.attesa === 'passo' ? 'passo massimo <= ' + sc.passoMax + ' u a fotogramma' : sc.attesa + (sc.attesa === 'presa' ? ' entro ' + sc.entro + ' s' : '')) + ')');
      const per = [];
      for (const sq of [0, 1]) {
        const e = await pag.evaluate(([s, tg, sq, sc]) => window.SCENA_PORTIERE(s, tg, sq, sc), [SEME, TAGLIA, sq, sc]).catch(er => ({ errore: er.message }));
        if (e.errore) { esploso = sc.nome + ' squadra ' + sq + ': ' + e.errore; break; }
        per.push(e);
        const dett = 'esito ' + e.esito + (e.tEsito !== null ? ' a ' + e.tEsito + ' s' : '') + ', distanza minima ' + e.minDist +
                     ', portiere a ' + e.gk.distLinea + ' u dalla linea (dy ' + e.gk.dy + ')' +
                     (e.fermaA ? ', pallone fermo a ' + e.fermaA.distLinea + ' u (v ' + e.fermaA.v + ')' : '') +
                     (e.fatti.length ? ', fatti: ' + e.fatti.join(' ') : '');
        let ok;
        const morbidaSpenta = sc.attesa === 'presa' && e.corpo !== undefined && e.corpo < CORPO_MORBIDA;
        if (morbidaSpenta) ok = !(e.esito === 'presa' && e.tEsito <= sc.entro);   // il cancello sul corpo deve reggere
        else if (sc.attesa === 'presa') ok = e.esito === 'presa' && e.tEsito <= sc.entro;
        else if (sc.attesa === 'passo') ok = e.maxPasso <= sc.passoMax;
        else ok = e.esito !== 'gol';
        verdetto(ok, 'squadra ' + sq + (morbidaSpenta ? ' [corpo ' + e.corpo + ' < ' + CORPO_MORBIDA + ': lettura morbida spenta, il portiere NON deve uscire]' : ''),
                 sc.attesa === 'passo' ? 'passi per fotogramma: ' + e.passi.join(' ') + ' (dy finale ' + e.gk.dy + ')' : dett);
      }
      if (esploso) break;
      verdetto(per[0].esito === per[1].esito, 'le due squadre danno lo stesso esito', per[0].esito + ' / ' + per[1].esito);
    }
  } catch (e) { esploso = e.message; }
  await browser.close(); srv.chiudi();
  if (ecc.length) { console.log('\n  ECCEZIONI DI PAGINA: ' + ecc.join(' | ')); }
  if (esploso) { console.log('\nBANCO ESPLOSO: ' + esploso); process.exit(2); }
  console.log('\n' + (rossi ? 'ROSSO: ' + rossi + ' asserzioni fallite' : 'VERDE: tutte le asserzioni passano'));
  process.exit(rossi ? 1 : 0);
})().catch(e => { console.error('BANCO ESPLOSO:', e.message); process.exit(2); });
