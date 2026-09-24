/* =====================================================================
   _diag-147-voce.js — DOVE STA DAVVERO LA VOCE NUOVA (voce #147)

   Sonda diagnostica, non un cancello. Stampa la geometria dei figli
   della .box della schermata SFIDA: chi sta dove, alto quanto, con che
   display. E' nata da un numero che non tornava — la voce nuova
   misurava la STESSA identica riga di SFIDA DI CARTA (301-347 tutte e
   due) — e la risposta e' qui dentro: .voce non dichiara display, un
   <button> e' inline-block, e .box e' larga 640, quindi due voci da
   ~300 px stanno sulla stessa riga. Da quel numero e' venuta la riga
   #btnSfidaDischetto{display:block}, e la ragione per cui NON si e'
   tenuta la disposizione affiancata, che pure costava zero pixel: una
   disposizione che dipende dalla larghezza va a capo a casa di
   qualcun altro, dove nessun banco guarda.

   uso:  node strumenti/_diag-147-voce.js
   ===================================================================== */
const path=require('path'),fs=require('fs'),http=require('http');
const {chromium}=require('playwright');
const RADICE=path.resolve('.');
const PROVA=path.resolve('fuori/147-pannello.html');
const s=http.createServer((req,res)=>{let f=path.join(RADICE,decodeURIComponent(req.url.split('?')[0]));
 if(/CALCETTO-il-gioco\.html$/i.test(f)) f=PROVA;
 if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});fs.createReadStream(f).pipe(res);});
s.listen(0,'127.0.0.1',async()=>{const porta=s.address().port;
 const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:800,height:360},isMobile:true,hasTouch:true,locale:'it-IT'});
 const pag=await ctx.newPage();
 await pag.goto(`http://127.0.0.1:${porta}/CALCETTO-il-gioco.html`,{waitUntil:'load'});
 await pag.waitForFunction('window.__test !== undefined',null,{timeout:30000});
 await pag.evaluate(()=>{window.requestAnimationFrame=()=>0;});
 await pag.evaluate(()=>{const t=window.__test;t.dismissSplash&&t.dismissSplash();if(t.save)t.save.tutorialDone=1;});
 const o=await pag.evaluate(async()=>{const t=window.__test;t.sfida.sfide=[];t.sfida.apri();
  for(let i=0;i<40&&t.sfida.occupato;i++)await new Promise(r=>setTimeout(r,50));t.sfida.dipingi();
  const d=document.getElementById('btnSfidaDischetto'),c=document.getElementById('btnSfidaCarta');
  const rc=c.getBoundingClientRect(), rd=d?d.getBoundingClientRect():null;
  const cs=d?getComputedStyle(d):null;
  const box=c.parentElement, bs=getComputedStyle(box);
  const figli=[...box.children].map(e=>{const r=e.getBoundingClientRect();
    return (e.id||e.className)+' @'+Math.round(r.top)+'-'+Math.round(r.bottom)+' h'+Math.round(r.height)+' '+getComputedStyle(e).display;});
  return {carta:[rc.top,rc.bottom,rc.height], disco: rd?[rd.top,rd.bottom,rd.height]:null,
   display:cs&&cs.display, pos:cs&&cs.position, vis:cs&&cs.visibility,
   box:{display:bs.display, dir:bs.flexDirection, grid:bs.gridTemplateRows, over:bs.overflow},
   figli };});
 console.log(JSON.stringify(o,null,1));
 await b.close();s.close();});
