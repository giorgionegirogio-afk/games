# COSA MANCA — l'inventario onesto

**Data:** 20 agosto 2026. **Gioco:** `CALCETTO-il-gioco.html`, **1.794.676 byte,
32.323 righe** (contate da me oggi). **APK:** `apk/CALCETTO.apk`, 664.406 byte.

Questo documento sintetizza otto revisioni indipendenti più un critico della
completezza. Ogni numero porta la sua fonte: `[R:nome]` = rapporto di quel
revisore; `[critico]` = il critico della completezza; `[io]` = misurato o letto
da me oggi nel codice; `[doc:file:riga]` = citazione da un documento del
progetto. Dove non c'è misura c'è scritto **non misurato**, e vale più di una
stima.

---

## 1. LA RISPOSTA IN TRE RIGHE

Il gioco è finito al **41,5%** rispetto al mandato — media aritmetica delle otto
quote che gli otto revisori hanno dichiarato ciascuno sulla propria dimensione
(32 · 45 · 35 · 38 · 55 · 60 · 22 · 45), e va letta per quello che è: **la media
di otto autodichiarazioni con otto metri diversi, non una misura**.

La forma del divario è netta e ripete quella che il progetto aveva già trovato:
il gioco vale **molto più fotografato che giocato**. Le dimensioni che stanno
sopra la metà sono quelle del contorno (contenuti 55%, diritti 60%); quelle che
stanno sotto un terzo sono la presentazione contro FC 25 (22%) e i comandi
(32%) — cioè esattamente le due metà della frase «utilizzabile, competitivo e
facile da utilizzare anche su android mobile».

Il criterio di accettazione che il committente ha fissato — 26 giudici a 8-9
mentre i concorrenti stanno a 3-4 — **non è misurato su nessuna delle due metà**:
l'ultimo voto scritto è 8,2 del 18 agosto `[doc:PUNTO-DEL-LAVORO.md:28]`, precede
tutto ciò che è entrato dopo, e la rivotazione è dichiarata aperta (#25). I
concorrenti non li ha misurati **mai nessuno**, in nessun documento del progetto.

---

## 2. LE CINQUE COSE CHE VALGONO DI PIÙ

Non le più urgenti: le più **pesanti**. Sono ordinate per quanto sposterebbero il
voto di una giuria che guarda e prova, non per quanto costano.

### 2.1 — Il motore d'ingresso è stato costruito e non è collegato a niente

**Cosa c'è oggi.** L1.1 è dentro ed è verde: punto di posa, anello di 8
posizioni, scarto degli ultimi 60 ms, `R_ARMA` che cresce da 22 a 36 px,
annullo per spostamento a 96 px, ri-armo sul cambio di contesto. Il cancello
`_q-l11.js` dà 8/8 e le sue prove A e B sono state rifatte oggi `[R:comandi]`.

**Cosa manca.** `Touch5.trascina()` **non è chiamato da nessuna riga del gioco**:
verificato da me oggi — in 32.323 righe la sola occorrenza non-commento è la
definizione a `:9653`, e il commento a `:9562` lo dichiara in chiaro («arriverà
dopo e leggerà Touch5.trascina») `[io]`. Il trascinamento viene calcolato e
buttato via a ogni fotogramma. Sopra questa spina dorsale il progetto approvato
ha quattro voci (L1.2 contrasto in piedi/contenimento/scivolata armata, L1.3
mira tangenziale e rampa continua di potenza, L1.4 bias del passaggio con
margine δ, L1.5 cambio direzionale e raddoppio) e **nessuna delle quattro è
scritta**. Il contesto NOI non esiste come concetto: i dischi hanno due stati
binari, non tre, quindi mentre il compagno porta palla i tuoi dischi ti offrono
di **scivolare durante la tua stessa azione offensiva** `[R:comandi]`. Dei 26
verbi della tabella §4 di `agente28.md` ne sono vivi **7**, e 3 dei 7 arrivano da
un ingresso diverso da quello progettato `[R:comandi]`.

**Come si misura che è fatta bene.** Un grep che conti i call site di
`Touch5.trascina(` fuori dalla definizione: oggi **0**, e deve essere ≥ 4. Poi il
cancello G2 di `agente28.md` §11: 1500 pressioni sintetiche con vero
`TouchEvent`, anteprima letta **dai pixel**, `anteprima ≠ esito ≤ 2%`, verbo base
≥ 0,98, errori di contesto ≤ 2%, più la clausola di entropia (ogni nome fra il 3%
e il 60% delle pressioni). Oggi G2 **non è nemmeno scrivibile**, perché
l'anteprima che dovrebbe leggere dai pixel non esiste.

### 2.2 — La figura in movimento: i giunti si teletrasportano a ogni cambio di clip

**Cosa c'è oggi.** 21 clip di posa (contate da me oggi nel blocco `const CLIPS`,
righe 4931-4954: sono **esattamente 21**, non 22 e non 23 come scrivono due
documenti `[io]`), tutte pose vere — ogni giunto si muove, nessuna è una
traslazione — e la gabbia delle proporzioni è verde su 21×64×4 combinazioni
`[R:animazioni]`.

**Cosa manca.** **Nessuna fusione fra clip.** `Rig3D.disegna` valuta una sola clip
a un solo istante e `rigStato` restituisce `(clip, u)` senza memoria: verificato
da me che nel rig non esiste un solo `blend`, `prevClip` o stato di transizione —
l'unica occorrenza di «blend» in tutto il file è a `:12769` e parla di formazioni
dell'IA `[io]`. Misurato: sui cambi di clip il giunto peggiore salta di **0,504 m
mediani, p95 1,070, massimo 1,588** su una statura di 1,90 m in un sessantesimo
di secondo, contro **0,043 m** a clip invariata — cioè **11,7 volte tanto**
`[R:animazioni]`. E le tre andature hanno soglie dure senza isteresi: su 2 partite
5v5 il gioco fa **1.567 cambi camminata→corsa** con salto medio 0,477 m, e il
portiere sfarfalla fra attesa e camminata più di seicento volte a partita
`[R:animazioni]`. Le quattro clip di locomozione sono il **95,34%** di tutte le
figure disegnate a 11 contro 11 `[R:animazioni]`.

**Come si misura.** Mediana e p95 del salto del giunto peggiore fra due fotogrammi
consecutivi, separando clip invariata da clip cambiata (la sonda esiste già in
scratchpad). Cancello: la mediana sui cambi non deve superare quella a clip
invariata di più di 3× — oggi è 11,7×. E il conto dei cambi camminata↔corsa per
partita: da ~783 a partita a sotto 200, con salto sotto 0,15 m. **Prima di
prometterla va misurato il costo**: la fusione valuta due pose invece di una per
figura in transizione, e a 22 figure il margine dichiarato è 3,15-3,65 ms su 16,7
`[doc:ripresa.md:119]` — numero letto, **non rifatto da nessuno dei revisori**.

### 2.3 — La figura ferma: capsule a due tinte, senza mani, senza piedi, senza volto

**Cosa c'è oggi.** Illuminazione a due tinte per arto (ambra a ovest, viola-blu a
est, terminatore a 0,78 della larghezza del busto), contorno scuro continuo,
numero sulla maglia, alone di stacco a terra `[R:visiva]`. Cinque ritratti-figurina
distinti e verificati (`volti.js` verde oggi) `[R:visiva]`.

**Cosa manca.** Il taglio è netto: **due soli livelli di tono per costruzione** —
`lumiLook` produce `_lume` e `_ombra` e basta. Niente mani, niente piedi
(moncherini arrotondati), niente volto, niente pieghe, colletto, maniche. È il
punto su cui il provino cieco ha dato **3/10 di fattura al rig contro 4/10 al
forno Blender e 9 al riferimento commerciale** `[doc:ripresa.md:84]` — ed è il più
grande scarto misurato dell'intero progetto. La figura in partita è alta **94-111
px** e il dettaglio ravvicinato (mani con le dita, volto, cucitura, ciuffo) **non
si accende mai**: `LOD_PX` vale 120 e zero figure su 4.261 a 5v5 lo superano
`[R:animazioni]`. Cioè: il dettaglio è scritto, pagato in byte, e in partita non
esiste. Aggiungi che il numero sulla maglia è disegnato **fuori dall'ordine di
profondità** e finisce sopra la nuca quando la figura è di spalle `[R:visiva]`.

**Come si misura.** Numero di livelli di tono distinti sul busto e sulla coscia a
figura piena: oggi **2**, cancello **≥ 4**. Più il provino cieco appaiato
rig-contro-forno rifatto con la stessa cifra sul petto in tutte e due le serie
(nel provino precedente la serie del forno non ce l'aveva). E vale la regola 17
della casa: **con un giudice solo quel provino non sa distinguere**, servono due
persone e la forbice scritta accanto.

### 2.4 — Il manto: la superficie più vista del gioco arriva all'occhio ingrandita quasi due volte, a interpolazione spenta

**Cosa c'è oggi.** `paintField()` è 1.969 righe: seimila schegge d'erba
direzionali, tre passate per zona, toppe chiare e scure, ciuffi con la loro
ombra, fasce di tosatura, velatura calda e fredda secondo il verso del sole
`[R:visiva]`.

**Cosa manca.** La cottura usa lo zoom **di riposo**, non quello di gioco, e in
ingrandimento la riga `:23641` spegne il filtro — l'ho letta oggi: `const liscio =
fieldTexTS>0 && S2*DPR < fieldTexTS*0.995; if(!liscio)
ctx.imageSmoothingEnabled=false;` `[io]`. Rapporto misurato fra densità a schermo
e densità cotta: **1,853× a 5 contro 5, 2,106× a 7, 1,798× a 11** `[R:visiva]`. E
il manto occupa **l'80,7-88,8% del quadro** sotto l'interfaccia, e riempie il
quadro **intero** nel 23% dei fotogrammi a 5, nel 68% a 7, nell'**87% a 11**
`[R:visiva]`. La cura esiste già nel file — `campoVivoDisegna()` ridipinge la
finestra visibile alla scala vera — ma l'ho letta oggi ed è chiusa dentro
`if(gol && ...)` a `:23652`, quindi in partita **non si accende mai** `[io]`. Il
commento accanto dichiara perché: accenderla in partita costava il doppio del
fotogramma. È letteralmente la prima cosa che il committente nomina
(«dalle texture»).

**Come si misura.** Due numeri indipendenti, tutti e due già ottenuti una volta:
(a) rapporto densità-schermo / densità-cotta letto a runtime da `fieldTexTS` e
`S2*DPR`, cancello ≤ 1,05; (b) prova sui pixel: media di |ΔL| fra pixel
orizzontali a passo 1 e a passo 2 su un ritaglio di manto vuoto — oggi in partita
2,971 contro 4,509, **rapporto 1,52** (il dettaglio vive a due pixel), mentre nella
scena del gol, dove il fondale è cotto alla risoluzione dello schermo, il rapporto
è 1,03 `[R:visiva]`. Cancello ≤ 1,10. **Obbligatorio**: `prestazione.js --contro
HEAD` in misura appaiata sulla stessa toppa.

### 2.5 — La regia non esiste: una camera sola che non stacca mai

**Cosa c'è oggi.** Una scena madre del gol completa e ben fatta (fermo immagine,
zoom sul marcatore, ripresa in camera bassa, moviola in quattro tempi, boato,
rete che si gonfia, coriandoli, targhetta) — circa 4,4 s su 90 di partita
`[R:divario]`. Due camere esistono nel codice: `alto` a 42° e `bassa` a 16°, ma la
seconda serve solo ai rigori e alla ripresa del gol `[R:divario]`.

**Cosa manca.** Durante il gioco `updateCamera` è un inseguimento continuo con
zoom, **senza un solo taglio** `[R:divario]`. Contro: FC 25 stacca la regia
**2,16 volte al minuto** (151 stacchi su 14 finestre da 300 s, cioè il 16,6% di
sette ore campionate) e il **31,9%** dei fotogrammi campionati non ha l'HUD di
gioco, cioè un terzo del tempo è regia (51 su 160 fotogrammi contati a mano)
`[R:divario]`. E manca tutto il contorno che quella regia riempie: **pre-partita**
(uscita dal tunnel, schieramento, formazione disegnata), **schede del giocatore
in sovrimpressione** durante i primi piani, **grafica che parla durante il gioco**
(banner del marcatore, minuto, recupero, statistiche vive), **telecronaca** anche
solo come didascalie con la stessa cadenza, **arbitro** (zero occorrenze della
parola nel file, verificato da me `[io]`), **allenatore, panchina, quarto uomo**.
E la moviola ha **una sola inquadratura**, la stessa dall'alto che si è appena
vista, mentre il gioco possiede già la seconda camera e non la usa `[R:visiva]`.

**Come si misura.** Contare gli stacchi per partita (oggi **0**) e le inquadrature
distinte dentro `drawMoviola()` (oggi **1**). Cancello: ≥ N stacchi per partita,
ogni stacco leggibile (soggetto dentro il terzo centrale, contrasto ≥ 3:1), e
`prestazione.js --contro HEAD` che non peggiori il p95. Più: ogni segno nuovo va
dichiarato in `zoneInterfaccia` con la sua alfa, perché questa casa ha già pagato
che una pastiglia semitrasparente sull'erba viene letta come ombra da
`istantanea.js`.

> **La sesta, che ha mancato l'elenco per un soffio: il gioco aereo.** Sopra
> `Z_SOPRA_TESTA = 26` il pallone passa e basta — l'ho letta oggi, `:2946` per la
> costante, e il divieto è **una riga sola** dentro il ciclo di raccolta `[io]`.
> Niente colpo di testa (zero occorrenze nel file `[io]`), niente stop di petto,
> niente sponda alta. Conseguenza: i cross esistono, sono animati con una clip
> propria, e in area non li attacca nessuno — il cross diventa un modo lento di
> restituire palla ai piedi. Non è nei cinque solo perché tocca la simulazione al
> bit e va fatta dopo che i cancelli sanno essere rossi; per **visibilità** a un
> giudice sta al secondo o terzo posto.

---

## 3. L'INVENTARIO PER DIMENSIONE

| # | dimensione | quota fatta | il buco che la definisce |
|---|---|---|---|
| 1 | Comandi e verbi di gioco | **32%** `[R:comandi]` | il motore d'ingresso ha zero consumatori |
| 2 | Animazioni (rig, pose, clip) | **45%** `[R:animazioni]` | nessuna fusione fra clip; 95,34% dei fotogrammi è locomozione |
| 3 | Qualità visiva contro «AAA» | **35%** `[R:visiva]` | la texture più vista arriva ingrandita 1,8-2,1× a filtro spento |
| 4 | Fisica del pallone e dei corpi | **38%** `[R:fisica]` | sotto 420 u/s il pallone attraversa i corpi; il gioco aereo è vietato da una riga |
| 5 | Contenuti e modalità | **55%** `[R:contenuti]` | 7 e 11 non entrano in nessuna modalità di progressione |
| 6 | Diritti e monetizzabilità | **60%** `[R:diritti]` | il testo della licenza OFL non viaggia col gioco; il pulsante in euro non compra niente |
| 7 | Divario con FC 25 (presentazione) | **22%** `[R:divario]` | zero stacchi di regia contro 2,16/minuto |
| 8 | Strumenti di misura | **45%** `[R:strumenti]` | audio, salvataggio e meta-gioco: zero cancelli |

### 3.1 — COMANDI E VERBI — 32%

**Fatto e verificato oggi:** L1.1 completo (`_q-l11.js` 8/8); L0.2 `touchcancel ≠
touchend` con `release()` inerte (`_p-rilascio.js`: rilasci che producono un
calcio 0%, 120 `touchcancel` davvero arrivati alla pagina); L0.5 precedenza in
distanza normalizzata; L0.3 inserti di sistema letti da `env(safe-area-inset-*)`
più `setSystemGestureExclusionRects` nella shell Java (verificata da me a
`android/Gioco.java:250`, con la guardia `SDK_INT >= 29` a `:127` che il minSdk 24
rende necessaria `[io]`); L0.4a il pallonetto non più acceso per difetto; L0.4b le
tre guardie estratte; L0.1/G7 il banco che erra invece di ripiegare; la finta come
annullo; i sei verbi che rispondono al dito (`_p-verbi.js` 6/6). `[R:comandi]`

**Manca, in ordine di peso:**

1. **[progettato-non-scritto/grosso]** Nessun verbo legge il trascinamento — 0 call
   site verificati da me `[io]`. È l'intera Onda 1 sopra L1.1.
2. **[progettato-non-scritto/grosso]** Il contrasto in piedi non esiste: premere
   CONTRASTA lancia direttamente la scivolata. Il progetto lo chiama «la voce che
   vale mezzo voto da sola». Peggio: `puoContrastare` non guarda di chi è il
   pallone, quindi premere CONTRASTA mentre la palla è del compagno lancia
   comunque una scivolata `[R:comandi]`.
3. **[non-pensato/grosso]** Il contesto NOI non esiste: CHIAMA, chiamata mirata e
   SCATTA — tutte e tre le righe della tabella — non ci sono.
4. **[progettato-non-scritto/grosso]** Il passaggio mirato col bias `punteggio(q) =
   base + K·dot(q̂, drag̑)·min(1,|drag|/52)` e il margine δ. Oggi è un cono duro
   `dot > 0,5`, il meccanismo che il progetto dichiara ucciso dalla sua stessa
   misura (71% di coni vuoti a 5 contro 5) `[doc:agente28.md:309]`.
5. **[progettato-non-scritto/grosso]** La potenza del tiro è un verdetto a tre
   valori, non una rampa: letto da me, `:10184` `const q = (c>=SHOT_MIN-larg &&
   c<=SHOT_MAX+larg) ? 1 : (c<SHOT_MIN-larg?0:2);` e `:10287` `const TIRO_ARRIVO =
   [230, 330, 210];` `[io]`. Chi manca la finestra prende un tiro
   **categoricamente** diverso: è un cancello, non un continuo.
6. **[progettato-non-scritto/grosso]** La mira nella bocca della porta col
   trascinamento tangenziale (`MIRA_SAT` 26 px) e la tacca. Oggi la mira è la
   componente verticale della **levetta**, che porta già sei significati — e dopo
   la toppa del pallonetto ne porta uno in più di quando il progetto fu scritto.
   Il progetto chiama questo «l'arbitrato centrale» e non è stato fatto.
7. **[progettato-non-scritto/grosso]** `CARRY_DIST` funzione della velocità e
   `stealP` che smette di saturare. Verificato da me: `:3074 const CARRY_DIST =
   16;` invariato, e a `:11672` `stealP=DIFF[G.diff].steal`, che a Duro vale 1,00
   `[io]`. Sul mandato «competitivo» è la voce più pesante che manca.
8. **[non-pensato/grosso]** Tutta l'Onda 3, la scoperta: nessuna linea di
   anteprima, nessun arco, nessun rifiuto visibile, nessuna tacca, nessuna
   didascalia, nessun invito. La finta funziona e **nessuno saprà mai** che
   trascinando 96 px si annulla.
9. **[fatto-a-metà/medio]** Il cambio uomo è il ciclo orario, non direzionale:
   letto da me a `:10960`, `const ang=o=>Math.atan2(...)` con ordinamento per
   angolo `[io]`. La levetta dice già dove voglio andare e il cambio non la legge.
10. **[progettato-non-scritto/medio]** Il cross per **ampiezza** del trascinamento:
    oggi lo decide lo sprint della levetta, che è una **postura**, non
    un'intenzione. Stessa classe di difetto del pallonetto acceso per difetto,
    già pagata una volta.
11. **[progettato-non-scritto/medio]** Il bug d'ordinamento in `eseguiFiltrante`,
    che G5 pretende riparato **prima** di misurare: letto da me a `:10047-10051`,
    `if(dot>bestDot){ bestDot=dot; }` sta dentro il ramo accettato, quindi il
    vincitore dipende dall'ordine di `G.players` `[io]`.
12. **[progettato-non-scritto/medio]** La carta della mano e il **mancino**:
    verificato da me, `:8969` `const right = (G.mode===2) ? (t===1) : true;` e
    **zero occorrenze di «mancino»** in tutto il file `[io]`. `touchBtnLayout` sa
    già specchiarsi: mancano la domanda e il campo nel salvataggio.
13. **[progettato-non-scritto/medio]** La geometria dei dischi non scala con lo
    schermo e non ha il ramo a colonna. Misurato dal critico su quattro profili
    (640×360, 915×412, 1080×480, e il OnePlus 6 a 576×273 CSS con dpr 2,8125): i
    dischi sono **identici al decimo di pixel ovunque**, quindi la fascia dei
    comandi occupa il 19,9% dell'altezza sul banco e il **30,0% sull'altezza vera
    del telefono** `[critico]`.
14. **[progettato-non-scritto/medio]** Lo scambio dei ruoli fra i due dischi non è
    stato fatto, ed è stato fatto **il contrario** di quello che il progetto
    motiva con l'indice di Fitts (+83%, ~150 ms per pressione) `[R:comandi]`.
15. **[non-pensato/medio]** Sei righe della tabella §4 senza un abbozzo: scudo,
    raddoppio comandato, spazzata contestuale, chiamata del compagno, scarico,
    filtrante emergente.
16. **[progettato-non-scritto/grosso]** **Cinque cancelli su sette non esistono**:
    G2, G4, G5 come file; G3 solo come singola prova A dentro `_q-l11.js`; G6a
    (latenza al **pallone**) non esiste; G6c senza il braccio appaiato
    `[R:comandi]`.

### 3.2 — ANIMAZIONI — 45%

**Fatto:** 21 clip (contate da me `[io]`), tutte pose vere, gabbia verde su
21×64×4; le quattro clip di calcio sono quattro gesti diversi con parametri
distinti; l'impatto è sincronizzato **nel tempo** col distacco del pallone; la
rovesciata ha cronometria dettata dalla balistica, scia e polvere; il portiere ha
quattro clip più una sagoma d'attesa di ruolo; quattro esultanze più delusione,
sfasate per indice così che due compagni non facciano mai lo stesso disegno.
`[R:animazioni]`

**Manca, in ordine di peso:**

1. **[non-pensato/grosso]** Nessuna fusione fra clip (§2.2). Verificato da me:
   zero `blend`/`prevClip` nel rig `[io]`.
2. **[non-pensato/grosso]** Andature a soglie dure senza isteresi e senza
   continuità: `poseLoco` non legge `p.amp`, quindi l'ampiezza della falcata è un
   salto, non una funzione della velocità `[R:animazioni]`.
3. **[fatto-a-metà/grosso]** I verbi più costosi non si vedono mai. Censimento su
   10 partite CPU/CPU: **rovesciata 0, presa 0, filtrante 0** (raggiungibile solo
   dal dito umano), cross 1,00 a partita a 5v5 e **0 a 11v11**, parata 0,33 e 0
   `[R:animazioni]`. La giuria giudica quello che vede.
4. **[non-pensato/grosso]** **12 clip su 21 non sono mai passate dal cancello della
   sagoma.** Fuori dal provino: frenata, passaggio, filtrante, cross, finta,
   rovesciata, parata, presa, rinvio, cielo, ginocchia, pugno — cioè cinque delle
   otto famiglie che il committente ha nominato per nome `[R:animazioni]`.
5. **[progettato-non-scritto/grosso]** Nessun verbo di dribbling, e la clip
   `finta` non lo è: è un latch cosmetico di 0,5 s che non tocca palla né
   velocità né fase, e lo dice il commento del gioco stesso `[R:animazioni]`.
6. **[progettato-non-scritto/grosso]** **Colpo di testa: non esiste** — zero
   occorrenze verificate da me `[io]`.
7. **[fatto-a-metà/medio]** L'8,22% delle figure disegnate a 11v11 è a posa
   congelata (11.788 su 143.449): statue che scivolano sull'erba `[R:animazioni]`.
8. **[fatto-a-metà/medio]** La palla non è agganciata al piede: `CARRY_DIST = 16`
   davanti al bacino, a quota zero, indipendente dalla clip e dalla fase; e
   `clip.palla` è spenta in partita perché `rigLook` mette `palla:null`
   `[R:animazioni]`. Sincronizzato nel tempo, non nello spazio.
9. **[fatto-a-metà/medio]** La scatola degli angoli corregge 7 clip su 21
   (scivolata 420 correzioni su 1024 angoli, cielo 404, frenata 349, rovesciata
   320): la posa scritta nel foglio non è la posa disegnata `[R:animazioni]`.
10. **[non-pensato/medio]** Nessuna animazione dal contatto fra due corpi: la
    separazione è una spinta posizionale di mezza compenetrazione. Due corpi si
    attraversano e si respingono come dischi, e il duello è la scena che il gioco
    fotografa di più `[R:animazioni]`.
11. **[non-pensato/medio]** Stop di petto / primo controllo orientato: la fisica
    può sporcare il primo tocco, il corpo non lo mostra.
12. **[non-pensato/medio]** Nessun **arbitro** in campo (0 occorrenze `[io]`),
    nessun giocatore a terra dolorante, nessuna panchina: l'espulso viene
    teletrasportato fuori e **non viene disegnato affatto**.
13. **[fatto-a-metà/medio]** La punizione-duello riusa due sole pose per il
    tiratore, senza barriera, senza rincorsa, senza piazzamento.
14. **[non-pensato/medio]** Tiro al volo e pallonetto non hanno una posa propria:
    riusano `tiro`. Il gioco promette un banner, una statistica e un traguardo
    d'oro, e il corpo fa lo stesso identico gesto.
15. **[non-pensato/piccolo]** Nessun moto secondario: capelli, maglia,
    calzoncini, calzettoni rigidi.
16. **[fatto-a-metà/piccolo]** Il salto dell'esultanza muove l'alone a terra e la
    targhetta, **non il corpo** — sbagliato in tutte e due le direzioni.
17. **[progettato-non-scritto/piccolo]** Rimessa, corner e rinvio come situazioni:
    scelta dichiarata in `agente28.md` §8.3, **da difendere davanti alla giuria,
    non da nascondere**.

### 3.3 — QUALITÀ VISIVA — 35%

**Fatto:** venti sottosistemi su ventidue verificati nel codice e funzionanti;
manto procedurale, gesso col registro dei tratti, porte con rete a due
comportamenti, pallone con cuciture e ombra che si stacca, tribuna viva
(728/976/1345 sagome, `folla.js` 5/5), cartelloni che si accendono di sera, ora
del giorno che scorre, otto campi con otto impianti di luce, particelle a sei
famiglie, scena del gol dedicata, moviola con bande cinematografiche,
post-produzione povera ma coerente (grana cotta una volta, vignettatura uno a
uno, bloom locale), ombre coerenti col sole dichiarato. **Zero materiale coperto
da diritti**: due sole `data:image` in 1.794.676 byte, entrambe SVG. `[R:visiva]`

**Manca, in ordine di peso:**

1. **[fatto-a-metà/grosso]** Il manto ingrandito quasi due volte a filtro spento
   (§2.4).
2. **[progettato-non-scritto/grosso]** La luce sulla figura è un taglio netto a
   due tinte (§2.3).
3. **[fatto-a-metà/grosso]** Il mondo costruito ai bordi **non entra quasi mai in
   quadro**: mediana di manto nel quadro 92,0% a 5v5, **100,0% a 7 e a 11**, e i
   fotogrammi senza un solo pixel di tribuna/cartellone/quartiere sono il 23%,
   68%, **87%** `[R:visiva]`. Alle taglie che il committente ha chiesto per nome,
   il gioco è un rettangolo verde vuoto per la grande maggioranza del tempo.
4. **[fatto-a-metà/grosso]** Il banco che dovrebbe riscrivere questo voto — il
   fermo immagine — oggi **si dichiara non valido da solo**: «IL BANCO NON HA
   OTTO CAMPIONI: 1 coppie di istanti sono lo stesso fotogramma» `[R:visiva]`.
5. **[fatto-a-metà/medio]** Divise contro erba: il cancello passa sul **mucchio**
   mentre 2 partite su 3 stanno sotto il minimo (P1 3,25:1 nel mucchio, peggiore
   2,60:1). È una scelta dichiarata, non una bugia — ma il numero va spostato
   sulla peggiore, e la causa vera («non è il colore ma **dove** cade l'azione nel
   fotogramma») va tolta `[R:visiva]`.
6. **[non-pensato/medio]** **Meteo: non esiste niente.** Zero pioggia, neve, vento,
   nebbia, manto bagnato, riflessi — verificato da me, zero occorrenze di «meteo»
   `[io]`.
7. **[fatto-a-metà/medio]** Due pittori di prato diversi (`paintField` e
   `duelFondo`) con tinte e ore diverse: chi guarda la partita e poi il gol vede
   due erbe a mezzo secondo di distanza. Il file lo dichiara e dice che il difetto
   è già tornato una volta in giuria `[R:visiva]`.
8. **[fatto-a-metà]** Il cielo nelle due scene in tre quarti è un gradiente a due
   soste, quasi nero, senza nuvole, orizzonte, struttura di stadio o torri faro.
9. **[non-pensato]** Volto in campo: teste senza occhi, naso o bocca, a nessuna
   scala e in nessuna scena — nemmeno nel primo piano dell'esultanza.
10. **[non-pensato]** La moviola ha una sola inquadratura (§2.5).
11. **[fatto-a-metà/piccolo]** La cifra sulla maglia galleggia sopra i capelli
    quando la figura è di spalle.
12. **[fatto-a-metà/piccolo]** Il pallone non ha speculare né terminatore morbido:
    3 gradini di luminanza lungo il diametro, cancello proposto ≥ 5.

### 3.4 — FISICA — 38%

**Fatto:** attrito riscalato sulla taglia del campo; quota finta con gravità 560
e restituzione ~0,42 (misurata su tre rimbalzi in fila); L2.2a l'attrito solo a
terra è entrato e **funziona** (400 u/s conservate per 20 fotogrammi in volo);
L2.2b il primo tocco si sporca (4,5% / 3,9% / 3,2% su 16 partite, coerente col
4,0% dichiarato e verificato indipendentemente); pali con corpo vero risolti sul
segmento del passo; traversa come evento geometrico; portiere come corpo vero che
arma il tuffo su un **tempo**; contrasto in scivolata con esito geometrico;
disciplina in stile futsal; cumulo falli; corpi con tetto d'accelerazione;
deformazione ad area costante; fiato misurato (100→5,9 in quattro secondi di
sprint). `[R:fisica]`

**Manca, in ordine di peso:**

1. **[non-pensato/grosso]** **Sotto le 420 u/s il pallone attraversa i corpi.**
   Misurato: contatto a 374 u/s → distanza minima 0,2 unità e pallone che esce
   dall'altra parte senza deviazione `[R:fisica]`. E l'attrito toglie 1,0498 u/s
   per unità percorsa: anche una cannonata da 640 scende sotto 420 dopo 210
   unità. Da metà campo in poi **tutto attraversa tutti**.
2. **[fatto-a-metà/grosso]** L'attrito dell'aria è **zero esatto** e tre modelli
   calibrati sull'attrito vecchio non sono stati aggiornati con lui:
   `puntoCaduta` sbaglia di **+80,7 / +107,1 / +38,8 unità** (22-29% del volo),
   quindi il difensore corre dove il pallone non cade; `tiroVelocita` dichiara 330
   e il tiro perfetto **arriva a 597-777**; la lettura del portiere sbaglia
   l'orario del 20-25% proprio sui tiri che contano `[R:fisica]`. Conseguenza
   diretta: la **presa** smette di esistere per i tiri (5 prese contro 11
   respinte in 8 partite).
3. **[non-pensato/grosso]** Contrasti corpo a corpo, spinte e cadute non
   modellati: solo una separazione posizionale, nessuna massa, nessuno scambio di
   quantità di moto `[R:fisica]`.
4. **[fatto-a-metà/grosso]** **I calci piazzati non hanno fisica**: verificato da
   me, `:13692` `esito = Math.random()<reflex ? 'parata' : 'gol';` — la mira che
   il dito disegna non è mai letta dalla risoluzione `[io]`. Il gioco si ferma e
   si guarda, ed è lì che smette di essere una simulazione.
5. **[fatto-a-metà/grosso]** Le differenze fra giocatori sono quasi tutte finte:
   la squadra avversaria ha tutti gli uomini con lo stesso quartetto, oltre il
   quinto uomo anche la tua riceve la media, e il **portiere non usa nessun
   attributo** — mentre l'interfaccia gli mostra RIFLESSI e PRESA `[R:fisica]`.
6. **[fatto-a-metà/grosso]** Il tiro al volo è **geometricamente irraggiungibile**
   da una persona: `puoTirare` vieta di aprire la carica oltre 36,4 unità e il
   volo pretende 0,15 s di carica con il pallone entro 29,9 — in 0,15 s un pallone
   da 300 u/s percorre 45 unità. Zero voli su sei premendo nell'istante più
   precoce che il gioco consente; **0 su 16 partite** `[R:fisica]`.
7. **[fatto-a-metà/medio]** Il pallone non ha rotazione fisica: `spinY` è passato a
   zero da tutti e undici i chiamanti, e la curva vive solo dentro
   `if(b.perfectT>0)` `[R:fisica; doc:agente28.md:15]`.
8. **[non-pensato/medio]** **Il fuorigioco non esiste** — verificata da me una sola
   occorrenza, ed è un commento sul gesso `[io]`. Su un campo da 11 senza
   fuorigioco l'attaccante può vivere in area per tutta la partita.
9. **[fatto-a-metà/medio]** Il fallo nasce **solo** dalla scivolata: mediana 1,5
   falli a 5, 1 a 7, **zero a 11**. L'impianto disciplinare è costruito e ha una
   sola porta d'ingresso `[R:fisica]`.
10. **[fatto-a-metà/medio]** Il fiato non morde **mai** per la CPU: fiato minimo di
    squadra **31,6 in 16 partite su 16**, identico al decimale, contro una
    penalità che comincia sotto 25. La persona si stanca e la CPU no `[R:fisica]`.
11. **[fatto-a-metà/medio]** La taglia non scala i corpi: `P_R`, `KICK_R`,
    `CARRY_DIST`, `P_SPEED` identici mentre il campo raddoppia (verificati da me
    a `:2950`, `:3073`, `:3074` `[io]`). Attraversare il campo a 11 costa 13,7 s
    su 90.
12. **[fatto-a-metà/medio]** Il rimbalzo non toglie nulla al moto orizzontale
    (200,0 u/s prima e dopo ciascuno dei tre rimbalzi) e non c'è transizione al
    rotolamento `[R:fisica]`.
13. **[non-pensato/medio]** Corner, rimessa laterale e rimessa dal fondo non
    esistono; l'unica ripartenza **teletrasporta** il difensore più arretrato.
14. **[fatto-a-metà/piccolo]** La rete non è un corpo: il gol è una cinematica.
    Scelta di regia difendibile, **purché non venga mai dichiarata come fisica**.

### 3.5 — CONTENUTI E MODALITÀ — 55%

**Fatto:** quattro modalità vere (amichevole 1P, 2P sullo stesso telefono, torneo
a 8, campionato a 8 con 14 giornate); sedici schermate percorse a clic senza un
errore; le tre taglie funzionano davvero e sono raggiungibili dall'interfaccia
(10/14/22 giocatori, campo 1150×560 / 1610×784 / 2300×1120, porta 150/172/196);
salvataggio versionato con migrazione; difficoltà che sposta 13 parametri; rosa
di 5 uomini con attributi che entrano nella simulazione; tabellino con 11 voci
più possesso e marcatori; progressione economica intera con 15 trofei e albo;
personalizzazione (nome, 8 divise, 8 campi, cartelloni scritti dall'utente);
scene madri (calcio d'inizio, gol, moviola, golden goal, rigori, cartellini);
tutorial in 4 passi; negozio dichiarato con 5 articoli e prezzi in chiaro.
`[R:contenuti]`

**Manca, in ordine di peso:**

1. **[progettato-non-scritto/grosso]** **Torneo e stagione sono inchiodati al 5
   contro 5** — verificato da me: `:31017` e `:31111` passano `size:5` `[io]`. Le
   due taglie che il committente ha chiesto **non entrano in nessuna modalità di
   progressione**: chi gioca a 11 non può vincere niente.
2. **[fatto-a-metà/grosso]** **L'11 contro 11 non produce partite**: su 30 partite
   a seme di serie, mediana **zero gol**, **63% di 0-0** al fischio, 43% decise ai
   rigori; su un secondo campione indipendente di 24 partite, 50% e 42%
   `[R:contenuti]`. È la voce che `PUNTO-DEL-LAVORO.md` dichiara **chiusa** (vedi
   §4).
3. **[non-pensato/grosso]** Nessuna scelta di formazione né di modulo: uno per
   taglia, cablato. Il gioco ha già l'infrastruttura (moduli in frazioni di campo,
   sei stati di squadra, ruoli riassegnati) e **non la espone**.
4. **[non-pensato/grosso]** Nessun allenamento, nessun campo libero, nessuna
   palestra dei calci piazzati. Pallonetto, volo, filtrante e cross esistono solo
   come disegni a gessetto in una schermata di testo, e il tutorial si vede **una
   volta sola nella vita**. Su un gioco che deve essere «facile da utilizzare», è
   il buco più caro.
5. **[non-pensato/medio]** Nessuna sostituzione, nessuna panchina giocabile —
   verificato da me: una sola occorrenza di «sostituzion» e non è quella `[io]`.
   Il fiato e l'espulsione temporanea di 12 s sono già mezza macchina.
6. **[non-pensato/medio]** Nessun infortunio, mercato, morale, carriera
   pluriennale: la stagione finita si ricomincia e la classifica si azzera.
7. **[fatto-a-metà/medio]** **Il contatore dei gol della rosa è sbagliato**:
   verificato da me a `:31175`, `if(G.score[0]>0)
   SAVE.rosa[1].gol=(SAVE.rosa[1].gol|0)+G.score[0];` — tutte le reti della
   squadra vanno all'uomo di indice 1, chiunque abbia segnato `[io]`. La schermata
   che promette identità è quella che mente sull'identità.
8. **[fatto-a-metà/medio]** La ripartizione delle monete non torna col saldo (+46
   elencati, saldo 176): i trofei sono pagati dopo la somma e prima della lettura
   `[R:contenuti]`.
9. **[progettato-non-scritto/medio]** **Il pulsante in euro non compra niente.** È
   l'unica voce del mandato che è al 100% progetto e allo 0% codice.
10. **[non-pensato/medio]** Nessun tempo di gioco strutturato: niente due tempi,
    intervallo, recupero. Scelta difendibile, **da dichiarare**; ma a 7 e a 11 i
    90 secondi sono la ragione aritmetica per cui non si segna.
11. **[fatto-a-metà/medio]** Nessun replay comandato: la moviola si può solo
    **spegnere**. Il giocatore non può fermare la cosa più bella che il gioco
    produce.
12. **[fatto-a-metà/piccolo]** Un salvataggio vergine può cambiare **una** cosa
    sola (il nome): 7 kit su 8 e 7 campi su 8 sono dietro un pagamento.
13. **[fatto-a-metà/piccolo]** La scala dei prezzi dei campi è incoerente: 15.350
    monete uno per uno contro **1.330** per il pacchetto. Un patto onesto con
    l'aritmetica sbagliata dentro è il posto peggiore dove sbagliare.
14. **[non-pensato/piccolo]** Nessuna esportazione del salvataggio, uno slot solo
    in localStorage.

### 3.6 — DIRITTI E MONETIZZABILITÀ — 60%

**Fatto e verificato byte per byte sull'APK spedito:** zero immagini raster, zero
campioni audio, zero librerie di terzi, zero rete (`senza-rete.js` 6/6: una sola
richiesta, il documento stesso), **zero permessi** (verificato da me: `grep -c
uses-permission` sul manifest dà **0** `[io]`), zero nomi reali in tutto lo spazio
dei nomi generabile (10 squadre × 36 nomi × 30 soprannomi × 8 campi × 8 insegne ×
15 trofei × 8 divise, più uno spoglio manuale di 431 stringhe maiuscole); audio
interamente sintetizzato e nessuna melodia riconoscibile; i due woff2 sono
Archivo Black 1.006 e Barlow Condensed Bold 1.408, OFL 1.1 **senza Reserved Font
Name**, letti dalla tabella `name` voce per voce; le 27 icone generate in casa;
la chiave di firma mai finita in git; l'asset dentro l'APK identico byte per byte
al sorgente (md5 `30279089de83249e44e66d2247294f5f`). `[R:diritti]`

**Manca, in ordine di peso:**

1. **[fatto-a-metà/grosso]** **Il testo della licenza OFL non viaggia col gioco.**
   Nei woff2 sottoinsiemizzati il nameID 13 è stato buttato via, e nel repo non
   esiste nessun LICENSE/NOTICE — verificato da me: `git ls-files | grep -iE
   "licen|notice|third"` è **vuoto** `[io]`. La OFL condizione 2 pretende «each
   copy contains the above copyright notice **and this license**»; la FAQ 2.6
   dichiara che sottoinsiemizzare **è** modificare. È l'unico punto in cui il
   gioco è fuori da un obbligo che ha già accettato, e riguarda l'unica proprietà
   di terzi che distribuisce, dentro l'APK che si vuole vendere. Contatore: **0/2**.
2. **[non-pensato/grosso]** Nessun foglio dice **di chi è il gioco**: né verso i
   terzi (nessun elenco di componenti con licenza e versione) né verso sé stesso
   (nessun avviso di copyright, nessun autore nominato, in nessun punto). Serve a
   poter rispondere in cinque minuti invece che in cinque giorni.
3. **[fatto-a-metà/grosso]** L'APK spedito è firmato con la **chiave di collaudo**
   (CN=Dopolavoro FC, OU=Collaudo, alias e password `collaudo`, password in chiaro
   in `costruisci.py` che è committato). Chiunque cloni il repo firma un pacchetto
   che Android accetta come aggiornamento. La chiave di pubblicazione non esiste e
   non è progettata: grep su `chiave di pubblicazione|upload key|play
   console|keystore` in tutti i markdown dà **zero** `[R:diritti]`.
4. **[progettato-non-scritto/grosso]** Nessun aggancio di pagamento (§3.5 punto 9).
   E va messo in conto **ora**: il giorno che entra Play Billing la purezza «zero
   librerie di terzi» finisce, e arriva un componente con i suoi obblighi di
   attribuzione — mentre l'inventario è ancora di due righe.
5. **[fatto-a-metà/grosso]** **Non esiste un cancello ripetibile sui diritti.**
   `_z-legale-nomi.js` sta nella radice, non è nella batteria, ed **elenca** senza
   giudicare; non copre tinte e motivi delle divise, lo splash, i cartelli di
   evento, i trofei, i font, i suoni; e il controllo prescritto da `agente7.md` §c
   («deve dare 0») oggi dà **3**, tutti falsi positivi (due nei base64, uno in
   «Serie a oltranza»). Un cancello che nasce rosso per rumore viene disattivato
   la prima volta `[R:diritti]`.
6. **[non-pensato/medio]** `applicationId = it.dopolavoro.calcetto` (verificato da
   me nel manifest `[io]`) e **dopolavoro.it è di qualcun altro** (46.37.14.14). Non
   è violazione di marchio, ma l'applicationId è **immutabile dopo la prima
   pubblicazione**: costa una riga oggi, dopo costa ripubblicare come app nuova.
7. **[fatto-a-metà/medio]** **15 menzioni di prodotti concorrenti** spedite in
   chiaro dentro l'APK (Soccer Stars 9, Rocket League 2, Head Ball 2 ×2, Score
   Match 1, eFootball 1), su 14 righe. `agente7.md` §R4 ne contò 13 e chiese di
   riformularle: non è stato fatto, **e ne sono nate altre due** `[R:diritti]`.
8. **[non-pensato/medio]** Nessuna ricerca di anteriorità sui registri (UIBM,
   EUIPO/TMview, WIPO Madrid): tutto ciò che è stato scritto sui marchi altrui è
   ragionamento sulla forma dei nomi, **non un estratto di registro**.
9. **[non-pensato/medio]** La **paternità dell'opera** — chi ne è l'autore, e cosa
   resta protetto di un'opera scritta quasi per intero da un agente — non è
   affrontata da una sola riga in nessun documento. Il repo è pubblico e il gioco
   è un HTML in chiaro: chiunque può prenderlo, ricolorarlo e pubblicarlo.
10. **[fatto-a-metà/piccolo]** ROSSONERO resta l'unico gancio verbale verso un club
    vero (il visivo non converge più: `pat 0`, salmone chiaro). Rischio basso;
    costa una parola.
11. **[non-pensato/piccolo]** Insegne e nome squadra si scrivono senza filtro. Oggi
    non è un problema perché il testo non lascia mai il dispositivo. Lo diventa il
    giorno che si aggiunge una foto condivisibile o una classifica: **va deciso
    adesso che la scelta è gratis.**

### 3.7 — IL DIVARIO CON FC 25 (presentazione, ritmo) — 22%

**Fatto:** censimento vero, non stimato — 7 h 00 m di gameplay campionate a passo
fisso, 842 fotogrammi in 43 fogli di contatto, 32 fogli guardati uno per uno
`[R:divario]`. Su ~60 voci censite: **11 piene, 15 a metà, 34 assenti**, di cui 26
mai pensate. Sul **gioco vero** il divario è minore di quanto si tema: abbiamo
falli, cartellini, espulsione temporanea, rigori, moviola, folla animata e
reattiva, 13 voci di tabellino, fiato, 21 clip.

**Manca, in ordine di peso:** la regia (§2.5) · il gioco aereo · il verbo che salta
l'uomo · il contrasto in piedi · le palle inattive come momento di gioco · il
pre-partita · la grafica a schermo che parla durante il gioco · la telecronaca
(anche solo come didascalie con la stessa cadenza) · le persone intorno al campo ·
le sostituzioni · tattica e modulo · le schede del giocatore in sovrimpressione
(**il rapporto resa/costo più alto di tutto il censimento**: una pastiglia con tre
numeri che il gioco già possiede) · la schermata delle statistiche a schede
(nessuna simulazione nuova, solo disegno) · i cartelloni animati · le esultanze di
squadra che **convergono** sul marcatore (oggi ognuno esulta dov'è) · l'effetto sul
pallone.

**E le cose che abbiamo noi e loro no, che oggi non rivendichiamo da nessuna
parte:** la gabbia con le sponde (il pallone non esce mai, quindi quasi tutto il
tempo è gioco vivo, dove FC 25 ne spende il 31,9% in regia); un file HTML solo;
un APK da 664 kB contro decine di GB; zero permessi; avvio da icona a pallone in
**1424 ms** `[doc:ripresa.md:120]`; gioco completamente offline; e un meta-gioco di
quartiere che è identità nostra e **senza diritti addosso** — dove FC 25 è fatto
quasi tutto di licenze. **Un vantaggio che nessuno nomina non è un vantaggio.**

### 3.8 — STRUMENTI DI MISURA — 45%

**Fatto:** una batteria di 13 cancelli che gira in 500 s e che protegge dal
bersaglio che si muove (impronta del file prima e dopo, referto **nullo** se
cambia); sei cancelli su tredici hanno un controllo negativo o un'iniezione di
guasto; `collaudo.js` è riproducibile al centesimo; `android/verifica.py` fa 32
controlli utili; il telefono vero è attaccato e `avvio.js` lo misura (477 ms
dall'icona + 1078 ms nella WebView). Verificato da me oggi: **207 file** in
`strumenti/`, 13 cancelli in `tutti.js`, di cui **10 contano** `[io]`.

**Manca, in ordine di peso:**

1. **[non-pensato/grosso]** **L'audio**: 11 oscillatori, un LFO per il boato, il
   coro legato al negozio — e **nessuno strumento della casa lo nomina**. Se ogni
   calcio diventasse muto, la batteria uscirebbe verde 13 su 13.
2. **[non-pensato/grosso]** **Il salvataggio**: l'unica cosa che il giocatore perde
   per sempre se si rompe. 25 rami di validazione e una migrazione da v2/v3 **mai
   provata da nessuno**.
3. **[non-pensato/grosso]** **Il meta-gioco**: torneo, stagione, negozio, albo,
   trofei, cartellini. Nessun cancello li tocca; `scatta.js` li **fotografa**.
4. **[progettato-non-scritto/grosso]** **L'equità vera del negozio**: il cancello
   esiste, il gancio nel gioco esiste (`__test.attivaOggetti`, scritto apposta e
   **letto da nessuno dei 207 file**), e nessuno li unisce. Oggi «equità 4/4»
   misura il determinismo dello strumento, non il negozio. Costa **una riga** in
   `tutti.js`.
5. **[fatto-a-metà/grosso]** **Nessun pavimento di prestazione che blocchi**:
   verificato da me, `tutti.js:109` lancia `prestazione.js` nudo con `conta:
   false`, e senza `--contro` lo strumento **esce 2 e rifiuta di giudicare** `[io]`.
   Con un margine dichiarato di 3,15-3,65 ms su 16,7, qualunque onda grafica può
   mangiarlo senza che un cancello lo veda.
6. **[fatto-a-metà/grosso]** **Il cancello d'avvio non è credibile**: il numero su
   cui si giudica è quello del banco a 4×, che oggi è passato da **2083 a 4018 ms**
   fra due esecuzioni identiche, con il suo stesso controllo di ripetibilità che
   ha dato **205,1% e poi 19,2%**; e il numero vero del telefono (1555 ms) è
   informativo e non decide nulla `[R:strumenti]`. L'ultimo commit vende «parte in
   tre secondi».
7. **[fatto-a-metà/grosso]** `_eventi.js`, l'unico strumento che misura il **gioco**
   invece dell'immagine, **non è nella batteria** — verificato da me: zero
   occorrenze in `tutti.js` `[io]`. È la scoperta più grande del progetto, ed è
   sorvegliata da un controllo che chiede `gol >= 1` su una partita, con la
   scappatoia `tabellino.reti === 0 ||`.
8. **[fatto-a-metà/grosso]** **La legge 4 dei comandi non è nella batteria**:
   nessuno dei tredici cancelli manda un solo `touchcancel`. È la voce che sedici
   giudizi hanno chiesto sedici volte, verificata **una volta** dallo specialista
   che l'ha scritta.
9. **[non-pensato/grosso]** **Le altre geometrie**: tutta la batteria vive a
   915×412. Non esiste una corsa a 640×360 (dove il progetto prevede la colonna),
   né alla risoluzione vera del telefono, né in verticale.
10. **[fatto-a-metà/grosso]** **Il copyright** non ha un cancello (§3.6 punto 5).
11. **[fatto-a-metà/grosso]** **I verbi che il committente ha nominato non sono
    esercitati da nessun cancello**: parata, rovesciata, tiro al volo, dribbling,
    esultanza, reazione al gol. `giocata.js` copre sette gesti e basta.
12. **[non-pensato/grosso]** **Il rumore dei cancelli non è sorvegliato.** Solo
    `avvio.js` dichiara la propria dispersione. Misurato oggi: `giocata` dà 6/7,
    poi 7/7, poi 7/7 sullo **stesso identico file**. Un cancello che sbaglia una
    volta su tre insegna a ignorare i suoi rossi.
13. **[non-pensato/grosso]** **La guardia del carico di banco è codice morto.**
    `banco-libero.json` non esiste e non verrà mai scritto: la scrittura è
    condizionata a `ms < base` e `base` parte uguale a `ms` quando il file manca,
    quindi `volte` vale **sempre 1,000** e il declassamento da condanna a sospetto
    **non può verificarsi mai** — pur essendo esattamente la protezione che il caso
    24 aveva comprato `[R:strumenti]`.
14. **[non-pensato/medio]** **Nessuna sessione lunga**: zero occorrenze di
    `JSHeap`, `heapUsed`, `unhandledrejection` in tutti i file. Un torneo di sette
    partite in una sessione è il modo normale di giocare.
15. **[non-pensato/medio]** Il **mancino**; i modi di **accessibilità** (`SAVE.moto`
    non è verificato da niente); il **tutorial**, che ogni strumento **spegne per
    convenzione**; la **latenza tocco→fotone** dentro questa WebView, che è il
    presupposto non misurato dell'intera meccanica dell'anello.
16. **[fatto-a-metà/medio]** `android/verifica.py` **non può fallire**: verificato
    da me, non contiene nessun `sys.exit` `[io]`. Tre righe.
17. **[fatto-a-metà/medio]** **Nessun cancello sa puntare a un file diverso**: il
    percorso è scritto dentro tutti e tredici, quindi la regola 8 della casa
    («prima di chiamare regressione, misura quanto valeva ieri») si può rispettare
    solo scambiando file a mano — che è ciò che `tutti.js` esiste per impedire.
18. **[fatto-a-metà/medio]** Quattro cancelli su dieci che contano non hanno
    controllo negativo (`misura`, `senza-rete`, `seme`, `volti`) e non risulta un
    loro rosso in nessun documento. **Un cancello mai visto rosso è una
    decorazione.**
19. **[non-pensato/piccolo]** **Niente obbliga nessuno a far girare la batteria**:
    verificato da me — nessun workflow, nessun hook git attivo, `npm test` che
    esce 1 `[io]`.

### 3.9 — LA DIMENSIONE CHE NON AVEVA UN REVISORE

Otto revisioni, e queste cose sono cadute fra tutte e otto. Le tengo separate
perché il fatto che **nessuno le abbia guardate** è il dato, non il loro peso.

- **Il tatto.** Il gioco ha la vibrazione per intero — `:6514` `buzz(p)` e **15
  punti di chiamata** verificati da me `[io]`, con motivi ritmici veri (`[35,50,90]`
  sul gol, `[60,40,60]` sul cartellino) e l'interruttore in Impostazioni. E il
  manifest non ha **nessun** permesso: senza `android.permission.VIBRATE` l'API
  non fa nulla **in silenzio**. Il menu promette una cosa che il telefono
  probabilmente non può fare. **Non verificato sul dispositivo** — si chiude in un
  minuto con `adb logcat` durante un gol. La cura è una riga di manifest, e rompe
  la frase «zero permessi» su cui due dimensioni sono costruite: **è una decisione
  da umano, e nessuno gliel'ha mai messa davanti.**
- **La lingua.** `<html lang="it">`, zero `navigator.language`, zero tabelle di
  traduzione, tutte le stringhe italiane in chiaro. «Monetizzare» su Play significa
  un negozio mondiale: oggi il prodotto è vendibile in **un mercato solo**.
- **Il guscio Android, mai revisionato da nessuno.** Verificato da me:
  `setWebContentsDebuggingEnabled(true)` **incondizionato** a `Gioco.java:78` —
  l'APK spedito resta ispezionabile da DevTools; `FLAG_KEEP_SCREEN_ON` aggiunto in
  `onCreate` e **mai tolto**, quindi lo schermo non si spegne nemmeno nel menu;
  `versionCode="1"` fisso, cioè **non esiste un percorso di aggiornamento** e nessuno
  script lo incrementa; `screenOrientation="sensorLandscape"`, quindi tutto il ramo
  «ruota il telefono» del gioco **non può accendersi sull'APK** `[io]`.
- **Il tempo morto fra GIOCA e il calcio d'inizio.** Misurato dal critico, mai da
  nessuno strumento: blocco del filo principale **3,6-4,7 ms a 5**, **363,8-453,0
  ms a 7**, **222,8-238,4 ms a 11**, e **nessun indicatore di caricamento in tutto
  il file** `[critico]`. Il 7 costa più dell'11 perché la scala di cottura è più
  alta. `avvio.js` misura icona→pallone, non questo.
- **Il salvataggio come rischio.** `try{ localStorage.setItem(...) }catch(e){}` —
  **fallimento silenzioso**; e nessuna `persistSave()` è agganciata a `pagehide` o
  `visibilitychange` `[critico]`. È la trappola «localStorage in differita» già
  scritta nel quaderno di casa.
- **Il suono come prodotto.** Solo acceso/spento con salto secco, nessun volume,
  nessuna separazione musica/effetti, **nessun `AudioContext.suspend()`** in tutto
  il file, e in pausa la folla scende a 0,15 invece che a zero `[critico]`.
- **Il consumo e la frequenza.** Il ciclo è a passo fisso con troncamento a 0,25 s
  e massimo 6 sotto-passi — **la simulazione è al sicuro, ed è un pezzo ben fatto
  che nessuna delle otto dimensioni ha accreditato**. Ma `render()` gira una volta
  per ogni rAF **senza tetto**: su un telefono a 120 Hz il gioco dipinge il doppio
  dei fotogrammi, mentre ogni numero di prestazione della casa è preso a 60. **Non
  misurato**: serve un dispositivo ad alta frequenza.
- **Nessuno ha giocato, e nessuno ha misurato i concorrenti.** Le otto revisioni
  sono CPU contro CPU, dita sintetiche e letture di codice: **zero prove con una
  persona**. E il censimento del divario ha guardato **FC 25**, che è un titolo da
  console; i giochi accanto a cui CALCETTO finirebbe nel negozio sono quelli che i
  commenti del gioco nominano quindici volte, e su nessuno di loro esiste **una
  riga** di censimento.

---

## 4. CIÒ CHE È STATO DICHIARATO FATTO E NON LO È

In questa casa le affermazioni superate **si rettificano in chiaro, con fonte e
data**, non si cancellano. Regola 6.

| # | dove sta scritto | cosa dice | cosa è vero oggi |
|---|---|---|---|
| 1 | `PUNTO-DEL-LAVORO.md:138` | «~~L'11 contro 11 che non tira mai~~ **CHIUSO** … **zero partite 0-0 in mediana**» | **Metà vera.** «Momenti da porta al minuto» torna (0,78 misurato contro 0,79 dichiarato). La voce 0-0 **non torna**: 11v11 mediana **1,00** partite 0-0 e **63% di 0-0** su 30 partite a seme di serie, 50% su un secondo campione di 24 `[R:contenuti, 19-20 ago]` |
| 2 | `PUNTO-DEL-LAVORO.md:137` e `ripresa.md:130` | «`para` leggibile al **63,3%** … la clip `tuffo` ha **dz 1,382 contro dy 0,605**» | **Descrive una posa che non esiste più.** Il tuffo è stato riscritto sull'asse laterale nel commit `3328749` e oggi misura **dx 1,282 / dy 0,810 / dz 1,169**. E i numeri di leggibilità (tira 3,3%, scivola 6,1%, esulta 39,1%, para 63,3% su 13.560 fotogrammi) **non sono riproducibili**: il crudo che li reggeva non è nel repo `[R:animazioni, 20 ago]` |
| 3 | `PUNTO-DEL-LAVORO.md:157-160` | «istantanea.js su otto istanti **davvero indipendenti** — 46 misure su 56; erba senza soggetti 4/8» | Oggi **45/56**, erba **1/8** (47,8-66,5% contro un tetto del 50%), e **lo strumento si dichiara non valido da solo**: «1 coppie di istanti sono lo stesso fotogramma. Il totale qui sopra non vale» `[R:visiva + R:strumenti, 19-20 ago]`. Peggiorata di tre istanti su otto **senza che la batteria diventasse rossa**, perché il cancello è `conta:false` (verificato da me a `tutti.js:108`) |
| 4 | `PUNTO-DEL-LAVORO.md:153` | «giocata **8/8**» | Il banco oggi ha **sette** giocate, e nella batteria è uscito **6/7**, poi 7/7 due volte di fila sullo stesso file invariato. **È rumoroso, e non lo dichiara** `[R:strumenti, 20 ago]` |
| 5 | `PUNTO-DEL-LAVORO.md:140` | «L'avvio: **2870 ms** a 4× contro un tetto di 2 s, **dispersione 2,2%**» | Oggi **2083 ms** con dispersione dichiarata **205,1%** (cioè non valida), e alla riesecuzione **4018 ms** con dispersione 19,2% `[R:strumenti, 20 ago]`. La regola 15 di questa casa — «un numero con la dispersione fuori soglia non si scrive da nessuna parte» — è violata dallo strumento che l'ha insegnata |
| 6 | `PUNTO-DEL-LAVORO.md:6-10` | «Ultimo commit `60ef759` … il gioco adesso: **1.681.472 byte**, md5 `d9e0f83…`» | Il file di riferimento del progetto è fermo al 18 agosto. Oggi il gioco è **1.794.676 byte** (misurato da me) e sopra ci sono cinque commit. **Chi riprende leggendo solo quel file riprende da due giorni fa** |
| 7 | il mandato di questa revisione | «ventisette strumenti ciechi» | La numerazione scritta arriva a **25** (`PUNTO-DEL-LAVORO.md` 11-22, `ripresa.md` 23-24-25). **Il 26 e il 27 non sono scritti da nessuna parte.** Ne è stato trovato uno nuovo oggi (la guardia del carico di `tutti.js`, codice morto) e uno nuovo qui sopra (il rumore di `giocata` non dichiarato): sarebbero il 26 e il 27, ma **con un'origine diversa da quella che il mandato presumeva** |
| 8 | `ripresa.md:14` e `agente28.md` §5 | «zero permessi», usato come vanto in due dimensioni | Regge sul manifest (verificato da me: 0 `uses-permission`), **ma il gioco chiama `navigator.vibrate` in 15 punti** e offre l'interruttore «VIBRAZIONE: ON». O il permesso entra, o l'interruttore mente. **Nessuno ha mai messo questa scelta davanti a un umano** `[critico]` |
| 9 | `_analisi/agente7.md` §R4 | «13 menzioni di prodotti concorrenti, da riformulare» | Non fatto, **e sono diventate 15**, spedite in chiaro dentro l'APK `[R:diritti]` |
| 10 | `_analisi/agente7.md` §c | il grep di controllo sui marchi «deve dare **0**» | Oggi dà **3**, tutti falsi positivi (due dentro i base64 dei font, uno in «Serie a oltranza»). **Un cancello che nasce rosso per rumore viene disattivato la prima volta** `[R:diritti]` |
| 11 | `agente28.md` §10, riga L0.4 | la cura dell'etichetta è «`b.passTo` dentro `possessoTeam`» | Fatta **diversamente** e meglio: tre guardie estratte (`puoTirare`/`puoPassare`/`puoContrastare`) chiamate sia dai comandi sia dalle etichette. `possessoTeam` esiste ancora ma **non è più il contesto dei pulsanti**. Il progetto non è stato aggiornato `[R:comandi]` |
| 12 | due rapporti di questa revisione | «il rig ha **22** clip» / «**23** clip» | **Sono 21**, contate da me oggi nel blocco `const CLIPS` alle righe 4931-4954 `[io]`. Non è pedanteria: «12 clip su 21 mai misurate» e «copertura del provino 43%» si spostano col denominatore |
| 13 | due rapporti di questa revisione | `_p-verbi.js` su CONTRASTA: «3/3» contro «2/3», lo stesso giorno | Il banco ha **soglie diverse per verbo** (TIRA/FILTRANTE/CROSS/CAMBIO al 100%, PASSAGGIO al 70%, **CONTRASTA al 60%**) con le ragioni scritte accanto. Quindi «sei verbi su sei rispondono» è vero **dentro uno sconto che nessuno dei due ha dichiarato**, e il «2/3» citato come mezza bocciatura era un **verde** `[critico]` |
| 14 | un rapporto di questa revisione | «a zero dita il comandato resta fermo a **0,0 unità** in 700 ms» | Oggi lo stesso strumento stampa **2,6 unità**, e sulla stessa riga «in pausa: sì». **La prova gira a gioco in pausa** — lo dichiara lo strumento stesso. La prova più citata della neutralità è raccolta in uno stato dove nessuno si muoverebbe comunque `[critico]` |
| 15 | un rapporto di questa revisione | «chi disinstalla perde tutto» | `allowBackup="true"` senza regole di backup (verificato da me nel manifest): il backup automatico di Android **potrebbe** già preservare il salvataggio. Nessuno l'ha provato: lo stato vero è **non verificato** `[critico]` |
| 16 | un rapporto di questa revisione | «nessuno prova la sospensione e il ritorno dell'app» | Il **gioco lo fa già**: `visibilitychange` → `setPaused(true)`, che alza le dita, abbassa la folla, nasconde il tutorial e **azzera l'accumulatore al ritorno**. Restano fuori due cose sole: l'audio (nessun `suspend`) e il salvataggio non forzato su nascondimento `[critico]` |

---

## 5. CIÒ CHE NESSUNO PUÒ MISURARE

### 5.1 — Proprietà che nessuno strumento sorveglia, ma che una macchina potrebbe

Ognuna di queste è oggi un punto cieco: se domani si rompesse, la batteria
uscirebbe verde e nessuno lo saprebbe finché non lo trova un giudice o un
giocatore.

**L'audio** intero (11 oscillatori, il coro venduto nel negozio) · **il
salvataggio** (25 rami di validazione, una migrazione mai provata, un fallimento
di scrittura silenzioso) · **il meta-gioco** (torneo, stagione, negozio, albo,
trofei) · **l'equità vera del negozio** (il gancio esiste e nessuno lo chiama) ·
**qualunque geometria diversa da 915×412** (e il telefono vero è 576×273 CSS con
dpr 2,8125, dove i comandi occupano **una volta e mezzo** lo spazio del banco) ·
**il mancino** · **la sessione lunga** (memoria, degrado del fotogramma, ritorno
dal secondo piano) · **la latenza tocco→fotone** dentro questa WebView, che è il
presupposto non misurato dell'intera meccanica dell'anello del tiro · **il ritmo**
(quanti tocchi ha un possesso, quanto dura una manovra: `_eventi.js` conta gli
esiti, non la grana) · **il movimento** — e questa è la più grave, perché **tutti i
provini di questa casa guardano fotogrammi fermi**, e il difetto più grosso delle
animazioni vive solo fra due fotogrammi · **i verbi che il committente ha nominato
per nome** (parata, rovesciata, volo, dribbling, esultanza, reazione al gol) ·
**il due giocatori sullo stesso telefono**, una modalità intera spedita e mai
esercitata da nessuno, né a mano né con un banco · **la vibrazione sul
dispositivo** · **il consumo e i 120 Hz** · **la lingua** · **il tempo morto
GIOCA→calcio d'inizio** (misurato una volta dal critico, da nessuno strumento) ·
**il tutorial**, che ogni strumento spegne per convenzione · **l'accessibilità da
tastiera** (29 `aria-` e 24 `role=` esistono; `tabindex` compare **zero** volte,
verificato da me `[io]`, e la partita è una tela senza equivalente testuale) ·
**gli errori non catturati** (`unhandledrejection` non è ascoltato da nessuno
strumento) · **il peggioramento silenzioso** di ciò che è `conta:false`.

### 5.2 — Proprietà che nessuna macchina può sorvegliare affatto

- **Se una persona impara lo schema.** G2 misura la condizione *necessaria* — che
  il gioco dica sempre in anticipo cosa farà. Non misura l'imparare, e il progetto
  approvato lo scrive da sé `[doc:agente28.md:468]`.
- **Se il gioco è bello da giocare.** Nessuno dei sette cancelli, se diventa verde,
  garantisce che il gioco sia più profondo: garantiscono che non sia
  **inutilizzabile** `[doc:agente28.md:490]`.
- **Se la figura sembra un uomo.** Il provino cieco è il giudice, e la regola 17 di
  casa dice che **con una persona sola non sa distinguere**: la varianza fra i
  giudici è più grande della differenza fra le cose confrontate. Serve una persona
  che non conosca la chiave, ripetuta, con un testimone (regola 18).
- **Se il gioco, nel suo insieme, si avvicina troppo all'espressione concreta di un
  prodotto identificato.** L'assenza di **asset** altrui è verificata; è una cosa
  diversa. La giurisprudenza punisce anche chi riscrive tutto da zero se copia
  l'aspetto concreto. Serve un occhio umano che confronti due schermate.
- **Di chi è l'opera, e su quale base.** Non si misura con un cancello: il
  risultato è un paragrafo letto da qualcuno che fa questo di mestiere.
- **Il voto della giuria dei 26, e il voto dei concorrenti.** È il criterio di
  accettazione del mandato, e non esiste uno strumento che lo faccia girare. L'8,2
  è del 18 agosto e la rivotazione è aperta; **i concorrenti non li ha misurati
  mai nessuno.** Finché quei due numeri non ci sono, «8-9 contro 3-4» è
  un'ambizione, non uno stato.

---

## 6. UN ORDINE DI LAVORO PROPOSTO

Il criterio delle onde è uno solo, ed è pagato: **le voci che cambiano la
simulazione al bit rompono ogni banco a seme fisso**, quindi vanno una alla volta
con i riferimenti rifatti in mezzo; tutto il resto può andare in parallelo. Il
secondo criterio è il **budget del fotogramma**: due voci che non si toccano nel
codice possono ammazzarsi a vicenda nei millisecondi, e allora non sono parallele.

### ONDA A — rendere credibili le misure e togliere i blocchi di pubblicazione
**Tutte in parallelo. Nessuna tocca la simulazione. Nessuna misura fatta dopo vale
niente se questa onda non è chiusa** (è la ragione dell'Onda 0 di `agente28.md`).

1. Il **testo della licenza OFL** dentro il gioco e un **NOTICE** nel repo, più una
   voce CREDITI dal menu. Contatore 0/2 → 2/2. *(blocca la pubblicazione)*
2. **`versionCode` incrementato da script**, `setWebContentsDebuggingEnabled` solo
   in debug, `FLAG_KEEP_SCREEN_ON` solo in partita. *(blocca l'aggiornamento)*
3. Decidere l'**applicationId** — è immutabile dopo la prima pubblicazione.
4. `prestazione.js --contro HEAD` dentro `tutti.js` con **`conta: true`**, accettazione
   sul p95; `_eventi.js --partite 50` in batteria con soglie sui quartili;
   `android/verifica.py` con `sys.exit`.
5. **Invertire i ruoli dell'avvio**: il cancello è il telefono via adb, il banco a
   4× diventa la sonda; se adb manca l'esito è **non misurato**, non verde.
6. `tutti.js --ripetuto 3`: un cancello che diverge fra tre esecuzioni è
   **rumoroso** e il suo rosso vale come sospetto.
7. Riparare la **guardia del carico** (oggi codice morto) e dare a tutti e tredici
   i cancelli un `--gioco` (per la regola 8).
8. Il **cancello dei diritti** in batteria, con esclusione dei base64 e dei
   commenti, e con **controllo negativo**: si inietta un nome reale in una copia
   fuori dal repo e il cancello deve uscire rosso. Se non sa fallire, non misura.
9. I tre cancelli mancanti che coprono i punti ciechi più grossi: **audio**
   (firma del grafo WebAudio per evento), **salvataggio** (giro completo + tre
   casi cattivi + v3), **meta-gioco** (torneo intero, stagione intera, classifica
   che torna).
10. Mettere davanti a un umano la scelta **VIBRATE**: o il permesso entra, o
    l'interruttore sparisce.

### ONDA B — la fisica sotto i verbi
**Una alla volta, mai in parallelo**: cambiano la simulazione al bit. Fra una e
l'altra si rifanno i riferimenti a seme fisso. Vengono **prima** dell'Onda C, e
lo dice il progetto approvato: «uno schema migliore su una fisica rotta è una
tastiera più bella» `[doc:agente28.md:273]`.

1. Riallineare **`puntoCaduta`, `tiroVelocita` e la lettura del portiere**
   all'attrito nuovo. *(è la conseguenza non pagata della toppa L2.2a: il difensore
   corre dove il pallone non cade e il portiere legge un orario sbagliato del 20-25%)*
2. **Il pallone smette di attraversare i corpi** sotto le 420 u/s.
3. Il **rimbalzo** toglie una frazione dichiarata della componente orizzontale.
4. **`CARRY_DIST` funzione della velocità + `stealP` con tetto 0,85** — il gradiente
   di rischio che alza il tetto competitivo senza chiedere un pulsante nuovo.
5. **Il gioco aereo**: colpo di testa e stop di petto. *(tocca la riga del divieto:
   va introdotta da sola, e con lei arrivano due clip nuove)*
6. **I calci piazzati passano dalla fisica vera** — barriera, pali, portiere come
   corpo, e la mira che il dito disegna che finalmente conta.
7. **La taglia scala i corpi e la durata**, e **torneo e stagione accettano 7 e 11**.
   *(questa chiude insieme il difetto «l'11v11 non produce partite» e la richiesta
   esplicita del committente sulle tre taglie)*
8. Il **fiato che morde anche la CPU**, i falli che nascono anche da altro, il
   **fuorigioco** a 11.

### ONDA C — i consumatori del motore d'ingresso
Dipende da B (le riparazioni di fisica) e dai cancelli dell'Onda A.

- **Prima, in parallelo:** scrivere **G2, G3, G4, G5, G6a ROSSI**, prima che il
  codice esista. G5 richiede la riparazione dell'ordinamento in `eseguiFiltrante`;
  G4 richiede `__test.copertura()` esteso col cuneo del pollice.
- **Poi, NON in parallelo:** il **terzo contesto NOI**, perché tocca l'etichetta di
  tutti e due i dischi e ridefinisce il campo su cui le quattro voci seguenti si
  ramificano.
- **Poi, in parallelo fra loro:** **L1.2** (contrasto in piedi → contenimento →
  scivolata su trascinamento armato: la voce che il progetto chiama «mezzo voto da
  sola»), **L1.3** (mira tangenziale + tacca + rampa continua di potenza), **L1.4**
  (bias del passaggio + margine δ + chiamata), **L1.5** (cambio direzionale +
  raddoppio).
- **In parallelo con tutte:** il **mancino** e la **carta della mano** (una riga più
  un campo), la geometria dei dischi che scala con lo schermo e il ramo a colonna.

### ONDA D — la scoperta e il movimento
Parallele **nel codice**, non nel **budget del fotogramma**: la fusione fra clip e
l'anteprima si disegnano sugli stessi fotogrammi p95, gli unici senza margine.
Ognuna va misurata con `prestazione.js --contro HEAD` **prima** di essere promessa.

1. La **fusione fra clip** e l'**isteresi delle andature** — è il 95,34% dei pixel
   che si muovono. *(costo da misurare: due pose per figura in transizione, a 22
   figure)*
2. **L3.1** la linea di anteprima, il cambio di forma, l'arco, il rifiuto visibile ·
   **L3.2** la didascalia specchiata · **L3.3** gli inviti agganciati alla
   situazione. Senza questi, tutto ciò che l'Onda C scrive resta **invisibile**: la
   finta funziona già oggi e nessuno saprà mai che esiste.
3. Allargare la lista `PROVA` del provino della sagoma a **tutte e 21 le clip**
   (dieci righe), e alzare il requisito da 8/10 a una quota su 21.
4. Le pose che mancano ai verbi che ci sono: volo, pallonetto, giocatore a terra,
   arbitro, panchina.

### ONDA E — la presentazione
Tutte a costo di fotogramma: **una alla volta**, con misura appaiata in mezzo.

1. **Il manto alla scala di gioco** (`campoVivoDisegna` in partita, o cottura allo
   zoom vero) — la superficie più vista, e la prima parola del mandato.
2. **La figura**: rampe di illuminazione cotte in Blender applicate agli arti (la
   strada già scelta e misurata: +1,8 ms a otto giocatori, da legare al LOD), mani,
   piedi, volto alla scala a cui la figura sta davvero.
3. **La regia**: seconda inquadratura e stacchi, pre-partita, schede del giocatore
   in sovrimpressione, statistiche a schede, esultanze che convergono. *(le ultime
   tre sono disegno puro: nessuna simulazione nuova, e sono il miglior
   rapporto resa/costo dell'intero censimento)*
4. **Una** condizione meteo, sul sistema di particelle che il gioco ha già.

### ONDA F — la monetizzazione e la pubblicazione
Parallele fra loro **tranne** che il gancio di pagamento dipende dal NOTICE
dell'Onda A: il componente nuovo va iscritto **nello stesso commit** che lo
introduce.

Play Billing · informativa sulla privacy e modulo Data safety · materiale di
scheda · chiave di pubblicazione vera e scelta su Play App Signing ·
esportazione/importazione del salvataggio e `persistSave` su `pagehide` · la
lingua, se il mercato non è solo l'Italia.

### FUORI ONDA, e continuo
La **giuria dei 26** che rivota, e — la metà del criterio che non ha mai avuto un
numero — i **concorrenti misurati** con lo stesso metro. Nessuna macchina fa
queste due cose, e senza di loro «8-9 contro 3-4» resta un'ambizione.

---

## «Non ti resta nient'altro da fare per chiudere il progetto?»

No: resta la maggior parte. Sulla somma delle otto autodichiarazioni siamo al
**41,5%**, e il gioco è forte esattamente dove si fotografa e magro dove si prova
col pollice — il motore d'ingresso è costruito e **non è collegato a niente** (zero
call site, verificati oggi), le figure si teletrasportano a ogni cambio di posa
(0,504 m mediani), e la texture più vista arriva all'occhio ingrandita quasi due
volte a filtro spento.

Tre cose bloccano la pubblicazione **indipendentemente dalla qualità**: il testo
della licenza OFL che non viaggia col gioco, il `versionCode` fisso a 1 che rende
impossibile un aggiornamento, e il pulsante in euro che non compra niente.

E il criterio con cui hai chiesto di giudicare — 26 giudici a 8-9 mentre i
concorrenti stanno a 3-4 — **non è mai stato misurato sui concorrenti, da nessuno,
in nessun documento**, e sul nostro lato l'ultimo voto è del 18 agosto e precede
tutto ciò che è entrato dopo.

La buona notizia è che quasi niente di ciò che manca è una scoperta da fare: è
lavoro conosciuto, ordinato, con i cancelli che sanno dire quando è finito — a
patto che l'Onda A entri per prima, perché **oggi tre dei cancelli che
sorvegliano le tue promesse non bocciano nulla**.
