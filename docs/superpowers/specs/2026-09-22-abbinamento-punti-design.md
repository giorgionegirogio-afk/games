# L'abbinamento per punti e il sospetto (voce #137)

22 settembre 2026. **Ultimo cantiere dell'onda D**, e l'unico che sta
quasi tutto nel server. I sette che vengono prima hanno costruito il
GIUDIZIO — il metro (#130), il duello nel nastro (#131), i cinque canali
di divergenza onesta (#132), il giudice coi cinque verdetti (#133), il
sigillo che li fa viaggiare (#134) — e il GIRO FRA DUE PERSONE — la
sfida di carta (#135), la classifica degli amici (#136).

Restano due cose che il mandato chiede per nome e che oggi **esistono
come colonne morte**:

| che cosa | dove sta oggi | chi la usa oggi |
|---|---|---|
| i **punti** nell'abbinamento | `trova_avversario` li restituisce nella tupla (`rete/schema.sql:203`) | **nessuno** |
| il **sospetto** | `allenatore.sospetto int not null default 0` (`rete/schema.sql:39`) | **nessuno** |

Il mandato (§5 punto 12c, `_analisi/MAPPA-MANDATO.md:731`) chiede
«abbinamento per vicinanza di punti (1-2 g)»; il §10.5 (riga 474) chiede
il «Fair play score continuo: usare davvero la colonna `sospetto` per
allargare/restringere la banda di accoppiamento in `trova_avversario`,
alimentata dagli esiti del verificatore». Le due cose sono **una sola
cura in due dimensioni**, e per questo stanno in un cantiere solo: si
tocca una funzione, `trova_avversario`, e le si insegnano due domande
nuove.

## Prima regola del cantiere: la finestra ESISTE GIA'

Va detto subito perche' e' la trappola di presentazione di questa voce.
`rete/api/avversario.js:117-121` fa gia' questo:

```js
let avv = null;
for (const banda of [8, 20, 99]) {
  const r = await db.chiama('trova_avversario', { io: io.id, banda });
  if (r && r.length) { avv = r[0]; break; }
}
```

**La finestra che si allarga a gradini c'e' da mesi.** Questo cantiere
non la inventa e non la riscrive: le aggiunge una **seconda coordinata**.
Il gradino smette di essere un numero e diventa una coppia.

## (a) L'abbinamento per vicinanza di punti

### Perche' la forza non basta — il numero che decide

`forza` e `punti` misurano due cose diverse: la forza dice **quanto hai
giocato** (la rosa cresce a ogni partita, `faiCrescereRosa`, e satura a
99), i punti dicono **quanto vinci** (Elo, parte da 1000 e si allarga per
abilita', non per anzianita'). Dentro una stessa fascia di forza ci stanno
tutti e due gli estremi.

Misurato (`fuori/_sonda-137-abbinamento.js`, popolazione simulata di 400
allenatori, modello dichiarato dentro la sonda):

| fascia di forza | quanti ci stanno | forbice di punti |
|---|---|---|
| 55 ±8 | 40 | 809 → 1191 (**382**) |
| 65 ±8 | 332 | 533 → 1316 (**783**) |
| 75 ±8 | 203 | 402 → 1486 (**1084**) |
| 85 ±8 | 42 | 402 → 1695 (**1293**) |

Mille punti di Elo di differenza sono, per la formula gia' in casa
(`elo()`, `rete/api/sfida.js:52`), una partita decisa prima del fischio
d'inizio. L'abbinamento di oggi le propone e non se ne accorge.

### La scala nuova: quattro gradini, due coordinate

```js
SCALA = [ { forza:  8, punti:  120 },
          { forza: 20, punti:  300 },
          { forza: 40, punti:  700 },
          { forza: 99, punti: Infinity } ];
```

**L'ultimo gradino e' l'ultimo gradino di oggi**, allargato in tutte e
due le direzioni: `forza ±99` ammette chiunque, `punti` senza limite
ammette chiunque. Questa non e' una comodita': e' la garanzia che
**l'aggiunta non puo' costare una sola sfida**. Chi oggi trova un
avversario, domani lo trova ancora — al massimo lo trova a un gradino
piu' in la'.

### Il prezzo, misurato

5000 ricerche simulate, tre popolazioni, stesso seme, stesso sorteggio.
La grandezza misurata e' `|punti(io) − punti(avversario)|`:

| popolazione | | media | mediana | p90 | entro 150 | oltre 500 | senza avversario | chiamate/ricerca |
|---|---|---|---|---|---|---|---|---|
| **400** | oggi (solo forza) | 222 | 188 | 460 | 41% | 7% | 0 | 1,00 |
| | **con i punti** | **60** | **60** | **109** | **100%** | **0%** | **0** | **1,00** |
| **60** | oggi | 210 | 180 | 426 | 43% | 5% | 0 | 1,00 |
| | **con i punti** | **57** | **55** | **107** | **100%** | **0%** | **0** | **1,00** |
| **12** | oggi | 325 | 255 | 661 | 28% | 19% | 0 | 1,00 |
| | **con i punti** | **127** | **75** | **234** | **77%** | **2%** | **0** | **1,42** |

Tre letture, e la terza e' il prezzo:

1. **La mediana scende da 188 a 60** su una base vera (400), e gli
   abbinamenti «entro 150 punti» — cioe' quelli che il piu' forte vince
   il 70% delle volte, non il 95% — passano dal **41% al 100%**.
2. **Nessuna sfida si perde**: `senza avversario` resta 0 in tutte e tre
   le popolazioni, per costruzione (l'ultimo gradino e' quello di oggi).
3. **Il prezzo e' il numero di chiamate al database sulla base piu'
   piccola**: a dodici allenatori la ricerca fa 1,42 chiamate invece di
   1,00, perche' il primo gradino ora fallisce piu' spesso. Il freno
   `avv:` e' 60 al minuto e il gioco ne fa **una** per pressione del
   dito: 42% di 1 e' ancora lontanissimo da 60.

### RETTIFICA A EDIZIONI (22 settembre 2026, compito 2): la scala ha un terzo numero

Fonte: la corsa di `strumenti/_q-sospetto.js --solo C` al compito 2. Il
testo qui sopra resta perche' e' ancora vero; quel che segue e' cio' che
il progetto **non aveva previsto**, e che il banco ha trovato appena la
cura e' esistita.

**Il difetto.** Una finestra piu' stretta da' abbinamenti piu' giusti **e
meno gente dentro**. Misurato sulla popolazione di 400, primo gradino
(`forza ±8`, `punti ±120`): il mazzo mediano e' di 125 candidati — largo
— ma **nove allenatori su 400 ne avevano meno di dieci, e il peggio
servito ne aveva UNO**. Cioe' lo stesso avversario, tutte le sere. E'
esattamente la cosa che l'`order by random()` di `trova_avversario`
esiste per impedire, arrivata pero' dalla **finestra** invece che
dall'ordinamento: da una porta che nessuno guardava.

**La cura: il pavimento del mazzo.** Un gradino non si accontenta di
trovare *qualcuno*: deve trovarne almeno `minimo`, se no si scende al
gradino dopo. La scala diventa:

```js
SCALA = [ { forza:  8, punti:  120, minimo: 6 },
          { forza: 20, punti:  300, minimo: 4 },
          { forza: 40, punti:  700, minimo: 2 },
          { forza: 99, punti: Infinity, minimo: 1 } ];
```

L'ultimo gradino chiede **uno**, quindi il pavimento non puo' far perdere
una sfida — la garanzia del paragrafo precedente resta intera (misurato:
`senza avversario` 0 → 0 su tutte e tre le popolazioni).

Nell'SQL il pavimento e' un parametro e una riga:
`where (select count(*) from buoni) >= minimo`, con i candidati raccolti
in una CTE `buoni` perche' vanno contati e poi sorteggiati.

**Le misure, tutte nella stessa corsa** (`avversari distinti in 200
ricerche`, guardando **il peggio servito** e non la media — una media
non avrebbe mai visto questo difetto):

| base | oggi | scala senza pavimento | scala col pavimento |
|---|---|---|---|
| 400 | peggio **10**, mediana 149 | peggio **1**, mediana 99 | peggio **7**, mediana 99 |
| 12 | peggio 3 | peggio 1 | peggio **5** |

E il prezzo sulla vicinanza, detto:

| base | mediana prima → dopo | entro 150 | oltre 500 | chiamate/ricerca |
|---|---|---|---|---|
| 400 | 188 → **60** | 41% → **99%** | 7% → **0%** | 1,00 → **1,01** |
| 60 | 180 → **63** | 43% → **93%** | 5% → **0%** | 1,00 → **1,11** |
| 12 | 255 → **147** | 28% → **52%** | 19% → **7%** | 1,00 → **2,17** |

Il pavimento costa un punto di «entro 150» su 400 (100% → 99%) e tredici
su 60; sulla base da **dodici** — quella vera di oggi — fa **meglio di
oggi in tutte e due le grandezze**: scarto mediano da 255 a 147 e
avversari possibili da 3 a 5.

### RETTIFICA A EDIZIONI (22 settembre 2026, compito 2): il banco misurava sé stesso

Stessa corsa, e va scritta perche' e' la ragione per cui il difetto di
sopra e' rimasto invisibile per mezza giornata. La prima stesura della
prova sulla varieta' tirava **duecento generatori con semi consecutivi**
(`generatore(5000 + k)`) e ne usava la **prima uscita**. Misurato: 200
semi consecutivi di questo xorshift danno **sedici** valori distinti su
mille. Il banco stava misurando il generatore, non la ricerca: dichiarava
«4 avversari distinti» dove ce n'erano 99.

Adesso si tira **un generatore solo**, duecento volte (176 valori
distinti su mille), e si guarda **tutta la popolazione** invece di un
allenatore scelto a caso. Il difetto vero e' saltato fuori nello stesso
minuto.

### Il falso che il difetto ha generato

`_crit-abbinamento-unico.js` e' **la cura come era scritta nel
progetto**: la scala a due coordinate, esatta, senza pavimento. Ha numeri
**migliori** della cura vera su ogni grandezza che il progetto aveva
previsto di misurare (mediana 60, entro 150 il 100%, 1,00 chiamate), e
lascia il peggio servito con **un** avversario. E' il falso che spiega
perche' C7 guarda il peggio e non la media.

### Perche' si tiene anche la forza

La sonda ha misurato anche la scala **senza** la forza (`forza: 99` a
ogni gradino): a 400 e a 60 allenatori e' identica, a 12 e' leggermente
migliore (media 109 contro 127). Si tiene la forza lo stesso, e la
ragione non e' nei punti: una rosa da 40 contro una rosa da 95 e' una
brutta partita anche quando i due hanno lo stesso Elo — in campo si
vedono uomini che non arrivano. La forza descrive **cosa si vede**, i
punti **come finisce**. Togliere la prima per guadagnare 18 punti di
media su una base da dodici persone sarebbe barattare la cosa giusta con
un numero.

### Il posto dove vive la decisione, e perche' non e' solo l'SQL

Il filtro sta nell'SQL, dov'e' sempre stato: e' una scansione con un
ordinamento, e farla in JavaScript vorrebbe dire scaricare mezza tabella
per buttarla via (e' scritto sopra `trova_avversario` dal primo giorno).

Ma **l'SQL non si puo' eseguire qui**: non c'e' un Postgres nel repo, e
un banco che legge un file `.sql` e dichiara verde attesta invece di
misurare. Allora la decisione si spezza in due, e la parte che si misura
davvero e' quella che conta:

- `rete/lib/abbinamento.js` — `SCALA`, `SOSPETTO_SEPARA`,
  `ammissibile(io, candidato, gradino)`. E' **JavaScript vero, eseguito
  in produzione**: `avversario.js` ci legge i gradini da mandare all'SQL
  **e ricontrolla con `ammissibile` il candidato che torna**. Se l'SQL e
  il JavaScript un giorno divergessero, il candidato fuori finestra viene
  rifiutato e si passa al gradino dopo.
- `rete/schema.sql` — il predicato `abs(punti − miei) <= banda_punti`,
  con la banda che arriva come **parametro**. La policy non e' scritta
  li' dentro: li' dentro c'e' solo il confronto.

**Il ricontrollo non puo' affamare nessuno**, e vale la pena dire
perche': l'ultimo gradino ha `punti: Infinity` e `forza: 99`, quindi
`ammissibile` li' e' sempre vero. Nel caso peggiore — un SQL vecchio
rimasto in giro — si finisce sull'ultimo gradino, cioe' esattamente
l'abbinamento di oggi.

`Infinity` non attraversa JSON: `avversario.js` manda `null`, e l'SQL
legge `(banda_punti is null or abs(...) <= banda_punti)`. Il `null` vuol
dire «nessun limite» e sta scritto accanto, perche' un lettore che non lo
sa lo legge come «zero».

### La trappola di Postgres che questo cantiere paga

`create or replace function trova_avversario(io uuid, banda int, ...)`
con **una firma diversa** non sostituisce la funzione: ne crea una
seconda. Le due convivono, PostgREST sceglie per nome degli argomenti, e
il `revoke` scritto sulla vecchia firma resta sulla vecchia. Per questo
lo schema fa `drop function if exists trova_avversario(uuid, int);`
**prima**, e resta idempotente come promette la sua intestazione.

## (b) Il sospetto

### Da dove nasce: da UN verdetto solo

La voce #133 ha stabilito i cinque verdetti e la regola che li governa:

| verdetto | che cosa dice | puo' muovere qualcosa |
|---|---|---|
| `TORNA` | il punteggio rigiocato coincide | chiude la riga, e basta |
| **`NON TORNA`** | **coincide male** | **si', ed e' l'unico** |
| `INCOMPLETO` | il nastro non basta a decidere | no |
| `ALTRO MOTORE` | `MOTORE_V` diverso | no |
| `NON FINISCE` | la rigiocata non arriva in fondo | no |

Gli ultimi tre **non sono «hai barato»: sono «non lo so»**. Un sospetto
che nasce da un «non lo so» e' un innocente accusato, ed e' il difetto
piu' grave che questo cantiere possa avere. La tavola sta in un posto
solo, `rete/lib/verdetto.js`:

```js
conseguenza('TORNA')        -> { verificata:  1, sospetto: 0, disfa: false }
conseguenza('NON TORNA')    -> { verificata: -1, sospetto: 1, disfa: true  }
conseguenza('INCOMPLETO')   -> { verificata:  0, sospetto: 0, disfa: false }
conseguenza('ALTRO MOTORE') -> { verificata:  0, sospetto: 0, disfa: false }
conseguenza('NON FINISCE')  -> { verificata:  0, sospetto: 0, disfa: false }
conseguenza(qualunque altro)-> { verificata:  0, sospetto: 0, disfa: false }
```

**L'ultima riga e' quella che vale.** Una parola storpiata, una stringa
vuota, un `null`, un verdetto inventato domani: tutto cade nel «non lo
so». Il ripiego di questa funzione e' l'innocenza, non l'accusa.

E `verificata` resta **0** sui tre «non lo so» — non 1 e non −1 — perche'
0 vuol dire «da riguardare» e l'indice `sfida_daverificare` lo tiene in
lista: un `INCOMPLETO / schermo-diverso` si puo' rigiudicare domani
aprendo il browser della misura giusta. Un `TORNA` o un `NON TORNA`
invece chiudono la riga per sempre.

### Il sospetto e' un CONTO, non un'opinione

**Invariante del cantiere:**

> `allenatore.sospetto` di X = quante righe `sfida` hanno
> `attaccante = X` e `verificata = -1`.

Non e' un punteggio tarato a mano, non e' una media pesata, non e' un
modello: e' un **conteggio di righe**, e ogni riga porta con se' `seme`,
`taglia`, `gol_a`, `gol_d` e il `replay`. Chi e' segnato lo e' per fatti
che **chiunque abbia la chiave puo' rigiocare uno per uno** e ottenere lo
stesso `NON TORNA`. E' la forma piu' forte di «riproducibile» che si
possa dare a un'accusa: non «il sistema dice», ma «ecco le partite, sono
queste, rigiocatele».

L'invariante e' anche un controllo eseguibile, ed e' nel banco: dopo una
sequenza qualunque di verdetti, si conta e si confronta.

**Niente decadimento, e non e' una dimenticanza.** Un sospetto che cala
col tempo romperebbe l'invariante — il numero smetterebbe di essere
ricostruibile dalle righe — e il committente ha escluso ogni azzeramento
(`_analisi/MAPPA-MANDATO.md:707`, «Niente stagione/azzeramento, mai»). Si
compensa dall'altra parte: **la soglia e' tre**, non una, e la
conseguenza non e' una punizione.

### Che cosa comporta, per intero

Questa e' la parte che va scritta senza sfumature, perche' e' la parte
che tocca una persona.

**Il sospetto NON:**
- non toglie punti (li toglie il `NON TORNA`, e solo quelli di quella
  partita — vedi sotto);
- non bandisce (`bandito` resta una decisione umana, separata);
- non compare in nessuna risposta di nessun endpoint;
- non compare nella classifica, in nessuna forma, nemmeno indiretta;
- non e' visibile a chi ce l'ha, e non e' visibile a nessun altro.

**Il sospetto FA una cosa sola:** da `SOSPETTO_SEPARA = 3` in su, cambia
**con chi ti abbini**. In ogni gradino della scala il candidato deve
stare **dalla stessa parte della soglia** di chi cerca:

```sql
(a.sospetto >= separa) = (mio.sospetto >= separa)
```

E' il «pool separati per abusatori» del mandato §10.5, tradotto nella
riga piu' corta possibile. Misurato sulla stessa sonda, con i sospetti al
3% della base: un allenatore onesto incontra un sospetto **3,93% delle
volte oggi, 0,00% con la separazione accesa**.

**I due prezzi, detti:**

1. Un sospetto che non trova altri sospetti riceve un **avversario
   costruito**, cioe' la strada che il server ha gia' (`squadraFinta`) e
   che il gioco etichetta gia' in chiaro: «allenamento, mezzi punti».
   Non perde niente di quel che ha, ma smette di salire a spese degli
   onesti. E' l'unica cosa che «la classifica si ripulisce da sola» puo'
   voler dire senza diventare una punizione.
2. Un onesto in una base piccolissima, dove l'unico altro giocatore e'
   un sospetto, riceve anche lui un avversario costruito invece di una
   sfida vera. La separazione vale **su tutti i gradini**, compreso
   l'ultimo, e lasciarla cadere all'ultimo vorrebbe dire spegnere la
   protezione proprio nella base dove serve di piu'.

### I punti della partita che non torna

Sono una cosa diversa dal sospetto, e vanno tenute diverse: il sospetto
e' quel che **resta**, il disfacimento e' quel che succede **a quella
riga**. Le colonne esistono apposta dal primo giorno — `delta_a` e
`delta_d`, «punti mossi, per poterli disfare» (`rete/schema.sql:126`).

`segna_verdetto(s_id, verdetto)` fa, dentro una transazione sola:

1. `update sfida set verificata = <esito> where id = s_id and verificata = 0`
   — **e se non trova la riga si ferma**. E' la guardia contro il doppio
   conteggio: un verificatore che ripassa, due processi in parallelo, una
   riga gia' chiusa. Il controllo lo fa il database, non un `if` che
   qualcuno un giorno spostera' (e' la stessa forma del `DELETE` che
   consuma l'impegno, `rete/api/sfida.js:127`);
2. solo se l'esito e' −1: i punti tornano indietro per tutti e due
   (`punti − delta_a`, `punti − delta_d`, con lo stesso `greatest(100,…)`
   di `muovi_punti`), i contatori `vinte/pari/perse/fatti/subiti`
   scendono di quel che erano saliti, e **`allenatore.sospetto`
   dell'attaccante sale di uno**;
3. la `serie` di vittorie **non si disfa**, e va detto: non e'
   ricostruibile da una riga sola — servirebbe l'ordine di tutte le
   partite dopo. E' l'unica cosa che una sfida disfatta lascia indietro,
   e vale al massimo un moltiplicatore del 30% su una singola partita
   (`elo()`, il `bonus`).

Il verdetto arriva alla funzione **come testo**, e la funzione rifa' la
tavola dei cinque da sola:

```sql
e := case verdetto when 'TORNA' then 1 when 'NON TORNA' then -1 else 0 end;
```

Due porte invece di una, e non e' ridondanza gratuita: se un giorno chi
scrive il verificatore sbagliasse a chiamare `conseguenza()` e passasse
un `-1` a mano, la funzione non gli crederebbe comunque, perche' non
accetta `-1`: accetta `'NON TORNA'`. Qualunque altra stringa — un errore
di battitura, un `null`, un verdetto nuovo inventato fra un anno — vale
«non lo so» e non muove niente.

### Nessun endpoint nuovo, e nessuna tabella nuova

`segna_verdetto` **non e' un endpoint**. Non c'e' un `POST /api/verdetto`,
e non ci sara': un endpoint che accetta «questa sfida non torna» sarebbe
il modo piu' corto per far togliere i punti a un avversario scrivendone
l'identificativo. E' una funzione del database, chiamabile solo con la
chiave di servizio, `revoke`ata da `anon` e da `authenticated` come le
altre quattro.

Quindi: **zero endpoint nuovi, zero freni nuovi da scrivere, zero
superficie nuova su Internet.** I cinque endpoint restano cinque, coi
loro sei freni: `avv:` 60/60, `cla:` 60/60, `sfida:` 30/60, `sfl:` 60/60,
`squadra:` 30/60, `entra:` 10/60. L'unico toccato e' `/api/avversario`,
che tiene il suo.

E **nessuna tabella nuova**: si usano `allenatore.sospetto` e
`sfida.verificata`, che ci sono. Una tabella nuova creata senza
`enable row level security` e senza `revoke` sarebbe l'unica porta aperta
dell'intero database, e questo cantiere non ne apre nessuna. Il banco lo
verifica leggendo lo schema: ogni `create table` ha la sua riga di RLS e
sta nell'elenco del `revoke`, e ogni `create function` sta nell'elenco
del `revoke` con la firma giusta.

### Chi lo chiama, oggi

Nessuno, e va detto in chiaro invece di lasciarlo capire. Il
**verificatore differito** — il processo che pesca le righe a
`verificata = 0`, apre il browser della misura giusta, chiama
`window.__test.giudica` e riporta il verdetto — non esiste ancora: la
voce #133 ne ha costruito la capacita', la #134 il tubo fino all'occhio
di chi gioca, questa costruisce **l'altro capo**, cioe' che cosa succede
quando un verdetto arriva. Il pezzo che manca e' la staffetta, ed e'
lavoro di un'altra voce.

Costruire la conseguenza prima della staffetta e' l'ordine giusto: e'
qui che sta il difetto che fa male (un innocente accusato), ed e' qui che
serve un banco che condanni — non nel ciclo che pesca le righe.

## Il banco: `strumenti/_q-sospetto.js`

Nasce **ROSSO**: `rete/lib/abbinamento.js` e `rete/lib/verdetto.js` non
esistono. Non usa Playwright e non apre il gioco — non c'e' niente da
aprire, il gioco non si tocca — quindi costa meno di un secondo.

Quattro gruppi:

- **A) LA TAVOLA DEI CINQUE.** `conseguenza` su tutti e cinque i
  verdetti, piu' il ripiego su tutto il resto (stringa vuota, `null`,
  `undefined`, minuscole, verdetto inventato, oggetto). L'asserzione
  centrale, scritta come si deve: **su quattro verdetti su cinque il
  sospetto non si muove, e l'unico che lo muove e' `NON TORNA`.**
- **B) IL SOSPETTO IN UN DATABASE FINTO.** Un banco in memoria con
  allenatori, punti e sfide — la stessa idea del server finto di
  `_q-rete.js` — che applica `conseguenza` riga per riga: i punti che
  tornano indietro, i contatori che scendono, il doppio conteggio che
  non succede, e **l'invariante** (`sospetto == righe a −1`) verificata
  dopo una sequenza mescolata di cento verdetti.
- **C) L'ABBINAMENTO, MISURATO.** La scala, il predicato, e poi la
  misura vera: 5000 ricerche simulate su tre popolazioni, prima e dopo,
  con le soglie scritte nel banco (mediana ≤ 100 contro ≥ 150 di oggi,
  «entro 150» ≥ 90% contro ≤ 60%, **zero ricerche in piu' senza
  avversario**). Piu' la varieta': dentro una banda si sorteggia, non si
  prende il piu' vicino, se no due della stessa fascia si incontrano
  all'infinito.
- **D) LE PORTE CHIUSE.** Lo schema letto come testo: ogni tabella con
  RLS e nel `revoke`, ogni funzione nel `revoke` con la firma giusta, il
  `drop` della vecchia firma prima del `create or replace`, il sospetto
  che non compare in nessuna `select` di nessun endpoint ne' nella
  `classifica`, e ogni endpoint col suo `frena(`. Questo gruppo
  **attesta** invece di misurare, e lo dichiara: e' un controllo di
  testo su un file che qui non si puo' eseguire.

### I falsi, costruiti nel caso peggiore

Ognuno e' una copia dell'**intera cartella** `rete/` scritta in
`fuori/`, e il banco ci si punta contro con `--rete` (non `--lib`: un
falso che cambiasse solo un modulo non potrebbe mai mordere il gruppo D,
che legge lo schema). Ognuno deve **passare tutte le prove tranne la
sua**: un falso che cade su tre gruppi diversi non dimostra che il banco
discrimina, dimostra che era scritto male.

Tutti e otto **misurati al compito 3**, e la colonna «chi lo boccia»
riporta l'esito vero, non la previsione:

| falso | che cosa sbaglia | passa | cade su |
|---|---|---|---|
| `_crit-sospetto-incompleto.js` | il sospetto sale anche su `INCOMPLETO` — l'innocente accusato, il difetto piu' grave possibile | 35/39 | **A4 A5 B5 B10** |
| `_crit-sospetto-altromotore.js` | sale su `ALTRO MOTORE`: «se ha un altro motore qualcosa nasconde» | 35/39 | **A4 A5 B5 B10** |
| `_crit-sospetto-nonfinisce.js` | sale su `NON FINISCE`: «se non finisce l'ha costruita apposta» | 35/39 | **A4 A5 B5 B10** |
| `_crit-sospetto-doppio.js` | niente guardia su `verificata = 0`: un verdetto applicato due volte toglie i punti due volte e fa due sospetti | 36/39 | **B6 B7 B10** |
| `_crit-sospetto-spione.js` | il sospetto esce nella tupla dell'avversario, «cosi' il gioco puo' avvisare» | 38/39 | **D6** |
| `_crit-abbinamento-largo.js` | la dimensione punti c'e', e' scritta, arriva all'SQL — e le bande sono 2000/4000/6000, cioe' non escludono nessuno | 34/39 | **C2 C4 C4b C5** (+C7) |
| `_crit-abbinamento-ordine.js` | invece di sorteggiare nella banda prende il piu' vicino: la vicinanza migliora, e due della stessa fascia si incontrano all'infinito | 38/39 | **C7** |
| `_crit-abbinamento-unico.js` | *(nato al compito 2)* la scala giusta **senza il pavimento del mazzo**: ogni numero del progetto migliora, e il peggio servito resta con un avversario solo | 37/39 | **C7 C7b** |

**I due che contano piu' di tutti**, e per due ragioni opposte:

- `_crit-abbinamento-largo` e' il falso che **assomiglia a una cura**. Ha
  la colonna, il parametro, il predicato, i commenti, e non cambia
  niente. Un banco che non lo prende ha collaudato il codice invece del
  comportamento.
- `_crit-sospetto-incompleto` e' il falso che **accusa un innocente**, ed
  e' costruito in due tocchi perche' uno solo non bastava. **Misurato al
  compito 3:** cambiare solo la tavola (INCOMPLETO vale un sospetto) non
  fa danno, perche' `applica` si ferma prima sui tre «non lo so» — il
  falso restava visibile al gruppo A e invisibile al gruppo B. Il secondo
  tocco e' la versione che qualcuno scriverebbe davvero — «non chiudo la
  riga, ma me lo segno» — ed e' quella che accusa senza lasciare traccia
  nella colonna, cioe' rompendo l'invariante. Con tutti e due, il falso
  cade su A **e** su B, che e' quel che il progetto diceva.

**Una trappola del banco trovata dai falsi (22 settembre 2026, compito
3).** La prova A7 — «la tavola e' pura» — confrontava il valore
restituito con **zero** invece che col valore restituito la prima volta.
Risultato: qualunque falso che mettesse un altro numero nella tavola la
faceva cadere, cioe' A7 parlava della regola invece che della purezza.
Adesso confronta col primo valore, e `_crit-sospetto-incompleto` cade su
quattro prove invece che su cinque — tutte e quattro sue.

## Che cosa NON si tocca

- **Il gioco.** `git diff main -- CALCETTO-il-gioco.html` deve essere
  **vuoto** a fine cantiere. Non c'e' niente da mostrare: il sospetto non
  si vede per disegno, e l'abbinamento migliore si sente giocando, non si
  legge. Di conseguenza `senza-rete` e `salvataggio` non possono muoversi
  per costruzione, e `MOTORE_V` resta **2** senza bisogno di discuterne.
- **`elo()`**. Il Glicko-2 e' la voce 13 del programma, non questa.
- **La `stagione`.** La colonna c'e' e resta ferma a 1. Non e' un invito.
- **`bandito`.** Resta una decisione umana e separata dal conto.

## Le reti di sicurezza

Tutte verdi, misurate PRIMA di toccare qualunque cosa (compito 0):
`_q-duello-impronta` **44/44**, `_q-giudice` **21/21**, `_q-sigillo`
**14/14**, `_q-carta` **22/22**, `_q-amici` **23/23**, `_q-ment-nastro`
6/6, `_q-carattere-nastro` 4/4, `_q-rosa-scala` 4/4, `_q-nastro-tronco`
5/5, `_q-rete` **22/22**, `_q-sfida` **54/54**, `senza-rete` **6/6**,
`salvataggio` **11/11**. E i due banchi del server, che questo cantiere
tocca da vicino: `rete/prove/tutte.js` **40/40**, `rete/prove/economia.js`
**86/86**.
