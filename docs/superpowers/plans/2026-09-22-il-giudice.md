# Il giudice — piano (voce #133)

Progetto: `docs/superpowers/specs/2026-09-22-il-giudice-design.md`.
Base: `main` = `e7aa605`. Ramo: `voce-133-il-giudice`. Cantiere di
MOTORE: il gioco SI TOCCA, ma solo per ancore. Cinque compiti (0..4), un
commit ciascuno.

## Vincoli globali

1. **Il gioco si tocca solo via attrezzo a ancore.** Ogni compito che
   modifica `CALCETTO-il-gioco.html` porta il suo `strumenti/_toppa-*.js`
   che cerca una stringa-ancora unica, la sostituisce, e scrive con
   `--out` una copia o con `--dentro` il gioco stesso, con specchio
   byte-per-byte. Mai un Edit diretto.
2. **L'impronta del duello si rimisura a OGNI compito**
   (`node strumenti/_q-duello-impronta.js`, 44 duelli). Se si muove di un
   numero ci si ferma e si riferisce, anche se tutti i test nuovi sono
   verdi.
3. **I quattro cancelli dei canali della voce #132** (`_q-ment-nastro`,
   `_q-carattere-nastro`, `_q-rosa-scala`, `_q-nastro-tronco`) verdi a
   ogni compito. Sono la ragione per cui questo cantiere e' possibile.
4. Ogni difetto ha prima un TEST FALLITO (mandato S13.3), e ogni test ha
   il suo FALSO (`_crit-*.js`) che dimostra che il banco discrimina. Il
   falso va costruito nel caso peggiore: deve PASSARE le prove di forma e
   CADERE su quella di sostanza.
5. Batteria INTERA a ogni compito (lezione 22), a gruppi con `--solo`
   perche' `--tutto` chiede ~12 minuti.
6. Commenti senza lettere accentate.
7. Banchi a taglia 5, `sponde:'gabbia'`, `miraGuidata:'pieno'`; ordine
   sacro `startMatch(...)` PRIMA, `setCpuVsCpu(true)` DOPO.
8. Codici di uscita: 0 verde, 1 gioco rosso, 2 banco esploso, 3 prova
   nulla. Un 2 o un 3 non accusano il gioco.
9. I banchi di questo cantiere girano **a due pagine e con un server
   finto**, sul modello di `_q-sfida.js` e riusando
   `strumenti/_sfida-due-telefoni.js`: una sfida vera si puo' registrare
   solo attaccando e rivedere solo difendendo. Un banco che scrive il
   nastro a mano proverebbe il banco, non il gioco.

## Compito 0 — spec e piano

Questo documento e la spec. Niente codice.

Misure di partenza, prese prima di toccare qualunque cosa:

- `_q-duello-impronta.js`: **44 su 44**, VERDE.
- `_q-ment-nastro.js`: 6 su 6. `_q-carattere-nastro.js`: 4 su 4.
  `_q-rosa-scala.js`: 4 su 4. `_q-nastro-tronco.js`: 5 su 5.

`fuori/gioco-133-base.html` = `git show main:CALCETTO-il-gioco.html`,
per la misura a due versioni del C4.

Commit `(voce #133, compito 0)`.

## Compito 1 — il banco che condanna, e i sette falsi

**Test primo:** `strumenti/_q-giudice.js`. Nasce ROSSO su TUTTE le prove
di sostanza, per la ragione piu' semplice: `window.__test.giudica` non
esiste.

Il banco gioca due sfide vere a due pagine, ne prende i nastri dal server
finto, e poi chiama il giudice su una famiglia di ingressi costruiti a
partire da quei nastri veri. Le prove:

- **A) la forma.** `__test.giudica` e' una funzione, e ogni chiamata
  torna un oggetto con `verdetto` fra i cinque nomi della tavola.
- **B) TORNA.** Il nastro vero, col punteggio vero -> `TORNA`, e i gol
  del giudizio sono quelli dichiarati.
- **C) NON TORNA.** Lo stesso nastro col punteggio gonfiato di un gol ->
  `NON TORNA`.
- **D) INCOMPLETO / nastro-vuoto.** `1|2||` -> `INCOMPLETO`, causa
  `nastro-vuoto`.
- **E) INCOMPLETO / nastro-troncato.** Il nastro vero tagliato a meta' e
  marchiato -> `INCOMPLETO`, causa `nastro-troncato`.
- **F) INCOMPLETO / rose-assenti.** Il nastro vero senza la riga di
  tipo 7 -> `INCOMPLETO`, causa `rose-assenti`.
- **G) ALTRO MOTORE.** Il nastro vero con `99` al posto della versione
  in testa -> `ALTRO MOTORE`.
- **H) il giudice rigioca DAVVERO.** Lo stesso nastro con un ALTRO seme
  -> `NON TORNA`. E' la prova che condanna un giudice che si limitasse a
  leggere il punteggio da qualche parte invece di rifare la partita.
- **I) ripetibile.** Due chiamate consecutive sullo stesso nastro danno
  lo stesso verdetto, gli stessi gol e lo stesso numero di passi.
- **J) i cinque verdetti sono DISTINTI.** L'insieme dei verdetti raccolti
  dalle prove B..H ha cardinalita' 4 (`TORNA`, `NON TORNA`,
  `INCOMPLETO`, `ALTRO MOTORE`); il quinto (`NON FINISCE`) lo porta il
  falso `_crit-giudice-lento.js`, che il banco non puo' produrre su un
  gioco sano — ed e' giusto cosi'.
- **K) il tetto e' quello della taglia.** `giudica` dichiara nel suo
  esito il `tetto` usato, e dev'essere `tettoFotogrammi(taglia)` di
  `_q-invarianti.js`, taglia per taglia (5, 7, 11).
- **L) il giudice non muove niente.** Punti, coda e salvataggio prima e
  dopo una raffica di giudizi: identici.

**I falsi** (`_crit-giudice-*.js`, ognuno un gioco mutante scritto in
`fuori/`): `gonfio`, `mozzo`, `motore`, `vuoto`, `lento`, `rosa`, `seme`.
Quelli che mutano il NASTRO li costruisce il banco in memoria; quelli che
mutano il GIOCO sono file mutanti veri:

- `_crit-giudice-cieco.js`: il giudice che dice sempre `TORNA`. Deve
  cadere su C, e non su B.
- `_crit-giudice-sordo.js`: il giudice che accetta la testa di tipo 7
  malformata e ripiega sul profilo vivo, come fa `Sfida.guarda`. Deve
  cadere su F, e non su B.
- `_crit-giudice-fisso.js`: il giudice col tetto fisso a 18.000 a
  qualunque taglia. Deve cadere su K a taglia 11, e non a taglia 5.
- `_crit-giudice-locale.js`: il giudice che segue `SAVE.sponde` invece di
  forzare `gabbia`. Deve cadere su B con le sponde locali a campo vero.

Commit `(voce #133, compito 1)`.

## Compito 2 — `giudica()` nel file

`strumenti/_toppa-giudice.js` applica tre ancore:

1. **`chiudiSfida`** — un ramo in testa: se `G.sfida.giudizio`, si
   chiude la partita senza toast, senza `Sfida.stato`, senza rete, e si
   lascia il punteggio leggibile.
2. **`startFreeKick`** — il ripiego del dischetto (`:23074-23076`): in
   modo giudizio si alza una bandiera invece di chiamare
   `fermaReplayAlDischetto`, che e' tutta schermo.
3. **La funzione nuova** `giudica(nastro, atteso, opz)` piu' la tavola
   `TETTI_GIUDIZIO`, dopo `abbandonaSfida`; e la voce
   `giudica` in `window.__test`.

Il C1 diventa VERDE. Rilancio dell'impronta, dei quattro cancelli del
#132 e della batteria intera.

Commit `(voce #133, compito 2)`.

## Compito 3 — il tasso di falsi NON TORNA

`strumenti/_t-giudice-onesto.js`. N sfide vere (dita simulate, copione
fisso), giudicate una per una. Si dichiara: N giudicate, quante `TORNA`,
quante no e quali.

Piu' i tre canali sospetti della spec, misurati apposta:

- **i nomi**: due pagine con nomi di squadra diversi giudicano lo stesso
  nastro — stesso verdetto?
- **l'audio**: pagina con audio sbloccato e pagina senza — stesso
  verdetto?
- **la finestra**: due viewport diverse — stesso verdetto?

E le tre taglie: 5, 7, 11.

**Se anche una sola partita onesta da' `NON TORNA`, ci si ferma e si
riferisce.**

Commit `(voce #133, compito 3)`.

## Compito 4 — MOTORE_V, batteria, verbale

- `strumenti/_t-133-motorev.js`: N nastri registrati su
  `fuori/gioco-133-base.html` e rigiocati sul curato, impronta per
  impronta. N su N identici -> `MOTORE_V` resta 2, e la misura si scrive
  accanto alla costante nel gioco (per ancora, come hanno fatto il #131 e
  il #132).
- `_q-giudice.js` registrato in `strumenti/tutti.js` con `conta:true`.
- Verbale in `MANUALE.md` §A, in cima.
- Riga in `PUNTO-DEL-LAVORO.md`.

Commit `(voce #133, compito 4)`.
