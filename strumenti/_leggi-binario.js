/* =====================================================================
   _leggi-binario.js — le stringhe leggibili dentro un file binario, e i
   loro raggruppamenti.

   PERCHE' ESISTE. Per capire com'e' fatto un gioco concorrente si guarda
   il suo pacchetto: i nomi dei parametri, dei sistemi e delle risorse
   che il motore porta con se' dicono quali meccaniche esistono. E' la
   stessa cosa che fa chi smonta un orologio per capire come funziona.
   NON serve a copiare: il mandato di questo progetto dice «senza
   copyright», e copiare codice o materiali altrui sarebbe l'opposto del
   lavoro fatto finora. Si guarda per SAPERE DOVE SI E', non per prendere.

   `strings` non esiste su questo banco (Git Bash su Windows), e su un
   file da 116 MB non si puo' leggere tutto in memoria: qui si scorre a
   blocchi, si tengono le sequenze stampabili lunghe almeno --min, e si
   filtra mentre si legge.

   uso:
     node strumenti/_leggi-binario.js --file X.so --cerca "shot,pass,tackle"
     node strumenti/_leggi-binario.js --file X.so --cerca dribble --contesto
     node strumenti/_leggi-binario.js --file X.so --tutte --out fuori/s.txt
     node strumenti/_leggi-binario.js --file X.so --famiglie
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;

const FILE = arg('file', '');
if (!FILE || !fs.existsSync(FILE)) { console.error('serve --file <percorso esistente>'); process.exit(1); }
const MIN = parseInt(arg('min', '6'), 10);
const CERCA = arg('cerca', '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
const TUTTE = haFlag('tutte');
const FAMIGLIE = haFlag('famiglie');
const OUT = arg('out', '');
const MAX = parseInt(arg('max', '400'), 10);

/* le famiglie di parole che dicono a che cosa serve un pezzo di motore.
   Sono domande, non risposte: se una famiglia non compare mai, quella
   cosa nel motore non ha un nome — ed e' un'informazione anche quella. */
const FAM = {
  'tiro e conclusione': ['shot', 'shoot', 'finesse', 'volley', 'chip', 'lob', 'header', 'strike'],
  'passaggio': ['pass', 'through', 'cross', 'lofted', 'ground_pass', 'throughball'],
  'dribbling e finte': ['dribble', 'skill', 'feint', 'stepover', 'roulette', 'nutmeg', 'agility'],
  'difesa e contrasto': ['tackle', 'slide', 'block', 'intercept', 'press', 'jockey', 'contain', 'marking'],
  'portiere': ['keeper', 'goalie', 'gk_', 'save', 'dive', 'punch', 'parry'],
  'fisica del pallone': ['ball_physics', 'friction', 'bounce', 'spin', 'magnus', 'drag', 'trajectory'],
  'stamina e stato': ['stamina', 'fatigue', 'fitness', 'injur', 'morale', 'form'],
  'regole': ['offside', 'foul', 'card', 'yellow', 'red_card', 'penalty', 'corner', 'freekick', 'throwin', 'var_', 'referee'],
  'tattica': ['formation', 'tactic', 'mentality', 'pressure', 'width', 'depth', 'lineup', 'instruction'],
  'animazione': ['anim', 'blend', 'ik_', 'ragdoll', 'mocap', 'skeleton', 'rig_'],
  'grafica': ['shader', 'lod_', 'shadow', 'bloom', 'ssao', 'texture', 'lightmap', 'postfx'],
  'telecamera': ['camera', 'fov', 'broadcast_cam', 'cinematic'],
  'audio': ['commentar', 'crowd', 'chant', 'audio_', 'sfx', 'vo_'],
  'rete e conto': ['server', 'session', 'auth', 'token', 'sync', 'matchmak', 'latency', 'rollback'],
  'economia': ['currency', 'gem', 'coin', 'store', 'purchase', 'iap', 'bundle', 'pack_', 'reward'],
  'progressione': ['xp_', 'level', 'rank', 'season_pass', 'objective', 'quest', 'mission'],
  'carte e rosa': ['squad', 'roster', 'card_', 'ovr', 'rating', 'chemistry', 'rank_up', 'train'],
  'pubblicita': ['applovin', 'tapjoy', 'admob', 'adview', 'rewarded', 'interstitial', 'ironsource'],
  'telemetria': ['telemetry', 'analytics', 'tracking', 'crashlytics', 'firebase', 'pinpoint'],
};

const STAMPABILE = b => (b >= 0x20 && b <= 0x7e);
const BLOCCO = 8 * 1024 * 1024;

function scorri(cb) {
  const fd = fs.openSync(FILE, 'r');
  const buf = Buffer.alloc(BLOCCO);
  let coda = '';
  let pos = 0;
  for (;;) {
    const n = fs.readSync(fd, buf, 0, BLOCCO, pos);
    if (n <= 0) break;
    let cur = coda; coda = '';
    for (let i = 0; i < n; i++) {
      const b = buf[i];
      if (STAMPABILE(b)) cur += String.fromCharCode(b);
      else { if (cur.length >= MIN) cb(cur); cur = ''; }
    }
    /* la coda puo' proseguire nel blocco successivo */
    coda = cur;
    pos += n;
  }
  if (coda.length >= MIN) cb(coda);
  fs.closeSync(fd);
}

const conta = new Map();
let totali = 0;
const raccolte = [];

scorri(s => {
  totali++;
  if (TUTTE) { raccolte.push(s); return; }
  const b = s.toLowerCase();
  if (FAMIGLIE) {
    for (const [fam, chiavi] of Object.entries(FAM)) {
      for (const k of chiavi) {
        if (b.includes(k)) {
          if (!conta.has(fam)) conta.set(fam, { n: 0, esempi: new Set() });
          const e = conta.get(fam);
          e.n++;
          if (e.esempi.size < 14 && s.length < 90) e.esempi.add(s);
          break;
        }
      }
    }
    return;
  }
  if (CERCA.length && CERCA.some(k => b.includes(k))) raccolte.push(s);
});

console.log('file: ' + FILE + '  (' + fs.statSync(FILE).size.toLocaleString('it-IT') + ' byte)');
console.log('sequenze leggibili di almeno ' + MIN + ' caratteri: ' + totali.toLocaleString('it-IT'));

if (FAMIGLIE) {
  console.log('\n=== LE FAMIGLIE, e quante volte il motore le nomina ===');
  const righe = [...conta.entries()].sort((a, b) => b[1].n - a[1].n);
  for (const [fam, e] of righe) {
    console.log('\n' + fam.toUpperCase() + '  —  ' + e.n.toLocaleString('it-IT') + ' occorrenze');
    for (const x of [...e.esempi].slice(0, 12)) console.log('    ' + x);
  }
  const mute = Object.keys(FAM).filter(f => !conta.has(f));
  if (mute.length) console.log('\nFAMIGLIE MAI NOMINATE: ' + mute.join(', '));
} else if (OUT) {
  fs.writeFileSync(OUT, raccolte.join('\n'));
  console.log('scritte ' + raccolte.length.toLocaleString('it-IT') + ' righe in ' + OUT);
} else {
  const viste = new Set();
  let n = 0;
  for (const s of raccolte) {
    if (viste.has(s)) continue;
    viste.add(s);
    console.log('  ' + s);
    if (++n >= MAX) { console.log('  ... e altre ' + (raccolte.length - n) + ' (usa --out per averle tutte)'); break; }
  }
  if (!n) console.log('  nessuna corrispondenza');
}
