/* I DUE CAPITANI NON DEVONO CHIAMARSI UGUALE.
   Legge i nomi VERI delle due squadre in campo, non quelli che un
   generatore promette: si gioca una partita e si guarda chi c'e'.
   NOTA DI METODO, pagata mezz'ora fa da questo stesso file: la prima
   stesura non trovava la funzione da chiamare, non misurava NIENTE, e
   stampava "nessun cognome in comune". Un attrezzo che dichiara successo
   quando non ha misurato e' peggio di nessun attrezzo: adesso se non
   raccoglie i nomi esce ROSSO e lo dice. */
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
  const out=await pg.evaluate(async()=>{
    const t=window.__test; t.dismissSplash&&t.dismissSplash();
    const res=[];
    for(const tg of [5,7,11]){
      if(tg===5) t.startMatch(1,1); else t.startMatch(1,1,{size:tg});
      await new Promise(r=>setTimeout(r,300));
      const P=typeof t.players==='function'?t.players():t.players;
      if(!P||!P.length){res.push({tg,errore:'nessun giocatore in campo'});continue;}
      const nomi=t=>P.filter(x=>x.team===t).map(x=>x.nome||x.name||'').filter(Boolean);
      const A=nomi(0),B=nomi(1);
      if(!A.length||!B.length){res.push({tg,errore:'i giocatori non portano un nome: A='+A.length+' B='+B.length});continue;}
      const cog=n=>String(n).split(' ').slice(1).join(' ');
      const pri=n=>String(n).split(' ')[0];
      const tutti=A.concat(B);
      const conta=(arr,f)=>{const m={};for(const x of arr){const k=f(x);m[k]=(m[k]||0)+1;}return Object.keys(m).filter(k=>m[k]>1);};
      res.push({tg,A,B,
        doppi:conta(tutti,cog),
        doppiNome:conta(tutti,pri),
        doppiPersona:conta(tutti,x=>x)});
    }
    return res;
  });
  await b.close(); s.close();
  let male=0, misurate=0;
  for(const r of out){
    if(r.errore){ console.log(`NO  ${r.tg} contro ${r.tg}: NON MISURATO — ${r.errore}`); male++; continue; }
    misurate++;
    const ok=r.doppi.length===0 && r.doppiNome.length===0 && r.doppiPersona.length===0; if(!ok)male++;
    console.log(`${ok?'OK ':'NO '} ${r.tg} contro ${r.tg}`);
    console.log(`      casa: ${r.A.join(' · ')}`);
    console.log(`      ospiti: ${r.B.join(' · ')}`);
    if(r.doppi.length) console.log(`      COGNOMI RIPETUTI: ${r.doppi.join(', ')}`);
    if(r.doppiNome.length) console.log(`      NOMI PROPRI RIPETUTI: ${r.doppiNome.join(', ')}`);
    if(r.doppiPersona.length) console.log(`      PERSONE IDENTICHE: ${r.doppiPersona.join(', ')}`);
  }
  if(!misurate){ console.log('\nROSSO: non e\' stata misurata nessuna taglia. Il verdetto non si da\'.'); process.exit(2); }
  console.log(male?`\nROSSO: ${male} taglie con cognomi doppi o non misurate`:`\nVERDE: nessun cognome in comune, su ${misurate} taglie`);
  process.exit(male?1:0);
})();
