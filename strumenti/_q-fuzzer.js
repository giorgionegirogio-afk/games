/* =====================================================================
   _q-fuzzer.js -- IL FUZZER DI COMANDI (voce #126, onda C -- 2).

   IL PERCHE'. Il mandato (Appendice A, INV-01..15, S13.1.2) chiede
   "property-based tests: random inputs for thousands of ticks must never
   violate the invariants". Le dodici invarianti esistono gia' in
   strumenti/_q-invarianti.js (voce #125/#128) ma le esercitano SOLO
   partite CPU contro CPU: nessun input umano-vero, quindi G.swLock/
   G.swTimer (scritti solo dal cambio-giocatore/strappo UMANO) restano
   vacui, e nessuna posizione mai spinta a fondo scala verso i confini
   del campo. Questo banco costruisce il generatore di input CASUALE
   (deterministico) che manca: guida la squadra 0 come se un pollice vero
   premesse i dischi e trascinasse lo stick, con un PRNG proprio, e
   verifica le dodici invarianti RIUSATE (require, non riscritte) dopo
   ogni fotogramma.

   COMPITO 1 (fatto, ricostruito su main sano): il fuzzer base -- stick e
   cinque dischi, cadenza realistica, nove invarianti riusate, tetto Reg
   vigilato, ripetibilita' verificata. IL DUELLO NON era gestito: un seme
   che arrivava a G.scene==='freekick' si ESCLUDEVA (contatore dichiarato).

   COMPITO 2 (questo compito), tre pezzi piu' una verifica:
     (a) IL DUELLO GESTITO. __test.simulate chiama Duel.update() invece
         di step() quando G.scene==='freekick' (CALCETTO-il-gioco.html:
         44322-44324): il tick del nastro Reg sta fermo e NIENTE del
         duello vi finisce (il gioco stesso lo dichiara, vedi
         CALCETTO-il-gioco.html:43301-43336, "IL REPLAY SI FERMA AL
         DISCHETTO"). Senza intervento, la fase 'zone' (tiratore umano) e
         la fase 'power' (idem) non hanno NESSUN timeout automatico --
         restano ferme per sempre, un falso hang indistinguibile da INV-15
         rotta per davvero (misurato leggendo Duel.update, che gestisce
         SOLO il tiratore CPU in quei due rami; la fase 'wait', invece, ha
         SEMPRE un timeout generico -- 0,3s se il portiere e' CPU, 3s se e'
         umano -- quindi non si incastra mai da sola, ma qui si risolve
         comunque ATTIVAMENTE per esercitare pickKeeper invece di aspettare
         il ripiego). Questo compito intercetta G.scene==='freekick' a ogni
         tick e, quando tocca al lato umano (squadra 0) decidere, chiama
         t.Duel.pickZone(z,u,v) / t.Duel.stopPower() / t.Duel.pickKeeper(z)
         col PRNG del fuzzer (STESSO xorshift dei comandi, nessun terzo
         seme): z/u/v imitano un dito vero dentro lo specchio (stessa
         geometria di duelMira, CALCETTO-il-gioco.html:22642-22657), il
         MOMENTO in cui si agisce e' probabilistico (cfg.probAzioneDuello
         per tick: un tempo di reazione, non un riflesso immediato). Ogni
         chiamata si LOGGA A PARTE (array logDuelli, {seme, fotogramma,
         metodo, argomenti}): Reg non lo cattura, e senza questo log un
         replay del nastro si fermerebbe in eterno al primo dischetto,
         esattamente come il gioco stesso dichiara.
         RETTIFICA A EDIZIONI (21 settembre 2026, voce #131): dopo il
         #131 Reg CATTURA il duello (le tre porte del dischetto entrano
         nel nastro, tipo 6). Il logDuelli riapplicato a mano qui sopra
         resta, ma e' ormai NEUTRALIZZATO dalla guardia di rilettura
         (Reg.modo===2 && !Reg.dentro && !daMotore): un doppio effetto
         che non arriva mai, peso morto che non sposta il cancello (resta
         verde). Il testo vecchio non si cancella, si legge cosi'. I semi
         che arrivano al
         duello NON si escludono piu' (contatore semiEsclusiDuello sempre
         a zero, dichiarato qui, non nascosto). Le invarianti continuano a
         verificarsi a OGNI tick anche dentro 'freekick' (unTick non
         distingue fase, vedi sotto).
     (b) LA RIPRODUZIONE. Pagina fresca, t.semina(semeGioco), startMatch,
         t.rigioca(nastro) -- ma stavolta il log-duelli va RIAPPLICATO per
         tick nello stesso loop di t.simulate(): senza, un seme che passa
         da un dischetto divergerebbe dal fotogramma del duello in poi
         (Duel non lo sa che deve rifare le stesse scelte). Prova
         RIPRODUZIONE: nastro+log-duelli rigiocati su pagina nuova
         producono la STESSA impronta campionata, byte per byte (qui:
         numero per numero) -- e la STESSA macchina serve a riprodurre una
         violazione vera (mandato S13.3, "ogni crash riprodotto da un
         replay").
     (c) INV-04 -- CONFINI+MARGINE. Nuova invariante, aggiunta a
         strumenti/_q-invarianti.js (prova 12, riusata qui come le altre
         undici: vedi la sua lettera di testa per il margine, 110 unita',
         e le due uscite legittime del motore che deve coprire senza
         condannarle). Lo stick fuzzato a fondo scala verso i bordi (bias
         gia' del compito 1, mai tolto) la stressa per la prima volta: un
         banco CPU-CPU a seme fisso non spinge mai un giocatore vicino al
         bordo.
     (d) DETERMINISMO CROSS-PARTITA. La diagnosi del residuo (voce #128)
         ha stabilito che a taglia 5 la SIMULAZIONE e' deterministica ma
         il canale INPUT-A-TOCCHI aveva un residuo noto (l'origine della
         levetta, stick.ox/oy, sopravvissuta da una partita alla
         successiva sulla STESSA pagina -- CALCETTO-il-gioco.html:
         13217-13247, l'autopsia della voce #68). Quella cura vive gia'
         dentro Reg.accendi() (chiamato da t.registra(), che questo
         fuzzer chiama a OGNI seme): azzeraComandi() svuota Touch5.stick
         (ox/oy/dx/dy/hist) prima di ogni partita registrata -- VERIFICATO
         qui a numeri (non dato per assunto), confrontando campo per campo
         (non solo l'impronta arrotondata) i due Touch5.stick al fotogramma
         della PRIMA divergenza trovata: IDENTICI. Il residuo anticipato
         dal piano NON e' la causa: e' gia' sano.
         LA CAUSA VERA, trovata misurando (fuori/_diag-crosspartita-
         scratch.js, usa-e-getta, non committato): confrontando un seme
         giocato in sequenza contro lo STESSO seme isolato, G.players[i].
         tecnica differiva GIA' al fotogramma 0 (PRIMA di ogni comando) --
         69 contro 63 per un giocatore, 55 contro 53 per un altro. Non e'
         il canale input-a-tocchi: e' SAVE.rosa, la rosa di casa, creata
         UNA sola volta per pagina (CALCETTO-il-gioco.html:10137,
         "if(!SAVE.rosa) SAVE.rosa=nuovaRosa()") e fatta CRESCERE di un
         attributo a caso a ogni fine-partita (righe 41623-41635: la
         progressione-carriera, un pregio del gioco vero, non un difetto).
         Su una pagina che gioca N semi in sequenza la rosa arriva al seme
         k gia' cresciuta di k partite; su una pagina isolata nasce
         sempre fresca -- le due partite NON POSSONO combaciare finche'
         quella crescita resta accesa, indipendentemente da Touch5.
         LA CURA (dentro provaSeme qui sotto, subito dopo t.semina e
         prima di startMatch): t.save.rosa = window.nuovaRosa() -- non un
         semplice azzeramento (misurato ROTTO: nullare SAVE.rosa non
         "la fa rinascere", fa cadere setupPlayers nel ramo "nessuna
         rosa", cloni a statistica media -- vedi il commento dentro
         provaSeme per l'autopsia di questo primo tentativo sbagliato),
         ma una RI-GENERAZIONE esplicita della stessa rosa-base che il
         caricamento della pagina scrive una volta sola (nuovaRosa() e'
         pura: stesso risultato ogni volta, verificato a numeri). Lo
         STESSO principio del mandato ("azzera lo stato che sopravvive a
         una partita sulla stessa pagina"), ma su un canale diverso da
         quello anticipato (la carriera, non i tocchi) e con un verbo
         diverso (rigenera, non azzera: azzerare qui avrebbe rotto tutto).
         SENZA questa cura la riproduzione del punto (b) sarebbe
         silenziosamente rotta per
         OGNI seme oltre il primo: una violazione trovata al seme k>0,
         riprodotta su pagina fresca con solo nastro+log-duelli, avrebbe
         giocato con una rosa diversa da quella vera -- lo stesso
         principio, applicato dove serve davvero.
         Il confronto (impronte campionate ogni 20 tick) verifica che la
         cura basti: se un domani un'ALTRA fonte di stato persistente
         emergesse, questa stessa prova la condannerebbe di nuovo.
         RETTIFICA (revisione finale del ramo, MINORE 2, compito di
         correzione): il primo giro di questo compito confrontava DUE
         indici, k=1 e k=N_SEMI-1. Misurato dopo la revisione: k=1 (una
         sola partita precedente) NON e' sensibile a questo residuo --
         resta verde ANCHE con la cura rotta, perche' un solo incremento
         di un attributo di un giocatore su cinque non sposta le
         posizioni abbastanza da superare l'arrotondamento a 2 decimali
         dell'impronta. Tenerlo nel cancello era un falso senso di
         copertura: e' stato tolto. Resta il SOLO indice ALTO (N_SEMI-1,
         quello che ha condannato il residuo la prima volta), sotto
         SOGLIA_SEMI_CROSSCHECK (--semi < 8) il cancello si SALTA,
         dichiarato, invece di passare verde senza aver esercitato
         nulla -- vedi INDICE_CROSS_CHECK_ALTO/SOGLIA_SEMI_CROSSCHECK
         piu' sotto.

   NESSUN HOOK NUOVO: tutto qui sotto e' gia' esposto "bare" via
   page.evaluate, esattamente come G in _q-invarianti.js --
     t.semina/startMatch/registra/nastro/rigioca/simulate/pulsanti/G/Duel
   -- e Touch5.start/move/chiudi (CALCETTO-il-gioco.html:13430/13621/
   13770), che con Reg.modo===1 si auto-registrano (l'intercettore a
   :43382-43415). t.Duel e' la STESSA referenza viva di Duel (esposta via
   lo shorthand "G, Duel, Tut" in fondo a __test, CALCETTO-il-gioco.html:
   44583) -- si usa t.Duel invece del bare Duel per lo stesso motivo per
   cui il resto del banco usa t.G invece del bare G: un handle dichiarato
   per questo scopo, non un accesso lessicale implicito. Il gioco non si
   tocca: git diff CALCETTO-il-gioco.html resta vuoto.

   DUE SEMI SEPARATI, DICHIARATI (INVARIATO dal compito 1). `--semeGioco`
   governa SEME.accendi (IA e fisica); `--semeComandi` governa SOLO il
   generatore di comandi E le decisioni del duello di QUESTO banco: lo
   STESSO xorshift, un solo stato per seme, cosi' ogni coppia
   (semeGioco0+k, semeComandi0+k) resta riproducibile da sola.

   LE DODICI INVARIANTI SONO RIUSATE, NON RISCRITTE: strumenti/
   _q-invarianti.js esporta `verificaTickInvarianti`, `verificaCronometriFratelli`
   e MARGINE_CONFINI (prova 12, questo stesso compito). Da qui (Node) si fa
   `require('./_q-invarianti.js')` e si porta il CODICE SORGENTE di quelle
   due funzioni (.toString()) dentro lo script che si manda alla pagina.

   uso:  node strumenti/_q-fuzzer.js
         node strumenti/_q-fuzzer.js --semi 20 --taglia 5
         node strumenti/_q-fuzzer.js --semeGioco 20260920 --semeComandi 71260920
         node strumenti/_q-fuzzer.js --cadenzaMin 5 --cadenzaMax 15
         node strumenti/_q-fuzzer.js --gioco fuori/bugiardo-qualcosa.html
   esce 0 se le dodici invarianti sono verdi su tutti i semi (nessuno
   escluso: il duello e' gestito), la riproduzione e' verde, il
   determinismo cross-partita e' verde e il tetto Reg non e' stato
   sfiorato; 1 se qualcosa e' rosso; 2 se il banco stesso e' esploso; 3 se
   l'uso e' sbagliato.
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
   comandi (e, dal compito 2, le decisioni del duello) di questo banco,
   mai il gioco. Scelto arbitrariamente diverso dal primo (nessuna
   relazione aritmetica voluta con SEME_GIOCO), cosi' chi legge un log non
   li confonde a colpo d'occhio. */
const SEME_COMANDI = +arg('semeComandi', 71260920);
const N_SEMI = +arg('semi', 20);
const CADENZA_MIN = +arg('cadenzaMin', 5);
const CADENZA_MAX = +arg('cadenzaMax', 15);
/* Quanti semi IN PIU', oltre agli N_SEMI della batteria, il banco prova
   a giocare SOLO per trovare un "campione" pulito per la prova di
   riproduzione, se nessuno degli N_SEMI principali resta pulito (tutti
   violati -- dal compito 2 nessun seme si esclude piu' per duello): non
   contano nella statistica delle dodici invarianti, servono solo a non
   lasciare la prova senza materiale. Dichiarato nel verbale se scatta. */
const EXTRA_CAMPIONE = 10;
/* Soglia di allarme sul tetto Reg.righe>40000 (CALCETTO-il-gioco.html:
   13285, tronca IN SILENZIO): l'80%, con margine per accorgersene PRIMA
   che tronchi davvero. */
const SOGLIA_ALLARME_RIGHE = 32000;
/* IL TEMPO DI REAZIONE DEL DUELLO (compito 2, punto a): probabilita' per
   TICK di agire quando una decisione (pickZone/stopPower/pickKeeper) e'
   pendente lato umano. 0,35 da' un'attesa attesa di ~2,9 tick (~48 ms a
   60 Hz): abbastanza rapido da non consumare il tetto fotogrammi in
   attese, abbastanza vario (col PRNG del fuzzer) da non essere un riflesso
   a orologeria. Le fasi 'zone'/'power' del tiratore umano NON hanno un
   timeout nel gioco (vedi la lettera di testa): senza questo intervento
   si incastrerebbero per sempre, quindi la probabilita' deve restare
   abbastanza alta da garantire una risoluzione ben dentro il tetto
   TETTO_FOTOGRAMMI anche nel caso peggiore statisticamente plausibile. */
const PROB_AZIONE_DUELLO = 0.35;
/* DETERMINISMO CROSS-PARTITA (compito 2, punto d; MINORE 2 della
   revisione finale, compito di correzione): un SOLO indice, quello con
   PIU' stato accumulato alle spalle (N_SEMI-1 partite precedenti sulla
   stessa pagina), non k=1. MISURATO (revisione del compito 2): k=1 (una
   sola partita precedente) NON e' sensibile al residuo SAVE.rosa -- resta
   verde ANCHE quando la cura e' rotta (un solo incremento casuale di UN
   attributo di UN giocatore su cinque non sposta le posizioni abbastanza
   da superare l'arrotondamento a 2 decimali dell'impronta entro la
   finestra campionata). Tenerlo nel cancello sarebbe un falso senso di
   copertura: e' proprio il motivo per cui e' stato tolto, non aggiunto a
   fianco. L'indice ALTO (N_SEMI-1) e' quello che ha condannato il residuo
   la prima volta (fotogramma 80, 19 partite precedenti): resta l'UNICO
   indice del cancello.
   SOGLIA_SEMI_CROSSCHECK: sotto una batteria troppo piccola la crescita
   di SAVE.rosa non ha abbastanza partite per accumularsi in una
   differenza di posizione misurabile (non bisecato al fotogramma esatto:
   dichiarato conservativo, non una misura di soglia precisa). Sotto
   soglia il cancello NON gira a vuoto: si SALTA, dichiarato (vedi piu'
   sotto), invece di passare verde senza aver esercitato nulla. */
const SOGLIA_SEMI_CROSSCHECK = 8;
const INDICE_CROSS_CHECK_ALTO = N_SEMI - 1;
const CROSSCHECK_ABILITATO = N_SEMI >= SOGLIA_SEMI_CROSSCHECK;

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
    clamp: [], movimento: [], palla: [], confini: [],
    semiEsclusiDuello: [], semiEseguiti: 0, tickTotali: 0,
    comandiEmessi: 0, finteTentate: 0, disco1Avvii: 0,
    duelloAzioni: {}, swLockAttivo: 0, semiConSwLock: 0,
    impronteCrossCheck: {},
    maxRigheReg: 0, allarmiRighe: [], campione: null, violazioni: {},
  };

  /* IL PRNG PROPRIO DEL FUZZER -- stessa formula di strumenti/_posa.js
     (funzione semeFisso, la stessa che semina Math.random per i
     banchi visivi), ma UN GENERATORE INDIPENDENTE: stato locale a questa
     funzione, MAI Math.random, e MAI lo stesso oggetto del seme di gioco
     (SEME.accendi, dentro il motore). Riseminato PER SEME (vedi sotto),
     cosi' ogni coppia (semeGioco, semeComandi) e' riproducibile da sola.
     DAL COMPITO 2: lo STESSO generatore decide anche le mosse del duello
     (pickZone/stopPower/pickKeeper) -- non un terzo seme, il piano
     dichiara "il PRNG del fuzzer" al singolare. */
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
     i tentativi extra di trovare un campione per la riproduzione (vedi
     EXTRA_CAMPIONE in Node): in quel caso le violazioni NON entrano nei
     contenitori della batteria principale, per non falsare "N semi,
     tante invarianti verdi" con semi che non facevano parte del lotto
     dichiarato. */
  function provaSeme(seme, semeCmd, contaStatistiche) {
    t.semina(seme);
    /* AZZERAMENTO ROSA-CARRIERA (compito 2, punto d -- la diagnosi
       empirica di QUESTO compito, non il residuo #128 anticipato dal
       piano). Misurato con un banco a parte (fuori/_diag-crosspartita-
       scratch.js, usa-e-getta): a taglia 5, dopo N_SEMI in sequenza sulla
       stessa pagina, un seme diverge da isolato NON per Touch5/stick.ox-oy
       (confrontato campo per campo al fotogramma della prima divergenza:
       IDENTICO) ma per G.players[i].tecnica (69 contro 63 al fotogramma 0,
       PRIMA di ogni comando) -- SAVE.rosa, la rosa di casa, si crea UNA
       sola volta AL CARICAMENTO DELLA PAGINA (CALCETTO-il-gioco.html:
       10137, "if(!SAVE.rosa) SAVE.rosa=nuovaRosa()" -- riga di primo
       livello dello script, non dentro startMatch: gira una volta sola
       per pagina, non a ogni partita) e CRESCE di un attributo a caso a
       ogni fine partita (righe 41623-41635: progressione-carriera, per
       disegno, non un difetto). Su una pagina che gioca N semi in
       sequenza la rosa arriva al seme k gia' cresciuta di k partite; su
       una pagina isolata nasce fresca UNA volta e resta quella.
       IL PRIMO TENTATIVO (t.save.rosa=null, senza altro) era SBAGLIATO,
       misurato qui sopra: con SAVE.rosa nullo, setupPlayers
       (CALCETTO-il-gioco.html:10734, "const MIA = G.miaRosa||SAVE.rosa")
       non richiama nuovaRosa() -- quella riga gira UNA sola volta, al
       caricamento -- ma cade nel ramo "nessuna rosa" (riga 10736-10756,
       med=62 uniforme per tutti e cinque, p.piatto=1): una squadra di
       cloni "medi", non la rosa vera. Misurato: il campione (seme
       20260920 gia' k=0) cambiava di durata (7007 -> 8000 fotogrammi) e
       smetteva di riprodursi identico su pagina fresca, perche' la
       pagina fresca DI REPLAY *ha* SAVE.rosa (il suo caricamento, non
       toccato) mentre la pagina del banco, nullata, cadeva nel ramo dei
       cloni -- due partite diverse, non la stessa.
       LA CURA VERA: richiamare nuovaRosa() DAVVERO (window.nuovaRosa,
       una function-declaration a livello di script, quindi gia'
       proprieta' di window come window.doCross/window.resetKickoff nelle
       prove 10/11 di _q-invarianti.js) e RIMPIAZZARE SAVE.rosa col
       risultato, invece di svuotarlo. nuovaRosa() e' PURA (semeRosa(i),
       CALCETTO-il-gioco.html:9731, e' un hash del solo intero i, MAI di
       SEME.s/dado()): richiamarla da' sempre la STESSA rosa-base, la
       IDENTICA che il caricamento della pagina aveva gia' scritto la
       prima volta -- verificato a numeri (fuori/_check-nuovarosa.js,
       usa-e-getta): rosa di pagina e window.nuovaRosa() sono lo STESSO
       JSON, tecnica 63/53/62/58/56. Cosi' ogni seme del fuzzer (in
       sequenza o isolato) riparte dalla rosa-base vera, mai da quella
       cresciuta ne' da quella dei cloni -- e la riproduzione del punto
       (b) resta valida anche per k>0 (senza, si romperebbe in
       silenzio). Un azzeramento diverso da Touch5.azzera() (quello,
       verificato, serviva gia' da solo) ma la STESSA idea del mandato:
       uno stato che sopravvive a una partita sulla stessa pagina va
       riportato al suo valore vero prima della prossima. */
    if (t.save && typeof window.nuovaRosa === 'function') t.save.rosa = window.nuovaRosa();
    t.startMatch(1, 1, { size: cfg.taglia });
    /* NON setCpuVsCpu: la squadra 0 e' GIA' umana (G.cpu=[false,true]). */
    t.registra();

    const G = t.G;
    /* PROVA 12 (INV-04): FW/FH letti da t.campo DOPO startMatch, come in
       _q-invarianti.js -- dipendono dalla taglia scelta da setTaglia. */
    cfg.FW = t.campo.FW; cfg.FH = t.campo.FH;
    const rLocale = contaStatistiche ? r : {
      nan: [], owner: [], punteggio: [], timeLeft: [], durata: [], cronometri: [],
      clamp: [], movimento: [], palla: [], confini: [],
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

    /* IL LOG-DUELLI (compito 2, punto a) -- array PARALLELO al nastro Reg:
       Reg non cattura pickZone/stopPower/pickKeeper (vedi la lettera di
       testa), quindi si registra qui, {seme, fotogramma, metodo,
       argomenti}, per poter riapplicare le STESSE scelte in riproduzione
       (punto b). fotogramma e' il contatore GLOBALE di questo seme (la
       variabile `fotogrammi` del loop qui sotto), COERENTE con l'indice
       che la riproduzione user in `for (let f=0; f<fotogrammi; f++)`. */
    const logDuelli = [];
    let swLockVistoQuiSeme = false;

    /* GESTIONE DEL DUELLO (compito 2, punto a). Chiamata da unTick PRIMA
       di t.simulate, quando G.scene==='freekick': decide se e come agire
       in base a t.Duel.phase, con lo STESSO xorshift dei comandi. Le fasi
       'zone'/'power' del tiratore CPU e la risoluzione dell'esito NON
       vengono mai toccate da qui (si scavalcano da sole dentro
       Duel.update, chiamato da t.simulate): questa funzione agisce SOLO
       quando tocca al lato umano decidere. */
    function agisciDuello(fg) {
      const D = t.Duel;
      if (!D || D.phase === 'off' || D.phase === 'result') return;
      if (rnd01() >= cfg.probAzioneDuello) return;   // tempo di reazione: non ogni tick
      if (D.phase === 'zone' && D.shooterHuman) {
        /* LA MIRA (duelMira, CALCETTO-il-gioco.html:22642-22657): u nello
           specchio, bordo compreso (PK_ORLO=1,258 e' il bordo esterno del
           mirino, riga 22069); z e' la STESSA soglia che un dito vero
           userebbe per scegliere il terzo (u<-0,5 palo sinistro, u>0,5
           palo destro, altrimenti centro). pkAudacia/pkArrivo/pkCopertura
           clampano internamente ogni finito: nessun rischio di NaN anche
           ai bordi estremi del range qui sotto. */
        const u = -1.30 + rnd01() * 2.60;
        const v = 0.12 + rnd01() * 0.76;
        const z = u < -0.5 ? 0 : (u > 0.5 ? 2 : 1);
        D.pickZone(z, u, v);
        logDuelli.push({ seme, fotogramma: fg, metodo: 'pickZone', argomenti: [z, u, v] });
        r.duelloAzioni.pickZone = (r.duelloAzioni.pickZone || 0) + 1;
      } else if (D.phase === 'power' && D.shooterHuman) {
        D.stopPower();
        logDuelli.push({ seme, fotogramma: fg, metodo: 'stopPower', argomenti: [] });
        r.duelloAzioni.stopPower = (r.duelloAzioni.stopPower || 0) + 1;
      } else if (D.phase === 'wait' && D.keeperHuman && D.keeperZone < 0) {
        const z = rndInt(3);
        D.pickKeeper(z);
        logDuelli.push({ seme, fotogramma: fg, metodo: 'pickKeeper', argomenti: [z] });
        r.duelloAzioni.pickKeeper = (r.duelloAzioni.pickKeeper || 0) + 1;
      }
    }

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

    let fotogrammi = 0, raggiuntoEnd = false, violatoQuiSeme = false;
    const impronteSeed = [];

    /* IL SOLO TICK, in un posto solo: cosi' decidiEAgisci puo' consumarne
       uno extra (la finta) senza duplicare la verifica. ORDINE (dal
       compito 2): se G.scene==='freekick', agisciDuello PRIMA di
       t.simulate (un dito vero decide fra un fotogramma e l'altro, non
       dentro), POI simulate (che dentro chiama Duel.update, non step()),
       POI le dodici invarianti -- IL DUELLO NON SI ESCLUDE PIU': si
       continua a verificare come qualunque altro tick. */
    function unTick(fase) {
      if (G.scene === 'freekick') agisciDuello(fotogrammi);
      t.simulate(1 / 60);
      r.tickTotali++;
      /* SWLOCK/SWTIMER ESERCITATI (compito 2, cancello): un tick con
         swLock diverso da [0,0] e' un tick in cui uno swap/strappo umano
         e' vivo -- nessuna partita CPU-CPU lo produce mai (vedi la lettera
         di testa di _q-invarianti.js, prova 6). */
      if (G.swLock[0] !== 0 || G.swLock[1] !== 0) {
        r.swLockAttivo++;
        if (!swLockVistoQuiSeme) { swLockVistoQuiSeme = true; r.semiConSwLock++; }
      }
      const fg = fotogrammi;
      fotogrammi++;
      if (fg % 20 === 0) impronteSeed.push(leggiImpronta(G));
      if (verificaTick(fg, fase)) { violatoQuiSeme = true; return false; }
      if (t.state === 'end') { raggiuntoEnd = true; return false; }
      return true;
    }

    let prossimoComando = cfg.cadenzaMin + rndInt(cfg.cadenzaMax - cfg.cadenzaMin + 1);
    while (fotogrammi < cfg.tetto) {
      /* DENTRO IL DUELLO non si generano comandi stick/disco (l'overlay
         #duel copre lo schermo di gioco, un dito vero interagirebbe SOLO
         col dischetto): si lascia passare il tempo del duello (gestito da
         unTick/agisciDuello) senza consumare la cadenza normale, che
         riprende al valore gia' estratto appena la scena torna a essere
         non-freekick. */
      if (G.scene !== 'freekick') {
        prossimoComando--;
        if (prossimoComando <= 0) {
          prossimoComando = cfg.cadenzaMin + rndInt(cfg.cadenzaMax - cfg.cadenzaMin + 1);
          if (!decidiEAgisci(unTick)) break;
        }
      }
      if (!unTick('normale')) break;
    }

    const righeReg = t.registroRighe;
    if (contaStatistiche) {
      r.maxRigheReg = Math.max(r.maxRigheReg, righeReg);
      if (righeReg >= cfg.sogliaAllarmeRighe) r.allarmiRighe.push({ seme, righeReg });

      if (!raggiuntoEnd && !violatoQuiSeme) {
        /* PROVA 5 (durata<=tetto), sullo stesso principio di
           _q-invarianti.js: un seme che non ha ne' finito ne' violato,
           e ha esaurito il tetto, e' un hang vero -- IL DUELLO NON E'
           PIU' UNA SCUSA (compito 1 lo escludeva qui). */
        r.durata.push({ seme, fotogrammi, statoFinale: t.state });
      }
      r.semiEseguiti++;
    }

    return { seme, violatoQuiSeme, raggiuntoEnd, fotogrammi, righeReg, impronteSeed, logDuelli };
  }

  /* MINORE 1 DELLA REVISIONE FINALE (voce #126, compito di correzione):
     il campione per la RIPRODUZIONE non e' piu' "il primo seme pulito" --
     con la config committata (semeGioco 20260920) quel primo seme (k=0)
     non passa mai da un dischetto, quindi logDuelli resta vuoto e il ramo
     di riapplicazione (il pezzo che la lettera di testa dichiara di
     proteggere) non gira MAI in corsa verde. Si raccolgono TUTTI i semi
     puliti della batteria in campioniPuliti e, dopo il giro, si preferisce
     quello con logDuelli.length>0 (misurato: la macchina e' corretta, un
     seme con duello riproduce identico -- vedi il verbale); se nessuno ne
     porta, si ripiega sul primo pulito e lo si DICHIARA (r.campioneHaDuello
     = false), non lo si nasconde. */
  const campioniPuliti = [];
  for (let k = 0; k < cfg.semi; k++) {
    const semeCmdK = cfg.semeComandi0 + k;
    const esito = provaSeme(cfg.semeGioco0 + k, semeCmdK, true);
    if (cfg.indiciCrossCheck && cfg.indiciCrossCheck.includes(k)) {
      r.impronteCrossCheck[k] = esito.impronteSeed;
    }
    /* UNA VIOLAZIONE VERA: si cattura SUBITO il nastro (Reg.righe e'
       ancora quello di questo seme -- il prossimo t.registra(), al giro
       dopo, lo azzera) E il log-duelli di questo stesso seme (compito 2:
       senza, la riproduzione di un seme che passa da un dischetto non
       potrebbe rifare le stesse scelte del duello). PER TIPO DI
       INVARIANTE (non solo la primissima in assoluto): due cause diverse
       possono condannare due prove diverse su semi diversi, e appiattirle
       sulla prima sola ne nasconderebbe una -- il mandato (S13.3, "ogni
       crash riprodotto da un replay") non fa distinzione fra scoperte,
       solo la PRIMA occorrenza DI CIASCUN TIPO, per non moltiplicare file
       quando la stessa causa condanna piu' semi con lo stesso tipo. */
    if (esito.violatoQuiSeme) {
      for (const chiave of ['nan', 'owner', 'punteggio', 'timeLeft', 'clamp', 'movimento', 'palla', 'confini']) {
        if (r.violazioni[chiave]) continue;
        const trovati = r[chiave].filter(v => v.seme === esito.seme);
        if (trovati.length) {
          r.violazioni[chiave] = {
            seme: esito.seme, semeComandi: semeCmdK, fotogrammi: esito.fotogrammi,
            nastro: t.nastro(), logDuelli: esito.logDuelli, dettaglio: trovati,
          };
        }
      }
    } else {
      /* t.nastro() ORA, non dopo: Reg.righe appartiene a QUESTO seme solo
         fino al prossimo t.registra() (il giro k+1). Si tiene un campione
         per OGNI seme pulito (non solo il primo): serve a poter preferire
         quello con duello alla fine del giro, senza dover rigiocare nulla. */
      campioniPuliti.push({
        seme: esito.seme, fotogrammiEseguiti: esito.fotogrammi,
        nastro: t.nastro(), impronte: esito.impronteSeed, logDuelli: esito.logDuelli,
        raggiuntoEnd: esito.raggiuntoEnd,
      });
    }
  }
  r.campioniPuliti = campioniPuliti.length;
  r.campioniConDuello = campioniPuliti.filter(c => c.logDuelli.length > 0).length;
  if (campioniPuliti.length) {
    r.campione = campioniPuliti.find(c => c.logDuelli.length > 0) || campioniPuliti[0];
    r.campioneHaDuello = r.campione.logDuelli.length > 0;
  }
  /* NESSUN SEME PRINCIPALE E' RIMASTO PULITO (tutti violati -- dal
     compito 2 nessuno si esclude piu' per duello): si cercano fino a
     cfg.extraCampione semi IN PIU', SENZA farli entrare nella statistica
     della batteria (contaStatistiche = false) -- dichiarato in
     r.campioneExtra. Anche qui si preferisce un seme CON duello: ci si
     ferma appena se ne trova uno, altrimenti si esaurisce il budget e si
     ripiega sul primo pulito trovato (dichiarato via campioneHaDuello). */
  if (!r.campione) {
    const extraCandidati = [];
    for (let e = 0; e < cfg.extraCampione; e++) {
      const semeExtra = cfg.semeGioco0 + cfg.semi + e;
      const esito = provaSeme(semeExtra, cfg.semeComandi0 + cfg.semi + e, false);
      if (!esito.violatoQuiSeme) {
        extraCandidati.push({
          seme: esito.seme, fotogrammiEseguiti: esito.fotogrammi,
          nastro: t.nastro(), impronte: esito.impronteSeed, logDuelli: esito.logDuelli,
          raggiuntoEnd: esito.raggiuntoEnd, extraIndice: e + 1,
        });
        if (esito.logDuelli.length > 0) break;   // trovato un seme con duello: basta
      }
    }
    if (extraCandidati.length) {
      r.campione = extraCandidati.find(c => c.logDuelli.length > 0) || extraCandidati[0];
      r.campioneExtra = r.campione.extraIndice;
      r.campioneHaDuello = r.campione.logDuelli.length > 0;
      r.campioniPuliti += extraCandidati.length;
      r.campioniConDuello += extraCandidati.filter(c => c.logDuelli.length > 0).length;
    }
  }
  return r;
};

/* la stessa impronta, lato Node, per il confronto della riproduzione /
   del determinismo cross-partita */
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
      tettoVelPalla: TETTO_VEL_PALLA, tettoVzPalla: TETTO_VZ_PALLA, marginBordi: MARGINE_CONFINI,
      sogliaAllarmeRighe: SOGLIA_ALLARME_RIGHE, extraCampione: EXTRA_CAMPIONE,
      probAzioneDuello: PROB_AZIONE_DUELLO,
      indiciCrossCheck: CROSSCHECK_ABILITATO ? [INDICE_CROSS_CHECK_ALTO] : [],
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
    console.log('  semi lanciati: ' + N_SEMI + '   esclusi per duello (gestito dal compito 2, sempre 0): ' + r.semiEsclusiDuello.length +
      '   semi eseguiti nella statistica: ' + r.semiEseguiti);
    console.log('  fotogrammi totali simulati: ' + r.tickTotali + '   comandi emessi: ' + r.comandiEmessi +
      '   finte/strappi tentati: ' + r.finteTentate + '   avvii disco1 (swap-privilegiato): ' + r.disco1Avvii);

    console.log('\n-- IL DUELLO (compito 2, punto a) --');
    const azioniDuello = (r.duelloAzioni.pickZone || 0) + (r.duelloAzioni.stopPower || 0) + (r.duelloAzioni.pickKeeper || 0);
    console.log('  chiamate lato umano: pickZone=' + (r.duelloAzioni.pickZone || 0) +
      '  stopPower=' + (r.duelloAzioni.stopPower || 0) + '  pickKeeper=' + (r.duelloAzioni.pickKeeper || 0) +
      '  (totale ' + azioniDuello + ' su ' + N_SEMI + ' semi, 0 esclusi)');

    console.log('\n-- SWLOCK/SWTIMER ESERCITATI (cronometro-fratello #6, mai vivo in CPU-CPU) --');
    di(r.semiConSwLock > 0, 'G.swLock e\' stato osservato attivo (!=[0,0]) in almeno un seme',
      'semi con swLock attivo: ' + r.semiConSwLock + ' su ' + N_SEMI + '   fotogrammi-tick con swLock attivo: ' + r.swLockAttivo);

    console.log('\n-- LE DODICI INVARIANTI (riusate da _q-invarianti.js) --');
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

    di(r.durata.length === 0, '5. durata<=tetto (INV-15) -- ogni seme raggiunge \'end\' entro ' + TETTO_FOTOGRAMMI + ' fotogrammi (duello compreso)',
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

    di(r.confini.length === 0, '12. CONFINI+MARGINE (INV-04) -- ogni giocatore entro [-' + MARGINE_CONFINI + ', FW+' + MARGINE_CONFINI + '] x [-' + MARGINE_CONFINI + ', FH+' + MARGINE_CONFINI + '], anche nel duello',
      r.confini.length === 0 ? r.tickTotali + ' fotogrammi campionati (stick spinto verso i bordi), nessuno oltre il margine di ' + MARGINE_CONFINI + ' unita\' (5 m)'
        : primi(r.confini, 5, v => 'seme ' + v.seme + ' fotogramma ' + v.fotogramma + ' (' + v.fase + '): ' + v.chi + ' x=' + v.x.toFixed(1) + ' y=' + v.y.toFixed(1)));

    /* ---- P0: VIOLAZIONI VERE -- si catturano, non si nascondono. UNA
       fixture + UNA riproduzione per ciascun TIPO di invariante violata
       (la prima occorrenza di quel tipo): due cause diverse condannano
       due prove diverse su semi diversi, e non e' la stessa scoperta.
       DAL COMPITO 2: la riproduzione riapplica ANCHE il log-duelli, per
       tick, nello stesso loop -- senza, un seme condannato dopo un
       dischetto non si riprodurrebbe (Duel resterebbe fermo in 'zone'). */
    const tipiViolati = Object.keys(r.violazioni);
    if (tipiViolati.length) {
      if (!fs.existsSync(path.join(RADICE, 'fuori'))) fs.mkdirSync(path.join(RADICE, 'fuori'));
      const SONDA_REPLAY_VIOLAZIONE = (cfg) => {
        const t = window.__test;
        const r = { nan: [], owner: [], punteggio: [], timeLeft: [], durata: [], cronometri: [], clamp: [], movimento: [], palla: [], confini: [] };
        t.semina(cfg.seme);
        t.startMatch(1, 1, { size: cfg.taglia });
        t.rigioca(cfg.nastro);
        const G = t.G;
        cfg.FW = t.campo.FW; cfg.FH = t.campo.FH;
        verificaCronometriFratelli(G, r, cfg.seme, 0);
        const stato = { prevScore: [G.score[0], G.score[1]], prevTimeLeft: G.timeLeft };
        const porFrame = new Map();
        for (const ev of (cfg.logDuelli || [])) {
          if (!porFrame.has(ev.fotogramma)) porFrame.set(ev.fotogramma, []);
          porFrame.get(ev.fotogramma).push(ev);
        }
        for (let fg = 0; fg < cfg.fotogrammi; fg++) {
          const eventi = porFrame.get(fg);
          if (eventi) for (const ev of eventi) t.Duel[ev.metodo].apply(t.Duel, ev.argomenti);
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
          cantiere: 'voce-126-fuzzer-compito2', taglia: TAGLIA_BANCO, tipo: chiave,
          semeGioco: v0.seme, semeComandi: v0.semeComandi, fotogrammi: v0.fotogrammi,
          dettaglio: v0.dettaglio, nastro: v0.nastro, logDuelli: v0.logDuelli,
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
            seme: v0.seme, taglia: TAGLIA_BANCO, nastro: v0.nastro, fotogrammi: v0.fotogrammi, logDuelli: v0.logDuelli,
            tettoVelPalla: TETTO_VEL_PALLA, tettoVzPalla: TETTO_VZ_PALLA, marginBordi: MARGINE_CONFINI,
          })});
        })()`);
        const riprodotta = r2[chiave] && r2[chiave].length > 0;
        di(riprodotta, 'la violazione (' + chiave + ') si riproduce dal SOLO nastro+log-duelli su pagina fresca (stesso seme, stesso replay)',
          riprodotta ? 'confermata: ' + JSON.stringify(r2[chiave][r2[chiave].length - 1])
            : 'NON riprodotta identica al replay (' + (r2[chiave] || []).length + ' voci trovate) -- da indagare, potrebbe dipendere da uno stato non catturato dal nastro/log');
        await ctx3.close();
      }
    }

    console.log('\n-- IL TETTO Reg.righe>40000 (:13285, tronca in silenzio) --');
    di(r.maxRigheReg < 40000, 'max righe Reg osservato su un singolo seme: ' + r.maxRigheReg + ' (tetto 40000, soglia allarme ' + SOGLIA_ALLARME_RIGHE + ')',
      r.allarmiRighe.length ? 'ALLARME: ' + primi(r.allarmiRighe, 5, v => 'seme ' + v.seme + ': ' + v.righeReg + ' righe') : 'nessun seme oltre la soglia di allarme');

    /* ---- LA RIPRODUZIONE (compito 2, punto b: nastro + log-duelli) ---- */
    console.log('\n-- LA RIPRODUZIONE (stessa coppia di semi + log-duelli -> stessa partita) --');
    if (!r.campione) {
      di(false, 'riproduzione', 'NESSUN seme pulito trovato (ne\' fra i ' + N_SEMI + ' principali ne\' fra i ' + EXTRA_CAMPIONE + ' extra): impossibile provarla questa corsa');
    } else {
      if (r.campioneExtra) console.log('  (nessuno dei ' + N_SEMI + ' semi principali era pulito: il campione arriva dal ' + r.campioneExtra + 'o seme extra, dichiarato)');
      const camp = r.campione;
      console.log('  semi puliti nel lotto: ' + r.campioniPuliti + ' (con duello: ' + r.campioniConDuello + ')');
      /* MINORE 1 DELLA REVISIONE FINALE: si dichiara ESPLICITAMENTE se il
         campione scelto esercita il ramo replay-con-duello-non-vuoto, o
         se questa corsa non aveva materiale per farlo -- non si lascia
         che un log vuoto passi per "provato" in silenzio. */
      if (r.campioneHaDuello) {
        console.log('  campione: seme ' + camp.seme + ', ' + camp.fotogrammiEseguiti + ' fotogrammi, ' +
          camp.logDuelli.length + ' azioni di duello da riapplicare (scelto apposta: esercita il replay-con-duello)');
      } else {
        console.log('  campione: seme ' + camp.seme + ', ' + camp.fotogrammiEseguiti + ' fotogrammi, 0 azioni di duello');
        console.log('  ATTENZIONE: nessun seme con duello in questa batteria (' + r.campioniPuliti +
          ' puliti, 0 con duello): il replay-con-duello (log-duelli non vuoto) NON e\' esercitato in questa corsa -- ripiego dichiarato sul primo seme pulito');
      }
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
      /* L'ORDINE: pagina fresca, t.semina(semeGioco), startMatch (serve a
         creare la partita: senza, G.players non esiste), t.rigioca(nastro)
         -- Reg.deserializza non tocca G, quindi l'ordine fra rigioca e
         startMatch non cambia il risultato. DAL COMPITO 2: il log-duelli
         si riapplica per tick, PRIMA di ogni t.simulate, indicizzato per
         fotogramma -- STESSO ordine (agisciDuello poi simulate) della
         corsa originale che l'ha prodotto. */
      const replay = await pag2.evaluate(([seme, nastro, taglia, fotogrammi, IMPR, logDuelli]) => {
        const t = window.__test;
        const G = window.__test.G;
        t.semina(seme);
        t.startMatch(1, 1, { size: taglia });
        t.rigioca(nastro);
        const leggi = new Function('G', 'return (' + IMPR + ')(G)');
        const porFrame = new Map();
        for (const ev of logDuelli) {
          if (!porFrame.has(ev.fotogramma)) porFrame.set(ev.fotogramma, []);
          porFrame.get(ev.fotogramma).push(ev);
        }
        const impronte = [];
        for (let f = 0; f < fotogrammi; f++) {
          const eventi = porFrame.get(f);
          if (eventi) for (const ev of eventi) t.Duel[ev.metodo].apply(t.Duel, ev.argomenti);
          t.simulate(1 / 60);
          if (f % 20 === 0) impronte.push(leggi(G));
        }
        return { impronte, gol: [G.score[0], G.score[1]], righeRilette: t.registroRighe };
      }, [camp.seme, camp.nastro, TAGLIA_BANCO, camp.fotogrammiEseguiti, LEGGI_IMPRONTA_REPLAY.toString(), camp.logDuelli]);
      const kScarto = primoScarto(camp.impronte, replay.impronte);
      di(kScarto < 0, 'la stessa coppia (semeGioco=' + camp.seme + ', semeComandi) + log-duelli rigiocata da\' la stessa partita',
        kScarto < 0 ? camp.impronte.length + ' campioni, risultato ' + replay.gol.join('-') + ', ' + replay.righeRilette + ' comandi riletti' + (camp.logDuelli.length ? ', ' + camp.logDuelli.length + ' azioni di duello riapplicate' : '')
          : 'divergono al campione ' + kScarto + ' (fotogramma ' + (kScarto * 20) + ')');
      await ctx2.close();
      if (ecc2.length) console.log('  (eccezioni sulla pagina di replay: ' + ecc2.slice(0, 2).join(' | ') + ')');
    }

    /* ---- DETERMINISMO CROSS-PARTITA (compito 2, punto d; MINORE 2 della
       revisione finale, compito di correzione) ---- */
    console.log('\n-- DETERMINISMO CROSS-PARTITA (ultimo seme in sequenza == isolato su pagina fresca) --');
    if (!CROSSCHECK_ABILITATO) {
      /* SALTATO, DICHIARATO -- non verde a vuoto (MINORE 2): con una
         batteria piccola l'unico indice sensibile (N_SEMI-1) avrebbe
         troppo poco stato accumulato alle spalle per far emergere il
         residuo SAVE.rosa in posizione; un "verde" qui non proverebbe
         nulla. Non conta in esiti/cancello: e' un'informazione, non una
         prova mancata. */
      console.log('  SALTATO: batteria troppo piccola (--semi ' + N_SEMI + ' < ' + SOGLIA_SEMI_CROSSCHECK +
        ') -- il residuo SAVE.rosa si accumula di una crescita a partita e con poche partite precedenti' +
        ' potrebbe non essere ancora visibile in posizione entro la finestra campionata; il cancello non passa' +
        ' verde a vuoto, si dichiara non esercitato questa corsa.');
    } else {
      const kTarget = INDICE_CROSS_CHECK_ALTO;
      const impSeq = r.impronteCrossCheck[kTarget];
      if (!impSeq) {
        di(false, 'determinismo cross-partita, seme indice ' + kTarget, 'impronta della corsa in sequenza non catturata (bug del banco stesso)');
      } else {
        const semeGiocoIso = SEME_GIOCO + kTarget, semeComandiIso = SEME_COMANDI + kTarget;
        const ctxIso = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
        const pagIso = await ctxIso.newPage();
        await pagIso.addInitScript(semeFisso, semeGiocoIso);
        const eccIso = []; pagIso.on('pageerror', e => eccIso.push(e.message));
        await pagIso.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
        await pagIso.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
        await pagIso.evaluate(() => {
          const t = window.__test;
          t.dismissSplash && t.dismissSplash();
          if (t.save) t.save.tutorialDone = 1;
        });
        const cfgIso = Object.assign({}, cfg, {
          semi: 1, semeGioco0: semeGiocoIso, semeComandi0: semeComandiIso,
          extraCampione: 0, indiciCrossCheck: [0],
        });
        const rIso = await pagIso.evaluate(`(function(){
          ${verificaCronometriFratelli.toString()}
          ${verificaTickInvarianti.toString()}
          return (${SONDA_FUZZ})(${JSON.stringify(cfgIso)});
        })()`);
        const impIso = rIso.impronteCrossCheck[0];
        const kScartoIso = impIso ? primoScarto(impSeq, impIso) : 0;
        di(!!impIso && kScartoIso < 0,
          'seme indice ' + kTarget + ' (semeGioco=' + semeGiocoIso + '): in sequenza (dopo ' + kTarget + ' partite precedenti sulla stessa pagina) == isolato su pagina fresca',
          (!impIso) ? 'la corsa isolata non ha prodotto un\'impronta (bug del banco stesso)'
            : (kScartoIso < 0 ? impSeq.length + ' campioni identici' : 'divergono al campione ' + kScartoIso + ' (fotogramma ' + (kScartoIso * 20) + ') -- residuo cross-partita VERO'));
        await ctxIso.close();
        if (eccIso.length) console.log('  (eccezioni sulla pagina isolata: ' + eccIso.slice(0, 2).join(' | ') + ')');
      }
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
