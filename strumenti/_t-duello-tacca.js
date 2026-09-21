/* =====================================================================
   _t-duello-tacca.js — LA MIRA DEVE SOPRAVVIVERE AL NASTRO
   (voce #131, compito 3). Nasce ROSSO.

   LA DOMANDA. Nel nastro la mira entra come due interi (u e v per mille,
   arrotondati: e' il formato, grep «i numeri sono interi»). Chi rilegge
   li ridivide per mille e li passa a pickZone. Perche' la partita
   rigiocata sia LA STESSA, il numero che il gioco vivo ha usato e quello
   che esce dal nastro devono coincidere alla cifra.

   LE PROVE.
     A) LA FOTOGRAFIA DEL DIFETTO, e non e' un cancello che deve restare
        verde: lo STESSO clientX/clientY, su due viste di forma diversa
        (915x412 e 782x299), da' due mire DIVERSE. E' la ragione per cui
        nel nastro non possono entrare i pixel dello schermo: duelMira
        ricava u,v da duelGeo(), che dipende da VW/VH e dalle altezze vere
        delle due fasce lette dal DOM.
     B) IL CANCELLO VERO: ogni u e ogni v che duelMira restituisce
        sopravvive al giro nel nastro, cioe' round(x*1000)/1000 === x.
        Prima della cura NO (la u e' un numero a doppia precisione);
        dopo SI'.
     C) il terzo z e' sempre coerente con la u restituita — se no il
        nastro porterebbe un punto e un terzo che si contraddicono.
     D) NON-REGRESSIONE DELLA CPU: pickZone(z) senza u,v inventa ancora
        esattamente u=z-1 e v=0,50, e `mirato` resta falso. La CPU non
        chiama mai duelMira, e questa prova lo mette per iscritto.
        (La prova larga e' _t-duello-impronta.js.)

   uso:  node strumenti/_t-duello-tacca.js
   esce 0 verde, 1 rosso, 2 banco esploso.
   ===================================================================== */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { semeFisso } = require('./_posa.js');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const GIOCO = arg('gioco', process.env.GIOCO_PROVA || 'CALCETTO-il-gioco.html');
const SEME = 20260921;
const VISTE = [{ w: 915, h: 412 }, { w: 782, h: 299 }];

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

/* la griglia di dita: coordinate dello SCHERMO, le stesse su tutte e due
   le viste — e' il punto della prova A */
function griglia() {
  const p = [];
  for (let x = 120; x <= 660; x += 45) for (let y = 90; y <= 250; y += 20) p.push([x, y]);
  return p;
}

function misura({ seme, punti }) {
  const t = window.__test;
  t.fermaRegistro && t.fermaRegistro();
  t.semina(seme);
  t.startMatch(1, 1, { size: 5, sponde: 'gabbia', miraGuidata: 'pieno' });
  t.rigori();
  /* la geometria del duello si assesta: duelGeo legge l'altezza vera di
     .duelhead e .duelfoot, e nei primi fotogrammi l'impaginazione non e'
     ancora ferma (lezione di _sonda-duello.js) */
  misuraDuel(); misuraDuel(); misuraDuel();
  const g = duelGeo();
  const mire = punti.map(([x, y]) => {
    const m = duelMira(x, y);
    return [m.u, m.v, m.z];
  });

  /* LA NON-REGRESSIONE DELLA CPU, letta invece che creduta: pickZone
     senza u,v deve inventare ancora gli stessi due numeri di sempre. */
  const cpu = [];
  for (const z of [0, 1, 2]) {
    Duel.phase = 'zone'; Duel.mirato = false;
    Duel.pickZone(z);
    cpu.push([Duel.zone, Duel.aimU, Duel.aimV, Duel.mirato]);
  }
  return { mire, cpu, geo: { VW, VH, GW: g.GW, GH: g.GH, gy0: g.gy0 } };
}

const esiti = [];
const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '\n         ' + det : '')); };

const tacca = x => Math.round(x * 1000) / 1000 === x;

(async () => {
  const srv = await servi();
  let browser, R = [];
  const PUNTI = griglia();
  try {
    browser = await chromium.launch();
    for (const v of VISTE) {
      const ctx = await browser.newContext({ viewport: { width: v.w, height: v.h }, isMobile: true, hasTouch: true, locale: 'it-IT' });
      const pag = await ctx.newPage();
      await pag.addInitScript(semeFisso, SEME);
      const ecc = []; pag.on('pageerror', e => ecc.push(e.message));
      await pag.goto(`http://127.0.0.1:${srv.porta}/${GIOCO}`, { waitUntil: 'load' });
      await pag.waitForFunction('window.__test !== undefined', null, { timeout: 30000 });
      await pag.evaluate(() => {
        const t = window.__test;
        t.dismissSplash && t.dismissSplash();
        if (t.save) t.save.tutorialDone = 1;
      });
      const r = await pag.evaluate(new Function('p', 'return (' + misura.toString() + ')(p)'),
        { seme: SEME, punti: PUNTI });
      if (ecc.length) throw new Error('eccezione di pagina: ' + ecc[0]);
      R.push({ vista: v, ...r });
      await ctx.close();
    }
  } catch (e) {
    console.error('FALLITO (banco): ' + e.message);
    if (browser) await browser.close();
    srv.chiudi(); process.exit(2);
  }
  await browser.close(); srv.chiudi();

  console.log('=== LA MIRA SI POSA SU UNA TACCA INTERA (voce #131, compito 3) ===');
  console.log('    gioco ' + GIOCO + ', ' + PUNTI.length + ' dita, viste ' +
    VISTE.map(v => v.w + 'x' + v.h).join(' e '));
  for (const r of R)
    console.log('    ' + r.vista.w + 'x' + r.vista.h + ': porta ' + r.geo.GW.toFixed(2) + 'x' + r.geo.GH.toFixed(2) +
      ', traversa a y=' + r.geo.gy0.toFixed(2));

  /* A) la fotografia del difetto */
  let diversi = 0, maxDU = 0;
  for (let i = 0; i < PUNTI.length; i++) {
    const a = R[0].mire[i], b = R[1].mire[i];
    if (a[0] !== b[0] || a[1] !== b[1]) diversi++;
    maxDU = Math.max(maxDU, Math.abs(a[0] - b[0]));
  }
  di(diversi > PUNTI.length * 0.8,
    'A) lo STESSO pixel dello schermo da\' mire DIVERSE su due viste — la fotografia del difetto',
    diversi + ' dita su ' + PUNTI.length + ' danno u,v diversi, scarto massimo su u: ' + maxDU.toFixed(4) +
    ' — per questo nel nastro entra la mira e non il pixel');

  /* B) il cancello vero */
  let fuoriTacca = 0, esempio = null;
  for (const r of R) for (const [u, v] of r.mire) {
    if (!tacca(u) || !tacca(v)) { fuoriTacca++; if (!esempio) esempio = [u, v]; }
  }
  const tot = R.length * PUNTI.length;
  di(fuoriTacca === 0,
    'B) ogni u e ogni v sopravvivono al giro nel nastro (tre decimali esatti)',
    fuoriTacca === 0
      ? tot + ' mire su ' + tot + ' gia\' esatte al millesimo'
      : fuoriTacca + ' mire su ' + tot + ' NON tornano dal nastro, per esempio u=' +
        esempio[0] + ' -> ' + (Math.round(esempio[0] * 1000) / 1000) +
        ' — la partita rigiocata divergerebbe dal primo rigore, e in silenzio');

  /* C) il terzo coerente col punto */
  let incoerenti = 0;
  for (const r of R) for (const [u, , z] of r.mire) {
    const atteso = u < -0.5 ? 0 : (u > 0.5 ? 2 : 1);
    if (z !== atteso) incoerenti++;
  }
  di(incoerenti === 0,
    'C) il terzo e\' sempre coerente con la u restituita',
    incoerenti + ' mire su ' + tot + ' con terzo e punto che si contraddicono');

  /* D) la CPU non se ne accorge */
  const attesoCPU = [[0, -1, 0.5, false], [1, 0, 0.5, false], [2, 1, 0.5, false]];
  let cpuOk = true, cpuDet = [];
  for (const r of R) for (let i = 0; i < 3; i++) {
    const a = r.cpu[i], b = attesoCPU[i];
    if (a[0] !== b[0] || a[1] !== b[1] || a[2] !== b[2] || a[3] !== b[3]) cpuOk = false;
    if (r === R[0]) cpuDet.push('z=' + a[0] + ' -> u=' + a[1] + ' v=' + a[2] + ' mirato=' + a[3]);
  }
  di(cpuOk,
    'D) pickZone senza u,v inventa ancora gli stessi numeri (la CPU non passa da duelMira)',
    cpuDet.join('  |  ') + ' — attesi u=z-1 in {-1,0,1}, v=0,5, mirato falso');

  const rossi = esiti.filter(v => !v).length;
  console.log('\n' + (esiti.length - rossi) + ' prove su ' + esiti.length + ' — ' +
    (rossi ? 'ROSSO (la mira non sopravvive al nastro)' : 'VERDE'));
  process.exit(rossi ? 1 : 0);
})();
