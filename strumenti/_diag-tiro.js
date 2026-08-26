/* =====================================================================
   _diag-tiro.js — L'AUTOPSIA DI OGNI SINGOLO TIRO.

   PERCHE' ESISTE. Il referto a cento partite (`fuori/base-11-100.txt`)
   dice che a 11 contro 11 su 11,3 tiri a partita 4,2 muoiono «murati dal
   corpo» e la precisione VERA e' il 7%. Sono due numeri aggregati, e da
   soli non dicono la cosa che serve per curare: il tiro muore SUBITO,
   addosso a chi pressa, oppure LONTANO, dentro il traffico dell'area? E
   il corpo che lo mura e' un avversario o un COMPAGNO — la punta che
   staziona a 690 unita' dalla porta sta esattamente sulla retta fra il
   tiratore e la rete.

   COSA MISURA, un tiro alla volta:
     · d'origine   distanza dal piano della porta, qualita' (q), velocita'
                   di partenza e residua al piano della porta
     · la CORSIA   al momento del calcio, chi sta dentro il tubo di
                   raggio P_R+B_R-2 = 19 fra il pallone e la porta:
                   quanti, a che distanza il primo, di che squadra, con
                   che ruolo (la stessa condizione, alla lettera, del
                   ramo del rimpallo in updateBall)
     · la MORTE    dove il tiro finisce davvero, e per i murati la
                   distanza percorsa prima del muro e chi lo ha messo
     · l'incrocio  esito x corsia libera: se i tiri a corsia libera non
                   vanno meglio, la corsia non e' la malattia

   La corsia si misura sulla direzione VERA del pallone (b.vx,b.vy letti
   subito dopo fireShot), non sull'intenzione: q=1 mira al palo lontano e
   q=2 sbaglia di 9-26 gradi, e chiedere la corsia al centro della porta
   sarebbe chiederla a una retta che il pallone non percorre.

   uso:
     node strumenti/_diag-tiro.js --taglia 11 --partite 30
     node strumenti/_diag-tiro.js --taglia 5  --partite 30
     node strumenti/_diag-tiro.js --gioco fuori/prova.html --taglia 11
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
  if (window.__dt) return 'gia-installata';
  const S = { tiri: [], cariche: [], banner: {} };
  const _fireShot = window.fireShot, _updateBall = window.updateBall,
        _step = window.step, _showBanner = window.showBanner, _hitWall = window.hitWall;

  window.showBanner = function(t){ S.banner[t]=(S.banner[t]||0)+1; return _showBanner.apply(this, arguments); };
  window.hitWall = function(){ S._spondaOra=true; return _hitWall.apply(this, arguments); };

  const RAGGIO = 19;   // P_R+B_R-2, la stessa costante del ramo del rimpallo

  /* la corsia verso la porta, misurabile in qualunque istante: primo corpo
     dentro il tubo, e pressione sul portatore */
  const corsia = (p, x, y, ux, uy) => {
    const gx = p.team===0?FW:0;
    const sPorta = Math.abs(ux)>0.05 ? (gx-x)/ux : 9999;
    let n=0, primo=null;
    const pi=G.players.indexOf(p);
    for(const o of G.players){
      if(o.out>0) continue;
      const oi=G.players.indexOf(o);
      if(oi===pi) continue;
      const dx=o.x-x, dy=o.y-y;
      const s=dx*ux+dy*uy;
      if(s<=0 || s>=Math.max(0,sPorta)) continue;
      if(Math.abs(dx*uy-dy*ux)>=RAGGIO) continue;
      n++;
      if(!primo || s<primo.s) primo={ s:Math.round(s), team:o.team, ruolo:o.role==='gk'?'gk':ruoloDi(o) };
    }
    return { n, primo };
  };
  const pressioneSu = p => Math.round(Math.min.apply(null,
      G.players.filter(o=>o.team!==p.team && o.out<=0)
               .map(o=>Math.sqrt((o.x-p.x)*(o.x-p.x)+(o.y-p.y)*(o.y-p.y)))));

  /* LA CARICA. aiCarrier decide, anticipa() apre il gesto, e SOLO 0,30-0,46 s
     dopo parte il tiro: qui si registra com'era il mondo alla DECISIONE, per
     confrontarlo con com'e' al calcio. */
  const _anticipa = window.anticipa;
  window.anticipa = function(p, clip, dur, cb){
    const r=_anticipa.apply(this, arguments);
    if(clip==='tiro' && r){
      const gx=p.team===0?FW:0;
      const dx=gx-p.x, dy=FH/2-p.y, l=Math.max(1,Math.sqrt(dx*dx+dy*dy));
      const c=corsia(p, p.x, p.y, dx/l, dy/l);
      S.cariche.push({ press0: pressioneSu(p), corsia0: c.n, primo0: c.primo?c.primo.s:null,
                       dur: Math.round(dur*1000), sparato:false, press1:null, dPorta0: Math.round(Math.abs(gx-p.x)) });
      S._caricaViva = S.cariche[S.cariche.length-1];
      S._caricaP = p;
    }
    return r;
  };

  window.fireShot = function(p, nx, ny, q, lob){
    const t=p.team, n0=(G.stats.tiri[t]|0);
    const r=_fireShot.apply(this, arguments);
    if(lob || (G.stats.tiri[t]|0)===n0) return r;   // pallonetto, o tiro non partito
    const b=G.ball, pi=G.players.indexOf(p);
    const sp=Math.sqrt(b.vx*b.vx+b.vy*b.vy);
    if(sp<1) return r;
    const ux=b.vx/sp, uy=b.vy/sp;
    const gx = t===0?FW:0;
    /* strada lungo la direzione VERA fino al piano della porta */
    const sPorta = Math.abs(ux)>0.05 ? (gx-b.x)/ux : 9999;
    let nCorsia=0, primo=null;
    for(const o of G.players){
      if(o.out>0) continue;
      const oi=G.players.indexOf(o);
      if(oi===pi) continue;
      const dx=o.x-b.x, dy=o.y-b.y;
      const s=dx*ux+dy*uy;
      if(s<=0 || s>=Math.max(0,sPorta)) continue;
      const c=Math.abs(dx*uy-dy*ux);
      if(c>=RAGGIO) continue;
      nCorsia++;
      if(!primo || s<primo.s) primo={ s:Math.round(s), c:Math.round(c), team:o.team,
                                      ruolo: o.role==='gk' ? 'gk' : ruoloDi(o) };
    }
    const rec = {
      q: q|0, team: t, sp: Math.round(sp),
      dPorta: Math.round(Math.abs(gx-b.x)),
      dObiett: Math.round(Math.sqrt((gx-b.x)*(gx-b.x)+(FH/2-b.y)*(FH/2-b.y))),
      sPorta: Math.round(Math.min(9999,Math.max(0,sPorta))),
      nCorsia, primo,
      /* velocita' residua al piano della porta, con la legge del gioco */
      resid: Math.round(Math.max(0, sp - TIRO_ATTR*Math.max(0,Math.min(sPorta,9999)))),
      /* pressione: distanza dell'avversario piu' vicino al tiratore */
      press: Math.round(Math.min.apply(null, G.players.filter(o=>o.team!==t && o.out<=0)
              .map(o=>Math.sqrt((o.x-p.x)*(o.x-p.x)+(o.y-p.y)*(o.y-p.y))))),
      esito: null, sMorte: null, muroTeam: null, muroRuolo: null
    };
    if(S._caricaViva && S._caricaP===p){
      /* IL CONFRONTO ONESTO. Alla decisione la corsia si misura per forza
         verso il CENTRO della porta (la retta vera non esiste ancora: q e
         l'incrocio si scelgono dentro fireShot). Confrontarla con la corsia
         sulla direzione VERA sarebbe confrontare due rette diverse e
         chiamarlo «il difensore e' arrivato». Qui si misura anche la corsia
         AL CALCIO verso il centro, dalla stessa posizione del giocatore:
         quella e' la coppia che si puo' sottrarre. */
      const gxc=t===0?FW:0;
      const dxc=gxc-p.x, dyc=FH/2-p.y, lc=Math.max(1,Math.sqrt(dxc*dxc+dyc*dyc));
      const cc=corsia(p, p.x, p.y, dxc/lc, dyc/lc);
      S._caricaViva.sparato=true;
      S._caricaViva.press1=rec.press;
      S._caricaViva.primo1=primo?primo.s:null;
      S._caricaViva.corsia1=nCorsia;
      S._caricaViva.primoC1=cc.primo?cc.primo.s:null;   // stessa retta della decisione
      S._caricaViva.corsiaC1=cc.n;
      rec.primoC1=S._caricaViva.primoC1;
      rec.press0=S._caricaViva.press0;
      rec.primo0=S._caricaViva.primo0;
      S._caricaViva=null; S._caricaP=null;
    }
    S.tiri.push(rec);
    S._vivo = { rec, x0:b.x, y0:b.y, t:0, gol0:G.score[0]+G.score[1],
                par0:(G.stats.parate[0]|0)+(G.stats.parate[1]|0) };
    return r;
  };

  window.updateBall = function(dt){
    const b=G.ball, own0=b.owner, lt0=b.lastTouch;
    const sp0=Math.sqrt(b.vx*b.vx+b.vy*b.vy);
    const vol0=(G.stats.volee[0]|0)+(G.stats.volee[1]|0);
    _updateBall.call(this, dt);
    const vol1=(G.stats.volee[0]|0)+(G.stats.volee[1]|0);
    if(own0<0 && b.owner<0 && b.lastTouch!==lt0 && sp0>420 && vol1===vol0){
      S._muroOra=true;
      S._muroChi = (b.lastTouch>=0 && G.players[b.lastTouch]) ? G.players[b.lastTouch] : null;
    }
  };

  window.step = function(){
    S._muroOra=false; S._spondaOra=false; S._muroChi=null;
    const bn0={p:S.banner['PALO!']||0, t:S.banner['TRAVERSA!']||0, a:S.banner['ALTA!']||0};
    _step.apply(this, arguments);
    const V=S._vivo;
    if(!V) return;
    if(G.scene==='goal'){ V.rec.esito='gol'; S._vivo=null; return; }
    if(!(G.scene==='play'||G.scene==='golden')) return;
    const b=G.ball; V.t++;
    const chiudi = (e) => {
      V.rec.esito=e;
      V.rec.sMorte=Math.round(Math.sqrt((b.x-V.x0)*(b.x-V.x0)+(b.y-V.y0)*(b.y-V.y0)));
      if(e==='murato' && S._muroChi){
        V.rec.muroTeam=S._muroChi.team;
        V.rec.muroRuolo=S._muroChi.role==='gk'?'gk':ruoloDi(S._muroChi);
      }
      S._vivo=null;
    };
    const gol1=G.score[0]+G.score[1];
    const par1=(G.stats.parate[0]|0)+(G.stats.parate[1]|0);
    const legno=((S.banner['PALO!']||0)>bn0.p)||((S.banner['TRAVERSA!']||0)>bn0.t);
    if(gol1>V.gol0)            chiudi('gol');
    else if(par1>V.par0)       chiudi('parata');
    else if(legno)             chiudi('legno');
    else if(S._muroOra)        chiudi('murato');
    else if(S._spondaOra || (S.banner['ALTA!']||0)>bn0.a) chiudi('sponda');
    else if(b.owner>=0)        chiudi('raccolto');
    else if(V.t>6 && Math.sqrt(b.vx*b.vx+b.vy*b.vy)<150) chiudi('spento');
    else if(V.t>210)           chiudi('spento');
  };

  window.__dt = {
    azzera(){ S.tiri.length=0; S.cariche.length=0; S.banner={}; S._vivo=null; S._caricaViva=null; S._caricaP=null; },
    leggi(){ return { tiri: S.tiri.slice(), cariche: S.cariche.slice() }; }
  };
  return 'ok';
})()`;

/* --------------------------------------------------------------- statistica */
const mediana = a => { if(!a.length) return 0; const b=a.slice().sort((x,y)=>x-y); const n=b.length; return n%2?b[(n-1)/2]:(b[n/2-1]+b[n/2])/2; };
const media = a => a.length ? a.reduce((s,x)=>s+x,0)/a.length : 0;
const pct = (n, d) => d ? (n/d*100).toFixed(1).padStart(5) + '%' : '    - ';

function istogramma(nome, vals, tagli) {
  const cnt = tagli.map(() => 0);
  let oltre = 0;
  for (const v of vals) {
    let messo = false;
    for (let i = 0; i < tagli.length; i++) if (v < tagli[i]) { cnt[i]++; messo = true; break; }
    if (!messo) oltre++;
  }
  const tot = vals.length || 1;
  let s = '  ' + nome + '\n';
  for (let i = 0; i < tagli.length; i++) {
    const da = i ? tagli[i-1] : 0;
    s += '    ' + (da + '-' + tagli[i]).padEnd(12) + String(cnt[i]).padStart(5) + '  ' + pct(cnt[i], tot) + '  ' + '#'.repeat(Math.round(cnt[i] / tot * 40)) + '\n';
  }
  s += '    ' + ('oltre ' + tagli[tagli.length-1]).padEnd(12) + String(oltre).padStart(5) + '  ' + pct(oltre, tot) + '  ' + '#'.repeat(Math.round(oltre / tot * 40)) + '\n';
  return s;
}

async function main() {
  const partite = parseInt(arg('partite', '30'), 10);
  const semeBase = parseInt(arg('seme', '20260803'), 10) >>> 0;
  const diff = parseInt(arg('diff', '1'), 10);
  const taglia = parseInt(arg('taglia', '11'), 10);
  const provaRel = arg('gioco', process.env.GIOCO_PROVA || '');
  const prova = provaRel ? path.resolve(RADICE, provaRel) : '';
  if (prova && !fs.existsSync(prova)) { console.error('non esiste ' + prova); process.exit(1); }

  const srv = await servi(prova);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push('ECCEZIONE: ' + e.message));

  await pag.addInitScript(seme => {
    let s = seme >>> 0 || 1;
    const prossimo = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => prossimo() / 4294967296;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = prossimo(); return a; };
    window.__caso = { semina(n) { s = n >>> 0 || 1; } };
  }, semeBase);

  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
  const inst = await pag.evaluate(SONDA);
  if (inst !== 'ok') throw new Error('sonda non installata: ' + inst);

  const tutti = [];
  const cariche = [];
  const inizio = Date.now();
  for (let i = 0; i < partite; i++) {
    const r = await pag.evaluate(([seme, diff, taglia]) => {
      const t = window.__test;
      window.__caso.semina(seme);
      window.__dt.azzera();
      t.startMatch(1, diff, taglia !== 5 ? { size: taglia } : undefined);
      t.setCpuVsCpu(true);
      let sim = 0;
      while (t.state !== 'end' && sim < 600) { t.simulate(10); sim += 10; }
      return window.__dt.leggi();
    }, [(semeBase + i) >>> 0, diff, taglia]);
    tutti.push(...r.tiri); cariche.push(...r.cariche);
    if ((i + 1) % 10 === 0) console.log('  --    ' + (i + 1) + '/' + partite + ' partite, ' + tutti.length + ' tiri');
  }
  const secondi = (Date.now() - inizio) / 1000;
  await browser.close(); srv.chiudi();
  if (errori.length) { console.error(errori.join('\n')); process.exit(1); }

  /* ------------------------------------------------------------- referto */
  const N = tutti.length;
  console.log('\n=== AUTOPSIA DEI TIRI — ' + partite + ' partite a ' + taglia + ' contro ' + taglia +
              ', semi ' + semeBase + '..' + (semeBase + partite - 1) + ' ===');
  if (provaRel) console.log('  --    gioco: ' + provaRel);
  console.log('  --    ' + N + ' tiri su azione (fireShot, pallonetti esclusi) = ' + (N / partite).toFixed(1) + ' a partita, ' + secondi.toFixed(0) + ' s');

  const perQ = [0, 1, 2].map(q => tutti.filter(t => t.q === q));
  console.log('\n  qualita\':  q=0 debole ' + perQ[0].length + ' (' + pct(perQ[0].length, N).trim() + ')' +
              '   q=1 perfetto ' + perQ[1].length + ' (' + pct(perQ[1].length, N).trim() + ')' +
              '   q=2 storto ' + perQ[2].length + ' (' + pct(perQ[2].length, N).trim() + ')');

  const ESITI = ['gol', 'parata', 'legno', 'murato', 'sponda', 'raccolto', 'spento', null];
  const nomeEsito = e => e === null ? 'APERTO (mai chiuso)' : e;
  console.log('\n  ESITI');
  for (const e of ESITI) {
    const g = tutti.filter(t => t.esito === e);
    if (!g.length) continue;
    console.log('    ' + nomeEsito(e).padEnd(20) + String(g.length).padStart(5) + '  ' + pct(g.length, N) +
                '   strada mediana ' + (e && g.some(x=>x.sMorte!==null) ? mediana(g.filter(x=>x.sMorte!==null).map(x => x.sMorte)).toFixed(0) : '-'));
  }

  console.log('\n  LA CORSIA AL MOMENTO DEL CALCIO (tubo di raggio 19 fino al piano della porta)');
  const libere = tutti.filter(t => t.nCorsia === 0);
  console.log('    corsia LIBERA          ' + String(libere.length).padStart(5) + '  ' + pct(libere.length, N));
  for (let k = 1; k <= 4; k++) {
    const g = tutti.filter(t => t.nCorsia === k);
    console.log('    ' + (k + ' corpo' + (k > 1 ? 'i' : '') + ' in corsia').padEnd(23) + String(g.length).padStart(5) + '  ' + pct(g.length, N));
  }
  const molti = tutti.filter(t => t.nCorsia > 4);
  console.log('    5 o piu\'               ' + String(molti.length).padStart(5) + '  ' + pct(molti.length, N));

  const conPrimo = tutti.filter(t => t.primo);
  console.log('\n    del PRIMO corpo in corsia (' + conPrimo.length + ' tiri):');
  const comp = conPrimo.filter(t => t.primo.team === t.team);
  console.log('      e\' un COMPAGNO      ' + String(comp.length).padStart(5) + '  ' + pct(comp.length, conPrimo.length));
  console.log('      e\' un avversario    ' + String(conPrimo.length - comp.length).padStart(5) + '  ' + pct(conPrimo.length - comp.length, conPrimo.length));
  const ruoliP = {};
  for (const t of conPrimo) { const k = (t.primo.team === t.team ? 'compagno ' : 'avversario ') + t.primo.ruolo; ruoliP[k] = (ruoliP[k] || 0) + 1; }
  for (const k of Object.keys(ruoliP).sort((a, b) => ruoliP[b] - ruoliP[a]))
    console.log('        ' + k.padEnd(26) + String(ruoliP[k]).padStart(5) + '  ' + pct(ruoliP[k], conPrimo.length));
  console.log(istogramma('distanza del primo corpo in corsia:', conPrimo.map(t => t.primo.s), [40, 80, 150, 250, 400, 600]));

  console.log('  ESITO x CORSIA — se la corsia non cambia l\'esito, non e\' lei la malattia');
  const gruppi = [['corsia libera', libere], ['corsia occupata', tutti.filter(t => t.nCorsia > 0)]];
  console.log('    ' + 'gruppo'.padEnd(18) + 'n'.padStart(5) + '   ' + ['gol', 'parata', 'legno', 'murato', 'sponda', 'raccolto', 'spento'].map(s => s.padStart(9)).join(''));
  for (const [nome, g] of gruppi) {
    console.log('    ' + nome.padEnd(18) + String(g.length).padStart(5) + '   ' +
      ['gol', 'parata', 'legno', 'murato', 'sponda', 'raccolto', 'spento'].map(e => pct(g.filter(t => t.esito === e).length, g.length).padStart(9)).join(''));
  }
  const prec = g => pct(g.filter(t => t.esito === 'gol' || t.esito === 'parata').length, g.length);
  console.log('    precisione VERA (gol+parata):  libera ' + prec(libere) + '   occupata ' + prec(tutti.filter(t => t.nCorsia > 0)));

  console.log('\n  DOVE MUORE IL MURATO (' + tutti.filter(t => t.esito === 'murato').length + ' tiri)');
  const mur = tutti.filter(t => t.esito === 'murato');
  if (mur.length) {
    console.log(istogramma('strada percorsa prima del muro:', mur.map(t => t.sMorte), [40, 80, 150, 250, 400, 600]));
    const mc = mur.filter(t => t.muroTeam === t.team);
    console.log('    lo mura un COMPAGNO  ' + String(mc.length).padStart(5) + '  ' + pct(mc.length, mur.length));
    const rm = {};
    for (const t of mur) { const k = (t.muroTeam === t.team ? 'compagno ' : 'avversario ') + (t.muroRuolo || '?'); rm[k] = (rm[k] || 0) + 1; }
    for (const k of Object.keys(rm).sort((a, b) => rm[b] - rm[a])) console.log('      ' + k.padEnd(26) + String(rm[k]).padStart(5) + '  ' + pct(rm[k], mur.length));
    console.log('    il muro era GIA\' in corsia al calcio: ' + pct(mur.filter(t => t.nCorsia > 0).length, mur.length) +
                '   (a corsia libera: ' + mur.filter(t => t.nCorsia === 0).length + ' tiri murati da un corpo arrivato dopo)');
  }

  /* ---------------------------------------------------- l'accusa alla carica */
  console.log('\n  LA CARICA — fra la DECISIONE e il CALCIO passano 0,30-0,46 s (' + cariche.length + ' cariche aperte)');
  const sparate = cariche.filter(c => c.sparato);
  console.log('    cariche che diventano tiro     ' + String(sparate.length).padStart(5) + '  ' + pct(sparate.length, cariche.length));
  console.log('    cariche perse (palla persa)    ' + String(cariche.length - sparate.length).padStart(5) + '  ' + pct(cariche.length - sparate.length, cariche.length));
  if (sparate.length) {
    console.log('    pressione sul portatore        alla DECISIONE mediana ' + mediana(sparate.map(c => c.press0)).toFixed(0) +
                '   al CALCIO mediana ' + mediana(sparate.map(c => c.press1)).toFixed(0) +
                '   (media ' + media(sparate.map(c => c.press0)).toFixed(0) + ' -> ' + media(sparate.map(c => c.press1)).toFixed(0) + ')');
    const chiusa0 = sparate.filter(c => c.primo0 !== null && c.primo0 < 60).length;
    const chiusaC1 = sparate.filter(c => c.primoC1 !== null && c.primoC1 < 60).length;
    const chiusa1 = sparate.filter(c => c.primo1 !== null && c.primo1 < 60).length;
    console.log('    [STESSA RETTA, verso il centro porta — l\'unico confronto che si puo\' sottrarre]');
    console.log('      corsia chiusa entro 60u      alla DECISIONE ' + pct(chiusa0, sparate.length) + '   al CALCIO ' + pct(chiusaC1, sparate.length));
    console.log('      corpi in corsia (media)      alla DECISIONE ' + media(sparate.map(c => c.corsia0)).toFixed(2) +
                '   al CALCIO ' + media(sparate.map(c => c.corsiaC1)).toFixed(2));
    const peggiora = sparate.filter(c => (c.primoC1 === null ? 1e9 : c.primoC1) < (c.primo0 === null ? 1e9 : c.primo0) - 30).length;
    const migliora = sparate.filter(c => (c.primoC1 === null ? 1e9 : c.primoC1) > (c.primo0 === null ? 1e9 : c.primo0) + 30).length;
    console.log('      la corsia si CHIUDE durante la carica ' + pct(peggiora, sparate.length) +
                '   si APRE ' + pct(migliora, sparate.length) + '   resta uguale ' + pct(sparate.length - peggiora - migliora, sparate.length));
    console.log('    [retta VERA del pallone, non confrontabile con la decisione]');
    console.log('      corsia chiusa entro 60u      al CALCIO ' + pct(chiusa1, sparate.length) +
                '   corpi in corsia (media) ' + media(sparate.map(c => c.corsia1)).toFixed(2));
    /* il verdetto: dei tiri murati subito, quanti erano LIBERI quando si e' deciso
       — e la stessa domanda posta alla RETTA VERA al momento del calcio, che e'
       il controllo: se anche li' erano liberi, il muro e' arrivato dopo davvero. */
    const muroSubito = tutti.filter(t => t.esito === 'murato' && t.sMorte !== null && t.sMorte < 80 && t.primo0 !== undefined);
    const eranoLiberi = muroSubito.filter(t => t.primo0 === null || t.primo0 >= 60).length;
    const eranoLiberiC = muroSubito.filter(t => t.primoC1 === null || t.primoC1 >= 60).length;
    const eranoLiberiV = muroSubito.filter(t => !t.primo || t.primo.s >= 60).length;
    console.log('    dei ' + muroSubito.length + ' tiri murati entro 80u, la corsia era libera oltre 60u:');
    console.log('      alla DECISIONE (verso il centro)   ' + pct(eranoLiberi, muroSubito.length));
    console.log('      al CALCIO      (verso il centro)   ' + pct(eranoLiberiC, muroSubito.length));
    console.log('      al CALCIO      (retta VERA)        ' + pct(eranoLiberiV, muroSubito.length) + '   <-- se e\' alta, il muro e\' arrivato DOPO il calcio');
  }

  console.log('\n  GEOMETRIA DEL TIRO');
  console.log(istogramma('distanza dal piano della porta:', tutti.map(t => t.dPorta), [200, 350, 500, 650, 800, 950]));
  console.log(istogramma('pressione (avversario piu\' vicino al tiratore):', tutti.map(t => t.press), [30, 60, 100, 160, 250]));
  console.log('    velocita\' di partenza  mediana ' + mediana(tutti.map(t => t.sp)).toFixed(0) + '   residua al piano porta  mediana ' + mediana(tutti.map(t => t.resid)).toFixed(0));
  const arrivano = tutti.filter(t => t.resid > 0);
  console.log('    tiri che avrebbero ENERGIA per arrivare (resid>0): ' + pct(arrivano.length, N) + '   di cui sopra 330 (respinta, non presa): ' + pct(tutti.filter(t => t.resid >= 330).length, N));
}

main().catch(e => { console.error(e); process.exit(1); });
