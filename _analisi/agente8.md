# PUNTA E PREMI
## Schema di comandi mobile per CALCETTO — progetto completo

---

## 0. Due rettifiche alla premessa, prima di progettare

**La minimappa non è toccabile.** La premessa la elenca fra i comandi di oggi. Non lo è: `Touch5.start` (`CALCETTO-il-gioco.html:8815-8850`) conosce due cose sole, i pulsanti di `touchBtnLayout` e la levetta. `MINI_RECT` (`:25001`) è letto in quattro punti, tutti di impaginazione. **Misurato dall'inventario**: un `touchstart` al centro della bussola fa nascere uno stick lì. Il progetto qui sotto **non la rende toccabile**, e al §6 dico perché.

**I gesti di oggi sono nove, non tre.** Sullo stick vivono cinque esiti di rilascio (tiro, scivolata, cross, passaggio forte, passaggio semplice) più lo sprint per magnitudine; sui dischi, quattro atti. Il problema di CALCETTO non è che ha pochi comandi: è che ne ha **nove che si contendono un pollice e mezzo**, e che cinque di quei nove passano dal canale più fragile del telefono.

---

## 1. LA TESI, IN UNA RIGA

> **Un pollice punta. L'altro sceglie il verbo. La durata dice quanta intenzione ci metti.**

Tre primitive, e nessun'altra:

| primitiva | canale fisico | costo (dai numeri del dossier) |
|---|---|---|
| **DOVE punti** | posizione della levetta (continua) | 0 ms: il pollice è già lì |
| **QUANTO tieni** | durata della pressione su un disco | 133 ms per il tap, poi tempo che stai già spendendo |
| **CHE COSA hai** | possesso (contesto etichettato) | 0, perché l'etichetta cambia |

**Non esiste un solo gesto di velocità in questo schema.** Zero flick, zero doppio tocco, zero secondo dito, zero seconda superficie. È una decisione, non una dimenticanza: il flick costa **421 ms contro 133** (ScienceDirect, via il dossier), collide con il trascinamento della levetta, e soprattutto **legge `touchmove`, che il browser fonde quando la scena è piena** — cioè sotto porta. Questo gioco l'ha già pagato una volta: le venti righe di sicura a `:8882-8896` esistono perché *«dei cinque punti di un flick ne consegna UNO»*. Togliendo tutti i flick, quella classe di difetti non ha più superficie su cui esistere, e `s.hist` (14 oggetti per dito per fotogramma) si cancella.

Cinque gesti in tutto: **tocca A, tieni A, tocca B, tieni B, muovi la levetta.** Diciassette esiti, perché ogni esito è la stessa frase detta con più o meno intenzione, e perché il contesto la traduce. La regola mnemonica è una sola frase e copre l'intero gioco:

> **«Tocchi poco, tieni tanto. La levetta dice dove.»**

Questo risolve il problema che Nacenta (CHI 2013) misura come dominante: gli errori dei set di gesti sono **errori di associazione**, non di forma. Un set monotono — più tieni, più lontano/più alto/più rischioso — non ha associazioni da sbagliare: ha un'unica direzione, e la direzione è la stessa in tutti e cinque i gesti.

---

## 2. LA MAPPA DEGLI INGRESSI — geometria a 915×412 px CSS, dpr 2

Dispositivo: 1830×824 px di periferica. Conversione dichiarata: **1 px CSS ≈ 0,16–0,17 mm** (aritmetica, non misura, come nel dossier di ricerca).

### 2.1 Le zone, tutte, senza buchi

| # | zona | geometria (px CSS) | in mm | proprietario | cosa fa |
|---|---|---|---|---|---|
| 1 | **Pausa** | rettangolo (0,0)–(44,44) | 7,0–7,5 | DOM (`#pauseBtn`, `:863`) | invariato |
| 2 | **DISCO A** | cerchio (851, 352) **r 40** | ⌀ 12,8–13,6 | pollice destro | TIRA / CONTRASTA / spento |
| 2b | presa di A | stesso centro, **r 50** | ⌀ 16,0–17,0 | | il dito prende il disco |
| 2c | annullo di A | oltre **90 px** dal centro | | | l'atto si annulla (vedi §5) |
| 3 | **DISCO B** | cerchio (751, 334) **r 34** | ⌀ 10,9–11,6 | pollice destro | PASSA / CAMBIO |
| 3b | presa di B | stesso centro, **r 44** | ⌀ 14,1–15,0 | | |
| 4 | **corone morte** | 50→58 attorno ad A, 44→52 attorno a B | | nessuno | niente, ma **promuovibili a levetta** (§5) |
| 5 | **LEVETTA** | tutto il resto della tela | | pollice sinistro | nasce dove il dito si posa; l'origine insegue oltre 70 px |
| 6 | casa della levetta (solo disegno, a riposo) | (96, 272) r 46 | | — | dice dove appoggiare il pollice |
| 7 | **bussola** | (10, 355)–(102, 402) a taglia 5/7; (10, 340)–(133, 402) a 11 | | solo disegno | **non è una superficie di comando** |

**Verifica aritmetica dei due dischi** (perché è il punto in cui tre giochi grandi hanno sbattuto):
distanza fra i centri √(100² + 18²) = **101,61 px**.
- bordi disegnati: 101,61 − 40 − 34 = **27,6 px di erba fra i due dischi**;
- cerchi di presa: 101,61 − 50 − 44 = **7,6 px di franco**: le due prese **non si toccano mai**. Un dito non può prendere il disco sbagliato per sovrapposizione. È l'invariante che la misura 3 del §7 difende a zero tolleranza.

**Soglie di bersaglio** (Apple 44 · Material 48 · Parhi 9,2 mm ≈ 54–58 px · NN/g 10 mm ≈ 58–63 px):

| | disegnato | presa | Apple | Material | Parhi | NN/g |
|---|---|---|---|---|---|---|
| DISCO A | 80 | 100 | ✔ | ✔ | ✔ | ✔ |
| DISCO B | **68** | 88 | ✔ | ✔ | ✔ | **✔ anche sul disegnato** |

Oggi B è disegnato a 60 px (9,5–10,3 mm) e passa NN/g solo grazie al raggio di presa. Lo porto a 34 perché **B è il disco più premuto del gioco** nel mio schema (il passaggio è l'azione più frequente della partita) e non deve essere il più piccolo. Costa 8 px di larghezza in un angolo già dichiarato trasparente.

### 2.2 Le bande della levetta — un'unica scala, quattro significati

Costanti già nel file (`:8642`, `:8664`): `STICK_DEAD=12`, `STICK_FULL=46`, `STICK_SPRINT=66`, inseguimento `MAXR=70`.

| banda | px dal centro | movimento | e al **rilascio di un disco** significa |
|---|---|---|---|
| morta | 0–12 | fermo | **nessuna mira**: l'assistenza sceglie (comportamento di oggi) |
| passo | 12–46 | 0→100% della velocità | **precisione**: tiro di precisione, passaggio corto |
| corsa | 46–66 | 100% | **potenza piena** |
| scatto | > 66 | ×1,34, fiato −26/s | **impegno massimo**: pallonetto sul tiro, passa-e-vai sul passaggio, affondo sulla scivolata |

La scala è **monotona**: più spingi, più ti impegni. Nessuna associazione arbitraria da ricordare. È la stessa quantità che il pollice sinistro governa già per correre.

---

## 3. LA TABELLA AZIONE → INGRESSO

Le etichette dicono sempre la verità, con **isteresi di 0,25 s** (una etichetta non cambia se lo stato non ha tenuto un quarto di secondo) e **congelate mentre un dito è giù**. Oggi l'etichetta segue il possesso fotogramma per fotogramma e può mentire a metà pressione; l'atto è già congelato al `touchstart` (`:8817`), l'etichetta no.

### 3.1 Con il pallone tra i piedi → **[TIRA] [PASSA]**

| # | azione | ingresso esatto | parametri | pilastro FC 25 |
|---|---|---|---|---|
| 1 | camminare / correre / scattare | levetta, 4 bande | come oggi | — |
| 2 | **proteggere palla (scudo)** | **nessun comando**: conseguenza della banda lenta | `CARRY_DIST` diventa funzione della velocità (§3.4) | SICUREZZA |
| 3 | **appoggio sicuro** | **tocca B**, < 0,15 s | vel. 340, bersaglio: il compagno più aperto entro **±40°** dalla levetta e 260 unità | SICUREZZA |
| 4 | **passaggio pesato** | **tieni B** 0,15 → 0,35 s | vel. 340→480, portata 170→330 unità | SICUREZZA |
| 5 | **filtrante** | **tieni B** 0,35 → 0,50 s | vel. 480→560, raso terra (`b.vz=0`), anticipo 0,55 sulla corsa | **SPAZIO** |
| 6 | **palla alta / cross** | **tieni B** oltre 0,50 s (tetto 0,90) | vel. 560→640, `vz` 150→210; se sei in metà campo offensiva e la mira è trasversale, l'atterraggio cade in area | SPAZIO |
| 7 | **chiamata in profondità** | **automatica mentre tieni B**: il compagno più avanzato nel cono **parte** | dopo 0,20 s di tenuta; corsa nello spazio per 1,8 s o fino al passaggio | **MOVIMENTO** |
| 8 | **passa-e-vai** | levetta **oltre 66** al rilascio di B | il passatore scatta; `G.swLock` a 0,75 s impedisce a `switchControlled` (`:9973`) di togliertelo | MOVIMENTO |
| 9 | **tiro col timing** | **tieni A**, rilascia sull'arco d'ambra | `SHOT_MIN 0,50` – `SHOT_MAX 0,80`, ±45 ms di tecnica, `HARDCAP 1,25` | — |
| 10 | **tiro di precisione** | banda **passo** (12–46) al rilascio di A | velocità ×0,82, errore angolare del «tardi» dimezzato, mira fine sul palo puntato | SUPERARE L'UOMO |
| 11 | **pallonetto** | banda **scatto** (> 66) al rilascio di A | invariato (`:9241`) | — |
| 12 | **finta di tiro** | **premi B mentre A è carico** | `chiudiAnticipo(p)` (`:9450`, già scritto e già chiamato); niente passaggio, niente tiro, 0,25 s di ricarica | SUPERARE L'UOMO |
| 13 | **effetto dopo il calcio (aftertouch)** | **ruoti la levetta entro 0,45 s** dal tiro o dalla palla alta | `b.curve += rotazione(rad/s) × 2,6 × 120`, tetto ±220; si spegne al primo rimbalzo o contatto | — |

### 3.2 La tua squadra ha la palla, tu no → **[ ] [CAMBIO]**

Stato transitorio (l'isteresi di `switchControlled` dura 0,2 s), ma oggi è un buco documentato: *«con il pallone il pulsante CAMBIO non c'è: su telefono, in possesso, non si cambia uomo»*. Qui c'è.

| # | azione | ingresso | note |
|---|---|---|---|
| 14 | **cambio direzionale** | **tocca B** | vedi #16 |
| — | disco A | **spento**, ghiera scura, nessuna etichetta | l'unico stato in cui un disco non fa niente, ed è disegnato per dirlo |

### 3.3 Senza palla → **[CONTRASTA] [CAMBIO]**

| # | azione | ingresso esatto | parametri | pilastro |
|---|---|---|---|---|
| 15 | **contrasto in piedi** | **tocca A**, < 0,15 s | 0,18 s di passo aggressivo verso il pallone; `stealP` ×1,8 se arrivi di fronte, ×0,6 da dietro; se fallisci, 0,22 s di `kickCd` — **non vai a terra** | difesa |
| 16 | **cambio direzionale** | **tocca B** | prende il compagno nel settore **±60°** della levetta più vicino al pallone; levetta ferma → il più vicino al pallone. **Elimina il ciclo orario** di `cambiaGiocatore` (`:9956`) | — |
| 17 | **contenimento (jockey)** | **tieni A** | velocità ×0,62, il corpo si tiene sulla bisettrice palla-porta, faccia inchiodata al portatore, furto di contatto ×1,3. È `p.contieni` (`:11726-11742`), che oggi esiste **solo per la CPU** e **solo dove `standoff>0` — cioè mai a Duro** | difesa |
| 18 | **scivolata** | **rilascia A** con la levetta **spinta oltre 46 nei 0,30 s precedenti**, verso un avversario entro 140 unità nel cono ±40° | `startSlide(p, nx, ny)` con `nx,ny` = **direzione della levetta**, non del flick. Questo è anche il posto in cui il bersaglio `best` calcolato e buttato via a `:8921-8933` finalmente entra da qualche parte | SUPERARE L'UOMO (di là) |
| 19 | **raddoppio comandato** | **tieni B** | il secondo uomo più vicino al portatore parte in pressing, tu tieni la posizione; il ruolo `raddoppio` esiste già in `teamBrain` (`:11758-11770`, 4 Hz) | difesa |

**Perché la scivolata è il rilascio del contenimento e non un flick.** Tre ragioni, in ordine di peso: (a) legge la **posizione** della levetta a `touchend`, quindi è **immune alla fusione dei `touchmove`**, che è il difetto che questo gioco ha già pagato; (b) il gesto reale — contieni, poi affondi — è la sequenza che il calcio insegna, quindi il comando *è* la tattica; (c) i due pollici lavorano **in parallelo** (il sinistro spinge mentre il destro tiene), quindi non costa i 421 ms del flick in serie. La «freschezza» di 0,30 s è il discriminante che impedisce alla scivolata di partire quando smetti semplicemente di contenere con la levetta già a fondo.

### 3.4 Quello che il pollice non fa, e che rende profondo il resto

Lo schema di comandi non è il progetto. Questi tre cambi di simulazione sono ciò che dà **un motivo** ai comandi qui sopra, e nessuno dei tre aggiunge un ingresso:

**(a) Il prezzo dello scatto diventa visibile — `CARRY_DIST` non è più una costante.**
```
v ≤ 60          → carry = 10
60 < v ≤ 168    → carry = 10 + 6·(v−60)/108      (16 a corsa piena)
v > 168         → carry = 16 + 10·(v−168)/57     (26 a scatto pieno)
```
e la probabilità di furto per contatto (`:10658-10678`) scala con l'esposizione: `stealP × (1 + 0,65·(carry−10)/16)`.

Il conto che ne esce, con il moltiplicatore ×0,55 di spalle che **esiste già** a `:10670`:

| situazione | palla dal piede | probabilità di furto |
|---|---|---|
| cammini, corpo fra palla e avversario | 10 unità (0,35 m) | 0,42 × 1,00 × 0,55 = **0,23** |
| corri | 16 | 0,42 × 1,24 = 0,52 |
| scatti | 26 (0,90 m) | 0,42 × 1,65 = **0,69** |

**Tre volte**, e la differenza è una **distanza orizzontale** — la sola grandezza che una camera a 42° rende meglio di una camera dietro. Con questa riga arrivano insieme lo scudo, il knock-on, lo sprint controllato e l'agile dribbling: **quattro verbi di FC 25 senza un pulsante**. Oggi la palla sta a **12,48 unità per dieci fotogrammi di fila, massimo 12,48 su 120 campioni** (misura del dossier di fisica): una barra rigida, e il duello uno contro uno ha un solo stato.

**(b) Il primo tocco può sporcarsi** (`:10823-10834`). Oggi la presa è un cancello binario, e il destinatario dichiarato ferma **una cannonata a 700 u/s senza errore**. Con un errore in funzione di velocità in arrivo, angolo e `p.tecnica`, il passaggio lungo #6 diventa una scelta invece che un pulsante: è ciò che dà un senso alla colonna SICUREZZA e un bersaglio al pressing. Circa 30 righe, zero millisecondi, **rischio alto sull'equilibrio**: cambia la simulazione al bit e i banchi a seme fisso vanno ri-fondati.

**(c) L'attrito dell'erba non si paga in volo** (`:10689-10690`). Misurato: la palla lanciata a `vz=260` decelera **identica al decimale** a quella a terra, e ogni cross cade **fra il 24% e il 31% corto** del proprio bersaglio dichiarato. **Il mio schema ha una dipendenza dura da questa riga**: il cono di mira del §4 è una *promessa*, e la misura 2 del §7 la verifica. Finché `b.vx*=fr` non è racchiuso in `if(b.z<=0)`, la promessa è falsa sulle palle alte e la misura 2 **fallisce**, come deve.

### 3.5 Tastiera

Restano quattro tasti per giocatore più WASD e Shift, con la stessa legge: `C` tocca/tieni = passaggio a bande; `X` tieni/rilascia = tiro; `Z` tocca = contrasto, `Z` tieni = contenimento, rilascio con WASD a fondo = scivolata; `Q` = cambio direzionale (WASD è il puntatore). Il tasto `thr` (`E` / `,`) **resta libero e non si assegna**: il filtrante e il cross ora sono la stessa tenuta di `C`.

---

## 4. COME SI SCOPRE, E COME SI RICORDA

### 4.1 Il gioco disegna la promessa mentre il dito è giù

Questa è la sostanza della scopribilità, e non costa un pixel nella fascia bassa contesa.

- **Il cono di mira.** Nell'istante in cui premi B (con palla), sull'erba davanti ai piedi compare un settore di **±40°**, alpha 0,18 con il filo luminoso, **lungo quanto la tenuta corrente raggiunge** — cresce da 170 a 600 unità mentre tieni. Il compagno candidato prende un galloncino. **Vedi dove andrà la palla prima di lasciare.** È la manipolazione diretta, il meccanismo con il costo di apprendimento più basso dell'intero catalogo, ottenuta senza toccare il mondo con il dito.
- **L'anello a bande.** Sul portatore, raggio `P_R+8` = 21 unità (dove già vive l'anello di oggi, `:24479`). Il passaggio riempie un giro da 0,90 s, con quattro archi marcati: **appoggio** 0°–60°, **passaggio** 60°–140°, **filtrante** 140°–200° (ambra), **alta** 200°–360° (ambra scura). Il nome della banda si scrive nel disco per 0,3 s quando la lancetta la attraversa. Il tiro usa **lo stesso anello, la stessa grafica**: un giro da 1,25 s con l'arco d'ambra da **144° a 230,4°** (cioè 0,50–0,80 s) e la lancetta che ci entra dentro.
- **Il compagno che parte.** Mentre tieni B, il chiamato prende una traccia punteggiata verso lo spazio. **Non c'è niente da spiegare: lo vedi correre mentre il tuo pollice è ancora giù.**
- **La palla che si stacca dal piede.** Lo scatto insegna il suo prezzo da solo (§3.4a).

**Budget di quadro, dichiarato come chiede la regola 5.** Al massimo, in un fotogramma qualsiasi: **un** anello + **un** cono + **un** galloncino, e mai due anelli insieme (l'ultimo disco premuto annulla l'altro, §5). Tutti e tre vivono **sul portatore e sull'erba davanti a lui**, cioè dentro il quadro dell'azione. **Zero nuovi elementi nella fascia dei 64 px in basso**, che il file documenta come già contesa fra bussola, tutorial e dischi (`:8760`, `:25345`). Questo era il costo vero segnalato dal dossier dei comandi, ed è il vincolo che ho rispettato per primo.

### 4.2 L'onboarding: sei carte, nessun timer, trenta secondi

Sostituisce `Tut.steps` (`:29120-29125`, quattro passi che si spengono al primo gol o dopo 10 s — un tutorial a timer insegna a chi è già veloce).

| carta | testo (max 6 parole) | si chiude quando | cosa fissa |
|---|---|---|---|
| 1 | «Appoggia il pollice e muoviti» | hai percorso 120 unità | **e decide la mano** (§5.6) |
| 2 | «Tocca **PASSA**» — il disco respira | primo passaggio completato | il tap |
| 3 | «Tieni **PASSA**. Guarda chi parte.» | una chiamata partita **e** il passaggio rilasciato | la tenuta + il pilastro MOVIMENTO |
| 4 | «Tieni **TIRA**. Lascia sull'ambra.» | primo tiro con `q==1`, o dopo 3 tentativi | il timing |
| 5 | *(alla prima perdita di palla)* «Tocca **CONTRASTA**» | primo contrasto in piedi | il tap difensivo |
| 6 | «Tienilo: **contieni**.» | 1,0 s di contenimento cumulato | la tenuta difensiva |

Le carte **non bloccano niente** e sfumano al 40% dopo 6 s, ma non spariscono finché non le fai. Le due difensive aspettano il momento in cui servono. Con quattro carte hai in mano l'intero gioco d'attacco; le altre due arrivano da sole.

### 4.3 Come si ricorda

Non c'è niente da ricordare, ed è il punto. Nacenta misura che gli errori dei set di gesti sono **errori di associazione**: ricordo il gesto, non a cosa serve. FC Mobile chiede sette associazioni arbitrarie su due pulsanti (Tira+giù = finesse, Passa+su = lob…). Qui l'associazione è **una sola e monotona**: *più tieni, più lontano e più rischioso; più spingi la levetta, più ti impegni*. Un giocatore che ha dimenticato tutto può ricostruire ogni comando dalla frase, perché non ci sono eccezioni: **non esiste un solo gesto in cui tenere di più produca qualcosa di più corto o più sicuro.**

---

## 5. LA REGOLA DI PRECEDENZA

In ordine di valutazione, applicata a ogni `touchstart`:

**P1 — Dischi prima di tutto.** Dentro la presa di A (r 50) → A. Altrimenti dentro la presa di B (r 44) → B. Le due prese **non si sovrappongono** (7,6 px di franco, §2.1), quindi un dito non può mai essere ambiguo fra i due dischi: non serve una regola di parità, serve la geometria che ho verificato.

**P2 — La corona morta non paralizza.** Fra 50 e 58 (A) o 44 e 52 (B) il tocco **non fa niente** — è la sicura che esiste già a `:8836` e impedisce a un dito che manca il pulsante di diventare una levetta e poi un gesto involontario. **Novità:** se quel dito poi viaggia **oltre 70 px**, viene **promosso a levetta** con origine nel punto corrente. Oggi un tocco lì è morto fino al rilascio, e un pollice storto perde il movimento per mezzo secondo.

**P3 — Un disco, un dito.** Un secondo `touchstart` su un disco già posseduto è ignorato. Due `touchstart` sullo stesso disco entro **120 ms** contano come uno: un dito che rimbalza non ri-arma una carica. **Nello schema non esiste nessun doppio tocco**, quindi questa deduplica non toglie niente a nessuno.

**P4 — L'atto si congela al `touchstart`, l'etichetta pure.** Già vero per l'atto (`:8817`). Nuovo per l'etichetta: mentre un dito è giù, il disco non cambia scritta. Un comando che cambia nome sotto il polpastrello è un comando che ha mentito.

**P5 — L'ultimo premuto annulla il precedente, e non produce la sua azione.**
- B mentre A è carico → **finta di tiro**: la carica muore (`chiudiAnticipo`), **e non parte nessun passaggio**.
- A mentre B è in tenuta → la barra del passaggio muore, **non parte nessun passaggio**, e comincia la carica del tiro.
Una regola, simmetrica, che copre entrambe le collisioni fra i due dischi e produce nello stesso colpo l'unica finta che a 91 px si vede (la preparazione è di **corpo intero**: `anticipa` mette il rig in `chargeClip='tiro'` per tutta la carica, `:9441-9448`).

**P6 — Il possesso perso durante la carica non produce un calcio.** Se `releaseCharge` trova un giocatore che non ha più la palla, **non succede niente** e la posa si chiude. Oggi il rilascio parte comunque.

**P7 — Fuga = annullo.** Un dito che porta il disco oltre **90 px** dal centro annulla l'atto (nessun tiro, nessun passaggio) e la ghiera diventa grigia mentre è in zona di annullo. Sotto i 90 px il disco resta **appiccicoso** (comportamento già corretto in `btnTouch`), così un rotolamento normale del pollice non perde il comando. È la convenzione «trascina fuori per annullare» che ogni utente di telefono conosce senza che gliela si dica.

**P8 — `touchcancel` ≠ `touchend`.** Oggi entrambi finiscono in `Touch5.end` (`:8961-8970`) e **`touchcancel` fa partire il tiro**. Nuovo: `touchcancel` **annulla** sempre, `touchend` esegue. Una notifica di sistema, una chiamata, il gesto di sistema del bordo: nessuno di questi deve calciare il pallone.

**P9 — Levetta e dischi non si contendono mai niente.** Mani diverse. In 2 giocatori resta la partizione di `teamOf` per metà schermo (`:8812`) e i dischi della squadra 1 sono già specchiati a sinistra.

**P10 — Aftertouch e movimento convivono.** La levetta non smette mai di guidare l'uomo. L'aftertouch legge **solo la componente perpendicolare della *variazione*** della levetta, e solo per 0,45 s, e solo su palla alta o tiro. Levetta ferma → nessuna curva, e continui a correre dritto. È un costo onesto: **per curvare la palla smetti di correre dritto tu**.

---

## 6. I CASI LIMITE, UNO PER UNO

**Il dito che scivola.** Tre difese, in ordine: la presa a r+10 (già), l'appiccicosità fino a 90 px (P7), l'annullo oltre (P7). E per la levetta, l'inseguimento dell'origine a 70 px che c'è già (`:8858-8860`): il dito non può uscire dalla ghiera, la ghiera lo segue. Questo era il difetto n.1 delle levette virtuali nel catalogo («joystick bloccato» nei forum EA).

**Il tocco doppio accidentale.** Non esiste un doppio tocco da confondere: lo schema non ne usa. La deduplica a 120 ms (P3) copre il rimbalzo del polpastrello. **Non pagando la finestra di rilevamento del doppio tocco, il tocco singolo non ha nessun ritardo**: 133 ms e via.

**Il browser che fonde i `touchmove`.** Nessun ingresso legge la velocità del dito, quindi **la fusione non può più produrre un atto sbagliato**. L'unica cosa che degrada è la fluidità della levetta, e degrada bene: `humanMove` legge la **posizione** (`:8650-8655`), non la storia, e l'ultimo evento consegnato porta la posizione giusta. La sicura a `:8882-8896` e l'array `s.hist` si cancellano insieme al flick (**14 oggetti per dito per fotogramma in meno**). Nel vecchio schema il fallimento era maligno: *il tiro più netto letto come un passaggio*. Nel nuovo non c'è.

**Mani grandi.** Le corone morte, il franco di 7,6 px fra le prese, i 27,6 px di erba fra i bordi disegnati, e l'annullo a 90 px. In più — perché FC Mobile ha dovuto spedirla come toppa, e conviene avercela prima — **Impostazioni → Dimensione comandi: ×0,85 / ×1,00 / ×1,20**, che scala insieme raggi e scarti dal bordo (non solo i raggi: scalare i raggi da soli fa toccare i dischi).

**Schermo piccolo.** Un solo fattore, un solo ramo:
```
kUI = clamp( min(VW/915, VH/412), 0.82, 1.20 ) * SAVE.dimComandi
rA = max(34, 40·kUI)          A = (VW − 64·kUI, VH − 60·kUI)
rB = max(29, 34·kUI)          B = (VW − 164·kUI, VH − 78·kUI)
se dist(A,B) < rA+rB+24  →  colonna verticale: B = (A.x − 6, A.y − 96)
```
Verifica a **640×360**: `kUI` = min(0,699; 0,874) → 0,82. `rA`=34, `rB`=29, A=(587,5 · 310,8), B=(505,5 · 296,0), distanza **83,3 < 87** → scatta la colonna: B=(581,5 · 214,8), distanza **96,2 ≥ 87** ✔. A 915×412 la distanza è 101,6 ≥ 98 ✔, e i dischi restano affiancati. Il ramo è deterministico e si verifica a tavolino su qualunque viewport.

**Mancino.** `bx = mancino ? 0 : VW; s = mancino ? +1 : −1` — è **esattamente la specularità che `touchBtnLayout` ha già** per la squadra 1 in 2 giocatori (`:8774-8776`): quattro righe, zero codice nuovo. La casa della levetta va a (VW−96, VH−140), la bussola a x = VW−12−mw.
**E si sceglie senza menù**: la carta 1 dell'onboarding dice «appoggia il pollice e muoviti», e **la metà dello schermo in cui nasce quella levetta decide il verso**, applicato alla fine di quel possesso (mai a metà azione). Revisabile in Impostazioni. Una preferenza che si dichiara facendo la cosa, non leggendola.

**Una mano sola** — e non è un caso limite, è la maggioranza: Hoober, 1.333 osservazioni sul campo, **49% una mano sola**, e i «due pollici in orizzontale» sono circa l'1,5% delle osservazioni. Conseguenza progettuale: **lo stato a zero dita è neutro.** Oggi il rilascio semplice della levetta con la palla **è un passaggio** (`:8947-8948`): alzi il pollice per una notifica e perdi il pallone. Nel mio schema alzare tutte le dita non produce **niente**; il giocatore continua per inerzia e la squadra si muove da sola. Corollario gradito: **con il solo pollice destro il gioco resta giocabile** — tap-passaggio, tenuta-tiro, tap-contrasto, tenuta-contenimento funzionano tutti senza levetta (la mira cade sull'assistenza). Tetto più basso, gioco non rotto.

**Interruzione di sistema.** `visibilitychange` → tutte le dita cancellate → P8: nessun calcio, nessun passaggio, la carica si chiude.

---

## 7. COSA QUESTO SCHEMA NON PUÒ FARE — e cosa gli tolgo

### 7.1 Le nove cose che tolgo, e perché

| # | tolgo | perché |
|---|---|---|
| 1 | **rilascio della levetta = passaggio** (`:8947`) | punisce l'unica cosa che il Vincolo 2 dice essere la norma: alzare il dito. È la sola funzione di FIFA Mobile che l'analisi indipendente chiama *«Brilliant!»*, e qui è invertita |
| 2 | **flick verso porta = tiro** (`:8904-8920`) | duplicato del disco A, e **con una legge diversa**: 55% di finestra contro 24%. Due economie dello stesso gesto, non dichiarate da nessuna parte. Una sola sopravvive |
| 3 | **flick trasversale = cross** (`:8940`) | diventa la tenuta lunga di B, con una **mira vera** al posto del secondo palo fisso |
| 4 | **flick generico col pallone = passaggio forte** (`:8945`) | è la banda 0,15–0,35 di B |
| 5 | **flick senza palla = scivolata** (`:8921-8933`) | diventa il rilascio del contenimento: immune alla fusione dei `touchmove`, e finalmente **usa** il bersaglio che quelle dieci righe calcolano e buttano via |
| 6 | **`PULSE_T`, `FLICK_WIN0`, `FLICK_WIN1`** e l'anello ancorato al possesso (`:3092`, `:3100`, `:24479`) | senza il flick-tiro non hanno più un cliente. Un anello, una legge |
| 7 | **il ciclo orario di `cambiaGiocatore`** (`:9956-9970`) | ciclare è il modo lento di fare una cosa che il pollice fa in un colpo: è un surrogato del non-vedere, e dall'alto si vede |
| 8 | **il bersaglio fisso del cross** (`goalX∓55`, `:9187-9199`) | un cross che non puoi mirare non è una decisione |
| 9 | **`s.hist` e la sicura dei `touchmove` fusi** | non hanno più niente da proteggere |

Bilancio: **da nove esiti di gesto a cinque gesti**, e la classe di difetti più fastidiosa del touch su HTML esce dalla porta.

### 7.2 Cosa lo schema non sa fare, detto in chiaro

- **Non può esprimere due azioni offensive nello stesso istante.** Il pollice destro è uno. Non esiste passa-e-tira, non esiste una finta *mentre* passi. Chi vuole quello vuole un gamepad.
- **La mira è un cono di ±40°, non un cursore.** Con dieci compagni in mischia a 11 contro 11 il cono contiene più di un candidato e il punteggio decide al posto tuo. **Non l'ho misurato**: la misura 2 del §7.3 include un cancello apposta per farlo emergere.
- **Non esiste il precision pass vero** («passa a *quello*»). Il cono più il punteggio ci arrivano vicino e non ci arrivano.
- **Zero skill move**, e non arriveranno: manca il secondo stick, e il segnale che *nomina* una skill move è un moto d'arto di ~15 px di periferica contro i 425 di un passaggio. **28 a 1**, e i provini ciechi di questo progetto dicono che perfino il corpo intero è nominabile 0-2 volte su 10.
- **Nessun comando del portiere in gioco.** L'uscita comandata è buona geometria e non ha un canale libero che non costi più di quanto renda.
- **Nessuna tattica di squadra.** Nessun modulo, nessuna mentalità. Dieci uomini che cambiano insieme senza che il giocatore sappia quale suo gesto l'ha causato è la modifica meno leggibile che esista: va in un menù di preparazione, non sotto il pollice.
- **La minimappa resta non toccabile, ed è una scelta contro un consiglio esplicito del dossier.** Motivo: la carta 1 del brief chiede comandi **raggiungibili senza guardare**, e una bussola di 88×43 px è per definizione una copia rimpicciolita del campo, sotto un pollice che ne copre ~150. Il cambio direzionale (#16) fa lo stesso lavoro **alla cieca** e con un bersaglio da 88 px invece che da 6. Se un giorno si volesse comunque, la regola di sicurezza è già scritta: **se due candidati stanno entro 60 unità di mondo, il tocco si rifiuta** — un cambio sbagliato in difesa è peggio di nessun cambio.
- **Un difetto residuo che accetto e dichiaro:** la bussola vive dove il pollice sinistro lavora, e `toccaPollice` (`:24985`) sa solo farla scendere all'ancoraggio basso, che a quel punto è occupato pure lui. Toppa concreta: se una levetta viva copre la bussola anche in basso, **scivola a destra lungo il fondo fino a x = 132**, in 0,12 s con la stessa legge esponenziale già scritta. Due confronti di rettangoli per fotogramma.
- **Non regge una finestra di timing sotto ~150 ms.** La latenza tocco→fotone misurata da GameBench su telefoni di fascia alta è **86-88 ms**, e la WebView del vostro APK ci aggiunge qualcosa che **non è misurato**. Niente «perfect» da rhythm game, mai.
- **Non compro** corner, rimesse, fuorigioco, colpo di testa, tattica sul dpad, muro sulla punizione, dissolvenza fra clip di posa. La gabbia è identità, non limite; il gioco aereo vive sull'asse Z, che è il solo asse che una camera a 42° comprime; la dissolvenza è l'unica voce dei dossier che costi **davvero millisecondi** e rende meno di tutte.

**Una nota sulla finestra del tiro.** 300 ms contro 86-88 ms di latenza sono **3,4×**, sotto il 4-5× che il dossier di ricerca indica come zona sicura. Il mio argomento per tenerli: con la lancetta visibile e l'arco d'ambra disegnato, il rilascio è **anticipato, non reagito** — e un gesto anticipato paga la latenza come *bias costante*, che il giocatore impara via in tre partite, non come *ritardo*, che non impara mai. È un argomento, non una misura. **Il piano B è scritto e ha un numero**: se il cancello 3b del §7.3 fallisce, `SHOT_MIN/SHOT_MAX` passano da 0,50/0,80 a **0,46/0,86** (400 ms, 4,6×) e `strumenti/giocata.js` va ri-fondato, perché quei due numeri sono il suo metro.

---

## 8. COME SI MISURA CHE FUNZIONA

Tre misure. Ognuna ha un **valore «prima» noto e rosso**: non sono attestazioni, sono cancelli che oggi il gioco non passa. E ognuna porta il suo **contro-cancello**, perché la regola di casa dice che un cancello viene superato per la via più corta.

### Misura 1 — Il costo del dito alzato

**Robot.** 200 possessi umani simulati con `window.__test.simulate()` a seme fisso. In ognuno, a un istante casuale del possesso, **tutte le dita si alzano per 700 ms** (la notifica, il semaforo, la fermata). Gruppo di controllo appaiato: le dita **restano giù e ferme** per gli stessi 700 ms nello stesso istante dello stesso seme.
**Misura.** Frazione di possessi persi entro 1,5 s dall'evento, nei due gruppi. E, come sotto-misura, lo spostamento del giocatore comandato nei 700 ms.

| cancello | soglia |
|---|---|
| 1a | (perdite con dito alzato) − (perdite con dito giù) ≤ **4 punti percentuali** |
| 1b | spostamento medio nei 700 ms ≥ **30 unità** nella direzione che aveva |

**Perché può fallire davvero.** Oggi il rilascio della levetta **è un passaggio** (`:8947`): il gruppo «dito alzato» perde il pallone quasi ogni volta e 1a è rosso di partenza, con margine enorme.
**Contro-cancello.** Si potrebbe vincere 1a rendendo l'IA incapace di perdere palla — ma il cancello è una **differenza fra due gruppi appaiati**, quindi migliorare tutti non sposta niente. Si potrebbe vincere congelando il giocatore quando le dita si alzano — e infatti 1b esiste apposta, e chiede il contrario.

### Misura 2 — Il cono dice la verità

**Robot.** 500 passaggi presi in **partita vera** (non stati costruiti a mano: il dossier di inventario avverte, giustamente, che manipolare lo stato dimostra che il ramo si accende, non che la condizione capiti), con la levetta pilotata a direzioni campionate su tutto il giro e tenute campionate su tutte e quattro le bande. Per ognuno si registra: direzione della levetta al rilascio, direzione della palla al primo fotogramma dopo il calcio, punto di atterraggio effettivo, ricevente designato, ampiezza del cono disegnato in quel fotogramma.

| cancello | soglia |
|---|---|
| 2a | errore angolare **mediano** ≤ **8°** |
| 2b | errore angolare al **95° percentile** ≤ **22°** |
| 2c | ricevente designato **dentro il cono disegnato** in ≥ **97%** dei casi |
| 2d | **ampiezza del cono disegnato ≤ 50°** (contro-cancello) |
| 2e | frazione di passaggi che raggiungono un compagno ≥ (valore di oggi − 5 punti) (contro-cancello) |
| 2f | sulle sole **palle alte**: distanza percorsa / distanza puntata ∈ **[0,92 ; 1,08]** |

**Perché può fallire davvero.** `eseguiPassUmano` (`:9090`) **non chiama mai `humanMove`**: oggi 2a starebbe attorno ai 90°. E 2f **fallisce oggi in modo misurato**: la resa dei cross sta fra **0,688 e 0,756**, cioè il 24-31% corto, perché l'attrito dell'erba si paga anche in volo. La misura 2 è il posto in cui la dipendenza dalla fisica del §3.4c presenta il conto, ed è giusto che lo presenti qui e non in un commento.
**Contro-cancello.** 2a-2c si comprano **allargando** il cono disegnato fino a coprire mezzo campo: 2d lo vieta. Si comprano **stringendo** l'assistenza fino a rendere il passaggio letterale e inutile: 2e lo vieta. Il punto di lavoro è stretto in entrambe le direzioni, e nessuno dei cinque numeri si può soddisfare senza gli altri quattro.

### Misura 3 — Il pollice non prende il disco sbagliato

**Robot.** 3.000 tocchi sintetici per configurazione, distribuiti in gaussiana attorno al centro di ciascun disco con **σ = 12 px CSS** — *σ è un parametro dichiarato, non una misura mia: nessuno in questo progetto ha misurato la dispersione del pollice su un telefono vero.* Sei configurazioni: viewport 915×412, 740×360, 640×360, ciascuna destrorsa e mancina. La geometria si legge da `__test.comandiTouch` (`:30155`), **mai da coordinate scritte a mano** — è la trappola numero quattro di questa casa, e `strumenti/giocata.js` ci è già caduto una volta premendo `(vw−66, vh−140)`.

| cancello | soglia |
|---|---|
| 3a | atto voluto ≥ **92%** |
| 3b | **atto sbagliato (l'altro disco) = 0%**, su tutte e sei le configurazioni |
| 3c | nessun atto (corona morta) ≤ **8%** |
| 3d | levetta nata sotto l'ombra di un disco = **0%** |
| 3e | *(sottoprova del timing)* 400 rilasci con ritardo casuale uniforme 60-120 ms iniettato fra l'intenzione e il `touchend`: quota di `q==1` ≥ **55%** con `tecnica=70` |

**Perché può fallire davvero.** 3b è duro e a zero tolleranza: basta che una sola delle sei geometrie porti le due prese a sfiorarsi e la misura è rossa. Il ramo della colonna verticale a 640×360 esiste **perché** questa misura lo avrebbe scoperto — e l'aritmetica del §6 dice che senza quel ramo le prese si sovrappongono di 3,7 px.
**Contro-cancello.** 3b non si compra **allargando** i dischi (allargarli li fa toccare, e 3b sale sopra zero) né **restringendoli** (3a scende sotto 92 e 3c sale sopra 8). E la vittoria su una sola geometria non vale: le sei configurazioni girano insieme e il verde è congiunto. 3e è il cancello che decide se la finestra di 300 ms regge la latenza vera, ed è quello che fa scattare il piano B del §7.2.

**Una quarta misura, che non è dello schema di comandi ma della cosa che lo rende profondo.** Distanza palla-piede e probabilità di furto misurate a passo, a corsa e a scatto su 30 s di partita: cancello **d(scatto)/d(passo) ≥ 2,2** e **furto(scatto)/furto(passo, di spalle) ≥ 2,5**. Oggi il primo rapporto è **1,00 misurato** (12,48 unità costanti su 120 campioni) e il secondo è 1,82. Se questa misura resta rossa, tutto il §3.4a non è stato fatto — e senza il §3.4a lo schema qui sopra è una tastiera più pulita, non un gioco più profondo. **È la misura che protegge me dalla regola di casa numero due.**

---

## 9. COSA NON HO VERIFICATO

1. **Non ho eseguito il gioco in questa sessione.** Ho letto il file alle righe citate (input `:8640-8990`, costanti `:3065-3100`, layout `:8773-8805`, disegno `:25934-26060`, bussola `:24888-25005`, pausa `:863-880`). Ogni numero *misurato* che cito viene dai tre dossier degli specialisti e **non l'ho rifatto**.
2. **Nessuna misura su un telefono.** La latenza 86-88 ms è GameBench su altri giochi; la latenza dentro la vostra WebView **non è misurata da nessuno**.
3. **σ = 12 px del pollice è un parametro dichiarato**, non una misura. Se qualcuno lo misura e viene 18, i cancelli 3a/3c vanno rifatti prima di essere usati.
4. **Le soglie 0,15 / 0,35 / 0,50 / 0,90 s del passaggio sono scelte, non derivate.** Vanno tarate con la misura 2, e mi aspetto che almeno una si sposti.
5. **Non ho misurato l'occupazione dell'interfaccia**, che il dossier dei comandi indica come il costo vero. Il budget del §4.1 (un anello, un cono, un galloncino, zero nella fascia bassa) è un vincolo che mi sono imposto, non un numero verificato.
6. **Non ho misurato il costo per fotogramma di niente.** Il cono è un `arc` più due `lineTo`, l'anello quattro archi, il galloncino tre linee, per **un solo** giocatore; il conto operativo dice «sotto il rumore» contro 22 rig. Chi lo usa come numero commette il ventitreesimo caso: l'unico confronto onesto è `node strumenti/prestazione.js --contro HEAD`.
7. **Non ho verificato lo schema a 7 e a 11.** In particolare il cono di ±40° (#3) e il settore di ±60° del cambio (#16): con nove compagni la selezione è un problema che a 5 contro 5 non esiste, e la misura 2 va girata su tutte e tre le taglie prima di dichiarare qualsiasi cosa.
8. **Non ho verificato lo schema in 2 giocatori** oltre a constatare che la specularità di `touchBtnLayout` esiste già. Il caso a rischio è il contenimento simultaneo delle due squadre sullo stesso `G.swLock`.