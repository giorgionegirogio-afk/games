# IL PROGETTO DEFINITIVO — schema di comandi mobile per CALCETTO

**Base:** `poche-cose-perfette`, unico progetto con 6/6/6/6 (media 6,00 contro 5,75 · 5,75 · 5,63). È la base non perché sia il più ricco, ma perché è l'unico che nessun giudice ha bocciato sotto il 6: la sua igiene di ingresso è il pavimento su cui si può costruire.

**Regola con cui ho innestato:** un innesto entra solo se (a) almeno due giudici l'hanno chiesto, e (b) non consuma un canale già occupato. Dove due idee premiate litigano, ho scelto e l'ho detto al §9.

---

## §0. TRE CORREZIONI AI QUATTRO PROGETTI, PRIMA DI PROGETTARE

Ho verificato oggi le affermazioni su cui poggia il mio progetto. Tre sono sbagliate e vanno rettificate in chiaro, perché due di esse hanno prodotto lavoro nei documenti di partenza.

**1. `__test.pulsanti` ESISTE.** Due progetti su quattro (`contesto-e-intenzione` §8, `due-pollici-veri` — che pure ci costruisce sopra la sonda) dichiarano che «`__test.pulsanti` non esiste» e che `strumenti/giocata.js` preme perciò le coordinate d'archivio. **Falso, misurato oggi:** `CALCETTO-il-gioco.html:30314` esporta `pulsanti(t){ return touchBtnLayout(...).map(...) }`, e `:30155` esporta `get comandiTouch()`. E `strumenti/giocata.js:395` **chiama già `__test.pulsanti(0)`**; il ripiego alle coordinate storiche è documentato in loco come riservato ai file d'archivio. Il difetto denunciato è vero *di un'altra epoca del repo*. Resta un difetto reale ma diverso: **il ripiego è silenzioso**, quindi se l'export sparisse il banco tornerebbe a premere il prato senza dirlo (L0.1).

**2. `b.curve` è codice morto fuori dal tiro perfetto.** `:10710-10713` integra la curva **solo** dentro `if(b.perfectT>0)`, e `perfectT` è la *firma visiva* del tiro perfetto, letta a `:22184`, `:22357`, `:24520`. Ogni progetto che propone un aftertouch su `b.curve` (poche-cose-perfette #13, due-pollici-veri §3.2) propone o un no-op, o un retropassaggio che si accende come un tiro perfetto. **L'aftertouch è cancellato da questo progetto.**

**3. `CARRY_DIST` è una costante, `stealP` satura, e la tabella «tre volte» del progetto vincitore è sul ramo sbagliato.** Verificato: `:3074` `const CARRY_DIST = 16;` (la barra rigida è confermata). `:10667-10671`: quando la CPU ti pressa il ramo è `stealP = DIFF[G.diff].steal`, che a Duro vale **1,00** — un moltiplicatore su 1,00 non cambia un bit. E `×0,55` a `:10671` è il prodotto scalare delle *facce*, cioè l'inseguimento da dietro, non lo scudo. Il §3.4a del vincitore va riscritto, non ereditato (L2.1).

Verificato anche, e usato: `fireShot(p, dx/l, dy/l, q, humanSprint(t))` a `:9243`; `STICK_SPRINT=66` a `:8664` contro `MAXR=70` a `:8851` (**la levetta a fondo corsa È sempre sprint**, quindi il pallonetto è acceso per difetto in ogni tiro in corsa); `slow = p.charge>=0 ? 0.45 : 1` a `:10382` (**tenere una carica dimezza la velocità del portatore**: qualunque meccanica a tenuta col pallone paga il 55%); `touchcancel → Touch5.end` a `:8968`; `viewport-fit=cover` a `:5` con **zero** occorrenze di `env(safe-area-inset-*)` in tutto il file.

---

## §1. LA TESI, E LE QUATTRO LEGGI

> **Il pollice sinistro dice dove vado.
> Il pollice destro preme un verbo e lo TIRA dove deve andare.
> Se non tiro il dito, esce la cosa sicura.
> Se lo tiro fuori, non esce niente.**

Quattro righe, e tutte e quattro sono metafore fisiche. Il conto delle associazioni arbitrarie dell'intero schema è **UNA**: *quanto tiro il dito lontano = quanto in alto va il pallone* (la fionda). Tutto il resto è manipolazione diretta o convenzione universale del telefono.

**LEGGE 1 — Nessun verbo nasce da una soglia sull'orologio degli eventi.**
`contesto-e-intenzione` l'ha misurato e nessuno l'ha confutato: a 6× di CPU rallentata, **23 tap su 24 vengono letti come tenute**, e l'errore va tutto in una direzione. Una soglia di durata su un telefono in affanno misura il telefono. Le durate che restano vivono sull'accumulatore di `step()` (dove `p.charge+=dt` vive già), mai su `performance.now()`.

**LEGGE 2 — Nessun ingresso legge una velocità.** Solo posizioni e stati. Il file ha già pagato la fusione dei `touchmove` (`:8882-8896`, con la sua deroga fragile). Un guasto che sbaglia il **verbo** è maligno; uno che sbaglia di 5° la **mira** è benigno. Con questa legge tutti i guasti diventano benigni. **Niente flick, in nessun punto dello schema.**

**LEGGE 3 — La risposta si legge sul mondo, mai sotto il dito.**
`due-pollici-veri` ha modellato l'ombra del pollice come **polpastrello più fusto fino al perno** — un cuneo, non un cerchio — e ha misurato che la bussola è coperta al **100%**. Chi modella il dito come un cerchio quel risultato non lo può nemmeno vedere. Conseguenza operativa: **zero etichette vive sui dischi.** L'anteprima vive sul pallone e sull'erba.

**LEGGE 4 — Nessun rilascio produce mai un fallo, e nessun annullo di sistema produce mai un calcio.**
È la legge che i sedici giudizi hanno chiesto sedici volte. `touchcancel ≠ touchend`. `release()` della levetta inerte. Un rilascio senza trascinamento non può essere una scivolata.

---

## §2. LA GEOMETRIA — 915×412 px CSS, dpr 2

### 2.1 I due dischi, e lo scambio dei ruoli

**Ho scambiato i verbi fra i due dischi.** Il perno metacarpale del pollice destro in presa orizzontale sta fuori schermo, modello (925, 455). Distanze: il disco **vicino** sta a 126,8 px (21,4 mm, banda di riposo); il **lontano** a ~212 px (35,8 mm, banda di corsa). Il giudice ergonomico di `poche-cose-perfette` ha calcolato la differenza di indice di Fitts a **+83%**, circa **+150 ms per pressione**, e ha proposto di ri-derivare i dischi da un arco a raggio costante attorno al perno.

**Ho rifiutato l'arco, e con una prova.** Il perno sta *sotto* il bordo inferiore (y 455 su uno schermo alto 412): un arco a raggio costante attorno a un perno sotto lo schermo spazza verso il basso, fuori dalla tela. E il vincolo di non sovrapposizione è duro: prese 50+44 = 94 px minimi fra i centri. Il punto a 101 px dal disco vicino più prossimo al perno è (909,9 · 434), fuori schermo. **Non esiste, dentro questa tela, una posizione per il secondo disco più vicina al perno di ~200 px con 7 px di franco.** La penalità di Fitts sul secondo disco è una conseguenza geometrica dello schermo e della mano, non un errore di progetto.

Ma la conclusione operativa del giudice resta valida rovesciata: **se lo slot comodo è uno solo, ci va il verbo che si preme di più.** In 90 secondi (`MATCH_SEC = 90`): passaggi ~20-25, cambi uomo ~20-30, contrasti ~10, tiri ~4-6. Quindi:

| | disco | centro | r | presa | esclusione | **con palla** | **senza palla** |
|---|---|---|---|---|---|---|---|
| **VICINO** | *gli altri* | **(851, 352)** | **40** | 50 | 58 | **PASSA** | **CAMBIO** |
| **LONTANO** | *io e la palla* | **(751, 334)** | **34** | 44 | 52 | **TIRA** | **CONTRASTA** |

Distanza fra i centri: √(100² + 18²) = **101,61 px**. Franco fra le prese: 101,61 − 50 − 44 = **7,61 px**: le due prese non si toccano mai, e non serve una regola di parità — serve l'aritmetica.

Il costo dichiarato dello scambio: il **contrasto** perde ~150 ms rispetto allo slot comodo. Lo accetto perché oggi il contrasto in piedi *non esiste affatto* (il tap su CONTRASTA chiama `doSlide` diretto), quindi qualunque contrasto è un guadagno; e perché il tiro è una **tenuta**, e Fitts penalizza l'acquisizione, non il mantenimento. Il cancello G6a può bocciarmi su questo.

### 2.2 Le aree di sistema — il buco che nessun banco può vedere

Verificato: `viewport-fit=cover` senza **un solo** `env(safe-area-inset-*)`, e la shell Android non chiama mai `setSystemGestureExclusionRects`. La presa del disco vicino arriva a **x 901** (14 px dal bordo) e **y 402** (10 px dal fondo): dentro l'inset di back-gesture di Android (~24 dp) e dentro la striscia dell'home indicator. Trascinare a sinistra dal bordo destro *è* il gesto «indietro»; il gioco riceve `touchcancel` e (oggi) batte un passaggio.

```
INS_L/R/T/B = env(safe-area-inset-*), letti in variabili CSS e sottratti al riquadro
A = (VW − INS_R − 64·k , VH − INS_B − 60·k)      k = fattore di scala (§7)
B = (VW − INS_R − 164·k , VH − INS_B − 78·k)
minimo assoluto: presa ≥ 24 dp dai bordi laterali, ≥ 20 dp dal fondo
+ setSystemGestureExclusionRects sui due riquadri di presa e sulla corona d'annullo
```

**Non posso verificarlo in headless: Chromium senza inserti è lo stesso banco che ha reso invisibile il problema.** Lo dichiaro al §13.

### 2.3 La levetta, e la bussola

Levetta: invariata nei numeri (`STICK_DEAD 12`, `STICK_FULL 46`, `STICK_SPRINT 66`, inseguimento `MAXR 70`), nasce dove il dito si posa. **Cambia solo il rilascio: non fa niente. Mai.**

Bussola: **non è, e non diventa, una superficie di comando.** Tre refutazioni indipendenti e tutte verificate: è coperta al 100% dal cuneo del pollice sinistro; si sposta da sola (interpolazione esponenziale a semivita 0,12 s fra due ancoraggi, e *scende perché la tocchi*, via `toccaPollice`); sfuma a 0,10 quando il pallone le arriva addosso; e può essere `null` (`if(quota>=0.92) return`). Un ingresso che si muove, si spegne e a volte non esiste non è un ingresso.

Dove va: **nella banda alta a destra (x 823..903, y 3..42) quando c'è posto.** A 640×360 non c'è posto — verificato: la formula del tabellone lascia 58 px a destra contro gli 80 richiesti — e allora **resta dov'è, sempre non toccabile**. Il cambio a icona regionale è comprato altrove, e meglio, dal cambio direzionale del §4.

---

## §3. LA GRAMMATICA — due dati, e nessun settore

Ogni pressione su un disco produce **due dati e basta**:

```
1. TRASCINAMENTO   il vettore dal PUNTO DI POSA alla posizione del dito,
                   letto sul campione piu' recente ANTERIORE di 60 ms al distacco.
                   E' un VETTORE CONTINUO. Non ci sono settori, in nessun punto
                   dello schema.
2. STATO           cio' che il mondo ha fatto mentre il dito era giu':
                   l'anello del timing (solo TIRA), la corsa del chiamato (solo PASSA).
                   Nessuna soglia sull'orologio degli eventi. Mai.
```

**Perché si scartano gli ultimi 60 ms.** Quando un pollice si stacca, l'ellisse di contatto collassa verso la punta e il centroide riportato deriva di 1-3 mm in direzione distale: **6-18 px CSS, in una direzione fissa, iniettati nell'istante della decisione**. È il difetto che il giudice ergonomico di `massima-espressione` ha trovato e che nessuna delle quattro misure di quel progetto poteva vedere. Scartare l'ultima finestra di 60 ms lo elimina su entrambi gli assi con una riga sola, e resta dentro la Legge 2: si conservano **posizioni**, mai velocità. Un anello di ~8 campioni `{x, y, t}` per dito.
*Costo che eredito e non posso incassare:* il progetto vincitore rivendicava la cancellazione di `s.hist` (14 oggetti per dito per fotogramma) come mancia della morte del flick. **Io quella mancia non la prendo:** mi serve una storia corta di posizioni. Ne prendo un ottavo.

**Perché NON ci sono settori.** È l'arbitrato più importante del progetto. `due-pollici-veri` ha dimostrato che una rosa a 4 settori allineata allo schermo mette la spazzata naturale del pollice a 2-10° da un confine, e che il confine si sposta con la lunghezza della corda (crossover a L ≈ 75 px sul disco piccolo: la stessa spazzata percepita dà *cross* se corta e *filtrante* se lunga). Il suo giudice ha proposto di ruotare la rosa nel sistema del pollice — ma ha anche mostrato che sui perni plausibili la tangente si sposta fra −41° e −65°, cioè **il confine sta dentro l'incertezza del modello**. Ruotare di un angolo non misurato scambia un bias noto con uno ignoto.

Allora tolgo la rosa. `contesto-e-intenzione` ha misurato che un cono duro a 60° è **vuoto nel 71% degli stati a 5 contro 5** e ne contiene fino a **9** a 11 contro 11: un cono non seleziona, o sbarra in silenzio o non discrimina. Il suo rimedio — *la direzione INCLINA, non SBARRA* — è la cosa giusta, e su un canale continuo **non esistono confini da attraversare, quindi non esiste la classe di errori che la rotazione doveva curare.** Un bias angolare sistematico di 20° sposta di poco chi vince, e il margine di guardia δ più la linea d'anteprima lo mostrano. Un settore sbagliato invece cambia il verbo.

### 3.1 Le costanti nuove — sette numeri, tutti distanze o continui

```js
const R_ARMA_0  = 22;    // px CSS: sotto, il trascinamento non esiste
const R_ARMA_1  = 36;    // px: soglia a tenuta piena. R_ARMA = 22 + 14*min(1, ten/0.60)
const DRAG_SAT  = 52;    // px: saturazione dell'ampiezza sul disco PASSA
const MIRA_SAT  = 26;    // px: saturazione della mira sul disco TIRA
const QUOTA_SU  = 40;    // px: la palla si alza  (isteresi: torna raso a 32)
const R_ANNULLA = 96;    // px di SPOSTAMENTO dal punto di posa (non di percorso)
const DROP_MS   = 60;    // ms di coda scartata prima del distacco
```

**Percorso o spostamento?** `contesto-e-intenzione` usa il *percorso* (56 px). Il suo giudice l'ha demolito: 1-2 px di tremore per evento a 60-120 Hz fanno 60-240 px di percorso al secondo, quindi in piedi su un autobus una tenuta si annulla da sola in silenzio; e 30 px avanti + 30 indietro annullano col dito tornato al punto di partenza. **Uso lo spostamento.** Non è raggiungibile in tutte e quattro le direzioni (verso destra e verso il basso c'è il bordo) e lo dichiaro: **si annulla trascinando verso il campo**, che è anche la direzione naturale del «via dal pulsante».

`R_ARMA` cresce con la tenuta (idea di `due-pollici-veri`) perché una carica di tiro può durare 1,25 s e in 1,25 s un pollice rotola.

---

## §4. TABELLA AZIONE → INGRESSO

Tre contesti, non due: **IO** (ho la palla) · **NOI** (la squadra ce l'ha, io no) · **LORO**. Violo il tetto di due contesti che la ricerca indica, come faceva `due-pollici-veri`, e per la stessa ragione: la tricotomia è quella dello sport, ed è l'unico modo di riempire il buco che tre giudici hanno segnalato («in possesso, su telefono, non si cambia uomo»). Il rischio è sorvegliato dal cancello G2.

Legenda: ● esiste · ◐ esiste, cambia sorgente · ○ nuovo.

### IO — ho il pallone

| | azione | ingresso | note |
|---|---|---|---|
| ● | corsa · sprint | levetta 12→46 · oltre 66 | invariato |
| ○ | **scudo** | **niente**: levetta a riposo con un avversario entro 60 unità | il corpo si gira, `stealP` scende. Non è un comando: è cosa succede se **non** comandi |
| ◐ | **appoggio sicuro** | **PASSA, nessun trascinamento** | esegue al rilascio; la posa d'anticipo parte alla **pressione**, e `PASS_CAR_U` va a zero su questo ramo (recupera 50 ms) |
| ○ | **passaggio mirato** | **PASSA + trascinamento** | `punteggio(q) = base + K·dot(q̂, draĝ)·min(1, |drag|/52)`, K = 220, con margine di guardia δ |
| ○ | **chiamata** | **la stessa cosa**: appena il trascinamento arma, il ricevente candidato **parte** | non è una tenuta, è una conseguenza del trascinamento. Corsa 1,6 s, indipendente dal dito |
| ○ | **chiama senza passare** | trascina oltre 96 px e rilascia | il passaggio muore, **la corsa resta**. È l'uno-due lento che tre giudici chiedevano |
| ○ | **filtrante** | *emergente*: il ricevente scelto sta correndo → la palla lo anticipa | nessun nome da imparare, nessun confine |
| ○ | **palla alta / cross / cambio gioco** | ampiezza oltre 40 px (isteresi 32) | `vz` cresce con l'ampiezza. Il *nome* lo decide dove sta il ricevente |
| ○ | **scarico** | il ricevente scelto è dietro | idem |
| ● | **tiro col timing** | **TIRA tenuto**, rilascio sull'ambra | `SHOT_MIN 0,50 – SHOT_MAX 0,80`, ±45 ms di tecnica. **Invariato: è la meccanica migliore del gioco** |
| ○ | **mira nella bocca** | componente **tangenziale** del trascinamento su TIRA, saturata a 26 px | la bocca è un segmento verticale sullo schermo. Tre stati annunciati (ALTO/CENTRO/BASSO), continua sotto |
| ○ | **pizzata immediata** | **TIRA, tap** sotto `TAP_T` | il gol da mischia esiste. Direzione dalla levetta |
| ○ | **il tiro non è più un cancello a tre valori** | — | oggi `q=0` sotto `SHOT_MIN` significa «arriva piano, parata facile». Nuovo: **la potenza è una rampa continua dal tap alla carica piena; l'anello aggiunge PRECISIONE, non potenza.** L'anello smette di essere obbligatorio |
| ○ | **pallonetto** | *emergente*: mira ALTO da fuori con il portiere avanzato | e **`humanSprint(t)` sparisce da `:9243`** — oggi il pallonetto è acceso per difetto in ogni tiro in corsa |
| ● | rovesciata · tiro al volo | invariati (il volo richiede L2.2c) | |
| ○ | **finta** | trascina oltre 96 px con una carica aperta | `chiudiAnticipo` (`:9450`) è già scritto e già chiamato. **La finta non è un verbo nuovo: è l'annullo** |

### NOI — la squadra ha la palla, io no

| | azione | ingresso |
|---|---|---|
| ○ | **chiedo palla** | **CHIAMA (disco vicino), tap** — alza il mio peso in `smarcato()` per 1,2 s |
| ○ | **chiedo palla in quello spazio** | **CHIAMA + trascinamento** — mi muovo lì e alzo il peso lì |
| ○ | **scatto** | **SCATTA (disco lontano), tap**: uno strappo · **tenuto**: corsa sostenuta, consuma fiato |

### LORO — hanno la palla loro

| | azione | ingresso | note |
|---|---|---|---|
| ○ | **contrasto in piedi** | **CONTRASTA, alla PRESSIONE** | 0,18 s di finestra, `stealP` ×1,8 di fronte, `kickCd 0,22` se fallisce. **Nessun corpo a terra** |
| ○ | **contenimento (jockey)** | **continua a tenere**, dopo il contrasto | velocità ×0,62, faccia sul portatore. Riusa `p.contieni`/`standoff` (`:11726-11742`), oggi solo CPU e **a Duro spento** |
| ◐ | **scivolata** | **CONTRASTA + trascinamento armato**, esegue al rilascio | `startSlide` prende la direzione dal trascinamento, continua su 360° |
| ○ | **la scivolata si può disfare** | rientra sotto `R_ARMA` prima di rilasciare | |
| ◐ | **cambio direzionale** | **CAMBIO, alla PRESSIONE**, direzione dalla **levetta** | latenza zero, come oggi. **Elimina il ciclo orario** di `cambiaGiocatore` |
| ○ | **raddoppio** | **CAMBIO + trascinamento** | il compagno più vicino a quella direzione pressa. Il ruolo esiste in `teamBrain` (`:11758`) ma solo da 7 in su e solo automatico |
| ○ | **spazzata** | **CONTRASTA con palla libera entro `KICK_R` nel proprio terzo** | contesto puro, zero ingressi nuovi |

### La cosa che risolve la difesa, e che vale mezzo voto da sola

**Non distinguo il tap dalla tenuta sul disco difensivo. Li metto in fila.**
La pressione fa *sempre* il contrasto in piedi, subito. Se continui a tenere, entri nel contenimento. Non c'è nessuna soglia: entrambi i verbi accadono, e nell'ordine in cui il calcio li mette. **Un telefono in affanno non può produrre il verbo sbagliato, perché non c'è un verbo sbagliato da produrre.**

Questo chiude in una riga:
- la misura M4 di `contesto-e-intenzione` (23 tap su 24 letti come tenute a 6×);
- il giudizio del principiante su `massima-espressione` («premo CONTRASTA e resto un attimo di troppo → sono per terra e loro segnano»);
- il gradino a 150 ms che il giudice ergonomico del vincitore ha calcolato a 1,13× il tap medio, con **un terzo dei contrasti voluti che diventano contenimenti**.

E **la scivolata è un trascinamento, mai un rilascio.** Sedici giudizi, quattro progetti, la stessa obiezione: *«la scivolata parte da sola nell'istante peggiore»*. Qui il rilascio del disco difensivo, senza trascinamento, non può produrre niente. Smettere di contenere è gratis, come deve essere.

### Il ri-armo: cosa succede se il contesto cambia mentre il dito è giù

Il vincitore dice: non succede niente. `due-pollici-veri` lo eredita. Il giudice esperto: *«dal pad, niente è l'esito peggiore possibile, non il più sicuro»*.

**Nuovo: l'atto congelato muore, il disco si RI-ARMA sul contesto nuovo, senza eseguire niente, e lo annuncia.** Il punto di posa si azzera sulla posizione corrente del dito (così un trascinamento vecchio non arma il verbo nuovo). Concretamente: sto caricando il tiro, mi soffiano la palla, il dito è ancora giù → la carica muore e **quello stesso dito sta già tenendo CONTIENI**, che è esattamente ciò che voglio. Non devo alzare e ripremere: sono 300-500 ms di paralisi che spariscono, nell'unico istante della partita in cui 300 ms costano un gol.

E l'etichetta smette di mentire con **una riga**: `possessoTeam` legge `b.owner`, che vale −1 per tutto il volo di un passaggio, quindi dopo ogni passaggio i dischi dicono CONTRASTA/CAMBIO per ~0,35 s. **`b.passTo` è già scritto**: una palla in volo verso un compagno è NOI, non LORO. Più 0,25 s di isteresi sul resto.

---

## §5. COME SI SCOPRE

**Un solo oggetto porta tutta la scoperta: la linea.** È la prescrizione con cui il giudice principiante ha corretto `contesto-e-intenzione`, ed è anche l'unica che sopravvive al conto dei pixel che ha demolito il cono di `poche-cose-perfette` (a 1,5 px CSS per unità, un cono da 600 unità è **una passata alpha a schermo intero per fotogramma**, e cresce di 12× durante la tenuta).

| segno | dove | quando | cosa insegna |
|---|---|---|---|
| **la linea di passaggio** dal pallone al ricevente candidato | sul mondo | dal `touchstart` su PASSA | *chi*. E risponde alla domanda numero uno del principiante: **quale di questi undici sono io** |
| la linea **cambia forma**: da segmento ai piedi a **freccia nello spazio davanti a lui** | idem | nell'istante in cui il chiamato parte | *il filtrante*, senza mai nominarlo |
| la linea **si alza in arco** | idem | quando l'ampiezza supera la quota | *la fionda*, cioè l'unica associazione arbitraria dello schema |
| la linea **non si sposta** quando punti | idem | quando il margine di guardia difende la scelta base | **il rifiuto visibile**: non hai premuto a vuoto senza saperlo |
| **un tacca sulla bocca della porta**, all'altezza mirata | sulla porta | durante la carica | *la mira*, alla fine del suo tragitto invece che sotto il dito |
| **la traiettoria della scivolata** sull'erba | sul mondo | quando la scivolata si arma | *cosa sto per commettere*, prima di commetterlo |
| **la didascalia** col nome, ancorata al pallone ma **specchiata sul lato opposto al pollice vivo**, e in fuga nella banda alta quando il pallone cade dentro il cuneo | sul mondo | mentre un dito è su un disco | il nome, per chi lo vuole |

**Zero etichette vive sui dischi.** È il meccanismo centrale di `massima-espressione` e la sua aritmetica lo uccide: un polpastrello da 150 px su un disco da 60-80. *L'etichetta era l'oggetto sbagliato, non nel posto sbagliato.*

**Budget dichiarato, e non misurato:** al massimo **una linea + un arco + una didascalia + una tacca** per fotogramma, e solo mentre un dito è su un disco. Zero elementi nuovi nella fascia dei 64 px in basso. Ogni segno va dichiarato in `zoneInterfaccia` con la sua alfa, perché questo file ha già pagato che una pastiglia semitrasparente sull'erba viene letta come **ombra** da `istantanea.js`.

**L'aptico è un ornamento, mai un canale.** Verificato da `due-pollici-veri`: `AndroidManifest.xml` dichiara **zero permessi**, quindi `navigator.vibrate` è un no-op silenzioso sull'APK spedito, e su iOS l'API non esiste. Ogni soglia che vibrerebbe è **anche** annunciata sulla linea. Aggiungere `VIBRATE` è un'opzione (L3.5) e il suo costo è che «zero permessi» smette di essere vero.

**Il tutorial: tre passi a orologio, poi gli INVITI.** I tre passi (levetta, PASSA, TIRA) e poi la tabella degli inviti di `massima-espressione` — la parte che il giudice principiante ha chiamato *«l'unica parte del progetto scritta per chi non sa niente»*: una pastiglia per partita, mai due volte lo stesso verbo, mai più dopo che l'hai usato, agganciata alla **situazione**. Insegna quando il verbo serve, non quando il cronometro decide.

**La mano si sceglie con una domanda, non si indovina.** Una carta al primo avvio, due bersagli grandi: «con quale pollice comandi i pulsanti?». Il giudice principiante ha distrutto l'inferenza del vincitore: *«sono destrimano, ma il dito che mi obbedisce meglio è il destro, e nel dubbio uso quello»* — e quando sbaglia, rovina l'intera sessione.

---

## §6. LE PRECEDENZE

**P1 — La geometria, per distanza normalizzata.** Per ciascun disco `u = d / R_PRESA`. Se `min(u) ≤ 1` → quel disco prende il tocco. Altrimenti se `min(d/R_ESCL) ≤ 1` → **il tocco muore**. Altrimenti → levetta.
Questo ripara il difetto M2 che `due-pollici-veri` ha **misurato**: oggi presa ed esclusione stanno nello stesso ciclo col disco grande per primo, quindi c'è una mezzaluna dove una presa legittima del disco piccolo muore nell'anello del grande — **esattamente sul vettore d'approccio del pollice**. La sua riparazione («la presa batte l'esclusione») fa però nascere un passaggio in un punto visivamente in mezzo ai due dischi; la distanza normalizzata degrada bene ovunque. Quattro righe.

**P2 — La cattura vince la geometria.** Un dito catturato da un disco non attiva mai altro, ovunque vada, fuori schermo compreso. Già così a `:8846`.

**P3 — Un dito per disco.** Il secondo è ignorato, non messo in coda. **Nessun accordo a due dita in tutto lo schema**: il pollice destro è uno, ed è la ragione per cui `poche-cose-perfette` #12 (la finta) non era eseguibile.

**P4 — Nessun doppio tocco esiste**, quindi non si paga la finestra di rilevamento e il tocco singolo non ha ritardo. Deduplica di 60 ms **solo sul disco TIRA** (dove un rimbalzo ri-arma una carica) e **nessuna sul disco PASSA/CAMBIO**, perché il cambio uomo è l'azione che si martella: tap-guarda-tap. La deduplica a 120 ms del vincitore lo mangiava.

**P5 — L'annullo vince sempre.** Fra due verbi possibili nello stesso istante vince quello che il giocatore può disfare. È la regola da cui nasce la finta senza inventare un gesto.

**P6 — La levetta non esegue niente, mai.** `release()` vuota. E in un giocatore la levetta nasce solo per `x < VW·0,55`: oggi `if(s.active) return` a `:8856` ammette una sola levetta per squadra, quindi un pollice destro che manca il disco e cade sull'erba **diventa la levetta**, e da quel momento il pollice sinistro è morto.

**P7 — `touchcancel` annulla, `touchend` esegue.** Sempre, su ogni superficie.

**P8 — Il possesso perso durante una carica non produce un calcio** (`:9920` chiude, non spara), e la carica si ri-arma (§4).

**P9 — Pareggi: vince il verbo meno impegnativo.** Ampiezza esattamente su `R_ARMA` → verbo base. Costo dell'errore, in ordine: *possesso perso > fallo > gesto sprecato > niente*.

---

## §7. CASI LIMITE

| caso | risposta | costo |
|---|---|---|
| **dito che rolla al distacco** | i 60 ms scartati (§3). È il difetto sistematico che nessuna delle quattro misure di partenza poteva vedere | un anello di 8 posizioni per dito |
| **dito che rolla durante una tenuta lunga** | `R_ARMA` cresce da 22 a 36 px in 0,6 s | 1 riga |
| **il browser fonde i `touchmove`** | risolto per costruzione (Legge 2). Nulla legge una velocità: spariscono la soglia a 650 px/s, la finestra dei 90 ms e la deroga a `:8896` | **codice in meno** |
| **notifica / gesto di sistema** | P7 + gli exclusion rects del §2.2 | |
| **mani grandi** | impostazione «distanza dei comandi» ×0,85 / ×1,00 / ×1,20 che scala **raggi e scarti insieme** (scalare i soli raggi fa toccare i dischi). Nota onesta: l'intera escursione del rimedio sta dentro un polpastrello, quindi **non risolve il problema per cui è offerta**; separa due bersagli, non li rende distinguibili al tatto |
| **schermo piccolo** | `k = clamp(min(VW/915, VH/412), 0.82, 1.20)`. A 640×360: k = 0,82, rA = 34 (presa 44), rB = 29 (presa 39), somma prese 83, serve ≥ 90; la disposizione in diagonale dà 83,3 → **scatta la colonna verticale**, B a (A.x−6, A.y−96), distanza 96,2 ✔. **E in colonna l'esclusione del disco inferiore sale a r+26** mentre un dito è catturato dal superiore, perché su uno schermo piccolo il pollice si appiattisce e la falange prossimale tocca il vetro sotto |
| **mancino** | `const right = (G.mode===2) ? (t===1) : !SAVE.mancino;` — **una riga**, `touchBtnLayout` sa già specchiarsi. Più tre punti che nessuno deve dimenticare: la bussola, la casa del pollice, e le tre regole di scarto dell'HUD che leggono `MINI_RECT.x0` |
| **due giocatori** | **un pollice a testa.** Senza flick, il singolo pollice alterna levetta↔dischi, e lo stato a zero dita rende l'alternanza **sicura** — oggi ogni volta che vai dalla levetta al disco parti un passaggio. Guadagno in sicurezza, perdita in espressione, dichiarata al §12. La bussola non è un ingresso per nessuno, quindi la sua asimmetria non esiste più |
| **una mano sola** | col solo pollice destro il gioco resta giocabile: tap-passaggio, tenuta-tiro, contrasto-e-contenimento funzionano senza levetta (la mira cade sull'assistenza). Tetto più basso, gioco non rotto |
| **il pallone sotto un disco** | l'alfa non tocca mai la geometria del tocco. Un comando che si sposta perché è velato è peggio di un comando coperto |
| **dito bagnato, guanti** | nessuna mitigazione |

---

## §8. COSA QUESTO SCHEMA NON PUÒ FARE

1. **Niente di simultaneo sotto il pollice destro.** Nessun accordo, nessun prefisso, nessun claw.
2. **Zero skill move.** Il segnale che *nomina* una skill move è un moto d'arto di ~15 px di periferica contro i 425 di un passaggio: 28 a 1, e i provini ciechi di questo progetto dicono che perfino il corpo intero è nominabile 0-2 volte su 10.
3. **Niente portiere comandato**, niente colpo di testa, niente corner/rimesse/fuorigioco. La gabbia è identità; il gioco aereo vive sull'asse Z, l'unico che una camera a 42° comprime.
4. **La tattica non è sotto il pollice.** Va in un menù di preparazione.
5. **Non si mira e si corre insieme durante la carica del tiro** — anzi, ora si può: la mira è sul pollice destro. Ma **non si sceglie il ricevente per nome**: il trascinamento inclina un punteggio, non nomina un uomo.
6. **Non si può convertire un tiro caricato in un passaggio.** Si annulla (finta) e poi si passa: ~200 ms.
7. **Il pallonetto ravvicinato non esiste.** Lo scavalcamento è emergente da mira + distanza + posizione del portiere: da cinque metri con il portiere sulla linea, quel tiro non c'è. Nel calcio nemmeno.
8. **Tre contesti invece di due**, sopra il tetto che la ricerca indica. Rischio dichiarato, sorvegliato da G2.
9. **Non risolve niente di ciò che è rotto sotto l'ingresso.** Uno schema migliore su una fisica rotta è una tastiera più bella. Le tre riparazioni di L2.2 vengono **prima**, non dopo.

---

## §9. DA DOVE VIENE OGNI PEZZO, E COSA HO SCARTATO

### Da `poche-cose-perfette` (la base)

**Preso:** la disciplina geometrica (il franco aritmetico fra le prese, il ramo a colonna, la geometria letta da `__test.pulsanti` e mai riscritta a mano, il cancello a zero tolleranza su sei configurazioni) · lo stato a zero dita neutro · `touchcancel ≠ touchend` · P6/P8 · l'annullo per trascinamento · il cambio direzionale al posto del ciclo orario · l'idea che `CARRY_DIST` variabile sia l'unica riga che alza il tetto senza chiedere un pulsante · **la morte totale del flick**, che è la sua decisione più premiata e l'unica che rimuove una *classe* di guasti invece di mitigarla.

**Scartato:**
- **le quattro bande di durata sul passaggio (0,15/0,35/0,50/0,90).** Tre giudici su quattro l'hanno chiamata la falla fatale. La banda più stretta è di 150 ms, cioè **1,7×** la latenza tocco→fotone, contro la regola del 4-5× che il documento applica al tiro e non applica mai al passaggio. E il §9.4 ammette che le soglie non sono derivate, mentre il §8 non costruisce il cancello che le deriverebbe: **la fonte d'errore numero uno era l'unica senza guardiano.** Sostituite dall'ampiezza del trascinamento.
- **la scivolata come rilascio del contenimento.** Quattro giudici hanno dimostrato indipendentemente che la «freschezza di 0,30 s» è un *livello*, non un *fronte*, e che un avversario inseguito la soddisfa continuamente. Sostituita da un trascinamento armato.
- **la finta come «premi B mentre A è carico».** Non eseguibile con un pollice solo: i centri distano 101 px e a 90 px l'annullo ha già chiuso la carica. Sostituita dall'annullo, che fa la stessa cosa e c'è già.
- **l'aftertouch sulla rotazione della levetta.** Legge una velocità, cioè contraddice la tesi centrale del suo stesso documento; punisce il gesto più naturale del dopo-tiro; e (§0.2) integra su un campo morto. **Cancellato, non rimandato.**
- **la banda della levetta come selettore di tipo sul tiro** (precisione/pallonetto). La banda *è la tua velocità*: intenzione e postura non possono mai essere in disaccordo, e nel calcio lo sono di continuo. Sostituita dalla mira sul trascinamento.
- **la mancia di prestazione dalla cancellazione di `s.hist`.** Non la incasso (§3).

### Da `massima-espressione`

**Preso:** il **trascinamento sul disco** come canale dei modificatori (è l'unico canale spaziale libero che non litiga con lo sprint) · la lettura **al rilascio invece che dal flusso dei `touchmove`**, promossa a «60 ms prima del distacco» · il principio dell'**abortibilità** (vedi prima di commettere) · gli **INVITI**.

**Scartato:**
- **l'etichetta viva sul disco.** La sua stessa aritmetica la uccide: polpastrello 150 px, disco 60-80. Occlusione 100%, sempre, nell'istante esatto in cui servirebbe. Sostituita dalla linea sul mondo.
- **`DISC_HOLD2 = 0,55` e l'intero secondo piano della durata.** Tre giudici hanno convergito sul taglio. E le due soglie 0,30/0,55 stanno a cavallo di `SHOT_MIN = 0,50`: lo stesso colpetto significa «puoi commettere» su un disco e «lascia adesso e butti via il tiro» sull'altro.
- **il flick con la palla che diventa knock-on.** Sovrascrive in silenzio il riflesso più allenato del gioco (flick verso porta = tiro) con un pallone regalato: `P_SPEED = 168` contro una palla a 140-250 con 0,22 s di cooldown.
- **la bussola toccabile e la lente.** Tre refutazioni verificate (§2.3).
- **il conteggio dei 39 verbi.** Non conto verbi. Un vocabolario non è una misura: `doCross` ed `eseguiFiltrante` sono scritti, funzionanti, e **zero volte in dodici partite**.

### Da `contesto-e-intenzione`

**Preso e promosso a legge:** la **Seconda Legge** (nessun verbo da una soglia sull'orologio degli eventi) e la misura M4 che la impone · le durate sull'accumulatore di `step()` · il **margine di guardia δ** con la ricaduta sul bersaglio base · **la direzione inclina, non sbarra** · la forma del censimento C1, che è il cancello meglio costruito dei quattro documenti · il pavimento dichiarato · la diagnosi del banco.

**Scartato:**
- **«il verbo si legge dallo stato del compagno (partito o no)».** I suoi giudici hanno ragione: lo stato letto è una funzione pura della **stessa soglia di 0,15 s**, spostata nelle gambe del compagno. Nel mio schema la chiamata è causata dal **trascinamento**, che è una distanza visibile e reversibile, e la corsa del chiamato poi modula un continuo **senza confini**.
- **la levetta come canale di mira** (`K·dot·|levetta|`). Il censimento dei significati già portati da `|levetta|` (velocità, sprint a 66, pallonetto via `humanSprint`, modificatore di cross/filtrante, e `MAXR 70 > 66`) prova che il canale è pieno; e *«per mirare all'indietro devo correre all'indietro»* è fatale. **Tengo la formula, cambio il canale.** È l'arbitrato centrale del progetto.
- **il cono duro con `dot > 0,5`.** Ucciso dalla sua stessa misura: 71% di coni vuoti a 5 contro 5, fino a 9 candidati a 11 contro 11.
- **la bussola come ingresso ad angolo.** Stesse refutazioni.
- **l'affermazione che `__test.pulsanti` non esiste** (§0.1).

### Da `due-pollici-veri`

**Preso e promosso a legge:** il **modello a cuneo** del pollice e la **Legge 3** (la risposta sul mondo, mai sotto il dito) · la riparazione della precedenza (M2), migliorata a distanza normalizzata · la **clausola di entropia** nel cancello dell'etichetta · la regola che **la geometria del pollice vive nello strumento, non nell'HTML**, così il gioco non può negoziarla · i tre contesti IO/NOI/LORO con il rischio dichiarato · `R_ARMA` che cresce con la tenuta · il rifiuto motivato del cambio a icona sulla minimappa.

**Scartato:**
- **la rosa a 4 settori.** Sia nella versione allineata allo schermo (i confini cadono sulla spazzata naturale) sia in quella ruotata (l'angolo di rotazione sta dentro l'incertezza del proprio modello). **Ho tolto i settori invece di ruotarli** (§3).
- **l'aftertouch su `b.curve`** (§0.2).
- **l'aptico come canale portante.** L'APK dichiara zero permessi: è un no-op silenzioso.
- **la bussola in alto a destra come regola.** Non ci sta a 640×360 (58 px liberi contro 80). Diventa una preferenza con ripiego.
- **«tutto si risolve al rilascio».** Cambio uomo e contrasto sparano alla **pressione**: sono i due verbi che non tollerano latenza, e oggi sono già istantanei. Farli peggiorare sarebbe stato l'unico modo di rendere lo schema peggiore di quello che sostituisce.

---

## §10. LA LISTA ORDINATA DI LAVORAZIONE

Le colonne **dip.** e **tocca la simulazione?** decidono la parallelizzazione. Le voci con `bit` cambiano la simulazione al bit e **rompono ogni banco a seme fisso finché i riferimenti non si rifanno**: vanno introdotte una per volta, con i riferimenti rifatti in mezzo.

### ONDA 0 — i bloccanti. Nessuna misura è credibile prima. **Tutte e cinque indipendenti fra loro.**

| # | cosa | righe | dip. | bit |
|---|---|---|---|---|
| **L0.1** | il ripiego di `giocata.js` diventa **rumoroso**: se `__test.pulsanti` manca, lo strumento **erra**, non ripiega. Più l'asserto che il punto premuto sta entro 2 px dal centro dichiarato | ~10 | — | no |
| **L0.2** | `touchcancel` ≠ `touchend` · `Touch5.release()` inerte · stato a zero dita neutro. **La singola voce a rendimento più alto dell'intero progetto** | ~15 | — | no |
| **L0.3** | `env(safe-area-inset-*)` letto davvero · `setSystemGestureExclusionRects` nella shell Android | ~30 + Java | — | no |
| **L0.4** | due riparazioni da una riga: `humanSprint(t)` via da `:9243` (il pallonetto acceso per difetto) · `b.passTo` dentro `possessoTeam` (l'etichetta che mente per 0,35 s dopo ogni passaggio) | 2 | — | sì (tiri) |
| **L0.5** | precedenza a distanza normalizzata (P1) | 4 | — | no |

### ONDA 1 — il motore d'ingresso. **L1.1 è la spina dorsale: uno specialista, da solo.** Le altre quattro sono parallele fra loro appena L1.1 atterra.

| # | cosa | dip. | bit |
|---|---|---|---|
| **L1.1** | punto di posa · anello di 8 posizioni · scarto dei 60 ms · `R_ARMA` che cresce · annullo per spostamento · ri-armo sul cambio di contesto | L0.5 | no |
| **L1.2** | disco lontano senza palla: contrasto alla pressione → contenimento → scivolata su trascinamento armato. Richiede di **rimettere in vita** `p.contieni` (oggi solo CPU, e a Duro `standoff=0` lo chiude comunque) | L1.1 | sì |
| **L1.3** | disco lontano con palla: anello invariato · mira tangenziale · tacca sulla bocca · **rampa continua di potenza** al posto del verdetto a tre valori | L1.1 | sì |
| **L1.4** | disco vicino con palla: bias + margine δ + aggancio del bersaglio + chiamata | L1.1, L5.1 | sì |
| **L1.5** | disco vicino senza palla: cambio direzionale alla pressione (via il ciclo orario) · raddoppio su trascinamento | L1.1 | sì |

### ONDA 2 — ciò che rende i verbi meritevoli. **Interamente indipendente dall'Onda 1: parte il primo giorno, in parallelo.**

| # | cosa | dip. | bit |
|---|---|---|---|
| **L2.2** | **le tre riparazioni di fisica, e vengono prima di tutto:** (a) `b.vx*=fr` dentro `if(b.z<=0)` — misurato: ogni cross cade **24-31% corto**; (b) il primo tocco può sporcarsi; (c) `startCharge` oltre `KICK_R*1.4`, senza cui il tiro al volo è irraggiungibile (soglia misurata 36,4 unità) | — | sì |
| **L2.1** | `CARRY_DIST` funzione della velocità, **riscritto** rispetto al vincitore (§0.3): l'esposizione agisce attraverso il **test di distanza** avversario↔pallone, non con un moltiplicatore sopra; e `stealP` smette di saturare (tetto 0,85) altrimenti a Duro non cambia un bit | — | sì |
| **L2.3** | la chiamata: un campo per giocatore + un ramo in cima ad `aiDecide`, che gira già per ogni uomo | — | sì |

### ONDA 3 — la scoperta. Dipende da L1.1. **Le cinque voci sono parallele fra loro.**

| # | cosa |
|---|---|
| **L3.1** | la linea, il cambio di forma, l'arco, il rifiuto visibile |
| **L3.2** | la didascalia specchiata rispetto al pollice vivo, in fuga nella banda alta |
| **L3.3** | gli INVITI + i tre passi del tutorial |
| **L3.4** | la carta della mano + il primo avvio |
| **L3.5** | *(opzionale)* il permesso `VIBRATE` e i tick — con il costo dichiarato: «zero permessi» diventa «un permesso» |

### ONDA 4 — i cancelli. **Si scrivono ROSSI prima che il codice esista.** Tutti indipendenti fra loro.

G1..G7 (§11). G4 richiede `__test.copertura()` esteso col cuneo; G5 richiede la riparazione dell'ordinamento in `eseguiFiltrante`.

**Mappa di parallelismo:** giorno 1 → 5 specialisti su L0.1-L0.5, 3 su L2.1-L2.3, 7 sui cancelli = **15 in parallelo**. Giorno 2 → L1.1 da solo. Giorno 3 → 4 su L1.2-L1.5, 5 su L3.1-L3.5 = **9 in parallelo**.

---

## §11. LE MISURE

Regola comune, ed è la risposta alla trappola numero uno di casa: **ogni cancello legge un EFFETTO nella simulazione — chi ha davvero ricevuto il pallone, `p.slide` acceso, la velocità del pallone che cambia — e mai una bandiera scritta dal risolutore dell'ingresso.**

### G1 — Nessun rilascio, e nessun annullo di sistema, produce un calcio o un fallo

- 200 rilasci di levetta in possesso reale → **0 calci**. *Oggi: 34 su 50, cioè 68%.* **ROSSO.**
- 200 `touchcancel` su ogni superficie (levetta, due dischi, durante una carica, durante un contenimento) → **0 calci, 0 scivolate, 0 falli**. *Oggi: 4 su 4 calciano, indistinguibili da un rilascio normale.* **ROSSO.**
- 300 rilasci del disco difensivo con la levetta spinta verso l'avversario e **nessun trascinamento** → **0 scivolate, 0 falli**. *Contro lo schema del vincitore sarebbe ~100% rosso.*

**Via corta chiusa.** Si passerebbe non consegnando l'evento: lo strumento installa un contatore sul listener e **erra** se il contatore non sale. Si passerebbe rendendo inerte l'intero ramo del rilascio: G2 pretende che il rilascio con trascinamento funzioni al 98%.

### G2 — Il verbo eseguito è quello che l'anteprima mostrava

1500 pressioni sintetiche, veri `TouchEvent` sul canvas (**mai** chiamando `Touch5.*`: chiamare l'oggetto salta i listener e salta la fusione, cioè salta le due cose che la prova esiste per provare). Rumore:
- posizione della posa da una distribuzione che **può MANCARE la presa** — la cecità che ha invalidato M1 di `massima-espressione`, dove ±9 px «dentro la presa» non può generare un bersaglio mancato;
- durate **bimodali**: tap da N(133, 83), tenute da una distribuzione d'intenzione separata — con una sola normale, P(X ∈ [300,550]) = 0,022, cioè 4 campioni su 200, e il cancello non saprebbe distinguere «grammatica non separabile» da «rumore che prova la cosa sbagliata»;
- **deriva al distacco di 1-3 mm in direzione distale**, iniettata fra l'ultimo `touchmove` e il `touchend`;
- flusso dei `touchmove` fuso a uno su cinque;
- CPU a 1× / 4× / 6×; tre viewport × due mani.

L'anteprima si legge **dai pixel**: si cattura il riquadro della didascalia e si pretende non vuoto e con contrasto ≥ 3:1.

**Cancello:** anteprima ≠ esito ≤ **2%**. Verbo base ≥ **0,98**. Errori di **contesto** ≤ **2%** in totale.

**Via corta chiusa.** (a) Se l'anteprima fosse calcolata dalla stessa funzione che esegue coinciderebbe per costruzione: lo strumento la legge come pixel. (b) Un'anteprima giusta ma disegnata sotto il pollice fallisce G4. (c) Un'anteprima degenere («AZIONE») supererebbe la corrispondenza: **clausola di entropia**, ognuno dei nomi deve comparire su ≥3% e ≤60% delle pressioni. Corrispondenza ed entropia non si possono soddisfare insieme degenerando.

### G3 — Il trascinamento non ha un bias sistematico

Per ciascun disco, 1000 trascinamenti per ciascuna di 12 direzioni intese, con la deriva al distacco, su 6 configurazioni.
- **A · errore angolare mediano ≤ 8°**, 95° percentile ≤ 22°.
- **B · errore angolare MEDIO CON SEGNO, per direzione intesa, ≤ 6°.** È il termine di bias che nessuna delle quattro misure di partenza aveva: una deriva sistematica non produce dispersione, produce uno **scostamento**, e una misura senza termine di segno è cieca per costruzione al difetto che dovrebbe trovare.
- **C · lo stesso, con i 60 ms di coda NON scartati.** Deve essere **peggio**. Se non lo è, lo scarto dei 60 ms non sta facendo niente e va tolto insieme al suo costo.

*Oggi: non misurabile — il trascinamento non esiste. Lo dichiaro «non misurato», non «verde».*

### G4 — Il pollice non copre mai ciò che il gioco sta dicendo

`__test.copertura()` esteso con una zona `tipo:'pollice'` = **il cuneo** (polpastrello r 74 + fusto verso il perno del semipiano), una per tocco vivo. Quattro partite **con dita vere**: senza dita non c'è ombra, quindi CPU-contro-CPU non vale.

Soggetti: pallone · comandato · bocca della porta · **e l'anteprima stessa** (linea, arco, didascalia, tacca). L'ultima categoria è quella che tutti e quattro i progetti hanno dimenticato, ed è **l'unica che conta**: un cancello che verifica la leggibilità di tutto tranne dell'unico meccanismo che insegna il gioco è la trappola numero quattro un'altra volta.

**Cancello:** 0 fotogrammi per pallone e **anteprima**; ≤ 0,5% per il comandato; per la bocca della porta il denominatore è **«fotogrammi in cui un dito è sul disco del tiro E la porta è in quadro»**, non tutti i fotogrammi — il denominatore sbagliato è ciò che avrebbe fatto passare M2 di `massima-espressione` accanto a un'esperienza rotta al 100%.

**Via corta chiusa.** La geometria del pollice vive **nello strumento**, stampata in testa al referto con la fonte accanto: restringerla è una modifica visibile nel diff dello strumento, non una taratura del gioco. Rimpicciolire i soggetti fa diventare rossi altri cancelli. E lo strumento **emette in PNG i cinque fotogrammi peggiori** di ogni categoria: un numero verde accanto a un fermo immagine col pallone sotto il pollice è la trappola che questa casa ha già visto otto volte di fila.

**Mi aspetto che questo cancello sia ROSSO sulla mira alta** (§12.3). Quel rosso è l'esito onesto, non un difetto del cancello.

### G5 — Il censimento dell'ambiguità del ricevente

La struttura è quella di C1 di `contesto-e-intenzione`, con la correzione che il suo giudice ha imposto: lo strumento deve chiamare **il selettore del gioco**, non una copia — e il selettore va prima riparato, perché in `eseguiFiltrante` `bestDot` si aggiorna solo dentro il ramo accettato, quindi **il vincitore dipende dall'ordine di `G.players`**: lo stesso mondo, la stessa mira, un bersaglio diverso per numero di maglia.

- **A · ribaltamento** fra fotogrammi adiacenti ≤ 2% (5, 7), ≤ 5,5% (11). *Oggi: 0,4 / 0,7 / 5,5.*
- **B · ricadute** sul bersaglio base ≤ 12%.
- **C · distinzione**: ≥ 90% degli stati in cui due direzioni selezionano due compagni diversi. *Oggi 100%.*
- **D · AGGANCIO** *(nuovo)*: una volta agganciato, la quota di tenute in cui il bersaglio disegnato cambia **senza che il dito lo chieda** ≤ **1%**. *Oggi, componendo il 5,5% per fotogramma su una tenuta di 0,5 s (30 fotogrammi): 1 − 0,945³⁰ = **82%**. E il 25% anche a 5 contro 5.* **ROSSO, e massicciamente.**

**Via corta chiusa.** A si azzera allargando δ, e B esplode. B si azzera stringendo δ, e A esplode. A e B si soddisfano insieme scegliendo sempre lo stesso uomo, e C crolla. D non si compra congelando tutto, perché C pretende che il trascinamento continui a sterzare. **I quattro numeri stanno nello stesso cancello e non si comprano l'uno con l'altro.**

### G6 — Il prezzo dichiarato si paga, e non di più

**(a) Latenza al PALLONE**, non a una bandiera: fotogrammi dalla pressione alla variazione della velocità del pallone. 400 ripetizioni, durate dalla distribuzione bimodale, `--contro HEAD`.
- **cambio uomo ≤ HEAD** — spara alla pressione, non può peggiorare. È il cancello che coglie l'errore che il giudice di `contesto-e-intenzione` ha trovato: uno schema che risolve tutto al rilascio triplica la latenza del verbo difensivo più critico e la tabella gli dà costo «0».
- **contrasto ≤ 3 fotogrammi dalla pressione** (nuovo verbo).
- **passaggio: mediana ≤ HEAD + 2 fotogrammi (33 ms)**, p90 ≤ HEAD + 4.

**(b) Fotogramma:** `node strumenti/prestazione.js --contro HEAD`, e l'accettazione è sul **p95**, non sulla media. `prestazione-base.json` dice media 22,96 e **p95 33,4**: il p95 è già al pavimento dei 30 fps, e l'anteprima si disegna **esattamente sui fotogrammi p95**, gli unici senza margine. Se lo strumento non sa dichiarare la propria incertezza sul p95, **il cancello erra** invece di passare.

**(c) Neutralità a zero dita:** 300 prove, tutte le dita alzate per 1,5 s durante il possesso, **con gruppo di controllo appaiato** (dita giù e ferme, stesso seme, stesso istante). Differenza ≤ 4 punti percentuali **E** spostamento del comandato ≥ 30 unità nei 700 ms. Il secondo numero esiste perché il primo si vincerebbe congelando il giocatore.

### G7 — Il banco non mente sulla propria posizione

Prima di ogni altra cosa: lo strumento asserisce che il punto premuto sta entro 2 px dal centro che `__test.pulsanti(t)` dichiara, e **erra** altrimenti. Senza questo, ogni altro cancello misura la levetta credendo di misurare i pulsanti — che è la trappola numero quattro, e in questa casa ha già presentato il conto.

---

## §12. LE TRE OBIEZIONI PIÙ GRAVI CHE QUESTO PROGETTO **NON** RISOLVE

### 1. Non esiste un verbo per saltare l'uomo mantenendo il possesso. Il tetto competitivo resta dove sta il pavimento.

Tutti e quattro i giudici esperti l'hanno detto, e uno l'ha detto meglio di me: *«un gioco competitivo in cui non posso esprimere superiorità nel possesso ha il tetto dove ha il pavimento»*. Non chiedono skill move: chiedono **uno** strumento — uno stop-and-go, un knock-past che non regali la palla, un primo controllo orientato.

Cosa ho: `CARRY_DIST` variabile (un **gradiente di rischio**, non un verbo), lo scudo (passivo), e il fatto che l'uno contro uno offensivo si vince solo essendo più veloci o più furbi nel passaggio.

**Perché non lo compro.** Ho censito i canali e sono tutti pieni: la levetta è la corsa, il trascinamento sul disco vicino è la mira del passaggio, quello sul disco lontano è la mira del tiro, la durata del disco lontano è l'anello. Restano solo i due meccanismi che sedici giudizi hanno ucciso: **una seconda soglia di durata** o **un accordo a due dita**. Comprare il dribbling con uno di quei due significherebbe reintrodurre, per un verbo, la classe di difetti che ho tolto da tutti gli altri. **Preferisco un tetto basso e onesto a un tetto alto che crolla in area.** Ma il tetto è basso, e lo dichiaro qui invece che in una nota.

### 2. Nessuna misura su un telefono. Nessuna persona ha giocato. E tre parametri portanti sono modelli, non numeri.

- La **latenza tocco→fotone dentro questa WebView non è misurata da nessuno.** I 86-88 ms citati sono GameBench su altri giochi. Il margine di 3,4× della finestra del tiro è un argomento, non una misura.
- σ del pollice, la **deriva al distacco** (1-3 mm), la posizione del **perno** (925, 455) e quindi l'asse tangenziale della mira sono **modelli dalla letteratura**. Se qualcuno misura la deriva e viene 5 mm, la finestra dei 60 ms va rifatta e con lei G3.
- **δ = 20 e K = 220 sono valori di partenza**, non tarati: il cancello G5 li deve fissare. Chi li scrive nel gioco senza far girare G5 commette il ventitreesimo caso.
- **Le aree di sistema del §2.2 sono specificate e non verificabili qui.** Girano su Chromium headless, che non ha inserti — cioè **sullo stesso banco che ha reso il problema invisibile**. Il fatto che tutti e sette i cancelli siano verdi non direbbe niente sul fatto che il disco principale stia dentro il gesto «indietro» di Android.
- **Nessuno ha imparato questo schema.** G2 misura la condizione *necessaria* (il gioco dice sempre in anticipo cosa farà). Non misura l'imparare, e nessuna macchina lo sa fare.

### 3. Il pollice che mira alto copre la porta a cui sta mirando, in ogni attacco, per costruzione.

Non è una mia stima, è aritmetica sui numeri del file. Il commento a `:8721-8756` misura che **la bocca della porta scende fino a y 296-302** e i dischi sono stati messi a y 310/312 apposta, «dieci pixel sotto il caso peggiore misurato» — ma quel margine è stato misurato contro **il disco disegnato, non contro un dito**. Un polpastrello da 74 px di raggio centrato sul disco del tiro arriva a **y ≈ 260 a riposo**; con la mira tangenziale piena (26 px) arriva a **y ≈ 239**, cioè **57-63 px dentro una bocca alta 158-172 px**. Mirare all'angolo alto mette circa il **40% della porta sotto il tuo pollice**.

E non alterna mai: `opGoalX = p.team===0 ? FW : 0` — la squadra 0 attacca a destra per tutta la partita, **dallo stesso lato dei dischi**.

Cosa ho fatto: ho dimezzato l'escursione (26 invece di 44), ho spostato l'**informazione** fuori dal cuneo (la tacca sulla bocca, la didascalia in fuga nella banda alta). Ho reso leggibile *cosa sto facendo*. **Non ho reso visibile la porta.** Le uniche cure vere sono (a) alternare il lato d'attacco a metà tempo — che è una modifica alla simulazione, non all'ingresso, e dimezza l'esposizione invece di toglierla; oppure (b) spostare i dischi a sinistra per la squadra 0, che li mette sotto il pollice che si muove.

**G4 sarà rosso qui, e mi aspetto che lo sia.**

---

## §13. COSA NON HO VERIFICATO

1. **Non ho eseguito il gioco.** Ho verificato oggi, per lettura diretta, le sedici affermazioni di codice su cui il progetto poggia più duramente (§0 e le righe citate). Tutte le altre vengono dai quattro documenti e dai sedici giudizi, e **non le ho rifatte**.
2. **Non ho misurato un millisecondo.** Ogni «costo» qui dentro è un conteggio di operazioni. Chi lo cita come misura commette il ventitreesimo caso: l'unico confronto onesto è `node strumenti/prestazione.js --contro HEAD`.
3. **Non ho misurato l'occupazione dell'interfaccia** che l'anteprima aggiunge, che è il costo vero. Il budget del §5 è un vincolo che mi sono imposto, non un numero.
4. **Non ho verificato lo schema a 7 e a 11.** Il bias del trascinamento è misurato solo a 5 nei documenti di partenza; con nove compagni la selezione è un problema che a 5 non esiste, e G5 va girato su tutte e tre le taglie prima di dichiarare qualunque cosa.
5. **Non ho verificato che le tre riparazioni di fisica (L2.2) siano compatibili fra loro.** Cambiano la simulazione al bit e ognuna ri-fonda i banchi a seme fisso.
6. **Non ho verificato il vocabolario di FC 25** contro la documentazione EA: ho preso per buona la premessa.
7. E il conto che devo alla regola numero due: **nessuno dei sette cancelli, se diventa verde, garantisce che il gioco sia più profondo.** Garantiscono che il rilascio non tradisca, che il verbo si annunci, che il dito non copra ciò che annuncia, che il bersaglio non sfarfalli e che il prezzo sia quello dichiarato. Sono le cinque cose che possono rendere **inutilizzabile** uno schema per bene — non le cinque che ne fanno uno buono. Quello lo dice solo una persona che gioca, e questo documento non la sostituisce.