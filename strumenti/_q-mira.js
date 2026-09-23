/* =====================================================================
   _q-mira.js — LA MIRA GUIDATA A DUE PESI DICE LA VERITA'? (voce #113,
   compito 1). Calco di _q-volo.js (che gia' guida un passaggio/cross
   UMANO e misuro' switchControlled all'origine — questo file riusa il
   suo stesso telaio per iniettare l'input) e di _q-battute.js (server
   locale, seme fisso, flag --gioco/--taglia/--seme, di()).

   TRE PROVE (nomi vincolanti del piano):
     SCOPE — con un input umano simulato (kicker + un compagno smarcato,
        stessa geometria di _q-volo prova A/C: FW*0,72/FH*0,16 e
        FW-90/FH/2), col peso 'essenziale' un CROSS/pallone alto fa
        ancora saltare il controllo al destinatario, mentre un
        PASSAGGIO CORTO no; col peso 'pieno' entrambi saltano. Il
        CROSS si simula chiamando doCross(p,...,dest) direttamente —
        "il cross parte dal motore, come lo farebbe il dito" (la stessa
        tecnica di _q-volo). Non esiste un equivalente pubblico di
        doCross con un dest esplicito per il passaggio corto: si
        simula quindi con le STESSE DUE RIGHE che eseguiPassUmano
        esegue davvero dopo un kickBall riuscito (kickBall(...) poi
        b.passTo=mi) — non un canale nuovo, la stessa euristica del
        motore, con il destinatario dichiarato a mano invece che scelto
        da scegliSmarcato (che sceglierebbe comunque mate, l'unico
        compagno smarcato in una scena dove tutti gli altri sono
        parcheggiati lontano — dichiararlo a mano rende la prova
        indipendente dal punteggio di smarcato() se mai cambiasse).
     PIENO-IDENTICO — le stesse due scene, col peso 'pieno' esplicito,
        rigiocate su fuori/base113.html (il gioco pre-cantiere, dove il
        campo G.miraGuidata non esiste: la chiave extra negli opts vi
        passa inosservata) e sul gioco curato: la traccia campo per
        campo (controllo, pallone, TUTTI i ventidue giocatori) deve
        combaciare al valore esatto, non solo al giudizio finale. Se
        combacia, MOTORE_V non si incrementa (il ramo 'pieno' e'
        carattere per carattere quello di prima); se anche un solo
        numero differisce, si dichiara — MOTORE_V andrebbe incrementato.
     CPU-CIECA — non e' misurata QUI: la guardia `if(G.ctrl[t]<0)
        continue' in cima a switchControlled esclude per costruzione le
        squadre CPU dal ramo nuovo (t umano, G.ctrl[t]>=0), quindi la
        prova che conta e' `_c3-sorteggi.js --a fuori/base113.html --b
        CALCETTO-il-gioco.html`, un cancello a parte (vedi il verbale
        di consegna del compito 1 per i numeri).

   IL COMPITO 2 (la UI) aggiunge due prove, entrambe sul gioco CURATO
   (--gioco, di default CALCETTO-il-gioco.html) -- non serve una seconda
   pagina base per queste due, basta ripuntare --gioco su una copia
   pre-compito-2 (vedi sotto):
     MIRA-UI-STILE — la riga IMPOSTAZIONI a due bottoni (#miraRow, classe
        .mira) deve RENDERE, non solo esistere nel DOM: misura
        getComputedStyle contro il riferimento .diff (stesso pannello),
        MAI lo stato logico da solo -- e' la lezione del #112 (compito 2,
        correzione revisione): un bottone copiato senza i selettori CSS
        condivisi rende col default del browser e lo stato scelto e'
        invisibile a chi lo guarda, anche se SAVE.miraGuidata e' corretto.
     MIRA-ARIA — aria-pressed del bottone attivo vale "true", degli altri
        "false", sincronizzato DOPO il click; in coda, il click SCRIVE e
        PERSISTE SAVE.miraGuidata (t.save live + localStorage via
        t.saveKey, esattamente come persistSave lo scrive davvero).
   ENTRAMBE nascono ROSSE sul gioco pre-compito-2 (526c989, prima di
   questo compito): `node strumenti/_q-mira.js --gioco fuori/base113b.html`
   (con `fuori/base113b.html` = `git show 526c989:CALCETTO-il-gioco.html`)
   -- #miraRow non esiste ancora, querySelector torna null, guasto
   leggibile invece di un'eccezione cieca sul .click() di null.

   NASCE ROSSA SU fuori/base113.html: la' G.miraGuidata non esiste, il
   salto e' sempre pieno per costruzione — chiedere 'essenziale' non ha
   alcun effetto, quindi PASSAGGIO-ESSENZIALE (che pretende "nessun
   salto") viene meno ed SCOPE e' rosso. E' un rosso leggibile: dice
   esattamente cosa manca, non "qualcosa non va".

   IL COMPITO 3 (giocabilita', batteria, verbale) NON aggiunge prove
   qui: la misura di giocabilita' che chiude il cantiere e' la STESSA
   prova SCOPE qui sopra, letta come misura invece che come cancello --
   "quante volte il controllo salta" e' esattamente saltoA(trace,mi) per
   ciascuna combinazione peso/modo, gia' stampata nel dettaglio OK/NO
   (fotogramma 13 per pieno/cross e pieno/passaggio ed essenziale/cross,
   fotogramma 32 -- fuori soglia -- per essenziale/passaggio). Questo
   file entra da qui in `strumenti/tutti.js` (conta:true). Le altre due
   verifiche del compito 3 (SFIDA-DETERMINISTICA: una sfida forzata a
   'pieno' ignora il SAVE.miraGuidata locale; _c3-sorteggi pieno-contro-
   pieno 0/60 in entrambi gli ordini di setCpuVsCpu, col seguito #124
   sull'ordine sbagliato del tool) restano FUORI da questo file, sullo
   stesso principio di CPU-CIECA qui sopra -- sono cancelli a parte, coi
   numeri nel verbale di MANUALE.md (voce #113).

   IL SEME: 113001, dichiarato, fisso di default (flag --seme). LA
   TAGLIA: 5, fissa (flag --taglia) — le due scene non dipendono dalla
   taglia, ma un numero solo rende ogni corsa confrontabile con l'altra.

   ZERO dado() NUOVO in questo file: le scene si costruiscono scrivendo
   direttamente lo stato di palla/giocatori e chiamando kickBall/doCross/
   segnaTocco, le stesse funzioni che il motore chiama a ogni gesto vero
   — lo stesso principio dichiarato in testa a _q-battute.js.

   uso:  node strumenti/_q-mira.js
         node strumenti/_q-mira.js --gioco fuori/mira-guidata.html
         node strumenti/_q-mira.js --base fuori/base113.html --seme 123
   esce 0 se tutte le prove sono verdi, 1 se almeno una e' rossa,
   2 se il banco stesso e' esploso (pagina, hook mancante, eccezione).
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

const SEME_CANTIERE = 113001;
const TAGLIA_BANCO = +arg('taglia', 5);
const SEME = +arg('seme', SEME_CANTIERE);
const GIOCO_CURATO = arg('gioco', 'CALCETTO-il-gioco.html');
const GIOCO_BASE = arg('base', 'fuori/base113.html');
const FRAMES_TRACCIA = 60;     // 1 s dopo il calcio, campionata a ogni fotogramma

function servi(gioco) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (/CALCETTO-il-gioco\.html$/i.test(f)) f = gioco;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

const esiti = [];
const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '\n         ' + det : '')); };

/* =====================================================================
   LA SCENA, INIETTATA UNA VOLTA SOLA NELLA PAGINA (window.SCENA_MIRA),
   sullo stesso motivo di _q-battute.js: vive lato browser perche' legge
   G/segnaTocco/doCross/kickBall per riferimento bare, e va DEFINITA
   dentro la pagina, non nel processo Node.

   GEOMETRIA: kicker a FW*0,72/FH*0,16, unico compagno smarcato a
   FW-90/FH/2 — le stesse due posizioni di _q-volo.js prova A/C, che
   gia' misuro' switchControlled all'origine (~300 unita' di distanza).
   Tutti gli altri ventuno vengono parcheggiati in un angolo UNA VOLTA
   SOLA prima del calcio (non a ogni fotogramma: dopo il calcio restano
   liberi di muoversi con l'IA — e' proprio quel moto, identico sui due
   file a parita' di seme, che PIENO-IDENTICO misura).

   `peso' passa in startMatch({miraGuidata:peso}): su fuori/base113.html
   (dove il campo non esiste) la chiave extra e' silenziosamente
   ignorata da JavaScript, e il comportamento resta quello di sempre —
   e' esattamente questo che rende SCOPE rossa la' e PIENO-IDENTICO
   confrontabile (stessa chiamata, stesso seme, due file). */
function INIETTA_SCENA() {
  window.SCENA_MIRA = function (peso, modo, framesTraccia) {
    const t = window.__test;
    t.startMatch(1, 1, { size: 5, miraGuidata: peso });
    let g = 0;
    for (; g < 600 && G.scene !== 'play'; g++) t.simulate(1 / 60);
    if (G.scene !== 'play') return { errore: 'mai in play' };
    t.setTimeLeft(600);
    const pi = G.ctrl[0]; if (pi < 0) return { errore: 'nessun comandato' };
    const p = G.players[pi];
    p.x = FW * 0.72; p.y = FH * 0.16; p.vx = 0; p.vy = 0;
    const mate = G.players.find(q => q.team === 0 && q !== p && q.role !== 'gk');
    if (!mate) return { errore: 'nessun compagno' };
    mate.x = FW - 90; mate.y = FH / 2; mate.vx = 0; mate.vy = 0;
    const mi = G.players.indexOf(mate);
    /* si parcheggiano tutti gli altri lontano dal corridoio del passaggio
       (raccolta/muro non devono interferire), UNA VOLTA SOLA: dopo il
       calcio restano liberi -- il loro moto e' quello che PIENO-IDENTICO
       confronta fra i due file */
    for (let i = 0; i < G.players.length; i++) {
      const q = G.players[i];
      if (q === p || q === mate) continue;
      q.x = 20 + (i % 4) * 12; q.y = 20 + Math.floor(i / 4) * 12; q.vx = 0; q.vy = 0;
    }
    const b = G.ball;
    b.owner = pi; b.x = p.x + 8; b.y = p.y; b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0;
    b.passTo = -1; b.crossTo = -1;
    segnaTocco(pi, true);   // pallone posato ai piedi: e' un piede
    const dx = mate.x - p.x, dy = mate.y - p.y, l = Math.max(1, Math.hypot(dx, dy));
    if (modo === 'cross') {
      /* il cross parte dal motore, come lo farebbe il dito (la stessa
         tecnica di _q-volo.js, che misuro' switchControlled all'origine) */
      doCross(p, dx / l, dy / l, [mate.x, mate.y], mi);
      if (G.ball.owner >= 0) return { errore: 'il cross non e\' partito' };
    } else {
      /* IL PASSAGGIO CORTO: le stesse due righe che eseguiPassUmano esegue
         davvero dopo un kickBall riuscito -- non un canale nuovo, la
         stessa euristica del motore, col destinatario dichiarato a mano
         invece che scelto da scegliSmarcato (che in questa scena
         sceglierebbe comunque mate, l'unico compagno non parcheggiato). */
      const speed = Math.max(320, Math.min(520, 300 + l * 0.9));
      if (!kickBall(p, dx / l, dy / l, speed, 0)) return { errore: 'il passaggio non e\' partito' };
      G.ball.passTo = mi;
      if (G.ball.owner >= 0) return { errore: 'il passaggio non ha lasciato i piedi' };
    }
    const trace = [];
    for (let i = 0; i < framesTraccia; i++) {
      trace.push([ G.ctrl[0], G.ball.owner, G.ball.x, G.ball.y, G.ball.z, G.ball.vx, G.ball.vy,
                   G.ball.crossTo, G.ball.passTo,
                   ...G.players.map(q => [q.x, q.y, q.vx, q.vy]).flat() ]);
      t.simulate(1 / 60);
    }
    return { pi, mi, trace };
  };
}

/* la posizione, nella traccia, di G.ctrl[0]: indice 0 (vedi sopra) */
const CTRL0 = 0;
/* il primo fotogramma in cui il controllo e' passato a mi, o -1 */
function saltoA(trace, mi) {
  for (let i = 0; i < trace.length; i++) if (trace[i][CTRL0] === mi) return i;
  return -1;
}

(async () => {
  console.log('\n=== LA MIRA GUIDATA A DUE PESI DICE LA VERITA? ===  ' + GIOCO_CURATO + '  vs base ' + GIOCO_BASE);

  /* una pagina sola, RISERVATA per file: la si ricarica fra una misura e
     l'altra chiamando startMatch di nuovo dentro SCENA_MIRA (stesso
     pattern di _q-volo.js, che rigioca piu' scene sulla stessa pagina) */
  async function apriPagina(gioco) {
    const srv = await servi(path.resolve(RADICE, gioco));
    const browser = await chromium.launch();
    const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
    const pag = await ctx.newPage();
    const ecc = []; pag.on('pageerror', e => ecc.push(e.message));
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
    await pag.evaluate(INIETTA_SCENA);
    return { srv, browser, ctx, pag, ecc, chiudi: async () => { await ctx.close(); await browser.close(); srv.chiudi(); } };
  }

  const misura = (pag, seme, peso, modo) =>
    pag.evaluate(({ seme, peso, modo, n }) => {
      window.__test.semina(seme);
      return SCENA_MIRA(peso, modo, n);
    }, { seme, peso, modo, n: FRAMES_TRACCIA });

  let rossoBanco = false;
  const curato = await apriPagina(GIOCO_CURATO);
  const base = await apriPagina(GIOCO_BASE);

  try {
    /* ===================================================================
       PROVA SCOPE — sul gioco CURATO: 'essenziale' distingue cross da
       passaggio corto, 'pieno' non li distingue (entrambi saltano). */
    const combo = {};
    for (const peso of ['pieno', 'essenziale']) {
      for (const modo of ['cross', 'pass']) {
        const r = await misura(curato.pag, SEME, peso, modo);
        if (r.errore) { rossoBanco = true; di(false, 'SCOPE — BANCO: scena ' + peso + '/' + modo + ' non costruita', r.errore); continue; }
        combo[peso + '/' + modo] = { salto: saltoA(r.trace, r.mi), mi: r.mi };
      }
    }
    if (!rossoBanco) {
      /* SOGLIA, MISURATA (seme 113001, taglia 5, le due posizioni sopra):
         il salto per destinatario dichiarato passa da uno swTimer fisso
         di isteresi (0,2s = 12 fotogrammi in switchControlled), quindi
         scatta sempre al fotogramma 13 — MISURATO: cross 13 (essenziale
         e pieno, identico: il ramo non guarda il peso per un cross), e
         pieno/passaggio 13 (l'override vale anche li'). SENZA il
         destinatario dichiarato (essenziale/passaggio) il controllo passa
         al compagno solo quando diventa DAVVERO il piu' vicino al
         pallone: MISURATO al fotogramma 32, piu' del doppio — la stessa
         differenza (13 contro 32) che rende la soglia di 20 fotogrammi
         (0,33s) un discriminante largo, non un pelo. */
      const PRESTO = 20;
      const essCross = combo['essenziale/cross'], essPass = combo['essenziale/pass'];
      const pienoCross = combo['pieno/cross'], pienoPass = combo['pieno/pass'];
      const okEssCross = essCross.salto >= 0 && essCross.salto <= PRESTO;
      const okEssPass = essPass.salto < 0 || essPass.salto > PRESTO;
      const okPienoCross = pienoCross.salto >= 0 && pienoCross.salto <= PRESTO;
      const okPienoPass = pienoPass.salto >= 0 && pienoPass.salto <= PRESTO;
      const ok = okEssCross && okEssPass && okPienoCross && okPienoPass;
      di(ok, 'SCOPE — essenziale distingue cross/passaggio, pieno no (soglia ' + PRESTO + ' fotogrammi)',
        'essenziale: cross salta a ' + essCross.salto + ' (atteso 0..' + PRESTO + '), passaggio salta a ' + essPass.salto + ' (atteso mai o oltre ' + PRESTO + ')   ·   ' +
        'pieno: cross salta a ' + pienoCross.salto + ', passaggio salta a ' + pienoPass.salto + ' (attesi entrambi 0..' + PRESTO + ')');
    }

    /* ===================================================================
       PROVA SCOPE-BASE113 — la stessa misura, sul gioco PRE-CANTIERE: la
       chiave miraGuidata non esiste la', il salto e' sempre pieno per
       costruzione. Deve uscire ROSSA (nasce cosi', per costruzione): se
       uscisse verde, questo banco non condannerebbe niente e SCOPE sopra
       non avrebbe dimostrato nulla. */
    {
      const rC = await misura(base.pag, SEME, 'essenziale', 'cross');
      const rP = await misura(base.pag, SEME, 'essenziale', 'pass');
      if (rC.errore || rP.errore) {
        di(false, 'SCOPE-BASE113 — BANCO: scena non costruita', (rC.errore || '') + ' ' + (rP.errore || ''));
      } else {
        const saltoCross = saltoA(rC.trace, rC.mi);
        const saltoPass = saltoA(rP.trace, rP.mi);
        const PRESTO = 20;
        /* attesa (quella che il gioco curato soddisfa): passaggio NON salta
           presto. Sul pre-cantiere ci si aspetta che questo VENGA MENO --
           il rosso e' il prodotto della prova, non un incidente. */
        const soddisfattaComeSeCurato = saltoCross >= 0 && saltoCross <= PRESTO && (saltoPass < 0 || saltoPass > PRESTO);
        di(!soddisfattaComeSeCurato, 'SCOPE-BASE113 — nasce rossa: su base113 \'essenziale\' non esiste, il passaggio salta comunque presto',
          'cross salta a ' + saltoCross + ', passaggio salta a ' + saltoPass + ' (sul pre-cantiere ci si aspetta che salti presto anche lui: nessuno scope da restringere)');
      }
    }

    /* ===================================================================
       PROVA PIENO-IDENTICO — col peso 'pieno' esplicito, le stesse due
       scene su base113 e sul curato devono combaciare CAMPO PER CAMPO,
       fotogramma per fotogramma: non solo il giudizio finale, il numero
       esatto. Se combaciano, il ramo 'pieno' e' provato carattere per
       carattere quello di prima: MOTORE_V non si incrementa.

       -------------------------------------------------------------------
       RETTIFICA A EDIZIONI (23 settembre 2026, voce #143, compito 4).
       -------------------------------------------------------------------
       «Bit per bit» era la domanda giusta finche' i due file dichiaravano
       LO STESSO MOTORE, ed e' esattamente quel che la riga qui sopra dice
       («MOTORE_V non si incrementa»). Il #143 ha riscritto in casa tutte
       le trascendenti della simulazione, e MOTORE_V e' salito a 3 con la
       sua misura accanto (sei nastri su sei rigiocati diversi,
       `strumenti/_t-143-motorev.js`). Da quel momento chiedere l'identita'
       col file base113 — che dichiara MOTORE_V 2 — e' chiedere una cosa
       impossibile: sarebbe un rosso che non si puo' curare, cioe' rumore,
       e il rumore fa ignorare i rossi veri.

       MISURATO su questo stesso banco prima di cambiare una riga: la
       traccia diverge al PRIMO fotogramma, e diverge di
       332.39272401893953 contro 332.3927240189397 — cinque per dieci alla
       meno sedici in relativo, cioe' DUE ULP. Gli indici (chi mira chi)
       sono gli stessi, tutti gli altri campi sono identici. Non e' una
       decisione cambiata: e' l'ultimo bit.

       Percio' la prova cambia FORMA e non severita':
         · stesso MOTORE_V nei due file -> si pretende l'identita' esatta,
           come prima, parola per parola;
         · MOTORE_V diverso -> l'identita' non si puo' pretendere e si
           dichiara. Restano due cose che il cantiere NON aveva il permesso
           di cambiare, e che continuano a essere cancelli: gli INDICI
           (il ramo 'pieno' sceglie gli stessi bersagli) e la DISTANZA
           RELATIVA dei numeri, che deve stare sotto 1e-9.

       PERCHE' 1e-9, e non una soglia scelta perche' passa: un ulp vale
       circa 1e-16 in relativo, e un cambio di DECISIONE della mira
       sposterebbe una coordinata di almeno un centesimo di unita' su
       trecento, cioe' 3e-5. Il tetto sta in mezzo con sette ordini di
       grandezza di margine sotto e quattro sopra, e lo scarto misurato si
       stampa sempre: se un giorno salisse, si vedrebbe crescere prima di
       sfondare. */
    {
      const mvDi = rel => {
        try {
          const m = fs.readFileSync(path.resolve(RADICE, rel), 'utf8').match(/const MOTORE_V = (\d+);/);
          return m ? parseInt(m[1], 10) : null;
        } catch (e) { return null; }
      };
      const mvA = mvDi(GIOCO_BASE), mvB = mvDi(GIOCO_CURATO);
      const stessoMotore = mvA !== null && mvA === mvB;
      const TETTO_REL = 1e-9;

      let tutteUguali = true, primaDiff = null, peggioRel = 0, dovePeggio = null;
      for (const modo of ['cross', 'pass']) {
        const rA = await misura(base.pag, SEME, 'pieno', modo);
        const rB = await misura(curato.pag, SEME, 'pieno', modo);
        if (rA.errore || rB.errore) { tutteUguali = false; primaDiff = modo + ': BANCO — ' + (rA.errore || rB.errore); break; }
        if (rA.mi !== rB.mi || rA.pi !== rB.pi) { tutteUguali = false; primaDiff = modo + ': indici diversi (pi ' + rA.pi + '/' + rB.pi + ', mi ' + rA.mi + '/' + rB.mi + ')'; break; }
        /* lo scarto relativo piu' grande su tutti i campi di tutti i
           fotogrammi: si misura SEMPRE, anche quando l'identita' basta,
           perche' un numero che cresce si vede prima di sfondare */
        for (let f = 0; f < Math.min(rA.trace.length, rB.trace.length); f++) {
          const a = rA.trace[f], b = rB.trace[f];
          if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
            peggioRel = Infinity; dovePeggio = modo + ' fotogramma ' + f + ': tracce di forma diversa'; break;
          }
          for (let i = 0; i < a.length; i++) {
            if (typeof a[i] !== 'number' || typeof b[i] !== 'number') {
              if (a[i] !== b[i]) { peggioRel = Infinity; dovePeggio = modo + ' fotogramma ' + f + ' campo ' + i; }
              continue;
            }
            const d = Math.abs(a[i] - b[i]);
            if (!d) continue;
            const rel = d / Math.max(1, Math.abs(a[i]));
            if (rel > peggioRel) { peggioRel = rel; dovePeggio = modo + ' fotogramma ' + f + ' campo ' + i + ': ' + a[i] + ' contro ' + b[i]; }
          }
        }
        if (JSON.stringify(rA.trace) !== JSON.stringify(rB.trace) && !primaDiff) {
          let f = 0; while (f < rA.trace.length && JSON.stringify(rA.trace[f]) === JSON.stringify(rB.trace[f])) f++;
          primaDiff = modo + ': la traccia diverge al fotogramma ' + f;
          tutteUguali = false;
        }
      }
      const scarto = peggioRel === 0 ? '0 (identiche)' : peggioRel.toExponential(1) + ' in relativo';
      const mv = 'MOTORE_V ' + mvA + ' contro ' + mvB;
      /* L'ORDINE CONTA, E NON E' UN DETTAGLIO. Prima si chiede l'IDENTITA',
         come sempre: se c'e', il cancello e' quello di prima e la
         rettifica non toglie niente a nessuno. Solo quando l'identita'
         e' gia' rotta si guarda se un cambio di MOTORE_V DICHIARATO la
         spiega. Il contrario — guardare prima il numero di versione e
         allentare — avrebbe abbassato la presa anche sui casi in cui
         l'identita' regge ancora (base113 dichiara MOTORE_V 1, il gioco
         di `main` ne dichiara 2, e le tracce erano identiche lo stesso:
         quel verde e' una misura, e non si butta). */
      if (tutteUguali) {
        di(true, 'PIENO-IDENTICO — peso \'pieno\': base113 e curato combaciano fotogramma per fotogramma (cross e passaggio)',
           'entrambe le scene, ' + FRAMES_TRACCIA + ' fotogrammi ciascuna, 0 differenze (' + mv + ')');
      } else if (!stessoMotore && primaDiff && primaDiff.indexOf('indici diversi') < 0 &&
                 primaDiff.indexOf('BANCO') < 0 && peggioRel <= TETTO_REL) {
        di(true, 'PIENO-VICINO — ' + mv + ': l\'identita\' e\' superata da un cambio di motore DICHIARATO, i bersagli no',
           primaDiff + '. Scarto peggiore ' + scarto + ', tetto ' + TETTO_REL.toExponential(0) +
           (dovePeggio ? ' (' + dovePeggio + ')' : '') + '. Indici uguali, decisioni uguali.');
      } else {
        di(false, 'PIENO-IDENTICO — peso \'pieno\': base113 e curato combaciano fotogramma per fotogramma (cross e passaggio)',
           primaDiff + '  (scarto peggiore ' + scarto + (dovePeggio ? ', ' + dovePeggio : '') + '; ' + mv + ')' +
           (stessoMotore ? '  -- MOTORE_V andrebbe incrementato, decisione da prendere'
                         : '  -- il cambio di motore non basta a spiegarlo: guardare gli indici e lo scarto'));
      }
    }

    /* ===================================================================
       PROVA MIRA-UI-STILE (voce #113, compito 2) — la riga IMPOSTAZIONI
       a due bottoni per SAVE.miraGuidata deve RENDERE, non solo esistere
       nel DOM: la lezione del #112 (compito 2, correzione revisione) e'
       che un bottone copiato senza i selettori CSS condivisi rende col
       default del browser e lo stato scelto e' invisibile. Si misura
       SOLO getComputedStyle, MAI lo stato logico (classList/SAVE) da
       solo -- e' proprio la misura che quel buco avrebbe fatto passare.
       Il riferimento e' .diff:not(.sel) (la riga "Difficolta' predefinita
       CPU", stesso pannello IMPOSTAZIONI, mai toccata da questo compito):
       se .mira eredita davvero il selettore condiviso, background-color,
       border-top-color e font-family devono combaciare. Poi .mira contro
       .mira.sel: almeno uno fra sfondo e bordo deve differire, altrimenti
       lo stato scelto sarebbe invisibile. Nasce ROSSA sul gioco
       pre-compito-2 (526c989: `node strumenti/_q-mira.js --gioco
       fuori/base113b.html`) -- #miraRow non esiste ancora, querySelector
       torna null, guasto leggibile invece di un'eccezione cieca. */
    {
      const r = await curato.pag.evaluate(() => {
        document.getElementById('gearBtn').click();
        document.getElementById('btnImpost').click();
        const rif = document.querySelector('.diff:not(.sel)');
        const mira = document.querySelector('.mira:not(.sel)');
        const miraSel = document.querySelector('.mira.sel');
        const leggi = el => {
          if (!el) return null;
          const c = getComputedStyle(el);
          return { backgroundColor: c.backgroundColor, borderTopColor: c.borderTopColor, fontFamily: c.fontFamily };
        };
        return {
          rif: leggi(rif), mira: leggi(mira), miraSel: leggi(miraSel),
          rifTrovato: !!rif, miraTrovato: !!mira, miraSelTrovato: !!miraSel,
        };
      });
      const guasti = [];
      if (!r.rifTrovato) guasti.push('bottone .diff:not(.sel) di riferimento non trovato');
      if (!r.miraTrovato) guasti.push('bottone .mira non selezionato non trovato (#miraRow assente?)');
      if (!r.miraSelTrovato) guasti.push('bottone .mira.sel non trovato (#miraRow assente?)');
      if (r.rifTrovato && r.miraTrovato) {
        if (r.rif.backgroundColor !== r.mira.backgroundColor)
          guasti.push('.mira background-color=' + r.mira.backgroundColor + ' diverso da .diff=' + r.rif.backgroundColor);
        if (r.rif.borderTopColor !== r.mira.borderTopColor)
          guasti.push('.mira border-top-color=' + r.mira.borderTopColor + ' diverso da .diff=' + r.rif.borderTopColor);
        if (r.rif.fontFamily !== r.mira.fontFamily)
          guasti.push('.mira font-family=' + r.mira.fontFamily + ' diverso da .diff=' + r.rif.fontFamily);
      }
      if (r.miraTrovato && r.miraSelTrovato) {
        const diverso = r.mira.backgroundColor !== r.miraSel.backgroundColor || r.mira.borderTopColor !== r.miraSel.borderTopColor;
        if (!diverso) guasti.push('.mira.sel indistinguibile da .mira non selezionato (stesso background e stesso bordo)');
      }
      di(guasti.length === 0, 'MIRA-UI-STILE — .mira eredita lo stile di .diff/.taglia/.sponde/.vib, .mira.sel si distingue da .mira',
        guasti.length ? guasti.join('   ')
          : 'mira: ' + JSON.stringify(r.mira) + '   mira.sel: ' + JSON.stringify(r.miraSel) + '   riferimento .diff: ' + JSON.stringify(r.rif));
    }

    /* ===================================================================
       PROVA MIRA-ARIA (voce #113, compito 2) — aria-pressed del bottone
       ATTIVO deve valere "true", degli altri "false", sincronizzato
       DOPO ogni click (lezione di accessibilita' del #112: un valore per
       ogni refresh, mai attestato una volta sola). In coda, la parte che
       conta di piu': il click SCRIVE e PERSISTE SAVE.miraGuidata (letto
       due volte, da t.save -- l'oggetto live -- e da localStorage via
       t.saveKey, cosi' come persistSave lo scrive davvero). Nasce ROSSA
       sul gioco pre-compito-2: nessun bottone .mira, nessun aria-pressed
       da leggere. */
    {
      const r = await curato.pag.evaluate(() => {
        const t = window.__test;
        document.getElementById('gearBtn').click();
        document.getElementById('btnImpost').click();
        const bPieno = document.querySelector('.mira[data-mg="pieno"]');
        const bEss = document.querySelector('.mira[data-mg="essenziale"]');
        if (!bPieno || !bEss) return { trovati: false };
        const leggi = () => ({
          pienoAria: bPieno.getAttribute('aria-pressed'),
          essAria: bEss.getAttribute('aria-pressed'),
        });
        const prima = leggi();
        bEss.click();
        const dopoEss = leggi();
        const saveVivoDopoEss = t.save.miraGuidata;
        const persistitoDopoEss = JSON.parse(localStorage.getItem(t.saveKey) || '{}').miraGuidata;
        bPieno.click();
        const dopoPieno = leggi();
        const saveVivoDopoPieno = t.save.miraGuidata;
        return { trovati: true, prima, dopoEss, saveVivoDopoEss, persistitoDopoEss, dopoPieno, saveVivoDopoPieno };
      });
      const guasti = [];
      if (!r.trovati) {
        guasti.push('bottoni .mira[data-mg="pieno"/"essenziale"] non trovati (#miraRow assente?)');
      } else {
        if (r.prima.pienoAria !== 'true' || r.prima.essAria !== 'false')
          guasti.push('stato iniziale: pieno aria-pressed=' + r.prima.pienoAria + ', essenziale aria-pressed=' + r.prima.essAria + ' (atteso true/false, default \'pieno\')');
        if (r.dopoEss.essAria !== 'true' || r.dopoEss.pienoAria !== 'false')
          guasti.push('dopo il click su essenziale: essenziale=' + r.dopoEss.essAria + ', pieno=' + r.dopoEss.pienoAria + ' (atteso true/false)');
        if (r.saveVivoDopoEss !== 'essenziale') guasti.push('SAVE.miraGuidata (t.save, live) dopo il click vale ' + r.saveVivoDopoEss + ' invece di \'essenziale\'');
        if (r.persistitoDopoEss !== 'essenziale') guasti.push('SAVE.miraGuidata NON persiste in localStorage dopo il click (letto ' + r.persistitoDopoEss + ')');
        if (r.dopoPieno.pienoAria !== 'true' || r.dopoPieno.essAria !== 'false')
          guasti.push('dopo il click su pieno: pieno=' + r.dopoPieno.pienoAria + ', essenziale=' + r.dopoPieno.essAria + ' (atteso true/false)');
        if (r.saveVivoDopoPieno !== 'pieno') guasti.push('SAVE.miraGuidata dopo il secondo click vale ' + r.saveVivoDopoPieno + ' invece di \'pieno\'');
      }
      di(guasti.length === 0, 'MIRA-ARIA — aria-pressed sincronizzato col bottone attivo, il click scrive e persiste SAVE.miraGuidata',
        guasti.length ? guasti.join('   ')
          : 'iniziale: ' + JSON.stringify(r.prima) + '   dopo essenziale: ' + JSON.stringify(r.dopoEss) + ' (persistito: ' + r.persistitoDopoEss + ')' + '   dopo pieno: ' + JSON.stringify(r.dopoPieno));
    }

    if (curato.ecc.length) di(false, 'BANCO — nessuna eccezione di pagina (curato)', curato.ecc[0]);
    if (base.ecc.length) di(false, 'BANCO — nessuna eccezione di pagina (base113)', base.ecc[0]);
  } catch (e) {
    console.error('FALLITO: ' + e.message);
    await curato.chiudi(); await base.chiudi();
    process.exit(2);
  }

  await curato.chiudi(); await base.chiudi();
  const rossi = esiti.filter(v => !v).length;
  console.log('\n' + (esiti.length - rossi) + ' prove su ' + esiti.length + ' — ' + (rossi ? 'CANCELLO ROSSO' : 'CANCELLO VERDE'));
  process.exit(rossi ? 1 : 0);
})();
