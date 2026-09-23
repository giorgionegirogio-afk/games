# LA MISURA DELLA RETE E DEL TRASPORTO — referto (voce #145)

**23 settembre 2026** · spec `docs/superpowers/specs/2026-09-23-misura-rete-design.md`
(le sei soglie sono state committate in `53d5ffa`, **prima** che un banco girasse)
Dati grezzi: `_analisi/misura-rete-145.json` · letteratura: `_analisi/misura-rete-145-letteratura.json`
Metro: `strumenti/_145-metro-rete.js` · campagna: `strumenti/_145-campagna.js` ·
cancello: `strumenti/_q-rete-latenza.js` · falsi: `strumenti/_q-rete-falsi.js`

---

## 0. DA DOVE MISURO, e che cosa questo referto NON e'

**Una macchina sola, Windows 10, connessione FISSA italiana, 23 settembre 2026.**

**Non ci sono due telefoni italiani su rete mobile a disposizione**, e questo
referto non fa finta del contrario. Ogni numero porta la sua sorgente scritta
accanto; i numeri di letteratura stanno in un file separato e non si mescolano
coi miei; e cio' che ho cercato e non ho trovato e' depositato **come
assenza**, non come dato.

---

## 1. IL NUMERO CHE DECIDE, E COM'E' FATTO

```
D_rete = andata_p95 + buffer_dejitter + 1 tick     dove buffer = p99 - p95
       = andata_p99 + 1 tick
```

E **lo stallo non si sceglie, si calcola**. Un invio ogni 100 ms sono 600
pacchetti al minuto; per stare sotto **uno stallo al minuto** serve
`P(andata > D) < 1/600 = 0,167%`, cioe' **D deve coprire il p99,83 della sola
andata**. Non il p95. E' la derivazione che nessun documento di casa aveva
scritto, e sotto si vede che e' lei a decidere tutto.

**Due regole che il metro incarna, e una e' contro-intuitiva.**
Su un **relay** il percorso utile e' `A -> server -> B`: **due gambe**, e
l'eco `A -> server -> A` ne misura due. **Quel numero E' GIA' la sola andata:
non si divide per due.** Su un **P2P** e' l'opposto: il percorso utile e' una
gamba, l'eco ne misura due, e li' si dimezza. Il falso
`_crit-rete-mezzo-giro` esiste per condannare chi confonde le due.

---

## 2. LE MISURE

### 2.1 Quadro (tutti i numeri in millisecondi)

| # | che cosa | tipo | n | p50 | p95 | p99 | p99,83 | max | persi |
|---|---|---|---|---|---|---|---|---|---|
| **A** | il **nostro** edge Vercel (fra1) | http | 300 | **51,6** | 71,4 | **233,5** | (n insuff.) | 504,1 | 0% |
| **B1** | relay `ws.postman-echo.com` | relay | 3000 | **134** | **203** | **493** | **623** | 644 | 0% |
| **B2** | relay `echo.websocket.org` | relay | 800 | **67** | **88** | **371** | **490** | 554 | 0% |
| **E** | **controllo**: stesso client su loopback | relay | 3000 | **1** | **2** | **2** | **2** | 3 | 0% |
| **C** | DataChannel fra due pari, stessa macchina | p2p | 400 | 2,0 | 2,5 | 2,7 | 2,8 | 2,8 | 0% |

**E ed C sono RIFIUTATI dal metro** (`sorgente-locale`), **A** e' rifiutato
come `percorso-non-fra-pari`. Il rifiuto vale per `D_rete`; **i numeri grezzi
restano un fatto**, e senza di loro questo referto non varrebbe niente.

### 2.2 Il controllo del banco — la riga E, che e' la piu' importante di tutte

La sonda B misura con `Date.now()` dentro un processo Node a un filo solo che
dorme fra un invio e l'altro. Se l'anello degli eventi si fermasse 200 ms per
una raccolta di memoria, quel ritardo diventerebbe «coda della rete» — e la
coda e' precisamente cio' che decide questo cantiere. **Il verdetto sarebbe
mio e non della rete.**

Percio' lo stesso client, con le stesse dormite e lo stesso parsing dei
fotogrammi, e' stato rigirato contro un relay WebSocket scritto a mano sul
**loopback**, 3000 pacchetti:

> **p50 1 ms · p99 2 ms · p99,83 2 ms · massimo 3 ms.**

Il banco non ha code. **Le code da 300-600 ms della sonda B sono della rete.**

### 2.3 I due relay — D_rete e D_stallo

| | D_rete | | D_stallo (senza ridondanza) | |
|---|---|---|---|---|
| **B1** postman-echo | 509,7 ms | **30,6 tick** | 639,7 ms | **38,4 tick** |
| **B2** echo.websocket.org | 387,7 ms | **23,3 tick** | 506,7 ms | **30,4 tick** |

Intervalli di confidenza del p95 (non parametrici, binomiale sulle statistiche
d'ordine): B1 `[193, 232]`, semiampiezza **19,5 ms**; B2 `[85, 130]`,
semiampiezza **22,5 ms**. Tutti e due sotto il tetto di 25 ms della soglia S6:
**il campione regge, e i numeri si possono trascrivere.**

### 2.4 LA MISURA CHE HA CAMBIATO IL VERDETTO: la coda arriva a raffica

Il progetto d'onda (§2.4) propone una mitigazione a buon mercato: ogni
pacchetto porta **gli ultimi R comandi**, quindi uno stallo chiede che R
pacchetti *consecutivi* siano in ritardo. Col conto `600 * P^R`, a R = 3:

> B1: D_stallo scende da 38,4 a **8,4 tick**. B2: da 30,4 a **4,6 tick**.

**Sono due numeri che avrebbero fatto dire SI a questo cantiere.** E sono
falsi, ed e' misurato perche':

quel conto assume che i ritardi siano **indipendenti**. Si e' misurato se lo
sono — fra i pacchetti sopra il p95, quanti hanno **subito prima** un altro
pacchetto sopra il p95? Se fossero indipendenti sarebbe il 5%:

| | sopra il p95 | attaccati al precedente | quota | atteso se indipendenti |
|---|---|---|---|---|
| **B1** | 148 | 116 | **78,4%** | 5% |
| **B2** | 39 | 26 | **66,7%** | 5% |

**La coda arriva a raffica, quindici volte piu' di quanto l'indipendenza
preveda.** E' il comportamento di un canale **ordinato e affidabile su TCP**:
quando un pacchetto si ferma, tutti quelli dietro si fermano con lui — il
blocco in testa alla fila. **La ridondanza non compra niente contro una
raffica**, perche' le R copie stanno tutte nella stessa fila ferma.

**Senza questa misura, il verbale avrebbe scritto «con la ridondanza il
lockstep passa a 8,4 tick» e avrebbe detto SI.**

### 2.5 La coda non e' nemmeno stabile

Lo stesso relay, due corse a mezz'ora di distanza lo stesso giorno:

| | p50 | p95 | p99 | p99,83 |
|---|---|---|---|---|
| B1, prima corsa | 134 | 177 | **335** | 574 |
| B1, seconda corsa (depositata) | 134 | 203 | **493** | 623 |

La **mediana non si muove di un millisecondo**; il p99 si muove del **47%**.
E' la fotografia di tutto questo cantiere: il centro della distribuzione e'
solido e il lockstep non decide li'; decide sulla coda, e la coda non sta
ferma nemmeno sulla stessa connessione nella stessa sera.

---

## 3. I TRASPORTI CANDIDATI

### (1) Supabase Realtime — **NON ESISTE OGGI**

Tre verifiche, tutte fatte il 23 settembre 2026:

| verifica | esito |
|---|---|
| riferimenti a un progetto (`<ref>.supabase.co`) nel repo | **NESSUNO** |
| variabili d'ambiente `SUPABASE_*` | **NESSUNA** |
| variabili d'ambiente del progetto Vercel `calcetto-rete` | **ZERO, via API Vercel** |
| DNS di un riferimento inventato | **NXDOMAIN** — niente carattere jolly, quindi l'assenza e' un'assenza |
| il deployment di produzione di `calcetto-rete` | risponde **503 `DEPLOYMENT_PAUSED`** dall'edge `fra1` |

**Non c'e' un progetto Supabase, e il server di CALCETTO non e' collegato a
niente.** Quindi `rete/LEGGIMI.md:167-168` — «si scambiano i comandi via
WebSocket (Supabase Realtime), ritardo di 6 fotogrammi (100 ms)» — **descrive
un trasporto che oggi non esiste, con un numero che nessuno ha misurato**.

Quel che si e' potuto verificare comunque, **LETTO dalla documentazione
ufficiale e non misurato**: il protocollo **si parla con un `WebSocket` nudo**,
senza libreria. URL `wss://<ref>.supabase.co/realtime/v1/websocket?apikey=...`,
`vsn=1.0.0` o `2.0.0`, `phx_join` come messaggio JSON, battito almeno ogni 25
secondi. **L'ipotesi di §2.8 del progetto d'onda regge sul punto «zero
dipendenze».** Regge meno sul punto «nessuna chiave nell'HTML»: l'`apikey` e'
obbligatoria nell'URL, quindi o finisce nel file — e rompe una regola scritta
— o serve un endpoint nuovo che conii un gettone a vita breve.

### (2) WebRTC DataChannel con solo STUN — **esiste, e da qui passa**

| misura | esito |
|---|---|
| STUN che rispondono | **3 su 3** (Google ×2, Cloudflare) |
| candidati riflessi | **1 per socket**, sempre |
| candidati di relay (TURN) | **0** — nessun TURN configurato, e infatti |
| tempo di raccolta | 133-152 ms |
| **mappatura NAT** (tre STUN dallo **stesso** socket, tre giri) | **1 sola porta esterna distinta ogni volta** |
| DataChannel aperto fra due pari | **si**, `ordered:true, maxRetransmits:0` |

> **La mappatura e' INDIPENDENTE DALL'ENDPOINT (NAT a cono): da questa rete
> fissa, il P2P con solo STUN passa.**

**E QUI IL BANCO SI E' CONDANNATO DA SOLO.** La prima versione apriva **tre**
`RTCPeerConnection`, una per STUN, e confrontava le porte mappate: uscivano
tre porte diverse (54986, 53587, 54035) e lo strumento stampava **«NAT
SIMMETRICO, serve un TURN»** — cioe' condannava il P2P dell'intera onda E.
Era falso: tre connessioni usano **tre socket locali diversi**, e qualunque
NAT da' a socket diversi porte esterne diverse. **Quel banco misurava il
proprio numero di socket.** Il test giusto interroga piu' STUN **dallo stesso
socket** e conta i candidati riflessi distinti. E serve la **guardia**, o il
test giusto mente al contrario: se due server tacessero, il candidato sarebbe
uno solo lo stesso e si concluderebbe «cono» misurando il silenzio — percio'
si verifica prima, uno per uno, che tutti e tre rispondano.

**Il limite, dichiarato:** questo dice che il P2P passa **da una rete fissa
italiana**. Non dice **niente** sul CGNAT delle reti mobili italiane, che e'
esattamente il caso duro e l'ignoto che il progetto d'onda §2.8 nomina.

### (3) Polling sulle funzioni di oggi — morto per il calcio, vivo per un duello

Riverificato sul codice, non ereditato: i freni sono
`frenato('sfida:'+id, 30, 60)` (`rete/api/sfida.js:190`),
`frenato('sfl:'+id, 60, 60)` (`:161`),
`frenato('avv:'+id, 60, 60)` (`rete/api/avversario.js:106`) — cioe' **30 e 60
richieste al minuto per identita'**. Un lockstep a 10 Hz ne chiede **600**:
**dieci-venti volte sopra**. E `rete/vercel.json` da' `maxDuration: 10`.

**Ma un duello non e' 600 richieste al minuto: sono pochi scambi.** Il polling
di oggi ci sta dentro senza toccare un freno.

### (4) Altre vie senza un servizio nuovo sempre acceso
Censite: nessuna. `experimental_upgradeWebSocket` su Vercel pretende
`@vercel/functions` (rompe `rete/package.json:21`, zero dipendenze) e comunque
non da' stato condiviso fra due connessioni.

---

## 4. LA LETTERATURA, MARCATA, E CIO' CHE NON HO TROVATO

**AGCOM, «Misura Internet Mobile 2025»** (rilevazione Fondazione Ugo Bordoni,
45 centri urbani italiani, settembre-dicembre 2025):

| | valore |
|---|---|
| RTT medio, misure statiche | **27,97 ms** |
| RTT, dinamiche urbane (veicolo in moto) | **36,34 ms** |
| RTT, percorsi extraurbani | **44,02 ms** |
| perdita di pacchetti, statiche | **0,71%** |

**Tre limiti, e li dichiara il rapporto stesso.** UNO: e' un RTT verso un
**server di prova**, cioe' la forma `http` del metro, **non un percorso fra
pari**: non si converte in `D_rete`. DUE: e' una **MEDIA**, e questo cantiere
decide sulla **coda** — il p95, e soprattutto il p99,83, **non sono
pubblicati**. Una media di 28 ms sta benissimo sia con una coda a 60 ms sia
con una coda a 600 ms, **e sono due verdetti opposti**. TRE: il rapporto usa
il criterio della «migliore tecnologia disponibile», quindi e' un **limite
inferiore ottimistico**, non una stima centrale.

**CIO' CHE HO CERCATO E NON HO TROVATO, depositato come assenza:** i
**percentili** della latenza mobile italiana. Opensignal Italy (HTTP 403 da
questa macchina), nPerf Barometer Italy 2025 (PDF coi dati dentro immagini),
Speedtest Global Index (non raggiungibile). **E' precisamente il numero che
deciderebbe questo cantiere, e non esiste in forma leggibile.**

---

## 5. IL VERDETTO, applicando le soglie dichiarate il 23 settembre PRIMA di misurare

| soglia | esito | il numero |
|---|---|---|
| **S6 — campione** | **TIENE** | 3000 e 800 campioni; semiampiezza dell'IC del p95 19,5 e 22,5 ms, tetto 25 |
| **S1 — `D_rete(p95) <= 18 tick`** | **NON TIENE** | **23,3 tick** (B2) e **30,6 tick** (B1) |
| **S2 — `D_rete(p95) <= 12 tick`** | **NON TIENE** | idem |
| **S3 — stallo, `D >= p99,83`** | **NON TIENE** | **30,4 tick** (B2) e **38,4 tick** (B1); e la scorciatoia della ridondanza e' **misurata invalida** (raffica 66,7% e 78,4% contro il 5% atteso) |
| **S4 — trasporto** | **TIENE A META'** | esiste **un** trasporto senza servizio nuovo e senza dipendenze: **WebRTC con STUN**. Supabase Realtime **non esiste** (nessun progetto), e chiederebbe un `apikey` che oggi non ha dove stare |
| **S5 — P2P >= 90% su mobile italiano** | **NON MISURATA** | da questa rete fissa la mappatura e' a cono e il P2P passa; sul CGNAT mobile italiano **e' l'ignoto** |

> # IL LOCKSTEP NON E' AMMESSO. IL VERDETTO E' **NO**.

**E il NO non e' quello che si temeva.** Non e' «la rete italiana e' lenta»:
le mediane stanno benissimo — 67 ms a due gambe verso un relay
transatlantico, e AGCOM da' 28 ms di RTT medio sul mobile italiano.
**Il NO e' LA CODA.** Il p99 vale 2,7-5,5 volte il p50, non sta fermo
nemmeno fra due corse della stessa sera, e **arriva a raffica** — il che
toglie di mezzo l'unica mitigazione a buon mercato che il progetto d'onda
aveva in mano.

**E c'e' un secondo NO, piu' semplice e piu' duro:** il trasporto del
progetto **non esiste**. Non c'e' un progetto Supabase, il server e' in pausa,
e i «6 fotogrammi (100 ms)» di `rete/LEGGIMI.md:167-168` sono un numero di
disegno che nessuno ha mai misurato. Non si puo' dire che regga e non si puo'
dire che non regga: **non c'e'.**

### 5.1 Che cosa cambierebbe il verdetto — scritto prima di misurare, e non cambiato dopo

- Un relay **nella stessa regione dell'edge**. I due misurati sono
  transatlantici. Dal **nostro** edge `fra1` (p50 51,6, p99 233,5 su 300
  campioni) un relay europeo darebbe `D_rete ~ 250 ms = 15 tick`: **S1
  terrebbe**. Ma il p99,83 di quella stessa misura e' **504 ms = 31 tick**:
  **S3 non terrebbe lo stesso.** *(DERIVAZIONE, non misura: a 300 campioni il
  p99,83 e' il massimo, cioe' un campione solo. Il metro lo dichiara non
  misurabile sotto 600 campioni, e qui e' scritto come indicazione, non come
  numero.)*
- Un campione da **due telefoni italiani su rete mobile** con p99 e p99,83
  migliori di questi. E' l'unica cosa che potrebbe ribaltare il NO.
- Un trasporto **non ordinato**: la raffica misurata e' il blocco in testa
  alla fila di TCP. Un DataChannel WebRTC **inaffidabile e non ordinato** non
  ce l'ha per costruzione. **E' l'unica via tecnica che il NO lascia aperta**,
  e dipende tutta da S5, che non e' misurata.

### 5.2 Quale misura va fatta per prima quando i telefoni ci saranno

**Una sola, e in quest'ordine.** Due telefoni italiani, **operatori diversi**,
rete mobile, un pacchetto ogni 100 ms **per un'ora** (36.000 campioni: sotto i
600 il p99,83 non esiste, e per misurarlo invece di vederlo ne servono
decine di migliaia), su un canale relay vero, con marcatura a sola andata. Si
riportano **p50, p95, p99, p99,83, massimo, jitter, perdita e la quota di
raffica**. E, nello stesso giro, **il tasso di riuscita di un DataChannel con
solo STUN fra quei due telefoni**: e' S5, ed e' l'altra meta' del verdetto.

### 5.3 Quale ramo la misura favorisce: **LA TERZA VIA**

Il progetto d'onda §5 tiene pronti due rami. **La misura ne favorisce uno, e
per una ragione misurata e non per gusto.**

Il danno dello stallo e' `600 invii/minuto x P(coda)`: **scala con la
FREQUENZA del canale**. Il calcio continuo a 60 Hz e' il caso peggiore
possibile per una coda a raffica. **Un duello no**: sono pochi scambi, non
seicento al minuto. Con dieci scambi per duello, la stessa coda che fa tre
stalli al minuto nel gioco aperto da' **0,017 stalli per duello** — e mezzo
secondo fra il tiro e il tuffo del portiere non e' un blocco: e' il momento.

E la terza via **sta dentro l'architettura di oggi, misurata**:
- i verbi del duello sono **gia' semantici nel nastro** (`pickZone(z,u,v)`,
  `stopPower()`, `pickKeeper(z)`, con u/v al millesimo);
- il duello ha **gia' il suo orologio** (`Duel.nDuello`/`Duel.passo`);
- il polling di oggi **ci sta nei freni**: 30-60 richieste al minuto bastano a
  pochi scambi, mentre erano dieci-venti volte troppo poche per il lockstep;
- **zero servizi nuovi, zero chiavi nuove, zero buchi in RLS, zero bolletta.**

**Il server autoritativo, invece, non risolve il problema misurato.** Una
flotta di browser headless costa un host sempre acceso, un sesto servizio e
una bolletta (progetto d'onda §5.2), e **non toglie la coda**: la tollera in
un altro modo — estrapolando o riavvolgendo — e il gioco non ha ne' l'una ne'
l'altro. Si comprerebbe la parte cara senza comprare la cura.

---

## 6. CHE COSA SOPRAVVIVE AL NO

Tutto tranne il filo, ed e' quanto il progetto d'onda §5.3 prometteva: il
determinismo (`SEME`, `DECO`, `MOTORE_V` a 4), la matematica in casa del #143
(tre motori, stessa partita), l'atto risolto del #144 (due telefoni diversi,
stessa partita), il nastro e i suoi tipi di riga, il giudice dentro il file,
e **il metro di questo cantiere**, che resta in batteria e che servira' tale e
quale il giorno in cui due telefoni veri produrranno un campione.
