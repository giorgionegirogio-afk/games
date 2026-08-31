/* =====================================================================
   _sonda-senza-dischi.js — IL RIGHELLO SI MISURA PRIMA DI MISURARE.

   Quattro domande al banco nuovo, e nessuna e' retorica:
     1  __test.disegna() ripetuto due volte, con la cura di _posa.js
        (renderDT a zero e camera rimessa a posto), lascia la regione dei
        dischi IDENTICA? Se no, ogni differenza che misurero' dopo e'
        rumore di fotogramma.
     2  __test.senzaDischi(true) toglie davvero i dischi dalla tela, e
        NON tocca niente fuori dalla loro regione?
     3  __test.soloDischi() li rimette dove erano, al pixel?
     4  l'alfa ricavata dai due sfondi coincide col 'dentro' dichiarato,
        sul gioco che dice la verita', e lo SMENTISCE sulla copia
        bugiarda?
   uso: node strumenti/_sonda-senza-dischi.js --gioco fuori/_sd-cura.html
   ===================================================================== */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const GIOCO = path.resolve(RADICE, arg('gioco', 'fuori/_sd-cura.html'));
const VW = +arg('vw', 845), VH = +arg('vh', 402);
const TAGLIA = +arg('taglia', 11), SEME = +arg('seme', 20260828), SEC = +arg('sec', 12);

const ridirigi = f => /CALCETTO-il-gioco\.html$/i.test(f) ? GIOCO : f;
function servi() {
  return new Promise(ok => {
    const s = http.createServer((rq, rs) => {
      const u = decodeURIComponent(rq.url.split('?')[0]);
      const f = ridirigi(path.join(RADICE, u === '/' ? 'index.html' : u));
      fs.readFile(f, (e, d) => {
        if (e) { rs.writeHead(404); rs.end('no'); return; }
        rs.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
        rs.end(d);
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

const M = `async (cfg) => {
  const t = window.__test, B = window.__banco, G = t.G;
  try { t.dismissSplash && t.dismissSplash(); } catch(e){}
  B.passo(4); t.semina(1);
  { let fermi=0; for (let g=0; g<20 && fermi<2; g++){ const a=t.sorteggi; await new Promise(r=>setTimeout(r,300)); fermi=(t.sorteggi===a)?fermi+1:0; } }
  t.semina(cfg.seme); t.setCpuVsCpu(true); t.posaHUD(true);
  t.startMatch(1,1,{size:cfg.taglia});
  for (let i=0;i<900;i++){ B.passo(1); if (t.state==='play') break; }
  for (let i=0;i<cfg.passi;i++) B.passo(1);

  const out = { ganci:{ senzaDischi: typeof t.senzaDischi, soloDischi: typeof t.soloDischi } };
  if (out.ganci.senzaDischi!=='function' || out.ganci.soloDischi!=='function') return JSON.stringify(out);

  const cv = document.getElementById('gioco'), cg = cv.getContext('2d');
  const K = cv.width / cfg.VW;
  const zone = (t.comandiTouch||[]).filter(q=>q.tipo==='pulsante'&&q.r>0);
  out.dischi = zone.length;
  if (!zone.length) return JSON.stringify(out);
  let X0=1e9,Y0=1e9,X1=-1e9,Y1=-1e9;
  for (const d of zone){ X0=Math.min(X0,d.x-d.r-14); X1=Math.max(X1,d.x+d.r+14);
                         Y0=Math.min(Y0,d.y-d.r-14); Y1=Math.max(Y1,d.y+d.r+16); }
  X0=Math.max(0,Math.floor(X0*K)); Y0=Math.max(0,Math.floor(Y0*K));
  X1=Math.min(cv.width,Math.ceil(X1*K)); Y1=Math.min(cv.height,Math.ceil(Y1*K));
  const RW=X1-X0, RH=Y1-Y0;
  out.regione=[X0,Y0,RW,RH];

  const leggi = () => cg.getImageData(X0,Y0,RW,RH).data;
  const leggiFuori = () => cg.getImageData(0,0,cv.width,cv.height).data;

  /* il disegno fermo, come in _posa.js: renderDT a zero e camera rimessa */
  const fermo = (senza) => {
    const c=G.cam, sc={x:c.x,y:c.y,z:c.z};
    const desc=Object.getOwnPropertyDescriptor(G,'renderDT');
    Object.defineProperty(G,'renderDT',{get:()=>0,set:()=>{},configurable:true});
    try { if(senza) t.senzaDischi(true); t.disegna(); }
    finally { if(senza) t.senzaDischi(false);
      delete G.renderDT; if(desc) Object.defineProperty(G,'renderDT',desc); else G.renderDT=1/60;
      c.x=sc.x; c.y=sc.y; c.z=sc.z; }
  };
  const diff = (a,b) => { let n=0,peg=0; for(let i=0;i<a.length;i+=4){
      const d=Math.max(Math.abs(a[i]-b[i]),Math.abs(a[i+1]-b[i+1]),Math.abs(a[i+2]-b[i+2]));
      if(d>0){ n++; if(d>peg) peg=d; } } return [n,peg]; };

  /* 1 — due disegni identici */
  const s0 = t.sorteggi;
  fermo(false); const A1 = leggi(); const TUTTO1 = leggiFuori();
  fermo(false); const A2 = leggi(); const TUTTO2 = leggiFuori();
  out.idemRegione = diff(A1,A2);
  out.idemSchermo = diff(TUTTO1,TUTTO2);

  /* 2 — senza dischi: cambia dentro la regione, e NIENTE fuori */
  fermo(true); const P = leggi(); const TUTTOP = leggiFuori();
  out.tolti = diff(A1,P);
  { let fuori=0; const w=cv.width;
    for(let y=0;y<cv.height;y++) for(let x=0;x<w;x++){
      if(x>=X0&&x<X1&&y>=Y0&&y<Y1) continue;
      const i=(y*w+x)*4;
      if(TUTTO1[i]!==TUTTOP[i]||TUTTO1[i+1]!==TUTTOP[i+1]||TUTTO1[i+2]!==TUTTOP[i+2]) fuori++; }
    out.fuoriRegione = fuori; }

  /* 3 — soloDischi li rimette dove erano */
  const nz = (t.comandiTouch||[]).length;
  t.soloDischi();
  out.zoneDopoSolo = (t.comandiTouch||[]).length - nz;
  const D1 = leggi();
  out.rimessi = diff(A1,D1);

  /* 4 — l'alfa dai due sfondi */
  const KK = new Uint8ClampedArray(P.length);
  for (let i=0;i<P.length;i+=4){ KK[i]=P[i]^128; KK[i+1]=P[i+1]^128; KK[i+2]=P[i+2]^128; KK[i+3]=255; }
  cg.putImageData(new ImageData(KK,RW,RH), X0, Y0);
  t.soloDischi();
  const D2 = leggi();
  out.sorteggiSpesi = t.sorteggi - s0;

  /* alfa per pixel: D1 = k + (1-a)P ; D2 = k + (1-a)K  =>  a = 1-(D1-D2)/(P-K) */
  const alfa = new Float32Array(RW*RH);
  for (let i=0,k=0;k<alfa.length;k++,i+=4){
    let s=0;
    for (let c=0;c<3;c++){
      const dp = P[i+c]-KK[i+c];
      s += 1 - (D1[i+c]-D2[i+c])/dp;
    }
    alfa[k]=Math.max(0,Math.min(1,s/3));
  }
  /* l'alfa media DENTRO ogni disco, contro il 'dentro' dichiarato */
  out.dischiMisurati = [];
  for (const d of zone){
    const rI = Math.max(0,(d.rInt===undefined? d.r-4 : d.rInt))-2;
    if (rI<=0) continue;
    let som=0,n=0;
    const cx=d.x*K, cy=d.y*K, rr=rI*K;
    for (let y=Math.max(Y0,Math.floor(cy-rr)); y<Math.min(Y1,Math.ceil(cy+rr)); y++)
      for (let x=Math.max(X0,Math.floor(cx-rr)); x<Math.min(X1,Math.ceil(cx+rr)); x++){
        const dx=x+0.5-cx, dy=y+0.5-cy; if(dx*dx+dy*dy>rr*rr) continue;
        som+=alfa[(y-Y0)*RW+(x-X0)]; n++; }
    /* la ghiera: la corona fra r-3 e r+1 */
    let sg=0,ng=0; const r0=(d.r-3)*K, r1=(d.r+1)*K;
    for (let y=Math.max(Y0,Math.floor(cy-r1)); y<Math.min(Y1,Math.ceil(cy+r1)); y++)
      for (let x=Math.max(X0,Math.floor(cx-r1)); x<Math.min(X1,Math.ceil(cx+r1)); x++){
        const dx=x+0.5-cx, dy=y+0.5-cy, q=dx*dx+dy*dy;
        if(q<r0*r0||q>r1*r1) continue;
        sg+=alfa[(y-Y0)*RW+(x-X0)]; ng++; }
    out.dischiMisurati.push({ label:d.label, dichiarato:d.dentro, alfaDentro:+(som/Math.max(1,n)).toFixed(3),
                              alfaGhiera:+(sg/Math.max(1,ng)).toFixed(3), px:n });
  }
  /* =====================================================================
     5 — I GANCI BOOLEANI, MESSI ALLA PROVA SULLA TELA.

     Un gancio che promette di cambiare il disegno e non cambia un pixel
     e' morto, e qui si vede invece di dedurlo. Due avvertenze, tutte e
     due imparate su questo blocco:

     ZERO PIXEL NON DIMOSTRA SEMPRE LA MORTE — puo' voler dire «in
     questa scena non c'era niente da cambiare» (setMoto senza
     particelle in quadro). Vale come prova solo dove il gancio, se
     vivo, dovrebbe per forza agire; per setTouchButtons vale, perche' i
     dischi sono in scena e la chiave si chiama cosi'.

     E QUESTO BLOCCO STA PER ULTIMO PERCHE' SPORCA. La colonna «torna»
     dice quanti pixel restano diversi dopo aver rimesso il gancio come
     stava: setDalt(1) seguito da setDalt(0) ne lascia diversi 1998, e
     messo in mezzo alla sonda falsava tutte le misure a valle
     (fuoriRegione passava da 1 a 2007). La ragione e' nel gioco:
     applyKit riscrive TEAMCOL[1] solo dentro il ramo SAVE.dalt, quindi
     spegnendo l'alto contrasto la divisa AVVERSARIA resta quella
     daltonica (#ff80e6 -> #9ccbff, misurato) fino al prossimo
     startMatch. Non e' un gancio morto: e' un gancio a senso unico. */
  out.ganciProvati = {};
  for (const [nome, acc, spe] of [['setTouchButtons',()=>t.setTouchButtons(false),()=>t.setTouchButtons(true)],
                                  ['senzaDischi',()=>t.senzaDischi(true),()=>t.senzaDischi(false)],
                                  ['posaHUD',()=>t.posaHUD(false),()=>t.posaHUD(true)],
                                  ['setMoto',()=>t.setMoto(0),()=>t.setMoto(1)],
                                  ['setDalt',()=>t.setDalt(1),()=>t.setDalt(0)]]) {
    fermo(false); const base = leggiFuori();
    try { acc(); } catch(e) {}
    fermo(false); const dopo = leggiFuori();
    try { spe(); } catch(e) {}
    fermo(false); const torna = leggiFuori();
    out.ganciProvati[nome] = { cambia: diff(base,dopo)[0], torna: diff(base,torna)[0] };
  }

  return JSON.stringify(out);
}`;

(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'it-IT' });
  await ctx.addInitScript(BANCO);
  const pag = await ctx.newPage();
  const err = []; pag.on('pageerror', e => err.push(e.message));
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html?t=${Date.now()}`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  const o = JSON.parse(await pag.evaluate(`(${M})(${JSON.stringify({ seme: SEME, taglia: TAGLIA, passi: Math.round(SEC * 60), VW, VH })})`));
  await br.close(); srv.chiudi();
  if (err.length) console.log('(errori di pagina: ' + err.length + ', primo: ' + err[0].slice(0, 140) + ')');
  console.log('\n=== SONDA — ' + path.basename(GIOCO) + ' ===');
  console.log(JSON.stringify(o, null, 2));
})();
