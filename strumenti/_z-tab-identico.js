/* =====================================================================
   _z-tab-identico.js — LA CURA DEL TABELLONE NON TOCCA LA PARTITA
   (29 agosto 2026).

   La toppa _t-tabellone.js dichiara di essere solo disegno. Il conto
   statico di dado() lo dice gia' (86 prima, 86 dopo), ma un conto di
   chiamate scritte nel file non e' un conto di chiamate FATTE: basta un
   ramo che cambia perche' la stessa partita ne tiri un numero diverso.
   Qui si gioca la stessa partita sui due file e si confrontano, a fine
   corsa, il numero di sorteggi consumati, il pallone a sei decimali, il
   punteggio e la posizione di tutti gli uomini.

   uso:
     node strumenti/_z-tab-identico.js
     node strumenti/_z-tab-identico.js --a fuori/base.html --b fuori/cura.html
   esce 0 se le due partite sono la stessa, 1 se no.
   ===================================================================== */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const A = path.resolve(RADICE, arg('a', 'fuori/cmd-tabellone-base.html'));
const B = path.resolve(RADICE, arg('b', 'fuori/cmd-tabellone.html'));
const PASSI = +arg('passi', 1800);
const SEMI = arg('semi', '20260829,20260830,20260831').split(',').map(Number);
const TAGLIE = arg('taglie', '5,11').split(',').map(Number);

function servi(file) {
  return new Promise(ok => {
    const s = http.createServer((rq, rs) => {
      const u = decodeURIComponent(rq.url.split('?')[0]);
      let f = path.join(RADICE, u === '/' ? 'index.html' : u);
      if (/CALCETTO-il-gioco\.html$/i.test(f)) f = file;
      fs.readFile(f, (e, d) => {
        if (e) { rs.writeHead(404); rs.end('no'); return; }
        rs.writeHead(200, { 'Cache-Control': 'no-store' }); rs.end(d);
      });
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
const BANCO = () => {
  const PASSO = 1000 / 60; let t = 0, coda = [];
  window.requestAnimationFrame = cb => { coda.push(cb); return coda.length; };
  window.cancelAnimationFrame = () => {};
  try { performance.now = () => t; } catch (e) {}
  window.__banco = { passo(n) { for (let i = 0; i < (n | 0); i++) { const c = coda; coda = []; t += PASSO; for (const f of c) { try { f(t); } catch (e) {} } } return t; } };
};
const CORSA = `async (cfg) => {
  const t = window.__test, B = window.__banco, G = t.G;
  try { t.dismissSplash && t.dismissSplash(); } catch(e){}
  B.passo(4);
  t.semina(1);
  { let fermi=0;
    for (let giri=0; giri<20 && fermi<2; giri++){
      const a=t.sorteggi; await new Promise(r=>setTimeout(r,300));
      fermi = (t.sorteggi===a) ? fermi+1 : 0; } }
  t.semina(cfg.seme); t.setCpuVsCpu(true);
  const s0 = t.sorteggi;
  t.startMatch(1, 1, { size: cfg.taglia });
  for (let i=0;i<cfg.passi;i++) B.passo(1);
  return JSON.stringify({
    sorteggi: t.sorteggi - s0,
    palla: [+G.ball.x.toFixed(6), +G.ball.y.toFixed(6), +(G.ball.z||0).toFixed(6)],
    punti: [G.score[0], G.score[1]],
    stato: t.state,
    uomini: G.players.map(p=>[+p.x.toFixed(4), +p.y.toFixed(4)]),
  });
}`;

(async () => {
  const br = await chromium.launch();
  let male = 0;
  for (const taglia of TAGLIE) for (const seme of SEMI) {
    const out = [];
    for (const file of [A, B]) {
      const srv = await servi(file);
      const ctx = await br.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'it-IT' });
      await ctx.addInitScript(BANCO);
      const pag = await ctx.newPage();
      await pag.goto('http://127.0.0.1:' + srv.porta + '/CALCETTO-il-gioco.html', { waitUntil: 'load', timeout: 60000 });
      await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
      await pag.evaluate(() => document.fonts.ready);
      out.push(JSON.parse(await pag.evaluate(`(${CORSA})(${JSON.stringify({ seme, taglia, passi: PASSI })})`)));
      await ctx.close(); srv.chiudi();
    }
    const [a, b] = out;
    const ok = JSON.stringify(a) === JSON.stringify(b);
    if (!ok) male++;
    console.log('  ' + (ok ? ' ok  ' : ' NO  ') + taglia + 'v' + taglia + ' seme ' + seme
      + ' · sorteggi ' + a.sorteggi + '/' + b.sorteggi
      + ' · palla ' + JSON.stringify(a.palla) + (ok ? '' : ' contro ' + JSON.stringify(b.palla))
      + ' · punti ' + a.punti.join('-') + (ok ? '' : ' contro ' + b.punti.join('-')));
  }
  await br.close();
  console.log('\n' + (male ? 'ROSSO: ' + male + ' corse diverse.' : 'VERDE: stessa partita, stessi sorteggi, stessi uomini al sesto decimale.'));
  process.exit(male ? 1 : 0);
})();
