/* =====================================================================
   _q-soak.js -- IL SOAK CON BANDE, COMPITO 1: IL SOAK BASE (voce #127,
   onda C -- 3, ultimo anello).

   IL PERCHE'. Il mandato (S13.1.5) chiede "soak tests: 1,000 bot-vs-bot
   matches per night per profile ... zero crashes, zero invariant
   violations, no match longer than the expected real duration + 25%".
   Il FUZZER (#126) genera INPUT casuale e cerca il caso avversariale su
   pochi semi (di serie 20). Questo banco e' complementare: guida un
   VOLUME di partite CPU-CONTRO-CPU (nessun input umano -- e' proprio
   questo che lo distingue dal fuzzer) fino a 'end', verificando su OGNI
   partita le stesse dodici invarianti gia' provate da strumenti/
   _q-invarianti.js (RIUSATE via require, non riscritte -- vedi la
   lettera di testa di quel file per il perche' di ciascuna) piu' UNA
   invariante propria di questo banco: INV-15 su volume, la clausola
   "durata <= attesa +25%" (il tetto la incorpora gia', vedi sotto)
   verificata su decine/centinaia di partite invece che sui due scenari
   fissi di _q-cpu-ordine.js o sugli 8 semi di _q-invarianti.js -- il
   valore del soak e' proprio il caso raro che pochi semi non pescano.

   CALCO. Struttura di avvio (server HTTP locale + Playwright + SONDA
   dentro un solo page.evaluate) copiata da strumenti/_q-invarianti.js.
   Rosa rigenerata + ordine giusto di setCpuVsCpu copiati da strumenti/
   _q-fuzzer.js (che li ha scoperti e documentati per primo, compito 2,
   punto d). Nessuna delle due invarianti si riscrive: si fa
   `require('./_q-invarianti.js')` e si porta il CODICE SORGENTE di
   verificaCronometriFratelli/verificaTickInvarianti (.toString()) dentro
   lo script che gira in pagina -- lo STESSO trucco gia' usato da
   _q-fuzzer.js, per lo stesso motivo (page.evaluate non puo' fare
   require() dall'interno della pagina).

   LA ROSA RIGENERATA (perche' e' necessaria QUI, non solo nel fuzzer).
   SAVE.rosa nasce UNA sola volta al caricamento della pagina
   (CALCETTO-il-gioco.html:10137) e CRESCE di un attributo a caso a ogni
   fine-partita (righe 41623-41635, la progressione-carriera -- un
   pregio del gioco, non un difetto). Un soak che gioca decine o migliaia
   di partite IN SEQUENZA sulla STESSA pagina (una pagina per corsa,
   non una per partita: aprire mille pagine sarebbe lentissimo e non e'
   necessario) vedrebbe la rosa del seme k gia' cresciuta di k partite,
   desincronizzando ogni corsa dalla precedente e rompendo la
   ripetibilita' -- la stessa diagnosi di _q-fuzzer.js (compito 2, punto
   d), qui rilevante ancora di piu' perche' il VOLUME e' il punto del
   banco. La cura e' IDENTICA: SUBITO dopo t.semina(seme) e PRIMA di
   startMatch, `t.save.rosa = window.nuovaRosa()` -- una RI-GENERAZIONE
   esplicita (nuovaRosa() e' pura, stesso risultato ogni volta), non un
   azzeramento (misurato rotto altrove: nullare SAVE.rosa fa cadere
   setupPlayers nel ramo "nessuna rosa", cloni a statistica media, una
   partita diversa da quella vera).

   L'ORDINE DI setCpuVsCpu (voce #121, seguito #108): SEMPRE startMatch
   PRIMA, setCpuVsCpu(true) DOPO -- l'ordine inverso viene annullato in
   silenzio dentro startMatch (che riscrive G.cpu incondizionatamente) e
   la squadra 0 resta "umana immobile", incastrata alla prima punizione
   (sintomo #108/#119). L'UNICA eccezione voluta e' `--bugiardo durata`
   (vedi sotto), che inverte l'ordine DI PROPOSITO per dimostrare che
   questo stesso banco condanna l'hang che ne segue -- non e' un test
   fine a se stesso: e' la prova che INV-15-su-volume sa vedere rosso
   quando il rosso c'e' davvero, non solo attestare verde per costruzione.

   TAGLIA 5, IL CANCELLO ANCORATO (vincolo globale del piano). A 7/11
   rebuildCrowd/setTaglia consuma PRNG in proporzione al perimetro (voce
   #98, causa isolata, seguito #129 aperto) e il determinismo cross-corsa
   slitta: il soak-cancello gira a taglia 5 di serie. --taglia resta,
   come negli altri banchi, per chi vuole forzare la deviazione
   dichiarandola -- NON e' il cancello ripetibile.

   INV-15 SU VOLUME. Ogni partita deve raggiungere t.state==='end' entro
   TETTO_FOTOGRAMMI (13200, 220 s di gioco a taglia 5 -- IMPORTATO da
   _q-invarianti.js, non un secondo numero magico duplicato a mano: il
   tetto INCORPORA gia' il margine +25% del mandato, vedi la lettera di
   testa di quel file). Una partita che non arriva a 'end' entro il
   tetto e' un hang (come l'#119): SI FERMA li' (non si aspetta oltre),
   e conta come violazione di questo banco.

   IL METODO BUGIARDO -- SOLO durata, e solo per dimostrare che INV-15-
   su-volume sa condannare (le altre nove invarianti sono gia' provate
   rosse da _q-invarianti.js: duplicare qui la stessa dimostrazione non
   aggiungerebbe nulla, la funzione riusata e' LETTERALMENTE la stessa).
     --bugiardo durata   inverte l'ordine setCpuVsCpu/startMatch per
                         TUTTE le partite della corsa (misurato altrove:
                         non ogni seme si incastra, la squadra 0 "umana
                         immobile" si blocca solo se il gioco la porta a
                         battere una punizione -- su un campione decente
                         di partite alcune condannano comunque il tetto).

   RIPETIBILITA'. Nessun dado()/Math.random in questo banco: solo
   t.semina(seme) (il PRNG del gioco) e nuovaRosa() (pura). Il banco
   stampa, oltre al riepilogo per invariante, un'IMPRONTA aggregata
   (hash FNV-1a di seme+fotogrammi+statoFinale+punteggio di OGNI
   partita): due corse con lo stesso --semeBase/--partite devono stampare
   la STESSA impronta -- e' la prova di ripetibilita' richiesta dal
   piano, leggibile a occhio confrontando due esecuzioni senza dover
   costruire un secondo strumento.

   uso:  node strumenti/_q-soak.js
         node strumenti/_q-soak.js --partite 100
         node strumenti/_q-soak.js --partite 1000        (il volume/notte)
         node strumenti/_q-soak.js --semeBase 20260920 --taglia 5
         node strumenti/_q-soak.js --gioco fuori/bugiardo-qualcosa.html
         node strumenti/_q-soak.js --bugiardo durata
   esce 0 se zero violazioni su tutte le partite (incluso INV-15), 1 se
   almeno una e' rossa, 2 se il banco stesso e' esploso, 3 se l'uso e'
   sbagliato.
   ===================================================================== */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { semeFisso } = require('./_posa.js');
const {
  verificaCronometriFratelli, verificaTickInvarianti,
  TETTO_FOTOGRAMMI, TETTO_VEL_PALLA, TETTO_VZ_PALLA, SEME_CANTIERE, MARGINE_CONFINI,
} = require('./_q-invarianti.js');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('uso: node strumenti/_q-soak.js [--gioco file.html] [--taglia 5] [--partite 60]');
  console.log('                              [--semeBase 20260920] [--bugiardo durata]');
  process.exit(3);
}

const BUGIARDO = arg('bugiardo', '');
if (BUGIARDO && BUGIARDO !== 'durata') {
  console.error('USO: --bugiardo, se dato, deve essere "durata" (le altre nove invarianti sono gia\' provate rosse da _q-invarianti.js)');
  process.exit(3);
}

/* VINCOLO #98: il determinismo e' instabile a 7/11, il cancello ancorato
   e' a taglia 5 -- vedi la lettera di testa. */
const TAGLIA_BANCO = [5, 7, 11].includes(+arg('taglia', 5)) ? +arg('taglia', 5) : 5;
/* Stesso default di _q-invarianti.js/_q-fuzzer.js -- un unico numero
   magico per "il seme del cantiere", non uno diverso per ogni banco. */
const SEME_BASE = +arg('semeBase', SEME_CANTIERE);
/* Di serie un CAMPIONE (il piano: "50-100 partite" per la batteria);
   --partite 1000 e' il volume del mandato "1000/notte", non il default
   di ogni corsa (troppo lento per girare a ogni compito/batteria). */
const PARTITE = +arg('partite', 60);
if (!Number.isInteger(PARTITE) || PARTITE < 1) {
  console.error('USO: --partite deve essere un intero >= 1');
  process.exit(3);
}

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

/* FNV-1a, 32 bit -- solo per stampare un'IMPRONTA leggibile a occhio
   della corsa intera (vedi la lettera di testa): non e' un requisito
   crittografico, e' un modo compatto di dire "due corse hanno prodotto
   ESATTAMENTE le stesse partite" senza stampare mille righe. */
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

/* =========================================================================
   LA SONDA DEL SOAK -- gira dentro la pagina, in UN SOLO page.evaluate,
   come SONDA di _q-invarianti.js e SONDA_FUZZ di _q-fuzzer.js: nessun
   rumore di rete fra un fotogramma e l'altro. Nessun dado()/Math.random
   proprio: solo t.semina(seme) (il PRNG del gioco) e window.nuovaRosa()
   (pura) -- vedi la lettera di testa, "zero dado()/Math.random nel
   banco" e' un vincolo del piano.
   ========================================================================= */
const SONDA_SOAK = (cfg) => {
  const t = window.__test;
  const r = {
    nan: [], owner: [], punteggio: [], timeLeft: [], cronometri: [],
    clamp: [], movimento: [], palla: [], confini: [], durata: [],
    perPartita: [], tickTotali: 0, fotogrammiTotali: 0, maxFotogrammi: 0,
  };

  for (let k = 0; k < cfg.partite; k++) {
    const seme = cfg.semeBase + k;
    t.semina(seme);

    /* LA ROSA RIGENERATA (vedi la lettera di testa) -- SUBITO dopo
       t.semina, PRIMA di startMatch, come in _q-fuzzer.js. */
    if (t.save && typeof window.nuovaRosa === 'function') t.save.rosa = window.nuovaRosa();

    /* L'ORDINE (vedi la lettera di testa): giusto di serie, invertito
       SOLO per --bugiardo durata, per TUTTE le partite della corsa --
       lo scenario-hang #119 non dipende dal seme. */
    if (cfg.ordineSbagliato) {
      t.setCpuVsCpu(true);
      t.startMatch(1, 1, { size: cfg.taglia });
    } else {
      t.startMatch(1, 1, { size: cfg.taglia });
      t.setCpuVsCpu(true);
    }

    const G = t.G;
    /* CRONOMETRI-FRATELLI -- RIUSATA, SUBITO dopo startMatch, prima di
       simulare un solo fotogramma (vedi _q-invarianti.js, prova 6). */
    verificaCronometriFratelli(G, r, seme, k);

    /* FW/FH letti DOPO startMatch (dipendono dalla taglia scelta da
       setTaglia): rilettura a ogni k per correttezza, costo di un
       getter, non un ciclo caldo. */
    cfg.FW = t.campo.FW; cfg.FH = t.campo.FH;

    const stato = { prevScore: [G.score[0], G.score[1]], prevTimeLeft: G.timeLeft };
    const verificaTick = (fotogramma, fase) => verificaTickInvarianti(G, r, seme, fotogramma, fase, stato, cfg);

    /* NOTA SUL CONTEGGIO: `fotogrammi` e' l'indice (0-based) passato a
       verificaTick per il messaggio d'errore -- lo stesso uso di
       _q-invarianti.js/_q-fuzzer.js. Per riportare un CONTEGGIO esatto
       di fotogrammi eseguiti (non solo l'indice dell'ultimo), si
       incrementa una volta in piu' SOLO nei due rami che escono con
       `break` (la partita e' finita/violata a quell'indice, quindi il
       conteggio vero e' indice+1); sul ramo hang il for-loop esce da
       solo dopo aver incrementato cfg.tetto volte, gia' un conteggio
       esatto senza bisogno di correzione. */
    let fotogrammi = 0, raggiuntoEnd = false, violatoQuiSeme = false;
    for (; fotogrammi < cfg.tetto; fotogrammi++) {
      t.simulate(1 / 60);
      r.tickTotali++;
      if (verificaTick(fotogrammi, 'normale')) { violatoQuiSeme = true; fotogrammi++; break; }
      if (t.state === 'end') { raggiuntoEnd = true; fotogrammi++; break; }
    }

    /* INV-15 SU VOLUME -- vedi la lettera di testa: una partita che non
       raggiunge 'end' ne' e' stata interrotta da un'altra violazione gia'
       contata e' un hang. Non si esclude come "colpa di un'altra prova":
       se violatoQuiSeme e' vero la causa e' gia' nei contenitori sopra
       (nan/owner/... ), e questa partita NON viene contata due volte come
       durata -- e' la STESSA distinzione che _q-invarianti.js fa per i
       semi abortiti da --bugiardo. */
    if (!raggiuntoEnd && !violatoQuiSeme) {
      r.durata.push({ seme, indiceMatch: k, fotogrammi, statoFinale: t.state });
    }

    r.fotogrammiTotali += fotogrammi;
    if (fotogrammi > r.maxFotogrammi) r.maxFotogrammi = fotogrammi;
    r.perPartita.push({ seme, fotogrammi, statoFinale: t.state, punteggio: G.score.slice() });
  }
  return r;
};

(async () => {
  const t0 = Date.now();
  const provaRel = arg('gioco', '');
  const provaAbs = provaRel ? path.resolve(RADICE, provaRel) : '';
  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(semeFisso, SEME_BASE);
  const ecc = []; pag.on('pageerror', e => ecc.push(e.message));

  console.log('\n=== IL SOAK (voce #127, compito 1) ===  ' +
    (provaAbs || 'CALCETTO-il-gioco.html (repo)') + '  taglia ' + TAGLIA_BANCO +
    '  semeBase ' + SEME_BASE + '  partite ' + PARTITE + (BUGIARDO ? '  bugiardo=' + BUGIARDO : ''));

  try {
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(() => {
      const t = window.__test;
      t.dismissSplash && t.dismissSplash();
      if (t.save) t.save.tutorialDone = 1;
    });

    const cfg = {
      taglia: TAGLIA_BANCO, partite: PARTITE, semeBase: SEME_BASE, tetto: TETTO_FOTOGRAMMI,
      tettoVelPalla: TETTO_VEL_PALLA, tettoVzPalla: TETTO_VZ_PALLA, marginBordi: MARGINE_CONFINI,
      ordineSbagliato: BUGIARDO === 'durata',
    };
    /* STESSA COMPOSIZIONE di _q-invarianti.js/_q-fuzzer.js: le due
       funzioni riusate come sorgente, dentro una IIFE (page.evaluate
       vuole un'unica espressione). */
    const r = await pag.evaluate(`(function(){
      ${verificaCronometriFratelli.toString()}
      ${verificaTickInvarianti.toString()}
      return (${SONDA_SOAK})(${JSON.stringify(cfg)});
    })()`);

    const durataSecondi = ((Date.now() - t0) / 1000).toFixed(1);
    const primi = (arr, n, f) => arr.slice(0, n).map(f).join('\n         ') + (arr.length > n ? '\n         ... e altri ' + (arr.length - n) : '');

    di(r.nan.length === 0, 'NaN/Infinity -- ball.{x,y,z,vx,vy,vz} e p.{x,y,vx,vy,aiTX,aiTY} sempre finiti',
      r.nan.length === 0 ? r.tickTotali + ' fotogrammi campionati su ' + PARTITE + ' partite, nessun NaN/Infinity'
        : primi(r.nan, 5, v => 'seme ' + v.seme + ' fotogramma ' + v.fotogramma + ': ' + v.chi + '=' + v.val));

    di(r.owner.length === 0, 'owner valido -- G.ball.owner e\' -1 oppure 0..N-1, e se >=0 il giocatore non e\' out>0',
      r.owner.length === 0 ? r.tickTotali + ' fotogrammi campionati, owner sempre valido'
        : primi(r.owner, 5, v => 'seme ' + v.seme + ' fotogramma ' + v.fotogramma + ': owner=' + v.owner));

    di(r.punteggio.length === 0, 'punteggio monotono -- G.score non diminuisce mai fra due campioni',
      r.punteggio.length === 0 ? r.tickTotali + ' fotogrammi campionati, punteggio sempre non decrescente'
        : primi(r.punteggio, 5, v => 'seme ' + v.seme + ' fotogramma ' + v.fotogramma + ': ' + v.prima.join('-') + ' -> ' + v.dopo.join('-')));

    di(r.timeLeft.length === 0, 'timeLeft monotono -- G.timeLeft non cresce mai fra due campioni e non e\' mai < 0',
      r.timeLeft.length === 0 ? r.tickTotali + ' fotogrammi campionati, timeLeft sempre non crescente e >=0'
        : primi(r.timeLeft, 5, v => 'seme ' + v.seme + ' fotogramma ' + v.fotogramma + ': ' + v.prima.toFixed(3) + ' -> ' + v.dopo.toFixed(3)));

    di(r.cronometri.length === 0, 'cronometri-fratelli -- recT/vantaggio/possOwner/possT/pulse/crowdSndT/swLock/swTimer al riposo subito dopo startMatch',
      r.cronometri.length === 0 ? PARTITE + ' partite, tutti i cronometri a riposo a ogni startMatch'
        : primi(r.cronometri, 5, v => 'seme ' + v.seme + ' (partita #' + v.indiceMatch + '): ' + v.guasti.join(', ')));

    di(r.clamp.length === 0, 'clamp fiato/cond -- p.fiato e p.cond in [0,100] per ogni giocatore',
      r.clamp.length === 0 ? r.tickTotali + ' fotogrammi campionati, fiato/cond sempre in [0,100]'
        : primi(r.clamp, 5, v => 'seme ' + v.seme + ' fotogramma ' + v.fotogramma + ': ' + v.chi + '=' + v.val));

    di(r.movimento.length === 0, '>=2 uomini di movimento in campo per squadra (role!=gk, out<=0)',
      r.movimento.length === 0 ? r.tickTotali + ' fotogrammi campionati, entrambe le squadre sempre >=2 uomini di movimento'
        : primi(r.movimento, 5, v => 'seme ' + v.seme + ' fotogramma ' + v.fotogramma + ': squadra ' + v.team + ' ha ' + v.inCampo + ' uomini di movimento'));

    di(r.palla.length === 0, 'palla sotto il piano/velocita\' -- z>=0 sempre; a palla libera len(vx,vy)<=' + TETTO_VEL_PALLA + ' e |vz|<=' + TETTO_VZ_PALLA,
      r.palla.length === 0 ? r.tickTotali + ' fotogrammi campionati, z sempre >=0 e velocita\' a palla libera sempre entro i tetti'
        : primi(r.palla, 5, v => 'seme ' + v.seme + ' fotogramma ' + v.fotogramma + ': ' + v.tipo + '=' + v.val));

    di(r.confini.length === 0, 'CONFINI+MARGINE (INV-04) -- ogni giocatore entro [-' + MARGINE_CONFINI + ', FW+' + MARGINE_CONFINI + '] x [-' + MARGINE_CONFINI + ', FH+' + MARGINE_CONFINI + ']',
      r.confini.length === 0 ? r.tickTotali + ' fotogrammi campionati, nessun giocatore oltre il margine di ' + MARGINE_CONFINI + ' unita\''
        : primi(r.confini, 5, v => 'seme ' + v.seme + ' fotogramma ' + v.fotogramma + ': ' + v.chi + ' x=' + v.x.toFixed(1) + ' y=' + v.y.toFixed(1)));

    let detDurata;
    if (r.durata.length === 0) {
      detDurata = PARTITE + ' partite, TUTTE hanno raggiunto \'end\' entro ' + TETTO_FOTOGRAMMI + ' fotogrammi (max osservato: ' + r.maxFotogrammi + ')';
    } else {
      detDurata = primi(r.durata, 5, v => 'seme ' + v.seme + ' (partita #' + v.indiceMatch + '): ' + v.fotogrammi + ' fotogrammi, stato finale \'' + v.statoFinale + '\' (non ha raggiunto \'end\')');
    }
    di(r.durata.length === 0, 'INV-15 SU VOLUME -- ogni partita raggiunge \'end\' entro ' + TETTO_FOTOGRAMMI + ' fotogrammi (220 s, il tetto incorpora gia\' il margine +25% del mandato)', detDurata);

    if (ecc.length) di(false, 'BANCO -- nessuna eccezione di pagina', 'eccezione: ' + ecc[0]);

    /* L'IMPRONTA DELLA CORSA (vedi la lettera di testa) -- stampata SEMPRE,
       anche su un cancello rosso: e' cio' che due corse confrontano per
       dichiarare ripetibilita'. */
    const impronta = r.perPartita.map(p => p.seme + ':' + p.fotogrammi + ':' + p.statoFinale + ':' + p.punteggio.join('-')).join('|');
    console.log('\n  IMPRONTA (per la ripetibilita\', vedi cancello 2): ' + fnv1a(impronta) + '  (' + r.perPartita.length + ' partite)');
    console.log('  RIEPILOGO: ' + PARTITE + ' partite, ' + r.fotogrammiTotali + ' fotogrammi totali, ' +
      'max osservato ' + r.maxFotogrammi + '/' + TETTO_FOTOGRAMMI + ' fotogrammi (' + (100 * r.maxFotogrammi / TETTO_FOTOGRAMMI).toFixed(1) + '% del tetto), ' +
      'durata banco ' + durataSecondi + ' s');
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
