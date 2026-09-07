# La moviola oggi — voce #85 (analisi in sola lettura, 7 settembre 2026)

Reclamo del committente: «il replay dei goal va a scatti» e «nel replay si
vede tutta l'azione fino al goal di rovesciata, quindi anche il dribbling le
finte e le azioni con tante catene di possesso palla e dribbling».
Indizio già a registro (`PUNTO-DEL-LAVORO.md`): «residuo della moviola — i
cronometri dei gesti non interpolati».

**Il verdetto in una riga**: la metà «azione intera» del reclamo è già
CURATA e in `main` da una settimana (voce #85, compito 1, 1° settembre 2026,
commit `21ff404`); la metà «va a scatti» è vera SOLO per una classe precisa
di dati — i cronometri dei gesti — e la misura di oggi la quantifica: nel
replay, il gesto (calcio, scivolata, contrasto) resta congelato per 4-8
fotogrammi di schermo consecutivi mentre la posizione scorre liscia, perché
il codice interpola posizione/direzione/respiro ma NON i cronometri. Ogni
numero qui sotto è citato con file:riga letta oggi o con l'uscita della
sonda in `fuori/`.

---

## 1. Come funziona la moviola oggi

**Dove si registra**: un anello circolare in memoria, `G.rec` (dichiarato
`CALCETTO-il-gioco.html:8380`), riempito da `registraFotogramma(dt)`
(`:34256-34287`) a **REC_HZ=20 campioni al secondo**, per una finestra di
**REC_SEC=9 secondi** (`REC_MAX = REC_HZ*REC_SEC = 180` campioni,
`:34253-34254`). Ogni campione porta: la posizione e rotazione del pallone
più il LATO di chi ce l'ha (`sq: squadraDelPallone()`, `:34267`); e per ogni
giocatore — posizione, direzione (fx/fy), `out`, `slide`, `dive`, fase del
passo, `amp`, `squash`, `ang`, `bob`, `kickT`/`kickB`, `charge`/
`chargeKind`/`chargeT`, `rove`/`roveT1`, `kickClip` (`:34270-34283`).

**Il "nastro" delle sfide NON c'entra**: `{seme, taglia, gol, nastro}`
(voce #96) è il registro dei COMANDI (`Reg`, serializzato da
`Reg.serializza()`, `:41348-41400`) che il server ri-simula da zero per
verificare un punteggio o mostrare una sfida a un altro telefono
(`:40763-40799`, "LE DUE SQUADRE VIAGGIANO DENTRO IL NASTRO"). `G.rec` è
tutt'altra cosa: un buffer locale di SOLO DISEGNO, mai serializzato, mai
inviato, azzerato a ogni fine-replay (`G.rec.length=0`, `:16593`). I due
sistemi non condividono una riga di codice; allungare o interpolare la
moviola visiva non tocca il nastro delle sfide, verificato leggendo
entrambi i percorsi (nessun riferimento incrociato in tutto il file).

**Come si riproduce**: NON è ri-simulazione fisica — è rilettura di
campioni salvati. Quando parte (`avviaMoviola()`, `:34312-34351`), risale
l'anello all'indietro fino all'ultimo cambio di lato del pallone che duri
almeno sei campioni di fila (0,3 s, per non spezzare l'azione su un rimpallo
singolo, `:34328-34339`), con un tetto di 7 s e un pavimento di 0,8 s.
Poi `aggiornaMoviola(dt)` (`:34355-34384`) fa scorrere un indice `M.i` nei
campioni: la velocità parte proporzionale alla lunghezza del nastro (fino a
2×) e converge sempre a 0,34× sulla rete (`:34367-34371`).

**Come si disegna — STESSA pipeline del vivo, verificato**:
`disegnaMoviola()` (`:34413-34459`) non chiama un renderer ridotto: scrive
lo stato del campione dentro gli STESSI oggetti `G.players[k]`/`G.ball` che
il gioco vivo muove, e il resto della pipeline di disegno (`rigStato`,
`:33379-33520`, e `rigAngolo`, `:33361-33378`) legge quei campi dei
giocatori senza NESSUN controllo su `G.scene` o `G.moviola` — verificato
leggendo per intero il corpo di entrambe le funzioni: gli unici riferimenti
a `G.` in tutto quel blocco sono `G.goalIdx`/`G.goalMin` per scegliere quale
esultanza fare, nulla che parli di replay. La moviola aggiunge solo
SOVRAPPOSIZIONI dedicate (bande nere, cerchio sul marcatore, targhetta
RETE) sopra lo stesso disegno dei corpi.

---

## 2. Perché va a scatti — misurato, non un'opinione

### 2.1 Che cosa il codice interpola oggi (letto, non dedotto)

Dentro `disegnaMoviola()`, fra il campione corrente `a` e il successivo
`nx`, con frazione `fr` (0 durante i fermi-immagine 'entra'/'rete'/'uscita',
altrimenti la parte frazionaria del tempo scorso, `:34417-34421`):

- **interpolato con `mix()`**: `x, y` (`:34426`), la direzione della faccia
  `fx/fy` rinormalizzata (`:34427-34432`), `amp, squash, ang, bob`
  (`:34434-34435`), e il pallone `x,y,z,rot` (`:34456-34458`, corretto la
  stessa sera con un commit dedicato dopo che un banco misurò l'83% dei
  fotogrammi di schermo col pallone fermo).
- **copiato di peso dal campione `f`, ZERO interpolazione**:
  `q.kickT=f.kt; q.kickB=f.kb;` (`:34436`), `q.slide=f.slide; q.dive=f.dive;`
  (`:34437`), `q.charge/chargeKind/chargeT` (`:34441`), `q.rove/roveT1`
  (`:34443`), `q.kickClip` (`:34444`).

Il commento dell'autore (`:34401-34412`) giustifica questa scelta dicendo
che sono «STATO» discreto (fase del passo, scivolata, tuffo, carica,
rovesciata, clip) e mescolarli «inventerebbe una posa mai vista». Vero per
`chargeKind` (stringa) e per il SEGNO di `rove`/`slide`/`charge` (evento
sì/no) — ma `kickT`, `kickB`, `charge`, `roveT1` non sono flag: sono
**cronometri continui** (`p.kickT=Math.max(0,p.kickT-dt)`, `:17357`; la
carica cresce con `p.charge+=dt`, `:16002`) che pilotano direttamente il
grado di avanzamento del gesto disegnato — esattamente il tipo di numero
che `amp/squash/ang/bob` già dimostrano si può mescolare in sicurezza.
`rigStato` li legge senza passare da nessuna funzione di smorzamento:
`st.u = t1 + (0.98-t1)*clamp(w,0,1)` con `w = 1-p.kickB/KICK_B_T` per il
calcio (`:33485-33488`); `st.u=0.08+0.62*clamp(p.slide/SLIDE_T,0,1)` per la
scivolata (`:33482`); `st.u = 0.26 + 0.72*clamp(1-p.contrasto/CONTRASTO_FIN,0,1)`
per il contrasto (`:33501-33503`).

**Una seconda falla, più grave**: `p.contrasto`, `p.presaT`, `p.gkManiT`,
`p.rinvT`, `p.recover` esistono come campi veri del giocatore (confermato
dalla sonda leggendo `Object.keys()` di un giocatore vivo: compaiono tutti)
ma **non sono fra i campi registrati** in `registraFotogramma`
(`:34270-34283` — l'elenco si ferma a `kc:q.kickClip`, nessun `co`/`pt`/
`gm`/`rn`). Un gol nato da un contrasto vinto o da una respinta col pugno
del portiere non ha nel nastro il dato per rifare quella posa: il replay
mostra quello che quei campi valgono ADESSO (nel vivo, non nel momento
registrato), non quello che valevano allora — non "non interpolato", proprio
"non registrato".

### 2.2 La misura: sonda Playwright, seme dichiarato

Sonda scritta oggi: `fuori/_sonda-moviola-scatti.js` (schema `servi()`
ripreso da `strumenti/_q-proporzioni.js`). Semina `20260907`, gioca CPU
contro CPU 9,5 s (`__test.setCpuVsCpu(true)`, riempie l'anello con azione
vera), forza un gol con `__test.forceGoal(team)`, poi cattura OGNI
fotogramma di schermo (passo fisso `simulate(1/60)`, `DT=1/60` a
`CALCETTO-il-gioco.html:3994`) sia nei 9,5 s prima del gol (il "vivo") sia
durante tutta la moviola, leggendo `__test.players`/`__test.ball`/
`__test.moviola` — tutti hook già esposti (`:41978-41979`, `:42548-42549`).
Uscita completa: `fuori/moviola-scatti-20260907.json` (righe grezze
comprese, per riverificare).

**Risultato — il vivo (570 fotogrammi, 9,5 s a 60 Hz)**:

| campo | salto max/fotogramma | run più lunga "fermo mentre attivo" |
|---|---|---|
| x | 3,40 | — |
| y | 12,01 | — |
| kickT | 0,2033 | 5 fotogrammi* |
| kickB | 0,2433 | 5 fotogrammi* |
| charge | 1,2333 | 5 fotogrammi* |
| slide, contrasto, rove | 0,00 | 0 (mai attivi in questo run) |

\* verificato che NON sono freekick/duello (0 transizioni toccano quella
scena, controllato sul JSON grezzo): sono ritocchi ravvicinati genuini del
dribbling CPU — pochi episodi su 570 fotogrammi, fuori perimetro di questa
voce, non scomposti oltre.

**Risultato — il replay, SOLO fase `'gioca'` (il nastro che scorre; esclude
i fermi-immagine dichiarati 'entra'/'rete'/'uscita'): 90 fotogrammi**:

| campo | salto max/fotogramma | run più lunga "fermo mentre attivo" |
|---|---|---|
| x | 2,30 | — |
| y | 2,48 | — |
| kickT | 0,15 | **5 fotogrammi** |
| kickB | 0,19 | **5 fotogrammi** |

**La prova incrociata** (stesso segmento, non massimi presi altrove): nel
tratto in cui `mv.i` — l'indice del campione registrato, già esposto da
`__test.moviola` — resta IDENTICO per 8 fotogrammi di schermo consecutivi,
la posizione si sposta fino a **1,54 unità/fotogramma**, mentre il salto di
`kickT` in quel tratto è **0,0000** (bit-identico).

**L'esempio concreto**, giocatore indice 2, dal JSON grezzo:
- tick 758→761 (mv.i=4, fase 'gioca'): `kickT` resta **bit-per-bit a
  0,15** e `kickB` a 0,19 per **4 fotogrammi di schermo** (≈67 ms), mentre
  `y` scorre 0,528 → 0,524 → 0,520 → 0,515 (continuo, l'interpolazione
  c'è);
- tick 763→766 (mv.i=5): `kickT` salta di colpo a **0,0833** e resta
  bit-identico per altri 4 fotogrammi, mentre `y` scorre di ~1,06-1,09
  unità a ogni fotogramma.

Il salto fra 0,15 e 0,0833 (Δ=0,0667) è dimensionalmente CORRETTO — coincide
con il decadimento reale di `kickT` in 0,05 s (un intervallo fra due
campioni a 20 Hz: `p.kickT -= dt` sommato su ~3 fotogrammi di gioco vero).
Il difetto non è nella quantità del decadimento: è che cade tutto su UN
fotogramma di schermo invece di spalmarsi sugli 4-8 fotogrammi che lo
schermo ridisegna in quell'intervallo — la differenza fra una rampa e una
scala, la stessa differenza che l'interpolazione di posizione ha già
tolto al resto del corpo.

**In sintesi misurata**: la cura del 1° settembre (già in `main`) ha portato
il salto di POSIZIONE nel replay (max 2,30/fotogramma su 90 transizioni)
sotto quello del vivo (max 3,40) — l'obiettivo è centrato per posizione e
direzione. Ma sui CRONOMETRI DEI GESTI il replay mostra la stessa firma
originale del difetto (congelato per 4-8 fotogrammi, poi un salto secco),
solo ristretta ai soli momenti in cui un calcio/scivolata/contrasto è in
corso — che sono esattamente i momenti di un dribbling, una finta, un
contrasto: il cuore della seconda metà del reclamo del committente.

---

## 3. Quanto è lunga l'azione registrata oggi

**Già risolto, e verificabile in `main`**: la finestra è passata da 0,8 s
(gli "ultimi otto decimi", commento pre-esistente a `:34301-34310`) a un
tetto di **7 s** con risalita all'ultimo vero cambio di possesso
(`MOV_TETTO=7.0, MOV_MIN=0.8`, `:34311`), esattamente il compito 1° e 2°
della voce #85 (commit `21ff404`, "La moviola scorre, e fa vedere l'azione
invece dell'ultimo tocco"). Costo dichiarato nello stesso commit
(`strumenti/_t-moviola.js:44-46`): l'anello passa da ~740 kB a ~1,3 MB
(JSON, limite superiore a 11 contro 11) — pagato, non stimato oggi.

**Una sfumatura misurata oggi, non un difetto**: nella corsa della sonda
(seme 20260907), l'anello aveva accumulato 122 campioni (6,1 s) al momento
del gol forzato, ma la finestra SCELTA dalla risalita all'indietro è stata
di soli **16 campioni = 0,8 s (il pavimento)** — perché in quella
particolare sequenza CPU-contro-CPU `squadraDelPallone()` non ha trovato,
nei 7 s di tetto, un cambio di lato sostenuto (≥6 campioni consecutivi
dell'altra squadra). La regola «tutta l'azione fino al gol» è quindi
condizionata: se il gol nasce da un possesso ininterrotto (nessun
cambio di lato recente), la moviola mostra comunque solo l'ultimo tocco. Non
è il bersaglio di questa voce (che è sui cronometri), ma vale la pena
dirlo al committente: la cura di settembre risponde bene a «recupero →
contropiede → gol», meno bene a «tocca-e-tocca nella stessa squadra per
8 secondi poi il tiro».

**Il rapporto col nastro delle sfide** (voce #96): nessuno. Come scritto al
punto 1, `G.rec` è un buffer di disegno locale ed effimero; `{seme, taglia,
gol, nastro}` è un log di comandi che si ri-simula da zero. Allungare
`REC_SEC`, aggiungere campi al campione, o interpolare i cronometri non
cambia di un byte il formato del nastro delle sfide — sono sistemi
indipendenti, non sovrapposti in nessuna riga di codice letta oggi.

---

## 4. Le decisioni per il committente

**A. Interpolare anche i cronometri dei gesti (kickT, kickB, charge,
chargeT, roveT1), non solo posizione/angoli.**
*Guadagno*: elimina la firma misurata sopra — 4-8 fotogrammi congelati poi
un salto secco, proprio durante calci, cariche e rovesciate, cioè proprio
i gesti del dribbling e delle finte che il committente ha nominato.
*Costo*: aritmetica, non memoria (stesso ordine di grandezza della cura di
posizione già pagata, "un pugno di moltiplicazioni per giocatore" per usare
le parole del compito 1); la sola complessità in più è NON interpolare
attraverso un confine di reset (un nuovo calcio che riparte da kickT=0,22
mentre il campione precedente era a 0,02 — lì va tenuto il comportamento di
oggi, campione intero, esattamente come già si fa per `chargeKind` e il
segno di `rove`/`slide`). *Raccomandazione*: farlo — è la lettura più
diretta dell'indizio già a registro, il costo è marginale e il precedente
(l'interpolazione di posizione) ha già dimostrato che funziona.

**B. Registrare anche contrasto/presa/pugni-portiere/recover nel
campione.**
*Guadagno*: chiude il buco più grave trovato oggi — un gol nato da un
contrasto vinto o da una respinta del portiere oggi non ha nel nastro il
dato per rifare quella posa nel replay, e mostra lo stato ATTUALE del
campo invece di quello REGISTRATO. *Costo*: cinque numeri in più per
giocatore per campione, sullo stesso ordine dei 20 già registrati — non
un salto di scala nel peso dell'anello. *Raccomandazione*: farlo insieme
alla A, stessa area di codice, stessa classe di difetto (stato del gesto
incompleto nel nastro).

**C. La finestra "tutta l'azione" — nessuna azione richiesta, ma va
comunicata.**
La parte del reclamo sulla lunghezza dell'azione (dribbling, finte, catene
di possesso) è GIÀ risolta e in produzione dal 1° settembre; l'indizio a
registro in `PUNTO-DEL-LAVORO.md` lo conferma implicitamente restringendo
il "residuo" ai soli cronometri. *Raccomandazione*: nessuna modifica di
codice; dirlo esplicitamente al committente (con la prova del commit
`21ff404`) evita che qualcuno rifaccia un lavoro già fatto o creda la voce
#85 ferma al palo. Segnalare la sfumatura del §3 (possesso ininterrotto ⇒
finestra al pavimento di 0,8 s) come nota, non come difetto da curare ora.

**D. (facoltativa, costo più alto) Una soglia di durata minima anche senza
cambio di lato.** Se il committente vuole che ANCHE un'azione di possesso
continuo (palleggio nella stessa squadra per 8 s poi tiro) mostri più
dell'ultimo tocco, servirebbe un secondo criterio oltre al cambio di lato
(es. "se la squadra ha tenuto palla ininterrottamente per oltre N secondi,
mostra almeno M secondi di buildup anche senza cambio lato"). *Costo*:
nuova logica di scelta della finestra, da provare con più semi per non
riesumare il difetto originale ("il nastro tornava sempre al pavimento").
*Raccomandazione*: aprirla solo se il committente conferma che il caso
"tocca-e-tocca nella stessa squadra" gli interessa — oggi non è nel
reclamo testuale, che parla di "catene di possesso" (già coperto dal
cambio di lato).

---

## 5. Come si misurerà la cura

Un banco che condanni il codice di oggi e assolva quello curato deve:

1. **Girare `fuori/_sonda-moviola-scatti.js` (o un cancello `_q-moviola.js`
   ricavato dallo stesso schema) con più semi dichiarati**, non uno solo —
   oggi un seme ha prodotto una finestra di 0,8 s senza contrasti/scivolate
   attivi: serve una manciata di semi per garantire che almeno uno inneschi
   kickT/slide/contrasto nella finestra rigiocata.
2. **Soglia sulla run "fermo mentre attivo"**: nella fase `'gioca'` del
   replay, per kickT/kickB/charge/slide/contrasto/roveT1, la sequenza
   massima di fotogrammi di schermo consecutivi con lo STESSO valore bit
   mentre il campo è attivo deve essere **≤ 1** (cioè: se il gesto è in
   corso, il valore cambia a ogni fotogramma ridisegnato, come già succede
   per `x`/`y`/`amp`). Oggi: 4-5. Verde atteso dopo la cura A: 1 (la sola
   eccezione tollerata è il fotogramma esatto in cui un gesto nuovo
   comincia, dove un salto è corretto perché è un evento vero, non un
   artefatto di campionamento).
3. **La prova incrociata come cancello**: nei tratti dove `mv.i` non
   avanza, se la posizione si muove (`Δx>ε`) un campo gesto ATTIVO in quel
   momento deve muoversi anch'esso (`Δ>0`). Oggi: posizione sì, cronometro
   no — cancello rosso per costruzione. Dopo la cura: entrambi si muovono
   o entrambi restano fermi (fermi-immagine dichiarati 'entra'/'rete'/
   'uscita' esclusi dal conteggio, come in questa analisi).
4. **Verifica strutturale sui campi registrati**: i nomi dei campi scritti
   in `registraFotogramma` devono includere `contrasto`, `presaT`,
   `gkManiT`, `rinvT`, `recover` (oggi assenti) — un controllo per
   sostituzione di codice, non un banco a tempo, ma che va tenuto in
   batteria perché una nuova posa aggiunta in futuro (nuovo gesto, nuovo
   campo su `p`) ripeterà lo stesso buco se nessuno lo ricorda.
5. **Non toccare i sorteggi**: come già verificato per la cura di settembre
   (nessuna chiamata a `dado()` nel percorso della moviola), un banco
   `_q-determinismo`-style va rilanciato dopo qualunque cura per confermare
   che l'interpolazione dei cronometri non introduce varianza fra due
   esecuzioni con lo stesso seme — l'interpolazione legge solo campioni già
   scritti, non dovrebbe pescare nulla, ma va verificato e non assunto.

---

## File toccati da questa analisi (nessuna modifica al gioco)

- Letto: `CALCETTO-il-gioco.html` (righe citate sopra; nessuna scrittura)
- Letto: `strumenti/_t-moviola.js` (la cura già applicata, per capire cosa è
  già dentro `main`)
- Letto: `PUNTO-DEL-LAVORO.md`, `strumenti/_diag-replay2.js`,
  `strumenti/_q-proporzioni.js` (schema `servi()`)
- Scritto: `fuori/_sonda-moviola-scatti.js` (la sonda, resta in `fuori/`)
- Scritto: `fuori/moviola-scatti-20260907.json` (l'uscita completa della
  sonda, righe grezze comprese, seme dichiarato 20260907)
- Scritto: questo documento, `_analisi/MOVIOLA-OGGI.md`
