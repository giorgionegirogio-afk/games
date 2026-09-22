# La sfida di carta (voce #135)

22 settembre 2026. Quinto cantiere dell'onda D. I quattro che vengono
prima hanno costruito il GIUDIZIO delle sfide di rete: il metro (#130),
il duello dentro al nastro (#131), i cinque canali di divergenza onesta
(#132), il giudice coi cinque verdetti (#133), il sigillo che li porta
fino all'occhio (#134). Tutti e cinque poggiano su una cosa sola: **c'e'
un server**.

Il mandato (§5, punto 12b) chiede l'altra meta': **una sfida con codice
diretto**. Due persone nella stessa stanza, o su due telefoni in due
citta', senza conto, senza rete, senza server: una incolla all'altra un
codice breve e quel codice *e'* la partita. Stesso seme, stesse due
squadre, stesso avversario, stesso punteggio da battere.

## Perche' non basta quello che c'e' gia'

`Rete.codiceTrasferimento()` produce gia' un codice da incollare, e la
tentazione di riusarlo e' forte: c'e' il campo, c'e' il pannello, c'e'
persino il carattere di controllo.

**E' la cosa piu' pericolosa che questo cantiere puo' fare.** Quel codice
e' `id.segreto.controllo`, e `Rete.accettaTrasferimento` (riga 45072)
scrive `m.id = p[0]; m.segreto = p[1]` — **chi lo incolla DIVENTA quella
squadra**. Mandarlo a un amico per sfidarlo vuol dire regalargli
l'identita': la classifica, i punti, la facolta' di giocare a nome tuo.
Il pannello che lo mostra lo dice gia' in grassetto («Se perdi il
telefono, perdi la squadra»), e quel grassetto e' esattamente la ragione
per cui il codice della sfida **non puo' essere quello**.

Quindi, e sono le tre regole di sicurezza di questo cantiere:

1. **Nel codice della sfida non entrano ne' l'id ne' il segreto.** Di
   piu': non entra NIENTE che dipenda da chi lo genera. Il codice e'
   funzione della sola partita.
2. **Il codice della sfida non si puo' confondere con quello di
   trasferimento, in nessuna delle due direzioni.** Il primo non contiene
   punti (quindi `accettaTrasferimento`, che ne pretende tre pezzi
   separati da punto, lo rifiuta); il secondo non comincia per `CARTA`
   (quindi il lettore della sfida lo rifiuta). Due serrature, una per
   verso.
3. **Zero dati personali.** Non il nome della squadra, non i nomi dei
   giocatori. E' la stessa scelta gia' fatta dal #132 per il nastro
   (grep «Nel nastro va il RISULTATO della tabella, non il suo
   ingresso»): dell'avversario viaggia l'INDICE di carattere, un numero
   fra -1 e 9, non il nome.

Dell'algoritmo di `codiceTrasferimento` si riusa la **forma** del
controllo — `s = (s*31 + v) >>> 0` — e nient'altro. Il contenuto e'
un'altra cosa.

## Che cosa deve contenere il codice

Tutto e solo quello che serve perche' due telefoni giochino la stessa
identica partita. Si legge da `Sfida.gioca` (riga 43575), che e' la
funzione che oggi apre una sfida di rete: quel che quella riceve dal
server, qui deve arrivare dal codice.

| campo | bit | perche' c'e' |
|---|---|---|
| versione del formato | 4 | un formato che cambia dev'essere riconoscibile, non frainteso |
| `MOTORE_V` | 4 | due motori diversi non giocano la stessa partita; oggi vale 2 |
| taglia | 2 | indice in `[5,7,11]` |
| seme | 32 | il seme del generatore, quello che `SEME.accendi` usa |
| postura di casa | 2 | `G.ment[0]` — la mentalita' (#132) |
| postura di fuori | 2 | `G.ment[1]` |
| indice di carattere | 4 | `indiceCarattere(...)+1`, 0 = nessuno (#132) |
| gol di casa da battere | 5 | il punteggio dello sfidante |
| gol di fuori da battere | 5 | |
| uomini di casa | 5 | 0..24, come `impaccaRosa` |
| uomini di fuori | 5 | |
| gli attributi | 28 per uomo | quattro numeri da 7 bit (1..99), l'ordine di `impaccaRosa` |

Con due rose da cinque — la rosa del gioco e' da cinque, `nuovaRosa()` —
fanno 70 bit di testa piu' 280 di rose: **350 bit tondi, cioe' 70 simboli
da 5 bit.**

### Quel che NON entra, e perche'

- **I nomi.** Della squadra e dei giocatori. Sono il dato di una persona
  e non muovono la partita: la stessa dichiarazione del tipo 7 del nastro
  (grep «COSA NON ENTRA: i nomi, le tinte»). In campo i due undici
  portano nomi ricavati da una tabella che i due telefoni hanno uguale,
  per costruzione: la sfida di carta si gioca fra `SFIDANTE` e la squadra
  di quartiere che l'indice di carattere nomina.
- **Le tinte e i motivi delle maglie.** Stessa ragione, piu' una: sono
  fissi, quindi non c'e' niente da mandare.
- **Lo schermo.** Ed e' il punto seguente, perche' merita una misura.
- **Il nastro dei comandi.** E questa e' la rinuncia dichiarata di tutto
  il cantiere: **una sfida di carta non porta una prova.** Chi riceve il
  codice rigioca la partita, ma il punteggio che dichiara dopo non lo
  verifica nessuno — non c'e' un giudice, perche' non c'e' un nastro, e
  un nastro non ci sta in un messaggio (misurato alla #133: 35.768 byte
  crudi, 4.924 in base64 per un minuto e mezzo di gioco). La sfida di
  carta e' un gioco fra due persone che si fidano, come un punteggio
  detto ad alta voce. Chi vuole un verdetto usa la SFIDA di rete, che il
  giudice ce l'ha. Questo va **scritto nel gioco**, non solo qui.

### Lo schermo: la domanda e la risposta, misurate

La #133 ha scoperto che il nastro porta i tocchi in coordinate di
schermo, e che lo stesso nastro su `800x360` finisce `0-3` dove su
`915x412` finisce `3-4`. Da li' la domanda giusta per questo cantiere:
**il codice deve portarsi dietro lo schermo?**

No, e la ragione e' che qui **non si scambia un nastro, si scambia una
partita da rigiocare da zero**. Nessuno rigioca i tocchi di un altro:
ognuno gioca coi suoi, sul suo telefono. Quel che deve essere identico e'
il MONDO in cui i due pollici si muovono — seme, taglia, rose, posture,
carattere, sponde, mira guidata, durata.

Ma la ragione non basta: **misurato**, prima di scrivere una riga
(`fuori/_sonda-135-base.js`). CPU contro CPU (nessun dito, quindi nessuna
coordinata per costruzione), stessa impostazione, quattro viste
(`915x412`, `800x360`, `380x640`, `1024x460`) e quattro salvataggi locali
diversi (nome squadra, rosa, sponde, mira guidata, mentalita', taglia
preferita):

| seme | 915x412 | 800x360 | 380x640 | 1024x460 | identiche |
|---|---|---|---|---|---|
| 20260922 | 1-0, 5504 sorteggi | 1-0, 5504 | 1-0, 5504 | 1-0, 5504 | **si** |
| 20260923 | 2-1, 7674 | 2-1, 7674 | 2-1, 7674 | 2-1, 7674 | **si** |
| 777 | 1-3, 7249 | 1-3, 7249 | 1-3, 7249 | 1-3, 7249 | **si** |

Confrontati punteggio, sorteggi consumati, dodici impronte della
posizione di tutti gli uomini e del pallone (una ogni dieci secondi), gli
attributi schierati e le due panchine. **Tutto identico su tutte e
quattro le viste.** Lo schermo resta fuori dal codice.

Quel che rende vera questa tavola, e che il codice DEVE portare o
forzare:

- `sponde:'gabbia'` e `miraGuidata:'pieno'`, forzati come gia' fa
  `Sfida.gioca` (voci #87 e #113): sono impostazioni locali, e due
  telefoni con scelte diverse girerebbero su due motori diversi;
- `G.sfida` valorizzato, perche' `durataPartita()` (riga 4136) legge
  quello per fissare il cronometro al valore di serie invece che a
  `SAVE.durata`;
- le due rose passate per intero a `startMatch` — cosi' `G.miaRosa` e
  `G.oppRosa` sono quelle del codice e non quelle del telefono;
- i due NOMI fissi, perche' il nome muove i nomi dei rincalzi
  (`rosaAvversaria('QUARTIERE·'+G.teamName, ...)`) e delle due panchine
  (`'PANCHINA·'+G.teamName`), e `rosaAvversaria` legge `SAVE.rosa` per
  non ripetere cognomi gia' in casa (righe 9885-9891): un nome che viene
  dal telefono e' un canale che entra dalla finestra.

## Il codice, com'e' fatto fuori

**Alfabeto**: Crockford base32 — `0123456789ABCDEFGHJKMNPQRSTVWXYZ`,
senza `I`, `L`, `O`, `U`. In lettura si alza tutto a maiuscolo, `I` e `L`
diventano `1`, `O` diventa `0`, e si butta via qualunque cosa non sia una
lettera o una cifra (spazi, ritorni a capo, trattini, virgolette che gli
applicativi di messaggistica aggiungono da soli). Niente punti, niente
segni che un correttore automatico voglia cambiare.

**Forma**: `CARTA` + 70 simboli + 4 di controllo = **79 caratteri, una
parola sola**. Una parola sola e non a gruppi separati da trattino perche'
su un telefono il doppio tocco seleziona una parola: un codice spezzato
si copia a meta'.

**Misurato** (`fuori/_sonda-135-codice.js`):

- lunghezza **79 caratteri**, la stessa su 1000 sfide a caso (79..79).
  Sta in un SMS (160), in un messaggio di WhatsApp o Telegram, e in una
  riga di 80 colonne;
- impacca-e-spacca e' l'identita' su **1000/1000** sfide a caso.

**Il controllo**: quattro simboli, 20 bit, dalla stessa forma di
`codiceTrasferimento` — `s = (s*31 + v) >>> 0` sui simboli del corpo,
poi `s % 1048576`. Misurato, e in modo ESAUSTIVO sulle due classi che il
mandato nomina:

| classe di errore | prove | catturate |
|---|---|---|
| una cifra cambiata (esaustivo: ogni posizione × ogni altro valore) | 2294 | **2294 = 100%** |
| due cifre scambiate (esaustivo: ogni coppia) | 2614 | **2614 = 100%** |
| da 1 a 4 simboli cambiati a caso | 297.558 | **297.558 = 100%** |
| *per confronto*: lo stesso controllo con UN carattere solo | 19.846 | 97,52% |

Il 100% sulle prime due classi non e' fortuna ed e' dimostrabile: un
simolo cambiato sposta l'accumulatore di `delta * 31^k`, e `31^k` e'
dispari, quindi invertibile modulo `2^20`; con `|delta| <= 31` non puo'
annullarsi. Uno scambio sposta l'accumulatore di
`(a-b) * 31^m * (31^d - 1)`, e la potenza di due che divide `31^d - 1`
vale 1 per `d` dispari e `5 + v2(d)` per `d` pari: per arrivare a 20 con
`v2(a-b) <= 4` servirebbe `d >= 2048`, cioe' un codice trenta volte piu'
lungo di questo. **Con un carattere solo di controllo (5 bit) il tasso
misurato scende a 97,5%: un codice sbagliato su quaranta passerebbe, e
chi lo gioca giocherebbe una partita diversa senza saperlo.** Sono tre
caratteri in piu' su settantanove.

## Il giro, dalla parte di chi gioca

1. **SFIDA DI CARTA** → **CREA UNA SFIDA**. Il gioco pesca un seme, ne
   ricava un avversario (una delle dieci squadre di quartiere, con una
   rosa costruita dal seme attorno alla forza della tua), e apre la
   partita. Nessuna richiesta di rete: il codice non esiste ancora,
   perche' non c'e' ancora un punteggio da battere.
2. Si gioca. Al fischio finale il gioco costruisce il codice — con il
   punteggio vero — e lo mette nel pannello. Si copia e si manda.
3. Chi lo riceve lo incolla e preme **GIOCA LA SFIDA**. Il pannello dice
   prima di partire che cosa c'e' da battere: «5 contro 5 contro
   GASOMETRO, devi fare meglio di 3-2».
4. Si gioca la stessa identica partita. Al fischio finale il gioco dice
   se ha fatto meglio, uguale o peggio.

**Una sfida di carta non paga e non insegna**: niente monete, niente
crescita della rosa, niente trofei, e `Rete.imparaIndole` non viene
chiamata. In campo non c'e' la tua squadra — c'e' quella del codice — e
far crescere la propria rosa giocando con quella di un altro sarebbe un
imbroglio verso se stessi. E' la stessa regola del replay
(`G.matchRewarded = true`).

## Dove sta il bottone, misurato prima di metterlo

La barra `.azioni` della schermata SFIDA ha gia' tre bottoni. Il difetto
gia' pagato e' quello del TORNEO (grep «LE OTTO SQUADRE SOPRA LA
PIEGA»), e il cancello che lo sorveglia qui e' `_q-sigillo` prova B3: a
`800x360` con cinque righe, `CERCA AVVERSARIO` e la prima riga della
lista devono restare interi sopra la piega.

Tre posti, misurati sullo stesso gioco di oggi iniettando il nodo nel DOM
(`fuori/_sonda-135-bottone.js`; `CERCA`/prima riga/primo `GUARDA`, fondo
della barra, piega):

| dove | 915x412 (lista vuota) | 800x360 (5 righe) | 380x640 (5 righe) | esito |
|---|---|---|---|---|
| oggi | CERCA@220 · barra@372 | CERCA@220 · riga@329 · GUARDA@308 | CERCA@298 · riga@407 | — |
| (a) quarto bottone nella barra | CERCA@220 · barra@435 | riga@329 · GUARDA@308 | riga@407 | la barra passa a due file; il bottone nuovo cade **sotto** la piega |
| (b) voce grande SOPRA la lista | CERCA@220 · barra@418 | riga@**375** · GUARDA@354 | riga@555 | **rompe B3**: la prima riga finisce 15 px sotto la piega di 360 |
| (c) voce grande SOTTO la lista | CERCA@220 · barra@418 · voce@347 | riga@329 · GUARDA@308 · voce@667 | riga@407 · voce@773 | niente si muove sopra; la voce sta sopra la piega a lista vuota |

Si sceglie **(c)**, e per un motivo solo: e' l'unica che lascia
`CERCA AVVERSARIO`, la prima riga e il primo `GUARDA` **allo stesso
pixel** su tutte e tre le viste (220 / 329 / 308, identici). La (b) e' la
tentazione ovvia — l'ingresso in alto, ben visibile — ed e' misurata
rompere il cancello: 375 contro una piega di 360.

**Il prezzo, detto**: la barra dei tre bottoni scende di 46 px (da 372 a
418). A `915x412` con la lista vuota i suoi bottoni finiscono 6 px sotto
la piega, e ci si arriva scorrendo — lo stesso scorrimento che quella
schermata chiede gia' oggi appena la lista ha una riga (misurato: barra a
692 con cinque righe). L'ingresso nuovo, che e' la cosa che dev'essere
trovata, resta invece sopra la piega su tutte e tre le viste a lista
vuota (347 / 347 / 471 contro pieghe di 412 / 360 / 640).

## Zero rete

Il cancello `senza-rete` (in batteria, `conta:true`) pretende che il
gioco non faccia una sola richiesta all'avvio. La sfida di carta e' la
funzione che **non chiama nessuno mai**: ne' creando, ne' giocando, ne'
leggendo. Il banco non si limita a fidarsi — conta le richieste di rete
della pagina attraverso tutto il giro (crea, gioca, incolla, rigioca) e
pretende **zero**.

## Il banco

`strumenti/_q-carta.js`, che nasce ROSSO, in quattro gruppi.

- **A) il codice.** Impacca-e-spacca su N sfide a caso; la lunghezza; il
  controllo, esaustivo su una cifra cambiata e su due scambiate; il
  rifiuto di un codice di un altro motore, di un'altra versione, troncato
  o con una lettera non dell'alfabeto; e le due serrature contro il
  codice di trasferimento (nei due versi).
- **B) niente identita' dentro.** Due pagine con id, segreto, nome
  squadra e nomi di rosa DIVERSI costruiscono la stessa sfida: il codice
  dev'essere **identico carattere per carattere**. E' la prova che
  discrimina davvero, perche' non guarda le sottostringhe: un falso che
  ci infilasse il segreto cifrato passerebbe una ricerca di testo e
  cadrebbe qui. Piu' la prova grossolana (il codice non contiene l'id ne'
  il segreto ne' i nomi) e la prova al contrario: leggere un codice non
  cambia di un carattere l'identita' del telefono.
- **C) due telefoni, la stessa partita.** Lo stesso codice giocato a CPU
  contro CPU su viste diverse e salvataggi diversi: stesso punteggio,
  stessi sorteggi, stessa impronta. E il telefono che CREA gioca la
  stessa partita di quello che RICEVE — non solo due riceventi fra loro.
- **D) la schermata, e la rete che non c'e'.** Il pannello si apre e
  mostra il codice; un codice storto dice la causa vera; la piega non si
  muove (CERCA, prima riga, primo GUARDA agli stessi pixel di oggi) e il
  nuovo ingresso sta sopra la piega; zero richieste di rete in tutto il
  giro.

### I falsi

Costruiti nel caso peggiore: ognuno deve **passare** tutte le prove
tranne la sua.

| falso | che cosa sbaglia | quale prova lo boccia |
|---|---|---|
| `_crit-carta-segreto.js` | infila id e segreto dell'allenatore in coda al codice, con il controllo rifatto sopra: il giro impacca/spacca funziona, la partita e' la stessa, il codice resta corto | **B** (due identita' diverse, due codici diversi) |
| `_crit-carta-nomi.js` | ci mette il nome della squadra (un dato personale «innocuo») | **B** |
| `_crit-carta-controllo.js` | un solo carattere di controllo invece di quattro | **A** (il tasso di cattura scende sotto la soglia) |
| `_crit-carta-locale.js` | la partita legge le impostazioni del telefono (sponde, mira guidata, durata) invece di forzarle | **C** (due telefoni, due partite) |
| `_crit-carta-lungo.js` | scrive il codice in JSON e base64, che e' l'implementazione «naturale» | **A** (la lunghezza: non ci sta in un messaggio) |

## Le reti di sicurezza

A ogni compito, tutte: `_q-duello-impronta` **44/44**, `_q-giudice`
**21/21**, `_q-sigillo` **14/14**, `_q-ment-nastro` 6/6,
`_q-carattere-nastro` 4/4, `_q-rosa-scala` 4/4, `_q-nastro-tronco` 5/5,
piu' `_q-rete`, `_q-sfida` e `senza-rete`. Misurate PRIMA di toccare
qualunque cosa, e tutte verdi.

`MOTORE_V` resta **2**: non si tocca ne' il nastro ne' la simulazione. Il
codice della sfida di carta PORTA il numero, ma non lo cambia.
