// Fotografa la griglia del rig: node bozze-rig3d/foto.js
// Ogni tavola e' UNO SCATTO VERO (niente copie di file): la tabella
// TAVOLE dichiara {file, clip, fase} e per le strisce {striscia:1}.
// Dopo gli scatti la verifica misura: MD5 di ogni file, uscita 1 se
// due tavole condividono lo stesso hash o se una manca.
// Server locale integrato (Playwright non apre file:), porta dedicata 8791
// per stare alla larga dal service worker registrato sulle altre porte.
const http=require('http'), fs=require('fs'), path=require('path'), crypto=require('crypto');
const {chromium}=require('playwright');
const RADICE='C:/Users/Utenteee/Desktop/GitHub/games';
const CARTELLA=path.join(RADICE,'bozze-rig3d');

/* --- LA TABELLA: una tavola per gruppo, la clip giusta, la fase
       piu' espressiva (u in [0,1), vedi le curve in RIG.html) --- */
const TAVOLE=[
  // locomozione
  {file:'foto-corsa.png',      clip:'corsa',      fase:0.21},  // falcata piena
  {file:'foto-camminata.png',  clip:'camminata',  fase:0.21},  // passo aperto
  {file:'foto-frenata.png',    clip:'frenata',    fase:0.10},  // peso dietro, oscillata viva
  // palla: il tiro nella fase del SEGUITO (tImp=0.46, segue fino a 0.72)
  {file:'foto-palla.png',      clip:'tiro',       fase:0.58},
  // duello: la SCIVOLATA nel momento del contatto col terreno (botta a u=0.28)
  {file:'foto-duello.png',     clip:'scivolata',  fase:0.28},
  // la rovesciata con la FORBICE in aria (frustata piena poco prima dell'impatto a 0.44)
  {file:'foto-rovesciata.png', clip:'rovesciata', fase:0.42},
  // portiere: il TUFFO in estensione piena (vol satura a 0.36, deviazione a 0.40)
  {file:'foto-portiere.png',   clip:'tuffo',      fase:0.40},
  // festa: l'esultanza SCIVOLATA SULLE GINOCCHIA, schiena inarcata, ali aperte
  {file:'foto-festa.png',      clip:'ginocchia',  fase:0.42},
  // strisce temporali (8 fasi fisse: la fase URL non conta)
  {file:'striscia-palla.png',    clip:'tiro',       striscia:1},
  {file:'striscia-duello.png',   clip:'rovesciata', striscia:1},
  {file:'striscia-portiere.png', clip:'tuffo',      striscia:1},
  {file:'striscia-festa.png',    clip:'ginocchia',  striscia:1},
];

const MIME={'.html':'text/html','.js':'text/javascript','.png':'image/png'};
const srv=http.createServer((req,res)=>{
  const p=path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(p,(e,d)=>{ if(e){res.writeHead(404);res.end();return;}
    res.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream',
                       'Cache-Control':'no-store'});
    res.end(d); });
});

(async()=>{
  // via le tavole vecchie: nessuno scatto stantio puo' sopravvivere
  for(const t of TAVOLE){
    const p=path.join(CARTELLA,t.file);
    if(fs.existsSync(p)) fs.unlinkSync(p);
  }
  await new Promise(r=>srv.listen(8791,'127.0.0.1',r));
  const browser=await chromium.launch();
  const page=await browser.newPage({viewport:{width:1040,height:1500},deviceScaleFactor:1});
  page.on('console',m=>console.log('PAGINA:',m.text()));
  for(const t of TAVOLE){
    let q='clip='+t.clip+'&griglia=entrambe';
    if(t.striscia) q+='&striscia=1'; else q+='&fase='+t.fase;
    await page.goto('http://127.0.0.1:8791/bozze-rig3d/RIG.html?'+q);
    await page.waitForTimeout(1500);
    const el=await page.$('#griglia');
    await el.screenshot({path:path.join(CARTELLA,t.file)});
    console.log('scritta', t.file, '('+q+')');
  }
  await browser.close(); srv.close();

  /* --- LA VERIFICA: misura, non attestazione. MD5 di ogni tavola;
         due hash uguali o un file mancante = uscita 1. --- */
  const visti={}; let guasto=false;
  for(const t of TAVOLE){
    const p=path.join(CARTELLA,t.file);
    if(!fs.existsSync(p)){ console.error('MANCA:', t.file); guasto=true; continue; }
    const h=crypto.createHash('md5').update(fs.readFileSync(p)).digest('hex');
    if(visti[h]){ console.error('DOPPIONE: '+t.file+' ha lo stesso MD5 di '+visti[h]+' ('+h+')'); guasto=true; }
    else visti[h]=t.file;
    console.log(h, t.file);
  }
  if(guasto){ console.error('VERIFICA FALLITA'); process.exit(1); }
  console.log('VERIFICA PASSATA: '+TAVOLE.length+' tavole, tutti gli MD5 distinti');
})().catch(e=>{console.error(e);process.exit(1)});
