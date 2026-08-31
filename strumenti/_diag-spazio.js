/* =====================================================================
   _diag-spazio.js — AUTOPSIA DEL PALLONE DI NESSUNO.

   Il metro di casa (_eventi.js) dice UNA cosa sull'11 contro 11: la
   palla non e' di nessuno il 78% del tempo. Non dice PERCHE'. Questa
   sonda scompone quel 78% in famiglie e guarda che cosa fa, mentre il
   pallone vola, l'uomo a cui e' indirizzato.

   COSA CONTA, per partita:
     liberoP        % di fotogrammi con b.owner<0 (la stessa di _eventi)
       in volo      di cui con b.passTo>=0: un passaggio indirizzato
       in cross     di cui con b.crossTo>=0
       alto         di cui b.z>Z_SOPRA_TESTA e senza indirizzo
       vagante      il resto: nessuno l'ha in consegna
     passaggi       episodi con b.passTo>=0
       arrivati     finiti con b.owner === il destinatario
       persi        finiti in qualunque altro modo
       durata       fotogrammi di volo, media
     verso          mentre il pallone e' in volo verso di lui, il
                    destinatario si muove VERSO il pallone o VIA?
                    Si misura il coseno fra la sua velocita' e la
                    direzione del pallone, mediato sui fotogrammi.
                    +1 gli va incontro, -1 gli gira le spalle.
     bersaglio      lo stesso coseno ma sul BERSAGLIO dell'IA
                    (aiTX,aiTY): dove il cervello gli ha detto di andare.

   La sonda NON pesca numeri casuali e non tocca la fisica: legge e basta.
   Stesso impianto di _eventi.js (Math.random a seme fisso, disegno
   spento, simulate a blocchi).

   uso:  node strumenti/_diag-spazio.js --taglia 11 --partite 20 --seme 20260803
         node strumenti/_diag-spazio.js --taglia 11 --partite 20 --gioco fuori/x.html
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};

function servi(prova) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (prova && /CALCETTO-il-gioco\.html$/i.test(f)) f = prova;
      if ((!f.startsWith(RADICE) && f !== prova) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

const SONDA = `(() => {
  if (window.__sp) return 'gia-installata';
  const S = {};
  const azzera = () => {
    S.f=0; S.libero=0; S.inVolo=0; S.inCross=0; S.alto=0; S.vagante=0;
    S.pass=0; S.passOk=0; S.passLen=0;
    S.eCompagno=0; S.eAvversario=0; S.eSpento=0; S.eVagante=0;
    S.cosV=0; S.cosVn=0; S.cosT=0; S.cosTn=0;
    S.distIni=0; S.distFin=0;
    S._pt=-1; S._pf=0; S._pd0=0;
    /* dove sta la squadra: dispersione dei dieci di movimento */
    S.spread=0; S.spreadN=0;
  };
  azzera();
  const _step = window.step;
  window.step = function(){
    _step.apply(this, arguments);
    if(!(G.scene==='play'||G.scene==='golden')) return;
    const b=G.ball;
    S.f++;
    if(b.owner<0){
      S.libero++;
      if(b.passTo>=0) S.inVolo++;
      else if(b.crossTo>=0) S.inCross++;
      else if(b.z>26) S.alto++;
      else S.vagante++;
    }
    /* --- episodio di passaggio --- */
    const pt=b.passTo;
    if(pt>=0 && S._pt<0){
      S._pt=pt; S._pf=0;
      const q=G.players[pt];
      S._pd0=Math.hypot(b.x-q.x,b.y-q.y);
      S.pass++;
    }
    if(pt>=0 && S._pt===pt){
      S._pf++;
      const q=G.players[pt];
      const dx=b.x-q.x, dy=b.y-q.y, dl=Math.max(1,Math.hypot(dx,dy));
      const ux=dx/dl, uy=dy/dl;
      const vl=Math.hypot(q.vx,q.vy);
      if(vl>4){ S.cosV += (q.vx*ux+q.vy*uy)/vl; S.cosVn++; }
      const tx=(q.aiTX||q.x)-q.x, ty=(q.aiTY||q.y)-q.y, tl=Math.hypot(tx,ty);
      if(tl>4){ S.cosT += (tx*ux+ty*uy)/tl; S.cosTn++; }
    }
    if(pt<0 && S._pt>=0){
      S.passLen+=S._pf;
      const q=G.players[S._pt];
      if(b.owner===S._pt) S.passOk++;
      else if(b.owner>=0 && G.players[b.owner].team===q.team) S.eCompagno++;
      else if(b.owner>=0) S.eAvversario++;
      else if(Math.hypot(b.vx,b.vy)<120) S.eSpento++;
      else S.eVagante++;
      S.distIni+=S._pd0;
      S.distFin+=Math.hypot(b.x-q.x,b.y-q.y);
      S._pt=-1;
    }
    /* --- dispersione della squadra 0 (scarto quadratico medio dal baricentro) --- */
    if(S.f%12===0){
      let n=0,sx=0,sy=0;
      for(const p of G.players){ if(p.team!==0||p.out>0||p.role==='gk') continue; n++; sx+=p.x; sy+=p.y; }
      if(n>1){ sx/=n; sy/=n; let s2=0;
        for(const p of G.players){ if(p.team!==0||p.out>0||p.role==='gk') continue;
          s2+=(p.x-sx)*(p.x-sx)+(p.y-sy)*(p.y-sy); }
        S.spread+=Math.sqrt(s2/n); S.spreadN++; }
    }
  };
  window.__sp = { azzera, leggi(){ return Object.assign({}, S); } };
  return 'ok';
})()`;

const med = a => { const b = a.slice().sort((x, y) => x - y); const n = b.length; return n ? (n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2) : 0; };
const avg = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;

(async () => {
  const partite = +arg('partite', 20);
  const seme = +arg('seme', 20260803);
  const taglia = +arg('taglia', 11);
  const diff = +arg('diff', 1);
  const gioco = arg('gioco', '');
  const prova = gioco ? path.resolve(RADICE, gioco) : null;
  if (prova && !fs.existsSync(prova)) { console.error('non esiste ' + prova); process.exit(1); }

  const srv = await servi(prova);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push('ECCEZIONE: ' + e.message));
  await pag.addInitScript(s0 => {
    let s = s0 >>> 0 || 1;
    const pr = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => pr() / 4294967296;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = pr(); return a; };
    window.__caso = { semina(n) { s = n >>> 0 || 1; } };
  }, seme);
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
  const inst = await pag.evaluate(SONDA);
  if (inst !== 'ok') throw new Error('sonda: ' + inst);

  const R = [];
  for (let i = 0; i < partite; i++) {
    const r = await pag.evaluate(([sm, df, tg]) => {
      const t = window.__test;
      window.__caso.semina(sm);
      window.__sp.azzera();
      t.startMatch(1, df, tg !== 5 ? { size: tg } : undefined);
      t.setCpuVsCpu(true);
      let sim = 0;
      while (t.state !== 'end' && sim < 900) { t.simulate(10); sim += 10; }
      return window.__sp.leggi();
    }, [(seme + i) >>> 0, diff, taglia]);
    R.push(r);
    if ((i + 1) % 5 === 0) console.log('  -- ' + (i + 1) + '/' + partite);
  }
  await ctx.close(); await browser.close(); srv.chiudi();
  if (errori.length) { console.error(errori.join('\n')); process.exit(1); }

  const pc = k => R.map(r => r.f ? r[k] / r.f * 100 : 0);
  console.log('\n=== SPAZIO — ' + partite + ' partite, taglia ' + taglia + ', semi ' + seme + '..' + (seme + partite - 1) +
    (gioco ? ', gioco ' + gioco : ', gioco spedito') + ' ===');
  const f = (n, v, d) => console.log('  ' + n.padEnd(26) + v.toFixed(d === undefined ? 2 : d).padStart(8));
  f('fotogrammi/partita', avg(R.map(r => r.f)), 0);
  f('palla di nessuno %', avg(pc('libero')));
  f('  in volo (passTo) %', avg(pc('inVolo')));
  f('  in cross %', avg(pc('inCross')));
  f('  alta %', avg(pc('alto')));
  f('  vagante %', avg(pc('vagante')));
  f('passaggi/partita', avg(R.map(r => r.pass)));
  f('  arrivati %', avg(R.map(r => r.pass ? r.passOk / r.pass * 100 : 0)));
  f('  a un compagno %', avg(R.map(r => r.pass ? r.eCompagno / r.pass * 100 : 0)));
  f('  intercettato %', avg(R.map(r => r.pass ? r.eAvversario / r.pass * 100 : 0)));
  f('  spento per strada %', avg(R.map(r => r.pass ? r.eSpento / r.pass * 100 : 0)));
  f('  deviato/vagante %', avg(R.map(r => r.pass ? r.eVagante / r.pass * 100 : 0)));
  f('  volo (fotogrammi)', avg(R.map(r => r.pass ? r.passLen / r.pass : 0)));
  f('  distanza iniziale', avg(R.map(r => r.pass ? r.distIni / r.pass : 0)), 0);
  f('  distanza finale', avg(R.map(r => r.pass ? r.distFin / r.pass : 0)), 0);
  f('cos VELOCITA ricevente', avg(R.map(r => r.cosVn ? r.cosV / r.cosVn : 0)), 3);
  f('cos BERSAGLIO ricevente', avg(R.map(r => r.cosTn ? r.cosT / r.cosTn : 0)), 3);
  f('dispersione squadra', avg(R.map(r => r.spreadN ? r.spread / r.spreadN : 0)), 0);
  console.log('  mediane: libero% ' + med(pc('libero')).toFixed(2) +
    '  arrivati% ' + med(R.map(r => r.pass ? r.passOk / r.pass * 100 : 0)).toFixed(2) +
    '  cosT ' + med(R.map(r => r.cosTn ? r.cosT / r.cosTn : 0)).toFixed(3));
})();
