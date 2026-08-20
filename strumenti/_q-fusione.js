/* =====================================================================
   _q-fusione.js — IL CANCELLO DEL TELETRASPORTO DI POSA.

   LA DOMANDA. A ogni cambio di clip il rig valuta una posa nuova in un
   fotogramma secco: il censimento del 20 agosto ha misurato salti del
   giunto peggiore di 0,504 m mediani (p95 1,070) in un sessantesimo di
   secondo, contro 0,043 m a clip invariata. Questo cancello misura
   quella cosa SUI GIUNTI DISEGNATI, non su una bandiera: per ogni figura
   di ogni fotogramma legge Rig3D.giunti() — lo scratch che disegna()
   riempie davvero — subito dopo che drawPlayer l'ha disegnata, converte
   in metri (statura 1,90) e calcola il salto del giunto peggiore fra due
   fotogrammi consecutivi, nel riferimento della figura (tolta la
   traslazione: p.x e p.y+RIG_PIEDI). p.poseClip serve SOLO a smistare i
   salti nei due secchi (clip invariata / clip cambiata): l'effetto
   giudicato e' la geometria, mai il nome.

   NOTA DI MISURA dichiarata: i giunti sono in proiezione schermo, cioe'
   la quota pesa cos(42 gradi) e la profondita' sin(42): sono "metri di
   schermo". I due secchi usano lo stesso metro, quindi il RAPPORTO fra
   le mediane — che e' il criterio — non ne dipende. Il rollio del busto
   (una rotazione ctx a valle, max 0,11 rad) non entra nei giunti: e'
   uguale nei due secchi e nei due file, e si dichiara.

   I TRE VERDETTI (soglie dal censimento, _analisi/COSA-MANCA.md §2.2):
     V1  mediana del salto sui cambi di clip <= 3 x mediana a clip
         invariata (oggi il rapporto misurato dal censimento e' 11,7);
     V2  cambi camminata<->corsa per 90 s di gioco < 200 (oggi ~783);
     V3  salto mediano su QUEI cambi < 0,15 m.
   Verde solo con tutti e tre. Se i campioni di cambio sono meno di 50
   il cancello si dichiara cieco (uscita 2) invece di inventare.

   CONTROLLO NEGATIVO previsto: sul gioco di oggi DEVE essere rosso; su
   una copia toppata con la fusione spenta (_t-fusione.js --spenta) V1
   DEVE tornare rosso, perche' l'isteresi da sola riduce il numero dei
   cambi, non la loro ampiezza.

   uso:
     node strumenti/_q-fusione.js --gioco <file> [--taglia 5] [--sec 90]
                                  [--seme 20260820] [--json]
   uscita: 0 verde, 1 rosso, 2 cieco.
   Determinismo: banco a passo fisso + seme fisso di _posa.js; la
   simulazione avanza con __test.simulate(1/60) e si disegna ogni
   fotogramma con __test.disegna() (passo di tempo fisso DT).
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { servi, bancoDiProva, semeFisso } = require('./_posa.js');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const ha = n => process.argv.includes('--' + n);

const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'CALCETTO-il-gioco.html')));
const TAGLIA = +arg('taglia', 5);
const SEC = +arg('sec', 90);
const SEME = +arg('seme', 20260820);

if (!fs.existsSync(GIOCO)) { console.error('FALLITO: non esiste ' + GIOCO); process.exit(1); }
const N = { 1: 5, 2: 7, 3: 11 }[TAGLIA] || TAGLIA;   // 1/2/3 darebbero CINQUE in silenzio

/* mediana/quantile da istogramma a passo 2 mm (bin i -> i*0,002 m) */
function quantile(bins, n, q) {
  if (n <= 0) return NaN;
  const soglia = q * n; let cum = 0;
  for (let i = 0; i < bins.length; i++) { cum += bins[i]; if (cum >= soglia) return i / 500; }
  return (bins.length - 1) / 500;
}

(async () => {
  const { chromium } = require('playwright');
  const srv = await servi();
  const rel = path.relative(RADICE, GIOCO).split(path.sep).join('/');
  const url = 'http://127.0.0.1:' + srv.porta + '/' + rel + '?q=' + Date.now();

  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 576, height: 273 }, deviceScaleFactor: 2.8125,  // il OnePlus 6
  });
  const pag = await ctx.newPage();
  await pag.addInitScript(bancoDiProva);
  await pag.addInitScript(semeFisso, SEME);
  /* la RICOTTURA del manto va a requestIdleCallback, cioe' a orologio
     VERO, e consuma sorteggi in momenti che il banco non governa: senza
     questo bavaglio due esecuzioni dello stesso identico file divergono
     (misurato con fuori/_diverge.js: col bavaglio, orig e toppa sono
     IDENTICI AL BIT per 90 s, sia a simulazione pura sia col disegno). */
  await pag.addInitScript(() => { window.requestIdleCallback = () => 0; window.cancelIdleCallback = () => {}; });
  await pag.goto(url, { waitUntil: 'load' });

  /* avvio: stessa liturgia di _posa.js (la taglia in GIOCATORI, mai 1/2/3) */
  await pag.evaluate(() => window.__banco.passo(30));
  await pag.evaluate(([n, sec]) => {
    window.__test.dismissSplash && window.__test.dismissSplash();
    window.__test.startMatch(1, 1, { size: n });
    window.__test.Tut && window.__test.Tut.finish && window.__test.Tut.finish(true);
    window.__test.setCpuVsCpu(true);
    /* cronometro largo: la partita non deve finire sotto la misura */
    window.__test.setTimeLeft(sec + 30);
  }, [N, SEC]);

  /* il registratore: avvolge drawPlayer e legge i giunti DISEGNATI */
  await pag.evaluate(() => {
    const CE = Rig3D.CAMERE.alto.ce;
    const R = {
      frame: 0, nS: 0, nC: 0, nA: 0,
      binS: new Float64Array(1501), binC: new Float64Array(1501), binA: new Float64Array(1501),
      cambiAndatura: 0, gkFlick: 0, cambi: 0, campioni: 0, coppie: {},
    };
    const prev = new Map();
    let conta = 0;
    const dis0 = Rig3D.disegna;
    Rig3D.disegna = function () { conta++; return dis0.apply(this, arguments); };
    const dp0 = drawPlayer;
    window.drawPlayer = function (p) {
      const prima = conta;
      dp0(p);
      if (conta === prima || !p.poseClip) return;   // figura non disegnata
      const gi = Rig3D.giunti();
      const s = (RIG_H / (p.squash || 1)) / (1.9 * CE);  // unita' di mondo per metro
      const k = p.team * 32 + p.idx;
      let r = prev.get(k);
      if (!r) { r = { f: -9, clip: '', x: new Float32Array(gi.n), y: new Float32Array(gi.n) }; prev.set(k, r); }
      const cy = p.y + RIG_PIEDI;
      const cont = (r.f === R.frame - 1);
      let peggio = 0;
      for (let j = 0; j < gi.n; j++) {
        const x = (gi.x[j] - p.x) / s, y = (gi.y[j] - cy) / s;
        if (cont) { const dx = x - r.x[j], dy = y - r.y[j]; const d2 = dx * dx + dy * dy; if (d2 > peggio) peggio = d2; }
        r.x[j] = x; r.y[j] = y;
      }
      if (cont) {
        const d = Math.sqrt(peggio);
        let b = Math.round(d * 500); if (b > 1500) b = 1500;
        if (p.poseClip !== r.clip) {
          R.binC[b]++; R.nC++; R.cambi++;
          const cp = r.clip + '>' + p.poseClip; R.coppie[cp] = (R.coppie[cp] | 0) + 1;
          const loco = (r.clip === 'camminata' && p.poseClip === 'corsa') || (r.clip === 'corsa' && p.poseClip === 'camminata');
          if (loco) { R.cambiAndatura++; R.binA[b]++; R.nA++; }
          if (p.role === 'gk' && ((r.clip === 'attesaGK' && p.poseClip === 'camminata') || (r.clip === 'camminata' && p.poseClip === 'attesaGK'))) R.gkFlick++;
        } else { R.binS[b]++; R.nS++; }
        R.campioni++;
      }
      r.f = R.frame; r.clip = p.poseClip;
    };
    window.__fusRec = R;
  });

  /* la partita, un fotogramma alla volta: simula 1/60 e DISEGNA */
  const frames = Math.round(SEC * 60);
  const lotto = 60;
  for (let f = 0; f < frames; f += lotto) {
    const n = Math.min(lotto, frames - f);
    const st = await pag.evaluate((m) => {
      for (let i = 0; i < m; i++) { window.__test.simulate(1 / 60); window.__fusRec.frame++; window.__test.disegna(); }
      return window.__test.G.scene;
    }, n);
    if (st === 'end' || st === 'menu') { console.error('ATTENZIONE: scena ' + st + ' al fotogramma ' + (f + n)); break; }
    if ((f + n) % 1800 === 0) process.stderr.write('  ...' + ((f + n) / 60) + ' s\n');
  }

  const R = await pag.evaluate(() => {
    const R = window.__fusRec;
    return {
      frame: R.frame, nS: R.nS, nC: R.nC, nA: R.nA,
      binS: Array.from(R.binS), binC: Array.from(R.binC), binA: Array.from(R.binA),
      cambiAndatura: R.cambiAndatura, gkFlick: R.gkFlick, cambi: R.cambi, campioni: R.campioni,
      coppie: R.coppie,
      score: [window.__test.G.score[0], window.__test.G.score[1]],
      sorteggi: window.__quanti ? window.__quanti() : -1,
    };
  });
  await browser.close(); srv.chiudi();

  const secMis = R.frame / 60;
  const per90 = x => x * 90 / secMis;
  const medS = quantile(R.binS, R.nS, 0.5), p95S = quantile(R.binS, R.nS, 0.95);
  const medC = quantile(R.binC, R.nC, 0.5), p95C = quantile(R.binC, R.nC, 0.95);
  const medA = quantile(R.binA, R.nA, 0.5);
  const rapporto = medC / medS;

  const v1 = medC <= 3 * medS;
  const v2 = per90(R.cambiAndatura) < 200;
  const v3 = medA < 0.15;
  const cieco = R.nC < 50;

  const esito = {
    gioco: path.relative(RADICE, GIOCO), taglia: N, secondi: +secMis.toFixed(1),
    campioni: R.campioni, cambiClip: R.nC,
    saltoStesso: { med: +medS.toFixed(3), p95: +p95S.toFixed(3), n: R.nS },
    saltoCambio: { med: +medC.toFixed(3), p95: +p95C.toFixed(3), n: R.nC },
    rapportoMediane: +rapporto.toFixed(2),
    cambiAndaturaPer90: +per90(R.cambiAndatura).toFixed(0),
    saltoAndaturaMed: R.nA ? +medA.toFixed(3) : null,
    gkFlickPer90: +per90(R.gkFlick).toFixed(0),
    score: R.score, sorteggi: R.sorteggi,
    coppiePiuFrequenti: Object.entries(R.coppie).sort((a, b) => b[1] - a[1]).slice(0, 8),
    V1_rapporto_max3x: v1, V2_cambi_andatura_sotto200: v2, V3_salto_andatura_sotto015: v3,
  };
  if (ha('json')) console.log(JSON.stringify(esito, null, 1));
  else {
    console.log('CANCELLO fusione — ' + esito.gioco + '  taglia ' + N + '  ' + esito.secondi + ' s misurati');
    console.log('  salto giunto peggiore (m schermo): clip INVARIATA med ' + esito.saltoStesso.med + '  p95 ' + esito.saltoStesso.p95 + '  (n=' + R.nS + ')');
    console.log('                                     clip CAMBIATA  med ' + esito.saltoCambio.med + '  p95 ' + esito.saltoCambio.p95 + '  (n=' + R.nC + ')');
    console.log('  rapporto mediane cambiata/invariata: ' + esito.rapportoMediane + 'x   (soglia <= 3x)      -> ' + (v1 ? 'VERDE' : 'ROSSO'));
    console.log('  cambi camminata<->corsa per 90 s: ' + esito.cambiAndaturaPer90 + '   (soglia < 200)          -> ' + (v2 ? 'VERDE' : 'ROSSO'));
    console.log('  salto mediano su quei cambi: ' + esito.saltoAndaturaMed + ' m   (soglia < 0,15)          -> ' + (v3 ? 'VERDE' : 'ROSSO'));
    console.log('  sfarfallio portiere attesa<->camminata per 90 s: ' + esito.gkFlickPer90);
    console.log('  coppie di cambio piu frequenti: ' + esito.coppiePiuFrequenti.map(c => c[0] + ' x' + c[1]).join('  '));
    console.log('  (score ' + R.score.join('-') + ', sorteggi ' + R.sorteggi + ': devono coincidere fra i due file a pari seme)');
  }
  if (cieco) { console.error('CIECO: solo ' + R.nC + ' cambi di clip osservati (<50), nessun verdetto.'); process.exit(2); }
  process.exit(v1 && v2 && v3 ? 0 : 1);
})().catch(e => { console.error('FALLITO: ' + (e && e.message || e)); process.exit(1); });
