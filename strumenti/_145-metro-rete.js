/* =====================================================================
   _145-metro-rete.js — IL METRO DELLA RETE (voce #145, compito 1)

   Libreria PURA: prende un campione di misure gia' raccolte e rende un
   referto. Non apre una connessione, non legge un orologio, non tocca
   la rete. E' il metro; la campagna che lo alimenta sta in
   `_145-campagna.js`, il cancello che lo interroga in
   `_q-rete-latenza.js`.

   Separati apposta: un metro che misura da se' non si puo' condannare
   con campioni noti, e un banco che non si puo' condannare attesta.

   ---------------------------------------------------------------
   LE QUATTRO REGOLE CHE QUESTO METRO INCARNA, e ognuna nasce da un
   modo preciso di mentire (spec §2 e §6):

   1) UN RELAY NON SI DIMEZZA. Se A e B si scambiano comandi passando
      per un server, il percorso e' A->S->B: DUE gambe. Misurarlo con
      un'eco (A->S->A) da' lo stesso numero di gambe, quindi quel
      numero E' GIA' la sola andata utile. Dividerlo per due e' l'errore
      che sembra rigore e dimezza il verdetto.
      Un P2P e' il contrario: il percorso utile A->B e' UNA gamba, e
      l'eco A->B->A ne misura due. Li' si dimezza.
      Percio' il tipo di percorso e' un CAMPO, non una cosa che chi
      legge tiene a mente.

   2) UN PERCORSO CHE NON VA FRA PARI NON PRODUCE D_rete. Un RTT verso
      una funzione HTTP dice quanto dista il server, non quanto ci mette
      un comando ad arrivare all'avversario. Il metro lo misura e si
      RIFIUTA di convertirlo.

   3) I PACCHETTI PERSI NON ESCONO DAL CONTO. Un pacchetto che non torna
      entro il tetto e' una misura censurata a destra, non una misura
      che non c'e'. Se la perdita supera il complemento del percentile
      chiesto, quel percentile e' INFINITO, non e' il massimo dei
      fortunati.

   4) UN CAMPIONE CORTO NON PRODUCE UN PERCENTILE. La numerosita'
      minima non e' una costante scelta a gusto: si ricava
      dall'intervallo di confidenza non parametrico del quantile
      (binomiale sulle statistiche d'ordine). Il metro calcola il
      proprio N e lo stampa.
   ===================================================================== */

const TICK_MS = 1000 / 60;                 /* 16,667 ms */

/* ---------------------------------------------------------------- le
   SOGLIE, dichiarate nella spec del compito 0 e COMMITTATE PRIMA che un
   banco girasse (`docs/superpowers/specs/2026-09-23-misura-rete-design.md`
   §3). Stanno qui in una costante sola perche' nessuno possa cambiarle
   in un ramo e dimenticarsene nell'altro. */
const SOGLIE = {
  /* S1 — il tetto dell'intervallo che il #141 ha DAVVERO guardato.
     Oltre i 18 tick non c'e' misura del gioco: c'e' estrapolazione. */
  S1_RETE_TICK: 18,
  /* S2 — il margine: a 12 tick il #141 ha misurato tutti e cinque i
     verbi vivi e la carica 6/6 dentro la finestra dolce. */
  S2_MARGINE_TICK: 12,
  /* S3 — lo stallo. NON si sceglie: si deriva. Un invio ogni 100 ms
     sono 600 pacchetti al minuto; per stare sotto UNO stallo al minuto
     serve P(andata > D) < 1/600. Cioe' D deve coprire il p99,83. */
  S3_INVII_AL_MINUTO: 600,
  S3_STALLI_AL_MINUTO: 1,
  S3_STALLO_MAX_MS: 250,
  /* S6 — il campione. La semiampiezza dell'intervallo di confidenza al
     95% del p95 non puo' superare 25 ms, o il numero e' inventato. */
  S6_IC_SEMIAMPIEZZA_MS: 25,
  /* il tetto oltre il quale un pacchetto e' perso, non lento */
  TETTO_MS: 1000
};

/* la frazione della coda che lo stallo chiede di coprire:
   1 - (stalli al minuto / invii al minuto) = 1 - 1/600 = 0,998333 */
const P_STALLO = 1 - SOGLIE.S3_STALLI_AL_MINUTO / SOGLIE.S3_INVII_AL_MINUTO;

/* ---------------------------------------------------------------- i
   percentili, a RANGO PIU' VICINO (nearest-rank) e non interpolati.
   Scelta dichiarata: sulle code lunghe l'interpolazione inventa un
   valore che nessun pacchetto ha avuto, e questo cantiere decide
   proprio sulla coda.
   `persi` entra come censura a destra: i pacchetti non tornati stanno
   in fondo all'ordinamento, a +infinito. */
function percentile(ordinati, p, persi) {
  persi = persi | 0;
  const n = ordinati.length + persi;
  if (n === 0) return null;
  const r = Math.ceil(p * n);              /* rango 1-indicizzato */
  if (r > ordinati.length) return Infinity; /* cade dentro i persi */
  return ordinati[Math.max(0, r - 1)];
}

/* ---------------------------------------------------------------- l'
   INTERVALLO DI CONFIDENZA NON PARAMETRICO DEL QUANTILE.
   Metodo binomiale esatto sulle statistiche d'ordine: il rango k-esimo
   e' un estremo di confidenza al livello `conf` se la binomiale(n, p)
   gli lascia abbastanza massa. Nessuna assunzione sulla forma della
   distribuzione — che e' il punto: le latenze non sono normali, hanno
   una coda che la normale non sa immaginare. */
function icQuantile(n, p, conf) {
  if (n < 1) return null;
  const alfa = (1 - conf) / 2;
  /* massa cumulata della binomiale(n, p), in scala logaritmica per non
     traboccare su n grandi */
  const lgamma = (x) => {
    /* Lanczos, g=7 — basta ampiamente per i nostri n */
    const g = [676.5203681218851, -1259.1392167224028, 771.32342877765313,
               -176.61502916214059, 12.507343278686905, -0.13857109526572012,
               9.9843695780195716e-6, 1.5056327351493116e-7];
    if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x);
    x -= 1;
    let a = 0.99999999999980993;
    const t = x + 7.5;
    for (let i = 0; i < 8; i++) a += g[i] / (x + i + 1);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  };
  const lchoose = (n_, k) => lgamma(n_ + 1) - lgamma(k + 1) - lgamma(n_ - k + 1);
  let cum = 0, kLo = null, kHi = null;
  for (let k = 0; k <= n; k++) {
    const lp = lchoose(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p);
    cum += Math.exp(lp);
    if (kLo === null && cum > alfa) kLo = k;           /* rango basso */
    if (kHi === null && cum >= 1 - alfa) { kHi = k + 1; break; }
  }
  if (kLo === null) kLo = 1;
  if (kHi === null) kHi = n + 1;
  /* ATTENZIONE, ed e' il punto dove il metro si e' gia' salvato una
     volta: se il rango alto cade OLTRE l'ultima osservazione, il p95
     non ha un estremo superiore di confidenza — con due campioni non
     si puo' limitare dall'alto il novantacinquesimo percentile, e
     clampare `kHi` a n farebbe uscire un intervallo stretto e falso
     (40-45 ms), cioe' un campione da due misure che si dichiara buono.
     Si lascia sforare, e chi legge lo traduce in +infinito. */
  return { kLo: Math.max(1, kLo), kHi };
}

/* quanti campioni servono perche' la semiampiezza dell'IC del p95 stia
   sotto `mezzaAmpiezzaMs`, data la dispersione osservata. Si cerca per
   raddoppio e poi per bisezione sul campione che si ha, scalando
   l'ampiezza come 1/sqrt(n) — dichiarato come STIMA, perche' estrapola
   dalla forma osservata. */
function nMinimoPerP95(ordinati, persi, mezzaAmpiezzaMs) {
  const n = ordinati.length + (persi | 0);
  if (n < 10) return null;
  const ic = icQuantile(n, 0.95, 0.95);
  if (!ic) return null;
  const lo = ordinati[Math.min(ordinati.length - 1, ic.kLo - 1)];
  const hi = ic.kHi > ordinati.length ? Infinity : ordinati[ic.kHi - 1];
  if (!isFinite(hi) || !isFinite(lo)) return null;
  const mezza = (hi - lo) / 2;
  if (mezza <= mezzaAmpiezzaMs) return n;
  /* mezza ~ c/sqrt(n) => n' = n * (mezza/bersaglio)^2 */
  return Math.ceil(n * Math.pow(mezza / mezzaAmpiezzaMs, 2));
}

/* ---------------------------------------------------------------- il
   REFERTO. Prende un campione grezzo e rende i numeri, SENZA
   giudicarli: il giudizio e' `giudica`, e sono separati perche' un
   referto sbagliato e un giudizio sbagliato si riparano in posti
   diversi.

   campione = {
     sorgente : stringa — DA DOVE. Se contiene 'locale' o 'loopback' il
                metro si rifiuta (regola 2 della spec §4).
     tipo     : 'relay' | 'p2p' | 'http'  — il percorso (regola 1)
     misure   : [ms...] — i giri misurati, NON ancora convertiti
     persi    : quanti spediti non sono tornati entro il tetto
     tettoMs  : il tetto usato
     note     : stringa libera
   } */
function referto(campione) {
  const c = campione || {};
  const fuori = { sorgente: c.sorgente || '(ignota)', tipo: c.tipo || '(ignoto)' };
  const misure = (c.misure || []).filter(x => typeof x === 'number' && isFinite(x) && x >= 0);
  const persi = c.persi | 0;
  fuori.inviati = misure.length + persi;
  fuori.tornati = misure.length;
  fuori.persi = persi;
  fuori.perditaPct = fuori.inviati ? (100 * persi / fuori.inviati) : null;
  fuori.tettoMs = c.tettoMs || SOGLIE.TETTO_MS;
  fuori.note = c.note || '';

  /* --- porta 1: la sorgente. Un giro su loopback ha una forma di
     distribuzione perfetta e numeri plausibili: solo la sorgente lo
     tradisce, e per questo la sorgente e' un campo obbligatorio. */
  const s = String(fuori.sorgente).toLowerCase();
  if (/locale|loopback|127\.0\.0\.1|localhost|::1|stessa-macchina/.test(s)) {
    fuori.causa = 'sorgente-locale';
    fuori.nota = 'un giro dentro la macchina non e\' una misura di rete';
    return fuori;
  }
  if (fuori.inviati === 0) { fuori.causa = 'campione-vuoto'; return fuori; }

  const ord = misure.slice().sort((a, b) => a - b);
  fuori.min = ord[0];
  fuori.max = ord[ord.length - 1];
  fuori.media = ord.reduce((a, b) => a + b, 0) / ord.length;
  fuori.p50 = percentile(ord, 0.50, persi);
  fuori.p95 = percentile(ord, 0.95, persi);
  fuori.p99 = percentile(ord, 0.99, persi);
  fuori.pStallo = percentile(ord, P_STALLO, persi);
  fuori.pStalloEtichetta = 'p' + (P_STALLO * 100).toFixed(2);
  /* il jitter come lo intende un buffer di dejitter: la larghezza della
     coda utile, non lo scarto tipo (che una coda lunga nasconde) */
  fuori.jitter = (isFinite(fuori.p99) && isFinite(fuori.p50)) ? fuori.p99 - fuori.p50 : Infinity;

  /* --- l'intervallo di confidenza del p95, e quanti campioni servono */
  const ic = icQuantile(fuori.inviati, 0.95, 0.95);
  if (ic) {
    const lo = ic.kLo <= ord.length ? ord[ic.kLo - 1] : Infinity;
    const hi = ic.kHi <= ord.length ? ord[ic.kHi - 1] : Infinity;
    fuori.icP95 = [lo, hi];
    fuori.icSemiampiezza = (isFinite(hi) && isFinite(lo)) ? (hi - lo) / 2 : Infinity;
  } else { fuori.icP95 = null; fuori.icSemiampiezza = Infinity; }
  fuori.nMinimo = nMinimoPerP95(ord, persi, SOGLIE.S6_IC_SEMIAMPIEZZA_MS);

  /* quanti campioni servono anche solo perche' il p99,83 ESISTA: sotto
     1/(1-p) campioni nessun pacchetto cade in quella coda, e il numero
     non e' misurato, e' finito dentro i persi o fuori del campione */
  fuori.nMinimoStallo = Math.ceil(1 / (1 - P_STALLO));
  fuori.stalloMisurabile = fuori.inviati >= fuori.nMinimoStallo;

  /* --- porta 2: il percorso. Qui la regola 1, e qui il falso
     `mezzo-giro` muore. */
  if (fuori.tipo === 'relay') {
    /* eco A->S->A = due gambe = ESATTAMENTE il percorso A->S->B.
       NON si divide. Ipotesi dichiarata: A e B equidistanti dal relay. */
    fuori.fattore = 1;
    fuori.percorso = 'A->S->B (due gambe); l\'eco A->S->A ne misura due: nessuna divisione';
    fuori.ipotesi = 'A e B equidistanti dal relay';
  } else if (fuori.tipo === 'p2p') {
    /* eco A->B->A = due gambe su un percorso utile di UNA: si dimezza */
    fuori.fattore = 0.5;
    fuori.percorso = 'A->B (una gamba); l\'eco A->B->A ne misura due: si dimezza';
    fuori.ipotesi = 'percorso simmetrico fra i due pari';
  } else {
    /* http o ignoto: un RTT verso un server non e' un percorso fra pari */
    fuori.fattore = null;
    fuori.percorso = 'telefono->server->telefono stesso: NON e\' un percorso fra pari';
    fuori.causa = 'percorso-non-fra-pari';
    fuori.nota = 'dice quanto dista il server, non quanto ci mette un comando ad arrivare all\'avversario';
    return fuori;
  }

  const f = fuori.fattore;
  fuori.andata_p50 = fuori.p50 * f;
  fuori.andata_p95 = fuori.p95 * f;
  fuori.andata_p99 = fuori.p99 * f;
  fuori.andata_pStallo = fuori.pStallo * f;
  fuori.andata_max = fuori.max * f;

  /* --- D_rete = andata_p95 + buffer_dejitter + 1 tick.
     Il buffer di dejitter NON si sceglie a gusto: e' quel che serve a
     passare dal coprire il 95% al coprire il 99%, cioe' p99 - p95.
     Che, sommato, fa: D_rete = andata_p99 + 1 tick. Lo si scrive in
     chiaro invece di lasciarlo dentro una formula, perche' una formula
     che nasconde la propria semplificazione e' un posto dove si annida
     un errore che nessuno rilegge. */
  fuori.buffer = fuori.andata_p99 - fuori.andata_p95;
  fuori.D_rete_ms = fuori.andata_p95 + fuori.buffer + TICK_MS;
  fuori.D_rete_tick = fuori.D_rete_ms / TICK_MS;

  /* --- D_stallo: il ritardo che tiene meno di UNO stallo al minuto,
     SENZA ridondanza. E' il caso peggiore dichiarato. */
  fuori.D_stallo_ms = fuori.andata_pStallo + TICK_MS;
  fuori.D_stallo_tick = fuori.D_stallo_ms / TICK_MS;

  /* --- con la ridondanza di §2.4 del progetto d'onda (ogni pacchetto
     porta gli ultimi R comandi) uno stallo chiede che R pacchetti
     CONSECUTIVI siano in ritardo. Con perdite indipendenti il conto e'
     600 * P^R. STIMA, e marcata tale: le perdite di rete arrivano a
     raffica, non indipendenti, e da questa macchina non si misura. */
  fuori.D_stallo_R3_ms = (() => {
    const R = 3;
    const pBersaglio = 1 - Math.pow(SOGLIE.S3_STALLI_AL_MINUTO / SOGLIE.S3_INVII_AL_MINUTO, 1 / R);
    return percentile(ord, 1 - pBersaglio, persi) * f + TICK_MS;
  })();
  fuori.D_stallo_R3_stima = true;

  /* quanto dura uno stallo: il pacchetto piu' lento meno il ritardo scelto */
  fuori.stalloPiuLungo_ms = fuori.andata_max - fuori.D_rete_ms;

  return fuori;
}

/* ---------------------------------------------------------------- il
   GIUDIZIO. Applica le soglie di §3 della spec, una per una, e non ne
   inventa nessuna. Rende `{ esito, righe }` dove esito e':
     'SI'          — tutte le soglie che decidono tengono
     'SI-SENZA-MARGINE' — S1 tiene, S2 no
     'NO'          — S1 o S3 non tengono
     'PROVA-NULLA' — il campione non permette di decidere (uscita 3) */
function giudica(r) {
  const righe = [];
  const di = (s, esito, det) => righe.push({ soglia: s, esito, det });

  if (r.causa) {
    di('S6 — campione', 'PROVA-NULLA', r.causa + (r.nota ? ': ' + r.nota : ''));
    return { esito: 'PROVA-NULLA', righe, causa: r.causa };
  }

  /* S6 per prima: se il campione non regge, le altre soglie leggerebbero
     numeri inventati, e un numero con la dispersione fuori soglia non si
     trascrive da nessuna parte. */
  let nulla = null;
  if (r.nMinimo && r.inviati < r.nMinimo) {
    nulla = 'campione-corto';
    di('S6 — campione', 'PROVA-NULLA',
       r.inviati + ' campioni, ne servono ' + r.nMinimo +
       ' perche\' la semiampiezza dell\'IC del p95 stia sotto ' + SOGLIE.S6_IC_SEMIAMPIEZZA_MS + ' ms');
  } else if (!isFinite(r.icSemiampiezza) || r.icSemiampiezza > SOGLIE.S6_IC_SEMIAMPIEZZA_MS) {
    nulla = 'ic-troppo-largo';
    di('S6 — campione', 'PROVA-NULLA',
       'semiampiezza IC del p95 = ' + (isFinite(r.icSemiampiezza) ? r.icSemiampiezza.toFixed(1) : 'infinita') +
       ' ms, tetto ' + SOGLIE.S6_IC_SEMIAMPIEZZA_MS + ' ms');
  } else {
    di('S6 — campione', 'TIENE',
       r.inviati + ' campioni, semiampiezza IC del p95 = ' + r.icSemiampiezza.toFixed(1) + ' ms');
  }
  if (nulla) return { esito: 'PROVA-NULLA', righe, causa: nulla };

  const s1 = r.D_rete_tick <= SOGLIE.S1_RETE_TICK;
  di('S1 — D_rete(p95) <= ' + SOGLIE.S1_RETE_TICK + ' tick (300 ms)',
     s1 ? 'TIENE' : 'NON TIENE',
     'D_rete = ' + r.D_rete_ms.toFixed(1) + ' ms = ' + r.D_rete_tick.toFixed(1) + ' tick');

  const s2 = r.D_rete_tick <= SOGLIE.S2_MARGINE_TICK;
  di('S2 — D_rete(p95) <= ' + SOGLIE.S2_MARGINE_TICK + ' tick (200 ms)',
     s2 ? 'TIENE' : 'NON TIENE',
     'D_rete = ' + r.D_rete_tick.toFixed(1) + ' tick');

  /* S3 — lo stallo. Se il campione e' troppo corto perche' il p99,83
     esista, non si dice «tiene»: si dice che non e' misurato. */
  let s3;
  if (!r.stalloMisurabile) {
    s3 = null;
    di('S3 — stallo (' + r.pStalloEtichetta + ')', 'NON MISURATO',
       r.inviati + ' campioni, ne servono almeno ' + r.nMinimoStallo +
       ' perche\' un pacchetto cada in quella coda');
  } else {
    s3 = isFinite(r.D_stallo_tick) && r.D_stallo_tick <= SOGLIE.S1_RETE_TICK;
    di('S3 — stallo: D >= ' + r.pStalloEtichetta + ' e D <= ' + SOGLIE.S1_RETE_TICK + ' tick',
       s3 ? 'TIENE' : 'NON TIENE',
       'D_stallo = ' + (isFinite(r.D_stallo_ms) ? r.D_stallo_ms.toFixed(1) + ' ms = ' +
        r.D_stallo_tick.toFixed(1) + ' tick' : 'infinito (la coda cade dentro i persi)'));
  }

  let esito;
  if (!s1 || s3 === false) esito = 'NO';
  else if (s3 === null) esito = s2 ? 'SI-NON-COMPLETO' : 'SI-SENZA-MARGINE-NON-COMPLETO';
  else esito = s2 ? 'SI' : 'SI-SENZA-MARGINE';
  return { esito, righe };
}

module.exports = { TICK_MS, SOGLIE, P_STALLO, percentile, icQuantile, nMinimoPerP95, referto, giudica };
