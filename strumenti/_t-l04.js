/* =====================================================================
   _t-l04.js — LA VOCE L0.4 DEL PROGETTO DEI COMANDI, PORTATA DAVANTI
   ALLA MISURA. NON APPLICA NIENTE, E QUI SOTTO C'E' PERCHE'.

   Il progetto (_analisi/agente28.md, L0.4) chiedeva due riparazioni da
   una riga. Misurate sul gioco del 19 agosto 2026
   (md5 a9f8d15f92b52238ee927c1ade0a1c03, 1.748.189 byte) con
   strumenti/_sonda-l04.js, una e' GIA' FATTA e l'altra e' una CURA
   PEGGIORE DEL MALE. Restano zero righe da cambiare.

   Lo strumento conserva l'ancoraggio esatto della riparazione B — testo
   cercato e testo sostitutivo — perche' il ragionamento e il codice
   siano riprendibili da chi vorra' rifare la misura su una base che si
   sara' mossa. Ma SI RIFIUTA DI SCRIVERE: serve --comunque, e chi lo usa
   sa che sta andando contro un numero.

   uso:
     node strumenti/_t-l04.js                      (dice perche' non scrive)
     node strumenti/_t-l04.js --elenco             (gli ancoraggi)
     node strumenti/_t-l04.js --comunque --out fuori/dopo.html
     node strumenti/_t-l04.js --comunque --in altro.html --out x.html
     node strumenti/_t-l04.js --comunque --dentro  (scrive nel gioco)

   Senza --out scrive accanto all'originale un file col suffisso
   .l04.html: mai sull'originale, se non con --dentro. Se anche un solo
   ancoraggio non compare ESATTAMENTE UNA VOLTA si ferma con codice 1,
   dice quale, e non scrive niente.

   ---------------------------------------------------------------------
   RIPARAZIONE A — «togliere humanSprint(t) dal ramo del tiro, perche'
   ogni tiro in corsa esce pallonetto». ACCUSA VERA DI UN'ALTRA EPOCA
   DEL FILE: oggi humanSprint non compare piu' nel ramo del tiro (lo
   tolse strumenti/_t-lob.js, e il verbale sta dentro releaseCharge).
   Ma non l'ho dedotto dal testo: l'ho misurato.

   node strumenti/_sonda-l04.js --pallonetto --prove 6 --rosso
   La sonda non conta G.stats.pallonetti — la bandiera la scrive fireShot,
   cioe' l'imputato — ma la QUOTA che il pallone raggiunge davvero nei
   0,30 s dopo il rilascio. La riga fra teso e scavalcato sta a 20 unita'
   perche' la spinta verticale che kickBall da' da sola a ogni calcio
   veloce e' al massimo 130, cioe' una cima di 15,1 unita' con la gravita'
   560, mentre il ramo del pallonetto imprime 175 o 205, cioe' cime di
   27,3 e 37,5: fra 15,1 e 27,3 non ci arriva nessuna delle due strade.

     configurazione (6 tiri ciascuna)     scavalcati OGGI   copia guasta
     levetta ferma                              0                0
     levetta 44 px avanti                       0                0
     levetta 44 px avanti + TASTO SPRINT        0                5
     levetta ferma + TASTO SPRINT               0                6
     levetta a fondo corsa, avanti              0                6
     levetta a fondo corsa, di lato             0                6
     fondo corsa INDIETRO, meta' offensiva      6                6
     fondo corsa INDIETRO, meta' difensiva      0                6
     ----------------------------------------------------------------
     in tutto                                6/48 = 12,5%   35/48 = 72,9%
     con humanSprint(0) VERO                 6/36 = 16,7%   35/36 = 97,2%

   La colonna «copia guasta» e' il gioco di oggi con il quinto argomento
   di fireShot riportato a humanSprint(t): e' la prova che la sonda sa
   diventare rossa. Le due righe col TASTO SPRINT tenuto e la levetta
   puntata VERSO la porta sono il discriminante — li' lo sprint c'e' e la
   direzione no — e oggi danno zero. Il pallonetto di oggi lo chiede la
   levetta tirata indietro nella meta' campo offensiva, e nient'altro.

   ---------------------------------------------------------------------
   RIPARAZIONE B — «possessoTeam legga anche b.passTo, piu' 0,25 s di
   isteresi: appena passi, i pulsanti dicono per ~0,35 s che la palla e'
   degli avversari». IL SINTOMO E' VERO ED E' PIU' GRANDE DELL'ACCUSA.
   LA CURA E' MISURATA PEGGIORE DEL MALE.

   node strumenti/_sonda-l04.js --etichetta --partite 3 [--gioco ...]
   Tre partite a passo fisso, 16.526 fotogrammi di gioco (275 s), semi
   20260803..05. La verita' non e' b.passTo — sarebbe il campo che la
   toppa vuole leggere — ne' possessoTeam, che e' l'imputato: e' l'ESITO,
   cioe' quale squadra prende DAVVERO il possesso successivo, letto
   scorrendo la traccia all'indietro.

                                              OGGI      CON LA TOPPA
     voli di un nostro passaggio che arriva
       a un nostro uomo                        50            50
     durata mediana del volo                 825 ms        825 ms
     ms per passaggio in cui i dischi
       dicono CONTRASTA/CAMBIO                1073 ms       406 ms
     ---------------------------------------------------------------
     dice NOSTRA e NESSUN nostro uomo di
       movimento arriva al pallone, quindi
       TIRA e PASSAGGIO non fanno niente       0 ms       33.050 ms
       (in frazione del tempo detto NOSTRA)   0,0%          36,9%
     e' LORO e i dischi dicono NOSTRA          0 ms       12.833 ms

   Il primo blocco e' l'accusa, ed e' confermata: 1073 ms per passaggio,
   non 350 — TRE VOLTE il numero del progetto. Il secondo blocco e' il
   prezzo, ed e' piu' caro: la toppa compra 667 ms per passaggio di
   etichetta onesta durante il volo e paga 33 secondi su 275 in cui i
   dischi offrono un gesto che non produce NIENTE, perche' il pallone e'
   fuori dalla portata di chiunque dei nostri (startCharge e doFiltrante
   non fanno niente oltre KICK_R*1,4 = 36,4 unita'). Oggi quel numero e'
   zero esatto, e non per fortuna: se il possesso e' di un nostro uomo,
   quel nostro uomo il pallone ce l'ha ai piedi.

   La sonda sa diventare rossa anche qui, e in tutte e due le direzioni:
   su una copia con possessoTeam sempre FALSO l'errore «e' nostra e dice
   loro» sale da 97.167 a 139.917 ms; su una copia sempre VERO l'errore
   opposto sale da 0 a 134.933 ms e la promessa impossibile a 68,1%.

   CONTROPROVA INDIPENDENTE, con un altro banco e un'altra partita
   (squadra 0 umana, dito robot): strumenti/_t-oracolo.js sul file
   toppato. La sua riga «gioco» coincide con il suo candidato «passTo»
   entro lo 0,05%, cioe' la toppa qui sotto E' quel candidato. Verdetto:
   «dice TIRA e startCharge non farebbe niente» 9,70% -> 22,19%; e delle
   71 volte in cui il pallone ci viene strappato, il verbo difensivo
   manca nel mezzo secondo dopo in 68 (oggi: 0). La causa e' che b.passTo
   non si azzera quando un passaggio viene intercettato e resta libero:
   il campo va RANCIDO, e l'etichetta con lui.

   Nota storica, e non e' un'assoluzione: la stessa riparazione era gia'
   stata ritirata su una base precedente (strumenti/_t-due-righe.js).
   Quei numeri erano di un altro file e non li ho riusati — li ho
   rifatti. Il fatto che due misure diverse, su due basi diverse, con due
   oracoli diversi, cadano dalla stessa parte e' la ragione per cui la
   riprendo solo con --comunque.

   COSA RESTEREBBE DA FARE, per chi riprende. Il sintomo e' vero: un
   secondo per passaggio non e' poco. Ma la cura non e' leggere un campo
   che va rancido — e' far scadere il volo (l'oracolo misura anche quel
   candidato, «passTo+g», e resta peggiore di oggi), oppure spostare la
   domanda da «di chi e' il pallone» a «che cosa otterrebbe il dito»,
   che e' la sola colonna su cui oggi il gioco e' gia' a zero.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;

/* --------------------------------------------------------------------
   GLI ANCORAGGI. Testo esatto cercato, testo esatto messo al suo posto.
   Nessuna espressione regolare, nessun numero di riga: i numeri di riga
   di questo repo marciscono in un giorno, i nomi no.

   Ce n'e' UNO SOLO, ed e' la riparazione B. La riparazione A non ha
   ancoraggio perche' non ha niente da cambiare.
   -------------------------------------------------------------------- */
const ANCORE = [
  {
    nome: 'B — possessoTeam legge anche b.passTo, con 0,25 s di isteresi',
    cerca:
      `/* la squadra t ha il pallone? E' il contesto dei pulsanti touch. */
function possessoTeam(t){
  return G.ball && G.ball.owner>=0 && G.players[G.ball.owner] && G.players[G.ball.owner].team===t;
}`,
    metti:
      `/* =====================================================================
   LA SQUADRA t HA IL PALLONE? E' IL CONTESTO DEI PULSANTI TOUCH.

   Qui si leggeva il solo b.owner, che vale -1 per TUTTO il volo di un
   passaggio: appena passavi, i due dischi dicevano CONTRASTA e CAMBIO
   finche' il pallone non arrivava. Misurato su tre partite a passo
   fisso (strumenti/_sonda-l04.js --etichetta), con la verita' presa
   dall'ESITO — quale squadra prende il possesso successivo — e non da
   nessun campo del gioco: mediana del volo 825 ms, e piu' di un secondo
   per passaggio in cui i dischi dicevano LORO su un pallone che tornava
   fra i nostri piedi.

   Adesso si legge anche b.passTo, che il gioco scrive gia' quando lancia
   un passaggio: un pallone in volo VERSO UN NOSTRO UOMO e' nostro.

   IL PREZZO E' MISURATO, ED E' ALTO. Vedi il cappello di
   strumenti/_t-l04.js: b.passTo non si azzera quando un passaggio viene
   intercettato e resta libero, quindi il campo va rancido e l'etichetta
   con lui. Chi applica questa versione sappia che la sta applicando
   contro la misura che la ha bocciata, e la rifaccia.

   LE TRE GUARDIE, e perche' ognuna c'e'.

   1. UNA DECISIONE PER FOTOGRAMMA (s.p === G.pulse). Questa funzione ha
      da qui una memoria, e viene chiamata piu' volte nello stesso
      fotogramma — dal disegno, da Touch5.start che risolve il tocco, e
      da window.__test.pulsanti. Senza questa riga la memoria avanzerebbe
      di piu' passi per fotogramma e la risposta dipenderebbe da CHI ha
      chiesto per primo: anche solo guardare i pulsanti da uno strumento
      cambierebbe il gioco. Con la riga, la seconda chiamata dello stesso
      fotogramma riceve la stessa risposta della prima.

   2. L'ISTERESI DI 0,25 s VALE SOLO SU PALLA DI NESSUNO. Se il pallone
      e' nei piedi di qualcuno (b.owner >= 0) l'etichetta cambia SUBITO.
      Se restasse appiccicata per un quarto di secondo, i verbi difensivi
      mancherebbero proprio nell'istante in cui la palla ci viene
      strappata, che e' l'unico istante in cui servono.

   3. L'OROLOGIO CHE TORNA INDIETRO (dt < 0). G.pulse cresce sempre, ma
      un giorno qualcuno potrebbe azzerarlo a inizio partita: allora dt
      resterebbe negativo per sempre e lo stato si incastrerebbe. Con
      dt < 0 fra le condizioni, un orologio riavvolto sblocca invece di
      bloccare.
   ===================================================================== */
const POSS_MEM=[{v:false,t:-9,p:-1},{v:false,t:-9,p:-1}];
function possessoTeam(t){
  const s=POSS_MEM[t];
  if(s.p===G.pulse) return s.v;            // guardia 1: una risposta per fotogramma
  s.p=G.pulse;
  const b=G.ball;
  const i = b ? (b.owner>=0 ? b.owner : b.passTo) : -1;
  const mio = i>=0 && G.players[i] && G.players[i].team===t;
  const dt = G.pulse - s.t;
  if(mio!==s.v){
    /* si accende subito; si spegne subito se il pallone e' nei piedi di
       qualcuno (guardia 2) o se l'orologio e' stato riavvolto (guardia
       3); altrimenti aspetta il quarto di secondo */
    if(mio || (b && b.owner>=0) || dt>=0.25 || dt<0){ s.v=mio; s.t=G.pulse; }
  } else s.t=G.pulse;
  return s.v;
}`,
  },
];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-l04.js — ' + ANCORE.length + ' ancoraggio/i (tutti RITIRATI dalla misura):');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  console.log('  · A — humanSprint(t) fuori dal ramo del tiro: NESSUN ANCORAGGIO, e\' gia\' fatta.');
  process.exit(0);
}

if (!haFlag('comunque')) {
  console.error(
    'NON SCRIVO. La voce L0.4 chiedeva due riparazioni: sul gioco di oggi\n' +
    'una e\' GIA\' FATTA e l\'altra e\' misurata PEGGIORE del difetto.\n' +
    '\n' +
    '  A  humanSprint(t) nel ramo del tiro: NON C\'E\' PIU\'.\n' +
    '     6 tiri alti su 48, e sono i sei della sola configurazione che il\n' +
    '     pallonetto lo chiede. Sulla copia guasta: 35 su 48.\n' +
    '     node strumenti/_sonda-l04.js --pallonetto --prove 6 --rosso\n' +
    '\n' +
    '  B  possessoTeam che legge b.passTo: compra 667 ms per passaggio e\n' +
    '     paga 33 s su 275 di pulsanti che offrono un gesto che non fa\n' +
    '     niente (0 ms oggi), piu\' 12,8 s in cui dice NOSTRA su un pallone\n' +
    '     che se ne va ai loro. Controprova con un altro banco\n' +
    '     (strumenti/_t-oracolo.js): il verbo difensivo manca in 68 dei 71\n' +
    '     istanti in cui il pallone ci viene strappato, oggi 0.\n' +
    '     node strumenti/_sonda-l04.js --etichetta --partite 3 --rosso\n' +
    '\n' +
    'I numeri e il perche\' stanno in cima a questo file. L\'ancoraggio di B\n' +
    'e\' conservato e funzionante: --comunque lo applica, e chi lo usa sa\n' +
    'che sta andando contro una misura invece che contro un\'opinione.');
  process.exit(2);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.l04.html';
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
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log(`OK (--comunque) ${ANCORE.length} ancoraggio/i applicato/i, CONTRO LA MISURA.`);
console.log(`    da   ${inFile}  (${src.length} byte)`);
console.log(`    a    ${outFile}  (${out.length} byte, ${out.length - src.length >= 0 ? '+' : ''}${out.length - src.length})`);
console.log('    rimisura prima di tenerlo: node strumenti/_sonda-l04.js --etichetta --partite 3 --gioco ' + path.relative(RADICE, outFile).split(path.sep).join('/'));
