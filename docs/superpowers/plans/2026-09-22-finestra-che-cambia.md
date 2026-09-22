# La finestra che cambia — piano (voce #139)

Progetto: `docs/superpowers/specs/2026-09-22-finestra-che-cambia-design.md`.
Base: `main` = `1d5b946`. Ramo: `voce-139-finestra-che-cambia`.
**Un CRITICO dell'onda D: un giocatore onesto può essere accusato.**

Cantiere **del gioco**: si tocca `CALCETTO-il-gioco.html` (sei ancore, tutte
via `strumenti/_toppa-139-finestra.js`), `strumenti/` (il banco, i falsi, la
registrazione) e i documenti. **`rete/` cambia solo commenti** (una rettifica a
edizioni che il #138 ha dimenticato). Quattro compiti (0..3), un commit
ciascuno.

## Vincoli globali

1. **Il gioco si tocca SOLO via attrezzo a ancore** (`_toppa-*.js`: cerca /
   metti, `--out` per la prova e `--dentro` per l'applicazione, specchio byte
   per byte). Mai un `Edit` diretto sul file da 2,5 MB, mai una lettura
   intera: Grep per trovare, Read con offset/limit per leggere.
2. **Prima la condanna, poi la cura.** Il banco `_q-finestra.js` nasce ROSSO
   sul difetto vero, misurato su una partita vera, e diventa verde con la
   cura. Ogni affermazione del banco ha il suo FALSO (`_crit-finestra-*.js`)
   costruito nel **caso peggiore**: deve passare tutte le prove tranne la sua.
   Otto cantieri di fila hanno pagato questa lezione in revisione.
3. **Le reti di sicurezza verdi a OGNI compito**: `_q-duello-impronta` 44/44,
   `_q-giudice` 21/21, `_q-sigillo` 14/14, `_q-carta` 22/22, `_q-amici` 23/23,
   `_q-sospetto` 39/39, `_q-staffetta` 42/42, i quattro del #132
   (`_q-ment-nastro` 6/6, `_q-carattere-nastro` 4/4, `_q-rosa-scala` 4/4,
   `_q-nastro-tronco` 5/5), `_q-rete` 22/22, `_q-sfida` 54/54, `senza-rete`
   6/6, `salvataggio` 11/11, `_q-determinismo` 10/10 a 5 **e** a 11. Se una si
   muove di un numero ci si ferma e si riferisce.
4. **Batteria INTERA a ogni compito** (lezione 22), a gruppi con `--solo`:
   `--tutto` chiede più dei dieci minuti che l'attrezzo concede.
5. Commenti nel codice **senza lettere accentate** (e', puo', gia').
6. Codici di uscita: 0 verde, 1 gioco rosso, 2 banco esploso, 3 prova nulla.
   Un 2 o un 3 **non accusano il gioco**.
7. **`MOTORE_V` si decide con una misura, non con un'opinione.** Aggiungere
   righe al nastro non lo cambia di per sé (`Reg.esegui` non ha un ramo per il
   tipo 10), ma la prova che conta è un'altra: **i nastri VECCHI devono
   restare giudicabili come oggi**. Se diventassero tutti `INCOMPLETO` la cura
   sarebbe una regressione peggiore del difetto, e ci si ferma.
8. **La cura non cambia il gioco a chi gioca.** Nessun fermo, nessuna
   schermata, nessun `G.rotateHold`: solo due numeri nel nastro. Se un compito
   volesse fermare la partita, ci si ferma e si riferisce.
9. **Astensione, mai accusa.** Il verdetto nuovo è una CAUSA di `INCOMPLETO`,
   non un sesto verdetto, e non deve poter diventare `NON TORNA` per nessuna
   strada. I cinque verdetti restano cinque.

## Compito 0 — spec e piano

Questo documento e la spec. Nessun codice di produzione. Una sonda
usa-e-getta in `fuori/`, che non è un cancello.

Misure di partenza, prese prima di toccare qualunque cosa:

- `fuori/_sonda-139-finestra.js`, due bracci, stesso seme e stesso copione di
  dita: **FERMA** dichiara 3-4, riga 10 `915x412`, giudicata a `915x412` dà
  `TORNA` (3-4 in 8819 passi); **CAMBIA** (915x412 → 915x352 al fotogramma
  1200) dichiara 1-2, riga 10 `915x412` — **la misura di partenza** — e
  giudicata a `915x412` dà **`NON TORNA`** (3-4 in 8631 passi). `SCALE`
  0,7067 → 0,6017, `OX` 51 → 112.
- lo stesso banco con **12 px** (412 → 400): la partita non si muove di un
  passo (3-4 in 8819, nastro identico) e il verdetto resta `TORNA`. È il
  confine misurato dal #133, ed è quel che la cura costa.
- le reti di sicurezza, **verdi**, prima di toccare qualunque cosa: 14
  cancelli in 180 s — `senza-rete` 6/6, `salvataggio` 11/11, `rete` 22/22,
  `sfida` 54/54, `duello-impronta` 44/44, `ment-nastro` 6/6,
  `carattere-nastro` 4/4, `rosa-scala` 4/4, `nastro-tronco` 5/5, `giudice`
  21/21, `sigillo` 14/14, `carta` 22/22, `amici` 23/23, `sospetto` 39/39 —
  più `staffetta` 42/42 e `determinismo` 10/10 a 5 e a 11.
- la **batteria INTERA**, a gruppi, con le tre cose già così prima del
  cantiere e dichiarate adesso per non doverle discutere dopo: `audio`
  **uscita 3** (nessuna scheda audio su questa macchina), `avvio-telefono`
  **uscita 3** (nessun telefono ad adb), `istantanea` informativo.

## Compito 1 — il banco che nasce ROSSO, e i suoi falsi

`strumenti/_q-finestra.js`, **tre bracci giocati** più uno di raffica:

    FERMA    915x412 per tutta la partita
    CAMBIA   915x412 -> 915x352 al fotogramma 1200
    TORNA    915x412 -> 915x352 al 1200 -> 915x412 al 3000
    RAFFICA  la misura scende a gradini, e a ogni gradino il resize
             viene rilanciato piu' volte con RESIZE_FORZA acceso
             (e' quel che fa setTaglia): una partita corta, non giudicata

Tutti e quattro con lo **stesso seme** e lo **stesso copione di dita**: i
dischi si calcolano una volta sola alla misura di partenza, così fra i bracci
cambia la finestra e **non** il copione. Il server finto dà il seme con un
contatore, che si azzera fra un braccio e l'altro.

Le prove, in quattro gruppi (A scrive, B giudica, C non regredisce, D forma).
Attese **prima** della cura: A e B rossi, C verdi (sono le parole di sempre),
D parzialmente rosso.

I cinque falsi della tavola nella spec. Prima del compito 2 **non si
applicano**, e lo dicono: le ancore non esistono ancora.

Reti di sicurezza + batteria intera.

## Compito 2 — la cura

`strumenti/_toppa-139-finestra.js`, sei ancore:

    1. Reg: il campo `ultimoSchermo` e la porta `schermo(w, h)`
    2. Reg.accendi: l'azzeramento della memoria della misura
    3. resize(): la chiamata, dopo il ricalcolo di VW/VH
    4. Sfida.gioca: Reg.scrivi(10, ...) -> Reg.schermo(...)
    5. schermiDelNastro() + schermoDelNastro() riscritta su di lei
    6. vagliaNastro: il rifiuto schermo-cambiato, PRIMA di schermo-diverso
       (+ il sigillo che porta la lista delle misure, causaSigillo e
       chiudiSfida, perche' la frase che l'occhio legge deve dire la causa
       vera invece di dare la colpa alla rosa)

Si prova prima con `--out fuori/curato.html` e `--gioco`, si applica con
`--dentro` solo quando il banco è verde.

Poi, nell'ordine: `_q-finestra` verde; i cinque falsi costruiti e **bocciati**,
ognuno sulla prova dichiarata; le reti di sicurezza; la batteria intera.

**La prova che i nastri vecchi reggono** è dentro il gruppo C e si guarda per
prima: la fixture congelata `_nastro-duello-congelato.js` deve dare `TORNA`
con **gli stessi gol e gli stessi passi** di prima della cura. Se cambia un
numero, ci si ferma.

## Compito 3 — la misura di MOTORE_V, i documenti, la batteria, il verbale

1. **`MOTORE_V`**: N nastri registrati sul gioco **vecchio** (`git show
   main:CALCETTO-il-gioco.html`, servito da `--gioco`) e giudicati sul gioco
   **nuovo**. Stessi verdetti, stessi gol, stessi passi ⇒ resta **2**. Se no,
   sale, e i nastri vecchi vengono rifiutati con causa vera.
2. `_q-finestra` in `tutti.js` con `conta:true`, con la sua lettera di
   presentazione (che cosa misura, che cosa non misura, come sa fallire).
3. Le tre rettifiche documentali della spec (§ finale), **a edizioni**: in
   chiaro, con la data del 22 settembre 2026 e la fonte accanto, senza
   cancellare il testo vecchio.
4. La batteria **intera**, a gruppi.
5. Verbale in `MANUALE.md` §A **in cima**, e una riga in
   `PUNTO-DEL-LAVORO.md`.

## Quando ci si ferma

- se la cura fa diventare `INCOMPLETO` i nastri vecchi;
- se una rete di sicurezza si muove di un numero e non torna;
- se `MOTORE_V` dovesse salire (si riferisce prima di decidere, perché
  rifiutare tutti i nastri in circolazione è una scelta del committente);
- se la cura chiedesse di fermare la partita a chi gioca.
