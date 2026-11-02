/* =====================================================================
   _t-159-doppio-giallo.js — LA DOPPIA AMMONIZIONE ALLO STESSO UOMO ESPELLE
   (voce #159, cura R3, difetto #33 della ricognizione del 2/11/2026)

   IL DIFETTO. infliggiCartellino conta i gialli DI SQUADRA
   (G.stats.gialli[team] % CARTELLINI_PER_ESPULSIONE) e non legge mai
   p.gialli: due gialli allo stesso uomo, se il conto di squadra e'
   dispari, lo lasciano in campo. La regola di squadra e' una scelta di
   casa documentata (MANUALE §8, presidiata da _q-dischi/AVVISO) e RESTA.

   LA CURA (R3). OR dei due inneschi, stesse guardie (inCampo>2, non
   portiere): daEspellere = (conto di squadra di oggi) || (p.gialli %
   CARTELLINI_PER_ESPULSIONE === 0). Zero dado().

   LA PROVA, specchiata sulle due squadre (A e B della stessa squadra,
   di movimento):
     1. giallo ad A        -> A in campo (1 di squadra, 1 personale)
     2. giallo a B         -> B FUORI (2 di squadra: la regola di oggi,
                              che deve restare), A in campo
     3. secondo giallo ad A -> A FUORI (2 personali) ANCHE se il conto di
                              squadra e' 3, dispari. Oggi A resta: ROSSO.
   A ogni passo si leggono anche i fatti ('giallo'/'espulsione') e
   t.disciplina.

   ORDINE SACRO: startMatch PRIMA, setCpuVsCpu(true) DOPO.

   uso:  node strumenti/_t-159-doppio-giallo.js [--gioco f.html] [--taglia 5]
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
const TAGLIA = +arg('taglia', 5);
const SEME = 20261102;
const provaRel = arg('gioco', process.env.GIOCO_PROVA || '');
const provaAbs = provaRel ? path.resolve(RADICE, provaRel) : '';
if (provaAbs && !fs.existsSync(provaAbs)) { console.error('PROVA NULLA: il gioco indicato non esiste: ' + provaAbs); process.exit(3); }

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

/* la sequenza A, B, A sulla squadra `team`, dentro la pagina */
function SEQUENZA({ team }) {
  const t = window.__test;
  const P = t.players;
  const mov = P.filter(u => u.team === team && u.role !== 'gk' && u.out <= 0);
  if (mov.length < 3) return { errore: 'servono almeno tre uomini di movimento in campo (ne ho ' + mov.length + ')' };
  const A = mov[0], B = mov[1];
  const ai = P.indexOf(A), bi = P.indexOf(B);
  const passo = (chi) => {
    const f0 = G.fattiTot;
    infliggiCartellino(chi);
    const nuovi = G.fatti.slice(Math.max(0, G.fatti.length - (G.fattiTot - f0))).map(f => f.che);
    return { A: { gialli: A.gialli, out: +A.out.toFixed(1) }, B: { gialli: B.gialli, out: +B.out.toFixed(1) }, squadra: G.stats.gialli[team], espulsi: G.stats.espulsi[team], fatti: nuovi };
  };
  return { ok: true, ai, bi, s1: passo(A), s2: passo(B), s3: passo(A), disciplina: t.disciplina };
}

(async () => {
  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(semeFisso, SEME);
  const ecc = []; pag.on('pageerror', e => ecc.push(e.message));
  console.log('\n=== DOPPIO GIALLO ALLO STESSO UOMO (R3, voce #159) ===  ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)') + '  -- taglia ' + TAGLIA);
  let rossi = 0, verdi = 0;
  const di = (ok, nome, det) => { ok ? verdi++ : rossi++; console.log((ok ? '  OK   ' : '  NO   ') + nome + (det ? '\n         ' + det : '')); };
  try {
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
    await pag.waitForTimeout(150);
    await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
    await pag.evaluate(`window.SEQUENZA = ${SEQUENZA.toString()};`);
    for (const team of [1, 0]) {
      const r = await pag.evaluate(({ seme, taglia, team }) => {
        const t = window.__test;
        t.semina(seme);
        t.startMatch(1, 1, { size: taglia });   // PRIMA
        t.setCpuVsCpu(true);                     // DOPO
        for (let i = 0; i < 900 && t.state !== 'play'; i++) t.simulate(1 / 60);
        if (t.state !== 'play') return { errore: 'la partita non arriva a play (' + t.state + ')' };
        return SEQUENZA({ team });
      }, { seme: SEME, taglia: TAGLIA, team });
      if (r.errore) { di(false, 'squadra ' + team, 'BANCO: ' + r.errore); continue; }
      const e = JSON.stringify;
      di(r.s1.A.gialli === 1 && r.s1.A.out === 0 && r.s1.fatti.includes('giallo') && !r.s1.fatti.includes('espulsione'),
        'squadra ' + team + ' — 1. primo giallo ad A: resta in campo', e(r.s1));
      di(r.s2.B.gialli === 1 && r.s2.B.out > 0 && r.s2.A.out === 0 && r.s2.fatti.includes('espulsione') && r.s2.espulsi === 1,
        'squadra ' + team + ' — 2. giallo a B: B FUORI al secondo giallo DI SQUADRA (la regola di casa resta), A in campo', e(r.s2));
      di(r.s3.A.gialli === 2 && r.s3.A.out > 0 && r.s3.fatti.includes('espulsione') && r.s3.espulsi === 2 && r.s3.squadra === 3,
        'squadra ' + team + ' — 3. secondo giallo ad A: A FUORI per i DUE GIALLI PERSONALI anche col conto di squadra dispari (3)', e(r.s3) + ' disciplina=' + e(r.disciplina));
    }
  } catch (e) {
    console.error('BANCO ESPLOSO: ' + (e && e.stack || e));
    await browser.close(); srv.chiudi(); process.exit(2);
  }
  await browser.close(); srv.chiudi();
  if (ecc.length) { console.error('ECCEZIONI DI PAGINA: ' + ecc.join(' | ')); process.exit(2); }
  console.log('\n' + (verdi + rossi) + ' prove, ' + verdi + ' verdi, ' + rossi + ' rosse  ->  ' + (rossi ? 'ROSSO' : 'VERDE'));
  process.exit(rossi ? 1 : 0);
})();
