# VOTO: 6 / 10

Sei per lo schema *come è pensato*. Come è *scritto*, con la collisione tocco/scivolata irrisolta e senza una riga per "tocca A col pallone", quello che arriva in mano è un 4. La distanza fra i due numeri è di tre righe di specifica, ed è il fatto più interessante del documento.

Riferimento: coerente più di FC Mobile sul canale d'ingresso, molto più povero di lui sull'espressione. Non si chiude dopo due partite. Non regge il quarto campionato.

---

## LE TRE COSE MIGLIORI

**1. Il determinismo, comprato a caro prezzo e pagato bene.** Tutto letto come *posizione* al `touchend`, atto congelato al `touchstart`, `touchcancel` ≠ `touchend`, dedup a 120 ms, e — decisivo — nessuna finestra di rilevamento del doppio tocco, quindi il tap non ha ritardo. Da competitivo preferisco cinque verbi che escono il 100% delle volte a nove che escono l'80%: il vocabolario lo imparo in una settimana, la sfiducia nel comando non se ne va più. E aver ucciso il flick-tiro con finestra al 55% che duplicava il disco A con una legge diversa è la cosa più sana qui dentro: due economie non dichiarate per lo stesso gesto sono il modo in cui si perde una partita senza capire perché.

**2. Lo stato neutro a zero dita, P6 e P7.** Alzare il pollice non deve costare il pallone; perdere il possesso durante la carica non deve produrre un calcio; il polpastrello che rotola non deve perdere il comando. Non alzano il tetto: tolgono il pavimento marcio. Sul telefono il pavimento è dove si perde.

**3. Cambio direzionale al posto del ciclo, e `CARRY_DIST` variabile.** Il ciclo orario è il motivo per cui su mobile non si difende: tre tap per prendere l'uomo giusto e nel frattempo la linea è saltata. E la distanza palla-piede in funzione della velocità è l'unica idea del documento che alza davvero il tetto senza chiedere un pulsante — è la valuta vera del duello, ed è la grandezza che una camera a 42° sa mostrare. Buono anche il feedforward: il compagno che parte *mentre il pollice è ancora giù* è manipolazione diretta fatta bene.

---

## LE TRE COSE CHE SI ROMPONO

### 1. La scivolata è il rilascio del contenimento: la difesa mi tradisce nell'istante peggiore

**Caso concreto.** Sto contenendo (tengo A) l'attaccante che mi punta. Mi butta la palla di lato e parte. Rilascio A — è l'unico modo di uscire dal contenimento, che mi inchioda al 62%. La levetta è a fondo verso di lui perché *lo sto inseguendo*; lui è a meno di 140 unità nel cono ±40°. Parte la scivolata. Da dietro. **Ogni singola volta.** La "freschezza di 0,30 s" non protegge da niente: la levetta a fondo è la condizione normale dell'inseguimento, non l'eccezione che il filtro immagina.

**Il buco gemello, non dichiarato.** #15 dice *tocca A < 0,15 s = contrasto in piedi*. #18 dice *rilascio di A con levetta oltre 46 negli ultimi 0,30 s = scivolata*. Un tocco di 0,12 s mentre corro addosso a un avversario soddisfa **entrambe** e la §5 non stabilisce la precedenza. Siccome in difesa corro quasi sempre verso l'avversario, o il contrasto in piedi è irraggiungibile in corsa, o lo è la scivolata. Questo è lo stato in cui il mio pollice vive metà partita e la specifica non sa dirmi cosa succede.

**E il terzo.** Per scivolare devo prima entrare in contenimento, cioè scendere al 62%. La scivolata dell'ultimo uomo — quella in corsa piena, l'unica che conta — è meccanicamente impossibile.

### 2. Un solo asse porta tipo + potenza + distanza: non posso dire due cose insieme

«Più tieni, più lontano e più rischioso» è splendido da imparare e fatale per il tetto. Su pad il *tasto* sceglie il tipo e la *tenuta* la potenza: sono ortogonali, ed è per questo che esistono il filtrante morbido di 8 metri e l'appoggio raso terra di 35.

- **Caso A.** Limite dell'area, l'attaccante taglia dentro a 10 metri, voglio un filtrante corto e piano. La banda filtrante comincia a 0,35 s e vale 480-560 di velocità con 330+ di portata: gliela metto in braccio al portiere. **Il filtrante corto non è esprimibile.**
- **Caso B.** Cambio gioco di 35 metri raso terra al terzino libero. Oltre 0,50 s la palla si alza con `vz`. **Il lungo a terra non è esprimibile.** Le due palle che gioco di più in costruzione sono entrambe fuori dal linguaggio.
- **Caso C, il peggiore.** Il galloncino cambia uomo *mentre tengo*: il candidato è il compagno nel cono entro la portata corrente, e la portata cresce da 170 a 600 col pollice giù. A 0,25 s il galloncino è sul mediano, a 0,5 s è sul terzino. Guardo il bersaglio cambiare da solo e l'unico modo di fermarlo è rilasciare, cioè calciare. Il documento promette «vedi dove andrà la palla prima di lasciare»: vero per la direzione, **falso per il destinatario**, che è la cosa che mi interessa.

**Corollario che uccide il pilastro MOVIMENTO.** La chiamata in profondità (#7) vive solo mentre tengo B, e mollare B calcia. Su pad lancio il movimento, aspetto due secondi, guardo il difensore mordere, *poi* servo. Qui il tempo massimo fra la chiamata e il passaggio è 0,70 s, e chiamare senza passare costa un trascinamento di 90 px. Non è il pilastro MOVIMENTO: è un automatismo di sette decimi.

**E la scappatoia è avvelenata.** Usare la banda della levetta come modificatore — che lo schema già fa per tiro di precisione e pallonetto — non funziona, perché la banda *è la mia velocità*: non posso tirare di precisione mentre scatto né pallonettare da fermo. Intenzione e postura non possono mai essere in disaccordo, e nel calcio lo sono in continuazione.

### 3. Non esiste il tiro immediato — e nella tabella §3.1 non c'è nessuna riga «tocca A»

Cinque righe per tocca/tieni B, tre per tieni A, **zero per tocca A col pallone**. Il gesto più istintivo del gioco — la pizzata in area piccola — non è specificato, e la meccanica che lo sostituisce ha un pavimento di mezzo secondo: nel codice `p.chargeT = SHOT_MIN` e `q = 0` sotto ~0,455 s con tecnica 70. Oggi almeno c'è una via di fuga (`if(c<TAP_T)` calcia a 300 in direzione del movimento, `:9225-9231`); il nuovo schema la cancella con tutto il resto e non la rimpiazza.

**Caso concreto.** Il portiere respinge sui piedi del mio attaccante a 4 metri, il difensore arriva in 300 ms. Devo caricare mezzo secondo prima che il tiro sia *permesso* di essere buono. Il gol da mischia, che è una fetta a due cifre dei gol veri, esce dal gioco.

E il cancello d'ambra è **obbligatorio, non opzionale**. Su FC il timed finishing lo attivo io. Trasformare d'ufficio l'istante di massima emozione in una prova di ritmo, con 3,4× di margine sulla latenza dentro una WebView che nessuno ha misurato, è una scommessa fatta coi miei gol.

---

## ALTRE TRE, CORTE, TUTTE INTERNE AL DOCUMENTO

- **L'aftertouch viola la tesi centrale.** #13 legge `rotazione(rad/s)`: è una derivata di `touchmove`. Il §6 dichiara «nessun ingresso legge la velocità del dito». Falso, e l'eccezione è proprio quella che si usa **in area**, dove la scena è più piena e il browser fonde di più. La curva funziona a centrocampo e sparisce quando serve.
- **La finta di tiro chiede un dito che lo schema dice di non avere.** P5 vuole B premuto *mentre A è ancora carico*: il pollice destro è occupato su A, serve l'indice. Il documento vende «un pollice e mezzo» e cita il 49% a una mano. L'unico strumento d'inganno di tutto lo schema è a due dita.
- **Il disco B mente sul pallone vagante.** Respinta, rimpallo, contrasto: il possesso sfarfalla, l'etichetta ha 0,25 s di isteresi e l'atto è congelato sullo stato vero al `touchstart`. Per un quarto di secondo il disco dice CAMBIO e passa, oppure dice PASSA e cambia uomo. È esattamente la bugia che P4 rivendica di aver chiuso, spostata di un livello.

---

## COSA MI MANCA CHE USO OGNI PARTITA

Annullo vero (L2+R2): non c'è modo di abortire un'azione già partita, e P7 annulla solo una carica chiedendomi 90 px di trascinamento nel momento di panico · lancio del movimento indipendente dal passaggio (L1) · filtrante alto distinto dal cross · passaggio teso come *tipo* e non come punto di una rampa · **un solo strumento per saltare l'uomo** — non chiedo skill move, chiedo uno stop-and-go o un knock-past: il carry distance è un gradiente di rischio, non un verbo, e in questo schema l'uno contro uno offensivo si vince solo essendo più veloci · uscita del portiere sui filtranti · primo controllo orientato · il tap-in.

---

## LA SINGOLA MODIFICA CHE ALZA DI PIÙ IL VOTO

**Separare il TIPO dalla POTENZA sul passaggio, usando il chord fra i due dischi che lo schema già assume.**

Concretamente: **A premuto mentre B è giù seleziona la famiglia alternativa** (alta / filtrante alto), e la durata di B torna a significare **solo** potenza-e-distanza. Zero nuove superfici, zero flick, zero finestre di timing, un solo accoppiamento nuovo da ricordare, letto come evento discreto e quindi immune alla fusione dei `touchmove` — cioè dentro tutti i vincoli che il documento si è dato.

Il chord esiste già (P5) e oggi è speso per un annullo che P7 fa da solo. Speso così, mi restituisce in un colpo il **filtrante corto**, il **lungo raso terra**, il **cross morbido** e il **pallonetto in area** — le quattro palle che gioco ogni partita e che lo schema attuale non sa pronunciare — e ridà alla tenuta di B l'unico mestiere che sa fare bene.

Con questa, più una riga che dichiari cosa fa «tocca A» col pallone (il tiro debole: è già quello che dice la vostra frase mnemonica) e la precedenza fra #15 e #18, lo schema passa da **6 a 7,5**. L'8 resta chiuso finché non esiste un verbo per saltare l'uomo e un annullo che non sia un trascinamento di 90 px.