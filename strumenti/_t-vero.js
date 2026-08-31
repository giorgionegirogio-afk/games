/* =====================================================================
   _t-vero.js — I NUMERI FALSI CHE _t-campo.js HA SPEDITO DENTRO IL GIOCO
   (28 agosto 2026, sera).

   ============================== IL DIFETTO ==============================
   Non e' un difetto che si vede a schermo: e' un difetto che si legge.
   La toppa strumenti/_t-campo.js, applicata --dentro oggi pomeriggio, ha
   scritto dentro CALCETTO-il-gioco.html sette numeri che il codice
   accanto smentisce. Regola di casa 4: un commento falso e' un difetto
   quanto una riga sbagliata, perche' e' la mappa con cui il prossimo
   lavoratore decide dove mettere le mani. Cinque dei sette hanno la
   stessa forma — il commento dice una soglia e la @media sotto ne dice
   un'altra — e due sono numeri veri il 28 agosto a mezzogiorno e falsi
   il 28 agosto a sera, perche' in mezzo il gioco ha preso i suoi
   CARATTERI VERI e ogni parola si e' stretta di un terzo.

   E il settimo non era solo un numero sbagliato: era un difetto vero
   che nessun cancello vedeva. Vedi l'ancoraggio 6.

   ==================== I SETTE, UNO PER UNO, COL VERO ====================

   1-2-3. «sotto i 380 px» in TRE punti, contro `@media (max-height:340px)`
      scritta sei righe piu' sotto. La soglia di D e' 340. Il numero 380
      e' il valore BOCCIATO IN CORSA: la sua stessa toppa lo scrive nel
      proprio intestazione («LA SOGLIA DI D E' 340 E NON 380»), poi manda
      dentro il gioco tre volte quello vecchio. Chi legge il commento e
      cerca il gradino a 380 non lo trova, o peggio: crede che 812x375
      (telefono vero) perda le righine, e non e' cosi'.
      Verificato oggi: la sola taglia sotto i 340 in batteria e' 568x320,
      ed e' l'unica dove `#gioca .ment small` risulta display:none
      (misurato). A 915x412 e a 812x375 la riga piccola c'e'.

   4. «restano alte 29 px, e con la riga piccola 42 e 54: sopra i 44 px di
      bersaglio per il pollice». Due bugie in una riga e mezzo.
      MISURATO OGGI (915x412 e 812x375, caratteri veri): .diff 29 px,
      .taglia 42, .ment 42. Il 54 era l'altezza della MENTALITA' quando
      la sua riga piccola andava A CAPO — succedeva col ripiego di
      sistema, largo un terzo in piu' — e stamattina non succede piu'.
      E «sopra i 44» era falso gia' quando fu scritto: 42 non e' sopra 44.
      Il numero vero, adesso scritto: 42 px, cioe' due sotto i 44 e
      quattro sotto i 46 che il FISCHIO FINALE si e' dato. Non si alza
      qui — costerebbe una decina di pixel a una schermata che a 915x412
      ne avanza due — ma si dichiara invece di addolcirlo.

   5. «Portandolo a 860 la citazione diventa una riga sola e la pagina
      recupera 17 px — che a 915x412 sono la differenza fra 26 px di
      eccedenza (sopra la soglia dei 28 con cui il gioco accende il
      chevron) e 9 px».
      MISURATO OGGI spegnendo la regola e rimisurando: 915x412 -> 2 px
      con e 2 px senza; 811x384 -> 17 e 17; 812x375 -> 26 e 26. La regola
      OGGI VALE ZERO, perche' coi caratteri veri la citazione sta su una
      riga sola gia' dentro i 640 px.
      E dentro c'era anche una terza cosa, piu' vecchia dei caratteri:
      «26 px di eccedenza (SOPRA la soglia dei 28)». 26 non e' sopra 28.
      La soglia sta in aggiornaSfumatura() e vale 28.

   6. «eccedenza 9 px a 915x412» nel commento HTML della schermata GIOCA.
      MISURATO OGGI: 2 px. Il 9 e' la misura di mezzogiorno.

   7. «La guida a sei caselle qui sopra usa 1.5fr repeat(5,1fr)» — e sei
      righe piu' sopra la guida dice, nel suo commento, «SETTE CASELLE,
      non piu' sei: la settima e' SFIDA», e nel suo codice
      `1.5fr repeat(6,1fr)`. Il commento della cura descrive una griglia
      che non esiste piu'. QUESTA VOLTA IL NUMERO FALSO NON ERA SOLO UN
      NUMERO: la cura ha scritto SEI colonne per SETTE voci, e sotto i
      700 px di larghezza la settima — NEGOZIO, l'unico posto dove il
      gioco incassa — cade su una seconda riga da sola, sotto GIOCA,
      incollata al bordo basso dello schermo.
      MISURATO OGGI (fotografato in fuori/deb-home-640x360-oggi.png):
        568x320  7 voci in 6 colonne -> righe 6+1, NEGOZIO x 12..132
                 y 261..311 su uno schermo alto 320
        640x360  7 voci in 6 colonne -> righe 6+1, NEGOZIO x 14..150
                 y 299..350 su uno schermo alto 360
        740x360 e oltre  7 colonne, una riga sola: li' la @media non entra
      Non e' il ROSSO A di stamattina — la voce si vede e si tocca
      (elementFromPoint sul suo centro restituisce se' stessa a tutte e
      due le taglie) — ma e' un ORFANO, che e' esattamente il guaio per
      cui esiste strumenti/disposizione.js. Nessuno l'ha visto perche'
      il formato piu' stretto di quel cancello e' 740x360 e la @media
      comincia a 700: il difetto vive nella fessura fra i due numeri.

   ============================== LA CURA =================================
   Sei ancoraggi riscrivono i commenti col numero misurato oggi; il
   settimo cambia UN CARATTERE di CSS, `repeat(5,` -> `repeat(6,`, e
   ridа alla home la sua settima colonna.
   PROVATA PRIMA DI SCRIVERLA, e su quattro strade invece che su una
   (strumenti/_diag-debito4.js, che stampa righe / testo tagliato / testo
   a capo per ogni variante):
     6 colonne (oggi)             righe 6+1   niente tagliato, niente a capo
     1.5fr repeat(6,minmax(0,1fr)) righe 7    niente tagliato, niente a capo
     repeat(7,minmax(0,1fr))      righe 7     niente tagliato, niente a capo
     repeat(4,minmax(0,1fr))      righe 4+3   niente tagliato, niente a capo
   Si prende la seconda perche' e' l'unica che tiene la gerarchia (GIOCA
   una volta e mezzo le altre, che e' la ragione per cui la prima colonna
   e' 1.5fr) e mette tutto su una riga. Le fotografie stanno in
   fuori/deb-home-568x320-sette.png e fuori/deb-home-640x360-sette.png.

   ======================= IL CONTO DEI SORTEGGI ==========================
   Zero. Sei ancoraggi su sette toccano solo commenti, il settimo un
   carattere di CSS: non c'e' una riga di JavaScript. Il conto dei dado()
   e quello dei Math.random() sono verificati identici DOPO la
   sostituzione, qui sotto, invece che dati per scontati. Sul gioco di
   oggi valgono 86 e 5 (misurati, non ricordati).

   ============================ COME SI RIFA' =============================
     node strumenti/_t-vero.js --out fuori/debito.html
     node strumenti/collaudo.js     --gioco fuori/debito.html
     node strumenti/diritti.js      --gioco fuori/debito.html
     node strumenti/testo-fuori.js  --gioco fuori/debito.html
     node strumenti/_q-carattere.js --gioco fuori/debito.html
     node strumenti/tocco.js        --gioco fuori/debito.html
     node strumenti/disposizione.js --gioco fuori/debito.html

   uso:  node strumenti/_t-vero.js --out fuori/debito.html
         node strumenti/_t-vero.js --elenco
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

/* ---------------------------------------------------------------- 1 */
{
  nome: '1/7 la regola d\'ordine cita la soglia vera del gradino D: 340, non 380',
  cerca:
`   REGOLA D'ORDINE: si toglie aria, mai contenuto — tranne nel gradino
   sotto i 380 px, dove e' dichiarato.`,
  metti:
`   REGOLA D'ORDINE: si toglie aria, mai contenuto — tranne nel gradino
   sotto i 340 px, dove e' dichiarato. (Qui c'era scritto 380: era la
   soglia provata e bocciata in corsa, non quella che il codice porta.
   Rettificato il 28 agosto 2026 leggendo la @media qui sotto.)`,
},

/* ---------------------------------------------------------------- 2 */
{
  nome: '2/7 l\'altezza vera delle pastiglie nel gradino C: 29 e 42, non 29 / 42 e 54',
  cerca:
`/* C — sotto i 540: il telefono coricato, che e' come il gioco si gioca.
   Le pastiglie perdono 3 px di imbottitura per lato (restano alte 29 px,
   e con la riga piccola 42 e 54: sopra i 44 px di bersaglio per il
   pollice dove il bersaglio e' la pastiglia intera). */`,
  metti:
`/* C — sotto i 540: il telefono coricato, che e' come il gioco si gioca.
   Le pastiglie perdono 3 px di imbottitura sopra e 3 sotto (da 8px 4px a
   5px 4px).
   QUANTO RESTANO ALTE, MISURATO IL 28 AGOSTO 2026 A SERA coi caratteri
   veri del gioco, a 915x412 e a 812x375: la DIFFICOLTA' 29 px (non ha la
   riga piccola), la ROSA 42, la MENTALITA' 42.
   QUI C'ERA SCRITTO «42 e 54: sopra i 44 px di bersaglio per il pollice»,
   e sono due numeri falsi in una riga. Il 54 era l'altezza della
   MENTALITA' quando la sua riga piccola andava A CAPO: succedeva finche'
   il gioco scriveva nel ripiego di sistema, largo un terzo in piu' dei
   suoi caratteri veri, e da stamattina non succede piu'. E «sopra i 44»
   era falso anche allora, perche' 42 non e' mai stato sopra 44.
   IL NUMERO VERO, DICHIARATO INVECE CHE ADDOLCITO: qui il bersaglio del
   pollice e' alto 42 px, due sotto i 44 di riferimento e quattro sotto i
   46 che il FISCHIO FINALE si e' dato. Non si alza in questa toppa:
   costerebbe una decina di pixel di altezza a una schermata che a
   915x412 ne avanza due (eccedenza misurata 2 px). Resta scritto, e chi
   ha dieci pixel da spendere sa dove metterli. */`,
},

/* ---------------------------------------------------------------- 3 */
{
  nome: '3/7 la regola dei 860 px dichiara quello che vale oggi: zero, non diciassette',
  cerca:
`/* LA CITAZIONE SU UNA RIGA SOLA. Il riquadro del contenuto e' largo 640
   px e la citazione ci sta in due righe; sopra i 700 px di larghezza lo
   spazio a destra e a sinistra e' vuoto e non serve a niente. Portandolo
   a 860 la citazione diventa una riga sola e la pagina recupera 17 px —
   che a 915x412 sono la differenza fra 26 px di eccedenza (sopra la
   soglia dei 28 con cui il gioco accende il chevron) e 9 px (sotto: la
   pastiglia con la freccia non compare, e non promette contenuto che non
   c'e'). Il riquadro largo non sposta nient'altro: la riga delle scelte
   resta capata a 640 px e centrata. */`,
  metti:
`/* LA CITAZIONE SU UNA RIGA SOLA — e oggi questa regola non recupera piu'
   niente, il che e' un fatto da scrivere, non da nascondere.
   QUANDO FU SCRITTA (28 agosto 2026, mezzogiorno): il riquadro largo 640
   px mandava la citazione a due righe, portarlo a 860 ne recuperava 17,
   e a 915x412 quei 17 erano la differenza fra 26 px di eccedenza e 9.
   MISURATO OGGI A SERA spegnendo la regola e rimisurando la schermata:
     915x412   2 px con la regola,  2 px senza
     811x384  17 px con la regola, 17 px senza
     812x375  26 px con la regola, 26 px senza
   VALE ZERO, e la ragione e' la stessa di tutte le misure di stamattina:
   coi caratteri veri del gioco la citazione sta su una riga sola gia'
   dentro i 640 px. La regola resta perche' e' la rete del giorno in cui
   la citazione si allunga, ma il suo prezzo dichiarato e' zero.
   E C'ERA UNA TERZA COSA FALSA, piu' vecchia dei caratteri: «26 px di
   eccedenza (SOPRA la soglia dei 28 con cui il gioco accende il
   chevron)». Ventisei non e' sopra ventotto. La soglia sta scritta in
   aggiornaSfumatura() e vale 28: col riquadro a 640 il chevron non si
   sarebbe acceso lo stesso.
   Il riquadro largo non sposta nient'altro: la riga delle scelte resta
   capata a 640 px e centrata. */`,
},

/* ---------------------------------------------------------------- 4 */
{
  nome: '4/7 il gradino D dice la sua soglia vera, due volte: 340, non 380',
  cerca:
`/* D — sotto i 380 px di altezza si toglie CONTENUTO, ed e' l'unico posto
   dove questa toppa lo fa. Spariscono le righine sotto le pastiglie («la
   gabbia», «blocco basso e stretto»): e' il precedente che la home ha
   gia' (#menu .voce small{display:none} sotto i 470 px), e sotto i 380
   l'alternativa non e' una schermata piu' povera — e' una schermata in
   cui la scelta non si puo' fare. */`,
  metti:
`/* D — sotto i 340 px di altezza si toglie CONTENUTO, ed e' l'unico posto
   dove questa toppa lo fa. Spariscono le righine sotto le pastiglie («la
   gabbia», «blocco basso e stretto»): e' il precedente che la home ha
   gia' (#menu .voce small{display:none} sotto i 470 px), e sotto i 340
   l'alternativa non e' una schermata piu' povera — e' una schermata in
   cui la scelta non si puo' fare.
   QUI C'ERA SCRITTO 380, DUE VOLTE, e la @media qui sotto ha sempre
   detto 340. Il 380 fu provato e bocciato lo stesso giorno, perche'
   prendeva 812x375, 740x360 e 640x360 — telefoni veri — e li' le
   righine servono. Il numero sbagliato faceva credere che su quei tre
   apparecchi la riga piccola sparisse: non sparisce. Rettificato il 28
   agosto 2026 rileggendo la regola accanto; l'unica taglia in batteria
   che sta sotto i 340 e' 568x320, ed e' l'unica dove la riga piccola
   della MENTALITA' risulta display:none (misurato). */`,
},

/* ---------------------------------------------------------------- 5 */
{
  nome: '5/7 il commento della schermata GIOCA porta l\'eccedenza vera: 2 px, non 9',
  cerca:
`         adesso rientra (eccedenza 9 px a 915x412, sotto i 28 con cui il
         gioco accende il chevron), ma la promessa non si riscrive al`,
  metti:
`         adesso rientra (eccedenza 2 px a 915x412, sotto i 28 con cui il
         gioco accende il chevron). Qui c'era scritto 9: era la misura
         del 28 agosto a mezzogiorno, prima che il gioco prendesse i suoi
         caratteri veri e ogni parola si stringesse di un terzo — a sera
         la stessa schermata ne misura 2. Ma la promessa non si riscrive al`,
},

/* ---------------------------------------------------------------- 6 */
{
  /* L'ANCORAGGIO E' IL CODICE, NON IL COMMENTO, e sta a sette righe dal
     blocco riscritto dall'ancoraggio 7: si tengono separati apposta,
     perche' cosi' se domani qualcuno tocca la griglia senza toccare il
     commento (o viceversa) cade UN ancoraggio solo e si vede quale. */
  nome: '6/7 LA CURA VERA: la home stretta ritrova la settima colonna (5 -> 6 ripetizioni)',
  cerca: `  #menu .menu-voci{grid-template-columns:1.5fr repeat(5,minmax(0,1fr))}`,
  metti: `  #menu .menu-voci{grid-template-columns:1.5fr repeat(6,minmax(0,1fr))}`,
},

/* ---------------------------------------------------------------- 7 */
{
  nome: '7/7 e il commento della home dice quante caselle ci sono davvero: sette',
  cerca:
`/* =====================================================================
   LA SESTA CASELLA DELLA HOME NON ESCE PIU' DALLO SCHERMO (28 ago 2026).

   La guida a sei caselle qui sopra usa «1.5fr repeat(5,1fr)», e un 1fr
   non scende mai sotto il proprio min-content. Le sei voci vogliono 578
   px di testo piu' 30 di spazi = 608; a 568 px di larghezza ce ne sono
   543. La griglia sfora a destra e la SESTA casella — NEGOZIO — esce.
   MISURATO a 568x320: NEGOZIO occupava x 546..621 su una finestra larga
   568, centro x=583, cioe' fuori dal vetro. E la home in orizzontale non
   scorre (#menu .box e' position:absolute con inset:0): non era un
   bersaglio da scorrere, era un bersaglio che non esisteva. Il negozio
   e' l'unico posto dove il gioco incassa.
   Trovato da strumenti/tocco.js alla sua prima corsa, non a occhio.

   LA CURA: minmax(0,1fr) toglie il pavimento alle colonne, e il testo si
   stringe con loro. Due gradini di corpo e non uno, misurati: a 568 px
   con 11 px il testo di SPOGLIATOIO traboccava ancora dalla casella, con
   9,5 px no; e imporre 9,5 px anche a 640x360 — dove oggi la home sta
   bene — sarebbe stato pagare due volte.
   Sopra i 700 px di larghezza non cambia niente: 740, 812 e 915 vedono
   la home di ieri al pixel. */`,
  metti:
`/* =====================================================================
   LA SETTIMA CASELLA DELLA HOME NON ESCE PIU' DALLO SCHERMO, E NON
   FINISCE PIU' SU UNA RIGA DA SOLA (28 ago 2026, due giri).

   IL DIFETTO DI PARTENZA, a mezzogiorno: la guida qui sopra usava
   «1.5fr repeat(6,1fr)» e un 1fr non scende mai sotto il proprio
   min-content. La griglia sforava a destra e l'ultima casella —
   NEGOZIO — usciva dal vetro. MISURATO a 568x320: NEGOZIO occupava
   x 546..621 su una finestra larga 568, centro x=583, cioe' fuori. E la
   home in orizzontale non scorre (#menu .box e' position:absolute con
   inset:0): non era un bersaglio da scorrere, era un bersaglio che non
   esisteva. Il negozio e' l'unico posto dove il gioco incassa.
   Trovato da strumenti/tocco.js alla sua prima corsa, non a occhio.

   LA CURA: minmax(0,1fr) toglie il pavimento alle colonne, e il testo si
   stringe con loro. Due gradini di corpo e non uno, misurati: a 568 px
   con 11 px il testo di SPOGLIATOIO traboccava ancora dalla casella, con
   9,5 px no; e imporre 9,5 px anche a 640x360 — dove oggi la home sta
   bene — sarebbe stato pagare due volte.
   Sopra i 700 px di larghezza non cambia niente: 740, 812 e 915 vedono
   la home di ieri al pixel.

   IL SECONDO GIRO, LA SERA, ED E' LA PARTE CHE VALE. La prima stesura di
   questo blocco scriveva «la guida a SEI caselle qui sopra usa 1.5fr
   repeat(5,1fr)» e ripeteva SEI colonne. Ma la guida qui sopra dichiara
   nel suo stesso commento «SETTE CASELLE, non piu' sei: la settima e'
   SFIDA», e nel codice porta repeat(6,1fr). Il commento descriveva una
   griglia che non esisteva piu', e il codice si e' adeguato al commento
   invece che alla griglia: SEI colonne per SETTE voci.
   COSA COMPRAVA QUELL'ERRORE, misurato il 28 agosto 2026 a sera:
     568x320   7 voci in 6 colonne -> due righe (6+1). NEGOZIO da solo a
               x 12..132, y 261..311 su uno schermo alto 320.
     640x360   7 voci in 6 colonne -> due righe (6+1). NEGOZIO da solo a
               x 14..150, y 299..350 su uno schermo alto 360, incollato
               al bordo basso.
     740x360   7 colonne, una riga: sopra i 700 px questa @media non
               entra e non c'era niente da vedere.
   Non era piu' il rosso di mezzogiorno — la voce si vede e si tocca,
   document.elementFromPoint sul suo centro restituisce se' stessa a
   tutte e due le taglie — ma era una voce ORFANA su una riga sua, che e'
   il guaio per cui esiste strumenti/disposizione.js. Nessuno l'ha vista
   perche' il formato piu' stretto di quel cancello e' 740x360 e questa
   @media comincia a 700: il difetto viveva nella fessura fra i due
   numeri. Da oggi disposizione.js misura anche 640x360 e 568x320.
   LA CORREZIONE E' UN CARATTERE: repeat(5,...) -> repeat(6,...), cioe'
   sette colonne per sette voci. Provata contro tre alternative prima di
   essere scelta (strumenti/_diag-debito4.js): con sette colonne, a
   568x320 e a 640x360, nessuna etichetta viene tagliata e nessuna va a
   capo — e' l'unica variante che tiene insieme la riga sola e la
   gerarchia di GIOCA (la prima colonna e' 1.5fr apposta). */`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-vero.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

/* LA REGOLA DI CASA 1: qui NON esiste --dentro. Questa toppa scrive solo
   su una copia. Se serve entrare nel gioco lo fa chi ha letto il referto
   dei cancelli, con le mani sue. */
if (haFlag('dentro')) {
  console.error('FALLITO: --dentro non esiste in questa toppa. Si prova su copia: --out fuori/<nome>.html');
  process.exit(2);
}

const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }
let outFile = arg('out', '');
if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.vero.html';
outFile = path.resolve(RADICE, outFile);
if (outFile === inFile) { console.error('FALLITO: --out coincide con --in.'); process.exit(2); }

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

/* ===================== I CONTROLLI DOPO LA SOSTITUZIONE =================
   IL CONTO DEI SORTEGGI E' IL PRIMO, e si verifica anche qui dove la
   toppa non scrive una riga di JavaScript: darlo per scontato e' il modo
   in cui un giorno non lo si verifica piu'. Si contano tutti e due —
   dado() e Math.random() — perche' nel gioco Math.random() compare cinque
   volte e quattro sono dentro commenti. */
const contaCaso = s => (s.match(/\bdado\(\)/g) || []).length;
const contaRandom = s => (s.match(/Math\.random\(\)/g) || []).length;

const attesi = [
  /* i numeri veri ci sono */
  ['sotto i 340 px, dove e\' dichiarato', 1],
  ['la DIFFICOLTA\' 29 px (non ha la', 1],
  ['915x412   2 px con la regola,  2 px senza', 1],
  ['/* D — sotto i 340 px di altezza si toglie CONTENUTO', 1],
  ['eccedenza 2 px a 915x412', 1],
  ['#menu .menu-voci{grid-template-columns:1.5fr repeat(6,minmax(0,1fr))}', 1],
  ['LA SETTIMA CASELLA DELLA HOME NON ESCE PIU\' DALLO SCHERMO', 1],
  /* e i falsi non sopravvivono da nessuna parte. Le stringhe sono prese
     CON la loro coda, perche' i commenti nuovi CITANO la frase vecchia
     per dire che e' stata rettificata: un controllo sulla frase nuda si
     accenderebbe sulla citazione, cioe' accuserebbe la cura di essere il
     difetto. E' la stessa trappola gia' vista in _t-campo.js. */
  ['sotto i 380 px, dove e\' dichiarato', 0],
  ['/* D — sotto i 380 px di altezza', 0],
  ['e sotto i 380\n   l\'alternativa', 0],
  ['e con la riga piccola 42 e 54', 0],
  ['la pagina recupera 17 px', 0],
  ['(eccedenza 9 px a 915x412', 0],
  ['grid-template-columns:1.5fr repeat(5,minmax(0,1fr))', 0],
  ['La guida a sei caselle qui sopra', 0],
  /* la @media che il gradino D descrive e' rimasta dov'era: la toppa
     corregge il commento, non sposta la soglia */
  ['@media (max-height:340px){', 1],
  /* e la griglia a sette caselle di partenza non e' stata toccata */
  ['#menu .menu-voci{display:grid;grid-template-columns:1.5fr repeat(6,1fr);', 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => JSON.stringify(s.slice(0, 52)) + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));

/* IL NUMERO DI COLONNE E' UN CONTO, E SI CONTA — perche' il difetto che
   questa toppa chiude e' nato ESATTAMENTE da un conto dato per scontato.
   Le voci si contano nel corpo della home (fra l'apertura di #menu e il
   segnapunti appeso che chiude la guida), le colonne si leggono dalle
   due regole di griglia, e i tre numeri devono coincidere. Se domani
   nasce un'ottava voce, questo controllo cade e chi la aggiunge lo
   scopre qui invece che su un telefono. */
const i0 = out.indexOf('<div id="menu" class="ov">');
const i1 = out.indexOf('<div class="eroe-tab eroe-home"', i0);
const voci = (i0 >= 0 && i1 > i0) ? (out.slice(i0, i1).match(/<button class="voce/g) || []).length : -1;
if (voci < 1) rotti.push('non riesco a contare le voci della home: il conto delle colonne resterebbe una speranza');
const ripLarga = /#menu \.menu-voci\{display:grid;grid-template-columns:1\.5fr repeat\((\d+),1fr\)/.exec(out);
const ripStretta = /#menu \.menu-voci\{grid-template-columns:1\.5fr repeat\((\d+),minmax\(0,1fr\)\)\}/.exec(out);
if (!ripLarga) rotti.push('non trovo la griglia larga della home');
else if (+ripLarga[1] + 1 !== voci) rotti.push('la griglia LARGA della home ha ' + (+ripLarga[1] + 1) + ' colonne e le voci sono ' + voci);
if (!ripStretta) rotti.push('non trovo la griglia stretta della home');
else if (+ripStretta[1] + 1 !== voci) rotti.push('la griglia STRETTA della home ha ' + (+ripStretta[1] + 1) + ' colonne e le voci sono ' + voci + ': la voce in piu\' finisce su una riga da sola — e\' il difetto che questa toppa chiude');

if (contaCaso(out) !== contaCaso(src))
  rotti.push('il conto dei dado() e\' cambiato: ' + contaCaso(src) + ' -> ' + contaCaso(out));
if (contaRandom(out) !== contaRandom(src))
  rotti.push('il conto dei Math.random() e\' cambiato: ' + contaRandom(src) + ' -> ' + contaRandom(out));

/* NIENTE JAVASCRIPT. Sei ancoraggi su sette vivono dentro i commenti, il
   settimo dentro <style>: fuori dai commenti, il corpo del documento
   dev'essere identico carattere per carattere. */
const coda = s => s.slice(s.indexOf('</style>'));
const senzaCommenti = s => s.replace(/<!--[\s\S]*?-->/g, '');
if (senzaCommenti(coda(src)) !== senzaCommenti(coda(out)))
  rotti.push('la toppa ha toccato il corpo del documento fuori dai commenti: qui deve essere solo CSS e commenti');

if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('scritto ' + outFile + '  (' + ANCORE.length + ' ancoraggi, ' +
  (out.length - src.length) + ' caratteri in piu\', ' + voci + ' voci in home, dado() ' +
  contaCaso(out) + ' invariati, Math.random() ' + contaRandom(out) + ' invariati)');
