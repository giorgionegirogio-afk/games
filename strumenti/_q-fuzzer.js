/* =====================================================================
   _q-fuzzer.js -- IL FUZZER DI COMANDI (voce #126, onda C -- 2, compito 1).

   IL PERCHE'. Il mandato (Appendice A, INV-01..15, S13.1.2) chiede
   "property-based tests: random inputs for thousands of ticks must never
   violate the invariants". Le nove invarianti esistono gia' in
   strumenti/_q-invarianti.js (voce #125) ma le esercitano SOLO partite
   CPU contro CPU: nessun input umano-vero, quindi G.swLock/G.swTimer
   (scritti solo dal cambio-giocatore/strappo UMANO) restano vacui, e
   nessuna posizione mai spinta a fondo scala verso i confini del campo.
   Questo banco costruisce il generatore di input CASUALE (deterministico)
   che manca: guida la squadra 0 come se un pollice vero premesse i
   dischi e trascinasse lo stick, con un PRNG proprio, e verifica le
   nove invarianti RIUSATE (require, non riscritte) dopo ogni fotogramma.

   IL DUELLO NON E' GESTITO QUI (compito 2 dello stesso cantiere): quando
   una partita arriva a G.scene==='freekick', __test.simulate chiama
   Duel.update() invece di step() (CALCETTO-il-gioco.html:44278) e NIENTE
   del duello passa dal registro Reg -- risolverlo richiede
   Duel.pickZone/pickKeeper/stopPower con un log a parte, che qui non
   c'e'. Un seme che arriva li' si ESCLUDE (contatore semiEsclusiDuello,
   dichiarato, MAI nascosto nel conteggio) e si passa al seme successivo:
   altrimenti la partita si incastrerebbe per sempre (falso hang,
   indistinguibile da INV-15 rotta per davvero).

   NESSUN HOOK NUOVO: tutto qui sotto e' gia' esposto "bare" via
   page.evaluate, esattamente come G in _q-invarianti.js --
     t.semina/startMatch/registra/nastro/rigioca/simulate/pulsanti/G
   -- e Touch5.start/move/chiudi (CALCETTO-il-gioco.html:13430/13621/
   13770), che con Reg.modo===1 si auto-registrano (l'intercettore a
   :43382-43415). Il gioco non si tocca: git diff CALCETTO-il-gioco.html
   resta vuoto.

   DUE SEMI SEPARATI, DICHIARATI. `--semeGioco` governa SEME.accendi (IA e
   fisica, come sempre): passato a t.semina(semeGioco0+k) per il seme k
   della batteria, esattamente come fa _q-invarianti.js. `--semeComandi`
   governa SOLO il generatore di comandi di QUESTO banco: un xorshift
   PROPRIO (stessa formula di strumenti/_posa.js/semeFisso, stato
   indipendente, MAI Math.random), seminato a `semeComandi0+k` -- cosi'
   ogni coppia (semeGioco0+k, semeComandi0+k) e' riproducibile da sola,
   senza dover rigiocare tutti i semi precedenti per ricostruire lo stato
   del generatore.

   COME SI GENERANO I COMANDI. Non un comando a ogni tick (il tetto
   Reg.righe>40000, CALCETTO-il-gioco.html:13285, tronca IN SILENZIO): una
   decisione ogni 5-15 fotogrammi (--cadenzaMin/--cadenzaMax), a cadenza
   scelta anch'essa dal PRNG dei comandi. Ogni decisione e' UNA fra:
     - niente;
     - avviare/muovere/rilasciare lo STICK (Touch5.start/move/chiudi),
       con coordinate spesso vicine ai bordi dello schermo (bias verso il
       25% esterno dell'intervallo, meta' delle volte) per spingere i
       giocatori a fondo scala verso i confini del campo -- il caso che
       il CPU-CPU non stressa mai (INV-04, rimandata al compito 2, ma
       l'esposizione nasce qui);
     - una FINTA/STRAPPO: due mosse ravvicinate dello stick, quasi al
       centro (dentro la banda morta) e poi a piena corsa in una
       direzione molto diversa (>90 gradi) dall'ultima -- la stessa
       geometria che il gioco stesso chiama strappo (CALCETTO-il-gioco.
       html:4452-4457, STRAPPO_MORTO/STRAPPO_LAMPO/STRAPPO_DOT): non
       garantita (dipende dallo stato del comando prima e dalla cadenza),
       ma PRIVILEGIATA, com'e' un verbo che il CPU-CPU non tocca mai;
     - premere/rilasciare uno dei cinque dischi, alle coordinate VERE
       lette da t.pulsanti(0) (contestuali: TIRA/CONTRASTA, FILTRANTE/
       CAMBIO, PASSA/PRESSA, CROSS/SCIVOLATA, SCATTO/SCUDO) -- il disco 1
       (FILTRANTE/CAMBIO, che senza palla e' `cambiaGiocatore`, il verbo
       che scrive G.swLock) e' PRIVILEGIATO, con un peso piu' alto degli
       altri quattro;
     - azzerare tutti i tocchi (Touch5.azzera, raro).
   La squadra 0 e' GIA' umana dopo startMatch(1,1,{size}) (G.cpu=[false,
   true]): NON si chiama setCpuVsCpu (lo lascerebbe senza controllo,
   difetto #108/#119 -- vedi la lettera di testa di _q-invarianti.js).

   LE NOVE INVARIANTI SONO RIUSATE, NON RISCRITTE: strumenti/
   _q-invarianti.js esporta ora (refactor minimo di quel file, stesso
   compito, dichiarato nella sua stessa lettera di testa)
   `verificaTickInvarianti` e `verificaCronometriFratelli` -- lo STESSO
   codice che gia' verificava le nove prove nei banchi CPU-CPU, spostato
   in due funzioni con nome invece che scritto in linea. Da qui (Node)
   si fa `require('./_q-invarianti.js')` e si porta il CODICE SORGENTE di
   quelle due funzioni (.toString()) dentro lo script che si manda alla
   pagina, perche' da dentro un page.evaluate non si puo' fare require():
   e' lo stesso trucco con cui SONDA stessa (qui sotto) arriva in pagina.

   LA RIPETIBILITA'. Il primo seme che finisce PULITO (non escluso per
   duello, nessuna violazione) diventa il "campione": si salva il suo
   nastro (t.nastro()) e un'impronta dello stato a campione fisso (come
   strumenti/_q-determinismo.js/_q-replay.js). Su una PAGINA FRESCA si
   rifa' t.semina(semeGioco) -> startMatch -> t.rigioca(nastro) -> lo
   stesso numero di t.simulate(1/60): l'impronta deve combaciare byte per
   byte (qui: numero per numero). Al compito 1, senza duello, i semi che
   non toccano un freekick sono PIENAMENTE riproducibili dal solo nastro
   (nessun log-duelli ancora necessario -- arriva al compito 2).

   uso:  node strumenti/_q-fuzzer.js
         node strumenti/_q-fuzzer.js --semi 20 --taglia 5
         node strumenti/_q-fuzzer.js --semeGioco 20260920 --semeComandi 71260920
         node strumenti/_q-fuzzer.js --cadenzaMin 5 --cadenzaMax 15
         node strumenti/_q-fuzzer.js --gioco fuori/bugiardo-qualcosa.html
   esce 0 se le nove invarianti sono verdi su tutti i semi non esclusi, la
   ripetibilita' e' verde e il tetto Reg non e' stato sfiorato; 1 se
   qualcosa e' rosso; 2 se il banco stesso e' esploso; 3 se l'uso e'
   sbagliato.
   ===================================================================== */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { semeFisso } = require('./_posa.js');
const {
  verificaCronometriFratelli, verificaTickInvarianti,
  TETTO_FOTOGRAMMI, TETTO_VEL_PALLA, TETTO_VZ_PALLA, SEME_CANTIERE,
} = require('./_q-invarianti.js');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('uso: node strumenti/_q-fuzzer.js [--gioco file.html] [--taglia 5] [--semi 20]');
  console.log('                                 [--semeGioco N] [--semeComandi N]');
  console.log('                                 [--cadenzaMin 5] [--cadenzaMax 15]');
  process.exit(3);
}

const TAGLIA_BANCO = [5, 7, 11].includes(+arg('taglia', 5)) ? +arg('taglia', 5) : 5;
/* SEME_CANTIERE (20260920) e' lo stesso default di _q-invarianti.js --
   riusato per non inventare un secondo numero magico per la STESSA cosa
   (il seme di gioco, che governa IA/fisica). */
const SEME_GIOCO = +arg('semeGioco', SEME_CANTIERE);
/* IL SECONDO SEME, SEPARATO E DICHIARATO: governa SOLO il generatore di
   comandi di questo banco, mai il gioco. Scelto arbitrariamente diverso
   dal primo (nessuna relazione aritmetica voluta con SEME_GIOCO), cosi'
   chi legge un log non li confonde a colpo d'occhio. */
const SEME_COMANDI = +arg('semeComandi', 71260920);
const N_SEMI = +arg('semi', 20);
const CADENZA_MIN = +arg('cadenzaMin', 5);
const CADENZA_MAX = +arg('cadenzaMax', 15);
/* Quanti semi IN PIU', oltre agli N_SEMI della batteria, il banco prova
   a giocare SOLO per trovare un "campione" pulito per la prova di
   ripetibilita', se nessuno degli N_SEMI principali resta pulito (tutti
   esclusi per duello o tutti violati): non contano nella statistica
   delle nove invarianti, servono solo a non lasciare la prova 2
   (ripetibilita') senza materiale. Dichiarato nel verbale se scatta. */
const EXTRA_CAMPIONE = 10;
/* Soglia di allarme sul tetto Reg.righe>40000 (CALCETTO-il-gioco.html:
   13285, tronca IN SILENZIO): l'80%, con margine per accorgersene PRIMA
   che tronchi davvero. */
const SOGLIA_ALLARME_RIGHE = 32000;

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
   LA SONDA DEL FUZZER -- gira dentro la pagina, in UN SOLO page.evaluate
   (come SONDA di _q-invarianti.js): nessun rumore di rete fra un
   fotogramma e l'altro, e il PRNG dei comandi vive qui dentro, non in
   Node -- non e' "il banco che sceglie da fuori", e' "il banco che gioca
   da dentro", esattamente come deve essere per un dito vero. */
const SONDA_FUZZ = (cfg) => {
  const t = window.__test;
  const r = {
    nan: [], owner: [], punteggio: [], timeLeft: [], durata: [], cronometri: [],
    clamp: [], movimento: [], palla: [],
    semiEsclusiDuello: [], semiEseguiti: 0, tickTotali: 0,
    comandiEmessi: 0, finteTentate: 0, disco1Avvii: 0,
    maxRigheReg: 0, allarmiRighe: [], campione: null, violazioni: {},
  };

  /* IL PRNG PROPRIO DEL FUZZER -- stessa formula di strumenti/_posa.js
     (funzione semeFisso, la stessa che semina Math.random per i
     banchi visivi), ma UN GENERATORE INDIPENDENTE: stato locale a questa
     funzione, MAI Math.random, e MAI lo stesso oggetto del seme di gioco
     (SEME.accendi, dentro il motore). Riseminato PER SEME (vedi sotto),
     cosi' ogni coppia (semeGioco, semeComandi) e' riproducibile da sola. */
  function creaXorshift(seme) {
    let s = (seme >>> 0) || 1;
    return {
      prossimo() { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; },
    };
  }

  /* L'IMPRONTA DELLO STATO -- stesso principio di strumenti/
     _q-determinismo.js e strumenti/_q-replay.js: un digest a intervalli
     fissi, per dire "e' la stessa partita" senza portare in Node l'intero
     G ad ogni tick. */
  function leggiImpronta(G) {
    const b = G.ball;
    const s = [Math.round(b.x * 100), Math.round(b.y * 100), Math.round((b.z || 0) * 100),
      Math.round(b.vx * 100), Math.round(b.vy * 100), b.owner, b.lastTouch,
      G.score[0], G.score[1], Math.round(G.timeLeft * 100)];
    for (const p of G.players) s.push(Math.round(p.x * 100), Math.round(p.y * 100), p.out | 0);
    return s.join(',');
  }

  /* UN SEME, DALL'INIZIO ALLA FINE. `contaStatistiche` e' false SOLO per
     i tentativi extra di trovare un campione per la ripetibilita' (vedi
     EXTRA_CAMPIONE in Node): in quel caso le violazioni NON entrano nei
     contenitori della batteria principale, per non falsare "N semi,
     tante invarianti verdi" con semi che non facevano parte del lotto
     dichiarato. */
  function provaSeme(seme, semeCmd, contaStatistiche) {
    t.semina(seme);
    t.startMatch(1, 1, { size: cfg.taglia });
    /* NON setCpuVsCpu: la squadra 0 e' GIA' umana (G.cpu=[false,true]). */
    t.registra();

    const G = t.G;
    const rLocale = contaStatistiche ? r : {
      nan: [], owner: [], punteggio: [], timeLeft: [], durata: [], cronometri: [],
      clamp: [], movimento: [], palla: [],
    };
    verificaCronometriFratelli(G, rLocale, seme, 0);

    const stato = { prevScore: [G.score[0], G.score[1]], prevTimeLeft: G.timeLeft };
    const verificaTick = (fotogramma, fase) => verificaTickInvarianti(G, rLocale, seme, fotogramma, fase, stato, cfg);

    const xc = creaXorshift(semeCmd);
    const rnd01 = () => xc.prossimo() / 4294967296;
    const rndInt = (nMax) => xc.prossimo() % nMax;

    /* IL LATO DEI PULSANTI, letto UNA volta: i cinque dischi vivono
       sempre sullo stesso bordo (bx=0 oppure bx=VW, touchBtnLayout,
       CALCETTO-il-gioco.html:12931-12933) per tutta la partita -- lo
       stick va nel lato OPPOSTO, cosi' non calpesta mai un disco. */
    const btnsIniziali = t.pulsanti(0);
    const mediaX = btnsIniziali.reduce((s, b) => s + b.x, 0) / btnsIniziali.length;
    const VWp = window.innerWidth || 915, VHp = window.innerHeight || 412;
    const bottoniADestra = mediaX > VWp / 2;
    const stickXMin = bottoniADestra ? -80 : VWp * 0.55;
    const stickXMax = bottoniADestra ? VWp * 0.45 : VWp + 80;

    /* COORDINATA CON BIAS VERSO I BORDI: meta' delle volte (o poco meno)
       cade nel 25% esterno dell'intervallo -- "spesso verso i bordi",
       senza escludere il resto dell'intervallo. */
    const coordBias = (min, max) => {
      const range = max - min;
      if (rnd01() < 0.55) {
        const versoMax = rnd01() < 0.5;
        const q = rnd01() * 0.25;
        return versoMax ? (max - q * range) : (min + q * range);
      }
      return min + rnd01() * range;
    };

    let stickId = null, stickOx = 0, stickOy = 0, stickAngolo = 0;
    const discoId = [null, null, null, null, null];
    let prossimoId = 1;
    const nuovoId = () => prossimoId++;

    function decidiEAgisci(unTick) {
      const btns = t.pulsanti(0);
      const opz = [];
      opz.push([18, 'niente']);
      if (stickId === null) opz.push([10, 'stick_avvia']);
      else {
        opz.push([16, 'stick_muovi']);
        opz.push([10, 'stick_finta']);
        opz.push([7, 'stick_chiudi']);
      }
      for (let j = 0; j < 5; j++) {
        const bt = btns[j];
        if (bt.off) continue;   /* la cella spenta non risponde (voce #88): non la si preme */
        /* IL DISCO 1 (FILTRANTE/CAMBIO) E' PRIVILEGIATO: senza palla e'
           `cambiaGiocatore` (swap), il verbo che scrive G.swLock e che
           nessuna partita CPU-CPU tocca mai. */
        const peso = (j === 1) ? 12 : 5;
        if (discoId[j] === null) opz.push([peso, 'disco_avvia_' + j]);
        else opz.push([Math.max(3, Math.round(peso * 0.6)), 'disco_chiudi_' + j]);
      }
      opz.push([3, 'azzera_tutto']);

      const totale = opz.reduce((s, o) => s + o[0], 0);
      let sorte = xc.prossimo() % totale;
      let scelto = opz[opz.length - 1][1];
      for (const [peso, azione] of opz) { if (sorte < peso) { scelto = azione; break; } sorte -= peso; }

      if (scelto === 'niente') return true;

      if (scelto === 'stick_avvia') {
        stickId = nuovoId();
        stickOx = coordBias(stickXMin, stickXMax); stickOy = coordBias(-60, VHp + 60);
        Touch5.start(stickId, stickOx, stickOy);
        stickAngolo = 0;
        r.comandiEmessi++;
        return true;
      }
      if (scelto === 'stick_muovi') {
        if (stickId === null) return true;
        const x = coordBias(stickXMin, stickXMax), y = coordBias(-60, VHp + 60);
        Touch5.move(stickId, x, y);
        stickAngolo = Math.atan2(y - stickOy, x - stickOx);
        r.comandiEmessi++;
        return true;
      }
      if (scelto === 'stick_chiudi') {
        if (stickId === null) return true;
        Touch5.chiudi(stickId, false);
        stickId = null;
        r.comandiEmessi++;
        return true;
      }
      if (scelto === 'stick_finta') {
        if (stickId === null) return true;
        /* IL TENTATIVO DI STRAPPO (CALCETTO-il-gioco.html:4452-4457 e
           :14484-14508): un dito che attraversa il centro in un lampo
           (sotto STRAPPO_LAMPO=0,18s) e riappare girato di piu' di 60
           gradi e' una finta. Due mosse ravvicinate: quasi al centro
           (dentro la banda morta, un paio di pixel dall'origine), un
           t.simulate() che lascia al gioco la possibilita' di campionare
           quello stato quasi-zero, poi il ribaltone a piena corsa. Non
           garantito (dipende da quanto la memoria del comando era gia'
           carica prima), ma PRIVILEGIATO come chiede il piano. */
        Touch5.move(stickId, stickOx + 2, stickOy + 1);
        r.comandiEmessi++;
        if (!unTick('finta-centro')) return false;
        const nuovoAngolo = stickAngolo + Math.PI + (rnd01() - 0.5);
        const mag = 60 + rnd01() * 60;
        const nx = stickOx + Math.cos(nuovoAngolo) * mag, ny = stickOy + Math.sin(nuovoAngolo) * mag;
        Touch5.move(stickId, nx, ny);
        stickAngolo = nuovoAngolo;
        r.comandiEmessi++;
        r.finteTentate++;
        return true;
      }
      const mDisco = /^disco_(avvia|chiudi)_(\d)$/.exec(scelto);
      if (mDisco) {
        const j = +mDisco[2];
        if (mDisco[1] === 'avvia') {
          const bt = btns[j];
          discoId[j] = nuovoId();
          Touch5.start(discoId[j], bt.x, bt.y);
          if (j === 1) r.disco1Avvii++;
        } else {
          Touch5.chiudi(discoId[j], false);
          discoId[j] = null;
        }
        r.comandiEmessi++;
        return true;
      }
      if (scelto === 'azzera_tutto') {
        Touch5.azzera();
        stickId = null;
        for (let j = 0; j < 5; j++) discoId[j] = null;
        r.comandiEmessi++;
        return true;
      }
      return true;
    }

    let fotogrammi = 0, raggiuntoEnd = false, violatoQuiSeme = false, escludiDuello = false;
    const impronteSeed = [];

    /* IL SOLO TICK, in un posto solo: cosi' decidiEAgisci puo' consumarne
       uno extra (la finta) senza duplicare la verifica. ORDINE (dal
       piano, compito 1): simulate, POI le nove invarianti, POI il
       controllo duello -- cosi' anche il fotogramma di transizione verso
       'freekick' viene verificato prima di essere escluso. */
    function unTick(fase) {
      t.simulate(1 / 60);
      r.tickTotali++;
      const fg = fotogrammi;
      fotogrammi++;
      if (fg % 20 === 0) impronteSeed.push(leggiImpronta(G));
      if (verificaTick(fg, fase)) { violatoQuiSeme = true; return false; }
      if (G.scene === 'freekick' || t.state === 'freekick') { escludiDuello = true; return false; }
      if (t.state === 'end') { raggiuntoEnd = true; return false; }
      return true;
    }

    let prossimoComando = cfg.cadenzaMin + rndInt(cfg.cadenzaMax - cfg.cadenzaMin + 1);
    while (fotogrammi < cfg.tetto) {
      prossimoComando--;
      if (prossimoComando <= 0) {
        prossimoComando = cfg.cadenzaMin + rndInt(cfg.cadenzaMax - cfg.cadenzaMin + 1);
        if (!decidiEAgisci(unTick)) break;
      }
      if (!unTick('normale')) break;
    }

    const righeReg = t.registroRighe;
    if (contaStatistiche) {
      r.maxRigheReg = Math.max(r.maxRigheReg, righeReg);
      if (righeReg >= cfg.sogliaAllarmeRighe) r.allarmiRighe.push({ seme, righeReg });

      if (escludiDuello) {
        r.semiEsclusiDuello.push({ seme, fotogrammi });
      } else if (!raggiuntoEnd && !violatoQuiSeme) {
        /* PROVA 5 (durata<=tetto), sullo stesso principio di
           _q-invarianti.js: un seme che non ha ne' finito ne' violato
           ne' e' stato escluso per duello, e ha esaurito il tetto, e' un
           hang vero. */
        r.durata.push({ seme, fotogrammi, statoFinale: t.state });
      }
      r.semiEseguiti++;
    }

    return { seme, escludiDuello, violatoQuiSeme, raggiuntoEnd, fotogrammi, righeReg, impronteSeed };
  }

  for (let k = 0; k < cfg.semi; k++) {
    const semeCmdK = cfg.semeComandi0 + k;
    const esito = provaSeme(cfg.semeGioco0 + k, semeCmdK, true);
    /* UNA VIOLAZIONE VERA: si cattura SUBITO il nastro (Reg.righe e'
       ancora quello di questo seme -- il prossimo t.registra(), al giro
       dopo, lo azzera). PER TIPO DI INVARIANTE (non solo la primissima in
       assoluto): due cause diverse possono condannare due prove diverse
       su semi diversi, e appiattirle sulla prima sola ne nasconderebbe
       una -- il mandato (S13.3, "ogni crash riprodotto da un replay") non
       fa distinzione fra scoperte, solo la PRIMA occorrenza DI CIASCUN
       TIPO, per non moltiplicare file quando la stessa causa condanna piu'
       semi con lo stesso tipo. */
    if (esito.violatoQuiSeme) {
      for (const chiave of ['nan', 'owner', 'punteggio', 'timeLeft', 'clamp', 'movimento', 'palla']) {
        if (r.violazioni[chiave]) continue;
        const trovati = r[chiave].filter(v => v.seme === esito.seme);
        if (trovati.length) {
          r.violazioni[chiave] = {
            seme: esito.seme, semeComandi: semeCmdK, fotogrammi: esito.fotogrammi,
            nastro: t.nastro(), dettaglio: trovati,
          };
        }
      }
    }
    if (!r.campione && !esito.escludiDuello && !esito.violatoQuiSeme) {
      r.campione = {
        seme: esito.seme, fotogrammiEseguiti: esito.fotogrammi,
        nastro: t.nastro(), impronte: esito.impronteSeed, raggiuntoEnd: esito.raggiuntoEnd,
      };
    }
  }
  /* NESSUN SEME PRINCIPALE E' RIMASTO PULITO (tutti esclusi per duello o
     violati): si cercano fino a cfg.extraCampione semi IN PIU', SENZA
     farli entrare nella statistica della batteria (contaStatistiche =
     false) -- dichiarato in r.campioneExtra. */
  if (!r.campione) {
    for (let e = 0; e < cfg.extraCampione; e++) {
      const semeExtra = cfg.semeGioco0 + cfg.semi + e;
      const esito = provaSeme(semeExtra, cfg.semeComandi0 + cfg.semi + e, false);
      if (!esito.escludiDuello && !esito.violatoQuiSeme) {
        r.campione = {
          seme: esito.seme, fotogrammiEseguiti: esito.fotogrammi,
          nastro: t.nastro(), impronte: esito.impronteSeed, raggiuntoEnd: esito.raggiuntoEnd,
        };
        r.campioneExtra = e + 1;
        break;
      }
    }
  }
  return r;
};

/* la stessa impronta, lato Node, per il confronto della ripetibilita' */
const LEGGI_IMPRONTA_REPLAY = (G) => {
  const b = G.ball;
  const s = [Math.round(b.x * 100), Math.round(b.y * 100), Math.round((b.z || 0) * 100),
    Math.round(b.vx * 100), Math.round(b.vy * 100), b.owner, b.lastTouch,
    G.score[0], G.score[1], Math.round(G.timeLeft * 100)];
  for (const p of G.players) s.push(Math.round(p.x * 100), Math.round(p.y * 100), p.out | 0);
  return s.join(',');
};

const primoScarto = (a, b) => {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) return i;
  return a.length === b.length ? -1 : n;
};

(async () => {
  const provaRel = arg('gioco', '');
  const provaAbs = provaRel ? path.resolve(RADICE, provaRel) : '';
  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(semeFisso, SEME_GIOCO);
  const ecc = []; pag.on('pageerror', e => ecc.push(e.message));

  console.log('\n=== IL FUZZER DI COMANDI (voce #126) ===  ' +
    (provaAbs || 'CALCETTO-il-gioco.html (repo)') + '  taglia ' + TAGLIA_BANCO +
    '  semeGioco ' + SEME_GIOCO + '  semeComandi ' + SEME_COMANDI +
    '  semi ' + N_SEMI + '  cadenza ' + CADENZA_MIN + '-' + CADENZA_MAX + ' tick');

  try {
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(() => {
      const t = window.__test;
      t.dismissSplash && t.dismissSplash();
      if (t.save) t.save.tutorialDone = 1;
    });

    const cfg = {
      taglia: TAGLIA_BANCO, semi: N_SEMI, semeGioco0: SEME_GIOCO, semeComandi0: SEME_COMANDI,
      tetto: TETTO_FOTOGRAMMI, cadenzaMin: CADENZA_MIN, cadenzaMax: CADENZA_MAX,
      tettoVelPalla: TETTO_VEL_PALLA, tettoVzPalla: TETTO_VZ_PALLA,
      sogliaAllarmeRighe: SOGLIA_ALLARME_RIGHE, extraCampione: EXTRA_CAMPIONE,
    };
    /* STESSA COMPOSIZIONE DI _q-invarianti.js: le due funzioni riusate,
       come sorgente, dentro una IIFE (page.evaluate(stringa) vuole
       un'unica espressione: due `function` di seguito a livello di
       statement danno "Unexpected token 'function'", misurato mettendo
       a punto quel file). */
    const r = await pag.evaluate(`(function(){
      ${verificaCronometriFratelli.toString()}
      ${verificaTickInvarianti.toString()}
      return (${SONDA_FUZZ})(${JSON.stringify(cfg)});
    })()`);

    const primi = (arr, n, f) => arr.slice(0, n).map(f).join('\n         ') + (arr.length > n ? '\n         … e altri ' + (arr.length - n) : '');

    console.log('\n-- LA BATTERIA --');
    console.log('  semi lanciati: ' + N_SEMI + '   esclusi per duello (non gestito, compito 2): ' + r.semiEsclusiDuello.length +
      '   semi eseguiti nella statistica: ' + r.semiEseguiti);
    if (r.semiEsclusiDuello.length) {
      console.log('    esclusi: ' + primi(r.semiEsclusiDuello, 10, v => 'seme ' + v.seme + ' (fotogramma ' + v.fotogrammi + ')'));
    }
    console.log('  fotogrammi totali simulati: ' + r.tickTotali + '   comandi emessi: ' + r.comandiEmessi +
      '   finte/strappi tentati: ' + r.finteTentate + '   avvii disco1 (swap-privilegiato): ' + r.disco1Avvii);

    console.log('\n-- LE NOVE INVARIANTI (riusate da _q-invarianti.js) --');
    di(r.nan.length === 0, '1. NaN/Infinity -- ball.{x,y,z,vx,vy,vz} e p.{x,y,vx,vy,aiTX,aiTY} sempre finiti',
      r.nan.length === 0 ? r.tickTotali + ' fotogrammi campionati, nessun NaN/Infinity'
        : primi(r.nan, 5, v => 'seme ' + v.seme + ' fotogramma ' + v.fotogramma + ' (' + v.fase + '): ' + v.chi + '=' + v.val));

    di(r.owner.length === 0, '2. owner valido -- G.ball.owner e\' -1 oppure 0..N-1, e se >=0 il giocatore non e\' out>0',
      r.owner.length === 0 ? r.tickTotali + ' fotogrammi campionati, owner sempre valido'
        : primi(r.owner, 5, v => 'seme ' + v.seme + ' fotogramma ' + v.fotogramma + ' (' + v.fase + '): owner=' + v.owner));

    di(r.punteggio.length === 0, '3. punteggio monotono -- G.score non diminuisce mai fra due campioni',
      r.punteggio.length === 0 ? r.tickTotali + ' fotogrammi campionati, punteggio sempre non decrescente'
        : primi(r.punteggio, 5, v => 'seme ' + v.seme + ' fotogramma ' + v.fotogramma + ': ' + v.prima.join('-') + ' -> ' + v.dopo.join('-')));

    di(r.timeLeft.length === 0, '4. timeLeft monotono -- G.timeLeft non cresce mai fra due campioni e non e\' mai < 0',
      r.timeLeft.length === 0 ? r.tickTotali + ' fotogrammi campionati, timeLeft sempre non crescente e >=0'
        : primi(r.timeLeft, 5, v => 'seme ' + v.seme + ' fotogramma ' + v.fotogramma + ': ' + v.prima.toFixed(3) + ' -> ' + v.dopo.toFixed(3)));

    di(r.durata.length === 0, '5. durata<=tetto (INV-15) -- ogni seme non escluso raggiunge \'end\' entro ' + TETTO_FOTOGRAMMI + ' fotogrammi',
      r.durata.length === 0 ? r.semiEseguiti + ' semi eseguiti, nessun hang vero'
        : primi(r.durata, 5, v => 'seme ' + v.seme + ': ' + v.fotogrammi + ' fotogrammi, stato finale \'' + v.statoFinale + '\''));

    di(r.cronometri.length === 0, '6. cronometri-fratelli -- recT/vantaggio/possOwner/possT/pulse/crowdSndT/swLock/swTimer al riposo subito dopo startMatch',
      r.cronometri.length === 0 ? r.semiEseguiti + ' partite, tutti i cronometri a riposo a ogni startMatch'
        : primi(r.cronometri, 5, v => 'seme ' + v.seme + ': ' + v.guasti.join(', ')));

    di(r.clamp.length === 0, '7. clamp fiato/cond -- p.fiato e p.cond in [0,100] per ogni giocatore',
      r.clamp.length === 0 ? r.tickTotali + ' fotogrammi campionati, fiato/cond sempre in [0,100]'
        : primi(r.clamp, 5, v => 'seme ' + v.seme + ' fotogramma ' + v.fotogramma + ': ' + v.chi + '=' + v.val));

    di(r.movimento.length === 0, '8. >=2 uomini di movimento in campo per squadra (role!=gk, out<=0)',
      r.movimento.length === 0 ? r.tickTotali + ' fotogrammi campionati, entrambe le squadre sempre >=2 uomini di movimento'
        : primi(r.movimento, 5, v => 'seme ' + v.seme + ' fotogramma ' + v.fotogramma + ': squadra ' + v.team + ' ha ' + v.inCampo));

    di(r.palla.length === 0, '9. palla sotto il piano/velocita\' -- z>=0 sempre; a palla libera entro i tetti calibrati',
      r.palla.length === 0 ? r.tickTotali + ' fotogrammi campionati, sempre entro i tetti'
        : primi(r.palla, 5, v => 'seme ' + v.seme + ' fotogramma ' + v.fotogramma + ': ' + v.tipo + '=' + v.val));

    /* ---- P0: VIOLAZIONI VERE -- si catturano, non si nascondono. UNA
       fixture + UNA riproduzione per ciascun TIPO di invariante violata
       (la prima occorrenza di quel tipo): due cause diverse condannano
       due prove diverse su semi diversi, e non e' la stessa scoperta. */
    const tipiViolati = Object.keys(r.violazioni);
    if (tipiViolati.length) {
      if (!fs.existsSync(path.join(RADICE, 'fuori'))) fs.mkdirSync(path.join(RADICE, 'fuori'));
      /* LA RIPRODUZIONE (mandato S13.3: "ogni crash riprodotto da un
         replay"): pagina fresca, si rigioca lo STESSO nastro fino allo
         STESSO fotogramma, si rilanciano le nove invarianti (le stesse,
         riusate) sullo stesso G -- se la violazione e' vera, ricompare
         identica, non per fortuna. */
      const SONDA_REPLAY_VIOLAZIONE = (cfg) => {
        const t = window.__test;
        const r = { nan: [], owner: [], punteggio: [], timeLeft: [], durata: [], cronometri: [], clamp: [], movimento: [], palla: [] };
        t.semina(cfg.seme);
        t.startMatch(1, 1, { size: cfg.taglia });
        t.rigioca(cfg.nastro);
        const G = t.G;
        verificaCronometriFratelli(G, r, cfg.seme, 0);
        const stato = { prevScore: [G.score[0], G.score[1]], prevTimeLeft: G.timeLeft };
        for (let fg = 0; fg < cfg.fotogrammi; fg++) {
          t.simulate(1 / 60);
          verificaTickInvarianti(G, r, cfg.seme, fg, 'replay', stato, cfg);
        }
        return r;
      };
      for (const chiave of tipiViolati) {
        const v0 = r.violazioni[chiave];
        console.log('\n-- P0: VIOLAZIONE VERA TROVATA (' + chiave + ', seme ' + v0.seme + ', semeComandi ' + v0.semeComandi + ', fotogramma ' + (v0.fotogrammi - 1) + ') --');
        console.log('  dettaglio: ' + JSON.stringify(v0.dettaglio));
        const nomeFixture = 'fuori/_fuzzer-violazione-' + chiave + '-' + v0.seme + '-' + v0.semeComandi + '.json';
        fs.writeFileSync(path.join(RADICE, nomeFixture), JSON.stringify({
          cantiere: 'voce-126-fuzzer-compito1', taglia: TAGLIA_BANCO, tipo: chiave,
          semeGioco: v0.seme, semeComandi: v0.semeComandi, fotogrammi: v0.fotogrammi,
          dettaglio: v0.dettaglio, nastro: v0.nastro,
        }, null, 2));
        console.log('  fixture (usa-e-getta, non committata, promuovibile): ' + nomeFixture);

        const ctx3 = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
        const pag3 = await ctx3.newPage();
        await pag3.addInitScript(semeFisso, v0.seme);
        await pag3.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
        await pag3.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
        await pag3.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
        const r2 = await pag3.evaluate(`(function(){
          ${verificaCronometriFratelli.toString()}
          ${verificaTickInvarianti.toString()}
          return (${SONDA_REPLAY_VIOLAZIONE})(${JSON.stringify({
            seme: v0.seme, taglia: TAGLIA_BANCO, nastro: v0.nastro, fotogrammi: v0.fotogrammi,
            tettoVelPalla: TETTO_VEL_PALLA, tettoVzPalla: TETTO_VZ_PALLA,
          })});
        })()`);
        const riprodotta = r2[chiave] && r2[chiave].length > 0;
        di(riprodotta, 'la violazione (' + chiave + ') si riproduce dal SOLO nastro su pagina fresca (stesso seme, stesso replay)',
          riprodotta ? 'confermata: ' + JSON.stringify(r2[chiave][r2[chiave].length - 1])
            : 'NON riprodotta identica al replay (' + (r2[chiave] || []).length + ' voci trovate) -- da indagare, potrebbe dipendere da uno stato non catturato dal nastro');
        await ctx3.close();
      }
    }

    console.log('\n-- IL TETTO Reg.righe>40000 (:13285, tronca in silenzio) --');
    di(r.maxRigheReg < 40000, 'max righe Reg osservato su un singolo seme: ' + r.maxRigheReg + ' (tetto 40000, soglia allarme ' + SOGLIA_ALLARME_RIGHE + ')',
      r.allarmiRighe.length ? 'ALLARME: ' + primi(r.allarmiRighe, 5, v => 'seme ' + v.seme + ': ' + v.righeReg + ' righe') : 'nessun seme oltre la soglia di allarme');

    /* ---- LA RIPETIBILITA' ---- */
    console.log('\n-- LA RIPETIBILITA\' (stessa coppia di semi -> stessa partita) --');
    if (!r.campione) {
      di(false, 'ripetibilita\'', 'NESSUN seme pulito trovato (ne\' fra i ' + N_SEMI + ' principali ne\' fra i ' + EXTRA_CAMPIONE + ' extra): impossibile provarla questa corsa');
    } else {
      if (r.campioneExtra) console.log('  (nessuno dei ' + N_SEMI + ' semi principali era pulito: il campione arriva dal ' + r.campioneExtra + 'o seme extra, dichiarato)');
      const camp = r.campione;
      const ctx2 = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
      const pag2 = await ctx2.newPage();
      await pag2.addInitScript(semeFisso, camp.seme);
      const ecc2 = []; pag2.on('pageerror', e => ecc2.push(e.message));
      await pag2.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
      await pag2.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
      await pag2.evaluate(() => {
        const t = window.__test;
        t.dismissSplash && t.dismissSplash();
        if (t.save) t.save.tutorialDone = 1;
      });
      /* L'ORDINE (dal piano, compito 1): pagina fresca, t.semina(semeGioco),
         startMatch (serve a creare la partita: senza, G.players non
         esiste), t.rigioca(nastro) -- Reg.deserializza non tocca G, quindi
         l'ordine fra rigioca e startMatch non cambia il risultato, ma si
         segue alla lettera l'ordine dichiarato nel piano. */
      const replay = await pag2.evaluate(([seme, nastro, taglia, fotogrammi, IMPR]) => {
        const t = window.__test;
        const G = window.__test.G;
        t.semina(seme);
        t.startMatch(1, 1, { size: taglia });
        t.rigioca(nastro);
        const leggi = new Function('G', 'return (' + IMPR + ')(G)');
        const impronte = [];
        for (let f = 0; f < fotogrammi; f++) {
          t.simulate(1 / 60);
          if (f % 20 === 0) impronte.push(leggi(G));
        }
        return { impronte, gol: [G.score[0], G.score[1]], righeRilette: t.registroRighe };
      }, [camp.seme, camp.nastro, TAGLIA_BANCO, camp.fotogrammiEseguiti, LEGGI_IMPRONTA_REPLAY.toString()]);
      const kScarto = primoScarto(camp.impronte, replay.impronte);
      di(kScarto < 0, 'la stessa coppia (semeGioco=' + camp.seme + ', semeComandi) rigiocata da\' la stessa partita',
        kScarto < 0 ? camp.impronte.length + ' campioni, risultato ' + replay.gol.join('-') + ', ' + replay.righeRilette + ' comandi riletti'
          : 'divergono al campione ' + kScarto + ' (fotogramma ' + (kScarto * 20) + ')');
      await ctx2.close();
      if (ecc2.length) console.log('  (eccezioni sulla pagina di replay: ' + ecc2.slice(0, 2).join(' | ') + ')');
    }

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
