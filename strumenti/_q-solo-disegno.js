/* =====================================================================
   _q-solo-disegno.js — DUE FILE, LA STESSA PARTITA AL BIT?
   (29 agosto 2026)

   Una toppa che promette di toccare SOLO IL DISEGNO deve poterlo
   dimostrare, e «il punteggio finale coincide» non lo dimostra: due
   partite diverse possono finire 1-0 tutte e due. Qui si confronta
   un'IMPRONTA campione per campione — pallone (x, y, z), ogni giocatore
   (x, y), punteggio, cronometro, e il conto dei sorteggi consumati —
   fra due file giocati con lo STESSO seme, alle tre taglie.

   Se un solo campione diverge, la toppa ha toccato la simulazione e il
   cancello dice DOVE (partita, taglia, secondo, campo).

   IL SUO ROSSO, DIMOSTRATO: con --bugiardo si confronta il file «dopo»
   con se stesso ma dando al secondo un seme diverso di uno. Le due
   partite devono divergere, e il cancello deve accorgersene. Se anche
   quello passasse, l'impronta non guarda niente.

   uso:
     node strumenti/_q-solo-disegno.js --prima fuori/base.html --dopo fuori/toppa.html
     node strumenti/_q-solo-disegno.js --prima a.html --dopo b.html --bugiardo
   uscita: 0 identiche, 1 divergono, 2 il banco e' esploso.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { servi, bancoDiProva, semeFisso } = require('./_posa.js');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const ha = n => process.argv.includes('--' + n);
const PRIMA = arg('prima', 'CALCETTO-il-gioco.html');
const DOPO = arg('dopo', 'fuori/anim-prima.html');
const SEC = +arg('sec', 60);
const TAGLIE = arg('taglie', '5,7,11').split(',').map(Number);
const SEMI = arg('semi', '20260803,20260804').split(',').map(Number);
const BUGIARDO = ha('bugiardo');

async function impronta(pag, taglia, seme, sec) {
  return await pag.evaluate(([n, sec]) => {
    window.__test.dismissSplash && window.__test.dismissSplash();
    window.__test.startMatch(1, 1, { size: n });
    window.__test.Tut && window.__test.Tut.finish && window.__test.Tut.finish(true);
    window.__test.setCpuVsCpu(true);
    window.__test.setTimeLeft(sec + 30);
    const G = window.__test.G;
    const camp = [];
    for (let f = 0; f < sec * 60; f++) {
      window.__test.simulate(1 / 60);
      if (f % 30 === 0) {
        const b = G.ball;
        let r = [Math.round(b.x * 1000), Math.round(b.y * 1000), Math.round(b.z * 1000),
                 G.score[0], G.score[1], Math.round(G.timeLeft * 100)];
        for (const p of G.players) r.push(Math.round(p.x * 1000), Math.round(p.y * 1000));
        camp.push(r.join(','));
      }
    }
    return { camp, sorteggi: window.__quanti ? window.__quanti() : -1, score: G.score.slice() };
  }, [taglia, sec]);
}

(async () => {
  const { chromium } = require('playwright');
  const srv = await servi();
  const br = await chromium.launch();

  async function apri(file, seme) {
    const ctx = await br.newContext({ viewport: { width: 576, height: 273 }, deviceScaleFactor: 2 });
    const pag = await ctx.newPage();
    await pag.addInitScript(bancoDiProva);
    await pag.addInitScript(semeFisso, seme);
    await pag.addInitScript(() => { window.requestIdleCallback = () => 0; window.cancelIdleCallback = () => {}; });
    await pag.goto('http://127.0.0.1:' + srv.porta + '/' + file.split(path.sep).join('/') + '?q=' + Date.now(), { waitUntil: 'load' });
    await pag.evaluate(() => window.__banco.passo(30));
    return { ctx, pag };
  }

  let guai = 0, prove = 0, campioni = 0;
  for (const taglia of TAGLIE) for (const seme of SEMI) {
    const A = await apri(PRIMA, seme);
    const B = await apri(BUGIARDO ? PRIMA : DOPO, BUGIARDO ? seme + 1 : seme);
    const ia = await impronta(A.pag, taglia, seme, SEC);
    const ib = await impronta(B.pag, taglia, seme, SEC);
    await A.ctx.close(); await B.ctx.close();
    prove++;
    let dove = -1;
    for (let i = 0; i < Math.max(ia.camp.length, ib.camp.length); i++) {
      if (ia.camp[i] !== ib.camp[i]) { dove = i; break; }
    }
    campioni += ia.camp.length;
    const okSort = ia.sorteggi === ib.sorteggi;
    const ok = dove < 0 && okSort;
    if (!ok) guai++;
    console.log('  ' + (ok ? 'OK  ' : 'NO  ') + 'taglia ' + taglia + ' seme ' + seme +
                '  ' + ia.camp.length + ' campioni  punteggio ' + ia.score.join('-') + ' / ' + ib.score.join('-') +
                '  sorteggi ' + ia.sorteggi + ' / ' + ib.sorteggi +
                (dove >= 0 ? '   PRIMO SCARTO al campione ' + dove + ' (secondo ' + (dove / 2).toFixed(1) + ')' : ''));
  }
  await br.close(); srv.chiudi();

  console.log('\n' + prove + ' partite appaiate, ' + campioni + ' campioni confrontati (pallone, 2x' +
              'giocatori, punteggio, cronometro, sorteggi)');
  if (BUGIARDO) {
    console.log(guai ? 'CONTROLLO NEGATIVO SUPERATO: col seme spostato di uno le partite divergono, e il cancello le vede.'
                     : 'CONTROLLO NEGATIVO FALLITO: nemmeno un seme diverso fa divergere l\'impronta. Questo cancello non guarda niente.');
    process.exit(guai ? 0 : 1);
  }
  console.log(guai ? 'ROSSO: ' + guai + ' partite su ' + prove + ' divergono. La toppa NON e\' solo disegno.'
                   : 'VERDE: le ' + prove + ' partite sono identiche al bit. La toppa e\' solo disegno.');
  process.exit(guai ? 1 : 0);
})().catch(e => { console.error('FALLITO: ' + (e && e.message || e)); process.exit(2); });
