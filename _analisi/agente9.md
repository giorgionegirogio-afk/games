# SCHEMA DI COMANDI MOBILE PER CALCETTO — progetto completo

**Base letta**: `C:\Users\Utenteee\Desktop\GitHub\games\CALCETTO-il-gioco.html`, in sola lettura. Righe di riferimento: `KMAP` 8591, `humanMove/humanSprint` 8642-8688, `touchBtnLayout` 8773-8805, `Touch5` 8806-8951, listener 8954-8970, `doPass/smarcato/eseguiPassUmano` 9063-9114, `doFiltrante/eseguiFiltrante` 9127-9180, `doCross` 9187-9202, `startCharge/releaseCharge` 9205-9256, `doSlide/startSlide` 9485-9513, `cambiaGiocatore` 9956, `switchControlled` 9973, `drawMinimappa` 24888-25005, anello di timing 24448-24498, `drawTouchSticks/drawTouchButtons` 25934-26075, `TOUCH_ZONE` 25583, `buzz` 6500, `Tut` 29118-29192, `TAGLIE` 2918-2932.

**COSA NON HO VERIFICATO, e lo scrivo prima dei numeri (regola 4).**
1. **Non ho eseguito il gioco.** Nessuna sonda, nessuna cattura, nessuna misura mia. Tutta la geometria qui sotto è *aritmetica sulle costanti lette nel file* con VW=915, VH=412, DPR=2.
2. **Non ho misurato niente su un telefono.** I 25 mm di polpastrello, i 133/421 ms di tap/swipe, gli 86-88 ms di latenza touch→fotone e il tetto di 4 direzioni di Kurtenbach vengono dal dossier degli specialisti, non da me.
3. **Non ho misurato il costo per fotogramma di nessuna proposta.** Dove scrivo un costo è un conteggio di operazioni, non un cronometro. Chi lo cita come misura commette il ventitreesimo caso.
4. **Non ho provato la leggibilità di nessuna delle etichette e degli indicatori che propongo.** Il progetto dell'HUD qui sotto è geometria, non un provino cieco.
5. Non ho verificato la separazione dei giocatori sulla bussola *in partita*: i 13 px e i 33-42 px del §5.4 sono calcolati sulle **posizioni nominali** del modulo (`TAGLIE`, 2918-2932). In mischia sono peggiori, e la misura M1 deve coprirlo.

---

## §0. LE QUATTRO DECISIONI CHE GENERANO TUTTO IL RESTO

Lo schema non aggiunge un terzo pulsante e non aggiunge una direzione oltre le quattro. Aggiunge **due dimensioni ai due dischi che ci sono già** (durata e trascinamento), **libera la levetta** e **accende una superficie già disegnata**. Le quattro decisioni:

**D1 — Il passaggio si sposta dalla levetta al disco piccolo.**
Oggi (`Touch5.release`, 8948-8949) *rilasciare la levetta con la palla è un passaggio*. Costa tre cose: (a) lo stato a zero dita è punitivo — alzi il pollice per una notifica e perdi il possesso; (b) tiene occupato l'unico canale espressivo che il pollice sinistro possiede; (c) impedisce di rendere toccabile la bussola, perché ogni tocco a sinistra diventa una levetta il cui rilascio calcia. Spostando PASSA sul disco piccolo si risolvono tutte e tre insieme. **È la decisione più costosa dello schema** (rompe un riflesso esistente e aggiunge latenza al gesto più frequente: vedi §6.1 e la misura M3) ed è la fondazione di tutto il resto.

**D2 — Due dimensioni nuove per disco, e sono le stesse due su tutti e quattro i contesti.**
- **DURATA**: due soglie sole in tutto lo schema, `0,30 s` e `0,55 s`. Significano sempre la stessa cosa: *quanto ti impegni* — e con la palla, *quanto in alto va*.
- **TRASCINAMENTO**: il disco, mentre è premuto, è una levetta con origine nel proprio centro. Sul disco piccolo è quantizzato in **4 coni** (chi/dove). Sul disco grande **non è quantizzato affatto**: è la mira, e la bocca della porta è un segmento verticale sullo schermo, quindi il trascinamento verticale *è* il punto della porta. Zero associazioni da imparare.

**D3 — La levetta libera prende un verbo solo, con quattro esiti.**
Flick con la palla = **la palla viene spinta là dove hai flickato, e tu ci vai dietro**. Avanti è il tocco lungo, indietro è l'arresto secco, di lato è il taglio. Un modello mentale, quattro manovre, e sono l'intera colonna «superare l'uomo». Senza palla il flick resta la scivolata di oggi.

**D4 — La bussola diventa la terza superficie, e il conflitto con la levetta non esiste.**
`MINI_RECT` (24888-25005) è disegnata ogni fotogramma e non fa niente. Diventa toccabile senza rubare un pixel alla levetta grazie a un fatto aritmetico: **la dead-zone della levetta è 12 px** (`STICK_DEAD`, 8642) e **la tolleranza di un tap è 12 px**. Un dito che si posa sulla bussola e si rialza entro 12 px e 300 ms *non ha prodotto un solo pixel di movimento*, qualunque cosa il gioco creda di aver fatto. Quindi si può far nascere la levetta **e** tenere aperta la candidatura della bussola, e decidere al rilascio. Non c'è compromesso: c'è una coincidenza numerica sfruttata.

---

## §1. LA MAPPA DEGLI INGRESSI

### 1.1 Le costanti nuove (tutte in un posto, come `SHOT_MIN` e compagnia a 3076)

```js
const DISC_HOLD  = 0.30;   // tap -> tenuta.  > 90° percentile del tap umano (~240 ms)
                           // e > 3x la latenza touch->fotone (86-88 ms)
const DISC_HOLD2 = 0.55;   // tenuta -> impegno pieno
const DRAG_DEAD  = 14;     // px CSS: sotto, il trascinamento non esiste
const DRAG_FULL  = 44;     // px CSS: corsa piena del trascinamento sul disco
const FLICK_V    = 650;    // px/s (ESISTE GIA', 8904)
const FLICK_MIN  = 22;     // px CSS: spostamento minimo perche' un flick sia un flick (NUOVO)
const DEB_CTX    = 0.18;   // s: i dischi sono sordi dopo un cambio di contesto causato da te
const LENTE_T    = 0.30;   // s: apertura della lente sulla bussola
const LENTE_W    = 300;    // px CSS: larghezza massima della lente
```

**Due durate e una distanza. È tutto il vocabolario nuovo.**

### 1.2 Le quattro superfici, in pixel (VW=915, VH=412, DPR=2)

| superficie | centro CSS | centro device | raggio/rett. CSS | presa | esclusione |
|---|---|---|---|---|---|
| **DISCO GRANDE** | (851, 352) | (1702, 704) | r 40 | r+10 = **50** | r+18 = 58 |
| **DISCO PICCOLO** | (757, 340) | (1514, 680) | r 30 | r+10 = **40** | r+18 = 48 |
| **LEVETTA** | nasce sotto il dito; a riposo (96, 272) | (192, 544) | `STICK_FULL` 46, inseguimento `MAXR` 70 | tutto il resto dello schermo | — |
| **BUSSOLA** 5v5/7v7 | (56, 378,5) | (112, 757) | rett. x 10..102, y 355..402 | +8 px → **x 2..110, y 347..410** (108×63) | — |
| **BUSSOLA** 11v11 | (71,4, 371) | (143, 742) | rett. x 10..132,8, y 340..402 | +8 px → x 2..141, y 332..410 | — |

Tutto **letto** dal file: dischi da `touchBtnLayout` 8798-8804; bussola da `drawMinimappa` (`mw=88*k`, `mh=43*k`, `mx=12`, `myBasso=VH-12-mh`, con `k=1` a 5v5/7v7 e `k=1,35` a 11v11 perché `TAGLIA===11`); levetta a riposo da `drawTouchSticks` 25945 e dal blocco `casaPollice` 24975-24981.

**Distanza fra i centri dei dischi**: √(94²+12²) = **94,76 px**. Le prese sono 50+40 = 90. **Varco: 4,76 px.** Resta il numero di oggi, e resta l'unica difesa contro il tocco ambiguo che nessun gioco commerciale del dossier documenta.

**Il trascinamento non esce dallo schermo**: dal disco grande, 44 px in ogni direzione danno x 807..895 (20 px dal bordo destro) e y 308..396 (16 px dal fondo). Dal piccolo: x 713..801, y 296..384. **Il trascinamento verso l'alto entra nell'area di gioco** (PA_Y1=348, `:15903`): è il rischio di occlusione principale dello schema, ed è la misura M2 a doverlo bocciare o assolvere, non io.

### 1.3 La grammatica dei dischi

Un tocco che nasce dentro la presa di un disco viene **catturato** (`btnTouch[id]`, 8829) e non diventa mai una levetta, non importa dove finisca. Questo è già il comportamento di oggi e regala gratis due proprietà: (a) il trascinamento può passare sopra l'altro disco senza attivarlo; (b) il trascinamento può uscire dallo schermo senza rompersi.

Per ogni pressione si registrano: `t0` (istante), `ox,oy` (punto di pressione), `act` (**risolto e congelato alla pressione**, 8825-8835, regola di oggi che resta). Al rilascio si calcolano:

```js
const dt = now - t0;                                   // durata
const dx = xRilascio - ox, dy = yRilascio - oy;        // LETTI DAL PUNTO DI RILASCIO
const d  = Math.hypot(dx,dy);
const m  = clamp((d - DRAG_DEAD)/(DRAG_FULL - DRAG_DEAD), 0, 1);   // ampiezza 0..1
const g  = (t===0) ? +1 : -1;                          // direzione d'attacco
// cono (solo disco piccolo):
//   AVANTI    se  dx*g >  Math.abs(dy)
//   INDIETRO  se  dx*g < -Math.abs(dy)
//   LATERALE  altrimenti, con il segno di dy a dare il lato
```

**`dx,dy` si leggono dal punto di rilascio, non dall'ultimo `touchmove`.** Questa riga sola immunizza l'intera grammatica dei dischi dalla fusione dei `touchmove` che il file documenta a 8882-8896 e che il progetto ha già pagato una volta. Richiede una modifica: `Touch5.end(id)` deve ricevere le coordinate (§8, punto 1). **Solo la levetta e il flick dipendono ancora dal flusso dei `touchmove`.**

Le fasce di durata, identiche sui quattro contesti:

| fascia | nome | disco grande, con palla | disco piccolo, con palla | disco grande, senza | disco piccolo, senza |
|---|---|---|---|---|---|
| 0 – 0,15 | **tap corto** | appoggio corto (`TAP_T`, esiste) | passaggio | contrasto in piedi (parte alla **pressione**) | cambio uomo (parte alla **pressione**) |
| 0,15 – 0,30 | **tap** | tiro (qualità dall'anello) | passaggio | — | cambio uomo |
| 0,30 – 0,55 | **tenuta** | tiro (l'anello comanda) | filtrante / cross / cambio gioco | scivolata | contenimento |
| > 0,55 | **impegno** | tiro (fino a `SHOT_HARDCAP` 1,25) | la stessa cosa, **ma alta** | scivolata dura | contenimento + raddoppio |

Il disco grande con la palla è l'unico dove la durata è già presa: la governa l'anello del timing, che è la meccanica migliore del gioco e non si tocca. Per questo il disco grande usa il **trascinamento** come dimensione nuova, e il piccolo la **durata**. Ognuno dei due dischi impara una cosa sola.

### 1.4 La grammatica della levetta

Invariata: `STICK_DEAD` 12, `STICK_FULL` 46, `STICK_SPRINT` 66, inseguimento a 70 (8642-8688, 8853-8860). Cambia solo il rilascio:

```
rilascio con fspeed > 650 px/s  E  spostamento negli ultimi 90 ms > FLICK_MIN (22 px)
   con la palla   -> TOCCO nella direzione del flick
                     forza = clamp((fspeed-650)/700, 0, 1)
                     la palla parte a 140 + forza*110 unita'/s, owner=-1,
                     p.touchCd = 0.22 (non puo' ripescarla subito)
   senza la palla -> SCIVOLATA nella direzione del flick (come oggi, 8921-8934)
rilascio senza flick -> NIENTE.
```

Il `FLICK_MIN` è nuovo ed è la contromisura specifica alla fusione dei `touchmove`: la deroga di 8896 ricostruisce una velocità onesta da due campioni reali, ma **non garantisce che il dito si sia davvero mosso**. Con il passaggio spostato sul disco, un falso flick non produce più un passaggio involontario ma un **tocco che regala la palla**: è un errore peggiore, e va difeso con un pavimento in pixel oltre che in velocità.

**Lo stato a zero dita.** Levetta rilasciata, o dentro la dead-zone, con la palla e un avversario entro 60 unità: **scudo**. Il corpo si gira dando le spalle all'avversario più vicino, velocità zero, e il moltiplicatore di furto che il file già applica (`stealP *= 0.55` quando il ladro arriva dal verso in cui il portatore guarda, 10670) scende a 0,35. Non è un comando: è ciò che succede se **non** comandi. Alzare il pollice diventa la cosa più sicura che puoi fare, non la più pericolosa.

### 1.5 La bussola e la lente

Un tocco dentro `MINI_RECT + 8`:
- **rilasciato entro 300 ms e 12 px** → **cambio a icona regionale**: passa al proprio giocatore di movimento più vicino al punto di campo toccato.
- **spostato oltre 12 px prima dei 300 ms** → non era la bussola: è una levetta, nata al punto di posa, e non ha perso un fotogramma (era dentro la dead-zone).
- **fermo entro 12 px oltre i 300 ms** → si apre la **LENTE**.

**La lente**: la bussola si ingrandisce di `k = min(2,6; 300/mw)` ancorata all'angolo basso-sinistra (12, 400). A 5v5: 228,8 × 111,8 px, x 12..240,8, y 288,2..400. A 11v11: 300 × 146,6, x 12..312, y 253,4..400. Sopra il pannello, una striscia alta 22 px con **tre chip di mentalità** (`PRUDENTE` / `NORMALE` / `ARREMBANTE`), larghi 74 px l'uno, che sono l'unico posto dello schema con etichette scritte perché sono l'unica cosa che non si può dedurre.

Perché serve la lente, in numeri: a 5v5 la bussola grezza è 0,0765 px per unità di campo; i due difensori del modulo stanno a `fy ±0,16`, cioè 179 unità = **13,7 px** l'uno dall'altro. Con l'errore di puntamento di un pollice quella distanza non basta. La lente li porta a **35,7 px**. A 11v11 la bussola grezza dà 13,3 px fra i centrali e la lente 33,4. *Calcolato sulle posizioni nominali del modulo, non misurato in partita.*

Dentro la lente il rilascio commette: su un giocatore → **cambio a icona** (o, se hai la palla, **chiamata mirata**); sul portiere → **ordine di uscita** (1,2 s di avanzamento aggressivo dentro i limiti di `GK_AREA_X`, 10843; il portiere non diventa mai comandabile — `switchControlled` 9981 lo esclude e resta escluso); su un chip → **mentalità**; fuori → niente.

**Costo dichiarato**: la lente riempie ~25.600 px CSS (102.400 px di periferica a DPR 2) di pannello traslucido più i punti. Non l'ho misurata. Si disegna solo mentre il dito è giù, cioè in un istante in cui non stai muovendo nessuno. Va confermata con `node strumenti/prestazione.js --contro HEAD`, che è l'unico confronto onesto su quel banco.

### 1.6 I contesti, e l'unica ammissione di debolezza dello schema

I dischi hanno **quattro** contesti: possesso, non possesso, palla libera ai piedi nel proprio terzo, portiere con la palla. La ricerca del dossier dice che oltre **due** contesti si diventa indovinelli.

Non ho una scappatoia elegante, ho un argomento e una misura. L'argomento: i quattro contesti collassano in **tre stati che il giocatore sente senza guardare** — «ho la palla / non ce l'ha nessuno o ce l'ha lui / il gioco è fermo e la palla è del mio portiere». E i due che si toccano (non-possesso e palla-libera) producono verbi cugini: contrasto e spazzata sono la stessa intenzione, «togli di mezzo questa palla adesso». Il fallimento è benigno in entrambe le direzioni. La misura M1 deve includere gli errori di contesto nella matrice di confusione, e se il quarto contesto costa più del 2% di verbi sbagliati, si taglia il portiere e si lascia il rinvio automatico com'è oggi.

---

## §2. TABELLA AZIONE → INGRESSO

42 righe. Tre sono parametri continui di altre righe (13, 28, e la potenza della 2): **39 verbi distinti**. Per confronto, dal dossier: DLS ne espone 6, FIFA Mobile ~8, FC Mobile 31 con 5-6 pulsanti più uno strato di gesti.

Legenda della colonna **stato**: ✅ esiste già nel codice · 🔧 richiede solo codice di ingresso · ⚠️ richiede anche una modifica alla simulazione (elencata al §2.5).

### 2.1 Con la palla — disco piccolo (etichetta **PASSA**)

| # | azione | ingresso | risultato | stato |
|---|---|---|---|---|
| 1 | passaggio assistito | tap, nessun trascinamento | `eseguiPassUmano` di oggi (9090): sceglie con `smarcato()` | ✅ |
| 2 | passaggio mirato e pesato | tap + trascinamento | bersaglio = miglior `dot` nel cono (la logica di `eseguiFiltrante` 9155-9167); velocità `clamp((300+dist*0,9)*(0,85+0,30·m), 300, 560)`; anticipo `lead = 0,32 − 0,12·m` | ⚠️ |
| 3 | scarico all'indietro | cono **INDIETRO** | come 2, ma il punteggio ignora il bonus «è avanti» (9099) e raddoppia la penalità di linea occupata | 🔧 |
| 4 | filtrante raso | tenuta 0,30-0,55 + cono **AVANTI** | `eseguiFiltrante` (9143) di oggi, `b.vz=0` | ✅ |
| 5 | filtrante alto | tenuta > 0,55 + cono **AVANTI** | come 4 con `b.vz = 150` — il canale sprecato di `doFiltrante` (9130) messo a frutto | ⚠️ |
| 6 | cross teso | tenuta 0,30-0,55 + cono **LATERALE**, metà campo offensiva (`metaOffensiva`, 8991) | `doCross` (9187) con T al minimo 0,5 | ⚠️ |
| 7 | cross a campanile | tenuta > 0,55 + cono **LATERALE**, metà offensiva | `doCross` con T 0,75; `m` sceglie il punto d'atterraggio fra primo palo (m=0) e secondo (m=1) | ⚠️ |
| 8 | cambio di gioco | tenuta ≥ 0,30 + cono **LATERALE**, **propria** metà | passaggio alto e lungo al compagno più largo su quel lato; `vz = 170` | ⚠️ |
| 9 | chiamata in profondità | tenuta ≥ 0,30, **rilascio al centro** (m = 0) | il compagno scelto scatta nello spazio per 1,6 s; **la palla resta a te** | 🔧 |
| 10 | dai-e-vai | uno qualunque di 1-8 **+ sprint tenuto al rilascio** | il passatore scatta, `G.swLock[t]=0,75` (esiste, 9965) impedisce al cambio automatico di rubartelo | 🔧 |
| 11 | finta di passaggio | tenuta ≥ 0,30 poi **flick della levetta** | il passaggio si annulla (`chiudiAnticipo`, 9450), **la chiamata resta partita**, la palla viene spinta col tocco | 🔧 |

### 2.2 Con la palla — disco grande (etichetta **TIRA**)

Il trascinamento non ha coni. `ax = clamp(dx·g/44, −1, 1)`, `ay = clamp(dy/44, −1, 1)`.

| # | azione | ingresso | risultato | stato |
|---|---|---|---|---|
| 12 | tiro col timing | pressione, rilascio nella finestra dell'anello | `startCharge`/`releaseCharge`/`fireShot` di oggi, con `SHOT_MIN` 0,50 e `SHOT_MAX` 0,80 e la grazia ±45 ms della tecnica (9233) | ✅ |
| 13 | *mira nella bocca* | `ay` (continuo) | sostituisce `dy += my*260` (9238) con `dy += ay*(GOAL_H/2 + 30)`. La bocca è verticale sullo schermo: **il pollice sinistro non serve più per mirare** | 🔧 |
| 14 | tiro di precisione | `\|ay\| > 0,7` al rilascio | potenza −18%, errore angolare del timing dimezzato, `b.curve` verso l'angolo mirato (la curva esiste, 10712, e oggi è solo un premio del perfetto) | 🔧 |
| 15 | tiro teso | `ax > +0,5` | potenza +14%, `b.vz = 0` forzato, il portiere legge più tardi | 🔧 |
| 16 | pallonetto | `ax < −0,5` | `fireShot(..., lob=true)` (9313), che oggi si raggiunge solo con lo sprint tenuto | ✅ |
| 17 | appoggio corto / spazzata al volo | rilascio sotto `TAP_T` (0,15) | `releaseCharge` 9226-9231, nella direzione del **trascinamento**, non più della levetta | ✅ |
| 18 | tiro al volo | carica aperta + palla in arrivo a sp>200 | 10777-10820. Richiede la riparazione del cancello di `startCharge` (§2.5) | ⚠️ |
| 19 | rovesciata | pressione con palla alta in discesa in area, spalle girate | `finestraRovesciata` 9549 | ✅ |
| 20 | finta di tiro | carica aperta + **flick della levetta** | la carica si chiude, la palla viene spinta. **La finta non è un verbo nuovo: è la composizione di due verbi** | 🔧 |

### 2.3 Con la palla — levetta

| # | azione | ingresso | risultato | stato |
|---|---|---|---|---|
| 21 | tocco lungo (knock-on) | flick **avanti** | la palla parte a 140-250 u/s, `owner=-1`, tu la insegui. La riprendi dal cancello di raccolta che esiste (`d<20,8 && sp<420`, 10823) | 🔧 |
| 22 | arresto secco | flick **indietro** | come 21: la palla torna verso di te e tu sei già fermo (hai lasciato la levetta). **Gesto ed effetto coincidono** | 🔧 |
| 23 | taglio laterale | flick **di lato** | come 21 | 🔧 |
| 24 | scudo | **niente**: levetta a riposo con avversario entro 60 | corpo girato, `stealP` ×0,35 | ⚠️ |
| — | corsa analogica | levetta | `humanMove` 8643 | ✅ |
| — | sprint | levetta oltre 66 px | `humanSprint` 8665 | ✅ |

### 2.4 Senza la palla, bussola, portiere

| # | azione | ingresso | risultato | stato |
|---|---|---|---|---|
| 25 | contrasto in piedi | disco grande, **alla pressione** | tentativo di furto a 24 unità, finestra 0,18 s, `p.recover = 0,22` se fallisce. Nessun corpo a terra | ⚠️ |
| 26 | scivolata | disco grande, tenuta 0,30-0,55, al rilascio | `startSlide` 9501 | ✅ |
| 27 | scivolata dura | disco grande, tenuta > 0,55 | portata ×1,25, velocità ×1,15, `DIETRO_DOT` più severo: il cartellino diventa **una scelta** invece di una deduzione | ⚠️ |
| 28 | *mira della scivolata* | trascinamento durante la tenuta | sostituisce la lettura della levetta in `doSlide` 9489: **il pollice sinistro resta libero di posizionarti** | 🔧 |
| 29 | spazzata comandata | disco grande con palla libera entro 40 nel proprio terzo (etichetta **SPAZZA**) | calcio a 420 u/s nella direzione del trascinamento, o verso la fascia più vicina se m=0 | 🔧 |
| 30 | cambio ciclico | disco piccolo, tap senza trascinamento, **alla pressione** | `cambiaGiocatore` 9956, per angolo attorno al pallone | ✅ |
| 31 | cambio direzionale | disco piccolo, tap + trascinamento | prende il compagno nel cono invece del successivo in senso orario | 🔧 |
| 32 | contenimento (jockey) | disco piccolo, tenuta 0,30-0,55 | velocità ×0,62, faccia sempre sul portatore, resta sul lato porta. Riusa `contieni`/`standoff` della CPU (11726-11742), che a Duro oggi è codice morto | ⚠️ |
| 33 | raddoppio comandato | disco piccolo, tenuta > 0,55 | il compagno più vicino al portatore lo pressa per 2,5 s; il ruolo `raddoppio` esiste (11758-11770) ma solo per 7 e 11 e solo automatico | ⚠️ |
| 34 | scivolata a flick | levetta, flick verso l'avversario | 8921-8934, invariata: retrocompatibilità dei riflessi | ✅ |
| 35 | cambio a icona regionale | tap sulla bussola | il proprio uomo più vicino al punto toccato | 🔧 |
| 36 | lente: scelta dell'uomo | bussola tenuta ≥ 0,30, rilascio su un punto | cambio a icona nominale | 🔧 |
| 37 | chiamata mirata | come 36, **con la palla** | quel compagno scatta; **non cambi uomo** | 🔧 |
| 38 | uscita del portiere | lente, rilascio sul portiere | ordine di uscita 1,2 s | ⚠️ |
| 39 | mentalità (3 stati) | lente, rilascio su un chip | soglia di `avanz` del `teamBrain` (11570) spostata di ±0,10 | ⚠️ |
| 40 | rinvio lungo mirato | portiere con la palla: disco grande, tenuta + cono | 1,4 s di finestra (oggi `kickCd=0,9`) | ⚠️ |
| 41 | appoggio a terra | portiere con la palla: disco piccolo, tap | al più smarcato vicino, `vz=0` | ⚠️ |
| 42 | lancio teso mirato | portiere: disco piccolo + cono | 470 u/s nel cono | ⚠️ |

**Se non tocchi niente**, il portiere rinvia da solo a 1,4 s come fa oggi a 0,9. Lo stato a zero dita resta neutro anche qui.

### 2.5 Cosa di questo schema la simulazione premia già, e cosa no

Questa sezione esiste per la regola 2 della casa. Un vocabolario che il gioco non premia è una tastiera.

| verbo | dipende da | oggi |
|---|---|---|
| 2 (peso del passaggio) | **il primo tocco può sporcarsi** | Il dossier di fisica ha misurato che alla presa la velocità cambia di 1-6 unità su lanci da 150 a 600 u/s: **non c'è nessun evento di controllo**. Finché il primo tocco non può sbagliare, «forte» e «morbido» non sono una scelta: sono due suoni diversi. **Il peso del passaggio è un tasto finto finché quella riga non cambia.** |
| 5, 6, 7, 8 (tutto ciò che vola) | **l'attrito dell'aria** | Misurato dal dossier: la palla in volo paga l'attrito dell'erba, e **ogni cross cade fra il 24% e il 31% corto del bersaglio dichiarato**. Mirare il secondo palo oggi consegna la palla sul dischetto. |
| 6, 7 (cross) | **qualcosa che li attacchi** | Non esiste il colpo di testa. Un cross può solo atterrare. Il cross a campanile oggi è decorazione. |
| 24 (scudo) | il moltiplicatore 0,55 esiste (10670) | La fisica c'è, il comando no, il disegno no. È la voce più economica della lista. |
| 21, 22, 23 (tocco) | niente | Funzionano oggi: `owner=-1` e il cancello di raccolta esistono. |
| 9, 37 (chiamata) | un ramo in `aiDecide` | Un campo per giocatore e un `if` in cima a un ciclo che gira già. |
| 32 (contenimento) | l'aggancio umano a `contieni` | A Duro `standoff=0`: la voce va rimessa in vita, non solo agganciata. |
| 12-17 (tiro) | niente | L'anello del timing è l'unica meccanica del gioco totalmente indipendente dalla camera, perché il suo contenuto è il tempo. È il pavimento su cui tutto il resto si appoggia. |

**Ordine onesto di implementazione**: prima le tre riparazioni di fisica del dossier (il corpo ferma la palla; la palla in volo non paga l'erba; il primo tocco può sporcarsi), **poi** questo schema. Al contrario si costruisce una tastiera.

---

## §3. COME SI SCOPRE, E COME SI RICORDA

### 3.1 Il disco che si racconta

**È il meccanismo centrale, e costa zero pixel nuovi.** L'etichetta di un disco premuto smette di dire il verbo base e dice **il verbo che uscirebbe adesso**, aggiornata a ogni fotogramma da durata e trascinamento:

```
premi PASSA ...................... l'etichetta dice PASSA
tieni oltre 0,30 ................. diventa CHIAMATA
trascini in avanti ............... diventa FILTRANTE
continui a tenere oltre 0,55 ..... diventa FILTRANTE ALTO
scivoli di lato .................. diventa CROSS   (o CAMBIO GIOCO nella tua metà)
torni al centro .................. torna CHIAMATA
```

Tre proprietà che nessun altro meccanismo del catalogo ha insieme:
1. **È autodocumentante come un menu radiale** (meccanismo R del dossier, che costa 600-1000 ms e nessun gioco di calcio usa) **al costo di un flick** (meccanismo D), perché il menu non si disegna: si legge dove l'occhio è già.
2. **Si può abortire.** Vedi il nome prima di commettere. Torni al centro e rilasci: hai fatto la cosa base.
3. **Rende visibile il modificatore di zona.** La ricerca condanna le zone contestuali invisibili di FC Mobile («nessuno sa dov'è la zona cross»). Qui la zona ha un nome scritto sotto il pollice: se dice CROSS sei in metà campo offensiva, se dice CAMBIO GIOCO no.

Costo: una stringa di 9-14 caratteri già disegnata ogni fotogramma da `drawTouchButtons`. Non l'ho misurato; è la stessa `fillText` di oggi con un altro argomento.

### 3.2 Le soglie si sentono, non si guardano

Il compito chiede che ogni azione sia raggiungibile **senza guardare**. L'etichetta è per imparare; per giocare servono i polpastrelli. `buzz()` esiste (6500) ed è gratis:

| evento | pattern |
|---|---|
| soglia 0,30 attraversata | `buzz(8)` |
| soglia 0,55 attraversata | `buzz(14)` |
| il cono cambia | `buzz(5)` |
| il trascinamento supera `DRAG_DEAD` | `buzz(4)` |

Quattro vibrazioni corte, tutte distinguibili per durata, tutte sotto la soglia in cui una vibrazione disturba. **Da qui in poi il disco si suona a occhi chiusi**: senti il primo colpetto, sai che sei in tenuta; senti il secondo, sei nell'impegno. È l'equivalente tattile del tacco di una levetta vera, ed è la sola risposta seria che conosco al vincolo «senza guardare». (Non l'ho provato. `SAVE.vib` lo spegne, e con esso questa risposta: chi gioca senza vibrazione ha solo l'etichetta.)

### 3.3 Il tutorial diventa quattro passi più dodici inviti

I quattro passi di `Tut.steps` (29120-29125) restano, e uno cambia:

```js
{ k:'move',  tc:'<b>Trascina il dito</b>: lo stick ti fa correre' },              // invariato
{ k:'pass',  tc:'Tocca <b>PASSA</b>. Tienilo premuto e cambia idea.' },           // NUOVO
{ k:'shot',  tc:'Tieni <b>TIRA</b>, lascia sull\'ambra. Trascina su o giu\': miri.' },
{ k:'slide', tc:'Senza palla: tocca <b>CONTRASTA</b>. Tienilo: e\' scivolata.' },
```

Nota che il secondo passo non insegna *un gesto*: insegna **la grammatica** («tienilo premuto e cambia idea»). Con quattro parole si consegnano undici verbi, perché la regola è una sola.

Poi, gli **INVITI**. Una tabella di dodici voci con `{verbo, condizione, testo}` valutata a 4 Hz (in coda a `teamBrain`, `BRAIN_HZ=0,25`, quindi nessun ciclo nuovo). Quando la *situazione* per un verbo mai usato si presenta, una pastiglia di una riga compare per 2,2 s accanto al disco che la esegue:

| verbo | condizione | testo |
|---|---|---|
| cross | metà offensiva, sull'esterno, ≥1 compagno in area | «TIENI **PASSA** e scivola di lato» |
| chiamata | possesso, un compagno con ≥120 unità di spazio davanti | «TIENI **PASSA**: lui parte» |
| tocco lungo | sprint, avversario a 30-70 unità davanti | «**FLICK** avanti: allunghi e vai» |
| contenimento | ultimo uomo, portatore a 40-90 unità | «TIENI **CAMBIO**: contieni» |
| … | | |

Regole degli inviti, tutte necessarie: **massimo uno per partita**; mai negli ultimi 15 s; mai con una carica aperta; mai due volte per lo stesso verbo; **mai più dopo che quel verbo è stato usato una volta** (`SAVE.visto[verbo]`, la stessa idea di `Tut.fatti`, 29131). Un giocatore incontra così i 39 verbi in una ventina di partite, senza mai leggere niente, e chi li conosce già non vede mai una pastiglia.

### 3.4 Perché si ricorda: quante associazioni arbitrarie ci sono davvero

Nacenta (CHI 2013, via il dossier) dice che gli errori sui gesti sono **di associazione**, non di forma. Quindi la domanda giusta non è «quanti gesti» ma «quante associazioni arbitrarie». Conto:

| cosa | arbitraria? |
|---|---|
| grande = attaccare la porta / aggredire; piccolo = dare la palla / organizzare | no: etichettata, e in due contesti soli |
| trascinamento = **dove/chi** | no: manipolazione diretta |
| trascinamento verticale sul grande = punto della porta | no: la bocca è verticale sullo schermo |
| flick con la palla = la palla va là | no: metafora fisica |
| **tenuta = impegno, e con la palla = quota** | **sì — 1** |
| **trascinamento indietro sul grande = alzare la palla** | **sì — 1** (metafora della fionda) |
| flick senza palla = scivolata | già imparata oggi |
| bussola = scegli l'uomo | no: manipolazione diretta |

**Due associazioni arbitrarie in tutto lo schema**, contro le sette che il dossier conta sui due soli pulsanti di FC Mobile (Tira+giù = finesse, Tira+su = pallonetto, Tira+sx = finta, Passa+su = lob, Passa+giù = passa-e-vai, Passa+dx = teso, Passa+sx = teso alto). È il numero che, secondo me, decide se questo schema regge o no — e **non l'ho verificato con nessuno**.

---

## §4. LA REGOLA DI PRECEDENZA

Deterministica, valutata nell'ordine scritto. Non c'è un caso in cui due rami possano rivendicare lo stesso tocco.

### 4.1 Alla pressione (`Touch5.start`)

```
1. scena modale (moviola, ripresa) -> consuma e basta                      [oggi, 8956-8957]
2. t = teamOf(x)                                                            [oggi, 8812]
3. se G.tDeb[t] > 0  ->  tocco morto  (DEB_CTX, §5.3)                                [NUOVO]
4. per ogni disco di touchBtnLayout(t), in ordine PICCOLO poi GRANDE:
     se dist <= r+10  ->  cattura, risolvi e CONGELA act, esegui l'eventuale
                          azione istantanea, esci                          [oggi, 8825]
     se dist <= r+18  ->  TOCCO MORTO: niente levetta, niente azione       [oggi, 8836]
5. se dentro MINI_RECT+8 e la levetta del team t non e' attiva
     -> nasce la levetta E si apre la candidatura bussola                            [NUOVO]
6. altrimenti -> nasce la levetta (se libera; se occupata, il tocco e' ignorato) [oggi]
```

Il punto 4 gira **dal piccolo al grande**, non viceversa: se un giorno le prese si sovrapporranno (impostazione «compatto», §5.5), vince il piccolo. **La ragione è dichiarata: i verbi del disco piccolo sono quelli recuperabili.** Un passaggio sbagliato costa il possesso, un tiro sbagliato costa il possesso *e* una posizione, una scivolata sbagliata costa il possesso, la posizione e forse un giallo. In un tocco ambiguo vince il verbo che perdona.

### 4.2 Le sei precedenze in chiaro

1. **Il contesto si congela alla pressione.** Se perdi la palla mentre tieni TIRA, esce comunque un tiro (o un appoggio). Regola di oggi, 8825-8827, e resta: un gesto in corso non cambia specie sotto il dito.
2. **La cattura vince la geometria.** Un dito catturato da un disco non attiva mai un altro disco, né una levetta, né la bussola, ovunque vada. Regola di oggi, 8846.
3. **Annullare è sempre permesso.** Il flick della levetta ha la precedenza su qualunque carica aperta sul disco grande o piccolo: chiude l'anticipo (`chiudiAnticipo`, 9450, già chiamato da `doPass` e `doFiltrante`) e spinge la palla. È da qui che nascono la finta di tiro e la finta di passaggio, senza un gesto nuovo. La regola generale: **fra due verbi possibili nello stesso istante, vince quello che il giocatore può disfare.**
4. **La bussola e la levetta non competono**, perché sotto i 12 px la levetta non produce movimento (`STICK_DEAD`) e la bussola non produce nient'altro. Si risolve al rilascio, e nessuno dei due ha perso un fotogramma.
5. **Un tocco vale un verbo.** Non esistono accordi a due dita da nessuna parte in questo schema — niente prefisso accordato (meccanismo E), niente claw. I due dischi sono entrambi sotto il pollice destro e **non possono essere premuti insieme**: è un limite fisico, e lo schema non ci prova nemmeno.
6. **Il doppio tocco non esiste.** Zero occorrenze in tutta la grammatica. Costava una finestra di rilevamento di 250-300 ms sul tocco singolo, cioè sul verbo più frequente, e in cambio dava ×2 su un canale che la tenuta già dava senza pegno.

---

## §5. I CASI LIMITE

### 5.1 Il dito che scivola sul disco

Il polpastrello ruota mentre preme: è la ragione di `DRAG_DEAD = 14` invece dei 12 della levetta. Il disco è convesso e il pollice ci pivota sopra più di quanto non faccia su un'area libera. **Non ho misurato il rollio del pollice**: 14 è una stima, ed è il primo numero che la misura M1 può dichiarare sbagliato — se i tap puliti producono più del 3% di trascinamenti falsi, `DRAG_DEAD` sale a 18 e la corsa piena a 46.

Il dito che **esce** dalla presa mentre trascina non perde niente (cattura). Il dito che esce **dallo schermo** genera `touchcancel`, che oggi passa da `Touch5.end` (8968-8970): con la mia modifica `end` riceve le coordinate, e in `touchcancel` le coordinate sono l'ultimo punto noto. Regola: **un `touchcancel` esegue il verbo base**, mai il modificato. Un dito che esce dal bordo non deve poter tirare un pallonetto.

### 5.2 Il browser che fonde i `touchmove`

Il gioco l'ha già pagato una volta e la contromisura è scritta a 8882-8896. Il mio schema fa tre cose:
- **Toglie l'intera grammatica dei dischi dalla dipendenza dai `touchmove`**: durata e trascinamento si leggono da `t0` e dal **punto di rilascio**, che il browser consegna sempre. Sotto affanno il disco funziona esattamente come a riposo. Questa è la proprietà più importante dello schema sul piano delle prestazioni, ed è gratis.
- **Aggiunge `FLICK_MIN = 22 px`** al flick, perché con il passaggio spostato sul disco un falso flick non è più un falso passaggio ma un pallone regalato.
- **Non aggiunge nessun altro gesto che dipenda dal flusso dei move.** La lente usa la posizione istantanea del dito, che si può leggere anche da un solo `touchmove` ogni cinque: la lente si aggiorna a scatti, e non è un problema perché commette al rilascio.

### 5.3 Il tocco doppio accidentale

Non c'è un doppio tocco nella grammatica, quindi un secondo tocco produce un secondo verbo base. Il caso cattivo è il **cambio di contesto causato da te**: passi, il disco piccolo si rietichetta da PASSA a CAMBIO, e il tuo secondo tocco involontario ti stacca dal passatore, uccidendo il dai-e-vai. Contromisura:

```js
DEB_CTX = 0.18;   // dopo un cambio di contesto causato da un TUO gesto,
                  // i dischi ignorano una nuova pressione per 180 ms
```

180 ms perché è appena sopra il tap medio (133 ms) e appena sotto la soglia in cui un comando ignorato si sente come un comando perso. **Non l'ho misurato.**

### 5.4 Mani grandi

Un pollice da 25 mm copre ~150 px CSS: **più dell'intera coppia di dischi**, che occupa 188 px da bordo a bordo. L'anello di esclusione difende dal *quasi* colpito, non dal disco sbagliato.

Rimedio, lo stesso che FC Mobile ha dovuto aggiungere in patch: **impostazione «distanza dei comandi», tre passi**, che sposta il piccolo lungo l'arco:

| passo | centro del piccolo | fra i centri | prese | varco |
|---|---|---|---|---|
| compatto | (773, 346) | 78,2 px | 46 / 36 | −3,8 px → **le prese si sovrappongono**, e vince il piccolo (§4.1) |
| **normale** (oggi) | (757, 340) | 94,8 px | 50 / 40 | +4,8 px |
| largo | (735, 326) | 119,1 px | 50 / 40 | +29,1 px |

Il passo «compatto» **ha un varco negativo e lo dichiaro**: è per chi ha mani piccole e preferisce raggiungere entrambi i dischi senza spostare la mano, pagando in tocchi ambigui risolti a favore del passaggio. Non è un'opzione da consigliare; è un'opzione da avere.

Niente in questo schema legge una coordinata scritta a mano: tutto passa da `touchBtnLayout`, e `TOUCH_ZONE` (25583, esportato da `__test.comandiTouch`, 30155) resta l'unica verità per il banco. Il commento a 8768-8772 avverte che `strumenti/giocata.js` preme ancora `(vw-66, vh-140)` e `(vw-70, vh-232)`, che **non sono più i centri già oggi**: quel cancello va riscritto prima di questo schema, non dopo.

### 5.5 Schermo piccolo

Le posizioni sono relative a VW/VH e seguono. Sotto **VW = 720** i 188 px della coppia diventano il 26% della larghezza:

```
se VW < 720:  r piccolo 30 -> 26,  distanza 94,8 -> 88,
              prese 50/40 -> 46/36  (46+36 = 82 < 88, varco +6)
              DRAG_FULL 44 -> 38
```

Sotto **VW = 560** rinuncio: la lente non ci sta (300 px sarebbero il 54% della larghezza) e la coppia di dischi mangia un terzo del quadro. A quel punto lo schema degrada al vocabolario di oggi più le tenute, senza trascinamento e senza bussola. **Non ho verificato che il gioco sia giocabile a 560 px**: dico solo cosa fa questo schema lì.

### 5.6 Il giocatore mancino

`touchBtnLayout` sa già specchiarsi: la variabile `right` (8774-8776) esiste per lo schermo diviso a due giocatori. Serve `SAVE.mancino` che, per il team 0 in modalità a un giocatore, forzi `right = false` (dischi a sinistra, centri (64, 352) e (158, 340)) **e sposti la bussola a `mx = VW − 12 − mw`** (x 813..905 a 5v5). Vanno specchiate anche tre regole di scarto dell'HUD che leggono `MINI_RECT.x0 < 12+126+6` (25345, 25409, 25535, 28644) e la `casaPollice` (24982-24984), che oggi riserva l'angolo basso-sinistra alla levetta. È **la modifica con più righe di tutto il progetto** e non produce un verbo nuovo: circa quaranta righe di specchiatura sparse in cinque punti. Va fatta lo stesso: un gioco che si tiene in una mano sola non può presumere quale.

### 5.7 Due giocatori, schermo diviso

`teamOf` divide per metà schermo (8812) e la bussola è **una sola**, nella metà del team 0. Conseguenza netta: **il team 1 non ha bussola, quindi non ha il cambio a icona, non ha la lente, non ha l'ordine al portiere e non ha la mentalità.** Quattro verbi su trentanove sono asimmetrici in due giocatori. Le alternative sono due, entrambe brutte: una seconda bussola (che ruba 108×63 px al quadro condiviso) o niente. Scelgo niente, e lo dichiaro qui invece di lasciarlo scoprire.

### 5.8 Il pollice sinistro che deve lasciare la levetta

Per toccare la bussola devi togliere il pollice dalla levetta: perdi 250-400 ms di movimento comandato. Non è un difetto rimediabile — è il prezzo del meccanismo. È mitigato dal fatto che la levetta è *che-insegue* e nasce dove il dito si posa: rimetterlo giù non costa mira. E il momento in cui si tocca la bussola è quello in cui stai cambiando uomo, cioè quello in cui il movimento del vecchio uomo non ti interessa più.

---

## §6. COSA QUESTO SCHEMA NON PUÒ FARE

1. **Il passaggio base diventa più lento.** Oggi `doPass` parte alla pressione con 50 ms di anticipo (`PASS_CAR_U`, 9057-9062). Con la tenuta come modificatore deve partire al **rilascio**: la latenza diventa la durata del tap del giocatore, mediana ~133 ms secondo il dossier. Mitigazione: la posa di anticipo si suona durante la pressione e `PASS_CAR_U` va a zero sul ramo del tap, recuperando i 50 ms. **Costo netto stimato: +30 ms sulla mediana del gesto più frequente del gioco.** Stimato, non misurato: è la misura M3, e se sfora si torna indietro.
2. **Non si può convertire un tiro caricato in un passaggio.** Puoi annullarlo (finta) e poi passare, ma costa ~200 ms. Oggi da tastiera si può (`doPass` chiama `chiudiAnticipo`). È una perdita reale, e la accetto perché è anche una simulazione onesta: da un caricamento non si esce in un passaggio senza pagare.
3. **Non si possono premere i due dischi insieme.** Sono entrambi sotto il pollice destro. Nessun accordo, nessun prefisso, nessun claw.
4. **Zero skill move.** Manca il secondo stick e mancano i pixel: il segnale che *nomina* una skill move è un moto d'arto di ~6 unità = 15 px di periferica, contro i 425 di un passaggio, e i provini ciechi del progetto dicono che perfino il corpo intero è nominabile 0-2 volte su 10. Non si compra.
5. **Non si comanda il portiere.** Si ordina un'uscita e si sceglie come riparte. `switchControlled` (9981) e `cambiaGiocatore` (9959) continuano a escluderlo.
6. **La tattica è tre stati, non venti**, e cambiarla costa ~700 ms in cui non ti muovi. Non c'è dpad e non deve esserci.
7. **Non si sceglie il compagno per nome o per numero in partita.** Si sceglie per cono (4 possibilità) o per posizione sulla bussola (che costa la levetta).
8. **A 11 contro 11 il cono è meno selettivo**: con dieci compagni sparsi su 2300×1120, un cono di 90° ne contiene spesso tre. La disambiguazione ricade sul `dot` migliore e sullo smarcamento (9155-9167), cioè su un'assistenza. **Non ho misurato quanto spesso il cono a 11 consegni il compagno inteso**: è dentro M1.
9. **Non crea colpi di testa, corner, rimesse né fuorigioco.** Non esistono nella simulazione, e la gabbia è un'identità dichiarata (`:2910`), non un limite d'ingresso.
10. **Non ha niente per il giocatore che gioca con una mano sola.** Il dossier dice che il 49% delle osservazioni di Hoober era a una mano e che «due pollici in orizzontale» era circa l'1,5%. Questo schema presume due pollici. La sua unica concessione al vincolo è lo stato a zero dita, che è sicuro: se una mano se ne va, il tuo uomo protegge palla invece di regalarla.

---

## §7. COME SI MISURA CHE FUNZIONA

Tre misure, tutte eseguibili da una macchina, tutte capaci di fallire davvero. Per ognuna scrivo **perché la via più corta per farla diventare verde è la cosa che voglio**, perché è lì che la casa ha perso ventidue volte.

### M1 — Prova di discriminazione dell'ingresso (`strumenti/_m-gesti.js`)

**Cosa fa.** Per ciascuno dei 39 verbi, sintetizza il gesto **200 volte** con rumore umano, in Playwright, e verifica che il verbo eseguito sia quello inteso.

Il rumore non è decorativo, è la misura:
- durata del tap estratta da una normale **media 133 ms, deviazione 83** (dal dossier), troncata a [40, 900];
- angolo del trascinamento perturbato di **±18°** uniformi attorno all'asse nominale del cono;
- ampiezza del trascinamento perturbata di **±10 px**;
- flusso dei `touchmove` **deliberatamente fuso: uno ogni cinque, più il `touchend`** — esattamente il guasto che il file documenta a 8882;
- posizione della pressione perturbata di **±9 px** dentro la presa;
- stato del gioco casualizzato su 40 semi, incluse le quattro combinazioni di contesto.

**Vincoli obbligatori dello strumento**, senza i quali attesta invece di misurare:
- deve **spedire veri `TouchEvent` sul canvas**, mai chiamare `Touch5.start/move/end`. Chiamare l'oggetto salta i listener e salta la fusione, cioè salta le due cose che la prova esiste per provare;
- deve emettere la **matrice di confusione completa** 39×40 (i 39 verbi più «niente»), non una percentuale.

**Cancello.**
- ogni verbo **base** (1, 12, 25, 30) ≥ **0,97**;
- ogni verbo **avanzato** ≥ **0,90**;
- **nessun verbo può confondersi in un verbo non-base sopra 0,02**;
- gli errori di **contesto** (verbo giusto, contesto sbagliato) ≤ **0,02** in totale.

**Perché non si supera per la via più corta.** I quattro coni partizionano i 360°: allargare AVANTI restringe LATERALE, e i campioni a ±18° dal confine cadono dall'altra parte. **La somma dei tassi è conservata.** Lo stesso per le durate: abbassare `DISC_HOLD` da 0,30 a 0,20 fa passare più tenute e fa fallire i tap, perché con media 133 e deviazione 83 circa un tap su tre supera 216 ms. E la clausola sui verbi base a 0,97 impedisce la scorciatoia opposta — quella per cui si fa cadere tutto sul verbo base e si dichiara vittoria con un vocabolario vuoto. **Non esiste una taratura che alzi tutte e quattro le voci del cancello insieme: l'unica via è che la grammatica sia davvero separabile.**

**Può fallire?** Sì, e scommetto che oggi fallisce almeno sul flick: la soglia di 650 px/s con un flusso fuso a uno su cinque è precisamente il caso che ha già morso questo progetto.

### M2 — Prova di occlusione (`strumenti/_m-pollice.js`)

**Cosa fa.** Riproduce le tracce di tocco generate da M1 su partite vere, e per ogni fotogramma disegna un **disco di 150 px CSS di diametro** (25 mm, la cifra NN/g del dossier) centrato su ogni tocco attivo, più le case a riposo (levetta a (96,272), i due dischi). Poi conta quante volte quel disco copre qualcosa che serve a decidere.

**Cancello.**
- **pallone** coperto in < **0,5%** dei fotogrammi (raggio disegnato letto da `__test.pallaRaggio()`, non stimato);
- **giocatore comandato** coperto in < **2%**;
- **bocca della porta** (il segmento `GOAL_H` × S2) intersecata in < **5%**;
- e, separatamente, **la lente aperta**: pallone coperto in < **1%** dei fotogrammi in cui è aperta.

**Perché non si supera per la via più corta.** Il raggio del pollice è una costante dichiarata nello strumento **con la sua fonte accanto**, e non è un parametro di taratura: restringerlo è una modifica visibile nel diff dello strumento, non una taratura del gioco. Le posizioni dei tocchi non sono scelte a mano: **vengono dalle tracce di M1**, cioè dal comportamento che lo schema stesso pretende. E lo strumento **emette come PNG i cinque fotogrammi peggiori di ogni categoria**: un numero verde accanto a un fermo immagine con il pallone chiaramente sotto il pollice è la trappola che questo progetto ha già visto otto volte di fila (la posa dell'HUD che forzava `poss=true`), e qui non può nascondersi.

**Può fallire?** Molto probabilmente sì, in due punti che ho progettato sapendo di rischiarli: il trascinamento verticale porta il pollice da y 352 a y 308, cioè **dentro** l'area di gioco (PA_Y1 = 348); e la lente a 11 contro 11 occupa 300×147 px in basso a sinistra.

### M3 — Il prezzo dichiarato si paga, e non di più (`strumenti/_m-prezzo.js`)

Questo schema ha **due costi dichiarati**. Questa misura verifica che siano quelli e non altri, confrontandosi con `HEAD`.

**(a) Latenza del passaggio.** A passo fisso 1/60 e seme fisso, si inietta la pressione a un fotogramma noto e si conta **quanti fotogrammi passano prima che la velocità del pallone cambi** — non prima che un flag si accenda. 400 ripetizioni con durate di tap estratte dalla stessa distribuzione di M1.
Cancello: **mediana ≤ mediana di HEAD + 2 fotogrammi (33 ms)**; 90° percentile ≤ HEAD + 4 fotogrammi. Contrasto in piedi e cambio uomo: **≤ HEAD** (partono alla pressione, non possono peggiorare).

**(b) Lo stato a zero dita è neutro.** 300 prove: durante il possesso umano, si alzano tutte le dita per 1,5 s a un fotogramma casuale. Si misura **se il possesso è ancora della stessa squadra 1,5 s dopo**.
Cancello: perdita di possesso < **12%**. E si misura prima lo stesso numero su HEAD, dove il rilascio della levetta chiama `doPass` (8948-8949): quel numero è il riferimento, e va pubblicato accanto.

**Perché non si supera per la via più corta.** (a) misura il **pallone**, non l'ingresso: non si può vincere dichiarando il passaggio prima, il pallone deve muoversi. E il confronto è `--contro HEAD`, quindi non si può vincere ridefinendo il riferimento. (b) misura il **possesso a 1,5 s**, non «è partito un passaggio»: uno schema che eviti il passaggio involontario e poi perda comunque la palla perché il giocatore resta fermo come un birillo fallisce lo stesso — che è esattamente il motivo per cui lo scudo automatico (§2.3, riga 24) fa parte dello schema e non è un ornamento.

**Può fallire?** (a) è il costo che ho scritto io in §6.1 e non so di quanto sia; (b) può fallire se lo scudo non basta contro due avversari.

**Una quarta, se c'è tempo e a costo quasi zero**: contare, su venti partite di un robot che gioca con una politica fissa, **quanti dei 39 verbi arrivano davvero al campo**. Non come cancello — è troppo facile da soddisfare con un robot che li spara tutti — ma come **numero da pubblicare accanto agli altri**, perché è l'unico che risponde alla domanda vera: quanti di questi verbi un giocatore vero incontrerà mai. Il dossier ha già mostrato cosa succede quando nessuno lo chiede: `doCross` ed `eseguiFiltrante` scritti, funzionanti e **zero volte in dodici partite**.

---

## §8. IL DELTA DI IMPLEMENTAZIONE

Perché il progetto si possa implementare da come è scritto. Tutte le righe si riferiscono a `CALCETTO-il-gioco.html`.

| # | dove | cosa |
|---|---|---|
| 1 | 8961-8970 | `Touch5.end(id)` → `Touch5.end(id, x, y)`; i tre listener passano `touchXY(t)`. In `touchcancel` si passa l'ultimo punto noto e si forza il **verbo base**. **È la modifica che immunizza tutto il resto dalla fusione dei `touchmove`.** |
| 2 | 8807, 8846 | `btnTouch[id]` diventa `{t, act, t0, ox, oy, dx, dy}`; `move()` aggiorna `dx,dy` per i tocchi catturati invece di uscire subito (serve solo per l'etichetta viva, non per la risoluzione). |
| 3 | 8798-8804 | `touchBtnLayout` restituisce anche `verb`, calcolato dallo stato vivo del tocco: è il **disco che si racconta**. Le etichette diventano TIRA/**PASSA** e CONTRASTA/CAMBIO, più i contesti SPAZZA e LANCIA/APPOGGIA. |
| 4 | 8825-8835 | alla pressione: `shot`→`startCharge` (invariato); `pass`→ solo la posa d'anticipo; `slide`→`doContrasto` (nuovo); `swap`→`cambiaGiocatore` (invariato). |
| 5 | nuova, ~70 righe | `rilasciaDisco(bt, x, y)`: la tabella deterministica del §2. È l'unico posto in cui la grammatica vive. |
| 6 | nuova, ~25 righe | `doContrasto(p)`: portata 24, finestra 0,18 s, `recover 0,22` sul fallimento. |
| 7 | nuova, ~18 righe | `tocco(p, nx, ny, forza)`: `owner=-1`, velocità 140-250, `p.touchCd=0,22`. La riraccolta usa il cancello che esiste (10823). |
| 8 | 8898-8951 | `Touch5.release` riscritta: via il passaggio, dentro `FLICK_MIN`, e i due rami tocco/scivolata. |
| 9 | nuova + 11647 | `chiamata(p, cono)`: `q.runT=1,6`, `q.runX/runY`. In `aiDecide`, un `if(p.runT>0)` in cima che ignora il ruolo per la durata. Un campo e un ramo dentro un ciclo che gira già. |
| 10 | 11726-11742 | il ramo `contieni` si apre anche ai compagni di una squadra umana (oggi `isCpuTeam` lo chiude, e a Duro `standoff=0` lo chiude comunque: va rimesso in vita, non solo agganciato). |
| 11 | 24888-25005 | ramo bussola in `Touch5`, disegno della lente in `drawMinimappa`, `TOUCH_ZONE` con il tipo `lente`. |
| 12 | 9209 | `startCharge` non rifiuta più la carica oltre `KICK_R*1.4`: senza questa riga il tiro al volo resta indocumentabile (misurato dal dossier: soglia esatta 36,4 unità, e in 0,15 s un pallone a 300 u/s ne percorre 45). |
| 13 | 9238 | `dy += my*260` diventa `dy += ay*(GOAL_H/2+30)`: la mira passa dal pollice sinistro al destro. |
| 14 | 6500, ovunque | i quattro `buzz` delle soglie. |
| 15 | `SAVE` | `mancino`, `spaziatura`, `visto{}`. |
| 16 | 29120-29125 | i quattro passi riscritti + la tabella dei dodici INVITI. |
| 17 | `strumenti/giocata.js` | **prima di tutto il resto**: smettere di premere `(vw-66, vh-140)` e `(vw-70, vh-232)` e leggere `__test.comandiTouch`. Quelle coordinate non sono i centri **già oggi** (il file lo dice a 8768-8772). Un cancello che attesta una posizione invece di misurarla è la trappola numero quattro, e qui presenta il conto una seconda volta. |

**Costo per fotogramma, dichiarato come stima e non come misura**: le voci 1-9 e 12-15 sono aritmetica su ≤ 22 corpi, cioè sotto il rumore del banco. Le uniche due che toccano i pixel sono **l'etichetta viva** (una `fillText` già disegnata, con un altro argomento) e **la lente** (~102.000 px di periferica, solo mentre il dito è giù). Vanno confermate con `node strumenti/prestazione.js --contro HEAD`, che secondo il dossier misura 22,96 ms di fotogramma medio contro un obiettivo di 16,7 su un rasterizzatore software — cioè misura il banco, non il telefono. **Nessuno di questi numeri, se diventa verde, garantisce che il gioco sia più profondo.** Garantisce solo che i trentanove verbi arrivino sotto il pollice. Che siano premiati dipende dalla §2.5, e la §2.5 dice che oggi quattro di loro non lo sono.