/* =====================================================================
   DIAG-TITOLO3 — le tre cure possibili, guardate e misurate.

   IL FATTO (misurato il 28 agosto 2026, vedi _diag-titolo2):
   il marchio e' un <text> 'CALCETT' piu' un CERCHIO INCHIODATO a
   cx=561 che fa la O. Il testo chiede 'Archivo Black','Arial Black',
   sans-serif e la sua larghezza dipende da chi vince la cascata:
     Arial Black (Windows)  515 unita'  -> la O attacca: vuoto 8
     Roboto     (Android)   424 unita'  -> vuoto 99: la O si stacca
   Il carattere incorporato NON entra mai in gioco: i due woff2 in
   base64 sono i sottoinsiemi latin-ext/vietnamese e non contengono
   A-Z (verificato con fontTools: 'C' e 'A' non sono nella cmap).

   Le tre cure:
     1) textLength=515 lengthAdjust=spacingAndGlyphs — i glifi si
        allargano fino a 515 qualunque sia il carattere
     2) textLength=515 lengthAdjust=spacing — si allarga solo la
        spaziatura, i glifi restano intatti
     3) niente (com'e' oggi), per il confronto

   uso: node strumenti/_diag-titolo3.js --gioco fuori/titolo.html
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
function arg(n, d) {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
}
const GIOCO_FUORI = (() => {
  const v = arg('gioco', process.env.GIOCO_PROVA || '');
  if (!v) return '';
  const a = path.resolve(v);
  if (!fs.existsSync(a)) { console.error('PROVA NULLA: ' + a); process.exit(3); }
  return a;
})();
const ridirigi = f => (GIOCO_FUORI && /CALCETTO-il-gioco\.html$/i.test(f)) ? GIOCO_FUORI : f;
const DIRFONT = arg('font', path.join(process.env.LOCALAPPDATA || '', 'Temp/claude/C--Users-Utenteee-Desktop-GitHub-games/9c10461c-e096-467c-8590-bb634480cc69/scratchpad/font'));
const FUORI = arg('out', path.join(RADICE, 'fuori', 'titolo-scatti'));
fs.mkdirSync(FUORI, { recursive: true });
const b64 = f => fs.readFileSync(f).toString('base64');

function servi() {
  return new Promise(ok => {
    const s = http.createServer((rq, rs) => {
      const u = decodeURIComponent(rq.url.split('?')[0]);
      const f = ridirigi(path.join(RADICE, u === '/' ? 'index.html' : u));
      fs.readFile(f, (e, d) => {
        if (e) { rs.writeHead(404); rs.end('no'); return; }
        const t = f.endsWith('.html') ? 'text/html' : 'application/octet-stream';
        rs.writeHead(200, { 'Content-Type': t + '; charset=utf-8', 'Cache-Control': 'no-store' });
        rs.end(d);
      });
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  const pg = await br.newPage({ viewport: { width: 845, height: 402 }, deviceScaleFactor: 2 });
  await pg.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html?t=${Date.now()}`, { waitUntil: 'load' });
  await pg.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pg.evaluate(() => window.__test.dismissSplash());
  await pg.waitForTimeout(600);

  await pg.addStyleTag({
    content: `@font-face{font-family:TelSans;font-weight:400;src:url(data:font/ttf;base64,${b64(path.join(DIRFONT, 'Roboto-Regular.ttf'))}) format('truetype')}
              @font-face{font-family:TelSans;font-weight:900;src:url(data:font/ttf;base64,${b64(path.join(DIRFONT, 'Roboto-Black.ttf'))}) format('truetype')}`
  });
  /* IL CARICAMENTO SI ASPETTA DAVVERO. Alla prima stesura questo banco
     misurava subito dopo addStyleTag e leggeva 450/483 invece di
     424/434: erano numeri presi mentre il carattere non era ancora
     montato, cioe' numeri di nessuno. */
  await pg.evaluate(async () => { await document.fonts.load('400 100px TelSans'); await document.fonts.load('900 100px TelSans'); await document.fonts.ready; });
  await pg.waitForTimeout(300);

  const assetta = (fam, peso, tl, modo) => pg.evaluate(o => {
    let s = document.getElementById('__probe');
    if (!s) { s = document.createElement('style'); s.id = '__probe'; document.head.appendChild(s); }
    s.textContent = (o.fam ? `#lgShape text,#gLogoCal text{font-family:${o.fam} !important;font-weight:${o.peso} !important}` : '');
    for (const t of document.querySelectorAll('#lgShape text,#gLogoCal text')) {
      if (o.tl) { t.setAttribute('textLength', String(o.tl)); t.setAttribute('lengthAdjust', o.modo); }
      else { t.removeAttribute('textLength'); t.removeAttribute('lengthAdjust'); }
    }
    const t = document.querySelector('#lgShape text');
    const b = t.getBBox();
    return { len: +t.getComputedTextLength().toFixed(1), fine: +(b.x + b.width).toFixed(1) };
  }, { fam, peso, tl, modo });

  const casi = [
    { et: 'pc-oggi', fam: null, peso: 400, tl: 0, modo: '' },
    { et: 'pc-cura-glifi', fam: null, peso: 400, tl: 515, modo: 'spacingAndGlyphs' },
    { et: 'pc-cura-spazi', fam: null, peso: 400, tl: 515, modo: 'spacing' },
    { et: 'tel-oggi', fam: 'TelSans', peso: 400, tl: 0, modo: '' },
    { et: 'tel-cura-glifi', fam: 'TelSans', peso: 400, tl: 515, modo: 'spacingAndGlyphs' },
    { et: 'tel-cura-spazi', fam: 'TelSans', peso: 400, tl: 515, modo: 'spacing' },
    { et: 'tel-cura-glifi-nero', fam: 'TelSans', peso: 900, tl: 515, modo: 'spacingAndGlyphs' },
  ];
  console.log('\n=== IL LETTERING: larghezza e vuoto prima della O (la O comincia a 523) ===\n');
  for (const c of casi) {
    const m = await assetta(c.fam, c.peso, c.tl, c.modo);
    await pg.waitForTimeout(150);
    const el = await pg.$('#menu .logo-cal');
    await el.screenshot({ path: path.join(FUORI, c.et + '.png') });
    console.log(`  ${c.et.padEnd(20)} larghezza ${String(m.len).padStart(6)}   vuoto prima della O ${(523 - m.fine).toFixed(1).padStart(6)}   -> ${c.et}.png`);
  }
  await br.close(); srv.chiudi();
  console.log('\n  fotografie in ' + FUORI + '\n');
})();
