/* =====================================================================
   _t-partita-banco.js — UNA PARTITA GIOCATA DAVVERO (al banco), con
   l'etichetta dei pulsanti contata FOTOGRAMMA PER FOTOGRAMMA.

   PERCHE' NON BASTA IL BANCO CPU CONTRO CPU. _t-sonda-etichetta.js conta
   la stessa cosa su partite CPU contro CPU: e' ripetibile al fotogramma
   ed e' la misura buona per il confronto. Ma i pulsanti sono di CHI
   GIOCA, e in quelle partite non gioca nessuno: i passaggi sono della
   CPU, i tiri sono della CPU. Qui la partita la gioca un dito — due, in
   realta' — e i verbi sui pulsanti sono quelli che quel dito vede.
   Sarebbe stato meglio farlo sul telefono (strumenti/_t-partita-vera.js
   fa esattamente questo con i pollici del kernel): il telefono si e'
   messo in "unauthorized" a meta' lavoro e chiede una conferma sullo
   schermo che da qui non si puo' dare. Questo e' il ripiego, ed e'
   dichiarato tale.

   COME. Partita vera a tempo reale (il ciclo di disegno gira), squadra 0
   umana, due dita su Input.dispatchTouchEvent: il sinistro trascina la
   levetta A FONDO CORSA (80 px, cioe' oltre STICK_SPRINT 66 — e' quello
   che fa un pollice vero), il destro preme TIRA quando siamo in zona e
   FILTRANTE/CONTRASTA/CAMBIO altrimenti. Una sonda avvolge window.step e
   confronta, a ogni fotogramma, l'ETICHETTA del pulsante grande con la
   VERITA' sul pallone (nostro = di un nostro uomo o in volo verso un
   nostro uomo). Conta anche i pallonetti, che e' l'altro difetto.

   uso:  node strumenti/_t-partita-banco.js --etichetta PRIMA
         node strumenti/_t-partita-banco.js --gioco fuori/dopo.html --etichetta DOPO
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
  if (window.__pv) return 'gia';
  const S={f:0,nostra:0,loro:0,libera:0,lab:0,FN:0,FPloro:0,FPlibera:0,cambi:0,corti:0,
           lob:0,tiroBtn:0,tiro0:0,lob0:0,_lab:null,_da:0};
  const _step=window.step, _fire=window.fireShot;
  const teamOf=i=>(i>=0&&G.players[i])?G.players[i].team:-1;
  /* CHI HA TIRATO. Nella squadra 0 tirano anche i compagni guidati dalla
     IA: contarli insieme al dito confonde le due cose. La pila di chiamata
     dice se il tiro viene da releaseCharge, cioe' dal pulsante. */
  window.fireShot=function(p,nx,ny,q,lob){
    /* UN TIRO CHE NON PARTE NON E' UN TIRO. fireShot esce subito se il
       pallone non e' al piede ne' a portata, e quell'uscita sta PRIMA di
       G.stats.tiri++: contare le CHIAMATE invece dei tiri gonfiava i
       pallonetti (una chiamata con lob=true che tornava a vuoto veniva
       scritta come pallonetto, e il tabellino diceva zero). */
    const t0=G.stats.tiri[p.team];
    const r=_fire.apply(this,arguments);
    if(p.team!==0 || G.stats.tiri[0]===t0) return r;
    S.tiro0++; if(lob) S.lob0++;
    if((new Error().stack||'').indexOf('releaseCharge')>=0){ S.tiroBtn++; if(lob) S.lob++; }
    return r;
  };
  window.step=function(){
    _step.apply(this,arguments);
    if(!(G.scene==='play'||G.scene==='golden')) return;
    S.f++;
    const b=G.ball, to=teamOf(b.owner), tp=(b.owner<0)?teamOf(b.passTo):-1;
    const nostra=(to===0)||(tp===0), loro=(to===1)||(tp===1);
    const lab=!!possessoTeam(0);
    if(nostra) S.nostra++; else if(loro) S.loro++; else S.libera++;
    if(lab) S.lab++;
    if(!lab&&nostra) S.FN++;
    if(lab&&!nostra){ if(loro) S.FPloro++; else S.FPlibera++; }
    if(S._lab===null){ S._lab=lab; S._da=S.f; }
    else if(lab!==S._lab){ if(S.f-S._da<15) S.corti++; S.cambi++; S._lab=lab; S._da=S.f; }
  };
  window.__pv={ leggi(){ const o={}; for(const k in S) if(k[0]!=='_') o[k]=S[k]; return o; } };
  return 'ok';
})()`;

const LEGGI = `(()=>{const t=window.__test,G=t.G,b=G.ball,S=G.stats;
const me=G.ctrl&&G.ctrl[0]>=0?G.players[G.ctrl[0]]:null;
const bt=(t.pulsanti&&t.pulsanti(0))||[];
return {stato:t.state,punti:[...t.score],resta:t.timeLeft,c:{FW:t.campo.FW,FH:t.campo.FH},
 b:{x:b.x,y:b.y,own:b.owner,passTo:b.passTo},
 io:me?{x:me.x,y:me.y,idx:G.ctrl[0]}:null,
 g:G.players.map(p=>({t:p.team})),
 s:{tiri:S.tiri[0],pall:S.pallonetti[0]|0,perf:S.perfetti[0]|0,filt:(S.filtranti&&S.filtranti[0])|0,cross:(S.cross&&S.cross[0])|0},
 btn:bt.map(x=>({act:x.act,r:x.r,x:x.x,y:x.y}))};})()`;

(async () => {
  const ETI = arg('etichetta', 'OGGI');
  const RAGGIO = +arg('raggio', 80);
  const MAXSEC = +arg('maxsec', 300);
  const prova = arg('gioco', process.env.GIOCO_PROVA || '');
  const provaAbs = prova ? path.resolve(prova) : '';
  if (provaAbs && !fs.existsSync(provaAbs)) { console.error('gioco inesistente'); process.exit(1); }

  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push(e.message));
  await pag.addInitScript(() => {
    let s = 20260803 >>> 0;
    const pr = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => pr() / 4294967296;
  });
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
  if (await pag.evaluate(SONDA) !== 'ok') throw new Error('sonda non installata');
  await pag.evaluate(() => window.__test.startMatch(1, 1));
  const cdp = await ctx.newCDPSession(pag);
  const tp = (x, y, id) => ({ x, y, id, radiusX: 12, radiusY: 12, force: 1 });
  const manda = (type, punti) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: punti });

  const VW = 915, VH = 412;
  const CASA = { x: VW * 0.18, y: VH * 0.66 };
  let S = await pag.evaluate(LEGGI);
  const grande = S.btn.reduce((a, b) => (b.r || 0) > (a.r || 0) ? b : a, S.btn[0]);
  const piccolo = S.btn.find(b => b !== grande) || grande;
  const s0 = { ...S.s };
  console.log(`\n=== PARTITA GIOCATA AL BANCO — ${ETI} ===`);
  console.log('  --    gioco: ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)') + `  ·  pollice a ${RAGGIO} px`);

  let sinistro = tp(CASA.x, CASA.y, 1);
  await manda('touchStart', [sinistro]);
  let destroGiu = false, tiroFinoA = 0, destroLibero = 0;
  const t0 = Date.now();
  const aspetta = ms => new Promise(r => setTimeout(r, ms));

  while ((Date.now() - t0) / 1000 < MAXSEC) {
    S = await pag.evaluate(LEGGI);
    if (S.stato === 'end') break;
    const ora = Date.now();
    if (S.stato !== 'play' && S.stato !== 'kickoff' && S.stato !== 'golden') {
      /* gol, moviola, punizione: si tocca per andare avanti, come farebbe
         chi gioca. Senza questa riga la prima punizione ferma la partita
         e il banco misura 39 s di gioco in 300 di orologio. */
      if (destroGiu) { await manda('touchEnd', [tp(grande.x, grande.y, 2)]); destroGiu = false; }
      const q = tp(VW * 0.5, VH * 0.42, 3);
      await manda('touchStart', [sinistro, q]); await aspetta(50); await manda('touchEnd', [q]);
      await aspetta(150); continue;
    }
    if (!S.io) { await aspetta(60); continue; }
    const PORTA = { x: S.c.FW, y: S.c.FH / 2 };
    const sq = i => (i >= 0 && S.g[i]) ? S.g[i].t : -1;
    const mio = sq(S.b.own) === 0 || (S.b.own < 0 && sq(S.b.passTo) === 0);
    const hoIo = S.b.own === S.io.idx;
    let dx, dy;
    if (hoIo) { dx = PORTA.x - S.io.x; dy = PORTA.y - S.io.y; }
    else if (mio) { dx = PORTA.x - S.io.x; dy = (S.c.FH * (S.io.idx % 2 ? 0.28 : 0.72)) - S.io.y; }
    else { dx = S.b.x - S.io.x; dy = S.b.y - S.io.y; }
    const L = Math.hypot(dx, dy) || 1;
    sinistro = tp(CASA.x + dx / L * RAGGIO, CASA.y + dy / L * RAGGIO, 1);
    const destro = tp(grande.x, grande.y, 2);
    const dPorta = Math.hypot(PORTA.x - S.io.x, PORTA.y - S.io.y);
    if (destroGiu) {
      await manda('touchMove', [sinistro, tp(grande.x, grande.y, 2)]);
      if (ora >= tiroFinoA) { await manda('touchEnd', [tp(grande.x, grande.y, 2)]); destroGiu = false; destroLibero = ora + 260; }
    } else {
      await manda('touchMove', [sinistro]);
      if (ora >= destroLibero) {
        if (hoIo && dPorta < 430) { await manda('touchStart', [sinistro, destro]); destroGiu = true; tiroFinoA = ora + 620; }
        else {
          const b2 = hoIo ? piccolo : (Math.hypot(S.b.x - S.io.x, S.b.y - S.io.y) < 55 ? grande : piccolo);
          const d2 = tp(b2.x, b2.y, 2);
          await manda('touchStart', [sinistro, d2]); await aspetta(45); await manda('touchEnd', [d2]);
          destroLibero = ora + 900;
        }
      }
    }
    await aspetta(45);
  }
  await manda('touchEnd', []);
  const fine = await pag.evaluate(LEGGI);
  const P = await pag.evaluate('window.__pv.leggi()');
  await browser.close(); srv.chiudi();

  const f = Math.max(1, P.f);
  const durata = (Date.now() - t0) / 1000;
  console.log(`  punteggio                 ${fine.punti.join(' - ')}   (scena ${fine.stato}, ${durata.toFixed(0)} s di orologio)`);
  console.log(`  fotogrammi di gioco       ${P.f}  (${(P.f / 60).toFixed(0)} s di gioco)`);
  console.log(`  la palla e' nostra        ${(P.nostra / f * 100).toFixed(1)}%   loro ${(P.loro / f * 100).toFixed(1)}%   di nessuno ${(P.libera / f * 100).toFixed(1)}%`);
  console.log(`  il pulsante dice TIRA     ${(P.lab / f * 100).toFixed(1)}%`);
  console.log(`  ETICHETTA SBAGLIATA (FN)  ${P.FN} fotogrammi = ${(P.FN / f * 100).toFixed(2)}% del gioco (${(P.FN / 60).toFixed(1)} s)`);
  console.log(`  dice TIRA e l'ha l'avversario   ${P.FPloro}  (${(P.FPloro / f * 100).toFixed(2)}%)`);
  console.log(`  dice TIRA e la palla e' libera  ${P.FPlibera}  (${(P.FPlibera / f * 100).toFixed(2)}%)`);
  console.log(`  cambi di etichetta        ${P.cambi}  (${(P.cambi / (P.f / 3600)).toFixed(1)} al minuto di gioco)   sotto 0,25 s: ${P.corti}`);
  console.log(`  tiri COL PULSANTE (il dito) ${P.tiroBtn}   di cui PALLONETTI ${P.lob}`);
  console.log(`  tiri di tutta la squadra 0  ${P.tiro0}   di cui pallonetti ${P.lob0}   (gli altri li tirano i compagni IA)`);
  console.log(`  a tabellino: tiri ${fine.s.tiri - s0.tiri}  pallonetti ${fine.s.pall - s0.pall}  perfetti ${fine.s.perf - s0.perf}  filtranti ${fine.s.filt - s0.filt}  cross ${fine.s.cross - s0.cross}`);
  if (errori.length) console.log('  NO    eccezione di pagina: ' + errori[0]);
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
