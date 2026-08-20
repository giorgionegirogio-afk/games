/* =====================================================================
   _t-salvataggio.js — IL CONTROLLO NEGATIVO del cancello del salvataggio.

   Uno strumento che non e' stato visto FALLIRE non e' uno strumento.
   Qui il salvataggio si rompe apposta — cinque guasti diversi, uno per
   ogni proprieta' che il cancello dichiara di sorvegliare — e ogni volta
   si pretende che salvataggio.js diventi ROSSO, e sul caso GIUSTO. Poi si
   applica la toppa proposta e si pretende il contrario: il caso 11 passa
   da APERTO a OK.

   I guasti si scrivono su COPIE FUORI DAL REPO (nella cartella temporanea
   di sessione, o dove dice --dove): il gioco del repo non si tocca, e
   nemmeno per sbaglio — la sua impronta si ricontrolla alla fine.

     uso: node strumenti/_t-salvataggio.js
          node strumenti/_t-salvataggio.js --dove C:/percorso/di/lavoro
          node strumenti/_t-salvataggio.js --solo 3      (un guasto solo)

   Uscite: 0 tutti i controlli si sono comportati come previsto
           1 un guasto NON ha fatto diventare rosso il cancello (il caso
             grave: vuol dire che quel caso non misura niente)
           2 il banco e' esploso            3 la prova e' nulla
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const RADICE = path.resolve(__dirname, '..');
const GIOCO = path.join(RADICE, 'CALCETTO-il-gioco.html');
const md5 = f => crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex');

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const DOVE = path.resolve(arg('dove', path.join(os.tmpdir(), 'calcetto-controllo-salvataggio')));
const SOLO = arg('solo', '');

if (!fs.existsSync(GIOCO)) { console.error('PROVA NULLA: non trovo il gioco: ' + GIOCO); process.exit(3); }
const IMPRONTA_PRIMA = md5(GIOCO);
if (path.resolve(DOVE).startsWith(RADICE)) {
  console.error('PROVA NULLA: la cartella di lavoro deve stare FUORI dal repo (e\' ' + DOVE + ')');
  process.exit(3);
}
fs.mkdirSync(DOVE, { recursive: true });
const SORGENTE = fs.readFileSync(GIOCO, 'utf8');

/* ---------------------------------------------------------------------
   I GUASTI. Ognuno e' una sostituzione ancorata (deve trovarsi ESATTAMENTE
   una volta) e dichiara QUALI casi del cancello deve far diventare rossi.
   Se ne diventa rosso uno diverso, o nessuno, il controllo fallisce: e'
   il modo in cui si scopre che un caso stava passando per caso.
   --------------------------------------------------------------------- */
const GUASTI = [
  {
    n: 1, nome: 'la scrittura non avviene mai (persistSave muta)',
    attesi: [1, 2, 3],
    cerca: `  try{ localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); }catch(e){}`,
    metti: `  try{ /* GUASTO DI PROVA: la scrittura e' stata tolta */ }catch(e){}`,
    perche: 'se il giro completo passasse lo stesso, non starebbe leggendo il disco',
  },
  {
    n: 2, nome: 'la lettura non ha rete di sicurezza (via il try da loadSave)',
    attesi: [4, 8],
    cerca: `  let j=null;
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    if(raw){ const p=JSON.parse(raw); if(p&&typeof p==='object') j=p; }
  }catch(e){}`,
    metti: `  let j=null;
  {
    /* GUASTO DI PROVA: senza try, la spazzatura nella chiave uccide il gioco */
    const raw=localStorage.getItem(SAVE_KEY);
    if(raw){ const p=JSON.parse(raw); if(p&&typeof p==='object') j=p; }
  }`,
    perche: 'e\' il guasto vero: un JSON rotto nella chiave e il gioco non si apre piu\'',
  },
  {
    n: 3, nome: 'la migrazione dimentica la v3',
    attesi: [6, 10],
    cerca: `    for(const k of ['calcetto_save_v3','calcetto_save_v2']){`,
    metti: `    for(const k of ['calcetto_save_v2']){   /* GUASTO DI PROVA: la v3 non si legge piu' */`,
    perche: 'chi aggiorna dalla v3 si ritroverebbe tutto azzerato',
  },
  {
    n: 4, nome: 'la scrittura non e\' protetta (via il try da persistSave)',
    attesi: [8, 9],
    cerca: `  try{ localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); }catch(e){}`,
    metti: `  localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE));   /* GUASTO DI PROVA: senza try */`,
    perche: 'in una WebView con la quota esaurita il gioco morirebbe a fine partita',
  },
  {
    n: 5, nome: 'l\'azzeramento dimentica la versione vecchia',
    attesi: [10],
    cerca: `    localStorage.removeItem('calcetto_save_v3');
`,
    metti: ``,
    perche: 'chi azzera tutto si ritroverebbe la vecchia partita al riavvio',
  },
];

/* ---------------------------------------------------------------------
   esegue il cancello su una copia e restituisce, per ogni caso, il suo
   verdetto letto dalla stampa (OK / NO / APERTO)
   --------------------------------------------------------------------- */
function corri(file) {
  const p = spawnSync(process.execPath, [path.join(__dirname, 'salvataggio.js'), '--gioco', file],
    { cwd: RADICE, encoding: 'utf8', timeout: 900000, windowsHide: true });
  const testo = (p.stdout || '') + (p.stderr || '');
  const verdetti = {};
  for (const r of testo.split(/\r?\n/)) {
    const m = r.match(/^\s*(OK|NO|APERTO)\s+(\d+)\./);
    if (m) verdetti[+m[2]] = m[1];
  }
  return { codice: p.status, verdetti, testo };
}
const rossi = v => Object.keys(v).filter(k => v[k] === 'NO').map(Number).sort((a, b) => a - b);

const righe = [];
let male = 0;

/* --- 0. il riferimento: il gioco intero, senza guasti ---------------- */
console.log('=== CONTROLLO NEGATIVO DEL CANCELLO DEL SALVATAGGIO ===');
console.log('gioco: ' + GIOCO + '  md5 ' + IMPRONTA_PRIMA.slice(0, 12));
console.log('copie di lavoro (fuori dal repo): ' + DOVE + '\n');

/* --- i cinque guasti ------------------------------------------------- */
for (const g of GUASTI) {
  if (SOLO && String(g.n) !== SOLO) continue;
  const quante = SORGENTE.split(g.cerca).length - 1;
  if (quante !== 1) {
    console.log('  BANCO  guasto ' + g.n + ': ancoraggio trovato ' + quante + ' volte, non si puo\' rompere niente');
    male++; righe.push({ n: g.n, nome: g.nome, esito: 'ANCORAGGIO' }); continue;
  }
  const file = path.join(DOVE, 'rotto-' + g.n + '.html');
  fs.writeFileSync(file, SORGENTE.replace(g.cerca, g.metti));
  const t0 = Date.now();
  const r = corri(file);
  const sec = ((Date.now() - t0) / 1000).toFixed(0);
  const ro = rossi(r.verdetti);
  /* si pretende: uscita 1 (rosso) E i casi previsti fra i rossi */
  const mancanti = g.attesi.filter(a => !ro.includes(a));
  const ok = r.codice === 1 && mancanti.length === 0;
  if (!ok) male++;
  console.log((ok ? '  OK   ' : '  NO   ') + 'guasto ' + g.n + ': ' + g.nome);
  console.log('         ' + g.perche);
  console.log('         il cancello esce ' + r.codice + ' e diventa rosso sui casi [' + ro.join(', ') + ']' +
    '; attesi almeno [' + g.attesi.join(', ') + ']' + (mancanti.length ? ' — MANCANO [' + mancanti.join(', ') + ']' : '') +
    '  (' + sec + ' s)');
  righe.push({ n: g.n, nome: g.nome, esito: ok ? 'rosso come previsto' : 'NON ha fatto rosso', rossi: ro });
}

/* --- 6. il controllo al contrario: con la toppa, il caso 11 diventa OK  */
if (!SOLO || SOLO === '6') {
  const conToppa = path.join(DOVE, 'con-toppa.html');
  const t = spawnSync(process.execPath, [path.join(__dirname, '_toppa-salvataggio.js'), GIOCO, conToppa],
    { cwd: RADICE, encoding: 'utf8', timeout: 120000, windowsHide: true });
  if (t.status !== 0) {
    console.log('  NO   toppa: non si e\' applicata — ' + ((t.stdout || '') + (t.stderr || '')).trim());
    male++;
  } else {
    const t0 = Date.now();
    const r = corri(conToppa);
    const sec = ((Date.now() - t0) / 1000).toFixed(0);
    const ok = r.codice === 0 && r.verdetti[11] === 'OK' && rossi(r.verdetti).length === 0;
    if (!ok) male++;
    console.log((ok ? '  OK   ' : '  NO   ') + 'controllo al contrario: con la toppa il caso 11 diventa verde');
    console.log('         il cancello esce ' + r.codice + ', caso 11 = ' + r.verdetti[11] +
      ', rossi [' + rossi(r.verdetti).join(', ') + ']  (' + sec + ' s)');
    righe.push({ n: 6, nome: 'la toppa chiude il caso 11', esito: ok ? 'verde come previsto' : 'la toppa NON basta' });
  }
}

/* --- il gioco del repo non e' stato toccato: si dimostra ------------- */
const IMPRONTA_DOPO = md5(GIOCO);
const intatto = IMPRONTA_PRIMA === IMPRONTA_DOPO;
if (!intatto) male++;
console.log((intatto ? '  OK   ' : '  NO   ') + 'il gioco del repo e\' intatto: md5 ' + IMPRONTA_DOPO.slice(0, 12) +
  (intatto ? ' (identico a prima)' : ' DIVERSO da ' + IMPRONTA_PRIMA.slice(0, 12)));

const tot = righe.length + 1;
console.log('\n' + tot + ' controlli, ' + (tot - male) + ' passati, ' + male + ' falliti');
if (male) process.exit(1);
process.exit(0);
