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

Ognuno e' una copia di `rete/lib/` scritta in `fuori/`, e il banco la
prende con `--lib`. Ognuno deve **passare tutte le prove tranne la sua**:
un falso che cade su tre gruppi non dimostra che il banco discrimina,
dimostra che era scritto male.

| falso | che cosa sbaglia | chi lo boccia |
|---|---|---|
| `_crit-sospetto-incompleto.js` | il sospetto sale anche su `INCOMPLETO` — l'innocente accusato, il difetto piu' grave possibile | **A**, e **B** sull'invariante |
| `_crit-sospetto-altromotore.js` | sale su `ALTRO MOTORE`: «se ha un altro motore qualcosa nasconde» | **A** |
| `_crit-sospetto-nonfinisce.js` | sale su `NON FINISCE`: «se non finisce e' perche' l'ha costruita apposta» | **A** |
| `_crit-sospetto-doppio.js` | niente guardia sul `verificata = 0`: un verdetto applicato due volte toglie i punti due volte e fa due sospetti | **B** |
| `_crit-abbinamento-largo.js` | la dimensione punti c'e', e' scritta, arriva all'SQL — ma le bande sono 2000/4000/8000, cioe' non filtrano niente. **Passa A, B e D**, e cade solo sulla MISURA | **C** |
| `_crit-abbinamento-ordine.js` | invece di sorteggiare nella banda prende il piu' vicino di punti: gli abbinamenti diventano ancora piu' stretti (la prova di vicinanza la passa a mani basse) e due della stessa fascia si incontrano all'infinito | **C**, varieta' |
| `_crit-sospetto-spione.js` | il sospetto esce nella tupla dell'avversario, «cosi' il gioco puo' avvisare» | **D** |

Il quinto e' quello che conta piu' di tutti: e' il falso che assomiglia a
una cura. Ha la colonna, ha il parametro, ha il predicato, e non cambia
niente. Un banco che non lo prende ha collaudato il codice invece del
comportamento.

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
