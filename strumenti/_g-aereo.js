/* =====================================================================
   _g-aereo.js — DOVE VIVE IL PALLONE IN ALTEZZA, e perche' il gioco
   aereo quasi non accade (29 agosto 2026).

   DA DOVE NASCE. Curando la posa del colpo di testa (_t-testa-corpo.js)
   il banco _q-testa.js ha misurato una cosa che nessuno cercava:

       5v5    0,6 colpi di testa a partita
       7v7    0   in cinque partite
       11v11  0   in cinque partite

   Cioe' il gesto che ho appena disegnato non si vede quasi mai, e alle
   due taglie grandi — quelle dove il cross dovrebbe contare di piu',
   perche' il campo e' largo il doppio — non si vede MAI. Una posa
   perfetta per un gesto che non accade e' un ornamento.

   COSA MISURA, e sono cinque numeri per taglia:
     1. QUANTO TEMPO il pallone passa in ciascuna fascia di quota:
        a terra (z<=1), bassa (1..26), TESTA (26..46), sopra (>46).
        La fascia 26..46 e' l'unica in cui esiste un colpo di testa.
     2. QUANTE VOLTE ci ENTRA (le entrate contano piu' del tempo: un
        pallone che ci resta due secondi e' una sola occasione).
     3. Di quelle entrate, quante avevano UN UOMO A PORTATA — cioe'
        quante erano davvero occasioni mancate e non palloni in mezzo
        al nulla. La portata e' quella vera di updateBall: 34 per il
        destinatario del cross, P_R+B_R+3 per chiunque altro.
     4. QUANTI CROSS partono davvero (G.stats.cross, il contatore del
        gioco), che e' la sorgente principale dei palloni in quella
        fascia. NON b.crossTo: quello lo scrive solo il cross CON
        destinatario, e conterebbe meno del vero — vedi la rettifica
        scritta accanto alla riga che conta.
     5. La QUOTA MASSIMA raggiunta e la MEDIANA delle quote non nulle,
        per sapere se il pallone vola basso o non vola.

   IL BANCO NON GIUDICA: stampa. La soglia di «quanti colpi di testa
   dovrebbe avere una partita» non e' un numero che possa inventare uno
   strumento — si decide guardando questi numeri, e si scrive dove si
   decide, non qui dentro.

   LIMITE DICHIARATO: gira in CPU contro CPU. Tre verbi del gioco sono
   SOLO UMANI (lo strappo, lo scudo, il contrasto in piedi) e qui non
   escono mai.
   IL CROSS NO: la macchina crossa. C'e' una funzione che si chiama
   crossCPU (:19057), con il suo bersaglio (crossBersaglio), la sua
   finestra di distanza dedotta (crossFinestra) e il suo conto sul
   portiere. Il 29 agosto la prima stesura di questo file scriveva il
   contrario, e sbagliava: avevo cercato i chiamanti con un grep
   troncato a dieci righe, e la chiamata vera stava all'undicesima.

   MA LA MACCHINA CROSSA POCO, e questo il banco lo misura bene: 0,3
   cross a partita a cinque contro cinque, ZERO a sette e a undici.
   Quello — non l'assenza del codice — e' il buco del gioco aereo, e la
   causa e' che crossFinestra() da' alla CPU una distanza minima che ai
   campi grandi non viene quasi mai soddisfatta.

   TERZA RETTIFICA, e vale come regola. Una sonda scritta in fretta
   contava 2 chiamate a doCross per partita e mi ha fatto credere che i
   cross fossero il doppio del vero. Sbagliava per due motivi insieme:
     · contava le CHIAMATE, e doCross incrementa G.stats.cross solo se
       kickBall riesce — decidere di crossare non e' crossare;
     · girava a t.simulate(1), cioe' a passi di UN SECONDO. A quel passo
       la fisica non e' la stessa: la gravita' viene tolta una volta
       invece di sessanta, i raggi di contatto si saltano, e il gioco
       che si misura non e' quello che si gioca.
   Questo banco simula a 1/60 apposta. Chiunque scriva una sonda veloce
   per rispondere a una domanda su questo gioco usi lo stesso passo, o
   misurera' un altro gioco.

   uso:  node strumenti/_g-aereo.js
         node strumenti/_g-aereo.js --taglie 5,11 --partite 8
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
const GIOCO = arg('gioco', 'CALCETTO-il-gioco.html');
const TAGLIE = arg('taglie', '5,7,11').split(',').map(Number);
const PARTITE = parseInt(arg('partite', '6'), 10);
const SEME = parseInt(arg('seme', '20260803'), 10) >>> 0;

function esplode(m) { console.log('\nBANCO NON VALIDO - ' + m); process.exit(2); }

function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

async function apri(browser, porta, seme) {
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const err = [];
  pag.on('pageerror', e => err.push(e.message));
  await pag.addInitScript(s0 => {
    let s = s0 >>> 0 || 1;
    const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => p() / 4294967296;
    window.__caso = { semina(n) { s = n >>> 0 || 1; } };
  }, seme);
  await pag.goto('http://127.0.0.1:' + porta + '/' + GIOCO, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
  if (err.length) esplode('la pagina e\' partita con un errore: ' + err[0].slice(0, 160));
  return { ctx, pag };
}

async function unaPartita(pag, seme, taglia) {
  return pag.evaluate(([seme, taglia]) => {
    const t = window.__test;
    window.__caso.semina(seme);
    t.startMatch(1, 1, taglia !== 5 ? { size: taglia } : undefined);
    t.setCpuVsCpu(true);
    const DT = 1 / 60;
    const Z_SOPRA_TESTA = 26, Z_TESTA_MAX = 46;
    const fasce = { terra: 0, bassa: 0, testa: 0, sopra: 0 };
    let entrate = 0, entrateConUomo = 0, cross = 0, zMax = 0, passi = 0;
    const quote = [];
    let dentroPrima = false, crossPrima = 0;
    while (t.state !== 'end' && passi < 60 * 600) {
      t.simulate(DT); passi++;
      const b = G.ball, z = b.z || 0;
      if (z > zMax) zMax = z;
      if (z > 0.5) quote.push(z);
      if (z <= 1) fasce.terra++;
      else if (z <= Z_SOPRA_TESTA) fasce.bassa++;
      else if (z <= Z_TESTA_MAX) fasce.testa++;
      else fasce.sopra++;
      /* I CROSS SI CONTANO DAL CONTATORE DEL GIOCO, non da crossTo.
         RETTIFICA del 29 agosto 2026, prima stesura di questo file:
         qui c'era  if(b.crossTo>=0 && crossPrima<0) cross++  — e conta
         MENO del vero. doCross scrive crossTo solo quando c'e' un
         DESTINATARIO (riga «if(dest!==undefined) b.crossTo=dest»); un
         cross senza destinatario e' un cross uguale, con la sua
         b.vz=280*T, e con crossTo che resta -1. Il conto onesto e'
         G.stats.cross, che doCross incrementa sempre.
         E LA SONDA SBAGLIATA MI HA FATTO SBAGLIARE LA CONCLUSIONE.
         Con crossTo questo banco stampava 0,0 cross a partita a 7 e a
         11, e io ho letto quello zero come «la macchina non crossa» —
         andando poi a cercarne conferma in un grep che ho troncato a
         dieci righe, saltando proprio la chiamata vera (crossCPU,
         :19087, l'undicesima). Due errori che si sono sostenuti a
         vicenda: una misura sbagliata che sembrava confermata da una
         lettura sbagliata. La sonda giusta e' G.stats.cross, e la
         verita' e' che la CPU crossa 2 volte a partita — ma sempre da
         LONTANO, perche' crossFinestra() le da' una distanza minima,
         quindi con crossTo a -1 quando non c'e' destinatario il conto
         cadeva a zero. */
      const cs = (G.stats && G.stats.cross) ? ((G.stats.cross[0] | 0) + (G.stats.cross[1] | 0)) : 0;
      if (cs > crossPrima) cross += cs - crossPrima;
      crossPrima = cs;
      /* un'ENTRATA nella fascia della testa, contata una volta sola */
      const dentro = (b.owner < 0 && z > Z_SOPRA_TESTA && z <= Z_TESTA_MAX);
      if (dentro && !dentroPrima) {
        entrate++;
        /* c'era un uomo a portata? le stesse due portate di updateBall */
        let vicino = false;
        for (let i = 0; i < G.players.length; i++) {
          const q = G.players[i];
          if (q.out > 0 || q.slide >= 0 || q.recover > 0 || q.rove >= 0 || q.role === 'gk') continue;
          if (q.kickCd > 0) continue;
          const portata = (b.crossTo === i) ? 34 : (13 + 5 + 3);
          const dx = q.x - b.x, dy = q.y - b.y;
          if (Math.sqrt(dx * dx + dy * dy) <= portata) { vicino = true; break; }
        }
        if (vicino) entrateConUomo++;
      }
      dentroPrima = dentro;
    }
    quote.sort((a, b) => a - b);
    return { fasce, entrate, entrateConUomo, cross, zMax,
             mediana: quote.length ? quote[quote.length >> 1] : 0,
             passi, gol: [G.score[0], G.score[1]] };
  }, [seme, taglia]);
}

(async () => {
  const srv = await servi();
  const browser = await chromium.launch();
  const { ctx, pag } = await apri(browser, srv.porta, SEME);
  console.log('=== DOVE VIVE IL PALLONE IN ALTEZZA ===');
  console.log('gioco: ' + GIOCO + ', ' + PARTITE + ' partite per taglia, semi '
              + SEME + '..' + (SEME + PARTITE - 1) + ', campionato a 1/60\n');
  console.log('  taglia   a terra   bassa   TESTA   sopra  |  entrate  con uomo  |  cross  |  z max  mediana');
  console.log('  ' + '-'.repeat(96));
  for (const taglia of TAGLIE) {
    const acc = { terra: 0, bassa: 0, testa: 0, sopra: 0 };
    let entrate = 0, conUomo = 0, cross = 0, zMax = 0, passi = 0, med = [];
    for (let i = 0; i < PARTITE; i++) {
      const r = await unaPartita(pag, (SEME + i) >>> 0, taglia);
      for (const k in acc) acc[k] += r.fasce[k];
      entrate += r.entrate; conUomo += r.entrateConUomo; cross += r.cross;
      if (r.zMax > zMax) zMax = r.zMax; passi += r.passi; med.push(r.mediana);
    }
    const pc = v => (100 * v / passi).toFixed(2) + '%';
    med.sort((a, b) => a - b);
    console.log('  ' + String(taglia + 'v' + taglia).padEnd(8)
      + pc(acc.terra).padStart(8) + pc(acc.bassa).padStart(8)
      + pc(acc.testa).padStart(8) + pc(acc.sopra).padStart(8) + '  |'
      + (entrate / PARTITE).toFixed(1).padStart(9)
      + (conUomo / PARTITE).toFixed(1).padStart(10) + '  |'
      + (cross / PARTITE).toFixed(1).padStart(7) + '  |'
      + zMax.toFixed(0).padStart(7) + med[med.length >> 1].toFixed(1).padStart(9));
  }
  console.log('\n  Le percentuali sono sul TEMPO di gioco. Le entrate e i cross sono PER PARTITA.');
  console.log('  «con uomo» = entrate nella fascia 26..46 con almeno un giocatore a portata di');
  console.log('  colpo di testa: sono le occasioni VERE, le altre sono palloni in mezzo al nulla.');
  await ctx.close(); await browser.close(); srv.chiudi();
})().catch(e => esplode(e.message));
