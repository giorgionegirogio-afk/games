/* misura la disposizione: file di bottoni (scarto e sbilancio) e i vuoti
   verticali dentro la schermata.
   uso: node strumenti/_diag-griglia.js <file.html> [larg] [alt] [schermo...] */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const PROVA = path.resolve(process.argv[2]);
const W = +(process.argv[3] || 915), H = +(process.argv[4] || 412);
const SOLO = process.argv.slice(5);

function servi() {
  return new Promise(ok => {
    const s = http.createServer((rq, rs) => {
      let f = path.join(RADICE, decodeURIComponent(rq.url.split('?')[0]));
      if (/CALCETTO-il-gioco\.html$/i.test(f)) f = PROVA;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { rs.writeHead(404); rs.end(); return; }
      rs.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(rs);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

const SONDA = fs.readFileSync(path.join(__dirname, '_sonda-disposizione.js'), 'utf8');

(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: W, height: H }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pg = await ctx.newPage();
  await pg.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html?t=${Date.now()}`, { waitUntil: 'load' });
  await pg.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pg.evaluate(() => document.fonts.ready);
  await pg.evaluate(() => window.__test.dismissSplash());
  await pg.waitForTimeout(400);
  const car = await pg.evaluate(() => {
    const c = document.createElement('canvas').getContext('2d');
    c.font = "700 100px 'Barlow Condensed'"; const b = c.measureText('CALCETTO').width;
    c.font = "400 100px 'Archivo Black'"; const a = c.measureText('CALCETTO').width;
    c.font = "400 100px serif"; const s = c.measureText('CALCETTO').width;
    return { barlow7: +b.toFixed(1), archivo: +a.toFixed(1), serif: +s.toFixed(1) };
  });
  console.log(`FILE ${path.basename(PROVA)}  ${W}x${H}`);
  console.log(`  carattere: Barlow700 "CALCETTO" ${car.barlow7}  Archivo ${car.archivo}  (serif ${car.serif})`);
  await pg.evaluate(() => {
    for (const n of ['buildRosaUI', 'buildStagioneUI', 'buildTorneoUI', 'buildCampiUI', 'buildNegozioUI',
      'buildKitGrid', 'buildTrofeiUI', 'buildStatsUI', 'refreshImpostUI', 'montaEroi', 'montaCoppe'])
    { try { if (typeof window[n] === 'function') window[n](); } catch (e) {} }
  });
  const schermi = await pg.evaluate(() => [...document.querySelectorAll('.ov')].map(e => e.id).filter(Boolean));
  for (const id of (SOLO.length ? SOLO : schermi)) {
    await pg.evaluate(i => {
      const el = document.getElementById(i); if (!el) return;
      /* si spengono TUTTE prima di accenderne una: goScreen non governa le
         sovrapposte (.trasp), e PAUSA — prima .ov del documento — restava
         accesa sopra tutte le altre. Vedi disposizione.js, stessa riga. */
      document.querySelectorAll('.ov').forEach(o => o.classList.add('hidden'));
      if (typeof goScreen === 'function' && !el.classList.contains('trasp')) goScreen(el);
      else el.classList.remove('hidden');
      window.__sondaOv = i;
    }, id);
    await pg.waitForTimeout(200);
    const m = await pg.evaluate(SONDA);
    if (!m) { console.log(`  ${id}: nessuna .ov visibile`); continue; }
    console.log(`\n  --- ${m.id} ---  scorre ${m.scorre} (${m.sh}/${m.ch})  classi «${m.classi}»`);
    for (const f of m.file) {
      console.log(`    [${f.via}] ${f.display}${f.colonne ? ' colonne=' + f.colonne : ''} largo ${f.w}  allinea ${f.giustifica}`);
      for (const r of f.righe) {
        console.log(`      riga ${r.n}: ${r.bottoni.length} voci  larghezze ${r.larghezze.join('/')}` +
          `  SCARTO ${r.scarto}  sx ${r.sx} dx ${r.dx} SBILANCIO ${r.sbilancio} (${r.sbilancioPc}% del contenitore)`);
        console.log(`         ` + r.bottoni.map(b => `«${b.t}»`).join(' '));
      }
    }
    console.log(`    BANDE (y, dentro lo schermo alto ${m.vh}):`);
    for (const b of m.bande) console.log(`      ${String(b.a).padStart(6)} .. ${String(b.b).padStart(6)}   ${b.chi}`);
    for (const v of m.vuoti) console.log(`      VUOTO ${v.px} px fra ${v.a} e ${v.b}  = ${v.pc}% dello schermo`);
    console.log(`    vuoto piu' grande ${m.vuotoMax} px (${m.vuotoMaxPc}%), vuoto in coda ${m.coda} px (${m.codaPc}%)`);
  }
  await br.close(); srv.chiudi();
})().catch(e => { console.error('ESPLOSO: ' + e.stack); process.exit(2); });
