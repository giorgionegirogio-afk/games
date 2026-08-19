/* =====================================================================
   SONDA "INTENZIONE" — di sola lettura sul gioco.
   Misura le quattro cose su cui poggia lo schema di comandi proposto:
     A  la geometria DICHIARATA dei comandi (__test.comandiTouch), nei due
        contesti (con palla / senza palla), a 915x412 dpr 2;
     B  IL DITO ALZATO: quanti rilasci di levetta senza flick emettono un
        calcio, al variare della corsa della levetta;
     C  CENSIMENTO DELL'AMBIGUITA': su stati veri campionati in partita,
        quanto e' instabile la scelta del bersaglio del passaggio fra due
        fotogrammi adiacenti, e quanti compagni cadono nel cono della
        levetta (5v5, 7v7, 11v11);
     D  TAP contro TENUTA sotto un telefono lento: quanto si deforma la
        DURATA misurata dalla pagina con la CPU rallentata 1x/4x/6x.
   Non modifica CALCETTO-il-gioco.html.
   ===================================================================== */
const http = require('http'); const fs = require('fs'); const path = require('path');
const { chromium } = require('playwright');
const ROOT = 'C:/Users/Utenteee/Desktop/GitHub/games'; const PORT = 8842;

const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/CALCETTO-il-gioco.html';
  fs.readFile(path.join(ROOT, p), (e, d) => {
    if (e) { res.writeHead(404); res.end('no'); return; }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(d);
  });
});

const HELP = `
window.__S = {
  cv: document.getElementById('gioco'),
  fire(tipo, id, x, y){
    const tc = new Touch({identifier:id, target:window.__S.cv, clientX:x, clientY:y, pageX:x, pageY:y});
    window.__S.cv.dispatchEvent(new TouchEvent(tipo,{
      changedTouches:[tc], touches:tipo==='touchend'?[]:[tc],
      targetTouches:tipo==='touchend'?[]:[tc], bubbles:true, cancelable:true}));
  },
  /* mette il comandato di squadra 0 col pallone ai piedi, fermo, in mezzo
     al campo, e allontana tutti gli altri: lo stato piu' semplice in cui
     un rilascio possa essere letto */
  piazza(x,y,fx,fy){
    const T=window.__test, P=T.players, b=T.ball;
    const g=P.filter(p=>p.team===0&&p.role!=='gk'); const me=g[0];
    for(let i=0;i<20;i++){
      for(const p of g) if(p!==me){ p.x=x-260; p.y=y+120; p.vx=0; p.vy=0; }
      for(const p of P) if(p.team===1){ p.x=x+300; p.y=y-140; p.vx=0; p.vy=0; }
      me.x=x; me.y=y; me.vx=0; me.vy=0; me.fx=fx; me.fy=fy;
      me.kickCd=0; me.charge=-1; me.slide=-1; me.recover=0;
      b.owner=P.indexOf(me); b.passTo=-1;
      b.x=me.x+16*fx; b.y=me.y+16*fy; b.z=0; b.vx=0; b.vy=0; b.vz=0;
      T.simulate(1/60);
    }
    return P.indexOf(me);
  },
  /* ---- il punteggio del passaggio, RICOPIATO dal gioco (righe ~9076 e
     ~9096): smarcato() + bonus di avanzamento + scarto dalla distanza
     comoda 170. E' una copia, non una chiamata: il gioco non lo espone. */
  smarcato(p,q,t){
    const P=window.__test.players;
    let openness=0;
    for(const o of P){
      if(o.team===t || o.out>0) continue;
      const dd=Math.hypot(o.x-q.x,o.y-q.y);
      openness += Math.max(0,Math.min(220,dd));
      const ax=q.x-p.x, ay=q.y-p.y, al=Math.max(1,Math.hypot(ax,ay));
      const px=o.x-p.x, py=o.y-p.y;
      const t2=Math.max(0,Math.min(1,(px*ax+py*ay)/(al*al)));
      const dLine=Math.hypot(px-ax*t2, py-ay*t2);
      if(dLine<40 && t2>0.1 && t2<0.95) openness-=260;
    }
    return openness;
  },
  classificaPass(pi){
    const T=window.__test, P=T.players, p=P[pi], t=p.team;
    const out=[];
    for(const q of P){
      if(q.team!==t || q===p || q.out>0 || q.role==='gk') continue;
      let s=window.__S.smarcato(p,q,t);
      s += (t===0? q.x-p.x : p.x-q.x)*0.9;
      s -= Math.abs(Math.hypot(q.x-p.x,q.y-p.y)-170)*0.4;
      out.push({i:P.indexOf(q), s:s});
    }
    out.sort((a,b)=>b.s-a.s);
    return out;
  },
  /* quanti compagni cadono nel cono della levetta (dot>0.5), per 8 direzioni */
  cono(pi){
    const T=window.__test, P=T.players, p=P[pi], t=p.team;
    const res=[];
    for(let k=0;k<8;k++){
      const a=k*Math.PI/4, mx=Math.cos(a), my=Math.sin(a);
      const cand=[];
      for(const q of P){
        if(q.team!==t || q===p || q.out>0 || q.role==='gk') continue;
        const dx=q.x-p.x, dy=q.y-p.y, l=Math.max(1,Math.hypot(dx,dy));
        const dot=(dx*mx+dy*my)/l;
        if(dot>0.5) cand.push({i:P.indexOf(q), dot:dot});
      }
      cand.sort((a,b)=>b.dot-a.dot);
      res.push({dir:k, n:cand.length,
                primo: cand.length?cand[0].i:-1,
                margine: cand.length>1 ? +(cand[0].dot-cand[1].dot).toFixed(4) : null});
    }
    return res;
  }
};
`;

function pct(a, b) { return b ? +(100 * a / b).toFixed(1) : 0; }
function quantili(v) {
  if (!v.length) return null;
  const s = v.slice().sort((a, b) => a - b);
  const q = f => s[Math.min(s.length - 1, Math.floor(f * s.length))];
  return { min: +s[0].toFixed(1), p50: +q(0.5).toFixed(1), p90: +q(0.9).toFixed(1), max: +s[s.length - 1].toFixed(1) };
}

(async () => {
  await new Promise(r => srv.listen(PORT, r));
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 915, height: 412 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true
  });
  page.on('pageerror', e => console.log('ERR', String(e)));
  const url = `http://127.0.0.1:${PORT}/CALCETTO-il-gioco.html?cb=${Date.now()}`;
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.__test, null, { timeout: 30000 });

  const R = {};

  /* ================= A — geometria dichiarata ================= */
  await page.evaluate(() => { window.__test.dismissSplash(); window.__test.startMatch(1, 1, { size: 5 }); window.__test.simulate(1.5); });
  await page.evaluate(HELP);

  R.A = await page.evaluate(() => {
    const T = window.__test, out = {};
    const leggi = () => { T.disegna(); return T.comandiTouch.map(z => ({
      tipo: z.tipo, act: z.act, label: z.label,
      x: z.x === undefined ? null : Math.round(z.x), y: z.y === undefined ? null : Math.round(z.y), r: z.r,
      x0: Math.round(z.x0), y0: Math.round(z.y0), x1: Math.round(z.x1), y1: Math.round(z.y1),
      alpha: z.alpha })); };
    window.__S.piazza(560, 280, 1, 0);              // con palla
    out.conPalla = leggi();
    T.ball.owner = -1; T.ball.vx = 0; T.ball.vy = 0; T.simulate(1 / 60);
    out.senzaPalla = leggi();
    out.bande = T.bande; out.vw = innerWidth; out.vh = innerHeight; out.dpr = devicePixelRatio;
    return out;
  });

  /* ================= B — il dito alzato ================= */
  const corse = [0, 8, 20, 46, 70];
  R.B = [];
  for (const d of corse) {
    let calci = 0, persi = 0;
    const N = 12;
    for (let k = 0; k < N; k++) {
      const esito = await (async () => {
        await page.evaluate(() => { window.__S.piazza(560, 280, 1, 0); });
        await page.evaluate(() => { window.__S.fire('touchstart', 77, 200, 300); });
        await page.waitForTimeout(40);
        if (d > 0) await page.evaluate(dd => { window.__S.fire('touchmove', 77, 200 + dd, 300); }, d);
        // il dito RESTA FERMO mezzo secondo: e' una persona che ha smesso di giocare
        await page.waitForTimeout(500);
        return await page.evaluate(dd => {
          const T = window.__test, b = T.ball;
          const own0 = b.owner;
          window.__S.fire('touchend', 77, 200 + dd, 300);
          T.simulate(2 / 60);
          const calcio = (b.owner !== own0) || Math.hypot(b.vx, b.vy) > 30;
          T.simulate(1.0);
          const nostro = b.owner >= 0 ? (T.players[b.owner].team === 0) : null;
          return { calcio, nostro };
        }, d);
      })();
      if (esito.calcio) calci++;
      if (esito.nostro === false) persi++;
    }
    R.B.push({ corsaPx: d, prove: N, calciDaRilascio: calci, possessoAvversarioDopo1s: persi });
  }

  /* ================= C — censimento dell'ambiguita' ================= */
  R.C = {};
  for (const size of [5, 7, 11]) {
    await page.evaluate(sz => {
      window.__test.startMatch(1, 2, { size: sz });
      window.__test.setCpuVsCpu(true);
      window.__test.simulate(2);
    }, size);
    const c = await page.evaluate(() => {
      const T = window.__test, S = window.__S;
      let campioni = 0, ribaltati = 0, ribaltatiStretti = 0;
      const margini = [], conoN = [], conoMarg = [];
      let coniVuoti = 0, coniTot = 0, distinti = 0;
      for (let giro = 0; giro < 26; giro++) {
        T.simulate(3);
        for (let s = 0; s < 40; s++) {
          T.simulate(12 / 60);
          const b = T.ball;
          if (b.owner < 0) continue;
          const pi = b.owner;
          if (T.players[pi].role === 'gk') continue;
          const a = S.classificaPass(pi);
          if (a.length < 2) continue;
          campioni++;
          const marg = a[0].s - a[1].s;
          margini.push(marg);
          /* il cono della levetta, 8 direzioni */
          const co = S.cono(pi);
          const visti = new Set();
          for (const c of co) {
            coniTot++;
            if (c.n === 0) coniVuoti++; else visti.add(c.primo);
            if (c.n > 0) conoN.push(c.n);
            if (c.margine !== null) conoMarg.push(c.margine);
          }
          if (visti.size >= 2) distinti++;
          /* UN FOTOGRAMMA DOPO: la scelta e' la stessa? */
          T.simulate(1 / 60);
          if (T.ball.owner === pi) {
            const a2 = S.classificaPass(pi);
            if (a2.length && a2[0].i !== a[0].i) {
              ribaltati++;
              if (marg < 60) ribaltatiStretti++;
            }
          }
        }
      }
      return { campioni, ribaltati, ribaltatiStretti, margini, conoN, conoMarg,
               coniVuoti, coniTot, distinti };
    });
    R.C[size] = {
      campioni: c.campioni,
      ribaltamentoFraFotogrammiPct: pct(c.ribaltati, c.campioni),
      ribaltamentiConMargineStretto: c.ribaltatiStretti,
      margineTop1Top2: quantili(c.margini),
      coniVuotiPct: pct(c.coniVuoti, c.coniTot),
      compagniNelConoQuando: quantili(c.conoN),
      margineDotNelCono: quantili(c.conoMarg.map(x => x * 1000)), // in millesimi di dot
      levettaDistingue2UominiPct: pct(c.distinti, c.campioni),
    };
  }

  /* ================= D — durata sotto CPU rallentata ================= */
  R.D = [];
  const client = await page.context().newCDPSession(page);
  await page.evaluate(() => {
    window.__test.startMatch(1, 1, { size: 5 }); window.__test.simulate(1.0);
    window.__M = { ev: [] };
    const cv = document.getElementById('gioco');
    cv.addEventListener('touchstart', e => { window.__M.ev.push({ k: 's', t: performance.now() }); }, true);
    cv.addEventListener('touchend', e => { window.__M.ev.push({ k: 'e', t: performance.now() }); }, true);
  });
  for (const rate of [1, 4, 6]) {
    await client.send('Emulation.setCPUThrottlingRate', { rate });
    for (const voluto of [90, 400]) {
      const misure = [];
      for (let k = 0; k < 24; k++) {
        await page.evaluate(() => { window.__M.ev.length = 0; window.__S.fire('touchstart', 91, 300, 300); });
        await page.waitForTimeout(voluto);
        await page.evaluate(() => { window.__S.fire('touchend', 91, 300, 300); });
        const d = await page.evaluate(() => {
          const e = window.__M.ev;
          if (e.length < 2) return null;
          return e[e.length - 1].t - e[0].t;
        });
        if (d !== null) misure.push(d);
        await page.waitForTimeout(20);
      }
      const cls = misure.map(m => m >= 150 ? 'tenuta' : 'tap');
      R.D.push({
        cpuRallentata: rate + 'x', durataVoluta: voluto, prove: misure.length,
        durataMisurata: quantili(misure),
        lettiTap: cls.filter(c => c === 'tap').length,
        lettiTenuta: cls.filter(c => c === 'tenuta').length,
        sbagliati: cls.filter(c => (voluto < 150 ? c !== 'tap' : c !== 'tenuta')).length
      });
    }
  }
  await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });

  console.log(JSON.stringify(R, null, 1));
  await browser.close();
  srv.close();
})();
