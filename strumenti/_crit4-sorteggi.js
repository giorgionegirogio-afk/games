/* LA LEGGE SUI SORTEGGI, provata a RUNTIME e non contando le stringhe:
   stesso seme, stessa taglia, stessi passi -> stesso numero di sorteggi e
   stesso punteggio sul gioco spedito e sulla copia toppata.
   E la stessa cosa con la geometria del pollice spinta al massimo: se un
   numero della pagina COMANDI entrasse nel caso, si vedrebbe qui. */
const { chromium } = require('playwright');
const B='http://127.0.0.1:8791/';
const SEMI=[20260829,20260830,20260831,4242,777];
const TAGLIE=[5,7,11];

async function corsa(br,file,seme,taglia,pollice){
  const ctx=await br.newContext({viewport:{width:915,height:412},deviceScaleFactor:1,isMobile:true,hasTouch:true,locale:'it-IT'});
  const pg=await ctx.newPage();
  const err=[];
  pg.on('pageerror',e=>err.push(String(e.message).slice(0,120)));
  await pg.goto(B+file+'?v='+Date.now(),{waitUntil:'load'});
  await pg.waitForFunction('window.__test && window.__test.state',null,{timeout:20000});
  const r=await pg.evaluate(({seme,taglia,pollice})=>{
    const t=window.__test;
    if(pollice && typeof SAVE!=='undefined'){ SAVE.pollice=pollice; persistSave(); }
    t.dismissSplash();
    t.semina(seme);
    t.startMatch(1,1,{size:taglia});
    for(let i=0;i<900;i++) t.simulate(1/60);
    return { sorteggi:t.sorteggi, score:t.score.slice?t.score.slice():t.score, stato:t.state,
             pal: t.ball?[+t.ball.x.toFixed(4),+t.ball.y.toFixed(4)]:null };
  },{seme,taglia,pollice});
  await ctx.close();
  return {r,err};
}

(async()=>{
  const br=await chromium.launch();
  const righe=[];
  for(const taglia of TAGLIE) for(const seme of SEMI){
    const a=await corsa(br,'CALCETTO-il-gioco.html',seme,taglia,null);
    const b=await corsa(br,'fuori/cmd-prima.html',seme,taglia,null);
    const c=await corsa(br,'fuori/cmd-prima.html',seme,taglia,{scala:150,spazio:140,mancino:1});
    const eq=(x,y)=>JSON.stringify(x)===JSON.stringify(y);
    righe.push(['t'+taglia,'s'+seme,
      'spedito '+a.r.sorteggi+' '+JSON.stringify(a.r.score)+' '+JSON.stringify(a.r.pal),
      'toppa '+b.r.sorteggi+' '+JSON.stringify(b.r.score)+' '+JSON.stringify(b.r.pal),
      'toppa150sx '+c.r.sorteggi+' '+JSON.stringify(c.r.score)+' '+JSON.stringify(c.r.pal),
      (eq(a.r,b.r)?'UGUALE':'*** DIVERSO ***'),
      (eq(a.r,c.r)?'uguale-anche-a-150sx':'*** 150sx DIVERSO ***'),
      (a.err.length||b.err.length||c.err.length)?('ERR '+[...a.err,...b.err,...c.err][0]):''
    ].join(' | '));
    console.log(righe[righe.length-1]);
  }
  await br.close();
})();
