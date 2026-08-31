/* =====================================================================
   _crit-anim-scatti.js — I PIXEL DEL RITARDO D'ANDATURA.

   La simulazione dei due file e' identica al bit (stesso punteggio,
   stessi sorteggi): allo STESSO numero di fotogramma i giocatori stanno
   negli stessi punti. Quindi si puo' fotografare la stessa figura nello
   stesso istante nei due file e mettere i due ritagli uno accanto
   all'altro.

   PASSO 1 (--caccia): cerca gli episodi in cui la posa disegnata e' in
   disaccordo con la velocita' vera, e stampa (fotogramma, squadra,
   indice, v, clip) dei peggiori.
   PASSO 2 (--scatto --f N --team T --idx I): avanza fino al fotogramma
   N, ritaglia la figura e scrive un PNG.

   uso:
     node strumenti/_crit-anim-scatti.js --caccia --gioco fuori/x.html
     node strumenti/_crit-anim-scatti.js --scatto --gioco fuori/x.html \
          --f 1234 --team 0 --idx 3 --png fuori/_c.png
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
const N = +arg('taglia', 5);
const SEME = +arg('seme', 20260820);

(async () => {
  const { chromium } = require('playwright');
  const srv = await servi();
  const rel = path.relative(RADICE, GIOCO).split(path.sep).join('/');
  const url = 'http://127.0.0.1:' + srv.porta + '/' + rel + '?q=' + Date.now();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2 });
  const pag = await ctx.newPage();
  await pag.addInitScript(bancoDiProva);
  await pag.addInitScript(semeFisso, SEME);
  await pag.addInitScript(() => { window.requestIdleCallback = () => 0; window.cancelIdleCallback = () => {}; });
  await pag.goto(url, { waitUntil: 'load' });
  await pag.evaluate(() => window.__banco.passo(30));
  await pag.evaluate((n) => {
    window.__test.dismissSplash && window.__test.dismissSplash();
    window.__test.startMatch(1, 1, { size: n });
    window.__test.Tut && window.__test.Tut.finish && window.__test.Tut.finish(true);
    window.__test.setCpuVsCpu(true);
    window.__test.setTimeLeft(200);
  }, N);

  if (ha('caccia')) {
    await pag.evaluate(() => {
      const R = { frame: 0, ep: [], apert: new Map() };
      let conta = 0;
      const dis0 = Rig3D.disegna;
      Rig3D.disegna = function () { conta++; return dis0.apply(this, arguments); };
      const dp0 = drawPlayer;
      window.drawPlayer = function (p) {
        const prima = conta; dp0(p);
        if (conta === prima || !p.poseClip || p.lodPosa) return;
        const c = p.poseClip;
        const v = Math.sqrt((p.vx || 0) ** 2 + (p.vy || 0) ** 2);
        const male = (v < 6 && (c === 'camminata' || c === 'corsa')) ? 'B' :
                     (v >= 70 && c !== 'corsa' && (c === 'fermo' || c === 'attesaGK' || c === 'camminata')) ? 'A' : '';
        const k = p.team + ':' + p.idx;
        const ap = R.apert.get(k);
        if (male) {
          if (!ap || ap.tipo !== male) R.apert.set(k, { tipo: male, f0: R.frame, n: 1, vmax: v, vmin: v, clip: c, team: p.team, idx: p.idx });
          else { ap.n++; if (v > ap.vmax) ap.vmax = v; if (v < ap.vmin) ap.vmin = v; }
        } else if (ap) { R.ep.push(ap); R.apert.delete(k); }
      };
      window.__cacRec = R;
    });
    for (let f = 0; f < 5400; f += 60) {
      await pag.evaluate(() => { for (let i = 0; i < 60; i++) { window.__test.simulate(1 / 60); window.__cacRec.frame++; window.__test.disegna(); } });
    }
    const ep = await pag.evaluate(() => window.__cacRec.ep.map(e => ({ ...e })));
    await browser.close(); srv.chiudi();
    const ord = ep.filter(e => e.n >= 6).sort((a, b) => b.n - a.n);
    console.log('episodi di disaccordo posa/velocita (>=0,1 s), i 14 piu lunghi:');
    for (const e of ord.slice(0, 14))
      console.log(`  ${e.tipo}  f${e.f0}..${e.f0 + e.n - 1} (${(e.n / 60).toFixed(2)} s)  sq${e.team} n${e.idx}  clip ${e.clip}  v ${e.vmin.toFixed(0)}..${e.vmax.toFixed(0)} u/s`);
    console.log('totale episodi >=0,1 s: ' + ord.length);
    return;
  }

  /* --- lo scatto --- */
  const F = +arg('f', 600), TEAM = +arg('team', 0), IDX = +arg('idx', 0);
  const OUT = path.resolve(arg('png', path.join(RADICE, 'fuori', '_crit-scatto.png')));
  for (let f = 0; f < F; f += 60) {
    const n = Math.min(60, F - f);
    await pag.evaluate((m) => { for (let i = 0; i < m; i++) { window.__test.simulate(1 / 60); window.__test.disegna(); } }, n);
  }
  const info = await pag.evaluate(([t, i]) => {
    /* IL PUNTO SULLO SCHERMO SI PRENDE DAL DISEGNO, non da una formula
       ricostruita: si aggancia drawPlayer, si legge la matrice del
       contesto nel momento esatto in cui la figura viene dipinta e la si
       applica a (p.x, p.y). Poi si passa da pixel di tela a pixel CSS
       col rapporto fra canvas.width e la sua larghezza in pagina. */
    let got = null;
    const dp0 = window.drawPlayer;
    window.drawPlayer = function (p) {
      if (p.team === t && p.idx === i) {
        const m = ctx.getTransform();
        const v = Math.sqrt((p.vx || 0) ** 2 + (p.vy || 0) ** 2);
        got = { mx: m.a * p.x + m.c * p.y + m.e, my: m.b * p.x + m.d * p.y + m.f,
                sc: Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)),
                clip: p.poseClip, u: +(p.poseU || 0).toFixed(3), v: +v.toFixed(1) };
      }
      return dp0(p);
    };
    window.__test.disegna();
    window.drawPlayer = dp0;
    if (!got) return null;
    const cv = document.querySelector('canvas');
    const r = cv.getBoundingClientRect();
    const k = r.width / cv.width;
    return { ...got, cssx: r.left + got.mx * k, cssy: r.top + got.my * k, kk: k };
  }, [TEAM, IDX]);
  if (!info) { console.error('figura non trovata'); await browser.close(); srv.chiudi(); process.exit(1); }
  const R = (+arg('r', 34)) * info.sc * info.kk;
  const clip = { x: Math.max(0, Math.round(info.cssx - R)), y: Math.max(0, Math.round(info.cssy - R * 1.35)),
                 width: Math.round(R * 2), height: Math.round(R * 2) };
  if (ha('pieno')) await pag.screenshot({ path: OUT });
  else await pag.screenshot({ path: OUT, clip });
  console.log(`${path.basename(GIOCO)}  f${F} sq${TEAM} n${IDX}: clip=${info.clip} u=${info.u} v=${info.v} u/s  ->  ${OUT}`);
  await browser.close(); srv.chiudi();
})().catch(e => { console.error('FALLITO: ' + (e && e.message || e)); process.exit(1); });
