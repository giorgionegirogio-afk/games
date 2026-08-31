/* =====================================================================
   DIAG-TITOLO2 — il marchio misurato CON IL CARATTERE DEL TELEFONO.

   Il OnePlus 6 non ha ne' Archivo Black ne' Arial Black: in
   /system/fonts ci sono solo le dodici Roboto (verificato il 28 agosto
   2026 con `adb shell ls /system/fonts`). Il <text> del marchio chiede
   'Archivo Black','Arial Black',sans-serif e sul telefono cade su
   Roboto — che e' PIU' STRETTO. Il cerchio che fa la O finale invece e'
   inchiodato a cx=561: se il testo si accorcia, la O si stacca dalla
   parola e si legge «CALCETT» piu' un bollino.

   Questo banco riproduce la resa del telefono in Chromium: carica le
   Roboto PRESE DAL TELEFONO (adb pull) come @font-face e rimisura.

   uso: node strumenti/_diag-titolo2.js --gioco fuori/titolo.html
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

function b64(f) { return fs.readFileSync(f).toString('base64'); }

function servi() {
  return new Promise(ok => {
    const s = http.createServer((rq, rs) => {
      const u = decodeURIComponent(rq.url.split('?')[0]);
      const f = ridirigi(path.join(RADICE, u === '/' ? 'index.html' : u));
      fs.readFile(f, (e, d) => {
        if (e) { rs.writeHead(404); rs.end('no'); return; }
        const t = f.endsWith('.html') ? 'text/html' : f.endsWith('.js') ? 'text/javascript' : 'application/octet-stream';
        rs.writeHead(200, { 'Content-Type': t + '; charset=utf-8', 'Cache-Control': 'no-store' });
        rs.end(d);
      });
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

(async () => {
  const reg = path.join(DIRFONT, 'Roboto-Regular.ttf');
  const bla = path.join(DIRFONT, 'Roboto-Black.ttf');
  if (!fs.existsSync(reg)) { console.error('PROVA NULLA: mancano le Roboto del telefono in ' + DIRFONT); process.exit(3); }

  const srv = await servi();
  const br = await chromium.launch();
  const pg = await br.newPage({ viewport: { width: 845, height: 402 } });
  await pg.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html?t=${Date.now()}`, { waitUntil: 'load' });
  await pg.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pg.evaluate(() => window.__test.dismissSplash());
  await pg.waitForTimeout(500);

  const misura = () => pg.evaluate(() => {
    const o = {};
    for (const sel of ['#lgShape text', '#gLogoCal text']) {
      const t = document.querySelector(sel);
      if (!t) { o[sel] = null; continue; }
      o[sel] = {
        len: +t.getComputedTextLength().toFixed(1),
        fam: getComputedStyle(t).fontFamily,
        peso: getComputedStyle(t).fontWeight,
        bbox: (() => { const b = t.getBBox(); return [+b.x.toFixed(1), +b.width.toFixed(1)]; })(),
      };
    }
    return o;
  });

  console.log('\n=== IL MARCHIO, LARGHEZZA VERA DEL LETTERING ===');
  console.log('    (la O e\' un cerchio inchiodato: cx=561 r=38 stroke 20 -> occupa 523..609;');
  console.log('     perche\' faccia da O il testo deve finire attorno a 510)\n');

  let d = await misura();
  console.log('  1) come rende QUESTO PC (Arial Black installata):');
  for (const k in d) console.log(`       ${k.padEnd(16)} larghezza ${d[k].len}  bbox x=${d[k].bbox[0]} w=${d[k].bbox[1]}  [${d[k].fam}] peso ${d[k].peso}`);

  /* ---- le Roboto DEL TELEFONO, montate al posto della cascata ---- */
  const css = `
    @font-face{font-family:TelSans;font-weight:400;src:url(data:font/ttf;base64,${b64(reg)}) format('truetype')}
    @font-face{font-family:TelSans;font-weight:900;src:url(data:font/ttf;base64,${b64(bla)}) format('truetype')}
  `;
  await pg.addStyleTag({ content: css });
  await pg.evaluate(() => document.fonts.ready);
  await pg.waitForTimeout(300);

  for (const peso of ['400', '900']) {
    await pg.evaluate(p => {
      let s = document.getElementById('__sostituto');
      if (!s) { s = document.createElement('style'); s.id = '__sostituto'; document.head.appendChild(s); }
      s.textContent = `#lgShape text,#gLogoCal text{font-family:TelSans !important;font-weight:${p} !important}`;
    }, peso);
    await pg.waitForTimeout(250);
    d = await misura();
    console.log(`\n  2) come rende IL TELEFONO — Roboto peso ${peso} (${peso === '400' ? 'quello che tocca oggi: il <text> non dichiara peso' : 'se il marchio chiedesse il nero'}):`);
    for (const k in d) {
      const dist = 523 - (d[k].bbox[0] + d[k].bbox[1]);
      console.log(`       ${k.padEnd(16)} larghezza ${d[k].len}  bbox x=${d[k].bbox[0]} w=${d[k].bbox[1]}` +
        `   -> fra l'ultima T e la O restano ${dist.toFixed(1)} unita' di vuoto`);
    }
  }

  await br.close(); srv.chiudi();
})();
