/* =====================================================================
   _crit-anim-ritardo.js — LA CRITICA A _t-teletrasporto.js.

   LA DOMANDA CHE _q-fusione.js NON PUO' FARE. Quel cancello premia i
   POCHI CAMBI (V2 < 200 per 90 s). Ma un selettore d'andatura che non
   cambia MAI prende zero cambi e vince: la misura non sa distinguere
   «meno sfarfallio» da «l'animazione non segue piu' il corpo».
   Qui si misura la cosa opposta: quanto la POSA DISEGNATA e' in
   disaccordo con la VELOCITA' VERA della figura.

   COSA CONTA, per ogni figura DISEGNATA di ogni fotogramma in cui la
   posa e' di locomozione (fermo/attesaGK/camminata/corsa — le sole che
   escono dal ramo delle andature; niente LOD, niente esultanza, niente
   calcio/scivolata/tuffo):

     A) SPRINT DISEGNATO PIANO: v vera >= 70 u/s e clip != 'corsa'
     B) FERMO DISEGNATO IN CAMMINO: v vera < 6 u/s e clip in
        {camminata, corsa}
     C) il RITARDO in secondi fra l'attraversamento della velocita'
        vera (sopra 62 / sotto 14, le soglie del gioco di ieri) e il
        momento in cui la clip disegnata si adegua.

   Non legge nessuna dichiarazione del gioco: legge p.vx/p.vy (la
   fisica) e p.poseClip (scritto da drawPlayer con cio' che ha
   disegnato, LOD compreso).

   uso: node strumenti/_crit-anim-ritardo.js --gioco <file> [--taglia 5]
                                             [--sec 90] [--seme 20260820]
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { servi, bancoDiProva, semeFisso } = require('./_posa.js');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'CALCETTO-il-gioco.html')));
const TAGLIA = +arg('taglia', 5);
const SEC = +arg('sec', 90);
const SEME = +arg('seme', 20260820);
const N = { 1: 5, 2: 7, 3: 11 }[TAGLIA] || TAGLIA;

(async () => {
  const { chromium } = require('playwright');
  const srv = await servi();
  const rel = path.relative(RADICE, GIOCO).split(path.sep).join('/');
  const url = 'http://127.0.0.1:' + srv.porta + '/' + rel + '?q=' + Date.now();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 576, height: 273 }, deviceScaleFactor: 2.8125 });
  const pag = await ctx.newPage();
  await pag.addInitScript(bancoDiProva);
  await pag.addInitScript(semeFisso, SEME);
  await pag.addInitScript(() => { window.requestIdleCallback = () => 0; window.cancelIdleCallback = () => {}; });
  await pag.goto(url, { waitUntil: 'load' });
  await pag.evaluate(() => window.__banco.passo(30));
  await pag.evaluate(([n, sec]) => {
    window.__test.dismissSplash && window.__test.dismissSplash();
    window.__test.startMatch(1, 1, { size: n });
    window.__test.Tut && window.__test.Tut.finish && window.__test.Tut.finish(true);
    window.__test.setCpuVsCpu(true);
    window.__test.setTimeLeft(sec + 30);
  }, [N, SEC]);

  await pag.evaluate(() => {
    const LOCO = { fermo: 1, attesaGK: 1, camminata: 1, corsa: 1 };
    const R = {
      frame: 0, nLoco: 0,
      sprintPiano: 0, fermoInCammino: 0, nLod: 0, epA: 0, epB: 0,
      /* distribuzione dei ritardi, bin da 1/60 s, max 3 s */
      ritSu: new Int32Array(200), nSu: 0, ritGiu: new Int32Array(200), nGiu: 0,
      persiSu: 0, persiGiu: 0,
      /* somma dell'errore di velocita' implicito */
      sommaErr: 0, nErr: 0, maxErr: 0,
    };
    const st = new Map();
    let conta = 0;
    const dis0 = Rig3D.disegna;
    Rig3D.disegna = function () { conta++; return dis0.apply(this, arguments); };
    const dp0 = drawPlayer;
    window.drawPlayer = function (p) {
      const prima = conta;
      dp0(p);
      if (conta === prima || !p.poseClip) return;
      const c = p.poseClip;
      const v = Math.sqrt((p.vx || 0) * (p.vx || 0) + (p.vy || 0) * (p.vy || 0));
      const k = p.team * 32 + p.idx;
      let s = st.get(k);
      if (!s) { s = { attSu: -1, attGiu: -1, corsa: (c === 'corsa'), fermo: (c === 'fermo' || c === 'attesaGK') }; st.set(k, s); }

      /* --- le due crociate: la velocita' VERA attraversa le soglie del
             gioco di ieri, e si aspetta che la clip disegnata segua --- */
      if (v >= 62 && !s.corsa && s.attSu < 0) s.attSu = R.frame;      // ha cominciato a correre
      if (v < 62) s.attSu = -1;                                        // rientrato: la domanda decade
      if (c === 'corsa') {
        if (s.attSu >= 0) { const d = R.frame - s.attSu; R.ritSu[d < 199 ? d : 199]++; R.nSu++; }
        s.attSu = -1; s.corsa = true;
      } else s.corsa = false;

      if (v < 14 && !s.fermo && s.attGiu < 0) s.attGiu = R.frame;      // si e' fermato
      if (v >= 14) s.attGiu = -1;
      if (c === 'fermo' || c === 'attesaGK') {
        if (s.attGiu >= 0) { const d = R.frame - s.attGiu; R.ritGiu[d < 199 ? d : 199]++; R.nGiu++; }
        s.attGiu = -1; s.fermo = true;
      } else s.fermo = false;

      if (!LOCO[c]) return;
      if (p.lodPosa) { R.nLod++; return; }   // il LOD congela la posa per conto suo: fuori
      R.nLoco++;
      if (v >= 70 && c !== 'corsa') { R.sprintPiano++; if (!s.epA) { s.epA = 1; R.epA++; } } else s.epA = 0;
      if (v < 6 && (c === 'camminata' || c === 'corsa')) { R.fermoInCammino++; if (!s.epB) { s.epB = 1; R.epB++; } } else s.epB = 0;
      /* errore implicito: quale velocita' racconta la clip disegnata,
         contro quella vera. Bande di ieri: fermo <14, camminata 14-62,
         corsa >=62. Distanza dalla banda. */
      let e = 0;
      if (c === 'fermo' || c === 'attesaGK') e = v > 14 ? v - 14 : 0;
      else if (c === 'camminata') e = v < 14 ? 14 - v : (v > 62 ? v - 62 : 0);
      else e = v < 62 ? 62 - v : 0;
      R.sommaErr += e; R.nErr++; if (e > R.maxErr) R.maxErr = e;
    };
    window.__ritRec = R;
  });

  const frames = Math.round(SEC * 60);
  for (let f = 0; f < frames; f += 60) {
    const n = Math.min(60, frames - f);
    const sc = await pag.evaluate((m) => {
      for (let i = 0; i < m; i++) { window.__test.simulate(1 / 60); window.__ritRec.frame++; window.__test.disegna(); }
      return window.__test.G.scene;
    }, n);
    if (sc === 'end' || sc === 'menu') { console.error('scena ' + sc + ' a ' + (f + n)); break; }
  }
  const R = await pag.evaluate(() => {
    const R = window.__ritRec;
    return {
      frame: R.frame, nLoco: R.nLoco, nLod: R.nLod, epA: R.epA, epB: R.epB, sprintPiano: R.sprintPiano, fermoInCammino: R.fermoInCammino,
      ritSu: Array.from(R.ritSu), nSu: R.nSu, ritGiu: Array.from(R.ritGiu), nGiu: R.nGiu,
      sommaErr: R.sommaErr, nErr: R.nErr, maxErr: R.maxErr,
      score: [window.__test.G.score[0], window.__test.G.score[1]],
      sorteggi: window.__quanti ? window.__quanti() : -1,
    };
  });
  await browser.close(); srv.chiudi();

  const q = (bins, n, p) => { if (!n) return NaN; let c = 0; for (let i = 0; i < bins.length; i++) { c += bins[i]; if (c >= p * n) return i / 60; } return bins.length / 60; };
  const pc = (a, b) => b ? (100 * a / b).toFixed(2) + '%' : 'n/d';
  console.log('RITARDO D\'ANDATURA — ' + path.relative(RADICE, GIOCO) + '  taglia ' + N + '  ' + (R.frame / 60).toFixed(0) + ' s');
  console.log('  figure-fotogramma in posa di locomozione: ' + R.nLoco);
  console.log('  (scartate perche' + String.fromCharCode(39) + ' a dettaglio ridotto: ' + R.nLod + ')');
  console.log('  A) v>=70 u/s ma NON disegnato in corsa : ' + R.sprintPiano + '  = ' + pc(R.sprintPiano, R.nLoco) + '   in ' + R.epA + ' episodi (' + (R.epA? (R.sprintPiano/R.epA/60).toFixed(3):0) + ' s l' + String.fromCharCode(39) + 'uno)');
  console.log('  B) v<6 u/s ma disegnato in cammino/corsa: ' + R.fermoInCammino + '  = ' + pc(R.fermoInCammino, R.nLoco) + '   in ' + R.epB + ' episodi (' + (R.epB? (R.fermoInCammino/R.epB/60).toFixed(3):0) + ' s l' + String.fromCharCode(39) + 'uno)');
  console.log('  C) ritardo partenza (v>=62 -> clip corsa), n=' + R.nSu +
    '   med ' + q(R.ritSu, R.nSu, 0.5).toFixed(3) + ' s  p90 ' + q(R.ritSu, R.nSu, 0.9).toFixed(3) + ' s  p99 ' + q(R.ritSu, R.nSu, 0.99).toFixed(3) + ' s');
  console.log('     ritardo arresto (v<14 -> clip fermo), n=' + R.nGiu +
    '   med ' + q(R.ritGiu, R.nGiu, 0.5).toFixed(3) + ' s  p90 ' + q(R.ritGiu, R.nGiu, 0.9).toFixed(3) + ' s  p99 ' + q(R.ritGiu, R.nGiu, 0.99).toFixed(3) + ' s');
  console.log('  D) errore medio di velocita\' raccontato dalla clip: ' + (R.sommaErr / R.nErr).toFixed(2) + ' u/s   (max ' + R.maxErr.toFixed(1) + ')');
  console.log('  (score ' + R.score.join('-') + ', sorteggi ' + R.sorteggi + ')');
})().catch(e => { console.error('FALLITO: ' + (e && e.message || e)); process.exit(1); });
