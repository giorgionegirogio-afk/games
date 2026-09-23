/* =====================================================================
   _q-verbi-ritardo.js — IL VERBO SOTTO RITARDO (voce #141, compito 3)
   La GAMBA B dell'onda E.

   LA DOMANDA. La gamba A misura quanto il gioco PEGGIORA col ritardo.
   Non dice se un VERBO muore — e un verbo che muore e' un NO secco che
   nessuna media di gol farebbe vedere, perche' una filtrante che non
   parte piu' si nasconde dentro «qualche tiro in meno».

   COME. Non si riscrive l'impianto dei gesti: si riusa `strumenti/giocata.js`,
   che manda tocchi VERI via CDP (Input.dispatchTouchEvent, gli stessi
   eventi di uno schermo di telefono) e che sa gia' distinguere un verbo
   dall'altro coi contatori del gioco invece che a occhio. Gli si e'
   aggiunto un `--ritardo K` e nient'altro. Una copia sarebbe stata un
   posto in piu' dove la stessa ferita si riapre da sola.

   IL BANCO E' A TEMPO REALE, QUINDI NON E' RIPETIBILE (regola di casa,
   CLAUDE.md). Un solo rosso non e' una prova: qui si ripete R volte per
   ogni K e si conta. MISURATO il 23 settembre 2026 su gioco sano a
   ritardo ZERO: il cross e' fallito una volta e la filtrante un'altra
   in due corse consecutive. Chi leggesse una corsa sola direbbe «il
   ritardo ha ucciso la filtrante» di un gioco che non e' stato toccato.

   E IL CANCELLO SI SPOSTA DI K, dichiarato dentro giocata.js: i 500 ms
   e i 30 fotogrammi diventano 500+K/60 e 30+K. Lasciarli fermi vorrebbe
   dire far bocciare il gioco dal ritardo che il banco stesso ha acceso.
   La SOGLIA-VERBI non chiede «il verbo e' ancora veloce» — non lo e', ed
   e' tardo esattamente di K, che e' il punto — ma «il verbo RIESCE
   ANCORA»: il contatore sale, la palla parte, la carica cade in finestra.

   QUANTO PUO' DIRE QUESTO BANCO, ONESTAMENTE. La SOGLIA-VERBI chiede
   >= 95% di riuscita. Per distinguere «95%» da «90%» servono decine di
   tentativi per verbo e per K, e ogni corsa costa mezzo minuto: il banco
   NON li fa, e non finge. Riporta i successi su tentativi con l'estremo
   BASSO dell'intervallo, e dichiara in chiaro se il campione basta a
   decidere la soglia o no. Cio' che il campione basta sempre a vedere e'
   un verbo che MUORE — zero riuscite su dieci non ha bisogno di
   statistica — ed e' la porta del NO che questa gamba tiene.

   uso:  node strumenti/_q-verbi-ritardo.js
         node strumenti/_q-verbi-ritardo.js --ripetute 5 --k 0,12
   esce 0 se nessun verbo muore e la carica tiene, 1 se un verbo muore
   (NO per l'onda E), 2 se il banco e' esploso, 3 se la prova e' nulla.
   ===================================================================== */
const path = require('path');
const { spawnSync } = require('child_process');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const RIPETUTE = Math.max(1, parseInt(arg('ripetute', '5'), 10) || 5);
const KS = String(arg('k', '0,6,12,18')).split(',').map(s => parseInt(s, 10)).filter(n => n >= 0);
const D_DICHIARATA = 12;
const SOGLIA_VERBI = 0.95;
const SOGLIA_CARICA = 0.90;
const FINESTRA = [0.50, 0.80];      /* la finestra dolce della carica, in secondi */

/* i cinque verbi della SOGLIA-VERBI, coi nomi che giocata.js usa.
   'trascina' e 'passaggio' si misurano lo stesso e si stampano, ma non
   sono i cinque della soglia: il primo e' la levetta (non un verbo) e il
   secondo e' la forma non mirata della filtrante. */
const VERBI = ['carica', 'filtrante', 'cambio', 'contrasto', 'cross'];

function corri(K, seme) {
  const a = ['strumenti/giocata.js', '--tutte', '--seme', String(seme)];
  if (K > 0) a.push('--ritardo', String(K));
  const r = spawnSync(process.execPath, a, { cwd: RADICE, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const testo = (r.stdout || '') + (r.stderr || '');
  const esiti = {}, carica = [];
  for (const riga of testo.split('\n')) {
    let m = riga.match(/^\s{2}(OK|NO|--)\s+([a-z]+):/);
    if (m) esiti[m[2]] = (m[1] === 'OK') ? 'OK' : (m[1] === '--' ? 'NM' : 'NO');
    m = riga.match(/carica maturata ([0-9.]+) s/);
    if (m) carica.push(parseFloat(m[1]));
  }
  return { uscita: r.status, esiti, carica, testo };
}

const wilsonBasso = (k, n) => {
  if (!n) return NaN;
  const z = 1.96, p = k / n;
  const d = 1 + z * z / n;
  return ((p + z * z / (2 * n)) - z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))) / d;
};

(async () => {
  console.log('=== IL VERBO SOTTO RITARDO — gamba B, tocchi veri via CDP ===');
  console.log('    K = ' + KS.join(', ') + ' tick, ' + RIPETUTE + ' ripetute per K, semi diversi a ogni giro');
  console.log('    BANCO A TEMPO REALE: NON e\' ripetibile. Un solo rosso non e\' una prova —');
  console.log('    per questo si ripete e si conta, invece di guardare una corsa sola.\n');

  const tavola = {};   /* K -> verbo -> {ok, no, nm} */
  const cariche = {};  /* K -> [secondi] */
  let esplosi = 0;

  for (const K of KS) {
    tavola[K] = {}; cariche[K] = [];
    for (const v of Object.keys({ ...{}, passaggio: 1, trascina: 1, carica: 1, filtrante: 1, cross: 1, cambio: 1, contrasto: 1 }))
      tavola[K][v] = { ok: 0, no: 0, nm: 0 };
    process.stdout.write('  . K=' + String(K).padStart(2) + ' (' + String(Math.round(K * 1000 / 60)).padStart(3) + ' ms) ');
    for (let r = 0; r < RIPETUTE; r++) {
      /* =====================================================================
         IL SEME NON DIPENDE DA K, E QUESTA RIGA E' COSTATA UN CONFRONTO
         STORTO (23 settembre 2026, prima corsa di questo strumento).

         La prima versione scriveva `20260731 + r*7 + K`: ogni K vedeva
         scene DIVERSE, e la tavola confrontava il ritardo con il
         sorteggio del campo. Misurato: a K=0 tutti e cinque i verbi
         davano 1/2 e a K=12 tutti e cinque 2/2, cioe' «col ritardo si
         gioca meglio» — che non era il gioco, era un seme in cui
         preparaQuiete non riusciva a posare la scena.

         Con lo stesso seme a ogni K le corse sono APPAIATE: la stessa
         scena, lo stesso campo, gli stessi uomini, e l'unica cosa che
         cambia e' il ritardo. E' la sola forma in cui il confronto
         significa quel che dice.
         ===================================================================== */
      const c = corri(K, 20260731 + r * 7);
      if (c.uscita === 2 && !Object.keys(c.esiti).length) { esplosi++; process.stdout.write('!'); continue; }
      for (const v in c.esiti) {
        if (!tavola[K][v]) tavola[K][v] = { ok: 0, no: 0, nm: 0 };
        if (c.esiti[v] === 'OK') tavola[K][v].ok++;
        else if (c.esiti[v] === 'NM') tavola[K][v].nm++;
        else tavola[K][v].no++;
      }
      cariche[K].push(...c.carica);
      process.stdout.write('.');
    }
    process.stdout.write('\n');
  }
  console.log('');

  if (esplosi >= KS.length * RIPETUTE / 2) {
    console.log('PROVA NULLA: ' + esplosi + ' corse su ' + (KS.length * RIPETUTE) + ' non hanno misurato niente.');
    console.log('Il banco dei gesti non riesce a posare le dita: non si accusa il gioco.');
    process.exit(3);
  }

  /* --------------------------------------------------------- la tavola */
  console.log('1) I VERBI — riuscite su tentativi, per K\n');
  const nomi = Object.keys(tavola[KS[0]]).filter(v => tavola[KS[0]][v].ok + tavola[KS[0]][v].no + tavola[KS[0]][v].nm > 0);
  console.log('   verbo        ' + KS.map(K => ('K=' + K).padStart(9)).join(''));
  console.log('   ' + '-'.repeat(13 + 9 * KS.length));
  for (const v of nomi) {
    const cinque = VERBI.includes(v) ? '*' : ' ';
    console.log('   ' + cinque + v.padEnd(12) + KS.map(K => {
      const t = tavola[K][v], n = t.ok + t.no;
      return (n ? t.ok + '/' + n : '—').padStart(9);
    }).join(''));
  }
  console.log('\n   (* = uno dei cinque verbi della SOGLIA-VERBI; «trascina» e\' la levetta,');
  console.log('    «passaggio» e\' la forma non mirata della filtrante: si stampano, non contano)');

  /* --------------------------------------------------------- la carica */
  console.log('\n2) LA CARICA DEL TIRO — il punto fragile: la finestra dolce e\' tenuta dal dito\n');
  console.log('        K   ms | cariche |  in finestra 0,50-0,80 s | valori');
  console.log('   ---------------------------------------------------------------------------');
  const caricaOk = {};
  for (const K of KS) {
    const c = cariche[K];
    const dentro = c.filter(x => x >= FINESTRA[0] && x <= FINESTRA[1]).length;
    caricaOk[K] = { dentro, n: c.length };
    console.log('   ' + String(K).padStart(9) + String(Math.round(K * 1000 / 60)).padStart(5) + ' | ' +
      String(c.length).padStart(7) + ' | ' +
      (c.length ? dentro + '/' + c.length + ' (' + Math.round(100 * dentro / c.length) + '%)' : '—').padStart(24) + ' | ' +
      c.map(x => x.toFixed(2)).join(' '));
  }

  /* ------------------------------------------------------- le due porte */
  const D = KS.includes(D_DICHIARATA) ? D_DICHIARATA : KS[KS.length - 1];
  console.log('\n3) SOGLIA-VERBI alla D dichiarata (D = ' + D + ' tick = ' + Math.round(D * 1000 / 60) + ' ms)');
  console.log('   dichiarata il 23 settembre 2026 nella spec, PRIMA di questa corsa: «tutti e cinque');
  console.log('   i verbi riescono in >= 95%, e la carica cade nella finestra in >= 90%»\n');

  let morti = [], deboli = [], nonDecide = [];
  for (const v of VERBI) {
    const t = (tavola[D] && tavola[D][v]) || { ok: 0, no: 0, nm: 0 };
    const n = t.ok + t.no;
    const t0 = (tavola[0] && tavola[0][v]) || null;
    const n0 = t0 ? t0.ok + t0.no : 0;
    if (!n) { nonDecide.push(v + ' (mai misurato)'); continue; }
    const basso = wilsonBasso(t.ok, n);
    /* UN VERBO E' MORTO quando non riesce mai a D e riusciva a K=0: non
       serve statistica per leggerlo, e non serve nemmeno il 95%. */
    const morto = t.ok === 0 && n >= 2 && t0 && t0.ok > 0;
    if (morto) morti.push(v + ' (0/' + n + ' a D, ' + t0.ok + '/' + n0 + ' a K=0)');
    else if (basso < SOGLIA_VERBI && t.no > 0) deboli.push(v + ' (' + t.ok + '/' + n + ', estremo basso ' + (basso * 100).toFixed(0) + '%)');
    else if (basso < SOGLIA_VERBI) nonDecide.push(v + ' (' + t.ok + '/' + n + ', estremo basso ' + (basso * 100).toFixed(0) + '%: campione corto, non rotto)');
    console.log('   ' + (morto ? 'NO  ' : (t.no ? '??  ' : 'OK  ')) + v.padEnd(12) +
      t.ok + '/' + n + '   estremo basso ' + (basso * 100).toFixed(0) + '%' +
      (t0 ? '   (a K=0: ' + t0.ok + '/' + n0 + ')' : ''));
  }
  const cD = caricaOk[D] || { dentro: 0, n: 0 };
  const cQ = cD.n ? cD.dentro / cD.n : NaN;
  const caricaFuori = cD.n >= 2 && cQ < SOGLIA_CARICA;
  console.log('   ' + (cD.n === 0 ? '??  ' : (caricaFuori ? 'NO  ' : 'OK  ')) + 'carica'.padEnd(12) +
    (cD.n ? cD.dentro + '/' + cD.n + '   (' + Math.round(100 * cQ) + '% in finestra)' : 'mai misurata'));

  /* quanti tentativi servirebbero per decidere davvero il 95% */
  const nServe = Math.ceil(3 / (1 - SOGLIA_VERBI));   /* regola del tre: zero guasti su n => guasto <= 3/n */
  console.log('\n   QUANTO PUO\' DIRE QUESTO CAMPIONE. Per decidere «>= 95%» con ' + RIPETUTE + ' tentativi');
  console.log('   non basta: a zero guasti su ' + RIPETUTE + ' l\'estremo basso e\' ' +
              (wilsonBasso(RIPETUTE, RIPETUTE) * 100).toFixed(0) + '%, sotto la soglia. Servirebbero');
  console.log('   almeno ' + nServe + ' tentativi per verbo e per K (regola del tre), cioe\' ' +
              (nServe * KS.length) + ' corse da mezzo minuto.');
  console.log('   Cio\' che questo campione decide comunque e\' se un verbo MUORE, che e\' la');
  console.log('   porta del NO che questa gamba tiene.');

  if (morti.length) {
    console.log('\n>>> UN VERBO E\' MORTO SOTTO RITARDO: ' + morti.join(', ') + '.');
    console.log('    E\' un NO per l\'onda E, e non ha bisogno di statistica: a ' +
                Math.round(D * 1000 / 60) + ' ms quel gesto');
    console.log('    non si puo\' piu\' fare. Va misurato a quale K muore prima di decidere.');
    process.exit(1);
  }
  if (caricaFuori) {
    console.log('\n>>> LA CARICA ESCE DALLA FINESTRA a ' + Math.round(D * 1000 / 60) + ' ms (' +
                Math.round(100 * cQ) + '% dentro, serve 90%).');
    console.log('    E\' il punto fragile annunciato: la finestra dolce e\' tenuta dal dito, e un');
    console.log('    ritardo che sposta il rilascio sposta la carica. E\' un NO.');
    process.exit(1);
  }
  console.log('\n>>> NESSUN VERBO MUORE a ' + Math.round(D * 1000 / 60) + ' ms, e la carica resta in finestra.');
  if (deboli.length) console.log('    Da guardare (guasti osservati): ' + deboli.join(', ') + '.');
  if (nonDecide.length) console.log('    NON DECISI dal campione: ' + nonDecide.join(', ') + '.');
  console.log('    La SOGLIA-VERBI al 95% NON e\' decisa da questo campione, e il banco non finge');
  console.log('    di averla decisa: quel che dice e\' che nessuno dei cinque verbi e\' morto.');
  process.exit(0);
})();
