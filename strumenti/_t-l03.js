/* =====================================================================
   _t-l03.js — GLI INSERTI DI SISTEMA SOTTO I COMANDI (voce L0.3).

   Toppa cerca/sostituisci: legge CALCETTO-il-gioco.html (o --in),
   sostituisce DUE tratti dentro `touchBtnLayout`, e scrive la copia in
   --out. Se un solo ancoraggio non compare ESATTAMENTE UNA VOLTA si
   ferma con codice diverso da zero, dice quale, e non scrive niente.
   Non scrive MAI sull'originale: non esiste un'opzione per farlo.

   uso:
     node strumenti/_t-l03.js --out fuori/dopo.html
     node strumenti/_t-l03.js --in altro.html --out fuori/dopo.html
     (--da/--a sono accettati come sinonimi di --in/--out)

   BASE. Edizione 2, puntata sul gioco md5 c3f3b5021c2d2db3463cc94e186ce63d,
   1.776.576 byte. Se gli ancoraggi non ci sono, la toppa lo dice invece
   di indovinare.

   COSA E' CAMBIATO DALL'EDIZIONE 1, e perche' e' istruttivo. L'edizione 1
   era puntata su a9f8d15f92b52238ee927c1ade0a1c03 (1.753.151 byte) e non
   si applica piu': fra le due sono entrate tre toppe, e `_t-l04b.js` ha
   riscritto proprio il blocco del secondo ancoraggio. L'etichetta dei
   dischi non risponde piu' a «di chi e' il pallone» (`poss`) ma a «cosa
   otterrebbe il dito» (`puoTirare(t)`, `puoPassare(t)`), quindi il
   ternario su cui l'ancoraggio si posava non esiste piu' in quella forma.
   Il PRIMO ancoraggio invece non si e' mosso di un byte, e nemmeno i
   raggi di presa (r+10) ed esclusione (r+18), ne' i centri dei dischi.
   Rimisurato dopo il riallineamento: ancoraggi 1 e 1, distanza fra i
   centri 94,7629 px prima e dopo la toppa, prese disgiunte.

   E' anche il motivo per cui questa toppa ancora l'INTERO blocco del
   `return`, riga di `puoTirare` compresa, invece del solo array: se
   domani qualcuno cambia di nuovo la domanda che i dischi fanno, questa
   toppa si ferma e lo dice, invece di applicarsi su un blocco che nel
   frattempo ha cambiato significato.

   ---------------------------------------------------------------------
   IL DIFETTO, MISURATO SUL TELEFONO E NON DEDOTTO.

   Il gioco dichiara `viewport-fit=cover` (riga 5) e non usa NEMMENO UNA
   `env(safe-area-inset-*)`: cioe' chiede di disegnare sotto la tacca e
   sotto le barre, e poi si comporta come se i bordi fossero liberi.
   Con VW=810, VH=384 (OnePlus 6, 1 px CSS = 1 dp) i due dischi stanno a
   (746,324) r40 e (652,312) r30, e la PRESA vale r+10 (:8898): quella
   del disco grande arriva a x 796 — QUATTORDICI px dal bordo destro — e
   a y 374, DIECI px dal fondo.

   Misura del 19 agosto 2026, `node strumenti/_p-l03.js --prove 20`, con
   dita vere scritte su /dev/input/event2 (nessun `dispatchTouchEvent`:
   quello entra dentro la pagina e salta la catena di ingresso di
   Android, cioe' e' cieco proprio a questo):

     dito posato DENTRO la presa a 16 px dal bordo, poi trascinato
     verso sinistra                             RUBATO 20 volte su 20
     stesso gesto dal CENTRO del disco (64 px)  rubato  0 volte su 20

   «Rubato» vuol dire cio' che l'accusa nomina: alla pagina non arriva
   nessun touchstart, oppure arriva un touchcancel. In 13 di quelle 20
   prove il gioco e' anche andato IN PAUSA da solo, perche' il sistema
   ha eseguito «indietro» al posto suo (`window.__indietro`, :30384).

   E la fascia e' stata misurata, non presunta: 4, 10 e 16 px dal bordo
   danno 6 su 6 rubati; 17, 18, 19, 20, 21, 22, 28, 40 e 64 px danno 0 su
   6. Su QUESTO telefono, con questa sensibilita', la fascia del gesto
   «indietro» finisce fra 16 e 17 px. Il minimo che questa toppa usa e'
   24 px, che e' il valore di riferimento di Android (`config_backGestureInset`)
   e sta sopra il confine misurato — ma NON copre le sensibilita' «wide»
   e «extra wide» che l'utente puo' scegliere nelle impostazioni. Quelle
   le copre solo `setSystemGestureExclusionRects` dal lato Java, che e'
   la seconda meta' di questa riparazione e non sta in questo file.

   ---------------------------------------------------------------------
   COSA FA LA TOPPA, in una riga: legge davvero gli inserti sicuri con
   `env(safe-area-inset-*)`, li somma a una banda minima, e SPOSTA IL
   GRUPPO DEI DISCHI verso il campo di quel tanto.

   TRE SCELTE, e il perche' di ognuna.

   1. SI SPOSTA IL GRUPPO, NON I SINGOLI DISCHI. Ritagliare ogni disco
      per conto suo li avrebbe avvicinati: con la banda di 24 px il disco
      grande arretra di 10 px e il piccolo di zero, e la distanza fra i
      centri sarebbe scesa da 94,76 a 84,02. Le due PRESE valgono 50 e 40:
      a 84 px si sovrappongono, e la mezzaluna che `_t-precedenza.js` ha
      passato un'edizione intera a chiudere tornerebbe ad aprirsi — non
      come difetto mortale (la passata normalizzata regge) ma come
      geometria non piu' quella descritta nel gioco. Traslando il gruppo
      la distanza resta 94,76 px, esatta, e nessuna delle proprieta' gia'
      dimostrate cambia.

   2. IL RITAGLIO SI CALCOLA SULLA PRESA, NON SUL RAGGIO DIPINTO. Il
      bordo che conta e' quello che il DITO tocca, non quello che l'occhio
      vede: il cerchio dipinto ha raggio 40, ma il tocco prende a 50.
      Prendere il raggio dipinto lascerebbe dieci px di presa dentro la
      fascia, cioe' curerebbe la figura e non il difetto.

   3. GLI INSERTI SI LEGGONO UNA VOLTA, NON A OGNI FOTOGRAMMA.
      `touchBtnLayout` gira a ogni touchstart E a ogni fotogramma dentro
      `drawTouchButtons`: una `getComputedStyle` li' dentro sarebbe una
      lettura di stile forzata sessanta volte al secondo. Il valore si
      rilegge quando la finestra cambia misura (la rotazione e la
      comparsa delle barre passano tutte di li') e comunque non piu' di
      una volta al secondo.

   PERCHE' UN SOLO PUNTO. `touchBtnLayout` e' la sorgente unica: la usano
   il tocco (:8894), la riadozione (:9047), il disegno (:27402) e
   l'export `__test.pulsanti` (:31774). Toccando lei si spostano insieme
   il dipinto, la presa e cio' che i cancelli leggono — e l'incrocio a
   1 px fra `__test.pulsanti` e `__test.comandiTouch` continua a tornare.

   CIO' CHE QUESTA TOPPA NON FA, dichiarato: non tocca la levetta di
   sinistra (nasce dove il dito si posa, quindi non ha un riquadro da
   ritagliare), non tocca il tabellone in alto, e non protegge dal gesto
   «home»: quello parte dal fondo dello schermo e Android NON lo lascia
   escludere a nessuna applicazione. Contro il fondo qui c'e' solo la
   banda minima di 20 px, che allontana la presa dal punto dove il gesto
   nasce; il resto e' misura, non promessa.

   ---------------------------------------------------------------------
   DUE COSE NON MISURATE, scritte qui perche' non si perdano.

   1. LE SENSIBILITA' «WIDE». Che `setSystemGestureExclusionRects` copra
      anche le sensibilita' larghe del gesto indietro — gli overlay
      `gestural_wide_back` e `gestural_extra_wide_back`, che su questo
      telefono ESISTONO — lo so dal contratto di Android, NON da una
      misura: non ho mai cambiato quell'impostazione sul telefono. Se un
      giorno qualcuno la cambia, la misura si rifa' con
      `node strumenti/_p-l03.js --sweep` e il confine si sposta da solo.

   2. `Gioco.java` E' CONDIVISO CON CIRCOLO. `android/costruisci.py`
      costruisce i due giochi dalla stessa unica classe, quindi la banda
      di esclusione entra anche in CIRCOLO — che pero' e' VERTICALE
      (`orient='portrait'`) e non ha questi due dischi in fondo. Su
      CIRCOLO non ho misurato niente: ne' che la banda faccia bene, ne'
      che non tolga un gesto che li' serviva.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const arg = (...nomi) => {
  for (const n of nomi) {
    const i = process.argv.indexOf('--' + n);
    if (i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) return process.argv[i + 1];
  }
  return null;
};
const RADICE = path.resolve(__dirname, '..');
const DA = path.resolve(arg('in', 'da') || path.join(RADICE, 'CALCETTO-il-gioco.html'));
const A = arg('out', 'a');

const ANCORE = [
  {
    nome: "1/2 — la lettura degli inserti, sopra touchBtnLayout",
    vecchio:
`function touchBtnLayout(t){
  const right = (G.mode===2) ? (t===1) : true;
  const bx = right ? VW : 0;
  const s = right ? -1 : 1;`,
    nuovo:
`/* =====================================================================
   GLI INSERTI DI SISTEMA — dove il telefono NON e' del gioco.

   Questo file dichiara viewport-fit=cover fin dalla riga 5: chiede cioe'
   di disegnare sotto la tacca e sotto le barre. Chi lo chiede deve poi
   dire dove sono i bordi, altrimenti ha solo spostato il problema dal
   sistema all'utente. Misurato sul telefono con dita vere scritte sul
   dispositivo di ingresso del kernel (strumenti/_p-l03.js, 19 agosto
   2026): un dito posato dentro la presa del disco grande a 16 px dal
   bordo e trascinato verso sinistra non e' arrivato alla pagina in VENTI
   prove su VENTI — se lo prende il gesto «indietro» di Android, e in 13
   di quelle 20 il gioco e' andato in pausa da solo. Lo stesso gesto dal
   centro del disco: 0 su 20.
   ===================================================================== */
const INS_LAT_MIN = 24;   // px CSS (= dp): la fascia del gesto «indietro».
                          // Misurata su questo telefono fra 16 e 17 px;
                          // 24 e' il valore di riferimento di Android e sta
                          // sopra il confine misurato.
const INS_BAS_MIN = 20;   // px CSS: la striscia dove nasce il gesto «home».
                          // Android non lascia escludere quel gesto a
                          // nessuno: qui ci si limita ad allontanarsene.
let _insSonda = null, _insVal = {t:0,r:0,b:0,l:0}, _insQuando = -1e9, _insMis = '';
function insertiSicuri(){
  /* si rilegge quando la finestra cambia misura — rotazione, barre che
     compaiono, tastiera — e comunque non piu' di una volta al secondo:
     touchBtnLayout gira a ogni fotogramma, e una getComputedStyle a 60 Hz
     sarebbe una lettura di stile forzata per niente */
  const ora = (typeof performance!=='undefined' ? performance.now() : Date.now());
  const mis = innerWidth + 'x' + innerHeight;
  if(mis === _insMis && ora - _insQuando < 1000) return _insVal;
  _insMis = mis; _insQuando = ora;
  try{
    if(!_insSonda){
      /* env() si legge solo da una proprieta' CSS vera: si tiene un
         elemento invisibile, fuori dal flusso e senza pixel, il cui
         padding E' l'inserto. Non si indovina da innerWidth: la tacca
         non toglie larghezza alla finestra, la copre. */
      _insSonda = document.createElement('div');
      _insSonda.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;'+
        'visibility:hidden;pointer-events:none;'+
        'padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) '+
        'env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';
      document.body.appendChild(_insSonda);
    }
    const cs = getComputedStyle(_insSonda);
    _insVal = { t: parseFloat(cs.paddingTop)||0,    r: parseFloat(cs.paddingRight)||0,
                b: parseFloat(cs.paddingBottom)||0, l: parseFloat(cs.paddingLeft)||0 };
  }catch(e){
    /* se il documento non c'e' ancora, zero: la banda minima qui sotto
       protegge lo stesso, e un comando che non si disegna sarebbe peggio */
    _insVal = {t:0,r:0,b:0,l:0};
  }
  return _insVal;
}
/* i due dischi si spostano INSIEME, dello stesso vettore: ritagliarli uno
   per uno li avvicinerebbe (94,76 px fra i centri diventerebbero 84,02) e
   le due prese, 50 e 40, tornerebbero a sovrapporsi — la mezzaluna che
   strumenti/_t-precedenza.js ha chiuso. Il conto si fa sulla PRESA
   (bt.r+10, la stessa di Touch5.start) e non sul cerchio dipinto: il
   bordo che conta e' quello che il dito tocca. */
function dentroGliInserti(dischi, verso){
  const I = insertiSicuri();
  const latDx = Math.max(I.r, INS_LAT_MIN), latSx = Math.max(I.l, INS_LAT_MIN);
  const bas   = Math.max(I.b, INS_BAS_MIN);
  let versoCampo = 0, versoAlto = 0;
  for(const b of dischi){
    const presa = b.r + 10;
    /* «verso» e' lo stesso segno che il gioco usa per specchiare i comandi:
       -1 dischi a destra (il bordo che stringe e' VW - inserto destro),
       +1 dischi a sinistra (il bordo che stringe e' l'inserto sinistro,
       che su questo telefono E' la tacca: 29 px letti da env, non zero). */
    versoCampo = Math.max(versoCampo, verso < 0 ? (b.x + presa) - (VW - latDx)
                                                : (latSx + presa) - b.x);
    versoAlto  = Math.max(versoAlto,  (b.y + presa) - (VH - bas));
  }
  if(versoCampo > 0 || versoAlto > 0)
    for(const b of dischi){ b.x += verso * versoCampo; b.y -= versoAlto; }
  return dischi;
}
function touchBtnLayout(t){
  const right = (G.mode===2) ? (t===1) : true;
  const bx = right ? VW : 0;
  const s = right ? -1 : 1;`,
  },
  {
    nome: "2/2 — i due dischi escono dagli inserti prima di essere consegnati",
    vecchio:
`  const tira = puoTirare(t), passa = puoPassare(t);
  return [
    tira  ? { act:'shot',    label:'TIRA',      x:bx+s*64,  y:VH-60, r:40 }
          : { act:'slide',   label:'CONTRASTA', x:bx+s*64,  y:VH-60, r:40 },
    passa ? { act:'through', label:'PASSAGGIO', x:bx+s*158, y:VH-72, r:30 }
          : { act:'swap',    label:'CAMBIO',    x:bx+s*158, y:VH-72, r:30 },
  ];
}`,
    nuovo:
`  const tira = puoTirare(t), passa = puoPassare(t);
  /* dentroGliInserti sta QUI, sull'unica sorgente della geometria dei
     comandi: da questa funzione scendono il tocco (Touch5.start :8894),
     la riadozione (Touch5.move :9047), il disco armato che si rilegge per
     indice (:9538), il dipinto (drawTouchButtons :27402) e l'export
     __test.pulsanti (:31774). Spostandoli qui si spostano tutti insieme,
     l'incrocio a 1 px fra pulsanti e comandiTouch continua a tornare, e
     L'ORDINE DELL'ELENCO NON CAMBIA — 0 il grande, 1 il piccolo — che e'
     l'identita' su cui il motore d'ingresso rilegge il disco armato. */
  return dentroGliInserti([
    tira  ? { act:'shot',    label:'TIRA',      x:bx+s*64,  y:VH-60, r:40 }
          : { act:'slide',   label:'CONTRASTA', x:bx+s*64,  y:VH-60, r:40 },
    passa ? { act:'through', label:'PASSAGGIO', x:bx+s*158, y:VH-72, r:30 }
          : { act:'swap',    label:'CAMBIO',    x:bx+s*158, y:VH-72, r:30 },
  ], s);
}`,
  },
];

/* ------------------------------------------------------------------ */
if (!A) { console.error('FALLITO: manca --out <destinazione>.'); process.exit(1); }
if (!fs.existsSync(DA)) { console.error('FALLITO: sorgente inesistente: ' + DA); process.exit(1); }
const dest = path.resolve(A);
if (dest === DA) { console.error('FALLITO: --out e --in sono lo stesso file. Questa toppa non scrive sull\'originale.'); process.exit(1); }
if (dest === path.join(RADICE, 'CALCETTO-il-gioco.html')) {
  console.error('FALLITO: non scrivo sul gioco del deposito. Una toppa si misura su una copia.');
  process.exit(1);
}

let src = fs.readFileSync(DA, 'utf8');
const primaByte = Buffer.byteLength(src, 'utf8');

/* PRIMA SI CONTROLLA TUTTO, POI SI SCRIVE: una toppa che applica il primo
   ancoraggio e inciampa sul secondo lascia un file a meta', che e' peggio
   di una toppa che non applica. */
let male = 0;
for (const a of ANCORE) {
  const n = src.split(a.vecchio).length - 1;
  if (n !== 1) {
    male++;
    console.error(`FALLITO: ancoraggio «${a.nome}» trovato ${n} volte, non 1.`);
    console.error('  cercavo:\n' + a.vecchio.split('\n').slice(0, 6).map(r => '    | ' + r).join('\n'));
  }
  const g = src.split(a.nuovo).length - 1;
  if (g !== 0) { male++; console.error(`FALLITO: «${a.nome}» risulta GIA' applicato (${g} volte).`); }
}
if (male) { console.error('\nNon scrivo niente. ' + male + ' ancoraggi fuori posto.'); process.exit(1); }

for (const a of ANCORE) src = src.split(a.vecchio).join(a.nuovo);

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, src);
console.log(`toppa L0.3 applicata: ${ANCORE.length} ancoraggi, dentro touchBtnLayout`);
for (const a of ANCORE) console.log('    · ' + a.nome);
console.log('  da:   ' + DA);
console.log('  a:    ' + dest);
console.log(`  delta: ${Buffer.byteLength(src, 'utf8') - primaByte} byte UTF-8 sul disco`);
