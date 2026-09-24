/* =====================================================================
   _sonda-152-gesto.js — QUANTO SI MUOVE OGNI CLIP (voce #152)

   Legge le ventinove clip del rig attraverso l'API di banco che il gioco
   espone gia' (Rig3D.banco.posa + Rig3D.banco.P) e misura, per ciascuna:

     · CAMMINO      la somma delle distanze percorse da tutti e diciotto i
                    giunti lungo il ciclo, in metri. E' «quanto si muove»
                    e non «quanto e' ampia»: una posa che va e torna conta
                    due volte, una che resta ferma conta zero.
     · PICCO        la velocita' massima di un giunto qualsiasi, in metri
                    per unita' di fase. Un gesto ha un istante; un ciclo no.
     · ESCURSIONE   la distanza massima fra due pose dello stesso giunto.

   Serve a rispondere a una domanda sola, e prima di toccare qualcosa:
   DOVE il movimento e' povero. Non e' un cancello e non da' verdetti.

   uso:  node strumenti/_sonda-152-gesto.js [--passi 240]
   ===================================================================== */
'use strict';
const path = require('path');
const { servi, bancoDiProva, semeFisso } = require('./_posa.js');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const PASSI = +arg('passi', 240);
const GIOCO = arg('gioco', process.env.GIOCO_PROVA || 'CALCETTO-il-gioco.html');

(async () => {
  const { chromium } = require('playwright');
  const srv = await servi();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 } });
  const pag = await ctx.newPage();
  await pag.addInitScript(bancoDiProva);
  await pag.addInitScript(semeFisso, 20260924);
  const rel = path.relative(RADICE, path.resolve(RADICE, GIOCO)).split(path.sep).join('/');
  await pag.goto('http://127.0.0.1:' + srv.porta + '/' + rel + '?q=' + Date.now(), { waitUntil: 'load' });
  await pag.evaluate(() => window.__banco.passo(10));

  const dati = await pag.evaluate((passi) => {
    const B = Rig3D.banco, NJ = B.NJ;
    B.corpora(3, 0);
    const fuori = [];
    for (const nome of Object.keys(Rig3D.CLIPS)) {
      const pos = [];
      for (let k = 0; k <= passi; k++) {
        B.posa(nome, k / passi);
        pos.push(Array.from(B.P.slice(0, NJ * 3)));
      }
      let cammino = 0, picco = 0, picF = 0;
      for (let k = 1; k <= passi; k++) {
        let vmax = 0;
        for (let j = 0; j < NJ; j++) {
          const dx = pos[k][j * 3] - pos[k - 1][j * 3];
          const dy = pos[k][j * 3 + 1] - pos[k - 1][j * 3 + 1];
          const dz = pos[k][j * 3 + 2] - pos[k - 1][j * 3 + 2];
          const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
          cammino += d;
          if (d > vmax) vmax = d;
        }
        if (vmax > picco) { picco = vmax; picF = k / passi; }
      }
      /* l'escursione: per ogni giunto, la distanza fra la posa piu'
         lontana e quella di partenza; si tiene la massima */
      let esc = 0, chi = -1;
      for (let j = 0; j < NJ; j++) {
        let m = 0;
        for (let k = 0; k <= passi; k++) {
          const dx = pos[k][j * 3] - pos[0][j * 3];
          const dy = pos[k][j * 3 + 1] - pos[0][j * 3 + 1];
          const dz = pos[k][j * 3 + 2] - pos[0][j * 3 + 2];
          const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (d > m) m = d;
        }
        if (m > esc) { esc = m; chi = j; }
      }
      fuori.push({ nome, cammino, picco: picco * passi, picF, esc, chi });
    }
    return fuori;
  }, PASSI);

  await browser.close(); srv.chiudi();
  dati.sort((a, b) => a.cammino - b.cammino);
  console.log('=== _sonda-152-gesto — quanto si muove ogni clip (' + PASSI + ' passi) ===');
  console.log('  clip            cammino(m)  picco(m/fase)  fase del picco  escursione(m)');
  for (const d of dati) {
    console.log('  ' + d.nome.padEnd(14) + d.cammino.toFixed(3).padStart(9) +
                d.picco.toFixed(2).padStart(14) + d.picF.toFixed(3).padStart(15) +
                d.esc.toFixed(3).padStart(14));
  }
})().catch(e => { console.error('SONDA ESPLOSA: ' + (e && e.stack || e)); process.exit(2); });
