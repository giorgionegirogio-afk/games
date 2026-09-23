# IL METRO DEL RITARDO — voce #141, piano dei compiti

**Ramo `voce-141-metro-ritardo`, merge-base `main` = `2e728d6`, 23 settembre 2026.**
Spec: `docs/superpowers/specs/2026-09-23-metro-ritardo-design.md`.
Progetto d'onda: `docs/superpowers/specs/2026-09-23-onda-e-architettura.md`.

Sei compiti, un commit ciascuno. **La batteria intera si rilancia a ogni
compito**, a gruppi con `--solo` (il tempo pieno sfora il tetto di dieci
minuti dello strumento). Messaggi narrativi in italiano, chiusi da
`(voce #141, compito N)`.

---

## C0 — LE SOGLIE, PRIMA DI MISURARE

Prodotto:
- `docs/superpowers/specs/2026-09-23-metro-ritardo-design.md` (questa spec,
  con le **sei soglie dichiarate**);
- `docs/superpowers/plans/2026-09-23-metro-ritardo.md` (questo piano);
- **il progetto d'architettura dell'onda E** (`2026-09-23-onda-e-architettura.md`,
  oggi untracked) entra nello stesso commit.

Cancello: nessuna misura. Il commit deve precedere il primo banco, o le
soglie diventano opinioni.

---

## C1 — LA GAMBA D, PER PRIMA (Chromium contro WebKit)

**Puo' annullare l'intera onda: si fa prima di tutto.**

Prodotto: `strumenti/_q-motori.js`.
- stesso seme, stesso copione, stessa taglia, **due motori diversi**:
  `chromium.launch()` e `webkit.launch()` di Playwright;
- confronto dell'**impronta** (la stessa di `_q-determinismo`: pallone,
  giocatori, punteggio, stati) su **tre semi**;
- prima di accusare i motori, il banco verifica che **dentro** ciascun motore
  la partita sia ripetibile: se non lo e', il rosso e' del banco (uscita 2) e
  non dei motori.

Cancello: **impronte identiche**. Se differiscono:
1. si isola **dove** (il primo campione di scarto, e se possibile la funzione:
   `Math.hypot` a `:8710`, `Math.pow` in `updateBall` a `:19685`);
2. **CI SI FERMA e si riferisce al committente.** L'onda E cambia forma.

Rete di sicurezza + batteria a gruppi.

---

## C2 — LA GAMBA A (il metro deterministico, nastro traslato)

Prodotto: `strumenti/_q-ritardo.js`.
- registra **≥ 20 nastri onesti** a taglia 5 col copione fisso di
  `_q-sfida.js` (nessun sorteggio: confrontabili per costruzione);
- rigioca ciascuno traslando **+K tick ogni comando**, K ∈ {0,3,6,9,12,15,18};
- misura per ogni K: gol comandato, gol subiti, tiri, **tiri nello specchio**,
  possesso, rubate, e la **fedelta'** di §3.2 della spec;
- **dispersione dichiarata** su ogni numero (mediana e scarto), o il numero non
  si trascrive.

**Nasce rosso due volte:**
- **K=0 riproduce il nastro esatto** (punteggio e impronta): se no, banco rotto
  → uscita **2**;
- **K=18 mostra danno**: se no, il banco attesta → uscita **3**.

In testa al banco, la **dichiarazione del caso peggiore**: e' un limite
SUPERIORE al danno, non l'esperienza umana.

Rete di sicurezza + batteria a gruppi.

---

## C3 — LA GAMBA B (i verbi sotto ritardo) + i due agganci

Prodotto:
- `strumenti/_toppa-141-ritardo.js` — attrezzo a ancore che aggiunge al gioco
  **`__test.ritardo(K)`** (coda di K tick davanti alle quattro porte, avvolta
  dall'esterno dell'avvolgimento esistente, orologio proprio) e
  **`__test.dita(dx,dy,premi)`** (iniezione che passa dalle porte vere);
- `strumenti/_q-verbi-ritardo.js` — l'impianto di `strumenti/giocata.js`
  (gesti touch di protocollo via CDP) con il ritardo acceso; ripassa TIRA con
  la carica, FILTRANTE, CAMBIO, CONTRASTA, cross.

Cancelli:
- i cinque verbi riescono ≥ 95% alla D scelta;
- **la carica cade nella finestra dolce 0,50–0,80 s ≥ 90%** — e' il punto
  fragile: la finestra e' tenuta dal dito, e un ritardo che sposta il rilascio
  sposta la carica;
- **banco a tempo reale ⇒ `--ripetuto 3`**, un solo rosso non e' una prova.

**`MOTORE_V` si MISURA**, non si afferma: deve restare 2.

Rete di sicurezza + batteria a gruppi.

---

## C4 — I FALSI, E LA GAMBA C PREPARATA

Prodotto:
- `strumenti/_crit-traslazione-sorda.js` — la traslazione non trasla davvero
  (nel caso peggiore: trasla i metadati e il tick delle righe di duello);
- `strumenti/_crit-traslazione-cieca.js` — trasla solo i `touchmove`;
- `strumenti/_crit-ritardo-attestatore.js` — zero danno a 300 ms;
- `strumenti/_q-ritardo-falsi.js` — il banco dei falsi: costruisce i tre
  mutanti e **dimostra che `_q-ritardo` li boccia** (bite list misurata, non
  affermata);
- `strumenti/_prova-umana-ritardo.js` — lo strumento della gamba C: pesca K in
  cieco, apre il gioco col ritardo acceso, raccoglie i due voti per partita e
  li scrive in un verbale;
- `docs/superpowers/plans/2026-09-23-protocollo-prova-umana.md` — il
  **PROTOCOLLO** della prova in cieco.

Cancello: ogni falso **deve** far uscire rosso `_q-ritardo`, e il banco deve
dire **quale** prova lo morde.

**La gamba C si DICHIARA NON ESEGUITA, in attesa del committente**, con
scritto che cosa cambierebbe nel verdetto se l'uomo dicesse no.

Rete di sicurezza + batteria a gruppi.

---

## C5 — IL VERDETTO

Prodotto:
- le soglie di C0 **applicate ai numeri veri**, e il verdetto che esce — non
  quello che si vorrebbe;
- `_q-ritardo` **registrato in `strumenti/tutti.js` con `conta:true`** (e
  `_q-motori`, se il suo costo lo consente; se no, con `lento:true`);
- **batteria intera** a gruppi;
- verbale in **`MANUALE.md` §A, in cima**;
- le **due rettifiche a edizioni** (`_q-determinismo` prova C,
  `_q-invarianti:425-431` INV-13/INV-14);
- riga nel **`PUNTO-DEL-LAVORO.md`**.

**Se la misura dice NO, lo dice chiaramente.** E' un esito legittimo, e il
committente ha chiesto esplicitamente che possa uscire.
