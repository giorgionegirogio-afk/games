/* =====================================================================
   _t-duello-nastro.js — IL BANCO CHE CONDANNA IL NASTRO MUTO
   (voce #131, compito 1; mandato S13.3: «ogni bug ha prima un test
   fallito»). Nasce ROSSO, diventa verde al compito 5.

   IL DIFETTO. Le tre decisioni del duello dal dischetto — pickZone,
   stopPower, pickKeeper — arrivano da pointer appesi all'elemento #duel
   (CALCETTO-il-gioco.html:22698-22735) e da un click su #powerWrap
   (:22736-22738): nessuno dei due passa dalle quattro porte che il
   registratore avvolge (:43489-43522). Il nastro di una sfida passata
   dal dischetto NON contiene quei comandi. Oggi il gioco lo dichiara
   con un marchio (Reg.scrivi(5,[]) a :22657) e il replay si ferma
   (fermaReplayAlDischetto, :43399): due ripieghi onesti, ma il giudice
   differito dell'onda D non potrebbe verificare proprio le partite
   decise dal dischetto — e sono fra il 43% e il 100% delle sfide
   (misurato nel dossier).

   IL BANCO. Una serie di rigori a seme fisso, in modalita' un
   giocatore (G.cpu = [false,true]: come MISURATO, ogni duello di una
   sfida ha un umano dentro, 169/169). Le tre decisioni umane le da'
   un COPIONE deterministico: si chiamano dal banco a un numero fisso
   di aggiornamenti dall'inizio del duello — un dito che cade sempre
   nello stesso punto, che e' l'unico modo di rendere ripetibile un
   percorso che dal vivo non lo e'.

   PERCHE' IL COPIONE CHIAMA LE FUNZIONI INVECE DI TOCCARE LO SCHERMO.
   Un banco a tocchi reali via CDP non e' ripetibile (regola di casa) e
   qui la ripetibilita' non e' un lusso: la prova C confronta due
   esecuzioni numero per numero. Le funzioni chiamate dal banco entrano
   dalle stesse porte da cui entrera' il dito vero — e' esattamente il
   punto in cui il compito 4 le avvolgera'.

   LE TRE PROVE.
     A) il nastro NON porta il marchio di tipo 5 («io sono incompleto»).
        Oggi lo porta: ROSSO.
     B) il nastro porta righe di tipo 6, i comandi del duello.
        Oggi il tipo 6 non esiste: ROSSO.
     C) la serie rigiocata da' gli STESSI esiti, duello per duello, e lo
        stesso punteggio. Oggi la rilettura non ha nessun dito: il duello
        resta appeso in fase 'zone' per sempre (nel gioco vero lo
        raccoglie fermaReplayAlDischetto, che qui non si arma perche' non
        c'e' nessuna sfida di rete). ROSSO.

   IL CONTROLLO CHE RENDE LE TRE PROVE NON VUOTE: la registrazione deve
   aver prodotto almeno quattro duelli veri, col copione che ha davvero
   toccato. Un confronto fra due liste vuote sarebbe un verde bugiardo.

   QUESTO BANCO NON COPRE LA QUANTIZZAZIONE DELLA MIRA (dichiarato, 21
   settembre 2026, voce #131, correzione di revisione): il COPIONE qui
   sotto porta u,v gia' a TRE decimali, quindi la quantizzazione a un
   millesimo del compito 3 (duelMira) e' invisibile a questo banco — la
   copre strumenti/_t-duello-tacca.js.

   uso:  node strumenti/_t-duello-nastro.js
         node strumenti/_t-duello-nastro.js --gioco fuori/crit-duello-passo.html
   esce 0 verde, 1 il gioco e' rosso, 2 il banco e' esploso.
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
const GIOCO = arg('gioco', process.env.GIOCO_PROVA || 'CALCETTO-il-gioco.html');
const SEME = +arg('seme', 20260921);
const TAGLIA = 5, MAXF = 24000;

/* lo stesso copione dell'impronta, perche' due banchi che guardano lo
   stesso oggetto con due righelli diversi confondono chi legge */
const COPIONE = {
  passoZone: 30, passoPower: 45, attesaKeeper: 15,
  mire: [
    { z: 0, u: -0.731, v: 0.343 },
    { z: 2, u: 0.810, v: 0.629 },
    { z: 1, u: 0.112, v: 0.487 },
    { z: 2, u: 1.046, v: 0.251 },
    { z: 0, u: -1.119, v: 0.714 },
    { z: 1, u: -0.294, v: 0.551 },
  ],
  tuffi: [1, 0, 2, 2, 1, 0],
};

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

/* =====================================================================
   UN GIRO, DENTRO LA PAGINA. `cop` acceso = si registra col copione;
   `cop` spento = si rigioca e non tocca nessuno.
   ===================================================================== */
function unGiro({ seme, taglia, maxf, cop, copione, nastro }) {
  const t = window.__test;
  t.fermaRegistro && t.fermaRegistro();
  /* il salvataggio si rimette com'era all'apertura: la rosa cresce fra
     una partita e l'altra, e senza questo la partita registrata e quella
     rigiocata non partirebbero dallo stesso punto (lezione di
     _q-replay.js) */
  for (const k of Object.keys(t.save)) if (!(k in window.__save0)) delete t.save[k];
  for (const k in window.__save0) t.save[k] = JSON.parse(JSON.stringify(window.__save0[k]));
  if (typeof Reg !== 'undefined') Reg.azzeraComandi();

  if (nastro) t.rigioca(nastro); else t.registra();
  t.semina(seme);
  t.startMatch(1, 1, { size: taglia, sponde: 'gabbia', miraGuidata: 'pieno' });
  t.rigori();

  const duelli = [];
  let toccate = 0;
  let nD = 1, passo = 0, fasePrec = Duel.phase, faseCorr = Duel.phase, passoFase = 0;
  let fattoZone = false, fattoPower = false, fattoKeeper = false, vistoRes = false;
  let f = 0;
  for (; f < maxf && t.state !== 'end'; f++) {
    t.simulate(1 / 60);
    const ph = Duel.phase;
    const nuovo = (ph === 'zone' && fasePrec !== 'zone');
    fasePrec = ph;
    if (nuovo) {
      nD++; passo = 0; faseCorr = ph; passoFase = 0;
      fattoZone = fattoPower = fattoKeeper = vistoRes = false;
      continue;
    }
    if (ph === 'off') continue;
    passo++;
    if (ph !== faseCorr) { faseCorr = ph; passoFase = passo; }

    if (cop) {
      const m = copione.mire[(nD - 1) % copione.mire.length];
      if (!fattoZone && ph === 'zone' && Duel.shooterHuman && passo >= copione.passoZone) {
        fattoZone = true; toccate++; Duel.pickZone(m.z, m.u, m.v);
      } else if (!fattoPower && Duel.phase === 'power' && Duel.shooterHuman && passo >= copione.passoPower) {
        fattoPower = true; toccate++; Duel.stopPower();
      } else if (!fattoKeeper && Duel.phase === 'wait' && Duel.keeperHuman && Duel.keeperZone < 0 &&
                 (passo - passoFase) >= copione.attesaKeeper) {
        fattoKeeper = true; toccate++; Duel.pickKeeper(copione.tuffi[(nD - 1) % copione.tuffi.length]);
      }
    }

    if (Duel.phase === 'result' && !vistoRes) {
      vistoRes = true;
      duelli.push({
        n: nD, passo, esito: Duel.outcome,
        cursor: +Duel.cursor.toFixed(5), powerQ: +Duel.powerQ.toFixed(5),
        z: Duel.zone, kz: Duel.keeperZone, mirato: !!Duel.mirato,
        aimU: +Duel.aimU.toFixed(5), aimV: +Duel.aimV.toFixed(5),
      });
    }
  }
  const out = {
    duelli, toccate, fotogrammi: f, stato: t.state,
    punteggio: [G.score[0], G.score[1]], sorteggi: t.sorteggi,
    /* APPESO: il duello e' rimasto aperto e la partita non e' finita.
       Nel gioco vero lo raccoglie fermaReplayAlDischetto; qui non si
       arma perche' non c'e' nessuna sfida di rete, e l'attesa si vede
       nuda — che e' il punto. */
    appeso: (Duel.phase !== 'off' && t.state !== 'end'),
    fase: Duel.phase,
  };
  if (!nastro) { out.nastro = t.nastro(); out.righe = t.registroRighe; }
  t.fermaRegistro();
  return out;
}

/* i tipi delle righe si leggono dal TESTO del nastro: un banco che
   guardasse Reg.righe leggerebbe la memoria invece di cio' che viaggia */
function tipiDelNastro(testo) {
  const p = String(testo).split('|');
  const pezzi = (p.length >= 4 ? p[3] : p[2]) || '';
  const conto = {};
  for (const pz of pezzi.split(';')) {
    if (!pz) continue;
    const tp = pz.split(',')[1];
    conto[tp] = (conto[tp] || 0) + 1;
  }
  return conto;
}

const esiti = [];
const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '\n         ' + det : '')); };

/* =====================================================================
   IL CAMPO `passo` NON SI CONFRONTA, E VA SPIEGATO INVECE CHE NASCOSTO
   (stessa ragione, stessa forma, in _t-duello-rigioca.js).

   `passo` qui e' il fotogramma in cui QUESTO BANCO ha visto il duello
   entrare in 'result'. Dal vivo il dito cade FRA due aggiornamenti: il
   banco chiama stopPower dopo simulate(), la risoluzione avviene alla
   fine del fotogramma k e il banco la vede al fotogramma k. In rilettura
   lo stesso comando parte all'INIZIO dell'aggiornamento k+1 — l'unico
   istante in cui il cursore vale ancora esattamente k passi, che e'
   tutto il punto della cura — e il banco la vede al fotogramma k+1.

   E' uno sfasamento dell'OSSERVATORE, non del gioco. La prova che lo e'
   sta accanto: cursore, powerQ, terzi, mira ed esito devono coincidere
   alla cifra. Se lo sfasamento fosse del gioco, il cursore sarebbe
   diverso di 0,01917 — ed e' esattamente cio' che il mutante
   _crit-duello-scarto.js fa vedere.
   ===================================================================== */
const CAMPI_SFASABILI = ['passo'];

function primoScarto(a, b) {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    for (const k of Object.keys(a[i])) {
      if (a[i][k] !== b[i][k] && !CAMPI_SFASABILI.includes(k))
        return 'duello ' + (i + 1) + ', campo ' + k + ': ' + a[i][k] + ' -> ' + b[i][k];
    }
  }
  if (a.length !== b.length) return 'la serie ha ' + a.length + ' duelli registrati e ' + b.length + ' rigiocati';
  const sf = a.map((d, i) => b[i].passo - d.passo);
  if (!sf.every(v => v === 0 || v === 1))
    return 'lo sfasamento dell\'osservatore non e\' 0 o +1: ' + sf.join(',');
  return null;
}

(async () => {
  const srv = await servi();
  let browser, reg, rip;
  try {
    browser = await chromium.launch();
    const apri = async () => {
      const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
      const pag = await ctx.newPage();
      await pag.addInitScript(semeFisso, SEME);
      const ecc = []; pag.on('pageerror', e => ecc.push(e.message));
      await pag.goto(`http://127.0.0.1:${srv.porta}/${GIOCO}`, { waitUntil: 'load' });
      await pag.waitForFunction('window.__test !== undefined', null, { timeout: 30000 });
      await pag.evaluate(() => {
        const t = window.__test;
        t.dismissSplash && t.dismissSplash();
        if (t.save) t.save.tutorialDone = 1;
        window.__save0 = JSON.parse(JSON.stringify(t.save));
      });
      return { ctx, pag, ecc };
    };

    console.log('=== IL DUELLO ENTRA NEL NASTRO — il banco che condanna (voce #131) ===');
    console.log('    gioco ' + GIOCO + ', seme ' + SEME + ', taglia ' + TAGLIA + ', serie dal dischetto');

    const A = await apri();
    reg = await A.pag.evaluate(new Function('p', 'return (' + unGiro.toString() + ')(p)'),
      { seme: SEME, taglia: TAGLIA, maxf: MAXF, cop: true, copione: COPIONE, nastro: null });
    const B = await apri();
    rip = await B.pag.evaluate(new Function('p', 'return (' + unGiro.toString() + ')(p)'),
      { seme: SEME, taglia: TAGLIA, maxf: MAXF, cop: false, copione: COPIONE, nastro: reg.nastro });
    if (A.ecc.length || B.ecc.length) {
      console.error('FALLITO (banco): eccezione di pagina: ' + (A.ecc[0] || B.ecc[0]));
      await browser.close(); srv.chiudi(); process.exit(2);
    }
    await A.ctx.close(); await B.ctx.close();
  } catch (e) {
    console.error('FALLITO (banco): ' + e.message);
    if (browser) await browser.close();
    srv.chiudi(); process.exit(2);
  }
  await browser.close(); srv.chiudi();

  const tipi = tipiDelNastro(reg.nastro);
  console.log('  REGISTRATO: ' + reg.duelli.length + ' duelli [' + reg.duelli.map(d => d.esito[0]).join('') + '], ' +
    reg.punteggio.join('-') + ', ' + reg.toccate + ' decisioni umane, ' + reg.righe + ' righe nel nastro');
  console.log('              tipi di riga: ' + Object.keys(tipi).sort().map(k => k + '=' + tipi[k]).join(' '));
  console.log('  RIGIOCATO:  ' + rip.duelli.length + ' duelli [' + rip.duelli.map(d => d.esito[0]).join('') + '], ' +
    rip.punteggio.join('-') + ', ' + rip.fotogrammi + ' fotogrammi' + (rip.appeso ? ', APPESO in fase \'' + rip.fase + '\'' : ''));

  /* il controllo che rende le tre prove non vuote */
  di(reg.duelli.length >= 4 && reg.toccate >= 6,
    'CONTROLLO) la registrazione ha prodotto duelli veri, col copione che ha toccato',
    reg.duelli.length + ' duelli, ' + reg.toccate + ' decisioni umane' +
    (reg.duelli.length >= 4 && reg.toccate >= 6 ? '' : ' — SENZA QUESTO le tre prove qui sotto non provano niente'));

  di(!tipi['5'],
    'A) il nastro non porta il marchio di tipo 5 («io sono incompleto»)',
    tipi['5'] ? tipi['5'] + ' righe di tipo 5: il nastro dichiara da se\' di non bastare, e Sfida.guarda lo rifiuta a :43140'
              : 'nessun marchio: il nastro dichiara di bastare');

  di((tipi['6'] | 0) >= 2 * reg.duelli.length ? true : (tipi['6'] | 0) > 0,
    'B) il nastro porta i comandi del duello (tipo 6)',
    (tipi['6'] | 0) + ' righe di tipo 6 per ' + reg.toccate + ' decisioni umane' +
    ((tipi['6'] | 0) === 0 ? ' — il tipo 6 non esiste ancora' : ''));

  if ((tipi['6'] | 0) > 0) {
    di((tipi['6'] | 0) === reg.toccate,
      'B bis) una riga di tipo 6 per ogni decisione umana, ne\' una di piu\' ne\' una di meno',
      (tipi['6'] | 0) + ' righe contro ' + reg.toccate + ' decisioni' +
      ((tipi['6'] | 0) > reg.toccate ? ' — ce ne sono DI PIU\': il motore sta registrando anche le proprie chiamate (trappola B)' : ''));
  }

  const scarto = primoScarto(reg.duelli, rip.duelli);
  di(scarto === null && !rip.appeso &&
     reg.punteggio[0] === rip.punteggio[0] && reg.punteggio[1] === rip.punteggio[1],
    'C) la serie rigiocata e\' la stessa, esito per esito e punteggio',
    rip.appeso ? 'il replay e\' rimasto APPESO in fase \'' + rip.fase + '\' dopo ' + rip.fotogrammi +
                 ' fotogrammi: nessun dito arrivera\' mai'
               : (scarto || (reg.punteggio.join('-') + ' contro ' + rip.punteggio.join('-'))));

  const rossi = esiti.filter(v => !v).length;
  console.log('\n' + (esiti.length - rossi) + ' prove su ' + esiti.length + ' — ' +
    (rossi ? 'ROSSO: il duello non entra nel nastro (o la cura non basta)' : 'VERDE: il duello entra nel nastro e si rigioca'));
  process.exit(rossi ? 1 : 0);
})();
