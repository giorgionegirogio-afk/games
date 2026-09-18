# Le regole a leva corta, e la versione nel nastro — progetto (onda A del mandato)

18 settembre 2026. Primo micro-cantiere dell'onda A del programma approvato
dal committente (17 settembre, `_analisi/MAPPA-MANDATO.md`, «Le decisioni del
committente»): quattro cure piccole con le leve già in casa. Le fonti
tecniche sono la MAPPA (area 1 «Regole e simulazione», area 5 «Online», con
prove `file:riga`) e i punti di codice citati sotto (da riverificare col
grep: valgono sull'HEAD `239f905`).

## Il perimetro (quattro cure, ~4,5 giornate)

### 1. Il rigore legge l'area vera (½ g — mandato §6.7)
La decisione fallo-è-rigore usa ancora `zonaCalda = Math.abs(goalX-p.x) < 260`
— una fascia 1D non scalata per taglia — mentre l'area vera del ramo #86
(`VERNICE.areaProf/areaSemi`, `dentroArea()`) è applicata altrove nello
stesso file. Cura: la decisione legge `dentroArea`. CONSEGUENZA DICHIARATA:
a 7 e 11 il confine del rigore CAMBIA (prima 260 fisso, ora l'area in scala);
a 5 va MISURATO quanto differisce (260 contro `areaProf` 173) — il banco lo
dice, non l'intuito. Zero `dado()` nuovi; il due-versioni DIVERGE per
costruzione a ogni taglia dove il confine si sposta: si dichiara col numero.

### 2. Il portiere non prende il retropassaggio (1 g — mandato §6.5/App. D)
`tentaPresa` non consulta mai `b.lastTouch`/`passTo`: un compagno può sempre
passare indietro col piede e il portiere raccoglie con le mani. Cura: la
presa con le mani è negata se l'ultimo tocco è un PASSAGGIO DI PIEDE di un
compagno (la leva `segnaTocco`/`b.lastTouch` c'è già; serve distinguere il
tocco di piede dal colpo di testa/petto — se il dato non esiste, il piano lo
fa nascere nel punto di `kickBall`/`colpoDiTesta` come bandiera sul pallone,
`b.tockind` o simile, senza dado). Il portiere può sempre giocarla coi
piedi. Punizione? NO in v1: la presa è semplicemente negata (il pallone
resta vivo) — la punizione a due in area è fuori perimetro, dichiarato.

### 3. Il vantaggio: non ogni fallo ferma il gioco (2 g — mandato §6.7)
Oggi ogni fallo da scivolata fischia subito. Cura: alla rilevazione del
fallo, se la squadra che lo subisce CONSERVA palla e avanzamento (la vittima
o un compagno ha il pallone entro ~0,5 s e più avanti del punto del fallo),
il fischio si trattiene per una finestra (~2,5 s reali): se l'azione muore,
si torna al fallo (fischio ritardato, banner VANTAGGIO SFUMATO → punizione
dal punto originario); se prosegue, banner VANTAGGIO e nessun fischio (il
cartellino, se dovuto, si mostra alla prossima palla ferma — App. D). Le
soglie sono manopole in un posto solo. Zero `dado()`: la valutazione è
geometrica sugli stati esistenti.

### 4. La versione del motore nel nastro (1 g — chiude la voce #96)
Le sfide si rigiocano da {seme, taglia, gol, nastro}: un nastro registrato
col motore di ieri non torna, e `chiudiSfida` attribuisce lo scarto solo al
profilo cambiato. Cura: il nastro porta una `versioneMotore` (costante
incrementata a ogni ramo che tocca la simulazione — parte da questo); alla
rigiocata, se la versione non combacia, il messaggio dice la causa vera
(«motore aggiornato», niente accusa al profilo) e la sfida si chiude senza
penalità ingiusta. Retro-compatibilità: un nastro SENZA campo versione =
versione 0, trattato come non-combaciante con messaggio onesto. Il formato
del nastro cambia: è IL momento giusto (i nastri vecchi sono già invalidati
dal motore di #87). Il cancello #96 si CHIUDE; il prossimo APK si sblocca.

## Le leggi di casa che governano il cantiere
- Ogni cura ha la sua prova nel banco NUOVO `strumenti/_q-regole.js`, NATA
  ROSSA sul gioco di oggi (rigore-fascia-vs-area per taglia; presa concessa
  sul retropassaggio; fallo che fischia sempre; nastro senza versione).
- Il due-versioni DIVERGE per costruzione (cure 1-3 cambiano decisioni di
  simulazione a tutte le taglie): si dichiara per taglia col numero, come al
  ramo #86. `_q-determinismo` resta l'invariante (13/13 con --partite 4).
- Attrezzi a àncore per ogni tocco al gioco; commenti senza accentate;
  un commit per compito; verbale finale in MANUALE (voce nuova #107
  «regole a leva corta») e PUNTO, con la voce **#96 CHIUSA**.
- Giocabilità: `_eventi` prima/dopo (il vantaggio e il rigore-area possono
  spostare gol/min e rigori/partita): bande dichiarate nel piano.

## Fuori perimetro (dichiarato)
Punizione a due per il retropassaggio; falli di mano/spinta/trattenuta;
cartellino mostrato in differita SOLO come banner (niente coreografia);
fuorigioco (mai); due tempi. I seguiti restano dov'erano (#102-#106).
