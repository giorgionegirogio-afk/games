/* _crit10-nome.js — che cosa succede al NOME che l'utente puo' davvero
   scrivere (input maxlength=12) su tre formati, ieri contro oggi.
   Replica in pagina le due aritmetiche (tetto 150f di ieri, 120f di oggi)
   col carattere VERO della pagina, e ritaglia la fascia del tabellone.
   uso: node strumenti/_crit10-nome.js */
const fs=require('fs'), path=require('path'), http=require('http');
const { chromium } = require('playwright');
const RADICE=path.resolve(__dirname,'..');
const TIPI={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.woff2':'font/woff2'};
function servi(src){return new Promise(ok=>{const s=http.createServer((rq,rs)=>{
  const u=decodeURIComponent(rq.url.split('?')[0]);
  const f=path.join(RADICE,u==='/'?'index.html':u);
  if(/CALCETTO-il-gioco\.html$/i.test(f)){rs.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});rs.end(src);return;}
  fs.readFile(f,(e,d)=>{if(e){rs.writeHead(404);rs.end('no');return;}
    rs.writeHead(200,{'Content-Type':TIPI[path.extname(f)]||'application/octet-stream','Cache-Control':'no-store'});rs.end(d);});
});s.listen(0,'127.0.0.1',()=>ok({porta:s.address().port,chiudi:()=>s.close()}));});}
const BANCO=()=>{const P=1000/60;let t=0,coda=[];
  window.requestAnimationFrame=cb=>{coda.push(cb);return coda.length;};
  window.cancelAnimationFrame=()=>{};
  try{performance.now=()=>t;}catch(e){}
  window.__banco={passo(n){n=Math.max(0,Math.round(+n||0));for(let i=0;i<n;i++){const c=coda;coda=[];t+=P;for(const f of c){try{f(t);}catch(e){}}}return t;}};};

const FORMATI=[[915,412,'915x412 telefono orizz.'],[810,384,'810x384 APK reale'],[412,915,'412x915 VERTICALE']];
const PROVE=['WWWWWWWWWWWW','MMMMMMMMMMMM','WWWWWWWWWWW','AVVOCATI WWW','DOPOLAVORO'];

(async()=>{
  const file=path.resolve(RADICE,'fuori/cmd-tabellone.html');
  const srv=await servi(fs.readFileSync(file,'utf8'));
  const br=await chromium.launch();
  for(const [VW,VH,et] of FORMATI){
    const ctx=await br.newContext({viewport:{width:VW,height:VH},deviceScaleFactor:1,isMobile:true,hasTouch:true,locale:'it-IT'});
    const pag=await ctx.newPage();
    await pag.addInitScript(BANCO);
    await pag.goto('http://127.0.0.1:'+srv.porta+'/CALCETTO-il-gioco.html?t='+Date.now(),{waitUntil:'load',timeout:60000});
    await pag.waitForFunction('window.__test !== undefined',null,{timeout:20000});
    const r=await pag.evaluate(async (PROVE)=>{
      const t=window.__test,B=window.__banco,G=t.G;
      try{t.dismissSplash&&t.dismissSplash();}catch(e){}
      B.passo(4); t.semina(1);
      {let fermi=0;for(let g=0;g<20&&fermi<2;g++){const a=t.sorteggi;await new Promise(r=>setTimeout(r,300));fermi=(t.sorteggi===a)?fermi+1:0;}}
      t.semina(20260829); t.setCpuVsCpu(true); t.startMatch(1,1,{size:11});
      for(let i=0;i<900;i++){B.passo(1);if(t.state==='play')break;}
      const cv=document.getElementById('gioco'), cg=cv.getContext('2d');
      const FC='"Barlow Condensed","Arial Narrow","Segoe UI",sans-serif';
      const clamp=(v,a,b)=>v<a?a:v>b?b:v;
      const f=clamp((innerWidth/2-52)/248,0.52,1);
      const mis=(s,fs)=>{const o=cg.font;cg.font='700 '+fs+'px '+FC;const w=cg.measureText(s).width;cg.font=o;return w;};
      /* l'aritmetica del gioco, parametrica nel tetto */
      const scegli=(nome,nw)=>{
        let fs=15,w=mis(nome,fs);
        if(w>nw){fs=11;w=mis(nome,fs);}
        if(w>nw){ let n=nome; while(n.length>1 && (w=mis(n+'…',fs))>nw) n=n.slice(0,-1); return {fs,testo:n+'…',tronca:true,w}; }
        return {fs,testo:nome,tronca:false,w};
      };
      const out=[];
      for(const nome of PROVE){
        const ieri=scegli(nome,150*f), oggi=scegli(nome,120*f);
        out.push({nome, f:+f.toFixed(4), w15:+mis(nome,15).toFixed(2), w11:+mis(nome,11).toFixed(2),
          ieri:{fs:ieri.fs,testo:ieri.testo,tronca:ieri.tronca},
          oggi:{fs:oggi.fs,testo:oggi.testo,tronca:oggi.tronca}});
      }
      return out;
    },PROVE);
    console.log('\n=== '+et+'  (f='+r[0].f+', tetto ieri '+(150*r[0].f).toFixed(1)+' / oggi '+(120*r[0].f).toFixed(1)+') ===');
    for(const x of r){
      const peggio = (x.oggi.fs<x.ieri.fs) || (x.oggi.tronca&&!x.ieri.tronca);
      console.log('  '+x.nome.padEnd(14)+' @15px '+String(x.w15).padStart(6)+
        '   IERI '+String(x.ieri.fs).padStart(2)+'px "'+x.ieri.testo+'"'+
        '   OGGI '+String(x.oggi.fs).padStart(2)+'px "'+x.oggi.testo+'"'+
        (peggio?'   <<< PEGGIORATO':''));
    }
    await ctx.close();
  }
  await br.close(); srv.chiudi();
})();
