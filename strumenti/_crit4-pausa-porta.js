/* LA PORTA DALLA PAUSA, provata col DITO e non con .click() del DOM.
   #comandi e' un .ov (z-index 20). #pausa vale 45. Chi apre la pagina
   dalla pausa la apre SOTTO il pannello che l'ha chiamata: qui si misura
   chi sta davvero sopra, chi riceve il tocco, e si fotografa. */
const { chromium } = require('playwright');
const B='http://127.0.0.1:8791/fuori/cmd-prima.html';
const arg=(n,d)=>{const i=process.argv.indexOf('--'+n);return i>0&&process.argv[i+1]&&!process.argv[i+1].startsWith('--')?process.argv[i+1]:d;};
const W=+arg('vw',915), H=+arg('vh',412);

(async()=>{
  const br=await chromium.launch();
  const ctx=await br.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,isMobile:true,hasTouch:true,locale:'it-IT'});
  const pg=await ctx.newPage();
  pg.on('pageerror',e=>console.log('PAGEERROR '+e.message));
  await pg.goto(B+'?v='+Date.now(),{waitUntil:'load'});
  await pg.waitForFunction('window.__test && window.__test.state',null,{timeout:20000});

  /* partita in corso + pausa, come farebbe un dito */
  await pg.evaluate(()=>{ const t=window.__test; t.dismissSplash(); t.startMatch(1,1,{size:5});
    for(let i=0;i<200 && t.state!=='play';i++) t.simulate(0.1); setPaused(true); });
  await pg.waitForTimeout(200);

  /* il dito preme «cambia» dentro la riga dei comandi */
  const linkBox = await pg.evaluate(()=>{
    const b=document.getElementById('btnPauseComandi');
    if(!b) return null; const r=b.getBoundingClientRect();
    return {x:r.left+r.width/2, y:r.top+r.height/2, w:r.width, h:r.height};
  });
  console.log('bottone «cambia» nel pannello di pausa: '+JSON.stringify(linkBox));
  let esitoTap='ok';
  try{ await pg.mouse.click(linkBox.x, linkBox.y); }catch(e){ esitoTap='FALLITO '+e.message.slice(0,80); }
  await pg.waitForTimeout(250);

  const r = await pg.evaluate(()=>{
    const cm=document.getElementById('comandi'), pa=document.getElementById('pausa');
    const zc=getComputedStyle(cm).zIndex, zp=getComputedStyle(pa).zIndex;
    const bm=document.getElementById('btnCmdMano').getBoundingClientRect();
    const cx=bm.left+bm.width/2, cy=bm.top+bm.height/2;
    const sopra=document.elementFromPoint(cx,cy);
    /* e il centro del pannello COMANDI in generale */
    const box=document.querySelector('#comandi .box').getBoundingClientRect();
    const centro=document.elementFromPoint(box.left+box.width/2, box.top+box.height/2);
    return {
      comandiAperto: !cm.classList.contains('hidden'),
      pausaAperta:  !pa.classList.contains('hidden'),
      zComandi:zc, zPausa:zp,
      manoRect:{x:+bm.left.toFixed(1),y:+bm.top.toFixed(1),w:+bm.width.toFixed(1),h:+bm.height.toFixed(1)},
      chiRiceveIlDitoSuMANO: sopra? (sopra.id||sopra.className||sopra.tagName) : null,
      chiRiceveIlDitoAlCentro: centro? (centro.id||centro.className||centro.tagName) : null,
      dentroPausa: !!(sopra && sopra.closest && sopra.closest('#pausa')),
      dentroComandi: !!(sopra && sopra.closest && sopra.closest('#comandi')),
    };
  });
  console.log('tap su «cambia»: '+esitoTap);
  console.log(JSON.stringify(r,null,1));

  /* prova del dito VERO sul bottone MANO: se il pannello di pausa lo copre,
     Playwright rifiuta il click perche' un altro elemento lo intercetta */
  let esito='ok';
  try{ await pg.click('#btnCmdMano', {timeout:2500}); }
  catch(e){ esito='RIFIUTATO: '+String(e.message).split('\n').filter(l=>/intercept|subtree|not visible|timeout/i.test(l)).slice(0,2).join(' / ').slice(0,200); }
  console.log('click reale su MANO -> '+esito);
  const dopo = await pg.evaluate(()=>({ mancino:SAVE.pollice.mancino }));
  console.log('dopo il click: '+JSON.stringify(dopo));

  await pg.screenshot({path:'fuori/crit-comandi-da-pausa.png'});
  console.log('foto: fuori/crit-comandi-da-pausa.png');
  await br.close();
})();
