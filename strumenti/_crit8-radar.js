/* _crit8-radar.js — dove sta il radar, e il riquadro dell'avviso lo tocca? */
const fs=require('fs'),path=require('path'),http=require('http');const{chromium}=require('playwright');
const RADICE=path.resolve(__dirname,'..');
const arg=(n,d)=>{const i=process.argv.indexOf('--'+n);return i>0&&process.argv[i+1]&&!process.argv[i+1].startsWith('--')?process.argv[i+1]:d;};
const GIOCO=path.resolve(arg('gioco',path.join(RADICE,'CALCETTO-il-gioco.html')));
const rid=f=>/CALCETTO-il-gioco\.html$/i.test(f)?GIOCO:f;
function servi(){return new Promise(ok=>{const s=http.createServer((rq,rs)=>{const u=decodeURIComponent(rq.url.split('?')[0]);const f=rid(path.join(RADICE,u==='/'?'index.html':u));fs.readFile(f,(e,d)=>{if(e){rs.writeHead(404);rs.end('no');return;}rs.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});rs.end(d);});});s.listen(0,'127.0.0.1',()=>ok({porta:s.address().port,chiudi:()=>s.close()}));});}
const BANCO=()=>{const P=1000/60;let t=0,c=[];window.requestAnimationFrame=cb=>{c.push(cb);return c.length;};window.cancelAnimationFrame=()=>{};try{performance.now=()=>t;}catch(e){}window.__banco={passo(n){for(let i=0;i<(n|0);i++){const q=c;c=[];t+=P;for(const f of q){try{f(t);}catch(e){}}}return t;}};};
const M=`async (cfg)=>{const t=window.__test,B=window.__banco;
 try{t.dismissSplash&&t.dismissSplash();}catch(e){} B.passo(4); await document.fonts.ready;
 t.semina(cfg.seme); t.setCpuVsCpu(true); t.posaHUD(true); t.startMatch(1,1,{size:11});
 for(let i=0;i<900;i++){B.passo(1); if(t.state==='play')break;} B.passo(400);
 let n=0; for(const p of G.players){ if(p.team===0&&p.role!=='GK'&&!(p.out>0)&&n<1){p.out=11.7;n++;} }
 B.passo(3);
 return JSON.stringify({vw:innerWidth,vh:innerHeight,
   mini:(typeof MINI_RECT!=='undefined'&&MINI_RECT)?{x0:+MINI_RECT.x0.toFixed(1),y0:+MINI_RECT.y0.toFixed(1),x1:+MINI_RECT.x1.toFixed(1)}:null,
   avvisi:t.avvisi});}`;
(async()=>{const srv=await servi();const br=await chromium.launch();
 for(const [w,h] of [[915,412],[845,402],[740,360],[660,340],[600,320],[560,300],[500,300],[412,915]]){
  const ctx=await br.newContext({viewport:{width:w,height:h},deviceScaleFactor:1,isMobile:true,hasTouch:true,locale:'it-IT'});
  await ctx.addInitScript(BANCO); const pag=await ctx.newPage();
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html?t=${Date.now()}`,{waitUntil:'load'});
  await pag.waitForFunction('window.__test !== undefined',null,{timeout:20000});
  const o=JSON.parse(await pag.evaluate(`(${M})(${JSON.stringify({seme:20260828})})`));
  const a=(o.avvisi||[])[0];
  console.log(w+'x'+h+'  radar x0='+(o.mini?o.mini.x0:'-')+'  guardia scatta? '+(o.mini?(o.mini.x0<144):'-')+
    '  avviso box '+(a?(a.x0+'..'+a.x1+' y '+a.y0.toFixed(0)+'..'+a.y1.toFixed(0)):'-')+
    (a&&o.mini?('  sovrappone il radar? '+(a.x1>o.mini.x0 && a.y1>o.mini.y0)):''));
  await ctx.close(); }
 await br.close(); srv.chiudi();})();
