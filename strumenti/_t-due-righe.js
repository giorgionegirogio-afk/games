/* =====================================================================
   ATTENZIONE — QUESTA TOPPA E' RITIRATA. NON APPLICARLA.
   (19 agosto 2026)

   E' stata divisa in due e solo una meta' e' sopravvissuta alla misura:

     (a) il pallonetto  ->  strumenti/_t-lob.js   PRONTA, 36/36
     (b) i pulsanti     ->  RITIRATA, non esiste piu' una toppa

   Perche' (b) e' caduta, in un numero: misurata contro la regola che il
   gioco scrive da se' — «L'ETICHETTA DICE QUELLO CHE IL DITO FARA',
   SEMPRE», CALCETTO-il-gioco.html:8776 — invece che contro la proprieta'
   del pallone (che era la stessa espressione della toppa, quindi un
   teorema e non una misura), la riga «dice TIRA e startCharge non
   farebbe niente» SALE a tutte e tre le taglie:
       5v5   9,01% -> 15,70%      7v7  6,31% -> 13,36%
       11v11 3,37% -> 12,93%
   e nei 165 istanti in cui il pallone viene strappato alla squadra 0, il
   verbo difensivo manca in 158 (oggi: 0). Il banco e' strumenti/
   _t-oracolo.js, l'oracolo e' verificato contro la funzione vera (544
   pressioni, 0 disaccordi). Anche il titolo «due righe» contava male:
   l'ancoraggio b-stato inseriva una terza riga eseguibile e due globali.

   Il file resta qui perche' contiene il ragionamento e i due ancoraggi
   di (b) per chi vorra' riprenderli, ma si RIFIUTA di scrivere: serve
   --comunque per forzarlo, e chi lo forza sa quello che fa.
   =====================================================================
   _t-due-righe.js — TRE RIGHE DI CODICE (il titolo contava male: oltre
   al quinto argomento di fireShot e al corpo di possessoTeam,
   l'ancoraggio b-stato inserisce una riga eseguibile vera e DUE GLOBALI
   MUTABILI, POSS_LAB e POSS_TENUTA) E QUELLO CHE CI STA ATTACCATO.
   Toppa cerca/sostituisci. NON SCRIVE MAI DENTRO IL GIOCO se non glielo
   si chiede: legge CALCETTO-il-gioco.html (o il file dato con --da),
   sostituisce SEI ancoraggi e scrive la copia altrove (--a). Se anche
   UN SOLO ancoraggio non compare ESATTAMENTE UNA VOLTA si ferma con
   codice 1, dice quale manca e non scrive niente.

   uso:
     node strumenti/_t-due-righe.js --a fuori/dopo.html
     node strumenti/_t-due-righe.js --da altro.html --a fuori/dopo.html
     node strumenti/_t-due-righe.js --dentro          (scrive nel gioco)
     node strumenti/_t-due-righe.js --elenco          (solo i sei punti)

   =====================================================================
   (a) IL PALLONETTO ERA ACCESO PER DIFETTO, E SI VEDE A NUMERI.

   `releaseCharge` passava a `fireShot` come quinto argomento — il
   pallonetto — il valore di `humanSprint(t)`, cioe' uno STATO. Sul
   dito quello stato e' «levetta oltre STICK_SPRINT (66 px)», ma lo
   stick "che segue" ferma il vettore a MAXR (70 px): CHIUNQUE
   TRASCINI PER CORRERE E' OLTRE 66, sempre, in qualunque direzione.
   Misurato con due dita vere sul vetro (strumenti/_t-pollice.js, 8
   prove per configurazione, gioco del 18 agosto 2026):

     levetta ferma (0 px)            8 tiri   0 pallonetti
     levetta a 44 px (giocatore.js)  8 tiri   0 pallonetti
     levetta a 60 px                 8 tiri   0 pallonetti
     levetta a fondo corsa, avanti   8 tiri   8 PALLONETTI
     levetta a fondo corsa, indietro 8 tiri   8 PALLONETTI
     levetta a fondo corsa, di lato  8 tiri   8 PALLONETTI

   Ventiquattro tiri su ventiquattro. Chi corre e tira scavalca il
   portiere senza averlo chiesto, e perde la potenza (430 contro 640
   sul gesto perfetto) e l'effetto a giro che il tiro perfetto ha.

   LA CURA NON E' SPEGNERE IL PALLONETTO: e' dargli un GESTO. Il
   pallonetto adesso lo chiede la levetta TIRATA INDIETRO — via dalla
   porta che si attacca — nell'istante del rilascio. Perche' proprio
   quello:
     - e' l'unico canale d'ingresso ancora LIBERO in quel punto:
       `const [mx,my]=humanMove(t)` era gia' letto due righe sopra e
       `mx` non veniva usato da nessuno (`my` mira alto/basso);
     - non lo puo' produrre per sbaglio chi corre verso la porta, che
       e' il caso che oggi lo accende sempre;
     - vale identico su tastiera (il tasto indietro) e su dito, senza
       un bottone in piu' da imparare;
     - la soglia 0,5 sul coseno vuol dire «entro 60 gradi dall'indietro
       pieno»: si prende volendo, non sfiorando.
   Il verso e' per squadra: la squadra 0 attacca +x, la 1 attacca -x.

   COSA SI PERDE, dichiarato: il pallonetto adesso si chiede SOLO
   tirando la levetta indietro. DA FERMI NON PARTE — con mx = 0 la
   condizione > 0,5 e' falsa, e la tabella qui sopra lo dice da se'
   (levetta ferma: 0 pallonetti su 8). La riga precedente diceva «da
   FERMI o in arretramento» ed era falsa: era la documentazione della
   toppa che ripara la documentazione, e mentiva.

   (a-bis) LA LAVAGNA DEL MISTER DICEVA L'ALTRA REGOLA, e una lavagna
   che mente e' peggio di una lavagna che manca: la riga del pallonetto
   in `#howto` viene riscritta con il gesto vero. Stessa cosa per i due
   commenti che rimandavano al «pattern sprint-modifica del pallonetto»:
   quel pattern adesso ce l'ha solo il cross, e il commento lo dice.

   NON TOCCATO, E MISURATO LO STESSO: `doFiltrante(t, humanSprint(t))`
   (righe 8626 e 8829) ha ESATTAMENTE lo stesso difetto — con la levetta
   a fondo corsa il filtrante diventa cross 8 volte su 8, misurato. E'
   fuori dall'incarico e resta li': va riparato, e chi lo fara' trova
   qui il numero di partenza.

   =====================================================================
   (b) I PULSANTI MENTIVANO PER UN SESTO DELLA PARTITA.

   `possessoTeam(t)` leggeva solo `b.owner`, che vale -1 per tutto il
   volo di un passaggio. Misurato su 8 partite a semi fissi
   (strumenti/_t-sonda-etichetta.js, semi 20260803..810, 869 s di gioco):

     voli di passaggio verso un nostro uomo        227
     durata mediana del volo                       306 ms
     fotogrammi con la palla NOSTRA e il pulsante
       che dice CONTRASTA/CAMBIO                   8.737 = 16,8% del gioco
     cambi di etichetta                            49,3 al minuto
     intervalli mostrati piu' corti di 0,25 s      65

   Un pallone in volo verso un COMPAGNO e' nostro, e il gioco lo sa gia':
   `b.passTo`. Da qui la prima meta' della riparazione.

   La seconda meta' e' un'ISTERESI, e NON E' SIMMETRICA apposta:
     - la palla che diventa nostra accende TIRA SUBITO. Aspettare un
       quarto di secondo per poter tirare sarebbe peggio del difetto;
     - la palla che passa all'AVVERSARIO spegne TIRA SUBITO: e'
       l'istante esatto in cui serve CONTRASTA;
     - solo la palla DI NESSUNO tiene l'etichetta di prima per 0,25 s.
       E' li' che nasce lo sfarfallio — il rimpallo, il primo controllo,
       la palla che scappa e torna — ed e' l'unico caso in cui una bugia
       corta costa meno di una verita' che lampeggia.
   Il cronometro e' `G.pulse`, cioe' il tempo di GIOCO: a partita ferma
   l'etichetta non invecchia, e la misura si ripete al banco.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const GIOCO = path.join(RADICE, 'CALCETTO-il-gioco.html');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const ha = n => process.argv.includes('--' + n);

/* ------------------------------------------------------------------ (a) */
const A_VECCHIO = `  /* SPRINT tenuto premuto al rilascio = PALLONETTO: scavalca il portiere,
     ma perde potenza e va calibrato. Un solo gesto in piu', un'arma in piu'. */
  fireShot(p, dx/l, dy/l, q, humanSprint(t));`;

const A_NUOVO = `  /* IL PALLONETTO SI CHIEDE, NON CAPITA.
     Qui c'era \`humanSprint(t)\`, cioe' uno STATO: sul dito e' «levetta
     oltre STICK_SPRINT = 66 px», ma lo stick che segue ferma il vettore
     a MAXR = 70, quindi CHI CORRE E' SEMPRE IN SPRINT e ogni tiro in
     corsa partiva scavalcato. Misurato con due dita vere sul vetro
     (strumenti/_t-pollice.js): 24 tiri su 24 con la levetta a fondo
     corsa, in tutte e tre le direzioni provate, 0 su 24 con la levetta
     ferma o a corsa piena. Chi correva e tirava perdeva potenza (430
     contro 640) ed effetto a giro senza aver chiesto niente.
     Adesso il pallonetto lo chiede la LEVETTA TIRATA INDIETRO — via
     dalla porta che si attacca — nell'istante del rilascio: e' l'unico
     canale libero rimasto qui (\`mx\` era letto e mai usato; \`my\` mira
     alto/basso), non lo puo' produrre per sbaglio chi corre verso la
     porta, e vale uguale su tastiera e su dito. La soglia 0,5 sul
     coseno e' «entro 60 gradi dall'indietro pieno»: si prende volendo.
     Il verso e' per squadra: la 0 attacca +x, la 1 attacca -x. */
  fireShot(p, dx/l, dy/l, q, (t===0 ? -mx : mx) > 0.5);`;

/* la lavagna del mister diceva la regola vecchia */
const A2_VECCHIO = `<b class="gn">Pallonetto</b><span class="gt">scatto mentre rilasci il tiro &mdash; scavalca il portiere in uscita</span></div>`;
const A2_NUOVO = `<b class="gn">Pallonetto</b><span class="gt">levetta indietro mentre rilasci il tiro &mdash; scavalca il portiere in uscita</span></div>`;

/* i due rimandi al «pattern del pallonetto», che adesso e' solo del cross */
const A3_VECCHIO = `         pattern sprint-modifica del pallonetto (vedi releaseCharge) */`;
const A3_NUOVO = `         pattern sprint-modifica che il pallonetto NON ha piu': li' lo
         sprint accendeva il pallonetto a ogni tiro in corsa e adesso il
         gesto e' la levetta indietro (vedi releaseCharge). Qui il
         difetto e' rimasto, ed e' misurato: strumenti/_t-pollice.js */`;

const A4_VECCHIO = `   pallonetto) dalla meta' campo offensiva diventa un cross. */`;
const A4_NUOVO = `   pallonetto, che pero' adesso si chiede con la levetta indietro e non
   piu' con lo sprint) dalla meta' campo offensiva diventa un cross. */`;

/* ------------------------------------------------------------------ (b) */
const B_VECCHIO = `  return G.ball && G.ball.owner>=0 && G.players[G.ball.owner] && G.players[G.ball.owner].team===t;`;

const B_NUOVO = `  /* LEGGEVA SOLO b.owner, che vale -1 per tutto il volo di un
     passaggio: misurato su 8 partite a semi fissi, 227 voli verso un
     nostro uomo, 306 ms di mediana, 8.737 fotogrammi — il 16,8% del
     tempo di gioco — con i pulsanti che dicevano CONTRASTA e CAMBIO
     mentre la palla era nostra. Una palla in volo verso un COMPAGNO e'
     NOSTRA, e il gioco lo sa gia': b.passTo.
     L'ISTERESI NON E' SIMMETRICA, e non e' una svista:
       nostra    -> TIRA subito (aspettare per poter tirare sarebbe
                    peggio del difetto);
       loro      -> CONTRASTA subito (e' l'istante in cui serve);
       di nessuno-> tiene l'etichetta di prima per POSS_TENUTA secondi.
     Solo l'ultimo caso sfarfalla, ed e' l'unico in cui una bugia corta
     costa meno di una verita' che lampeggia. Il cronometro e' G.pulse,
     cioe' il tempo di GIOCO: a partita ferma l'etichetta non invecchia
     e la misura si ripete al banco (strumenti/_t-sonda-etichetta.js). */
  const b=G.ball, i=b?(b.owner>=0?b.owner:b.passTo):-1, s=POSS_LAB[t];
  const vero=i>=0 && !!G.players[i] && G.players[i].team===t;
  if(vero!==s.v && (vero || i>=0 || G.pulse-s.t>=POSS_TENUTA)){ s.v=vero; s.t=G.pulse; }
  else if(vero===s.v) s.t=G.pulse;
  return s.v;`;

/* lo stato dell'isteresi: due caselle, una per squadra */
const B2_VECCHIO = `/* la squadra t ha il pallone? E' il contesto dei pulsanti touch. */`;
const B2_NUOVO = `/* la squadra t ha il pallone? E' il contesto dei pulsanti touch.
   POSS_LAB e' l'etichetta MOSTRATA (una per squadra) col tempo di gioco
   in cui e' stata scritta; POSS_TENUTA e' quanto la palla di nessuno
   resta di chi l'aveva. Sono di sola RESA: nessuna riga di fisica o di
   IA li legge, e possessoTeam e' chiamato solo da touchBtnLayout. */
const POSS_LAB=[{v:false,t:-9},{v:false,t:-9}], POSS_TENUTA=0.25;`;

const TOPPE = [
  { id: 'a-tiro', dove: 'releaseCharge: il quinto argomento di fireShot', da: A_VECCHIO, a: A_NUOVO },
  { id: 'a-lavagna', dove: '#howto: la riga del pallonetto', da: A2_VECCHIO, a: A2_NUOVO },
  { id: 'a-nota-tastiera', dove: 'keydown: il rimando al pattern del pallonetto', da: A3_VECCHIO, a: A3_NUOVO },
  { id: 'a-nota-filtrante', dove: 'doFiltrante: il rimando al pattern del pallonetto', da: A4_VECCHIO, a: A4_NUOVO },
  { id: 'b-stato', dove: "possessoTeam: lo stato dell'isteresi", da: B2_VECCHIO, a: B2_NUOVO },
  { id: 'b-possesso', dove: 'possessoTeam: il corpo', da: B_VECCHIO, a: B_NUOVO },
];

if (ha('elenco')) {
  for (const t of TOPPE) console.log(t.id.padEnd(18) + t.dove);
  process.exit(0);
}

if (!ha('comunque')) {
  console.error(
    'RITIRATA: questa toppa e\' stata bocciata dalla misura e non scrive piu\'.\n' +
    '  (a) il pallonetto  ->  node strumenti/_t-lob.js --a fuori/dopo.html\n' +
    '  (b) i pulsanti     ->  ritirata: contro la regola di :8776 la riga\n' +
    '      «dice TIRA e startCharge non farebbe niente» SALE (5v5 9,01% ->\n' +
    '      15,70%; 7v7 6,31% -> 13,36%; 11v11 3,37% -> 12,93%) e il verbo\n' +
    '      difensivo manca in 158 strappi su 165. Banco: strumenti/_t-oracolo.js\n' +
    '  Per forzarla lo stesso: --comunque');
  process.exit(2);
}
const da = path.resolve(arg('da', GIOCO));
const dentro = ha('dentro');
const a = dentro ? da : (arg('a', '') ? path.resolve(arg('a', '')) : '');
if (!a) { console.error('serve --a <file di uscita> (oppure --dentro)'); process.exit(2); }
if (!fs.existsSync(da)) { console.error('FALLITO: non trovo ' + da); process.exit(2); }

let testo = fs.readFileSync(da, 'utf8');
const partenza = testo.length;
const mancanti = [];
for (const t of TOPPE) {
  const n = testo.split(t.da).length - 1;
  if (n !== 1) mancanti.push(`  ${t.id.padEnd(18)} trovato ${n} volte (ne serve 1) — ${t.dove}`);
}
if (mancanti.length) {
  console.error('FALLITO: ancoraggi non validi in ' + da + '\n' + mancanti.join('\n') +
    '\nNiente e\' stato scritto. Il file di gioco e\' cambiato: rifare l\'ancoraggio a mano.');
  process.exit(1);
}
for (const t of TOPPE) testo = testo.replace(t.da, t.a);
/* controllo di ritorno: il nuovo c'e' una volta sola e il vecchio non c'e' piu' */
const rotti = [];
for (const t of TOPPE) {
  if (testo.split(t.a).length - 1 !== 1) rotti.push(t.id + ': il testo nuovo non compare una volta sola');
  if (testo.includes(t.da)) rotti.push(t.id + ': il testo vecchio e\' ancora li\'');
}
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(a), { recursive: true });
fs.writeFileSync(a, testo);
console.log(`toppa applicata: ${TOPPE.length} ancoraggi`);
for (const t of TOPPE) console.log('  ok   ' + t.id.padEnd(18) + t.dove);
console.log(`  --   ${da}\n  ->   ${a}\n  --   ${partenza} -> ${testo.length} byte (${testo.length - partenza >= 0 ? '+' : ''}${testo.length - partenza})`);
