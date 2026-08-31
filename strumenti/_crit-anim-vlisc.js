/* _crit-anim-vlisc.js — perche' la figura ferma resta in corsa.
   Stampa, fotogramma per fotogramma attorno a un istante, la velocita'
   VERA, p.vLisc, p.rigAnda e la clip DISEGNATA di una figura. */
const path = require('path');
const { servi, bancoDiProva, semeFisso } = require('./_posa.js');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'CALCETTO-il-gioco.html')));
const F0 = +arg('da', 860), F1 = +arg('a', 950), TEAM = +arg('team', 1), IDX = +arg('idx', 1);

(async () => {
  const { chromium } = require('playwright');
  const srv = await servi();
  const rel = path.relative(RADICE, GIOCO).split(path.sep).join('/');
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: +arg('w',915), height: +arg('h',412) }, deviceScaleFactor: 2 });
  const pag = await ctx.newPage();
  await pag.addInitScript(bancoDiProva);
  await pag.addInitScript(semeFisso, 20260820);
  await pag.addInitScript(() => { window.requestIdleCallback = () => 0; window.cancelIdleCallback = () => {}; });
  await pag.goto('http://127.0.0.1:' + srv.porta + '/' + rel + '?q=' + Date.now(), { waitUntil: 'load' });
  await pag.evaluate(() => window.__banco.passo(30));
  await pag.evaluate(() => {
    window.__test.dismissSplash && window.__test.dismissSplash();
    window.__test.startMatch(1, 1, { size: 5 });
    window.__test.Tut && window.__test.Tut.finish && window.__test.Tut.finish(true);
    window.__test.setCpuVsCpu(true); window.__test.setTimeLeft(200);
  });
  const righe = await pag.evaluate(([f0, f1, t, i]) => {
    const out = [];
    for (let f = 0; f < f1; f++) {
      window.__test.simulate(1 / 60); window.__test.disegna();
      if (f < f0) continue;
      const p = window.__test.G.players.find(q => q.team === t && q.idx === i);
      const v = Math.sqrt((p.vx || 0) ** 2 + (p.vy || 0) ** 2);
      out.push([f, +v.toFixed(1), p.vLisc === undefined ? null : +p.vLisc.toFixed(1),
                p.rigAnda === undefined ? null : p.rigAnda, p.poseClip, +(p.poseU || 0).toFixed(3),
                p.out, window.__test.G.scene, !!window.__test.G.kickoff]);
    }
    return out;
  }, [F0, F1, TEAM, IDX]);
  await browser.close(); srv.chiudi();
  console.log('f      v     vLisc  anda  clip        u      out  scena   kickoff');
  let prec = '';
  for (const r of righe) {
    const s = `${String(r[0]).padEnd(6)}${String(r[1]).padEnd(6)}${String(r[2]).padEnd(7)}${String(r[3]).padEnd(6)}${String(r[4]).padEnd(12)}${String(r[5]).padEnd(7)}${String(r[6]).padEnd(5)}${String(r[7]).padEnd(8)}${r[8]}`;
    if (s.slice(6) !== prec) console.log(s);
    prec = s.slice(6);
  }
})().catch(e => { console.error('FALLITO: ' + (e && e.message || e)); process.exit(1); });
