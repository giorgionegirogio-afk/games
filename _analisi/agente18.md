## VOTO: 5,5 / 10

Giocabile, e sopra il commerciale nello *strato base* (i quattro verbi fondamentali più lo stato a riposo). Ma dei 39 verbi, i ~30 costruiti sui due canali nuovi poggiano su una geometria che il pollice non può consegnare, e uno di essi cancella in silenzio il riflesso più allenato del gioco. Non si chiude dopo due partite; si smette di usare i tre quarti del vocabolario dopo due partite.

**Cosa non ho verificato**: non ho eseguito il gioco né misurato un pollice. Ho letto `C:\Users\Utenteee\Desktop\GitHub\games\CALCETTO-il-gioco.html` e rifatto l'aritmetica sulle sue costanti. La deriva al distacco (1-3 mm) e il tempo di reazione tattile (150-250 ms) vengono dalla letteratura, non da una misura di questo progetto. Il σ=20 px che uso per la stima dei mancati bersagli è una mia assunzione dichiarata.

---

## LE TRE COSE MIGLIORI

**1. Lo stato a zero dita, e la D1 che lo rende possibile.** È l'unica decisione del documento che fa sopravvivere lo schema all'autobus. Verificato a 8948-8949: oggi il rilascio della levetta con la palla chiama `doPass`, quindi una notifica, una ripresa della presa o una frenata che ti stacca il pollice regalano il possesso a chi sceglie `smarcato()`. La D1 non attenua quella classe di errori: la elimina, e la sostituisce con uno scudo. Nessuno dei riferimenti commerciali premia il pollice alzato; qui alzarlo diventa la cosa più sicura. Questo *è* sopra l'8.

**2. L'etichetta viva più l'annullamento tornando al centro.** Converte un compito di richiamo in uno di riconoscimento a costo zero di pixel, e — più importante — rende la pressione una *frase reversibile*: vedi il verbo e lo disdici prima che il dito lasci il vetro. È la risposta corretta alle zone invisibili di FC Mobile. **Con una correzione**: la tesi «si legge dove l'occhio è già» è falsa e il file lo dimostra. L'anello del timing è disegnato a `(p.x, p.y)` con `R = P_R+8` (24448-24498), cioè attorno al giocatore a metà schermo. Durante un tiro l'occhio è lì, l'etichetta è 300-500 px più in là nell'angolo, sotto il pollice che la copre. L'etichetta serve a imparare e serve al passaggio; al tiro non serve.

**3. La precedenza ordinata per costo dell'errore.** §4.1 (piccolo prima di grande) e §4.2 regola 3 (vince il verbo disfabile). Con 4,76 px di varco fra le prese — **0,79 mm** — l'ambiguità è garantita, non probabile; ordinare la risoluzione per recuperabilità invece che per z-order è l'unica cosa che rende un'ambiguità garantita sopportabile. E il passo «compatto» dichiara il varco negativo invece di nasconderlo.

---

## LE TRE COSE CHE SI ROMPONO

### 1. Leggere `dx,dy` al punto di rilascio inietta una polarizzazione sistematica in ogni trascinamento — e M1 non può vederla.

Il §1.3 è la parte di cui il documento va più fiero. Ha ragione sulla fusione dei `touchmove` e torto sul pollice. Quando un pollice si stacca, l'ellisse di contatto non si restringe simmetricamente: collassa verso la punta, e il centroide riportato si sposta in direzione distale — per un pollice destro appoggiato all'angolo basso-destra in orizzontale, **in alto e a sinistra, di 1-3 mm** (6-18 px CSS ai 6 px/mm del documento stesso). Contro `DRAG_DEAD=14` e `DRAG_FULL=44` è il **20-60% dell'intera corsa analogica, in una direzione fissa, iniettato nell'istante della decisione.**

Caso concreto: tap pulito sul disco piccolo, verbo 1. Con il telefono inclinato (in piedi, una mano al corrimano) la deriva è 18 px in alto-sinistra: `dx = −13`, `dy = −12`, `d = 17,7 > 14`; con `g = +1` risulta `dx*g = −13 < −|dy| = −12` → **cono INDIETRO**, verbo 3, scarico all'indietro, quando avevi chiesto il passaggio assistito. Sul disco grande la stessa deriva rende `ay` sempre negativo: **ogni tiro mira alto. Ogni giocatore, ogni volta, nella stessa direzione.**

E M1 è cieca per costruzione. Il suo modello di rumore ha durata, angolo ±18°, ampiezza ±10 px, fusione dei move e posizione della pressione «±9 px **dentro la presa**». Non c'è un termine di distacco, e una perturbazione vincolata dentro la presa **non può generare un bersaglio mancato**. Il rumore modellato è quello che l'autore già conosceva, non quello che la sua decisione nuova crea. Un M1 verde non direbbe niente sull'unica cosa che il §1.3 cambia.

Corollario che il documento non conta: la D1 trasforma ogni sfioro sul disco piccolo da «parte un passaggio» a **silenzio**. L'anello morto (r 40→48) vale 2.212 px², il **44% dell'area del bersaglio stesso**. Con un σ di puntamento a occhi non fissi di 20 px, ~8% delle pressioni cadono nell'anello morto e un altro ~6% oltre (dove nascono una levetta il cui rilascio, tolto il passaggio, non fa più nulla). Circa **una pressione su sette non produce niente**, e prima ne produceva una sbagliata ma reversibile.

### 2. Il gesto di mira copre il bersaglio della mira, e più miri più copri.

Il file l'ha già misurato, a 8721-8756: «nei fermi immagine in cui la porta è in quadro la sua bocca finisce fra y 296 e y 302», e i dischi sono stati messi a partire da y 310/312, «dieci pixel sotto il caso peggiore misurato». Quel margine è stato misurato contro **il disco disegnato (r 40), non contro un dito.** Il polpastrello del documento è 150 px: centrato su (851, 352) arriva a **y = 277**, cioè **19-25 px dentro la bocca, a riposo, prima di qualunque trascinamento.**

Ora il §13 fa del trascinamento verticale la mira. 44 px in su portano il bordo del polpastrello a **y = 233**: 63-69 px dentro una bocca che lo stesso commento misura alta 158-172 px. **Mirare all'angolo alto mette il 40% della porta sotto il tuo pollice.** Mirare in basso trascina il pollice a 16 px dal bordo inferiore, la direzione più difficile che esista in una presa orizzontale. E non alterna mai: verificato a 8679 e 11465, `opGoalX = p.team===0 ? FW : 0` — la squadra 0 attacca a destra per tutta la partita, dallo stesso lato dei dischi.

M2 non lo prenderà, perché **il denominatore è sbagliato**: «bocca intersecata in < 5% dei fotogrammi» è su tutti i fotogrammi. Il denominatore giusto è «fotogrammi in cui un dito è sul disco grande e la porta è in quadro», dove la misura già presente nel file dice che la risposta è vicina al 100%. Un cancello verde accanto a un'esperienza rotta al 100%: è la trappola numero quattro con un cappello nuovo.

### 3. I due canali nuovi sono esattamente quelli che l'autobus cancella — e un verbo è *definito* come la loro assenza.

**Durata.** `DISC_HOLD2 − DISC_HOLD = 250 ms`. Il §3.2 promette di insegnare la soglia con `buzz(8)` a 0,30 e dichiara che «da qui in poi il disco si suona a occhi chiusi». Il tempo di reazione tattile per sollevare un pollice carico è 150-250 ms: **la fascia è più stretta del tempo di reazione al segnale che ne marca l'inizio.** Chi usa la vibrazione come segnale di rilascio — cioè chi fa quello che il documento gli chiede — finisce nella fascia successiva circa una volta su due. Peggio: la tabella del §3.2 non esenta il disco grande con la palla, dove la durata «è già presa dall'anello». Verificato a 6500, `buzz` è incondizionato. Quindi durante una carica il giocatore sente uno scatto fantasma a 0,55 s, **dentro la finestra di rilascio SHOT_MIN 0,50 – SHOT_MAX 0,80**, nell'unica meccanica di abilità che il gioco possiede.

**Trascinamento.** `DRAG_DEAD = 14 px = 2,3 mm`. Una frenata d'autobus a 0,2 g sposta il telefono rispetto a una mano puntellata di più di così, in un solo evento. In piedi, ogni tenuta diventa un trascinamento, e il cono è deciso dal segno di `dx`, cioè diventa casuale rispetto all'intenzione. E il **verbo 9 (chiamata in profondità)** è specificato come «tenuta ≥ 0,30, **rilascio al centro (m = 0)**»: un verbo definito come l'assenza di trascinamento, cioè l'unica cosa che in piedi non si può produrre. È anche il secondo degli INVITI del §3.3 — lo schema insegna per primo il verbo che non sa consegnare nella postura che il §5 dice di dover reggere.

**Mani grandi**: l'impostazione «distanza dei comandi» va da 78,2 a 119,1 px fra i centri, cioè **da 13,0 a 19,9 mm — l'intera escursione del rimedio sta dentro un solo polpastrello da 25 mm.** Non può risolvere il problema per cui è offerta. Separare due bersagli sotto lo stesso polpastrello si fa nel tempo o nella direzione, non con 3 mm di arco.

---

### E una cosa che il documento non dichiara, in una sezione fatta apposta per dichiararle

Il §6 elenca dieci cose che lo schema non può fare, e non elenca questa. Oggi (`Touch5.release`, 8898-8951, letto) il flick **con la palla** ha tre rami: verso la porta → `fireShot` con l'anello ancorato al possesso; trasversale in metà offensiva → `doCross`; altrove → `kickBall(...,340,0)`. La D3 li sostituisce tutti e tre con il knock-on. Il §2.3 elenca solo tocco/arresto/taglio; la «retrocompatibilità dei riflessi» è rivendicata solo per il verbo 34, senza palla.

Concretamente: il giocatore che ha imparato la cosa migliore che il gioco insegna — flick verso la porta, anello, tiro — sotto lo schema nuovo, con lo stesso gesto, nella stessa direzione, nello stesso contesto, **mette `owner = −1` e spinge la palla al portiere avversario.** Il §1.4 riconosce che un tocco che regala la palla «è un errore peggiore» di un passaggio involontario, senza accorgersi che per il giocatore allenato quel flick non è falso: è il tiro che gli è stato insegnato. Questo da solo vale mezzo punto.

---

## LA SINGOLA MODIFICA CHE ALZEREBBE DI PIÙ IL VOTO

**Il trascinamento si latcha al massimo dell'escursione durante la pressione, invece di leggersi al punto di rilascio — e con questo `DRAG_FULL` scende da 44 a 22 px.**

È una modifica sola, perché le due metà sono la stessa cosa: appena il trascinamento smette di essere una lettura di posizione alla fine e diventa una lettura di picco durante, non gli serve più il doppio della corsa per sopravvivere al rumore del distacco.

Cosa raddrizza:
- **Rottura 1**: gli ultimi 60-80 ms — l'unica parte del gesto contaminata dal distacco — smettono di contare. La polarizzazione sistematica «mira alto / cono indietro» sparisce da tutti e venti i verbi con trascinamento, su entrambi i dischi.
- **Rottura 2**: l'escursione verticale si dimezza. Il bordo del polpastrello a piena mira sale a y 255 invece di 233: l'occlusione aggiunta si dimezza, e per metà della corsa il pollice resta nella fascia dei 64 px dichiarata trasparente.
- **Rottura 3**: con 22 px di corsa piena il canale non regge più un continuo, e allora dichiaralo — **tre stati (alto / centro / basso)**, che si producono con un segno e una soglia. Un segno e una soglia si producono in piedi, con un pollice grosso, e a 560 px di larghezza. Un continuo da 5 mm no.
- **Non perde niente del §1.3**: il picco si latcha da qualunque campione arrivi, e `t0` più il punto di rilascio restano il ripiego se nessun `touchmove` scatta mai. L'immunità alla fusione resta intatta. Costa un punto in più memorizzato in `btnTouch[id]` e un confronto per `touchmove`.

E la riga di misura senza cui non serve a niente: **M1 deve aggiungere un termine di deriva al distacco** (1-3 mm in direzione distale, applicato fra l'ultimo `touchmove` e il `touchend`) **e campionare la posizione della pressione da una distribuzione che possa MANCARE la presa**, non «±9 px dentro la presa». Finché il rumore modellato non contiene il fallimento più comune del mondo reale — il bersaglio mancato — M1 attesta invece di misurare, che è precisamente la trappola che questo progetto ha già pagato ventidue volte.