/* DOPO IL TOCCO CHE NON FA NIENTE, l'unica via d'uscita che il dito ha e'
   RIPRENDI — l'unico bottone rimasto sopra. Che cosa resta sullo schermo?
   Si prova col dito vero (click con hit-test), non con .click() del DOM. */
const { chromium } = require('playwright');
const arg=(n,d)=>{const i=process.argv.indexOf('--'+n);return i>0&&process.argv[i+1]&&!process.argv[i+1].startsWith('--')?process.argv[i+1]:d;};
const B='http://127.0.0.1:8791/fuori/'+arg('gioco','cmd-prima.html');

(async()=>{
  const br=await chromium.launch();
  const ctx=await br.newContext({viewport:{width:915,height:412},deviceScaleFactor:1,isMobile:true,hasTouch:true,locale:'it-IT'});
  const pg=await ctx.newPage();
  pg.on('pageerror',e=>console.log('PAGEERROR '+e.message));
  await pg.goto(B+'?v='+Date.now(),{waitUntil:'load'});
  await pg.waitForFunction('window.__test && window.__test.state',null,{timeout:20000});
  await pg.evaluate(()=>{ const t=window.__test; t.dismissSplash(); t.startMatch(1,1,{size:5});
    for(let i=0;i<200 && t.state!=='play';i++) t.simulate(0.1); setPaused(true); });
  await pg.waitForTimeout(150);
  await pg.click('#btnPauseComandi');           // dito vero sulla porta
  await pg.waitForTimeout(150);
  console.log('dopo «cambia»: '+JSON.stringify(await pg.evaluate(()=>({
    comandi:!document.getElementById('comandi').classList.contains('hidden'),
    pausa:!document.getElementById('pausa').classList.contains('hidden'), paused:__test.G.paused}))));
  /* RIPRENDI: l'unico bottone che il dito puo' ancora raggiungere */
  await pg.click('#btnResume');
  await pg.waitForTimeout(200);
  const r = await pg.evaluate(()=>{
    const cm=document.getElementById('comandi');
    const el=document.elementFromPoint(innerWidth/2, innerHeight/2);
    const bm=document.getElementById('btnCmdMano').getBoundingClientRect();
    const su=document.elementFromPoint(bm.left+bm.width/2, bm.top+bm.height/2);
    return { comandiAncoraAperto:!cm.classList.contains('hidden'),
             pausaChiusa:document.getElementById('pausa').classList.contains('hidden'),
             partitaRiprende:!__test.G.paused, scena:__test.state,
             alCentroDelloSchermoCe: el?(el.id||el.className||el.tagName):null,
             suMANOCe: su?(su.id||su.className||su.tagName):null };
  });
  console.log('dopo RIPRENDI: '+JSON.stringify(r,null,1));
  await pg.screenshot({path:'fuori/crit-dopo-riprendi.png'});

  /* e ora il tasto Indietro di Android, l'unica cura che la toppa ha scritto */
  const ind = await pg.evaluate(()=>{ const v=window.__indietro(); return {ritorno:v,
    comandi:!document.getElementById('comandi').classList.contains('hidden')}; });
  console.log('window.__indietro(): '+JSON.stringify(ind));
  await br.close();
})();
