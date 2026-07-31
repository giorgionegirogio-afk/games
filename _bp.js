/* quanto costa ogni pezzo del disegno di un giocatore, misurato sul posto */
const fs=require('fs'), path=require('path'), http=require('http');
const { chromium } = require('playwright');
const RADICE = 'C:/Users/Utenteee/Desktop/GitHub/games';
function servi(){return new Promise(ok=>{const s=http.createServer((req,res)=>{const f=path.join(RADICE,decodeURIComponent(req.url.split('?')[0]));if(!fs.existsSync(f)){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});fs.createReadStream(f).pipe(res);});s.listen(0,'127.0.0.1',()=>ok({porta:s.address().port,chiudi:()=>s.close()}));});}
(async()=>{
  const srv=await servi();
  const browser=await chromium.launch();
  const c2=await browser.newContext({viewport:{width:915,height:412},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:'it-IT'});
  const pag=await c2.newPage();
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`,{waitUntil:'load'});
  await pag.waitForFunction('window.__test !== undefined',null,{timeout:20000});
  await pag.waitForTimeout(500);
  await pag.evaluate(()=>{const t=window.__test;t.dismissSplash&&t.dismissSplash();t.startMatch(1,1);t.setCpuVsCpu(true);});
  await pag.waitForTimeout(1500);
  const res=await pag.evaluate(async()=>{
    const cv=document.querySelector('canvas'); const c=cv.getContext('2d');
    const N=300;
    const banco=(nome,fn)=>{
      for(let i=0;i<10;i++) fn();
      c.getImageData(0,0,1,1);
      const t0=performance.now();
      for(let i=0;i<N;i++) fn();
      c.getImageData(0,0,1,1);
      return nome+': '+(((performance.now()-t0)/N)*1000).toFixed(1)+' us';
    };
    const cam=()=>{ c.setTransform(DPR,0,0,DPR,0,0); c.translate(G.view.Ax,G.view.Ay); c.scale(G.view.S2,G.view.S2); };
    const x=400,y=250;
    const out=[];
    out.push(banco('ellisse riempita+contorno', ()=>{ cam(); c.fillStyle='#d8ff3d'; c.strokeStyle='#000'; c.lineWidth=2.4;
      c.beginPath(); c.ellipse(x,y,11.4,9.6,0,0,6.2832); c.fill(); c.stroke(); }));
    out.push(banco('arco ellittico contornato (bisello)', ()=>{ cam(); c.strokeStyle='rgba(255,232,186,.55)'; c.lineWidth=2.2;
      c.beginPath(); c.ellipse(x,y,11.4,9.6,0,Math.PI*1.05,Math.PI*1.72); c.stroke(); }));
    out.push(banco('clip ellittico + 3 fillRect', ()=>{ cam(); c.save();
      c.beginPath(); c.ellipse(x,y,11.4,9.6,0,0,6.2832); c.clip();
      c.fillStyle='#9fbf1e'; c.fillRect(x-12,y-11,24,2.6); c.fillRect(x-12,y-0.7,24,1.4); c.fillRect(x-12,y+5.9,24,2.6);
      c.restore(); }));
    out.push(banco('fillText 4.4px', ()=>{ cam(); c.fillStyle='#000'; c.font='900 4.4px system-ui'; c.textAlign='center'; c.fillText('7',x,y); }));
    out.push(banco('drawImage 128->22px', ()=>{ cam(); c.drawImage(ombraTex,x-11,y-11,22,22); }));
    out.push(banco('save+translate+rotate+scale+restore', ()=>{ cam(); c.save(); c.translate(x,y); c.rotate(0.4); c.scale(1.1,0.9); c.restore(); }));
    out.push(banco('UN drawPlayer', ()=>{ cam(); drawPlayer(G.players[3]); }));
    return out;
  });
  console.log(res.join('\n'));
  await c2.close(); await browser.close(); srv.chiudi();
})().catch(e=>{console.error(e);process.exit(1);});
