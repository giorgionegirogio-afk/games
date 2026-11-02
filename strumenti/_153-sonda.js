/* sonda usa-e-getta (voce #153): che cosa c'e' davvero sullo schermo
   nella posa, e perche' i dischi non si vedono */
'use strict';
const { servi, bancoDiProva, semeFisso, posaFerma } = require('./_posa.js');
(async () => {
  const { chromium } = require('playwright');
  const srv = await servi();
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 915, height: 412 },
    deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(semeFisso, 20260925);
  await pag.addInitScript(bancoDiProva);
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.waitForTimeout(400);
  await posaFerma(pag, { secondi: 12, taglia: 5, cronometro: 314, cpu: true });
  const a = await pag.evaluate(() => {
    const vis = [];
    for (const e of document.querySelectorAll('body > *')) {
      const s = getComputedStyle(e);
      if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) continue;
      const r = e.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) continue;
      vis.push((e.id || e.tagName) + ' ' + Math.round(r.x) + ',' + Math.round(r.y) + ' ' +
               Math.round(r.width) + 'x' + Math.round(r.height) + ' z' + s.zIndex);
    }
    return { scena: window.__test.state, paused: window.__test.paused,
             cpu: window.__test.G.cpu, vis: vis,
             pulsanti: window.__test.pulsanti(0).map(b => b.act + '@' + Math.round(b.x) + ',' + Math.round(b.y) + ' r' + b.r) };
  });
  console.log(JSON.stringify(a, null, 1));
  const b = await pag.evaluate(() => {
    for (const id of ['pausa','sfida','classifica','sfidaCarta']) { const e=document.getElementById(id); if(e) e.classList.add('hidden'); }
    window.__test.setPaused(false); window.__test.posaHUD(true); window.__test.disegna();
    const G = window.__test.G;
    const tutti = [];
    for (const e of document.querySelectorAll('*')) {
      const s = getComputedStyle(e);
      if (s.display==='none'||s.visibility==='hidden'||+s.opacity===0) continue;
      const r = e.getBoundingClientRect();
      if (r.width<4||r.height<4) continue;
      if (e.children.length===0 && (e.textContent||'').trim()) tutti.push((e.id||e.className||e.tagName)+' «'+e.textContent.trim().slice(0,20)+'»');
    }
    return { scena: window.__test.state, paused: window.__test.paused,
             moviola: !!G.moviola, ripresa: !!G.ripresa, nodi: tutti.slice(0,30) };
  });
  console.log(JSON.stringify(b, null, 1));
  const { scattoRipetibile } = require('./_posa.js');
  require('fs').writeFileSync(require('path').join(__dirname,'_153-sonda-A.png'), await scattoRipetibile(pag, null, { seme: 20260925 }));
  require('fs').writeFileSync(require('path').join(__dirname,'_153-sonda-B.png'), await pag.screenshot({ animations:'disabled' }));
  await br.close(); srv.chiudi();
})();
