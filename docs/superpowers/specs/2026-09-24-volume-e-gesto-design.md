# VOLUME E GESTO — progetto (voce #152)

**24 settembre 2026.** Merge-base `4ed12a6` (`main`), ramo `voce-152-volume-e-gesto`.

Questa è **la produzione** di ciò che la voce #151 ha prototipato e misurato.
Il #151 non ha toccato il gioco spedito: ha costruito la pipeline di Blender,
ha misurato le due strade e ha scritto il verdetto. Qui il gioco si tocca.

Priorità del committente: **(1) figure e animazioni** — è questa. Riferimenti
dichiarati: Subway Surfers e FIFA Mobile. Vincolo di piattaforma: **Android 10**.

**Questo documento è scritto PRIMA di qualunque misura di questa voce**, e il
budget della sezione 5 è la promessa contro cui i numeri si leggeranno dopo.

---

## 0. DA DOVE SI PARTE — le due rettifiche del #151, che restano

1. **«Le figure sono silhouette piatte» è FALSO.** `Rig3D` è già pseudo-3D:
   18 giunti in metri, 27 clip, 4 corporature, yaw continuo, due camere,
   fusione fra pose, numero di maglia ancorato al torso. Quello che manca è
   **una riga sola**: l'ombreggiatura interna è una **decisione binaria per
   arto** («se il punto medio sta a est della verticale del bacino, tinta
   fredda») che **non guarda nemmeno come è girato l'arto**.
2. **Le ombre sono 5/8, non 3/8** (il 3/8 era l'edizione del 15 agosto).
   Base di oggi, rimisurata su questo merge-base: **42/56** —
   erba 1/8 · palla 8/8 · figura 8/8 · **ombre 5/8** · prato 8/8 ·
   centro sera 7/8 · centro abitato 5/8.
3. **Gli sprite non convengono**, misurato: 3 criteri su 7. La strada è
   **prendere da Blender le tabelle, non i pixel** — 279 byte contro 131,91 MB
   di base64.

---

## 1. LE TRE COSE, E IL LORO ORDINE

### A — IL VOLUME: la luce vera al posto dell'`if` binario

`strumenti/blender/luce.py` ha calcolato col `ray_cast` sulla geometria vera
del rig, sotto il `SOLE` letto dal gioco (`dir [0.9406,0.3402]`, `alt 20`):

| tabella | che cos'è | misura |
|---|---|---|
| `rampa[16]` | il profilo di luminanza **attraverso** un arto | 0,79 → 0,00, monotona |
| `azimut[16]` | la luce diretta secondo **come è girato** l'arto, mediata su 192 fotogrammi, con l'auto-ombreggiatura vera | **0,188 a ovest contro 0,002 a est** |
| `ao[13]` | l'occlusione per segmento, dal corpo intero | ascella 0,23 · spalla 0,52 · coscia 0,14 |

**Ottanta volte** dove il gioco oggi ha un `if`. Le tre tabelle pesano
**279 byte** e si incorporano come **numeri nel file**, mai come immagini.

Il prototipo `fuori/151-luce.html` costava **+6,6% di fotogramma** a freno 4×,
ed è il prezzo di **due tratti in più per arto su otto arti**. Il #151 ha
dichiarato che quella è la prima cosa da stringere: **un tratto solo, oppure
solo per le figure vicine**. Qui si misura e si sceglie, e la scelta si scrive.

### C — LE OMBRE: il difetto misurato, e dove sta davvero

**5/8 è la voce più debole del metro.** Il #151 diceva che il difetto era «la
punta schiarita al 40%», cioè la LUNGHEZZA. **Quella affermazione va verificata
prima di curarla**, perché è l'edizione del 15 agosto e da allora la punta è
stata scurita (`LNG1=0,80`).

La cura, qualunque essa sia, deve rispettare le due regole che
`drawOmbreGiocatori` dichiara da sempre:
- **una sola passata, prima di tutti i corpi** (mai ombra-e-corpo a coppie);
- **se le ombre si affollano SI ABBASSA L'ALFA, MAI LA LUNGHEZZA**.

E le due direzioni indicate dal mandato:
- l'ombra dipende dall'**altezza** del soggetto (il pallone in volo non
  proietta come un uomo fermo);
- il **contatto** sotto i piedi è più scuro.

**Bersaglio: le ombre sopra 5/8 senza che nessun'altra voce scenda.**

### B — IL GESTO: le pose dove il movimento è povero

Il gioco ha **27 clip** e le disegna già con le sue primitive: qui **non si
aggiunge un formato**, si migliorano le pose che già esistono. La tassonomia di
`fcm-estratto/g-anim.txt` dice **quali** gesti contano (`MoveDirection`,
`KickBall`, `Trap`, `Intercept`, `SlideTackle`, `StandTackle`, `Reaction`):
**si prende il repertorio e il timing, mai un disegno** — regola del
committente, le meccaniche sono libere e l'espressione no.

Il principio che rende premium un'animazione, e che i due riferimenti usano
entrambi: **anticipazione, sovrapposizione, chiusura del gesto**. Il #147 ha
già messo nel gioco «il respiro» (un'anticipazione che dura quanto il ritardo):
**si è coerenti con quello**, non si inventa un secondo sistema.

---

## 2. IL BUCO DEL METRO — e la colonna che manca

Il #151 ha scoperto che `istantanea.js` dà **42/56 anche a una versione in cui
le due squadre vestono uguale**: lo sprite cuoce le cinque tinte del kit, e sul
campo restano ventidue maglie rosse identiche. **Sette cancelli su otto istanti
non hanno una colonna per «si distinguono le squadre».**

Questo si cura **prima** di toccare il gioco, perché è la rete che deve reggere
tutto il resto: ogni cosa che si fa alla luce delle figure può spegnere la
differenza fra le due divise, e oggi nessuno se ne accorgerebbe.

**Il cancello nuovo misura sui PIXEL, non sui dati.** Leggere `TEAMCOL[0]` e
`TEAMCOL[1]` e vedere che sono diversi non prova niente: nel falso dell'atlas i
due kit erano diversi **nello stato** e identici **sullo schermo**. La misura
deve guardare i pixel che stanno addosso ai corpi, separati per squadra.

---

## 3. LA PARTITA NON DEVE CAMBIARE DI UN BIT

La grafica è presentazione. Il criterio è quello del #147 e del #151:
- **impronta della partita identica** su N partite a parità di seme;
- **zero sorteggi di gioco consumati** in più (il #132 ha trovato che l'audio
  ne consumava: non si ripete);
- **`MOTORE_V` resta 6**.

Se l'impronta si muove, si è toccata la simulazione: **ci si ferma**.

---

## 4. LE RETI DI SICUREZZA, A OGNI COMPITO

La batteria intera, a gruppi, e in particolare: `istantanea` (nessuna voce
scende), `prestazione`, `avvio`, `senza-rete` 6/6, `_q-duello-impronta` 44/44,
`_q-motori`, `_q-casa`, `determinismo` (+11), `giudice`, `dischetto`, `volto`,
`schermi`, `sha256`, `nastro-differito`.

I banchi a tocchi reali non sono ripetibili: `--ripetuto 3`. Un'assenza vale
**prova nulla**, non verde.

---

## 5. IL BUDGET, DICHIARATO PRIMA

| voce | tetto | perché quel numero |
|---|---|---|
| fotogramma a freno 4× | **+8,0%** sul totale delle tre cose | il #151 ha misurato +6,6% per la sola luce a due tratti; otto lascia un punto e mezzo per ombre e pose, e resta sotto il +25% che il #151 dichiarava ammissibile |
| fotogramma a 1× e 6× | il segno dev'essere **coerente** fra i tre freni | un guadagno che compare solo a un freno è rumore del banco |
| peso del file | **+12 kB** | il #151 ha speso 4.117 byte per la sola luce con un tetto di 8 kB; dodici lascia spazio a ombre e pose e resta sotto lo 0,5% del gioco |
| `istantanea` | **nessuna voce scende**, e le ombre **salgono sopra 5/8** | è il bersaglio dichiarato |
| impronta di partita | **identica al bit** | sezione 3 |
| `MOTORE_V` | **6**, non si muove | sezione 3 |

---

## 6. IL CRITERIO DI RINUNCIA — scritto prima di misurare

Ognuna delle tre cose (A, B, C) si giudica **da sola**, e si rinuncia a quella
che non regge senza trascinare le altre.

1. **A — la luce.** Si rinuncia se il fotogramma a 4× sfora il +8% anche nella
   forma a **un tratto solo**, o se `istantanea` perde una quota.
2. **C — le ombre.** Si rinuncia se dopo la cura le ombre non salgono sopra
   5/8, o se per farle salire scende un'altra voce.
3. **B — il gesto.** Si rinuncia se `silhouette` peggiora (una posa che non si
   legge in nero non è un gesto migliore) o se `_q-duello-impronta` si muove.
4. **Tutte e tre**, senza appello, se l'impronta della partita cambia o se
   `MOTORE_V` deve muoversi.

**Rinunciare si dichiara coi numeri**, non si aggira abbassando una soglia.

---

## 7. I COMPITI

| # | che cosa | commit |
|---|---|---|
| C0 | questa spec e il piano | 1 |
| C1 | il cancello che condanna: le due squadre si distinguono, coi suoi falsi | 1 |
| C2 | A — la luce vera per arto più l'AO, col costo misurato e la scelta dichiarata | 1 |
| C3 | C — le ombre sopra 5/8 senza far scendere nulla | 1 |
| C4 | B — il gesto, più la batteria intera e il verbale | 1 |
