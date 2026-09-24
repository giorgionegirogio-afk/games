# IL NASTRO DEL DISCHETTO SI PUÒ CONFERMARE — progetto (voce #148)

**Merge-base dichiarato: `01265bc`.** `MOTORE_V = 4`, `DISCHETTO_V = 1`.
Ultimo tassello dell'**onda E**: piccolo di codice, grosso di conseguenza.

## 0. IL BUCO, DETTO DA CHI L'HA LASCIATO

Il #147 chiude il suo verbale con il residuo (1), che è il mandato di questo
cantiere:

> «**Un nastro del dischetto non è ancora giudicabile in differita**, e non per
> le testimonianze: gli mancano la riga delle **rose** (7), dello **schermo**
> (10) e dell'**impronta** (11) — `Reg.scrivi(7, …)` vive dentro `Sfida.gioca` e
> `Dischetto.avvia` non ci passa. Il verdetto su un nastro vero è
> `INCOMPLETO/rose-assenti` sia prima sia dopo. Non accusa nessuno, ma **una
> serie onesta non si può confermare**. Seguito piccolo: tre righe in `avvia`.»

Perché conta: l'**onda D** (#133 giudice, #134 sigillo, #137 sospetto, #138
staffetta) ha costruito un verificatore differito perché «la classifica si
ripulisce da sola» fosse un fatto misurato. L'**onda E** (#146/#147) ha
costruito la sfida dal dischetto. **Ma i nastri della seconda non sono
confermabili dal primo.** Questo cantiere cuce le due onde.

## 1. LA MISURA DI PARTENZA, E LA DIAGNOSI CHE CORREGGE

`strumenti/_sonda-148-differita.js`, 24 settembre 2026, merge-base `01265bc`,
serie **vera, onesta e giocata fino in fondo** fra due telefoni (12 giri di
rete, serie 2-1, nastro 893 caratteri su tutti e due i capi):

```
per tipo nel testo: {3:2, 6:12, 14:6, 15:1}     <- niente 7, niente 10, niente 11
verdetto su A     : INCOMPLETO / rose-assenti · atteso [2,1] · rigiocato null
verdetto su B     : INCOMPLETO / rose-assenti · atteso [2,1] · rigiocato null
```

**La prima metà della diagnosi del #147 è confermata parola per parola.**

### 1.1 E LA SECONDA METÀ NON REGGE: «tre righe» non è la cura, è il danno

La stessa sonda, sopra una copia del gioco a cui sono state messe **solo** le
tre righe (`fuori/148-diagnosi.html`: `Reg.scrivi(7,…)`, `Reg.schermo(…)`,
`Reg.motore()` dentro `Dischetto.avvia`), serie vera di cinque tiri per parte:

```
per tipo nel testo: {3:2, 6:30, 7:1, 10:1, 11:1, 14:18, 15:1}
riga 7 di A       : 0,7,1,1,1,5,68,50,62,…,-1
riga 7 di B       : 0,7,1,1,1,5,68,50,62,…,-1      <- IDENTICHE, carattere per carattere
verdetto su A     : NON TORNA · atteso [4,3] · rigiocato [3,2] · passi 8462
verdetto su B     : NON TORNA · atteso [4,3] · rigiocato [3,2] · passi 8462
```

**Con le tre righe e basta, il giudice dice NON TORNA a due persone oneste.**
NON TORNA è l'unico dei cinque verdetti che muove punti: li toglie a **due**
persone, alza un sospetto che non decade mai e chiude la riga per sempre. È
esattamente il difetto che il #133 e il #139 sono costati, ed è peggio
dell'astensione di oggi.

**La causa è strutturale e si legge nei passi: 8462.** Una serie di rigori dura
qualche decina di passi; 8462 sono i novanta secondi di una partita intera.
`giudica` rigioca il nastro come una **partita qualunque**: chiama `startMatch`
e cicla, e **non apre la serie di rigori**. Il nastro del dischetto non contiene
nessun atto di gioco aperto (tipi 12/13: zero) — contiene solo i **comandi del
duello** (tipo 6), che senza `avviaRigori()` non hanno un duello in cui cadere.
Il punteggio dichiarato, poi, è quello della **serie** (i rigori segnati), mentre
`giudica` confronta `G.score`, che dopo una serie vale 1-0 o 0-1 (la rete che
decide, `programmaRigore`).

**Quindi la cura non è «tre righe in `avvia`»: sono tre righe in `avvia` PIÙ un
ramo del giudice.** Questo progetto dichiara l'allargamento invece di
nasconderlo, e la misura sopra è la ragione per cui si paga.

## 2. LE ROSE SONO QUELLE VERE, E SI VEDE

La misura di §1.1 porta anche la risposta alla domanda che il mandato chiama «il
difetto peggiore di tutta l'onda D»: la riga di tipo 7 scritta dai **due**
telefoni è **identica carattere per carattere**. È la conseguenza del commento
che sta già sopra `Dischetto.avvia`:

> «LE DUE ROSE STANNO NEGLI STESSI POSTI SUI DUE TELEFONI […] il lato 'a' è la
> squadra 0 anche sul telefono di 'b'.»

`rA`/`rB` sono le due rose **impacchettate** (`impaccaRosa`), assegnate per LATO
e non per possesso: `rA = (lato==='a') ? mia : suoSaluto.rosa`. Le si scrive
nell'ordine `[mentA, mentD, …rA…, …rB…, iCar]`, che è **lo stesso ordine** di
`Sfida.gioca`. Il cancello del compito 1 lo verifica su ogni serie, e il falso
`_crit-nastro-rose-scambiate` lo prova al contrario.

## 3. LA CURA

### 3.1 Una porta sola, come il #134 con `vagliaNastro`

Le tre righe non si copiano da `Sfida.gioca` a `Dischetto.avvia`: **due copie
divergono**, ed è la lezione che il #134 ha già pagato costruendo `vagliaNastro`
come porta unica fra `Sfida.guarda` e `giudica`. Si estrae

```
Reg.carta(mentA, mentD, pacA, pacD, iCar)   // scrive 7, poi 10, poi 11
```

e la chiamano **tutti e due**. L'ordine è quello di oggi — rose, schermo,
impronta — e non è un gusto: è la posizione su cui poggiano i nastri già
scritti, e spostarla li renderebbe illeggibili.

`Dischetto.avvia` la chiama con `[1, 1]` (le due posture che passa a
`startMatch`), le due rose impacchettate e `indiceCarattere('FUORI')`, che vale
`-1`: `carPerIndice(-1)` e `caratterePer('FUORI')` danno tutti e due
`CAR_NEUTRO`, quindi il giudice scende in campo con **la stessa CPU** che c'era.

### 3.2 La riga 15 dice anche CHI TIRA PER PRIMO

Il giudice deve aprire la serie con lo stesso primo tiratore, se no la serie è
un'altra. Il dato esiste: `S.primo = (S.seme & 1) ? 'b' : 'a'`.

**Non lo si ri-deduce dentro `giudica`**, e la ragione è la stessa della porta
unica: sarebbe una seconda copia della regola del protocollo, e il giorno in cui
il dischetto cambiasse il sorteggio i nastri vecchi verrebbero rigiocati storti
**in silenzio**. Si scrive nel nastro, accanto alla versione del protocollo:

```
Reg.scrivi(15, [DISCHETTO_V, primoTeam])     // 0 = casa, 1 = fuori
```

È la stessa scelta del #133 (lo schermo) e del #142 (l'impronta): **il fatto sta
nel nastro**, e chi rilegge lo legge invece di indovinarlo.

### 3.3 Il giudice apre la serie e conta i rigori

`vagliaNastro` sa già riconoscere un nastro del dischetto (la riga 15, voce
#147): oggi la usa per pretendere le testimonianze, e basta tirare fuori quel
fatto nel referto (`out.disco = {v, primo}`). Poi, dentro `giudica`:

* subito **dopo** `startMatch` e **prima** del ciclo, se il nastro è del
  dischetto: `G.kickTeam = disco.primo; avviaRigori();` — le stesse due righe,
  nello stesso ordine, di `Dischetto.avvia`;
* alla fine, il punteggio da confrontare è quello della **serie**
  (`G.rigori.seg`) e non `G.score`: è il numero che le due persone hanno visto
  sul tabellone, ed è quello che il pannello del #147 mostra.

Tutto il resto della rigiocata resta **identico**, comprese le tre astensioni
dello schermo (che su un nastro senza pixel non si applicano già oggi, voce
#144) e quella del motore.

### 3.4 Quel che NON cambia

* i nastri della **sfida asincrona**: la porta unica scrive gli stessi byte
  nello stesso ordine, e il ramo del dischetto si accende solo sulla riga 15.
  **Da misurare**, non da dichiarare (`_t-148-motorev.js`);
* il **protocollo** del dischetto: nessun messaggio cambia, quindi
  `DISCHETTO_V` resta **1**. Un secondo numero nella riga 15 non è un messaggio:
  è una riga di nastro.

## 4. `MOTORE_V`: perché sale a 5

Un telefono rimasto indietro (e **il service worker ignora la query string**,
quindi restare indietro è facile) legge un nastro del dischetto nuovo così: le
righe 7/10/11 ci sono, le testimonianze ci sono, l'impronta torna — **e poi lo
rigioca come una partita qualunque**, cioè esattamente la misura di §1.1:
**NON TORNA a un onesto**. È parola per parola il caso del #144, e ha la stessa
cura: il numero sale, il nastro nuovo si riconosce da sé, e chi è indietro dice
**ALTRO MOTORE** — che è un «non lo so» e non muove un punto.

Si misura **nei due versi**, come #144, #146 e #147, e con il criterio già
rettificato dal #147: **lo scarto di righe dev'essere esattamente il numero di
righe dei tipi nuovi** (qui 3: una 7, una 10, una 11).

## 5. I CANCELLI

`strumenti/_q-nastro-differito.js`, e **nasce ROSSO** (oggi `rose-assenti`):

| | che cosa prova | oggi |
|---|---|---|
| A | una serie **vera e onesta** fino in fondo → `TORNA`, dai **due** telefoni | ROSSO (`rose-assenti`) |
| B | le due righe di tipo 7 dei due telefoni sono **identiche** | verde a vuoto (assenti) |
| C | tolte le testimonianze → `INCOMPLETO/testimonianze-assenti` (la cura del #147) | verde |
| D | impronta del motore cambiata → `INCOMPLETO/motore-js-diverso` | verde |
| E | `MOTORE_V` del nastro diverso → `ALTRO MOTORE` | verde |
| F | il nastro si raggruppa e si giudica come gli altri (staffetta) | ROSSO |

E i falsi, nel **caso peggiore**, che un cancello onesto deve mordere:

| falso | che cosa fa | perché deve essere bocciato |
|---|---|---|
| `_crit-nastro-muto` | non scrive niente (è oggi) | A deve restare rosso |
| `_crit-nastro-rose-scambiate` | scrive le rose per **possesso** invece che per lato | il giudice direbbe NON TORNA a un onesto |
| `_crit-nastro-rose-mie` | scrive **due volte la propria** rosa | idem, e su UN capo solo |
| `_crit-nastro-un-telefono` | scrive le righe solo sul lato 'a' | il cancello deve giudicare TUTTI E DUE i capi |
| `_crit-nastro-tardi` | scrive le righe **dopo il primo tiro** | l'ordine del nastro è un formato |
| `_crit-nastro-primo-fisso` | scrive sempre `primo = 0` nella riga 15 | metà delle serie si aprirebbero col tiratore sbagliato |

## 6. QUEL CHE RESTA FUORI, DICHIARATO

* **Nessuno pubblica ancora un nastro del dischetto su un server.** La serie è
  fra due telefoni e resta lì: questo cantiere rende il nastro **giudicabile**,
  non lo spedisce. La staffetta lo sa lavorare (compito 2, misurato); che ci
  arrivi è un altro cantiere.
* Il residuo (2) del #147 — chi toglie **tutte** le 14 **e** la 15 — resta
  aperto e resta per statuto: chiuderlo vuol dire firmare, e firmare vuole una
  chiave.
