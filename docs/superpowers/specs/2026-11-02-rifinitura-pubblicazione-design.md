# La rifinitura per la pubblicazione — voce #159 (2 novembre 2026)

**Mandato del committente (2/11/2026, in una riga):** «finisci il gioco del
calcetto e appena finito rendi disponibile l'APK … funzionante, coerente,
divertente da giocare, competitivo … entro 10 ore». Nessuna voce aperta è
stata nominata: la scelta di cosa entra è di chi scrive, e sta qui con le
ragioni.

**Merge-base:** `4063c2a` (ramo `figure-giro-4`, 24 commit avanti a `main`).
**Ramo:** `voce-159-rifinitura`. **MOTORE_V:** 6 → 7 (una sola bollatura per
il cantiere; vedi §4).

## 1. Lo stato misurato prima di toccare (batteria intera, 2/11, 65 min)

80 cancelli con `--tutto`, 2 alla volta (2,2 GB liberi, Chrome aperto):
ROSSO `silhouette` 6/10 (il giro 4 del #157, dichiarato dal 25/9) e
`dischetto` (E1, punta 75/min contro tetto 60: da rifare a banco libero, il
banco era occupato 5,2× il minimo); `perimetro` e `casa-falsi` esplosi
(uscita 2: il banco della matematica contava un «Mexp» dentro il base64 degli
atlanti — difetto del banco, curato in §3.4); `audio` nullo in parallelo e
verde da solo (28/28); `avvio-telefono` nullo perché il telefono è sparito da
adb durante la corsa (era visibile all'inizio della sessione). `istantanea`
42/56 come il 10/10, `giocata` 7/7, `prestazione` 3/3.

## 2. Che cosa entra, e perché

Una ricognizione di quattro lettori indipendenti (difetti di gioco,
superficie di collaudo, coerenza dei documenti, competitività) più un
confutatore ha verificato contro il codice di oggi dodici voci dell'elenco del
realismo del 24/9 e otto sfruttamenti dell'umano. Il confutatore ha distinto
i DIFETTI dalle SCELTE DI CASA documentate: le scelte non si «curano
d'ufficio», si rendono oneste o si lasciano.

### 2.1 Difetti veri (il confutatore li conferma) — entrano

| | voce | cura minima | dado() |
|---|---|---|---|
| P1 | **#6** il portiere perde le mani: dopo il rinvio (`kickCd=0,4`, `owner=-1`) e dopo il rimpallo sul corpo (`0,18`) nessuno decrementa più `kickCd` del portiere, che non prende né coi guanti né coi piedi finché un fischio non lo azzera | in `updateKeeper`, prima della guardia della presa in piedi: `if(b.owner!==indexOf(p)) p.kickCd=max(0,p.kickCd-dt)` | 0 nuovi |
| P2 | **#7/#9** il portiere non si prepara: il tuffo si arma solo su `sp>300`; filtranti lente e rimpalli lo lasciano sulla retta palla-centro | ramo di «lettura morbida» (pallone libero, verso porta, in area allargata): bersaglio `predY` invece di `FH/2+dy·0,55`; se il pallone è lento e nessun avversario è più vicino, esce a prenderlo | 0 nuovi |
| P3 | **#8** margine laterale del portiere | `clamp(p.y, GY0-46, GY1+46)` (il margine che il tuffo già si concede) | 0 |
| P4 | **#5** il duello aereo lo vince l'ordine dell'array, cioè la squadra 0 | il più vicino in rapporto alla portata, non il primo | 0 |
| R1 | **#12** la scivolata su chi NON ha la palla non è mai fallo (sfruttamento dell'umano: si entra «sul passaggio» senza rischio) | estrarre `falloDaScivolata(p, vittima, cattivo)` e chiamarla anche quando la scivolata non gioca il pallone e stende l'avversario più vicino | 0 |
| R2 | **#13** il contrasto in piedi fallito non è mai fallo ed è gratis (lo sfruttamento più grave contro la CPU: si spamma ogni 0,22 s) | stesso dado: sul fallito da dietro una quota diventa fallo; sul fallito `kickCd` 0,45 (il numero del furto col corpo fallito) e un morso di fiato | invariato (1) |
| R3 | **#33** la doppia ammonizione allo stesso uomo non espelle: `p.gialli` è mostrato negli eventi e mai letto | OR dei due inneschi: resta la regola di squadra documentata (§8 del manuale, presidiata da banco), si aggiunge il secondo giallo personale | 0 |
| R4 | **#31, la parte onesta**: il pannello dei rigori promette cinque pallini e dipinge verdi i PRIMI `seg` qualunque sia l'ordine; al tetto 9-9 vince la squadra 0 per decreto | pallini = tiri battuti, esito per esito (`R.esiti`); decreto simmetrico a zero estrazioni; la morte improvvisa a coppie RESTA (è la regola di casa dichiarata) e va scritta nel manuale §7 | 0 |
| R5 | **#46** il conto dei falli di squadra non si vede, benché dal terzo scatti la punizione | etichetta condizionale sotto il nome squadra: «2 FALLI» ambra, poi «PUNIZIONE»; i cinque elementi dell'HUD restano cinque quando non serve | 0 |

### 2.2 Sfruttamenti dell'umano, con leve deterministiche — entrano

| | voce | cura | dado() |
|---|---|---|---|
| H1 | tiro: la finestra del tempismo è a tempo fisso anche sotto pressione | `larg` (la larghezza della finestra, oggi solo dalla tecnica) si stringe con la pressione dell'avversario addosso; dentro la finestra il tiro resta perfetto: la promessa del tutorial non si tradisce | 0 |
| H2 | passaggio umano: zero errore anche con un uomo addosso | sotto pressione calano `lead` e velocità (la stessa specie di legge di `eseguiAiPass`, senza il suo dado) | 0 |

Il confutatore ha respinto come «cura d'ufficio» il rumore casuale su tiro e
passaggio (#20, #19 dell'elenco): la L3.1 («la promessa esce dalle stesse
funzioni dell'esecuzione») e il tutorial promettono che il tiro in finestra
va dove dice. Si tocca la FINESTRA e il LEAD, non l'esito.

### 2.3 Scelte di casa che restano, e perché

- **#30** la respinta del portiere non concede mai l'angolo: scelta dichiarata
  nel codice (la respinta rimette in gioco), e a GABBIA gli angoli non
  esistono. Resta.
- **Morte improvvisa dai rigori** (parte di #31): regola di ritmo dichiarata;
  si rende onesto lo schermo, non si cambia la regola.
- **Scala di difficoltà a due manopole** (forza CPU / aiuto compagni),
  **portiere con reazione vera per lato** (`gkT` e `mateSave` sono manopole
  morte): valgono, ma sono cantieri da mezza giornata ciascuno con la misura
  del conto dei gol in mezzo. Seguito dichiarato, non infilato nelle ultime
  ore.

### 2.4 Coerenza e pubblicazione — entrano

- Documenti: README, COME-INSTALLARE, index.html, CLAUDE.md dicono APK da
  117 kB, «3 contro 3», «mercato», «32 controlli», «nessuna immagine»: tutto
  superato (4,3 MB; 5/7/11; sola lettura; 48; sei WebP). NOTICE a nuova
  edizione (md5 e byte del file di oggi). MANUALE §6-§8, §14, §15: la serie
  di rigori (a oltranza a coppie), il pareggio in stagione, «zona calda» →
  «area», 24 trofei, le righe di Impostazioni mancanti, il tutorial
  rivedibile. In gioco: l'aiuto sul pallonetto (dice «levetta indietro»: su
  telefono è «tieni TIRA e trascina in su»), i crediti (le figure
  fotografiche sono generate con Gemini: va detto).
- `sw.js` VERSIONE v2 → v3 (così chi ha l'app web vede l'avviso di
  aggiornamento). `.gitignore`: scatti e sonde dei cantieri #153-#158.
- **La SFIDA in rete nell'APK**: l'APK non ha il permesso INTERNET (per
  scelta, verificata da `verifica.py`) e il server `calcetto-rete` è in pausa
  dal settembre: nell'app la SFIDA dice «serve la rete» e basta. Si resta a
  zero permessi; i documenti smettono di dire «il multigiocatore non c'è» e
  dicono il vero: c'è nel file web, chiede un server che oggi è spento.
- **APK**: `SERIE` 1.1 → 1.2; `android:enableOnBackInvokedCallback="false"`
  nell'`<application>` (con `targetSdk 36` su Android 13+ il tasto Indietro
  non arriverebbe più a `onBackPressed`: non provato su un telefono 16, qui
  c'è un Android 11, quindi la cura è preventiva e dichiarata). Build,
  48 controlli, installazione sul telefono se adb lo rivede, commit degli APK,
  merge su `main`, push, release GitHub con l'APK allegato.

### 2.5 Il cancello `silhouette`

Misura il rig a 40 px, che dal #158 è il ripiego e in campo non si vede: da
oggi, con FIGURE accese, il banco `?banco=silhouette` disegna con `Sprite3D`
(stesso `disegna` della partita, look tutto nero) e la misura torna a essere
di ciò che il giocatore guarda. Se le sagome fotografiche non reggono le bande
tarate sul rig (≥ 8/10), il numero si scrive com'è, con la causa: non si
allenta la banda per farlo passare.

## 3. Invarianti che non si toccano

1. **Determinismo a seme**: ogni cura dichiara quante estrazioni aggiunge
   (tabelle sopra: zero, salvo nessuna). `determinismo`, `seme`, `cpu-ordine`,
   `fuzzer`, `invarianti` verdi dopo ogni compito.
2. **Equità**: le due squadre restano simmetriche a parità di comandi
   (`equita` 0,000 al bit). Nessuna cura legge `team===0` per decidere.
3. **Ordine sacro** nei banchi: `startMatch` prima, `setCpuVsCpu` dopo.
4. **Il conto dei gol**: P1+P2 alzano le parate. Si misura con `_eventi.js`
   (30 partite, taglia 5, poi 7 e 11) PRIMA e DOPO, cura per cura: gol a
   partita entro ±25% di oggi e 0-0 sotto le soglie del cancello `eventi`;
   altrimenti la cura si restringe, non si somma al buio.
5. **La matematica in casa** (#143): fuori dal blocco protetto nessuna nativa
   `Math.sin/cos/tan/exp/log/atan2/hypot`. La #157 ne aveva lasciate nel
   blocco APQ: si dirottano (§3.4).
6. **Ogni bug ha prima un test rosso** (`_t-159-*.js`), e il test resta.

## 4. MOTORE_V

P1, P2, P4, R1, R2, R3, R4 (il decreto), H1, H2 cambiano l'esito di sequenze
di comandi identiche: `MOTORE_V` 6 → 7 una volta sola, con la rettifica a
edizioni accanto alla costante, la fixture rigenerata
(`_gen-nastro-duello-congelato.js`) e i cancelli sensibili rilanciati
(`regole`, `mira`, `nastro-tronco`, `carta`, `giudice`, `nastro-differito`,
`dischetto`, `motore-nastro`, `motore-falsi`, `finestra`, `staffetta`,
`replay`, `schermi`, `sigillo`).

## 5. Cosa NON entra, dichiarato

Il live 1v1 (la dichiarazione in cima al registro §A resta vera), il server
della sfida, la scala di difficoltà a due manopole, il portiere con reazione
per lato, gli angoli dalle respinte, i fogli nuovi da Nano Banana (la
corsa all'indietro del difensore sarebbe il primo: resta il seguito più
visibile dell'elenco del realismo), il peso del repo per Pages (493 MB di
immagini tracciate ad agosto), il bottone «installa» della pagina web.
