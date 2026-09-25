/* =====================================================================
   _156-impatto.js — DOVE CADE L'IMPATTO, clip per clip.

   PERCHE' ESISTE: la colonna IMPATTO del fascicolo (provino, vista
   'ombra') deve pescare la fase in cui il corpo TOCCA, non una vicina.
   La fase la decide la tabella IMP dentro il rig, che si costruisce dai
   sedici campioni della posa: chiederla e' l'unico modo di non
   scriverla a mano e vederla divergere il giorno che una clip cambia.

   Stampa, per ogni clip che stacca da terra, la fase di picco e il
   valore dell'impatto sulle sedici fasi. NON E' UN CANCELLO.
   Uscite: 0 ha misurato, 2 il banco non ha aperto il gioco.

   USO: node strumenti/_156-impatto.js [--gioco fuori/p1.html]
   ===================================================================== */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i+1] && !process.argv[i+1].startsWith('--') ? process.argv[i+1] : d; };
const PORTA = arg('porta', '8777');
const GIOCO = arg('gioco', 'CALCETTO-il-gioco.html');
if (!fs.existsSync(path.join(path.resolve(__dirname, '..'), GIOCO))) {
  console.error('PROVA NULLA: il file non esiste: ' + GIOCO); process.exit(3);
}
(async () => {
  let br;
  try { br = await chromium.launch(); }
  catch (e) { console.error('[156-impatto] BANCO: playwright non parte: ' + e.message); process.exit(2); }
  const pg = await br.newPage();
  try {
    await pg.goto('http://127.0.0.1:' + PORTA + '/' + GIOCO + '?provino&t=' + Date.now());
    await pg.waitForFunction('typeof Rig3D==="object"', { timeout: 45000 });
  } catch (e) {
    console.error('[156-impatto] BANCO: il gioco non si e\' aperto: ' + e.message);
    await br.close(); process.exit(2);
  }
  const out = await pg.evaluate(() => {
    if (typeof Rig3D.impatto !== 'function') return null;
    const R = [];
    for (const k in Rig3D.CLIPS) {
      const f = Rig3D.CLIPS[k].freq;
      const v = [], a = [];
      for (let i = 0; i < 64; i++) {
        const u = i / 64;
        v.push(+Rig3D.impatto(k, u / f).toFixed(3));
        a.push(+Rig3D.quotaAria(k, u / f).toFixed(3));
      }
      const mx = Math.max.apply(null, v);
      if (mx <= 0) continue;
      R.push({ clip: k, picco: mx, fase: v.indexOf(mx) / 64, aria: Math.max.apply(null, a),
               serie: v.filter((x, i) => i % 2 === 0) });
    }
    return R;
  });
  if (!out) { console.log('[156-impatto] questo file non ha Rig3D.impatto'); await br.close(); process.exit(0); }
  console.log('[156-impatto] file: ' + GIOCO);
  for (const r of out) {
    console.log('  ' + r.clip.padEnd(12) + ' picco ' + r.picco.toFixed(2)
              + ' alla fase ' + r.fase.toFixed(4) + '  (stacco massimo ' + r.aria.toFixed(3) + ' m)');
  }
  await br.close();
  process.exit(0);
})();
