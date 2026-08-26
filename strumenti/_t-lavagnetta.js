/* =====================================================================
   _t-lavagnetta.js — LA LAVAGNETTA DICE TUTTO QUELLO CHE IL SALDO
   INCASSA (26 agosto 2026).

   IL DIFETTO, dal censimento del 20 agosto (§3.5.1 voce 8: «la
   ripartizione delle monete non torna col saldo, +46 elencati e saldo
   176») e MISURATO oggi prima di toccare una riga — 14 partite a semi
   20260803..20260816, fuori/_prova-monete.js:

     partite in cui il conto non torna:  4 su 14
       p0   righe  40   incasso vero 120
       p2   righe  64   incasso vero 124
       p6   righe  78   incasso vero 138
       p7   righe  55   incasso vero 105

   Il giocatore legge una lavagnetta che elenca quaranta monete e vede il
   saldo salire di centoventi. Le ottanta che mancano ci sono davvero —
   sono i premi dei TROFEI — ma sono pagate DOPO che la somma e' stata
   fatta, e la lavagnetta non le vede. Fra un premio non dato e un premio
   dato di nascosto il secondo e' meno grave, ma non e' meno sbagliato:
   la lavagnetta di fine partita e' il posto in cui questo gioco spiega
   il suo patto con chi gioca, ed e' l'ultimo posto dove i conti possono
   non tornare.

   L'ORDINE DEL CODICE, che e' tutta la storia (applyMatchRewards):
     1. si costruisce l'elenco `br` voce per voce
     2. `let gain=0; for(const b of br) gain+=b[1];`  <-- la somma
     3. `addCoinsInternal(gain)`                      <-- si paga
     4. `unlockAch('golden')`, `unlockAch('cleansheet')`, ... ognuno dei
        quali fa `addCoinsInternal(a.premio)`         <-- si paga ANCORA
     5. `return { br, gain, saldo:SAVE.coins }`       <-- saldo aggiornato,
                                                          elenco no
   Lo stesso vale per il premio del titolo e del podio, pagati dentro
   chiudiGiornata al passo 1.

   LA CURA, e non sposta un centesimo: i premi restano pagati dove sono
   pagati, ma si ANNUNCIANO. addCoinsInternal prende un'etichetta
   facoltativa; se un elenco di raccolta e' aperto (G._brExtra, che vive
   solo dentro applyMatchRewards) la riga ci finisce dentro. Alla fine le
   righe raccolte entrano in `br` e nel totale, e il conto torna per
   costruzione: la lavagnetta somma esattamente quello che il saldo ha
   incassato.

   Chi chiama addCoinsInternal senza etichetta — la somma del passo 3,
   gli acquisti del negozio, il prezzo dei campi — non registra niente e
   si comporta come ieri, al bit.

   Cancello: strumenti/_q-meta.js (tre controlli nuovi sul conto).
   uso:  node strumenti/_t-lavagnetta.js --out fuori/lavagnetta.html
         node strumenti/_t-lavagnetta.js --dentro
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;

const ANCORE = [

{
  nome: '1/5 addCoinsInternal accetta un\'etichetta e la annuncia',
  cerca:
`/* monete: variazione interna + trofeo salvadanaio */
function addCoinsInternal(n){
  SAVE.coins=Math.max(0,(SAVE.coins|0)+(n|0));`,
  metti:
`/* monete: variazione interna + trofeo salvadanaio.

   L'ETICHETTA FACOLTATIVA (26 ago 2026). Chi paga durante il conto di
   fine partita puo' dire COME SI CHIAMA quello che sta pagando: se
   applyMatchRewards ha aperto la raccolta (G._brExtra), la riga finisce
   nella lavagnetta insieme a tutte le altre. Serviva perche' i premi dei
   trofei e quelli di stagione si pagano FUORI dalla somma dell'elenco —
   misurato: 4 partite su 14 mostravano quaranta monete e ne incassavano
   centoventi. Chi non passa l'etichetta (la somma stessa, gli acquisti,
   il prezzo dei campi) non registra niente e si comporta come ieri. */
function addCoinsInternal(n, etichetta){
  if(etichetta && (n|0)>0 && Array.isArray(G._brExtra)) G._brExtra.push([etichetta, n|0]);
  SAVE.coins=Math.max(0,(SAVE.coins|0)+(n|0));`,
},

{
  nome: '2/5 la raccolta si apre in cima ad applyMatchRewards',
  cerca:
`function applyMatchRewards(){
  if(G.cpu[0]) return null;              // QA cpu-vs-cpu: niente ricompense
  const won = G.score[0]>G.score[1];`,
  metti:
`function applyMatchRewards(){
  if(G.cpu[0]) return null;              // QA cpu-vs-cpu: niente ricompense
  /* LA RACCOLTA DEI PREMI FUORI ELENCO (26 ago 2026): da qui fino al
     return, chi paga con un'etichetta finisce nella lavagnetta. Vive
     solo dentro questa funzione — fuori di qui e' null e nessuno
     registra niente. */
  G._brExtra = [];
  const won = G.score[0]>G.score[1];`,
},

{
  nome: '3/5 le righe raccolte entrano nell\'elenco e nel totale',
  cerca:
`  persistSave();
  return { br, gain, saldo:SAVE.coins };
}`,
  metti:
`  /* I PREMI RACCOLTI ENTRANO NELLA LAVAGNETTA. Sono gia' stati PAGATI da
     chi li ha vinti (unlockAch, il titolo, il podio): qui si aggiungono
     all'elenco e al totale perche' il conto torni. Da questa riga in poi
     somma(br) === gain === variazione vera del saldo, per costruzione. */
  if(Array.isArray(G._brExtra)){
    for(const x of G._brExtra){ br.push(x); gain+=x[1]; }
    G._brExtra = null;
  }
  persistSave();
  return { br, gain, saldo:SAVE.coins };
}`,
},

{
  nome: '4/5 il trofeo dice il proprio nome',
  cerca:
`  if(a.premio) addCoinsInternal(a.premio);`,
  metti:
`  if(a.premio) addCoinsInternal(a.premio, 'Trofeo: '+a.nome);`,
},

{
  nome: '5/5 il titolo e il podio dicono il proprio nome',
  cerca:
`      addCoinsInternal(SEA_TITOLO);
      SAVE.stats.stagioni=(SAVE.stats.stagioni|0)+1;`,
  metti:
`      addCoinsInternal(SEA_TITOLO, 'Titolo di campione');
      SAVE.stats.stagioni=(SAVE.stats.stagioni|0)+1;`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-lavagnetta.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.lavagnetta.html';
outFile = path.resolve(RADICE, outFile);
if (!dentro && outFile === inFile) { console.error('FALLITO: --out coincide con --in.'); process.exit(2); }

const src = fs.readFileSync(inFile, 'utf8');
let out = src;
const mancanti = [];
for (const a of ANCORE) {
  const n = out.split(a.cerca).length - 1;
  if (n !== 1) { mancanti.push({ nome: a.nome, n }); continue; }
  out = out.replace(a.cerca, a.metti);
}
if (mancanti.length) {
  console.error('FALLITO: ancoraggi non trovati esattamente una volta.');
  for (const m of mancanti) console.error('  · ' + m.nome + ': trovato ' + m.n + ' volte');
  process.exit(1);
}
const attesi = [
  ['function addCoinsInternal(n, etichetta){', 1],
  ['G._brExtra = [];', 1],
  ['for(const x of G._brExtra){ br.push(x); gain+=x[1]; }', 1],
  ["addCoinsInternal(a.premio, 'Trofeo: '+a.nome);", 1],
  ["addCoinsInternal(SEA_TITOLO, 'Titolo di campione');", 1],
  ['function addCoinsInternal(n){', 0],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
