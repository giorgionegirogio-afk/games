# IL COMANDO SENZA SCHERMO — progetto (voce #144, onda E)

**Data**: 23 settembre 2026 · **Merge-base**: `c71a83e` (main) · **Ramo**: `voce-144-comando-senza-schermo`

Questo cantiere paga due debiti in una volta (#133 e #139) e consegna il
primo dei cinque prerequisiti dell'onda E (`docs/superpowers/specs/2026-09-23-onda-e-architettura.md`
§3.2, punti 1 e 2).

---

## 1. IL DIFETTO, IN UNA RIGA

**Oggi un comando e' un pixel.** Il nastro porta `Touch5.start(id, x, y)` e
`Touch5.move(id, x, y)` in coordinate di SCHERMO (righe di tipo 0 e 1). Su
uno schermo diverso gli stessi numeri premono un altro punto — o non premono
niente — e la partita rigiocata e' un'altra partita.

Misurato al #133: stesso nastro, partita dichiarata 3-4, rigiocata a 800x360
torna 0-3 e a 1024x460 torna 1-3. Il giudice oggi non sbaglia: **si astiene**
(`schermo-ignoto`, `schermo-diverso`, `schermo-cambiato`). Nel live 1v1 non ci
si puo' astenere: o la partita e' identica, o non c'e' partita.

---

## 2. LE ANCORE DI OGGI, RIVERIFICATE (23 settembre 2026, a file fermo)

Il censimento dell'onda E aveva dato numeri di riga di una versione
precedente. Ecco le ancore vere sul merge-base `c71a83e`:

| che cosa | dove (c71a83e) | stato |
|---|---|---|
| `humanMove(t)` legge solo `Touch5.stick[t].dx/dy` | `:13069-13087` | **confermato**: soglie `STICK_DEAD=12`, `STICK_FULL=46` in px ASSOLUTI |
| `MAXR = 70` (l'origine che insegue il dito) | `:14929` | px assoluti |
| `SOGLIA_LEVETTA = 6` / `R_ANNULLA = 96` | `:14809`, `:15350` | px assoluti |
| `Touch5.teamOf(x)` deduce la squadra da `innerWidth/2` | `:14615-14618` | **il canale numero uno** |
| `touchBtnLayout(t)`, `const bx = right ? VW : 0` | `:13639-13645` | **il canale numero due** |
| `pollice()` — scala 85-150%, spazio 100-140%, mancino | `:13544-13551` | canale gemello, mai dichiarato in un verbale |
| `insertiSicuri()` — `env(safe-area-inset-*)`, la tacca | `:13495-13525` | canale gemello, mai dichiarato in un verbale |
| le quattro porte avvolte dall'esterno | `:46430-46463` | dove si interviene |
| la coda del ritardo (#141), piu' fuori delle porte | `:46490-46560` | l'ordine resta: dito -> coda -> registro -> Touch5 |
| `Reg.esegui(r)` — i rami 0,1,2,3,4,8 | `:14437-14447` | la rilettura |
| `vagliaNastro`, le tre astensioni dello schermo | `:46130`, `:46161-46162` | da condizionare |
| `MOTORE_V` | `:13982` | vale **3** dal #143 |

**E una verifica mia, che il censimento aveva marcato «LETTO, non
riverificato»**: fra `function step(){` (`:18203`) e `:23700` — cioe' per
tutta la simulazione, `updatePlayer`, `updateBall`, `aiDecide` compresi — le
occorrenze di `VW`, `VH`, `SCALE`, `OX`, `OY`, `innerWidth`, `innerHeight`,
`devicePixelRatio` **nel codice sono ZERO**; l'unica occorrenza e' dentro un
commento (un commento della mira del duello). **La simulazione non legge lo schermo.** Confermato.

**E il duello e' gia' a posto**: `duelMira` (`:23889`) converte il pixel in
`u,v` normalizzati e li arrotonda al millesimo PRIMA di scriverli, e
`Reg.eseguiDuello` (`:14421-14427`) rigioca `pickZone(z, u/1000, v/1000)`
senza toccare un pixel. Il tipo 6 e' gia' un atto risolto: questo cantiere non
lo tocca.

---

## 3. LA CURA: L'ATTO RISOLTO

Il lavoro **non** e' «normalizzare la risoluzione». E':

> **trasportare e registrare l'ATTO RISOLTO — squadra, verbo, vettore — invece
> del PUNTO in pixel.**

### 3.1 Che cosa e' un atto

`Touch5.start` oggi fa due cose in un corpo solo: **risolve** (che squadra?
che disco? o erba? o morto?) e **applica** (nasce l'atto, parte la carica, si
apre la posa...). Il cantiere le separa, senza duplicare una riga:

```
start(id,x,y){ if(G.paused) return; return this.avvia(id, this.risolvi(x,y), x, y); }
risolvi(x,y) -> { t, esito, slot, ux, uy, act }      /* puro, nessun effetto */
avvia(id,a,x,y){ if(G.paused) return; this.applica(id,a,x,y); }
applica(id,a,x,y)                                    /* il corpo di prima */
```

L'atto ha **cinque campi e nessun pixel**:

| campo | bit | che cosa dice |
|---|---|---|
| `t` | 1 | **la squadra**, 0 o 1 — il prerequisito §3.2 punto 2 dell'onda E |
| `esito` | 2 | 0 disco preso · 1 erba (candidato levetta) · 2 morto su cella spenta · 3 morto nell'anello d'esclusione |
| `slot` | 2 | quale disco: l'indice, non il verbo (0 e' il grande, 1 il piccolo) |
| `act` | — | **non viaggia**: si rilegge da `touchBtnLayout(t)[slot].act` in locale. Il verbo di un disco e' una proprieta' del CONTESTO (possesso o no), e il contesto e' simulazione, cioe' identico ai due capi |
| `ux, uy` | 2x11 | il punto di posa **in unita' della geometria dei comandi**, al millesimo |

**La normalizzazione e' quella che il gioco usa gia' per decidere**, e non una
inventata qui: `Touch5.start` sceglie il disco col minimo di `d/(r+10)` e
uccide il tocco col minimo di `d/(r+18)`. Quindi:

- `esito` 0 e 2 -> `ux,uy = (x - disco.x)/(r+10)`, `(y - disco.y)/(r+10)`;
- `esito` 1 e 3 -> `ux,uy = (x - disco.x)/(r+18)`, `(y - disco.y)/(r+18)`,
  dove il disco e' quello col minimo di `d/(r+18)`.

Cosi' **la distanza normalizzata e' invariante per costruzione**: se al
registratore il dito era «dentro» (u <= 1), in rilettura lo e' ancora, su
qualunque schermo, con qualunque pollice e con qualunque tacca — perche' il
denominatore e' la geometria LOCALE.

### 3.2 I movimenti

Il tipo 1 porta il pixel assoluto. Il tipo nuovo (13) porta **lo scostamento
dal punto di posa di quel dito**, in px assoluti. E' l'unica forma corretta:
tutte le soglie che leggono un trascinamento (`SOGLIA_LEVETTA` 6, `STICK_DEAD`
12, `STICK_FULL` 46, `MAXR` 70, `R_ARMA`, `R_ANNULLA` 96) sono in **pixel
assoluti e non scalate**, quindi un trascinamento di 40 px vuol dire la stessa
cosa su ogni schermo. Cio' che NON vuol dire la stessa cosa e' il punto da cui
parte — ed e' esattamente quello che l'atto risolve.

In rilettura: `x = posaLocale.x + scostamento`.

### 3.3 I due tipi di riga nuovi

```
12  [id, t, esito, slot, ux, uy]     l'atto risolto        (sostituisce il tipo 0)
13  [id, dx, dy]                     lo scostamento        (sostituisce il tipo 1)
```

I tipi 0 e 1 **restano leggibili**: un nastro vecchio si rigioca come sempre.
Il gioco non li **scrive** piu'.

### 3.4 La squadra non si ricalcola

`Touch5.teamOf(x)` viene avvolto dall'esterno, con la stessa dottrina delle
quattro porte: in rilettura torna la squadra **scritta nel nastro** per quel
dito, e non la deduce da `innerWidth/2`. E' la differenza fra «la squadra
viaggia» e «la squadra viaggia e poi la si butta»: il falso
`_crit-schermi-ricalcola` esiste apposta per condannare la seconda.

---

## 4. `MOTORE_V`: SI MISURA

La cura **non cambia l'esito di sequenze di comandi identiche** — `risolvi` e'
puro, `applica` e' il corpo di prima riga per riga, e i tipi 0/1 restano. Da
sola, quindi, non muoverebbe `MOTORE_V`.

**Ma il formato cambia in modo asimmetrico**, e l'asimmetria e' pericolosa in
una sola direzione: un telefono con la versione VECCHIA che legge un nastro
NUOVO non conosce i tipi 12 e 13, li butta in silenzio (`esegui` non ha un
ramo), rigioca una partita **senza comandi** e dice **NON TORNA** a un onesto —
l'unico verdetto che muove punti.

Quindi si misura due volte, e si decide col numero in mano
(`strumenti/_t-144-motorev.js`):

1. **N nastri v3 registrati sul merge-base, rigiocati sul curato**: se
   l'esito e' identico, la cura e' neutra e il primo criterio di `MOTORE_V`
   non scatta.
2. **N nastri NUOVI giudicati dal gioco del merge-base**: se ne esce NON
   TORNA, il secondo criterio scatta e `MOTORE_V` **deve** salire, perche'
   e' l'unica cosa che trasforma quell'accusa in un'astensione con causa
   vera (`ALTRO MOTORE / motore-diverso`).

**Il prezzo, da dichiarare**: con `MOTORE_V` a 4 i nastri v3 gia' sul server
diventano ingiudicabili. Restano a `verificata = 0`, non perdono punti, e il
#143 ha gia' pagato lo stesso prezzo ieri (2 -> 3): i nastri v3 esistenti hanno
meno di un giorno.

---

## 5. LE ASTENSIONI DELLO SCHERMO: CHE FINE FANNO

**Non si tolgono, si condizionano.** Togliere `schermo-ignoto`,
`schermo-diverso` e `schermo-cambiato` renderebbe giudicabili i nastri vecchi
che non lo sono. Tenerle com'erano renderebbe inutile tutta la cura.

La regola nuova e' una riga, e non e' una data ne' una versione: **il nastro
si astiene sullo schermo se e solo se porta un PIXEL**, cioe' se ha almeno una
riga di tipo 0 o di tipo 1.

```
const pixel = Reg.righe.some(r => r[1] === 0 || r[1] === 1);
if(pixel){  ...le tre astensioni di sempre...  }
```

E' onesto perche' guarda **il nastro**, non la sua eta': un nastro costruito a
mano con un pixel dentro si astiene, un nastro di soli atti no.

La riga di tipo 10 (la misura della finestra) **si continua a scrivere**:
costa cinque numeri per cambio, e serve ancora a chi legge un referto per
capire su che telefono si e' giocato. Non decide piu' niente.

**La staffetta** (`strumenti/staffetta.js`) oggi raggruppa i nastri per misura
di schermo, perche' deve aprire una finestra di quella misura. Un nastro
senza pixel **non chiede nessuna finestra**: va nel gruppo «qualunque misura»,
che si giudica con la finestra gia' aperta. Il raggruppamento si semplifica, e
il cancello `_q-staffetta` deve restare verde.

---

## 6. IL BANCO CHE CONDANNA — `strumenti/_q-schermi.js`

Nasce **ROSSO**. Un nastro onesto solo, giudicato a **sei bracci**:

| braccio | che cosa cambia |
|---|---|
| `800x360` | lo schermo (il piu' stretto del #133) |
| `844x390` | lo schermo |
| `915x412` | la misura di taratura del gioco — **e' quella di registrazione** |
| `1280x720` | lo schermo, il piu' largo |
| `POLLICE` | 915x412, **scala 150% / spazio 140% / mancino** |
| `TACCA` | 915x412, `safe-area-inset` a 44/34 px (il telefono con la tacca) |

Due misure per braccio, e tutte e due devono coincidere:

- **il VERDETTO** del giudice sul nastro vero;
- **il PUNTEGGIO RIGIOCATO**, con l'astensione aggirata (la riga 10 riscritta
  alla misura locale, come `conMotore` fa per il motore dal #142). Senza
  questa seconda misura il banco misurerebbe solo la propria astensione — la
  lezione del #141 e del #142.

Oggi: il verdetto e' TORNA a 915x412 e `INCOMPLETO/schermo-diverso` alle
altre; i punteggi rigiocati divergono. Dopo la cura: **sei verdetti uguali,
sei punteggi uguali.**

### I falsi, costruiti nel CASO PEGGIORE

| falso | la bugia | deve essere BOCCIATO da |
|---|---|---|
| `_crit-schermi-pixel` | registra l'atto e **rigioca dal pixel** (il pixel del registratore viaggia di nascosto accanto all'atto) | tutti i bracci di schermo |
| `_crit-schermi-mezza` | **la mezza cura**: normalizza il punto sul rapporto `innerWidth/innerHeight` e basta, pollice e tacca restano aperti | i bracci POLLICE e TACCA, e NON quelli di solo schermo |
| `_crit-schermi-ricalcola` | mette la squadra nel comando e poi in rilettura la **ricalcola** con `teamOf(x)` | il braccio che gioca in modalita' 2 |
| `_crit-schermi-grana` | quantizza `ux,uy` a un ottavo invece che al millesimo | i bracci in cui la grana sposta il disco preso |

**La mezza cura e' il falso che conta**: e' la cura che chiunque scriverebbe
leggendo solo il #133, ed e' quella che il banco deve saper bocciare. Se
passasse, il banco starebbe attestando.

---

## 7. QUEL CHE QUESTO CANTIERE NON FA (dichiarato)

- **Non tocca la simulazione.** INV-12 regge: zero sorteggi nuovi, zero rami
  nuovi nella fisica.
- **Non tocca il duello**: il tipo 6 e' gia' semantico (§2).
- **Non tocca il ritardo del #141**: la coda resta piu' fuori del registro, e
  l'ordine dito -> coda -> registro -> Touch5 non cambia.
- **Non costruisce un filo, una stanza o un lockstep**: sono #145, #146, #144
  dell'elenco dell'architettura (che questo cantiere rinumera di fatto: qui la
  voce #144 e' il comando senza schermo, non la stanza).
- **Il residuo dichiarato**: la riadozione della levetta (`Touch5.move`,
  `:14858-14866`) chiede «questo dito e' su un pulsante?» sulla posizione
  CORRENTE, cioe' dopo il trascinamento. Il punto di posa e' invariante per
  costruzione (§3.1), il punto dopo un trascinamento no: la differenza fra i
  due capi e' limitata dalla differenza dei raggi. Il banco lo esercita con un
  braccio che mette in pausa a meta' partita; se un giorno mordesse, la cura e'
  un bit in piu' sul tipo 13, non un disegno diverso.
