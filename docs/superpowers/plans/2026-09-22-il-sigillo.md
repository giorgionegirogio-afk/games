# Il sigillo — piano (voce #134)

Progetto: `docs/superpowers/specs/2026-09-22-il-sigillo-design.md`.
Base: `main` = `6dee72b`. Ramo: `voce-134-il-sigillo`. Cantiere di
MOTORE **e di SERVER**: si toccano `CALCETTO-il-gioco.html` (solo per
ancore) e `rete/api/sfida.js`. Quattro compiti (0..3), un commit
ciascuno.

## Vincoli globali

1. **Il gioco si tocca solo via attrezzo a ancore.** Ogni compito che
   modifica `CALCETTO-il-gioco.html` porta il suo `strumenti/_toppa-*.js`
   che cerca una stringa-ancora unica, la sostituisce, e scrive con
   `--out` una copia o con `--dentro` il gioco stesso, con specchio
   byte-per-byte. Mai un Edit diretto.
2. **Ogni difetto ha prima un TEST FALLITO** (mandato §13.3), e ogni test
   ha il suo FALSO (`_crit-*.js`) che dimostra che il banco discrimina.
   Il falso va costruito nel caso peggiore: deve PASSARE le prove di
   forma e CADERE su quella di sostanza.
3. **Le reti di sicurezza verdi a OGNI compito**: `_q-duello-impronta`
   44/44, `_q-giudice` 21/21, `_q-ment-nastro` 6/6,
   `_q-carattere-nastro` 4/4, `_q-rosa-scala` 4/4, `_q-nastro-tronco`
   5/5, piu' `_q-rete`, `_q-sfida` e `senza-rete`. Se una si muove di un
   numero ci si ferma e si riferisce, anche se tutto il resto e' verde.
4. **Batteria INTERA a ogni compito** (lezione 22), a gruppi con `--solo`
   perche' `--tutto` chiede ~12 minuti.
5. Commenti senza lettere accentate.
6. Banchi a taglia 5, `sponde:'gabbia'`, `miraGuidata:'pieno'`; ordine
   sacro `startMatch(...)` PRIMA, `setCpuVsCpu(true)` DOPO.
7. Codici di uscita: 0 verde, 1 gioco rosso, 2 banco esploso, 3 prova
   nulla. Un 2 o un 3 non accusano il gioco.
8. **Nessuna tabella nuova**, quindi nessuna riga di RLS da scrivere. Se
   il cantiere finisse per volerne una, ci si ferma: una tabella senza
   `enable row level security` + `revoke` sarebbe l'unica porta aperta
   del database.
9. `MOTORE_V` resta **2**. Non si tocca il nastro ne' la simulazione: la
   prova sono l'impronta del duello e il giudice, verdi a ogni compito.

## Compito 0 — spec e piano

Questo documento e la spec. Niente codice.

Misure di partenza, prese prima di toccare qualunque cosa:

- `_q-duello-impronta.js`: **44 su 44**, VERDE.
- `_q-giudice.js`: **21 su 21**, VERDE.
- `_q-ment-nastro.js` 6/6 · `_q-carattere-nastro.js` 4/4 ·
  `_q-rosa-scala.js` 4/4 · `_q-nastro-tronco.js` 5/5. Tutti VERDI.
- La piega della schermata SFIDA, con cinque righe finte in lista
  (`fuori/_sonda-134-piega.js`): CERCA AVVERSARIO a `174..220` su
  915x412 e su 800x360, riga alta 46 px, prima riga della lista a
  `~268..314` — cioe' 46 px di margine sulla piega di 800x360.
- `grep -c verificata rete/api/*.js` = **1**, ed e' dentro a un commento.

Commit `(voce #134, compito 0)`.

## Compito 1 — il verdetto viaggia

**Test primo:** `strumenti/_q-sigillo.js`, gruppo A + prova B0. Nasce
ROSSO per la ragione piu' semplice: il `GET /api/sfida` non restituisce
`verificata`, quindi `Sfida.sfide[i].verificata` e' `undefined`.

Il gruppo A non usa un server finto: carica il modulo **vero**
`rete/api/sfida.js` con `import()` dinamico (la cartella `rete/` e'
`"type": "module"`), mette al posto di `db` un finto che risponde a
`leggi('sfida', ...)`, `leggi('squadra', ...)` e `chiama('frena', ...)`,
e chiama il `handler` con un `req`/`res` di carta. Tre prove:

- **A1)** la riga che esce porta `verificata` col valore della riga del
  database (0, 1 e -1: tre chiamate, tre valori distinti);
- **A2)** la `select` chiesta a PostgREST contiene `verificata` — si
  legge dalla query che il `db` finto ha ricevuto, non dal testo del
  file: un banco che legge il sorgente attesta, uno che guarda la query
  misura;
- **A3)** il freno e' stato interrogato con la chiave e i numeri
  dichiarati (`sfl:<id>`, 60, 60), e un freno che dice di no fa uscire
  `429/troppe`.

- **B0)** dal lato del telefono: con un server finto che manda
  `verificata`, `Sfida.sfide[i].verificata` lo porta.

**La cura, in due file:**

- `rete/api/sfida.js` — `verificata` nella `select` del `GET`, e il freno
  `sfl:` (vedi la spec, sezione (a)). Si tocca con Edit: e' un file di
  180 righe, non il gioco da 2,5 MB.
- i **server finti** dei banchi (`_q-rete.js`, `_q-sfida.js`,
  `_sfida-due-telefoni.js`, `_crit6-monete.js`) imparano a tenere e a
  restituire `verificata`, se no il contratto finto e quello vero
  divergono in silenzio — che e' il modo in cui i banchi cominciano a
  mentire.

Il client non ha bisogno di nessuna cura per B0: `Sfida.aggiorna` salva
le righe come arrivano. La prova esiste lo stesso perche' domani qualcuno
potrebbe rimappare quelle righe campo per campo, e allora il tubo si
chiuderebbe senza che nessuno se ne accorga.

**Il falso:** `_crit-sigillo-server-sordo.js` scrive in `fuori/` una
copia di `rete/api/sfida.js` senza `verificata` nella `select`. Il banco,
puntato li' con `--api`, deve diventare ROSSO su A1 e A2 e restare verde
su A3.

Reti di sicurezza + batteria intera. Commit `(voce #134, compito 1)`.

## Compito 2 — il verdetto si vede, e GUARDA lo produce

**Test primo:** i gruppi B e C di `_q-sigillo.js`. Nascono ROSSI: la riga
non stampa niente, e `Sfida.giudicato` non esiste.

### 2a — una porta sola (`vagliaNastro`)

`strumenti/_toppa-sigillo-vaglio.js`. I nove controlli sul nastro escono
dal corpo di `giudica` e diventano `vagliaNastro()`, sopra a `giudica`.
`giudica` la chiama e traduce il suo esito nei soliti `fermo(...)`;
`Sfida.guarda` la chiama e decide caso per caso se mostrare il film (vedi
la tavola nella spec). **Il comportamento visibile non cambia**: stessi
rifiuti, stessi messaggi, stessi film. La rete che lo prova e'
`_q-giudice` 21/21, che verifica i nove esiti uno per uno.

### 2b — il sigillo nella riga

`strumenti/_toppa-sigillo-riga.js`: CSS (`.sfsig` e le tre tinte), e
`Sfida.dipingi` che stampa la seconda riga dentro `.sfchi`. Le cinque
parole della spec. Piu' `Sfida.giudicato = {}` (i verdetti di questa
sessione) e `Sfida.sigilla(id, verdetto, causa)`.

### 2c — GUARDA lascia il segno

`strumenti/_toppa-sigillo-guarda.js`: i rifiuti di `Sfida.guarda`
chiamano `sigilla`; i casi tollerati mettono `G.sfida.sigillo = {id,
giudicabile:false, causa}`; il caso pulito mette `giudicabile:true`; e
`chiudiSfida`, nel ramo del replay, chiude il conto — `TORNA` se i gol
coincidono, `NON TORNA` se no, `NON VERIFICABILE` se non era
giudicabile. Chi esce a meta' col tasto ESCI passa da `abbandonaSfida` e
non lascia nessun sigillo: un replay interrotto non prova niente.

### Le prove

- **B1)** tre righe con `verificata` 1, -1, 0 danno tre parole diverse
  nella lista;
- **B2)** `NON TORNA` compare **una volta sola**, sulla riga del `-1`;
- **B3)** a 800x360 con cinque righe, `#btnSfidaCerca` e il primo bottone
  GUARDA restano interi sopra la piega;
- **C1)** sfida vera, guardata dal difensore sullo stesso schermo: il
  sigillo dice `TORNA`;
- **C2)** stessa sfida col punteggio dichiarato gonfiato di un gol:
  `NON TORNA`;
- **C3)** stessa sfida guardata da un telefono con un ALTRO schermo:
  **mai** `NON TORNA` — `NON VERIFICABILE`, e la causa dice `schermo`;
- **C4)** il verdetto della schermata e quello di `__test.giudica` sullo
  stesso nastro coincidono: una porta sola, non due;
- **C5)** l'autorita' e' del server: su una riga con `verificata = 1` il
  sigillo resta `VERIFICATA` anche dopo aver guardato.

### I falsi

- `_crit-sigillo-muto.js` — la riga non stampa il sigillo. Cade su B1,
  passa B3.
- `_crit-sigillo-accusa.js` — `NON TORNA` su ogni `verificata != 1` e su
  ogni verdetto che non sia `TORNA`. Cade su B2 e su C3, passa B1.
- `_crit-sigillo-fascia.js` — la fascia di riepilogo sopra la lista.
  Cade su B3, passa B1 e B2.
- `_crit-sigillo-timbro.js` — GUARDA sigilla sempre `TORNA`. Cade su C2,
  passa C1.

Reti di sicurezza + batteria intera. Commit `(voce #134, compito 2)`.

## Compito 3 — batteria, registro, verbale

- `_q-sigillo` registrato in `strumenti/tutti.js` con `conta:true` e il
  suo cappello (perche' esiste, che cosa nessun altro cancello vede).
- Batteria INTERA a gruppi, e il referto trascritto.
- `MANUALE.md` §A, voce #134 in cima al registro.
- `PUNTO-DEL-LAVORO.md`, la riga della giornata.
- `rete/LEGGIMI.md`: la rettifica a edizioni della #133 dice «quel che
  manca e' il ciclo». Resta vero, e si aggiunge che il verdetto adesso
  arriva fino all'occhio di chi gioca.

Commit `(voce #134, compito 3)`.

## Quello che fa fermare il cantiere

- Una rete di sicurezza che si muove di un numero.
- `_q-giudice` che cambia comportamento dopo l'estrazione di
  `vagliaNastro`: vorrebbe dire che il vaglio non e' quello di prima.
- Un falso che passa. Una prova che passa sia col gioco giusto sia col
  falso e' un difetto del banco, e va riparata prima di andare avanti.
