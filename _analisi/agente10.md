# LO SCHEMA "L'IPOTESI DICHIARATA" — comandi mobile di CALCETTO

Sonde nuove, di sola lettura, che restano nel progetto:
`C:\Users\Utenteee\Desktop\GitHub\games\_p-intenzione.js` (geometria · censimento dell'ambiguità · durata sotto CPU rallentata) e `C:\Users\Utenteee\Desktop\GitHub\games\_p-dito-alzato.js`. Non ho toccato `CALCETTO-il-gioco.html`.

---

## 0. LE QUATTRO MISURE CHE HANNO SCRITTO IL PROGETTO

Chromium headless, 915×412, deviceScaleFactor 2, `hasTouch`. Ogni numero qui sotto è **misurato**; quello che non lo è sta al §10.

**M1 — la geometria dichiarata dal gioco** (`__test.comandiTouch`, un fotogramma vero):

| | centro | r | riquadro |
|---|---|---|---|
| GRANDE (TIRA / CONTRASTA) | **(851, 352)** | 40 | 807–895 × 308–396 |
| PICCOLO (FILTRANTE / CAMBIO) | **(757, 340)** | 30 | 723–791 × 306–374 |
| bussola | (56, 379) | — | **10–102 × 355–402** (92×47) |

Fasce: barra 0–45, area di gioco 45–348, fascia bassa 348–412. Distanza fra i centri dei dischi: **94,76 px**. Presa `r+10`, anello di esclusione `r+18` (righe 8825 e 8836).

**M2 — il dito alzato.** 50 prove in stato di possesso, dito posato, fermo 540 ms, alzato senza flick, calcio riconosciuto dal **cambio di proprietario** del pallone (non dalla sua velocità: un portatore che cammina trascina la palla a 168 u/s senza averla calciata — era l'errore della mia prima stesura):

| corsa levetta | 0 px | 8 | 20 | 46 | 70 |
|---|---|---|---|---|---|
| rilasci che calciano | 6/10 | 7/10 | 7/10 | 7/10 | 7/10 |

**34 rilasci su 50 (68%) emettono un calcio.** Il pallone finisce all'avversario 10 volte su 50; ma la controprova *senza dito*, nello stesso stato, ne perde 2 su 10. **Quindi ho misurato che il rilascio emette un calcio, non che quel calcio costi il possesso.**

**M3 — censimento dell'ambiguità.** Stati veri campionati in partite CPU-vs-CPU, punteggio del passaggio ricopiato dal gioco (`smarcato`, righe 9076–9101):

| | 5v5 | 7v7 | 11v11 |
|---|---|---|---|
| campioni | 812 | 145 | 91 |
| **il bersaglio si ribalta fra due fotogrammi adiacenti** | **0,4%** | 0,7% | **5,5%** |
| margine punteggio 1°−2° (mediana / minimo) | 61,1 / 3,3 | 119,6 / 2,1 | 118,4 / 1,6 |
| **coni da 60° VUOTI** (nessun compagno a dot>0,5) | **71,0%** | 39,5% | 28,2% |
| compagni nel cono quando non è vuoto (mediana / max) | 3 / 3 | 3 / 5 | **4 / 9** |
| margine di dot fra 1° e 2° nel cono (mediana) | **0,0088** | 0,055 | 0,037 |
| la levetta distingue ≥2 uomini | 100% | 100% | 100% |

Tre conseguenze dirette, e sono il progetto:
1. **A 11 contro 11 il bersaglio automatico del passaggio è già in parte un dado**: cambia da solo fra due fotogrammi consecutivi nel 5,5% degli stati. Dare la mira al giocatore non aggiunge instabilità: ne toglie.
2. **A 5 contro 5 un cono da 60° è vuoto sette volte su dieci.** `eseguiFiltrante` (riga 9160) pretende dot>0,5 e, se nessuno lo soddisfa, **esce senza calciare e senza dirlo**. Un comando che non fa niente in silenzio è peggio di uno che indovina male. La levetta deve *inclinare* la scelta, non *sbarrarla*.
3. **Quando due compagni cadono nello stesso cono, sono quasi appaiati** (mediana 0,0088 di dot). Il gioco ha già la contromisura giusta: la fascia di 0,08 con lo spareggio sullo smarcamento (riga 9165). La mia misura dice che quella fascia è **della taglia giusta**: prende il caso mediano con un ordine di grandezza di margine. Il margine di guardia non è una mia invenzione, è già in casa — va generalizzato.

**M4 — tap contro tenuta con la CPU rallentata** (CDP `setCPUThrottlingRate`), 24 prove per riga, soglia di lettura 150 ms:

| CPU | premuta voluta | durata misurata dalla pagina (min / p50 / max) | letti male |
|---|---|---|---|
| 1× | 90 ms | 97,1 / 108,2 / 124,8 | **0/24** |
| 1× | 400 ms | 405,3 / 415,4 / 430,3 | 0/24 |
| 4× | 90 ms | 104,1 / 114,7 / 219,2 | 3/24 |
| 4× | 400 ms | 417,1 / 474,4 / 579,9 | 0/24 |
| 6× | 90 ms | 139,8 / **271,3** / 389,6 | **23/24** |
| 6× | 400 ms | 419,9 / 553,0 / 734,4 | 0/24 |

**Su un telefono in affanno una soglia di durata letta sull'orologio degli eventi non misura il dito: misura il telefono.** L'errore va tutto in una direzione — il tap diventa tenuta, mai il contrario. Questo numero è **contaminato dal banco** (§10) ma la direzione dell'errore no, ed è quella che decide il progetto.

E una nota letta nel codice, non misurata: il gioco ha **due orologi**. La carica del tiro cresce dentro `step()` col passo fisso (riga 9920, `p.charge+=dt`, dall'accumulatore di riga 28738), il flick usa `performance.now()` (riga 8885). Sotto carico il primo rallenta **insieme all'anello che il giocatore guarda**; il secondo no. Il tiro di oggi è già immune. È il modello.

---

## 1. IL PRINCIPIO — tre frasi, e due leggi

**Le tre frasi che un giocatore deve sapere** (non ce n'è una quarta):

1. **La levetta dice DOVE.**
2. **Il disco grande è LA PALLA. Il disco piccolo sono I COMPAGNI.**
3. **Il tocco è un ATTO. La tenuta è uno STATO.**

La seconda frase regge su tutte e otto le caselle: grande = tiro, appoggio, pallonetto, rovesciata, scivolata, contenimento, spazzata (io e il pallone); piccolo = passaggio, filtrante, cross, chiamata, cambio, raddoppio (gli altri).

**Prima legge — dell'intenzione:**
> **Senza palla il gioco AGISCE al tocco. Con la palla il gioco PROPONE al tocco e AGISCE al rilascio** — e ciò che propone è **dipinto sul campo** prima di essere eseguito.

Non è simmetria estetica: il possesso è esattamente lo stato in cui indovinare male costa. Dove non c'è niente da perdere si risponde subito; dove c'è, si mostra l'ipotesi e si lascia al dito il tempo di smentirla.

**Seconda legge — dell'ambiguità:**
> **Non si classifica il DITO, si legge il MONDO.** Nessun verbo è scelto da una soglia sull'orologio degli eventi. Ogni verbo è funzione di uno stato della simulazione che il giocatore ha visto per almeno un fotogramma.

È la legge che M4 ha imposto. Esempio concreto: il piccolo non decide "appoggio o filtrante" misurando quanto è durata la pressione. Decide guardando **se il compagno è partito**. Un evento consegnato in ritardo dà al compagno più tempo per partire, e la palla viene giocata dentro una corsa che esiste davvero. Il telefono lento non produce il verbo sbagliato: produce il verbo giusto per il mondo che il giocatore sta guardando.

---

## 2. LA MAPPA DEGLI INGRESSI — 915×412 px CSS, dpr 2

Nessun pulsante nuovo. Nessuna direzione di flick nuova. Una sola superficie riusata.

```
 0                                                                    915
 0 ┌──────────────────────────────────────────────────────────────────┐
   │ BARRA (tabellone)                                          y 0–45│
45 ├──────────────────────────────────────────────────────────────────┤
   │                                                                  │
   │                     AREA DI GIOCO  y 45–348                      │
   │                                                                  │
   │              ┌ levetta a riposo ┐          ┌───── PICCOLO ─────┐ │
   │              │ 50–142 × 226–318 │       306│  centro (757,340) │ │
   │              └──────────────────┘          │  r 30 presa 40    │ │
348├─────────────────────────────────────────374└───────────────────┘─┤
   │ ┌ BUSSOLA ┐        FASCIA BASSA 348–412  308┌───── GRANDE ──────┐│
355│ │10–102 ×  │                                │  centro (851,352) ││
402│ │ 355–402  │                                │  r 40 presa 50    ││
412└─┴──────────┴────────────────────────────396 └───────────────────┘┘
```

**Le cinque zone, in ordine di precedenza geometrica** (la geometria si valuta prima di ogni semantica):

| # | zona | geometria | cosa nasce |
|---|---|---|---|
| 1 | **presa GRANDE** | disco r **50** attorno a (851,352) | un atto/stato del disco grande |
| 2 | **presa PICCOLO** | disco r **40** attorno a (757,340) | un atto/stato del disco piccolo |
| 3 | **anelli di esclusione** | corone r 50→58 (grande) e 40→48 (piccolo) | **niente**, mai (già in casa, riga 8836) |
| 4 | **bussola** | rettangolo 10–102 × 355–402 | tap → cambio ad angolo · qualunque movimento >12 px → è una levetta nata lì |
| 5 | **tutto il resto** | l'intero canvas | levetta che insegue (origine dove si posa, MAXR 70) |

**Le durate, tutte sull'orologio della simulazione** (`step()`, DT = 1/60), mai su `performance.now()`:

| soglia | valore | dove vive già |
|---|---|---|
| `TAP_T` — atto contro stato | **0,15 s** | riga 3077, invariata |
| finestra dolce del tiro | 0,50–0,80 s (+±45 ms dalla tecnica) | righe 3077, 9233 |
| tetto della carica | 1,25 s | `SHOT_HARDCAP` |
| **profondità della chiamata** | 0,15 → **1,20 s** (nuovo) | — |
| flick | **>650 px/s** su ≥2 campioni reali in 90 ms | righe 8896–8904, invariate |
| **annullamento** | **56 px di percorso** dal punto di posa, a scatto | nuovo |
| tap della bussola | <200 ms **e** <12 px di spostamento | nuovo |

**Perché 56 px per l'annullamento, e non una distanza dal centro.** Dal centro del GRANDE il bordo destro dista 64 px e il basso 60: una soglia "distanza dal centro > 74" sarebbe irraggiungibile in due direzioni su quattro. 56 px di **percorso** (≈9 mm) è raggiungibile in tutte e quattro (64>56, 60>56), è sopra qualunque scivolamento del pollice, ed è a scatto: appena superato il disco si spegne e il rilascio non fa più niente, ovunque cada. Trascinare da un disco all'altro (94,76 px) annulla sempre, e il dito non attiva mai l'altro disco perché conserva il proprio legame (`btnTouch[id]`, riga 8823).

---

## 3. LA TABELLA AZIONE → INGRESSO

**● = c'è già · ◐ = c'è ma cambia · ○ = nuovo.** Nessuna riga chiede un pulsante nuovo.

### MOVIMENTO
| | azione | ingresso |
|---|---|---|
| ● | corsa analogica | levetta (dead 12, piena 46) |
| ● | sprint | levetta oltre 66 px |
| ○ | **ferma palla** | flick col pallone **all'indietro** (`nx·goalDir < −0,5`) — occupa lo slot direzionale oggi sprecato nel "passaggio forte" |
| ○ | **niente** | **alzare le dita**. Il rilascio della levetta non è più un passaggio |

### DISCO GRANDE — la palla, **con** possesso (etichetta TIRA)
| | azione | ingresso |
|---|---|---|
| ● | appoggio corto | premi e rilascia entro `p.charge < 0,15 s` — direzione della levetta |
| ● | tiro col timing | tieni, rilascia sulla finestra dolce; l'anello (riga 24450) è già lo strumento di mira |
| ○ | **tiro di precisione** | tieni + **levetta a fondo corsa verso un palo** al rilascio: mira a `±(GOAL_H/2 − 18)`, curva ±90, ma arriva a **280 invece che a 330** — il portiere ha *più* tempo. È uno scambio, non un potenziamento |
| ● | pallonetto | tieni + sprint al rilascio |
| ● | tiro al volo | carica già aperta quando la palla arriva |
| ● | rovesciata | tocco con palla alta in discesa in area |
| ● | tiro col flick | flick della levetta verso la porta col pallone |
| ● | passaggio forte in direzione | flick col pallone, non verso porta, non trasversale, non all'indietro |
| ○ | **annulla** | 56 px di percorso dal punto di posa (`chiudiAnticipo`, riga 9450, esiste già ed è già chiamato) |

### DISCO PICCOLO — i compagni, **con** possesso (etichetta **PASSA**, cambia da FILTRANTE)
| | azione | ingresso |
|---|---|---|
| ○ | **il bersaglio si accende** | al **tocco**: anello ai piedi del compagno scelto + linea di passaggio. Non parte niente |
| ○ | **chiamata in profondità** | a **0,15 s** di tenuta il compagno **parte**; più tieni, più profonda la corsa (tetto 1,20 s) |
| ○ | **mira del bersaglio** | levetta **durante** la tenuta: inclina la scelta (§5) |
| ◐ | passaggio d'appoggio | rilascio **mentre il compagno non è ancora partito** → ai piedi, 320–520 (il passaggio di oggi) |
| ◐ | filtrante sulla corsa | rilascio **dopo che il compagno è partito** → lead 0,55, 420–640, rasoterra (il filtrante di oggi) |
| ◐ | cross **mirato** | tenuta + sprint in metà offensiva → il punto d'atterraggio è **il bersaglio**, non più il secondo palo fisso |
| ○ | **filtrante a scavalcare** | tenuta + sprint **nella propria metà** — oggi lì il modificatore non fa niente (riga 9130): canale morto riacceso |
| ● | cross col flick | flick trasversale col pallone in metà offensiva |
| ○ | **annulla** | 56 px di percorso: il compagno rientra |

### DISCO GRANDE — **senza** possesso (etichetta CONTRASTA)
| | azione | ingresso |
|---|---|---|
| ○ | **contenimento (jockey)** | il **tocco** lo apre subito: velocità ×0,62, il corpo si tiene sulla linea palla-porta a ~30 unità (riuso di `p.contieni`/`standoff`, righe 11726–11742, oggi solo CPU e a Duro spento) |
| ◐ | scivolata | rilascio entro `0,15 s` di contenimento |
| ○ | **lato del contenimento** | levetta durante la tenuta |
| ● | scivolata col flick | flick della levetta senza palla — resta la porta veloce, senza attesa |
| ○ | **spazzata comandata** | tocco con palla libera entro `KICK_R` nel proprio terzo: 520 u/s, `vz` 60, direzione della levetta. Contesto puro, zero ingressi |

### DISCO PICCOLO — **senza** possesso (etichetta CAMBIO)
| | azione | ingresso |
|---|---|---|
| ● | cambio uomo | **tocco**, immediato (`cambiaGiocatore`, riga 9956) |
| ○ | **raddoppio comandato** | tenuta ≥0,15 s: il secondo uomo più vicino al portatore pressa finché tieni (riuso del ruolo `raddoppio`, righe 11758–11770, oggi solo taglie 7/11 e solo automatico). Il rilascio lo fa rientrare |
| ○ | **cambio ad angolo** | tap sulla bussola (§6) |

**Il pavimento dichiarato.** Un giocatore che non tiene mai un disco e non tocca mai la bussola ha comunque un gioco completo: levetta, sprint, 4 tap, 5 flick, tiro, passaggio, scivolata, cambio. **Niente in questo schema *deve* essere scoperto.**

**Conto degli ingressi:** 1 levetta + 2 dischi + 2 contesti + 2 durate + 5 direzioni di flick + 1 superficie riusata → **28 verbi**. Per confronto: DLS 6, FIFA Mobile ~8, EA FC Mobile 31 con 5–6 pulsanti e sette associazioni arbitrarie di flick.

---

## 4. COME SI SCOPRE, E COME SI RICORDA

**Quattro strumenti, in ordine di forza.**

1. **L'etichetta dice già quello che il dito farà** (riga 8779, e la posa dell'HUD è già stata riparata proprio per questo). Quattro parole, due contesti. Resta.
2. **La seconda riga compare solo mentre tieni**: sotto TIRA appare `POTENZA`, sotto PASSA `PROFONDITÀ`, sotto CONTRASTA `CONTIENI`, sotto CAMBIO `RADDOPPIO`. Testo di 9 px **dentro** il disco: zero superficie nuova nella fascia bassa, che il file documenta come già contesa.
3. **L'anteprima nel mondo è il vero maestro.** Chi preme il piccolo e vede un anello accendersi ai piedi di un compagno ha imparato la tenuta in un fotogramma, senza leggere niente. È manipolazione diretta, il costo di apprendimento più basso del catalogo. Ed è anche il **rifiuto visibile**: se punti la levetta e l'anello *non* si sposta, hai visto che il gioco difende la sua scelta (§5) — non hai premuto a vuoto senza saperlo, che è il difetto misurato del filtrante di oggi (71% di coni vuoti, in silenzio).
4. **Il tutorial cambia natura.** Oggi 4 passi a orologio, 10 s, e muore al primo gol (righe 29120–29162): insegna 4 gesti su 11. Nuovo: **3 passi a orologio** (levetta, PASSA, TIRA) e poi **passi a curiosità**, senza cronometro, che compaiono la prima volta che il gioco vede la condizione — la prima volta che tieni un disco oltre 0,15 s, la prima volta che difendi nella tua area, la prima volta che un pallone alto scende nell'area avversaria. Il meccanismo `fatti` (riga 29131) esiste già e fa esattamente questo mestiere: non insegnare un gesto già riuscito.

**Perché si ricorda.** Nacenta: gli errori sono di **associazione**, non di forma. Le associazioni arbitrarie qui sono **zero**: non c'è nessun "flick in basso sul tiro = finesse". La durata significa `quanto` in tutte e quattro le caselle; la levetta significa `dove` in tutte e quattro; il disco grande è la palla e il piccolo sono i compagni in tutte e otto. Ci sono **tre frasi da ricordare**, non otto caselle.

---

## 5. QUANDO DUE COMANDI SONO AMBIGUI — la precedenza, in ordine

**R1 — La geometria vince sulla semantica.** Un tocco dentro `r+10` è quel disco; dentro `r+18` non è niente; fuori è levetta. Nessuna riassegnazione "intelligente". L'anello di esclusione è già pagato: resta.

**R2 — Il contesto si congela al touchstart.** È già legge in casa (riga 8817). Estesa: durante una tenuta il **bersaglio** può cambiare, la **famiglia** mai. Se perdi la palla mentre tieni PASSA, il disco si spegne, il rilascio non fa niente, e non nasce mai un verbo a sorpresa.

**R3 — Con la palla, il gioco propone e il dito dispone.** Nessun verbo irreversibile parte da un touchstart in possesso. L'anteprima è obbligatoria: **se non è dipinta, l'atto non è lecito.**

**R4 — Il verbo è funzione di uno stato del mondo, mai di una soglia sull'orologio degli eventi** (M4). E la variante forte: **il gioco onora solo ciò che ha mostrato** — uno stato che non è stato dipinto per almeno un fotogramma non può essere letto al rilascio.

**R5 — Il margine di guardia sul bersaglio.** Ogni volta che il gioco sceglie fra candidati, calcola i primi due. Se `punteggio₁ − punteggio₂ < δ`, **non sceglie il contestato**: prende il bersaglio **BASE** della famiglia (per il passaggio: il più smarcato; per il cambio: il ciclo per angolo). Un quasi-pareggio significa che l'intenzione non è stata espressa: si onora la scelta sicura, non si tira un dado.

La levetta **inclina, non sbarra** — è la lezione del 71% di coni vuoti:

```
punteggio(q) = punteggioBase(q)  +  K · dot(q) · |levetta|
```

`punteggioBase` è quello che il gioco già calcola (`smarcato` + avanzamento·0,9 − |dist−170|·0,4). Con **K = 220**, la levetta a fondo corsa sposta fino a 440 punti: sopra il p90 del margine misurato a 11 contro 11 (382,4) e sotto il massimo (689,6). Tradotto: **la levetta ribalta la preferenza automatica in circa nove stati su dieci; nel decimo la preferenza di base è così netta che il gioco la difende — e l'anello che non si sposta te lo dice.**

Il **filtrante** (la tenuta, che gioca nello spazio) ha invece bisogno di una direzione vera, e il cono si stringe con la taglia perché i candidati misurati crescono:

| taglia | dot minimo | apertura | perché |
|---|---|---|---|
| 5 | **0,25** | ±75,5° | a 60° il cono è vuoto nel **71%** delle direzioni |
| 7 | **0,50** | ±60° | com'è oggi: 39,5% vuoti, mediana 3 candidati |
| 11 | **0,80** | ±36,9° | a 60° cadono fino a **9** compagni, mediana 4 |

E **cono vuoto non significa silenzio**: si gioca il passaggio base, e l'anteprima l'aveva già detto.

`δ` non lo invento io: **lo fissa il cancello** (§8), come il valore più grande che tiene le ricadute ≤12% rispettando il tetto sui ribaltamenti. Valore di partenza `δ₀ = 20` (un terzo del margine mediano misurato a 5 contro 5, 61,1).

**R6 — Fra famiglie in conflitto vince quella che perde meno.** Costo dell'errore, in ordine: `possesso perso` > `fallo` > `gesto sprecato` > `niente`. Quindi, a parità: tiro/passaggio → **passaggio**; scivolata/contenimento → **contenimento**; cross/filtrante → **filtrante** (rasoterra, recuperabile); chiamata/appoggio → **appoggio**.

**R7 — Un dito per disco, e nessun doppio tocco esiste.** Il secondo dito sullo stesso disco è ignorato (non messo in coda). Poiché **nessun verbo dello schema usa il doppio tocco**, un doppio tocco accidentale non può inventare un verbo: al peggio ripete.

**R8 — Il flick batte la tenuta.** Se durante una tenuta arriva un flick della levetta (altro dito), il flick esegue e la tenuta si annulla — il flick è l'unico gesto con una finestra temporale, e chi ha una finestra ha la precedenza.

**R9 — La sfumatura cambia l'inchiostro, mai il collaudo del tocco.** Un comando sbiadito da `scartoHUD` si preme lo stesso. Oggi è così (`Touch5.start` non legge `alpha`): è giusto e non va rotto.

**R10 — Cambio di scena = tutte le tenute chiuse.** Gol, moviola, ripresa, pausa: `chiudiAnticipo` su ogni carica aperta, i compagni chiamati rientrano.

---

## 6. I CASI LIMITE

**Dito che scivola.** Landing: anello di esclusione `r+18` (già pagato). Durante la pressione: l'annullamento chiede **56 px di percorso** ≈ 9 mm — uno scivolamento di 30 px non annulla niente. Fra i due dischi corrono 94,76 px: trascinare dall'uno all'altro annulla sempre e non attiva mai il secondo.

**Tocco doppio accidentale.** Nessun verbo lo usa: strutturalmente non può produrre un'azione diversa. Due `touchstart` sullo stesso disco entro 250 ms → il secondo è scartato.

**Il browser che fonde i touchmove.** Questo file l'ha già pagato una volta (righe 8882–8896) e la sicura resta com'è. Due cose nuove:
- **La durata non è più esposta.** Vive sull'orologio della simulazione (`p.charge += dt` dentro `step()`, come già fa il tiro alla riga 9920): il browser può fondere i movimenti, non può fondere l'accumulatore. Sotto carico l'anello, la lancetta e la corsa del compagno rallentano **insieme**, quindi il gesto resta imparabile anche quando l'orologio è sbagliato. Sotto i 10 fotogrammi al secondo l'accumulatore butta tempo (`if(n===6) acc=0`, riga 28747) e il gioco intero rallenta: il giocatore lo vede.
- **Il fallimento del flick cambia di segno.** Oggi un flick perso diventa un rilascio, e un rilascio è un passaggio: si perde il possesso. Con il rilascio inerte, un flick perso diventa **niente**: si tiene il pallone e si riprova. È un guadagno gratuito che arriva dal §3.

**Mani grandi.** Un pollice da 25 mm copre ~150 px CSS. I due dischi passano tutte e quattro le soglie (Apple 44, Material 48, Parhi 9,2 mm, NN/g 10 mm): prese da 100 e 80 px. **La bussola no: è larga 92 px, cioè il pollice la copre tutta.** Per questo la bussola **non seleziona uomini, seleziona angoli** — il vettore dal pallino del pallone al punto toccato dà una direzione, e si prende il compagno la cui direzione attorno al pallone è più vicina. È la stessa ordinatura che `cambiaGiocatore` già usa (per angolo, riga 9962): il ciclo diventa accesso diretto. Guardia: se due compagni cadono entro **22,5°** (mezzo settore di Kurtenbach) → ricade sul ciclo. E qualunque movimento oltre 12 px fa nascere una levetta al punto di posa, con zero latenza: nella bussola non si perde niente.

**Schermo piccolo.** La geometria è ancorata agli angoli e regge. Ma il settore angolare della bussola si restringe con lei (`k = max(0.9,(VW−258)/88)`): **sotto VW 640 la bussola smette di essere un ingresso** e torna solo bussola. Il ciclo resta, e il gioco non perde un verbo.

**Mancino.** Specchiare è **tre punti, non uno**, e chi ne dimentica uno si ritrova i dischi sopra la bussola: (a) `touchBtnLayout` riga 8772 → `const right = (G.mode===2)?(t===1):!SAVE.mancino;`; (b) la bussola, `mx = 12` → `VW−12−mw` (riga 24936); (c) la casa riservata del pollice dentro `drawMinimappa`, `lvX0/lvX1` centrati su 96 → `VW−96` (riga 24982).

**Due giocatori a schermo diviso.** `teamOf` divide a metà (riga 8812) e la bussola è una sola, a sinistra, cioè nella metà del giocatore 1. **Nel 2 giocatori la bussola non è un ingresso per nessuno**: darla a uno solo sarebbe un vantaggio. Dichiarato, non dedotto a runtime.

---

## 7. COSA QUESTO SCHEMA NON PUÒ FARE

1. **Niente skill move, niente secondo stick, niente quinta direzione di flick.** Il pollice destro è già la colonna dei due dischi, e il tetto misurato dalla ricerca (3–4 pulsanti, 4 direzioni) non si sfonda.
2. **Niente portiere comandato.** Non lo compro: è un secondo uomo per un pollice già occupato.
3. **Niente colpo di testa, niente duello aereo.** Vivono sull'asse Z, il solo che questa camera comprime.
4. **Il pollice destro fa una cosa per volta.** Non si contiene e si cambia uomo insieme.
5. **La mira degrada con la taglia, e l'ho misurato.** A 11 contro 11 il bersaglio automatico si ribalta fra due fotogrammi adiacenti nel 5,5% dei casi (contro 0,4% a 5) e in un cono da 60° cadono fino a 9 compagni. Lo schema stringe il cono, ma **non renderà l'11 contro 11 preciso quanto il 5 contro 5**.
6. **Il margine di guardia rende il ribaltamento raro, non impossibile.** Dentro δ la scelta resta quella base, che a volte non sarà quella voluta.
7. **Non insegna niente a chi non tiene mai un disco.** Quel giocatore ha il pavimento del §3, e va bene così — ma la metà nuova del vocabolario resterà chiusa, e nessuna misura di questo progetto dirà quanti giocatori la aprono.
8. **Non misura il divertimento.**
9. **Il costo vero non è la CPU: è l'inchiostro.** Ogni anteprima è un segno sul manto, e questo file ha già pagato che una pastiglia semitrasparente stesa sull'erba viene letta come **ombra** dagli strumenti (`zoneInterfaccia`, `istantanea.js`). Quindi: ogni anteprima nuova o sta **sotto 0,15 di alfa**, o va **dichiarata in `zoneInterfaccia`** col suo riquadro e la sua alfa. Preferire i segni **attaccati a una figura** (anello ai piedi), perché gli strumenti già escludono una scatola attorno alle figure. **L'occupazione risultante non l'ho misurata.**
10. **Non ho provato niente su un telefono vero, e nessuna persona ha giocato questo schema.**

---

## 8. COME SI MISURA CHE FUNZIONA — tre cancelli, e perché la via corta è chiusa

Regola comune a tutti e tre, ed è la risposta alla trappola numero uno di casa: **ogni cancello legge un EFFETTO nella simulazione — chi ha davvero ricevuto il pallone, chi ha davvero accelerato, `p.slide` acceso, `stats.*` — e mai una bandiera scritta dal risolutore dell'ingresso.** Un contatore dell'ingresso attesterebbe che l'input è stato interpretato; solo l'effetto dice che il gioco ha fatto la cosa.

### C1 — CENSIMENTO DELL'AMBIGUITÀ (tre numeri che si tirano l'un l'altro)
≥800 stati veri per taglia, partite a seme fisso.
- **A · Ribaltamento** — quota di campioni in cui il bersaglio **eseguito** cambia fra due fotogrammi adiacenti. Soglia: **≤2%** a 5 e 7; **≤5,5%** a 11 (è il valore misurato oggi: il cancello chiede di non peggiorare, non di battere un numero che nessuno ha ancora provato a battere).
- **B · Ricadute** — quota di rilasci che finiscono sul bersaglio base per margine di guardia. Soglia: **≤12%**.
- **C · Distinzione** — quota di stati in cui almeno due direzioni di levetta selezionano due compagni diversi. Soglia: **≥90%** (misurato oggi: 100% a tutte e tre le taglie — serve solo a impedire una regressione).

**Via corta chiusa:** A si azzera allargando δ, e allora B esplode. B si azzera stringendo δ, e allora A esplode. A e B si soddisfano insieme scegliendo sempre lo stesso compagno, e allora C crolla. I tre numeri stanno nello stesso cancello e non si comprano l'uno con l'altro.

### C2 — IL DITO ALZATO E IL FLICK SOTTO CARICO (due numeri opposti)
- **A · Calci da rilascio = 0** su 200 rilasci di levetta senza flick in stati veri. *(Misurato oggi: 34 su 50, cioè il 68%.)*
- **B · Flick riconosciuti ≥ del valore di oggi**, misurato nello stesso banco a 1×, 4× e 6× di CPU rallentata: 200 flick verso la porta col pallone devono produrre almeno tanti `stats.tiri` di quanti ne produce il gioco attuale.

**Via corta chiusa:** A si azzera rendendo inerte l'intero ramo del rilascio — e allora B crolla. B si difende abbassando la soglia dei 650 px/s — e allora un rilascio lento ridiventa un flick e A risale.

### C3 — LA TENUTA NON DEVE MENTIRE (la *direzione* dell'errore, non solo il tasso)
Per ciascuna delle quattro caselle disco×contesto, 200 tap (90 ms) e 200 tenute (400 ms), a 1×/4×/6×.
- **A · Nessun verbo irreversibile da una lettura sbagliata.** `tenute lette come tap ≤1%` sul GRANDE-senza-palla (una tenuta letta come tap è una scivolata non voluta, cioè un fallo possibile) e sul PICCOLO-con-palla (un filtrante non voluto è un possesso perso).
- **B · La direzione dell'errore è dichiarata e verificata**: sotto carico l'errore deve andare **verso lo stato** (tap→tenuta), mai verso l'atto. È già misurato che a 6× l'errore va in quella direzione (23 tap su 24) — cioè dalla parte **giusta** per il grande senza palla e dalla parte **sbagliata** per il piccolo con palla. **Ed è esattamente per questo che il verbo del piccolo si legge dallo stato del compagno (partito o no) e non dalla durata.** Il cancello verifica che quella scelta tenga: a 6× le `stats.filtranti` non devono crescere sui tap.
- **C · Letto sull'effetto**: `stats.filtranti`, `p.slide>=0` sul comandato, il compagno che ha davvero accelerato. Mai un contatore dell'ingresso.

**Via corta chiusa:** si azzerano gli errori mettendo la soglia a 0 (tutto tenuta) o a ∞ (tutto tap), ma i due conteggi opposti stanno nello stesso cancello e uno dei due andrebbe a 100%.

**Avvertenza sul banco, e non è un dettaglio:** `strumenti/giocata.js` dichiara di chiedere al gioco dove sono i pulsanti con `__test.pulsanti` (riga 395) — **ma `__test.pulsanti` non esiste**: il gioco esporta `comandiTouch`. Il ripiego scatta e lo strumento preme le coordinate d'archivio `(vw−66, vh−140) = (849, 272)` e `(vw−70, vh−232) = (845, 180)`. Misurato: i centri veri sono (851, 352) e (757, 340), cioè **80,0 px e 182,6 px di distanza**, fuori sia dalla presa (50/40) sia dall'esclusione (58/48). Oggi quel cancello **preme il prato e fa nascere una levetta**. Va riparato (una riga: leggere `comandiTouch`, oppure esportare `pulsanti`) **prima** che i tre cancelli qui sopra ne riusino il banco, o si misura la levetta credendo di misurare i pulsanti.

---

## 9. DOVE SI TOCCA IL FILE

| cosa | dove |
|---|---|
| etichetta `FILTRANTE` → `PASSA`, seconda riga di stato | `touchBtnLayout`, righe 8771–8805 |
| il piccolo risolve al **rilascio**; annullamento a 56 px; percorso accumulato per dito | `Touch5.start/move/end`, righe 8815–8871 |
| rilascio della levetta **inerte** (via `if(carrying) doPass(t)`) | `Touch5.release`, riga 8948 |
| flick all'indietro = ferma palla (nuovo ramo prima del passaggio forte) | riga 8945 |
| bersaglio con bias della levetta + margine di guardia δ | `eseguiPassUmano` 9090, `eseguiFiltrante` 9143, `smarcato` 9076 |
| cono che si stringe con la taglia (0,25 / 0,50 / 0,80) | riga 9160 |
| cross sul bersaglio invece che sul secondo palo | `doCross`, righe 9187–9199 |
| filtrante a scavalcare nella propria metà | riga 9130 |
| tiro di precisione | `releaseCharge` 9237, `tiroVelocita` 9302 |
| contenimento umano | `p.contieni`/`standoff` 11726–11742, `updatePlayerFisica` 10372 |
| chiamata in profondità (un campo per giocatore + un ramo) | `aiDecide` 11647–11720 |
| raddoppio comandato | `teamBrain` 11545, ruolo `raddoppio` 11758–11770 (gira a 4 Hz) |
| bussola come ingresso ad angolo | `MINI_RECT` 25001/25128, `Touch5.start` 8815, `cambiaGiocatore` 9956 |
| specchio mancino | 8772 · 24936 · 24982 |
| anteprime dichiarate | `zoneInterfaccia`, riga ~30240 |

**Costo macchina, e va detto che è una stima.** Il risolutore gira una volta al touchstart e una volta per fotogramma durante una tenuta: una scansione su ≤10 compagni. La chiamata in profondità aggiunge un campo per giocatore e un ramo dentro `aiDecide`, che gira già per ogni uomo. Il raddoppio vive in `teamBrain`, che gira a 4 Hz. Le anteprime sono 2–3 tracciati. Contro i 22,96 ms del riferimento di banco (`strumenti/prestazione-base.json`) è rumore — **ma è un conto di operazioni, non un cronometro**, e l'unico confronto onesto è `node strumenti/prestazione.js --contro HEAD`.

**Il rischio vero non è il tempo: è il bit.** Contenimento, chiamata, raddoppio e bias del passaggio cambiano la simulazione al bit e rompono ogni banco a seme fisso finché i riferimenti non si rifanno. Vanno introdotti in quest'ordine — prima le tre cose che **non** toccano la simulazione (rilascio inerte, annullamento, bussola), poi le altre, una per volta e con i riferimenti rifatti in mezzo.

---

## 10. COSA NON HO VERIFICATO

1. **Niente su un telefono vero.** Chromium headless, 915×412, dpr 2.
2. **La misura M4 è contaminata dal banco.** Gli eventi sintetici partono da Playwright attraverso CDP, che il rallentamento della CPU frena anche lui: i 271 ms mediani a 6× sono un **limite superiore**, non la latenza della pagina. Su un telefono vero `event.timeStamp` porta l'ora dell'evento e non quella della consegna — **non l'ho potuto verificare**, perché un `TouchEvent` sintetico si data alla costruzione. La direzione dell'errore (tap→tenuta) regge comunque, ed è quella che ho usato per decidere.
3. **Il contesto "senza palla" della misura M1 non l'ho potuto forzare** (il portatore riprende la palla nel fotogramma successivo): le etichette CONTRASTA/CAMBIO le ho **lette** in `touchBtnLayout`, non fotografate. La geometria è la stessa nei due contesti perché x/y/r non dipendono dal possesso.
4. **La perdita di possesso dovuta al rilascio non è misurata**: 10 su 50 col dito, 2 su 10 senza dito nello stesso stato — indistinguibili. Ho misurato che il rilascio **emette un calcio**, non che quel calcio **costi**.
5. **Il 71% di coni vuoti è su otto direzioni uniformi**, non sulle direzioni che un giocatore sceglierebbe: è una frequenza di coppie (stato, direzione), non di tentativi veri. Dice che una direzione distratta non produce niente e non lo dice; non dice che il filtrante fallisca sette volte su dieci.
6. **Il punteggio del passaggio l'ho ricopiato** dal gioco invece di chiamarlo (non è esposto): una divergenza fra la mia copia e le righe 9076–9101 falserebbe l'intero censimento M3.
7. **Non ho misurato il costo per fotogramma di nulla**, né l'occupazione dell'interfaccia che le anteprime aggiungono — che è il costo vero (§7.9).
8. **Non ho misurato quanti giocatori scoprono la tenuta.** È l'ipotesi su cui poggia metà del vocabolario, e nessuno dei tre cancelli la prova: si prova solo con delle persone.
9. **δ e K sono valori di partenza derivati dalle mie misure (20 e 220), non tarati.** Il cancello C1 li deve fissare. Chi li scrive nel gioco senza far girare C1 commette il ventitreesimo caso.