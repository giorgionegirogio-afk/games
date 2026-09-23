/* =====================================================================
   _q-ritardo-falsi.js — I TRE FALSI CHE CONDANNANO IL METRO
   (voce #141, compito 4)

   PERCHE' ESISTE. Un banco che misura il danno del ritardo puo' mentire
   in tre modi, e tutti e tre stampano numeri plausibili:

     1) LA TRASLAZIONE NON TRASLA. Muove righe che nessuno legge, la
        partita resta identica, e il banco conclude che il gioco e'
        insensibile al ritardo — cioe' dice SI al lockstep per il motivo
        sbagliato.
     2) LA TRASLAZIONE RISPARMIA I VERBI. Ritarda la levetta e non
        l'atto: la curva del danno esce plausibile e vale un terzo di
        quella vera.
     3) LA MISURA GUARDA DALLA PARTE SBAGLIATA. Legge i numeri della CPU
        al posto di quelli della squadra comandata: sono numeri veri, in
        una partita vera, e non mostrano danno perche' la CPU non e'
        ritardata.

   Dieci cantieri di fila in questa casa hanno pagato la stessa lezione
   in revisione, e il #140 ha trovato un falso che passava TUTTE E 57 le
   prove. Percio' i tre falsi qui sotto sono costruiti nel CASO PEGGIORE:
   non fanno la cosa ovvia, fanno quella che sopravvive. Ognuno porta
   scritto nel suo file quale prova deve farlo cadere.

   E C'E' UN CONTROLLO POSITIVO, che e' la meta' che manca a quasi tutti
   i banchi di falsi: prima si verifica che il banco ONESTO passi le tre
   prove strutturali. Senza, un banco rotto in modo da essere rosso
   SEMPRE «condannerebbe» tutti e tre i falsi senza discriminare niente,
   ed e' esattamente il modo in cui un banco di falsi diventa a sua volta
   un attestatore.

   uso:  node strumenti/_q-ritardo-falsi.js
         node strumenti/_q-ritardo-falsi.js --nastri 6 --tetto 2700
   esce 0 se il banco onesto passa e tutti i falsi vengono morsi dalla
   prova giusta, 1 se un falso passa (ed e' il rosso che conta), 2 se il
   banco dei falsi e' esploso.
   ===================================================================== */
const path = require('path');
const { spawnSync } = require('child_process');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const NASTRI = arg('nastri', '6');
const TETTO = arg('tetto', '2700');
const PAGINE = arg('pagine', '3');

const FALSI = ['_crit-traslazione-sorda.js', '_crit-traslazione-cieca.js', '_crit-ritardo-attestatore.js'];

function corri(bugia) {
  const a = ['strumenti/_q-ritardo.js', '--nastri', NASTRI, '--tetto', TETTO,
             '--k', '0,18', '--pagine', PAGINE];
  if (bugia) a.push('--bugia', 'strumenti/' + bugia);
  const r = spawnSync(process.execPath, a, { cwd: RADICE, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return { uscita: r.status, testo: (r.stdout || '') + (r.stderr || '') };
}

/* legge l'esito di una prova strutturale dal referto: «OK  0a) ...» */
function prova(testo, sigla) {
  const re = new RegExp('^\\s*(OK|NO)\\s+' + sigla + '\\)', 'm');
  const m = testo.match(re);
  return m ? m[1] : '—';
}

const esiti = [];
const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '  [' + det + ']' : '')); };

console.log('=== I TRE FALSI CHE CONDANNANO IL METRO DEL RITARDO ===');
console.log('    ' + NASTRI + ' nastri, tetto ' + TETTO + ' tick, K = 0 e 18\n');

/* ---------------------------------------------- il controllo positivo */
console.log('0) IL CONTROLLO POSITIVO — il banco ONESTO passa le tre prove strutturali');
console.log('   (senza questo, un banco rosso sempre «condannerebbe» tutti i falsi e non');
console.log('    discriminerebbe niente: e\' il modo in cui un banco di falsi diventa un attestatore)');
const onesto = corri(null);
const s0a = prova(onesto.testo, '0a'), s0b = prova(onesto.testo, '0b'), s0c = prova(onesto.testo, '0c');
di(s0a === 'OK', 'onesto: 0a la traslazione trasla davvero', s0a);
di(s0b === 'OK', 'onesto: 0b il metro varia fra partite diverse', s0b);
di(s0c === 'OK', 'onesto: 0c il controllo negativo morde', s0c);
/* l'onesto puo' uscire 3 (campione corto: qui i nastri sono pochi apposta,
   per non far durare il banco dei falsi mezz'ora) ma non deve MAI uscire 2:
   il 2 vuol dire che una delle tre prove strutturali e' scattata. */
di(onesto.uscita !== 2, 'onesto: non esce 2 (banco esploso)', 'uscita ' + onesto.uscita);
console.log('');

if (esiti.some(x => !x)) {
  console.log('IL BANCO ONESTO NON PASSA LE SUE PROVE: non si puo\' giudicare nessun falso con');
  console.log('un metro che gia\' non regge se stesso. Riparare prima quello.');
  process.exit(2);
}

/* ------------------------------------------------------- e i tre falsi */
console.log('1) I FALSI — ognuno deve essere MORSO, e dalla prova che il suo file dichiara\n');
let scappati = 0;
for (const f of FALSI) {
  const m = require(path.join(__dirname, f));
  const r = corri(f);
  const atteso = m.morde[0];
  const esito = prova(r.testo, atteso);
  const morso = esito === 'NO';
  const rosso = r.uscita !== 0;
  if (!morso || !rosso) scappati++;
  di(morso && rosso, m.nome + ' — deve cadere sulla prova ' + atteso,
     'prova ' + atteso + ': ' + esito + ', uscita ' + r.uscita + ' · ' + m.descrizione);
  /* si stampa anche COME sono andate le altre due prove: un falso morso
     dalla prova sbagliata e' un falso morso per caso, e va saputo */
  const altre = ['0a', '0b', '0c'].filter(x => x !== atteso).map(x => x + ':' + prova(r.testo, x));
  console.log('        altre prove -> ' + altre.join(' '));
}

const rossi = esiti.filter(x => !x).length;
console.log('\n' + esiti.length + ' controlli, ' + (esiti.length - rossi) + ' passati, ' + rossi + ' falliti');
if (scappati) {
  console.log('\n>>> ' + scappati + ' FALSI SONO SCAPPATI. Il metro del ritardo non discrimina: attesta.');
  console.log('    Un banco che non sa condannare una bugia costruita apposta non sa nemmeno');
  console.log('    riconoscere la verita\', e i suoi numeri non vanno trascritti da nessuna parte.');
  process.exit(1);
}
console.log('\n>>> I TRE FALSI SONO TUTTI MORSI, e ognuno dalla prova che il suo file dichiara.');
console.log('    Il metro del ritardo discrimina invece di attestare.');
process.exit(0);
