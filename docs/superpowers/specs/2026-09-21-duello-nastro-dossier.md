# Dossier #131 — il duello entra nel nastro (misurato, base della spec)

## Il difetto
I pointer del duello sono appesi a `#duel` (:22698-22735) e NON passano dalle
quattro porte avvolte del registratore (:43489-43522). Restano solo
`Reg.scrivi(5,[])` (:22657, il marchio «io sono incompleto») e
`fermaReplayAlDischetto` (:43399, armata a :22658-22659).
TRE buchi distinti, non uno:
1. i pointer di `#duel` (:22705-22733);
2. il click su `#powerWrap` (:22736-22738);
3. la tastiera (:12385 -> `Duel.key`, :22302-22323): il keydown E' registrato
   (tipo 4, :12371) ma `Reg.esegui` (:13389) fa solo `Keys[c]=...` e non
   ridispaccia il gestore -> comando registrato e MORTO.

## Anatomia
`Duel` :22184-22602. Stato a :22184-22217, con `vt` gia' dichiarato a
:22233-22235 come «l'orologio VIVO del dischetto: G.pulse qui e' fermo».
Ingresso unico: `startFreeKick` :22604 -> `Duel.start` :22632.
Tre chiamanti: `programmaRigore` :18568 (ogni rigore), `eseguiSfumato` :18722
(area o cumulo falli), `checkSlideContact` :18857 (fallo in area o terzo).
Golden a :17400-17401 quando il punteggio e' pari e `matchCtx!=='season'` =
SEMPRE in una sfida; rigori dopo 40 s (:17409-17410).
Tre decisioni: `pickZone` :22327-22354, `stopPower` :22364-22379 (legge
`this.cursor` ALL'ISTANTE della chiamata, :22366), `pickKeeper` :22355-22363.
`resolve()` :22380-22460 consuma 1 o 2 dadi: a :22422 il `&&` CORTO-CIRCUITA
(`powerQ>=0.25` -> quel `dado()` non viene chiamato) -> lo stream slitta.
Sorteggi per duello MISURATI (169 duelli): mediana 5-6, min 3, max ~114.

## L'orologio (il cuore)
`Reg.passo()` e' chiamata in UN SOLO posto: prima riga di `step()` :17097.
In duello `frame()` chiama `Duel.update(DT)` invece di `step()` (:40407, e
`__test.simulate` :44385) -> `Reg.tick` NON avanza.
MISURATO: tick identico in entrata/uscita 173/173; tutte le righe scritte
durante un duello portano lo STESSO tick; e in una serie di rigori TUTTI i
rigori portano lo stesso tick 40/40 (perche' `esitoRigore`->`programmaRigore`
->`startFreeKick` gira DENTRO `Duel.update`).
=> `Reg.tick` non puo' ancorare NE' distinguere un duello dall'altro.
I MILLISECONDI NON SERVONO: grep sul corpo del duello (:22184-22740) = ZERO
`performance.now`/`Date.now`/`oraGioco`; il duello legge solo `dt`, sempre
`DT` fisso. E `frame()` ha un accumulatore che BUTTA tempo (:40404-40414,
`while(acc>=DT && n<6)`, `if(n===6) acc=0`).
=> L'orologio giusto e' il CONTATORE di `Duel.update`.
MISURATO: riproduzione ancorata al contatore 40/40 identica a 5 decimali.
SENSIBILITA': spostare `stopPower` di 1 aggiornamento (16,7 ms) cambia 6/132
esiti (5%); di 2 -> 8%; di 3 -> 12%. E cambia il conto totale dei sorteggi
dell'intera partita in 5/40 serie e il PUNTEGGIO FINALE in 2/40.
Cursore: 1.15/60 = 0,01917 per aggiornamento; banda 0,20 (comoda) / 0,095
(incrocio) -> un aggiornamento vale il 10-20% della banda.

## Il formato proposto (tipo 6)
`[tick, 6, ms, nDuello, passo, verbo, a, b, c]`
- `tick`: congelato, colloca il duello nella partita (delta 0, un carattere).
- `ms`: per uniformita', DICHIARATO NON LETTO.
- `nDuello`: ordinale del duello nella partita (incrementato in `Duel.start`,
  MAI azzerato): OBBLIGATORIO, senza di esso i 10 rigori sono indistinguibili.
- `passo`: numero di `Duel.update` dall'inizio di QUESTO duello = l'orologio.
  MISURATO: mediana 208, min 141, max 298.
- `verbo`: 0 pickZone, 1 stopPower, 2 pickKeeper.
- `a,b,c`: pickZone -> `z, round(u*1000), round(v*1000)`; stopPower -> niente;
  pickKeeper -> `z`.
Serializzazione a lunghezza variabile come il tipo 7 (:13436-13442).

## Le tre regole di riancoraggio
1. `Reg.passoDuello()` come PRIMA istruzione di `Duel.update`, prima di
   `s.vt+=dt` (:22465) e prima dell'avanzamento del cursore (:22480)
   — simmetrica a `Reg.passo()` prima riga di `step()`. Ragione misurabile:
   `stopPower` legge il cursore all'istante; dal vivo il pointer arriva FRA
   due aggiornamenti.
2. `Duel.passo` si azzera in `Duel.start`, `Duel.nDuello` NO.
3. La coppia `(nDuello, passo)` e' anche una somma di controllo: se il nastro
   ha righe per il duello 3 e il gioco e' al 2, la divergenza si vede SUBITO.

## Le due trappole
A. `Duel.update` chiama DA SE' `pickZone` (:22489), `stopPower` (:22494-95) e
   `pickKeeper` (:22501). Il ramo :22499-22501 (timeout portiere, armato a
   :22377 con `cpuT=3.0`) GIRA ANCHE COL PORTIERE UMANO. Registrarlo
   farebbe fissare `keeperZone` per primo in rilettura -> la guardia
   `s.keeperZone<0` fallisce -> il `dado()` del timeout non si consuma ->
   stream slittato. SERVE un flag `Duel.dentroUpdate` (gemello di `Reg.dentro`
   :13239) che sopprima la scrittura per le chiamate nate dentro il motore.
B. `duelMira(x,y)` :22682-22697 ricava u,v da `duelGeo()` :37751-37766, che
   dipende da VW/VH e dalle altezze DOM (`getBoundingClientRect`, :37746-48).
   Registrare clientX/clientY NON riprodurrebbe fra due telefoni di schermo
   diverso. Si registrano `u,v` QUANTIZZATI a 1/1000 ALLA SORGENTE, in tutte
   e tre le modalita' — la dottrina gia' scritta a :43497-43512 per il pixel
   intero. `u` vive in [-1,258; +1,258], `v` in [0,21; 0,80].

## La frequenza VERA (misurata, taglia 5, parametri di sfida)
| regime | partite con >=1 duello | duelli/partita | nastri marchiati tipo 5 |
| umano fermo | 13/30 = 43% | 0,70 | 13/30 |
| umano fuzzato (dita vere) | 30/30 = 100% | 4,93 | 30/30 |
| CPU contro CPU | 4/30 = 13% | 0,47 | 0/30 (CIECO) |
In modalita' 1 giocatore OGNI duello ha un umano dentro: 169/169.
=> fra il 43% e il 100% delle sfide produce oggi un nastro inverificabile.
Limiti dichiarati: le dita sono il fuzzer (sovrastima), il regime fermo e' un
pavimento; nessuna partita a input umano ha raggiunto i rigori nel campione.

## MOTORE_V: resta 2, a tre condizioni VERIFICABILI
Catena: ogni sfida gira in modalita' 1 giocatore -> ogni duello ha un umano
(169/169) -> la guardia :22657 scatta sempre -> l'insieme dei nastri a
MOTORE_V=2 che `Sfida.guarda` ACCETTA oggi e' esattamente «i nastri SENZA
duello» (tutti gli altri gia' respinti a :43140) -> per quelli il nuovo
codice non gira mai.
Condizioni: (a) cura ADDITIVA (nuovo tipo di riga, nuovo gancio dentro
`Duel.update`, ZERO modifiche a `step()` e all'ordine dei dado fuori dal
duello); (b) la quantizzazione non sposta il duello della CPU (per la CPU
`pickZone(z)` arriva senza u,v -> :22330-31 inventa u=z-1 in {-1,0,1} e
v=0.50, gia' esatti al millesimo, e `mirato` resta falso :22340);
(c) SI MISURA: due versioni, 30 nastri SENZA duello registrati sul gioco di
oggi e rigiocati sul curato. Identici 30/30 -> resta 2. Un solo scarto -> 3.
Restando a 2, il controllo `incompleto` (:43135-43148) VA CONSERVATO per i
nastri vecchi.

## Il rischio piu' grande + contromisure
Registrazione e riproduzione sono la stessa riga: ogni tocco al duello e' un
tocco alla fisica del duello, e un off-by-one da' un gioco che SEMBRA
funzionare e un giudice che CONDANNA INNOCENTI.
1. Cancello di non-regressione che NON guarda il nastro: congelare l'impronta
   di N duelli a seme fisso (esiti + cursor a 5 decimali + `__test.sorteggi`)
   sul gioco di oggi; ogni compito la rimisura.
2. Mutante `_crit-duello-passo.js`: gancio spostato di un fotogramma (dopo
   `s.vt+=dt`). Il banco DEVE condannarlo.
3. `fermaReplayAlDischetto` NON si cancella: si CONSERVA come ripiego e si
   riarma sul caso vero (duello aperto in rilettura senza righe per quel
   `nDuello`), o il replay resta appeso per sempre.
4. Tocco al gioco solo per ancore, avvolgimento FUORI dall'oggetto `Duel`
   (i corpi cambiano, i nomi no — :43480-43483).

## I sei compiti (ognuno un commit, batteria intera ogni volta)
C1 `_t-duello-nastro.js` — il banco che condanna (nessuna modifica al gioco):
   sfida che entra in duello, nastro che non si rigioca. ROSSO oggi su due
   fronti: (a) marchio tipo 5 -> rifiutato; (b) forzando, diverge al primo
   duello e resta appeso. Di corredo `_crit-duello-passo.js`.
C2 `_t-duello-orologio.js` — `Duel.nDuello`, `Duel.passo`, `Duel.dentroUpdate`.
   Nessun comportamento cambia: solo contatori. Verde quando nDuello distingue
   tutti e 10 i rigori e `Reg.tick`/`sorteggi` non cambiano di un'unita'.
C3 `_t-duello-tacca.js` — `duelMira` quantizza u,v a 1/1000 alla sorgente.
   ROSSO su due viewport (915x412 e 782x299): oggi lo stesso clientX/Y da'
   u,v diversi. Non-regressione: il duello della CPU identico alla cifra.
C4 `_t-duello-porte.js` — avvolge `pickZone`/`stopPower`/`pickKeeper` FUORI
   dall'oggetto (modello :43489-43522); scrive il tipo 6 solo se `Reg.modo===1`
   e `!Duel.dentroUpdate`; serializza/deserializza. ROSSO su tre asserzioni:
   duello con umano >=2 righe tipo 6; duello tutto CPU zero righe; il ripiego
   del portiere NON finisce nel nastro. Piu' `sorteggi` identico.
C5 `_t-duello-rigioca.js` — `Reg.passoDuello()` prima istruzione di
   `Duel.update`; toglie `Reg.scrivi(5,[])` e l'armamento, CONSERVA la
   funzione e il controllo `incompleto`. C1 diventa VERDE. Piu': il mutante
   resta bocciato; un nastro troncato ferma con causa vera; una serie di
   rigori intera si rigioca esito per esito.
C6 `_t-duello-motorev.js` — due versioni, 30 nastri senza duello. Non puo'
   finire con un'opinione.

## Dubbi onesti dichiarati
1. Il 100% del fuzzato non e' il 100% dei giocatori veri (43%-100%).
2. Nessuna partita a input umano ha raggiunto i rigori nel campione: la regola
   :43127-43129 e' LETTA nel codice, non misurata su sfide vere con umani.
3. La sensibilita' 5% e' probabilmente una SOTTOSTIMA.
4. Non e' stata provata la cura, solo l'ancoraggio.
5. `Reg` e' visibile dentro `page.evaluate` ma non esposto in `window.__test`.
