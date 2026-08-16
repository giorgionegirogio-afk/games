# Dove siamo, e cosa manca

Aggiornato al 17 agosto 2026, durante l'Onda 6. Questo file serve a riprendere
senza rileggere niente altro.

**Ramo:** `main`. **Ultimo commit:** `9bea188` (Onda 5). L'Onda 6 è in volo:
se trovi modifiche non committate in `CALCETTO-il-gioco.html`, `bozze-rig3d/RIG.html`
e `strumenti/istantanea.js`, sono sue — verifica coi cancelli prima di committare.

---

## Il verdetto, e come si muove

Il committente ha chiesto: **giuria di 26 giudici, il nostro 8-9 e i competitor 3-4.**

La prima serie di sei appelli aveva dato un voto piatto a 6,4 contro 8,0. Allora
la giuria è stata **interrogata** invece che consultata (`riferimenti/VERSO-IL-9.md`):
zero giudici su 26 ritengono il 9 precluso a un gioco stilizzato, l'ancoraggio al
3D vale 0,2-0,4 punti su 2,6, e la frattura vera era una sola — *il gioco promette
le sette di sera e disegna un mezzogiorno*.

Da lì il voto si è mosso, per la prima volta:

| momento | voto | note |
|---|---|---|
| sei appelli piatti | 6,4 | prima dell'interrogatorio |
| dopo 4 onde | 7,1 | luce, figure, leggibilità, scene madri |
| dopo la correttiva | **7,3** | 6 difetti su 10 spariti |
| Onda 6 in volo | obiettivo **8,3-8,5** | le tre cose che il giudice ha quantificato |

La dichiarazione del giudice, presa in parola: *«fatti (a) il colore della sera,
(b) il foglio pose alla scala di gioco, (c) riempire il quadro, scrivo 8,3-8,5;
il resto è la coda che porta al 9»*.

---

## Il metodo: il freeze-frame test

Il collaudo con cui la giuria ha promesso di riscrivere il voto è diventato uno
strumento: `strumenti/istantanea.js`. Otto fermi immagine in istanti **casuali ma
deterministici** di una partita vera, con misure sui pixel — erba vuota, palla
trovabile, altezza della figura, ombre parallele, temperatura del prato, e (dall'Onda 6)
il colore del **centro** campo. Le silhouette sono lo stesso rig con la divisa nera,
così la sagoma è quella vera.

Traiettoria: **24/40 → 31 → 33 → 36 →** (Onda 6 in corso).

Ha già trovato due bugie che nessuno cercava:
1. i suoi PNG fotografavano il **sipario** (`#wipe`, animazione CSS sull'orologio vero
   mentre il banco governa il tempo simulato): *i numeri erano veri, le prove erano false*;
2. `simulate` avanza la fisica **senza disegnare** e la camera vive dentro il disegno —
   ventisette secondi di partita lasciavano l'inquadratura ferma al fischio d'inizio.

---

## Cosa è stato costruito nelle sei onde

- **Onda 1 — la sera.** Una sola sorgente costituzionale (SOLE: direzione, caldo,
  freddo) valida su tutte le scene e tutti gli otto campi. Ombre a capsula lunghe
  2,2 volte la figura, parallele per costruzione. Prato con gradiente termico vero
  (scoperto che overlay e multiply su un verde saturo non spostano la tinta: serve
  un'additiva). Quattro fari che si accendono durante i 90 secondi.
- **Onda 2 — le figure.** La scatola degli angoli legali, *convessa*, quindi
  l'interpolazione fra due pose legali resta legale per costruzione. Tre corporature
  e quattro tagli dal **seme del nome**; gemelli azzerati per enumerazione.
- **Onda 3 — la leggibilità.** HUD e pulsanti nella lingua di casa (contrasto da
  2,9:1 a 12,8:1), palette dichiarata in testa al file, la palla al 2,7% con scia,
  ombra staccata e squash.
- **Onda 4 — le scene madri.** Folla con atlante a sei righe che reagisce al gol
  (scoppio + ola), insegne dipinte, gol coreografato, menu come luogo con la
  partitella in loop, rigori mirati col dito.
- **Onda 5 — la correttiva.** Sei difetti su dieci chiusi. Due sprechi trovati nel
  rasterizzatore: un ciclo di 26 rettangoli apriva 21.000 fusioni invece di 824, e
  il manto veniva ingrandito del 12% con filtro bilineare a ogni fotogramma —
  spegnendolo, la mediana passa da 33,3 a 16,7 ms (da 30 a 60 immagini al secondo).
- **Onda 6 — in volo.** Il colore della sera al centro campo, le pose che dicono il
  verbo in nero pieno, il quadro pieno.

---

## I cancelli (tutti verdi all'ultima esecuzione completa)

```
collaudo 36/36 · misura 7/7 · prestazione -10,7% · senza-rete 6/6
giocata 8/8 (sa fallire: 8 NO in pausa) · equità 0,000 al bit
istantanea 36/40 · silhouette · folla · APK 32/32
```

Nove strumenti, e ognuno ha dovuto dimostrare di **saper fallire** prima di essere
creduto. Otto sono stati colti a mentire almeno una volta.

**Attenzione al peso:** il file è a ~1,48 MB su un tetto di casa di 1,5 MB. Il tetto
è una convenzione nostra (alzata da 900 kB il 3 agosto): il vincolo vero è che il
gioco si apra in un secondo. Prima della prossima onda va deciso se alzarlo ancora
o cominciare a comprimere.

---

## Cosa resta per il 9, in ordine di resa (parole del giudice)

Fatte (a), (b), (c) — l'Onda 6 — resta la coda:
- (d) un HUD che non mangi mai il protagonista;
- (e) una sola palla, una sola scala (in home e nei rigori è 3-4 volte fuori misura);
- (f) il primo piano vestito (pantaloncini, calzettoni, scarpe, esultanze diverse)
  e la rete che si gonfia dove la palla la colpisce;
- (g) i rigori mirati col dito sulla porta.

---

## Come si riprende

```bash
cd C:/Users/Utenteee/Desktop/GitHub/games
node strumenti/collaudo.js && node strumenti/misura.js && node strumenti/prestazione.js
node strumenti/istantanea.js --dir istantanee   # il freeze-frame test
node strumenti/silhouette.js && node strumenti/folla.js
node strumenti/giocata.js --tutte
node strumenti/equita.js --partite 200 --conf-b "window.__test.attivaOggetti('tutti')"
node strumenti/scatta.js --tutte calcetto --dir foto-oggi
python android/costruisci.py && python android/verifica.py
```

## Le regole pagate

1. Le passate correttive rendono più di quelle creative.
2. Un solo «peggio» è bloccante.
3. I cancelli li esegue chi giudica, non chi lavora.
4. **Uno strumento che attesta invece di misurare è peggio di nessuno strumento** —
   nove casi finora. L'ultimo: il banco fotografava il sipario e nessuno controllava
   le prove.
5. Un agente morto non è un via libera: i workflow si fermano su null.
6. Il metro si rettifica con data e fonte quando la realtà lo supera.
7. Una giuria ancorata a un riferimento irraggiungibile congela il voto. **Ma prima
   di accusare il metro, interrogalo**: qui l'interrogatorio ha rivelato che il metro
   era giusto e mancava il lavoro — sei appelli piatti erano il sintomo di rifiniture
   fatte al posto della frattura vera.
