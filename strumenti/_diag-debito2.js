/* seconda passata: la HOME stretta (quante righe prende la guida), la
   barra dei bottoni di GIOCA, l'aria dei gradini, e l'eccedenza con e
   senza la regola dei 860 px. Tutto misurato, niente stimato. */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const prova = arg('gioco', '') ? path.resolve(RADICE, arg('gioco', '')) : '';

function servi() {
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

const apri = async (br, w, h, srv) => {
  const ctx = await br.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true });
  const pg = await ctx.newPage();
  await pg.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pg.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pg.evaluate(() => window.__test.dismissSplash());
  await pg.evaluate(() => document.fonts.ready);
  await pg.waitForTimeout(250);
  return { ctx, pg };
};

(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  console.log('gioco: ' + (prova || 'CALCETTO-il-gioco.html (repo)'));

  console.log('\n=== 1. LA HOME: quante righe prende la guida, e dove finisce NEGOZIO ===');
  for (const [w, h] of [[568,320],[640,360],[740,360],[811,384],[915,412]]) {
    const { ctx, pg } = await apri(br, w, h, srv);
    const r = await pg.evaluate(() => {
      const g = document.querySelector('#menu .menu-voci');
      const cs = getComputedStyle(g);
      const voci = [...document.querySelectorAll('#menu .voce')];
      const righe = new Set(voci.map(v => Math.round(v.getBoundingClientRect().top)));
      return {
        colonne: cs.gridTemplateColumns.split(' ').length, tmpl: cs.gridTemplateColumns,
        quante: voci.length, righe: righe.size,
        voci: voci.map(v => {
          const b = v.getBoundingClientRect();
          const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
          const el = document.elementFromPoint(cx, cy);
          return { t: (v.textContent||'').trim().split('\n')[0].slice(0,11),
                   x: Math.round(b.left)+'..'+Math.round(b.right), y: Math.round(b.top)+'..'+Math.round(b.bottom),
                   dentro: cx >= 0 && cx <= innerWidth && cy >= 0 && cy <= innerHeight,
                   colpo: el ? (el.id || (typeof el.className === 'string' ? el.className.split(' ')[0] : el.tagName)) : 'null',
                   suo: !!(el && (el === v || v.contains(el))) };
        }),
      };
    });
    console.log(`\n  ${w}x${h}: ${r.quante} voci, ${r.colonne} colonne, ${r.righe} riga/righe   [${r.tmpl}]`);
    for (const v of r.voci) console.log(`     ${v.t.padEnd(12)} x ${v.x.padEnd(11)} y ${v.y.padEnd(11)} ${v.dentro?'sullo schermo':'FUORI       '}  colpo -> ${v.suo ? 'suo' : 'RUBATO da ' + v.colpo}`);
    await ctx.close();
  }

  console.log('\n=== 2. LA BARRA DEI BOTTONI DI GIOCA e l\'aria dei gradini ===');
  for (const [w, h] of [[915,412],[812,375],[740,360],[640,360],[568,320],[1024,600]]) {
    const { ctx, pg } = await apri(br, w, h, srv);
    const r = await pg.evaluate(() => {
      const g = document.getElementById('gioca');
      if (typeof goScreen === 'function') goScreen(g);
      return new Promise(res => requestAnimationFrame(() => requestAnimationFrame(() => {
        const az = document.querySelector('#gioca .azioni');
        const b = document.querySelector('#gioca .btnA');
        const bt = [...document.querySelectorAll('#gioca .btnA')];
        const righe = new Set(bt.map(x => Math.round(x.getBoundingClientRect().top)));
        const pad = s => { const e = document.querySelector(s); return e ? getComputedStyle(e).padding : '-'; };
        res({ azH: Math.round(az.getBoundingClientRect().height),
              btnH: b ? +b.getBoundingClientRect().height.toFixed(1) : null,
              btnRighe: righe.size,
              padDiff: pad('#gioca .diff'), padTaglia: pad('#gioca .taglia'), padMent: pad('#gioca .ment'),
              smallMent: (() => { const s = document.querySelector('#gioca .ment small'); return s ? getComputedStyle(s).display + ' h' + Math.round(s.getBoundingClientRect().height) : 'assente'; })(),
              boxW: Math.round(document.querySelector('#gioca .box').getBoundingClientRect().width),
              fraseRighe: (() => { const f = document.querySelector('#gioca .frase.stretta'); if (!f) return '-';
                 const lh = parseFloat(getComputedStyle(f).lineHeight) || 16;
                 return Math.round((f.getBoundingClientRect().height - parseFloat(getComputedStyle(f).paddingTop) - parseFloat(getComputedStyle(f).paddingBottom)) / lh); })(),
              ecc: g.scrollHeight - g.clientHeight });
      })));
    });
    console.log(`  ${(w+'x'+h).padEnd(9)} barra h ${String(r.azH).padStart(4)} (${r.btnRighe} riga/e), btnA h ${r.btnH}, box w ${r.boxW}, citazione ${r.fraseRighe} riga/e, ecced ${r.ecc}`);
    console.log(`            padding  .diff ${r.padDiff}  .taglia ${r.padTaglia}  .ment ${r.padMent}   small della MENTALITA': ${r.smallMent}`);
    await ctx.close();
  }

  console.log('\n=== 3. QUANTO VALE LA REGOLA DEI 860 px (citazione su una riga sola) ===');
  for (const [w, h] of [[915,412],[811,384],[812,375]]) {
    const { ctx, pg } = await apri(br, w, h, srv);
    const r = await pg.evaluate(() => {
      const g = document.getElementById('gioca');
      if (typeof goScreen === 'function') goScreen(g);
      return new Promise(res => setTimeout(() => {
        const con = g.scrollHeight - g.clientHeight;
        /* si spegne la regola: il box torna a 640 */
        const s = document.createElement('style');
        s.textContent = '@media (max-height:540px) and (min-width:700px){#gioca .box{max-width:min(94vw,640px)}#gioca .frase.stretta{max-width:min(94vw,640px)}}';
        document.head.appendChild(s);
        setTimeout(() => res({ con, senza: g.scrollHeight - g.clientHeight }), 120);
      }, 150));
    });
    console.log(`  ${w}x${h}: eccedenza con la regola ${r.con} px, senza ${r.senza} px  -> vale ${r.senza - r.con} px  (soglia chevron 28)`);
    await ctx.close();
  }

  await br.close(); srv.chiudi();
})();
