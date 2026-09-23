/* =====================================================================
   _toppa-142-impronta.js — IL NASTRO DICHIARA IL MOTORE
   (voce #142, compito 2)

   Aggiunge al gioco una funzione, un campo, una porta, un tipo di riga
   (l'11) e una chiave di `window.__test`. Non tocca la fisica, non
   consuma un sorteggio, non cambia l'esito di nessuna sequenza di
   comandi: l'impronta si calcola PRIMA di startMatch, con funzioni che
   non pescano dal dado seminato, e in rilettura la riga 11 non fa niente
   (`esegui` non ha un ramo per lei, come non ce l'ha per la 7 e per la
   10). `MOTORE_V` resta 2, e si MISURA invece di affermarlo.

   ------------------------------------------------------------------
   PERCHE' IL NASTRO DEVE DIRE SU CHE MOTORE E' STATO SCRITTO
   ------------------------------------------------------------------
   Il #141 ha misurato che Chromium (V8), WebKit (JavaScriptCore) e
   Firefox (SpiderMonkey) non producono la stessa partita: ECMA-262
   lascia le trascendenti «implementation-approximated», e `Math.hypot`
   — che il gioco chiama 33 volte, una delle quali e' `len`, la distanza
   — da' l'ultimo bit diverso su 100 valori su 200 fra V8 e JSC. In un
   motore caotico a sessanta passi al secondo un ultimo bit diventa un
   gol.

   E il verificatore differito rigioca i nastri degli altri. Misurato
   (strumenti/_q-motore-nastro.js, 23 settembre 2026, sei sfide vere
   registrate su WebKit): giudicate su WebKit TORNA 6 su 6, giudicate su
   Chromium **NON TORNA 5 su 6**, su Firefox 2 su 6. NON TORNA e' l'unico
   verdetto che muove punti: li toglie a DUE persone, alza un sospetto
   che non decade mai e chiude la riga per sempre. Un iPhone gioca
   onesto, la staffetta apre chromium, e l'onesto diventa un sospetto.

   Il nastro oggi porta LO SCHERMO (riga 10, voce #133) e non il MOTORE,
   quindi il giudice non ha modo di accorgersene: `motore-diverso`, la
   causa che esiste gia', parla di `MOTORE_V`, cioe' della versione del
   motore DI GIOCO, non del motore JavaScript.

   ------------------------------------------------------------------
   PERCHE' UN'IMPRONTA FUNZIONALE E NON LO userAgent
   ------------------------------------------------------------------
   Tre ragioni, e nessuna e' una preferenza:
     1. lo userAgent e' un DATO PERSONALE — modello del telefono,
        versione del sistema — e finirebbe in un nastro che sta su un
        server e che l'avversario puo' scaricare;
     2. cambia a ogni aggiornamento del browser senza che il motore
        cambi il suo arrotondamento, e ogni aggiornamento renderebbe
        ingiudicabili tutti i nastri del giorno prima;
     3. si riscrive da una console in tre caratteri, mentre un conto
        dev'essere FATTO.

   Qui il motore si dichiara FACENDO IL CONTO. Sessantaquattro valori
   irrazionali (`i * 0.7310127 + 0.13`: moltiplicazione e addizione, che
   IEEE-754 obbliga a essere correttamente arrotondate, quindi gli
   INGRESSI sono identici ovunque), sette funzioni ciascuno, 448
   risultati letti A BIT — `Float64Array` -> `Uint32Array`, perche' la
   stampa decimale arrotonda a 17 cifre e nasconde proprio l'ultimo bit
   che cerchiamo — e ridotti con FNV-1a a 32 bit, che usa solo `^` e
   `Math.imul`, cioe' solo operazioni intere, esatte per norma ovunque.

   LE SETTE FUNZIONI SONO QUELLE CHE IL #141 HA TROVATO DIVERGENTI E CHE
   IL GIOCO CHIAMA DAVVERO: hypot (33 usi, 100/200 divergenti), sin (160
   usi, 7/200), cos (104, 3/200), tan (2, 9/200), exp (44, 2/200), atan2
   (26), log. `pow` e `sqrt` sono ESCLUSE APPOSTA: IEEE-754 le obbliga a
   essere correttamente arrotondate, quindi danno lo stesso bit ovunque
   e non separano niente. MISURATO (fuori/_sonda-142c.js): un'impronta
   fatta con le sole `pow` e `sqrt` vale 1634607669 su tutti e tre i
   motori — direbbe SEMPRE «stesso motore», cioe' attesterebbe invece di
   misurare. E' il falso _crit-motore-piatto, e nasce da questa misura.

   MISURATO, l'impronta vera: chromium 3274447767, webkit 4281245088,
   firefox 1495105755 — tre valori distinti su tre motori, identici su
   tre contesti freschi ciascuno.

   ------------------------------------------------------------------
   LA DIREZIONE DELL'ERRORE E' SICURA PER COSTRUZIONE
   ------------------------------------------------------------------
   `Float64Array`/`Uint32Array` leggono i bit nell'ordine della
   piattaforma, e una macchina big-endian darebbe un'impronta diversa a
   parita' di motore. Cosi' come una versione nuova del browser che
   cambiasse l'arrotondamento di una sola funzione. In tutti e due i casi
   si ottiene UN'ASTENSIONE IN PIU', mai un'accusa in piu': il giudice
   dira' «non lo so» su nastri che magari avrebbe potuto giudicare, e un
   onesto non confermato resta in lista senza perdere niente.

   E VA DETTO CHE L'IMPRONTA E' NECESSARIA, NON SUFFICIENTE: due motori
   che la danno uguale potrebbero ancora divergere su un valore non
   campionato. Il rischio residuo di accusa ingiusta e' ridotto, non
   azzerato. La cura che lo azzera e' un'altra ed e' il cantiere dopo —
   le trascendenti scritte in casa dalle sole operazioni IEEE-esatte. Il
   #141 ha misurato che il solo `hypot` riscritto fa convergere SETTE
   semi su otto: serve tutto il resto, e cambia tutti i numeri del gioco.

   uso: node strumenti/_toppa-142-impronta.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

const CAMBI = [];
const agg = (nome, cerca, sostituisci) => CAMBI.push({ nome, cerca, sostituisci });

/* ------------------------------------------------------------------
   1) improntaMotore(), accanto a MOTORE_V — le due versioni del motore
      stanno vicine apposta: una e' la versione del motore DI GIOCO,
      l'altra e' l'identita' del motore JAVASCRIPT, e chi legge il
      codice deve vedere subito che non sono la stessa cosa.
   ------------------------------------------------------------------ */
agg('improntaMotore', `const MOTORE_V = 2;

const Reg = {`, `const MOTORE_V = 2;

/* =====================================================================
   L'IMPRONTA DEL MOTORE JAVASCRIPT (voce #142, compito 2).

   NON E' MOTORE_V, ed e' il motivo per cui sta qui accanto: MOTORE_V
   dice quale versione del GIOCO ha registrato il nastro, questa dice
   quale motore JAVASCRIPT lo ha calcolato. Un nastro puo' avere la
   versione giusta del gioco e il motore sbagliato — anzi, fra un iPhone
   e un Android ce l'ha SEMPRE.

   PERCHE' SERVE. ECMA-262 lascia le funzioni trascendenti
   «implementation-approximated»: due motori conformi possono dare
   l'ultimo bit diverso sulla stessa Math.sin. MISURATO dalla voce #141:
   fra V8 e JavaScriptCore Math.hypot differisce su 100 valori su 200, e
   il gioco la chiama 33 volte (una e' len, la distanza). In un motore
   caotico a sessanta passi al secondo un ultimo bit diventa un gol: sei
   sfide oneste registrate su WebKit, rigiudicate su Chromium, danno
   CINQUE NON TORNA su sei (strumenti/_q-motore-nastro.js).

   PERCHE' NON LO userAgent. Perche' e' un dato personale che finirebbe
   su un server e nelle mani dell'avversario; perche' cambia a ogni
   aggiornamento del browser senza che il motore cambi davvero; e perche'
   si riscrive da una console in tre caratteri, mentre un conto dev'essere
   FATTO. Qui il motore si dichiara facendo il conto.

   COME. Sessantaquattro ingressi irrazionali costruiti con sole
   moltiplicazioni e addizioni (che IEEE-754 obbliga a essere
   correttamente arrotondate: gli INGRESSI sono identici ovunque, cosi'
   quel che si misura e' la FUNZIONE e non il valore), sette funzioni
   ciascuno, e i 448 risultati letti A BIT. La lettura a bit non e' un
   vezzo: toString arrotonda a 17 cifre e nasconde proprio l'ultimo bit
   che cerchiamo. La riduzione e' FNV-1a a 32 bit, che usa solo ^ e
   Math.imul — operazioni intere, esatte per norma su qualunque motore,
   altrimenti l'impronta divergerebbe per colpa dell'impronta.

   LE SETTE FUNZIONI sono quelle che il #141 ha trovato divergenti e che
   il gioco chiama davvero. pow e sqrt NON CI SONO, apposta: IEEE-754 le
   obbliga a essere correttamente arrotondate, quindi danno lo stesso bit
   ovunque. Un'impronta fatta con loro vale 1634607669 su tutti e tre i
   motori (MISURATO) e direbbe sempre «stesso motore»: attesterebbe
   invece di misurare, ed e' il falso _crit-motore-piatto.

   NON CONSUMA IL DADO SEMINATO e non tocca la simulazione: si chiama una
   volta per pagina, prima di startMatch, e il risultato resta in memoria.
   ===================================================================== */
let IMPRONTA_MOTORE = 0;
function improntaMotore(){
  if(IMPRONTA_MOTORE) return IMPRONTA_MOTORE;
  const f = new Float64Array(1), u = new Uint32Array(f.buffer);
  let h = 0x811c9dc5 >>> 0;
  const m = x => {
    f[0] = x;
    h = Math.imul((h ^ u[0]) >>> 0, 16777619) >>> 0;
    h = Math.imul((h ^ u[1]) >>> 0, 16777619) >>> 0;
  };
  for(let i = 1; i <= 64; i++){
    const v = i * 0.7310127 + 0.13;
    m(Math.hypot(v, v * 1.7));
    m(Math.sin(v));
    m(Math.cos(v));
    m(Math.tan(v));
    m(Math.exp(-v * 0.1));
    m(Math.atan2(v, v * 0.37 - 1.1));
    m(Math.log(v + 1));
  }
  /* MAI ZERO. Lo zero e' gia' la parola che dice «non c'e'»: la usa
     improntaDelNastro per un nastro senza riga 11, e il giudice per
     distinguere «motore diverso» da «motore ignoto». Un motore che per
     caso desse h = 0 sarebbe indistinguibile dalla propria assenza, e
     un'impronta che si confonde con il proprio vuoto e' peggio di
     nessuna impronta. */
  IMPRONTA_MOTORE = (h >>> 0) || 1;
  return IMPRONTA_MOTORE;
}

const Reg = {`);

/* ------------------------------------------------------------------
   2) il campo, accanto a ultimoSchermo
   ------------------------------------------------------------------ */
agg('campo ultimoMotore', `  /* L'ULTIMA MISURA DI FINESTRA SCRITTA NEL NASTRO (voce #139), o null se
     in questo nastro non ce n'e' ancora nessuna. La legge Reg.schermo,
     che e' la sola a scriverla: serve a non rimettere nel nastro una
     misura che il nastro dice gia'. */
  ultimoSchermo: null,`,
`  /* L'ULTIMA MISURA DI FINESTRA SCRITTA NEL NASTRO (voce #139), o null se
     in questo nastro non ce n'e' ancora nessuna. La legge Reg.schermo,
     che e' la sola a scriverla: serve a non rimettere nel nastro una
     misura che il nastro dice gia'. */
  ultimoSchermo: null,

  /* L'IMPRONTA DEL MOTORE JAVASCRIPT GIA' SCRITTA IN QUESTO NASTRO (voce
     #142), o 0 se non ancora. Come ultimoSchermo qui sopra, e per la
     stessa ragione: la porta che scrive e' una sola e non deve scrivere
     due volte la stessa cosa. La differenza e' che questa non cambia mai
     durante una partita — il motore non si aggiorna mentre si gioca —
     quindi la riga nel nastro e' esattamente UNA. */
  ultimoMotore: 0,`);

/* ------------------------------------------------------------------
   3) l'azzeramento all'accensione
   ------------------------------------------------------------------ */
agg('accendi', `    this.ultimoSchermo = null;
    this.azzeraComandi();`,
`    this.ultimoSchermo = null;
    this.ultimoMotore = 0;
    this.azzeraComandi();`);

/* ------------------------------------------------------------------
   4) la porta, accanto a Reg.schermo
   ------------------------------------------------------------------ */
agg('porta Reg.motore', `  schermo(w, h){
    if(this.modo !== 1) return;
    w = w|0; h = h|0;
    if(this.ultimoSchermo && this.ultimoSchermo[0] === w && this.ultimoSchermo[1] === h) return;
    this.ultimoSchermo = [w, h];
    this.scrivi(10, [w, h]);
  },`,
`  schermo(w, h){
    if(this.modo !== 1) return;
    w = w|0; h = h|0;
    if(this.ultimoSchermo && this.ultimoSchermo[0] === w && this.ultimoSchermo[1] === h) return;
    this.ultimoSchermo = [w, h];
    this.scrivi(10, [w, h]);
  },

  /* =====================================================================
     IL MOTORE JAVASCRIPT NEL NASTRO (voce #142, compito 2).

     La porta gemella di schermo() qui sopra, e sta accanto a lei perche'
     curano lo stesso difetto da due lati: la riga 10 dice su che
     SCHERMO sono stati dati i comandi, la 11 dice con che MOTORE sono
     stati calcolati gli effetti. Senza la prima, gli stessi pixel
     premono un altro punto del campo; senza la seconda, gli stessi
     numeri danno un'altra partita.

     UNA VOLTA SOLA, e qui la guardia e' piu' semplice che per lo
     schermo: una finestra si muove durante una partita (la barra
     dell'URL, voce #139), un motore no. La bandiera serve comunque,
     perche' la porta puo' essere chiamata piu' volte da chi riorganizza
     il codice domani, e due righe identiche non fanno danno ma sono due
     righe che nessuno voleva.

     E NON SI SCRIVE A REGISTRO SPENTO: come schermo(), come scrivi().
     Il gioco di casa non produce nastri.
     ===================================================================== */
  motore(){
    if(this.modo !== 1) return;
    const imp = improntaMotore();
    if(this.ultimoMotore === imp) return;
    this.ultimoMotore = imp;
    this.scrivi(11, [imp]);
  },`);

/* ------------------------------------------------------------------
   5) la scrittura nel formato
   ------------------------------------------------------------------ */
agg('serializza 11', `        pezzi.push(dT + ',10,' + dMs + ',' + (r[3]|0) + ',' + (r[4]|0));
      } else if(tipo === 7){`,
`        pezzi.push(dT + ',10,' + dMs + ',' + (r[3]|0) + ',' + (r[4]|0));
      } else if(tipo === 11){
        /* L'IMPRONTA DEL MOTORE JAVASCRIPT (voce #142). Un intero senza
           segno, dieci cifre al massimo, UNA VOLTA SOLA per nastro:
           su un nastro da centomila caratteri sono quindici caratteri,
           cioe' niente. In rilettura non fa niente (esegui non ha un
           ramo per l'11, come non ce l'ha per il 7 e per il 10): serve a
           chi GIUDICA, che deve sapere se puo' fidarsi della propria
           rigiocata prima di togliere punti a qualcuno.
           Il >>> 0 non e' decorativo: l'impronta sta sopra 2^31 una volta
           su due, e senza tornerebbe negativa dal |0. */
        pezzi.push(dT + ',11,' + dMs + ',' + ((r[3]|0) >>> 0));
      } else if(tipo === 7){`);

/* ------------------------------------------------------------------
   6) la lettura nel formato
   ------------------------------------------------------------------ */
agg('deserializza 11', `      else if(tipo === 10)  this.righe.push([tick, 10, ms, v[3], v[4]]);`,
`      else if(tipo === 10)  this.righe.push([tick, 10, ms, v[3], v[4]]);
      else if(tipo === 11)  this.righe.push([tick, 11, ms, (v[3]|0) >>> 0]);`);

/* ------------------------------------------------------------------
   7) la lettura dal nastro, accanto a schermoDelNastro
   ------------------------------------------------------------------ */
agg('improntaDelNastro', `/* LA PRIMA, che e' la misura con cui quella partita e' cominciata. Chi
   raggruppa i nastri per aprire una finestra sola (la staffetta, voce
   #138) chiede questa. */
function schermoDelNastro(){
  const v = schermiDelNastro();
  return v.length ? v[0] : null;
}`,
`/* LA PRIMA, che e' la misura con cui quella partita e' cominciata. Chi
   raggruppa i nastri per aprire una finestra sola (la staffetta, voce
   #138) chiede questa. */
function schermoDelNastro(){
  const v = schermiDelNastro();
  return v.length ? v[0] : null;
}
/* =====================================================================
   L'IMPRONTA DEL MOTORE SCRITTA NEL NASTRO APPENA LETTO (voce #142),
   o 0 se quel nastro e' di prima di questa cura.

   ZERO E' UNA RISPOSTA, non un guasto: vuol dire «questo nastro non dice
   con che motore e' stato calcolato», ed e' un caso che il giudice tratta
   a parte (motore-js-ignoto) da quello in cui lo dice e non coincide
   (motore-js-diverso). improntaMotore() non torna mai 0 apposta, proprio
   perche' questo 0 potesse restare libero di dire una cosa sola.

   La leggono in due, come schermiDelNastro: il giudice, che si astiene,
   e la staffetta, che apre il motore giusto. Una funzione sola perche' i
   due capi devono guardare la stessa cosa.
   ===================================================================== */
function improntaDelNastro(){
  try{
    for(const r of Reg.righe) if(r[1] === 11) return (r[3]|0) >>> 0;
  }catch(e){}
  return 0;
}`);

/* ------------------------------------------------------------------
   8) la riga nel nastro della sfida, accanto a quella dello schermo
   ------------------------------------------------------------------ */
agg('Sfida.gioca scrive il motore', `    Reg.schermo(innerWidth|0, innerHeight|0);
    startMatch(1, SFIDA_DIFF, {`,
`    Reg.schermo(innerWidth|0, innerHeight|0);
    /* E IL MOTORE JAVASCRIPT (voce #142), subito dopo lo schermo e per
       lo stesso motivo: senza, chi rigiochera' questo nastro non ha modo
       di sapere se sta rifacendo la stessa partita o un'altra che le
       somiglia. Misurato: sei sfide oneste registrate su WebKit,
       rigiudicate su Chromium, danno cinque NON TORNA su sei — e NON
       TORNA toglie i punti a due persone. Qui e non altrove perche' qui
       il registro e' gia' acceso e la partita non e' ancora cominciata:
       il conto delle 448 trascendenti non tocca il dado seminato. */
    Reg.motore();
    startMatch(1, SFIDA_DIFF, {`);

/* ------------------------------------------------------------------
   9) la porta per i banchi e per la staffetta
   ------------------------------------------------------------------ */
agg('__test.improntaMotore', `  get registroMotoreV(){ return Reg.motoreV; },   /* solo lettura, per il banco (voce #107) */`,
`  get registroMotoreV(){ return Reg.motoreV; },   /* solo lettura, per il banco (voce #107) */
  /* L'IMPRONTA DEL MOTORE JAVASCRIPT DI QUESTA PAGINA (voce #142). La
     chiedono i banchi, per misurare che separa i motori ed e' stabile,
     e LA STAFFETTA, che all'avvio la chiede a ogni motore disponibile
     per sapere quale aprire su quale nastro. */
  improntaMotore(){ return improntaMotore(); },
  /* e quella scritta nel nastro appena deserializzato, 0 se non c'e' */
  get nastroImpronta(){ return improntaDelNastro(); },`);

/* ------------------------------------------------------------------
   IL CANCELLO: o tutti gli ancoraggi sono unici, o non si scrive niente.
   ------------------------------------------------------------------ */
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_toppa-142-impronta.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('TOPPA NON APPLICATA: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
const guai = [];
for (const c of CAMBI) {
  const n = t.split(c.cerca).length - 1;
  if (n !== 1) { guai.push(`${c.nome}: ancoraggio trovato ${n} volte (ne serve esattamente 1)`); continue; }
  t = t.replace(c.cerca, c.sostituisci);
}
if (guai.length) { console.error('TOPPA NON APPLICATA:\n  ' + guai.join('\n  ')); process.exit(1); }
fs.writeFileSync(usc, t);
console.log(`toppa applicata: ${CAMBI.length} cambi, ${ing} -> ${usc}`);
