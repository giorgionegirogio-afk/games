/* =====================================================================
   _q-umore.js -- IL BANCO DEL MIND (voce #117), NATO ROSSO.

   IL PERCHE'. Il cantiere #117 porta a codice il modello emotivo (MIND
   v1): il registro dei fatti (compito 1), poi gli stati umore/nervi/
   spinta (compito 2), il canale di gioco (compito 3), i canali d'occhio
   (compito 4) e le prove che condannano (compito 5). Questo file nasce
   al compito 1 con la SOLA prova REGISTRO e cresce compito per compito
   (STATI al 2, CANALE+TETTI al 3, TESTIMONE al 4), sul telaio di casa:
   server locale, seme fisso da _posa.js, taglia 5 (#98: il determinismo
   e' instabile a 7/11, si misura a 5), CPU-CPU, t.simulate(1/60) a passo
   fisso, codici d'uscita di casa (0 verde, 1 rosso, 2 banco esploso, 3
   uso).

   PROVA REGISTRO (compito 1). G.fatti e' un buffer PASSIVO che trascrive
   eventi gia' decisi dal gioco (vedi strumenti/_t-registro-fatti.js per
   i 14 siti di emissione). Si guida una partita CPU-CPU a seme fisso,
   taglia 5, fino a fine tempo, e si verifica:
     (a) a inizio partita G.fatti e' vuoto;
     (b) OGNI fatto ha lo schema completo: che stringa non vuota, chi
         intero (-1 o un indice valido di G.players), dove una coppia di
         numeri finiti, t un numero finito, esito un oggetto;
     (c) per gli eventi che il gioco GIA' conta altrove (G.stats/score),
         il conteggio dei fatti COMBACIA esattamente col contatore vero:
           rubata      <-> somma G.stats.rubate
           fallo       <-> somma G.stats.falli
           giallo+espulsione <-> somma G.stats.gialli (ogni chiamata a
                          infliggiCartellino incrementa gialli una volta
                          sola, e produce SEMPRE uno dei due che, mai
                          tutti e due)
           espulsione  <-> somma G.stats.espulsi
           gol+autorete <-> somma dello score finale
           presa+pugni+sfugge+respinta <-> somma G.stats.parate (ogni
                          tiro che supera la retropassaggio-embargo in
                          tentaPresa incrementa parate UNA volta e cade
                          in esattamente uno dei quattro rami)
           cambio      <-> somma G.cambi (letto da G bare, t.G.cambi)
           acciacco    <-> somma G.stats.acciacchi
         legno, rigore e parata (il duello) NON hanno un contatore
         gemello nel gioco di oggi (nessuna prova naturale in
         un'amichevole a tempo pieno raggiunge la serie di rigori): si
         valida solo lo SCHEMA di quel che compare, e il conteggio si
         STAMPA, mai un sì/no inventato.

   NASCE ROSSO SUL GIOCO DI IERI (dichiarato, non attestato): su
   `git show f352af5:CALCETTO-il-gioco.html` G.fatti non esiste --
   window.__test.G.fatti e' undefined, e la prova deve dirlo con un
   guasto leggibile, non con un'eccezione cieca.

   PROVA STATI (compito 2). p.umore (-1..+1), p.nervi (0..1) per
   giocatore, G.spinta[team] (-1..+1) per squadra: OSSERVAZIONE PURA,
   derivata dai fatti, zero dado() (vedi strumenti/_t-stati-mind.js). Si
   riusa la STESSA partita della prova REGISTRO (un solo giro) e si
   verifica: la superficie esiste; a inizio partita tutti gli stati sono
   zero; dopo ogni gol/autorete lo scorer ha umore>0 (l'autore
   dell'autorete umore<0) e la squadra beneficiaria ha spinta>0; dopo un
   CARTELLINO FORZATO (t.cartellino(0), un hook di QA gia' esistente --
   il seme di casa non ne produce uno spontaneo qui) l'ammonito ha
   nervi>0; gli stati restano nei loro intervalli (clamp) per l'intera
   partita, mai NaN/Infinity. NASCE ROSSA SUL GIOCO DEL COMPITO 1
   (`fuori/base2.html` = `git show cb23512:CALCETTO-il-gioco.html`): gli
   stati non esistono, 0-stati lo dice con un guasto leggibile.
   IL DETERMINISMO DEGLI STATI (VINCOLO #4) non e' qui: e' in
   strumenti/_q-determinismo.js, che confronta gia' un'IMPRONTA condivisa
   da tutte le sue quattro prove (A/B/C/D) -- estenderla LI' (un solo
   punto) rende l'invariante consapevole degli stati ovunque, invece di
   una prova ad hoc in questo file che ne vedrebbe solo un angolo.

   PROVA CANALE (compito 3). manopolaDi(p) modula PER GIOCATORE le tre
   manopole di manopoleDi(p.team), DOPO il carattere (vedi
   strumenti/_t-canale-mind.js). Non serve una partita intera: si avvia
   una partita CPU-CPU a seme fisso (per avere G.players/G.knob popolati)
   e si forza lo stato con la superficie di test (t.setUmore/setNervi/
   setSpinta), leggendo t.manopolaDi(idx) contro t.manopoleDi(team). Si
   verifica: (0) la superficie esiste; (a) a stati zero manopolaDi(p) ha
   GLI STESSI VALORI di manopoleDi(p.team) -- il neutro esatto (la
   garanzia dell'INDIRIZZO identico e' una proprieta' del codice, non
   osservabile da qui: il confine page.evaluate serializza sempre un
   oggetto nuovo, vedi il dubbio dichiarato nel rapporto del compito 3);
   (b) umore=+1 ABBASSA passErr, esattamente base/(1+0.15*1); (c)
   nervi=+1 ALZA slideP, esattamente base*(1+0.25*1); (d) spinta=+1
   ABBASSA standoff, esattamente base*(1-0.12*1) (o resta 0 se il
   carattere ha gia' standoff=0: l'effetto li' e' invisibile, dichiarato
   dal progetto). NASCE ROSSA SUL GIOCO DEL COMPITO 2 (`fuori/base3.html`
   = `git show 53007c5:CALCETTO-il-gioco.html`): manopolaDi non esiste,
   0-canale lo dice con un guasto leggibile.

   PROVA TETTI (compito 3). Su N=5 partite CPU-CPU a seme fisso, taglia
   di casa, si campiona manopolaDi(idx) di OGNI giocatore ogni 30
   fotogrammi (mezzo secondo) e si verifica che nessun campo superi il
   tetto dichiarato: passErr entro +-15% (lo scarto e' |base/mod-1|, che
   per costruzione vale 0.15*|umore| e non supera mai 0.15 perche' umore
   e' clampato a +-1), slideP entro +25% (scarto mod/base-1 = 0.25*nervi,
   nervi clampato 0..1), standoff entro il fattore 0.12 (scarto
   1-mod/base = 0.12*spinta, spinta clampata +-1). IL MASSIMO SCARTO
   OSSERVATO SI STAMPA SEMPRE, mai un si/no cieco. NASCE ROSSA SULLA
   STESSA fuori/base3.html della prova CANALE.

   PROVA TESTIMONE (compito 4). I due canali d'occhio (mesto dai fatti,
   folla+banner sulla spinta) DISEGNO/AUDIO puri, vedi la lettera di testa
   di strumenti/_t-occhio-mind.js. Sulla STESSA partita di REGISTRO/STATI:
   (a) un cartellino forzato deve accendere mesto sull'ammonito se nessun
   compagno era gia' mesto ("un uomo per volta per squadra"); (b) ogni
   salita di scalino di G.spinta (tracciata indipendentemente dal test)
   deve avere un banner "TESTA ALTA"/"CI CREDONO" O la folla misurata
   sopra il livello base (Audio5.crowdLevel intercettata per registrare
   il valore vero, non riletta da uno stato). NASCE ROSSA SUL GIOCO DEL
   COMPITO 3 (`fuori/base4.html` = `git show 8824222:CALCETTO-il-gioco.html`):
   G.spintaScalino non esiste la', 0-testimone lo dice con un guasto
   leggibile.

   PROVA NIENTE-FALSI-BANNER (correzione di revisione, compito 4). La
   revisione ha trovato che scalinoDiSpinta(0)===1 (lo zero e' il bucket
   di riposo) ma G.spintaScalino partiva a [0,0]: al primo fotogramma di
   scena 'play' (spinta ancora a zero, nessun fatto) "TESTA ALTA"
   compariva ad OGNI fischio d'inizio — un banner bugiardo. Su una partita
   FRESCA dal kickoff, per i primi 3 s di 'play' con lo stato ancora
   perfettamente neutro (G.spinta=[0,0] e G.fatti vuoto), non deve
   comparire nessun banner di scalino. Legge l'EFFETTO OSSERVABILE VERO
   (t.G.banner/t.G.bannerT), non una reimplementazione dello scalino: un
   banco che ricalcolasse la stessa formula/lo stesso [0,0] erediterebbe
   il bug e non lo vedrebbe mai. NASCE ROSSA SUL COMMIT DEL COMPITO 4 COL
   BUG (`fuori/base4b.html` = `git show b5f0858:CALCETTO-il-gioco.html`).

   uso:  node strumenti/_q-umore.js
         node strumenti/_q-umore.js --gioco fuori/base.html
         node strumenti/_q-umore.js --taglia 5 --seme 20260919
   esce 0 se la prova e' verde, 1 se rossa, 2 se il banco stesso e'
   esploso (pagina, hook mancante, eccezione), 3 se l'uso e' sbagliato.
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
  console.log('uso: node strumenti/_q-umore.js [--gioco file.html] [--taglia 5] [--seme N]');
  process.exit(3);
}

const SEME_CANTIERE = 20260919;   // la data del piano d'esecuzione del cantiere (voce #117), default del flag --seme
/* VINCOLO #98: il determinismo e' instabile a 7/11, ogni misura del
   modello si prende a taglia 5. Il flag resta per chi lo vuole forzare
   di proposito (dichiarando la deviazione), ma il default e' sempre 5. */
const TAGLIA_BANCO = +arg('taglia', 5);
const SEME = +arg('seme', SEME_CANTIERE);

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

(async () => {
  const provaRel = arg('gioco', '');
  const provaAbs = provaRel ? path.resolve(RADICE, provaRel) : '';
  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(semeFisso, SEME);
  const ecc = []; pag.on('pageerror', e => ecc.push(e.message));
  console.log('\n=== IL BANCO DEL MIND (voce #117) — PROVA REGISTRO ===  ' +
              (provaAbs || 'CALCETTO-il-gioco.html (repo)') + '  taglia ' + TAGLIA_BANCO + '  seme ' + SEME);

  try {
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(({ seme }) => {
      const t = window.__test;
      t.semina(seme);
      t.dismissSplash && t.dismissSplash();
      if (t.save) t.save.tutorialDone = 1;
      /* =================================================================
         PROVA TESTIMONE (compito 4): LA FOLLA E' AUDIO, NON HA UNO STATO
         LEGGIBILE su G -- si intercetta la CHIAMATA VERA a
         Audio5.crowdLevel(v) (il sito unico, ~17111 storica), sostituendo
         la funzione con una che registra v E, nella STESSA chiamata,
         ricalcola quanto varrebbe v SENZA il termine di spinta, usando le
         STESSE variabili bare che il sito vero legge (G.ball, FW,
         G.crowdHype, squadraDelPallone -- verificate accessibili da
         page.evaluate: window condivide l'ambiente lessicale globale
         dello script di pagina con qualunque valutazione successiva nello
         stesso contesto). La DIFFERENZA fra v registrato e questo
         "atteso senza spinta" e' il contributo REALE del canale (b) --
         la MISURA del risultato che il codice vero produce, non una sua
         reimplementazione scollegata. La funzione originale non viene mai
         richiamata: questo banco non ascolta audio, gli basta il numero. */
      window.__follaLog = [];
      if (typeof Audio5 !== 'undefined') {
        Audio5.crowdLevel = function (v) {
          const b = G.ball;
          const prox = Math.max(0, 1 - Math.min(b.x, FW - b.x) / 300);
          const teamAttacco = squadraDelPallone();
          const spintaAttacco = (teamAttacco >= 0 && G.spinta) ? Math.max(0, G.spinta[teamAttacco]) : 0;
          const attesoSenzaSpinta = 1 + prox * 0.9 + G.crowdHype * 0.4;
          window.__follaLog.push({ v, attesoSenzaSpinta, teamAttacco, spintaAttacco,
            contributoSpinta: v - attesoSenzaSpinta, t: durataPartita() - G.timeLeft });
        };
      }
    }, { seme: SEME });

    /* ===================================================================
       LA PARTITA E LA RACCOLTA. Tutto in un solo page.evaluate, come gli
       altri banchi di casa: un giro di sola andata, nessun rumore di
       rete fra un fotogramma e l'altro. setCpuVsCpu(true) PRIMA di
       startMatch (la lezione della voce #108, gia' pagata altrove):
       cosi' anche la squadra 0 e' CPU vera. t.simulate(1/60) a passo
       fisso fino a t.state==='end' o al tetto di sicurezza (220 s di
       gioco, ben oltre una qualunque durata di amichevole a taglia 5). */
    const r = await pag.evaluate(({ taglia }) => {
      const t = window.__test;
      t.setCpuVsCpu(true);
      t.startMatch(1, 1, { size: taglia });
      const fattiEsisteva = (typeof t.G !== 'undefined') && Array.isArray(t.G.fatti);
      const fattiVuotiAllInizio = fattiEsisteva && t.G.fatti.length === 0;

      /* =================================================================
         GLI STATI (voce #117, compito 2). Si controlla la superficie
         PRIMA di girare la partita, come fattiEsisteva qui sopra: se
         p.umore/p.nervi non sono numeri o G.spinta non e' un array di 2,
         il gioco di oggi non ha ancora gli stati (il caso atteso su
         fuori/base2.html). */
      const nGiocatoriIniziale = t.G.players ? t.G.players.length : 0;
      const statiEsistono = nGiocatoriIniziale > 0 &&
        typeof t.G.players[0].umore === 'number' && typeof t.G.players[0].nervi === 'number' &&
        Array.isArray(t.G.spinta) && t.G.spinta.length === 2;
      const statiInizialiTuttiZero = statiEsistono &&
        t.G.players.every(p => p.umore === 0 && p.nervi === 0) &&
        t.G.spinta[0] === 0 && t.G.spinta[1] === 0;

      let umoreMin = Infinity, umoreMax = -Infinity, nerviMin = Infinity, nerviMax = -Infinity,
          spintaMin = Infinity, spintaMax = -Infinity, statiFiniti = true;
      const aggiornaMinMax = () => {
        for (const p of t.G.players) {
          if (!Number.isFinite(p.umore) || !Number.isFinite(p.nervi)) { statiFiniti = false; continue; }
          if (p.umore < umoreMin) umoreMin = p.umore;
          if (p.umore > umoreMax) umoreMax = p.umore;
          if (p.nervi < nerviMin) nerviMin = p.nervi;
          if (p.nervi > nerviMax) nerviMax = p.nervi;
        }
        for (const s of t.G.spinta) {
          if (!Number.isFinite(s)) { statiFiniti = false; continue; }
          if (s < spintaMin) spintaMin = s;
          if (s > spintaMax) spintaMax = s;
        }
      };
      if (statiEsistono) aggiornaMinMax();

      /* UN CARTELLINO FORZATO, DETERMINISTICO (voce #117, compito 2): il
         seme di casa non ne produce uno spontaneo in questa partita (la
         prova REGISTRO lo mostra: 0 gialli), e la prova "dopo un
         cartellino l'ammonito ha nervi>0" non puo' restare all'ombra di
         un evento che magari non capita. t.cartellino(team) e' un hook
         di QA gia' esistente (infliggiCartellino su un uomo vero, zero
         dado() qui): si aziona a scena avviata (frame 120 = 2 s, ben
         oltre il kickoff piu' lungo) e si legge l'indice del cartellinato
         DIRETTAMENTE dall'ultimo fatto appena emesso, prima che
         l'impatto abbia gia' girato -- poi si aspetta il simulate() di
         questo stesso fotogramma perche' l'impatto (in step()) lo veda. */
      const CARTELLINO_FRAME = 120;
      let cartellinoForzato = null;
      const eventiStati = [];
      /* =================================================================
         PROVA TESTIMONE (compito 4): tracciamento INDIPENDENTE, sulla
         STESSA partita. compito4Esiste guarda una superficie che nasce
         SOLO col compito 4 (G.spintaScalino): se assente, tutto il resto
         qui sotto e' innocuo (i rami restano a zero) e la prova si
         dichiara ASSENTE con un guasto leggibile, come gli "0-x" degli
         altri compiti. */
      const compito4Esiste = typeof t.G.spintaScalino !== 'undefined';
      /* CORREZIONE DI REVISIONE: parte da [1,1], non [0,0]. Spinta=0 e'
         GIA' il bucket di riposo (scalino 1): un tracciatore che partisse
         da 0 vedrebbe una "salita" spuria al primissimo fotogramma (lo
         stesso bug del gioco, qui nella sonda INDIPENDENTE — se non si
         corregge anche qui, "b-testimone" scambia l'artefatto di questa
         sonda per una salita vera). */
      let ultimoScalino = [1, 1];
      const salite = [];
      const bannerVisti = [];
      const mestoOrganico = { idonei: 0, acceso: 0, gia: 0 };
      const TETTO = 220 * 60;
      let fotogrammi = 0;
      for (; fotogrammi < TETTO && t.state !== 'end'; fotogrammi++) {
        if (statiEsistono && fattiEsisteva && fotogrammi === CARTELLINO_FRAME && t.state === 'play') {
          /* "gia' mesto" del team che sta per ricevere il cartellino,
             catturato PRIMA di t.cartellino(0): distingue "il canale non
             si e' acceso" da "un compagno era gia' mesto, correttamente
             non se ne accende un secondo" (la regola di un uomo per
             volta per squadra, voce #117 compito 4). */
          const giaMestoTeam0 = t.G.players.some(q => q.team === 0 && q.mesto > 0);
          t.cartellino(0);
          const ultimo = t.G.fatti[t.G.fatti.length - 1];
          if (ultimo && (ultimo.che === 'giallo' || ultimo.che === 'espulsione')) {
            cartellinoForzato = { che: ultimo.che, chi: ultimo.chi, giaMestoTeam0 };
          }
        }
        const primaLen = (statiEsistono && fattiEsisteva) ? t.G.fatti.length : 0;
        t.simulate(1 / 60);
        /* PROVA TESTIMONE (compito 4) -- SALITE DI SCALINO: G.spinta
           esiste gia' dal compito 2 su ENTRAMBE le versioni, quindi si
           traccia sempre (non solo se compito4Esiste), per poter
           confrontare "quante salite ci sono state" contro "quante sono
           state coperte" anche sul gioco di ieri. */
        for (let team = 0; team < 2; team++) {
          const scalino = t.G.spinta[team] >= 0.4 ? 2 : (t.G.spinta[team] >= 0 ? 1 : 0);
          if (scalino > ultimoScalino[team]) salite.push({ team, scalino, fotogramma: fotogrammi });
          ultimoScalino[team] = scalino;
        }
        if (t.G.bannerT > 0 && (t.G.banner === 'CI CREDONO' || t.G.banner === 'TESTA ALTA'))
          bannerVisti.push({ testo: t.G.banner, fotogramma: fotogrammi });
        if (statiEsistono && fattiEsisteva) {
          const dopoLen = t.G.fatti.length;
          if (dopoLen > primaLen) {
            /* stesso trattamento robusto allo shift del cursore del
               gioco: si guardano solo i fatti ancora in coda */
            const nNuovi = Math.min(dopoLen - primaLen, dopoLen);
            for (let i = dopoLen - nNuovi; i < dopoLen; i++) {
              const f = t.G.fatti[i];
              if ((f.che === 'gol' || f.che === 'autorete') && f.chi >= 0 && f.chi < t.G.players.length) {
                const p = t.G.players[f.chi];
                eventiStati.push({
                  che: f.che, chi: f.chi,
                  umoreDopo: p.umore,
                  spintaBeneficiaria: (f.esito && typeof f.esito.team === 'number') ? t.G.spinta[f.esito.team] : null,
                });
              } else if (f.che === 'fallo' || f.che === 'giallo' || f.che === 'espulsione' || f.che === 'legno') {
                /* PROVA TESTIMONE (compito 4): i fatti idonei al canale
                   d'occhio (a), con la STESSA regola di bersaglio
                   dichiarata nel gioco (vittima per fallo, chi per gli
                   altri). Si osserva SUBITO DOPO se il bersaglio (o un
                   compagno) e' mesto -- nello stesso fotogramma della sua
                   emissione, perche' l'impatto gira nella STESSA passata
                   di step() che ha appena emesso il fatto. */
                const idx = f.che === 'fallo' ? (f.esito && f.esito.vittima) : f.chi;
                if (Number.isInteger(idx) && idx >= 0 && idx < t.G.players.length) {
                  const bersaglio = t.G.players[idx];
                  mestoOrganico.idonei++;
                  if (bersaglio.mesto > 0) mestoOrganico.acceso++;
                  else if (t.G.players.some(q => q.team === bersaglio.team && q !== bersaglio && q.mesto > 0)) mestoOrganico.gia++;
                }
              }
            }
          }
          if (cartellinoForzato && cartellinoForzato.nerviDopo === undefined) {
            const p = t.G.players[cartellinoForzato.chi];
            cartellinoForzato.nerviDopo = p ? p.nervi : NaN;
            cartellinoForzato.umoreDopo = p ? p.umore : NaN;
            cartellinoForzato.mestoDopo = p ? p.mesto : NaN;
          }
          aggiornaMinMax();
        }
      }
      const fatti = fattiEsisteva ? t.G.fatti.map(f => ({
        che: f.che, chi: f.chi,
        dove: Array.isArray(f.dove) ? f.dove.slice() : f.dove,
        t: f.t, esito: f.esito ? Object.assign({}, f.esito) : f.esito,
      })) : [];
      const nGiocatori = t.G.players ? t.G.players.length : 0;
      return {
        fattiEsisteva, fattiVuotiAllInizio, fotogrammi, statoFinale: t.state,
        fatti, nGiocatori,
        stats: t.stats, score: t.score.slice(),
        cambi: t.G.cambi ? t.G.cambi.slice() : null,
        statiEsistono, statiInizialiTuttiZero, eventiStati, cartellinoForzato,
        umoreMin, umoreMax, nerviMin, nerviMax, spintaMin, spintaMax, statiFiniti,
        compito4Esiste, salite, bannerVisti, mestoOrganico,
        follaLog: (typeof window.__follaLog !== 'undefined') ? window.__follaLog.slice() : [],
      };
    }, { taglia: TAGLIA_BANCO });

    /* ===================================================================
       (0) LA SUPERFICIE ESISTE? Se G.fatti non c'e' (il gioco di ieri),
       si dichiara SUBITO con un guasto leggibile: e' esattamente la
       condanna attesa sulla base, non un'eccezione cieca. */
    di(r.fattiEsisteva, '0. G.fatti esiste (window.__test.G.fatti e\' un array)',
      r.fattiEsisteva ? 'presente' : 'ASSENTE — il gioco di oggi non ha ancora il registro dei fatti');

    if (!r.fattiEsisteva) {
      di(false, '1. REGISTRO — non misurabile senza G.fatti', 'prova saltata: nessuna superficie da leggere');
    } else {
      /* =================================================================
         (a) VUOTO A INIZIO PARTITA. */
      di(r.fattiVuotiAllInizio, 'a. G.fatti e\' vuoto subito dopo startMatch',
        'lunghezza a inizio partita: ' + (r.fattiVuotiAllInizio ? 0 : '(non zero, vedi sopra)'));

      /* =================================================================
         (b) LO SCHEMA, per OGNI fatto. */
      const CHE_NOTI = new Set(['gol','autorete','rigore','giallo','espulsione','rubata','fallo',
                                 'presa','pugni','sfugge','respinta','parata','legno','acciacco','cambio']);
      const guastiSchema = [];
      const conteggi = {};
      for (let i = 0; i < r.fatti.length; i++) {
        const f = r.fatti[i];
        conteggi[f.che] = (conteggi[f.che] || 0) + 1;
        const dove = 'fatto #' + i + ' (che:' + f.che + ')';
        if (typeof f.che !== 'string' || !f.che) guastiSchema.push(dove + ': che non e\' una stringa non vuota');
        else if (!CHE_NOTI.has(f.che)) guastiSchema.push(dove + ': che="' + f.che + '" non e\' nel vocabolario dichiarato');
        if (!Number.isInteger(f.chi)) guastiSchema.push(dove + ': chi non e\' un intero (' + JSON.stringify(f.chi) + ')');
        else if (f.chi !== -1 && (f.chi < 0 || f.chi >= r.nGiocatori)) guastiSchema.push(dove + ': chi=' + f.chi + ' fuori range (0..' + (r.nGiocatori - 1) + ' o -1)');
        if (!Array.isArray(f.dove) || f.dove.length !== 2 || !f.dove.every(Number.isFinite)) guastiSchema.push(dove + ': dove non e\' una coppia di numeri finiti (' + JSON.stringify(f.dove) + ')');
        if (!Number.isFinite(f.t)) guastiSchema.push(dove + ': t non e\' un numero finito (' + JSON.stringify(f.t) + ')');
        if (!f.esito || typeof f.esito !== 'object' || Array.isArray(f.esito)) guastiSchema.push(dove + ': esito non e\' un oggetto (' + JSON.stringify(f.esito) + ')');
      }
      di(guastiSchema.length === 0, 'b. ogni fatto ha lo schema completo (che/chi/dove/t/esito)',
        (guastiSchema.length ? guastiSchema.slice(0, 8).join('   ') + (guastiSchema.length > 8 ? '   … e altri ' + (guastiSchema.length - 8) : '') : r.fatti.length + ' fatti, tutti a schema valido'));

      /* =================================================================
         (c) I CONTEGGI, contro i testimoni veri del gioco. */
      const S = r.stats || {};
      const somma = a => Array.isArray(a) ? a[0] + a[1] : 0;
      const nRubata = conteggi.rubata || 0, vRubata = somma(S.rubate);
      const nFallo = conteggi.fallo || 0, vFallo = somma(S.falli);
      const nGiallo = (conteggi.giallo || 0) + (conteggi.espulsione || 0), vGiallo = somma(S.gialli);
      const nEspulsione = conteggi.espulsione || 0, vEspulsione = somma(S.espulsi);
      const nGol = (conteggi.gol || 0) + (conteggi.autorete || 0), vGol = somma(r.score);
      const nGkSave = (conteggi.presa || 0) + (conteggi.pugni || 0) + (conteggi.sfugge || 0) + (conteggi.respinta || 0);
      const vGkSave = somma(S.parate);
      const nCambio = conteggi.cambio || 0, vCambio = r.cambi ? somma(r.cambi) : null;
      const nAcciacco = conteggi.acciacco || 0, vAcciacco = somma(S.acciacchi);

      const righe = [];
      const controlla = (nome, n, v, notaSeVuoto) => {
        const ok = n === v;
        righe.push({ nome, ok, det: n + ' fatti contro ' + v + (v === 0 && notaSeVuoto ? '  (' + notaSeVuoto + ')' : '') });
        return ok;
      };
      let tuttiOk = true;
      tuttiOk = controlla('rubata', nRubata, vRubata) && tuttiOk;
      tuttiOk = controlla('fallo', nFallo, vFallo) && tuttiOk;
      tuttiOk = controlla('giallo+espulsione contro G.stats.gialli', nGiallo, vGiallo) && tuttiOk;
      tuttiOk = controlla('espulsione contro G.stats.espulsi', nEspulsione, vEspulsione) && tuttiOk;
      tuttiOk = controlla('gol+autorete contro lo score finale', nGol, vGol) && tuttiOk;
      tuttiOk = controlla('presa+pugni+sfugge+respinta contro G.stats.parate', nGkSave, vGkSave, 'nessuna parata in questa partita') && tuttiOk;
      if (vCambio !== null) tuttiOk = controlla('cambio contro G.cambi', nCambio, vCambio, 'nessun cambio in questa partita') && tuttiOk;
      tuttiOk = controlla('acciacco contro G.stats.acciacchi', nAcciacco, vAcciacco, 'nessun acciacco in questa partita') && tuttiOk;

      di(tuttiOk, 'c. i conteggi dei fatti combaciano coi testimoni veri del gioco (G.stats/score/G.cambi)',
        righe.map(r2 => (r2.ok ? 'OK ' : 'NO ') + r2.nome + ': ' + r2.det).join('\n         '));

      /* SENZA CONTATORE GEMELLO: si stampa, non si inventa un verdetto. */
      console.log('         (informativo, nessun contatore gemello nel gioco di oggi) legno: ' + (conteggi.legno || 0) +
                  '   rigore: ' + (conteggi.rigore || 0) + '   parata (duello): ' + (conteggi.parata || 0));
      console.log('         partita: ' + r.fotogrammi + ' fotogrammi simulati, stato finale "' + r.statoFinale + '", punteggio ' + r.score.join('-') +
                  ', totale fatti registrati: ' + r.fatti.length);
    }

    /* =====================================================================
       PROVA STATI (compito 2). p.umore (-1..+1), p.nervi (0..1) per
       giocatore, G.spinta[team] (-1..+1) per squadra: TRE STATI DERIVATI
       DAI FATTI, zero dado(). Sulla STESSA partita gia' giocata qui sopra
       (un solo giro, come il resto della casa) si verifica:
         0-stati. la superficie esiste (numeri/array, non l'assenza del
                  gioco di ieri);
         a-stati. a inizio partita tutti gli stati sono zero;
         b-stati. dopo ogni gol/autorete lo scorer ha umore>0 (autorete:
                  l'autore ha umore<0 — vedi applicaImpattoFatto);
         c-stati. dopo ogni gol/autorete la squadra beneficiaria ha
                  spinta>0;
         d-stati. dopo un cartellino FORZATO (t.cartellino(0), un hook di
                  QA gia' esistente — il seme di casa non ne produce uno
                  spontaneo in questa partita) l'ammonito ha nervi>0;
         e-stati. umore/nervi/spinta restano nei loro intervalli (clamp)
                  per l'intera partita, mai NaN/Infinity.
       NASCE ROSSA SUL GIOCO DI IERI (dichiarato): su
       `git show cb23512:CALCETTO-il-gioco.html` (fuori/base2.html) gli
       stati non esistono ancora — 0-stati lo dice con un guasto leggibile,
       non un'eccezione cieca, e le prove sotto si saltano di conseguenza. */
    di(r.statiEsistono, '0-stati. gli stati esistono (p.umore/p.nervi numeri, G.spinta un array di 2)',
      r.statiEsistono ? 'presente' : 'ASSENTE — il gioco di oggi non ha ancora gli stati (umore/nervi/spinta)');

    if (!r.statiEsistono) {
      di(false, '1-stati. STATI — non misurabile senza gli stati', 'prova saltata: nessuna superficie da leggere');
    } else {
      di(r.statiInizialiTuttiZero, 'a-stati. a inizio partita tutti gli stati sono a zero (umore/nervi/spinta)',
        r.statiInizialiTuttiZero ? 'tutti zero' : 'ALMENO uno stato non parte da zero');

      const golEventi = r.eventiStati;
      const scorerOk = golEventi.length === 0 ? true : golEventi.every(e => e.che === 'gol' ? e.umoreDopo > 0 : e.umoreDopo < 0);
      di(scorerOk, 'b-stati. dopo ogni gol lo scorer ha umore>0 (autorete: umore<0 per l\'autore)',
        golEventi.length === 0 ? 'nessun gol in questa partita: prova non esercitata (non un si\')'
          : golEventi.map(e => e.che + ' chi=' + e.chi + ' umoreDopo=' + e.umoreDopo.toFixed(3)).join('; '));

      const spintaOk = golEventi.length === 0 ? true : golEventi.every(e => e.spintaBeneficiaria !== null && e.spintaBeneficiaria > 0);
      di(spintaOk, 'c-stati. dopo ogni gol/autorete la squadra beneficiaria ha spinta>0',
        golEventi.length === 0 ? 'nessun gol in questa partita: prova non esercitata (non un si\')'
          : golEventi.map(e => e.che + ' spintaBeneficiaria=' + (e.spintaBeneficiaria === null ? 'n/d' : e.spintaBeneficiaria.toFixed(3))).join('; '));

      const cf = r.cartellinoForzato;
      di(!!cf && Number.isFinite(cf.nerviDopo) && cf.nerviDopo > 0,
        'd-stati. dopo un cartellino forzato l\'ammonito ha nervi>0',
        cf ? (cf.che + ' chi=' + cf.chi + ' nerviDopo=' + cf.nerviDopo + ' umoreDopo=' + cf.umoreDopo)
           : 'il cartellino forzato (t.cartellino(0)) non ha prodotto un fatto giallo/espulsione');

      const clampOk = r.statiFiniti && r.umoreMin >= -1 && r.umoreMax <= 1 &&
        r.nerviMin >= 0 && r.nerviMax <= 1 && r.spintaMin >= -1 && r.spintaMax <= 1;
      di(clampOk, 'e-stati. umore/nervi/spinta restano nei loro intervalli per tutta la partita (clamp)',
        'umore [' + r.umoreMin.toFixed(3) + ',' + r.umoreMax.toFixed(3) + ']  nervi [' + r.nerviMin.toFixed(3) + ',' + r.nerviMax.toFixed(3) +
        ']  spinta [' + r.spintaMin.toFixed(3) + ',' + r.spintaMax.toFixed(3) + ']  tutti finiti: ' + r.statiFiniti);
    }

    /* =====================================================================
       PROVA CANALE (compito 3). manopolaDi(p) modula PER GIOCATORE le tre
       manopole di manopoleDi(p.team), DOPO il carattere -- vedi la lettera
       di testa di questo file e strumenti/_t-canale-mind.js. Si avvia una
       partita CPU-CPU a seme fisso (serve solo ad avere G.players/G.knob
       popolati, non si simula nulla) e si forza lo stato con la
       superficie di test. NASCE ROSSA SUL GIOCO DEL COMPITO 2
       (`fuori/base3.html` = `git show 53007c5:CALCETTO-il-gioco.html`):
       manopolaDi non esiste, 0-canale lo dice con un guasto leggibile. */
    const rCanale = await pag.evaluate(({ taglia, seme }) => {
      const t = window.__test;
      t.semina(seme);
      t.setCpuVsCpu(true);
      t.startMatch(1, 1, { size: taglia });
      const superficieEsiste = typeof t.manopolaDi === 'function' && typeof t.manopoleDi === 'function' &&
        typeof t.setUmore === 'function' && typeof t.setNervi === 'function' && typeof t.setSpinta === 'function';
      if (!superficieEsiste) return { superficieEsiste };

      const idx = 0, team = t.players[idx].team;
      t.setUmore(idx, 0); t.setNervi(idx, 0); t.setSpinta(team, 0);
      const base = t.manopoleDi(team);
      const neutro = t.manopolaDi(idx);
      const neutroOk = neutro.passErr === base.passErr && neutro.slideP === base.slideP && neutro.standoff === base.standoff;

      t.setUmore(idx, 1);
      const conUmore = t.manopolaDi(idx);
      t.setUmore(idx, 0);

      t.setNervi(idx, 1);
      const conNervi = t.manopolaDi(idx);
      t.setNervi(idx, 0);

      t.setSpinta(team, 1);
      const conSpinta = t.manopolaDi(idx);
      t.setSpinta(team, 0);

      return { superficieEsiste, base, neutro, neutroOk, conUmore, conNervi, conSpinta };
    }, { taglia: TAGLIA_BANCO, seme: SEME });

    di(rCanale.superficieEsiste, '0-canale. la superficie del canale esiste (manopolaDi/manopoleDi/setUmore/setNervi/setSpinta)',
      rCanale.superficieEsiste ? 'presente' : 'ASSENTE — il gioco di oggi non ha ancora il canale (manopolaDi)');

    if (!rCanale.superficieEsiste) {
      di(false, '1-canale. CANALE — non misurabile senza la superficie', 'prova saltata: nessuna superficie da leggere');
    } else {
      di(rCanale.neutroOk, 'a-canale. a stati zero manopolaDi(p) ha gli stessi valori di manopoleDi(p.team) (neutro esatto)',
        'base={passErr:' + rCanale.base.passErr.toFixed(4) + ', slideP:' + rCanale.base.slideP.toFixed(4) + ', standoff:' + rCanale.base.standoff.toFixed(4) +
        '}  modulata={passErr:' + rCanale.neutro.passErr.toFixed(4) + ', slideP:' + rCanale.neutro.slideP.toFixed(4) + ', standoff:' + rCanale.neutro.standoff.toFixed(4) + '}');

      const attesoUmore = rCanale.base.passErr / 1.15;
      const bCanaleOk = rCanale.conUmore.passErr < rCanale.base.passErr && Math.abs(rCanale.conUmore.passErr - attesoUmore) < 1e-9;
      di(bCanaleOk, 'b-canale. umore=+1 abbassa passErr (diviso 1+0.15*umore, monotono e a numero)',
        'base=' + rCanale.base.passErr.toFixed(4) + '  con umore=1: ' + rCanale.conUmore.passErr.toFixed(4) + '  atteso=' + attesoUmore.toFixed(4));

      const attesoNervi = rCanale.base.slideP * 1.25;
      const cCanaleOk = rCanale.conNervi.slideP > rCanale.base.slideP && Math.abs(rCanale.conNervi.slideP - attesoNervi) < 1e-9;
      di(cCanaleOk, 'c-canale. nervi=+1 alza slideP (moltiplicato 1+0.25*nervi, monotono e a numero)',
        'base=' + rCanale.base.slideP.toFixed(4) + '  con nervi=1: ' + rCanale.conNervi.slideP.toFixed(4) + '  atteso=' + attesoNervi.toFixed(4));

      const attesoSpinta = Math.max(0, rCanale.base.standoff * 0.88);
      const monotonoSpinta = rCanale.base.standoff === 0 ? rCanale.conSpinta.standoff === 0 : rCanale.conSpinta.standoff < rCanale.base.standoff;
      const dCanaleOk = monotonoSpinta && Math.abs(rCanale.conSpinta.standoff - attesoSpinta) < 1e-9;
      di(dCanaleOk, 'd-canale. spinta=+1 abbassa standoff (moltiplicato 1-0.12*spinta, guardia >=0)',
        'base=' + rCanale.base.standoff.toFixed(4) + '  con spinta=1: ' + rCanale.conSpinta.standoff.toFixed(4) + '  atteso=' + attesoSpinta.toFixed(4) +
        (rCanale.base.standoff === 0 ? '  (base standoff=0 su questo carattere: effetto invisibile, atteso dal progetto)' : ''));
    }

    /* =====================================================================
       PROVA TETTI (compito 3). Su N=5 partite CPU-CPU a seme fisso, taglia
       di casa, si campiona manopolaDi(idx) di OGNI giocatore ogni 30
       fotogrammi (mezzo secondo a 60 Hz) e si verifica che nessun campo
       superi il tetto dichiarato. manopoleDi(team) non cambia mai dentro
       una partita (G.knob si scrive una sola volta in startMatch): si
       cattura una volta per squadra a inizio partita (basi[team]) e si
       confronta contro manopolaDi(idx) a ogni campione. Lo scarto e'
       calcolato dal RAPPORTO fra manopola base e modulata (non dagli
       stati direttamente): passErr |base/mod-1|<=0.15, slideP
       (mod/base-1)<=0.25, standoff |1-mod/base|<=0.12 -- IL MASSIMO
       OSSERVATO SI STAMPA SEMPRE. NASCE ROSSA SULLA STESSA fuori/base3.html
       della prova CANALE. */
    const N_PARTITE_TETTI = 5, CAMPIONA_OGNI = 30;
    const rTetti = await pag.evaluate(({ taglia, seme0, n, campionaOgni }) => {
      const t = window.__test;
      const superficieEsiste = typeof t.manopolaDi === 'function' && typeof t.manopoleDi === 'function';
      if (!superficieEsiste) return { superficieEsiste };

      const TETTO_PASSERR = 0.15 + 1e-9, TETTO_SLIDEP = 0.25 + 1e-9, TETTO_STANDOFF = 0.12 + 1e-9;
      let maxScartoPassErr = 0, maxScartoSlideP = 0, maxScartoStandoff = 0, campioni = 0;
      const violazioni = [];
      for (let k = 0; k < n; k++) {
        t.semina(seme0 + k);
        t.setCpuVsCpu(true);
        t.startMatch(1, 1, { size: taglia });
        const basi = [t.manopoleDi(0), t.manopoleDi(1)];
        const TETTO_FRAME = 220 * 60;
        for (let fotogrammi = 0; fotogrammi < TETTO_FRAME && t.state !== 'end'; fotogrammi++) {
          t.simulate(1 / 60);
          if (fotogrammi % campionaOgni !== 0) continue;
          for (let i = 0; i < t.players.length; i++) {
            const p = t.players[i];
            const base = basi[p.team];
            const mod = t.manopolaDi(i);
            campioni++;
            if (base.passErr > 1e-9) {
              const scarto = Math.abs(base.passErr / mod.passErr - 1);
              if (scarto > maxScartoPassErr) maxScartoPassErr = scarto;
              if (scarto > TETTO_PASSERR) violazioni.push({ campo: 'passErr', partita: k, idx: i, scarto });
            }
            if (base.slideP > 1e-9) {
              const scarto = mod.slideP / base.slideP - 1;
              if (Math.abs(scarto) > maxScartoSlideP) maxScartoSlideP = Math.abs(scarto);
              if (scarto > TETTO_SLIDEP || scarto < -1e-9) violazioni.push({ campo: 'slideP', partita: k, idx: i, scarto });
            }
            if (base.standoff > 1e-9) {
              const scarto = 1 - mod.standoff / base.standoff;
              if (Math.abs(scarto) > maxScartoStandoff) maxScartoStandoff = Math.abs(scarto);
              if (Math.abs(scarto) > TETTO_STANDOFF) violazioni.push({ campo: 'standoff', partita: k, idx: i, scarto });
            }
          }
        }
      }
      return {
        superficieEsiste, campioni, maxScartoPassErr, maxScartoSlideP, maxScartoStandoff,
        violazioni: violazioni.slice(0, 8), nViolazioni: violazioni.length,
      };
    }, { taglia: TAGLIA_BANCO, seme0: SEME, n: N_PARTITE_TETTI, campionaOgni: CAMPIONA_OGNI });

    di(rTetti.superficieEsiste, '0-tetti. la superficie del canale esiste per il campionamento (manopolaDi/manopoleDi)',
      rTetti.superficieEsiste ? 'presente' : 'ASSENTE — il gioco di oggi non ha ancora il canale (manopolaDi)');

    if (!rTetti.superficieEsiste) {
      di(false, '1-tetti. TETTI — non misurabile senza la superficie', 'prova saltata: nessuna superficie da leggere');
    } else {
      di(rTetti.nViolazioni === 0,
        'a-tetti. nessun campo supera il tetto dichiarato su ' + N_PARTITE_TETTI + ' partite CPU-CPU (taglia ' + TAGLIA_BANCO + ')',
        'campioni: ' + rTetti.campioni + '   MASSIMO SCARTO osservato — passErr: ' + (rTetti.maxScartoPassErr * 100).toFixed(2) + '% (tetto 15%)' +
        '   slideP: ' + (rTetti.maxScartoSlideP * 100).toFixed(2) + '% (tetto 25%)' +
        '   standoff: ' + (rTetti.maxScartoStandoff * 100).toFixed(2) + '% (tetto 12%)' +
        (rTetti.nViolazioni ? '\n         VIOLAZIONI (' + rTetti.nViolazioni + '): ' + JSON.stringify(rTetti.violazioni) : ''));
    }

    /* =====================================================================
       PROVA TESTIMONE (compito 4). "Sempre visibile": ogni stato che
       supera una soglia dichiarata ha un canale d'occhio acceso -- vedi
       la lettera di testa di strumenti/_t-occhio-mind.js. Due misure
       GATING sulla STESSA partita gia' giocata per REGISTRO/STATI qui
       sopra (un solo giro, come il resto della casa):
         a-testimone. UN CARTELLINO FORZATO (stesso hook, stesso
           fotogramma della prova STATI) e' un fatto idoneo al canale (a):
           se nessun compagno di squadra era GIA' mesto, l'ammonito deve
           diventare mesto entro la stessa passata. Se un compagno era
           gia' mesto, la regola "un uomo per volta per squadra" impone
           di NON accendersi: si dichiara non esercitata (non un guasto).
         b-testimone. OGNI SALITA DI SCALINO DI G.spinta (tracciata IN
           MODO INDIPENDENTE dal test, leggendo G.spinta -- non dal
           codice del gioco) deve avere ALMENO UNO dei due canali acceso
           entro una finestra di 90 fotogrammi (1,5 s, oltre la durata di
           un banner): un banner col testo giusto mostrato, O la folla
           con un contributo di spinta MISURATO (contributoSpinta>0.01,
           dal monkeypatch di Audio5.crowdLevel nel setup -- la misura
           del risultato vero, non una sua reimplementazione scollegata).
       NIENTE stato "nervi" qui: non ha un canale d'occhio dichiarato in
       questo compito (il suo canale e' la manopola del compito 3, una
       DECISIONE, non un disegno) -- fuori perimetro, dichiarato.
       NASCE ROSSA SU `fuori/base4.html` (= `git show 8824222:...`, lo
       HEAD del compito 3): G.spintaScalino e' undefined la', e lo dice
       con un guasto leggibile — 0-testimone. */
    di(r.compito4Esiste, '0-testimone. il canale d\'occhio del compito 4 esiste (G.spintaScalino)',
      r.compito4Esiste ? 'presente' : 'ASSENTE — il gioco di oggi non ha ancora i canali d\'occhio (mesto dai fatti, folla/banner da spinta)');

    if (!r.compito4Esiste) {
      di(false, '1-testimone. TESTIMONE — non misurabile senza i canali d\'occhio', 'prova saltata: nessuna superficie da leggere');
    } else {
      const cf = r.cartellinoForzato;
      if (!cf) {
        di(false, 'a-testimone. il cartellino forzato ha prodotto un fatto giallo/espulsione', 'nessun fatto giallo/espulsione ottenuto: prova non misurabile');
      } else if (cf.giaMestoTeam0) {
        di(true, 'a-testimone. cartellino forzato: un compagno era gia\' mesto — "un uomo per volta" impone di non accendersi (non esercitata)',
          'che=' + cf.che + ' chi=' + cf.chi + ' giaMestoTeam0=true — comportamento atteso, non una prova');
      } else {
        di(cf.mestoDopo > 0, 'a-testimone. dopo un cartellino forzato (nessun compagno gia\' mesto) l\'ammonito diventa mesto: il canale (a) non e\' muto',
          cf.che + ' chi=' + cf.chi + ' mestoDopo=' + cf.mestoDopo.toFixed(4) + ' umoreDopo=' + cf.umoreDopo.toFixed(4));
      }

      const FINESTRA_FRAME = 90;
      const TESTI_SCALINO = { 1: 'TESTA ALTA', 2: 'CI CREDONO' };
      const violazioniB = [];
      for (const s of r.salite) {
        const testoAtteso = TESTI_SCALINO[s.scalino];
        if (!testoAtteso) continue;
        const bannerOk = r.bannerVisti.some(b => b.testo === testoAtteso && Math.abs(b.fotogramma - s.fotogramma) <= FINESTRA_FRAME);
        const follaOk = r.follaLog.some(fl => fl.teamAttacco === s.team && fl.contributoSpinta > 0.01 &&
          Math.abs(fl.t - s.fotogramma / 60) <= FINESTRA_FRAME / 60);
        if (!bannerOk && !follaOk) violazioniB.push(s);
      }
      di(r.salite.length === 0 ? true : violazioniB.length === 0,
        'b-testimone. ogni salita di scalino di G.spinta ha un canale acceso (banner "TESTA ALTA"/"CI CREDONO" O folla sopra il livello base)',
        r.salite.length === 0 ? 'nessuna salita di scalino in questa partita: prova non esercitata (non un si\')'
          : r.salite.length + ' salite osservate, ' + (r.salite.length - violazioniB.length) + ' coperte da un canale' +
            (violazioniB.length ? '\n         MUTE (' + violazioniB.length + '): ' + JSON.stringify(violazioniB) : ''));

      console.log('         (informativo) fatti idonei al mesto (fallo/giallo/espulsione/legno) nella partita: ' + r.mestoOrganico.idonei +
                  '   hanno acceso mesto: ' + r.mestoOrganico.acceso + '   gia\' coperti da un compagno mesto: ' + r.mestoOrganico.gia);

      /* =================================================================
         PROVA NIENTE-FALSI-BANNER (correzione di revisione, compito 4).
         Il rilievo: scalinoDiSpinta(0)===1 ma G.spintaScalino partiva a
         [0,0] in startMatch — al primo fotogramma di scena 'play' (spinta
         ancora [0,0], nessun fatto accaduto) "nuovo(1) > vecchio(0)" era
         vero per ENTRAMBE le squadre e "TESTA ALTA" appariva ad OGNI
         fischio d'inizio. La cura fa partire G.spintaScalino da [1,1] (lo
         STESSO bucket a cui spinta=0 appartiene).
         QUESTA PROVA NON CONDIVIDE FORMULA NE' INIZIALIZZAZIONE COL
         GIOCO: legge l'EFFETTO OSSERVABILE VERO (t.G.banner/t.G.bannerT,
         lo stesso banner che lo schermo mostra), non una reimplementazione
         dello scalino — un banco che ricalcolasse scalinoDiSpinta/[0,0] in
         proprio erediterebbe lo stesso bug e non lo vedrebbe mai.
         Partita FRESCA (non quella di REGISTRO/STATI qui sopra, gia'
         girata oltre il kickoff): dal fischio d'inizio, per i primi 3 s di
         scena 'play' (180 fotogrammi, ben oltre il fotogramma 60 della
         riproduzione del revisore), finche' lo stato resta PERFETTAMENTE
         neutro (G.spinta ancora a zero per entrambe E nessun fatto ancora
         emesso) non deve comparire un banner "TESTA ALTA"/"CI CREDONO". */
      const rFalsi = await pag.evaluate(({ taglia, seme }) => {
        const t = window.__test;
        t.semina(seme);
        t.setCpuVsCpu(true);
        t.startMatch(1, 1, { size: taglia });
        const FINESTRA_PLAY = 180;
        let vistoPlay = false, frameDaPlay = -1;
        const falsi = [];
        for (let fr = 0; fr < 600 && !(vistoPlay && fr - frameDaPlay > FINESTRA_PLAY); fr++) {
          t.simulate(1 / 60);
          if (t.state === 'play' && !vistoPlay) { vistoPlay = true; frameDaPlay = fr; }
          if (!vistoPlay) continue;
          const neutro = t.G.spinta[0] === 0 && t.G.spinta[1] === 0 && t.G.fatti.length === 0;
          if (neutro && t.G.bannerT > 0 && (t.G.banner === 'TESTA ALTA' || t.G.banner === 'CI CREDONO'))
            falsi.push({ fr, dallaPlay: fr - frameDaPlay, banner: t.G.banner });
        }
        return { vistoPlay, frameDaPlay, falsi };
      }, { taglia: TAGLIA_BANCO, seme: SEME });

      if (!rFalsi.vistoPlay) {
        di(false, 'e-testimone (NIENTE-FALSI-BANNER). la partita raggiunge la scena \'play\' entro 10 s', 'mai vista la scena play: prova non misurabile');
      } else {
        di(rFalsi.falsi.length === 0,
          'e-testimone (NIENTE-FALSI-BANNER). nei primi 3 s di play, con G.spinta ancora a zero e nessun fatto, non compare un banner di scalino',
          rFalsi.falsi.length === 0 ? 'nessun falso banner osservato (play dal fotogramma ' + rFalsi.frameDaPlay + ')'
            : 'FALSI (' + rFalsi.falsi.length + '): ' + JSON.stringify(rFalsi.falsi));
      }
    }

    if (ecc.length) { di(false, 'BANCO — nessuna eccezione di pagina', 'eccezione: ' + ecc[0]); }
  } catch (e) {
    console.error('FALLITO: ' + e.message);
    await browser.close(); srv.chiudi();
    process.exit(2);
  }

  await ctx.close(); await browser.close(); srv.chiudi();
  const rossi = esiti.filter(v => !v).length;
  console.log('\n' + (esiti.length - rossi) + ' prove su ' + esiti.length + ' — ' + (rossi ? 'CANCELLO ROSSO' : 'CANCELLO VERDE'));
  process.exit(rossi ? 1 : 0);
})();
