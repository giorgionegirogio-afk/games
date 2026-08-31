/* QUANTO DELLA PAGINA COMANDI PUO' TOCCARE UN DITO, quando la pagina si
   apre dalla PAUSA. Si campiona ogni bottone a passo 2 px e si chiede al
   documento CHI riceverebbe quel tocco (elementFromPoint, la stessa
   domanda che fa il browser). Poi lo stesso conto aprendo la pagina dalle
   IMPOSTAZIONI, che e' il termine di paragone. */
const { chromium } = require('playwright');
const B='http://127.0.0.1:8791/fuori/'+(process.argv.indexOf('--gioco')>0?process.argv[process.argv.indexOf('--gioco')+1]:'cmd-prima.html');
const FIN=[[915,412],[810,384],[812,375],[640,360],[845,402]];

async function prova(br,w,h,da){
  const ctx=await br.newContext({viewport:{width:w,height:h},deviceScaleFactor:1,isMobile:true,hasTouch:true,locale:'it-IT'});
  const pg=await ctx.newPage();
  await pg.goto(B+'?v='+Date.now(),{waitUntil:'load'});
  await pg.waitForFunction('window.__test && window.__test.state',null,{timeout:20000});
  const r=await pg.evaluate((da)=>{
    const t=window.__test; t.dismissSplash();
    if(da==='pausa'){
      t.startMatch(1,1,{size:5});
      for(let i=0;i<200 && t.state!=='play';i++) t.simulate(0.1);
      setPaused(true);
      const b=document.getElementById('btnPauseComandi'); b.click();
    } else {
      goScreen(ui.impostazioni); refreshImpostUI();
      document.getElementById('btnSetComandi').click();
    }
    const ids=['btnCmdMano','btnCmdScala','btnCmdSpazio','btnBackComandi'];
    const out={};
    for(const id of ids){
      const el=document.getElementById(id); const q=el.getBoundingClientRect();
      let tot=0, mio=0;
      for(let x=q.left+1;x<q.right;x+=2) for(let y=q.top+1;y<q.bottom;y+=2){
        tot++;
        const e=document.elementFromPoint(x,y);
        if(e && (e===el || el.contains(e))) mio++;
      }
      out[id]={ raggiungibile:+(100*mio/Math.max(1,tot)).toFixed(1),
                centro:(()=>{const e=document.elementFromPoint(q.left+q.width/2,q.top+q.height/2);
                              return e?(e.id||e.className||e.tagName):null;})() };
    }
    const mm=document.getElementById('cmdMisura').getBoundingClientRect();
    let vis=0, tot2=0;
    for(let x=mm.left+1;x<mm.right;x+=2) for(let y=mm.top+1;y<mm.bottom;y+=2){
      tot2++; const e=document.elementFromPoint(x,y);
      if(e && document.getElementById('comandi').contains(e)) vis++;
    }
    out.cmdMisura={ scoperto:+(100*vis/Math.max(1,tot2)).toFixed(1) };
    return out;
  },da);
  await ctx.close();
  return r;
}

(async()=>{
  const br=await chromium.launch();
  for(const [w,h] of FIN){
    for(const da of ['impost','pausa']){
      const r=await prova(br,w,h,da);
      console.log(w+'x'+h+'  da '+da.padEnd(7)+'  '+
        ['btnCmdMano','btnCmdScala','btnCmdSpazio','btnBackComandi']
          .map(id=>id.replace('btnCmd','').replace('btnBackComandi','INDIETRO')+' '+r[id].raggiungibile+'%').join(' · ')+
        '  | riquadro misure scoperto '+r.cmdMisura.scoperto+'%'+
        '  | centro MANO -> '+r.btnCmdMano.centro);
    }
  }
  await br.close();
})();
