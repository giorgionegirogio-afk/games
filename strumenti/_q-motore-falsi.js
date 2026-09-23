/* =====================================================================
   _q-motore-falsi.js — QUATTRO BUGIE NEL CASO PEGGIORE, E UN VERO
   (voce #142, compito 3)

   IL BANCO DI _q-motore-nastro.js DICE che un onesto con un telefono di
   un'altra marca non viene piu' accusato. Questo dice che se ne
   accorgerebbe se non fosse vero — e lo dice NOMINANDO QUALE PROVA
   MORDE QUALE BUGIA, perche' «qualcosa e' rosso» non e' una misura.

   LA REGOLA DI CASA: ogni falso deve PASSARE tutte le prove tranne
   quella che lo riguarda. Un falso che rompe tutto non dice quale prova
   morde; un falso troppo gentile non prova niente. Undici cantieri di
   fila hanno pagato questa lezione in revisione.

   I QUATTRO, e nessuno e' di fantasia:

     muto     l'impronta c'e' nel nastro, il formato e' perfetto, e il
              giudice non la confronta. E' il difetto di oggi travestito
              da cura, ed e' la terza volta che la stessa ferita si
              presenta nello stesso posto (#132 sul marchio di
              troncatura, #133 sullo schermo).
     accusa   il giudice se ne accorge e dice NON TORNA invece di «non lo
              so». E' il difetto del #133, GIA' PAGATO UNA VOLTA in
              revisione: la prova deve chiedere INCOMPLETO per NOME, non
              «un verdetto diverso».
     piatto   l'impronta e' fatta di pow e sqrt, che IEEE-754 obbliga a
              essere correttamente arrotondate: MISURATE identiche su
              tutti e tre i motori. Dice sempre «stesso motore»: e'
              l'attestato perfetto, sembra una misura e non misura
              niente.
     pauroso  si astiene sempre, anche a motore coincidente. Passa la
              prova principale A PIENI VOTI ed e' la perdita di copertura
              mascherata da prudenza. E' quello che ha trovato un buco
              nel banco (vedi A1b in _q-motore-nastro.js).

   PIU' IL CONTROLLO POSITIVO, la meta' che manca a quasi tutti i banchi
   di falsi: il gioco VERO deve passare tutte e dieci le prove e uscire
   0. Senza, «quattro rossi» significherebbe solo che il banco e' rotto.

   uso:  node strumenti/_q-motore-falsi.js
         node strumenti/_q-motore-falsi.js --sfide 6
         node strumenti/_q-motore-falsi.js --solo pauroso
   esce 0 se ogni bugia e' morsa dalla prova che dichiara e il vero
   passa, 1 se no, 2 se il banco esplode, 3 se una corsa non ha
   misurato niente (prova nulla).
   ===================================================================== */
const path = require('path');
const { spawnSync } = require('child_process');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const N_SFIDE = arg('sfide', '4');
const SOLO = String(arg('solo', '')).split(',').map(s => s.trim()).filter(Boolean);

/* LA BITE LIST, DICHIARATA PRIMA DI MISURARE. `cade` sono le prove che
   DEVONO essere rosse, `tiene` quelle che DEVONO restare verdi: sono le
   due meta' della stessa affermazione, e senza la seconda un falso che
   rompe tutto passerebbe per un falso ben costruito. */
const FALSI = [
  { nome: 'muto', crit: '_crit-motore-muto.js', file: 'fuori/crit-motore-muto.html',
    che: 'l\'impronta viaggia e il giudice non la legge',
    cade: ['A2', 'E', 'F', 'F2'], tiene: ['A1', 'A1b', 'B', 'C0', 'C', 'D'] },
  { nome: 'accusa', crit: '_crit-motore-accusa.js', file: 'fuori/crit-motore-accusa.html',
    che: 'se ne accorge e accusa invece di astenersi',
    cade: ['A2', 'F', 'F2'], tiene: ['A1', 'A1b', 'B', 'C0', 'C', 'D', 'E'] },
  { nome: 'piatto', crit: '_crit-motore-piatto.js', file: 'fuori/crit-motore-piatto.html',
    che: 'l\'impronta e\' fatta di pow e sqrt, identiche ovunque',
    cade: ['C', 'A2', 'F', 'F2'], tiene: ['A1', 'A1b', 'B', 'C0', 'D', 'E'] },
  { nome: 'pauroso', crit: '_crit-motore-pauroso.js', file: 'fuori/crit-motore-pauroso.html',
    che: 'si astiene sempre, anche a motore coincidente',
    cade: ['B', 'A1b'], tiene: ['A2', 'A3', 'C0', 'C', 'D', 'E', 'F', 'F2'] },
];

const esiti = [];
const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '  [' + det + ']' : '')); };

/* LE ETICHETTE SI LEGGONO DALLE RIGHE DEL BANCO, non da un suo modulo:
   il banco e' un processo che esce con un numero e stampa righe, ed e'
   esattamente cosi' che lo usa la batteria. Un banco dei falsi che
   chiamasse la funzione interna misurerebbe una cosa che nessuno lancia. */
function corri(gioco) {
  const cmd = ['strumenti/_q-motore-nastro.js', '--sfide', N_SFIDE];
  if (gioco) cmd.push('--gioco', gioco);
  const r = spawnSync(process.execPath, cmd, { cwd: RADICE, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const testo = String(r.stdout || '') + String(r.stderr || '');
  const rosse = [], verdi = [];
  for (const riga of testo.split('\n')) {
    /* LE MINUSCOLE CI VOGLIONO, e questa riga e' costata un falso che
       passava (23 settembre 2026, prima corsa di questo banco). Il
       filtro era `[A-Z0-9]+` e la prova si chiama «A1b»: la b minuscola
       non entrava nella classe, la riga non veniva riconosciuta NE'
       come verde NE' come rossa, e il falso `pauroso` — che cade
       proprio su A1b — risultava «non morso». Un lettore di etichette
       che ne perde una in silenzio trasforma un banco che discrimina in
       un banco che sembra discriminare, ed e' peggio di nessun banco.
       Si contano anche le etichette lette, sotto, cosi' se un giorno la
       forma cambiasse ancora si vedrebbe invece di sparire. */
    const m = riga.match(/^\s\s(OK|NO)\s\s([A-Za-z0-9]+)\)/);
    if (!m) continue;
    (m[1] === 'OK' ? verdi : rosse).push(m[2]);
  }
  return { uscita: r.status, rosse, verdi, testo };
}

(async () => {
  console.log('=== QUATTRO BUGIE NEL CASO PEGGIORE, E UN VERO (voce #142) ===');
  console.log('    ' + N_SFIDE + ' sfide vere per corsa, cinque corse\n');

  /* --- il controllo positivo, PRIMA: se il vero non passa, i rossi dei
     falsi non dicono niente di loro --- */
  console.log('IL VERO — il controllo positivo, la meta\' che manca a quasi tutti i banchi di falsi');
  const V = corri('');
  if (V.uscita === 3) {
    console.error('PROVA NULLA: il banco sul gioco vero non ha misurato niente (uscita 3).');
    console.error(V.testo.split('\n').slice(-6).join('\n'));
    process.exit(3);
  }
  di(V.uscita === 0 && V.rosse.length === 0,
     'V) il gioco vero passa tutte le prove e esce 0',
     'uscita ' + V.uscita + ', verdi ' + V.verdi.length + ', rosse ' +
     (V.rosse.length ? V.rosse.join(',') : 'nessuna'));
  /* E IL LETTORE DI ETICHETTE DEVE AVERLE LETTE TUTTE. Se il banco
     stampa undici prove e qui se ne leggono dieci, una bite list puo'
     dirsi soddisfatta su una prova che nessuno ha guardato — ed e'
     successo davvero (vedi il commento in `corri`). */
  const TUTTE = ['A1', 'A1b', 'A2', 'A3', 'B', 'C0', 'C', 'D', 'E', 'F', 'F2'];
  const perse = TUTTE.filter(x => V.verdi.indexOf(x) < 0 && V.rosse.indexOf(x) < 0);
  di(perse.length === 0, 'V2) e il lettore di etichette le legge TUTTE E ' + TUTTE.length,
     perse.length ? 'non lette: ' + perse.join(',') : (V.verdi.length + V.rosse.length) + ' etichette lette');
  console.log('');

  for (const f of FALSI) {
    if (SOLO.length && SOLO.indexOf(f.nome) < 0) continue;
    console.log('IL FALSO «' + f.nome + '» — ' + f.che);
    const c = spawnSync(process.execPath, ['strumenti/' + f.crit], { cwd: RADICE, encoding: 'utf8' });
    if (c.status !== 0) {
      di(false, f.nome + ') il falso si costruisce',
         String(c.stdout || '').trim().split('\n').slice(-1)[0] + String(c.stderr || '').trim().slice(0, 160));
      console.log('');
      continue;
    }
    const R = corri(f.file);
    if (R.uscita === 3) {
      di(false, f.nome + ') la corsa misura qualcosa',
         'PROVA NULLA: il banco e\' uscito 3 su questo falso — i nastri di questa ' +
         'sessione non divergevano, oppure il falso ha reso il banco cieco');
      console.log('');
      continue;
    }
    di(R.uscita === 1, f.nome + ') il banco lo BOCCIA (uscita 1)',
       'uscita ' + R.uscita + ', rosse ' + (R.rosse.length ? R.rosse.join(',') : 'nessuna'));
    const mancano = f.cade.filter(x => R.rosse.indexOf(x) < 0);
    di(mancano.length === 0, f.nome + ') e lo boccia PROPRIO su ' + f.cade.join(', '),
       mancano.length ? 'non e\' caduta: ' + mancano.join(',') : 'tutte cadute');
    const rotte = f.tiene.filter(x => R.rosse.indexOf(x) >= 0);
    di(rotte.length === 0, f.nome + ') e NON rompe ' + f.tiene.join(', ') + ' (un falso che rompe tutto non dice niente)',
       rotte.length ? 'cadute anche: ' + rotte.join(',') : 'tutte in piedi');
    console.log('');
  }

  const rossi = esiti.filter(x => !x).length;
  console.log(esiti.length + ' controlli, ' + (esiti.length - rossi) + ' passati, ' + rossi + ' falliti\n');
  if (rossi) {
    console.log('>>> IL BANCO NON DISCRIMINA COME DICHIARA. Finche\' una bugia passa (o una');
    console.log('    prova morde la bugia sbagliata), «_q-motore-nastro e\' verde» non e\' una');
    console.log('    misura: e\' un attestato.');
    process.exit(1);
  }
  console.log('>>> OGNI BUGIA E\' MORSA DALLA PROVA CHE DICHIARA, E IL VERO PASSA.');
  process.exit(0);
})();
