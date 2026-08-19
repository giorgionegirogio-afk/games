/* SONDA META — sola lettura. Misura le superfici INTORNO alla partita:
   profondita' di navigazione, contenuto delle schermate, dimensione dei
   bersagli, tabellino di fine partita. Non modifica il gioco. */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname);
const TIPI = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8',
  '.png':'image/png', '.json':'application/json', '.webmanifest':'application/manifest+json' };
function servi(){
  return new Promise(ok=>{
    const s=http.createServer((req,res)=>{
      const p=decodeURIComponent(req.url.split('?')[0]);
      const f=path.join(RADICE, p==='/'?'index.html':p);
      if(!f.startsWith(RADICE)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);res.end('no');return;}
      res.writeHead(200,{'Content-Type':TIPI[path.extname(f)]||'application/octet-stream','Cache-Control':'no-store'});
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0,'127.0.0.1',()=>ok({porta:s.address().port,chiudi:()=>s.close()}));
  });
}

(async()=>{
  const srv=await servi();
  const br=await chromium.launch();
  const ctx=await br.newContext({viewport:{width:915,height:412},deviceScaleFactor:2,hasTouch:true});
  const pg=await ctx.newPage();
  const out={};
  await pg.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`,{waitUntil:'load'});
  await pg.waitForFunction(()=>window.__test,null,{timeout:30000});

  // 1. schermate presenti
  out.schermate = await pg.evaluate(()=>[...document.querySelectorAll('.ov')].map(e=>e.id));

  // 2. tocco sullo splash
  await pg.mouse.click(450,200); await pg.waitForTimeout(700);
  out.dopoSplash = await pg.evaluate(()=>({
    menuVisibile: !document.getElementById('menu').classList.contains('hidden'),
    splashVia: getComputedStyle(document.getElementById('splash')).display==='none' ||
               document.getElementById('splash').classList.contains('via') ||
               +getComputedStyle(document.getElementById('splash')).opacity===0,
  }));

  // 3. bersagli del menu
  out.menu = await pg.evaluate(()=>{
    const v=[...document.querySelectorAll('#menu .voce')];
    return v.map(b=>{const r=b.getBoundingClientRect();return {t:b.textContent.trim().split('\n')[0].slice(0,40),w:Math.round(r.width),h:Math.round(r.height)};});
  });

  // 4. apri ogni schermata via bottone e conta il contenuto
  const apri = async (idBtn, idScr)=>{
    await pg.evaluate(id=>document.getElementById(id).click(), idBtn);
    await pg.waitForTimeout(350);
    return pg.evaluate(id=>{
      const e=document.getElementById(id);
      if(!e) return {assente:true};
      const st=getComputedStyle(e);
      return { visibile: !e.classList.contains('hidden') && st.display!=='none',
               bottoni: e.querySelectorAll('button').length,
               righe: e.querySelectorAll('.achrow,.alboriga,.fcard,.stile,.rosariga .rosalist>*,tr').length,
               testo: e.innerText.replace(/\s+/g,' ').slice(0,600) };
    }, idScr);
  };
  const back = async id=>{ await pg.evaluate(i=>{const b=document.getElementById(i); if(b) b.click();}, id); await pg.waitForTimeout(300); };

  out.spogliatoio = await apri('btnSpogliatoio','spogliatoio');
  out.rosa = await apri('btnRosa','rosa'); await back('btnBackRosa');
  await pg.evaluate(()=>document.getElementById('btnSpogliatoio').click()); await pg.waitForTimeout(300);
  out.squadra = await apri('btnSquadra','squadra'); await back('btnBackSquadra');
  await pg.evaluate(()=>document.getElementById('btnSpogliatoio').click()); await pg.waitForTimeout(300);
  out.campi = await apri('btnCampi','campi'); await back('btnBackCampi');
  out.bacheca = await apri('btnBacheca','bacheca');
  out.trofei = await apri('btnTrofei','trofei'); await back('btnBackTrofei');
  await pg.evaluate(()=>document.getElementById('btnBacheca').click()); await pg.waitForTimeout(300);
  out.statistiche = await apri('btnStatsScr','statistiche'); await back('btnBackStats');
  out.negozio = await apri('btnNegozio','negozio'); await back('btnBackNegozio');
  out.stagione = await apri('btnStagione','stagione'); await back('btnBackStagione');
  out.torneo = await apri('btnTorneo','torneo'); await back('btnBackTorneo');
  out.gioca = await apri('btnGioca','gioca');

  // 5. profondita': quanti tocchi dal freddo al calcio d'inizio
  await pg.evaluate(()=>document.getElementById('btn1p').click());
  await pg.waitForTimeout(1200);
  out.inPartita = await pg.evaluate(()=>({scena:window.__test.G.scene, tempo:window.__test.G.timeLeft}));

  // 6. pausa: cosa mostra
  await pg.waitForTimeout(3000);
  await pg.evaluate(()=>document.getElementById('pauseBtn').click());
  await pg.waitForTimeout(400);
  out.pausa = await pg.evaluate(()=>{
    const e=document.getElementById('pausa');
    return { visibile:!e.classList.contains('hidden'), testo:e.innerText.replace(/\s+/g,' ').slice(0,400) };
  });
  await pg.evaluate(()=>document.getElementById('btnResume').click());
  await pg.waitForTimeout(300);

  // 7. fine partita
  await pg.evaluate(()=>window.__test.forceWinMatch());
  await pg.waitForTimeout(1500);
  out.fine = await pg.evaluate(()=>{
    const e=document.getElementById('end');
    return { visibile:!e.classList.contains('hidden'),
             bottoni:[...e.querySelectorAll('button')].map(b=>b.textContent.trim()),
             righeTab:e.querySelectorAll('#statBody tr').length,
             testo:e.innerText.replace(/\s+/g,' ').slice(0,700) };
  });

  // 8. accessibilita' grezza: tabulazione e contrasto dichiarato
  out.a11y = await pg.evaluate(()=>({
    ariaLive: document.querySelectorAll('[aria-live]').length,
    tabindex: document.querySelectorAll('[tabindex]').length,
    lang: document.documentElement.lang,
    bottoniTotali: document.querySelectorAll('button').length,
    inputTotali: document.querySelectorAll('input').length,
  }));

  console.log(JSON.stringify(out,null,1));
  await br.close(); srv.chiudi();
})().catch(e=>{console.error('ERRORE',e);process.exit(1);});
