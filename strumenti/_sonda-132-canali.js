/* =====================================================================
   _sonda-132-canali.js — QUANTO PESANO I QUATTRO CANALI (voce #132)

   Sonda diagnostica, non un cancello: misura quanto una partita DEVIA
   quando si muove uno solo dei quattro canali che il nastro non porta.
   Serve a scrivere numeri veri nella spec invece di aggettivi.

   Metodo: CPU contro CPU a seme fisso (deterministico dato il seme,
   taglia 5), ordine sacro startMatch PRIMA / setCpuVsCpu DOPO. Si
   confrontano due esecuzioni che differiscono per UNA cosa sola.

   uso:  node strumenti/_sonda-132-canali.js
   ===================================================================== */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const GIOCO = arg('gioco', 'CALCETTO-il-gioco.html');
const PASSI = parseInt(arg('passi', '3000'), 10);
const SEMI = [20260921, 20260922, 20260923, 20260924, 20260925];

function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

const IMPRONTA = `(() => {
  const b=G.ball;
  let s = [Math.round(b.x*100), Math.round(b.y*100), Math.round((b.z||0)*100),
           G.score[0], G.score[1], Math.round(G.timeLeft*100)];
  for(const p of G.players) s.push(Math.round(p.x*100), Math.round(p.y*100));
  return s.join(',');
})()`;

const primoScarto = (a, b) => {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) return i;
  return a.length === b.length ? -1 : n;
};

(async () => {
  const srv = await servi();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.goto(`http://127.0.0.1:${srv.porta}/${GIOCO}`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 30000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => {
    const t = window.__test;
    t.dismissSplash && t.dismissSplash();
    if (t.save) t.save.tutorialDone = 1;
    window.__save0 = JSON.parse(JSON.stringify(t.save));
  });

  const gira = (seme, variante) => pag.evaluate(([seme, variante, passi, IMPR]) => {
    const t = window.__test;
    t.fermaRegistro();
    for (const k of Object.keys(t.save)) if (!(k in window.__save0)) delete t.save[k];
    for (const k in window.__save0) t.save[k] = JSON.parse(JSON.stringify(window.__save0[k]));
    if (typeof Reg !== 'undefined') Reg.azzeraComandi();
    /* la rosa fuori scala si scrive PRIMA di startMatch: e' il salvataggio */
    if (variante === 'rosa-fuori') t.save.rosa[1].vel = 250;
    if (variante === 'rosa-tetto') t.save.rosa[1].vel = 99;
    t.semina(seme);
    const opts = { size: 5, sponde: 'gabbia', miraGuidata: 'pieno' };
    if (variante === 'car-nome') opts.opp = { n: 'GASOMETRO' };
    if (variante === 'car-altro') opts.opp = { n: 'AVVERSARIO' };
    t.startMatch(1, 1, opts);
    t.setCpuVsCpu(true);
    if (variante === 'ment-2') t.setMentalita(2, 1);
    if (variante === 'ment-1') t.setMentalita(1, 1);
    const leggi = new Function('return ' + IMPR);
    const imp = [];
    for (let f = 0; f < passi; f++) {
      t.simulate(1 / 60);
      if (f % 20 === 0) imp.push(leggi());
    }
    return { imp, gol: [G.score[0], G.score[1]], sorteggi: t.sorteggi, car: (G.car && G.car[1]) ? Object.values(G.car[1]).join('/') : '?' };
  }, [seme, variante, PASSI, IMPRONTA]);

  const coppie = [
    ['a) MENTALITA\'  equilibrio -> attacco', 'ment-1', 'ment-2'],
    ['b) CARATTERE    nome anonimo -> GASOMETRO', 'car-altro', 'car-nome'],
    ['c) SCALA ROSA   vel 99 -> vel 250', 'rosa-tetto', 'rosa-fuori'],
  ];
  console.log('=== I QUATTRO CANALI, MISURATI (voce #132) — ' + GIOCO + ' ===');
  console.log('    CPU contro CPU, taglia 5, ' + PASSI + ' passi, campione ogni 20\n');
  for (const [nome, va, vb] of coppie) {
    let diversi = 0, golDiversi = 0, primi = [];
    for (const s of SEMI) {
      const A = await gira(s, va), B = await gira(s, vb);
      const k = primoScarto(A.imp, B.imp);
      if (k >= 0) { diversi++; primi.push(k * 20); }
      if (A.gol.join() !== B.gol.join()) golDiversi++;
    }
    console.log('  ' + nome);
    console.log('     divergono ' + diversi + '/' + SEMI.length + ' semi' +
      (primi.length ? (', primo scarto ai passi ' + primi.join(', ')) : '') +
      ', punteggio diverso ' + golDiversi + '/' + SEMI.length);
  }
  /* d) quante righe fa un nastro vero, per sapere quanto e' lontano il tetto */
  const conta = await pag.evaluate(([passi]) => {
    const t = window.__test;
    t.fermaRegistro();
    for (const k in window.__save0) t.save[k] = JSON.parse(JSON.stringify(window.__save0[k]));
    if (typeof Reg !== 'undefined') Reg.azzeraComandi();
    t.semina(20260921);
    t.registra();
    t.startMatch(1, 1, { size: 5, sponde: 'gabbia', miraGuidata: 'pieno' });
    /* TRE DITA, come il copione di _q-sfida.js: levetta, disco grande,
       disco piccolo. Un dito solo sottostima il nastro di una partita vera. */
    const dischi = t.pulsanti(0);
    const grande = dischi[0] || { x: 800, y: 330, r: 44 };
    const piccolo = dischi[1] || { x: 720, y: 250, r: 34 };
    const LX = 180, LY = 300;
    let idL = 1, idB = 2, giu = false, giuB = false;
    for (let f = 0; f < passi; f++) {
      const a = f * 0.037, rr = 34 + 22 * Math.sin(f * 0.011);
      const x = LX + Math.cos(a) * rr, y = LY + Math.sin(a) * rr;
      if (!giu) { Touch5.start(idL, LX, LY); giu = true; }
      else Touch5.move(idL, x, y);
      if (f % 97 === 96) { Touch5.chiudi(idL, false); giu = false; idL += 2; }
      if (f % 71 === 0 && !giuB) { Touch5.start(idB, grande.x, grande.y); giuB = true; }
      else if (giuB && f % 71 === 18) { Touch5.move(idB, grande.x - 26, grande.y - 14); }
      else if (giuB && f % 71 === 26) { Touch5.chiudi(idB, false); giuB = false; idB += 2; }
      if (f % 53 === 11) { const j = 900 + f; Touch5.start(j, piccolo.x, piccolo.y); Touch5.chiudi(j, false); }
      t.simulate(1 / 60);
    }
    const r = t.registroRighe;
    t.fermaRegistro();
    return { righe: r, passi };
  }, [PASSI]);
  console.log('\n  d) TETTO DEL REGISTRO  tre dita per ' + conta.passi + ' passi fanno ' + conta.righe +
    ' comandi (' + (conta.righe / conta.passi).toFixed(2) + ' per passo): il tetto di 40.000 si tocca a ' +
    Math.round(40000 / (conta.righe / conta.passi)) + ' passi, cioe\' ' +
    Math.round(40000 / (conta.righe / conta.passi) / 60) + ' secondi di gioco.');

  /* e quante dita servono perche' il tetto entri dentro una sfida: una
     riga per dito per fotogramma, e il numero di dita non e' limitato */
  for (const dita of [1, 3, 6, 10]) {
    const m = await pag.evaluate(([dita, passi]) => {
      const t = window.__test;
      t.fermaRegistro();
      for (const k in window.__save0) t.save[k] = JSON.parse(JSON.stringify(window.__save0[k]));
      if (typeof Reg !== 'undefined') Reg.azzeraComandi();
      t.semina(20260921);
      t.registra();
      t.startMatch(1, 1, { size: 5, sponde: 'gabbia', miraGuidata: 'pieno' });
      for (let d = 0; d < dita; d++) Touch5.start(100 + d, 120 + d * 30, 300);
      for (let f = 0; f < passi; f++) {
        for (let d = 0; d < dita; d++) Touch5.move(100 + d, 120 + d * 30 + (f % 17), 300 + (f % 13));
        t.simulate(1 / 60);
      }
      const r = t.registroRighe;
      t.fermaRegistro();
      return r;
    }, [dita, 600]);
    console.log('     ' + String(dita).padStart(2) + ' dita ferme sullo schermo: ' + (m / 600).toFixed(2) +
      ' comandi per passo -> tetto a ' + Math.round(40000 / (m / 600) / 60) + ' s');
  }

  await browser.close(); srv.chiudi();
})();
