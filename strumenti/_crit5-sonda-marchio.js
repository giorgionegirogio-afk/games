/* CRIT5-SONDA-MARCHIO — la sonda di testo-fuori.js, PAROLA PER PAROLA,
   fatta girare sulla home del gioco SPEDITO col carattere del telefono
   montato: cioe' nella condizione esatta in cui il titolo si legge
   «CALCETT». Domanda: la sonda lo vede?
   uso: node strumenti/_crit5-sonda-marchio.js
*/
const fs=require('fs'),path=require('path'),http=require('http'),{chromium}=require('playwright');
const R=path.resolve(__dirname,'..');
const G=path.resolve(R,'CALCETTO-il-gioco.html');
const D=path.resolve('C:/Users/Utenteee/AppData/Local/Temp/claude/C--Users-Utenteee-Desktop-GitHub-games/9c10461c-e096-467c-8590-bb634480cc69/scratchpad/font');
const b=f=>fs.readFileSync(path.join(D,f)).toString('base64');
/* la SONDA e' presa dal cancello, senza toccare una virgola */
const SORGENTE=fs.readFileSync(path.join(__dirname,'testo-fuori.js'),'utf8');
const m=SORGENTE.match(/const SONDA = `([\s\S]*?)`;\n/);
if(!m){console.error('non trovo la SONDA dentro testo-fuori.js');process.exit(2);}
const SONDA=m[1].replace(/\\\\/g,'\\').replace(/\\`/g,'`').replace(/\\\$/g,'$');
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
 const pg=await br.newPage({viewport:{width:845,height:402}});
 await pg.goto(`http://127.0.0.1:${p}/CALCETTO-il-gioco.html?t=${Date.now()}`,{waitUntil:'load'});
 await pg.waitForFunction('window.__test!==undefined',null,{timeout:20000});
 await pg.addStyleTag({content:TELCSS});
 await pg.evaluate(async()=>{for(const s of ['400 100px OP','700 100px OP','900 100px OP'])await document.fonts.load(s);await document.fonts.ready;});
 await pg.evaluate(()=>window.__test.dismissSplash()); await pg.waitForTimeout(500);
 const stato=await pg.evaluate(()=>{const t=document.querySelector('#lgShape text'),bb=t.getBBox();
  const h1=document.querySelector('#menu .logo-cal');
  const nodiTesto=[...h1.childNodes].filter(n=>n.nodeType===3&&n.nodeValue.trim()).length;
  return {fine:+(bb.x+bb.width).toFixed(1), sw:h1.scrollWidth, cw:h1.clientWidth, nodiTesto};});
 console.log(`stato della home: la parola finisce a ${stato.fine} (la O dipinge da 513): il titolo si legge «CALCETT».`);
 console.log(`  h1.logo-cal: nodi di testo diretti ${stato.nodiTesto}, scrollWidth/clientWidth ${stato.sw}/${stato.cw}`);
 const trovati=await pg.evaluate(SONDA);
 console.log(`\nla SONDA di testo-fuori.js, sulla stessa pagina, restituisce ${trovati.length} elementi:`);
 for(const t of trovati) console.log(`   ${t.via.padEnd(34)} ${t.sw}/${t.w} (+${t.dx})  tagliatoX=${t.tagliatoX}  «${t.testo}»`);
 const parlaDelMarchio=trovati.some(t=>/logo|CALCET/i.test(t.via+t.testo));
 console.log(`\nqualcuno di questi e' il marchio? ${parlaDelMarchio?'SI':'NO'}`);
 await br.close(); srv.close();
});
