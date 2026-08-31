/* _crit10-sorteggi.js — la legge sui sorteggi, provata a runtime e non contata:
   stesse partite sui due file, stesso conto di dado(), stesso pallone.
   Misura anche la larghezza vera della cifra 0 a corpo 26 (numero spedito
   nel commento della pasticca). */
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

const CASI=[];
for(const taglia of [5,11]) for(const seme of [20260829,20260830,20260831]) CASI.push({taglia,seme});

async function gioca(file,VW,VH){
  const srv=await servi(fs.readFileSync(path.resolve(RADICE,file),'utf8'));
  const br=await chromium.launch();
  const ctx=await br.newContext({viewport:{width:VW,height:VH},deviceScaleFactor:1,isMobile:true,hasTouch:true,locale:'it-IT'});
  const pag=await ctx.newPage();
  await pag.addInitScript(BANCO);
  await pag.goto('http://127.0.0.1:'+srv.porta+'/CALCETTO-il-gioco.html?t='+Date.now(),{waitUntil:'load',timeout:60000});
  await pag.waitForFunction('window.__test !== undefined',null,{timeout:20000});
  const r=await pag.evaluate(async (CASI)=>{
    const t=window.__test,B=window.__banco,G=t.G;
    try{t.dismissSplash&&t.dismissSplash();}catch(e){}
    B.passo(4); t.semina(1);
    {let fermi=0;for(let g=0;g<20&&fermi<2;g++){const a=t.sorteggi;await new Promise(r=>setTimeout(r,300));fermi=(t.sorteggi===a)?fermi+1:0;}}
    const cifra=(()=>{const cv=document.getElementById('gioco'),cg=cv.getContext('2d');
      const o=cg.font;cg.font='700 26px "Barlow Condensed","Arial Narrow","Segoe UI",sans-serif';
      const w0=cg.measureText('0').width, w8=cg.measureText('8').width, w1=cg.measureText('1').width;cg.font=o;
      return {zero:+w0.toFixed(2), otto:+w8.toFixed(2), uno:+w1.toFixed(2)};})();
    const out=[];
    for(const c of CASI){
      t.semina(c.seme); t.setCpuVsCpu(true);
      t.startMatch(1,1,{size:c.taglia});
      for(let i=0;i<900;i++){B.passo(1);if(t.state==='play')break;}
      const s0=t.sorteggi;
      B.passo(1800);
      const P=G.players||[];
      out.push({taglia:c.taglia,seme:c.seme,
        sorteggi:t.sorteggi-s0, tot:t.sorteggi,
        ball:[+G.ball.x.toFixed(6),+G.ball.y.toFixed(6),+((G.ball.z||0).toFixed(6))],
        score:G.score.join('-'), n:P.length,
        somma:+P.reduce((a,p)=>a+p.x*1.0003+p.y*0.9997,0).toFixed(6)});
    }
    return {cifra,out};
  },CASI);
  await br.close(); srv.chiudi();
  return r;
}
(async()=>{
  const A=await gioca('fuori/cmd-tabellone-base.html',915,412);
  const B=await gioca('fuori/cmd-tabellone.html',915,412);
  console.log('cifra a corpo 26 (Barlow Condensed 700): 0='+A.cifra.zero+'  8='+A.cifra.otto+'  1='+A.cifra.uno);
  let male=0;
  for(let i=0;i<A.out.length;i++){
    const a=A.out[i], b=B.out[i];
    const ok = a.sorteggi===b.sorteggi && a.tot===b.tot && a.ball.join()===b.ball.join() &&
               a.score===b.score && a.n===b.n && a.somma===b.somma;
    if(!ok) male++;
    console.log((ok?'  ok  ':'  NO  ')+a.taglia+'v'+a.taglia+' seme '+a.seme+
      '  sorteggi '+a.sorteggi+'/'+b.sorteggi+'  tot '+a.tot+'/'+b.tot+
      '  palla '+a.ball.join(',')+' | '+b.ball.join(',')+
      '  gol '+a.score+'/'+b.score+'  uomini '+a.n+'/'+b.n+
      '  somma '+a.somma+'/'+b.somma);
  }
  console.log(male?('ROSSO: '+male+' partite divergono'):'VERDE: le sei partite sono identiche sui due file');
  /* e il conto statico */
  const s=f=>fs.readFileSync(path.resolve(RADICE,f),'utf8');
  const c=(t,re)=>(t.match(re)||[]).length;
  const a=s('fuori/cmd-tabellone-base.html'), b=s('fuori/cmd-tabellone.html');
  console.log('conto statico dado(): '+c(a,/dado\(/g)+' -> '+c(b,/dado\(/g)+
    '   \\bdado\\s*\\(: '+c(a,/\bdado\s*\(/g)+' -> '+c(b,/\bdado\s*\(/g)+
    '   Math.random: '+c(a,/Math\.random\s*\(/g)+' -> '+c(b,/Math\.random\s*\(/g));
})();
