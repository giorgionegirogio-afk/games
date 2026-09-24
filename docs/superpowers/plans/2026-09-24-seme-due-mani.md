# IL SEME A DUE MANI — piano (voce #150)

**24 settembre 2026.** Merge-base `ffc4139`, ramo `voce-150-seme-a-due-mani`.
Spec: `docs/superpowers/specs/2026-09-24-seme-due-mani-design.md`.

Cinque compiti, un commit ciascuno. **La batteria INTERA si rilancia a ogni
compito** (lezione 22: cinque regressioni trovate solo così), a gruppi con
`--solo`, perché `--tutto` chiede ~1600 s e lo strumento muore a 10 minuti.

---

## C0 — spec e piano

Questo documento e la spec. Nessun codice.

**Rete di sicurezza:** nessuna (non si è toccato niente).

---

## C1 — il banco che condanna (nasce ROSSO)

1. `_q-dischetto-seme.js` riscritto: sei prove (S1..S6), n = 400 per braccio,
   soglia 224/400 dichiarata nell'intestazione insieme alla potenza.
2. Tre falsi del gioco nuovi:
   - `_crit-dischetto-sbrigativo.js` — **la mezza cura**: impegna il nonce ma
     rivela senza aspettare l'impegno dell'altro;
   - `_crit-dischetto-credone.js` — non verifica che la rivelazione del nonce
     ricomponga l'impegno del saluto;
   - `_crit-dischetto-vecchio.js` — accetta una serie di versione vecchia senza
     dirlo.
3. `PariFinto` guadagna le tre bugie nuove (`semerivelato`, `semepaziente`) e
   `saluta()` impara il protocollo a due tempi — **in modo compatibile con v1
   finché il gioco è v1**, così il banco nasce rosso sul gioco vero e non su sé
   stesso.

**Atteso a fine C1:** `dischetto-seme` ROSSO su S1 (il baro vince 400/400),
verde su S2/S6, e le prove S3/S4/S5 rosse o dichiarate non esercitabili sul
protocollo v1.

**Rete di sicurezza:** `dischetto` 29/29, `dischetto-falsi`, `sha256`,
`rete/prove/tutte.js` 62/62 — nessuno di questi tocca il gioco in C1, ma si
rilanciano lo stesso.

---

## C2 — l'impegno sul saluto

Via `strumenti/_toppa-seme-due-mani.js` (attrezzo a ancore, **mai Edit diretto**
sul gioco da 2,8 MB).

1. `dsImpegnoSaluto(lato, nonce)` accanto a `dsImpegno`, stessa `dsSha256`.
2. `mioSaluto()` manda `hn` invece di `n`; il nonce resta in `S.mioNonce`.
3. Stato: `suoNonce`, `mandatoN`; fase nuova `attesa-nonce`.
4. `leggi()`: `S` verifica `v`/`mv` e porta in `attesa-nonce`; `N` posa il nonce.
5. `manda()`: **la riga che vale il cantiere** — la `N` parte solo se
   `S.suoSaluto` è in casa.
6. `chiudiAppuntamento()` si divide: `leggiSaluto()` (versione, motore, rosa) e
   `chiudiAppuntamento()` (l'impegno ricompone? seme, primo, `avvia()`).
7. `trattiene()` include `attesa-nonce`.
8. La cassetta finta, `rete/api/dischetto.js` e `rete/prove/tutte.js` imparano il
   quinto tipo di busta `N`.

**Atteso:** `dischetto-seme` S1 scende a ~50 %, S3/S4 verdi.

**Rete di sicurezza:** `dischetto` 29/29, `dischetto-falsi`, `dischetto-seme`,
`sha256`, `rete/prove/tutte.js` 62/62, `perimetro`, `casa`, `casa-falsi`.

---

## C3 — la versione, e i falsi riscritti

> **RETTIFICA A EDIZIONI (24 settembre 2026, a cantiere fatto).** Il punto 1 —
> `DISCHETTO_V` 1 → 2 — **è stato fatto in C2, non qui**, e il piano aveva
> torto a separarli. La prova è stata immediata: col saluto a due tempi e la
> versione ancora a 1, un telefono nuovo e uno vecchio si danno appuntamento
> credendo di parlarsi, e il nuovo accusa il vecchio di `saluto-non-torna`
> invece di dire «versione diversa». **Un protocollo che cambia e un numero
> che non si muove è esattamente l'accusa falsa che questa casa non vuole.**
> In C2 è entrato anche il punto 2 (B8 di `_q-nastro-differito`), perché la
> rete di sicurezza deve essere verde a ogni compito e la versione la rompeva.
> C3 è rimasto la registrazione dei tre falsi nuovi nei due banchi dei falsi.

1. `DISCHETTO_V` 1 → 2 (gioco, `_dischetto-due-telefoni.js`).
2. Verifica che una serie registrata su v1 prenda **INCOMPLETO /
   dischetto-versione** e non NON TORNA — misurata, non dichiarata.
3. I sette falsi del dischetto riletti uno per uno: quelli che ancorano su righe
   toccate dalla cura si riancorano; `_q-dischetto-falsi.js` guadagna i tre nuovi.

**Rete di sicurezza:** tutte quelle di C2 più `giudice`, `sigillo`,
`motore-nastro`, `motore-falsi`, `nastro-differito` 17/17, `nastro-falsi` 8/8.

---

## C4 — il ritmo, la batteria, il verbale

1. Il ritmo rimisurato: punta al minuto per identità, prima e dopo, contro il
   tetto di 60. Se il giro in più costa più di +2, **ci si ferma e si riferisce**.
2. `MOTORE_V` misurato (deve restare 6): `determinismo`, `motori`,
   `motore-nastro`.
3. `dischetto-seme` → `conta:true` in `tutti.js`, con il commento riscritto.
4. La batteria INTERA a gruppi.
5. Verbale in `MANUALE.md` §A in cima, riga nel `PUNTO-DEL-LAVORO.md`, e le
   **rettifiche a edizioni** del #149 (che dichiarava il seme un difetto aperto)
   in `MANUALE.md` §A voce #149 e in `PUNTO-DEL-LAVORO.md`.

---

## LE TRAPPOLE GIÀ NOMINATE

- **Il service worker ignora la query string**: se un banco non riflette una
  modifica appena fatta, prima di tutto `unregister()` e `caches.delete()`.
- **I banchi a tocchi reali non sono ripetibili**: `--ripetuto 3`. Un'assenza
  vale **prova nulla**, non un verde.
- **Prima di chiamare regressione un rosso, misurarlo sull'ultimo commit.**
- **Un falso che non viene morso non è un fallimento del falso**: è un buco nel
  banco, e si ripara il banco.
