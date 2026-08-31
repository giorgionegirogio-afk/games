/* _diag-replay2.js — la differenza fra registro acceso e spento, isolata.
   Stessa pagina, stessa partenza, stesso seme: cambia SOLO il registro.
   uso: node strumenti/_diag-replay2.js --gioco fuori/reg.html */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i+1] && !process.argv[i+1].startsWith('--') ? process.argv[i+1] : d; };
const provaRel = arg('gioco', ''), SEME = 20260803, PASSI = 400;

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
const IMPR = `(() => { const b=G.ball;
  let s=[Math.round(b.x*100),Math.round(b.y*100),Math.round(b.vx*100),Math.round(b.vy*100),b.owner];
  for(const p of G.players) s.push(Math.round(p.x*100),Math.round(p.y*100));
  return s.join(','); })()`;
const COP = `(function(passi, IMPR, ogni){
  const t=window.__test, imp=[], leggi=new Function('return '+IMPR);
  const d=t.pulsanti(0), grande=d[0]||{x:800,y:330}, piccolo=d[1]||{x:720,y:250};
  const LX=180, LY=300; let idL=1, idB=2, giu=false, giuB=false;
  const traccia=[];
  for(let f=0;f<passi;f++){
    const a=f*0.037, rr=34+22*Math.sin(f*0.011);
    const x=LX+Math.cos(a)*rr, y=LY+Math.sin(a)*rr;
    if(!giu){ Touch5.start(idL,LX,LY); giu=true; } else Touch5.move(idL,x,y);
    if(f%97===96){ Touch5.chiudi(idL,false); giu=false; idL+=2; }
    if(f%71===0&&!giuB){ Touch5.start(idB,grande.x,grande.y); giuB=true; }
    else if(giuB&&f%71===18){ Touch5.move(idB,grande.x-26,grande.y-14); }
    else if(giuB&&f%71===26){ Touch5.chiudi(idB,false); giuB=false; idB+=2; }
    if(f%53===11){ const j=900+f; Touch5.start(j,piccolo.x,piccolo.y); Touch5.chiudi(j,false); }
    /* la traccia dice lo stato della LEVETTA a ogni passo: se diverge qui,
       la differenza sta nei comandi; se diverge solo nell'impronta, sta
       nella simulazione */
    const s0=Touch5.stick[0];
    traccia.push(f+':'+(s0.active?1:0)+','+Math.round(s0.dx)+','+Math.round(s0.dy)+
                 ',c'+(t.registroModo||0));
    t.simulate(1/60);
    if(f%ogni===0) imp.push(leggi());
  }
  if(giu) Touch5.chiudi(idL,false); if(giuB) Touch5.chiudi(idB,false);
  return {imp, traccia}; })`;
const scarto = (a,b)=>{ const n=Math.min(a.length,b.length); for(let i=0;i<n;i++) if(a[i]!==b[i]) return i; return a.length===b.length?-1:n; };

(async () => {
  const srv = await servi(provaRel ? path.resolve(RADICE, provaRel) : '');
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport:{width:915,height:412}, isMobile:true, hasTouch:true, locale:'it-IT' });
  const pag = await ctx.newPage();
  const err=[]; pag.on('pageerror', e=>err.push(e.message));
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, {waitUntil:'load'});
  await pag.waitForFunction('window.__test !== undefined', null, {timeout:20000});
  await pag.evaluate(()=>{ window.requestAnimationFrame=()=>0; });
  await pag.waitForTimeout(250);
  await pag.evaluate(()=>{ const t=window.__test; t.dismissSplash&&t.dismissSplash(); if(t.save) t.save.tutorialDone=1;
    window.__save0=JSON.parse(JSON.stringify(t.save));
    window.__cam0=JSON.parse(JSON.stringify(G.cam)); });

  const gira = (registra) => pag.evaluate(([seme,passi,IMPR,COP,registra])=>{
    const t=window.__test;
    for(const k of Object.keys(t.save)) if(!(k in window.__save0)) delete t.save[k];
    for(const k in window.__save0) t.save[k]=JSON.parse(JSON.stringify(window.__save0[k]));
    t.fermaRegistro(); Reg.azzeraComandi();
    /* IL SEME DOPO LA COSTRUZIONE: startMatch la prima volta costruisce
       cose che poi restano in cache (229 sorteggi in piu'). Se il seme si
       posa DOPO, il generatore parte dallo stesso punto qualunque sia lo
       stato della cache. */
    t.semina(seme);
    const nSeme = t.sorteggi;
    if(registra) t.registra();
    const nReg = t.sorteggi;
    t.startMatch(1,1);
    const nStart = t.sorteggi;
    const r=(new Function('return ('+COP+')'))()(passi, IMPR, 5);
    t.fermaRegistro();
    return {imp:r.imp, traccia:r.traccia, sorteggi:t.sorteggi,
            fasi:{ seme:nSeme, reg:nReg, start:nStart, fine:t.sorteggi }};
  }, [SEME, PASSI, IMPR, COP, registra]);

  /* L'ORDINE E' LA PROVA. Se il primo giro fosse diverso dagli altri
     qualunque cosa si faccia, allora non e' il registro: e' qualcosa che
     si consuma alla prima partita e non torna. Sei esecuzioni, con
     l'ordine mescolato apposta. */
  console.log('=== REGISTRO ACCESO CONTRO SPENTO, TUTTO IL RESTO UGUALE ===\n');
  const g = [];
  const ordine = [false, false, true, true, false, true];
  for (const r of ordine) g.push(await gira(r));
  console.log('SEI ESECUZIONI, in ordine ' + ordine.map(r => r ? 'acceso' : 'spento').join(' · '));
  for (let i = 0; i < g.length; i++)
    console.log('  ' + (i+1) + ') ' + (ordine[i] ? 'acceso' : 'spento') +
                '   startMatch ' + String(g[i].fasi.start).padStart(4) +
                '   partita ' + String(g[i].fasi.fine - g[i].fasi.start).padStart(4) +
                '   uguale alla 1a? ' + (scarto(g[0].imp, g[i].imp) < 0 ? 'SI' : 'no, campione ' + scarto(g[0].imp, g[i].imp)) +
                '   uguale alla precedente? ' + (i ? (scarto(g[i-1].imp, g[i].imp) < 0 ? 'SI' : 'no') : '—'));

  const s1 = g[0], s2 = g[1], s3 = g[2];
  console.log('');
  console.log('spento contro spento (1 e 2):  ' + (scarto(s1.imp,s2.imp)<0 ? 'IDENTICHE' : 'divergono al campione '+scarto(s1.imp,s2.imp)));
  console.log('acceso contro acceso (3 e 4):  ' + (scarto(g[2].imp,g[3].imp)<0 ? 'IDENTICHE' : 'divergono al campione '+scarto(g[2].imp,g[3].imp)));
  console.log('spento 5 contro acceso 6:      ' + (scarto(g[4].imp,g[5].imp)<0 ? 'IDENTICHE' : 'divergono al campione '+scarto(g[4].imp,g[5].imp)));
  const k = scarto(s1.imp,s3.imp);

  const kt = scarto(s1.traccia, s3.traccia);
  console.log('\nLA LEVETTA (i comandi, passo per passo):');
  console.log('  ' + (kt<0 ? 'IDENTICA in tutti i ' + s1.traccia.length + ' passi — allora la differenza NON e\' nei comandi'
                            : 'diverge al passo ' + kt));
  if (kt >= 0) {
    for (let i = Math.max(0, kt-2); i < Math.min(s1.traccia.length, kt+3); i++)
      console.log('    passo ' + i + '   spento ' + s1.traccia[i] + '   acceso ' + s3.traccia[i]);
  }
  if (err.length) console.log('\nECCEZIONI: ' + err.slice(0,3).join(' | '));
  await browser.close(); srv.chiudi();
})().catch(e => { console.error('FALLITO: ' + e.message); process.exit(2); });
