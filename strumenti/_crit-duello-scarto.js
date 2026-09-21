/* =====================================================================
   _crit-duello-scarto.js — IL FALSO CHE IL GIOCO NON SOPRAVVIVE
   (voce #131, compito 5: il mutante che condanna il banco).

   PERCHE' NE SERVIVA UN SECONDO, e la scoperta che l'ha imposto.

   Il primo mutante (_crit-duello-passo.js) sposta il gancio
   Reg.passoDuello() di un fotogramma: tutti i comandi del duello
   arrivano un aggiornamento piu' tardi. Sembrava il falso peggiore, e il
   dossier #131 lo dava per tale. MISURATO: non lo e'. Il gioco lo
   sopravvive, esito per esito e cursore alla quinta cifra.

   LA RAGIONE, ed e' una proprieta' vera del duello che vale la pena
   scrivere. pickZone AZZERA il cursore (:22344, `this.cursor=0`). Quindi
   il cursore che stopPower legge non dipende da QUANDO i due comandi
   cadono, ma solo da QUANTI aggiornamenti stanno FRA l'uno e l'altro.
   Uno spostamento UNIFORME sposta tutti e due e l'intervallo resta
   quello: 15 aggiornamenti prima, 15 dopo, cursore 0,2875 in tutti e due
   i casi. Il falso si cancella da solo.

   IL FALSO CHE NON SI CANCELLA e' quello che il dossier aveva davvero
   misurato, e che la parola «gancio» aveva confuso: spostare stopPower
   DA SOLO di un aggiornamento (dossier #131, «SENSIBILITA': spostare
   stopPower di 1 aggiornamento cambia 6/132 esiti»). Li' l'intervallo
   cambia davvero: 16 aggiornamenti invece di 15, cursore 0,30667 invece
   di 0,2875, cioe' fra il 10% e il 20% della banda.

   E' anche il difetto piu' plausibile di una rilettura vera: basta un
   verbo trattato con una guardia diversa dagli altri.

   uso:  node strumenti/_crit-duello-scarto.js
         node strumenti/_crit-duello-scarto.js --out fuori/crit-duello-scarto.html
   poi:  node strumenti/_t-duello-rigioca.js  (lo costruisce e pretende che diverga)
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = path.resolve(RADICE, arg('out', 'fuori/crit-duello-scarto.html'));

const CERCA = `      if(r[3] !== Duel.nDuello || r[4] >= p) break;`;
const METTI =
`      /* IL FALSO: il solo stopPower (verbo 1) rimesso in scena un
         aggiornamento piu' tardi degli altri. L'intervallo fra la mira e
         la barra cambia di uno, e con lui il cursore. */
      if(r[3] !== Duel.nDuello || (r[5] === 1 ? r[4] + 1 : r[4]) >= p) break;`;

const src = fs.readFileSync(inFile, 'utf8');
const n = src.split(CERCA).length - 1;
if (n !== 1) {
  console.error('FALLITO: l\'ancora della guardia non si trova esattamente una volta (trovata ' + n + ').');
  if (n === 0) console.error('  Prima del compito 5 e\' NORMALE: il ramo di rilettura di passoDuello non esiste ancora.');
  process.exit(1);
}
const out = src.replace(CERCA, METTI);
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  mutante costruito: stopPower e\' rimesso in scena UN aggiornamento dopo gli altri');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
console.log('    DEVE far divergere la riproduzione. Un verde qui vorrebbe dire che il banco non discrimina.');
