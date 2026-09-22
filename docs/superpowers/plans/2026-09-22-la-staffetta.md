# La staffetta — piano (voce #138)

Progetto: `docs/superpowers/specs/2026-09-22-la-staffetta-design.md`.
Base: `main` = `8127f6c`. Ramo: `voce-138-la-staffetta`.
**Il pezzo mancante che chiude l'onda D.**

Cantiere di **STRUMENTI**: si tocca `strumenti/` (il processo, il cancello, i
falsi) e `docs/`. **`CALCETTO-il-gioco.html` non si tocca** — la capacità c'è
già dal #133 — e la misura che lo dice è `git diff main --
CALCETTO-il-gioco.html` vuoto a ogni compito. **`rete/` non si tocca**:
`segna_verdetto` e la colonna esistono dal #137. Quattro compiti (0..3), un
commit ciascuno.

## Vincoli globali

1. **Il gioco non si tocca**, e `rete/` nemmeno (salvo le rettifiche a
   edizioni in `rete/LEGGIMI.md` e `rete/schema.sql`, che sono commenti e
   prosa: la promessa lì scritta diventa un fatto, e va rettificata in chiaro
   invece che lasciata a dire «manca la staffetta» quando la staffetta c'è).
   Se un compito volesse toccare il motore, ci si ferma e si riferisce.
2. **Ogni funzione nuova ha prima un TEST che nasce ROSSO**, e ogni
   affermazione ha il suo FALSO (`_crit-*.js`) costruito nel caso peggiore:
   deve PASSARE tutte le prove tranne la sua. Sette cantieri di fila hanno
   pagato questa lezione in revisione.
3. **Le reti di sicurezza verdi a OGNI compito**: `_q-duello-impronta` 44/44,
   `_q-giudice` 21/21, `_q-sigillo` 14/14, `_q-carta` 22/22, `_q-amici` 23/23,
   `_q-sospetto` 39/39, i quattro del #132 (`_q-ment-nastro` 6/6,
   `_q-carattere-nastro` 4/4, `_q-rosa-scala` 4/4, `_q-nastro-tronco` 5/5),
   `_q-rete` 22/22, `_q-sfida` 54/54, `senza-rete` 6/6, `salvataggio` 11/11.
   Se una si muove di un numero ci si ferma e si riferisce.
4. **Batteria INTERA a ogni compito** (lezione 22), a gruppi con `--solo`:
   `--tutto` chiede più dei dieci minuti che l'attrezzo concede.
5. Commenti nel codice **senza lettere accentate** (e', puo', gia').
6. Codici di uscita: 0 verde, 1 rosso, 2 banco esploso, 3 prova nulla.
7. `MOTORE_V` resta **2** per costruzione: non si tocca né il nastro né la
   simulazione né il gioco.
8. **Nessuna tabella, nessuna colonna, nessun endpoint, nessun `grant`.** Se
   un compito ne volesse uno, ci si ferma: il verificatore differito che apre
   una porta è il contrario di quello che deve fare.
9. **La staffetta non traduce mai un verdetto in un numero.** Passa la parola.
   È il principio delle due porte del #137, e se si rompe qui si rompe
   l'unico controllo che il database ha su chi lo chiama.
10. **Nessuna credenziale nel repo.** Le due variabili d'ambiente sono quelle
    di `rete/lib/comuni.js`, e il cancello controlla che nei file tracciati
    non ci sia una chiave.

## Compito 0 — spec e piano

Questo documento e la spec. Nessun codice di produzione. Una sonda
usa-e-getta in `fuori/`, che non è un cancello.

Misure di partenza, prese prima di toccare qualunque cosa:

- le reti di sicurezza del gruppo A, **verdi**: `rete` 22/22,
  `duello-impronta` 44/44, `giudice` 21/21, `sigillo` 14/14, `sospetto`
  39/39, in 93 s.
- `fuori/_sonda-138-misura.js`, una sfida **vera** giocata a `1024x460`:
  arriva al fischio finale (3-4 in 8 819 passi), il nastro porta `[1024,460]`
  nella riga di tipo 10, giudicata **alla misura giusta** dà `TORNA`,
  giudicata a `915x412` dà `INCOMPLETO / schermo-diverso` e dice «serve
  1024x460». **Mai `NON TORNA`.**
- dalla stessa sonda, i costi che decidono il raggruppamento: **1 165 ms** per
  aprire un contesto e caricare il gioco, **1 039 ms** per un giudizio,
  **938 ms** per un secondo giudizio sulla stessa pagina.
- la **batteria INTERA**, a gruppi, con le tre cose già così prima del
  cantiere e dichiarate adesso per non doverle discutere dopo: `audio`
  **uscita 3** (nessuna scheda audio su questa macchina), `avvio-telefono`
  **uscita 3** (nessun telefono ad adb), `istantanea` informativo. Nessuna
  delle tre dipende da questo cantiere, e nessuna delle tre può cambiare: il
  gioco non si tocca.

Commit `(voce #138, compito 0)`.

## Compito 1 — il banco che condanna, e i falsi

**Test primo:** `strumenti/_q-staffetta.js`, che nasce **ROSSO** perché
`strumenti/staffetta.js` non esiste.

Sei gruppi (il dettaglio è nella spec): **A)** la forma; **B)** il giro
completo su sei sfide finte con quattro verdetti diversi, più il quinto in un
giro a parte; **C)** la misura giusta (una sfida vera giocata a `1024x460`
dentro la corsa); **D)** la ripartenza e l'idempotenza; **E)** il ritmo e i
freni; **F)** le porte e la chiave.

Il banco accetta `--staffetta <file>` per misurare una COPIA del processo: è
così che i falsi si fanno giudicare.

I **sei falsi** si scrivono al compito 1 e si possono provare solo quando la
cura esiste: al compito 1 non c'è niente da guastare, e tutti e sei lo dicono
rifiutandosi di costruirsi (come i sette del #137).

Il compito 1 lascia il banco **rosso**. Reti di sicurezza + batteria intera.
Commit `(voce #138, compito 1)`.

## Compito 2 — la staffetta che fa il giro

`strumenti/staffetta.js`:

- `allargaNastro(stretto)` / `misuraDelNastro(crudo)` — il replay si allarga
  in Node (zlib, RFC 1951) e la misura si legge prima di aprire il browser.
- `raggruppa(righe)` — una chiave per misura, più la chiave `ignota` per i
  nastri senza riga di tipo 10.
- `taccuino(percorso)` — leggi/scrivi/dimentica, con la regola della finestra
  negata.
- `giro({banco, browser, porta, tetto, pausa, taccuino, tettoGiudizio})` — il
  ciclo: pesca, raggruppa, per ogni misura apre UN contesto, giudica ogni riga,
  manda **la parola** a `banco.segna`, scrive il taccuino, rispetta il freno.
- `bancoVero({url, chiave})` — `pesca` (`verificata=eq.0`, `order=giocata.asc`,
  `limit`), `segna` (RPC `segna_verdetto`), `frena` (RPC `frena`). Rifiuta di
  nascere senza credenziali, e non le stampa.
- il lanciatore da riga di comando, con `--tetto`, `--pausa`, `--taccuino`,
  `--riprova`, `--gioco`, `--asciutto` (giudica e non scrive: serve a guardare
  prima di far muovere punti).

I gruppi **A**, **B**, **C**, **E** e **F** diventano verdi; **D** resta rosso
finché il taccuino non ha la regola della ripartenza (compito 3).

Reti di sicurezza + batteria intera. Commit `(voce #138, compito 2)`.

## Compito 3 — ripartenza, freni, batteria, verbale

- la regola della ripartenza nel taccuino: la riga in corso non si scrive, la
  finestra negata non si scrive, il resto sì. Il gruppo **D** diventa verde.
- **i sei falsi si provano**: ognuno dev'essere bocciato dalla sua prova e
  passare le altre. Un falso che passa tutto è un difetto del banco, e si
  ripara prima di andare avanti.
- `_q-staffetta` registrato in `strumenti/tutti.js` con `conta:true` e il suo
  cappello (perché esiste, che cosa nessun altro cancello vede).
- Batteria INTERA a gruppi, referto trascritto.
- `MANUALE.md` §A, voce #138 in cima al registro.
- `PUNTO-DEL-LAVORO.md`, la riga della giornata.
- **Le rettifiche a edizioni**, perché tre file dicono in chiaro che la
  staffetta non esiste: `rete/LEGGIMI.md` (§2 *Replay verificabile*),
  `rete/schema.sql` (il commento della colonna `verificata`) e — se serve —
  il §A del #134. Si corregge accanto, con data e fonte, senza cancellare il
  testo vecchio.

Commit `(voce #138, compito 3)`.

## Quello che fa fermare il cantiere

- **Un falso che accusa su un «non lo so» e passa il banco.** È il difetto più
  grave che questo cantiere possa avere: vuol dire che il cancello non
  protegge nessuno.
- `_crit-staffetta-cieca` che passa: vuol dire che il banco non ha una riga
  registrata a uno schermo diverso da quello di serie, cioè che «apre la
  misura giusta» è un racconto.
- Una riga **persa** fra due giri, o una riga giudicata due volte con effetto
  (un sospetto salito di due per una partita sola).
- Una rete di sicurezza che si muove di un numero.
- Una riga di differenza in `CALCETTO-il-gioco.html`.
- Una tabella, una colonna, un endpoint o un `grant` in più.
- Una chiave di servizio dentro un file tracciato.
