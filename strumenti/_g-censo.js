/* =====================================================================
   _g-censo.js — SOLA MISURA per l'onda G (animazione e corpo).
   Non scrive niente nel gioco, non applica nessuna toppa.

   CHE COSA CONTA, e perche' ognuna serve a una voce del confronto:

     A. CENSIMENTO DELLE CLIP — per ogni clip di Rig3D.CLIPS: quanti
        fotogrammi-figura la disegnano, quanti INIZI, e a quante partite
        capita almeno una volta. Chiude «clip pagate che non si vedono
        mai» (peso alto) e i conti di frequenza di tuffo/parata/presa.

     B. LOD A POSA CONGELATA — la frazione di figure disegnate con
        p.lodPosa vero, cioe' statue che scivolano. Voci «Sostituzione
        di posa per distanza» e «Dettaglio ridotto».

     C. COLPO DI TESTA — ogni volta che colpoDiTesta() parte, QUALE clip
        il rig disegna nei fotogrammi successivi. Voce «Colpo di testa:
        la meccanica c'e', la posa no».

     D. PIEDE CHE SLITTA — per ogni figura, quanto si sposta a schermo
        il piede d'appoggio (il piu' basso dei due) fra due fotogrammi
        consecutivi, in metri di figura. Un piede piantato deve stare
        FERMO rispetto al TERRENO: la misura e' quindi lo spostamento
        del giunto IN COORDINATE DI MONDO, non di figura. Voce «Piede
        che non slitta sull'erba».

     E. SCUDO / DUELLO — quanti fotogrammi con scudoAttivo, e quale clip.

     F. STANCHEZZA — l'istogramma di p.cond e p.amp e la frazione di
        figure in cui il fattore di stanchezza e' SATURATO dal clamp di
        p.bob, cioe' non si vede. Voce «Stanchezza che cambia la corsa».

   uso:
     node strumenti/_g-censo.js [--gioco f] [--taglia 5] [--partite 6]
                                [--sec 120] [--seme 20260827] [--json f]
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
const PARTITE = +arg('partite', 6);
const SEC = +arg('sec', 120);
const SEME = +arg('seme', 20260827);
const JSONOUT = arg('json', '');
const N = { 1: 5, 2: 7, 3: 11 }[TAGLIA] || TAGLIA;

const SONDA = String.raw`(() => {
  const CE = Rig3D.CAMERE.alto.ce;
  const R = {
    frameFig: {},      // clip -> fotogrammi-figura
    onset: {},         // clip -> inizi
    partiteCon: {},    // clip -> Set di partite (numero)
    figTot: 0, lodTot: 0, frames: 0,
    scudoFrame: 0, scudoClip: {},
    testaEventi: 0, testaClip: {},   // clip vista nei 12 fotogrammi dopo un colpo di testa
    slipBins: new Float64Array(401), slipN: 0,   // mm, 0..400
    slipFermoBins: new Float64Array(401), slipFermoN: 0,
    /* IL PIEDE PIANTATO, misurato come si deve: durante la CORSA, per
       ogni figura-fotogramma, il rapporto fra lo spostamento in MONDO
       del piede piu' basso e lo spostamento in mondo del BACINO. Un
       piede piantato da' rapporto ~0 (sta fermo mentre il corpo passa);
       un piede cucito alla figura da' rapporto ~1. L'istogramma su 20
       caselle dice se esiste anche solo una fase d'appoggio. */
    ratBins: new Float64Array(41), ratN: 0,
    ratMinBins: new Float64Array(41), ratMinN: 0,  // il MINIMO per ciclo
    condBins: new Float64Array(21), ampSat: 0, ampTot: 0,
    velBins: new Float64Array(31),
    acciacchi: 0,
    partita: 0,
  };
  const prev = new Map();
  const ultimo = new Map();
  let conta = 0;
  const dis0 = Rig3D.disegna;
  Rig3D.disegna = function(){ conta++; return dis0.apply(this, arguments); };

  /* C. il colpo di testa: si avvolge la funzione vera, non si indovina */
  const teste = [];      // {pi, frame}
  if (typeof window.colpoDiTesta === 'function') {
    const cdt0 = window.colpoDiTesta;
    window.colpoDiTesta = function(q, qi, b){
      R.testaEventi++;
      teste.push({ pi: qi, f: R.frames, visto: {} });
      return cdt0.apply(this, arguments);
    };
  }

  const dp0 = drawPlayer;
  window.drawPlayer = function(p){
    const prima = conta;
    dp0(p);
    if (conta === prima) return;          // figura non disegnata
    R.figTot++;
    if (p.lodPosa) R.lodTot++;
    const c = p.poseClip || '?';
    R.frameFig[c] = (R.frameFig[c]|0) + 1;
    if (!R.partiteCon[c]) R.partiteCon[c] = {};
    R.partiteCon[c][R.partita] = 1;
    const k = p.team*32 + p.idx;
    if (ultimo.get(k) !== c) { R.onset[c] = (R.onset[c]|0) + 1; ultimo.set(k, c); }

    /* E. scudo */
    if (typeof scudoAttivo === 'function' && scudoAttivo(p)) {
      R.scudoFrame++; R.scudoClip[c] = (R.scudoClip[c]|0) + 1;
    }

    /* C. quale clip nei 12 fotogrammi dopo un colpo di testa */
    const pi = G.players.indexOf(p);
    for (const t of teste) {
      if (t.pi === pi && R.frames - t.f >= 0 && R.frames - t.f < 12) {
        t.visto[c] = (t.visto[c]|0) + 1;
      }
    }

    /* F. stanchezza: cond, e se il clamp di p.bob e' saturo */
    const cond = Math.max(0, Math.min(100, p.cond||0));
    R.condBins[Math.min(20, Math.floor(cond/5))]++;
    const q = Math.min(1, Math.max(0, ((p.amp||1.1)-1.1)/6.5));
    R.ampTot++; if (q >= 0.999) R.ampSat++;
    if (p.acciacco) R.acciacchi++;
    const v = Math.hypot(p.vx, p.vy);
    R.velBins[Math.min(30, Math.floor(v/10))]++;

    /* D. il piede: giunto piu' basso a schermo, spostamento in MONDO */
    const gi = Rig3D.giunti();
    let jb = -1, ymax = -1e9;
    for (let j = 0; j < gi.n; j++) if (gi.y[j] > ymax) { ymax = gi.y[j]; jb = j; }
    const s = (RIG_H/(p.squash||1))/(1.9*CE);   // unita' di mondo per metro di figura
    let r = prev.get(k);
    if (!r) { r = { f:-9, x:0, y:0, j:-1, clip:'', px:0, py:0, minRat:9, nCiclo:0 }; prev.set(k, r); }
    if (r.f === R.frames-1 && r.j === jb && r.clip === c) {
      const dx = (gi.x[jb]-r.x)/s, dy = (gi.y[jb]-r.y)/s;
      const d = Math.hypot(dx, dy);
      const b = Math.min(400, Math.round(d*1000));
      R.slipBins[b]++; R.slipN++;
      if (Math.hypot(p.vx,p.vy) < 14) { R.slipFermoBins[b]++; R.slipFermoN++; }
      /* il rapporto piede/bacino, solo in CORSA e a velocita' vera */
      if (c === 'corsa' || c === 'camminata') {
        const db = Math.hypot(p.x-r.px, p.y-r.py)/s;
        if (db > 0.004) {          // il corpo si e' mosso davvero (4 mm/fot.)
          const rat = d/db;
          R.ratBins[Math.min(40, Math.round(rat*20))]++; R.ratN++;
          if (rat < r.minRat) r.minRat = rat;
          r.nCiclo++;
          if (r.nCiclo >= 20) {    // un ciclo di passo intero, poi si chiude
            R.ratMinBins[Math.min(40, Math.round(r.minRat*20))]++; R.ratMinN++;
            r.minRat = 9; r.nCiclo = 0;
          }
        }
      }
    }
    r.f = R.frames; r.x = gi.x[jb]; r.y = gi.y[jb]; r.j = jb; r.clip = c;
    r.px = p.x; r.py = p.y;
  };

  window.__gc = {
    passo(){ R.frames++; },
    partita(n){ R.partita = n; prev.clear(); ultimo.clear(); },
    leggi(){
      const tv = {};
      for (const t of teste) for (const k in t.visto) tv[k] = (tv[k]|0) + 1;
      return {
        frameFig: R.frameFig, onset: R.onset,
        partiteCon: Object.fromEntries(Object.entries(R.partiteCon).map(([k,v])=>[k,Object.keys(v).length])),
        figTot: R.figTot, lodTot: R.lodTot, frames: R.frames,
        scudoFrame: R.scudoFrame, scudoClip: R.scudoClip,
        testaEventi: R.testaEventi, testaClip: tv, teste: teste.length,
        slipBins: Array.from(R.slipBins), slipN: R.slipN,
        slipFermoBins: Array.from(R.slipFermoBins), slipFermoN: R.slipFermoN,
        ratBins: Array.from(R.ratBins), ratN: R.ratN,
        ratMinBins: Array.from(R.ratMinBins), ratMinN: R.ratMinN,
        condBins: Array.from(R.condBins), ampSat: R.ampSat, ampTot: R.ampTot,
        velBins: Array.from(R.velBins), acciacchi: R.acciacchi,
      };
    },
  };
  return 'ok';
})()`;

function quant(bins, n, q, scala) {
  if (!n) return NaN;
  let cum = 0; const s = q*n;
  for (let i = 0; i < bins.length; i++) { cum += bins[i]; if (cum >= s) return i/scala; }
  return (bins.length-1)/scala;
}

(async () => {
  const { chromium } = require('playwright');
  const srv = await servi();
  const rel = path.relative(RADICE, GIOCO).split(path.sep).join('/');
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport:{width:915,height:412}, deviceScaleFactor:2 });
  const pag = await ctx.newPage();
  await pag.addInitScript(bancoDiProva);
  await pag.addInitScript(semeFisso, SEME);
  await pag.addInitScript(() => { window.requestIdleCallback = () => 0; window.cancelIdleCallback = () => {}; });
  await pag.goto('http://127.0.0.1:'+srv.porta+'/'+rel+'?q='+Date.now(), { waitUntil:'load' });
  await pag.evaluate(() => window.__banco.passo(30));
  await pag.evaluate(SONDA);

  const frames = Math.round(SEC*60);
  for (let m = 0; m < PARTITE; m++) {
    await pag.evaluate(([n, sec, mm, seme]) => {
      window.__test.semina(seme + mm*7919);
      window.__test.dismissSplash && window.__test.dismissSplash();
      window.__test.startMatch(1, 1, { size: n });
      window.__test.Tut && window.__test.Tut.finish && window.__test.Tut.finish(true);
      window.__test.setCpuVsCpu(true);
      window.__test.setTimeLeft(sec + 30);
      window.__gc.partita(mm);
    }, [N, SEC, m, SEME]);
    for (let f = 0; f < frames; f += 60) {
      const n = Math.min(60, frames-f);
      const st = await pag.evaluate((k) => {
        for (let i = 0; i < k; i++) { window.__test.simulate(1/60); window.__gc.passo(); window.__test.disegna(); }
        return window.__test.G.scene;
      }, n);
      if (st === 'end' || st === 'menu') break;
    }
    process.stderr.write('  partita '+(m+1)+'/'+PARTITE+'\n');
  }

  const R = await pag.evaluate(() => window.__gc.leggi());
  await browser.close(); srv.chiudi();

  const out = { gioco: path.relative(RADICE, GIOCO), taglia:N, partite:PARTITE, sec:SEC, seme:SEME };
  out.frames = R.frames;
  out.figureDisegnate = R.figTot;
  out.lodCongelate = R.lodTot;
  out.lodPerc = +(100*R.lodTot/Math.max(1,R.figTot)).toFixed(2);
  const clips = Object.keys(R.frameFig).sort((a,b)=>R.frameFig[b]-R.frameFig[a]);
  out.clip = clips.map(c => ({ clip:c, fotogrammi:R.frameFig[c], inizi:R.onset[c]|0,
                               partite:R.partiteCon[c]|0,
                               iniziPerPartita:+((R.onset[c]|0)/PARTITE).toFixed(2) }));
  const tutte = Object.keys(R.frameFig);
  out.clipMai = null;
  out.scudoFotogrammi = R.scudoFrame;
  out.scudoClip = R.scudoClip;
  out.colpiDiTesta = R.testaEventi;
  out.clipDopoColpoDiTesta = R.testaClip;
  out.piedeSlittaMm = { med:+(1000*quant(R.slipBins,R.slipN,0.5,1000)).toFixed(1),
                        p90:+(1000*quant(R.slipBins,R.slipN,0.9,1000)).toFixed(1),
                        p99:+(1000*quant(R.slipBins,R.slipN,0.99,1000)).toFixed(1), n:R.slipN };
  out.piedeSlittaMmDaFermi = { med:+(1000*quant(R.slipFermoBins,R.slipFermoN,0.5,1000)).toFixed(1),
                        p90:+(1000*quant(R.slipFermoBins,R.slipFermoN,0.9,1000)).toFixed(1),
                        n:R.slipFermoN };
  out.piedeSuBacino = { med:+quant(R.ratBins,R.ratN,0.5,20).toFixed(3),
                        p10:+quant(R.ratBins,R.ratN,0.10,20).toFixed(3),
                        p90:+quant(R.ratBins,R.ratN,0.90,20).toFixed(3), n:R.ratN };
  out.piedeSuBacinoMinPerCiclo = { med:+quant(R.ratMinBins,R.ratMinN,0.5,20).toFixed(3),
                        p10:+quant(R.ratMinBins,R.ratMinN,0.10,20).toFixed(3),
                        n:R.ratMinN };
  out.condIstogramma = R.condBins;
  out.ampSaturo = R.ampSat; out.ampTot = R.ampTot;
  out.ampSaturoPerc = +(100*R.ampSat/Math.max(1,R.ampTot)).toFixed(2);
  out.figureConAcciacco = R.acciacchi;
  out.velIstogramma = R.velBins;

  if (JSONOUT) fs.writeFileSync(JSONOUT, JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, null, 1));
})().catch(e => { console.error('FALLITO: '+(e&&e.stack||e)); process.exit(1); });
