/* =====================================================================
   _sonda-152-fili.js — QUANTO COSTANO I FILI DI VOLUME (voce #152)

   PERCHE' UNA SONDA E NON prestazione.js. Il 24 settembre 2026 il banco
   appaiato ha dichiarato da se' di non poter decidere: «ballo fra
   repliche dello stesso file, da un giro all'altro: 277,1%», e tutti e
   tre i suoi confronti sono usciti «non provati — i giri scavalcano lo
   zero, il segno non e' sicuro». Due corse dello stesso paio di file
   hanno dato +8,1% e +2,9%. Un numero cosi' non si trascrive da nessuna
   parte, e nemmeno si usa per scegliere.

   QUELLO CHE SERVE E' UN CONFRONTO SENZA IL FILE DI MEZZO. Qui i due
   (o tre) modi di disegnare i fili vivono nella STESSA PAGINA, nella
   STESSA partita, sullo STESSO fotogramma: si accende un interruttore,
   si cronometra un blocco di disegni, si spegne, si cronometra di
   nuovo, e si alterna. Non c'e' un secondo caricamento, non c'e' una
   seconda cottura del campo, non c'e' una seconda folla: la differenza
   che resta e' quella dei fili e di nient'altro.

   NON MISURA IL GIOCO, MISURA UNA SCELTA. Il numero buono per il
   verbale resta quello di prestazione.js quando il banco e' fermo;
   questo serve a scegliere fra le tre forme senza aspettare che lo sia.

   uso:  node strumenti/_sonda-152-fili.js [--taglia 5] [--blocchi 12] [--freno 4]
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const { servi, bancoDiProva, semeFisso, posaFerma } = require('./_posa.js');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const TAGLIA = +arg('taglia', 5);
const BLOCCHI = +arg('blocchi', 12);
const PASSI = +arg('passi', 30);
const FRENO = +arg('freno', 1);
const SECONDI = +arg('secondi', 6);

/* ------------------------------------------------ il file con l'interruttore */
const ING = path.resolve(RADICE, arg('gioco', 'CALCETTO-il-gioco.html'));
const A3 = `    if(lodOn && g.kind===0 && g.c!=='scarpe' && g.b!==HEAD && !(g.a===HIPL&&g.b===HIPR)){
      const ddx=SX[g.b]-SX[g.a], ddy=SY[g.b]-SY[g.a];
      const Lm=Math.sqrt(ddx*ddx+ddy*ddy);
      if(Lm>1.5){
        let nx=-ddy/Lm, ny=ddx/Lm; if(nx>0){nx=-nx;ny=-ny;}   // nx punta a ovest
        ctx.lineCap='butt';
        ctx.globalAlpha=0.16; ctx.strokeStyle='#fff2cf';
        ctx.lineWidth=W*0.30;
        ctx.beginPath();
        ctx.moveTo(SX[g.a]+ddx*0.12+nx*W*0.32, SY[g.a]+ddy*0.12+ny*W*0.32);
        ctx.lineTo(SX[g.a]+ddx*0.88+nx*W*0.32, SY[g.a]+ddy*0.88+ny*W*0.32);
        ctx.stroke();
        ctx.globalAlpha=1; ctx.lineCap='round';
      }
    }`;
/* l'interruttore: 0 niente fili, 1 il solo filo caldo, 2 tutt'e due.
   La soglia in pixel di figura e' il secondo interruttore: sotto, il
   filo non si disegna. */
const B3 = `    if(window.__L151F>0 && g.kind===0 && g.c!=='scarpe' && g.b!==HEAD && !(g.a===HIPL&&g.b===HIPR)){
      const ddx=SX[g.b]-SX[g.a], ddy=SY[g.b]-SY[g.a];
      const Lm=Math.sqrt(ddx*ddx+ddy*ddy);
      if(Lm>1.5 && W>(window.__L151W||1.6)){
        let nx=-ddy/Lm, ny=ddx/Lm; if(nx>0){nx=-nx;ny=-ny;}
        ctx.lineCap='butt';
        ctx.lineWidth=W*0.30;
        ctx.globalAlpha=0.16; ctx.strokeStyle='#fff2cf';
        ctx.beginPath();
        ctx.moveTo(SX[g.a]+ddx*0.12+nx*W*0.32, SY[g.a]+ddy*0.12+ny*W*0.32);
        ctx.lineTo(SX[g.a]+ddx*0.88+nx*W*0.32, SY[g.a]+ddy*0.88+ny*W*0.32);
        ctx.stroke();
        if(window.__L151F>1){
          ctx.globalAlpha=0.10; ctx.strokeStyle=SOLE.tintaOmbra;
          ctx.beginPath();
          ctx.moveTo(SX[g.a]+ddx*0.14-nx*W*0.34, SY[g.a]+ddy*0.14-ny*W*0.34);
          ctx.lineTo(SX[g.a]+ddx*0.86-nx*W*0.34, SY[g.a]+ddy*0.86-ny*W*0.34);
          ctx.stroke();
        }
        window.__L151N++;
        ctx.globalAlpha=1; ctx.lineCap='round';
      }
    }`;

let t = fs.readFileSync(ING, 'utf8');
if (t.split(A3).length - 1 !== 1) { console.error('SONDA: ancora non unica'); process.exit(2); }
t = t.replace(A3, B3);
const FILE = path.join(RADICE, 'fuori', '152-sonda-fili.html');
fs.mkdirSync(path.dirname(FILE), { recursive: true });
fs.writeFileSync(FILE, t);

(async () => {
  let browser, srv;
  try {
    const { chromium } = require('playwright');
    srv = await servi();
    browser = await chromium.launch();
    const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2 });
    const pag = await ctx.newPage();
    await pag.addInitScript(() => { const f = performance.now.bind(performance); window.__veroOra = f; });
    await pag.addInitScript(bancoDiProva);
    await pag.addInitScript(semeFisso, 20260924);
    await pag.addInitScript(() => { window.__L151F = 0; window.__L151W = 1.6; window.__L151N = 0; });
    const rel = path.relative(RADICE, FILE).split(path.sep).join('/');
    if (FRENO > 1) {
      const cdp = await ctx.newCDPSession(pag);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: FRENO });
    }
    await pag.goto('http://127.0.0.1:' + srv.porta + '/' + rel + '?q=' + Date.now(), { waitUntil: 'load' });
    await posaFerma(pag, { secondi: SECONDI, taglia: TAGLIA, cpu: true });

    const quadro = await pag.evaluate(() => {
      const G = window.__test.G;
      return { figure: G.players.filter(p => p.out <= 0).length, S2: +(G.view.S2 || 1).toFixed(3) };
    });

    /* i tre modi, alternati a blocchi: 0 1 2 2 1 0 0 1 2 ... cosi' se la
       macchina scalda o rallenta, scalda su tutt'e tre nello stesso modo */
    const tempi = { 0: [], 1: [], 2: [] };
    let fili = { 0: 0, 1: 0, 2: 0 };
    for (let b = 0; b < BLOCCHI; b++) {
      const ordine = (b % 2 === 0) ? [0, 1, 2] : [2, 1, 0];
      for (const m of ordine) {
        const r = await pag.evaluate(([m, passi]) => {
          window.__L151F = m; window.__L151N = 0;
          window.__test.disegna();                 // uno a vuoto: riscaldamento
          const t0 = window.__veroOra();
          for (let i = 0; i < passi; i++) window.__test.disegna();
          const dt = (window.__veroOra() - t0) / passi;
          return { dt, n: window.__L151N / (passi + 1) };
        }, [m, PASSI]);
        tempi[m].push(r.dt);
        fili[m] = r.n;
      }
    }
    await browser.close(); srv.chiudi();

    const med = a => { const u = a.slice().sort((x, y) => x - y);
      return u.length % 2 ? u[u.length >> 1] : (u[u.length / 2 - 1] + u[u.length / 2]) / 2; };
    const disp = a => { const m = a.reduce((x, y) => x + y, 0) / a.length;
      return 100 * Math.sqrt(a.reduce((s, v) => s + (v - m) * (v - m), 0) / a.length) / m; };
    console.log('=== _sonda-152-fili — il costo dei fili di volume, stessa pagina ===');
    console.log('  taglia ' + TAGLIA + ', freno ' + FRENO + '×, ' + quadro.figure + ' figure in campo, S2 ' + quadro.S2 +
                ', ' + BLOCCHI + ' blocchi da ' + PASSI + ' disegni\n');
    const m0 = med(tempi[0]);
    for (const m of [0, 1, 2]) {
      const mm = med(tempi[m]);
      console.log('  fili ' + m + ':  ' + mm.toFixed(3) + ' ms per disegno   (dispersione ' + disp(tempi[m]).toFixed(1) +
                  '%)   tratti disegnati ' + fili[m].toFixed(0) +
                  (m ? '   → ' + (mm - m0 >= 0 ? '+' : '') + (mm - m0).toFixed(3) + ' ms, ' +
                       (100 * (mm - m0) / m0 >= 0 ? '+' : '') + (100 * (mm - m0) / m0).toFixed(1) + '%' : '   (riferimento)'));
    }
    process.exit(0);
  } catch (e) {
    try { if (browser) await browser.close(); } catch (_) {}
    try { if (srv) srv.chiudi(); } catch (_) {}
    console.error('SONDA ESPLOSA: ' + (e && e.stack || e));
    process.exit(2);
  }
})();
