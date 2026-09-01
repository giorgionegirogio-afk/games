/* =====================================================================
   _t-abbandono-conta.js — L'ABBANDONO CONTA (banco del Contenuto 2,
   1 settembre 2026; progetto §3 e §6).

   Tre scene, dai bottoni veri, con dita vere (touchscreen.tap):
     A) TORNEO: si avvia dal menu, si abbandona col DOPPIO tocco.
        Attesi: il primo tocco arma e non esce; il secondo esce; il
        torneo e' perso (tour.out), saldo monete IDENTICO, stats.partite
        FERMA, e il disco e' stato scritto (localStorage riletto).
     B) STAGIONE: idem; attesi: giornata consumata, in classifica la
        nostra riga segna 1 giocata, 1 persa, 0-3, 0 punti.
     C) AMICHEVOLE (regressione): il bottone dice «torna al menu» e UN
        tocco solo esce, come sempre (_crit3-abbandona resta il cancello
        del dito sull'amichevole; qui si fissa il testo e il tocco
        singolo).

   uso: node strumenti/_t-abbandono-conta.js [--gioco file.html]
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
  console.log('\n=== L\'ABBANDONO CONTA ===  ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)'));
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });

  const tocca = async id => {
    const r = await pag.evaluate(k => {
      const e = document.getElementById(k); if (!e) return null;
      /* il tabellone della stagione sfora i 412 px del telefono steso:
         il bottone si porta in vista PRIMA di leggere il rettangolo,
         come farebbe un pollice che scorre (misurato: btnSeaPlay a
         y=416 su schermo 412 — il tocco cadeva fuori) */
      e.scrollIntoView({ block: 'center' });
      const b = e.getBoundingClientRect();
      return { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2), vis: b.width > 0 && b.height > 0 };
    }, id);
    if (!r || !r.vis) throw new Error('bottone non visibile: ' + id);
    await pag.touchscreen.tap(r.x, r.y);
    await pag.waitForTimeout(350);
  };
  const leggi = () => pag.evaluate(() => ({
    coins: SAVE.coins, partite: SAVE.stats.partite,
    tour: SAVE.tour ? { round: SAVE.tour.round, out: !!SAVE.tour.out } : null,
    sea: SAVE.season ? { giornata: SAVE.season.giornata, mia: { ...SAVE.season.tab[0] }, finita: SAVE.season.finita } : null,
    quitSub: (document.getElementById('quitSub') || {}).textContent || '',
    inMenu: !document.getElementById('menu').classList.contains('hidden'),
    inPausa: !document.getElementById('pausa').classList.contains('hidden'),
    scena: G.scene,
  }));

  /* ---------------- A) TORNEO ---------------- */
  await tocca('btnTorneo');
  await tocca('btnNuovoTorneo').catch(() => {});     // se un torneo esiste gia', il bottone non c'e'
  await tocca('btnTourPlay');
  await pag.waitForFunction("typeof G!=='undefined' && ['play','kickoff'].includes(G.scene)", null, { timeout: 15000 });
  await pag.waitForTimeout(1200);                     // si gioca un momento
  const ta = await leggi();
  await pag.keyboard.press('Escape');
  await pag.waitForTimeout(350);
  let s = await leggi();
  verifica(s.inPausa && s.quitSub === 'vale sconfitta a tavolino 0-3',
    'A1 torneo: il bottone dichiara il tavolino alla pausa', '«' + s.quitSub + '»');
  await tocca('btnQuit');
  s = await leggi();
  verifica(!s.inMenu && s.inPausa && /^SICURO\?/.test(s.quitSub),
    'A2 torneo: il primo tocco arma e non esce', '«' + s.quitSub + '»');
  await tocca('btnQuit');
  s = await leggi();
  verifica(s.inMenu, 'A3 torneo: il secondo tocco esce');
  verifica(s.tour && s.tour.out === true, 'A4 torneo: il torneo e\' perso (tour.out)', JSON.stringify(s.tour));
  verifica(s.coins === ta.coins, 'A5 torneo: saldo monete identico', ta.coins + ' -> ' + s.coins);
  verifica(s.partite === ta.partite, 'A6 torneo: stats.partite ferma', ta.partite + ' -> ' + s.partite);
  const disco = await pag.evaluate(() => {
    try { const j = JSON.parse(localStorage.getItem('calcetto_save_v4') || localStorage.getItem('calcetto_save') || 'null'); return j && j.tour ? { out: !!j.tour.out } : null; }
    catch (e) { return null; }
  });
  verifica(!!(disco && disco.out === true), 'A7 torneo: il disco e\' stato scritto (tour.out sul localStorage)', JSON.stringify(disco));

  /* ---------------- B) STAGIONE ---------------- */
  await tocca('btnStagione');
  await pag.waitForTimeout(400);
  await tocca('btnNuovaStagione').catch(() => {});
  await pag.waitForTimeout(600);                      // il tabellone si ricostruisce
  await tocca('btnSeaPlay');
  /* un secondo tentativo tollerante: dopo NUOVA STAGIONE il tabellone
     puo' rimpaginarsi sotto il dito e il primo tocco cadere a vuoto */
  try { await pag.waitForFunction("typeof G!=='undefined' && ['play','kickoff'].includes(G.scene)", null, { timeout: 6000 }); }
  catch (e) { await tocca('btnSeaPlay'); }
  await pag.waitForFunction("typeof G!=='undefined' && ['play','kickoff'].includes(G.scene)", null, { timeout: 15000 });
  await pag.waitForTimeout(1200);
  const sb = await leggi();
  await pag.keyboard.press('Escape');
  await pag.waitForTimeout(350);
  s = await leggi();
  verifica(s.inPausa && s.quitSub === 'vale sconfitta a tavolino 0-3',
    'B1 stagione: il bottone dichiara il tavolino', '«' + s.quitSub + '»');
  await tocca('btnQuit');
  await tocca('btnQuit');
  s = await leggi();
  verifica(s.inMenu, 'B2 stagione: il doppio tocco esce');
  verifica(s.sea && s.sea.giornata === sb.sea.giornata + 1,
    'B3 stagione: la giornata e\' consumata', sb.sea.giornata + ' -> ' + (s.sea && s.sea.giornata));
  const mia = s.sea && s.sea.mia;
  verifica(!!mia && mia.g === 1 && mia.p === 1 && mia.gf === 0 && mia.gs === 3 && mia.pt === 0,
    'B4 stagione: in classifica 1 giocata, 1 persa, 0-3, 0 punti', JSON.stringify(mia));
  verifica(s.coins === sb.coins && s.partite === sb.partite,
    'B5 stagione: saldo e partite fermi', sb.coins + '/' + sb.partite + ' -> ' + s.coins + '/' + s.partite);

  /* ---------------- C) AMICHEVOLE (regressione) ---------------- */
  await pag.evaluate(() => { window.__test.startMatch(1, 1, { size: 5 }); });
  await pag.waitForTimeout(600);
  await pag.keyboard.press('Escape');
  await pag.waitForTimeout(350);
  s = await leggi();
  verifica(s.inPausa && s.quitSub === 'torna al menu',
    'C1 amichevole: il bottone resta «torna al menu»', '«' + s.quitSub + '»');
  await tocca('btnQuit');
  s = await leggi();
  verifica(s.inMenu, 'C2 amichevole: UN tocco solo esce, come sempre');

  if (ecc.length) verifica(false, 'nessuna eccezione di pagina', ecc[0]);
  const rossi = esiti.filter(v => !v).length;
  console.log('\n' + (esiti.length - rossi) + ' controlli su ' + esiti.length + ' — ' + (rossi ? 'CANCELLO ROSSO' : 'CANCELLO VERDE'));
  await browser.close(); srv.chiudi();
  process.exit(rossi ? 1 : 0);
})().catch(e => { console.error('FALLITO: ' + e.message); process.exit(2); });
