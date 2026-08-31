/* =====================================================================
   _g-costo-fusione.js — SOLA MISURA. QUANTO COSTA UNA POSA FUSA, in
   millisecondi, sullo stesso banco di strumenti/_g-costo.js.

   La fusione paga, per ogni figura in transizione, una seconda
   valutazione di posa, una miscela di 54 float e l'irrigidimento dello
   scheletro. Questo banco misura quel sovrapprezzo direttamente: la
   STESSA scena — 22 figure x 600 fotogrammi a 30 px in camera 'alto',
   il protocollo di _g-costo.js — disegnata due volte, una senza fusione
   dichiarata e una con la fusione dichiarata su OGNI figura.

   IL PANINO. I due modi si alternano A-B-B-A dentro ogni giro e la
   differenza si calcola DENTRO il giro: una deriva lineare del banco si
   cancella. Si stampa la mediana delle differenze, e anche la loro
   escursione: se quell'intervallo scavalca lo zero, la differenza non e'
   provata.

   LA TRAPPOLA DEL CRONOMETRO, gia' pagata da _g-costo.js e ripetuta qui
   perche' chi copia questo file ci ricadrebbe: bancoDiProva sostituisce
   performance.now con un orologio a passi fissi, e misurare con quello
   da' ZERO millisecondi per qualunque cosa. L'orologio vero si mette da
   parte in uno addInitScript che gira PRIMA del banco.

   IL NUMERO DA LEGGERE non e' questa differenza: e' questa differenza
   MOLTIPLICATA per la frazione di figure che in partita transitano
   davvero, che la misura strumenti/_g-fondute.js. Qui il 100% delle
   figure e' in transizione, cosa che in partita non succede mai.

   uso: node strumenti/_g-costo-fusione.js --gioco fuori/anim-prima.html
                                           [--giri 7] [--clip corsa]
                                           [--vecchia camminata]
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { servi, bancoDiProva, semeFisso } = require('./_posa.js');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'CALCETTO-il-gioco.html')));
const GIRI = +arg('giri', 7);
const CLIP = arg('clip', 'corsa');
const VECCHIA = arg('vecchia', 'camminata');

if (!fs.existsSync(GIOCO)) { console.error('FALLITO: non esiste ' + GIOCO); process.exit(1); }

(async () => {
  const { chromium } = require('playwright');
  const srv = await servi();
  const rel = path.relative(RADICE, GIOCO).split(path.sep).join('/');
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 576, height: 273 }, deviceScaleFactor: 2.8125 });
  const pag = await ctx.newPage();
  await pag.addInitScript(() => { window.__oraVera = performance.now.bind(performance); });
  await pag.addInitScript(bancoDiProva);
  await pag.addInitScript(semeFisso, 20260829);
  await pag.addInitScript(() => { window.requestIdleCallback = () => 0; window.cancelIdleCallback = () => {}; });
  await pag.goto('http://127.0.0.1:' + srv.porta + '/' + rel + '?q=' + Date.now(), { waitUntil: 'load' });
  await pag.evaluate(() => window.__banco.passo(30));

  const R = await pag.evaluate(({ giri, CLIP, VECCHIA }) => {
    if (!Rig3D.fondi) return { cieco: 'questo gioco non ha Rig3D.fondi' };
    const cv = document.createElement('canvas'); cv.width = 300; cv.height = 300;
    const g = cv.getContext('2d');
    const lk = Rig3D.lookPredefinito;
    function unGiro(conFusione) {
      const t0 = window.__oraVera();
      for (let f = 0; f < 600; f++) {
        g.clearRect(0, 0, 300, 300);
        for (let i = 0; i < 22; i++) {
          if (conFusione) Rig3D.fondi(VECCHIA, (f * 0.017 + i * 0.13) % 1, 0.5);
          Rig3D.disegna(g, 30 + (i % 6) * 48, 60 + ((i / 6) | 0) * 60, 30, i * 0.6, 'alto', CLIP, f / 60 + i * 0.13, lk);
        }
      }
      return (window.__oraVera() - t0) / 600;
    }
    unGiro(false); unGiro(true); unGiro(false);   // riscaldamento
    const dif = [], A = [], B = [];
    for (let k = 0; k < giri; k++) {
      /* panino A-B-B-A (e a giri alterni B-A-A-B) */
      let a1, b1, b2, a2;
      if (k % 2 === 0) { a1 = unGiro(false); b1 = unGiro(true); b2 = unGiro(true); a2 = unGiro(false); }
      else { b1 = unGiro(true); a1 = unGiro(false); a2 = unGiro(false); b2 = unGiro(true); }
      const a = (a1 + a2) / 2, b = (b1 + b2) / 2;
      A.push(a); B.push(b); dif.push(b - a);
    }
    const med = v => { const s = v.slice().sort((x, y) => x - y); return s[(s.length / 2) | 0]; };
    const qq = (v, p) => { const s = v.slice().sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
    return { A: med(A), B: med(B), dif: med(dif), min: Math.min(...dif), max: Math.max(...dif),
             q25: qq(dif, 0.25), q75: qq(dif, 0.75), positivi: dif.filter(x => x > 0).length, giri };
  }, { giri: GIRI, CLIP, VECCHIA });

  await br.close(); srv.chiudi();
  if (R.cieco) { console.error('CIECO: ' + R.cieco); process.exit(2); }

  console.log('COSTO DELLA POSA FUSA — ' + path.relative(RADICE, GIOCO) +
              '   clip ' + CLIP + ' fusa con ' + VECCHIA + ' a w=0,5');
  console.log('  22 figure x 600 fotogrammi a 30 px, camera alto, ' + R.giri + ' panini A-B-B-A');
  console.log('  senza fusione .......... ' + R.A.toFixed(3) + ' ms/fotogramma');
  console.log('  con fusione su TUTTE ... ' + R.B.toFixed(3) + ' ms/fotogramma');
  console.log('  differenza ............. ' + (R.dif >= 0 ? '+' : '') + R.dif.toFixed(3) + ' ms  (' +
              (100 * R.dif / R.A).toFixed(1) + '%)');
  console.log('    q25..q75 dei panini ' + R.q25.toFixed(3) + '..' + R.q75.toFixed(3) +
              '   escursione ' + R.min.toFixed(3) + '..' + R.max.toFixed(3) +
              '   panini col segno giusto: ' + R.positivi + ' su ' + R.giri);
  if (R.min * R.max <= 0)
    console.log('    (l\'escursione scavalca lo zero: e\' il rumore del banco. Il verdetto lo da\' il');
  if (R.min * R.max <= 0)
    console.log('     SEGNO su ' + R.giri + ' panini appaiati, non l\'estremo di un giro solo.)');
  console.log('  in partita solo una frazione delle figure transita: moltiplicare per');
  console.log('  la percentuale che stampa  node strumenti/_g-fondute.js');
})().catch(e => { console.error('FALLITO: ' + (e && e.message || e)); process.exit(1); });
