/* c3-sorteggi.js — CRITICO 3
   1. conta i dado() A RUNTIME (SEME.n) duello per duello, CPU e tastiera
   2. verifica che senza mira i due file diano la STESSA sequenza di esiti
      su tutte e tre le difficolta' e con portiere umano
   3. verifica che `mirato` si azzeri fra un duello e l'altro
   uso: node c3-sorteggi.js <file.html relativo alla radice, opz.>
*/
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = 'C:\\Users\\Utenteee\\Desktop\\GitHub\\games';
const PROVA = process.argv[2] ? path.resolve(RADICE, process.argv[2]) : '';
const SEME = 20260803;

function servi(prova) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (prova && /CALCETTO-il-gioco\.html$/i.test(f)) f = prova;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

(async () => {
  const srv = await servi(PROVA);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push('ECCEZIONE: ' + e.message));
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);

  const out = await pag.evaluate((SEME) => {
    const t = window.__test;
    t.dismissSplash && t.dismissSplash();
    if (t.save) t.save.tutorialDone = 1;
    const D = t.Duel;
    const R = {};

    /* ---- A. DUELLI CPU INTERI: esiti + conto dei dado, duello per duello ---- */
    for (const diff of [0, 1, 2]) {
      t.semina(SEME + diff);
      t.startMatch(1, diff, { size: 11 });
      t.setCpuVsCpu(true);
      const esiti = [], costi = [], mirati = [];
      let n0 = t.sorteggi;
      for (let i = 0; i < 300; i++) {
        D.start(i & 1);
        let k = 0;
        while (D.phase !== 'result' && k < 900) { D.update(1 / 60); k++; }
        esiti.push(D.outcome);
        mirati.push(D.mirato === true ? 1 : 0);
        const n1 = t.sorteggi; costi.push(n1 - n0); n0 = n1;
        D.phase = 'off'; D.shown = false;
      }
      R['cpu' + diff] = { esiti: esiti.join(''), dadi: costi.join(','), tot: costi.reduce((a, b) => a + b, 0), mirati: mirati.reduce((a, b) => a + b, 0) };
    }

    /* ---- B. DUELLI DA TASTIERA: Duel.key(A/S/D) + Duel.key(X) ---- */
    /* tiratore umano (squadra 0), portiere CPU e portiere umano */
    for (const diff of [0, 1, 2]) {
      for (const porUm of [false, true]) {
        t.semina(SEME + 100 + diff);
        t.startMatch(1, diff, { size: 11 });
        const esiti = [], costi = [], bande = [], mir = [];
        let n0 = t.sorteggi;
        for (let i = 0; i < 300; i++) {
          D.start(0);
          D.shooterHuman = true; D.keeperHuman = porUm;
          D.key(['KeyA', 'KeyS', 'KeyD'][i % 3]);      // il terzo, dal tasto
          bande.push(+(D.band1 - D.band0).toFixed(5));
          mir.push(D.mirato === true ? 1 : 0);
          /* la barra corre finche' non la fermiamo a un istante fisso */
          let k = 0;
          while (D.phase === 'power' && k < (10 + (i % 37))) { D.update(1 / 60); k++; }
          D.key('KeyX');                                // ferma la barra
          k = 0;
          while (D.phase !== 'result' && k < 900) {
            if (porUm && D.keeperZone < 0 && D.phase === 'wait') D.key(['KeyA', 'KeyS', 'KeyD'][(i * 2) % 3]);
            D.update(1 / 60); k++;
          }
          esiti.push(D.outcome);
          const n1 = t.sorteggi; costi.push(n1 - n0); n0 = n1;
          D.phase = 'off'; D.shown = false;
        }
        R['tast' + diff + (porUm ? 'U' : 'C')] = {
          esiti: esiti.join(''), dadi: costi.join(','),
          tot: costi.reduce((a, b) => a + b, 0),
          bandeUniche: [...new Set(bande)].join('|'),
          mirati: mir.reduce((a, b) => a + b, 0)
        };
      }
    }

    /* ---- C. mirato si azzera fra un duello e l'altro? ---- */
    t.semina(SEME);
    t.startMatch(1, 1, { size: 11 });
    D.start(0); D.shooterHuman = true; D.keeperHuman = false;
    D.pickZone(2, 1.2, 0.24);                    // mira col dito
    const dopoDito = { mirato: D.mirato === true, banda: +(D.band1 - D.band0).toFixed(5) };
    D.phase = 'off';
    D.start(0); D.shooterHuman = true;
    const dopoStart = { mirato: D.mirato === true, banda: +(D.band1 - D.band0).toFixed(5) };
    D.key('KeyA');
    const dopoTasto = { mirato: D.mirato === true, banda: +(D.band1 - D.band0).toFixed(5), aimU: D.aimU, aimV: D.aimV };
    D.phase = 'off';
    R.reset = { dopoDito, dopoStart, dopoTasto };

    /* ---- D. dito seguito da tasto senza rilascio: chi vince? ---- */
    D.start(0); D.shooterHuman = true; D.keeperHuman = false;
    D.dito = 7; D.mira = true; D.aimU = 1.2; D.aimV = 0.24;   // come pointerdown
    D.key('KeyA');                                            // tasto durante la mira
    R.ditoPoiTasto = { mirato: D.mirato === true, banda: +(D.band1 - D.band0).toFixed(5), aimU: D.aimU, aimV: D.aimV, zone: D.zone };
    D.phase = 'off';

    return R;
  }, SEME);

  console.log(JSON.stringify(out, null, 1));
  if (errori.length) console.log('ECCEZIONI: ' + errori.join(' | '));
  await ctx.close(); await browser.close(); srv.chiudi();
})();
