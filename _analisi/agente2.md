Ho letto il file, mappato ogni percorso d'ingresso e **misurato** le raggiungibilità con cinque sonde Playwright (13 partite CPU-vs-CPU + prove mirate a tastiera e a dito). Le sonde restano nel progetto, col prefisso `_`:
`C:\Users\Utenteee\Desktop\GitHub\games\_sonda-azioni.js` · `_sonda-umano.js` · `_sonda-umano2.js` · `_sonda-rovesciata.js` · `_sonda-touch.js` · `_sonda-touch2.js` · `_sonda-quota.js`. Non ho toccato `CALCETTO-il-gioco.html`.

---

# INVENTARIO DI CIÒ CHE UN GIOCATORE PUÒ FARE OGGI

Tutti i riferimenti sono a `C:\Users\Utenteee\Desktop\GitHub\games\CALCETTO-il-gioco.html`.

## 0. Le due porte d'ingresso, e nient'altro

| via | dove | note |
|---|---|---|
| tastiera | `KMAP` **8591-8594**, `keydown` **8596-8629**, `keyup` **8630-8639** | P1 `WASD/C/X/Z/E/Q/ShiftLeft` · P2 `frecce/N/M/B/,//​ /ShiftRight` |
| tocco | `Touch5` **8806-8950**, listener **8954-8970** | stick + 2 pulsanti contestuali + flick |
| duello (punizione/rigore) | `Duel.key` **12000-12021**, pointer **12267-12305** | scena a sé, comandi diversi |

Non esistono altre superfici di comando in partita. `pointerdown` sul campo (**8974**) serve solo a saltare moviola/ripresa.

---

## 1. MOVIMENTO

| azione | attivazione | funzione | cosa fa | parametri |
|---|---|---|---|---|
| corsa analogica | WASD/frecce, o stick | `humanMove` **8643** | vettore normalizzato; su tocco la magnitudine è analogica | `STICK_DEAD=12`, `STICK_FULL=46` (**8642**) |
| sprint | `Shift`, o stick oltre 66 px | `humanSprint` **8665** → `updatePlayerFisica` **10372-10380** | ×1,34 di velocità, brucia fiato 26/s, recupero 11-18/s; sotto 25 di fiato si perde fino al 14% di passo | `STICK_SPRINT=66` (**8664**), `P_SPEED=168` (**3071**) |
| accelerazione con peso | implicito | **10384-10419** | inseguimento esponenziale + limite di strappo 0,07 s + tetto `P_ACC·dt` | `P_ACC=900` (**3072**) |
| rotazione del corpo | implicito | **10438-10448** | la faccia insegue l'intenzione in 0,07 s, interpolando l'angolo | — |
| separazione morbida | implicito | **10450-10458** | spinta rigida a `P_R*2` | `P_R=13` (**2950**) |
| conduzione palla | implicito | `updateBall` **10647-10655** | la palla insegue `o.x+o.fx*CARRY_DIST` con k=14 | `CARRY_DIST=16` (**3074**) |

Non c'è nulla di equivalente a scudo, jockey umano, primo tocco, knock-on, strafe.

## 2. PASSAGGI

| azione | attivazione | funzione | cosa fa | parametri |
|---|---|---|---|---|
| passaggio | `C`/`N`, o **rilascio dello stick senza flick** | `doPass` **9063** → `eseguiPassUmano` **9090** | sceglie il compagno col punteggio `smarcato()` (**9076**: apertura dagli avversari − 260 se qualcuno è sulla linea) + bonus «è avanti» ×0,9 − scarto dalla distanza comoda 170; anticipo sulla corsa 0,32 s | vel. `clamp(300+d·0,9, 320, 520)`; carica `PASS_CAR_U=0.05` (**11897**) |
| filtrante | pulsante **piccolo** con possesso, o `E`/`,` | `doFiltrante` **9127** → `eseguiFiltrante` **9143** | mira con la levetta (o la faccia): fra i compagni con dot>0,5 vince il dot migliore, a parità il più smarcato; `b.vz=0` forzato — tesa e rasoterra | lead 0,55; vel. `clamp(380+d·1,1, 420, 640)` |
| cross | **flick trasversale** (\|ny\|>0,6) dalla metà campo offensiva, oppure **sprint tenuto + FILTRANTE/`E`** | `doCross` **9187** | punto d'atterraggio al secondo palo (`goalX∓55`, `FH/2 ± GOAL_H*0.28`), T∈[0,5;0,75], `b.vz=280·T` | `metaOffensiva` **8991** |
| appoggio corto / spazzata | tap di TIRA sotto `TAP_T` | `releaseCharge` **9225-9231** | calcio a 300 nella direzione della levetta o della faccia | `TAP_T=0.15` (**3077**) |
| passaggio forte in direzione | flick col pallone **non** verso porta e **non** trasversale | `Touch5.release` **8944** | `kickBall(...,340,0)` | soglia flick 650 px/s (**8904**) |
| rilancio del portiere | automatico | `rinvioPortiere` **11101** | al compagno più smarcato, 470 u/s, `vz=90` | `p.kickCd=0.9` dalla presa |

## 3. TIRO

| azione | attivazione | funzione | cosa fa | parametri |
|---|---|---|---|---|
| tiro col timing (tenuta) | tieni `X`/`M` o il pulsante **TIRA**, rilascia | `startCharge` **9205** / `releaseCharge` **9220** → `fireShot` **9306** | tre qualità: 1 perfetto (mira all'incrocio ±(GOAL_H/2−24), effetto `curve=corner·150`), 0 presto (debole, centrale), 2 tardi (errore angolare 9-26°) | `SHOT_MIN=0.50`, `SHOT_MAX=0.80`, `SHOT_HARDCAP=1.25` (**3077**); tecnica allarga ±45 ms (**9233**) |
| tiro col flick | flick verso la porta col pallone (nx·goalDir>0,25) | `Touch5.release` **8904-8920** | la fase è ancorata al **possesso** (`G.possT`), non al dito | `PULSE_T=0.90`, `FLICK_WIN0=0.45`, `FLICK_WIN1=0.95` (**3092, 3100**) |
| pallonetto | **sprint tenuto al rilascio del tiro** | `fireShot(...,lob=true)` **9313-9325** | potenza 330/370/430, `b.vz` 175 o 205 | — |
| tiro al volo | carica di tiro **già aperta** + pallone in arrivo a sp>200 entro `KICK_R*1.15` | `updateBall` **10777-10820** | potenza propria + `clamp(sp·0,35, 0, 220)` | — |
| rovesciata | **TIRA** con palla alta che scende in area, spalle girate | `finestraRovesciata` **9549** → `tentaRovesciata` **9571** → `risolviRovesciata` **9600** | il colpo è un `fireShot` vero; se il piede non trova la palla si cade lo stesso | `ROVE_ZC=20`, `ROVE_CAR=0.06`, `ROVE_CODA=0.36` (**9545-9547**) |
| velocità del tiro | — | `tiroVelocita` **9302** | pavimento in funzione della distanza | `TIRO_ARRIVO=[230,330,210]`, `TIRO_TETTO=860`, `TIRO_ATTR=1,0498/ATTR_K` (**9295-9297**) |

**La finestra del flick non è la finestra della tenuta.** A tenuta il «perfetto» è 300 ms su 1250 (24% se si rilascia a caso); a flick è la fase 0,45→1,0 di un ciclo da 900 ms, cioè **il 55%** (61% a tecnica 100, e con tecnica 100 il «troppo tardi» diventa irraggiungibile). Non l'ho trovato dichiarato da nessuna parte: sono due economie diverse dello stesso gesto.

## 4. DRIBBLING E FINTE

- Non esiste nessun comando di dribbling. La conduzione è passiva (**10647**).
- La **finta** (`p.fintaT`, **10159-10171**) è un **latch puramente cosmetico**: si arma da sola quando il portatore inverte la marcia a v>80 con un avversario entro 40 unità. Non tocca palla, velocità, né la probabilità di furto. Rate-limit `fintaCd=2 s`. Per l'umano la soglia è dot<0; per la CPU dot<(tecnica−62)/300.
- La **frenata** (`p.frenaT`, **10155-10158**) è l'altro latch cosmetico.
- Zero skill move.

## 5. CONTRASTO E DIFESA

| azione | attivazione | funzione | cosa fa | parametri |
|---|---|---|---|---|
| scivolata | pulsante **CONTRASTA** (senza possesso), `Z`/`B`, o flick senza palla | `doSlide` **9485** → `startSlide` **9501** → `lanciaScivolata` **9514** | si abbassa, poi parte; la mira si rifà al lancio sul pallone di *adesso* | `SLIDE_CAR_U=0.06`/`SLIDE_CAR=0.10` (**9500**), `SLIDE_T=0.20`, `SLIDE_CLEAN=0.10`, `SLIDE_REC=0.45` (**3083**) |
| esito del contrasto | — | `checkSlideContact` **10564** | pulita se `d < SLIDE_BALL_R·fatt(tackle,0,22)` **e** non da dietro **e** entro `SLIDE_CLEAN`; se no è fallo | `SLIDE_BALL_R=28`, `DIETRO_DOT=0.52` (**3087-3088**) |
| furto col corpo | **automatico** al contatto | `updateBall` **10656-10681** | prob. 0,42 per il comandato, `DIFF.steal`/`mateSteal` altrimenti; ×0,55 se di spalle | **9646-9656** |
| muro / rimpallo | automatico | `updateBall` **10744-10775** | sopra sp>420 il corpo respinge; salta se `b.z>Z_SOPRA_TESTA` | `Z_SOPRA_TESTA=26` (**2946**) |
| cartellino / espulsione | automatico sul fallo cattivo | `infliggiCartellino` **10515** | 2° giallo di squadra = 12 s fuori, mai sotto 2 uomini di movimento, mai il portiere | **3090** |
| punizione | automatico | `punizioneRapida` **10542** (zona fredda e meno di 3 falli) oppure `startFreeKick` **12200** | il duello si guadagna: zona calda (<260 dalla porta) o terzo fallo | `RAGGIO_PUNIZ=90·KPASSO` |
| contenimento (jockey) | **solo CPU** | `aiDecide` **11728-11742** | tiene la distanza `D.standoff` sul lato porta | `standoff` 54/22/**0** |

## 6. PORTIERE

Interamente automatico: `updateKeeper` **10869**. Posizionamento sulla bisettrice con uscita `clamp(d·0,10, 16, GK_AREA_X·0,62)`; lettura del tiro a **orario** (`tArr < GK_LETTURA`, **10968-10973**); raccolta `GK_RACC=0.07` poi tuffo `GK_DIVE_T=0.58` con scatto iniziale ×1,8; presa/respinta per contatto ellittico (`tentaPresa` **11035**, soglia presa 330 = `TIRO_ARRIVO[1]`); corpo a terra che copre lo 0,58 durante `recover`; rinvio automatico dopo 0,9 s. `GK_AREA_X=118`, `GK_REACH=26`, `GK_SPEED=150`, `GK_DIVE_SPEED=430` (**10843-10861**).

**Il giocatore non può mai controllare il portiere**: `resetKickoff` **7737** parte dal primo di movimento, `switchControlled` **9981** e `cambiaGiocatore` **9959** escludono `role==='gk'`.

## 7. PALLA FERMA

- **Calcio d'inizio**: `resetKickoff` **7717**, scena `kickoff` di 1,0 s (1,5 s sulle taglie grandi, **9772**).
- **Punizione-duello / rigore**: `Duel` **11927-12198**. Fasi `zone → power → wait → result`. Il tiratore mira **trascinando il dito sulla porta** (`duelMira` **12251**, pointer **12267-12305**) o con `A/S/D`; poi ferma la barra (tocco ovunque o `X`). Il portiere umano sceglie il lato nella fase `wait`. Risoluzione a **12065-12084**: `powerQ<0,25` → 40% fuori; stessa zona → parata con prob. `D.save` (0,95 se umano), dimezzata dal tiro perfetto.
- **Serie di rigori**: `avviaRigori` **10471**, `programmaRigore` **10477**, `esitoRigore` **10493**. Si arriva a oltranza dopo 40 s di golden goal (**9909**).
- **Fuori dal fondo / sopra la traversa**: `ballOverBar` **11224** — vedi §C, non si raggiunge.
- **Non esistono** corner, rimesse laterali, rinvii dal fondo comandati, barriera, fuorigioco. Il campo è una gabbia: `ballWalls` **11126** rimanda tutto.

## 8. CAMBIO UOMO E TATTICA

- Manuale: pulsante **CAMBIO** (senza possesso) o `Q`//`. `cambiaGiocatore` **9956** cicla **per angolo** attorno al pallone (non per distanza), con `swLock=0,75 s`.
- Automatico: `switchControlled` **9973**, isteresi 0,2 s + margine 14 unità.
- **Con il pallone il pulsante CAMBIO non c'è** (`touchBtnLayout` **8799-8804`): su telefono, in possesso, non si cambia uomo.
- **Tattica: non esiste.** Nessun modulo scegliibile, nessuna mentalità, nessun dpad. `formation` **7629** legge il modulo fisso della taglia. L'unica «tattica» è il cervello di squadra automatico `teamBrain` **11545** (stati ATTACCO/COSTRUZIONE/DIFESA/PRESSING/CONTESA/GESTIONE, ruoli ultimo/pressa/raddoppio/punta/libero, `RUOLO_MIN=1.5`, `PUNTA_X=0.70`, `BRAIN_HZ=0.25`).

---

# (a) AZIONI ESPOSTE AL GIOCATORE UMANO — 16, tutte verificate

| # | azione | verificata come |
|---|---|---|
| 1 | movimento analogico | sonda touch: lo stick nasce e comanda |
| 2 | sprint | letto in `humanSprint`; **non misurato a numeri** |
| 3 | passaggio (tasto o rilascio) | ✅ misurato: pallone in volo a 354 u/s dopo un rilascio semplice |
| 4 | filtrante | ✅ misurato: `stats.filtranti[0]` 0→1 con `E` |
| 5 | cross (Shift+`E`) | ✅ misurato: `stats.cross[0]` 0→1 |
| 6 | cross (flick trasversale) | ✅ misurato: flick a 852 px/s → `cross` +1 |
| 7 | tiro a tenuta | ✅ misurato: pulsante TIRA → `tiri` +1 |
| 8 | tiro a flick | ✅ misurato: flick a 725 px/s → `tiri` +1 |
| 9 | pallonetto | ✅ misurato: `stats.pallonetti[0]` 0→1 |
| 10 | tiro al volo | ✅ misurato **solo** con carica preesistente (`volee` 0→1) — vedi §C-4 |
| 11 | rovesciata | ✅ misurato: `rovesciate` 0→1 con pallone alto in discesa e `X` |
| 12 | appoggio corto (tap) | letto in `releaseCharge`; **non misurato** |
| 13 | scivolata (tasto/pulsante) | letto; **non misurato isolatamente** |
| 14 | scivolata (flick) | ✅ misurato: flick a 1178 px/s → `chargeKind==='scivolata'` |
| 15 | cambio uomo | letto; **non misurato**: `G.ctrl` non è esposto da `__test` |
| 16 | duello: mira col dito, barra di potenza, tuffo del portiere | letto **11927-12305**; **non misurato** |

Più: pausa (`Esc` / bottone ‖), salto di moviola e ripresa (tasto o tocco), e fuori partita amichevole/torneo/stagione/rosa/negozio/campi/trofei/statistiche/impostazioni.

---

# (b) AZIONI CHE IL CODICE SA FARE MA CHE NESSUN GIOCATORE VEDE MAI

**Misura: 12 partite CPU-vs-CPU** (3× 5v5 Normale, 3× 5v5 Duro, 3× 7v7 Duro, 3× 11v11 Duro), tabellini sommati:

```
tiri 204 · inPorta 53 · perfetti 167 · parate 50 · rubate 17 · falli 21 · gialli 21 · espulsi 7
filtranti 0 · cross 0 · pallonetti 0 · volee 0 · rovesciate 0
```

**b1. `doCross` (9187) — nessun ramo della CPU.** Già noto, confermato: 0 cross in 12 partite. L'unica chiamata è da `Touch5.release` **8940** e da `doFiltrante` **9137**, entrambe umane.

**b2. `eseguiFiltrante` (9143) — nessun ramo della CPU.** Caso nuovo, dello stesso tipo. La CPU passa solo con `eseguiAiPass` **11901**, che è un algoritmo *diverso e più povero*: somma le distanze dagli avversari e la progressione, e **non guarda mai se la linea di passaggio è libera** — mentre `smarcato()` **9076**, che l'umano usa, penalizza di 260 chi ha un avversario sulla linea. Due algoritmi di passaggio nello stesso file, e la CPU ha quello cieco.

**b3. Il pallonetto (`fireShot(..., lob)` 9313).** L'unico chiamante con `lob` vero è `releaseCharge` **9243**. `sparaTiroCpu` **11891** e `Touch5.release` **8918** chiamano `fireShot` a quattro argomenti. 0 pallonetti in 12 partite.

**b4. La rovesciata (9549-9618) è formalmente aperta alla CPU (10313-10322) e di fatto chiusa.** `finestraRovesciata` richiede un pallone il cui **apice sia ≥ 20 unità** (`disc = 1120·(z_apice − 20) ≥ 0`). Le uniche sorgenti con quell'apice sono il **cross** (vz 140-210 → apice 17,5-39,4) e il **pallonetto** (vz 175/205 → apice 27,3/37,5): entrambi umani. Tutto il resto arriva al massimo a 15,1 (quota finta dei tiri forti, `kickBall` **9008**), 10,8 (respinte e rimpalli) o 7,2 (rinvio). **Misurato: in una partita CPU-vs-CPU intera la quota massima del pallone è 14,29.** Quindi il ramo CPU della rovesciata può accendersi solo *dopo un cross o un pallonetto umano*: in CPU-vs-CPU è codice morto, e la clip `rovesciata` (`poseRovesciata` **4163**, con la sua scia e la sua polvere) non compare in nessuna fotografia di banco.

**b5. Il contenimento (`p.contieni`, 11728-11742).** Vive solo se `isCpuTeam && D.standoff>0`. A **Duro `standoff=0`**, quindi il pressing di contenimento non esiste alla difficoltà su cui si fanno quasi tutte le misure. E per i compagni IA di una squadra **umana** `isCpuTeam` è falso: il `Math.random()` di riga **11729** viene tirato, consuma il flusso del generatore, e il risultato non lo legge nessuno.

**b6. `tryKeeperSave` (11123) è una funzione vuota chiamata ogni fotogramma** da `updateBall` **10719**.

**b7. Il bersaglio della scivolata a flick è calcolato e buttato via.** In `Touch5.release` **8921-8933** dieci righe cercano l'avversario migliore nel cono del flick, e poi:
```js
if(best){ startSlide(p, nx, ny); return; }
startSlide(p, nx, ny); return;   // scivolata comunque nella direzione del flick
```
I due rami sono identici: `best` non entra da nessuna parte. La scheda «flick sull'avversario» promette una mira che il codice ha scritto e non usa.

**b8. Le `palla:` delle clip del rig.** `pallaCalcio` **3900**, `pallaFinta` **4074**, `pallaRovesciata` **4213**, `pallaParata` **4261**, `pallaTuffo` **4404**, `pallaPresa` **4450**, `pallaRinvio` **4501** sono raggiunte solo da `disegna()` quando `look.palla!==null` — e in partita `rigLook` **24012** scrive `palla:null` sempre. Vivono solo nel banco del rig (`bancoPosa` **5950**, esposto da `Rig3D.banco`). È una scelta dichiarata (la palla vera la disegna `drawBall`), ma sono ~250 righe di cinematica del pallone che nessun giocatore vedrà mai.

**b9. La minimappa NON è toccabile.** Il briefing la elenca fra i comandi; nel codice `TOUCH_ZONE` con `tipo:'minimappa'` (**25003**) esiste solo per l'export `__test.comandiTouch` e per le regole di scarto dell'HUD. `Touch5.start` **8815** conosce due cose: i pulsanti e lo stick. **Misurato**: un `touchstart` sul centro della minimappa (56, 379) fa nascere uno **stick** esattamente lì. Un dito sul radar muove il giocatore.

---

# (c) AZIONI CHE NON ESISTONO

Movimento: scudo, jockey umano, primo tocco/knock-on/effort touch, ferma-palla, strafe/agile dribble, sprint controllato.
Passaggi: campanile, lofted/driven/lobbed/precision a comando, swerve, esterno, dummy, pass-and-go, trigger run, richiamo del compagno. Delle 7 famiglie di FC 25 ne esistono 3 (raso terra, filtrante, cross) e nessuna ha varianti.
Tiro: tiro di precisione e tiro potente come gesti distinti (esistono solo le 3 qualità del timing).
Finte: finta di tiro, finta di passaggio, finta di tiro in tiro. Nessuna. La `finta` del rig è solo disegno.
Difesa: cambio manuale/a icona, spinta, steal tackle, fallo professionale, scivolata dura come gesto separato, spazzata tecnica, spallata, contenimento umano, pressing parziale, contenimento del compagno, sprint jockey, rialzarsi in fretta.
Portiere: **nessun comando**. Niente uscita comandata, niente rush-to-contain, niente scelta di rinvio/lancio/palla a terra, niente «muovi il portiere», niente copri-il-palo.
Palla ferma: barriera, corner, rimesse, rinvii dal fondo, punizioni con reticolo sul campo (la punizione è un minigioco astratto, non una battuta in campo).
Skill move: zero su sessanta.
Tattica: zero su venti. Nessun modulo, nessuna mentalità, nessuna istruzione di squadra.

---

# IL GUADAGNO PIÙ ECONOMICO: SCRITTO E MAI RAGGIUNGIBILE

Ordinato per rapporto valore/costo.

**1. `doCross` senza ramo CPU** (**9187**) — già noto. La CPU non crossa mai. Costo: un ramo in `aiCarrier` **11803**, condizione «sono sull'esterno in metà campo offensiva e ho un compagno in area».

**2. `eseguiFiltrante` senza ramo CPU** (**9143**) — stesso identico buco, mai segnalato. Costo: identico. Effetto collaterale: il passaggio della CPU comincerebbe a leggere le linee di passaggio.

**3. La TRAVERSA non può essere colpita, e la palla non può essere ALTA.** Questo è il caso più netto che ho trovato.
`ballWalls` **11144-11159** riconosce la traversa con `Math.abs(b.z-GOAL_Z)<7` cioè **z > 45**, e `ballOverBar` **11224** con `b.z > GOAL_Z = 52` (**2937**).
Le quote che il gioco sa produrre, dalla lettura di **ogni** assegnazione di `b.vz`:

| sorgente | vz | apice |
|---|---|---|
| quota finta dei tiri forti, `kickBall` **9008** | ≤130 | **15,1** |
| cross, `doCross` **9197** | 140-210 | **39,4** |
| pallonetto, `fireShot` **9318** | 175/205 | 37,5 |
| rinvio del portiere **11114** | 90 | 7,2 |
| respinta del portiere **11082** | 40-110 (da z≤34) | ≤44,8 |
| rimpallo sul corpo **10758** | 50-110 (da z≤26) | ≤30,8 |

Il massimo assoluto costruibile è **44,8**; la soglia è **45**. **Misurato**: 14,29 in una partita CPU-vs-CPU intera; 37,64 sul cross più lungo possibile (11 contro 11) e 35,82 sul pallonetto perfetto. Quindi:
- `showBanner('TRAVERSA!')` **11156**, con `scossa(9.0, 0.30, 0, -1)` — la scossa più forte del gioco dopo la rete — **non si accende mai**;
- `ballOverBar` **11224** e il suo banner `'ALTA!'` **non si accendono mai**: un tiro sbagliato non può uscire sopra la porta, torna sempre dalla sponda;
- di conseguenza la traversa **non ha corpo**: `hitPosts` **11185** esce se `b.z > GOAL_Z`, condizione che non si verifica mai, quindi i quattro montanti sono cilindri sempre solidi e il traverso è aria.
Il rimedio è una riga: abbassare `GOAL_Z` da 52 a ~34 (che è già `Z_SOPRA_PORTIERE`), oppure alzare la quota dei tiri forti. Costo: zero al fotogramma. Guadagno: due eventi già scritti, con audio, scossa, particelle e banner, che entrano in gioco.

**4. Il «tiro al volo» come lo descrive la scheda è impossibile.** La lavagna del mister (**2803**) dice «tieni il tiro **prima** che la palla arrivi». `startCharge` **9209** rifiuta di aprire la carica se il pallone dista più di `KICK_R*1.4`.
**Misurato**, tasto premuto con pallone fermo a distanza crescente: `20→sì, 30→sì, 36→sì, 37→no, 40→no, 60→no, 120→no`. Soglia esatta 36,4 unità.
E poiché il volo pretende `p.charge ≥ TAP_T = 0,15 s` (**10785**), in 0,15 s un pallone a 300 u/s percorre 45 unità: quando la carica matura, il pallone è già passato — o è già stato raccolto da `updateBall` **10827** (`d<20,8`, che non esclude chi sta caricando).
**Misurato**: premendo `X` con il pallone in arrivo a 200 unità, `charge` resta −1, `volee` resta 0, e il pallone finisce in possesso. Il volo si accende **solo** se la carica era già aperta da prima (misurato: 1 volée), cioè entro i 1,25 s di `SHOT_HARDCAP` da una pressione fatta a meno di 36 unità dal pallone. È un gesto reale ma indocumentabile e non insegnabile. Rimedio: consentire l'apertura della carica a distanza (o quando il pallone *sta arrivando* verso di me), ed escludere chi ha una carica di tiro aperta dal ramo di raccolta.

**5. Il pallonetto non serve a niente contro la CPU, e la CPU non lo usa.** `Z_SOPRA_PORTIERE=34` e l'apice del pallonetto è 37,5: la finestra utile è di tre unità e mezzo attorno all'apice. Con `TIRO_ATTR` che scala col campo, a 11 contro 11 la geometria non cambia. Vale la pena misurarlo (io non l'ho misurato: **non ho verificato quanti pallonetti superino davvero il portiere**).

**6. Il tutorial insegna 4 gesti su 11.** `Tut.steps` **29120-29125**: move, pass, shot, slide. Non insegna sprint, filtrante, cross, pallonetto, volo, rovesciata, cambio uomo. Sette gesti che il gioco ha e che un giocatore nuovo non scoprirà: quattro di questi (filtrante, cross, pallonetto, volo) sono *l'intera* profondità offensiva del gioco. E il tutorial si spegne al primo gol o dopo 10 s (**29157-29162**).

**7. Codice morto minore** (righe, non meccaniche): `b.saveRolled` scritto in 9 punti e **letto in zero** (residuo del portiere a dadi); `p.lob` **7591** dichiarato e mai usato; `p.homeX/homeY` **7547** dichiarati e mai usati; `G.stats` inizializzato a **6386** senza `filtranti/cross/rovesciate` (li aggiunge solo `startMatch` **7774**); `__test.setTouchButtons` **30466** è uno shim che non fa niente; `SAVE.touch` letto e ignorato (**8976**).

---

# TRE COSE CHE NON HO VERIFICATO, E LO DICO

1. **Il cambio uomo a numeri.** `G.ctrl` non è esposto da `__test`: ho premuto `Q` e non ho potuto leggere l'effetto. Ho verificato solo per via indiretta che il giocatore che manipolavo *era* il comandato (una carica di tiro si apre solo su di lui).
2. **Il duello (punizione e rigori) da dito.** L'ho letto riga per riga (**12251-12305**) ma non l'ho pilotato: nessuna misura sul mirino, sulla barra, sulla scelta del portiere.
3. **Lo sprint, l'appoggio corto (tap) e la scivolata da tasto** li ho letti, non misurati isolatamente.

E una precisazione sul metodo: le sonde manipolano lo stato *a runtime* (posizioni, possesso, quota del pallone) per portare il gioco nella condizione da provare. Questo dimostra che **il percorso di codice si accende**; non dimostra che quella condizione si presenti spontaneamente in una partita vera. Per cross, filtrante, pallonetto e volo la distinzione conta: sono raggiungibili, ma quanto spesso capitino a un giocatore vero **non l'ho misurato**.