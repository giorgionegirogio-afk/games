/* _crit8-foto.js — foto e misure in orizzontale, in verticale e sulle tre
   taglie: i dischi, l'avviso dell'inferiorita', il riquadro contro il radar.
   uso: node strumenti/_crit8-foto.js --gioco fuori/comandi.html --tag c */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'CALCETTO-il-gioco.html')));
const TAG = arg('tag', 'c');
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
  B.passo(cfg.passi||600);
  // espulsioni forzate: due della mia squadra, una dell'avversario
  let n=0; for (const p of G.players){ if(p.team===0 && p.role!=='GK' && !(p.out>0) && n<2){ p.out= n?4.2:11.7; n++; } }
  for (const p of G.players){ if(p.team===1 && p.role!=='GK' && !(p.out>0)){ p.out=8.3; break; } }
  // il possesso alla squadra 0, cosi' i dischi dicono i verbi offensivi
  if (cfg.possesso){ try{ const p=G.players.find(q=>q.team===0 && q.role!=='GK' && !(q.out>0));
      if(p){ G.ball.x=p.x+6; G.ball.y=p.y+4; G.ball.z=0; G.ball.vx=0; G.ball.vy=0; G.ball.owner=p; G.ctrl0=p.idx; } }catch(e){} }
  B.passo(3);
  const out = { vw:innerWidth, vh:innerHeight, taglia:cfg.taglia, scena:t.state,
    avvisi: t.avvisi, mini: (typeof MINI_RECT!=='undefined'&&MINI_RECT)?{x0:+MINI_RECT.x0.toFixed(1),y0:+MINI_RECT.y0.toFixed(1)}:null,
    dischi: (t.comandiTouch||[]).filter(q=>q.tipo==='pulsante').map(q=>({label:q.label,x:+q.x.toFixed(0),y:+q.y.toFixed(0),r:q.r,alpha:q.alpha,dentro:q.dentro})) };
  // il riquadro dell'avviso finisce sotto il radar?
  out.sottoRadar = out.mini ? (out.avvisi||[]).filter(a=>a.x1>out.mini.x0 && a.y1>out.mini.y0).length : null;
  // la larghezza col RIPIEGO di sistema (il carattere del primo secondo)
  { const c=document.createElement('canvas').getContext('2d');
    const rip='"Arial Narrow","Segoe UI",sans-serif';
    const prove=['UN UOMO IN MENO PER 12"','2 UOMINI IN MENO PER 120"','UN UOMO IN PIÙ PER 120"'];
    out.ripiego = prove.map(s=>{ c.font='700 11px '+rip; const w=c.measureText(s).width;
      c.font='700 11px '+FONT_C; const v=c.measureText(s).width;
      return {s, ripiego:+w.toFixed(1), vero:+v.toFixed(1), bwRipiego:Math.max(126,Math.ceil(w)+16)}; }); }
  out.png = document.getElementById('gioco').toDataURL('image/png');
  return JSON.stringify(out);
}`;

(async () => {
  const srv = await servi(); const br = await chromium.launch();
  const casi = [
    { nome: 'oriz-11', vw: 915, vh: 412, taglia: 11 },
    { nome: 'oriz-11-poss', vw: 915, vh: 412, taglia: 11, possesso: 1 },
    { nome: 'oriz-5', vw: 915, vh: 412, taglia: 5 },
    { nome: 'oriz-7', vw: 915, vh: 412, taglia: 7 },
    { nome: 'vert-11', vw: 412, vh: 915, taglia: 11 },
    { nome: 'stretto-11', vw: 640, vh: 360, taglia: 11 },
  ];
  for (const c of casi) {
    const ctx = await br.newContext({ viewport: { width: c.vw, height: c.vh }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'it-IT' });
    await ctx.addInitScript(BANCO);
    const pag = await ctx.newPage();
    const err = []; pag.on('pageerror', e => err.push(e.message));
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html?t=${Date.now()}`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    const o = JSON.parse(await pag.evaluate(`(${M})(${JSON.stringify({ seme: 20260828, taglia: c.taglia, passi: 900, possesso: c.possesso||0 })})`));
    fs.writeFileSync(path.join(RADICE, 'fuori', '_crit8-' + TAG + '-' + c.nome + '.png'), Buffer.from(o.png.split(',')[1], 'base64'));
    console.log('--- ' + c.nome + ' (' + o.vw + 'x' + o.vh + ', taglia ' + o.taglia + ', scena ' + o.scena + ') errori ' + err.length);
    console.log('    dischi   ' + o.dischi.map(d => d.label + '@' + d.x + ',' + d.y + ' r' + d.r + ' a' + d.alpha + ' d' + d.dentro).join(' | '));
    console.log('    radar    ' + JSON.stringify(o.mini) + '   avvisi sotto il radar: ' + o.sottoRadar);
    for (const a of (o.avvisi || [])) console.log('    avviso   «' + a.testo + '»  largo ' + a.largo + ' in ' + (a.x1 - a.x0) + '  box ' + a.x0 + ',' + a.y0 + '..' + a.x1 + ',' + a.y1);
    if (c.nome === 'oriz-11') for (const r of o.ripiego) console.log('    ripiego  «' + r.s + '» vero ' + r.vero + ' · ripiego ' + r.ripiego + ' -> bw ' + r.bwRipiego);
    if (err.length) console.log('    ERRORI: ' + err.slice(0, 2).join(' / '));
    await ctx.close();
  }
  await br.close(); srv.chiudi();
})();
