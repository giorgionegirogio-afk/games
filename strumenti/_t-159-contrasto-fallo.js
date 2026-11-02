/* =====================================================================
   _t-159-contrasto-fallo.js — IL CONTRASTO IN PIEDI FALLITO NON E' GRATIS
   (voce #159, cura R2, difetto #13 della ricognizione del 2/11/2026)

   IL DIFETTO. contrastoPasso (verbo SOLO UMANO: p.contrasto nasce solo
   dal disco premuto) sorteggia una volta e, se il contrasto fallisce,
   costa 0,22 s di piede freddo e nient'altro: mai un fallo, nemmeno da
   dietro, mai un prezzo in fiato. Contro la CPU si puo' premere ogni 0,22
   s finche' il dado dice si'. E' lo sfruttamento piu' grave dell'elenco.

   LA CURA (R2), A CONTEGGIO DI ESTRAZIONI INVARIATO. Lo STESSO sorteggio
   r=dado() decide tre cose: sotto sp il pallone e' preso (come oggi);
   sopra sp e' fallito — e, se l'entrata e' da dietro (faccia>0,5), una
   quota CONTRASTO_FALLO=0,35 dei falliti diventa FALLO via
   falloDaScivolata(p,o,true). Ogni fallito costa p.kickCd=0,45 (il numero
   del furto col corpo fallito in updateBall) e un morso di fiato
   (CONTRASTO_FIATO, una frazione di SCUDO_FIATO).

   LE PROVE, da pag.evaluate (il verbo non esce mai in CPU contro CPU):
     1. DA DIETRO — p alle spalle di o (fx concordi, faccia=1), pallone di
        o, piede a portata; N semi (t.semina(s)): la quota di 'fallo' fra i
        falliti deve stare intorno al 35% (banda 25-45% su ~230 falliti);
        oggi zero -> ROSSO.
     2. DA DAVANTI — faccia=-1: MAI 'fallo', prima e dopo.
     3. UNA ESTRAZIONE PER LA DECISIONE — su 'preso' e 'fallito'
        t.sorteggi cresce di esattamente 1 a ogni contrastoPasso, prima e
        dopo: e' la promessa «conteggio invariato» che tiene fermi i
        banchi a seme. Su 'fallo' cresce di 1 PIU' gli effetti di
        falloDaScivolata (zolle e polvere pescano rnd() per particella,
        ~185 estrazioni, conteggio variabile di qualche unita' per il
        colore delle zolle): la prova li confronta col sostegno misurato
        su 60 falli da scivolata di riferimento nella stessa pagina, cosi'
        «gli effetti del fallo» e «un dado in piu' nella decisione» non
        si confondono. Alla prima corsa questa prova era scritta come
        «sempre 1» ed e' nata rossa sul curato: era il banco a non sapere
        che un fallo ha sempre pagato le sue zolle.
     4. IL PREZZO — su ogni fallito/fallo: p.kickCd===0,45 e p.fiato<100.
        Oggi 0,22 e 100 -> ROSSO.
     5. DETERMINISMO (facoltativa, --prima f.html): 20 partite CPU contro
        CPU a taglia 5 sullo stesso seme, sul file di PRIMA della cura e
        su questo: punteggio e t.sorteggi identici partita per partita.
        Senza --prima la prova si dichiara non eseguita (non e' verde).

   ORDINE SACRO: startMatch PRIMA, setCpuVsCpu(true) DOPO.

   uso:  node strumenti/_t-159-contrasto-fallo.js [--gioco f.html] [--semi 300]
                                                  [--prima fuori/159/dopo-R1.html] [--partite 20]
   esce 0 verde · 1 rosso · 2 banco esploso · 3 prova nulla
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
const SEMI = +arg('semi', 300);
const PARTITE = +arg('partite', 20);
const SEME = 20261102;
const provaRel = arg('gioco', process.env.GIOCO_PROVA || '');
const provaAbs = provaRel ? path.resolve(RADICE, provaRel) : '';
const primaRel = arg('prima', '');
const primaAbs = primaRel ? path.resolve(RADICE, primaRel) : '';
if (provaAbs && !fs.existsSync(provaAbs)) { console.error('PROVA NULLA: il gioco indicato non esiste: ' + provaAbs); process.exit(3); }
if (primaAbs && !fs.existsSync(primaAbs)) { console.error('PROVA NULLA: il gioco di PRIMA non esiste: ' + primaAbs); process.exit(3); }

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

async function apri(browser, porta) {
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(semeFisso, SEME);
  const ecc = []; pag.on('pageerror', e => ecc.push(e.message));
  await pag.goto(`http://127.0.0.1:${porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
  return { ctx, pag, ecc };
}

/* N chiamate a contrastoPasso nella stessa geometria, un seme per
   chiamata. Vive nella pagina: p (squadra 0) e o (squadra 1, col pallone)
   si rimettono a posto PRIMA di ogni chiamata, cosi' ogni prova parte
   dallo stesso stato e l'unica cosa che cambia e' il seme. */
function CONTRASTI({ semi, geometria }) {
  const t = window.__test;
  const P = t.players;
  const p = P.find(u => u.team === 0 && u.role !== 'gk');
  const o = P.find(u => u.team === 1 && u.role !== 'gk');
  const pi = P.indexOf(p), oi = P.indexOf(o);
  const prop = t.proporzioni();
  const x = prop.FW / 2, y = prop.FH / 2;
  const out = { esiti: {}, kickCd: {}, fiato: {}, sorteggiPerChiamata: {}, sorteggiDecisione: {}, sorteggiFallo: {}, fattiFallo: 0, vittimeGiuste: 0, cattivi: 0 };
  const conta = (m, k) => { m[k] = (m[k] || 0) + 1; };
  for (let s = 1; s <= semi; s++) {
    /* SEMI GRANDI E TRE ESTRAZIONI DI RISCALDAMENTO. Lo xorshift32 del
       gioco, acceso su un seme piccolo (1, 2, ... 300), da' una prima
       uscita minuscola (seme 1 -> 0,00006): con t.semina(s) e s<300 il
       primo dado() sta sempre sotto sp e il contrasto riesce 300 volte
       su 300 -- misurato alla prima corsa di questo banco, che cosi'
       condannava se stesso. Il seme si allarga e si scalda. */
    t.semina((20261102 + s * 7919) >>> 0);
    dado(); dado(); dado();
    /* o col pallone davanti ai piedi, che guarda +x */
    Object.assign(o, { x, y, fx: 1, fy: 0, vx: 0, vy: 0, slide: -1, recover: 0, out: 0, kickCd: 0 });
    Object.assign(t.ball, { owner: oi, x: x + 6, y, z: 0, vx: 0, vy: 0, vz: 0, passTo: -1, crossTo: -1, lastTouch: oi, toccoPiede: false });
    if (geometria === 'dietro') Object.assign(p, { x: x - 18, y, fx: 1, fy: 0 });     // alle spalle, stesso verso: faccia=+1
    else Object.assign(p, { x: x + 28, y, fx: -1, fy: 0 });                             // di fronte, verso opposto: faccia=-1
    Object.assign(p, { vx: 0, vy: 0, slide: -1, recover: 0, out: 0, kickCd: 0, fiato: 100, contrasto: 0 });
    G.vantaggio = null; G.freeze = 0; G.stats.falli = [0, 0];
    const n0 = t.sorteggi, f0 = G.fattiTot;
    const r = contrastoPasso(p);
    conta(out.esiti, r);
    conta(out.sorteggiPerChiamata, String(t.sorteggi - n0));
    if (r === 'fallito' || r === 'fallo') { conta(out.kickCd, p.kickCd.toFixed(2)); conta(out.fiato, p.fiato < 100 ? 'morso' : 'intero'); }
    if (r === 'fallo') conta(out.sorteggiFallo, String(t.sorteggi - n0)); else conta(out.sorteggiDecisione, String(t.sorteggi - n0));
    if (r === 'fallo') {
      const nuovi = G.fatti.slice(Math.max(0, G.fatti.length - (G.fattiTot - f0)));
      const ff = nuovi.filter(f => f.che === 'fallo');
      out.fattiFallo += ff.length;
      if (ff.length === 1 && ff[0].chi === pi && ff[0].esito && ff[0].esito.vittima === oi) out.vittimeGiuste++;
      if (ff.length === 1 && ff[0].esito && ff[0].esito.cattivo) out.cattivi++;
      if (G.stats.falli[0] !== 1) out.falliSbagliati = (out.falliSbagliati || 0) + 1;
    }
  }
  return out;
}

/* IL RIFERIMENTO: quante estrazioni consuma un fallo da scivolata DI OGGI
   (checkSlideContact col portatore, entrata da dietro -> fallo cattivo,
   qualunque sia il dado). Il fallo del contrasto passa dalla stessa
   funzione, e deve costare lo stesso: la decisione (1) piu' gli effetti
   -- zolle e polvere pescano rnd() per ogni particella, con un conteggio
   che varia di qualche unita' per il colore delle zolle. Senza questo
   riferimento la prova 3 non saprebbe distinguere "gli effetti del fallo"
   da "un dado in piu' infilato nella decisione". */
function RIFERIMENTO({ semi }) {
  const t = window.__test;
  const P = t.players;
  const p = P.find(u => u.team === 0 && u.role !== 'gk');
  const o = P.find(u => u.team === 1 && u.role !== 'gk');
  const oi = P.indexOf(o);
  const prop = t.proporzioni();
  const x = prop.FW / 2, y = prop.FH / 2;
  const deltas = {};
  for (let s = 1; s <= semi; s++) {
    t.semina((20261102 + s * 7919) >>> 0);
    dado(); dado(); dado();
    Object.assign(o, { x, y, fx: 1, fy: 0, vx: 0, vy: 0, slide: -1, recover: 0, out: 0, kickCd: 0 });
    Object.assign(t.ball, { owner: oi, x: x + 6, y, z: 0, vx: 0, vy: 0, vz: 0, passTo: -1, crossTo: -1, lastTouch: oi, toccoPiede: false });
    Object.assign(p, { x: x - 20, y, fx: 1, fy: 0, vx: 0, vy: 0, slide: 0.0, slideDX: 1, slideDY: 0, recover: 0, out: 0, kickCd: 0, fiato: 100 });
    G.vantaggio = null; G.freeze = 0; G.stats.falli = [0, 0];
    const n0 = t.sorteggi, f0 = G.stats.falli[0];
    checkSlideContact(p);
    const k = String(t.sorteggi - n0) + (G.stats.falli[0] === f0 + 1 ? '' : '?');
    deltas[k] = (deltas[k] || 0) + 1;
  }
  return deltas;
}

/* 20 partite CPU contro CPU: punteggio e sorteggi, per il controllo di
   determinismo fra due file */
async function partite(pag, n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push(await pag.evaluate(seme => {
      const t = window.__test;
      t.semina(seme);
      t.startMatch(1, 1, { size: 5 });
      t.setCpuVsCpu(true);
      let sim = 0;
      while (t.state !== 'end' && sim < 600) { t.simulate(10); sim += 10; }
      return { seme, score: t.score.slice(), sorteggi: t.sorteggi, stato: t.state };
    }, 20260803 + i));
  }
  return out;
}

(async () => {
  let rossi = 0, verdi = 0;
  const di = (ok, nome, det) => { ok ? verdi++ : rossi++; console.log((ok ? '  OK   ' : '  NO   ') + nome + (det ? '\n         ' + det : '')); };
  console.log('\n=== CONTRASTO IN PIEDI: IL FALLITO SI PAGA (R2, voce #159) ===  ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)') + '  -- ' + SEMI + ' semi per geometria');
  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  let eccezioni = [];
  try {
    const A = await apri(browser, srv.porta);
    await A.pag.evaluate(`window.CONTRASTI = ${CONTRASTI.toString()}; window.RIFERIMENTO = ${RIFERIMENTO.toString()};`);
    await A.pag.evaluate(({ seme }) => {
      const t = window.__test;
      t.semina(seme);
      t.startMatch(1, 1, { size: 5 });
      t.setCpuVsCpu(true);
      for (let i = 0; i < 900 && t.state !== 'play'; i++) t.simulate(1 / 60);
      return t.state;
    }, { seme: SEME });
    const dietro = await A.pag.evaluate(c => CONTRASTI(c), { semi: SEMI, geometria: 'dietro' });
    const davanti = await A.pag.evaluate(c => CONTRASTI(c), { semi: SEMI, geometria: 'davanti' });
    const rif = await A.pag.evaluate(c => RIFERIMENTO(c), { semi: 60 });
    eccezioni = A.ecc.slice();
    await A.ctx.close();

    const e = m => JSON.stringify(m);
    const fallo = dietro.esiti.fallo || 0, fallito = dietro.esiti.fallito || 0, preso = dietro.esiti.preso || 0;
    const quota = fallo / Math.max(1, fallo + fallito);
    di(fallo > 0 && quota >= 0.25 && quota <= 0.45 && dietro.vittimeGiuste === fallo && dietro.cattivi === fallo && !dietro.falliSbagliati,
      '1. DA DIETRO — una quota ~35% dei falliti diventa FALLO (banda 25-45%), ogni fallo e\' un fatto \'fallo\' cattivo con vittima o e un solo fallo nel conto di squadra',
      'esiti=' + e(dietro.esiti) + '  quota fallo/(fallo+fallito)=' + (100 * quota).toFixed(1) + '%  fatti fallo=' + dietro.fattiFallo + ' vittime giuste=' + dietro.vittimeGiuste + ' cattivi=' + dietro.cattivi + ' presi=' + preso);
    di((davanti.esiti.fallo || 0) === 0 && (davanti.esiti.fallito || 0) > 0 && (davanti.esiti.preso || 0) > 0,
      '2. DA DAVANTI — mai un fallo (e il contrasto resta un sorteggio vero: ci sono presi e falliti)',
      'esiti=' + e(davanti.esiti));
    /* 3. LA DECISIONE E' UNA ESTRAZIONE, IL FALLO COSTA QUANTO UN FALLO.
       preso/fallito: esattamente 1. fallo: 1 + gli effetti di
       falloDaScivolata (zolle/polvere, conteggio variabile di qualche
       unita'), che devono stare nel sostegno misurato sul fallo da
       scivolata di riferimento (60 falli), allargato di 3 per parte per
       il conteggio variabile del colore delle zolle. */
    const unaSola = m => Object.keys(m).length === 1 && m['1'] > 0;
    const numeri = m => Object.keys(m).map(Number);
    const rifN = numeri(rif).filter(n => !isNaN(n));
    const rifMin = Math.min(...rifN), rifMax = Math.max(...rifN);
    const falloN = numeri(dietro.sorteggiFallo || {});
    const falloOk = falloN.length === 0 || falloN.every(n => n - 1 >= rifMin - 3 && n - 1 <= rifMax + 3);
    const rifSporco = Object.keys(rif).some(k => k.endsWith('?'));
    di(unaSola(dietro.sorteggiDecisione) && unaSola(davanti.sorteggiDecisione) && falloOk && !rifSporco && rifN.length > 0,
      '3. UNA ESTRAZIONE PER LA DECISIONE — preso/fallito consumano esattamente 1 sorteggio; il fallo ne consuma 1 piu\' gli effetti di falloDaScivolata, entro il sostegno di un fallo da scivolata di riferimento',
      'decisione dietro=' + e(dietro.sorteggiDecisione) + ' davanti=' + e(davanti.sorteggiDecisione) + '  fallo (1+effetti)=' + e(dietro.sorteggiFallo || {}) + '  riferimento scivolata=' + e(rif) + ' [' + rifMin + '..' + rifMax + ']');
    const soloCd = (m, v) => Object.keys(m).length === 1 && m[v] > 0;
    di(soloCd(dietro.kickCd, '0.45') && soloCd(davanti.kickCd, '0.45') && soloCd(dietro.fiato, 'morso') && soloCd(davanti.fiato, 'morso'),
      '4. IL PREZZO — su ogni fallito/fallo p.kickCd vale 0,45 (il numero del furto col corpo fallito) e il fiato e\' morso',
      'kickCd dietro=' + e(dietro.kickCd) + ' davanti=' + e(davanti.kickCd) + '  fiato dietro=' + e(dietro.fiato) + ' davanti=' + e(davanti.fiato));

    if (primaAbs) {
      /* due file, un browser alla volta: prima il DOPO (questo), poi il PRIMA */
      const B = await apri(browser, srv.porta);
      const dopo = await partite(B.pag, PARTITE);
      await B.ctx.close();
      const srv2 = await servi(primaAbs);
      const C = await apri(browser, srv2.porta);
      const prima = await partite(C.pag, PARTITE);
      await C.ctx.close(); srv2.chiudi();
      const diverse = [];
      for (let i = 0; i < PARTITE; i++) {
        const a = prima[i], b = dopo[i];
        if (a.score[0] !== b.score[0] || a.score[1] !== b.score[1] || a.sorteggi !== b.sorteggi) diverse.push('seme ' + a.seme + ': ' + a.score.join('-') + '/' + a.sorteggi + ' -> ' + b.score.join('-') + '/' + b.sorteggi);
      }
      di(diverse.length === 0, '5. DETERMINISMO — ' + PARTITE + ' partite CPU contro CPU, taglia 5: punteggio e sorteggi identici fra ' + primaRel + ' e questo file',
        diverse.length ? diverse.join(' | ') : 'sorteggi per partita: ' + dopo.map(d => d.sorteggi).join(', '));
    } else {
      console.log('  --   5. DETERMINISMO non eseguita: manca --prima f.html (il file di prima della cura)');
    }
  } catch (e2) {
    console.error('BANCO ESPLOSO: ' + (e2 && e2.stack || e2));
    await browser.close(); srv.chiudi(); process.exit(2);
  }
  await browser.close(); srv.chiudi();
  if (eccezioni.length) { console.error('ECCEZIONI DI PAGINA: ' + eccezioni.join(' | ')); process.exit(2); }
  console.log('\n' + (verdi + rossi) + ' prove, ' + verdi + ' verdi, ' + rossi + ' rosse  ->  ' + (rossi ? 'ROSSO' : 'VERDE'));
  process.exit(rossi ? 1 : 0);
})();
