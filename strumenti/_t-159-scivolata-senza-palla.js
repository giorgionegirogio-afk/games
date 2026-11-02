/* =====================================================================
   _t-159-scivolata-senza-palla.js — LA SCIVOLATA SU CHI NON HA LA PALLA
   (voce #159, cura R1, difetto #12 della ricognizione del 2/11/2026)

   IL DIFETTO. checkSlideContact conosce due soli esiti: il contatto col
   PORTATORE avversario (rubata pulita o fallo) e la spazzata del pallone
   libero. Un uomo steso da una scivolata mentre NON ha la palla — perche'
   l'ha appena passata, perche' la palla e' di un compagno, perche' e'
   solo in corsa — non produce niente: ne' fallo, ne' contatto, ne' caduta.
   E' lo sfruttamento piu' comodo per l'umano contro la CPU: si entra
   «sul passaggio» senza rischio, e il passatore si rialza come se nulla.

   LA CURA (R1). Il corpo del fallo esce da checkSlideContact in
   falloDaScivolata(p, vittima, cattivo), vantaggio compreso, e viene
   chiamato ANCHE da un ramo nuovo dopo la spazzata: se la scivolata non
   ha giocato il pallone (ne' adesso ne' prima, in questa stessa entrata:
   p.slideGioco) e l'avversario piu' vicino (non il portatore, in campo)
   sta entro P_R*2+4, e' fallo su di lui. Zero dado() nella decisione.

   RESTRIZIONE DICHIARATA (misurata il 2/11/2026 con _eventi.js): col
   ramo aperto a tutti i falli CPU contro CPU salivano da 1,1 a 1,8 a
   partita a taglia 5 (0,4->1,6 a 7, 0,5->1,1 a 11), oltre il +20% dello
   spec; il ramo e' quindi del SOLO GIOCATORE SOTTO IL POLLICE (squadra
   non CPU e uomo controllato, la stessa espressione di `umano` in
   startSlide): e' lui che aveva lo sfruttamento in mano. In CPU contro
   CPU il ramo non gira mai (54 partite identiche a PRIMA, tre taglie).

   LE PROVE (specchiate: p di squadra 1 su q di squadra 0, poi il
   contrario — nessuna cura puo' leggere team===0 per decidere; p e'
   reso l'uomo controllato della sua squadra prima del passo):
     A. CONDANNA — p scivola verso q fermo a 20 unita', pallone di
        nessuno a 300 unita': dopo UN passo falli[p.team] deve valere 1,
        l'ultimo fatto deve essere 'fallo' con vittima q, p a terra
        (slide=-1, recover>0) e q stordito (recover>0). Oggi: zero.
     A'. la stessa con q di spalle: fallo CATTIVO, cartellino pendente.
     B. CONTROLLO — stessa scena con q a 60 unita' (fuori portata): zero
        falli, la scivolata prosegue (slide>0). Verde prima e dopo: prova
        che il ramo nuovo non fischia a vuoto.
     C. CONTROLLO — pallone di nessuno A PORTATA DI PIEDE (d<KICK_R) e q
        a 20 unita': la scivolata spazza il pallone e NON e' fallo (ha
        giocato la palla). Verde prima e dopo.
     D. CONTROLLO DELLA RESTRIZIONE — la scena di A con p lasciato CPU:
        nessun fallo. Verde prima e dopo.
   La geometria del «cattivo» si controlla in A: q che guarda verso p
   (fx opposto all'entrata) non e' «da dietro», quindi cattivo=false con
   p.slide appena nato (inTempo); specchiando q di spalle, cattivo=true.

   LEZIONE 21: chi teletrasporta il pallone azzera b.lastTouch e
   b.toccoPiede, altrimenti la scena eredita l'ultimo tocco vero.
   ORDINE SACRO: startMatch PRIMA, setCpuVsCpu(true) DOPO.

   uso:  node strumenti/_t-159-scivolata-senza-palla.js [--gioco f.html]
                                                         [--taglia 5] [--seme N]
   esce 0 verde · 1 rosso · 2 banco esploso · 3 prova nulla
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
const TAGLIA = +arg('taglia', 5);
const SEME = +arg('seme', 20261102);
const provaRel = arg('gioco', process.env.GIOCO_PROVA || '');
const provaAbs = provaRel ? path.resolve(RADICE, provaRel) : '';
if (provaAbs && !fs.existsSync(provaAbs)) { console.error('PROVA NULLA: il gioco indicato non esiste: ' + provaAbs); process.exit(3); }

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

/* LA SCENA, dentro la pagina. `modo`: 'vicino' (q a 20), 'lontano' (q a
   60), 'palla' (pallone a portata, q a 20). `pTeam` la squadra di chi
   scivola. `qSpalle` true = q guarda nello stesso verso dell'entrata
   (da dietro -> cattivo). Ritorna gli indici, per leggere dopo. */
function SCENA({ pTeam, modo, qSpalle }) {
  const t = window.__test;
  const prop = t.proporzioni();
  const P = t.players;
  const p = P.find(u => u.team === pTeam && u.role !== 'gk' && u.out <= 0);
  const q = P.find(u => u.team === 1 - pTeam && u.role !== 'gk' && u.out <= 0);
  if (!p || !q) return { errore: 'giocatori di movimento non trovati' };
  const pi = P.indexOf(p), qi = P.indexOf(q);
  const x = prop.FW / 2, y = prop.FH / 2;
  /* tutti gli altri lontani, sulle proprie linee: nessun terzo corpo a
     portata della scivolata, cosi' «il piu' vicino» e' q per costruzione */
  P.forEach((u, i) => {
    if (i === pi || i === qi) return;
    u.x = u.team === 0 ? 40 : prop.FW - 40;
    u.y = 30 + (i * 37) % (prop.FH - 60);
    u.vx = 0; u.vy = 0; u.slide = -1; u.recover = 0;
  });
  const dq = modo === 'lontano' ? 60 : 20;
  Object.assign(q, { x: x + dq, y, fx: qSpalle ? 1 : -1, fy: 0, vx: 0, vy: 0, slide: -1, recover: 0, rove: -1, charge: -1, out: 0, kickCd: 0 });
  Object.assign(p, { x, y, fx: 1, fy: 0, vx: 0, vy: 0, slide: 0, slideDX: 1, slideDY: 0, recover: 0, rove: -1, charge: -1, out: 0, kickCd: 0 });
  const b = t.ball;
  const bx = modo === 'palla' ? x + 14 : x + 300;
  Object.assign(b, { owner: -1, x: bx, y, z: 0, vx: 0, vy: 0, vz: 0, passTo: -1, crossTo: -1, lastTouch: -1, toccoPiede: false, saveRolled: false });
  G.vantaggio = null; G.freeze = 0;
  G.stats.falli = [0, 0];
  const nFatti = G.fattiTot;
  return { ok: true, pi, qi, nFatti, x, y, bx };
}

/* un passo e la lettura */
function LEGGI({ pi, qi, nFatti, pTeam }) {
  const t = window.__test;
  t.simulate(1 / 60);
  const P = t.players, p = P[pi], q = P[qi];
  const nuovi = G.fatti.slice(Math.max(0, G.fatti.length - (G.fattiTot - nFatti)));
  const fallo = nuovi.filter(f => f.che === 'fallo').map(f => ({ chi: f.chi, vittima: f.esito && f.esito.vittima, cattivo: !!(f.esito && f.esito.cattivo) }));
  return {
    falli: G.stats.falli.slice(), fallo,
    pSlide: +p.slide.toFixed(3), pRecover: +p.recover.toFixed(3), qRecover: +q.recover.toFixed(3),
    owner: t.ball.owner, bvx: Math.round(t.ball.vx), stato: t.state,
    vantaggio: G.vantaggio ? { team: G.vantaggio.team, card: G.vantaggio.card } : null,
    pTeam, pi, qi,
  };
}

(async () => {
  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(semeFisso, SEME);
  const ecc = []; pag.on('pageerror', e => ecc.push(e.message));
  console.log('\n=== SCIVOLATA SU CHI NON HA LA PALLA (R1, voce #159) ===  ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)') + '  -- taglia ' + TAGLIA + ', seme ' + SEME);
  let rossi = 0, verdi = 0;
  const di = (ok, nome, det) => { ok ? verdi++ : rossi++; console.log((ok ? '  OK   ' : '  NO   ') + nome + (det ? '\n         ' + det : '')); };
  try {
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
    await pag.waitForTimeout(150);
    await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
    await pag.evaluate(`window.SCENA = ${SCENA.toString()}; window.LEGGI = ${LEGGI.toString()};`);

    /* LA SCENA PARTE DA UNA PARTITA VERA ARRIVATA A 'play' (CPU contro CPU,
       ordine sacro), POI p diventa l'uomo sotto il pollice: la sua squadra
       smette di essere CPU e il controllo e' su di lui -- lo stato che il
       gioco scrive da se' in una partita a uno o due giocatori. E' la
       forma che la cura R1 pretende (restrizione dichiarata: solo il
       giocatore controllato paga il fallo su chi non ha la palla, perche'
       e' lui che aveva lo sfruttamento in mano). Con cfg.cpu=true p resta
       CPU: e' il CONTROLLO della restrizione, nessun fallo. */
    const scena = async (cfg) => {
      const r = await pag.evaluate(({ seme, taglia, cfg }) => {
        const t = window.__test;
        t.semina(seme);
        t.startMatch(1, 1, { size: taglia });      // PRIMA
        t.setCpuVsCpu(true);                        // DOPO (ordine sacro)
        for (let i = 0; i < 900 && t.state !== 'play'; i++) t.simulate(1 / 60);
        if (t.state !== 'play') return { errore: 'la partita non arriva a play (stato ' + t.state + ')' };
        const s = SCENA(cfg);
        if (s.errore) return s;
        if (!cfg.cpu) { G.cpu[cfg.pTeam] = false; G.ctrl[cfg.pTeam] = s.pi; }
        return LEGGI({ pi: s.pi, qi: s.qi, nFatti: s.nFatti, pTeam: cfg.pTeam });
      }, { seme: SEME, taglia: TAGLIA, cfg });
      return r;
    };

    for (const pTeam of [1, 0]) {
      const lato = 'p=squadra ' + pTeam + ' su q=squadra ' + (1 - pTeam);
      /* A. CONDANNA: q davanti, di faccia (non da dietro) */
      {
        const r = await scena({ pTeam, modo: 'vicino', qSpalle: false });
        if (r.errore) di(false, 'A. ' + lato, 'BANCO: ' + r.errore);
        else {
          const f = r.fallo[0];
          const ok = r.falli[pTeam] === 1 && r.falli[1 - pTeam] === 0 && r.fallo.length === 1
            && !!f && f.chi === r.pi && f.vittima === r.qi && f.cattivo === false
            && r.pSlide === -1 && r.pRecover > 0 && r.qRecover > 0;
          di(ok, 'A. CONDANNA ' + lato + ' — q a 20 u senza palla: UN fallo di p, fatto \'fallo\' con vittima q, p a terra, q stordito, cattivo=false (di faccia, in tempo)',
            'falli=' + r.falli.join('/') + ' fatti fallo=' + JSON.stringify(r.fallo) + ' p.slide=' + r.pSlide + ' p.recover=' + r.pRecover + ' q.recover=' + r.qRecover + ' vantaggio=' + JSON.stringify(r.vantaggio));
        }
      }
      /* A'. la stessa, q di spalle: da dietro -> cattivo */
      {
        const r = await scena({ pTeam, modo: 'vicino', qSpalle: true });
        if (r.errore) di(false, 'A\'. ' + lato, 'BANCO: ' + r.errore);
        else {
          const f = r.fallo[0];
          const ok = r.falli[pTeam] === 1 && r.fallo.length === 1 && !!f && f.cattivo === true && r.vantaggio && r.vantaggio.card != null;
          di(ok, 'A\'. CONDANNA ' + lato + ' — q di spalle: fallo CATTIVO (da dietro), cartellino pendente nel vantaggio',
            'falli=' + r.falli.join('/') + ' fatti fallo=' + JSON.stringify(r.fallo) + ' vantaggio=' + JSON.stringify(r.vantaggio));
        }
      }
      /* B. CONTROLLO: q a 60, fuori portata */
      {
        const r = await scena({ pTeam, modo: 'lontano', qSpalle: false });
        if (r.errore) di(false, 'B. ' + lato, 'BANCO: ' + r.errore);
        else {
          const ok = r.falli[0] === 0 && r.falli[1] === 0 && r.fallo.length === 0 && r.pSlide > 0;
          di(ok, 'B. CONTROLLO ' + lato + ' — q a 60 u: nessun fallo, la scivolata prosegue',
            'falli=' + r.falli.join('/') + ' fatti fallo=' + r.fallo.length + ' p.slide=' + r.pSlide);
        }
      }
      /* C. CONTROLLO: pallone a portata, q a 20: spazzata, non fallo */
      {
        const r = await scena({ pTeam, modo: 'palla', qSpalle: false });
        if (r.errore) di(false, 'C. ' + lato, 'BANCO: ' + r.errore);
        else {
          const ok = r.falli[0] === 0 && r.falli[1] === 0 && r.fallo.length === 0 && r.bvx > 300;
          di(ok, 'C. CONTROLLO ' + lato + ' — pallone a portata di piede e q a 20 u: la scivolata SPAZZA (b.vx>300) e non e\' fallo',
            'falli=' + r.falli.join('/') + ' fatti fallo=' + r.fallo.length + ' b.vx=' + r.bvx + ' p.slide=' + r.pSlide);
        }
      }
      /* D. CONTROLLO DELLA RESTRIZIONE: la stessa scena di A, ma p resta CPU:
         nessun fallo (il ramo e' del solo pollice; i banchi CPU contro CPU
         non si muovono). Verde prima e dopo. */
      {
        const r = await scena({ pTeam, modo: 'vicino', qSpalle: false, cpu: true });
        if (r.errore) di(false, 'D. ' + lato, 'BANCO: ' + r.errore);
        else {
          const ok = r.falli[0] === 0 && r.falli[1] === 0 && r.fallo.length === 0 && r.pSlide > 0;
          di(ok, 'D. CONTROLLO ' + lato + ' — stessa scena di A ma p e\' CPU: nessun fallo (ramo ristretto al giocatore controllato), la scivolata prosegue',
            'falli=' + r.falli.join('/') + ' fatti fallo=' + r.fallo.length + ' p.slide=' + r.pSlide);
        }
      }
    }
  } catch (e) {
    console.error('BANCO ESPLOSO: ' + (e && e.stack || e));
    await browser.close(); srv.chiudi(); process.exit(2);
  }
  await browser.close(); srv.chiudi();
  if (ecc.length) { console.error('ECCEZIONI DI PAGINA: ' + ecc.join(' | ')); process.exit(2); }
  console.log('\n' + (verdi + rossi) + ' prove, ' + verdi + ' verdi, ' + rossi + ' rosse  ->  ' + (rossi ? 'ROSSO' : 'VERDE'));
  process.exit(rossi ? 1 : 0);
})();
