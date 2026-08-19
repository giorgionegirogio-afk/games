Ho letto il motore, misurato con cinque sonde nuove e documentato FC 25 sulla rete. Ecco il rapporto.

---

# FISICA E ANIMAZIONE — FC 25 contro CALCETTO

## 0. Metodo, e cosa NON ho verificato

Ho scritto cinque sonde a passo fisso (1/60) e seme fisso, che usano `window.__test.simulate()` e leggono `G.ball`/`G.players` direttamente. Sono file nuovi col prefisso `_`, il gioco non è stato toccato:

- `C:\Users\Utenteee\Desktop\GitHub\games\_sonda-fisica.js` — attrito a terra contro attrito in volo, cross per formula
- `C:\Users\Utenteee\Desktop\GitHub\games\_sonda-fisica2.js` — ricezione, guinzaglio, separazione
- `C:\Users\Utenteee\Desktop\GitHub\games\_sonda-fisica3.js` — cinematica col controllo bloccato dal possesso, trasparenza dei corpi, impulso del calcio
- `C:\Users\Utenteee\Desktop\GitHub\games\_sonda-fisica4.js` — cross col tasto vero, attraversamenti in partita
- `C:\Users\Utenteee\Desktop\GitHub\games\_sonda-posa.js` / `_sonda-posa2.js` — **falliti**, vedi sotto

**Non verificato, e lo scrivo perché non l'ho misurato:**

1. **Niente di tutto questo è stato misurato su un telefono.** Chromium headless, 915×412, dpr 2, banco del committente.
2. **Non ho misurato i millisecondi di nessuna proposta.** I costi qui sotto sono conteggi di operazioni, non cronometri.
3. **Lo scatto di posa al cambio di clip non l'ho fotografato.** Ci ho provato due volte (`_sonda-posa.js`, `_sonda-posa2.js`): il rumore proprio del fotogramma — due `disegna()` identici differiscono di **7.704 pixel** nel riquadro, e la sagoma ricavata per sottrazione oscilla di **739 pixel su 2.400 (30%)** fra due disegni della stessa identica posa — copre completamente il segnale. Quello che riporto sullo stacco di clip è **aritmetica letta nel codice**, non una fotografia.
4. **Tutto è a taglia 5** (FW 1150, FH 560). Il 7 e l'11 non li ho sondati.
5. **Lato FC 25**: le pitch notes ufficiali danno 404 su due percorsi (`ea.com/games/...` e `ea.com/en/games/...`); ho letto il mirror localizzato `ea.com/cs/games/...` e fonti secondarie. I conteggi di animazioni sono **cifre di marketing riportate**, non misure.
6. **Il metro non è dichiarato nel codice.** L'ho ricavato in due modi indipendenti (sotto).

---

## 1. Il metro: da unità di CALCETTO a metri

Due ancore indipendenti che concordano:

| ancora | conto | u/m |
|---|---|---|
| campo a 5: 1150×560 u, rapporto 2,05 ≈ campo da calcetto 40×20 m | 1150/40 | **28,8** |
| scatto misurato 228 u/s ≈ velocità di punta di un calciatore, 8 m/s | 228/8 | **28,5** |

Uso **28,75 u/m**. Da qui in poi ogni numero ha accanto il suo metro. Nota: con questo metro il pallone ha **0,56 m di diametro** (`B_R=8`, riga 2982) contro 0,22 m veri — 2,5×, ed è una scelta di leggibilità, non un errore. La porta è larga 5,2 m (`GOAL_H=150`) contro i 3 m del futsal.

---

## 2. Da una parte: FC 25

| cosa | numero / meccanismo | fonte |
|---|---|---|
| HyperMotionV | dati **volumetrici** da oltre **180 partite** vere, tutti e 22 i giocatori catturati insieme | EA / stampa |
| libreria | **1.847 atleti** con movimento di corpo intero (FC 24: 1.373, solo busto), **1,3 miliardi di fotogrammi** di dati; FC 24 dichiarava **oltre 11.000 clip** | EA / stampa |
| palla | **True Flight / AI ball physics**: la palla *cala, curva e sale*; il coefficiente di resistenza è stato la riparazione storica di FIFA 14 — prima «se la palla andava a 30 o 50 miglia orarie rallentava allo stesso ritmo che a cinque» | Scientific American |
| effetto | Magnus dipendente dallo spin: era sbagliato **perché** era sbagliato il drag; sistemato l'uno, è arrivata la varietà della curva | Scientific American |
| corpi | Physical Play: **scudo legato alla fatica** (più stanco = scudo più debole), sfide di spalla, jostling in aria, animazioni di collisione col palo | EA FC 25 pitch notes |
| squilibrio | **tiro off-balance** in funzione di angolo e potenza; scivolate con «migliori esiti possibili»; scivoloni sul bagnato (solo visivi) | EA FC 25 pitch notes |
| ricezione | First Touch PlayStyle con animazioni nuove per palla rasoterra **e** aerea; *Let Ball Run* parte a richiesta e non all'arrivo della palla | EA FC 25 pitch notes |
| inerzia | AcceleRATE (Explosive / Controlled / Lengthy) da Accelerazione, Altezza, Agilità, Forza: **tre curve di accelerazione diverse**, non una | EA / FUTeam |
| portiere | può muoversi solo **1-2 passi** con recupero; *Rush to Contain* | EA FC 25 pitch notes |

Il punto vero, e coincide con la guida «Complete Attacking Fundamentals» che il committente ha indicato: la profondità di FC 25 sta in **cosa premia**. Sicurezza, spazio, movimento, superare l'uomo. La fisica non è un ornamento: è **il meccanismo con cui quelle quattro cose vengono premiate**. Un primo tocco che può sporcarsi è ciò che rende «sicurezza» una scelta; una palla che continua a correre è ciò che rende «spazio» una scelta; un corpo che ha peso è ciò che rende «superare l'uomo» una scelta.

---

## 3. Dall'altra: CALCETTO, i numeri veri

### La palla

| grandezza | valore | file:riga | in metri |
|---|---|---|---|
| attrito | `fr = 0.35^(dt·ATTR_K)` → λ = 1,0498 /s | `CALCETTO-il-gioco.html:10689` | a 300 u/s frena a **11,0 m/s²** |
| corsa massima | v₀/λ = 0,9526·v₀ | commento 9251-9257 | col tetto 860 → **819 u = 28,5 m** |
| gravità | 560 u/s² | `:10695` | **19,5 m/s² = 2,0 g** |
| rimbalzo a terra | ×0,42 sopra 90 u/s | `:10706` | — |
| sponde | ×0,82 su tutti e quattro i lati | `:11166`, `:11175` | è una gabbia: niente rimesse |
| pali | raggio 5,5 u, collisione **spazzata sul segmento** | `:11184-11201` | corretta |
| traversa | quota 52 u, finestra ±7, sopra 260 u/s | `:11145` | 1,81 m |
| effetto | solo sul tiro perfetto, **`b.vy += curve·dt`** | `:10712` | sull'asse y, non perpendicolare |
| raggio | `B_R = 8` | `:2982` | 0,28 m |

### Il corpo

| grandezza | valore dichiarato | file:riga | **misurato oggi** |
|---|---|---|---|
| velocità di punta | `P_SPEED = 168`, sprint ×1,34 | `:3071`, `:10379` | passo **171,1 u/s**, sprint **228,0 u/s** (5,95 / 7,93 m/s) |
| accelerazione | `P_ACC = 900` col tetto per fotogramma | `:3072`, `:10417` | picco **661 u/s² (23,0 m/s² = 2,3 g)** |
| limite di strappo | inseguimento a 0,07 s sull'accelerazione | `:10399` | tiene |
| 0 → 95% | — | — | **0,383 s** a passo, **0,600 s** in scatto |
| inversione 180° | — | — | zero a **0,25 s**, piena all'indietro a **0,583 s**, decelerazione di punta **880 u/s² (30,6 m/s² = 3,1 g)** |
| virata a 90° | — | — | perde **il 29%** della velocità (171,1 → 120,7) e la recupera in 0,4 s |
| rotazione del corpo | angolo interpolato, τ = 0,07 s | `:10438-10448` | confermata: faccia 0 → 1,84 → 2,47 rad in 12 fotogrammi |
| raggio | `P_R = 13` | `:2950` | 0,90 m di diametro |
| separazione | spinta di **posizione**, metà sovrapposizione ciascuno | `:10451-10458` | vedi sotto |
| fiato | scatto −26/s, recupero +18/s, sotto il 25% si perde il 14% di passo | `:10375-10378` | — |
| scivolata | punta 560 u/s, lancio su 3 fotogrammi a esse | `:10343-10346` | 19,5 m/s di punta |
| portiere | `GK_DIVE_SPEED = 430` | `:10844`, `:10899` | **15,0 m/s** di tuffo |

### Il possesso

| grandezza | valore | file:riga |
|---|---|---|
| conduzione | molla verso un punto a 16 u davanti ai piedi, guadagno **14/s** (τ = 0,071 s) | `:10651-10653`, `CARRY_DIST` `:3074` |
| presa | `d < KICK_R·0,8 = 20,8` **e** `sp < 420` **oppure** sei il destinatario del passaggio — allora a **qualunque** velocità | `:10823-10834` |
| rimpallo sul corpo | solo sopra **420 u/s** e dentro `P_R+B_R−2 = 19` | `:10744-10775` |
| calcio | impulso istantaneo, la velocità è scritta a mano | `:8996-9001` |

### L'animazione

- Scheletro a **18 giunti**, **22 clip procedurali** (`:4917-4940`), nessun dato catturato.
- Fase della falcata che avanza con **lo spazio percorso**, non col tempo: `PASSO_D = 20,6` → 2,6 appoggi/s a velocità piena, tetto 3 Hz (`:10043`, `:10116`). È la riga per cui i piedi non slittano.
- Piega in curva (`rollio`) con costante di tempo 0,12 s, massimo 0,2443 rad = 14°, di cui il busto prende il 45% (`:10120-10130`, `:10206`).
- Torsione del busto in carica e in seguito, due cronometri (gamba 0,22 s, busto 0,26 s) (`:9013-9014`, `:10200-10205`).
- Squash su cinque eventi, con pavimento e tetto (`:10216-10257`).
- Ombre per giunto con `perMetro` derivato dall'altezza dell'uomo, 1,83 m (`:23522`).
- **Nessuna fusione fra clip.** La scelta è secca: `st.clip = v<14 ? 'fermo' : v<62 ? 'camminata' : 'corsa'` (`:24168`). Attraversare 62 u/s scambia tutto il gruppo di parametri in un fotogramma: inclinazione **0,18 → 0,44 rad** (10,3° → 25,2°), gomito **0,60 → 2,35 rad**, ampiezza del ginocchio **0,92 → 1,45** (`:3751`, `:3788`). Ripeto: **letto, non fotografato.**

---

## 4. LA CLASSIFICA — quanto si sente col pollice

Ordinata per quanto cambia la **decisione** di chi gioca, non per quanto è lontana dalla realtà.

---

### 1. NON ESISTE IL PRIMO TOCCO — si sente moltissimo

**Misurato.** Ho inchiodato un giocatore e gli ho tirato addosso palloni. Alla presa la velocità della palla cambia di **1, 3, 3, 4, 6 unità** su lanci da 150, 300, 400, 419, 460, 600 u/s. Cioè: **niente**. Non c'è un evento di controllo, c'è un cambio di proprietario. Da quell'istante la palla è una molla con τ = 0,071 s verso il piede, e in due decimi è incollata. E il destinatario dichiarato di un passaggio (`b.passTo`) la ferma **a qualunque velocità** (`:10828`): una cannonata a 700 u/s viene addomesticata senza errore.

Perché si sente dall'alto: non vedi il piede, ma **vedi che nessun pallone scappa mai**. Sparisce l'intera colonna «SICUREZZA» di FC 25 — ricevere sotto pressione non è una decisione, è un automatismo. È il motivo per cui il pressing non può funzionare: non c'è niente da forzare.

**Costo per colmarla in 2D su un telefono: BASSO.**
Alla riga 10829, invece di assegnare il possesso, calcolare un errore: `err = f(velocità in arrivo, angolo fra la palla e la corsa, `p.tecnica`, avversari entro 40 u)`. Sotto soglia → possesso. Sopra → la palla riparte con `v_residua = sp·0,25` in una direzione sporcata, e `p.kickCd = 0,15`. ~30 righe, **zero millisecondi** (è un conto per fotogramma per un solo giocatore).
**Rischio: alto sull'equilibrio.** Rende il gioco più duro e tocca la simulazione al bit, quindi rompe i banchi a seme fisso finché non si rifanno i riferimenti. È comunque la cosa che comprerei per prima.

---

### 2. LA CONDUZIONE È UN GUINZAGLIO RIGIDO — si sente molto

**Misurato.** A scatto pieno (228 u/s) la palla sta a **12,48 unità** dal punto di conduzione. Non 12,3 e poi 12,6: **12,48 per dieci fotogrammi di fila, e il massimo su 120 campioni è 12,48**. È una barra rigida di 0,43 m.

Perché si sente dall'alto: la distanza a cui puoi essere derubato non cambia mai. Non c'è il tocco lungo che ti fa guadagnare due metri e ti espone, non c'è il tocco corto che ti tiene coperto. Il duello uno contro uno ha un solo stato invece di un ritmo.

**Costo: BASSO.** Legare la conduzione alla **fase della falcata** che il gioco già calcola (`p.fase`, `:10116`): a ogni mezzo giro dare alla palla un impulso in avanti proporzionale alla velocità, poi lasciarla decelerare con l'attrito che c'è già, e tenere la molla solo per la correzione laterale. ~20 righe, **zero millisecondi**, e regala gratis due verbi di FC 25 (knock-on, primo tocco controllato) perché basta cambiare l'ampiezza dell'impulso.
**Rischio: medio.** Cambia la distanza di furto, quindi tocca `stealP` e la scivolata.

---

### 3. LA PALLA IN VOLO PAGA L'ATTRITO DELL'ERBA — si sente molto, e legge come un difetto

**Misurato, ed è il risultato più netto della giornata.** Ho lanciato lo stesso pallone due volte, una a terra e una a `vz = 260`, e ho campionato ogni dieci fotogrammi:

| fotogramma | vx a terra | vx in aria (z fino a 57,7) |
|---|---|---|
| 0 | 600,0 | 600,0 |
| 30 | 355,0 | 355,0 (z = 57,7) |
| 60 | 210,0 | 210,0 |
| 110 | 87,6 | 87,6 |

**Identiche al decimale.** La riga `b.vx*=fr` sta a `:10690`, prima del blocco della quota, e non sa se il pallone tocca terra.

Conseguenza misurata sul gesto vero. `doCross` (`:9187-9202`) calcola un punto d'atterraggio al secondo palo e una velocità `dist/T`, ma la palla non ci arriva:

| cross | distanza voluta | percorsa | resa | manca di |
|---|---|---|---|---|
| formula ricopiata, da (700,90) | 458 u | 315 u | **68,8%** | 143 u = 5,0 m |
| formula ricopiata, da (760,470) | 407 u | 280 u | **68,8%** | 127 u = 4,4 m |
| formula ricopiata, da (900,120) | 281 u | 204 u | **72,6%** | 76 u |
| **col tasto vero**, da (780,460) | 363 u | 256 u | **70,5%** | 107 u = 3,7 m |
| **col tasto vero**, da (880,150) | 255 u | 193 u | **75,6%** | 62 u |

Ogni cross cade **fra il 24% e il 31% corto del proprio bersaglio dichiarato**. Il conto teorico dà 69,2% a T = 0,75: misura e aritmetica coincidono.

Perché si sente dall'alto: miri al secondo palo e la palla cade sul dischetto. Non lo leggi come «fisica diversa», lo leggi come **«il gioco non fa quello che gli ho chiesto»**, che è la peggiore delle sensazioni.

**Costo: UNA RIGA di codice, MEDIO di pensiero.** Racchiudere l'attrito in `if(b.z<=0)`, oppure — meglio — usare due coefficienti (aria ≈ 0,15× erba). Zero millisecondi.
**Rischio: qui sta il prezzo.** `tiroVelocita` (`:9302`) e la lettura del portiere `GK_LETTURA` (`:9301`, `:10970`) poggiano *esattamente* sull'ipotesi che il freno per unità percorsa sia costante ovunque. I tiri sopra 500 u/s prendono `vz` fino a 130 (`:9008`) e volano: con l'attrito dell'aria arriverebbero **più veloci** di `TIRO_ARRIVO`, e il portiere sbaglierebbe l'orario del tuffo. La riparazione onesta è: attrito diviso, poi ri-derivare `tiroVelocita` con due tratti. Mezza giornata, non dieci minuti.

---

### 4. IL CORPO È ANCORA PIÙ VELOCE DI UN UOMO — si sente, ma NON va «riparato»

**Misurato.** Contro i valori di riferimento della letteratura sportiva (che **non ho misurato io**: punta 8-9,5 m/s, accelerazione massima 6-10 m/s², decelerazione 4-8 m/s², 2-4 s per arrivare a punta):

| | CALCETTO misurato | uomo | rapporto |
|---|---|---|---|
| velocità di punta | 7,93 m/s | 8-9,5 | **giusta** |
| 0 → 95% della punta | 0,383 s (passo) / 0,600 s (scatto) | 2-4 s | **4-6× più svelto** |
| accelerazione di punta | 23,0 m/s² | 6-10 | **2,5-3,5×** |
| decelerazione di punta | 30,6 m/s² | 4-8 | **4-6×** |
| inversione a 180° | 0,583 s a piena velocità contraria | 1,5-2,5 s | **3-4×** |

Ma questa è la voce dove **il committente ha già fatto il lavoro migliore del progetto**, e va detto: c'è il limite di strappo a 0,07 s sull'accelerazione (`:10399`), il tetto duro di `P_ACC·dt` per fotogramma (`:10417`), la faccia che ruota con τ = 0,07 s invece di incollarsi all'input (`:10438`), la piega in curva che resta 0,12 s dopo che la traiettoria è già dritta (`:10130`), il lancio della scivolata spalmato su tre fotogrammi. Sono esattamente le contromisure giuste, e **il dato che le premia l'ho misurato**: la virata a 90° costa **il 29% della velocità**. Quello è peso vero.

Perché non va riparato: una punta di 8 m/s su un campo di 40 m in una partita di 90 secondi è già mezzo campo in due secondi e mezzo. Portare l'accelerazione a valori umani rende il gioco melmoso su uno schermo di 915 punti, dove non c'è spazio per una rincorsa.

**La differenza che vale la pena è un'altra, e costa poco: DIFFERENZIARE.** FC 25 non ha una curva di accelerazione, ne ha tre (Explosive / Controlled / Lengthy) legate ad altezza, agilità e forza. CALCETTO ha un solo `fatt(p.vel, 0.12)`. Dare a ogni giocatore una `τ` di accelerazione e una velocità di punta correlate in modo **inverso** (chi parte forte ha punta bassa) è **una riga in più** in `updatePlayerFisica` e zero millisecondi, e trasforma il roster da «numeri diversi» in «uomini diversi». Rischio: basso.

---

### 5. I CORPI NON HANNO PESO: LA COLLISIONE È UNA SPINTA DI POSIZIONE — si sente molto

**Misurato su 30 secondi di CPU contro CPU:** 1.388 fotogrammi con almeno due corpi entro 26 u. Per ognuno ho confrontato lo spostamento vero con quello che la velocità spiega:

- scarto mediano **0,80 u per fotogramma** = 48 u/s di moto che la velocità non spiega
- 95° percentile **3,29 u per fotogramma** = **197 u/s**, cioè **più di una corsa** (171 u/s)
- massimo 36,6 u in un fotogramma

E la velocità **non cambia mai** per il contatto: la separazione (`:10451-10458`) scrive `p.x` e `p.y` e basta. Il cambio di velocità nei fotogrammi di contatto (mediana 106 u/s², 95° 818 u/s²) è tutto sterzo dell'IA, non urto.

Perché si sente dall'alto: due figure che si toccano **scivolano l'una fuori dall'altra** mentre le gambe continuano a camminare alla stessa cadenza. Non esiste lo scudo, non esiste la spallata, non esiste il contenimento fisico. È l'intera colonna «Physical Play» di FC 25, ed è anche mezza colonna «superare l'uomo»: se il corpo non contrasta, l'unico modo di togliere palla è la scivolata — che è infatti quello che succede.

**Costo: BASSO in codice, ALTO in resa.** Il ciclo O(n²) c'è già ed è pagato. Sostituire le due righe di spinta con uno scambio di impulso: entrambi i corpi ricevono ±Δv lungo la normale, pesato su un attributo `fisico` (che esiste già in `ATTRIBUTI`, `:6960`) e sul prodotto scalare delle velocità; chi arriva di spalla vince, chi è fermo cede. ~15 righe, **zero millisecondi** (45 coppie a 5v5, 231 a 11v11, già iterate oggi).
**Rischio: medio-alto.** Un impulso mal tarato fa esplodere le figure e rompe `clampPlayer`. Va limitato a un tetto duro e provato con `strumenti/misura.js`, che quel tipo di salto lo vede già.

---

### 6. IL CORPO È TRASPARENTE ALLA PALLA — si sente come ingiustizia

**Misurato, con un corpo inchiodato in mezzo alla traiettoria:**

| lancio | stato del corpo | distanza minima palla-centro | esito |
|---|---|---|---|
| 300 u/s | normale | 18,3 u | preso |
| 300 u/s | `kickCd` (ha appena calciato) | **0,7 u** | **ATTRAVERSA** |
| 300 u/s | `recover` (si sta rialzando) | **0,7 u** | **ATTRAVERSA** |
| 700 u/s | normale | 21,0 u | rimpallo, restituzione 0,25, si impenna a vz 83 |
| 700 u/s | `kickCd` | 2,6 u | **ATTRAVERSA a 502 u/s** |
| 900 u/s | `kickCd` | 4,0 u | **ATTRAVERSA a 692 u/s** |

0,7 unità dal centro significa **attraverso l'ombelico**. La causa è strutturale: il rimpallo esiste solo sopra 420 u/s (`:10744`) e sotto quella soglia l'unica interazione palla-corpo è la **presa**, che è vietata a chi ha `kickCd`, `recover`, `slide` o `rove`.

**Misurato in partita vera:** su 60 secondi di CPU contro CPU, **97 fotogrammi su 3.600** in cui il segmento percorso dalla palla taglia il cilindro di un corpo senza che succeda nulla — velocità mediana 219 u/s, massima 624, **40 di questi sopra 300 u/s**. Nello stesso minuto i tocchi veri (cambio di velocità della palla) sono stati **9**. Alla velocità mediana un attraversamento dura una decina di fotogrammi, quindi si tratta di **circa dieci-venti attraversamenti distinti al minuto** — la stima del numero di eventi è mia, il conteggio dei fotogrammi è misurato.

Perché si sente: è la cosa che il giocatore chiama «il gioco bara». Un passaggio che passa in mezzo a un difensore fermo non ha spiegazione possibile.

**Costo: MOLTO BASSO.** È la migliore occasione della lista. Estendere il blocco del rimpallo (`:10744-10775`) a tutte le velocità con una restituzione crescente, togliere l'esenzione `kickCd` dal blocco (tenerla solo per il tiratore stesso nel fotogramma del calcio), e trattare `recover`/`slide` come corpi passivi. ~10 righe, **zero millisecondi**. Rischio: basso, ma cambia la simulazione al bit.

---

### 7. NIENTE EFFETTO, SE NON UNO E SBAGLIATO D'ASSE — si sente poco, ma chiude un vocabolario

`b.vy += b.curve*dt` (`:10712`): la curva è **sempre lungo y**, mai perpendicolare alla velocità, e vive solo sul tiro perfetto. Per un tiro verso la porta (quasi tutto lungo x) l'approssimazione tiene; per un cross, per un filtrante, per un passaggio in verticale, sarebbe un'accelerazione lungo la corsa invece di una curva. FC 25 ha lo swerve a comando, il cross avvolgente, il knuckleball — e li ha **perché** il Magnus è calcolato bene, come racconta la storia di FIFA 14.

Perché si sente poco dall'alto: la curva **si vede benissimo** in pianta (è l'unica cosa della fisica aerea che si vede), ma non cambia nessuna decisione finché nessun gesto la comanda.

**Costo: BASSISSIMO per correggere l'asse** (2 righe: ruotare `curve` sulla perpendicolare della velocità), **BASSO per darla al cross**. Zero millisecondi. **Ma non serve a niente finché non c'è un gesto che la chiede** — e questo è il punto della regola di casa numero 2: una fisica migliore che nessun comando premia è una tastiera in più.

---

### 8. LA QUOTA È FINTA: METÀ ALTEZZA E DOPPIA GRAVITÀ — si sente poco

`g = 560 u/s² = 19,5 m/s² = 2,0 g`. «Sopra la testa» è a 26 u = **0,90 m**, cioè metà uomo. Il cross misurato ha apice **37,6 u = 1,31 m** e sospensione **0,72 s**; con la gravità vera, lo stesso apice darebbe **1,03 s**. Il gioco aereo corre al 140% del tempo reale.

Perché si sente poco: dall'alto della quota vedi solo l'ombra che si stacca. **L'unica parte che il pollice sente è la sospensione**: quanto tempo hai per arrivarci sotto. 0,72 contro 1,03 s è un 30%, e conta solo se esiste un gesto che si prepara sotto il cross — cioè finché non c'è il colpo di testa, non conta.

**Costo: una costante.** Ma la costante è letta da `finestraRovesciata` (`:9554`), dalla traversa, dal portiere, da `doCross`. Rischio: medio, guadagno: piccolo. **Non lo comprerei.**

---

### 9. NON ESISTE IL COLPO DI TESTA — si sente come verbo mancante, non come fisica sbagliata

C'è la rovesciata (`:9549-9602`, con una finestra ben fatta: risolve l'equazione della caduta e chiede di essere sotto la verticale). Non c'è lo stacco di testa. Quindi un cross può solo **atterrare** e poi essere raccolto: l'unico modo di finalizzarlo è aspettare che ricada sotto i 26 u.

**Costo: MEDIO.** Una clip nuova (il rig procedurale c'è, `poseRovesciata` mostra che sa fare gesti nel piano sagittale), un contrasto aereo fra due corpi, e un gesto sul dito. È l'unica voce di questa lista che costa **disegno** oltre che aritmetica — e il disegno è la valuta scarsa (vedi sotto).

---

### 10. LE PALLE FERME NON USANO LA FISICA — si sente, ma è una scelta difendibile

`Duel` (`:11927`) è un minigioco a zone e tempi: punizioni e rigori non passano mai da `updateBall`. In FC 25 la palla è la stessa e la mira è continua. **Costo per unificare: ALTO.** Non lo toccherei: su un telefono un minigioco a zone si legge meglio di un reticolo.

---

### 11. NIENTE VENTO, NIENTE CAMPO BAGNATO — non si sente

Verificato per assenza: nessuna occorrenza di vento, pioggia o bagnato nella fisica. FC 25 ha entrambi (e gli scivoloni sul bagnato sono **dichiaratamente solo visivi e solo fuori dal competitivo**, il che è già una confessione di quanto pesino). Dall'alto, a 91 pixel di figura, non esistono. **Non comprarli.**

---

### 12. ANIMAZIONE: 22 CLIP PROCEDURALI CONTRO 11.000 VOLUMETRICHE, CON STACCHI SECCHI — si sente MENO di quanto sembri

Qui la vista dall'alto **salva**. A 91 pixel di periferica (che con dpr 2 sono ~45 punti CSS) un avambraccio è largo 3-4 pixel: la differenza fra una clip catturata da un professionista e una curva di seno con sei parametri non arriva all'occhio. Quello che arriva è: **i piedi slittano o no** (non slittano: la fase avanza con lo spazio, `:10116`), **il corpo si piega in curva o no** (si piega, 14° con 0,12 s di ritardo), **il gesto ha una preparazione o no** (ce l'ha, due cronometri).

Lo stacco di clip a 14 e a 62 u/s è **aritmeticamente reale** e non l'ho fotografato. Ma anche fosse visibile, il suo effetto è un guizzo di un fotogramma, non una decisione sbagliata.

**Costo di una dissolvenza fra clip: BASSO in righe, REALE in millisecondi** — bisogna valutare il rig **due volte** per i ~7 fotogrammi della transizione, e il rig è il ciclo caldo del gioco. Su 10-22 figure. **È l'unica voce di questa lista che costa davvero millisecondi, ed è quella che rende di meno. Non comprarla.**

---

## 5. La regola dei costi, e perché quasi tutto qui costa zero

Il riferimento di banco (`strumenti/prestazione-base.json`) dice **22,96 ms di fotogramma medio contro un obiettivo di 16,7**, p95 33,4 — su un banco che rasterizza **in software, senza scheda grafica** (`strumenti/prestazione.js`, seconda avvertenza: «senza alcun freno il banco segna già 26 ms»). Quel numero misura il banco, non il telefono, e il committente lo sa già. Ma la lezione operativa è netta:

> **Aritmetica su 11-23 corpi a 60 Hz costa zero. Pixel costano.**

Un impulso di collisione su 231 coppie sono ~2.000 moltiplicazioni per fotogramma: sotto il rumore di misura. Una dissolvenza di posa sono 22 valutazioni di rig in più, dentro il ciclo che già domina il fotogramma. **Non ho misurato né l'una né l'altra**: è un conto di operazioni, e va confermato con `node strumenti/prestazione.js --contro HEAD`, che è l'unico confronto onesto su questo banco.

---

## 6. Le tre cose che comprerei domani, in quest'ordine

| # | cosa | righe | ms | rischio | perché prima |
|---|---|---|---|---|---|
| 1 | **Il corpo ferma la palla** (voce 6) | ~10 | 0 | basso | 97 fotogrammi al minuto di palla dentro un corpo. È un difetto, non una differenza: non c'è nessun mondo in cui sia voluto |
| 2 | **La palla in volo non paga l'erba** (voce 3) | 1 + mezza giornata di ri-taratura | 0 | medio | ogni cross del gioco manca il proprio bersaglio del 24-31%. Anche questo è un difetto, non una scelta |
| 3 | **Il primo tocco può sporcarsi** (voce 1) | ~30 | 0 | alto | è l'unico che apre una colonna intera di FC 25 (SICUREZZA) e dà un motivo al pressing |

Poi, se il pressing di 3 funziona: **l'impulso nella separazione** (voce 5), perché a quel punto il corpo dell'avversario diventa lo strumento per applicarlo, e scudo/spallata/contenimento arrivano gratis con una sola meccanica invece che con tre pulsanti.

E la nota della regola di casa numero 2, applicata a me stesso: **nessuno di questi numeri, se diventa verde, garantisce da solo che il gioco sia più bello.** La resa del cross a 1,00 garantisce solo che il cross arrivi dove è puntato; che serva a qualcosa dipende dal fatto che qualcuno, là, possa colpirla — e oggi non può, perché il colpo di testa non c'è (voce 9). Le voci 2 e 9 vanno pensate insieme, o la prima è una riparazione che non si vede.

**Fonti:** [EA SPORTS FC 25 Gameplay Deep Dive](https://www.ea.com/cs/games/ea-sports-fc/fc-25/news/pitch-notes-fc-25-gameplay-deep-dive) · [Scientific American — How a Video Game Finally Figured Out Air Resistance](https://www.scientificamerican.com/article/getting-on-the-ball-how-soccer-video-game-got-physics-right/) · [FIFA Infinity — Deep Dive into HyperMotionV](https://www.fifa-infinity.com/ea-sports-fc/a-deep-dive-into-the-advanced-technology-that-has-changed-the-face-of-ea-sports-fc/) · [Dexerto — AcceleRATE spiegato](https://www.dexerto.com/ea-sports-fc/ea-fc-25-accelerate-explained-lengthy-controlled-explosive-more-2922345/) · [FUTeam — FC 25 AcceleRate](https://fifauteam.com/fc-25-accelerate/) · [Trusted Reviews — What is HyperMotion V](https://www.trustedreviews.com/uncategorized/what-is-hypermotion-v-4352934)