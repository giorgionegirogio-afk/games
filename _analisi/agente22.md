# VOTO: 5,5 / 10

Scomposto, perché il numero unico mente: **il pavimento (levetta + due dischi + flick) vale ~6,5** — è geometria corretta e una delle correzioni proposte è la riparazione di un difetto che oggi tiene il gioco *sotto* il 5. **La metà nuova del vocabolario vale ~4**, perché è costruita su un puntatore che non esiste, e perché la geometria d'angolo non ha mai incontrato un telefono vero. Media pesata sull'uso reale: 5,5. Non è "giocabile ma frustrante": è "giocabile bene per i primi sei verbi, e i restanti ventidue non si possono eseguire come sono scritti".

---

## LE TRE COSE MIGLIORI

**1. La geometria d'atterraggio è giusta, e per il motivo giusto.** L'anello di esclusione `r+18` (riga 8836) che *non fa niente* invece di riassegnare il tocco al vicino più probabile è la scelta corretta e quasi nessuno la fa: un tocco ambiguo che diventa un verbo è peggio di un tocco perso, perché insegna al giocatore una regola falsa. I 94,76 px fra i centri contro i 90 necessari sono margine misurato, non sperato. E la coppia in diagonale invece della colonna verticale è ergonomia vera: il pollice destro in appoggio sull'angolo raggiunge il piccolo per *estensione* lungo l'asse in cui è già disteso, non per una rotazione contro l'articolazione. La colonna verticale che usa mezzo catalogo è il layout sbagliato, e questo file l'ha già capito.

**2. Il rilascio inerte.** `Touch5.release` finisce oggi con `if(carrying) doPass(t)` (riga ~8948): **alzare il pollice sinistro calcia il pallone**, misurato 34 volte su 50. Alzare la levetta è l'azione più involontaria che esista su un telefono — si riposiziona la mano, si asciuga il sudore, l'autobus frena. Il gioco di oggi punisce la respirazione. Toglierlo è la singola riga più redditizia dell'intero documento, e il beneficio di secondo ordine è colto correttamente: con il ramo inerte, un flick non riconosciuto (che sotto carico succede, perché il browser fonde i touchmove) smette di essere una palla regalata e diventa niente.

**3. «Non si classifica il dito, si legge il mondo».** La seconda legge è la parte intellettualmente seria del progetto. M4 è la misura giusta (23 tap su 24 letti come tenuta a 6×) e la conclusione è quella giusta: una soglia di durata sull'orologio degli eventi misura il telefono, non il dito. Mettere le durate sull'accumulatore di `step()` — dove il tiro già vive (`p.charge+=dt`) — fa rallentare l'anello, la lancetta e la corsa del compagno *insieme*, quindi il gesto resta imparabile anche quando l'orologio è sbagliato. È lo stesso motivo per cui i giochi ritmici si ancorano all'orologio audio. E leggere il verbo del piccolo dallo *stato del compagno* invece che dalla durata è la deduzione corretta da lì. Nessun gioco di calcio in commercio fa questo ragionamento.

---

## LE TRE COSE CHE SI ROMPONO

### R1 — La levetta è l'unico puntatore, ed è già l'acceleratore. Il canale della *magnitudine* porta oggi quattro significati, e il progetto ne aggiunge due.

Il documento verifica il pollice destro riga per riga e **non fa mai il censimento del pollice sinistro**. Eccolo, dal codice:

| | significato di `|levetta|` | dove |
|---|---|---|
| 1 | velocità di corsa analogica | dead 12 / piena 46 |
| 2 | **sprint** oltre 66 px | `STICK_SPRINT=66`, riga 8664 |
| 3 | **pallonetto** al rilascio del tiro | riga 9243, `fireShot(..., humanSprint(t))` |
| 4 | **cross / filtrante a scavalcare** | riga 8829, `doFiltrante(t, humanSprint(t))` |
| 5 | *nuovo:* guadagno della mira `K·dot·|levetta|` | §5 |
| 6 | *nuovo:* tiro di precisione «a fondo corsa verso un palo» | §3 |

**La collisione è aritmetica e sta già nel file: `MAXR=70` (riga 8851), `STICK_SPRINT=66` (riga 8664). «Levetta a fondo corsa» = 70 > 66 = sprint = pallonetto.** Il tiro di precisione proposto *è*, bit per bit, la condizione del pallonetto esistente. Peggio: la mira del tiro di oggi legge solo la componente verticale (`dy += my*260`, riga 9239), quindi «mirare al palo» significa già spingere la levetta in verticale, e spingerla abbastanza perché conti significa superare 66 e trasformare il tiro in un pallonetto. Il §5, che è il capitolo sull'ambiguità, non nomina mai la coppia pallonetto/precisione, perché §5 arbitra solo fra verbi del pollice destro.

E il caso concreto che uccide la mira: **sto risalendo la fascia in sprint, voglio l'appoggio all'indietro sul mediano in arrivo.** Levetta a fondo corsa in avanti: `K·dot·|levetta|` vale +220 sull'uomo davanti e −198 sul mediano dietro, cioè 418 punti contro il passaggio che voglio, contro un margine di base mediano *misurato* di 61,1 (a 5) e 118,4 (a 11). Per mirare all'indietro devo correre all'indietro. **Non esiste modo di mirare stando fermi: a |levetta| = 0 il bias è 0 e torna il bersaglio automatico.** Il progetto vende «la levetta dice DOVE» quando la levetta dice, e continuerà a dire, DOVE VADO.

Il colpo di grazia è sul **cross mirato**, l'azione che il documento presenta come il guadagno principale: il modificatore *è* `|levetta|>66` e il bias *è* `K·dot·|levetta|` — accendere il modificatore satura il bias nella direzione in cui sto correndo. Un esterno che crossa sta correndo lungo la linea di fondo, quindi il bersaglio «mirato» è per costruzione l'uomo più avanzato. Il cross mirato non è mirabile.

### R2 — L'occlusione non è mai stata misurata, e le garanzie che il file già dà mettono il pallone sotto la mano.

Il §6 «Mani grandi» confronta i dischi con Apple 44, Material 48, Parhi 9,2 mm, NN/g 10 mm. **Sono tutte e quattro soglie di *bersaglio*, nessuna è una soglia di *occlusione*.** Il documento supera un esame che non è quello che deve dare. E la stima è sbagliata in entrambe le direzioni: il polpastrello di contatto è 11–14 mm (≈75–95 px qui), non 25 mm; ma la regione *nascosta* è il polpastrello **più tutto ciò che sta fra il polpastrello e il bordo da cui la mano entra**. Tenendo il PICCOLO a (757,340) il pollice destro sepplisce all'incirca il rettangolo (757,340)→(915,412): ~160×72 px di prato, nell'angolo basso-destra.

Ora il caso concreto, e viene dal file stesso. La regia garantisce che il pallone **non scenda mai sotto i 56 px dai quattro bordi della *tela*** (riga 20984, e la garanzia è stata *spostata* dai bordi dell'area di gioco a quelli della tela apposta, per liberare la fascia dei cartelloni). Quindi il pallone è ammesso fino a **(859, 356)**: nove pixel dal centro del disco GRANDE. Attacco sulla destra, punta all'angolo dell'area vicino alla linea laterale bassa, camera inchiodata alla testata destra (`raggiungeDx`): tengo PASSA, e **l'ipotesi dichiarata è dipinta sotto il mio stesso pollice.** R3 dice «se non è dipinta, l'atto non è lecito»; la regola non ha modo di sapere che è dipinta *e invisibile*. Tutto il meccanismo di sicurezza proponi→conferma evapora esattamente nell'ultimo terzo sul lato forte, cioè dove i passaggi contano. Questo file ha già ricevuto la condanna «il pulsante FILTRANTE copre il portiere e il difensore, e succede in ogni attacco verso destra», l'ha riparata per i *pulsanti*, e non ha rifatto il controllo né per l'anteprima né per il pallone.

### R3 — «56 px di percorso», nessuna area sicura, e l'autobus.

Due rotture, e sono entrambe il caso «in piedi sull'autobus» che il progetto non affronta mai.

**(a) «Percorso» è lunghezza di traiettoria, non spostamento.** I touchmove arrivano a 60–120 Hz; 1–2 px di tremore per evento fanno 60–240 px di percorso al secondo. La chiamata in profondità dura fino a **1,20 s**. Su un autobus in movimento la tenuta si annulla da sola, in silenzio, prima di arrivare al tetto. E poiché il rilascio della levetta è ormai inerte, il cono vuoto ricade sul passaggio base e il margine di guardia ricade sul bersaglio base, **il modo di fallire dominante dell'intero schema sotto vibrazione è: il gioco non fa niente.** Un frenata brusca a metà tenuta = pallone ancora ai piedi, avversario addosso, nessun output. Nota anche che il §6 si contraddice: «uno scivolamento di 30 px non annulla niente» è vero solo se la misura è lo *spostamento*; se è il percorso, 30 px avanti e 30 indietro annullano con il dito tornato al punto di partenza.

**(b) La geometria è ancorata a VW/VH grezzi, e il file dichiara `viewport-fit=cover` (riga 5) senza un solo `env(safe-area-inset-*)` in 30.581 righe** (verificato: zero occorrenze). Conseguenze su un telefono vero in orizzontale:
- la presa del GRANDE (r 50 attorno a (851,352)) arriva a **x 901 — 14 px dal bordo destro — e y 402 — 10 px dal fondo**: il suo quadrante esterno cade dentro l'angolo arrotondato e dentro la striscia della barra dei gesti / home indicator;
- la bussola, 10–102 × 355–402, sta nell'angolo basso-sinistra: su una delle due rotazioni è **sotto il ritaglio della fotocamera**, e il suo bordo inferiore è dentro la stessa striscia di sistema;
- e i due gesti *nuovi* puntano proprio lì: «56 px di percorso» allontanando il pollice dal disco significa scivolare verso l'angolo (= gesto home), e «qualunque movimento >12 px nella bussola fa nascere una levetta» significa trascinare dal bordo inferiore (= home) o dal bordo laterale (= indietro di Android).

Tutte e quattro le misure sono state prese in Chromium headless, che non ha inserti: **nessuno dei tre cancelli del §8 può vedere questo difetto**, perché girano sullo stesso banco che l'ha reso invisibile.

*(Corollario sull'autobus, dichiarato: questo è uno schema a due pollici in orizzontale. Reggere il telefono con due mani e giocare in piedi significa non tenersi. Non c'è una modalità verticale né un ripiego a una mano, e il documento non lo elenca nemmeno fra le cose che non può fare.)*

---

## LA MODIFICA CHE ALZEREBBE DI PIÙ IL VOTO

**Dare alla mira un canale proprio: il puntatore è il dito che tiene il disco, non la levetta.**

Durante una tenuta sul PICCOLO, il bersaglio si sceglie con la **direzione dello scostamento del pollice destro dal proprio punto di posa** — una micro-levetta che nasce sul disco, saturata a ~40 px, con `dot` calcolato su quel vettore invece che su `Touch5.stick[t]`. Il termine diventa `K · dot(q, ditoDisco) · min(1, |scostamento|/40)`.

Perché è questa e non un'altra:

1. **Scioglie R1 alla radice.** La levetta torna a significare una cosa sola (dove vado), il pollice destro guadagna la cosa che gli manca (dove va la palla), e le due intenzioni smettono di essere lo stesso numero. Il cross mirato diventa mirabile, l'appoggio all'indietro in corsa diventa possibile, e il conflitto pallonetto/precisione si risolve da sé perché il modificatore può passare sulla direzione del dito del disco (alto = cross, basso = rasoterra) e liberare `humanSprint` dal doppio incarico.
2. **Costa un solo campo nuovo.** Il percorso del dito sul disco lo si sta già misurando per l'annullamento: una misura, due usi. E annullamento e mira diventano **un gesto solo, continuo**: trascini dentro i 56 px = miri, oltre = spegni. Un gesto da imparare invece di due, ed è esattamente il marking menu di Kurtenbach — che il documento cita al §6 per la bussola e poi non applica nell'unico posto dove serve.
3. **È immune al tremore se si passa da *percorso* a *spostamento dal punto di posa*** — che è il cambio che R3(a) chiede comunque, e che risolve anche l'obiezione di raggiungibilità con cui il §2 aveva giustificato il percorso: lo spostamento si misura dal punto in cui il dito è atterrato, non dal centro del disco, quindi è raggiungibile in tutte e quattro le direzioni per costruzione.
4. **È la manipolazione diretta che il §4.3 dichiara di volere.** Trascini verso l'uomo, l'anello lo segue, alzi, la palla parte. Il costo di apprendimento è zero perché il gesto *è* la sua propria spiegazione — cosa che «punta la levetta mentre corri altrove e guarda se l'anello si sposta» non è.

Con questa modifica il progetto arriva credibilmente a 7. Restano fuori l'occlusione (R2) e le aree sicure (R3b), che sono lavoro di geometria e non di progetto: prima di scrivere qualunque riga, aggiungere un quarto cancello che misuri **la distanza in pixel fra il pallone e il centro dei due dischi lungo mille fotogrammi veri** e la quota di fotogrammi in cui l'anteprima cade dentro il rettangolo mano — e prendere quel numero su un telefono con gli inserti, perché in headless non esiste.

Riferimenti verificati in `C:\Users\Utenteee\Desktop\GitHub\games\CALCETTO-il-gioco.html`: riga 5 (`viewport-fit=cover`, nessun `env()` nel file), 8664 (`STICK_SPRINT=66`), 8836 (anello di esclusione), 8851 (`MAXR=70`), 8829 e 9243 (`humanSprint` come modificatore doppio), 9239 (la mira del tiro legge solo la verticale), 20984 (garanzia dei 56 px dai bordi della tela), 24979 (casa del pollice sinistro — l'unica occlusione che il file abbia mai dichiarato, ed è quella dell'altra mano).