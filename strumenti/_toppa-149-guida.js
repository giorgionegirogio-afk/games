/* =====================================================================
   _toppa-149-guida.js — LA GUIDA VERA, APERTA AL BANCO
   (voce #149, compito 3)

   PERCHE'. Il cancello E1 di `_q-dischetto` contava le richieste
   pedalando `battito()` a mano e le convertiva in «al minuto»
   moltiplicando per `DISCHETTO_SEC_TIRO = 10` — un numero che nel gioco
   NON SCANDISCE NIENTE. Il ritmo vero della rete lo decide
   `Dischetto.ritmo()` (900 ms, 2200 quando la rete e' dichiarata lenta),
   e la guida che lo usa parte dai due bottoni (`dammiCodice`,
   `usaCodice`), non da `crea`/`entra`: percio' nei banchi non girava
   mai, e il numero verbalizzato (33-36 richieste/min) era il ritmo del
   BANCO travestito da ritmo del gioco.

   UN BANCO CHE ASPETTA UN OROLOGIO MISURA L'OROLOGIO — la regola di
   casa, scritta accanto a `giro()` — RESTA VERA per il protocollo: le
   prove del protocollo continuano a pedalare `battito()` a mano. Ma la
   domanda di E1 E' l'orologio: «quante richieste al minuto fa questo
   gioco quando lo guida se stesso». A quella domanda si risponde solo
   lasciandolo guidare.

   Percio' `__test.dischetto` apre le tre porte della guida —
   `avviaGuida`, `fermaGuida`, `ritmo` — e non una riga di piu': nessun
   comportamento del gioco cambia, cambia che il banco puo' chiedere al
   gioco il proprio orologio invece di inventarne uno.

   uso:  node strumenti/_toppa-149-guida.js [file.html]
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const FILE = process.argv[2] ? path.resolve(RADICE, process.argv[2])
                             : path.join(RADICE, 'CALCETTO-il-gioco.html');
if (!fs.existsSync(FILE)) { console.error('TOPPA NON APPLICATA: ' + FILE + ' non esiste'); process.exit(1); }

const A = `      battito: () => Dischetto.battito(),
      ridipingi: () => Dischetto.ridipingi(),
      mostra: () => Dischetto.mostra(),`;
const B = `      battito: () => Dischetto.battito(),
      ridipingi: () => Dischetto.ridipingi(),
      mostra: () => Dischetto.mostra(),
      /* LA GUIDA VERA (voce #149). battito() a mano misura il
         PROTOCOLLO; queste tre misurano il RITMO, che e' un'altra
         domanda e vuole l'orologio del gioco invece di quello del
         banco. avviaGuida parte dai due bottoni e non da crea/entra:
         senza queste porte nessun banco l'ha mai vista girare, e le
         richieste al minuto di _q-dischetto E1 erano il ritmo del banco
         moltiplicato per una costante che non scandisce niente. */
      avviaGuida: () => Dischetto.avviaGuida(),
      fermaGuida: () => Dischetto.fermaGuida(),
      ritmo: () => Dischetto.ritmo(),
      /* quanti battiti sono stati dati da quando la pagina e' aperta. E' il
         denominatore dell'unica misura del ritmo che non dipende dal carico
         della macchina: RICHIESTE PER BATTITO. Le richieste al minuto si
         ricavano da quella e da ritmo(), cioe' dall'orologio del gioco. */
      battiti: () => Dischetto.battiti | 0,`;

let t = fs.readFileSync(FILE, 'utf8');
const n = t.split(A).length - 1;
if (n !== 1) { console.error('TOPPA NON APPLICATA: ancoraggio trovato ' + n + ' volte (ne serve 1)'); process.exit(1); }
t = t.replace(A, B);
for (const [k, q] of [['avviaGuida: () => Dischetto.avviaGuida(),', 1],
                      ['ritmo: () => Dischetto.ritmo(),', 1],
                      ['battiti: () => Dischetto.battiti | 0,', 1]]) {
  if (t.split(k).length - 1 !== q) { console.error('TOPPA NON APPLICATA: «' + k + '» compare male'); process.exit(1); }
}
fs.writeFileSync(FILE, t);
console.log('toppa applicata: la guida vera aperta al banco in ' + path.relative(RADICE, FILE));
