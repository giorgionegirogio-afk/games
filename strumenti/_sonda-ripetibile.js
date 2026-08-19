/* =====================================================================
   SONDA DELLA RIPETIBILITA' — dove e perche' due scatti differiscono.

   Non chiede «sono uguali?» (a quello risponde gia' _posa.js): chiede
   DOVE cambiano e CHI li fa cambiare. E' lo strumento con cui e' stata
   trovata la causa del 14,3% di pixel diversi fra due disegni fermi.

   COSA MISURA, in quest'ordine, perche' e' l'ordine che paga:

   1. DOVE. Legge i pixel del canvas e li divide in zone, poi stampa una
      mappa a blocchi. La forma della differenza dice gia' quasi tutto:
      una macchia sola e' un elemento, una differenza SPARSA SU TUTTO IL
      QUADRO e' il quadro che scivola — cioe' la camera.
   2. CHI. Conta, per ogni disegna(), i sorteggi (Math.random), gli
      orologi (Date.now, new Date) e le code (requestIdleCallback,
      setTimeout). Se il conto e' zero, i sospettati facili sono esclusi
      e bisogna guardare lo STATO.
   3. COSA MUTA. Con --stato fa il diff profondo di G prima e dopo un
      solo disegna(): e' la domanda che ha dato la risposta vera
      (G.cam.x/y/z e i tre derivati di G.view, sempre quelli).

   La cura sta in strumenti/_posa.js; qui c'e' la diagnosi.

   uso:
     node strumenti/_sonda-ripetibile.js                (taglia 5)
     node strumenti/_sonda-ripetibile.js --taglia 11
     node strumenti/_sonda-ripetibile.js --stato
     node strumenti/_sonda-ripetibile.js --nuda         senza la cura
   ===================================================================== */
const { servi, bancoDiProva, semeFisso, posaFerma, disegnaFermo } = require('./_posa.js');

const arg = (n, d) => { const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const haFlag = n => process.argv.indexOf('--' + n) > 0;

/* le spie: contatori installati PRIMA della pagina */
function spie() {
  const S = { rnd: 0, dateNow: 0, dateNew: 0, ric: 0, ricGirata: 0, sto: 0, stoGirato: 0 };
  window.__spie = S;
  const dn = Date.now.bind(Date);
  Date.now = () => { S.dateNow++; return dn(); };
  const DD = Date;
  /* new Date() intercettato senza rompere Date.now/Date.parse */
  const P = new Proxy(DD, { construct(t, a) { S.dateNew++; return new t(...a); } });
  P.now = Date.now; P.parse = DD.parse; P.UTC = DD.UTC;
  try { window.Date = P; } catch (e) {}
  const ric = window.requestIdleCallback;
  if (ric) window.requestIdleCallback = (f, o) => { S.ric++;
    return ric(function () { S.ricGirata++; return f.apply(this, arguments); }, o); };
  const st = window.setTimeout;
  window.setTimeout = function (f, ms) { S.sto++;
    return st.call(window, function () { S.stoGirato++;
      return typeof f === 'function' ? f.apply(this, arguments) : eval(f); }, ms); };
}

/* IL CONFRONTO SI FA DENTRO LA PAGINA. Trasferire 1,5 milioni di pixel
   via CDP costa piu' del disegno che si sta misurando: prima stesura di
   questa sonda, tre minuti per quattro coppie. Qui esce solo il conto. */
function attrezzi() {
  const ZONE = [['barra punteggio', 0, 0.11], ['alto (quartiere/tribuna)', 0.11, 0.33],
                ['centro (prato+figure)', 0.33, 0.80], ['fascia bassa (comandi)', 0.80, 1]];
  window.__leggi = () => { const cv = document.getElementById('gioco');
    const d = cv.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, cv.width, cv.height);
    return { w: cv.width, h: cv.height, u: new Uint32Array(d.data.buffer.slice(0)) }; };
  window.__cattura = () => { window.__prec = window.__pix; window.__pix = window.__leggi(); };
  window.__confronta = () => {
    const A = window.__prec, B = window.__pix;
    if (!A) return null;
    const w = A.w, h = A.h, a = A.u, b = B.u;
    let n = 0; const z = ZONE.map(() => 0), zt = ZONE.map(() => 0);
    const BX = 32, BY = 16, bl = new Array(BX * BY).fill(0);
    for (let y = 0; y < h; y++) {
      let zi = 0; for (let k = 0; k < ZONE.length; k++) if (y >= ZONE[k][1] * h) zi = k;
      const by = Math.min(BY - 1, (y / h * BY) | 0), r = y * w;
      zt[zi] += w;
      for (let x = 0; x < w; x++) if (a[r + x] !== b[r + x]) {
        n++; z[zi]++; bl[by * BX + Math.min(BX - 1, (x / w * BX) | 0)]++;
      }
    }
    return { n, tot: w * h, z, zt, zn: ZONE.map(Z => Z[0]), bl, BX, BY };
  };
}

/* il diff profondo dello stato: e' la domanda che ha dato la risposta */
function istantanea() {
  const out = {};
  const vis = (pre, v, d) => {
    if (d > 4) return;
    if (v === null || v === undefined) { out[pre] = String(v); return; }
    const t = typeof v;
    if (t === 'number' || t === 'boolean' || t === 'string') { out[pre] = v; return; }
    if (Array.isArray(v)) { out[pre + '.length'] = v.length;
      for (let i = 0; i < Math.min(v.length, 30); i++) vis(pre + '[' + i + ']', v[i], d + 1); return; }
    if (t === 'object') { for (const k in v) { try { vis(pre + '.' + k, v[k], d + 1); } catch (e) {} } }
  };
  vis('G', window.__test.G, 0);
  return out;
}

function mappa(r) {
  const max = Math.max(...r.bl);
  if (!max) return '     (nessun pixel diverso)';
  const SC = ' .:-=+*#%@', out = [];
  for (let y = 0; y < r.BY; y++) { let s = '     ';
    for (let x = 0; x < r.BX; x++) { const v = r.bl[y * r.BX + x];
      s += v === 0 ? ' ' : SC[Math.min(9, 1 + Math.floor(Math.log10(1 + v) / Math.log10(1 + max) * 8))]; }
    out.push(s); }
  return out.join('\n');
}

(async () => {
  const { chromium } = require('playwright');
  const TAGLIA = +arg('taglia', 5);
  const GIOCO = arg('gioco', 'CALCETTO-il-gioco.html');
  const NUDA = haFlag('nuda');
  const srv = await servi();
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 915, height: 412 },
    deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(spie);
  await pag.addInitScript(semeFisso, 20260819);
  await pag.addInitScript(bancoDiProva);
  await pag.addInitScript(attrezzi);
  await pag.goto(`http://127.0.0.1:${srv.porta}/${GIOCO}`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 15000 });
  await pag.waitForTimeout(400);
  await posaFerma(pag, { taglia: TAGLIA });

  console.log(`\n=== SONDA — ${GIOCO}, taglia ${TAGLIA}, ${NUDA ? 'SENZA la cura' : 'con la cura di _posa.js'} ===`);

  /* con --nuda si chiama disegna() nudo: e' il modo di rivedere il
     difetto invece di crederci sulla parola */
  const disegna = () => NUDA
    ? pag.evaluate(() => { window.__risemina(20260819); window.__test.disegna(); })
    : disegnaFermo(pag);

  if (haFlag('stato')) {
    console.log('\n-- che cosa muta UN solo disegna() (diff profondo di G) --');
    for (let g = 0; g < 3; g++) {
      const a = await pag.evaluate(istantanea);
      await disegna();
      const b = await pag.evaluate(istantanea);
      const diff = [];
      for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) if (a[k] !== b[k]) diff.push(`${k}: ${a[k]} -> ${b[k]}`);
      console.log(`   giro ${g + 1}: ${diff.length} campi mutati`);
      for (const d of diff.slice(0, 40)) console.log('      ' + d);
    }
  }

  const spieV = [];
  await disegna(); await pag.evaluate(() => window.__cattura());
  for (let i = 0; i < 4; i++) {
    const pre = await pag.evaluate(() => ({ q: window.__quanti(), s: JSON.parse(JSON.stringify(window.__spie)) }));
    await disegna();
    const post = await pag.evaluate(() => ({ q: window.__quanti(), s: JSON.parse(JSON.stringify(window.__spie)) }));
    await pag.evaluate(() => window.__cattura());
    spieV.push({ rnd: post.q - pre.q, dateNow: post.s.dateNow - pre.s.dateNow,
                 dateNew: post.s.dateNew - pre.s.dateNew, ric: post.s.ric - pre.s.ric,
                 sto: post.s.sto - pre.s.sto,
                 r: await pag.evaluate(() => window.__confronta()) });
  }

  console.log('\n-- sorteggi e orologi consumati da UN disegna() --');
  spieV.forEach((s, i) => console.log(
    `   disegno ${i + 1}: Math.random x${s.rnd}, Date.now x${s.dateNow}, new Date x${s.dateNew}, ` +
    `requestIdleCallback x${s.ric}, setTimeout x${s.sto}`));

  console.log('\n-- differenza fra disegni consecutivi, sul canvas --');
  spieV.forEach((s, i) => {
    const r = s.r; if (!r) return;
    console.log(`\n   ${i + 1} -> ${i + 2}: ${r.n} pixel su ${r.tot} (${(100 * r.n / r.tot).toFixed(3)}%)`);
    r.zn.forEach((nm, k) => { if (r.z[k]) console.log(`       ${nm}: ${r.z[k]} su ${r.zt[k]} (${(100 * r.z[k] / r.zt[k]).toFixed(2)}%)`); });
    console.log(mappa(r));
  });

  console.log('\n-- spie totali di pagina --', JSON.stringify(await pag.evaluate(() => window.__spie)));
  console.log('-- timer a orologio vero ancora pendenti --', await pag.evaluate(() => window.__banco.pendenti()));

  await br.close(); srv.chiudi();
})();
