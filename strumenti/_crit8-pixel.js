/* =====================================================================
   _crit8-pixel.js — RIGHELLO INDIPENDENTE: quanti pixel di UOMO vengono
   DAVVERO ridipinti dai quattro dischi di comando.

   Non chiede niente al gioco se non le posizioni degli uomini. La
   maschera dei comandi si prende fotografando la tela SUBITO PRIMA e
   SUBITO DOPO drawTouchButtons, dentro lo stesso identico fotogramma:
   la differenza E' quello che i dischi dipingono, con la loro alfa
   vera. Nessun 'dentro', nessun 'rInt', nessun 'lab' dichiarato dal
   gioco: se il gioco mentisse sulla propria trasparenza, questo banco
   lo vedrebbe lo stesso.

   Due metri, non uno:
     · COPERTO  = frazione di pixel del corpo con differenza >= soglia
     · SPENTO   = quanta luminanza il corpo perde in media (0 = intatto,
                  1 = cancellato). E' il metro che vede il velo al 10%.
   ===================================================================== */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'CALCETTO-il-gioco.html')));
const TAGLIA = +arg('taglia', 11);
const SEC = +arg('sec', 20);
const SEMI = String(arg('semi', '20260828')).split(',').map(Number);
const VW = +arg('vw', 845), VH = +arg('vh', 402);
const OGNI = +arg('ogni', 5);
const SOGLIA = +arg('soglia', 8);
const JSONOUT = arg('json', '');

const ridirigi = f => /CALCETTO-il-gioco\.html$/i.test(f) ? GIOCO : f;
function servi() {
  return new Promise(ok => {
    const s = http.createServer((rq, rs) => {
      const u = decodeURIComponent(rq.url.split('?')[0]);
      const f = ridirigi(path.join(RADICE, u === '/' ? 'index.html' : u));
      fs.readFile(f, (e, d) => {
        if (e) { rs.writeHead(404); rs.end('no'); return; }
        const t = f.endsWith('.html') ? 'text/html' : f.endsWith('.js') ? 'text/javascript' : 'application/octet-stream';
        rs.writeHead(200, { 'Content-Type': t + '; charset=utf-8', 'Cache-Control': 'no-store' });
        rs.end(d);
      });
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
const BANCO = () => {
  const PASSO = 1000 / 60;
  let t = 0, coda = [], muto = false;
  window.requestAnimationFrame = cb => { if (muto) return 0; coda.push(cb); return coda.length; };
  window.cancelAnimationFrame = () => {};
  try { performance.now = () => t; } catch (e) {}
  window.__banco = {
    get tempo() { return t; },
    passo(n) { n = Math.max(0, Math.round(+n || 0));
      for (let i = 0; i < n; i++) { const c = coda; coda = []; t += PASSO; for (const f of c) { try { f(t); } catch (e) {} } }
      return t; },
    zitto() { muto = true; coda.length = 0; },
  };
};

const MISURA = `async (cfg) => {
  const t = window.__test, B = window.__banco;
  try { t.dismissSplash && t.dismissSplash(); } catch(e){}
  B.passo(4);
  t.semina(1);
  { let fermi=0; for (let g=0; g<20 && fermi<2; g++){ const a=t.sorteggi; await new Promise(r=>setTimeout(r,300)); fermi=(t.sorteggi===a)?fermi+1:0; } }
  t.semina(cfg.seme); t.setCpuVsCpu(true); t.posaHUD(true);
  t.startMatch(1,1,{size:cfg.taglia});
  for (let i=0;i<900;i++){ B.passo(1); if (t.state==='play') break; }

  const cv = document.getElementById('gioco');
  const cg = cv.getContext('2d');
  const RIG_H=34, P_DIS=1.18, RIG_PIEDI=10;
  const zone0 = (t.comandiTouch||[]).filter(q=>q.tipo==='pulsante'&&q.r>0);
  if (!zone0.length) return JSON.stringify({errore:'nessun disco al via'});
  let RX0=1e9,RY0=1e9,RX1=-1e9,RY1=-1e9;
  for (const d of zone0){ RX0=Math.min(RX0,d.x-d.r-12); RX1=Math.max(RX1,d.x+d.r+12);
                          RY0=Math.min(RY0,d.y-d.r-12); RY1=Math.max(RY1,d.y+d.r+14); }
  RX0=Math.max(0,Math.floor(RX0)); RY0=Math.max(0,Math.floor(RY0));
  RX1=Math.min(cv.width,Math.ceil(RX1)); RY1=Math.min(cv.height,Math.ceil(RY1));
  const RW=RX1-RX0, RH=RY1-RY0;

  let cattura=false, PRIMA=null, DOPO=null;
  const vero = window.drawTouchButtons;
  if (typeof vero !== 'function') return JSON.stringify({errore:'drawTouchButtons non e\\' globale'});
  window.drawTouchButtons = function(){
    if (cattura) PRIMA = cg.getImageData(RX0,RY0,RW,RH).data;
    const r = vero.apply(this, arguments);
    if (cattura) DOPO = cg.getImageData(RX0,RY0,RW,RH).data;
    return r;
  };
  const lum = (r,g,b)=> 0.2126*r+0.7152*g+0.0722*b;

  const z = { frames:0, campioni:0, uomini:0, sopra25:0, sopra50:0, tocchi:0,
              pxCorpo:0, pxCoperti:0, areaMask:0, peggio:0, dischi:0,
              spentoSomma:0, spentoMax:0, sopraSpento10:0, sopraSpento25:0,
              regione:[RX0,RY0,RW,RH] };
  const mask = new Uint8Array(RW*RH);
  const perd = new Float32Array(RW*RH);

  for (let pas=0; pas<cfg.passi; pas++) {
    if (pas % 240 === 0) await new Promise(r=>setTimeout(r,0));
    cattura = (pas % cfg.ogni)===0;
    PRIMA=null; DOPO=null;
    B.passo(1);
    if (t.state !== 'play') continue;
    z.frames++;
    if (!cattura || !PRIMA || !DOPO) continue;
    const v = t.view; if (!v || !v.S2) continue;
    const S2=v.S2, Ax=v.Ax, Ay=v.Ay, H=RIG_H*P_DIS*S2, w=16*S2;
    let nm=0;
    for (let i=0,k=0;k<mask.length;k++,i+=4){
      const d = Math.max(Math.abs(PRIMA[i]-DOPO[i]),Math.abs(PRIMA[i+1]-DOPO[i+1]),Math.abs(PRIMA[i+2]-DOPO[i+2]));
      mask[k] = d>=cfg.soglia ? 1 : 0; nm+=mask[k];
      const l0=lum(PRIMA[i],PRIMA[i+1],PRIMA[i+2]), l1=lum(DOPO[i],DOPO[i+1],DOPO[i+2]);
      perd[k] = l0>1 ? Math.max(0,(l0-l1)/l0) : 0;
    }
    z.areaMask += nm; z.campioni++;
    z.dischi += (t.comandiTouch||[]).filter(q=>q.tipo==='pulsante'&&q.r>0).length;
    let toccati=0;
    for (const p of G.players){
      if (p.out>0) continue;
      const px=p.x*S2+Ax, py=(p.y+RIG_PIEDI)*S2+Ay;
      const ax0=Math.max(0,px-w), ay0=Math.max(0,py-H), ax1=Math.min(cv.width,px+w), ay1=Math.min(cv.height,py);
      const area=Math.max(0,ax1-ax0)*Math.max(0,ay1-ay0);
      if (area<=0) continue;
      z.uomini++; z.pxCorpo+=area;
      const ix0=Math.max(Math.floor(ax0),RX0), iy0=Math.max(Math.floor(ay0),RY0);
      const ix1=Math.min(Math.ceil(ax1),RX1),  iy1=Math.min(Math.ceil(ay1),RY1);
      if (ix1<=ix0||iy1<=iy0) continue;
      let cop=0, perdita=0;
      for (let y=iy0;y<iy1;y++) for (let x=ix0;x<ix1;x++){
        const k=(y-RY0)*RW+(x-RX0); cop+=mask[k]; perdita+=perd[k]; }
      const areaInt=Math.max(1,Math.round(area));
      const q = cop/areaInt, s = perdita/areaInt;
      z.pxCoperti += cop; z.spentoSomma += perdita;
      if (s>z.spentoMax) z.spentoMax=s;
      if (q>0.02){ z.tocchi++; toccati++; }
      if (q>=0.25) z.sopra25++;
      if (q>=0.50) z.sopra50++;
      if (s>=0.10) z.sopraSpento10++;
      if (s>=0.25) z.sopraSpento25++;
    }
    if (toccati>z.peggio) z.peggio=toccati;
  }
  return JSON.stringify(z);
}`;

(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'it-IT' });
  await ctx.addInitScript(BANCO);
  const tot = { frames:0, campioni:0, uomini:0, sopra25:0, sopra50:0, tocchi:0, pxCorpo:0,
                pxCoperti:0, areaMask:0, peggio:0, dischi:0, spentoSomma:0, spentoMax:0,
                sopraSpento10:0, sopraSpento25:0 };
  let regione = null;
  for (const seme of SEMI) {
    const pag = await ctx.newPage();
    const err = []; pag.on('pageerror', e => err.push(e.message));
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html?t=${Date.now()}`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    const cfg = JSON.stringify({ seme, taglia: TAGLIA, passi: Math.round(SEC*60), ogni: OGNI, soglia: SOGLIA });
    const out = JSON.parse(await pag.evaluate(`(${MISURA})(${cfg})`));
    if (out.errore) { console.error('ERRORE: '+out.errore); process.exit(4); }
    regione = out.regione;
    if (err.length) console.log('  (errori di pagina: '+err.length+', primo: '+err[0].slice(0,120)+')');
    for (const k in tot) tot[k] = (k==='peggio'||k==='spentoMax') ? Math.max(tot[k], out[k]) : tot[k]+out[k];
    await pag.close();
  }
  await br.close(); srv.chiudi();
  const c = tot.campioni||1;
  const r = {
    gioco: path.basename(GIOCO), taglia: TAGLIA, semi: SEMI, sec: SEC, viewport: VW+'x'+VH,
    soglia: SOGLIA, regione, campioni: tot.campioni, fotogrammi: tot.frames,
    uominiPerCampione: +(tot.uomini/c).toFixed(2),
    tocchi: +(tot.tocchi/c).toFixed(3),
    sopra25: +(tot.sopra25/c).toFixed(3),
    sopra50: +(tot.sopra50/c).toFixed(3),
    quotaCorpoRidipinta: +(100*tot.pxCoperti/(tot.pxCorpo||1)).toFixed(3),
    quotaLucePersa: +(100*tot.spentoSomma/(tot.pxCorpo||1)).toFixed(3),
    uominiSpenti10: +(tot.sopraSpento10/c).toFixed(3),
    uominiSpenti25: +(tot.sopraSpento25/c).toFixed(3),
    spentoMax: +tot.spentoMax.toFixed(3),
    areaRidipinta: +(tot.areaMask/c).toFixed(0),
    peggio: tot.peggio,
  };
  console.log('\n=== PIXEL VERI — '+r.gioco+' · '+TAGLIA+'v'+TAGLIA+' · '+VW+'x'+VH+' · soglia '+SOGLIA+' ===');
  console.log('  regione                              '+JSON.stringify(regione));
  console.log('  fotogrammi di gioco / campionati     '+tot.frames+' / '+tot.campioni);
  console.log('  dischi per campione                  '+(tot.dischi/c).toFixed(2));
  console.log('  uomini in quadro per campione        '+r.uominiPerCampione);
  console.log('  uomini TOCCATI (>2% ridipinto)       '+r.tocchi);
  console.log('  uomini con >=25% di pixel ridipinti  '+r.sopra25);
  console.log('  uomini con >=50% di pixel ridipinti  '+r.sopra50);
  console.log('  quota di corpo RIDIPINTA             '+r.quotaCorpoRidipinta+'%');
  console.log('  --- il metro della LUCE (vede il velo debole) ---');
  console.log('  quota di LUCE del corpo persa        '+r.quotaLucePersa+'%');
  console.log('  uomini che perdono >=10% di luce     '+r.uominiSpenti10);
  console.log('  uomini che perdono >=25% di luce     '+r.uominiSpenti25);
  console.log('  peggior uomo (luce persa)            '+r.spentoMax);
  console.log('  area ridipinta dai comandi/campione  '+r.areaRidipinta+' px');
  console.log('  peggior campione                     '+r.peggio+' uomini toccati\n');
  if (JSONOUT) fs.writeFileSync(path.resolve(RADICE, JSONOUT), JSON.stringify(r, null, 1));
})();
