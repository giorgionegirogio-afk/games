/* _g-manipose.js — sonda usa e getta: dove finiscono i giunti delle tre
   pose nuove del portiere, e delle tre con cui vanno confrontate.
   uso: node strumenti/_g-manipose.js --gioco fuori/anim-seconda.html   */
const path = require('path');
const { servi, bancoDiProva, semeFisso } = require('./_posa.js');
const RADICE = path.resolve(__dirname, '..');
const arg = (n,d) => { const i=process.argv.indexOf('--'+n);
  return i>0&&process.argv[i+1]&&!process.argv[i+1].startsWith('--')?process.argv[i+1]:d; };
const GIOCO = path.resolve(arg('gioco', path.join(RADICE,'CALCETTO-il-gioco.html')));

(async () => {
  const { chromium } = require('playwright');
  const srv = await servi();
  const rel = path.relative(RADICE, GIOCO).split(path.sep).join('/');
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport:{width:915,height:412}, deviceScaleFactor:2 });
  const pag = await ctx.newPage();
  await pag.addInitScript(bancoDiProva);
  await pag.addInitScript(semeFisso, 20260829);
  await pag.goto('http://127.0.0.1:'+srv.porta+'/'+rel+'?q='+Date.now(), {waitUntil:'load'});
  await pag.evaluate(() => window.__banco.passo(20));
  const R = await pag.evaluate(() => {
    const B = Rig3D.banco;
    const N = {PELVIS:0,CHEST:1,NECK:2,HEAD:3,SHL:4,ELL:5,HAL:6,SHR:7,ELR:8,HAR:9,
               HIPL:10,KNL:11,FTL:12,HIPR:13,KNR:14,FTR:15,TOL:16,TOR:17};
    const out = {};
    const prove = [['pugni',[0.24,0.40,0.55,0.98]], ['respinta',[0.12,0.28,0.45,0.98]],
                   ['sfugge',[0.10,0.26,0.44,0.98]], ['attesaGK',[0.0,0.3,0.6]],
                   ['presa',[0.32,0.55,0.75]], ['fermo',[0.0,0.5]]];
    B.corpora(3,0);
    for (const [clip,fasi] of prove) {
      out[clip] = fasi.map(u => {
        B.posa(clip,u);
        const g = {};
        for (const k in N) g[k] = [ +B.P[N[k]*3].toFixed(3), +B.P[N[k]*3+1].toFixed(3), +B.P[N[k]*3+2].toFixed(3) ];
        let cima=-9, minY=9; for(let j=0;j<B.NJ;j++){ const y=B.P[j*3+1]; if(y>cima)cima=y; if(y<minY)minY=y; }
        return { u, HEAD:g.HEAD, HAR:g.HAR, HAL:g.HAL, FTR:g.FTR, FTL:g.FTL, PELVIS:g.PELVIS,
                 cima:+cima.toFixed(3), quota:+minY.toFixed(3) };
      });
    }
    return out;
  });
  await br.close(); srv.chiudi();
  console.log(JSON.stringify(R, null, 1));
})().catch(e => { console.error('FALLITO: '+(e&&e.stack||e)); process.exit(1); });
