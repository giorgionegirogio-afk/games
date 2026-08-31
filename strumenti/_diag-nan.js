/* _diag-nan.js — chi diventa NaN, e a partire da quale grandezza.
   Un clamp non ferma un NaN: Math.max(24, NaN) e' NaN. Quindi un
   bersaglio «limitato al campo» puo' comunque portare un uomo fuori dal
   mondo, se il numero che arriva non e' un numero.
   uso: node strumenti/_diag-nan.js [--gioco f.html] [--partite 6] */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i+1] && !process.argv[i+1].startsWith('--') ? process.argv[i+1] : d; };
const provaRel = arg('gioco', ''), PARTITE = +arg('partite', 6), TAGLIA = +arg('taglia', 5);

function servi(prova) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (prova && /CALCETTO-il-gioco\.html$/i.test(f)) f = prova;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

(async () => {
  const srv = await servi(provaRel ? path.resolve(RADICE, provaRel) : '');
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport:{width:915,height:412}, isMobile:true, hasTouch:true, locale:'it-IT' });
  const pag = await ctx.newPage();
  const err = []; pag.on('pageerror', e => err.push(e.message));
  await pag.addInitScript(s0 => {
    let s = s0 >>> 0 || 1;
    const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => p() / 4294967296;
    window.__caso = { semina(n){ s = n >>> 0 || 1; } };
  }, 20260803);
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, {waitUntil:'load'});
  await pag.waitForFunction('window.__test !== undefined', null, {timeout:20000});
  await pag.evaluate(()=>{ window.requestAnimationFrame=()=>0; });
  await pag.waitForTimeout(200);
  await pag.evaluate(()=>{ const t=window.__test; t.dismissSplash&&t.dismissSplash(); if(t.save) t.save.tutorialDone=1; });

  const out = await pag.evaluate(([partite, taglia]) => {
    const t = window.__test;
    const trovati = [];
    const nn = v => typeof v === 'number' && !Number.isFinite(v);
    for (let g = 0; g < partite; g++) {
      window.__caso.semina(20260803 + g);
      t.startMatch(1, 1, taglia !== 5 ? { size: taglia } : undefined);
      t.setCpuVsCpu(true);
      for (let f = 0; f < 7000 && t.state !== 'end'; f++) {
        t.simulate(1/60);
        const b = G.ball;
        /* IL PALLONE PRIMA DI TUTTO: se e' lui a diventare NaN, tutto
           quello che lo insegue lo diventa un istante dopo, e accusare
           l'inseguitore sarebbe accusare la vittima. */
        for (const k of ['x','y','z','vx','vy','vz'])
          if (nn(b[k])) { trovati.push({ chi:'ball.'+k, partita:g, passo:f, scena:G.scene,
                                         stato:JSON.stringify({x:b.x,y:b.y,z:b.z,vx:b.vx,vy:b.vy,vz:b.vz,owner:b.owner,passTo:b.passTo}) }); f = 1e9; break; }
        if (f > 1e8) break;
        for (let i = 0; i < G.players.length; i++) {
          const p = G.players[i];
          for (const k of ['x','y','vx','vy','aiTX','aiTY'])
            if (nn(p[k])) { trovati.push({ chi:'p'+i+'.'+k+' ('+p.role+')', partita:g, passo:f, scena:G.scene,
                                           stato:JSON.stringify({x:p.x,y:p.y,aiTX:p.aiTX,aiTY:p.aiTY,
                                                                 bvx:G.ball.vx,bvy:G.ball.vy,bz:G.ball.z,
                                                                 owner:G.ball.owner,passTo:G.ball.passTo}) }); f = 1e9; break; }
          if (f > 1e8) break;
        }
        if (f > 1e8) break;
      }
      if (trovati.length >= 4) break;
    }
    return trovati;
  }, [PARTITE, TAGLIA]);

  console.log('=== CHI DIVENTA NaN — ' + PARTITE + ' partite a ' + TAGLIA + ' contro ' + TAGLIA +
              (provaRel ? ', gioco ' + provaRel : '') + ' ===\n');
  if (!out.length) console.log('  nessun NaN in ' + PARTITE + ' partite');
  for (const t of out) {
    console.log('  ' + t.chi + '   partita ' + t.partita + ', passo ' + t.passo + ', scena ' + t.scena);
    console.log('     ' + t.stato);
  }
  if (err.length) console.log('\nECCEZIONI: ' + err.slice(0,3).join(' | '));
  await browser.close(); srv.chiudi();
  process.exit(out.length ? 1 : 0);
})().catch(e => { console.error('FALLITO: ' + e.message); process.exit(2); });
