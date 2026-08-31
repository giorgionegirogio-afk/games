/* _crit8-velo.js — QUANTO E' VELATO IL PRATO DENTRO UNA PASTIGLIA
   «VUOTA»? Il commento del gioco dice «dentro c'e' il prato con sopra
   il suo uomo: nessuna velatura, quindi nessuna ombra finta». Qui si
   misura: si fotografa la tela subito prima e subito dopo
   drawTouchButtons e si guarda quanta luce perdono i pixel DENTRO il
   buco dichiarato (r <= rInt-2), fuori dal riquadro dell'etichetta.
   uso: node strumenti/_crit8-velo.js --gioco fuori/comandi.html */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'CALCETTO-il-gioco.html')));
const VW = +arg('vw', 845), VH = +arg('vh', 402);
const TAGLIA = +arg('taglia', 11), SEC = +arg('sec', 20), OGNI = +arg('ogni', 3);
const SEMI = String(arg('semi', '20260828')).split(',').map(Number);
const ridirigi = f => /CALCETTO-il-gioco\.html$/i.test(f) ? GIOCO : f;
function servi() { return new Promise(ok => { const s = http.createServer((rq, rs) => { const u = decodeURIComponent(rq.url.split('?')[0]); const f = ridirigi(path.join(RADICE, u === '/' ? 'index.html' : u)); fs.readFile(f, (e, d) => { if (e) { rs.writeHead(404); rs.end('no'); return; } rs.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); rs.end(d); }); }); s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() })); }); }
const BANCO = () => { const PASSO = 1000 / 60; let t = 0, coda = []; window.requestAnimationFrame = cb => { coda.push(cb); return coda.length; }; window.cancelAnimationFrame = () => {}; try { performance.now = () => t; } catch (e) {} window.__banco = { passo(n) { for (let i = 0; i < (n | 0); i++) { const c = coda; coda = []; t += PASSO; for (const f of c) { try { f(t); } catch (e) {} } } return t; } }; };

const M = `async (cfg) => {
  const t = window.__test, B = window.__banco;
  try { t.dismissSplash && t.dismissSplash(); } catch(e){}
  B.passo(4); t.semina(1);
  { let fermi=0; for (let g=0; g<20 && fermi<2; g++){ const a=t.sorteggi; await new Promise(r=>setTimeout(r,300)); fermi=(t.sorteggi===a)?fermi+1:0; } }
  t.semina(cfg.seme); t.setCpuVsCpu(true); t.posaHUD(true);
  t.startMatch(1,1,{size:cfg.taglia});
  for (let i=0;i<900;i++){ B.passo(1); if (t.state==='play') break; }
  const cv=document.getElementById('gioco'), cg=cv.getContext('2d');
  let cattura=false, PRIMA=null, DOPO=null, RX0=0,RY0=0,RW=cv.width,RH=cv.height;
  const vero=window.drawTouchButtons;
  window.drawTouchButtons=function(){ if(cattura) PRIMA=cg.getImageData(RX0,RY0,RW,RH).data;
    const r=vero.apply(this,arguments); if(cattura) DOPO=cg.getImageData(RX0,RY0,RW,RH).data; return r; };
  const lum=(r,g,b)=>0.2126*r+0.7152*g+0.0722*b;
  const z={ dischiVuoti:0, dischiPieni:0, dentroMin:9, dentroMax:-1,
            perditaVuoto:0, nVuoto:0, perditaVuotoMax:0,
            perditaPieno:0, nPieno:0, istogramma:{} };
  for (let pas=0; pas<cfg.passi; pas++){
    if (pas%240===0) await new Promise(r=>setTimeout(r,0));
    cattura=(pas%cfg.ogni)===0; PRIMA=null; DOPO=null;
    B.passo(1);
    if (t.state!=='play' || !cattura || !PRIMA || !DOPO) continue;
    for (const d of (t.comandiTouch||[])){
      if (d.tipo!=='pulsante'||!(d.r>0)) continue;
      const den = d.dentro===undefined?1:d.dentro;
      const vuoto = den<0.15;
      if (vuoto){ z.dischiVuoti++; if(den<z.dentroMin)z.dentroMin=den; if(den>z.dentroMax)z.dentroMax=den;
                  const chi=(Math.round(den*100)/100).toFixed(2); z.istogramma[chi]=(z.istogramma[chi]||0)+1; }
      else z.dischiPieni++;
      const rI=(d.rInt||0)-2; if(rI<=0) continue;
      let somma=0, n=0, peggio=0;
      const x0=Math.max(0,Math.floor(d.x-rI)), x1=Math.min(cv.width,Math.ceil(d.x+rI));
      const y0=Math.max(0,Math.floor(d.y-rI)), y1=Math.min(cv.height,Math.ceil(d.y+rI));
      for (let y=y0;y<y1;y++) for (let x=x0;x<x1;x++){
        const dx=x-d.x, dy=y-d.y; if (dx*dx+dy*dy>rI*rI) continue;
        if (d.lab && x>=d.lab.x0-2 && x<=d.lab.x1+2 && y>=d.lab.y0-2 && y<=d.lab.y1+2) continue;
        const i=(y*cv.width+x)*4;
        const l0=lum(PRIMA[i],PRIMA[i+1],PRIMA[i+2]), l1=lum(DOPO[i],DOPO[i+1],DOPO[i+2]);
        const p = l0>1 ? Math.max(0,(l0-l1)/l0) : 0;
        somma+=p; n++; if(p>peggio) peggio=p;
      }
      if(!n) continue;
      if (vuoto){ z.perditaVuoto+=somma; z.nVuoto+=n; if(somma/n>z.perditaVuotoMax) z.perditaVuotoMax=somma/n; }
      else { z.perditaPieno+=somma; z.nPieno+=n; }
    }
  }
  return JSON.stringify(z);
}`;

(async () => {
  const srv = await servi(); const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'it-IT' });
  await ctx.addInitScript(BANCO);
  const tot = { dischiVuoti: 0, dischiPieni: 0, perditaVuoto: 0, nVuoto: 0, perditaPieno: 0, nPieno: 0, perditaVuotoMax: 0, dentroMin: 9, dentroMax: -1, istogramma: {} };
  for (const seme of SEMI) {
    const pag = await ctx.newPage();
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html?t=${Date.now()}`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    const o = JSON.parse(await pag.evaluate(`(${M})(${JSON.stringify({ seme, taglia: TAGLIA, passi: SEC * 60, ogni: OGNI })})`));
    tot.dischiVuoti += o.dischiVuoti; tot.dischiPieni += o.dischiPieni;
    tot.perditaVuoto += o.perditaVuoto; tot.nVuoto += o.nVuoto;
    tot.perditaPieno += o.perditaPieno; tot.nPieno += o.nPieno;
    tot.perditaVuotoMax = Math.max(tot.perditaVuotoMax, o.perditaVuotoMax);
    tot.dentroMin = Math.min(tot.dentroMin, o.dentroMin); tot.dentroMax = Math.max(tot.dentroMax, o.dentroMax);
    for (const k in o.istogramma) tot.istogramma[k] = (tot.istogramma[k] || 0) + o.istogramma[k];
    await pag.close();
  }
  await br.close(); srv.chiudi();
  console.log('\n=== IL VELO DENTRO LA PASTIGLIA «VUOTA» — ' + path.basename(GIOCO) + ' ===');
  console.log('  disco-fotogramma dichiarati VUOTI    ' + tot.dischiVuoti + '  (pieni ' + tot.dischiPieni + ')');
  console.log('  «dentro» dichiarato quando e\' vuoto  da ' + tot.dentroMin.toFixed(3) + ' a ' + tot.dentroMax.toFixed(3));
  console.log('  istogramma di «dentro»               ' + JSON.stringify(tot.istogramma));
  console.log('  LUCE persa dal prato DENTRO il buco  ' + (100 * tot.perditaVuoto / (tot.nVuoto || 1)).toFixed(2) + '%   (media su ' + tot.nVuoto + ' pixel)');
  console.log('  peggior disco-fotogramma vuoto       ' + (100 * tot.perditaVuotoMax).toFixed(2) + '%');
  console.log('  per confronto, dentro un disco PIENO ' + (100 * tot.perditaPieno / (tot.nPieno || 1)).toFixed(2) + '%\n');
})();
