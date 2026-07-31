/* dove va il tempo del fotogramma: si cronometra ogni funzione di disegno */
const fs=require('fs'), path=require('path'), http=require('http');
const { chromium } = require('playwright');
const RADICE = 'C:/Users/Utenteee/Desktop/GitHub/games';
function servi(){return new Promise(ok=>{const s=http.createServer((req,res)=>{const f=path.join(RADICE,decodeURIComponent(req.url.split('?')[0]));if(!fs.existsSync(f)){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});fs.createReadStream(f).pipe(res);});s.listen(0,'127.0.0.1',()=>ok({porta:s.address().port,chiudi:()=>s.close()}));});}
(async()=>{
  const srv=await servi();
  const browser=await chromium.launch();
  const ctx=await browser.newContext({viewport:{width:915,height:412},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:'it-IT'});
  const pag=await ctx.newPage();
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`,{waitUntil:'load'});
  await pag.waitForFunction('window.__test !== undefined',null,{timeout:20000});
  await pag.waitForTimeout(500);
  await pag.evaluate(()=>{const t=window.__test;t.dismissSplash&&t.dismissSplash();t.startMatch(1,1);t.setCpuVsCpu(true);});
  await pag.waitForTimeout(1500);
  const res=await pag.evaluate(async()=>{
    const nomi=['drawCrowd','drawGoals','drawTrail','drawOmbreGiocatori','drawPlayer','drawBall','drawParticles','drawHUD','drawTouchSticks','drawTouchButtons','drawOverlaysCanvas','drawBloom','drawMoviola','render','update'];
    const t={}, n={};
    for(const f of nomi){
      if(typeof window[f]!=='function') continue;
      t[f]=0; n[f]=0;
      const o=window[f];
      window[f]=function(){const a=performance.now();const r=o.apply(this,arguments);t[f]+=performance.now()-a;n[f]++;return r;};
    }
    let nF=0;
    await new Promise(fine=>{const t0=performance.now();function g(){nF++;if(performance.now()-t0<4000)requestAnimationFrame(g);else fine();}requestAnimationFrame(g);});
    const out={};
    for(const f of nomi) if(t[f]!==undefined) out[f]=+(t[f]/nF).toFixed(2)+' ms x'+(n[f]/nF).toFixed(1);
    out.__fps=+(nF/4).toFixed(1);
    return out;
  });
  console.log(JSON.stringify(res,null,1));
  await ctx.close(); await browser.close(); srv.chiudi();
})().catch(e=>{console.error(e);process.exit(1);});
