/* striscia del rigore IN CORSO: la posa 'rigori' di striscia.js si ferma
   alla scelta della zona, dove il tiratore e' fermo per progetto. Qui il
   duello si porta fino alla battuta, che e' il momento da guardare. */
const fs=require('fs'), path=require('path'), http=require('http');
const { chromium } = require('playwright');
const RADICE='C:/Users/Utenteee/Desktop/GitHub/games';
function arg(n,d){const i=process.argv.indexOf('--'+n);return i>0&&process.argv[i+1]&&!process.argv[i+1].startsWith('--')?process.argv[i+1]:d;}
function servi(){return new Promise(ok=>{const s=http.createServer((req,res)=>{const f=path.join(RADICE,decodeURIComponent(req.url.split('?')[0]));if(!fs.existsSync(f)){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});fs.createReadStream(f).pipe(res);});s.listen(0,'127.0.0.1',()=>ok({porta:s.address().port,chiudi:()=>s.close()}));});}
(async()=>{
  const n=+arg('n',10), passo=+arg('passo',0.045), out=path.resolve(arg('out','_rig.png'));
  const fase=arg('fase','result');
  const rit=(arg('ritaglio','0.36,0.38,0.30,0.48')).split(',').map(Number);
  const srv=await servi();
  const browser=await chromium.launch();
  const ctx=await browser.newContext({viewport:{width:915,height:412},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:'it-IT'});
  const pag=await ctx.newPage();
  await pag.addInitScript(seme=>{let s=seme>>>0||1;const p=()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s>>>0;};Math.random=()=>p()/4294967296;},20260731);
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`,{waitUntil:'load'});
  await pag.waitForFunction('window.__test !== undefined',null,{timeout:20000});
  await pag.waitForTimeout(700);
  await pag.evaluate(()=>{const t=window.__test;t.dismissSplash&&t.dismissSplash();t.startMatch(1,1);t.rigori();});
  await pag.waitForTimeout(1600);        // la transizione a bande deve finire
  await pag.evaluate(f=>{
    const st=document.createElement('style');
    st.textContent='*,*::before,*::after{animation-play-state:paused !important;transition:none !important}';
    document.head.appendChild(st);
    window.requestAnimationFrame=()=>0;      // il ciclo vivo si zittisce QUI
    Duel.shooterHuman=false; Duel.keeperHuman=false;
    Duel.zone=2; Duel.keeperZone=0; Duel.powerQ=1; Duel.outcome='gol';
    Duel.shown=true; Duel.poseT=0;
    if(f==='result'){ Duel.phase='result'; Duel.resultT=0; }
    else { Duel.phase='power'; Duel.cursor=0.5; Duel.dir=1; }
  }, fase);
  const scatti=[];
  const clip={x:Math.round(rit[0]*915), y:Math.round(rit[1]*412), width:Math.round(rit[2]*915), height:Math.round(rit[3]*412)};
  for(let i=0;i<n;i++){
    await pag.evaluate(s=>{ const t=window.__test; if(s>0) t.simulate(s); t.disegna(); }, i===0?0:passo);
    scatti.push({t:(i*passo).toFixed(2), b:(await pag.screenshot({type:'png',clip})).toString('base64')});
  }
  const col=5;
  const html=`<body style="margin:0;background:#0d1210;font:12px ui-monospace,monospace;color:#cfe">
  <h1 style="font:600 14px ui-monospace;padding:8px 12px;margin:0">rigore (${fase}) — ${n} fotogrammi, uno ogni ${passo}s</h1>
  <div style="display:grid;grid-template-columns:repeat(${col},1fr);gap:3px;padding:0 3px 3px">
  ${scatti.map(s=>`<figure style="margin:0"><img src="data:image/png;base64,${s.b}" style="width:100%;display:block">
  <figcaption style="padding:3px 6px;background:#161c1a">+${s.t}s</figcaption></figure>`).join('')}
  </div></body>`;
  const p2=await ctx.newPage();
  await p2.setViewportSize({width:clip.width*2*col+40,height:600});
  await p2.setContent(html);
  await p2.waitForTimeout(400);
  fs.writeFileSync(out, await (await p2.$('body')).screenshot({type:'png'}));
  console.log(out);
  await ctx.close(); await browser.close(); srv.chiudi();
})().catch(e=>{console.error(e);process.exit(1);});
