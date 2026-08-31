/* _crit8-sonda.js — sonde varie sui comandi: etichette, avvisi, buchi.
   uso: node strumenti/_crit8-sonda.js --gioco fuori/comandi.html [--vw 845 --vh 402] */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'CALCETTO-il-gioco.html')));
const VW = +arg('vw', 845), VH = +arg('vh', 402);
const TAGLIA = +arg('taglia', 11);
const ridirigi = f => /CALCETTO-il-gioco\.html$/i.test(f) ? GIOCO : f;
function servi() { return new Promise(ok => { const s = http.createServer((rq, rs) => { const u = decodeURIComponent(rq.url.split('?')[0]); const f = ridirigi(path.join(RADICE, u === '/' ? 'index.html' : u)); fs.readFile(f, (e, d) => { if (e) { rs.writeHead(404); rs.end('no'); return; } rs.writeHead(200, { 'Content-Type': (f.endsWith('.html') ? 'text/html' : 'text/javascript') + '; charset=utf-8', 'Cache-Control': 'no-store' }); rs.end(d); }); }); s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() })); }); }
const BANCO = () => { const PASSO = 1000 / 60; let t = 0, coda = [], muto = false; window.requestAnimationFrame = cb => { if (muto) return 0; coda.push(cb); return coda.length; }; window.cancelAnimationFrame = () => {}; try { performance.now = () => t; } catch (e) {} window.__banco = { get tempo() { return t; }, passo(n) { n = Math.max(0, Math.round(+n || 0)); for (let i = 0; i < n; i++) { const c = coda; coda = []; t += PASSO; for (const f of c) { try { f(t); } catch (e) {} } } return t; }, zitto() { muto = true; coda.length = 0; } }; };

const SONDA = `async (cfg) => {
  const t = window.__test, B = window.__banco;
  try { t.dismissSplash && t.dismissSplash(); } catch(e){}
  B.passo(4);
  await document.fonts.ready;
  t.semina(1);
  { let fermi=0; for (let g=0; g<20 && fermi<2; g++){ const a=t.sorteggi; await new Promise(r=>setTimeout(r,300)); fermi=(t.sorteggi===a)?fermi+1:0; } }
  t.semina(cfg.seme); t.setCpuVsCpu(true); t.posaHUD(true);
  t.startMatch(1,1,{size:cfg.taglia});
  for (let i=0;i<900;i++){ B.passo(1); if (t.state==='play') break; }
  B.passo(120);
  const R = {};
  R.fontC = (typeof FONT_C!=='undefined') ? FONT_C : '(non globale)';

  /* --- 1. le otto etichette, larghezza vera e stringimento --- */
  const c = document.createElement('canvas').getContext('2d');
  const dischi = [
    ['TIRA',40],['CONTRASTA',40],['FILTRANTE',30],['CAMBIO',30],
    ['PASSA',26],['PRESSA',26],['CROSS',26],['SCIVOLATA',26]];
  R.etichette = dischi.map(([lab,r])=>{
    const avail=r*2-14;
    c.font='800 15px '+R.fontC; let w15=c.measureText(lab).width, fs=15;
    if(w15>avail){ fs=11; c.font='800 11px '+R.fontC; }
    const w=c.measureText(lab).width;
    const kx=Math.max(0.62, Math.min(1, avail/Math.max(1,w)));
    return {lab, r, avail, w15:+w15.toFixed(1), corpo:fs, largo:+w.toFixed(1),
            kx:+kx.toFixed(3), sbordaSuKx: +(w*kx).toFixed(1)};
  });

  /* --- 2. i quattro dischi dichiarati adesso --- */
  R.comandi = (t.comandiTouch||[]).filter(q=>q.tipo==='pulsante').map(q=>({
    act:q.act, label:q.label, x:+q.x.toFixed(1), y:+q.y.toFixed(1), r:q.r,
    alpha:q.alpha, dentro:q.dentro, rInt:q.rInt,
    lab:q.lab?{w:+(q.lab.x1-q.lab.x0).toFixed(1), h:+(q.lab.y1-q.lab.y0).toFixed(1)}:null }));
  R.zone = (t.zoneInterfaccia()||[]).filter(q=>q.tipo==='pulsante').map(q=>({
    alfa:q.alfa, rVuoto:q.rVuoto===undefined?null:q.rVuoto, haLab:!!q.lab }));

  /* --- 3. copertura: firma vecchia e nuova --- */
  const c0=t.copertura(), c1=t.copertura({uomini:true});
  R.copVecchia = c0.length; R.copNuova = c1.length;
  R.copVecchiaSoggetti = [...new Set(c0.map(x=>x.soggetto))];
  R.copNuovaSoggetti = [...new Set(c1.map(x=>x.soggetto))];
  R.copVecchiaHaSquadra = c0.length? ('squadra' in c0[0]) : null;

  /* --- 4. l'avviso di inferiorita': si forza un'espulsione --- */
  R.avvisiPrima = t.avvisi;
  const espelli=(team,sec)=>{ for(const p of G.players){ if(p.team===team && !(p.out>0) && p.role!=='GK'){ p.out=sec; return p.idx; } } return -1; };
  const casi=[];
  // caso A: un uomo della squadra 0 fuori per 12 s
  espelli(0,12.0); B.passo(2); casi.push({caso:'uno mio', avvisi:t.avvisi});
  // caso B: due della squadra 0, a 12 e a 3
  espelli(0,3.0); B.passo(2); casi.push({caso:'due miei 12 e 3', avvisi:t.avvisi});
  // caso C: anche uno dell'avversario
  espelli(1,7.0); B.passo(2); casi.push({caso:'+ uno loro', avvisi:t.avvisi});
  R.casi=casi;

  /* --- 5. il riquadro dell'avviso: il testo ci sta? --- */
  { c.font='700 11px '+R.fontC;
    const prove=['UN UOMO IN MENO PER 12"','UN UOMO IN PIÙ PER 12"','2 UOMINI IN MENO PER 12"',
                 '10 UOMINI IN PIÙ PER 120"'];
    R.larghezze = prove.map(s=>({s, w:+c.measureText(s).width.toFixed(1),
                                  bw:Math.max(126, Math.ceil(c.measureText(s).width)+16)})); }

  /* --- 6. il glifo Ù viene dal carattere del gioco? --- */
  { const rip='"Arial Narrow","Segoe UI",sans-serif';
    const mis=(f,s)=>{ c.font='700 100px '+f; return +c.measureText(s).width.toFixed(2); };
    R.glifi = { U_gioco:mis(R.fontC,'Ù'), U_ripiego:mis(rip,'Ù'),
                A_gioco:mis(R.fontC,'À'), A_ripiego:mis(rip,'À'),
                X_gioco:mis(R.fontC,'X'), X_ripiego:mis(rip,'X') }; }

  return JSON.stringify(R);
}`;

(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'it-IT' });
  await ctx.addInitScript(BANCO);
  const pag = await ctx.newPage();
  const err = []; pag.on('pageerror', e => err.push(e.message));
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html?t=${Date.now()}`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  const out = JSON.parse(await pag.evaluate(`(${SONDA})(${JSON.stringify({ seme: 20260828, taglia: TAGLIA })})`));
  console.log(JSON.stringify(out, null, 1));
  if (err.length) console.log('ERRORI DI PAGINA: ' + err.length + '\n  ' + err.slice(0,3).join('\n  '));
  await br.close(); srv.chiudi();
})();
