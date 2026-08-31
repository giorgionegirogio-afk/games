/* =====================================================================
   _crit-piedi.js — I PIEDI SCIVOLANO SULL'ERBA?

   LA DOMANDA. La toppa _t-mani-portiere.js sostituisce, per la durata di
   un latch, la clip di LOCOMOZIONE del portiere (corsa/camminata: la
   fase avanza con lo SPAZIO percorso, `p.fase += v/PASSO_D*dt`, ed e'
   l'unica cosa che impedisce ai piedi di slittare sull'erba — lo dice il
   gioco stesso in aggiornaPosa) con una posa STATICA a piedi piantati.
   Se il portiere si sposta mentre la posa e' in scena, i piedi
   scivolano.

   COME SI MISURA, e senza inventare una proiezione. Il piede d'appoggio
   e' quello con la quota (y del rig) piu' bassa. La sua posizione a
   terra e':
       piede = (p.x,p.y) + SCA*( z_rig*(cos f, sin f) + x_rig*(-sin f, cos f) )
   dove f = rigAngolo(p) (l'imbardata in unita' di campo, la stessa che
   drawPlayer passa al rig) e SCA = RIG_H/(1.9*CAMERE.alto.ce)*P_DIS, la
   scala orizzontale in pianta scritta dal banco ?gabbia del gioco.
   Lo SCIVOLAMENTO e' la somma di |delta piede d'appoggio| fotogramma per
   fotogramma, saltando i fotogrammi in cui il piede d'appoggio cambia.

   IL CONFRONTO E' APPAIATO E SULLO STESSO FOTOGRAMMA. La toppa non tocca
   la simulazione, quindi la clip di prima si ottiene azzerando
   TEMPORANEAMENTE il latch e richiamando rigStato: stesso portiere,
   stessa posizione, stesso istante — cambia solo la posa.

   uso: node strumenti/_crit-piedi.js --gioco fuori/anim-seconda.html
                                      [--partite 40] [--sec 120] [--seme 20260803]
   ===================================================================== */
const path = require('path');
const RADICE = path.resolve(__dirname, '..');
const { servi, bancoDiProva, semeFisso } = require('./_posa.js');

const arg = (n, d) => { const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i+1] && !process.argv[i+1].startsWith('--') ? process.argv[i+1] : d; };
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'fuori/anim-seconda.html')));
const PARTITE = +arg('partite', 40);
const SEC = +arg('sec', 120);
const SEME = +arg('seme', 20260803);

const SONDA = String.raw`(() => {
  const R = { eventi: [], scala: 0, frames: 0 };
  const B = Rig3D.banco;
  const SCA = RIG_H/(1.9*Rig3D.CAMERE.alto.ce)*P_DIS;
  const FIG = RIG_H*P_DIS;
  const FTL = 12, FTR = 15;
  let dentro = null;
  const vivi = [];

  /* il piede d'appoggio a terra, per una data (clip,u) e un dato p */
  function piede(p, clip, u){
    const lk = rigLook(p);
    B.corpora(lk.corp, lk.varb||0);
    B.posa(clip, u/Rig3D.CLIPS[clip].freq);
    const yl = B.P[FTL*3+1], yr = B.P[FTR*3+1];
    const j = (yl <= yr) ? FTL : FTR;           // il piu' basso = appoggio
    const xr = B.P[j*3], zr = B.P[j*3+2];
    const f = rigAngolo(p), cf = Math.cos(f), sf = Math.sin(f);
    return { lato: j, x: p.x + SCA*(zr*cf - xr*sf), y: p.y + SCA*(zr*sf + xr*cf) };
  }

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
      vivi.push({ e: txt.slice(0,-1), pi: dentro.pi, stato: dentro.stato,
                  n:0, ded:0, cammino:0, slipN:0, slipV:0, prec:null, precV:null,
                  clipN:{}, clipV:{}, px:null, py:null });
    }
    return sb0.apply(this, arguments);
  };

  window.__cp = {
    passo(){
      R.frames++;
      for (let i = vivi.length-1; i >= 0; i--) {
        const t = vivi[i], p = G.players[t.pi];
        const stN = rigStato(p); const cN = stN.clip, uN = stN.u;
        /* la posa di PRIMA: stesso istante, latch spento un attimo */
        const sv = p.gkManiT; p.gkManiT = 0;
        const stV = rigStato(p); const cV = stV.clip, uV = stV.u;
        p.gkManiT = sv;
        const ded = (cN==='pugni'||cN==='respinta'||cN==='sfugge');
        if (ded) {
          t.ded++;
          t.clipN[cN] = (t.clipN[cN]|0)+1;
          t.clipV[cV] = (t.clipV[cV]|0)+1;
          if (t.px !== null) t.cammino += Math.hypot(p.x-t.px, p.y-t.py);
          const aN = piede(p, cN, uN), aV = piede(p, cV, uV);
          if (t.prec && t.prec.lato === aN.lato) t.slipN += Math.hypot(aN.x-t.prec.x, aN.y-t.prec.y);
          if (t.precV && t.precV.lato === aV.lato) t.slipV += Math.hypot(aV.x-t.precV.x, aV.y-t.precV.y);
          t.prec = aN; t.precV = aV;
        }
        t.px = p.x; t.py = p.y;
        t.n++;
        if (t.n >= 60 || (t.ded > 0 && !ded)) {
          R.eventi.push({ e:t.e, stato:t.stato, f:t.ded,
                          cammino:+t.cammino.toFixed(2),
                          slipNuovo:+t.slipN.toFixed(2), slipVecchio:+t.slipV.toFixed(2),
                          clipN:t.clipN, clipV:t.clipV });
          vivi.splice(i,1);
        }
      }
    },
    partita(){ vivi.length = 0; },
    leggi(){ R.scala = SCA; R.fig = FIG; return R; },
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
      window.__cp.partita();
    }, SEME + m);
    await pag.evaluate((sec) => {
      const n = Math.round(sec*60);
      for (let i = 0; i < n; i++) { window.__test.simulate(1/60); window.__cp.passo(); }
    }, SEC);
    if ((m+1) % 10 === 0) process.stderr.write('  partita ' + (m+1) + '\n');
  }
  const R = await pag.evaluate(() => window.__cp.leggi());
  await br.close(); srv.chiudi();

  const ev = R.eventi.filter(e => e.stato === 'IN PIEDI' && e.f >= 5);
  console.log('gioco ' + GIOCO);
  console.log('scala orizzontale in pianta SCA = ' + R.scala.toFixed(3) + ' unita\'/metro-rig; figura ' + R.fig.toFixed(2) + ' unita\'');
  console.log('eventi totali ' + R.eventi.length + ', IN PIEDI con >=5 fotogrammi di clip dedicata: ' + ev.length);
  if (!ev.length) return;
  const s = a => a.reduce((x,y)=>x+y,0);
  const sn = ev.map(e=>e.slipNuovo), sv = ev.map(e=>e.slipVecchio);
  const med = a => { const b=a.slice().sort((x,y)=>x-y); return b[Math.floor(b.length/2)]; };
  console.log('\nSCIVOLAMENTO DEL PIEDE D\'APPOGGIO nella finestra (unita\' di campo)');
  console.log('  posa NUOVA   : totale ' + s(sn).toFixed(1) + '  mediana ' + med(sn).toFixed(1) + '  max ' + Math.max(...sn).toFixed(1));
  console.log('  clip VECCHIA : totale ' + s(sv).toFixed(1) + '  mediana ' + med(sv).toFixed(1) + '  max ' + Math.max(...sv).toFixed(1));
  console.log('  rapporto nuovo/vecchio (totali): ' + (s(sn)/Math.max(1e-9,s(sv))).toFixed(2) + 'x');
  console.log('  peggio in altezze-figura: nuovo ' + (Math.max(...sn)/R.fig).toFixed(2) + '  vecchio ' + (Math.max(...sv)/R.fig).toFixed(2));
  console.log('\ndettaglio (cammino = quanto si sposta il corpo)');
  for (const e of ev) console.log('  ' + e.e.padEnd(9) + ' f=' + String(e.f).padStart(2) +
    '  cammino ' + e.cammino.toFixed(1).padStart(6) +
    '  slip NUOVO ' + e.slipNuovo.toFixed(1).padStart(6) +
    '  slip VECCHIO ' + e.slipVecchio.toFixed(1).padStart(6) +
    '  | ' + JSON.stringify(e.clipN) + ' vs ' + JSON.stringify(e.clipV));
})();
