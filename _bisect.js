/* micro-banco: quanto costa DAVVERO ogni pezzo, misurato dentro la pagina
   con un canvas della stessa misura e la stessa catena di comandi.
   Il tempo di rasterizzazione non si vede attorno a render(): si vede solo
   forzando la lettura del canvas (getImageData) che svuota la coda. */
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
    const cv=document.querySelector('canvas');
    const c=cv.getContext('2d');
    const N=60;
    const banco=(nome,fn)=>{
      // riscaldamento
      for(let i=0;i<8;i++) fn();
      c.getImageData(0,0,1,1);
      const t0=performance.now();
      for(let i=0;i<N;i++) fn();
      c.getImageData(0,0,1,1);   // svuota la coda: senza, si misura zero
      return nome+': '+((performance.now()-t0)/N).toFixed(3)+' ms';
    };
    const out=[];
    out.push(banco('render intero', ()=>render()));
out.push(banco('10 x drawBallAt', ()=>{ for(let i=0;i<10;i++) drawBallAt(200+i*20,200,0,i,false); }));
    if(typeof pallone==='function') out.push(banco('solo pallone x10', ()=>{ for(let i=0;i<10;i++) pallone(200+i*20,200,9,i); }));
    out.push(banco('solo ombre giocatori', ()=>drawOmbreGiocatori(G.players)));
    out.push(banco('fieldTex drawImage', ()=>{ c.drawImage(fieldTex,0,0,900,420); }));
    out.push(banco('vigTex drawImage', ()=>{ c.drawImage(vigTex,0,0,VW,VH); }));
    out.push(banco('drawCrowd', ()=>drawCrowd()));
    out.push(banco('drawHUD', ()=>drawHUD()));
    // otto giocatori dentro la trasformazione di camera
    out.push(banco('8 x drawPlayer', ()=>{
      c.save(); c.setTransform(DPR,0,0,DPR,0,0);
      c.translate(G.view.Ax,G.view.Ay); c.scale(G.view.S2,G.view.S2);
      for(const p of G.players) if(p.out<=0) drawPlayer(p);
      c.restore();
    }));
    return out;
  });
  console.log(res.join('\n'));
  await ctx.close(); await browser.close(); srv.chiudi();
})().catch(e=>{console.error(e);process.exit(1);});
