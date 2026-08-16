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
  await p.touchscreen.tap(915-66,412-140).catch(()=>{});
  // tap e' troppo veloce: teniamo premuto con eventi grezzi
  await p.evaluate(()=>{
    const x=innerWidth-66,y=innerHeight-140;
    const tt=new Touch({identifier:7,target:document.getElementById('gioco'),clientX:x,clientY:y});
    document.getElementById('gioco').dispatchEvent(new TouchEvent('touchstart',{touches:[tt],changedTouches:[tt],targetTouches:[tt],bubbles:true,cancelable:true}));
  });
  await p.waitForTimeout(120);
  await p.screenshot({path:'istantanee/premuto.png'});
  await br.close(); console.log('ok');
})();
