/* DUE ELLISSI: due tracciati separati o un tracciato con due sotto-tracciati?
   Il conto delle operazioni dice che uno solo e' meglio. Il cronometro puo'
   dire il contrario, perche' il rasterizzatore ha una via veloce dedicata
   all'ELLISSE SINGOLA e la perde appena il tracciato ne contiene due. */
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
  await pag.waitForTimeout(1200);
  const res=await pag.evaluate(async()=>{
    const cv=document.querySelector('canvas'); const c=cv.getContext('2d');
    c.setTransform(2,0,0,2,0,0); c.scale(1.5,1.5);
    const N=400, M=8;                    // 8 coppie, come otto giocatori
    const banco=(nome,fn)=>{
      for(let i=0;i<12;i++) fn(); c.getImageData(0,0,1,1);
      const t0=performance.now();
      for(let i=0;i<N;i++) fn();
      c.getImageData(0,0,1,1);
      return nome+': '+(((performance.now()-t0)/N)*1000).toFixed(1)+' us per fotogramma';
    };
    const out=[];
    out.push(banco('separati  (2 beginPath, 2 fill, 2 stroke) x8', ()=>{
      c.fillStyle='#9fbf1e'; c.strokeStyle='rgba(0,0,0,.45)'; c.lineWidth=1.2;
      for(let k=0;k<M;k++){ const x=60+k*30,y=80;
        c.beginPath(); c.ellipse(x,y,5.6,3.5,0.4,0,6.2832); c.fill(); c.stroke();
        c.beginPath(); c.ellipse(x+9,y+9,5.6,3.5,0.4,0,6.2832); c.fill(); c.stroke(); }
    }));
    out.push(banco('uniti     (1 beginPath, 1 fill, 1 stroke) x8', ()=>{
      c.fillStyle='#9fbf1e'; c.strokeStyle='rgba(0,0,0,.45)'; c.lineWidth=1.2;
      for(let k=0;k<M;k++){ const x=60+k*30,y=180;
        c.beginPath();
        c.moveTo(x+5.6,y);      c.ellipse(x,y,5.6,3.5,0.4,0,6.2832);
        c.moveTo(x+9+5.6,y+9);  c.ellipse(x+9,y+9,5.6,3.5,0.4,0,6.2832);
        c.fill(); c.stroke(); }
    }));
    out.push(banco('pallone vecchio (tracciati) x1', ()=>{
      const x=400,y=260,B=8;
      c.fillStyle='#F2F5EF'; c.beginPath(); c.arc(x,y,B,0,6.2832); c.fill();
      c.strokeStyle='rgba(4,10,7,.95)'; c.lineWidth=1.9; c.stroke();
      c.strokeStyle='rgba(0,0,0,.22)'; c.lineWidth=2.2;
      c.beginPath(); c.arc(x,y,B-1.1,Math.PI*0.10,Math.PI*0.74); c.stroke();
      c.save(); c.beginPath(); c.arc(x,y,B,0,6.2832); c.clip();
      c.fillStyle='#0b1f16'; c.beginPath();
      for(let i=0;i<5;i++){ const a=i*1.25664-1.5708; const vx=x+Math.cos(a)*3.2, vy=y+Math.sin(a)*3.2; if(i)c.lineTo(vx,vy);else c.moveTo(vx,vy); }
      c.closePath(); c.fill();
      c.strokeStyle='rgba(11,31,22,.88)'; c.lineWidth=1.15; c.lineCap='round';
      for(let i=0;i<5;i++){ const a=i*1.25664-1.5708; c.beginPath();
        c.moveTo(x+Math.cos(a)*3.2,y+Math.sin(a)*3.2); c.lineTo(x+Math.cos(a)*5.9,y+Math.sin(a)*5.9); c.stroke(); }
      c.lineCap='butt'; c.restore();
      c.strokeStyle='rgba(255,255,255,.30)'; c.lineWidth=1.5;
      c.beginPath(); c.arc(x,y,B-0.7,Math.PI*1.06,Math.PI*1.74); c.stroke();
      c.strokeStyle='rgba(0,0,0,.18)'; c.lineWidth=1.8;
      c.beginPath(); c.arc(x,y,B-1.0,Math.PI*0.12,Math.PI*0.70); c.stroke();
    }));
    out.push(banco('pallone nuovo (2 drawImage) x1', ()=>{ pallone(400,260,8,1.2); }));
    out.push(banco('bisello: 2 archi ellittici contornati x8', ()=>{
      for(let k=0;k<M;k++){ const x=60+k*30,y=300;
        c.strokeStyle='rgba(20,30,58,.42)'; c.lineWidth=2.0;
        c.beginPath(); c.ellipse(x,y,11.4,9.6,0,Math.PI*0.05,Math.PI*0.72); c.stroke();
        c.strokeStyle='rgba(255,232,186,.55)'; c.lineWidth=2.2;
        c.beginPath(); c.ellipse(x,y,11.4,9.6,0,Math.PI*1.05,Math.PI*1.72); c.stroke(); }
    }));
    out.push(banco('un solo arco ellittico contornato x8', ()=>{
      for(let k=0;k<M;k++){ const x=60+k*30,y=300;
        c.strokeStyle='rgba(255,232,186,.55)'; c.lineWidth=2.2;
        c.beginPath(); c.ellipse(x,y,11.4,9.6,0,Math.PI*1.05,Math.PI*1.72); c.stroke(); }
    }));
    out.push(banco('fillText 4.4px x8', ()=>{
      c.fillStyle='#000'; c.font='900 4.4px system-ui'; c.textAlign='center'; c.textBaseline='middle';
      for(let k=0;k<M;k++) c.fillText('7',60+k*30,340);
    }));
    return out;
  });
  console.log(res.join('\n'));
  await c2.close(); await browser.close(); srv.chiudi();
})().catch(e=>{console.error(e);process.exit(1);});
