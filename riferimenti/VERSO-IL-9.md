# VERSO IL 9 — Sintesi della giuria su CALCETTO (voto fermo a 6,4)

Sintesi delle risposte dei giudici che hanno motivato il 6,4 e indicato i requisiti per il 9.
Ogni requisito riporta il numero di giudici che lo citano e la somma degli impatti dichiarati
(in decimi di voto). Il documento è autosufficiente: si possono pianificare le onde di lavoro
senza rileggere le risposte grezze.

---

## 1. Perché il voto è fermo

Le ragioni, in ordine di frequenza. Quasi tutte convergono: **il voto non è fermo per il
confronto col 3D, è fermo perché l'identità dichiarata non è nei pixel.**

### Ragioni riparabili (la quasi totalità del divario)

1. **La promessa tradita della luce** (citata da tutti i giudici). Il gioco si dichiara
   «campetto di quartiere alle sette di sera», ma le scene di gioco — calcetto-azione,
   kickoff, 7v7, 11v11 — sono un «mezzogiorno verde piatto e uniforme»: nessun sole basso,
   nessuna ombra lunga, nessun caldo/freddo, nessun faro. La sera esiste solo nel testo del
   menu, nel tabellone dei rigori e nella lavagnetta di fine partita. È la frattura più
   citata e la più grave: «il gioco racconta a parole ciò che rifiuta di disegnare».

2. **Le figure rotte** (citata da ~14 giudici). I giocatori sono «marionette cadute»,
   «spaghetti con la testa», «tubi con teste piccole»: arti a tubo piegati ad angoli
   impossibili, pose di corsa che leggono come cadute o annaspare, proporzioni incoerenti
   tra figure vicine (il «bambino» di calcetto-gol), pose fotocopiate identiche su tutti,
   numero che fluttua sopra la testa. Chi ha scelto la figura umana viene giudicato dalla
   figura umana: Soccer Stars con dischi disciplinati legge premium, le nostre figure
   «ambiziose e sregolate» no.

3. **Il gioco a due velocità** (citata da ~12 giudici). Le scene ferme sono già a livello
   7,5-8: la lavagnetta di calcetto-fine è unanimemente «l'oggetto migliore del gioco», la
   bacheca di sughero, i cartelloni GOMME 2000/FORNO LUNA, la scena gol col portiere che si
   copre la faccia. Ma la scena dove si passa il 90% del tempo — l'azione — è la più povera
   delle sette. E il voto si dà sull'azione.

4. **Regia assente e quadro vuoto** (citata da ~11 giudici). Il 60-70% del fotogramma
   d'azione è erba vuota; la palla è «un puntino quasi invisibile» soffocata dall'anello
   arancione; in 11v11 i giocatori sono «formiche in un deserto verde»; la minimappa
   galleggia sopra il campo; comandi touch oliva-su-oliva che sembrano disabilitati.

5. **Incoerenza di linguaggio visivo** (citata da ~10 giudici). Quattro lingue nella stessa
   schermata (nastri UI, anello-salvagente, omini piatti, minimappa tecnica); la palla è
   3-4 oggetti diversi tra le scene (ciambella bianca nel gol, ricciolo in azione, pentagoni
   in 7v7); tre verdi diversi nelle tre modalità; HUD «da dev-kit» che tradisce il
   linguaggio lavagna/legno/gesso già vincente altrove.

6. **Campo senza memoria e mondo senza vita** (citata da ~10 giudici). Erba nuova di zecca
   senza terra battuta davanti alle porte, righe di gesso perfette, nessuna gabbia visibile
   nonostante il claim; folla ridotta a «coriandoli di puntini statici» che non reagisce
   nemmeno al gol; menu che è una landing page di testo promozionale invece che un luogo.

### Ragioni di ancoraggio (la quota non riparabile)

**Nessun giudice dichiara il 9 impossibile per principio a un gioco stilizzato.** Zero su
tutti quelli che si sono espressi. Tutti citano Soccer Stars (2D piatto, ~8 in giuria) o
Monument Valley come prova che il 2D eccellente sfonda il tetto.

Tutti però quantificano con onestà una quota di ancoraggio al 3D di FIFA — l'«alone
produttivo» di render, materiali fotorealistici, corpi mocap — che nessun canvas colmerà:
le stime vanno da **0,2 a 0,4 punti**, con mediana attorno a **0,25-0,3 punti** sul divario
totale di 2,6 (6,4 → 9). In sintesi: circa il **90% del divario è dichiarato colmabile** con
disegno, luce e regia su canvas 2D.

---

## 2. I requisiti per il 9

Aggregati per tema, deduplicati, ordinati per impatto totale (somma degli impatti dei
giudici che li citano). Impatti in decimi di voto.

### Tema 1 — La luce delle sette di sera · 17 citazioni · impatto totale ≈ 10,4

Il requisito più citato e più pesante in assoluto, presente in ogni singola risposta.

**Cosa fare.** Una sola luce globale, bassa e calda, in TUTTE le scene di gioco (non solo
nei menu): sole radente da una direzione fissa; ombre lunghe 1,5-4 volte l'altezza della
figura, morbide, tutte parallele; ogni figura con lato caldo illuminato e lato freddo in
ombra (due tinte per maglia, non una); prato con gradiente termico (ambra verso il sole,
verde-blu in ombra) e vignettatura ai bordi; fari/riflettori che si accendono con pozze di
luce visibili — molti giudici chiedono che si accendano DURANTE la partita, cambiando la
scena. Tecnica indicata dai giudici stessi: due gradienti lineari, un radiale per porta,
ombre come ellissi ruotate — «costa meno di 1 ms a frame».

**Verifica osservabile.** Screenshot di calcetto-azione: tutte le ombre parallele entro ±5
gradi e lunghe almeno 1,5x la figura; col contagocce, la tinta del prato ai due angoli
opposti differisce in senso caldo/freddo (≥15 gradi di hue); un estraneo che guarda la scena
per 1 secondo dice spontaneamente «sera/tramonto» senza leggere alcun testo; due foto (primo
e secondo tempo) mostrano temperature colore diverse dello stesso campo.

### Tema 2 — Figure e pose dei giocatori · 13 citazioni · impatto totale ≈ 8,1

Il secondo pilastro: il singolo requisito con l'impatto unitario più alto (fino a 0,8).

**Cosa fare.** Rig con proporzioni bloccate (gabbia fissa testa/busto/gambe, arti mai oltre
2 teste, larghezza busto costante) e un foglio di 8-12 pose chiave disegnate a mano — ciclo
corsa a 4-6 fasi con busto inclinato nel senso del moto e braccia in opposizione, caricamento
tiro + follow-through, scivolata, tuffo portiere, attesa, 2-3 esultanze diverse, delusione —
interpolate solo tra pose legali, mai cinematica libera degli arti. Silhouette a tre masse,
contorno scuro 1-2 px. Varietà di corpi (spilungone, tarchiato, piccoletto), 3+ carnagioni e
capigliature per squadra, numero sulla maglia e non sopra la testa, portiere riconoscibile.

**Verifica osservabile.** Il test della silhouette, citato da quasi tutti: fermo-immagine in
un istante casuale della partita, ogni giocatore riempito di nero puro → un estraneo nomina
l'azione («corre», «tira», «contrasta») per almeno 8 pose su 10; nessun arto in
configurazione anatomicamente impossibile; mai due giocatori nella stessa identica posa nello
stesso fotogramma; due compagni qualsiasi differiscono per almeno un tratto fisico.

### Tema 3 — Coerenza di materiali, UI e palette · 14 citazioni · impatto totale ≈ 6,1

**Cosa fare.** Una sola lingua dei segni in tutto il gioco: il linguaggio lavagna/gesso/
legno/sughero (già vincente in calcetto-fine e calcetto-campi) esteso a HUD, pausa, minimappa
e bottoni; TIRA/FILTRANTE ridisegnati con contrasto pieno (≥4,5:1) e stato premuto, mai più
oliva-su-oliva; minimappa ancorata in un angolo, mai sopra il campo. Legge del contrasto:
nessuna maglia né elemento UI nella famiglia del verde-prato; le due divise a luminanza
distinta (una scura, una chiara), con motivo riconoscibile. Materia su ogni oggetto: tre
stop di luminanza (luce, mezzotono, ombra + highlight) su bottoni, monete, trofei — i sette
trofei-fotocopia diventano sagome e materiali diversi. Due sole voci tipografiche (gesso per
il mondo-lavagna, condensed per l'HUD), massimo 4 corpi per schermata. Palette dichiarata di
~6 colori, tre famiglie mai sovrapposte (prato / maglie / UI).

**Verifica osservabile.** Screenshot d'azione convertito in scala di grigi: squadra A,
squadra B, prato e UI restano quattro valori distinguibili; zoom 200% su qualunque bottone
o maglia: almeno 3 toni distinti, nessuna campitura piatta superstite; affiancando le sette
scene non esiste più alcun pannello flat senza materiale; contrasto testi ≥4,5:1 al
contatore WCAG; area comandi touch sotto il 10% del quadro.

### Tema 4 — Il campo vissuto (la biografia del campetto) · 14 citazioni · impatto totale ≈ 5,7

**Cosa fare.** Il terreno deve raccontare anni di partite: ellissi di terra battuta
consumata davanti alle due porte (di forma diversa tra loro), sul dischetto e a centrocampo;
righe di gesso irregolari, sbiadite a tratti, con interruzioni; strisce di rasatura con
contrasto abbassato sotto il 10% di luminanza (oggi ~25%); toppe d'erba, ciuffi, cartacce.
La gabbia del claim resa visibile: recinzione a maglia romboidale ai bordi (con la sua
ombra), pali dei fari, sagome di case con finestre accese oltre la rete, bici appoggiate,
props unici per campo (sdraio per la Spiaggia, zaini-palo per l'Oratorio). Generato una
volta su canvas offscreen: costo runtime nullo.

**Verifica osservabile.** Zoom sull'area di porta: la chiazza di terra c'è e ha bordo
irregolare; delta di luminanza tra strisce adiacenti sotto il 10%; ogni fermo-immagine
d'azione contiene almeno 3 elementi che dicono «campetto di quartiere» (rete, palo, casa,
usura); il ritaglio senza HUD, mischiato con 4 foto di altri giochi top-down, si riconosce
come CALCETTO al primo colpo.

### Tema 5 — La palla protagonista · 13 citazioni dirette (più 3 combinate con la regia) · impatto totale ≈ 4,4

**Cosa fare.** UN solo disegno di palla in tutto il gioco (oggi sono 3-4 diversi; la
«ciambella bianca» di calcetto-gol va eliminata per sempre): pattern a pannelli/pentagoni
con contorno scuro e ombra di contatto, identico in azione, gol, rigori, minimappa e menu.
Diametro +30/100% (almeno ~2,5% del viewport); rotazione del pattern visibile col
rotolamento; scia di 3-5 fantasmi sopra una soglia di velocità; squash di 1-2 frame al
calcio e al rimbalzo; ombra che si stacca e rimpicciolisce sui palloni alti (la distanza
palla-ombra è la quota); stella d'impatto o sbuffo al contatto. L'indicatore di possesso
ridisegnato perché non copra mai la palla.

**Verifica osservabile.** Un estraneo trova la palla in qualunque foto d'azione in meno di
un secondo; fermo-immagine di un tiro: scia visibile e pattern ruotato rispetto al frame
precedente; crop della palla dalle 4 scene affiancati: stesso oggetto riconoscibile.

### Tema 6 — Regia della camera · 8 citazioni · impatto totale ≈ 3,7

**Cosa fare.** Zoom dinamico che segue la palla con anticipo sulla direzione: stretto sui
duelli e in area, largo solo sui rilanci; giocatori mai sotto ~70-90 px di altezza a 1080p
(in 7v7/11v11 oggi degenerano in pillole); il quadro mai riempito di erba vuota; punch-in
sui tiri; sprite mai tagliati ai bordi; le scritte di scena (CALCIO D'INIZIO) mai sovrapposte
ai marker.

**Verifica osservabile.** Dieci screenshot presi a caso in partita: in almeno 8 la palla è
nel terzo centrale con 4+ giocatori nel quadro; l'erba senza soggetti resta sotto il 40-50%
dell'area (misurabile a griglia); altezza del giocatore attivo ≥7% dell'altezza schermo;
la minimappa non copre mai un giocatore.

### Tema 7 — Folla e quartiere vivi · 10 citazioni · impatto totale ≈ 3,2

**Cosa fare.** Sostituire i puntini statici con sagome umane su 2-3 file che ondeggiano da
ferme (offset sinusoidale), con sciarpe nei colori delle squadre; al gol saltano a braccia
alzate entro mezzo secondo, ola a fasi, flash di fotografi e telefonini accesi quando cala
la sera; un venditore che cammina, un cane, ragazzini sul muretto; cartelloni GOMME 2000 /
FORNO LUNA dipinti come vere insegne (pneumatico, luna col pane) con usura e luce propria;
la lavagnetta segnapunti visibile a bordocampo durante il gioco.

**Verifica osservabile.** Diff tra due fotogrammi consecutivi: la folla è cambiata; a
cavallo di un gol il profilo della folla cambia forma (braccia su) entro 500 ms; a zoom 100%
le sagome leggono come persone, non come grana; mai perfettamente statica per più di 2 secondi.

### Tema 8 — Il gol come scena madre · 11 citazioni · impatto totale ≈ 3,1

**Cosa fare.** Sequenza coreografata di 1,2-2 secondi: hit-stop di 80-120 ms all'impatto,
micro-shake di camera, punch-in sulla palla che varca la linea, rete che si gonfia nel punto
d'impatto e oscilla ~1 secondo, replay rallentato di 1,5-3 s con scia della traiettoria
(ring buffer delle posizioni), poi l'esultanza — con coriandoli dotati di fisica (3 forme,
3 taglie, rotazione, caduta decelerata: mai più rettangoli congelati a mezz'aria) nei colori
della squadra che segna, e scala dei giocatori coerente con la linea di terra.

**Verifica osservabile.** Filmato di 3-5 secondi di un gol: si contano hit-stop, deformazione
della rete nel punto giusto, almeno 2 movimenti di camera, coriandoli che ruotano cadendo;
con moto ridotto attivo la moviola salta senza rompere il flusso.

### Tema 9 — Il menu come scena, non come landing page · 10 citazioni · impatto totale ≈ 3,0

**Cosa fare.** Il muro di testo promozionale («si apre in un secondo, niente account,
niente pubblicità») ridotto a una riga o eliminato; al suo posto un oggetto-eroe o una
scena viva: il campetto al tramonto in attract-mode dietro i pannelli (partitella in loop),
oppure una natura morta dipinta (pallone di cuoio sulla riga di gesso, scarpe appese alla
traversa) su 3 piani di profondità. Coerenza di finzione: unità di tempo uniche (90″, non
90′ con gol a 0:03), nessun pallone tagliato dietro le barre, gli sfondi a chiazze-artefatto
di calcetto-fine sostituiti da un crepuscolo dipinto. Ogni schermata un luogo riconoscibile
dalla sola silhouette/palette.

**Verifica osservabile.** Mostrare il menu 3 secondi a un estraneo: risponde «calcio di
sera», non «pagina di impostazioni»; il primo punto dove cade l'occhio è un'immagine, non un
blocco di testo; due scatti a 2 secondi di distanza differiscono (movimento); zero frasi
autopromozionali.

### Tema 10 — Volti e figurine degli eroi · 3 citazioni · impatto totale ≈ 1,2

**Cosa fare.** Il gioco ha nomi meravigliosi (Saverio Piedebuono, Peppe Mano Santa, Gino
Fulmine) e nessun volto. Generatore procedurale di ritratti-caricatura da seed del nome
(forma testa, pelle, capelli, barba, espressione), stile figurina Panini, usato in: righe
della rosa, banner GOL accanto al nome del marcatore, tabellino finale, presentazione dei
capitani al kickoff.

**Verifica osservabile.** Cinque ritratti chiaramente distinti in calcetto-rosa; il volto
del marcatore nel banner gol; lo stesso seed produce lo stesso volto tra partite diverse.

### Tema 11 — I rigori come duello · 3 citazioni · impatto totale ≈ 0,7

**Cosa fare.** Via i tre bottoni SIN/CEN/DES: mira col gesto (trascina e rilascia sulla
porta, freccia/bersaglio che segue il dito); portiere che ondeggia e accenna finte PRIMA del
tiro, tuffo in posa disegnata; camera bassa dietro il tiratore con push-in sulla rincorsa;
rete che si gonfia nella zona scelta, flash della folla, tabellone che scatta a palette.

**Verifica osservabile.** Filmato di un rigore intero: l'input avviene sulla porta e i tre
bottoni non esistono più; il portiere si muove prima del tiro; la rete si deforma nella zona
mirata; almeno un flash nel fotogramma dell'impatto.

---

## 3. Cosa li sbalordirebbe

Le risposte «wow», raggruppate, dalle più citate:

1. **Il freeze-frame test** (~10 giudici, la formula dominante). Mettere in pausa in un
   istante QUALSIASI dell'azione — scelto dal giudice, non coreografato — e trovare un
   fotogramma che regge da solo come poster: ombre lunghe coerenti, silhouette che si
   leggono come verbi, palla con la scia, terra battuta in area, quartiere acceso dietro la
   rete. Frase ricorrente: «oggi il vostro poster è la lavagnetta di fine partita, una scena
   ferma; il giorno in cui il fotogramma casuale dell'AZIONE vale quanto quella lavagnetta,
   il 9 lo scrivo».

2. **Premere GIOCA e trovare la sera promessa** (~8 giudici). Il primo fotogramma d'azione
   che È le sette di sera senza bisogno di leggere nulla: il momento in cui «lo screenshot
   d'azione e la promessa scritta nel menu sono la stessa immagine» e il gioco «smette di
   raccontare la sua identità e la fa vedere». Più giudici dichiarano che questo da solo
   sposterebbe il voto verso 7,5-8 «prima ancora di toccare i tasti».

3. **La sera come meccanica: il time-lapse dei 90 secondi** (~4-5 giudici). La luce che
   cala DURANTE la partita: ombre lunghe e dorate all'inizio che si allungano e ruotano, e
   a metà partita i fari che si accendono uno alla volta — clic, ronzio, pozza di luce, le
   falene, le finestre dei palazzi che si accendono — fino al golden goal sotto i riflettori
   con ombre a quattro raggi. Citazione: «quel time-lapse emotivo non ce l'ha FIFA, non ce
   l'ha nessuno: è l'identità dichiarata che diventa meccanica visiva».

4. **Il raccordo menu → partita** (~2-3 giudici). Accorgersi che la partita e il menu sono
   lo stesso luogo alla stessa ora — perfino scoprire che dietro il menu girava già la
   stessa scena di gioco in attract-mode. «Il momento in cui smetto di confrontarvi con FIFA
   e inizio a giudicarvi come Monument Valley».

---

## 4. La lettura

**Quanto del divario è coperto.** Il divario 6,4 → 9 vale 2,6 punti. La quota di ancoraggio
al 3D dichiarata dai giudici sta tra 0,2 e 0,4 punti, con mediana ~0,25-0,3: nessuno — zero
giudici — considera il 9 precluso per principio a un gioco stilizzato, e tutti portano
Soccer Stars o Monument Valley come prova a discarico. Restano quindi ~2,3 punti dichiarati
riparabili, e i requisiti aggregati li coprono con ampio margine: i primi due temi da soli
(luce della sera ≈10,4 di impatto cumulato su 17 citazioni, figure ≈8,1 su 13) sono citati
da praticamente tutta la giuria, il che significa che il loro effetto non è additivo ma
condiviso — ogni giudice sposterebbe il proprio voto di 0,5-0,8 su ciascuno. Tradotto:
eseguire bene SOLO luce + figure vale plausibilmente 1,1-1,4 punti di media giuria; luce +
figure + coerenza materiali + campo vissuto copre l'intero tragitto fino a ~8,5-8,7, e il
resto (palla, regia, folla, scene madri) serve a consolidare il 9 presso i giudici più
esigenti. L'obiettivo realistico non è 9,0 secco: è 8,6-8,9 di media con la coda di
ancoraggio che tiene due o tre schede a 8,5.

**La sequenza di onde a massimo impatto e minimo rischio.** Onda 1 — *la sera* (tema 1 +
tema 4): è pura passata di rendering (gradienti, ellissi-ombra, canvas offscreen per
l'usura), rischio tecnico quasi nullo, zero impatto sul gameplay, ed è il requisito più
citato in assoluto più il suo complemento naturale; da sola sana la frattura
identità/pixel che motiva la prima riga di ogni scheda. Onda 2 — *le figure* (tema 2 +
tema 10): è l'onda più rischiosa (richiede un foglio pose e il test della silhouette come
gate di collaudo, non cinematica libera), quindi va isolata e verificata da sola, con i
volti-figurina come coda a basso rischio. Onda 3 — *la leggibilità* (temi 3, 5, 6 insieme):
palla unica protagonista, camera che riempie il quadro, HUD/palette in una sola lingua —
tre temi medi che condividono la stessa natura (contrasto e coerenza) e le stesse verifiche
a screenshot, perfetti per una passata correttiva a sciame. Onda 4 — *le scene madri*
(temi 7, 8, 9, 11): folla che reagisce, gol coreografato, menu-scena, rigori col gesto —
rifiniture indipendenti tra loro, parallelizzabili, che trasformano l'8,5 in 9 presso i
giudici che chiedono il «wow». Dopo ogni onda: il freeze-frame test come collaudo unico —
un fermo-immagine casuale dell'azione, giudicato come poster — perché è, alla lettera, il
criterio col quale la giuria ha promesso di riscrivere il voto.
