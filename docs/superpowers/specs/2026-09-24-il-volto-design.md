# IL VOLTO — progetto (voce #147, ultimo cantiere dell'onda E)

**Merge-base dichiarato: `999fbf8`.** `MOTORE_V = 4`, `DISCHETTO_V = 1`.

## 0. IL BUCO, DETTO DA CHI L'HA LASCIATO

Il #146 chiude il suo verbale con una riga che è il mandato di questo cantiere:

> «**Il pannello sullo schermo non c'è.** La sfida si guida da
> `window.__test.dischetto`: **chi gioca non la vede.**»

Sette cantieri di misura (#141-#146) hanno costruito una sfida dal dischetto fra
due telefoni che funziona e che **nessuno può giocare**. Questo cantiere non
aggiunge una funzione: dà un volto a quelle già costruite. Tre cose, e sono tre
debiti dichiarati altrove, non tre idee nuove:

| | che cosa | chi l'ha dichiarato |
|---|---|---|
| **(a)** il pannello: creare, entrare, vedere la serie, vedere la fine | #146, verbale |
| **(b)** il respiro: il ritardo messo in scena invece di nascosto | progetto onda E §6 |
| **(c)** `vagliaNastro` non pretende le righe di tipo 14 | #146, §3.5 e verbale |

## 1. IL VINCOLO CHE COMANDA IL CANTIERE: LA PIEGA

Il #146 non ha improvvisato il pannello, e la sua ragione è il vincolo principale
di questo. La schermata SFIDA è **misurata a due formati** (`_q-sigillo` B3 a
800x360, `_q-carta` D4 agli stessi pixel), e il commento accanto a
`btnSfidaCarta` (`CALCETTO-il-gioco.html:3147-3153`) porta i tre numeri:

> «Sopra la lista spingerebbe la prima riga a 375 su una piega di 360 e
> romperebbe `_q-sigillo` B3 — il difetto già pagato del TORNEO. Qui non muove di
> un pixel CERCA AVVERSARIO (**220**), la prima riga (**329**) né il primo GUARDA
> (**308**).»

**Una voce in più sposta il taglio della pagina**: è un cantiere di disposizione
coi suoi cancelli, non un bottone da appiccicare.

### 1.1 Il posto, e perché è l'unico che non costa niente

L'ordine di oggi nella `.box` di `#sfida` è:

```
h1 SFIDA · lavagna (tessera + stato) · CERCA AVVERSARIO
eti LE SFIDE CHE HAI SUBITO · sf-lista (le righe, ognuna col suo GUARDA)
SFIDA DI CARTA
azioni (CLASSIFICA · CAMBIO TELEFONO · TORNA AL MENU)
```

I tre bersagli misurati — CERCA AVVERSARIO, la prima riga, il primo GUARDA — stanno
**tutti e tre sopra** `btnSfidaCarta`. In un flusso verticale normale, **niente
che si inserisca dopo `btnSfidaCarta` può muoverli**: la loro `bottom` dipende
solo da ciò che li precede.

**Quindi la voce nuova va subito dopo SFIDA DI CARTA.** È lo stesso ragionamento
del #135, un passo più in là, e ha lo stesso prezzo: la voce nuova, e la riga
delle azioni sotto di lei, scendono di un'altezza di bottone. `.ov` ha
`overflow-y:auto` (`:192`), quindi scendere sotto la piega significa **una
scrollata**, non un bottone perduto — ed è già la condizione in cui vive
`SFIDA DI CARTA` quando la lista ha cinque righe.

**Le due predizioni, da misurare e non da assumere** (compito 1, prima della cura):

1. a 800x360 e a 915x412, CERCA AVVERSARIO, la prima riga e il primo GUARDA
   **non si spostano di un pixel** fra prima e dopo;
2. `SFIDA DI CARTA` a lista vuota **non si sposta** (è prima della voce nuova);
   la voce nuova a lista vuota **sta sopra la piega** a 915x412, e a 800x360 si
   dichiara il numero, qualunque sia.

Se la predizione 1 cade, la voce **non si mette**: una schermata rotta su telefono
è peggio di una voce in meno. Il piano ha un ramo di riserva (§1.2).

### 1.2 Il ramo di riserva, scritto prima di servire

Se la misura dicesse che la voce nuova muove la piega, la seconda forma è
**dentro il pannello della sfida di carta**: un quarto bottone in `#sfidaCarta`,
che è un `overlay` e non tocca il flusso della `.box`. Costa una parola di
spiegazione in più (la carta è senza rete, il dischetto è con la rete: due cose
diverse nello stesso pannello) e per questo è la seconda scelta, non la prima.

## 2. IL PANNELLO (a)

### 2.1 Il modello è la sfida di carta

`#sfidaCarta` (`:3186-3229`) è il pannello più vicino: un `overlay` `.patto` con
campi `readonly` per il codice da copiare, campi d'ingresso per quello ricevuto,
bottoni `fbtn paga`, note in `sf-nota`. Il pannello nuovo `#sfidaDischetto`
**riusa le stesse regole CSS** (`:647-662`, la lista dei selettori si allunga di
un nome) e la stessa grammatica. Zero CSS nuovo oltre a tre righe per il
tabellone.

### 2.2 Che cosa si può fare, e che cosa si vede

| azione | come | che cosa ne esce |
|---|---|---|
| **creare** | `CREA LA SFIDA` | il codice di sei caratteri in un campo `readonly`, da mandare a un amico |
| **entrare** | un campo + `ENTRA COL CODICE` | l'appuntamento si chiude e la serie parte |
| **vedere la serie** | il tabellone, che si ridipinge a ogni giro | chi tira · chi para · il punteggio · i tiri già fatti, uno per uno |
| **vedere la fine** | il pannello si riapre da sé | vinta/persa/pari, oppure la causa vera dell'incompiuta |

**Le parole delle cause sono già scritte.** `S.causa` porta
`versione-diversa`, `motore-diverso`, `impegno-non-torna`, `esiti-diversi`,
`mossa-storta`, `rose-corte`, `incompiuta`, `rete`, `chiuso`. Il pannello ha una
tavola causa → frase in italiano, e **nessuna delle frasi accusa**: l'unica che
nomina un imbroglio è `impegno-non-torna`, che è l'unico punto in cui il #146 si
è permesso un'accusa, perché lì non c'è un dubbio, c'è un hash che non torna.

### 2.3 Il tabellone durante la serie: una fascia, non un pannello

Mentre si tira, il pannello **non può stare aperto**: il duello ha bisogno dello
schermo per la mira. Quindi la serie si vede in una **fascia sottile** sopra il
duello (`#dsFascia`), che porta il minimo e nient'altro: il codice della stanza,
il punteggio, il numero del tiro, il proprio ruolo (TIRI / PARI), i tiri già
fatti come pallini, e **il respiro** (§3), che è anche l'indicatore di
connessione. La fascia è `position:fixed` e non entra nel flusso di nessuna
schermata: non può muovere nessuna piega.

### 2.4 Il pezzo duro: il dito che diventa una mossa

Il protocollo del #146 pretende che la mossa si scelga **al buio** e si impegni
**prima** di vedere quella dell'altro. `Dischetto.risolviDuello` chiama poi le
tre porte vere (`pickZone` / `stopPower` / `pickKeeper`) quando le due mosse sono
sul tavolo. Quindi il dito **non può** chiamare le porte: se le chiamasse, il
duello sarebbe già risolto in locale, le righe di tipo 6 sarebbero scritte due
volte e `risolviDuello` troverebbe `Duel.phase !== 'zone'` per sempre.

**La cura: le tre porte si avvolgono una seconda volta.** `Dischetto` installa un
avvolgimento **sopra** quello del nastro (il blocco del dischetto sta a `:47400`,
l'avvolgimento del nastro a `:47022`: chi arriva dopo sta fuori). Ad
avvolgimento acceso — e si accende **solo** quando `S.fase === 'scegli'` — le tre
porte **non passano**: registrano.

```
pickZone(z,u,v)   ->  si ricorda (z, u*1000, v*1000) e si accende la barra
stopPower()       ->  si ricorda ps = i tick passati, e si posa la mossa
pickKeeper(z)     ->  si posa la mossa del portiere
```

`ps` è l'unico numero che va costruito: è il numero di tick da 1/60 fra la mira e
il rilascio, perché è esattamente quello che `risolviDuello` rigioca
(`for(let p=0; p<mt.ps; p++) Duel.update(1/60)`). La barra di cattura si muove
**con la stessa legge** della vera (`cursor += dir*dt*1.15`, rimbalzo a 0 e a 1),
quindi il cursore che si vede e quello che l'altro telefono ricostruisce sono lo
stesso. `posaBanda` è **pura** (`:23651-23654`: due `clamp` su `aud`), quindi la
banda si può mostrare per davvero senza consumare niente.

### 2.5 Il fiato trattenuto: il cancello sul duello

Con `rAF` vivo, `Duel.update` fa due cose che in una sfida fra due persone non
deve fare: **la CPU tira da sé** (`if(!s.shooterHuman) ... s.pickZone((dado()*3)|0)`,
`:23877-23886`) e **la CPU si tuffa da sé** (`:23890-23892`). In una partita del
dischetto `startMatch(1,...)` mette `G.cpu = [false, true]`, quindi metà dei
rigori avrebbe una CPU che decide al posto dell'altra persona — e consumerebbe
`dado()`, cioè il PRNG **di gioco**.

**Il cancello**: finché il dischetto è vivo e non si è dentro `risolviDuello`,
`Duel.update` avanza **soltanto i suoi orologi di presentazione** (`vt`, `poseT`,
e la barra di cattura) e **torna**. Nessuna CPU, nessuna fase che avanza, nessun
`dado()`. È la forma esatta che §6 del progetto d'onda chiede: *«il congelamento
deve sembrare un fiato trattenuto, non un blocco»*.

E i due ruoli si dicono la verità: `shooterHuman` / `keeperHuman` si impongono
dal **ruolo del dischetto**, non da `G.cpu`. Per chi gioca dal lato `b`,
`mioTeam` è 1 e `G.cpu[1]` è vero: senza questa riga il gioco gli scriverebbe
«TIRA LA CPU» mentre tira lui.

**MOTORE_V non si muove**, e la ragione è strutturale prima che misurata: ogni
riga di questo paragrafo è dentro un `if` che è falso quando `Dischetto.s` è
`null`, cioè in tutte le partite che esistevano ieri. Si misura comunque nei due
versi (§5).

## 3. IL RESPIRO (b)

### 3.1 Che cos'è, con le parole del progetto

Progetto onda E §6: *«quando dai un comando, il giocatore comandato non parte di
scatto — **prende fiato**. Una piccolissima anticipazione che dura **esattamente
D tick** e **finisce sul tick in cui il comando esegue**. Il ritardo non si sente
come lag: si sente come **peso**.»*

Il pezzo che dà D esiste dal #141: `Ritardo` (`:46856-46920`) accoda i comandi di
`K` tick e li sgancia in `Ritardo.passo()`, che gira all'inizio di ogni
`Reg.passo()`, cioè di ogni `step()`. Quindi il respiro non ha bisogno di
inventare un orologio: **ha bisogno di leggere quello**.

### 3.2 La forma: l'anello che respira

Il giocatore comandato è già segnalato da **anello e freccia** — lo dice la
schermata di aiuto del gioco (`:3918`). Il respiro **modula quell'anello**, e
nient'altro: quando un comando entra in coda, l'anello comincia a caricarsi e
arriva al colmo **sul tick in cui il comando esegue**. A `K = 0` — cioè in tutto
il gioco di oggi, offline — il respiro **non esiste**: non c'è coda, non c'è
anticipazione, non c'è un pixel diverso.

Un solo numero, `Respiro.carica` in 0..1, con `fine` = il tick di scadenza del
comando più vecchio in coda. Tre proprietà, e **si verificano, non si assumono**:

1. **È sola presentazione.** La carica si legge nel disegno e **da nessun'altra
   parte**. Misura: impronta della partita, punteggio e conteggio dei sorteggi
   **identici** con e senza respiro, su nastri fissi (§5).
2. **È già pagata.** Il tremolio del respiro esce da `dadoDeco()` (`:9106`), il
   PRNG dedicato della cosmetica (cura #129), riseminato a costante fissa
   all'ingresso come fanno `paintField` e `rebuildCrowd`. **Non legge né scrive
   `SEME` né `Math.random`.** Misura: il contatore dei sorteggi di gioco non si
   muove di uno (§5). Il #132 ha trovato che l'audio mangiava sorteggi: non si
   ripete quell'errore, si misura.
3. **Degrada bene.** Quando la simulazione si ferma ad aspettare l'altro, la
   carica **tiene**: non si azzera, non lampeggia, non compare una rotella.
   Misura: fermando l'orologio per N tick, la carica a N tick è la stessa che a
   0 tick, e **non è zero**.

### 3.3 L'indicatore di connessione è lo stesso oggetto

Progetto §6: *«L'indicatore di connessione non è un numero di millisecondi. È lo
stesso oggetto del respiro: quando la rete è brutta, il fiato è più lungo. Un
oggetto, due significati, zero interfaccia nuova.»*

Quindi nella fascia del dischetto non c'è un numero di ms: c'è **la stessa
carica**, e quando la cassetta tarda il fiato resta trattenuto — che è
letteralmente l'informazione «l'altro non ha ancora parlato», detta senza una
parola e senza una cifra.

## 4. LA CURA DEL BUCO DI VERIFICA DIFFERITA (c)

### 4.1 Il buco, con le parole di chi l'ha lasciato

> «**`vagliaNastro` non pretende le righe di tipo 14.** La verifica dell'impegno
> vive in diretta; in differita, un nastro a cui le 14 fossero *tolte* passerebbe
> come partita normale. Il punteggio rigiocherebbe giusto — nessun innocente
> accusato — ma **la prova di lealtà non verrebbe rifatta**.»

### 4.2 Perché non si cura guardando le 14

La tentazione è: «se ci sono righe di tipo 14, controllale». È **circolare**: chi
le toglie tutte non ha più niente da controllare. Serve un segno che dica **«qui
si è giocato dal dischetto»** e che non sia una 14.

### 4.3 La cura: la riga di tipo 15, e il giudice che si astiene

`Dischetto.avvia()` scrive **una** riga di tipo 15, `[DISCHETTO_V]`, prima del
primo tiro. Non è un comando — i comandi sono le 6 — ed è la carta d'identità
della partita.

`vagliaNastro` guadagna un controllo, **in coda a tutti gli altri** (lo stesso
posto e la stessa dottrina del #142 per l'impronta: si sta dopo lo schermo,
perché le astensioni che dicono cose diverse vengono prima di quelle binarie):

```
un nastro e' del dischetto  <=>  ha una riga 15, OPPURE ha almeno una riga 14
se e' del dischetto, le sue testimonianze devono essere COMPLETE:
  · almeno una coppia;
  · per ogni tiro t che compare, tutte e due le testimonianze (lato 0 e lato 1);
  · i tiri numerati 0..N-1 senza buchi.
altrimenti  ->  INCOMPLETO / testimonianze-assenti
```

**Si astiene, non accusa.** È il principio di tutta l'onda D (`nessun-innocente`,
#134): un nastro a cui manca la prova non è un nastro di un baro, è un nastro che
non si sa giudicare. `INCOMPLETO` non muove punti, la riga resta a
`verificata = 0` e torna giudicabile il giorno in cui arriva completa.

E il doppio verso del riconoscimento chiude **anche** l'attacco più fine — togliere
*alcune* 14 e lasciarne una — che la sola riga 15 non chiuderebbe da sola se un
domani qualcuno costruisse un nastro senza 15.

### 4.4 IL RESIDUO, DICHIARATO QUI E NON IN FONDO

Chi toglie **tutte** le 14 **e** la 15 ottiene un nastro indistinguibile da una
partita normale: il punteggio rigioca giusto, nessun innocente viene accusato, e
**la prova di lealtà non viene rifatta**. Questo cantiere **restringe** il buco,
non lo chiude, e la ragione per cui non lo chiude è strutturale: chiuderlo
vorrebbe dire **firmare** la riga 15, e una firma vuole una chiave, e in questo
gioco non c'è nessuna chiave — per statuto (`rete/LEGGIMI.md:181-183`), non per
dimenticanza.

Che cosa resta vero dopo la cura, e va scritto così e non meglio:

- chi bara **in diretta** viene smascherato dall'impegno che non ricompone, ed è
  il #146 a farlo, non questo cantiere;
- chi **spoglia il nastro** dopo, per far passare la sua serie come una partita
  qualunque, **non guadagna niente**: quella partita non porta punti di sfida,
  perché una sfida dal dischetto non è una sfida di rete;
- chi spoglia il nastro per far passare una serie **come verificata** ora si
  ferma su `INCOMPLETO`, che è quanto si può ottenere senza una chiave.

## 5. LE MISURE, DICHIARATE PRIMA

| # | che cosa | soglia dichiarata prima |
|---|---|---|
| **M1** | la piega ai due formati, prima e dopo | CERCA, prima riga, primo GUARDA: **scarto 0 px** |
| **M2** | `SFIDA DI CARTA` a lista vuota, prima e dopo | **scarto 0 px** |
| **M3** | la voce nuova a lista vuota | raggiungibile (dentro l'altezza scorribile), numero dichiarato |
| **M4** | zero rete all'avvio | delta richieste dopo l'apertura di SFIDA = **0** finché un dito non preme |
| **M5** | il respiro non muove la partita | impronta + punteggio identici, **N ≥ 3 semi** |
| **M6** | il respiro non consuma sorteggi di gioco | delta del contatore dei sorteggi = **0** |
| **M7** | il respiro dura esattamente K e tiene | colmo al tick K; a orologio fermo, carica invariata e **> 0** |
| **M8** | `MOTORE_V` nei due versi, come il #144 | nastri prima→dopo e dopo→prima **identici**, o `MOTORE_V` sale a 5 |
| **M9** | la cura (c) | un nastro del dischetto **senza** le 14 → `INCOMPLETO/testimonianze-assenti`; **con** le 14 → il verdetto di prima |

## 6. IL BANCO E I FALSI

`_q-volto.js`, sette gruppi (A…G), sull'impianto `_dischetto-due-telefoni.js` che
esiste già. **Nasce rosso** e la causa è dichiarata: sul gioco del merge-base non
esistono `#sfidaDischetto`, `__test.respiro` né la riga 15.

### 6.1 I falsi, nel caso peggiore

| falso | che cosa fa | deve essere |
|---|---|---|
| `_crit-volto-sopra` | mette la voce nuova **sopra la lista**, dove il #135 aveva già misurato il danno | **MORSO** dalla piega |
| `_crit-volto-muto` | il pannello c'è, è bello, e i bottoni **non fanno niente** | **MORSO** |
| `_crit-volto-spione` | il tabellone mostra la mossa dell'altro **prima** della rivelazione | **MORSO** |
| `_crit-volto-rete` | il pannello chiede alla rete **all'apertura della schermata** | **MORSO** da `senza-rete`/M4 |
| `_crit-respiro-dado` | il respiro tira `dado()` invece di `dadoDeco()` | **MORSO** dal contatore dei sorteggi |
| `_crit-respiro-motore` | il respiro **sposta** il giocatore invece di disegnarlo | **MORSO** dall'impronta |
| `_crit-respiro-piatto` | la carica non si muove mai: attesta invece di respirare | **MORSO** |
| `_crit-respiro-rotella` | a orologio fermo la carica si azzera (il blocco si vede) | **MORSO** |
| `_crit-giudice-senza-14` | un nastro **vero** del dischetto con le 14 **tolte** | **MORSO**: `INCOMPLETO`, mai `TORNA` |

**E il controllo del banco** (lezione del #145, ripetuta dal #146): almeno un
falso che il banco **non** morde va cercato e **dichiarato**. Un banco che morde
nove su nove senza aver cercato il decimo sta attestando.

Il decimo, dichiarato in anticipo: `_crit-volto-brutto` — il pannello funziona,
ma con le parole sbagliate (accusa chi sparisce invece di annullare). **Il banco
non lo morde**, e non deve: misurare la qualità di una frase con un cancello
sarebbe attestare. Quella riga la guarda una persona.

## 7. LE RETI DI SICUREZZA — verdi a ogni compito

`_q-dischetto` (29/29), `_q-dischetto-falsi`, `_q-motori`, `_q-casa`,
`_q-schermi`, `_q-duello-impronta` (44/44), `_q-giudice`, `_q-sigillo`,
`_q-carta`, `_q-amici`, `_q-sospetto`, `_q-staffetta`, `_q-finestra`,
`_q-glicko`, `_q-motore-nastro`, `_q-determinismo`, `_q-rete-latenza`, i quattro
del #132, `_q-rete`, `_q-sfida`, `senza-rete`, `salvataggio`,
`rete/prove/tutte.js` (62/62).

**E la batteria INTERA a ogni compito**, a gruppi, non i soli cancelli che il
piano nomina: il #146 ha pagato la lezione 22 due volte in un giorno, e uno dei
tre rossi è uscito **solo dai cancelli lenti**.

## 8. LE CINQUE COSE CHE QUESTO PROGETTO SI RIFIUTA DI SCRIVERE

1. **«Il pannello è bello.»** Un cancello misura pixel e comportamenti, non
   gusto. Di bello si scrive solo ciò che una misura sostiene.
2. **«Il respiro migliora la sensazione del ritardo.»** Sarebbe la prova C del
   #141 — un uomo in cieco — e questo cantiere non la rifà. Si dichiara che
   **esiste**, che **dura K**, che **non costa niente**: non che piace.
3. **«La cura (c) chiude il buco.»** Lo **restringe**: §4.4.
4. **«`MOTORE_V` resta 4»** prima di averlo misurato nei due versi.
5. **«La voce nuova sta sopra la piega su ogni telefono.»** A 800x360 con cinque
   righe di lista scende: si dichiara il numero e si dice che `.ov` scorre.

---

## 9. RETTIFICHE A EDIZIONI (24 settembre 2026, a cantiere chiuso)

Questo progetto è stato scritto **prima** di misurare. Quattro sue affermazioni
sono state superate dalle misure, e si correggono qui **senza cancellare il
testo di sopra**, che resta per far vedere che cosa ci si aspettava.

**(1) §1.1 — la piega: la predizione ha tenuto, ma per poco, e non per il
motivo scritto.** I tre bersagli non si sono mossi di un pixel (220 / 329 /
308) e `SFIDA DI CARTA` nemmeno (347). Ma la prima stesura metteva la voce e
basta, e la voce nuova finiva **sulla stessa riga della carta**, tutte e due a
301-347 (`strumenti/_diag-147-voce.js`): `.voce` non dichiara `display`, quindi
un `<button>` è `inline-block`, e `.box` è larga 640 a tutti i formati. Costava
**zero pixel di piega** ed è stata **rifiutata lo stesso**, perché una
disposizione che dipende dalla larghezza non si misura una volta sola.
`#btnSfidaDischetto{display:block}`, e i 56 px si pagano: TORNA AL MENU da 418
a 474, scorribile da 466 a 522. **Il ramo di riserva di §1.2 non è servito.**

**(2) §4 — il buco era più grande di come è scritto.** §4.1 riporta il #146
(«`vagliaNastro` non pretende le righe di tipo 14»). **Misurato**
(`strumenti/_sonda-147-quattordici.js`): quelle righe **non arrivavano nemmeno
nel nastro** — `Reg.serializza` non aveva un ramo per il tipo 14 e
`Reg.deserializza` neppure. La cura di §4.3 è quindi **doppia**, e la seconda
metà (far viaggiare le 14) non era prevista da questo documento.

**(3) §4.3 — il posto del controllo è cambiato per una misura.** Il progetto lo
metteva «in coda a tutti gli altri, lo stesso posto del #142». Sta invece
**prima di `rose-assenti`**, perché un nastro vero oggi è già
`INCOMPLETO/rose-assenti` e in coda il controllo non sarebbe mai stato
raggiunto su un nastro vero — sarebbe stato verificabile solo su un nastro
costruito dal banco, cioè **non verificato**.

**(4) §6.1 — il falso `_crit-volto-spione` non esiste, e la ragione è una
scoperta.** Non si può costruire a livello di pannello: la mossa dell'altro
**non arriva mai** sul telefono prima che io mi sia impegnato, perché `manda()`
spedisce la rivelazione solo se ha in casa l'impegno dell'altro. La proprietà è
del **protocollo** (#146, falso `gentile`), non del volto. Al suo posto c'è
`_crit-volto-ansioso`, che attacca l'istante che il pannello **può** rompere:
quando parte il mio impegno. E la prova C1 è stata riscritta di conseguenza —
la sua prima stesura sarebbe stata verde **sempre**, anche su un pannello
scritto male.

**(5) Una cosa che questo progetto non aveva previsto affatto**, trovata
leggendo il proprio codice e **misurata prima di curarla** (`_q-volto` B5):
CHIUDI spegneva il protocollo e **lasciava la partita in piedi**, e da lì la
CPU riprendeva a giocare al posto delle due persone.
