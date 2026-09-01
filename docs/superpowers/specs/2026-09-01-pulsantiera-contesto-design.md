# LA PULSANTIERA CHE NON MENTE — progetto approvato

**1 settembre 2026.** Voce di lavoro **#88**. Progetto approvato dal committente
a sezioni (quattro conferme). Nessuna riga di gioco è stata toccata scrivendo
questo documento: qui si decide, non si esegue.

**La lagnanza, con le sue parole:** «quando crosso, mentre la palla è in volo i
tasti cambiano e non mi permette di premere il tasto tirare, come se non avessi
più il possesso palla; questo succede anche nei contrasti o quando si cerca di
difendere la palla o pressare o contrattaccare — i tasti sono scomodi e fatti
male per queste situazioni. Prendi spunto da FC Mobile o cerca come dovrebbe
funzionare.»

**Il mandato aggiunto:** «usa la meccanica di FC Mobile e assicurati che sia
libera da usare e che ci si possa monetizzare».

---

## 1. La diagnosi, misurata

Tutti i numeri sono del 1 settembre 2026, presi con sonde a passo 1/60 su semi
dichiarati (20260901 e 20260902). I numeri di riga sono di oggi: **cercare per
nome prima di eseguire**, perché invecchiano in un giorno.

| fatto misurato | numero |
|---|---|
| Durante il volo di un nostro **cross**, il disco grande offre CONTRASTA | 49 fotogrammi su 54; 216 su 222 |
| Finestra per armare il tiro in coda al volo | **0 fotogrammi** |
| Durante un nostro **passaggio**, cambi di faccia in un volo solo | fino a **4** |
| Finestra di TIRA in coda al passaggio | 4 e 2 fotogrammi (67 e 33 ms) — sotto ogni tempo di reazione |
| Inseguendo un portatore avversario, cambi di faccia in 6 secondi | **6**, tutti fra 33,4 e 36,9 unità |
| In quegli stessi fotogrammi, la palla è nostra secondo il gioco | 49/54, 222/222, 100/100, 31/31 |
| Il comando durante il cross va al destinatario | **no**: dava l'uomo 1 mentre il cross andava al 2 |
| PRESSA offerto durante il volo nostro | 91-98% del tempo — e se premuto **rifiuta**, non c'è nessuno da pressare |

**La causa, in una riga:** la faccia di ogni disco si ricalcola a ogni fotogramma
da un predicato **geometrico** — «il pallone dista più di `KICK_R*1.4` = 36,4
unità dal mio uomo?» (`puoTirare`, CALCETTO-il-gioco.html:14037). Siccome durante
un'azione il pallone attraversa quella soglia di continuo, il disco **cambia
mestiere**.

**La profezia già scritta in casa.** Il verbale sopra le quattro capacità
(:14001-14026) dichiara il problema dal giorno in cui fu scritto: «"nostra" è una
domanda che durante il volo di un passaggio non ha risposta… più di un secondo
per passaggio in cui i dischi dicevano LORO su un pallone che tornava fra i
nostri piedi». Allora si scelse «cosa otterrebbe il dito» e si lasciò il contesto
irrisolto. L'obiezione di allora a `b.passTo` — «va rancido, non si azzera
sull'intercetto» — **è invecchiata**: oggi si azzera su muro (:17791), tocco
sporco (:17921), controllo (:17928) e uscite (:16914, :17605).

---

## 2. Come lo fa il concorrente (fatti dal suo pacchetto, con le righe)

Scavo del 1 settembre 2026 su `fcm-estratto/motore-tutte.txt` (146.694 stringhe,
fuori dal repository per sempre). Le idee sono libere, l'espressione no: qui si
prende il **come funziona**.

1. **La pulsantiera è una griglia fissa**, non un insieme di dischi che si
   trasformano: quattro pulsanti di gioco a nome fisso (A, B, C, S — :50558,
   :34953, :21743, :32717) più pausa e panoramiche. Le posizioni **non si
   muovono mai**.
2. **Un cambio di contesto maschera e rietichetta**: `lxSetTouchButtonGridMask`
   (:32700) spegne la cella, `lxSetTouchButtonLabel` (:70340) riscrive
   l'etichetta, e la tabella delle etichette è un dato separato
   (`TouchPadButtonLabels`, :19480).
3. **Ogni pulsante porta cinque comandi**: il tocco più quattro trascinamenti —
   venti comandi con quattro pulsanti, senza spostare niente (:59541, :68270,
   :48366, :52747 per i tocchi; le sedici direzionali da :35102 a :30717).
4. **Nel gioco aperto esistono due soli stati**: si attacca o si difende
   (:77247 / :74775). Nessuno stato «vicino al pallone», nessuna soglia di
   distanza. Il resto degli stati è palla ferma.
5. **La sua pulsantiera non ascolta né il possesso né il volo.** Ha cinque
   ascoltatori in tutto (:125379-125383): il dito, l'inizio azione, l'inizio
   possesso in assalto, l'inizio partita, il gol. Il messaggio «passaggio in
   volo» esiste (`Gameplay::PassInProgress`, :49287) e ha **un solo ascoltatore:
   il dispatcher audio** (:79707). Da lui il volo è un evento sonoro, non tocca
   i comandi.
6. **Il tiro di prima non è un pulsante: è un tipo di contatto** risolto
   all'impatto (`FirstTimeShotType`, :21678; `FIRST_TIME`, :55006, in fila con
   colpo di testa in tuffo, tiro a giro e rovesciata). Tu premi tirare; il motore
   decide l'esito da altezza e velocità.
7. **Le etichette sono combinate, con metà costante**: «scatto e dribbling»
   (:52761), «cambio e scatto» (:57282), «scatto e contrasto» (:77246). Lo
   scatto sta sempre nello stesso posto: il pollice ha un'ancora.
8. **In difesa ha sei verbi e non uno di più** (:61592, :14904, :26029, :30425,
   :52610/:48243, :32589). Contenere e pressare **non sono tasti**: nascono da
   levetta più scatto. Il secondo difensore ha accendi e spegni separati, con un
   cronometro dedicato (:61707).
9. **Esiste l'atto nullo esplicito** (`Action_None`, :26026): meglio niente che
   un'etichetta che mente.

**Il nostro difetto in una frase:** da lui i tasti stanno fermi e cambiano solo
etichetta; da noi cambiano mestiere venti volte al secondo.

---

## 3. La libertà di ciò che adottiamo

Il committente ha chiesto la garanzia. Per ogni meccanica adottata, la ragione
per cui è libera:

| meccanica adottata | perché è libera da usare |
|---|---|
| Pulsanti fissi con etichetta variabile | Arte nota dai giochi sportivi degli anni Novanta, ben prima del concorrente |
| Cella spenta invece di verbo travestito | Un controllo disabilitato è pratica standard d'interfaccia da sempre |
| Stato legato al possesso (attacco/difesa) | È la regola del calcio; non si brevetta il calcio |
| Macchina a stati per l'interfaccia | Informatica di base |
| Tiro di prima come esito del contatto | La fisica del pallone che incontra un piede in movimento; presente in decine di giochi |
| Comando al destinatario del passaggio | Automatismo di regia comune ai giochi sportivi |

**Il principio di legge**, dichiarato: le *meccaniche* di gioco non sono coperte
dal diritto d'autore — l'ordinamento europeo esclude idee e principi, e quello
statunitense esclude «procedura, processo, sistema, metodo di funzionamento».
È protetta l'**espressione**: codice, testi, grafica, suoni, marchi.

**Ciò che non prendiamo mai**, e che non è mai stato preso: una riga del suo
codice, le sue etichette alla lettera, i suoi asset, i suoi marchi, i nomi dei
calciatori reali. Il suo pacchetto resta fuori dal repository.

**Monetizzazione:** il gioco è scritto da zero e non contiene nulla di suo; i
caratteri a bordo hanno licenza libera dichiarata (OFL). Nulla di quanto scritto
qui impedisce vendita, pubblicità o acquisti. *Nota onesta: questo documento non
è un parere legale; per una monetizzazione su larga scala un parere
professionale resta prudente.*

---

## 4. Il progetto

### 4.1 La legge della pulsantiera (sezione approvata 1)

La faccia dei dischi dipende da **un fatto discreto: di chi è la palla**, letto
da `squadraDelPallone()` — la funzione pura già in casa dal 1 settembre (voce
#82), che risponde «il padrone se c'è, altrimenti la squadra dell'ultimo tocco»
e non pesca sorteggi.

Nel gioco aperto **due stati**: *palla nostra* / *palla loro*. Le palle ferme
(rigore, punizione, calcio d'inizio, duello) hanno già i loro contesti separati
e non si toccano.

**I dischi non cambiano mestiere.** TIRA resta TIRA al suo posto per tutta la
partita. Quando il verbo non può nascere, la cella **si spegne**: resa grigia,
non premibile, con la sua etichetta. Non si traveste da un altro verbo.

**Cella spenta, definita**: il disco resta disegnato al suo posto con la sua
etichetta, attenuato; una pressione su di esso **non produce nulla e non
consuma niente** — nessun atto nasce, nessuna carica si apre. Resta invece
attivo, e invariato, il segno del rifiuto già in casa (L3.1, `rifiutoVerbo`)
per il caso diverso in cui la cella è ACCESA ma il corpo non è in condizione
(a terra, in rialzo): lì il no si vede, perché il dito ha chiesto una cosa
lecita e il corpo non ce la fa.

### 4.2 La palla nostra in volo (sezione approvata 2)

**Il tiro al volo esiste già** e funziona: `updateBall` :17809-17833 — chi tiene
la carica del tiro e incontra una palla in movimento la colpisce di prima, con
bonus di potenza dalla palla in arrivo, e il gesto entra nelle statistiche
(`G.stats.volee`). È **irraggiungibile** perché `puoTirare` nega durante il volo
e `startCharge` (:15150-15169) esce subito.

Cure:

- `puoTirare` guadagna il ramo del possesso: se la palla è **nostra** (per
  `squadraDelPallone`), TIRA è offerto e premibile. Le guardie del corpo (a
  terra, in rialzo, in rovesciata) restano identiche.
- `startCharge`: sopra la soglia di calcio, **prima** si prova la finestra della
  rovesciata (che mantiene la precedenza: è il verbo spettacolare); se non è
  aperta e la palla è nostra in volo, **apre la carica del tiro** invece di
  uscire.
- **La cella si spegne quando il tiro è impossibile**: palla degli avversari, o
  palla nostra ma irraggiungibile. La faccia resta TIRA (mai travestimenti),
  l'accensione dice la verità.

  **«Irraggiungibile», definito**: la distanza fra il comandato e il pallone
  supera `P_SPEED * 1,2` — quanto un uomo copre in poco più di un secondo alla
  sua velocità di corsa. Un numero solo, dichiarato e tarabile; se il banco
  mostrasse che spegne troppo (celle spente su palloni che si prendevano),
  sale a 1,5 s e si rimisura. Nessuna previsione del punto di caduta: sarebbe
  un secondo modello della fisica dentro un predicato che deve restare puro.

- **Il comando segue il destinatario**: in `switchControlled` (:16555-16579), se
  `b.passTo` o `b.crossTo` è un nostro uomo di movimento, il controllo va a lui
  invece che al più vicino al pallone. **Vale per ogni passaggio con
  destinatario dichiarato**, non solo per i cross alti: è il caso che il
  committente ha lamentato. Se sui passaggi corti risultasse fastidioso (il
  comando che salta avanti e indietro in uno scambio veloce), si restringe ai
  soli palloni alti e ai cross — che è la separazione che il concorrente offre
  come due interruttori distinti.

### 4.3 Difendere con tasti fermi (sezione approvata 3)

- Quando la palla è loro, la colonna difensiva **resta quella**: contrasto (che
  trascinato diventa scivolata), cambio uomo, raddoppio. Il disco grande
  **continua a stare al suo posto e a chiamarsi contrasto**: quello che
  spariscono sono le sei puntate misurate in cui diventava TIRA per un istante
  — cioè il travestimento, non il disco. (Coerente con §4.1: i dischi non
  cambiano mestiere; qui il mestiere è il contrasto e resta tale per tutto il
  tempo in cui la palla è loro.)
- **Un verbo che non può nascere si spegne** invece di restare acceso e
  rifiutare (il caso misurato: PRESSA offerto per il 91-98% del volo nostro e
  `comandaPressa` che rifiuta perché non c'è portatore avversario).
- **Il raddoppio diventa una tenuta**: oggi è un impulso (`comandaRaddoppio`,
  :12491); domani si tiene premuto e il compagno resta addosso finché tieni —
  sul modello dell'accendi/spegni con cronometro del concorrente.
- **Il contenimento si vede**: tenere il contrasto già contiene l'avversario
  (`Touch5.contiene`, :13674-13680, stabilizzato dalla voce #82) ma non lascia
  nessun segno a schermo. Si aggiunge il segno.

**Il prezzo, dichiarato prima e non dopo:** si perde la «punta rubata» — la
giocata in cui, addosso al portatore, premevi TIRA entro i 36,4 e strappavi via
il pallone. Va **misurato**: se i furti riusciti calano, la cura si aggiusta
invece di essere spedita.

### 4.4 Che cosa non si tocca

`touchBtnLayout` nella sua struttura (è ricostruita da un banco: vedi §6), la
risoluzione del tocco alla pressione, la porta del ri-armo della voce #82, i
cinque dischi come numero e posizione, le palle ferme e il duello, la fisica del
pallone.

---

## 5. Le soglie di accettazione

Decise **prima** dell'esecuzione, perché non possano essere aggiustate dopo:

| misura | oggi | soglia |
|---|---|---|
| TIRA premibile durante un nostro cross in volo | 9% dei fotogrammi | ≥ 90% |
| Cambi di faccia inseguendo un avversario (6 s) | 6 | 0 |
| Comando al destinatario dopo il calcio | mai | entro 0,5 s |
| Volée eseguite tenendo TIRA durante il volo | impossibili | contate a tabellino |
| Furti riusciti (il prezzo) | il numero di oggi | non cala |
| Celle accese che rifiutano l'atto | PRESSA 91-98% del volo | 0 |

**Banchi esistenti che devono restare verdi:** `_q-precedenza` (9 cancelli),
`_q-l12`, `_q-l16`, `giocata --tutte` (7 giocate), `_q-riarmo` (7/7),
`_q-determinismo`, `_c3-sorteggi`, `_crit3-mira-sorteggi`, `_crit4-sorteggi`,
`_crit10-sorteggi`.

**Banco nuovo:** la sonda del volo promossa a cancello in `strumenti/`, con i
sei verdetti della tabella. Il grosso è già scritto nello scratchpad.

---

## 6. I rischi, e come si trattano

1. **`_q-precedenza` ricostruisce la pulsantiera.** Non la usa: la **estrae dal
   file e la esegue fuori dal gioco**. Ogni nome nuovo chiamato dalle funzioni
   estratte deve essere una funzione di primo livello sotto i 2.000 caratteri, o
   il banco esplode e dichiara rossi tutti e nove i cancelli — accusando il gioco
   di un guasto suo. *Regola di lavoro: ogni nome nuovo si prova su quel banco
   prima di dichiarare finito.*
2. **La rovesciata non deve essere oscurata.** Nel riordino di `startCharge`, se
   la finestra della rovesciata e la palla-nostra-in-volo sono vere insieme (un
   nostro cross che scende in area), **la rovesciata vince**. Da misurare nel
   banco nuovo.
3. **La faccia TIRA su pallone irraggiungibile.** Curato per costruzione dalla
   cella spenta (§4.2): la faccia non mente perché l'accensione dice la verità.
4. **La punta rubata persa** (§4.3): misurata, non supposta.
5. **Dita già posate.** La porta del ri-armo (#82) fa sì che un dito che teneva
   CONTRASTA da prima del nostro cross non si ri-armi quando la faccia diventa
   TIRA (il lato non è cambiato): rilascio inerte, degrado sicuro, da dichiarare
   nel verbale.
6. **I nastri delle sfide registrati prima** divergono nei replay con un dito su
   un disco durante un volo — stessa classe della voce #82: si tratta col numero
   di versione nel verbale di pubblicazione.

**Sorteggi:** zero chiamate nuove a `dado()`. `puoTirare`, `puoPassare` e
`squadraDelPallone` hanno lo statuto dichiarato «non scrive un bit, non chiama
mai `dado()`» e le cure vi aggiungono solo letture. Nei percorsi a seme fisso
macchina-contro-macchina non si esegue una istruzione nuova: il conto resta
identico al bit.

---

## 7. Che cosa resta fuori, e dove

Per esplicita decomposizione (cinque cantieri, ordine approvato dal
committente): **vernice del campo** in scala ufficiale (#86), **residuo della
moviola** — i cronometri dei gesti non interpolati (#85), **rimesse laterali e
calci d'angolo** (#87), **filtrante, cross e rovesciata** rifatti sul modello del
paragone (#89). Le proporzioni di **porta e corpi** restano fuori da tutto: sono
in «scala-corpi» dichiarata e correggerle ritara tiro, portiere e cross —
settimane, e un gioco più povero di gol. Onda a sé, solo con mandato esplicito.
