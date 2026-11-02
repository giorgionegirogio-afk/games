/* =====================================================================
   _t-159-testa-vicino.js -- IL DUELLO AEREO LO VINCE L'ORDINE DELL'ARRAY
   (voce #159, P4: voce #5 dell'elenco del realismo del 24/9).

   IL DIFETTO, LETTO SUL CODICE. In updateBall, quando il pallone e' alto
   nella finestra delle teste (Z_SOPRA_TESTA < z <= Z_TESTA_MAX) il ciclo
   «for(let qi=0;qi<G.players.length;qi++){ ... colpoDiTesta(q,qi,b);
   break; }» incorna col PRIMO uomo a portata, non col piu' vicino -- il
   commento lo dichiara («primo che c'e'»). G.players e' costruito
   squadra 0 prima e squadra 1 dopo: a pari portata ogni testa contesa
   la vince la squadra 0, cioe' il giocatore umano, per costruzione
   dell'array. E' una ferita di EQUITA', non solo di realismo.

   LA SCENA. Partita in corso, tutti gli uomini di movimento lontani,
   pallone fermo a mezz'aria (z 36) a centrocampo, LIBERO (lastTouch e
   toccoPiede azzerati, lezione 21), due contendenti a distanze
   dichiarate, poi UN SOLO updateBall(1/60) chiamato direttamente -- la
   funzione vera, non un canale sintetico -- cosi' nessun'altra parte del
   passo muove i corpi. Chi ha incornato e' chi porta kickClip 'testa' e
   kickT acceso (li scrive colpoDiTesta, e solo lui).

   QUATTRO COPPIE SPECCHIATE (la stessa geometria con le squadre
   scambiate deve dare lo stesso vincitore geometrico):
     1. VICINO     uno a 10 u, l'altro a 22 u (portata del corpo 24):
                   vince chi sta a 10. Oggi vince la squadra 0 in
                   entrambe le versioni: ROSSA quando il vicino e' di
                   squadra 1.
     2. DESIGNATO  il destinatario del cross (crossTo, portata 34) a
                   30 u (30/34 = 0,88 della sua portata), l'altro a 22 u
                   (22/24 = 0,92): vince il designato, perche' la
                   portata lunga e' l'attacco al pallone di chi e' stato
                   chiamato. Oggi vince la squadra 0 in entrambe le
                   versioni: ROSSA quando il designato e' di squadra 1.
     3. FUORI-PORTATA (controllo discriminante) designato a 36 u
                   (oltre 34), l'altro a 22: vince l'altro, prima e dopo.
     4. SOLO-UNO   (controllo) un solo uomo a portata: incorna lui,
                   prima e dopo -- la cura non deve aver rotto il caso
                   semplice.

   ZERO dado() dal banco e zero dado() nella cura (il commento «Nessun
   sorteggio» del ciclo resta vero). ORDINE SACRO: startMatch PRIMA,
   setCpuVsCpu DOPO.

   uso:  node strumenti/_t-159-testa-vicino.js
         node strumenti/_t-159-testa-vicino.js --gioco fuori/159/prima.html
         node strumenti/_t-159-testa-vicino.js --taglia 7 --seme 123
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

/* dentro la pagina. `vicino` e' la squadra del primo contendente (quello
   favorito dalla geometria), `dA`/`dB` le distanze del favorito e
   dell'altro, `designato` true mette crossTo sul favorito, `soloUno`
   toglie l'altro dalla scena. Le distanze sono in unita' di taglia 5 e
   NON scalano: portata del corpo (P_R+B_R+3) e del designato (34) sono
   numeri del gioco, non del campo -- si leggono da proporzioni() e si
   stampano, cosi' a 11 (corpi piu' piccoli) il referto dice da se' se la
   scena e' ancora dentro le portate. */
function SCENA_TESTA(seme, taglia, cfg) {
  const t = window.__test;
  t.semina(seme);
  t.startMatch(1, 1, { size: taglia });
  t.setCpuVsCpu(true);
  t.simulate(3);
  if (t.state !== 'play') return { errore: 'scena non in play dopo 3 s: ' + t.state };
  const C = t.campo, P = t.proporzioni();
  const FW = C.FW, FH = C.FH;
  const portataCorpo = P.P_R + P.B_R + 3;
  const A = t.players.find(p => p.team === cfg.vicino && p.role !== 'gk');
  const B = t.players.find(p => p.team === 1 - cfg.vicino && p.role !== 'gk');
  if (!A || !B) return { errore: 'contendenti non trovati' };
  const ia = t.players.indexOf(A), ib = t.players.indexOf(B);
  /* tutti lontani, negli angoli della propria meta' campo */
  let n = 0;
  for (const q of t.players) {
    if (q.role === 'gk') continue;
    Object.assign(q, { x: q.team === 0 ? FW * 0.08 + (n % 3) * 12 : FW * 0.92 - (n % 3) * 12, y: FH * 0.1 + (n * 53 % 100) / 100 * FH * 0.8,
                       vx: 0, vy: 0, slide: -1, recover: 0, rove: -1, charge: -1, kickCd: 0, kickT: 0, kickClip: null });
    n++;
  }
  const bx = FW / 2, by = FH / 2;
  /* il favorito a sinistra del pallone, l'altro a destra: la direzione
     non entra nella scelta, solo la distanza */
  Object.assign(A, { x: bx - cfg.dA, y: by, fx: 1, fy: 0 });
  if (cfg.soloUno) Object.assign(B, { x: FW / 2 + (B.team === 0 ? -1 : 1) * FW * 0.4, y: FH * 0.05 });
  else Object.assign(B, { x: bx + cfg.dB, y: by, fx: -1, fy: 0 });
  Object.assign(t.ball, { owner: -1, x: bx, y: by, z: 36, vx: 0, vy: 0, vz: 0, passTo: -1, crossTo: cfg.designato ? ia : -1,
                          lastTouch: -1, toccoPiede: false, tiroT: -1, curve: 0, perfectT: 0, saveRolled: false });
  updateBall(1 / 60);                                   // la funzione vera, un passo solo
  const teste = [];
  for (let i = 0; i < t.players.length; i++) { const q = t.players[i]; if (q.kickClip === 'testa' && q.kickT > 0) teste.push(i); }
  return { ia, ib, teamA: A.team, teamB: B.team, teste, vincitore: teste.length === 1 ? teste[0] : null,
           portataCorpo, dA: cfg.dA, dB: cfg.dB, z: +t.ball.z.toFixed(2) };
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
  console.log('\n=== IL DUELLO AEREO: VINCE IL PIU\' VICINO (voce #159, P4) ===  ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)') +
              '  -- taglia ' + TAGLIA + ', seme ' + SEME);
  let rossi = 0, esploso = null;
  const verdetto = (ok, nome, dett) => { console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (dett ? '  ' + dett : '')); if (!ok) rossi++; };
  const COPPIE = [
    { nome: '1 VICINO (10 u contro 22 u)', dA: 10, dB: 22, designato: false, soloUno: false, atteso: 'A' },
    { nome: '2 DESIGNATO (crossTo a 30 u contro 22 u)', dA: 30, dB: 22, designato: true, soloUno: false, atteso: 'A' },
    { nome: '3 FUORI-PORTATA (crossTo a 36 u contro 22 u) -- controllo', dA: 36, dB: 22, designato: true, soloUno: false, atteso: 'B' },
    { nome: '4 SOLO-UNO (uno a 15 u, nessun altro) -- controllo', dA: 15, dB: 0, designato: false, soloUno: true, atteso: 'A' },
  ];
  try {
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
    await pag.waitForTimeout(150);
    await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
    await pag.evaluate('window.SCENA_TESTA = ' + SCENA_TESTA.toString() + ';');

    for (const cp of COPPIE) {
      console.log('\n  ' + cp.nome);
      const esiti = [];
      for (const vicino of [1, 0]) {
        const cfg = Object.assign({ vicino }, cp);
        const e = await pag.evaluate(([s, tg, cfg]) => window.SCENA_TESTA(s, tg, cfg), [SEME, TAGLIA, cfg]).catch(er => ({ errore: er.message }));
        if (e.errore) { esploso = cp.nome + ' (favorito squadra ' + vicino + '): ' + e.errore; break; }
        const attesoIdx = cp.atteso === 'A' ? e.ia : e.ib;
        const chi = e.vincitore === null ? (e.teste.length ? 'piu\' di una testa: ' + e.teste.join(',') : 'nessuna testa')
                                         : ('#' + e.vincitore + ' (squadra ' + (e.vincitore === e.ia ? e.teamA : e.teamB) + ')');
        const ok = e.vincitore === attesoIdx;
        esiti.push(ok);
        verdetto(ok, 'favorito di squadra ' + vicino + ' (#' + e.ia + ' a ' + e.dA + ' u) contro #' + e.ib + (cp.soloUno ? ' lontano' : ' a ' + e.dB + ' u') +
                 ': incorna ' + chi, 'atteso #' + attesoIdx + ', portata corpo ' + e.portataCorpo + ', z ' + e.z);
      }
      if (esploso) break;
      verdetto(esiti[0] === esiti[1], 'le due versioni specchiate danno lo stesso vincitore geometrico');
    }
  } catch (e) { esploso = e.message; }
  await browser.close(); srv.chiudi();
  if (ecc.length) { console.log('\n  ECCEZIONI DI PAGINA: ' + ecc.join(' | ')); }
  if (esploso) { console.log('\nBANCO ESPLOSO: ' + esploso); process.exit(2); }
  console.log('\n' + (rossi ? 'ROSSO: ' + rossi + ' asserzioni fallite' : 'VERDE: tutte le asserzioni passano'));
  process.exit(rossi ? 1 : 0);
})().catch(e => { console.error('BANCO ESPLOSO:', e.message); process.exit(2); });
