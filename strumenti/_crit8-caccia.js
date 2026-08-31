/* _crit8-caccia.js — caccia il fotogramma vero: dischi offensivi
   (FILTRANTE+PASSA) e almeno un uomo sotto una pastiglia svuotata.
   Fotografa la tela dello stesso fotogramma nei due giochi.
   uso: node strumenti/_crit8-caccia.js --gioco fuori/comandi.html --tag cura */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'CALCETTO-il-gioco.html')));
const TAG = arg('tag', 'x');
const VW = +arg('vw', 915), VH = +arg('vh', 412);
const PASSO_FISSO = +arg('passo', 0);
const ridirigi = f => /CALCETTO-il-gioco\.html$/i.test(f) ? GIOCO : f;
function servi() { return new Promise(ok => { const s = http.createServer((rq, rs) => { const u = decodeURIComponent(rq.url.split('?')[0]); const f = ridirigi(path.join(RADICE, u === '/' ? 'index.html' : u)); fs.readFile(f, (e, d) => { if (e) { rs.writeHead(404); rs.end('no'); return; } rs.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); rs.end(d); }); }); s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() })); }); }
const BANCO = () => { const PASSO = 1000 / 60; let t = 0, coda = []; window.requestAnimationFrame = cb => { coda.push(cb); return coda.length; }; window.cancelAnimationFrame = () => {}; try { performance.now = () => t; } catch (e) {} window.__banco = { passo(n) { for (let i = 0; i < (n | 0); i++) { const c = coda; coda = []; t += PASSO; for (const f of c) { try { f(t); } catch (e) {} } } return t; } }; };

const M = `async (cfg) => {
  const t = window.__test, B = window.__banco;
  try { t.dismissSplash && t.dismissSplash(); } catch(e){}
  B.passo(4); await document.fonts.ready; t.semina(1);
  { let fermi=0; for (let g=0; g<20 && fermi<2; g++){ const a=t.sorteggi; await new Promise(r=>setTimeout(r,300)); fermi=(t.sorteggi===a)?fermi+1:0; } }
  t.semina(cfg.seme); t.setCpuVsCpu(true); t.posaHUD(true);
  t.startMatch(1,1,{size:cfg.taglia});
  for (let i=0;i<900;i++){ B.passo(1); if (t.state==='play') break; }
  const RIG_H=34,P_DIS=1.18,RIG_PIEDI=10;
  let trovato=-1, dett=null;
  for (let pas=0; pas<cfg.passi; pas++){
    if (pas%240===0) await new Promise(r=>setTimeout(r,0));
    B.passo(1);
    if (cfg.passoFisso){ if (pas!==cfg.passoFisso) continue; trovato=pas; dett={forzato:true}; break; }
    if (t.state!=='play') continue;
    const dd=(t.comandiTouch||[]).filter(q=>q.tipo==='pulsante');
    if (!dd.some(d=>d.label==='FILTRANTE')) continue;
    const vuoti=dd.filter(d=>d.dentro!==undefined && d.dentro<0.15);
    if (!vuoti.length) continue;
    const v=t.view, S2=v.S2, H=RIG_H*P_DIS*S2, w=16*S2;
    let quanti=0;
    for (const p of G.players){ if(p.out>0) continue;
      const cx=p.x*S2+v.Ax, py=(p.y+RIG_PIEDI)*S2+v.Ay;
      for (const d of vuoti){ const dx=Math.max(cx-w-d.x,0,d.x-(cx+w)), dy=Math.max(py-H-d.y,0,d.y-py);
        if (Math.hypot(dx,dy)<d.r){ quanti++; break; } } }
    if (quanti>=1){ trovato=pas; dett={etichette:dd.map(d=>d.label+'/'+d.dentro), uominiSotto:quanti}; break; }
  }
  return JSON.stringify({ trovato, dett, png: document.getElementById('gioco').toDataURL('image/png'),
    dischi:(t.comandiTouch||[]).filter(q=>q.tipo==='pulsante').map(q=>({l:q.label,x:+q.x.toFixed(0),y:+q.y.toFixed(0),r:q.r,a:q.alpha,d:q.dentro})) });
}`;

(async () => {
  const srv = await servi(); const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'it-IT' });
  await ctx.addInitScript(BANCO);
  const pag = await ctx.newPage();
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html?t=${Date.now()}`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  const o = JSON.parse(await pag.evaluate(`(${M})(${JSON.stringify({ seme: 20260828, taglia: 11, passi: 3600, passoFisso: PASSO_FISSO })})`));
  const f = path.join(RADICE, 'fuori', '_crit8-caccia-' + TAG + '.png');
  fs.writeFileSync(f, Buffer.from(o.png.split(',')[1], 'base64'));
  console.log('passo ' + o.trovato + '  ' + JSON.stringify(o.dett));
  console.log('dischi ' + JSON.stringify(o.dischi));
  console.log(f);
  await br.close(); srv.chiudi();
})();
