/* =====================================================================
   _t-voce-sola.js — LA VOCE ORFANA DELLE IMPOSTAZIONI (29 agosto 2026).

   LA DIAGNOSI, dal cancello che la trova (strumenti/disposizione.js):

     X ORFANO  impostazioni  .setwrap  su 7 formati (845x402...)
         riga 4: 1 voce in 2 colonne — vuoto 0 a sinistra e 323,5 a
         destra, sbilancio 50,5% su un massimo di 25%
     X BUCATA  impostazioni  .setwrap  su 7 formati
         riga 4 di 12: 1 voce in 2 colonne lascia 323,5 px liberi a
         destra, e sotto c'e' un'altra riga — quel posto poteva
         essere usato

   Sono i due nomi dello stesso guaio, visto da due parti: sullo schermo
   largo la voce COMANDI SUL VETRO occupa mezza riga e l'altra meta'
   resta bianca, con altre otto voci sotto che avrebbero potuto salire.

   PERCHE' SUCCEDE, ed e' strutturale e non un caso. In .setwrap le
   ETICHETTE di sezione (.eti) prendono tutta la larghezza:

       .setwrap>.eti{grid-column:1 / -1; ...}

   COMANDI SUL VETRO e' l'unica voce della sua sezione: sopra ha
   l'etichetta «Comandi» a piena riga, sotto quella «Accessibilita'»,
   anch'essa a piena riga. Una voce sola chiusa fra due righe piene
   resta orfana SEMPRE — non e' una questione di quante voci ci sono in
   tutto, e infatti il file lo dice gia' a proposito di #btnReset:
   «qui non si usa la parita' come in .menu-voci ... oggi tornerebbe
   giusto per caso (13 figli) e sbaglierebbe al primo bottone aggiunto».

   LA CURA: una CLASSE, non il terzo id.
   Il gioco risolve gia' due volte lo stesso problema, e tutte e due per
   id: `.setwrap>#btnReset{grid-column:1 / -1}` e
   `.setwrap>#btnCmdMano{grid-column:1 / -1}`. Aggiungere `#btnSetComandi`
   sarebbe stata la terza riga uguale con un nome diverso: chi domani
   aggiunge una voce sola in una sezione nuova non ha modo di sapere che
   deve scrivere la quarta.
   Con `.setwrap>.sola{grid-column:1 / -1}` la regola si dichiara nel
   markup dove sta la voce — `class="voce sola"` — e si legge da li'.
   Le due regole per id restano dove sono: toccarle vorrebbe dire
   rischiare due comportamenti in una patch che ne cura uno, e il
   commento di #btnReset spiega una ragione sua (e' l'unica azione che
   distrugge dati e non va appaiata a un interruttore) che la classe non
   saprebbe raccontare.

   DOVE VA LA REGOLA: dentro la media query di riga 2198, quella che
   trasforma .setwrap da colonna a griglia a due colonne. Fuori da li'
   la griglia non esiste (`display:flex; flex-direction:column`) e
   grid-column non vorrebbe dire niente — e' la stessa ragione per cui
   #btnReset sta li' dentro.

   Cancello: node strumenti/disposizione.js  (oggi ROSSO: 2 guai)

   uso:  node strumenti/_t-voce-sola.js --out fuori/sola.html
         node strumenti/_t-voce-sola.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/sola.html'));

const ANCORE = [

/* 1 — la regola, accanto a quella di #btnReset che risolve lo stesso guaio */
{
  nome: '1/2 la classe .sola',
  cerca:
`  .setwrap>#btnReset{grid-column:1 / -1}`,
  metti:
`  .setwrap>#btnReset{grid-column:1 / -1}
  /* UNA VOCE SOLA NELLA SUA SEZIONE PRENDE TUTTA LA RIGA.
     Le etichette .eti occupano gia' 1/-1, quindi una sezione con una
     voce sola la lascia in mezzo a due righe piene: mezza riga bianca
     con altre voci sotto, che il cancello disposizione.js chiama ORFANO
     e BUCATA insieme (sbilancio 50,5% contro un massimo del 25%).
     Qui c'e' una CLASSE e non il terzo selettore per id, perche' la
     regola vale per la FORMA («sei sola nella tua sezione») e non per
     un bottone in particolare: chi domani aggiunge una sezione da una
     voce scrive class="voce sola" e ha finito, senza dover scoprire
     che esisteva una riga di CSS da duplicare. */
  .setwrap>.sola{grid-column:1 / -1}`,
},

/* 2 — e la voce che oggi resta orfana la indossa */
{
  nome: '2/2 COMANDI SUL VETRO prende la classe',
  cerca:
`      <button class="voce" id="btnSetComandi">COMANDI SUL VETRO`,
  metti:
`      <button class="voce sola" id="btnSetComandi">COMANDI SUL VETRO`,
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
  ['.setwrap>.sola{grid-column:1 / -1}', 1],
  ['<button class="voce sola" id="btnSetComandi">', 1],
  // la riga che aggiorna il testo del bottone da JS non deve aver perso la classe
  ["bc.innerHTML='COMANDI SUL VETRO", 1],
  // e le due regole per id restano intatte
  ['.setwrap>#btnReset{grid-column:1 / -1}', 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
