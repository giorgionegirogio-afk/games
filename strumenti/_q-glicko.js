/* =====================================================================
   _q-glicko.js — IL RATING NASCOSTO (voce #140).

   NASCE ROSSO: `rete/lib/glicko.js` non esiste ancora, e la terza
   coordinata di `rete/lib/abbinamento.js` nemmeno. Finche' non ci sono,
   ogni prova qui dentro e' rossa — ma il banco NON esplode e NON dichiara
   prova nulla: dice 1, cioe' «la cosa da misurare non c'e'». Un cancello
   che esce 2 manderebbe a riparare il banco invece che a scrivere la cura.

   PERCHE' NON APRE IL GIOCO. Come `_q-sospetto.js`: non c'e' niente da
   aprire. Il rating e' NASCOSTO per disegno — se si vedesse in un pixel
   sarebbe un difetto, non una prova — e un abbinamento piu' giusto si
   sente giocando. Costa meno di due secondi e non accende Chrome. Di
   conseguenza `--gioco` lo ignora: qualunque file gli si punti contro,
   misura sempre rete/. Il suo `--gioco` si chiama `--rete`, e serve ai
   falsi.

   CHE COSA NESSUN ALTRO CANCELLO VEDE. `_q-sospetto` misura la finestra
   a DUE coordinate e la tavola dei verdetti; non sa che cosa sia un
   rating. `rete/prove/tutte.js` prova l'Elo — i punti VISIBILI — ed e'
   un'altra scala. `_q-rete` e `_q-sfida` provano il client contro un
   server finto. Nessuno guarda i tre numeri nascosti, nessuno guarda se
   la terza coordinata abbina meglio, e nessuno ha mai confrontato la
   nostra matematica con l'implementazione di riferimento.

   E QUEL CHE QUESTO BANCO NON PUO' FARE, detto subito perche' un banco
   che tace un limite e' un banco che mente:

     · **l'SQL non si esegue.** Non c'e' un Postgres nel repo. La regola
       sta in JavaScript — dove si esegue e si misura davvero — e l'SQL
       ne e' la traduzione; il gruppo D confronta le due PER TESTO e lo
       dichiara. E' l'unico gruppo che attesta invece di misurare, ed e'
       lo stesso limite che il #137 e il #138 hanno dichiarato.
     · **la popolazione e' simulata.** Il modello sta scritto qui sotto.
       Per difendersi dalla circolarita' la grandezza misurata NON e' lo
       scarto di punti fra gli abbinati — sarebbe come giudicare un metro
       con se' stesso — ma lo scarto di ABILITA' LATENTE, che ne' i punti
       ne' il rating conoscono.

   uso:  node strumenti/_q-glicko.js
         node strumenti/_q-glicko.js --rete fuori/rete-crit-glicko-sorda
         node strumenti/_q-glicko.js --solo A,C
   esce 0 se passa tutto, 1 se una prova fallisce, 2 se il banco esplode.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const urlmod = require('url');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const RETE = path.resolve(RADICE, arg('rete', 'rete'));
const gruppiChiesti = String(arg('solo', 'A,B,C,D,E')).toUpperCase().split(',').map(s => s.trim());
const vuole = g => gruppiChiesti.includes(g);

let ok = 0, no = 0;
const di = (buono, nome, det) => {
  if (buono) { ok++; console.log('  OK  ' + nome + (det !== undefined && det !== '' ? '  [' + det + ']' : '')); }
  else { no++; console.log('  NO  ' + nome + (det !== undefined && det !== '' ? '  [' + det + ']' : '')); }
};
const titolo = t => console.log('\n' + t);
const vicino = (a, b, tol) => Number.isFinite(a) && Math.abs(a - b) <= tol;

/* Generatore riproducibile, lo stesso di _q-sospetto.js e della sonda:
   un banco di popolazioni che non si puo' rigiocare non e' un banco, e'
   un sondaggio. */
function generatore(seme) {
  let s = (seme >>> 0) || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}

/* =====================================================================
   L'ESEMPIO LAVORATO DI GLICKMAN — la tavola contro cui ci si verifica.

   Mark E. Glickman, «Example of the Glicko-2 system»: un giocatore a
   1500 con RD 200 e volatilita' 0,06, tau = 0,5, che gioca tre partite
   in un periodo — vinta contro 1400/RD 30, persa contro 1550/RD 100,
   persa contro 1700/RD 300.

   I numeri sotto sono quelli STAMPATI nel paper, con la precisione con
   cui il paper li stampa. Due di loro — v e Delta — non coincidono con
   il conto a piena precisione, e NON e' un errore nostro: il paper
   ricalcola partendo dai propri g ed E arrotondati. La prova A4 lo
   dimostra invece di raccontarlo, rifacendo quel conto con i numeri
   stampati e ritrovando esattamente 1,7785 e -0,4834. Un'implementazione
   sbagliata non cadrebbe su TUTTI E DUE i valori.
   ===================================================================== */
const ESEMPIO = {
  me: { nascosto: 1500, incertezza: 200, volatilita: 0.06 },
  partite: [
    { nascosto: 1400, incertezza:  30, esito: 1 },
    { nascosto: 1550, incertezza: 100, esito: 0 },
    { nascosto: 1700, incertezza: 300, esito: 0 },
  ],
  /* quel che il paper stampa */
  g:      [0.9955, 0.9531, 0.7242],
  E:      [0.639,  0.432,  0.303],
  v:      1.7785,
  delta: -0.4834,
  sigma:  0.05999,
  phiStar: 1.1529,
  phi:     0.8722,
  mu:     -0.2069,
  r:       1464.06,
  rd:      151.52,
};

/* =====================================================================
   LA POPOLAZIONE SIMULATA, e il modello e' dichiarato perche' e' l'unica
   cosa che si puo' sbagliare qui dentro.

     abilita   0..1, quanto e' bravo chi tiene il telefono. NESSUNO dei
               due sistemi la conosce: e' la grandezza contro cui si
               misura, ed e' la difesa dalla circolarita'
     vera      l'abilita' portata su una scala di rating (800..2200), da
               cui esce l'esito vero della partita
     entra     il giorno in cui e' arrivato. Coda lunga: molti nuovi,
               pochi veterani — una base che CRESCE, non una che nasce
               tutta insieme. Senza questo, tutti finiscono con la stessa
               incertezza e il rating non ha piu' niente da dire che i
               punti non dicano gia'
     quando    quanto spesso gioca

   La storia muove i DUE sistemi sugli STESSI risultati: l'Elo di casa
   (copiato alla lettera da rete/api/sfida.js, meta' al difensore
   compresa) e il Glicko-2 del modulo. Se uno dei due e' rotto, la
   differenza si vede.
   ===================================================================== */
function elo(mio, suo, esito, serie) {
  const atteso = 1 / (1 + Math.pow(10, (suo - mio) / 400));
  const K = mio < 1200 ? 40 : mio < 1600 ? 28 : mio < 2000 ? 20 : 14;
  const bonus = esito === 1 ? Math.min(1.3, 1 + Math.min(serie, 6) * 0.05) : 1;
  return Math.round(K * (esito - atteso) * bonus);
}
/* la finestra di PRIMA, quella che questo cantiere estende: la scala a
   due coordinate del #137, col suo pavimento. Sta qui dentro perche' il
   prima e il dopo si misurano nella STESSA corsa. */
const SCALA137 = [
  { forza:  8, punti:  120, minimo: 6 },
  { forza: 20, punti:  300, minimo: 4 },
  { forza: 40, punti:  700, minimo: 2 },
  { forza: 99, punti: Infinity, minimo: 1 },
];

function popolazione(n, seme) {
  const r = generatore(seme);
  const gente = [];
  for (let i = 0; i < n; i++) {
    const abilita = r();
    gente.push({
      id: 'a' + i, allenatore: 'a' + i, abilita,
      vera: 800 + 1400 * abilita,
      forza: 63, punti: 1000, serie: 0, giocate: 0, sospetto: 0,
      nascosto: 1500, incertezza: 350, volatilita: 0.06, giorno: 0, entra: 0,
    });
  }
  return gente;
}
function esitoVero(a, b, dado) {
  const p = 1 / (1 + Math.pow(10, (b.vera - a.vera) / 400));
  const x = dado(), pari = 0.18;
  if (x < p * (1 - pari)) return 1;
  if (x < p * (1 - pari) + pari) return 0.5;
  return 0;
}
function stat(v) {
  if (!v.length) return { n: 0, media: 0, mediana: 0, p90: 0 };
  const s = [...v].sort((a, b) => a - b);
  const q = p => s[Math.min(s.length - 1, Math.floor(p * s.length))];
  return { n: s.length, media: Math.round(s.reduce((a, b) => a + b, 0) / s.length),
           mediana: Math.round(q(0.5)), p90: Math.round(q(0.9)) };
}
function rango(v) {
  const i = v.map((x, k) => [x, k]).sort((a, b) => a[0] - b[0]);
  const r = new Array(v.length); i.forEach(([, k], p) => r[k] = p); return r;
}
function spearman(a, b) {
  const ra = rango(a), rb = rango(b), n = a.length, m = n / 2 - 0.5;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) { num += (ra[i] - m) * (rb[i] - m); da += (ra[i] - m) ** 2; db += (rb[i] - m) ** 2; }
  return da && db ? num / Math.sqrt(da * db) : 0;
}

/* -------------------------------------------------------------------- */
(async () => {
  const carica = async nome => {
    const f = path.join(RETE, 'lib', nome);
    if (!fs.existsSync(f)) return null;
    try { return await import(urlmod.pathToFileURL(f).href); } catch (e) { return { __rotto: e.message }; }
  };
  const G = await carica('glicko.js');
  const A = await carica('abbinamento.js');

  console.log('=== IL RATING NASCOSTO — server, senza rete e senza browser ===');
  console.log('    cartella misurata: ' + path.relative(RADICE, RETE).replace(/\\/g, '/'));
  if (!G) console.log('    rete/lib/glicko.js: NON C\'E\'');
  else if (G.__rotto) console.log('    rete/lib/glicko.js: ROTTO — ' + G.__rotto);
  if (!A) console.log('    rete/lib/abbinamento.js: NON C\'E\'');
  else if (A.__rotto) console.log('    rete/lib/abbinamento.js: ROTTO — ' + A.__rotto);

  const haG = !!(G && !G.__rotto && typeof G.aggiorna === 'function');
  const haA = !!(A && !A.__rotto && typeof A.equilibrato === 'function');
  const prova = (f, d) => { try { return f(); } catch (e) { return d === undefined ? { __err: e.message } : d; } };
  const manca = 'il modulo non c\'e\'';

  /* la storia: serve a C e a E, e si costruisce una volta sola per taglia */
  const storie = new Map();
  function storia(n, giorni, seme) {
    const chiave = n + ':' + giorni + ':' + seme;
    if (storie.has(chiave)) return storie.get(chiave);
    const gente = popolazione(n, seme);
    const dado = generatore(seme + 7777);
    let sfide = 0;
    for (const x of gente) x.entra = Math.floor(giorni * (1 - Math.pow(dado(), 0.55)));
    for (let gg = 1; gg <= giorni; gg++) {
      const vivi = gente.filter(x => x.entra <= gg);
      for (const io of gente) {
        if (io.entra > gg) continue;
        const quante = dado() < 0.55 ? 1 + Math.floor(dado() * 3) : 0;
        for (let k = 0; k < quante; k++) {
          const avv = cercaSemplice(io, vivi, SCALA137, dado);
          if (!avv) continue;
          sfide++;
          const s = esitoVero(io, avv, dado);
          const d = elo(io.punti, avv.punti, s, io.serie);
          io.punti = Math.max(100, io.punti + d);
          io.serie = s === 1 ? io.serie + 1 : 0;
          avv.punti = Math.max(100, avv.punti + Math.round(-d * 0.5));
          for (const [me, lui, ss] of [[io, avv, s], [avv, io, 1 - s]]) {
            me.incertezza = G.inattivo(me, Math.max(0, gg - me.giorno - 1));
            const q = G.aggiorna(me, [{ nascosto: lui.nascosto, incertezza: lui.incertezza, esito: ss }]);
            me.nascosto = q.nascosto; me.incertezza = q.incertezza; me.volatilita = q.volatilita; me.giorno = gg;
          }
          io.giocate++; avv.giocate++;
          for (const x of [io, avv]) x.forza = Math.min(95, 63 + Math.round(32 * (1 - Math.exp(-x.giocate / 40))));
        }
      }
    }
    for (const x of gente) x.incertezza = G.inattivo(x, Math.max(0, giorni - Math.max(x.giorno, x.entra)));
    const out = { gente, sfide };
    storie.set(chiave, out);
    return out;
  }
  /* la ricerca del #137, rifatta qui: due coordinate, nessuna terza */
  function cercaSemplice(io, gente, scala, dado) {
    for (const gr of scala) {
      const buoni = gente.filter(c => c.id !== io.id &&
        Math.abs(c.forza - io.forza) <= gr.forza &&
        (!Number.isFinite(gr.punti) || Math.abs(c.punti - io.punti) <= gr.punti));
      if (buoni.length < (gr.minimo | 0 || 1)) continue;
      return buoni[Math.floor(dado() * buoni.length)];
    }
    return null;
  }

  /* ===================================================================
     A) L'IMPLEMENTAZIONE DI RIFERIMENTO
     Il cancello piu' importante del cantiere: il mandato lo chiede per
     nome (MANDATO-STADIUM-ROAR.md, milestone M9 — «Glicko-2 and trophies
     verified against a reference implementation»).
     =================================================================== */
  if (vuole('A')) {
    titolo('A) L\'ESEMPIO LAVORATO DI GLICKMAN — numero per numero, contro il paper');

    di(haG && vicino(G.SCALA_G, 173.7178, 0.0001) && G.TAU === 0.5 &&
       G.R0 === 1500 && G.RD0 === 350 && vicino(G.VOL0, 0.06, 1e-9),
       'A1) le costanti sono quelle del sistema: 400/ln(10), tau 0,5, 1500/350/0,06',
       haG ? 'scala ' + G.SCALA_G + ', tau ' + G.TAU + ', ' + G.R0 + '/' + G.RD0 + '/' + G.VOL0 : manca);

    const S = haG ? G.SCALA_G : 173.7178;
    const gj = haG ? ESEMPIO.partite.map(p => prova(() => G.g(p.incertezza / S), NaN)) : [];
    di(gj.length === 3 && gj.every((x, i) => vicino(x, ESEMPIO.g[i], 0.0001)),
       'A2) g(phi) per i tre avversari: 0,9955 · 0,9531 · 0,7242',
       gj.length ? gj.map(x => x.toFixed(4)).join(' · ') : manca);

    const mu0 = 0;
    const Ej = haG ? ESEMPIO.partite.map(p => prova(() => G.E(mu0, (p.nascosto - 1500) / S, p.incertezza / S), NaN)) : [];
    di(Ej.length === 3 && Ej.every((x, i) => vicino(x, ESEMPIO.E[i], 0.0005)),
       'A3) l\'atteso contro i tre: 0,639 · 0,432 · 0,303',
       Ej.length ? Ej.map(x => x.toFixed(3)).join(' · ') : manca);

    const q = haG ? prova(() => G.aggiorna(ESEMPIO.me, ESEMPIO.partite), null) : null;
    const c = q && q.conti;

    /* A4 e A5: LA PROVA CHE LE DUE DIFFERENZE SONO DEL PAPER, NON NOSTRE.
       Il paper stampa v = 1,7785 e Delta = -0,4834; a piena precisione
       vengono 1,77898 e -0,48393. Rifacendo il conto con i g e gli E
       STAMPATI si ritrovano esattamente i numeri del paper — quindi lo
       scarto e' l'arrotondamento del paper. Una implementazione
       sbagliata non cadrebbe su tutti e due. */
    let ivStampati = 0, sumStampati = 0;
    for (let i = 0; i < 3; i++) {
      ivStampati += ESEMPIO.g[i] * ESEMPIO.g[i] * ESEMPIO.E[i] * (1 - ESEMPIO.E[i]);
      sumStampati += ESEMPIO.g[i] * (ESEMPIO.partite[i].esito - ESEMPIO.E[i]);
    }
    const vStampati = 1 / ivStampati, deltaStampati = vStampati * sumStampati;
    di(!!c && vicino(c.v, 1.77898, 0.0002) && vicino(vStampati, ESEMPIO.v, 0.0001),
       'A4) v = 1,7789 a piena precisione, e 1,7785 rifacendo il conto coi numeri STAMPATI dal paper',
       c ? 'nostro ' + c.v.toFixed(5) + ', dai numeri stampati ' + vStampati.toFixed(4) +
           ' (il paper stampa ' + ESEMPIO.v + ')' : manca);

    di(!!c && vicino(c.delta, -0.48393, 0.0002) && vicino(deltaStampati, ESEMPIO.delta, 0.0001),
       'A5) Delta = -0,4839 a piena precisione, e -0,4834 dai numeri stampati: lo scarto e\' del paper',
       c ? 'nostro ' + c.delta.toFixed(5) + ', dai numeri stampati ' + deltaStampati.toFixed(4) : manca);

    di(!!c && vicino(c.volatilita, ESEMPIO.sigma, 1e-5),
       'A6) la volatilita\' nuova: 0,05999',
       c ? c.volatilita.toFixed(6) : manca);

    di(!!c && vicino(c.phiStar, ESEMPIO.phiStar, 0.0001),
       'A7) phi* (la deviation gonfiata dalla volatilita\'): 1,1529',
       c ? c.phiStar.toFixed(4) : manca);

    di(!!c && vicino(c.phi, ESEMPIO.phi, 0.0001) && !!q && vicino(q.incertezza, ESEMPIO.rd, 0.02),
       'A8) phi\' = 0,8722, cioe\' RD\' = 151,52',
       c ? 'phi\' ' + c.phi.toFixed(4) + ' -> RD\' ' + q.incertezza.toFixed(2) : manca);

    di(!!c && vicino(c.mu, ESEMPIO.mu, 0.0001) && !!q && vicino(q.nascosto, ESEMPIO.r, 0.02),
       'A9) mu\' = -0,2069, cioe\' r\' = 1464,06',
       c ? 'mu\' ' + c.mu.toFixed(4) + ' -> r\' ' + q.nascosto.toFixed(2) : manca);

    /* A10: e' una funzione PURA. Un aggiornamento che modifica il suo
       argomento fa sparire il valore di partenza, e il valore di
       partenza e' quello che la guardia del database confronta. */
    const copia = JSON.parse(JSON.stringify(ESEMPIO.me));
    const q2 = haG ? prova(() => G.aggiorna(ESEMPIO.me, ESEMPIO.partite), null) : null;
    di(!!q && !!q2 && q.nascosto === q2.nascosto && q.incertezza === q2.incertezza &&
       JSON.stringify(ESEMPIO.me) === JSON.stringify(copia),
       'A10) aggiorna e\' PURA: due chiamate danno lo stesso numero e l\'argomento non si muove',
       q && q2 ? 'r\' ' + q.nascosto.toFixed(4) + ' = ' + q2.nascosto.toFixed(4) : manca);
  }

  /* ===================================================================
     B) LE PROPRIETA' DEL RATING — quel che l'esempio non esercita
     =================================================================== */
  if (vuole('B')) {
    titolo('B) LE PROPRIETA\' — la certezza, la volatilita\', l\'avversario incerto');

    const nuovo = () => ({ nascosto: 1500, incertezza: 350, volatilita: 0.06 });
    const pari = { nascosto: 1500, incertezza: 50 };

    const dopoUna = haG ? prova(() => G.aggiorna(nuovo(), [{ ...pari, esito: 1 }]), null) : null;
    di(!!dopoUna && dopoUna.incertezza < 340,
       'B1) giocare fa CALARE l\'incertezza: da 350 a meno di 340 dopo una sola partita',
       dopoUna ? '350 -> ' + dopoUna.incertezza.toFixed(1) : manca);

    let assestato = nuovo();
    for (let i = 0; i < 40 && haG; i++) {
      const q = prova(() => G.aggiorna(assestato, [{ ...pari, esito: i % 2 }]), null);
      if (q) assestato = q;
    }
    di(haG && assestato.incertezza < 120,
       'B2) quaranta partite portano l\'incertezza sotto 120: il sistema impara',
       haG ? assestato.incertezza.toFixed(1) : manca);

    const cresciuta = haG ? [1, 10, 60, 365].map(p => prova(() => G.inattivo(assestato, p), NaN)) : [];
    di(cresciuta.length === 4 && cresciuta.every((x, i) => i === 0 ? x > assestato.incertezza : x >= cresciuta[i - 1]),
       'B3) NON giocare la fa CRESCERE, e cresce coi giorni: 1 < 10 < 60 < 365',
       cresciuta.length ? assestato.incertezza.toFixed(1) + ' -> ' + cresciuta.map(x => x.toFixed(1)).join(' -> ') : manca);

    const tetto = haG ? prova(() => G.inattivo(assestato, 1000000), NaN) : NaN;
    di(vicino(tetto, 350, 0.001) || (tetto <= 350 && tetto > 340),
       'B4) e ha un TETTO: chi non gioca da sempre torna a 350, non a mille',
       Number.isFinite(tetto) ? tetto.toFixed(2) : manca);

    let limato = nuovo();
    for (let i = 0; i < 600 && haG; i++) {
      const q = prova(() => G.aggiorna(limato, [{ ...pari, esito: i % 2 }]), null);
      if (q) limato = q;
    }
    di(haG && limato.incertezza >= (G.RD_MIN || 30) - 1e-6 && limato.incertezza <= (G.RD_MIN || 30) + 30,
       'B5) e un PAVIMENTO: seicento partite non portano l\'incertezza a zero (se no il rating si congela)',
       haG ? limato.incertezza.toFixed(2) + ' (pavimento ' + G.RD_MIN + ')' : manca);

    /* B6: LA COSA CHE L'ELO NON SA FARE. Due avversari con lo STESSO
       rating ma incertezza diversa non valgono lo stesso: battere uno
       di cui non si sa niente insegna meno. E' g(phi). */
    const certo = { nascosto: 1700, incertezza: 30 };
    const incerto = { nascosto: 1700, incertezza: 340 };
    const base = { nascosto: 1500, incertezza: 100, volatilita: 0.06 };
    const vsCerto = haG ? prova(() => G.aggiorna(base, [{ ...certo, esito: 1 }]), null) : null;
    const vsIncerto = haG ? prova(() => G.aggiorna(base, [{ ...incerto, esito: 1 }]), null) : null;
    di(!!vsCerto && !!vsIncerto && (vsCerto.nascosto - 1500) > (vsIncerto.nascosto - 1500) + 3,
       'B6) battere un forte CERTO vale piu\' che battere un forte INCERTO (e\' g(phi): l\'Elo non lo sa fare)',
       vsCerto && vsIncerto ? '+' + (vsCerto.nascosto - 1500).toFixed(1) + ' contro +' + (vsIncerto.nascosto - 1500).toFixed(1) : manca);

    const forte = haG ? prova(() => G.aggiorna(base, [{ nascosto: 1900, incertezza: 60, esito: 1 }]), null) : null;
    const debole = haG ? prova(() => G.aggiorna(base, [{ nascosto: 1100, incertezza: 60, esito: 1 }]), null) : null;
    di(!!forte && !!debole && forte.nascosto > debole.nascosto,
       'B7) battere un piu\' forte alza piu\' che battere un piu\' debole',
       forte && debole ? forte.nascosto.toFixed(1) + ' contro ' + debole.nascosto.toFixed(1) : manca);

    /* B8: LA VOLATILITA' SI MUOVE. E' il terzo numero, ed e' quello che
       si dimentica piu' facilmente: un sistema che la lascia ferma a
       0,06 per sempre e' un Glicko-1 con tre colonne. */
    let sorpreso = { nascosto: 1500, incertezza: 60, volatilita: 0.06 };
    for (let i = 0; i < 12 && haG; i++) {
      /* uno che perde sempre contro i deboli e vince sempre coi forti:
         il caso in cui la volatilita' DEVE salire */
      const avv = i % 2 ? { nascosto: 1100, incertezza: 40, esito: 0 } : { nascosto: 1900, incertezza: 40, esito: 1 };
      const q = prova(() => G.aggiorna(sorpreso, [avv]), null);
      if (q) sorpreso = q;
    }
    let regolare = { nascosto: 1500, incertezza: 60, volatilita: 0.06 };
    for (let i = 0; i < 12 && haG; i++) {
      const q = prova(() => G.aggiorna(regolare, [{ nascosto: 1500, incertezza: 40, esito: i % 2 }]), null);
      if (q) regolare = q;
    }
    di(haG && sorpreso.volatilita > 0.06 && sorpreso.volatilita > regolare.volatilita * 1.2,
       'B8) la VOLATILITA\' si muove: sale su chi da\' risultati assurdi, non su chi e\' regolare',
       haG ? 'assurdo ' + sorpreso.volatilita.toFixed(5) + ' · regolare ' + regolare.volatilita.toFixed(5) : manca);

    const fermo = haG ? prova(() => G.aggiorna(nuovo(), []), null) : null;
    di(!!fermo && fermo.nascosto === 1500 && fermo.incertezza === 350,
       'B9) zero partite: il rating non si muove di un millesimo',
       fermo ? fermo.nascosto + '/' + fermo.incertezza : manca);

    /* B10: la convergenza. Un giocatore la cui forza vera e' 1800 deve
       arrivarci, e deve arrivarci prima di quanto ci arrivi l'Elo. */
    let conv = nuovo();
    const dado = generatore(90140);
    for (let i = 0; i < 60 && haG; i++) {
      const av = { nascosto: 1500, incertezza: 80 };
      const p = 1 / (1 + Math.pow(10, (1500 - 1800) / 400));
      const s = dado() < p ? 1 : 0;
      const q = prova(() => G.aggiorna(conv, [{ ...av, esito: s }]), null);
      if (q) conv = q;
    }
    di(haG && conv.nascosto > 1650,
       'B10) chi vale 1800 contro dei 1500 ci arriva vicino in sessanta partite',
       haG ? conv.nascosto.toFixed(0) : manca);

    /* B11: la SIMMETRIA del segno. Chi vince sale, chi perde scende —
       sempre, anche quando i due numeri sono lontanissimi. */
    const su = haG ? prova(() => G.aggiorna({ nascosto: 2400, incertezza: 40, volatilita: 0.06 },
                                            [{ nascosto: 900, incertezza: 40, esito: 1 }]), null) : null;
    const giu = haG ? prova(() => G.aggiorna({ nascosto: 900, incertezza: 40, volatilita: 0.06 },
                                             [{ nascosto: 2400, incertezza: 40, esito: 0 }]), null) : null;
    di(!!su && !!giu && su.nascosto >= 2400 && giu.nascosto <= 900,
       'B11) chi vince non scende MAI e chi perde non sale MAI, nemmeno contro un abisso',
       su && giu ? '2400 -> ' + su.nascosto.toFixed(2) + ' · 900 -> ' + giu.nascosto.toFixed(2) : manca);
  }

  /* ===================================================================
     C) L'ABBINAMENTO — prima e dopo nella STESSA corsa
     =================================================================== */
  if (vuole('C')) {
    titolo('C) L\'ABBINAMENTO — 5000 ricerche, popolazione simulata, la grandezza e\' l\'ABILITA\' VERA');

    di(haA && Array.isArray(A.SCALA) && A.SCALA.length === 4 &&
       A.SCALA.every(g => 'forza' in g && 'punti' in g && 'equilibrio' in g && 'minimo' in g),
       'C1) il gradino e\' una TERNA piu\' il pavimento: forza, punti, equilibrio, minimo',
       haA && Array.isArray(A.SCALA) ? JSON.stringify(A.SCALA) : manca);

    const ultimo = haA && Array.isArray(A.SCALA) ? A.SCALA[A.SCALA.length - 1] : null;
    di(!!ultimo && ultimo.forza >= 99 && !Number.isFinite(ultimo.punti) &&
       !Number.isFinite(ultimo.equilibrio) && (ultimo.minimo | 0) === 1,
       'C2) l\'ULTIMO gradino e\' senza limite in tutte e TRE: nessuna sfida si puo\' perdere per questa aggiunta',
       ultimo ? JSON.stringify(ultimo) : manca);

    di(haA && Array.isArray(A.SCALA) && A.SCALA.map(g => g.minimo | 0).join('/') === '8/6/4/1',
       'C3) il pavimento del mazzo si alza a 8/6/4/1: e\' il prezzo della terza coordinata, non un ritocco',
       haA && Array.isArray(A.SCALA) ? A.SCALA.map(g => g.minimo).join('/') : manca);

    /* C4: LA TERZA COORDINATA GUARDA IL NASCOSTO, NON I PUNTI. E' la
       prova che condanna `_crit-glicko-visibile`, ed e' costruita nel
       caso peggiore: due con gli STESSI punti visibili e rating
       lontanissimi devono essere respinti; due con punti lontanissimi e
       rating uguali devono passare. */
    const gr = { forza: 8, punti: 120, equilibrio: 0.08, minimo: 1 };
    const stessiPunti = [
      { id: 'x', punti: 1000, nascosto: 1200, incertezza: 50, forza: 70 },
      { id: 'y', punti: 1000, nascosto: 1900, incertezza: 50, forza: 70 },
    ];
    const stessoRating = [
      { id: 'x', punti: 400, nascosto: 1500, incertezza: 50, forza: 70 },
      { id: 'y', punti: 1900, nascosto: 1500, incertezza: 50, forza: 70 },
    ];
    const e1 = haA ? prova(() => A.equilibrato(stessiPunti[0], stessiPunti[1], gr), null) : null;
    const e2 = haA ? prova(() => A.equilibrato(stessoRating[0], stessoRating[1], gr), null) : null;
    di(e1 === false && e2 === true,
       'C4) la terza coordinata legge il NASCOSTO: stessi punti e rating lontani = no, punti lontani e rating uguale = si\'',
       haA ? 'stessi punti ' + e1 + ', stesso rating ' + e2 : manca);

    /* C5: e l'INCERTEZZA allarga. Due lontani di rating ma di cui non si
       sa niente devono potersi incontrare: e' l'unico modo perche' un
       giocatore nuovo trovi qualcuno. */
    const nebbia = [
      { id: 'x', punti: 1000, nascosto: 1200, incertezza: 350, forza: 70 },
      { id: 'y', punti: 1000, nascosto: 1900, incertezza: 350, forza: 70 },
    ];
    di(haA && prova(() => A.equilibrato(nebbia[0], nebbia[1], gr), null) === true,
       'C5) l\'INCERTEZZA allarga: due lontani di cui non si sa niente si incontrano (se no il nuovo non gioca mai)',
       haA ? String(prova(() => A.equilibrato(nebbia[0], nebbia[1], gr), null)) : manca);

    /* --- la misura vera, tre popolazioni, prima e dopo nella stessa corsa --- */
    const RICERCHE = 5000;
    function misura(gente, conTerza) {
      const dado = generatore(999001);
      const scarti = [], gradini = [];
      let vuote = 0;
      for (let i = 0; i < RICERCHE; i++) {
        const io = gente[Math.floor(dado() * gente.length)];
        let scelto = null, quale = 0;
        const scala = conTerza ? A.SCALA : SCALA137;
        for (let k = 0; k < scala.length; k++) {
          const g2 = scala[k];
          const buoni = gente.filter(c => c.id !== io.id &&
            Math.abs(c.forza - io.forza) <= g2.forza &&
            (!Number.isFinite(g2.punti) || Math.abs(c.punti - io.punti) <= g2.punti) &&
            (!conTerza || A.equilibrato(io, c, g2)));
          if (buoni.length < (g2.minimo | 0 || 1)) continue;
          scelto = buoni[Math.floor(dado() * buoni.length)]; quale = k + 1; break;
        }
        if (!scelto) { vuote++; continue; }
        scarti.push(Math.abs(io.vera - scelto.vera));
        gradini.push(quale);
      }
      const s = stat(scarti);
      return { s, vuote,
               equi: Math.round(100 * scarti.filter(x => x <= 100).length / Math.max(1, scarti.length)),
               gradino: (gradini.reduce((a, b) => a + b, 0) / Math.max(1, gradini.length)).toFixed(2) };
    }
    function peggioServito(gente, conTerza) {
      let peg = 1e9;
      const dado = generatore(4242);
      const scala = conTerza ? A.SCALA : SCALA137;
      for (const io of gente) {
        const visti = new Set();
        for (let i = 0; i < 200; i++) {
          for (let k = 0; k < scala.length; k++) {
            const g2 = scala[k];
            const buoni = gente.filter(c => c.id !== io.id &&
              Math.abs(c.forza - io.forza) <= g2.forza &&
              (!Number.isFinite(g2.punti) || Math.abs(c.punti - io.punti) <= g2.punti) &&
              (!conTerza || A.equilibrato(io, c, g2)));
            if (buoni.length < (g2.minimo | 0 || 1)) continue;
            visti.add(buoni[Math.floor(dado() * buoni.length)].id); break;
          }
        }
        if (visti.size < peg) peg = visti.size;
      }
      return peg;
    }

    const basi = [
      { n: 400, soglia: 0.62, nome: 'quattrocento' },
      { n:  60, soglia: 0.78, nome: 'sessanta' },
      { n:  12, soglia: 1.00, nome: 'dodici (la base vera)' },
    ];
    const riassunto = [];
    for (const b of basi) {
      if (!haG || !haA) { di(false, 'C6' + b.n + ') la misura su ' + b.nome, manca); continue; }
      const { gente } = prova(() => storia(b.n, 60, 20260923), null) || {};
      if (!gente) { di(false, 'C6' + b.n + ') la misura su ' + b.nome, 'la storia non si costruisce'); continue; }
      const p = prova(() => misura(gente, false), null);
      const d = prova(() => misura(gente, true), null);
      const pp = prova(() => peggioServito(gente, false), -1);
      const pd = prova(() => peggioServito(gente, true), -1);
      if (!p || !d) { di(false, 'C6' + b.n + ') la misura su ' + b.nome, 'la ricerca lancia'); continue; }
      riassunto.push({ b, p, d, pp, pd });
      const det = 'scarto vero mediano ' + p.s.mediana + ' -> ' + d.s.mediana +
                  ', p90 ' + p.s.p90 + ' -> ' + d.s.p90 +
                  ', entro 100 ' + p.equi + '% -> ' + d.equi + '%' +
                  ', gradino ' + p.gradino + ' -> ' + d.gradino;
      di(d.s.mediana <= p.s.mediana * b.soglia + 0.5 && d.s.p90 <= p.s.p90 && d.equi >= p.equi,
         'C6' + b.n + ') su ' + b.nome + ': il rating nascosto abbina piu\' vicino di abilita\' VERA', det);
      di(d.vuote === p.vuote && d.vuote === 0,
         'C7' + b.n + ') su ' + b.nome + ': ZERO ricerche in piu\' senza avversario (l\'ultimo gradino e\' senza limite)',
         'prima ' + p.vuote + ', dopo ' + d.vuote);
      /* IL PEGGIO SERVITO, ed e' la prova che il #137 ha pagato: una
         finestra piu' stretta da' abbinamenti piu' giusti E MENO GENTE
         DENTRO. La soglia non e' «uguale a prima»: su dodici persone e'
         aritmeticamente impossibile. E' «non sotto quattro, e non meno
         di due sotto quello di oggi». */
      di(pd >= 4 && pd >= pp - 2,
         'C8' + b.n + ') su ' + b.nome + ': il PEGGIO SERVITO regge (mai sotto quattro avversari possibili)',
         'avversari distinti in 200 ricerche, il peggio della popolazione: ' + pp + ' -> ' + pd);
    }

    if (riassunto.length === 3) {
      const g400 = riassunto[0];
      di(g400.d.equi >= g400.p.equi * 1.5,
         'C9) su quattrocento gli abbinamenti EQUILIBRATI (entro 100 di abilita\' vera) crescono di meta\'',
         g400.p.equi + '% -> ' + g400.d.equi + '%');
      /* E il rating nascosto DEVE stimare meglio dei punti, se no la
         terza coordinata sarebbe rumore vestito da misura. */
      const gg = g400.b ? storia(400, 60, 20260923).gente : [];
      const ab = gg.map(x => x.abilita);
      const rp = spearman(ab, gg.map(x => x.punti)), rn = spearman(ab, gg.map(x => x.nascosto));
      di(rn > rp,
         'C10) il rating nascosto stima l\'abilita\' vera MEGLIO dei punti visibili (se no non varrebbe la pena)',
         'punti rho ' + rp.toFixed(3) + ' · nascosto rho ' + rn.toFixed(3));
    } else {
      di(false, 'C9) gli abbinamenti equilibrati crescono di meta\'', manca);
      di(false, 'C10) il rating nascosto stima meglio dei punti', manca);
    }
  }

  /* ===================================================================
     D) LE PORTE DEL SERVER — e questo gruppo ATTESTA, non misura
     =================================================================== */
  if (vuole('D')) {
    titolo('D) IL SERVER — lettura di testo, dichiarata: qui non c\'e\' un Postgres da interrogare');

    const leggi = p => { try { return fs.readFileSync(path.join(RETE, p), 'utf8'); } catch (e) { return ''; } };
    const schema = leggi('schema.sql');
    const piatto = schema.replace(/\s+/g, ' ');
    const apiDir = path.join(RETE, 'api');
    const api = fs.existsSync(apiDir) ? fs.readdirSync(apiDir).filter(f => f.endsWith('.js')) : [];
    const testoApi = api.map(f => ({ f, t: leggi('api/' + f) }));
    const corpoDi = nome => {
      const i = schema.search(new RegExp('create or replace function\\s+' + nome, 'i'));
      if (i < 0) return '';
      const j = schema.indexOf('$$;', i);
      return schema.slice(i, j < 0 ? schema.length : j + 3);
    };

    /* D1: le cinque colonne, sulla tabella che c'e' gia' */
    const colonne = ['nascosto', 'incertezza', 'volatilita', 'periodo', 'giri'];
    const mancanti = colonne.filter(c =>
      !new RegExp('alter table punti\\s+add column if not exists\\s+' + c + '\\b', 'i').test(piatto));
    di(mancanti.length === 0,
       'D1) le cinque colonne stanno su `punti`, con `add column if not exists`: lo schema resta idempotente',
       mancanti.length ? 'MANCANO: ' + mancanti.join(', ') : colonne.join(', '));

    /* D2: NESSUNA TABELLA NUOVA. E' il vincolo piu' importante del
       server: RLS e' acceso con zero policy, quindi una tabella nuova
       sarebbe l'unica porta aperta — e lo sarebbe in silenzio. */
    const tabelle = [...schema.matchAll(/create table if not exists\s+(\w+)/gi)].map(m => m[1]);
    const senzaRls = tabelle.filter(t =>
      !new RegExp('alter table\\s+' + t + '\\s+enable row level security', 'i').test(schema));
    const revokeTab = (schema.match(/revoke all on ([\w,\s]+?) from anon, authenticated/i) || [, ''])[1];
    const fuoriRevoke = tabelle.filter(t => !new RegExp('\\b' + t + '\\b').test(revokeTab));
    di(tabelle.length === 6 && senzaRls.length === 0 && fuoriRevoke.length === 0,
       'D2) le tabelle sono ancora SEI, tutte con RLS e tutte nel revoke: questo cantiere non ne apre nessuna',
       tabelle.join(', ') + (senzaRls.length ? ' — SENZA RLS: ' + senzaRls.join(', ') : '') +
       (fuoriRevoke.length ? ' — FUORI DAL REVOKE: ' + fuoriRevoke.join(', ') : ''));

    /* D3: ogni funzione revocata con la firma esatta */
    const funzioni = [...schema.matchAll(/create or replace function\s+(\w+)\s*\(([^)]*)\)/gi)]
      .map(m => ({ nome: m[1], args: m[2] }));
    const tipoDi = a => {
      const p = a.trim().split(/\s+/);
      return p.length < 2 ? '' : p[1].replace(/,$/, '').toLowerCase();
    };
    const firmaDi = f => f.args.split(',').map(a => a.split(/\s+default\s+/i)[0]).map(tipoDi).filter(Boolean).join(', ');
    const nonRevocate = funzioni.filter(f =>
      !new RegExp('revoke all on function\\s+' + f.nome + '\\s*\\(\\s*' +
        firmaDi(f).replace(/, /g, '\\s*,\\s*') + '\\s*\\)', 'i').test(schema));
    di(funzioni.length >= 6 && nonRevocate.length === 0,
       'D3) OGNI funzione e\' revocata ad anon e authenticated, con la firma esatta — anche le due nuove',
       funzioni.map(f => f.nome + '(' + firmaDi(f) + ')').join(' · ') +
       (nonRevocate.length ? ' — NON REVOCATE: ' + nonRevocate.map(f => f.nome).join(', ') : ''));

    /* D4: LA TRAPPOLA DI POSTGRES, pagata una terza volta. `create or
       replace function` con una firma diversa AFFIANCA invece di
       sostituire, e la nuova nascerebbe senza il revoke della vecchia. */
    const dropCinque = /drop function if exists\s+trova_avversario\s*\(\s*uuid\s*,\s*int\s*,\s*int\s*,\s*int\s*,\s*int\s*\)/i.test(piatto);
    const iDrop = schema.search(/drop function if exists\s+trova_avversario\s*\(\s*uuid\s*,\s*int\s*,\s*int\s*,\s*int\s*,\s*int\s*\)/i);
    const iCreate = schema.search(/create or replace function\s+trova_avversario/i);
    di(dropCinque && iDrop >= 0 && iCreate > iDrop,
       'D4) la firma a CINQUE argomenti di trova_avversario viene droppata prima della nuova (se no ne convivono due)',
       dropCinque ? 'drop a ' + iDrop + ', create a ' + iCreate : 'il drop della firma a cinque non c\'e\'');

    /* D5: il predicato della terza coordinata sta nell'SQL, e dice la
       stessa cosa del JavaScript. Le due lingue si confrontano per
       testo: e' quel che questo gruppo dichiara di fare. */
    const tro = corpoDi('trova_avversario').replace(/\s+/g, ' ');
    const haArgomento = /equilibrio\s+real\s+default\s+null/i.test(tro);
    const haNullPassa = /equilibrio is null or /i.test(tro);
    const haAtteso = /abs\s*\(\s*1\s*\/\s*\(\s*1\s*\+\s*exp\s*\(/i.test(tro) && /0\.5\s*\)\s*<=\s*equilibrio/i.test(tro);
    di(haArgomento && haNullPassa && haAtteso,
       'D5) l\'SQL porta la TERZA coordinata, e `null` vuol dire «nessun limite» come per i punti',
       'argomento ' + haArgomento + ', null passa ' + haNullPassa + ', formula dell\'atteso ' + haAtteso);

    /* D6: posa_nascosto e la sua guardia. Glicko-2 non si puo' scrivere
       come un incremento relativo: la formula ha bisogno del valore di
       partenza, quindi la corsa si chiude con una guardia nel database
       invece che con un `if` in JavaScript. */
    const pn = corpoDi('posa_nascosto').replace(/\s+/g, ' ');
    di(!!pn && /where allenatore = chi and giri = da_giri/i.test(pn) && /giri\s*=\s*da_giri\s*\+\s*1/i.test(pn),
       'D6) posa_nascosto scrive SOLO se nessun altro e\' passato nel frattempo, e alza il contatore',
       pn ? 'guardia e contatore presenti' : 'la funzione non c\'e\'');

    /* D7: IL RATING NASCOSTO NON ESCE. Stessa ragione del sospetto
       (#137): la tupla di trova_avversario finisce dritta nel corpo
       della risposta di /api/avversario, cioe' sul telefono di un altro.
       Un rating che viaggia non e' nascosto. */
    const tuplaSpia = /returns table \([^)]*(nascosto|incertezza|volatilita)/i.test(tro);
    const classSpia = /(nascosto|incertezza|volatilita)/i.test(corpoDi('classifica'));
    /* l'endpoint PUO' leggere i PROPRI numeri (servono alla ricerca), ma
       non puo' RIMANDARLI INDIETRO a nessuno */
    const apiSpia = testoApi.filter(x =>
      /nascosto\s*:/.test(x.t.replace(/\/\*[\s\S]*?\*\//g, '')) ||
      /incertezza\s*:/.test(x.t.replace(/\/\*[\s\S]*?\*\//g, '')));
    di(!tuplaSpia && !classSpia && apiSpia.length === 0,
       'D7) il RATING NASCOSTO non esce: non nella tupla dell\'avversario, non nella classifica, non in una risposta',
       tuplaSpia ? 'e\' nella tupla di trova_avversario' :
       classSpia ? 'e\' nella classifica' :
       apiSpia.length ? 'e\' in ' + apiSpia.map(x => x.f).join(', ') : 'nessuna delle tre');

    /* D8: i freni e il numero degli endpoint */
    const freni = new Map();
    for (const x of testoApi) {
      const m = [...x.t.matchAll(/frenato\(\s*'([\w:]+)'/g)].map(y => y[1]);
      if (m.length) freni.set(x.f, m);
    }
    const senzaFreno = testoApi.filter(x => !freni.has(x.f) && x.f !== 'entra.js');
    di(api.length === 5 && senzaFreno.length === 0,
       'D8) gli endpoint sono ancora CINQUE e ognuno ha il suo freno: questo cantiere non ne apre nessuno',
       api.join(', ') + (senzaFreno.length ? ' — SENZA FRENO: ' + senzaFreno.map(x => x.f).join(', ') : ''));

    /* D9: L'ELO NON SI TOCCA. E' la decisione (a) scritta in una prova:
       il rating AFFIANCA i punti, non li sostituisce. Se un giorno
       qualcuno cancellasse elo() per «semplificare», la classifica di
       tutti cambierebbe forma in una notte. */
    const sfida = leggi('api/sfida.js');
    const eloIntatto = /const atteso = 1 \/ \(1 \+ Math\.pow\(10, \(suo - mio\) \/ 400\)\);/.test(sfida) &&
                       /const K = mio < 1200 \? 40 : mio < 1600 \? 28 : mio < 2000 \? 20 : 14;/.test(sfida) &&
                       /muovi_punti/.test(sfida);
    di(eloIntatto,
       'D9) elo() e muovi_punti sono ANCORA QUELLI: il rating nascosto affianca i punti visibili, non li sostituisce',
       eloIntatto ? 'la formula dei punti non e\' cambiata' : 'l\'Elo e\' stato toccato');

    /* D10: e il periodo non si confonde con una stagione. La colonna
       `stagione` sta nella stessa tabella: e' il posto giusto dove
       scriverlo, ed e' il posto dove qualcuno potrebbe sbagliare. */
    /* «stagione» puo' comparire nel modulo SOLO in un commento che dice
       che le due cose non c'entrano: quel che non deve esserci e' un
       azzeramento, cioe' una riga che riporta il rating al valore di
       partenza quando cambia il periodo. */
    const glk = leggi('lib/glicko.js');
    const senzaCommenti = glk.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
    const azzera = /\b(stagione|azzer\w*)\b/i.test(senzaCommenti);
    const haPeriodo = /add column if not exists periodo/i.test(piatto);
    const stagioneIntatta = /stagione\s+int not null default 1/i.test(piatto);
    di(!!glk && !azzera && haPeriodo && stagioneIntatta,
       'D10) il periodo di rating NON e\' una stagione: nessun azzeramento nel modulo, e `stagione` resta quel che era',
       !glk ? 'glicko.js non c\'e\'' :
       azzera ? 'glicko.js azzera qualcosa quando cambia il periodo' :
       !haPeriodo ? 'la colonna `periodo` non c\'e\'' :
       !stagioneIntatta ? 'la colonna `stagione` e\' cambiata' : 'periodo e stagione restano due cose');
  }

  /* ===================================================================
     E) IL PERIODO E LA CONCORRENZA
     =================================================================== */
  if (vuole('E')) {
    titolo('E) IL PERIODO, IL FANTASMA E LE DUE SFIDE INSIEME');

    /* E1: IL GIORNO NUOVO NON AZZERA NIENTE. E' il falso `stagione`, ed
       e' l'errore piu' facile da fare leggendo il mandato — che al §163
       parla davvero di `season reset every 4 weeks`. */
    const ieri = { nascosto: 1820, incertezza: 70, volatilita: 0.06 };
    const oggi = haG ? prova(() => G.inattivo(ieri, 1), NaN) : NaN;
    di(Number.isFinite(oggi) && oggi > 70 && oggi < 350,
       'E1) passare al giorno dopo NON azzera: il rating resta, e a crescere e\' solo l\'incertezza',
       Number.isFinite(oggi) ? 'incertezza 70 -> ' + oggi.toFixed(2) + ' (il rating non entra nel conto)' : manca);

    di(haG && prova(() => G.inattivo(ieri, 0), NaN) === 70,
       'E2) zero periodi passati: non cambia niente di niente',
       haG ? String(prova(() => G.inattivo(ieri, 0), NaN)) : manca);

    const giorniOk = haG && typeof G.giorni === 'function' &&
      prova(() => G.giorni('2026-09-20', '2026-09-23'), -1) === 3 &&
      prova(() => G.giorni('2026-09-23', '2026-09-23'), -1) === 0 &&
      prova(() => G.giorni('2026-09-24', '2026-09-23'), -1) === 0;
    di(giorniOk,
       'E3) i giorni si contano per DATA, e indietro nel tempo non si va (un orologio storto non gonfia l\'incertezza)',
       haG && typeof G.giorni === 'function' ? '20->23 = ' + G.giorni('2026-09-20', '2026-09-23') : manca);

    /* E4: IL FANTASMA. Contro un avversario costruito i punti visibili si
       muovono a meta' — «una classifica che non si muove e' una
       classifica morta» — ma il rating NASCOSTO no: `forza_avv * 20` e'
       una convenzione nostra, non una misura, e darla in pasto al rating
       vorrebbe dire insegnargli una favola. */
    const io = { nascosto: 1500, incertezza: 200, volatilita: 0.06, periodo: '2026-09-20' };
    const controNessuno = haG && typeof G.dopoLaSfida === 'function'
      ? prova(() => G.dopoLaSfida(io, null, 1, '2026-09-23'), 'lancia') : 'manca';
    const controQualcuno = haG && typeof G.dopoLaSfida === 'function'
      ? prova(() => G.dopoLaSfida(io, { nascosto: 1600, incertezza: 80 }, 1, '2026-09-23'), null) : null;
    di(controNessuno === null && !!controQualcuno && controQualcuno.nascosto > 1500,
       'E4) contro un avversario COSTRUITO il rating nascosto non si muove; contro una persona si\'',
       controNessuno === null && controQualcuno ? 'fantasma: niente · persona: 1500 -> ' + controQualcuno.nascosto.toFixed(1)
         : 'fantasma: ' + JSON.stringify(controNessuno));

    /* E5: DUE SFIDE INSIEME CONTRO LO STESSO DIFENSORE. E' la ragione per
       cui muovi_punti esiste, riportata su un numero che non si puo'
       incrementare. Il banco in memoria ha la FORMA del database: una
       riga con `giri`, e una scrittura che fallisce se `giri` e' cambiato. */
    const banco = { d: { allenatore: 'dif', nascosto: 1500, incertezza: 120, volatilita: 0.06, giri: 0, periodo: '2026-09-23' } };
    const leggiRiga = () => ({ ...banco.d });
    const posa = (nuovo, daGiri) => {
      if (banco.d.giri !== daGiri) return false;
      banco.d.nascosto = nuovo.nascosto; banco.d.incertezza = nuovo.incertezza;
      banco.d.volatilita = nuovo.volatilita; banco.d.periodo = nuovo.periodo;
      banco.d.giri = daGiri + 1;
      return true;
    };
    /* le due richieste leggono INSIEME (e' il caso peggiore), poi
       scrivono una dopo l'altra: la seconda deve accorgersene e rifare */
    function unaSfida(avv, esito, lettaPrima) {
      for (let tent = 0; tent < 3; tent++) {
        const r = tent === 0 && lettaPrima ? lettaPrima : leggiRiga();
        const q = G.dopoLaSfida(r, avv, esito, '2026-09-23');
        if (!q) return 'niente';
        if (posa(q, r.giri)) return 'scritta';
      }
      return 'persa';
    }
    let e5 = 'il modulo non c\'e\'';
    if (haG && typeof G.dopoLaSfida === 'function') {
      const lettaA = leggiRiga(), lettaB = leggiRiga();
      const a = prova(() => unaSfida({ nascosto: 1700, incertezza: 60 }, 0, lettaA), 'lancia');
      const b = prova(() => unaSfida({ nascosto: 1300, incertezza: 60 }, 1, lettaB), 'lancia');
      e5 = a + ' / ' + b + ', giri ' + banco.d.giri + ', rating ' + banco.d.nascosto.toFixed(1);
      di(a === 'scritta' && b === 'scritta' && banco.d.giri === 2,
         'E5) due sfide nello stesso istante contro lo stesso difensore: NESSUNA si perde in silenzio', e5);
    } else di(false, 'E5) due sfide nello stesso istante: nessuna si perde in silenzio', e5);

    /* E6: e se la corsa non si vince mai, la sfida NON si rompe. Il
       rating nascosto perso e' un'informazione in meno; i punti
       visibili si sono gia' mossi e il replay e' gia' registrato. */
    const muro = { allenatore: 'x', nascosto: 1500, incertezza: 120, volatilita: 0.06, giri: 0, periodo: '2026-09-23' };
    let tentativi = 0;
    const posaChePerdeSempre = () => { tentativi++; return false; };
    let esploso = false;
    if (haG && typeof G.dopoLaSfida === 'function') {
      try {
        for (let t = 0; t < 3; t++) {
          const q = G.dopoLaSfida({ ...muro }, { nascosto: 1600, incertezza: 80 }, 1, '2026-09-23');
          if (q && posaChePerdeSempre()) break;
        }
      } catch (e) { esploso = true; }
    }
    di(haG && typeof G.dopoLaSfida === 'function' && !esploso && tentativi === 3,
       'E6) se la guardia perde tre volte ci si arrende SENZA rompere la sfida (i punti si sono gia\' mossi)',
       'tentativi ' + tentativi + ', esploso ' + esploso);

    /* E7: LA DIVERGENZA DEL PERIODO, MISURATA invece che promessa.
       Il mandato chiede un periodo di UN GIORNO; noi aggiorniamo a ogni
       sfida. Le formule sono le stesse (Glicko-2 e' definito per m
       partite, e uno e' un m valido), ma l'ordine cambia il risultato.
       Di quanto, si misura: la STESSA storia, due volte. */
    let e7 = manca;
    if (haG) {
      const dado = generatore(140140);
      const N = 40, GIORNI = 20;
      const nuovo = id => ({ id, aP: { nascosto: 1500, incertezza: 350, volatilita: 0.06, giorno: 0 },
                                  aG: { nascosto: 1500, incertezza: 350, volatilita: 0.06, giorno: 0 },
                                  vera: 900 + 1200 * ((id * 37) % 100) / 100 });
      const gente = []; for (let i = 0; i < N; i++) gente.push(nuovo(i));
      for (let gg = 1; gg <= GIORNI; gg++) {
        const dellaGiornata = new Map(gente.map(x => [x.id, []]));
        for (let k = 0; k < N * 2; k++) {
          const a = gente[Math.floor(dado() * N)], b = gente[Math.floor(dado() * N)];
          if (a === b) continue;
          const p = 1 / (1 + Math.pow(10, (b.vera - a.vera) / 400));
          const s = dado() < p ? 1 : 0;
          /* --- a partita: si aggiorna subito, come fa l'endpoint --- */
          for (const [me, lui, ss] of [[a, b, s], [b, a, 1 - s]]) {
            me.aP.incertezza = G.inattivo(me.aP, Math.max(0, gg - me.aP.giorno - 1));
            const q = G.aggiorna(me.aP, [{ nascosto: lui.aP.nascosto, incertezza: lui.aP.incertezza, esito: ss }]);
            me.aP.nascosto = q.nascosto; me.aP.incertezza = q.incertezza; me.aP.volatilita = q.volatilita; me.aP.giorno = gg;
          }
          /* --- a giornate: si mette da parte e si chiude a fine giorno --- */
          dellaGiornata.get(a.id).push({ nascosto: b.aG.nascosto, incertezza: b.aG.incertezza, esito: s });
          dellaGiornata.get(b.id).push({ nascosto: a.aG.nascosto, incertezza: a.aG.incertezza, esito: 1 - s });
        }
        for (const x of gente) {
          const sue = dellaGiornata.get(x.id);
          if (!sue.length) continue;
          x.aG.incertezza = G.inattivo(x.aG, Math.max(0, gg - x.aG.giorno - 1));
          const q = G.aggiorna(x.aG, sue);
          x.aG.nascosto = q.nascosto; x.aG.incertezza = q.incertezza; x.aG.volatilita = q.volatilita; x.aG.giorno = gg;
        }
      }
      const scarti = gente.map(x => Math.abs(x.aP.nascosto - x.aG.nascosto));
      const s = stat(scarti);
      e7 = 'scarto fra i due modi: mediano ' + s.mediana + ', p90 ' + s.p90 + ', massimo ' + Math.round(Math.max(...scarti));
      di(s.mediana <= 40 && Math.max(...scarti) <= 200,
         'E7) aggiornare a PARTITA invece che a GIORNATE costa poco, e il poco e\' MISURATO (non promesso)', e7);
    } else di(false, 'E7) aggiornare a partita invece che a giornate costa poco, misurato', e7);
  }

  /* ------------------------------------------------------------- fine */
  console.log('\n' + (ok + no) + ' controlli, ' + ok + ' passati, ' + no + ' falliti');
  process.exit(no ? 1 : 0);
})().catch(e => { console.error('FALLITO (banco): ' + (e && e.stack ? e.stack : e)); process.exit(2); });
