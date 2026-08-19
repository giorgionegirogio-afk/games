**VOTO: 6 / 10**

Sopra il "giocabile ma frustrante" per struttura e onestà, sotto il miglior gioco di calcio per telefono perché nei tre o quattro istanti che decidono una partita — la transizione, il passaggio massimo, il primo tocco — il comando mi tradisce per costruzione, non per bug.

---

## Risposta secca alle tue domande

**Il tetto è alto?** No: è medio. Il documento dichiara 26 verbi, ma il metro giusto è *quanti ne raggiungo in meno di 200 ms con un avversario addosso*. Con la palla al piede e pressione sono: TAP passa, TAP tira, TENUTA tira. Tre. Tutto ciò che ha una direzione costa 22-36 px di corsa del pollice **dentro** il gesto (55-110 ms di trascinamento controllato) più i 150 ms della tenuta se voglio anche il peso: **200-260 ms di pollice destro impegnato per un passaggio mirato e pesato**. Sul pad quello stesso passaggio è R1+X con la levetta *già* puntata: costo marginale zero, e nel frattempo tengo L2 e corro. Il vocabolario in tabella è ricco; il vocabolario *sotto pressione* è di tre voci.

**Posso esprimere un'intenzione precisa?** Sul **peso** sì, ed è la cosa nuova migliore del progetto. Sulla **direzione** no: 4 settori da 90° significa che con tre compagni dentro il cono AVANTI il gioco sceglie per me. Nel terzo finale quello è tutto il gioco. Sul pad angolo la levetta di 20° e scelgo l'uomo; qui non ho nessun modo di scegliere il destinatario.

---

## Le TRE cose migliori

1. **Legge 3 — nessun ingresso legge una velocità.** È la scelta da giocatore competitivo dell'intero documento, e non l'ha mai fatta nessuno su telefono. Ogni gioco di calcio mobile che ho toccato ha un tiro a swipe che si comporta diversamente quando il telefono scotta: lì dentro non c'è skill, c'è termodinamica. Classificare solo su *posizione finale* e *durata* rende l'ingresso identico a 60 fps e a 22 ms di fotogramma. E il cancello 3 lo verifica rimuovendo i `touchmove` intermedi e pretendendo esito identico: quello è un test vero.

2. **Stato a zero dita non punitivo + `touchcancel` = annulla.** M3 è la misura più utile del documento: oggi una notifica batte un passaggio, 4 volte su 4, indistinguibile da un rilascio. Non è una raffinatezza, è la differenza fra un gioco e un gioco che perdi per colpa del sistema operativo. Vale più di dieci verbi nuovi.

3. **Il ritorno visivo ancorato al pallone, con il nome del verbo prima del rilascio.** È l'unica soluzione corretta al problema dell'occlusione, ed è misurata invece che asserita (§1.3). Il corollario — cancello 2 con la geometria del pollice che vive *nello strumento* e non nell'HTML, così il gioco non può negoziarla — è la parte più matura di tutto il progetto.

---

## Le TRE cose che si rompono

**1. La transizione. Il contesto congelato mi lascia inerme per mezzo secondo — e l'etichetta che dovrebbe salvarmi sta sotto il mio pollice.**
Caso: sto caricando il tiro, GRANDE tenuto da 0,5 s. Un difensore mi soffia la palla 40 ms prima che io lasci. §6.3: contesto congelato = IO, verbo = TIRA, palla non c'è → **non parte niente**. Io sono ancora giù col pollice, la palla è loro, il loro terzino parte. Devo lasciare (nulla), ripremere, e solo allora ho CONTRASTA. Sono 300-500 ms di paralisi nell'unico momento della partita in cui 300 ms costano un gol. Il documento chiama "fallimento benigno" il fatto che non si converta in un altro verbo: dal pad, *niente* è l'esito peggiore possibile, non il più sicuro.
E qui c'è una contraddizione interna che il progetto non vede: la **Legge 2** dice che non devo mai guardare sotto il dito, tutto il ritorno è sul pallone. Ma l'**unico** disambiguatore fra IO/NOI/LORO è una parola scritta sul disco, cioè esattamente là dove mi è stato detto di non guardare — e che §1.3 misura come coperta dal cuneo del pollice. Il cancello 1 verifica che l'etichetta non menta; non verifica che sia leggibile da chi sta rispettando la Legge 2.

**2. Il dirupo dei 600 ms: il passaggio più forte e la chiamata in profondità sono separati da un tremolio della mano.**
Con `w = clamp((ten−0,05)/0,55, 0, 1)` il peso massimo arriva **esattamente a 0,60 s**, che è **esattamente** la soglia in cui la tenuta sul PICCOLO diventa CHIAMATA. Caso: palla al limite, voglio il traversone teso raso terra sul secondo palo — il passaggio più forte che il gioco abbia. Devo tenere 600 ms. A 0,61 s non ottengo un passaggio leggermente diverso: ottengo un **verbo diverso**, il compagno parte e la palla lo anticipa nello spazio. Fra 0,55 s e 0,60 s guadagno il 4% di potenza (581 → 607 u/s a d=170); a 0,601 s cambio gioco. E non c'è uscita: il buzz a 600 ms mi avvisa *dopo*, e l'unico modo di disarmare la chiamata è trascinare oltre 96 px, cioè ANNULLA — perdo anche il passaggio. Sul pad il passaggio filtrato è un tasto diverso dal passaggio: non li ho mai confusi in vita mia. Qui li confonderò ogni partita.

**3. Il passa-e-vai è dimezzato dall'aftertouch, cioè dal documento stesso.**
§3.2: per 0,45 s dopo il calcio «il peso della levetta sulla corsa del giocatore scende a 0,5». §4: «passa-e-vai = PICCOLO + sprint alla levetta al rilascio». Il verbo più importante del calcetto viene eseguito **a metà velocità per costruzione**, per 0,45 s, cioè per tutta la parte della corsa che conta. Peggio: l'aftertouch non ha una porta d'ingresso — è attivo *sempre*, e lo stato più comune della levetta nell'istante in cui passo è "puntata dove stavo correndo", che è quasi sempre perpendicolare alla palla che ho appena giocato. Quindi curvo per sbaglio. E la curva è un'accelerazione **assoluta** (`CURVA_MAX = 170`, conto rapido: ~24 u/s di velocità perpendicolare, sempre gli stessi): pesa poco sul tiro forte per cui è pensata (~4% a 620 u/s) e molto sull'appoggio lento (~7-8% a 320 u/s). L'effetto sbaglia lo scarico all'indietro e non curva il tiro.

**Altre quattro, in fila, senza sviluppo, tutte concrete:**
- **Nessun budget per le zone di gesto del sistema operativo.** Il disco GRANDE finisce a y 396 su 412: i suoi 16 px inferiori stanno dentro la fascia dell'home indicator iOS (~20-25 pt). Armare FASCIA ALTA trascinando in su dalla parte bassa del disco è, per il sistema, la gesture di home. E la levetta nasce *dove capita*: se il pollice sinistro appoggia a x<24 e spinge a destra, è la gesture back di Android. Il documento misura il pollice al decimo di millimetro e non misura mai il sistema operativo. Con `touchcancel = annulla` il fallimento diventa silenzioso invece che rumoroso: non è peggio, ma non è risolto.
- **Fermarsi costa 0,35 s.** Lo stato a zero dita è la cosa migliore del progetto, ma è anche l'**unico** modo di fermarsi, e ha 350 ms di latenza. Uno stop-and-turn per scrollarmi un difensore non esiste. Sul pad mollo la levetta e il giocatore si pianta in due fotogrammi.
- **Il corridoio morto fra i dischi non ha un ritorno.** 50+40 = 90 contro 94,76: c'è una fascia dove nessuna presa risponde e le esclusioni (58+48 = 106) uccidono il tocco. È esattamente il tragitto del pollice che scivola da TIRA a PASSA. Un tocco ucciso deve vibrare. Non vibra niente, e sotto pressione un ingresso mangiato in silenzio è indistinguibile da un errore mio.
- **Il primo tocco è strutturalmente impossibile.** Per giocare di prima devo premere *prima* che la palla arrivi, e tenere per il peso; ma la durata della tenuta **è** il peso, e l'istante del rilascio **è** il momento del contatto. Sono lo stesso asse. Non posso scegliere un passaggio teso di prima: prendo il peso che il volo della palla mi concede. Sul pad il tasto R1 rende il tipo di passaggio ortogonale al tempo, ed è per questo che esiste.

---

## Cosa mi manca che uso ogni partita

Tiro di **finesse** e tiro **rasoterra forte** (l'asse "tipo" del tiro è vuoto, mentre il passaggio ce l'ha); **protezione palla / corpo fra palla e avversario** (il GRANDE tenuto con la palla è già occupato dalla carica: non ho nessun verbo per tenerla spalle alla porta); **tocco lungo in corsa** (knock-on) e stop-and-turn; **annullo dell'animazione in corso** in qualunque momento (L2+R2), che qui non esiste — l'annullo del progetto vive solo *dentro* un gesto già cominciato; **scelta del destinatario** più fine di 90°.

---

## LA singola modifica che alzerebbe di più il voto

**Togli la direzione dal pollice destro e rimettila sulla levetta.** Il verbo lo scelgono i dischi, la mira la dà la levetta all'istante del rilascio, in 360° continui. Il trascinamento sul disco resta solo come fuga binaria (oltre ~60 px in qualunque direzione = ANNULLA).

Perché è questa e non un'altra: il progetto ha preso l'unica cosa che sul pad è **parallela** — due mani, una punta e una preme — e l'ha resa **seriale** su un pollice solo. Tutto il resto discende da lì. Rimettendo la mira a sinistra: il costo di un passaggio mirato scende da 200-260 ms a zero marginale (la levetta è già puntata, sempre); il tetto sale da 4 settori a 360° continui e la scelta del destinatario torna al giocatore; sparisce il conflitto con i bordi e con le gesture del sistema; il dirupo dei 600 ms si può spostare in un punto qualsiasi perché la durata non deve più condividere il pollice con la direzione; e il primo tocco torna possibile perché il rilascio porta solo il tempo, non anche il bersaglio. §8.2 obietta che così non si mira e non si corre insieme — ma la macchina per risolverlo il documento **ce l'ha già scritta**: è la stessa regola dell'aftertouch, "mentre un disco è premuto la levetta pesa 0,5 sulla corsa". Applicala lì, dove serve, invece che dopo ogni calcio, dove danneggia.

Con quella modifica sola, e con il dirupo dei 600 ms spostato (peso massimo a 0,45 s, chiamata a 0,70 s), questo schema arriva a **7,5**. Per l'8 mancherebbe ancora un verbo per tenere la palla e uno per fermarsi subito.