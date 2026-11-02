/* =====================================================================
   _t-159-finestra-pressione.js -- LA FINESTRA DEL TIRO SI STRINGE CON LA
   PRESSIONE (voce #159, cura H1, spec §2.2: «tiro: la finestra del
   tempismo e' a tempo fisso anche sotto pressione»).

   IL DIFETTO, LETTO SUL CODICE. La finestra del tempismo del tiro umano
   e' SHOT_MIN..SHOT_MAX (0,50..0,80 di tenuta, 300 ms) allargata dalla
   sola tecnica: `larg=(p.tecnica-62)/38*0.045`. La riga vive in DUE
   posti -- la PROMESSA (segniGuida, la linea del tiro che dice «dentro»
   col campo `dentro`) e l'ESECUZIONE (releaseCharge, che decide
   `finestra` e la passa a fireShotMirato: dentro = TIRO PERFETTO, fuori
   = i due sorteggi dello strozzato) -- e in nessuno dei due entra
   l'avversario addosso: con un uomo a quattro unita' il tiro perfetto
   costa esattamente quanto a campo libero. E' lo sfruttamento H1.

   LA CURA. Una funzione sola, finestraTiro(p), che calcola larg dalla
   tecnica E dalla pressione dell'avversario piu' vicino (il ricettario
   del tocco sporco: TOCCO_PRESS=46, pressione=clamp((46-d)/46,0,1)),
   con larg -= pressione*0.07 e un pavimento: la finestra non scende mai
   sotto 0,12 di tenuta (120 ms). Promessa ed esecuzione la chiamano
   tutte e due (L3.1: la promessa esce dalle STESSE funzioni
   dell'esecuzione). Zero dado(): e' una lettura.

   LE PROVE, da pag.evaluate (il tiro umano non esce mai in CPU contro
   CPU): umano col pallone al piede, tecnica 62 (larg di tecnica = 0,
   cosi' la finestra di partenza e' esattamente 0,50..0,80), tenuta
   c = SHOT_MAX-0,02 = 0,78. Per OGNI scena si leggono tre cose: la
   PROMESSA (segniGuida -> linea-tiro.dentro), l'ESECUZIONE
   (releaseCharge -> G.stats.perfetti cresce di 1 se e solo se la
   finestra era vera) e, quando esiste, finestraTiro(p).
     (a) nessun avversario entro 150 u  -> dentro (promessa e tiro
         perfetto): e' il tiro di sempre, la promessa del tutorial.
     (b) avversario a 4 u               -> FUORI: pressione 0,913,
         larg = -0,064, il tetto scende a 0,736 < 0,78.
         OGGI (a) e (b) danno lo stesso esito -> ROSSO.
     (c) promessa ed esecuzione rispondono UGUALE in ogni scena, e
         uguale a cio' che finestraTiro(p) dice: stessa funzione.
     (d) il pavimento: tecnica 100 e pressione 1 -> finestra non sotto
         0,12; tecnica 30 e pressione 1 -> esattamente 0,12 (il
         pavimento morde); tecnica 62 senza pressione -> larg = 0, cioe'
         la finestra di ieri al bit.
     (e) zero sorteggi: finestraTiro(p) non muove t.sorteggi.
     SPECCHIO: ogni scena gira per la squadra 0 (attacca +x) e per la 1
     (attacca -x), geometria specchiata, e i verdetti devono coincidere.

   ORDINE SACRO: startMatch PRIMA, setCpuVsCpu DOPO (serve per arrivare
   in 'play' senza un dito; poi la squadra provata torna umana con
   G.cpu[sq]=false e G.ctrl[sq]=pi, che e' cio' che setCpuVsCpu disfa).
   Chi teletrasporta il pallone azzera lo stato derivato: qui il pallone
   e' posato AL PIEDE del tiratore (owner lui, lastTouch lui, un piede).

   uso:  node strumenti/_t-159-finestra-pressione.js
         node strumenti/_t-159-finestra-pressione.js --gioco fuori/159/fuso.html
         node strumenti/_t-159-finestra-pressione.js --seme 123 --taglia 5
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
const PAVIMENTO = 0.12;         // la finestra non scende mai sotto 120 ms di tenuta

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

/* dentro la pagina: la partita arriva in gioco vivo, una volta sola */
function AVVIA(seme, taglia) {
  const t = window.__test;
  t.semina(seme);
  t.startMatch(1, 1, { size: taglia });
  t.setCpuVsCpu(true);
  for (let i = 0; i < 900 && t.state !== 'play'; i++) t.simulate(1 / 60);
  if (t.state !== 'play') return { errore: 'la partita non arriva in play: ' + t.state };
  t.setTimeLeft(600);
  return { ok: true };
}

/* dentro la pagina: UNA scena di tiro. cfg = { sq, dAvv (null = nessuno
   entro 150 u), tecnica, c, soloFinestra }. Torna promessa, esecuzione
   e la larghezza che finestraTiro dichiara (null se non esiste ancora). */
function SCENA_TIRO(cfg) {
  const t = window.__test;
  const P = G.players;
  const sq = cfg.sq, dir = sq === 0 ? 1 : -1;
  const p = P.find(u => u.team === sq && u.role !== 'gk');
  const o = P.find(u => u.team !== sq && u.role !== 'gk');
  if (!p || !o) return { errore: 'manca un uomo di movimento' };
  const pi = P.indexOf(p);
  /* la squadra provata torna UMANA, col tiratore comandato: e' l'inverso
     esatto di setCpuVsCpu (G.cpu[0]=!!on; G.ctrl[0]=on?-1:0) */
  G.cpu[sq] = false; G.ctrl[sq] = pi;
  G.paused = false;
  const x0 = sq === 0 ? FW * 0.72 : FW * 0.28, y0 = FH / 2;
  /* tutti gli altri parcheggiati nell'angolo dietro al tiratore, a piu'
     di 150 u, specchiato per squadra; in piedi e non in scivolata, cosi'
     la pressione li conterebbe se fossero vicini */
  for (let i = 0; i < P.length; i++) {
    const q = P[i]; if (q === p) continue;
    q.x = sq === 0 ? 20 + (i % 4) * 12 : FW - 20 - (i % 4) * 12;
    q.y = 20 + Math.floor(i / 4) * 12;
    q.vx = 0; q.vy = 0; q.out = 0; q.slide = -1;
  }
  Object.assign(p, { x: x0, y: y0, vx: 0, vy: 0, fx: dir, fy: 0, out: 0, slide: -1, recover: 0, kickCd: 0,
                     tecnica: cfg.tecnica });
  if (cfg.dAvv !== null) { o.x = x0 - dir * cfg.dAvv; o.y = y0; }   // alle spalle, a dAvv unita'
  /* il pallone al piede: owner lui, lastTouch lui, ed e' un piede */
  Object.assign(G.ball, { owner: pi, x: x0 + dir * 6, y: y0, z: 0, vx: 0, vy: 0, vz: 0, curve: 0,
                          passTo: -1, crossTo: -1, lastTouch: pi, toccoPiede: true });
  /* la carica come la lascia startCharge, piu' il tempo tenuto */
  p.charge = cfg.c; p.chargeKind = 'tiro'; p.chargeT = SHOT_MIN; p.chargeGo = null; p.chargeClip = 'tiro';
  const n0 = t.sorteggi;
  const larg = (typeof finestraTiro === 'function') ? finestraTiro(p) : null;
  const sorteggiFinestra = t.sorteggi - n0;
  const dAvvVero = Math.min(...P.filter(q => q.team !== sq && q.out <= 0 && q.slide < 0).map(q => len(q.x - p.x, q.y - p.y)));
  const out = { pi, larg, sorteggiFinestra, dAvvVero: +dAvvVero.toFixed(2),
                larghezza: larg === null ? null : +(SHOT_MAX - SHOT_MIN + 2 * larg).toFixed(6),
                attesa: larg === null ? null : (cfg.c >= SHOT_MIN - larg && cfg.c <= SHOT_MAX + larg) };
  if (cfg.soloFinestra) { p.charge = -1; p.chargeGo = null; return out; }
  /* LA PROMESSA: la linea del tiro, con la lettura nulla (tastiera) */
  const segni = segniGuida(sq);
  const lin = segni.find(s => s.tipo === 'linea-tiro');
  out.promessa = lin ? !!lin.dentro : null;
  /* L'ESECUZIONE: il rilascio senza lettura (nessun dito, nessun
     pallonetto), poi il tabellino dice se e' stato perfetto */
  G.stats.perfetti[sq] = 0;
  const tiri0 = G.stats.tiri[sq];
  const n1 = t.sorteggi;
  releaseCharge(sq, null);
  out.perfetto = G.stats.perfetti[sq] === 1;
  out.tirato = G.stats.tiri[sq] - tiri0;
  out.owner = G.ball.owner;
  out.vel = Math.round(len(G.ball.vx, G.ball.vy));
  out.sorteggiRilascio = t.sorteggi - n1;
  return out;
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
  console.log('\n=== LA FINESTRA DEL TIRO SI STRINGE CON LA PRESSIONE (voce #159, H1) ===  ' +
              (provaAbs || 'CALCETTO-il-gioco.html (repo)') + '  -- taglia ' + TAGLIA + ', seme ' + SEME);
  let rossi = 0, verdi = 0, esploso = null;
  const di = (ok, nome, det) => { ok ? verdi++ : rossi++; console.log((ok ? '  OK   ' : '  NO   ') + nome + (det ? '\n         ' + det : '')); };
  const e = m => JSON.stringify(m);
  try {
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
    await pag.waitForTimeout(150);
    await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
    await pag.evaluate('window.AVVIA = ' + AVVIA.toString() + '; window.SCENA_TIRO = ' + SCENA_TIRO.toString() + ';');
    const av = await pag.evaluate(([s, tg]) => window.AVVIA(s, tg), [SEME, TAGLIA]);
    if (av.errore) throw Object.assign(new Error(av.errore), { banco: true });

    const scena = async cfg => {
      const r = await pag.evaluate(c => window.SCENA_TIRO(c), cfg);
      if (r.errore) throw Object.assign(new Error(r.errore), { banco: true });
      return r;
    };
    const C = +(0.80 - 0.02).toFixed(4);     // SHOT_MAX - 0,02: un soffio sotto il tetto di ieri
    const R = {};
    for (const sq of [0, 1]) {
      R[sq] = {
        a: await scena({ sq, dAvv: null, tecnica: 62, c: C }),
        b: await scena({ sq, dAvv: 4, tecnica: 62, c: C }),
        d100: await scena({ sq, dAvv: 0, tecnica: 100, c: C, soloFinestra: true }),
        d30: await scena({ sq, dAvv: 0, tecnica: 30, c: C, soloFinestra: true }),
        d62: await scena({ sq, dAvv: null, tecnica: 62, c: C, soloFinestra: true }),
      };
    }
    const sunto = r => 'promessa=' + r.promessa + ' perfetto=' + r.perfetto + ' tirato=' + r.tirato + ' larg=' + r.larg +
                       ' dAvv=' + r.dAvvVero + ' vel=' + r.vel + ' sorteggi(finestra/rilascio)=' + r.sorteggiFinestra + '/' + r.sorteggiRilascio;

    for (const sq of [0, 1]) {
      const a = R[sq].a, b = R[sq].b;
      di(a.tirato === 1 && a.promessa === true && a.perfetto === true,
         '(a) squadra ' + sq + ': nessun avversario entro 150 u, tenuta ' + C + ' -> DENTRO la finestra (promessa e tiro perfetto)', sunto(a));
      di(b.tirato === 1 && b.promessa === false && b.perfetto === false,
         '(b) squadra ' + sq + ': avversario a 4 u, stessa tenuta -> FUORI dalla finestra (promessa e tiro non perfetto)', sunto(b));
      di(a.promessa === a.perfetto && b.promessa === b.perfetto &&
         a.larg !== null && a.attesa === a.perfetto && b.attesa === b.perfetto,
         '(c) squadra ' + sq + ': promessa, esecuzione e finestraTiro(p) rispondono uguale in (a) e in (b)',
         '(a) promessa=' + a.promessa + ' perfetto=' + a.perfetto + ' finestraTiro=' + a.attesa +
         '  (b) promessa=' + b.promessa + ' perfetto=' + b.perfetto + ' finestraTiro=' + b.attesa);
      const d100 = R[sq].d100, d30 = R[sq].d30, d62 = R[sq].d62;
      di(d100.larg !== null && d100.larghezza >= PAVIMENTO - 1e-9 &&
         d30.larg !== null && Math.abs(d30.larghezza - PAVIMENTO) <= 1e-9 &&
         d62.larg === 0,
         '(d) squadra ' + sq + ': il pavimento -- tecnica 100 e pressione 1: finestra >= 0,12; tecnica 30 e pressione 1: esattamente 0,12; tecnica 62 senza pressione: larg = 0 (la finestra di ieri)',
         'tecnica100/press1 larg=' + d100.larg + ' larghezza=' + d100.larghezza + ' dAvv=' + d100.dAvvVero +
         '  tecnica30/press1 larg=' + d30.larg + ' larghezza=' + d30.larghezza +
         '  tecnica62/libero larg=' + d62.larg + ' larghezza=' + d62.larghezza);
      di([a, b, d100, d30, d62].every(r => r.sorteggiFinestra === 0) && a.larg !== null,
         '(e) squadra ' + sq + ': finestraTiro(p) non estrae nessun sorteggio',
         'sorteggi per chiamata: ' + e([a, b, d100, d30, d62].map(r => r.sorteggiFinestra)));
    }
    /* LO SPECCHIO: le due squadre, geometria specchiata, stessi verdetti */
    const chiave = r => [r.promessa, r.perfetto, r.tirato, r.larg, r.larghezza, r.vel].join('|');
    const spec = ['a', 'b', 'd100', 'd30', 'd62'].filter(k => chiave(R[0][k]) !== chiave(R[1][k]));
    di(spec.length === 0, 'SPECCHIO -- le due squadre danno gli stessi verdetti scena per scena',
       spec.length ? spec.map(k => k + ': ' + chiave(R[0][k]) + '  vs  ' + chiave(R[1][k])).join(' | ')
                   : 'a=' + chiave(R[0].a) + '  b=' + chiave(R[0].b));
  } catch (er) { esploso = (er && er.stack) || String(er); }
  await browser.close(); srv.chiudi();
  if (ecc.length) { console.log('\n  ECCEZIONI DI PAGINA: ' + ecc.join(' | ')); }
  if (esploso) { console.log('\nBANCO ESPLOSO: ' + esploso); process.exit(2); }
  console.log('\n' + (verdi + rossi) + ' prove, ' + verdi + ' verdi, ' + rossi + ' rosse  ->  ' + (rossi ? 'ROSSO' : 'VERDE'));
  process.exit(rossi ? 1 : 0);
})().catch(er => { console.error('BANCO ESPLOSO:', er.message); process.exit(2); });
