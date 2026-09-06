/* =====================================================================
   _q-volo.js — LA PULSANTIERA DICE LA VERITA'? (voce #88)
   Prove a passo 1/60, semi dichiarati, tutte sul comportamento:
     A  durante il volo di un NOSTRO cross il disco grande offre TIRA
        in almeno il 90% dei fotogrammi (misurato prima della cura: 9%)
     B  inseguendo un portatore avversario la faccia del disco grande
        NON cambia in 6 secondi (misurato prima: 6 cambi)
     C  entro 0,5 s dal calcio il comando e' del destinatario dichiarato
     D  tenendo TIRA durante il volo esce una volee' (G.stats.volee sale)
     E  nessuna cella ACCESA rifiuta l'atto (PRESSA offerto senza
        portatore avversario e' un verbo morto sotto il dito)
     F  la rovesciata mantiene la precedenza sul tiro
     G  nessuna cella SPENTA nasconde un atto possibile — la direzione
        OPPOSTA di E (rilievo 2 della revisione del compito 4, 2
        settembre 2026): grandeSpento usava puoContrastare, piu' severa
        dell'azione vera doSlide(t,'premi'), e durante l'anticipo di una
        scivolata trascinata il disco si spegneva su un contrasto in
        piedi ancora lecito.
     H  il rilascio a vuoto (compito 9, 2 settembre 2026): si preme TIRA
        una volta sola sul destinatario di un nostro cross quando il
        pallone e' ancora lontano (oltre la vecchia soglia
        P_SPEED*TIRO_PORTATA — la cura di questo compito e' l'unico modo
        in cui la carica si apre li'), e si rilascia due fotogrammi dopo,
        pallone ancora fuori portata: nessun tiro fantasma, nessun cambio
        di possesso, nessuna carica che resta appesa.
     I  il palo non lascia crossTo rancido (rilievo CRITICO della
        revisione del compito 9, 2 settembre 2026): dopo un cross deviato
        da un palo, il disco grande non deve offrire TIRA a un uomo
        lontano dal pallone rimbalzato — hitPosts deve azzerare
        b.crossTo come gia' azzera b.passTo.
     J  la fascia morta del volo, 26-29,9 unita' (rilievo ALTO della
        revisione del compito 9, 2 settembre 2026): un pallone che passa
        a fianco di un giocatore con la carica del tiro gia' armata, mai
        piu' vicino di KICK_R (26) ne' mai fuori da KICK_R*1,15 (29,9),
        non deve ne' contare un tiro ne' cambiare la velocita' del
        pallone — kickBall rifiuta il calcio in quella fascia, e il
        ramo TIRO AL VOLO di updateBall deve ascoltarlo.
     K  il raddoppio diventa una tenuta (compito 7, voce #88): prima
        della cura comandaPressa scriveva UNA volta sola p.raddoppio =
        RADDOPPIO_T (3 s) sul compagno chiamato, e il cronometro scadeva
        da solo dentro aiMove ANCHE col dito ancora giu' sul disco
        PRESSA — un ordine che doveva durare quanto il dito lo tiene ne
        durava invece tre secondi fissi. Si arma un atto 'press' vero
        (Touch5.start sul disco PRESSA: e' Touch5.passo che va misurato,
        non una scorciatoia sopra comandaPressa) e lo si TIENE 5 s col
        portatore avversario fermo in piedi: il massimo raddoppio fra i
        compagni non deve mai toccare zero. Poi il dito si alza
        (Touch5.end): il cronometro deve finire da se' entro RADDOPPIO_T
        piu' margine — nessun ordine immortale.
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
const SEME_VOLO = 88001, SEME_INSEGUE = 88002, SEME_TENUTA = 88003;

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
    /* SI CONTANO LE BUGIE, NON I CAMBI (correzione del 2 settembre 2026,
       dopo il compito 5). La prima stesura chiedeva ZERO cambi di faccia
       in sei secondi: ma se il possesso cambia DAVVERO — e in questa
       scena l'intelligenza lo fa quattro volte, agli stessi fotogrammi
       anche sul gioco intonso — allora la faccia DEVE cambiare, ed e' il
       comportamento giusto. Chiedere zero sarebbe chiedere al disco di
       mentire, cioe' l'opposto di questa voce. Il difetto vero e' il
       cambio di faccia che NON segue un cambio di possesso: quello e'
       la bugia, e di quelle se ne contavano tre su quattro. */
    let cambi = 0, bugie = 0, prec = null, precLato = null, morte = 0;
    for (let i = 0; i < 360; i++) {
      const lato = squadraDelPallone();
      const bt = t.pulsanti(0);
      const grande = bt.reduce((a, z) => (z.r > a.r ? z : a), bt[0]);
      const faccia = grande.act + (grande.off ? '-off' : '');
      if (prec !== null && faccia !== prec) {
        cambi++;
        if (lato === precLato) bugie++;   // faccia cambiata a possesso fermo
      }
      prec = faccia; precLato = lato;
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
    return { cambi, bugie, morte, campioni: 360 };
  }, SEME_INSEGUE);
  if (dif.errore) { console.log('BANCO: ' + dif.errore); process.exit(2); }
  /* come per il volo: nessun campione non e' «zero cambi», e' «non ho
     misurato» — se no B passerebbe con un verde falso (rilievo della
     revisione) */
  if (!dif.campioni) { console.log('BANCO: l\'inseguimento non ha campionato un solo fotogramma'); process.exit(2); }
  di(dif.bugie === 0, 'B la faccia non cambia SENZA che cambi il possesso (6 s)',
    dif.bugie + ' bugie su ' + dif.cambi + ' cambi totali (gli altri seguono un cambio di possesso vero)');
  di(dif.morte === 0, 'E nessuna cella accesa rifiuta l\'atto', dif.morte + ' fotogrammi con PRESSA morto');

  /* ---- G: nessuna cella SPENTA nasconde un atto possibile ----
     NASCE DAL RILIEVO 2 della revisione del compito 4 (2 settembre
     2026). E controlla una direzione sola — una cella ACCESA che
     rifiuta l'atto. Mancava la direzione opposta: una cella SPENTA che
     nasconde un atto che il gioco eseguirebbe comunque. Era proprio
     l'asimmetria che aveva lasciato passare il rilievo: grandeSpento
     usava puoContrastare(ctrlPlayer(t)), che chiude ANCHE su una carica
     aperta (p.charge>=0 && p.chargeGo), mentre l'azione vera premendo
     il disco grande — doSlide(t,'premi') — non guarda la carica affatto
     (e' dichiarato dal suo stesso commento: «le stesse condizioni che
     puoContrastare chiede alla scivolata, MENO LA CARICA»). Durante
     l'anticipo di una scivolata trascinata (startSlide -> anticipa,
     chargeGo=lanciaScivolata, 60-100 ms) il disco si spegneva su un
     contrasto in piedi ancora lecito.
     L'ORACOLO NON RICHIAMA LE FUNZIONI SOTTO ESAME (ne' puoContrastare
     ne' l'eventuale puoContrastoPremuto della cura): duplica sul
     GIOCATORE le condizioni vere e proprie dei due atti, le stesse che
     B ed E gia' duplicano per PRESSA. Se richiamasse la funzione che
     produce grandeSpento la prova sarebbe circolare — verde anche sul
     file rotto, perche' misurerebbe la bugia con lo stesso righello che
     l'ha scritta:
       grande: l'atto (un contrasto in piedi, doSlide(t,'premi')) e'
               impossibile SOLO SE p.out>0||p.slide>=0||p.recover>0||
               p.rove>=0 — le quattro condizioni vere, lette dal corpo;
       PRESSA: l'atto (il raddoppio) e' impossibile SOLO SE non esiste
               un portatore avversario in piedi (car&&car.team!==t&&
               car.out<=0) — la stessa guardia vera che B/E duplicano.
     DUE SCENE. La prima ARMA DI PROPOSITO la finestra che il rilievo 2
     ha misurato (startSlide con mirata=true, come farebbe un
     trascinamento sul disco), perche' l'inseguimento normale della
     scena B/E non apre mai una carica sul giocatore comandato e non
     la eserciterebbe. La seconda ripete l'inseguimento di B/E,
     fotogramma per fotogramma, per non dipendere da una sola scena
     costruita a mano. */
  const spec = await pag.evaluate((seme) => {
    const t = window.__test;
    t.semina(seme);
    t.startMatch(1, 1, { size: 7 });
    for (let i = 0; i < 600 && G.scene !== 'play'; i++) t.simulate(1 / 60);
    if (G.scene !== 'play') return { errore: 'mai in play' };
    t.setTimeLeft(600);
    const pi = G.ctrl[0]; if (pi < 0) return { errore: 'nessun comandato' };
    const p = G.players[pi];
    let bugieGrande = 0, bugiePressa = 0, campioni = 0;
    const primeBugie = [];
    const campiona = (dove) => {
      const bt = t.pulsanti(0);
      const grande = bt.reduce((a, z) => (z.r > a.r ? z : a), bt[0]);
      const pressa = bt.find(z => z.act === 'press');
      campioni++;
      if (grande.off) {
        const attoPossibile = !(p.out > 0 || p.slide >= 0 || p.recover > 0 || p.rove >= 0);
        if (attoPossibile) { bugieGrande++; if (primeBugie.length < 4) primeBugie.push(dove + ':grande'); }
      }
      if (pressa && pressa.off) {
        const car = G.ball.owner >= 0 ? G.players[G.ball.owner] : null;
        const attoPossibile = !!(car && car.team !== 0 && car.out <= 0);
        if (attoPossibile) { bugiePressa++; if (primeBugie.length < 4) primeBugie.push(dove + ':pressa'); }
      }
    };
    /* scena 1 — si arma di proposito la finestra del rilievo 2 */
    p.x = FW * 0.5; p.y = FH * 0.5; p.vx = 0; p.vy = 0;
    p.out = 0; p.slide = -1; p.recover = 0; p.rove = -1; p.charge = -1; p.chargeGo = null;
    G.ball.owner = -1; G.ball.x = 10; G.ball.y = 10; G.ball.vx = 0; G.ball.vy = 0; G.ball.vz = 0; G.ball.z = 0;
    startSlide(p, 1, 0, true);
    campiona('armata');
    p.charge = -1; p.chargeGo = null; p.slide = -1;      // si scarica, non serve oltre
    /* scena 2 — l'inseguimento vero, come B/E, un fotogramma alla volta */
    let k = -1, dm = 1e9;
    for (let i = 0; i < G.players.length; i++) {
      const q = G.players[i];
      if (q.team !== 1 || q.role === 'gk' || q.out > 0) continue;
      const d = Math.hypot(q.x - p.x, q.y - p.y);
      if (d < dm) { dm = d; k = i; }
    }
    if (k >= 0) {
      const o = G.players[k];
      o.x = p.x + 84; o.y = p.y; o.vx = 0; o.vy = 0;
      G.ball.owner = k; G.ball.x = o.x + 8; G.ball.y = o.y; G.ball.vx = 0; G.ball.vy = 0; G.ball.vz = 0; G.ball.z = 0;
      segnaTocco(k);
      for (let i = 0; i < 360; i++) { campiona('inseg' + i); t.simulate(1 / 60); }
    }
    return { bugieGrande, bugiePressa, campioni, primeBugie };
  }, SEME_INSEGUE + 1);
  if (spec.errore) { console.log('BANCO: ' + spec.errore); process.exit(2); }
  if (!spec.campioni) { console.log('BANCO: G non ha campionato un solo fotogramma'); process.exit(2); }
  di(spec.bugieGrande === 0 && spec.bugiePressa === 0,
    'G nessuna cella spenta nasconde un atto possibile',
    spec.bugieGrande + ' bugie sul grande, ' + spec.bugiePressa + ' su PRESSA, su ' + spec.campioni + ' fotogrammi'
    + (spec.primeBugie.length ? '  es. ' + spec.primeBugie.join(' · ') : ''));

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

  /* ---- H: il rilascio a vuoto non produce un tiro fantasma ----
     NASCE DAL COMPITO 9 (2 settembre 2026, voce #88): la cura allarga
     puoTirare — il destinatario dichiarato di un nostro cross puo' aprire
     la carica del tiro anche lontano dal pallone, cosa che fino a ieri
     era negata dalla sola soglia geometrica P_SPEED*TIRO_PORTATA
     (201,6). LA DOMANDA CHE LA CURA NON PUO' ARCHIVIARE CON UN
     RAGIONAMENTO: se il dito preme TIRA quando il pallone e' ancora a
     ~290 unita' e lo RILASCIA prima che arrivi, che cosa succede?
     Si preme UNA VOLTA SOLA (non si tiene, a differenza di D) nella
     stessa finestra misurata da fuori/_p-a10.js — dist ben sopra 201,6,
     cosi' la carica si apre SOLO grazie al ramo nuovo di puoTirare: su
     un puoTirare non curato la premessa (vuoto.aperta) sarebbe falsa e
     il banco uscirebbe con 2 ("non ho misurato"), non con un verde
     immeritato. Poi si rilascia due fotogrammi dopo, pallone ancora
     fuori portata, e si guarda se e' nato un tiro fantasma. */
  const vuoto = await pag.evaluate((seme) => {
    const t = window.__test;
    t.semina(seme);
    t.startMatch(1, 1, { size: 7 });
    for (let i = 0; i < 600 && G.scene !== 'play'; i++) t.simulate(1 / 60);
    if (G.scene !== 'play') return { errore: 'mai in play' };
    t.setTimeLeft(600);
    const pi = G.ctrl[0]; if (pi < 0) return { errore: 'nessun comandato' };
    const p = G.players[pi];
    p.x = FW * 0.72; p.y = FH * 0.16; p.vx = 0; p.vy = 0;
    const mate = G.players.find(q => q.team === 0 && q !== p && q.role !== 'gk');
    if (!mate) return { errore: 'nessun compagno' };
    mate.x = FW - 90; mate.y = FH / 2; mate.vx = 0; mate.vy = 0;
    const b = G.ball;
    b.owner = pi; b.x = p.x + 8; b.y = p.y; b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0;
    segnaTocco(pi);
    const mi = G.players.indexOf(mate);
    const dx = mate.x - p.x, dy = mate.y - p.y, l = Math.max(1, Math.hypot(dx, dy));
    doCross(p, dx / l, dy / l, [mate.x, mate.y], mi);
    if (G.ball.owner >= 0) return { errore: 'il cross non e\' partito' };
    for (let i = 0; i < 18; i++) t.simulate(1 / 60);   // stessa finestra di _p-a10.js
    const cp = ctrlPlayer(0);
    if (!cp || G.players.indexOf(cp) !== mi) return { errore: 'il comando non e\' del destinatario' };
    const distApertura = Math.hypot(G.ball.x - cp.x, G.ball.y - cp.y);
    if (distApertura <= P_SPEED * TIRO_PORTATA) return { errore: 'distanza troppo corta, la scena non discrimina' };
    startCharge(0);                          // UNA pressione, non tenuta
    const aperta = cp.charge >= 0 && cp.chargeKind === 'tiro';
    const prima = { vx: G.ball.vx, vy: G.ball.vy, owner: G.ball.owner,
      squadra: squadraDelPallone(), tiri0: (G.stats.tiri[0] | 0), volee0: (G.stats.volee[0] | 0),
      tiroT: G.ball.tiroT };
    /* dieci fotogrammi di tenuta (0,167 s), sopra TAP_T = 0,15: e' un
       rilascio TENUTO, non un tap — il percorso che il brief descrive
       ("preme... rilascia a meta'") e quello che fireShotMirato guarda
       con la sua guardia di distanza, non il tap corto di kickBall */
    for (let i = 0; i < 10; i++) t.simulate(1 / 60);
    const distRilascio = Math.hypot(G.ball.x - cp.x, G.ball.y - cp.y);
    releaseCharge(0);                        // ...e si solleva, palla ancora lontana
    const dopo = { vx: G.ball.vx, vy: G.ball.vy, owner: G.ball.owner,
      squadra: squadraDelPallone(), tiri0: (G.stats.tiri[0] | 0), volee0: (G.stats.volee[0] | 0),
      charge: cp.charge, chargeGo: cp.chargeGo, tiroT: G.ball.tiroT };
    return { distApertura, distRilascio, aperta, prima, dopo };
  }, SEME_VOLO);
  if (vuoto.errore) { console.log('BANCO: ' + vuoto.errore); process.exit(2); }
  if (!vuoto.aperta) { console.log('BANCO: la carica non si e\' aperta sul destinatario lontano (dist ' + Math.round(vuoto.distApertura) + ') — puoTirare non e\' curato, o la scena e\' cambiata'); process.exit(2); }
  const velocitaFerma = vuoto.prima.vx === vuoto.dopo.vx && vuoto.prima.vy === vuoto.dopo.vy;
  const possessoFermo = vuoto.prima.owner === vuoto.dopo.owner && vuoto.prima.squadra === vuoto.dopo.squadra;
  /* RILIEVO BASSO della revisione del compito 9 (2 settembre 2026):
     l'oracolo controllava solo G.stats.tiri[0]/volee[0], ma un b.tiroT
     scritto senza cambio di statistiche sarebbe sfuggito — e' esattamente
     la forma dei due tiri fantasma curati altrove in questa stessa
     correzione (il volo e fireShot potevano scrivere b.tiroT anche
     quando le statistiche restavano ferme). Adesso si guarda anche lui. */
  const nessunTiroFantasma = vuoto.prima.tiri0 === vuoto.dopo.tiri0 && vuoto.prima.volee0 === vuoto.dopo.volee0
    && vuoto.prima.tiroT === vuoto.dopo.tiroT;
  const caricaChiusa = vuoto.dopo.charge < 0 && !vuoto.dopo.chargeGo;
  di(velocitaFerma && possessoFermo && nessunTiroFantasma && caricaChiusa,
    'H il rilascio a vuoto non produce ne\' tiro fantasma ne\' cambio di possesso ne\' carica appesa',
    'apertura ' + Math.round(vuoto.distApertura) + 'u, rilascio ' + Math.round(vuoto.distRilascio) + 'u — '
    + 'velocita ferma:' + velocitaFerma + ' possesso fermo:' + possessoFermo
    + ' niente tiro:' + nessunTiroFantasma + ' carica chiusa:' + caricaChiusa);

  /* ---- I: il palo non lascia crossTo rancido ----
     RILIEVO CRITICO della revisione del compito 9 (2 settembre 2026,
     voce #88). hitPosts azzerava b.passTo al rimbalzo (riga ~18620) ma
     MAI b.crossTo: hitPosts non chiama segnaTocco ne' tocca b.owner,
     quindi dopo un cross deviato da un palo squadraDelPallone() restava
     la squadra che aveva crossato, e la preferenza di controllo in
     switchControlled continuava a comandare il destinatario dichiarato —
     lo stesso campo rancido che puoTirare consulta nel ramo "atteso". Il
     ramo si apriva SENZA guardare la distanza: TIRA restava acceso su un
     pallone rimbalzato altrove, verso un uomo che non lo aspettava piu'.
     LA SCENA (identica a fuori/_p-palo-crossto.js, la sonda che ha
     riprodotto il difetto a runtime prima della cura): un cross a 380 u/s
     (sopra 320, il ramo "PALO!" del rimbalzo pieno) dritto su un palo,
     col destinatario dichiarato parcheggiato lontano dalla porta — cosi'
     che DOPO il rimbalzo la sola via che potrebbe accendere TIRA sia
     l'"atteso" rancido, non la soglia geometrica (che a centinaia di
     unita' di distanza sarebbe comunque chiusa). */
  const palo = await pag.evaluate(() => {
    const t = window.__test;
    t.startMatch(1, 1, { size: 7 });
    for (let i = 0; i < 600 && G.scene !== 'play'; i++) t.simulate(1 / 60);
    if (G.scene !== 'play') return { errore: 'mai in play' };
    t.setTimeLeft(600);
    const pi = G.ctrl[0]; if (pi < 0) return { errore: 'nessun comandato' };
    const kicker = G.players[pi];
    const mate = G.players.find(q => q.team === 0 && q !== kicker && q.role !== 'gk');
    if (!mate) return { errore: 'nessun compagno' };
    const mi = G.players.indexOf(mate);
    /* il palo lontano della porta avversaria (team 0 attacca verso FW) */
    const post = POSTI.find(([gx, gy]) => gx === FW && gy === GY1) || POSTI[POSTI.length - 1];
    const [gx, gy] = post;
    /* parcheggia tutti gli altri lontano, per non interferire (raccolta,
       tentaPresa, testa) sulla scena sintetica */
    for (const q of G.players) { if (q === kicker || q === mate) continue; q.x = FW * 0.5; q.y = 20; q.vx = 0; q.vy = 0; }
    /* il destinatario dichiarato resta LONTANO dal palo: e' la misura del
       difetto — dopo il rimbalzo la palla puo' andare ovunque */
    mate.x = FW * 0.5; mate.y = FH * 0.85; mate.vx = 0; mate.vy = 0;
    kicker.x = gx - 120; kicker.y = gy - 60; kicker.vx = 0; kicker.vy = 0;
    const b = G.ball;
    const startX = gx - 55, startY = gy - 35;
    const ddx = gx - startX, ddy = gy - startY, ll = Math.max(1, Math.hypot(ddx, ddy));
    const V = 380;                        // sopra 320: il ramo "PALO!" pieno
    b.owner = -1; b.x = startX; b.y = startY;
    b.vx = ddx / ll * V; b.vy = ddy / ll * V; b.z = 25; b.vz = 10;
    b.crossTo = mi; b.passTo = -1; b.lastTouch = pi;
    let urtato = false, crossToRancido = 0, tiraSuLontano = 0, campioni = 0;
    for (let i = 0; i < 40 && b.owner < 0; i++) {
      const dot0 = b.vx * ddx + b.vy * ddy;
      t.simulate(1 / 60);
      const dot1 = b.vx * ddx + b.vy * ddy;
      if (!urtato && dot1 < 0 && dot0 >= 0) urtato = true;   // il rimbalzo: la palla torna indietro
      if (!urtato) continue;                                 // si conta solo DOPO l'urto
      campioni++;
      const cp = ctrlPlayer(0);
      if (!cp) continue;
      const dist = Math.hypot(b.x - cp.x, b.y - cp.y);
      const bt = t.pulsanti(0);
      const gr = bt.reduce((a, z) => (z.r > a.r ? z : a), bt[0]);
      const acceso = gr.act === 'shot' && !gr.off;
      if (b.crossTo >= 0) crossToRancido++;
      if (acceso && dist > P_SPEED * TIRO_PORTATA) tiraSuLontano++;
    }
    return { urtato, crossToRancido, tiraSuLontano, campioni };
  });
  if (palo.errore) { console.log('BANCO: ' + palo.errore); process.exit(2); }
  if (!palo.urtato) { console.log('BANCO: il cross non ha mai urtato il palo — la scena non si e\' montata'); process.exit(2); }
  if (!palo.campioni) { console.log('BANCO: I non ha campionato un solo fotogramma dopo l\'urto'); process.exit(2); }
  di(palo.crossToRancido === 0 && palo.tiraSuLontano === 0,
    'I dopo un palo il disco grande non offre TIRA a un uomo lontano',
    palo.crossToRancido + ' fotogrammi con crossTo rancido, ' + palo.tiraSuLontano
    + ' con TIRA offerto oltre la soglia, su ' + palo.campioni + ' dopo l\'urto');

  /* ---- J: la fascia morta del volo non conta un tiro fantasma ----
     RILIEVO ALTO della revisione del compito 9 (2 settembre 2026). Il
     ramo "TIRO AL VOLO" di updateBall ammette fino a KICK_R*1,15 (29,9)
     come guardia d'ingresso, ma kickBall rifiuta sopra KICK_R (26): nella
     fascia 26-29,9 il tabellino segnava un tiro che il pallone non aveva
     mai sentito. LA SCENA misura la fascia morta DIRETTAMENTE, senza
     affidarsi al caso: il comandato ha la carica del tiro gia' armata
     (chargeKind='tiro', charge oltre TAP_T) e sta fermo, e un pallone
     veloce (350 u/s, IN VOLO — b.z=24, sotto Z_SOPRA_TESTA cosi' non lo
     si gioca di testa, e senza attrito a terra che confonderebbe la
     misura di velocita') gli passa davanti a distanza minima 28 unita' —
     dentro la fascia morta (26 < 28 < 29,9) nel punto di massimo
     avvicinamento, mai piu' vicino. Se il tabellino sale o la velocita'
     del pallone cambia, e' il fantasma; se nessuno dei due si muove, il
     tentativo e' stato correttamente rifiutato. */
  const morto = await pag.evaluate((seme) => {
    const t = window.__test;
    t.semina(seme);
    t.startMatch(1, 1, { size: 7 });
    for (let i = 0; i < 600 && G.scene !== 'play'; i++) t.simulate(1 / 60);
    if (G.scene !== 'play') return { errore: 'mai in play' };
    t.setTimeLeft(600);
    /* IL SOGGETTO E' IL COMANDATO (G.ctrl[0]): senza input sullo stick
       resta dove lo si mette, come nelle prove A/D/H. */
    const pi = G.ctrl[0]; if (pi < 0) return { errore: 'nessun comandato' };
    const p = G.players[pi];
    p.x = FW * 0.5; p.y = FH * 0.5; p.vx = 0; p.vy = 0;
    p.out = 0; p.slide = -1; p.recover = 0; p.rove = -1; p.kickCd = 0;
    p.charge = TAP_T + 0.02; p.chargeKind = 'tiro'; p.chargeGo = null;
    /* parcheggia tutti gli altri lontano dal corridoio del pallone: senza
       questo un compagno o un avversario piazzato li' dal calcio d'inizio
       (non seminato prima d'ora: misurato un tiro VERO, non fantasma, su
       una corsa senza semina) puo' toccare la palla per un'altra via
       (raccolta, muro) e confondere la misura */
    for (const q of G.players) { if (q === p) continue; q.x = FW * 0.1; q.y = 20; q.vx = 0; q.vy = 0; }
    const OFFSET = 28;                     // dentro 26 (KICK_R) - 29,9 (KICK_R*1,15)
    const DX0 = 60, VX = 350;
    /* IL TRAGUARDO GEOMETRICO (dx=0, distanza minima 28) cade a
       DX0/VX = 0,171 s = fotogramma ~10,3: il primo tentativo usava 10
       fotogrammi in tutto e si fermava PRIMA di arrivarci (distanza
       minima misurata: 31, non 28) — non era l'IA a spostare il
       giocatore, era il campione troppo corto. z0=24 (sotto
       Z_SOPRA_TESTA=26, cosi' non si gioca di testa) tiene il pallone in
       aria abbastanza a lungo (atterra verso il fotogramma ~17,6) da
       attraversare tutta la fascia morta (fotogrammi ~8,5-12,1) prima di
       toccare terra. */
    const b = G.ball;
    b.owner = -1; b.lastTouch = -1;
    b.x = p.x - DX0; b.y = p.y - OFFSET; b.z = 24; b.vz = 0;
    b.vx = VX; b.vy = 0; b.crossTo = -1; b.passTo = -1;
    const tiriPrima = (G.stats.tiri[0] | 0), voleePrima = (G.stats.volee[0] | 0);
    const vxPrima = b.vx, vyPrima = b.vy;
    let distMin = 1e9, campioni = 0;
    for (let i = 0; i < 16; i++) {
      t.simulate(1 / 60);
      campioni++;
      const d = Math.hypot(b.x - p.x, b.y - p.y);
      if (d < distMin) distMin = d;
    }
    return { tiriPrima, voleePrima, vxPrima, vyPrima, distMin, campioni,
      tiriDopo: (G.stats.tiri[0] | 0), voleeDopo: (G.stats.volee[0] | 0),
      vxDopo: b.vx, vyDopo: b.vy };
  }, SEME_INSEGUE + 2);
  if (morto.errore) { console.log('BANCO: ' + morto.errore); process.exit(2); }
  /* la premessa: la scena deve davvero restare nella fascia morta (26 =
     KICK_R, 29,9 = KICK_R*1,15 — le stesse costanti del gioco, qui fuori
     dalla pagina e percio' scritte a mano: se il gioco le cambiasse, la
     costruzione della scena andrebbe rifatta) e MAI entrare nella vera
     portata di calcio, altrimenti la prova misurerebbe un altro caso e un
     verde non varrebbe niente (regola della casa: "non ho misurato" e'
     un'uscita, non un rosso ne' un verde) */
  if (!(morto.distMin > 26 && morto.distMin <= 29.9)) {
    console.log('BANCO: la scena non e\' rimasta nella fascia morta (distanza minima ' + morto.distMin.toFixed(1) + ')');
    process.exit(2);
  }
  const nessunTiroContato = morto.tiriPrima === morto.tiriDopo && morto.voleePrima === morto.voleeDopo;
  const velocitaInvariata = morto.vxPrima === morto.vxDopo && morto.vyPrima === morto.vyDopo;
  di(nessunTiroContato && velocitaInvariata,
    'J la fascia morta del volo (26-29,9) non conta un tiro fantasma',
    'distanza minima ' + morto.distMin.toFixed(1) + ' su ' + morto.campioni + ' fotogrammi — '
    + 'tiri ' + morto.tiriPrima + '->' + morto.tiriDopo + ', volee ' + morto.voleePrima + '->' + morto.voleeDopo
    + ', velocita (' + morto.vxPrima.toFixed(1) + ',' + morto.vyPrima.toFixed(1) + ')->('
    + morto.vxDopo.toFixed(1) + ',' + morto.vyDopo.toFixed(1) + ')');

  /* ---- K: il raddoppio diventa una tenuta (compito 7, voce #88) ----
     PRIMA DELLA CURA comandaPressa scriveva UNA volta sola p.raddoppio =
     RADDOPPIO_T (3 s) sul compagno chiamato, e il cronometro scendeva da
     solo dentro aiMove ANCHE col dito ancora giu' sul disco PRESSA: un
     ordine che doveva durare quanto il dito lo tiene, ne durava invece
     tre secondi fissi. LA CURA sta dentro Touch5.passo: finche' l'atto
     'press' e' vivo e la cella e' accesa, ogni 0,2 s (RINNOVO_PRESSA_T)
     si richiama comandaPressa, e il cronometro torna a scadere da capo.

     DUE LATI, UN SOLO VERDETTO. La scena arma un atto 'press' VERO
     (Touch5.start sul disco PRESSA — non una scorciatoia sopra
     comandaPressa: e' Touch5.passo, il ciclo degli atti, che va
     misurato) e lo TIENE per 5 s di simulazione: il massimo raddoppio
     fra i compagni non deve mai toccare zero. Poi il dito si alza
     (Touch5.end): il cronometro deve finire da se' entro RADDOPPIO_T
     piu' margine — nessun ordine immortale.

     IL POSSESSO AVVERSARIO E' TENUTO FERMO A OGNI SINGOLO FOTOGRAMMA, non
     solo all'apertura della scena come in B/E: senza questo l'AI del
     compagno chiamato correrebbe DAVVERO a pressare il portatore (e' il
     comportamento vero, letto sopra aiMove, riga 19731) e prima o poi lo
     raggiungerebbe, rubandogli il pallone — la cella si spegnerebbe a
     meta' tenuta e il rinnovo tacerebbe per progetto: corretto, ma
     misurerebbe la scena e non la cura. Si ripristinano owner e
     posizione del portatore (piu' kickCd/aiActT alti, la stessa tecnica
     di scenaDifesa in _q-l16.js, allungata a 5 s) e si parcheggiano
     TUTTI gli altri in un angolo, a ogni fotogramma: il campo del
     raddoppio non dipende dalla posizione di nessuno, solo dal
     possesso, quindi il parcheggio non tocca cio' che si misura. */
  const tenuta = await pag.evaluate((seme) => {
    const t = window.__test;
    t.semina(seme);
    t.startMatch(1, 1, { size: 7 });
    for (let i = 0; i < 600 && G.scene !== 'play'; i++) t.simulate(1 / 60);
    if (G.scene !== 'play') return { errore: 'mai in play' };
    t.setTimeLeft(600);
    const pi = G.ctrl[0]; if (pi < 0) return { errore: 'nessun comandato' };
    const p = G.players[pi];
    let oi = -1;
    for (let i = 0; i < G.players.length; i++) {
      const q = G.players[i];
      if (q.team === 0 || q.role === 'gk') continue;
      oi = i; break;
    }
    if (oi < 0) return { errore: 'nessun avversario di movimento' };
    const o = G.players[oi];
    const OX = FW * 0.5, OY = FH * 0.5;
    const b = G.ball;
    /* il fermo-scena: portatore, pallone e ogni altro giocatore tornano
       al loro posto PRIMA di ogni t.simulate */
    const fissa = () => {
      p.x = OX - 60; p.y = OY; p.vx = 0; p.vy = 0; p.fx = 1; p.fy = 0;
      o.x = OX; o.y = OY; o.vx = 0; o.vy = 0; o.out = 0;
      o.slide = -1; o.recover = 0; o.rove = -1; o.kickCd = 5; o.aiActT = 5;
      b.owner = oi; b.x = OX + 8; b.y = OY; b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0;
      for (let i = 0; i < G.players.length; i++) {
        const q = G.players[i];
        if (q === p || q === o) continue;
        q.x = 15 + (i % 5) * 10; q.y = 15 + Math.floor(i / 5) * 10; q.vx = 0; q.vy = 0;
      }
    };
    fissa();
    segnaTocco(oi);
    const bt0 = t.pulsanti(0);
    const pressa0 = bt0.find(z => z.act === 'press');
    if (!pressa0) return { errore: 'il disco PRESSA non e\' offerto' };
    if (pressa0.off) return { errore: 'PRESSA e\' spento: la scena non si e\' montata' };
    const massimoRaddoppio = () => {
      let m = 0;
      for (const q of G.players) { if (q.team === 0 && q !== p) m = Math.max(m, q.raddoppio || 0); }
      return m;
    };
    const ID = 9001;
    Touch5.start(ID, pressa0.x, pressa0.y);           // un atto vero, un dito vero
    /* LO STIMOLO SI VERIFICA PARTITO PRIMA DI MISURARNE L'EFFETTO (regola
       di casa): comandaPressa scatta gia' dentro Touch5.start, alla
       pressione — se qui non ha ordinato niente la scena non discrimina,
       e si esce con l'errore invece di un rosso per la ragione sbagliata */
    const primoMassimo = massimoRaddoppio();
    if (primoMassimo <= 0) return { errore: 'la prima pressione non ha ordinato il raddoppio a nessuno' };
    const TENUTA_FRAMES = 300;                        // 5 s tenuti
    let minDurante = Infinity, offDurante = 0;
    for (let i = 0; i < TENUTA_FRAMES; i++) {
      fissa();
      t.simulate(1 / 60);
      const btI = t.pulsanti(0);
      const pI = btI.find(z => z.act === 'press');
      if (!pI || pI.off) offDurante++;
      const m = massimoRaddoppio();
      if (m < minDurante) minDurante = m;
    }
    Touch5.end(ID);                                   // il dito si alza
    const RILASCIO_FRAMES = Math.ceil((RADDOPPIO_T + 0.3) * 60);
    let scesoAZero = massimoRaddoppio() <= 0, frameZero = scesoAZero ? 0 : -1;
    for (let i = 0; i < RILASCIO_FRAMES && !scesoAZero; i++) {
      fissa();
      t.simulate(1 / 60);
      if (massimoRaddoppio() <= 0) { scesoAZero = true; frameZero = i + 1; }
    }
    return { primoMassimo, minDurante, offDurante, campioniTenuta: TENUTA_FRAMES,
             scesoAZero, frameZero, rilascioFrames: RILASCIO_FRAMES, RADDOPPIO_T };
  }, SEME_TENUTA);
  if (tenuta.errore) { console.log('BANCO: ' + tenuta.errore); process.exit(2); }
  if (!tenuta.campioniTenuta) { console.log('BANCO: K non ha campionato un solo fotogramma'); process.exit(2); }
  /* PRESSA spento durante la tenuta e' la scena che scivola, non un
     verdetto: si esce con 2, come da regola di casa (rilievo del brief) */
  if (tenuta.offDurante > 0) {
    console.log('BANCO: PRESSA si e\' spento ' + tenuta.offDurante + ' volte durante la tenuta: la scena non ha retto il possesso avversario');
    process.exit(2);
  }
  di(tenuta.minDurante > 0 && tenuta.scesoAZero,
    'K il raddoppio tiene finche\' il dito preme PRESSA, e muore da solo al rilascio',
    'tenuta: minimo ' + tenuta.minDurante.toFixed(2) + 's su ' + tenuta.campioniTenuta + ' fotogrammi (RADDOPPIO_T=' + tenuta.RADDOPPIO_T + 's)'
    + '  ·  rilascio: ' + (tenuta.scesoAZero ? 'zero in ' + tenuta.frameZero + '/' + tenuta.rilascioFrames + ' fotogrammi' : 'MAI sceso a zero entro ' + tenuta.rilascioFrames + ' fotogrammi'));

  if (ecc.length) di(false, 'nessuna eccezione di pagina', ecc[0]);
  const rossi = esiti.filter(v => !v).length;
  console.log('\n' + (esiti.length - rossi) + ' prove su ' + esiti.length + ' — ' + (rossi ? 'CANCELLO ROSSO' : 'CANCELLO VERDE'));
  await ctx.close(); await browser.close(); srv.chiudi();
  process.exit(rossi ? 1 : 0);
})().catch(e => { console.error('FALLITO: ' + e.message); process.exit(2); });
