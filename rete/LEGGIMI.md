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

### 3. Tempo reale in lockstep

Due telefoni, stesso seme, si scambiano i comandi via WebSocket (Supabase
Realtime). Ritardo di ingresso di 6 fotogrammi (100 ms): quel che premo adesso
succede fra 100 ms, per me e per l'avversario nello stesso istante. È la stessa
tecnica dei giochi di combattimento, e regge fin dove regge la connessione.

Quando la connessione salta, si degrada in modo pulito: il gioco continua
contro la CPU e il risultato si registra come sfida asincrona.

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

## I cinque endpoint

| endpoint | fa |
|---|---|
| `POST /api/entra` | crea o riprende l'identità anonima, restituisce un gettone |
| `PUT /api/squadra` | pubblica il profilo della tua squadra (nome, colori, rosa, forza) |
| `GET /api/avversario` | ti dà una squadra vicina di forza da attaccare |
| `POST /api/sfida` | manda esito + replay, il server valida e assegna i punti |
| `GET /api/classifica` | i primi cento, più la tua posizione |

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
