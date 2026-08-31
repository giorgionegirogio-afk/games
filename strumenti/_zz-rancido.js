/* =====================================================================
   _zz-rancido.js — QUANTO E' RANCIDO b.passTo QUANDO IL RAMO NUOVO LO LEGGE.

   kickBall azzera b.crossTo ("un destinatario dimenticato manderebbe un
   uomo sotto un pallone che non e' piu' il suo") e NON azzera b.passTo.
   Questa sonda conta, sui fotogrammi in cui la condizione del gruppo A
   e' vera (b.owner<0 && b.z<=0 && b.passTo>=0):
     tot        fotogrammi in cui il ramo scatta
     avversario l'ultimo tocco e' di un AVVERSARIO del destinatario
     viaVia     il pallone si allontana dal destinatario (prodotto scalare)
     lento      il pallone e' praticamente fermo (|v| < 40)
   uso: node _zz-rancido.js --taglia 11 --partite 12 --gioco fuori/spazio.html
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = 'C:/Users/Utenteee/Desktop/GitHub/games';
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};

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

const SONDA = `(() => {
  if (window.__rn) return 'gia';
  const S = {};
  const azzera = () => { S.f=0; S.tot=0; S.avv=0; S.viaVia=0; S.lento=0; S.epis=0; S.episRanc=0; S._r=false; };
  azzera();
  const _step = window.step;
  window.step = function(){
    _step.apply(this, arguments);
    if(!(G.scene==='play'||G.scene==='golden')) return;
    const b=G.ball; S.f++;
    if(!(b.owner<0 && b.z<=0 && b.passTo>=0)){ S._r=false; return; }
    const q=G.players[b.passTo];
    if(!q) return;
    S.tot++;
    const lt = b.lastTouch>=0 ? G.players[b.lastTouch] : null;
    const avv = !!(lt && lt.team!==q.team);
    const dx=q.x-b.x, dy=q.y-b.y;
    const dot = b.vx*dx + b.vy*dy;
    const sp = Math.hypot(b.vx,b.vy);
    if(avv) S.avv++;
    if(dot<0) S.viaVia++;
    if(sp<40) S.lento++;
    const ranc = avv || (dot<0 && sp>=40);
    if(ranc && !S._r){ S.episRanc++; }
    S._r = ranc;
  };
  window.__rn = { azzera, leggi(){ return Object.assign({}, S); } };
  return 'ok';
})()`;

(async () => {
  const partite = +arg('partite', 12);
  const seme = +arg('seme', 20260803);
  const taglia = +arg('taglia', 11);
  const gioco = arg('gioco', '');
  const prova = gioco ? path.resolve(RADICE, gioco) : null;
  const srv = await servi(prova);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const err = [];
  pag.on('pageerror', e => err.push(e.message));
  await pag.addInitScript(s0 => {
    let s = s0 >>> 0 || 1;
    const pr = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => pr() / 4294967296;
    window.__caso = { semina(n) { s = n >>> 0 || 1; } };
  }, seme);
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
  const inst = await pag.evaluate(SONDA);
  if (inst !== 'ok') throw new Error('sonda ' + inst);
  const R = [];
  for (let i = 0; i < partite; i++) {
    R.push(await pag.evaluate(([sm, tg]) => {
      const t = window.__test;
      window.__caso.semina(sm); window.__rn.azzera();
      t.startMatch(1, 1, tg !== 5 ? { size: tg } : undefined);
      t.setCpuVsCpu(true);
      let sim = 0;
      while (t.state !== 'end' && sim < 900) { t.simulate(10); sim += 10; }
      return window.__rn.leggi();
    }, [(seme + i) >>> 0, taglia]));
  }
  await ctx.close(); await browser.close(); srv.chiudi();
  if (err.length) { console.error(err.join('\n')); process.exit(1); }
  const s = k => R.reduce((a, r) => a + r[k], 0);
  const F = s('f'), T = s('tot');
  console.log('=== RANCIDO — ' + partite + ' partite, taglia ' + taglia + (gioco ? ', ' + gioco : ', repo') + ' ===');
  console.log('  fotogrammi di gioco            ' + F);
  console.log('  il ramo A scatta               ' + T + '  (' + (T / F * 100).toFixed(2) + '% del gioco)');
  console.log('    ultimo tocco AVVERSARIO      ' + s('avv') + '  (' + (s('avv') / T * 100).toFixed(2) + '% di quelli)');
  console.log('    pallone che si ALLONTANA     ' + s('viaVia') + '  (' + (s('viaVia') / T * 100).toFixed(2) + '%)');
  console.log('    pallone quasi FERMO (<40)    ' + s('lento') + '  (' + (s('lento') / T * 100).toFixed(2) + '%)');
  console.log('  episodi rancidi (a partita)    ' + (s('episRanc') / partite).toFixed(1));
})();
