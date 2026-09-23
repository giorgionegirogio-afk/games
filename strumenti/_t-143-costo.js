/* =====================================================================
   _t-143-costo.js — QUANTO COSTA LA MATEMATICA IN CASA
   (voce #143, compito 4)

   PERCHE' ESISTE, E NON DUPLICA `prestazione.js`. Il cancello di casa
   per la prestazione e' `strumenti/prestazione.js --contro`, ed e'
   quello che decide. Ma il 23 settembre 2026 quel banco, su questa
   macchina, ha DICHIARATO DA SE' DI NON POTER MISURARE: la sua prova
   (a) — lo stesso identico file contro se' stesso — ha dato **-28,6%**
   sul fotogramma medio, cioe' quasi trenta punti di niente, con un
   ballo fra repliche del 1164%. La sua stessa quinta avvertenza dice
   cosa fare in quel caso: non si allarga la soglia finche' passa, e
   NON SI TRASCRIVE IL NUMERO DA NESSUNA PARTE.

   E pero' la domanda resta, ed e' la piu' seria di questo cantiere:
   370 chiamate del gioco passano da funzioni scritte in JavaScript
   invece che dal codice macchina del motore. Se il gioco scatta, la
   cura costa piu' di quel che vale.

   LA VIA D'USCITA E' CAMBIARE STATISTICA, NON SOGLIA. Il rumore di un
   banco occupato e' SEMPRE ADDITIVO: un altro processo puo' solo
   RUBARE tempo, mai regalarlo. Quindi la MEDIA di tante misure e'
   inquinata, ma il MINIMO no: il minimo di K ripetizioni converge dal
   basso al costo vero, e si sporca solo se TUTTE le K ripetizioni sono
   state disturbate. E' l'opposto della mediana del fotogramma, che il
   carico sposta di un gradino intero di vsync.

   Percio' qui non si guarda nessun fotogramma: si misura il LAVORO.

     P) IL PASSO DI SIMULAZIONE — una PARTITA INTERA cronometrata dal
        fischio d'inizio al fischio finale, la stessa partita ripetuta
        piu' volte, e di quelle ripetizioni si tiene la PIU' VELOCE. La
        ripetizione fa esattamente lo stesso lavoro, quindi il minimo e'
        il costo. E CON LA SUA RISOLUZIONE ACCANTO: una TERZA scheda
        sullo stesso file di A dice quanto questo strumento sbaglia fra
        due cose uguali. Sotto quel numero non si crede a niente — e' la
        prova (a) di `prestazione.js`, portata qui.
     D) IL FOTOGRAMMA DISEGNATO — `t.disegna()` allo stesso modo. Qui
        dentro c'e' anche la tela, che il freno del banco sporca di
        piu': si stampa, e si dice che e' il numero meno solido dei due.
     F) LA FUNZIONE NUDA — quanto costa UNA chiamata, nativa contro
        casa, sugli argomenti veri. E' LA MISURA PIU' SOLIDA DELLE TRE,
        e la ragione e' che il lavoro dentro il cronometro e' COSTANTE:
        duecentomila chiamate identiche, nessuna partita che cambia
        fase sotto la misura. Il minimo di una cosa costante e' il costo
        vero; il minimo di una cosa che cambia e' solo la sua fase piu'
        leggera. Da qui esce anche la PREVISIONE del costo del passo,
        moltiplicando per le chiamate contate da `_q-perimetro.js`.

   QUAL E' IL NUMERO DA CREDERE, quando P e F non dicono lo stesso: F,
   e la previsione che ne discende. P misura un lavoro che cambia da
   solo (un passo dopo un gol non costa come un passo a meta' campo),
   quindi il suo minimo non e' il costo del passo: e' il costo del passo
   piu' leggero. Si stampa lo stesso, con la sua risoluzione accanto,
   perche' un ordine di grandezza sbagliato lo vedrebbe anche lui.

   NON E' UN CANCELLO DELLA BATTERIA, ed e' una scelta: il cancello di
   prestazione e' uno solo e si chiama `prestazione`. Questo e' un
   attrezzo di compito, come `_t-143-motorev.js`, e il suo risultato
   sta nel verbale.

   uso:  node strumenti/_t-143-costo.js
         node strumenti/_t-143-costo.js --prima fuori/143-prima.html
         node strumenti/_t-143-costo.js --lotti 40 --passi 60
   esce 0 sempre che abbia misurato: e' uno strumento di misura, non un
   giudice. 2 se il banco e' esploso, 3 se non c'e' stato niente da
   misurare.
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const playwright = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const PRIMA = arg('prima', 'fuori/143-prima.html');
const DOPO = arg('dopo', process.env.GIOCO_PROVA || 'CALCETTO-il-gioco.html');
/* `lotti` sono i SEMI (una partita intera per seme), `ripet` quante volte
   si ripete la STESSA partita per prendere il minimo, `passi` il tetto di
   una partita (5400 = novanta secondi a sessanta al secondo: il fischio
   finale arriva prima) e `foto` il tetto della prova col disegno, piu'
   corto perche' la tela costa cento volte il passo. */
const LOTTI = Math.max(2, parseInt(arg('lotti', '4'), 10) || 4);
const RIPET = Math.max(2, parseInt(arg('ripet', '4'), 10) || 4);
const PASSI = Math.max(60, parseInt(arg('passi', '5400'), 10) || 5400);
const FOTO = Math.max(60, parseInt(arg('foto', '900'), 10) || 900);
const SEME = parseInt(arg('seme', '20260923'), 10) >>> 0;

function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

const OPZ = { viewport: { width: 915, height: 412 }, hasTouch: true, locale: 'it-IT' };
async function apri(browser, porta, file) {
  const ctx = await browser.newContext(Object.assign({}, OPZ));
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push(e.message));
  await pag.goto(`http://127.0.0.1:${porta}/${file}`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 40000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(200);
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
  return { ctx, pag, errori };
}

/* =====================================================================
   DUE STESURE BUTTATE, E VANNO RACCONTATE PERCHE' SONO LO STESSO
   ERRORE DUE VOLTE (23 settembre 2026, compito 4).

   PRIMA STESURA: lotti da sessanta passi tirati avanti sulla stessa
   partita per settemila passi — due minuti di gioco su una partita che
   ne dura uno e mezzo. Dopo il fischio finale `t.simulate` torna subito
   e un lotto costa quasi zero; il banco teneva il MINIMO, cioe' proprio
   i lotti vuoti. Referto: 0,0133 ms a passo contro una mediana di
   0,1367 — dieci volte meno, che e' l'impronta di un numero che misura
   il niente.

   SECONDA STESURA: lotti grossi e la partita riavviata quando finisce,
   piu' una terza scheda sullo stesso file per dichiarare la
   risoluzione. Il minimo restava dieci volte sotto la mediana, e LA
   TERZA SCHEDA HA DETTO PERCHE': fra un file e se' stesso la differenza
   era 0,0000 ms — ZERO ESATTO — mentre fra i due file era il 160%. Due
   schede sullo stesso gioco col solito seme giocano LA STESSA PARTITA,
   quindi incontrano le stesse fasi e trovano lo stesso minimo. Il
   minimo non stava misurando il rumore del banco: stava misurando LA
   FASE PIU' LEGGERA DELLA PARTITA (un passo dopo un gol, a palla ferma,
   non costa come un passo a meta' campo). E due partite diverse hanno
   fasi diverse: quel 160% era lo scarto fra due partite, non fra due
   matematiche.

   LA CURA NON E' UNA STATISTICA PIU' FURBA, E' RENDERE COSTANTE IL
   LAVORO DENTRO IL CRONOMETRO. Qui si cronometra una PARTITA INTERA dal
   fischio d'inizio al fischio finale, ripetuta K volte con lo STESSO
   seme: ogni ripetizione fa esattamente lo stesso lavoro, quindi il
   minimo delle K e' il costo vero e il carico della macchina puo' solo
   peggiorarlo. Fra i due file la partita non e' la stessa — e' proprio
   quel che la cura cambia — e per questo il confronto si fa su piu'
   semi e si tiene la mediana, e la prova F resta il testimone che non
   dipende da nessuna partita.
   ===================================================================== */
const PARTITA = (seme, passi) => `(() => {
  const t = window.__test;
  t.semina(${seme});
  t.startMatch(1, 1, undefined);
  t.setCpuVsCpu(true);
  let n = 0;
  const a = performance.now();
  while(t.state !== 'end' && n < ${passi}){ t.simulate(1/60); n++; }
  const ms = performance.now() - a;
  return { ms: ms / n, passi: n, fine: t.state === 'end' };
})()`;

const PARTITA_DISEGNO = (seme, passi) => `(() => {
  const t = window.__test;
  t.semina(${seme});
  t.startMatch(1, 1, undefined);
  t.setCpuVsCpu(true);
  let n = 0;
  const a = performance.now();
  while(t.state !== 'end' && n < ${passi}){ t.disegna(); t.simulate(1/60); n++; }
  const ms = performance.now() - a;
  return { ms: ms / n, passi: n, fine: t.state === 'end' };
})()`;

/* LA FUNZIONE NUDA. Gli argomenti sono gli stessi dei due file (una
   tabella di irrazionali costruita con sole moltiplicazioni, uguale
   ovunque) e il risultato si accumula in una somma che viene tornata:
   senza, il motore avrebbe il diritto di non calcolare niente. */
const NUDA = `(giri, ripet) => {
  const V = new Float64Array(512);
  for(let i = 0; i < 512; i++) V[i] = i * 0.7310127 + 0.13;
  const casa = typeof Msin === 'function';
  const F = {
    sin:   [x => Math.sin(x),            casa ? x => Msin(x) : null],
    cos:   [x => Math.cos(x),            casa ? x => Mcos(x) : null],
    tan:   [x => Math.tan(x),            casa ? x => Mtan(x) : null],
    exp:   [x => Math.exp(-x*0.1),       casa ? x => Mexp(-x*0.1) : null],
    log:   [x => Math.log(x+1),          casa ? x => Mlog(x+1) : null],
    atan2: [x => Math.atan2(x, x*0.37-1.1), casa ? x => Matan2(x, x*0.37-1.1) : null],
    hypot: [x => Math.hypot(x, x*1.7),   casa ? x => Mhypot(x, x*1.7) : null]
  };
  const out = {};
  for(const k in F){
    const par = F[k];
    const ns = [];
    for(let q = 0; q < 2; q++){
      const f = par[q];
      if(!f){ ns.push(null); continue; }
      let best = Infinity;
      for(let r = 0; r < ripet; r++){
        let s = 0;
        const a = performance.now();
        for(let i = 0; i < giri; i++) s += f(V[i & 511]);
        const d = (performance.now() - a) * 1e6 / giri;   /* nanosecondi a chiamata */
        if(s === 12345.6789) out.mai = 1;                 /* la somma serve davvero */
        if(d < best) best = d;
      }
      ns.push(best);
    }
    out[k] = { nativa: ns[0], casa: ns[1] };
  }
  return out;
}`;

(async () => {
  let browser = null, srv = null;
  try {
    srv = await servi();
    browser = await playwright.chromium.launch();
    console.log('=== QUANTO COSTA LA MATEMATICA IN CASA — ' + LOTTI + ' lotti da ' + PASSI + ' passi ===');
    console.log('    prima: ' + PRIMA + '   ·   dopo: ' + DOPO);
    console.log('    (di ogni file si tiene il LOTTO PIU\' VELOCE: il carico di un banco occupato');
    console.log('     puo\' solo RUBARE tempo, mai regalarlo, quindi il minimo converge dal basso');
    console.log('     al costo vero mentre la media resta inquinata. E\' la ragione per cui questo');
    console.log('     strumento esiste accanto a prestazione.js invece che al posto suo.)\n');

    const A = await apri(browser, srv.porta, PRIMA);
    const B = await apri(browser, srv.porta, DOPO);
    /* LA TERZA SCHEDA E' LA RISOLUZIONE. Stesso file di A, stesso
       trattamento, stesso seme: quel che questo strumento trova fra A e
       A' e' quel che trova fra due cose uguali, cioe' zero piu' il suo
       errore. Senza, un +3% non si distingue da un +3% di niente. */
    const A2 = await apri(browser, srv.porta, PRIMA);
    const conLib = {
      prima: await A.pag.evaluate(() => typeof window.Msin === 'function'),
      dopo: await B.pag.evaluate(() => typeof window.Msin === 'function')
    };
    console.log('   libreria in casa:  ' + PRIMA + ' ' + (conLib.prima ? 'SI' : 'no') +
                '  ·  ' + DOPO + ' ' + (conLib.dopo ? 'SI' : 'no'));
    if (conLib.prima === conLib.dopo) {
      console.log('   ATTENZIONE: i due file stanno dalla stessa parte, la differenza qui sotto');
      console.log('   non e\' il costo della cura — e\' la risoluzione dello strumento oggi.');
    }
    console.log('');

    const min = l => Math.min(...l);
    const med = l => { const s = l.slice().sort((x, y) => x - y); return s[(s.length - 1) >> 1]; };
    const segno = v => (v >= 0 ? '+' : '') + v.toFixed(4);

    /* la stessa identica partita ripetuta RIPET volte su ogni scheda: il
       lavoro dentro il cronometro e' costante, quindi il minimo e' il
       costo e non una fase. A' e' la terza scheda sullo stesso file di A,
       e serve a dire quanto sbaglia questo strumento fra due cose uguali. */
    const perSeme = async (fai, passi, semi, ripet) => {
      const out = [];
      for (let s = 0; s < semi; s++) {
        const seme = (SEME + s * 7919) >>> 0;
        const script = fai(seme, passi);
        const v = { a: [], b: [], c: [] };
        for (let r = 0; r < ripet; r++) {
          for (const [pag, k] of [[A.pag, 'a'], [B.pag, 'b'], [A2.pag, 'c']]) {
            const x = await pag.evaluate(sc => new Function('return ' + sc)(), script);
            v[k].push(x);
          }
        }
        out.push({
          seme,
          a: min(v.a.map(x => x.ms)), b: min(v.b.map(x => x.ms)), c: min(v.c.map(x => x.ms)),
          np: v.a[0].passi, nb: v.b[0].passi, fine: v.a[0].fine && v.b[0].fine
        });
      }
      return out;
    };

    const referto = (R, unita) => {
      const dif = R.map(r => (r.b - r.a) / r.a * 100);
      const ris = R.map(r => (r.c - r.a) / r.a * 100);
      for (const r of R) {
        console.log('   seme ' + r.seme + ': ' + PRIMA + ' ' + r.a.toFixed(4) + '  ·  ' + DOPO + ' ' + r.b.toFixed(4) +
                    '  ·  differenza ' + ((r.b - r.a) / r.a * 100).toFixed(1) + '%' +
                    '  (passi ' + r.np + '/' + r.nb + (r.fine ? ', partita finita' : ', tetto') + ')');
      }
      const dm = med(dif), rm = med(ris.map(Math.abs));
      console.log('   MEDIANA sui ' + R.length + ' semi: ' + (dm >= 0 ? '+' : '') + dm.toFixed(1) + '% ' + unita +
                  '   ·   RISOLUZIONE (stesso file, altra scheda): ' + rm.toFixed(1) + '%');
      console.log('   gamma della differenza fra i semi: da ' + Math.min(...dif).toFixed(1) + '% a ' +
                  Math.max(...dif).toFixed(1) + '%');
      if (Math.abs(dm) <= rm) {
        console.log('   >>> NON RISOLVIBILE: la differenza fra i due file sta dentro quella che lo');
        console.log('       strumento trova fra un file e se\' stesso. Il numero non si trascrive.');
      }
      return { dm, rm, med: med(R.map(r => r.a)) };
    };

    console.log('P) IL PASSO DI SIMULAZIONE — una PARTITA INTERA cronometrata, ' + LOTTI + ' semi x ' + RIPET + ' ripetizioni');
    console.log('   (stessa partita ripetuta: lavoro costante dentro il cronometro, quindi il minimo');
    console.log('    e\' un costo. Fra i due file la partita non e\' la stessa — e\' quel che la cura');
    console.log('    cambia — percio\' si guarda la mediana su piu\' semi, e la gamma accanto.)');
    const P = referto(await perSeme(PARTITA, PASSI, LOTTI, RIPET), 'a passo');
    console.log('   il passo tipico costa ' + P.med.toFixed(4) + ' ms su un budget di ' + (1000 / 60).toFixed(2) + ' ms\n');

    /* ---- D: il fotogramma disegnato ---- */
    console.log('D) IL FOTOGRAMMA DISEGNATO — stessa forma, con t.disegna() a ogni passo (c\'e\' anche la tela)');
    const D = referto(await perSeme(PARTITA_DISEGNO, FOTO, Math.max(2, LOTTI >> 1), RIPET), 'a fotogramma');
    console.log('   il fotogramma tipico costa ' + D.med.toFixed(4) + ' ms\n');

    /* ---- F: la funzione nuda ---- */
    console.log('F) LA FUNZIONE NUDA — nanosecondi a chiamata, minimo su ripetizioni (sul gioco curato)');
    const nuda = await B.pag.evaluate(([g, a]) => new Function('return ' + g)()(...a), [NUDA, [200000, 7]]);
    let sommaNat = 0, sommaCasa = 0;
    for (const k of ['sin', 'cos', 'tan', 'exp', 'log', 'atan2', 'hypot']) {
      const r = nuda[k];
      if (!r || r.casa == null) { console.log('   ' + k.padEnd(6) + ' non in casa in questo file'); continue; }
      console.log('   ' + k.padEnd(6) + ' nativa ' + r.nativa.toFixed(1).padStart(7) + ' ns   casa ' +
                  r.casa.toFixed(1).padStart(7) + ' ns   x' + (r.casa / r.nativa).toFixed(2));
      sommaNat += r.nativa; sommaCasa += r.casa;
    }
    if (sommaNat) console.log('   nel complesso la casa costa x' + (sommaCasa / sommaNat).toFixed(2) + ' la nativa');
    console.log('');

    /* la previsione, dal conto delle chiamate di _q-perimetro.js */
    const CH_PASSO = { sin: 0, cos: 0, tan: 0, exp: 0, log: 0, atan2: 0, hypot: 0 };
    const chFile = path.join(RADICE, 'fuori', '143-chiamate.json');
    let previsto = null;
    if (fs.existsSync(chFile)) {
      try {
        const c = JSON.parse(fs.readFileSync(chFile, 'utf8'));
        let ns = 0; const voci = [];
        for (const k in CH_PASSO) {
          if (!c[k] || !nuda[k] || nuda[k].casa == null) continue;
          const d = c[k] * (nuda[k].casa - nuda[k].nativa);
          ns += d;
          voci.push(k + ' ' + c[k].toFixed(1) + ' chiamate x ' + (nuda[k].casa - nuda[k].nativa).toFixed(1) +
                    ' ns = ' + (d / 1000).toFixed(2) + ' us');
        }
        previsto = ns / 1e6;
        console.log('   il conto, voce per voce (chiamate a passo misurate da _q-perimetro):');
        for (const v of voci) console.log('     ' + v);
        console.log('   PREVISIONE dal conto delle chiamate: ' + segno(previsto) + ' ms a passo, cioe\' ' +
                    (previsto / (1000 / 60) * 100).toFixed(3) + '% del budget di un fotogramma');
        console.log('   MISURA diretta della prova P: ' + (P.dm >= 0 ? '+' : '') + P.dm.toFixed(1) +
                    '% del passo, cioe\' ' + segno(P.med * P.dm / 100) + ' ms (risoluzione ' + P.rm.toFixed(1) + '%)');
        console.log('   (due strade per lo stesso numero. Se la seconda non risolve, la prima resta');
        console.log('    sola e va detto: e\' lavoro costante dentro il cronometro, quindi il suo');
        console.log('    minimo e\' un costo e non una fase.)\n');
      } catch (e) { console.log('   (conto delle chiamate illeggibile: ' + e.message + ')\n'); }
    } else {
      console.log('   (nessun conto delle chiamate in ' + path.relative(RADICE, chFile) + ': la previsione si salta)\n');
    }

    const errori = [].concat(A.errori, A2.errori, B.errori);
    await browser.close(); browser = null;
    srv.chiudi(); srv = null;
    if (errori.length) { console.error('ECCEZIONI DI PAGINA: ' + errori.slice(0, 3).join(' | ')); process.exit(2); }

    if (previsto === null) {
      console.log('>>> NESSUNA PREVISIONE: manca il conto delle chiamate. Lanciare prima');
      console.log('    node strumenti/_q-perimetro.js, che lo scrive.');
      process.exit(3);
    }
    console.log('>>> IL COSTO, MISURATO DOVE IL LAVORO E\' COSTANTE: ' + segno(previsto) + ' ms a passo di');
    console.log('    simulazione, cioe\' ' + (previsto / (1000 / 60) * 100).toFixed(3) + '% del budget di un fotogramma a sessanta al');
    console.log('    secondo, e ' + (previsto / P.med * 100).toFixed(1) + '% del passo stesso. La misura diretta della partita');
    console.log('    intera (prova P) dice ' + (P.dm >= 0 ? '+' : '') + P.dm.toFixed(1) + '% con una risoluzione del ' + P.rm.toFixed(1) + '%: ' +
                (Math.abs(P.dm) <= P.rm ? 'non risolve, e lo dichiara.' : 'risolve, e va letta accanto.'));
    process.exit(0);
  } catch (e) {
    try { if (browser) await browser.close(); } catch (x) {}
    try { if (srv) srv.chiudi(); } catch (x) {}
    console.error('\nFALLITO (banco): ' + e.message + '\n' + (e.stack || ''));
    process.exit(2);
  }
})();
