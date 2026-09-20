# Le due crepe del fuzzer + il residuo — piano (voce #128)

Progetto: `docs/superpowers/specs/2026-09-20-crepe-fuzzer-design.md`.
Base: `main` = `bc2d802` (NON il ramo fuzzer #126, che resta sospeso e si riprendera'
dopo, rebasato su main curato). Ramo: `voce-128-crepe-fuzzer`. Cantiere di MOTORE.
Tre compiti, un commit per compito, revisione finale + fusione.

## Vincoli globali
1. Ogni tocco al gioco via ATTREZZO a ancore (`--out` dry-run poi `--dentro`, scritto
   PRIMA di applicare).
2. **Il due-versioni DIVERGE per costruzione** (le cure cambiano l'esito di alcune
   sequenze): si dichiara per taglia. **`_q-determinismo` DEVE restare verde**.
3. **MOTORE_V**: valutare a banco (`_q-replay`) se un nastro vecchio diverge sul gioco
   curato; se si', incrementare (1->2) e verificare che `Sfida.guarda` gestisca la
   versione. Decidere coi NUMERI, non a priori. Se nessuna delle due cure cambia un
   nastro rigiocabile, MOTORE_V resta 1 (dichiarato).
4. **Ogni P0 ha prima un TEST FALLITO** (mandato §13.3): uno scenario DIRETTO
   deterministico (non serve il fuzzer, che e' sul ramo #126) che riproduce la
   violazione, ROSSO sul gioco di oggi, VERDE dopo la cura. Aggiungi le prove a
   `strumenti/_q-invarianti.js` (il banco naturale delle invarianti) o a un banco
   dedicato — riusa gli scenari gia' costruiti dalla diagnosi.
5. Commenti senza accentate; un commit per compito; verbale a edizioni.

## Compito 1 — P0-1: il cross-proiettile (doCross)
**Test prima.** Aggiungi a `_q-invarianti.js` una prova DOCROSS: uno scenario diretto
che forza un CROSS LUNGO (grep come innescare `doCross`, ~:15888; o via `Touch5`+
disco cross a lunga distanza, o chiamando `doCross` con un bersaglio lontano) e
verifica che la velocita' della palla resti <= `TETTO_VEL_PALLA` (la prova 9). ROSSA
sul gioco di oggi (misura la velocita' > tetto, fino a ~1447 u/s).
**Cura.** Attrezzo `_t-crepe-docross.js`: clampa la velocita' del cross al tetto
coerente col resto (leggi `tiroVelocita`/`TIRO_TETTO` ~:16181; clampa `speed` in
`doCross` come fanno gli altri tiri). Il cross NORMALE (dist tipica) deve restare
INVARIATO — solo i cross oltre il tetto cambiano (ricadono prima). Verifica.
**Cancelli.** DOCROSS rossa->verde; il cross normale invariato (misura una traiettoria
tipica prima/dopo: identica); `_q-invarianti` 9/9 verde sul gioco curato; due-versioni
DICHIARATO (diverge sui cross lunghi — misura per taglia); `_q-determinismo` verde;
MOTORE_V valutato con `_q-replay` (un nastro con un cross lungo diverge? se si',
MOTORE_V++, dichiarato). Un commit.

## Compito 2 — P0-2: il battitore espulso (resetKickoff)
**Test prima.** Aggiungi a `_q-invarianti.js` una prova KICKOFF-ESPULSO: lo scenario
diretto della diagnosi (stagiona `G.vantaggio.card` sul giocatore team/idx1 +
`G.stats.gialli` al limite dell'espulsione + `G.kickTeam`, chiama `resetKickoff()`) e
verifica che `G.ball.owner` NON sia un giocatore `out>0` (la prova 2). ROSSA oggi
(owner finisce sull'espulso).
**Cura.** Attrezzo `_t-crepe-kickoff.js`: alla condizione di scelta del battitore
(:10955) aggiungi `&& p.out<=0`; se idx1 non e' eleggibile, fallback a
`diMovimentoInCampo(p.team)[0]` (pattern di `infliggiCartellino` :18529). Verifica che
un kickoff NORMALE (nessuna espulsione) scelga lo stesso battitore di prima
(invariato).
**Cancelli.** KICKOFF-ESPULSO rossa->verde; kickoff normale invariato; `_q-invarianti`
verde; due-versioni DICHIARATO (diverge nei kickoff dopo espulsione); `_q-determinismo`
verde; MOTORE_V valutato. Un commit.

## Compito 3 — Il residuo + batteria + verbale
**Indagine residuo.** Isola cosa sopravvive tra partite sulla stessa pagina (la stessa
coppia di semi da' partite diverse a seconda di quante la precedono). Metodo: gioca il
seme S isolato (pagina fresca) e dopo K partite; confronta lo stato iniziale della
partita S nei due casi (dopo `startMatch`); trova il PRIMO campo che differisce. Escludi
gia' `G.stats`/`G.players` (azzerati). Candidati: `SEME` che non si re-semina identico
tra partite (il banco chiama `t.semina` per ogni partita? o solo all'inizio?); un buffer/
cache globale; un cronometro fuori dalla lista dei fratelli; uno stato in `Reg`/`Audio5`/
altro. Una volta trovato: se e' un bug (stato che dovrebbe azzerarsi in `startMatch`),
CURALO (attrezzo, azzeramento in startMatch) con una prova; se e' un artefatto del
BANCO (es. il banco non ri-semina tra partite, e il gioco e' sano quando ri-seminato),
dichiaralo (e correggi il banco/fuzzer, non il gioco). Se l'indagine si rivela grande
(un cantiere a se'), DICHIARA la causa trovata e RIMANDA la cura a un seguito nominato,
senza forzarla qui.
**Batteria + verbale.** Batteria intera (le cure toccano la simulazione: rilancia
tutto; audio.js/istantanea pre-esistenti dichiarati). Verbale in MANUALE (voce #128):
le 2 P0 curate coi test rosso->verde, l'esito MOTORE_V (incrementato o no, coi numeri),
il due-versioni dichiarato per taglia, l'esito del residuo (curato/dichiarato/rimandato).
PUNTO aggiornato. Un commit.

## Chiusura
Revisione finale del ramo (modello capace): le 2 cure risolvono le P0 (i test
rosso->verde), il comportamento normale (cross tipico, kickoff senza espulsione)
invariato, MOTORE_V corretto (nastri vecchi gestiti), due-versioni dichiarato,
`_q-determinismo` verde, il residuo trattato onestamente. Se «Ready to merge: YES»:
fast-forward, smoke, push, ramo eliminato, ledger aggiornato. POI si riprende il fuzzer
(#126): rebase su main curato, i suoi test 9/2 tornano verdi, si completano duello +
INV-04 + batteria. Poi il soak (onda C-3).
