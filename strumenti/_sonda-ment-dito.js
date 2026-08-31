/* =====================================================================
   _sonda-ment-dito.js — IL PERCORSO DEL DITO, SULLA MENTALITA'.

   Non misura la forma della squadra (quello lo fa _q-mentalita.js): fa
   UNA cosa sola, e la fa toccando i bottoni veri con un dito vero.

     partita 11 contro 11  ->  ESC  ->  tocco su MENTALITA'  ->  ABBANDONA
     ->  menu  ->  GIOCA  ->  legge la pastiglia accesa  ->  1 GIOCATORE

   e alla fine chiede due cose: la pastiglia accesa nella schermata GIOCA
   dice la stessa cosa di SAVE.mentalita? e la partita che parte dopo
   gioca quella stessa mentalita'?

   PERCHE' UNA SONDA A PARTE. Il cancello _q-mentalita.js prova i comandi
   ma non PERCORRE le schermate: apre la pausa e legge lo stato in
   memoria. La bugia che questa sonda cerca vive esattamente nel salto
   fra due schermate, e in memoria non c'e'.
   NON si chiama refreshMentRow() a mano da nessuna parte, ed e' il punto
   di tutto: chiamarla sarebbe rendere verde il difetto.

   uso:  node strumenti/_sonda-ment-dito.js --gioco fuori/ment2.html
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
const NOMI = ['DIFESA', 'EQUILIBRIO', 'ATTACCO'];
let passati = 0, falliti = 0;
const dice = (c, t, d) => { c ? passati++ : falliti++; console.log('  ' + (c ? 'OK  ' : 'NO  ') + ' ' + t + (d ? '  [' + d + ']' : '')); };

(async () => {
  const prova = arg('gioco', process.env.GIOCO_PROVA || '');
  const provaAbs = prova ? path.resolve(prova) : '';
  if (provaAbs && !fs.existsSync(provaAbs)) { console.error('FALLITO: gioco di prova inesistente: ' + provaAbs); process.exit(1); }

  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 } });
  const pag = await ctx.newPage();
  const eccezioni = [];
  pag.on('pageerror', e => eccezioni.push(e.message));

  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });

  console.log('\n=== IL PERCORSO DEL DITO ===');
  console.log('  --   gioco: ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)'));

  const laHa = await pag.evaluate(() => typeof MENT !== 'undefined' && Array.isArray(MENT));
  if (!laHa) {
    console.log('\n  --   questo gioco non ha la mentalita\': niente da percorrere.');
    await browser.close(); srv.chiudi(); process.exit(0);
  }

  /* si parte dalla voce di serie, EQUILIBRIO, e da una partita vera */
  await pag.evaluate(() => { window.__test.save.mentalita = 1; window.__test.startMatch(1, 1, { size: 11 }); });
  await pag.waitForTimeout(120);

  /* ESC: la pausa */
  await pag.keyboard.press('Escape');
  await pag.waitForTimeout(150);
  const inPausa = await pag.evaluate(() => !document.getElementById('pausa').classList.contains('hidden'));
  dice(inPausa, 'la pausa si apre');

  /* il dito sulla voce MENTALITA': EQUILIBRIO -> ATTACCO */
  await pag.click('#btnPauseMent', { force: true });
  await pag.waitForTimeout(120);
  const dopoTocco = await pag.evaluate(() => ({
    voce: document.getElementById('btnPauseMent').textContent,
    salvato: window.__test.save.mentalita,
    ment: window.__test.mentalita,
  }));
  dice(dopoTocco.salvato === 2, 'il tocco porta il salvataggio su ATTACCO',
    dopoTocco.voce + '  SAVE.mentalita=' + dopoTocco.salvato);

  /* ABBANDONA -> menu -> GIOCA */
  await pag.click('#btnQuit', { force: true });
  await pag.waitForTimeout(200);
  await pag.click('#btnGioca', { force: true });
  await pag.waitForTimeout(250);

  const schermata = await pag.evaluate(() => ({
    aperta: !document.getElementById('gioca').classList.contains('hidden'),
    accese: [...document.querySelectorAll('.ment')].filter(b => b.classList.contains('sel')).map(b => b.textContent.trim().split(' ')[0]),
    indici: [...document.querySelectorAll('.ment')].filter(b => b.classList.contains('sel')).map(b => +b.dataset.m),
    salvato: window.__test.save.mentalita,
  }));
  dice(schermata.aperta, 'la schermata GIOCA e\' aperta');
  console.log('       la schermata GIOCA mostra selezionata: ' + JSON.stringify(schermata.accese) +
    '   SAVE.mentalita=' + schermata.salvato);
  dice(schermata.indici.length === 1 && schermata.indici[0] === schermata.salvato,
    'LA PASTIGLIA ACCESA DICE QUELLO CHE IL SALVATAGGIO PORTA',
    'accesa ' + JSON.stringify(schermata.indici) + ', salvato ' + schermata.salvato);

  /* 1 GIOCATORE: la partita che parte davvero */
  await pag.click('#btn1p', { force: true });
  await pag.waitForTimeout(400);
  const inCampo = await pag.evaluate(() => window.__test.mentalita);
  console.log('       la partita che parte gioca con: ' + NOMI[inCampo[0]] + '   G.ment=[' + inCampo.join(',') + ']');
  dice(inCampo[0] === schermata.salvato,
    'e la partita gioca la mentalita\' che il salvataggio porta',
    NOMI[inCampo[0]] + ' contro il salvato ' + NOMI[schermata.salvato]);
  dice(inCampo[0] === schermata.indici[0],
    'IL CAMPO GIOCA QUELLO CHE LA SCHERMATA DICHIARAVA',
    'schermata ' + NOMI[schermata.indici[0]] + ', campo ' + NOMI[inCampo[0]]);

  dice(eccezioni.length === 0, 'nessuna eccezione di pagina', eccezioni[0] || '');

  await browser.close(); srv.chiudi();
  console.log('\n' + (passati + falliti) + ' controlli, ' + passati + ' passati, ' + falliti + ' falliti');
  process.exit(falliti ? 1 : 0);
})().catch(e => { console.error('FALLITO: ' + e.message); process.exit(1); });
