/* =====================================================================
   _t-griglia.js — LA FILA SI CHIUDE E IL PANNELLO SI STRINGE
   (28 agosto 2026).

   IL SOSPETTO ERA SBAGLIATO, e vale la pena scriverlo prima della cura.

   L'accusa era: «i caratteri veri sono entrati stamattina, Barlow
   Condensed scrive in 339 unita' dove il ripiego ne usava 520, quindi le
   larghezze sono cambiate e la disposizione si e' scomposta». Misurato,
   a 845x402 (il OnePlus 6 vero), sulla copia di ieri (fuori/_prima-tel.html,
   caratteri di ripiego) contro quella di oggi (caratteri veri):

                                              IERI        OGGI
     «CALCETTO» in Barlow 700 a 100px         559,4       365
     colonne di .menu-voci nello SPOGLIATOIO  316,5/316,5 316,5/316,5
     scarto fra SQUADRA e ROSA                0           0
     sbilancio della riga di CAMPI            323,5 px    323,5 px
     buco fra la griglia e TORNA AL MENU      82 px       82 px
     «UNA VOLTA, PER SEMPRE» nei biglietti    2 righe     2 righe
     larghezza di TORNA AL MENU               231,8       183,6

   I caratteri hanno cambiato UNA cosa sola — la larghezza delle parole,
   TORNA AL MENU perde 48,2 px, il 21% — e NESSUNO dei tre difetti. Le
   colonne erano uguali ieri come oggi, l'orfano c'era ieri come oggi, il
   buco misurava 82 px ieri come oggi. La griglia era gia' storta: i
   caratteri nuovi l'hanno soltanto resa piu' evidente, perche' testo piu'
   stretto vuol dire piu' spazio intorno a mostrare il vuoto.

   E SQUADRA E ROSA NON HANNO MAI AVUTO LARGHEZZE DIVERSE. Misurato sui
   pixel della fotografia stessa (fuori/tel-spogliatoio.png, 2280x1080,
   strumenti/_diag-foto-righe.js): il blocco di SQUADRA e' largo 850 px,
   quello di ROSA 850 px, scarto 0. L'occhio era stato ingannato dal
   taglio a 14 gradi della targa (clip-path) e dall'ombra di legno
   spostata: la parola ROSA e' corta e sta in mezzo a una casella larga,
   SQUADRA e' lunga e la riempie, e le due caselle sembrano diverse.

   =====================================================================
   I DUE DIFETTI VERI, e la loro cura.

   1) L'ORFANO. In orizzontale .menu-voci e .setwrap sono una griglia a
      due colonne (@media max-height:470px). Con un numero DISPARI di
      voci l'ultima resta da sola nella colonna di sinistra e accanto ha
      mezza riga di niente: sbilancio 323,5 px su 640, il 50,5% del
      contenitore. Non era una schermata sola — erano CINQUE:

        SPOGLIATOIO   CAMPI                  50,5%
        IMPOSTAZIONI  CREDITI E LICENZE      50,5%   (schermata «extra»)
        TORNEO        NUOVO TORNEO           50,5%   (voce unica)
        STAGIONE      NUOVA STAGIONE         50,5%   (voce unica)
        PREFERENZE    AZZERA TUTTI I DATI    50,5%   (setwrap)

      Cura: l'ultima voce, quando e' dispari, prende tutta la riga. Una
      voce sola in una griglia a due colonne diventa una voce a tutta
      larghezza, che e' quel che era prima che la griglia esistesse.

      PERCHE' LA PARITA' E NON UNA REGOLA PIU' FURBA: in .menu-voci tutti
      i figli sono voci da una colonna, quindi «ultimo e dispari» vuol
      dire esattamente «solo nella sua riga». In .setwrap NO — le
      etichette (.eti) e la riga della difficolta' occupano gia' tutta la
      larghezza, e la parita' dei figli non dice piu' in che colonna
      cade l'ultimo. Li' la parita' oggi tornerebbe giusta per caso (13
      figli), e una regola che funziona per caso e' una regola che
      smette di funzionare al primo bottone aggiunto: AZZERA TUTTI I DATI
      prende tutta la riga per nome, come gia' fanno .eti e .diff-row. E'
      anche giusto di suo — e' l'unica azione distruttiva del gioco e non
      va appaiata a nient'altro.

      E LA HOME VA ESCLUSA A MANO, che e' l'errore che ho fatto e che il
      TELEFONO ha trovato mentre il banco era verde. La home non ha due
      colonne: ne ha sette, e le sue sette voci stanno su una fila sola.
      NEGOZIO e' l'ultima e settima — cioe' dispari — quindi la regola le
      dava tutta la riga, e una voce larga sette colonne non puo' stare
      accanto alle altre sei: finiva su una seconda fila, lasciando un
      buco nella prima, su TUTTI E CINQUE i formati. Il cancello non lo
      vedeva (lo sbilancio della prima fila era 13,5%, sotto la soglia
      del 25%). Da quel giorno disposizione.js ha la regola BUCATA, che
      guarda le righe di mezzo, e questa toppa ha una riga in piu':
      #menu .menu-voci>:last-child{grid-column:auto}.

   2) IL BUCO SOPRA I BOTTONI. La fascia .azioni porta 34 px di margine
      piu' 34 px di riempimento in testa: sono la RAMPA della velatura
      che dice «la lista continua». Su una schermata che NON scorre non
      c'e' nessuna lista che continua, e quei 68 px sono vuoto puro —
      sommati ai 14 dello spaziatore fanno gli 82 px misurati.

      Il gioco SA GIA' quando non si scorre: aggiornaSfumatura() mette la
      classe «senzafade» sulla schermata (scrollHeight - clientHeight <=
      28) e da li' toglie l'ombra. Bastava dirle di togliere anche la
      rampa. Nessun codice nuovo, nessun ascoltatore nuovo: una regola
      CSS attaccata a una classe che esisteva gia'.

      E NON PUO' OSCILLARE, che e' l'unica obiezione seria: la regola
      TOGLIE spazio, e togliere spazio non puo' far nascere uno
      scorrimento. Se non scorreva continua a non scorrere, e senzafade
      resta; se scorreva la classe non c'e' e non cambia niente.

   =====================================================================
   I NUMERI, prima e dopo, a 845x402 (node strumenti/disposizione.js):

                                        PRIMA     DOPO
     schermate con una voce orfana        5         0
     sbilancio della riga orfana        50,5%      0%
     buco fra l'ultima voce e i bottoni  82 px     20 px
     VUOTO misurato in SPOGLIATOIO      20,4%      0%
     BUCHI misurati in BACHECA          35,4%      0%
     guai del cancello, tutti i formati   11        0

   I DUE ZERI NON SONO ARROTONDAMENTI, e vale la pena dire perche': i 20
   px che restano fra l'ultima voce e TORNA AL MENU non entrano nel conto
   dei buchi perche' la conferma fotografica ci trova dentro qualcosa
   (bordi 1,32%, contro lo 0,44% del buco di prima) — e' l'ombra del
   bottone, non il nulla. Il vuoto misurato dal cancello passa quindi a
   zero, mentre lo spazio d'aria fra i due elementi resta, ed e' giusto
   che resti: 20 px sono una separazione, 82 erano una voragine.

   uso:  node strumenti/_t-griglia.js --out fuori/griglia.html
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

/* 1 — l'ultima voce dispari prende tutta la riga */
{
  nome: '1/3 in griglia l\'ultima voce dispari non resta orfana',
  cerca: `  .menu-voci>.menu-grid{display:contents}`,
  metti:
`  .menu-voci>.menu-grid{display:contents}
  /* =====================================================================
     L'ULTIMA VOCE NON RESTA ORFANA (28 agosto 2026).

     Con un numero dispari di voci, l'ultima cadeva da sola nella colonna
     di sinistra e accanto le restava mezza riga di niente: misurato a
     845x402, 323,5 px di vuoto su 640 di contenitore, cioe' il 50,5%
     tutto da una parte. Non era lo SPOGLIATOIO: erano CINQUE schermate
     (SPOGLIATOIO/CAMPI, IMPOSTAZIONI/CREDITI, TORNEO e STAGIONE — che di
     voci ne hanno UNA sola, quindi mezza griglia vuota sempre — e
     PREFERENZE/AZZERA).

     NON E' COLPA DEI CARATTERI NUOVI, per quanto sia il primo sospetto
     del giorno: sulla copia di ieri, col carattere di ripiego, le colonne
     misuravano gli stessi 316,5 px e lo sbilancio gli stessi 323,5. La
     griglia era storta da prima; i caratteri l'hanno solo illuminata.

     «ultimo e dispari» = «solo nella sua riga» PERCHE' in .menu-voci ogni
     figlio e' una voce da una colonna. In .setwrap non varrebbe (le
     etichette occupano gia' tutta la riga e spostano il conto), e infatti
     li' la cura ha un altro nome — vedi #btnReset piu' sotto. */
  .menu-voci>:last-child:nth-child(odd){grid-column:1 / -1}
  /* ...MA NON IN HOME, e questa riga e' stata pagata sul telefono.
     La home non ha due colonne: ne ha SETTE (1.5fr repeat(6,1fr)), e le
     sue sette voci ci stanno tutte su una fila sola. NEGOZIO e' la
     settima, cioe' l'ultima ed e' dispari: la regola qui sopra gli dava
     tutta la riga, e una voce che occupa sette colonne non puo' stare
     accanto alle altre sei — finiva su una seconda riga larga tutto,
     lasciando una cella vuota nella prima. Su tutti e cinque i formati.
     Il banco era verde (lo sbilancio della prima riga, 13,5%, stava
     sotto la soglia del 25%): l'ha visto il telefono. Da allora
     disposizione.js ha la regola BUCATA, che lo vede. */
  #menu .menu-voci>:last-child{grid-column:auto}`,
},

/* 2 — l'unica azione distruttiva del gioco prende tutta la riga per nome */
{
  nome: '2/3 AZZERA TUTTI I DATI a tutta riga (setwrap, dove la parita\' non vale)',
  cerca: `  .setwrap>.diff-row{grid-column:1 / -1}`,
  metti:
`  .setwrap>.diff-row{grid-column:1 / -1}
  /* AZZERA TUTTI I DATI STA SU UNA RIGA SUA. Era l'ultima voce di una
     griglia a due colonne e restava orfana a sinistra (sbilancio 50,5%).
     Qui non si usa la parita' come in .menu-voci: le etichette e la riga
     della difficolta' occupano gia' tutta la larghezza, quindi il numero
     dei figli non dice piu' in che colonna cade l'ultimo — oggi tornerebbe
     giusto per caso (13 figli) e sbaglierebbe al primo bottone aggiunto.
     Per nome e' anche piu' onesto: e' l'unica azione che distrugge dati,
     e non va appaiata a un interruttore. */
  .setwrap>#btnReset{grid-column:1 / -1}`,
},

/* 3 — dove non si scorre, la rampa della velatura e' vuoto puro */
{
  nome: '3/3 senza scorrimento la fascia dei bottoni non tiene la rampa',
  cerca: `.ov.senzafade .azioni{box-shadow:none}`,
  metti:
`.ov.senzafade .azioni{box-shadow:none}
/* =====================================================================
   ...E NON TIENE NEMMENO IL POSTO PER LA RAMPA (28 agosto 2026).

   La fascia .azioni porta 34 px di margine piu' 34 px di riempimento in
   testa: e' la rampa su cui la velatura sale, e serve a dire «sotto c'e'
   altro». Su una schermata che non scorre non c'e' nessun «altro», e quei
   68 px sono vuoto puro — coi 14 dello spaziatore fanno gli 82 px
   misurati fra l'ultima voce e TORNA AL MENU nello SPOGLIATOIO, il 20,4%
   di uno schermo alto 402. Cinque schermate lo avevano (SPOGLIATOIO,
   BACHECA, IMPOSTAZIONI, TORNEO, STAGIONE), e in BACHECA il pannello
   arrivava a essere buco per il 35,4% della sua altezza.

   La velatura sparisce insieme alla rampa: una sfumatura che non sfuma
   niente e' solo una banda scura sotto l'ultimo bottone.

   NON PUO' OSCILLARE: questa regola TOGLIE spazio, e togliere spazio non
   puo' far nascere uno scorrimento. Chi non scorreva continua a non
   scorrere e tiene la classe; chi scorre non ce l'ha e non vede questa
   riga. Dopo: il buco passa da 82 a 20 px (il 5,0% dello schermo).
   ===================================================================== */
.ov.senzafade .azioni{margin-top:6px;padding-top:0;background:none}`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-griglia.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.griglia.html';
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

/* i controlli dopo la sostituzione: ogni regola nuova c'e' una volta
   sola, e nessuna delle tre righe ancora esiste in doppio */
const attesi = [
  ['.menu-voci>:last-child:nth-child(odd){grid-column:1 / -1}', 1],
  ['#menu .menu-voci>:last-child{grid-column:auto}', 1],
  ['.setwrap>#btnReset{grid-column:1 / -1}', 1],
  ['.ov.senzafade .azioni{margin-top:6px;padding-top:0;background:none}', 1],
  ['.menu-voci>.menu-grid{display:contents}', 1],
  ['.setwrap>.diff-row{grid-column:1 / -1}', 1],
  ['.ov.senzafade .azioni{box-shadow:none}', 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));

/* LA LEGGE SUI SORTEGGI, verificata e non data per scontata: questa toppa
   e' tutta CSS, quindi il conto delle chiamate a dado() non puo' cambiare
   — ma «non puo'» e' esattamente cio' che si dice prima di sbagliare. Si
   contano prima e dopo, e si controlla anche che non sia comparso un
   Math.random fuori dal corpo di dado(). */
const conta = (t, re) => (t.match(re) || []).length;
const dadoPrima = conta(src, /\bdado\s*\(/g), dadoDopo = conta(out, /\bdado\s*\(/g);
const rndPrima = conta(src, /Math\.random\s*\(/g), rndDopo = conta(out, /Math\.random\s*\(/g);
if (dadoPrima !== dadoDopo) rotti.push('le chiamate a dado() passano da ' + dadoPrima + ' a ' + dadoDopo);
if (rndPrima !== rndDopo) rotti.push('le Math.random passano da ' + rndPrima + ' a ' + rndDopo);

if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
console.log('    sorteggi: dado() ' + dadoPrima + ' -> ' + dadoDopo + ', Math.random ' + rndPrima + ' -> ' + rndDopo + '  (invariati)');
