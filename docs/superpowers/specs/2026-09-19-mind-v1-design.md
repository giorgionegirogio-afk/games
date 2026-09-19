# Il registro dei fatti e il MIND v1 — progetto (onda B, voce #117)

19 settembre 2026. Primo cantiere dell'onda B del programma approvato
(`_analisi/MAPPA-MANDATO.md`): il modello emotivo, il pilastro che il mandato
mette al centro (§7) e che nessun concorrente mobile fa bene. Il design è già
approvato nella mappa (sezione 2, «Il modello emotivo — MIND», la seconda
corsa: stati, tetti, canali, banco, con tutti gli avvisi di legge di casa).
Questo documento lo fissa coi numeri della ricognizione del 19 settembre
(ancoraggi verificati sull'HEAD `f352af5`, da riverificare col grep).

## La cosa che rende questo cantiere diverso da tutti i precedenti
Il MIND v1 è il primo del programma che **cambia il feel della CPU in modo
sistematico** (le manopole modulate dall'umore): non una regola puntuale come
il rigore, ma un canale che tocca come la squadra gioca. Perciò:
- Il **due-versioni DIVERGE per costruzione** dal compito che introduce il
  canale di gioco (le manopole cambiano le decisioni CPU): si dichiara per
  taglia col numero, mai nascosto. Il cancello che DEVE restare verde è
  **`_q-determinismo`** (stessa versione, stesso seme, due corse identiche) —
  la proprietà che serve al multigiocatore, intatta.
- Il compito del registro e degli stati (osservazione pura) NON diverge:
  0/60 lì. La divergenza è confinata al canale di gioco.
- La **giocabilità va misurata** (`_eventi` prima/dopo): il feel non deve
  peggiorare (gol/min entro banda). È il punto di controllo del committente:
  se peggiora, ci si ferma.

## Le leggi di casa che governano il cantiere (dagli avvisi della mappa)
1. **Zero `dado()`**: il modello è DETERMINISTICO DAI FATTI. Gli stati derivano
   da eventi già calcolati (gol, parata, fallo, condizione…), non da sorteggi.
   Se un giorno servisse un sorteggio, un generatore PROPRIO, mai `SEME`.
2. **Mai sull'input umano**: le manopole modulano ciò che il *footballer* fa
   con l'intento, entro i tetti; il dito umano (stick, verbi) è sempre onorato.
   `isHuman` escluso o trattato identico all'IA nell'aggiornamento degli stati,
   così un umano produce gli stessi stati della CPU e il banco CPU-CPU è fedele.
3. **Effetti a tetto, simmetrici**: ogni canale ha un tetto dichiarato, la
   formula è identica per le due squadre; la simmetria si verifica sulla
   FORMULA e su un banco a specchio CPU-CPU (non sulla partita umana — la
   squadra 0 non ha carattere: `G.car[0]=CAR_NEUTRO`).
4. **Sempre visibile**: ogni stato che supera una soglia ha un canale d'occhio
   acceso (pose, banner, folla). Uno stato senza espressione va cancellato
   (§7.2 del mandato) — il banco lo verifica (prova TESTIMONE).
5. **Misura a taglia 5**: la #98 è aperta (determinismo instabile a 7/11); ogni
   misura del modello si prende a taglia 5, a 7/11 si dichiara contro quel fondo.
6. **Ogni nuovo stato entra nel confronto di replay**: `p.umore`, `p.nervi`,
   `G.spinta` vanno inclusi dove il determinismo confronta le partite, o
   `_q-determinismo` resta cieco al nuovo stato.
7. Il banco nasce ROSSO su una **versione bugiarda** costruita apposta (modello
   `_crit-festa-dado.js`).
8. **La tavola dei numeri va nel MANUALE** (voce a registro, con la misura del
   banco accanto), NON in un `docs/MIND.md` con citazioni accademiche: le fonti
   (Den Hartigh, Jordet…) sono ancore di progetto, non prove di casa.

## Che cosa esiste già (la ricognizione lo conferma)
- `p.celeb`/`p.mesto`: due stati emotivi con trigger (il gol), decadimento a
  passo fisso e espressione (le clip). Il mandato §7.4 li CONFERMA. Oggi sono
  «stati di solo disegno»: il MIND li rende l'espressione di stati continui.
- `manopole(t)` (:9332) col ritorno anticipato neutro (garanzia dell'indirizzo
  identico); `manopoleDi(t)` (:9360) è la via letta a runtime; `G.knob`
  popolato una volta per squadra in `startMatch` (:11159-11160) — CONDIVISO dai
  11 giocatori, non mutabile in-place.
- I due segnaposto «FATTO DA EMETTERE» (:12354, :12416) con lo schema
  `{che,chi,dove,esito,t}`; `G.golLog` (:11389) come precedente di registro-gol;
  `G.rec` (:35468, azzerato a :10981) come modello di buffer tetto+shift.
- `updatePlayerFisica(p,dt)` (:17856) aggiorna `p.cond`/`p.fiato` a passo fisso
  — la sede degli stati per giocatore; `teamBrain(t,dt)` a `BRAIN_HZ=0.25`
  (:20388) — la sede di `G.spinta`.
- `_crit-festa-dado.js` (il gioco bugiardo), `_q-determinismo`, `_c3-sorteggi`.

## Il MIND v1, in sei cure

### 1. Il registro dei fatti (P0 — prerequisito)
`G.fatti`: array azzerato in `startMatch` (accanto a `G.rec.length=0`, :10981),
tetto `FATTI_MAX` con push+shift (modello `G.rec` :35468). Ogni fatto è
`{che, chi, dove, esito, t}`: `che` stringa fissa (gol/autorete/parata/presa/
respinta/sfugge/legno/fallo/giallo/espulsione/rubata/acciacco/cambio/rigore),
`chi`=`G.players.indexOf(p)` (indice, non l'oggetto), `dove`=`[x,y]`,
`esito`=sotto-oggetto per evento, `t`=cronometro di gioco. Emesso dai rami GIÀ
presi: i due segnaposto diventano codice; addGoal, infliggiCartellino,
esitoRigore, i blocchi porta (parata/presa/respinta/sfugge), il palo/traversa,
il fallo e la rubata (da localizzare col grep: la ricognizione non li ha
trovati). ZERO `dado()`: un buffer non è una probabilità. Il registro è un
trascrittore PASSIVO — se anche un solo fatto alterasse una decisione, sarebbe
un difetto (il due-versioni lo coglie: 0/60 atteso a questo compito).

### 2. Gli stati: umore, nervi, spinta (osservazione, non ancora effetto)
`p.umore` (−1..+1), `p.nervi` (0..1) per giocatore, aggiornati a passo fisso in
`updatePlayerFisica` (dopo il blocco `p.fiato`, :18119) DAI FATTI e dalla
condizione — mai `dado()`, mai dall'input umano. `G.spinta[team]` (−1..+1):
media mobile esponenziale degli impatti firmati dei fatti, mezza vita 20 s di
gioco (`alpha = 1 − 0.5^(dt/20)`), aggiornata in `teamBrain` o `step`. Trigger
dai fatti (Appendice B del mandato riscalata): gol ±, parata, palo, fallo
subito, cartellino, rubata subita/fatta… Moltiplicatore di tempo CONTINUO
`1 + 0.6*(1 − timeLeft/durataPartita())` (non le soglie a 60'/85' del mandato,
che a 90-180 s non esistono; e NON `G.capCond`, che è un fattore fisso per
partita). `celeb`/`mesto` restano e DIVENTANO l'espressione di questi stati.
Azzerati in `startMatch`, resettati in `faiCambio` (il rincalzo entra a umore 0,
nervi 0). **Questo compito è osservazione pura**: gli stati leggono i fatti, non
influenzano ancora nulla → due-versioni 0/60 atteso.

### 3. Il canale di gioco: `manopole(t, p)` (qui inizia la divergenza)
La firma diventa `manopole(t, p)` e i punti che oggi leggono `manopoleDi(p.team)`
(e poi `dado()<D.slideP`, `dado()<D.passErr`, `D.standoff`) leggono una manopola
MODULATA dall'umore del singolo `p`, DOPO il carattere. Tre voci a tetto,
tutte relative, formula identica per le due squadre:
- `passErr` ÷ `(1 + 0.15*p.umore)` — tetto ±15% (l'equivalente della dispersione
  ±8% del mandato: qui l'errore è una probabilità, non un angolo);
- `slideP` × `(1 + 0.25*p.nervi)` — tetto +25% (il numero del mandato);
- `standoff` × `(1 − 0.12*G.spinta[t])` — la squadra in fiducia aspetta meno
  (con guardia: `standoff` non deve andare sotto 0).
Il ritorno neutro si conserva quando i tre stati sono a zero (la garanzia
dell'indirizzo identico si rompe SOLO quando l'umore non è zero: dichiararlo in
commento). Mai sull'input umano (la squadra 0 non ha carattere; se un umano
controlla, le sue manopole non toccano il suo verbo). **Qui il due-versioni
DIVERGE per costruzione** (le manopole cambiano le decisioni CPU): si dichiara
per taglia. `_q-determinismo` resta verde.

### 4. I due canali d'occhio (che già leggono)
(a) `p.mesto` si accende anche dai fatti (tiro sbagliato da buona posizione,
fallo subito senza fischio, cartellino) con durata funzione di `p.umore`, tetto
3,0 s, un uomo per volta per squadra (la regia di casa: non il coro). L'esultanza
resta com'è (il mandato la conferma). (b) La folla: al livello già calcolato
(`Audio5.crowdLevel`, :17034) si somma `0.35*max(0, G.spinta[squadra che attacca])`,
e la curva batte anche quando la spinta supera 0,6. Banner «TESTA ALTA» / «CI
CREDONO» sui cambi di scalino di `G.spinta` (stessa funzione showBanner,
disegno puro). Rispetta MOVIMENTO RIDOTTO. **Disegno puro → 0/60.**

### 5. Il banco che condanna, completo: `strumenti/_q-umore.js`
Nasce al compito 1 con la prova REGISTRO e cresce compito per compito (STATI al
2, CANALE+TETTI al 3, TESTIMONE al 4), poi al compito 5 le prove che chiudono:
- **SPECCHIO**: due squadre con storie di eventi speculari hanno stati speculari
  al bit (seminando la stessa partita a squadre scambiate) — la mirrored-history
  fairness del mandato.
- **TETTI**: su N partite nessuna manopola supera il tetto dichiarato, col
  massimo osservato STAMPATO (non un sì/no).
- **INPUT-SACRO**: stesso nastro di comandi e stesso seme, il verbo che esce dal
  dito è lo stesso prima e dopo il modello (impianto di `_q-replay`).
- **GIOCO-BUGIARDO**: una versione col tetto violato e una collo stato muto — il
  banco DEVE farsi rosso su entrambe (modello `_crit-festa-dado.js`).
Più i cancelli di casa: `_q-determinismo` 10/10 sulla stessa versione;
`_c3-sorteggi` col verdetto dichiarato (0/60 fino al compito 2, divergenza
dichiarata dal 3). Tutto a taglia 5 (#98), CPU-CPU, con la dispersione accanto.

### 6. Giocabilità, batteria, verbale
`_eventi` prima/dopo (il canale cambia il feel): gol/min entro ±20% del
pre-cantiere, dispersione dei tiri, i tetti misurati — **il punto di controllo
del committente**. `_q-umore` in batteria. Sorteggi complessivi dal merge-base:
0/60 fino al compito 2, divergenza dichiarata dal 3, per taglia. Verbale in
MANUALE (voce #117 con la tavola dei numeri e la misura del banco accanto; la
CONFERMA del mandato: celeb/mesto erano già due stati) e PUNTO. La tavola degli
effetti (i tre tetti) nel MANUALE, non in docs/MIND.md.

## Fuori perimetro (è il v1; il v2 è un cantiere futuro)
Contagio nel tempo e peso del capitano (§7.4); regolazione senza intervallo,
capitano che rallenta (§7.6); la striscia del momento post-partita (§7.8); il
volto che cambia (§7.7); il dischetto sotto pressione (§7.1); l'HUD dell'umore
(§7.7). Tutti registrati come seguito **#118 (MIND v2)**. Niente `docs/MIND.md`
separato. Nessun cambio a SAVE. La squadra umana non acquisisce carattere
(decisione di casa, :10942 storica): la simmetria si verifica CPU-CPU.
