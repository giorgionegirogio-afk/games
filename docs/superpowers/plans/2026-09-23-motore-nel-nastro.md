# IL MOTORE NEL NASTRO — voce #142, piano

Spec: `docs/superpowers/specs/2026-09-23-motore-nel-nastro-design.md`
Merge-base: `fc25184` (`main`) · ramo `voce-142-motore-nel-nastro`

Cinque compiti, un commit ciascuno. **La batteria intera a ogni compito**, a
gruppi con `--solo` (`--tutto` chiede ~12 minuti).

## C0 — la spec e il piano

Questo file e la spec. Le soglie sono scritte **prima** dei banchi (§3 della
spec). Le due misure preliminari (la condanna su 8 nastri, l'impronta candidata
sui tre motori) vengono da sonde usa-e-getta in `fuori/`: i banchi veri le
rifanno, e se un numero non si conferma **vince il banco** e la spec si
rettifica a edizioni.

## C1 — la dimostrazione end-to-end del critico, e i quattro falsi

**`strumenti/_q-motore-nastro.js`** — il banco, sulla catena VERA. Non simula
niente: due telefoni, il server finto, una sfida giocata fino al fischio, la
riga che il server ha ricevuto, e il giudizio come lo farebbe la staffetta.

    A) LA CONDANNA      nastri onesti registrati su WebKit, giudicati su
                        Chromium: nessun NON TORNA (nasce ROSSO, oggi 7/8)
    B) LA COPERTURA     gli stessi nastri sullo stesso motore: TORNA
                        (il controllo positivo: se cade, il banco misura se')
    C) LA SEPARAZIONE   l'impronta e' diversa su chromium/webkit/firefox
    D) LA STABILITA'    l'impronta e' identica su piu' contesti dello stesso
                        motore
    E) I VECCHI         un nastro senza riga 11 -> INCOMPLETO, mai un'accusa
    F) LA CAUSA         quando si astiene, la causa e' quella vera
                        (`motore-js-diverso`, non una a caso)

**I quattro mutanti** (`strumenti/_crit-motore-*.js`, ognuno costruisce il suo
gioco bugiardo in `fuori/` con l'attrezzo a ancore) e **`_q-motore-falsi.js`**
che li passa tutti e cinque (i quattro falsi piu' il gioco vero) attraverso il
banco e verifica **quale prova morde quale falso**, non solo che qualcosa sia
rosso.

Al compito C1 il banco e' ROSSO sulla prova A, e deve esserlo: e' il difetto.

## C2 — l'impronta del motore nel nastro

`strumenti/_toppa-142-impronta.js` (attrezzo a ancore, **mai un Edit diretto**):

1. `improntaMotore()` accanto a `MOTORE_V`, con la memoria del valore gia'
   calcolato (si calcola una volta per pagina);
2. `Reg.impronta` e la porta `Reg.motore()`, che scrive la riga 11 una volta
   sola — come `Reg.schermo` e' l'unica a scrivere la 10;
3. il tipo 11 in `Reg.serializza` e in `Reg.deserializza`;
4. la chiamata a `Reg.motore()` accanto a `Reg.schermo(...)` in `Sfida.gioca`;
5. `improntaDelNastro()` accanto a `schermiDelNastro()`;
6. `window.__test.improntaMotore` per i banchi e per la staffetta.

Piu' `improntaDi()` in `strumenti/_nastri-bugiardi.js` (che la legge **in
Node**, non chiedendola al gioco) e `senzaMotore()` per fabbricare il nastro
vecchio.

Verde atteso a C2: **C e D**. A resta rossa (il giudice ancora non guarda).

## C3 — il giudice si astiene

`strumenti/_toppa-142-giudice.js`:

1. i due rifiuti in `vagliaNastro`, **dopo** quelli dello schermo;
2. `impronta` nel referto di `giudica` sulla causa `motore-js-diverso` (serve a
   chi deve riaprire il motore giusto), e **non** su `motore-js-ignoto` (non
   c'e' niente da riaprire — stessa regola del #139 per `schermo-cambiato`);
3. le due cause in chiaro nel cartello di fine replay.

Piu' la misura del prezzo sui nastri vecchi (quanti, e che cosa si e' deciso).

Verde atteso a C3: **tutte e sei**, e i quattro falsi tutti morsi.

## C4 — la staffetta, MOTORE_V, la batteria, il verbale

1. `staffetta.js`: `improntaDelNastro` in Node, raggruppamento per
   **(misura, impronta)**, mappa impronta -> motore costruita all'avvio
   chiedendola ai motori disponibili, apertura del browser giusto, e il grido
   nel referto per le righe che chiedono un motore che non c'e';
2. **`MOTORE_V` misurato** con `strumenti/_t-132-motorev.js --prima
   fuori/gioco-142-base.html`: N nastri registrati sul gioco di prima e
   rigiocati sul curato;
3. `_q-motore-nastro` e `_q-motore-falsi` in `tutti.js` con `conta:true`;
4. la batteria intera, a gruppi;
5. le reti di sicurezza: `_q-duello-impronta` 44/44, `_q-giudice` 21/21,
   `_q-sigillo` 14/14, `_q-carta` 22/22, `_q-amici` 23/23, `_q-sospetto` 39/39,
   `_q-staffetta` 42/42, `_q-finestra` 20/20, `_q-glicko` 58/58,
   `_q-determinismo` 11/11, `_q-rete`, `_q-sfida`, `senza-rete`, `salvataggio`,
   `rete/prove/tutte.js` 46/46;
6. il verbale in `MANUALE.md` §A in cima e la riga nel `PUNTO-DEL-LAVORO.md`.

## LE TRAPPOLE GIA' PAGATE CHE VALGONO QUI

- **Il banco deve essere lo stesso banco** (#141, prima corsa di `_q-motori`):
  le opzioni di contesto identiche per tutti i motori, senza eccezioni. Un
  `isMobile` acceso per uno solo porta un DPR diverso, e un DPR diverso cuoce
  tele diverse: si misurerebbe il contesto e lo si chiamerebbe motore.
  Firefox non accetta `isMobile`, quindi **nessuno** lo riceve.
- **Ordine sacro** (#107/#108): `startMatch` prima, `setCpuVsCpu` dopo.
- **Il service worker ignora la query string**: se un banco non riflette una
  modifica appena fatta, prima cosa `unregister()` e `caches.delete()`.
- **Un nastro non si taglia, si trasforma** (`_nastri-bugiardi.js`): togliere un
  pezzo sposta il tick e i millisecondi di tutti quelli dopo, e il falso
  sarebbe falso per due ragioni.
