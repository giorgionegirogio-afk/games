/* =====================================================================
   _t-sfida-ui.js — LA SFIDA ASINCRONA, LA PARTE CHE SI VEDE
   (28 agosto 2026).

   IL MOTORE C'ERA GIA' ed e' provato (_t-rete.js, banco _q-rete.js 22 su
   22 contro un server finto in memoria). Mancava tutto il resto: una
   voce di menu, una schermata, il modo di far partire una partita col
   seme del server, e il modo di rimandare indietro l'esito col nastro.
   Questa toppa mette quelle quattro cose e nient'altro.

   ======================= LA REGOLA CHE COMANDA =======================
   OFFLINE E' IL MODO NORMALE, e qui vuol dire tre fatti verificabili:

     1. NESSUNA CHIAMATA DI RETE ALL'AVVIO. Il gioco si apre, gioca e si
        chiude senza toccare Internet, esattamente come prima. La prima
        richiesta parte quando un dito preme SFIDA, e non un istante
        prima. Costo dichiarato: una partita rimasta in coda parte alla
        prossima apertura DELLA SCHERMATA, non alla prossima apertura del
        gioco. E' una scelta, non una dimenticanza: uno svuotamento
        automatico all'avvio farebbe parlare col server anche il telefono
        di chi la sfida non l'ha mai aperta.
     2. NESSUNA CHIAMATA SULLA STRADA DI UN FOTOGRAMMA. Tutte le attese
        stanno dentro funzioni async agganciate a un tocco. Il ciclo
        frame() non ne aspetta nessuna, e Rete.chiama ha gia' il suo
        tetto di otto secondi.
     3. SENZA RETE LA SCHERMATA SI APRE LO STESSO e dice in una riga
        cos'e' e che serve la rete. Niente rotelle che girano, niente
        «connessione richiesta», niente schermate di errore.

   ==================== IL CONTO DEI SORTEGGI ====================
   ZERO sorteggi aggiunti, zero spostati, zero tolti. Non c'e' una sola
   chiamata a dado() in questa toppa, e non c'e' un solo Math.random().
   Tutti i percorsi nuovi vivono dietro G.sfida, che fuori dalla sfida di
   rete e' null: le tre espressioni toccate nel motore
     durataPartita()   (G.sfida ? MATCH_SEC : (SAVE.durata||MATCH_SEC))
     G.ment[0]         (opts.mia ? opts.mia.ment : SAVE.mentalita)
     setupPlayers      (G.miaRosa || SAVE.rosa)
   con G.sfida null / opts.mia assente / G.miaRosa null restituiscono lo
   STESSO double e lo STESSO oggetto di prima. Misurato, non affermato:
   vedi NUMERI in fondo.

   ==================== LE SETTE VOCI DELLA HOME ====================
   La guida in basso aveva sei caselle (1,5fr per GIOCA piu' cinque):
   adesso ne ha sette. E' esattamente il difetto gemello di
   _t-mentalita.js 1b/1c — una voce in piu' e un pannello che non ci sta
   piu' — quindi si misura invece di sperare.

   MISURATO su undici formati veri, prima e dopo (strumenti/_q-sfida.js
   ripete la misura; il numero e' quanti pixel la griglia sfora la sua
   scatola, e «sotto» vuol dire una voce col piede oltre il bordo):

                        spedito, 6 voci      questa toppa, 7 voci
     915x412                 0                        0
     812x375                 0                        0
     740x360                 0                        0
     667x375                 0                       33  ->  0  (guardia)
     640x360                 0                       57  ->  0  (guardia)
     568x320                65 (gia' rotto)         124  ->  0  (guardia)
     412x915                 0                        0
     390x844                 0                        0
     360x800                 0                   1 voce sotto -> 0 (guardia)
     360x640                 0                   1 voce sotto -> 0 (guardia)
     1024x768                0                        0

   Le due guardie sono in fondo al CSS, dopo le regole che devono
   battere — la stessa lezione di _t-mentalita.js 1c: a parita' di
   specificita' in CSS vince l'ultima scritta, e una media query messa
   prima e' codice che non fa niente accanto a un commento che dice che
   lo fa.

   E la guardia orizzontale RIPARA UN DIFETTO CHE C'ERA GIA': a 568x320
   il gioco spedito sfora di 65 px con sei voci. Con sette voci e la
   guardia sfora di zero.

   ============== IL REPLAY: QUANTO VALE, MISURATO ==============
   Il punto 4 del mandato — «guardare un replay» — c'e', e funziona: il
   difensore rigioca il nastro e vede la partita che ha subito. Ma non
   funziona SEMPRE, e i numeri stanno qui invece che nel silenzio.

   Il banco (_q-sfida.js, due pagine = due telefoni, un server finto che
   pretende lo stesso contratto di quello vero) gioca sei sfide col
   copione fisso e poi le fa rivedere. Quattro giri:

     sfide giocate                                6 · 6 · 6 · 6
     con un calcio piazzato dentro                1 · 3 · 2 · 2   (17-50%)
     rivedibili, e tutte si sono lasciate rivedere 5 · 3 · 4 · 4
     riviste col punteggio ESATTO                 5 · 3 · 3 · 3   (14 su 16)
     riviste con un punteggio diverso             0 · 0 · 1 · 1   ( 2 su 16)
     volte in cui il gioco l'ha DETTO             —·—· 1 · 1   ( 2 su 2)

   Il copione del banco e' piu' ruvido di un pollice vero — preme il
   disco grande ogni 71 fotogrammi — quindi la quota di calci piazzati e'
   un TETTO, non una media.

   Le quattro ferite, in ordine di gravita', e cosa si e' fatto per ognuna:

   1. IL NASTRO NON ERA NELLA FORMA CHE IL SERVER ACCETTA — CHIUSO.
      Ed e' la piu' grave, perche' non riguardava il replay: riguardava
      TUTTE le sfide. Reg.serializza produce un testo con virgole, punti
      e virgola e barre verticali; rete/api/sfida.js accetta solo
      ^[A-Za-z0-9_\-=+/]+$ e non piu' di 64 kB. Il client mandava il
      crudo, e 'replay-forma' e' fra i no DEFINITIVI: ogni partita
      sarebbe stata buttata, non riprovata. Nessun banco lo vedeva
      perche' i server finti accettavano qualunque cosa.
      COSA SI E' FATTO: deflate e base64url prima di spedire, e il server
      finto di _q-sfida.js adesso pretende la stessa forma, cosi' il buco
      non si riapre in silenzio. Misurato: una partita che cruda pesava
      137 kB viaggia in 17,8 kB, sotto il tetto.

   2. IL DUELLO DAL DISCHETTO NON STA NEL NASTRO — CHIUSO A META'.
      I pointerdown del duello sono appesi all'elemento #duel e non
      passano dalle quattro porte che il registro avvolge: mira, barra e
      parata non finiscono nel nastro. E c'e' SEMPRE un umano dentro, in
      una partita a un giocatore (tira la squadra 0 -> miri tu; tira la
      squadra 1 -> pari tu). Peggio: una sfida PARI va al golden goal e
      poi ai rigori, che sono una catena di duelli — quindi ogni pareggio
      e' irrecuperabile per definizione.
      COSA SI E' FATTO: chi registra lascia nel nastro un comando di tipo
      5, che vuol dire «io sono incompleto». Chi lo riceve lo legge PRIMA
      di far vedere qualcosa e rifiuta, spiegando. Non si mostra una
      partita sbagliata: si dice che non si puo' mostrare.
      COSA CI VORREBBE PER CHIUDERLO: registrare le tre decisioni del
      duello — pickZone(z,u,v), stopPower(), pickKeeper(z) — con un
      contatore locale al duello e non col tick del registro, perche'
      durante il duello frame() chiama Duel.update e NON step, quindi
      Reg.passo non gira e il tick sta fermo. Tocca il registro, il
      duello e il ciclo dei fotogrammi: e' una toppa sua, coi suoi banchi.

   3. IL SERVER TIENE LA SQUADRA DI OGGI, NON QUELLA DI ALLORA — CHIUSO.
      La riga della sfida porta {seme, taglia, gol, nastro}; le rose il
      server le rilegge vive. Ma una rosa cresce a ogni partita e
      l'indole si muove a media mobile, quindi bastava che chi ha
      attaccato giocasse ancora perche' il replay rigiocasse i comandi
      giusti con uomini diversi.
      MISURATO prima della cura: su cinque sfide senza duello, rigiocate
      dopo altre sei partite di chi attaccava, UNA sola tornava uguale.
      COSA SI E' FATTO: le due squadre viaggiano DENTRO il nastro (un
      comando di tipo 7 coi quattro attributi di ogni uomo e le due
      posture, duecento byte prima di comprimere). Il profilo del server
      serve solo per nomi e tinte, che non spostano una partita. Dopo la
      cura la ferita non si vede piu': quel che resta e' la 4.

   4. IL RESIDUO FRA UNA PARTITA E LA SUCCESSIVA — APERTO, E NON E' MIO.
      Le due partite che ancora non tornano (2 su 16) hanno tutte lo
      stesso profilo: erano la N-esima giocata su una pagina e sono la
      M-esima rigiocata su un'altra, con N diverso da M. Lo stesso seme e
      gli stessi comandi danno partite diverse a seconda di QUANTE
      partite sono state giocate prima sulla stessa pagina. E' un difetto
      del gioco gia' censito e ancora aperto — _q-replay.js, prova E lo
      dichiara con queste parole: «due giri SPENTI a cavallo di uno
      acceso divergono al campione 6 ... da chiudere: perche' la sequenza
      a quattro giri non e' ripetibile mentre _diag-campi.js non trova un
      solo campo diverso».
      COSA SI E' FATTO: niente, perche' non si chiude da qui. Ma a fine
      replay il punteggio rigiocato si confronta con quello dichiarato, e
      se non torna il gioco lo DICE — con un cartellino e con una riga
      nella schermata — invece di far passare per vera una partita mai
      successa. Misurato: 2 su 2.

   In sintesi onesta: il bottone GUARDA non promette mai una cosa falsa.
   O mostra la partita, o dice perche' non puo'.

   ==================== COSA NON HO POTUTO METTERE ====================
   Sono cose vere e vanno scritte qui, non scoperte dopo:

     · IL PALLINO SULLA VOCE DI MENU. Per sapere quante sfide non lette
       ci sono bisogna chiedere al server, e chiederlo all'avvio rompe la
       regola 1. Il pallino c'e' sulle RIGHE dell'elenco, dove il dato e'
       gia' in mano.
     · LA MENTALITA' SCELTA NON VALE IN SFIDA. In una sfida la postura
       delle due squadre si ricava dall'INDOLE (mentDaIndole), non da
       SAVE.mentalita. La ragione e' la verificabilita': il server riceve
       {seme, taglia, gol, nastro} e nient'altro, quindi una mentalita'
       scelta a mano sul telefono non sarebbe riproducibile ne' da chi
       guarda ne' da chi verifica. L'indole invece viaggia nel nastro e
       nel profilo pubblico. Costo dichiarato: chi in amichevole gioca
       ATTACCO, in sfida gioca la postura che le sue partite raccontano.
     · IL DIFENSORE NON MUOVE UN DITO, ed e' la natura della modalita':
       la sua squadra la muove la macchina. Chi difende puo' GUARDARE,
       non giocare.
     · LE TINTE E I NOMI DI UN REPLAY SONO QUELLI DI OGGI, non quelli di
       allora: nel nastro ci stanno solo numeri, e codificare testo
       libero in un formato di cifre e virgole sarebbe un'altra toppa.
       Non spostano la partita di un'unita'.
     · DOPO AVER GUARDATO UN REPLAY la lavagna della home mostra quel
       punteggio come «ultimo risultato». E' cosmetico e non l'ho
       corretto: SAVE.lastRes si scrive dentro endMatch venti righe dopo
       il gancio, e spostare quella riga per un dettaglio d'ambiente
       costava un ancoraggio in piu' su codice che non e' mio.
     · CHI ABBANDONA UNA SFIDA A META' non la manda e non prende punti:
       l'impegno resta aperto sul server finche' non scade da solo. Il
       gioco lo dice quando si esce dalla pausa (vedi abbandonaSfida).
     · IL TEMPO REALE non c'e' e non era chiesto: questa e' la sfida
       asincrona e basta.

   =============== QUATTRO DIFETTI TROVATI PER STRADA ===============
   Tutti e quattro nel gioco spedito, tutti e quattro chiusi qui perche'
   senza non funziona quello che questa toppa deve costruire. Il primo —
   il nastro nella forma sbagliata — e' descritto per esteso sopra,
   perche' da solo avrebbe fatto fallire OGNI sfida:

     A) OGNI SQUADRA SI SAREBBE CHIAMATA «LA MIA SQUADRA». Rete.pubblica
        leggeva un campo del salvataggio che in questo gioco NON ESISTE
        (il nome sta in SAVE.teamName; quel campo compariva una volta
        sola in 2,1 MB, proprio in quella riga). Con il ripiego a valle,
        la classifica sarebbe stata una colonna di copie dello stesso
        nome. Ancoraggio 22.
     B) LA FORZA DEL SERVER STA IN 1..99, quella che startMatch si
        aspetta in 1..10 (G.oppForza diventa 52 + forza*2,2). Un
        avversario senza rosa valida sarebbe sceso in campo con attributi
        a 270. Con la rosa vera quel numero non lo legge nessuno — ma «di
        solito non lo legge nessuno» non e' una difesa. Vedi Sfida.gioca.
     C) LA GUIDA A SEI CASELLE SFORAVA GIA' a 568x320, di 65 px, col
        gioco spedito. Con sette caselle e la guardia sfora di zero: e'
        l'unica ragione per cui una toppa che AGGIUNGE una voce lascia
        quel numero piu' basso di come l'ha trovato. Ancoraggio 5.

   ============ QUELLO CHE E' RIMASTO IDENTICO, MISURATO ============
     · 100 partite a 5 contro 5, semi 20260803, gioco spedito contro
       questa toppa, confronto crudo dei due --json di _eventi.js:
       ZERO differenze. Le uniche due righe diverse sono il nome del file
       e il tempo di banco (38,8 s contro 34,4 s).
     · dado(): 86 chiamate prima, 86 dopo. Lo verifica la toppa stessa e
       si rifiuta di scrivere il file se il numero cambia.
     · i sorteggi del browser fuori dai commenti: zero prima, zero dopo
       (le cinque menzioni note vivono nei commenti, e la toppa conta
       prima e dopo invece di pretendere zero, che sarebbe falso).

   ==================== COME SI RIFA' LA MISURA ====================
     node strumenti/_t-sfida-ui.js --out fuori/sfidaui.html
     node strumenti/collaudo.js  --gioco fuori/sfidaui.html      36 su 36
     node strumenti/diritti.js   --gioco fuori/sfidaui.html      verde
     node strumenti/_q-rete.js   --gioco fuori/sfidaui.html      22 su 22
     node strumenti/_q-sfida.js  --gioco fuori/sfidaui.html      56 su 56
     node strumenti/_q-replay.js --gioco fuori/sfidaui.html       6 su 6
     node strumenti/_q-determinismo.js --gioco fuori/sfidaui.html 10 su 10
     node strumenti/_q-mentalita.js --gioco fuori/sfidaui.html   33 su 33
     node strumenti/_q-meta.js --tre-taglie --gioco fuori/sfidaui.html  82 su 82
     node strumenti/_eventi.js --taglia 5 --partite 100 --seme 20260803 --json --gioco fuori/sfidaui.html

   uso:  node strumenti/_t-sfida-ui.js --out fuori/sfidaui.html
         node strumenti/_t-sfida-ui.js --elenco
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;

/* =====================================================================
   IL CORPO DELLA SCHERMATA — un oggetto solo, dichiarato accanto ai
   comandi del menu che lo aprono.
   ===================================================================== */
const BLOCCO_JS = String.raw`
/* =====================================================================
   LA SFIDA — la parte che si vede (28 agosto 2026).

   Il motore sta sopra, in «Rete»: parla col server, tiene la coda,
   impara l'indole. Qui c'e' soltanto quel che il dito tocca, e la
   divisione non e' estetica — il motore si prova a numeri, i pixel no.

   OFFLINE E' IL MODO NORMALE: niente qui dentro parte da solo. La prima
   richiesta al server la fa apri(), cioe' un tocco su SFIDA.
   ===================================================================== */

/* LA DIFFICOLTA' DI UNA SFIDA NON E' UNA PREFERENZA. Il server riceve
   {seme, taglia, gol, nastro}: se la difficolta' venisse dal menu, la
   stessa partita rigiocata da chi ha subito la sfida — o dal
   controllore che verifica il punteggio — girerebbe su un'altra tabella
   di manopole e darebbe un altro risultato. Fissa a 1 (NORMALE), che e'
   anche il valore di serie del gioco. */
const SFIDA_DIFF = 1;

/* =====================================================================
   IL SEME DEL SERVER STA IN 48 BIT, il generatore del gioco ne usa 32.

   La riduzione si fa sulle CIFRE e non sul numero, e la ragione e' che
   Number('281474976710655') e' esatto oggi ma un seme piu' lungo non lo
   sarebbe, e due telefoni che arrotondano in modo diverso non giocano
   piu' la stessa partita. Questo conto e' esatto per qualunque lunghezza
   perche' non lascia mai i 32 bit.
   ===================================================================== */
function semeDaTesto(t){
  let s = 0;
  const v = String(t == null ? '' : t);
  for(let i=0;i<v.length;i++){
    const d = v.charCodeAt(i) - 48;
    if(d < 0 || d > 9) continue;
    s = ((s * 10) + d) >>> 0;
  }
  return s >>> 0;
}

/* un'impronta stabile da una stringa: serve solo a dare motivi di
   maglia diversi a squadre diverse, ed e' deterministica perche' il
   nome e' un dato pubblico che hanno tutti e tre (chi attacca, chi
   difende, il server) */
function improntaTesto(t){
  let h = 2166136261 >>> 0;
  const v = String(t == null ? '' : t);
  for(let i=0;i<v.length;i++){ h = (h ^ v.charCodeAt(i)) >>> 0; h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}

/* =====================================================================
   LA POSTURA DI UNA SQUADRA IN SFIDA SI RICAVA DALL'INDOLE.

   L'indole sono i sei numeri che il motore impara dalle partite di chi
   possiede la squadra (Rete.imparaIndole) e che viaggiano col profilo
   pubblico. Tre di quei sei dicono quanto una squadra SPINGE — dove
   tiene il pallone (linea), quanto tira (ritmo), quanto rischia in
   verticale (rischio) — e sono esattamente le tre cose che le tre
   mentalita' del gioco cambiano.

   PERCHE' NON SAVE.mentalita: perche' quella sta su un telefono solo.
   Il server riceve {seme, taglia, gol, nastro}; chi guarda il replay
   riceve i due profili pubblici. Se la postura venisse da una scelta
   privata, ne' il replay ne' la verifica potrebbero rifare la partita —
   e il replay verificabile e' l'unica cosa che questa modalita' ha di
   suo. Con l'indole, i tre capi hanno lo stesso dato.

   Le due soglie (40 e 60) sono SCELTE, non misurate: sono il terzo
   basso e il terzo alto di una scala 0..100 che parte tutta da 50.
   L'effetto delle tre mentalita' e' misurato altrove
   (strumenti/_t-mentalita.js, blocco NUMERI).
   ===================================================================== */
function mentDaIndole(o){
  if(!o || typeof o !== 'object') return 1;
  const n = k => { const v = +o[k]; return Number.isFinite(v) ? Math.max(0, Math.min(100, v)) : 50; };
  const spinta = (n('linea') + n('ritmo') + n('rischio')) / 3;
  return spinta >= 60 ? 2 : (spinta <= 40 ? 0 : 1);
}

/* =====================================================================
   LE DUE SQUADRE VIAGGIANO DENTRO IL NASTRO.

   IL PROBLEMA, e non e' un dettaglio: la riga della sfida sul server
   porta {seme, taglia, gol, nastro}, e le ROSE il server le va a
   rileggere VIVE — cioe' come sono oggi, non come erano quel giorno. Ma
   una rosa cresce a ogni partita (faiCrescereRosa) e l'indole si muove a
   media mobile. Basta che chi ha attaccato giochi un'altra volta perche'
   i comandi giusti muovano uomini un po' diversi, e la partita rigiocata
   finisca con un altro punteggio.

   MISURATO, ed e' il numero che ha deciso questo blocco: cinque sfide
   senza calcio piazzato, rigiocate dopo che chi attaccava aveva giocato
   altre sei partite — UNA sola tornava uguale. Un bottone GUARDA che
   quattro volte su cinque mostra una partita mai successa non e' una
   funzione: e' una bugia con l'animazione.

   LA CURA STA NEL NASTRO, che e' l'unico campo che viaggia con la
   partita e che il gioco controlla per intero. Ci si scrive dentro cio'
   che serve a rifarla: i quattro attributi di ogni uomo delle due
   squadre e le due posture. Un comando di tipo 7, in testa alla partita,
   che in rilettura non muove niente — esegui non ha un ramo per il 7 —
   e che pesa duecento byte su un nastro che ne pesa migliaia.

   COSA NON ENTRA: i nomi, le tinte, i motivi delle maglie. Non spostano
   una partita di un'unita' (formaSquadre non sparge nulla su una squadra
   senza carattere, e le due squadre di una sfida non ne hanno), e
   metterli vorrebbe dire codificare testo libero dentro un formato di
   soli numeri e virgole. Quelli si prendono dal profilo di oggi: se nel
   frattempo uno ha cambiato maglia, la rivedi con la maglia nuova. E'
   l'unica cosa che il replay non conserva, ed e' dichiarata.

   COSA RESTA APERTO, ed e' del server: sarebbe piu' pulito che la riga
   della sfida si portasse dietro una copia delle due squadre invece di
   rileggerle vive. Questo blocco fa la stessa cosa dal lato del
   telefono, che e' il lato che questa toppa puo' toccare.
   ===================================================================== */
function impaccaRosa(rosa){
  const r = Array.isArray(rosa) ? rosa : [];
  const n = Math.max(0, Math.min(24, r.length));
  const q = v => Math.max(1, Math.min(99, v|0));
  const v = [n];
  for(let i=0;i<n;i++){
    const g = r[i] || {};
    v.push(q(g.vel), q(g.tiro), q(g.tecnica), q(g.tackle));
  }
  return v;
}
/* e la rimette insieme. I NOMI arrivano da fuori — dal profilo di oggi —
   perche' nel nastro non ci sono e perche' non cambiano la partita. */
function spaccaRosa(v, i, nomi){
  const n = Math.max(0, Math.min(24, v[i]|0));
  const out = [];
  for(let k=0;k<n;k++){
    const b = i + 1 + k*4;
    const src = (Array.isArray(nomi) && nomi[k]) ? nomi[k] : null;
    out.push({
      nome: (src && typeof src.nome === 'string' && src.nome.trim()) ? src.nome : 'GIOCATORE',
      vel: v[b]|0, tiro: v[b+1]|0, tecnica: v[b+2]|0, tackle: v[b+3]|0,
    });
  }
  return { rosa: out, fine: i + 1 + n*4 };
}

/* i colori arrivano dalla rete: si guardano uno per uno prima di
   metterli addosso a qualcuno. Un '#' storto qui diventa un colore di
   contesto invalido e una maglia che non si dipinge. */
function coloriBuoni(c){
  const q = (v, d) => (typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v)) ? v : d;
  c = c || {};
  return { maglia: q(c.maglia, '#3355aa'), calzoncini: q(c.calzoncini, '#111820') };
}

/* =====================================================================
   IL NASTRO VIAGGIA STRETTO E IN BASE64, E FINORA NON LO FACEVA.

   IL DIFETTO, ed e' del gioco spedito: Reg.serializza produce un testo
   con virgole, punti e virgola e barre verticali; il server accetta solo
   ^[A-Za-z0-9_\-=+/]+$ (rete/api/sfida.js, errore 'replay-forma') e non
   piu' di 64 kB. Il client mandava il testo crudo. Ogni sfida sarebbe
   stata respinta — TUTTE, non qualcuna — e l'errore e' nella lista dei
   no definitivi, quindi la partita sarebbe stata BUTTATA invece che
   riprovata. Non lo vedeva nessun banco perche' i server finti
   accettano quel che gli arriva; adesso _q-sfida.js pretende la stessa
   forma del server vero, cosi' il buco non si puo' riaprire in silenzio.

   La cura e' quella che il commento di Reg.serializza dava gia' per
   fatta: deflate e base64. Misurato in Node su una partita vera
   (_q-replay.js, prova D): 35.768 byte crudi, 3.691 stretti, 4.924 in
   base64 — 7,4 kB al minuto di gioco. Tre minuti stanno nel tetto.

   COME SI RICONOSCE UN NASTRO CRUDO DA UNO STRETTO, senza aggiungere un
   campo: il crudo contiene una barra verticale (e' il separatore del
   formato), il base64url no. Un carattere, nessuna versione da tenere.

   IL PREZZO, dichiarato: la compressione e' asincrona (CompressionStream
   non ha una forma sincrona), quindi fra il fischio finale e la
   scrittura della partita nel salvataggio passano qualche millisecondo
   invece di zero. Se l'applicazione muore ESATTAMENTE li', quella sfida
   si perde. L'alternativa era metterla in coda subito e mandarla in una
   forma che il server rifiuta per contratto: quella si perde sempre.
   ===================================================================== */
function b64url(a){
  let s = '';
  for(let i=0;i<a.length;i++) s += String.fromCharCode(a[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function daB64url(t){
  let s = String(t).replace(/-/g, '+').replace(/_/g, '/');
  while(s.length % 4) s += '=';
  const b = atob(s), a = new Uint8Array(b.length);
  for(let i=0;i<b.length;i++) a[i] = b.charCodeAt(i);
  return a;
}
async function stringiNastro(t){
  try{
    if(typeof CompressionStream === 'undefined') return '';
    const c = new CompressionStream('deflate-raw');
    const w = c.writable.getWriter();
    w.write(new TextEncoder().encode(String(t)));
    w.close();
    const b = await new Response(c.readable).arrayBuffer();
    return b64url(new Uint8Array(b));
  }catch(e){ return ''; }
}
async function allargaNastro(t){
  try{
    if(String(t).indexOf('|') >= 0) return String(t);   /* gia' crudo */
    if(typeof DecompressionStream === 'undefined') return '';
    const d = new DecompressionStream('deflate-raw');
    const w = d.writable.getWriter();
    w.write(daB64url(t));
    w.close();
    const b = await new Response(d.readable).arrayBuffer();
    return new TextDecoder().decode(b);
  }catch(e){ return ''; }
}

/* quanto tempo fa, in italiano e senza librerie */
function quandoFa(t){
  const q = Date.parse(t);
  if(!Number.isFinite(q)) return '';
  const g = Math.floor((Date.now() - q) / 86400000);
  if(g <= 0) return 'oggi';
  if(g === 1) return 'ieri';
  if(g < 30) return g + ' giorni fa';
  return 'un pezzo fa';
}

const Sfida = {
  /* un tocco alla volta: due CERCA AVVERSARIO in fila prenderebbero due
     impegni dal server e il primo dei due morirebbe senza partita */
  occupato: false,
  sfide: [],
  /* quelle aperte in questa sessione. Il server segna «vista» quando il
     difensore chiede il replay, ma il pallino si deve spegnere SUBITO
     sotto il dito, non al prossimo giro di rete. */
  vistoQui: {},
  /* la vetrina si pubblica una volta per sessione e dopo ogni sfida: la
     rosa non cambia mentre si guarda un elenco */
  pubblicata: false,

  /* --------------------------------------------------------- aprire */
  apri(){
    goScreen($('sfida'));
    this.dipingi();
    /* e SOLO ADESSO si parla col server: il gioco e' gia' aperto da un
       pezzo e nessun fotogramma sta aspettando questa riga */
    this.aggiorna();
  },

  stato(t, male){
    const e = $('sfStato');
    if(!e) return;
    e.textContent = t;
    e.classList.toggle('male', !!male);
  },

  /* --------------------------------------------- la riga che spiega */
  /* UNA RIGA, non una schermata di errore. Chi non ha rete deve capire
     in un colpo d'occhio che cos'e' questa modalita' e perche' oggi non
     puo' usarla, e poi tornare a giocare. */
  perche(errore){
    if(errore === 'spenta')  return 'La sfida e\' spenta in questa copia del gioco: manca l\'indirizzo del server.';
    if(errore === 'lenta')   return 'Il server non ha risposto in otto secondi. Riprova quando hai campo: il gioco intanto non cambia di una virgola.';
    if(errore === 'assente') return 'Serve la rete: qui si gioca contro le squadre di altre persone. Senza, tutto il resto del gioco funziona come sempre.';
    if(errore === 'bandito') return 'Questa squadra non e\' piu\' ammessa in classifica.';
    if(errore === 'troppe')  return 'Troppe richieste di fila: aspetta un minuto.';
    if(errore === 'rosa-corta') return 'Serve una rosa di almeno quattro uomini per pubblicare la squadra.';
    return 'Il server ha detto di no (' + String(errore || 'ignoto') + ').';
  },

  /* ------------------------------------------------------ aggiornare */
  async aggiorna(){
    if(this.occupato) return;
    this.occupato = true;
    try{
      if(!Rete.base){ this.stato(this.perche('spenta'), true); return; }
      this.stato('Sto guardando se c\'e\' campo...');
      const e = await Rete.entra();
      if(!e.ok){ this.stato(this.perche(e.errore), true); this.dipingi(); return; }
      /* la vetrina: il server deve sapere com'e' la squadra OGGI, se no
         chi ti attacca gioca contro la rosa dell'altro mese */
      if(!this.pubblicata){
        const p = await Rete.pubblica();
        if(p.ok) this.pubblicata = true;
      }
      /* le partite rimaste in coda partono adesso, in ordine. Se il
         server e' tornato dopo una settimana, questa e' la riga che le
         consegna. */
      await Rete.svuotaCoda();
      const s = await Rete.sfideSubite();
      if(s.ok && Array.isArray(s.sfide)) this.sfide = s.sfide;
      const c = await Rete.classifica(10);
      if(c.ok && Array.isArray(c.righe)){
        const mia = c.righe.filter(r => r && r.sono_io)[0];
        if(mia){ Rete.mem().posto = mia.posto|0; Rete.mem().punti = mia.punti|0; persistSave(); }
      }
      this.stato('Attacca la squadra di un\'altra persona: non deve essere online, non deve nemmeno aver aperto il gioco oggi.');
      this.dipingi();
    }catch(err){
      this.stato('Qualcosa non ha funzionato. Il gioco resta quello di prima.', true);
    }finally{
      this.occupato = false;
    }
  },

  /* -------------------------------------------------------- dipingere */
  dipingi(){
    const m = Rete.mem();
    const n = $('sfNome'); if(n) n.textContent = (SAVE.teamName || 'LA MIA SQUADRA');
    const p = $('sfPunti'); if(p) p.textContent = m.punti ? String(m.punti|0) : '—';
    const o = $('sfPosto'); if(o) o.textContent = m.posto ? String(m.posto|0) : '—';
    const f = $('sfForza'); if(f) f.textContent = m.forza ? String(m.forza|0) : '—';
    const c = $('btnSfidaCerca');
    if(c){
      const coda = m.coda.length;
      c.innerHTML = 'CERCA AVVERSARIO <small>' +
        (coda ? esc(coda + (coda===1 ? ' partita ancora da consegnare' : ' partite ancora da consegnare'))
              : 'una partita sola, col seme che da\' il server') + '</small>';
    }
    const box = $('sfLista');
    if(!box) return;
    if(!this.sfide.length){
      box.innerHTML = '<div class="sf-vuota">Nessuno ti ha ancora attaccato. Quando succedera\' lo troverai qui, con la partita da rivedere.</div>';
      return;
    }
    let h = '';
    for(const s of this.sfide){
      if(!s) continue;
      const id = s.id|0;
      const nuova = !s.vista && !this.vistoQui[id];
      /* IL PUNTEGGIO E' SCRITTO DAL PUNTO DI VISTA DI CHI LEGGE: gol_a
         sono i gol di chi ha attaccato, gol_d i tuoi. Scriverli
         nell'ordine del database vorrebbe dire mostrare a chi ha subito
         una sconfitta la scritta «2-1» come se avesse vinto. */
      const miei = s.gol_d|0, suoi = s.gol_a|0;
      const verdetto = miei > suoi ? 'HAI RESISTITO' : (miei < suoi ? 'TI HANNO BATTUTO' : 'PARI');
      const chi = (s.sfidante && s.sfidante.nome) ? s.sfidante.nome : 'UNA SQUADRA';
      h += '<div class="sfriga' + (nuova ? ' nuova' : '') + '">' +
             '<span class="sfp" aria-hidden="true"></span>' +
             '<div class="sfchi"><b>' + esc(chi) + '</b><small>' +
               esc(verdetto + ' · ' + (s.taglia|0) + ' contro ' + (s.taglia|0) +
                   (quandoFa(s.giocata) ? ' · ' + quandoFa(s.giocata) : '')) + '</small></div>' +
             '<div class="sfris">' + miei + '<i>–</i>' + suoi + '</div>' +
             '<button class="fbtn" data-guarda="' + id + '">GUARDA</button>' +
           '</div>';
    }
    box.innerHTML = h;
    box.querySelectorAll('[data-guarda]').forEach(b => {
      b.addEventListener('click', () => { Audio5.unlock(); Audio5.beep(520); this.guarda(b.dataset.guarda|0); });
    });
  },

  /* ---------------------------------------------- cercare e giocare */
  async cerca(){
    if(this.occupato) return;
    if(!Rete.base){ this.stato(this.perche('spenta'), true); return; }
    this.occupato = true;
    this.stato('Sto cercando una squadra della tua forza...');
    let r = null;
    /* =====================================================================
       SI PUBBLICA PRIMA DI OGNI SFIDA, e non e' cortesia.

       La partita che sto per giocare usa la MIA rosa e la MIA indole. Sono
       le stesse due cose che il server dara' a chi vorra' rivedere questa
       partita e a chi dovra' verificarla rigiocandola. Se la vetrina fosse
       vecchia — e lo diventa a ogni partita, perche' la rosa cresce e
       l'indole si muove — il replay rigiocherebbe i comandi giusti con una
       squadra sbagliata, e uscirebbe un altro punteggio.
       MISURATO col banco: senza questa riga, dopo qualche partita la
       partita rigiocata finiva 0-3 dove il tabellone dichiarava 0-4.
       ===================================================================== */
    try{ const p = await Rete.pubblica(); if(p.ok) this.pubblicata = true; }catch(e){}
    try{ r = await Rete.avversario(SAVE.taglia || 5); }
    catch(e){ r = { ok:false, errore:'assente' }; }
    this.occupato = false;
    if(!r || !r.ok){ this.stato(this.perche(r && r.errore), true); return; }
    this.gioca(r);
  },

  /* =====================================================================
     L'ORDINE DELLE TRE RIGHE NON E' UN GUSTO: e' quello provato dal
     banco del replay (_q-replay.js, prova A) — prima il seme, poi il
     registro, poi la partita. Il registro azzera i comandi e l'origine
     della levetta, e deve farlo con la partita ancora da nascere; il
     seme deve essere acceso prima che startMatch peschi il primo dado
     (G.kickTeam).

     G.sfida SI SCRIVE PRIMA DI TUTTI perche' durataPartita() lo legge
     dentro startMatch.
     ===================================================================== */
  gioca(r){
    const a = r.avversario || {};
    const taglia = [5,7,11].indexOf(r.taglia|0) >= 0 ? (r.taglia|0) : 5;
    const col = coloriBuoni(a.colori);
    /* LA FORZA DEL SERVER STA IN 1..99, quella che startMatch si aspetta
       in 1..10 (G.oppForza diventa 52 + forza*2,2). Senza questa riga un
       avversario senza rosa valida scenderebbe in campo con attributi a
       270. Con la rosa vera nessuno legge questo numero: e' la rete di
       sicurezza del caso in cui la rosa non arrivi. */
    const forza = Math.max(1, Math.min(10, Math.round((a.forza|0) / 10) || 5));
    const mentMia = mentDaIndole(Rete.miaIndole());
    const mentSua = mentDaIndole(a.indole);
    G.sfida = { seme:String(r.seme), taglia:taglia, chi:String(a.nome || 'AVVERSARIO'),
                vero:!!r.vero, replay:false };
    SEME.accendi(semeDaTesto(r.seme));
    Reg.accendi();
    /* LE DUE SQUADRE, prima riga del nastro. Da qui in poi questa partita
       si puo' rifare anche fra un mese, anche se tutti e due nel
       frattempo saranno cresciuti: il nastro se le porta dietro. */
    Reg.scrivi(7, [mentMia, mentSua].concat(impaccaRosa(SAVE.rosa), impaccaRosa(a.rosa)));
    startMatch(1, SFIDA_DIFF, {
      size: taglia,
      /* LA MIA POSTURA VIENE DALLA MIA INDOLE, non da SAVE.mentalita, e
         senza questa riga il replay non tornerebbe: chi guarda la partita
         che ha subito non ha modo di sapere che cosa avevo scelto nel mio
         menu, mentre la mia indole ce l'ha (viaggia col profilo
         pubblico). Qui non arriva nessuna rosa, quindi G.miaRosa resta
         null e in campo c'e' la mia squadra di sempre. */
      mia: { ment: mentMia },
      opp: {
        n: String(a.nome || 'AVVERSARIO').slice(0,18),
        c1: col.maglia, c2: col.calzoncini,
        /* il motivo della maglia non e' un dato pubblicato: si ricava dal
           NOME, che invece lo e'. Cosi' due squadre diverse non si
           vestono uguali, e chi guarda il replay vede lo stesso motivo
           che ha visto chi ha giocato. */
        pat: improntaTesto(a.nome) % 3,
        forza: forza,
        ment: mentSua,
        rosa: a.rosa,
      },
    });
  },

  /* ----------------------------------------------------- il replay */
  /* E' la cosa che il concorrente non puo' fare e noi si: il difensore
     GUARDA la partita che ha subito mentre dormiva, perche' gliela
     mandiamo per intero in qualche kB invece di mandargli un punteggio. */
  async guarda(id){
    if(this.occupato) return;
    if(!Rete.base){ this.stato(this.perche('spenta'), true); return; }
    this.occupato = true;
    this.stato('Sto prendendo la partita...');
    let r = null;
    try{ r = await Rete.replay(id|0); }
    catch(e){ r = { ok:false, errore:'assente' }; }
    this.occupato = false;
    if(!r || !r.ok || !r.sfida){ this.stato(this.perche(r && r.errore), true); return; }
    const s = r.sfida;
    const q = Array.isArray(r.squadre) ? r.squadre : [];
    const trova = k => { for(const x of q) if(x && x.allenatore === k) return x; return null; };
    const att = trova(s.attaccante), dif = trova(s.difensore);
    /* =====================================================================
       SE MANCA LA ROSA DI CHI HA ATTACCATO, LA PARTITA NON SI RIVEDE.

       Il nastro sono i COMANDI di chi ha attaccato: rigiocarli con in
       campo una squadra diversa dalla sua non da' «quasi la stessa
       partita», da' un'altra partita — con un altro punteggio. Un replay
       che mostra 3-0 dove il tabellone dice 1-2 e' peggio di nessun
       replay: e' il gioco che si contraddice da solo. Quindi qui si
       rinuncia e si dice perche'.
       ===================================================================== */
    if(!att || !Array.isArray(att.rosa) || att.rosa.length < 4){
      this.vistoQui[id|0] = 1;
      this.stato('Questa partita non si puo\' piu\' rivedere: il server non ha la rosa di chi ti ha attaccato.', true);
      this.dipingi();
      return;
    }
    const taglia = [5,7,11].indexOf(s.taglia|0) >= 0 ? (s.taglia|0) : 5;
    const nomiDif = (dif && Array.isArray(dif.rosa) && dif.rosa.length >= 4) ? dif.rosa : SAVE.rosa;
    /* IL NASTRO ARRIVA STRETTO: si allarga prima di rileggerlo. Uno
       crudo (con la barra verticale dentro) passa di qui intatto, cosi'
       anche un nastro di ieri si guarda lo stesso. */
    const testo = await allargaNastro(s.replay || '');
    let righe = testo ? 0 : -1;
    if(righe === 0){
      try{ righe = Reg.deserializza(testo); }
      catch(e){ righe = -1; }
    }
    if(righe < 0){
      Reg.spegni();
      this.stato('Il nastro di questa partita non si riesce ad aprire: e\' di una forma che questo gioco non sa leggere.', true);
      return;
    }
    /* =====================================================================
       IL NASTRO DICE DA SOLO SE BASTA, e si guarda PRIMA di far vedere
       qualcosa.

       Il comando di tipo 5 e' il segno che in quella partita c'e' stato
       un calcio piazzato con un umano dentro: la mira, la barra e la
       parata non passano dal registro, quindi da li' in poi la partita
       rigiocata NON e' quella. E non e' un caso di scuola — una sfida
       PARI finisce sempre al golden goal e poi ai rigori, e la serie dal
       dischetto e' tutta duelli.

       Meglio non mostrarla che mostrarne un'altra: chi guarda si fida di
       quello che vede, e novanta secondi di una partita inventata sono
       una bugia lunga. Il risultato resta scritto nell'elenco.
       ===================================================================== */
    let incompleto = false, dati = null;
    for(const r of Reg.righe){
      if(r[1] === 5) incompleto = true;
      else if(r[1] === 7 && !dati) dati = r;
    }
    if(incompleto){
      Reg.spegni();
      this.vistoQui[id|0] = 1;
      this.stato('Questa partita e\' passata da un calcio piazzato, e i comandi del duello dal ' +
                 'dischetto il registro non li annota ancora: rivederla darebbe una partita diversa ' +
                 'da quella che hai subito, quindi non te la faccio vedere. Il risultato e\' quello qui sotto.', true);
      this.dipingi();
      return;
    }
    /* =====================================================================
       LE DUE SQUADRE ESCONO DAL NASTRO, non dal profilo di oggi.

       E' la riga che rende il replay una cosa vera invece di una
       probabilita': dentro il nastro ci sono i quattro attributi di ogni
       uomo e le due posture come erano QUEL GIORNO. Il profilo che il
       server manda serve solo per i nomi e per le tinte, che non
       spostano una partita.

       Un nastro senza il tipo 7 e' di una versione precedente: si ripiega
       sul profilo di oggi, che e' meglio di niente, e a raccogliere il
       caso in cui non torni c'e' il controllo di fine partita dentro
       chiudiSfida.
       ===================================================================== */
    let mentAtt, mentDif, rosaAtt, rosaDif;
    if(dati && dati.length > 6){
      mentAtt = mentValida(dati[3]); mentDif = mentValida(dati[4]);
      const p1 = spaccaRosa(dati, 5, att.rosa);
      const p2 = spaccaRosa(dati, p1.fine, nomiDif);
      rosaAtt = p1.rosa; rosaDif = p2.rosa;
    }
    if(!(Array.isArray(rosaAtt) && rosaAtt.length >= 4)){
      mentAtt = mentDaIndole(att.indole); mentDif = mentDaIndole(dif && dif.indole);
      rosaAtt = att.rosa; rosaDif = nomiDif;
    }
    SEME.accendi(semeDaTesto(s.seme));
    const colA = coloriBuoni(att.colori), colD = coloriBuoni(dif && dif.colori);
    this.vistoQui[id|0] = 1;
    /* IL PUNTEGGIO DICHIARATO VIAGGIA CON LA PARTITA. A fine replay si
       confronta con quello uscito: se non tornano, il profilo di chi ha
       attaccato e' cambiato da allora (il server tiene la squadra di OGGI,
       non quella di quel giorno) e chi guarda ha diritto di saperlo invece
       di credere a un risultato che non e' successo. */
    G.sfida = { seme:String(s.seme), taglia:taglia, chi:String((dif && dif.nome) || 'LA TUA SQUADRA'),
                vero:true, replay:true, nomePrima:G.teamName,
                atteso:[s.gol_a|0, s.gol_d|0] };
    startMatch(1, SFIDA_DIFF, {
      size: taglia,
      /* chi ha attaccato prende il posto di chi gioca: e' la sua rosa che
         il nastro muove */
      mia: { n:String(att.nome || 'CHI TI HA ATTACCATO').slice(0,18),
             c1:colA.maglia, c2:colA.calzoncini, pat:improntaTesto(att.nome) % 3,
             ment:mentAtt, rosa:rosaAtt },
      opp: { n:String((dif && dif.nome) || SAVE.teamName || 'LA TUA SQUADRA').slice(0,18),
             c1:colD.maglia, c2:colD.calzoncini, pat:improntaTesto(dif && dif.nome) % 3,
             ment:mentDif, rosa:rosaDif },
    });
  },

  /* --------------------------------------------------- la classifica */
  async apriClassifica(){
    goScreen($('classifica'));
    const box = $('claLista');
    if(box) box.innerHTML = '<div class="sf-vuota">Sto leggendo la classifica...</div>';
    if(!Rete.base){
      if(box) box.innerHTML = '<div class="sf-vuota">' + esc(this.perche('spenta')) + '</div>';
      return;
    }
    let c = null;
    try{ c = await Rete.classifica(100); }
    catch(e){ c = { ok:false, errore:'assente' }; }
    if(!box) return;
    if(!c || !c.ok || !Array.isArray(c.righe)){
      box.innerHTML = '<div class="sf-vuota">' + esc(this.perche(c && c.errore)) + '</div>';
      return;
    }
    if(!c.righe.length){
      box.innerHTML = '<div class="sf-vuota">La classifica e\' ancora vuota. Gioca la prima sfida e ci sei.</div>';
      return;
    }
    let h = '';
    for(const r of c.righe){
      if(!r) continue;
      h += '<div class="clariga' + (r.sono_io ? ' io' : '') + '">' +
             '<span class="cp">' + (r.posto|0) + '</span>' +
             '<span class="cn">' + esc(r.nome || '—') + '</span>' +
             '<span class="cq">' + (r.punti|0) + '</span>' +
           '</div>';
    }
    box.innerHTML = h;
  },

  /* ------------------------------------------------- il trasferimento */
  apriCodice(){
    const c = Rete.codiceTrasferimento();
    const e = $('sfCodMio');
    if(e) e.value = c || 'Ancora nessuna identita\': apri la sfida una volta con la rete accesa.';
    const i = $('sfCodIn'); if(i) i.value = '';
    show($('sfidaCodice'));
  },
  usaCodice(){
    const i = $('sfCodIn');
    if(!i) return;
    if(Rete.accettaTrasferimento(i.value)){
      this.pubblicata = false; this.sfide = []; this.vistoQui = {};
      hide($('sfidaCodice'));
      toast('scopa','SQUADRA RIPRESA','Adesso questo telefono e\' quella squadra.');
      this.dipingi(); this.aggiorna();
    }else{
      toast('fischietto','CODICE SBAGLIATO','Ricontrolla: si copia per intero, punti compresi.');
    }
  },
};

/* =====================================================================
   LA FINE DI UNA SFIDA — si chiama da endMatch, per OGNI partita.

   Due cose in una funzione sola perche' succedono nello stesso istante e
   nello stesso ordine sempre:

     1. L'INDOLE SI IMPARA DA OGNI PARTITA, non solo dalle sfide. Sono i
        sei numeri che dicono come gioca chi possiede la squadra, e senza
        di loro una sfida contro di te sarebbe «la macchina col tuo nome
        sopra». Costa una media mobile e una scrittura del salvataggio.
     2. L'ESITO PARTE. E parte nell'ordine giusto: Rete.manda mette la
        partita nella coda del SALVATAGGIO, scrive il salvataggio, e solo
        dopo prova la rete. Se Android uccide l'applicazione adesso, al
        prossimo giro la partita e' ancora li'.

   NESSUNO ASPETTA LA RETE: la promessa non viene attesa da nessuno, e la
   schermata di fine partita compare come sempre.
   ===================================================================== */
function chiudiSfida(){
  try{ Rete.imparaIndole(); }catch(e){}
  const S = G.sfida;
  G.sfidaFine = S ? (S.replay ? 2 : 1) : 0;
  if(!S) return;
  G.sfida = null;
  /* il nastro si prende PRIMA di spegnere il registro */
  let nastro = '';
  try{ nastro = Reg.serializza(); }catch(e){ nastro = ''; }
  const ga = G.score[0]|0, gd = G.score[1]|0;
  Reg.spegni();
  /* IL CASO TORNA QUELLO DEL BROWSER. Se il seme restasse acceso, la
     prossima amichevole sarebbe la stessa partita per sempre — ed e' un
     guasto che non si vede finche' non si gioca due volte. */
  SEME.spegni();
  G.diff = clamp(SAVE.diff|0, 0, 2);
  try{ refreshDiffRows(); }catch(e){}
  if(S.replay){
    /* UN REPLAY NON PAGA. Non e' una partita che hai giocato: niente
       monete, niente crescita della rosa, niente trofei. Si spegne qui
       il premio invece che dentro applyMatchRewards, cosi' la regola sta
       accanto alla ragione. */
    G.matchRewarded = true;
    if(S.nomePrima !== undefined) G.teamName = S.nomePrima;
    try{ applyKit(); refreshTeamRGB(); }catch(e){}
    /* =====================================================================
       IL REPLAY SI CONTROLLA DA SOLO, ed e' l'ultima rete di sicurezza.

       Il segno nel nastro copre il duello dal dischetto. Resta un'altra
       strada per cui una partita rigiocata puo' divergere, e non e'
       riparabile dal telefono: il server restituisce la squadra di OGGI
       di chi ha attaccato, non quella del giorno della partita. Se da
       allora la sua rosa e' cresciuta o la sua indole si e' mossa, i
       comandi giusti muovono uomini un po' diversi e il punteggio puo'
       cambiare.
       Si chiude sul server, non qui: basterebbe che la riga della sfida
       si portasse dietro una copia delle due rose e delle due posture,
       invece di rileggerle vive.
       Finche' non e' cosi', almeno non si lascia credere a un risultato
       che non e' successo.
       ===================================================================== */
    if(S.atteso && (S.atteso[0] !== ga || S.atteso[1] !== gd)){
      toast('fischietto','NON ERA QUESTA LA PARTITA',
            'Rigiocata finisce ' + ga + '-' + gd + ', ma quella vera era ' + S.atteso[0] + '-' + S.atteso[1] + '.');
      try{
        Sfida.stato('Il replay non ha ricostruito la partita: e\' finito ' + ga + '-' + gd +
                    ' e quella vera era ' + S.atteso[0] + '-' + S.atteso[1] + '. La squadra di chi ti ha ' +
                    'attaccato e\' cambiata da allora, e il server ne tiene una copia sola, quella di oggi.', true);
      }catch(e){}
    }
    return;
  }
  /* SI STRINGE E SI SPEDISCE, e chi spedisce non lo aspetta nessuno.
     Il nastro crudo il server lo rifiuta per contratto (solo base64url,
     al massimo 64 kB): si stringe col deflate e si manda quello. Se il
     telefono non sa comprimere — CompressionStream manca — si manda
     crudo lo stesso: sara' il server a dire di no, e almeno il difetto
     resta visibile invece di essere nascosto da un silenzio. */
  try{
    stringiNastro(nastro).then(z => Rete.manda(S.seme, S.taglia, ga, gd, z || nastro)).then(r => {
      if(r && r.mandate) toast('scopa','SFIDA CONSEGNATA', (r.ultima && r.ultima.punti) ? ('Ora hai ' + (r.ultima.punti|0) + ' punti.') : '');
      try{ Sfida.dipingi(); }catch(e){}
    }).catch(()=>{});
  }catch(e){}
}

/* =====================================================================
   IL REPLAY SI FERMA AL DISCHETTO, E VA DETTO INVECE CHE NASCOSTO.

   IL DIFETTO, trovato misurando e non ragionando: il duello dal dischetto
   (punizione e rigore) NON passa dalle quattro porte del registro. Le
   altre dita del gioco entrano da Touch5.start/move/chiudi/azzera, che
   _t-registro.js avvolge dall'esterno; il duello invece ha i suoi
   pointerdown/pointermove/pointerup appesi direttamente all'elemento
   #duel, e da li' nel nastro non finisce niente.

   E NON BASTA CHE TIRI LA MACCHINA. In una partita a un giocatore
   G.cpu vale [false, true], quindi:
     tira la squadra 0  ->  shooterHuman  = true   (miri tu)
     tira la squadra 1  ->  keeperHuman   = true   (pari tu)
   In tutti e due i casi il duello aspetta un dito che nel nastro non
   c'e', e un replay lasciato solo resterebbe fermo li' PER SEMPRE — la
   scena non avanza, il cronometro non scorre, e chi guarda vede una
   schermata che non finisce mai.

   COSA SI FA QUI, ed e' un ripiego dichiarato: il replay si interrompe e
   dice perche'. Il risultato di quella partita resta scritto nell'elenco:
   non si perde niente tranne il film.

   COSA CI VORREBBE PER RIPARARLO DAVVERO, scritto perche' qualcuno lo
   faccia: le tre decisioni del duello sono poche e piccole —
   pickZone(z,u,v), stopPower() e pickKeeper(z) — e basterebbe
   registrarle come i tocchi, con un contatore locale al duello invece
   che col tick del registro (durante il duello frame() chiama
   Duel.update e NON step, quindi Reg.passo non gira e il tick sta fermo:
   e' proprio per questo che i comandi del duello non possono usare la
   stessa scala di tempo degli altri). Non e' un lavoro da questa toppa:
   tocca il registro, il duello e il ciclo dei fotogrammi, e ognuno dei
   tre ha i suoi banchi da rimisurare.

   IL DIFERIMENTO CON setTimeout NON E' PIGRIZIA: startFreeKick gira
   dentro step(), cioe' dentro la simulazione. Cambiare scena da li'
   vorrebbe dire smontare il mondo mentre lo si sta percorrendo.
   ===================================================================== */
function fermaReplayAlDischetto(){
  if(!(G.sfida && G.sfida.replay)) return;
  try{ Duel.phase='off'; hide(ui.duel); }catch(e){}
  G.paused=false;
  try{ hide(ui.pausa); }catch(e){}
  abbandonaSfida();
  try{ playWipe(); }catch(e){}
  hideAllScreens();
  try{ hide(ui.duel); }catch(e){}
  goScreen($('sfida'));
  setScene('menu');
  try{ Audio5.crowdLevel(0); }catch(e){}
  Sfida.stato('Questa partita si e\' fermata su un calcio piazzato: il registro non annota ancora ' +
              'i comandi del duello dal dischetto, e da li\' in poi non si puo\' rivedere. ' +
              'Il risultato resta quello scritto qui sotto.', true);
}

/* =====================================================================
   CHI ESCE DA UNA SFIDA A META' non la manda, e il gioco deve tornare
   com'era: il seme spento, il registro spento, la difficolta' quella
   scelta nel menu. Senza questa funzione, uscire da una sfida col tasto
   ESCI lasciava il caso seminato — cioe' tutte le amichevoli successive
   identiche fra loro — e il cronometro sulla durata di rete.
   L'impegno resta aperto sul server finche' non scade da solo: non si
   perdono punti, non si guadagnano.
   ===================================================================== */
function abbandonaSfida(){
  const S = G.sfida;
  if(!S) return;
  G.sfida = null; G.sfidaFine = 0;
  Reg.spegni(); SEME.spegni();
  G.diff = clamp(SAVE.diff|0, 0, 2);
  try{ refreshDiffRows(); }catch(e){}
  if(S.nomePrima !== undefined){ G.teamName = S.nomePrima; try{ applyKit(); refreshTeamRGB(); }catch(e){} }
  if(!S.replay) toast('fischietto','SFIDA ABBANDONATA','Non e\' stata mandata: non conta ne\' in bene ne\' in male.');
}

/* ------------------------------------------------------- i comandi */
$('btnSfida').addEventListener('click', ()=>{ Audio5.unlock(); Sfida.apri(); });
$('btnSfidaCerca').addEventListener('click', ()=>{ Audio5.unlock(); Audio5.beep(520); Sfida.cerca(); });
$('btnSfidaClassifica').addEventListener('click', ()=>{ Audio5.unlock(); Sfida.apriClassifica(); });
$('btnSfidaCodice').addEventListener('click', ()=>{ Audio5.unlock(); Sfida.apriCodice(); });
$('btnSfCodUsa').addEventListener('click', ()=>{ Audio5.unlock(); Sfida.usaCodice(); });
$('btnSfCodChiudi').addEventListener('click', ()=>{ Audio5.unlock(); hide($('sfidaCodice')); });
$('btnBackSfida').addEventListener('click', ()=>{ hide($('sfidaCodice')); goScreen(ui.menu); });
$('btnBackClassifica').addEventListener('click', ()=>{ goScreen($('sfida')); });
`;

/* =====================================================================
   GLI ANCORAGGI
   ===================================================================== */
const ANCORE = [

/* ---------------------------------------------------------------- 1 */
{
  nome: '1/27 il glifo della settima voce, nella serie dei ventisette',
  cerca: `  ingranaggio:'<path d="M12 8.4`,
  metti:
`  /* IL GLIFO DELLA SFIDA: due frecce, una che va e una che torna.
     E' letteralmente la modalita' — mandi una partita, ne torna
     un'altra — e non assomiglia a nessuno degli altri ventisei: lo
     scudetto e il trofeo sono gia' presi da STAGIONE e TORNEO, e a
     sedici pixel due maglie affiancate sono una macchia. La freccia
     che parte e' nella tinta d'accento del gioco, quella che torna e'
     gesso: chi attacca e chi risponde. */
  sfida:'<path d="M3.6 8.6 h13.2" stroke="#d8ff3d" stroke-width="2.6" stroke-linecap="round"/><path d="M14 5.2 L18.4 8.6 L14 12" fill="none" stroke="#d8ff3d" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M20.4 16.4 h-13.2" stroke="#f2f5ef" stroke-width="2.6" stroke-linecap="round"/><path d="M10 13 L5.6 16.4 L10 19.8" fill="none" stroke="#f2f5ef" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
  ingranaggio:'<path d="M12 8.4`,
},

/* ---------------------------------------------------------------- 2 */
{
  nome: '2/27 CSS: la schermata della sfida',
  cerca: `/* etichetta di sezione: stessa tacca fluo delle squadre sulla targa */`,
  metti:
`/* =====================================================================
   LA SFIDA — la schermata, cucita con i pezzi che ci sono gia'.

   Non nasce un vestito nuovo: la lavagna e' quella di SQUADRA e di
   STATISTICHE, le righe sono quelle della ROSA (.rrow), il bottoncino e'
   il .fbtn del NEGOZIO. Una modalita' nuova che si presenta con una
   grafica sua sembra un'altra applicazione incollata dentro.
   ===================================================================== */
.lav-sfida{max-width:560px;margin:0 auto 12px}
.lav-sfida .lav-corpo{position:relative;padding:24px 26px 16px;z-index:1}
.sf-tessera{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;flex-wrap:wrap;text-align:left}
.sf-chi b{display:block;font-family:var(--cond);font-weight:700;font-size:22px;letter-spacing:.03em;
  color:var(--gesso);line-height:1.1;word-break:break-word}
.sf-chi small{display:block;font-family:var(--cond);font-weight:600;font-size:10.5px;letter-spacing:.18em;
  text-transform:uppercase;color:var(--grigio);margin-top:2px}
.sf-cifre{display:flex;gap:18px}
.sf-cifre span{text-align:center}
.sf-cifre b{display:block;font-family:var(--cond);font-weight:700;font-size:22px;line-height:1;color:var(--gesso)}
.sf-cifre em{font-style:normal;display:block;font-family:var(--cond);font-weight:600;font-size:9.5px;
  letter-spacing:.16em;text-transform:uppercase;color:var(--grigio);margin-top:3px}
/* LA RIGA CHE SPIEGA. E' l'unica cosa che parla di rete, ed e' UNA riga:
   senza campo dice che cos'e' la modalita' e che serve la rete, e poi
   tace. Niente rotelle, niente «connessione richiesta». */
.sf-stato{margin-top:14px;text-align:left;font-family:var(--cond);font-weight:600;font-size:13px;
  line-height:1.45;color:var(--grigio)}
.sf-stato.male{color:var(--ambra)}
/* IL BOTTONE E LA LISTA HANNO LA LARGHEZZA DELLA LAVAGNA. Un primario
   che si stringe sul suo testo, in mezzo a due blocchi larghi 560, legge
   come una cosa messa li': la colonna di questa schermata e' una sola. */
#sfida .voce.primaria{display:block;max-width:560px;width:100%;margin:0 auto;text-align:center}
/* e l'etichetta di sezione sta sopra la lista, allineata con lei: la
   tacca di gesso e' un margine sinistro, non un ornamento centrato */
#sfida .eti{max-width:560px;margin:18px auto 8px;text-align:left}
.sf-lista{display:flex;flex-direction:column;gap:6px;max-width:560px;margin:0 auto;text-align:left}
.sf-vuota{font-family:var(--cond);font-weight:600;font-size:13px;line-height:1.45;color:var(--grigio);padding:10px 2px}
.sfriga{display:grid;grid-template-columns:10px minmax(0,1fr) auto auto;gap:10px;align-items:center;
  background:var(--ardesia);border:1px solid var(--linea);border-left:4px solid var(--linea);padding:7px 12px;min-width:0}
/* IL PALLINO DELLE NON GUARDATE. Il colore da solo non basta — e' la
   regola di casa sull'alto contrasto — quindi il segno e' DOPPIO: il
   tondo acceso e il filo di sinistra in ambra. */
.sfriga.nuova{border-left-color:var(--ambra)}
.sfp{display:block;width:8px;height:8px;border-radius:50%;background:transparent}
.sfriga.nuova .sfp{background:var(--ambra);box-shadow:0 0 0 2px rgba(255,176,32,.22)}
.sfchi{min-width:0}
.sfchi b{display:block;font-family:var(--cond);font-weight:700;font-size:15px;color:var(--gesso);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sfchi small{display:block;font-family:var(--cond);font-weight:600;font-size:10px;letter-spacing:.08em;
  text-transform:uppercase;color:var(--grigio);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sfris{font-family:var(--cond);font-weight:700;font-size:17px;color:var(--gesso);white-space:nowrap}
.sfris i{font-style:normal;color:var(--grigio);margin:0 3px}
.sfriga .fbtn{padding:5px 10px;font-size:11px;margin:0}
.clariga{display:grid;grid-template-columns:34px minmax(0,1fr) auto;gap:10px;align-items:center;
  background:var(--ardesia);border:1px solid var(--linea);padding:6px 12px;min-width:0}
.clariga.io{border-color:var(--gesso);background:#22322b}
.clariga .cp{font-family:var(--cond);font-weight:700;font-size:13px;color:var(--grigio)}
.clariga.io .cp{color:var(--gesso)}
.clariga .cn{font-family:var(--cond);font-weight:700;font-size:15px;color:var(--gesso);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.clariga .cq{font-family:var(--cond);font-weight:700;font-size:15px;color:var(--gesso)}
/* il pannello del codice: stessa carta del patto del NEGOZIO. Non riusa
   quel selettore perche' quello e' scritto in tre punti e allungarlo
   tre volte sarebbe tre ancoraggi per un vestito. */
#sfidaCodice{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;
  background:rgba(3,10,6,.72);overflow-y:auto;overscroll-behavior:contain}
#sfidaCodice.hidden{display:none}
#sfidaCodice .patto{max-width:460px;margin:16px;padding:20px 22px;text-align:left;position:relative;
  background:linear-gradient(180deg,#f2ecdb,#e3d9c0);color:#3a3020;
  font-family:var(--cond);font-weight:600;font-size:14.5px;line-height:1.5;
  box-shadow:0 8px 18px rgba(0,0,0,.6)}
#sfidaCodice .patto b{font-weight:700}
#sfidaCodice .sf-nota{font-size:12.5px;color:#5a4d33;margin-top:10px}
#sfidaCodice input{display:block;width:100%;box-sizing:border-box;margin:8px 0 2px;padding:8px 9px;
  font-family:var(--mono);font-weight:700;font-size:12px;letter-spacing:.04em;
  color:#20301a;background:#f8f3e6;border:1px solid #8d7c57;border-radius:2px}
#sfidaCodice .fbtn{margin-top:12px;margin-right:8px;color:#57492e;border-color:#b3a380;
  background:linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,.08));
  box-shadow:0 2px 0 rgba(90,70,40,.4)}
#sfidaCodice .fbtn.paga{background:linear-gradient(180deg,#ffc757,#e59200);border-color:#a86f00;color:#12210f}
/* etichetta di sezione: stessa tacca fluo delle squadre sulla targa */`,
},

/* ---------------------------------------------------------------- 3 */
{
  nome: '3/27 CSS: la fascia dei bottoni nel flusso, come le altre liste',
  cerca: `#rosa .azioni,#squadra .azioni,#trofei .azioni{position:static;margin:20px 0 0;padding:0 0 40px;background:none;box-shadow:none}`,
  metti:
`#rosa .azioni,#squadra .azioni,#trofei .azioni{position:static;margin:20px 0 0;padding:0 0 40px;background:none;box-shadow:none}
/* SFIDA e CLASSIFICA sono liste, e la ricetta e' la stessa delle altre
   sei: la fascia adesiva dei bottoni coprirebbe l'ultima riga, cioe' la
   sfida piu' vecchia e l'ultimo posto in classifica. */
#sfida .azioni,#classifica .azioni{position:static;margin:20px 0 0;padding:0 0 40px;background:none;box-shadow:none}`,
},

/* ---------------------------------------------------------------- 4 */
{
  nome: '4/27 la guida in basso passa da sei caselle a sette',
  cerca: `  #menu .menu-voci{display:grid;grid-template-columns:1.5fr repeat(5,1fr);
    gap:clamp(6px,1vw,12px);max-width:none;width:100%;margin:0}`,
  metti:
`  /* SETTE CASELLE, non piu' sei: GIOCA resta una volta e mezzo le altre
     — la gerarchia non si perde — e la settima e' SFIDA. Misurato a
     915x412: le sei caselle non primarie passano da 127,5 a 108,9 px, e
     la parola piu' lunga (SPOGLIATOIO, 93 px) ci sta con 4 px di
     margine. Sotto i 780 px di larghezza non ci starebbe piu', e la
     guardia in fondo a questo foglio la fa stare. */
  #menu .menu-voci{display:grid;grid-template-columns:1.5fr repeat(6,1fr);
    gap:clamp(6px,1vw,12px);max-width:none;width:100%;margin:0}`,
},

/* ---------------------------------------------------------------- 5 */
{
  nome: '5/27 le due guardie: la guida a sette non sfora su nessuno schermo',
  cerca: `@media (min-width:900px) and (min-height:640px){
  #menu .eroe-home{position:fixed;right:2.4vw;top:66px;bottom:auto;max-width:168px;margin:0}
}`,
  metti:
`@media (min-width:900px) and (min-height:640px){
  #menu .eroe-home{position:fixed;right:2.4vw;top:66px;bottom:auto;max-width:168px;margin:0}
}
/* =====================================================================
   LA SETTIMA CASELLA NON ROMPE LA GUIDA — le due guardie, misurate.

   E' il difetto gemello di _t-mentalita.js 1b/1c: una voce in piu' e un
   pannello che non ci sta piu'. La differenza e' che li' andava sotto il
   bordo BASSO, qui esce dal bordo DESTRO — le colonne di una griglia in
   fr non scendono mai sotto il loro min-content, e il min-content di
   SPOGLIATOIO e' 93 px di parola piu' 12 di fianchi.

   QUANTO SFORAVA, misurato su undici formati (pixel di griglia oltre la
   sua scatola; il gioco spedito ha sei voci, questa toppa sette):

                    spedito   7 voci senza guardia   con la guardia
     915x412           0               0                   0
     812x375           0               0                   0
     740x360           0               0                   0
     667x375           0              33                   0
     640x360           0              57                   0
     568x320          65 (!)         124                   0
     360x800           0        1 voce sotto la piega      0
     360x640           0        1 voce sotto la piega      0

   Il 65 della prima colonna a 568x320 non e' un refuso: la guida a SEI
   caselle del gioco spedito sfora gia'. La guardia lo ripara insieme al
   resto, e questa e' l'unica ragione per cui una toppa che aggiunge una
   voce puo' lasciare quel numero piu' basso di come l'ha trovato.

   LA GUARDIA STA IN FONDO, dopo le regole che deve battere. Messa
   accanto al blocco della guida — quaranta righe piu' su — avrebbe la
   stessa specificita' e perderebbe contro l'ultima scritta: sarebbe
   codice che non fa niente accanto a un commento che dice che lo fa.
   (E' esattamente l'errore documentato in _t-mentalita.js 1c.)

   PERCHE' IL SOTTOTITOLO DI GIOCA SPARISCE SOTTO I 780. Perche' e'
   l'unico sottotitolo della guida che resta visibile, non va a capo, ed e' lui a
   fissare il min-content della prima casella a 166 px — il pezzo piu'
   grosso della riga. Le altre sei voci il sottotitolo l'hanno gia'
   perso in questa vista da quando la guida esiste: sotto i 780 lo perde
   anche la settima. La parola GIOCA resta, in ambra, larga una volta e
   mezzo le altre.
   ===================================================================== */
/* =====================================================================
   IL PARALLELOGRAMMA MANGIA QUATTORDICI PIXEL, e con sette caselle sono
   quattordici di troppo.

   .voce e' tagliata in diagonale — clip-path:polygon(14px 0, 100% 0,
   calc(100% - 14px) 100%, 0 100%) — quindi AL PIEDE del bottone il bordo
   destro rientra di 14 px. Nella guida il testo sta proprio al piede
   (justify-content:flex-end), e la parola ci finisce dentro.

   E' l'errore che una misura fatta col rettangolo non vede:
   getBoundingClientRect torna la scatola INTERA, il taglio no. Con sei
   caselle a 915x412 c'era margine e non si notava; con sette,
   SPOGLIATOIO (93 px di parola in 109 di casella) usciva tagliato —
   «SPOGLIATOIC» — e con lui il sottotitolo di GIOCA. Visto in
   fotografia, non dedotto: fuori/sfida-menu7.png del primo giro.

   La cura e' il corpo del carattere, non lo spazio: 11 px invece di 13
   sulla parola e 7,5 invece di 9 sul sottotitolo di GIOCA. A 915x412
   SPOGLIATOIO passa da 93 a 78 px in una casella che al piede ne offre
   83. La parola resta leggibile — sono maiuscole condensate su fondo
   scuro a 14:1 di contrasto — e il glifo sopra non cambia di un pixel.
   ===================================================================== */
@media (max-height:470px), (min-width:900px) and (min-height:640px){
  #menu .voce{font-size:clamp(9px,1.2vw,19px);letter-spacing:.01em}
  #menu .voce.primaria small{font-size:clamp(6px,.85vw,11px);letter-spacing:.02em}
}
@media (max-height:470px) and (max-width:780px){
  #menu .menu-voci{gap:5px}
  #menu .voce{padding-left:4px;padding-right:4px}
  #menu .voce.primaria small{display:none}
}
/* IN VERTICALE la guida non c'e' — c'e' la colonna — e il conto e'
   un'altra cosa: sette voci alte 75 px con 13 di spazio fanno 610 px, e
   su un telefono alto 800 la settima chiude a 837, cioe' sotto la piega.
   Otto pixel di spazio e dieci di imbottitura invece di tredici e
   dodici recuperano 58 px e la riportano a 779. Sopra gli 880 px di
   altezza non serve niente: a 412x915 le sette voci chiudono a 844. */
@media (orientation:portrait) and (max-height:880px){
  #menu .menu-voci{gap:8px}
  #menu .voce{padding-top:10px;padding-bottom:10px}
}`,
},

/* ---------------------------------------------------------------- 6 */
{
  nome: '6/27 la settima voce in home, fra i modi di giocare',
  cerca: `        <button class="voce" id="btnSpogliatoio"><i class="vico" data-ico="maglia"></i>SPOGLIATOIO <small>squadra &middot; rosa &middot; campi</small></button>`,
  metti:
`        <!-- LA SFIDA STA FRA I MODI DI GIOCARE, non in fondo alla fila:
             GIOCA, STAGIONE, TORNEO e SFIDA sono le quattro cose che
             aprono una partita, SPOGLIATOIO, BACHECA e NEGOZIO sono le
             tre che aprono un cassetto. Un elenco in cui l'ordine non
             dice niente e' un elenco che si legge tutto ogni volta.
             Il sottotitolo non promette la rete: promette la partita.
             Chi non ha campo apre lo stesso e trova una riga che
             spiega, non un errore. -->
        <button class="voce" id="btnSfida"><i class="vico" data-ico="sfida"></i>SFIDA <small>contro la squadra di un altro</small></button>
        <button class="voce" id="btnSpogliatoio"><i class="vico" data-ico="maglia"></i>SPOGLIATOIO <small>squadra &middot; rosa &middot; campi</small></button>`,
},

/* ---------------------------------------------------------------- 7 */
{
  nome: '7/27 le due schermate nuove, accanto alla BACHECA',
  cerca: `<!-- ============ L'INGRANAGGIO (impostazioni + come si gioca) ============ -->`,
  metti:
`<!-- ============ SFIDA (la sfida asincrona) ============
     SI APRE SEMPRE, anche senza rete: non c'e' nessuna porta chiusa,
     nessun «connessione richiesta». Quando la rete non c'e', la riga
     sotto la lavagna dice che cos'e' questa modalita' e che serve la
     rete, e finisce li'. Chi non ha campo torna al menu senza aver
     aspettato niente. -->
<div id="sfida" class="ov hidden">
  <div class="box">
    <h1 class="sotto-titolo">SFIDA</h1>
    <div class="lavagna lav-sfida">
      <div class="lav-corpo">
        <div class="sf-tessera">
          <div class="sf-chi"><b id="sfNome">&nbsp;</b><small>la tua squadra in rete</small></div>
          <div class="sf-cifre">
            <span><b id="sfPunti">&mdash;</b><em>punti</em></span>
            <span><b id="sfPosto">&mdash;</b><em>posto</em></span>
            <span><b id="sfForza">&mdash;</b><em>forza</em></span>
          </div>
        </div>
        <div class="sf-stato" id="sfStato">Attacca la squadra di un&rsquo;altra persona: non deve essere online, non deve nemmeno aver aperto il gioco oggi.</div>
      </div>
    </div>
    <button class="voce primaria" id="btnSfidaCerca">CERCA AVVERSARIO <small>una partita sola, col seme che d&agrave; il server</small></button>
    <div class="eti">LE SFIDE CHE HAI SUBITO</div>
    <div class="sf-lista" id="sfLista"></div>
    <div class="azioni">
      <button class="btnA sec" id="btnSfidaClassifica">CLASSIFICA</button>
      <button class="btnA sec" id="btnSfidaCodice">CAMBIO TELEFONO</button>
      <button class="btnA sec" id="btnBackSfida">TORNA AL MENU</button>
    </div>
  </div>
  <!-- IL PREZZO DELL'ANONIMATO, DETTO PRIMA E NON DOPO. Non c'e' un
       conto, non c'e' un'email, non c'e' un accesso: e' quello che tiene
       questo gioco a zero permessi. In cambio, se il telefono si perde
       si perde la squadra, e questo codice e' l'unico modo di portarla
       altrove. Sta scritto qui, accanto al codice, in grassetto. -->
  <div id="sfidaCodice" class="hidden">
    <div class="patto">
      <b>PORTARE LA SQUADRA SU UN ALTRO TELEFONO</b><br>
      Non c&rsquo;&egrave; nessun conto e nessuna email: il server conosce soltanto un
      numero che sta su questo telefono. <b>Se perdi il telefono, perdi la
      squadra.</b> Questo codice &egrave; l&rsquo;unico modo di portarla altrove: copialo
      e tienilo da parte.
      <input id="sfCodMio" readonly spellcheck="false" aria-label="il tuo codice di trasferimento">
      <div class="sf-nota">Sull&rsquo;altro telefono incolla qui sotto il codice. Da quel momento &egrave; quel telefono a essere questa squadra.</div>
      <input id="sfCodIn" autocomplete="off" spellcheck="false" placeholder="incolla qui il codice" aria-label="codice da usare">
      <button class="fbtn paga" id="btnSfCodUsa">USA IL CODICE</button>
      <button class="fbtn" id="btnSfCodChiudi">CHIUDI</button>
    </div>
  </div>
</div>

<!-- ============ CLASSIFICA ============ -->
<div id="classifica" class="ov hidden">
  <div class="box">
    <h1 class="sotto-titolo">CLASSIFICA</h1>
    <div class="sf-lista" id="claLista"></div>
    <div class="azioni"><button class="btnA sec" id="btnBackClassifica">TORNA ALLE SFIDE</button></div>
  </div>
</div>

<!-- ============ L'INGRANAGGIO (impostazioni + come si gioca) ============ -->`,
},

/* ---------------------------------------------------------------- 8 */
{
  nome: '8/27 le due schermate entrano nella navigazione',
  cerca: `               $('spogliatoio'),$('bacheca'),$('extra'),$('rosa'),$('stagione'),$('negozio'),$('crediti')].filter(Boolean);`,
  metti:
`               $('spogliatoio'),$('bacheca'),$('extra'),$('rosa'),$('stagione'),$('negozio'),$('crediti'),
               /* entrando in SCREENS le due schermate nuove ereditano
                  gratis tutto quello che le altre hanno gia': il tasto
                  Indietro di Android, l'Escape, la sfumatura di fondo
                  pagina e il fatto che aprirne una chiuda le altre. */
               $('sfida'),$('classifica')].filter(Boolean);`,
},

/* ---------------------------------------------------------------- 9 */
{
  nome: '9/27 il cronometro di una sfida non e\' una preferenza',
  cerca: `function durataPartita(){
  return Math.round((SAVE.durata || MATCH_SEC) * FW / 1150);
}`,
  metti:
`function durataPartita(){
  /* =====================================================================
     IN UNA SFIDA IL CRONOMETRO NON E' UNA PREFERENZA.

     La durata e' una voce del menu (90, 120 o 180 secondi). In una
     partita contro se stessi va benissimo; in una sfida di rete e' un
     guasto silenzioso: chi ha 180 gioca una partita lunga il doppio di
     chi ha 90, la classifica confronta due cose diverse, e soprattutto
     il REPLAY non torna — chi guarda la partita che ha subito la
     rigioca col SUO cronometro, e dopo i suoi novanta secondi il nastro
     dell'altro continua a parlare a una partita gia' finita.

     Percio' in sfida vale il numero di serie, scalato col campo dalla
     stessa formula di sempre: 90, 126 e 180 secondi. Fuori dalla sfida
     G.sfida e' null e questa riga e' l'espressione di prima, allo stesso
     double: x ? a : b con x falso E' b.
     ===================================================================== */
  return Math.round(((G.sfida ? MATCH_SEC : (SAVE.durata || MATCH_SEC))) * FW / 1150);
}`,
},

/* --------------------------------------------------------------- 10 */
{
  nome: '10/27 startMatch: la postura di una sfida viene dal profilo pubblico',
  cerca: `  G.ment=[mentValida(SAVE.mentalita), mentValida(opts.opp ? opts.opp.ment : 1)];`,
  metti:
`  /* LA PANCHINA DI CASA, quando la casa non e' la tua. Serve al replay
     di una sfida subita: chi guarda deve vedere la postura di CHI HA
     ATTACCATO, se no i comandi del nastro muovono una squadra schierata
     in un altro modo e la partita non e' piu' quella. Fuori di li'
     opts.mia non esiste e la riga e' quella di prima. */
  G.ment=[mentValida(opts.mia && opts.mia.ment!==undefined ? opts.mia.ment : SAVE.mentalita),
          mentValida(opts.opp ? opts.opp.ment : 1)];`,
},

/* --------------------------------------------------------------- 11 */
{
  nome: '11/27 startMatch: la rosa di casa puo\' non essere la mia',
  cerca: `  G.oppRosa = null;
  if(opts.opp && Array.isArray(opts.opp.rosa) && opts.opp.rosa.length >= 4){`,
  metti:
`  /* =====================================================================
     LA ROSA DI CASA, quando non e' la mia — e serve a UNA cosa sola.

     Il replay di una sfida SUBITA rigioca i comandi di chi ha attaccato:
     in campo, dalla parte di chi tiene il pollice, ci deve essere la SUA
     squadra. Con la propria rosa il nastro muoverebbe undici uomini
     diversi e il punteggio non tornerebbe — cioe' il replay mostrerebbe
     una partita che non e' successa, che e' peggio di nessun replay.

     Fuori dal replay G.miaRosa e' null e setupPlayers legge SAVE.rosa
     esattamente come ha sempre fatto: «G.miaRosa || SAVE.rosa» con
     G.miaRosa null E' SAVE.rosa, lo stesso oggetto.

     La validazione e' la stessa, e stretta per la stessa ragione: questa
     rosa arriva dalla rete, e un attributo storto diventa un uomo che
     corre a velocita' infinita.
     ===================================================================== */
  G.miaRosa = null;
  if(opts.mia && Array.isArray(opts.mia.rosa) && opts.mia.rosa.length >= 4){
    const q = (v, d) => { const n = Math.round(+v); return Number.isFinite(n) ? Math.max(1, Math.min(99, n)) : d; };
    G.miaRosa = opts.mia.rosa.map(r => ({
      nome: (typeof r.nome === 'string' && r.nome.trim()) ? r.nome.trim().slice(0, 24) : 'GIOCATORE',
      vel: q(r && r.vel, 62), tiro: q(r && r.tiro, 62),
      tecnica: q(r && r.tecnica, 62), tackle: q(r && r.tackle, 62),
    }));
    if(opts.mia.n) G.teamName = String(opts.mia.n).slice(0, 18);
  }
  G.oppRosa = null;
  if(opts.opp && Array.isArray(opts.opp.rosa) && opts.opp.rosa.length >= 4){`,
},

/* --------------------------------------------------------------- 12 */
{
  nome: '12/27 startMatch: e la maglia di casa segue la rosa di casa',
  cerca: `  if(opts.opp){ G.oppName=String(opts.opp.n||'CPU'); TEAMCOL[1]=opts.opp.c1; TEAMCOL2[1]=opts.opp.c2; TEAMPAT[1]=opts.opp.pat|0; }`,
  metti:
`  /* LA MAGLIA DI CASA, nel solo caso in cui la casa non e' la tua (il
     replay di una sfida subita). L'ALTO CONTRASTO VINCE: e'
     un'impostazione di accessibilita', e applyKit l'ha gia' messa
     addosso alla squadra 0 due righe fa. */
  if(opts.mia && !SAVE.dalt){
    if(opts.mia.c1) TEAMCOL[0]=opts.mia.c1;
    if(opts.mia.c2) TEAMCOL2[0]=opts.mia.c2;
    if(opts.mia.pat!==undefined) TEAMPAT[0]=opts.mia.pat|0;
  }
  if(opts.opp){ G.oppName=String(opts.opp.n||'CPU'); TEAMCOL[1]=opts.opp.c1; TEAMCOL2[1]=opts.opp.c2; TEAMPAT[1]=opts.opp.pat|0; }`,
},

/* --------------------------------------------------------------- 13 */
{
  nome: '13/27 il tutorial non entra in una sfida',
  cerca: `  if(!SAVE.tutorialDone && G.mode===1 && !G.cpu[0]) Tut.start(); else Tut.stop();`,
  metti:
`  /* IL TUTORIAL NON ENTRA IN UNA SFIDA. Non e' una questione di stile:
     Tut.tick gira dentro step(), col passo fisso, e chi rigioca il
     nastro dall'altra parte del mondo il tutorial l'ha gia' fatto —
     quindi la sua partita avrebbe un passo in piu' o in meno della mia
     e il replay divergerebbe. E' la stessa ragione per cui il registro
     mette a tacere gli inviti (vedi Reg.azzeraComandi). */
  if(!SAVE.tutorialDone && G.mode===1 && !G.cpu[0] && !G.sfida) Tut.start(); else Tut.stop();`,
},

/* --------------------------------------------------------------- 14 */
{
  nome: '14/27 setupPlayers legge la rosa di casa, che di solito e\' la mia',
  cerca: `  const casa = N>((SAVE.rosa&&SAVE.rosa.length)||0) ? rosaAvversaria('QUARTIERE·'+G.teamName, N, registro) : null;
  let med=62;
  if(SAVE.rosa && SAVE.rosa.length){
    let s=0;
    for(const r of SAVE.rosa) s+=(r.vel+r.tiro+r.tecnica+r.tackle)/4;
    med=Math.round(s/SAVE.rosa.length);
  }`,
  metti:
`  /* LA ROSA DI CASA. E' SAVE.rosa in ogni partita che si gioca; e' la
     rosa di chi ha attaccato soltanto mentre si GUARDA una sfida
     subita, dove il nastro muove la sua squadra e non la tua.
     «G.miaRosa || SAVE.rosa» con G.miaRosa null e' SAVE.rosa: lo stesso
     oggetto, non una copia. */
  const MIA = G.miaRosa || SAVE.rosa;
  const casa = N>((MIA&&MIA.length)||0) ? rosaAvversaria('QUARTIERE·'+G.teamName, N, registro) : null;
  let med=62;
  if(MIA && MIA.length){
    let s=0;
    for(const r of MIA) s+=(r.vel+r.tiro+r.tecnica+r.tackle)/4;
    med=Math.round(s/MIA.length);
  }`,
},

/* --------------------------------------------------------------- 15 */
{
  nome: '15/27 setupPlayers: gli uomini di casa vengono dalla stessa rosa',
  cerca: `      if(t===0 && SAVE.rosa && SAVE.rosa[i]){
        const r=SAVE.rosa[i];`,
  metti:
`      if(t===0 && MIA && MIA[i]){
        const r=MIA[i];`,
},

/* --------------------------------------------------------------- 16 */
{
  nome: '16/27 endMatch: l\'indole si impara e l\'esito parte',
  cerca: `function endMatch(){
  Tut.stop();
  setScene('end');`,
  metti:
`function endMatch(){
  Tut.stop();
  setScene('end');
  /* =====================================================================
     LA SFIDA SI CHIUDE QUI, E STA IN CIMA PER TRE RAGIONI MISURABILI:

       · il punteggio e' definitivo da questa riga in poi;
       · il nastro dei comandi e' ancora intero (nessuno lo tocca);
       · deve girare PRIMA di applyMatchRewards, perche' un replay non
         deve pagare monete ne' far crescere la rosa, e il modo di
         spegnere il premio e' G.matchRewarded, che quella riga legge.

     Dentro c'e' anche l'apprendimento dell'indole, che vale per OGNI
     partita e non solo per le sfide: sono i sei numeri che dicono come
     giochi, e viaggiano col profilo quando qualcuno ti attacca.
     ===================================================================== */
  chiudiSfida();`,
},

/* --------------------------------------------------------------- 17 */
{
  nome: '17/27 la fine di una sfida non promette una rivincita',
  cerca: `  ui.btnRivincita.textContent = G.matchCtx==='season' ? 'CLASSIFICA' : (G.matchCtx==='tour' ? 'TABELLONE' : 'RIVINCITA');`,
  metti:
`  /* DOPO UNA SFIDA NON C'E' UNA RIVINCITA, e prometterla sarebbe una
     bugia da un tocco: quella partita e' unica per costruzione — il
     server assegna un impegno solo, con un seme solo — e ripeterla non
     si puo'. Il bottone riporta dove si riparte davvero. */
  ui.btnRivincita.textContent = G.sfidaFine===1 ? 'ALTRA SFIDA'
    : G.sfidaFine===2 ? 'LE SFIDE'
    : (G.matchCtx==='season' ? 'CLASSIFICA' : (G.matchCtx==='tour' ? 'TABELLONE' : 'RIVINCITA'));`,
},

/* --------------------------------------------------------------- 18 */
{
  nome: '18/27 e il bottone di fine partita porta dove dice',
  cerca: `$('btnRivincita').addEventListener('click', ()=>{
  Audio5.unlock();
  if(G.matchCtx==='season'){ setScene('menu'); Audio5.crowdLevel(0); openStagione(); }`,
  metti:
`$('btnRivincita').addEventListener('click', ()=>{
  Audio5.unlock();
  if(G.sfidaFine){ setScene('menu'); Audio5.crowdLevel(0); Sfida.apri(); }
  else if(G.matchCtx==='season'){ setScene('menu'); Audio5.crowdLevel(0); openStagione(); }`,
},

/* --------------------------------------------------------------- 19 */
{
  nome: '19/27 uscire da una sfida a meta\' rimette il gioco com\'era',
  cerca: `$('btnQuit').addEventListener('click', ()=>{
  G.paused=false; hide(ui.pausa);`,
  metti:
`$('btnQuit').addEventListener('click', ()=>{
  G.paused=false; hide(ui.pausa);
  /* USCIRE DA UNA SFIDA NON E' GRATIS PER IL GIOCO, ed e' qui che si
     paga: senza questa riga il seme resterebbe acceso e tutte le
     amichevoli successive sarebbero la stessa identica partita, e il
     cronometro resterebbe su quello di rete. Il difetto non si vede
     finche' non si gioca due volte di fila. */
  abbandonaSfida();`,
},

/* --------------------------------------------------------------- 19b */
{
  nome: '19b/27 il nastro dichiara di essere incompleto, e il replay si ferma',
  cerca: `  Duel.start(shooterTeam);
}`,
  metti:
`  Duel.start(shooterTeam);
  /* =====================================================================
     IL DUELLO NON STA NEL NASTRO, e qui si fanno due cose per non
     mentire a chi guardera'.

     I pointerdown del duello sono appesi all'elemento #duel e non
     passano dalle quattro porte che il registro avvolge: la mira, la
     barra e la scelta del portiere non finiscono nel nastro. In una
     partita a un giocatore c'e' SEMPRE un umano in questo duello — chi
     tira se tira la squadra 0, chi para se tira la squadra 1 — quindi
     non e' un caso raro.

     1. CHI REGISTRA LASCIA UN SEGNO. Un comando di tipo 5, senza
        argomenti, che in rilettura non fa niente (esegui non ha un ramo
        per il 5) e che serve a una cosa sola: dire al nastro stesso «io
        sono incompleto». Cosi' chi lo riceve puo' saperlo PRIMA di
        guardare novanta secondi di una partita che non e' quella.
     2. CHI RILEGGE SI FERMA. Se un duello si apre lo stesso durante un
        replay — la partita rigiocata puo' prendere strade diverse — il
        replay non resta appeso ad aspettare un dito che non arrivera'
        mai: si interrompe e dice perche'.

     La strada per ripararlo davvero sta accanto a
     fermaReplayAlDischetto.
     ===================================================================== */
  if(Reg.modo===1 && (Duel.shooterHuman || Duel.keeperHuman)) Reg.scrivi(5, []);
  if(Reg.modo===2 && G.sfida && G.sfida.replay && (Duel.shooterHuman || Duel.keeperHuman))
    setTimeout(fermaReplayAlDischetto, 0);
}`,
},

/* --------------------------------------------------------------- 19c */
{
  nome: '19c/27 il nastro impara due parole nuove: il segno del duello e le due squadre',
  cerca: `        pezzi.push(dT + ',4,' + dMs + ',' + (r[3] ? 1 : 0) + ',' + r[4]);`,
  metti: `        pezzi.push(dT + ',4,' + dMs + ',' + (r[3] ? 1 : 0) + ',' + r[4]);
      } else if(tipo === 5){
        /* IL SEGNO DEL DUELLO: nessun argomento, tre caratteri, e in
           rilettura non fa niente. Serve a dire che in questa partita
           c'e' stato un calcio piazzato con un umano dentro, cioe' che
           il nastro NON basta a rifarla. Chi legge un nastro vecchio non
           lo trova e non cambia niente per lui. */
        pezzi.push(dT + ',5,' + dMs);
      } else if(tipo === 7){
        /* LE DUE SQUADRE. Interi e virgole, lunghezza variabile, scritti
           una volta sola in testa alla partita; in rilettura non fanno
           niente (esegui non ha un ramo per il 7). Servono a chi
           ricevera' il nastro per rifare la partita con gli uomini che
           l'hanno giocata, e non con quelli di oggi. */
        pezzi.push(dT + ',7,' + dMs + ',' + r.slice(3).map(x => x|0).join(','));`,
},

/* --------------------------------------------------------------- 19d */
{
  nome: '19d/27 e le sa rileggere',
  cerca: `      else if(tipo === 4)   this.righe.push([tick, 4, ms, v[3], v[4]]);`,
  metti: `      else if(tipo === 4)   this.righe.push([tick, 4, ms, v[3], v[4]]);
      else if(tipo === 5)   this.righe.push([tick, 5, ms]);
      else if(tipo === 7)   this.righe.push([tick, 7, ms].concat(v.slice(3)));`,
},

/* --------------------------------------------------------------- 20 */
{
  nome: '20/27 il corpo della schermata, accanto ai comandi che la aprono',
  cerca: `$('btnBackExtra').addEventListener('click', ()=>{ goScreen(ui.menu); });`,
  metti: `$('btnBackExtra').addEventListener('click', ()=>{ goScreen(ui.menu); });
` + BLOCCO_JS,
},

/* --------------------------------------------------------------- 21 */
{
  nome: '21/27 __test apre la schermata al banco',
  cerca: `  get rete(){ return Rete; },`,
  metti: `  get rete(){ return Rete; },
  /* LA SCHERMATA, aperta al banco. Serve a provare quel che un dito puo'
     fare senza dover simulare un dito: cercare un avversario, guardare
     un replay, leggere la classifica. Il server finto sta gia' in
     _q-rete.js e si riusa da li'. */
  get sfida(){ return Sfida; },
  get sfidaStato(){ return { inPartita:!!G.sfida, seme:G.sfida?G.sfida.seme:'',
                             taglia:G.sfida?G.sfida.taglia|0:0, replay:!!(G.sfida&&G.sfida.replay),
                             fine:G.sfidaFine|0, elenco:Sfida.sfide.length,
                             miaRosa:G.miaRosa?G.miaRosa.length:0 }; },`,
},

/* =====================================================================
   22 — IL NOME DELLA SQUADRA, e questo e' un difetto del gioco spedito.

   Rete.pubblica leggeva SAVE.squadraNome. Quel campo NON ESISTE: il nome
   della squadra sta in SAVE.teamName da sempre (defaultSave riga
   `teamName:'DOPOLAVORO'`), e «squadraNome» compare UNA volta sola in
   2,1 MB di file — proprio in questa riga. Il ripiego a valle faceva il
   resto: ogni squadra si sarebbe pubblicata come «LA MIA SQUADRA», e la
   classifica sarebbe stata una colonna di copie dello stesso nome.

   Si chiude qui e non in _t-rete.js perche' e' questa toppa a mostrare
   quel nome a qualcuno — nella tessera in cima alla schermata e nella
   classifica — e una toppa che mostra un nome sbagliato sapendolo
   sarebbe peggio del difetto.
   ===================================================================== */
{
  nome: '22/27 la squadra si pubblica col nome che ha davvero',
  cerca: `    const nome = (m.nome || SAVE.squadraNome || 'LA MIA SQUADRA').toString().slice(0, 18);`,
  metti: `    /* IL NOME DELLA SQUADRA STA IN SAVE.teamName, e qui c'era scritto un
       campo che in questo gioco non esiste: unica occorrenza in 2,1 MB,
       proprio in questa riga. Il ripiego a valle faceva il resto, e ogni
       squadra si sarebbe pubblicata come 'LA MIA SQUADRA'. m.nome resta
       davanti perche' e' il nome scelto per la rete, se un giorno ci
       sara' modo di darne uno diverso. */
    const nome = (m.nome || SAVE.teamName || 'LA MIA SQUADRA').toString().slice(0, 18);`,
},

/* --------------------------------------------------------------- 23 */
{
  nome: '23/27 AZZERA DATI dice anche che cancella la squadra in rete',
  cerca: `      <button class="voce" id="btnReset">AZZERA TUTTI I DATI <small>monete, campi, trofei, statistiche</small></button>`,
  metti: `      <!-- LA VOCE DICE ANCHE CHE COSA COSTA IN RETE. Azzerare i dati
           butta via SAVE.rete, cioe' l'identita' anonima: punti, posto in
           classifica e sfide subite non tornano piu', perche' non c'e'
           nessun conto da cui recuperarli. E' lo stesso prezzo del
           telefono perso, e va detto sul bottone, non dopo. -->
      <button class="voce" id="btnReset">AZZERA TUTTI I DATI <small>monete, campi, trofei, statistiche &mdash; e la squadra in rete</small></button>`,
},

/* --------------------------------------------------------------- 23b */
{
  nome: '23b/27 e lo dice anche quando il bottone si disarma',
  cerca: `  btnReset.innerHTML='AZZERA TUTTI I DATI <small>monete, campi, trofei, statistiche</small>';`,
  metti: `  btnReset.innerHTML='AZZERA TUTTI I DATI <small>monete, campi, trofei, statistiche — e la squadra in rete</small>';`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-sfida-ui.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

/* LA REGOLA DI CASA: --dentro non esiste in questa toppa. Si prova su
   copia, e chi la vuole spedire lo fa con le mani sue dopo aver visto i
   cancelli verdi. */
if (haFlag('dentro')) {
  console.error('FALLITO: questa toppa non ha --dentro. Si prova su copia: --out fuori/sfidaui.html');
  process.exit(2);
}

const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.sfidaui.html';
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
  console.error('');
  console.error('Gli ancoraggi 21 e 22 cercano il motore della rete: _t-sfida-ui.js va DOPO _t-rete.js.');
  process.exit(1);
}

/* =====================================================================
   I CONTROLLI DOPO LA SOSTITUZIONE.

   Non sono un rito: ognuno guarda una riga che, se sparisse, romperebbe
   in silenzio una promessa scritta in cima a questo file.
   ===================================================================== */
const attesi = [
  /* la schermata esiste, e una volta sola */
  ['<div id="sfida" class="ov hidden">', 1],
  ['<div id="classifica" class="ov hidden">', 1],
  ['id="btnSfida"', 1],
  ['const Sfida = {', 1],
  ['function chiudiSfida(){', 1],
  ['function abbandonaSfida(){', 1],
  /* LA GUIDA HA SETTE CASELLE e non piu' sei */
  ['grid-template-columns:1.5fr repeat(6,1fr)', 1],
  ['grid-template-columns:1.5fr repeat(5,1fr)', 0],
  /* le due guardie, quelle che tengono la settima voce dentro lo schermo */
  ['@media (max-height:470px) and (max-width:780px){', 1],
  ['@media (orientation:portrait) and (max-height:880px){', 1],
  /* il cronometro di rete, e la garanzia che offline sia il gioco di prima */
  ['(G.sfida ? MATCH_SEC : (SAVE.durata || MATCH_SEC))', 1],
  ['(SAVE.durata || MATCH_SEC) * FW / 1150', 0],
  /* la rosa di casa passa da un punto solo */
  ['const MIA = G.miaRosa || SAVE.rosa;', 1],
  /* IL NASTRO PARLA DUE PAROLE NUOVE, e le sa dire e rileggere. Se una
     delle due meta' sparisse, un nastro scritto oggi diventerebbe
     illeggibile domani — in silenzio. */
  ["pezzi.push(dT + ',5,' + dMs);", 1],
  ['else if(tipo === 5)   this.righe.push([tick, 5, ms]);', 1],
  ["pezzi.push(dT + ',7,' + dMs + ',' + r.slice(3).map(x => x|0).join(','));", 1],
  ['else if(tipo === 7)   this.righe.push([tick, 7, ms].concat(v.slice(3)));', 1],
  ['Reg.scrivi(5, [])', 1],
  ['Reg.scrivi(7, [mentMia, mentSua]', 1],
  /* E VIAGGIA STRETTO. Senza queste due righe il server rifiuta ogni
     sfida con 'replay-forma', che e' un no definitivo: la partita non si
     riprova, si butta. */
  ['stringiNastro(nastro).then(', 1],
  ['await allargaNastro(s.replay', 1],
  /* l'esito si chiude in cima a endMatch, prima dei premi */
  ['  chiudiSfida();', 1],
  /* il difetto del nome pubblicato */
  ['SAVE.squadraNome', 0],
  ['(m.nome || SAVE.teamName || \'LA MIA SQUADRA\')', 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s.slice(0, 64) + '  atteso ' + n + ', trovato ' + (out.split(s).length - 1));

/* IL CAMPO CHE NON ESISTE non deve tornare: era l'unica occorrenza del
   file, e dopo la sostituzione deve essere zero. Il nome si scrive a
   pezzi perche' altrimenti sarebbe questa riga a farlo comparire. */
const fantasma = 'SAVE.' + 'squadraNome';
if ((out.split(fantasma).length - 1) !== 0)
  rotti.push('il campo inesistente e\' ancora citato ' + (out.split(fantasma).length - 1) + ' volte');

/* LA LEGGE SUI SORTEGGI, seconda meta': nel gioco non esiste piu' un
   sorteggio del browser fuori dai commenti, e questa toppa non ne
   introduce. Si conta prima e dopo invece di pretendere zero, perche'
   zero sarebbe falso — cinque menzioni vivono nei commenti. */
const rndT = 'Math.' + 'random(';
const rndPrima = src.split(rndT).length - 1, rndDopo = out.split(rndT).length - 1;
if (rndPrima !== rndDopo)
  rotti.push('i sorteggi del browser sono passati da ' + rndPrima + ' a ' + rndDopo);

/* IL CONTO DEI dado() NON DEVE CAMBIARE. Non e' una promessa: si contano
   le occorrenze prima e dopo, e devono essere le stesse. Questa toppa non
   ne scrive nessuno. */
const dadoPrima = src.split('dado()').length - 1;
const dadoDopo = out.split('dado()').length - 1;
if (dadoPrima !== dadoDopo) rotti.push('le chiamate a dado() sono passate da ' + dadoPrima + ' a ' + dadoDopo);

/* chiudiSfida deve stare PRIMA di applyMatchRewards dentro endMatch, se
   no un replay paga monete */
const pEnd = out.indexOf('function endMatch(){');
const pChiudi = out.indexOf('  chiudiSfida();', pEnd);
const pPremi = out.indexOf('applyMatchRewards()', pEnd);
if (!(pEnd >= 0 && pChiudi > pEnd && pPremi > pChiudi))
  rotti.push('chiudiSfida() non e\' dentro endMatch prima di applyMatchRewards');

/* le due guardie del CSS devono venire DOPO le regole che battono:
   stessa specificita', vince l'ultima scritta (lezione di _t-mentalita 1c) */
const pGuida = out.indexOf('grid-template-columns:1.5fr repeat(6,1fr)');
const pGuardia = out.indexOf('@media (max-height:470px) and (max-width:780px){');
const pVoci = out.lastIndexOf('#menu .menu-voci{gap:9px}');
if (!(pGuardia > pGuida)) rotti.push('la guardia orizzontale sta PRIMA della regola che deve battere');
if (!(out.indexOf('@media (orientation:portrait) and (max-height:880px){') > pVoci))
  rotti.push('la guardia verticale sta PRIMA della regola che deve battere');

if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
console.log('    dado(): ' + dadoPrima + ' prima, ' + dadoDopo + ' dopo');
console.log('');
console.log('I CANCELLI:');
const rel = path.relative(RADICE, outFile).replace(/\\/g, '/');
console.log('  node strumenti/collaudo.js --gioco ' + rel);
console.log('  node strumenti/diritti.js  --gioco ' + rel);
console.log('  node strumenti/_q-rete.js  --gioco ' + rel);
console.log('  node strumenti/_q-sfida.js --gioco ' + rel);
console.log('  node strumenti/_q-meta.js --tre-taglie --gioco ' + rel);
