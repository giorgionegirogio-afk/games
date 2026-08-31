/* _diag-replay.js — perche' due esecuzioni con le dita divergono.
   Non e' un cancello: e' un'autopsia. Prova le ipotesi una per una.
   uso: node strumenti/_diag-replay.js --gioco fuori/reg.html            */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i+1] && !process.argv[i+1].startsWith('--') ? process.argv[i+1] : d; };
const provaRel = arg('gioco', '');
const SEME = 20260803, PASSI = 600;

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
const IMPRONTA = `(() => { const b=G.ball;
  let s=[Math.round(b.x*100),Math.round(b.y*100),Math.round(b.vx*100),Math.round(b.vy*100),b.owner,G.score[0],G.score[1]];
  for(const p of G.players) s.push(Math.round(p.x*100),Math.round(p.y*100));
  return s.join(','); })()`;
const COP = `(function(passi, IMPR, ogni){
  const t=window.__test, impronte=[], leggi=new Function('return '+IMPR);
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
    if(f%ogni===0) impronte.push(leggi());
  }
  if(giu) Touch5.chiudi(idL,false); if(giuB) Touch5.chiudi(idB,false);
  return impronte; })`;
const scarto = (a,b)=>{ const n=Math.min(a.length,b.length); for(let i=0;i<n;i++) if(a[i]!==b[i]) return i; return a.length===b.length?-1:n; };

async function apri(browser, porta) {
  const ctx = await browser.newContext({ viewport:{width:915,height:412}, isMobile:true, hasTouch:true, locale:'it-IT' });
  const pag = await ctx.newPage();
  const err=[]; pag.on('pageerror', e=>err.push(e.message));
  await pag.goto(`http://127.0.0.1:${porta}/CALCETTO-il-gioco.html`, { waitUntil:'load' });
  await pag.waitForFunction('window.__test !== undefined', null, {timeout:20000});
  await pag.evaluate(()=>{ window.requestAnimationFrame=()=>0; });
  await pag.waitForTimeout(250);
  await pag.evaluate(()=>{ const t=window.__test; t.dismissSplash&&t.dismissSplash(); if(t.save) t.save.tutorialDone=1; });
  return { ctx, pag, err };
}
const giocaSpento = (pag, seme) => pag.evaluate(([seme,passi,IMPR,COP])=>{
  const t=window.__test; t.fermaRegistro(); t.semina(seme); t.startMatch(1,1);
  return (new Function('return ('+COP+')'))()(passi, IMPR, 10);
}, [seme, PASSI, IMPRONTA, COP]);

(async () => {
  const srv = await servi(provaRel ? path.resolve(RADICE, provaRel) : '');
  const browser = await chromium.launch();
  const A = await apri(browser, srv.porta), B = await apri(browser, srv.porta);

  console.log('=== PERCHE\' DUE ESECUZIONI CON LE DITA DIVERGONO ===\n');

  /* ipotesi 1: i dischi non stanno nello stesso posto sulle due pagine */
  const pA = await A.pag.evaluate(()=>JSON.stringify(window.__test.pulsanti(0)));
  const pB = await B.pag.evaluate(()=>JSON.stringify(window.__test.pulsanti(0)));
  console.log('1) i dischi sono nello stesso posto sulle due pagine?  ' + (pA===pB ? 'SI' : 'NO'));
  if (pA!==pB) { console.log('   A: '+pA.slice(0,180)); console.log('   B: '+pB.slice(0,180)); }

  /* ipotesi 2: la STESSA pagina, due volte di fila, col registro spento */
  const a1 = await giocaSpento(A.pag, SEME);
  const a2 = await giocaSpento(A.pag, SEME);
  const k2 = scarto(a1,a2);
  console.log('2) la stessa pagina, due volte, registro spento:       ' +
              (k2<0 ? 'IDENTICHE' : 'divergono al campione '+k2+' (passo '+(k2*10)+')'));

  /* ipotesi 3: due pagine diverse, registro spento */
  const b1 = await giocaSpento(B.pag, SEME);
  const k3 = scarto(a1,b1);
  console.log('3) due pagine diverse, registro spento:                ' +
              (k3<0 ? 'IDENTICHE' : 'divergono al campione '+k3+' (passo '+(k3*10)+')'));

  /* ipotesi 4: la stessa pagina, registro ACCESO contro SPENTO */
  const a3 = await A.pag.evaluate(([seme,passi,IMPR,COP])=>{
    const t=window.__test; t.semina(seme); t.registra(); t.startMatch(1,1);
    const r=(new Function('return ('+COP+')'))()(passi, IMPR, 10);
    t.fermaRegistro(); return r;
  }, [SEME, PASSI, IMPRONTA, COP]);
  const k4 = scarto(a1,a3);
  console.log('4) stessa pagina, registro acceso contro spento:       ' +
              (k4<0 ? 'IDENTICHE' : 'divergono al campione '+k4+' (passo '+(k4*10)+')'));

  /* ipotesi 5: il salvataggio cambia fra una partita e l'altra */
  const sA = await A.pag.evaluate(()=>{ const s=window.__test.save; return JSON.stringify({coins:s.coins, rosa:(s.rosa||[]).length, durata:s.durata, tut:s.tutorialVisto}); });
  const sB = await B.pag.evaluate(()=>{ const s=window.__test.save; return JSON.stringify({coins:s.coins, rosa:(s.rosa||[]).length, durata:s.durata, tut:s.tutorialVisto}); });
  console.log('5) il salvataggio e\' lo stesso sulle due pagine?       ' + (sA===sB ? 'SI' : 'NO'));
  if (sA!==sB) { console.log('   A: '+sA); console.log('   B: '+sB); }

  /* ipotesi 6: quanti sorteggi consuma ciascuna esecuzione */
  const nA = await A.pag.evaluate(([seme,passi,IMPR,COP])=>{
    const t=window.__test; t.fermaRegistro(); t.semina(seme); t.startMatch(1,1);
    (new Function('return ('+COP+')'))()(passi, IMPR, 10); return t.sorteggi;
  }, [SEME, PASSI, IMPRONTA, COP]);
  const nB = await B.pag.evaluate(([seme,passi,IMPR,COP])=>{
    const t=window.__test; t.fermaRegistro(); t.semina(seme); t.startMatch(1,1);
    (new Function('return ('+COP+')'))()(passi, IMPR, 10); return t.sorteggi;
  }, [SEME, PASSI, IMPRONTA, COP]);
  console.log('6) sorteggi consumati:  A ' + nA + '   B ' + nB + '   ' + (nA===nB?'(pari)':'(DIVERSI)'));

  /* ipotesi 7: SENZA dita, stessa pagina — e' il caso gia' provato da
     _q-determinismo, e serve come pietra di paragone: se anche questo
     divergesse, il problema non sono le dita. */
  const senzaDita = pag => pag.evaluate(([seme,passi,IMPR])=>{
    const t=window.__test; t.fermaRegistro(); t.semina(seme); t.startMatch(1,1); t.setCpuVsCpu(true);
    const leggi=new Function('return '+IMPR); const imp=[];
    for(let f=0;f<passi;f++){ t.simulate(1/60); if(f%10===0) imp.push(leggi()); }
    return imp;
  }, [SEME, PASSI, IMPRONTA]);
  const s1 = await A.pag.evaluate(()=>0).then(()=>senzaDita(A.pag));
  const s2 = await senzaDita(B.pag);
  const k7 = scarto(s1,s2);
  console.log('7) SENZA dita, due pagine (pietra di paragone):        ' +
              (k7<0 ? 'IDENTICHE' : 'divergono al campione '+k7));

  /* ipotesi 8: che cosa sopravvive fra una partita e l'altra */
  const foto = pag => pag.evaluate(() => ({
    stick: JSON.stringify(Touch5.stick),
    pend: Object.keys(Touch5.pend).length,
    btn: Object.keys(Touch5.btnTouch).length,
    atti: Object.keys(Touch5.atti||{}).length,
    inviti: typeof Inviti!=='undefined' ? JSON.stringify(Inviti).slice(0,300) : '(non c\'e\')',
    tut: typeof Tut!=='undefined' ? JSON.stringify({a:Tut.active, i:Tut.i, passo:Tut.passo}).slice(0,200) : '(non c\'e\')',
    save: JSON.stringify(window.__test.save).length,
  }));
  const C = await apri(browser, srv.porta);
  const f0 = await foto(C.pag);
  await giocaSpento(C.pag, SEME);
  const f1 = await foto(C.pag);
  console.log('\n8) CHE COSA SOPRAVVIVE ALLA PRIMA PARTITA');
  for (const k of Object.keys(f0)) {
    const uguale = JSON.stringify(f0[k]) === JSON.stringify(f1[k]);
    console.log('   ' + (uguale ? '=  ' : 'DIVERSO  ') + k.padEnd(8) +
                (uguale ? '' : '\n        prima: ' + String(f0[k]).slice(0,220) +
                          '\n        dopo:  ' + String(f1[k]).slice(0,220)));
  }

  /* ipotesi 9: azzerando i comandi prima di ogni esecuzione, tornano uguali? */
  const conAzzera = (pag, seme) => pag.evaluate(([seme,passi,IMPR,COP])=>{
    const t=window.__test; t.fermaRegistro();
    Touch5.azzera(); Touch5.pend={}; Touch5.btnTouch={}; if(Touch5.atti) Touch5.atti={};
    t.semina(seme); t.startMatch(1,1);
    return (new Function('return ('+COP+')'))()(passi, IMPR, 10);
  }, [seme, PASSI, IMPRONTA, COP]);
  const z1 = await conAzzera(C.pag, SEME), z2 = await conAzzera(C.pag, SEME);
  const k9 = scarto(z1,z2);
  console.log('\n9) azzerando i comandi prima di ogni partita:          ' +
              (k9<0 ? 'IDENTICHE' : 'divergono al campione '+k9+' (passo '+(k9*10)+')'));

  if (A.err.length || B.err.length) console.log('\nECCEZIONI: ' + [...A.err,...B.err].slice(0,3).join(' | '));
  await browser.close(); srv.chiudi();
})().catch(e => { console.error('FALLITO: ' + e.message); process.exit(2); });
