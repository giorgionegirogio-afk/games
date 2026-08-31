/* CRIT5-SOGLIA8 — lo stesso compensato, ma col PAVIMENTO DEI CORPI che
   la WebView di Android impone e che Chromium su Windows non ha.

   android/Gioco.java apre una WebView e non tocca né setMinimumFontSize
   né setMinimumLogicalFontSize: valgono i valori di fabbrica, che
   secondo la documentazione di WebSettings sono 8 e 8. Sotto gli 8 px il
   motore NON rimpicciolisce piu': alza il corpo a 8.
   Qui si riproduce con la stessa manopola dello stesso motore
   (--blink-settings=minimumFontSize,minimumLogicalFontSize), e si
   confronta il gioco spedito con la copia toppata.

   uso: node strumenti/_crit5-soglia8.js <file.html> [soglia]
*/
const fs=require('fs'),path=require('path'),http=require('http'),{chromium}=require('playwright');
const R=path.resolve(__dirname,'..');
const G=path.resolve(R,process.argv[2]||'fuori/titolo.html');
const SOGLIA=+(process.argv[3]||8);
const D=path.resolve('C:/Users/Utenteee/AppData/Local/Temp/claude/C--Users-Utenteee-Desktop-GitHub-games/9c10461c-e096-467c-8590-bb634480cc69/scratchpad/font');
const b=f=>fs.readFileSync(path.join(D,f)).toString('base64');
const srv=http.createServer((rq,rs)=>{const u=decodeURIComponent(rq.url.split('?')[0]);
 const f=/CALCETTO-il-gioco\.html$/i.test(u)?G:path.join(R,u);
 fs.readFile(f,(e,d)=>{if(e){rs.writeHead(404);rs.end('no');return;}
  rs.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});rs.end(d);});});

const V=[[360,640],[320,568],[280,653],[240,600],[480,320],[500,320],[568,320],[640,360],[667,375],[845,402],[740,360]];
const TELCSS=`
@font-face{font-family:OP;font-weight:400;src:url(data:font/ttf;base64,${b('OpFont-Regular.ttf')}) format('truetype')}
@font-face{font-family:OP;font-weight:700;src:url(data:font/ttf;base64,${b('OpFont-Bold.ttf')}) format('truetype')}
@font-face{font-family:OP;font-weight:900;src:url(data:font/ttf;base64,${b('OpFont-Black.ttf')}) format('truetype')}
:root{--nero:OP;--cond:OP}
#lgShape text,#gLogoCal text{font-family:OP !important}`;

srv.listen(0,'127.0.0.1',async()=>{
 const p=srv.address().port;
 const args=[`--blink-settings=minimumFontSize=${SOGLIA},minimumLogicalFontSize=${SOGLIA}`];
 const br=await chromium.launch({args});
 console.log(`file: ${G}\npavimento dei corpi: ${SOGLIA}px (come la WebView di fabbrica)\n`);
 console.log('car  finestra   tab-in  kick: corpo  larghezza/riquadro  righe   sotto: corpo  larghezza/riquadro');
 const guai=[];
 for(const car of ['PC','TEL']){
  for(const [w,h] of V){
   const pg=await br.newPage({viewport:{width:w,height:h}});
   await pg.goto(`http://127.0.0.1:${p}/CALCETTO-il-gioco.html?t=${Date.now()}`,{waitUntil:'load'});
   await pg.waitForFunction('window.__test!==undefined',null,{timeout:20000});
   if(car==='TEL'){ await pg.addStyleTag({content:TELCSS});
     await pg.evaluate(async()=>{for(const s of ['400 100px OP','700 100px OP','900 100px OP'])await document.fonts.load(s);await document.fonts.ready;});
     await pg.waitForTimeout(200); }
   await pg.evaluate(()=>window.__test.dismissSplash()); await pg.waitForTimeout(420);
   const r=await pg.evaluate(()=>{
    const k=document.querySelector('#menu .tab-kick'), s=document.querySelector('#menu .tab-sotto');
    const tin=document.querySelector('#menu .tab-in'), tab=document.querySelector('#menu .tabellone');
    const cs=e=>getComputedStyle(e);
    const righe=e=>Math.round(e.getBoundingClientRect().height/parseFloat(cs(e).lineHeight));
    const kr=k.getBoundingClientRect(), ir=tin.getBoundingClientRect(), tr=tab.getBoundingClientRect();
    return {tin:+ir.width.toFixed(1),
      kfs:cs(k).fontSize, ksw:k.scrollWidth, kcw:k.clientWidth, kr:righe(k),
      /* di quanto la riga esce dalla TAVOLA, non solo dal riquadro */
      fuoriTav:+Math.max(kr.left+k.scrollWidth-tr.right, tr.left-kr.left).toFixed(1),
      sfs:cs(s).fontSize, ssw:s.scrollWidth, scw:s.clientWidth};});
   const kBad=r.ksw>r.kcw+1, sBad=r.ssw>r.scw+1, kCapo=r.kr>1;
   const f=(kBad?' !KICK-SFORA':'')+(kCapo?' !KICK-CAPO':'')+(sBad?' !SOTTO-TAGLIO':'');
   if(f) guai.push(`${car} ${w}x${h}${f}  (kick ${r.ksw}/${r.kcw}, esce dalla tavola di ${r.fuoriTav}px; sotto ${r.ssw}/${r.scw})`);
   console.log(`${car}  ${String(w).padStart(4)}x${String(h).padEnd(4)} ${String(r.tin).padStart(7)}   ${r.kfs.padStart(8)}  ${String(r.ksw).padStart(4)}/${String(r.kcw).padEnd(4)} r${r.kr}   ${r.sfs.padStart(8)}  ${String(r.ssw).padStart(4)}/${String(r.scw).padEnd(4)}${f}`);
   await pg.close();
  }
 }
 console.log('\n=== GUAI ===');
 if(!guai.length) console.log('nessuno'); else guai.forEach(g=>console.log('  '+g));
 await br.close(); srv.close();
});
