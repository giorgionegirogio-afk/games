/* =====================================================================
   _t-159-passaggio-pressione.js -- IL PASSAGGIO UMANO SOTTO PRESSIONE
   (voce #159, cura H2, spec §2.2: «passaggio umano: zero errore anche
   con un uomo addosso»).

   IL DIFETTO, LETTO SUL CODICE. eseguiPassUmano ha lead=0,32 e
   speed=clamp(300+l*0.9,320,520) senza nessun termine di pressione;
   eseguiPassaggioL14 (la filtrante mirata col disco) idem. La CPU
   (eseguiAiPass) sbaglia gia' col suo dado; l'umano con un avversario a
   sei unita' appoggia esattamente come a campo libero.

   LA CURA, deterministica e senza dado: la stessa pressione della
   finestra del tiro (H1: pressioneSu(p), ricettario del tocco sporco,
   TOCCO_PRESS=46) letta sul PASSATORE. Nel passaggio semplice
   lead=0.32*(1-0.6*press) e speed*=(1-0.22*press); nella filtrante
   rasoterra solo speed*=(1-0.15*press). Nient'altro: niente rumore
   angolare (il confutatore l'ha respinto: si tocca lead e velocita',
   non l'esito).

   LE PROVE, da pag.evaluate (il passaggio umano non esce in CPU contro
   CPU): passatore p col pallone al piede, ricevente m a 170 u davanti
   che corre di lato a 120 u/s (cosi' il lead si VEDE nell'angolo del
   calcio), tutti gli altri parcheggiati lontano; la stessa geometria
   con e senza un avversario o a 6 u dal passatore, alle sue spalle (non
   sulla linea di passaggio: la scelta di scegliSmarcato deve restare m).
     1. PASSAGGIO: velocita' del pallone dopo il calcio MINORE sotto
        pressione; senza pressione UGUALE a quella di ieri
        (clamp(300+l*0.9,320,520) sul punto anticipato di 0,32 s) e
        l'angolo del calcio esattamente atan2(vy*0,32, 170): niente
        rumore. OGGI con e senza pressione la velocita' e' la stessa ->
        ROSSO.
     2. PASSAGGIO: b.passTo scritto (= m) e pallone partito in TUTTI e
        due i casi: la pressione non spegne il passaggio.
     3. PASSAGGIO: sotto pressione il lead si accorcia (angolo minore) e
        resta deterministico: due semi diversi, stesso vettore al bit.
     4. FILTRANTE (eseguiPassaggioL14 armata, l=40 px < TRASCINA_SU,
        rasoterra): velocita' minore sotto pressione, uguale a ieri
        senza; passTo = m, vz = 0 e crossTo = -1 in tutti e due i casi.
     5. ZERO SORTEGGI nella lettura della pressione (t.sorteggi fermo
        attorno a pressioneSu). I sorteggi del calcio intero si stampano
        come informazione: kickBall ha gia' i suoi effetti a soglia di
        velocita' (lampo, zolle), non e' un dado nuovo nella decisione.
     SPECCHIO: ogni scena gira per la squadra 0 (+x) e per la 1 (-x), con
     la geometria specchiata su x E su y, e i numeri devono coincidere.

   ORDINE SACRO: startMatch PRIMA, setCpuVsCpu DOPO (per arrivare in
   'play'); poi la squadra provata torna umana (G.cpu[sq]=false,
   G.ctrl[sq]=pi). Chi teletrasporta il pallone azzera lo stato derivato:
   il pallone e' posato al piede (owner, lastTouch, un piede).

   uso:  node strumenti/_t-159-passaggio-pressione.js
         node strumenti/_t-159-passaggio-pressione.js --gioco fuori/159/fuso.html
   esce 0 verde · 1 rosso (il gioco) · 2 banco esploso · 3 prova nulla
   ===================================================================== */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { semeFisso } = require('./_posa.js');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const SEME = +arg('seme', 20261102);
const TAGLIA = +arg('taglia', 5);
const D_RIC = 170;      // u: il ricevente, davanti al passatore
const VY_RIC = 120;     // u/s: la corsa laterale del ricevente, che rende visibile il lead
const D_AVV = 6;        // u: l'avversario addosso al passatore

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

function AVVIA(seme, taglia) {
  const t = window.__test;
  t.semina(seme);
  t.startMatch(1, 1, { size: taglia });
  t.setCpuVsCpu(true);
  for (let i = 0; i < 900 && t.state !== 'play'; i++) t.simulate(1 / 60);
  if (t.state !== 'play') return { errore: 'la partita non arriva in play: ' + t.state };
  t.setTimeLeft(600);
  return { ok: true };
}

/* dentro la pagina: UNA scena di passaggio. cfg = { sq, pressione (bool),
   filtrante (bool), seme, dRic, vyRic, dAvv }. Torna velocita', angolo
   (riportato al verso della squadra: specchio su x e su y), destinatario
   e sorteggi. */
function SCENA_PASSO(cfg) {
  const t = window.__test;
  const P = G.players;
  const sq = cfg.sq, dir = sq === 0 ? 1 : -1;
  const campo = P.filter(u => u.team === sq && u.role !== 'gk');
  const p = campo[0], m = campo[1];
  const o = P.find(u => u.team !== sq && u.role !== 'gk');
  if (!p || !m || !o) return { errore: 'mancano gli uomini di movimento' };
  const pi = P.indexOf(p), mi = P.indexOf(m);
  if (cfg.seme) t.semina(cfg.seme);
  G.cpu[sq] = false; G.ctrl[sq] = pi;
  G.paused = false;
  const x0 = sq === 0 ? FW * 0.40 : FW * 0.60, y0 = FH / 2;
  /* parcheggio nell'angolo alle spalle del passatore (specchiato su x e
     su y), in piedi, non in scivolata, senza chiamate aperte */
  for (let i = 0; i < P.length; i++) {
    const q = P[i]; if (q === p || q === m) continue;
    q.x = sq === 0 ? 20 + (i % 4) * 12 : FW - 20 - (i % 4) * 12;
    q.y = sq === 0 ? 20 + Math.floor(i / 4) * 12 : FH - 20 - Math.floor(i / 4) * 12;
    q.vx = 0; q.vy = 0; q.out = 0; q.slide = -1; q.chiamata = 0;
  }
  Object.assign(p, { x: x0, y: y0, vx: 0, vy: 0, fx: dir, fy: 0, out: 0, slide: -1, recover: 0, kickCd: 0,
                     charge: -1, chargeGo: null, rove: -1, chiamata: 0 });
  Object.assign(m, { x: x0 + dir * cfg.dRic, y: y0, vx: 0, vy: dir * cfg.vyRic, out: 0, slide: -1, recover: 0, chiamata: 0 });
  if (cfg.pressione) { o.x = x0 - dir * cfg.dAvv; o.y = y0; }     // addosso, alle spalle: fuori dalla linea di passaggio
  Object.assign(G.ball, { owner: pi, x: x0 + dir * 6, y: y0, z: 0, vx: 0, vy: 0, vz: 0, curve: 0,
                          passTo: -1, crossTo: -1, lastTouch: pi, toccoPiede: true });
  const dAvvVero = Math.min(...P.filter(q => q.team !== sq && q.out <= 0 && q.slide < 0).map(q => len(q.x - p.x, q.y - p.y)));
  const n0 = t.sorteggi;
  const press = (typeof pressioneSu === 'function') ? pressioneSu(p) : null;
  const n1 = t.sorteggi;
  const scelto = scegliSmarcato(p);
  if (cfg.filtrante) {
    /* la lettura del distacco di un disco PASSAGGIO trascinato di 40 px
       verso il ricevente: armato, sotto TRASCINA_SU (rasoterra), senza
       aggancio maturato */
    const tr = { armato: true, ux: dir, uy: 0, l: 40, dx: dir * 40, dy: 0 };
    eseguiPassaggioL14(p, tr, -1);
  } else {
    eseguiPassUmano(p);
  }
  const b = G.ball;
  const n2 = t.sorteggi;
  return { pi, mi, scelto: P.indexOf(scelto), passTo: b.passTo, crossTo: b.crossTo, owner: b.owner,
           vel: len(b.vx, b.vy), ang: Math.atan2(b.vy * dir, b.vx * dir), vz: b.vz,
           press, dAvvVero: +dAvvVero.toFixed(2), sorteggiPress: n1 - n0, sorteggiCalcio: n2 - n1 };
}

(async () => {
  const provaRel = arg('gioco', process.env.GIOCO_PROVA || '');
  const provaAbs = provaRel ? path.resolve(RADICE, provaRel) : '';
  if (provaAbs && !fs.existsSync(provaAbs)) { console.error('PROVA NULLA: manca il gioco ' + provaAbs); process.exit(3); }
  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(semeFisso, SEME);
  const ecc = []; pag.on('pageerror', e => ecc.push(e.message));
  console.log('\n=== IL PASSAGGIO UMANO SOTTO PRESSIONE (voce #159, H2) ===  ' +
              (provaAbs || 'CALCETTO-il-gioco.html (repo)') + '  -- taglia ' + TAGLIA + ', seme ' + SEME);
  let rossi = 0, verdi = 0, esploso = null;
  const di = (ok, nome, det) => { ok ? verdi++ : rossi++; console.log((ok ? '  OK   ' : '  NO   ') + nome + (det ? '\n         ' + det : '')); };
  const f = v => (v === null || v === undefined) ? String(v) : (+v).toFixed(3);
  try {
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
    await pag.waitForTimeout(150);
    await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
    await pag.evaluate('window.AVVIA = ' + AVVIA.toString() + '; window.SCENA_PASSO = ' + SCENA_PASSO.toString() + ';');
    const av = await pag.evaluate(([s, tg]) => window.AVVIA(s, tg), [SEME, TAGLIA]);
    if (av.errore) throw Object.assign(new Error(av.errore), { banco: true });

    const scena = async cfg => {
      const r = await pag.evaluate(c => window.SCENA_PASSO(c), Object.assign({ dRic: D_RIC, vyRic: VY_RIC, dAvv: D_AVV }, cfg));
      if (r.errore) throw Object.assign(new Error(r.errore), { banco: true });
      return r;
    };
    /* i numeri di ieri, dalla geometria della scena: lead 0,32 sul
       ricevente che corre di lato, poi clamp(300+l*0.9,320,520) */
    const ayIeri = VY_RIC * 0.32;
    const lIeri = Math.hypot(D_RIC, ayIeri);
    const velIeri = Math.max(320, Math.min(520, 300 + lIeri * 0.9));
    const angIeri = Math.atan2(ayIeri, D_RIC);
    /* la filtrante di ieri: fat = 120/P_SPEED(168), lead 0,32+0,23*fat,
       spdP+(spdF-spdP)*fat */
    const fat = Math.min(1, VY_RIC / 168);
    const ayF = VY_RIC * (0.32 + 0.23 * fat);
    const lF = Math.hypot(D_RIC, ayF);
    const velFIeri = Math.max(320, Math.min(520, 300 + lF * 0.9)) + (Math.max(420, Math.min(640, 380 + lF * 1.1)) - Math.max(320, Math.min(520, 300 + lF * 0.9))) * fat;

    const R = {};
    for (const sq of [0, 1]) {
      R[sq] = {
        libero: await scena({ sq, pressione: false, filtrante: false, seme: SEME + 11 }),
        press: await scena({ sq, pressione: true, filtrante: false, seme: SEME + 11 }),
        press2: await scena({ sq, pressione: true, filtrante: false, seme: SEME + 977 }),
        fLibero: await scena({ sq, pressione: false, filtrante: true, seme: SEME + 11 }),
        fPress: await scena({ sq, pressione: true, filtrante: true, seme: SEME + 11 }),
      };
    }
    const sunto = r => 'vel=' + f(r.vel) + ' ang=' + f(r.ang) + ' passTo=' + r.passTo + ' (m=' + r.mi + ', scelto=' + r.scelto + ') owner=' + r.owner +
                       ' press=' + f(r.press) + ' dAvv=' + r.dAvvVero + ' sorteggi(press/calcio)=' + r.sorteggiPress + '/' + r.sorteggiCalcio;
    for (const sq of [0, 1]) {
      const L = R[sq].libero, Pr = R[sq].press, P2 = R[sq].press2, FL = R[sq].fLibero, FP = R[sq].fPress;
      di(Pr.vel < L.vel - 1 && Math.abs(L.vel - velIeri) < 1e-6 && Math.abs(L.ang - angIeri) < 1e-9,
         '1. PASSAGGIO squadra ' + sq + ': sotto pressione il pallone parte piu\' piano; libero parte come ieri (' + f(velIeri) + ' u/s, angolo ' + f(angIeri) + ')',
         'libero: ' + sunto(L) + '\n         press:  ' + sunto(Pr));
      di(L.passTo === L.mi && Pr.passTo === Pr.mi && L.owner === -1 && Pr.owner === -1 && L.scelto === L.mi && Pr.scelto === Pr.mi,
         '2. PASSAGGIO squadra ' + sq + ': b.passTo scritto (= il ricevente) e pallone partito con e senza pressione; la scelta resta la stessa',
         'passTo libero=' + L.passTo + ' press=' + Pr.passTo + '  scelto libero=' + L.scelto + ' press=' + Pr.scelto + '  m=' + L.mi);
      const angAtteso = Pr.press === null ? null : Math.atan2(VY_RIC * 0.32 * (1 - 0.6 * Pr.press), D_RIC);
      di(Pr.press !== null && Pr.ang < L.ang - 1e-6 && Math.abs(Pr.ang - angAtteso) < 1e-9 &&
         Math.abs(Pr.ang - P2.ang) < 1e-12 && Math.abs(Pr.vel - P2.vel) < 1e-12,
         '3. PASSAGGIO squadra ' + sq + ': sotto pressione il lead si accorcia (angolo minore, = atan2(vy*0,32*(1-0,6*press), 170)) e resta deterministico su due semi',
         'ang libero=' + f(L.ang) + ' press=' + f(Pr.ang) + ' atteso=' + f(angAtteso) + '  seme2: ang=' + f(P2.ang) + ' vel=' + f(P2.vel));
      di(FP.vel < FL.vel - 1 && Math.abs(FL.vel - velFIeri) < 1e-6 &&
         FL.passTo === FL.mi && FP.passTo === FP.mi && FL.vz === 0 && FP.vz === 0 && FL.crossTo === -1 && FP.crossTo === -1,
         '4. FILTRANTE squadra ' + sq + ': rasoterra, velocita\' minore sotto pressione e di ieri (' + f(velFIeri) + ') senza; passTo = m, vz 0, crossTo -1',
         'libero: ' + sunto(FL) + ' vz=' + FL.vz + ' crossTo=' + FL.crossTo + '\n         press:  ' + sunto(FP) + ' vz=' + FP.vz + ' crossTo=' + FP.crossTo);
      di(Pr.press !== null && [L, Pr, P2, FL, FP].every(r => r.sorteggiPress === 0) && Pr.press > 0.8 && L.press === 0,
         '5. squadra ' + sq + ': pressioneSu(p) non estrae sorteggi; vale 0 libero e ~0,87 con l\'uomo a 6 u',
         'press libero=' + f(L.press) + ' addosso=' + f(Pr.press) + '  sorteggi del calcio (info): libero ' + L.sorteggiCalcio + ', press ' + Pr.sorteggiCalcio +
         ', filtrante libera ' + FL.sorteggiCalcio + ', filtrante press ' + FP.sorteggiCalcio);
    }
    const chiave = r => [f(r.vel), f(r.ang), r.passTo === r.mi, r.owner, f(r.press), r.vz, r.crossTo].join('|');
    const spec = ['libero', 'press', 'press2', 'fLibero', 'fPress'].filter(k => chiave(R[0][k]) !== chiave(R[1][k]));
    di(spec.length === 0, 'SPECCHIO -- le due squadre danno gli stessi numeri scena per scena',
       spec.length ? spec.map(k => k + ': ' + chiave(R[0][k]) + '  vs  ' + chiave(R[1][k])).join(' | ')
                   : 'libero=' + chiave(R[0].libero) + '  press=' + chiave(R[0].press));
  } catch (er) { esploso = (er && er.stack) || String(er); }
  await browser.close(); srv.chiudi();
  if (ecc.length) { console.log('\n  ECCEZIONI DI PAGINA: ' + ecc.join(' | ')); }
  if (esploso) { console.log('\nBANCO ESPLOSO: ' + esploso); process.exit(2); }
  console.log('\n' + (verdi + rossi) + ' prove, ' + verdi + ' verdi, ' + rossi + ' rosse  ->  ' + (rossi ? 'ROSSO' : 'VERDE'));
  process.exit(rossi ? 1 : 0);
})().catch(er => { console.error('BANCO ESPLOSO:', er.message); process.exit(2); });
