/* =====================================================================
   _t-159-portiere-mani.js -- IL PORTIERE PERDE LE MANI (voce #159, P1,
   voce #6 dell'elenco del realismo del 24/9).

   IL DIFETTO, LETTO SUL CODICE. updatePlayerFisica esce PRIMA del
   decremento generale di p.kickCd quando il giocatore e' il portiere
   («if(p.role==='gk'){ updateKeeper(p,dt); return; }» e SOTTO
   «p.kickCd=Math.max(0,p.kickCd-dt)»). Dentro updateKeeper l'unico
   decremento sta nel ramo «if(b.owner===G.players.indexOf(p))», cioe'
   l'orologio del rinvio quando il pallone e' FRA LE SUE MANI. Ma
   rinvioPortiere scrive «b.owner=-1» e poi «p.kickCd=0.4»: dal
   fotogramma dopo nessuno decrementa piu' quel 0,4. Stessa sorte per il
   rimpallo sul corpo in updateBall («p.kickCd=Math.max(p.kickCd,0.18)»),
   che vale anche per il portiere. E il kickCd congelato spegne DUE cose:
   la presa in piedi («if(p.kickCd<=0){ ... tentaPresa(p,b); }») e la
   raccolta coi piedi di updateBall («if(... p.kickCd>0 ...) continue»).
   Unico azzeramento: resetKickoff, cioe' un gol o un fischio. Il tuffo e
   il corpo a terra chiamano tentaPresa senza guardia: il portiere
   tuffato para ancora, quello in piedi no -- ed e' per questo che il
   difetto non si vedeva come «non para mai» ma come «non si muove».

   DUE PROVE.
     1. RINVIO-POI-MANI -- la prova secca. Pallone fra le mani del
        portiere della squadra 0 (owner = lui, come dopo una presa),
        kickCd a un soffio dallo zero: al passo dopo scatta
        rinvioPortiere (owner torna -1, kickCd 0,4). Mezzo secondo di
        simulazione piu' tardi kickCd DEVE essere zero. Oggi resta 0,400
        per sempre: ROSSA. Lo stesso, specchiato, sul portiere della
        squadra 1: le due squadre devono dare lo stesso numero.
     2. PARTITE-INTERE -- la misura. Su partite CPU contro CPU intere,
        a ogni passo di simulazione in gioco vivo ('play'/'golden') si
        campiona per i DUE portieri il predicato «congelato»:
          kickCd>0 && owner!==lui && dive<=0 && recover<=0 && charge<0
        (in piedi, senza il pallone, con le mani spente). Si misurano la
        quota di fotogrammi e la STRISCIA PIU' LUNGA di fotogrammi
        consecutivi. Oggi la striscia dura fino al fischio successivo
        (centinaia o migliaia di fotogrammi); dopo la cura un rinvio
        spegne le mani per 24 fotogrammi (0,4 s) e un rimpallo per 11
        (0,18 s), piu' qualche catena rara: la soglia e' 60 fotogrammi
        (1 s), larga il doppio del legittimo e cento volte sotto il
        difetto. La quota per cento si stampa come informazione.

   ORDINE SACRO: startMatch PRIMA, setCpuVsCpu DOPO. Chi teletrasporta
   il pallone azzera lastTouch/toccoPiede (lezione 21): qui il pallone
   viene messo FRA LE MANI del portiere, e lastTouch e' lui stesso con
   toccoPiede falso, esattamente lo stato che una presa lascia.

   ZERO dado() dal banco: scrive lo stato e legge lo stato.

   uso:  node strumenti/_t-159-portiere-mani.js
         node strumenti/_t-159-portiere-mani.js --gioco fuori/159/prima.html
         node strumenti/_t-159-portiere-mani.js --taglia 7 --seme 123 --partite 3
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
const PARTITE = Math.max(1, +arg('partite', 2));
const SOGLIA_STRISCIA = 60;   // fotogrammi: 1 s, il doppio del legittimo (0,4 s di rinvio)

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

/* PROVA 1, dentro la pagina: il rinvio e il mezzo secondo dopo. */
function SCENA_RINVIO(seme, taglia, squadra) {
  const t = window.__test;
  t.semina(seme);
  t.startMatch(1, 1, { size: taglia });
  t.setCpuVsCpu(true);
  t.simulate(3);                                   // oltre il calcio d'inizio
  if (t.state !== 'play') return { errore: 'scena non in play dopo 3 s: ' + t.state };
  const gk = t.players.find(p => p.team === squadra && p.role === 'gk');
  if (!gk) return { errore: 'portiere della squadra ' + squadra + ' non trovato' };
  const gi = t.players.indexOf(gk);
  /* fra le mani, come dopo una presa: owner lui, lastTouch lui, non un piede */
  Object.assign(t.ball, { owner: gi, x: gk.x, y: gk.y, z: 0, vx: 0, vy: 0, vz: 0,
                          passTo: -1, crossTo: -1, lastTouch: gi, toccoPiede: false });
  gk.dive = 0; gk.recover = 0; gk.charge = -1; gk.kickCd = 0.001;   // il rinvio scatta al passo dopo
  t.simulate(1 / 60);
  const dopoRinvio = { owner: t.ball.owner, kickCd: +gk.kickCd.toFixed(3), rinvT: +gk.rinvT.toFixed(2) };
  const tracce = [];
  for (let i = 0; i < 30; i++) { t.simulate(1 / 60); tracce.push(+gk.kickCd.toFixed(3)); }
  return { gi, dopoRinvio, kickCdFine: +gk.kickCd.toFixed(4), ownerFine: t.ball.owner, scena: t.state,
           tracce: tracce.filter((_, i) => i % 6 === 5) };
}

/* PROVA 2, dentro la pagina: una partita intera col campionatore sul passo. */
function PARTITA_CAMPIONATA(seme, taglia) {
  const t = window.__test;
  if (!window.__maniInstallato) {
    const s0 = window.step;
    window.step = function () {
      s0();
      const M = window.__mani; if (!M) return;
      if (G.scene !== 'play' && G.scene !== 'golden') return;
      const b = G.ball;
      for (let gi = 0; gi < G.players.length; gi++) {
        const p = G.players[gi];
        if (p.role !== 'gk') continue;
        const k = M.per[p.team] || (M.per[p.team] = { frames: 0, congelati: 0, striscia: 0, maxStriscia: 0 });
        k.frames++;
        const cong = p.kickCd > 0 && b.owner !== gi && p.dive <= 0 && p.recover <= 0 && p.charge < 0;
        if (cong) { k.congelati++; k.striscia++; if (k.striscia > k.maxStriscia) k.maxStriscia = k.striscia; }
        else k.striscia = 0;
      }
    };
    window.__maniInstallato = true;
  }
  window.__mani = { per: {} };
  t.semina(seme);
  t.startMatch(1, 1, { size: taglia });
  t.setCpuVsCpu(true);
  let sim = 0;
  while (t.state !== 'end' && sim < 600) { t.simulate(10); sim += 10; }
  const per = window.__mani.per;
  window.__mani = null;
  const esito = {};
  for (const tm of Object.keys(per)) {
    const k = per[tm];
    esito[tm] = { frames: k.frames, quota: +(k.congelati / Math.max(1, k.frames) * 100).toFixed(1), maxStriscia: k.maxStriscia };
  }
  return { scena: t.state, score: t.score.slice(), sim, esito };
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
  console.log('\n=== IL PORTIERE PERDE LE MANI (voce #159, P1) ===  ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)') +
              '  -- taglia ' + TAGLIA + ', seme ' + SEME);
  let rossi = 0, esploso = null;
  const verdetto = (ok, nome, dett) => { console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (dett ? '  ' + dett : '')); if (!ok) rossi++; };
  try {
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
    await pag.waitForTimeout(150);
    await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
    await pag.evaluate('window.SCENA_RINVIO = ' + SCENA_RINVIO.toString() + '; window.PARTITA_CAMPIONATA = ' + PARTITA_CAMPIONATA.toString() + ';');

    /* PROVA 1 -- RINVIO-POI-MANI, sulle due squadre */
    console.log('\n  PROVA 1 -- RINVIO-POI-MANI (0,5 s dopo il rinvio, kickCd deve essere 0)');
    const r = [];
    for (const sq of [0, 1]) {
      const e = await pag.evaluate(([s, tg, sq]) => window.SCENA_RINVIO(s, tg, sq), [SEME, TAGLIA, sq]).catch(er => ({ errore: er.message }));
      if (e.errore) { esploso = 'PROVA 1 squadra ' + sq + ': ' + e.errore; break; }
      r.push(e);
      const partito = e.dopoRinvio.owner === -1 && e.dopoRinvio.rinvT > 0;
      verdetto(partito, 'squadra ' + sq + ': il rinvio e\' partito (owner -1, rinvT>0)', JSON.stringify(e.dopoRinvio));
      verdetto(e.kickCdFine <= 1e-6, 'squadra ' + sq + ': kickCd a 0 mezzo secondo dopo il rinvio',
               'kickCd=' + e.kickCdFine + '  traccia ogni 0,1 s: ' + e.tracce.join(' ') + '  scena ' + e.scena);
    }
    if (!esploso && r.length === 2) verdetto(r[0].kickCdFine === r[1].kickCdFine, 'le due squadre danno lo stesso kickCd finale',
                                             r[0].kickCdFine + ' / ' + r[1].kickCdFine);

    /* PROVA 2 -- PARTITE-INTERE */
    if (!esploso) {
      console.log('\n  PROVA 2 -- PARTITE-INTERE (striscia massima di fotogrammi «in piedi, senza pallone, mani spente» <= ' + SOGLIA_STRISCIA + ')');
      for (let i = 0; i < PARTITE; i++) {
        const e = await pag.evaluate(([s, tg]) => window.PARTITA_CAMPIONATA(s, tg), [SEME + 1 + i, TAGLIA]).catch(er => ({ errore: er.message }));
        if (e.errore) { esploso = 'PROVA 2 partita ' + i + ': ' + e.errore; break; }
        if (e.scena !== 'end') { esploso = 'PROVA 2 partita ' + i + ': non finisce (' + e.scena + ' dopo ' + e.sim + ' s)'; break; }
        for (const tm of Object.keys(e.esito)) {
          const k = e.esito[tm];
          verdetto(k.maxStriscia <= SOGLIA_STRISCIA, 'partita ' + (i + 1) + ' (seme ' + (SEME + 1 + i) + ') squadra ' + tm +
                   ': striscia massima ' + k.maxStriscia + ' fotogrammi', 'congelato il ' + k.quota + '% di ' + k.frames + ' fotogrammi vivi, risultato ' + e.score.join('-'));
        }
      }
    }
  } catch (e) { esploso = e.message; }
  await browser.close(); srv.chiudi();
  if (ecc.length) { console.log('\n  ECCEZIONI DI PAGINA: ' + ecc.join(' | ')); }
  if (esploso) { console.log('\nBANCO ESPLOSO: ' + esploso); process.exit(2); }
  console.log('\n' + (rossi ? 'ROSSO: ' + rossi + ' asserzioni fallite' : 'VERDE: tutte le asserzioni passano'));
  process.exit(rossi ? 1 : 0);
})().catch(e => { console.error('BANCO ESPLOSO:', e.message); process.exit(2); });
