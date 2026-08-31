/* =====================================================================
   _crit2-sonda-ibrido.js — IL CASO IBRIDO, MISURATO.

   La toppa _t-strappo.js (28 ago 2026) chiude la finta involontaria di
   TASTIERA con memCmd.stick:

       m.stick = !!(sk && sk.active) &&
                 !(Keys[km.lf] || Keys[km.rt] || Keys[km.up] || Keys[km.dn]);

   e scrive, nel gioco spedito e in §2bis, che il SECONDO termine serve al
   caso ibrido (portatile touch + tastiera): «un dito appoggiato DENTRO la
   banda morta tiene active=true mentre a comandare e' la tastiera [...]
   Senza quel termine il difetto tornava intero su quella macchina.»

   Questa sonda misura quel caso, che nessun banco di casa preme.

   IL PARCHEGGIO E' RAGGIUNGIBILE, e lo dice il gioco stesso
   (Touch5.SOGLIA_LEVETTA, CALCETTO-il-gioco.html:9941-9946): la levetta si
   ACCENDE a 6 px di spostamento, la dead-zone di humanMove e' a 12. Fra 6
   e 12 px la levetta e' VIVA e humanMove restituisce comunque i TASTI.

     H  IBRIDO: dito parcheggiato a 8 px dall'origine (levetta viva, dentro
        la banda morta) + virata normale di TASTIERA (D, molla, due
        fotogrammi di buco, W). Nessuno ha chiesto una finta.
     K  CONTROLLO TASTIERA PURA: identico, ma senza nessun dito sul vetro.
        E' la riga che il banco --tastiera gia' misura: deve valere 0.
     P  CONTROLLO DITO NON PROMOSSO: dito appoggiato e mai mosso (resta
        candidato, levetta spenta) + la stessa virata di tastiera. Deve
        valere 0.

   Stampa anche memCmd[0].stick nell'istante del buco, cosi' la diagnosi
   non e' un'inferenza.

   uso: node strumenti/_crit2-sonda-ibrido.js
        node strumenti/_crit2-sonda-ibrido.js --gioco fuori/strappo2.html
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
  const OX = 120, OY = 300;
  const KM = KMAP[0];
  const giu = k => { Keys[k] = true; };
  const su = k => { delete Keys[k]; };

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
    /* difensore lontano: qui non si misura un duello, si misura se il
       GESTO viene riconosciuto (stessa ragione di _sonda-strappo-dito.js) */
    D.x = A.x + 420; D.y = A.y; D.out = 0; D.slide = -1; D.recover = 0; D.kickCd = 0; D.charge = -1;
    D.vx = 0; D.vy = 0; D.ax = 0; D.ay = 0; D.fx = -1; D.fy = 0;
    const b = G.ball;
    b.owner = mio; b.passTo = -1; b.crossTo = -1; b.x = A.x + 16; b.y = A.y; b.z = 0;
    b.vx = 0; b.vy = 0; b.vz = 0; b.curve = 0; b.perfectT = 0;
    if (G.brain[0]) G.brain[0].ruoloT = -1;
    if (G.brain[1]) G.brain[1].ruoloT = -1;
    Touch5.azzera();
    for (const k of [KM.up, KM.dn, KM.lf, KM.rt, KM.sprint]) su(k);
    return { A: A, mio: mio };
  }

  /* la virata di tastiera del banco --tastiera, identica:
     D per trenta fotogrammi, molla, due fotogrammi di buco, tasto nuovo */
  function virata(A) {
    const own0 = G.ball.owner;
    giu(KM.rt);
    for (let f = 0; f < 30; f++) T.simulate(DT);
    su(KM.rt);
    let stickNelBuco = null, fermoNelBuco = null;
    for (let f = 0; f < 2; f++) {
      T.simulate(DT);
      const m = (typeof Touch5 !== 'undefined' && Touch5.memCmd) ? Touch5.memCmd[0] : null;
      if (m) { stickNelBuco = !!m.stick; fermoNelBuco = m.fermo; }
    }
    giu(KM.up);
    let acceso = 0, staccato = 0;
    for (let f = 0; f < 3; f++) {
      T.simulate(DT);
      if (A.strappoCd > 0) acceso = 1;
      if (G.ball.owner < 0 && own0 >= 0) staccato = 1;
    }
    for (const k of [KM.up, KM.dn, KM.lf, KM.rt, KM.sprint]) su(k);
    return { acceso, staccato, stickNelBuco, fermoNelBuco };
  }

  const r = {};

  /* H — IBRIDO: dito parcheggiato a 8 px (levetta viva, dentro la banda
     morta) e la virata la comanda la TASTIERA */
  {
    const s = apparecchia(20260828);
    Touch5.start(1, OX, OY);
    Touch5.move(1, OX + 8, OY);          // 8 px: sopra SOGLIA_LEVETTA (6), sotto STICK_DEAD (12)
    const st = Touch5.stick[0];
    r.Hviva = !!st.active;
    r.Hdx = st.dx; r.Hdy = st.dy;
    r.Hcmd = humanMove(0);               // deve essere il comando dei TASTI, non della levetta
    r.H = virata(s.A);
  }

  /* K — CONTROLLO: tastiera pura, nessun dito sul vetro */
  {
    const s = apparecchia(20260828);
    r.Kviva = !!Touch5.stick[0].active;
    r.K = virata(s.A);
  }

  /* P — CONTROLLO: dito appoggiato e MAI mosso: resta candidato, la
     levetta non si accende */
  {
    const s = apparecchia(20260828);
    Touch5.start(3, OX, OY);
    r.Pviva = !!Touch5.stick[0].active;
    r.P = virata(s.A);
  }

  r.haVerbo = (typeof provaStrappo === 'function') ? 1 : 0;
  r.soglia = Touch5.SOGLIA_LEVETTA;
  r.dead = (typeof STICK_DEAD !== 'undefined') ? STICK_DEAD : null;
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
    console.log(`\n_crit2-sonda-ibrido — ${provaAbs ? path.basename(provaAbs) : 'gioco spedito'}` +
      (r.haVerbo ? '' : '   (questo file NON ha provaStrappo: il verbo non esiste)'));
    console.log(`  SOGLIA_LEVETTA ${r.soglia}   STICK_DEAD ${r.dead}   (fra le due la levetta e' viva e comandano i tasti)`);
    const riga = (k, testo, viva) => {
      const v = r[k];
      console.log(`  ${k}  ${testo}`);
      console.log(`       levetta viva ${viva}   strappo acceso ${v.acceso}   pallone staccato ${v.staccato}` +
        `   memCmd.stick nel buco ${v.stickNelBuco}   fermo ${v.fermoNelBuco === null ? '-' : v.fermoNelBuco.toFixed(4)}`);
    };
    console.log(`  H: humanMove col dito parcheggiato e D premuto = [${r.Hcmd.map(x => x.toFixed(3)).join(', ')}]  (dx ${r.Hdx}, dy ${r.Hdy})`);
    riga('H', 'IBRIDO  dito a 8 px + virata di TASTIERA   (atteso acceso 0)', r.Hviva);
    riga('K', 'CONTROLLO  tastiera pura, nessun dito      (atteso acceso 0)', r.Kviva);
    riga('P', 'CONTROLLO  dito appoggiato e mai mosso     (atteso acceso 0)', r.Pviva);
    const rossi = ['H', 'K', 'P'].filter(k => r[k].acceso !== 0);
    console.log(`  ${rossi.length ? 'ROSSO su ' + rossi.join(', ') : '3 controlli, 3 passati'}`);
    for (const e of errori) console.error('  !! ' + e);
  } finally {
    await browser.close(); srv.chiudi();
  }
})();
