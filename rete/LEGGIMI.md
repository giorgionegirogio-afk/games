# La rete di CALCETTO — architettura, e perché è questa

Aggiornato al 27 agosto 2026.

## Il fatto da cui discende tutto

Il gioco è **deterministico**. Non è un'opinione: `strumenti/_q-determinismo.js`
gioca la stessa partita due volte con lo stesso seme e confronta un'impronta di
123 campioni — posizione di ogni uomo, del pallone, punteggio, cronometro. Sei
controlli su sei passati, e passano anche fra **due pagine diverse**, cioè non
c'è nulla che sopravviva da una partita all'altra e falsi il confronto.

    A) LA STESSA PAGINA, due volte con lo stesso seme
      OK  seme 20260803: due partite identiche  [123 campioni, 2-3]
      OK  seme 20260804: due partite identiche  [123 campioni, 0-5]
      OK  seme 20260805: due partite identiche  [121 campioni, 3-1]
    B) DUE PAGINE DIVERSE, stesso seme
      OK  ×3

Da qui discende tutta l'architettura, e discende **al contrario** di come si
costruisce di solito un gioco in rete:

> Sulla rete non si manda lo **stato** (ventidue uomini e un pallone, sessanta
> volte al secondo). Si mandano i **comandi**: qualche byte, e il resto lo
> ricalcola ogni telefono per conto suo.

Una partita intera di comandi sta in **pochi kB**. Un'immagine di anteprima ne
pesa cinquanta. Questo cambia tre cose in una volta:

1. **La sfida asincrona costa quasi nulla.** L'avversario non deve essere
   online; anzi, non deve nemmeno esistere nel momento in cui giochi.
2. **L'anti-imbroglio è gratis.** Chi manda un risultato manda anche il
   replay: chiunque può rigiocarlo e vedere se il punteggio dichiarato è
   quello vero. Non serve un server autorevole che simuli il calcio.
3. **Il tempo reale è possibile su una rete mobile.** Due telefoni allo stesso
   seme si scambiano ~4 byte per fotogramma a testa. Non è la banda il
   problema — è la latenza, e quella si copre con un ritardo di ingresso.

FC Mobile non fa niente di tutto questo: il suo motore nativo da 116 MB non è
deterministico e il suo VS Attack è, di fatto, un punteggio spedito al server.
Noi possiamo far **rivedere all'avversario la partita che ha subìto**, perché
ce l'abbiamo in mano in quattro kB. È il posto dove il nostro vincolo — un
canvas 2D in un file solo — diventa un vantaggio.

## Le tre modalità, in ordine di costruzione

### 1. Sfida asincrona — il cuore

«Attacca la squadra di X.» Si scarica il profilo pubblico di un avversario
(nome, colori, rosa, modulo, indole tattica), si gioca contro la sua rosa
mossa dalla CPU, il risultato entra in classifica. Chi difende riceve la
notifica quando riapre il gioco, e può **guardare** com'è andata.

Funziona con latenza infinita, cioè funziona **sempre**: in metropolitana, in
aereo, con una tacca. È anche l'unica modalità che si può giocare quando la
base dei giocatori è di dodici persone, e all'inizio lo sarà.

### 2. Replay verificabile

Ogni esito inviato porta con sé `{seme, taglia, rosa dei due, righe di
comando}`. Il server controlla subito quel che può controllare a costo zero
(coerenza dei conti, tetti di plausibilità, firma). La verifica pesante —
rigiocare davvero la partita — è **differita e a campione**, e la fa un
lavoratore periodico, non la richiesta dell'utente.

Se il replay non riproduce il punteggio dichiarato, i punti si tolgono. Il
giocatore onesto non se ne accorge mai; il disonesto scopre che la classifica
si ripulisce da sola.

> **RETTIFICA A EDIZIONI (22 settembre 2026, voce #133).** Le tre righe
> qui sopra sono state una promessa architetturale per mesi: il
> lavoratore periodico non esisteva, zero righe di codice. Oggi esiste
> **la capacità**, e non esiste ancora **il lavoratore**.
>
> La capacità è `window.__test.giudica(nastro, atteso, {seme, taglia})`
> dentro `CALCETTO-il-gioco.html`: rigioca il nastro sul motore vero —
> l'unico che c'è, perché un secondo motore scritto in Node divergerebbe
> per costruzione e toglierebbe punti a innocenti — e torna uno di cinque
> verdetti. **Uno solo può muovere punti**: `NON TORNA`. Gli altri
> quattro (`TORNA`, `INCOMPLETO`, `ALTRO MOTORE`, `NON FINISCE`) sono
> «non lo so», e chi li tratta come un'accusa fa il danno che questa
> pagina prometteva di evitare.
>
> Misurato: **14 partite oneste su 14 tornano** (taglie 5, 7 e 11), zero
> falsi `NON TORNA`. Il banco è `strumenti/_q-giudice.js`, in batteria.
>
> Quel che manca è il ciclo: pescare le righe con `verificata = 0`,
> aprire un browser headless **della misura di schermo che il nastro
> dichiara** (la riga di tipo 10 — senza, la rigiocata è un'altra
> partita: misurato, `800x360` contro `915x412` dà 0-3 dove il tabellone
> dice 3-4), chiamare `giudica`, e scrivere `verificata = -1` con
> `muovi_punti(-delta)` **solo** sui `NON TORNA`.
>
> Verbale completo: `MANUALE.md` §A registro, voce #133.

> **SEGUITO A EDIZIONI (22 settembre 2026, voce #134).** Il lavoratore
> continua a non esistere, e le righe qui sopra restano vere. Quel che è
> cambiato è che il suo verdetto adesso ha **un tubo fino all'occhio di
> chi gioca**: `GET /api/sfida` restituisce la colonna `verificata`
> (prima non usciva dal database — `grep verificata rete/api/` trovava
> una sola occorrenza, dentro a un commento), e la riga della lista delle
> sfide la scrive in una parola.
>
> **Cinque parole, e una sola accusa.** `DA VERIFICARE` (0) ·
> `VERIFICATA` (1) · `NON TORNA` (-1) le dice il server; `TORNA` e `NON
> VERIFICABILE` le dice il telefono di chi ha appena guardato il replay —
> perché quel replay **è** una rigiocata del nastro sul motore vero.
> `NON TORNA` resta l'unica parola che accusa: `INCOMPLETO`, `ALTRO
> MOTORE` e `NON FINISCE` diventano `NON VERIFICABILE` con la causa vera.
>
> **Il verdetto del telefono non torna indietro, e non c'è nessun
> endpoint che lo accetti.** Chi ha subìto la sfida ha un interesse
> diretto a che quel risultato cada: «il mio telefono dice che il tuo
> replay non torna» sarebbe una leva per togliere punti a un innocente.
> Il sigillo locale si vede solo dove il server dice ancora `0`.
>
> Finché il lavoratore non gira, **tutte le righe valgono 0 e la lista
> dice «DA VERIFICARE»**: è la verità, non un ripiego.
>
> Verbale completo: `MANUALE.md` §A registro, voce #134.

> **COMPIMENTO A EDIZIONI (22 settembre 2026, voce #138).** Il lavoratore
> **esiste**, e si chiama `strumenti/staffetta.js`. Le tre righe in cima a
> questa sezione — «se il replay non riproduce il punteggio dichiarato, i
> punti si tolgono» — smettono oggi di essere una promessa
> architetturale: c'è il processo che le esegue.
>
> **Il giro, in sei passi:** pesca le righe a `verificata = 0` (l'indice
> parziale c'era dal primo giorno), allarga il replay, legge la misura
> dalla riga di tipo 10, apre **un contesto di browser per misura**,
> chiama `window.__test.giudica`, e passa **la parola** — mai un numero —
> a `segna_verdetto`.
>
> **Non è un endpoint, e non lo diventerà.** Una funzione Vercel non ha un
> browser, e il giudice *è* il gioco. Si lancia a mano o da un CI, con
> `SUPABASE_URL` e `SUPABASE_SERVICE_KEY` **nell'ambiente**: la stessa
> porta delle cinque funzioni, non una sesta. Gli endpoint restano cinque,
> RLS resta acceso su tutte e sei le tabelle con zero policy.
>
> **La staffetta non traduce.** Manda la parola per tutti e cinque i
> verdetti, compresi i tre «non lo so», che costano una chiamata che non
> muove niente e comprano un cammino solo. La tavola resta del database,
> dove la voce #137 l'ha messa.
>
> Misurato (`strumenti/_q-staffetta.js`, **42 controlli su 42** in sette
> gruppi): sei sfide, quattro verdetti diversi, **due righe chiuse a 1,
> due a −1, due ancora aperte a 0**; il sospetto sale **solo**
> sull'attaccante dei due `NON TORNA` e di uno per riga; i suoi punti
> tornano indietro per intero (1038 → 1000). Una sfida vera giocata a
> **1024x460** dentro la corsa **TORNA**, e lo stesso nastro aperto di
> forza a 915x412 dice `INCOMPLETO / schermo-diverso`: **mai** `NON
> TORNA`. Ritmo: **34 righe al minuto**, due chiamate al database per
> riga più una per giro.
>
> **E c'è un taccuino locale**, che non è nel database e non ci deve
> stare: i tre «non lo so» lasciano la riga a `verificata = 0` per
> disegno, quindi tornerebbero nella pesca a ogni giro. Il taccuino
> ricorda quali sono già state guardate — e **può sparire senza che
> nessuno venga accusato due volte**: a proteggere dalle accuse doppie è
> la guardia `and verificata = 0` dentro `segna_verdetto`, non il
> quaderno.
>
> Verbale completo: `MANUALE.md` §A registro, voce #138.

### 3. Tempo reale in lockstep

Due telefoni, stesso seme, si scambiano i comandi via WebSocket (Supabase
Realtime). Ritardo di ingresso di 6 fotogrammi (100 ms): quel che premo adesso
succede fra 100 ms, per me e per l'avversario nello stesso istante. È la stessa
tecnica dei giochi di combattimento, e regge fin dove regge la connessione.

Quando la connessione salta, si degrada in modo pulito: il gioco continua
contro la CPU e il risultato si registra come sfida asincrona.

> **RETTIFICA A EDIZIONI (23 settembre 2026, voce #145).** Le quattro righe
> qui sopra contengono **tre affermazioni non misurate presentate come
> fatti**, e oggi sono state misurate tutte e tre. Il testo vecchio resta in
> piedi perché è il disegno da cui si è partiti; questa è la misura.
>
> **UNO: «Supabase Realtime» non esiste.** Non c'è nessun progetto Supabase.
> Nessun riferimento `<ref>.supabase.co` nel repo, nessuna variabile
> `SUPABASE_*` nell'ambiente, **zero variabili configurate** sul progetto
> Vercel `calcetto-rete` (verificato via API Vercel), e il deployment di
> produzione risponde **503 `DEPLOYMENT_PAUSED`** dall'edge `fra1`. Il
> trasporto di questa sezione descrive qualcosa che non è collegato a niente.
> Quel che regge, **LETTO dalla documentazione ufficiale e non misurato**: il
> protocollo Phoenix **si parla con un `WebSocket` nudo**, senza libreria —
> quindi «zero dipendenze» sopravvive. Non sopravvive «nessuna chiave
> nell'HTML»: l'`apikey` è obbligatoria nell'URL, e o finisce nel file — e
> rompe una regola scritta più sotto in questa stessa pagina — o serve un
> endpoint nuovo che conii un gettone a vita breve.
>
> **DUE: i «6 fotogrammi (100 ms)» erano un numero di progetto, mai
> misurato.** Oggi il numero c'è, e si chiama `D_rete` = andata al p95 + il
> buffer di dejitter + un tick. Misurato su relay WebSocket veri (3.000 e 800
> pacchetti, da una connessione **fissa** italiana): **23,3 e 30,6 tick**,
> cioè **387 e 510 ms**. Non 100. E la soglia dichiarata *prima* di misurare
> era 18 tick.
> **Ma il numero che decide non è nemmeno quello.** Un invio ogni 100 ms sono
> 600 pacchetti al minuto: per stare sotto uno stallo al minuto il ritardo
> deve coprire il **p99,83**, non il p95. Misurato: **30,4 e 38,4 tick**.
> E la coda **arriva a raffica** — il 78% e il 67% dei pacchetti lenti ne ha
> un altro lento subito prima, contro il 5% che l'indipendenza prevederebbe:
> è il blocco in testa alla fila di TCP, e toglie di mezzo la ridondanza, che
> era l'unica mitigazione a buon mercato.
> **Verdetto: il lockstep continuo a 60 Hz NON è ammesso.** Non perché la rete
> sia lenta — le mediane stanno benissimo, 67 ms a due gambe, e AGCOM dà 28 ms
> di RTT medio sul mobile italiano — ma perché **decide la coda**, e la coda
> non sta ferma nemmeno fra due corse della stessa sera (p99 da 335 a 493 ms
> in mezz'ora, stesso relay, stessa connessione).
>
> **TRE: «il gioco continua contro la CPU» non è realizzabile in lockstep.**
> Nell'istante in cui un lato sostituisce una CPU, le due simulazioni smettono
> di essere la stessa partita e non esiste più una verità condivisa. Il
> degrado onesto è un altro, e vale lo stesso: **la partita si ferma, i due
> nastri si troncano allo stesso tick, e chi è rimasto sottomette il suo
> nastro come sfida asincrona col punteggio a quel tick** — che è un nastro
> normale, e il giudice dentro il gioco lo verifica senza una riga nuova.
>
> **QUEL CHE RESTA IN PIEDI, ed è tanto.** Il P2P con solo STUN **passa da una
> rete fissa italiana** (mappatura NAT indipendente dall'endpoint, misurata
> con tre STUN interrogati dallo stesso socket); sul CGNAT mobile resta
> l'ignoto. E la misura indica **la terza via**: il danno dello stallo scala
> con la *frequenza* del canale, e un 1v1 fatto di **duelli** — pochi scambi,
> verbi già semantici nel nastro, orologio proprio — sta dentro i freni delle
> funzioni di oggi (30-60 richieste al minuto) senza un servizio nuovo, senza
> una chiave nuova e senza bolletta.
>
> Referto completo: `_analisi/MISURA-RETE-145.md` · dati grezzi
> `_analisi/misura-rete-145.json` · verbale `MANUALE.md` §A registro, voce #145.

## Le regole di costruzione, e sono vincoli del mandato

**Offline è il modo predefinito.** Senza rete il gioco non cambia di una
virgola: niente attese, niente schermate di errore, niente «connessione
richiesta». La rete è un *di più* che compare quando c'è.

**Nessuna chiave dentro l'HTML.** Il gioco è un file dentro un APK: chiunque
lo apre e lo legge. Quindi il client parla **solo** con le funzioni Vercel, e
la chiave di servizio di Supabase sta lì, sul server, e da lì non esce mai.

**Identità anonima, zero dati personali.** Nessuna email, nessun nome vero,
nessun accesso Google. Al primo avvio il gioco genera un identificatore e un
segreto, li tiene sul telefono, e il server conosce soltanto quelli. Così
restano veri i due numeri che ci distinguono: **zero permessi Android** (FC
Mobile ne chiede 19) e nessun obbligo di conto.

**Niente di EA.** Nomi, squadre, volti, suoni e testi sono nostri o di dominio
pubblico. Vale per il gioco e vale per il server.

## La forma tecnica

    telefono ──HTTPS──▶ Vercel (funzioni)  ──chiave di servizio──▶ Supabase
       │                                                            (Postgres)
       └──WebSocket (solo tempo reale) ──────────▶ Supabase Realtime

Perché due pezzi e non uno:

- **Supabase da solo** obbligherebbe a mettere la chiave anonima nel gioco e a
  difendere tutto con regole RLS. Si può fare, ma un errore in una regola è
  una porta aperta, e le regole non si collaudano con un banco come il resto
  del progetto.
- **Vercel da solo** non ha un database.

Con le funzioni davanti, ogni scrittura passa da codice che possiamo leggere,
provare e misurare. La superficie esposta è di cinque endpoint, non di dodici
tabelle.

> **RETTIFICA A EDIZIONI (24 settembre 2026, voce #149).** Gli endpoint sono
> **SEI** dal #146: la cassetta del dischetto (`/api/dischetto`) è il sesto, e
> questa pagina non l'aveva mai nominata. `_q-sospetto` D8 — la guardia che
> congela la superficie — era già stata rettificata a sei il 24 settembre; qui
> no, e per un giorno le due fonti si sono contraddette. Il testo qui sopra
> resta com'era scritto: dice il vero di quando è stato scritto.

## I sei endpoint

| endpoint | fa |
|---|---|
| `POST /api/entra` | crea o riprende l'identità anonima, restituisce un gettone |
| `PUT /api/squadra` | pubblica il profilo della tua squadra (nome, colori, rosa, forza) |
| `GET /api/avversario` | ti dà una squadra vicina di forza da attaccare |
| `POST /api/sfida` | manda esito + replay, il server valida e assegna i punti |
| `GET /api/classifica` | i primi cento, più la tua posizione |
| `POST`/`GET` **`/api/dischetto`** | la **cassetta** della sfida dal dischetto (voce #146): imbuca un messaggio del protocollo e ritira quelli nuovi. Scrittura sola una volta per `(stanza, tiro, lato, tipo)` — lo fa il vincolo di unicità del database, non un `if` —, freno `dis:<id>` a 60 al minuto come gli altri, nessun privilegio |

Ognuno è un file in `api/`, con in testa il commento che dice perché esiste e
che cosa rifiuta.

## Che cosa NON facciamo, e perché

- **Niente conto Google/Apple.** Aggiunge un permesso, un fornitore e una
  schermata di accesso per un gioco che si deve poter aprire e giocare in tre
  secondi. Il trasferimento fra telefoni si risolve con un codice di dodici
  caratteri da copiare, che è più semplice e non chiede niente a nessuno.
- **Niente chat.** Una chat in un gioco per telefono con una base piccola è
  un problema di moderazione che non possiamo permetterci, e nessuno la
  userebbe. Gli emoji predefiniti durante la sfida bastano.
- **Niente server autorevole che simuli il calcio.** Costerebbe come far
  girare il gioco N volte, e il replay verificabile dà lo stesso risultato
  a costo quasi zero.
