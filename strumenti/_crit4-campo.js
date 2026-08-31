/* =====================================================================
   _crit4-campo.js — SI SCEGLIE ANCORA IL CAMPO?

   Il gemello di _crit3-abbandona.js per la schermata AMICHEVOLE. Non
   guarda il DOM e non si fida della geometria: apre GIOCA come farebbe
   una persona (clic sul bottone del menu), poi mette UN DITO VERO
   (Touchscreen.tap) sul centro di OGNI voce delle quattro sezioni —
   DIFFICOLTA', ROSA, MENTALITA', CAMPO — e chiede al gioco se ha
   cambiato idea. Se il tocco non arriva, la pastiglia accesa resta
   quella di prima e qui si legge «non cambia».

   Il difetto per cui e' nato: la sezione CAMPO finiva sotto la barra
   «1 GIOCATORE / 2 GIOCATORI / INDIETRO». Il centro di CAMBIA CAMPO
   stava a y=341 su uno schermo alto 412 — dentro lo schermo, quindi
   l'occhio del collaudo diceva «c'e'» — ma il colpo lo prendeva la
   fascia adesiva. Un tocco secco sul centro non apriva niente.

   L'ULTIMO TOCCO E' SU INDIETRO, e non e' cortesia: e' l'unica prova
   che dopo aver toccato tutto il resto si esce ancora dalla schermata.

   uso: node strumenti/_crit4-campo.js --gioco fuori/campocop.html
        node strumenti/_crit4-campo.js --w 812 --h 375
   uscite: 0 tutto consegnato · 1 qualcosa non si tocca · 2 banco · 3 nulla
   ===================================================================== */
const http = require('http');
const fs = require('fs');
const path = require('path');

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

/* le voci da toccare, e come si vede che il tocco e' arrivato.
   «acceso» legge quale pastiglia porta la classe .sel: e' cio' che il
   giocatore VEDE, non una variabile interna, ed e' scritta dallo stesso
   gestore che salva la scelta. */
const VOCI = [
  { sez: 'DIFFICOLTA\'', sel: '.diff',  i: 0, eti: 'Facile' },
  { sez: 'DIFFICOLTA\'', sel: '.diff',  i: 2, eti: 'Duro' },
  { sez: 'ROSA',         sel: '.taglia', i: 1, eti: '7 contro 7' },
  { sez: 'ROSA',         sel: '.taglia', i: 2, eti: '11 contro 11' },
  { sez: 'MENTALITA\'',  sel: '.ment',  i: 0, eti: 'Difesa' },
  { sez: 'MENTALITA\'',  sel: '.ment',  i: 2, eti: 'Attacco' },
];

(async () => {
  let chromium;
  try { ({ chromium } = require('playwright')); }
  catch (e) { console.error('BANCO: playwright non c\'e\': ' + e.message); process.exit(2); }

  const prova = arg('gioco', process.env.GIOCO_PROVA || '');
  const provaAbs = prova ? path.resolve(prova) : '';
  if (provaAbs && !fs.existsSync(provaAbs)) { console.error('PROVA NULLA: non esiste ' + provaAbs); process.exit(3); }
  const W = +arg('w', 915), H = +arg('h', 412);

  const srv = await servi(provaAbs);
  let browser;
  try { browser = await chromium.launch(); }
  catch (e) { srv.chiudi(); console.error('BANCO: il browser non parte: ' + e.message); process.exit(2); }
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true });
  const pag = await ctx.newPage();
  const ecc = []; pag.on('pageerror', e => ecc.push(e.message));

  console.log('\n=== SI SCEGLIE ANCORA IL CAMPO? ===  ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)') + '   ' + W + 'x' + H);
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 25000 });
  await pag.evaluate(() => { const t = window.__test; if (t.dismissSplash) t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });

  /* si entra come una persona: dito sul GIOCA del menu */
  const gioca = await pag.evaluate(() => {
    const b = document.getElementById('btnGioca'), q = b.getBoundingClientRect();
    return { cx: Math.round(q.left + q.width / 2), cy: Math.round(q.top + q.height / 2) };
  });
  await pag.touchscreen.tap(gioca.cx, gioca.cy);
  await pag.waitForTimeout(300);
  const dentro = await pag.evaluate(() => !document.getElementById('gioca').classList.contains('hidden'));
  console.log('  tocco su GIOCA nel menu: ' + (dentro ? 'la schermata AMICHEVOLE si apre' : 'NON SI APRE'));
  if (!dentro) { console.error('PROVA NULLA: dal menu non si entra in AMICHEVOLE.'); await browser.close(); srv.chiudi(); process.exit(3); }

  const geo = await pag.evaluate(() => {
    const g = document.getElementById('gioca');
    return { scorre: g.scrollHeight - g.clientHeight, vh: innerHeight };
  });
  console.log('  la schermata ' + (geo.scorre > 0 ? 'scorre di ' + geo.scorre + ' px' : 'non scorre') +
    (geo.scorre > 28 ? '   (sopra i 28 px: il gioco accende il chevron)' : '') + ',  schermo alto ' + geo.vh);
  console.log('  NESSUNO SCORRIMENTO VIENE FATTO: si tocca dove la schermata si apre.\n');

  let male = 0, fatti = 0;
  for (const v of VOCI) {
    const p = await pag.evaluate(([sel, i]) => {
      const b = document.querySelectorAll('#gioca ' + sel)[i];
      if (!b) return null;
      const q = b.getBoundingClientRect();
      const cx = Math.round(q.left + q.width / 2), cy = Math.round(q.top + q.height / 2);
      const sopra = (cy > 0 && cy < innerHeight) ? document.elementFromPoint(cx, cy) : null;
      return { cx, cy, t: Math.round(q.top), b: Math.round(q.bottom), giaSel: b.classList.contains('sel'),
               chi: sopra ? (sopra.id || (sopra.getAttribute('class') || sopra.tagName)) : '-' };
    }, [v.sel, v.i]);
    if (!p) { console.log('  ' + v.sez.padEnd(12) + v.eti.padEnd(14) + 'la voce non esiste'); male++; continue; }
    fatti++;
    if (p.cy <= 0 || p.cy >= geo.vh) {
      console.log('  ' + v.sez.padEnd(12) + v.eti.padEnd(14) + 'y ' + p.t + '..' + p.b + '  IL CENTRO E\' FUORI DALLO SCHERMO: il tocco secco non e\' nemmeno possibile');
      male++; continue;
    }
    await pag.touchscreen.tap(p.cx, p.cy);
    await pag.waitForTimeout(180);
    const acceso = await pag.evaluate(([sel, i]) => document.querySelectorAll('#gioca ' + sel)[i].classList.contains('sel'), [v.sel, v.i]);
    const ok = acceso;
    if (!ok) male++;
    console.log('  ' + v.sez.padEnd(12) + v.eti.padEnd(14) + 'y ' + String(p.t).padStart(3) + '..' + String(p.b).padStart(3) +
      '  centro ' + String(p.cy).padStart(3) + '  -> ' + (ok ? 'ACCESA' : 'NON CAMBIA (il colpo va a ' + String(p.chi).slice(0, 26) + ')'));
  }

  /* CAMPO: l'unica voce che non accende una pastiglia — apre una schermata */
  const cc = await pag.evaluate(() => {
    const b = document.getElementById('btnCambiaCampo'), q = b.getBoundingClientRect();
    const cx = Math.round(q.left + q.width / 2), cy = Math.round(q.top + q.height / 2);
    const sopra = (cy > 0 && cy < innerHeight) ? document.elementFromPoint(cx, cy) : null;
    return { cx, cy, t: Math.round(q.top), b: Math.round(q.bottom),
             chi: sopra ? (sopra.id || (sopra.getAttribute('class') || sopra.tagName)) : '-' };
  });
  fatti++;
  let apre = false;
  if (cc.cy > 0 && cc.cy < geo.vh) {
    await pag.touchscreen.tap(cc.cx, cc.cy);
    await pag.waitForTimeout(320);
    apre = await pag.evaluate(() => !document.getElementById('campi').classList.contains('hidden'));
  }
  if (!apre) male++;
  console.log('  ' + 'CAMPO'.padEnd(12) + 'CAMBIA CAMPO'.padEnd(14) + 'y ' + String(cc.t).padStart(3) + '..' + String(cc.b).padStart(3) +
    '  centro ' + String(cc.cy).padStart(3) + '  -> ' + (apre ? 'SI APRE LA SCHERMATA CAMPI'
      : (cc.cy <= 0 || cc.cy >= geo.vh ? 'IL CENTRO E\' FUORI DALLO SCHERMO' : 'NON APRE NIENTE (il colpo va a ' + String(cc.chi).slice(0, 26) + ')')));

  /* SI TORNA IN AMICHEVOLE PRIMA DI PROVARE L'USCITA, e si torna con
     goScreen invece che col dito: il bottone di ritorno di CAMPI riporta
     allo SPOGLIATOIO, non ad AMICHEVOLE, e senza questa riga l'ultimo
     controllo misurava un #gioca nascosto (rettangolo tutto a zero,
     «centro 0») e dichiarava rosso un bottone che sta benissimo. Un
     cancello che accusa il gioco di un difetto del proprio percorso e'
     peggio di nessun cancello. */
  await pag.evaluate(() => { if (typeof goScreen === 'function') goScreen(document.getElementById('gioca')); });
  await pag.waitForTimeout(250);
  const ind = await pag.evaluate(() => {
    const b = document.getElementById('btnBackGioca'); if (!b) return null;
    const q = b.getBoundingClientRect();
    return { cx: Math.round(q.left + q.width / 2), cy: Math.round(q.top + q.height / 2) };
  });
  fatti++;
  let uscito = false;
  if (ind && ind.cy > 0 && ind.cy < geo.vh) {
    await pag.touchscreen.tap(ind.cx, ind.cy);
    await pag.waitForTimeout(320);
    uscito = await pag.evaluate(() => !document.getElementById('menu').classList.contains('hidden'));
  }
  if (!uscito) male++;
  console.log('  ' + 'USCITA'.padEnd(12) + 'INDIETRO'.padEnd(14) + (ind ? 'centro ' + String(ind.cy).padStart(3) : '—') +
    '           -> ' + (uscito ? 'SI TORNA AL MENU' : 'NON SI TORNA AL MENU'));

  console.log('\n  ' + (fatti - male) + ' tocchi consegnati su ' + fatti);
  if (ecc.length) console.log('  ECCEZIONI NELLA PAGINA: ' + ecc[0].slice(0, 90));
  await browser.close(); srv.chiudi();
  if (male) { console.log('  ROSSO: ' + male + ' voce' + (male > 1 ? 'i' : '') + ' della schermata AMICHEVOLE non riceve il dito.'); process.exit(1); }
  console.log('  VERDE: ogni voce di AMICHEVOLE riceve il tocco secco sul proprio centro, senza scorrere.');
  process.exit(0);
})().catch(e => { console.error('BANCO: ' + (e && e.stack ? e.stack : e)); process.exit(2); });
