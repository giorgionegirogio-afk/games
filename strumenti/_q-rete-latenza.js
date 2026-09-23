/* =====================================================================
   _q-rete-latenza.js — IL CANCELLO DELLA MISURA DI RETE
   (voce #145, compito 1)

   NASCE ROSSO, e lo dice il progetto d'onda §4 (#143 nella vecchia
   numerazione): «deve rifiutare un campione troppo corto e saper dire
   -questa rete non regge D_gioco-. Nasce rosso perche' oggi nel repo
   non c'e' un solo numero di RTT».

   ---------------------------------------------------------------
   PERCHE' E' FATTO COSI' — e la forma e' quella che il #141 ha pagato
   con `_q-ritardo`.

   Un cancello che per accendersi ha bisogno di un servizio esterno
   dice «non ho potuto misurare» tutte le volte che il bar ha il wifi
   lento, e in due settimane la gente impara a ignorarlo. Quindi questo
   cancello NON misura la rete: misura IL METRO, con campioni sintetici
   noti, offline e deterministico. La rete vera la tocca
   `_145-campagna.js`, che e' una campagna e non un cancello, e che
   esce 3 quando non puo' misurare.

   Il cancello ha due parti:

     0) LE DIECI PROVE DEL METRO. Campioni costruiti apposta, dove la
        risposta giusta e' nota prima. Sono le prove che i cinque falsi
        di `_q-rete-falsi.js` devono far cadere.
     1) IL DEPOSITO. Esiste nel repo una misura di rete depositata, con
        la sua sorgente dichiarata? E' la prova che nasce rossa, e
        diventa verde al compito 3 quando la campagna avra' depositato.
        Non chiede che il verdetto sia SI — una rete brutta e' un fatto
        del mondo, non un difetto del codice — chiede che la misura
        esista, dichiari da dove viene, e non spacci per propria la
        letteratura.

   uso:  node strumenti/_q-rete-latenza.js
         node strumenti/_q-rete-latenza.js --bugia strumenti/_crit-rete-potatore.js
   esce  0 verde · 1 rosso · 2 il banco e' esploso · 3 prova nulla
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const bugiaFile = arg('bugia', '');
const DEPOSITO = path.join(RADICE, '_analisi', 'misura-rete-145.json');

let M = require('./_145-metro-rete.js');
let bugia = null;
if (bugiaFile) {
  bugia = require(path.resolve(RADICE, bugiaFile));
  console.log('*** BANCO BUGIARDO IN CORSO: ' + bugia.nome + ' — ' + bugia.descrizione + '\n');
  M = bugia.patch(Object.assign({}, M));
}

/* ------------------------------------------------------------------ i
   campioni sintetici. Un generatore deterministico, perche' un cancello
   che sorteggia e' un cancello che un giorno diventa rumoroso e il
   giorno dopo non si sa perche'. */
function dado(seme) { let s = seme >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }

/* n misure attorno a `centro`, con dispersione `disp`, piu' una coda:
   `codaN` misure a `codaMs`. */
function campione(seme, n, centro, disp, codaN, codaMs) {
  const r = dado(seme), v = [];
  for (let i = 0; i < n - (codaN | 0); i++) v.push(centro + (r() - 0.5) * 2 * disp);
  for (let i = 0; i < (codaN | 0); i++) v.push(codaMs + (r() - 0.5) * 2);
  return v;
}

const esiti = [];
let esploso = null;
function di(sigla, ok, testo, det) {
  esiti.push({ sigla, ok });
  console.log('  ' + (ok ? 'OK  ' : 'NO  ') + sigla + ') ' + testo + (det ? '\n        ' + det : ''));
}
/* una prova che esplode non e' una prova rossa: il banco non puo'
   fidarsi di se' e si esce 2 */
function prova(sigla, testo, fn) {
  try { const [ok, det] = fn(); di(sigla, ok, testo, det); }
  catch (e) { esploso = sigla + ': ' + e.message; di(sigla, false, testo, 'ESPLOSA — ' + e.message); }
}

console.log('IL METRO DELLA RETE — ' + (bugia ? 'con la bugia «' + bugia.nome + '»' : 'metro onesto') + '\n');
console.log('0) LE DIECI PROVE DEL METRO — campioni noti, risposta nota prima\n');

/* --- 0a — IL CAMPIONE CORTO.
   Due misure BUONE (40 e 45 ms). Un metro che guarda il valore le
   promuove; un metro che guarda la numerosita' no. Con due campioni il
   novantacinquesimo percentile non ha un estremo superiore di
   confidenza, e un numero senza estremo non si trascrive. */
prova('0a', 'due campioni buoni non fanno un p95: PROVA NULLA, non verde', () => {
  const r = M.referto({ sorgente: 'macchina di casa -> relay pubblico', tipo: 'relay', misure: [40, 45], persi: 0 });
  const g = M.giudica(r);
  return [g.esito === 'PROVA-NULLA', 'esito ' + g.esito + ' · causa ' + (g.causa || '—')];
});

/* --- 0b — LA SORGENTE LOCALE.
   Cinquemila misure, forma perfetta, numeri plausibili per un giro
   locale (1-3 ms). Nessun difetto nei numeri: solo la sorgente lo
   tradisce, ed e' per questo che la sorgente e' un campo obbligatorio. */
prova('0b', 'un giro dentro la macchina non e\' una misura di rete', () => {
  const r = M.referto({ sorgente: 'loopback 127.0.0.1', tipo: 'relay', misure: campione(7, 5000, 2, 1), persi: 0 });
  const g = M.giudica(r);
  return [g.esito === 'PROVA-NULLA' && r.causa === 'sorgente-locale',
          'esito ' + g.esito + ' · causa ' + (r.causa || '—')];
});

/* --- 0c — LA CODA NON SI POTA.
   Duemila misure: 1880 strette attorno a 60 ms e 120 a 900 ms (6%). Il
   p95 vero CADE DENTRO la coda e vale 900. Un metro che pota il 5%
   peggiore prima di contare stampa un p95 attorno a 60 — quasi giusto,
   e totalmente inutile, perche' tutto cio' che decide uno stallo sta
   proprio in quel 6% buttato. */
prova('0c', 'il p95 di una distribuzione a coda lunga sta NELLA coda', () => {
  const r = M.referto({ sorgente: 'macchina di casa -> relay pubblico', tipo: 'relay',
                        misure: campione(11, 2000, 60, 5, 120, 900), persi: 0 });
  return [isFinite(r.p95) && r.p95 >= 500, 'p95 = ' + (isFinite(r.p95) ? r.p95.toFixed(1) : r.p95) + ' ms (atteso ~900)'];
});

/* --- 0d — IL RELAY NON SI DIMEZZA, IL P2P SI'.
   Lo stesso numero grezzo (120 ms) su due percorsi diversi deve dare
   due sole andate diverse. E' la regola 1 del metro, e la prova
   guarda TUTTE E DUE le direzioni apposta: un metro che non converte
   mai cade sul p2p, uno che dimezza sempre cade sul relay. */
prova('0d', 'relay = due gambe (non si dimezza) · p2p = una gamba (si dimezza)', () => {
  const mis = campione(13, 1200, 120, 4);
  const rel = M.referto({ sorgente: 'macchina di casa -> relay pubblico', tipo: 'relay', misure: mis, persi: 0 });
  const p2p = M.referto({ sorgente: 'macchina di casa -> pari', tipo: 'p2p', misure: mis, persi: 0 });
  const okRel = Math.abs(rel.andata_p95 - rel.p95) < 0.01;
  const okP2p = Math.abs(p2p.andata_p95 - p2p.p95 / 2) < 0.01;
  return [okRel && okP2p,
          'relay: p95 ' + rel.p95.toFixed(1) + ' -> andata ' + rel.andata_p95.toFixed(1) +
          '  ·  p2p: p95 ' + p2p.p95.toFixed(1) + ' -> andata ' + p2p.andata_p95.toFixed(1)];
});

/* --- 0e — I PERSI SI CONTANO, E CENSURANO LA CODA.
   Mille spediti, 880 tornati, 120 persi (12%). Il p95 chiede il rango
   950 su mille: cade DENTRO i persi, quindi vale infinito. Un metro
   che tiene solo i pacchetti tornati stampa perdita 0,0% e un p95
   finito e rassicurante: e' il difetto di ogni registro che scrive solo
   le richieste riuscite. */
prova('0e', '12% di persi: perdita 12% e p95 infinito (censura a destra)', () => {
  const r = M.referto({ sorgente: 'macchina di casa -> relay pubblico', tipo: 'relay',
                        misure: campione(17, 880, 60, 8), persi: 120 });
  const okPerd = r.perditaPct !== null && Math.abs(r.perditaPct - 12) < 1.0;
  const okP95 = !isFinite(r.p95);
  return [okPerd && okP95,
          'perdita ' + (r.perditaPct === null ? '—' : r.perditaPct.toFixed(1) + '%') +
          ' · p95 ' + (isFinite(r.p95) ? r.p95.toFixed(1) + ' ms' : 'infinito')];
});

/* --- 0f — IL METRO VARIA.
   Un metro che rende sempre lo stesso numero passa tutte le prove di
   forma e non misura niente. Due reti diverse devono dare due D_rete
   diverse, e di parecchio. */
prova('0f', 'due reti diverse danno due D_rete diverse', () => {
  const a = M.referto({ sorgente: 'rete A', tipo: 'relay', misure: campione(19, 1200, 45, 6), persi: 0 });
  const b = M.referto({ sorgente: 'rete B', tipo: 'relay', misure: campione(23, 1200, 210, 20), persi: 0 });
  return [isFinite(a.D_rete_ms) && isFinite(b.D_rete_ms) && (b.D_rete_ms - a.D_rete_ms) > 100,
          'A ' + a.D_rete_ms.toFixed(1) + ' ms · B ' + b.D_rete_ms.toFixed(1) + ' ms'];
});

/* --- 0g — IL METRO SA DIRE NO.
   Una rete a 800 ms di giro fra pari: 400 ms di sola andata, cioe' ben
   oltre i 18 tick dell'intervallo che il #141 ha davvero guardato. Un
   banco che non sa dire no non e' un banco. */
prova('0g', 'una rete a 400 ms di sola andata: il verdetto dev\'essere NO', () => {
  const r = M.referto({ sorgente: 'macchina di casa -> pari lontano', tipo: 'p2p',
                        misure: campione(29, 1200, 800, 20), persi: 0 });
  const g = M.giudica(r);
  return [g.esito === 'NO', 'esito ' + g.esito + ' · D_rete ' + r.D_rete_ms.toFixed(1) + ' ms = ' + r.D_rete_tick.toFixed(1) + ' tick'];
});

/* --- 0h — IL METRO SA DIRE SI.
   La meta' che manca a quasi tutti i banchi: un metro rotto in modo da
   essere rosso SEMPRE passerebbe le prove che chiedono un NO senza
   discriminare niente. Una rete buona (45 ms, coda stretta) deve dare
   SI, e con margine. */
prova('0h', 'una rete buona (45 ms, coda stretta) dev\'essere un SI', () => {
  const r = M.referto({ sorgente: 'macchina di casa -> relay vicino', tipo: 'relay',
                        misure: campione(31, 1200, 45, 8), persi: 0 });
  const g = M.giudica(r);
  return [g.esito === 'SI', 'esito ' + g.esito + ' · D_rete ' + r.D_rete_ms.toFixed(1) + ' ms = ' + r.D_rete_tick.toFixed(1) + ' tick'];
});

/* --- 0i — LO STALLO MORDE DOVE IL p95 NON MORDE, ed e' la prova che
   giustifica tutta la derivazione della spec §2.3.
   Milleduecento misure: 1194 a 50 ms e SEI a 2000 ms. Il p95 e il p99
   non vedono quelle sei — valgono 50 ms — e S1 e S2 tengono
   larghissime. Ma con 600 invii al minuto quelle sei sono tre stalli al
   minuto, e la partita si ferma. Un metro che guarda solo il p95
   direbbe SI a una rete ingiocabile. */
prova('0i', 'sei pacchetti su 1200 a 2 secondi: p95 innocente, S3 deve mordere', () => {
  const r = M.referto({ sorgente: 'macchina di casa -> relay a singhiozzo', tipo: 'relay',
                        misure: campione(37, 1200, 50, 4, 6, 2000), persi: 0 });
  const g = M.giudica(r);
  const s1 = g.righe.find(x => /^S1/.test(x.soglia));
  const s3 = g.righe.find(x => /^S3/.test(x.soglia));
  return [g.esito === 'NO' && s1 && s1.esito === 'TIENE' && s3 && s3.esito === 'NON TIENE',
          'p95 ' + r.p95.toFixed(1) + ' ms · ' + r.pStalloEtichetta + ' ' +
          (isFinite(r.pStallo) ? r.pStallo.toFixed(1) : 'inf') + ' ms · S1 ' +
          (s1 ? s1.esito : '—') + ' · S3 ' + (s3 ? s3.esito : '—') + ' · esito ' + g.esito];
});

/* --- 0j — UN PERCORSO CHE NON VA FRA PARI NON PRODUCE D_rete.
   Un RTT verso una funzione HTTP e' una misura vera e utile — dice
   quanto dista il server — ma non dice quanto ci mette un comando ad
   arrivare all'avversario. Il metro lo misura e si rifiuta di
   convertirlo, invece di dividere per due e sperare. */
prova('0j', 'un RTT verso un server non si converte in D_rete', () => {
  const r = M.referto({ sorgente: 'macchina di casa -> funzione Vercel', tipo: 'http',
                        misure: campione(41, 1200, 80, 10), persi: 0 });
  const g = M.giudica(r);
  return [r.causa === 'percorso-non-fra-pari' && g.esito === 'PROVA-NULLA' && r.D_rete_ms === undefined,
          'causa ' + (r.causa || '—') + ' · esito ' + g.esito + ' · D_rete ' + (r.D_rete_ms === undefined ? 'non prodotta' : r.D_rete_ms)];
});

/* ================================================================== 1
   IL DEPOSITO — la prova che nasce rossa. */
console.log('\n1) IL DEPOSITO — esiste nel repo una misura di rete, e dichiara da dove viene?\n');

prova('1a', 'la misura di rete e\' depositata in _analisi/misura-rete-145.json', () => {
  if (!fs.existsSync(DEPOSITO)) return [false, 'assente — oggi nel repo non c\'e\' un solo numero di RTT'];
  return [true, path.relative(RADICE, DEPOSITO)];
});

if (fs.existsSync(DEPOSITO)) {
  let dep = null;
  try { dep = JSON.parse(fs.readFileSync(DEPOSITO, 'utf8')); }
  catch (e) { esploso = 'deposito illeggibile: ' + e.message; }

  /* il deposito ha TRE classi, e tenerle separate e' il punto:
     · MISURATI   — numeri miei, con la loro sorgente
     · LETTERATURA — numeri di altri, marcati e con la fonte
     · ASSENZE     — cio' che si e' cercato e NON si e' trovato, scritto
                     invece di essere inventato */
  const tutti = () => (dep && dep.campioni) || [];
  const misurati = () => tutti().filter(x => !x.letteratura && !x.non_reperito);
  const letteratura = () => tutti().filter(x => x.letteratura);
  const assenze = () => tutti().filter(x => x.non_reperito);

  prova('1b', 'ogni campione MISURATO dichiara sorgente, tipo e data', () => {
    const c = misurati();
    if (!c.length) return [false, 'nessun campione misurato'];
    const mancanti = c.filter(x => !x.sorgente || !x.tipo || !x.data);
    return [mancanti.length === 0, c.length + ' campioni, ' + mancanti.length + ' senza sorgente/tipo/data'];
  });

  prova('1c', 'nessun campione misurato e\' locale, e nessuno si spaccia per mobile italiano', () => {
    const c = misurati();
    const locali = c.filter(x => /locale|loopback|127\.0\.0\.1|localhost/i.test(String(x.sorgente)));
    /* la ferita che questo cantiere doveva evitare: un numero di
       letteratura trascritto come se fosse mio. Un campione locale
       MISURATO e' ammesso solo se il metro lo rifiuta da se' — e lo
       rifiuta, prova 0b — ma non deve MAI presentarsi come rete. */
    const spacciati = c.filter(x => /mobile italian|4G italian|5G italian/i.test(String(x.sorgente)));
    /* un campione LOCALE nel deposito e' lecito — anzi, serve: e' il
       controllo che dice se la coda lunga e' della rete o del banco —
       ma solo se DICHIARA di esserlo. Un campione locale muto, in mezzo
       agli altri, un giorno viene letto come rete. */
    const localiMuti = locali.filter(x => !/rifiut|controllo|prova 0b/i.test(String(x.note || '')));
    return [spacciati.length === 0 && localiMuti.length === 0,
            c.length + ' campioni misurati · ' + locali.length + ' locali (' + localiMuti.length +
            ' non dichiarati come controllo) · ' + spacciati.length + ' spacciati per mobile italiano'];
  });

  prova('1d', 'la letteratura e\' marcata, porta la sua fonte, e le assenze sono dichiarate', () => {
    const l = letteratura(), a = assenze();
    const senzaFonte = l.filter(x => !x.fonte);
    const assenzeMute = a.filter(x => !x.fonte || !x.note);
    return [senzaFonte.length === 0 && assenzeMute.length === 0,
            l.length + ' voci di letteratura (' + senzaFonte.length + ' senza fonte) · ' +
            a.length + ' assenze dichiarate (' + assenzeMute.length + ' senza fonte o nota)'];
  });

  prova('1e', 'il metro sa giudicare il deposito, e stampa un esito per ogni campione', () => {
    const c = misurati().filter(x => x.misure);
    if (!c.length) return [false, 'nessun campione con misure'];
    const righe = c.map(x => {
      const r = M.referto(x); const g = M.giudica(r);
      return '        · ' + x.sorgente + ' [' + x.tipo + '] n=' + r.inviati + ' -> ' + g.esito +
             (isFinite(r.D_rete_tick) ? ' (D_rete ' + r.D_rete_tick.toFixed(1) + ' tick)' : '');
    });
    return [true, c.length + ' campioni giudicati\n' + righe.join('\n')];
  });
}

/* ------------------------------------------------------------------ */
const rossi = esiti.filter(x => !x.ok);
console.log('\n' + esiti.length + ' prove, ' + (esiti.length - rossi.length) + ' passate, ' + rossi.length + ' fallite');

if (esploso) {
  console.log('\n>>> IL BANCO E\' ESPLOSO (' + esploso + '). Non puo\' fidarsi di se\', e non accusa nessuno.');
  process.exit(2);
}
if (rossi.length) {
  const soloDeposito = rossi.every(x => /^1/.test(x.sigla));
  console.log('\n>>> ROSSO: ' + rossi.map(x => x.sigla).join(', '));
  if (soloDeposito) {
    console.log('    Il metro regge; manca LA MISURA. E\' il rosso con cui questo cancello nasce:');
    console.log('    oggi nel repo non c\'e\' un solo numero di RTT, e finche\' non c\'e\' l\'onda E');
    console.log('    non ha il diritto di scrivere una riga di lockstep.');
  } else {
    console.log('    Il METRO non regge. I numeri che produrrebbe non vanno trascritti da nessuna parte.');
  }
  process.exit(1);
}
console.log('\n>>> VERDE: il metro discrimina e la misura e\' depositata con la sua sorgente.');
process.exit(0);
