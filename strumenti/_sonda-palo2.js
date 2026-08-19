/* =====================================================================
   _sonda-palo2.js — L'EVENTO CHE IL CAMBIO 14 CHIUDE, contato.

   Il cambio 14 mette l'annuncio del palo (banner, suono, scossa, gelo,
   spruzzo, lampo) dietro il cancello b.owner < 0. Chiude quindi
   ESATTAMENTE la classe: urto col montante, sopra le 320 unita' al
   secondo, con il pallone in possesso di qualcuno.
   Questa sonda conta quella classe, e le sue vicine, senza toccare il
   gioco: avvolge hitPosts e guarda il pallone prima e dopo.

     A  urto vero        b.owner < 0  e  sp > 320   -> annuncio, oggi e domani
     B  GRATTATO         b.owner >= 0 e  sp > 320   -> quello che il cambio 14 toglie
     C  urto piano       sp <= 320                  -> gia' oggi solo un clack

   Se B vale zero su un campione, il cambio 14 su quel campione non
   cambia niente, e va scritto cosi'.

   uso: node strumenti/_sonda-palo2.js <gioco.html> <taglia> <partite>
   ===================================================================== */
const fs = require('fs'); const path = require('path'); const http = require('http');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');

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
  const S = { A:0, B:0, C:0, banner:0, gelo:0, raffica:0, maxRaffica:0, frames:0 };
  window.__s = S;
  const _hit = window.hitPosts, _gelo = window.gelo, _ban = window.showBanner, _step = window.step;
  let ultimoB = -999, corrente = 0;
  window.gelo = function(){ S.gelo++; return _gelo.apply(this, arguments); };
  window.showBanner = function(t){ if(t==='PALO!') S.banner++; return _ban.apply(this, arguments); };
  window.step = function(){ S.frames++; return _step.apply(this, arguments); };
  window.hitPosts = function(b){
    const x=b.x,y=b.y,vx=b.vx,vy=b.vy,own=b.owner;
    const sp=Math.sqrt(vx*vx+vy*vy);
    const r=_hit.apply(this, arguments);
    if(b.x!==x||b.y!==y||b.vx!==vx||b.vy!==vy){
      if(sp<=320) S.C++;
      else if(own<0) S.A++;
      else {
        S.B++;
        /* le RAFFICHE: urti in possesso a meno di dieci fotogrammi l'uno
           dall'altro. E' la forma del difetto raccontato ("diciassette
           PALO! in 1,3 secondi"), non il singolo urto. */
        if(S.frames-ultimoB<=10) corrente++; else corrente=1;
        ultimoB=S.frames;
        if(corrente>S.maxRaffica) S.maxRaffica=corrente;
        if(corrente===2) S.raffica++;
      }
    }
    return r;
  };
  return 'ok';
})()`;

(async () => {
  const gioco = process.argv[2], taglia = +process.argv[3] || 5, partite = +process.argv[4] || 24;
  const srv = await servi(path.resolve(gioco));
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true });
  const pag = await ctx.newPage();
  const err = []; pag.on('pageerror', e => err.push(e.message));
  await pag.addInitScript(s0 => { let s = s0 >>> 0; const pr = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; }; Math.random = () => pr() / 4294967296; window.__caso = { semina(n) { s = n >>> 0 || 1; } }; }, 20260803);
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
  if (await pag.evaluate(SONDA) !== 'ok') throw new Error('sonda ko');
  let A = 0, B = 0, C = 0, ban = 0, gel = 0, raf = 0, maxR = 0;
  for (let i = 0; i < partite; i++) {
    const r = await pag.evaluate(([sm, tg]) => {
      window.__caso.semina(sm);
      const S = window.__s; for (const k in S) S[k] = 0;
      const t = window.__test;
      t.startMatch(1, 1, tg !== 5 ? { size: tg } : undefined);
      t.setCpuVsCpu(true);
      let sim = 0; while (t.state !== 'end' && sim < 600) { t.simulate(10); sim += 10; }
      return JSON.parse(JSON.stringify(S));
    }, [(20260803 + i) >>> 0, taglia]);
    A += r.A; B += r.B; C += r.C; ban += r.banner; gel += r.gelo; raf += r.raffica; maxR = Math.max(maxR, r.maxRaffica);
  }
  await browser.close(); srv.chiudi();
  console.log(`${path.basename(gioco)} taglia=${taglia} partite=${partite} (semi 20260803..${20260803 + partite - 1})`);
  console.log(`  A  urto col pallone di NESSUNO sopra 320   ${A}`);
  console.log(`  B  urto col pallone IN POSSESSO sopra 320  ${B}   <-- la classe che il cambio 14 chiude`);
  console.log(`     ...di cui in raffica (<=10 fotogrammi)  ${raf} raffiche, la piu' lunga ${maxR}`);
  console.log(`  C  urto sotto 320 (gia' oggi solo clack)   ${C}`);
  console.log(`  banner PALO!                               ${ban}`);
  console.log(`  gelo() chiamate                            ${gel}`);
  if (err.length) console.log('  ECCEZIONI: ' + err[0]);
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
