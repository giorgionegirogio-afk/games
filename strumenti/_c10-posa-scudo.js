/* =====================================================================
   _c10-posa-scudo.js — LA FIGURA SCIVOLA: quanti PIXEL cambia la sagoma
   di chi protegge, mentre percorre il campo.

   Non si guarda il fotogramma intero (la telecamera insegue e l'erba
   scorre sotto): si ridisegna la SOLA figura, con Rig3D.disegna, su una
   tela vuota, usando la posa che il gioco ha DIPINTO in quel fotogramma
   (p.poseClip / p.poseU, gli stessi campi che legge __test.poseInCampo)
   e lo stesso angolo. Due istanti a mezzo secondo l'uno dall'altro:
     · quanti pixel del corpo sono cambiati
     · quante unita' di campo ha percorso il corpo nel frattempo

   Tre bracci come in _c10-scudo-cammina.js.
   uso: node strumenti/_c10-posa-scudo.js --gioco fuori/cmd-terza.html
   ===================================================================== */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'fuori/cmd-terza.html')));
const SEMI = String(arg('semi', '20260801,20260802,20260803,20260804,20260805,20260806')).split(',').map(Number);
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
  const T = window.__test, DT = 1 / 60, out = [];
  const tela = document.createElement('canvas'); tela.width = 220; tela.height = 220;
  const c2 = tela.getContext('2d');
  const scatta = (p) => {
    c2.setTransform(1, 0, 0, 1, 0, 0); c2.clearRect(0, 0, 220, 220);
    const clip = Rig3D.CLIPS[p.poseClip];
    Rig3D.disegna(c2, 110, 150, RIG_H, 0.6,
      'alto', p.poseClip, p.poseU / clip.freq, rigLook(p), true, 3.2, 0);
    return c2.getImageData(0, 0, 220, 220).data;
  };
  for (const c of cfg) {
    T.semina(c.seme); T.startMatch(1, 1); T.simulate(1.2);
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
      if (k < 0) continue; const q = P[k];
      q.out = 0; q.x = gx; q.y = FH / 2; q.vx = 0; q.vy = 0; q.slide = -1; q.recover = 0; q.kickCd = 0; q.charge = -1;
    }
    G.ctrl[0] = mio; G.cpu[0] = false; G.cpu[1] = true; G.swTimer[0] = 0; G.swLock[0] = 0;
    A.x = FW * 0.35; A.y = FH / 2; A.vx = 0; A.vy = 0; A.ax = 0; A.ay = 0;
    A.fx = 1; A.fy = 0; A.out = 0; A.slide = -1; A.recover = 0; A.kickCd = 0; A.charge = -1; A.fiato = 100;
    const b = G.ball;
    b.owner = mio; b.passTo = -1; b.crossTo = -1; b.x = A.x + 16; b.y = A.y; b.z = 0;
    b.vx = 0; b.vy = 0; b.vz = 0; b.curve = 0; b.perfectT = 0;
    const S = Touch5.stick[0];
    S.active = true; S.id = 1; S.ox = 100; S.oy = 300; S.dx = c.lev; S.dy = 0; S.hist = [];
    Touch5.btnTouch = {}; Touch5.atti = {};
    if (c.scudo) {
      const d5 = T.pulsanti(0).find(z => z.act === 'sprint');
      Touch5.nasceAtto('sc', 0, 4, 'sprint', d5 ? d5.x : 0, d5 ? d5.y : 0);
      Touch5.btnTouch['sc'] = { t: 0, act: 'sprint' };
    }
    if (G.brain[0]) G.brain[0].ruoloT = -1;
    if (G.brain[1]) G.brain[1].ruoloT = -1;
    D.x = A.x - 40; D.y = A.y; D.out = 0; D.slide = -1; D.recover = 0; D.kickCd = 0; D.charge = -1;
    D.vx = 160; D.vy = 0; D.fx = 1; D.fy = 0;

    /* mezzo secondo di assestamento, poi i due istanti */
    for (let f = 0; f < 30; f++) T.simulate(DT);
    T.disegna();
    const c1 = scatta(A), cZero = scatta(A), x1 = A.x, y1 = A.y, k1 = A.poseClip, u1 = A.poseU;
    for (let f = 0; f < 30; f++) T.simulate(DT);
    T.disegna();
    const c2b = scatta(A), x2 = A.x, y2 = A.y;
    let dif = 0, corpo = 0, zero = 0;
    for (let i = 0; i < c1.length; i += 4) {
      const a1 = c1[i + 3], a2 = c2b[i + 3];
      if (a1 > 24 || a2 > 24) corpo++;
      if (Math.abs(a1 - a2) > 24 || Math.abs(c1[i] - c2b[i]) > 24 ||
          Math.abs(c1[i + 1] - c2b[i + 1]) > 24 || Math.abs(c1[i + 2] - c2b[i + 2]) > 24) dif++;
      if (Math.abs(c1[i + 3] - cZero[i + 3]) > 24 || Math.abs(c1[i] - cZero[i]) > 24 ||
          Math.abs(c1[i + 1] - cZero[i + 1]) > 24 || Math.abs(c1[i + 2] - cZero[i + 2]) > 24) zero++;
    }
    out.push({
      braccio: c.braccio, clip: k1, clip2: A.poseClip,
      u1: +u1.toFixed(3), u2: +A.poseU.toFixed(3),
      corse: +Math.hypot(x2 - x1, y2 - y1).toFixed(1),
      difPx: dif, corpoPx: corpo, zeroPx: zero,
      quota: corpo ? +(100 * dif / corpo).toFixed(1) : null,
      mio: b.owner >= 0 && P[b.owner].team === 0,
    });
  }
  return out;
};

(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const pag = await ctx.newPage();
  pag.on('pageerror', e => console.error('  ! ' + e.message));
  await pag.goto('http://127.0.0.1:' + srv.porta + '/CALCETTO-il-gioco.html', { waitUntil: 'load' });
  await pag.evaluate(async () => { try { window.__test.dismissSplash(); } catch (e) { } await document.fonts.ready; });
  await new Promise(r => setTimeout(r, 800));
  const BRACCI = [
    { braccio: 'fermo', scudo: 1, lev: 0 },
    { braccio: 'cammina', scudo: 1, lev: LEV },
    { braccio: 'libero', scudo: 0, lev: LEV },
  ];
  const casi = [];
  for (const seme of SEMI) for (const b of BRACCI) casi.push({ seme, ...b });
  const R = await pag.evaluate(`(${BANCO})(${JSON.stringify(casi)})`);
  await br.close(); srv.chiudi();
  console.log('\n=== LA SAGOMA DI CHI PROTEGGE, MEZZO SECONDO DOPO — ' + path.basename(GIOCO) + ' ===');
  const med = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[s.length >> 1] : null; };
  for (const b of BRACCI) {
    const v = R.filter(r => r.braccio === b.braccio && r.difPx !== undefined);
    if (!v.length) { console.log('  ' + b.braccio + ': nessun caso'); continue; }
    console.log('  ' + b.braccio.padEnd(9) + String(v.length).padStart(3) + ' casi'
      + '   clip ' + [...new Set(v.map(r => r.clip))].join('/')
      + '   u ' + med(v.map(r => r.u1)) + ' -> ' + med(v.map(r => r.u2))
      + '   campo percorso ' + String(med(v.map(r => r.corse))).padStart(6) + ' u'
      + '   PIXEL DELLA SAGOMA CAMBIATI ' + String(med(v.map(r => r.quota))).padStart(5) + '%'
      + '  (' + med(v.map(r => r.difPx)) + ' su ' + med(v.map(r => r.corpoPx)) + ')'
      + '   ZERO DEL RIGHELLO ' + med(v.map(r => r.zeroPx)) + ' px');
  }
})();
