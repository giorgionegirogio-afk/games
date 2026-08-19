/* sonda usa-e-getta: QUANDO arrivano i legni in una partita, e dove.
   Serve a capire se undici pali sono undici episodi o un pallone
   incastrato. Non e' un cancello. */
const fs=require('fs'), path=require('path'), http=require('http');
const {chromium}=require('playwright');
const RADICE='C:/Users/Utenteee/Desktop/GitHub/games';
const [,,GIOCO,TAGLIA,SEME]=process.argv;
function servi(p){return new Promise(ok=>{const s=http.createServer((q,r)=>{let f=path.join(RADICE,decodeURIComponent(q.url.split('?')[0]));if(p&&/CALCETTO-il-gioco\.html$/i.test(f))f=p;if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);r.end();return;}r.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});fs.createReadStream(f).pipe(r);});s.listen(0,'127.0.0.1',()=>ok({porta:s.address().port,chiudi:()=>s.close()}));});}
const SONDA=`(()=>{const S={n:0,ev:[]};const _s=window.step,_b=window.showBanner;
window.showBanner=function(t){ if(t==='PALO!'||t==='TRAVERSA!') S.ev.push([S.n,t,Math.round(G.ball.x),Math.round(G.ball.y),Math.round(Math.hypot(G.ball.vx,G.ball.vy))]); return _b.apply(this,arguments); };
window.step=function(){_s.apply(this,arguments); if(G.scene==='play'||G.scene==='golden') S.n++;};
window.__sp={leggi:()=>S.ev,azzera:()=>{S.n=0;S.ev=[];}};return 'ok';})()`;
(async()=>{const srv=await servi(path.resolve(GIOCO));const br=await chromium.launch();
const ctx=await br.newContext({viewport:{width:915,height:412},isMobile:true,hasTouch:true});const pg=await ctx.newPage();
await pg.addInitScript(s0=>{let s=s0>>>0||1;const pr=()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s>>>0;};Math.random=()=>pr()/4294967296;window.__caso={semina(n){s=n>>>0||1;}};},20260803);
await pg.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`,{waitUntil:'load'});
await pg.waitForFunction('window.__test !== undefined',null,{timeout:20000});
await pg.evaluate(()=>{window.requestAnimationFrame=()=>0;});await pg.waitForTimeout(150);
await pg.evaluate(()=>{window.__test.dismissSplash&&window.__test.dismissSplash();});
await pg.evaluate(SONDA);
let ev=[];
for(let i=20260803;i<=+SEME;i++){
  ev=await pg.evaluate(([seme,taglia])=>{const t=window.__test;window.__caso.semina(seme);window.__sp.azzera();
  t.startMatch(1,1,taglia!==5?{size:taglia}:undefined);t.setCpuVsCpu(true);let s=0;while(t.state!=='end'&&s<600){t.simulate(10);s+=10;}return window.__sp.leggi();},[i,+TAGLIA]);
  if(i<+SEME) console.log('  (seme '+i+': '+ev.length+' legni)');
}
await br.close();srv.chiudi();
console.log('legni: '+ev.length);
let prev=-999; for(const e of ev){ console.log('  fotogramma '+String(e[0]).padStart(5)+' ('+(e[0]/60).toFixed(2)+' s)  '+e[1]+'  x='+e[2]+' y='+e[3]+' v='+e[4]+(e[0]-prev<30?'   <-- a meno di mezzo secondo dal precedente':'')); prev=e[0]; }
})();
