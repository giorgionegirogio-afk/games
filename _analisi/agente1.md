I have the full inventory. Writing the report.

---

# TABELLA DEL DIVARIO — FC 25 → CALCETTO

**Base:** `C:\Users\Utenteee\Desktop\GitHub\games\CALCETTO-il-gioco.html`, 1.689.939 byte, 30.581 righe, letto in sola lettura. Nessun file modificato, nessun appunto scritto.

## 0. Due rettifiche alla premessa, prima di cominciare

**La minimappa non è toccabile.** Il compito la elenca fra i comandi di oggi. Nel codice `MINI_RECT` viene scritto da `drawMinimappa` (:25001) e letto in **quattro soli posti**, tutti di impaginazione dell'HUD (:25345, :25409, :25535, :28644): serve a non farci finire sopra altre scritte. `Touch5.start` (:8815-8850) risolve **solo** i due pulsanti di `touchBtnLayout` e lo stick; non esiste un ramo che confronti il tocco con il rettangolo della bussola. Nessun input legge la minimappa. Questo cambia la classifica finale: la superficie migliore del gioco è disegnata ogni fotogramma e non fa niente.

**I gesti sono più di tre.** Oltre a tiro-col-timing, scivolata e cross ci sono: lo **sprint** (levetta oltre `STICK_SPRINT`=66 px, :8664-8669 — non è un tasto, è un gesto), il **pallonetto** (sprint tenuto al rilascio del tiro, :9241), la **rovesciata** (TIRA con palla in discesa fra z 14 e 40 dentro l'area, :9210 e `finestraRovesciata` :9549), il **tiro al volo** (carica aperta prima che la palla arrivi, :10790-10801) e il **passaggio forte direzionale** (flick col pallone né verso porta né trasversale, :8945). Il vocabolario di CALCETTO è già più largo di quanto la premessa dichiari — il che rende il divario **più stretto in numero di verbi e più largo in cosa il gioco premia**, che è esattamente la tesi del committente.

---

## 1. Il metro: come distinguo «muore dall'alto» da «guadagna dall'alto», senza opinioni

Tre test, ciascuno con un numero o una regola presa dal file.

### Test A — la scala. *Il segnale dell'azione è di corpo o di campo?*

Costanti verificate: `P_R = 13` unità (:2950), `CARRY_DIST = 16` (:3074), `B_R = 8` (:2982, disegnato a 10,72 secondo `__test.pallaRaggio()`), `KICK_R = 26` (:3073), zoom `S2_MIN=1.00 / S2_BASE=1.25 / S2_MAX=1.53` px CSS per unità (:15730). Il punteggio del passaggio preferisce la distanza **170 unità** (`-Math.abs(len(q.x-p.x,q.y-p.y)-170)*0.4`, :9101): è la lunghezza modale di un passaggio in questo gioco.

| grandezza | unità mondo | px CSS a S2_BASE | px periferica (dSF 2) |
|---|---:|---:|---:|
| moto di un arto che *nomina* una finta | ~6 | 7,5 | 15 |
| corpo, da fianco a fianco (2·P_R) | 26 | 32,5 | 65 |
| palla davanti ai piedi (CARRY_DIST) | 16 | 20 | 40 |
| **passaggio modale** | **170** | **212** | **425** |
| campo in lunghezza (5v5, FW) | 1150 | 1437 | 2875 |

Il rapporto fra il segnale di campo e il segnale di corpo è **6,5×** (passaggio/corpo) e **28×** (passaggio/arto). Un'azione il cui contenuto informativo sta nei 15 px periferici di un arto compete, sullo stesso schermo, con eventi che ne occupano 425.

E non è un ragionamento a priori: **il progetto l'ha già misurato in cieco**. `PUNTO-DEL-LAVORO.md`, caso 14, registra tre provini ciechi in cui persone diverse riconoscevano **da zero a due pose su dieci** — e una posa è il corpo *intero*. Se il corpo intero è nominabile 0-2 volte su 10, il piede attorno a un pallone di 27 px periferici non è nominabile mai. Questo è il caso «muore».

### Test B — la ridondanza. *Il prodotto dell'azione è informazione già sullo schermo?*

Il gioco ha già scritto questa regola e la applica a sé stesso: `drawMinimappa` si **spegne** quando si vede almeno il 92% del campo — `if(quota>=0.92) return;` (:24893). Cioè: *quando l'informazione c'è, lo strumento per procurarsela è rumore.*

Una parte consistente del vocabolario di FC 25 esiste per **compensare la camera dietro il giocatore**, che nasconde metà campo e comprime la profondità: fermati-e-guarda-la-porta, cambio a icona come surrogato del radar, call for support, rush to contain. Il loro prodotto non è un vantaggio di gioco: è *sapere dove sono gli altri*. Dall'alto quel prodotto è già consegnato. Questo è il caso «ridondante», e va tenuto distinto da «muore»: non è che non si vede — è che non serve.

### Test C — la responsabilità. *L'azione decide su uno spazio che il giocatore adesso VEDE?*

A 5 contro 5 si vedono 915/1,25 = **732 unità su 1150**, cioè il **64% della lunghezza** del campo. E le strutture su cui si decide **esistono già nella simulazione e sono in quadro**: l'ultimo uomo è tenuto a `FW*0.46` (:11700-11704), la punta staziona a `PUNTA_X = 0.70` (:11542), il raddoppio è un ruolo assegnato dal cervello di squadra (:11758-11770), la transizione dura 2,0 s dopo un ribaltamento (:11577).

Quando un'azione di FC 25 chiede una decisione **su questi oggetti**, dall'alto vale *di più* che in FC 25, perché in FC 25 la ordini alla cieca e qui la vedi riuscire o fallire nello stesso quadro in cui l'hai ordinata. Questo è il caso «guadagna».

**Prova indiretta che il metro è giusto, dal file stesso:** la punizione-duello **abbandona la vista dall'alto**. Il tiratore si disegna «di spalle (yaw ~0)», «dietro e sotto il pallone» (:27087-27091). Il gioco ha già dovuto ammettere che mirare in una bocca di porta è un compito da camera dietro. Ogni azione di FC 25 il cui contenuto è *mirare a un bersaglio verticale* eredita quel problema; ogni azione il cui contenuto è *scegliere un punto del piano* no.

**Legenda dei verdetti:** **MUORE** (segnale di corpo, invisibile a questa scala) · **RIDONDANTE** (il suo prodotto è informazione già data) · **NEUTRO** (indifferente alla camera) · **GUADAGNA** (vale più dall'alto che in FC 25) · **IMPOSSIBILE** (chiede input o regole che questo gioco non ha e non deve comprare)

---

## 2. MOVIMENTO

| azione FC 25 | a cosa serve davvero in partita | in CALCETTO | senso dall'alto a 91 px — perché |
|---|---|---|---|
| **Sprint** | cambiare marcia per arrivare primo; il prezzo è fiato e controllo | **SÌ** — `humanSprint` :8665; consumo 26/s, recupero 11-18/s, sotto il 25% di fiato si perde fino al 14% di passo (:10374-10378) | **NEUTRO ma monco.** In FC lo sprint *allarga il tocco*. Qui `CARRY_DIST` resta 16 fisso (:10651): lo sprint costa fiato e **non costa palla**. Vedi Knock-on |
| **Scudo (shield)** | mettere il corpo fra palla e avversario, comprare due secondi, aspettare l'appoggio: è IL verbo della SICUREZZA | **PARZIALE E NASCOSTO** — il furto col corpo è già dimezzato (`stealP*=0.55`) se il ladro arriva dal verso in cui il portatore guarda (:10670). Non comandabile, non insegnato, non disegnato | **GUADAGNA.** L'orientamento del corpo è una **rotazione nel piano dello schermo**: è la sola grandezza di corpo che questa camera misura bene (il gioco già la scrive, `p.fx/p.fy` :9019). In FC lo scudo si legge dalla schiena; qui si legge dalla direzione della figura. La fisica è scritta: manca il comando |
| **Jockey** | contenere senza affondare, tenendo il corpo sulla linea palla-porta | **NO** per l'umano. **PARZIALE** per la CPU: `contieni` + `standoff` (:11726-11740) | **GUADAGNA.** Il jockey copre una *linea*; dall'alto la linea palla-porta e la linea di passaggio sono visibili e la copertura è verificabile a colpo d'occhio. Nella camera dietro il jockey si fa a sentimento |
| **Primo tocco** | il controllo decide se il pallone ricevuto è un vantaggio o un pallone vagante | **NO** — la raccolta è un cancello binario: `d<KICK_R*0.8` (20,8 unità) e `sp<420` oppure sei il destinatario (:10822-10832). Nessun errore, nessun attributo | **GUADAGNA** (come conseguenza, non come comando). Un tocco lungo è una **distanza orizzontale**: si vede. È il modo più economico di far esistere il pilastro SICUREZZA — rende costoso ogni passaggio senza aggiungere un tasto |
| **Knock-on** | guadagnare metri accettando di staccare la palla dai piedi | **NO** | **GUADAGNA.** È letteralmente una distanza sul piano del campo, la grandezza che questa camera rende meglio. Oggi la sola cosa che si vede dello sprint è la velocità; il rischio è invisibile perché non c'è |
| **Primo tocco controllato / effort touch** | stoppare bene sotto pressione pagando in lentezza | **NO** | **GUADAGNA solo dentro il primo tocco.** Come comando separato è un tasto in più per un delta di pochi pixel: non paga |
| **Fermati e guarda la porta** | nella camera dietro serve a **orientarsi**: fermi la palla e ruoti la vista per capire dove sei | **NO** | **RIDONDANTE — è il caso di scuola.** Il suo prodotto è informazione, e la porta è già in quadro. Il gioco applica già questa regola a sé stesso spegnendo la bussola al 92% di campo visibile (:24893) |
| **Strafe dribble** | muoversi tenendo il busto rivolto altrove (secondo stick) | **NO** | **IMPOSSIBILE + MUORE.** Serve un secondo stick che non c'è. E il suo segnale è la **dissociazione fra busto e gambe**: dall'alto a 42° si legge la direzione della *figura intera*, non la torsione interna. È la distinzione che salva lo scudo e condanna lo strafe |
| **Agile dribbling** | tocchi corti e rapidi per cambiare angolo in spazio stretto | **NO** — il pallone è incollato con una molla a 14/s a 16 unità (:10651-10652); la manovrabilità non cambia mai | **Sostanza GUADAGNA, forma MUORE.** Raggio di sterzata e distanza del tocco sono grandezze del piano: visibili. I *tocchi* non si vedono. Conclusione: adottare **l'effetto** (sotto una certa velocità `CARRY_DIST` scende a ~10 e la rotazione è più rapida), non il gesto |
| **Sprint controllato** | correre forte tenendo la palla vicina, pagando in accelerazione | **NO** | È il rovescio del knock-on: **ha senso solo dopo** il knock-on. Senza, non c'è niente da controllare |
| **Ferma palla** | inchiodare per far scivolare via il difensore lanciato | **PARZIALE** — il tap sotto `TAP_T` calcia a 300 (:9226-9231): è un appoggio, non un arresto | **GUADAGNA.** L'arresto è un cambio di velocità sul piano, e il difensore che ti supera **lo vedi passare oltre**: è la manovra «superare l'uomo» più leggibile a questa scala, perché la conseguenza è una separazione di 40-80 unità fra due corpi |
| **Jostle in aria** | contendere il colpo di testa | **NO** — non esiste colpo di testa; sopra `Z_SOPRA_TESTA=26` la palla non si controlla (:10825) e il cross è calibrato per ricadere **sotto** quella quota (:9185) | **MUORE.** Il duello aereo è un evento sull'asse **Z**, l'unico asse che una camera a 42° comprime. Il gioco ha già dovuto inventare l'ombra staccata per far capire la quota: aggiungere una gara di quota su 26 unità è chiedere allo schermo la sola cosa che non sa dire |

---

## 3. PASSAGGI

| azione FC 25 | a cosa serve davvero | in CALCETTO | senso dall'alto — perché |
|---|---|---|---|
| **Raso terra (base)** | tenere il possesso; il verbo più frequente della partita | **SÌ ma totalmente assistito.** `eseguiPassUmano` (:9090-9114) sceglie il bersaglio con un punteggio (apertura, −260 se un avversario è sulla linea, +0,9 per unità di avanzamento, distanza comoda 170) e la velocità è `clamp(300+l*0.9, 320, 520)`. **Non legge la levetta** | **NEUTRO come esistenza, ma è il buco più grande del gioco.** Un passaggio senza peso e senza bersaglio scelto non è una decisione: non esiste opzione sicura *contro* opzione ambiziosa, esiste «passaggio». Dall'alto il giocatore **vede tutte le linee**: negargli la scelta è togliergli l'unica cosa che la camera gli regala |
| **Filtrante** | colpire lo spazio dietro la difesa prima che si chiuda: il verbo dello SPAZIO | **SÌ**, mirato con la levetta (`dot>0.5`, parità risolta dallo smarcamento), lead 0,55, 420-640 u/s, rasoterra forzata (:9127-9180) | **GUADAGNA, ed è già la cosa migliore del gioco.** Dall'alto vedi insieme il corridoio e la linea dei difensori — e la linea **esiste davvero** (`ultimo` tenuto a `FW*0.46`, :11700). È l'unico posto dove CALCETTO già premia il pilastro SPAZIO |
| **Di fantasia (no-look / flair)** | passaggio identico più una posa, con un piccolo vantaggio di sorpresa | **NO** | **MUORE.** È un passaggio uguale più una posa, e le pose a questa scala sono nominabili 0-2 volte su 10 (provini ciechi, PUNTO-DEL-LAVORO caso 14). Costo del comando alto, delta invisibile |
| **A campanile / lofted** | scavalcare il pressing, cambiare zona | **PARZIALE** — la quota esiste solo come «finta» sui calci forti (`if(speed>=500) b.vz=min(130,(speed-460)*0.4)`, :9007) e sul cross. Nessun passaggio alto comandabile | **GUADAGNA.** Scegliere di scavalcare è la scelta fra **due percorsi visibili nello stesso quadro**: sotto (rischio intercetto, arrivo ai piedi) o sopra (sicuro, arrivo lento). Dall'alto entrambi i percorsi si vedono; dalla camera dietro no |
| **Cross** | portare la palla in area contro una difesa schierata | **SÌ ma a bersaglio fisso**: secondo palo, `lx=goalX∓55`, `ly=FH/2±GOAL_H*0.28`, volo T 0,5-0,75 s (:9187-9199) | **NEUTRO oggi; GUADAGNA se il punto d'atterraggio diventa mirabile** (primo palo / dischetto / secondo palo sono tre punti del piano, quindi visibili). **MUORE** invece tutta la parte FC che riguarda l'*attacco* del cross in salto, per il motivo del jostle |
| **Swerve a comando (effetto)** | aggirare un corpo o un portiere fermo | **PARZIALE** — `b.curve` esiste ma viene messa diversa da zero in **due soli posti**: il duello da fermo (`corner*150*pow`, :9362) e il tiro al volo perfetto (`±180`, :10805). Nel gioco in movimento non è comandabile | **NEUTRO/MUORE come gesto, GUADAGNA come traiettoria.** La curva è una **linea sul piano**: si vede benissimo. Ma comandarla chiede un asse in più. Meglio: la curva come *premio automatico* del tiro perfetto (già così) che come comando |
| **Di esterno** | angolo di partenza insolito | **NO** | **MUORE.** Segnale interamente di piede |
| **Driven** | passaggio teso, più veloce e meno preciso | **NO** — vedi «peso del passaggio»: la velocità c'è ma è calcolata, non scelta | **GUADAGNA.** Teso contro morbido è una differenza di *tempo di percorrenza* su una linea visibile: il giocatore può vedere se l'intercetto arriva prima |
| **Lobbed / lofted through** | filtrante alto sopra una difesa alta | **NO** — e il canale è **sprecato**: `doFiltrante(t, comeCross)` col modificatore attivo diventa cross **solo in metà campo offensiva** (:9130); nella propria metà il modificatore non fa niente | **GUADAGNA a costo zero di comando.** La difesa alta esiste (`ultimo` a `FW*0.46`) e si vede. Il gesto esiste già e nella propria metà è morto |
| **Precision pass (mira manuale)** | scegliere *tu* il destinatario, non l'assistenza | **NO** | **GUADAGNA più che in FC 25.** In FC il manuale è punitivo perché non vedi il destinatario; qui lo vedi. È l'esempio più netto di un'azione che la camera dall'alto *rende giusta* |
| **Pass-and-go** | passa e scatta: crea la sovrapposizione senza comandare il compagno | **NO** — dopo `eseguiPassUmano` il controllo resta sul passatore ma non c'è alcun automatismo, e `switchControlled` (:9973) tende a togliertelo perché passa all'uomo più vicino alla palla | **GUADAGNA.** È l'unico modo di far esistere il MOVIMENTO senza comandare nessun altro, e dall'alto la sovrapposizione **si vede formarsi**. Costo di comando: zero (sprint tenuto al rilascio del passaggio, canale libero) |
| **Dummy (lasciar scorrere)** | far passare la palla a un compagno alle spalle ingannando il difensore | **NO** | **GUADAGNA a metà.** È un evento di *traiettoria* (la palla prosegue), non una posa: si vede. Ma serve un terzo uomo sulla linea, e a 5 contro 5 con quattro compagni capita di rado. **Bassa frequenza = bassa profondità reale** |
| **Trigger run** | mandare un compagno nello spazio: **IL** verbo del pilastro MOVIMENTO | **NO.** I compagni si muovono solo per ruolo (`aiDecide` :11647-11720): ultimo, pressa, punta, raddoppio, libero. Non sono indirizzabili | **GUADAGNA più di qualunque altra azione della lista.** In FC 25 ordini una corsa che spesso **non vedi**. Qui vedi la corsa partire, vedi il difensore che non la segue e vedi il corridoio aprirsi: comando e conseguenza stanno **nello stesso quadro**. È l'azione con il miglior rapporto profondità/complessità dell'intero vocabolario |
| **Call for support** | chiamare un appoggio all'indietro | **NO** | **RIDONDANTE.** Metà del suo valore è informazione (dove sono i compagni: già in quadro) e metà è un compagno che si avvicina — che `aiDecide` fa già di suo tenendo l'ultimo uomo a 150 unità dal portatore (:11694-11701) |

---

## 4. TIRO

| azione FC 25 | a cosa serve davvero | in CALCETTO | senso dall'alto — perché |
|---|---|---|---|
| **Normale** | il tiro base | **SÌ** (`fireShot` :9308) | NEUTRO |
| **Col timing** | premiare la precisione del rilascio invece della statistica | **SÌ, ed è il cuore del gioco.** Finestra dolce 300 ms allargata fino a ±45 ms dalla tecnica (:9232-9233); da flick la fase è ancorata al **possesso** (`G.possT`, `FLICK_WIN0/1`, 450 ms su 900, :8912-8918) | **NEUTRO — e questa è la sua forza.** È l'unica meccanica del gioco **totalmente indipendente dalla camera**, perché il suo contenuto è il *tempo*. Non c'è pixel che possa tradirla. È il motivo per cui regge: qualunque cosa si aggiunga, il timing resta il pavimento |
| **A scavalcare (chip)** | superare il portiere in uscita | **SÌ** — pallonetto: sprint tenuto al rilascio, potenza 330-430, `vz` 175-205 (:9237-9256) | NEUTRO. La quota si legge male, ma il **risultato** (palla dietro il portiere) si legge benissimo |
| **Di precisione** | barattare potenza per angolo | **NO** — la potenza è già funzione di qualità e distanza (`tiroVelocita`, :9301-9303), ma non è una **scelta** | **GUADAGNA.** Dall'alto vedi il portiere *e* i due pali contemporaneamente: scegliere «piano ma nell'angolo» contro «forte ma centrale» è una decisione informata, non un dado. La mira alta/bassa esiste già a metà (`dy += my*260`, :9238) |
| **Potente** | forare il portiere di forza | **PARZIALE** — la potenza esiste, la scelta no | **NEUTRO.** Il gioco ha già risolto il problema vero (il tiro che non arrivava in porta) con `TIRO_ARRIVO`; un comando in più darebbe poco |

---

## 5. FINTE

| azione FC 25 | a cosa serve davvero | in CALCETTO | senso dall'alto — perché |
|---|---|---|---|
| **Finta di tiro** | far impegnare il difensore in un blocco o in una scivolata, e passargli accanto | **NO** | **GUADAGNA, contro l'intuizione.** Una finta funziona se il difensore legge una **preparazione**, e qui la preparazione **esiste già ed è di corpo intero**: `anticipa` mette il rig in `chargeClip='tiro'` per tutta la carica (:9441-9448), e la finestra dolce dura 300 ms (:3076). Una carica di corpo intero su 91 px è **la sola classe di segnale che i provini ciechi hanno riconosciuto qualche volta**. E l'annullamento è già scritto: `chiudiAnticipo` (:9450), già chiamato quando cambi idea (:9069, :9131) |
| **Finta di passaggio** | stessa cosa, più corta | **NO** | **GUADAGNA poco.** La preparazione del passaggio dura `PASS_CAR_U` (cinquanta millesimi lato umano, :9057-9062): sotto la soglia in cui un difensore possa leggerla. Il tell è troppo breve per essere una finta |
| **Finta di tiro in tiro** | incastro di due animazioni per battere il tempo del portiere | **NO** | **MUORE.** Il suo contenuto è interamente nell'incastro delle animazioni, cioè nella cosa che a 91 px non si distingue |

---

## 6. DIFESA

| azione FC 25 | a cosa serve davvero | in CALCETTO | senso dall'alto — perché |
|---|---|---|---|
| **Cambio uomo (auto)** | non restare mai col giocatore sbagliato | **SÌ** — `switchControlled` (:9973-9998), isteresi 0,2 s + margine 14 unità | NEUTRO |
| **Cambio manuale (ciclico)** | scorrere i compagni | **SÌ** — `cambiaGiocatore` ordina per **angolo attorno alla palla** e cicla (:9956-9970) | **RIDONDANTE nella forma.** Ciclare è un surrogato del non-vedere. Qui vedi tutti e dieci: ciclare in senso orario è il modo lento di fare una cosa che il dito farebbe in un colpo |
| **Cambio a icona** | prendere **quel** difensore, subito | **NO** | **GUADAGNA moltissimo, e la superficie è già disegnata e inutilizzata** (`MINI_RECT`, :25001/:25128). È l'azione che riscatta la camera dall'alto: in FC 25 l'icona esiste *perché* non vedi il campo; qui esisterebbe *perché* lo vedi |
| **Contrasto (in piedi)** | rubare senza andare a terra | **PARZIALE** — esiste il furto col corpo probabilistico (`stealP` 0,42 base, ×0,55 se arrivi di spalle, :10658-10678), ma **non è un comando**: succede camminando addosso. Il solo comando difensivo è la scivolata | **GUADAGNA.** Oggi la difesa umana ha **un solo verbo** e quel verbo mette il corpo a terra per `SLIDE_REC`. Un contrasto in piedi è la scelta «rischio poco, ottengo meno», cioè il pilastro SICUREZZA visto dall'altra parte |
| **Spinta / spallata** | spostare l'avversario dalla linea di corsa | **NO** | **Forma MUORE, effetto GUADAGNA.** L'animazione non si legge; la **traslazione** di un corpo di 26 unità sì. Valore medio, e rischia di rendere il contatto una gara di pressione del dito |
| **Steal tackle / rubata pulita** | togliere palla e ripartire nello stesso gesto | **SÌ, ed è la meccanica difensiva migliore del gioco**: pulita solo se sei sulla palla (`SLIDE_BALL_R * fatt(tackle)`), **di fronte** (`daDietro` via dot) e nella **prima metà** della finestra (`SLIDE_CLEAN`), con scatto di contropiede a 430 u/s (:10570-10586) | **GUADAGNA.** Le tre condizioni sono tutte geometria del piano — distanza, angolo, tempo — e dall'alto sono tutte e tre visibili prima di premere. È il modello da imitare per tutto il resto |
| **Fallo professionale** | spendere un giallo per fermare un contropiede | **PARZIALE** — falli, cartellini e inferiorità numerica di 12 s esistono (:10608-10620), il cumulo futsal al terzo fallo pure — ma **non c'è la scelta**: il «cattivo» è dedotto da angolo e ritardo, non deciso | **NEUTRO.** L'infrastruttura del prezzo c'è già; manca solo che sia una decisione. Basso costo, media resa |
| **Scivolata** | l'ultima risorsa, o il gesto che ribalta | **SÌ** (:9514, `startSlide`; flick sull'avversario o CONTRASTA) | NEUTRO |
| **Scivolata dura** | fermare a ogni costo | **PARZIALE** — vedi fallo professionale | come sopra |
| **Spazzata** | mandare via il pallone senza pretese | **NO come comando.** La scivolata spazza *incidentalmente* i palloni liberi (`b.vx=p.slideDX*380`, :10629-10635) | **GUADAGNA.** Oggi per allontanare un pallone devi andare a terra. Dall'alto **vedi dove stai spazzando** — verso la fascia o in mezzo — e la differenza è una direzione, cioè un dato che questa camera consegna e la camera dietro no |
| **Spazzata tecnica** | spazzare *bene*, verso un compagno | **NO** | GUADAGNA, ma è un raffinamento della precedente: non merita un comando suo |
| **Contenimento** | vedi jockey | **NO** (umano) | **GUADAGNA** |
| **Contenimento del compagno (secondo uomo)** | mandare un compagno addosso al portatore mentre tu tieni la posizione | **NO per l'umano.** Ma il ruolo **`raddoppio` esiste già** nel cervello di squadra per le taglie 7 e 11 (:11758-11770) | **GUADAGNA.** Dall'alto vedi il raddoppio partire **e vedi il buco che lascia**: è una decisione con un costo visibile, che è la definizione di profondità. In FC 25 il buco non lo vedi, quindi il verbo è quasi gratis |
| **Pressing parziale** | alzare la linea per qualche secondo | **NO** — lo stato di squadra è automatico (`PRESSING`/`DIFESA` su `avanz<0.42`, :11570) | **GUADAGNA** ma chiede un comando di *squadra*, non di uomo: vedi Tattica |
| **Sprint jockey** | contenere arretrando in fretta | **NO** | Dipende dal jockey: non ha senso valutarlo prima |
| **Rialzarsi in fretta** | ridurre il tempo a terra | **NO** — `recover` è fisso (`SLIDE_REC`; 0,30 dopo il tuffo del portiere) | **MUORE come abilità** (un button-mash non si vede), **ma il tempo a terra si vede eccome**: è un uomo fermo per mezzo secondo su uno schermo dove tutto si muove. Meglio come *conseguenza* (la scivolata sbagliata costa di più) che come comando |
| **Uscita del portiere (comandata)** | chiudere l'angolo in un uno-contro-uno | **NO** — il portiere esce da solo sulla bisettrice (`updateKeeper` :10869+; lettura del tiro su un **orario**, `GK_LETTURA=0.62 s`, non su una distanza) | **GUADAGNA.** La geometria dell'uscita — quanto angolo copri uscendo — è un fatto **planare**, e dall'alto è l'unico posto del calcio in cui si vede davvero. Nella camera dietro l'uscita è un atto di fede |
| **Rush to contain** | mandare avanti il compagno più vicino | **NO** | **RIDONDANTE** con il raddoppio comandato: sono lo stesso verbo, e uno solo dei due va comprato |

---

## 7. PORTIERE

| azione FC 25 | a cosa serve davvero | in CALCETTO | senso dall'alto — perché |
|---|---|---|---|
| **Rinvio** | ripartire | **SÌ** — `rinvioPortiere` sceglie il compagno più avanzato e libero, 470 u/s con `vz` 90 (:11101-11120). Automatico | NEUTRO |
| **Lancio / lancio teso / palla a terra / rinvio teso** | scegliere *come* ripartire: veloce e rischioso o lento e sicuro | **NO** — c'è un solo rinvio, e non è una scelta | **GUADAGNA.** È il pilastro SICUREZZA nel punto in cui costa di più sbagliare, e dall'alto vedi tutte e quattro le opzioni contemporaneamente. Ma la frequenza è bassa: nella gabbia si riparte dal fondo solo sulla palla sopra la traversa (`ballOverBar`, :11223) |
| **Presa** | trattenere invece di respingere | **SÌ** — `tentaPresa` per contatto durante il tuffo (:10904) | NEUTRO |
| **Muovi il portiere** | spostarlo prima del tiro | **PARZIALE** — solo nei rigori e nel duello (`s.keeperHuman`, :11972); nel gioco corrente no | **NEUTRO.** Nel gioco corrente sarebbe un secondo uomo da comandare con un pollice già occupato |
| **Copri il palo lontano** | correggere la posizione sulla bisettrice | **NO** | **RIDONDANTE.** In FC serve perché non vedi la geometria; qui il gioco la calcola bene da solo e tu la vedi |

---

## 8. PALLA FERMA

| azione FC 25 | a cosa serve davvero | in CALCETTO | senso dall'alto — perché |
|---|---|---|---|
| **Punizioni con mira e reticolo** | il momento in cui l'abilità individuale decide da sola | **SÌ, ed è un duello a due**: il tiratore trascina il dito sulla porta, ferma la barra, il portiere ondeggia, accenna finte e sceglie di nascosto (:2818, `drawDuelScene` :27085+) | **Caso speciale, e istruttivo: il gioco cambia camera.** Il tiratore si disegna **di spalle**, «dietro e sotto il pallone» (:27087-27091). Cioè CALCETTO ha già ammesso che *mirare in una bocca verticale* è un compito da camera dietro. Questo giustifica il metro del §1 meglio di qualunque mio argomento |
| **Muro che salta o carica** | seconda variabile del duello | **NO** — verificato: nessuna barriera. Le 104 occorrenze di «muro» nel file sono muri veri o muri di testo | **NEUTRO/GUADAGNA poco.** Aggiunge una variabile a un momento che ne ha già due (mira + potenza contro lettura del portiere), e costa disegno in un'inquadratura già affollata |
| **Rigori con mira e portiere che si muove** | la lotteria resa abilità | **SÌ** (`avviaRigori` :10471, `rigoriDecisivi` :8282, portiere umano che sceglie il tuffo) | NEUTRO |
| **Corner con ruoli dichiarati** | organizzare l'area su palla inattiva | **NO, e strutturalmente impossibile**: le sponde sono il clamp su FW/FH e la palla non esce mai (:2910) | **IMPOSSIBILE per scelta di identità, non per limite.** La gabbia è ciò che tiene il ritmo: togliere le sponde per guadagnare i corner significa comprare una fase statica pagandola con la sola cosa che fa sembrare vivo un campetto da telefono |
| **Rimesse** | ripartenza laterale | **NO** — dichiarato nel file: «nessuna rimessa, a nessuna taglia» (:2910) | **IMPOSSIBILE**, stessa ragione. È una rinuncia consapevole, non un divario |

---

## 9. SKILL MOVE e TATTICA

| azione FC 25 | a cosa serve davvero | in CALCETTO | senso dall'alto — perché |
|---|---|---|---|
| **Skill move (60+, stick destro)** | superare l'uomo in uno spazio di due metri; e vendere il gioco nei trailer | **NO** (zero occorrenze) | **MUORE due volte.** (a) **Input**: non c'è un secondo stick e non deve essercene uno — il pollice destro è già la colonna TIRA/FILTRANTE, e il file documenta che quei due dischi sono l'unico posto rimasto dopo il conto sulla bocca della porta (:8715-8760). (b) **Uscita**: il segnale che *nomina* una skill move è un moto d'arto di ~6 unità = **15 px periferici**, contro i 425 di un passaggio. Il rapporto è 28:1, e i provini ciechi del progetto dicono che perfino il corpo intero è nominabile 0-2 volte su 10. Una skill move a cinque stelle qui produrrebbe **un tremolio** — e costerebbe una libreria di animazioni sul file più pesante che il gioco possa permettersi |
| **Tattica sul dpad (~20 combinazioni)** | cambiare il comportamento di dieci uomini con un gesto | **PARZIALE nell'infrastruttura, assente nel comando.** Esistono i moduli per taglia in frazioni di campo (:2919-2932), sei stati di squadra automatici — CONTESA / COSTRUZIONE / ATTACCO / DIFESA / PRESSING / GESTIONE (:11569-11580) — e ruoli riassegnati ogni 1,5 s. Nessuno di questi è comandabile | **GUADAGNA in linea di principio, ma è la peggiore compera per unità di complessità.** La forma della squadra è la cosa che questa camera mostra meglio in assoluto. Ma un dpad non c'è, i canali liberi sono sei e ognuno speso qui vale dieci uomini che cambiano insieme — cioè la modifica **meno leggibile** per il giocatore, che vede accadere tutto e non sa quale sua azione l'ha causata. Ottimo in un menu di preparazione; pessimo sotto il pollice |

---

## 10. Il conto del pollice: quanto spazio di comando resta davvero

Prima di classificare, il bilancio — perché la domanda è profondità **per unità di complessità**, e serve sapere qual è il denominatore.

**Speso oggi:** 6 tasti per giocatore (`KMAP` :8591-8593: pass, shot, slide, sprint, swap, thr) e, sul touch, 1 levetta + 2 dischi contestuali + 7 stati di flick + 3 varianti di tiro risolte per contesto.

**Libero, e verificato riga per riga:**

| # | canale | prova che è libero |
|---|---|---|
| 1 | **Durata della pressione sul disco piccolo** | `doFiltrante` parte al `touchstart` (:8829); `Touch5.end` gestisce il rilascio **solo** per `act==='shot'` (:8862-8864). Il rilascio del piccolo non è letto da nessuno |
| 2 | **La levetta al momento del passaggio** | `doPass`/`eseguiPassUmano` (:9063-9114) non chiamano mai `humanMove`. Il passaggio **ignora completamente** la direzione del dito — mentre `eseguiFiltrante` la legge (:9147) |
| 3 | **Sprint tenuto al rilascio del passaggio** | usato solo al rilascio del *tiro* (:9241) e come modificatore del filtrante (:8829). Sul passaggio, niente |
| 4 | **Doppio tocco** su uno dei due dischi | nessuna occorrenza nel file |
| 5 | **Flick all'indietro col pallone** | cade nel ramo generico «passaggio forte in direzione» (:8945): uno slot direzionale sprecato |
| 6 | **La superficie della minimappa** | `MINI_RECT` letta solo da 4 controlli di impaginazione; nessun percorso d'input |

Sei canali. La classifica li spende.

**Codice di costo del comando:** **0** = nessun gesto nuovo (contesto puro, o modello di conseguenza) · **1** = un modificatore nuovo su un gesto che c'è · **2** = una superficie o un gesto nuovi.

---

## 11. LE 15 — massimo di profondità per unità di complessità di comando

| # | azione | cosa compra (in termini dei quattro pilastri) | costo comando | canale | costo macchina |
|---:|---|---|:---:|---|---|
| **1** | **Peso e mira del passaggio** — la levetta sceglie la direzione, la durata sceglie la velocità dentro il clamp 320-520 già esistente | **SICUREZZA.** Oggi l'azione più frequente del gioco non è una decisione: un punteggio sceglie il bersaglio e una formula sceglie la potenza. Con il peso nascono per la prima volta «sicuro» e «ambizioso» — e dall'alto **vedi entrambe le linee** | **0** | 2, 3 | nullo: due letture di variabili già calcolate |
| **2** | **Chiamata in profondità (trigger run)** — tieni il disco piccolo: il compagno più avanzato scatta nello spazio | **MOVIMENTO** — il pilastro oggi **interamente assente**: `aiDecide` posiziona per ruolo e nessun compagno è indirizzabile. È l'azione che guadagna di più dall'alto in tutto il vocabolario, perché comando e conseguenza stanno nello stesso quadro | **1** | 1 | un campo per giocatore + un ramo dentro `aiDecide`, che gira già per ogni uomo. Trascurabile su ≤22 entità |
| **3** | **Primo tocco con errore** — la raccolta smette di essere un cancello binario e dipende da `tecnica`, velocità della palla e pressione | **SICUREZZA.** Rende costoso *ogni* passaggio senza aggiungere un tasto, e il costo è una **distanza orizzontale**: si vede. È la modifica che fa esistere il pilastro con zero comandi | **0** | — | nullo: sostituisce un `if` con un `if` (:10826) |
| **4** | **Knock-on sullo sprint** — `CARRY_DIST` sale da 16 a ~26 in corsa piena, e sotto una certa velocità scende a ~10 | **SUPERARE L'UOMO + SICUREZZA.** Dà allo sprint un prezzo **visibile** — oggi ne ha uno solo, il fiato, che è un numero in un angolo. Il divario palla-piedi è la grandezza che questa camera rende meglio in assoluto | **0** | — | nullo: `CARRY_DIST` diventa una funzione di `len(p.vx,p.vy)` in una riga già eseguita (:10651) |
| **5** | **Scudo (proteggere palla)** — fermo o lento con la levetta opposta all'avversario più vicino: il moltiplicatore 0,55 già scritto sale, e la cosa **si disegna** | **SICUREZZA.** La fisica **esiste già** (:10670) e nessuno la vede né la può usare apposta. È l'unica azione di corpo che sopravvive a 91 px, perché il suo segnale è una rotazione nel piano dello schermo | **0** | — | nullo per la simulazione; il costo è **il disegno dell'indicatore** |
| **6** | **Contenimento (jockey)** — tenere CONTRASTA invece di battere: contieni a velocità ridotta restando fra palla e porta, senza andare a terra | **Difesa.** Oggi la difesa umana ha **un solo verbo** e quel verbo mette il corpo a terra. La linea che copri è visibile dall'alto: la copertura diventa verificabile invece che intuita. La CPU ce l'ha già (`contieni`, :11726) | **1** | 1 (sul disco grande, oggi solo tap) | nullo |
| **7** | **Cambio a icona sulla minimappa** — tocchi l'uomo sulla bussola, lo prendi | Riscatta la camera. In FC 25 l'icona esiste **perché non vedi**; qui esisterebbe **perché vedi**. E sostituisce il ciclo orario di `cambiaGiocatore` (:9960), che è il modo lento di fare una cosa immediata | **2** | 6 | un hit-test per `touchstart` contro un rettangolo già calcolato. Nullo |
| **8** | **Finta di tiro** — durante la carica, il disco piccolo annulla | **SUPERARE L'UOMO.** La preparazione di corpo intero esiste già (`chargeClip`, 300 ms di finestra) ed è la sola classe di segnale che a questa scala i provini ciechi abbiano riconosciuto. `chiudiAnticipo` è già scritto e già chiamato (:9450) | **1** | — (riusa il piccolo dentro uno stato) | nullo |
| **9** | **Raddoppio comandato** — tieni CAMBIO: il secondo uomo più vicino pressa, tu tieni la posizione | **Difesa con costo visibile.** Il ruolo `raddoppio` esiste già (:11758-11770) ma solo per le taglie 7/11 e solo automatico. Dall'alto **vedi il buco che lascia**: una decisione con un prezzo visibile è la definizione di profondità | **1** | 1 (sul piccolo, in fase difensiva) | un ramo in `teamBrain`, che gira a **4 Hz** (`BRAIN_HZ=0.25`). Trascurabile |
| **10** | **Filtrante a scavalcare** — sprint + FILTRANTE **nella propria metà** diventa il filtrante alto (oggi lì il modificatore non fa niente, :9130) | **SPAZIO.** La difesa alta esiste davvero (`ultimo` a `FW*0.46`) e si vede. Un gesto già imparato, in un posto dove oggi è morto | **0** | contesto puro | nullo |
| **11** | **Pass-and-go** — sprint tenuto al rilascio del passaggio: il passatore parte, e `switchControlled` non gli toglie il controllo per 0,75 s (il lock esiste già, `G.swLock`, :9965) | **MOVIMENTO senza comandare nessun altro.** Dall'alto la sovrapposizione **si vede formarsi**. Complementare al n.2: uno muove il compagno, questo muove te | **0** | 3 | nullo |
| **12** | **Uscita comandata del portiere** — doppio tocco su CAMBIO in fase difensiva vicino alla propria area | Chiude l'uno-contro-uno, che qui è **frequente** perché la punta staziona a `PUNTA_X=0.70`. L'angolo che copri uscendo è un fatto planare: l'unica camera che lo mostra è questa | **1** | 4 | nullo: forza un bersaglio dentro `updateKeeper` |
| **13** | **Ferma palla** — flick **all'indietro** col pallone: arresto secco invece dell'appoggio a 300 di oggi | **SUPERARE L'UOMO.** Il difensore lanciato **lo vedi passare oltre**: 40-80 unità di separazione fra due corpi, cioè un evento da 50-100 px periferici. Occupa uno slot direzionale oggi sprecato | **1** | 5 | nullo |
| **14** | **Spazzata comandata** — disco grande **senza palla, palla libera nel proprio terzo**: spazzi nella direzione della levetta | Toglie l'obbligo di andare a terra per allontanare un pallone. Dall'alto **scegli dove** spazzare — fascia o mezzo — e la differenza è una direzione visibile | **0** | contesto puro | nullo: la spazzata incidentale esiste già (:10629) |
| **15** | **Tiro di precisione** — levetta tenuta verso un palo al rilascio: meno potenza, più angolo, dentro `tiroVelocita` già esistente | Trasforma il tiro da «timing» a «timing **e** scelta». Dall'alto vedi portiere e pali insieme: è una decisione informata. La mira verticale c'è già a metà (`dy += my*260`, :9238) | **1** | — (estende la lettura già fatta al rilascio) | nullo |

**Undici delle quindici costano zero o un modificatore, e nessuna chiede una superficie nuova tranne la n.7 — che usa una superficie già disegnata.**

### Il costo vero, dichiarato come chiede la regola 5

I comandi sono gratis; **la loro leggibilità no.** Ogni azione di questa lista ha bisogno di un segno sullo schermo — la freccia della corsa chiamata, l'anello dello scudo, la posa del contenimento, il lampo del primo tocco sbagliato — e quei segni cadono nella stessa fascia di 64 px in basso che il file documenta come già contesa fra bussola, tutorial e i due dischi (:8760, :15621, :25345). Fino a dieci indicatori per fotogramma su un canvas che il progetto ha già dovuto proteggere con una «regola di scarto». **La spesa non è la CPU della decisione: è il quadro.** Chi implementa questa lista deve misurare l'occupazione dell'interfaccia prima del tempo per fotogramma.

### Cosa ho lasciato fuori dalle 15, e perché

- **Skill move**: manca il secondo stick e mancano i pixel. Argomento al §9.
- **Corner e rimesse**: la gabbia è identità, non limite. Comprarli costa le sponde, cioè il ritmo.
- **Colpo di testa e duello aereo**: vivono sull'asse Z, il solo che questa camera comprime.
- **Tattica sul dpad**: la modifica più potente e la meno leggibile — dieci uomini che cambiano insieme senza che il giocatore sappia perché. Va in un menu, non sotto il pollice.
- **Muro sulla punizione**: aggiunge una terza variabile a un momento che ne ha già due, in un'inquadratura affollata.
- **Fallo professionale come scelta**: l'infrastruttura del prezzo c'è già (cartellini, 12 s di inferiorità, cumulo futsal); è buono ma frutta meno dei quindici sopra.
- **Fuorigioco**: non esiste nel gioco (verificato: zero occorrenze funzionali). Senza fuorigioco metà del pilastro SPAZIO di FC 25 non ha un bersaglio — ma introdurlo in una gabbia da futsal sarebbe un corpo estraneo, e la linea che `ultimo` tiene a `FW*0.46` fa già il lavoro senza una regola.

---

## 12. Cosa NON ho verificato

Lo dichiaro perché è la regola 4 di casa.

1. **Non ho eseguito il gioco.** Nessun Playwright, nessuna cattura, nessuna misura sullo schermo. Tutti i valori in pixel del §1 sono **derivati** dalle costanti (`P_R`, `CARRY_DIST`, `B_R`, `S2_BASE`) e dal viewport dichiarato nel compito — non misurati. In particolare **non ho misurato i 91 px di altezza della figura**: l'ho preso dalla premessa, e l'unico riscontro nel progetto è `strumenti/silhouette.js:413`, che normalizza a «40 px, l'altezza nominale della figura» (= 80 px periferici a dSF 2), coerente con 91 a uno zoom sopra `S2_BASE` ma non uguale.
2. **Non ho misurato il costo per fotogramma di nessuna proposta.** La colonna «costo macchina» è una stima ragionata sul lavoro algoritmico (numero di entità, frequenza di chiamata), **non una misura**. Chi la usa come numero commette il ventitreesimo caso.
3. **Non ho verificato il vocabolario di FC 25** contro la documentazione EA: ho preso per buona la lista del compito.
4. **Non ho riverificato i provini ciechi** (0-2 pose su 10) né i numeri delle onde: li ho letti in `PUNTO-DEL-LAVORO.md`, che è il registro del progetto, non una misura mia.
5. **Non ho controllato le taglie 7 e 11 riga per riga.** Ho verificato che `KPASSO` e `ATTR_K` scalino le distanze assolute e l'attrito, e che `punta`/`raddoppio` esistano solo da 7 in su (:11758, :11772). Non ho verificato che ognuna delle 15 proposte si comporti bene su campo grande — in particolare la n.2 (chiamata in profondità), dove con nove liberi la scelta di *quale* compagno mandare diventa un problema che a 5 contro 5 non esiste.
6. **Non ho verificato il comportamento in 2 giocatori** (schermo diviso) per nessuna proposta. Il canale 6 (minimappa) è quello a rischio: in `G.mode===2` `teamOf` divide per metà schermo (:8812) e c'è una sola bussola.