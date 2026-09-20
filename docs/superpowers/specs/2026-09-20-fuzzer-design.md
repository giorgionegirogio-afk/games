# Il fuzzer di comandi (voce #126, onda C — 2)

20 settembre 2026. Secondo anello dell'ONDA C. Il mandato (§13.1.2): "property-based
tests: random inputs for thousands of ticks must never violate the invariants in
Appendix A (fuzzing the sim)". Le invarianti sono gia' in main (voce #125,
`strumenti/_q-invarianti.js`, 9 prove): questo cantiere costruisce il generatore di
input CASUALE (deterministico) che le esercita, coprendo i casi che il CPU-CPU non
tocca mai.

## La domanda chiave, risolta dalla ricognizione: NESSUN hook nuovo
Il gioco espone gia' tutto (raggiungibile "bare" via `page.evaluate`, come `G` in
`_q-invarianti.js`):
- **`Reg`** (`__test.registra()` -> `Reg.modo=1`; `__test.nastro()` -> serializza;
  `__test.rigioca(t)` -> deserializza) — la registrazione/riproduzione delle sfide.
- **`Touch5.start/move/chiudi/azzera`** (:13430/:13621/:13770) — l'INTERO alfabeto
  dell'input umano (stick + i 5 dischi). Avvolte da un intercettore (:43382-43415)
  che, se `Reg.modo===1`, le auto-registra: chiamarle dal vivo le scrive nel nastro.
- **`__test.pulsanti(t)`** (:44121) — le coordinate x/y/r VERE dei 5 dischi nel
  fotogramma corrente (contestuali: TIRA/CONTRASTA, FILTRANTE/CAMBIO, PASSA/PRESSA,
  CROSS/SCIVOLATA, SCATTO/SCUDO). Il fuzzer legge queste, non indovina VW/VH.
- **`Duel.pickZone/pickKeeper/stopPower`** (:22242/:22270/:22279) — per risolvere il
  duello del dischetto (vedi sotto).
- **`__test.simulate(1/60)`** avanza `step()` (che chiama `Reg.passo()` per primo):
  un nastro caricato con `rigioca` si riproduce da solo.
La prova C di `_q-determinismo` cercava `__test.dita` (mai esistito): il vero
meccanismo e' `Reg`+`Touch5`, gia' in produzione per le sfide.

## Come lavora il fuzzer
1. `t.semina(semeGioco)`; `startMatch(1,1,{size:5})` — la squadra 0 e' GIA' umana
   (`G.cpu=[false,true]`, `G.ctrl[0]=primoDiMovimento`), la 1 CPU. **NON** chiamare
   `setCpuVsCpu` (lascerebbe la 0 senza controllo, difetto #108/#119).
2. `t.registra()` (`Reg.modo=1`): da qui ogni `Touch5.*` si auto-registra.
3. Un **xorshift PROPRIO del fuzzer** (SECONDO seme, dichiarato e separato dal
   `SEME`/`dado()` del gioco, cosi' il conteggio dei sorteggi del gioco resta
   pulito) decide a ogni tick: tenere/muovere/rilasciare lo stick (direzione e
   magnitudine casuali, spesso verso i BORDI, per stressare INV-04), premere/
   rilasciare uno dei 5 dischi (coordinate da `pulsanti(0)`), o non fare nulla.
   Pesi realistici ma NON timidi: privilegiare i verbi mai esercitati dal CPU-CPU
   (`swap`=cambio-giocatore -> scrive `G.swLock`; lo strappo/finta -> `G.swLock`),
   non solo tiro/passaggio gia' ben coperti.
4. **Il DUELLO (scena `freekick`)**: `__test.simulate` chiama `Duel.update`, NON
   `step()`/`Reg` — il tick del nastro sta fermo e NIENTE del duello finisce nel
   nastro. Il fuzzer DEVE intercettare `G.scene==='freekick'` e risolvere il duello
   coi tre metodi `Duel.pickZone/pickKeeper/stopPower` (col PRNG del fuzzer), LOGGATO
   A PARTE (tick + argomenti): un log parallelo al nastro `Reg`, riapplicato per tick
   in riproduzione. Se NON gestito, la partita si blocca per sempre in freekick
   (falso hang, indistinguibile da un vero stato bloccato di INV-15).
5. `t.simulate(1/60)`; poi le 9 invarianti di `_q-invarianti.js` (RIUSATE, non
   riscritte: `require` il modulo o condividere il codice di verifica) + la nuova
   INV-04 (confini + margine). Ogni N tick / a campione.
6. **Alla violazione**: `t.nastro()` + il log-duelli + i due semi -> file in `fuori/`
   (promuovibile a fixture committata se la violazione e' vera). Interrompere quel
   seme, continuare col successivo. Riproduzione: pagina fresca, `t.semina(semeGioco)`,
   `t.rigioca(nastro)`, riapplicare il log-duelli per tick nel loop di `simulate` ->
   la violazione ricompare identica (il mandato §13.3: "ogni crash riprodotto da un
   replay").

## Cosa il fuzzer esercita che il CPU-CPU non tocca (il suo valore)
- **`G.swLock`/`G.swTimer`**: scritti SOLO da `cambiaGiocatore` (disco swap, :17509)
  e `provaStrappo` (strappo umano, :17990); mai in CPU-CPU. Il fuzzer che genera
  swap/strappo li esercita — chiude il caveat (a) del #125 (l'invariante cronometri
  su swLock, oggi vacua in CPU-CPU, diventa esercitata).
- **INV-04** (giocatori entro i confini + margine, mandato :647): rimandata dal #125.
  Uno stick a fondo scala verso i bordi la raggiunge — coperta per la prima volta.

## Cosa il fuzzer NON copre gratis (da dichiarare)
- **INV-06/07** (validita' del gol / ripresa da fermo): il fuzzer genera l'ESPOSIZIONE
  (traffico denso di tiri/cross/scivolate ovunque) ma verificarle richiede
  un'invariante DEDICATA che oggi non esiste — non "coperta gratis". Si dichiara come
  lavoro a parte (un assert nuovo, non regalato dal fuzzer). Eventuale seguito.
- Umano-vs-umano (due nastri, solo `G.mode===2`): piu' complesso, nessun vantaggio
  chiaro per le invarianti — rimandato. Il fuzzer gioca **umano(fuzzed) vs CPU**.

## Le insidie (dal ricognitore, da scrivere nel piano)
- **Tetto `Reg.righe>40000`** (:13285) tronca in SILENZIO: se il fuzzer manda un
  comando a ogni tick (60 Hz) rischia di superarlo in una partita da 13200 fotogrammi
  e la riproduzione sarebbe incompleta senza errore. VIGILARE: contare le righe del
  nastro e allarmare, e/o mandare comandi a cadenza realistica (non ogni tick).
- **Il duello** e' il punto cieco: se non gestito, ogni seme che arriva a un
  rigore/punizione si blocca (falso hang).
- **Determinismo**: due semi separati (gioco + comandi), entrambi dichiarati, PRNG
  proprio del fuzzer (xorshift come `_posa.js`/`SEME`), MAI `Math.random`.
- **Violazione vera = P0**: se il fuzzer trova una violazione reale, e' una SCOPERTA
  (mandato §13.3), da riprodurre e riferire — NON richiudere per far tornare verde.

## Le tre cure
1. **Il fuzzer base**: generatore di comandi Touch5 seminato (stick + 5 dischi da
   `pulsanti(0)`), loop `simulate`+le 9 invarianti riusate, batteria di N semi. Il
   duello NON ancora gestito: i semi che arrivano a `freekick` si ESCLUDONO,
   dichiarati (come `semiAbortiti`), non nascosti. Vigila sul tetto Reg. Determinismo:
   la stessa sequenza (due semi) rigiocata da' la stessa partita (prova di
   ripetibilita').
2. **Il duello + INV-04**: gestione `Duel.pickZone/pickKeeper/stopPower` + log
   parallelo; la nuova invariante INV-04 (confini + margine). E' la parte che vale di
   piu' (esercita swLock e i confini, mai toccati dal CPU-CPU). Riproduzione del
   colpevole (nastro + log-duelli -> replay verificato).
3. **Batteria + verbale**: il fuzzer in `tutti.js` (conta:true, probabilmente
   `lento:true` — migliaia di tick x N semi); verbale in MANUALE (voce #126): cosa
   esercita (swLock/INV-04), cosa NON copre (INV-06/07, dichiarato), le insidie
   gestite (duello, tetto Reg), l'esito (violazioni trovate? se si', P0 riprodotte;
   se no, il fuzzer come rete permanente). PUNTO aggiornato.

## Vincoli
- Cantiere di BANCO: il gioco NON si tocca (Reg/Touch5/Duel gia' esposti bare;
  nessun hook nuovo previsto — se emergesse un bisogno, hook di sola lettura via
  attrezzo, dichiarato). Il due-versioni resta la firma.
- Deterministico (due semi dichiarati, PRNG proprio). Ogni violazione riproducibile.
- Le invarianti RIUSATE da `_q-invarianti.js`, non duplicate.
- Commenti senza accentate; un commit per compito; verbale a edizioni.

## Fuori perimetro
Il soak (onda C-3, prossimo). INV-06/07 (assert nuovo, seguito). Umano-vs-umano.
L'hook di riproduzione "puro nastro" del duello (il gioco stesso dichiara di non
averlo — :43277-43286 — non si costruisce per il fuzzer: il log parallelo basta).
Il gioco (salvo scoperta di violazione vera P0).
