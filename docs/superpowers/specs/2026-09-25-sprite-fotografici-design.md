# Voce #158 — Le figure fotografiche (sprite da Nano Banana) al posto del rig

**Merge-base:** `10e037e` (ramo `figure-giro-4`). **Data:** 25 settembre 2026.
**Mandato del committente (testuale):** «utilizza solo ed esclusivamente
fable e se necessario blender o il connettore chrome per scaricare da pexel
o da nano banana con account Google già loggato, mi devi dare dei
personaggi di qualità realistica» — dopo aver giudicato il rig procedurale
(«fanno pena») e fermato il giro artefice/giuria («stai andando in un loop»).

## 1. La decisione

Le figure in campo si disegnano con **sprite fotografici** generati con
Nano Banana (Gemini Images), tinti dal gioco con i colori della squadra;
il rig procedurale (`Rig3D`) resta nel file come **ripiego** (atlante non
ancora decodificato, camera bassa dei rigori e della ripresa del gol, menu
e duello) e come termine di paragone A/B (`window.__test.spriteOn`).

Perché sprite e non rig migliorato: quattro giri di correzioni al rig
(#155-#157) non hanno cambiato il giudizio del committente; una figura
fotografica a 50 px è un'altra classe di realismo (scatto appaiato:
`strumenti/_158-prove/partita-sprite.png` contro `partita-rig.png`).
La voce #151 aveva scritto «gli sprite non convengono»: la ragione era la
tinta (un solo arco di colore addosso). Qui è risolta alla radice: **la
maglia è bianca e i calzoncini magenta nello sprite**, e il gioco li tinge
per luminanza con la prima e la seconda tinta della squadra
(`Sprite3D.tela`), con strisce e fascia come il rig. Le sedici divise
restano distinguibili (`_q-divise` in batteria).

## 2. Che cosa NON cambia (invarianti)

- **La partita è identica al bit** con e senza sprite: `Sprite3D` non
  consuma un sorteggio e non legge stato di simulazione. Lo verificano
  `_q-determinismo`, `seme.js` e il rubinetto A/B. **MOTORE_V resta 6.**
- **Zero rete, un file solo**: l'atlante entra come data-URI (WebP con
  alfa + PNG delle maschere), +~270 kB sul file con 6 clip (misurato:
  2 948 049 → 3 223 455 byte con 64 fotogrammi).
- La camera **'bassa'** (rigori, ripresa del gol) resta al rig: lo sprite
  non ha quell'angolo e non deve fingere.

## 3. La catena di produzione (tutta in `strumenti/sprite/`)

`PROMPT.md` (prompt e metodo) → `fuori/sprite/ingresso/<foglio>.png`
(non tracciati) → `foglio.py` (8 celle per foglio, spacca le figure che
si toccano, pulisce i frammenti della vicina) → `ritaglia.py` (chroma key
con alfa sfumato ed erosione di 1 px, spurgo pieno del verde, maschera
MORBIDA della maglia = poco saturo e non nero, maschera dei calzoncini =
magenta, neutralizzati in grigio) → `atlante.py` (griglia 144 px,
altezza soggetto 128 px, seconda metà del ciclo di corsa/camminata per
SPECCHIO della direzione opposta, `atlante.json` con ancora dei piedi e
altezza per cella) → `monta.py` (rifà tutto da `piano.json`) →
`_toppa-158-sprite.js` (incorpora `sprite3d.js` e i dati, cinque ancore).

## 4. Le misure che hanno deciso i numeri

- **Scala**: `_158-misura-scala.js` — a hCss 420 il rig 'fermo' è alto
  429/438/449/465 px sulle quattro imbardate, lo sprite 417: rapporto
  medio 1,067; il punto più basso del rig sta 60-75 px sotto l'ancora
  (la punta del piede verso la camera si proietta a 0,118 hPx a 42°).
  Prima taratura 1,08 / +0,05 hPx; sullo scatto di partita l'uomo snello
  leggeva piccolo accanto alle capsule gonfiate del rig → **1,15 /
  +0,04 hPx**. È un compromesso di leggibilità, scritto accanto al numero.
- **Direzione**: 8 settori di 45° da `yaw − π/2` (= `p.ang`); d0 fronte,
  d2 profilo destro, d4 dorso, d6 profilo sinistro. Verificata a vista nel
  provino accanto al rig (`_158-confronto.js`).
- **Tinta**: soglia dura sulla luminanza lasciava chiazze grigie nelle
  pieghe (foglio nb02) → maschera morbida `(0,26−sat)/0,10 · (lum−70)/40`;
  orlo viola sui calzoncini → neutralizzazione con maschera allargata.

## 5. Che cosa manca, dichiarato

- **Fogli mancanti** (quota Gemini esaurita alle ~18:45, torna alle
  19:42): corsa 2ª fase, tiro follow-through, contrasto, attesaGK, tuffo,
  parata, frenata, testa, esultanza, delusione. Finché mancano,
  `Sprite3D.ALIAS` presta la clip più vicina (tabella nel modulo, letta
  da `window.__test.sprite.prestiti`): in campo le due grafiche non si
  mescolano mai.
- **L'angolo**: gli sprite escono a ~20-25° di elevazione, il rig a 42°.
  Il generatore non ha obbedito a nessuna formulazione dei 45° (4 prove,
  in `PROMPT.md`). Effetto: la figura fotografica è un po' più «in
  piedi» sul campo in pianta di quanto fosse il rig.
- **L'ombra portata** la disegna ancora `drawOmbreGiocatori` dalla posa
  del rig: con lo sprite la sagoma dell'ombra e quella dell'uomo possono
  non coincidere (visibile nello scatto: ombra con le braccia alzate,
  sprite in corsa). Cura in un compito suo.
- **Un uomo solo**: stesso volto, stessa pelle, stessi capelli per tutti.
  `look.pelle`/`look.capelli` non hanno ancora una maschera nello sprite.
- **Il mancino** (voce #155) non esiste nello sprite: specchiare il tiro
  darebbe il sinistro gratis, ma va cablato a `look.manc`.
- **Prestazione**: la tela tinta si prepara alla prima figura di ogni
  divisa (un passaggio sui pixel dell'atlante, 1152×1152 con 64 celle).
  Misurato (`_158-costo-tinta.js`, Chromium headless su PC): **35-49 ms
  per divisa**, tre divise a partita (due squadre più i portieri) alla
  prima figura; `disegna()` costa **7 µs per figura**. Su Android 10 la
  tela puo' costare 4-6 volte tanto: un singhiozzo di mezzo secondo al
  primo fotogramma, che cade dentro la tendina del cambio schermata.
  Seguito: preparare le tele durante la tendina (`Sprite3D.prepara`) e
  misurare con `prestazione.js` su telefono.
- **I cancelli adattati** (non silenziati): `_q-divise` e `istantanea`
  dipingevano la maschera nera con `Rig3D.disegna` — con gli sprite la
  maschera non coincideva coi pixel e l'istogramma pescava l'erba (tinte
  dominanti «a 10°»): ora chiedono la maschera a `Sprite3D` con lo stesso
  look nero, e passano la corporatura e la mano della figura (anche il
  rig ne guadagna). Il falso `_crit-158-divise-uguali` (maglie tutte
  rosse) viene condannato: 0/4 istanti, TV 0,405. `collaudo` misurava il
  contrasto maglia/erba a 0,52-0,58 dell'altezza dello sprite (la cintura
  dei calzoncini): la finestra sale a 0,60-0,65 quando gli sprite sono
  accesi, e la stoffa fotografica, più scura della tinta piatta, viene
  schiarita (gamma 0,72 + 18% verso il bianco caldo, lo stesso bilancio
  del rig) fino a ripassare il 3:1 — numeri nei riquadri di `Sprite3D.tela`.
- **`silhouette` è ROSSO (6/10) anche senza la toppa, e non è degli
  sprite**: il banco `?banco=silhouette` disegna col rig. Su HEAD
  `10e037e` è VERDE 8/10: il 6/10 nasce nelle 654 righe del #157 giro 4
  non committate che il ramo porta con sé (misurato, non presunto).
- **`istantanea`**: 42/56 con gli sprite come prima (ombre 5→4, centro
  sera 7→8): la colonna delle ombre risente della sagoma dell'ombra
  portata, che resta quella del rig.
