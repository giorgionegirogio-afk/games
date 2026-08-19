# GIUDIZIO — schema comandi CALCETTO, dalla sedia di chi non ha mai giocato

## VOTO: 5,5 / 10

Sopra il 5 perché il **pavimento dichiarato** (§3) mi lascia giocare la prima partita da 90 secondi senza sapere niente, e perché il rilascio inerte toglie l'unico difetto che oggi mi farebbe chiudere il gioco al secondo minuto. Sotto il 6 perché tutto quello che sta **sopra** il pavimento — cioè la metà nuova del vocabolario, la parte per cui esiste il documento — poggia su un'anteprima che nel file di questo gioco è già stata dichiarata illeggibile, e su un ingresso (la bussola) che vive esattamente dove appoggio il pollice sinistro. Lontanissimo dall'8: il miglior gioco di calcio per telefono non mi punisce mai per aver toccato lo schermo dove capita.

Contesto che il documento non usa mai e che cambia tutto: `MATCH_SEC = 90` (riga 2944 di `C:\Users\Utenteee\Desktop\GitHub\games\CALCETTO-il-gioco.html`). **I miei primi cinque minuti sono tre partite più i menu.** Un vocabolario da 28 verbi va giudicato contro tre partite, non contro una stagione.

---

## LE TRE COSE MIGLIORI

**1. Il rilascio della levetta smette di passare la palla (§3, MOVIMENTO, riga 8948).**
È l'unica riga del documento che risolve un motivo di chiusura vero, ed è misurata: 34 rilasci su 50 emettono un calcio (M2). Tradotto per me: oggi ogni volta che alzo il pollice — cioè ogni volta che smetto di correre, che è la cosa più naturale che faccio con un dito su un vetro — il gioco passa la palla a qualcuno. Nei primi cinque minuti questo mi succederebbe **decine di volte**, e non lo collegherei mai al fatto che ho alzato il dito: penserei che il gioco passa da solo. Un difetto invisibile e continuo è peggio di uno grosso e raro. Toglierlo vale da solo mezzo punto.

**2. Il pavimento dichiarato (§3, in fondo).**
"Un giocatore che non tiene mai un disco e non tocca mai la bussola ha comunque un gioco completo." Questa frase è la cosa più matura del progetto e quasi nessuno la scrive. Significa che la mia prima partita è giocabile a conoscenza zero: corro, sprinto, tocco due dischi, segno. **Non c'è un muro all'inizio**, e in un gioco da 90 secondi il muro all'inizio è la morte. È anche la ragione per cui il voto non scende sotto il 5 nonostante i tre difetti sotto.

**3. La seconda legge: il verbo si legge dal mondo, non dall'orologio degli eventi (§1, imposta da M4).**
Non me ne accorgerei mai coscientemente, ed è il punto. M4 dice che a 6× di CPU rallentata 23 tap su 24 diventano tenute: su un telefono in affanno un gioco che classifica il dito con una soglia mi darebbe scivolate che non ho chiesto proprio quando la scena è piena — cioè sotto porta, cioè nei momenti che ricordo. La scelta di ancorare tutto all'accumulatore di `step()` (come già fa `p.charge+=dt`, riga 9920) è quella giusta e, cosa rara, è **derivata da una misura invece che da un gusto**.
*Caveat sulla riga di stato (§4.2):* testo da 9 px **dentro** il disco, che compare **solo mentre tengo**. L'unico istante in cui è acceso è l'unico istante in cui il mio pollice lo copre fisicamente. Quel maestro non insegna a nessuno.

---

## LE TRE COSE CHE SI ROMPONO

### Rottura 1 — la bussola è un tasto invisibile piazzato nella casa del pollice sinistro

Il documento (§2, zona 4) dà alla bussola un rettangolo fisso `10–102 × 355–402` e la regola "tap <200 ms e <12 px → cambio ad angolo". Il file dice un'altra cosa (`drawMinimappa`, righe ~24925–24995):

- la bussola **si sposta** fotogramma per fotogramma fra `myAlto` e `myBasso` (scivolo esponenziale, semivita 0,12 s);
- **sfuma** quando il pallone le arriva addosso ("la palla vince sempre");
- **scende da sola** quando il pollice sinistro occupa l'ancoraggio alto — il codice riserva già `lvX0/lvX1` centrati su 96, `lvY0/lvY1` attorno a `VH-140`.

M1 ha fotografato **un** fotogramma e il §2 lo ha promosso a geometria. Ma il colpo vero è la combinazione con R9 ("la sfumatura cambia l'inchiostro, mai il collaudo del tocco"):

> **Caso concreto, minuto 1.** Non so ancora che la levetta si trascina — nessuno lo sa al primo tocco, e il tutorial dice "trascina il dito" al passo 1 di 4 mentre io sto già guardando il pallone. Il pallone rotola in basso a sinistra. Io **picchietto** lì per andarci: 150 ms, 4 px. La bussola in quell'istante è **sfumata a zero perché il pallone ci è sopra**, quindi sullo schermo non c'è niente. Il gioco legge un tap sulla bussola e **mi cambia uomo**: perdo il controllo del giocatore che stavo guidando, la telecamera fa una cosa che non ho chiesto, e sullo schermo non c'è stato nulla da toccare.

Lo rifarei tre o quattro volte prima di smettere di toccare l'angolo in basso a sinistra — cioè prima di smettere di usare metà della superficie di gioco. È l'unico posto dell'intero canvas dove un tap fa qualcosa, e coincide con il posto dove il pollice sta appoggiato. Il documento se ne accorge a metà (§6, "mani grandi": il pollice copre tutta la bussola) e ne trae la conclusione sbagliata — cambia *cosa* seleziona invece di chiedersi se debba essere un ingresso.

**Costo per toglierla: zero verbi.** Il documento stesso dichiara che la bussola non è un ingresso sotto VW 640 (§6) né in 2 giocatori (§6): è già un verbo che metà delle configurazioni non ha.

### Rottura 2 — l'anteprima è un quarto anello ai piedi, e questo file ha già scritto perché non funziona

Tutta la scoperta del progetto poggia su §4.3: "chi preme il piccolo e vede un anello accendersi ai piedi di un compagno ha imparato la tenuta in un fotogramma". Ai piedi delle figure di questo gioco però ci sono **già tre segni**, e le righe che li governano dicono esattamente il contrario:

- riga 23856 `anelloComandato(p)` — l'anello ambra del giocatore che comando;
- riga 23853 `anelloPortatoreTratto(p)` — l'anello tratteggiato del portatore;
- righe 24209–24216, la pozza dorata, con il commento del file: *"un filo d'oro da 2 px ai piedi era, alla distanza vera della camera, invisibile"* e *"non è un altro anello che litiga con quello del controllo"*;
- riga 23851, la regola già imparata: *"due anelli concentrici sullo stesso paio di scarpe ne fanno zero"*.

Poi §7.9 impone che ogni anteprima nuova stia **sotto 0,15 di alfa**. Un anello sotto 0,15 di alfa, su erba, attorno a una figura da 26 px, è precisamente il filo d'oro da 2 px che questo file ha già buttato via perché non si vedeva.

> **Caso concreto, minuto 3.** Prima volta che tengo il disco piccolo apposta: sono in area avversaria, 5 contro 5, tre compagni entro sessanta pixel di schermo. Ai miei piedi c'è la pozza dorata + l'anello ambra; su un compagno si accende l'anello dell'anteprima. Vedo **quattro paia di scarpe illuminate** in un'area di gioco alta 303 px e non so quale sia il bersaglio, quale sia il mio uomo e quale sia solo il segno del portatore. Rilascio alla cieca. La lezione che dovevo imparare "in un fotogramma" non è arrivata, e non arriverà nemmeno la seconda volta.

L'anteprima fallisce **esattamente nel momento affollato** in cui tenere il disco varrebbe la pena. Nel momento vuoto — un compagno solo in mezzo al campo — funziona benissimo e non mi serve.

### Rottura 3 — lo stesso gesto produce due verbi, e la differenza la decide qualcosa che non ho fatto io

§3, disco piccolo: rilascio **prima** che il compagno parta → appoggio ai piedi (320–520); rilascio **dopo** → filtrante rasoterra 420–640 con lead 0,55. La soglia di partenza è 0,15 s di tenuta. Niente nel §3 e niente nel §4 dice che l'anteprima **distingue i due verbi**: dipinge *chi* e la *linea*, non *cosa*.

> **Caso concreto, minuto 4.** Faccio due volte lo stesso gesto, con lo stesso ritmo, sul disco piccolo. La prima volta la palla rotola ai piedi del compagno: ottimo, ho capito, "il disco piccolo passa". La seconda volta sono 40 ms più lungo (o il telefono ha singhiozzato e l'accumulatore è andato avanti da solo): il compagno scatta, la palla parte a 640 nello spazio davanti a lui, e il portiere avversario la raccoglie. Dalla mia sedia ho fatto **la stessa cosa** e ho avuto un passaggio e una palla persa. Concludo che il gioco è un dado.

La difesa del documento — *"il telefono lento non produce il verbo sbagliato: produce il verbo giusto per il mondo che il giocatore sta guardando"* — è una frase da progettista. Io non ho chiesto il verbo giusto per il mondo: ho chiesto **il passaggio che avevo appena fatto riuscire**.

E si aggancia a un secondo conflitto mai risolto nel documento: durante la tenuta la levetta ha **due mestieri contemporanei**. `eseguiFiltrante` (riga 9146) prende la direzione da `humanMove(t)`, cioè dalla levetta che **corre**; §5 la usa anche come mira con peso `|levetta|`.

> **Caso concreto, stesso minuto.** Sto sprintando a destra verso la porta e voglio scaricare all'indietro-sinistra. Per mirare devo spingere la levetta a sinistra — cioè **devo girarmi e smettere di attaccare** per chiedere il passaggio. E la formula di §5 premia `|levetta|`: più preciso voglio essere, più devo correre nella direzione sbagliata.

Aggiungo, senza farne una quarta rottura ma è la stessa famiglia: **il silenzio è diventato il modo di fallire predefinito dello schema.** Rilascio inerte (§3), annullamento a 56 px "a scatto" (§2), R2 che spegne il disco se perdo la palla a metà tenuta, R5 che ricade sul bersaglio base. Sono quattro strade diverse verso "non è successo niente". Il documento apre attaccando proprio questo — *"un comando che non fa niente in silenzio è peggio di uno che indovina male"* — e poi ne costruisce quattro nuovi. In 5 contro 5 il possesso cambia in continuazione: premo PASSA, mi rubano palla nello stesso istante, rilascio, **niente**. Dalla mia sedia: il tasto del passaggio ogni tanto non funziona.

---

## LA SINGOLA MODIFICA CHE ALZEREBBE DI PIÙ IL VOTO

**Sostituire l'anello ai piedi con UNA SOLA linea di passaggio, disegnata dal pallone al bersaglio, la cui FORMA è il verbo.**

- corta e piena, che finisce **sulle scarpe** del compagno → appoggio;
- nell'istante in cui il compagno parte, la stessa linea **si allunga in una freccia nello spazio davanti a lui** → filtrante. Il cambio di forma è il fotogramma in cui imparo la tenuta, e mi dice *quando* è cambiato il verbo, non solo *chi* riceve;
- la levetta la fa ruotare; se la levetta punta e la linea **non si muove**, ho visto il rifiuto di §5 esattamente come il documento voleva.

Perché è questa e non un'altra:

1. **Risolve la Rottura 3 senza aggiungere ingressi.** Il verbo diventa visibile prima del rilascio, quindi due tenute identiche non producono più due risultati inspiegabili: producono due disegni diversi che ho visto prima di decidere.
2. **Risolve la Rottura 2.** Non è un quarto segno ai piedi: è un oggetto **lungo**, leggibile a 26 px, che non litiga con la pozza dorata, con l'anello ambra e con l'anello tratteggiato. E ha un secondo effetto gratuito: **parte dal mio pallone**, quindi risponde anche alla domanda numero uno di chi non ha mai giocato — *quale di questi undici sono io*.
3. **Rende superflua la riga di stato da 9 px sotto il pollice** (§4.2), che è teaching che non arriva.
4. Sopravvive al vincolo di §7.9: una linea è dichiarabile in `zoneInterfaccia` come tracciato, e non è una pastiglia stesa sull'erba che gli strumenti leggono come ombra.
5. Non tocca la simulazione: sta nel primo dei tre gruppi che §9 vuole introdurre per primi.

Con quella modifica, più la bussola cancellata come ingresso (una riga, zero verbi persi, un motivo di chiusura in meno al minuto 1), questo schema arriva a **7**. All'8 non ci arriva finché §10.10 resta vera: nessuna persona ha giocato niente di tutto questo, e i tre cancelli di §8 — che sono onesti e ben costruiti — non ne provano uno solo dei difetti scritti qui sopra, perché misurano tutti la simulazione e nessuno misura l'occhio.