/* CRIT5-CIECO — quanto sporge la riga che il cancello nuovo non vede.
   Misura .tab-kick contro .tab-in e contro la TAVOLA, e fotografa.
   uso: node strumenti/_crit5-cieco.js <file.html> <nome-scatto>
*/
const fs=require('fs'),path=require('path'),http=require('http'),{chromium}=require('playwright');
const R=path.resolve(__dirname,'..');
const G=path.resolve(R,process.argv[2]||'fuori/_crit-guastoA.html');
const NOME=process.argv[3]||'guastoA';
const srv=http.createServer((rq,rs)=>{const u=decodeURIComponent(rq.url.split('?')[0]);
 const f=/CALCETTO-il-gioco\.html$/i.test(u)?G:path.join(R,u);
 fs.readFile(f,(e,d)=>{if(e){rs.writeHead(404);rs.end('no');return;}
  rs.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});rs.end(d);});});
const V=[[845,402],[1440,900],[360,640]];
srv.listen(0,'127.0.0.1',async()=>{
 const p=srv.address().port; const br=await chromium.launch();
 for(const [w,h] of V){
  const pg=await br.newPage({viewport:{width:w,height:h},deviceScaleFactor:2});
  await pg.goto(`http://127.0.0.1:${p}/CALCETTO-il-gioco.html?t=${Date.now()}`,{waitUntil:'load'});
  await pg.waitForFunction('window.__test!==undefined',null,{timeout:20000});
  await pg.evaluate(()=>window.__test.dismissSplash()); await pg.waitForTimeout(450);
  const r=await pg.evaluate(()=>{
   const k=document.querySelector('#menu .tab-kick'),tin=document.querySelector('#menu .tab-in'),tab=document.querySelector('#menu .tabellone');
   const kr=k.getBoundingClientRect(),ir=tin.getBoundingClientRect(),tr=tab.getBoundingClientRect();
   return {kick:+kr.width.toFixed(1), sw:k.scrollWidth, cw:k.clientWidth,
     tin:+ir.width.toFixed(1), tav:+tr.width.toFixed(1),
     oltreTin:+(kr.width-ir.width).toFixed(1), oltreTav:+(kr.width-tr.width).toFixed(1),
     sxFuori:+(tr.left-kr.left).toFixed(1), dxFuori:+(kr.right-tr.right).toFixed(1),
     rect:[Math.round(tr.left)-40,Math.round(tr.top)-20,Math.round(tr.width)+80,Math.round(tr.height)+40]};});
  console.log(`${w}x${h}  riga ${r.kick}px  riquadro .tab-in ${r.tin}  tavola ${r.tav}  |  scrollWidth/clientWidth ${r.sw}/${r.cw} (il cancello legge QUESTO)  |  oltre il riquadro +${r.oltreTin}  oltre la tavola +${r.oltreTav} (sx ${r.sxFuori}, dx ${r.dxFuori})`);
  const [x,y,ww,hh]=r.rect;
  await pg.screenshot({path:path.join(R,'fuori',`_crit-${NOME}-${w}x${h}.png`),clip:{x:Math.max(0,x),y:Math.max(0,y),width:Math.min(ww,w),height:Math.min(hh,h)}});
  await pg.close();
 }
 await br.close(); srv.close();
});
