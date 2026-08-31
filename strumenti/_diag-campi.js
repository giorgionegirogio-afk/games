/* _diag-campi.js — quale campo dello stato differisce fra la prima
   partita e la seconda, al passo prima della divergenza.
   uso: node strumenti/_diag-campi.js --gioco fuori/reg.html --passo 86 */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i+1] && !process.argv[i+1].startsWith('--') ? process.argv[i+1] : d; };
const provaRel = arg('gioco', ''), SEME = 20260803, FINO = parseInt(arg('passo', '86'), 10);

function servi(prova) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (prova && /CALCETTO-il-gioco\.html$/i.test(f)) f = prova;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
const COP = `(function(passi){
  const t=window.__test;
  const d=t.pulsanti(0), grande=d[0]||{x:800,y:330}, piccolo=d[1]||{x:720,y:250};
  const LX=180, LY=300; let idL=1, idB=2, giu=false, giuB=false;
  for(let f=0;f<passi;f++){
    const a=f*0.037, rr=34+22*Math.sin(f*0.011);
    const x=LX+Math.cos(a)*rr, y=LY+Math.sin(a)*rr;
    if(!giu){ Touch5.start(idL,LX,LY); giu=true; } else Touch5.move(idL,x,y);
    if(f%97===96){ Touch5.chiudi(idL,false); giu=false; idL+=2; }
    if(f%71===0&&!giuB){ Touch5.start(idB,grande.x,grande.y); giuB=true; }
    else if(giuB&&f%71===18){ Touch5.move(idB,grande.x-26,grande.y-14); }
    else if(giuB&&f%71===26){ Touch5.chiudi(idB,false); giuB=false; idB+=2; }
    if(f%53===11){ const j=900+f; Touch5.start(j,piccolo.x,piccolo.y); Touch5.chiudi(j,false); }
    t.simulate(1/60);
  }
})`;
/* la fotografia dello stato: ogni campo scalare di ogni giocatore, del
   pallone e di G. Niente funzioni, niente oggetti annidati profondi: si
   cerca un campo che differisce, non si serializza il mondo. */
const FOTO = `(function(){
  const o = {};
  const piatto = (pre, v) => {
    for(const k in v){
      const x = v[k];
      const tipo = typeof x;
      if(tipo === 'number') o[pre+k] = Math.round(x*1e6)/1e6;
      else if(tipo === 'boolean' || tipo === 'string') o[pre+k] = x;
    }
  };
  for(let i=0;i<G.players.length;i++) piatto('p'+i+'.', G.players[i]);
  piatto('ball.', G.ball);
  piatto('G.', G);
  for(let t=0;t<2;t++) piatto('stick'+t+'.', Touch5.stick[t]);
  return o;
})`;

(async () => {
  const srv = await servi(provaRel ? path.resolve(RADICE, provaRel) : '');
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport:{width:915,height:412}, isMobile:true, hasTouch:true, locale:'it-IT' });
  const pag = await ctx.newPage();
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, {waitUntil:'load'});
  await pag.waitForFunction('window.__test !== undefined', null, {timeout:20000});
  await pag.evaluate(()=>{ window.requestAnimationFrame=()=>0; });
  await pag.waitForTimeout(250);
  await pag.evaluate(()=>{ const t=window.__test; t.dismissSplash&&t.dismissSplash(); if(t.save) t.save.tutorialDone=1;
    window.__save0=JSON.parse(JSON.stringify(t.save)); });

  const gira = (passi, registra) => pag.evaluate(([seme, passi, COP, FOTO, registra]) => {
    const t = window.__test;
    for(const k of Object.keys(t.save)) if(!(k in window.__save0)) delete t.save[k];
    for(const k in window.__save0) t.save[k] = JSON.parse(JSON.stringify(window.__save0[k]));
    t.fermaRegistro(); Reg.azzeraComandi();
    t.semina(seme);
    if(registra) t.registra();
    t.startMatch(1,1);
    const dopoStart = (new Function('return ('+FOTO+')'))()();
    (new Function('return ('+COP+')'))()(passi);
    const r = { dopoStart, fine: (new Function('return ('+FOTO+')'))()(), sorteggi: t.sorteggi };
    t.fermaRegistro();
    return r;
  }, [SEME, passi, COP, FOTO, registra]);

  const diff = (a, b) => {
    const out = [];
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)]))
      if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) out.push(k + ': ' + JSON.stringify(a[k]) + ' -> ' + JSON.stringify(b[k]));
    return out;
  };

  const g1 = await gira(FINO, false);
  await gira(FINO, true);   /* il giro ACCESO in mezzo, come nella prova E */
  const g2 = await gira(FINO, false);

  console.log('=== CHE COSA DIFFERISCE FRA LA PRIMA PARTITA E LA SECONDA ===\n');
  const dS = diff(g1.dopoStart, g2.dopoStart);
  console.log('SUBITO DOPO startMatch, prima di qualunque passo:');
  console.log(dS.length ? '  ' + dS.slice(0, 25).join('\n  ') + (dS.length > 25 ? '\n  ... e altri ' + (dS.length-25) : '')
                        : '  nessuna differenza — lo stato di partenza e\' identico');
  const dF = diff(g1.fine, g2.fine);
  console.log('\nDOPO ' + FINO + ' PASSI  (sorteggi ' + g1.sorteggi + ' contro ' + g2.sorteggi + '):');
  console.log(dF.length ? '  ' + dF.slice(0, 30).join('\n  ') + (dF.length > 30 ? '\n  ... e altri ' + (dF.length-30) : '')
                        : '  nessuna differenza');
  await browser.close(); srv.chiudi();
})().catch(e => { console.error('FALLITO: ' + e.message); process.exit(2); });
