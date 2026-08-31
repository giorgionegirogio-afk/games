/* CRIT5 — misura avversaria del marchio e delle due righe del compensato.
   Differenze dal banco dell'agente (_diag-titolo5.js):
     · il carattere del telefono e' montato con TRE facce (400/700/900 =
       OpFont-Regular/Bold/Black), che e' la mappa vera di fonts.xml. Il
       banco dell'agente ne montava DUE (400 e 900): a font-weight:700
       il browser saliva a 900, cioe' misurava .tab-kick in Roboto BLACK
       invece che in Roboto Bold;
     · griglia di larghezze piu' fitta, con i formati che l'agente NON ha
       provato (480x320, 500x300, 568x320, 640x360, 1024x600, 3840x2160...);
     · misura anche il logo dello SPLASH e la targa 90;
     · il vuoto prima della O e' misurato sul bordo VERO del cerchio
       (cx 561, r 38, stroke 20 -> 513) oltre che sul percorso (523).
   uso: node strumenti/_crit5-titolo.js <file.html> [--solo PC|TEL]
*/
const fs=require('fs'),path=require('path'),http=require('http'),{chromium}=require('playwright');
const R=path.resolve(__dirname,'..');
const G=path.resolve(R,process.argv[2]||'fuori/titolo.html');
const SOLO=(process.argv.indexOf('--solo')>0)?process.argv[process.argv.indexOf('--solo')+1]:'';
const D=path.resolve('C:/Users/Utenteee/AppData/Local/Temp/claude/C--Users-Utenteee-Desktop-GitHub-games/9c10461c-e096-467c-8590-bb634480cc69/scratchpad/font');
const b=f=>fs.readFileSync(path.join(D,f)).toString('base64');
const srv=http.createServer((rq,rs)=>{const u=decodeURIComponent(rq.url.split('?')[0]);
 const f=/CALCETTO-il-gioco\.html$/i.test(u)?G:path.join(R,u);
 fs.readFile(f,(e,d)=>{if(e){rs.writeHead(404);rs.end('no');return;}
  rs.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});rs.end(d);});});

const V=[[3840,2160],[2280,1080],[1920,1080],[1440,900],[1280,720],[1112,834],[1024,600],[960,540],
 [915,412],[900,640],[899,639],[845,402],[812,375],[800,480],[740,360],[720,400],[667,375],[640,360],
 [600,400],[568,320],[500,320],[480,320],[1080,2280],[412,915],[393,873],[375,812],[360,740],
 [360,640],[320,568],[320,800],[280,653],[240,600]];

const TELCSS=`
@font-face{font-family:OP;font-weight:400;src:url(data:font/ttf;base64,${b('OpFont-Regular.ttf')}) format('truetype')}
@font-face{font-family:OP;font-weight:700;src:url(data:font/ttf;base64,${b('OpFont-Bold.ttf')}) format('truetype')}
@font-face{font-family:OP;font-weight:900;src:url(data:font/ttf;base64,${b('OpFont-Black.ttf')}) format('truetype')}
:root{--nero:OP;--cond:OP}
#lgShape text,#gLogoCal text{font-family:OP !important}
`;

srv.listen(0,'127.0.0.1',async()=>{
 const p=srv.address().port; const br=await chromium.launch();
 const profili = SOLO? [SOLO] : ['PC','TEL'];
 console.log('file: '+G);
 console.log('car  finestra    tw    tab-in  marchio  vuoto513 vuoto523 svg-sborda | kick fs sw/cw righe | sotto fs sw/cw | splash sw/cw');
 const guai=[];
 for(const car of profili){
  for(const [w,h] of V){
   const pg=await br.newPage({viewport:{width:w,height:h}});
   const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
   await pg.goto(`http://127.0.0.1:${p}/CALCETTO-il-gioco.html?t=${Date.now()}`,{waitUntil:'load'});
   await pg.waitForFunction('window.__test!==undefined',null,{timeout:20000});
   if(car==='TEL'){ await pg.addStyleTag({content:TELCSS});
     await pg.evaluate(async()=>{for(const s of ['400 100px OP','700 100px OP','900 100px OP'])await document.fonts.load(s);await document.fonts.ready;});
     await pg.waitForTimeout(200); }
   /* SPLASH prima: il marchio ci sta a tutta pagina */
   const sp=await pg.evaluate(()=>{const s=document.querySelector('.spl-logosvg');
     if(!s) return null; const r=s.getBoundingClientRect();
     return {w:Math.round(r.width),over:Math.round(r.right-innerWidth)+Math.round(0-r.left)};});
   await pg.evaluate(()=>window.__test.dismissSplash()); await pg.waitForTimeout(450);
   const r=await pg.evaluate(()=>{
    const t=document.querySelector('#lgShape text'); const bb=t.getBBox();
    const svg=document.querySelector('#menu .logo-cal svg');
    const tab=document.querySelector('#menu .tabellone');
    const tin=document.querySelector('#menu .tab-in');
    const k=document.querySelector('#menu .tab-kick'), s=document.querySelector('#menu .tab-sotto');
    const tg=document.querySelector('#menu .tab-targa');
    const cs=e=>getComputedStyle(e);
    const righe=e=>Math.round(e.getBoundingClientRect().height/parseFloat(cs(e).lineHeight));
    const sr=svg.getBoundingClientRect(), tr=tab.getBoundingClientRect(), ir=tin.getBoundingClientRect();
    return {
      tw:+tr.width.toFixed(1),
      twvar:cs(tab).getPropertyValue('--tw').trim(),
      tin:+ir.width.toFixed(1),
      svgw:+sr.width.toFixed(1),
      sborda:+(sr.right-ir.right).toFixed(1),
      sbordaTab:+(sr.right-tr.right).toFixed(1),
      fine:+(bb.x+bb.width).toFixed(1),
      k:{fs:cs(k).fontSize, sw:k.scrollWidth, cw:k.clientWidth, righe:righe(k), fam:cs(k).fontFamily.split(',')[0]},
      s:{fs:cs(s).fontSize, sw:s.scrollWidth, cw:s.clientWidth, righe:righe(s)},
      tg:{sw:tg.scrollWidth, cw:tg.clientWidth},
    };});
   const v513=+(513-r.fine).toFixed(1), v523=+(523-r.fine).toFixed(1);
   const kBad=r.k.sw>r.k.cw+1, kCapo=r.k.righe>1, sBad=r.s.sw>r.s.cw+1, tgBad=r.tg.sw>r.tg.cw+1;
   const flag=(kBad?' !KICK-SFORA':'')+(kCapo?' !KICK-CAPO':'')+(sBad?' !SOTTO-TAGLIO':'')+(tgBad?' !TARGA':'')
     +(Math.abs(v523-8)>1.5?' !VUOTO':'')+(r.sborda>1?' !SVG-SBORDA':'');
   if(flag) guai.push(`${car} ${w}x${h}${flag}`);
   console.log(`${car}  ${String(w).padStart(4)}x${String(h).padEnd(4)} ${String(r.tw).padStart(6)} ${String(r.tin).padStart(6)} ${String(r.svgw).padStart(7)} ${String(v513).padStart(7)} ${String(v523).padStart(7)} ${String(r.sborda).padStart(6)} | ${r.k.fs.padStart(7)} ${r.k.sw}/${r.k.cw} r${r.k.righe} | ${r.s.fs.padStart(7)} ${r.s.sw}/${r.s.cw} | ${sp?sp.w:'-'}${flag}`);
   if(errs.length) console.log('      errori pagina: '+errs[0].slice(0,80));
   await pg.close();
  }
 }
 console.log('\n=== GUAI ===');
 if(!guai.length) console.log('nessuno'); else guai.forEach(g=>console.log('  '+g));
 await br.close(); srv.close();
});
