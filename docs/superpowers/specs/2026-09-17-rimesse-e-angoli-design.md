# Rimesse laterali e calci d'angolo — progetto (voce #87)

17 settembre 2026. Cantiere aperto su scelta del committente (il prossimo
della decomposizione del 1° settembre, spec pulsantiera §7). Fonti:
`_analisi/RIMESSE-E-ANGOLI.md` (censimento + edizione del 17 settembre),
`_analisi/MINIERA-FCM.md` scavo 7 (il paragone, 64 fatti verificati a
ri-grep), `_analisi/DIFFERENZE-FC-MOBILE.md` (righe corner/rimesse/palla
fuori). Gli ancoraggi di codice citati valgono sull'HEAD `b5656b4`.

## 1. Il mandato, con le decisioni del 17 settembre

Il dettato originario (censimento, 1° settembre): nell'11 le rimesse
laterali sono obbligatorie; nel 7 e nel 5 si sceglie; i calci d'angolo
sempre. Le tre risposte di oggi lo precisano e in un punto lo superano:

1. **Fondocampo**: «a 11 sempre fuori, a 5 e a 7 si può scegliere se
   gabbia o fondo».
2. **Interruttore**: «gabbia senza angoli o rimesse (a 7 e a 5), fondo
   con angoli e rimesse» — cioè UN modo secco a due valori, non due
   interruttori.
3. **Battuta**: «trova tu quello più efficace e migliore» — delega. La
   scelta, a verbale: **i verbi di casa sul campo vero** (motivazione al
   §3.C; le alternative scartate: tutto automatico — zero agency, il
   paragone non lo fa mai — e l'angolo a minigioco stile Duel — il
   paragone i corner li gioca sul campo, con camera dedicata).

**Rettifica a edizioni** (fonte: risposta 2 di oggi): la premessa del
censimento «i calci d'angolo servono SEMPRE, anche quando le fasce
restano gabbia» è **superata**. In GABBIA non c'è nessun angolo: la
gabbia resta esattamente il gioco di oggi. «Sempre» vale nel senso che
ovunque il campo è vero (a 11, e a 5/7 con CAMPO VERO scelto) l'angolo
c'è — non si dà un campo vero senza angoli.

## 2. Che cosa dice il paragone (scavo 7, in tre righe)

Da lui la battuta non è mai puramente automatica (battitore assegnato
all'utente per ogni tipo di ripresa, una classe di controllo per tipo),
ma la rimessa ha un binario RAPIDO apposta per non spezzare il ritmo; la
pausa c'è **sempre** (camera dedicata per tipo, stati di attesa, posa di
preparazione anche nel rapido); l'IA conosce la fase (riprese
classificate offensiva/difensiva, portiere che sale sul corner
disperato). Righe di prova in `MINIERA-FCM.md` §7.

## 3. Il progetto

### A. Il modo di campo (l'interruttore)

- `SAVE.sponde` ∈ {`'gabbia'`, `'campo'`}; **default `'gabbia'`** (campo
  additivo: chi gioca oggi non vede cambiare nulla; nessuna migrazione).
- UI: seconda riga esclusiva nella schermata GIOCA sotto le taglie
  (`#taglieRow`, :3277; pattern `.diff-row` + `refreshTaglieRow` :39212
  già collaudato): **SPONDE: LA GABBIA / IL CAMPO VERO**. A 11 la riga
  si blocca su CAMPO VERO (disabilitata, con l'etichetta che lo dice).
  Persistenza con `persistSave()` (:9895), come `SAVE.taglia`.
- A `startMatch` il valore si fotografa in una costante viva di partita
  (es. `G.campoVero`), mai riletto da `SAVE` a partita in corso.
- La vernice non cambia: archi d'angolo e bandierine sono GIÀ dipinti
  (:26899, :27894) — questo cantiere mantiene la promessa che la vernice
  fa da settimane (rilievo della mappa delle differenze).

### B. L'uscita del pallone

- In `ballWalls` (:18816), **solo a campo vero**: le sponde smettono di
  rimbalzare. Fascia (oggi :18865-18866) → **rimessa** per la squadra
  opposta all'ultimo tocco; fondo fuori dalla luce (il ramo `else`,
  :18853-18863) → `squadraDelPallone()` (:14225): difesa → **angolo**
  (lato scelto dal quadrante d'uscita), attacco → **rinvio dal fondo**.
- La luce della porta resta INTATTA nei due modi: gol, traversa, fondo
  della rete, `ballOverBar` (:18965) non si toccano.
- In GABBIA il codice di oggi non è nemmeno sfiorato: stessa via, zero
  `dado()` nuovi sul percorso → il due-versioni a 5/7-gabbia resta a 0
  divergenze **per costruzione**.
- L'attribuzione esiste già: `segnaTocco` (:11072) è chiamata a ogni
  contatto e `b.lastTouch` non scade — nessuna finestra nuova.

### C. Il fermo e la battuta

- **Scena nuova, una sola**: `'ripresa'` (nono valore dell'enumerazione,
  :8326), con `G.ripresa = {tipo:'rimessa'|'angolo'|'rinvio', team,
  battitore, x, y}`. Il ciclo principale esce subito come per `kickoff`
  (:16555): fisica, IA e input sospesi. Durate: rimessa e rinvio
  **~0,8 s** (il binario rapido del paragone), angolo **1,2 s a 5 /
  1,5 s a 7 e 11** (allineato ai tempi di kickoff, :1,0/1,5).
- **`posaRipresa(tipo)`**: gemello parametrizzato di `resetKickoff`
  (:10652), la strada già indicata dalla MINIERA §2 per l'ASSALTO.
  Rimessa: il battitore (compagno più vicino al punto d'uscita) si
  piazza sul punto, gli altri restano dove sono. Angolo: battitore
  sull'arco, attaccanti in area, difensori a marcare, portiere sulla
  linea — i teleporti li maschera la camera che durante il fermo
  inquadra l'area (stesso trucco della carrellata di kickoff, :30185).
  Rinvio: palla fra le mani del portiere, e il flusso esistente
  (`rinvioPortiere` :18782, con la sua posa :`poseRinvio`) fa il resto.
- **Ripartenza**: fischio (`Audio5.whistle`) + banner col nome
  (RIMESSA / ANGOLO / RINVIO, precedente «ALTA!» di `ballOverBar`). Poi
  scena `play`: il battitore ha la palla, la squadra umana lo comanda.
  Rimessa: mira con la levetta, batte con **PASSA** (corta) o **CROSS**
  (lunga, a scavalcare — nel paragone è `ThrowInLob`; i verbi di casa
  sono quattro: PASSA, TIRA, CROSS, CONTRASTA, e LANCIO non esiste),
  con la **clip nuova** delle mani sopra la testa (unica posa
  nuova del cantiere; `gabbia.js` deve darla verde). Angolo: **CROSS**
  (la macchina del destinatario dichiarato di #88 lavora già per noi) o
  PASSA corto. **TIRA spento sul battitore** finché non batte (dalla
  rimessa non si segna direttamente; la pulsantiera #88 sa già spegnere
  le celle): vale per rimessa E angolo (gol olimpico = seguito).
- **Anti-stallo**: auto-battuta dopo ~3 s (il paragone commenta perfino
  il perdere tempo sul corner: `trigger_TIME_WASTING_CORNER`). La CPU
  batte col suo timer (0,3-0,8 s). Gli avversari non pressano il
  battitore durante la finestra (guardia nella scelta del bersaglio di
  pressing).

### D. L'intelligenza

Versione 1 = **tutto fermo durante il fermo** (l'unico pattern di stato
fermo che il gioco sa già fare a tutte le taglie), riposizionamento
istantaneo a inizio fermo. Le evoluzioni del paragone — portiere che
sale sul corner disperato, pressione differenziata per fase — vanno a
registro come seguito, fuori da questo cantiere.

### E. Le prove e i cancelli

- **`strumenti/_q-riprese.js` NATO ROSSO** sul gioco di oggi, poi verde
  sul curato. Prove minime: (1) campo vero, palla oltre la fascia →
  scena `ripresa` tipo rimessa entro 2 s, squadra giusta (opposta
  all'ultimo tocco); (2) fondo + ultimo tocco della difesa → angolo, +
  ultimo tocco dell'attacco → rinvio; (3) GABBIA → nessuna ripresa e
  rimbalzo **identico al bit** al gioco di oggi; (4) anti-stallo: la
  battuta parte da sé entro la finestra; (5) TIRA spento sul battitore
  (pattern della prova G di #88); (6) `_q-determinismo` 10/10 anche a
  campo vero.
- **Legge dei sorteggi**: `_c3-sorteggi` a 5/7 col default (gabbia)
  DEVE restare 0 divergenze; a 11 (campo vero obbligatorio) DIVERGE per
  costruzione — dichiarato nel verbale, precedente del ramo #86.
- **I banchi a rischio già censiti** (censimento §8): le sei copie
  stantie del collaudo con la voce #66 (`_p/_q/_t-p/_tb/_z/_x-collaudo`)
  — da verificare se la scena `ripresa` li accende (il pallone resta
  dentro `[0,FW]`, ma va misurato, non dedotto); i banchi-camera che
  enumerano le scene (`_z-verbo.js` e gemelli); i banchi d'avvio che
  aspettano `play|kickoff` (non toccati: la prima scena resta kickoff).
- **Giocabilità**: `_eventi` prima/dopo a 11 e a 5-campo-vero — le
  interruzioni non devono ammazzare i gol al minuto (banda dichiarata
  nel piano); `giocata`, `precedenza`, `replay`, `proporzioni` restano
  verdi; screenshot di rimessa e angolo ispezionati a occhio.
- **Batteria**: `_q-riprese` entra in `tutti.js` a fine cantiere, come
  `replay` e `proporzioni` prima di lui.

### F. Fuori perimetro, e i seguiti

Fuori: fuorigioco (mai, a nessuna taglia), rimessa dell'arbitro,
statistica corner in lavagnetta, gol olimpico, IA viva durante il fermo,
rimessa lunga come tratto. Seguiti da registrare a fine cantiere:
l'evoluzione IA del §D; la statistica corner; il gol olimpico. Nota
#96 (cancello di pubblicazione, già aperto): anche questo ramo cambia il
motore a 11 e a campo vero — i nastri delle sfide registrati prima non
si rigiocano identici; la voce #96 lo copre già, nessun obbligo nuovo.

## 4. I rischi

1. **Il ritmo a 11**: le rimesse sono frequenti; se il fermo corto è
   troppo lungo, il tempo effettivo cala su una partita che il 26 agosto
   abbiamo già allungato apposta. Contromisura: durate come manopole in
   un posto solo, e la misura `_eventi` come cancello, non a occhio.
2. **La voce #66 non estinta**: sei copie del collaudo urlerebbero
   «uscito dal mondo» su un falso positivo. Contromisura: girarle sul
   gioco curato PRIMA di dichiarare il cantiere chiuso; se rosse per la
   #66, curarle con la stessa toppa di `collaudo.js` (:283-315).
3. **Le dichiarazioni di modulo tarate sulla taglia 5** (lezione del
   compito 5 di #86): ogni costante nuova per-modo va controllata ANCHE
   alla dichiarazione, non solo in `setTaglia`/`startMatch`.
4. **Il determinismo a 7/11 è già instabile** (voce #98, 8/10): i banchi
   nuovi a quelle taglie devono confrontare due pagine con la tolleranza
   già in uso nei banchi di #86, o dichiarare il seme rosso noto.

## 5. La decomposizione, per orientare il piano

Bozza (il piano la possiede e può ritagliarla): 1) banco nato rosso +
interruttore SPONDE (UI, SAVE, `G.campoVero`); 2) `pallaFuori` + scena
`ripresa` + rimessa completa (fermo, battuta coi verbi, clip, anti-stallo);
3) angolo (posa d'area, camera, cross, TIRA spento); 4) rinvio dal fondo
(mani al portiere, flusso esistente); 5) banchi a rischio + giocabilità +
batteria + verbale nei tre documenti.
