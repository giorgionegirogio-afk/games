/* _crit10-cifra.js — quanto e' larga davvero la cifra 0 a corpo 26?
   Il commento spedito oggi dice «11,78 px per la cifra 0 in Barlow
   Condensed». Qui si misura in tutti i modi in cui si puo' misurare. */
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
(async()=>{
  const srv=await servi(fs.readFileSync(path.resolve(RADICE,'fuori/cmd-tabellone.html'),'utf8'));
  const br=await chromium.launch();
  const ctx=await br.newContext({viewport:{width:915,height:412},deviceScaleFactor:1,isMobile:true,hasTouch:true,locale:'it-IT'});
  const pag=await ctx.newPage();
  await pag.goto('http://127.0.0.1:'+srv.porta+'/CALCETTO-il-gioco.html?t='+Date.now(),{waitUntil:'load',timeout:60000});
  await pag.waitForFunction('window.__test !== undefined',null,{timeout:20000});
  await pag.evaluate(()=>document.fonts.ready);
  const r=await pag.evaluate(()=>{
    const cg=document.getElementById('gioco').getContext('2d');
    const F='"Barlow Condensed","Arial Narrow","Segoe UI",sans-serif';
    const RIP='"Arial Narrow","Segoe UI",sans-serif';
    const q=(font,ch)=>{cg.font=font;const m=cg.measureText(ch);
      return {avanzo:+m.width.toFixed(2),
              inchiostro:+((m.actualBoundingBoxRight+m.actualBoundingBoxLeft)).toFixed(2)};};
    return {
      'B700 26px 0': q('700 26px '+F,'0'),
      'B400 26px 0': q('400 26px '+F,'0'),
      'B700 26px 8': q('700 26px '+F,'8'),
      'B700 26px 00': q('700 26px '+F,'00'),
      'ripiego 700 26px 0': q('700 26px '+RIP,'0'),
      'B700 24px 0': q('700 24px '+F,'0'),
      'famiglia caricata': document.fonts.check('700 26px "Barlow Condensed"'),
    };
  });
  console.log(JSON.stringify(r,null,2));
  await br.close(); srv.chiudi();
})();
