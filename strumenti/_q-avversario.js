/* =====================================================================
   _q-avversario.js — LA SQUADRA DELL'ALTRO E' DAVVERO LA SUA?

   La sfida asincrona vive di una promessa: «attacchi la squadra di
   quella persona». Se in campo scendessero undici uomini medi con la sua
   maglia, la promessa sarebbe falsa — e lo scoprirebbe proprio lui,
   guardando il replay della partita che ha subito.

   Cinque domande, e ognuna e' un modo in cui la promessa puo' rompersi:
     A  i NOMI in campo sono i suoi
     B  i NUMERI in campo sono i suoi, uomo per uomo
     C  la differenza fra i suoi uomini SOPRAVVIVE (formaSquadre non li
        rimescola come fa coi cloni)
     D  una rosa storta che arriva dalla rete non rompe il gioco
     E  SENZA rosa, il gioco fa esattamente quello che faceva prima

   La E e' la piu' importante: torneo, stagione e amichevole non devono
   accorgersi che questa toppa esiste.

   uso:  node strumenti/_q-avversario.js --gioco fuori/avv.html
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
const provaRel = arg('gioco', process.env.GIOCO_PROVA || '');

function servi(prova) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (prova && /CALCETTO-il-gioco\.html$/i.test(f)) f = prova;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* una rosa riconoscibile: nomi inventati che non esistono nelle liste del
   gioco, e numeri molto diversi fra loro — cosi' se qualcuno li rimescola
   o li sostituisce si vede a occhio nudo */
const ROSA = [
  { nome: 'Zeta Portiere',  vel: 30, tiro: 20, tecnica: 90, tackle: 25 },
  { nome: 'Zeta Punta',     vel: 95, tiro: 92, tecnica: 70, tackle: 15 },
  { nome: 'Zeta Ala',       vel: 88, tiro: 60, tecnica: 75, tackle: 20 },
  { nome: 'Zeta Regista',   vel: 55, tiro: 45, tecnica: 95, tackle: 40 },
  { nome: 'Zeta Muro',      vel: 40, tiro: 15, tecnica: 30, tackle: 97 },
  { nome: 'Zeta Sesto',     vel: 62, tiro: 62, tecnica: 62, tackle: 62 },
];

(async () => {
  const prova = provaRel ? path.resolve(RADICE, provaRel) : '';
  const srv = await servi(prova);
  const browser = await chromium.launch();
  const esiti = [];
  const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '  [' + det + ']' : '')); };

  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push(e.message));
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(200);
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });

  console.log('=== LA SQUADRA DELL\'ALTRO E\' DAVVERO LA SUA? ===\n');

  const conRosa = await pag.evaluate(rosa => {
    const t = window.__test;
    t.startMatch(1, 1, { opp: { n: 'LA SUA SQUADRA', forza: 5, c1: '#3355aa', c2: '#111111', pat: 0, rosa } });
    return t.players.filter(p => p.team === 1)
      .map(p => ({ nome: p.nome, vel: p.vel, tiro: p.tiro, tecnica: p.tecnica, tackle: p.tackle, piatto: p.piatto | 0 }));
  }, ROSA);

  /* --- A: i nomi --- */
  const suoi = conRosa.filter(p => /^Zeta /.test(p.nome)).length;
  di(suoi === conRosa.length, 'A) tutti gli uomini in campo hanno i SUOI nomi',
     suoi + ' su ' + conRosa.length + (conRosa[0] ? ', primo: ' + conRosa[0].nome : ''));

  /* --- B: i numeri, uomo per uomo --- */
  const atteso = i => ROSA[i % ROSA.length];
  const storti = conRosa.filter((p, i) => {
    const a = atteso(i);
    return p.vel !== a.vel || p.tiro !== a.tiro || p.tecnica !== a.tecnica || p.tackle !== a.tackle;
  });
  di(storti.length === 0, 'B) i numeri in campo sono i suoi, uomo per uomo',
     storti.length ? storti.length + ' storti, il primo: ' + JSON.stringify(storti[0]) : conRosa.length + ' uomini');

  /* --- C: la differenza sopravvive --- */
  /* Se formaSquadre li avesse rimescolati come fa coi cloni, il muro e la
     punta si somiglierebbero. La domanda si pone sui NUMERI, non sui
     nomi: e' la differenza che rende una rosa una rosa. */
  const muro = conRosa.find(p => /Muro/.test(p.nome)), punta = conRosa.find(p => /Punta/.test(p.nome));
  di(muro && punta && (muro.tackle - punta.tackle) >= 70 && (punta.tiro - muro.tiro) >= 70,
     'C) il muro e la punta restano due uomini diversi',
     muro && punta ? 'tackle ' + muro.tackle + ' contro ' + punta.tackle + ', tiro ' + muro.tiro + ' contro ' + punta.tiro : 'non trovati');
  di(conRosa.every(p => !p.piatto),
     'C) nessuno di loro porta la marca dei cloni (piatto)',
     conRosa.filter(p => p.piatto).length + ' col piatto alzato');

  /* --- D: una rosa storta dalla rete --- */
  const storta = await pag.evaluate(() => {
    const t = window.__test;
    const cattiva = [
      { nome: 'x'.repeat(300), vel: 'molto veloce', tiro: NaN, tecnica: 1e9, tackle: -50 },
      { nome: '', vel: null, tiro: undefined, tecnica: {}, tackle: [] },
      { nome: 42, vel: Infinity, tiro: -Infinity, tecnica: '70', tackle: 1.7 },
      { vel: 50 },
    ];
    let eccezione = '';
    try { t.startMatch(1, 1, { opp: { n: 'STORTA', forza: 5, c1: '#3355aa', c2: '#111111', pat: 0, rosa: cattiva } }); }
    catch (e) { eccezione = String(e && e.message || e); }
    const p1 = t.players.filter(p => p.team === 1);
    const sani = p1.every(p => Number.isFinite(p.vel) && Number.isFinite(p.tiro) &&
                               Number.isFinite(p.tecnica) && Number.isFinite(p.tackle) &&
                               p.vel >= 1 && p.vel <= 99 && p.tiro >= 1 && p.tiro <= 99 &&
                               p.tecnica >= 1 && p.tecnica <= 99 && p.tackle >= 1 && p.tackle <= 99 &&
                               typeof p.nome === 'string' && p.nome.length > 0 && p.nome.length <= 24);
    t.simulate(3);
    const vivi = t.players.every(p => Number.isFinite(p.x) && Number.isFinite(p.y));
    return { eccezione, sani, vivi, quanti: p1.length, esempio: p1[0] ? { n: p1[0].nome, v: p1[0].vel } : null };
  });
  di(!storta.eccezione, 'D) una rosa storta dalla rete non fa esplodere niente', storta.eccezione || '');
  di(storta.sani, 'D) ogni numero storto e\' stato riportato dentro 1..99',
     storta.sani ? JSON.stringify(storta.esempio) : 'qualcuno e\' fuori scala');
  di(storta.vivi, 'D) e dopo tre secondi di gioco nessuno e\' finito a NaN');

  /* --- E: senza rosa, il gioco di prima --- */
  const senza = await pag.evaluate(() => {
    const t = window.__test;
    t.startMatch(1, 1, { opp: { n: 'TORNEO', forza: 8, c1: '#aa3333', c2: '#111111', pat: 1 } });
    const p1 = t.players.filter(p => p.team === 1);
    return { medio: 52 + 8 * 2.2, valori: p1.map(p => p.vel), piatti: p1.filter(p => p.piatto).length, quanti: p1.length };
  });
  /* col numero medio formaSquadre sparge: i valori NON sono tutti uguali,
     ma stanno tutti attorno al medio. La marca del clone invece dev'esserci
     su tutti: e' lei che dice a formaSquadre di spargere. */
  const attorno = senza.valori.filter(v => Math.abs(v - senza.medio) <= 22).length;
  di(senza.piatti === senza.quanti,
     'E) senza rosa la squadra porta ancora la marca dei cloni, come prima',
     senza.piatti + ' su ' + senza.quanti);
  di(attorno === senza.quanti,
     'E) e i suoi valori stanno ancora attorno al numero della forza',
     attorno + ' su ' + senza.quanti + ' entro 22 punti da ' + senza.medio.toFixed(1));

  await browser.close(); srv.chiudi();
  if (errori.length) {
    console.error('\nECCEZIONI DI PAGINA: ' + errori.slice(0, 3).join(' | '));
    process.exit(2);
  }
  const rossi = esiti.filter(x => !x).length;
  console.log('\n' + esiti.length + ' controlli, ' + (esiti.length - rossi) + ' passati, ' + rossi + ' falliti');
  process.exit(rossi ? 1 : 0);
})().catch(e => { console.error('FALLITO (banco): ' + e.message); process.exit(2); });
