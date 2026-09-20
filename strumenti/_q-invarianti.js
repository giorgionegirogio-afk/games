/* =====================================================================
   _q-invarianti.js -- IL BANCO DELLE INVARIANTI (voce #125, onda C — 1).

   IL PERCHE'. Il mandato (Appendice A, INV-01..15) chiede che certe
   proprieta' del motore valgano SEMPRE, a ogni fotogramma di qualunque
   partita: sono il prerequisito di un fuzzer (senza sapere COSA cercare,
   input casuali non dicono niente) e di un soak (1000 partite/notte, zero
   violazioni). Questo file e' un BANCO, non codice sempre-attivo: legge lo
   stato del motore via `__test` (come _diag-nan.js/_q-determinismo.js/
   _q-umore.js) durante partite CPU-CPU guidate da qui, e verifica sei
   invarianti SOLIDE (le restanti — clamp fiato/cond, >=2 uomini, palla
   sotto il piano — sono il compito 2 di questo stesso cantiere).

   LE SEI PROVE (ciascuna nata rossa su un bugiardo, vedi sotto):
     1. NaN/Infinity   -- isFinite su ball.{x,y,z,vx,vy,vz} e su
        p.{x,y,vx,vy,aiTX,aiTY} per ogni giocatore. Assorbe _diag-nan.js
        come invariante permanente di batteria.
     2. owner valido   -- G.ball.owner e' -1 oppure un intero in
        [0,N-1], e se >=0 il giocatore non e' out>0 (non puo' avere la
        palla chi e' fuori dal campo).
     3. punteggio monotono -- G.score[0]/G.score[1] non diminuiscono mai
        fra due campioni consecutivi.
     4. timeLeft monotono  -- G.timeLeft non cresce mai fra due campioni
        e non e' mai < 0.
     5. durata<=tetto (INV-15) -- la partita raggiunge lo stato 'end'
        entro 13200 fotogrammi (220 s di gioco a taglia 5, LO STESSO tetto
        gia' misurato da _q-cpu-ordine.js per lo stesso scenario CPU-CPU).
        Generalizzato a N semi (di serie 8, vedi --semi).
     6. cronometri-fratelli (LA PIU' A RISCHIO — cinque regressioni pagate
        a mano: #86/#87/#107/#117/#122) -- SUBITO dopo startMatch, prima
        di simulare un solo fotogramma, ogni cronometro della famiglia
        dichiarata NEL GIOCO STESSO e' al suo valore di riposo. La lista
        (letta dai commenti veri, non indovinata):
          G.recT        0     (CALCETTO-il-gioco.html:11103, azzerato in startMatch)
          G.vantaggio   null  (:11018, "I2", voce #107 -- un sentinel con
                                cartellino pendente sopravviveva a startMatch)
          G.possOwner   -1    (:11116, "I QUATTRO CRONOMETRI FRATELLI DI recT")
          G.possT       0     (:11116, idem — aiDecide lo LEGGE)
          G.pulse       0     (:11116, idem)
          G.crowdSndT   0     (:11116, idem)
          G.swLock      [0,0] (:11128, "IL SESTO CRONOMETRO FRATELLO", voce #117 compito 6)
          G.swTimer     [0,0] (:11128, idem)
        NOTA: la lista NON include G.spintaScalino (voce #117 compito 4):
        quel campo riposa a [1,1], non a zero (zero e' GIA' lo scalino di
        riposo, vedi CALCETTO-il-gioco.html:11094-11102) — e' un valore di
        riposo diverso, non un ottavo cronometro di questa stessa famiglia
        dichiarata, e mescolarlo qui avrebbe reso l'invariante o falsa (se
        si pretendesse zero) o taciuta (se si saltasse il controllo senza
        dirlo). Resta fuori, dichiarato, non dimenticato.

   COME SI CAMPIONA. Ogni tick simulato (t.simulate(1/60)), NON
   sottocampionato: a taglia 5 sono solo 10 giocatori, il costo per tick e'
   O(giocatori) e non giustifica saltare fotogrammi (vedi Vincolo globale
   #3 del piano: le invarianti strutturali valgono a ogni taglia, qui si
   misura a taglia 5 di serie — #98, il determinismo e' instabile a
   7/11 — con --taglia per chi vuole forzare la deviazione, dichiarandola).
   La prova 6 si campiona una volta per partita, SUBITO dopo startMatch
   (non e' un invariante-per-tick, e' un invariante-al-fischio).

   L'ORDINE DI setCpuVsCpu (voce #121, seguito #108, chiuso qui dal
   compito #124 su _c3-sorteggi): SEMPRE startMatch PRIMA, setCpuVsCpu(true)
   DOPO in questo banco (il contrario annulla l'intento e la squadra 0
   resta "umana immobile" — sintomo #108/#119). L'UNICA eccezione voluta e'
   `--bugiardo durata`, che inverte l'ordine DI PROPOSITO per riprodurre lo
   scenario-hang #119 e dimostrare che la prova 5 lo condanna.

   IL METODO BUGIARDO (ogni prova nasce rossa). `window.__test.G` e' lo
   STESSO oggetto che il motore usa (non una copia, verificato: e' un
   riferimento vivo esposto in fondo a window.__test, "G, Duel, Tut"):
   per NaN/owner/punteggio/timeLeft basta corrompere G dal banco stesso,
   nessuna patch al gioco serve — e' la "scena sintetica" prevista dal
   piano. Per il cronometro-fratello serve invece un vero bugiardo di
   gioco (l'assenza di un azzeramento in startMatch non si puo' simulare
   da fuori senza patchare il codice che dovrebbe farla): vedi
   strumenti/_crit-inv-cronometri.js, che toglie SOLO l'azzeramento di
   G.swLock e produce fuori/bugiardo-cronometri.html (gitignored, mai
   committato).
     --bugiardo nan         inietta ball.x=NaN a un fotogramma fisso
     --bugiardo owner       inietta G.ball.owner=999 (fuori range)
     --bugiardo punteggio   decrementa G.score[0] di 1
     --bugiardo timeleft    fa risalire G.timeLeft di 5 secondi
     --bugiardo durata      inverte l'ordine setCpuVsCpu/startMatch (hang #119)
   L'INIEZIONE (nan/owner/punteggio/timeleft) avviene DOPO un fotogramma
   normale gia' verificato pulito, e la verifica si ripete SUBITO, SENZA
   un altro t.simulate() in mezzo: si dimostra che il banco vede lo stato
   corrotto, senza chiedere al motore di correre fisica sopra uno stato
   che lui stesso non ha mai prodotto (es. G.players[999] che non esiste
   — rischio di un'eccezione estranea alla prova). Il seme interrotto da
   un'iniezione NON conta come violazione della prova 5 (durata): e'
   un'interruzione voluta, dichiarata, non un hang.
   Con --bugiardo (salvo --semi esplicito) gira UN solo seme: basta a
   dimostrare la condanna, ed e' piu' veloce da rileggere in una revisione.

   uso:  node strumenti/_q-invarianti.js
         node strumenti/_q-invarianti.js --gioco fuori/bugiardo-cronometri.html
         node strumenti/_q-invarianti.js --bugiardo nan
         node strumenti/_q-invarianti.js --bugiardo owner
         node strumenti/_q-invarianti.js --bugiardo punteggio
         node strumenti/_q-invarianti.js --bugiardo timeleft
         node strumenti/_q-invarianti.js --bugiardo durata
         node strumenti/_q-invarianti.js --taglia 5 --seme 20260920 --semi 8
   esce 0 se le sei prove sono verdi, 1 se almeno una e' rossa, 2 se il
   banco stesso e' esploso (pagina, hook mancante, eccezione), 3 se l'uso
   e' sbagliato.
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

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('uso: node strumenti/_q-invarianti.js [--gioco file.html] [--taglia 5] [--seme N] [--semi 8]');
  console.log('                                     [--bugiardo nan|owner|punteggio|timeleft|durata]');
  process.exit(3);
}

const BUGIARDI_NOTI = new Set(['nan', 'owner', 'punteggio', 'timeleft', 'durata']);
const BUGIARDO = arg('bugiardo', '');
if (BUGIARDO && !BUGIARDI_NOTI.has(BUGIARDO)) {
  console.error('USO: --bugiardo deve essere uno fra: ' + [...BUGIARDI_NOTI].join(', '));
  process.exit(3);
}

const SEME_CANTIERE = 20260920;   // la data del piano d'esecuzione del cantiere (voce #125), default del flag --seme
/* VINCOLO #98: il determinismo e' instabile a 7/11, la misura di serie e'
   a taglia 5. Il flag resta per chi vuole forzare la deviazione, dichiarandola. */
const TAGLIA_BANCO = +arg('taglia', 5);
const SEME = +arg('seme', SEME_CANTIERE);
const argSemiEsplicito = process.argv.includes('--semi');
/* Di serie 8 semi (il piano suggerisce 8-10): generalizza la prova 5
   (durata) oltre i due scenari fissi di _q-cpu-ordine.js, e da' alla
   prova 6 (cronometri-fratelli) almeno una seconda partita sulla stessa
   pagina, condizione necessaria perche' una sopravvivenza si veda (la
   primissima partita dopo il caricamento e' gia' a riposo per
   dichiarazione iniziale, azzerata o no da startMatch). In modalita'
   --bugiardo nan/owner/punteggio/timeleft basta UN seme a dimostrare la
   condanna (l'iniezione e' indipendente dal seme): di serie si riduce a 1,
   salvo --semi esplicito.
   --bugiardo durata E' DIVERSO, MISURATO: l'ordine sbagliato NON blocca
   OGNI seme in 'freekick' (la squadra 0 "umana immobile" si incastra solo
   se il gioco la porta a battere una punizione) -- su 20 semi da
   SEME_CANTIERE, 10 su 20 restano incastrati, gli altri 10 raggiungono
   'end' lo stesso (misurato in questo stesso cantiere). Un solo seme
   sarebbe un'estrazione: qui la condanna deve essere ROBUSTA, non un
   colpo di fortuna, quindi durata usa 10 semi di serie anche senza
   --semi esplicito. */
const SEMI_BANCO = argSemiEsplicito ? +arg('semi', 8) : (BUGIARDO === 'durata' ? 10 : (BUGIARDO ? 1 : 8));
/* 220 s di gioco -- lo stesso tetto di sicurezza gia' misurato da
   _q-umore.js e _q-cpu-ordine.js per una partita CPU-CPU a taglia 5. */
const TETTO_FOTOGRAMMI = 13200;
/* Il fotogramma dell'iniezione per i bugiardi nan/owner/punteggio/
   timeleft: 150 = 2,5 s, ben oltre il kickoff piu' lungo (stesso ordine
   di grandezza del CARTELLINO_FRAME=120 di _q-umore.js), cosi' la scena
   e' gia' 'play' con ball/players popolati e in moto. */
const INIETTA_AL_FRAME = 150;

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
const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '\n         ' + det : '')); };

/* =========================================================================
   LA SONDA -- gira dentro la pagina, in UN SOLO page.evaluate: come ogni
   banco di casa, nessun rumore di rete fra un fotogramma e l'altro. */
const SONDA = (cfg) => {
  const t = window.__test;
  const r = {
    nan: [], owner: [], punteggio: [], timeLeft: [], durata: [], cronometri: [],
    semiAbortitiDaViolazione: [], semiEseguiti: 0, tickTotali: 0,
  };
  const CAMPI_BALL = ['x', 'y', 'z', 'vx', 'vy', 'vz'];
  const CAMPI_P = ['x', 'y', 'vx', 'vy', 'aiTX', 'aiTY'];

  for (let k = 0; k < cfg.semi; k++) {
    const seme = cfg.seme0 + k;
    t.semina(seme);

    /* L'ORDINE (vedi la lettera di testa): giusto di serie, invertito
       SOLO per --bugiardo durata, e per TUTTI i semi di quella corsa —
       lo scenario-hang #119 non dipende dal seme. */
    if (cfg.ordineSbagliato) {
      t.setCpuVsCpu(true);
      t.startMatch(1, 1, { size: cfg.taglia });
    } else {
      t.startMatch(1, 1, { size: cfg.taglia });
      t.setCpuVsCpu(true);
    }

    /* PROVA 6 -- CRONOMETRI-FRATELLI, SUBITO dopo startMatch. */
    const G = t.G;
    const guasti = [];
    if (G.recT !== 0) guasti.push('G.recT=' + G.recT + ' (atteso 0)');
    if (G.vantaggio !== null) guasti.push('G.vantaggio=' + JSON.stringify(G.vantaggio) + ' (atteso null)');
    if (!(G.possOwner === -1)) guasti.push('G.possOwner=' + G.possOwner + ' (atteso -1)');
    if (!(G.possT === 0)) guasti.push('G.possT=' + G.possT + ' (atteso 0)');
    if (!(G.pulse === 0)) guasti.push('G.pulse=' + G.pulse + ' (atteso 0)');
    if (!(G.crowdSndT === 0)) guasti.push('G.crowdSndT=' + G.crowdSndT + ' (atteso 0)');
    if (!(G.swLock[0] === 0 && G.swLock[1] === 0)) guasti.push('G.swLock=' + JSON.stringify(G.swLock) + ' (atteso [0,0])');
    if (!(G.swTimer[0] === 0 && G.swTimer[1] === 0)) guasti.push('G.swTimer=' + JSON.stringify(G.swTimer) + ' (atteso [0,0])');
    if (guasti.length) r.cronometri.push({ seme, indiceMatch: k, guasti });

    let prevScore = [G.score[0], G.score[1]];
    let prevTimeLeft = G.timeLeft;

    const verificaTick = (fotogramma, fase) => {
      let violato = false;
      const b = G.ball;
      for (const kk of CAMPI_BALL) {
        if (!Number.isFinite(b[kk])) { r.nan.push({ seme, fotogramma, fase, chi: 'ball.' + kk, val: b[kk] }); violato = true; }
      }
      for (let i = 0; i < G.players.length; i++) {
        const p = G.players[i];
        for (const kk of CAMPI_P) {
          if (!Number.isFinite(p[kk])) { r.nan.push({ seme, fotogramma, fase, chi: 'p' + i + '.' + kk + ' (' + p.role + ')', val: p[kk] }); violato = true; }
        }
      }
      const owner = G.ball.owner;
      const ownerOk = owner === -1 || (Number.isInteger(owner) && owner >= 0 && owner < G.players.length && !(G.players[owner].out > 0));
      if (!ownerOk) { r.owner.push({ seme, fotogramma, fase, owner, nGiocatori: G.players.length }); violato = true; }

      if (G.score[0] < prevScore[0] || G.score[1] < prevScore[1]) {
        r.punteggio.push({ seme, fotogramma, fase, prima: prevScore.slice(), dopo: G.score.slice() }); violato = true;
      }
      prevScore = [G.score[0], G.score[1]];

      if (G.timeLeft > prevTimeLeft + 1e-9 || G.timeLeft < 0) {
        r.timeLeft.push({ seme, fotogramma, fase, prima: prevTimeLeft, dopo: G.timeLeft }); violato = true;
      }
      prevTimeLeft = G.timeLeft;
      return violato;
    };

    let fotogrammi = 0, raggiuntoEnd = false, violatoQuiSeme = false;
    for (; fotogrammi < cfg.tetto; fotogrammi++) {
      t.simulate(1 / 60);
      r.tickTotali++;
      if (verificaTick(fotogrammi, 'normale')) { violatoQuiSeme = true; break; }

      if (cfg.bugiardo && k === 0 && cfg.bugiardo !== 'durata' && fotogrammi === cfg.iniettaAlFrame) {
        /* L'INIEZIONE -- vedi la lettera di testa: si corrompe G (lo
           stesso oggetto vivo del motore), poi si richiama verificaTick
           UNA volta, SENZA un altro simulate() in mezzo. */
        if (cfg.bugiardo === 'nan') G.ball.x = NaN;
        else if (cfg.bugiardo === 'owner') G.ball.owner = 999;
        else if (cfg.bugiardo === 'punteggio') {
          /* PER FAR SCENDERE UN PUNTEGGIO SERVE PRIMA UN VALORE VERO DA
             FAR SCENDERE: a inizio partita G.score e' spesso ancora
             [0,0], e un decremento clampato a 0 (Math.max(0,-1)) non
             cambierebbe nulla -- il bugiardo condannerebbe la prova
             SBAGLIATA (5, durata: il seme si fermerebbe senza violazione
             vera, e verrebbe letto come un hang). Si sale di proposito
             (lecito, non viola nulla: sale) per avere un campione fresco,
             poi si scende sotto QUEL campione. */
          G.score[0] = G.score[0] + 3;
          verificaTick(fotogrammi, 'iniettato-salita-lecita');
          G.score[0] = G.score[0] - 1;
        }
        else if (cfg.bugiardo === 'timeleft') G.timeLeft = G.timeLeft + 5;
        if (verificaTick(fotogrammi, 'iniettato')) violatoQuiSeme = true;
        break;
      }

      if (t.state === 'end') { raggiuntoEnd = true; break; }
    }

    /* PROVA 5 -- DURATA<=TETTO. Un seme interrotto DI PROPOSITO da
       un'iniezione (bugiardo nan/owner/punteggio/timeleft) non e' un
       hang: si dichiara ESCLUSO, non lo si fa passare per una violazione
       che non e'. Lo scenario --bugiardo durata invece DEVE contare qui
       (e' esattamente cio' che deve condannare). */
    if (!raggiuntoEnd) {
      if (violatoQuiSeme && cfg.bugiardo && cfg.bugiardo !== 'durata') {
        r.semiAbortitiDaViolazione.push({ seme, motivo: cfg.bugiardo });
      } else {
        r.durata.push({ seme, fotogrammi, statoFinale: t.state });
      }
    }
    r.semiEseguiti++;
  }
  return r;
};

(async () => {
  const provaRel = arg('gioco', '');
  const provaAbs = provaRel ? path.resolve(RADICE, provaRel) : '';
  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(semeFisso, SEME);
  const ecc = []; pag.on('pageerror', e => ecc.push(e.message));

  console.log('\n=== IL BANCO DELLE INVARIANTI (voce #125) ===  ' +
    (provaAbs || 'CALCETTO-il-gioco.html (repo)') + '  taglia ' + TAGLIA_BANCO +
    '  seme ' + SEME + '  semi ' + SEMI_BANCO + (BUGIARDO ? '  bugiardo=' + BUGIARDO : ''));

  try {
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(({ seme }) => {
      const t = window.__test;
      t.semina(seme);
      t.dismissSplash && t.dismissSplash();
      if (t.save) t.save.tutorialDone = 1;
    }, { seme: SEME });

    const r = await pag.evaluate(`(${SONDA})(${JSON.stringify({
      taglia: TAGLIA_BANCO, seme0: SEME, semi: SEMI_BANCO, tetto: TETTO_FOTOGRAMMI,
      bugiardo: BUGIARDO, iniettaAlFrame: INIETTA_AL_FRAME, ordineSbagliato: BUGIARDO === 'durata',
    })})`);

    const primi = (arr, n, f) => arr.slice(0, n).map(f).join('\n         ') + (arr.length > n ? '\n         … e altri ' + (arr.length - n) : '');

    di(r.nan.length === 0, '1. NaN/Infinity -- ball.{x,y,z,vx,vy,vz} e p.{x,y,vx,vy,aiTX,aiTY} sempre finiti',
      r.nan.length === 0 ? r.tickTotali + ' fotogrammi campionati su ' + r.semiEseguiti + ' semi, nessun NaN/Infinity'
        : primi(r.nan, 5, v => 'seme ' + v.seme + ' fotogramma ' + v.fotogramma + ' (' + v.fase + '): ' + v.chi + '=' + v.val));

    di(r.owner.length === 0, '2. owner valido -- G.ball.owner e\' -1 oppure 0..N-1, e se >=0 il giocatore non e\' out>0',
      r.owner.length === 0 ? r.tickTotali + ' fotogrammi campionati, owner sempre valido'
        : primi(r.owner, 5, v => 'seme ' + v.seme + ' fotogramma ' + v.fotogramma + ' (' + v.fase + '): owner=' + v.owner + ' (N=' + v.nGiocatori + ')'));

    di(r.punteggio.length === 0, '3. punteggio monotono -- G.score non diminuisce mai fra due campioni',
      r.punteggio.length === 0 ? r.tickTotali + ' fotogrammi campionati, punteggio sempre non decrescente'
        : primi(r.punteggio, 5, v => 'seme ' + v.seme + ' fotogramma ' + v.fotogramma + ' (' + v.fase + '): ' + v.prima.join('-') + ' -> ' + v.dopo.join('-')));

    di(r.timeLeft.length === 0, '4. timeLeft monotono -- G.timeLeft non cresce mai fra due campioni e non e\' mai < 0',
      r.timeLeft.length === 0 ? r.tickTotali + ' fotogrammi campionati, timeLeft sempre non crescente e >=0'
        : primi(r.timeLeft, 5, v => 'seme ' + v.seme + ' fotogramma ' + v.fotogramma + ' (' + v.fase + '): ' + v.prima.toFixed(3) + ' -> ' + v.dopo.toFixed(3)));

    let detDurata;
    if (r.durata.length === 0) {
      detDurata = r.semiEseguiti + ' semi, tutte le partite non escluse hanno raggiunto \'end\' entro ' + TETTO_FOTOGRAMMI + ' fotogrammi';
      if (r.semiAbortitiDaViolazione.length) detDurata += ' (' + r.semiAbortitiDaViolazione.length + ' semi esclusi: interrotti di proposito da --bugiardo ' + BUGIARDO + ', non un hang)';
    } else {
      detDurata = primi(r.durata, 5, v => 'seme ' + v.seme + ': ' + v.fotogrammi + ' fotogrammi, stato finale \'' + v.statoFinale + '\' (non ha raggiunto \'end\')');
    }
    di(r.durata.length === 0, '5. durata<=tetto (INV-15) -- ogni partita raggiunge \'end\' entro ' + TETTO_FOTOGRAMMI + ' fotogrammi (220 s)', detDurata);

    di(r.cronometri.length === 0, '6. cronometri-fratelli -- recT/vantaggio/possOwner/possT/pulse/crowdSndT/swLock/swTimer al riposo subito dopo startMatch',
      r.cronometri.length === 0 ? r.semiEseguiti + ' partite (stessa pagina), tutti i cronometri a riposo a ogni startMatch'
        : primi(r.cronometri, 5, v => 'seme ' + v.seme + ' (partita #' + v.indiceMatch + ' sulla pagina): ' + v.guasti.join(', ')));

    if (ecc.length) di(false, 'BANCO -- nessuna eccezione di pagina', 'eccezione: ' + ecc[0]);
  } catch (e) {
    console.error('FALLITO: ' + e.message);
    await browser.close(); srv.chiudi();
    process.exit(2);
  }

  await ctx.close(); await browser.close(); srv.chiudi();
  const rossi = esiti.filter(v => !v).length;
  console.log('\n' + (esiti.length - rossi) + ' prove su ' + esiti.length + ' -- ' + (rossi ? 'CANCELLO ROSSO' : 'CANCELLO VERDE'));
  process.exit(rossi ? 1 : 0);
})();
