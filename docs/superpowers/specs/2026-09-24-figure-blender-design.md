# LE FIGURE DA BLENDER — progetto (voce #151)

**24 settembre 2026.** Merge-base `c1e01fb` (`main`), ramo `voce-151-figure-da-blender`.

Il committente ha chiesto **grafica e animazioni di qualità premium**, con
riferimenti Subway Surfers e FIFA Mobile, e ha dato le priorità: (1) figure e
animazioni, (2) interfaccia e menu, (3) effetti d'impatto. Questa voce affronta
**solo la (1)**, e **non come produzione**: come **prototipo misurato**. Alla
fine non ci deve essere una grafica nuova nel gioco spedito, ci devono essere
**numeri** con cui decidere se impegnare l'architettura.

**Questo documento è scritto PRIMA di qualunque misura**, e contiene il
**criterio di rinuncia** in sezione 6. Serve a questo: che il verdetto non possa
essere scritto dopo aver visto i numeri.

---

## 0. CHE COS'È OGGI LA GRAFICA DELLE FIGURE — verificato sul codice

Il mandato di partenza diceva «silhouette piatte». **È vero solo a metà, e la
metà che è falsa cambia tutto il conto**: va rettificato qui in cima, perché è
la premessa di ogni numero che segue.

`CALCETTO-il-gioco.html` riga 5108 — **`Rig3D` non è un disegno 2D**. È una
libreria di **figure pseudo-3D a capsule**:

| che cosa | dov'è | quanto |
|---|---|---|
| scheletro a giunti 3D | riga 5111, `PELVIS…TOR` | **18 giunti**, coordinate in metri |
| misure del corpo | riga 5152, `N_THIGH…N_HEADR` | 7 ossa nominali, statura ~1,83 m |
| corporature | riga 5199, `CORPI[]` | **3 uomini diversi** + la taglia neutra |
| clip di posa | riga 7415, `CLIPS{}` | **25 animazioni**, ognuna con la sua `freq` |
| fusione fra due pose | riga 5245, `fondi()` | le figure non si teletrasportano al cambio di clip |
| camere | riga 7487, `CAMERE` | `alto` (42°, la partita), `bassa` (16°, i rigori) |
| segmenti disegnati | riga 7522, `SEGS[]` | 14 capsule, ognuna con la sua **tinta di kit** |
| proiezione | `SX = cx + x·s`, `SY = cy − (y·ce + z·se)·s`, `s = hPx/(1,9·ce)` | **yaw continuo**, non quantizzato |

Quello che **manca davvero** è una cosa sola, e sta alla riga 8352:

```js
let tinta = look[g.c];
if (g.kind === 0 && look._ombS) {
  const alt = look._ombS[g.c];
  if (alt && (SX[g.a] + SX[g.b]) * 0.5 > SX[PELVIS] + W * 0.18) tinta = alt;
}
```

**L'ombreggiatura interna del corpo è UNA DECISIONE BINARIA per arto**: se il
punto medio del segmento sta a est della verticale del bacino, quell'arto prende
la tinta fredda; altrimenti la calda. Due valori, nessuna gradazione, nessuna
occlusione. **È lì che sta il «senza volume»**, non nella geometria — la
geometria è già 3D.

Questa rettifica è la ragione per cui il prototipo degli sprite parte in salita:
un atlas non aggiunge tridimensionalità a un sistema che ce l'ha già; **toglie**
yaw continuo, corporature, tinte di kit a runtime e fusione fra pose, e in cambio
dà l'ombreggiatura — che costa poche centinaia di byte per altra via.

---

## 1. LA PIPELINE — che cosa fa Blender, e perché headless

Blender 5.2 LTS, `--background --factory-startup --python`. Nessun MCP: **script
Python nel repo** (`strumenti/blender/`), così chiunque rigenera. `--factory-startup`
non è un dettaglio di comodità: senza, le preferenze dell'utente entrano nel
render e il file smette di essere riproducibile sulla macchina di un altro.

Tre prodotti, dallo stesso corpo:

```
  strumenti/blender/figura.py    il corpo low-poly, costruito DALLE MISURE DEL GIOCO
  strumenti/blender/anima.py     le due clip (corsa, tiro), riga per riga dal rig
  strumenti/blender/atlante.py   -> fuori/151-atlante.png   (la prima via)
  strumenti/blender/luce.py      -> strumenti/blender/_151-luce.json  (la terza via)
  strumenti/blender/pose.py      -> strumenti/blender/_151-pose.json  (la terza via)
```

### 1.1 Il corpo è vincolato al gioco, non inventato

`figura.py` **non ha proporzioni sue**. Legge `CALCETTO-il-gioco.html`, estrae
`N_THIGH N_SHIN N_UA N_FA N_FOOT N_SHW N_HEADR HIPW` e le larghezze dei `SEGS`,
e costruisce il corpo con quelle. **È un'invariante, non una comodità**: una
pipeline che disegna un uomo diverso da quello del gioco produce misure che non
si possono confrontare con niente, e il confronto è tutto il punto di questa
voce. Il cancello `_t-151-blender` lo verifica osso per osso.

Low-poly stilizzato, non un umano realistico: il riferimento del committente
(Subway Surfers) è **leggibilità dall'alto e silhouette forte**, e il gioco ha
già pagato due cantieri su quella silhouette (le tre masse, le strozzature di
collo e vita — righe 7510-7522). Il corpo di Blender è **lo stesso**: capsule con
gli stessi raggi, stesse strozzature.

### 1.2 Determinismo — il cancello, non la speranza

Un render non deterministico rende la pipeline inutilizzabile: nessuno può dire
se un PNG diverso è una modifica o rumore. Tre regole:

1. **Workbench**, non Cycles né EEVEE: nessun campionamento, nessun denoiser,
   nessun accumulo temporale. Le ombre e il volume li calcola `luce.py` a parte,
   e lì il campionamento è **enumerato**, non casuale.
2. Nessun `random` in nessuno script. Dove servisse una variazione, seme fisso
   dichiarato in testa al file.
3. `--factory-startup` sempre, threads fissi.

**Cancello**: due corse di fila, `sha256` del PNG **identico al byte**. Nasce
rosso (gli script non esistono), diventa verde.

---

## 2. LA PRIMA VIA — l'atlas di sprite

Il prototipo che il committente ha chiesto: **una figura, due animazioni, otto
direzioni**. Dalla tassonomia di FC Mobile (`fcm-estratto/g-anim.txt`) si
prendono i due nodi che coprono il 90% del tempo di schermo:

| nodo FC Mobile | clip del gioco | che cos'è |
|---|---|---|
| `ActNodeMoveDirection` | `corsa` (`freq` 2,6) | il ciclo di locomozione |
| `ActNodeKickBall` | `tiro` (`freq` 0,7) | il colpo, una botta sola |

**Si prende la tassonomia — quali gesti servono e come si concatenano — non un
disegno, non un asset, non un testo.** È la regola del committente e qui è
tenuta alla lettera: da `g-anim.txt` esce un elenco di nomi, e i nomi non sono
espressione.

### 2.1 Quante direzioni, e perché otto

Oggi il yaw è **continuo**. Un atlas lo quantizza. Otto direzioni è il minimo
storico dei giochi a sprite isometrici (45° di passo); sotto, la figura scatta
visibilmente quando gira. Il prototipo misura otto **perché è il numero che il
committente ha nominato**, e il costo di sedici (il raddoppio) si calcola dallo
stesso atlas invece di renderizzarlo due volte.

### 2.2 Quanti fotogrammi, e perché dodici

La corsa gira a 2,6 Hz. A 60 fps un ciclo dura 23 fotogrammi; **dodici pose per
ciclo** (interpolate a due a due) è la densità sotto la quale la falcata
comincia a saltare, ed è quella che i cicli a sprite di mestiere usano da
trent'anni. Il tiro, a 0,7 Hz, dura 86 fotogrammi di schermo: **dodici pose** lo
coprono solo perché è un gesto a impulso, dove le pose chiave contano più della
continuità.

### 2.3 La cella, e perché 128

La figura in partita è alta **~93 px veri** (dichiarato alla riga 8407: 34 unità
× S2 1,16 × P_DIS 1,18 × DPR 2). Una posa di corsa o di tiro esce dal riquadro
del corpo fermo: gamba tesa avanti e braccio indietro chiedono ~1,35× in
larghezza. **128×128 è la cella 1:1 col gioco di oggi** su un telefono a DPR 2.
Su DPR 3 servirebbe 192, e il conto si rifà ×2,25.

### 2.4 Il conto a priori — da confermare o smentire con la misura

192 fotogrammi (2 × 8 × 12) di 128×128 = 3 145 728 pixel. Atlas 2048×1536.
**Memoria di texture: 2048 × 1536 × 4 = 12,6 MB**, e la memoria non si comprime:
il PNG è il peso sul disco, la texture è il peso in RAM.

La **copertura piena** è l'altro numero che decide: 25 clip invece di 2 →
×12,5; 3 corporature → ×3. Si misura sull'atlas vero e si scrive in chiaro.

### 2.5 Il problema che l'atlas non può risolvere da solo: **le tinte del kit**

Le squadre sono **generate**, non un elenco chiuso: `look` porta cinque tinte
(`maglia pantaloncini calze scarpe pelle`) più le varianti fredde. Uno sprite le
**cuoce**. Le tre uscite possibili, tutte da dichiarare nel verdetto:

* **(a) un atlas per squadra** — impossibile: le squadre nascono a runtime;
* **(b) maschere per zona di colore** — memoria ×5;
* **(c) una tavolozza indicizzata ricolorata a runtime** — un `putImageData` per
  figura per fotogramma, cioè il costo che l'atlas doveva risparmiare.

Il prototipo renderizza **(a) con una divisa sola**, che è il caso **più
favorevole all'atlas**: se non regge nemmeno lì, le altre due non vanno provate.

---

## 3. LA TERZA VIA — Blender che CALCOLA invece di disegnare

Due prodotti, nessuno dei quali è un pixel di texture.

### 3.1 La mappa di luce (`luce.py`)

Il difetto misurato in sezione 0 è la decisione binaria per arto. Blender
renderizza **una capsula sola**, sotto **il sole del gioco** (la stessa direzione
che `drawOmbreGiocatori` dichiara: ~21-23° a schermo), a **N orientamenti
enumerati** nello spazio, e per ognuno misura:

* la **luminanza media** dei pixel illuminati;
* la **posizione del terminatore** lungo l'asse della capsula.

Ne esce una tabella di N numeri — **poche centinaia di byte** — che il disegno
consulta al posto del confronto `> SX[PELVIS]`. La gradazione che oggi non c'è
si compra con una tabella, e la tabella la calcola Blender **una volta sola**,
non il telefono a ogni fotogramma.

In più `luce.py` cuoce l'**occlusione ambientale per segmento** sul corpo
completo: quanto ogni capsula è nascosta dalle altre (ascella scura, lato esterno
del braccio chiaro). **Tredici numeri.** È letteralmente il «volume» che il
mandato dice mancare, e non si può ottenere analiticamente perché dipende dal
corpo intero.

### 3.2 Le pose in coordinate (`pose.py`)

Il rig ha già i suoi 18 giunti in metri. `anima.py` bake le due clip in Blender e
`pose.py` le esporta come **coordinate dei giunti**, nello stesso sistema del
gioco. Serve a due cose: (i) verificare numericamente che il corpo di Blender e
quello del gioco siano lo stesso corpo; (ii) tenere aperta la strada per cui una
clip futura si anima in Blender e si spedisce come tabella di numeri — **il peso
del gesto senza un pixel di texture**.

**Ordine di grandezza a priori**: 18 giunti × 3 coordinate × 12 fotogrammi ×
2 clip = 1296 numeri. A 2 byte l'uno (interi in centimetri) ≈ **2,6 kB**, contro
i megabyte dell'atlas. Da confermare con la misura.

---

## 4. COME SI MISURA LA QUALITÀ

**`strumenti/istantanea.js`**, il freeze-frame test, e nient'altro. Sette
cancelli su otto istanti, **base 42/56** (voce #149, lezione 23). Due colonne
riguardano questa voce in pieno:

* **FIGURA** — altezza a schermo della figura attiva. Oggi 10,5-16,3% contro un
  minimo del 6%: **ampiamente dentro**. Non è lì il problema, e uno sprite non lo
  migliora.
* **OMBRE** — direzione e lunghezza dell'ombra di ogni figura. **È la voce più
  debole**, e il #143 ne ha perse due senza accorgersene.

**Le altre cinque colonne non devono muoversi.** Se si muovono, la grafica ha
toccato qualcosa che non doveva toccare.

**La regola della lezione 23 vale qui**: una quota che scende si attribuisce
subito, anche quando il cancello non conta.

---

## 5. COME SI MISURA IL COSTO

| misura | strumento | soglia |
|---|---|---|
| peso PNG grezzo | `_151-peso-atlante.js` | — (si stampa) |
| peso in base64 | idem, `+33%` | vedi 6 |
| memoria di texture | `W × H × 4`, confermato in Chrome | vedi 6 |
| tempo di decodifica | `Image.decode()` in Chrome, profilo Android 10 | vedi 6 |
| fotogrammi | `strumenti/prestazione.js --contro HEAD` | dentro la dispersione |
| tempo di avvio | `strumenti/avvio.js` | non peggiora |
| nessuna richiesta | `strumenti/senza-rete.js` | 6/6 |
| la partita non cambia | impronta identica, zero sorteggi di gioco | **identica al bit** |

**Il profilo Android 10** si dichiara e non si inventa: CPU rallentata 4× e 6×
via CDP (`Emulation.setCPUThrottlingRate`), la stessa leva con cui `avvio.js`
già misura. Un numero preso a piena velocità su un desktop non dice niente su
una WebView vecchia.

---

## 6. IL CRITERIO DI RINUNCIA — scritto prima di misurare

**Gli sprite si dichiarano NON CONVENIENTI se anche UNO solo di questi è vero:**

1. **PESO** — l'atlas del prototipo (una figura, due clip, otto direzioni, una
   divisa) in base64 supera **700 kB**, cioè il 25% del file di oggi (2,8 MB).
   Motivo: il prototipo è 2 clip su 25; a 700 kB la copertura piena passa gli
   8 MB e il mandato «un file solo» diventa una bugia.
2. **MEMORIA** — la texture a runtime supera **24 MB**. Motivo: Android 10 su
   GPU modesta, e il gioco ha già i suoi canvas.
3. **QUALITÀ** — `istantanea` perde **anche una sola quota** rispetto a 42/56.
4. **FOTOGRAMMI** — `prestazione` peggiora oltre la dispersione dichiarata.
5. **AVVIO** — il tempo di apertura a 4× peggiora oltre la dispersione.
6. **RETE** — `senza-rete` scende sotto 6/6 (cioè l'asset è finito fuori dal file).
7. **ESPRESSIVITÀ** — l'atlas costringe a rinunciare a una di queste, che oggi
   il gioco ha: yaw continuo, tre corporature, tinte di kit a runtime, fusione
   fra pose, numero di maglia ancorato al torso.

**La terza via si adotta se e solo se:** `istantanea` **non peggiora**, il peso
aggiunto al file sta **sotto gli 8 kB**, `prestazione` resta dentro la
dispersione, e **l'impronta della partita è identica al bit**.

**Se nessuna delle due convince, l'esito legittimo è «non conviene», e si
scrive.** Il committente ha chiesto qualità premium, non un atlas.

---

## 7. QUELLO CHE QUESTA VOCE NON FA

* Non cambia la grafica del gioco spedito. Le versioni con le figure nuove
  vivono in `fuori/`, che non è tracciata.
* **Non muove `MOTORE_V`** (6). La grafica non è la simulazione: se `MOTORE_V`
  si muove, è stato toccato il gioco invece del disegno, e ci si ferma.
* Non tocca l'interfaccia né gli effetti d'impatto (priorità 2 e 3 del
  committente): sono altre voci.
