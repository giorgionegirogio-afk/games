# Il duello entra nel nastro — piano (voce #131)

Dossier: `docs/superpowers/specs/2026-09-21-duello-nastro-dossier.md`.
Progetto: `docs/superpowers/specs/2026-09-21-duello-nastro-design.md`.
Base: `main` = `7fbe9bf`. Ramo: `voce-131-duello-nastro`. Cantiere di
MOTORE: il gioco SI TOCCA, ma solo per ancore. Sette compiti (0..6), un
commit ciascuno.

## Vincoli globali

1. **Il gioco si tocca solo via attrezzo a ancore.** Ogni compito che
   modifica `CALCETTO-il-gioco.html` porta il suo `strumenti/_toppa-*.js`
   che cerca una stringa-ancora unica, la sostituisce, e scrive con
   `--out` una copia o con `--dentro` il gioco stesso. Mai un Edit
   diretto. La cura e il suo test stanno in due file, secondo la
   convenzione di `CLAUDE.md`: `_toppa-duello-X.js` applica,
   `_t-duello-X.js` misura. (Il nome `_t-duello-orologio.js` era gia'
   occupato dalla toppa del 31 agosto 2026 sull'orologio del DISEGNO,
   `Duel.vt`: sono due orologi diversi, e non si sovrascrive un attrezzo
   storico. Qui si chiama `contatore`.)
2. **L'impronta di non-regressione si rimisura a OGNI compito**
   (`node strumenti/_q-duello-impronta.js`). Se si muove di un numero, la
   cura e' sbagliata anche se tutti i test nuovi sono verdi: ci si ferma e
   si riferisce.
3. Ogni difetto ha prima un TEST FALLITO (mandato S13.3).
4. Batteria INTERA a ogni compito (lezione 22), a gruppi con `--solo`
   perche' `--tutto` chiede ~12 minuti.
5. Commenti senza lettere accentate.
6. Banchi a taglia 5, `sponde:'gabbia'`, `miraGuidata:'pieno'`; ordine
   sacro `startMatch(...)` PRIMA, `setCpuVsCpu(true)` DOPO.
7. Codici di uscita: 0 verde, 1 gioco rosso, 2 banco esploso, 3 prova
   nulla. Un 2 o un 3 non accusano il gioco.

## Compito 0 — spec, piano e la rete di sicurezza

Questo documento, la spec, il dossier (finora non tracciato) e
`strumenti/_q-duello-impronta.js` con la sua impronta congelata
(`strumenti/duello-impronta.json` — non `_z-dati/`, che e' nel
`.gitignore`: un riferimento che non viaggia col repo non e' un
riferimento).

L'impronta si congela PRIMA di toccare qualunque cosa e si verifica su
tre fronti: (a) ripetibile — due giri di fila identici; (b) non vuota —
un mutante che ritarda il cursore di UN aggiornamento la fa arrossire;
(c) copre tutti e due i regimi, CPU contro CPU e umano a copione.

Commit `(voce #131, compito 0)`.

## Compito 1 — il banco che condanna (nessuna modifica al gioco)

**`strumenti/_t-duello-nastro.js`.** Gioca una sfida a seme fisso che
entra in duello con un umano dentro, registra il nastro, e prova a
rigiocarlo. Tre asserzioni, tutte ROSSE oggi:

- A) il nastro NON porta il marchio di tipo 5 (oggi lo porta: `Reg.scrivi(5,[])`
  a `:22657`) — cioe' il nastro dichiara da se' di bastare;
- B) il nastro porta almeno una riga di tipo 6 per un duello con umano
  (oggi il tipo 6 non esiste);
- C) la serie rigiocata da' gli STESSI esiti duello per duello e lo stesso
  punteggio (oggi diverge al primo duello: la rilettura non ha nessun dito
  e il duello si decide da solo, o resta appeso).

**`strumenti/_crit-duello-passo.js`.** Il mutante: costruisce una copia
del gioco col gancio spostato di un fotogramma (`Reg.passoDuello()`
chiamata DOPO `Duel.update` invece che prima). Vale solo dopo il C5, ma
si scrive ora perche' e' il criterio con cui il banco del C1/C5 si giudica:
se `_t-duello-nastro.js --gioco <mutante>` non esce rosso, il banco
attesta invece di misurare.

**Cancelli.** `_t-duello-nastro.js` ROSSO (dichiarato, misurato).
`_q-duello-impronta.js` VERDE. `git diff main -- CALCETTO-il-gioco.html`
vuoto. Batteria intera a gruppi.
Commit `(voce #131, compito 1)`.

## Compito 2 — l'orologio del duello (solo contatori)

**Attrezzo:** `strumenti/_t-duello-contatore.js` (il nome
`_t-duello-orologio.js` e' gia' occupato dalla toppa del 31 agosto 2026
sull'orologio del DISEGNO, `Duel.vt`: sono due orologi diversi e non si
sovrascrive un attrezzo storico).

**La cura, tutta additiva.**
- `Duel` guadagna tre campi dichiarati accanto agli altri: `nDuello:0`,
  `passo:0`, `dentroUpdate:false`.
- `Duel.start` e `Duel.update` vengono AVVOLTI DALL'ESTERNO, in un blocco
  accanto alle quattro porte di `Touch5` (`:43489`): `start` incrementa
  `nDuello` e azzera `passo`; `update` accende `dentroUpdate` in un
  `try/finally` (il `return` anticipato di `:22564` non deve lasciarlo
  acceso) e incrementa `passo` come PRIMA cosa.
- `Reg` guadagna `passoDuello()`, che a questo compito fa solo
  `Duel.passo++` e torna subito se `modo===0`: il ramo di rilettura arriva
  al C5.
- `nDuello` si azzera dove comincia un nastro: in `Reg.accendi()` e in
  `Reg.deserializza()`.

**Il test.** `strumenti/_t-duello-contatore.js --prova` (o un
`_t-duello-contatore-prova.js` se piu' pulito): `nDuello` distingue tutti
i duelli di una serie di rigori (oggi `Reg.tick` non li distingue: 40/40
lo stesso valore); `passo` riparte da zero a ogni duello e cresce di uno
per aggiornamento; `dentroUpdate` e' vero dentro `Duel.update` e falso
fuori; `Reg.tick` e `__test.sorteggi` a fine partita IDENTICI al gioco di
prima (nessun comportamento cambia: sono solo contatori).

**Cancelli.** Il test nuovo verde. `_q-duello-impronta.js` VERDE (e' il
cancello che conta: i contatori non devono spostare un numero).
`_t-duello-nastro.js` ancora rosso (giusto: la cura vera non c'e').
Batteria intera a gruppi.
Commit `(voce #131, compito 2)`.

## Compito 3 — la mira si posa su una tacca intera

**Attrezzo:** `strumenti/_t-duello-tacca.js`.

**La cura.** `duelMira` (`:22682-22697`) quantizza `u` e `v` a un
millesimo, in tutte e tre le modalita' (non solo in registrazione: la
dottrina del pixel intero, `:43497-43512`), e ricava `z` dalla `u` GIA'
quantizzata.

**Il test, PRIMA della cura.** `strumenti/_t-duello-tacca-prova.js`: apre
il gioco su DUE viewport (915x412 e 782x299), chiama `duelMira` sugli
stessi `clientX/clientY`, e verifica che i `u,v` restituiti siano
rappresentabili con tre decimali. Oggi non lo sono (rosso). Piu' una
non-regressione: il duello della CPU (che non passa da `duelMira`) resta
identico alla cifra — e' l'impronta.

**Cancelli.** Il test nuovo rosso prima, verde dopo.
`_q-duello-impronta.js` VERDE. `_q-mira.js`, `_t-mira.js`,
`_t-mira-ui.js`, `_t-mira-guidata.js` verdi. Batteria intera a gruppi.
Commit `(voce #131, compito 3)`.

## Compito 4 — le tre porte avvolte dall'esterno

**Attrezzo:** `strumenti/_t-duello-porte.js`.

**La cura.**
- Nel blocco accanto alle porte di `Touch5`, si avvolgono
  `Duel.pickZone` (verbo 0), `Duel.stopPower` (verbo 1) e
  `Duel.pickKeeper` (verbo 2). Ogni porta: in rilettura le dita vere sono
  ignorate (`Reg.modo===2 && !Reg.dentro && !Duel.dentroUpdate` -> esce);
  in registrazione scrive il tipo 6 **solo se** `Reg.modo===1` e
  `!Duel.dentroUpdate` (la trappola B: il ripiego del portiere a
  `cpuT=3.0` gira anche col portiere umano).
- `Reg.serializza`/`Reg.deserializza` imparano il tipo 6, a lunghezza
  variabile come il tipo 7. `deserializza` costruisce anche l'elenco
  filtrato `Reg.duelli` col suo cursore `Reg.iDuello`, cosi' il ciclo di
  `Reg.passo()` non puo' consumare le righe del duello prima del tempo.

**Il test.** `strumenti/_t-duello-porte-prova.js`, quattro asserzioni:
un duello con umano produce >= 2 righe di tipo 6; un duello tutto CPU ne
produce ZERO; il ripiego del portiere non finisce nel nastro; scritto,
riletto e riscritto da' lo STESSO testo. Piu': `__test.sorteggi` a fine
partita identico (scrivere nel nastro non consuma sorteggi).

**Cancelli.** Il test nuovo verde. `_q-duello-impronta.js` VERDE.
`_q-replay.js`, `_t-registro.js`, `_t-nastro-versione.js`, `_q-sfida.js`
verdi. Batteria intera a gruppi.
Commit `(voce #131, compito 4)`.

## Compito 5 — la riproduzione (e la rete di sicurezza che resta)

**Attrezzo:** `strumenti/_t-duello-rigioca.js`.

**La cura.**
- `Reg.passoDuello()` guadagna il ramo di rilettura: dopo l'incremento,
  esegue in ordine tutte le righe di `Reg.duelli` con
  `riga.nDuello === Duel.nDuello` e `riga.passo < Duel.passo`, con
  `Reg.dentro = true` intorno. La guardia STRETTA (`<`, non `<=`) e' il
  cuore: un dito che cade fra l'aggiornamento k e il k+1 legge un cursore
  avanzato k volte, quindi in rilettura va eseguito all'inizio
  dell'aggiornamento k+1.
- In `startFreeKick` sparisce `Reg.scrivi(5, [])` e l'armamento
  incondizionato del ripiego; al loro posto il ripiego si arma sul caso
  VERO: `Reg.modo===2`, replay, umano dentro, e NESSUNA riga di tipo 6
  per questo `nDuello`.
- `fermaReplayAlDischetto` NON si cancella (si aggiorna il suo verbale: da
  «il registro non annota ancora» a «questo nastro non porta i comandi di
  quel duello»).
- Il controllo `incompleto` (`:43135-43148`) NON si cancella: serve ai
  nastri vecchi finche' MOTORE_V resta 2 (decisione al C6).

**Cancelli.**
- `_t-duello-nastro.js` diventa VERDE (era rosso dal C1).
- `_t-duello-nastro.js --gioco fuori/crit-duello-passo.html` resta ROSSO:
  il mutante da un fotogramma e' condannato. Se passasse, il banco non
  discrimina e ci si ferma.
- Una serie di rigori INTERA rigiocata esito per esito (non solo il
  punteggio finale).
- Un nastro TRONCATO (le righe dell'ultimo duello tolte a mano) ferma il
  replay con causa vera invece di restare appeso.
- `_q-duello-impronta.js` VERDE. Batteria intera a gruppi.
Commit `(voce #131, compito 5)`.

## Compito 6 — MOTORE_V, con la misura, e il verbale

**Attrezzo:** `strumenti/_t-duello-motorev.js`. Due versioni: il gioco di
oggi copiato in `fuori/` (il modo di casa di `_c3-sorteggi.js`) e il gioco
curato. Registra 30 nastri SENZA duello sul gioco di OGGI (seme variabile,
partite che non arrivano al dischetto — si scartano e si rilanciano quelle
che ci arrivano, dichiarando quante), li rigioca sul gioco CURATO e
confronta punteggio e conto-sorteggi.

- Identici 30/30 -> MOTORE_V resta 2, e la misura si scrive ACCANTO al
  numero nel sorgente (non «si ritiene», ma «misurato il 21 settembre
  2026, 30/30»). Il controllo `incompleto` resta.
- Anche UN solo scarto -> MOTORE_V sale a 3 (attrezzo a ancora), e allora
  il controllo `incompleto` si puo' togliere.

**Il verbale.** `MANUALE.md` S A registro, voce #131 IN CIMA (sopra la
#130): il difetto nei suoi tre buchi, la frequenza misurata, l'orologio e
perche' non sono i millisecondi, le due trappole, il formato, la
riproduzione, il mutante condannato, la decisione MOTORE_V con la misura,
l'impronta di non-regressione e il fatto che non si e' mossa, l'esito
della batteria. Riga nuova IN CIMA a `PUNTO-DEL-LAVORO.md` («RIGA
SUPERATA» sulla precedente). Aggiornare il commento di
`fermaReplayAlDischetto` e il paragrafo «COSA CI VORREBBE PER RIPARARLO
DAVVERO» (`:43384-43393`), che adesso e' FATTO: rettifica a edizioni.
Commit `(voce #131, compito 6)`.

## Chiusura

Revisione finale adversariale: il test-condanna vero rosso->verde, il
mutante condannato DOPO la cura, l'impronta ferma su tutti e sette i
compiti, la decisione MOTORE_V misurata e non opinata, il ripiego
conservato e riarmato sul caso vero, `git diff main --
CALCETTO-il-gioco.html` che tocca solo le funzioni dichiarate qui.
