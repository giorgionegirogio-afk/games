# COME I GIOCHI DI CALCIO PER TELEFONO RISOLVONO IL PROBLEMA DEI DUE POLLICI
### Catalogo di meccanismi di ingresso — ricerca su rete + ergonomia + applicazione a CALCETTO

---

## 0. METODO, E COSA NON HO VERIFICATO

**Cosa ho fatto:** 24 ricerche/recuperi sul web; lettura in sola lettura di `C:\Users\Utenteee\Desktop\GitHub\games\CALCETTO-il-gioco.html` alle righe dell'input (8690–8950, 3090–3100).

**Cosa NON ho verificato, e lo scrivo prima dei numeri:**
- **Non ho installato né giocato nessuno dei giochi citati.** Tutto quello che dico sui loro comandi viene da documentazione ufficiale, guide e recensioni. Dove la fonte è una guida non ufficiale lo segnalo.
- **Fonti che mi hanno chiuso la porta:** wiki EA FC Mobile (HTTP 402), FIFPlay (403), forum EA (403), ACM Digital Library (403), recensione FULLSYNC di Sociable Soccer 25 (403). Il PDF di Parhi 2006 e quello di Nacenta 2013 sono arrivati come binario non decodificabile: **i loro numeri li riporto da fonti secondarie**, e lo dico ogni volta.
- **Non ho misurato la latenza né la dimensione dei bersagli su un telefono vero.** I numeri di conversione mm↔px sono un mio calcolo aritmetico dalla geometria dichiarata nel briefing, non una misura.
- **Numeri che ho scartato perché non attestabili:** "semplificare i comandi aumenta la retention del 30%", "il 40% degli utenti abbandona per frustrazione da comandi", "bersagli sotto 44px hanno errori 3x" (MoldStud / riassunti di ricerca senza studio a monte); "il claw grip rende il 15–30% in più" (BitTopup, sito di ricariche, nessuna metodologia). **Non li uso.** Regola di casa n. 3.

---

## 1. IL PROBLEMA, RIDOTTO A TRE VINCOLI FISICI

Il gamepad ha 12 pulsanti + 2 stick + 4 dorsali = ~18 ingressi discreti sotto 8 dita, **tutti raggiungibili senza guardare e senza coprire lo schermo**. Il telefono in orizzontale ha 2 pollici che devono contemporaneamente (a) reggere il dispositivo, (b) muovere, (c) agire, (d) **non coprire il campo**. I tre vincoli:

**Vincolo 1 — I pollici sono due, e uno è già occupato.** PUBG Mobile lo documenta per via negativa: con la presa a due pollici *"non puoi fisicamente mirare e accovacciarti nello stesso momento quando un pollice fa due lavori"*; i giocatori competitivi rispondono aggiungendo indici (claw a 3–4 dita), e oltre le 4 dita *"i polsi ruotano in orizzontale e diventa scomodo"*. Il claw non è una soluzione di design: è una minoranza autoselezionata che paga con l'ergonomia.

**Vincolo 2 — La postura che il gioco presuppone è rara nella vita.** Hoober, UXmatters 2013, **1.333 osservazioni** sul campo (780 con lo schermo toccato): **49% una mano sola, 36% cullato (due mani, un pollice tocca), 15% due mani**. E dei due-mani, **90% in verticale, 10% in orizzontale**. Cioè: **circa l'1,5% delle osservazioni era "due pollici in orizzontale"** — la postura da gioco. *Caveat mio: Hoober osservava uso generico in pubblico, non sessioni di gioco; il numero non dice "solo l'1,5% dei giocatori gioca così", dice che quella presa non è lo stato di riposo di una persona con un telefono in mano.* Corollario di progetto: il gioco deve sopravvivere al momento in cui **una mano se ne va**.

**Vincolo 3 — Il dito è grosso e opaco.** NN/g: polpastrello 16–20 mm, **area d'impatto del pollice ~25 mm**. Un pollice appoggiato sul campo copre un disco di 25 mm. Su uno schermo largo 915 px CSS sono ~150 px: **il 16% della larghezza e il 36% dell'altezza del quadro**.

### Le soglie di bersaglio, tutte insieme

| Fonte | Soglia | in px CSS (≈dp) |
|---|---|---|
| Apple HIG | 44×44 pt | 44 |
| Material Design | 48×48 dp | 48 |
| WCAG 2.2 AA (2.5.8) | 24×24 px CSS | 24 |
| WCAG 2.2 AAA | 44×44 px CSS | 44 |
| Parhi/Karlson/Bederson, MobileHCI 2006 (*via NN/g e Microsoft Research; PDF non decodificato*) | **9,2 mm** discreto, 7,6 mm seriale | ~54–58 |
| NN/g, dalla stessa ricerca | **10×10 mm** | ~58–63 |

*Conversione: 1 px CSS = 1 dp = 1/160 pollice = 0,159 mm nominali; su un telefono reale largo 412 dp e ~68–71 mm sta fra 0,159 e 0,172 mm. Uso 0,16–0,17 mm. È aritmetica mia, non una misura.*

### Il costo di un gesto rispetto a un tocco — numeri, non impressioni

| Operatore | Tempo | Fonte |
|---|---|---|
| Tap | **133 ms** (dev.std 83) | studio forze/tempi su gesti touchscreen indice+pollice (ScienceDirect S1050641116301225), *via riassunto di ricerca, abstract non letto integralmente* |
| Slide/swipe corto | **421 ms** (dev.std 181) | stessa fonte |
| Swipe col pollice su tablet | 862–1050 ms (verso l'esterno più lento dell'interno) | studio su tablet — **classe di dispositivo diversa, non trasferibile al telefono; lo riporto solo come ordine di grandezza** |
| Latenza touch→fotone reale in gioco | **86–88 ms medi** (iPhone XS Max 88, Note 10 86; PUBG 78–82) | GameBench 2019, camera ad alta velocità, 3 ripetizioni. Soglie loro: 0–83 ms "ultra", 83–133 "smooth", 133–167 "basic", >167 "poor" |
| Finestra "perfect" nei rhythm game | ±16–30 ms | guide di settore, *non studio accademico* |

**La conclusione operativa è dura: un flick costa da 3 a 8 volte un tocco.** In un gioco dove la palla arriva in 300 ms, un flick è un tempo intero di gioco. E la latenza di sistema (86–88 ms) è **da 3 a 5 volte più larga della finestra "perfect" di un rhythm game**: qualunque meccanica di timing con finestra sotto i ~100 ms su telefono non misura l'abilità, misura il telefono.

**Quanti gesti impara davvero una persona:**
- **Marking menu (Kurtenbach & Buxton):** la discriminazione angolare umana regge **8 direzioni**; errore <10% a breadth 8 e profondità 2; **breadth 12 non regge oltre la profondità 1**. Questo è il tetto duro di qualunque "flick in N direzioni".
- **Nacenta et al., CHI 2013** (33 partecipanti su 3 studi): i gesti **definiti dall'utente** si ricordano fino al **24% meglio** dei pre-disegnati, sia subito sia il giorno dopo; gli errori sono di **associazione** (mi ricordo il gesto, non a cosa serve), non di forma. *La dimensione dei set e le percentuali di richiamo assolute (61–71% citate da un riassunto secondario) non le ho verificate sul PDF.*
- **NN/g sui gesti:** *"interfaccia alternativa nascosta… bassa memorabilità e bassa scopribilità"*; raccomandazione: mai affidarsi solo a un gesto non scopribile.

---

## 2. RILIEVO SUI GIOCHI (cosa fa ciascuno, in una riga)

| Gioco | Schema | Azioni distinte esposte | Come risolve i modificatori |
|---|---|---|---|
| **EA FC Mobile** | Misto: stick + 5–6 pulsanti **+ strato gesti sovrapposto** | **31** azioni documentate (guida FIFAUTeam FC Mobile 24: 4 movimento, 9 difesa, 8 passaggio, 5 passaggio avanzato, 5 tiro) | Flick del pulsante in 4 direzioni + doppio tocco + durata + contesto di zona. Interruttore "solo gesti" che **spegne** Tira/Passa/Filtrante. Impostazione "spaziatura pulsanti" contro i tocchi ambigui |
| **eFootball Mobile — Classic** | dpad + 4 pulsanti contestuali | ~20+ (attacco+difesa) | **Flick del pulsante su/giù/sx/dx** = famiglia "stunning". Documentato da Konami: Pass flick sx = low pass stunning, dx = lofted, su/giù = cross |
| **eFootball Mobile — Touch & Flick** | **Zero pulsanti**, solo lati dello schermo | Circa la stessa dello Classic | **Prefisso accordato**: *"tocca il lato sinistro, poi immediatamente esegui il comando"* = variante stunning di qualunque azione. Difesa = tieni il lato destro |
| **Dream League Soccer** | Stick + **3 pulsanti contestuali** | 6 verbi (passa/tira/cross ↔ pressa/contrasta/cambia) | **Solo il contesto di possesso.** E ha **cancellato** lo sprint: auto-sprint dalla ~DLS 20 |
| **Sociable Soccer 25** | Stick + pulsanti (tira/passa/pallonetto/cambio/sprint) | **3 tipi di calcio** | **Aftertouch**: dopo il calcio ruoti lo stick e curvi. Più la **durata** (tap=basso, tieni=potente). *"Nessuna mossa speciale con combo complicate"* |
| **Score! Match** | **Disegno di traiettoria**, nessun movimento manuale | 2 tiri (curva = linea curva, potente = linea dritta) + passaggi disegnati; in difesa **solo la scelta del difensore** | Non ci sono modificatori: **la forma della linea È il modificatore** |
| **Score! Hero** (100M+ download) | Disegno di traiettoria, un dito, tempo fermo | 1 verbo ("manda la palla lì") | Nessuno. La curva della linea porta tutta l'espressione |
| **New Star Soccer** | **Trascina-mira-rilascia** sulla palla | 1 verbo, 3 parametri continui (direzione, potenza, effetto dal punto d'impatto sulla palla) | Il **punto di contatto sulla palla** è il modificatore |
| **Football Strike** | Trascina-mira-rilascia (attacco) + swipe (portiere) | 2 ruoli | Ogni swipe porta **potenza, direzione, altezza e curva** insieme |
| **Retro Goal** | **Flick ovunque sullo schermo**, tempo rallentato al passaggio | ~4 (corri, passa, cross, tira) | Il rallentamento del tempo è il modificatore: compra i 421 ms del flick |
| **Soccer Super Star** | Uno swipe per volta, gioco su binari | 1–2 | Nessuno: elimina il movimento |
| **FIFA Mobile (2016, VSA)** | Stick contestuale + 3 pulsanti, partita **asincrona a turni di 75 s** | ~8 | Contesto + **autoplay: alzi le dita e l'IA gioca**. L'analisi di Deconstructor of Fun la chiama *"Brilliant!"* |
| **Charrua Soccer** | Stick + pulsanti contestuali, **modalità assistita configurabile** | ~4 | **L'assistenza come modificatore invertito**: disattivi l'aiuto per aumentare la sfida |
| **Head Ball 2** | 4 pulsanti totali (sx/dx, tiro basso, tiro alto, salto) | 4 | Nessuno |
| **Rocket League Sideswipe** *(non calcio, ma è il riferimento)* | Stick dinamico + **2 pulsanti** (salta, boost) | 2 + fisica | Nessuno. *"Sono gli unici comandi, ed è tutto quello che al gioco serve"* |
| **Rematch** (Sloclap) | **Non esiste su telefono.** PC/PS5/Xbox, 19/06/2025 | — | Verificato: nessun annuncio mobile trovato |

---

## 3. IL PROBLEMA DEI MODIFICATORI: LE 10 RISPOSTE VISTE IN NATURA

Su gamepad L1/R1/L2/R2 moltiplicano 12 pulsanti per 16 combinazioni. Sul telefono i modificatori non esistono. Ecco **tutte** le sostituzioni che ho trovato, con il prezzo.

| # | Sostituto | Moltiplicatore | Prezzo |
|---|---|---|---|
| M-a | **Flick direzionale sul pulsante** (FC Mobile, eFootball Classic) | ×4 pratico, **×8 tetto teorico** (Kurtenbach) | +288 ms sul tap; il dito lascia il pulsante e può mancare il rientro |
| M-b | **Doppio tocco sul pulsante** (dinked pass FC Mobile) | ×2 | Richiede una finestra di rilevamento (~250–300 ms) che **ritarda il tocco singolo** o obbliga a eseguire in modo speculativo |
| M-c | **Durata della pressione** (Sociable Soccer: tap=rasoterra, tieni=potente) | ×2–∞ (continuo) | Occupa il pollice; incompatibile con un secondo comando nello stesso istante |
| M-d | **Contesto di possesso** (DLS, FIFA Mobile, CALCETTO) | **×2 gratis** | Zero, se l'etichetta cambia. Diventa caro se il contesto cambia **durante** la pressione |
| M-e | **Contesto di zona** (FC Mobile: Passa+su in zona cross = cross) | ×2 in una regione | **Invisibile**: il giocatore non sa dove comincia la zona |
| M-f | **Prefisso accordato** (eFootball T&F: tocca sinistra → poi il comando) | ×2 su **tutto** il vocabolario | Costa una finestra temporale e un secondo dito. È il più potente e il più difficile |
| M-g | **Secondo dito / claw** (PUBG) | +2 ingressi simultanei | Ergonomia; adottato da una minoranza |
| M-h | **Interruttore fuori partita** (FC Mobile: "passaggi avanzati" da abilitare nelle impostazioni; "solo gesti") | ×N, ma non simultaneo | Sposta la scelta fuori dal campo: il giocatore ha **un** vocabolario per volta |
| M-i | **Cancellare l'ingresso con l'assistenza** (DLS ha tolto lo sprint; Charrua "assisted mode"; assist di tiro) | Libera un pulsante intero | **Il più economico di tutti.** Prezzo: profondità percepita |
| M-j | **Giroscopio** (eFootball lo supporta) | +1 asse senza dita | Inutilizzabile in movimento. *Non verificato quanto sia usato* |

---

## 4. IL CATALOGO DEI MECCANISMI DI INGRESSO

Per ognuno: **quante azioni sa esprimere · quanto costa impararlo · dove si rompe · quanto costa al telefono.**

---

### A. STICK VIRTUALE (fisso / dinamico / che-insegue)
- **Esprime:** 1 vettore continuo (direzione + intensità). Con doppio-tocco-e-tieni, +1 modo (FC Mobile "face up dribble").
- **Apprendimento:** ~0. È l'unico ingresso che nessuno deve imparare.
- **Dove si rompe:** (1) **occlusione** — occupa stabilmente l'angolo basso sinistro; (2) **deriva del pollice** — su stick fisso il dito esce dalla ghiera e l'input muore (documentato nei forum EA come "joystick bloccato"); lo stick *che insegue* lo risolve ma può migrare sotto l'azione; (3) **non c'è feedback tattile**: senza guardare non sai dove sei.
- **Costo telefono:** trascurabile.
- **Regola trovata:** la ghiera va **perdonante** — il dito può uscire, l'uscita si satura invece di annullarsi.

### B. PULSANTE A TOCCO SEMPLICE
- **Esprime:** 1 azione per pulsante.
- **Apprendimento:** ~0 se etichettato.
- **Dove si rompe:** al **quarto pulsante**. Le lamentele ricorrenti su FC Mobile sono esattamente questa: dita che *"finiscono per sbaglio sul pulsante di tiro mentre cercano il filtrante"* — tanto che EA ha dovuto aggiungere un'impostazione **"spaziatura pulsanti"**. Il dito occlude, quindi non puoi verificare visivamente cosa stai premendo.
- **Costo telefono:** trascurabile.
- **Tetto pratico osservato: 3–4 pulsanti d'azione.** DLS ne usa 3, FIFA Mobile 3, Sideswipe 2, Head Ball 2 quattro in tutto. FC Mobile ne usa 5–6 ed è l'unico che ha dovuto inventare un'opzione per non farli confondere.

### C. PULSANTE + DURATA (carica e rilascia)
- **Esprime:** 1 scalare continuo per pulsante (potenza), oppure 2 azioni discrete (tap vs. tieni).
- **Apprendimento:** basso. È l'unico modificatore che si **scopre da solo** (tieni premuto → vedi la barra).
- **Dove si rompe:** blocca il pollice per tutta la carica. Se durante la carica cambia il contesto (perdi palla), l'azione che parte al rilascio non è più quella promessa.
- **Costo:** trascurabile.

### D. PULSANTE + FLICK DIREZIONALE (marking menu sul pulsante)
- **Esprime:** **tap + N direzioni**. FC Mobile ed eFootball usano N=4 → **5–7 azioni per pulsante** (con tap, doppio tap, tenuta). Con 3 pulsanti: **fino a 18–21 azioni con 3 bersagli**. È il moltiplicatore più efficiente esistente.
- **Apprendimento:** **alto**. È esattamente il caso "errore di associazione" di Nacenta: la forma è banale, ricordare *quale* direzione fa cosa no. FC Mobile: Tira+giù=finesse, Tira+su=pallonetto, Tira+sx=finta; Passa+su=lob, Passa+giù=passa-e-vai, Passa+dx=teso, Passa+sx=teso alto. **Sette associazioni arbitrarie su due pulsanti.**
- **Dove si rompe:** (1) il tetto di Kurtenbach — **8 direzioni massimo, 4 in sicurezza sotto pressione**; (2) i **421 ms** del flick; (3) il dito finisce **fuori** dal pulsante e il tocco successivo manca il bersaglio; (4) sotto stress il flick degenera in tap e ottieni l'azione base — che è il fallimento *benigno*, ed è il motivo per cui il pattern funziona comunque.
- **Costo:** trascurabile.

### E. PREFISSO ACCORDATO (due dita in sequenza rapida)
- **Esprime:** **raddoppia l'intero vocabolario** con un solo ingresso nuovo. eFootball Touch & Flick: *"tocca il lato sinistro, poi immediatamente esegui qualunque comando di passaggio"* = tutta la famiglia stunning.
- **Apprendimento:** **il più alto del catalogo.** Le guide lo descrivono come curva *"brutale"*, e la stessa fonte nota che *"la maggior parte dei giocatori in classifica resta su Classic per coerenza"*.
- **Dove si rompe:** richiede due dita libere in sequenza entro una finestra; sbagliare il tempo produce **l'azione base invece della variante**, cioè un errore silenzioso. Ed è **invisibile**: niente sullo schermo dice che esiste.
- **Costo:** trascurabile.

### F. CONTESTO (lo stesso bersaglio cambia significato)
- **Esprime:** ×(numero di contesti), a costo zero di spazio.
- **Apprendimento:** **zero, a una condizione: che l'etichetta cambi.** DLS lo fa con 3 pulsanti e 2 contesti = 6 verbi che nessuno deve imparare.
- **Dove si rompe:** (1) se il contesto cambia **mentre** il dito è giù; (2) se il contesto è **spaziale e non disegnato** (la zona cross di FC Mobile: nessuno sa dov'è); (3) contesti oltre 2 diventano indovinelli.
- **Costo:** trascurabile.

### G. TOCCO DIRETTO SUL MONDO (tap-to-target)
- **Esprime:** 1 verbo con **bersaglio continuo**. FC Mobile: tocca il compagno = passaggio, tocca lo spazio dietro = filtrante, doppio tocco = lob.
- **Apprendimento:** **il più basso in assoluto** — è manipolazione diretta, la cosa che secondo *Game Developer* i touchscreen sanno fare e i pulsanti no.
- **Dove si rompe:** **sulla dimensione del bersaglio.** Un giocatore disegnato piccolo è un bersaglio sotto soglia; e il **dito lo copre mentre lo tocca**. Peggiora linearmente con il numero di giocatori: a 11 contro 11 gli avversari sono ammassati e il pollice ne copre parecchi. Inoltre non distingue "passa a lui" da "passa dove sarà".
- **Costo:** una ricerca del più vicino per tocco; nulla.

### H. FLICK NEL MONDO (swipe verso un obiettivo)
- **Esprime:** **3 parametri continui in un solo ingresso**: direzione, velocità, curvatura. *Game Developer*: *"la gamma di espressione contenuta in un singolo ingresso da 0,15 secondi è impressionante"*. FC Mobile: swipe lento=tiro basso, veloce=alto, curvo=finesse.
- **Apprendimento:** medio. Il verbo si intuisce ("scaglia la palla di là"), la **mappatura dei parametri** no.
- **Dove si rompe:** **quattro punti, tutti gravi.**
  1. **Costa 421 ms** e mentre lo fai non stai muovendo il giocatore.
  2. **Collide con il trascinamento dello stick.** Se lo stesso dito fa entrambi serve una soglia di velocità, e la soglia sbaglia in entrambe le direzioni.
  3. **Il browser fonde i `touchmove` quando il telefono è in affanno** — e succede proprio quando la scena è piena, cioè sotto porta. È scritto nel vostro stesso codice a riga 8882-8896 e vale per qualunque gioco HTML.
  4. **Il dito copre la destinazione** mentre la indica.
- **Costo:** una storia di punti per dito; nulla.

### I. DISEGNO DI TRAIETTORIA (Score! Hero, Score! Match)
- **Esprime:** **una funzione**, non un valore: percorso completo, curvatura inclusa. È il meccanismo con più larghezza di banda del catalogo.
- **Apprendimento:** **quasi zero.** Score! Hero ha 100 milioni di download con un dito e un verbo.
- **Dove si rompe:** **richiede che il mondo si fermi o rallenti.** Disegnare una curva costa da 500 ms a qualche secondo. Score! Match lo compra togliendo al giocatore il controllo del movimento; Score! Hero congelando il tempo. **Non è compatibile con il gioco continuo.**
- **Costo:** trascurabile.

### J. TRASCINA-MIRA-RILASCIA (fionda: New Star Soccer, Football Strike)
- **Esprime:** direzione + potenza + effetto (dal punto d'impatto o dall'uncino finale) = 3–4 parametri, **con anteprima**.
- **Apprendimento:** ~0 (è la fionda di Angry Birds).
- **Dove si rompe:** come il disegno — **vuole il tempo fermo**. Ed è il motivo per cui questi giochi sono a episodi (calcio piazzato, azione singola) e non partite continue.
- **Costo:** trascurabile.

### K. AFTERTOUCH (continuare a governare *dopo* l'ingresso)
- **Esprime:** +1 dimensione continua **su ogni azione già esistente**, senza aggiungere un solo bersaglio, pulsante o gesto.
- **Apprendimento:** basso, e **scopribile per caso** (muovi lo stick dopo il tiro e vedi la palla piegare).
- **Dove si rompe:** solo se il volo della palla è troppo breve perché ci sia un "dopo"; e va comunicato, se no i giocatori attribuiscono la curva al caso.
- **Costo:** trascurabile.
- **È il meccanismo con il miglior rapporto espressione/costo dell'intero catalogo,** ed è quello di Sensible/Sociable Soccer, cioè di chi ha inventato il calcio arcade. *"Il meccanismo di aftertouch è la stella dello spettacolo."*

### L. ANELLO DI TIMING (tieni e rilascia sulla fase giusta)
- **Esprime:** 1 scalare (qualità) su un'azione esistente. Zero spazio schermo aggiuntivo (l'anello sta sul giocatore).
- **Apprendimento:** basso **se l'anello è visibile e la fase è ancorata a un evento che il giocatore causa** (prendere palla), alto se la fase è libera.
- **Dove si rompe:** **sulla latenza.** 86–88 ms di touch→fotone misurati su telefoni di fascia alta, più quello che aggiunge una WebView (non misurato). Una finestra sotto ~100 ms non è una prova di abilità, è una lotteria hardware. **Soglia di sicurezza suggerita: finestra ≥ 4–5× la latenza, cioè ≥ 350–450 ms.**
- **Costo:** trascurabile.

### M. ZONE DELLO SCHERMO COME PULSANTI INVISIBILI
- **Esprime:** N regioni + le loro combinazioni. *Foxtrot* (Game Developer): *"qualunque tocco a sinistra vale Sinistra, a destra Destra, i due lati insieme = Azione"* → **3 azioni, zero pixel di HUD**.
- **Apprendimento:** basso ma **non nullo**: i giocatori hanno avuto *"un po' di difficoltà per i primi minuti"*, poi *"i comandi sembravano naturalissimi"*.
- **Dove si rompe:** invisibile (serve un'istruzione a schermo all'avvio); e i confini fra zone sono ambigui.
- **Costo:** zero, ed è **l'unico meccanismo che libera area di gioco invece di consumarla**.

### N. MINIMAPPA / HUD TOCCABILE
- **Esprime:** bersaglio spaziale fuori quadro.
- **Apprendimento:** basso.
- **Dove si rompe:** è per definizione **una copia rimpicciolita del campo**: i bersagli lì dentro sono minuscoli. Un pollice da 25 mm su una minimappa alta 60 px la copre quasi tutta.

### O. AUTOPLAY / STATO A ZERO DITA
- **Esprime:** 0 azioni — **ma è un meccanismo, non un'assenza.** FIFA Mobile: *"alzare le dita dallo schermo fa giocare i tuoi giocatori senza alcun input"*.
- **Apprendimento:** zero, per definizione.
- **Dove si rompe:** se lo stato a zero dita **non è neutro**, il giocatore viene punito per un'interruzione della vita reale — e il Vincolo 2 dice che le interruzioni sono la norma.
- **Costo:** zero.

### P. ASSISTENZA / CANCELLAZIONE DELL'INGRESSO
- **Esprime:** −1 ingresso. DLS ha **eliminato il pulsante sprint** (auto-sprint dalla ~DLS 20): un pulsante intero restituito allo schermo e al pollice.
- **Apprendimento:** negativo (toglie roba da imparare).
- **Dove si rompe:** se l'automatismo decide male in un momento decisivo, il giocatore incolpa il gioco e **non ha modo di smentirlo**. Charrua risponde rendendo l'assistenza **configurabile per singola azione**.

### Q. SELEZIONE PER TOCCO DELL'ATTORE (in difesa)
- **Esprime:** 1 verbo ("questo") con bersaglio discreto. Score! Match riduce **tutta** la difesa a questo.
- **Apprendimento:** ~0.
- **Dove si rompe:** stessa soglia del meccanismo G — e in difesa i giocatori sono ancora più ammassati. La guida di Score! Match avverte esplicitamente di **non selezionare tutti i difensori**, perché produce caos: cioè il meccanismo è così economico che il giocatore lo spreca.

### R. MENU RADIALE SU PRESSIONE PROLUNGATA
- **Esprime:** fino a **8 voci** (tetto Kurtenbach), con **etichette visibili** — cioè risolve il problema di associazione di D/E.
- **Apprendimento:** **il più basso fra i meccanismi ad alta capacità**, perché è autodocumentante: tieni premuto e *vedi* le opzioni.
- **Dove si rompe:** costa **hold + movimento + rilascio**, dell'ordine dei 600–1000 ms. **Inutilizzabile in gioco continuo**; utilizzabile sui calci piazzati, sui cambi, sulla tattica.
- **Nota:** non l'ho trovato in nessuno dei giochi di calcio esaminati. È lo spazio vuoto del settore.

### S. GIROSCOPIO
- **Esprime:** +2 assi continui senza consumare dita.
- **Apprendimento:** basso, adozione bassa.
- **Dove si rompe:** in autobus, a letto, in piedi. Cioè dove si gioca.

---

## 5. COSA DICONO GIOCATORI E RECENSIONI CHE FUNZIONA — E COSA NO

**FUNZIONA (convergenza fra fonti indipendenti):**
1. **Tre pulsanti contestuali.** DLS, FIFA Mobile, Sideswipe. Deconstructor of Fun sul sistema di FIFA Mobile: *"a prova di proiettile"* dopo test estesi con utenti.
2. **Lo stato a zero dita non punitivo.** L'autoplay di FIFA Mobile è l'unica funzione che quell'analisi chiama *"Brilliant!"*.
3. **Il fallimento benigno.** Nei sistemi flick-sul-pulsante, sbagliare il flick dà comunque l'azione base. È il motivo per cui reggono sotto pressione.
4. **Aftertouch.** *"La stella dello spettacolo"*, *"nessuna combo complicata, chiunque può prenderlo in mano e divertirsi subito"*.
5. **Personalizzazione della disposizione.** Sideswipe, DLS e FC Mobile lasciano spostare/ridimensionare i comandi. FC Mobile ha dovuto **aggiungere** la "spaziatura pulsanti" — cioè: la disposizione non è un dettaglio estetico, è una patch di correttezza.

**NON FUNZIONA:**
1. **Più di 3–4 pulsanti d'azione.** Lamentele documentate su FC Mobile: dita che *"atterrano per sbaglio sul tiro mentre cercano il filtrante"*, *"la posizione dei pulsanti fa perdere le azioni"*.
2. **Gesti come unico canale.** eFootball Touch & Flick: *"molto più difficile da padroneggiare in difesa"*, *"la maggior parte dei giocatori in classifica resta su Classic"*. NN/g dà la spiegazione strutturale: i gesti non sono scopribili e si ricordano male.
3. **Modificatori invisibili.** Le zone contestuali di FC Mobile e i passaggi avanzati nascosti dietro un'impostazione sono conosciuti da chi legge le guide, non da chi gioca.
4. **Simulare il gamepad.** *Game Developer*: le levette analogiche virtuali con offset *"deludono in particolare"* perché il giocatore non può mirare a qualunque angolo. Traduzione: uno stick virtuale è un ingresso più povero di uno stick vero, e fingere il contrario è il primo errore.
5. **Il paradosso della semplificazione.** Deconstructor of Fun elogia i comandi di FIFA Mobile *e* dice che la semplificazione ha ridotto profondità e abilità, minando la ritenzione a lungo termine. **Questo è precisamente il punto della guida "Complete Attacking Fundamentals" citata nel briefing:** la profondità non sta nel numero di ingressi, sta in cosa il gioco premia — ma se togli ingressi *senza* aggiungere ricompense, resti con un gioco piatto.

---

## 6. I NUMERI APPLICATI A CALCETTO (aritmetica mia sulla geometria dichiarata)

Schermo **915 × 412 px CSS**, deviceScaleFactor 2 → 1830 × 824 px di periferica. 1 px CSS ≈ 0,16–0,17 mm.

**I comandi attuali, letti nel file** (`CALCETTO-il-gioco.html:8773-8805`):
```
GRANDE  (VW-64, VH-60)  r 40  → diametro 80 px CSS ≈ 12,7–13,8 mm
PICCOLO (VW-158, VH-72) r 30  → diametro 60 px CSS ≈  9,5–10,3 mm
```
raggio di presa +10 (`:8825`), anello di esclusione +18 (`:8836`), distanza fra i centri 94,8 px.

**Verdetto sulle soglie:**

| | diametro | Apple 44 | Material 48 | Parhi 9,2 mm (≈54–58) | NN/g 10 mm (≈58–63) |
|---|---|---|---|---|---|
| GRANDE (area di presa 100 px) | 80 / 100 | passa | passa | passa | passa |
| PICCOLO (area di presa 80 px) | 60 / 80 | passa | passa | passa (con la presa) | **al limite sul disegnato, passa sulla presa** |

**Entrambi i pulsanti rispettano tutte e quattro le soglie di ricerca.** L'anello di esclusione a `r+18` è, per quanto ho visto in questa ricerca, **una difesa che nessuno dei giochi commerciali esaminati documenta** — FC Mobile ha risolto lo stesso problema con un'impostazione ("spaziatura pulsanti") invece che con una zona morta. È un vantaggio reale.

**Il giocatore come bersaglio toccabile:** 91 px di periferica / 2 = **45,5 px CSS ≈ 7,2–7,8 mm di altezza**.
- Sotto Material (48), sotto Parhi (9,2 mm), sotto NN/g (10 mm). Passa solo WCAG AA (24 px).
- **La larghezza non l'ho misurata** — ma per una figura vista dall'alto sarà una frazione dell'altezza, quindi **il bersaglio è più stretto che alto e sta sotto soglia sull'asse peggiore**.
- Un pollice da 25 mm copre **~150 px CSS**, cioè **una fascia larga più di tre giocatori affiancati**.
- **Conseguenza per il progetto:** il meccanismo G ("tocca il compagno per passargli") — che è il gesto migliore del catalogo per costo di apprendimento — **non è affidabile in questo gioco a 11 contro 11 senza un aggancio generoso al più vicino.** Se lo si vuole, va misurato: quante volte il tocco raggiunge il compagno inteso in una mischia. Non è una cosa da attestare.

**La finestra di timing:** `PULSE_T = 0.90` (`:3092`), `FLICK_WIN0 = 0.45`, `FLICK_WIN1 = 0.95` (`:3100`) → finestra di **450 ms su 900**, più ±45 ms di tecnica (`:8911`).
- 450 ms sono **5,1 volte** gli 86–88 ms di latenza touch→fotone misurati da GameBench. **Sta nella zona sicura del meccanismo L.** Per confronto: una finestra da rhythm game (±16–30 ms) sarebbe **da 3 a 5 volte più stretta della latenza stessa** e sarebbe una lotteria.
- La fase è ancorata al **possesso** (`G.possT` parte quando prendi palla, `:8909`), cioè a un evento che il giocatore causa: è la condizione che il catalogo indica come necessaria perché un anello di timing sia imparabile e non un dado.

**Il conto del vocabolario attuale.** Dal codice: stick (A) + 2 pulsanti contestuali (B+F, ×2 contesti = 4 verbi) + carica/rilascio sul tiro (C) + canale flick con 4 esiti — tiro, scivolata, cross, passaggio forte (H, discriminati per direzione/possesso/metà campo, `:8904-8945`) + rilascio semplice = passaggio (`:8948`). **Circa 10 verbi distinti con 2 bersagli e 1 stick.** Per confronto: DLS ne espone 6, FIFA Mobile ~8, FC Mobile 31.

**Un'osservazione che il catalogo fa emergere, e che segnalo senza toccare nulla:** a riga `8947-8948` il rilascio semplice dello stick con la palla **è un passaggio**. Non esiste uno stato "alzo le dita e non succede niente" (meccanismo O). Se il giocatore alza il pollice per una notifica, un semaforo, una fermata dell'autobus — cioè per le cose che il Vincolo 2 dice essere la norma — **perde la palla**. FIFA Mobile ha preso la decisione opposta, ed è l'unica cosa che l'analisi indipendente di quel gioco chiama geniale. **Non ho provato questo comportamento in partita: l'ho dedotto leggendo il codice.** Se qualcuno volesse toccarlo, la domanda giusta non è "quanti passaggi involontari partono" ma "quanti possessi si perdono per un dito alzato" — e va misurata, non affermata.

**Costo su telefono di tutto il catalogo:** nessuno dei meccanismi A–S costa più di una manciata di operazioni per fotogramma. **L'unico costo reale dell'input su un telefono lento è già documentato nel vostro codice a riga 8882-8896: il browser fonde i `touchmove` quando la scena è piena.** Questo è il vincolo di prestazione vero dei gesti, e vale per H, I, J e D — cioè per **quattro** meccanismi su diciannove. Chi progetta un flick su HTML sta progettando anche il suo fallimento sotto carico.

---

## 7. LE TRE COSE CHE IL CATALOGO DICE, SE SI VUOLE PROFONDITÀ SENZA UN TERZO POLLICE

Non sono proposte di modifica (sono in sola lettura) — sono le conclusioni della ricerca, con il prezzo dichiarato come chiede la regola 5.

1. **Il rapporto espressione/costo migliore del catalogo è l'AFTERTOUCH (K), e nessun gioco di calcio per telefono a parte l'erede di Sensible Soccer lo usa.** Aggiunge una dimensione continua a *ogni* azione già esistente, non consuma un pixel di HUD, non aggiunge un gesto da ricordare, si scopre per caso. Costo su telefono: nullo. È l'unico modo che ho trovato di **aumentare** il vocabolario mentre si **riduce** il numero di ingressi.
2. **Il secondo miglior rapporto è il CONTESTO ETICHETTATO (F), e voi lo state già usando bene** (`:8798-8804`, l'etichetta dice quello che il dito farà). Il tetto è 2 contesti; oltre diventa un indovinello. Il terzo contesto è dove tutti gli altri sbagliano (le zone invisibili di FC Mobile).
3. **La cosa che il catalogo dice di NON fare, e su cui tre giochi grandi hanno sbattuto: non aggiungere il quarto pulsante e non aggiungere il sesto gesto.** Il tetto misurato è 3–4 pulsanti e 4 direzioni per bersaglio; oltre, la ricerca (Kurtenbach sull'angolo, Nacenta sull'associazione, NN/g sulla scopribilità) e la pratica (le lamentele su FC Mobile, l'abbandono di Touch & Flick da parte dei giocatori di classifica) dicono la stessa cosa. **Il modo giusto di crescere non è aggiungere ingressi: è aggiungere ricompense a quelli che ci sono** — che è esattamente la tesi di "Complete Attacking Fundamentals" citata nel briefing, e l'unico punto su cui la ricerca di prodotto e la ricerca accademica sono d'accordo senza sfumature.

---

## FONTI

Konami — [Manuale comandi eFootball 2022](https://www.konami.com/efootball/en/page/new_controls) · [Controls Manual mobile](https://www.konami.com/efootball/en/page/mobile_controller) | FIFAUTeam — [FC Mobile 24 Controls](https://fifauteam.com/fc-mobile-24-controls/) | FIFAMobileGuide — [Gameplay Controls](https://www.fifamobileguide.com/gameplay-controls) | Deconstructor of Fun — [Why FIFA Mobile Hasn't Yet Landed](https://www.deconstructoroffun.com/blog//2016/11/why-fifa-mobile-hasnt-yet-landed.html) | GamingOnPhone — [DLS Beginners Guide](https://gamingonphone.com/guides/dream-league-soccer-beginners-guide-and-tips/) · [Score! Match Guide](https://gamingonphone.com/guides/score-match-pvp-football-beginners-guide-and-tips/) | Inquisitive Universe — [eFootball Mobile new controls](https://inquisitiveuniverse.com/2022/05/30/efootball-mobile-new-controls/) | QnaBangla — [eFootball Controls Guide 2026](https://en.qnabangla.com/efootball-controls-guide/) | Red Bull — [Sociable Soccer: 7 top tips from the developers](https://www.redbull.com/gb-en/sociable-soccer-tips-guide) | Defector — [Retro Goal](https://defector.com/this-little-soccer-game-on-my-phone-is-fun-as-hell) | Wikipedia — [Rematch](https://en.wikipedia.org/wiki/Rematch_(video_game)) | Shacknews — [Sideswipe controls](https://www.shacknews.com/article/127894/rocket-league-sideswipe-controls) | Game Developer — [Let's Talk About Touching](https://www.gamedeveloper.com/design/let-s-talk-about-touching-making-great-touchscreen-controls) · [Our Solution to Tricky Touch Controls](https://www.gamedeveloper.com/design/our-solution-to-tricky-touch-controls) | Mobile Free To Play — [Touch Control Design](https://mobilefreetoplay.com/control-mechanics/) | UXmatters — [How Do Users Really Hold Mobile Devices?](https://www.uxmatters.com/mt/archives/2013/02/how-do-users-really-hold-mobile-devices.php) | NN/g — [Touch Targets on Touchscreens](https://www.nngroup.com/articles/touch-target-size/) · [Gestures](https://www.nngroup.com/topic/gestures/) | Microsoft Research — [Parhi, Karlson, Bederson, MobileHCI 2006](https://www.microsoft.com/en-us/research/publication/target-size-study-for-one-handed-thumb-use-on-small-touchscreen-devices/) | Buxton — [The limits of expert performance using hierarchic marking menus](https://www.billbuxton.com/MMExpert.html) | ACM — [Nacenta et al., Memorability of gesture sets, CHI 2013](https://dl.acm.org/doi/10.1145/2470654.2466142) · [Behavioral Differences between Tap and Swipe, CHI 2024](https://dl.acm.org/doi/fullHtml/10.1145/3613904.3642272) | ScienceDirect — [Fingertip forces and completion time for touchscreen gestures](https://www.sciencedirect.com/science/article/abs/pii/S1050641116301225) · [Fingerstroke time estimates, Lee et al. 2015](https://www.sciencedirect.com/science/article/abs/pii/S0167945715300373) | GameBench — [Touch latency benchmarks](https://blog.gamebench.net/touch-latency-benchmarks-iphone-xs-max-galaxy-note-10) | TetraLogical — [Target sizes (WCAG/Apple/Material)](https://tetralogical.com/blog/2022/12/20/foundations-target-size/) | BitTopup — [PUBG claw vs thumb](https://bittopup.com/article/PUBG-Mobile-Claw-vs-Thumb-Grip-30-Better-Performance) *(fonte debole, usata solo per la descrizione qualitativa del vincolo a due pollici)*