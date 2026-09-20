# L'invariant-checker e #124 — piano (voce #125, onda C — 1)

Progetto: `docs/superpowers/specs/2026-09-20-invarianti-design.md`.
Base: `main` = `a7561d0`. Ramo: `voce-125-invarianti`. Cantiere di BANCO (il gioco
non si tocca, salvo eventuali hook __test di sola lettura via attrezzo, e 2 righe in
_c3-sorteggi per #124). Tre compiti, un commit per compito, revisione finale + fusione.

## Vincoli globali
1. **Il gioco non si tocca** (`CALCETTO-il-gioco.html`): il banco legge lo stato via
   `__test` (come `_diag-nan`/`_q-determinismo`/`_q-umore`). Se serve esporre uno
   stato non ancora accessibile, un hook `__test` di SOLA LETTURA via attrezzo a
   ancore — nessuna logica di gioco. Il due-versioni resta la firma (0/60 se si tocca
   il gioco solo con un getter).
2. **Ogni invariante NASCE ROSSA** su una versione bugiarda costruita apposta
   (modello `strumenti/_crit-festa-dado.js`/`_crit-mind-tetto.js`): se il banco resta
   verde su una versione che viola l'invariante, l'invariante non misura.
3. **Deterministico**, seme fisso (`semeFisso` da `_posa.js`), ordine `setCpuVsCpu`
   GIUSTO (dopo `startMatch`). Misure a taglia 5 (#98); le invarianti strutturali
   (owner/NaN/cronometri) valgono a ogni taglia — dichiarare dove si campiona.
4. Le invarianti non banali e non false-positive (lezione #112/#114). Commenti senza
   accentate; un commit per compito; verbale a edizioni.

## Ancore (riverificare col grep)
- `strumenti/_diag-nan.js` (il rilevatore NaN esistente, da assorbire); `_q-cpu-ordine.js`
  (durata<=tetto, INV-15 puntuale, da generalizzare); `_q-determinismo.js`/`_q-umore.js`
  (INV gia' coperte, da citare); `_c3-sorteggi.js:46-47` (l'ordine sbagliato #124).
- Gioco (sola lettura): `G.ball.owner`, `G.score`, `G.timeLeft` (:17305-17307),
  i cronometri-fratelli (:13239-13254), `p.fiato`/`p.cond`/`p.umore`/`p.nervi`/
  `G.spinta`, la guardia >=2 uomini (:18517), `startMatch` (:10924), `__test`
  (~:43800-43850).

## Compito 1 — #124 + le invarianti solide
**Obiettivo.** (a) **#124**: in `strumenti/_c3-sorteggi.js` (:46-47) scambia le due
righe (`startMatch` PRIMA, `setCpuVsCpu(true)` DOPO). Verifica che il due-versioni
storico regga (rilancia _c3-sorteggi su una coppia nota, es. contro un commit
recente, e dichiara che i totali cambiano perche' la squadra 0 e' ora CPU vera — e'
il cambio di base di misura dichiarato). (b) **`strumenti/_q-invarianti.js`** (calco:
`_q-determinismo.js`/`_diag-nan.js` per l'avvio, `_q-umore.js` per la struttura delle
prove): guida partite CPU-CPU a seme fisso (ordine giusto), verifica a ogni tick
campionato le invarianti SOLIDE:
- **NaN/Infinity** su ball.{x,y,z,vx,vy,vz} e p.{x,y,vx,vy,aiTX,aiTY} (assorbe _diag-nan).
- **owner valido**: G.ball.owner in {-1} U {0..N-1}, e se >=0 il giocatore non e' `out>0`.
- **punteggio monotono**: G.score[t] non diminuisce mai fra due campioni.
- **timeLeft monotono**: non cresce, mai < 0.
- **durata<=tetto+25%** (INV-15): la partita raggiunge 'end' entro il tetto (generalizza
  _q-cpu-ordine a N semi).
- **cronometri-fratelli** (LA PIU' A RISCHIO): subito dopo `startMatch`, ogni cronometro
  della famiglia dichiarata (:13239-13254) e' al valore di riposo. Enumera la lista dal
  commento del gioco; se un domani se ne aggiunge uno non azzerato, la prova lo coglie.
**Casi bugiardi (nati rossi).** Per ciascuna invariante, una versione che la viola deve
dare ROSSO: NaN iniettato; owner=indice-fuori-range; score decrementato; timeLeft che
risale; una partita che non raggiunge 'end' (riusa lo scenario hang #119, ordine
sbagliato); un cronometro non azzerato in startMatch. Genera i bugiardi con attrezzi
`_crit-inv-*.js` (o scene sintetiche), NON committare gli HTML bugiardi.
**Cancelli.** `_q-invarianti` VERDE sul gioco; ROSSO su ogni bugiardo (localizzato).
#124: _c3-sorteggi corretto, il cambio di base dichiarato. `_q-determinismo` intatto.
Un commit.
**Definizione di fatto.** #124 chiuso; il banco con 6 invarianti solide, ciascuna
condanna il suo bugiardo, verde sul gioco.

## Compito 2 — Le invarianti restanti + la copertura INV-01..15
**Obiettivo.** Aggiungi a `_q-invarianti.js`: clamp `p.fiato`/`p.cond` in [0,100]
(per umore/nervi/spinta cita la prova TETTI di `_q-umore` invece di duplicarla, o
ricontrollala come classe); **>=2 uomini** di movimento in campo (INV conteggio
giocatori); **palla non sotto il piano** / velocita' entro un tetto (verifica se
esiste un clamp nel gioco; se manca del tutto, e' un'invariante scoperta — dichiara
il tetto scelto e la ragione). Ciascuna nuova nata rossa su un bugiardo. Poi la
MAPPA INV-01..15 del mandato (Appendice A di `_analisi/MANDATO-STADIUM-ROAR.md`):
per ognuna, dichiara se e' coperta QUI, ALTROVE (con quale banco), o RIMANDATA al
fuzzer/soak.
**Cancelli.** `_q-invarianti` verde col set completo; i nuovi bugiardi rossi;
due-versioni 0/60 (se un hook __test e' stato aggiunto, di sola lettura); la mappa
INV-01..15 completa. Un commit.
**Definizione di fatto.** Le invarianti esprimibili a banco tutte presenti e
condannanti; la copertura delle 15 INV dichiarata onestamente.

## Compito 3 — Batteria + verbale
**Obiettivo.** `_q-invarianti` in `strumenti/tutti.js` (conta:true, sul modello
regole/umore/cpu-ordine). Batteria intera rilanciata (audio.js/istantanea
pre-esistenti dichiarati). Verbale in MANUALE (voce #125): le invarianti coperte, il
metodo bugiardo, la mappa INV-01..15, #124 chiuso e il cambio di base di misura di
_c3-sorteggi dichiarato, la nota che il checker e' un BANCO (non in-motore) e perche'.
PUNTO aggiornato (onda C avviata, #124 chiuso, #125 chiuso; restano fuzzer e soak).
**Cancelli.** Batteria verde (col nuovo banco); verbale coi numeri veri. Un commit.
**Definizione di fatto.** Il banco in batteria, il verbale a registro, l'onda C ha
il suo primo anello.

## Chiusura
Revisione finale del ramo (modello capace): ogni invariante condanna il suo bugiardo
(non attesta), il gioco non e' toccato (o solo un getter, due-versioni 0/60), #124
corretto e il cambio di base dichiarato, la copertura INV-01..15 onesta (nessuna INV
dichiarata coperta che non lo e'). Se «Ready to merge: YES»: fast-forward, smoke,
push, ramo eliminato, ledger aggiornato. Poi il fuzzer (onda C — 2), che usera'
queste invarianti come rete.
