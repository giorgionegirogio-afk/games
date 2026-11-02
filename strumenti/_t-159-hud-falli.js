/* =====================================================================
   _t-159-hud-falli.js — IL CONTO DEI FALLI DI SQUADRA SI VEDE QUANDO CONTA
   (voce #159, cura R5, difetto #46 della ricognizione del 2/11/2026)

   IL DIFETTO. Dal terzo fallo di squadra ogni fallo e' una punizione
   (cumulo in checkSlideContact/eseguiSfumato), ma l'HUD non dice mai a
   che punto e' il conto: i tre pallini furono tolti apposta (il commento
   in drawHUD li difende: cinque elementi persistenti). Il conto resta
   nel tabellino di fine partita.

   LA CURA (R5). In drawHUD, sotto il nome squadra, un'etichetta
   CONDIZIONALE nella scala dell'HUD (corpo 11): a falli[t]===2 «2 FALLI»
   in ambra, da 3 in su «PUNIZIONE»; niente quando non serve, cosi' i
   cinque elementi persistenti restano cinque. Solo disegno: zero dado(),
   zero simulazione.

   LA PROVA: una spia su ctx.fillText (ctx e' il contesto 2D globale del
   gioco) e un drawHUD() per ogni stato di G.stats.falli:
     [0,0] -> nessuna etichetta (il contrario resta verde)
     [2,0] -> una sola «2 FALLI», a sinistra del centro (squadra 0), corpo 11
     [3,0] -> una sola «PUNIZIONE», a sinistra, niente «2 FALLI»
     [0,2] -> «2 FALLI» a destra del centro (squadra 1): simmetria
     [5,5] -> due «PUNIZIONE», una per lato
   Oggi nessuna stringa dell'HUD contiene FALLI o PUNIZIONE: ROSSO.

   ORDINE SACRO: startMatch PRIMA, setCpuVsCpu(true) DOPO.

   uso:  node strumenti/_t-159-hud-falli.js [--gioco f.html]
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

/* la spia: ogni fillText con la sua x, il suo font e il suo colore */
function SPIA() {
  if (window.__spiaInstallata) return true;
  const orig = ctx.fillText;
  window.__spia = [];
  ctx.fillText = function (s, x, y) {
    window.__spia.push({ s: String(s), x: +x, y: +y, font: ctx.font, col: String(ctx.fillStyle) });
    return orig.apply(this, arguments);
  };
  window.__spiaInstallata = true;
  return true;
}
function ETICHETTE(falli) {
  G.stats.falli = falli.slice();
  G.paused = false;
  window.__spia.length = 0;
  drawHUD();
  const meta = VW / 2;
  return window.__spia
    .filter(e => /FALLI|PUNIZIONE/.test(e.s))
    .map(e => ({ s: e.s, lato: e.x < meta ? 'sx' : 'dx', corpo: (e.font.match(/(\d+)px/) || [])[1] | 0, col: e.col }));
}

(async () => {
  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(semeFisso, SEME);
  const ecc = []; pag.on('pageerror', e => ecc.push(e.message));
  console.log('\n=== HUD: IL CONTO DEI FALLI QUANDO CONTA (R5, voce #159) ===  ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)'));
  let rossi = 0, verdi = 0;
  const di = (ok, nome, det) => { ok ? verdi++ : rossi++; console.log((ok ? '  OK   ' : '  NO   ') + nome + (det ? '\n         ' + det : '')); };
  try {
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
    await pag.waitForTimeout(150);
    await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
    await pag.evaluate(`window.SPIA = ${SPIA.toString()}; window.ETICHETTE = ${ETICHETTE.toString()};`);
    const stato = await pag.evaluate(({ seme }) => {
      const t = window.__test;
      t.semina(seme);
      t.startMatch(1, 1, { size: 5 });   // PRIMA
      t.setCpuVsCpu(true);               // DOPO
      for (let i = 0; i < 900 && t.state !== 'play'; i++) t.simulate(1 / 60);
      t.disegna();                       // un fotogramma vero: BAR_X0/X1 e MINI_RECT al loro posto
      SPIA();
      return t.state;
    }, { seme: SEME });
    if (stato !== 'play') { console.error('PROVA NULLA: la partita non arriva a play (' + stato + ')'); await browser.close(); srv.chiudi(); process.exit(3); }

    const casi = [
      { falli: [0, 0], attese: [] },
      { falli: [2, 0], attese: [{ s: '2 FALLI', lato: 'sx' }] },
      { falli: [3, 0], attese: [{ s: 'PUNIZIONE', lato: 'sx' }] },
      { falli: [0, 2], attese: [{ s: '2 FALLI', lato: 'dx' }] },
      { falli: [1, 1], attese: [] },
      { falli: [5, 5], attese: [{ s: 'PUNIZIONE', lato: 'sx' }, { s: 'PUNIZIONE', lato: 'dx' }] },
    ];
    for (const c of casi) {
      const r = await pag.evaluate(f => ETICHETTE(f), c.falli);
      const visto = r.map(e => e.s + '@' + e.lato).sort().join(',');
      const atteso = c.attese.map(e => e.s + '@' + e.lato).sort().join(',');
      const corpoOk = r.every(e => e.corpo === 11);
      di(visto === atteso && corpoOk,
        'falli=' + JSON.stringify(c.falli) + ' -> ' + (atteso || 'nessuna etichetta') + (r.length ? ', corpo 11' : ''),
        'viste: ' + (r.length ? JSON.stringify(r) : 'nessuna'));
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
