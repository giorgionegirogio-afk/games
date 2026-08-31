/* =====================================================================
   _g-fondute.js — SOLA MISURA. QUANTE VALUTAZIONI DI POSA IN PIU' COSTA
   LA FUSIONE, contate e non stimate.

   La fusione fra due clip paga UNA valutazione di posa in piu' per ogni
   figura che sta transitando, e la paga due volte (l'ombra di posa e il
   corpo). Il costo non e' "il doppio": e' il doppio SOLO sulle figure in
   transizione, e questo banco misura quante sono davvero, giocando una
   partita vera.

   Che cosa conta, per 90 s di gioco a passo fisso 1/60:
     · quante valutazioni di posa fa il gioco (Rig3D.disegna + ombraTraccia)
     · quante di quelle sono RADDOPPIATE dalla fusione (Rig3D.fondi)
   La percentuale fra le due e' il sovrapprezzo della cura sulla parte di
   posa del rig — non su tutto il fotogramma, che contiene anche manto,
   palla, ombre portate e interfaccia.

   NON TOCCA IL GIOCO: avvolge tre funzioni esportate e conta. Non pesca
   un solo numero casuale, e lo si verifica confrontando il conto dei
   sorteggi con quello del cancello (_q-fusione.js) a pari seme.

   Su un gioco SENZA la fusione (Rig3D.fondi non esiste) stampa 0 fondute
   su N: e' il suo controllo negativo, e va eseguito.

   uso: node strumenti/_g-fondute.js --gioco <file> [--taglia 5] [--sec 90]
                                     [--seme 20260820]
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

if (!fs.existsSync(GIOCO)) { console.error('FALLITO: non esiste ' + GIOCO); process.exit(1); }

(async () => {
  const { chromium } = require('playwright');
  const srv = await servi();
  const rel = path.relative(RADICE, GIOCO).split(path.sep).join('/');
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 576, height: 273 }, deviceScaleFactor: 2.8125 });
  const pag = await ctx.newPage();
  await pag.addInitScript(bancoDiProva);
  await pag.addInitScript(semeFisso, SEME);
  await pag.addInitScript(() => { window.requestIdleCallback = () => 0; window.cancelIdleCallback = () => {}; });
  await pag.goto('http://127.0.0.1:' + srv.porta + '/' + rel + '?q=' + Date.now(), { waitUntil: 'load' });

  await pag.evaluate(() => window.__banco.passo(30));
  await pag.evaluate(([n, sec]) => {
    window.__test.dismissSplash && window.__test.dismissSplash();
    window.__test.startMatch(1, 1, { size: n });
    window.__test.Tut && window.__test.Tut.finish && window.__test.Tut.finish(true);
    window.__test.setCpuVsCpu(true);
    window.__test.setTimeLeft(sec + 30);
  }, [N, SEC]);

  await pag.evaluate(() => {
    const C = { disegna: 0, ombra: 0, fondi: 0, wsum: 0, istoOsso: new Float64Array(101), nOsso: 0, peggioOsso: 0, chi: '' };
    const B = Rig3D.banco;
    let armato = null;
    /* l'osso peggiore della posa FUSA che e' appena stata disegnata:
       Rig3D.banco.P e' lo scratch della posa locale, e dopo disegna()
       contiene la miscela. Si ricalcolano le sedici ossa con lo stesso
       OSSA della gabbia del gioco: l'accorciamento e' (d-L)/L. */
    function peggioOsso() {
      const P = B.P; let peggio = 0, chi = '';
      for (let i = 0; i < B.OSSA.length; i++) {
        const o = B.OSSA[i];
        const dx = P[o.a * 3] - P[o.b * 3], dy = P[o.a * 3 + 1] - P[o.b * 3 + 1], dz = P[o.a * 3 + 2] - P[o.b * 3 + 2];
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz), L = o.f();
        const sc = (d - L) / L;
        if (Math.abs(sc) > Math.abs(peggio)) { peggio = sc; chi = o.n; }
      }
      return { sc: peggio, osso: chi };
    }
    const d0 = Rig3D.disegna;
    Rig3D.disegna = function (ctx, cx, cy, hPx, yaw, cam, nomeClip) {
      C.disegna++;
      const a = armato; armato = null;
      const r = d0.apply(this, arguments);
      if (a) {
        const e = peggioOsso();
        const perc = -e.sc * 100;
        let b = Math.round(perc); if (b < 0) b = 0; if (b > 100) b = 100;
        C.istoOsso[b]++; C.nOsso++;
        if (perc > C.peggioOsso) { C.peggioOsso = perc; C.chi = a + '>' + nomeClip + ' ' + e.osso; }
      }
      return r;
    };
    const o0 = Rig3D.ombraTraccia; Rig3D.ombraTraccia = function () { C.ombra++; armato = null; return o0.apply(this, arguments); };
    if (Rig3D.fondi) { const f0 = Rig3D.fondi; Rig3D.fondi = function (c, u, w) { C.fondi++; C.wsum += w; armato = c; return f0.apply(this, arguments); }; }
    window.__fond = C;
  });

  const frames = Math.round(SEC * 60);
  for (let f = 0; f < frames; f += 60) {
    const n = Math.min(60, frames - f);
    const st = await pag.evaluate((m) => {
      for (let i = 0; i < m; i++) { window.__test.simulate(1 / 60); window.__test.disegna(); }
      return window.__test.G.scene;
    }, n);
    if (st === 'end' || st === 'menu') { console.error('ATTENZIONE: scena ' + st); break; }
  }

  const R = await pag.evaluate(() => {
    const C = window.__fond;
    return {
      disegna: C.disegna, ombra: C.ombra, fondi: C.fondi, wsum: C.wsum,
      istoOsso: Array.from(C.istoOsso), nOsso: C.nOsso, peggioOsso: C.peggioOsso, chi: C.chi,
      score: [window.__test.G.score[0], window.__test.G.score[1]],
      sorteggi: window.__quanti ? window.__quanti() : -1,
      clip: Object.keys(Rig3D.CLIPS).length,
    };
  });
  await browser.close(); srv.chiudi();

  const q = (bins, n, p) => { if (!n) return NaN; let c = 0; for (let i = 0; i < bins.length; i++) { c += bins[i]; if (c >= p * n) return i; } return bins.length - 1; };
  const base = R.disegna + R.ombra;
  console.log('FONDUTE — ' + path.relative(RADICE, GIOCO) + '  taglia ' + N + '  ' + SEC + ' s  seme ' + SEME);
  console.log('  valutazioni di posa del gioco: ' + base + '   (corpi ' + R.disegna + ' + ombre di posa ' + R.ombra + ')');
  console.log('  valutazioni RADDOPPIATE dalla fusione: ' + R.fondi +
              '   = ' + (100 * R.fondi / base).toFixed(2) + '% in piu\' sulla parte di posa');
  console.log('  peso medio della miscela w: ' + (R.fondi ? (R.wsum / R.fondi).toFixed(3) : '—'));
  if (R.nOsso) {
    console.log('  OSSO PIU\' ACCORCIATO dalla miscela, sui ' + R.nOsso + ' corpi fusi davvero disegnati:');
    console.log('    mediana -' + q(R.istoOsso, R.nOsso, 0.5) + '%   p90 -' + q(R.istoOsso, R.nOsso, 0.9) +
                '%   p99 -' + q(R.istoOsso, R.nOsso, 0.99) + '%   peggiore -' + R.peggioOsso.toFixed(1) + '%  [' + R.chi + ']');
  }
  console.log('  clip nel registro: ' + R.clip + ' — score ' + R.score.join('-') + ', sorteggi ' + R.sorteggi);
})().catch(e => { console.error('FALLITO: ' + (e && e.message || e)); process.exit(1); });
