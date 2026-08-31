/* =====================================================================
   _zz-det-bisez.js — QUALE STATO SOPRAVVISSUTO ROMPE LA PROVA A.

   La prova A di _q-determinismo.js gioca due volte lo stesso seme sulla
   STESSA pagina. La prova B, che usa due pagine, e' verde: quindi il
   gioco e' deterministico e cio' che rompe la A e' STATO CHE SOPRAVVIVE
   fra una partita e l'altra. strumenti/_zz-caccia-stato.js lo elenca;
   questo lo BISEZIONA, azzerando un gruppo alla volta prima di
   startMatch e guardando se le due partite tornano identiche.

   uso: node strumenti/_zz-det-bisez.js --gioco fuori/x.html
        [--semi 20260803,20260806,20260808,20260810]
   ===================================================================== */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const provaRel = arg('gioco', '');
const SEMI = arg('semi', '20260803,20260806,20260808,20260810').split(',').map(Number);

function servi(prova) {
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
const IMPRONTA = `(() => {
  const b=G.ball;
  let s = [Math.round(b.x*100), Math.round(b.y*100), Math.round((b.z||0)*100),
           Math.round(b.vx*100), Math.round(b.vy*100), b.owner, b.lastTouch,
           G.score[0], G.score[1], Math.round(G.timeLeft*100)];
  for(const p of G.players) s.push(Math.round(p.x*100), Math.round(p.y*100), p.out|0);
  return s.join(',');
})()`;

/* i gruppi che si provano, dal piu' innocuo al piu' invasivo */
const GRUPPI = {
  'niente': '',
  'soloRec': 'G.rec.length=0;',
  'soloRecT': 'G.recT=0;',
  'rec+recT': 'G.rec.length=0; G.recT=0;',
};

(async () => {
  const prova = provaRel ? path.resolve(RADICE, provaRel) : '';
  const srv = await servi(prova);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push(e.message));
  await pag.addInitScript(s0 => {
    let s = s0 >>> 0 || 1;
    const pr = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => pr() / 4294967296;
    window.__caso = { semina(n) { s = n >>> 0 || 1; } };
  }, SEMI[0]);
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined');
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });

  const gioca = (seme, azzera) => pag.evaluate(([seme, azzera, IMPR]) => {
    const t = window.__test;
    window.__caso.semina(seme);
    if (azzera) (new Function(azzera))();
    t.startMatch(1, 1);
    t.setCpuVsCpu(true);
    const leggi = new Function('return ' + IMPR);
    const im = []; let sim = 0;
    while (t.state !== 'end' && sim < 600) { t.simulate(1); sim += 1; im.push(leggi()); }
    return im;
  }, [seme, azzera, IMPRONTA]);

  console.log('=== BISEZIONE — ' + (provaRel || 'gioco spedito') + ', semi ' + SEMI.join(' ') + ' ===');
  for (const [nome, codice] of Object.entries(GRUPPI)) {
    const rotti = [];
    for (const s of SEMI) {
      const u = await gioca(s, codice), d = await gioca(s, codice);
      let k = -1; const m = Math.min(u.length, d.length);
      for (let j = 0; j < m; j++) if (u[j] !== d[j]) { k = j; break; }
      if (k < 0 && u.length !== d.length) k = m;
      if (k >= 0) rotti.push(s + '@' + k);
    }
    console.log('  ' + nome.padEnd(10) + (rotti.length ? rotti.length + '/' + SEMI.length + ' rotte  ' + rotti.join(' ') : 'TUTTE IDENTICHE'));
  }
  if (errori.length) console.log('  eccezioni: ' + errori.slice(0, 3).join(' | '));
  await browser.close(); srv.chiudi();
})();
