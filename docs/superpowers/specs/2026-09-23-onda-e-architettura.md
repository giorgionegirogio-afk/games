# PROGETTO D'ARCHITETTURA — ONDA E, LIVE 1v1

**Regola sopra tutte (committente, 17 settembre, `_analisi/MAPPA-MANDATO.md:792-795`): lockstep prima; il server autoritativo solo se LA MISURA dice che il lockstep non basta. Quindi il primo cantiere non costruisce: misura.**

**Metodo di questo documento.** Vincolo rispettato: **non ho eseguito nessun banco, nessuna batteria, nessuna partita** (un altro cantiere sta girando misure pesanti). Le mie «misure» sono grep, conteggi e letture su file fermi; tutto il resto è LETTO e marcato come tale. Dove il dossier delle quattro lenti afferma qualcosa che non ho riverificato di persona, lo scrivo.

**Le mie verifiche di oggi (23 settembre 2026), tutte statiche:**

| verifica | esito |
|---|---|
| `grep -c -i -E "lockstep\|WebSocket\|Realtime\|RTCPeerConnection\|EventSource"` su `CALCETTO-il-gioco.html` | **0** — l'onda E parte da zero righe |
| `grep -o "fetch("` sullo stesso file | **1** (`CALCETTO-il-gioco.html:46071`) |
| chiave `dita` dentro il blocco `window.__test` (righe 46350-47100) | **assente** — la prova C di `_q-determinismo` è inerte, confermato |
| `rete/vercel.json` | 16 righe, `maxDuration: 10`, `memory: 256`, **nessuna chiave `crons`** |
| `rete/api/classifica.js:28-47` contro `:50` | il ramo `?replay=` **ritorna prima del `frenato`** — buco confermato leggendo |

**E una verifica mia che cambia il peso del problema più grosso del progetto** — la riporto subito perché ribalta una stima:

> `humanMove(t)` (`CALCETTO-il-gioco.html:12746-12763`) legge **soltanto** `Touch5.stick[t].dx/dy`, e le soglie sono costanti in pixel assoluti — `const STICK_DEAD=12, STICK_FULL=46` (`:12746`), `const l=len(s.dx,s.dy), MAXR=70` (`:14463`), `mag=Math.min(1,(l-STICK_DEAD)/(STICK_FULL-STICK_DEAD))` (`:12757`). **Nessuna di queste è scalata sullo schermo.** Quindi tutto il comando di movimento di una squadra è la coppia `(dx,dy)` limitata a 70, ed è **già indipendente dallo schermo**. Lo schermo entra nello strato d'ingresso in due punti soli: `touchBtnLayout(t)` (`:13316`, `const bx = right ? VW : 0` a `:13325`) e `Touch5.teamOf(x)` (`:14149-14151`, `innerWidth/2`). Entrambi si risolvono al touchstart in un **atto**.

E una seconda, che riduce il perimetro di metà onda:

> `startMatch(mode,...)` a `:11387-11389` mette `G.mode = mode===2?2:1` e `G.cpu=[false, G.mode===2?false:true]`. **Due squadre umane contemporanee esistono già nel gioco spedito** (modalità 2, schermo diviso). Il live 1v1 non è «insegnare al gioco due umani»: è **portare i comandi del secondo umano da un altro telefono**. In più, in modalità 2 il mancino è disattivato per costruzione (`const right = (G.mode===2) ? (t===1) : !pollice().mn`, `:13324`): una delle tre manopole del pollice sparisce gratis.

---

## 1. LA MISURA CHE DECIDE

### 1.1 Che cosa si misura, esattamente

La domanda «il lockstep basta?» non è una domanda: è una catena di quattro numeri, e il lockstep è ammesso **solo se tutti e quattro tengono**.

- **D_gioco** — il ritardo d'ingresso, in tick da 1/60, oltre il quale il gioco smette di essere il gioco. È una proprietà **del gioco**, si misura senza rete, su un telefono solo.
- **D_rete** — il ritardo d'ingresso che il trasporto *pretende*: latenza di sola andata al p95 + buffer di dejitter + un tick di quantizzazione. È una proprietà **della rete e del trasporto**.
- **S** — il tasso di **stallo**: quante volte al minuto la simulazione deve fermarsi ad aspettare il peer, e per quanto. Un lockstep che rispetta D e si ferma tre volte al minuto è ingiocabile lo stesso.
- **M** — lo **scarto fra due motori JavaScript**: due telefoni non sono due schede dello stesso Chromium. Se l'impronta differisce fra V8 e JavaScriptCore, D_gioco e D_rete non contano niente.

**Verdetto: lockstep ammesso ⟺ `D_rete(p95) ≤ D_gioco` con margine, `S` sotto soglia, `M = 0`.**

### 1.2 Il banco, in quattro gambe (nessuna basta da sola)

**Gamba A — IL NASTRO TRASLATO (deterministica, ripetibile, ed è quella che sa dire NO da sola).**
Si prendono venti nastri onesti a taglia 5 (il copione di dita di `_q-sfida.js`, più nastri registrati con dita vere alla maniera di `strumenti/giocata.js`), e si rigioca ciascuno **traslando di +K tick ogni comando**, con K ∈ {0, 3, 6, 9, 12, 15, 18} (0, 50, 100, 150, 200, 250, 300 ms). La macchina esiste già tutta: il riproduttore è `Reg.passo()` (`:13875-13888`, `while(righe[i][0] <= this.tick)`), il ciclo a passo fisso è `__test.simulate` (`:46923-46932`), la rigiocata pulita è `giudica(...)` (`:45651`). Si misura il **danno**: gol della squadra comandata, tiri nello specchio, passaggi arrivati, contrasti vinti, possesso, e una *fedeltà* (quanti tick il comandato passa a fare quel che gli è stato chiesto).

Perché è onesta: misura il **caso peggiore**, il giocatore che NON si adatta. Va dichiarato in testa al banco, o il banco mente per eccesso di severità. È un **limite superiore al danno**, non l'esperienza umana.

**Gamba B — IL VERBO SOTTO RITARDO (tocchi veri, NON ripetibile).**
Si riusa l'impianto di `strumenti/giocata.js` (gesti touch di protocollo via CDP, campionamento a 60 Hz, cancello a 500 ms dichiarato nella sua testa) e si infila una **coda di K tick davanti alle quattro porte** (`CALCETTO-il-gioco.html:45852-45901`). Poi si rigira lo stesso repertorio: TIRA con la carica, FILTRANTE, CAMBIO, CONTRASTA, cross. Si misura se il verbo **riesce ancora** (i contatori di stato che `giocata.js` già pretende) e di quanto cresce la sua latenza. Il punto fragile è **la carica**: la finestra dolce 0,50-0,80 s è tenuta dal dito, e un ritardo che sposta il rilascio sposta la carica.
Banco a tempo reale ⇒ **non ripetibile** (regola di casa, `CLAUDE.md`): si lancia con `--ripetuto 3` e un solo rosso non è una prova.

**Gamba C — LA PROVA UMANA, IN CIECO, SU UN TELEFONO SOLO (l'unica che sa pronunciare la parola «ingiocabile»).**
Serve un aggancio nuovo, `__test.ritardo(K)`, che accoda i comandi di K tick **senza rete di mezzo**. Il committente gioca sei partite da 90 secondi con K pescato **in cieco** da {0, 3, 6, 9, 12, 18}, e dopo ognuna risponde con due numeri: «quanto è stata tua» (1-5) e «riproveresti» (sì/no). Il verbale è la mediana per K.
In cieco perché un ritardo dichiarato si giudica prima di sentirlo. Costa una sera, zero infrastruttura, ed è l'unica gamba che produce un giudizio invece di un numero.

**Gamba D — DUE MOTORI, NON DUE SCHEDE (il rischio che nessuno strumento del repo vede).**
`strumenti/_q-determinismo.js` fa **un solo** `chromium.launch()` e apre due contesti della stessa istanza (righe 147, 156, 170 — LETTO dal dossier, non riverificato da me): la frase «due telefoni vedono la stessa partita» è un'inferenza sulla parola *telefono*. La simulazione chiama a ogni passo trascendenti che ECMA-262 lascia approssimate dall'implementazione (`len=(x,y)=>Math.hypot(x,y)` a `:8710`, `Math.pow(0.35, dt*ATTR_K)` in `updateBall` a `:19685`). Playwright ha Chromium **e** WebKit: stesso seme, stesso copione, si confrontano le due impronte.
**Costa un pomeriggio e può annullare l'intera onda.** Va fatta per prima dentro il #141, non per ultima.

### 1.3 Le soglie, dichiarate PRIMA (e sono severe apposta)

Vanno scritte nella spec del #141 **prima** di girare il banco. Una soglia decisa dopo è un'opinione.

1. **SOGLIA-DANNO** — alla D scelta, la gamba A mostra un peggioramento di gol fatti e tiri nello specchio **non superiore al 25%** rispetto a K=0, su ≥ 20 nastri a taglia 5, con la dispersione dichiarata. Oltre: **NO**.
2. **SOGLIA-VERBI** — gamba B: tutti e cinque i verbi riescono in **≥ 95%** dei tentativi, e la carica del tiro cade nella sua finestra in **≥ 90%**. Se un verbo muore: **NO**.
3. **SOGLIA-UMANA** — gamba C: mediana «è stata mia» **≥ 4/5** e **zero** «non riproverei». Se l'uomo dice no, i numeri non contano.
4. **SOGLIA-MOTORE** — gamba D: impronte **identiche** fra Chromium e WebKit su tre semi. Diverse: **NO**, e l'onda E cambia forma (il lockstep puro non esiste più; resta solo l'arbitro, §5).
5. **E LA SOGLIA CHE DECIDE DAVVERO — `D_gioco ≥ 12 tick (200 ms)`.** Non 6.
   Perché 12 e non 6: **D_rete non è l'RTT**, è andata singola al p95 + dejitter + un tick. Se il gioco tollera esattamente i 6 fotogrammi che `rete/LEGGIMI.md:167-170` promette, **non c'è margine**: ogni pacchetto sopra la mediana diventa uno stallo. I 6 fotogrammi = 100 ms di `rete/LEGGIMI.md` sono **un numero di progetto mai misurato**, e vanno trattati come l'ipotesi da falsificare, non come il traguardo.
6. **SOGLIA-STALLO** (si verifica nel #143, ma si dichiara qui) — meno di **uno stallo al minuto**, e mai più lungo di **250 ms**.

### 1.4 I numeri di rete da assumere, e la loro fonte

**Non ce ne sono, e questa è la risposta onesta.** Cercando nel mandato si trovano meccanismi e nessuna soglia: buffer 60-160 ms, estrapolazione ≤ 100 ms, sync ogni 5 s, «region preference with latency measurement» senza un ms (`_analisi/MANDATO-STADIUM-ROAR.md:444`, LETTO). In `fcm-estratto/` la tavola di configurazione è chiave→hash **senza valori**: chi citasse «N fotogrammi di FC Mobile» se li inventerebbe (LETTO dalla lente fcm). E nel repo l'unico numero di rete che esiste è il **tetto di 8 secondi** di `Rete.chiama` (`CALCETTO-il-gioco.html:46065`), che è un timeout, non una latenza.

Quindi: **il numero va misurato, ed è il cantiere #143.** Campionamento di 24 ore da due telefoni italiani su rete mobile vera (operatori diversi) verso l'infrastruttura che possiamo davvero avere, con p50/p90/p99 dell'RTT applicativo e la perdita. Fino a che quel numero non esiste, **l'architettura resta indecisa**, ed è esattamente ciò che il committente ha chiesto.
Quel che è lecito scrivere nel frattempo: una *ipotesi di lavoro da falsificare* (4G verso un edge vicino, decine di ms con code occasionali di centinaia). Marcata IPOTESI. Mai citata come fatto.

### 1.5 Il banco deve poter dire NO — le tre porte del NO

1. Gamba A: danno > 25% a D = 12 → **NO**.
2. Gamba C: l'uomo dice «non riproverei» → **NO**.
3. #143: `D_rete(p95) > D_gioco` oppure successo del P2P sotto soglia → **NO**.
   (E la gamba D può dire NO prima di tutte e tre.)

**I falsi che condannano il banco** — senza, non è un banco (convenzione `_crit*`): `_crit-traslazione-sorda`, che applica la traslazione alla **testa** del nastro invece che ai comandi e non deve passare; `_crit-traslazione-cieca`, che trasla solo i `touchmove` e non i `touchstart`; `_crit-ritardo-attestatore`, che mostra zero danno a 300 ms — un banco che non vede un ritardo di mezzo secondo **attesta invece di misurare**, ed è peggio di nessun banco.

### 1.6 Se la misura dice NO

Non si apre il ramo del server autoritativo per riflesso. §5 dice che cosa costa davvero e §5.3 propone la terza via che nessuno ha ancora scritto.

---

## 2. IL PROGETTO LOCKSTEP (se la misura dice sì)

### 2.1 L'orologio: ci sono già, e sono due

- Scena normale: **`Reg.tick`**, incrementato in fondo a `Reg.passo()`, chiamata all'inizio di ogni `step()` (`CALCETTO-il-gioco.html:13875-13888`).
- Duello: **`(Duel.nDuello, Duel.passo)`**, con `Reg.passoDuello()` come **prima** istruzione dentro `Duel.update`, dentro un `try/finally` (`:13917-13952`, avvolgimento a `:45941`). La disuguaglianza è stretta (`r[4] >= p` → si eseguono le righe con `passo < p`) e un aggiornamento di scarto vale il 5% degli esiti (MISURATO al #131, dossier).

**Il lockstep non inventa un terzo orologio.** Un comando viaggia con `tick` quando la scena è `play`, con `(nDuello, passo)` quando è `freekick` — esattamente la distinzione che il nastro fa già fra i tipi 0-4 e il tipo 6.

### 2.2 Il vocabolario dei comandi: l'atto, non il pixel

Questo è il cuore, ed è **più piccolo di quanto si tema**, per la verifica in testa a questo documento:

| che cosa viaggia | forma | perché |
|---|---|---|
| levetta | `(dx, dy)` interi in −70..70 | `humanMove` legge solo quello (`:12746-12763`); soglie in px assoluti, non scalate |
| verbo | l'**atto risolto** (`shot`/`slide`/`filtrante`/`cambio`/`sprint`…), più giù/su per la carica | `Touch5.start` risolve l'atto al touchstart leggendo `touchBtnLayout(t)`; il pixel muore lì |
| duello | `pickZone(z,u,v)` · `stopPower()` · `pickKeeper(z)` | già semantici nel nastro, u/v in millesimi (`:13955-13965`) |
| **squadra** | 0 o 1 | **campo nuovo**: oggi `teamOf(x)` la deduce dalla x (`:14149-14151`), e in 1v1 non si può |

Sono pochi byte. La stima di casa, «~4 byte per fotogramma a testa» (`rete/LEGGIMI.md:35-37`), regge: **non è la banda il problema**.

### 2.3 Il ritardo d'ingresso, e l'intuizione architetturale

Ritardo fisso **D** tick, concordato una volta al fischio, **uguale per tutti e due**. Un comando prodotto al tick T si accoda ed esegue al tick **T+D** su entrambi i telefoni. Anche il locale subisce il proprio ritardo: è tutto il trucco, ed è ciò che rende le due simulazioni identiche **senza rollback**.

E il riproduttore che esegue un comando a un tick dato **esiste già**: è `Reg.passo()` in modo 2. Quindi:

> **Il lockstep non è un motore nuovo: è il riproduttore del nastro alimentato dal filo invece che da una stringa.** `Reg` prende un terzo modo (3 = «leggo dal filo»), e tutto l'impianto del #131/#132/#133/#139 — l'azzeramento dei comandi (`:13690-13712`), l'ora di gioco (`oraGioco()`, `:14140-14142`), le quattro porte avvolte (`:45852`) — vale tale e quale.

### 2.4 La perdita di un pacchetto

I comandi sono minuscoli: si spedisce **ogni comando con gli ultimi K già spediti in coda** (ridondanza, la stessa forma del mandato `:99-103`). Con un invio ogni 100 ms che porta anche 12 tick di storia, una perdita singola è invisibile e non costa un viaggio in più.

### 2.5 Lo stallo — e qui `MOTORE_V` sale

Se al tick T+D mancano i comandi del peer per T, la simulazione **deve fermarsi**. Oggi non può: `frame()` (`:41133-41159`) **butta il tempo** quando il telefono arranca (`while(acc>=DT && n<6)` e poi `if(n===6) acc=0`), e non aspetta mai nessuno. Serve un **cancello davanti a `step()`**: «ho i comandi di tutti e due per questo tick?». Se no, non si avanza.

Questo cambia l'esito di sequenze di comandi identiche ⇒ **`MOTORE_V` passa da 2 a 3** (`:13639`), e i nastri del motore 2 vengono rifiutati con causa vera da `vagliaNastro` (`:45562`, `ALTRO MOTORE/motore-diverso`). **Va messo in conto nel piano, non scoperto a metà cantiere.**

### 2.6 Disconnessione, abbandono, riconnessione — e una rettifica al disegno di casa

Entrambi i telefoni stanno già scrivendo un nastro completo dal tick 0. Da lì:

- **Peer muto 2 s**: badge discreto, **mai un popup**, mai un falso «l'altro se n'è andato».
- **Peer muto 10 s**: la partita **si congela** al tick T.
- **RETTIFICA A EDIZIONI NECESSARIA.** `rete/LEGGIMI.md:170-172` promette: «quando la connessione salta, il gioco continua contro la CPU e il risultato si registra come sfida asincrona». **In lockstep, come scritto, non è realizzabile**: nell'istante in cui un lato sostituisce una CPU le due simulazioni smettono di essere la stessa partita e non esiste più una verità condivisa. Il degrado onesto è un altro, e vale lo stesso: **la partita si ferma al tick T, i due nastri si troncano a T, e chi è rimasto sottomette il suo nastro come sfida asincrona col punteggio al tick T** — che è un nastro normale e il giudice di casa (`giudica`, `:45651`) lo sa verificare senza una riga nuova. Chi se n'è andato prende la resa.
- **Rientro**: entrambi tengono il nastro dal tick 0, quindi il rientro è *rispedisci il nastro, l'altro lo rigioca a velocità piena e si riaggancia*. La macchina è `__test.simulate` (`:46923-46932`). **Quanto costa rigiocare 60 s di partita su un telefono è un numero che dobbiamo misurare** (LETTO che è poco, non misurato): entra nel banco del #146.

### 2.7 Che cosa vede chi aspetta

Mai una rotella. La scena resta **viva** mentre la simulazione è ferma — e questa non è un'aspirazione, è una proprietà già comprata: la cosmetica gira su `DECO`, un PRNG separato con stato proprio che non tocca né `SEME` né `Math.random` (`:8782-8791`, riseminato a `:28293` e `:30713`, cura #129). Si può far respirare folla e telecamera **senza consumare un solo sorteggio di gioco**. Il dettaglio di regia sta in §6.

### 2.8 IL PUNTO DURO: su che cosa viaggiano i comandi

Quattro candidati, giudicati contro tre regole di casa **scritte** e non negoziabili senza il committente: zero dipendenze a runtime (`rete/package.json:21`), nessuna chiave dentro l'HTML (`rete/LEGGIMI.md:181-183`), RLS acceso con zero policy (`rete/schema.sql:500-512`).

**(1) Polling su una tabella `stanza` con le funzioni di oggi. — MORTO, e si può dimostrare.**
Non rompe nessuna regola, e proprio per questo è la tentazione. Due ragioni verificate lo uccidono: (a) `rete/vercel.json` dà `maxDuration: 10` e **le funzioni non condividono memoria** (scritto due volte in casa: `rete/schema.sql:196-198` e `rete/api/sfida.js:106-112`), quindi ogni scambio è un giro HTTP → funzione → PostgREST → Postgres → indietro; (b) i freni sono **30-60 richieste al minuto per identità** (`rete/api/sfida.js:142`, `rete/api/avversario.js:106`), e un giro a 10 Hz è 600/min a telefono: **fattore 10-20 sopra**, con almeno due viaggi a Postgres per giro. Non porta il calcio a 60 Hz. *Porta benissimo un duello a turni* — tenerlo in tasca per §5.3 — e porta benissimo la **segnalazione** (§2.8 punto 3).

**(2) Supabase Realtime broadcast. — È il pavimento, e l'unica forma che non rompe le regole è questa.**
Il client parla il protocollo Phoenix su un `WebSocket` **nudo**, senza libreria (così «zero dipendenze» resta vero — **IPOTESI DI PROGETTO, da verificare nel #143: non l'ho provato**). E il gettone **non sta nell'HTML**: un endpoint nuovo (`/api/stanza`) conia un **JWT a vita breve, valido per quella partita sola**, firmato lato server col segreto del progetto, e le policy di Realtime Authorization su `realtime.messages` lasciano nel canale solo i due partecipanti. Così «nessuna chiave nell'HTML» resta **letteralmente** vero, e RLS non diventa un buco nelle sei tabelle: diventa una policy su una tabella diversa.
Costi veri: un segreto nuovo nell'ambiente, un endpoint nuovo, e una dipendenza da una funzione Supabase che il progetto non ha mai usato. Rischio: la latenza del relay è **due gambe** attraverso la regione Supabase — ed è precisamente il numero che il #143 deve misurare **prima** che qualcuno scriva il client.
Nota da non riscrivere più senza data: «niente WebSocket su Vercel» è **superata** (esiste `experimental_upgradeWebSocket`), ma vedi (4).

**(3) WebRTC DataChannel P2P. — È il tetto, e il suo tasso di successo È parte della misura.**
Latenza minima (una gamba sola). La segnalazione è una manciata di messaggi, ed è l'unico mestiere per cui il polling di oggi è giusto. Costi: `RTCPeerConnection` entra nel gioco (resta zero-dipendenze: è un'API del browser), serve uno STUN, e — il killer — serve un **TURN** per le connessioni che non attraversano. Sulle reti mobili italiane dietro CGNAT il tasso di fallimento è **esattamente l'ignoto**. Quindi: **il tasso di successo con solo STUN non è un'assunzione, è uno dei numeri del #143.** Alto ⇒ il P2P è il miglior trasporto che possiamo avere e cancella la latenza del relay. Basso ⇒ TURN = un sesto servizio e una bolletta, cioè proprio ciò che `rete/LEGGIMI.md:200-210` è stato scritto per evitare.

**(4) `experimental_upgradeWebSocket` su Vercel. — NO.**
Pretende `@vercel/functions` (rompe `rete/package.json:21`), è sperimentale, e comunque **non dà stato condiviso fra due connessioni**: il problema che dovrebbe risolvere resta intero.

> **RACCOMANDAZIONE: (2) come pavimento, (3) come tetto, e la misura decide quale si usa quando.** Realtime broadcast come trasporto che funziona sempre e che porta anche la segnalazione; DataChannel montato in opportunismo quando l'handshake riesce, con ricaduta sul relay che chi gioca non deve nemmeno vedere. È la stessa forma che FC Mobile ha spedito — relay sempre presente, che arbitra le barriere e non simula il calcio — e costa **un canale**.

---

## 3. CHE COSA VA CHIUSO PRIMA

### 3.1 «I tocchi indipendenti dallo schermo» blocca il lockstep?

**Sì, in modo assoluto — e no, non nel modo in cui il progetto se lo immagina. La distinzione è la cosa più utile di questo documento.**

**Quel che blocca** è che oggi un comando **è un pixel**. In lockstep il comando remoto va applicato a una simulazione la cui disposizione il mittente non ha mai visto. Se viaggia un punto in pixel, due telefoni di schermo diverso **giocano due partite diverse** — e questo è già misurato, non ipotizzato: stesso nastro, partita dichiarata 3-4, a 800x360 torna 0-3 e a 1024x460 torna 1-3 (MISURATO al #133, riportato dal dossier). Nell'asincrono ci si può astenere (il giudice lo fa: `schermo-diverso` a `:45647`, `schermo-cambiato` a `:45646`). **Nel live non ci si può astenere: o la partita è identica, o non c'è partita.**

**Quel che NON blocca** è la taglia di quel lavoro, e qui la stima di casa è pessimista di parecchio. Verificato oggi: il movimento è già indipendente dallo schermo (`humanMove` legge solo `dx/dy` con soglie in px assoluti, `:12746-12763`, `:14463`); lo schermo entra in due punti soli dello strato d'ingresso (`touchBtnLayout` a `:13316`, `teamOf` a `:14149`), e **entrambi si risolvono al touchstart in un atto**; e la simulazione non legge mai lo schermo (conteggio statico della lente determinismo fra `:17737` e `~:26000`: zero `VW/VH/SCALE/OX/OY/innerWidth` — **LETTO, non riverificato da me**).

Quindi il prerequisito **non** è «rendere tutto il gioco indipendente dalla risoluzione». È: **trasportare e registrare l'ATTO RISOLTO più il vettore di levetta, invece del punto**. È un formato nuovo e una modifica alle quattro porte — dove l'avvolgimento sta già (`:45852-45901`).

**E il guadagno doppio, che giustifica di farlo subito:** lo stesso cantiere chiude il seguito #133 per la sfida asincrona **e dissolve l'astensione del #139**. Un nastro di atti risolti non si accorge che è comparsa la barra dell'URL: `INCOMPLETO/schermo-cambiato` smette di esistere, e con esso il prezzo dichiarato dal #139 («un nastro con la finestra mossa resta aperto per sempre»). **Un cantiere, due debiti.**

**Due canali della stessa famiglia che muoiono per costruzione con l'atto risolto**, e che ho verificato nel codice pur non trovandoli dichiarati in nessun verbale: `pollice()` (`:13221-13227`, scala 85-150%, spazio 100-140%, mancino) e `insertiSicuri()` (`:13172-13200`, `env(safe-area-inset-*)`, la tacca), entrambi che entrano in `return dentroGliInserti(pollicePosa([...]))` a `:13418`. Se si normalizzasse solo `innerWidth/innerHeight` si chiuderebbe un canale lasciandone aperti due; con l'atto risolto cadono tutti e tre insieme. (E in modalità 2 il mancino è già neutralizzato, `:13324`.)

### 3.2 I prerequisiti VERI, giudicati con severità

| # | prerequisito | perché blocca |
|---|---|---|
| 1 | **Vocabolario semantico dei comandi** | senza, due schermi diversi = due partite diverse |
| 2 | **Il campo «squadra» nel comando** | oggi `teamOf(x)` lo deduce dalla x (`:14149`); in 1v1 non esiste una x condivisa. Stesso cantiere del 1 |
| 3 | **Il cancello di avanzamento in `frame()`** | `if(n===6) acc=0` (`:41157`): oggi il gioco **butta** tempo, il lockstep deve **aspettare**. Muove `MOTORE_V` a 3 |
| 4 | **Il tetto delle 40.000 righe** (`:13827`) | era «aperto, non bloccante». Con **due** flussi di comandi si dimezza, e sei dita ci arrivano in 111 s — dentro una partita al golden goal (MISURATO al #132). Per l'onda E è **BLOCCANTE**. L'atto risolto aiuta: si scrive il vettore solo quando **cambia** |
| 5 | **Lo scarto fra due motori JavaScript** | mai misurato, e nessuno strumento del repo lo vede. È la gamba D del #141: **se le impronte differiscono, tutto il resto è lavoro sprecato** |

### 3.3 I seguiti che NON sono prerequisiti (e che non devono entrare nell'onda)

Dalla lista di `PUNTO-DEL-LAVORO.md:26`: la sfida di carta a 7 e a 11 e il suo giudice (#135), `SAVE.diff` riscritta a 1 da ogni sfida, i due del #136, i tre del #137 (pavimento del mazzo fuori dal database, l'SQL di `rete/` che non gira in nessun banco, le righe a `verificata = 0` che non scadono), i tre del #138 (la staffetta che non parte da sola, PostgREST finto, le quattordici asserzioni senza falso), il resize durante un replay (#139). **Nessuno tocca il percorso live.** Va detto per iscritto, o l'onda si gonfia fino a Nakama.

### 3.4 Due rettifiche documentali da fare prima che qualcuno legga male

- **`_q-determinismo` prova C è inerte** — `__test.dita` non esiste (MISURATO da me: nessuna chiave `dita` nel blocco `window.__test`). Chi apre l'onda E e legge «determinismo 10/10» crederà coperta la gamba dell'INGRESSO, che è coperta altrove e con altri nomi (`_q-duello-impronta` 44/44, `_q-giudice` 21/21, `_q-finestra` 20/20). O si aggiunge `__test.dita` — e al #141 serve comunque un modo di iniettare comandi — o quel commento si rettifica a edizioni. Oggi **promette una misura che non fa**.
- **`strumenti/_q-invarianti.js:425-431` dichiara INV-13 e INV-14 N/A** perché «CALCETTO è locale». INV-14 è **già parzialmente vera**: l'unicità della sottomissione è garantita dal DELETE che consuma l'impegno (`rete/api/sfida.js:163-164`) e il nastro fa da replay. Va rettificata a edizioni prima che qualcuno la citi come «non ci riguarda» (LETTO, non misurato).

---

## 4. IL PIANO DEI CANTIERI

Stime in **compiti**, non in giorni.

**#141 — IL METRO DEL RITARDO** *(la misura che decide)*
Obiettivo: produrre D_gioco con le quattro gambe di §1.2, e le soglie di §1.3 dichiarate **prima** di girare. Nessuna riga di trasporto.
Test che nasce ROSSO: `_q-ritardo.js` nasce rosso **due volte** — a K=0 deve riprodurre il nastro esatto, a K=18 deve mostrare danno. Falsi: `_crit-traslazione-sorda`, `_crit-traslazione-cieca`, `_crit-ritardo-attestatore`.
Dipendenza: **nessuna. Deve essere il primo.** · **6 compiti** (metro deterministico · verbi sotto ritardo · `__test.ritardo` + prova umana in cieco · gamba cross-motore Chromium/WebKit · i falsi · il verbale con le soglie e il verdetto).

**#142 — IL COMANDO SENZA SCHERMO**
Obiettivo: il comando smette di essere un pixel e diventa un atto (squadra, verbo, vettore). Chiude il seguito più grosso del progetto e dissolve `INCOMPLETO/schermo-cambiato`.
Test ROSSO: `_t-142-schermi.js` — lo stesso nastro giudicato a 800x360, 844x390, 915x412, 1280x720 deve dare **lo stesso verdetto e lo stesso punteggio**. Nasce rosso: oggi 800x360 dà 0-3 dove il tabellone dice 3-4.
Dipendenza: #141 (se la misura dice NO questo si fa **lo stesso** — paga il debito del #133 — ma cambia priorità). · **5 compiti**. **`MOTORE_V` → 3.**

**#143 — LA MISURA DELLA RETE E DEL TRASPORTO** *(il secondo NO possibile)*
Obiettivo: D_rete. RTT applicativo p50/p90/p99 e perdita da due telefoni italiani su rete mobile vera; tasso di successo di un DataChannel con solo STUN; latenza aggiunta da un canale Realtime; e la verifica che il protocollo Phoenix si parli con un `WebSocket` nudo (ipotesi di §2.8).
Test ROSSO: `_q-rete-latenza.js` deve **rifiutare un campione troppo corto** e saper dire «questa rete non regge D_gioco». Nasce rosso perché oggi nel repo non c'è un solo numero di RTT.
Dipendenza: #141. · **4 compiti**. **IL BIVIO STA QUI**: se `D_rete(p95) > D_gioco`, si va al §5 e non si scrive una riga di lockstep.

**#144 — LA STANZA** *(appuntamento e segnalazione)*
Obiettivo: due telefoni si trovano con un codice d'invito — il modello è già in casa, la sfida di carta (`:43502-43568`, 79 caratteri, zero conti) — e si scambiano seme, taglia, rose, carattere e il **D** concordato. Nessun conto Google/Apple, nessuna lobby, nessuna presenza, nessuna chat: i confini del committente restano dove sono.
Test ROSSO: `_q-stanza.js` sopra `strumenti/_sfida-due-telefoni.js` (l'impianto a due contesti di browser esiste già). · Dipendenza: #143. · **4 compiti**.

**#145 — IL FILO** *(trasporto, e il riproduttore alimentato dal filo)*
Obiettivo: `Reg` prende il modo 3; ritardo fisso D; ridondanza degli ultimi K comandi; il cancello di avanzamento in `frame()`.
Test ROSSO: `_q-lockstep.js` — due contesti, stesso seme, comandi incrociati, **impronta identica a fine partita**; più `_crit-lockstep-solitario`, che avanza senza aspettare il peer e **deve** divergere.
Dipendenza: #142 + #144. · **6 compiti**. (Attenzione alle due trappole già pagate, che un banco a due pagine riapre entrambe: `startMatch` PRIMA e `setCpuVsCpu` DOPO — qui in modalità 2 non serve, ma `_q-cpu-ordine` guarda lo stesso — e il service worker che **ignora la query string**.)

**#146 — IL GUASTO** *(perdita, stallo, abbandono, rientro)*
Obiettivo: il degrado di §2.6, con la rettifica a `rete/LEGGIMI.md:170-172`.
Test ROSSO: `_q-caos.js` — perdita 0-15%, jitter 0-150 ms, blackout di 5 s, disconnessione **dentro a un duello**: zero divergenze, resa corretta, e il nastro troncato dev'essere **giudicabile** dal giudice di casa. · Dipendenza: #145. · **5 compiti**. E `_q-duello-impronta` (44/44) si rilancia a **ogni** compito, come da #131 in poi.

**#147 — IL VOLTO** *(che cosa vede chi gioca)*
Obiettivo: §6. · Dipendenza: #146. · **4 compiti**.

---

## 5. IL BIVIO ONESTO — che cosa comporta il server autoritativo

### 5.1 Il mandato non è disponibile a questo progetto, e dirlo non è pessimismo

La §10 è server-autoritativa in ogni riga e dice «no rollback» (`_analisi/MANDATO-STADIUM-ROAR.md:414`, `:436`, LETTO), ma presuppone un SimCore in fixed-point Q20.12 con flussi PRNG separati, dentro una flotta di server Godot headless. CALCETTO non ha niente di tutto ciò, e la mappa lo scrive già: «per un canvas 2D con determinismo a seme già misurato, questo è sovradimensionato… conviene tradurre l'IDEA e non la MECCANICA» (`_analisi/MAPPA-MANDATO.md:498`, LETTO). Importare snapshot a 20 Hz e quantizzazione a 1 cm in un gioco che scambia quattro byte a fotogramma sarebbe **arredare il problema sbagliato**.

### 5.2 La forma vera, e il suo prezzo

L'unica forma **non divergente** di server autoritativo in questa casa è: il server fa girare **lo stesso motore**, cioè il file HTML dentro un browser headless. Non è un'idea: è già quel che fa `strumenti/staffetta.js`, e la ragione è scritta lì (`:23-32`: «una funzione Vercel non ha un browser, e il giudice È il gioco») e in `rete/LEGGIMI.md:76-79` («un secondo motore scritto in Node divergerebbe per costruzione e toglierebbe punti a innocenti»). **Chi propone l'arbitro in Node non riapre un cantiere: ribalta una decisione scritta**, e deve affrontare quella riga.

Quindi il server autoritativo è una **flotta di browser**, una scheda per partita, 30-60 simulazioni al secondo per partita, su macchine che non sono funzioni Vercel. Il prezzo, in chiaro:

- un host **sempre acceso** (VPS o servizio a container), un gestore di processi, uno strato di socket, sorveglianza;
- una **bolletta che non è più zero**, e un **sesto servizio** in un'architettura costruita apposta per evitarlo (`rete/LEGGIMI.md:200-210`);
- e — la conseguenza che nessuno nomina — nell'istante in cui esiste un host sempre acceso, la postura «zero permessi, zero conti, nessuna chiave nell'HTML» va **riesaminata tutta**, non solo scavalcata in un punto;
- i cancelli che il mandato stesso mette su questo ramo (M9: 1.000 partite concorrenti con **p99 tick ≤ 4 ms**, `MANDATO:606`) sono scritti per un SimCore in fixed-point. Un canvas in Chromium headless non li rispetta, e scrivere il contrario sarebbe esattamente il genere di numero che non va trascritto da nessuna parte.

La stima del mandato («6+ giorni, cambia l'architettura, non la irrobustisce», `MAPPA-MANDATO.md:485-489`) è **la stima giusta e va creduta**.

### 5.3 Che cosa sopravvive a un NO (ed è tanto: l'onda non è una scommessa)

Sopravvive a entrambi i rami, intero: il determinismo (`SEME` a `:8736`, `DECO` a `:8782`, `MOTORE_V` a `:13639`), il nastro (`Reg` e i suoi undici tipi di riga), **il giudice dentro il file** (`giudica`, `:45651`) coi cinque verdetti e le nove cause di `vagliaNastro` (`:45555`), tutto il lavoro sui cinque canali del #132, l'astensione del #139, e **il comando semantico del #142**. Ogni pezzo serve a tutti e due i rami. L'unico lavoro che un NO butterebbe è il filo del #145 — e la stanza del #144 sopravvive comunque, perché anche un 1v1 asincrono ha bisogno di un appuntamento.

### 5.4 La terza via, che il NO rende obbligatorio considerare prima del VPS

**Il 1v1 a turni, in tempo quasi reale.** Il duello ha già il suo orologio (`Duel.nDuello`/`Duel.passo`, `:22892`) e tre verbi già semantici (`:13955-13965`), e un duello sono **pochi scambi**, non sessanta al secondo. Una sfida 1v1 fatta di rigori, punizioni e uno-contro-uno **sta dentro l'architettura di oggi**: nessun servizio nuovo, nessuna chiave, nessun buco in RLS, nessun lockstep. Non è il gioco che il committente ha chiesto; è il gioco che l'infrastruttura che abbiamo sa davvero consegnare se la misura dice no. **Merita di stare sul tavolo prima del VPS**, non dopo.

---

## 6. CHE COSA RENDE L'ONDA E BELLA, E NON SOLO CORRETTA

### L'idea forte: il ritardo non si nasconde, si mette in scena — **il respiro**

Ogni netcode nasconde il ritardo e si scusa. Questo lo rende **un oggetto diegetico**: i 100-200 ms di ritardo d'ingresso diventano **il tempo del pensiero**.

Concretamente: quando dai un comando, il giocatore comandato non parte di scatto — **prende fiato**. Una piccolissima anticipazione (il piede che si pianta, il peso che si sposta) che dura **esattamente D tick** e **finisce sul tick in cui il comando esegue**. Il ritardo non si sente come lag: si sente come **peso**. Tre proprietà, tutte verificate, lo rendono onesto e quasi gratuito:

1. **È sola presentazione**, quindi INV-12 regge: l'anticipazione si disegna, la simulazione non si tocca. Il lockstep non rischia niente.
2. **È già pagata**: la cosmetica gira su `DECO`, PRNG separato con stato proprio che non legge né scrive `SEME` né `Math.random` (`:8782-8791`). Qualunque quantità di animazione cosmetica **non consuma un solo sorteggio di gioco**. È una proprietà che la cura #129 ha comprato e che nessuno ha ancora speso.
3. **Degrada magnificamente**: quando il peer è in ritardo e la simulazione deve fermarsi (§2.5), l'anticipazione semplicemente **tiene** — il giocatore resta in appoggio, la folla continua a respirare, la telecamera resta viva, e non compare nessuna rotella. Il congelamento **sembra un fiato trattenuto**. È la differenza fra «il gioco si è bloccato» e «sta per succedere qualcosa».

### Due idee di appoggio, entrambe dentro i vincoli

**Il nastro è già il ricordo.** Alla fine della partita **tutti e due i telefoni tengono un nastro completo e giudicabile**. Quindi il live produce gratis la cosa che l'asincrono sa già mostrare: un replay che il giudice verifica e l'altro si rivede. Niente da costruire. E la classifica degli amici esiste già **senza un conto** (`const Amici` a `:43873`, con `_crit-amici-rete.js` che condanna chi la mandasse al server). **Il live 1v1 diventa la cosa che riempie la tabella degli amici, non una funzione a parte.**

**Il duello come momento condiviso.** L'unico istante in cui due persone agiscono insieme, deliberatamente, in pochi scambi, è il duello (`:22892`). È **il momento meno sensibile alla latenza** (pochi comandi, già semantici, già nel nastro) e il più drammatico. Allora i 90 secondi si disegnano perché **finiscano lì**: golden goal, poi lo shoot-out — esattamente la forma che il mandato dà a Ranked Street (`MANDATO:138-148`). La parte di partita dove la rete può fare più male (il gioco aperto) è corta; la parte che decide è quella che il trasporto regge meglio. **È una scelta d'architettura travestita da scelta di design**, ed è il genere di allineamento che fa sembrare una cosa *fatta* invece che *assemblata*.

**E una piccola, onesta.** L'indicatore di connessione non è un numero di millisecondi. È **lo stesso oggetto del respiro**: quando la rete è brutta, il fiato è più lungo. Un oggetto, due significati, zero interfaccia nuova.

---

## APPENDICE — le cinque cose che questo progetto si rifiuta di scrivere

1. **«Il mandato chiede N ms di ping.»** Non lo chiede: dà meccanismi, non soglie (`MANDATO:444`). Chi lo scrive sta inventando.
2. **«FC Mobile usa N fotogrammi di ritardo.»** La tavola di configurazione nel binario è chiave→hash **senza valori** (LETTO dalla lente fcm): nessuna cifra di netcode è ricavabile da `fcm-estratto/`. I 6 fotogrammi di `rete/LEGGIMI.md:168` sono una scelta **nostra**, da difendere con una misura nostra.
3. **«Nascondiamo il seme fino a fine partita»**, come fa il mandato (`:410`). In lockstep il seme **deve** essere noto a tutti e due prima del fischio, e la mappa vieta esplicitamente di importare quella regola: «romperebbe il modello dell'impegno già collaudato» (`MAPPA-MANDATO.md:494`).
4. **«Play Integrity / App Attest.»** Escluse per scelta dichiarata, in conflitto con «zero permessi Android» (`MAPPA-MANDATO.md:495`). E un live con lobby rischia di rimettere dentro di straforo un sistema di conti: la classifica amici è stata costruita **senza** (#136), e l'onda E tiene lo stesso vincolo.
5. **«Il determinismo pieno vale solo a taglia 5.»** `CLAUDE.md` righe 61-62 lo dice ancora ed è **superato dal 20 settembre** (cura #129: `_q-determinismo` 10/10 a taglia 7 e 11 — LETTO da `MANUALE.md:2429-2431`). Non è corretto nel file per mandato esplicito del committente (`MANUALE.md:2328-2331`). Chi progetta l'onda E leggendo solo `CLAUDE.md` si mette un vincolo che non c'è più — e, peggio, crede aperto un problema chiuso mentre resta aperto quello vero: **lo schermo, il pollice, la tacca e il motore JavaScript.**