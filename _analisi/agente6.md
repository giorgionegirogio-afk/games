Ho letto le superfici meta dentro il file e ne ho misurate alcune dal vivo. Referto.

---

# CALCETTO contro FC 25 — tutto ciò che sta INTORNO alla partita

## 0. Metodo, e cosa non ho misurato

**Cosa ho fatto.** Lettura integrale delle 18 schermate overlay di `C:\Users\Utenteee\Desktop\GitHub\games\CALCETTO-il-gioco.html` (righe 2249–2887) e del codice che le riempie. Poi una **sonda dal vivo**, scritta apposta e lasciata nel progetto: `C:\Users\Utenteee\Desktop\GitHub\games\_meta-sonda.js` — server locale su porta libera, Chromium 915×412 dpr 2, apre ogni schermata dal suo bottone vero, conta bottoni e righe, gioca una partita, apre la pausa, chiude con `__test.forceWinMatch()` e legge il tabellino. È ripetibile con `node _meta-sonda.js`.

**Cosa NON ho misurato, e va scritto.**
- **FC 25 non l'ho aperto.** La colonna «FC 25» viene dal brief del committente e da conoscenza generale, non da una misura fatta oggi. Dove dico un numero di FC 25, è indicativo.
- Non ho provato l'APK su un telefono vero: tutto è misurato in Chromium su desktop.
- Non ho portato a termine né un torneo né una stagione: ho aperto le schermate, non ho verificato il ciclo completo di 14 giornate né la finale.
- Non ho provato la punizione-duello / i rigori (`#duel`, riga 2862) né un lettore di schermo vero.
- Non ho misurato i tempi di transizione fra schermate.
- Non ho fatto nessun provino cieco su queste superfici.

**Numeri di inventario, contati sul file:** 18 overlay; 80 `<button>` nel DOM; 5 `<input>`; 15 trofei (`ACH`, riga 6906); 8 campi (`FIELDS`, riga 6521); 8 divise (`KITS`, riga 6806); 5 articoli di negozio (`NEGOZIO`, riga 7048); 10 squadre CPU (`TOUR_POOL`, riga 6881); 20 punti in cui si accende un banner d'evento (`showBanner`, riga 6503); 14 punti di vibrazione (`buzz`, riga 6500).

---

## 1. La tabella, voce per voce

### 1.1 Menu e navigazione

| | |
|---|---|
| **FC 25** | Hub persistente con la squadra in 3D, tessere che ricordano dove eri, «continua» in evidenza, calendario e obiettivi settimanali in home, ricerca, navigazione a schede orizzontali |
| **CALCETTO oggi** | Splash → home con 6 voci + ingranaggio (righe 2330–2341). Il campetto gioca davvero dietro i pannelli (`drawMenuIdle`). **3 tocchi dal freddo al calcio d'inizio** (splash → GIOCA → 1 GIOCATORE), misurato. Voci del menu 128×67 px CSS (191 la primaria) su 915×412: bersagli larghi. La lavagnetta appesa mostra l'ultimo risultato |
| **Il divario** | La home è bella e muta: **non sa cosa stai facendo** — con un torneo e una stagione salvati in `SAVE.tour`/`SAVE.season` le due voci portano ancora i sottotitoli fissi «campionato a 8 · 14 giornate» e «tabellone a 8 · montepremi» (righe 2336–2337), scritti nell'HTML e mai riscritti dal codice |
| **Valore su telefono** | **ALTO.** Su telefono la sessione è di tre minuti: la prima cosa che deve stare in home è «riprendi da dove eri». Costa una riga in `aggiornaEroeHome` (riga 13644), non una schermata nuova |

### 1.2 Presentazione pre-partita

| | |
|---|---|
| **FC 25** | Ingresso in campo, formazioni, stadio, sorteggio, telecronisti che introducono il contesto, schermata tattica pre-fischio |
| **CALCETTO oggi** | `playWipe()` (riga 29016) + scritta «CALCIO D'INIZIO» + **targa dei due capitani per 1,7 s** con i due ritratti-figurina (`CAP_DUR`, riga 7822; disegno righe 28316–28400). Il capitano è il più forte dei suoi, deterministico (`scegliCapitani`, riga 7829) |
| **Il divario** | Non esiste un momento in cui si sappia **contro chi** si gioca e **cosa c'è in palio**: il nome della squadra avversaria e la sua forza (1–10, riga 6881) e il premio del turno esistono nei dati e non compaiono mai prima del fischio |
| **Valore su telefono** | **MEDIO.** Una targa di 1,7 s che dica «QUARTI · PONTE ROSSO · i favoriti, tirano da ovunque · +40» riusa dati e disegno già scritti. Ma allunga il tempo alla palla, che è già il cancello aperto a 2870 ms contro 2 s: si paga in avvio, non in fotogrammi |

### 1.3 Telecronaca e suono

| | |
|---|---|
| **FC 25** | Due telecronisti campionati, migliaia di righe contestuali, speaker dello stadio, cori di squadra reali, colonna sonora con licenze |
| **CALCETTO oggi** | **Tutto sintetizzato in WebAudio, zero byte di campioni** (`Audio5`, riga 7177): fischietto, calcio, sponda, palo, rete, scivolata, boato a tre strati con trombetta, coro a quattro voci scordate, swell, «tiro perfetto», tamburo della curva, beep, click. Folla reattiva alla vicinanza della porta (`crowdLevel`). Il jingle del menu è **un giro di 8 note ogni 460 ms, cioè 3,7 secondi in tutto** (righe 7343–7360). La telecronaca è testuale: 20 banner (`PALO!`, `TIRO PERFETTO!`, `TERZO FALLO: SI TIRA!`, `RIENTRA <squadra>`…) |
| **Il divario** | Non c'è **voce**, e per un gioco libero da copyright è la scelta giusta; ma non c'è nemmeno un sostituto della voce nei tre momenti in cui serve. E il giro di 3,7 secondi in home, dove uno resta anche un minuto, si sente **sedici volte** |
| **Valore su telefono** | **MEDIO-ALTO sull'ambiente, BASSO sulla voce.** Metà dei telefoni gioca in silenzio. Ma il jingle da 3,7 s è un difetto attivo: costa meno allungarlo a 24-32 note che aggiungere qualunque altra cosa |

### 1.4 Ripetizioni e moviola

| | |
|---|---|
| **FC 25** | Replay dopo ogni episodio, telecamere multiple, scrub avanti/indietro, salvataggio nella galleria, condivisione |
| **CALCETTO oggi** | Anello di 5 s a 20 Hz (`REC_HZ`, riga 24759) di cui si riproducono gli **ultimi 0,8 s, cioè 16 fotogrammi** (`avviaMoviola`, riga 24801). Rito in quattro tempi: bande che chiudono 0,17 s, nastro che rallenta da 0,70× a 0,34×, fermo sulla rete 0,34 s, uscita 0,24 s (riga 24812). Registra **anche le pose**, la carica del tiro e la rovesciata (righe 24766–24783) — dettaglio che quasi nessun concorrente ha. Si salta con un tocco. Interruttore nelle Preferenze. **Solo sul gol** |
| **Il divario** | La moviola c'è ed è curata, ma **non si può chiedere**: non esiste replay della parata, del palo, dell'occasione mancata, né un modo di rivedere il gol dalla schermata finale — e il nastro dura 0,8 s, cioè meno di un gesto |
| **Valore su telefono** | **MEDIO.** L'anello costa già memoria (5 s × 20 Hz × N giocatori); estenderlo alle parate costa poco perché il buffer c'è. Il replay a richiesta dalla fine partita costa un bottone e la conservazione di un nastro dopo `G.rec.length=0` (righe 9866, 9872) |

### 1.5 Festeggiamenti

| | |
|---|---|
| **FC 25** | 60+ esultanze, comandate dal giocatore, sbloccabili, con corsa verso la curva, la panchina, il compagno |
| **CALCETTO oggi** | La cosa meglio fatta di tutto il contorno. Fermo d'impatto di 110 ms, scossa, raggiera, coriandoli, rete che si gonfia (`colpoNelSacco`, riga 9660); **il sole cala per un secondo** e tutte le ombre del campo si allungano di 1,33× e girano di 4° (`solePiuBasso`, riga 9698); rallentatore a curva da 0,26× a 1,00× in 0,55 s; **ripresa dedicata in camera bassa per 1,8 s** con un cast di quattro figure — marcatore, portiere battuto, i due compagni più vicini (`avviaRipresa`, riga 27490). Il marcatore sceglie fra **3 gesti**, i compagni fra **4**, tutto deterministico (righe 24077–24101) |
| **Il divario** | Non si sceglie e non si sblocca: **l'esultanza non è mai una ricompensa**, mentre in un gioco offline è la ricompensa più economica che esista (nessun bilanciamento da rifare, nessun oggetto che tocca la fisica) |
| **Valore su telefono** | **ALTO come vetrina, MEDIO come gioco.** Le clip di posa esistono già (`poseEsultanza`, riga 4935). Legare 3-4 esultanze ai trofei costa una voce in `SAVE` e un ramo in `clipDi` — non costa un fotogramma in più |

### 1.6 Fine partita e statistiche

| | |
|---|---|
| **FC 25** | Tabellino a schede, mappa dei tiri, pagelle per giocatore, uomo partita, momentum, condivisione, «gioca di nuovo» |
| **CALCETTO oggi** | Segnapunti di compensato con `aria-label` del risultato; verdetto in corpo grosso; **barra del possesso nelle due tinte** (tace sotto 180 campioni, `POSSESSO_MIN` riga 2943); **tabellino dei marcatori con minuto, volto e nome**, autorete gestita a parte, riga dei rigori decisivi, e se i conti non tornano **l'elenco non si mostra affatto** (righe 8083–8140); fino a 11 righe di numeri con le righe a 0-0 tolte; ripartizione delle monete con conteggio animato. Due bottoni: RIVINCITA / MENU |
| **Il divario** | **Il conto non torna a schermo, e l'ho misurato.** Partita vinta 1-0 partendo da 0 monete: la ripartizione elenca `+10 +25 +5 +6 = +46`, la riga sotto dice **`SALDO: 156`**. I 110 mancanti sono i premi di due trofei (SARACINESCA +50, MAI UN FALLO +60) che arrivano da `unlockAch` **dopo** che `gain` è stato sommato ma **prima** che `saldo` venga letto (`applyMatchRewards`, righe 8362–8380): non è un artefatto del gancio di collaudo, è l'ordine del codice. L'unico avviso sono i toast, che durano 3,2 s e **si buttano via oltre i tre in coda** (`toast`, riga 29094) |
| **Valore su telefono** | **ALTO.** È la schermata che si guarda per intero a ogni partita e quella che si condivide. Il difetto contraddice per intero la regola di casa già scritta nel file due righe sopra — «un tabellino che non torna è peggio di nessun tabellino». Costa due righe: aggiungere i trofei a `br` |

### 1.7 Progressione e carriera

| | |
|---|---|
| **FC 25** | Carriera allenatore e giocatore, mercato, morale, infortuni, sviluppo, obiettivi di stagione, Ultimate Team |
| **CALCETTO oggi** | **Tre binari veri.** Torneo a 8 con montepremi 40/80/250 e albo d'oro datato. Stagione a 8, andata e ritorno, 14 giornate, calendario col metodo del cerchio, **le altre partite simulate con la forza delle squadre via Poisson** (`simulaPartita`, riga 29236), classifica ordinata a punti/DR/GF, premi 35/15/600/200. Rosa di 5 uomini con nome, 4 attributi che spostano davvero la simulazione, e **crescita di +1 dopo ogni partita in base a cosa hai fatto** (`faiCrescereRosa`, riga 29414). 15 trofei con barra di avanzamento. Carriera: 9 numeri sulla lavagna d'ardesia |
| **Il divario** | La progressione **è larga ma non si ricorda di te**: nessuno storico partite (esiste solo `SAVE.lastRes`, un risultato), nessun capocannoniere, nessun record personale, e — verificato — la crescita della rosa **sceglie a caso fra i candidati** (`candidati[(Math.random()*candidati.length)|0]`, riga 29426), quindi il tuo bomber può prendere +1 CONTRASTO dopo una tripletta |
| **Valore su telefono** | **ALTO.** È l'unica cosa che fa tornare qualcuno domani in un gioco senza rete. Un elenco delle ultime 10 partite costa 10 oggetti in `localStorage`; far vincere la crescita al candidato *meritato* invece che a uno a caso costa **una riga** |

### 1.8 Personalizzazione

| | |
|---|---|
| **FC 25** | Kit creator, stemmi, stadio, cori, nome squadra, aspetto del giocatore, tattiche personalizzate |
| **CALCETTO oggi** | Nome squadra (12 lettere), **8 divise disegnate a SVG con gli stessi 3 pattern che il campo poi stampa davvero sul torso** (`kitSVG`, riga 29783 — l'anteprima è una promessa mantenuta), 8 campi con luce e manto propri, e **i cartelloni a bordo campo scritti dal giocatore**, 4 nomi da 14 lettere, dipinti nella tessitura (righe 2602–2615) |
| **Il divario** | Manca la cosa che un giocatore mostra agli amici: **nessuno stemma**, e nessuna tattica/modulo scegliibile — il modulo è dato dalla taglia e basta. Le 8 divise sono dietro un pacchetto a pagamento tranne la prima |
| **Valore su telefono** | **MEDIO.** I cartelloni scritti a mano sono un'idea migliore di metà di quello che fa la concorrenza e vanno tenuti. Uno stemma generativo (forma × 2 tinte × glifo, coi 23 glifi già disegnati per i trofei) costa una tela piccola e comparirebbe in home, sul tabellone, nel tabellino |

### 1.9 Allenamento e tutorial

| | |
|---|---|
| **FC 25** | Skill games a punteggio con medaglie, arena di riscaldamento sempre disponibile, trainer contestuale a schermo, pratica calci piazzati |
| **CALCETTO oggi** | Tutorial di **4 passi, tetto di 10 secondi di tempo di gioco, una volta sola nella vita** (`Tut`, riga 29118). È onesto: un passo che insegna un gesto già riuscito viene saltato, e al primo gol la fascia sparisce. Più la «lavagna del mister» (riga 2784): 8 gesti illustrati a gessetto in SVG, tastiera, e le regole del campetto |
| **Il divario** | **Il gioco insegna 4 gesti su 8 che ne ha.** Pallonetto, tiro al volo, filtrante e cross vivono solo nella lavagna, che è un testo che si legge fuori dalla partita; e **non esiste nessun posto dove provarli senza cronometro**. Su un gioco la cui promessa è «chi legge il tempo dell'altro segna», la finestra di timing non ha una palestra |
| **Valore su telefono** | **ALTO, ed è il buco più grande del contorno.** Un campetto libero — nessun avversario, nessun orologio, la porta, l'anello che pulsa — riusa la scena `play` con `timeLeft` infinito e `G.cpu` vuoto. È il posto dove si impara la cosa su cui è costruito tutto il gioco |

### 1.10 Accessibilità

| | |
|---|---|
| **FC 25** | Menu narrati, dimensione testo, più tipi di daltonismo con anteprima, rimappatura completa, assistenze graduabili, sottotitoli |
| **CALCETTO oggi** | Due interruttori, e **messi prima della difficoltà apposta** perché il piede del pannello copriva gli ultimi (righe 2734–2742): MOVIMENTO COMPLETO/RIDOTTO e ALTO CONTRASTO. Il movimento ridotto è onorato in profondità — niente fermo d'impatto, bande della moviola a 0,06 s invece di 0,17, targhe senza dissolvenza — e **`prefers-reduced-motion` di sistema viene letto senza che l'utente lo chieda** (riga 7163). L'alto contrasto forza il kit avversario al blu e **vince su qualunque scelta** (riga 7797). `lang="it"`, 51 fra `aria-label`/`aria-hidden`/`role`, il punteggio finale nell'`aria-label` |
| **Il divario** | Misurato: **0 regioni `aria-live`, 0 `tabindex`, e nessuno stile `:focus-visible`** su 80 bottoni — l'unico `:focus` del file sta sui due campi di testo (righe 1373, 1383). Chi naviga da tastiera non vede dove si trova, e chi usa un lettore di schermo non riceve nessun annuncio di gol, cartellino o trofeo. Nessuna scala del testo, un solo tipo di daltonismo, nessuna rimappatura, nessun assist di mira |
| **Valore su telefono** | **MEDIO-ALTO, e sproporzionato al costo.** Un anello di fuoco visibile costa una regola CSS; un `aria-live="polite"` sui banner d'evento e sul punteggio costa un `div` e una riga in `showBanner`. Sono le due cose col rapporto resa/costo più alto di tutto questo referto |

### 1.11 Impostazioni

| | |
|---|---|
| **FC 25** | Decine di voci su tre schede, profili di comando, calibrazione, telecamera, HUD configurabile |
| **CALCETTO oggi** | 8 controlli in una schermata (riga 2718): audio, vibrazione, movimento, contrasto, difficoltà CPU, **durata partita 90/120/180**, moviola sì/no, azzera dati. Salvataggio versionato `calcetto_save_v4` con migrazione da v3/v2 e da una chiave ancora più vecchia (riga 7071), e con **rilettura difensiva**: solo chiavi conosciute, valori serrati nei loro intervalli |
| **Il divario** | Manca il volume — c'è **solo acceso/spento**, e il master è un singolo `GainNode` (riga 7186): due cursori (effetti / folla) costerebbero due `GainNode`. E mancano taratura dello stick e mano sinistra, che su telefono non sono un lusso |
| **Valore su telefono** | **MEDIO.** La brevità qui è una virtù, non un difetto: 8 voci contro le decine di FC 25 è la scelta giusta. Il volume e la mano sinistra sono le due sole che aggiungerei |

### 1.12 Monetizzazione onesta

| | |
|---|---|
| **FC 25** | Prezzo pieno + valuta acquistabile + pacchetti a probabilità + stagioni a pagamento |
| **CALCETTO oggi** | Il patto è scritto in chiaro sulla schermata: «Prezzi dichiarati una volta, per sempre. Niente pubblicità, niente casse premio, niente attese: **ogni cosa si sblocca anche giocando**» (riga 2593). 5 articoli: il completo 3,99 €, campi 1,99, divise 1,99, curva 0,99, sponsor 2,99. Somma dei pezzi 7,96 €, il completo è **davvero** la metà. **Nessun articolo tocca fisica o abilità**, e c'è un collaudo d'equità che lo giura. ~48 monete a partita, 5320 monete per tutto il negozio, cioè ~110 partite |
| **Il divario** | Due cose, tutte e due misurate. **(a) Il pulsante in euro non compra niente**: apre un pannello che dice «nella versione dello store si comprerà con un tocco» (riga 29761). Non c'è nessun aggancio di fatturazione, quindi oggi la monetizzazione **non esiste**, esiste solo la sua dichiarazione. **(b) La scala dei prezzi dei campi è morta**: i 7 campi oltre l'Oratorio costano 150+400+800+1500+2500+4000+6000 = **15.350 monete uno per uno**, e **1.330 tutti insieme** col PACCHETTO CAMPI (righe 6521 e 7053). Chi risparmia 6.000 monete per IL TORNEO NOTTURNO sta pagando **4,5 volte l'intero pacchetto** per un ottavo del contenuto. La schermata CAMPI, che è la meglio disegnata del prodotto, espone una scala di prezzi che nessuno dovrebbe usare |
| **Valore su telefono** | **ALTO.** Il patto è l'argomento di vendita migliore che questo gioco abbia, e regge — ma un patto con un'aritmetica interna incoerente è il posto peggiore dove avere un'incoerenza. Riallineare i prezzi dei campi al pacchetto (o togliere l'acquisto singolo) costa 7 numeri |

### 1.13 Salvataggio, continuità, condivisione

| | |
|---|---|
| **FC 25** | Salvataggio cloud, più slot, cattura schermo e clip di sistema, condivisione |
| **CALCETTO oggi** | Uno slot in `localStorage`, nessuna esportazione, nessun backup, un solo «AZZERA TUTTI I DATI» |
| **Il divario** | Su una WebView Android **`localStorage` è la cosa più fragile che ci sia**: disinstalli, o l'utente pulisce i dati dell'app, e 110 partite di monete spariscono senza avviso. Nessuna condivisione del risultato — e la schermata finale è progettata *esplicitamente* come «la schermata che la gente condivide» (riga 8829) |
| **Valore su telefono** | **MEDIO-ALTO.** Esporta/importa come stringa incollabile costa un `<textarea>` e due funzioni, e non tocca né rete né permessi. La condivisione vera richiede un ponte Android (`canvas.toBlob` + intent), che è lavoro sull'APK, non sul gioco |

---

## 2. I difetti misurabili trovati, in ordine di gravità

| # | dove | il fatto | verificato come |
|---|---|---|---|
| 1 | `CALCETTO-il-gioco.html:8362-8380` | La ripartizione monete di fine partita **non somma al saldo mostrato sotto**: `+46` dichiarati, `SALDO: 156` da un saldo iniziale di 0. I 110 di trofei entrano fra il calcolo di `gain` e la lettura di `saldo` | misurato dal vivo con `_meta-sonda.js`; confermato leggendo l'ordine delle istruzioni |
| 2 | `:6521` vs `:7053` | Campi singoli 15.350 monete in totale, pacchetto campi 1.330. Rapporto **11,5×** | aritmetica sui dati; prezzi confermati a schermo dalla sonda |
| 3 | `:1373`, `:1383` e assenza di `aria-live` | **0 regioni `aria-live`, 0 `tabindex`, nessun `:focus-visible` su 80 bottoni** | contati dal vivo |
| 4 | `:29094` | I toast dei trofei si buttano oltre i tre in coda, e durano 3,2 s: in una partita che ne sblocca quattro, uno non viene mai visto | letto; non ho costruito il caso a quattro trofei |
| 5 | `:29426` | La crescita post-partita sceglie **a caso** fra i candidati meritati e uno completamente casuale: dopo una tripletta il difensore può prendere +1 VELOCITÀ | letto |
| 6 | `:2336-2337` | I sottotitoli di STAGIONE e TORNEO in home sono HTML statico: **con un torneo in corso la home non lo sa** | letto; nessun codice li riscrive (grep su `btnStagione`/`btnTorneo`) |
| 7 | `:2360`, `:2374` | **SPOGLIATOIO e BACHECA sono schermate che non contengono informazione**: rispettivamente 4 e 3 bottoni, 0 righe di contenuto. Due delle sei voci di home portano a un altro menu, cioè spingono ogni contenuto a 3 tocchi | contato dal vivo |
| 8 | `:7346` | Il giro del menu è di 8 note a 460 ms = **3,7 s**, e in home si resta molto più a lungo | letto |

Il difetto 7 merita una riga in più, perché tocca la regola di casa sull'accorpamento. Il commento a riga 2286 rivendica «erano dieci voci, ora cinque»: la fusione ha reso la home più bella e ha **spostato il costo di un livello più in basso**. Non è per forza sbagliato — ma il conto è che ROSA, CAMPI, TROFEI e STATISTICHE stanno tutte a tre tocchi da freddo, cioè **allo stesso prezzo di iniziare una partita**.

---

## 3. Se dovessi spendere la prossima passata sul contorno

In ordine di resa per il pollice, non per la fotografia:

1. **La palestra** (§1.9). Un campetto senza orologio e senza avversario. È l'unico posto dove il gesto su cui è costruito tutto — la finestra del tiro — si può imparare. Costo: una scena che riusa `play` con `G.cpu` vuoto e `timeLeft` disattivato; **zero costo a fotogramma in partita**.
2. **Il conto che torna** (§2.1) e **i prezzi dei campi** (§2.2). Sono due difetti di *onestà dichiarata*, nella stessa casa che ha pagato ventidue volte la regola «uno strumento che attesta invece di misurare». Costo: due righe e sette numeri.
3. **La home che si ricorda** (§1.1). Sottotitoli vivi su STAGIONE e TORNEO, e la voce con qualcosa in corso diventa la primaria al posto di GIOCA. Costo: una funzione da 15 righe chiamata all'apertura del menu.
4. **Anello di fuoco e `aria-live`** (§1.10). Costo: una regola CSS e un `div`.
5. **Le esultanze come premio** (§1.5). Le clip ci sono già; manca solo il legame con i 15 trofei. Costo: un campo in `SAVE`, un ramo in `clipDi`.

E una cosa che **non** farei: la voce del telecronista. È il divario più visibile con FC 25 ed è quello che vale meno qui — su telefono metà delle partite si gioca in silenzio, e ogni secondo di parlato campionato è peso sul file che governa già l'avvio a 2870 ms contro un tetto di 2 s.

---

**File lasciato nel progetto:** `C:\Users\Utenteee\Desktop\GitHub\games\_meta-sonda.js` (sonda ripetibile, sola lettura, non tocca il gioco). Nessun file del gioco è stato modificato; nessun processo `node` o `chrome` è stato terminato.