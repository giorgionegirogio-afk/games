/* caccia allo stato che sopravvive fra due partite sulla stessa pagina */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = 'C:/Users/Utenteee/Desktop/GitHub/games';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const provaRel = arg('gioco', '');
const SEME = +arg('seme', 20260803);

function servi(prova) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (prova && /CALCETTO-il-gioco\.html$/i.test(f)) f = prova;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

const SNAP = `(() => {
  const o={};
  const piatto=(pref,v,d)=>{
    if(d>3||v==null) return;
    if(typeof v==='number'){ o[pref]=Math.round(v*1e6)/1e6; return; }
    if(typeof v==='boolean'||typeof v==='string'){ o[pref]=v; return; }
    if(Array.isArray(v)){ if(v.length>40) { o[pref+'.len']=v.length; return; } v.forEach((x,i)=>piatto(pref+'['+i+']',x,d+1)); return; }
    if(typeof v==='object'){ for(const k of Object.keys(v)){ if(k==='c'||k==='ctx'||k==='canvas') continue; piatto(pref+'.'+k,v[k],d+1); } return; }
  };
  piatto('G',G,0);
  try{ piatto('SAVE',SAVE,0); }catch(e){}
  try{ piatto('Tut',{a:Tut.active,s:Tut.step}, 0); }catch(e){}
  return o;
})()`;

(async () => {
  const prova = provaRel ? path.resolve(RADICE, provaRel) : '';
  const srv = await servi(prova);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  pag.on('pageerror', e => console.error('ECC ' + e.message));
  await pag.addInitScript(s0 => {
    let s = s0 >>> 0 || 1;
    const pr = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => pr() / 4294967296;
    window.__caso = { semina(n) { s = n >>> 0 || 1; }, stato() { return s; } };
  }, SEME);
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined');
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  if (process.argv.indexOf('--senza-tutorial') > 0) {
    await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
  }

  const gioca = () => pag.evaluate(([seme, SNAP]) => {
    const t = window.__test;
    window.__caso.semina(seme);
    t.startMatch(1, 1);
    t.setCpuVsCpu(true);
    const leggi = new Function('return ' + SNAP);
    const snaps = [leggi()];
    const semi = [window.__caso.stato()];
    let sim = 0;
    while (t.state !== 'end' && sim < 600) { t.simulate(1); sim += 1; snaps.push(leggi()); semi.push(window.__caso.stato()); }
    return { snaps, semi };
  }, [SEME, SNAP]);

  const a = await gioca(), b = await gioca();
  const n = Math.min(a.snaps.length, b.snaps.length);
  const scarti = i => {
    const A = a.snaps[i], B = b.snaps[i], d = [];
    for (const k of new Set([...Object.keys(A), ...Object.keys(B)])) if (A[k] !== B[k]) d.push(k + ': ' + A[k] + ' | ' + B[k]);
    return d;
  };
  console.log('--- campione 0 (subito dopo startMatch): ' + scarti(0).length + ' campi diversi');
  console.log(scarti(0).join('\n'));
  /* e adesso il primo scarto che tocca DAVVERO il gioco: pallone o uomini */
  const gioco = k => /^G\.ball|^G\.players|^G\.score|^G\.timeLeft|^G\.possT|^G\.possOwner/.test(k);
  for (let i = 0; i < n; i++) {
    const d = scarti(i).filter(gioco);
    if (d.length) {
      console.log('\n--- PRIMO SCARTO DI GIOCO al campione ' + i + ' (seme rng ' + a.semi[i] + ' | ' + b.semi[i] + ')');
      console.log(d.slice(0, 12).join('\n'));
      console.log('  e i NON di gioco allo stesso campione: ' + scarti(i).filter(k => !gioco(k)).slice(0, 20).join(' ; '));
      break;
    }
    if (i === n - 1) console.log('\nnessuno scarto di gioco in ' + n + ' campioni');
  }
  await browser.close(); srv.chiudi();
})();
