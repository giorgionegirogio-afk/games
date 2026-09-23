# Il rating nascosto, Glicko-2 (voce #140)

23 settembre 2026. **Il punto 13 del programma, l'ultimo dell'onda D**
(`_analisi/MAPPA-MANDATO.md:767`): «Glicko-2 (2-3 g): affinamento del
rating, **non un'urgenza — l'Elo di casa funziona**».

I dieci cantieri che vengono prima hanno costruito il GIUDIZIO (#130-#134,
#139) e il GIRO FRA DUE PERSONE (#135-#138). Il #137 ha dato
all'abbinamento la sua **seconda coordinata** — i punti — e ha scritto in
chiaro, nella propria spec, che la terza non era sua:

> «Il Glicko-2 e' la voce 13 del programma, non questa»
> (`docs/superpowers/specs/2026-09-22-abbinamento-punti-design.md:514`)

Questo cantiere e' quella voce.

---

## 1. La decisione: (a) AFFIANCA, non sostituisce

Il mandato si puo' leggere in due modi, e i due modi stanno scritti in due
righe diverse dei nostri stessi documenti:

| lettura | dove sta scritta | che cosa vorrebbe dire |
|---|---|---|
| **(a)** rating nascosto **accanto** ai punti visibili | `MANDATO-STADIUM-ROAR.md:164` «**Hidden rating**: Glicko-2 (rating, deviation, volatility) per mode; matchmaking uses hidden rating» e `:163` «**Trophies** (visible): Clash-style ladder» — due cose, due righe | i punti restano la scala che la gente vede; il Glicko-2 e' un secondo numero che nessuno vede e che serve ad ABBINARE |
| **(b)** Glicko-2 **al posto** dell'Elo | `MAPPA-MANDATO.md:479` «Sostituire `elo()` in `rete/api/sfida.js` con Glicko-2 vero» | i punti visibili diventano il rating |

**Si fa la (a).** Non perche' il mandato la nomini per prima, ma perche'
**i nostri punti visibili non sono un rating, e non possono diventarlo
senza rompere tre decisioni gia' prese e scritte**. La ragione si misura.

### La prova: i punti visibili NON si conservano

Un rating e' **conservativo**: quello che uno prende, un altro lo perde.
I nostri punti no, e non per sbaglio — per quattro decisioni scritte in
chiaro dentro `rete/api/sfida.js`:

1. **il difensore perde META' di quel che l'attaccante guadagna** (riga
   217: «lui non stava giocando. Una classifica dove si scende dormendo e'
   una classifica che si chiude e non si riapre»);
2. **la serie di vittorie MOLTIPLICA** fino a ×1,3 (riga 91: «l'unica cosa
   che tiene qualcuno a giocare la sesta partita di seguito»);
3. **c'e' un pavimento a 100** (`greatest(100, punti + d)` in
   `muovi_punti`): sotto quella soglia le sconfitte sono gratis;
4. **contro un avversario costruito si prende meta'** e non si toglie
   niente a nessuno (riga 205).

Misurato (`fuori/_sonda-140-glicko.js`, popolazione simulata di 400
allenatori, 60 giorni, 18 546 sfide, gli stessi identici risultati dati in
pasto ai due sistemi):

| | totale iniziale | totale finale | deriva |
|---|---|---|---|
| **punti visibili** | 400 000 | 406 375 | **+1,6 %** |
| **rating nascosto** | 600 000 | 607 835 | +1,3 % |

Il numero da leggere non e' la percentuale — su una base piccola anche
Glicko deriva un po' — ma **da dove viene**: la deriva dei punti e'
STRUTTURALE (meta' al difensore, moltiplicatore, pavimento), quella del
rating e' l'assestamento di una popolazione che cresce. Sono due
grandezze diverse: **i punti sono una VALUTA che premia il giocare, il
rating e' una MISURA di quanto sei forte**. Fonderle vorrebbe dire
scegliere quale delle due buttare.

### E la (b) costerebbe qualcosa che non possiamo pagare

Sostituire l'Elo vorrebbe dire riscrivere i punti di tutti in una notte.
Non abbiamo il posto dove farlo: **il committente ha ESCLUSO ogni
azzeramento stagionale** (`_analisi/MAPPA-MANDATO.md:707`, «Niente
stagione/azzeramento, mai... Cade ogni futura onda "stagione della
scala"»). Senza una stagione che assorba il salto, la classifica di
dodici persone cambierebbe forma da un giorno all'altro **senza che
nessuno abbia giocato**. Il mandato parla di `season reset` (riga 163);
qui non si applica, ed e' una divergenza gia' decisa altrove, non da
questo cantiere.

### Quale numero stima meglio l'abilita' vera

E' l'altra meta' della decisione: se i punti stimassero l'abilita' bene
quanto il rating, la terza coordinata dell'abbinamento non servirebbe a
niente. Misurato sulla stessa corsa — la popolazione ha un'**abilita'
latente** che ne' i punti ne' il rating conoscono, e si misura il rho di
Spearman di ognuno dei due con quella:

| popolazione | punti visibili | rating nascosto |
|---|---|---|
| 400 allenatori, tutti | 0,956 | **0,974** |
| 400, i soli veterani (≥20 partite) | 0,967 | **0,985** |
| 60 allenatori | 0,972 | **0,981** |

Piccolo in valore assoluto, grande nella coda: e' nella coda che si
decide chi incontri.

---

## 2. I tre numeri, e dove vivono

Glicko-2 tiene per ogni giocatore **tre** numeri, non uno:

| | che cosa dice | dove vive | valore iniziale |
|---|---|---|---|
| `nascosto` | il rating vero e proprio | `punti.nascosto real` | 1500 |
| `incertezza` | la *deviation*: quanto ci fidiamo | `punti.incertezza real` | 350 |
| `volatilita` | quanto e' ERRATICO quel giocatore | `punti.volatilita real` | 0,06 |
| `periodo` | il giorno dell'ultimo aggiornamento | `punti.periodo date` | oggi |
| `giri` | il contatore che rende atomica la scrittura | `punti.giri int` | 0 |

**Colonne su una tabella che c'e' gia', non una tabella nuova.** E' un
vincolo di casa, ed e' il piu' importante del server: `rete/schema.sql`
accende RLS su tutte e sei le tabelle **con zero policy** e fa `revoke
all` su tabelle e funzioni (righe 500-512). Una tabella nuova sarebbe
l'unica porta aperta del database, e lo sarebbe in silenzio.

**`punti` e non `allenatore`**, perche' `punti` e' gia' la tabella dei
numeri che cambiano a ogni partita, e perche' sta gia' accanto a
`stagione` — il posto giusto dove scrivere, in un commento che si legge
per forza, che **il periodo di rating NON e' una stagione**.

### τ = 0,5, e perche' non si tocca

Il mandato lo dice (`MANDATO-STADIUM-ROAR.md:444`: «Glicko-2 per mode
(τ = 0.5, rating period = 1 day)») e Glickman lo raccomanda fra 0,3 e
1,2. τ governa quanto la *volatility* puo' muoversi in un periodo: piu'
basso, piu' il sistema e' sordo alle sorprese; piu' alto, piu' un
risultato strano fa ballare il rating. 0,5 e' il valore dell'esempio
lavorato del paper — cioe' quello contro cui la nostra implementazione si
puo' VERIFICARE, che e' la ragione per cui si tiene esattamente quello.

---

## 3. Il periodo di rating — un giorno, e NON e' una stagione

Glicko-2 e' un sistema a **periodi**: raccoglie i risultati di un periodo
e aggiorna tutti insieme, alla fine. Il mandato chiede **un giorno**.

Qui il periodo fa **due** cose diverse, e vanno separate:

**(1) il raggruppamento dei risultati.** Aggiornare a fine giornata
vorrebbe dire un lavoratore periodico in piu'. Non lo costruiamo:
aggiorniamo **a ogni sfida**, con la stessa identica formula a m = 1
partita — Glicko-2 e' definito per m qualsiasi, e uno e' un m valido.
**La divergenza si dichiara con una misura**, non con una promessa: il
banco (gruppo E) fa girare la STESSA storia due volte, una a partita e
una a giornate, e stampa di quanto divergono i rating finali.

**(2) il decadimento della certezza di chi non gioca.** Questo si fa, ed
e' esattamente la regola del paper: chi non compete in un periodo vede la
sua deviation CRESCERE, φ' = √(φ² + σ²). Non serve un lavoratore: si
applica **in differita**, al momento del prossimo aggiornamento, tante
volte quanti sono i giorni passati (`inattivo(me, periodi)`). Chi non
gioca da tre mesi torna con l'incertezza al tetto, cioe' col sistema che
dice «non so piu' quanto vali» — che e' la cosa che l'Elo a K variabile
non sa fare e per cui il mandato chiede Glicko.

**IL PERIODO NON E' UNA STAGIONE.** Il passaggio da un giorno all'altro
**non azzera niente**: il rating resta quello di ieri, e a crescere e'
soltanto l'incertezza. Chi confondesse le due cose riscriverebbe la
classifica ogni notte. E' il falso `_crit-glicko-stagione`, ed e' scritto
qui perche' e' l'errore piu' facile da fare leggendo il mandato, che al
§163 parla davvero di `season reset every 4 weeks` — una riga gia'
esclusa in casa.

---

## 4. Contro un fantasma il rating nascosto NON si muove

`rete/api/avversario.js` costruisce un avversario finto quando non trova
nessuno, e `sfida.js` gli da' `forza_avv * 20` punti (riga 190: «un
avversario costruito vale la sua forza»). Quella conversione e' una
convenzione nostra, non una misura: nessuno ha mai stabilito che una
squadra costruita da 75 di forza valga 1500 di Elo.

I punti visibili si muovono lo stesso, a meta' (riga 205: «una classifica
che non si muove e' una classifica morta»). **Il rating nascosto no.**
Dargli in pasto un numero inventato vorrebbe dire insegnargli una favola,
e il rating esiste per una cosa sola: sapere davvero quanto vale chi
gioca, per abbinarlo bene.

La conseguenza, detta: **chi gioca solo allenamenti resta a incertezza
350**, cioe' «non lo so». E' la risposta giusta, ed e' anche quella che
la finestra usa bene — con l'incertezza al tetto l'atteso e' vicino a 0,5
contro chiunque, quindi la terza coordinata non esclude nessuno e il
giocatore nuovo trova comunque un avversario.

Il mandato parla di «5 placement matches against bots and calibrated
opponents» (riga 164). **Non si fa**, e si dichiara: i nostri bot non
sono calibrati — sono generati da un seme, con una forza scelta da
`Math.min(95, Math.max(20, miaForza + …))`. Calibrarli e' un cantiere a
parte, e senza calibrazione un piazzamento contro bot e' un piazzamento
contro il rumore.

---

## 5. L'abbinamento: la TERZA coordinata

### Si ESTENDE la finestra del #137, non si riscrive

La regola e' la stessa che il #137 si e' scritta addosso: «la finestra
esiste gia'». Oggi `SCALA` in `rete/lib/abbinamento.js` e' una scala di
quattro gradini a **due** coordinate piu' un pavimento:

```js
{ forza:  8, punti:  120, minimo: 6 },   // e cosi' via fino a
{ forza: 99, punti: Infinity, minimo: 1 },
```

Il gradino diventa una **terna**. Nient'altro cambia: stessa scala,
stesso ciclo in `avversario.js`, stesso `trova_avversario`, stesso
pavimento del mazzo.

### La terza coordinata NON e' una distanza: e' l'ATTESO

Qui c'e' la decisione di progetto piu' fine del cantiere, e nasce da una
misura, non da un'intuizione. La prima stesura confrontava le distanze —
`|nascosto_a − nascosto_b| ≤ banda + incertezza_a + incertezza_b` — ed
**e' stata misurata quasi inutile**. Su 400 allenatori, stessa
popolazione e stesso seme:

| finestra | scarto vero mediano | p90 | «entro 100» |
|---|---|---|---|
| oggi (#137, forza+punti) | 136 | 348 | 39 % |
| a **distanza** 50/125/250 | 122 | 299 | 42 % |
| a **distanza** 100/250/500 | 133 | 338 | 39 % |
| **all'atteso** 0,08/0,15/0,25 | **67** | **183** | **67 %** |

Ragione: con l'incertezza di due giocatori assestati intorno a 62
ciascuna, la tolleranza cresce di 124 e si mangia la banda — e stringere
la banda per compensare butta fuori proprio i nuovi, che sono quelli che
l'incertezza serviva a tenere dentro.

La grandezza giusta ce l'ha gia' Glicko-2 in casa: **l'atteso**, cioe'
la probabilita' che il primo batta il secondo,

```
E = 1 / (1 + exp(−g(φ) · (μ_a − μ_b)))    con  φ = √(φ_a² + φ_b²)
```

L'incertezza **di tutti e due** entra per costruzione, perche' `g(φ)`
appiattisce l'atteso verso 0,5 quando il sistema non sa. Un gradino
allora non dice «vicini di rating», dice **«la partita non deve essere
decisa prima del fischio»**:

```
|E − 0,5| ≤ gradino.equilibrio
```

Ed e' la stessa grandezza che il mandato nomina nella formula dei trofei
(riga 163: «E is the Glicko-2 expected score»).

### La scala nuova, e il pavimento che si alza

> **RETTIFICA A EDIZIONI (23 settembre 2026, compito 3).** La scala che
> segue, e i numeri della tabella sotto, sono quelli del PROGETTO: quattro
> gradini e pavimento 8/6/4/1. Il banco li ha corretti tutti e due, e il
> testo rettificato sta subito dopo. Si lascia in chiaro quel che si era
> previsto, perche' la differenza fra il previsto e il misurato e' la
> cosa piu' utile di questa pagina.

```js
export const SCALA = [
  { forza:  8, punti:  120, equilibrio: 0.08, minimo: 8 },
  { forza: 20, punti:  300, equilibrio: 0.15, minimo: 6 },
  { forza: 40, punti:  700, equilibrio: 0.25, minimo: 4 },
  { forza: 99, punti: Infinity, equilibrio: Infinity, minimo: 1 },
];
```

`equilibrio: 0.08` vuol dire «il piu' forte non deve vincere piu' del
58 % delle volte»; 0.25 vuol dire 75 %. **L'ultimo gradino resta senza
limite in tutte e TRE le coordinate**: e' la garanzia del #137,
mantenuta — chi oggi trova un avversario domani lo trova ancora, al
massimo un gradino piu' in la'. Misurato: **zero ricerche in piu' senza
avversario**, su tutte e tre le popolazioni, su quattro semi.

**IL PAVIMENTO SI ALZA DA 6/4/2 A 8/6/4, e non e' un ritocco: e' il
prezzo della terza coordinata**, trovato dalla stessa misura che l'ha
trovato al #137. Una finestra piu' stretta da' abbinamenti piu' giusti E
MENO GENTE DENTRO. Col pavimento del #137 lasciato com'era, il peggio
servito su 60 allenatori scendeva da 6 avversari possibili a 3; alzandolo
a 8/6/4 risale a 8.

Misurato (`fuori/_sonda-140-glicko.js`, 5000 ricerche, seme 20260923,
stessa popolazione e stesso seme per il prima e il dopo — la grandezza e'
lo scarto di **abilita' vera**, non di punti):

| popolazione | | scarto vero mediano | p90 | «entro 100» | peggio servito | a vuoto |
|---|---|---|---|---|---|---|
| **400** | oggi (#137) | 136 | 348 | 39 % | 8 | 0 |
| | **col nascosto** | **67** | **183** | **67 %** | **8** | 0 |
| **60** | oggi (#137) | 133 | 359 | 39 % | 6 | 0 |
| | **col nascosto** | **79** | **219** | **57 %** | **8** | 0 |
| **12** | oggi (#137) | 220 | 667 | 28 % | 4 | 0 |
| | **col nascosto** | 220 | **434** | **34 %** | 4 | 0 |

**E il prezzo, detto.** Su una base di **dodici** il guadagno e' tutto
nella coda (p90 da 667 a 434) e su qualche seme il mazzo si stringe: su
quattro semi provati il peggio servito passa 4→4, 6→4, 6→4, 6→4, cioe'
**su tre semi su quattro si perdono due avversari possibili** in cambio
di uno scarto mediano che scende (221→125, 263→170, 352→270). Con undici
persone non si possono avere insieme partite equilibrate e varieta': e'
aritmetica, non un difetto da riparare. Si scrive qui perche' il giorno
in cui la base crescera' questo numero cambiera' da solo, e perche' un
banco che non lo misurasse lascerebbe passare una finestra ancora piu'
stretta senza dire niente.

---

### RETTIFICA A EDIZIONI (23 settembre 2026, compito 3): la scala vera

Il progetto qui sopra e' stato corretto **tre volte dal banco**, ed e'
la parte di questo cantiere che vale la pena di leggere. La scala vera,
quella che sta in `rete/lib/abbinamento.js`:

```js
export const SCALA = [
  { forza:  8, punti:  120, equilibrio: 0.08, minimo: 7 },
  { forza: 20, punti:  300, equilibrio: 0.15, minimo: 5 },
  { forza: 40, punti:  700, equilibrio: 0.25, minimo: 4 },
  { forza: 99, punti: Infinity, equilibrio: 0.40, minimo: 2 },
  { forza: 99, punti: Infinity, equilibrio: Infinity, minimo: 1 },
];
```

**(1) I gradini sono CINQUE, non quattro.** Con quattro, su una base di
dodici, stringere i primi tre faceva cadere la ricerca sull'ultimo molto
piu' spesso (gradino medio da 2,00 a 3,24) — e l'ultimo, per
costruzione, non ha limiti. Misurato: lo scarto mediano migliorava
(291 → 226) e **la coda peggiorava** (p90 da 554 a **666**). Partite piu'
giuste per quasi tutti, e qualche partita piu' assurda di prima per chi
finiva in fondo alla scala. Il gradino in piu' e' un **atterraggio**:
forza e punti gia' senza limite, ma l'equilibrio ancora a 0,40. Col
quinto gradino il p90 su dodici va a **391** invece che a 666.

**(2) Il pavimento e' 7/5/4/2/1, non 8/6/4/1.** 8/6/4 protegge il mazzo
meglio di chiunque, e costa altrove: su dodici persone un gradino che ne
chiede otto non si soddisfa quasi mai, la ricerca cade piu' in basso, e
**la misura del #137 si disfaceva** — lo scarto mediano di *punti* sulla
base da dodici passava da 147 a 213 (`_q-sospetto` C5, che con 7/5/4
resta a 147). Il pavimento giusto e' il piu' alto che non disfaccia una
misura gia' pagata.

**(3) E 7/5/3 e' stato scartato da un SECONDO SEME, non da un'idea.** Su
20260923 dava 4 avversari possibili sulla base di dodici e sembrava a
posto; su 987654 e 555 ne dava **tre**. Per questo il banco ha preso
`--seme`: un numero misurato su una popolazione sola e' un aneddoto, e
qui l'aneddoto avrebbe fatto passare una finestra che affama qualcuno
una volta su due.

I numeri veri, misurati dal banco (5000 ricerche, seme 20260923; e le
tre righe restano dentro le stesse soglie su 424242, 987654 e 555):

| popolazione | | scarto vero mediano | p90 | «entro 100» | peggio servito | a vuoto |
|---|---|---|---|---|---|---|
| **400** | oggi (#137) | 133 | 355 | 40 % | 8 | 0 |
| | **col nascosto** | **72** | **183** | **65 %** | 7 | 0 |
| **60** | oggi (#137) | 151 | 340 | 34 % | 6 | 0 |
| | **col nascosto** | **94** | **249** | **52 %** | 5 | 0 |
| **12** | oggi (#137) | 291 | 554 | 21 % | 4 | 0 |
| | **col nascosto** | **185** | **391** | **30 %** | 4 | 0 |

E il rating nascosto stima l'abilita' vera meglio dei punti anche su
questa popolazione: rho 0,978 contro 0,952.

### La terza coordinata NON esce dal database

Come il `sospetto` del #137, e per la stessa ragione scritta sopra
`ammissibile`: la tupla di `trova_avversario` finisce **dritta nel corpo
della risposta** di `/api/avversario` (`avversario: avv`), cioe' sul
telefono di un'altra persona. Un rating che viaggia non e' nascosto.

Conseguenza, e va detta perche' toglie una rete: **`ammissibile` non puo'
ricontrollare la terza coordinata**. Il ricontrollo dell'endpoint resta
su forza e punti, come oggi. La definizione eseguibile della terza vive
in `abbinamento.js` (`equilibrato`, sul modello di `separati`), il banco
la misura li', e l'SQL le si confronta **per testo** — con il limite
dichiarato al §8.

---

## 6. Dove si tocca il codice

| file | che cosa |
|---|---|
| `rete/lib/glicko.js` | **nuovo**: la matematica, e nient'altro. Nessun database, nessuna richiesta |
| `rete/lib/abbinamento.js` | la terna nella `SCALA`, `equilibrato`, `nascostoDi`/`incertezzaDi`, `cerca` che chiama la terza |
| `rete/api/sfida.js` | dopo `muovi_punti`, l'aggiornamento dei due rating (nessun giro in piu' al database: le due righe `punti` si leggono gia') |
| `rete/api/avversario.js` | i miei due numeri nascosti nella `select` che c'e' gia', e i due argomenti nuovi a `trova_avversario` |
| `rete/schema.sql` | le cinque colonne, `posa_nascosto`, `trova_avversario` esteso (con il `drop` della firma vecchia) |
| `rete/prove/tutte.js` | le prove del rating accanto a quelle dell'Elo |
| `CALCETTO-il-gioco.html` | **NIENTE.** `MOTORE_V` resta 2 |

### La scrittura e' atomica, come per i punti

`muovi_punti` esiste perche' due sfide contro lo stesso difensore
nello stesso istante leggerebbero entrambe il valore vecchio e una delle
due sparirebbe in silenzio (`schema.sql`, sopra la funzione). Glicko-2
non si puo' scrivere come un incremento relativo: la formula ha bisogno
del valore di partenza.

Allora si fa **leggi-calcola-scrivi con guardia**: `posa_nascosto(...)`
scrive solo se `giri` e' ancora quello letto, e alza `giri` di uno. Se
qualcun altro e' passato nel frattempo la scrittura **non avviene** e
torna `false`; il chiamante rilegge e rifa il conto (tre tentativi, poi
si arrende **senza rompere la sfida** — i punti visibili si sono gia'
mossi, e un rating nascosto perso e' un'informazione in meno, non un
danno). La guardia sta nel database, non in un `if` che qualcuno un
giorno spostera'.

### La trappola di Postgres, di nuovo

`create or replace function` con una **firma diversa** non sostituisce:
**affianca**. Le due convivono, PostgREST sceglie per nome degli
argomenti, e il `revoke` scritto sulla firma vecchia resta sulla vecchia
— cioe' la nuova nascerebbe **aperta**. L'ha pagata il #137 e sta scritta
sopra `trova_avversario`. Questo cantiere cambia quella firma una terza
volta: si droppa `trova_avversario(uuid, int, int, int, int)` prima, e si
aggiunge il `revoke` con la firma nuova.

---

## 7. Il banco e i falsi

`strumenti/_q-glicko.js`, sul modello di `_q-sospetto.js`: misura il
**server**, non apre il gioco, non parla col database vero, costa meno di
un secondo. `--rete` per puntarlo a una copia guasta.

| gruppo | che cosa misura |
|---|---|
| **A** | **L'IMPLEMENTAZIONE DI RIFERIMENTO.** L'esempio lavorato di Glickman, numero per numero |
| **B** | Le proprieta' del rating: la certezza che cresce giocando e cala stando fermi, il tetto e il pavimento, la volatilita' che si muove, l'avversario incerto che sposta meno, la convergenza all'abilita' vera |
| **C** | L'abbinamento: lo scarto di **abilita' vera** prima e dopo, nella stessa corsa, su tre popolazioni — e **il peggio servito**, che e' dove il #137 ha trovato il suo difetto |
| **D** | Le porte del server (**questo gruppo ATTESTA e lo dice**): colonne, RLS, revoke, il drop della firma vecchia, il predicato SQL che corrisponde al JS, il rating che non esce da nessun endpoint, i freni, i cinque endpoint |
| **E** | Il periodo e la concorrenza: due sfide insieme e nessuna persa, il periodo che NON azzera, la divergenza misurata fra aggiornamento a partita e a giornate, il fantasma che non muove il rating |

### Il gruppo A e' il cancello piu' importante del cantiere

Il mandato lo chiede per nome (milestone M9, riga 599: «Glicko-2 and
trophies **verified against a reference implementation**»). La verifica
e' l'esempio lavorato del paper di Glickman («Example of the Glicko-2
system»): giocatore a 1500 / RD 200 / σ 0,06, τ = 0,5, tre avversari
(1400/30 vinta, 1550/100 persa, 1700/300 persa).

I numeri del paper, e i nostri:

| | paper | nostro |
|---|---|---|
| g(φ_j) | 0,9955 · 0,9531 · 0,7242 | uguali |
| E(μ,μ_j,φ_j) | 0,639 · 0,432 · 0,303 | uguali |
| v | 1,7785 | 1,77898 |
| Δ | −0,4834 | −0,48393 |
| σ' | 0,05999 | 0,059996 |
| φ* | 1,1529 | 1,15290 |
| φ' | 0,8722 | 0,87220 |
| μ' | −0,2069 | −0,20694 |
| **r'** | **1464,06** | **1464,05** |
| **RD'** | **151,52** | **151,52** |

Le due sole differenze — v e Δ — **sono gli arrotondamenti del paper, e
si dimostra**: rifacendo il conto con i g e gli E **stampati** nel paper
(0,9955 / 0,9531 / 0,7242 e 0,639 / 0,432 / 0,303) si ottiene
esattamente 1,7785 e −0,4834. Il banco fa quel conto e lo verifica: un'
implementazione sbagliata non cadrebbe su **tutti e due** i valori.

### I falsi, costruiti nel caso peggiore

Sei, e ognuno deve passare tutte le prove tranne la sua. Sono le sei cose
che si sbagliano davvero scrivendo un Glicko-2:

| falso | il difetto | che cosa deve mordere |
|---|---|---|
| `_crit-glicko-ferma` | l'incertezza non cresce per chi non gioca (`inattivo` restituisce quella di prima) | **passa A** — l'esempio non ha periodi vuoti. Morde B e C |
| `_crit-glicko-cresce` | l'incertezza cresce invece di calare dopo una partita | A e B |
| `_crit-glicko-sorda` | la volatilita' non si ricalcola mai: resta 0,06 per sempre | **passa A** (nell'esempio σ' vale 0,059996: la differenza e' sotto la precisione stampata). Morde B |
| `_crit-glicko-visibile` | si abbina col rating **visibile** invece che col nascosto — e il falso cambia **JS e SQL insieme**, cosi' il gruppo D non se ne accorge | solo C, cioe' **la misura** |
| `_crit-glicko-stagione` | il cambio di giorno azzera il rating a 1500/350 («comincia un periodo nuovo») | B ed E |
| `_crit-glicko-fantasma` | il rating nascosto si muove anche contro l'avversario costruito, con `forza_avv * 20` | E |

Il `visibile` e' quello che conta di piu', per la stessa ragione per cui
contava `_crit-abbinamento-largo` nel #137: **assomiglia a una cura**.
C'e' tutto — le colonne, la terza coordinata, il predicato in SQL, il
commento — e sbaglia il numero da leggere. Un cancello che controlla che
il codice ci sia non lo vede mai.

---

## 8. I limiti, dichiarati

1. **L'SQL non si esegue.** Non c'e' un Postgres nel repo, e non lo
   costruiamo per un cantiere. La regola vive in JavaScript, dove si
   esegue e si misura; l'SQL ne e' la traduzione, e il gruppo D confronta
   le due **per testo**, dicendo che attesta. E' il limite che il #137 e
   il #138 hanno dichiarato allo stesso modo.
2. **Un rating solo, non uno per modo.** Il mandato chiede «per mode»
   (5/7/11). Non si fa, e si misura perche': spezzare in tre la stessa
   evidenza lascia tre righe con un terzo delle partite ciascuna, e
   l'incertezza mediana **sale da 63 a 88** (400 allenatori) e **da 65 a
   93** (12). Un rating piu' incerto abbina peggio: dividerlo per modo, su
   questa base di giocatori, e' una perdita, non un affinamento. Si
   riapre quando la base lo regge — e la colonna si aggiungera' allora,
   come oggi si aggiungono queste.
3. **Nessun trofeo, nessuna lega, nessuna stagione.** La formula dei
   trofei del mandato (riga 163: `Δ = round(30 × (S − E))`, Arenas,
   season reset) e' un'ALTRA voce e per larga parte una voce esclusa in
   casa. Qui i punti visibili restano **esattamente quelli di oggi**:
   `elo()` non si tocca, e `git diff` su `sfida.js` deve mostrare
   un'aggiunta, non una sostituzione.
4. **Nessun piazzamento.** Cinque partite contro bot calibrati
   richiedono bot calibrati (§4).
5. **La popolazione e' simulata.** Le misure del gruppo C vengono da una
   popolazione costruita con un modello dichiarato dentro il banco, non
   da giocatori veri: dicono che la finestra nuova abbina meglio **dato
   quel modello**. E' lo stesso limite del #137, e la difesa e' la stessa
   — la grandezza misurata non e' lo scarto di punti (sarebbe circolare)
   ma lo scarto di **abilita' latente**, che nessuno dei due sistemi
   conosce.

---

## 9. Che cosa NON si tocca

- `CALCETTO-il-gioco.html` — zero righe, `MOTORE_V` resta 2.
- `elo()`, `muovi_punti`, i punti visibili, la classifica: la scala che
  la gente vede resta quella, con gli stessi numeri.
- Il `sospetto` e la separazione a soglia 3 (#137).
- Il numero degli endpoint: restano **cinque**.
- Nessuna tabella nuova.

## 10. Le reti di sicurezza

Verdi a ogni compito: `_q-duello-impronta` 44/44, `_q-giudice` 21/21,
`_q-sigillo` 14/14, `_q-carta` 22/22, `_q-amici` 23/23, `_q-sospetto`
39/39, `_q-staffetta` 42/42, `_q-finestra` 20/20, i quattro del #132
(6/6, 4/4, 4/4, 5/5), `_q-rete` 22/22, `_q-sfida` 54/54, `senza-rete`
6/6, `salvataggio` 11/11, `rete/prove/tutte.js`, `rete/prove/economia.js`.
E la batteria INTERA a ogni compito, a gruppi.
