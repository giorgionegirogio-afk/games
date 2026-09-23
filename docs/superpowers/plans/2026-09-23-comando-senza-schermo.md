# IL COMANDO SENZA SCHERMO — piano (voce #144)

Spec: `docs/superpowers/specs/2026-09-23-comando-senza-schermo-design.md`
Merge-base: `c71a83e` · Ramo: `voce-144-comando-senza-schermo`

Cinque compiti, un commit ciascuno. **La batteria INTERA a ogni compito**, a
gruppi (`--solo`), perche' `--tutto` chiede ~12 minuti e lo strumento uccide a
10. Le reti di sicurezza verdi a ogni compito.

---

## C0 — spec e piano (questo)

- [x] leggere per intero `2026-09-23-onda-e-architettura.md`, §3.1 compresa
- [x] **riverificare le ancore** sul merge-base invece di fidarsi dei numeri
      di riga del censimento (che venivano da una versione precedente)
- [x] **riverificare da solo** la sola affermazione che il censimento aveva
      marcato «LETTO, non riverificato»: zero letture dello schermo nella
      simulazione
- [x] il formato dell'atto: campi, bit, normalizzazione, e i due tipi nuovi
- [x] decidere in anticipo che cosa si fa delle tre astensioni dello schermo

## C1 — il banco che condanna (nasce ROSSO)

- `strumenti/_q-schermi.js`: un nastro onesto, sei bracci (quattro schermi,
  uno di pollice, uno di tacca), e **due misure per braccio** — il verdetto e
  il punteggio rigiocato con l'astensione aggirata.
- `strumenti/_nastri-bugiardi.js`: aggiungere `conSchermo(nastro, misura)`,
  gemello di `conMotore` e per la stessa ragione (il controllo di esercizio:
  senza, il banco misurerebbe solo la propria astensione).
- i quattro falsi (`_crit-schermi.js` impianto + `pixel`, `mezza`,
  `ricalcola`, `grana`). Prima di C2 **non si applicano**, e lo dicono: le
  ancore non esistono ancora.
- **atteso**: `_q-schermi` ROSSO, con i verdetti e i punteggi divergenti
  stampati.

## C2 — l'atto risolto

- `strumenti/_toppa-144-atto.js`, a ancore, e mai un Edit diretto:
  1. `Touch5.risolvi(x,y)` — la risoluzione, estratta dal corpo di `start`
  2. `Touch5.applica(id,a,x,y)` — l'applicazione, estratta dallo stesso corpo
  3. `Touch5.avvia(id,a,x,y)` e `start` che diventa due righe
  4. `Touch5.puntoDi(a)` — il punto locale che realizza l'atto
  5. `Reg`: `origine`, `squadraDi`, `scriviAtto`, `scriviMossa`, i rami 12 e
     13 di `esegui`, `serializza`, `deserializza`
  6. le quattro porte: il tipo 0 diventa 12, il tipo 1 diventa 13
  7. `Touch5.teamOf` avvolto dall'esterno: in rilettura **non ricalcola**
- **atteso**: `_q-schermi` VERDE sui quattro bracci di schermo; i quattro
  falsi bocciati con la bite list misurata.

## C3 — i canali gemelli, la squadra, `MOTORE_V`

- i bracci POLLICE e TACCA verdi (sono gia' nel banco dal C1: qui si misura
  che la cura li chiude, e il falso `mezza` che non li chiude viene bocciato)
- la squadra nel comando: il braccio in modalita' 2, e il falso `ricalcola`
- `strumenti/_t-144-motorev.js`: **la misura a due versioni**, nei due versi
  (vecchi sul curato, nuovi sul vecchio). `MOTORE_V` si decide col numero.
- se `MOTORE_V` sale: `strumenti/_toppa-144-motorev.js` e il prezzo dichiarato

## C4 — le astensioni, la staffetta, il verbale

- `vagliaNastro`: le tre astensioni dello schermo condizionate alla presenza
  di un PIXEL nel nastro (tipo 0 o tipo 1)
- `strumenti/staffetta.js`: il raggruppamento per misura si semplifica — un
  nastro senza pixel non chiede nessuna finestra
- `_q-schermi` registrato in `strumenti/tutti.js` con `conta:true`
- la batteria INTERA, a gruppi
- verbale in `MANUALE.md` §A, in cima; riga in `PUNTO-DEL-LAVORO.md`

---

## LE RETI DI SICUREZZA, A OGNI COMPITO

`_q-duello-impronta` 44/44 · `_q-motori` 21/21 · `_q-casa` 18/18 ·
`_q-perimetro` 5/5 · `_q-giudice` 21/21 · `_q-sigillo` · `_q-carta` ·
`_q-amici` · `_q-sospetto` · `_q-staffetta` · `_q-finestra` · `_q-glicko` ·
`_q-motore-nastro` · `_q-determinismo` · i quattro del #132 · `_q-rete` ·
`_q-sfida` · `senza-rete` · `salvataggio` · `rete/prove/tutte.js`

E i cancelli che questo cantiere tocca da vicino, che vanno rilanciati anche
se il piano non li nomina: `_q-precedenza`, `_q-dischi`, `_q-pollice`,
`_q-riarmo`, `_q-scatta`, `_q-l11`..`_q-l16`, `_q-replay`, `_q-cmd2`,
`_q-ritardo`, `_q-verbi-ritardo`.

## LE TRAPPOLE GIA' PAGATE CHE QUESTO CANTIERE RIAPRE

- il service worker **ignora la query string**: se un banco non riflette una
  modifica appena fatta, `unregister()` e `caches.delete()` per primi;
- `startMatch` PRIMA, `setCpuVsCpu` DOPO (`_q-cpu-ordine` fa la guardia);
- un banco che teletrasporta il pallone deve azzerare lo stato derivato;
- prima di chiamare «regressione» un rosso, misurarlo sull'ultimo commit
  (`--gioco` sulla copia di `main` in `fuori/`).
