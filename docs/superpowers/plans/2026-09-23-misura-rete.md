# LA MISURA DELLA RETE E DEL TRASPORTO — piano (voce #145)

Spec: `docs/superpowers/specs/2026-09-23-misura-rete-design.md`
Merge-base: `55267d0` · Ramo: `voce-145-misura-rete`

Cinque compiti, un commit ciascuno. **La batteria INTERA a ogni compito**, a
gruppi (`--solo`), perche' `--tutto` chiede piu' dei dieci minuti che lo
strumento concede. Le reti di sicurezza verdi a ogni compito.

**Cantiere di SOLA MISURA**: il gioco non si tocca. `MOTORE_V` resta **4**.

---

## C0 — spec e piano (questo)

- [x] leggere per intero `2026-09-23-onda-e-architettura.md` §1 e §2.8
- [x] leggere il verbale #141 in `MANUALE.md` §A: i numeri di D_gioco e la
      forma a gradino della curva
- [x] **sciogliere il nodo `D_gioco = 0`**: la lettura onesta del gradino, e
      perche' la soglia che decide e' `D_rete <= 18 tick` e non `<= 0`
- [x] **le sei soglie S1..S6 dichiarate e committate PRIMA che un banco giri**
- [x] la derivazione dello stallo (`D >= p99,83`), che nessun documento di
      casa aveva mai scritto
- [x] il limite dichiarato: da dove misuro, che cosa non e' misurabile, che
      cosa cambierebbe il verdetto, quale misura va fatta per prima
- [x] ricognizione di sola **raggiungibilita'** (risponde si/no), nessuna
      misura di latenza prima delle soglie

## C1 — il metro e il banco che nasce ROSSO, coi cinque falsi

- `strumenti/_145-metro-rete.js` — la libreria pura: percentili sulle
  statistiche d'ordine, intervallo di confidenza non parametrico del
  quantile, jitter, perdita con censura a destra, `D_rete`, `D_stallo`,
  `verdetto`. **Nessuna rete dentro**: prende campioni, rende un referto.
- `strumenti/_q-rete-latenza.js` — il cancello. **Offline e deterministico**:
  interroga il metro con campioni sintetici noti e guarda che il metro
  morda. Piu' **la prova che lo fa nascere rosso**: «esiste nel repo una
  misura di rete depositata?» — oggi no.
- i cinque falsi `_crit-rete-*`, ciascuno col morso dichiarato:
  `due-campioni`, `locale`, `potatore`, `mezzo-giro`, `sordo`.
- **atteso**: `_q-rete-latenza` ROSSO sulla prova del deposito, VERDE su
  tutte le prove del metro; `_q-rete-falsi` verde (i cinque falsi tutti
  morsi).

## C2 — la campagna di misura, e i limiti in chiaro

- `strumenti/_145-campagna.js` — tocca la rete vera. Quattro sonde:
  - **A** RTT applicativo verso la nostra infrastruttura Vercel;
  - **B** relay WebSocket (surroga dichiarata di Supabase Realtime), con la
    guardia sul carico echeggiato (un relay che saluta prima di echeggiare
    regala un falso 2 ms);
  - **C** WebRTC: candidati riflessi, tipo di mappatura NAT da **due** STUN
    diversi, apertura vera di un DataChannel;
  - **D** il censimento di Supabase: esiste un progetto sul piano in uso?
- la letteratura sul mobile italiano, **marcata** e con la fonte.
- il referto in `_analisi/MISURA-RETE-145.md`: ogni numero con la sua
  sorgente; i numeri di letteratura mai mescolati con i miei.
- **esce 3** se la rete non c'e'.

## C3 — il verdetto applicato alle soglie, e la rettifica

- il verdetto S1..S6, una riga per soglia, con il numero accanto.
- se NO: quale dei due rami (server autoritativo / 1v1 a duelli) la misura
  favorisce, e perche'.
- `rete/LEGGIMI.md:167-168` rettificato **a edizioni**: testo vecchio in
  piedi, correzione in chiaro con data e fonte.
- il cancello `_q-rete-latenza` **diventa verde**: la misura depositata ora
  esiste, e il cancello la rilegge e la giudica col metro.

## C4 — batteria, registrazione, verbale

- `_q-rete-latenza` e `_q-rete-falsi` registrati in `strumenti/tutti.js` con
  `conta:true` (offline, veloci, deterministici).
- **la batteria INTERA** a gruppi.
- le reti: `_q-motori`, `_q-casa`, `_q-schermi`, `_q-duello-impronta`,
  `_q-giudice`, `_q-sigillo`, `_q-carta`, `_q-amici`, `_q-sospetto`,
  `_q-staffetta`, `_q-finestra`, `_q-glicko`, `_q-motore-nastro`,
  `_q-determinismo`, i quattro del #132, `_q-rete`, `_q-sfida`, `senza-rete`,
  `salvataggio`, `rete/prove/tutte.js`.
- verbale in cima a `MANUALE.md` §A; riga in `PUNTO-DEL-LAVORO.md`.
