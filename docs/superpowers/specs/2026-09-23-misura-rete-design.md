# LA MISURA DELLA RETE E DEL TRASPORTO — progetto (voce #145, onda E)

**Data**: 23 settembre 2026 · **Merge-base**: `55267d0` (main) · **Ramo**: `voce-145-misura-rete`

**E' IL SECONDO BIVIO DELL'ONDA E.** Il primo (#141) ha misurato il gioco e ha
detto NO per un motivo che nessuno si aspettava — il motore JavaScript — e il
#143 quel NO l'ha tolto. Questo cantiere misura **la rete e il trasporto**, ed
e' l'ultimo prerequisito non pagato del lockstep. Come il #141, **non
costruisce niente**: produce un numero e un verdetto, e il verdetto puo'
essere NO.

Progetto d'onda: `docs/superpowers/specs/2026-09-23-onda-e-architettura.md`,
§1 (la misura che decide) e §2.8 (il punto duro: su che cosa viaggiano i
comandi).

---

## 1. DOVE SIAMO — i tre pezzi gia' posati, e il solo che manca

| voce | che cosa ha pagato | stato |
|---|---|---|
| **#141** | **D_gioco**: la curva del danno e' un **GRADINO**, non una rampa | chiuso, `MANUALE.md` §A |
| **#143** | la matematica in casa: **tre motori JS vedono la stessa partita** (`_q-motori` 21/21) | chiuso |
| **#144** | viaggia **l'atto risolto**, non il pixel: due telefoni diversi giocano la stessa partita. `MOTORE_V` = 4 | chiuso |
| **#145** | **la rete** | questo |

**I numeri del #141 che comandano questo cantiere** (`MANUALE.md` §A, voce
#141, gamba A, 120 nastri a taglia 5, partite intere):

| K | ms | gol comandato | danno sui gol |
|---|---|---|---|
| 0 | 0 | 1,01 ± 0,07 | — |
| 3 | 50 | 0,71 ± 0,07 | **29,8%** |
| 12 | 200 | 0,78 ± 0,08 | 23,1% |
| 18 | 300 | 0,72 ± 0,09 | **28,9%** |

**Scarto fra il danno a 50 ms e quello a 300 ms: 0,01 ± 0,22 — NON
DISTINGUIBILI.** E' il fatto piu' importante che questo cantiere eredita, e
ha due facce:

- **La faccia buona.** Fra 50 e 300 ms il costo in gioco e' lo stesso. Quindi
  **il margine contro il jitter si compra senza pagarlo**: scegliere D = 18
  tick invece di D = 3 non toglie un gol misurabile, e regala 250 ms di
  tolleranza alla rete. Un lockstep vive o muore su quel margine.
- **La faccia cattiva.** **Non esiste un D piccolo che eviti il danno.** Il
  prezzo si paga tutto nei primi 50 ms. Il #141, applicando la regola di casa
  «si confronta con la soglia l'ESTREMO ALTO dell'intervallo», ha scritto
  **D_gioco = 0 tick**.

**E QUI STA LA TRAPPOLA CHE QUESTO CANTIERE DEVE DICHIARARE PRIMA DI
MISURARE.** Se si prende `D_gioco = 0` alla lettera, la disuguaglianza
`D_rete(p95) <= D_gioco` e' **gia' falsa senza misurare niente**: nessuna
rete del mondo consegna in zero millisecondi. Sarebbe un NO comprato a
credito, non misurato — e il committente ha chiesto una misura che possa dire
no, non una che dica no per costruzione.

La lettura onesta del gradino e' un'altra, e va scritta adesso:

> **D_gioco non e' un punto, e' un intervallo.** Sotto il gradino (K=0) il
> gioco e' intatto; sopra il gradino, **da 50 a 300 ms il gioco costa lo
> stesso**. La decisione del lockstep non e' «quale D evita il danno» — non
> ce n'e' nessuno — ma **«il trasporto sta dentro l'intervallo misurato dal
> #141, cioe' D <= 18 tick (300 ms)?»**. Oltre 300 ms non c'e' misura: il
> #141 non ha guardato li', e un banco che estrapola attesta.

Quindi la soglia che decide non e' `D_rete <= 0`. E' **`D_rete <= 18 tick`**,
ed e' severa lo stesso, perche' D_rete non e' l'RTT: e' andata singola al p95
**piu'** il buffer di dejitter **piu'** un tick di quantizzazione.

---

## 2. CHE COSA SI MISURA, ESATTAMENTE

### 2.1 D_rete, scomposta

```
D_rete = andata_p95  +  buffer_dejitter  +  1 tick
```

- **andata_p95** — la latenza di **sola andata** dal telefono che preme al
  telefono che riceve, al 95esimo percentile. Non l'RTT. Non la media.
- **buffer_dejitter** — quanto bisogna accodare perche' un pacchetto in
  ritardo non fermi la simulazione. Si ricava dalla coda della distribuzione,
  non si sceglie a gusto: vedi §2.3.
- **1 tick** (16,67 ms) — la quantizzazione: un comando che arriva a meta'
  tick esegue al tick dopo.

### 2.2 Il trasporto, e le sue due forme

Il lockstep ha due topologie possibili, e **hanno un numero di gambe
diverso**. Confonderle e' il primo modo di mentire su questo numero:

| forma | percorso di un comando | gambe |
|---|---|---|
| **relay** (WebSocket, Supabase Realtime) | A -> server -> B | **2** |
| **P2P** (WebRTC DataChannel) | A -> B | **1** |

Da qui **la regola numero uno del banco**: quando si misura un relay con un
servizio a **eco** (A -> server -> A), quel numero **E' GIA'** la sola andata
a due gambe A -> server -> B, a patto che A e B siano equidistanti dal
server. **NON si divide per due.** Dividere per due e' l'errore piu' facile e
piu' grave di tutto il cantiere, e uno dei falsi esiste apposta per
condannarlo.

Quando invece si misura un **P2P con un'eco** (A -> B -> A, il peer rimanda
il pacchetto), quel numero e' un RTT vero a due gambe **su un percorso a una
gamba**, e **li' si divide per due**. Due situazioni che si somigliano e
chiedono il contrario: il banco deve tenere il tipo di percorso in un campo,
non nella testa di chi legge.

### 2.3 S, lo stallo — e la sua derivazione, non la sua opinione

In lockstep la simulazione si ferma quando al tick T+D mancano i comandi del
peer per il tick T. Cioe': **si stalla ogni volta che la sola andata supera
D.** Non e' una definizione di comodo, e' la meccanica.

Con un invio ogni 100 ms (10 al secondo, 600 al minuto) e **senza
ridondanza**, il tasso di stallo e':

```
stalli_al_minuto = 600 * P(andata > D)
```

Per stare sotto **uno stallo al minuto** serve `P(andata > D) < 1/600 =
0,167%`, cioe' **D deve coprire il p99,83 della sola andata**. Non il p95.

**Questo e' il vero motivo per cui la coda della distribuzione conta piu'
della mediana**, ed e' il numero che nessun documento di casa aveva mai
scritto. Il banco misura quindi **p50, p95, p99 e il massimo**, e riporta
tutti e tre i conti:

1. `D_rete(p95)` — il numero del progetto d'onda, per la soglia principale.
2. `D_stallo` — il D che tiene meno di uno stallo al minuto **senza
   ridondanza** (caso peggiore dichiarato).
3. `D_stallo_R` — lo stesso **con** la ridondanza di §2.4 del progetto
   d'onda (ogni pacchetto porta gli ultimi K comandi): li' uno stallo chiede
   che **R pacchetti consecutivi** siano in ritardo, e con perdite
   indipendenti il conto diventa `600 * P(andata > D)^R`. Si riporta come
   **stima**, marcata tale, perche' le perdite di rete **non sono
   indipendenti** (arrivano a raffica) e il banco non puo' misurarlo da qui.

### 2.4 La perdita

Perdita applicativa = pacchetti spediti che non tornano entro il tetto. Il
tetto si dichiara: **1.000 ms**. Oltre, il pacchetto e' perso, e **il
campione perso NON esce dal conto dei percentili**: entra come censura a
destra. Un banco che butta i campioni che non sono tornati misura solo i
pacchetti fortunati — e' il falso `_crit-rete-potatore`.

---

## 3. LE SOGLIE, DICHIARATE PRIMA — 23 settembre 2026, prima che un banco giri

**Scritte e committate al compito 0.** Una soglia decisa dopo e' un'opinione.

| # | soglia | valore | conseguenza se non tiene |
|---|---|---|---|
| **S1 — SOGLIA-RETE** | `D_rete(p95) <= 18 tick (300 ms)` | il tetto e' l'estremo dell'intervallo misurato dal #141: oltre, **non c'e' misura del gioco** | **NO al lockstep** |
| **S2 — SOGLIA-MARGINE** | `D_rete(p95) <= 12 tick (200 ms)` | a 200 ms il #141 ha misurato tutti e cinque i verbi vivi e la carica 6/6 dentro la finestra dolce | non e' un NO: e' **SI SENZA MARGINE**, e il #146 (il guasto) diventa obbligatorio prima di spedire |
| **S3 — SOGLIA-STALLO** | `< 1 stallo/minuto` e mai piu' lungo di **250 ms**, cioe' `D >= p99,83 della sola andata` | progetto d'onda §1.3 punto 6, qui derivata invece che asserita | **NO** |
| **S4 — SOGLIA-TRASPORTO** | esiste **almeno un** trasporto che: (a) non chiede un servizio nuovo sempre acceso, (b) non aggiunge una dipendenza a runtime al file del gioco, (c) non mette una chiave dentro l'HTML | le tre regole scritte di casa (`rete/package.json:21`, `rete/LEGGIMI.md:181-183`, `rete/schema.sql` RLS) | **NO** — e non e' un NO tecnico, e' un NO d'architettura |
| **S5 — SOGLIA-P2P** | se il WebRTC con **solo STUN** viene proposto come trasporto **unico**, il suo tasso di riuscita su rete mobile vera dev'essere **>= 90%** | sotto, serve un TURN = un servizio nuovo sempre acceso e una bolletta | il P2P **non puo' essere l'unico trasporto**; resta ammesso come opportunismo sopra un pavimento che regge da solo |
| **S6 — SOGLIA-CAMPIONE** | il banco rifiuta un campione se: `N < N_minimo calcolato`, oppure la **semiampiezza dell'intervallo di confidenza al 95% del p95 supera 25 ms**, oppure la sorgente e' locale | un p95 su venti campioni e' un numero inventato | **il banco esce 3 (PROVA NULLA)**, mai verde |

**N_minimo non e' una costante magica**: si calcola con l'intervallo di
confidenza **non parametrico** del quantile (metodo binomiale sulle
statistiche d'ordine). Per il p95 servono almeno 20 campioni sopra il
quantile perche' l'intervallo esista; il banco calcola il proprio N e lo
**stampa**, come `_q-ritardo` ha fatto al #141 quando ne ha chiesti 119.

### 3.1 E la soglia che questo cantiere si VIETA

**Non si dichiara «D_rete <= D_gioco = 0 tick».** Sarebbe un NO comprato
senza misurare, e un banco che dice no prima di accendersi vale quanto uno
che dice si: nessuno dei due misura. La lettura del gradino sta in §1 ed e'
la sola difendibile.

---

## 4. IL LIMITE, DICHIARATO E NON AGGIRATO

**Non ci sono due telefoni italiani su rete mobile vera a disposizione.**
Questo cantiere non fa finta del contrario. Quindi, in chiaro:

### 4.1 Da dove misuro

Da **una macchina sola, Windows 10, su una connessione fissa italiana**, il
23 settembre 2026. Ogni numero che produco porta la sua sorgente scritta nel
referto. Nessun numero prodotto qui e' «la latenza di due telefoni italiani»,
e il banco **rifiuta** di scriverlo.

### 4.2 Che cosa e' misurabile da qui, e che cosa no

| domanda | misurabile da qui? |
|---|---|
| esiste un progetto Supabase sul piano in uso? | **SI** — e' un fatto, non una latenza |
| il protocollo Phoenix si parla con un `WebSocket` nudo? | **in parte**: si verifica che un `WebSocket` nudo esista e regga il traffico; la stretta di mano Phoenix verso Supabase **no**, se il progetto non c'e' |
| quanta latenza aggiunge un **relay WebSocket**? | **SI, per surroga**: un relay pubblico a eco, dichiarato come surroga, misura la **forma** (due gambe, jitter, perdita), non il **valore** di Supabase |
| RTT applicativo verso **la nostra** infrastruttura Vercel | **SI** — e' la nostra, ed e' l'unica misura di casa |
| un DataChannel WebRTC si apre con solo STUN? | **SI da questa rete**: candidati riflessi, tipo di mappatura NAT, e un canale aperto davvero |
| **quel** DataChannel si apre fra due telefoni italiani dietro CGNAT? | **NO. E' l'ignoto, e resta l'ignoto.** |
| RTT/jitter/perdita del mobile italiano | **NO** — solo letteratura, marcata tale, con la fonte |

### 4.3 Che cosa cambierebbe il verdetto

Si scrive **adesso**, prima di misurare, cosi' non e' una scusa costruita
dopo:

- se la misura da due telefoni italiani desse `andata_p95 > 300 ms`, **S1
  cade e il verdetto diventa NO**, qualunque cosa dica questa macchina;
- se la desse fra 200 e 300 ms, il verdetto resta **SI SENZA MARGINE** e il
  #146 diventa obbligatorio;
- se il tasso di riuscita del P2P con solo STUN su mobile italiano fosse
  sotto il 90%, **S5 cade** e il P2P perde il ruolo di trasporto unico —
  senza che questo tocchi il verdetto, se il pavimento a relay regge da solo.

### 4.4 Quale misura va fatta per prima quando i telefoni ci saranno

**Una sola, e in quest'ordine**: due telefoni italiani, operatori diversi,
rete mobile, che si scambiano **un pacchetto ogni 100 ms per un'ora** su un
canale relay vero, con **marcatura temporale a sola andata** (orologi
sincronizzati su una terza sorgente, o RTT diviso su percorso simmetrico
dichiarato), e si riporta **p50, p95, p99, p99,83, massimo, jitter e
perdita**. Senza quel campione, tutto quel che segue e' una forma senza un
valore.

---

## 5. I CANDIDATI, E COME LI GIUDICO

Ogni candidato risponde a quattro domande, e la quarta e' la piu' importante:

1. **Esiste oggi**, senza aprire un conto nuovo o accendere un servizio?
2. **Si parla senza dipendenze** dal file del gioco?
3. **Quanta latenza aggiunge**, misurata o dichiarata non misurabile?
4. **Che cosa rompe** delle tre regole scritte di casa?

### (1) Supabase Realtime
Il progetto d'onda §2.8 lo chiama «il pavimento», e `rete/LEGGIMI.md:167-168`
scrive gia' «6 fotogrammi (100 ms)» come se fosse un fatto. **Quei numeri
sono un'ipotesi scritta.** Qui si verifica se il servizio esiste sul piano in
uso, se un `WebSocket` nudo basta, e che latenza aggiunge.

### (2) WebRTC DataChannel con solo STUN
Il «tetto»: una gamba sola. `RTCPeerConnection` e' un'API del browser, quindi
zero dipendenze resta vero. Il killer e' il **TURN**: se serve, e' un servizio
nuovo sempre acceso e una bolletta. Qui si misura: candidati riflessi, **tipo
di mappatura NAT** (confrontando la porta mappata da due STUN diversi: e' il
modo classico di distinguere un NAT a cono da uno simmetrico), e l'apertura
vera di un canale.

### (3) Polling sulle funzioni di oggi
Il progetto d'onda lo dichiara MORTO per il calcio (`maxDuration: 10`, freni
a 30-60 richieste/minuto contro le 600 che servono) e VIVO per la
segnalazione e per un duello a turni. Qui si misura **l'RTT applicativo verso
la nostra infrastruttura**, che e' il pavimento di qualunque cosa passi da
Vercel — segnalazione compresa.

### (4) Qualunque altra via senza un servizio nuovo sempre acceso
Si censisce e si dichiara.

---

## 6. IL BANCO, E I FALSI CHE LO CONDANNANO

`strumenti/_q-rete-latenza.js` **nasce ROSSO**: oggi nel repo non c'e' un
solo numero di RTT, e il banco lo dice.

**La forma** e' quella che il #141 ha pagato con `_q-ritardo`: il metro sta in
una libreria pura (`strumenti/_145-metro-rete.js`), il banco la interroga con
campioni **sintetici e noti**, e la campagna di misura e' uno strumento a
parte. Cosi':

- in **batteria** il cancello gira **offline, deterministico, veloce**: non
  misura la rete, **misura il metro**. Un cancello che ogni giorno dipende da
  un servizio esterno insegna a ignorarsi (lezione del #141 su `_q-ritardo`).
- la **campagna** (`strumenti/_145-campagna.js`) tocca la rete vera, e se la
  rete non c'e' **esce 3**.

**I QUATTRO FALSI, COSTRUITI NEL CASO PEGGIORE** (il #144 ha appena scoperto
che senza una prova aggiunta il suo banco promuoveva due falsi su cinque:
qui ogni falso ha il suo morso dichiarato prima):

| falso | la bugia | perche' e' il caso peggiore |
|---|---|---|
| `_crit-rete-due-campioni` | dichiara verde con due campioni | i due campioni sono **buoni**: 40 e 45 ms. Un falso che sbaglia anche il valore verrebbe preso dal valore, non dalla numerosita' |
| `_crit-rete-locale` | misura il **giro locale** (loopback) e lo spaccia per rete | i numeri sono **plausibili** (1-3 ms), la forma della distribuzione e' giusta, e il campione e' **enorme**: solo la sorgente lo tradisce |
| `_crit-rete-potatore` | scarta il 5% peggiore **prima** di calcolare il p95 | cosi' il p95 stampato e' in realta' il p90 vero, ed e' **quasi giusto**: su una distribuzione a coda lunga la differenza e' tutta nella coda, che e' esattamente cio' che decide lo stallo |
| `_crit-rete-mezzo-giro` | divide per due la misura del **relay** | e' l'errore che *sembra* rigore: «era un RTT, lo dimezzo per la sola andata». Su un relay, l'eco A->S->A **e' gia'** la sola andata A->S->B. Dimezzare dimezza il verdetto |

E un quinto, perche' la perdita ha il suo modo di mentire:

| `_crit-rete-sordo` | conta la perdita solo sui pacchetti tornati | perdita 0,0% su un campione che ne ha perso il 12% |

---

## 7. QUEL CHE QUESTO CANTIERE NON FA

- **Non scrive una riga di trasporto nel gioco.** Nessun `WebSocket`, nessun
  `RTCPeerConnection` dentro `CALCETTO-il-gioco.html`. Il cancello
  `senza-rete` (`conta:true`) pretende zero richieste prima che un dito prema
  SFIDA, e questo cantiere non gli da' niente da mordere.
- **Non introduce chiavi.** Ne' nel file, ne' nel repo. Se una misura ne
  chiedesse una, la misura non si fa e si dichiara non fatta.
- **Non crea servizi.** Nessun progetto nuovo, nessun conto, nessun deploy.
- **Non decide l'onda E da solo**: se il verdetto e' SI, il #146 (la stanza)
  e il #147 (il filo) restano da fare; se e' NO, §5 del progetto d'onda tiene
  pronti i due rami, e questo cantiere deve **dire quale dei due la misura
  favorisce**.

---

## 8. LA RETTIFICA DOVUTA

`rete/LEGGIMI.md:167-168` scrive oggi:

> «Due telefoni, stesso seme, si scambiano i comandi via WebSocket (Supabase
> Realtime). Ritardo di ingresso di 6 fotogrammi (100 ms)»

Sono **due affermazioni non misurate presentate come fatti**: che il
trasporto sia Supabase Realtime, e che 100 ms bastino. Al compito 3 quella
riga si rettifica **a edizioni** — testo vecchio in piedi, correzione in
chiaro accanto con data e fonte — con quel che questo cantiere misura.
E anche la riga 170-172 («quando la connessione salta, il gioco continua
contro la CPU») e' gia' segnata come da rettificare dal progetto d'onda §2.6:
la si tocca **solo** se il verdetto e' SI, perche' altrimenti parlerebbe di
un lockstep che non ci sara'.
