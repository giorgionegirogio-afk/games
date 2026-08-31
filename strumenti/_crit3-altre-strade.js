/* _crit3-altre-strade.js — LE STRADE CHE LA RIPARAZIONE NON HA PERCORSO.
   La cura e' write-site: chi scrive SAVE.mentalita ridipinge. Qui si
   prova che regga anche fuori dal percorso della sonda:
     A) AZZERA DATI con la riga su ATTACCO
     B) partita di TORNEO -> pausa -> cambio -> menu -> GIOCA
     C) DUE GIOCATORI -> pausa -> cambio -> menu -> GIOCA
     D) ricarica della pagina dopo un cambio in pausa
   uso: node strumenti/_crit3-altre-strade.js --gioco fuori/crit-ment.html */
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
let passati = 0, falliti = 0;
const dice = (c, t, d) => { c ? passati++ : falliti++; console.log('  ' + (c ? 'OK  ' : 'NO  ') + ' ' + t + (d ? '  [' + d + ']' : '')); };
const leggiRiga = pag => pag.evaluate(() => ({
  accese: [...document.querySelectorAll('.ment')].filter(b => b.classList.contains('sel')).map(b => +b.dataset.m),
  salvato: window.__test.save.mentalita,
}));
(async () => {
  const prova = arg('gioco', '');
  const provaAbs = prova ? path.resolve(prova) : '';
  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 } });
  const pag = await ctx.newPage();
  const ecc = []; pag.on('pageerror', e => ecc.push(e.message));
  const url = `http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`;
  const apri = async () => {
    await pag.goto(url, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
  };
  await apri();
  console.log('\n=== ALTRE STRADE ===  ' + (provaAbs || 'repo'));

  /* --- A) AZZERA DATI ------------------------------------------------ */
  await pag.evaluate(() => { window.__test.save.mentalita = 2; if (typeof refreshMentRow === 'function') refreshMentRow(); });
  const primaA = await leggiRiga(pag);
  await pag.evaluate(() => { if (typeof doResetSave === 'function') doResetSave(); });
  await pag.waitForTimeout(200);
  const dopoA = await leggiRiga(pag);
  dice(dopoA.salvato === 1 && dopoA.accese.length === 1 && dopoA.accese[0] === 1,
    'A) dopo AZZERA DATI la riga torna alla voce neutra',
    'prima accesa ' + JSON.stringify(primaA.accese) + ' -> dopo accesa ' + JSON.stringify(dopoA.accese) + ', salvato ' + dopoA.salvato);

  /* --- B) TORNEO ----------------------------------------------------- */
  await apri();
  const bOk = await pag.evaluate(() => {
    try {
      window.__test.save.mentalita = 1;
      if (typeof refreshMentRow === 'function') refreshMentRow();
      window.__test.startMatch(1, 1, { tour: true, opp: (typeof SQUADRE !== 'undefined' ? SQUADRE[0] : undefined), size: 11 });
      return { ok: true, ctx: typeof G !== 'undefined' ? G.matchCtx : '?', ment: window.__test.mentalita };
    } catch (e) { return { ok: false, err: e.message }; }
  });
  await pag.waitForTimeout(200);
  if (!bOk.ok) { dice(false, 'B) la partita di torneo parte', bOk.err); }
  else {
    await pag.keyboard.press('Escape'); await pag.waitForTimeout(200);
    await pag.click('#btnPauseMent', { force: true }); await pag.waitForTimeout(150);
    const inCorsa = await pag.evaluate(() => ({ ment: window.__test.mentalita, salvato: window.__test.save.mentalita }));
    await pag.click('#btnQuit', { force: true }); await pag.waitForTimeout(300);
    await pag.evaluate(() => { if (typeof goScreen === 'function' && typeof ui !== 'undefined') goScreen(ui.menu); });
    await pag.click('#btnGioca', { force: true }); await pag.waitForTimeout(250);
    const r = await leggiRiga(pag);
    dice(r.accese.length === 1 && r.accese[0] === r.salvato,
      'B) TORNEO: la riga di GIOCA dice quello che il salvataggio porta',
      'matchCtx=' + bOk.ctx + ', in corsa G.ment=[' + inCorsa.ment + '] salvato ' + inCorsa.salvato +
      ' -> accesa ' + JSON.stringify(r.accese) + ', salvato ' + r.salvato);
  }

  /* --- C) DUE GIOCATORI ---------------------------------------------- */
  await apri();
  await pag.evaluate(() => { window.__test.save.mentalita = 1; if (typeof refreshMentRow === 'function') refreshMentRow(); window.__test.startMatch(2, 1, { size: 11 }); });
  await pag.waitForTimeout(200);
  await pag.keyboard.press('Escape'); await pag.waitForTimeout(200);
  await pag.click('#btnPauseMent', { force: true }); await pag.waitForTimeout(150);
  const c1 = await pag.evaluate(() => ({ ment: window.__test.mentalita, salvato: window.__test.save.mentalita }));
  await pag.click('#btnQuit', { force: true }); await pag.waitForTimeout(300);
  await pag.click('#btnGioca', { force: true }); await pag.waitForTimeout(250);
  const c2 = await leggiRiga(pag);
  dice(c2.accese.length === 1 && c2.accese[0] === c2.salvato,
    'C) DUE GIOCATORI: la riga di GIOCA dice quello che il salvataggio porta',
    'in corsa G.ment=[' + c1.ment + '] -> accesa ' + JSON.stringify(c2.accese) + ', salvato ' + c2.salvato);
  dice(c1.ment[1] === 1, 'C) e la seconda squadra resta EQUILIBRIO, come dichiarato', 'G.ment=[' + c1.ment + ']');

  /* --- D) RICARICA ---------------------------------------------------- */
  await pag.reload({ waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); });
  await pag.click('#btnGioca', { force: true }); await pag.waitForTimeout(250);
  const d = await leggiRiga(pag);
  dice(d.accese.length === 1 && d.accese[0] === d.salvato,
    'D) dopo una RICARICA la riga dice quello che il salvataggio porta',
    'accesa ' + JSON.stringify(d.accese) + ', salvato ' + d.salvato);

  dice(ecc.length === 0, 'nessuna eccezione di pagina', ecc[0] || '');
  await browser.close(); srv.chiudi();
  console.log('\n' + (passati + falliti) + ' controlli, ' + passati + ' passati, ' + falliti + ' falliti');
  process.exit(falliti ? 1 : 0);
})().catch(e => { console.error('FALLITO: ' + e.message); process.exit(1); });
