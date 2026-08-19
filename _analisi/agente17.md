**VOTO: 6/10.**

E il 6 è generoso, perché lo regge quasi per intero una meccanica che questo schema non ha inventato: l'anello di timing del tiro. Togli l'anello e resta un 4. Non è un 8 perché al miglior gioco di calcio per telefono io perdo o vinco *col pallone tra i piedi*, e qui la colonna «supero l'uomo» è vuota; non è un 5 perché la grammatica è più onesta e più separabile di quella di FC Mobile, e il documento sa dove mente.

Il difetto strutturale, in una riga: **l'asse dei modificatori è il tempo.** Sul pad i modificatori sono gratis perché sono simultanei (L1+X mentre corro). Qui ogni verbo di valore costa 300 o 550 ms di pollice fermo su un disco, e il tempo è esattamente la risorsa che la partita mi sta contendendo. Ne esce una gerarchia rovesciata: il passaggio innocuo di lato costa 133 ms, il filtrante — la giocata che decide le partite — ne costa 300 minimo. Il gioco tassa l'ambizione.

---

## LE TRE COSE MIGLIORI

**1. Il tiro: anello di timing + trascinamento verticale continuo sulla bocca.**
È l'unico punto dello schema con due assi veri e continui insieme (quando premo, dove metto la palla), ed è l'unico posto dove un giocatore forte batte uno debole in modo ripetibile. Che la bocca della porta sia un segmento verticale sullo schermo e il trascinamento verticale *sia* il punto è manipolazione diretta, zero associazioni: dopo tre tiri non ci penso più. E liberare il pollice sinistro dalla mira (§8.13, via il `my*260` di oggi) significa che posso rifinire la corsa mentre carico, che è metà del tiro in corsa. Questa parte, da sola, è di livello commerciale.

**2. La regola «annullare vince sempre», e la finta come composizione.**
Il flick della levetta che chiude qualunque carica aperta e spinge la palla è il pezzo di design più intelligente del documento: la finta di tiro e la finta di passaggio non sono due gesti nuovi da imparare, sono la stessa regola applicata due volte. Un gesto che si può disfare è un gesto che oso usare sotto pressione — ed è precisamente il criterio che separa uno schema con un tetto da una tastiera. **Ma l'etichetta viva su cui poggia tutto questo oggi è invisibile: vedi la rottura n. 3.**

**3. La risoluzione al punto di rilascio invece che dal flusso dei `touchmove`.**
Questa è la scelta più «pro» del documento e nessuno la noterà. Su telefono i fotogrammi crollano esattamente quando l'azione scotta: area affollata, particellari, contropiede. Una grammatica che sotto affanno si comporta identica a com'è a riposo vale più di dieci verbi in più. Barba: **l'unica cosa rimasta appesa al flusso dei move è il flick**, cioè l'intero vocabolario di dribbling. La parte fragile è la parte che uso in mischia.

---

## LE TRE COSE CHE SI ROMPONO

**1. Il dribbling non esiste: ogni «finta» è un pallone regalato. (È il tetto.)**
I verbi 21-23 mettono `owner=-1`, `touchCd = 0,22`, palla a 140-250 u/s. `P_SPEED` è **168**: un tocco pieno è più veloce di me e per 220 ms non posso riprenderlo, mentre il difensore accanto a me non ha nessun cooldown. `KICK_R` è 26 unità: la palla esce dal mio raggio di calciabilità nel primo decimo.
*Caso concreto*: 1 contro 1 con l'ultimo difensore a 25 unità sul lato corto, campo 5v5 (1150×560). Voglio rientrare sul piede forte: flick laterale. La palla diventa di nessuno a 180 u/s con un avversario a un metro. Non esiste, in tutto lo schema, **una singola manovra che superi un uomo mantenendo il possesso**. Conseguenza per me: contro un avversario peggiore di me, il duello lo decide chi è più veloce e cosa fa l'IA, non chi legge meglio. Un gioco competitivo in cui non posso esprimere superiorità nel possesso ha il tetto dove ha il pavimento. Questa non è una mancanza di skill move — è l'assenza dell'intera categoria «controllo di palla».

**2. Cambio uomo e contenimento sullo stesso disco, e il contenimento che si auto-tradisce a 0,55 s.**
Sul pad L1 e L2 sono indipendenti e simultanei: tap-tap-tap per prendere l'uomo giusto *mentre* tengo premuto il jockey per tutta la sequenza. Qui è un unico bottone da 60 px in fila indiana: tap = cambio, 0,30-0,55 = contenimento, **>0,55 = contenimento + raddoppio**.
*Caso concreto*: contropiede 3 contro 2. Tappo per prendere il centrale, tengo per contenere l'esterno che punta — cosa che sul pad faccio per due secondi buoni, perché contenere *è* uno stato, non un impulso. A 550 ms il gioco mi tira fuori il secondo difensore dalla linea, l'esterno taglia dentro nel corridoio appena aperto, cross basso, tap-in. **Il bottone mi ha punito per aver difeso bene**, e non ho nessun modo di contenere senza chiamare un compagno: la scala delle durate è additiva e non ho un'uscita. In più, mentre contengo non posso cambiare uomo, e il `DEB_CTX` di 180 ms mi mangia in silenzio il primo tocco dopo ogni transizione — senza animazione, senza vibrazione, senza niente: la definizione di comando perso.

**3. Il rollio del pollice trasforma le stoccate in pallonetti, e l'etichetta che dovrebbe avvisarmi è stampata sotto il polpastrello.**
Facciamo l'aritmetica con i loro numeri: 915 px CSS su ~145 mm di schermo in orizzontale = ~6,3 px/mm. La soglia del pallonetto è `ax < −0,5`, cioè **22 px = 3,5 mm**; quella del tiro di precisione `|ay| > 0,7` = **4,9 mm**; `DRAG_DEAD` è 2,2 mm — e nella formula scritta (`ax = clamp(dx·g/44, −1, 1)`) **`DRAG_DEAD` non protegge affatto `ax`/`ay`, protegge solo `m`**. Il pollice destro nell'angolo basso-destra, quando si stacca, rotola in basso-a-sinistra di qualche millimetro: è il gesto, non un errore.
*Caso concreto*: respinta corta a otto metri, portiere fuori posizione, martello il disco grande e rilascio sull'ambra (grazia ±45 ms — quindi il rilascio è già il momento a più alta precisione temporale del gioco). Nel distacco il pollice rotola 4 mm indietro: `ax = −0,57`. Il gioco **scavalca la porta vuota con un pallonetto**. Non c'è modo di sapere che è successo, e §5.1 ammette che il rollio non è mai stato misurato. Questo è il punto esatto in cui mi sento tradito dal comando, ed è anche quello che mi fa spegnere il gioco.
E il presidio previsto contro l'errore — l'etichetta viva che dice il verbo prima di commettere — **è disegnata sul disco che sto premendo**. Loro stessi scrivono che un pollice da 25 mm copre ~150 px CSS; il disco piccolo ne è largo 60. L'occlusione è del 100%, sempre, esattamente nell'istante in cui l'etichetta servirebbe. M2 verifica l'occlusione di pallone, giocatore e porta: **non verifica l'occlusione dell'unico meccanismo su cui poggia l'intera scoperta dello schema.** Caso concreto derivato: tengo PASSA per crossare a due metri dalla linea di metà campo, non posso leggere se dice CROSS o CAMBIO GIOCO, e il pallone parte al terzino opposto invece che in area. Il confine invisibile di zona che §3.1 dichiara di aver risolto è ancora lì, semplicemente con un'etichetta che nessuno può vedere.

---

## COSA MI MANCA, CHE USO OGNI PARTITA

- **Lo sprint modulato (R2 pompato).** Qui sprint = ampiezza della levetta: `STICK_FULL` 46, `STICK_SPRINT` 66, base che insegue a 70. Sono 20 px (3,2 mm) di banda per stare a velocità piena *senza* sprint, con l'origine che si sposta sotto il dito. In pratica una volta partito lo sprint non ne esco più in modo affidabile. La cadenza sprint-on/sprint-off è metà del dribbling nel calcio giocato bene, e qui è un interruttore a senso unico.
- **Il secondo uomo in pressing tenuto** mentre continuo a guidare il primo difensore. Qui è un «spara e dimentica» di 2,5 s che parte da solo quando non voglio (vedi rottura 2).
- **Il filtrante alla latenza della pressione.** 300 ms di attesa su una finestra di gioco che dura 200-400 ms significa che il filtrante arriva sempre un tempo dopo.
- **L'uno-due al trotto.** Il dai-e-vai (verbo 10) richiede lo sprint tenuto al rilascio: quindi la combinazione stretta in costruzione, che si fa a velocità di palleggio, semplicemente non è digitabile.
- **Rompere l'assistenza di proposito.** Cono + miglior `dot` significa che il bersaglio lo sceglie il gioco. Il mio tetto è il tetto di `smarcato()`. Un giocatore forte passa spesso all'opzione *peggiore* perché sa cosa succede dopo; qui non ho la sintassi per dirlo.
- **Proteggere e girarsi.** Lo scudo è automatico e ferma il giocatore. Anzi, è un secondo tradimento: alzo il pollice per riposizionarlo a metà corsa (cosa che con una levetta fluttuante faccio di continuo) e con un avversario entro 60 unità — nell'ultimo terzo, sempre — il mio uomo **si inchioda e gira le spalle**. La funzione di sicurezza è anche un freno a mano involontario, e contraddice direttamente il §5.8 che vende il rimettere giù il pollice come gratuito.
- La lente e la bussola, sia detto: in partita non le userò mai. Qualunque comando che mi costi 300-700 ms di movimento non comandato è vocabolario morto per me. Contarli fra i 39 verbi gonfia il numero.

---

## LA SINGOLA MODIFICA CHE ALZEREBBE DI PIÙ IL VOTO

**Togliere la durata come asse dei modificatori sul disco piccolo e sostituirla con l'ampiezza del trascinamento. Un solo tap per tutto.**

Concretamente: il verbo si risolve dal solo trascinamento al rilascio — **4 coni × 2 ampiezze** (`m < 0,5` / `m ≥ 0,5`, con `DRAG_FULL` a 44 px) = otto verbi per contesto, tutti al prezzo di un tap da 133 ms. Filtrante = cono avanti, ampiezza corta. Filtrante alto = cono avanti, ampiezza piena. Cross teso / a campanile = lato corto / lato pieno. Il pollice può percorrere 44 px *dentro* i 133 ms del tap: l'ampiezza è gratis, la durata no. E la tenuta resta **solo** per l'unica cosa che è davvero modale, il contenimento, che diventa un vero tieni-per-restare senza nessuna soglia di escalation: il raddoppio si sposta sul cono (tieni + trascina verso il portatore).

Cosa guadagno: il filtrante e il cross scendono da 300-550 ms a ~133 ms, cioè il vocabolario smette di tassare le giocate che contano; il conflitto cambio-uomo/contenimento si scioglie perché il cambio direzionale usa il cono e il contenimento usa la tenuta pura; sparisce la fascia 0,15-0,30 che oggi è terra di nessuno con un tap medio a 133 ms e deviazione 83 (circa un tap su tre sfonda i 216 ms — la loro stessa M1 lo dice); e l'etichetta viva ha finalmente senso, perché il verbo cambia mentre *sposto* il dito, non mentre lo tengo fermo a guardare un orologio.

Cosa pago: passo da 39 verbi a ~26. **Li cambio tutti e tredici volentieri.** Un vocabolario di ventisei verbi che costano 133 ms l'uno ha un tetto più alto di uno da trentanove in cui i migliori dodici costano mezzo secondo, perché il tetto di uno schema non è quante intenzioni può esprimere: è quante ne può esprimere *nel tempo che l'avversario mi lascia*.

Due riparazioni da una riga da fare insieme, perché costano niente e sono le due che mi fanno chiudere il gioco: **(a)** applicare `DRAG_DEAD` anche ad `ax`/`ay` e alzare la soglia del pallonetto da `|ax| > 0,5` a `> 0,8` con una durata minima di trascinamento sostenuto — un rollio di stacco non deve poter scavalcare un portiere; **(b)** disegnare l'etichetta viva **sopra** il disco, a 90+ px dal centro del tocco, fuori dall'impronta dichiarata da 150 px, e aggiungerla alle categorie misurate da M2.