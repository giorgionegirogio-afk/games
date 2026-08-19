/* SONDA LEGALE — enumera TUTTI i nomi che il gioco puo' pronunciare.
   Non inventa nulla: chiama le funzioni vere dentro la pagina.
   Se una funzione non c'e', lo DICE e esce rosso: non stampa un elenco
   vuoto spacciandolo per "nessun nome a rischio". */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');
const RADICE=__dirname;
(async()=>{
  const s=http.createServer((q,r)=>{const f=path.join(RADICE,decodeURIComponent(q.url.split('?')[0]));
    if(!fs.existsSync(f)){r.writeHead(404);r.end();return;}
    r.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
    fs.createReadStream(f).pipe(r);});
  await new Promise(k=>s.listen(0,'127.0.0.1',k));
  const p=s.address().port;
  const b=await chromium.launch(); const c=await b.newContext(); const pg=await c.newPage();
  await pg.goto(`http://127.0.0.1:${p}/CALCETTO-il-gioco.html`,{waitUntil:'load'});
  await pg.waitForFunction('window.__test!==undefined',null,{timeout:30000});
  const out=await pg.evaluate(()=>{
    /* i `const` di primo livello NON stanno su window: stanno nella
       portata lessicale globale. Si raggiungono per identificatore nudo,
       e la prova che ci siano e' un typeof, non un window[k]. */
    const mancano=[];
    const provo=(k,f)=>{ try{ const v=f(); if(v===undefined) mancano.push(k); return v; }
                         catch(e){ mancano.push(k+' ('+e.message+')'); return undefined; } };
    const TP=provo('TOUR_POOL',()=>TOUR_POOL);
    const FI=provo('FIELDS',()=>FIELDS);
    const AD=provo('ADS',()=>ADS);
    const AC=provo('ACH',()=>ACH);
    const NR=provo('NOMI_ROSA',()=>NOMI_ROSA);
    const CR=provo('COGNOMI_ROSA',()=>COGNOMI_ROSA);
    const NE=provo('NEGOZIO',()=>NEGOZIO);
    const KI=provo('KITS',()=>KITS);
    const RA=provo('rosaAvversaria',()=>rosaAvversaria);
    const NV=provo('nuovaRosa',()=>nuovaRosa);
    if(mancano.length) return {errore:'simboli non raggiungibili: '+mancano.join(', ')};
    const rose={};
    for(const t of TP) rose[t.n]=RA(t.n,11,null);
    rose['CPU']=RA('CPU',11,null);
    rose['ROSA']=RA('ROSA',11,null);
    return {
      rose,
      rosaTua: NV().map(g=>g.nome),
      squadre: TP.map(t=>t.n+' ('+t.stile+')'),
      campi: FI.map(f=>f.nome+' — '+f.desc),
      ads: AD,
      trofei: AC.map(a=>a.nome+' — '+a.desc),
      negozio: NE.map(n=>n.nome+' — '+n.desc),
      kit: KI.map(k=>k.nome),
      nomi: NR, cognomi: CR,
    };
  });
  await b.close(); s.close();
  if(out.errore){ console.log('ROSSO — NON MISURATO: '+out.errore); process.exit(2); }
  console.log(JSON.stringify(out,null,1));
})();
