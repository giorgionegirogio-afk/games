const path=require('path');
const {chromium}=require('playwright');
(async()=>{
  const file='file://'+path.resolve(__dirname,'..','CALCETTO-il-gioco.html').split(path.sep).join('/');
  const br=await chromium.launch();
  const c=await br.newContext({viewport:{width:915,height:412},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const p=await c.newPage();
  await p.goto(file);
  await p.waitForFunction('window.__test !== undefined',null,{timeout:20000});
  await p.evaluate(()=>{ const t=window.__test; t.dismissSplash&&t.dismissSplash(); t.posaHUD(true); t.startMatch(1,1); t.simulate(4); });
  await p.waitForTimeout(600);
  /* BANCO ONESTO: nessun ripiego muto.
     Qui c'erano (915-66, 412-140) e (innerWidth-66, innerHeight-140)
     scritte a mano. Il gioco disegna il disco grande a (VW-64, VH-60):
     ottanta pixel piu' in BASSO, quindi il punto d'archivio cadeva
     ottanta pixel sopra il disco, cioe' sul manto. Questa sonda
     fotografava UNA PRESSIONE SULL'ERBA e salvava l'immagine come
     "premuto.png" — una bugia in forma di prova, che qualcuno avrebbe
     guardato per decidere. Misurato: nella vecchia foto il disco vero
     era ardesia spenta (52,62,57), nella nuova e' ambra (223,164,51),
     che e' il riempimento del tasto premuto. */
  const cen = await p.evaluate(()=>{
    const t=window.__test;
    if(typeof t.pulsanti!=='function') return {errore:'__test.pulsanti non esiste'};
    const b=t.pulsanti(0); if(!Array.isArray(b)||b.length<2) return {errore:'il gioco non dichiara due pulsanti'};
    const gr=b.reduce((a,z)=>(z.r>a.r?z:a),b[0]);
    if(!Array.isArray(t.comandiTouch)) return {errore:'__test.comandiTouch non esiste'};
    const zz=t.comandiTouch.filter(z=>z.tipo==='pulsante'&&(z.team|0)===0);
    if(!zz.length) return {errore:"il gioco non sta dipingendo nessun comando: fotograferei una pressione sul prato"};
    const dip=zz.reduce((a,z)=>(z.r>a.r?z:a),zz[0]);
    const d=Math.hypot(dip.x-gr.x,(dip.y-(dip.premuto?2:0))-gr.y);
    if(!(d<=1)) return {errore:'le due sorgenti non tornano: '+d.toFixed(2)+' px'};
    return {x:Math.round(gr.x),y:Math.round(gr.y),act:gr.act,label:gr.label};
  });
  if(cen.errore){ console.error('BANCO NON VALIDO — '+cen.errore); await br.close(); process.exit(2); }
  console.log('premo il disco grande a ('+cen.x+','+cen.y+') — '+cen.label+' ['+cen.act+']');
  await p.touchscreen.tap(cen.x,cen.y).catch(()=>{});
  // tap e' troppo veloce: teniamo premuto con eventi grezzi
  await p.evaluate(c=>{
    const x=c.x,y=c.y;
    const tt=new Touch({identifier:7,target:document.getElementById('gioco'),clientX:x,clientY:y});
    document.getElementById('gioco').dispatchEvent(new TouchEvent('touchstart',{touches:[tt],changedTouches:[tt],targetTouches:[tt],bubbles:true,cancelable:true}));
  }, cen);
  await p.waitForTimeout(120);
  await p.screenshot({path:'istantanee/premuto.png'});
  await br.close(); console.log('ok');
})();
