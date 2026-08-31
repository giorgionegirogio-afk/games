/* =====================================================================
   _t-titolo.js — «CALCETT»: IL MARCHIO SMETTE DI DIPENDERE DAL
   CARATTERE DEL TELEFONO (28 agosto 2026).

   IL DIFETTO, visto sul OnePlus 6 vero (2280x1080, in orizzontale) e da
   nessuno dei venti cancelli: nella home il titolo si legge «CALCETT»
   piu' un bollino tondo staccato. Manca la O.

   PERCHE'. Il marchio non e' un disegno: e' meta' testo e meta'
   geometria inchiodata.

     <text x=0 y=118 font-size=100>CALCETT</text>       <- larghezza VARIABILE
     <circle cx=561 cy=82 r=38 stroke-width=20/>        <- la O, INCHIODATA

   Il cerchio-O occupa da 523 a 609 nel sistema del viewBox (0 0 634
   152), quindi la parola deve finire attorno a 510 perche' la O sia la
   settima lettera invece di un sottobicchiere. E la parola finisce dove
   decide IL CARATTERE CHE VINCE LA CASCATA, che non e' lo stesso su
   tutte le macchine. Misurato con getComputedTextLength, font-size 100:

     Arial Black (Windows)      515 unita'   vuoto prima della O:   8
     Roboto      (Android)      424 unita'   vuoto prima della O:  99
     Roboto Black (Android)     434 unita'   vuoto prima della O:  89
     Arial       (fallback)     456 unita'   vuoto prima della O:  67

   Novantanove unita' di vuoto sono una lettera e mezzo: la O smette di
   essere una lettera e diventa un logo a parte. Su Windows il vuoto e'
   8 e il marchio e' perfetto — ecco perche' nessuno l'ha mai visto, e
   perche' nessun cancello poteva vederlo: girano tutti in Chromium su
   Windows, dove Arial Black esiste.

   IL CARATTERE INCORPORATO NON C'ENTRA, ED E' LA SCOPERTA PIU' GRAVE
   DI QUESTA TOPPA. Il file dichiara due @font-face in base64 — Archivo
   Black e Barlow Condensed — e li presenta come «incorporati per l'uso
   offline». Sono i sottoinsiemi SBAGLIATI: contengono latin-ext e
   vietnamita e NON contengono le lettere A-Z. Verificato con fontTools
   sui due woff2 estratti dal file:

     Archivo Black    161 glifi, 156 caratteri mappati, 'A' e 'C' ASSENTI
     Barlow Condensed 140 glifi, 113 caratteri mappati, 'A' e 'C' ASSENTI

   e verificato a schermo: un <div> in 'Archivo Black' esce in Times New
   Roman, identico a un <div> con un carattere inesistente (450 unita'
   tutt'e due). CALCETTO non ha MAI scritto una lettera nel suo
   carattere: su Windows scrive in Arial Black e in Arial Narrow, sul
   telefono scrive in Roboto. Ventidue kB di base64 che non fanno
   niente. QUESTA TOPPA NON LO RIPARA — servirebbero i woff2 giusti, che
   qui non ci sono e non si scaricano — ma lo lascia scritto, perche' e'
   la causa a monte e chi rimettera' il carattere buono deve sapere che
   il marchio, dopo questa toppa, non ci ricadra' comunque.

   LA CURA, due attributi per <text> e nessuna riga di codice:

     textLength="515" lengthAdjust="spacingAndGlyphs"

   textLength fissa l'INGOMBRO della parola nel sistema del viewBox: il
   browser allarga o stringe i glifi finche' 'CALCETT' misura 515,
   qualunque carattere abbia vinto. Il 515 non e' un numero scelto a
   caso ne' un numero di progetto: e' ESATTAMENTE la larghezza che il
   marchio ha oggi su Windows, cioe' la resa che tutti hanno approvato e
   che tutte le fotografie di riferimento hanno dentro. Su Windows la
   correzione vale 515->515, cioe' zero. Sul telefono vale 424->515.

   Verificato che l'ingombro si fissa a 515 con OGNI carattere provato —
   Arial Black, Roboto 400, Roboto Black, serif, Comic Sans — e che il
   vuoto prima della O torna 8 unita' in tutti i casi, cioe' esattamente
   quello di oggi su Windows.

   «IDENTICO AL BIT» SU WINDOWS SAREBBE STATO COMODO DIRLO, E NON E'
   VERO. La geometria non si muove di un'unita' (515 -> 515, la O resta
   dov'era), ma lengthAdjust fa passare Chrome dalla composizione
   normale al piazzamento glifo per glifo, e la rasterizzazione cambia
   di un capello. Contato sul ritaglio del solo marchio, prima contro
   dopo, a densita' 2:
     1440x900   566x122 px:  2442 pixel toccati (3,5%), di cui 1856
                oltre 8/255 (2,7%), scarto massimo 165/255
     845x402    504x110 px: 26156 pixel toccati (47%), di cui 2210
                oltre 8/255 (4,0%), scarto massimo 240/255
   Sono i bordi delle lettere: le due fotografie affiancate
   (fuori/titolo-scatti/prima-PC-1440x900.png e dopo-PC-1440x900.png)
   non si distinguono. Chi confronta pixel — istantanea.js — trovera'
   comunque una differenza e deve sapere da dove viene.

   Piu' font-weight="900", che sul telefono e' quello che porta a casa
   la resa: la cascata, senza peso dichiarato, arrivava al REGOLARE —
   un titolo da poster scritto in corpo testo. Misurato: su Windows non
   cambia un pixel (Arial Black misura 515 sia a peso 400 sia a peso
   900, cioe' non c'e' nessun grassetto fabbricato); sul OnePlus 6 si
   passa dal regolare al nero, e questo non e' una supposizione:
   /system/etc/fonts.xml dichiara la famiglia sans-serif con le sue
   dodici facce e il peso 900 punta a OpFont-Black.ttf, che su questo
   telefono e' Roboto-Black copiata (stesso SHA-1 del file
   Roboto-Black.ttf accanto, 306428 byte; anche OpFont-Regular.ttf e'
   Roboto-Regular.ttf al byte). Letto con adb, senza accendere lo
   schermo — e' anche il motivo per cui il banco che riproduce il
   telefono monta Roboto: su questa macchina sans-serif E' Roboto.

   PERCHE' NON L'ALTRA STRADA. lengthAdjust="spacing" (allarga solo la
   spaziatura, i glifi restano intatti) e' stata provata e fotografata:
   la parola arriva a 515 e la O si riattacca, ma con Roboto le sette
   lettere restano sottili e vanno larghe, e il doppio contorno di gesso
   si apre in sette isole invece di fare una scritta. Bocciata guardando
   le due fotografie affiancate (fuori/titolo-scatti/tel-cura-spazi.png
   contro tel-cura-glifi-nero.png), non per principio.

   ------------------------------------------------------------------
   LA RIGA SOPRA — «DOPOLAVORO FC · LE SETTE DI SERA» con SERA da sola.

   Stesso quadro, difetto diverso e indipendente: il corpo della riga
   era clamp(8px,1.9vw,11px), cioe' legato alla FINESTRA, mentre il
   riquadro che la contiene e' legato al TABELLONE, che ha un tetto
   (max-width 200/300/320/332/380/480 secondo la disposizione). In
   orizzontale la finestra e' larga 845 e porta il corpo al tetto di 11
   px — riga larga 265 — dentro un .tab-in largo 251. Va a capo, e
   siccome l'ultima parola e' corta resta SERA da sola.

   Misurato prima, riga a capo SI/NO su dieci formati:

     845x402  tab-in 251  riga 265  A CAPO   <- il telefono della foto
     915x412  tab-in 272  riga 265  no
     812x375  tab-in 242  riga 265  A CAPO
     740x360  tab-in 220  riga 265  A CAPO
     360x640  tab-in 170  riga 192  A CAPO
     320x568  tab-in 170  riga 192  A CAPO
     360x740  tab-in 255  riga 192  no
     412x915  tab-in 255  riga 192  no
     1112x834 tab-in 282  riga 265  no
     1440x900 tab-in 282  riga 265  no

   Cinque formati su dieci, fra cui i tre in cui il gioco si gioca
   davvero. La cura: il corpo si lega al LEGNO invece che alla finestra.
   montaTabellone() gia' misura el.offsetWidth per dipingere il canvas
   alla misura giusta; adesso scrive quella misura anche in --tw, e il
   CSS ci calcola sopra il corpo. Il coefficiente viene dalla misura:
   la riga occupa 24,1 px per ogni px di corpo col carattere di Windows
   (Arial Narrow) e 22,6 con quello del telefono (Roboto), e il .tab-in
   e' l'85% del tabellone, quindi il corpo massimo che ci sta e'
   0,85*tw/24,1 = tw/28,4. Si usa tw/30, che lascia il 5% di margine sul
   caso peggiore dei due caratteri.

   E white-space:nowrap, che non e' cosmetica: senza, un traboccamento
   futuro tornerebbe a essere un a-capo, cioe' INVISIBILE a chi misura;
   con nowrap diventa scrollWidth > clientWidth, cioe' una cosa che il
   cancello nuovo (strumenti/testo-fuori.js) vede.

   ------------------------------------------------------------------
   E LA TERZA, che non era stata chiesta da nessuno perche' nessuno
   l'aveva vista: «SECONDI IN GABBIA, 5 CONTRO 5», la didascalia del
   compensato, era TAGLIATA — non a capo: tagliata, con le lettere
   perdute, perche' .tab-sotto ha overflow:hidden e white-space:nowrap.
   L'ha trovata il cancello nuovo alla prima corsa sul gioco spedito:

     845x402  riquadro 246  testo 249   3 px mangiati
     812x375  riquadro 236  testo 249  13 px mangiati
     740x360  riquadro 215  testo 249  34 px mangiati
     360x640  riquadro 166  testo 172   6 px mangiati

   Stessa malattia della riga sopra, e il commento accanto a quel CSS
   lo diceva gia' senza saperlo: «la spaziatura cede prima del corpo, e
   il corpo prima dell'andare a capo» — solo che il corpo era
   clamp(9px,2.2vw,13px), cioe' legato alla finestra, e a finestra
   larga non cedeva affatto. Stessa cura: --tw diviso 25. La riga occupa
   19,2 px per px di corpo, il .tab-sotto e' l'83% del tabellone, quindi
   il massimo che ci sta e' tw/23,1: /25 lascia otto punti di margine.

   COSA NON CAMBIA: la geometria del marchio (515 -> 515: la O resta
   dov'era, su Windows si muove solo l'antialiasing, vedi i conti sopra);
   la riga sopra, dove gia' stava su una riga sola, cambia corpo di meno
   di un pixel al tetto (11 -> 11) e cresce da 8 a 10 in verticale, dove
   il riquadro e' largo 255 e ce ne stanno 10,5; nessun sorteggio,
   nessuna simulazione, nessun id, nessuna scorciatoia.

   Cancello nuovo: node strumenti/testo-fuori.js --gioco fuori/titolo.html
   Misure:         node strumenti/_diag-titolo.js  --gioco fuori/titolo.html
                   node strumenti/_diag-titolo2.js --gioco fuori/titolo.html
                   node strumenti/_diag-titolo3.js --gioco fuori/titolo.html

   uso:  node strumenti/_t-titolo.js --out fuori/titolo.html
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

/* 1 — la sagoma da cui nascono ombra e contorni */
{
  nome: "1/5 #lgShape: l'ingombro del lettering fissato a 515",
  cerca: `      <text x="0" y="118" font-family="'Archivo Black','Arial Black',sans-serif" font-size="100">CALCETT</text>`,
  metti: `      <!-- L'INGOMBRO DELLA PAROLA E' FISSATO, IL CARATTERE NO. La O
           finale e' il cerchio qui sotto, inchiodato a cx=561: occupa
           523..609, quindi la parola deve finire poco prima di 523 o la
           O si stacca e il titolo si legge «CALCETT». Ma la larghezza di
           un <text> la decide il carattere che vince la cascata, e non
           e' lo stesso ovunque: Arial Black (Windows) 515, Roboto
           (Android) 424, Arial 456. Con 424 restano 99 unita' di vuoto
           — una lettera e mezzo — ed e' esattamente cio' che si vedeva
           sul telefono il 28 agosto 2026.
           textLength fissa l'ingombro a 515 dovunque, e 515 e' la
           larghezza che il marchio ha su Windows: la' la correzione
           vale zero (la geometria non si muove; cambia solo
           l'antialiasing, perche' lengthAdjust fa piazzare i glifi uno
           per uno). Il peso 900 chiede al ripiego la sua faccia piu'
           nera: sul OnePlus 6 sans-serif e' OpFont, che su quel
           telefono e' Roboto copiata, e il peso 900 e' Roboto-Black.
           I DUE <text> DEL MARCHIO DEVONO PORTARE GLI STESSI DUE
           ATTRIBUTI: questo fa ombra e contorni, l'altro il riempimento
           a due tinte, e se si allargassero in modo diverso il colore
           uscirebbe dal contorno. -->
      <text x="0" y="118" font-family="'Archivo Black','Arial Black',sans-serif" font-weight="900" font-size="100" textLength="515" lengthAdjust="spacingAndGlyphs">CALCETT</text>`,
},

/* 2 — il lettering a due tinte, che deve combaciare con la sagoma */
{
  nome: '2/5 il lettering a due tinte: stesso ingombro, stesso peso',
  cerca: `      <text x="0" y="118" font-family="'Archivo Black','Arial Black',sans-serif" font-size="100"><tspan fill="#f2f5ef">CAL</tspan><tspan fill="var(--tu,#d6ff26)">CETT</tspan></text>`,
  metti: `      <text x="0" y="118" font-family="'Archivo Black','Arial Black',sans-serif" font-weight="900" font-size="100" textLength="515" lengthAdjust="spacingAndGlyphs"><tspan fill="#f2f5ef">CAL</tspan><tspan fill="var(--tu,#d6ff26)">CETT</tspan></text>`,
},

/* 3 — la riga sopra si lega al legno invece che alla finestra */
{
  nome: '3/5 .tab-kick: corpo legato al tabellone, e niente a-capo',
  cerca: `.tab-kick{
  font-family:var(--cond);font-weight:700;font-size:clamp(8px,1.9vw,11px);letter-spacing:.18em;
  text-transform:uppercase;color:rgba(242,245,239,.62);line-height:1.1;
}`,
  metti: `/* IL CORPO SI MISURA SUL LEGNO, NON SULLA FINESTRA. Era
   clamp(8px,1.9vw,11px): in orizzontale la finestra e' larga 845, il
   corpo va al tetto di 11 px e la riga occupa 265 px dentro un .tab-in
   largo 251. Va a capo, e siccome l'ultima parola e' corta resta SERA
   da sola sulla seconda riga — misurato su cinque formati su dieci,
   fra cui 845x402, 812x375 e 740x360, cioe' il telefono in orizzontale.
   La finestra non c'entrava niente: il riquadro segue il TABELLONE, che
   ha un tetto suo (200/300/320/332/380/480 secondo la disposizione).
   Adesso montaTabellone() scrive la larghezza vera del legno in --tw e
   il corpo la divide per 30: la riga occupa 24,1 px per px di corpo col
   carattere di Windows e 22,6 con quello del telefono, il .tab-in e'
   l'85% del tabellone, quindi il massimo che ci sta e' tw/28,4 — con
   /30 restano cinque punti di margine sul peggiore dei due.
   nowrap non e' cosmetica: senza, un traboccamento tornerebbe a essere
   un a-capo, che nessuna misura vede; con nowrap diventa scrollWidth >
   clientWidth, che il cancello strumenti/testo-fuori.js legge. */
.tab-kick{
  font-family:var(--cond);font-weight:700;font-size:clamp(6px,calc(var(--tw,300px)/30),11px);
  letter-spacing:.18em;white-space:nowrap;
  text-transform:uppercase;color:rgba(242,245,239,.62);line-height:1.1;
}`,
},

/* 4 — la didascalia sotto la targa: era TAGLIATA, non a capo */
{
  nome: '4/5 .tab-sotto: il corpo cede davvero, come dice il suo commento',
  cerca: `  position:absolute;left:7%;right:10%;top:80.5%;height:15%;overflow:hidden;
  font-family:var(--cond);font-weight:700;font-size:clamp(9px,2.2vw,13px);letter-spacing:.16em;`,
  metti: `  position:absolute;left:7%;right:10%;top:80.5%;height:15%;overflow:hidden;
  /* IL CORPO NON CEDEVA (28 agosto 2026). Era clamp(9px,2.2vw,13px),
     cioe' legato alla FINESTRA, mentre il riquadro qui sopra segue il
     TABELLONE, che ha un tetto suo: in orizzontale la finestra porta il
     corpo al massimo di 13 px, la riga occupa 249 px, e il riquadro ne
     ha 246 a 845x402, 236 a 812x375, 215 a 740x360, 166 a 360x640. Con
     overflow:hidden due righe piu' su questo non e' un a-capo: sono
     lettere MANGIATE, fino a 34 px, e ci sono state finche' nessuno ha
     guardato (le ha trovate strumenti/testo-fuori.js alla prima corsa,
     sul gioco spedito). Adesso il corpo si divide sulla larghezza vera
     del legno, che montaTabellone() pubblica in --tw: la riga occupa
     19,2 px per px di corpo, il riquadro e' l'83% del tabellone, quindi
     il massimo che ci sta e' tw/23,1 — con /25 restano otto punti di
     margine, che e' quanto serve a reggere anche un carattere di
     ripiego un po' piu' largo. */
  font-family:var(--cond);font-weight:700;font-size:clamp(7px,calc(var(--tw,300px)/25),13px);letter-spacing:.16em;`,
},

/* 5 — chi misura il legno lo dice anche al CSS */
{
  nome: '5/5 montaTabellone pubblica la larghezza del legno in --tw',
  cerca: `function montaTabellone(el){
  if(!el || el.offsetWidth<8) return;
  let cv2=el.querySelector('canvas.tabcv');`,
  metti: `function montaTabellone(el){
  if(!el || el.offsetWidth<8) return;
  /* LA MISURA DEL LEGNO LA LEGGE ANCHE IL CSS. Il testo del tabellone
     sta nel DOM (deve crescere con TESTO GRANDE e restare leggibile a
     un lettore di schermo) ma il suo riquadro e' in percentuale del
     tabellone, che ha un tetto proprio: legare un corpo alla finestra
     mandava «DOPOLAVORO FC · LE SETTE DI SERA» a capo con SERA da sola
     in orizzontale. Questa e' la stessa offsetWidth con cui si dipinge
     il canvas, pubblicata dove il CSS puo' contarci sopra. Si scrive
     PRIMA dell'uscita anticipata qui sotto: quella salta il ridisegno
     quando la misura non e' cambiata, ma --tw deve esserci comunque
     — anche alla prima chiamata dopo un ritorno in home. */
  el.style.setProperty('--tw', el.offsetWidth + 'px');
  let cv2=el.querySelector('canvas.tabcv');`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-titolo.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.titolo.html';
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

/* --- I CONTROLLI DOPO LA SOSTITUZIONE --- */
const attesi = [
  ['textLength="515" lengthAdjust="spacingAndGlyphs"', 2],   // i due <text> del marchio, e SOLO quelli
  ['font-weight="900" font-size="100" textLength="515"', 2],
  [`font-size="100">CALCETT</text>`, 0],                     // niente piu' testo senza ingombro fissato
  [`font-size="100"><tspan fill="#f2f5ef">`, 0],
  ['font-size:clamp(8px,1.9vw,11px)', 0],                    // il vecchio corpo legato alla finestra e' sparito
  ['font-size:clamp(9px,2.2vw,13px)', 0],                    // e nemmeno la didascalia lo usa piu'
  ['font-size:clamp(6px,calc(var(--tw,300px)/30),11px)', 1],
  ['font-size:clamp(7px,calc(var(--tw,300px)/25),13px)', 1],
  ['white-space:nowrap;\n  text-transform:uppercase', 1],
  ['white-space:nowrap;letter-spacing:.10em;', 1],           // la didascalia resta su una riga sola
  ["el.style.setProperty('--tw', el.offsetWidth + 'px');", 1],
  ['viewBox="0 0 634 152"', 2],                              // il riquadro del marchio non si tocca
  ['<circle cx="561" cy="82" r="38" fill="none"', 1],        // ne' la O
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => JSON.stringify(s.slice(0, 60)) + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

/* LA LEGGE SUI SORTEGGI, verificata e non data per scontata: questa
   toppa non tocca la simulazione, e il conto delle chiamate a dado()
   deve restare identico al byte. Si contano anche i Math.random(), che
   nel gioco non devono esistere fuori dai commenti. */
const contaDado = s => (s.match(/\bdado\s*\(/g) || []).length;
const contaRnd = s => (s.match(/Math\.random\s*\(/g) || []).length;
if (contaDado(src) !== contaDado(out) || contaRnd(src) !== contaRnd(out)) {
  console.error(`FALLITO: il caso e' cambiato. dado() ${contaDado(src)} -> ${contaDado(out)}, ` +
    `Math.random() ${contaRnd(src)} -> ${contaRnd(out)}`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    dado() ' + contaDado(out) + ' chiamate (invariato), Math.random() ' + contaRnd(out));
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
