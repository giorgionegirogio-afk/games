# Dove siamo, e cosa manca

Aggiornato al 18 agosto 2026. Questo file serve a riprendere senza rileggere
niente altro.

**Ramo:** `main`. **Ultimo commit:** `60ef759`. Il lavoro di due giornate intere
è **non committato**: `CALCETTO-il-gioco.html` più una ventina di strumenti.
Verificare coi cancelli prima di committare.

**Il gioco adesso:** 1.681.472 byte, md5 `d9e0f8336742039642fcb8bd18bdaf6f`.
Tre toppe applicate il 18 agosto, in fila e verificate una per una: l'identità
delle squadre, l'ombra che porta la posa, l'11 contro 11 che non tirava. Costo
delle tre insieme, misura appaiata: **fra −0,5% e +0,9%, col segno dichiarato
non sicuro** — cioè indistinguibile da zero.

---

## Il verdetto, e come si muove

Il committente ha chiesto: **giuria di 26 giudici, il nostro 8-9 e i competitor 3-4.**

| momento | voto | note |
|---|---|---|
| sei appelli piatti | 6,4 | prima dell'interrogatorio |
| dopo 4 onde | 7,1 | luce, figure, leggibilità, scene madri |
| dopo la correttiva | 7,3 | 6 difetti su 10 spariti |
| dopo l'onda 6 | 7,9 | la sera, il campo vissuto, il quadro pieno |
| **dopo la passata del pollice** | **8,2** | il gioco impara a segnare |

Il giudice quantifica **~8,6** con le voci che restano, e mette il 9 dietro due
cose sole: **le pose** e **il centro del quadro**.

Le altre due lenti, lo stesso giorno: **7,3** (chi gioca col pollice, era 6,4) e
**6,2** (l'ancoraggio ai concorrenti). Il gioco vale molto più fotografato che
giocato — ed è la frase che ha riordinato tutto il lavoro:

> «Il gioco vince su tutto quello che si può fotografare e perde su quello che
> si prova col pollice.»

---

## La scoperta che vale più di tutte: in questo gioco non si segnava

Misurato su 50 partite a semi dichiarati con `strumenti/_eventi.js`, che è il
**primo strumento del progetto che misura il gioco invece dell'immagine**:

```
prima:  ZERO gol su azione in 50 partite · 73% di 0-0 al 90' · 67% ai rigori
        11 tiri a partita, 79 palloni vaganti — il caos c'era, mancava la conseguenza
dopo:   1,42 gol a partita · 20% di 0-0 · 18% ai rigori
        parate 1 -> 3 · legni 0,40 -> 0,96 · momenti da porta al minuto 0,91 -> 3,26
```

**La causa era aritmetica.** Con l'attrito `b.vx *= 0.35^dt` un pallone percorre
al massimo `v0/1,0498` unità. Il tiro partiva a 313 u/s → 298 unità di corsa,
contro una distanza mediana di tiro di 326: **non arrivava in porta nemmeno a
campo vuoto**, zero volte su ventisette. E il tiro perfetto mirava al palo con
l'effetto a giro nello stesso verso della mira: 18 arrivi su 19 fuori dallo
specchio, per costruzione. Più due difetti del portiere: armava il tuffo su una
*distanza* invece che su un *tempo*, e mentre si rialzava il suo corpo spariva.

L'equità **migliora**: lo squilibrio fra le due squadre scende da +0,330 a
+0,195 reti, perché la lotteria dei rigori decideva due partite su tre.

---

## Undici strumenti ciechi trovati in due giorni

La regola di casa era «uno strumento che attesta invece di misurare è peggio di
nessuno strumento», e valeva dieci casi. Adesso ventuno. **Quattro delle sei
critiche più dure della giuria erano artefatti dei nostri strumenti.**

| # | strumento | la bugia |
|---|---|---|
| 11 | `prestazione.js` | confronta con un riferimento preso a banco libero: col server di sviluppo del committente acceso segnava +100% dove il costo vero era +11%. Cura: **misura appaiata**, i due file alternati sullo stesso banco nello stesso minuto |
| 12 | `silhouette.js` | chiedeva a un corpo disteso visto di fronte di essere più largo che alto: servirebbe un uomo lungo 1,62 m in orizzontale. 12 combinazioni su 120 irraggiungibili, tetto vero 108 |
| 13 | `folla.js` | sommava forma **e traslazione** con segno opposto: la folla salta di 10 unità su una finestra alta 38, e l'anello di tribuna esce dal bordo alto mentre le braccia entrano dal basso |
| 14 | `silhouette.js` (bis) | dichiarava «8 su 10 nominabili» mentre tre **provini ciechi** con persone diverse ne riconoscevano da zero a due |
| 15 | `scatta.js` (HUD) | forzava il possesso «così la foto non dipende da chi ha la palla»: ha mostrato alla giuria otto fotogrammi in cui i pulsanti dicevano TIRA senza palla |
| 16 | `scatta.js` (fine) | fabbricava il tabellino con `forceGoal`: ha ingannato la giuria **due volte in direzioni opposte** — prima «tre conclusioni in novanta secondi», poi «ogni tiro entra, precisione 100%» |
| 17 | `istantanea.js` (campioni) | **gli otto istanti erano sei.** Pescati uniformi, potevano cadere vicinissimi; e il passo era `max(0, bersaglio − orologio)`, quindi un istante spostato avanti per uscire da una celebrazione faceva cadere il successivo **alle sue spalle**, passo zero, stessa tela rimisurata. Non identica: i due ridisegni del riferimento avevano intanto mosso la camera di due fotogrammi senza aggiornare la trasformazione letta dallo strumento — **è per questo che «nell'istante 8 la palla non c'era»**. Il cronometro stampato tornava indietro (t=39,0 s dopo t=40,1 s) |
| 18 | `istantanea.js` (palla) | l'**atteso** era il numero falso: deduceva il raggio da `B_R` (8) mentre il gioco disegna a `B_R × B_DIS = 10,72` e lo dichiara in `__test.pallaRaggio()`, hook scritto apposta e mai letto. I 48 px erano la palla. Ma il sospetto era fondato per costruzione: il buco perdonato valeva 3,2 unità dove il gioco ne lascia 2,6 |
| 19 | `istantanea.js` (denominatore) | «erba vuota» misurata sul **quadro intero**, dove sotto l'interfaccia erba non ce n'è né può essercene. Corretto sull'area giocabile: **il tetto si alza, non si abbassa** — lo stesso quadro passa da 29,2% a 33,4%, e il caso peggiore da 41,7% a 47,8%, due punti dal tetto dove ne aveva otto |
| 20 | `avvio.js` (colonna «analisi») | la sua intestazione dice: «ANALISI = navigationStart → DOMContentLoaded. È il costo di **leggere e compilare** il file: la fase che cresce col peso». Ma DOMContentLoaded non scatta a compilazione finita: scatta quando ogni script in linea ha finito di **eseguire**. Misurato spezzando quel numero in quattro (`strumenti/_sonda-avvio.js`): leggere e compilare sono il **15,6%**. Il tetto in kilobyte, che ha governato il progetto per settimane, sorvegliava un sesto della stanza |
| 22 | `istantanea.js` (misura 7) | **il cancello nato da un rilievo vero, che non misura il rilievo.** Il tetto è irraggiungibile per aritmetica: una figura rompe 1,98 celle, quindi stare sotto il 40% chiede **9,7 figure in un riquadro di 273×123 unità** dove il 5v5 ne ha dieci in tutto il campo. Non conta i corpi: una manovra che porta i corpi al centro da 12 a 21 lascia il numero **identico al decimale**. E ha un verde falso — il «fotogramma manifesto» al 6,3% è prato deserto che passa perché la tinta del manto sotto i fari è 89° contro una soglia a 90 |
| 21 | `_identita.js` | **la stessa ferita, entrata da una seconda porta.** Nato copiando il campionamento di `istantanea.js`, ne ha ereditato il difetto insieme al resto: istanti 4 e 5 tutti e due al secondo 38 con la stessa coppia peggiore al decimale, 7 e 8 tutti e due al 49. Sei fotogrammi che si dichiaravano otto, e uno «0 su 52 giocatori» che contava due volte tredici uomini. Corretto, il difetto delle divise era **peggiore** di quanto dichiarato (coppia peggiore 5,5 e non 9,3) e il guadagno più grande. **Una ferita chiusa in un file e lasciata aperta in quello accanto è una ferita aperta** |

Più due nati e riparati in giornata: `tutti.js` misurava tempi su un banco ancora
caldo, e l'attrezzo dei nomi dichiarava successo senza aver misurato nulla.

I tre casi di `istantanea.js` hanno una lezione in comune che vale da sola:
**un banco che si guarda allo specchio trova cose che nessun cancello trova.**
Adesso lo strumento misura la propria indipendenza — differenza media assoluta di
luminanza fra ogni coppia di istanti, 94.348 campioni per coppia — e nel banco
c'è un **gemello sporco** permanente: lo stesso fotogramma rimisurato dopo i
ridisegni del riferimento, cioè esattamente la coppia che il banco produceva da
sé. Vale 5,12 contro una soglia di 7,0, e viene riconosciuto. La coppia più
vicina fra istanti veri adesso vale 9,29 con il 35% di quadro cambiato; con il
campionamento vecchio la corsa **fallisce** e dice quali coppie sono la stessa
foto.

**Il metodo che li ha trovati**: il **provino cieco**. Una persona che non
conosce la chiave di risposta e a cui è vietato cercarla. Costa un minuto, e ha
spostato il lavoro tre volte in direzioni che nessuna misura indicava.

---

## Il metodo che va veloce

`strumenti/tutti.js`: tutti i cancelli **insieme**, quattro alla volta.
**357 secondi invece di 960.** Ma il guadagno vero è un altro: eseguendoli
*tutti* ha scoperto in un colpo tre cancelli rossi che nessuno cercava.

Tre cose che rendono onesto quel comando:
- **l'impronta del file prima e dopo**: se cambia, il referto è **NULLO**. Un
  lavoratore che scrive mentre un verificatore misura produce due numeri che
  descrivono file diversi, e nessuno se ne accorge;
- **i cancelli cronometrici girano da soli**, dopo, a campo libero: `giocata` e
  `avvio` misurano tempi e sotto contesa bocciano il gioco per un ritardo che
  non è suo;
- **la misura del carico**: cronometra un lavoro aritmetico fisso e lo confronta
  col più veloce mai visto. Sopra 1,5× declassa il verdetto da condanna a
  sospetto.

E la forma di lavoro che ha funzionato: **diagnosi in parallelo, scrittura in
fila.** N specialisti in sola lettura, ognuno su un difetto, che consegnano una
toppa cerca/sostituisci provata su una copia fuori dal repo e che *si rifiuta di
scrivere* se un ancoraggio non si trova esattamente una volta. Poi le applico in
fila. Prima: tre ore per giro.

---

## Cosa resta per il 9, in ordine di resa (parole del giudice)

| | | decimi |
|---|---|---|
| 1 | **Le pose che dicono il verbo — ed è UN VERBO SOLO.** Misurato su 13.560 fotogrammi di verbo: `tira` 3,3% di fotogrammi illeggibili, `scivola` 6,1%, `esulta` 39,1% (ma vive sulla quota, 72-79 px), **`para` 63,3%** con 8,1 px di asse sagittale. La causa in una riga: **il portiere si tuffa lungo la bocca della porta, la porta è verticale sullo schermo, e la vista non ruota mai.** Ed è **la posa**, non la camera: la clip `tuffo` ha dz 1,382 contro dy 0,605, mentre `cielo` e `pugno` hanno dy 1,56-1,59 e si leggono sempre. Le tre strade già chiuse con numeri: il beccheggio (σ2 non contiene l'elevazione; e a 16° la figura si stringe del 22,5% e il tuffo si accorcia al 43-54%), l'ombra (due provini ciechi: 1 su 10, poi 0 su 10; zero pixel sopra 3:1 contro l'erba), e l'ingrandimento (il rapporto gesto/tratto è **invariante di scala**, verificato a k da 0,5 a 3). In lavorazione: riscrivere il tuffo sull'asse della quota | 1,5 |
| 2 | ~~L'11 contro 11 che non tira mai~~ **CHIUSO.** L'attrito non sapeva quanto è grande il campo: `k = −ln(0,35) = 1,0498` per unità percorsa dà corsa massima 819 unità su un campo lungo 2300, cioè il 36% contro il 71% del 5v5. Più: i «sette tiri a partita» erano rigori, e il ramo di copertura dell'intelligenza artificiale ha punto fisso al 46% del campo, quindi sette uomini su dieci restavano dietro. Ora 0,79 momenti da porta al minuto (erano 0,00) e zero partite 0-0 in mediana | fatto |
| 3 | **Il centro del quadro**: cancello nuovo, rosso in 5 istanti su 8 (43-75% contro un tetto del 40%) | 0,4 |
| 4 | **L'avvio**: **2870 ms** a 4× contro un tetto di 2 s, dispersione 2,2%. Lo sforo è **870 ms, non settemila**: i numeri precedenti (10203, 8872, 6140) erano tutti rumore di banco. Non è il peso — leggere e compilare valgono ~9% del tempo alla palla. Una cura applicata: il manto si cuoceva due volte, la seconda da `document.fonts.ready`, ~200 ms dentro l'avvio della partita; ora la ricottura è condizionata a una misura e rimandata alla quiete | 0,2 |
| 5 | **HUD e bussola** che non mangino mai il protagonista (restano due casi nell'11v11) | 0,2 |
| 6 | La coda: la palla al petto invece che ai piedi, la palla che si separa dallo stato durante il tiro, l'etichetta «AVVERSARIO IN 2 9"» spezzata | 0,3 |

E una cosa fuori elenco, che il giudice chiama il traguardo vero: **il fermo
immagine casuale dell'azione che valga quanto la lavagnetta di fine partita.**

---

## I cancelli (ultima esecuzione completa)

```
collaudo 36/36 · misura 7/7 · senza-rete 6/6 · equità 4/4 (0,000 al bit)
giocata 8/8 (da solo: è cronometrico) · folla 4/4 · seme · gabbia · volti · silhouette
avvio: ~10 s a 4× contro 2 s — aperto
prestazione: solo in modo appaiato (--contro HEAD); il modo assoluto non è credibile qui

istantanea.js, su otto istanti davvero indipendenti — 46 misure su 56:
  erba senza soggetti 4/8   palla 8/8   altezza figura 8/8   temperatura 8/8
  ombre 5/8   centro a sera 7/8   CENTRO ABITATO 6/8  (era 3/8 col metro rotto)
banco degli strumenti: 11 prove su 11, VERDE per la prima volta
```

**Il totale è sceso da 48 a 46 e non è una regressione: è severità.** Quel 48
conteneva un cancello del terzo centrale che nessuna inquadratura poteva
superare, e una misura dell'erba comprata dallo stesso difetto di tinta —
`hueMin: 90` buttava via il 9,95% del manto e **il 50,1% dei pixel sotto la
pozza dei fari**. Portata a 60 (l'unico avvallo dell'istogramma sta a 58-60° e
il pavimento tiene il 99,1% del manto), l'erba vuota vera esce: **57-63%
dell'area giocabile contro un tetto di 50**. È un difetto nuovo *visibile*, non
un difetto nuovo. Da ri-giustificare: quel tetto del 50% era tarato sulla
definizione di prato vecchia, più stretta.

Nessun totale di questo strumento si confronta riga per riga con quelli di ieri:
il campionamento stratificato ha spostato tutti gli otto bersagli, e la famiglia
di tinta del prato è cambiata. Si confrontano i verdetti, non le colonne.

## Come si riprende

```bash
cd C:/Users/Utenteee/Desktop/GitHub/games
node strumenti/tutti.js --tutto --insieme 4      # tutta la batteria, in parallelo
node strumenti/giocata.js --tutte                 # da solo: cronometrico
node strumenti/_eventi.js                         # il gioco, non l'immagine
node strumenti/prestazione.js --contro HEAD       # l'unico confronto onesto qui
python android/costruisci.py && python android/verifica.py
```

## Le regole pagate

1. Le passate correttive rendono più di quelle creative.
2. Un solo «peggio» è bloccante.
3. I cancelli li esegue chi giudica, non chi lavora.
4. **Uno strumento che attesta invece di misurare è peggio di nessuno
   strumento** — ventuno casi. E quando ne ripari uno, **cerca subito la
   stessa ferita negli strumenti che l'hanno copiato**: `_identita.js` aveva
   ereditato il campionamento difettoso di `istantanea.js` insieme al resto.
5. Un agente morto non è un via libera: i workflow si fermano su null.
6. Il metro si rettifica con data e fonte quando la realtà lo supera.
7. Prima di accusare il metro, interrogalo.
8. **Prima di chiamare regressione un numero rosso, misura quanto valeva
   sull'ultimo commit.** Costa trenta secondi; tre diagnosi su quattro, in una
   giornata, non erano regressioni.
9. **Un cancello che approssima un giudizio umano va tarato contro giudizi
   umani veri, ripetuti, da persone che non conoscono la risposta.**
10. **Il cancello viene superato per la via più corta, e la cosa che
    rappresentava non arriva.** «Palla trovabile» ottenuto accendendo la palla;
    «contrasto 3:1» ottenuto sbiancando la maglia invece di spostarne la tinta —
    e quel blocco ha impedito alla sera di arrivare per mesi.
11. **Guarda dove campiona il cancello.** «Erba vuota 8/8» valeva sul quadro
    intero; sul terzo centrale, dove cade l'occhio, il prato è vuoto per due terzi.
12. **Misura il gioco, non solo l'immagine.** Sedici strumenti guardavano
    fotografie: nessuno si era accorto che non si segnava mai.
13. **Fai misurare al banco la propria indipendenza.** Otto campioni erano sei, e
    nessuna delle sette misure poteva accorgersene: guardavano tutte il
    contenuto, nessuna guardava *se stessa*. Il difetto si è visto solo quando lo
    strumento ha confrontato i propri campioni fra loro.
14. **Guarda il denominatore, non solo la soglia.** «Erba vuota» si misurava
    anche sotto l'interfaccia, dove erba non può esserci. La guardia giusta non è
    un numero ma una struttura: il numeratore non si tocca, così dichiarare più
    interfaccia fa **salire** la percentuale. Una dichiarazione che può solo
    nuocere a chi la fa non ha bisogno di essere creduta.
15. **Un numero con la dispersione fuori soglia non si scrive da nessuna
    parte.** L'avvio ha portato per due giorni l'etichetta «~10 s contro un
    tetto di 2 s», e a banco scarico vale **2870 ms con dispersione 2,2%**.
    Le tre misure precedenti — 10203, 8872, 6140 — erano tutte il banco. Il
    guaio non è stato misurare male: è stato **trascrivere** un numero che
    lo strumento aveva già dichiarato non valido, e poi ragionarci sopra.
17. **Un provino cieco con una persona sola non risolve una differenza
    piccola.** Due giudici, lo stesso foglio, la stessa chiave: il primo dà
    la posa nuova 1 su 10 contro 4 su 10 della vecchia, il secondo 6 su 10
    contro 5. In tutto hanno nominato 5 tuffi contro 11 — la varianza **fra
    le persone** è più grande della differenza fra le cose confrontate. Con
    un solo giudice avremmo scritto «peggiorata» o «migliorata» a seconda di
    chi capitava. Il referto giusto è «questa misura non sa distinguerle»,
    e va detto con la forbice accanto.
18. **Un provino cieco ha bisogno di un testimone.** Nel foglio a sola ombra
    dieci celle su venti erano capsule lisce, che per costruzione non possono
    dire niente. La persona le ha dichiarate tutte e dieci «non nominabile»:
    solo per questo le altre dieci risposte valgono qualcosa. Senza testimone,
    «zero verbi riconosciuti» e «la persona non ci teneva» sono lo stesso
    referto. E va detto in anticipo che alcune celle potrebbero non essere
    nominabili, se no si inventa — nel primo provino, senza avvertenza, sono
    uscite due sole parole per venti immagini.
19. **Un falso troppo gentile non prova niente.** Il primo anello dipinto per
    ingannare il cancello metteva lo zoccolo nero sul varco: nessun raggio ci
    arrivava, e il cancello «passava» la prova senza averla affrontata. Un falso
    va costruito nel *caso peggiore*, con la stessa geometria del gioco.
