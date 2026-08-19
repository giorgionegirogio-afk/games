/* =====================================================================
   _t-lob.js — IL PALLONETTO ERA ACCESO PER DIFETTO. QUATTRO ANCORAGGI.

   Toppa cerca/sostituisci. NON SCRIVE MAI DENTRO IL GIOCO se non glielo
   si chiede: legge CALCETTO-il-gioco.html (o il file dato con --da),
   sostituisce QUATTRO ancoraggi e scrive la copia altrove (--a). Se anche
   UN SOLO ancoraggio non compare ESATTAMENTE UNA VOLTA si ferma con
   codice 1, dice quale manca e non scrive niente.

   Una riga di codice eseguibile (il quinto argomento di fireShot) e tre
   di documentazione che dicevano la regola vecchia. Nessuna variabile
   nuova, nessuno stato nuovo, nessuna funzione nuova.

   uso:
     node strumenti/_t-lob.js --a fuori/dopo.html
     node strumenti/_t-lob.js --da altro.html --a fuori/dopo.html
     node strumenti/_t-lob.js --dentro          (scrive nel gioco)
     node strumenti/_t-lob.js --elenco          (solo i quattro punti)

   Questa toppa e' la META' (a) della vecchia _t-due-righe.js, staccata
   perche' regge da sola: non tocca possessoTeam, non tocca i pulsanti,
   non introduce stato.
   LA META' (b) — l'etichetta dei pulsanti — NON ESISTE PIU': ritirata
   dopo che strumenti/_t-oracolo.js l'ha misurata e l'ha trovata
   PEGGIORE su tre colonne indipendenti. Quei numeri stanno nel
   rapporto, sono di una base precedente e QUI NON LI RIPETO: non li ho
   rimisurati su questa.
   E la regola del gioco che avevo usato come metro — «l'etichetta dice
   quello che il dito fara'» — SU QUESTA BASE NON C'E' PIU': l'ha tolta
   la toppa parallela dei comandi (cercata per testo, zero occorrenze).
   Resta un argomento mio, non una citazione del prodotto.
   _t-due-righe.js adesso si rifiuta di scrivere.

   =====================================================================
   IL DIFETTO, A NUMERI.

   `releaseCharge` passava a `fireShot` come quinto argomento — il
   pallonetto — il valore di `humanSprint(t)`, cioe' uno STATO. Sul
   dito quello stato e' «levetta oltre `STICK_SPRINT` (66 px)», ma lo
   stick "che segue" ferma il vettore a `MAXR` = 70: CHIUNQUE TRASCINI
   PER CORRERE E' OLTRE 66, sempre, in qualunque direzione.

   NIENTE NUMERI DI RIGA IN QUESTO FILE, e non e' pigrizia: in un
   giorno la base si e' mossa due volte e delle cinque citazioni che
   questo cappello portava TRE erano gia' marce — `MAXR` si era spostata
   di trenta righe, la regola del cross di cinquanta, e la frase che
   citavo come regola del gioco non esisteva piu' affatto. (Le cifre
   esatte non le scrivo: sarebbero il quinto numero di riga di questo
   file, e marcirebbe come gli altri quattro.) Si cerca per nome:
   `STICK_SPRINT`, `MAXR`, `metaOffensiva`, `doFiltrante`,
   `releaseCharge`. I nomi non marciscono.

   Misurato il 19 agosto 2026 sul gioco md5 804328ee — la base di questo
   commit — con eventi touch MONTATI IN CHROMIUM, non su vetro: il banco
   e' un browser, e chi vuole il vetro deve usare `strumenti/pollici.js`
   sul telefono. Questa distinzione e' scritta due volte in questa
   consegna (`_t-lob-mano.js` apre dichiarando «nessuno dei due tocca
   vetro») e la prima stesura l'aveva contraddetta proprio nel commento
   che finiva DENTRO il gioco, dove sarebbe rimasta per anni. Comando:
   `node strumenti/_t-pollice.js --prove 6`, PRIMA sul repo e DOPO sul
   file che questa toppa produce:

     configurazione                    tiri   pallonetti PRIMA / DOPO
     levetta ferma (0 px)                6        0    /   0
     levetta a 44 px (giocatore.js)      6        0    /   0
     levetta a 60 px                     6        0    /   0
     levetta a fondo corsa, avanti       6        6    /   0
     levetta a fondo corsa, INDIETRO     6        6    /   6  (chiesto)
     levetta a fondo corsa, di lato      6        6    /   0

   Diciotto tiri su diciotto prima, sei dopo — e quei sei sono l'unica
   configurazione che il pallonetto lo chiede. Chi corre e tira
   scavalcava il portiere senza averlo chiesto, e perdeva la potenza
   (430 contro 640 sul gesto perfetto, le due costanti stanno dentro
   `fireShot`) e l'effetto a giro del tiro perfetto. La quota media
   impressa al pallone lo dice da sola: 149 sulla direzione «indietro»
   prima e dopo, 149 -> 66 su quella verso la porta.

   PERCHE' 6 PROVE E NON 8, dichiarato invece che nascosto: a
   `--prove 8` la corsa DOPO devia in una scena `freekick` e lo
   strumento dichiara da solo invalide le due righe FILTRANTE
   («errori: scena freekick») e la prova di segno, che torna con 0
   tiri su 4 — cioe' niente, non uno zero. A 6 prove la corsa e' pulita
   su tutti e due i file. I numeri invalidi non sono stati usati.

   La prova di SEGNO (chiamate, non dito, tutte e due le squadre, uomo
   piazzato nella propria meta' offensiva), stessa corsa a 6 prove:
   PRIMA 4 tiri e 4 pallonetti su 4 direzioni; DOPO 4 tiri e 2
   pallonetti, esattamente i due «indietro» (squadra 0 verso -x,
   squadra 1 verso +x). Il segno regge per tutte e due le squadre.

   Nota di lettura, perche' il difetto non si e' mai visto ai cancelli:
   `strumenti/giocatore.js` trascina il pollice a `const R = 44` con il
   commento «oltre STICK_FULL: corsa piena». 44 e' SOTTO STICK_FULL (46)
   e molto sotto STICK_SPRINT (66): quel pollice non poteva incontrare
   il difetto nemmeno volendo, e infatti non l'ha mai visto. (Quel file
   e' NON TRACCIATO — `git status` lo da' `??`. Nel rapporto precedente
   l'avevo dato per tracciato, ed era falso.)

   =====================================================================
   LA CURA E COSA COSTA.

   LA CURA NON E' SPEGNERE IL PALLONETTO: e' dargli un GESTO. Il
   pallonetto adesso lo chiede la levetta TIRATA INDIETRO — via dalla
   porta che si attacca — nell'istante del rilascio, E DALLA META' CAMPO
   OFFENSIVA. Perche' proprio quello:
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

   LA META' CAMPO NON E' UN ORPELLO, E' IL PREZZO CHE HA PAGATO IL
   BANCO. Senza `metaOffensiva(p)`, chi indietreggia per spazzare nella
   propria meta' alzava un pallonetto senza volerlo: misurato con
   strumenti/_t-lob-indietro.js (banco costruito per poter BOCCIARE la
   toppa, col pollice tirato indietro apposta), 6 partite a semi fissi
   20260803..20260808, 5v5, sul gioco md5 804328ee. La colonna di mezzo
   e' la variante SENZA `metaOffensiva`, costruita apposta per vedere
   che cosa toglie davvero:

     configurazione   prima        sola levetta    con la meta' campo
     attaccante 80px  114/114 lob  0/107           0/107
     difensore 80px   181/181      214/227 (94%)   79/151  (52%)
     difensore 44px   0/147        174/186 (94%)   62/167  (37%)
     misto 44px       0/142        53/133  (40%)   0/129   (0%)  TAUTOLOGICA
     chi CHIEDE 80px  140/140      89/105  (85%)   77/89   (87%)
     chi CHIEDE 44px  0/88         64/84   (76%)   77/94   (82%)

   LA RIGA «misto» NON E' UNA PROVA, ED E' LA COSA PIU' IMPORTANTE
   SCRITTA QUI. Quello zero era garantito prima di premere invio: il
   robot `misto` indietreggia SOLO con `p.x < FW/2` (lo si legge in
   _t-lob-indietro.js, dentro la sonda), e `metaOffensiva` per la
   squadra 0 e' `p.x > FW/2`. I due predicati sono mutuamente
   esclusivi. La conferma sta nelle sottocolonne: con la sola levetta i
   pallonetti di quella riga stanno 48 su 48 in «spazzando», e con
   `metaOffensiva` la colonna «spazzando» va a 0 su 41. Quella riga
   misura la definizione del robot, non la toppa: e' TAUTOLOGICA e non
   va contata fra i cancelli.

   IL NUMERO CHE PORTA INFORMAZIONE E' LA RIGA «difensore 44px»: il
   pallonetto per sbaglio NON E' AZZERATO, E' RIDOTTO — da 174/186 a
   62/167 — e quello che resta e' esattamente il difetto nuovo, non un
   avanzo del vecchio: 51 di quei 62 sono spazzate fatte NELLA META'
   CAMPO AVVERSARIA (51 su 148 spazzate; gli altri 11 su 19 sono tiri
   d'attacco con la levetta ancora indietro). A 44 px, sotto lo sprint,
   PRIMA quei pallonetti non si potevano proprio fare: 0 su 147.
   E' lo stesso meccanismo che rende utile l'arma nuova — la riga «chi
   CHIEDE 44px» va da 0/88 a 77/94 — visto dal lato che costa.
   `metaOffensiva` non e' una regola inventata qui: e' la stessa che il
   gioco usa gia' per trasformare il filtrante in cross (si cerca
   `comeCross && metaOffensiva`), quindi la grammatica dell'ingresso
   diventa piu' coerente, non meno.

   ATTENZIONE A QUESTI CONTEGGI: sono di un banco, non di una mano, e
   dipendono dal flusso della partita. Sulla base di ieri le stesse
   sei righe davano numeri diversi (la riga «difensore 44px» dava
   32/113 con 26/104 spazzate). Non sono costanti del gioco: sono la
   misura di questa base. Se non tornano, e' il gioco che si e' mosso.

   COSA SI PERDE, DICHIARATO E MISURATO. Il pallonetto adesso si chiede
   SOLO tirando la levetta indietro, e solo davanti: da fermi NON parte
   (levetta ferma = 0 pallonetti su 6 nella tabella del pollice; con
   mx = 0 la condizione `> 0,5` e' falsa), e dalla propria meta' campo
   nemmeno. Non e' piu' l'arma di chi corre verso la porta — ma prima
   non era un'arma, era un incidente. Il pallonetto da centrocampo, che
   PRIMA partiva da solo, adesso non si puo' piu' fare: e' una perdita
   vera, ed e' scritta qui perche' nessuno la scopra dopo.
   E ce n'e' una che nessuno aveva dichiarato: `metaOffensiva(gk)` e'
   sempre falsa nella propria area, quindi IL PORTIERE NON PUO' PIU'
   PALLONETTARE il rinvio caricato — prima, in scatto, lo faceva. E'
   quasi certamente un miglioramento, ma NON L'HO MISURATO e lo scrivo
   qui invece di tacerlo.

   =====================================================================
   E POI IL GESTO L'HA PROVATO UNA MANO, SU UN TELEFONO VERO.

   Era la riserva piu' seria rimasta aperta, e non l'aveva sollevata io:
   tutti e due i banchi qui sopra sono BROWSER. _t-pollice.js monta
   eventi touch in Chromium, _t-lob-indietro.js scrive direttamente in
   Touch5.stick. Un robot che scrive nello stick raggiunge |mx| = 1
   sempre, per definizione: non ha latenza, non ha attrito, non ha un
   dito che scivola. La domanda vera era se un pollice umano riesca a
   tenere la levetta indietro NELL'ISTANTE del rilascio.

   strumenti/_t-lob-mano.js risponde con due dita vere scritte sul
   dispositivo di ingresso del kernel di un OnePlus 6 (Android 11),
   taratura misurata, tempo di orologio, e una sonda che conta il tiro
   solo se il tabellino lo registra. 4 prove per direzione, due APK
   costruiti oggi con strumenti/_t-apk.py dalle due versioni:

     direzione                PRIMA (804328ee)   DOPO (artefatto)
     pollice VERSO la porta   4 tiri, 4 lob      2 tiri, 0 lob
     pollice INDIETRO         3 tiri, 3 lob      3 tiri, 3 lob

   E il numero che conta piu' dei conteggi: `mx` LETTO DAL GIOCO
   nell'istante del tiro vale -1,00 con la levetta a 70 px su tutti i
   tiri «indietro». La soglia e' 0,5. Il gesto non e' al limite del
   raggiungibile: e' preso con il doppio del margine, da un pollice che
   trascina sul vetro come trascina una mano.

   IL BANCO E' INSTABILE E LO DICE. Circa una corsa su due viene
   RIFIUTATA dal suo cancello di validita': il pollice sinistro a volte
   non viene adottato dalla levetta e il gioco registra il tiro con
   |stick| = 0. Senza quel cancello quelle corse stampavano «indietro:
   0 pallonetti» — che letto da solo boccia la toppa — mentre stavano
   misurando un dito che non era mai arrivato. Le corse rifiutate non
   sono state lette; le tre valide (una PRIMA, due DOPO) danno le stesse
   cifre. Anche cosi', il campione e' piccolo: 12 tiri in tutto.
   E resta scritto quello che questo banco NON prova: la posa e'
   piazzata da fuori, quindi misura il CANALE D'INGRESSO, non se in una
   partita vera capiti spesso di trovarsi cosi'.

   =====================================================================
   LE TRE RIGHE DI CARTA.

   La lavagna del mister (`#howto`) diceva l'ALTRA regola, e una lavagna
   che mente e' peggio di una lavagna che manca: la riga del pallonetto
   viene riscritta con il gesto vero. Stessa cosa per i due commenti che
   rimandavano al «pattern sprint-modifica del pallonetto»: quel pattern
   adesso ce l'ha solo il cross, e il commento lo dice.

   NON TOCCATO, E MISURATO LO STESSO: `doFiltrante(t, humanSprint(t))`
   (due chiamate, tastiera e dito) ha ESATTAMENTE lo stesso difetto —
   con la levetta a fondo corsa il filtrante diventa cross 6 volte su
   6, rimisurato oggi su questa base, prima e dopo la toppa. E'
   fuori dall'incarico e resta li': va riparato, e chi lo fara' trova
   qui il numero di partenza. Finche' non lo si ripara, lo stesso
   trascinamento significa due cose diverse a seconda del pulsante
   (sul tiro non fa piu' niente, sul filtrante fa ancora cross): e' uno
   stato intermedio dichiarato, non una svista.
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

const A_VECCHIO = `  /* SPRINT tenuto premuto al rilascio = PALLONETTO: scavalca il portiere,
     ma perde potenza e va calibrato. Un solo gesto in piu', un'arma in piu'. */
  fireShot(p, dx/l, dy/l, q, humanSprint(t));`;

const A_NUOVO = `  /* IL PALLONETTO SI CHIEDE, NON CAPITA.
     Qui c'era \`humanSprint(t)\`, cioe' uno STATO: sul dito e' «levetta
     oltre STICK_SPRINT = 66 px», ma lo stick che segue ferma il vettore
     a MAXR = 70, quindi CHI CORRE E' SEMPRE IN SPRINT e ogni tiro in
     corsa partiva scavalcato. Misurato con eventi touch montati in
     Chromium — NON su vetro: il banco e' un browser, e il file che lo
     dice e' \`strumenti/_t-lob-mano.js\`, che apre dichiarando «nessuno
     dei due tocca vetro»
     (\`node strumenti/_t-pollice.js --prove 6\`): 18 tiri su 18 con la
     levetta a fondo corsa, in tutte e tre le direzioni provate, 0 su
     18 con la levetta ferma o a 44/60 px; dopo, 6 su 18, e sono i sei
     della sola direzione «indietro». Chi correva e tirava perdeva
     potenza (430 contro 640, le due costanti sono qui sotto) ed
     effetto a giro senza aver chiesto niente.
     Adesso il pallonetto lo chiede la LEVETTA TIRATA INDIETRO — via
     dalla porta che si attacca — nell'istante del rilascio: e' l'unico
     canale libero rimasto qui (\`mx\` era letto e mai usato; \`my\` mira
     alto/basso), non lo puo' produrre per sbaglio chi corre verso la
     porta, e vale uguale su tastiera e su dito. La soglia 0,5 sul
     coseno e' «entro 60 gradi dall'indietro pieno»: si prende volendo.
     Da FERMI (mx = 0) non parte: il pallonetto e' un gesto, non uno
     stato di riposo.
     E SOLO DALLA META' CAMPO OFFENSIVA, che non e' un orpello: senza,
     chi indietreggia per spazzare alza un pallonetto senza volerlo.
     Un banco fatto apposta per bocciare questa toppa
     (\`node strumenti/_t-lob-indietro.js\`) lo ha contato sul caso
     peggiore — robot che indietreggia sempre, pollice a 44 px: senza
     metaOffensiva 174 pallonetti su 186 tiri, con metaOffensiva 62 su
     167. RIDOTTO, NON AZZERATO, e va detto cosi': 51 di quei 62 sono
     spazzate fatte nella meta' campo avversaria, che a 44 px — sotto
     lo sprint — prima non si potevano proprio alzare (0 su 147).
     Quello e' il difetto nuovo, ed e' il prezzo dell'arma nuova: chi
     il pallonetto lo chiede apposta, sempre a 44 px, passa da 0 su 88
     a 77 su 94.
     metaOffensiva e' la stessa regola con cui il filtrante diventa
     cross: qui la grammatica dell'ingresso diventa piu' coerente.
     Il verso e' per squadra: la 0 attacca +x, la 1 attacca -x.
     I conteggi di questo commento sono di un BANCO, non di una mano, e
     sono misurati sul gioco com'era prima di questa toppa (md5
     804328ee, 6 partite a semi 20260803..20260808, 5v5). Dipendono dal
     flusso della partita: se rifacendoli non tornano, non e' un
     mistero, e' il gioco che si e' mosso. Si rifanno coi due comandi
     citati qui sopra. */
  fireShot(p, dx/l, dy/l, q, ((t===0 ? -mx : mx) > 0.5) && metaOffensiva(p));`;

/* la lavagna del mister diceva la regola vecchia */
const A2_VECCHIO = `<b class="gn">Pallonetto</b><span class="gt">scatto mentre rilasci il tiro &mdash; scavalca il portiere in uscita</span></div>`;
/* PERCHE' «dalla loro met&agrave; campo» E NON «dalla met&agrave; campo offensiva»,
   che sarebbe la stessa parola del Cross due righe sotto: perche' l'ho
   MISURATO in un browser vero a 915x412, e la parola del Cross manda a
   capo la riga. Con «loro met&agrave; campo» (84 caratteri) la riga Pallonetto
   resta 176,7 px e il suo testo 152,7x48,3 px — identici alla riga di
   prima, che ne aveva 62 — e il pannello #howto resta 1580 px. Con
   «met&agrave; campo offensiva» (89 caratteri) la riga passa a 192,8 px, il
   testo a 64,4 px e il pannello a 1596. Il Cross ne ha 95 e infatti sta
   gi&agrave; a 192,8. La lavagna dice la stessa regola con due parole diverse:
   e' un difetto, e' dichiarato, e costa una riga in piu' di pannello a
   chi vuole toglierlo. */
const A2_NUOVO = `<b class="gn">Pallonetto</b><span class="gt">levetta indietro al rilascio, dalla loro met&agrave; campo &mdash; scavalca il portiere in uscita</span></div>`;

/* i due rimandi al «pattern del pallonetto», che adesso e' solo del cross */
const A3_VECCHIO = `         pattern sprint-modifica del pallonetto (vedi releaseCharge) */`;
const A3_NUOVO = `         pattern sprint-modifica che il pallonetto NON ha piu': li' lo
         sprint accendeva il pallonetto a ogni tiro in corsa e adesso il
         gesto e' la levetta indietro (vedi releaseCharge). Qui il
         difetto e' rimasto, ed e' misurato: strumenti/_t-pollice.js */`;

const A4_VECCHIO = `   pallonetto) dalla meta' campo offensiva diventa un cross. */`;
const A4_NUOVO = `   pallonetto — che pero' quel pattern non ce l'ha piu': adesso lo
   chiede la levetta tirata indietro al rilascio, con la stessa
   condizione di campo che segue) dalla meta' campo offensiva diventa
   un cross. */`;

const TOPPE = [
  { id: 'a-tiro', dove: 'releaseCharge: il quinto argomento di fireShot', da: A_VECCHIO, a: A_NUOVO },
  { id: 'a-lavagna', dove: '#howto: la riga del pallonetto', da: A2_VECCHIO, a: A2_NUOVO },
  { id: 'a-nota-tastiera', dove: 'keydown: il rimando al pattern del pallonetto', da: A3_VECCHIO, a: A3_NUOVO },
  { id: 'a-nota-filtrante', dove: 'doFiltrante: il rimando al pattern del pallonetto', da: A4_VECCHIO, a: A4_NUOVO },
];

if (ha('elenco')) {
  for (const t of TOPPE) console.log(t.id.padEnd(18) + t.dove);
  process.exit(0);
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
/* CARATTERI E BYTE NON SONO LA STESSA COSA, e in un file con gli accenti
   giusti la differenza si vede. La versione precedente di questa toppa
   stampava `length` — cioe' CARATTERI — chiamandoli «byte»: sulla toppa
   intera diceva +2.741 (1.685.264 -> 1.688.005 caratteri) mentre il disco
   cresceva di +2.753 (1.689.939 -> 1.692.692 byte). Due numeri veri di due
   grandezze diverse, e un'etichetta sbagliata in mezzo. Adesso si stampano
   tutti e due, misurati, e nessuno dei due si puo' scambiare per l'altro. */
const bIn = Buffer.byteLength(fs.readFileSync(da)), bOut = Buffer.byteLength(fs.readFileSync(a));
const seg = n => (n >= 0 ? '+' : '') + n;
console.log(`  --   ${da}\n  ->   ${a}`);
console.log(`  --   ${partenza} -> ${testo.length} caratteri (${seg(testo.length - partenza)})`);
console.log(`  --   ${bIn} -> ${bOut} byte su disco (${seg(bOut - bIn)})`);
