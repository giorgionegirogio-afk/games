Verified the design against the source. Here is the judgement.

---

# VOTO: **6 / 10**

Sei per il progetto *come documento*. Implementato alla lettera, senza le tre riparazioni qui sotto, arriva a **5**: si gioca, ma il tiro esce pallonetto quando hai chiesto un rasoterra, e la bussola cambia uomo quando volevi solo correre. Il documento è più onesto della media (dichiara cinque non-verificati prima dei numeri, e ha ragione a farlo), ma **la sua affermazione portante — «due soglie sole in tutto lo schema» — è falsa sul pulsante più importante**, e la verifica costa trenta secondi di lettura del file.

Non arriva a 8 e lo sa: niente seconda levetta, niente skill move, niente colpi di testa (§6). Non scende a 3 perché il nucleo che eredita (levetta + due dischi + anello del timing) già funziona e lo schema non lo distrugge.

---

## LE TRE COSE MIGLIORI

**1. Leggere `dx,dy` dal punto di rilascio invece che dal flusso dei `touchmove`** (§1.3, delta 1).
È l'idea di maggior valore del documento e vale da sola metà del voto. Il file documenta a `CALCETTO-il-gioco.html:8882-8896` che la fusione dei `touchmove` ha già morso questo progetto — «dei cinque punti di un flick ne consegna UNO, e insieme al touchend... il tiro più netto viene letto come un passaggio» — e la contromisura attuale (riga 8896) è una pezza euristica che ricostruisce la velocità da due campioni. Spostare *tutta* la grammatica dei dischi su `{t0, punto di rilascio}` — due dati che il browser consegna sempre, a 60 fps come a 22 — rende il vocabolario **indipendente dal frame rate per costruzione**, non per taratura. Su un telefono di fascia media che oscilla fra 28 e 45 fps questa è la differenza fra uno schema che degrada sotto carico (cioè in area, cioè quando conta) e uno che no. Costa: `end(id)` → `end(id,x,y)` e tre listener. Che sistemi anche `touchcancel` (ultimo punto noto + verbo base forzato, §5.1) è un bonus meritato.

**2. L'etichetta che si racconta** (§3.1).
È l'unico meccanismo di scoperta del documento che costa **zero pixel nuovi**: `drawTouchButtons` già esegue una `fillText` per disco ogni fotogramma, e la modifica è l'argomento, non la chiamata. Ho controllato il blocco (25990-26080): niente `measureText`, solo `arc` e `fillText` — cambiare la stringa non aggiunge misurazione del testo. La proprietà che vale davvero non è la scoperta, è **l'abortibilità**: vedi il nome prima di commettere, torni al centro, esce il verbo base. È ciò che rende tollerabile un cono a 4 vie con ±18° di rumore. E risolve per davvero il difetto che il documento cita da FC Mobile: la zona contestuale invisibile qui ha un nome scritto sotto il pollice.

**3. §2.5 e la costruzione dei cancelli di §7.**
Un documento di comandi che dichiara che quattro dei propri verbi **non sono premiati dalla simulazione** («il peso del passaggio è un tasto finto finché quella riga non cambia»; ogni cross cade 24-31% corto; non esiste il colpo di testa) e che si mette *dietro* le riparazioni di fisica nell'ordine di implementazione, sta facendo la cosa che quasi nessun documento di progettazione fa. Analogamente l'argomento anti-scorciatoia di M1 è genuinamente non aggirabile: i quattro coni partizionano i 360°, allargare AVANTI restringe LATERALE, **la somma dei tassi è conservata**. E l'obbligo di M2 di emettere in PNG i cinque fotogrammi peggiori è la contromisura esatta alla trappola in cui questa base è già caduta — la posa dell'HUD che forzava `poss=true`, confessata nel file a 8779-8795.

---

## LE TRE COSE CHE SI ROMPONO

### 1. Le soglie non sono due: sul disco grande sono sei, e la vibrazione insegna il tiro sbagliato

`CALCETTO-il-gioco.html:3077` → `const SHOT_MIN = 0.50, SHOT_MAX = 0.80, SHOT_HARDCAP = 1.25, TAP_T = 0.15;`

`DISC_HOLD = 0,30` e `DISC_HOLD2 = 0,55` **cadono a cavallo di `SHOT_MIN = 0,50`**. E `releaseCharge` (9234) non consulta nessun anello: calcola la qualità in modo deterministico da `c` contro `SHOT_MIN`.

Quindi la riga «0,15 – 0,30 | tap | **tiro (qualità dall'anello)**» di §1.3 è falsa: in quella fascia `c < SHOT_MIN - larg` sempre, `q = 0` sempre, `TIRO_ARRIVO[0] = 230` — «arriva piano, è una parata facile», parole del file. Non è una qualità, è una condanna.

**Il caso concreto.** Il giocatore impara i due colpetti su PASSA, dove sono onesti (buzz(8) a 0,30 = sei in tenuta, buzz(14) a 0,55 = impegno pieno). §3.2 promette che «da qui in poi il disco si suona a occhi chiusi» e applica le stesse due soglie ai quattro contesti. Porta il riflesso su TIRA, in contropiede, senza guardare. Sente il primo colpetto a 0,30 e rilascia: **`q=0`, pallone a 230, parata facile**. Lo stesso segnale tattile che sul disco piccolo significa «sei arrivato, puoi commettere» sul disco grande significa «lascia adesso e butti via il tiro». D2 dice «Significano sempre la stessa cosa»: no. Sul disco grande l'asse della durata ha già quattro tacche proprie (0,15 / 0,50 / 0,80 / 1,25) e lo schema ne appiccica due estranee in mezzo, poi le segnala col dito.

### 2. Il pallonetto ha due comandi vivi, e uno è acceso quasi sempre

`CALCETTO-il-gioco.html:9243` → `fireShot(p, dx/l, dy/l, q, humanSprint(t));`

Il delta (voce 13) modifica **solo** la riga 9238 (`dy += my*260`). La riga 9243 non è toccata da nessuna voce della tabella §8. La riga 16 marca il pallonetto ✅ «esiste già» e gli dà un comando nuovo (`ax < −0,5`) **senza mai togliere quello vecchio**.

E quello vecchio è acceso per default. `humanSprint` (8664-8669) è vero quando `len(st.dx,st.dy) > 66`. Ma `Touch5.move` (8853-8860) fa inseguire l'origine: `if(l>MAXR){ ... }` con `MAXR = 70`, che **satura lo spostamento a esattamente 70**. Ogni trascinamento deciso oltre 70 px si blocca a 70, e 70 > 66. Per correre a velocità piena *senza* sprintare devi tenere il pollice in una banda di 20 px (fra `STICK_FULL` 46 e 66) di cui non esiste alcun riscontro visivo.

**Il caso concreto.** Sprinti al centro verso la porta (levetta inchiodata a 70 px). Premi TIRA, trascini in avanti per la riga 15 — «tiro teso, potenza +14%, `b.vz = 0` forzato, il portiere legge più tardi» — e rilasci sull'ambra. Esce un **pallonetto**: `humanSprint(t)` è ancora vero. Le righe 15 e 16 si contendono lo stesso rilascio e vince la 16, sempre, per chiunque stia correndo. Lo stesso meccanismo avvelena la riga 10: il dai-e-vai («uno qualunque di 1-8 **+ sprint tenuto al rilascio**») scatta praticamente su **ogni passaggio fatto in corsa**, con `swLock 0,75` che ti inchioda al passatore. Il «uno-due deliberato» diventa lo stato predefinito e non puoi rinunciarci senza fermarti.

### 3. La bussola non è una superficie: sparisce, scivola via dal dito che la tocca, e resta viva quando è invisibile

D4 è un pilastro dello schema («non c'è compromesso: c'è una coincidenza numerica sfruttata») e ci appoggia cinque verbi (35, 36, 37, 38, 39). Tre fatti in `drawMinimappa` lo smontano.

**(a) Non è «disegnata ogni fotogramma».** Righe 24889-24897: `MINI_RECT=null;` poi `if(quota>=0.92) return;`. Il commento del file dice esplicitamente «sull'11 contro 11 ... la quota 0,92 non scatta mai» — cioè **a 5v5 scatta**. A campo 1150×560 il taglio cade attorno a S2 ≈ 0,73. Quando scatta, `MINI_RECT` è `null` e cinque verbi svaniscono senza preavviso.

**(b) Il rettangolo scivola, e lo fa *perché* lo tocchi.** `G.miniY` interpola in modo esponenziale (semivita 0,12 s) fra `myAlto` e `myBasso`, e `scendi = toccaPollice(myAlto) || ...` dove `toccaPollice` (24985-24993) controlla **la levetta viva**: `const st=Touch5.stick[t]; if(!st||!st.active) continue;` con la scatola `ox±50, oy±50`. La regola 5 di §4.1 fa **nascere una levetta nel punto toccato sulla bussola**. Quella levetta si sovrappone per costruzione alla bussola → `scendi` diventa vero → la bussola parte verso `myBasso`. Con semivita 0,12 s, **a 0,30 s — l'istante esatto in cui si apre la LENTE — ha già percorso l'82% della fuga**. La lente si apre su una bussola uscita da sotto il dito, e §1.5 commette al rilascio, con «fuori → niente».

**(c) Resta toccabile mentre è invisibile.** `aMini = scartoHUDRett(...)` (25917-25932) satura a 0,10 quando il pallone o il protagonista si sovrappongono al rettangolo — la legge «la palla vince sempre». Ma `MINI_RECT` viene assegnato *prima* dell'alpha, e la tua regola 5 lo interroga sempre.

**Il caso concreto.** Difendi, il pallone entra nel tuo angolo basso-sinistra, la bussola sfuma a 0,10 (praticamente invisibile). Poggi il pollice lì per correre sulla palla e lo risollevi subito per riposizionarlo — entro 12 px e 300 ms, che è esattamente ciò che una levetta-che-insegue invita a fare. Il gioco esegue «cambio a icona regionale»: **ti ritrovi a comandare un altro giocatore mentre il pallone è ai piedi di quello di prima.** La superficie che il documento chiama coincidenza fortunata è l'unico elemento dell'HUD che si muove da solo, si spegne da solo e a volte non esiste.

---

## INOLTRE, VERIFICATO

- **La mira del tiro è cieca e il rollio la mangia.** §5.1 stima fino a 14 px di spostamento involontario da rollio del polpastrello (è la ragione dichiarata di `DRAG_DEAD = 14`). La riga 13 mappa `ay = dy/44` su `GOAL_H/2 + 30 = 105` unità (a 5v5, `GOAL_H = 150`, riga 2935). Quindi **14 px di rollio = 33 unità di errore = il 44% della semiluce della porta**, applicati a ogni tiro — e letti proprio al distacco, l'istante in cui il rollio è massimo, perché il rilascio è dettato dall'anello. Nessun indicatore di mira è specificato da nessuna parte: è un controllo analogico senza riscontro, campionato nel momento peggiore.
- **`buzz` non ha throttle.** Riga 6500: `function buzz(p){ try{ if(SAVE.vib!==false && navigator.vibrate) navigator.vibrate(p); }catch(e){} }` — chiamata JNI diretta, nessun debounce. Il `buzz(5)` di §3.2 «il cono cambia» non ha isteresi: un pollice fermo sul confine AVANTI/LATERALE (`dx·g ≈ |dy|`) fa vibrare il telefono a ogni `touchmove` che attraversa la diagonale, fino a 60 volte al secondo.
- **L'aritmetica del «varco» è sbagliata**, anche se l'effetto è piccolo. Le prese non si incontrano mai: l'anello di esclusione dell'altro disco fa `return` prima. Oggi la banda morta sulla congiungente è larga **8,0 px** (ds 36,76→44,76 dal centro del piccolo), non «varco +4,76». Invertire l'ordine (§4.1 punto 4) la trasla di 3,24 px: misurato, TIRA perde lo **0,7%** dell'area in «normale» e l'**8,4%** in «compatto». Trascurabile — ma la motivazione dichiarata («in un tocco ambiguo vince il verbo che perdona») **non descrive il codice**: un tocco ambiguo non produce il passaggio, produce **niente**.
- **La scivolata perde 300 ms e §6 non lo dichiara.** Oggi `doSlide` parte al `touchstart` (8833). La riga 26 la sposta a una tenuta di 0,30-0,55 s al rilascio. §6 ammette solo il costo sul passaggio. Un contrasto scivolato è un'intercettazione a tempo: passare da reattivo a 300 ms di predizione è una perdita almeno pari a quella del passaggio, e non è nell'elenco.
- **M1 non può misurare ciò per cui esiste.** §7 estrae *tutte* le durate da `N(133, 83)` e non dà nessun modello d'intenzione per le tenute. Con quella normale, `P(X ∈ [300,550]) = 0,022`: su 200 gesti sintetizzati per verbo, **circa quattro** cadono nella fascia voluta. Ogni verbo di tenuta uscirebbe a ~0,02 di riconoscimento e M1 non saprebbe distinguere «la grammatica non è separabile» da «il rumore prova la cosa sbagliata». Serve una seconda distribuzione, per le tenute intenzionali. Nota collegata: la riga 17 (`appoggio corto`, rilascio sotto `TAP_T = 0,15`) con quella stessa normale riesce nel **58%** dei casi — un verbo non-base al di sotto del cancello dello 0,90 per pura aritmetica, calcolabile senza eseguire niente.

---

## LA MODIFICA CHE ALZEREBBE DI PIÙ IL VOTO

**Eliminare `DISC_HOLD2 = 0,55`, e togliere l'asse della durata dal disco grande: da 39 verbi a ~26.**

Una sola modifica che chiude tre falle insieme.

*Sul disco grande*, la durata non è una dimensione libera: è già l'anello del timing, con quattro tacche esistenti. Toglici 0,30 e 0,55, e **sposta i due `buzz` su `SHOT_MIN` (0,50) e `SHOT_MAX` (0,80)**. Il colpetto smette di mentire e comincia a dire l'unica cosa che il giocatore ha davvero bisogno di sentire senza guardare: *la finestra si apre adesso / si chiude adesso*. Il requisito «raggiungibile senza guardare» viene finalmente soddisfatto sul pulsante dove conta, e costa **zero**: sono le stesse due chiamate `buzz`, su due costanti che esistono già alla riga 3077. Oggi l'anello — che il documento chiama giustamente «la meccanica migliore del gioco» — è giocabile solo a occhi aperti.

*Sul disco piccolo*, la seconda soglia compra un bit di quota: filtrante alto (5), cross a campanile (7), cambio di gioco (8). **§2.5 dichiara già che quel bit non è pagato**: ogni cross cade fra il 24% e il 31% corto, e il colpo di testa non esiste, quindi «un cross può solo atterrare». Il piano superiore dell'asse della durata è decorazione ammessa dall'autore. Tagliarlo non perde un solo verbo che la simulazione sappia premiare oggi — e il file ha già mostrato cosa succede a scrivere verbi che il campo non raggiunge: `doCross` ed `eseguiFiltrante`, funzionanti, **zero volte in dodici partite**.

Il guadagno:
1. l'affermazione portante dello schema diventa vera — **una** soglia, che significa la stessa cosa dappertutto (D2 restaurato invece che smentito);
2. la vibrazione diventa onesta sul disco grande, e per la prima volta rende suonabile l'anello;
3. la matrice di confusione di M1 scende da 39×40 a ~26×27 e i cancelli tornano raggiungibili, invece di essere un test che il progetto è matematicamente destinato a fallire.

E fatte le tre riparazioni del §6 — cancellare `humanSprint(t)` alla riga 9243, escludere il flick per le levette nate dentro `MINI_RECT`, riconoscere che `MINI_RECT` può essere `null` e in movimento — **questo schema vale 7,5**. Le prime due sono modifiche da una riga.