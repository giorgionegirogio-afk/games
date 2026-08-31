/* =====================================================================
   _crit-slittamento.js — QUANTO SCIVOLA IL PORTIERE MENTRE LA POSA
   NUOVA E' IN SCENA.

   La toppa _t-mani-portiere.js sostituisce, per 0,34 s, una clip di
   LOCOMOZIONE (corsa/camminata, la cui fase avanza con lo SPAZIO
   percorso: i piedi si piantano) con una posa STATICA a piedi piantati
   (pugni/respinta/sfugge). Il commento della costante dichiara:
     «in 0,34 s percorre al massimo 51 unita' e i piedi della posa
      scivolano di meno di mezza figura».
   Qui si misura lo spostamento VERO del portiere durante la finestra in
   cui la clip nuova e' quella che rigStato restituisce.

   Unita' di riferimento: RIG_H*P_DIS = altezza apparente della figura.

   uso: node _crit-slittamento.js --gioco fuori/anim-seconda.html
                                  [--partite 40] [--sec 120] [--seme 20260803]
   ===================================================================== */
const path = require('path');
const RADICE = 'C:/Users/Utenteee/Desktop/GitHub/games';
const { servi, bancoDiProva, semeFisso } = require(RADICE + '/strumenti/_posa.js');

const arg = (n, d) => { const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i+1] && !process.argv[i+1].startsWith('--') ? process.argv[i+1] : d; };
const GIOCO = path.resolve(arg('gioco', RADICE + '/fuori/anim-seconda.html'));
const PARTITE = +arg('partite', 40);
const SEC = +arg('sec', 120);
const SEME = +arg('seme', 20260803);

const SONDA = String.raw`(() => {
  const R = { eventi: [], frames: 0, scala: 0 };
  let dentro = null;
  const vivi = [];

  const tp0 = window.tentaPresa;
  window.tentaPresa = function(p, b, d){
    dentro = { pi: G.players.indexOf(p),
               stato: p.dive > 0 ? 'TUFFO' : (p.recover > 0 ? 'TERRA' : 'IN PIEDI') };
    let r; try { r = tp0.apply(this, arguments); } finally { dentro = null; }
    return r;
  };
  const sb0 = window.showBanner;
  window.showBanner = function(txt){
    if (dentro && (txt==='PUGNI!' || txt==='SFUGGE!' || txt==='RESPINTA!')) {
      const p = G.players[dentro.pi];
      vivi.push({ e: txt.slice(0,-1), pi: dentro.pi, stato: dentro.stato,
                  x0: p.x, y0: p.y, px: p.x, py: p.y,
                  n: 0, cammino: 0, dmax: 0, clip: {}, dedicata: 0, f: 0 });
    }
    return sb0.apply(this, arguments);
  };

  window.__cs = {
    passo(){
      R.frames++;
      for (let i = vivi.length-1; i >= 0; i--) {
        const t = vivi[i], p = G.players[t.pi];
        const st = rigStato(p);
        const ded = (st.clip==='pugni'||st.clip==='respinta'||st.clip==='sfugge');
        t.clip[st.clip] = (t.clip[st.clip]|0) + 1;
        if (ded) {
          t.dedicata++;
          const dx = p.x - t.px, dy = p.y - t.py;
          t.cammino += Math.hypot(dx, dy);
          const ex = p.x - t.x0, ey = p.y - t.y0;
          const d = Math.hypot(ex, ey);
          if (d > t.dmax) t.dmax = d;
        }
        t.px = p.x; t.py = p.y;
        t.n++;
        /* si chiude quando la clip dedicata NON c'e' piu' (dopo averla
           vista almeno una volta) oppure dopo 40 fotogrammi */
        if (t.n >= 40 || (t.dedicata > 0 && !ded)) {
          R.eventi.push({ e:t.e, stato:t.stato, frames:t.dedicata,
                          cammino:+t.cammino.toFixed(2), dmax:+t.dmax.toFixed(2),
                          clip:t.clip });
          vivi.splice(i,1);
        }
      }
    },
    partita(){ vivi.length = 0; },
    leggi(){ R.scala = (typeof RIG_H!=='undefined'?RIG_H:0)*(typeof P_DIS!=='undefined'?P_DIS:1);
             R.perMetro = (typeof GEO!=='undefined' && GEO.perMetro)||0;
             R.gkSpeed = (typeof GK_SPEED!=='undefined')?GK_SPEED:0;
             return R; },
  };
})()`;

(async () => {
  const { chromium } = require('playwright');
  const srv = await servi();
  const rel = path.relative(RADICE, GIOCO).split(path.sep).join('/');
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport:{width:915,height:412}, deviceScaleFactor:1 });
  const pag = await ctx.newPage();
  await pag.addInitScript(bancoDiProva);
  await pag.addInitScript(semeFisso, SEME);
  await pag.addInitScript(() => { window.requestIdleCallback = () => 0; window.cancelIdleCallback = () => {}; });
  await pag.goto('http://127.0.0.1:' + srv.porta + '/' + rel + '?q=' + Date.now(), { waitUntil:'load' });
  await pag.evaluate(() => window.__banco.passo(30));
  await pag.evaluate(SONDA);

  for (let m = 0; m < PARTITE; m++) {
    await pag.evaluate((seme) => {
      window.__test.semina(seme);
      window.__test.dismissSplash && window.__test.dismissSplash();
      window.__test.startMatch(1, 1, { size: 5 });
      window.__test.Tut && window.__test.Tut.finish && window.__test.Tut.finish(true);
      window.__test.setCpuVsCpu(true); window.__test.setTimeLeft(600);
      window.__cs.partita();
    }, SEME + m);
    await pag.evaluate((sec) => {
      const n = Math.round(sec*60);
      for (let i = 0; i < n; i++) { window.__test.simulate(1/60); window.__cs.passo(); }
    }, SEC);
    if ((m+1) % 10 === 0) process.stderr.write('  partita ' + (m+1) + '\n');
  }
  const R = await pag.evaluate(() => window.__cs.leggi());
  await br.close(); srv.chiudi();

  const inPiedi = R.eventi.filter(e => e.stato === 'IN PIEDI' && e.frames > 0);
  const fig = R.scala;
  console.log('gioco: ' + GIOCO);
  console.log('partite ' + PARTITE + ' x ' + SEC + ' s, seme base ' + SEME);
  console.log('altezza apparente figura RIG_H*P_DIS = ' + fig.toFixed(2) + ' unita\'; GK_SPEED ' + R.gkSpeed);
  console.log('eventi totali (tutti gli stati): ' + R.eventi.length);
  console.log('eventi IN PIEDI con clip dedicata: ' + inPiedi.length);
  if (!inPiedi.length) { console.log('nessuno'); return; }
  const camm = inPiedi.map(e => e.cammino).sort((a,b)=>a-b);
  const dm = inPiedi.map(e => e.dmax).sort((a,b)=>a-b);
  const fr = inPiedi.map(e => e.frames).sort((a,b)=>a-b);
  const med = a => a[Math.floor(a.length/2)];
  console.log('fotogrammi con la clip dedicata: min ' + fr[0] + ' mediana ' + med(fr) + ' max ' + fr[fr.length-1]);
  console.log('CAMMINO percorso mentre la posa e\' in scena (unita\'):');
  console.log('  min ' + camm[0].toFixed(1) + '  mediana ' + med(camm).toFixed(1) + '  max ' + camm[camm.length-1].toFixed(1));
  console.log('  in altezze-figura: min ' + (camm[0]/fig).toFixed(2) + '  mediana ' + (med(camm)/fig).toFixed(2) + '  max ' + (camm[camm.length-1]/fig).toFixed(2));
  console.log('SPOSTAMENTO massimo dal punto di partenza (unita\'):');
  console.log('  min ' + dm[0].toFixed(1) + '  mediana ' + med(dm).toFixed(1) + '  max ' + dm[dm.length-1].toFixed(1));
  console.log('  in altezze-figura: mediana ' + (med(dm)/fig).toFixed(2) + '  max ' + (dm[dm.length-1]/fig).toFixed(2));
  const sopraMezza = inPiedi.filter(e => e.cammino > fig*0.5).length;
  console.log('eventi in cui il cammino supera MEZZA figura (' + (fig*0.5).toFixed(1) + ' unita\'): ' + sopraMezza + ' / ' + inPiedi.length);
  const sopraUna = inPiedi.filter(e => e.cammino > fig).length;
  console.log('eventi in cui il cammino supera UNA figura intera: ' + sopraUna + ' / ' + inPiedi.length);
  console.log('\ndettaglio:');
  for (const e of inPiedi) console.log('  ' + e.e.padEnd(9) + ' f=' + String(e.frames).padStart(2) +
    '  cammino ' + e.cammino.toFixed(1).padStart(6) + '  (' + (e.cammino/fig).toFixed(2) + ' fig)  dmax ' + e.dmax.toFixed(1).padStart(6) +
    '  clip ' + JSON.stringify(e.clip));
})();
