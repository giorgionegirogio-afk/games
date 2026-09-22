# La staffetta — il pezzo che chiude l'onda D (voce #138)

22 settembre 2026. Merge-base `main` = `8127f6c`. Ramo `voce-138-la-staffetta`.

## Il fatto da cui parte tutto

L'onda D ha costruito tre pezzi su quattro del verificatore differito, e li
ha dichiarati in chiaro uno per uno:

| voce | che cosa ha fatto | dove vive |
|---|---|---|
| #133 | **la capacità**: `giudica(nastro, atteso, {seme, taglia})`, cinque verdetti, e **solo `NON TORNA` può muovere punti** | `CALCETTO-il-gioco.html`, `window.__test.giudica` |
| #134 | **il tubo**: la colonna `verificata` viaggia dal server fino alla riga della lista | `rete/api/sfida.js`, la schermata SFIDE |
| #137 | **l'altro capo**: `segna_verdetto(s_id, verdetto)`, il sospetto che nasce **solo** da `NON TORNA`, i pool separati | `rete/schema.sql`, `rete/lib/verdetto.js` |

Manca **il mezzo**: il processo che pesca le righe a `verificata = 0`, apre il
browser **della misura che il nastro dichiara**, chiama `giudica` e passa la
parola a `segna_verdetto`. Lo dicono, con queste parole, tre file del repo:

- `rete/LEGGIMI.md` (rettifica del #133): «Quel che manca è il ciclo».
- `rete/schema.sql:122` (seguito del #137): «Quel che ancora non esiste è la
  STAFFETTA […] Manca quello, e non manca altro.»
- `MANUALE.md` §A, voce #134: «Finché il lavoratore non gira, **tutte le
  righe valgono 0**».

Finché non esiste, «la classifica si ripulisce da sola» (`rete/LEGGIMI.md`,
§2 *Replay verificabile*) resta una **promessa architetturale** — esattamente
ciò che il mandato §10.5 chiede di ribaltare.

## Dove vive la staffetta, e perché non è un endpoint

**Non può essere un endpoint**, e non per scelta: una funzione Vercel non ha
un browser, e il giudice *è* il gioco — un secondo motore scritto in Node
divergerebbe per costruzione e toglierebbe punti a innocenti (è l'argomento
con cui la voce #133 ha messo `giudica` dentro all'HTML invece che fuori).

E non deve esserlo per una seconda ragione, che il #137 ha già scritto sopra
`segna_verdetto`: «un endpoint che accetta *questa sfida non torna* sarebbe il
modo più corto per far togliere i punti a un avversario scrivendo il suo
identificativo».

Quindi: **un processo che si lancia**, in `strumenti/`, dove vivono Playwright
e tutta la macchina che guida il gioco headless.

    strumenti/staffetta.js      il processo (senza underscore: infrastruttura)
    strumenti/_q-staffetta.js   il cancello che lo condanna (in batteria)
    strumenti/_crit-staffetta*  i falsi che condannano il cancello

`rete/` non si tocca: ha «zero dipendenze, e non è purismo»
(`rete/lib/comuni.js`), e un processo con Playwright dentro sarebbe un
pacchetto da aggiornare per sempre dentro a cinque funzioni serverless.

## Il giro completo, in sei passi

    1. PESCA      le righe a verificata = 0, le più vecchie prima, a
                  pagine con un cursore (indice sfida_daverificare, già
                  nello schema dal primo giorno)
    2. ALLARGA    il replay (deflate-raw + base64url -> testo crudo)
    3. RAGGRUPPA  per la misura dichiarata nella riga di tipo 10
    4. APRE       UN contesto per misura, non uno per riga
    5. GIUDICA    window.__test.giudica(crudo, [gol_a, gol_d], {seme, taglia})
    6. RIMANDA    segna_verdetto(s_id, LA PAROLA)  — mai un numero

### 1. La pesca

`sfida?verificata=eq.0&id=gt.<cursore>&order=id.asc&limit=N&select=…`.
L'indice esiste già ed è parziale (`where verificata = 0`): non c'è niente da
aggiungere allo schema.

**L'ordine è per `id` e non per `giocata`**, e non è indifferente: serve un
cursore che non salti né ripeta righe fra una pagina e l'altra, e `giocata`
due righe possono averla uguale. `id` è un `bigserial`, quindi l'ordine di
`id` **è** l'ordine di registrazione.

**E si pesca a pagine**, non una volta sola: i tre «non lo so» restano a 0 per
disegno e tornano in ogni finestra. Senza le pagine, un giorno le righe
ingiudicabili riempirebbero il `limit` e la staffetta non arriverebbe mai alle
nuove — girerebbe a vuoto raccontando di lavorare.

### 2–3. La misura, letta in Node

La misura **si deve** leggere prima di aprire il browser, perché è la misura
che decide quale browser aprire. Si legge in Node (`schermoDi` di
`strumenti/_nastri-bugiardi.js`, scritta per questo chiamante: il suo
commento dice già «è esattamente quello che farà il verificatore differito
quando vivrà sul server»).

**E leggerla in Node non può accusare nessuno**, ed è la riga che rende
sicura tutta questa parte: se il lettore in Node sbagliasse misura, `giudica`
— che la ricontrolla da sé, dentro `vagliaNastro` — risponderebbe
`INCOMPLETO / schermo-diverso`, cioè **un «non lo so», mai un `NON TORNA`**.
Il lettore in Node può far perdere tempo; non può far togliere punti.

### 4. Un contesto per misura

Misurato il 22 settembre 2026 (`fuori/_sonda-138-misura.js`, una sfida vera
giocata a `1024x460`):

| operazione | costo |
|---|---|
| aprire un contesto Playwright + caricare il gioco | **1 165 ms** |
| un giudizio (8 819 passi rigiocati) | **1 039 ms** |
| un secondo giudizio sulla **stessa** pagina | **938 ms** |

Cioè: riaprire il contesto per ogni riga costherebbe **più del doppio**.
Raggruppare per misura è la differenza fra un giro che costa `righe × 2,2 s` e
uno che costa `misure × 1,2 s + righe × 1,0 s`.

Ed è la misura che rende vera la frase della revisione del #133 — che il
rifiuto su schermo diverso è «una complicazione operativa, non una perdita di
copertura»: **la copertura è piena**, e la complicazione costa 1,2 secondi per
misura distinta.

Sempre dalla stessa sonda, e sono i due numeri che danno senso al
raggruppamento:

    nastro registrato a 1024x460, giudicato a 1024x460 -> TORNA (3-4 = 3-4)
    lo stesso nastro,              giudicato a  915x412 -> INCOMPLETO /
                                                           schermo-diverso,
                                                           «serve 1024x460»

### 5–6. Il verdetto, e che cosa la staffetta NE FA

**Niente.** La staffetta **non traduce**: passa la parola così com'è a
`segna_verdetto`, che è l'unica autorità sulla tavola dei cinque. È il
principio delle **due porte** scritto sopra la funzione nel #137: chi sbaglia
e manda un `-1` a mano non viene creduto, perché la funzione non accetta `-1`,
accetta `'NON TORNA'`.

La mappa qui sotto **è già dentro `segna_verdetto`**, e si riporta solo per
leggerla in un posto solo:

| verdetto | `verificata` | punti | `sospetto` | la riga della lista dice (#134) |
|---|---|---|---|---|
| `TORNA` | **1** | fermi | fermo | `VERIFICATA` |
| `NON TORNA` | **−1** | **disfatti** | **+1** | `NON TORNA` |
| `INCOMPLETO` | **0** | fermi | fermo | `DA VERIFICARE` |
| `ALTRO MOTORE` | **0** | fermi | fermo | `DA VERIFICARE` |
| `NON FINISCE` | **0** | fermi | fermo | `DA VERIFICARE` |

**Che cosa NON è un'accusa**, e va ripetuto perché è il principio che regge
tutta l'onda: `INCOMPLETO`, `ALTRO MOTORE` e `NON FINISCE` sono «non lo so».
Un nastro incompleto è un nastro scritto prima di una cura, o una finestra di
misura diversa, o un registro troncato. Un motore diverso è il gioco di ieri.
Una rigiocata che non finisce può essere un tetto nostro troppo stretto.
**Nessuna delle tre è un imbroglio.**

E la colonna resta **0**, non −1 e nemmeno 1: zero vuol dire «da riguardare».
Il #134 mostra già quelle righe come `NON VERIFICABILE` **con la causa**
quando il telefono di chi guarda il replay le ha appena rigiocate.

**La staffetta manda la parola anche per i tre «non lo so».** Costa una
chiamata che non muove niente, e compra una cosa che vale di più: **un solo
cammino**. Una staffetta che decidesse da sé quali verdetti spedire avrebbe
dentro di sé un `if` sulla tavola dei cinque — cioè una terza porta, scritta
peggio delle due che ci sono.

## Il taccuino, la ripartenza e l'idempotenza

Due strati, e servono a due cose diverse. **Confonderli è il modo di credere
di essere protetti quando non lo si è.**

**Strato 1 — LA STRUTTURA, e protegge dalle accuse doppie.** `segna_verdetto`
ha la guardia `where id = s_id and verificata = 0`: lo stesso `NON TORNA`
applicato due volte disfa i punti **una volta sola** e scrive **un solo**
sospetto. Non è un `if` della staffetta: è nella transazione, ed è già
misurato (`_q-sospetto` B6/B7, voce #137).

**Strato 2 — IL TACCUINO, e protegge solo dal lavoro sprecato.** Un file
locale (`fuori/taccuino-staffetta.json`, cartella non tracciata) con una riga
per sfida giudicata: `id -> {verdetto, causa, misura, quando}`. Serve perché i
tre «non lo so» **restano a 0 per disegno**, quindi tornano nella pesca a ogni
giro: senza taccuino la staffetta macinerebbe per sempre le stesse righe
ingiudicabili e non arriverebbe mai a quelle nuove.

La riga che tiene insieme i due strati: **il taccuino può sparire senza che
nessuno venga accusato due volte.** Cancellarlo costa una rigiocata; non
costa un punto a nessuno. Se un giorno i due strati dicessero cose diverse,
quello che comanda è la struttura.

**Due eccezioni, e si misurano tutte e due.** *(La seconda è una rettifica del
compito 3: nella prima stesura era una sola, e la staffetta aveva davvero il
difetto che la seconda descrive.)*

**(i) IL GIRO A VUOTO NON SCRIVE NEL TACCUINO.** `--asciutto` giudica e non
manda niente, quindi quelle righe restano a `verificata = 0`. Se finissero nel
taccuino, il giro **vero** del giorno dopo le salterebbe — perse per sempre,
senza che niente diventi rosso da nessuna parte. Una prova a vuoto che fa
perdere righe è peggio di nessuna prova a vuoto. *(Misurata da E3b, condannata
dal falso `avvelenata`.)*

**(ii) LA FINESTRA NEGATA.** Un `INCOMPLETO / schermo-diverso` **su una
riga per cui la staffetta aveva chiesto proprio quella misura** non si scrive
nel taccuino. Non è un «non lo so» del nastro: è **la finestra negata** dalla
macchina che ospita (uno schermo più grande del display, una barra del
browser, un server X che ridimensiona). È un guasto operativo, la staffetta lo
grida nel referto, e quella riga torna al giro dopo.

**Che cosa succede se la staffetta muore a metà.** La riga in corso — quella
per cui `segna_verdetto` è partito e non si sa se è arrivato — **non entra nel
taccuino**. Al giro dopo torna, e viene rigiudicata: meglio una rigiocata in
più che una riga persa, perché la guardia della struttura rende la rigiocata
innocua. Tutte le righe già chiuse non tornano (il `where verificata = 0`
della pesca), e quelle non ancora toccate tornano.

## I freni e il ritmo

**Nessun freno del server si applica alla staffetta**, e va detto invece di
lasciarlo scoprire: i sei `frenato(...)` stanno negli **endpoint**
(`rete/api/*.js`) e la staffetta non passa da nessun endpoint — parla a
PostgREST con la chiave di servizio, come le funzioni Vercel.

Proprio per questo **si frena da sé, con lo stesso meccanismo**: chiama
`frena('staffetta:<nome>', tetto, 60)` prima di ogni riga, e se il database
dice no **si ferma** (non insiste, non ritenta: le righe non giudicate
restano a 0 e tornano al giro dopo). Il conto sta nel database e non nel
processo per la stessa ragione per cui ci sta quello degli endpoint: due
staffette lanciate insieme non condividono memoria.

Più due freni locali, che sono quelli che contano davvero sul piano gratuito:

- `--tetto N` — quante righe al massimo per giro (di serie **50**);
- `--pausa MS` — la pausa fra una riga e l'altra (di serie **250 ms**).

(E `--fotogrammi N`, che stringe il tetto della **rigiocata** dentro
`giudica` — un'altra cosa: non è un freno sul database, è la pazienza del
giudice. Si può solo stringere, e `NON FINISCE` non muove punti.)

**Il ritmo dichiarato**, coi numeri della sonda: un giudizio costa ~1,0 s e un
contesto ~1,2 s, quindi con la pausa di serie la staffetta gira a circa **45–48
righe al minuto** e fa **2 chiamate al database per riga** (`frena` +
`segna_verdetto`) più **una per giro** (la pesca). È sotto il tetto di 60/minuto
che il freno le impone, e di due ordini di grandezza sotto qualunque cosa
possa svuotare il piano gratuito.

## La sicurezza

**Due variabili d'ambiente, gli stessi nomi di `rete/lib/comuni.js`:**
`SUPABASE_URL` e `SUPABASE_SERVICE_KEY`. Senza, la staffetta **si rifiuta di
partire** e lo dice; con, non le stampa mai — né nel referto, né in un
messaggio d'errore, né in un `console.error` di un guasto di rete.

**Non si apre niente.** Nessuna tabella nuova, nessuna colonna nuova, nessun
endpoint nuovo, nessun `grant`. `segna_verdetto` resta `revoke`ata da `anon` e
`authenticated` come le altre, RLS resta acceso su tutte e sei le tabelle con
zero policy. La staffetta usa la chiave di servizio, che scavalca RLS per
costruzione — cioè la **stessa** porta delle cinque funzioni Vercel, non una
sesta.

**E la chiave non è nel repo**, e non è un'assicurazione: è un controllo del
cancello (gruppo F), che cerca nei file tracciati le forme di una chiave di
servizio (`SUPABASE_SERVICE_KEY=` con un valore, un JWT `eyJ...`).

## Il cancello — `strumenti/_q-staffetta.js`

Sei gruppi. Nasce **rosso**: `strumenti/staffetta.js` non esiste.

**A) LA FORMA.** Il modulo esiste ed espone `giro`, `misuraDelNastro`,
`raggruppa`, `taccuino`; gli endpoint restano **cinque**; la staffetta rifiuta
di partire senza credenziali.

**B) IL GIRO COMPLETO**, con un database in memoria e sei sfide finte
costruite dal nastro **congelato** (`strumenti/_nastro-duello-congelato.js`,
una sfida vera con un duello naturale dal dischetto) e dai suoi falsi
(`_nastri-bugiardi.js`), più **una sfida vera giocata a `1024x460`** nella
corsa stessa:

| # | riga | verdetto atteso |
|---|---|---|
| 1 | il nastro congelato, punteggio vero | `TORNA` |
| 2 | la sfida giocata a 1024x460, punteggio vero | `TORNA` |
| 3 | il congelato, punteggio gonfiato di un gol (attaccante A) | `NON TORNA` |
| 4 | il congelato, un altro seme (attaccante A) | `NON TORNA` |
| 5 | il congelato con `MOTORE_V` a 99 (attaccante B) | `ALTRO MOTORE` |
| 6 | il congelato senza la riga di tipo 10 (attaccante B) | `INCOMPLETO` |

Si misura: **2 verificate, 2 non-torna, 2 ancora aperte**; il sospetto salito
**solo** su A e **di due**; B fermo a zero; e l'invariante del #137 — il
sospetto di ognuno **è** il numero delle sue righe a −1.

Il quinto verdetto, `NON FINISCE`, si esercita in un giro a parte con
`--fotogrammi 300`: il tetto della rigiocata **si può solo stringere**
(`Math.min(pieno, tetto)` dentro `giudica`) e `NON FINISCE` non muove punti,
quindi un tetto stretto non può far danno a nessuno.

**C) LA MISURA GIUSTA.** La riga 2 (registrata a `1024x460`) deve tornare
`TORNA`: è la prova che la staffetta ha aperto **quella** finestra e non la
sua. La riga 6, senza riga di tipo 10, deve dare
`INCOMPLETO / schermo-ignoto` e **mai** `NON TORNA`. E i contesti aperti
devono essere **quanti le misure distinte**, non quante le righe.

E **la finestra negata** *(C6/C6b, aggiunte al compito 3)*: lo stesso nastro
aperto di forza alla misura sbagliata si rifiuta con `schermo-diverso`, e
quella riga **non entra nel taccuino** — il referto la grida, e il giro dopo,
alla misura giusta, la stessa riga `TORNA`. Era una regola che questa spec
affermava in tre punti e che **nessuna prova misurava**: il falso
`rassegnata` è nato per condannarla.

**D) LA RIPARTENZA.** Un `segna` che esplode a metà: la staffetta si ferma, il
giro dopo riprende, e si conta quante volte ogni riga è stata **giudicata**.
Nessuna persa, nessuna giudicata due volte tranne quella interrotta. Poi lo
stesso con il taccuino **cancellato**: cambia il lavoro, non l'esito — il
sospetto resta quello, perché a proteggere è la struttura.

**E) IL RITMO E I FRENI.** Un freno che dice no alla terza riga: la staffetta
si ferma lì, le righe rimaste restano a 0, e il giro dopo le riprende. Il
`--tetto` si rispetta. Il ritmo si stampa (righe/minuto, ms per giudizio, ms
per contesto). E **la prova a vuoto** (`--asciutto`) giudica, non manda
niente, e **non avvelena il taccuino** *(E3b, aggiunta al compito 3: quelle
righe restano a `verificata = 0`, e se finissero nel taccuino il giro vero del
giorno dopo le salterebbe — perse per sempre, senza che niente diventi rosso
da nessuna parte)*.

**F) LE PORTE E LA CHIAVE.** Gli endpoint sono cinque; `segna_verdetto` è
ancora revocata; la staffetta non stampa mai la chiave; il repo non contiene
una chiave di servizio.

**G) IL FILO** *(aggiunto al compito 3, e la ragione sta nella rettifica del
punto 2 dei limiti)*. `bancoVero` contro un server che parla la forma di
PostgREST: la pesca chiede `verificata=eq.0` in ordine di `id` con un tetto e
col `replay` fra le colonne; `segna_verdetto` si chiama con **`s_id`** e con
**la parola**; il freno si chiede una volta per riga con la chiave della
staffetta; ogni richiesta porta la chiave in `apikey` **e** in `Bearer`; le
righe già viste non mangiano la finestra (il cursore `id=gt.`); e **il
programma vero** — `node strumenti/staffetta.js` con le due variabili
d'ambiente — chiude le righe, scrive il taccuino e non stampa la chiave.

## I falsi — `strumenti/_crit-staffetta-*.js`

Ognuno è una copia di `strumenti/staffetta.js` con **una** riga cambiata, e
ognuno deve **passare tutte le prove tranne la sua**. Un falso che rompe tutto
non dice quale prova morde; un falso gentile non prova niente.

| falso | il difetto, nel caso peggiore | morde |
|---|---|---|
| `accusa` | i tre «non lo so» diventano `NON TORNA` — «se il nastro non basta, qualcosa avranno da nascondere» | **B** (2 accuse in più, il sospetto su B che non doveva nascere), **C** |
| `cieca` | apre sempre la misura di serie (`915x412`) invece di quella dichiarata | **C** (la riga 2 diventa `INCOMPLETO/schermo-diverso`), **B** (una verificata in meno) |
| `numero` | manda `-1`/`1` invece della parola: la traduzione che le due porte esistono per non credere | **B** (nessuna riga si chiude) |
| `smemorata` | scrive nel taccuino **solo** le righe che il database chiude comunque, e rimacina in eterno gli ingiudicabili | **D** (righe giudicate due volte al secondo giro) |
| `sfrenata` | ignora il no del freno e tira dritto | **E** |
| `zitta` | manda solo le accuse: i `TORNA` non li spedisce, «tanto non cambiano niente» | **B** (zero verificate) |
| `sprecona` *(compito 2)* | ogni riga è un gruppo per sé: il browser si riapre da capo | **A4**, **C4** — era l'unica asserzione che nessuno degli altri condannava |
| `filo` *(compito 3)* | l'argomento di `segna_verdetto` si chiama `id` invece di `s_id`: nessuna riga si chiude mai, e non si vede da nessun'altra parte | **G** |
| `rassegnata` *(compito 3)* | anche la finestra negata finisce nel taccuino, e quella riga non torna mai più | **C6**, **C6b** |
| `avvelenata` *(compito 3)* | la prova a vuoto scrive nel taccuino: non sbaglia niente, **dimentica** — ed era il comportamento vero della staffetta fino al compito 3 | **E3b** |

## Che cosa questo cantiere NON misura — dichiarato

Come il #137, che ha dichiarato lo stesso limite invece di fingere copertura:

1. **L'SQL non si esegue.** Non c'è un Postgres nel repo. Il banco usa
   `applica()` di `rete/lib/verdetto.js` — la **definizione eseguibile** della
   stessa regola, quella che `_q-sospetto` misura davvero — come lato
   database. La corrispondenza fra quella e `segna_verdetto` è guardata **per
   testo** da `_q-sospetto` D5, che dichiara di attestare invece di misurare.
2. **PostgREST si interroga, ma è finto.** *(Rettifica a edizioni, compito 3:
   la riga originale diceva «PostgREST non si interroga: di `bancoVero` si
   misura la forma, non il viaggio». Era un buco, e il falso `filo` — che
   chiama l'argomento `id` invece di `s_id` — ci passava dentro senza far
   cadere una sola prova.)* Il gruppo **G** misura il filo contro un `http`
   che parla la **forma** di PostgREST (`eq.`/`gt.`, `order`, `limit`,
   `select`, le funzioni sotto `/rpc/` che tornano un array), con sotto lo
   stesso database in memoria. Quel che resta fuori è il **Postgres vero**:
   se un giorno `segna_verdetto` cambiasse firma nello schema, qui non si
   vedrebbe.
3. **Nessuna misura su un telefono vero.** Il giro gira su Chromium headless,
   come tutto il resto del repo.
4. **Il ritmo è misurato su questa macchina**, non su un CI: i numeri del
   referto sono un ordine di grandezza, non un contratto.
5. **Quattro comportamenti della staffetta non hanno una prova**, ed è meglio
   elencarli che lasciarli scoprire: il ripiego del **freno rotto** (se
   `/rpc/frena` non risponde il giro va avanti, come in `comuni.js`), la
   bandiera `--riprova`, `--gioco` che punta a un'altra copia del gioco, e il
   rifiuto di `serviGioco` quando il file non c'è. Tutti e quattro hanno la
   stessa forma: al peggio fanno lavoro in più o non partono, e **nessuno dei
   quattro può muovere un punto**.
6. **Si gira a taglia 5.** È dove il determinismo è pieno (voce #98:
   `rebuildCrowd` consuma PRNG in proporzione al campo). Che il *giudice*
   torni anche a 7 e a 11 è misurato altrove — `giudice`, 14 partite oneste
   su 14 nelle tre taglie, zero falsi `NON TORNA` (#133). Questo banco misura
   il *giro*, e il giro non cambia con la taglia: cambia il tetto della
   rigiocata, che è del giudice.

## Quello che fa fermare il cantiere

- **Un falso che accusa su un «non lo so» e passa il banco.** È il difetto che
  questo cantiere esiste per non fare.
- Una staffetta che scrive `verificata = -1` da sé invece di mandare la parola.
- Una riga **persa** fra due giri, o un sospetto salito di due per una partita
  sola.
- Una rete di sicurezza che si muove di un numero.
- Una riga di differenza in `CALCETTO-il-gioco.html`: **la capacità c'è già**,
  e se un compito volesse toccare il gioco vorrebbe dire che si è capito male
  che cosa manca.
- Una tabella nuova, una colonna nuova, un endpoint nuovo, un `grant`.
- Una chiave di servizio dentro un file tracciato.
