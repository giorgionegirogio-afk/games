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
      const TETTO = 220 * 60;
      let fotogrammi = 0;
      for (; fotogrammi < TETTO && t.state !== 'end'; fotogrammi++) {
        if (statiEsistono && fattiEsisteva && fotogrammi === CARTELLINO_FRAME && t.state === 'play') {
          t.cartellino(0);
          const ultimo = t.G.fatti[t.G.fatti.length - 1];
          if (ultimo && (ultimo.che === 'giallo' || ultimo.che === 'espulsione')) {
            cartellinoForzato = { che: ultimo.che, chi: ultimo.chi };
          }
        }
        const primaLen = (statiEsistono && fattiEsisteva) ? t.G.fatti.length : 0;
        t.simulate(1 / 60);
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
              }
            }
          }
          if (cartellinoForzato && cartellinoForzato.nerviDopo === undefined) {
            const p = t.G.players[cartellinoForzato.chi];
            cartellinoForzato.nerviDopo = p ? p.nervi : NaN;
            cartellinoForzato.umoreDopo = p ? p.umore : NaN;
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
