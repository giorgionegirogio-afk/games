/* Quanto vale DAVVERO la sovrapposizione fra il disco TIRA e la bussola
   quando a mancino si specchiano i soli dischi? Il commento spedito nel
   gioco dice 3.848 px2; il cancello dello stesso autore ne misura 1836.
   Qui si misura con SEI definizioni diverse, cosi' nessuna scusa regge. */
const { chromium } = require('playwright');
const B='http://127.0.0.1:8791/fuori/';
const arg=(n,d)=>{const i=process.argv.indexOf('--'+n);return i>0&&process.argv[i+1]&&!process.argv[i+1].startsWith('--')?process.argv[i+1]:d;};
const FILE=arg('gioco','crit-monco.html');
const W=+arg('vw',915), H=+arg('vh',412);

(async()=>{
  const b=await chromium.launch();
  const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,isMobile:true,hasTouch:true,locale:'it-IT'});
  const pg=await ctx.newPage();
  pg.on('pageerror',e=>console.log('PAGEERROR '+e.message));
  await pg.addInitScript(()=>{ try{ localStorage.setItem('calcetto_save_v4', JSON.stringify({pollice:{scala:100,spazio:100,mancino:1}})); }catch(e){} });
  await pg.goto(B+FILE+'?v='+Date.now(),{waitUntil:'load'});
  await pg.waitForFunction('window.__test && window.__test.state',null,{timeout:20000});
  const r = await pg.evaluate(()=>{
    const t=window.__test;
    /* chiavi di salvataggio: si scrive quella vera e si ricarica lo stato */
    SAVE.pollice={scala:100,spazio:100,mancino:1}; persistSave();
    if(t.dismissSplash) t.dismissSplash();
    t.startMatch(1,1,{size:5});
    for(let i=0;i<200 && t.state!=='play';i++) t.simulate(0.1);
    if(t.posaHUD) t.posaHUD(true);
    t.disegna(); t.disegna();
    const zone=t.comandiTouch, mini=zone.find(z=>z.tipo==='minimappa');
    const b=t.pulsanti(0);
    const rettRett=(x0,y0,x1,y1,m)=>Math.max(0,Math.min(x1,m.x1)-Math.max(x0,m.x0))*Math.max(0,Math.min(y1,m.y1)-Math.max(y0,m.y0));
    /* cerchio ∩ rettangolo per campionamento fitto (passo 0,1 px) */
    const cerchioRett=(cx,cy,r,m)=>{
      const p=0.1; let a=0;
      for(let x=Math.max(m.x0,cx-r); x<Math.min(m.x1,cx+r); x+=p)
        for(let y=Math.max(m.y0,cy-r); y<Math.min(m.y1,cy+r); y+=p)
          if((x-cx)**2+(y-cy)**2<=r*r) a+=p*p;
      return a;
    };
    const out={ VW:innerWidth, VH:innerHeight, mini:mini?{x0:mini.x0,y0:mini.y0,x1:mini.x1,y1:mini.y1}:null,
                dischi:b.map(d=>({act:d.act,x:+d.x.toFixed(2),y:+d.y.toFixed(2),r:+d.r.toFixed(2)})), mis:{} };
    if(mini){
      const somma={};
      for(const d of b){
        for(const [nome,rr] of [['r',d.r],['r+4',d.r+4],['r+10',d.r+10]]){
          const k1='bbox '+nome, k2='cerchio '+nome;
          somma[k1]=(somma[k1]||0)+rettRett(d.x-rr,d.y-rr,d.x+rr,d.y+rr,mini);
          somma[k2]=(somma[k2]||0)+cerchioRett(d.x,d.y,rr,mini);
        }
      }
      out.mis.tuttiIDischi={}; for(const k in somma) out.mis.tuttiIDischi[k]=+somma[k].toFixed(0);
      const d0=b[0], solo={};
      for(const [nome,rr] of [['r',d0.r],['r+4',d0.r+4],['r+10',d0.r+10]]){
        solo['bbox '+nome]=+rettRett(d0.x-rr,d0.y-rr,d0.x+rr,d0.y+rr,mini).toFixed(0);
        solo['cerchio '+nome]=+cerchioRett(d0.x,d0.y,rr,mini).toFixed(0);
      }
      out.mis.soloTIRA=solo; out.mis.tiraAct=d0.act;
    }
    return out;
  });
  console.log(JSON.stringify(r,null,1));
  await b.close();
})();
