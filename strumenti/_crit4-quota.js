/* i tre numeri che la pagina COMANDI misura, letti a tutte le taglie e su
   piu' finestre — e la geometria dei DUE giocatori con le manopole al
   massimo, che nessuno ha provato. */
const { chromium } = require('playwright');
const B='http://127.0.0.1:8791/fuori/cmd-prima.html';
const FIN=[[915,412],[845,402],[812,375],[810,384],[640,360]];

(async()=>{
  const br=await chromium.launch();
  for(const [w,h] of FIN){
    const ctx=await br.newContext({viewport:{width:w,height:h},deviceScaleFactor:1,isMobile:true,hasTouch:true,locale:'it-IT'});
    const pg=await ctx.newPage();
    const err=[]; pg.on('pageerror',e=>err.push(String(e.message).slice(0,120)));
    await pg.goto(B+'?v='+Date.now(),{waitUntil:'load'});
    await pg.waitForFunction('window.__test && window.__test.state',null,{timeout:20000});
    const r=await pg.evaluate(()=>{
      const t=window.__test, out=[];
      for(const sc of [85,100,115,130,150]){
        SAVE.pollice={scala:sc,spazio:100,mancino:0};
        out.push({scala:sc, mis:t.misurePollice()});
      }
      /* DUE GIOCATORI con le manopole al massimo: le due colonne si toccano? */
      SAVE.pollice={scala:150,spazio:140,mancino:0};
      t.dismissSplash(); t.startMatch(2,1,{size:5});
      for(let i=0;i<120 && t.state!=='play';i++) t.simulate(0.1);
      const A=t.pulsanti(0), Bp=t.pulsanti(1);
      let minPresa=1e9, fuori=0;
      const tutti=A.concat(Bp);
      for(let i=0;i<tutti.length;i++){
        const d=tutti[i];
        if(d.x-d.r<0 || d.x+d.r>innerWidth || d.y-d.r<0 || d.y+d.r>innerHeight) fuori++;
        for(let j=i+1;j<tutti.length;j++){
          const e=tutti[j];
          minPresa=Math.min(minPresa, Math.hypot(d.x-e.x,d.y-e.y)-(d.r+10)-(e.r+10));
        }
      }
      return { VW:innerWidth, VH:innerHeight, scale:out, mode:t.state,
               due:{ minPresa:+minPresa.toFixed(2), fuori,
                     sx:A.map(d=>+d.x.toFixed(1)), dx:Bp.map(d=>+d.x.toFixed(1)),
                     r:A.map(d=>+d.r.toFixed(1)) } };
    });
    console.log(w+'x'+h+' '+JSON.stringify(r)+(err.length?(' ERR '+err[0]):''));
    await ctx.close();
  }
  await br.close();
})();
