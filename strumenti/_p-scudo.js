/* =====================================================================
   _p-scudo.js — IL BANCO DELLO SCUDO: un portatore fermo, un avversario
   che arriva, e un dito che tiene (o non tiene) il quinto disco.

   PERCHE' NON BASTA _eventi.js, ed e' la stessa ragione di
   _p-strappo.js: quello misura partite CPU contro CPU, e una cura che
   vive SOLO sotto il dito umano non ci si vede ne' in bene ne' in male.
   Su _eventi.js una cura umana deve uscire IDENTICA AL BIT — ed e'
   proprio quella la prova che non ha sporcato niente. Il rendimento si
   misura qui.

   COS'E' UN DUELLO. Si spegne il campo fino a quattro uomini di
   movimento (out>0 e' il modo del gioco stesso di togliere un uomo:
   vuol dire espulso). Resta un PORTATORE della squadra 0, FERMO col
   pallone al piede — fermo perche' lo scudo e' proprio quello: non
   scappo, tengo — e UN AVVERSARIO piazzato a distanza e angolo
   dichiarati, lanciato addosso a lui alla velocita' dichiarata. Gli
   altri due (uno per parte) stanno parcheggiati sulla propria linea
   perche' il cervello di squadra abbia un «ultimo uomo» da nominare e
   il duello lo facciano gli altri due: senza, il difensore si ritira e
   il banco misura una ritirata (la lezione l'ha gia' pagata
   _p-strappo.js).

   I DUE BRACCI SONO IDENTICI IN TUTTO TRANNE UNA COSA: nel braccio
   SCUDO un dito tiene il quinto disco, cioe' esiste un atto vivo con
   act 'sprint' e il suo btnTouch. Stessa geometria, stessi semi, stesso
   pollice fermo sulla levetta. La differenza che si legge e' la cura.

   IL BANCO E' ONESTO: prima di misurare verifica che Touch5.scatta(0)
   risponda davvero «si'» nel braccio scudo e «no» nel braccio libero.
   Se un braccio non e' quello che dice di essere, il duello si scarta e
   si conta a parte (colonna «nulli»), invece di finire nella media.

   COSA SI MISURA, dopo un secondo e mezzo:
     mio       il pallone e' ancora della squadra 0
     loro      l'ha l'avversario
     libero    non e' di nessuno
     tolto     in quale fotogramma il pallone ha cambiato padrone (-1 se
               non e' successo)
     dCorpo    la distanza minima fra l'avversario e il PALLONE durante
               il duello: e' la misura fisica dello scudo — se il corpo
               sta in mezzo, quella distanza non scende mai come prima

   uso:
     node strumenti/_p-scudo.js --gioco fuori/cmd-terza.html
     node strumenti/_p-scudo.js --gioco fuori/cmd-terza-base.html   (base: lo scudo non esiste, i due bracci devono pareggiare)
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
const FRAMES = +arg('frames', 90);
const JSONOUT = arg('json', '');
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

    /* il portatore: FERMO col pallone al piede, in mezzo al campo */
    A.x = FW * 0.5; A.y = FH / 2; A.vx = 0; A.vy = 0; A.ax = 0; A.ay = 0;
    A.fx = 1; A.fy = 0; A.out = 0; A.slide = -1; A.recover = 0; A.kickCd = 0; A.charge = -1;
    A.fiato = 100;
    const b = G.ball;
    b.owner = mio; b.passTo = -1; b.crossTo = -1; b.x = A.x + 16; b.y = A.y; b.z = 0;
    b.vx = 0; b.vy = 0; b.vz = 0; b.curve = 0; b.perfectT = 0;

    /* IL POLLICE. La levetta e' FERMA in tutti e due i bracci (lo scudo
       vive sotto la zona morta); quello che cambia e' il secondo dito. */
    const S = Touch5.stick[0];
    S.active = true; S.id = 1; S.ox = 100; S.oy = 300; S.dx = 0; S.dy = 0; S.hist = [];
    Touch5.btnTouch = {};
    Touch5.atti = {};
    if (c.scudo) {
      /* si arma l'atto come lo armerebbe Touch5.start: stessa funzione,
         stesso slot, stesso act. Non si finge uno stato: si usa il
         motore d'ingresso del gioco. */
      const d5 = T.pulsanti(0).find(z => z.act === 'sprint');
      Touch5.nasceAtto('sc', 0, 4, 'sprint', d5 ? d5.x : 0, d5 ? d5.y : 0);
      Touch5.btnTouch['sc'] = { t: 0, act: 'sprint' };
    }
    if (G.brain[0]) G.brain[0].ruoloT = -1;
    if (G.brain[1]) G.brain[1].ruoloT = -1;

    /* l'avversario si piazza esatto e punta il portatore */
    const ra = c.ang * Math.PI / 180;
    D.x = A.x + Math.cos(ra) * c.dist;
    D.y = A.y + Math.sin(ra) * c.dist;
    D.out = 0; D.slide = -1; D.recover = 0; D.kickCd = 0; D.charge = -1;
    {
      const dx = A.x - D.x, dy = A.y - D.y, dl = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      D.vx = dx / dl * c.impegno; D.vy = dy / dl * c.impegno;
      D.ax = 0; D.ay = 0; D.fx = dx / dl; D.fy = dy / dl;
    }

    /* IL BANCO SI CONTROLLA DA SOLO: il braccio e' quello che dice? */
    const tenuta = (typeof Touch5.scatta === 'function') ? !!Touch5.scatta(0) : null;
    if (tenuta !== null && tenuta !== !!c.scudo) { out.push({ nullo: 'tenuta ' + tenuta }); continue; }

    let tolto = -1, dCorpo = 1e9, girato = 0;
    const own0 = b.owner;
    for (let f = 0; f < c.frames; f++) {
      T.simulate(DT);
      const d = Math.hypot(D.x - b.x, D.y - b.y);
      if (d < dCorpo) dCorpo = d;
      if (tolto < 0 && b.owner !== own0) tolto = f;
      /* «di spalle»: il prodotto scalare fra i due sguardi. Positivo =
         il portatore da' le spalle a chi arriva. */
      girato += (D.fx * A.fx + D.fy * A.fy);
    }
    let esito = 'libero';
    if (b.owner >= 0) esito = (P[b.owner].team === 0) ? 'mio' : 'loro';
    out.push({
      esito, tolto, dCorpo: +dCorpo.toFixed(2), girato: +(girato / c.frames).toFixed(3),
      fiato: +A.fiato.toFixed(1),
      scudo: c.scudo ? 1 : 0, sorteggi: T.sorteggi,
      tenuta: tenuta === null ? 'assente' : (tenuta ? 'si' : 'no'),
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

  const casi = [];
  for (const seme of SEMI) for (const dist of DIST) for (const ang of ANG) for (const impegno of IMPEGNO)
    for (const scudo of [0, 1]) casi.push({ seme, dist, ang, impegno, scudo, frames: FRAMES });

  const R = [];
  const LOTTO = 40;
  for (let i = 0; i < casi.length; i += LOTTO) {
    const parte = await pag.evaluate(`(${BANCO})(${JSON.stringify(casi.slice(i, i + LOTTO))})`);
    R.push(...parte);
  }
  await br.close(); srv.chiudi();

  const nulli = R.filter(r => r.nullo || r.salta).length;
  const buoni = R.filter(r => r.esito);
  const arm = s => buoni.filter(r => r.scudo === s);
  const riga = (nome, v) => {
    const n = v.length || 1;
    const mio = v.filter(r => r.esito === 'mio').length;
    const loro = v.filter(r => r.esito === 'loro').length;
    const lib = v.filter(r => r.esito === 'libero').length;
    const persi = v.filter(r => r.tolto >= 0);
    const dc = v.map(r => r.dCorpo).sort((a, b) => a - b);
    const tt = persi.map(r => +(r.tolto / 60).toFixed(2)).sort((a, b) => a - b);
    const gir = v.reduce((a, r) => a + r.girato, 0) / n;
    console.log('  ' + nome.padEnd(10)
      + String(v.length).padStart(5) + ' duelli'
      + '   mio ' + (100 * mio / n).toFixed(1).padStart(5) + '%'
      + '   loro ' + (100 * loro / n).toFixed(1).padStart(5) + '%'
      + '   libero ' + (100 * lib / n).toFixed(1).padStart(5) + '%'
      + '   pallone perso ' + (100 * persi.length / n).toFixed(1).padStart(5) + '%'
      + '   dCorpo mediana ' + (dc.length ? dc[dc.length >> 1].toFixed(1) : '-').padStart(6)
      + '   spalle ' + gir.toFixed(3).padStart(7)
      + '   perso al secondo ' + (tt.length ? tt[tt.length >> 1].toFixed(2) : '  -  ').padStart(5)
      + '   fiato finale ' + (v.reduce((a, r) => a + (r.fiato || 0), 0) / n).toFixed(1).padStart(5));
    return { n: v.length, mio: +(100 * mio / n).toFixed(1), loro: +(100 * loro / n).toFixed(1),
             libero: +(100 * lib / n).toFixed(1), persi: +(100 * persi.length / n).toFixed(1),
             dCorpo: dc.length ? +dc[dc.length >> 1].toFixed(1) : null, spalle: +gir.toFixed(3),
             persoAlSecondo: tt.length ? tt[tt.length >> 1] : null,
             fiatoFine: +(v.reduce((a, r) => a + (r.fiato || 0), 0) / n).toFixed(1) };
  };
  console.log('\n=== LO SCUDO — ' + path.basename(GIOCO) + ' ===');
  console.log('  ' + R.length + ' duelli corsi, ' + nulli + ' nulli (braccio non valido o scena sbagliata)');
  const a0 = riga('libero', arm(0));
  const a1 = riga('SCUDO', arm(1));
  const dPersi = a1.persi - a0.persi;
  console.log('\n  differenza SCUDO - libero:  pallone perso ' + (dPersi >= 0 ? '+' : '') + dPersi.toFixed(1)
    + ' punti  ·  dCorpo ' + ((a1.dCorpo - a0.dCorpo) >= 0 ? '+' : '') + (a1.dCorpo - a0.dCorpo).toFixed(1) + ' u');
  if (JSONOUT) { fs.writeFileSync(path.resolve(RADICE, JSONOUT), JSON.stringify({ gioco: path.basename(GIOCO), nulli, libero: a0, scudo: a1 }, null, 1)); console.log('  -> ' + JSONOUT); }
})();
