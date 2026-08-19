**VOTO: 6 / 10**

Sopra il "giocabile ma frustrante" per via delle rimozioni, che sono reali e verificate. Sotto la soglia commerciale perché l'azione più frequente della partita (il passaggio) diventa un compito di cronometro deciso al rilascio, e perché due dei gesti nuovi sparano da soli nei momenti in cui costano un gol. File letto: `C:\Users\Utenteee\Desktop\GitHub\games\CALCETTO-il-gioco.html`.

---

## LE TRE COSE MIGLIORI

**1. Le nove cancellazioni del §7.1 — e tre in particolare, che ho verificato riga per riga.**
`release()` a :8947 fa davvero partire un passaggio quando alzi il pollice; `touchcancel` è davvero cablato su `Touch5.end` (:8990 → :8961), quindi una notifica di sistema **tira in porta**; e il flick-tiro a :8904-8920 gira su una legge del timing *diversa* da quella del disco (`FLICK_WIN0/1` = 450 ms su `PULSE_T` 900, contro i 300 ms su `SHOT_HARDCAP` 1,25 di `releaseCharge` a :9234). Due economie non dichiarate per lo stesso verbo. Vale molto perché togliere è l'unica mossa a costo zero millisecondi e rischio d'equilibrio zero, e perché sopprime i tre canali che oggi producono un'azione **che il giocatore non ha chiesto**. Il guadagno di prestazione (`s.hist`, 14 oggetti per dito per fotogramma, :8867) è la mancia, non il motivo.

**2. Lo stato a zero dita è neutro, e il gioco resta giocabile col solo pollice destro.** È l'unica parte del progetto che parte da un numero sul mondo (49% una mano) invece che da un modello di gioco, ed è verificabile con la misura 1, che è l'unica delle quattro scritta bene: gruppi appaiati, stesso seme, e il contro-cancello 1b che vieta la scorciatoia ovvia. Chi legge il §6 capisce che qui si è progettato per l'autobus, non per la scrivania.

**3. Il riscontro vive dentro la finestra del gesto e sull'erba, non nella fascia contesa.** Il principio — anello, cono, compagno che parte mentre il dito è ancora giù — è la sola forma di scopribilità che non costa una schermata, e il vincolo "zero elementi nuovi nei 64 px in basso" è la cosa più matura del documento: il file dichiara da sé che quella fascia è satura (:8760-8764). Anche le sei carte che chiudono **sul fatto** e non sul cronometro sono corrette contro `Tut.steps` (:29120), che si spegne dopo 10 s.

---

## LE TRE COSE CHE SI ROMPONO

### 1. La scivolata parte da sola, e parte contro l'uomo che non ha più la palla

Regola #18: rilasci A con la levetta oltre 46 nei 0,30 s precedenti, verso un avversario entro 140 unità nel cono ±40°. Il progetto dice che la "freschezza di 0,30 s" discrimina. Non discrimina niente: **mentre contieni (hold A) stai inseguendo un portatore, quindi la levetta è oltre 46 in modo continuo** — e il portatore che contieni è per definizione davanti a te, dentro 140 e dentro il cono. Le tre condizioni sono soddisfatte per costruzione dallo stato precedente.

Caso concreto: contieni il portatore sulla trequarti, lui appoggia indietro. Tu molli A per premere CAMBIO e prendere il difensore vicino al nuovo portatore. `startSlide` parte verso un uomo senza pallone, a distanza di contatto → fallo, e a 5v5 il fallo lì è una punizione dal limite. Il gesto che vuoi fare più spesso alla fine di un contenimento è **smettere di contenere**, e lo schema ha assegnato proprio a quello l'azione più punitiva del gioco. Serve un fronte, non uno stato: la levetta deve **attraversare** 46 dal basso durante la tenuta di A, e l'attraversamento deve essere più recente dell'inizio della tenuta.

### 2. Il passaggio è diventato un compito di cronometro, con confini invisibili e un quadrante da 31 px

Quattro esiti su un asse temporale, confini a 0,15 / 0,35 / 0,50 / 0,90. Tre difetti sovrapposti:

- **Latenza.** Oggi `doPass` parte al `touchstart` (:8828 → :9064, `PASS_CAR_U` = 0,05 s, verificato a :11897). Nel nuovo schema la banda si conosce solo al `touchend`, quindi l'azione più frequente della partita paga **133 ms di tap + 86-88 ms di catena tocco→fotone** prima che il piede si muova. Il progetto applica la regola del 4-5× al tiro (300 ms, 3,4×, e ci scrive due paragrafi di difesa) e **non la applica mai al passaggio**, dove la banda più stretta — filtrante, 0,35→0,50 — è **150 ms, cioè 1,7×**. Per il criterio del documento stesso, quella banda è fuori norma di quasi tre volte.
- **Il confine 0,35/0,50 non è monotono.** A 0,49 s esce un pallone teso raso terra sulla corsa; a 0,51 s esce un cross alto in area. Non è "più lontano e più rischioso": sono due palloni categorialmente diversi separati da 20 ms al bordo. La tesi centrale ("nessuna associazione da sbagliare, un solo asse") è falsa esattamente lì, e l'errore di confine temporale è *peggiore* dell'errore di associazione spaziale di Nacenta, perché il tempo non è visibile sul pollice.
- **Il quadrante non è leggibile.** `P_R` = 13 (:2950), quindi l'anello sta a 21 unità di mondo; allo zoom di riposo il file dichiara 26 unità = 39 px (:15913), cioè **1,5 px per unità**: raggio 31,5 px, circonferenza 198 px. La banda "filtrante" (140°-200°) è **33 px di arco percorsi in 150 ms**, ai piedi del giocatore, mentre due difensori chiudono. Il §4.1 si è vietato la fascia bassa e ha lasciato al riscontro un decimo dello spazio che la precisione richiesta pretende.

Caso concreto: 5v5, contropiede, vuoi il filtrante sulla punta che taglia. Tieni B, guardi l'anello (foveale, ai piedi, non in area), lasci tardi di 40 ms: esce un cross alto verso il secondo palo dove non c'è nessuno. Ripetuto tre volte in una partita, chiude il gioco.

### 3. Il §3.4a — «il prezzo dello scatto» — è aritmetica sul ramo sbagliato, e a Duro è inerte

La tabella (0,23 / 0,52 / 0,69, «tre volte») parte da `stealP = 0,42`. Ma :10658-10678 dice:

```js
let stealP=0.42;
if(G.cpu[q.team] && !G.cpu[o.team]) stealP=DIFF[G.diff].steal;
else if(!G.cpu[q.team] && G.cpu[o.team] && G.ctrl[q.team]!==qi) stealP=DIFF[G.diff].mateSteal;
if((q.fx*o.fx + q.fy*o.fy) > 0.5) stealP*=0.55;
```

Il caso descritto — **tu porti palla, la CPU ti pressa** — entra nel primo ramo, non nel default: `DIFF.steal` vale **0,45 / 0,72 / 1,00** (:9648-9655). Il 0,42 è il ramo opposto: è la probabilità con cui **il tuo** giocatore controllato ruba palla alla CPU. Conseguenze:
- **A Duro `stealP` è già 1,00**: il moltiplicatore `×(1+0,65·…)` non cambia un bit. La quarta misura («furto(scatto)/furto(passo) ≥ 2,5») è **matematicamente irraggiungibile** alla difficoltà su cui si giudica il gioco. A Normale il ventaglio reale è 0,72 → 1,00 (satura), cioè 1,39×, non 3×.
- Il `×0,55` non è "corpo fra palla e avversario": è il **prodotto scalare delle due facce**, cioè i due che corrono nello stesso verso — l'inseguimento da dietro, che è il caso dello **scatto**, non quello dello scudo. Lo sconto è attaccato al caso sbagliato e annulla il sovrapprezzo che dovrebbe contrastare.
- Il furto testa la distanza **avversario↔pallone** (`len(q.x-b.x,q.y-b.y) < P_R+B_R+1`), quindi allungare `CARRY_DIST` **modifica già** l'esposizione per geometria: frontalmente il pallone è 10 unità più vicino al difensore, da dietro 10 più lontano. Aggiungere sopra un moltiplicatore scalare **conta due volte di fronte e cambia segno alle spalle**.

Il documento chiama questa la misura «che protegge me dalla regola di casa numero due». È l'unica parte con dentro un errore di lettura del codice, ed è quella che regge la promessa di profondità.

---

## COSA COSTA (risposta breve)

- **Il cono no, i pixel sì.** A 1,5 px CSS/unità e dpr 2, il cono a tenuta piena (600 unità) ha **1800 px di periferica di raggio** su uno schermo largo 1830: un settore da 80° ritagliato al viewport è, di fatto, **una passata alpha a schermo intero per fotogramma**, che cresce di 12× durante la tenuta. Il conto per *chiamate di disegno* ("un arc e due lineTo") è quello sbagliato: qui si è limitati dal fillrate. Se il "filo luminoso" è `shadowBlur`, sono millisecondi a due cifre su Skia. Vincolare la punta del cono a ~260 unità e usare uno stroke invece di un fill risolve.
- **Il contenimento costa animazione, non input.** `p.contieni` a :11726 è un booleano casuale (0,55) che sposta un bersaglio dell'IA: non esiste nessun modello di jockey. Farlo per l'umano vuol dire **scollegare `p.fx,fy` dalla velocità** — e `fx,fy` è anche la direzione in cui `updateBall` mette il pallone (`o.x+o.fx*CARRY_DIST`) e la direzione di default di ogni calcio. Servono clip di camminata laterale e all'indietro che non esistono, e il §7.2 rifiuta esplicitamente la dissolvenza fra clip.
- **Le tre misure oggi non girano.** `__test.simulate()` (:30411) è un ciclo chiuso di `step()` senza iniezione d'input: non c'è modo di alzare le dita a metà possesso né di pilotare la levetta. Servono `__test.step(1)` e un canale di tocco sintetico.
- **Due cancelli sono verdi per costruzione.** Con σ = 12 px, il bordo della presa dell'altro disco sta a 101,61 − 44 = **57,6 px = 4,8σ**; su 18.000 campioni ci si aspettano ~0,02 colpi. 3b («0% di atto sbagliato») e 3d («0% di levetta sotto l'ombra di un disco», soglia a 58 px) passerebbero anche con una geometria molto peggiore. Non misurano la geometria: misurano σ.

## ALTRI BUCHI VERIFICATI (elenco secco)

- **`tocca A` con la palla non è definito** in nessuna riga della tabella 3.1. È il tasto che si pesta nel panico in area.
- **`tieni B` nello stato 3.2** (squadra in possesso, tu no) non è definito.
- **#19 raddoppio è un no-op a 5 contro 5**: il ruolo si assegna solo `if(TAGLIA>=7)` (:11606). Il §9 dichiara di non aver verificato 7 e 11; il buco è alla taglia predefinita.
- **L'etichetta mente a ogni passaggio.** `possessoTeam` legge `b.owner`, che è −1 per tutto il volo. Con isteresi 0,25 s e un volo tipico di 0,6 s, dopo ogni passaggio i dischi dicono CONTRASTA/CAMBIO per ~0,35 s: premi A per il tiro sul passa-e-vai e ottieni un contrasto con 0,22 s di `kickCd` proprio mentre la palla arriva. `b.passTo` è già scritto e risolverebbe il caso in una riga.
- **L'aftertouch (#13) falsifica la tesi.** «Nessun ingresso legge la velocità del dito» — l'aftertouch legge `rotazione(rad/s)`, cioè esattamente `touchmove` derivato, e sotto fusione degli eventi darà zero curva o uno scatto. In più `+= rot × 2,6 × 120` è per fotogramma: a 30 fps la palla curva la metà che a 60.
- **La deduplica a 120 ms (P3) uccide il cambio ripetuto.** Il cambio direzionale è l'azione che si martella: tap-guarda-tap. Il secondo tap entro 120 ms viene mangiato.
- **P9 è un'affermazione, non un meccanismo.** La levetta nasce su «tutto il resto della tela», `if(s.active) return` a :8856 ammette una sola levetta, e `teamOf` in 1P torna sempre 0. Un pollice destro che manca A e cade a 60 px dal centro **genera la levetta**, e da quel momento il pollice sinistro è morto e la mira dei passaggi la decide la mano dei tasti. Serve un confine: in 1P la levetta nasce solo per `x < VW·0,55`.

---

## LA SINGOLA MODIFICA CHE ALZEREBBE DI PIÙ IL VOTO

**Togliere il passaggio dall'asse del tempo e metterlo sull'asse di magnitudine che il pollice sinistro sta già tenendo. B torna a sparare al `touchstart`.**

Concretamente: `tocca B` esegue subito, e *quale* passaggio esce lo dice la banda della levetta nell'istante del tocco — morta → appoggio assistito, passo → passaggio pesato, corsa → filtrante, scatto → palla alta/cross. La tenuta di B conserva **una** funzione sola e senza confini: la chiamata in profondità.

Perché è la modifica con il rapporto migliore:
- restituisce al gesto più frequente della partita la latenza di oggi (0,05 s) invece di 133 ms + latenza di catena;
- elimina **tre confini temporali su quattro**, cioè tutta la classe di errori del difetto n.2, e con essi la necessità di leggere un quadrante da 31 px sotto pressione;
- la banda è già visibile senza guardare nulla: **è la velocità delle gambe del tuo giocatore**. Cammini → appoggio; scatti → palla lunga. È la stessa frase mnemonica del §1, resa in una grandezza che il giocatore vede in periferia invece che in un cronometro;
- il cono diventa lungo quanto la banda dice **subito**, quindi non c'è più la crescita a 600 unità durante la tenuta: sparisce anche il costo di fillrate del §"cosa costa";
- l'anello resta a servire **un solo** cliente, il tiro — che una tenuta ce l'ha per natura — e la promessa "un anello, una legge" del §7.1 riga 6 diventa vera invece che aspirazionale;
- la misura 2 diventa eseguibile senza tocchi sintetici a tempo sub-fotogramma: basta impostare la levetta e chiamare l'azione.

Il prezzo onesto: non puoi più fare un appoggio corto mentre scatti. È accettabile — è la stessa cosa che il calcio ti impedisce — e chi vuole l'appoggio corto rilascia la levetta per un fotogramma, che nello schema nuovo (stato a zero dita neutro) non costa più il pallone.