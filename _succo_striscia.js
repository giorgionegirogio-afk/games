/* Striscia sui MOMENTI FORTI veri, non su quelli forzati.
   La posa 'gol' di striscia.js usa forceGoal da centrocampo: la palla non
   arriva mai al sacco, quindi il colpo — che e' esattamente cio' che si
   deve guardare — non si vede. Qui si gioca CPU contro CPU finche' non
   succede davvero, e si monta la striscia da li'.
     --caso rete     il fotogramma in cui la palla tocca il fondo
     --caso tiro     il fotogramma in cui parte una cannonata
     --caso urto     il primo rimbalzo forte (palo, sponda, corpo)   */
const fs=require('fs'), path=require('path'), http=require('http');
const { chromium } = require('playwright');
const RADICE='C:/Users/Utenteee/Desktop/GitHub/games';
function arg(n,d){const i=process.argv.indexOf('--'+n);return i>0&&process.argv[i+1]&&!process.argv[i+1].startsWith('--')?process.argv[i+1]:d;}
function servi(){return new Promise(ok=>{const s=http.createServer((req,res)=>{const f=path.join(RADICE,decodeURIComponent(req.url.split('?')[0]));if(!fs.existsSync(f)){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});fs.createReadStream(f).pipe(res);});s.listen(0,'127.0.0.1',()=>ok({porta:s.address().port,chiudi:()=>s.close()}));});}
(async()=>{
  const caso=arg('caso','rete');
  const n=+arg('n',10), passo=+arg('passo',0.04), out=path.resolve(arg('out','_succo.png'));
  const rit=(arg('ritaglio','0,0,1,1')).split(',').map(Number);
  const seme=+arg('seme',20260731);
  const srv=await servi();
  const browser=await chromium.launch();
  const ctx=await browser.newContext({viewport:{width:915,height:412},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:'it-IT'});
  const pag=await ctx.newPage();
  await pag.addInitScript(s0=>{let s=s0>>>0||1;const p=()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s>>>0;};Math.random=()=>p()/4294967296;},seme);
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`,{waitUntil:'load'});
  await pag.waitForFunction('window.__test !== undefined',null,{timeout:20000});
  await pag.waitForTimeout(700);
  if(process.argv.includes('--senzamoto')) await pag.evaluate(()=>{ window.__moto=0; });
  await pag.evaluate(e=>{ window.__esito=e; }, arg('esito','gol'));
  const trovato = await pag.evaluate(async (c)=>{
    const t=window.__test;
    t.dismissSplash&&t.dismissSplash();
    t.startMatch(1,1); t.setCpuVsCpu(true);
    if(window.__moto===0) t.setMoto(false);
    window.requestAnimationFrame=()=>0;      // il ciclo vivo si zittisce
    /* LA TENDINA DI PARTENZA VA SMALTITA PRIMA DI CERCARE. La transizione a
       tendina fra menu e campo avanza dentro render(), non dentro simulate():
       chi zittisce il rAF e poi cerca l'evento solo simulando si ritrova la
       tendina ancora spiegata sul primo fotogramma della striscia, cioe' i
       primi tre riquadri erano il logo invece del gol. Un secondo e mezzo di
       ciclo vero (simulate + disegna) la smaltisce e allinea anche la camera. */
    for(let j=0;j<90;j++){ t.simulate(1/60); t.disegna(); }
    /* la tendina e' un elemento del DOM con un'animazione CSS: senza rAF il
       browser non le fa avanzare e resta spiegata sopra al primo scatto.
       Non e' un difetto del gioco, e' il banco: qui si toglie di mezzo. */
    { const w=document.getElementById('wipe'); if(w) w.remove(); }
    /* --caso rigore: il duello dal dischetto portato fino all'istante del
       contatto. E' la schermata che decide le partite e nessuna striscia
       l'aveva mai guardata in movimento. */
    if(c==='rigore'){
      t.rigori();
      for(let j=0;j<40;j++){ t.simulate(1/60); t.disegna(); }
      const D=t.Duel;
      if(D.phase==='zone') D.pickZone(2);
      for(let j=0;j<10;j++){ t.simulate(1/60); t.disegna(); }
      if(D.phase==='power') D.stopPower();
      for(let j=0;j<10;j++){ t.simulate(1/60); t.disegna(); }
      if(D.phase==="wait") D.pickKeeper(0);
      /* l'esito lo decide un sorteggio: per la striscia serve SEMPRE quello
         che si deve guardare, cioe' la palla nel sacco. Si forza solo la
         parola, non la meccanica. --esito parata per l'altro caso. */
      const vuole=(window.__esito||'gol');
      D.outcome=vuole;
      if(vuole==='parata') D.keeperZone=D.zone;
      return {ok:true, i:0, esito:D.outcome};
    }
    let vPrec=0;
    for(let i=0;i<60*300;i++){
      t.simulate(1/60); t.disegna();
      const b=t.ball, sp=Math.hypot(b.vx||0,b.vy||0);
      if(c==='rete'  && t.state==='goal') return {ok:true, i};
      if(c==='tiro'  && sp>560 && vPrec<300) return {ok:true, i};
      if(c==='urto'  && vPrec>430 && sp<vPrec*0.75 && sp>60) return {ok:true, i};
      if(c==='scivolata'){ for(const p of t.players) if(p.slide>=0 && p.slide<0.02) return {ok:true, i}; }
      vPrec=sp;
    }
    return {ok:false};
  }, caso);
  if(!trovato.ok){ console.log('non e\' successo niente in cinque minuti di gioco'); process.exit(1); }
  const scatti=[];
  const clip={x:Math.round(rit[0]*915), y:Math.round(rit[1]*412), width:Math.round(rit[2]*915), height:Math.round(rit[3]*412)};
  /* un passo di 0,05 s NON si fa con una simulate sola: disegna() fa
     avanzare la camera di un sessantesimo per chiamata, quindi con una
     chiamata ogni tre passi l'inquadratura resta indietro di due terzi e
     la striscia racconta una camera che non esiste. Si alternano
     simulate(1/60) e disegna(), che e' esattamente il ciclo vero. */
  const sub=Math.max(1,Math.round(passo*60));
  const salta=+arg('salta',0);
  if(salta>0) await pag.evaluate(k=>{ const t=window.__test; for(let j=0;j<k;j++){ t.simulate(1/60); t.disegna(); } }, Math.round(salta*60));
  for(let i=0;i<n;i++){
    await pag.evaluate(k=>{ const t=window.__test; for(let j=0;j<k;j++){ t.simulate(1/60); t.disegna(); } if(!k) t.disegna(); }, i===0?0:sub);
    scatti.push({t:(i*sub/60).toFixed(2), b:(await pag.screenshot({type:'png',clip})).toString('base64')});
  }
  const col=5;
  const html=`<body style="margin:0;background:#0d1210;font:12px ui-monospace,monospace;color:#cfe">
  <h1 style="font:600 14px ui-monospace;padding:8px 12px;margin:0">${caso} — ${n} fotogrammi, uno ogni ${passo}s</h1>
  <div style="display:grid;grid-template-columns:repeat(${col},1fr);gap:3px;padding:0 3px 3px">
  ${scatti.map(s=>`<figure style="margin:0"><img src="data:image/png;base64,${s.b}" style="width:100%;display:block">
  <figcaption style="padding:3px 6px;background:#161c1a">+${s.t}s</figcaption></figure>`).join('')}
  </div></body>`;
  const p2=await ctx.newPage();
  await p2.setViewportSize({width:Math.min(1900,clip.width*2*col+40),height:600});
  await p2.setContent(html);
  await p2.waitForTimeout(400);
  const h=await p2.evaluate(()=>document.body.scrollHeight);
  await p2.setViewportSize({width:Math.min(1900,clip.width*2*col+40),height:h+10});
  await p2.screenshot({path:out,fullPage:true});
  console.log(out);
  await ctx.close(); await browser.close(); srv.chiudi();
})().catch(e=>{console.error(e);process.exit(1);});
