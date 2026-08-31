/* =====================================================================
   DIAG-TITOLO4 — il prima e il dopo, affiancati e misurati.

   Apre DUE file (--prima e --dopo), a piu' formati, con il carattere di
   questo PC e con quello del telefono (le Roboto prese con adb pull), e
   per ognuno:
     - misura l'ingombro del lettering e il vuoto che resta prima della O
     - misura la riga «DOPOLAVORO FC · ...» e quante righe occupa
     - fotografa il tabellone intero
   e in coda dice se le due fotografie del PC sono IDENTICHE AL BIT
   (devono esserlo: la cura vale 515->515 dove Arial Black esiste).

   uso: node strumenti/_diag-titolo4.js --prima CALCETTO-il-gioco.html
                                        --dopo  fuori/titolo.html
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const PRIMA = path.resolve(RADICE, arg('prima', 'CALCETTO-il-gioco.html'));
const DOPO = path.resolve(RADICE, arg('dopo', 'fuori/titolo.html'));
const DIRFONT = arg('font', path.join(process.env.LOCALAPPDATA || '', 'Temp/claude/C--Users-Utenteee-Desktop-GitHub-games/9c10461c-e096-467c-8590-bb634480cc69/scratchpad/font'));
const FUORI = arg('out', path.join(RADICE, 'fuori', 'titolo-scatti'));
fs.mkdirSync(FUORI, { recursive: true });
const b64 = f => fs.readFileSync(f).toString('base64');

let BERSAGLIO = PRIMA;
function servi() {
  return new Promise(ok => {
    const s = http.createServer((rq, rs) => {
      const u = decodeURIComponent(rq.url.split('?')[0]);
      const f = /CALCETTO-il-gioco\.html$/i.test(u) ? BERSAGLIO : path.join(RADICE, u);
      fs.readFile(f, (e, d) => {
        if (e) { rs.writeHead(404); rs.end('no'); return; }
        rs.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
        rs.end(d);
      });
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

const TAGLIE = [
  { n: '2280x1080@2.69 (OnePlus 6 oriz)', w: 845, h: 402 },
  { n: '915x412', w: 915, h: 412 },
  { n: '812x375', w: 812, h: 375 },
  { n: '740x360', w: 740, h: 360 },
  { n: '412x915 vert', w: 412, h: 915 },
  { n: '360x640 vert corto', w: 360, h: 640 },
  { n: '1440x900', w: 1440, h: 900 },
];

(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  const impronte = {};
  for (const quale of ['prima', 'dopo']) {
    BERSAGLIO = quale === 'prima' ? PRIMA : DOPO;
    console.log(`\n=== ${quale.toUpperCase()}  (${path.basename(BERSAGLIO)}) ===`);
    console.log('  formato                          carattere  lettering  vuoto-O   riga-kick/riquadro  righe');
    for (const t of TAGLIE) {
      for (const car of ['PC', 'TEL']) {
        const pg = await br.newPage({ viewport: { width: t.w, height: t.h }, deviceScaleFactor: 2 });
        await pg.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html?t=${Date.now()}`, { waitUntil: 'load' });
        await pg.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
        await pg.evaluate(() => window.__test.dismissSplash());
        await pg.waitForTimeout(400);
        if (car === 'TEL') {
          /* IL TELEFONO SIMULATO: si tolgono dalla cascata i caratteri
             che il OnePlus 6 non ha (Archivo Black e' incorporato ma
             senza le lettere A-Z; Arial Black, Arial Narrow, Segoe UI
             non esistono su Android) e si mette al loro posto Roboto,
             preso dal telefono con adb pull. */
          await pg.addStyleTag({
            content: `@font-face{font-family:TelSans;font-weight:400;src:url(data:font/ttf;base64,${b64(path.join(DIRFONT, 'Roboto-Regular.ttf'))}) format('truetype')}
                      @font-face{font-family:TelSans;font-weight:900;src:url(data:font/ttf;base64,${b64(path.join(DIRFONT, 'Roboto-Black.ttf'))}) format('truetype')}
                      #lgShape text,#gLogoCal text,.tab-kick,.tab-targa,.tab-sotto{font-family:TelSans !important}`
          });
          await pg.evaluate(async () => { await document.fonts.load('400 100px TelSans'); await document.fonts.load('900 100px TelSans'); await document.fonts.ready; });
          await pg.waitForTimeout(250);
        }
        const d = await pg.evaluate(() => {
          const t2 = document.querySelector('#lgShape text');
          const b = t2.getBBox();
          const k = document.querySelector('#menu .tab-kick');
          const tin = document.querySelector('#menu .tab-in');
          return {
            len: +t2.getComputedTextLength().toFixed(1),
            fine: +(b.x + b.width).toFixed(1),
            kw: k.scrollWidth, kc: Math.round(tin.getBoundingClientRect().width),
            righe: Math.round(k.getBoundingClientRect().height / parseFloat(getComputedStyle(k).lineHeight)),
          };
        });
        const nome = `${quale}-${car}-${t.w}x${t.h}.png`;
        const el = await pg.$('#menu .tabellone');
        const buf = await el.screenshot({ path: path.join(FUORI, nome) });
        impronte[`${car}-${t.w}x${t.h}-${quale}`] = crypto.createHash('sha1').update(buf).digest('hex').slice(0, 12);
        const male = (d.righe > 1 ? ' A CAPO' : '') + ((523 - d.fine) > 40 ? '  O STACCATA' : '') + (d.kw > d.kc ? ' SFORA' : '');
        console.log(`  ${t.n.padEnd(32)} ${car.padEnd(9)} ${String(d.len).padStart(6)}   ${(523 - d.fine).toFixed(1).padStart(6)}   ` +
          `${String(d.kw).padStart(5)}/${String(d.kc).padEnd(5)}      ${d.righe}${male}`);
        await pg.close();
      }
    }
  }
  await br.close(); srv.chiudi();

  console.log('\n=== IL DESKTOP DEVE RESTARE IDENTICO AL BIT ===');
  let diverse = 0;
  for (const t of TAGLIE) {
    const a = impronte[`PC-${t.w}x${t.h}-prima`], b = impronte[`PC-${t.w}x${t.h}-dopo`];
    const uguale = a === b;
    if (!uguale) diverse++;
    console.log(`  ${t.n.padEnd(32)} ${a} ${uguale ? '==' : '!='} ${b}${uguale ? '' : '   DIVERSO'}`);
  }
  console.log(diverse ? `\n  ${diverse} formati cambiati sul PC (la riga del kick cambia corpo: atteso).` : '\n  identiche tutte.');
  console.log('\n  fotografie in ' + FUORI + '\n');
})();
