/* =====================================================================
   _crit6-avversario.js — IL CRITICO: le taglie che l'altro NON ha provato.

   tocco.js gira su undici taglie scelte da chi ha scritto la cura. Questo
   banco gira sulle taglie che quella lista NON contiene, e in particolare
   sulla fascia 620..700 px di larghezza, che e' il buco fra le due soglie
   della toppa (#gioca .btnA e .giocapall si accendono sotto i 620; il
   riquadro largo 860 e la citazione su una riga sola si accendono sopra i
   700). Dentro quella fascia non si accende niente.

   uso: node strumenti/_crit6-avversario.js --gioco fuori/campocop.html
        node strumenti/_crit6-avversario.js --gioco X --scena gioca
   ===================================================================== */
const http = require('http');
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};

/* APPARECCHI VERI, coricati. Nessuna griglia cartesiana: ogni riga e' un
   telefono o un tablet che si vende, con la sua misura in px CSS. */
const TAGLIE = [
  { w: 667, h: 375, n: 'iPhone SE 2/3, 6/7/8 coricato' },
  { w: 693, h: 320, n: 'iPhone 5/5S/SE1 a 320 con barra? (banda 620-700)' },
  { w: 640, h: 384, n: 'banda: 640 largo, 384 alto (OnePlus a 512 dpi)' },
  { w: 683, h: 384, n: 'banda 620-700, altezza del telefono di casa' },
  { w: 660, h: 360, n: 'banda 620-700, telefono piccolo' },
  { w: 700, h: 360, n: 'esattamente sul confine dei 700' },
  { w: 699, h: 360, n: 'un pixel sotto il confine dei 700' },
  { w: 736, h: 414, n: 'iPhone 6/7/8 Plus coricato' },
  { w: 896, h: 414, n: 'iPhone XR / 11 coricato' },
  { w: 844, h: 390, n: 'iPhone 12/13/14 coricato' },
  { w: 926, h: 428, n: 'iPhone 12/13 Pro Max coricato' },
  { w: 932, h: 430, n: 'iPhone 15/16 Pro Max coricato' },
  { w: 780, h: 360, n: 'Galaxy A / Xiaomi coricato' },
  { w: 800, h: 360, n: '20:9 coricato' },
  { w: 873, h: 393, n: 'Pixel 7/8 coricato' },
  { w: 915, h: 412, n: '[controllo] la misura storica, deve essere verde' },
  { w: 811, h: 384, n: '[controllo] il telefono vero, deve essere verde' },
];

const SCHERMATE = [
  { id: 'menu',         via: [] },
  { id: 'gioca',        via: ['btnGioca'] },
  { id: 'stagione',     via: ['btnStagione'] },
  { id: 'torneo',       via: ['btnTorneo'] },
  { id: 'spogliatoio',  via: ['btnSpogliatoio'] },
  { id: 'squadra',      via: ['btnSpogliatoio', 'btnSquadra'] },
  { id: 'rosa',         via: ['btnSpogliatoio', 'btnRosa'] },
  { id: 'campi',        via: ['btnSpogliatoio', 'btnCampi'] },
  { id: 'bacheca',      via: ['btnBacheca'] },
  { id: 'trofei',       via: ['btnBacheca', 'btnTrofei'] },
  { id: 'statistiche',  via: ['btnBacheca', 'btnStatsScr'] },
  { id: 'negozio',      via: ['btnNegozio'] },
  { id: 'extra',        via: ['gearBtn'] },
  { id: 'impostazioni', via: ['gearBtn', 'btnImpost'] },
  { id: 'howto',        via: ['gearBtn', 'btnHow'] },
  { id: 'crediti',      via: ['gearBtn', 'btnCrediti'] },
];

const ROVISTA = function (idScena) {
  const el = document.getElementById(idScena);
  if (!el) return { manca: true };
  const vh = innerHeight, vw = innerWidth;
  const SEL = 'button,input,select,textarea,a[href],[role="button"]';
  const cand = new Set();
  for (const b of el.querySelectorAll(SEL)) cand.add(b);
  for (const b of el.querySelectorAll('*')) {
    if (b.namespaceURI !== 'http://www.w3.org/1999/xhtml') continue;
    if (b.closest('svg')) continue;
    if (getComputedStyle(b).cursor !== 'pointer') continue;
    let sopra = false;
    for (let p = b.parentElement; p && p !== el; p = p.parentElement) {
      if (p.matches(SEL) || getComputedStyle(p).cursor === 'pointer') { sopra = true; break; }
    }
    if (!sopra) cand.add(b);
  }
  const vivi = [];
  for (const b of cand) {
    if (b.closest('.hidden')) continue;
    const st = getComputedStyle(b);
    if (st.display === 'none' || st.visibility === 'hidden' || +st.opacity === 0) continue;
    const q = b.getBoundingClientRect();
    if (q.width < 2 || q.height < 2) continue;
    vivi.push(b);
  }
  const cls = n => (n && n.getAttribute && n.getAttribute('class')) ? String(n.getAttribute('class')).trim().split(/\s+/) : [];
  const nome = b => (b.id ? '#' + b.id
    : (b.tagName.toLowerCase() + (cls(b).length ? '.' + cls(b).join('.') : ''))) +
    (b.textContent && b.textContent.trim() ? ' «' + b.textContent.trim().replace(/\s+/g, ' ').slice(0, 22) + '»' : '');
  const misura = b => {
    const q = b.getBoundingClientRect();
    const cx = q.left + q.width / 2, cy = q.top + q.height / 2;
    const dentro = cy > 0 && cy < vh && cx > 0 && cx < vw;
    const px = Math.min(vw - 1, Math.max(0, Math.round(cx)));
    const py = Math.min(vh - 1, Math.max(0, Math.round(cy)));
    const sopra = dentro ? document.elementFromPoint(px, py) : null;
    const suo = sopra && (sopra === b || b.contains(sopra));
    return {
      t: Math.round(q.top), b: Math.round(q.bottom), cx: Math.round(cx), cy: Math.round(cy),
      h: Math.round(q.height), dentro, colpito: !!(dentro && suo),
      chi: dentro ? (sopra ? (sopra.id ? '#' + sopra.id : (cls(sopra).length ? '.' + cls(sopra)[0] : sopra.tagName)) : 'niente') : '-',
    };
  };
  const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
  const partenza = el.scrollTop;
  el.scrollTop = 0;
  const aRiposo = vivi.map(b => ({ nome: nome(b), m: misura(b) }));
  el.scrollTop = maxScroll;
  const inFondo = vivi.map(b => ({ nome: nome(b), m: misura(b) }));
  const passi = [];
  for (let k = 0; k <= 16; k++) passi.push(Math.round(maxScroll * k / 16));
  const raggiungibili = vivi.map(b => {
    for (const s of passi) { el.scrollTop = s; const m = misura(b); if (m.colpito) return { nome: nome(b), ok: true, a: s }; }
    el.scrollTop = 0;
    return { nome: nome(b), ok: false, m: misura(b) };
  });
  el.scrollTop = partenza;
  return { bersagli: vivi.length, vh, sh: el.scrollHeight, ch: el.clientHeight, aRiposo, inFondo, raggiungibili };
};

function servi(prova) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (prova && /CALCETTO-il-gioco\.html$/i.test(f)) f = prova;
      if ((!f.startsWith(RADICE) && f !== prova) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

(async () => {
  let chromium;
  try { ({ chromium } = require('playwright')); }
  catch (e) { console.error('BANCO: playwright non c\'e\': ' + e.message); process.exit(2); }
  const prova = arg('gioco', '');
  const provaAbs = prova ? path.resolve(prova) : '';
  if (provaAbs && !fs.existsSync(provaAbs)) { console.error('PROVA NULLA: non esiste ' + provaAbs); process.exit(3); }
  const soloScena = arg('scena', '');
  const scene = soloScena ? SCHERMATE.filter(s => s.id === soloScena) : SCHERMATE;

  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  console.log('\n=== IL CRITICO — taglie fuori dalla lista di tocco.js ===');
  console.log('    ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)'));

  let guai = 0;
  for (const T of TAGLIE) {
    const ctx = await browser.newContext({ viewport: { width: T.w, height: T.h }, hasTouch: true, isMobile: true });
    const pag = await ctx.newPage();
    try {
      await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
      await pag.waitForFunction('window.__test !== undefined', null, { timeout: 25000 });
    } catch (e) { console.log('  ' + T.w + 'x' + T.h + ' NON CARICA'); await ctx.close(); continue; }
    await pag.evaluate(() => { const t = window.__test; if (t.dismissSplash) t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
    const righe = [];
    for (const S of scene) {
      await pag.evaluate(() => { if (typeof goScreen === 'function') goScreen(document.getElementById('menu')); });
      await pag.waitForTimeout(50);
      for (const b of S.via) {
        await pag.evaluate(id => { const e = document.getElementById(id); if (e) e.click(); }, b);
        await pag.waitForTimeout(130);
      }
      await pag.waitForTimeout(100);
      const r = await pag.evaluate(new Function('id', 'return (' + ROVISTA.toString() + ')(id)'), S.id);
      if (r.manca) continue;
      const irr = r.raggiungibili.filter(x => !x.ok);
      const bR = r.aRiposo.filter(x => x.m.dentro && !x.m.colpito);
      const bF = r.inFondo.filter(x => x.m.dentro && !x.m.colpito);
      if (irr.length + bR.length + bF.length) {
        guai += irr.length + bR.length + bF.length;
        righe.push('    NO ' + S.id.padEnd(13) + 'scorre ' + (r.sh - r.ch) + ' px');
        for (const x of irr) righe.push('       ROSSO A  ' + x.nome + '  centro y=' + x.m.cy + (x.m.dentro ? ', colpo a ' + x.m.chi : ' FUORI (cx=' + x.m.cx + ' su ' + T.w + ')'));
        for (const x of bR) righe.push('       ROSSO B  ' + x.nome + '  y ' + x.m.t + '..' + x.m.b + ' centro ' + x.m.cy + '/' + r.vh + ', colpo a ' + x.m.chi);
        for (const x of bF) righe.push('       ROSSO C  ' + x.nome + '  centro ' + x.m.cy + '/' + r.vh + ', colpo a ' + x.m.chi);
      }
      if (S.id === 'gioca') righe.push('    .. gioca eccedenza ' + (r.sh - r.ch) + ' px');
    }
    console.log('\n  ' + (T.w + 'x' + T.h).padEnd(9) + T.n);
    for (const r of righe) console.log(r);
    if (!righe.some(r => r.startsWith('    NO'))) console.log('    tutto verde');
    await ctx.close();
  }
  await browser.close(); srv.chiudi();
  console.log('\n  guai totali: ' + guai);
  process.exit(guai ? 1 : 0);
})().catch(e => { console.error('BANCO: ' + (e && e.stack ? e.stack : e)); process.exit(2); });
