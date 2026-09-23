/* sonda usa-e-getta (voce #141): perche' un nastro su 120 non si
   riproduce a K=0? Si registra il nastro del seme colpevole e lo si
   rigioca TRE volte. Se le tre rigiocate coincidono fra loro ma non con
   la registrazione, la causa e' l'asimmetria fra registrare e rileggere,
   non il caso. */
const fs=require('fs'),path=require('path'),http=require('http');
const {chromium}=require('playwright');
const RADICE=path.resolve(__dirname,'..');
const GIOCO=process.argv[3]||'CALCETTO-il-gioco.html';
const SEME=parseInt(process.argv[2]||'20260950',10);
function servi(p){return new Promise(ok=>{const s=http.createServer((q,r)=>{
  let f=path.join(RADICE,decodeURIComponent(q.url.split('?')[0]));
  if(p&&/CALCETTO-il-gioco\.html$/i.test(f))f=p;
  if(!fs.existsSync(f)){r.writeHead(404);r.end();return;}
  r.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
  fs.createReadStream(f).pipe(r);});s.listen(0,'127.0.0.1',()=>ok({p:s.address().port,c:()=>s.close()}));});}
const COP=`(function(n){const t=window.__test;const D=t.Duel;const d=t.pulsanti(0);
 const gr=d[0]||{x:800,y:330}, pc=d[1]||{x:720,y:250}; const LX=180,LY=300;
 let idL=1,idB=2,giu=false,giuB=false,f=0;
 while(f<n){ if(t.state==='end')break;
  if(t.state==='freekick'){ if(D.phase==='zone'&&D.shooterHuman)D.pickZone(2,0.74,0.44);
    else if(D.phase==='power'&&D.shooterHuman)D.stopPower();
    else if(D.phase==='wait'&&D.keeperHuman&&D.keeperZone<0)D.pickKeeper(0);
    t.simulate(1/60);f++;continue;}
  const a=f*0.037,rr=34+22*Math.sin(f*0.011);
  const x=LX+Math.cos(a)*rr,y=LY+Math.sin(a)*rr;
  if(!giu){Touch5.start(idL,LX,LY);giu=true;}else Touch5.move(idL,x,y);
  if(f%97===96){Touch5.chiudi(idL,false);giu=false;idL+=2;}
  if(f%71===0&&!giuB){Touch5.start(idB,gr.x,gr.y);giuB=true;}
  else if(giuB&&f%71===18){Touch5.move(idB,gr.x-26,gr.y-14);}
  else if(giuB&&f%71===26){Touch5.chiudi(idB,false);giuB=false;idB+=2;}
  if(f%53===11){const j=900+f;Touch5.start(j,pc.x,pc.y);Touch5.chiudi(j,false);}
  t.simulate(1/60);f++;}
 if(giu)Touch5.chiudi(idL,false); if(giuB)Touch5.chiudi(idB,false); return f;})`;
const MIS=`(()=>({gol:[G.score[0],G.score[1]],tiri:[G.stats.tiri[0],G.stats.tiri[1]],
  sp:[G.stats.inPorta[0]|0,G.stats.inPorta[1]|0],sorteggi:window.__test.sorteggi}))()`;
(async()=>{
  const srv=await servi(path.resolve(RADICE,GIOCO));
  const br=await chromium.launch();
  const ctx=await br.newContext({viewport:{width:915,height:412},hasTouch:true,locale:'it-IT'});
  const pag=await ctx.newPage();
  await pag.goto(`http://127.0.0.1:${srv.p}/CALCETTO-il-gioco.html`,{waitUntil:'load'});
  await pag.waitForFunction('window.__test!==undefined',null,{timeout:40000});
  await pag.evaluate(()=>{window.requestAnimationFrame=()=>0;});
  await pag.waitForTimeout(200);
  await pag.evaluate(()=>{const t=window.__test;t.dismissSplash&&t.dismissSplash();});
  const reg=await pag.evaluate(([C,M,s])=>{const t=window.__test;t.semina(s);t.registra();
    t.startMatch(1,1,{size:5,sponde:'gabbia',miraGuidata:'pieno'});
    new Function('return '+C)()(5400);
    const n=t.nastro(); const m=new Function('return '+M)(); t.fermaRegistro();
    return {n,m,righe:t.registroRighe};},[COP,MIS,SEME]);
  console.log('REGISTRATO  gol '+reg.m.gol.join('-')+'  tiri '+reg.m.tiri.join('/')+'  specchio '+reg.m.sp.join('/')+'  sorteggi '+reg.m.sorteggi+'  righe '+reg.righe);
  for(let i=0;i<3;i++){
    const r=await pag.evaluate(([nas,M,s])=>{const t=window.__test;t.rigioca(nas);t.semina(s);
      t.startMatch(1,1,{size:5,sponde:'gabbia',miraGuidata:'pieno'});
      let p=0; while(p<5400){ if(t.state==='end')break;
        if(t.state==='freekick')Duel.update(1/60); else step(); p++; }
      const m=new Function('return '+M)(); return {m,p};},[reg.n,MIS,SEME]);
    console.log('RIGIOCATA '+(i+1)+' gol '+r.m.gol.join('-')+'  tiri '+r.m.tiri.join('/')+'  specchio '+r.m.sp.join('/')+'  sorteggi '+r.m.sorteggi+'  passi '+r.p);
  }
  /* e adesso lo stesso nastro con i millisecondi AZZERATI: se la causa e'
     l'orologio del gesto, azzerandolo in tutte e due le mani le due
     misure tornano a coincidere */
  await br.close(); srv.c();
})().catch(e=>{console.error('sonda esplosa: '+e.message);process.exit(2);});
