/* _diag-chi-sorteggia.js — chi consuma i 229 sorteggi che ci sono solo
   alla prima partita. Avvolge dado() e chiede la pila delle chiamate.
   uso: node strumenti/_diag-chi-sorteggia.js --gioco fuori/reg.html */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i+1] && !process.argv[i+1].startsWith('--') ? process.argv[i+1] : d; };
const provaRel = arg('gioco', ''), SEME = 20260803, PASSI = 200;

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
  const t=window.__test; window.__tracce=[];
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
    window.__passo = f;
    const pr = t.sorteggi;
    t.simulate(1/60);
    window.__tracce.push(f+' '+G.scene+' p'+(G.paused?1:0)+' t'+Math.round(G.sceneT*1000)+
                         ' s'+(t.sorteggi-pr)+' b'+Math.round(G.ball.x*10)+','+Math.round(G.ball.y*10));
  }
  if(giu) Touch5.chiudi(idL,false); if(giuB) Touch5.chiudi(idB,false);
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
  await pag.evaluate(()=>{ const t=window.__test; t.dismissSplash&&t.dismissSplash(); if(t.save) t.save.tutorialDone=1; });

  /* la sonda: conta i sorteggi per PASSO e, quando un passo ne consuma
     tanti, ne conserva la pila delle chiamate */
  await pag.evaluate(() => {
    window.__conti = {};
    window.__pile = {};
    const vero = window.dado;
    window.__vero_dado = vero;
    /* dado e' una dichiarazione di funzione: si sostituisce sul globale,
       e le chiamate dal codice del gioco passano di qui perche' il gioco
       la risolve dallo scope globale */
    window.dado = function(){
      const p = window.__passo | 0;
      window.__conti[p] = (window.__conti[p] || 0) + 1;
      /* per i passi intorno alla divergenza si prende la pila di OGNI
         sorteggio: e' il solo modo di sapere chi ha chiesto il numero */
      if((p >= 80 && p <= 95) || window.__conti[p] === 12){
        const k = p + '/' + window.__conti[p];
        if(!window.__pile[k]) window.__pile[k] = (new Error()).stack.split('\n').slice(1, 6).join(' | ');
      }
      return vero();
    };
  });

  const gira = () => pag.evaluate(([seme, passi, COP]) => {
    const t = window.__test;
    window.__conti = {}; window.__pile = {};
    t.fermaRegistro(); Reg.azzeraComandi();
    t.semina(seme);
    t.startMatch(1,1);
    (new Function('return ('+COP+')'))()(passi);
    return { conti: window.__conti, pile: window.__pile, tracce: window.__tracce };
  }, [SEME, PASSI, COP]);

  const g1 = await gira();
  const g2 = await gira();

  console.log('=== CHI SORTEGGIA ALLA PRIMA PARTITA E NON ALLA SECONDA ===\n');
  const passi = [...new Set([...Object.keys(g1.conti), ...Object.keys(g2.conti)])].map(Number).sort((a,b)=>a-b);
  let tot1 = 0, tot2 = 0;
  const grossi = [];
  for (const p of passi) {
    const a = g1.conti[p] || 0, b = g2.conti[p] || 0;
    tot1 += a; tot2 += b;
    if (a !== b) grossi.push({ p, a, b, d: a - b });
  }
  console.log('totale prima partita: ' + tot1 + '   seconda: ' + tot2 + '   differenza: ' + (tot1 - tot2) + '\n');
  grossi.sort((x, y) => Math.abs(y.d) - Math.abs(x.d));
  console.log('I PASSI CHE DIFFERISCONO DI PIU\':');
  for (const q of grossi.slice(0, 8)) {
    console.log('  passo ' + String(q.p).padStart(4) + '   prima ' + String(q.a).padStart(4) +
                '   dopo ' + String(q.b).padStart(4) + '   differenza ' + (q.d > 0 ? '+' : '') + q.d);
    if (g1.pile[q.p]) console.log('      chi: ' + g1.pile[q.p].replace(/https?:\/\/[^\s)]+\//g, '').slice(0, 400));
  }
  console.log('\nLA TRACCIA, passo per passo (scena, pausa, cronometro di scena, sorteggi, pallone):');
  let primo = -1;
  for (let i = 0; i < Math.min(g1.tracce.length, g2.tracce.length); i++)
    if (g1.tracce[i] !== g2.tracce[i]) { primo = i; break; }
  if (primo < 0) console.log('  IDENTICHE in tutti i ' + g1.tracce.length + ' passi');
  else {
    console.log('  primo scarto al passo ' + primo);
    for (let i = Math.max(0, primo-3); i < Math.min(g1.tracce.length, primo+4); i++)
      console.log('    ' + (i===primo?'>>':'  ') + ' prima: ' + g1.tracce[i].padEnd(46) + '  dopo: ' + g2.tracce[i]);
  }
  console.log('\nCHI HA CHIESTO I NUMERI FRA IL PASSO 80 E IL 95:');
  const pulisci = t => String(t || '').replace(/at eval[^|]*\|?/g, '').replace(/\s+/g, ' ')
                        .replace(/CALCETTO-il-gioco\.html/g, 'gioco');
  const chiavi = [...new Set([...Object.keys(g1.pile), ...Object.keys(g2.pile)])]
    .filter(k => k.includes('/')).sort((a, b) => parseInt(a) - parseInt(b) || 0);
  for (const k of chiavi) {
    const a = pulisci(g1.pile[k]), b = pulisci(g2.pile[k]);
    console.log('  ' + k.padEnd(9) + (a === b ? 'stessa pila' : 'PILE DIVERSE'));
    console.log('     prima: ' + a.slice(0, 240));
    if (a !== b) console.log('     dopo:  ' + b.slice(0, 240));
  }
  await browser.close(); srv.chiudi();
})().catch(e => { console.error('FALLITO: ' + e.message); process.exit(2); });
