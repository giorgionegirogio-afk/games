# VOLUME E GESTO — piano (voce #152)

Spec: `docs/superpowers/specs/2026-09-24-volume-e-gesto-design.md`.
Merge-base `4ed12a6`, ramo `voce-152-volume-e-gesto`.

Il gioco si tocca **solo** con attrezzi a ancore (`strumenti/_toppa-152-*.js`):
mai una modifica a mano, così ogni cambiamento è rieseguibile e una toppa
applicata a metà si ferma invece di scrivere.

---

## C1 — IL CANCELLO CHE CONDANNA

**Prima il rosso.** Si costruiscono i falsi, poi il cancello, e il cancello
nasce misurando i falsi: se non li condanna, non serve.

1. `strumenti/_crit-152-divise.js` — la **versione bugiarda**: `rigLook` veste
   la squadra 1 col kit della squadra 0. I dati (`TEAMCOL`) restano diversi:
   è esattamente la firma del difetto dell'atlas — kit giusto nello stato,
   kit cotto sullo schermo. Produce anche la variante **quasi** (la squadra 1
   con la tinta ruotata di pochi gradi), che è il caso peggiore: due divise
   *diverse* che l'occhio non separa.
2. `strumenti/_q-divise.js` — il cancello, `conta:true`. Misura **sui pixel**:
   per ogni figura la maschera è la stessa `Rig3D.disegna` del fotogramma vero
   ridipinta in nero (lo stesso metodo di `istantanea.js`, e le figure portano
   già l'etichetta della squadra), e sotto quella maschera si legge il
   fotogramma VERO. Due numeri:
   - la distanza circolare fra le tinte dominanti delle due squadre;
   - le famiglie di tinta contate come **archi contigui** (non colonne: un kit
     rosso cade su quattro colonne e la versione che veste tutti uguale
     sembrerebbe più varia — è l'errore che il #151 ha già pagato).
3. Il cancello sa dire **prova nulla** (codice 3): se in campo non ci sono
   abbastanza pixel di corpo per squadra, non si giudica.
4. Registrazione in `tutti.js` con `conta:true`.

**Esito atteso:** verde sul gioco, **rosso su tutt'e due i falsi**.

---

## C2 — A, IL VOLUME

1. `strumenti/_toppa-152-luce.js`, derivata da `_toppa-151-luce.js` ma per la
   produzione: le tre tabelle di Blender dentro `Rig3D`, la tinta dell'arto
   scelta dall'azimut invece che dalla verticale del bacino, i fili di volume
   spenti dall'occlusione misurata.
2. **Il costo si misura in tre forme** (due tratti · un tratto solo · due
   tratti solo da vicino) con `prestazione.js --contro` a 1×, 4× e 6×, e si
   sceglie quella che sta nel budget. **La scelta si scrive nel file**, con il
   numero che l'ha decisa.
3. `istantanea` voce per voce, prima e dopo. `_q-divise` deve restare verde:
   è il compito suo — la luce nuova tocca proprio le tinte delle divise.
4. L'impronta: `_q-duello-impronta`, `determinismo`, e il conto dei sorteggi.

---

## C3 — C, LE OMBRE

1. **Prima si misura dove sta il difetto**, con `istantanea --dettaglio`:
   le ragioni di scarto figura per figura. L'affermazione del #151 («la punta
   schiarita al 40%», cioè la lunghezza) si verifica invece di ereditarla; se
   è superata **si rettifica a edizioni**, con la data e il numero accanto.
2. `strumenti/_toppa-152-ombra.js` cura ciò che la misura ha trovato, dentro
   le due regole che `drawOmbreGiocatori` dichiara (una passata sola; si
   abbassa l'alfa, mai la lunghezza).
3. **Bersaglio: ombre sopra 5/8, nessun'altra voce che scende.**

---

## C4 — B, IL GESTO

1. Si guarda **il respiro del #147** e si resta coerenti con quello.
2. Si sceglie il pugno di clip in cui il movimento è più povero, e si misura
   *perché* è povero prima di toccarlo.
3. `strumenti/_toppa-152-gesto.js`, poi `silhouette`, `istantanea`,
   `_q-duello-impronta`, la batteria intera.
4. Verbale in `MANUALE.md` §A in cima, e la riga in `PUNTO-DEL-LAVORO.md`.

---

## LE RETI, A OGNI COMPITO

`node strumenti/tutti.js` a gruppi (`--solo`), e i cronometrici da soli.
I banchi a tocchi reali con `--ripetuto 3`.
