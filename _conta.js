/* conta le operazioni di tracciato per fotogramma durante una partita vera */
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
    const P=CanvasRenderingContext2D.prototype;
    const nomi=['beginPath','fill','stroke','ellipse','arc','moveTo','lineTo','rect','fillRect','strokeRect','drawImage','save','restore','clip','fillText','createRadialGradient','createLinearGradient','translate','rotate','scale','closePath','setTransform','strokeText','quadraticCurveTo','bezierCurveTo'];
    const conta={}; const orig={};
    for(const n of nomi){ conta[n]=0; orig[n]=P[n]; (function(nn){P[nn]=function(){conta[nn]++;return orig[nn].apply(this,arguments);};})(n); }
    // conta anche i setter di stile
    let nFrame=0;
    await new Promise(fine=>{ const t0=performance.now(); function g(){ nFrame++; if(performance.now()-t0<4000) requestAnimationFrame(g); else fine(); } requestAnimationFrame(g); });
    for(const n of nomi) P[n]=orig[n];
    const out={}; for(const n of nomi) if(conta[n]>0) out[n]=+(conta[n]/nFrame).toFixed(1);
    out.__frames=nFrame;
    return out;
  });
  console.log(JSON.stringify(res,null,1));
  await ctx.close(); await browser.close(); srv.chiudi();
})().catch(e=>{console.error(e);process.exit(1);});
