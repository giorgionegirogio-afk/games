/* _x-l23-bordo.js — SONDA AVVERSARIA: la prova A del cancello _q-l23.js
   ripetuta su geometrie che il cancello non prova.

   Il cancello misura la durata della corsa chiamata in UNA sola scena:
   uomo al centro del campo, chiamata ORIZZONTALE, 640 unita' di campo
   libero davanti. La carota di puntoChiamata e' pero' clampata a
   x in [60, FW-60] e y in [50, FH-50] con uno slancio di 170: appena il
   bersaglio finisce sul clamp, la corsa finisce li'.

   Qui si rifa' ESATTAMENTE la scena della prova A — stessa posa, stesso
   seme, stesse misure (avanzata nel verso chiamato, ultima spinta piena,
   picco) — cambiando SOLO dove sta il chiamato e in che direzione lo si
   chiama. OGNI CASO GIRA SU UNA PAGINA NUOVA: il cancello fa girare tutte
   le sue prove sulla stessa pagina e lo stato del cervello di squadra
   sopravvive fra una scena e l'altra; qui no.

   Il primo caso e' quello del cancello, e serve a validare il banco: se
   non torna 333,89 unita' / 1,65 s, questa sonda non vale niente.

   uso: node _x-l23-bordo.js --gioco fuori/l23.html
*/
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = 'C:/Users/Utenteee/Desktop/GitHub/games';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'fuori/l23.html')));
const TAGLIA = +arg('taglia', 5);
const SEME = +arg('seme', 20260820);
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.json': 'application/json' };

function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (/CALCETTO-il-gioco\.html$/i.test(f)) f = GIOCO;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('no'); return; }
      res.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
function semeFisso(s0) {
  let s = s0 >>> 0 || 1;
  const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
  Math.random = () => p() / 4294967296;
  window.__seme = v => { s = (v >>> 0) || 1; };
}
/* copia VERBATIM degli attrezzi del cancello _q-l23.js: stessa avvia,
   stessa posa, stesso passo. Se cambiassi anche una riga qui, il primo
   caso non tornerebbe. */
function attrezziL23() {
  window.__L23 = {
    avvia(tg) {
      const t = window.__test, G = t.G;
      try { t.dismissSplash && t.dismissSplash(); } catch (e) {}
      try { t.setPaused(false); } catch (e) {}
      try { if (t.Tut && t.Tut.active && t.Tut.finish) t.Tut.finish(true); } catch (e) {}
      for (let g = 0; g < 3 && (G.scene !== 'play' || t.taglia !== tg); g++) {
        if (G.scene !== 'play' || t.taglia !== tg) { t.startMatch(1, 1, { size: tg }); }
        for (let i = 0; i < 200 && G.scene !== 'play'; i++) t.simulate(0.1);
      }
      window.__K = { kx: t.campo.FW / 1150, ky: t.campo.FH / 560, kp: (typeof KPASSO !== 'undefined') ? KPASSO : 1 };
      return { scene: G.scene, taglia: t.taglia, FW: t.campo.FW, FH: t.campo.FH, saChiamare: typeof window.chiamaGiocatore === 'function' };
    },
    P(x, y) { return [x * window.__K.kx, y * window.__K.ky]; },
    posa(cfg) {
      const t = window.__test, G = t.G;
      if (G.scene !== 'play') return { errore: "la partita non e' in gioco: scena '" + G.scene + "'" };
      t.setTimeLeft(80);
      if (cfg.cpuCasa !== undefined) t.setCpuVsCpu(!!cfg.cpuCasa);
      const P = G.players; const noi = [], loro = [];
      for (let i = 0; i < P.length; i++) {
        const p = P[i];
        p.vx = 0; p.vy = 0; p.ax = 0; p.ay = 0; p.pvx = 0; p.pvy = 0;
        p.slide = -1; p.recover = 0; p.rove = -1; p.out = 0;
        p.fiato = 100; p.kickCd = 0; p.kickT = 0; p.kickB = 0; p.celeb = 0;
        p.aiT = 0; p.sprint = false;
        try { chiudiAnticipo(p); } catch (e) {}
        if (p.corsaArea !== undefined) p.corsaArea = 0;
        if (p.chiamata !== undefined) p.chiamata = 0;
        if (p.role === 'gk') { p.x = p.team === 0 ? 40 : t.campo.FW - 40; p.y = t.campo.FH / 2; continue; }
        (p.team === 0 ? noi : loro).push(i);
      }
      if (noi.length < 3 || loro.length < 2) return { errore: 'servono almeno 3 uomini in casa e 2 fuori' };
      const pi = (G.ctrl[0] >= 0 && P[G.ctrl[0]].role !== 'gk') ? G.ctrl[0] : noi[0];
      const resto = noi.filter(i => i !== pi);
      const iA = resto[0], iB = resto[1];
      const altri = resto.slice(2);
      P[pi].x = cfg.portatore[0]; P[pi].y = cfg.portatore[1];
      P[pi].fx = 1; P[pi].fy = 0;
      P[iA].x = cfg.A[0]; P[iA].y = cfg.A[1];
      P[iB].x = cfg.B[0]; P[iB].y = cfg.B[1];
      for (let k = 0; k < altri.length; k++) { const q = (cfg.compagni && cfg.compagni[k]) || [60, 40 + k * 40]; P[altri[k]].x = q[0]; P[altri[k]].y = q[1]; }
      for (let k = 0; k < loro.length; k++) { const q = (cfg.avversari && cfg.avversari[k]) || [t.campo.FW - 60, 40 + k * 40]; P[loro[k]].x = q[0]; P[loro[k]].y = q[1]; }
      const b = G.ball;
      b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0; b.curve = 0; b.perfectT = 0;
      b.passTo = -1; b.crossTo = -1; b.tiroT = -1;
      b.owner = pi; b.x = P[pi].x + 14; b.y = P[pi].y;
      try { segnaTocco(pi); } catch (e) {}
      try { G.brain[0].t = 0; G.brain[0].ruoloT = 0; G.brain[1].t = 0; G.brain[1].ruoloT = 0; } catch (e) {}
      return { pi, iA, iB, loro, altri, FW: t.campo.FW, FH: t.campo.FH };
    },
    passo(inchiodati) {
      const t = window.__test, G = t.G;
      t.simulate(1 / 60);
      if (inchiodati) for (const r of inchiodati) { const p = G.players[r[0]]; p.x = r[1]; p.y = r[2]; p.vx = 0; p.vy = 0; p.ax = 0; p.ay = 0; }
    },
  };
}
const n2 = v => (v === null || v === undefined || !isFinite(v)) ? 'n/d' : (Math.round(v * 100) / 100).toString().replace('.', ',');

(async () => {
  const srv = await servi();
  const br = await chromium.launch({ headless: true });

  /* la scena della prova A, con A e la direzione parametrici */
  async function caso(Apos, dir) {
    const ctx = await br.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
    const pag = await ctx.newPage();
    await pag.addInitScript(semeFisso, SEME);
    await pag.addInitScript(attrezziL23);
    await pag.goto('http://127.0.0.1:' + srv.porta + '/CALCETTO-il-gioco.html', { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    const av = await pag.evaluate(t => window.__L23.avvia(t), TAGLIA);
    const r = await pag.evaluate(cfg => {
      const L = window.__L23, t = window.__test, G = t.G;
      window.__seme(cfg.seme);
      const s = L.posa({
        portatore: L.P(600, 280), A: cfg.A, B: L.P(700, 380),
        compagni: [L.P(120, 120)],
        avversari: [L.P(1080, 120), L.P(1080, 200), L.P(1080, 360), L.P(1080, 440)],
      });
      if (s.errore) return { errore: s.errore };
      const inch = s.loro.map(i => [i, G.players[i].x, G.players[i].y]);
      const A = G.players[s.iA];
      const x0 = A.x, y0 = A.y;
      if (typeof window.chiamaGiocatore !== 'function') return { senzaMotore: true };
      chiamaGiocatore(A, cfg.d[0], cfg.d[1]);
      const tr = [];
      for (let f = 0; f < 180; f++) {
        L.passo(inch);
        tr.push((A.x - x0) * cfg.d[0] + (A.y - y0) * cfg.d[1]);
      }
      let best = -1e9, fB = -1, pm = 0; const passi = [];
      for (let f = 0; f < tr.length; f++) {
        if (tr[f] > best) { best = tr[f]; fB = f; }
        const d = tr[f] - (f ? tr[f - 1] : 0); passi.push(d); if (d > pm) pm = d;
      }
      let fS = -1; for (let f = 0; f < passi.length; f++) if (passi[f] >= pm * 0.9) fS = f;
      return { avanzata: best, tSpinta: (fS + 1) / 60, tPicco: (fB + 1) / 60, x0, y0, xF: A.x, yF: A.y, FW: s.FW, FH: s.FH };
    }, { A: Apos, d: dir, seme: SEME });
    await ctx.close();
    return r;
  }

  const CASI = [
    ['[VALIDAZIONE] la scena esatta del cancello: A a (700,180), chiamata a SINISTRA', [700, 180], [-1, 0]],
    ['stessa posizione, chiamata VERSO LA LINEA ALTA (130 unita\' di campo)', [700, 180], [0, -1]],
    ['stessa posizione, chiamata verso la linea BASSA (330 unita\')', [700, 180], [0, 1]],
    ['A al centro (700,280), chiamata verso la linea alta (230 unita\')', [700, 280], [0, -1]],
    ['A largo a (700,480), chiamata verso la linea bassa (30 unita\')', [700, 480], [0, 1]],
    ['A a (700,180), chiamata in diagonale verso l\'angolo alto', [700, 180], [0.707, -0.707]],
    ['A in profondita\' (1000,280), chiamata verso la porta avversaria (90 unita\')', [1000, 280], [1, 0]],
    ['A a (700,180), chiamata a DESTRA in campo aperto (390 unita\')', [700, 180], [1, 0]],
  ];
  console.log('gioco: ' + GIOCO);
  console.log('criterio della prova A del cancello: avanzata >= 120 unita\' E ultima spinta piena fra 1,40 e 1,80 s');
  console.log('');
  for (const [nome, A, d] of CASI) {
    const r = await caso(A, d);
    if (r.errore || r.senzaMotore) { console.log('   n/d — ' + (r.errore || 'chiamaGiocatore non esiste') + '  — ' + nome); continue; }
    const ok = r.avanzata >= 120 && r.tSpinta >= 1.40 && r.tSpinta <= 1.80;
    console.log('  ' + (ok ? 'PASSA ' : 'CADE  ') + 'avanzata ' + n2(r.avanzata).padStart(7) + ' u · spinta piena ' + n2(r.tSpinta) + ' s · picco ' + n2(r.tPicco) + ' s');
    console.log('           ' + nome);
  }
  await br.close(); srv.chiudi();
})().catch(e => { console.error('ESPLOSO: ' + (e && e.stack || e)); process.exit(2); });
