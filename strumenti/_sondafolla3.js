/* SONDA 3 — griglia finestra x soglia, con CONTROLLO NEGATIVO.
   Il controllo negativo congela la tribuna dall'esterno: intercetta le
   drawImage dell'atlante e rimette (a) la riga a braccia giu' e (b) la y
   che il tifoso aveva a riposo. Se un cancello passa anche cosi', misura
   una traslazione, non una forma.
   Il conteggio si fa DENTRO la pagina, per riga di schermo: passare i
   pixel a node costava minuti.
   uso: node strumenti/_sondafolla3.js [file.html] */
const fs=require('fs'), path=require('path'), http=require('http');
const { chromium } = require('playwright');
const RADICE=path.resolve(__dirname,'..');
const FILE=process.argv[2]||'CALCETTO-il-gioco.html';
const TIPI={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.json':'application/json'};
function servi(){return new Promise(ok=>{const s=http.createServer((req,res)=>{
  const p=decodeURIComponent(req.url.split('?')[0]); const f=path.join(RADICE,p==='/'?'index.html':p);
  if(!f.startsWith(RADICE)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);res.end('no');return;}
  res.writeHead(200,{'Content-Type':TIPI[path.extname(f)]||'application/octet-stream','Cache-Control':'no-store'});
  fs.createReadStream(f).pipe(res);}); s.listen(0,'127.0.0.1',()=>ok({porta:s.address().port,chiudi:()=>s.close()}));});}
function bancoDiProva(){const PASSO=1000/60;let t=0,coda=[];
  window.requestAnimationFrame=cb=>{coda.push(cb);return coda.length;};
  window.cancelAnimationFrame=()=>{};try{performance.now=()=>t;}catch(e){}
  window.__banco={passo(n){n=Math.max(0,Math.round(+n||0));
    for(let i=0;i<n;i++){const c=coda;coda=[];t+=PASSO;for(const f of c){try{f(t);}catch(e){}}}return t;}};}

const CIME=[34,50,70];
const FONDI=[108,116];
const SOGLIE=[250,300,380,430];

(async()=>{
  const srv=await servi(); const br=await chromium.launch();
  const ctx=await br.newContext({viewport:{width:915,height:412},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:'it-IT'});
  const pag=await ctx.newPage();
  await pag.addInitScript(seme=>{let s=seme>>>0||1;
    const p=()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s>>>0;};
    Math.random=()=>p()/4294967296;},20260728);
  await pag.addInitScript(bancoDiProva);
  pag.on('pageerror',e=>console.log('ECCEZIONE:',e.message));
  await pag.goto(`http://127.0.0.1:${srv.porta}/${FILE}`,{waitUntil:'load'});
  await pag.waitForFunction('window.__test !== undefined',null,{timeout:20000});
  await pag.waitForTimeout(400);
  await pag.evaluate(()=>window.__banco.passo(30));
  await pag.evaluate(()=>{
    window.__test.dismissSplash&&window.__test.dismissSplash();
    window.__test.startMatch(1,1);
    window.__test.Tut&&window.__test.Tut.finish&&window.__test.Tut.finish(true);
    window.__test.setCpuVsCpu(true); window.__test.simulate(4.0); window.__test.setTimeLeft(30);
    const G=window.__test.G; G.ball.x=FW*0.42; G.ball.y=FH-8; G.ball.vx=0; G.ball.vy=0; G.ball.z=0;
    for(const p of G.players) p.y=Math.min(p.y,FH-14);});
  await pag.evaluate(()=>window.__test.setPaused(true));
  await pag.evaluate(()=>window.__banco.passo(200));
  await pag.evaluate(()=>window.__test.setPaused(false));
  await pag.evaluate(()=>{window.__test.setTimeLeft(30);window.__test.disegna();});

  await pag.evaluate(()=>{
    const c=document.getElementById('gioco').getContext('2d');
    const orig=c.drawImage;
    window.__gelo={modo:'off', reg:[], k:0};
    c.drawImage=function(img,...a){
      const g=window.__gelo;
      if(img&&img.width===26*8&&img.height===26*6&&a.length===8){
        if(g.modo==='registra') g.reg.push(a[5]);
        else if(g.modo==='gela'){ a[1]=a[1]%(3*26); if(g.k<g.reg.length) a[5]=g.reg[g.k]; g.k++; }
        else if(g.modo==='soloBraccia'){ if(g.k<g.reg.length) a[5]=g.reg[g.k]; g.k++; }
        else if(g.modo==='soloSalto'){ a[1]=a[1]%(3*26); }
      }
      return orig.apply(this,[img,...a]);
    };
  });

  const geo=await pag.evaluate(()=>({VH,S2:window.__test.view.S2,Ay:window.__test.view.Ay,FH}));
  const ysc = u => Math.round(geo.Ay + (geo.FH+u)*geo.S2);   // unita' mondo -> riga schermo
  console.log('\nfile:',FILE,' S2=',geo.S2.toFixed(4),' Ay=',geo.Ay.toFixed(1),' VH=',geo.VH,' FH=',geo.FH);
  const YMIN=Math.max(0,ysc(Math.min(...CIME))), YMAX=Math.min(geo.VH,ysc(Math.max(...FONDI)));
  console.log('banda letta: righe schermo',YMIN,'..',YMAX);

  // per ogni fotogramma: conteggio per RIGA di schermo, per ogni soglia
  async function frame(modo,hype){
    return pag.evaluate(([m,h,y0,y1,soglie])=>{
      window.__gelo.modo=m; window.__gelo.k=0;
      if(m==='registra') window.__gelo.reg=[];
      window.__test.G.crowdHype=h; window.__test.disegna(); window.__gelo.modo='off';
      const c=document.getElementById('gioco').getContext('2d');
      const im=c.getImageData(0,y0*2,915*2,(y1-y0)*2).data;
      const W=915*2, H=(y1-y0)*2;
      const out=soglie.map(()=>new Array(H).fill(0));
      for(let y=0;y<H;y++){
        const base=y*W*4;
        for(let x=0;x<W;x++){
          const i=base+x*4, s=im[i]+im[i+1]+im[i+2];
          for(let k=0;k<soglie.length;k++) if(s>soglie[k]) out[k][y]++;
        }
      }
      return out;
    },[modo,hype,YMIN,YMAX,SOGLIE]);
  }
  const R0=await frame('registra',0);
  const R1=await frame('off',2.35);
  const R2=await frame('gela',2.35);
  const R3=await frame('soloBraccia',2.35);
  const R4=await frame('soloSalto',2.35);

  const somma=(arr,a,b)=>{let s=0;for(let y=a;y<b;y++) s+=arr[y]||0;return s;};
  console.log('\nfinestra      h  soglia     base     VERO  soloBRACCIA  soloSALTO  CONGELATO');
  for(const cy of CIME) for(const fy of FONDI){
    const y0=Math.max(0,ysc(cy)), y1=Math.min(geo.VH,ysc(fy));
    if(y1-y0<16) continue;
    const a0=(y0-YMIN)*2, a1=(y1-YMIN)*2;
    for(let k=0;k<SOGLIE.length;k++){
      const a=somma(R0[k],a0,a1), b=somma(R1[k],a0,a1), c=somma(R2[k],a0,a1);
      const d=somma(R3[k],a0,a1), e=somma(R4[k],a0,a1);
      const pc=x=>a?(100*(x/a-1)).toFixed(1)+'%':'n/d';
      console.log((cy+'-'+fy).padEnd(10), String(y1-y0).padStart(4),
        String('>'+SOGLIE[k]).padStart(7), String(a).padStart(8),
        pc(b).padStart(9), pc(d).padStart(12), pc(e).padStart(10), pc(c).padStart(10));
    }
  }
  await br.close(); srv.chiudi();
})();
