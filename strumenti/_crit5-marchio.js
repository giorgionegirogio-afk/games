/* CRIT5-MARCHIO — il marchio ritagliato, col carattere del telefono
   montato sulle TRE facce vere (400/700/900 = OpFont Regular/Bold/Black).
   Fotografa prima (gioco spedito) e dopo (copia toppata) allo stesso
   ritaglio, e conta i pixel diversi.
   uso: node strumenti/_crit5-marchio.js
*/
const fs=require('fs'),path=require('path'),http=require('http'),{chromium}=require('playwright');
const R=path.resolve(__dirname,'..');
const D=path.resolve('C:/Users/Utenteee/AppData/Local/Temp/claude/C--Users-Utenteee-Desktop-GitHub-games/9c10461c-e096-467c-8590-bb634480cc69/scratchpad/font');
const b=f=>fs.readFileSync(path.join(D,f)).toString('base64');
let G=path.resolve(R,'CALCETTO-il-gioco.html');
const srv=http.createServer((rq,rs)=>{const u=decodeURIComponent(rq.url.split('?')[0]);
 const f=/CALCETTO-il-gioco\.html$/i.test(u)?G:path.join(R,u);
 fs.readFile(f,(e,d)=>{if(e){rs.writeHead(404);rs.end('no');return;}
  rs.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});rs.end(d);});});
const TELCSS=`
@font-face{font-family:OP;font-weight:400;src:url(data:font/ttf;base64,${b('OpFont-Regular.ttf')}) format('truetype')}
@font-face{font-family:OP;font-weight:700;src:url(data:font/ttf;base64,${b('OpFont-Bold.ttf')}) format('truetype')}
@font-face{font-family:OP;font-weight:900;src:url(data:font/ttf;base64,${b('OpFont-Black.ttf')}) format('truetype')}
:root{--nero:OP;--cond:OP}
#lgShape text,#gLogoCal text{font-family:OP !important}`;
srv.listen(0,'127.0.0.1',async()=>{
 const p=srv.address().port; const br=await chromium.launch();
 for(const [tag,file] of [['PRIMA','CALCETTO-il-gioco.html'],['DOPO','fuori/titolo.html']]){
  G=path.resolve(R,file);
  for(const car of ['PC','TEL']){
   const pg=await br.newPage({viewport:{width:845,height:402},deviceScaleFactor:3});
   await pg.goto(`http://127.0.0.1:${p}/CALCETTO-il-gioco.html?t=${Date.now()}`,{waitUntil:'load'});
   await pg.waitForFunction('window.__test!==undefined',null,{timeout:20000});
   if(car==='TEL'){ await pg.addStyleTag({content:TELCSS});
    await pg.evaluate(async()=>{for(const s of ['400 100px OP','700 100px OP','900 100px OP'])await document.fonts.load(s);await document.fonts.ready;});
    await pg.waitForTimeout(250); }
   await pg.evaluate(()=>window.__test.dismissSplash()); await pg.waitForTimeout(450);
   const r=await pg.evaluate(()=>{
    const t=document.querySelector('#lgShape text'),bb=t.getBBox();
    const svg=document.querySelector('#menu .logo-cal svg'),sr=svg.getBoundingClientRect();
    return {fine:+(bb.x+bb.width).toFixed(1), x:Math.round(sr.left)-4,y:Math.round(sr.top)-4,
            w:Math.round(sr.width)+8,h:Math.round(sr.height)+8};});
   console.log(`${tag} ${car}: la parola finisce a ${r.fine} (la O dipinge da 513 a 609) -> ${r.fine>=505?'ATTACCATA':'STACCATA di '+(513-r.fine).toFixed(1)+' unita\''}`);
   await pg.screenshot({path:path.join(R,'fuori',`_crit-marchio-${tag}-${car}.png`),clip:{x:r.x,y:r.y,width:r.w,height:r.h}});
   await pg.close();
  }
 }
 await br.close(); srv.close();
});
