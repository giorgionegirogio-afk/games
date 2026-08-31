/* =====================================================================
   _c10-scudo-cammina.js — IL CASO CHE _p-scudo.js NON PROVA MAI:
   LO SCUDO MENTRE SI CAMMINA.

   _p-scudo.js tiene la levetta a ZERO in tutti e due i bracci
   («S.dx = 0; S.dy = 0», riga 117): misura soltanto lo scudo da fermo.
   Ma scudoChiesto accetta la levetta fino a SCUDO_ANDATURA = 0,45, e
   0,45 di ampiezza sono il 45% di P_SPEED. Qui si misura QUANTO SI
   AVANZA mentre si protegge, e se la protezione regge lo stesso.

   Tre bracci, stesso seme, stessa geometria:
     fermo    disco tenuto, levetta a 0            (il braccio di _p-scudo)
     cammina  disco tenuto, levetta a 26,9 px      (ampiezza 0,438)
     libero   NESSUN disco, levetta a 26,9 px      (il controllo)

   uso: node strumenti/_c10-scudo-cammina.js --gioco fuori/cmd-terza.html
   ===================================================================== */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'CALCETTO-il-gioco.html')));
const SEMI = String(arg('semi', '20260801,20260802,20260803,20260804,20260805,20260806,20260807,20260808,20260809,20260810')).split(',').map(Number);
const DIST = String(arg('dist', '30,45,60')).split(',').map(Number);
const ANG = String(arg('ang', '0,45,90,135,180,225,270,315')).split(',').map(Number);
const IMPEGNO = String(arg('impegno', '90,160')).split(',').map(Number);
const FRAMES = +arg('frames', 480);
const LEV = +arg('lev', 26.9);
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png' };

function servi() {
  return new Promise(ok => {
    const s = http.createServer((rq, rs) => {
      const u = decodeURIComponent(rq.url.split('?')[0]);
      let f = path.join(RADICE, u === '/' ? 'index.html' : u);
      if (/CALCETTO-il-gioco\.html$/i.test(f)) f = GIOCO;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { rs.writeHead(404); rs.end(); return; }
      rs.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(rs);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* eslint-disable no-undef */
const BANCO = (cfg) => {
  const T = window.__test;
  const DT = 1 / 60;
  const out = [];
  for (const c of cfg) {
    T.semina(c.seme);
    T.startMatch(1, 1);
    T.simulate(1.2);
    if (T.state !== 'play' && T.state !== 'kickoff') { out.push({ salta: T.state }); continue; }
    const P = G.players;
    let mio = -1, suo = -1, mioCasa = -1, suoCasa = -1;
    for (let i = 0; i < P.length; i++) {
      const p = P[i];
      if (p.role === 'gk') continue;
      if (p.team === 0 && mio < 0) { mio = i; continue; }
      if (p.team === 1 && suo < 0) { suo = i; continue; }
      if (p.team === 0 && mioCasa < 0) { mioCasa = i; continue; }
      if (p.team === 1 && suoCasa < 0) { suoCasa = i; continue; }
      p.out = 99; p.x = -200; p.y = -200; p.vx = 0; p.vy = 0;
    }
    const A = P[mio], D = P[suo];
    for (const [k, gx] of [[mioCasa, 70], [suoCasa, FW - 70]]) {
      if (k < 0) continue;
      const q = P[k];
      q.out = 0; q.x = gx; q.y = FH / 2; q.vx = 0; q.vy = 0; q.ax = 0; q.ay = 0;
      q.slide = -1; q.recover = 0; q.kickCd = 0; q.charge = -1;
    }
    G.ctrl[0] = mio; G.cpu[0] = false; G.cpu[1] = true; G.swTimer[0] = 0; G.swLock[0] = 0;

    A.x = FW * 0.5; A.y = FH / 2; A.vx = 0; A.vy = 0; A.ax = 0; A.ay = 0;
    A.fx = 1; A.fy = 0; A.out = 0; A.slide = -1; A.recover = 0; A.kickCd = 0; A.charge = -1;
    A.fiato = 100;
    const b = G.ball;
    b.owner = mio; b.passTo = -1; b.crossTo = -1; b.x = A.x + 16; b.y = A.y; b.z = 0;
    b.vx = 0; b.vy = 0; b.vz = 0; b.curve = 0; b.perfectT = 0;

    const S = Touch5.stick[0];
    S.active = true; S.id = 1; S.ox = 100; S.oy = 300; S.dx = c.lev; S.dy = 0; S.hist = [];
    Touch5.btnTouch = {};
    Touch5.atti = {};
    if (c.scudo) {
      const d5 = T.pulsanti(0).find(z => z.act === 'sprint');
      Touch5.nasceAtto('sc', 0, 4, 'sprint', d5 ? d5.x : 0, d5 ? d5.y : 0);
      Touch5.btnTouch['sc'] = { t: 0, act: 'sprint' };
    }
    if (G.brain[0]) G.brain[0].ruoloT = -1;
    if (G.brain[1]) G.brain[1].ruoloT = -1;

    const ra = c.ang * Math.PI / 180;
    D.x = A.x + Math.cos(ra) * c.dist;
    D.y = A.y + Math.sin(ra) * c.dist;
    D.out = 0; D.slide = -1; D.recover = 0; D.kickCd = 0; D.charge = -1;
    {
      const dx = A.x - D.x, dy = A.y - D.y, dl = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      D.vx = dx / dl * c.impegno; D.vy = dy / dl * c.impegno;
      D.ax = 0; D.ay = 0; D.fx = dx / dl; D.fy = dy / dl;
    }
    const tenuta = (typeof Touch5.scatta === 'function') ? !!Touch5.scatta(0) : null;
    if (tenuta !== null && tenuta !== !!c.scudo) { out.push({ nullo: 'tenuta ' + tenuta }); continue; }

    const x0 = A.x, y0 = A.y, fase0 = A.fase || 0;
    let tolto = -1, dCorpo = 1e9, nFren = 0, nCorsa = 0, nCammina = 0, nAltro = 0, vSomma = 0, nScivola = 0;
    let uMin = 9, uMax = -9;
    const own0 = b.owner;
    for (let f = 0; f < c.frames; f++) {
      T.simulate(DT);
      const d = Math.hypot(D.x - b.x, D.y - b.y);
      if (d < dCorpo) dCorpo = d;
      if (tolto < 0 && b.owner !== own0) tolto = f;
      vSomma += Math.hypot(A.vx, A.vy);
      if (typeof rigStato === 'function') {
        const st = rigStato(A);
        if (st.clip === 'frenata') {
          nFren++; if (st.u < uMin) uMin = st.u; if (st.u > uMax) uMax = st.u;
          if (Math.hypot(A.vx, A.vy) > 40) nScivola++;
        }
        else if (st.clip === 'corsa') nCorsa++;
        else if (st.clip === 'camminata') nCammina++;
        else nAltro++;
      }
    }
    let esito = 'libero';
    if (b.owner >= 0) esito = (P[b.owner].team === 0) ? 'mio' : 'loro';
    out.push({
      esito, tolto, dCorpo: +dCorpo.toFixed(2),
      spost: +Math.hypot(A.x - x0, A.y - y0).toFixed(1),
      dFase: +((A.fase || 0) - fase0).toFixed(3),
      vMedia: +(vSomma / c.frames).toFixed(1),
      fiato: +A.fiato.toFixed(1),
      fren: nFren, corsa: nCorsa, camm: nCammina, altro: nAltro, scivola: nScivola,
      uMin: uMin === 9 ? null : +uMin.toFixed(3), uMax: uMax === -9 ? null : +uMax.toFixed(3),
      braccio: c.braccio, sorteggi: T.sorteggi,
    });
  }
  return out;
};

const attesa = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const pag = await ctx.newPage();
  pag.on('pageerror', e => console.error('  ! errore di pagina: ' + e.message));
  await pag.goto('http://127.0.0.1:' + srv.porta + '/CALCETTO-il-gioco.html', { waitUntil: 'load' });
  await pag.evaluate(async () => { try { window.__test.dismissSplash(); } catch (e) { } await document.fonts.ready; });
  await attesa(800);

  const BRACCI = [
    { braccio: 'fermo', scudo: 1, lev: 0 },
    { braccio: 'cammina', scudo: 1, lev: LEV },
    { braccio: 'libero', scudo: 0, lev: LEV },
  ];
  const casi = [];
  for (const seme of SEMI) for (const dist of DIST) for (const ang of ANG) for (const impegno of IMPEGNO)
    for (const br2 of BRACCI) casi.push({ seme, dist, ang, impegno, frames: FRAMES, ...br2 });

  const R = [];
  const LOTTO = 24;
  for (let i = 0; i < casi.length; i += LOTTO) {
    const parte = await pag.evaluate(`(${BANCO})(${JSON.stringify(casi.slice(i, i + LOTTO))})`);
    R.push(...parte);
  }
  await br.close(); srv.chiudi();

  const nulli = R.filter(r => r.nullo || r.salta).length;
  const buoni = R.filter(r => r.esito);
  console.log('\n=== LO SCUDO CHE CAMMINA — ' + path.basename(GIOCO) + ' ===');
  console.log('  ' + R.length + ' duelli, ' + nulli + ' nulli  ·  ' + (FRAMES / 60).toFixed(1) + ' s l\'uno  ·  levetta del braccio che cammina ' + LEV + ' px');
  const med = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[s.length >> 1] : null; };
  for (const b of BRACCI) {
    const v = buoni.filter(r => r.braccio === b.braccio);
    const n = v.length || 1;
    const mioN = v.filter(r => r.esito === 'mio').length;
    const persi = v.filter(r => r.tolto >= 0);
    console.log('  ' + b.braccio.padEnd(9)
      + String(v.length).padStart(4) + ' duelli'
      + '  mio ' + (100 * mioN / n).toFixed(1).padStart(5) + '%'
      + '  perso ' + (100 * persi.length / n).toFixed(1).padStart(5) + '%'
      + '  SPOSTAMENTO mediano ' + String(med(v.map(r => r.spost))).padStart(6) + ' u'
      + '  (max ' + Math.max(...v.map(r => r.spost)).toFixed(0).padStart(4) + ')'
      + '  v media ' + (v.reduce((a, r) => a + r.vMedia, 0) / n).toFixed(1).padStart(5) + ' u/s'
      + '  dCorpo mediana ' + String(med(v.map(r => r.dCorpo))).padStart(6)
      + '  fiato ' + (v.reduce((a, r) => a + r.fiato, 0) / n).toFixed(1).padStart(5));
    const fren = v.reduce((a, r) => a + r.fren, 0), corsa = v.reduce((a, r) => a + r.corsa, 0),
      camm = v.reduce((a, r) => a + r.camm, 0), altro = v.reduce((a, r) => a + r.altro, 0);
    const tot = fren + corsa + camm + altro || 1;
    console.log('           posa: frenata ' + (100 * fren / tot).toFixed(1) + '%  camminata ' + (100 * camm / tot).toFixed(1)
      + '%  corsa ' + (100 * corsa / tot).toFixed(1) + '%  altro ' + (100 * altro / tot).toFixed(1) + '%'
      + '   ·  FRENATA MENTRE CORRE (>40 u/s) ' + (100 * v.reduce((a, r) => a + r.scivola, 0) / tot).toFixed(1) + '%'
      + '   ·  u della frenata ' + med(v.map(r => r.uMin)) + '..' + med(v.map(r => r.uMax)));
  }
})();
