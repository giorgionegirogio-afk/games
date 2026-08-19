/* =====================================================================
   _misura-undici.js — DOVE MUORE IL GIOCO A UNDICI, in numeri.

   PERCHE' ESISTE. `_eventi.js` dice che l'11 contro 11 fa zero momenti da
   porta e sette «tiri». Ma quei sette tiri sono una bugia del tabellino:
   G.stats.tiri lo incrementano QUATTRO posti diversi, e uno di quelli e'
   la lotteria dai dischetti (Duel.stopPower). Questo strumento non conta
   il tabellino: avvolge fireShot — l'unica porta del tiro su azione — e
   conta le CONDIZIONI che lo precedono, una per una, cosi' si vede a
   quale anello la catena si spezza:

     decisioni      quante volte aiCarrier arriva a decidere (il timer
                    p.aiActT e' scaduto e il portatore CPU sceglie)
     inRange        quante di quelle decisioni cadono dentro la zona di
                    tiro, e SEPARATAMENTE quante superano solo il filtro
                    di distanza (distX) e quante solo quello di fascia
                    verticale (|y-FH/2|): se il tiro non parte, uno dei
                    due e' sempre colpevole e si vede quale
     dado           quante volte, dentro la zona, il dado D.shotFreq dice
                    di si'
     anticipo       quante volte la carica del tiro si apre davvero
                    (anticipa() puo' rifiutare: corpo a terra, gia'
                    occupato, kickCd)
     fireShot       quante volte il tiro parte, con distanza vera, quota
                    di partenza e velocita' RESIDUA al piano della porta
     palla          dove sta il pallone: istogramma della x in decimi di
                    campo, e la penetrazione massima verso ogni porta
     portatore      distanza minima dal bersaglio raggiunta da un
                    portatore, e quanti fotogrammi il pallone e' di
                    qualcuno

   uso:
     node strumenti/_misura-undici.js --taglia 11 --partite 8
     node strumenti/_misura-undici.js --taglia 5  --partite 8
     node strumenti/_misura-undici.js --gioco /fuori/prova.html --taglia 11
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

/* --------------------------------------------------------------- la sonda */
const SONDA = `(() => {
  if (window.__mu) return 'gia-installata';
  const S = {};
  const azzera = () => {
    S.frames=0; S.conPadrone=0;
    S.decisioni=0; S.inRange=0; S.soloX=0; S.soloY=0; S.nessuno=0;
    S.dado=0; S.anticipoOK=0; S.anticipoNO=0; S.tiri=0;
    S.tiriInfo=[];
    S.bandX=new Array(10).fill(0);
    S.minVerso=[1e9,1e9];      // penetrazione max della PALLA verso porta 1 e 0
    S.minPort=[1e9,1e9];       // idem, ma con un PORTATORE
    S.distDec=[];              // distX del portatore a ogni decisione
    S.tuffi=0; S.presaTent=0;
    S.passi=[]; S.rinvii=[];
    S.puntaS=[0,0]; S.puntaN=0; S.puntaMin=[1e9,1e9];
  };
  azzera();

  const _step = window.step;
  const _aiCarrier = window.aiCarrier;
  const _fireShot = window.fireShot;
  const _anticipa = window.anticipa;
  const _eseguiAiPass = window.eseguiAiPass;
  const _rinvioPortiere = window.rinvioPortiere;

  /* IL PASSAGGIO. La stessa aritmetica del tiro: con l'attrito
     b.vx *= 0.35^dt un pallone lanciato a v0 percorre al massimo
     v0/1,0498 unita'. Qui si registra, per ogni appoggio della CPU, la
     distanza VOLUTA (il compagno mirato) contro la corsa POSSIBILE. */
  window.eseguiAiPass = function(p, D){
    const b=G.ball;
    const r = _eseguiAiPass.apply(this, arguments);
    const sp = Math.hypot(b.vx,b.vy);
    if(sp>1 && b.owner<0){
      const q = b.passTo>=0 ? G.players[b.passTo] : null;
      const l = q ? Math.hypot(q.x-p.x, q.y-p.y) : -1;
      const gain = q ? (p.team===0 ? q.x-p.x : p.x-q.x) : 0;
      S.passi.push({ l:Math.round(l), v0:Math.round(sp), portata:Math.round(sp/attr()), gain:Math.round(gain) });
    }
    return r;
  };
  window.rinvioPortiere = function(p){
    const b=G.ball;
    const r = _rinvioPortiere.apply(this, arguments);
    const sp = Math.hypot(b.vx,b.vy);
    const q = b.passTo>=0 ? G.players[b.passTo] : null;
    const l = q ? Math.hypot(q.x-p.x, q.y-p.y) : -1;
    S.rinvii.push({ l:Math.round(l), v0:Math.round(sp), portata:Math.round(sp/attr()) });
    return r;
  };

  /* aiCarrier: si osserva PRIMA della chiamata, perche' dentro il timer
     viene riscritto. p.aiActT>0 significa "non decide adesso". */
  /* L'ATTRITO E LA SOGLIA SI CHIEDONO AL GIOCO, non si ricordano: dopo
     _toppa-undici.js TIRO_ATTR non e' piu' una costante ma un derivato
     del campo, e uno strumento che tenesse il 1,0498 scritto a mano
     stamperebbe residui sbagliati della meta' — cioe' attesterebbe
     invece di misurare. */
  const attr = () => (typeof TIRO_ATTR==='number' ? TIRO_ATTR : 1.0498);
  const soglia = () => Math.min(FW*0.40,
    (typeof TIRO_TETTO==='number' && typeof TIRO_ARRIVO!=='undefined')
      ? Math.max(500, (TIRO_TETTO-TIRO_ARRIVO[1])/attr()) : 500);

  window.aiCarrier = function(p, opGoalX, D){
    const decide = !(p.aiActT!==undefined && p.aiActT-(1/60) > 0);
    if(decide){
      S.decisioni++;
      const distGoal=Math.abs(opGoalX-p.x);
      const okX = distGoal < soglia();
      const okY = Math.abs(p.y-FH/2) < FH*0.40;
      S.distDec.push(Math.round(distGoal));
      if(okX&&okY) S.inRange++; else if(okX) S.soloX++; else if(okY) S.soloY++; else S.nessuno++;
      S._pend = okX&&okY;
    } else S._pend = false;
    const t0 = S.tiri, a0 = S.anticipoOK+S.anticipoNO;
    const r = _aiCarrier.apply(this, arguments);
    return r;
  };

  /* anticipa('tiro') e' l'anello fra il dado e il tiro */
  window.anticipa = function(p, tipo, durata, azione){
    const r = _anticipa.apply(this, arguments);
    if(tipo==='tiro'){ if(r) S.anticipoOK++; else S.anticipoNO++; }
    return r;
  };

  window.fireShot = function(p,nx,ny,q,lob){
    const pre = G.stats.tiri[p.team];
    const r = _fireShot.apply(this, arguments);
    if(G.stats.tiri[p.team] > pre){
      S.tiri++;
      const gx = p.team===0?FW:0;
      const l = Math.hypot(gx-p.x, FH/2-p.y);
      const b = G.ball, sp = Math.hypot(b.vx,b.vy);
      S.tiriInfo.push({ q:q|0, lob:!!lob, distX:Math.round(Math.abs(gx-p.x)),
                        dy:Math.round(Math.abs(p.y-FH/2)), l:Math.round(l),
                        v0:Math.round(sp), resid:Math.round(sp-attr()*l) });
    }
    return r;
  };

  window.step = function(){
    _step.apply(this, arguments);
    if(!(G.scene==='play'||G.scene==='golden')) return;
    S.frames++;
    const b=G.ball;
    const u = Math.max(0, Math.min(0.9999, b.x/FW));
    S.bandX[(u*10)|0]++;
    S.minVerso[1]=Math.min(S.minVerso[1], Math.abs(FW-b.x));   // verso la porta di destra
    S.minVerso[0]=Math.min(S.minVerso[0], Math.abs(b.x));
    if(b.owner>=0){
      S.conPadrone++;
      const p=G.players[b.owner];
      if(p.role!=='gk'){
        const gx = p.team===0?FW:0;
        S.minPort[p.team]=Math.min(S.minPort[p.team], Math.abs(gx-p.x));
      }
    }
    /* LA PUNTA PIU' AVANZATA di ogni squadra, in unita' dalla porta
       avversaria: se non c'e' nessuno nell'ultimo terzo, il passaggio in
       profondita' non ha un bersaglio e il tiro non ha un tiratore. */
    let a0=1e9, a1=1e9;
    for(const q of G.players){
      if(q.out>0 || q.role==='gk') continue;
      if(q.team===0) a0=Math.min(a0, FW-q.x); else a1=Math.min(a1, q.x);
    }
    S.puntaS[0]+=a0; S.puntaS[1]+=a1; S.puntaN++;
    S.puntaMin[0]=Math.min(S.puntaMin[0],a0); S.puntaMin[1]=Math.min(S.puntaMin[1],a1);
  };

  window.__mu = { azzera, leggi(){ return JSON.parse(JSON.stringify(S)); } };
  return 'ok';
})()`;

const mediana = a => { if(!a.length) return 0; const b=a.slice().sort((x,y)=>x-y); const n=b.length; return n%2?b[(n-1)/2]:(b[n/2-1]+b[n/2])/2; };
const somma = a => a.reduce((s,x)=>s+x,0);

(async () => {
  const partite = Math.max(1, +arg('partite', 8) | 0);
  const semeBase = +arg('seme', 20260803);
  const diff = Math.max(0, Math.min(2, +arg('diff', 1) | 0));
  const taglia = [5,7,11].includes(+arg('taglia', 11)) ? +arg('taglia', 11) : 11;
  const prova = arg('gioco', process.env.GIOCO_PROVA || '');
  const provaAbs = prova ? path.resolve(prova) : '';
  if (provaAbs && !fs.existsSync(provaAbs)) { console.error('FALLITO: gioco inesistente: ' + provaAbs); process.exit(1); }

  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push('ECCEZIONE: ' + e.message));
  await pag.addInitScript(seme => {
    let s = seme >>> 0 || 1;
    const prossimo = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => prossimo() / 4294967296;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues = a => { for (let i=0;i<a.length;i++) a[i]=prossimo(); return a; };
    window.__caso = { semina(n) { s = n >>> 0 || 1; } };
  }, semeBase);
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => { const t=window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone=1; });
  const inst = await pag.evaluate(SONDA);
  if (inst !== 'ok') throw new Error('sonda non installata: ' + inst);

  console.log(`\n=== MISURA ${taglia} contro ${taglia} — ${partite} partite, semi ${semeBase}..${semeBase+partite-1} ===`);
  console.log('  --    gioco: ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)'));

  const out = [];
  for (let i=0;i<partite;i++){
    const r = await pag.evaluate(([seme,diff,taglia]) => {
      const t = window.__test;
      window.__caso.semina(seme);
      window.__mu.azzera();
      t.startMatch(1, diff, taglia!==5?{size:taglia}:undefined);
      t.setCpuVsCpu(true);
      let sim=0;
      while (t.state!=='end' && sim<600){ t.simulate(10); sim+=10; }
      const e = window.__mu.leggi();
      e.campo = t.campo;
      e.attr = (typeof TIRO_ATTR==='number'?TIRO_ATTR:1.0498);
      e.soglia = Math.min(FW*0.40, Math.max(500,(TIRO_TETTO-TIRO_ARRIVO[1])/(typeof TIRO_ATTR==='number'?TIRO_ATTR:1.0498)));
      return e;
    }, [(semeBase+i)>>>0, diff, taglia]);
    out.push(r);
  }
  await ctx.close(); await browser.close(); srv.chiudi();

  const c = out[0].campo;
  console.log(`  --    campo FW=${c.FW} FH=${c.FH} GOAL_H=${c.GOAL_H} giocatori=${c.giocatori}`);
  const f = (n,d)=> (typeof n==='number'? n.toFixed(d===undefined?1:d):String(n)).padStart(8);
  const R = (et, sel, d) => console.log('  ' + et.padEnd(34) + f(mediana(out.map(sel)), d) + '   (tot ' + somma(out.map(sel)).toFixed(0) + ')');

  console.log('\n  LA CATENA DEL TIRO (per partita, mediana)');
  R('decisioni del portatore CPU', x=>x.decisioni, 0);
  R('  di cui in zona di tiro', x=>x.inRange, 0);
  R('  solo distanza ok (fascia no)', x=>x.soloX, 0);
  R('  solo fascia ok (distanza no)', x=>x.soloY, 0);
  R('  ne l\'una ne l\'altra', x=>x.nessuno, 0);
  R('carica del tiro APERTA', x=>x.anticipoOK, 0);
  R('carica del tiro RIFIUTATA', x=>x.anticipoNO, 0);
  R('fireShot (tiri VERI su azione)', x=>x.tiri, 0);

  console.log('\n  DOVE STA IL PALLONE (percentuale dei fotogrammi, decimi di campo)');
  const bandTot = new Array(10).fill(0); let ftot=0;
  for(const o of out){ for(let i=0;i<10;i++) bandTot[i]+=o.bandX[i]; ftot+=o.frames; }
  console.log('  ' + bandTot.map(v=>((v/ftot*100).toFixed(1)).padStart(6)).join(''));
  console.log('  ' + ['0-10','10-20','20-30','30-40','40-50','50-60','60-70','70-80','80-90','90-100'].map(s=>s.padStart(6)).join(''));

  console.log('\n  PENETRAZIONE (unita\' dalla linea di porta, mediana sul minimo di partita)');
  R('palla, verso la porta di destra', x=>x.minVerso[1], 0);
  R('palla, verso la porta di sinistra', x=>x.minVerso[0], 0);
  R('PORTATORE sq.0 (attacca destra)', x=>x.minPort[0]>1e8?-1:x.minPort[0], 0);
  R('PORTATORE sq.1 (attacca sinistra)', x=>x.minPort[1]>1e8?-1:x.minPort[1], 0);
  const tuttiDec = [].concat(...out.map(o=>o.distDec));
  tuttiDec.sort((a,b)=>a-b);
  if(tuttiDec.length){
    const q = p => tuttiDec[Math.min(tuttiDec.length-1, Math.floor((tuttiDec.length-1)*p))];
    console.log(`\n  distX del portatore alla decisione: min ${q(0)}  d1 ${q(0.10)}  q1 ${q(0.25)}  mediana ${q(0.5)}  max ${q(1)}   (n=${tuttiDec.length})`);
    console.log(`  soglia di tiro in vigore: distX < ${out[0].soglia.toFixed(0)}  e  |y-FH/2| < ${(c.FH*0.40).toFixed(0)}   (attrito ${out[0].attr.toFixed(4)} per unita')`);
    const sotto = tuttiDec.filter(d=>d<out[0].soglia).length;
    console.log(`  decisioni sotto la soglia di distanza: ${sotto} su ${tuttiDec.length} (${(sotto/tuttiDec.length*100).toFixed(1)}%)`);
  }
  const tt = [].concat(...out.map(o=>o.tiriInfo));
  if(tt.length){
    console.log(`\n  I TIRI VERI (${tt.length} in tutto)`);
    console.log('    q  distX    dy      l     v0  resid');
    for(const s of tt.slice(0,25)) console.log(`    ${s.q}  ${String(s.distX).padStart(5)} ${String(s.dy).padStart(5)} ${String(s.l).padStart(6)} ${String(s.v0).padStart(6)} ${String(s.resid).padStart(6)}`);
    const rs = tt.map(s=>s.resid).sort((a,b)=>a-b);
    console.log(`    residuo al piano della porta: mediana ${mediana(rs)}  min ${rs[0]}  max ${rs[rs.length-1]}  |  sotto zero: ${rs.filter(x=>x<0).length}/${rs.length}`);
  } else console.log('\n  NESSUN TIRO SU AZIONE: fireShot non e\' mai stato chiamato.');

  /* ---- il passaggio contro l'attrito ---- */
  for(const [et, campo] of [['APPOGGI della CPU','passi'], ['RINVII del portiere','rinvii']]){
    const P = [].concat(...out.map(o=>o[campo])).filter(x=>x.l>=0);
    if(!P.length){ console.log(`\n  ${et}: nessuno`); continue; }
    const L=P.map(x=>x.l).sort((a,b)=>a-b), V=P.map(x=>x.portata).sort((a,b)=>a-b);
    const corti=P.filter(x=>x.portata < x.l).length;
    const q=(A,p)=>A[Math.min(A.length-1,Math.floor((A.length-1)*p))];
    console.log(`\n  ${et} — ${P.length} in tutto (${(P.length/partite).toFixed(1)} a partita)`);
    console.log(`    distanza voluta:  mediana ${mediana(L)}  q1 ${q(L,0.25)}  q3 ${q(L,0.75)}  max ${q(L,1)}`);
    console.log(`    corsa possibile:  mediana ${mediana(V)}  min ${q(V,0)}  max ${q(V,1)}   (= v0 / ${out[0].attr.toFixed(4)})`);
    console.log(`    NON ARRIVANO:     ${corti} su ${P.length} = ${(corti/P.length*100).toFixed(1)}%`);
    if(P[0].gain!==undefined){
      const Gn=P.map(x=>x.gain).sort((a,b)=>a-b);
      const av=Gn.reduce((s,x)=>s+x,0)/Gn.length;
      console.log(`    guadagno in avanti: media ${av.toFixed(0)}  mediana ${mediana(Gn)}  indietro ${Gn.filter(x=>x<0).length}/${Gn.length}`);
    }
  }

  console.log('\n  LA PUNTA PIU\' AVANZATA (unita\' dalla porta avversaria)');
  R('squadra 0, media nel tempo', x=>x.puntaS[0]/Math.max(1,x.puntaN), 0);
  R('squadra 1, media nel tempo', x=>x.puntaS[1]/Math.max(1,x.puntaN), 0);
  R('squadra 0, minimo di partita', x=>x.puntaMin[0], 0);
  R('squadra 1, minimo di partita', x=>x.puntaMin[1], 0);
  if(errori.length) console.log('\n  NO    ' + errori[0]);
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
