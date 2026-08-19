**VOTO: 6,5 / 10**

(Ancore: 5 = giocabile ma frustrante, 8 = pari al migliore in commercio. Il documento ragiona meglio di quasi tutti gli schemi in commercio, ma il suo meccanismo nuovo e centrale — la rosa delle direzioni — è misurato nel sistema di riferimento sbagliato, e i comandi stanno dentro due zone che il sistema operativo si è già preso. Con quelle due cose sistemate starebbe a 7,5 sulla carta; sopra non si può salire senza un pollice vero sul vetro, e il documento lo ammette.)

---

## LE TRE COSE MIGLIORI

**1. Il cuneo, non il disco — e la Legge 2 che ne discende.**
Modellare l'ombra del dito come polpastrello **più fusto fino al perno** è la cosa più corretta del documento, ed è il motivo per cui trova quello che nessuno trova: la bussola coperta al **100 %**, non «un po' sovrapposta». Chi modella il dito come un cerchio quel risultato non lo può nemmeno vedere. Da lì scende il corollario giusto (§1.3): un comando vicino al perno ha leva corta, quindi ombra corta — che è la vera ragione geometrica per cui i comandi vanno nell'angolo, e assolve i due dischi di oggi con un conto invece che con un'opinione. E la Legge 2 («la risposta si legge sul pallone, mai sotto il dito», e ciò che non ci sta diventa aptico) è la sola regola di ritorno visivo che sopravvive a un pollice opaco.

**2. Il modello di sicurezza: rilascio inerte, `touchcancel` = annulla, zero dita non punito.**
Vale più di tutti i 26 verbi messi insieme. `touchcancel` → `Touch5.end` → `release` → `doPass` è **verificato nel sorgente** (:8968-8970 chiama `Touch5.end` esattamente come `touchend` a :8966): oggi il telefono che ti manda una notifica ti fa battere un passaggio. Su un autobus questo succede più volte a partita. Renderlo innocuo, e rendere il sollevamento del pollice uno stato neutro, è la premessa senza la quale nessuno schema mobile regge.

**3. I quattro cancelli, e in particolare le vie corte chiuse.**
Il cancello 1 che accoppia corrispondenza *ed entropia* delle etichette (non puoi degenerare in `AZIONE`, non puoi mentire); il cancello 2 che tiene la geometria del pollice **dentro lo strumento** e non dentro l'HTML, così il gioco non può negoziarla; il cancello 3 che pretende la didascalia **dipinta e con contrasto ≥ 3:1**, non prevista dal codice. Questo è il modo giusto di rendere falsificabile una tesi di ergonomia. Onore particolare al fatto che il cancello 0 **comincia rosso** e lo si dichiara.

*Menzione:* il difetto M2 (mezzaluna di ~3×40 px dove la presa del PICCOLO muore nell'anello del GRANDE) è reale — l'ho verificato a :8823-8837, presa ed esclusione **sono** nello stesso ciclo col GRANDE per primo — ed è esattamente sul vettore d'approccio del pollice destro. Quattro righe di riparazione, con il varco di 4,76 px che resta pagato: impeccabile.

---

## LE TRE COSE CHE SI ROMPONO

### A. La rosa delle direzioni è allineata allo schermo. Il pollice non lo è.

Il documento giustifica i confini a 45° come «il confine più facile che una mano sappia sentire». È falso: una mano sente i **propri** assi, non quelli del vetro. Il pollice non trascina in linea, **ruota**: il movimento facile e riflesso è la tangente all'arco attorno al perno; il movimento radiale (estensione/flessione) è debole, impreciso e fa rotolare l'area di contatto.

Coi numeri del documento stesso (perno 925,455):

| disco | tangente (angolo schermo) | settore in cui cade |
|---|---|---|
| GRANDE (851,352), R 126,8 | **−35,7°** | AVANTI, a 9,3° dal confine |
| PICCOLO (757,340), R 203,6 | **−55,6°** | **FASCIA ALTA, a 10,6° dentro** |

E poiché la direzione si misura sulla **corda**, la corda ruota di `asin(L/2R)` col crescere del trascinamento. Sul PICCOLO: L = 60 px → −47,1° → **cross**; L = 96 px → −42,0° → **filtrante**. Crossover a **L ≈ 75 px**, cioè in mezzo alla corsa utile 22..96.

**Caso concreto:** area avversaria, compagno che taglia dentro. Il giocatore fa il gesto che il pollice fa da solo — una spazzata in avanti sul disco dei passaggi. Se la spazzata è corta ottiene un **cross**; se è lunga ottiene un **filtrante**. Stesso gesto percepito, verbo diverso, e la variabile che decide (quanto ho spinto) non è quella che l'interfaccia dichiara (dove ho puntato).

Peggio: la sensibilità del perno, che §1.1 ha misurato **solo** per la conclusione radiale (l'appartenenza alla banda, robusta) e mai per quella angolare, sposta la tangente del PICCOLO fra **−41° e −65°** su perni tutti plausibili. Il confine a −45° sta **dentro** l'incertezza del modello. Un bias sistematico si impara; un confine no.

E la sola accomodazione per le **mani grandi** aggrava il difetto: con `CMD_DX = −44` il PICCOLO va a (713,340), tangente **−61,5°**, e la corda entra in AVANTI solo oltre **137 px** — cioè oltre i 96 px dell'ANNULLA. **Con la taratura per mani grandi il filtrante non è raggiungibile con una spazzata naturale, mai.**

### B. Tutto il gruppo comandi vive dentro le zone che il sistema operativo si è già preso. Il documento non ne parla mai.

`touchBtnLayout` ancora i dischi a `VW`/`VH`: GRANDE a (VW−64, VH−60) r 40 → **presa a 14 px dal bordo destro e 10 px da quello basso; esclusione a 6 px e 2 px**. Su ogni schermo, perché è ancorato. Ora:

- `android/Gioco.java` non chiama **mai** `setSystemGestureExclusionRects`. L'inset di back gesture di Android è ~24 dp per lato verticale (regolabile dall'utente): il disco principale ci sta **dentro**.
- Il guscio commenta «il gioco usa già `env(safe-area-inset-*)` nel proprio CSS». **Nel gioco `safe-area` compare 0 volte**, mentre `viewport-fit=cover` c'è e `LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES` è attivo. In orizzontale i bordi corti sono **destro e sinistro**: la fotocamera può stare sopra il disco.
- `onBackPressed` chiama `__indietro()`: pausa/menu.

**Caso concreto:** scarico all'indietro. Il dito appoggia sul lato destro del GRANDE (x ≈ 895-901, legale) e trascina a sinistra: è **alla lettera** il gesto di back di Android. Il sistema si prende il tocco, arriva `touchcancel`, e la partita si mette in pausa. Oggi quel `touchcancel` regala un passaggio; con lo schema nuovo non regala niente — ma è la **stessa direzione, con la stessa mano, ogni volta**, quindi il giocatore non conclude «capita», conclude «lo scarico all'indietro non funziona». Il documento ha diagnosticato M3 trattando il `touchcancel` come meteorologia (notifica, chiamata) invece che come conseguenza prevedibile di aver messo il pulsante primario dentro la striscia di gesture. In undici sezioni di igiene metrologica, zero righe su gesture insets e cutout.

### C. Si classifica sul campione peggiore del tocco, e la deriva può solo armare, mai disarmare.

La direzione si legge **al rilascio**, cioè sul singolo campione più corrotto dello stream: il polpastrello rotola nell'istante del distacco, e rotola **verso il perno** — cioè verso basso-destra, cioè verso AVANTI/FASCIA BASSA. Bias sistematico, sommato al punto A.

`R_ARMA` a 200 ms di tenuta = 26,7 px ≈ **4,2 mm** (a 0,159 mm/dp; il documento usa 0,169 mm/px in §1.1 e 1/160 di pollice in §7 — 6 % di incoerenza su ogni banda). La deriva involontaria di un pollice appoggiato è 1-3 mm da fermo. **In piedi sull'autobus** è di più, ed è la sola condizione in cui il documento si è chiesto di funzionare.

**Caso concreto (autobus):** tieni il PICCOLO 300 ms per un passaggio pesato laterale. Una frenata ti fa rotolare il pollice di 5 mm verso il perno. La direzione **si arma** — non può disarmarsi — e l'appoggio sicuro diventa un filtrante in mezzo a tre avversari. La «legge dei pareggi» non copre questo: risolve i pareggi esatti, non la deriva, e il fallimento qui **non** è benigno perché va via dal verbo base, non verso.

E la riparazione ovvia è preclusa dal documento stesso: la Legge 3 ha ragione a buttare la **velocità** (i `touchmove` fusi rendono `dt` inaffidabile), ma ha buttato con essa **la forma del percorso**, che sopravvive benissimo — anche a 22 ms/fotogramma una tenuta di 300 ms lascia ~13 posizioni, abbastanza per un test di monotonicità o di rapporto lunghezza/spostamento, tutto in sole posizioni. Il documento cancella esplicitamente `s.hist` (:8842), cioè il buffer che serviva. E il cancello 3, via corta n.2 («l'esito deve essere identico rimuovendo tutti i `touchmove` intermedi»), **vieta per costruzione** la correzione giusta. Un cancello che blocca la riparazione del difetto che il cancello accanto non vede.

*Corollari brevi:* (i) 26 verbi è la dimensione del vocabolario, non quella usabile — sotto pressione se ne reggono ~10-12, e leggere una didascalia di due parole costa 250-400 ms di attenzione, quindi il marking menu è una rotella d'apprendimento, non un'affordance a velocità di partita; (ii) `PICCOLO + FASCIA` che vale cross in una metà campo e cambio gioco nell'altra è l'unico vero modo nascosto dello schema, e contraddice il «non hai memorizzato niente, hai puntato»; (iii) mira del tiro e aftertouch consumano **la stessa levetta nello stesso istante**: ogni tiro mirato prende curva a meno che tu non ricentri entro 200 ms, e lo scopri come «i miei tiri girano e non so perché»; (iv) una mano sola non è «difendi ma non attacchi», è **non ti muovi affatto** — e in piedi sull'autobus la mano libera è una.

---

## LA SINGOLA MODIFICA CHE ALZEREBBE DI PIÙ IL VOTO

**Ruotare la rosa nel sistema di riferimento del pollice, un angolo per disco, calcolato dal perno che il documento ha già:**

```
θ_disco = atan2(disco.y − PERNO.y, disco.x − PERNO.x) + 90°
settore = quadrante di (rilascio − appoggio) ruotato di −θ_disco
```

GRANDE θ ≈ 54°, PICCOLO θ ≈ 34° (mani medie), ricalcolati automaticamente per `CMD_DX` e per il mancino. Effetto: la spazzata tangenziale — il movimento riflesso, veloce, ripetibile e che non fa perdere la presa — cade al **centro** di un settore invece che a 2-10° da un confine, e ci si mette il verbo più usato (AVANTI/INDIETRO); i due movimenti radiali, deboli e rari, prendono le due fasce. Costa una costante per disco, zero superficie, zero pixel, e rende vera la frase su cui poggia tutto lo schema: *«dove tiro il dito è dove va»*.

Corredo da due righe, nello stesso intervento: **classificare la direzione sul campione di spostamento massimo** (o sull'ultima posizione ≥ 30 ms prima del distacco) invece che sul punto di rilascio — elimina il bias del rotolamento di distacco, resta solo-posizioni, e obbliga a riscrivere la via corta n.2 del cancello 3 in «identico a meno del campione di distacco», che è quello che voleva dire.

Nota di merito, non di voto: **sistemare i bordi (exclusion rects + `safe-area-inset` davvero letto) non alza il voto, evita di abbassarlo.** È una precondizione, non un miglioramento — ma finché non è fatta, il disco principale sta dentro il gesto di back del telefono e nessuna delle 30 voci della tabella §4 è affidabile.