/* =====================================================================
   _g-mani.js — SOLA MISURA. I QUATTRO ESITI DELLE MANI DEL PORTIERE:
   quante volte escono, in che stato era il corpo, e QUALE POSA il gioco
   disegna nei fotogrammi subito dopo.

   E' il metro della famiglia F2 del referto _analisi/ONDA-ANIMAZIONE.md
   («i gesti senza corpo»), voci 13, 14, 32: il portiere ha quattro esiti
   in campo — PRESA, PUGNI, SFUGGE, RESPINTA — e uno solo ha una clip.

   COME SI LEGGE L'ESITO, e perche' non si ricopia la regola.
   Le quattro condizioni stanno dentro tentaPresa e sono un intreccio di
   soglie (sogliaPresa, zonaMani, GK_PUGNO_Z, GK_SFUGGE). Riscriverle qui
   vorrebbe dire misurare la mia copia della regola invece della regola.
   Si legge invece la DICHIARAZIONE che il gioco fa da se': dentro
   tentaPresa ogni ramo chiama showBanner con il proprio nome. Si avvolge
   tentaPresa (per sapere che siamo dentro, e in che stato era il corpo)
   e showBanner (per sapere quale ramo ha parlato).

   Lo stato del corpo al momento del contatto e' la meta' del referto:
     · TUFFO     p.dive>0    — sta volando: il rig disegna tuffo/parata
     · TERRA     p.recover>0 — e' gia' a terra dopo il tuffo
     · IN PIEDI  ne' l'uno ne' l'altro — e qui il rig non ha NIENTE da
       dire: il pallone riparte a 430-620 (pugni), 150-250 (respinta) o
       70-150 (sfugge) unita' al secondo e la figura resta quella
       dell'attesa o della corsa. E' il caso piu' brutto, ed e' quello
       che questa sonda serve a contare.

   Non pesca un solo numero casuale: si verifica con
   `node strumenti/_g-sorteggi.js`.

   uso:
     node strumenti/_g-mani.js [--gioco f] [--taglia 5] [--partite 10]
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
const PARTITE = +arg('partite', 10);
const SEC = +arg('sec', 120);
const SEME = +arg('seme', 20260827);
const JSONOUT = arg('json', '');
const N = { 1: 5, 2: 7, 3: 11 }[TAGLIA] || TAGLIA;
const VELOCE = process.argv.indexOf('--veloce') > 0;

const SONDA = String.raw`(() => {
  const R = {
    frames: 0, partita: 0, figTot: 0,
    esiti: {},           // esito -> conteggio
    esitoStato: {},      // esito -> {stato -> conteggio}
    esitoClip: {},       // esito -> {clip -> fotogrammi nei 12 dopo}
    esitoClip1: {},      // esito -> {clip -> il PRIMO fotogramma dopo}
    perPartita: {},      // esito -> {partita -> conteggio}
    primoPerStato: {},   // 'stato / esito' -> {clip del 1o fotogramma -> n}
  };
  const eventi = [];
  let dentro = null;

  const tp0 = window.tentaPresa;
  window.tentaPresa = function(p, b, d){
    dentro = { pi: G.players.indexOf(p),
               stato: p.dive > 0 ? 'TUFFO' : (p.recover > 0 ? 'TERRA' : 'IN PIEDI'),
               z: b.z, sp: Math.hypot(b.vx, b.vy) };
    let r; try { r = tp0.apply(this, arguments); } finally { dentro = null; }
    return r;
  };

  const sb0 = window.showBanner;
  window.showBanner = function(txt, col, dur){
    if (dentro && (txt === 'PRESA!' || txt === 'PUGNI!' || txt === 'SFUGGE!' || txt === 'RESPINTA!')) {
      const e = txt.slice(0, -1);
      R.esiti[e] = (R.esiti[e]|0) + 1;
      if (!R.esitoStato[e]) R.esitoStato[e] = {};
      R.esitoStato[e][dentro.stato] = (R.esitoStato[e][dentro.stato]|0) + 1;
      if (!R.perPartita[e]) R.perPartita[e] = {};
      R.perPartita[e][R.partita] = (R.perPartita[e][R.partita]|0) + 1;
      eventi.push({ e: e, pi: dentro.pi, f: R.frames, primo: -1, st: dentro.stato });
    }
    return sb0.apply(this, arguments);
  };

  let conta = 0;
  const dis0 = Rig3D.disegna;
  Rig3D.disegna = function(){ conta++; return dis0.apply(this, arguments); };

  const dp0 = drawPlayer;
  window.drawPlayer = function(p){
    const prima = conta;
    dp0(p);
    if (conta === prima) return;
    R.figTot++;
    const c = p.poseClip || '?';
    const pi = G.players.indexOf(p);
    for (const t of eventi) {
      const dt = R.frames - t.f;
      if (t.pi !== pi || dt < 0 || dt >= 12) continue;
      if (!R.esitoClip[t.e]) R.esitoClip[t.e] = {};
      R.esitoClip[t.e][c] = (R.esitoClip[t.e][c]|0) + 1;
      if (t.primo < 0) {
        t.primo = 1;
        if (!R.esitoClip1[t.e]) R.esitoClip1[t.e] = {};
        R.esitoClip1[t.e][c] = (R.esitoClip1[t.e][c]|0) + 1;
        /* LA MISURA CHE CONTA, e va contata e non dedotta: il primo
           fotogramma dopo l'esito, SEPARATO per stato del corpo. */
        const k = t.st + ' / ' + t.e;
        if (!R.primoPerStato[k]) R.primoPerStato[k] = {};
        R.primoPerStato[k][c] = (R.primoPerStato[k][c]|0) + 1;
      }
    }
  };

  /* LA CORSIA VELOCE, e il suo limite dichiarato. Disegnare ogni
     fotogramma costa dieci volte la simulazione, e per contare la clip
     del portiere non serve: si interroga rigStato sui due portieri e si
     legge la stessa coppia (clip, fase) che drawPlayer userebbe.
     L'UNICA differenza e' il LOD — drawPlayer puo' congelare la posa di
     una figura lontana, rigStato da solo no. Sul portiere nell'istante
     della parata non capita mai: figuraLontana risparmia chiunque stia
     entro 420 unita' dal PALLONE, e in quell'istante il pallone e'
     addosso a lui. Chi vuole la verita' al pixel usa il modo lento
     (senza --veloce), che disegna davvero. */
  function guardaPortieri(){
    for (const p of G.players) {
      if (p.role !== 'gk' || p.out > 0) continue;
      const st = rigStato(p);
      const c = st.clip;
      const pi = G.players.indexOf(p);
      R.figTot++;
      for (const t of eventi) {
        const dt = R.frames - t.f;
        if (t.pi !== pi || dt < 0 || dt >= 12) continue;
        if (!R.esitoClip[t.e]) R.esitoClip[t.e] = {};
        R.esitoClip[t.e][c] = (R.esitoClip[t.e][c]|0) + 1;
        if (t.primo < 0) {
          t.primo = 1;
          if (!R.esitoClip1[t.e]) R.esitoClip1[t.e] = {};
          R.esitoClip1[t.e][c] = (R.esitoClip1[t.e][c]|0) + 1;
          /* LA MISURA CHE CONTA, e va contata e non dedotta: il primo
             fotogramma dopo l'esito, SEPARATO per stato del corpo. */
          const k = t.st + ' / ' + t.e;
          if (!R.primoPerStato[k]) R.primoPerStato[k] = {};
          R.primoPerStato[k][c] = (R.primoPerStato[k][c]|0) + 1;
        }
      }
    }
  }

  window.__gm = {
    /* la lista degli eventi si POTA a ogni fotogramma: senza, cresce per
       tutta la partita e ogni figura disegnata la percorre tutta —
       e' quadratico, e a 120 s la pagina cade («Target crashed»). */
    passo(veloce){
      R.frames++;
      if (veloce) guardaPortieri();
      for (let i = eventi.length - 1; i >= 0; i--)
        if (R.frames - eventi[i].f >= 12) eventi.splice(i, 1);
    },
    partita(n){ R.partita = n; eventi.length = 0; },
    leggi(){ return R; },
  };
})()`;

(async () => {
  const { chromium } = require('playwright');
  const srv = await servi();
  const rel = path.relative(RADICE, GIOCO).split(path.sep).join('/');
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2 });
  const pag = await ctx.newPage();
  await pag.addInitScript(bancoDiProva);
  await pag.addInitScript(semeFisso, SEME);
  await pag.addInitScript(() => { window.requestIdleCallback = () => 0; window.cancelIdleCallback = () => {}; });
  await pag.goto('http://127.0.0.1:' + srv.porta + '/' + rel + '?q=' + Date.now(), { waitUntil: 'load' });
  await pag.evaluate(() => window.__banco.passo(30));
  await pag.evaluate(SONDA);

  const frames = Math.round(SEC * 60);
  for (let m = 0; m < PARTITE; m++) {
    await pag.evaluate(([n, sec, mm, seme]) => {
      window.__test.semina(seme + mm * 7919);
      window.__test.dismissSplash && window.__test.dismissSplash();
      window.__test.startMatch(1, 1, { size: n });
      window.__test.Tut && window.__test.Tut.finish && window.__test.Tut.finish(true);
      window.__test.setCpuVsCpu(true);
      window.__test.setTimeLeft(sec + 30);
      window.__gm.partita(mm);
    }, [N, SEC, m, SEME]);
    for (let f = 0; f < frames; f += 60) {
      const k = Math.min(60, frames - f);
      const st = await pag.evaluate(([n, vel]) => {
        for (let i = 0; i < n; i++) {
          window.__test.simulate(1 / 60);
          window.__gm.passo(vel);
          if (!vel) window.__test.disegna();
        }
        return window.__test.G.scene;
      }, [k, VELOCE]);
      if (st === 'end' || st === 'menu') break;
    }
    process.stderr.write('  partita ' + (m + 1) + '/' + PARTITE + '\n');
  }

  const R = await pag.evaluate(() => window.__gm.leggi());
  await browser.close(); srv.chiudi();

  const out = { gioco: path.relative(RADICE, GIOCO), taglia: N, partite: PARTITE, sec: SEC, seme: SEME,
                modo: VELOCE ? 'veloce (rigStato sui portieri, niente disegno)' : 'lento (disegno vero)',
                fotogrammi: R.frames, figureLette: R.figTot };
  out.esiti = {};
  for (const e of ['PRESA', 'PUGNI', 'SFUGGE', 'RESPINTA']) {
    out.esiti[e] = { volte: R.esiti[e] | 0,
                     perPartita: +(((R.esiti[e] | 0)) / PARTITE).toFixed(2),
                     statoDelCorpo: R.esitoStato[e] || {},
                     clipNeiPrimi12Fotogrammi: R.esitoClip[e] || {},
                     clipDelPrimoFotogramma: R.esitoClip1[e] || {} };
  }
  out.primoFotogrammaPerStato = R.primoPerStato;
  /* IL RIASSUNTO IN UNA RIGA: fra gli esiti che LASCIANO ANDARE il
     pallone (PUGNI, SFUGGE, RESPINTA) con il portiere IN PIEDI, quanti
     hanno una posa dedicata al primo fotogramma e quanti una posa di
     locomozione o d'attesa — cioe' un corpo che non dice niente. */
  const DEDIC = { pugni:1, respinta:1, sfugge:1 };
  const MUTE = { fermo:1, camminata:1, corsa:1, attesaGK:1, frenata:1, finta:1 };
  let conPosa = 0, muta = 0, altro = 0;
  for (const k in R.primoPerStato) {
    if (k.indexOf('IN PIEDI / ') !== 0 || k.indexOf('PRESA') >= 0) continue;
    for (const c in R.primoPerStato[k]) {
      const n = R.primoPerStato[k][c];
      if (DEDIC[c]) conPosa += n; else if (MUTE[c]) muta += n; else altro += n;
    }
  }
  out.portiereInPiediCheRibutta = { conPosaDedicata:conPosa, corpoMuto:muta, altraClip:altro };
  if (JSONOUT) fs.writeFileSync(JSONOUT, JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, null, 1));
})().catch(e => { console.error('FALLITO: ' + (e && e.stack || e)); process.exit(1); });
