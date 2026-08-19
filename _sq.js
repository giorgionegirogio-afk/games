/* misura quanto scende davvero p.squash in una partita vera */
const fs=require('fs'),path=require('path'),http=require('http');
const {chromium}=require('playwright');
const RADICE=__dirname;
function servi(){return new Promise(ok=>{const s=http.createServer((q,r)=>{const f=path.join(RADICE,decodeURIComponent(q.url.split('?')[0]));
 if(!f.startsWith(RADICE)||!fs.existsSync(f)){r.writeHead(404);r.end();return;}
 r.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});fs.createReadStream(f).pipe(r);});
 s.listen(0,'127.0.0.1',()=>ok({porta:s.address().port,chiudi:()=>s.close()}));});}
(async()=>{const srv=await servi();const b=await chromium.launch();
 const c=await b.newContext({viewport:{width:915,height:412},isMobile:true,hasTouch:true});
 const p=await c.newPage();
 await p.addInitScript(sm=>{let s=sm>>>0||1;const n=()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s>>>0;};Math.random=()=>n()/4294967296;},20260728);
 await p.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`,{waitUntil:'load'});
 await p.waitForFunction('window.__test!==undefined',null,{timeout:20000});
 const r=await p.evaluate(async()=>{const t=window.__test;t.dismissSplash&&t.dismissSplash();
   t.startMatch(1,1);t.setCpuVsCpu(true);
   let min=99,max=-99,sotto085=0,sotto050=0,neg=0,tot=0;
   for(let i=0;i<3600;i++){t.simulate(1/60);
     for(const g of (t.players||[])){const s=g.squash;if(s==null||!isFinite(s))continue;
       tot++;if(s<min)min=s;if(s>max)max=s;if(s<0.85)sotto085++;if(s<0.50)sotto050++;if(s<=0)neg++;}}
   return {min,max,tot,sotto085,sotto050,neg};});
 console.log('campioni:',r.tot,'| min',r.min.toFixed(4),'| max',r.max.toFixed(4));
 console.log('sotto 0,85:',r.sotto085,'('+(100*r.sotto085/r.tot).toFixed(2)+'%)  sotto 0,50:',r.sotto050,'  <=0:',r.neg);
 await c.close();await b.close();srv.chiudi();})();
