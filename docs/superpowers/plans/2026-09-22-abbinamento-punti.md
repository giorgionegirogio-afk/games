# L'abbinamento per punti e il sospetto — piano (voce #137)

Progetto: `docs/superpowers/specs/2026-09-22-abbinamento-punti-design.md`.
Base: `main` = `8a9b33d`. Ramo: `voce-137-abbinamento-punti`. **Ultimo
cantiere dell'onda D.**

Cantiere di **SERVER**: si tocca `rete/` (che si edita normalmente) e
`strumenti/` (i banchi). **`CALCETTO-il-gioco.html` non si tocca**, e la
misura che lo dice e' `git diff main -- CALCETTO-il-gioco.html` vuoto a
ogni compito. Quattro compiti (0..3), un commit ciascuno.

## Vincoli globali

1. **Il gioco non si tocca.** Se un compito finisse per volerlo, ci si
   ferma e si riferisce: vorrebbe dire che il sospetto si e' messo a
   vedersi, e non deve vedersi.
2. **Ogni funzione nuova ha prima un TEST che nasce ROSSO**, e ogni
   affermazione ha il suo FALSO (`_crit-*.js`) costruito nel caso
   peggiore: deve PASSARE tutte le prove tranne la sua. Sei cantieri di
   fila hanno pagato questa lezione in revisione.
3. **Le reti di sicurezza verdi a OGNI compito**: `_q-duello-impronta`
   44/44, `_q-giudice` 21/21, `_q-sigillo` 14/14, `_q-carta` 22/22,
   `_q-amici` 23/23, `_q-ment-nastro` 6/6, `_q-carattere-nastro` 4/4,
   `_q-rosa-scala` 4/4, `_q-nastro-tronco` 5/5, `_q-rete` 22/22,
   `_q-sfida` 54/54, `senza-rete` 6/6, `salvataggio` 11/11,
   `rete/prove/tutte.js` 40/40, `rete/prove/economia.js` 86/86. Se una si
   muove di un numero ci si ferma e si riferisce.
4. **Batteria INTERA a ogni compito** (lezione 22), a gruppi con
   `--solo`: `--tutto` chiede piu' dei dieci minuti che l'attrezzo
   concede.
5. Commenti senza lettere accentate (i file di `rete/` gia' scritti ne
   hanno: li' si segue il file, non si riscrive).
6. Codici di uscita: 0 verde, 1 rosso, 2 banco esploso, 3 prova nulla.
7. `MOTORE_V` resta **2** per costruzione (non si tocca il nastro ne' la
   simulazione ne' il gioco).
8. **Nessuna tabella nuova.** Se un compito ne volesse una, ci si ferma:
   una tabella senza `enable row level security` + `revoke` sarebbe
   l'unica porta aperta del database.
9. **Nessun endpoint nuovo.** Un endpoint nuovo senza freno e' il modo
   classico di svuotare il piano gratuito in una notte; un endpoint che
   accetta verdetti e' il modo classico di far togliere i punti a un
   avversario.
10. **Il divieto di questo cantiere**: il sospetto non esce dal database.
    Non in una risposta, non nella classifica, non in un campo `undefined`
    dimenticato. Il server nasconde apposta l'identita' degli altri
    (`attaccante: undefined`, `rete/api/sfida.js:101`) e questa e' la
    stessa regola.

## Compito 0 — spec e piano

Questo documento e la spec. Nessun codice. Una sonda usa-e-getta in
`fuori/`, che non e' un cancello.

Misure di partenza, prese prima di toccare qualunque cosa:

- le reti di sicurezza, **tutte verdi** (i numeri del vincolo 3,
  verificati: gruppo 1 in 142 s, gruppo 2 in 45 s).
- `fuori/_sonda-137-abbinamento.js`, 5000 ricerche simulate su tre
  popolazioni. Oggi (solo forza): mediana **188**, «entro 150 punti»
  **41%**, «oltre 500» **7%** su 400 allenatori. Con la dimensione
  punti: mediana **60**, entro 150 **100%**, oltre 500 **0%**, e
  **zero** ricerche in piu' senza avversario. Prezzo: 1,42 chiamate al
  database per ricerca invece di 1,00, e solo sulla base da dodici.
- la stessa sonda, sulla dispersione: dentro `forza 75 ±8` ci stanno 203
  allenatori con punti da 402 a 1486 (**forbice 1084**). E' il numero
  che dice perche' il cantiere esiste.
- la stessa sonda, sui sospetti al 3% della base: un onesto ne incontra
  uno **3,93%** delle volte oggi, **0,00%** con la separazione accesa.
- la **batteria INTERA**, a cinque gruppi, sul file `3c3d0e33bd98`:
  12 + 12 + 11 + 9 + 4 + 7 + 1 cancelli, tutti verdi tranne le tre cose
  che erano gia' cosi' prima del cantiere e che vanno dichiarate adesso
  per non doverle discutere dopo:
  `audio` **uscita 3** (nessuna scheda audio in questa macchina),
  `avvio-telefono` **uscita 3** (nessun telefono collegato ad adb),
  `istantanea` informativo **45/56 · 1/8 8/8 8/8 7/8 8/8 7/8 6/8**
  contro un riferimento del 20 agosto che era a sua volta una prova
  nulla. Nessuna delle tre dipende da questo cantiere, e nessuna delle
  tre puo' cambiare: **il gioco non si tocca**.

Commit `(voce #137, compito 0)`.

## Compito 1 — il banco che condanna, e i falsi

**Test primo:** `strumenti/_q-sospetto.js`, che nasce ROSSO perche'
`rete/lib/abbinamento.js` e `rete/lib/verdetto.js` non esistono.

Quattro gruppi (il dettaglio e' nella spec): **A)** la tavola dei cinque
verdetti e il ripiego all'innocenza; **B)** il sospetto in un database
finto in memoria, coi punti che tornano indietro, il doppio conteggio
che non succede e l'invariante `sospetto == righe a −1`; **C)**
l'abbinamento misurato su 5000 ricerche, prima e dopo, piu' la varieta';
**D)** le porte chiuse (RLS, `revoke`, freni, il sospetto che non esce).

Il banco accetta `--lib <cartella>` per caricare i due moduli da un'altra
parte: e' cosi' che i falsi si provano, e `--gioco` lo ignora (non apre
niente).

I **sette falsi** si scrivono al compito 1 ma si possono provare solo al
compito 3, quando la cura esiste: al compito 1 non c'e' niente da
guastare. Il compito 1 lascia il banco **rosso su tutti e quattro i
gruppi**.

Reti di sicurezza + batteria intera (il gioco non e' stato toccato: e'
la misura che dice che il banco nuovo non disturba nessuno).
Commit `(voce #137, compito 1)`.

## Compito 2 — l'abbinamento per punti

- `rete/lib/abbinamento.js`: `SCALA` (quattro gradini a due coordinate),
  `SOSPETTO_SEPARA = 3`, `ammissibile(io, c, gradino)`,
  `cerca(io, elenco, dado)` (l'implementazione di riferimento che il
  banco misura), `distanza(io, c)`.
- `rete/schema.sql`: `drop function if exists trova_avversario(uuid, int)`
  **prima**, poi `trova_avversario(io, banda, banda_punti, separa)` con
  il predicato sui punti (`banda_punti is null` = nessun limite) e la
  separazione dei sospetti. `revoke` aggiornato alla firma nuova.
- `rete/api/avversario.js`: il ciclo legge `SCALA` invece dei tre numeri
  a mano, manda le due bande e la soglia, e **ricontrolla con
  `ammissibile`** il candidato che torna (il ricontrollo non puo'
  affamare nessuno: l'ultimo gradino e' sempre ammissibile).

I gruppi **C** e **D** di `_q-sospetto` diventano verdi; **A** e **B**
restano rossi.

Reti di sicurezza + batteria intera. Commit `(voce #137, compito 2)`.

## Compito 3 — il sospetto, i falsi, la batteria, il verbale

- `rete/lib/verdetto.js`: `VERDETTI`, `conseguenza(verdetto)` con il
  ripiego all'innocenza, e `disfacimento(sfida)` (di quanto scendono i
  contatori) — la tavola in un posto solo.
- `rete/schema.sql`: `segna_verdetto(s_id bigint, verdetto text)`, la
  guardia `verificata = 0`, il disfacimento dei punti per tutti e due, il
  `sospetto + 1` sull'attaccante, e il `revoke`. La `serie` non si disfa,
  e il perche' sta scritto accanto.
- i gruppi **A** e **B** diventano verdi: il banco e' verde su tutti e
  quattro.
- **i sette falsi si provano**: ognuno dev'essere bocciato dalla sua
  prova e passare le altre. Un falso che passa tutto e' un difetto del
  banco, e si ripara prima di andare avanti.
- `_q-sospetto` registrato in `strumenti/tutti.js` con `conta:true` e il
  suo cappello (perche' esiste, che cosa nessun altro cancello vede).
- Batteria INTERA a gruppi, referto trascritto.
- `MANUALE.md` §A, voce #137 in cima al registro.
- `PUNTO-DEL-LAVORO.md`, la riga della giornata.
- La rettifica a edizioni sul commento di `rete/schema.sql:98-111` (la
  colonna `verificata`): adesso chi la muove esiste, e si chiama
  `segna_verdetto`.

Commit `(voce #137, compito 3)`.

## Quello che fa fermare il cantiere

- Una rete di sicurezza che si muove di un numero.
- **Un falso che segna sospetto su un «non lo so» e passa il banco.** E'
  il difetto piu' grave che questo cantiere possa avere: vuol dire che il
  cancello non protegge nessuno.
- `_crit-abbinamento-largo` che passa: vuol dire che il banco ha
  collaudato il codice invece del comportamento — la dimensione c'e' ma
  non filtra, e nessuno se ne accorge.
- Una misura che dica che la finestra nuova lascia qualcuno **senza
  avversario** dove prima ne aveva uno: l'ultimo gradino e' quello di
  oggi, e se quel numero non e' zero c'e' un errore nella scala.
- L'invariante rotta: se `sospetto` smette di essere il conto delle righe
  a −1, non e' piu' riproducibile, e un'accusa non riproducibile non si
  scrive.
- Una tabella nuova, un endpoint nuovo, o un `select` che porta fuori il
  sospetto.
- Una riga di differenza in `CALCETTO-il-gioco.html`.
