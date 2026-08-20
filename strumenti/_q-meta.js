/* =====================================================================
   _q-meta.js — IL CANCELLO DEL META-GIOCO: torneo intero, stagione
   intera, classifica che torna, salvataggio che regge fra le partite.
   E, con --tre-taglie, il pavimento sulle partite 0-0 alle tre taglie.

   PERCHE' ESISTE. Il censimento del 20 agosto 2026 (§3.8.3 e §5.1) dice:
   «il meta-gioco: torneo, stagione, negozio, albo, trofei — nessun
   cancello li tocca; scatta.js li FOTOGRAFA». Se domani la classifica
   smettesse di sommare i punti, la batteria uscirebbe verde. E il §4.1
   dello stesso censimento trova una promessa dichiarata CHIUSA che non
   lo e': «l'11 contro 11 non tira mai — zero partite 0-0 in mediana»
   (PUNTO-DEL-LAVORO.md:138). Rimisurata qui, da capo, il 20 agosto:
   NON e' chiusa (i numeri sono piu' sotto, nelle soglie).

   COSA FA, in due parti.

   PARTE 1 (sempre): gioca DAVVERO un torneo intero (tre turni vinti,
   piu' uno perso su un torneo nuovo) e una stagione intera (14
   giornate), col giocatore in modalita' umana — perche' con la CPU al
   posto del pollice applyMatchRewards esce subito e il meta-gioco non
   avanza. Le partite si chiudono forzando reti con l'hook dichiarato
   __test.forceGoal e accorciando il cronometro: mai piu' di mezzo
   secondo di gioco vivo, cosi' il risultato e' quello voluto e non un
   sorteggio. POI NON SI FIDA DEL RISULTATO VOLUTO: rilegge il punteggio
   VERO a fine partita e verifica il meta-gioco contro quello.
     · il tabellone: vincitori che hanno giocato quella partita, turno
       nuovo fatto dei vincitori giusti, nessuna squadra doppia, il
       giocatore non sparisce; vinta la finale: albo +1, stats.tornei +1,
       trofeo sbloccato, SAVE.tour consumato; persa: out, tabellone
       risolto, niente rivincita dallo stesso tabellone;
     · la classifica: si RICALCOLA da zero in questo file, giornata per
       giornata, dai risultati registrati (3/1/0, gf, gs), e deve essere
       IDENTICA a quella del gioco — otto righe, nessuna sparita,
       ordinamento punti/differenza/gol fatti;
     · le monete: il delta di ogni turno di torneo (e della prima e
       ultima giornata) deve tornare AL CENTESIMO: base + esito + gol +
       porta imbattuta + perfetti + rubate + premio del turno + trofei
       appena sbloccati (unlockAch paga davvero: riga 30850 del gioco);
     · il salvataggio: a meta' stagione la pagina si RICARICA e
       stagione, monete e statistiche devono uscire dal localStorage
       identiche al bit;
     · il pareggio: misurato (giornata 10) che lo 0-0 al 90' NON chiude
       la partita — si va a golden — quindi in stagione la X del
       giocatore non esiste e il golden gol entra nel risultato
       registrato. Non e' un difetto che questo cancello giudica: e' un
       fatto che dichiara, perche' nessun documento lo diceva.

   PARTE 2 (--tre-taglie): N partite CPU contro CPU per taglia (5, 7,
   11) a semi di serie dichiarati, e il pavimento sulle partite 0-0.
   LE SOGLIE SONO ANCORATE A MISURE FATTE OGGI, non a gusti — 20 agosto
   2026, file md5 30279089de83, 30 partite per taglia, semi
   20260803..832, Normale, 90 s, piu' una seconda serie a 11 (24
   partite, semi 777..800) perche' un campione solo mente:

     5v5   0-0 al 90':  3/30 = 10%  · gol mediana 2,5 · distrib 0:3 1:6 2:6 3:6 4:7 6:1 7:1
     7v7   0-0 al 90': 12/30 = 40%  · gol mediana 1   · distrib 0:12 1:8 2:8 3:1 5:1
     11v11 0-0 al 90': 19/30 = 63%  E  9/24 = 38% sulla seconda serie
           — insieme 28/54 = 52%, forbice fra le serie 38-63.
           La MEDIANA dei gol salta fra 0 e 1 a seconda della serie:
           e' il motivo per cui sia il «zero 0-0 in mediana» di
           PUNTO-DEL-LAVORO:138 sia il «mediana 1,00» del censimento
           sono fotografie della stessa moneta che gira. Il numero
           onesto e' la QUOTA sul mucchio: meta' delle partite.

   LE SOGLIE, col perche' accanto:
     5v5:  quota 0-0 <= 40%. Misurato oggi 10%. Il pavimento sta a meta'
           strada fra il sano (10) e il rotto pre-toppa (73%): sopra il
           40 il difetto d'origine — «in questo gioco non si segnava» —
           e' tornato.
     7v7:  quota 0-0 <= 70%. Misurato oggi 40%: NON e' salute (due
           partite su cinque senza reti), e' un pavimento
           anti-regressione contro il ritorno all'83-92% pre-toppa.
           La soglia di salute (~25%) entra con l'onda della fisica.
     11v11: quota 0-0 <= 33%. Misurato oggi 63% e 38% (52% sul mucchio).
           QUESTO CONTROLLO NASCE ROSSO, APPOSTA: la voce e' dichiarata
           chiusa e non lo e', e il cancello resta rosso finche' l'onda
           della fisica non la chiude davvero. Non e' rumore: con 30
           partite e la quota vera a meta', esce rosso ~97 volte su 100
           (dispersione binomiale, dichiarata); dopo una cura vera che
           porti l'11 ai livelli del 5 (~10-15%), esce verde stabile.
           Una modalita' chiesta per nome dal committente in cui meta'
           delle partite finisce a reti bianche e il 39-43% si decide
           dai rigori non e' una modalita': e' una schermata.

   COME NON MENTE.
     · Il caso e' governato (xorshift32 a seme fisso, riseminato a ogni
       partita) e il disegno e' spento: stessa liturgia di _eventi.js.
     · La Parte 1 non si fida dei propri forzati: ogni verifica usa i
       numeri riletti dal gioco a fine partita.
     · Sa dire «non ho misurato»: browser che non parte, partita che
       non si chiude, hook rifiutato = uscita 2 (il banco e' esploso),
       MAI un verde regalato ne' un rosso inventato.
     · SA FALLIRE, ed e' dimostrato: strumenti/_q-meta-controllo.js
       fabbrica tre copie sabotate del gioco (punti a 2 invece di 3,
       tabellone col doppione, salvataggio che perde la stagione) e su
       tutte e tre questo cancello DEVE uscire rosso. Un cancello mai
       visto rosso e' una decorazione.

   CODICI DI USCITA DI CASA:
     0 verde · 1 il gioco e' rosso · 2 il banco e' esploso · 3 la prova
     e' nulla (gioco indicato inesistente).

   uso:
     node strumenti/_q-meta.js                      parte 1 (per la batteria)
     node strumenti/_q-meta.js --tre-taglie         parte 1 + pavimento 0-0
     node strumenti/_q-meta.js --tre-taglie --partite 30 --seme 20260803
     node strumenti/_q-meta.js --gioco fuori/prova.html
   La variabile d'ambiente GIOCO_PROVA vale come --gioco.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
function arg(n, d) {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
}
const haFlag = n => process.argv.indexOf('--' + n) > 0;

/* il server serve il repo; --gioco dirotta la richiesta del file di gioco
   su una copia fuori (stessa regola di _eventi.js e _banco.js) */
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

/* ------------------------------------------------------------------ referto */
const CONTROLLI = [];
function di(ok, nome, dettaglio) {
  CONTROLLI.push({ ok: !!ok, nome });
  console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (dettaglio ? '  [' + dettaglio + ']' : ''));
  return !!ok;
}
const fatto = t => console.log('  --    FATTO: ' + t);

/* il banco che esplode NON e' un rosso del gioco: si esce 2 e si dice */
class Esplosione extends Error {}
const esplodi = m => { throw new Esplosione(m); };

/* ================= GLI AIUTI CHE VIVONO DENTRO LA PAGINA =================
   Passati come FUNZIONI a evaluate (niente stringhe di codice: i backtick
   dentro i template hanno gia' rotto due file in questa casa). */
function installaAiuti() {
  const t = window.__test;
  window.__qm = {
    /* spinge la simulazione a passi di un secondo finche' la scena non e'
       una di quelle chieste; il tetto evita il giro infinito */
    fino(scene, mx) { let s = 0; while (!scene.includes(t.state) && s < mx) { t.simulate(1); s++; } return t.state; },
    /* chiude la partita in corso forzando gm reti mie e gl loro.
       Le reti si forzano in scena kickoff/play/golden (le sole che
       forceGoal accetta); la scena del gol si attraversa senza entrare
       nel gioco vivo, cosi' la CPU non puo' sporcare il risultato; il
       cronometro si accorcia a mezzo secondo: da kickoff, in mezzo
       secondo, nessuno arriva in porta (350 unita' al massimo contro
       575 di meta' campo) e il punteggio resta quello forzato.
       Il punteggio che TORNA e' comunque quello riletto dal gioco. */
    forza(gm, gl) {
      const seq = [];
      for (let i = 0; i < gm; i++) seq.push(0);
      for (let i = 0; i < gl; i++) seq.push(1);
      this.fino(['play', 'kickoff', 'golden'], 60);
      for (const team of seq) {
        this.fino(['play', 'kickoff', 'golden'], 60);
        if (!t.forceGoal(team)) return { err: 'forceGoal rifiutato in scena ' + t.state };
        let s = 0; while (t.state === 'goal' && s < 90) { t.simulate(1); s++; }
      }
      this.fino(['play', 'kickoff', 'golden'], 60);
      t.setTimeLeft(0.5);
      let s = 0; while (t.state !== 'end' && s < 400) { t.simulate(5); s += 5; }
      if (t.state !== 'end') return { err: 'la partita non si chiude: scena ' + t.state };
      return { score: [t.score[0], t.score[1]], perfetti: t.stats.perfetti[0] | 0, rubate: t.stats.rubate[0] | 0 };
    },
    /* la via del pareggio: nessuna rete forzata, cronometro quasi a zero,
       e si guarda cosa fa il gioco sullo 0-0 al 90'. Se si alza il flag
       del golden la partita si decide li' con una rete forzata
       (il tiro dei rigori vuole il dito umano e questo banco non ce
       l'ha: fermarsi al golden e' il modo di misurare senza inventare) */
    pareggio() {
      /* PRIMA dentro il gioco vivo, POI il cronometro: dare setTimeLeft
         durante il primo calcio d'inizio (quello con la presentazione dei
         capitani) non regge — misurato: la partita e' durata i 90 secondi
         interi ed e' finita 0-1 senza golden. Da 'play' il timer e' suo. */
      this.fino(['play'], 120);
      if (t.state !== 'play') return { err: 'non si entra nel gioco vivo: scena ' + t.state };
      if (t.score[0] + t.score[1] > 0) return { err: 'il campo non e\' vergine: ' + t.score[0] + '-' + t.score[1] };
      /* tre fotogrammi: nessun tiro puo' partire (a taglia 5 il tiro vuole
         distX < 460 e la palla e' appena battuta dal centro) ne' arrivare */
      t.setTimeLeft(0.05);
      /* IL GOLDEN E' UN FLAG, NON UNA SCENA: allo scadere sullo 0-0 il
         gioco alza G.golden e la scena resta 'play' — misurato: guardare
         t.state qui faceva correre la morte improvvisa fino alla rete
         della CPU. Si legge il flag, a passi di tre fotogrammi, cosi' lo
         si coglie prima che chiunque possa segnare dal centro. */
      let visto = false, s = 0;
      while (t.state !== 'end' && s < 6000) {
        t.simulate(0.05); s++;
        if (t.G.golden) { visto = true; break; }
      }
      if (!visto) return { err: 'niente golden sullo 0-0: scena ' + t.state + ' punteggio ' + t.score[0] + '-' + t.score[1] };
      if (!t.forceGoal(0)) return { err: 'forceGoal rifiutato nel golden' };
      s = 0; while (t.state !== 'end' && s < 200) { t.simulate(5); s += 5; }
      if (t.state !== 'end') return { err: 'il golden gol non chiude la partita' };
      return { vistoGolden: true, score: [t.score[0], t.score[1]], perfetti: t.stats.perfetti[0] | 0, rubate: t.stats.rubate[0] | 0 };
    },
  };
  return 'ok';
}

/* la sonda del 90': cattura il punteggio NEL MOMENTO in cui scatta il
   golden, perche' a fine partita il golden gol e i rigori l'hanno gia'
   sporcato. Stesso avvolgimento di step usato da _eventi.js. */
function installaSonda90() {
  if (window.__zz) return 'gia';
  const S = { golden: false, golRegol: null };
  const _step = window.step;
  window.step = function () {
    _step.apply(this, arguments);
    if (G.golden && !S.golden) { S.golden = true; S.golRegol = [G.score[0], G.score[1]]; }
  };
  window.__zz = {
    azzera() { S.golden = false; S.golRegol = null; },
    leggi() {
      return {
        golden: S.golden,
        golRegol: S.golRegol ? S.golRegol.slice() : [G.score[0], G.score[1]],
        tiri: [G.stats.tiri[0] | 0, G.stats.tiri[1] | 0],
        specchio: [G.stats.inPorta[0] | 0, G.stats.inPorta[1] | 0],
        rigori: !!G.rigori,
      };
    },
  };
  return 'ok';
}

/* lo stato del meta-gioco, riletto dal gioco e reso confrontabile */
function leggiStato() {
  const t = window.__test;
  return JSON.parse(JSON.stringify({
    coins: t.coins,
    ach: Object.keys(t.save.ach || {}).filter(k => t.save.ach[k]),
    stats: t.save.stats,
    albo: t.save.albo,
    tour: t.save.tour,
    season: t.save.season,
    teamName: t.save.teamName,
  }));
}

/* la classifica attesa, RICALCOLATA QUI dai risultati registrati: 3 punti
   a vittoria, 1 a pareggio, gf/gs. E' la definizione del gioco del
   calcio, non una lettura dal gioco: se il gioco diverge, il gioco e'
   rosso (e' esattamente il sabotaggio n.1 del controllo negativo) */
function tabAttesa(archivio) {
  const tab = Array.from({ length: 8 }, () => ({ g: 0, v: 0, n: 0, p: 0, gf: 0, gs: 0, pt: 0 }));
  for (const m of archivio) {
    const A = tab[m.a], B = tab[m.b];
    A.g++; B.g++; A.gf += m.ga; A.gs += m.gb; B.gf += m.gb; B.gs += m.ga;
    if (m.ga > m.gb) { A.v++; B.p++; A.pt += 3; }
    else if (m.gb > m.ga) { B.v++; A.p++; B.pt += 3; }
    else { A.n++; B.n++; A.pt++; B.pt++; }
  }
  return tab;
}

const mediana = a => { const b = a.slice().sort((x, y) => x - y); const n = b.length; return n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2; };

(async () => {
  const semeBase = +arg('seme', 20260803);
  const partiteTaglia = Math.max(4, +arg('partite', 30) | 0);
  const treTaglie = haFlag('tre-taglie');
  const prova = arg('gioco', process.env.GIOCO_PROVA || '');
  const provaAbs = prova ? path.resolve(prova) : '';
  if (provaAbs && !fs.existsSync(provaAbs)) { console.error('PROVA NULLA: gioco inesistente: ' + provaAbs); process.exit(3); }

  const srv = await servi(provaAbs);
  let browser = null;
  const errori = [];
  try {
    browser = await chromium.launch();
    const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
    const pag = await ctx.newPage();
    pag.on('pageerror', e => errori.push('ECCEZIONE: ' + e.message));

    /* il caso governato: come _eventi.js, PRIMA che la pagina esegua una riga */
    await ctx.addInitScript(seme => {
      let s = seme >>> 0 || 1;
      const prossimo = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
      Math.random = () => prossimo() / 4294967296;
      if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = prossimo(); return a; };
      }
      window.__caso = { semina(n) { s = n >>> 0 || 1; } };
    }, semeBase);

    /* arma la pagina; e' anche la procedura di RIENTRO dopo la ricarica
       del controllo di persistenza, quindi vive in una funzione */
    async function arma() {
      await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
      await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
      await pag.waitForTimeout(150);
      await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); });
      const inst = await pag.evaluate(installaAiuti);
      if (inst !== 'ok') esplodi('gli aiuti non si installano: ' + inst);
    }
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await arma();

    /* le costanti si LEGGONO dal gioco, non si ricordano: un premio
       ritoccato nel gioco e ricordato qui produrrebbe un rosso falso */
    const C = await pag.evaluate(() => ({
      COIN_BASE, COIN_WIN, COIN_DRAW, COIN_GOL, COIN_CLEAN, COIN_PERF, COIN_RUB,
      SEA_WIN, SEA_DRAW, SEA_TITOLO, SEA_PODIO,
      TOUR_PRIZE: TOUR_PRIZE.slice(), TOUR_DIFF: TOUR_DIFF.slice(),
      ACH_PREMI: Object.fromEntries(ACH.map(a => [a.id, a.premio | 0])),
    }));
    /* il delta di monete atteso per una partita, dalla tariffa del gioco */
    const monete = (fine, vinta, extra, achNuovi) =>
      C.COIN_BASE + (vinta ? C.COIN_WIN : 0) + fine.score[0] * C.COIN_GOL +
      (fine.score[1] === 0 ? C.COIN_CLEAN : 0) + fine.perfetti * C.COIN_PERF + fine.rubate * C.COIN_RUB +
      extra + achNuovi.reduce((s, a) => s + (C.ACH_PREMI[a] || 0), 0);

    console.log('\n=== _q-meta — il meta-gioco giocato per intero, seme ' + semeBase + ' ===');
    console.log('  --    gioco: ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)'));

    /* ---------------- SEZIONE 0 — la taglia come strumento ----------------
       Prima di misurare qualunque cosa per taglia bisogna sapere che la
       taglia chiesta e' quella ottenuta: un banco di casa ha gia' passato
       una giornata a misurare un 5v5 credendolo un 11 (startMatch(1,1,3)
       apre il CINQUE: il terzo argomento e' opts, non la taglia). */
    await pag.evaluate(() => { const t = window.__test; t.resetSave(); t.save.tutorialDone = 1; t.save.moviola = 0; t.save.taglia = 11; });
    const t0 = await pag.evaluate(() => {
      const t = window.__test;
      t.startMatch(1, 1, { size: 11 }); const a = t.taglia;
      t.startMatch(1, 1, { size: 3 }); const b = t.taglia;
      t.startMatch(1, 1, { size: 7 }); const c = t.taglia;
      t.startMatch(1, 1); const d = t.taglia;
      return { a, b, c, d };
    });
    console.log('\n  -- la taglia come strumento --');
    di(t0.a === 11, 'startMatch({size:11}) apre l\'undici', 'taglia ' + t0.a);
    di(t0.b === 5, 'la trappola documentata: {size:3} apre il CINQUE', 'taglia ' + t0.b);
    di(t0.c === 7, 'startMatch({size:7}) apre il sette', 'taglia ' + t0.c);
    di(t0.d === 11, 'senza opts comanda SAVE.taglia', 'taglia ' + t0.d);

    /* --------------------- SEZIONE 1 — il torneo vinto --------------------- */
    console.log('\n  -- il torneo, vinto --');
    const T0 = await pag.evaluate(() => window.__test.newTournament());
    di(T0 && Array.isArray(T0.teams) && T0.teams.length === 8 && T0.teams[0].me === true,
      'il tabellone nasce con otto squadre e il giocatore in testa');
    di(T0 && T0.rounds.length === 3 && T0.rounds[0].length === 4 && T0.rounds[1].length === 2 && T0.rounds[2].length === 1,
      'tre turni: quarti (4), semifinale (2), finale (1)');
    const r0squadre = T0 ? [].concat(...T0.rounds[0].map(m => [m.a, m.b])) : [];
    di(new Set(r0squadre).size === 8 && r0squadre.every(x => x >= 0 && x < 8),
      'nei quarti giocano tutte e otto, una volta ciascuna');
    let tagliaTour = -1;
    for (let r = 0; r < 3; r++) {
      const pre = await pag.evaluate(leggiStato);
      if (!pre.tour || pre.tour.round !== r) esplodi('il torneo non e\' al turno ' + r);
      const via = await pag.evaluate(() => { const t = window.__test; t.startTourMatch(); return { scena: t.state, taglia: t.taglia, diff: t.getDifficultyParams().diff, opp: t.G.oppName }; });
      di(via.scena === 'kickoff', 'turno ' + r + ': la partita parte', 'scena ' + via.scena + ', vs ' + via.opp);
      di(via.diff === C.TOUR_DIFF[r], 'turno ' + r + ': la difficolta\' e\' quella del turno', via.diff + ' contro TOUR_DIFF ' + C.TOUR_DIFF[r]);
      tagliaTour = via.taglia;
      const fine = await pag.evaluate(() => window.__qm.forza(2, 0));
      if (fine.err) esplodi('turno ' + r + ': ' + fine.err);
      di(fine.score[0] > fine.score[1], 'turno ' + r + ': vinto come forzato', fine.score.join('-'));
      const post = await pag.evaluate(leggiStato);
      const achNuovi = post.ach.filter(a => !pre.ach.includes(a));
      const attese = monete(fine, true, C.TOUR_PRIZE[r], achNuovi);
      di(post.coins - pre.coins === attese, 'turno ' + r + ': le monete tornano al centesimo',
        'delta ' + (post.coins - pre.coins) + ' contro attese ' + attese + (achNuovi.length ? ' (trofei: ' + achNuovi.join(',') + ')' : ''));
      if (r < 2) {
        const T2 = post.tour;
        di(T2 && T2.round === r + 1, 'turno ' + r + ': il tabellone avanza', T2 ? 'round ' + T2.round : 'tour nullo');
        if (!T2) continue;
        const R = T2.rounds[r], N = T2.rounds[r + 1];
        di(R.every(m => m.w === m.a || m.w === m.b), 'turno ' + r + ': ogni vincitore ha giocato la sua partita');
        const mia = R.find(m => m.a === 0 || m.b === 0);
        di(!!mia && mia.w === 0, 'turno ' + r + ': la vittoria e\' del giocatore');
        let giusti = true;
        for (let i = 0; i < N.length; i++) giusti = giusti && N[i].a === R[i * 2].w && N[i].b === R[i * 2 + 1].w;
        const nel = [].concat(...N.map(m => [m.a, m.b]));
        di(giusti, 'turno ' + r + ': il turno nuovo e\' fatto dei vincitori giusti');
        di(new Set(nel).size === nel.length, 'turno ' + r + ': nessuna squadra doppia nel turno nuovo');
        di(nel.includes(0), 'turno ' + r + ': il giocatore non sparisce dal tabellone');
      } else {
        di(post.tour === null, 'finale: il torneo vinto si consuma (SAVE.tour nullo)');
        di(post.stats.tornei === (pre.stats.tornei | 0) + 1, 'finale: stats.tornei cresce di uno', pre.stats.tornei + ' -> ' + post.stats.tornei);
        di(post.albo.length === pre.albo.length + 1, 'finale: l\'albo d\'oro cresce di una riga', pre.albo.length + ' -> ' + post.albo.length);
        const riga = post.albo[post.albo.length - 1] || {};
        di(riga.nome === post.teamName, 'finale: l\'albo porta il nome della squadra', String(riga.nome));
        di(post.ach.includes('torneo'), 'finale: il trofeo RE DEL QUARTIERE si sblocca');
      }
    }

    /* --------------------- SEZIONE 1b — il torneo perso --------------------- */
    console.log('\n  -- il torneo, perso --');
    await pag.evaluate(() => { window.__test.newTournament(); });
    const preE = await pag.evaluate(leggiStato);
    const oiE = (() => { const m = preE.tour.rounds[0].find(m => m.a === 0 || m.b === 0); return m.a === 0 ? m.b : m.a; })();
    await pag.evaluate(() => { window.__test.startTourMatch(); });
    const fineE = await pag.evaluate(() => window.__qm.forza(0, 1));
    if (fineE.err) esplodi('torneo perso: ' + fineE.err);
    di(fineE.score[0] < fineE.score[1], 'la sconfitta forzata e\' una sconfitta', fineE.score.join('-'));
    const postE = await pag.evaluate(leggiStato);
    di(postE.tour && postE.tour.out === true, 'perso il quarto: il torneo e\' fuori (out)');
    di(postE.tour && postE.tour.rounds[0].every(m => m.w === m.a || m.w === m.b), 'il resto del tabellone si risolve da solo');
    const miaE = postE.tour ? postE.tour.rounds[0].find(m => m.a === 0 || m.b === 0) : null;
    di(!!miaE && miaE.w === oiE, 'la mia partita la vince l\'avversario vero', 'w=' + (miaE && miaE.w) + ' atteso ' + oiE);
    di(postE.stats.tornei === preE.stats.tornei, 'nessun trofeo regalato allo sconfitto');
    const scenaE = await pag.evaluate(() => { window.__test.startTourMatch(); return window.__test.state; });
    di(scenaE === 'end', 'da eliminato non si rientra in campo dallo stesso tabellone', 'scena ' + scenaE);

    /* --------------------- SEZIONE 2 — la stagione intera --------------------- */
    console.log('\n  -- la stagione, intera --');
    await pag.evaluate(() => { nuovaStagione(); });
    const S0 = await pag.evaluate(() => JSON.parse(JSON.stringify(window.__test.save.season)));
    di(S0 && S0.squadre.length === 8 && S0.squadre[0].me === true, 'otto squadre, il giocatore e\' la prima');
    di(S0 && S0.cal.length === 14, 'quattordici giornate (andata e ritorno)', 'cal ' + (S0 ? S0.cal.length : '-'));
    /* ogni coppia ORIENTATA una volta sola = andata+ritorno senza buchi */
    const coppie = new Set(); let benFormate = true;
    for (const g of S0.cal) {
      if (g.length !== 4) benFormate = false;
      const visti = new Set();
      for (const m of g) {
        if (m.a === m.b || m.a < 0 || m.a > 7 || m.b < 0 || m.b > 7) benFormate = false;
        visti.add(m.a); visti.add(m.b);
        coppie.add(m.a + '-' + m.b);
      }
      if (visti.size !== 8) benFormate = false;
    }
    di(benFormate, 'ogni giornata: quattro partite, ognuno gioca una volta');
    di(coppie.size === 56, 'ogni coppia orientata esattamente una volta (56 su 56)', String(coppie.size));
    di(S0 && S0.giornata === 0 && S0.finita === false && S0.tab.every(r => r.pt === 0 && r.g === 0), 'la classifica nasce vergine');

    const archivio = [];
    let tagliaSea = -1, moneteG0 = null, moneteG13 = null, stagioneSparita = false;
    for (let g = 0; g < 14; g++) {
      const pre = await pag.evaluate(leggiStato);
      /* se la stagione e' sparita dal salvataggio NON e' il banco che
         esplode: e' il gioco che ha perso i dati del giocatore, cioe'
         esattamente il rosso che questo cancello esiste per dare (ed e'
         il sabotaggio n.3 del controllo negativo) */
      if (!pre.season) {
        di(false, 'giornata ' + (g + 1) + ': la stagione e\' SPARITA dal salvataggio');
        stagioneSparita = true;
        break;
      }
      const via = await pag.evaluate(() => { startSeasonMatch(); const t = window.__test; return { scena: t.state, taglia: t.taglia, diff: t.getDifficultyParams().diff }; });
      if (via.scena !== 'kickoff') esplodi('giornata ' + (g + 1) + ': la partita non parte (scena ' + via.scena + ')');
      tagliaSea = via.taglia;
      /* la difficolta' e' la forza dell'avversario, per la regola scritta a
         startSeasonMatch: forza>=8 -> Duro, >=5 -> Normale, sotto -> Facile */
      const m = pre.season.cal[pre.season.giornata].find(x => x.a === 0 || x.b === 0);
      const forza = pre.season.squadre[m.a === 0 ? m.b : m.a].forza;
      const diffAttesa = forza >= 8 ? 2 : (forza >= 5 ? 1 : 0);
      const fine = g === 9
        ? await pag.evaluate(() => window.__qm.pareggio())
        : await pag.evaluate(() => window.__qm.forza(2, 0));
      if (fine.err) esplodi('giornata ' + (g + 1) + ': ' + fine.err);
      const post = await pag.evaluate(leggiStato);
      const S = post.season;
      const um = (S.ultimi || []).find(r => r.mia);
      const registrata = !!um && ((um.a === 0 && um.ga === fine.score[0] && um.gb === fine.score[1]) ||
                                  (um.b === 0 && um.gb === fine.score[0] && um.ga === fine.score[1]));
      for (const r of S.ultimi || []) archivio.push(r);
      const attesa = tabAttesa(archivio);
      const uguale = JSON.stringify(attesa) === JSON.stringify(S.tab);
      di(S.giornata === g + 1 && via.diff === diffAttesa && (S.ultimi || []).length === 4 && registrata && uguale,
        'giornata ' + (g + 1) + ': registrata, difficolta\' giusta, classifica ricalcolata identica',
        fine.score.join('-') + (um && um.a === 0 ? ' in casa' : ' in trasferta') +
        (uguale ? '' : ' — LA CLASSIFICA NON TORNA') +
        (via.diff === diffAttesa ? '' : ' — diff ' + via.diff + ' attesa ' + diffAttesa));
      if (g === 9) {
        di(fine.vistoGolden === true, 'lo 0-0 al 90\' non chiude la partita: si va al GOLDEN (misurato)');
        di(fine.score[0] !== fine.score[1] && registrata, 'in stagione la X del giocatore non esiste: il golden entra nel risultato registrato', fine.score.join('-'));
      }
      const achNuovi = post.ach.filter(a => !pre.ach.includes(a));
      if (g === 0) moneteG0 = { delta: post.coins - pre.coins, attese: monete(fine, true, C.SEA_WIN, achNuovi), achNuovi };
      if (g === 13) moneteG13 = { delta: post.coins - pre.coins, attese: monete(fine, true, C.SEA_WIN + C.SEA_TITOLO, achNuovi), achNuovi };

      /* -------- il salvataggio fra le partite: la ricarica a meta' --------
         Non un mock: la pagina si ricarica DAVVERO e lo stato deve uscire
         dal localStorage identico al bit. E' il punto cieco n.2 del
         censimento (§3.8), qui nella sua forma da meta-gioco. */
      if (g === 6) {
        const prima = await pag.evaluate(() => JSON.stringify({ season: window.__test.save.season, coins: window.__test.coins, stats: window.__test.save.stats }));
        await pag.reload({ waitUntil: 'load' });
        await arma();
        const dopo = await pag.evaluate(() => JSON.stringify({ season: window.__test.save.season, coins: window.__test.coins, stats: window.__test.save.stats }));
        di(prima === dopo, 'la ricarica a meta\' stagione: stagione, monete e statistiche identiche al bit',
          prima === dopo ? '' : 'lo stato NON regge la ricarica');
      }
    }
    di(moneteG0 && moneteG0.delta === moneteG0.attese, 'giornata 1: le monete tornano al centesimo (bonus campionato compreso)',
      moneteG0 ? moneteG0.delta + ' contro ' + moneteG0.attese : '');
    di(moneteG13 && moneteG13.delta === moneteG13.attese, 'giornata 14: il titolo paga SEA_TITOLO, al centesimo',
      moneteG13 ? moneteG13.delta + ' contro ' + moneteG13.attese + (moneteG13.achNuovi.length ? ' (trofei: ' + moneteG13.achNuovi.join(',') + ')' : '') : '');

    const fin = await pag.evaluate(leggiStato);
    di(fin.season && fin.season.finita === true, 'dopo la quattordicesima la stagione e\' conclusa');
    /* con la stagione sparita classificaStagione(null) esploderebbe nella
       pagina e il rosso diventerebbe un banco esploso: si giudica solo
       cio' che esiste, e cio' che manca e' gia' stato bocciato sopra */
    const cl = (fin.season && !stagioneSparita)
      ? await pag.evaluate(() => classificaStagione(window.__test.save.season).map(r => ({ i: r.i, pt: r.pt, dr: r.dr, gf: r.gf })))
      : [];
    di(cl.length === 8 && new Set(cl.map(r => r.i)).size === 8, 'la classifica ha otto righe e nessuna squadra sparisce');
    let ordinata = cl.length === 8;
    for (let k = 1; k < cl.length; k++) {
      const a = cl[k - 1], b = cl[k];
      ordinata = ordinata && (a.pt > b.pt || (a.pt === b.pt && (a.dr > b.dr || (a.dr === b.dr && a.gf >= b.gf))));
    }
    di(ordinata, 'l\'ordinamento rispetta punti, differenza reti, gol fatti');
    di(cl.length === 8 && cl[0].i === 0, 'quattordici vittorie fanno il campione: il giocatore e\' primo', cl.length ? 'pt ' + cl[0].pt : 'niente classifica');
    /* === 1 e non >= 1: un contatore che scattasse due volte per un titolo
       solo passerebbe un cancello scritto largo */
    di(fin.stats.stagioni === 1, 'stats.stagioni conta il titolo una volta sola', String(fin.stats.stagioni));
    di(fin.albo.some(r => r.campo === 'STAGIONE'), 'l\'albo porta la riga del campionato');
    di(fin.ach.includes('campione'), 'il trofeo CAMPIONE DEL QUARTIERE si sblocca');

    /* le taglie viste nel meta-gioco: oggi un FATTO, non un verdetto.
       Il censimento §3.5.1 dice «torneo e stagione inchiodati al 5v5»:
       qui lo si MISURA con SAVE.taglia=11 dichiarato prima di partire.
       Il giorno che l'onda della fisica sblocca il 7 e l'11, questa riga
       cambiera' da sola e i documenti andranno aggiornati. */
    console.log('');
    if (tagliaTour === 5 && tagliaSea === 5) {
      fatto('con SAVE.taglia=11, torneo e stagione giocano comunque a 5 contro 5 — INCHIODATI,');
      fatto('come da censimento §3.5.1: chi gioca a 7 o a 11 non puo\' vincere niente. Misurato, non letto.');
    } else {
      fatto('taglia vista: torneo ' + tagliaTour + ', stagione ' + tagliaSea + ' — il chiodo del 5v5 e\' saltato:');
      fatto('la voce §3.5.1 del censimento e\' superata, aggiornare i documenti e le soglie di --tre-taglie.');
    }
    di([5, 7, 11].includes(tagliaTour) && [5, 7, 11].includes(tagliaSea), 'le partite del meta-gioco hanno una taglia legale', tagliaTour + '/' + tagliaSea);

    /* --------------- SEZIONE 3 — il pavimento 0-0 alle tre taglie --------------- */
    if (treTaglie) {
      console.log('\n  -- le tre taglie: il pavimento sulle partite 0-0 --');
      console.log('  --    ' + partiteTaglia + ' partite CPU contro CPU per taglia, semi ' + semeBase + '..' + (semeBase + partiteTaglia - 1) + ', Normale, 90 s');
      /* salvataggio vergine: la rosa cresciuta nelle 18 partite del
         meta-gioco entrerebbe nella simulazione e staccherebbe questi
         numeri dalle ancore prese su pagina fresca */
      await pag.evaluate(() => { const t = window.__test; t.resetSave(); t.save.tutorialDone = 1; });
      const inst = await pag.evaluate(installaSonda90);
      if (inst !== 'ok' && inst !== 'gia') esplodi('sonda del 90\' non installata: ' + inst);
      /* [taglia, soglia %, ancora scritta] — le ragioni per esteso stanno
         nell'intestazione del file, le ancore sono del 20 agosto 2026 */
      const SOGLIE = [
        [5, 40, 'misurato 10% (3/30); a meta\' fra il sano (10) e il rotto pre-toppa (73)'],
        [7, 70, 'misurato 40% (12/30); pavimento anti-regressione contro l\'83-92% pre-toppa, NON salute'],
        [11, 33, 'misurato 63% (19/30) e 38% (9/24): 52% sul mucchio — ROSSO APERTO finche\' la fisica non chiude la voce di PUNTO-DEL-LAVORO:138'],
      ];
      for (const [taglia, soglia, ancora] of SOGLIE) {
        let zeri = 0, rig = 0; const gol90 = [], tiri = [];
        for (let i = 0; i < partiteTaglia; i++) {
          const z = await pag.evaluate(([seme, size]) => {
            const t = window.__test;
            window.__caso.semina(seme);
            window.__zz.azzera();
            t.startMatch(1, 1, { size });
            t.setCpuVsCpu(true);
            let sim = 0;
            while (t.state !== 'end' && sim < 600) { t.simulate(10); sim += 10; }
            const e = window.__zz.leggi(); e.scena = t.state; return e;
          }, [(semeBase + i) >>> 0, taglia]);
          if (z.scena !== 'end') esplodi(taglia + 'v' + taglia + ' partita ' + i + ': non finisce');
          const g90 = (z.golRegol[0] | 0) + (z.golRegol[1] | 0);
          if (g90 === 0) zeri++;
          if (z.rigori) rig++;
          gol90.push(g90); tiri.push((z.tiri[0] | 0) + (z.tiri[1] | 0));
        }
        const quota = zeri / partiteTaglia * 100;
        di(quota <= soglia,
          taglia + 'v' + taglia + ': partite 0-0 nei 90 s ' + zeri + '/' + partiteTaglia + ' = ' + quota.toFixed(0) + '% (soglia <= ' + soglia + '%)',
          'gol mediana ' + mediana(gol90) + ', tiri mediana ' + mediana(tiri) + ', ai rigori ' + rig + ' — ancora: ' + ancora);
      }
    }

    /* ------------------------------- verdetto ------------------------------- */
    di(errori.length === 0, 'nessuna eccezione di pagina durante la corsa', errori[0] || '');
    const rosse = CONTROLLI.filter(c => !c.ok).length;
    console.log('\n' + CONTROLLI.length + ' controlli, ' + (CONTROLLI.length - rosse) + ' passati, ' + rosse + ' falliti');
    await browser.close(); srv.chiudi();
    process.exit(rosse ? 1 : 0);
  } catch (e) {
    try { if (browser) await browser.close(); } catch (x) {}
    srv.chiudi();
    /* UN'ECCEZIONE DEL GIOCO E' UN ROSSO DEL GIOCO, non un banco esploso:
       distinguere «rosso» da «non misurato» e' la regola di casa, e vale
       nei due versi. Se la pila dell'errore attraversa il file del gioco
       (o la pagina ha gia' denunciato un'eccezione propria), il gioco e'
       esploso in corsa: uscita 1, coi controlli raccolti fin qui.
       Misurato sul controllo negativo del tabellone: il bracket corrotto
       fa incontrare il giocatore con se' stesso e render() muore su un
       colore di divisa che non esiste — quella e' una bocciatura, non
       una prova nulla. */
    const delGioco = /CALCETTO-il-gioco\.html:\d/.test(String((e && e.stack) || e)) || errori.length > 0;
    if (delGioco && !(e instanceof Esplosione)) {
      CONTROLLI.push({ ok: false, nome: 'gioco esploso in corsa' });
      console.log('  NO  il gioco e\' ESPLOSO durante la corsa: ' + String(e.message || e).split('\n')[0]);
      const rosse = CONTROLLI.filter(c => !c.ok).length;
      console.log('\n' + CONTROLLI.length + ' controlli, ' + (CONTROLLI.length - rosse) + ' passati, ' + rosse + ' falliti');
      process.exit(1);
    }
    if (e instanceof Esplosione) {
      console.log('\n  ??   IL BANCO E\' ESPLOSO: ' + e.message);
      console.log('       (uscita 2: NON e\' un rosso del gioco — il cancello non ha potuto misurare)');
      process.exit(2);
    }
    console.error('FALLITO (banco): ' + e.message);
    process.exit(2);
  }
})();
