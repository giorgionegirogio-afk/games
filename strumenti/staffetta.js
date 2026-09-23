/* =====================================================================
   staffetta.js — IL VERIFICATORE DIFFERITO CHE GIRA (voce #138).

   IL PEZZO CHE MANCAVA. L'onda D aveva costruito tre capi su quattro:

     #133  LA CAPACITA'  window.__test.giudica(nastro, atteso, opz):
                         rigioca la sfida sul motore vero e restituisce
                         uno di CINQUE verdetti. SOLO «NON TORNA» puo'
                         muovere punti.
     #134  IL TUBO       la colonna `verificata` arriva fino alla riga
                         della lista sul telefono di chi ha subito.
     #137  L'ALTRO CAPO  segna_verdetto(s_id, verdetto) nel database: la
                         guardia, il disfacimento dei punti, il sospetto
                         che nasce SOLO da NON TORNA.

   Mancava IL MEZZO, e lo dicevano in chiaro rete/LEGGIMI.md,
   rete/schema.sql e MANUALE.md §A: «il processo che pesca le righe a
   verificata = 0, apre il browser della misura giusta, chiama giudica e
   riporta la parola. Manca quello, e non manca altro.»

   Questo file e' quello.

   PERCHE' NON E' UN ENDPOINT, e non lo diventera'. Due ragioni, e
   nessuna delle due e' una preferenza:
     1. una funzione Vercel non ha un browser, e il giudice E' il gioco.
        Un secondo motore scritto in Node divergerebbe per costruzione e
        toglierebbe punti a innocenti (e' l'argomento con cui la voce
        #133 ha messo `giudica` dentro all'HTML invece che fuori);
     2. «un endpoint che accetta *questa sfida non torna* sarebbe il
        modo piu' corto per far togliere i punti a un avversario
        scrivendo il suo identificativo» — sta scritto sopra
        `segna_verdetto` in rete/schema.sql, dal #137.

   IL GIRO, IN SEI PASSI
     1. PESCA      le righe a verificata = 0, dalla piu' vecchia
     2. ALLARGA    il replay (deflate-raw + base64url -> testo crudo)
     3. RAGGRUPPA  per la misura scritta nella riga di tipo 10
     4. APRE       UN contesto per misura, non uno per riga
     5. GIUDICA    window.__test.giudica(...)
     6. RIMANDA    segna_verdetto(s_id, LA PAROLA) — mai un numero

   LA STAFFETTA NON TRADUCE, ed e' la riga piu' importante del file. La
   tavola dei cinque vive in DUE posti (rete/lib/verdetto.js e l'SQL di
   segna_verdetto) e sono DUE PORTE apposta: chi sbaglia e manda un -1 a
   mano non viene creduto, perche' la funzione non accetta -1, accetta
   'NON TORNA'. Una staffetta che decidesse da se' quali verdetti
   spedire sarebbe una TERZA porta, scritta peggio delle due che ci
   sono. Quindi si manda la parola, tutte e cinque, sempre: i tre «non
   lo so» costano una chiamata che non muove niente e comprano un solo
   cammino.

   LA MISURA SI LEGGE IN NODE, E NON PUO' ACCUSARE NESSUNO. Bisogna
   leggerla prima di aprire il browser, perche' e' lei a decidere quale
   browser aprire. Se il lettore in Node sbagliasse, `giudica` — che la
   ricontrolla da se' dentro `vagliaNastro` — risponderebbe
   INCOMPLETO/schermo-diverso, cioe' un «non lo so», MAI un NON TORNA.
   Il lettore in Node puo' far perdere tempo; non puo' far togliere
   punti. (Misurato, voce #133: lo stesso nastro a 800x360 invece che a
   915x412 da' 0-3 dove il tabellone dice 3-4.)

   uso:
     SUPABASE_URL=... SUPABASE_SERVICE_KEY=... node strumenti/staffetta.js
     node strumenti/staffetta.js --tetto 20 --pausa 500
     node strumenti/staffetta.js --asciutto        (giudica e non scrive)
     node strumenti/staffetta.js --riprova         (ignora il taccuino)
     node strumenti/staffetta.js --nome notturna   (il suo freno nel db)
     node strumenti/staffetta.js --gioco fuori/x.html
     node strumenti/staffetta.js --fotogrammi 6000 (rigiocata piu' corta)
     node strumenti/staffetta.js --taccuino altro/percorso.json

   LE DUE CREDENZIALI STANNO NELL'AMBIENTE E MAI NEL REPO: sono le
   stesse due di rete/lib/comuni.js, cioe' la stessa porta delle cinque
   funzioni Vercel, non una sesta. Senza, la staffetta non parte e lo
   dice (uscita 2). E non le stampa mai, nemmeno dentro a un messaggio
   di guasto: un errore di rete che se le porta dietro finisce in un
   registro, e un registro si legge.

   IL GIOCO CHE SI APRE DEVE ESSERE QUELLO CHE HA REGISTRATO I NASTRI,
   o almeno uno dello stesso MOTORE_V: una copia piu' vecchia direbbe
   ALTRO MOTORE su tutto. Non e' un danno — ALTRO MOTORE e' un «non lo
   so» e non muove un punto — ma e' un giro buttato via, e il referto lo
   fa vedere (i verdetti si contano uno per uno).

   uscite:  0 giro fatto · 1 guasto durante il giro (il referto dice
            quale, e le righe non giudicate restano a 0) · 2 non e'
            partita (credenziali assenti, o il gioco non c'e').
   ===================================================================== */
const fs = require('fs');
const http = require('http');
const path = require('path');
/* `allarga` e `schermoDi` stanno in _nastri-bugiardi.js, e non e' un
   prestito strano: il suo commento di testa dice, dalla voce #133, che
   allargare il nastro «e' esattamente quello che fara' il verificatore
   differito quando vivra' sul server». Il verificatore differito e'
   questo file. Una copia qui vorrebbe dire due letture del formato che
   possono divergere in silenzio. */
const N = require('./_nastri-bugiardi.js');

const RADICE = path.resolve(__dirname, '..');

/* I NUMERI DI SERIE, in un posto solo.
   Il tetto e la pausa sono freni LOCALI: quanto lavoro per giro e
   quanto respiro fra una riga e l'altra. Il freno del DATABASE e' un
   altro (vedi `frena` piu' sotto) e vale anche fra due staffette
   lanciate insieme, che non condividono memoria. */
const TETTO_RIGHE = 50;
/* UNA RIGA AL SECONDO, e non e' prudenza generica: un giudizio costa
   circa un secondo (misurato), e col respiro di serie la staffetta gira
   intorno alle 35 righe al minuto — comodamente sotto il tetto di 60 che
   si impone da se' col freno del database. Dodici persone non producono
   cinquanta sfide al minuto: la fretta qui non compra niente. */
const PAUSA = 1000;
const PAGINE = 10;
const FRENO_TETTO = 60, FRENO_SECONDI = 60;
/* la misura con cui si apre un contesto quando il nastro non ne
   dichiara nessuna: e' quella dei banchi del repo, e serve solo a
   sentirsi dire «schermo-ignoto» dal giudice invece di deciderlo qui */
const MISURA_SERIE = [915, 412];

/* ------------------------------------------------------------ il nastro */
const allargaNastro = stretto => N.allarga(stretto);

/* LA MISURA DICHIARATA DAL NASTRO (riga di tipo 10, voce #133), o null
   se quel nastro e' di prima di quella cura o e' stato costruito senza.
   Accetta il nastro stretto o crudo: nel database sta stretto. */
function misuraDelNastro(nastro) {
  const s = N.schermoDi(allargaNastro(nastro));
  return (s && s[0] > 0 && s[1] > 0) ? [s[0] | 0, s[1] | 0] : null;
}

/* =====================================================================
   L'IMPRONTA DEL MOTORE JAVASCRIPT DICHIARATA DAL NASTRO (riga di tipo
   11, voce #142), o 0 se quel nastro e' di prima di quella cura.

   PERCHE' SERVE ALLA STAFFETTA, e non solo al giudice. Il #141 ha
   misurato che due motori conformi a ECMA-262 non producono la stessa
   partita: le trascendenti sono «implementation-approximated», e
   Math.hypot da' l'ultimo bit diverso su 100 valori su 200 fra V8 e
   JavaScriptCore. Questo file apriva `chromium.launch()` a riga fissa,
   quindi ogni sfida giocata da un iPhone veniva rigiocata su un motore
   che non era il suo: MISURATO (strumenti/_q-motore-nastro.js, sei
   sfide vere registrate su WebKit) CINQUE NON TORNA su sei, cioe'
   cinque onesti accusati, i punti tolti a dieci persone e cinque
   sospetti che non decadono mai.

   Dal #142 il giudice si astiene (INCOMPLETO/motore-js-diverso) invece
   di accusare, e nessuno perde piu' niente. Ma l'astensione da sola
   sarebbe una perdita di copertura: e' questa riga, con il
   raggruppamento qui sotto, a trasformarla in una COMPLICAZIONE
   OPERATIVA — la staffetta apre il motore che il nastro chiede, e la
   sfida si verifica davvero. E' esattamente il giudizio che la revisione
   del #133 ha dato per lo schermo.

   SI LEGGE IN NODE, come la misura, e per la stessa ragione: bisogna
   saperla PRIMA di aprire il browser, perche' e' lei a decidere quale.
   E se il lettore in Node sbagliasse, `giudica` la ricontrolla da se'
   dentro `vagliaNastro` e risponde INCOMPLETO, cioe' un «non lo so»,
   MAI un NON TORNA. Puo' far perdere tempo; non puo' far togliere punti.
   ===================================================================== */
function improntaDelNastro(nastro) {
  const i = N.improntaDi(allargaNastro(nastro));
  return (i | 0) >>> 0;
}

/* ------------------------------------------------------ il raggruppamento */
/* UN CONTESTO PER MISURA, NON UNO PER RIGA. Misurato il 22 settembre
   2026 (fuori/_sonda-138-misura.js): aprire un contesto e caricare il
   gioco costa 1165 ms, un giudizio 1039 ms, un secondo giudizio sulla
   stessa pagina 938 ms. Riaprire per ogni riga costerebbe piu' del
   doppio. L'ordine e' quello di PRIMA APPARIZIONE, cosi' le righe piu'
   vecchie si giudicano per prime anche dopo il raggruppamento.

   DALLA VOCE #142 LA CHIAVE E' UNA COPPIA: la misura dello schermo E
   l'impronta del motore JavaScript. Due nastri della stessa misura e di
   due motori diversi NON possono stare nella stessa finestra — non per
   eleganza: su un motore che non e' il loro il giudice si astiene, e se
   la staffetta non aprisse quello giusto l'astensione diventerebbe una
   copertura persa invece di una complicazione operativa. La chiave si
   legge `915x412@3274447767`, e `@ignoto` e' il posto dei nastri di
   prima del #142, che si giudicano lo stesso (il giudice dira'
   motore-js-ignoto, e quella parola va mandata al database come le
   altre quattro). */
function raggruppa(righe) {
  const ordine = [], mappa = new Map();
  for (const r of righe || []) {
    const crudo = allargaNastro(r && r.replay !== undefined ? r.replay : (r && r.nastro));
    const m = misuraDelNastro(crudo);
    const imp = improntaDelNastro(crudo);
    const chiave = (m ? (m[0] + 'x' + m[1]) : 'ignota') + '@' + (imp || 'ignoto');
    if (!mappa.has(chiave)) {
      mappa.set(chiave, { chiave: chiave, misura: m, impronta: imp, righe: [] });
      ordine.push(chiave);
    }
    mappa.get(chiave).righe.push(Object.assign({}, r, { crudo: crudo }));
  }
  return ordine.map(k => mappa.get(k));
}

/* =====================================================================
   QUALE MOTORE APRIRE, dato quel che il nastro chiede (voce #142).

   `motori` e' la lista costruita all'avvio: per ogni browser che questa
   macchina ha davvero, il suo nome e la sua impronta CHIESTA AL GIOCO —
   non indovinata dal nome, perche' l'impronta cambia con la versione e
   il nome no.

   TRE CASI, e ognuno ha la sua ragione:
     · il nastro non dichiara nessuna impronta (nastro di prima del
       #142) -> si apre il PRIMO motore disponibile. Non e' un ripiego
       che accusa: il giudice dira' INCOMPLETO/motore-js-ignoto su
       qualunque motore, e quella parola va spedita come le altre;
     · il nastro dichiara un'impronta che una delle pagine ha -> si apre
       QUELLA, ed e' il giro che verifica davvero;
     · il nastro dichiara un'impronta che NESSUNO ha -> si torna null, e
       chi chiama LASCIA QUELLE RIGHE A verificata = 0. Non si ripiega su
       un motore qualunque: ripiegare sarebbe tornare al difetto che il
       #142 cura, cioe' rigiocare la partita di un altro sul proprio
       motore. Le righe tornano al giro dopo, su una macchina che quel
       motore ce l'ha.

   E CON UN SOLO BROWSER (come lo chiamano i banchi che misurano il GIRO
   e non i motori) si comporta come prima del #142: quel browser per
   tutto. Cambiare la forma della chiamata avrebbe rifatto dieci prove
   per una riga.
   ===================================================================== */
function scegliMotore(motori, browserSolo, impronta) {
  if (!motori || !motori.length) return browserSolo ? { nome: '(solo)', browser: browserSolo } : null;
  if (!impronta) return motori[0];
  for (const m of motori) if (((m.impronta | 0) >>> 0) === ((impronta | 0) >>> 0)) return m;
  return null;
}

/* --------------------------------------------------------- il taccuino */
/* DUE STRATI, E SERVONO A DUE COSE DIVERSE. Confonderli e' il modo di
   credere di essere protetti quando non lo si e'.

   STRATO 1 — LA STRUTTURA, e protegge dalle ACCUSE DOPPIE.
   `segna_verdetto` ha la guardia `where id = s_id and verificata = 0`:
   lo stesso NON TORNA applicato due volte disfa i punti UNA volta sola
   e scrive UN solo sospetto. Non e' un `if` di questo file: e' nella
   transazione, ed e' gia' misurata (_q-sospetto B6/B7, voce #137).

   STRATO 2 — IL TACCUINO, e protegge solo dal LAVORO SPRECATO. I tre
   «non lo so» restano a 0 per disegno, quindi tornano nella pesca a
   ogni giro: senza taccuino la staffetta macinerebbe per sempre le
   stesse righe ingiudicabili e non arriverebbe mai a quelle nuove.

   LA RIGA CHE TIENE INSIEME I DUE STRATI: il taccuino puo' sparire
   senza che nessuno venga accusato due volte. Cancellarlo costa una
   rigiocata; non costa un punto a nessuno. Se un giorno i due strati
   dicessero cose diverse, quello che comanda e' la struttura. */
function taccuino(percorso) {
  const dati = { versione: 1, righe: {} };
  if (percorso) {
    try {
      const v = JSON.parse(fs.readFileSync(percorso, 'utf8'));
      if (v && v.righe && typeof v.righe === 'object') dati.righe = v.righe;
    } catch (e) { /* un taccuino illeggibile e' un taccuino vuoto: costa
                     lavoro, non correttezza */ }
  }
  const salva = () => {
    if (!percorso) return;
    try {
      fs.mkdirSync(path.dirname(percorso), { recursive: true });
      fs.writeFileSync(percorso, JSON.stringify(dati, null, 1));
    } catch (e) { /* idem */ }
  };
  return {
    percorso: percorso || '',
    /* hasOwnProperty e non `dati.righe[id]`: senza, una sfida che si
       chiamasse `constructor` pescherebbe dalla catena dei prototipi */
    ha: id => Object.prototype.hasOwnProperty.call(dati.righe, String(id)),
    leggi: id => dati.righe[String(id)] || null,
    segna(id, dato) { dati.righe[String(id)] = dato; salva(); },
    dimentica(id) { delete dati.righe[String(id)]; salva(); },
    quanti: () => Object.keys(dati.righe).length,
    salva: salva,
  };
}

/* ------------------------------------------------------- il banco vero */
/* IL LATO-DATABASE, e non ha un banco: si misura la sua FORMA (che
   filtri verificata=0, che chiami segna_verdetto con la PAROLA, che si
   rifiuti di nascere senza credenziali, che non stampi mai la chiave),
   non il suo viaggio. Dichiarato nella spec del cantiere. */
function bancoVero(opz) {
  opz = opz || {};
  const url = opz.url !== undefined ? opz.url : process.env.SUPABASE_URL;
  const chiave = opz.chiave !== undefined ? opz.chiave : process.env.SUPABASE_SERVICE_KEY;
  if (!url || !chiave)
    throw new Error('credenziali assenti: servono SUPABASE_URL e SUPABASE_SERVICE_KEY ' +
                    'nell\'ambiente (la chiave di servizio non sta nel repo e non ci deve stare)');
  const nome = String(opz.nome || 'sola');
  /* LA CHIAVE NON ESCE MAI DA QUI, nemmeno dentro a un messaggio di
     guasto: un errore di rete che se la porta dietro finisce in un
     registro, e un registro si legge. */
  const senzaChiave = t => String(t === undefined || t === null ? '' : t).split(chiave).join('<chiave>');

  const rest = async (via, ozn) => {
    let r;
    try {
      r = await fetch(url + '/rest/v1' + via, Object.assign({}, ozn, {
        headers: Object.assign({
          apikey: chiave, Authorization: 'Bearer ' + chiave, 'Content-Type': 'application/json',
        }, (ozn && ozn.headers) || {}),
      }));
    } catch (e) { throw new Error('database irraggiungibile: ' + senzaChiave(e && e.message)); }
    const testo = await r.text();
    if (!r.ok) throw new Error('db ' + r.status + ': ' + senzaChiave(testo).slice(0, 200));
    if (!testo) return null;
    try { return JSON.parse(testo); } catch (e) { return null; }
  };

  return {
    /* LA PESCA. Il filtro e' quello dell'indice parziale che esiste dal
       primo giorno (`sfida_daverificare on sfida (verificata, giocata)
       where verificata = 0`). L'ordine e' per `id`, che e' un bigserial
       e quindi e' l'ordine di registrazione, senza pareggi: serve un
       cursore che non salti e non ripeta righe fra una pagina e
       l'altra, e `giocata` due righe possono averla uguale. */
    async pesca(quanti, dopo) {
      const via = '/sfida?verificata=eq.0' + ((dopo | 0) > 0 ? '&id=gt.' + (dopo | 0) : '') +
        '&order=id.asc&limit=' + Math.max(1, quanti | 0) +
        '&select=id,attaccante,seme,taglia,gol_a,gol_d,replay,giocata';
      return (await rest(via)) || [];
    },
    /* SI MANDA LA PAROLA. Il database non accetta -1, accetta
       'NON TORNA': e' la seconda delle due porte. */
    async segna(id, parola) {
      const r = await rest('/rpc/segna_verdetto', {
        method: 'POST', body: JSON.stringify({ s_id: id, verdetto: String(parola) }),
      });
      const u = Array.isArray(r) ? r[0] : r;
      return { mosso: !!(u && u.mosso), esito: (u && u.esito) | 0,
               sospetto: (u && u.sospetto_nuovo) | 0, causa: '' };
    },
    /* IL FRENO. Nessun freno del server si applica alla staffetta: i sei
       `frenato(...)` stanno negli ENDPOINT, e la staffetta non passa da
       nessun endpoint — parla a PostgREST con la chiave di servizio,
       come le funzioni Vercel. Proprio per questo si frena da se', con
       lo stesso meccanismo e nello stesso posto: il conto sta nel
       database perche' due staffette lanciate insieme non condividono
       memoria.
       E se il freno non risponde NON si blocca il giro: e' la stessa
       regola di comuni.js, «un freno rotto che chiude il gioco sarebbe
       peggio del traffico che doveva evitare». */
    async frena() {
      try {
        const ok = await rest('/rpc/frena', {
          method: 'POST',
          body: JSON.stringify({ k: 'staffetta:' + nome, tetto: FRENO_TETTO, secondi: FRENO_SECONDI }),
        });
        return ok !== false;
      } catch (e) { return true; }
    },
  };
}

/* ---------------------------------------------------- il gioco servito */
/* Playwright blocca file://, quindi il gioco si serve da un http locale
   — e' la stessa cosa che fanno tutti gli strumenti del repo. Un file
   solo, servito a qualunque indirizzo: niente traversata di cartelle. */
function serviGioco(percorso) {
  const f = path.resolve(RADICE, percorso || 'CALCETTO-il-gioco.html');
  if (!fs.existsSync(f)) return Promise.reject(new Error('il gioco non c\'e\': ' + f));
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => {
      const p = s.address().port;
      ok({ porta: p, indirizzo: 'http://127.0.0.1:' + p + '/CALCETTO-il-gioco.html',
           file: f, chiudi: () => s.close() });
    });
  });
}

/* ---------------------------------------------------------- una pagina */
async function apriPagina(browser, indirizzo, misura) {
  const ctx = await browser.newContext({
    viewport: { width: misura[0], height: misura[1] },
    isMobile: true, hasTouch: true, locale: 'it-IT',
  });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push(e.message));
  await pag.goto(indirizzo, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 30000 });
  /* rAF zittito: qui non si disegna niente, si rigioca */
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(100);
  await pag.evaluate(() => {
    const t = window.__test;
    t.dismissSplash && t.dismissSplash();
    if (t.save) t.save.tutorialDone = 1;
  });
  /* l'audio si sblocca all'apertura come fa un giocatore vero: un banco
     che lo lascia chiuso e poi lo sblocca a meta' misura un canale che
     non aveva chiesto (voce #132). Costa zero sorteggi, misurato. */
  await pag.evaluate(() => { try { Audio5.unlock(); } catch (e) {} });
  return { ctx, pag, errori };
}

/* ------------------------------------------------------------- il giro */
/* opz: { banco, browser, indirizzo, tetto, pausa, taccuino, asciutto,
          fotogrammi, misuraFissa } */
async function giro(opz) {
  opz = opz || {};
  const banco = opz.banco;
  const browser = opz.browser;
  const indirizzo = opz.indirizzo;
  const tetto = opz.tetto === undefined ? TETTO_RIGHE : Math.max(1, opz.tetto | 0);
  const pausa = opz.pausa === undefined ? PAUSA : Math.max(0, opz.pausa | 0);
  const tac = opz.taccuino || null;
  const asciutto = !!opz.asciutto;
  const t0 = Date.now();
  const ref = {
    pescate: 0, saltate: 0, giudicate: 0, contesti: 0, misure: [], esiti: [],
    verdetti: {}, finestreNegate: [], frenata: false, tettoPieno: false,
    guasto: '', ms: 0, msGiudizio: 0, msContesto: 0,
    /* LE RIGHE CHE CHIEDONO UN MOTORE CHE QUESTA MACCHINA NON HA (voce
       #142). Non e' un guasto e non e' un verdetto: e' lavoro rimandato.
       Restano a verificata = 0, non entrano nel taccuino, e il referto
       le grida — come gia' fa per la finestra negata. */
    motoriAssenti: [],
  };
  if (!banco || typeof banco.pesca !== 'function') { ref.guasto = 'nessun banco'; return ref; }

  /* --- 1. LA PESCA, a pagine. Le righe gia' viste (i «non lo so» di
     ieri, che restano a 0 per disegno) si saltano col taccuino, e si
     pesca la pagina dopo: se no le ingiudicabili si accumulerebbero in
     testa alla finestra e la staffetta non arriverebbe mai alle nuove. */
  const scelte = [];
  try {
    let dopo = 0, pagine = 0;
    while (scelte.length < tetto && pagine < PAGINE) {
      const p = await banco.pesca(tetto, dopo);
      pagine++;
      if (!p || !p.length) break;
      ref.pescate += p.length;
      dopo = p[p.length - 1].id | 0;
      for (const r of p) {
        if (tac && tac.ha(r.id)) { ref.saltate++; continue; }
        scelte.push(r);
        if (scelte.length >= tetto) { ref.tettoPieno = true; break; }
      }
      if (p.length < tetto) break;
    }
  } catch (e) { ref.guasto = 'pesca: ' + (e && e.message || e); ref.ms = Date.now() - t0; return ref; }
  if (!scelte.length) { ref.ms = Date.now() - t0; return ref; }

  /* --- 2/3. ALLARGA E RAGGRUPPA */
  const gruppi = raggruppa(scelte);
  let msGiud = 0, msCtx = 0, fermo = false;

  for (const g of gruppi) {
    if (fermo) break;
    /* --- 4. LA MISURA. `misuraFissa` serve solo a far vedere che cosa
       succede aprendo la finestra sbagliata (il controfattuale del
       banco): in esercizio non si passa, e il peggio che potrebbe fare
       e' una raffica di «non lo so» — mai un'accusa. */
    const misura = opz.misuraFissa || g.misura || MISURA_SERIE;
    /* --- E IL MOTORE (voce #142). Se il nastro ne chiede uno che questa
       macchina non ha, le righe NON si giudicano su un altro: si
       lasciano a verificata = 0 e si riprendono dove quel motore c'e'.
       Ripiegare sarebbe rigiocare la partita di un altro sul proprio
       motore, che e' esattamente il difetto curato dal #142. */
    const mot = scegliMotore(opz.motori, browser, g.impronta);
    if (!mot) {
      ref.motoriAssenti.push({ chiave: g.chiave, impronta: g.impronta, righe: g.righe.length });
      continue;
    }
    let P = null;
    const tc = Date.now();
    try { P = await apriPagina(mot.browser, indirizzo, misura); }
    catch (e) { ref.guasto = 'contesto ' + g.chiave + ': ' + (e && e.message || e); break; }
    msCtx += Date.now() - tc;
    ref.contesti++;
    const mis = { chiave: g.chiave, misura: misura, motore: mot.nome, righe: 0, ms: 0 };
    const tg = Date.now();

    try {
      for (const r of g.righe) {
        /* --- IL FRENO, prima di ogni riga. Se il database dice no ci si
           FERMA: non si insiste e non si ritenta. Le righe non giudicate
           restano a 0 e tornano al giro dopo. */
        if (banco.frena) {
          const via = await banco.frena();
          if (!via) { ref.frenata = true; fermo = true; break; }
        }
        const tj = Date.now();
        const vv = await P.pag.evaluate(([riga, fotogrammi]) => {
          const t = window.__test;
          if (typeof t.giudica !== 'function') return { verdetto: '', causa: 'niente-giudice' };
          try {
            const o = t.giudica({ nastro: riga.crudo, seme: riga.seme, taglia: riga.taglia,
                                  gol_a: riga.gol_a, gol_d: riga.gol_d },
                                null, fotogrammi ? { tetto: fotogrammi } : undefined);
            return { verdetto: String(o && o.verdetto || ''), causa: String(o && o.causa || ''),
                     gol: (o && o.gol) || null, passi: (o && o.passi) | 0, schermo: (o && o.schermo) || null };
          } catch (e) { return { verdetto: '', causa: 'giudizio-esploso', errore: String(e && e.message || e) }; }
        }, [{ crudo: r.crudo, seme: String(r.seme), taglia: r.taglia | 0,
              gol_a: r.gol_a | 0, gol_d: r.gol_d | 0 }, opz.fotogrammi | 0]);
        msGiud += Date.now() - tj;
        ref.giudicate++; mis.righe++;

        /* --- 6. LA PAROLA, COSI' COM'E'. Qui non si traduce niente: la
           tavola dei cinque e' del database, e questa e' la ragione per
           cui `segna_verdetto` accetta 'NON TORNA' e non -1. */
        const parola = String(vv.verdetto || '');
        /* IL REFERTO DICE DUE COSE, e apposta: `verdetto` e' quel che ha
           detto IL GIUDICE, `parola` e' quel che si e' MANDATO. In una
           staffetta onesta sono la stessa cosa — e' proprio per questo
           che vanno tenute separate: se un giorno divergessero, il
           referto lo farebbe vedere invece di raccontare il verdetto
           che non e' stato spedito. */
        const esito = { id: r.id, verdetto: String(vv.verdetto || ''), parola: parola,
                        causa: vv.causa || '', gol: vv.gol || null, passi: vv.passi | 0,
                        misura: g.chiave, mosso: false, sospetto: 0 };
        const chiave = esito.verdetto || '(niente)';
        ref.verdetti[chiave] = (ref.verdetti[chiave] | 0) + 1;

        /* LA FINESTRA NEGATA, e non e' un «non lo so» del nastro: la
           staffetta aveva chiesto PROPRIO quella misura e non l'ha
           ottenuta (uno schermo piu' grande del display, una barra del
           browser, un server X che ridimensiona). E' un guasto
           operativo: si grida nel referto e la riga NON entra nel
           taccuino, cosi' torna al giro dopo. */
        const finestraNegata = esito.verdetto === 'INCOMPLETO' && vv.causa === 'schermo-diverso';
        if (finestraNegata) ref.finestreNegate.push({ id: r.id, chiesta: misura, serve: vv.schermo || null });

        if (!asciutto) {
          try {
            const out = await banco.segna(r.id, parola);
            esito.mosso = !!(out && out.mosso);
            esito.sospetto = (out && out.sospetto) | 0;
          } catch (e) {
            /* LA RISPOSTA PERSA. Non si sa se la chiamata e' arrivata,
               quindi la riga NON entra nel taccuino e il giro si ferma:
               meglio una rigiocata in piu' che una riga persa, perche'
               la guardia della struttura rende la rigiocata innocua. */
            ref.esiti.push(esito);
            ref.guasto = 'segna #' + r.id + ': ' + (e && e.message || e);
            fermo = true;
            break;
          }
        }
        ref.esiti.push(esito);

        /* --- IL TACCUINO. Ci va tutto quello di cui si sa l'esito e che
           non tornera' da solo: i due verdetti che chiudono la riga e i
           tre «non lo so», che restano a 0 per disegno e altrimenti si
           rimacinerebbero per sempre. */
        const daRicordare = !!tac && !finestraNegata && !!parola;
        /* E LA PROVA A VUOTO NON SCRIVE NEL TACCUINO. Sembra un
           dettaglio ed e' l'opposto: `--asciutto` giudica e non manda
           niente, quindi quelle righe restano a `verificata = 0`. Se
           finissero nel taccuino, il giro VERO del giorno dopo le
           salterebbe — e nessuno le guarderebbe mai piu'. Una prova a
           vuoto che fa perdere righe e' peggio di nessuna prova a
           vuoto. */
        if (daRicordare && !asciutto)
          tac.segna(r.id, { verdetto: parola, causa: vv.causa || '',
                            misura: g.chiave, quando: new Date().toISOString() });
        if (pausa) await P.pag.waitForTimeout(pausa);
      }
    } catch (e) {
      ref.guasto = 'giudizio: ' + (e && e.message || e);
      fermo = true;
    }
    mis.ms = Date.now() - tg;
    ref.misure.push(mis);
    try { await P.ctx.close(); } catch (e) {}
  }

  ref.ms = Date.now() - t0;
  ref.msGiudizio = ref.giudicate ? Math.round(msGiud / ref.giudicate) : 0;
  ref.msContesto = ref.contesti ? Math.round(msCtx / ref.contesti) : 0;
  return ref;
}

/* ------------------------------------------------------- il lanciatore */
function argomento(n, d) {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
}
const bandiera = n => process.argv.indexOf('--' + n) > 0;

/* =====================================================================
   I MOTORI DI QUESTA MACCHINA, CON LA LORO IMPRONTA (voce #142).

   Si aprono tutti quelli che Playwright ha davvero e a ognuno si CHIEDE
   la sua impronta — `window.__test.improntaMotore()`, cioe' lo stesso
   conto che il gioco scrive nel nastro. Non si indovina dal nome:
   l'impronta e' una proprieta' della VERSIONE del motore, non della sua
   marca, e un giorno un aggiornamento di Chrome potrebbe cambiarla senza
   che «chromium» cambi di una lettera. Chiederla e' l'unico modo di non
   scrivere una tabella che invecchia in silenzio.

   UN MOTORE CHE NON SI APRE NON FERMA IL GIRO: si annota e si va avanti
   con quelli che ci sono. Le righe che chiedevano quello resteranno a
   verificata = 0 e torneranno domani, su una macchina che ce l'ha.
   ===================================================================== */
async function apriMotori(playwright, indirizzo, quali) {
  const fuori = [], guai = [];
  for (const nome of quali) {
    if (!playwright[nome]) { guai.push(nome + ': Playwright non lo conosce'); continue; }
    let browser = null;
    try {
      browser = await playwright[nome].launch();
      const P = await apriPagina(browser, indirizzo, MISURA_SERIE);
      const imp = await P.pag.evaluate(() =>
        (window.__test && typeof window.__test.improntaMotore === 'function')
          ? window.__test.improntaMotore() >>> 0 : 0);
      await P.ctx.close();
      if (!imp) {
        guai.push(nome + ': questo gioco non sa dare l\'impronta del motore (e\' di prima della voce #142)');
        fuori.push({ nome, browser, impronta: 0 });
      } else {
        fuori.push({ nome, browser, impronta: imp >>> 0 });
      }
    } catch (e) {
      if (browser) { try { await browser.close(); } catch (x) {} }
      guai.push(nome + ': ' + (e && e.message || e));
    }
  }
  return { motori: fuori, guai };
}

async function main() {
  const playwright = require('playwright');
  const tettoRighe = parseInt(argomento('tetto', String(TETTO_RIGHE)), 10);
  const pausa = parseInt(argomento('pausa', String(PAUSA)), 10);
  const fotogrammi = parseInt(argomento('fotogrammi', '0'), 10) | 0;
  const asciutto = bandiera('asciutto');
  const viaTacc = path.resolve(RADICE, argomento('taccuino', 'fuori/taccuino-staffetta.json'));

  let banco;
  try { banco = bancoVero({ nome: argomento('nome', 'sola') }); }
  catch (e) { console.error('LA STAFFETTA NON PARTE: ' + e.message); process.exit(2); }

  let sg;
  try { sg = await serviGioco(argomento('gioco', process.env.GIOCO_PROVA || '')); }
  catch (e) { console.error('LA STAFFETTA NON PARTE: ' + e.message); process.exit(2); }

  const tac = bandiera('riprova') ? taccuino(null) : taccuino(viaTacc);
  console.log('=== LA STAFFETTA — il verificatore differito (voce #138) ===');
  console.log('    gioco     ' + path.relative(RADICE, sg.file).replace(/\\/g, '/'));
  console.log('    taccuino  ' + (tac.percorso || '(in memoria: --riprova)') + ', ' + tac.quanti() + ' righe gia\' viste');
  console.log('    tetto ' + tettoRighe + ' righe per giro, pausa ' + pausa + ' ms' +
              (fotogrammi ? ', rigiocata stretta a ' + fotogrammi + ' fotogrammi' : '') +
              (asciutto ? ', A VUOTO (non scrive niente)' : ''));

  const quali = String(argomento('motori', 'chromium,webkit,firefox')).split(',').map(s => s.trim()).filter(Boolean);
  const { motori, guai } = await apriMotori(playwright, sg.indirizzo, quali);
  console.log('    motori    ' + (motori.length
    ? motori.map(m => m.nome + ' ' + (m.impronta || '(impronta ignota)')).join(' · ')
    : 'NESSUNO'));
  for (const g of guai) console.log('      non disponibile: ' + g);
  if (!motori.length) {
    console.error('LA STAFFETTA NON PARTE: nessun motore si e\' aperto.');
    sg.chiudi(); process.exit(2);
  }
  let ref;
  try {
    ref = await giro({ banco, motori, browser: motori[0].browser, indirizzo: sg.indirizzo,
                       tetto: tettoRighe, pausa, taccuino: tac, asciutto, fotogrammi });
  } finally {
    for (const m of motori) { try { await m.browser.close(); } catch (e) {} }
    sg.chiudi();
  }

  console.log('');
  console.log('    pescate ' + ref.pescate + ', saltate (gia\' nel taccuino) ' + ref.saltate +
              ', giudicate ' + ref.giudicate + ' in ' + ref.contesti + ' finestre');
  for (const m of ref.misure)
    console.log('      ' + m.chiave.padEnd(24) + (m.motore || '?').padEnd(10) +
                m.righe + ' righe in ' + m.ms + ' ms');
  const t = Object.keys(ref.verdetti).sort();
  console.log('    verdetti: ' + (t.length ? t.map(k => k + ' ' + ref.verdetti[k]).join(' · ') : 'nessuno'));
  const mosse = ref.esiti.filter(e => e.mosso);
  console.log('    righe chiuse dal database: ' + mosse.length +
              ' (verificate ' + mosse.filter(e => e.verdetto === 'TORNA').length +
              ', non-torna ' + mosse.filter(e => e.verdetto === 'NON TORNA').length + ')');
  if (ref.finestreNegate.length)
    console.log('    ATTENZIONE, FINESTRA NEGATA su ' + ref.finestreNegate.length + ' righe: ' +
                ref.finestreNegate.slice(0, 3).map(f => '#' + f.id + ' chiesta ' + f.chiesta.join('x') +
                ', serve ' + (f.serve ? f.serve.join('x') : '?')).join(' · ') +
                '  — questa macchina non da\' la finestra che il nastro chiede.');
  /* IL MOTORE CHE MANCA (voce #142). Non e' un guasto: e' lavoro
     rimandato, e va detto perche' se no un referto senza NON TORNA
     sembrerebbe un giro andato bene mentre meta' delle righe non sono
     state nemmeno aperte. */
  if (ref.motoriAssenti.length) {
    const righe = ref.motoriAssenti.reduce((s, m) => s + m.righe, 0);
    console.log('    MOTORE ASSENTE su ' + righe + ' righe in ' + ref.motoriAssenti.length +
                ' gruppi: ' + ref.motoriAssenti.map(m => m.chiave + ' (' + m.righe + ')').join(' · '));
    console.log('      Restano a verificata = 0 e tornano al giro dopo: questa macchina non ha il');
    console.log('      motore JavaScript con cui quei nastri sono stati calcolati, e rigiocarli su');
    console.log('      un altro accuserebbe degli innocenti (voce #142). NON e\' un guasto.');
  }
  console.log('    tempi: ' + ref.ms + ' ms in tutto, ' + ref.msContesto + ' ms per finestra, ' +
              ref.msGiudizio + ' ms per giudizio');
  if (ref.frenata) console.log('    FRENATA dal database: il resto al giro dopo.');
  if (ref.guasto) { console.error('    GUASTO: ' + ref.guasto); process.exit(1); }
  process.exit(0);
}

module.exports = { allargaNastro, misuraDelNastro, improntaDelNastro, raggruppa,
                   scegliMotore, apriMotori, taccuino, bancoVero,
                   serviGioco, apriPagina, giro,
                   TETTO_RIGHE, PAUSA, MISURA_SERIE, FRENO_TETTO, FRENO_SECONDI };

if (require.main === module) main();
