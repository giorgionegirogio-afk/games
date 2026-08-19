# IL PERNO — schema di comandi per CALCETTO su telefono

**Progetto derivato dalla geometria della mano, non dal vocabolario di FC 25.**
Base: `C:\Users\Utenteee\Desktop\GitHub\games\CALCETTO-il-gioco.html` (1.689.939 byte, 30.581 righe). Nessuna riga del gioco è stata toccata.

---

## 0. Cosa ho misurato oggi, prima di progettare

Ho scritto una sonda Playwright — `C:\Users\Utenteee\Desktop\GitHub\games\_sonda-pollici.js` — che chiede la geometria al gioco (`__test.pulsanti`, `__test.comandiTouch`, `__test.bande`) e manda dita di protocollo via CDP. Tre risultati, tutti a 915×412, dpr 2, taglia 5:

**M1 — la geometria vera** (chiesta al gioco, non ricopiata):

| elemento | valore misurato |
|---|---|
| disco GRANDE | centro **(851, 352)**, r **40**; riquadro 807..895 × 308..396 |
| disco PICCOLO | centro **(757, 340)**, r **30**; riquadro 723..791 × 306..374 |
| distanza fra i centri | **94,76 px** |
| bussola | rettangolo **(10, 355) – (102, 402)**, centro (56; 378,5) |
| bande | BAR_H **45**, PA_Y0 **45**, PA_Y1 **348**, FOOT_H **64**, PA_CY **196** |
| pausa | 44×44 in (0,0) |

**M2 — c'è una lente in cui una pressione legittima muore.** `Touch5.start` (:8823-8837) prova i pulsanti in ordine e per ciascuno controlla *prima* la presa (r+10) *poi* l'anello di esclusione (r+18), col GRANDE per primo. Esiste quindi un insieme di punti che stanno **dentro la presa del piccolo** e **dentro l'anello del grande**: l'anello risponde per primo e il tocco muore. L'ho premuto:

| punto | dist. dal PICCOLO | dist. dal GRANDE | `stats.filtranti` |
|---|---|---|---|
| (795,7 · 344,9) — lato del grande | 39 (presa 40) | 55,8 (esclusione 58) | **+0** ← il tocco muore, e non nasce nemmeno la levetta |
| (757 · 340) — centro del piccolo | 0 | 94,8 | +1 |
| (718,3 · 335,1) — lato opposto, **stessa distanza 39** | 39 | 133,8 | +1 |

Stessa distanza dal bersaglio, un lato funziona e l'altro no. E il lato che non funziona è **esattamente quello da cui arriva il pollice destro che riposa sul GRANDE e allunga verso il PICCOLO**: la direzione d'approccio più frequente che esista.

**M3 — un tocco annullato dal sistema regala il pallone.** `touchcancel` (:8968) chiama `Touch5.end`, che chiama `release`, che con il pallone al piede fa `doPass`. Quattro prove su quattro, con la palla ancora del comandato all'istante del distacco:

| | palla dopo il distacco |
|---|---|
| rilascio normale (×4) | owner −1, **373 / 468 / 454 / 395 u/s**, `passTo` valorizzato |
| **touchcancel** (×4) | owner −1, **423 / 476 / 446 / 511 u/s**, `passTo` valorizzato |

Sono indistinguibili. La tendina delle notifiche, la gesture di sistema, una chiamata in arrivo: il telefono manda `touchcancel` e **il gioco batte un passaggio**. Questo non è un difetto dello schema che propongo — è il difetto dello schema di oggi che il mio elimina per costruzione.

---

## 1. La geometria del pollice — il modello, e i suoi numeri

Il telefono in orizzontale non ha «uno schermo»: ha **due settori circolari** e un resto. Tutto il progetto scende da qui.

### 1.1 Il perno

Il pollice non è un cursore, è una **leva imperniata**. In presa orizzontale l'articolazione metacarpo-falangea del pollice sta *fuori* dallo schermo: di lato oltre la cornice, e sotto il bordo inferiore, perché il bordo lungo del telefono appoggia nell'incavo fra pollice e indice. Il modello che uso:

```
PERNO DESTRO   = (925, 455)    // 10 px oltre il bordo destro, 43 px sotto il bordo basso
PERNO SINISTRO = ( -10, 455)
scala: 915 px CSS su ~155 mm di larghezza utile → 1 px = 0,169 mm
```

**Questo è un modello, non una misura di una mano** (§10). Ne dichiaro subito la sensibilità: spostando il perno di 30 px in diagonale, il disco GRANDE passa da 16,5 mm a 26,4 mm dal perno — **resta dentro la stessa banda**. La conclusione regge; il singolo numero no.

### 1.2 Le quattro bande

| banda | dal perno | cosa ci può stare |
|---|---|---|
| **RIPOSO** | 12–28 mm = **71–166 px** | ciò che si **tiene**: il pollice ci sta senza sforzo per minuti |
| **CORSA** | 28–48 mm = **166–284 px** | ciò che si **colpisce**: raggiungibile con una spazzata dell'arco |
| **SFORZO** | 48–65 mm = **284–385 px** | niente. Ci si arriva solo mollando la presa |
| **FUORI** | oltre 65 mm = **oltre 385 px** | **informazione**, e solo informazione |

Verifica dei comandi di oggi contro le bande (calcolo, non misura):

| comando | dal perno | banda | verdetto |
|---|---|---|---|
| disco GRANDE (851,352) | 126,8 px = **21,4 mm** | RIPOSO | giusto: è il disco che si tiene (carica, contenimento) |
| disco PICCOLO (757,340) | 203,6 px = **34,4 mm** | CORSA | giusto: è il disco che si colpisce |
| levetta a riposo (96,272) | 211,5 px = **35,7 mm** | CORSA | la levetta vera è dinamica, quindi nasce dove il pollice riposa davvero. La *posa* disegnata sta 7 mm troppo in fuori |
| bussola (56; 378,5) | 101 px = **17,1 mm** | RIPOSO | **sbagliato: è sotto la mano** (§1.4) |
| pausa (22,22) | 434 px = **73,4 mm** | FUORI | giusto per una pausa: si raggiunge solo lasciando la presa |
| **centro della bocca della porta attaccata** (897,196) | 261 px = **44,0 mm** | CORSA | il pollice destro ci finisce *naturalmente*. È la conferma numerica del conto già scritto a :8714-8733 |

### 1.3 L'ombra: il pollice non copre un disco, copre un cuneo

Il polpastrello copre ~25 mm (147 px di diametro). Ma dietro il polpastrello c'è il **fusto**, largo ~30 mm alla base, che va dal punto di contatto al perno. La zona nascosta è l'unione dei due: un cuneo. Calcolata su griglia da 1 px, contro l'area di gioco (0..915 × 45..348) e contro i «soggetti chiave» che `__test.copertura()` già protegge:

| pollice appoggiato su | copre dell'area di gioco | copre della bocca porta | copre della bussola |
|---|---|---|---|
| GRANDE | 7.714 px, **2,8 %** | **0 %** | 0 % |
| PICCOLO | 12.123 px, **4,4 %** | **0 %** | 0 % |
| levetta (posa a riposo) | 20.782 px, **7,5 %** | 0 % | **100 %** |
| bussola | 4.054 px, 1,5 % | 0 % | 100 % |

**Il primo risultato assolve la posizione attuale dei due dischi**: sono così vicini al perno che la loro leva è corta, quindi la loro ombra è corta, e non tocca la porta. *Un comando vicino al perno costa poco schermo: è la ragione geometrica per cui i comandi vanno nell'angolo e non «dove sta comodo il dito».*

### 1.4 Il secondo risultato è una condanna: la bussola è sotto la mano

Con il pollice sinistro sulla levetta, la bussola è coperta al **100 %**. Non «un po' sovrapposta»: interamente dentro il cuneo del fusto. Il file lo sospettava (il commento a :24943-24969, «la casa del pollice sinistro è terra occupata») ma difendeva solo il *cerchio* della levetta; il fusto non era nell'elenco. E la levetta è viva **tutte le volte che il giocatore si muove**, cioè quasi sempre.

Quindi: **la bussola va spostata**, e la geometria dice dove.

### 1.5 Dove sta l'informazione

Calcolo sull'area di gioco: **il 47,5 % non è raggiungibile da nessuno dei due pollici**, e la barra alta (y 0..45) lo è per il **100 %** — l'angolo alto sinistro sta a 74,5 mm dal perno sinistro, quello alto destro a 73,6 mm dal destro. Il tabellone occupa x 208..720 (formula del resize a :15899, non misurata). Restano liberi 195 px in alto a destra e 164 in alto a sinistra.

> **La bussola va in alto a destra: x 823..903, y 3..42 (80×39).** Centro a 73,8 mm dal perno destro: irraggiungibile — che per uno strumento di sola lettura non è un difetto, è la specifica.

E cade tutta la macchina dei due ancoraggi con lo scivolo esponenziale (:24931-24999): in quella banda non passa il pallone, non passa la levetta, non passa niente. Meno codice, non di più.

---

## 2. Le tre leggi che escono dalla geometria

**LEGGE 1 — Il comando sta dove il pollice riposa; l'informazione sta dove il pollice non arriva.**
Comandi nella banda 12–48 mm dai perni. Informazione oltre i 65 mm: barra alta, e la metà lontana dell'area di gioco.

**LEGGE 2 — La risposta a un gesto si legge SUL PALLONE, mai sotto il dito.**
Il pollice destro copre ciò che tocca. Qualunque etichetta, freccia o anteprima disegnata accanto al disco è già persa. Il pallone invece la camera lo tiene nel terzo centrale (è la premessa del conto a :8748-8752): è il punto dello schermo dove l'occhio è già e dove nessun pollice arriva. **Tutto il ritorno visivo del pollice destro si ancora al pallone.** Ciò che non può stare sul pallone diventa **aptico** (`buzz()`, :6500, già nel gioco): la vibrazione è l'unico canale che un dito non può coprire.

**LEGGE 3 — Nessun ingresso legge una velocità.**
Il gioco ha già pagato questo prezzo una volta: il commento a :8882-8896 descrive il browser che fonde i `touchmove` sotto carico, la velocità misurata che diventa zero e «il tiro più netto letto come un passaggio», con una deroga fragile a rattoppare. La fusione unisce le *posizioni* ma consegna sempre l'ultima: **posizione e durata sopravvivono alla fusione, la velocità no.** Quindi lo schema classifica solo su *dove finisce il dito* e *quanto è stato giù*. La soglia dei 650 px/s e la finestra dei 90 ms **spariscono dal codice**, e con loro la deroga.

---

## 3. La mappa degli ingressi — geometria in pixel su 915×412

### 3.1 Le zone

| zona | geometria (px CSS) | natura |
|---|---|---|
| barra alta | y 0..45 | informazione. Nessun tocco la legge |
| pausa | 44×44 in (0,0) | fuori portata: si preme apposta |
| tabellone | x 208..720, y 0..45 | informazione |
| **BUSSOLA (nuova)** | x 823..903, y 3..42 | informazione, 73,8 mm dal perno destro |
| area di gioco | y 45..348 | il mondo. Salta moviola/ripresa (invariato) |
| fascia bassa | y 348..412 | trasparente, casa dei comandi |
| **LEVETTA** | dinamica: nasce dove il dito si appoggia | pollice sinistro |
| **DISCO GRANDE** | centro (851+CMD_DX, 352), r 40 | pollice destro, banda RIPOSO |
| **DISCO PICCOLO** | centro (757+CMD_DX, 340), r 30 | pollice destro, banda CORSA |

I due dischi restano dove sono: `M1` conferma la geometria e §1.3 conferma che non coprono la porta. Non li sposto: li ho verificati, non ereditati.

### 3.2 La levetta (pollice sinistro) — invariata nei numeri, cambiata nella legge

```
STICK_DEAD   12 px     zona morta
STICK_FULL   46 px     corsa piena (magnitudine analogica fino a qui)
STICK_SPRINT 66 px     oltre = sprint
MAXR         70 px     l'origine insegue il dito
```

Tutti e quattro restano. Sono i numeri di oggi e non ho motivo di toccarli. Cambiano **tre leggi**:

1. **Il rilascio non fa niente. Mai.** `Touch5.release()` diventa vuota. Alzare il pollice è sicuro (è il *meccanismo O* del dossier: lo stato a zero dita non punitivo, l'unica cosa che l'analisi indipendente di FIFA Mobile chiama geniale).
2. **`touchcancel` = annulla, su qualunque superficie.** Chiude M3.
3. **Stato a zero dita**: se per 0,35 s non c'è nessun tocco, il comandato smette di veleggiare e tiene la posizione che il suo ruolo gli assegna. Un semaforo, una fermata, una notifica non costano il possesso.

**NUOVO — l'effetto dopo il calcio (aftertouch).** Per `AFTER_T = 0,45 s` dopo che il comandato ha calciato, la componente della levetta **perpendicolare** alla velocità orizzontale della palla scrive la curva:

```
perp   = (-b.vy, b.vx) / |v|
rampa  = clamp(tDaCalcio / 0.20, 0, 1) * (1 - tDaCalcio/AFTER_T)
b.curve = CURVA_MAX * dot(levettaUnit, perp) * rampa      CURVA_MAX = 170
```
e l'integrazione a :10712 si corregge d'asse (oggi `b.vy += curve*dt`, sempre lungo y):
```
b.vx += perp.x * b.curve * dt;   b.vy += perp.y * b.curve * dt;
```
Durante quei 0,45 s il peso della levetta sulla corsa del giocatore scende a 0,5. **È una scelta vera: curvare la palla o inseguirla.** Costa zero ingressi nuovi, zero superficie, e si scopre per caso — la palla piega verso il pollice. Il dossier di fisica dice che la curva «si vede benissimo in pianta» ma «non serve a niente finché nessun gesto la comanda»: questo è il gesto.

### 3.3 I due dischi (pollice destro) — la grammatica

Un solo insieme di regole, identico su entrambi i dischi, in ogni contesto.

```
R_PRESA      = r + 10        50 (grande) / 40 (piccolo)     prende il tocco
R_ESCL       = r + 18        58 / 48                        uccide il tocco (non nasce la levetta)

dal PUNTO D'APPOGGIO, misurato al RILASCIO:
  0 .. R_ARMA        verbo base            R_ARMA = 22 + 14*min(1, tenuta/0.6)   → 22..36 px
  R_ARMA .. 96 px    verbo + DIREZIONE
  oltre 96 px        ANNULLA

durata, dal touchstart al touchend:
  < 150 ms           TAP        verbo d'istinto
  >= 150 ms          TENUTA     verbo pesato; buzz(12) al passaggio di soglia
  >= 600 ms          (solo piccolo) la tenuta sfocia nella CHIAMATA; buzz([10,40,10])

direzione: 4 settori da 90°, allineati agli assi del campo (il campo non ruota mai)
  AVANTI = verso la porta attaccata · INDIETRO · FASCIA ALTA · FASCIA BASSA
  confine ai 45°: il confine più facile che una mano sappia sentire
```

Perché 22 px: sono 3,7 mm, ben sopra il rollio involontario di un pollice appoggiato, e stanno dentro i 60 px che restano a destra e in basso prima del bordo — **la direzione si può armare anche verso il bordo**, perché conta lo spostamento, non lo spazio. Perché cresce a 36 px: una carica di tiro può durare 1,25 s, e in 1,25 s un pollice rotola.

Perché 96 px per annullare: verso sinistra ce ne sono 851, verso l'alto 256. È il gesto universale «trascina via dal pulsante e lascia» di ogni telefono in commercio, e nel gioco è la **finta**: `chiudiAnticipo` (:9450) è già scritto e già chiamato.

**Perché nessuna di queste direzioni è un'associazione da imparare:** non sono quattro verbi, sono *una* regola — la direzione del dito è la direzione della palla, o del corpo. Il gioco poi *battezza* il risultato (filtrante, cross, scarico), ma il giocatore non ha memorizzato niente: ha puntato.

### 3.4 Le tre etichette, non due

Il contesto si risolve al touchstart (già così, :8818-8821) e non cambia a metà pressione. Ma su **tre** stati, non due, perché tre sono gli stati del possesso nel calcio:

```
IO   = il comandato ha il pallone        GRANDE: TIRA        PICCOLO: PASSA
NOI  = la mia squadra ce l'ha, io no     GRANDE: SCATTA      PICCOLO: CHIAMA
LORO = ce l'hanno loro                   GRANDE: CONTRASTA   PICCOLO: CAMBIO
```

La ricerca riportata nel dossier dice che oltre due contesti si scade nell'indovinello. **Lo violo apposta e dichiaro il rischio** (§8, punto 7): la mitigazione è che la tricotomia è quella dello sport, e che l'etichetta è scritta sul disco. Il cancello 1 (§9) esiste esattamente per impedire che quell'etichetta menta — perché in questo progetto ha già mentito una volta, per otto fotogrammi e due giurie (`HUD_POSA`, :8781-8796).

E la mnemonica è una frase sola:

> **Il disco grande sono io. Il disco piccolo è la palla.
> Quanto tengo è quanto peso. Dove tiro il dito è dove va.**

### 3.5 Il ritorno visivo, e dove si disegna

| segno | dove | quando |
|---|---|---|
| ghiera del disco che si riempie in ambra | sul disco (sotto il dito, ma è ridondante) | durante la tenuta |
| **freccia di gesso** lunga 60 px, dal raggio 16 al raggio 76 dal centro del pallone | **sul pallone** | appena la direzione è armata |
| **didascalia** col nome del verbo, 26 px sopra il pallone | **sul pallone** | idem; diventa `ANNULLA` in grigio oltre i 96 px |
| linea di mira punteggiata dal pallone alla bocca della porta | **sul pallone → porta** | durante la carica del tiro |
| tick aptico 12 ms / 10-40-10 ms | nel dito | ai passaggi di soglia |

Freccia e didascalia vanno dichiarate in `TOUCH_ZONE` con il loro alfa, così `__test.copertura()` può giudicarle come giudica tutto il resto — e rifiutarle se coprono il pallone che stanno annunciando.

---

## 4. Tabella azione → ingresso

Trenta voci. Le colonne «esiste già» e «costo» dicono cosa si compra davvero.

### IO — ho il pallone

| azione | ingresso | esiste già? | costo |
|---|---|---|---|
| corsa analogica | levetta 12→46 px | sì (`humanMove` :8643) | 0 |
| sprint | levetta oltre 66 px | sì (`humanSprint` :8665) | 0 |
| **effetto (aftertouch)** | levetta nei 0,45 s dopo il calcio | no; `b.curve` esiste, l'asse è sbagliato | ~10 righe + 2 di correzione d'asse |
| **tiro d'istinto** | GRANDE, tap < 150 ms | sì, ma oggi è un flick della levetta (:8904-8919). La qualità viene dalla fase di `G.possT`: l'anello pulsa già (:24475-24485) | sposta il chiamante |
| tiro col timing | GRANDE tenuto, rilascio | sì (`startCharge`/`releaseCharge`, finestra 0,50–0,80 s) | 0 |
| mira del tiro | levetta al rilascio del GRANDE | mezzo sì (`dy += my*260`, :9238) | estendere all'orizzontale |
| pallonetto | GRANDE + sprint alla levetta al rilascio | sì (:9241) | 0 |
| tiro al volo | GRANDE tenuto quando la palla arriva | sì ma irraggiungibile (soglia misurata 36,4 u dal dossier) | fuori dallo schema: è fisica, non ingresso |
| rovesciata | GRANDE con palla alta in discesa in area | sì (`finestraRovesciata` :9549) | 0 |
| **finta di tiro** | GRANDE, dito oltre 96 px, rilascio | no; `chiudiAnticipo` :9450 già scritto e chiamato | ~8 righe |
| appoggio corto | PICCOLO, tap < 150 ms | sì (ramo tap di `releaseCharge`, :9226) | sposta il chiamante |
| **passaggio pesato** | PICCOLO tenuto 0,15–0,60 s | no. Oggi la velocità è calcolata: `clamp(300+d·0,9, 320, 520)` | `v = clamp((300+d·0,9)·(0,72+0,62·w), 300, 620)`, w = clamp((ten−0,05)/0,55,0,1). A d=170: **326 u/s morbido, 607 u/s teso** |
| **mira del passaggio** | direzione del dito sul PICCOLO | no: `eseguiPassUmano` (:9090) non legge mai la levetta | il punteggio `smarcato()` si restringe al settore |
| filtrante | PICCOLO + AVANTI | sì (`eseguiFiltrante` :9143), oggi mirato con la levetta | cambia sorgente della direzione |
| cross | PICCOLO + FASCIA, metà offensiva | sì (`doCross` :9187) | 0 |
| **cambio di gioco alto** | PICCOLO + FASCIA, metà difensiva | no, e il canale è **morto**: il modificatore del filtrante non fa niente lì (:9130) | riusa `doCross` con bersaglio diverso |
| **scarico all'indietro** | PICCOLO + INDIETRO | no | ~15 righe |
| **chiamata in profondità** | PICCOLO tenuto oltre 0,60 s, con direzione: il compagno parte, la palla lo anticipa al rilascio | no. È la voce n.2 del dossier, il pilastro MOVIMENTO che oggi non esiste | un campo per giocatore + un ramo in `aiDecide` (già gira per ogni uomo) |
| **passa-e-vai** | PICCOLO + sprint alla levetta al rilascio | no; `G.swLock` (:9965) esiste già | ~6 righe |
| **finta di passaggio** | PICCOLO oltre 96 px | no | condivide il ramo della finta di tiro |

### NOI — la squadra ha la palla, io no

| azione | ingresso | esiste già? | costo |
|---|---|---|---|
| **scatto** | GRANDE, tap | no | riusa il fiato dello sprint |
| **corsa in profondità** | GRANDE tenuto | no | come sopra, sostenuta |
| **chiedo palla** | PICCOLO, tap | no | +peso nel punteggio di `smarcato()` |
| **chiedo palla in quello spazio** | PICCOLO + direzione | no | idem, con il bersaglio spostato |
| **mi offro corto** | PICCOLO tenuto | no | il ruolo esiste in `teamBrain` |

### LORO — hanno la palla loro

| azione | ingresso | esiste già? | costo |
|---|---|---|---|
| **contrasto in piedi** | GRANDE, tap | no. Oggi il furto col corpo è automatico (:10656-10681) e l'unico verbo difensivo umano è la scivolata | `p.pressa=1` per 0,22 s, `stealP` 0,42→0,66, recupero 0,18 s, fallo solo da dietro |
| **contenimento (jockey)** | GRANDE tenuto | no per l'umano; la CPU ce l'ha (`contieni`, `standoff`, :11726-11742) — e a Duro `standoff=0`, quindi oggi non esiste per nessuno | velocità ×0,62, faccia sulla palla, `standoff` umano 30 |
| scivolata | GRANDE + direzione | sì (`startSlide` :9501) | cambia solo la sorgente della direzione |
| **sprint-jockey** | levetta oltre 66 px + GRANDE tenuto | no | 0 (composizione) |
| annulla | GRANDE oltre 96 px | no | condiviso |
| cambio ciclico | PICCOLO, tap | sì (`cambiaGiocatore` :9956) | 0 |
| **cambio direzionale** | PICCOLO + direzione | no — ma `cambiaGiocatore` **ordina già per angolo attorno al pallone**: la funzione è scritta, manca il settore | ~6 righe |
| **raddoppio comandato** | PICCOLO tenuto | no; il ruolo `raddoppio` esiste in `teamBrain` (:11758) ma solo automatico e solo da 7 in su | `G.raddoppioChiesto[t]`, letto a 4 Hz |

Conto finale: **circa 26 verbi distinti con 1 levetta e 2 dischi.** DLS ne espone 6, FIFA Mobile ~8, FC Mobile 31 con 5–6 pulsanti.

### Il cambio a icona sulla minimappa: lo rifiuto, e dico perché

Il dossier lo mette al n.7 della lista. La geometria lo boccia su tre conti indipendenti: **(a)** la bussola è 88×43 px, un'icona di giocatore lì dentro è larga ~4 px, contro le soglie di 24 (WCAG AA), 44 (Apple), 48 (Material), 54–63 (Parhi, NN/g); **(b)** il polpastrello copre 147 px, cioè **più larga dell'intera bussola**; **(c)** misurato in §1.3: la bussola è coperta al 100 % dal cuneo del pollice sinistro. Un bersaglio che è più piccolo del dito, dentro uno strumento che è più piccolo del dito, sotto la mano che lo dovrebbe usare.

Il cambio a icona si compra invece con il **settore**: `PICCOLO + direzione`. Bersaglio infinito, nessuna superficie nuova, nessuna occlusione, e la funzione che ordina i compagni per angolo attorno al pallone **è già scritta**.

---

## 5. Come si scoprono i comandi, e come si ricordano

Cinque dispositivi, in ordine di quanto lavoro fanno.

**1. L'etichetta dice il verbo, sempre.** Sei parole in tutto, tre per disco. Costo di apprendimento: zero, a una sola condizione — che non menta. Il cancello 1 è lì per quello.

**2. La ghiera che si riempie.** La tenuta è l'unico modificatore che si scopre da solo: tieni premuto, vedi la ghiera caricare, capisci che la durata conta. Non serve nessuno che te lo dica.

**3. Il tick aptico a 150 ms.** `buzz(12)`. Il pollice *sente* il confine fra tap e tenuta. È l'unico canale che il dito non può coprire e l'unico che funziona mentre l'occhio guarda il pallone. Un secondo tick a 600 ms sul PICCOLO annuncia che il compagno è partito.

**4. Il menù radiale disegnato sul pallone.** Appena il dito supera i 22 px compare, **sul pallone**, la freccia e il **nome del verbo**. Il giocatore può muovere il dito da un settore all'altro e vedere il nome cambiare *prima di lasciare*. È un marking menu con le etichette visibili — il meccanismo con l'apprendimento più basso fra quelli ad alta capacità — e non costa i 600–1000 ms del menù radiale classico, perché appare **dentro un gesto che il giocatore stava già facendo**.

Questa è la cosa che rende lo schema imparabile per tentativi, e per questo è la sostanza del cancello 3: **il gioco deve annunciare, prima del rilascio, esattamente cosa farà il rilascio.** Se vale, si impara giocando; se non vale, nessun tutorial rimedia.

**5. Il tutorial cambia forma: non più quattro passi in dieci secondi.** Oggi `Tut.steps` (:29120-29125) insegna 4 gesti su 11 e si spegne al primo gol o dopo 10 secondi. Al suo posto: **l'annuncio al primo momento utile**. La prima volta — e una sola volta nella vita del salvataggio — che una condizione si presenta, il disco competente lampeggia e due parole di gesso compaiono sul pallone:

| condizione | annuncio |
|---|---|
| ho palla in metà offensiva, un compagno libero al secondo palo | TRASCINA IN FASCIA |
| ho palla, un compagno ha spazio dietro l'ultimo difensore | TRASCINA AVANTI |
| ho palla, due avversari entro 60 u | TIENI: PASSAGGIO TESO |
| ho palla nella mia metà, la loro linea è alta | TRASCINA IN FASCIA: CAMBIO GIOCO |
| sono senza palla e la squadra ce l'ha | TIENI: VAI IN PROFONDITÀ |
| il portatore avversario mi punta | TIENI: CONTIENI |
| il pallone ha appena lasciato il mio piede | MUOVI LA LEVETTA: EFFETTO |

Sette annunci, un `SAVE.visti` di sette bit, una tabella valutata a 4 Hz. Insegna quando il verbo *serve*, non quando il cronometro decide: è la differenza fra un manuale e un allenatore. **Costo dichiarato: sette scritte in più nella vita di un salvataggio, tutte sul pallone, tutte soggette alla regola di scarto e al cancello 2.**

**Perché si ricorda.** Perché non c'è quasi niente da ricordare. L'unica associazione arbitraria dell'intero schema è **sprint + tiro = pallonetto**, e la dichiaro come tale: non c'è nessun motivo per cui «correre» debba voler dire «alzare la palla». La mitigazione è che è il comportamento di oggi, quindi non è una cosa nuova da imparare — è una cosa vecchia da non disimparare.

---

## 6. Precedenza: chi vince quando due comandi sono ambigui

### 6.1 All'appoggio del dito (`touchstart`), in quest'ordine

```
0.  scena moviola o ripresa       → salta, il tocco muore qui
1.  gioco in pausa                → il tocco non entra (invariato)
2.  PRIMA PASSATA — LE PRESE.     per OGNI disco della squadra t:
        se d <= R_PRESA           → il disco prende il tocco. Fine.
3.  SECONDA PASSATA — LE ESCLUSIONI. solo se nessuna presa ha risposto:
        se d <= R_ESCL per un qualunque disco → il tocco MUORE
4.  altrimenti                    → nasce la levetta, se la squadra non ne ha già una viva
5.  un secondo dito sullo stesso disco       → ignorato: comanda il primo
6.  un secondo dito con la levetta già viva  → nasce solo se cade su un disco
```

**Le due passate sono la riparazione del difetto M2.** Oggi presa ed esclusione si valutano *dentro lo stesso ciclo*, un pulsante per volta, e il GRANDE è il primo: il suo anello di esclusione batte la presa del PICCOLO su una mezzaluna spessa ~3 px e lunga ~40, esattamente sul lato da cui arriva il pollice. Separando le passate, **la presa batte sempre l'esclusione**, e quella mezzaluna torna a funzionare. È una modifica di quattro righe.

Le due prese non possono mai rispondere insieme: 50 + 40 = 90 contro i **94,76 px misurati** fra i centri. Il varco è di **4,76 px**, e resta pagato.

### 6.2 Dentro un gesto già cominciato

```
il proprietario del tocco è deciso all'appoggio e NON cambia mai (già così, :8845)
il contesto (IO/NOI/LORO) è congelato all'appoggio (già così, :8818-8821)

al rilascio si leggono, nell'ordine:
  a. raggio  = |rilascio - appoggio|      →  base / direzione / annulla
  b. durata  = touchend - touchstart      →  peso, sempre, anche con direzione armata
  c. sprint della levetta all'istante del rilascio  →  modificatore
```

Raggio e durata **coesistono sempre**: un passaggio ha sempre una direzione *e* un peso. Non sono due verbi in conflitto, sono due parametri.

### 6.3 La legge dei pareggi

> **In ogni ambiguità vince il verbo meno impegnativo.**

- raggio esattamente = R_ARMA → verbo base (non la direzione)
- durata esattamente = 150 ms → tap (non la tenuta)
- direzione esattamente sul confine a 45° → il settore **INDIETRO** se è uno dei due, altrimenti quello più sicuro fra i due
- pallone perso mentre il dito è giù → il verbo congelato all'appoggio parte lo stesso, ma se non ha più senso (`TIRA` senza palla) **non parte niente**: non si converte in un altro verbo
- `touchcancel` → **annulla**, sempre, dovunque

Il fallimento è sempre benigno: chi sbaglia la direzione ottiene il passaggio base, chi sbaglia la durata ottiene l'appoggio corto. È la proprietà che, secondo la ricerca riportata nel dossier, fa reggere sotto pressione i sistemi a flick-sul-pulsante.

---

## 7. I casi limite

| caso | cosa succede | costo |
|---|---|---|
| **dito che scivola sulla levetta** | l'origine insegue oltre i 70 px (invariato). Se il dito esce dalla tela, l'ultima posizione vale finché non arriva `touchcancel` | 0 |
| **dito che rolla durante una tenuta lunga** | `R_ARMA` cresce da 22 a 36 px in 600 ms: più tieni, più devi essere deciso per armare una direzione | 1 riga |
| **tocco doppio accidentale** | lo schema **non contiene un solo doppio tocco**, e non per pigrizia: la finestra di rilevamento (250–300 ms) ritarderebbe *ogni* tocco singolo. Un doppio accidentale è quindi due tap. Smorzatore: una seconda pressione sullo stesso disco entro 180 ms dal rilascio precedente è ignorata | 3 righe. **Prezzo dichiarato:** due passaggi deliberati a raffica sono impossibili |
| **il browser fonde i touchmove** | **risolto per costruzione** (Legge 3). Nulla legge una velocità. Restano `touchstart` (posizione + tempo) e `touchend` (posizione + tempo), che la fusione non tocca. Spariscono la soglia a 650 px/s, la finestra dei 90 ms, i 14 campioni di storia e la deroga a :8897 | **codice in meno** |
| **mani grandi** | i due dischi scorrono **in orizzontale**, non in diagonale: `CMD_DX ∈ {0, −22, −44}` (piccole / medie / grandi). L'asse verticale non è disponibile — sopra c'è la bocca della porta, che nei fermi immagine scende fino a y 296-302 e i dischi cominciano a 310 e 312. A −44 il PICCOLO arriva a x 665, e la pastiglia del tutorial finisce a 647: **18 px di margine** | una costante |
| **mani piccole** | i dischi stanno a 21,4 e 34,4 mm dal perno: entrambi dentro l'arco anche di una mano piccola (estensione ~52 mm) | 0 |
| **schermo piccolo** | i raggi restano in px CSS, che sono già un'unità *fisica* (1/160 di pollice): 13,5 mm e 10,1 mm di diametro su qualunque telefono. Sopra ogni soglia pubblicata. Il vincolo verticale diventa una formula: `r_grande ≤ VH − 68 − PA_CY − bocca/2 − 4`. A 915×412 dà r ≤ 58 (ne uso 40, **18 px di margine**); a 640×360 dà r ≤ 43 (**3 px**). Sotto quella soglia **si riduce il raggio, mai la quota** |
| **mancino** | `SAVE.mancino` specchia in x: dischi a (64,352) e (158,340), bussola in alto a sinistra, pausa in alto a destra. `touchBtnLayout` **sa già specchiarsi** (:8774-8776, il ramo del secondo giocatore): `const right = (G.mode===2) ? (t===1) : !SAVE.mancino;` | 1 riga + una voce di menu |
| **una mano sola** | i dischi funzionano, la levetta no: si difende, non si attacca. Lo stato a zero dita è neutro, quindi non si viene puniti per averlo fatto. **Non lo risolvo, lo dichiaro** (§8) |
| **notifica / gesture di sistema** | `touchcancel` = annulla. Chiude M3, che oggi fallisce 4 volte su 4 |
| **il pallone passa sotto un disco** | `scartoHUD` lo sfuma già; **l'alfa non tocca la geometria del tocco** (già così, e va tenuto così: un comando che si sposta perché è velato è peggio di un comando coperto) | 0 |
| **due giocatori a schermo diviso** | `teamOf` divide a x 457,5; i dischi si specchiano già. Ma la bussola è una sola e il posto libero in alto a destra è di uno solo dei due. **In 2 giocatori la bussola resta dov'è oggi, sotto il pollice sinistro del giocatore 1.** È il punto più debole del progetto e non ho una soluzione che non costi una seconda bussola |
| **dito bagnato, guanti, schermo sporco** | nessuna mitigazione. I 22 px di soglia d'armamento aiutano; il resto no |

---

## 8. Cosa questo schema NON può fare

1. **Niente di simultaneo sotto il pollice destro.** I due dischi distano 94,76 px: un pollice ne tiene uno per volta. Quindi non esistono coppie modificatore-azione sul lato destro; ogni modificatore deve venire dal pollice sinistro (lo sprint) o dal tempo. È la ragione per cui l'annullamento è un raggio e non «l'altro tasto».
2. **Non si mira e si corre insieme durante la carica del tiro.** La mira è la levetta, e la levetta è anche la corsa. È deliberato: rende la carica un rischio. Ma è una perdita reale rispetto a un gamepad.
3. **Zero skill move.** Non c'è un secondo stick e non ci deve essere: il pollice destro è già la colonna dei due dischi. E il segnale che *nomina* una skill move — un moto d'arto di ~6 unità di mondo, 15 px di periferica — vale 1/28 di un passaggio (425 px). I provini ciechi del progetto dicono che perfino il corpo intero è nominabile 0-2 volte su 10.
4. **Al massimo 4 direzioni per disco.** Il tetto di Kurtenbach è 8 e la sicurezza è 4, ma qui il tetto vero è più basso ancora: due dei quattro settori sono troncati dal bordo dello schermo a 60 px. Un menù a 8 direzioni non ci sta fisicamente.
5. **Niente doppio tocco**, quindi tutta la famiglia dei verbi «dinked» di FC Mobile è fuori.
6. **Niente velocità del gesto come parametro.** Sparisce la coppia «swipe lento = tiro basso, swipe veloce = tiro alto». È il prezzo esplicito dell'immunità alla fusione dei `touchmove`.
7. **Tre contesti invece di due.** Sopra il tetto che la ricerca indica. Rischio dichiarato, mitigato dall'etichetta e sorvegliato dal cancello 1.
8. **Il portiere resta ingovernabile.** L'uscita comandata avrebbe voluto un quarto canale (nel dossier era un doppio tocco) e io il doppio tocco non ce l'ho. Non la compro e non fingo di comprarla.
9. **Con una mano sola non si attacca.**
10. **Lo schema consuma più schermo di quello di oggi, non meno.** Aggiunge la freccia, la didascalia e la linea di mira. Il dossier avverte che la valuta scarsa non è la CPU ma il quadro, e questa è la spesa vera del progetto. Per questo il cancello 2 misura l'occlusione e non il tempo di fotogramma.
11. **Non risolve niente di ciò che è rotto sotto l'ingresso.** Il cross arriva al 68-75 % del bersaglio dichiarato perché la palla in volo paga l'attrito dell'erba; il tiro al volo è irraggiungibile perché la carica non si apre oltre 36,4 unità; la traversa non si può colpire perché nessuna sorgente produce quota 45. Uno schema di comandi migliore su una fisica rotta è **una tastiera più bella**. Le tre riparazioni del dossier di fisica vengono prima di questo documento, non dopo.

---

## 9. Come si misura che funziona

Quattro cancelli. Per ciascuno: cosa misura, cosa lo fa fallire, e **per quale via corta non si può superare**.

### CANCELLO 0 — Nessun tocco annullato regala il pallone
`strumenti/annullo.js`

Duecento prove indipendenti: portare il gioco in uno stato casuale con il pallone al comandato, appoggiare un dito lontano dai dischi, trascinarlo, e mandare `touchCancel`. Si scarta la prova se il pallone ha cambiato padrone prima del distacco. **Passa se in 200/200 il pallone resta al comandato e `|v|` non cambia di più di 5 u/s.**

*Oggi fallisce 4 volte su 4* (M3): il pallone parte a 423–511 u/s con `passTo` valorizzato. È un cancello che comincia rosso, che è l'unico tipo di cui ci si possa fidare.

*Via corta chiusa:* si potrebbe passare semplicemente non consegnando il `touchcancel`. Lo strumento perciò verifica **prima** che l'evento arrivi, con un contatore installato sul listener; se il contatore non sale, il cancello **erra** invece di passare.

### CANCELLO 1 — L'etichetta non mente mai
`strumenti/etichetta.js`

Quattrocento prove indipendenti (4 semi × 3 taglie × 2 difficoltà, durata di simulazione casuale). In ciascuna: si leggono le etichette disegnate da `__test.comandiTouch`, si preme il centro di un disco con un dito di protocollo, e si registra il verbo davvero eseguito (contatori di `G.stats`, `G.ctrl`, `p.slide`, `b.owner`, `b.passTo`). **Fallisce se anche una sola prova esegue un verbo diverso da quello scritto sul disco.**

Cento delle quattrocento prove sono **avversarie**: si cercano gli istanti entro 250 ms da un cambio di possesso, cioè dove il contesto è appena cambiato. Se in quattro partite non si trovano cento cambi di possesso, lo strumento **erra**, non passa.

*Via corta n.1 — l'etichetta generica.* Un disco che dicesse sempre `AZIONE` non potrebbe mai contraddirsi. Lo strumento perciò misura anche **l'entropia delle etichette** sul campione: ognuna delle sei deve comparire su almeno il 3 % delle prove e nessuna su più del 60 %. Un'etichetta che non discrimina fallisce l'entropia; una che mente fallisce la corrispondenza. **Non si possono soddisfare entrambe degenerando.**

*Via corta n.2 — congelare il contesto.* Chiusa dal requisito dei cento istanti avversari, che devono essere *trovati*, non dichiarati.

Questo cancello ha un precedente: `HUD_POSA` ha mostrato per otto fotogrammi due comandi che il gioco in quell'istante non offriva, e due giurie ci sono cascate (:8781-8796). Questo è quel difetto reso misurabile.

### CANCELLO 2 — Il pollice non copre mai l'azione
`strumenti/ombra.js`

Il gioco espone già `__test.copertura()`: incrocia i soggetti chiave (`PALLA_SCH`, `PROTA_SCH`, `CHIAVE_SCH` — pallone, comandato, porta, portiere) con le zone d'interfaccia dipinte. Lo strumento aggiunge, per ogni tocco vivo, una zona `tipo:'pollice'` = il cuneo di §1.3 (polpastrello r 74 px + fusto verso il perno del semipiano in cui cade il tocco). Poi fa giocare quattro partite **con dita vere** (non CPU contro CPU: senza dita non c'è ombra) e conta i fotogrammi in violazione.

**Soglie:** zero fotogrammi per `palla` e `porta`; ≤ 0,5 % per `comandato`.

*Via corta n.1 — dichiarare un pollice più piccolo.* La geometria del pollice è una costante **dello strumento**, non del gioco: vive in `strumenti/ombra.js`, non nell'HTML, e lo strumento la stampa in testa al referto con la fonte del numero (25 mm di area d'impatto, NN/g). Il gioco non può negoziarla.

*Via corta n.2 — rimpicciolire i soggetti.* I rettangoli vengono da `PALLA_SCH`/`PROTA_SCH`/`CHIAVE_SCH`, che sono gli stessi che `istantanea.js` già usa. Rimpicciolirli farebbe diventare rossi altri cancelli.

*Ha i denti, ed è dimostrato:* con la bussola dove sta oggi, il pollice sinistro la copre al 100 % (§1.3). Se la bussola fosse fra i soggetti, la build attuale fallirebbe questo cancello senza appello.

### CANCELLO 3 — Il verbo si annuncia prima di partire
`strumenti/scoperta.js`

Millecinquecento pressioni casuali ma legali: punto casuale dentro la presa di un disco, tenuta casuale in [40, 900] ms, trascinamento casuale in [0, 130] px. Per ciascuna, **prima del rilascio**, si legge l'annuncio a schermo; dopo, il verbo eseguito. **Fallisce se annuncio ed esito discordano su più del 2 % delle pressioni.**

Non misura se una persona impara: nessuna macchina lo sa fare. Misura **la condizione necessaria** — che il gioco dica sempre, in anticipo, cosa sta per fare. Se vale, lo schema è imparabile per tentativi; se non vale, nessun tutorial lo salva.

*Via corta n.1 — la profezia che si autoavvera.* Se l'annuncio fosse calcolato dalla stessa funzione che poi esegue, coinciderebbe per costruzione. Lo strumento perciò **non legge la previsione dal codice**: cattura il riquadro 120×24 px in cui la didascalia deve essere dipinta, nell'istante del rilascio, e pretende che sia **non vuoto e con contrasto ≥ 3:1** contro l'intorno. Una previsione giusta ma invisibile fallisce. Una previsione dipinta sotto il pollice fallisce il cancello 2.

*Via corta n.2 — provarlo solo su una macchina veloce.* Trecento delle 1500 pressioni si eseguono con il gioco portato a 22 ms di fotogramma (la cifra del banco di riferimento), e ciascuna viene **ripetuta con tutti i `touchmove` intermedi rimossi**: solo `touchstart` in P e `touchend` in Q. **L'esito deve essere identico.** È il cancello che avrebbe intercettato il difetto di :8882-8896 prima che venisse scritto.

---

## 10. Il costo, dichiarato come chiede la regola 5

**Aritmetica per fotogramma:** due confronti di raggio mentre un tocco su un disco è vivo (0-2 tocchi), una proiezione vettoriale mentre l'aftertouch è attivo, una lettura di campo dentro `aiDecide` che gira già. **Sotto il rumore.** Non l'ho misurato.

**Disegno — è qui che si paga.** Nuovi elementi dipinti: freccia di gesso (1 tracciato), didascalia (1 testo), linea di mira punteggiata (1 tracciato), ghiera che carica (1 arco). Massimo 4 tracciati e 2 testi in più per fotogramma, e **solo mentre un disco è premuto**. Il banco di riferimento sta a 22,96 ms medi contro un obiettivo di 16,7, su un rasterizzatore software: il testo è la voce cara. **Non l'ho misurato, e va misurato con `node strumenti/prestazione.js --contro HEAD`.** Regola che propongo: se la didascalia costa più di 0,4 ms sul p95, si rifiuta la didascalia e resta la sola freccia.

**Codice tolto:** la storia dei 14 campioni con la finestra dei 90 ms su due levette, la soglia dei 650 px/s, la deroga a :8897, e i due ancoraggi della bussola con lo scivolo esponenziale a semivita 0,12 s (§1.4). Piccolo, ma nella direzione giusta.

**Un costo che non è di macchina e va detto:** spostare la bussola in alto a destra cambia cosa vedono `folla.js` e `istantanea.js`. Il commento a :24970-24978 racconta che riservare l'angolo basso-sinistro al pollice faceva scendere la crescita della sagoma della folla dal 14,3 % al 9,2 % su un minimo dell'8 %. Quei cancelli **vanno rieseguiti, non dati per buoni.**

---

## 11. Cosa non ho misurato

Regola 4, per esteso.

1. **Non ho misurato una mano.** Il perno, i 25 mm di polpastrello, i 30 mm alla base e le bande 12/28/48/65 mm vengono dalla letteratura riportata nel dossier più una scelta di modello mia. Ho dichiarato la sensibilità (§1.1) e regge, ma nessuno di quei millimetri è una misura fatta oggi.
2. **Non ho misurato un solo millisecondo.** Né di fotogramma, né di latenza. La colonna «costo» è un conto di operazioni.
3. **Non ho misurato l'apprendimento.** Il cancello 3 misura una condizione necessaria, non l'imparare.
4. **Non ho implementato niente.** Le tre misure di §0 riguardano lo schema di **oggi**. Del mio non c'è una riga.
5. **Non ho misurato 640×360 né i 2 giocatori.** Là la geometria è aritmetica.
6. **Il tabellone a x 208..720 è derivato dalla formula del resize** (:15899), non misurato.
7. **Non ho verificato che la banda alta sia davvero libera** oltre x 720: ho cercato elementi ancorati al bordo destro e non ne ho trovati, il che non è la stessa cosa che averla fotografata.
8. **Non ho verificato il vocabolario di FC 25** contro la documentazione EA: ho preso per buono il dossier.
9. E il conto che devo a me stesso, sulla regola 2: **nessuno dei quattro cancelli, se diventa verde, garantisce che il gioco sia più bello.** Garantiscono che l'etichetta non menta, che il dito non copra l'azione, che il verbo si annunci e che una notifica non costi il pallone. Sono le quattro cose che possono rendere *inutilizzabile* uno schema per bene — non le quattro che ne fanno uno buono. Quello lo dice solo una persona che gioca, e questo documento non lo sostituisce.

---

**File prodotto:** `C:\Users\Utenteee\Desktop\GitHub\games\_sonda-pollici.js` (sonda Playwright: geometria, lente della precedenza, tocco annullato). Nessun file del gioco è stato modificato.