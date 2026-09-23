/* =====================================================================
   _q-rete-falsi.js — I CINQUE FALSI CHE CONDANNANO IL METRO DELLA RETE
   (voce #145, compito 1)

   PERCHE' ESISTE. Un metro che misura la rete puo' mentire in cinque
   modi, e tutti e cinque stampano referti coerenti, ben formattati e
   senza una riga che contraddica un'altra:

     1) DICHIARA VERDE CON DUE CAMPIONI. Due misure buone, un pomeriggio
        di prove, e quel numero finisce in una decisione.
     2) MISURA LA PROPRIA MACCHINA. Un giro su loopback ha una
        distribuzione piu' pulita di qualunque rete vera: solo la
        sorgente lo tradisce.
     3) TOGLIE IL 5% PEGGIORE. Si chiama «togliere gli outlier» e ha un
        nome rispettabile — ma la coda e' tutto cio' che decide se un
        lockstep si puo' giocare.
     4) DIMEZZA IL RELAY. L'errore che sembra rigore: «era un
        round-trip». Su un relay l'eco misura gia' le due gambe giuste.
     5) CONTA SOLO CHI E' TORNATO. Perdita 0,0% su una rete che ne
        perde il 12, e i persi non sono pescati a caso: sono i piu'
        lenti.

   QUATTORDICI cantieri di fila in questa casa hanno pagato la stessa
   lezione, e il #144 ha scoperto che senza una prova aggiunta il suo
   banco promuoveva DUE falsi su cinque. Percio' i cinque qui sotto
   sono costruiti nel CASO PEGGIORE: nessuno fa la cosa ovvia, ognuno
   lascia intatte le porte che non gli servono, e ognuno porta scritto
   nel proprio file quale prova deve farlo cadere.

   E C'E' IL CONTROLLO POSITIVO, che e' la meta' che manca a quasi tutti
   i banchi di falsi: prima si verifica che il metro ONESTO passi tutte
   e dieci le prove. Senza, un metro rotto in modo da essere rosso
   SEMPRE «condannerebbe» tutti e cinque i falsi senza discriminare
   niente — ed e' esattamente il modo in cui un banco di falsi diventa
   a sua volta un attestatore.

   uso:  node strumenti/_q-rete-falsi.js
   esce  0 se il metro onesto passa e ogni falso e' morso dalla prova
         che dichiara · 1 se un falso scappa · 2 se il banco e' esploso
   ===================================================================== */
const path = require('path');
const { spawnSync } = require('child_process');

const RADICE = path.resolve(__dirname, '..');
const FALSI = ['_crit-rete-due-campioni.js', '_crit-rete-locale.js', '_crit-rete-potatore.js',
               '_crit-rete-mezzo-giro.js', '_crit-rete-sordo.js'];
const PROVE = ['0a', '0b', '0c', '0d', '0e', '0f', '0g', '0h', '0i', '0j'];

function corri(bugia) {
  const a = ['strumenti/_q-rete-latenza.js'];
  if (bugia) a.push('--bugia', 'strumenti/' + bugia);
  const r = spawnSync(process.execPath, a, { cwd: RADICE, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  return { uscita: r.status, testo: (r.stdout || '') + (r.stderr || '') };
}

/* legge l'esito di una prova dal referto: «  OK  0a) ...» */
function prova(testo, sigla) {
  const m = testo.match(new RegExp('^\\s*(OK|NO)\\s+' + sigla + '\\)', 'm'));
  return m ? m[1] : '—';
}

const esiti = [];
const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '\n        ' + det : '')); };

/* =================================================== 0) IL CONTROLLO
   POSITIVO. Il metro onesto deve passare tutte e dieci le prove del
   metro. (La prova 1a — il deposito — puo' essere rossa: e' il rosso
   con cui il cancello nasce, e non riguarda il metro.) */
console.log('IL BANCO DEI FALSI — metro della rete (voce #145)\n');
console.log('0) IL CONTROLLO POSITIVO — il metro onesto passa tutte e dieci le prove?\n');
const onesto = corri(null);
if (onesto.uscita === 2) {
  console.log('  Il cancello onesto e\' ESPLOSO. Il banco dei falsi non puo\' misurare niente.');
  console.log(onesto.testo.split('\n').slice(-12).join('\n'));
  process.exit(2);
}
const oneste = PROVE.map(s => [s, prova(onesto.testo, s)]);
const oneste_no = oneste.filter(([, e]) => e !== 'OK');
di(oneste_no.length === 0, 'il metro onesto passa le dieci prove',
   oneste.map(([s, e]) => s + ':' + e).join(' '));
if (oneste_no.length) {
  console.log('\n>>> IL METRO ONESTO NON PASSA (' + oneste_no.map(([s]) => s).join(', ') + ').');
  console.log('    Un banco di falsi su un metro rotto condanna tutti senza discriminare nessuno:');
  console.log('    i suoi verdi non proverebbero niente. Si ripara il metro, poi si torna qui.');
  process.exit(1);
}

/* ===================================================== 1) I CINQUE FALSI */
console.log('\n1) I CINQUE FALSI — ognuno dev\'essere MORSO, e dalla prova che il suo file dichiara\n');
let scappati = 0;
for (const f of FALSI) {
  const m = require(path.join(__dirname, f));
  const r = corri(f);
  const atteso = m.morde[0];
  const esito = prova(r.testo, atteso);
  const morso = esito === 'NO';
  const rosso = r.uscita === 1;
  if (!morso || !rosso) scappati++;
  di(morso && rosso, m.nome + ' — deve cadere sulla prova ' + atteso,
     'prova ' + atteso + ': ' + esito + ' · uscita ' + r.uscita + '\n        ' + m.descrizione);
  /* si stampa anche COME sono andate le altre nove: un falso morso
     dalla prova sbagliata e' un falso morso per caso, e va saputo.
     Un falso morso da PIU' prove non e' un difetto del banco: e' una
     bugia che lascia piu' di un'impronta, e dirlo e' piu' onesto che
     tacerlo. */
  const altre = PROVE.filter(x => x !== atteso).map(x => x + ':' + prova(r.testo, x));
  const altreNo = altre.filter(x => /:NO$/.test(x));
  console.log('        altre prove -> ' + altre.join(' ') +
              (altreNo.length ? '\n        (morso anche da ' + altreNo.map(x => x.split(':')[0]).join(', ') + ')' : ''));
}

const rossi = esiti.filter(x => !x).length;
console.log('\n' + esiti.length + ' controlli, ' + (esiti.length - rossi) + ' passati, ' + rossi + ' falliti');
if (scappati) {
  console.log('\n>>> ' + scappati + ' FALSI SONO SCAPPATI. Il metro della rete non discrimina: attesta.');
  console.log('    Un banco che non sa condannare una bugia costruita apposta non sa nemmeno');
  console.log('    riconoscere la verita\', e i suoi numeri non vanno trascritti da nessuna parte.');
  process.exit(1);
}
console.log('\n>>> I CINQUE FALSI SONO TUTTI MORSI, e ognuno dalla prova che il suo file dichiara.');
console.log('    Il metro della rete discrimina invece di attestare.');
process.exit(0);
