/* =====================================================================
   _q-volo.js — LA PULSANTIERA DICE LA VERITA'? (voce #88)
   Cinque prove a passo 1/60, semi dichiarati, tutte sul comportamento:
     A  durante il volo di un NOSTRO cross il disco grande offre TIRA
        in almeno il 90% dei fotogrammi (misurato prima della cura: 9%)
     B  inseguendo un portatore avversario la faccia del disco grande
        NON cambia in 6 secondi (misurato prima: 6 cambi)
     C  entro 0,5 s dal calcio il comando e' del destinatario dichiarato
     D  tenendo TIRA durante il volo esce una volee' (G.stats.volee sale)
     E  nessuna cella ACCESA rifiuta l'atto (PRESSA offerto senza
        portatore avversario e' un verbo morto sotto il dito)
   uso: node strumenti/_q-volo.js [--gioco file.html]
   ===================================================================== */
const http = require('http');
const fs = require('fs');
const path = require('path');
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
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
const esiti = [];
const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '   (' + det + ')' : '')); };
/* SEMI DICHIARATI — senza semina() l'IA (dado() dentro startMatch e nelle
   sue decisioni) fa scegliere al caso vero, e la stessa prova misura un
   numero diverso a ogni lancio (verificato: A e' oscillato 8%/10%/22%,
   B fra 2 e 6 cambi, sullo STESSO file, in tre lanci di fila). Un banco
   che non ripete non fa da giudice a chi viene dopo: due seguono qui,
   uno per prova, cosi' il prima e il dopo si confrontano sullo stesso
   caso e non sul rumore.

   DUE TECNICHE DI SEMINA CONVIVONO IN strumenti/, e va detto perche'
   (2 settembre 2026). Gli altri banchi della casa sostituiscono
   Math.random sulla pagina con un generatore proprio (vedi
   _p-sfarfallio.js, addInitScript con xorshift): li' il seme del gioco
   resta spento e il caso passa tutto dal rimpiazzo. Qui invece si
   ACCENDE il generatore interno del gioco con t.semina(), che e' la
   stessa porta che usano le sfide. Le due tecniche sono equivalenti in
   questa prova — SEME.on e' letto solo dentro dado(), e gli unici
   Math.random rimasti nel file sono il ripiego di dado() stesso e un
   generatore del pennello che non tocca nulla di cio' che si misura —
   e questa e' piu' corta di una riga di preambolo. Chi arriva dopo
   sappia che sono due, e non una svista. */
const SEME_VOLO = 88001, SEME_INSEGUE = 88002;

(async () => {
  const prova = arg('gioco', '');
  const provaAbs = prova ? path.resolve(RADICE, prova) : '';
  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const ecc = []; pag.on('pageerror', e => ecc.push(e.message));
  console.log('\n=== LA PULSANTIERA DICE LA VERITA? ===  ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)'));
  await pag.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });

  /* ---- A + C + D: il volo di un nostro cross ---- */
  const volo = await pag.evaluate((seme) => {
    const t = window.__test;
    t.semina(seme);
    t.startMatch(1, 1, { size: 7 });
    for (let i = 0; i < 600 && G.scene !== 'play'; i++) t.simulate(1 / 60);
    if (G.scene !== 'play') return { errore: 'mai in play' };
    t.setTimeLeft(600);
    /* scena: il comandato in fascia offensiva col pallone, un compagno in area */
    const pi = G.ctrl[0]; if (pi < 0) return { errore: 'nessun comandato' };
    const p = G.players[pi];
    p.x = FW * 0.72; p.y = FH * 0.16; p.vx = 0; p.vy = 0;
    const mate = G.players.find(q => q.team === 0 && q !== p && q.role !== 'gk');
    if (!mate) return { errore: 'nessun compagno' };
    mate.x = FW - 90; mate.y = FH / 2; mate.vx = 0; mate.vy = 0;
    const b = G.ball;
    b.owner = pi; b.x = p.x + 8; b.y = p.y; b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0;
    segnaTocco(pi);
    /* il cross parte dal motore, come lo farebbe il dito */
    const mi = G.players.indexOf(mate);
    const dx = mate.x - p.x, dy = mate.y - p.y, l = Math.max(1, Math.hypot(dx, dy));
    doCross(p, dx / l, dy / l, [mate.x, mate.y], mi);
    /* LO STIMOLO SI VERIFICA PARTITO PRIMA DI MISURARNE L'EFFETTO
       (rilievo della revisione, 2 settembre 2026). doCross ha guardie
       sue e kickBall puo' rifiutare: se il cross non parte, il ciclo
       qui sotto non gira, tot resta 0 e il banco stamperebbe «0%
       (0/0)» — un rosso per la ragione sbagliata, mentre il contratto
       vuole «non ho misurato» (uscita 2). */
    if (G.ball.owner >= 0) return { errore: 'il cross non e\' partito: il pallone ha ancora un padrone' };
    const voleePrima = (G.stats.volee[0] | 0);
    /* si tiene premuto TIRA per tutto il volo, come farebbe il pollice.
       SI CONTANO SOLO I FOTOGRAMMI IN CUI LA PALLA E' NOSTRA (correzione
       del 2 settembre 2026, dopo il compito 2). La prima stesura contava
       l'intero ciclo: ma in questa scena il portiere avversario esce e
       tocca il pallone al fotogramma 57 su 237, e da li' in poi la palla
       e' LORO — chiedere che il disco dica ancora TIRA sarebbe chiedere
       al gioco di mentire, cioe' l'opposto di questa voce. Il
       denominatore giusto e' il volo NOSTRO; i fotogrammi dopo il
       cambio di lato si contano a parte e si stampano, perche' un
       banco che scarta in silenzio e' un banco che nasconde. */
    let tira = 0, tot = 0, ctrlAlDest = -1, dopoIlCambio = 0;
    for (let i = 0; i < 240 && G.ball.owner < 0; i++) {
      const nostra = squadraDelPallone() === 0;
      const bt = t.pulsanti(0);
      const grande = bt.reduce((a, z) => (z.r > a.r ? z : a), bt[0]);
      const acceso = grande.act === 'shot' && !grande.off;
      if (nostra) { if (acceso) tira++; tot++; } else dopoIlCambio++;
      startCharge(0);                       // il dito tiene TIRA
      if (ctrlAlDest < 0 && G.ctrl[0] === mi) ctrlAlDest = i;
      t.simulate(1 / 60);
    }
    for (let i = 0; i < 60; i++) t.simulate(1 / 60);
    return { tira, tot, ctrlAlDest, mi, dopoIlCambio,
             volee: (G.stats.volee[0] | 0) - voleePrima };
  }, SEME_VOLO);
  if (volo.errore) { console.log('BANCO: ' + volo.errore); process.exit(2); }
  /* zero fotogrammi campionati non e' «zero per cento»: e' «non ho
     misurato», e si esce con 2 (rilievo della revisione) */
  if (!volo.tot) { console.log('BANCO: il volo non ha campionato un solo fotogramma'); process.exit(2); }
  const quota = volo.tot ? volo.tira / volo.tot : 0;
  di(quota >= 0.90, 'A il disco grande offre TIRA durante il volo del nostro cross',
    Math.round(quota * 100) + '% (' + volo.tira + '/' + volo.tot + '), soglia 90%'
    + ' + ' + volo.dopoIlCambio + ' fotogrammi dopo il cambio di lato, non contati');
  di(volo.ctrlAlDest >= 0 && volo.ctrlAlDest <= 30,
    'C il comando passa al destinatario entro mezzo secondo',
    volo.ctrlAlDest < 0 ? 'mai' : volo.ctrlAlDest + ' fotogrammi');
  di(volo.volee >= 1, 'D tenendo TIRA durante il volo esce una volee', 'volee ' + volo.volee);

  /* ---- B: l'inseguimento ---- */
  const dif = await pag.evaluate((seme) => {
    const t = window.__test;
    t.semina(seme);
    t.startMatch(1, 1, { size: 5 });
    for (let i = 0; i < 600 && G.scene !== 'play'; i++) t.simulate(1 / 60);
    if (G.scene !== 'play') return { errore: 'mai in play' };
    t.setTimeLeft(600);
    const pi = G.ctrl[0], p = G.players[pi];
    let k = -1, dm = 1e9;
    for (let i = 0; i < G.players.length; i++) {
      const q = G.players[i];
      if (q.team !== 1 || q.role === 'gk' || q.out > 0) continue;
      const d = Math.hypot(q.x - p.x, q.y - p.y);
      if (d < dm) { dm = d; k = i; }
    }
    if (k < 0) return { errore: 'nessun avversario' };
    const o = G.players[k];
    o.x = p.x + 84; o.y = p.y; o.vx = 0; o.vy = 0;
    const b = G.ball; b.owner = k; b.x = o.x + 8; b.y = o.y; b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0;
    segnaTocco(k);
    let cambi = 0, prec = null, morte = 0;
    for (let i = 0; i < 360; i++) {
      const bt = t.pulsanti(0);
      const grande = bt.reduce((a, z) => (z.r > a.r ? z : a), bt[0]);
      const faccia = grande.act + (grande.off ? '-off' : '');
      if (prec !== null && faccia !== prec) cambi++;
      prec = faccia;
      /* E: una cella ACCESA che rifiuta l'atto e' un verbo morto. Il
         criterio e' la guardia VERA di comandaPressa, che rifiuta anche
         sull'avversario a terra (o.out>0): senza quel pezzo il conteggio
         sotto-stima (rilievo della revisione, 2 settembre 2026). */
      const pressa = bt.find(z => z.act === 'press');
      if (pressa && !pressa.off) {
        const car = G.ball.owner >= 0 ? G.players[G.ball.owner] : null;
        if (!car || car.team === 0 || car.out > 0) morte++;
      }
      t.simulate(1 / 60);
    }
    return { cambi, morte, campioni: 360 };
  }, SEME_INSEGUE);
  if (dif.errore) { console.log('BANCO: ' + dif.errore); process.exit(2); }
  /* come per il volo: nessun campione non e' «zero cambi», e' «non ho
     misurato» — se no B passerebbe con un verde falso (rilievo della
     revisione) */
  if (!dif.campioni) { console.log('BANCO: l\'inseguimento non ha campionato un solo fotogramma'); process.exit(2); }
  di(dif.cambi === 0, 'B la faccia non cambia inseguendo un avversario (6 s)', dif.cambi + ' cambi');
  di(dif.morte === 0, 'E nessuna cella accesa rifiuta l\'atto', dif.morte + ' fotogrammi con PRESSA morto');

  /* ---- F: la rovesciata mantiene la precedenza ----
     NASCE DA UN RILIEVO DELLA REVISIONE (2 settembre 2026). Il compito 3
     aveva citato _q-l12 e _q-precedenza come prova che la rovesciata non
     era morta: nessuno dei due esercita quel codice — il primo e' il
     cancello del disco difensivo, il secondo SOSTITUISCE startCharge con
     un finto e non chiama mai la funzione vera. Due verdi che non
     provavano niente. Qui la proprieta' si misura davvero: si costruisce
     la scena della rovesciata (pallone che scende nella finestra, sotto
     la verticale, dentro l'area, uomo girato alla porta), si preme TIRA,
     e si guarda quale carica si e' aperta. */
  const rov = await pag.evaluate(() => {
    const t = window.__test;
    t.startMatch(1, 1, { size: 7 });
    for (let i = 0; i < 600 && G.scene !== 'play'; i++) t.simulate(1 / 60);
    if (G.scene !== 'play') return { errore: 'mai in play' };
    t.setTimeLeft(600);
    const pi = G.ctrl[0]; if (pi < 0) return { errore: 'nessun comandato' };
    const p = G.players[pi];
    /* dentro l'area avversaria, girato alla porta */
    p.x = FW - 100; p.y = FH / 2; p.vx = 0; p.vy = 0; p.fx = 1; p.fy = 0;
    p.charge = -1; p.chargeKind = null; p.chargeGo = null; p.rove = -1;
    /* LA SCENA SI COSTRUISCE ALL'INDIETRO DALLE FORMULE DEL GIOCO, non a
       occhio: la prima stesura metteva il pallone a sei unita' dall'uomo
       e il ramo in prova non si attivava nemmeno (serve una distanza
       oltre KICK_R*1,4), cosi' la prova era rossa anche sul codice
       giusto — cioe' non discriminava. Qui si sceglie il tempo di
       caduta tc, si ricava la quota dalla stessa formula di
       finestraRovesciata (z = ROVE_ZC + ((560*tc - vz)^2 - vz^2)/1120),
       e si mette il pallone LONTANO ma con la velocita' che lo fa
       atterrare addosso all'uomo. */
    const b = G.ball;
    const tc = 0.2, vz = -20;
    const dist = 60;                       // oltre KICK_R*1,4 = 36,4
    b.owner = -1; b.y = p.y; b.vy = 0;
    b.vz = vz;
    b.z = ROVE_ZC + (Math.pow(560 * tc - vz, 2) - vz * vz) / 1120;
    b.vx = dist / tc;                      // arriva su di lui in tc secondi
    b.x = p.x - dist;
    const aperta = finestraRovesciata(p);
    startCharge(0);
    const esito = { aperta, kind: p.chargeKind || null, rove: p.rove };
    /* si lascia la scena pulita per non sporcare il resto */
    p.charge = -1; p.chargeKind = null; p.chargeGo = null; p.rove = -1;
    return esito;
  });
  if (rov.errore) { console.log('BANCO: ' + rov.errore); process.exit(2); }
  if (!rov.aperta) { console.log('BANCO: la scena della rovesciata non si e\' montata (finestra chiusa)'); process.exit(2); }
  di(rov.kind === 'rovesciata' || rov.rove >= 0,
    'F la rovesciata mantiene la precedenza sul tiro',
    'carica aperta: ' + (rov.kind || 'nessuna') + ', rove ' + rov.rove);

  if (ecc.length) di(false, 'nessuna eccezione di pagina', ecc[0]);
  const rossi = esiti.filter(v => !v).length;
  console.log('\n' + (esiti.length - rossi) + ' prove su ' + esiti.length + ' — ' + (rossi ? 'CANCELLO ROSSO' : 'CANCELLO VERDE'));
  await ctx.close(); await browser.close(); srv.chiudi();
  process.exit(rossi ? 1 : 0);
})().catch(e => { console.error('FALLITO: ' + e.message); process.exit(2); });
