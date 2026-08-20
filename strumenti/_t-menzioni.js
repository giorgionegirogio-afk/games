/* =====================================================================
   _t-menzioni.js — I COMMENTI SMETTONO DI NOMINARE I CONCORRENTI, SENZA
   PERDERE UN FATTO.

   Toppa cerca/sostituisci nel formato di casa (modello _t-l04b.js).
   TREDICI ancoraggi esatti che coprono TUTTE E SEDICI le menzioni di
   prodotti concorrenti nel gioco. Se un ancoraggio non compare
   esattamente una volta si ferma e non scrive niente.

   *** NON APPLICARE ADESSO. ***
   Scritta il 20 agosto 2026 contro l'md5 30279089de83249e44e66d2247294f5f.
   Va applicata DOPO l'onda dei verbi (sei toppe di altri specialisti
   vivono sullo stesso md5). Dopo l'applicazione:
   strumenti/diritti.js deve stampare «menzioni di concorrenti nei
   commenti: 0» (oggi stampa 16), e i tredici post-controlli qui sotto
   pretendono zero occorrenze dei cinque nomi.

   ---------------------------------------------------------------------
   IL CONTO, misurato oggi col cancello (non coi grep per riga):
   SEDICI menzioni su QUATTORDICI righe — Soccer Stars 10, Head Ball 2
   x2, Rocket League x2, Score Match 1, eFootball 1. I conteggi
   precedenti dicevano 13 (agente7 §R4, 10 agosto) e poi 15 (censimento
   del 20 agosto): la sedicesima sta a riga 24022-24023 ed e' SPEZZATA
   DAL CAPO RIGA («In Soccer / Stars»), invisibile a ogni grep che
   ragiona per righe. E' la ragione per cui il cancello diritti.js
   cerca con \\s* fra le parole.

   PERCHE' RIFORMULARE E NON CANCELLARE (agente7 §R4): sono commenti di
   progettazione, non un illecito — citare un riferimento non e' uso del
   marchio in commercio. Ma il file HTML viaggia IN CHIARO dentro l'APK
   che si vuole vendere, e letti da un avversario in causa alcuni sono
   CONFESSIONI di aver copiato una scelta visiva concreta di un prodotto
   identificato («la ricetta di Soccer Stars: base quasi bianca…»), che
   e' esattamente il terreno del precedente Tetris v. Xio. La cura
   giusta e' dire lo stesso fatto senza il nome: nessuna informazione
   tecnica viene persa, e ogni riformulazione qui sotto lo dimostra.

   DUE AVVERTENZE ONESTE:
   1. Le righe 21951-52 e 24817-19 CITANO frasi di METRO.md: dopo questa
      toppa la citazione nel codice non coincide piu' parola per parola
      con quel documento. E' voluto: il documento di analisi puo'
      nominare chi vuole (non viene distribuito), il gioco no.
   2. Questa toppa tocca SOLO commenti: zero byte eseguibili cambiati.
      La prova e' meccanica: strip dei commenti prima e dopo, identico.

   uso:
     node strumenti/_t-menzioni.js --elenco
     node strumenti/_t-menzioni.js --out fuori/menzioni.html
     node strumenti/_t-menzioni.js --in altro.html --out x.html
     node strumenti/_t-menzioni.js --dentro        (solo a onda verbi chiusa)
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

/* riga 4997 — il paragone di spessore degli arti: il fatto e' la
   larghezza minima che regge, non chi ce l'ha */
{
  nome: '1/13 arti con massa (riga 4997)',
  cerca:
`   leggevano come FILI, non capsule — accanto alla pedina di Soccer Stars
   l'omino sembrava a tratto sottile.`,
  metti:
`   leggevano come FILI, non capsule — accanto a una pedina piena
   l'omino sembrava a tratto sottile.`,
},

/* riga 5051 — stesso paragone, richiamato */
{
  nome: '2/13 il richiamo degli arti (riga 5051)',
  cerca:
`     sottili la figura non reggeva accanto alla pedina di Soccer Stars.
     Quella ragione vale ancora`,
  metti:
`     sottili la figura non reggeva accanto a una pedina piena.
     Quella ragione vale ancora`,
},

/* riga 10085 — il fatto e' che un banner coprirebbe l'azione */
{
  nome: '3/13 niente banner sul cross (riga 10085)',
  cerca:
`   Niente banner: Soccer Stars non ce l'ha, e la densita' e' una legge. */`,
  metti:
`   Niente banner: coprirebbe l'azione, e la densita' e' una legge. */`,
},

/* righe 12430-12432 — DUE menzioni: gli effetti di contatto */
{
  nome: '4/13 il metro degli effetti di contatto (righe 12430-32)',
  cerca:
`   Il metro e' preso dai riferimenti: in Soccer Stars ogni contatto ha una
   RAGGIERA bianca nel punto d'urto e il pallone si porta dietro una scia
   affusolata; in Head Ball 2 ogni colpo ha una stella di luce. Nessuno dei
   due disegna un fotogramma in piu':`,
  metti:
`   Il metro e' preso dai riferimenti del genere: un contatto che si sente
   ha una RAGGIERA bianca nel punto d'urto, una scia affusolata dietro il
   pallone, o una stella di luce sul colpo. Nessuno di questi effetti
   disegna un fotogramma in piu':`,
},

/* riga 12543 — la raggiera del lampo */
{
  nome: '5/13 la raggiera del lampo (riga 12543)',
  cerca:
`   lungo la direzione della botta. E' la raggiera che in Soccer Stars sta
   nel punto di contatto fra due pedine, ed e' la ragione per cui li' un
   colpo si SENTE anche in una fotografia ferma. Dura due decimi. */`,
  metti:
`   lungo la direzione della botta. E' la raggiera nel punto di contatto,
   la ragione per cui nei riferimenti un colpo si SENTE anche in una
   fotografia ferma. Dura due decimi. */`,
},

/* riga 21683 — DUE menzioni: il soggetto della scena del gol */
{
  nome: '6/13 il soggetto della scena del gol (riga 21683)',
  cerca:
`       dal fotogramma. In Score Match e in Rocket League il soggetto e' chi
       ha segnato, e G.goalIdx lo sa gia' (lo usa la moviola per cerchiarlo).`,
  metti:
`       dal fotogramma. Nei riferimenti il soggetto della scena e' chi
       ha segnato, e G.goalIdx lo sa gia' (lo usa la moviola per cerchiarlo).`,
},

/* righe 21951-52 — la citazione di METRO.md (requote dichiarato in testa) */
{
  nome: '7/13 la citazione del metro sull\'inquadratura (righe 21951-52)',
  cerca:
`     Quello che il metro chiama "il punto in cui siamo GIA' avanti su
     Soccer Stars, e va difeso" torna dentro l'inquadratura.`,
  metti:
`     Quello che il metro chiama "il punto in cui siamo GIA' avanti sul
     riferimento, e va difeso" torna dentro l'inquadratura.`,
},

/* righe 24022-23 — LA MENZIONE SPEZZATA DAL CAPO RIGA, quella che i
   grep per riga non hanno mai visto */
{
  nome: '8/13 la scia a nastro (righe 24022-23, menzione spezzata)',
  cerca:
`   sembravano una macchia, in corsa non si vedevano affatto. In Soccer
   Stars la palla colpita si porta dietro una striscia bianca affusolata —`,
  metti:
`   sembravano una macchia, in corsa non si vedevano affatto. Il metro:
   la palla colpita si porta dietro una striscia bianca affusolata —`,
},

/* riga 24532 — la «ricetta»: la confessione piu' esposta di tutte */
{
  nome: '9/13 la ricetta del pallone leggibile (riga 24532)',
  cerca:
`     ricetta di Soccer Stars: base quasi bianca, pentagono piu' piccolo,
     velo d'ombra dimezzato.`,
  metti:
`     ricetta che si legge alle taglie di gioco: base quasi bianca,
     pentagono piu' piccolo, velo d'ombra dimezzato.`,
},

/* righe 24817-18 — la citazione di METRO.md sull'alone (requote) */
{
  nome: '10/13 l\'alone di stacco, prima citazione (righe 24817-18)',
  cerca:
`       stacco attorno a cio' che conta — in Soccer Stars la pedina attiva
       ha un anello ciano che la solleva dal campo". Il nostro l'aveva SOLO`,
  metti:
`       stacco attorno a cio' che conta — un anello chiaro che sollevi
       la pedina attiva dal campo". Il nostro l'aveva SOLO`,
},

/* righe 25917-18 — la stessa citazione, seconda sede (requote) */
{
  nome: '11/13 l\'alone di stacco, seconda citazione (righe 25917-18)',
  cerca:
`     conta: in Soccer Stars la pedina attiva ha un anello ciano che la
     solleva dal campo» — e da noi ce l'aveva soltanto il giocatore`,
  metti:
`     conta: un anello chiaro che solleva la pedina attiva dal
     campo» — e da noi ce l'aveva soltanto il giocatore`,
},

/* riga 26573 — il radar */
{
  nome: '12/13 la posizione del radar (riga 26573)',
  cerca:
`  /* IN BASSO AL CENTRO, come il radar di eFootball (quarto appello).`,
  metti:
`  /* IN BASSO AL CENTRO, come i radar dei riferimenti (quarto appello).`,
},

/* riga 27036 — DUE menzioni: i chevron delle porte */
{
  nome: '13/13 i chevron delle porte (riga 27036)',
  cerca:
`     pixel al campo. E' quello che fanno Head Ball 2 e Rocket League. */`,
  metti:
`     pixel al campo. E' la soluzione comune dei riferimenti ad arena. */`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-menzioni.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.menzioni.html';
outFile = path.resolve(outFile);
if (!dentro && outFile === inFile) {
  console.error('FALLITO: --out coincide con --in. Senza --dentro non si scrive sull\'originale.');
  process.exit(2);
}

const src = fs.readFileSync(inFile, 'utf8');
let out = src;
const mancanti = [];
for (const a of ANCORE) {
  const n = out.split(a.cerca).length - 1;
  if (n !== 1) { mancanti.push({ nome: a.nome, n, a }); continue; }
  out = out.replace(a.cerca, a.metti);
}
if (mancanti.length) {
  console.error('FALLITO: ancoraggi che non compaiono esattamente una volta — niente e\' stato scritto.');
  for (const m of mancanti) {
    console.error(`  · ${m.nome}: trovato ${m.n} volte`);
    console.error('    testo cercato:\n' + m.a.cerca.split('\n').map(r => '      ' + r).join('\n'));
  }
  process.exit(1);
}
/* post-controllo 1: ZERO menzioni residue, cercate come le cerca il
   cancello (con \s* fra le parole: la 16ª era spezzata dal capo riga) */
const RESIDUI = [/soccer\s*stars/gi, /head\s*ball/gi, /rocket\s*league/gi, /score\s*match/gi, /efootball/gi];
const resti = [];
for (const re of RESIDUI) { re.lastIndex = 0; let m; while ((m = re.exec(out))) resti.push(m[0].replace(/\s+/g, ' ')); }
if (resti.length) { console.error('FALLITO dopo la sostituzione: menzioni residue: ' + resti.join(', ')); process.exit(1); }
/* post-controllo 2: SOLO commenti toccati — tolti i commenti a blocco,
   i due file devono essere IDENTICI byte per byte */
const senzaCommenti = s => s.replace(/\/\*[\s\S]*?\*\//g, '');
if (senzaCommenti(src) !== senzaCommenti(out)) {
  console.error('FALLITO: la toppa ha toccato qualcosa FUORI dai commenti a blocco. Niente e\' stato scritto.');
  process.exit(1);
}

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log(`OK  ${ANCORE.length} ancoraggi applicati (16 menzioni azzerate)`);
console.log(`    da   ${inFile}  (${src.length} byte)`);
console.log(`    a    ${outFile}  (${out.length} byte, ${out.length - src.length >= 0 ? '+' : ''}${out.length - src.length})`);
console.log('    ora: node strumenti/diritti.js --gioco ' + outFile + '   deve dire «menzioni di concorrenti nei commenti: 0»');
