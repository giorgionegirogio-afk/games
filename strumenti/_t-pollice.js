/* =====================================================================
   _t-pollice.js — DUE DITA SUL VETRO, E LA DOMANDA: QUANTI TIRI
   DIVENTANO PALLONETTI SENZA CHE NESSUNO L'ABBIA CHIESTO.

   PERCHE'. Il tiro col pulsante finisce in `releaseCharge`, che passa a
   `fireShot` un quinto argomento: il PALLONETTO. Quel quinto argomento
   e' `humanSprint(t)`, cioe' uno STATO — la levetta oltre STICK_SPRINT
   (66 px). Ma lo stick "che segue" ferma il dito a MAXR (70 px): chi
   trascina per correre e' SEMPRE oltre 66. Quindi ogni tiro tirato in
   corsa parte scavalcato. Questo file non lo deduce dal codice: mette
   due dita vere sul vetro e conta.

   COME. Un pollice sinistro appoggiato e trascinato a un raggio
   dichiarato (0, 44 come strumenti/giocatore.js, 66 la soglia, 80 come
   un pollice vero che va a fondo corsa), un pollice destro che preme il
   pulsante grande e lo tiene 0,65 s — dentro la finestra dolce
   SHOT_MIN..SHOT_MAX — e poi lo lascia. Gli eventi sono
   Input.dispatchTouchEvent con DUE punti attivi, cioe' gli stessi che
   genera un dito; il gioco non sa di essere misurato. Fra la pressione e
   il rilascio la partita avanza con __test.simulate a passo fisso: cosi'
   il tempo di carica e' un numero e non un'attesa di orologio, e la
   misura si ripete identica.

   COSA STAMPA, per ogni configurazione di raggio e direzione:
     tiri        quanti tiri sono partiti (G.stats.tiri)
     pallonetti  quanti di quelli erano pallonetti (G.stats.pallonetti)
     sprint      se al rilascio humanSprint(0) era vero
     |stick|     quanto era lungo il vettore della levetta
     vz          la quota impressa al pallone (il pallonetto la mette,
                 il tiro raso no)
   E la stessa cosa per il pulsante piccolo: FILTRANTE contro CROSS, che
   ha lo STESSO difetto (doFiltrante(t, humanSprint(t))) e qui viene solo
   misurato, non riparato.

   uso:
     node strumenti/_t-pollice.js
     node strumenti/_t-pollice.js --gioco fuori/dopo.html --etichetta DOPO
     node strumenti/_t-pollice.js --prove 10
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

/* --- la quiete: partita in corso, pallone al comandato, avversari via --- */
const PREPARA = `(d => {
  const t=window.__test, G=t.G;
  t.setPaused(false);
  try{ if(t.Tut && t.Tut.active && t.Tut.finish) t.Tut.finish(true); }catch(e){}
  for(let i=0;i<300 && G.scene!=='play';i++) t.simulate(0.1);
  if(G.scene!=='play') return {errore:'scena '+G.scene};
  t.setTimeLeft(80);
  const pi=G.ctrl[0]; if(pi<0) return {errore:'nessun comandato'};
  const p=G.players[pi], c=t.campo;
  /* ogni carica aperta di squadra 0 si chiude: se ne resta una su un
     compagno, il rilascio del gesto nuovo cade su un uomo diverso */
  for(const q of G.players) if(q.team===0 && q.charge>=0){ q.charge=-1; q.chargeGo=null; }
  /* il comandato a distanza dichiarata dalla porta avversaria, in mezzo */
  p.x=c.FW-d.dist; p.y=c.FH/2 + d.dy; p.vx=0; p.vy=0;
  p.fx=1; p.fy=0;
  if(p.charge>=0){ p.charge=-1; p.chargeGo=null; }
  const b=G.ball;
  b.owner=pi; b.x=p.x+8; b.y=p.y; b.vx=0; b.vy=0; b.vz=0; b.z=0; b.curve=0; b.passTo=-1;
  for(const q of G.players){
    q.vx=0; q.vy=0;
    if(q===p) continue;
    const dd=Math.hypot(q.x-b.x,q.y-b.y);
    if(dd<200){ const l=Math.max(1,dd); q.x=b.x+(q.x-b.x)/l*260; q.y=b.y+(q.y-b.y)/l*260; }
  }
  const S=G.stats;
  return { ok:1, pi:pi, tiri:S.tiri[0], pall:S.pallonetti[0]|0, perf:S.perfetti[0]|0,
           filt:S.filtranti[0]|0, cross:S.cross[0]|0,
           bx:b.x, by:b.y, px:p.x, py:p.y };
})`;

const LEGGI = `(() => {
  const t=window.__test, G=t.G, S=G.stats, b=G.ball;
  return { tiri:S.tiri[0], pall:S.pallonetti[0]|0, perf:S.perfetti[0]|0,
           filt:S.filtranti[0]|0, cross:S.cross[0]|0,
           vz:b.vz, z:b.z, vel:Math.hypot(b.vx,b.vy), passTo:b.passTo,
           ctrl:G.ctrl[0], owner:b.owner,
           carica: G.ctrl[0]>=0 ? G.players[G.ctrl[0]].charge : null,
           chargeGo: G.ctrl[0]>=0 ? !!G.players[G.ctrl[0]].chargeGo : null,
           sprint: !!humanSprint(0),
           stick: Touch5.stick[0].active ? Math.hypot(Touch5.stick[0].dx,Touch5.stick[0].dy) : 0 };
})()`;

(async () => {
  const PROVE = Math.max(1, +arg('prove', 8) | 0);
  const etichetta = arg('etichetta', 'OGGI');
  const prova = arg('gioco', process.env.GIOCO_PROVA || '');
  const provaAbs = prova ? path.resolve(prova) : '';
  if (provaAbs && !fs.existsSync(provaAbs)) { console.error('FALLITO: gioco inesistente ' + provaAbs); process.exit(1); }

  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push(e.message));
  await pag.addInitScript(() => {
    let s = 20260803 >>> 0;
    const pr = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => pr() / 4294967296;
  });
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
  await pag.evaluate(() => window.__test.startMatch(1, 1));
  /* LA SPIA: chi chiama fireShot, e con quale quinto argomento. Serve a
     distinguere il tiro del PULSANTE da quello del FLICK — due strade
     diverse per lo stesso contatore, e senza questa riga si attribuisce
     al pulsante cio' che ha fatto il dito che si alza. */
  await pag.evaluate(() => {
    window.__spia = [];
    const riga = () => { const s = (new Error().stack || '').split(String.fromCharCode(10)); return (s[3] || s[2] || '').trim(); };
    const _f = window.fireShot, _c = window.doCross;
    window.fireShot = function (p, nx, ny, q, lob) { window.__spia.push({ che: 'fireShot', lob: !!lob, da: riga() }); return _f.apply(this, arguments); };
    window.doCross = function () { window.__spia.push({ che: 'doCross', lob: false, da: riga() }); return _c.apply(this, arguments); };
    return 1;
  });
  const cdp = await ctx.newCDPSession(pag);

  const VW = await pag.evaluate('innerWidth'), VH = await pag.evaluate('innerHeight');
  const btn = await pag.evaluate('window.__test.pulsanti(0)');
  const grande = btn.reduce((a, b) => (b.r || 0) > (a.r || 0) ? b : a, btn[0]);
  const piccolo = btn.find(b => b !== grande) || grande;
  const CASA = { x: VW * 0.18, y: VH * 0.66 };
  console.log(`\n=== POLLICE — ${etichetta} ===`);
  console.log('  --    gioco: ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)'));
  console.log(`  --    vista ${VW}x${VH} · levetta a riposo (${CASA.x.toFixed(0)},${CASA.y.toFixed(0)}) · grande ${grande.label}@(${grande.x.toFixed(0)},${grande.y.toFixed(0)}) · piccolo ${piccolo.label}@(${piccolo.x.toFixed(0)},${piccolo.y.toFixed(0)})`);

  const tp = (x, y, id) => ({ x, y, id, radiusX: 12, radiusY: 12, force: 1 });
  let ditaGiu = 0;
  const manda = async (type, punti, resta) => {
    await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: punti });
    ditaGiu = (type === 'touchEnd') ? (resta === undefined ? 0 : resta) : punti.length;
  };
  /* IL PROTOCOLLO NON E' SIMMETRICO, ed e' costato la prima misura.
     Input.dispatchTouchEvent vuole in `touchPoints`:
       touchStart/touchMove  TUTTI i punti attivi (il cambiato lo deduce)
       touchEnd              I PUNTI CHE SI ALZANO (vuoto = alza tutto)
     Alla prima stesura il rilascio del pulsante veniva mandato come
     touchEnd [sinistro] credendo di dire «resta giu' solo il sinistro»:
     il protocollo ha alzato il SINISTRO, il flick della levetta ha
     sparato un tiro suo, e il pulsante e' stato rilasciato dopo — a
     levetta gia' su, cioe' senza sprint. Tre righe di tabella su otto
     erano il gesto sbagliato. Adesso ogni fase VERIFICA lo stato interno
     del gioco (Touch5) invece di fidarsi del protocollo. */
  const sgombera = async () => { if (ditaGiu) await manda('touchEnd', []); };
  const STATO_DITA = `(()=>({stick:!!Touch5.stick[0].active,`
    + `len:Touch5.stick[0].active?Math.round(Math.hypot(Touch5.stick[0].dx,Touch5.stick[0].dy)):0,`
    + `bottoni:Object.keys(Touch5.btnTouch).length}))()`;

  /* una prova: levetta a raggio R nella direzione (ux,uy), poi pulsante */
  async function prova1(R, ux, uy, quale, dist, dy) {
    /* NIENTE CODE DALLA PROVA PRIMA. Un gesto lascia dietro di se' un
       ANTICIPO che matura da solo (anticipa/maturaAnticipi): senza questo
       mezzo secondo di sfogo, il cross della prova precedente veniva
       contato in quella dopo. Misurato: righe con 6 cross dove nessuno
       aveva premuto il pulsante piccolo. */
    await sgombera();
    await pag.evaluate('window.__test.simulate(0.60)');
    const p0 = await pag.evaluate(PREPARA + `({dist:${dist},dy:${dy}})`);
    if (p0.errore) return { errore: p0.errore };
    const bott = quale === 'grande' ? grande : piccolo;
    let sinistro = null;
    if (R > 0) {
      sinistro = tp(CASA.x, CASA.y, 1);
      await manda('touchStart', [sinistro]);
      /* il dito ci arriva in tre passi, come un dito vero */
      for (const k of [0.34, 0.67, 1]) {
        sinistro = tp(CASA.x + ux * R * k, CASA.y + uy * R * k, 1);
        await manda('touchMove', [sinistro]);
      }
      await pag.evaluate('window.__test.simulate(0.20)');
    }
    const destro = tp(bott.x, bott.y, 2);
    await manda('touchStart', sinistro ? [sinistro, destro] : [destro]);
    /* il gioco DEVE aver visto: levetta giu' al raggio chiesto (se c'e')
       e un pulsante premuto. Se non e' cosi' la prova non vale */
    const d1 = await pag.evaluate(STATO_DITA);
    if (d1.bottoni !== 1 || (R > 0 && !d1.stick)) return { errore: `dita sbagliate alla pressione: ${JSON.stringify(d1)}` };
    /* la carica matura nel TEMPO DI GIOCO: 0,65 s sta dentro 0,50-0,80 */
    const attesa = quale === 'grande' ? 0.65 : 0.02;
    await pag.evaluate(`window.__test.simulate(${attesa})`);
    const alRilascio = await pag.evaluate(LEGGI);
    /* SI ALZA SOLO IL DESTRO: la levetta resta giu', com'e' per un
       pollice che corre e tira */
    await manda('touchEnd', [destro], sinistro ? 1 : 0);
    const d2 = await pag.evaluate(STATO_DITA);
    if (d2.bottoni !== 0 || (R > 0 && (!d2.stick || Math.abs(d2.len - Math.min(R, 70)) > 2)))
      return { errore: `dita sbagliate al rilascio: ${JSON.stringify(d2)}` };
    await pag.evaluate('window.__test.simulate(0.10)');
    const dopo = await pag.evaluate(LEGGI);
    const spia = await pag.evaluate('const s=window.__spia.slice(); window.__spia.length=0; s');
    await sgombera();
    return {
      tiri: dopo.tiri - p0.tiri, pall: dopo.pall - p0.pall, perf: dopo.perf - p0.perf,
      filt: dopo.filt - p0.filt, cross: dopo.cross - p0.cross,
      sprint: alRilascio.sprint, stick: alRilascio.stick, vz: dopo.vz, vel: dopo.vel,
      spia, carica: alRilascio.carica, ctrl0: p0.pi, ctrl1: alRilascio.ctrl,
      owner: alRilascio.owner, chargeGo: alRilascio.chargeGo,
    };
  }

  const CONF = [
    { nome: 'levetta ferma (0 px)', R: 0, ux: 1, uy: 0, quale: 'grande' },
    { nome: 'corsa di giocatore.js (44 px)', R: 44, ux: 1, uy: 0, quale: 'grande' },
    { nome: 'corsa piena (60 px)', R: 60, ux: 1, uy: 0, quale: 'grande' },
    { nome: 'pollice a fondo corsa (80 px) VERSO la porta', R: 80, ux: 1, uy: 0, quale: 'grande' },
    { nome: 'pollice a fondo corsa (80 px) INDIETRO', R: 80, ux: -1, uy: 0, quale: 'grande' },
    { nome: 'pollice a fondo corsa (80 px) di lato', R: 80, ux: 0, uy: 1, quale: 'grande' },
    { nome: 'FILTRANTE, levetta ferma', R: 0, ux: 1, uy: 0, quale: 'piccolo' },
    { nome: 'FILTRANTE, pollice a fondo corsa (80 px)', R: 80, ux: 1, uy: 0, quale: 'piccolo' },
  ];

  const out = [];
  for (const c of CONF) {
    const acc = { tiri: 0, pall: 0, perf: 0, filt: 0, cross: 0, sprint: 0, stick: 0, vz: 0, n: 0, carica: 0, cambiUomo: 0, go: 0, err: [], spie: [] };
    for (let i = 0; i < PROVE; i++) {
      const r = await prova1(c.R, c.ux, c.uy, c.quale, 260 + (i % 4) * 40, (i % 3 - 1) * 40);
      if (r.errore) { acc.err.push(r.errore); continue; }
      acc.tiri += r.tiri; acc.pall += r.pall; acc.perf += r.perf;
      acc.filt += r.filt; acc.cross += r.cross;
      acc.sprint += r.sprint ? 1 : 0; acc.stick += r.stick; acc.vz += r.vz; acc.n++;
      acc.carica += (r.carica === null ? -1 : r.carica);
      if (r.ctrl0 !== r.ctrl1) acc.cambiUomo++;
      if (r.chargeGo) acc.go++;
      for (const e of (r.spia || [])) acc.spie.push((e.che === 'fireShot' ? ('fireShot lob=' + e.lob) : e.che) + ' <- ' + String(e.da).trim().slice(0, 60));
    }
    out.push({ c, acc });
  }

  console.log('\n  configurazione'.padEnd(48) + 'sprint  |stick|   tiri  pallonetti   filtr  cross    vz media');
  for (const { c, acc } of out) {
    const n = Math.max(1, acc.n);
    console.log('  ' + c.nome.padEnd(46) +
      String(acc.sprint + '/' + acc.n).padStart(6) +
      (acc.stick / n).toFixed(0).padStart(9) +
      String(acc.tiri).padStart(7) + String(acc.pall).padStart(12) +
      String(acc.filt).padStart(8) + String(acc.cross).padStart(7) +
      (acc.vz / n).toFixed(0).padStart(12) +
      ('  carica ' + (acc.carica / n).toFixed(2)) +
      (acc.err.length ? '   errori: ' + acc.err[0] : ''));
    const conte = {};
    for (const x of acc.spie) conte[x] = (conte[x] || 0) + 1;
    for (const k in conte) console.log('        ' + String(conte[k]).padStart(3) + ' x  ' + k);
  }
  /* ---------------------------------------------------------------
     PROVA DI SEGNO PER LA SQUADRA 1. Le due squadre attaccano in versi
     opposti, quindi «levetta indietro» ha segno opposto: un errore di
     segno qui spegnerebbe il pallonetto per il giocatore 2 (o glielo
     accenderebbe sempre) e nessuna delle prove col dito qui sopra se ne
     accorgerebbe — sono tutte sulla squadra 0.
     QUESTA PROVA NON E' UN DITO, ed e' giusto dirlo: in 2 giocatori la
     levetta della squadra 1 vive sulla meta' destra dello schermo e
     montarla col protocollo touch qui non aggiungerebbe niente. Si
     scrive lo stato della levetta e si chiama la carica come farebbe il
     tasto. Vale come prova del SEGNO, non della giocabilita'. */
  const segno = await pag.evaluate(() => {
    const t = window.__test, G = t.G, out = [];
    t.setPaused(false);
    for (let i = 0; i < 200 && G.scene !== 'play'; i++) t.simulate(0.1);
    G.mode = 2; G.cpu[1] = false; if (G.ctrl[1] < 0) G.ctrl[1] = G.players.findIndex(p => p.team === 1 && p.role !== 'gk');
    for (const dir of [-1, 1]) {          // -1 = verso -x, +1 = verso +x
      for (const team of [0, 1]) {
        const pi = G.ctrl[team]; if (pi < 0) { out.push({ team, dir, err: 'nessun comandato' }); continue; }
        const p = G.players[pi], b = G.ball;
        for (const q of G.players) if (q.charge >= 0) { q.charge = -1; q.chargeGo = null; }
        /* NELLA PROPRIA META' OFFENSIVA, non a centrocampo. La toppa del
           pallonetto chiede anche `metaOffensiva(p)`, e a x = FW/2 quella
           e' falsa per tutte e due le squadre: la prova di segno,
           piazzando i due uomini esattamente sulla linea di meta' campo,
           avrebbe restituito 0 pallonetti su 4 e sarebbe sembrata una
           bocciatura del segno mentre misurava solo la propria posa. */
        p.x = team === 0 ? t.campo.FW * 0.75 : t.campo.FW * 0.25;
        p.y = t.campo.FH / 2; p.vx = 0; p.vy = 0;
        b.owner = pi; b.x = p.x + 8; b.y = p.y; b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0; b.passTo = -1;
        const st = Touch5.stick[team];
        st.active = true; st.id = 900 + team; st.ox = 0; st.oy = 0; st.dx = 70 * dir; st.dy = 0; st.hist = [];
        const p0 = G.stats.pallonetti[team] | 0, t0 = G.stats.tiri[team] | 0;
        startCharge(team); t.simulate(0.65); releaseCharge(team);
        st.active = false; st.dx = 0; st.dy = 0;
        out.push({ team, dir, tiri: (G.stats.tiri[team] | 0) - t0, pall: (G.stats.pallonetti[team] | 0) - p0 });
        t.simulate(0.3);
      }
    }
    return out;
  });
  console.log('\n  prova di segno (chiamate, non dito): la squadra 0 attacca +x, la 1 attacca -x');
  for (const r of segno) {
    const versoPorta = (r.team === 0 && r.dir > 0) || (r.team === 1 && r.dir < 0);
    console.log(`    squadra ${r.team}  levetta verso ${r.dir > 0 ? '+x' : '-x'} (${versoPorta ? 'la sua porta d\'attacco' : 'INDIETRO'})  ->  tiri ${r.tiri}  pallonetti ${r.pall}` + (r.err ? '  ' + r.err : ''));
  }

  if (errori.length) console.log('\n  NO    eccezioni di pagina: ' + errori[0]);
  await browser.close(); srv.chiudi();
  if (errori.length) process.exit(1);
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
