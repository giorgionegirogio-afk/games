/* =====================================================================
   _q-soak.js -- IL SOAK CON BANDE (voce #127, onda C -- 3, ultimo
   anello). COMPITO 1: il soak base (invarianti riusate + INV-15 su
   volume). COMPITO 2 (20 settembre 2026): la ricalibrazione di
   TETTO_FOTOGRAMMI (la costante vive in _q-invarianti.js, vedi la sua
   lettera di testa per il perche' del nuovo valore) e LE BANDE
   statistiche (gol/90s, tiri, tiri in porta, parate, legni, durata gioco
   vivo, % 0-0), ancorate a taglia 5 e verificate su ogni corsa -- vedi il
   blocco `const BANDE`/`BANDA_ZERO_ZERO` piu' sotto per l'ancora, la
   larghezza e la ragione. IL TETTO E' PER TAGLIA (voce #130, 21
   settembre 2026, "il metro prima del giudice"): il tetto flat era tarato
   sul caso peggiore di taglia 5 e applicato tale e quale a --taglia 11,
   un falso positivo misurato e curato -- questo file ora legge
   `tettoFotogrammi(TAGLIA_BANCO)` da _q-invarianti.js invece della
   costante `TETTO_FOTOGRAMMI` (che resta importata ed esportata per chi
   non e' stato aggiornato, e vale ancora il numero di taglia 5).

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
   TETTO_FOTOGRAMMI (18000, 300 s di gioco a taglia 5 -- IMPORTATO da
   _q-invarianti.js, non un secondo numero magico duplicato a mano: il
   tetto INCORPORA gia' il margine +25% del mandato, vedi la lettera di
   testa di quel file). Una partita che non arriva a 'end' entro il
   tetto e' un hang (come l'#119): SI FERMA li' (non si aspetta oltre),
   e conta come violazione di questo banco.

   LA RICALIBRAZIONE (voce #127, onda C -- 3, compito 2, 20 settembre
   2026): il tetto era 13200 (220s) fino a questo compito -- proprio
   questo banco (compito 1) aveva scoperto che non bastava (5/1000
   partite SANE, un rigore a oltranza legittimo, sforavano). La cura e'
   in _q-invarianti.js (la costante e' li', vedi la sua lettera di testa
   per la stima del caso peggiore e il perche' di 18000): questo file non
   duplica il numero, lo importa, quindi non c'era niente da toccare qui
   per far girare il tetto nuovo -- solo i commenti che lo citavano a
   mano andavano aggiornati (questi).

   IL METODO BUGIARDO -- durata (compito 1) e bande (compito 2), e SOLO
   loro: le altre nove invarianti sono gia' provate rosse da
   _q-invarianti.js (duplicare qui la stessa dimostrazione non
   aggiungerebbe nulla, la funzione riusata e' LETTERALMENTE la stessa).
     --bugiardo durata   inverte l'ordine setCpuVsCpu/startMatch per
                         TUTTE le partite della corsa (misurato altrove:
                         non ogni seme si incastra, la squadra 0 "umana
                         immobile" si blocca solo se il gioco la porta a
                         battere una punizione -- su un campione decente
                         di partite alcune condannano comunque il tetto).
     --bugiardo bande    forza tiri=0 nella LETTURA delle statistiche di
                         ogni partita (dopo che la partita vera e' gia'
                         finita: non tocca la simulazione, vedi il
                         commento accanto a `cfg.bugiardoBande` in
                         SONDA_SOAK) -- il caso di controllo del compito
                         2: dimostra che la banda "tiri per partita"
                         condanna una corsa dove i tiri sono spariti,
                         senza toccare le altre bande (che restano vere,
                         quindi verdi).

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
         node strumenti/_q-soak.js --bugiardo bande
   esce 0 se zero violazioni su tutte le partite (incluso INV-15 e le
   bande), 1 se almeno una e' rossa, 2 se il banco stesso e' esploso, 3
   se l'uso e' sbagliato.
   ===================================================================== */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { semeFisso } = require('./_posa.js');
const {
  verificaCronometriFratelli, verificaTickInvarianti,
  TETTO_FOTOGRAMMI, tettoFotogrammi, TETTO_VEL_PALLA, TETTO_VZ_PALLA, SEME_CANTIERE, MARGINE_CONFINI,
} = require('./_q-invarianti.js');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('uso: node strumenti/_q-soak.js [--gioco file.html] [--taglia 5] [--partite 60]');
  console.log('                              [--semeBase 20260920] [--bugiardo durata|bande]');
  process.exit(3);
}

const BUGIARDO = arg('bugiardo', '');
if (BUGIARDO && BUGIARDO !== 'durata' && BUGIARDO !== 'bande') {
  console.error('USO: --bugiardo deve essere "durata" (le altre nove invarianti sono gia\' provate rosse da _q-invarianti.js) o "bande" (compito 2)');
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

/* =========================================================================
   LE BANDE ANCORATE (voce #127, onda C -- 3, compito 2, 20 settembre
   2026). L'ANCORA: 150 partite CPU-CPU, semeBase 20260920 (semi
   20260920..20261069), taglia 5, diff Normale, ROSA RIGENERATA a ogni
   partita (`node strumenti/_q-soak.js --partite 150`, vedi il commit di
   questo compito per il log intero). Le sei voci continue e la
   percentuale 0-0 (mediana / quartile-1 / quartile-3 misurati):
     golRegol (gol nei 90s)         3,00  (2,00 - 3,00)
     tiri per partita               13,00 (11,00 - 14,00)
     tiri in porta per partita      4,00  (3,00 - 5,00)
     parate per partita             2,00  (1,00 - 2,75)
     legni per partita              1,00  (0,00 - 2,00)
     durata gioco vivo (s)          92,39 (92,15 - 92,86)
     partite 0-0 nei 90s            3,3%  (rigori: 4,0%)

   PERCHE' QUESTI NUMERI DIVERGONO DA _eventi.js. La "prima fotografia"
   storica di _eventi.js (18 agosto 2026, semi 20260803..852, 50
   partite) misura tiri mediana 10,0, gol nei 90s 1,42, partite ai
   rigori 18% -- diversi da quelli qui sopra (13,00 / 3,00 / 4,0%). LA
   CAUSA NOTA, non un difetto della misura: quella corsa NON rigenera
   SAVE.rosa fra una partita e l'altra (la rosa cresce lentamente,
   vincolo che _eventi.js non ha mai avuto bisogno di risolvere), questo
   banco SI' (vincolo del piano, vedi la lettera di testa) -- sono DUE
   CONDIZIONI SPERIMENTALI DIVERSE, non la stessa domanda con una
   risposta diversa. Le bande di QUESTO banco si ancorano alla misura DI
   QUESTO banco, non ai numeri storici di un banco con un impianto
   diverso (dichiarato, non taciuto).

   LA LARGHEZZA E LA RAGIONE (lezione #112/#114: non tarata a favore).
   NON si usa il classico "steccato di Tukey" (mediana +-1,5*IQR)
   applicato alla lettera: durataViva ha un IQR di appena 0,7s su questo
   campione (la stragrande maggioranza delle partite non tocca mai il
   golden goal, quindi il tempo vivo resta incollato ai ~90s+overhead di
   kickoff) -- uno steccato di Tukey su QUESTO IQR darebbe [91,2 - 93,7],
   una banda che condannerebbe una corsa futura con anche solo qualche
   partita in piu' decisa al golden/ai rigori, cioe' una VARIAZIONE
   LEGITTIMA del campione (seed diversi, difficolta' diversa), non un
   difetto. Si usa invece un MARGINE MOLTO PIU' LARGO, dichiarato a
   mano, sulla MEDIANA (non sui singoli fotogrammi/partite): un
   raddoppio abbondante verso l'alto per le voci "conteggio" (tiri,
   specchio, parate, legni, gol), e per durataViva un intervallo che
   assorbe un tasso di golden/rigori anche 5-10 volte piu' alto di
   quello misurato oggi (che sposterebbe la mediana verso l'alto per il
   contributo dei +40s di golden) SENZA condannarlo. Il costo dichiarato
   di una banda cosi' larga: non misura il ritmo fine (non e' il suo
   compito, per quello c'e' il METRO di _eventi.js) -- misura solo che
   la promessa di fondo di ogni voce ("i tiri esistono, la porta esiste,
   le partite non sono tutte 0-0, la durata non e' scappata altrove")
   non si rompa in silenzio, la STESSA filosofia del --cancello di
   _eventi.js ("un cancello stretto qui diventerebbe rumoroso, e un
   cancello rumoroso viene disattivato la prima volta che sbaglia"). */
const BANDE = {
  golRegol: { min: 1, max: 6 },
  tiri: { min: 6, max: 22 },
  specchio: { min: 2, max: 8 },
  parate: { min: 1, max: 5 },
  legni: { min: 0, max: 3 },
  durataViva: { min: 80, max: 140 },
};
/* Percentuale di partite 0-0 nei 90s: misurato 0%/3,3% su due campioni
   (60 e 150 partite) -- il pavimento resta 0 (un 0% e' gia' stato
   osservato, non e' un allarme), il tetto e' 35%, a meta' strada fra il
   misurato oggi e la soglia di rottura conclamata che _eventi.js stesso
   usa nel suo --cancello (<=50%, "la promessa di fondo... non venga
   rotta in silenzio") -- abbastanza sotto quella soglia da condannare un
   vero ritorno al difetto "PRIMA" (73% di 0-0, ZERO reti su azione in
   50 partite, vedi la lettera di testa di _eventi.js), abbastanza sopra
   il misurato da non condannare una normale oscillazione campionaria. */
const BANDA_ZERO_ZERO = { min: 0, max: 35 };

/* COERENZA CON _eventi.js (verificata, non un'ipotesi): _eventi.js NON
   importa/duplica TETTO_FOTOGRAMMI -- il suo ciclo per-partita
   (`while (t.state!=='end' && sim<600) t.simulate(10)`) si ferma da
   solo a sim>=600, cioe' 600s/36000 fotogrammi (t.simulate(sec) fa
   round(sec*60) fotogrammi, CALCETTO-il-gioco.html:44319-44329) --
   quasi il DOPPIO del nuovo tetto di 18000 (300s). Nessuna incoerenza
   da correggere: il tetto di _eventi.js resta ben sopra il caso
   peggiore del rigore a oltranza (18000/300s) sia prima che dopo questa
   ricalibrazione, quindi non tronca mai una partita legittima che
   questo banco lascerebbe correre. */

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

/* MEDIANA/QUARTILI -- STESSA formula di strumenti/_eventi.js (interpolazione
   lineare fra i due indici piu' vicini), non una seconda implementazione
   diversa per lo stesso numero: se un giorno le due divergono per un
   dettaglio di arrotondamento, e' un bug, non una scelta. */
const mediana = a => { const b = a.slice().sort((x, y) => x - y); const n = b.length; return n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2; };
const quart = (a, q) => { const b = a.slice().sort((x, y) => x - y); const i = (b.length - 1) * q; const lo = Math.floor(i), hi = Math.ceil(i); return b[lo] + (b[hi] - b[lo]) * (i - lo); };

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
    bande: [],
  };

  /* LE BANDE (voce #127, compito 2) -- LEGNI si contano avvolgendo
     window.showBanner UNA SOLA VOLTA (la pagina vive per tutta la corsa),
     come fa strumenti/_eventi.js per PALO!/TRAVERSA! (stessa tecnica,
     stesso nome di banner: non si duplica la logica dei sei eventi che
     _eventi.js traccia, solo questi due, i soli che servono a "legni"). Il
     contatore si azzera a ogni partita (vedi dentro il ciclo), cosi'
     legni_k conta SOLO i legni della partita k. */
  const bandeC = { pali: 0, traverse: 0 };
  const showBannerOriginale = window.showBanner;
  if (typeof showBannerOriginale === 'function') {
    window.showBanner = function (testo) {
      if (testo === 'PALO!') bandeC.pali++;
      else if (testo === 'TRAVERSA!') bandeC.traverse++;
      return showBannerOriginale.apply(this, arguments);
    };
  }

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

    /* LE BANDE, azzerate a ogni partita. golRegolSnap cattura il
       punteggio nel MOMENTO in cui G.golden diventa vero per la prima
       volta (il fischio dei 90s, prima di qualunque gol/rigore della
       morte improvvisa) -- STESSA definizione di _eventi.js ("golRegol",
       vedi la sua lettera di testa): se il golden non scatta mai, il
       punteggio finale E' gia' quello regolamentare, letto a fine
       partita. liveFrames conta i fotogrammi con scena 'play' o
       'golden' (palla viva), non kickoff/gol/punizioni/rigori -- ANCORA
       la stessa definizione di _eventi.js ("durata gioco vivo"). */
    bandeC.pali = 0; bandeC.traverse = 0;
    let golRegolSnap = null, liveFrames = 0;

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
      if (G.scene === 'play' || G.scene === 'golden') liveFrames++;
      if (G.golden && !golRegolSnap) golRegolSnap = G.score.slice();
      if (verificaTick(fotogrammi, 'normale')) { violatoQuiSeme = true; fotogrammi++; break; }
      if (t.state === 'end') { raggiuntoEnd = true; fotogrammi++; break; }
    }

    /* LE BANDE SI LEGGONO SOLO SU UNA PARTITA VERA (raggiuntoEnd): una
       partita bloccata o violata non ha un tabellino da fidarsi, e non
       deve sporcare la mediana con uno zero che non e' un vero zero-a-
       zero. */
    if (raggiuntoEnd) {
      const golRegol = golRegolSnap || G.score.slice();
      let tiri = (G.stats.tiri[0] | 0) + (G.stats.tiri[1] | 0);
      /* --bugiardo bande (compito 2): forza tiri=0 DOPO che la partita
         vera e' gia' finita -- non tocca la simulazione, corrompe solo
         la LETTURA della statistica, la STESSA idea degli altri
         --bugiardo di questo banco (nan/owner/punteggio/... corrompono
         G, questo corrompe la lettura di G.stats) -- e' cio' che serve
         a dimostrare che le bande condannano un caso di controllo. */
      if (cfg.bugiardoBande) tiri = 0;
      r.bande.push({
        seme, tiri,
        specchio: (G.stats.inPorta[0] | 0) + (G.stats.inPorta[1] | 0),
        parate: (G.stats.parate[0] | 0) + (G.stats.parate[1] | 0),
        legni: bandeC.pali + bandeC.traverse,
        golRegol: (golRegol[0] | 0) + (golRegol[1] | 0),
        zeroZero: ((golRegol[0] | 0) + (golRegol[1] | 0)) === 0,
        aiRigori: !!G.rigori,
        durataViva: liveFrames / 60,
      });
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

  console.log('\n=== IL SOAK CON BANDE (voce #127, compiti 1+2) ===  ' +
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

    /* IL TETTO E' PER TAGLIA (voce #130, "il metro prima del giudice"):
       prima di questo compito qui girava il flat TETTO_FOTOGRAMMI (18000,
       tarato su taglia 5) anche a --taglia 11, dove una partita di
       regolamento dura gia' 180s -- il falso positivo misurato che ha
       aperto il cantiere (seme 20260924, arrivava a 'end' regolarmente a
       19502 fotogrammi, condannato dal tetto flat). Vedi la lettera di
       testa di tettoFotogrammi in _q-invarianti.js per le misure. */
    const TETTO_ATTIVO = tettoFotogrammi(TAGLIA_BANCO);
    const cfg = {
      taglia: TAGLIA_BANCO, partite: PARTITE, semeBase: SEME_BASE, tetto: TETTO_ATTIVO,
      tettoVelPalla: TETTO_VEL_PALLA, tettoVzPalla: TETTO_VZ_PALLA, marginBordi: MARGINE_CONFINI,
      ordineSbagliato: BUGIARDO === 'durata', bugiardoBande: BUGIARDO === 'bande',
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
      detDurata = PARTITE + ' partite, TUTTE hanno raggiunto \'end\' entro ' + TETTO_ATTIVO + ' fotogrammi a taglia ' + TAGLIA_BANCO + ' (max osservato: ' + r.maxFotogrammi + ')';
    } else {
      detDurata = primi(r.durata, 5, v => 'seme ' + v.seme + ' (partita #' + v.indiceMatch + '): ' + v.fotogrammi + ' fotogrammi, stato finale \'' + v.statoFinale + '\' (non ha raggiunto \'end\')');
    }
    di(r.durata.length === 0, 'INV-15 SU VOLUME -- ogni partita raggiunge \'end\' entro ' + TETTO_ATTIVO + ' fotogrammi (' + (TETTO_ATTIVO / 60).toFixed(0) + ' s a taglia ' + TAGLIA_BANCO + ', tetto PER TAGLIA dalla voce #130 -- ricalibrato sul caso peggiore del rigore a oltranza + margine, misurato per taglia)', detDurata);

    /* LE BANDE (voce #127, compito 2) -- vedi la lettera di testa per
       l'ancora, la larghezza e la ragione. Si legge la MEDIANA del
       campione IN ESAME (questa corsa) e la si confronta con la banda
       ANCORATA (una costante, misurata una volta, non ricalcolata qui:
       una banda che si aggiorna da sola sulla corsa che sta giudicando
       non condannerebbe mai niente). L'ANCORA E' A TAGLIA 5 -- la
       STESSA ragione del cancello INV-15/ripetibilita' (vincolo #98,
       vedi la lettera di testa): a 7/11 le statistiche SI MISURANO
       (stampate qui sotto) ma NON SI GIUDICANO contro una banda pensata
       per un campo/una rosa diversi, e la misura stessa non e'
       bit-ripetibile a quelle taglie -- dichiarato, non taciuto,
       nessun `di()` (non contano ne' per ne' contro il cancello). */
    const vociBande = [
      ['gol nei 90 s (golRegol, somma due squadre)', 'golRegol', ''],
      ['tiri per partita (somma due squadre)', 'tiri', ''],
      ['tiri in porta per partita (somma due squadre)', 'specchio', ''],
      ['parate per partita (somma due squadre)', 'parate', ''],
      ['legni per partita (palo+traversa, somma due squadre)', 'legni', ''],
      ['durata gioco vivo per partita', 'durataViva', ' s'],
    ];
    if (TAGLIA_BANCO === 5) {
      const campoBanda = (nome, chiave, unita) => {
        const vals = r.bande.map(x => x[chiave]);
        if (!vals.length) {
          di(false, 'BANDA -- ' + nome, 'nessuna partita valida da misurare in questa corsa (tutte incastrate/violate)');
          return;
        }
        const med = mediana(vals), q1 = quart(vals, 0.25), q3 = quart(vals, 0.75);
        const banda = BANDE[chiave];
        const ok = med >= banda.min && med <= banda.max;
        di(ok, 'BANDA -- ' + nome + ' (mediana attesa in [' + banda.min + ', ' + banda.max + ']' + unita + ')',
          'mediana=' + med.toFixed(2) + unita + '  quartili=' + q1.toFixed(2) + '-' + q3.toFixed(2) + '  su ' + vals.length + ' partite valide');
      };
      for (const [nome, chiave, unita] of vociBande) campoBanda(nome, chiave, unita);

      const nValide = r.bande.length;
      if (nValide) {
        const quotaZero = 100 * r.bande.filter(x => x.zeroZero).length / nValide;
        const quotaRigori = 100 * r.bande.filter(x => x.aiRigori).length / nValide;
        const okZero = quotaZero >= BANDA_ZERO_ZERO.min && quotaZero <= BANDA_ZERO_ZERO.max;
        di(okZero, 'BANDA -- partite 0-0 nei 90 s (attesa in [' + BANDA_ZERO_ZERO.min + '%, ' + BANDA_ZERO_ZERO.max + '%])',
          quotaZero.toFixed(1) + '% su ' + nValide + ' partite valide (per confronto: ' + quotaRigori.toFixed(1) + '% decise ai rigori)');
      } else {
        di(false, 'BANDA -- partite 0-0 nei 90 s', 'nessuna partita valida da misurare in questa corsa');
      }
    } else {
      console.log('\n  BANDE -- SOLO INFORMATIVO a taglia ' + TAGLIA_BANCO + ' (non ancorato, non bit-ripetibile, vincolo #98/#129):');
      const nValide = r.bande.length;
      for (const [nome, chiave, unita] of vociBande) {
        const vals = r.bande.map(x => x[chiave]);
        if (!vals.length) { console.log('    ' + nome + ': nessuna partita valida'); continue; }
        console.log('    ' + nome + ': mediana=' + mediana(vals).toFixed(2) + unita +
          '  quartili=' + quart(vals, 0.25).toFixed(2) + '-' + quart(vals, 0.75).toFixed(2) + '  su ' + vals.length + ' partite valide');
      }
      if (nValide) {
        const quotaZero = 100 * r.bande.filter(x => x.zeroZero).length / nValide;
        const quotaRigori = 100 * r.bande.filter(x => x.aiRigori).length / nValide;
        console.log('    partite 0-0 nei 90 s: ' + quotaZero.toFixed(1) + '%  (rigori: ' + quotaRigori.toFixed(1) + '%)  su ' + nValide + ' partite valide');
      }
    }

    if (ecc.length) di(false, 'BANCO -- nessuna eccezione di pagina', 'eccezione: ' + ecc[0]);

    /* L'IMPRONTA DELLA CORSA (vedi la lettera di testa) -- stampata SEMPRE,
       anche su un cancello rosso: e' cio' che due corse confrontano per
       dichiarare ripetibilita'. */
    const impronta = r.perPartita.map(p => p.seme + ':' + p.fotogrammi + ':' + p.statoFinale + ':' + p.punteggio.join('-')).join('|');
    console.log('\n  IMPRONTA (per la ripetibilita\', vedi cancello 2): ' + fnv1a(impronta) + '  (' + r.perPartita.length + ' partite)');
    console.log('  RIEPILOGO: ' + PARTITE + ' partite, ' + r.fotogrammiTotali + ' fotogrammi totali, ' +
      'max osservato ' + r.maxFotogrammi + '/' + TETTO_ATTIVO + ' fotogrammi (' + (100 * r.maxFotogrammi / TETTO_ATTIVO).toFixed(1) + '% del tetto a taglia ' + TAGLIA_BANCO + '), ' +
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
