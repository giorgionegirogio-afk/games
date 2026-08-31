/* =====================================================================
   _g-sorteggi.js — LA LEGGE SUI SORTEGGI, verificata invece che sperata.

   Le sonde di questa onda (_g-censo.js, _g-testa.js, _g-stanchezza.js)
   avvolgono `drawPlayer`, `Rig3D.disegna` e `colpoDiTesta`. Se una di
   loro pescasse anche un solo numero casuale, ogni banco a seme fisso
   del repo si sfaserebbe. Questo file gioca la STESSA partita due
   volte — una nuda, una con la sonda di _g-censo installata — e
   confronta il contatore `window.__quanti()` di _posa.js e il punteggio.

   Verde solo se i due conti sono IDENTICI e i due punteggi coincidono.

   uso: node strumenti/_g-sorteggi.js [--gioco f] [--sec 90] [--taglia 5]
   uscita: 0 verde, 1 rosso.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { servi, bancoDiProva, semeFisso } = require('./_posa.js');
const RADICE = path.resolve(__dirname, '..');
const arg = (n,d) => { const i=process.argv.indexOf('--'+n);
  return i>0&&process.argv[i+1]&&!process.argv[i+1].startsWith('--')?process.argv[i+1]:d; };
const GIOCO = path.resolve(arg('gioco', path.join(RADICE,'CALCETTO-il-gioco.html')));
const SEC = +arg('sec', 90);
const TAGLIA = +arg('taglia', 5);
const SEME = +arg('seme', 20260827);
const N = {1:5,2:7,3:11}[TAGLIA] || TAGLIA;

/* la sonda di _g-censo, ritagliata: le stesse tre avvolgiture */
const SONDA = String.raw`(() => {
  let conta = 0, fig = 0, clip = {};
  const dis0 = Rig3D.disegna;
  Rig3D.disegna = function(){ conta++; return dis0.apply(this, arguments); };
  if (typeof window.colpoDiTesta === 'function') {
    const c0 = window.colpoDiTesta;
    window.colpoDiTesta = function(){ return c0.apply(this, arguments); };
  }
  const dp0 = drawPlayer;
  window.drawPlayer = function(p){
    const prima = conta; dp0(p);
    if (conta === prima) return;
    fig++;
    const c = p.poseClip || '?'; clip[c] = (clip[c]|0)+1;
    const gi = Rig3D.giunti();
    let ymax=-1e9; for(let j=0;j<gi.n;j++) if(gi.y[j]>ymax) ymax=gi.y[j];
    if (typeof scudoAttivo === 'function') scudoAttivo(p);
  };
  window.__sonda = () => ({fig, clip});
  return 'ok';
})()`;

async function gioca(conSonda) {
  const { chromium } = require('playwright');
  const srv = await servi();
  const rel = path.relative(RADICE, GIOCO).split(path.sep).join('/');
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport:{width:915,height:412}, deviceScaleFactor:2 });
  const pag = await ctx.newPage();
  await pag.addInitScript(bancoDiProva);
  await pag.addInitScript(semeFisso, SEME);
  await pag.addInitScript(() => { window.requestIdleCallback=()=>0; window.cancelIdleCallback=()=>{}; });
  await pag.goto('http://127.0.0.1:'+srv.porta+'/'+rel+'?q='+Date.now(), {waitUntil:'load'});
  await pag.evaluate(() => window.__banco.passo(30));
  await pag.evaluate(([n,sec]) => {
    window.__test.dismissSplash && window.__test.dismissSplash();
    window.__test.startMatch(1,1,{size:n});
    window.__test.setCpuVsCpu(true);
    window.__test.setTimeLeft(sec+30);
  }, [N, SEC]);
  if (conSonda) await pag.evaluate(SONDA);
  const q0 = await pag.evaluate(() => window.__quanti());
  const frames = Math.round(SEC*60);
  for (let f=0; f<frames; f+=60) {
    const k = Math.min(60, frames-f);
    await pag.evaluate((m)=>{ for(let i=0;i<m;i++){ window.__test.simulate(1/60); window.__test.disegna(); } }, k);
  }
  const R = await pag.evaluate(() => ({
    sorteggi: window.__quanti(),
    score: [window.__test.G.score[0], window.__test.G.score[1]],
    sonda: window.__sonda ? window.__sonda().fig : -1,
  }));
  R.q0 = q0;
  await br.close(); srv.chiudi();
  return R;
}

(async () => {
  const nudo = await gioca(false);
  const consonda = await gioca(true);
  const dNudo = nudo.sorteggi - nudo.q0, dSonda = consonda.sorteggi - consonda.q0;
  console.log('LA LEGGE SUI SORTEGGI — '+path.relative(RADICE,GIOCO)+'  taglia '+N+'  '+SEC+' s  seme '+SEME);
  console.log('  senza sonda: '+dNudo+' sorteggi consumati, punteggio '+nudo.score.join('-'));
  console.log('  con sonda:   '+dSonda+' sorteggi consumati, punteggio '+consonda.score.join('-')+'  ('+consonda.sonda+' figure lette)');
  const ok = dNudo === dSonda && nudo.score[0]===consonda.score[0] && nudo.score[1]===consonda.score[1];
  console.log('  differenza: '+(dSonda-dNudo)+'   -> '+(ok?'VERDE: la sonda non pesca un solo numero':'ROSSO'));
  process.exit(ok ? 0 : 1);
})().catch(e => { console.error('FALLITO: '+(e&&e.stack||e)); process.exit(1); });
