# L'invariant-checker e la pulizia di _c3-sorteggi (voce #125, onda C — 1)

20 settembre 2026. Primo anello dell'ONDA C (robustezza) del programma
(`_analisi/MAPPA-MANDATO.md`, righe 574-641, 753-760). Il mandato (§13, Appendice
A) chiede: property-based test (input casuali per migliaia di tick che non violino
mai le invarianti), soak (1000 partite/notte, zero violazioni, nessuna partita >
durata attesa +25%), e "ogni bug ha prima un test fallito". La mappa traduce in tre
voci in ordine di dipendenza: **invariant-checker (1g) -> fuzzer (2g) -> soak (2g)**.
Questo cantiere fa il PRIMO anello (le invarianti sono il prerequisito del fuzzer:
senza, il fuzzer non sa cosa cercare) piu' il micro-fix #124 (quasi gratis, e
pulisce lo strumento di misura prima che fuzzer/soak lo usino).

## Le due decisioni prese (dalla ricognizione, correggibili dal committente)
1. **Il checker e' un BANCO** (`strumenti/_q-invarianti.js`), non codice sempre-attivo
   in produzione: legge lo stato del motore via `__test` (come `_q-determinismo`,
   `_q-umore`, `_diag-nan`) e verifica le invarianti a ogni tick / a campione durante
   una partita guidata. Cosi' il gioco NON paga il costo a runtime e non si rischia
   di introdurre bug nel motore. La mappa dice "dentro il motore" e "sotto un flag di
   collaudo" (riga 621) come OPZIONE non decisa: un checker in-motore sotto flag resta
   un seguito futuro, se mai servisse al fuzzer per fermarsi al primo tick rotto.
2. **#123 (fotosensibile per-regione) resta FUORI** dall'onda C: cantiere di
   accessibilita' a se' (3-5g stimati), su un buco oggi TEORICO (non misurato nel
   gioco). A registro come seguito, non aperto qui.

## Le invarianti del mandato (Appendice A, INV-01..15) e la copertura
Il mandato elenca 15 invarianti "checked every tick in tests and in soak runs".
Questo cantiere costruisce il banco che le verifica; NON tutte sono ugualmente a
rischio o ugualmente esprimibili. Copertura pianificata (le altre voci dell'onda C
— fuzzer, soak — le eserciteranno con input casuali; qui il banco nasce con la
verifica e i casi-bugiardi):
- **NaN/Infinity** in `ball.{x,y,z,vx,vy,vz}` e `p.{x,y,vx,vy,aiTX,aiTY}` — oggi solo
  in `_diag-nan.js` (NON in batteria): il banco lo assorbe come invariante permanente.
- **`G.ball.owner`** sempre -1 o indice valido (e non un giocatore `out>0`) — ~20
  siti d'assegnazione, nessun controllo unico oggi.
- **Punteggio non decrescente** (`G.score[team]` solo `++`, mai `--`).
- **`G.timeLeft`** monotono non crescente e mai < 0.
- **Durata <= attesa + 25%** (INV-15, la clausola dell'hang #119): la partita
  CPU-CPU raggiunge `'end'` entro il tetto. Oggi solo in `_q-cpu-ordine.js` (2
  scenari fissi): il banco lo generalizza a N semi.
- **Cronometri-fratelli** azzerati dopo `startMatch` (la famiglia
  `G.recT/vantaggio/swLock/swTimer/possOwner/possT/pulse/crowdSndT`,
  CALCETTO-il-gioco.html:13239-13254): LA PIU' A RISCHIO — cinque regressioni pagate
  a mano (#86/#87/#107/#117/#122). Il checker verifica che OGNI cronometro dichiarato
  sia al suo valore di riposo subito dopo `startMatch`, chiudendo la classe per
  sempre invece di scoprirla una sesta volta.
- **Clamp degli stati**: `p.fiato`/`p.cond` in [0,100], `p.umore` in [-1,1],
  `p.nervi` in [0,1], `G.spinta` in [-1,1] (gli ultimi tre gia' in `_q-umore` prova
  TETTI — il banco invarianti li ricontrolla come classe, o cita la copertura).
- **>= 2 uomini di movimento in campo** (regola futsal di casa, guardia :18517).
- **Palla non sotto il piano** / velocita' entro un tetto (da verificare se esiste un
  clamp; se no, e' un'invariante scoperta interessante).
- Le INV del mandato gia' coperte altrove (determinismo = `_q-determinismo`;
  "presentation never mutates sim" = due-versioni/disegno-puro; sequenza cartellini
  = `_q-regole`) si DICHIARANO coperte, non si riscrivono.
La copertura si mappa nel verbale: quali INV-01..15 il banco copre, quali sono
coperte da altri banchi, quali restano per il fuzzer/soak.

## Il metodo (legge di casa)
Ogni invariante del banco NASCE in grado di CONDANNARE: una versione BUGIARDA
costruita apposta (modello `_crit-festa-dado`/`_crit-mind-tetto`) che viola
quell'invariante deve far scattare il banco ROSSO. Un'invariante che non sa
condannare non misura. Le invarianti non devono essere ne' banali ("il punteggio e'
un numero") ne' false-positive (una soglia tarata sul gioco di oggi che condanna un
cambiamento legittimo domani — la lezione #112/#114). Seme fisso, deterministico.

## #124 — la pulizia di _c3-sorteggi (micro)
`strumenti/_c3-sorteggi.js:46-47` fa l'errore #108 (`setCpuVsCpu(true)` PRIMA di
`startMatch`, che lo annulla): la squadra 0 resta "umana immobile". Cura: scambio di
due righe (setCpuVsCpu DOPO startMatch), come il #121 fece per _q-battute/_q-regole/
_q-umore. AVVISO da dichiarare nel verbale: `_c3-sorteggi` e' lo strumento del
confronto due-versioni di OGNI cantiere; correggerlo cambia la BASE DI MISURA futura
(la squadra 0 diventa CPU vera anche qui) — e' un cambio di METODO di misura, non di
gioco. `_q-cpu-ordine` NON lo intercetta (verifica il gioco, non il codice degli
strumenti): la correzione e' a mano. Chiude #124.

## Il cantiere in due (o tre) cure
1. **#124 + le invarianti "solide"**: correggi _c3-sorteggi (2 righe, dichiarato);
   crea `strumenti/_q-invarianti.js` con NaN/Infinity, owner valido, punteggio
   monotono, timeLeft monotono, durata<=tetto+25%, cronometri-fratelli. Ciascuna
   nata rossa su una versione bugiarda. Guida partite CPU-CPU a seme fisso (ordine
   setCpuVsCpu GIUSTO), verifica a ogni tick campionato.
2. **Le invarianti restanti + copertura**: clamp stati (fiato/cond, e cita _q-umore
   per umore/nervi/spinta), >=2 uomini, palla sotto il piano; la mappa INV-01..15
   (coperta qui / altrove / rimandata al fuzzer). Casi bugiardi per ciascuna nuova.
3. **Batteria + verbale**: `_q-invarianti` in `tutti.js` (conta:true); verbale in
   MANUALE (voce #125) con la copertura delle 15 INV, il metodo bugiardo, #124
   chiuso e il cambio di base di misura dichiarato; PUNTO aggiornato. (Se i compiti 1
   e 2 sono snelli, 2+3 si accorpano.)

## Vincoli
- Cantiere di BANCO (+ 2 righe in _c3-sorteggi): il gioco NON si tocca (salvo un
  eventuale hook `__test` per leggere uno stato non esposto — via attrezzo, se serve).
  Il due-versioni resta la firma: se il banco invarianti tocca il gioco oltre un hook
  di sola lettura, e' un errore.
- Ogni invariante nata rossa (versione bugiarda). Deterministico, seme fisso, taglia
  5 (#98) per le misure; le invarianti strutturali (owner, NaN, cronometri) valgono a
  ogni taglia — dichiarare dove si misura.
- Commenti senza accentate; un commit per compito; verbale a edizioni.

## Fuori perimetro
Il fuzzer (voce successiva dell'onda C) e il soak (idem): questo cantiere fa le
INVARIANTI, che sono il loro prerequisito. Il checker in-motore sotto flag (seguito,
se il fuzzer lo chiedera'). #123 (per-regione). Il banco "battito" delle pose (§8.8,
animazione, non robustezza engine). Le INV gia' coperte non si riscrivono.
