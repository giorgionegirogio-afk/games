# IL SEME A DUE MANI — progetto (voce #150)

**24 settembre 2026.** Merge-base `ffc4139` (`main`), ramo `voce-150-seme-a-due-mani`.
Cura **il difetto aperto più grave lasciato dall'ONDA E**, quello che il #149 ha
misurato, dichiarato e — con ragione — deciso di non curare allora.

---

## 0. IL DIFETTO, E PERCHÉ È IL PIÙ GRAVE RIMASTO

La sfida dal dischetto (#146) fa nascere il seme della serie **a due mani**: i
due telefoni si scambiano un nonce ciascuno e il seme è `dsMescola(na, nb)`,
così nessuno dei due lo sceglie. Lo stesso numero decide anche **chi tira per
primo** (`dsPrimoDalSeme`, #149).

Il saluto però manda il nonce **in chiaro e non impegnato**
(`CALCETTO-il-gioco.html`, `mioSaluto()` e `chiudiAppuntamento`). Il commento
accanto diceva:

> «SI CHIUDE QUANDO TUTTI E DUE HANNO PARLATO, e non prima: è questa riga a
> impedire che il secondo scelga il proprio nonce sapendo il primo.»

**La riga non lo impedisce.** Impedisce che il *gioco* chiuda prima, non che un
pari scritto a mano **ritardi** il proprio saluto: la cassetta è pubblica, chi
entra per secondo legge il nonce dell'altro, ne prova quattromila finché non
trova quello che dà il seme che vuole, e solo allora parla. Il gioco non ha modo
di sapere che ha aspettato.

**Misurato** (`_q-dischetto-seme`, in batteria a `conta:false` dal #149):

| braccio | misura #149 | rimisurato oggi (24 set, base `ffc4139`) |
|---|---|---|
| il pari che ritarda il saluto e si sceglie il nonce | vince il bit **10 su 10** | **40 su 40** |
| testimone, stessa macchina a bugia spenta | 5 su 10 | 21 su 40 |

E **non è solo il bit**: con il nonce dell'altro in mano si sceglie l'**intero
seme**, cioè `SEME`, cioè il dado di tutta la partita. Il gioco è un file solo:
chi vuole cercarsi la partita comoda può simularla.

---

## 1. LA CURA — lo schema in due tempi, applicato al saluto

**Non si inventa un secondo schema d'impegno.** Il #146 ne ha già uno, verificato
(`dsImpegno`, `dsSha256` confrontata con Node su 409 casi — cancello `sha256`), e
ha la regola d'oro che lo regge:

> `manda()` spedisce la rivelazione **solo se ha in casa l'impegno dell'altro**.

È quella riga a rendere il tabellone spione impossibile da costruire (#147). Due
schemi d'impegno diversi nello stesso protocollo sarebbero **due superfici da
sorvegliare** invece di una.

### 1.1 Il protocollo, fase per fase

`DISCHETTO_V` passa da **1** a **2**. Le buste diventano **cinque**: `S I R N F`.

| busta | quando | che cosa porta |
|---|---|---|
| `S` (saluto) | subito, da `crea()`/`entra()` | `{v, mv, imp, rosa, hn}` — **l'impegno del nonce**, non il nonce |
| `N` (nonce) | **solo** quando l'impegno dell'altro è in casa | `{n}` — la rivelazione |
| `I`, `R`, `F` | invariati (#146) | — |

L'impegno del saluto:

```
dsImpegnoSaluto(lato, nonce) = dsSha256('DS1|' + lato + '|' + nonce).slice(0,32)
```

Il **lato entra nella stringa**, e non è un vezzo. Senza, il baro copierebbe
l'`hn` dell'altro, aspetterebbe la sua `N` e rivelerebbe lo stesso nonce: il seme
diventerebbe `dsMescola(n, n)`, cioè un valore che l'onesto non ha scelto da solo.
Con il lato dentro, la copia **non ricompone** e cade su `saluto-non-torna`.

### 1.2 La macchina a stati, e la fase nuova

```
spento ──crea()/entra(): manda S ──▶ attesa-pari
attesa-pari ──leggi S dell'altro (v, mv verificati)──▶ attesa-nonce      « FASE NUOVA »
attesa-nonce ──manda(): ho il suo S, quindi mando N──▶ (resto in attesa-nonce)
attesa-nonce ──leggi N dell'altro + ho mandato la mia──▶ chiudiAppuntamento()
chiudiAppuntamento: l'impegno ricompone?  sì → pronto → avvia()
                                          no → fine, causa 'saluto-non-torna'
```

`trattiene()` deve includere `attesa-nonce`: durante l'attesa il duello **non
avanza**, come per `attesa-pari` (se avanzasse, `Duel.update` farebbe tirare la
CPU al posto dell'altra persona e consumerebbe il PRNG di gioco).

### 1.3 Perché chiude il buco

Chi entra per secondo vede l'`S` dell'altro **prima** di mandare la propria: ma
quell'`S` porta solo `hn`, cioè 128 bit di SHA-256 troncata, e da lì non si
ricava il nonce. Per vedere il nonce dell'altro deve aspettare la sua `N` — e la
`N` dell'onesto **non parte** finché l'onesto non ha in casa l'`S` del baro.
Quindi:

- o il baro si impegna **al buio** (e allora sceglie a caso: il seme torna a due mani);
- o il baro non si impegna, e non riceve mai niente (**stallo**, poi `incompiuta`);
- o il baro si impegna e poi rivela **un altro** nonce, e viene **rifiutato**
  (`saluto-non-torna`) — e non può nemmeno reimbucare una `N` diversa, perché la
  chiave `(stanza, k, r, t)` della cassetta è unica: «il secondo imbuco diverso è
  un no» (`schema.sql`, cassetta, regola b).

### 1.4 Il residuo, dichiarato

**Il riavvio.** Chi vede il seme e non gli piace può chiudere l'appuntamento
prima del primo tiro e rifarne un altro. Non è curabile con un impegno: è la
stessa forma dell'ottavo falso del #146 — **si toglie l'incentivo invece di
sorvegliarlo**. Oggi l'abbandono non è una vittoria di nessuno (`incompiuta`,
`fine=null`, misurato da G4/G5), quindi il riavvio costa un appuntamento e non
frutta punti. Resta scritto qui perché chi legge domani non lo scambi per una
svista.

---

## 2. IL COSTO — un giro di rete in più

L'appuntamento passa da **un imbuco per lato** a **un imbuco + una rivelazione
per lato**, e chi aspetta fa **un ritiro in più** prima di chiudere.

| | v1 | v2 | delta |
|---|---|---|---|
| imbuchi per lato, nell'appuntamento | 1 (`S`) | 2 (`S`, `N`) | **+1** |
| ritiri per lato, prima di chiudere | 1 | 2 | **+1** |
| **richieste per lato, appuntamento** | **2** | **4** | **+2** |

Sul resto della serie non cambia niente: `I`/`R` restano due imbuchi per tiro, e
il ritmo lo decide `ritmo()` (900 ms, 2200 ms quando la rete è «lenta»), non il
protocollo.

**Il freno.** Il tetto è **60 richieste al minuto per identità** (`dis:<id>`,
`schema.sql:269`, stessi numeri nella cassetta finta). Il #149 ha misurato la
punta vera a **74-88/min**: il gioco **sfonda già** il tetto e degrada bene
(E1b pretende il rientro sotto il tetto dopo il primo 429; E1c che la serie
arrivi in fondo lo stesso). Le due richieste in più sono una **costante
sull'appuntamento**, non un termine che cresce coi tiri: la previsione è
**+2 sulla punta**, cioè 76-90.

**Requisito di questo cantiere:** la punta rimisurata non deve peggiorare **più
di quanto valga il giro in più**, e il numero si dichiara. Se peggiorasse di
più, vuol dire che la fase nuova ha introdotto un giro che si ripete, e il
cantiere si ferma.

---

## 3. LA VERSIONE, E I NASTRI VECCHI

`DISCHETTO_V` 1 → 2. È un **messaggio** che cambia, non una riga di nastro: ma
la riga 15 del nastro porta `DISCHETTO_V`, e il #149 ha appena messo in campo la
guardia che serve:

```
if(disco && disco.v !== DISCHETTO_V) return no('INCOMPLETO','dischetto-versione');
```

Quindi un nastro registrato col protocollo v1 prende **INCOMPLETO /
dischetto-versione**: si **astiene**, non accusa. INCOMPLETO non muove punti e la
riga torna giudicabile il giorno in cui arriva intera. Va **verificato che scatti
davvero** e che il verdetto non sia NON TORNA.

Dal vivo, `chiudiAppuntamento` già rifiuta chi dichiara un `v` diverso
(`versione-diversa`): un telefono v1 e uno v2 non si danno appuntamento, ed è
giusto — mezzo protocollo non si parla.

**`MOTORE_V` resta 6.** Il criterio allargato del #148 («se una cura cambia il
verdetto che un altro telefono darebbe sullo stesso nastro, il numero sale») è
già servito da `DISCHETTO_V`, che è **il numero dedicato a questa superficie**:
alzare anche `MOTORE_V` rifiuterebbe TUTTI i nastri, anche quelli che non hanno
mai visto un dischetto, cioè pagherebbe il prezzo senza comprare niente. La
simulazione non è toccata, e va **misurato** che non lo sia (`determinismo`,
`motore-nastro`, `motori`).

---

## 4. I FALSI PREVISTI

`PariFinto` va riscritto sul protocollo nuovo (`saluta()` manda l'impegno,
`rivelaNonce()` la rivelazione), e con lui i **sette falsi** del dischetto, che
gli passano tutti davanti. In più, **tre bugie nuove del pari** — e ognuna deve
essere **bocciata**, nel caso peggiore:

| bugia del pari | che cosa fa | deve finire |
|---|---|---|
| `semesuo` (riscritta) | aspetta l'`S` dell'altro, poi macina 4096 nonce per il bit che vuole, **e si impegna su quello** | vince il bit **come il caso**, perché dall'`hn` non si ricava niente |
| `semerivelato` **(nuova)** | si impegna su un nonce, aspetta la `N` dell'altro, poi **rivela un nonce diverso** scelto per il seme che vuole | **rifiutato**: `fine` / `saluto-non-torna` |
| `semepaziente` **(nuova)** | **non si impegna** finché non vede la `N` dell'altro | **stallo**: l'altro non rivela mai, nessun seme, `incompiuta` |

E **un falso del gioco**, la mezza cura, che è il più cattivo di tutti:

| falso del gioco | che cosa toglie | deve essere morso da |
|---|---|---|
| `_crit-dischetto-sbrigativo.js` | **impegna il nonce ma rivela lo stesso senza aspettare l'impegno dell'altro** (toglie `S.suoSaluto &&` dalla condizione di `manda`) | S1 — è esattamente la mezza cura che il #149 dichiara «peggio del buco» |
| `_crit-dischetto-credone.js` | accetta la rivelazione del nonce **senza verificare che ricomponga** l'impegno del saluto | S3 |
| `_crit-dischetto-vecchio.js` | accetta una serie di **versione vecchia** senza dirlo (toglie la guardia `dischetto-versione`) | S5 |

---

## 5. IL CANCELLO, E LA POTENZA DELLA MISURA

`_q-dischetto-seme` oggi **documenta** il difetto. Dopo la cura deve
**condannarlo**, e con abbastanza tiri: *dieci prove distinguono male 5/10 da
7/10* (lezione del #141: «il 95% non è decidibile con 6 tentativi»).

**n = 400 appuntamenti per braccio.** Un appuntamento costa ~0,04 s sul banco
(misurato: 80 appuntamenti in 5,4 s, avvio compreso), quindi il cancello resta
fra i `lento` e sotto il minuto.

**Soglia: rosso se il baro vince più di 224 su 400** (56%).

| | conto |
|---|---|
| falso rosso, sotto il caso puro (p = 0,50) | `P(X > 224)` = **0,7 %** |
| potenza contro un baro al 60 % | **94 %** |
| potenza contro un baro al 65 % | **99,98 %** |
| potenza contro il difetto di oggi (p = 1,00) | **> 99,99 %** (oggi è 400/400) |

Le prove del cancello nuovo:

| | che cosa pretende |
|---|---|
| **S1** | il pari che ritarda il saluto e si sceglie il nonce **non vince il bit più del caso** (≤ 224/400) |
| **S2** | TESTIMONE — lo stesso pari a bugia spenta sta anche lui sotto la soglia (se no il banco misura il proprio sorteggio) |
| **S3** | il pari che rivela **un nonce diverso** da quello impegnato è **rifiutato**, con causa `saluto-non-torna`, e mai con un seme in mano |
| **S4** | il pari che **aspetta la rivelazione dell'altro prima di impegnarsi** non ottiene **mai** un seme (stallo, non vittoria) |
| **S5** | un pari che dichiara `v: 1` non apre l'appuntamento: `versione-diversa`, e la serie di versione vecchia in differita prende **INCOMPLETO / dischetto-versione**, non NON TORNA |
| **S6** | TESTIMONE del banco — a bugie spente l'appuntamento **si chiude** e i due semi coincidono (senza, un banco rotto «condannerebbe» tutto senza discriminare niente) |

Quando tutte e sei sono verdi, `dischetto-seme` torna a **`conta:true`** in
`tutti.js`.

---

## 6. I COMPITI

| | che cosa |
|---|---|
| **C0** | questa spec e il piano |
| **C1** | il banco che condanna: `_q-dischetto-seme` riscritto (nasce ROSSO — oggi il baro vince 400/400) + i tre falsi del gioco |
| **C2** | l'impegno sul saluto nel gioco, la fase `attesa-nonce`, la busta `N` (gioco, cassetta finta, `rete/api/dischetto.js`, `rete/prove/tutte.js`) |
| **C3** | `DISCHETTO_V` 1 → 2, il rifiuto con causa vera delle serie vecchie, `PariFinto` e i sette falsi riscritti |

> **RETTIFICA A EDIZIONI (24 settembre 2026, a cantiere fatto).** `DISCHETTO_V`
> 1 → 2 **è entrato in C2 insieme al protocollo, non in C3**: separarli lascia
> per un commit un telefono nuovo e uno vecchio che si danno appuntamento
> credendo di parlarsi, e il nuovo accusa il vecchio di `saluto-non-torna`
> invece di dire «versione diversa». Con la versione si è mosso in C2 anche
> `_q-nastro-differito` B8, che scriveva nella riga 15 proprio la versione 2 e
> nello stesso istante ha smesso di misurare una versione ignota. C3 è rimasto
> la registrazione dei tre falsi nuovi nei due banchi dei falsi.
| **C4** | il ritmo rimisurato, la batteria intera, `dischetto-seme` a `conta:true`, verbale e rettifiche a edizioni |

---

## 7. IL BANCO È FINTO, E SI DICHIARA

Tutte le misure di questo cantiere girano contro la **cassetta finta in
memoria** (`_dischetto-due-telefoni.js`), come `_q-sfida`, `_q-dischetto` e
`rete/prove` da mesi. Il server Vercel è stato riattivato e risponde, ma **non ha
un database**: senza `SUPABASE_URL` e `SUPABASE_SERVICE_KEY` gli endpoint
dicono `{"ok":false,"errore":"spento"}`. Puntare i banchi là non misurerebbe il
protocollo, misurerebbe un 503.
