I have the frames, the code, and my own measurements. Writing the report now.

# Cosa fa leggere FC 25 come AAA, e cosa se ne può prendere in un 2D dall'alto

## 0. Cosa ho fatto, e cosa NON ho verificato

Ho letto gli otto fotogrammi veri (`C:/Users/Utenteee/Desktop/GitHub/games/istantanee/istante-01..08.png`, 1830×824 px di periferica) più i tre ritagli `z-maglia.png`, `z-tira.png`, `z-hud.png`. Poi ho **misurato i pixel** invece di fidarmi dell'occhio, con due strumenti nuovi che ho scritto oggi e che non toccano il gioco:

- `C:/Users/Utenteee/Desktop/GitHub/games/_aaa-misura.js` — gamma tonale del manto, periodicità della rasatura, contrasto locale, alte luci, gradiente alto/basso
- `C:/Users/Utenteee/Desktop/GitHub/games/_aaa-misura2.js` — densità e tinta delle ombre, larghezza del bordo d'ombra

**Quello che non ho verificato, e che nessuno in questo progetto ha verificato:** *non esiste una sola misura di tempo-fotogramma su un telefono vero.* `strumenti/prestazione.js:12-16` dichiara che il banco «disegna SENZA SCHEDA GRAFICA, in software» e segna già 26 ms a vuoto; `android/verifica.py` non misura fotogrammi (controllato: contiene solo `dice()` e `sha()`). Quindi **ogni millisecondo citato in questo rapporto è del banco software, non del telefono**, e ogni mio costo è espresso in *pixel riempiti* e *chiamate di disegno*, non in millisecondi. Chi userà questa lista deve misurare in appaiata prima di credermi.

Le misure delle **divise** le ho scartate: la famiglia di tinta blu si confonde con la minimappa e con la folla in ombra, e la rosa con la scritta «CPU» dell'HUD. Il numero c'era ma era sporco, quindi non lo scrivo.

---

## 1. Il vocabolario della resa AAA — cosa fa FC 25 e cosa comunica

| voce | cosa fa FC 25 | cosa comunica davvero |
|---|---|---|
| **Illuminazione** | ora del giorno dinamica che cambia *durante* la partita; ray-traced ambient occlusion in modalità risoluzione a 30 fps; l'illuminazione dello stadio cambia con ora e meteo | che esiste **una** sorgente, e che tutto nel quadro obbedisce alla stessa |
| **Materiali** | tessuti e capelli con texture dedicate in "Enhanced Visuals"; maglie che si bagnano | che due oggetti diversi rispondono **diversamente** alla stessa luce |
| **Profondità di campo** | sfocatura selettiva nelle cutscene e nei replay | dove devi guardare, deciso dal regista |
| **Motion blur** | scia sulla palla e sugli arti veloci | la velocità come **quantità continua**, non come posizione che salta |
| **Particellari** | zolle, spruzzi d'acqua, coriandoli, fumo dei fumogeni | che il mondo è *materia*, non decalcomanie |
| **Erba** | rasatura a bande, usura che si accumula in carriera fino a chiazze marroni a fine stagione | che quel campo ha una **storia**, non è un asset |
| **Ombre** | proiettate dalle quattro torri, morbide lontano e dure al contatto | dove poggia ogni cosa, in tre dimensioni |
| **Riflessi** | ray tracing su maglie e pozzanghere | che l'aria fra la camera e l'oggetto è un mezzo fisico |
| **Presentazione** | intro pre-partita con musica e pirotecnica; mascotte; reazioni della folla legate agli eventi; cartelloni, bandierine e pali sono **oggetti solidi** | che sei dentro un evento, non dentro un livello |
| **Camera** | quattro preset di replay (Broadcast, HyperMotion, 360, Drone); POV del giocatore sui piazzati oltre a quello dell'arbitro | che c'è **un regista** che decide l'inquadratura, e cambia idea |
| **Tipografia** | un solo sistema tipografico applicato dal menu alla scritta sul campo | che l'interfaccia è stata *progettata*, non assemblata |
| **Interfaccia diegetica** | tabelloni LED reali, cartelloni, cartello del quarto uomo | l'informazione che vive **nel** mondo invece che sopra |
| **Transizioni** | stinger a pannelli di erba che coprono il quadro e rivelano la scena dopo | che i pezzi sono cuciti, non concatenati |
| **Ripetizioni** | Highlighter, timeline editing, filtri, **inquadrature diverse dal gioco** | che la stessa azione ha più di un punto di vista |

La cosa da estrarre da questa tabella non è nessuna delle voci in sé. È che **dieci voci su quattordici non parlano di poligoni**: parlano di *coerenza* (una sola luce, un solo sistema tipografico, un solo mondo) e di *regia* (qualcuno decide dove guardi). Nessuna delle due costa poligoni, e nessuna delle due è preclusa a un 2D dall'alto.

---

## LISTA A — quello che un 2D dall'alto non può avere. Detto una volta, e chiuso.

1. **Volti, mimica, capelli, sudore.** A 91 px per uomo la testa è ~14 px. Non è una questione di tecnica: è che non c'è superficie. Chiuso.
2. **Profondità di campo vera.** In una vista dall'alto ogni cosa è alla stessa distanza dalla camera: non esiste un piano focale da cui allontanarsi. La cugina legale è il *tilt-shift* (sfoca alto e basso del quadro), ma in canvas 2D vuol dire `ctx.filter:blur` su fasce a schermo intero, e il filtro Gaussiano di canvas forza la rasterizzazione software — è la stessa famiglia di costo che in questo file valeva 6,8 ms per fotogramma (`CALCETTO-il-gioco.html:21925`). Chiuso: non paga.
3. **Riflessi speculari geometrici** (le torri faro specchiate su una pozzanghera, con la giusta prospettiva). Servono un G-buffer e una profondità. Chiuso. *(Il velo lucido diffuso NON è chiuso: sta in B17.)*
4. **Occlusione ambientale calcolata.** Serve una profondità per pixel. Chiuso. *(L'ombra di contatto dipinta a mano non è la stessa cosa e non è chiusa: sta in B6.)*
5. **Materiali che rispondono alla luce.** Tessuto anisotropo, pelle con diffusione sotto la superficie, cuoio lucido: sono modelli di superficie, e qui le superfici sono riempimenti piatti. Chiuso.
6. **La grammatica della camera bassa.** Tutto ciò che FC ottiene con l'orizzonte — corpi che si occludono in profondità, la tribuna come fondale, lo scorcio, il "tele broadcast" — richiede la terza dimensione nella proiezione. Dall'alto non c'è orizzonte. Chiuso, ed è la rinuncia più grande delle sei.
7. **Animazione da cattura di movimento** (HyperMotion, oltre 1.800 giocatori catturati) con fusione contestuale. Chiuso: qui le pose sono clip di un rig procedurale, e il numero di clip è il budget.
8. **Folla di cinquantamila individui.** Chiuso.
9. **Volumetrie**: coni di luce nell'aria sotto i fari, raggi di sole fra le travi, nebbia. Dall'alto un cono di luce non ha spessore visibile: si vede solo la pozza a terra, che infatti è quello che il gioco già fa (`drawFari`). Chiuso.
10. **HDR, TAA, upscaling a 4K.** Chiuso.
11. **Identità reale** — stadi fotogrammetrati, volti, stemmi, inni. Chiuso due volte: per tecnica e per la regola del copyright.

---

## LISTA B — quello che un 2D dall'alto PUÒ avere e che oggi manca o è debole

Ordinata per **resa diviso costo**. I primi sei costano quasi zero a fotogramma e valgono più di tutto il resto messo insieme.

Riferimento di scala per tutti i costi: il quadro è **1.507.920 px di periferica** (1830×824); la camera di gioco vale **2,236 px di periferica per unità di mondo** (`CALCETTO-il-gioco.html:21935`); una figura è alta ~91 px.

---

### B1 — La luce non tocca gli uomini. Il prato è alle sette di sera, i corpi sono a mezzogiorno.

**Cosa manca.** Un impianto di illuminazione che illumini *anche i giocatori*.

**Cosa si vede oggi.** In tutti e otto i PNG il manto ha la sera addosso e le figure no. Non è un caso, è scritto: il velo della sera è dichiarato **«STA SOTTO LE FIGURE apposta: il prato scende, i corpi no»** (`CALCETTO-il-gioco.html:22007`), e vale fino a 0,55 di alfa. Le quattro pozze dei fari sono dipinte a terra da `drawFari` (`CALCETTO-il-gioco.html:21669`) e nessuna tocca un corpo: `rigLook` (`CALCETTO-il-gioco.html:23971`) restituisce le tinte della divisa senza leggere né l'ora né la posizione nel campo di luce. In `istante-07` e `istante-08` si vede benissimo: una grande pozza chiara sul prato, e il giocatore #7 che ci cammina dentro con esattamente la stessa maglia che ha nell'angolo buio. Il modello di luce è già scritto e documentato per il manto (`CALCETTO-il-gioco.html:16073-16132`, quattro modi di impianto, direzione unica (0,94 · 0,34)); si ferma alle caviglie.

**Come si fa in canvas 2D.** La stessa funzione che dà la luce a terra in un punto (già esistente) restituisce un fattore *k* per il giocatore. Due strade, in ordine di costo:
- *(minima)* dopo aver disegnato il corpo, un `fillRect` della sola scatola della figura (circa 30×46 unità = **67×103 px di periferica**) nella tinta del velo, con alfa `0,55·(1−k)`. Una sola chiamata per figura.
- *(migliore)* si passa *k* dentro `rigLook` e si moltiplicano le tinte alla sorgente: **costo zero di disegno**, solo aritmetica su 3-4 colori per figura.

**Costo.** La via migliore: ~12 moltiplicazioni per figura, cioè **niente**. La via minima: 10-22 fillRect da 7.000 px = **≤154.000 px, il 10% del quadro**, e senza cambi di stato del contesto.

**L'ostacolo vero non è il costo, è il cancello.** Il velo sta sotto le figure per proteggere il contrasto maglia/manto (3:1). Scurendo i corpi il rapporto si stringe. La contromossa è B6: **si sposta il contrasto dal riempimento al bordo**. Un corpo scuro con un filo di luce dalla parte del sole si stacca *più* di un corpo chiaro su erba chiara — e in più è vero.

---

### B2 — La moviola è la stessa inquadratura, più lenta e più grigia.

**Cosa manca.** La regia. In FC il replay è **un altro punto di vista** (quattro preset: Broadcast, HyperMotion, 360, Drone). Qui è lo stesso.

**Cosa si vede oggi.** Non si vede nei PNG (nessuno degli otto è una moviola) — si legge nel codice, e devo dirlo: **questa voce l'ho dedotta dal codice, non l'ho vista girare.** `updateCamera` tratta `G.moviola` esattamente come il gioco (`CALCETTO-il-gioco.html:20167`: `if(!(inPlay || G.moviola)...`), quindi il replay usa la camera d'inseguimento normale. `drawMoviola` (`CALCETTO-il-gioco.html:27863`) aggiunge bande nere all'8% dell'altezza, un velo di desaturazione al 15% e la polilinea della traiettoria. Sono tre cose buone. Ma l'inquadratura è quella di prima.

**Come si fa in canvas 2D.** I fotogrammi sono già in memoria (`M.frames`). La camera del replay è un *altro* insieme di `(x, y, z)` calcolati sugli stessi dati: (a) partenza stretta sul tiratore a `S2_MAX`, (b) carrellata che segue la palla, (c) allargamento sull'esito. Più una rampa di velocità (lento all'impatto, veloce prima e dopo) invece della riproduzione a passo fisso.

**Costo.** **Zero pixel in più, zero chiamate in più.** Sono numeri diversi passati alla trasformazione che c'è già. È la voce col miglior rapporto resa/costo dell'intera lista, e non ha nemmeno bisogno di un cancello nuovo per essere provata: basta guardarla.

---

### B3 — Il manto è una tinta sola. Misurato.

**Cosa manca.** La macro-luce: la variazione lenta e larga di valore che dice «questo prato è illuminato da qualcosa».

**Cosa si vede oggi.** Misurato sugli otto PNG, sui soli pixel in famiglia-manto (mediane):
- luminanza relativa **p05 = 0,204 · p50 = 0,239 · p95 = 0,305** → fra il 5° e il 95° percentile ci sta un rapporto di **1,49:1**. Tutto il prato vive in mezzo stop.
- gradiente fra metà alta e metà bassa del quadro: **1,013** — cioè **zero**. Nessuna prospettiva aerea, nessuna caduta di luce lungo la profondità.
- quota di quadro sopra Y 0,55: **1,83%**, e a occhio sono l'HUD, il gesso e la palla.

Il modello dell'impianto misura sulla propria griglia «centro 1,89 unità di luce, angolo 0,30» (`CALCETTO-il-gioco.html:16093`) — un rapporto 6,3:1 nel modello, che sullo schermo arriva come 1,49:1 su tutto il quadro. Fra il modello e i pixel c'è un fattore quattro che si perde.

**Come si fa in canvas 2D.** Si cuoce dentro `fieldTex`. La tessitura del manto è già cotta una volta (`buildFieldTex`) e già trasferita con **una sola** `drawImage` per fotogramma. Aggiungere alla cottura una passata di macro-luce a bassissima frequenza (una tessitura 64×32 stirata sopra, in `multiply`, **durante la cottura**) porta il rapporto dove si vuole.

**Costo.** **Zero px in più e zero chiamate in più a fotogramma.** Costa qualche millisecondo *una volta*, alla cottura — e va sorvegliato solo perché la cottura ricade dentro l'avvio, che è già sopra il tetto di 2 s (`PUNTO-DEL-LAVORO.md`, voce 4: 2870 ms).

**Attenzione, e va detto per intero:** la mediana del manto è il denominatore di quasi tutti i cancelli di contrasto di questo progetto. Allargare la gamma tonale del prato **allarga la dispersione** di quel denominatore e rende più rumoroso `collaudo.js`. Non è un argomento per non farlo: è la ragione per cui va fatto **prima** una misura appaiata dei quattro rapporti maglia/manto.

---

### B4 — La rasatura c'è, e ho misurato che è invisibile. È un cancello superato togliendo la cosa.

**Cosa manca.** Le bande di taglio del prato — che nel broadcast sono uno dei tre segnali che dicono «campo vero» in mezzo secondo.

**Cosa si vede oggi.** L'analisi periodica delle colonne di luminanza sui soli pixel di manto trova, in **tutti e otto** i fotogrammi, un periodo dominante di **105-119 px di periferica** (mediana 110). A 2,236 px per unità sono **49,2 unità**: è esattamente il passo di rasatura dichiarato nel file (48 unità, `CALCETTO-il-gioco.html:6673`). La rasatura **esiste ed è alla frequenza giusta**. L'ampiezza però è **0,0307 relativa** — cioè **6,1% picco-picco di luminanza**. Sui PNG, a occhio, non si vede.

E il perché è scritto nel file, con onestà, in quattro riquadri di commento consecutivi (`CALCETTO-il-gioco.html:6609-6689`): la giuria ha chiesto «delta fra due strisce adiacenti sotto il 10%», il gioco stava a 28,6%, e in due tarature il pigmento è sceso a **2,0%** e il passo è stato dimezzato da 88 a 48 unità *proprio per ridurre il delta*.

**Questa è la regola 2 di casa, colta sul fatto.** Il cancello è stato superato per la via più corta — cancellare la rasatura — e la cosa che il cancello rappresentava («il prato non deve avere due verdi diversi») non è arrivata: è arrivato un prato che non ha nemmeno *un* verde pettinato.

**Come si fa in canvas 2D.** La rasatura vera non è pigmento, è **riflesso anisotropo**: la stessa erba, pettinata in due versi, rimanda diversamente la luce *radente*. Che è esattamente ciò che il file stesso aveva capito («la differenza la decide il RIFLESSO, non il pigmento», riga 6618) e poi ha implementato come due esadecimali. La forma giusta, tutta in cottura:
- il delta **non è costante**: è massimo dove la luce del modello è radente (a ponente, dove SOLE.dir è quasi orizzontale) e quasi nullo al centro delle pozze;
- il delta **non è un gradino**: è un profilo sinusoidale dentro la banda, così due campioni adiacenti non trovano mai lo scalino che il cancello misura.

**Costo.** **Zero a fotogramma** (tutto dentro `fieldTex`).

**Il lavoro qui non è di disegno, è di cancello.** Il metro attuale — «delta di luminanza fra due strisce adiacenti < 10%» — è un metro che *non può* distinguere una rasatura fatta bene da una rasatura assente. Va sostituito con qualcosa che misuri la cosa che si vuole: per esempio *ampiezza della prima armonica alla frequenza della rasatura*, con un **pavimento** oltre che un tetto. Il numero di oggi è 0,031: un tetto solo è verde su un prato liscio come una moquette.

---

### B5 — Ogni figura ha un alone chiaro attorno. È una bugia fisica, ed è girata dalla parte sbagliata.

**Cosa manca.** Il *rim light*: il filo di luce sul lato del corpo rivolto verso la sorgente. Ce n'è **una sola**, dichiarata, bassa a ponente.

**Cosa si vede oggi.** In `istante-03`, `istante-04` e `istante-05` ogni giocatore ha un alone pallido tutt'attorno, uniforme su 360 gradi. È `staccoTex`, disegnato a alfa 0,40 (0,20 su portatore e comandato), e il commento lo giustifica per leggibilità (`CALCETTO-il-gioco.html:24229-24270`). Funziona: le figure si staccano. Ma in una fotografia **niente ha un alone uniforme attorno**: è la firma visiva del rendering economico, la stessa cosa che fa sembrare un gioco per browser un gioco per browser. Il file l'ha già capito per la palla, e l'ha spento con tre argomenti tutti giusti (`CALCETTO-il-gioco.html:24565-24605`: «NON VENIVA DA NESSUNA PARTE… su un oggetto che l'occhio segue per novanta secondi c'era una lampadina»). Lo stesso ragionamento non è stato portato sui corpi.

**Come si fa in canvas 2D.** Si sostituisce la tessitura cotta, non la chiamata. Al posto di un anello radiale simmetrico, una tessitura **asimmetrica**: chiara e stretta sul quadrante di ponente (dove sta il sole), che si spegne verso levante, dove al suo posto scende un'occlusione scura e stretta ai piedi. Va ruotata di `SOLE.dir`, che è **costante** (0,94 · 0,34 su tutti gli otto campi, riga 16110) — quindi si può cuocere **già ruotata**.

**Costo.** **Zero netto.** È la stessa `drawImage` per figura che si paga già oggi, con dentro pixel diversi.

**Ed è la moneta che paga B1.** Un filo di luce vale, per lo stacco, molto più di un alone diffuso — e sposta il contrasto dal riempimento (dove il cancello 3:1 lo misura, e dove pagarlo costa realismo) al **bordo** (dove l'occhio lo compra, e dove è gratis).

---

### B6 — Le figure non hanno modellato: tinta piatta, contorno nero, nessun terminatore.

**Cosa manca.** Un lato illuminato e un lato in ombra sullo stesso corpo. È **la** cosa che separa una pedina da una persona.

**Cosa si vede oggi.** `z-maglia.png` a quattro ingrandimenti lo mostra senza appello: ogni segmento (busto, coscia, avambraccio) è **un riempimento piatto** più una toppa più chiara, chiuso da un contorno nero duro. Nessuna ombra propria: il braccio non proietta niente sul torso, l'ascella non è più scura della spalla, la testa non lascia niente sul collo. La luce del gioco è dichiarata bassa e laterale, e sul corpo non c'è traccia della sua direzione.

**Come si fa in canvas 2D.** Rig3D disegna già ogni posa come tracciato, e sa già gettarla come ombra (`Rig3D.ombraTraccia`, usata da `drawOmbreGiocatori:23724`). Si riusa la stessa traccia una seconda volta, **sopra** il corpo invece che a terra, spostata di ~1,2 unità verso levante e ritagliata sul corpo, a alfa ~0,22 nella tinta d'ombra già dichiarata `rgb(14,38,32)`.

**Costo.** Una seconda passata di traccia-posa **solo sulle figure vicine** (il ramo `vicino` esiste già: portatore + non-lontane, tipicamente 4-6 su 10-22). L'ordine di grandezza è il **raddoppio del costo delle ombre di quelle figure**. Riferimento di grandezza sullo stesso banco: mettere `multiply` sulle 22 ombre costava 5,8 ms (`CALCETTO-il-gioco.html:23665`) — **quel numero non è il costo di questa voce**, ma dice che la passata delle ombre è una voce di primo piano del bilancio e che questa va misurata in appaiata prima e non dopo.

**È la voce più cara della lista B, ed è anche l'unica che può da sola spostare il verdetto «pedine» → «persone».** Se ne va fatta una sola, io farei questa; se il costo la boccia, il ripiego che costa zero è B5.

---

### B7 — Il numero di maglia non ruota col corpo.

**Cosa manca.** Un numero cucito su una schiena, che è ciò che una vista dall'alto vede.

**Cosa si vede oggi.** In tutti gli otto PNG e nel ritaglio `z-maglia.png` ogni cifra è **perfettamente verticale rispetto allo schermo**, su corpi che corrono in sette direzioni diverse. Il numero è ancorato al torso (`Rig3D.torso()`, `CALCETTO-il-gioco.html:24349`) e disegnato dritto. È l'unico oggetto del quadro che dichiara di essere sopra la scena invece che dentro.

**Come si fa in canvas 2D.** Una `ctx.rotate(yaw)` attorno all'ancora. `drawPlayer` fa già `save/rotate/restore` per il rollio (riga 24331): si allarga quel blocco.

**Costo.** **Una rotazione per figura, cioè niente.**

**Il compromesso, dichiarato.** A imbardata sopra i 90° la cifra si rovescia e si legge peggio. Due opzioni: rotazione piena (massima verità), o rotazione limitata a ±60° (compromesso). **Non l'ho misurato** — servirebbe un provino cieco sull'identificazione del giocatore, che in questo progetto è il metodo che ha già spostato il lavoro tre volte.

---

### B8 — Il quadro non ha alte luci. 1,83%, e sono l'HUD.

**Cosa manca.** Gli speculari: i puntini bianchi che dicono che c'è una lampada accesa.

**Cosa si vede oggi.** Misurato: **1,83% dei pixel supera Y 0,55**, mediana sugli otto fotogrammi, ed è quasi tutto testo dell'HUD, gesso e palla. In una fotografia di calcio serale sotto i fari le alte luci ci sono sempre: sui parastinchi, sulle scarpe, sull'erba dove la luce è radente, sulla sommità del pallone.

**Come si fa in canvas 2D.**
- sul manto: **zero costo**, si cuoce dentro `fieldTex` una banda di erba controluce dalla parte del sole (è la stessa passata di B3);
- sui corpi: un tracciato minuscolo (3-4 unità) sulla scarpa/spalla rivolta al sole, **solo sulle figure vicine**.

**Costo.** Manto: zero. Corpi: **1 tracciato per figura vicina**, 4-6 al fotogramma, ognuno da poche decine di px. Sotto il rumore.

**Avvertenza dalla storia di questo file:** l'alone della palla è stato spento perché «emetteva luce». Uno speculare **non emette**: è la luce che c'è, rimandata. La differenza si misura — deve stare *dalla parte del sole* e sparire quando la figura gira.

---

### B9 — La palla è grande da quattro a sei volte il vero, ed è la bugia di scala più grossa del quadro.

**Cosa manca.** Il rapporto di grandezza fra un pallone e un uomo.

**Cosa si vede oggi.** Il file dichiara che il pallone è disegnato fra il **2,60% e il 3,40% della larghezza del quadro** (`CALCETTO-il-gioco.html:24588`), cioè **47,6-62,2 px di periferica** su 1830. L'uomo è alto ~91 px. Rapporto **0,52-0,68**. Il vero è 22 cm su 180 cm = **0,12**. La palla è **da 4,4 a 5,7 volte troppo grande**. Nei PNG si vede: in `istante-01` e `istante-03` il pallone è grosso quanto il torso del giocatore che lo insegue.

**Come si fa in canvas 2D.** Non si fa disegnandola più piccola e basta: sotto c'è un cancello («palla trovabile 8/8», diametro ≥ 1,8% del quadro). Si fa **sostituendo la trovabilità per grandezza con la trovabilità per contrasto**, che è la stessa strada già percorsa con successo quando è stato spento l'alone: il file misura oggi 3,81-4,63 volte la mediana del quadro con la sola tinta e il contorno cotto. Le leve residue sono la scia (c'è), l'ombra portata che si stacca con la quota (c'è, ed è bella), e la macchia di contatto (c'è). C'è margine per scendere.

**Costo.** **Negativo**: una palla più piccola costa meno pixel.

**Non lo consiglio come primo lavoro, e dico perché.** Il pallone è l'oggetto che l'occhio segue per novanta secondi; è l'unica cosa in questa lista che, se sbagliata, rompe il *gioco* e non l'*immagine*. Va fatto per gradi, con `_eventi.js` acceso, e con un provino cieco.

---

### B10 — Nessuna prospettiva. La camera dichiara 42 gradi e la proiezione è ortogonale.

**Cosa manca.** Il rimpicciolimento con la distanza.

**Cosa si vede oggi.** In `istante-04` il giocatore #2 in alto e il #8 in basso sono alti lo stesso numero di pixel, e così in tutti gli altri sette. La proiezione è ortogonale, e da una vista dall'alto è la scelta corretta *per il gioco*. Ma è anche la ragione per cui il quadro legge come uno **schema tattico animato** invece che come una ripresa: in una ripresa vera a 42 gradi la differenza fra il bordo alto e il bordo basso del quadro è ben visibile.

**Come si fa in canvas 2D.** Una scala per figura in funzione di `y`: `hb *= 1 + (p.y − cam.y)·ε`. Con ε tarato per dare ±5-6% dal bordo alto al bordo basso.

**Costo.** **Una moltiplicazione per figura.** Nulla.

**Rischio, e non è piccolo.** L'altezza della figura è un cancello (`istantanea.js`: «altezza figura 8/8») e la simmetria fra le due metà campo è un requisito di equità. Una scala per y **rende un uomo in area avversaria diverso da uno in area propria** — e sull'11 contro 11, dove la camera si apre, l'effetto raddoppia. Va misurato prima sull'equità, non sull'immagine.

---

### B11 — Niente resta. Il campo del 90° è quello del 1°.

**Cosa manca.** L'accumulo. FC 25 fa consumare il prato fino alle chiazze marroni di fine stagione; qui l'usura è **cotta nella tessitura**, uguale al primo e all'ultimo minuto.

**Cosa si vede oggi.** Le chiazze marroni nei PNG sono belle e sono statiche: in `istante-03` (65") e `istante-08` (30") le stesse macchie stanno negli stessi posti. E soprattutto: **la scivolata non lascia solco.** È il gesto più violento del gioco, e il campo non se ne accorge.

**Come si fa in canvas 2D.** Un secondo strato "segni" — una tessitura fuori schermo alla risoluzione di **1 px per unità di mondo** (il campo padded è ~1150×560 unità, cioè ~640 KB), su cui si stampano i solchi delle scivolate e le zolle, e che si dissolve lentamente. Si trasferisce con **una** `drawImage` sopra il manto.

**Costo.** **Una `drawImage` in più per fotogramma**, della stessa area del manto, cioè **fino al 100% del quadro**. È una voce vera, dello stesso ordine del trasferimento del manto — che su questo banco è la voce più cara che ci sia. Due mitigazioni obbligatorie: (a) si disegna **solo il rettangolo visibile**, la stessa tecnica già usata per il velo della sera (`CALCETTO-il-gioco.html:22011-22018`); (b) si salta del tutto quando lo strato è vuoto, che è la maggioranza dei fotogrammi — la stessa tecnica già usata per le schegge (`CALCETTO-il-gioco.html:24618`).

---

### B12 — Niente sfoca. Solo la palla ha una scia.

**Cosa manca.** La velocità come cosa continua.

**Cosa si vede oggi.** La scia della palla c'è ed è visibile (`istante-02`, `istante-06`: la linea bianca dietro il pallone). Su tutto il resto, niente: un uomo in scatto è nitido come uno fermo; quando la camera insegue un rinvio, il manto rimane tagliato col rasoio. Peggio: il file **disattiva apposta il filtro bilineare** sul manto per guadagnare 6,8 ms (`CALCETTO-il-gioco.html:21922-21962`), quindi il prato è *più* nitido di prima. Era la scelta giusta per il fotogramma, ed è la scelta sbagliata per la sensazione di velocità.

**Come si fa in canvas 2D.** Non con un filtro. Con **timbri**: sopra i 190 unità/s si ridisegna la figura 2 volte, arretrata di mezzo passo lungo la velocità, a alfa 0,18 e 0,09. Sulla palla la scia c'è già.

**Costo.** 2 passate di rig in più **per la sola figura in scatto** (di solito una, mai più di due o tre). Ordine di grandezza: **+20-30% del costo delle figure interessate**, zero cambi di stato. Da misurare in appaiata.

**Cosa NON fare, con il numero accanto:** una sfocatura vera a schermo intero. `ctx.filter:blur` forza il percorso software; su questo banco il solo *ingrandimento filtrato* del manto valeva 6,8 ms per fotogramma su un bilancio di 27,2.

---

### B13 — Presentazione: due tabelloni nello stesso fotogramma, e la barra sta al centro.

**Cosa manca.** Un sistema di presentazione, cioè un posto per ogni cosa e una cosa sola per ogni informazione.

**Cosa si vede oggi.** Le fondamenta sono buone e vanno riconosciute: la tipografia è **coerente**, due sole famiglie in tutto il file (Archivo Black e Barlow Condensed, `CALCETTO-il-gioco.html:137-144`); i cartelloni delle botteghe (CAFFÈ ORBITA, FERRAMENTA BEA, TRASPORTI DINO) sono **interfaccia diegetica vera**, cioè la voce che i concorrenti mobile non hanno mai; la fascia «TIRO PERFETTO!» in `istante-05` è un parallelogramma inclinato con sottolineatura, ed è grammatica broadcast corretta. Sopra queste fondamenta, quattro difetti che si vedono negli otto scatti:

1. **`istante-01`: due tabelloni nello stesso fotogramma.** La barra HUD in alto dice `0 — 85" — 0`; quaranta pixel sotto, il tabellone di legno appeso alla recinzione dice `0 · 0`. Uno dei due è di troppo, e quello di troppo è **quello sopra**: il diegetico è l'unica cosa che i concorrenti non possono copiare.
2. **La barra del punteggio è centrata.** Nessun broadcast al mondo mette lo score bug al centro del quadro: sta in un angolo, perché il centro è dove succede l'azione. Qui in `istante-02` e `istante-03` la barra copre esattamente la fascia dove il gioco si svolge.
3. **L'HUD mangia il protagonista, e i PNG lo provano.** In `istante-05` il pulsante CONTRASTA copre il portiere #6 e mezza porta; in `istante-07` copre i giocatori #6 e #9 nell'area. È il difetto 5 di `PUNTO-DEL-LAVORO.md`, dichiarato come «restano due casi nell'11v11» — negli otto scatti del 5 contro 5 io ne conto **due su otto**.
4. **La minimappa è un rettangolo grigio piatto** appoggiato sopra la folla, senza cornice, senza profondità, senza appartenere a niente. È l'elemento meno progettato del quadro.

**Come si fa in canvas 2D.** Nessuna tecnica nuova: sono decisioni. Spostare la barra in un angolo, spegnerla quando il tabellone diegetico è in quadro, ancorare i pulsanti a un margine che l'inquadratura garantisce, dare alla minimappa la stessa cornice di legno del tabellone.

**Costo.** **Zero.** È la seconda voce migliore della lista per resa/costo, dopo B2.

---

### B14 — La folla è tappezzeria.

**Cosa manca.** Che quella fascia scura sia gente.

**Cosa si vede oggi.** In `istante-01` e `istante-07`, le sole due inquadrature in cui la folla è in quadro, si vedono teste identiche su un reticolo regolare, tutte nella stessa famiglia di valore. *(Dichiarazione onesta: esiste `drawSpondaViva` e il registro dei commit parla di «folla che reagisce» nell'onda 4. Da due fermi immagine non posso dire se si muove. Quello che posso dire è che sta ferma **nella composizione**: stessa griglia, stesso valore.)*

**Come si fa in canvas 2D.** Tre cose, tutte in cottura: (a) sbandare la griglia di ±2-3 px per testa; (b) tre o quattro **blocchi** di colore squadra invece di una distribuzione uniforme — è così che si legge una curva; (c) una manciata di sagome più chiare in prima fila per dare profondità alla fascia.

**Costo.** **Zero a fotogramma** se la folla è già cotta a strisce; il costo è tutto nella cottura.

---

### B15 — Il gesso non prende la luce.

**Cosa manca.** Che la riga bianca sia bianca *sotto una lampada* e grigia *in ombra*.

**Cosa si vede oggi.** `gesso: '242,245,239'` (`CALCETTO-il-gioco.html:6720`), un solo valore per tutto il campo. In `istante-08` la linea di metà campo attraversa una pozza di luce e una zona buia con lo stesso identico valore. Anche l'usura è buona (le righe d'area spezzate in `istante-02` leggono come vernice consumata) ma è uniforme.

**Come si fa in canvas 2D.** Il gesso si dipinge dentro `fieldTex`, dopo la macro-luce di B3: si moltiplica per lo stesso campo di luce.

**Costo.** **Zero a fotogramma.** È letteralmente la stessa passata di B3.

---

### B16 — Nessuna transizione fra gli stati.

**Cosa manca.** Lo stinger. Nel broadcast, quando si passa da gioco a replay a pubblicità, **qualcosa copre il quadro** e rivela la scena dopo. Le bande della moviola sono un buon inizio; non c'è niente fra kickoff e gioco, fra gol e ripresa, fra fine primo tempo e secondo.

**Come si fa in canvas 2D.** Due parallelogrammi inclinati che spazzano il quadro in 0,25 s — la stessa forma già usata dalla fascia «TIRO PERFETTO!», quindi coerente per costruzione.

**Costo.** **Due `fillRect` trasformati, per la durata di ~15 fotogrammi.** Nel caso peggiore coprono il quadro: **1,5 Mpx per un quarto di secondo**, e a schermo coperto non si disegna il resto. Trascurabile.

---

### B17 — Nessun riflesso, e ce n'è uno legale.

**Cosa manca.** Il campo bagnato. È l'unico riflesso che una vista dall'alto può mostrare onestamente: l'erba bagnata rimanda la luce delle torri in un lobo speculare allungato, e **dall'alto si vede**.

**Cosa si vede oggi.** Le pozze dei fari sono **solo diffuse** (`drawFari`): tinta calda, nessun lucido. Non esiste un modo "bagnato".

**Come si fa in canvas 2D.** Sopra ogni pozza diffusa, una seconda tessitura cotta più stretta e più chiara, allungata lungo la direzione di vista, in `lighter`. Più un rialzo di croma sul manto.

**Costo.** **4 `drawImage` additive** (una per faro), già cullate dal culling che `drawFari` fa; ognuna ~260 unità di diametro = **~580×580 px**, cioè fino a **1,3 Mpx nel caso peggiore in cui tutte e quattro sono in quadro**. Serve un `globalCompositeOperation='lighter'`, che su questo banco è la famiglia di operazione più cara che ci sia: `lighter` su **tutto** il viewport «dimezzava i fotogrammi» (`CALCETTO-il-gioco.html:22141`). Con quattro rettangoli localizzati è un'altra cosa — `drawBloom` fa già esattamente questo con tre quadratini — ma **va misurato, non stimato**, ed è l'unica voce di questa lista che potrei aver sottostimato.

---

## 2. Le tre cose che sono già giuste, e che vanno difese

Sarebbe disonesto consegnare solo difetti. Tre cose in questi otto PNG sono **al livello che la lista B insegue**, e chi lavorerà sulla lista deve sapere di non romperle:

1. **L'ombra portata.** Una direzione sola per tutti gli otto campi, sagomata sulla posa e non a capsula, che si accorcia col salto. Misurato: la transizione scuro→chiaro sul manto è **4 px di periferica mediani** (p90 fra 9 e 14), cioè bordi netti al contatto e più molli lontano — che è il verso giusto.
2. **La temperatura della luce.** Misurato sui pixel di manto: i pixel chiari stanno a tinta **96°** e quelli scuri a **138°** — **42 gradi di virata verso il giallo dalla parte del sole**, con la croma che sale di 0,05 in luce. È fisicamente corretto (luce calda, ombra fredda) ed è la cosa che nei PNG legge di più come «sette di sera».
3. **L'interfaccia diegetica.** I cartelloni delle botteghe e il tabellone di legno appeso alla recinzione sono la voce in cui questo gioco **batte** i concorrenti mobile, non li rincorre. B13 chiede di dargli più spazio, non meno.

---

## 3. Se si può fare una cosa sola

**B2** — la moviola con un'inquadratura sua. Costa zero pixel, non richiede un cancello nuovo, e trasforma l'unico momento in cui il gioco già ferma tutto e chiede allo spettatore di guardare.

**Se se ne possono fare tre, sono B2 + B13 + B3**: regia, composizione, luce. Tutte e tre a costo di fotogramma **zero o quasi**, tutte e tre dentro la frase che questo progetto ha già scritto da solo — *«il gioco vince su tutto quello che si può fotografare»*. Queste tre migliorano proprio la fotografia, che è dove il gioco è già forte, senza toccare un millisecondo del pollice.

---

## Appendice — i numeri misurati oggi

Strumenti: `C:/Users/Utenteee/Desktop/GitHub/games/_aaa-misura.js` e `C:/Users/Utenteee/Desktop/GitHub/games/_aaa-misura2.js`. Mediane su 8 (primo) e 5 (secondo) fotogrammi di `istantanee/istante-0N.png`, 1830×824 px di periferica.

| misura | valore | cosa vuol dire |
|---|---|---|
| colori distinti nel quadro | 69.752 | — |
| pixel sopra Y 0,55 | **1,83%** | il quadro non ha alte luci (B8) |
| quota di quadro in famiglia-manto | 85,0% | — |
| manto Y p05 / p50 / p95 | **0,204 / 0,239 / 0,305** | gamma tonale 1,49:1 (B3) |
| gradiente manto alto/basso | **1,013** | nessuna prospettiva aerea (B3) |
| contrasto fra pixel adiacenti sul manto | 0,00626 | grana quasi assente |
| idem a 4 px di distanza | 0,00986 | rapporto 1,58: la grana è a bassa frequenza, non per pixel |
| periodicità sulle colonne | **T = 110 px = 49,2 unità**, ampiezza 0,031 | la rasatura c'è alla frequenza dichiarata (48 u.) e vale 6,1% picco-picco (B4) |
| periodicità sulle righe | T = 236 px, ampiezza 0,025 | non è rasatura: è la vignettatura |
| manto, p75 / p12 di luminanza | 1,456 | — |
| tinta pixel scuri → chiari | **138° → 96°** | luce calda / ombra fredda: **corretto** |
| croma scuri → chiari | 0,41 → 0,46 | **corretto** |
| larghezza transizione d'ombra | **4 px** mediani (p90 9-14) | ombre nette al contatto: **corretto** |

Numeri presi dal file, non misurati da me: pallone al 2,60-3,40% della larghezza del quadro (`CALCETTO-il-gioco.html:24588`); scala di gioco 2,236 px di periferica per unità (`:21935`); direzione della luce (0,94 · 0,34) su tutti gli otto campi (`:16110`); passo di rasatura 48 unità (`:6673`); pigmento fra bande al 2,0% (`:6670`).

Costi in millisecondi citati nel rapporto (filtro bilineare 6,8 ms, `multiply` a schermo intero 2,6 ms, `multiply` su 22 ombre 5,8 ms, `lighter` a schermo intero = metà dei fotogrammi): sono **tutti** del banco a rasterizzazione software, letti dai commenti del file. **Non sono numeri di telefono, e in questo progetto numeri di telefono non ce ne sono.**

---

**Fonti web consultate:**
- [EA Sports FC 25 Presentation Breakdown — Operation Sports](https://www.operationsports.com/ea-sports-fc-25-presentation-breakdown/)
- [EA Sports FC 25 could be my favourite entry in years — GamingBible](https://www.gamingbible.com/features/ea-sports-fc-25-favourite-entry-640739-20240717)
- [EA SPORTS FC 25 | HIGHLIGHTER — EA](https://www.ea.com/games/ea-sports-fc/fc-25/news/fc-25-highlighter)
- [FC 25 Replays: Match Highlights — FIFAUTeam](https://fifauteam.com/fc-25-replays-match-highlights/)
- [Pitch Wear in Career Mode — EA Forums](https://forums.ea.com/discussions/fc-25-game-modes-en/pitch-wear-in-career-mode/7857298)
- [Score bug — Wikipedia](https://en.wikipedia.org/wiki/Score_bug)
- [Designing the Modern Scorebug — Sports Video Group](https://www.sportsvideo.org/2026/06/09/designing-the-modern-scorebug-how-broadcast-graphics-teams-are-rethinking-the-most-important-element-on-screen/)
- [CanvasRenderingContext2D.filter — MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter)
- [CSS blur effects are highly inefficient in canvas filters — Bugzilla 1498291](https://bugzilla.mozilla.org/show_bug.cgi?id=1498291)
- [PC graphics options explained — PC Gamer](https://www.pcgamer.com/pc-graphics-options-explained/)