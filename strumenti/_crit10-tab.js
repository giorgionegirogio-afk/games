/* _crit10-tab.js — sonda avversaria sul tabellone.
   Misura la geometria della lavagnetta a piu' formati e con piu' nomi,
   sul gioco di IERI e su quello curato, e confronta.
   uso: node strumenti/_crit10-tab.js --a fuori/cmd-tabellone-base.html --b fuori/cmd-tabellone.html */
const fs=require('fs'), path=require('path'), http=require('http');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname,'..');
const arg=(n,d)=>{const i=process.argv.indexOf('--'+n);return i>0&&process.argv[i+1]&&!process.argv[i+1].startsWith('--')?process.argv[i+1]:d;};

const TIPI={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.woff2':'font/woff2'};
function servi(src){return new Promise(ok=>{const s=http.createServer((rq,rs)=>{
  const u=decodeURIComponent(rq.url.split('?')[0]);
  const f=path.join(RADICE,u==='/'?'index.html':u);
  if(/CALCETTO-il-gioco\.html$/i.test(f)){rs.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});rs.end(src);return;}
  fs.readFile(f,(e,d)=>{if(e){rs.writeHead(404);rs.end('no');return;}
    rs.writeHead(200,{'Content-Type':TIPI[path.extname(f)]||'application/octet-stream','Cache-Control':'no-store'});rs.end(d);});
});s.listen(0,'127.0.0.1',()=>ok({porta:s.address().port,chiudi:()=>s.close()}));});}

const BANCO=()=>{const P=1000/60;let t=0,coda=[];
  window.requestAnimationFrame=cb=>{coda.push(cb);return coda.length;};
  window.cancelAnimationFrame=()=>{};
  try{performance.now=()=>t;}catch(e){}
  window.__banco={passo(n){n=Math.max(0,Math.round(+n||0));for(let i=0;i<n;i++){const c=coda;coda=[];t+=P;for(const f of c){try{f(t);}catch(e){}}}return t;}};};

const FORMATI=[
  {nome:'telefono orizz. 915x412', VW:915, VH:412},
  {nome:'APK reale     810x384',   VW:810, VH:384},
  {nome:'VERTICALE     412x915',   VW:412, VH:915},
  {nome:'verticale str. 360x740',  VW:360, VH:740},
  {nome:'tablet       1112x834',   VW:1112,VH:834},
];
const NOMI=[
  ['DOPOLAVORO','CPU'],
  ['DOPOLAVORO','TORRE VECCHIA'],
  ['WWWWWWWWWWWW','CPU'],          // 12 caratteri, il massimo dell'input
  ['MMMMMMMMMMMM','CPU'],
  ['DOPOLAVORO','ROSA'],
];

(async()=>{
  const fileA=path.resolve(RADICE,arg('a','fuori/cmd-tabellone-base.html'));
  const fileB=path.resolve(RADICE,arg('b','fuori/cmd-tabellone.html'));
  const out={};
  for(const [et,file] of [['IERI',fileA],['OGGI',fileB]]){
    const srv=await servi(fs.readFileSync(file,'utf8'));
    const br=await chromium.launch();
    out[et]=[];
    for(const F of FORMATI){
      const ctx=await br.newContext({viewport:{width:F.VW,height:F.VH},deviceScaleFactor:1,isMobile:true,hasTouch:true,locale:'it-IT'});
      const pag=await ctx.newPage();
      await pag.addInitScript(BANCO);
      await pag.goto('http://127.0.0.1:'+srv.porta+'/CALCETTO-il-gioco.html?t='+Date.now(),{waitUntil:'load',timeout:60000});
      await pag.waitForFunction('window.__test !== undefined',null,{timeout:20000});
      const r=await pag.evaluate(async (NOMI)=>{
        const t=window.__test,B=window.__banco,G=t.G;
        try{t.dismissSplash&&t.dismissSplash();}catch(e){}
        B.passo(4);
        t.semina(1);
        {let fermi=0;for(let g=0;g<20&&fermi<2;g++){const a=t.sorteggi;await new Promise(r=>setTimeout(r,300));fermi=(t.sorteggi===a)?fermi+1:0;}}
        t.semina(20260829); t.setCpuVsCpu(true);
        t.startMatch(1,1,{size:11});
        for(let i=0;i<900;i++){B.passo(1);if(t.state==='play')break;}
        const cv=document.getElementById('gioco'), cg=cv.getContext('2d');
        const K=cv.width/innerWidth;
        const res=[];
        for(const nm of NOMI){
          G.teamName=nm[0]; G.oppName=nm[1];
          t.disegna(); t.disegna();
          const z=t.zoneInterfaccia?t.zoneInterfaccia():[];
          const tb=z.find(q=>q.tipo==='tabellone');
          // misura di riferimento dei nomi col carattere vero
          const mis=(s,fs)=>{const o=cg.font;cg.font='700 '+fs+'px '+(window.FONT_C||'"Barlow Condensed",system-ui,sans-serif');const w=cg.measureText(s).width;cg.font=o;return w;};
          res.push({nomi:nm, VW:innerWidth, VH:innerHeight,
            x0: tb?tb.x0:null, x1: tb?tb.x1:null, larg: tb?(tb.x1-tb.x0):null,
            barH: tb?tb.y1:null,
            frazione: tb? +(((tb.x1-tb.x0)/innerWidth)*100).toFixed(2):null,
            fascia: tb? +((((tb.x1+24)-(tb.x0-24))/innerWidth)*100).toFixed(2):null,
            // stato interno se esposto
            stato: (typeof window.TAB_NOMI!=='undefined')?JSON.parse(JSON.stringify(window.TAB_NOMI)):null,
            w15:[mis(nm[0],15),mis(nm[1],15)],
            centroPannello: tb? +(((tb.x0+tb.x1)/2 - innerWidth/2).toFixed(2)) : null,
          });
        }
        return res;
      },NOMI);
      out[et].push({formato:F.nome,dati:r});
      await ctx.close();
    }
    await br.close(); srv.chiudi();
  }
  // stampa confronto
  for(let i=0;i<FORMATI.length;i++){
    console.log('\n=== '+FORMATI[i].nome+' ===');
    const A=out.IERI[i].dati, Bv=out.OGGI[i].dati;
    for(let j=0;j<NOMI.length;j++){
      const a=A[j], b=Bv[j];
      console.log('  '+(NOMI[j][0]+'/'+NOMI[j][1]).padEnd(28)+
        ' ieri '+String(a.larg).padStart(4)+'px ('+String(a.frazione).padStart(5)+'%) ['+a.x0+'..'+a.x1+']'+
        '   oggi '+String(b.larg).padStart(4)+'px ('+String(b.frazione).padStart(5)+'%) ['+b.x0+'..'+b.x1+']'+
        '   nomi@15px '+b.w15.map(x=>x.toFixed(1)).join('/')+
        '   scentr. ieri '+a.centroPannello+' oggi '+b.centroPannello+
        (b.larg>a.larg?'   <<< PIU\' LARGO DI IERI':''));
    }
  }
})();
