/* =====================================================================
   _sonda-strappo-dito.js — IL DITO ALZATO, E LA TRAVERSATA VERA.

   Tre gesti deterministici, nessun dado, nessuna griglia: servono a dire
   SI' o NO su tre domande che una percentuale non risponde.

     A  DITO ALZATO CON CALMA. Corri a destra col pollice, ALZA il dito,
        lascia passare due fotogrammi, riappoggia e vira di 90 gradi.
        Nessuno ha chiesto una finta: deve accendersi ZERO.
     B  DITO ALZATO DENTRO IL CENTRO, SENZA UN FOTOGRAMMA IN MEZZO. Il
        pollice entra nella banda morta, passa UN fotogramma, e poi nello
        stesso intervallo fra due passi arrivano touchend + touchstart +
        touchmove girati di 90 gradi. E' l'unico caso in cui la memoria
        del comando sopravvive al distacco con «fermo» gia' maggiore di
        zero e «stick» ancora vero: e' esattamente il buco che l'ancora
        12/12 (memCmd azzerato dentro Touch5.chiudi) chiude, e l'unico in
        cui quell'ancora NON e' ridondante rispetto alla guardia
        memCmd.stick. Deve accendersi ZERO.
     C  CONTROLLO — LA TRAVERSATA VERA. Stesso pollice, ma il dito non si
        alza mai: attraversa il centro e riappare girato. Deve accendersi
        UNO, se no la cura ha ucciso il verbo invece del difetto.

   uso: node strumenti/_sonda-strappo-dito.js
        node strumenti/_sonda-strappo-dito.js --gioco fuori/strappo2.html
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
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

/* eslint-disable no-undef */
const SONDA = () => {
  const T = window.__test;
  const DT = 1 / 60;
  const OX = 120, OY = 300;      // l'origine della levetta, lontana dai dischi

  function apparecchia(seme) {
    window.__caso.semina(seme);
    T.startMatch(1, 1);
    T.simulate(1.2);
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
    for (const [k, gx] of [[mioCasa, 70], [suoCasa, FW - 70]]) {
      if (k < 0) continue;
      const q = P[k];
      q.out = 0; q.x = gx; q.y = FH / 2; q.vx = 0; q.vy = 0; q.ax = 0; q.ay = 0;
      q.slide = -1; q.recover = 0; q.kickCd = 0; q.charge = -1;
    }
    const A = P[mio], D = P[suo];
    G.ctrl[0] = mio; G.cpu[0] = false; G.cpu[1] = true; G.swTimer[0] = 0; G.swLock[0] = 0;
    A.x = FW * 0.42; A.y = FH / 2; A.vx = P_SPEED; A.vy = 0; A.ax = 0; A.ay = 0;
    A.fx = 1; A.fy = 0; A.out = 0; A.slide = -1; A.recover = 0; A.kickCd = 0; A.charge = -1;
    A.fiato = 100;
    /* IL DIFENSORE STA LONTANO, ED E' VOLUTO. Questa sonda non misura un
       duello: misura se il GESTO viene riconosciuto. Con un difensore a
       56 unita' lanciato addosso — la geometria del banco — nei trenta
       fotogrammi di rincorsa arriva e ruba il pallone, provaStrappo esce
       alla prima riga (b.owner!==pi) e tutte e tre le domande tornano
       «zero» anche sul gioco curato: il controllo C diventerebbe rosso
       senza che sia successo niente di male. Preso per errore la prima
       volta che questa sonda e' girata, e vale la pena scriverlo: un
       controllo che fallisce per la scenografia e' peggio di nessun
       controllo. */
    D.x = A.x + 420; D.y = A.y; D.out = 0; D.slide = -1; D.recover = 0; D.kickCd = 0; D.charge = -1;
    D.vx = 0; D.vy = 0; D.ax = 0; D.ay = 0; D.fx = -1; D.fy = 0;
    const b = G.ball;
    b.owner = mio; b.passTo = -1; b.crossTo = -1; b.x = A.x + 16; b.y = A.y; b.z = 0;
    b.vx = 0; b.vy = 0; b.vz = 0; b.curve = 0; b.perfectT = 0;
    if (G.brain[0]) G.brain[0].ruoloT = -1;
    if (G.brain[1]) G.brain[1].ruoloT = -1;
    Touch5.azzera();
    return { A: A, mio: mio };
  }

  /* il dito si appoggia e comincia a correre a destra */
  function corri(id) {
    Touch5.start(id, OX, OY);
    Touch5.move(id, OX + 50, OY);
    for (let f = 0; f < 30; f++) T.simulate(DT);
  }
  function esito(A, own0) {
    return { acceso: (A.strappoCd > 0) ? 1 : 0, staccato: (G.ball.owner < 0 && own0 >= 0) ? 1 : 0 };
  }

  const r = {};

  /* A — dito alzato con calma, due fotogrammi, riappoggio girato di 90 */
  {
    const s = apparecchia(20260828);
    corri(1);
    const own0 = G.ball.owner;
    Touch5.end(1);
    T.simulate(DT); T.simulate(DT);
    Touch5.start(2, OX, OY);
    Touch5.move(2, OX, OY - 50);
    T.simulate(DT); T.simulate(DT); T.simulate(DT);
    r.A = esito(s.A, own0);
  }

  /* B — il dito si alza DENTRO il centro e si ripianta nello stesso
     intervallo fra due passi: la memoria ha fermo>0 e stick vero */
  {
    const s = apparecchia(20260828);
    corri(11);
    const own0 = G.ball.owner;
    Touch5.move(11, OX + 4, OY);      // dentro la banda morta: il centro
    T.simulate(DT);                   // un passo: fermo = dt, stick = vero
    Touch5.end(11);                   // e nello stesso intervallo il dito
    Touch5.start(12, OX, OY);         // si alza e si ripianta...
    Touch5.move(12, OX, OY - 50);     // ...girato di 90 gradi
    T.simulate(DT); T.simulate(DT); T.simulate(DT);
    r.B = esito(s.A, own0);
  }

  /* C — CONTROLLO: la traversata vera, il dito non si alza mai */
  {
    const s = apparecchia(20260828);
    corri(21);
    const own0 = G.ball.owner;
    Touch5.move(21, OX + 4, OY);      // il pollice attraversa il centro
    T.simulate(DT); T.simulate(DT);
    Touch5.move(21, OX, OY - 50);     // e riappare girato di 90 gradi
    T.simulate(DT); T.simulate(DT); T.simulate(DT);
    r.C = esito(s.A, own0);
  }

  /* IL GIOCO SPEDITO NON HA IL VERBO, e il controllo C deve saperlo: su
     un file senza provaStrappo l'atteso di C non e' UNO, e' ZERO — se no
     il braccio di riferimento risulta rosso per non avere una cura che
     non ha. */
  r.haVerbo = (typeof provaStrappo === 'function') ? 1 : 0;
  return r;
};
/* eslint-enable no-undef */

(async () => {
  const prova = arg('gioco', '');
  const provaAbs = prova ? path.resolve(RADICE, prova) : '';
  if (provaAbs && !fs.existsSync(provaAbs)) { console.error('FALLITO: non esiste ' + provaAbs); process.exit(1); }
  const srv = await servi(provaAbs);
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  try {
    const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
    const pag = await ctx.newPage();
    const errori = [];
    pag.on('pageerror', e => errori.push('ECCEZIONE: ' + e.message));
    await pag.addInitScript(seme => {
      let s = seme >>> 0 || 1;
      const prossimo = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
      Math.random = () => prossimo() / 4294967296;
      if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = prossimo(); return a; };
      }
      window.__caso = { semina(n) { s = n >>> 0 || 1; } };
    }, 20260827);
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
    await pag.waitForTimeout(150);
    await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
    const r = await pag.evaluate(SONDA);
    await ctx.close();
    console.log(`\n_sonda-strappo-dito — ${provaAbs ? path.basename(provaAbs) : 'gioco spedito'}` +
                (r.haVerbo ? '' : '   (questo file NON ha provaStrappo: il verbo non esiste)'));
    let rossi = 0;
    const riga = (k, testo, atteso) => {
      const v = r[k];
      const ok = v.acceso === atteso;
      if (!ok) rossi++;
      console.log(`  ${ok ? 'OK  ' : 'ROSSO'} ${k}  ${testo}`);
      console.log(`         strappo acceso ${v.acceso}   pallone staccato ${v.staccato}   (atteso acceso ${atteso})`);
    };
    riga('A', 'dito alzato con calma, riappoggiato girato di 90', 0);
    riga('B', 'dito alzato NEL CENTRO e ripiantato nello stesso intervallo', 0);
    riga('C', 'CONTROLLO: la traversata vera, il dito non si alza', r.haVerbo);
    console.log(`  ${rossi ? rossi + ' ROSSI' : '3 controlli, 3 passati'}`);
    for (const e of errori) console.error('  !! ' + e);
  } finally {
    await browser.close(); srv.chiudi();
  }
})();
