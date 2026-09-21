# Il metro prima del giudice (voce #130)

21 settembre 2026. Prima dell'onda D (competizione, `_analisi/MAPPA-MANDATO.md`
riga 763: "il verificatore differito delle sfide") serve un GIUDICE che
rigioca il nastro di una sfida e ne confermi il punteggio. Un giudice che
usa un metro sbagliato condanna partite sane: questo cantiere aggiusta il
metro PRIMA, non dopo.

## I due difetti, misurati

1. **Il tetto INV-15 e' ancorato a taglia 5 ma applicato a ogni taglia.**
   `TETTO_FOTOGRAMMI = 18000` (`strumenti/_q-invarianti.js:582`) e' la somma
   di due componenti misurate SOLO a taglia 5 (voce #127): pre-rigori
   (12000, margine su un massimo osservato di 10854 su 427 partite) +
   oltranza teorica (18 tiri x 328 fotogrammi = 5904). A taglia 11 la
   partita di regolamento dura gia' 180s (`durataPartita()`,
   `CALCETTO-il-gioco.html:4105-4123`: `round(MATCH_SEC*FW/1150)`, FW=2300 a
   taglia 11 contro FW=1150 a taglia 5) invece di 90s: un rigore a oltranza
   legittimo a quella taglia arriva molto piu' vicino al tetto tarato per
   un'altra taglia, e lo sfonda.

2. **`_q-determinismo.js` NON e' registrato in `strumenti/tutti.js`.**
   Verificato: nessuna voce `determinismo`, `rete`, `sfida` nell'elenco
   `CANCELLI`. E' la prova di INV-01 (il gioco e' deterministico dato il
   seme) — il FONDAMENTO della verificabilita' di una sfida (un giudice
   che rigioca un nastro assume che rigiocare dia lo stesso esito) — e la
   batteria non la sorveglia.

## La rettifica che ha aperto questo cantiere (misurata, non presunta)

Il verbale #129 (`MANUALE.md` §A registro) e `PUNTO-DEL-LAVORO.md` riga 11
dichiaravano: "un fallimento incontrato in corsia (`_q-soak --taglia 11`,
INV-15, seme 20260924 partita #4 bloccata in `freekick` a 18.000
fotogrammi) e' stato misurato anche sul gioco NON curato ... PRE-ESISTENTE,
un difetto di gioco a taglia 11 scollegato dalla cosmetica".

**MISURATO DI NUOVO** (`fuori/_misura-seme-20260924.js`, non committato —
convenzione di casa, script usa-e-getta): seme 20260924, taglia 11, ordine
giusto (`startMatch` poi `setCpuVsCpu`), NESSUN tetto (limite locale 40000
fotogrammi per sicurezza). La partita raggiunge **`'end'` al fotogramma
19502 (325,0s) con punteggio 2-1**, dopo essere passata per una serie a
rigori (`G.rigori===true`). NON e' bloccata. Il rosso incontrato dal #129
era il TETTO (18000, tarato su taglia 5) applicato a una taglia dove la
partita di regolamento dura gia' 180s: la diagnosi "difetto di gioco" era
un'inferenza sbagliata sopra una misura vera (il fotogramma/stato letto
allora — verosimilmente al momento del taglio a 18000 la scena era
'freekick', una fase di passaggio, non un blocco). Rettificato a edizioni
in `MANUALE.md` e `PUNTO-DEL-LAVORO.md` (compito 3).

## Le decisioni

1. **Il tetto diventa una funzione della taglia**, `tettoFotogrammi(taglia)`,
   non una costante unica. Taglia 5 resta 18000 (INVARIATA, backcompat
   totale: nessun banco a taglia 5 cambia numero). Taglia 7 e 11 hanno
   numeri propri, MISURATI in questo cantiere con lo stesso metodo del
   #127 (pre-rigori + oltranza teorica), non stimati per proporzione.
2. **La componente "oltranza" (18 tiri a rigore) resta UNA costante per
   ogni taglia**, non tre numeri diversi: verificato dal codice (Duel.step,
   `CALCETTO-il-gioco.html` ~22479-22497, avanza il cursore con `dt*1,15` e
   decide con `dado()` — ne' l'uno ne' l'altro leggono FW/taglia) e
   confermato con una misura di controllo a taglia 11 (non solo un
   argomento a tavolino).
3. **La componente "pre-rigori" e' MISURATA per ogni taglia**, non
   dedotta per proporzione da taglia 5: un tentativo di scalare
   linearmente col rapporto delle durate di regolamento e' stato scartato
   perche' il rapporto misurato fra durata-orologio e fotogrammi-reali
   NON e' costante fra le taglie (1,54 a 5, 1,23 a 7, 1,30 a 11 sui
   campioni raccolti) — probabilmente un effetto di taglia-campione (427
   partite storiche a 5 contro 100/150 qui), non una legge fisica da
   estrapolare. Misurare resta piu' onesto che stimare.
4. **Margine piu' largo a 7/11 (+20%) che a 5 (+10,6% storico)**: i
   campioni qui (100 e 150 partite) sono piu' piccoli di quello storico di
   taglia 5 (427): meno fiducia nella coda osservata, piu' margine
   dichiarato per compensare — non lo stesso numero riusato a occhi chiusi.
5. **`_q-determinismo.js` entra in batteria.** Verificato che il gioco e'
   oggi 10/10 anche a taglia 7 e 11 (dopo la cura #129 della #98, prima era
   8/10): niente piu' ragione per tenerlo a taglia 5 sola. Si valuta se
   registrare una sola voce a una taglia o due voci (5 e 11) — decisione
   nel piano.
6. **`_q-rete.js` e `_q-sfida.js` entrano in batteria se non richiedono
   rete vera.** Verificato leggendo il codice: entrambi aprono un SERVER
   FINTO in memoria sulla stessa macchina (`http.createServer`, mai una
   richiesta a Internet) — la stessa tecnica di `senza-rete.js`, che
   verifica una cosa DIVERSA (il gioco, in condizioni normali, non chiama
   nessuno): nessun conflitto. Confermato eseguendoli a mano: 22/22 e
   54/54, zero configurazione di rete.

## I cancelli di questo cantiere

- **Test-condanna** (`strumenti/_t-metro-taglia.js`, nasce ROSSO prima
  della cura): il seme 20260924 a taglia 11 letto contro il tetto FLAT
  (18000) e' dichiarato falso positivo (la partita finisce a 19502 >
  18000); contro `tettoFotogrammi(11)` (27000) non lo e'. Prima della cura
  la funzione `tettoFotogrammi` non esiste: il test e' strutturalmente
  rosso. Dopo: verde.
- `_q-soak.js` verde a taglia 5 E a taglia 11 (il falso positivo sparisce
  dal banco vero, non solo dal test dedicato).
- `_q-invarianti.js` verde (usa anch'esso `tettoFotogrammi`, altrimenti
  avrebbe lo stesso buco su `--taglia 11`).
- `_q-cpu-ordine.js` verde.
- `_q-soak.js --bugiardo durata` resta ROSSO a ogni taglia provata: l'hang
  vero (ordine CPU/startMatch invertito, l'artefatto #108) non deve
  sparire dietro un tetto piu' largo — verificato, non attestato.
- `strumenti/tutti.js`: `determinismo`, `rete`, `sfida` registrati e verdi
  (o dichiarano prova nulla con causa vera, mai un verde forzato).
- Batteria intera rilanciata (a gruppi, `--solo`), verbale in `MANUALE.md`
  e `PUNTO-DEL-LAVORO.md`.

## Vincoli

- Cantiere di BANCO/documenti: **il gioco non si tocca**. Se emergesse un
  bisogno di toccarlo, ci si ferma e si riferisce (non e' previsto: il
  tetto e' uno strumento di misura, non una regola del gioco).
- Ogni difetto ha prima un test fallito (mandato §13.3).
- MISURARE i numeri (nuovi script `fuori/_misura-*.js`, non committati —
  convenzione di casa, come `fuori/_misura-oltranza.js` e
  `fuori/_misura-pre-rigori.js` del #127), non stimarli per proporzione.
- Le affermazioni superate si rettificano A EDIZIONI: si corregge in
  chiaro con data e fonte accanto, senza cancellare il testo vecchio.
- Commenti di codice senza lettere accentate (usare l'apostrofo: e', puo',
  gia').
- Batteria INTERA rilanciata a ogni compito (lezione 22), a gruppi se il
  tempo dell'agente non basta per una corsa sola.

## Fuori perimetro

- Costruire il GIUDICE vero (onda D, cantiere a parte, dopo questo).
- Estendere il determinismo pieno a tocchi umani (`__test.dita`, gia'
  dichiarato "non disponibile" da `_q-determinismo.js` prova C — non e'
  compito di questo cantiere aggiungerlo).
- Qualunque tocco a `CALCETTO-il-gioco.html`.
- Ricalibrare le BANDE statistiche di `_q-soak.js` (restano ancorate a
  taglia 5, invariate: il tetto e le bande sono numeri indipendenti).
