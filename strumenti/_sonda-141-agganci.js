/* sonda usa-e-getta: i due agganci esistono, funzionano, e a ritardo
   spento il gioco e' identico al bit a quello di prima */
const fs=require('fs'),path=require('path'),http=require('http');
const {chromium}=require('playwright');
const RADICE=path.resolve(__dirname);
function servi(prova){return new Promise(ok=>{const s=http.createServer((q,r)=>{
  let f=path.join('C:/Users/Utenteee/Desktop/GitHub/games',decodeURIComponent(q.url.split('?')[0]));
  if(prova&&/CALCETTO-il-gioco\.html$/i.test(f)) f=prova;
  if(!fs.existsSync(f)){r.writeHead(404);r.end();return;}
  r.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
  fs.createReadStream(f).pipe(r);});s.listen(0,'127.0.0.1',()=>ok({p:s.address().port,c:()=>s.close()}));});}
const IMPR=`(()=>{const b=G.ball;let s=[Math.round(b.x*100),Math.round(b.y*100),Math.round(b.vx*100),Math.round(b.vy*100),G.score[0],G.score[1]];
for(const p of G.players)s.push(Math.round(p.x*100),Math.round(p.y*100));return s.join(',');})()`;
const COP=`(function(n,K){const t=window.__test;t.semina(20260923);t.registra();
 t.startMatch(1,1,{size:5,sponde:'gabbia',miraGuidata:'pieno'});
 if(K && t.ritardo) t.ritardo(K);
 const leggi=new Function('return '+IMPRX);const imp=[];
 const d=t.pulsanti(0);const gr=d[0]||{x:800,y:330};const LX=180,LY=300;
 let idL=1,idB=2,giu=false,giuB=false;
 for(let f=0;f<n;f++){
   const a=f*0.037, rr=34+22*Math.sin(f*0.011);
   const x=LX+Math.cos(a)*rr, y=LY+Math.sin(a)*rr;
   if(!giu){Touch5.start(idL,LX,LY);giu=true;} else Touch5.move(idL,x,y);
   if(f%97===96){Touch5.chiudi(idL,false);giu=false;idL+=2;}
   if(f%71===0&&!giuB){Touch5.start(idB,gr.x,gr.y);giuB=true;}
   else if(giuB&&f%71===26){Touch5.chiudi(idB,false);giuB=false;idB+=2;}
   t.simulate(1/60);
   if(f%30===0)imp.push(leggi());
 }
 if(giu)Touch5.chiudi(idL,false); if(giuB)Touch5.chiudi(idB,false);
 return {imp,motore:t.registroMotoreV,righe:t.registroRighe,nastro:t.nastro().length,
         gol:[G.score[0],G.score[1]],stato:t.ritardoStato||null};})`;
const DITA=`(function(n){const t=window.__test;t.semina(20260924);t.registra();
 t.startMatch(1,1,{size:5,sponde:'gabbia',miraGuidata:'pieno'});
 const leggi=new Function('return '+IMPRX);const imp=[];
 for(let f=0;f<n;f++){const a=f*0.05;t.dita(Math.cos(a),Math.sin(a),(f%71)<26);t.simulate(1/60);
   if(f%30===0)imp.push(leggi());}
 t.dita(null);
 return {imp,righe:t.registroRighe,gol:[G.score[0],G.score[1]]};})`;
(async()=>{
  const A=process.argv[2], B=process.argv[3];
  const out={};
  for(const [nome,file] of [['vecchio',A],['nuovo',B]]){
    if(!file) continue;
    const srv=await servi(path.resolve(file));
    const br=await chromium.launch();
    const ctx=await br.newContext({viewport:{width:915,height:412},hasTouch:true,locale:'it-IT'});
    const pag=await ctx.newPage(); const err=[]; pag.on('pageerror',e=>err.push(e.message));
    await pag.goto(`http://127.0.0.1:${srv.p}/CALCETTO-il-gioco.html`,{waitUntil:'load'});
    await pag.waitForFunction('window.__test!==undefined',null,{timeout:40000});
    await pag.evaluate(()=>{window.requestAnimationFrame=()=>0;});
    await pag.waitForTimeout(200);
    await pag.evaluate(()=>{const t=window.__test;t.dismissSplash&&t.dismissSplash();});
    const ha=await pag.evaluate(()=>({ritardo:typeof window.__test.ritardo,dita:typeof window.__test.dita,motore:0}));
    const r0=await pag.evaluate(([C,I])=>new Function('IMPRX','return '+C)(I)(600,0),[COP,IMPR]);
    const r9=await pag.evaluate(([C,I])=>new Function('IMPRX','return '+C)(I)(600,9),[COP,IMPR]);
    let d1=null,d2=null;
    if(ha.dita==='function'){
      d1=await pag.evaluate(([C,I])=>new Function('IMPRX','return '+C)(I)(600),[DITA,IMPR]);
      d2=await pag.evaluate(([C,I])=>new Function('IMPRX','return '+C)(I)(600),[DITA,IMPR]);
    }
    out[nome]={ha,r0,r9,d1,d2,err};
    await br.close(); srv.c();
  }
  const V=out.vecchio,N=out.nuovo;
  console.log('AGGANCI nel gioco NUOVO: ritardo='+N.ha.ritardo+' dita='+N.ha.dita);
  console.log('         nel gioco VECCHIO: ritardo='+V.ha.ritardo+' dita='+V.ha.dita);
  const ug=(a,b)=>{for(let i=0;i<Math.min(a.length,b.length);i++)if(a[i]!==b[i])return i;return a.length===b.length?-1:Math.min(a.length,b.length);};
  console.log('\nA RITARDO SPENTO il nuovo e il vecchio sono la stessa partita?');
  console.log('  primo scarto: '+ug(V.r0.imp,N.r0.imp)+' (-1 = identiche)  gol '+V.r0.gol.join('-')+' vs '+N.r0.gol.join('-'));
  console.log('\n__test.dita: la stessa sequenza di comandi da\' la stessa partita? (prova C di _q-determinismo)');
  console.log('  nuovo: primo scarto '+(N.d1?ug(N.d1.imp,N.d2.imp):'n/d')+'  righe di nastro '+(N.d1?N.d1.righe:'n/d')+'  gol '+(N.d1?N.d1.gol.join('-'):'n/d'));
  console.log('  righe di nastro: vecchio '+V.r0.righe+' nuovo '+N.r0.righe+'  (nastro '+V.r0.nastro+' vs '+N.r0.nastro+' caratteri)');
  console.log('\nIL RITARDO FA QUALCOSA? nuovo K=0 contro nuovo K=9');
  console.log('  primo scarto: '+ug(N.r0.imp,N.r9.imp)+'  gol '+N.r0.gol.join('-')+' vs '+N.r9.gol.join('-'));
  console.log('  righe: K=0 '+N.r0.righe+'  K=9 '+N.r9.righe+'  coda finale '+JSON.stringify(N.r9.stato));
  console.log('\nECCEZIONI: vecchio '+V.err.length+' nuovo '+N.err.length+(N.err.length?' :: '+N.err.slice(0,2).join(' | '):''));
})().catch(e=>{console.error('sonda esplosa: '+e.message);process.exit(2);});
