## VOTO: 6 / 10

Sopra la media del mercato sul **livello del passaggio**, sotto il migliore sul **tetto**. Il motivo è uno solo e lo dico subito: **questo schema non ha accordi.** Ventotto verbi, tutti mutuamente esclusivi nel tempo. Sul pad il mio tetto non viene dal numero di verbi, viene dal fatto che R2+LS+L1+B convivono nello stesso istante: contengo, sprinto, mando il secondo uomo e provo il contrasto **insieme**. Qui il §7.4 lo dichiara impossibile ("il pollice destro fa una cosa per volta") e il modificatore unico — la corsa della levetta — è già occupato dallo sprint. Il conteggio "28 contro 31 di EA FC Mobile" misura il vocabolario, non l'espressività: un vocabolario grande giocato una parola alla volta resta una frase corta.

E manca l'intero **strato del dribbling**. Attaccare qui è: corri, passa, tira. Nessuna protezione palla, nessun primo controllo comandato, nessuna finta, nessun knock-on. Nel FC il 10% forte si stacca lì. Il §7.1 lo ammette, ma ammetterlo non alza il soffitto.

---

## LE TRE COSE MIGLIORI

**1. Il rilascio inerte (§3, riga 8948).** È la correzione più grossa del documento ed è l'unica misurata su un difetto vero: 34 rilasci su 50 emettono un calcio (M2). Oggi alzare il pollice sinistro **passa la palla**. Sul pad sarebbe come se lasciare LS facesse partire un X: nessun giocatore competitivo sopravvive a un comando che agisce quando smetti di comandare. E il guadagno secondario è ancora migliore: un flick perso oggi degrada in passaggio (possesso perso), domani degrada in niente (riprovo). Questa riga da sola vale mezzo voto.

**2. Il bersaglio manuale con anteprima + fascia di guardia (§5).** `punteggio(q) = base + K·dot·|levetta|` è la formula giusta: la levetta **inclina**, non sbarra. È l'unico modo di dare mira manuale senza rompere il gioco di chi non la usa, ed è esattamente ciò che separa un gioco di calcio con un tetto da uno senza. Il pezzo davvero forte è il **rifiuto visibile**: se l'anello non si sposta, ho visto che il gioco difende la sua scelta. Oggi `eseguiFiltrante` con il 71% di coni vuoti **esce senza calciare e senza dirlo** — un comando che non fa niente in silenzio è il peggior tradimento possibile, e questo lo chiude.

**3. La chiamata in profondità.** Tenere il piccolo per mandare un compagno in corsa è il verbo che manca a tutti i giochi di calcio per telefono e che sul pad uso venti volte a partita (L1+triangolo). Averlo su una tenuta, con il compagno che parte davvero prima che la palla parta, è il singolo pezzo di questo schema con il tetto più alto: apre il tempo del passaggio, non solo la direzione.

---

## LE TRE COSE CHE SI ROMPONO

**1. Il cambio uomo diventa un raddoppio, e nessun cancello lo guarda.**
Il quadrante PICCOLO-senza-palla ha tap = cambio, tenuta ≥0,15 s = raddoppio. M4 dice che a 6× di CPU **23 tap su 24 si leggono come tenute**. Il cancello C3-A protegge solo GRANDE-senza-palla e PICCOLO-con-palla: **questo quadrante non è gated da nessuna parte.**
Caso concreto: contropiede 3 contro 2, il portatore avversario entra in fascia, io picchietto il piccolo per passare al centrale che copre. Il telefono è in affanno (è in affanno *proprio adesso*, perché ci sono dieci uomini in corsa e la folla che reagisce). Il cambio non avviene — resto sull'uomo sbagliato, lontano — **e in più il mio secondo centrale abbandona la posizione e va in pressing**. Un tocco, due danni, sull'azione che decide la partita. Il cambio uomo è l'ingresso che premo più spesso di qualunque altro: metterlo sullo stesso disco di un verbo a tenuta, nel contesto in cui il telefono soffre di più, è la scelta più fragile del progetto.

**2. Il passaggio d'appoggio diventa un filtrante — la Seconda Legge è un travestimento.**
"Non si classifica il dito, si legge il mondo": ma lo stato del mondo che si legge ("il compagno è partito?") è **una funzione pura della stessa soglia di 0,15 s**. La soglia non è stata eliminata, è stata spostata nelle gambe del compagno. Se il touchend arriva a 271 ms, `p.charge` ha superato 0,15 s, il compagno è partito, e il rilascio è un filtrante.
Caso concreto: sono in uscita dalla mia area, pressato, voglio l'appoggio corto al terzino a tre metri. Tocco e mollo. Il telefono è a 6× e la palla parte a 420-640 rasoterra **dentro lo spazio**, dove non c'è nessuno, alle spalle del terzino. Palla persa nella mia metà campo. La difesa del documento ("l'evento in ritardo dà al compagno più tempo per partire, la palla va dentro una corsa che esiste davvero") è una razionalizzazione: la corsa esiste, ma **io non l'ho chiamata**. Il cancello C3-B (`stats.filtranti` non devono crescere sui tap a 6×) è scritto giusto, ed è precisamente il cancello che questo progetto **fallirà**, perché nel progetto non c'è nessun meccanismo che lo impedisca. R4 chiede "almeno un fotogramma dipinto" — a 6× un fotogramma dura più di 100 ms: non è una protezione, è un arrotondamento.

**3. La corsa della levetta è prenotata tre volte, e le tre prenotazioni si scontrano nel terzo offensivo.**
Dal codice: `STICK_FULL=46` (riga 8642), `STICK_SPRINT=66` (riga 8664), `MAXR=70` (riga 8851). Quindi "levetta a fondo corsa" **è** sprint. Conseguenze che le regole R1–R10 non risolvono (R6 copre tiro/passaggio, scivolata/contenimento, cross/filtrante, chiamata/appoggio — non queste):
- **pallonetto** = tieni + sprint al rilascio. **Tiro di precisione** = tieni + levetta a fondo corsa verso un palo. Al bordo dell'area, levetta piena sul secondo palo: sono **entrambi veri**. Il tiro che uso di più in tutto FC (finesse dal vertice) è indistinguibile dal pallonetto.
- Peggio: **cross mirato** = tenuta + sprint in metà offensiva, mentre **mirare il bersaglio** = levetta durante la tenuta. Quindi nella metà offensiva posso inclinare il bersaglio solo fra 12 e 66 px di corsa; oltre, la mia mira diventa un cross alto. Caso concreto: sono sul fondo, tengo PASSA per scegliere l'accorrente sul primo palo, spingo la levetta a fondo verso di lui per ribaltare la scelta automatica → il gioco legge sprint → **cross morbido invece del taglio dietro**. La funzione di punta di questo schema muore esattamente nei venti metri in cui serve.

---

## COSA MI MANCA CHE USO OGNI PARTITA

- **Il contrasto in piedi.** Oggi il tocco su CONTRASTA chiama `doSlide` diretto (riga 8827 → 9485): l'unica forma di contrasto del gioco è la **scivolata**. Nello schema nuovo il tap resta scivolata. Sul pad il rapporto fra contrasto in piedi e scivolata è 20 a 1. Qui: telefono veloce = tap è il gesto più falloso del gioco; telefono lento = il tap diventa contenimento e **non posso contrastare affatto**. Rotto ai due estremi.
- **La protezione di palla (L2).** Spalle alla porta, avversario addosso, voglio schermare e girarmi. Verbo assente, e non c'è pollice libero per averlo.
- **Il jockey vero.** `p.contieni` (riga 11731) scrive `aiTX/aiTY`: è una **posizione-obiettivo**, non una postura. Se lo do all'umano, o mi toglie la levetta o non fa niente. R2 sul pad non mi porta via lo stick mai: mi cambia velocità e faccia, io continuo a decidere dove sto. Con questo contenimento non posso accompagnare l'ala verso la linea né mettere il corpo sulla linea di passaggio.
- **Il cambio direzionale senza mollare il movimento.** La bussola è a sinistra, dove vive il pollice che corre: per usarla devo alzarlo. E se il tap sbava di 13 px nasce una levetta, cioè **muovo l'uomo sbagliato** invece di cambiarlo. Sotto VW 640 e in 2 giocatori sparisce.
- **Il flick vive ancora su `performance.now()`** (riga 8878) mentre tutto il resto passa all'orologio della simulazione. Due orologi che decidono verbi che si escludono a vicenda (R8: il flick annulla la tenuta) è un debito che tornerà.

---

## LA SINGOLA MODIFICA CHE ALZEREBBE DI PIÙ IL VOTO

**Sostituire la DURATA con il TRASCINAMENTO sul disco stesso.** Non "tieni 0,15→1,20 s": **premi e trascina**. Lunghezza del trascinamento = quanto (profondità della corsa, potenza); direzione del trascinamento dal centro del disco = dove (bersaglio, lato del contenimento, angolo del cambio).

Perché è questa e non un'altra:

1. **Uccide l'orologio per davvero**, che è quello che la Seconda Legge dichiara di voler fare e non fa. Un percorso è una misura spaziale: il browser può fondere dieci `touchmove`, ma quello che consegna porta comunque la **posizione**. Un tap non ha percorso a 1× e non ce l'ha a 6×. Le rotture 1 e 2 spariscono entrambe, non vengono mitigate.
2. **Libera la levetta.** Se il "dove" sta sul pollice destro, la corsa della levetta torna a significare una cosa sola — sprint — e la collisione 3 non esiste più. Il cross diventa un trascinamento lungo, il passaggio corto uno corto, il tiro di precisione un trascinamento verso il palo: nessuna casella condivisa.
3. **Restituisce l'accordo, che è il tetto.** Pollice sinistro: corro e sprinto. Pollice destro: miro e dosò. Nello stesso istante. È l'unico modo di alzare il soffitto senza aggiungere pulsanti, e il documento giura di non aggiungerne.
4. **L'annullamento diventa naturale e non una trappola**: si torna dentro il disco. I 56 px "a scatto" che oggi spengono il comando in silenzio dopo una tenuta da 1,2 secondi con il pollice che striscia — con il rilascio ormai inerte — sono il modo più veloce per far sentire un giocatore tradito. Trascinare *è* il gesto, quindi lo scivolamento non è più un errore fatale.
5. **Si impara in un fotogramma**: l'anteprima segue il dito. È manipolazione diretta piena, non un'anteprima che appare e poi si esegue a tempo.

Costo: cade la simmetria "tocco = atto, tenuta = stato" (la terza frase). Vale la pena. Quella frase è elegante, ma è appesa a una soglia che il documento stesso ha misurato essere illeggibile su un telefono in affanno, e le due rotture peggiori di questo schema nascono lì.

**Con quella modifica, più il contrasto in piedi sul tap del GRANDE-senza-palla e la scivolata spostata sul trascinamento, questo schema arriva a 7,5.** L'8 richiede lo strato del dribbling, che questo pollice non ha spazio per ospitare.