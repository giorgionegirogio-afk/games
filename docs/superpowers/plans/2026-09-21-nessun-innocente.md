# Nessun innocente accusato — piano (voce #132)

Progetto: `docs/superpowers/specs/2026-09-21-nessun-innocente-design.md`.
Base: `main` = `3deb807`. Ramo: `voce-132-nessun-innocente`. Cantiere di
MOTORE: il gioco SI TOCCA, ma solo per ancore. Sei compiti (0..5), un
commit ciascuno.

## Vincoli globali

1. **Il gioco si tocca solo via attrezzo a ancore.** Ogni compito che
   modifica `CALCETTO-il-gioco.html` porta il suo `strumenti/_toppa-*.js`
   che cerca una stringa-ancora unica, la sostituisce, e scrive con
   `--out` una copia o con `--dentro` il gioco stesso. Mai un Edit
   diretto. Cura e test in due file: `_toppa-X.js` applica, `_t-X.js`
   misura.
2. **L'impronta del duello si rimisura a OGNI compito**
   (`node strumenti/_q-duello-impronta.js`, 44 duelli). Se si muove di un
   numero ci si ferma e si riferisce, anche se tutti i test nuovi sono
   verdi.
3. Ogni difetto ha prima un TEST FALLITO (mandato S13.3), e ogni test ha
   il suo FALSO (`_crit-*.js`) che dimostra che il banco discrimina. Il
   falso va costruito nel caso peggiore, e lo stato va SPORCATO prima di
   misurare: la revisione della voce #131 ha bocciato una prova che
   passava sia col gioco giusto sia col falso.
4. Batteria INTERA a ogni compito (lezione 22), a gruppi con `--solo`
   perche' `--tutto` chiede ~12 minuti.
5. Commenti senza lettere accentate.
6. Banchi a taglia 5, `sponde:'gabbia'`, `miraGuidata:'pieno'`; ordine
   sacro `startMatch(...)` PRIMA, `setCpuVsCpu(true)` DOPO.
7. Codici di uscita: 0 verde, 1 gioco rosso, 2 banco esploso, 3 prova
   nulla. Un 2 o un 3 non accusano il gioco.
8. I banchi di questo cantiere girano **a due pagine e con un server
   finto**, sul modello di `_q-sfida.js`: una sfida vera si puo'
   registrare solo attaccando, e rivedere solo difendendo. Un banco che
   scrive il nastro a mano proverebbe il banco, non il gioco.

## Compito 0 — spec, piano e i numeri dei quattro canali

Questo documento, la spec, e `strumenti/_sonda-132-canali.js` — la sonda
che misura quanto pesa ciascun canale (CPU contro CPU, taglia 5, 5 semi)
e quante dita servono perche' il tetto del registro cada dentro una
sfida. I numeri della spec vengono da li'.

Impronta del duello congelata dalla voce #131, rimisurata prima di
toccare qualunque cosa: **44 su 44**.
`fuori/gioco-132-base.html` = `git show main:CALCETTO-il-gioco.html`,
per la misura a due versioni del C5.

Commit `(voce #132, compito 0)`.

## RETTIFICA A EDIZIONI (21 settembre 2026, voce #132, compito 1)

**I canali erano quattro quando questo piano e' stato scritto. Sono
cinque.** Il quinto — `Audio5.noiseBuf` che riempie un secondo di
campionamento col generatore SEMINATO, 48.000 sorteggi al primo sblocco
dell'audio — e' stato trovato MISURANDO: il cancello del compito 1
restava rosso su una sfida su due anche a cura applicata, e la causa non
era la mentalita'. E' curato dentro il compito 1
(`strumenti/_toppa-rumore-sorteggi.js`, una riga) e provato dalla prova E
di `_t-ment-nastro.js`; la spec lo descrive come canale (e). Il testo dei
compiti qui sotto resta quello scritto prima, e non si cancella.

## Compito 1 — canale (a): la mentalita' e' una mossa

**Test primo:** `strumenti/_t-ment-nastro.js`. Due pagine, server finto.
A attacca e a meta' partita preme il bottone della mentalita' in pausa; B
guarda. Tre asserzioni, ROSSE oggi:

- A) il nastro porta una riga di tipo 8 per quel cambio (oggi il tipo 8
  non esiste);
- B) il replay finisce col punteggio dichiarato (oggi diverge: in
  rilettura la mentalita' resta quella di partenza);
- C) durante un replay il bottone della pausa NON cambia la partita di un
  altro (oggi la cambia).

**Falso:** `strumenti/_crit-ment-muta.js` — scrive la riga di tipo 8 ma
non le da' il ramo in `Reg.esegui`: il nastro dichiara e non rimette in
scena. Il banco deve bocciarlo anche DOPO la cura (se no la prova A da
sola assolverebbe).

**Cura:** `strumenti/_toppa-ment-nastro.js`, ancore:
`posaMentalita()` nuova accanto a `mentDi`; il gestore di `btnPauseMent`
con la guardia `Reg.modo === 2` e `Reg.scrivi(8, [0, m])`;
`refreshPauseMent` che spegne il bottone in rilettura; il ramo 8 in
`esegui`, in `serializza` e in `deserializza`.

**Cancelli.** `_t-ment-nastro.js` rosso prima / verde dopo, e rosso sul
falso. `_q-duello-impronta.js` 44/44. Batteria intera a gruppi.
Commit `(voce #132, compito 1)`.

## Compito 2 — canale (b): nel nastro l'indice, non il nome

**Test primo:** `strumenti/_t-carattere-nastro.js`. A attacca una squadra
che si chiama come una delle dieci di `CARATTERE`; poi si registra lo
stesso nastro e lo si rigioca con l'avversario rinominato (il caso vero:
il difensore cambia nome, o il server non ha piu' la sua riga e
`Sfida.guarda` ripiega su `SAVE.teamName`). Asserzioni ROSSE oggi:

- A) la riga di tipo 7 porta l'indice di carattere (oggi non c'e');
- B) rigiocato con un nome diverso, il nastro da' la STESSA partita (oggi
  ne da' un'altra: misurato 5 semi su 5 divergenti, 4 su 5 con punteggio
  diverso);
- C) non-regressione: fuori dalla sfida, il carattere resta quello del
  nome, tabella per tabella.

**Falso:** `strumenti/_crit-car-nome.js` — scrive l'indice nel nastro ma
in rilettura continua a leggere il nome. Il banco deve bocciarlo: e' il
falso che passa la prova A e fallisce la B.

**Cura:** `strumenti/_toppa-carattere-nastro.js`, ancore: `CAR_NOMI` +
`indiceCarattere` + `carPerIndice` accanto a `caratterePer`; `G.car` che
guarda `opts.opp.car`; `Sfida.gioca` che scrive l'indice in coda al tipo
7 e lo passa a `startMatch`; `Sfida.guarda` che lo rilegge da
`dati[p2.fine]`.

**Cancelli.** Come sopra. Commit `(voce #132, compito 2)`.

## Compito 3 — canale (c): la scala si posa alla sorgente

**Test primo:** `strumenti/_t-rosa-scala.js`. Il salvataggio di chi
attacca porta un attributo fuori scala (250, e un NaN); si gioca la
sfida e si rivede. Asserzioni ROSSE oggi:

- A) l'uomo in campo e l'uomo nel nastro hanno lo stesso numero (oggi
  250 contro 99);
- B) il replay finisce col punteggio dichiarato (oggi no);
- C) le tre porte danno la stessa risposta allo stesso ingresso —
  `loadSave`, `impaccaRosa`, `startMatch` — su una tabella di casi
  (250, 0, -5, NaN, 62.5, 99, 1).

**Falso:** `strumenti/_crit-rosa-meta.js` — la scala stretta nel nastro
ma non alla sorgente (cioe' il gioco di oggi, con il solo `impaccaRosa`
reso «piu' giusto»): il banco deve restare rosso, perche' la meta' cura
non fa combaciare niente.

**Cura:** `strumenti/_toppa-rosa-scala.js`, ancore: `attrRosa` nuova;
`loadSave`; `impaccaRosa`; i due `q` di `startMatch`.

**Cancelli.** Come sopra. Commit `(voce #132, compito 3)`.

## Compito 4 — canale (d): il nastro dichiara la troncatura

**Test primo:** `strumenti/_t-nastro-tronco.js`. Asserzioni ROSSE oggi:

- A) un nastro che ha toccato il tetto porta il marchio di troncatura
  (oggi tace). Il tetto si tocca davvero, con le dita: il banco abbassa
  il tetto? NO — usa il numero di dita misurato dalla sonda, cosi' la
  prova e' sul gioco vero e non su una taratura da banco;
- B) `Sfida.guarda` rifiuta un nastro troncato con la causa vera (oggi lo
  accetta e poi accusa la rosa cresciuta);
- C) `Sfida.guarda` rifiuta un nastro VUOTO (oggi `'1|2||'` passa);
- D) non-regressione: un nastro normale non porta il marchio e si rivede
  come prima.

**Falso:** `strumenti/_crit-tronco-muto.js` — scrive il marchio ma non lo
rifiuta in `Sfida.guarda`. Il banco deve bocciarlo.

**Cura:** `strumenti/_toppa-nastro-tronco.js`, ancore: `Reg.troncato` +
il tetto che scrive il tipo 9; il ramo 9 in `serializza` e
`deserializza`; i due rifiuti in `Sfida.guarda`.

**Cancelli.** Come sopra. Commit `(voce #132, compito 4)`.

## Compito 5 — MOTORE_V misurato, batteria, verbale

**`strumenti/_t-132-motorev.js`** sul modello di `_t-duello-motorev.js`:
N nastri registrati su `fuori/gioco-132-base.html` e rigiocati sul gioco
curato, con il controllo del controllo (ogni nastro rigiocato anche sul
gioco di PRIMA: se gia' li' non torna, quel seme e' nullo e non conta).

- identici N su N -> `MOTORE_V` resta 2, e la misura si scrive accanto al
  numero nel gioco;
- anche UN solo scarto -> `MOTORE_V` sale a 3, i nastri vecchi vengono
  rifiutati dalla guardia che c'e' gia' (`:43359`), e il controllo
  `incompleto` (`:43397`) si puo' togliere.

Poi: batteria INTERA a gruppi, verbale in `MANUALE.md` §A **in cima,
sopra la voce #131**, riga in `PUNTO-DEL-LAVORO.md`, e le rettifiche a
edizioni dove serve.

Commit `(voce #132, compito 5)`.

## Come si riferisce

Per ogni canale: il test-condanna rosso -> verde coi numeri della
divergenza (quanto divergeva prima, quanto dopo), il falso costruito e la
prova che il banco lo boccia. Piu': l'impronta del duello a ogni compito,
la decisione su `MOTORE_V` con la MISURA, l'esito della batteria, e
`git diff main -- CALCETTO-il-gioco.html` funzione per funzione.

Se un canale non si lascia curare come previsto, o se l'impronta si
muove, ci si ferma e si riferisce: una diagnosi onesta vale piu' di una
cura forzata.

## Nota di edizione (21 settembre 2026, correzione di revisione)

I quattro attrezzi di compito nominati sopra come `_t-ment-nastro.js`,
`_t-carattere-nastro.js`, `_t-rosa-scala.js` e `_t-nastro-tronco.js` sono
stati promossi a cancelli di qualita' (`git mv` a `_q-ment-nastro.js`/
`_q-carattere-nastro.js`/`_q-rosa-scala.js`/`_q-nastro-tronco.js`) e
registrati in `strumenti/tutti.js`: senza, nessun cancello della
batteria si sarebbe accorto di una regressione sui cinque canali di
questa voce, lo stesso rilievo gia' pagato dalla voce #131 per il
duello. Il testo sopra resta con i nomi con cui i compiti sono stati
davvero eseguiti; il verbale in `MANUALE.md` §A, voce #132, riporta la
promozione.
