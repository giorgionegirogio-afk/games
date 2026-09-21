# Il duello entra nel nastro (voce #131)

21 settembre 2026. E' il P0 dell'onda D. Il #130 ha aggiustato il METRO
del giudice; questo cantiere gli da' qualcosa da misurare. Sta per
nascere un giudice che rigioca il nastro di una sfida per confermarne il
punteggio: oggi non potrebbe verificare proprio le partite decisive,
perche' il duello dal dischetto — rigori, fallo in area, cumulo falli —
NON entra nel nastro.

Base misurata: `docs/superpowers/specs/2026-09-21-duello-nastro-dossier.md`
(indagine di 50 strumenti). Questa spec deriva da li' e non ri-misura cio'
che li' e' gia' misurato.

## Il difetto, in tre buchi

I pointer del duello sono appesi all'elemento `#duel`
(`CALCETTO-il-gioco.html:22698-22735`) e non passano dalle quattro porte
che il registratore avvolge (`:43489-43522`). Tre buchi distinti:

1. i pointer di `#duel` (`:22705-22733`) — mira, trascinamento, rilascio,
   tuffo del portiere;
2. il click su `#powerWrap` (`:22736-22738`) — la barra di potenza;
3. la tastiera (`:12385` -> `Duel.key`, `:22302-22323`): il keydown E'
   registrato (tipo 4) ma `Reg.esegui` (`:13389`) fa solo `Keys[c]=...` e
   non ridispaccia il gestore — comando registrato e MORTO.

Oggi restano due ripieghi: `Reg.scrivi(5,[])` (`:22657`, il marchio «io
sono incompleto») e `fermaReplayAlDischetto` (`:43399`, armata a
`:22658-22659`).

## Perche' e' urgente (misurato, non presunto)

| regime | partite con >=1 duello | duelli/partita | nastri marchiati |
|---|---|---|---|
| umano fermo | 13/30 = 43% | 0,70 | 13/30 |
| umano fuzzato (dita vere) | 30/30 = 100% | 4,93 | 30/30 |
| CPU contro CPU | 4/30 = 13% | 0,47 | 0/30 (CIECO) |

In modalita' un giocatore **ogni duello ha un umano dentro: 169/169**.
Fra il 43% e il 100% delle sfide produce oggi un nastro inverificabile.
E chi vuole barare ha una via deterministica e a costo zero: entrare in
area.

## Le tre decisioni che reggono tutto

### 1. L'orologio e' il CONTATORE di `Duel.update`, non i millisecondi

`Reg.passo()` si chiama in un solo posto: prima riga di `step()`
(`:17097`). In duello `frame()` chiama `Duel.update(DT)` **invece** di
`step()` (`:40407`, e `__test.simulate` `:44385`): `Reg.tick` non avanza.
MISURATO: tick identico in entrata/uscita 173/173, e in una serie di
rigori TUTTI i rigori portano lo stesso tick (40/40), perche'
`esitoRigore` -> `programmaRigore` -> `startFreeKick` gira DENTRO
`Duel.update`. `Reg.tick` non puo' ne' ancorare ne' distinguere un duello
dall'altro.

I millisecondi non servono e non servirebbero: grep sul corpo del duello
(`:22184-22740`) da' ZERO `performance.now`/`Date.now`/`oraGioco` — il
duello legge solo `dt`, sempre `DT` fisso — e `frame()` ha un
accumulatore che BUTTA tempo quando il telefono arranca (`:40404-40414`).

L'orologio giusto e' il numero di `Duel.update` compiuti dall'inizio di
QUESTO duello. MISURATO: riproduzione ancorata al contatore 40/40
identica a cinque decimali.

### 2. Il flag `Duel.dentroUpdate`, gemello di `Reg.dentro`

`Duel.update` chiama DA SE' `pickZone` (`:22489`), `stopPower`
(`:22494-95`) e `pickKeeper` (`:22501`). Il ramo `:22499-22501` (timeout
del portiere, armato a `:22377` con `cpuT=3.0`) **gira anche col portiere
umano**. Registrare quelle chiamate farebbe fissare `keeperZone` per primo
in rilettura, la guardia `s.keeperZone<0` fallirebbe, il `dado()` del
timeout non si consumerebbe e lo stream slitterebbe. La scrittura va
soppressa per le chiamate nate dentro il motore.

### 3. `u,v` quantizzati a 1/1000 ALLA SORGENTE

`duelMira(x,y)` (`:22682-22697`) ricava u,v da `duelGeo()`
(`:37751-37766`), che dipende da VW/VH e dalle altezze DOM
(`getBoundingClientRect`). Registrare `clientX/clientY` NON riprodurrebbe
fra due telefoni di schermo diverso. Si quantizza a un millesimo dentro
`duelMira`, in tutte e tre le modalita' — la dottrina gia' scritta per il
pixel intero a `:43497-43512`. `u` vive in [-1,258; +1,258], `v` in
[0,21; 0,80]. Il terzo `z` si ricava dalla `u` GIA' quantizzata, cosi' il
terzo e il punto non possono divergere.

## Il formato: la riga di tipo 6

`[tick, 6, ms, nDuello, passo, verbo, a, b, c]`, serializzata a lunghezza
variabile come il tipo 7 (`:13436-13442`).

- `tick` — congelato durante il duello: non ancora, ma colloca il duello
  nella partita e costa un carattere (delta 0).
- `ms` — per uniformita' col resto del formato, DICHIARATO NON LETTO.
- `nDuello` — ordinale del duello nel nastro. OBBLIGATORIO: senza, i dieci
  rigori di una serie sono indistinguibili (portano tutti lo stesso tick).
- `passo` — numero di `Duel.update` gia' compiuti quando il dito e'
  arrivato. MISURATO: mediana 208, min 141, max 298.
- `verbo` — 0 `pickZone`, 1 `stopPower`, 2 `pickKeeper`.
- `a,b,c` — pickZone: `z, round(u*1000), round(v*1000)`; stopPower: niente;
  pickKeeper: `z`.

La coppia `(nDuello, passo)` e' anche una somma di controllo: se il nastro
ha righe per il duello 3 e il gioco e' al 2, la divergenza si vede subito.

## Il riancoraggio, e perche' e' esattamente li'

`Reg.passoDuello()` va chiamata come PRIMA istruzione di `Duel.update`,
prima di `s.vt+=dt` (`:22465`) e prima dell'avanzamento del cursore
(`:22480`) — simmetrica a `Reg.passo()` prima riga di `step()`. Ragione
misurabile: `stopPower` legge `this.cursor` all'ISTANTE della chiamata
(`:22366`), e dal vivo il pointer arriva FRA due aggiornamenti.

Definizione precisa, perche' qui un off-by-one non da' un rosso vistoso:
`Duel.passo` conta gli aggiornamenti GIA' COMPIUTI. Un dito che cade fra
l'aggiornamento k e il k+1 legge un cursore avanzato k volte, e k e' il
numero che finisce nel nastro. In rilettura il comando va quindi eseguito
all'INIZIO dell'aggiornamento k+1, prima che il cursore avanzi la
(k+1)-esima volta: la guardia e' `riga.passo < Duel.passo` **dopo**
l'incremento.

`Duel.passo` si azzera in `Duel.start`; `Duel.nDuello` no — si azzera dove
comincia un nastro, cioe' in `Reg.accendi()` e `Reg.deserializza()`.

## L'avvolgimento sta FUORI dall'oggetto

Come le quattro porte di `Touch5` (`:43480-43483`): «il corpo cambia di
continuo, i nomi no». Si avvolgono dall'esterno `Duel.pickZone`,
`Duel.stopPower`, `Duel.pickKeeper` (le tre porte) piu' `Duel.update` e
`Duel.start` (i due orologi). Cosi' il corpo di `Duel.update` — duecento
righe che le toppe cambiano spesso — non si tocca di una virgola, e il
`return` anticipato di `:22564` non puo' lasciare `dentroUpdate` acceso
(c'e' un `finally`).

## Il rischio piu' grande, e le contromisure obbligatorie

Registrazione e riproduzione sono la stessa riga: ogni tocco al duello e'
un tocco alla FISICA del duello, e un errore di un fotogramma non da' un
test rosso vistoso — da' un gioco che sembra funzionare e un giudice che
CONDANNA INNOCENTI. MISURATO: spostare `stopPower` di un solo
aggiornamento cambia 6/132 esiti (5%), il conto dei sorteggi in 5/40
partite e il PUNTEGGIO FINALE in 2/40.

1. **L'impronta di non-regressione, congelata PRIMA di toccare qualunque
   cosa e rimisurata a ogni compito** (`strumenti/_q-duello-impronta.js`,
   congelata in `strumenti/duello-impronta.json`). Non guarda il
   nastro: misura il duello nudo a seme fisso, in due regimi (CPU contro
   CPU e umano a copione deterministico), e firma ogni duello con esito,
   cursore a cinque decimali, powerQ, terzi, passo e sorteggi. 44 duelli.
   Verificata ripetibile (due giri identici) e verificata NON vuota: un
   mutante che sposta il cursore di UN aggiornamento la fa arrossire
   (`A[0].duelli[0].passo: 100 -> 101`).
2. **Il mutante `strumenti/_crit-duello-passo.js`**: il gancio spostato di
   un fotogramma (dopo `s.vt+=dt` invece che prima). Il banco del C1/C5
   DEVE condannarlo; se lo lascia passare, attesta invece di misurare.
3. **`fermaReplayAlDischetto` non si cancella**: si conserva come ripiego e
   si riarma sul caso VERO — duello aperto in rilettura, con un umano
   dentro, e nessuna riga di tipo 6 per quel `nDuello`. Senza, il replay
   resta appeso ad aspettare un dito che non arrivera' mai.
4. **Il controllo `incompleto` (`:43135-43148`) si conserva** per i nastri
   vecchi, se MOTORE_V resta 2.

## MOTORE_V: resta 2 a tre condizioni, e la terza e' una MISURA

Oggi vale 2 (`:13230`). La catena: ogni sfida gira in modalita' un
giocatore -> ogni duello ha un umano (169/169) -> la guardia `:22657`
scatta sempre -> l'insieme dei nastri a MOTORE_V=2 che `Sfida.guarda`
ACCETTA oggi e' esattamente «i nastri SENZA duello» (tutti gli altri sono
gia' respinti a `:43140`) -> per quelli il codice nuovo non gira mai.

Condizioni:
(a) cura ADDITIVA — nuovo tipo di riga, nuovo gancio dentro `Duel.update`,
    zero modifiche a `step()` e all'ordine dei `dado()` fuori dal duello;
(b) la quantizzazione non sposta il duello della CPU — per la CPU
    `pickZone(z)` arriva senza u,v e `:22330-31` inventa u=z-1 in {-1,0,1}
    e v=0,50, gia' esatti al millesimo, e `mirato` resta falso (`:22340`);
(c) **SI MISURA**: due versioni (`fuori/` + `--gioco`, il modo di casa di
    `_c3-sorteggi.js`), 30 nastri SENZA duello registrati sul gioco di
    oggi e rigiocati sul curato. Identici 30/30 -> resta 2, e la misura si
    scrive accanto al numero. Anche UN solo scarto di punteggio o di
    conto-sorteggi -> sale a 3, e allora si puo' togliere il controllo
    `incompleto`.

## I cancelli di questo cantiere

- `_t-duello-nastro.js` (C1): nasce ROSSO su due fronti — il nastro di una
  sfida che entra in duello e' marchiato tipo 5 e rifiutato; forzandolo, la
  partita rigiocata diverge al primo duello e resta appesa. Diventa VERDE
  al C5.
- `_crit-duello-passo.js`: il mutante da un fotogramma. Il banco deve
  bocciarlo anche DOPO la cura.
- `_t-duello-contatore.js` (C2): `nDuello` distingue tutti i rigori della
  serie, `passo` avanza, `dentroUpdate` e' acceso solo dentro il motore, e
  `Reg.tick`/`sorteggi` non cambiano di un'unita'.
- `_t-duello-tacca.js` (C3): rosso su due viewport (915x412 e 782x299) —
  oggi lo stesso clientX/clientY da' u,v diversi; verde con la
  quantizzazione. Non-regressione: il duello della CPU identico alla cifra.
- `_t-duello-porte.js` (C4): duello con umano >= 2 righe di tipo 6; duello
  tutto CPU zero righe; il ripiego del portiere NON finisce nel nastro;
  scritto-riletto-riscritto lo stesso testo; `sorteggi` identico.
- `_t-duello-rigioca.js` (C5): una serie di rigori intera rigiocata esito
  per esito; un nastro troncato si ferma con causa vera (il ripiego si
  riarma); il mutante resta bocciato.
- `_t-duello-motorev.js` (C6): due versioni, 30 nastri senza duello.
- `_q-duello-impronta.js`: verde a OGNI compito, dal compito 0 alla fine.
- Batteria INTERA a ogni compito (lezione 22), a gruppi.

## Vincoli

- Il gioco si tocca SOLO via attrezzo a ancore (`strumenti/_t-*.js` con
  `--out`/`--dentro`), mai con una modifica diretta.
- Ogni difetto ha prima un test fallito (mandato S13.3).
- Commenti di codice senza lettere accentate (apostrofo: e', puo', gia').
- Le affermazioni superate si rettificano a edizioni.
- Banchi a taglia 5, `sponde:'gabbia'`, `miraGuidata:'pieno'`, ordine sacro
  `startMatch` prima e `setCpuVsCpu` dopo.

## Fuori perimetro

- Costruire il GIUDICE vero (onda D, cantiere successivo).
- Il terzo buco, **la tastiera** (`Reg.esegui` non ridispaccia `Duel.key`):
  le tre porte avvolte lo coprono per il duello — `Duel.key` chiama
  `pickZone`/`stopPower`/`pickKeeper`, che d'ora in poi sono avvolte —
  ma il tasto in se' resta registrato e morto per tutto il resto del gioco.
  E' un difetto del tipo 4, non del duello: si dichiara, non si allarga qui.
- Registrare il TRASCINAMENTO del mirino (`pointermove`): non decide
  niente, e' solo disegno. Nel nastro entra il punto di RILASCIO, che e'
  l'unico che la fisica legge. Chi guardera' il replay vedra' il mirino
  comparire dove il dito l'ha lasciato invece di seguirlo: dichiarato.
- Estendere il determinismo pieno alle taglie 7/11 (voce #98/#129).
