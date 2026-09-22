# La classifica degli amici (voce #136)

22 settembre 2026. Sesto cantiere dell'onda D. I cinque che vengono
prima hanno costruito il giudizio della sfida di RETE — il metro (#130),
il duello nel nastro (#131), i cinque canali (#132), il giudice (#133),
il sigillo (#134) — e poi la voce #135 ha fatto l'altra meta': **la
sfida di carta**, settantanove caratteri che contengono una partita
intera e che stanno in un SMS.

Ma la sfida di carta e' un giro **a meta'**: io ti mando il codice, tu
giochi la mia partita e il gioco ti dice se hai fatto meglio di me. Li'
finisce. **Il mio telefono non lo sa.** Chi ha mandato la sfida non
sapra' mai com'e' andata, e due persone che si sfidano per un mese non
hanno un posto dove guardare chi e' avanti.

Il mandato (§5, punto 12a) chiede la **classifica amici**. Questa voce
la costruisce senza aggiungere un server, un conto, un identificatore:
**dai codici che tornano indietro**. Chi ha giocato la mia sfida mi
rimanda ventuno caratteri col risultato; il mio telefono li legge, li
confronta col punteggio che avevo fatto io, e segna una riga. Dall'altra
parte la stessa riga nasce da sola, perche' chi riceve una sfida i due
punteggi li ha gia' tutti e due. **Due telefoni, nessun server, la
stessa classifica.**

## Il giro completo, e dove si chiude

```
   ANNA                                            BRUNO
   ----                                            -----
1. CREA UNA SFIDA, gioca, finisce 3-2
   -> codice CARTA... (79 caratteri)  --- SMS -->
                                                2. incolla, gioca la
                                                   stessa partita, 2-2
                                                   -> sa gia' TUTTO:
                                                      segna «ANNA: persa»
                                                3. -> codice ESITO...
                     <--- SMS ---                   (21 caratteri)
4. incolla il codice, scrive «BRUNO»
   -> segna «BRUNO: vinta»
```

Al passo 2 il telefono di Bruno conosce i due punteggi: il suo, e quello
dello sfidante che stava gia' dentro il codice CARTA. Non gli serve
niente di nuovo per segnare la riga. Al passo 4 il telefono di Anna ha
bisogno del punteggio di Bruno, e **quello e' l'unico dato che manca in
tutto il giro**: e' il codice di risposta a portarlo.

## Il codice di risposta

**Prefisso `ESITO`**, e il carico e' questo e nient'altro:

| campo | bit | perche' c'e' |
|---|---|---|
| versione del formato | 4 | un formato che cambia dev'essere riconoscibile, non frainteso |
| `MOTORE_V` | 4 | un risultato fatto con un altro motore non e' confrontabile |
| seme | 32 | e' il NOME della partita: dice a quale sfida risponde |
| gol di casa dello sfidante | 5 | il punteggio che stava nel codice CARTA, rimandato indietro |
| gol di fuori dello sfidante | 5 | |
| gol di casa di chi risponde | 5 | il punteggio nuovo, quello che il giro esisteva per portare |
| gol di fuori di chi risponde | 5 | |

**60 bit tondi = dodici simboli da cinque, zero riempimento**, piu'
quattro simboli di controllo: `ESITO` + 12 + 4 = **21 caratteri**.
Misurato (`fuori/_sonda-136-codice.js`): 21..21 su 1000 risposte a caso.

Sta in un SMS (160), in una riga da 80 colonne, e — questa e' la
differenza vera con i 79 caratteri della sfida — **si puo' dettare a
voce al telefono**: ventuno lettere si leggono in dieci secondi.

L'alfabeto e' quello della voce #135 e non se ne fa un altro: Crockford
base32, `0123456789ABCDEFGHJKMNPQRSTVWXYZ`, senza `I` `L` `O` `U`. Due
alfabeti nello stesso gioco sono due modi di sbagliare a ricopiare.

**La parola ESITO ha una I e una O**, cioe' proprio le due lettere che
l'alfabeto butta via perche' nessuno sa ricopiarle. Il prefisso si
confronta quindi DOPO la stessa normalizzazione del corpo (`I` e `L`
valgono 1, `O` vale 0): chi ricopia a mano `ES1T0` viene capito lo
stesso. Misurato: `es1t0...` e `ESITO...` danno lo stesso risultato.

### Il controllo, e la classe che nessun controllo prende

Quattro simboli, 20 bit, la stessa forma della voce #135 —
`s = (s*31 + v) >>> 0`, poi `s % 1048576`. Misurato su cinquanta codici
diversi (non su uno solo: un corpo di dodici simboli e' corto, e una
misura su un codice solo sarebbe un aneddoto):

| classe di errore | prove | catturate |
|---|---|---|
| una cifra cambiata (esaustivo) | 24.800 | **24.800 = 100%** |
| due cifre scambiate (esaustivo) | 5.770 | **5.770 = 100%** |
| da 1 a 4 simboli cambiati a caso | 99.147 | 99.141 = **99,994%** |
| *per confronto*, con UN simbolo di controllo: due scambiate | 3.724 | 2.460 = **66,06%** |
| *per confronto*, con UN simbolo: da 1 a 4 a caso | 99.151 | 97.720 = 98,56% |

**Le sei fughe non sono un difetto del controllo, e si sa quali sono:**
tutte e sei cambiano le posizioni **11 e 15**, cioe' l'ultimo simbolo
del carico e l'ultimo simbolo di controllo. L'ultimo simbolo del carico
pesa `31^0 = 1` nell'accumulatore, quindi una sua variazione di `d` e
una variazione di `d` sul simbolo di controllo basso si annullano: il
testo che esce **e' un codice valido di un'altra partita**, non un
codice storto accettato. E' la classe che nessun controllo puo'
prendere, perche' per definizione il controllo e' funzione del carico.
Va detta, non nascosta dietro una percentuale.

Il confronto con un simbolo solo dice perche' i simboli sono quattro:
**su due cifre scambiate cadrebbe un codice su tre**.

### Le tre serrature

Nel gioco girano adesso tre codici che si incollano nello stesso posto,
e nessuno dei tre deve poter essere scambiato per un altro:

| codice | comincia per | dentro c'e' | chi lo rifiuta |
|---|---|---|---|
| cambio telefono | (niente) `id.segreto.controllo` | **l'identita'** | `spaccaCarta` e `spaccaEsito`: non comincia ne' per CARTA ne' per ESITO, e ha dei punti |
| sfida di carta | `CARTA` | la partita | `spaccaEsito` torna `e-una-sfida` |
| risposta | `ESITO` | il risultato | `spaccaCarta` torna `e-un-risultato` |

Le ultime due sono **nuove rispetto alla voce #135**: prima
`spaccaCarta` avrebbe detto «non e' un codice di sfida» a un codice di
risposta, cioe' la causa sbagliata. Adesso ognuno dei due lettori
riconosce il codice dell'altro e lo dice per nome: e' la stessa regola
delle due serrature del #135, allargata al terzo codice.

### Che cosa NON viaggia, e non e' una svista

- **Nessuna identita'.** Non l'`id` di rete, non il segreto, non un
  numero derivato da loro. E' la regola della voce #135, e qui vale di
  piu': il codice di risposta e' il codice che **si manda a qualcuno che
  non ti ha mandato niente prima**, cioe' quello che un giorno finira'
  in un gruppo di venti persone.
- **Nessun nome.** Ne' quello della squadra ne' quelli dei giocatori.
  L'amico, sulla classifica, si chiama come **tu** lo chiami sul **tuo**
  telefono: il soprannome e' scritto a mano, resta nel salvataggio
  locale e non esce di li'. Due telefoni possono chiamarsi in due modi
  diversi e la classifica funziona lo stesso, perche' la chiave della
  riga e' il nome LOCALE e la chiave della PARTITA e' il seme.
- **Nessuna data, nessun luogo, nessun apparecchio.** Il `quando` di una
  riga e' l'orologio di chi segna, non viaggia.
- **Niente taglia.** La sfida di carta oggi si gioca solo a cinque
  (`CARTA_TAGLIE = [5]`, voce #135) e la classifica non guarda il campo:
  un bit risparmiato e' un bit che non si puo' sbagliare. Se domani si
  apre il sette, la versione del formato serve a questo.
- **Nessuna prova.** Come la sfida di carta, e per la stessa ragione
  gia' scritta nel gioco: un nastro non ci sta in un messaggio. Chi
  rimanda un codice puo' dichiarare il punteggio che vuole. **Tranne il
  tuo**, e la riga qui sotto dice perche'.

### Il tuo punteggio non te lo riscrive nessuno

Il codice di risposta porta **tutti e due** i punteggi, e serve: il
telefono di Anna potrebbe aver chiuso il gioco, essere stato spento per
una settimana, o aver perso il codice della sua sfida (la voce #135 lo
tiene in memoria di sessione, non nel salvataggio).

Ma se il telefono quel seme se lo ricorda, **vince il ricordo**. In
`SAVE.amici.mie` finiscono le sfide che HO creato: seme e punteggio, le
ultime venti. Quando arriva una risposta per uno di quei semi e il
punteggio dichiarato non e' il mio, si segna **il mio** e la riga lo
dice in chiaro. E' l'unica verifica possibile senza un server, e costa
venti numeri.

## `SAVE.amici`, e perche' NON serve una v5

Il salvataggio vive in `localStorage` sotto `calcetto_save_v4`, si
scrive con un `JSON.stringify(SAVE)` secco e si rilegge **a whitelist**
(`loadSave`, riga 10173): chiave per chiave, tipo per tipo, con i tetti.
Il precedente e' gia' dichiarato nel gioco accanto a `div` (Contenuto 1,
1 settembre 2026): «I salvataggi nati prima prendono il default: chiave
additiva, versione ferma a v4».

**Misurato prima di crederci** (`fuori/_sonda-136-save.js`), su un
salvataggio di squadra vissuta — 37 chiavi, 1.784 byte, con monete,
rosa, statistiche, scala, albo, identita' di rete:

| verso | prova | esito |
|---|---|---|
| INDIETRO | si toglie una chiave conosciuta (`div`) da quel che sta in localStorage — cioe' la forma esatta di un salvataggio piu' vecchio | `div` torna al default, **nessuna delle altre 36 chiavi persa** |
| AVANTI | si aggiunge una chiave che il gioco non conosce (`amici`) | la whitelist la ignora, **nessuna altra chiave persa** |
| AVANTI, dopo | che fine fa quella chiave al primo `persistSave`? | **cancellata** |

La terza riga e' il prezzo, e va detto: **chi gioca con questa versione
e poi riapre una versione VECCHIA del gioco perde la classifica degli
amici**, perche' la vecchia rilegge a whitelist e riscrive senza. Non e'
un guasto nuovo — e' come si comporta questo salvataggio da sempre, per
qualunque chiave — ma qui c'e' dentro il lavoro di un mese di sfide, e
chi non lo sa lo scopre dopo.

La struttura:

```js
amici: {
  righe: [ { n:'BRUNO',            // il soprannome, scritto a mano, max 12
             g:3, v:2, p:0, s:1,   // giocate, vinte, pari, perse (dal mio punto di vista)
             mf:9, ms:4,           // i miei gol fatti e subiti, sommati
             sf:6, ss:7,           // i suoi
             q:1758..,             // quando l'ultima volta
             semi:[...] } ],       // i semi gia' contati: max AMICI_SEMI
  mie:   [ { s:seme, a:3, d:2, q:1758.. } ]   // le sfide che HO creato
}
```

**Il peso, misurato**: 1.784 byte nudo, 7.479 con venti amici al
completo (+5.695). Il tetto di `localStorage` e' 5 MB: siamo allo
**0,143%**.

### I tetti, e che cosa succede quando si superano

Una lista che puo' crescere e non e' tappata perde le righe vecchie in
silenzio. Qui i tetti sono tre, e nessuno dei tre e' silenzioso:

| lista | tetto | quando si supera |
|---|---|---|
| `righe` | **20 amici** | entra il nuovo, **esce il piu' vecchio per data** (`q`), e la riga sotto il campo LO DICE: «la classifica tiene venti amici: e' uscito X». Lo stesso modello della coda delle sfide (`m.coda.shift()`, riga 45561), con la differenza che li' nessuno lo diceva |
| `semi` di ogni riga | **12 partite** | esce il piu' vecchio. Conseguenza dichiarata: una risposta **piu' vecchia di dodici partite con quello stesso amico**, reincollata, verrebbe contata due volte. La classe di sbaglio vera — incollare due volte lo stesso codice — e' presa sempre |
| `mie` | **20 sfide create** | esce la piu' vecchia. Conseguenza: se mandi piu' di venti sfide senza che tornino indietro, la ventunesima risposta non trova piu' il tuo punteggio e si fida di quello dichiarato nel codice |

E in rilettura i tetti si riapplicano tutti e tre (`slice(0,20)`), come
fa gia' la coda: un salvataggio manomesso non puo' iniettare duemila
amici.

### Lo stesso codice incollato due volte

E' lo sbaglio piu' probabile di tutti — un messaggio si rilegge, un
pollice ripete — e senza una difesa raddoppierebbe una vittoria. La
chiave e' il **seme**: due partite diverse hanno due semi diversi (32
bit a caso), quindi «questo seme l'ho gia' contato per questo amico»
e' la domanda giusta.

E deve stare **per amico** e non in una lista sola: una stessa sfida si
manda a due persone, e due risposte diverse con lo stesso seme sono due
partite che contano tutte e due.

## La classifica, come si legge

Ordine: **punti** (3 per una vinta, 1 per un pari), poi **scarto**
(`(mf-ms) - (sf-ss)`, cioe' la stessa cosa che decide una singola
sfida, sommata), poi le giocate, poi il nome. Deterministico apposta: un
ordinamento che dipende dall'ordine di inserimento non e' misurabile.

Chi ha fatto meglio in una singola sfida e' gia' deciso dalla voce #135
(`chiudiSfida`): **prima la differenza reti, poi i gol fatti**. Quella
regola diventa una funzione sola, `esitoCarta(...)`, e la chiamano tutte
e due le porte — il fischio finale e la lettura del codice. Due copie
della stessa regola a duecento righe di distanza sono una copia che un
giorno si scosta.

## Dove va, a schermo

### La classifica: dentro CLASSIFICA, sopra quella di rete

La schermata `#classifica` oggi mostra la classifica di rete e basta; a
rete spenta mostra una riga (`Sfida.perche('spenta')`) e nient'altro. E'
il posto giusto per i testa a testa, e per una ragione che si misura:
**non ha bisogno di un ingresso nuovo**. Il bottone CLASSIFICA nella
barra c'e' gia', quindi la schermata SFIDA **non si tocca di un pixel**
e i tre bersagli inchiodati da `_q-sigillo` B3 e da `_q-carta` D4 —
CERCA@220, prima riga@329, GUARDA@308, piu' SFIDA DI CARTA@347 — restano
dove sono, per costruzione e non per fortuna.

Misurato (`fuori/_sonda-136-piega.js`), amici SOPRA contro amici SOTTO
la classifica di rete:

| | 915x412 | 800x360 | 380x640 |
|---|---|---|---|
| oggi, 5 righe di rete | primaRete@118 · TORNA@341 | primaRete@94 · TORNA@317 | primaRete@239 · TORNA@462 |
| (a) amici SOPRA, 5 amici + 5 di rete | **primoAmico@114** · primaRete@326 · TORNA@549 | **primoAmico@114** · primaRete@326 · TORNA@549 | primoAmico@149 · primaRete@375 · TORNA@598 |
| (b) amici SOTTO, 5 amici + 5 di rete | primaRete@94 · **primoAmico@306** · TORNA@529 | primaRete@94 · **primoAmico@306** · TORNA@529 | primaRete@126 · primoAmico@352 · TORNA@575 |
| (b) amici SOTTO, 20 amici + 20 di rete | **primoAmico@876** | **primoAmico@876** | primoAmico@921 |

Si sceglie **(a), gli amici sopra**, e la riga che decide e' l'ultima:
con la classifica di rete piena, la (b) manda il primo amico a 876 px,
cioe' fuori da qualunque telefono. La cosa che funziona **sempre** —
anche senza campo, anche a server spento — non puo' stare sotto la cosa
che funziona solo con la rete.

**Il prezzo, detto**: con cinque amici la prima riga della classifica di
rete scende da 94/118 a 326, e con venti amici a 896 — si arriva
scorrendo. E TORNA ALLE SFIDE passa da 317/341 a 549: sotto la piega su
entrambe le viste orizzontali. Era gia' cosi' oggi con venti righe di
rete (TORNA@887), ed e' un bottone che non serve trovare per primo.

Quel che NON scende: **il primo amico sta a 114 px su tutte e due le
viste orizzontali e a 149 su quella verticale**, cioe' e' la prima cosa
che si vede dopo il titolo.

### Il pannello SFIDA DI CARTA, e un difetto trovato per strada

Il posto dove si incollano i codici e' il pannello della sfida di carta:
e' li' che il codice di risposta si legge, ed e' li' che il nome
dell'amico si scrive. La classifica GUARDA, il pannello PARLA.

Misurando dove sarebbero cadute le aggiunte si e' trovato un difetto
**che c'e' gia' nel gioco spedito** (`fuori/_sonda-136-pannello.js`):

```
#sfidaCarta{display:flex; align-items:center; overflow-y:auto}
```

Il pannello e' alto **542 px**; la piega di un telefono in orizzontale
e' 412 o 360. Con `align-items:center` il figlio piu' alto del
contenitore viene centrato e la sua **cima finisce sopra lo zero**:
misurato, `top = -65` a 915x412 e `-91` a 800x360, e `scrollTop = 0` non
la riporta indietro (`scrollHeight` 493 contro 574 di contenuto: 81 px
persi in cima, e non c'e' scorrimento che li raggiunga).

**Cioe': su un telefono in orizzontale il titolo SFIDA DI CARTA e le
prime righe che spiegano che cos'e' non si possono leggere.** Nessun
banco lo vedeva perche' nessuno misurava la cima.

La cura e' una parola, `align-items:flex-start`, **e si mette solo su
`#sfidaCarta`**: il pannello del CAMBIO TELEFONO e' alto 349 px e la
cima ce l'ha sempre avuta (misurato: 32 / 6 / 135). Cambiargli il
centraggio sarebbe un ritocco gratuito a una schermata spedita.

| | oggi (center) | con flex-start | con flex-start + le aggiunte |
|---|---|---|---|
| cima della carta (915x412) | **-65, irraggiungibile** | 16 | 16 |
| titolo | **-44, non si legge** | 37 | 37 |
| CREA UNA SFIDA | 201 | 283 | 283 |
| GIOCA LA SFIDA | 326 | 407 | 407 |
| SEGNA IL RISULTATO | — | — | 524 |
| altezza della carta | 542 | 542 | 659 |

**Il prezzo, detto**: a 800x360 GIOCA LA SFIDA passa da 300 a 407, cioe'
sotto la piega — in cambio di un pannello in cui **tutto** si raggiunge
scorrendo, compreso il titolo. Oggi GIOCA si vedeva e le prime otto
righe no, e non c'era modo di arrivarci.

Le aggiunte nel pannello sono tre, e stanno **dopo** GIOCA LA SFIDA
cosi' le due azioni della voce #135 restano le prime:

1. una riga che dice che cosa fare col codice tornato indietro;
2. il campo del **nome dell'amico** (`#sfCartaAmico`), che dichiara
   accanto a se' che quel nome **resta su questo telefono**;
3. il bottone **SEGNA IL RISULTATO** (`#btnSfCartaSegna`).

E il campo readonly che gia' c'e' (`#sfCartaMio`) cambia contenuto: dopo
una sfida **ricevuta** mostra il codice `ESITO` da rimandare, non piu'
il codice `CARTA` della stessa partita col proprio punteggio. La riga
sopra dice quale dei due e'. Un campo solo per «il codice da copiare» e'
un campo che non si sbaglia; due campi readonly di ventuno e
settantanove caratteri uno sopra l'altro sono una scelta da fare mentre
si copia.

### Zero rete, e stavolta e' tutto il pregio

Il cancello `senza-rete` (in batteria, `conta:true`) pretende che il
gioco non faccia una richiesta all'avvio. La classifica degli amici non
ne fa nessuna **mai**: ne' segnando, ne' leggendo, ne' aprendo la
schermata. E la schermata CLASSIFICA, che oggi a rete spenta e' una riga
di scuse, da qui in avanti ha sempre qualcosa da mostrare: **i testa a
testa si dipingono prima di parlare col server, e si vedono anche quando
il server non c'e'**.

## Il banco

`strumenti/_q-amici.js`, che nasce ROSSO (`window.__test.amici` non
esiste), in quattro gruppi.

- **A) il codice di risposta.** Impacca-e-spacca identita'; la
  lunghezza; il controllo esaustivo su una cifra cambiata e su due
  scambiate, misurato su cinquanta codici e non su uno; i rifiuti (altro
  motore, altra versione, troncato, lettera fuori alfabeto, vuoto); le
  **tre serrature** nei due versi; e il codice sporcato dalla
  messaggistica (spazi, a capo, minuscole, trattini, `ES1T0`) che passa
  lo stesso.
- **B) dentro il codice non c'e' nessuno.** Due telefoni con id,
  segreto, nome squadra e nomi di rosa diversi, stessa partita e stesso
  risultato: il codice dev'essere **identico carattere per carattere**.
  Piu' la prova grossolana delle sottostringhe, e quella al contrario —
  leggere e segnare una risposta non cambia di un carattere l'identita'
  di chi la legge.
- **C) la classifica si compila, e le due si specchiano.** E' il gruppo
  che dice se questo cantiere ha senso: due telefoni veri giocano il
  giro intero (crea, manda, gioca, rimanda, segna) e alla fine **la riga
  di Anna dice «vinta» e quella di Bruno dice «persa», sulla stessa
  partita**. Piu': il doppione, i tre tetti, la sopravvivenza al
  riavvio, l'additivita' del salvataggio misurata chiave per chiave, e
  il punteggio proprio che un codice non puo' riscrivere.
- **D) la schermata, e la rete che non c'e'.** La classifica si apre a
  rete spenta e mostra i testa a testa **piu'** la riga che dice perche'
  quella di rete non c'e'; la piega della schermata SFIDA non si muove
  di un pixel; la cima del pannello e' raggiungibile; zero richieste di
  rete in tutto il giro.

### I falsi

Costruiti nel caso peggiore: ognuno deve **passare** tutte le prove
tranne la sua.

| falso | che cosa sbaglia | quale prova lo boccia |
|---|---|---|
| `_crit-amici-identita.js` | «cosi' sai da chi viene»: sessanta bit dell'identificatore di rete in coda al carico, col controllo rifatto sopra. Il giro funziona, la classifica si compila, il codice resta corto, e le cifre esadecimali cadono su simboli base32 che non somigliano a niente | **B1** (due identita', due codici diversi) |
| `_crit-amici-nome.js` | ci mette il nome della squadra, un dato personale «innocuo», cosi' l'amico non deve scriverlo a mano | **B1** ~~e **B2**~~ |
| `_crit-amici-doppio.js` | niente memoria dei semi: lo stesso codice incollato due volte conta due volte | **C** (il doppione) |
| `_crit-amici-senzatetto.js` | la lista degli amici non e' tappata: cresce e basta | **C** (il tetto) |
| `_crit-amici-scordone.js` | segna in memoria e non chiama `persistSave`: la classifica c'e' finche' non si chiude il gioco | **C** (il riavvio) |
| `_crit-amici-credulone.js` | si fida sempre del punteggio dichiarato nel codice, anche quando il telefono quel seme se lo ricorda | **C** (il punteggio che non si riscrive) |
| `_crit-amici-centrato.js` | rimette `align-items:center` sul pannello | **D4** (la cima raggiungibile) |
| `_crit-amici-rete.js` | *(aggiunto al compito 3)* segnare manda anche una copia al server, «cosi' se cambi telefono la classifica ti segue» | **D5**, prima tacca |

**Rettifica a edizioni (22 settembre 2026, compito 2; fonte: la corsa di
`_q-amici --solo A,B,C --gioco fuori/gioco-amici-nome.html`).** La riga
di `_crit-amici-nome` diceva che a bocciarlo sarebbero state **B1 e
B2**. Misurato: **solo B1**. B2 cerca il nome come sottostringa e non lo
trova, perche' nell'alfabeto di Crockford la `O` non esiste e diventa
uno zero: «DOPOLAVORO» finisce scritto **`D0P01A`** dentro al codice —
in chiaro, leggibile a occhio, e invisibile a una ricerca di testo. Il
testo sbagliato resta qui sopra barrato perche' e' la ragione per cui
B1 esiste: **una prova di sottostringhe non protegge niente**.

**Seconda rettifica (stessa corsa, falso `_crit-amici-scordone`).** Il
piano dava per scontato che «la classifica sopravvive al riavvio»
bastasse a condannare una versione che non scrive sul disco. Misurato:
**non basta**. Il gioco riscrive il salvataggio anche mentre la pagina
se ne va (`salvaPerSparizione`, tre eventi per tre morti diverse),
quindi dopo una ricarica la riga c'era lo stesso — l'aveva scritta
l'uscita, non la cura. C4 guarda il disco **subito**, senza chiudere
niente, e solo li' il falso cade.

## Le reti di sicurezza

A ogni compito, tutte, e misurate PRIMA di toccare qualunque cosa (tutte
verdi al compito 0): `_q-duello-impronta` **44/44**, `_q-giudice`
**21/21**, `_q-sigillo` **14/14**, `_q-carta` **22/22**, `_q-sfida`
**54/54**, `_q-rete` **22/22**, `_q-ment-nastro` 6/6,
`_q-carattere-nastro` 4/4, `_q-rosa-scala` 4/4, `_q-nastro-tronco` 5/5,
`senza-rete` **6/6** e `salvataggio` **11/11** — quest'ultimo e' il
guardiano naturale di un cantiere che tocca `SAVE`.

`MOTORE_V` resta **2**: non si tocca ne' il nastro ne' la simulazione.
Il codice di risposta PORTA il numero — un risultato fatto con un altro
motore non e' confrontabile — ma non lo cambia.
