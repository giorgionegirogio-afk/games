**VOTO: 6/10** — un 6 che contiene un 7,5 in attacco e un 4 in difesa. Sopra il "giocabile ma frustrante" come impianto, ma tre difetti geometrici lo tengono lontano dall'8: uno dei diciassette esiti **non è fisicamente eseguibile**, la catena difensiva produce falli involontari, e la disposizione dei due dischi è invertita rispetto alla frequenza d'uso.

---

## LE TRE COSE MIGLIORI

**1. Togliere il flick, tutto, e leggere solo posizioni a `touchend`.**
Non è igiene: è un cambio di *classe* di guasto. Il codice a `:8882-8896` è la confessione — quando il browser fonde i `touchmove`, la velocità misurata è zero e «il tiro più netto viene letto come un passaggio». Un guasto che sbaglia il **verbo** è maligno; un guasto che sbaglia di 5° la **mira** è benigno e il giocatore lo corregge da solo. Questo schema converte il primo nel secondo su tutti e cinque i gesti, e morde esattamente dove serve: sotto porta, scena piena, telefono in affanno. È la decisione migliore del documento e da sola vale più di qualunque verbo aggiunto.

**2. Lo stato a zero dita è neutro, più `touchcancel` ≠ `touchend` e il trascina-fuori-per-annullare.**
Sono tre facce dello stesso principio (nessun impegno involontario) ed è la differenza fra uno schema che sopravvive a un autobus e uno che no. Oggi `:8947` fa partire un passaggio quando alzi il pollice per una notifica: è un difetto che i giochi grandi hanno spedito e mai tolto. E l'invariante dei dischi è dichiarato nel modo giusto — 7,6 px di franco fra i cerchi di presa, quindi **l'ambiguità è impossibile per geometria, non risolta da una regola di parità**. Un invariante geometrico verificato aritmeticamente su sei configurazioni è più solido di qualunque tie-break.

**3. Disegnare la promessa mentre il dito è giù (il cono che cresce, il compagno che parte).**
È l'unico punto in cui il documento *risolve* il problema delle bande di durata invece di dichiararlo risolto. Stimare 0,35 s è un compito temporale: varianza alta, sensibile alla latenza, non allenabile. Guardare un cono allungarsi è un compito spaziale: a colpo d'occhio, autocalibrante, e la latenza diventa un bias costante invece che un errore. Convertire tempo in spazio è la mossa giusta. (Il meccanismo è corretto; il budget di attenzione con cui lo pagate no — sotto.)

---

## LE TRE COSE CHE SI ROMPONO

### 1. La finta di tiro (#12) e tutta la regola P5 non sono eseguibili con la mano che avete dichiarato

Il §1 dice, in grassetto, *«zero secondo dito»*. Il §3.1 #12 dice: **«premi B mentre A è carico»**. Il pollice destro è uno solo e A deve restare giù (rilasciarlo tira).

- Non puoi trascinare da A a B: i centri distano 101,6 px, e a 90 px P7 ha già annullato la carica; e comunque un trascinamento non genera un `touchstart` su B, quindi B non viene mai premuto.
- Non puoi usare il pollice sinistro: sta sulla levetta a ~650 px di distanza, e P9 dichiara che le due mani non si contendono niente.
- Non hai un secondo dito destro: in presa orizzontale l'indice destro tiene il telefono da dietro.

Quindi **#12 non esiste**, e con lui esce il pilastro SUPERARE L'UOMO in attacco. Peggio: P5, venduta come «una regola, simmetrica, che copre entrambe le collisioni fra i due dischi», copre collisioni che intenzionalmente non possono accadere — e resta accesa **solo per gli incidenti**, dove fa la cosa più distruttiva possibile (uccide il passaggio o il tiro in corso).

**Il caso concreto in cui morde:** 640×360, ramo colonna verticale, B a (581,5 · 214,8) sopra A a (587,5 · 310,8) — stesso angolo dal perno, raggi diversi. Il pollice che preme B ha la **falange prossimale distesa sopra A**: su uno schermo piccolo il pollice si appiattisce, la falange tocca il vetro, P5 scatta, la barra del passaggio muore e parte una carica di tiro che non hai chiesto. La regola che non serve mai quando la vuoi è la stessa che ti tradisce quando non la vuoi, e capita sul telefono più piccolo, cioè sulla mano più grande in proporzione.

### 2. La catena difensiva: tap mancato → contenimento → rilascio → scivolata → fallo

Tre errori si moltiplicano, e il prodotto è l'esito peggiore del calcio.

- **Il gradino a 150 ms è una scogliera, non una banda.** `TAP_T = 0.15` esiste già (`:3077`), ma su B le conseguenze sono continue (340→480 u/s: un tap da 180 ms dà un passaggio un filo più forte, e va bene). Su A il confine è **categoriale**: tap = contrasto in piedi, tenuta = contenimento a ×0,62 di velocità. Con una durata media del tap di 133 ms — il vostro numero — una soglia a 150 ms sta a **1,13× la media**. Con una deviazione realistica di 40-50 ms, **un terzo dei contrasti voluti diventa un contenimento**. Avete applicato una legge continua a un disco e una legge discreta all'altro, e poi avete dichiarato che seguono la stessa regola monotona.
- **La condizione della scivolata è sempre vera mentre inseguo.** #18 chiede la levetta «spinta oltre 46 nei 0,30 s precedenti». Il §3.3 difende la soglia dicendo che la freschezza *«impedisce alla scivolata di partire quando smetti semplicemente di contenere con la levetta già a fondo»*. **La regola scritta fa l'esatto contrario di quello che la sua giustificazione promette:** una levetta ferma a fondo da tre secondi soddisfa «spinta oltre 46 nei 0,30 s precedenti». Volevate un **fronte** (la levetta ha *attraversato* 46 di recente), avete scritto un **livello**. E contenendo a ×0,62 la levetta *deve* stare a fondo per non perdere il portatore: la condizione patologica è il caso normale.
- **Il possesso guadagnato a metà tenuta non è specificato.** P6 copre il possesso *perso*. Non copre il caso frequentissimo: contieni, il furto di contatto ×1,3 di #17 funziona, ora hai la palla, il pollice è ancora giù su A. P4 congela l'atto e l'etichetta, quindi il disco dice CONTRASTA e l'atto congelato è `jockey`.

**Il caso concreto:** l'ala punta, tu tocchi CONTRASTA, il tocco dura 170 ms, entri in contenimento senza volerlo e rallenti al 62%. L'ala ti passa. Molli il disco per riprendere la corsa — la levetta è a fondo perché stavi inseguendo, l'avversario è entro 140 unità nel cono — **scivolata**, da dietro, in corsa. Fallo, e con la variante fortunata: contieni bene, rubi palla, e il rilascio del pollice ti fa scivolare **sull'uomo che hai appena spogliato, con il pallone tra i piedi**. Il successo difensivo più comune del gioco finisce in un fallo. Questo non si supera dopo due partite: si smette di difendere.

### 3. L'inversione di Fitts sui due dischi, e un pollice sinistro mai analizzato

Il documento spende dieci pagine di millimetri sul pollice destro e **zero righe di ergonomia sul sinistro**.

**Destro.** Il perno metacarpale in presa orizzontale sta fuori schermo, attorno a (940 · 430) px CSS. Distanze reali dal perno, non dal bordo:

| disco | dal perno | presa | Fitts ID = log₂(2D/W) |
|---|---|---|---|
| A — TIRA/CONTRASTA | 118 px | ⌀100 | **1,24** |
| B — PASSA | **212 px** | ⌀88 | **2,27** |

B sta **1,8× più lontano** e costa **+83% di indice di difficoltà**, cioè circa **+150 ms per pressione** a 150 ms/bit. E B è, per vostra stessa ammissione, «il disco più premuto del gioco». Avete visto il problema e avete curato la variabile sbagliata: allargare B da ⌀60 a ⌀68 compra il **6%** dell'ID; la posizione ne costa l'**83%**. (Il conto regge se sposto il perno a (950 · 380): 103 contro 204, rapporto 2,0.) A 640×360 peggiora: B finisce a 145 px sopra il fondo su uno schermo alto 360, a **220 px dal perno** — l'azione più frequente sul telefono più piccolo diventa la più lontana, ed è esattamente il caso mano-piccola/telefono-piccolo.

**Sinistro.** La levetta nasce dove il dito si posa, senza vincoli di bordo. In presa orizzontale il pollice sinistro si appoggia spesso a x ≈ 25-35. Da lì lo spostamento massimo verso sinistra è di 25-35 px: la banda **corsa** (46) è già fuori portata, lo **scatto** (66) è irraggiungibile. L'inseguimento dell'origine a MAXR=70 (`:8851`) non aiuta l'*iniziazione*: insegue solo dopo che hai superato 70. Caso concreto: rientro difensivo verso la tua porta sul lato della levetta — **non puoi scattare**, e non capisci perché. Aggiungete che `Touch5.start` fa `if(s.active) return` (`:8841`): con la promozione P2, un dito destro che sbaglia il disco e trascina oltre 70 px diventa **la** levetta della squadra, e da quel momento **il pollice sinistro è morto** finché il destro non si alza.

**E la misura 3 non può vederne nemmeno uno.** Sparate 3.000 tocchi in gaussiana **centrata sul centro del disco**: un modello con solo σ e **nessun termine di bias**. Un bersaglio irraggiungibile non produce dispersione, produce uno **scostamento sistematico** — la vostra misura è cieca per costruzione al difetto che la sezione «schermo piccolo» dovrebbe difendere. E non c'è nessun cancello sul pollice sinistro, a parte 3d.

---

## RISPOSTE SECCHE ALLE QUATTRO DOMANDE

**I bersagli sono raggiungibili?** A sì, e bene. B è raggiungibile ma fuori arco, e a 640×360 è al limite dell'estensione. La levetta non è raggiungibile in tutte le direzioni quando nasce vicino al bordo.

**Il dito copre l'azione?** Sì, e nel punto peggiore. L'anello del tiro sta a `P_R+8` = 21 unità di mondo, cioè **~55 px di diametro a schermo**; l'ombra di contatto di un pollice è **~150 px** (numero vostro, §7.2). Devi leggere una lancetta dentro un cerchio tre volte più piccolo della cosa che lo copre, con una finestra di 300 ms, **mentre il pollice che deve rilasciare è quello che lo copre** — ogni volta che tiri dalla fascia destra vicino al fondo, cioè in mezza area. Uguale per l'annullo P7: l'unico segnale è «la ghiera diventa grigia», e la ghiera sta sotto il polpastrello. Il budget del §4.1 protegge la fascia dei 64 px in basso, che non era il problema; il problema è il **mondo sotto il pollice**, e non è contato da nessuna parte.

**Quanti gesti sono davvero memorizzabili?** Cinque atti fisici, sì. Ma la regola «tocchi poco, tieni tanto» **non è monotona su A**: tenere oltre 0,80 s non produce niente di più lungo o più rischioso, produce un tiro **peggiore** (`q==2`). E la stessa banda della levetta nomina tre verbi diversi secondo il contesto — *pallonetto* su A, *passa-e-vai* su B, *affondo* sulla scivolata. Questa è precisamente l'associazione arbitraria che citate Nacenta per aver eliminato. La monotonia c'è sulla **grandezza**; non c'è sul **verbo**, ed è il verbo che si dimentica. Carico reale onesto: ~9 associazioni, non 1.

**Mani grandi / schermo piccolo / in piedi sull'autobus?** Mani grandi: la corona morta e i 7,6 px di franco sono la difesa giusta, ma la colonna verticale a 640×360 li annulla facendo appoggiare la falange sul disco sotto (rottura 1). Autobus: lo stato neutro a zero dita è la risposta corretta e vale molto; ma la finestra di 300 ms letta su un anello di 55 px, su un giocatore in movimento, con il braccio non appoggiato, non è una finestra — è un dado. Il piano B a 400 ms allarga il dado; non toglie il pollice da sopra il quadrante. Nota metodologica: Hoober conta l'uso *generico* del telefono, in verticale; usare il suo 1,5% di «due pollici in orizzontale» per parlare di un gioco in orizzontale è un errore di campione. La conclusione (stato neutro) resta giusta, ma per un'altra ragione: le interruzioni, non la presa.

---

## LA SINGOLA MODIFICA CHE ALZEREBBE DI PIÙ IL VOTO

**Ri-derivare la geometria dei dischi da un arco a raggio costante attorno al perno del pollice, invece che da scarti cartesiani dall'angolo dello schermo.**

Un solo principio, e cambia sei configurazioni insieme: i due dischi devono stare **allo stesso raggio dal perno e a due angoli diversi**, non allo stesso angolo e a raggi diversi. Concretamente, con il perno a ~(940 · 430) e un raggio di lavoro di ~130-140 px, la separazione fra i due centri diventa un **angolo di ~40°** sull'arco, e i dischi si dispongono quasi impilati lungo il bordo destro — vicino a quello che il vostro ramo di emergenza a 640×360 già fa, ma nel verso giusto (stesso raggio, non stesso angolo). E su quell'arco il disco **PASSA va nello slot comodo, TIRA in quello esterno**: il bottone più premuto va dove il pollice riposa.

Perché questa e non un'altra:

- Annulla l'inversione di Fitts: i due dischi tornano equidistanti, e i ~150 ms per passaggio spariscono su tutti i viewport, non solo su quello grande.
- Toglie la falange dal disco sbagliato — con raggio uguale l'asta del pollice è **radiale** e non attraversa mai l'altro disco. Le collisioni accidentali di P5 crollano, ed è l'unico modo di renderle rare invece che di gestirle.
- L'invariante di non sovrapposizione diventa un **angolo minimo sull'arco**, che si verifica con una disuguaglianza sola su qualunque viewport, invece che con il ramo `if(dist < rA+rB+24)` e la sua aritmetica caso per caso.
- Dà alla misura 3 un **termine di bias** da testare: sull'arco la direzione dell'errore atteso è nota, e un bersaglio irraggiungibile smette di essere invisibile al banco.
- È l'unica delle correzioni che **non si può rattoppare dopo**: la scala ×0,85/×1,00/×1,20, la specularità per mancini, il ramo dello schermo piccolo e i seimila tocchi sintetici sono tutti *derivati* dal sistema di coordinate. Cambiarlo dopo significa rifondare cinque cose; cambiarlo adesso costa la funzione `touchBtnLayout`.

Le altre due rotture sono **difetti da correggere comunque, non scelte di progetto**: la scivolata deve leggere un fronte (la levetta ha attraversato 46 negli ultimi 0,15 s) e non un livello, e sul disco A senza palla **nulla deve partire al rilascio** — l'affondo si arma in cima alla tenuta, dove lo vedi, e il rilascio resta sempre la via d'uscita sicura. E #12 va riscritto per un pollice solo o cancellato dalla tabella: un esito che la mano non può produrre non è un esito.