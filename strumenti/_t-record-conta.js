/* =====================================================================
   _t-record-conta.js — IL BANCO DEI RECORD E DELLA MENSOLA
   (Contenuto 3, 1 settembre 2026; progetto §4 e §6).

   Partite a esiti forzati, e si leggono carriera, record e trofei:
     1) 5 gol in una partita -> record golPartita=5 CON la data di oggi,
        scartoMax=5, e GOLEADA sbloccata;
     2) una vittoria piu' stretta DOPO -> il record NON arretra;
     3) due vinte di fila -> serieV=2; una persa -> serieV=0 e
        serieVMax=2 (e il record serieV resta 2);
     4) pareggio -> pareggi+1 e serieV azzerata resta 0;
     5) porta imbattuta in vittoria -> cleanSheets+1;
     6) manomissione (record.golPartita.v='x', serieV.v=-3) -> la
        rilettura tiene i tetti (voci ignorate, default puliti);
     7) le tessere RECORD in STATISTICHE mostrano valore e data.

   uso: node strumenti/_t-record-conta.js [--gioco file.html]
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
      if ((!f.startsWith(RADICE) && f !== prova) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
const esiti = [];
function verifica(ok, nome, det) {
  esiti.push(ok);
  console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '   (' + det + ')' : ''));
}

(async () => {
  const prova = arg('gioco', '');
  const provaAbs = prova ? path.resolve(prova) : '';
  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, hasTouch: true, isMobile: true });
  const pag = await ctx.newPage();
  const ecc = []; pag.on('pageerror', e => ecc.push(e.message));
  console.log('\n=== IL BANCO DEI RECORD ===  ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)'));
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => {
    window.requestAnimationFrame = () => 0;
    const t = window.__test; t.dismissSplash && t.dismissSplash();
    if (t.save) t.save.tutorialDone = 1;
  });

  const partita = (golA, golB) => pag.evaluate(([golA, golB]) => {
    const t = window.__test;
    t.startMatch(1, 0, { size: 5 });
    for (let i = 0; i < 240 && G.scene !== 'play'; i++) t.simulate(1 / 60);
    /* un gol alla volta, tornando in gioco fra l'uno e l'altro: cinque
       forceGoal a raffica ne atterrano UNO solo, perche' la scena e'
       ancora sul gol precedente (misurato alla prima stesura: il 5-0
       chiesto era un 1-0) */
    const forza = team => {
      t.forceGoal(team);
      for (let i = 0; i < 900 && G.scene !== 'play'; i++) t.simulate(1 / 60);
    };
    for (let k = 0; k < golA; k++) forza(0);
    for (let k = 0; k < golB; k++) forza(1);
    t.setTimeLeft(0.2);
    for (let i = 0; i < 1200 && G.scene !== 'end'; i++) t.simulate(1 / 60);
    return { stats: JSON.parse(JSON.stringify(SAVE.stats)),
             record: JSON.parse(JSON.stringify(SAVE.record)),
             ach: Object.keys(SAVE.ach || {}) };
  }, [golA, golB]);
  const oggi = await pag.evaluate(() => dataOggi());

  /* 1) la goleada e il record con la data */
  let r = await partita(5, 0);
  verifica(r.record.golPartita.v === 5 && r.record.golPartita.data === oggi,
    '1a record golPartita=5 con la data di oggi', JSON.stringify(r.record.golPartita));
  verifica(r.record.scartoMax.v === 5, '1b scartoMax=5', JSON.stringify(r.record.scartoMax));
  verifica(r.ach.includes('goleada'), '1c GOLEADA sbloccata', r.ach.join(','));
  verifica(r.stats.cleanSheets === 1, '1d porta imbattuta contata', 'cleanSheets ' + r.stats.cleanSheets);

  /* 2) il record non arretra */
  r = await partita(3, 1);
  verifica(r.record.golPartita.v === 5 && r.record.scartoMax.v === 5,
    '2 una vittoria piu' + String.fromCharCode(39) + ' stretta non tocca i record', JSON.stringify({ g: r.record.golPartita.v, s: r.record.scartoMax.v }));

  /* 3) la serie: due vinte (siamo a 2), una persa, serieVMax resta */
  verifica(r.stats.serieV === 2, '3a due vinte di fila: serieV=2', 'serieV ' + r.stats.serieV);
  r = await partita(0, 2);
  verifica(r.stats.serieV === 0 && r.stats.serieVMax === 2,
    '3b la sconfitta azzera la serie e serieVMax resta', JSON.stringify({ v: r.stats.serieV, max: r.stats.serieVMax }));
  verifica(r.record.serieV.v === 2, '3c il record serieV resta 2', JSON.stringify(r.record.serieV));

  /* 4) IL PARI IN AMICHEVOLE NON ESISTE PER PROGETTO (la legge del #79:
        solo il campionato pareggia; l'amichevole va al golden). Qui si
        FISSA la legge: sull'1-1 allo scadere la scena diventa golden e
        pareggi resta fermo — il contatore si muove solo in stagione. */
  r = await pag.evaluate(() => {
    const t = window.__test;
    t.startMatch(1, 0, { size: 5 });
    for (let i = 0; i < 240 && G.scene !== 'play'; i++) t.simulate(1 / 60);
    const forza = team => { t.forceGoal(team); for (let i = 0; i < 900 && G.scene !== 'play'; i++) t.simulate(1 / 60); };
    forza(0); forza(1);
    t.setTimeLeft(0.2);
    /* la scena si CAMPIONA in sequenza: fra il 90' e il golden passano
       cartelli e riprese, e un solo sguardo li puo' mancare */
    /* il golden e' una BANDIERA (G.golden), non una scena: la partita
       resta in 'play' e il cartello e' un banner (misurato alla stesura
       precedente: 30 s campionati, solo 'play' nelle scene) */
    const viste = {};
    let golden = false;
    for (let i = 0; i < 1800; i++) {
      t.simulate(1 / 60);
      viste[G.scene] = 1;
      if (G.golden) { golden = true; break; }
    }
    /* si chiude col golden, per lasciare il banco su una partita finita */
    forza(0);
    for (let i = 0; i < 1200 && G.scene !== 'end'; i++) t.simulate(1 / 60);
    return { golden, viste: Object.keys(viste).join(','), pareggi: SAVE.stats.pareggi };
  });
  verifica(r.golden && r.pareggi === 0,
    '4 sull\'1-1 l\'amichevole va al golden e pareggi resta fermo (la legge del #79)',
    'scene ' + r.viste + ', pareggi ' + r.pareggi);

  /* 5) le parate e i falli si accumulano (>=0 e' il minimo onesto:
        dipendono dal gioco vivo, qui si prova che la chiave esiste e
        resta un numero). Lettura FRESCA: il caso 4 ha riscritto r. */
  const s5 = await pag.evaluate(() => JSON.parse(JSON.stringify(SAVE.stats)));
  verifica(typeof s5.parate === 'number' && typeof s5.falli === 'number',
    '5 parate e falli sono numeri di carriera', 'parate ' + s5.parate + ', falli ' + s5.falli);

  /* 6) la manomissione prende i tetti */
  await pag.evaluate(() => {
    window.persistSave = () => {};
    const j = JSON.parse(localStorage.getItem('calcetto_save_v4'));
    j.record.golPartita = { v: 'x', data: 'ieri' };
    j.record.serieV = { v: -3, data: 'mai' };
    j.record.scartoMax = { v: 99.7, data: 12345 };
    localStorage.setItem('calcetto_save_v4', JSON.stringify(j));
  });
  await pag.reload({ waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  const R2 = await pag.evaluate(() => JSON.parse(JSON.stringify(SAVE.record)));
  verifica(R2.golPartita.v === 0 && R2.serieV.v === 0 && R2.scartoMax.v === 99 && typeof R2.scartoMax.data === 'string',
    '6 la manomissione prende i tetti (non-numeri e negativi ignorati, decimali troncati, data stringa)', JSON.stringify(R2));

  /* 7) le tessere della schermata */
  const tess = await pag.evaluate(() => {
    buildStatsUI();
    const rc = document.getElementById('statRecord');
    return rc ? rc.textContent : null;
  });
  verifica(!!tess && /Scarto massimo/.test(tess) && /99/.test(tess),
    '7 le tessere RECORD mostrano il valore', (tess || '').replace(/\s+/g, ' ').slice(0, 80));

  if (ecc.length) verifica(false, 'nessuna eccezione di pagina', ecc[0]);
  const rossi = esiti.filter(v => !v).length;
  console.log('\n' + (esiti.length - rossi) + ' controlli su ' + esiti.length + ' — ' + (rossi ? 'CANCELLO ROSSO' : 'CANCELLO VERDE'));
  await browser.close(); srv.chiudi();
  process.exit(rossi ? 1 : 0);
})().catch(e => { console.error('FALLITO: ' + e.message); process.exit(2); });
