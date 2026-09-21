/* =====================================================================
   _toppa-duello-motorev.js — LA MISURA ACCANTO AL NUMERO
   (voce #131, compito 6). Due ancore, nessuna riga di codice: si
   scrivono nel sorgente la decisione su MOTORE_V e la misura che la
   regge, e si rettifica a edizioni il verbale del controllo `incompleto`.

   PERCHE' UNA TOPPA PER DUE COMMENTI. Perche' un numero che decide
   quali partite si rifiutano non deve portare accanto un'opinione. Chi
   aprira' questo file fra sei mesi deve trovare, alla riga del numero,
   COSA e' stato misurato, QUANDO, e con quale strumento rifarlo.

   uso:  node strumenti/_toppa-duello-motorev.js --dentro
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/duello-motorev.html'));

const ANCORE = [

{
  nome: '1/2 la misura accanto a MOTORE_V',
  cerca: `const MOTORE_V = 2;`,
  metti:
`/* =====================================================================
   RESTA 2 DOPO LA VOCE #131, E NON PERCHE' SEMBRAVA GIUSTO.

   La voce #131 ha messo il duello dal dischetto dentro al nastro (righe
   di tipo 6, grep «E LE TRE PORTE DEL DISCHETTO»): tocca il registro, il
   duello e il ciclo dei fotogrammi. La domanda era se un nastro scritto
   PRIMA di quella cura, rigiocato DOPO, dia ancora la stessa partita.

   La catena che dice di si', anello per anello:
     1. ogni sfida gira in modalita' un giocatore, quindi ogni duello ha
        un umano dentro (MISURATO: 169 duelli su 169);
     2. percio' la guardia di startFreeKick scattava sempre, e ogni
        nastro passato da un duello portava il marchio di tipo 5;
     3. Sfida.guarda rifiuta i nastri marchiati (grep «IL NASTRO DICE DA
        SOLO SE BASTA») — controllo CONSERVATO apposta;
     4. quindi i nastri vecchi che il gioco ACCETTA sono esattamente
        quelli SENZA duello, e per quelli il codice nuovo non gira mai.

   IL PUNTO 4 E' UN'INFERENZA, e un'inferenza non basta per una costante
   che decide quali partite si rifiutano. MISURATO il 21 settembre 2026
   con strumenti/_t-duello-motorev.js: 30 nastri SENZA duello registrati
   sul gioco di prima (main 7fbe9bf) e rigiocati sul gioco curato, a
   taglia 5, 2400 passi, semi da 20260801. **30 su 30 identici** —
   impronta campione per campione (pallone, punteggio, cronometro e la
   posizione di ogni uomo, ogni 20 passi), punteggio finale e conto dei
   sorteggi. Zero semi scartati, zero dichiarati nulli dal controllo
   (ogni nastro e' stato rigiocato anche sul gioco di PRIMA, e se non
   fosse tornato li' quel seme non avrebbe potuto dire niente).

   Quindi 2 resta 2, e si rimisura con quello strumento il giorno che
   qualcuno tocchi di nuovo il duello o il registro.
   ===================================================================== */
const MOTORE_V = 2;`,
},

{
  nome: '2/2 rettifica a edizioni del controllo `incompleto`',
  cerca:
`       Meglio non mostrarla che mostrarne un'altra: chi guarda si fida di
       quello che vede, e novanta secondi di una partita inventata sono
       una bugia lunga. Il risultato resta scritto nell'elenco.
       ===================================================================== */`,
  metti:
`       Meglio non mostrarla che mostrarne un'altra: chi guarda si fida di
       quello che vede, e novanta secondi di una partita inventata sono
       una bugia lunga. Il risultato resta scritto nell'elenco.

       RETTIFICA A EDIZIONI (21 settembre 2026, voce #131). Questo
       controllo NON riguarda piu' i nastri di oggi: il marchio di tipo 5
       non si scrive piu', perche' il duello nel nastro adesso c'e' (grep
       «E LE TRE PORTE DEL DISCHETTO»). Resta, e resta necessario, per i
       nastri scritti PRIMA di quella cura: quelli il duello non ce
       l'hanno davvero, e MOTORE_V e' rimasto 2 — misurato, 30 nastri su
       30 — proprio perche' questo controllo li tiene fuori. Il giorno che
       MOTORE_V salisse, questo blocco si potrebbe togliere: i nastri
       vecchi verrebbero gia' respinti dal confronto di versione, qui
       sopra.
       ===================================================================== */`,
},

];

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
  ['const MOTORE_V = 2;', 1],
  ['RESTA 2 DOPO LA VOCE #131, E NON PERCHE\' SEMBRAVA GIUSTO.', 1],
  ['RETTIFICA A EDIZIONI (21 settembre 2026, voce #131). Questo', 1],
  /* il controllo resta al suo posto */
  ['if(r[1] === 5) incompleto = true;', 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati (solo commenti: zero righe di codice)');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
