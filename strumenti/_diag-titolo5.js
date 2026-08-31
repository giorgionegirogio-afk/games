/* =====================================================================
   DIAG-TITOLO5 — il compensato a diciotto larghezze, coi due caratteri.

   La domanda a cui risponde e' «regge a QUALUNQUE larghezza
   ragionevole, non solo a quella della fotografia?». Per ogni finestra,
   dal francobollo 280x653 al 2280x1080 orizzontale e verticale, misura:
     - la larghezza del marchio a schermo e il VUOTO che resta fra
       l'ultima T e la O (deve valere 8 unita' di viewBox: e' il numero
       di progetto, quello che il marchio ha su Windows);
     - «DOPOLAVORO FC · LE SETTE DI SERA»: scrollWidth/clientWidth, e
       !CAPO se va a capo, !SFORA se sborda;
     - «SECONDI IN GABBIA, 5 CONTRO 5»: idem, con !TAGLIO quando
       l'overflow:hidden le mangia le lettere.
   Due colonne: a sinistra il carattere di questo PC (Arial Black /
   Arial Narrow), a destra quello del telefono (le Roboto prese con
   adb pull dal OnePlus 6). Sono i due estremi misurati: il piu' largo
   e il piu' stretto fra i caratteri che il gioco puo' incontrare.

   uso: node strumenti/_diag-titolo5.js [fuori/titolo.html]
   ===================================================================== */
const fs=require('fs'),path=require('path'),http=require('http'),{chromium}=require('playwright');
const R=path.resolve(__dirname,'..');
const G=path.resolve(R,process.argv[2]||'fuori/titolo.html');
const D=path.resolve('C:/Users/Utenteee/AppData/Local/Temp/claude/C--Users-Utenteee-Desktop-GitHub-games/9c10461c-e096-467c-8590-bb634480cc69/scratchpad/font');
const b=f=>fs.readFileSync(path.join(D,f)).toString('base64');
const srv=http.createServer((rq,rs)=>{const u=decodeURIComponent(rq.url.split('?')[0]);
 const f=/CALCETTO-il-gioco\.html$/i.test(u)?G:path.join(R,u);
 fs.readFile(f,(e,d)=>{if(e){rs.writeHead(404);rs.end('no');return;}rs.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});rs.end(d);});});
const V=[[2280,1080],[1080,2280],[1920,1080],[1440,900],[1112,834],[915,412],[845,402],[812,375],[740,360],[667,375],[568,320],[412,915],[393,873],[375,812],[360,740],[360,640],[320,568],[280,653]];
srv.listen(0,'127.0.0.1',async()=>{const p=srv.address().port;const br=await chromium.launch();
console.log('  finestra     tabellone  marchio(px)  vuoto-O  kick  sotto   PC / TEL');
for(const [w,h] of V){ const out=[];
 for(const car of ['PC','TEL']){
  const pg=await br.newPage({viewport:{width:w,height:h}});
  await pg.goto(`http://127.0.0.1:${p}/CALCETTO-il-gioco.html?t=${Date.now()}`,{waitUntil:'load'});
  await pg.waitForFunction('window.__test!==undefined',null,{timeout:20000});
  await pg.evaluate(()=>window.__test.dismissSplash()); await pg.waitForTimeout(400);
  if(car==='TEL'){await pg.addStyleTag({content:`@font-face{font-family:T;font-weight:400;src:url(data:font/ttf;base64,${b('Roboto-Regular.ttf')}) format('truetype')}@font-face{font-family:T;font-weight:900;src:url(data:font/ttf;base64,${b('Roboto-Black.ttf')}) format('truetype')}#lgShape text,#gLogoCal text,.tab-kick,.tab-sotto,.tab-targa{font-family:T !important}`});
   await pg.evaluate(async()=>{await document.fonts.load('400 100px T');await document.fonts.load('900 100px T');await document.fonts.ready});await pg.waitForTimeout(250);}
  const r=await pg.evaluate(()=>{
   const t=document.querySelector('#lgShape text'),bb=t.getBBox();
   const svg=document.querySelector('#menu .logo-cal svg'),tab=document.querySelector('#menu .tabellone'),tin=document.querySelector('#menu .tab-in');
   const k=document.querySelector('#menu .tab-kick'),s=document.querySelector('#menu .tab-sotto');
   const nr=e=>Math.round(e.getBoundingClientRect().height/parseFloat(getComputedStyle(e).lineHeight));
   return {tab:Math.round(tab.getBoundingClientRect().width), svgw:Math.round(svg.getBoundingClientRect().width),
    vuoto:+(523-(bb.x+bb.width)).toFixed(1), sborda:+((svg.getBoundingClientRect().right)-(tin.getBoundingClientRect().right)).toFixed(1),
    k:[k.scrollWidth,k.clientWidth,nr(k)], s:[s.scrollWidth,s.clientWidth,nr(s)]};});
  out.push(r); await pg.close();}
 const f=(r)=>`${String(r.svgw).padStart(4)}px ${String(r.vuoto).padStart(6)} ${r.k[0]}/${r.k[1]}${r.k[2]>1?'!CAPO':''}${r.k[0]>r.k[1]+1?'!SFORA':''} ${r.s[0]}/${r.s[1]}${r.s[0]>r.s[1]+1?'!TAGLIO':''}`;
 console.log(`  ${String(w).padStart(4)}x${String(h).padEnd(4)}  ${String(out[0].tab).padStart(5)}    ${f(out[0])}   |   ${f(out[1])}`);
}
await br.close();srv.close();});
