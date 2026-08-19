/* =====================================================================
   _z-camera.js — SOLA MISURA. Non scrive niente nel gioco.

   Tre domande sulla CAMERA BASSA (Rig3D CAMERE.bassa, 16 gradi):

   A. QUANTO DURA GIA' OGGI. Su N partite a semi dichiarati, quanti
      fotogrammi cadono in ciascuno stato: partita in pianta, gol,
      ripresa dedicata del gol (camera bassa), duello dal dischetto
      (camera bassa) fase per fase. Passata a sola fisica: la ripresa e
      il duello sono STATO (G.ripresa, Duel.phase), non disegno, quindi
      si contano senza pagare il rasterizzatore.

   B. COSA CAMBIA NELLA FIGURA fra le due camere. La stessa clip, la
      stessa fase, la stessa imbardata, la stessa altezza apparente,
      disegnate una volta in 'alto' e una in 'bassa': quanto e' alta e
      larga l'impronta di pixel nei due casi. Serve a sapere se una
      figura si puo' spostare da una camera all'altra senza ritarare
      niente.

   D. DUE VERBI SI DISTINGUONO? Due clip disegnate nello stesso punto,
      con la stessa altezza e la stessa fase, quanto differiscono in
      pixel — e come cambia la differenza girando l'imbardata. E' la
      misura che non ha bisogno di una soglia dichiarata: la giuria non
      deve stimare un angolo, deve dire QUALE verbo, e due verbi si
      possono nominare solo se fanno due immagini diverse.

   C. QUANTO COSTA. Il fondale della camera bassa (duelFondo) in
      cottura e a cache calda; e il tempo di UN FOTOGRAMMA intero nelle
      tre situazioni — partita in pianta, ripresa del gol, duello —
      misurato con lo stesso render() del ciclo vero.

   uso:  node strumenti/_z-camera.js [--partite 30] [--seme 20260803]
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const PARTITE = +arg('partite', 30);
const SEME = +arg('seme', 20260803);
/* le tre sezioni si possono chiedere separatamente: la C e' CRONOMETRICA
   e va eseguita a banco libero, come vuole la regola di casa */
const SOLO = arg('solo', 'ABCD').toUpperCase();

function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(RADICE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

const quart = (a, q) => { if (!a.length) return NaN; const b = a.slice().sort((x, y) => x - y); const i = (b.length - 1) * q; const lo = Math.floor(i), hi = Math.ceil(i); return b[lo] + (b[hi] - b[lo]) * (i - lo); };
const f = (x, d) => (isFinite(x) ? x.toFixed(d === undefined ? 2 : d) : '  -');

(async () => {
  const srv = await servi();
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  try {
    const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
    const pag = await ctx.newPage();
    const errori = []; pag.on('pageerror', e => errori.push(e.message));
    await pag.addInitScript(seme => {
      let s = seme >>> 0 || 1;
      const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
      Math.random = () => p() / 4294967296;
      window.__caso = { semina(n) { s = n >>> 0 || 1; } };
    }, SEME);
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 30000 });
    await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
    await pag.waitForTimeout(250);
    await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });

    /* ---------------- A. il bilancio del tempo ---------------------- */
    console.log('\n=====================================================================');
    console.log(' _z-camera — telefono 915x412 @2   partite: ' + PARTITE + '   seme: ' + SEME);
    console.log('=====================================================================');
    console.log('\n-- A. QUANTO DURA GIA\' OGGI LA CAMERA BASSA ----------------------');
    const A = { tot: 0, st: {}, riprese: 0, duelli: 0, rigoriSerie: 0, partite: 0, durRip: [], durDuel: [] };
    for (let i = 0; SOLO.indexOf('A') >= 0 && i < PARTITE; i++) {
      const r = await pag.evaluate(seme => {
        const t = window.__test;
        window.__caso.semina(seme);
        t.startMatch(1, 1); t.setCpuVsCpu(true);
        const st = {}; let n = 0, rip = 0, duel = 0, serie = 0;
        let inRip = 0, inDuel = 0; const dR = [], dD = [];
        let eraRip = false, eraDuel = false;
        while (t.state !== 'end' && n < 60 * 300) {
          t.simulate(1 / 60); n++;
          const s = t.state;
          const R = !!G.ripresa;
          const D = Duel.phase !== 'off';
          let k = s;
          if (R) k = 'goal+RIPRESA(bassa)';
          else if (D) k = 'duello(bassa)/' + Duel.phase;
          else if (s === 'goal' && G.moviola) k = 'goal+moviola';
          st[k] = (st[k] || 0) + 1;
          if (R) { inRip++; if (!eraRip) rip++; } else if (eraRip) { dR.push(inRip); inRip = 0; }
          if (D) { inDuel++; if (!eraDuel) duel++; } else if (eraDuel) { dD.push(inDuel); inDuel = 0; }
          eraRip = R; eraDuel = D;
        }
        if (G.rigori) serie = 1;
        return { st, n, rip, duel, serie, dR, dD, scena: t.state };
      }, (SEME + i * 7919) >>> 0);
      A.tot += r.n; A.partite++;
      for (const k in r.st) A.st[k] = (A.st[k] || 0) + r.st[k];
      A.riprese += r.rip; A.duelli += r.duel; A.rigoriSerie += r.serie;
      A.durRip.push(...r.dR); A.durDuel.push(...r.dD);
      if ((i + 1) % 10 === 0) console.log('   -- ' + (i + 1) + '/' + PARTITE + ' partite');
    }
    if (!A.tot) console.log('   (sezione A non richiesta: --solo ' + SOLO + ')');
    else console.log('   fotogrammi in tutto: ' + A.tot + '  (' + (A.tot / 60).toFixed(0) + ' s di gioco su ' + A.partite + ' partite)');
    const righe = Object.keys(A.st).sort((a, b) => A.st[b] - A.st[a]);
    for (const k of righe)
      console.log('     ' + k.padEnd(28) + String(A.st[k]).padStart(9) + '  ' +
        (A.st[k] / A.tot * 100).toFixed(2).padStart(6) + '%   ' + (A.st[k] / 60 / A.partite).toFixed(2) + ' s/partita');
    const bassaFr = righe.filter(k => k.indexOf('bassa') >= 0).reduce((s, k) => s + A.st[k], 0);
    console.log('   ------------------------------------------------------------------');
    console.log('   CAMERA BASSA IN TUTTO: ' + bassaFr + ' fotogrammi = ' +
      (bassaFr / A.tot * 100).toFixed(2) + '% del tempo, ' + (bassaFr / 60 / A.partite).toFixed(2) + ' s per partita');
    console.log('   riprese del gol: ' + A.riprese + ' (' + (A.riprese / A.partite).toFixed(2) + ' per partita, durata mediana ' +
      f(quart(A.durRip, .5) / 60, 2) + ' s)');
    console.log('   duelli dal dischetto: ' + A.duelli + ' (' + (A.duelli / A.partite).toFixed(2) + ' per partita, durata mediana ' +
      f(quart(A.durDuel, .5) / 60, 2) + ' s) — serie di rigori in ' + A.rigoriSerie + '/' + A.partite + ' partite');

    /* ---------------- B. la figura nelle due camere ------------------ */
    console.log('\n-- B. LA STESSA FIGURA NELLE DUE CAMERE --------------------------');
    const B = SOLO.indexOf('B') < 0 ? [] : await pag.evaluate(() => {
      const W = 640, H = 640;
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const g = cv.getContext('2d', { willReadFrequently: true });
      const misura = (clip, u, yaw, hPx, cam) => {
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
        Rig3D.disegna(g, W / 2, H * 0.80, hPx, yaw, cam, clip, u / Rig3D.CLIPS[clip].freq,
          Rig3D.lookPredefinito, true, 1, 0);
        const d = g.getImageData(0, 0, W, H).data;
        let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, n = 0;
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          if (d[(y * W + x) * 4 + 3] > 24) { n++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        }
        return { h: y1 < 0 ? 0 : y1 - y0 + 1, w: x1 < 0 ? 0 : x1 - x0 + 1, ink: n };
      };
      const out = [];
      const clips = ['fermo', 'corsa', 'tiro', 'cross', 'parata', 'tuffo', 'presa',
        'scivolata', 'rovesciata', 'esultanza', 'cielo', 'pugno', 'ginocchia'];
      for (const c of clips) {
        if (!Rig3D.CLIPS[c]) continue;
        for (const yaw of [0, Math.PI / 4, Math.PI / 2]) {
          const a = misura(c, 0.45, yaw, 94, 'alto');
          const b = misura(c, 0.45, yaw, 94, 'bassa');
          out.push({ clip: c, yaw: +yaw.toFixed(3), a, b });
        }
      }
      return out;
    });
    console.log('   hPx = 94 px di periferica (l\'altezza mediana in partita), fase u = 0,45');
    console.log('   ' + 'clip'.padEnd(11) + 'imbard.'.padStart(8) + '  |  ALTO h x w   ink  |  BASSA h x w   ink  |  h bassa/alto  w bassa/alto');
    for (const r of B) {
      console.log('   ' + r.clip.padEnd(11) + (r.yaw * 180 / Math.PI).toFixed(0).padStart(6) + 'gr' +
        '  |  ' + String(r.a.h).padStart(3) + ' x ' + String(r.a.w).padStart(3) + ' ' + String(r.a.ink).padStart(6) +
        '  |  ' + String(r.b.h).padStart(3) + ' x ' + String(r.b.w).padStart(3) + ' ' + String(r.b.ink).padStart(6) +
        '  |  ' + f(r.b.h / (r.a.h || 1), 3).padStart(10) + f(r.b.w / (r.a.w || 1), 3).padStart(14));
    }

    /* ---------------- D. due verbi si distinguono? -------------------- */
    /* =====================================================================
       LA MISURA CHE NON HA BISOGNO DI UNA SOGLIA DICHIARATA.
       La giuria non deve stimare un'imbardata: deve dire QUALE verbo. Due
       verbi si possono nominare solo se producono due immagini diverse.
       Qui si disegnano due clip nello STESSO punto a terra, con la stessa
       altezza, la stessa fase e la stessa imbardata, e si conta quanto le
       due maschere di pixel differiscono: differenza simmetrica diviso
       unione (0 = identiche, 1 = disgiunte). Poi si gira l'imbardata.
       Se la separazione non cresce con l'imbardata, la leva non serve a
       nominare i verbi, per quanto cresca sigma2.
       ===================================================================== */
    if (SOLO.indexOf('D') >= 0) {
      console.log('\n-- D. DUE VERBI SI DISTINGUONO? (differenza simmetrica / unione) ---');
      const Dt = await pag.evaluate(() => {
        const W = 560, H = 560, hPx = 94;
        const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
        const g = cv.getContext('2d', { willReadFrequently: true });
        const mask = (clip, u, yaw, cam) => {
          g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
          Rig3D.disegna(g, W / 2, H * 0.80, hPx, yaw, cam, clip, u / Rig3D.CLIPS[clip].freq,
            Rig3D.lookPredefinito, true, 1, 0);
          const d = g.getImageData(0, 0, W, H).data;
          const m = new Uint8Array(W * H);
          for (let i = 0; i < W * H; i++) m[i] = d[i * 4 + 3] > 24 ? 1 : 0;
          return m;
        };
        const iou = (a, b) => { let inter = 0, uni = 0; for (let i = 0; i < a.length; i++) { if (a[i] | b[i]) { uni++; if (a[i] & b[i]) inter++; } } return uni ? (uni - inter) / uni : 0; };
        const VERBI = ['tiro', 'cross', 'parata', 'tuffo', 'presa', 'scivolata', 'rovesciata', 'esultanza', 'cielo', 'pugno', 'corsa'];
        const gradi = [0, 10, 20, 30, 45, 60, 90];
        const out = { gradi, cop: [], perCam: {} };
        for (const cam of ['alto', 'bassa']) {
          const M = {};
          for (const g2 of gradi) {
            const yaw = g2 * Math.PI / 180;
            M[g2] = {};
            for (const c of VERBI) M[g2][c] = mask(c, 0.45, yaw, cam);
          }
          const righe = [];
          for (let i = 0; i < VERBI.length; i++) for (let j = i + 1; j < VERBI.length; j++) {
            const r = { a: VERBI[i], b: VERBI[j], v: gradi.map(g2 => +iou(M[g2][VERBI[i]], M[g2][VERBI[j]]).toFixed(3)) };
            righe.push(r);
          }
          out.perCam[cam] = righe;
        }
        return out;
      });
      for (const cam of ['alto', 'bassa']) {
        const righe = Dt.perCam[cam];
        console.log('   camera ' + cam.toUpperCase() + ' — hPx 94 px, fase 0,45; 0 = due disegni identici');
        console.log('   ' + 'coppia'.padEnd(24) + Dt.gradi.map(x => (x + 'gr').padStart(8)).join(''));
        const med = Dt.gradi.map((_, k) => quart(righe.map(r => r.v[k]), .5));
        for (const r of righe.slice().sort((x, y) => x.v[0] - y.v[0]).slice(0, 12))
          console.log('   ' + (r.a + ' vs ' + r.b).padEnd(24) + r.v.map(x => f(x, 3).padStart(8)).join(''));
        console.log('   ' + 'MEDIANA di tutte le coppie'.padEnd(24) + med.map(x => f(x, 3).padStart(8)).join(''));
        console.log('   ' + 'MINIMO fra le coppie'.padEnd(24) +
          Dt.gradi.map((_, k) => f(Math.min(...righe.map(r => r.v[k])), 3).padStart(8)).join(''));
        console.log('');
      }
    }

    /* ---------------- C. il costo ------------------------------------ */
    console.log('\n-- C. IL COSTO -----------------------------------------------------');
    if (SOLO.indexOf('C') < 0) { console.log('   (non richiesta)'); await ctx.close(); return; }
    const C = await pag.evaluate(() => {
      const out = {};
      /* IL CRONOMETRO A LOTTI. performance.now() in questo browser e'
         arrotondato (si vedono zeri): cronometrare una chiamata sola
         restituisce 0 o un gradino. Si cronometra un LOTTO di k chiamate
         e si divide, ripetendo n volte; si stampa la mediana dei lotti.
         Resta una misura in headless — vale come ordine di grandezza e
         per il CONFRONTO fra due strade, non come tempo su un telefono. */
      const cron = (fn, n, k) => {
        k = k || 10; const t = [];
        for (let i = 0; i < 3; i++) fn();                 // scaldata
        for (let i = 0; i < n; i++) {
          const a = performance.now();
          for (let j = 0; j < k; j++) fn();
          t.push((performance.now() - a) / k);
        }
        t.sort((x, y) => x - y);
        return { med: +t[Math.floor(n / 2)].toFixed(3), min: +t[0].toFixed(3), max: +t[n - 1].toFixed(3), lotti: n, per_lotto: k };
      };
      const t = window.__test;
      /* 1. il fondale della camera bassa */
      const g0 = duelGeo();
      out.fondaleCottura = cron(() => { const g2 = Object.assign({}, g0, { hz: g0.hz + Math.random() }); duelFondo(g2, 1); }, 9, 3);
      out.fondaleCache = cron(() => duelFondo(g0, 1), 9, 200);
      out.fondaleDim = [Math.round(VW * Math.min(2, DPR)), Math.round(VH * Math.min(2, DPR))];
      /* la drawImage del fondale a schermo pieno: e' quello che si paga
         a OGNI fotogramma della camera bassa */
      const tex = duelFondo(g0, 1);
      out.fondaleDraw = cron(() => { ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.drawImage(tex, 0, 0, VW, VH); }, 9, 30);
      /* 2. un fotogramma intero, in partita */
      window.__caso.semina(20260803);
      t.startMatch(1, 1); t.setCpuVsCpu(true);
      t.simulate(12);
      out.scenaPlay = t.state;
      out.framePianta = cron(() => t.disegna(), 9, 20);
      /* 3. un fotogramma intero durante la RIPRESA del gol */
      let n = 0, sem = 1;
      while (n < 60 * 600 && !(G.scene === 'goal' && G.ripresa)) {
        /* se la partita finisce se ne comincia un'altra: aspettare un gol
           dentro una partita gia' chiusa e' aspettare per sempre */
        if (t.state === 'end' || t.state === 'menu') {
          window.__caso.semina(20260803 + (sem++) * 7919);
          t.startMatch(1, 1); t.setCpuVsCpu(true);
        }
        t.simulate(1 / 60); n++;
      }
      if (G.scene === 'goal' && G.ripresa) {
        G.ripresa.t = 0.4; G.ripresa.dur = 1e6;      // si tiene aperta per cronometrarla
        out.frameRipresa = cron(() => t.disegna(), 9, 20);
      } else out.frameRipresa = { nota: 'nessun gol nei 200 s simulati' };
      /* 4. un fotogramma intero durante il DUELLO */
      window.__caso.semina(20260803);
      t.startMatch(1, 1); t.setCpuVsCpu(true); t.simulate(3);
      t.rigori && t.rigori();
      let m = 0; while (m < 600 && Duel.phase === 'off') { t.simulate(1 / 60); m++; }
      out.duelFase = Duel.phase;
      out.frameDuello = Duel.phase !== 'off' ? cron(() => t.disegna(), 9, 20) : { nota: 'duello non aperto' };
      /* 5. L'ALTERNATIVA: stringere la camera DALL'ALTO. Il manto ha gia'
         una "finestra nitida" che si ricuoce quando lo zoom sale e resta
         fermo (campoVivoDisegna). Questo e' il suo prezzo, e va messo
         accanto a quello del fondale della camera bassa. */
      out.campoVivo = cron(() => {
        const w = 560, h = 260;
        let t2 = Math.sqrt(3.2e6 / (w * h));
        const cv2 = document.createElement('canvas');
        cv2.width = Math.ceil(w * t2); cv2.height = Math.ceil(h * t2);
        const c2 = cv2.getContext('2d');
        c2.setTransform(t2, 0, 0, t2, 0, 0);
        c2.beginPath(); c2.rect(0, 0, w, h); c2.clip();
        const TH = FIELDS[clamp(G.fieldIdx | 0, 0, FIELDS.length - 1)].th;
        paintField(c2, TH, PADX, PADY, 1, true);
      }, 3, 2);
      out.campoInteroDim = [fieldTex.width, fieldTex.height, +fieldTexTS.toFixed(3)];
      out.campoIntero = cron(() => buildFieldTex(), 3, 2);
      return out;
    });
    console.log('   fondale camera bassa (duelFondo), tela ' + C.fondaleDim.join('x') + ':');
    console.log('     cottura        ' + JSON.stringify(C.fondaleCottura) + ' ms');
    console.log('     cache calda    ' + JSON.stringify(C.fondaleCache) + ' ms');
    console.log('     drawImage/frame ' + JSON.stringify(C.fondaleDraw) + ' ms');
    console.log('   UN FOTOGRAMMA INTERO (stesso render() del ciclo vero):');
    console.log('     partita in pianta   ' + JSON.stringify(C.framePianta) + ' ms');
    console.log('     ripresa del gol     ' + JSON.stringify(C.frameRipresa) + ' ms');
    console.log('     duello (' + C.duelFase + ')' + '     ' + JSON.stringify(C.frameDuello) + ' ms');
    console.log('   L\'ALTERNATIVA (stringere dall\'alto): ricottura del manto');
    console.log('     finestra nitida (campoVivo, ~3,2 Mpx)  ' + JSON.stringify(C.campoVivo) + ' ms');
    console.log('     tessitura intera del campo ' + C.campoInteroDim.slice(0, 2).join('x') +
      ' (scala ' + C.campoInteroDim[2] + ')  ' + JSON.stringify(C.campoIntero) + ' ms');
    if (errori.length) console.log('\n   ERRORI DI PAGINA: ' + errori.join(' | '));
    console.log('');
    await ctx.close();
  } finally { await browser.close(); srv.chiudi(); }
})().catch(e => { console.error(e); process.exit(1); });
