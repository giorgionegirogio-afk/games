# LA SFIDA DAL DISCHETTO — progetto (voce #146)

**24 settembre 2026.** Merge-base `5038eee`, ramo `voce-146-sfida-dal-dischetto`.
Cuore dell'ONDA E **nella forma che la misura le ha assegnato**, non in quella
che il progetto d'onda teneva come primo ramo.

---

## 0. PERCHÉ QUESTA FORMA — la catena delle misure, in sei righe

Il committente aveva posto la regola: «lockstep prima; il server autoritativo
SOLO SE la misura dice che il lockstep non basta». La misura ha parlato quattro
volte, e questo cantiere è la conseguenza, non una preferenza.

| voce | misura | conseguenza |
|---|---|---|
| **#141** | `D_gioco`: la curva del danno è un **gradino** — da 50 a 300 ms si paga lo stesso, il gioco tollera **18 tick** di ritardo d'ingresso e nessun verbo muore | la soglia che decide è `D_rete ≤ 18 tick` |
| **#143** | i **tre motori JS vedono la stessa partita** (`_q-motori` verde) | il determinismo regge fra macchine diverse |
| **#144** | l'**atto risolto** al posto del pixel: schermo, pollice e tacca non spostano più la partita. `MOTORE_V` = **4** | due telefoni diversi giocano la stessa partita |
| **#145** | `D_rete`: **NO al lockstep continuo a 60 Hz** — non per la mediana (67 ms) ma per **la coda**, 3,7-5,5× la mediana **e a raffica** (il **78,4%** dei pacchetti in coda ne ha un altro in coda subito prima: è il blocco in testa alla fila di TCP, quindi **la ridondanza non aiuta**). A D=18 tick la partita si fermerebbe **9-17 volte al minuto** contro una soglia di **meno di una** | il lockstep continuo è morto, con un fattore nove di margine |

E la derivazione che sceglie *questo* cantiere e non il VPS: **il danno da
stallo scala con la FREQUENZA del canale** — `600 invii/min × P(coda)`. Dieci
scambi per duello danno **0,017 stalli per duello** invece di 9-17 al minuto.
Il server autoritativo, invece, **non risolve il problema misurato**: non
toglie la coda, la tollera in un altro modo (estrapolazione o riavvolgimento),
e il gioco non ha né l'una né l'altro — si comprerebbe la parte cara senza
comprare la cura (`_analisi/MISURA-RETE-145.md` §5.3).

Il progetto d'architettura l'aveva già indicata come la forma che
l'infrastruttura sa davvero consegnare (`2026-09-23-onda-e-architettura.md`
§5.4 e §6). Questo documento la costruisce.

---

## 1. LA FORMA DEL GIOCO

**Non «una partita di calcio in rete»: una sfida di duelli fra due persone.**

### 1.1 Che cosa si gioca

Una **serie di rigori** fra due telefoni. Cinque tiri per parte, poi a
oltranza. A ogni tiro **tutti e due agiscono**: uno tira, l'altro para, e al
tiro dopo i ruoli si scambiano.

Non è un modo nuovo da inventare: è **lo shoot-out che il gioco già sa fare**
(`avviaRigori` `:19910`, `programmaRigore` `:19916`, `esitoRigore` `:19932`,
stato in `G.rigori = {seg, tiri, turno}`), portato fra due telefoni.

### 1.2 I verbi, che esistono già e sono già semantici

Il duello (`const Duel` `:23546`) ha **tre sole porte**, e dalla voce #131
sono già righe di nastro di tipo 6 con `u`,`v` in millesimi:

| verbo | firma | riga | che cosa decide |
|---|---|---|---|
| `Duel.pickZone(z,u,v)` | zona 0/1/2 + mira normalizzata | `:23718` | dove tira |
| `Duel.stopPower()` | rilascio della carica | `:23755` | con quanta forza (`powerQ`) |
| `Duel.pickKeeper(z)` | terzo di porta | `:23746` | dove si tuffa il portiere |

`Duel.resolve()` (`:23771`) li combina in `'gol' | 'parata' | 'fuori'`.
**Non c'è un formato da inventare, e non c'è simulazione da toccare.**

### 1.3 L'orologio, che esiste già

`Duel.nDuello` / `Duel.passo` (`:23608`, voce #131) sono la coppia che rende
il dischetto rigiocabile: `nDuello` è l'ordinale del duello nel nastro,
`passo` quanti `Duel.update` sono compiuti dentro *questo* duello. Serve
perché la catena `esitoRigore → programmaRigore → startFreeKick` gira **dentro
`Duel.update`** e non nel `step()`, quindi il tick non basta a ordinarla.

**Il duello ha già il suo orologio: la sfida dal dischetto ci si appoggia e non
ne conia un altro.**

### 1.4 Perché è il momento giusto per la rete

Tre ragioni, tutte misurate e non estetiche:

1. **pochi scambi, non sessanta al secondo** — è il caso migliore per una coda
   a raffica (§0);
2. **è già nel nastro** — il tipo 6 registra i tre verbi con la mira al
   millesimo, quindi il ricordo e il giudizio sono già pagati;
3. **è il più drammatico** — mezzo secondo fra il tiro e il tuffo non è un
   blocco: è il momento. Il ritardo non si nasconde, **si mette in scena**
   (progetto d'onda §6).

---

## 2. IL TRASPORTO — che cosa ho scelto, e che cosa resta non misurato

### 2.1 Le tre vie sul tavolo

Il #145 ha censito ciò che esiste **senza servizi nuovi e senza chiavi nel
gioco**:

| via | stato misurato |
|---|---|
| Supabase Realtime | **NON ESISTE**: zero variabili sul progetto Vercel (via API), DNS NXDOMAIN, deployment di produzione **503 `DEPLOYMENT_PAUSED`**. E l'`apikey` sarebbe obbligatoria nell'URL — rompe «nessuna chiave nell'HTML» |
| **WebRTC DataChannel con solo STUN** | **esiste e da qui passa**: 3/3 STUN rispondono, **mappatura indipendente dall'endpoint** (NAT a cono) misurata interrogando più STUN **dallo stesso socket**. **Ma la riuscita su CGNAT mobile italiano NON è misurabile da qui: è la misura S5, dichiarata mancante** |
| **Polling sulle funzioni di oggi** | «morto per il calcio, vivo per un duello»: i freni sono **30-60 richieste al minuto per identità**, il lockstep ne chiedeva 600 (10-20× troppo), **un duello sono pochi scambi** |

### 2.2 LA SCELTA: la cassetta, e il posto dove WebRTC si innesta

**Scelgo il ripiego, e lo scelgo come BASE, non come ripiego** — cioè la via
(b): **la cassetta**, un buca-lettere indicizzato servito dalle funzioni di
oggi, letto a polling. Quattro ragioni, e nessuna è un gusto:

1. **il beneficio di WebRTC è latenza che la misura dice che non serve.**
   0,017 stalli per duello con la coda misurata; e mezzo secondo fra il tiro e
   il tuffo è il momento, non un blocco (§1.4).
2. **il rischio di WebRTC non è misurabile da qui.** La riuscita su CGNAT
   mobile è S5, **dichiarata mancante** dal #145. Costruire un trasporto la
   cui riuscita non si può misurare significherebbe scrivere un numero
   indifendibile — esattamente ciò che questa casa rifiuta.
3. **WebRTC non toglie la cassetta, la somma.** Il segnale (SDP, 1-2 kB) deve
   passare da un punto d'incontro, e quel punto è la cassetta stessa. Quindi
   (a) è sempre **(b) più altro codice**, mai (b) in meno.
4. **la frequenza ci sta nei freni di oggi** (§2.4), quindi non serve alzare
   nessun tetto e non nasce nessun endpoint privilegiato.

**E il degrado non è una caduta da provare: è lo stato di riposo.** La via
scelta *è* già la più degradata delle tre. Quello che va progettato e misurato
non è «la caduta da WebRTC alla cassetta» — è **il comportamento della
cassetta quando la rete fa male**, ed è il compito C4.

### 2.3 La cucitura, perché il posto esista davvero

Il gioco non parla alla cassetta: parla a **`Filo`**, quattro verbi —
`apri(stanza)`, `manda(msg)`, `ritira(da)`, `chiudi()`. Oggi c'è **una sola**
implementazione, `FiloCassetta`. Il banco prova che il duello **non sa** quale
filo ha sotto: lo stesso copione gira su `FiloCassetta` e su un `FiloDiretto`
finto (in-processo, ritardo zero) e deve dare **lo stesso esito, tiro per
tiro**. È la prova che il posto per WebRTC esiste, **senza costruire WebRTC** e
senza dichiarare niente che non sia stato misurato.

### 2.4 Il conto delle richieste, contro i freni veri

Verificato sul codice, non ereditato: `frenato(chiave, tetto, secondi)`
(`rete/lib/comuni.js:136`) chiama `frena(k text, tetto int, secondi int)`
(`rete/schema.sql:269`). I fratelli valgono `('sfl:'+id, 60, 60)`,
`('sfida:'+id, 30, 60)`, `('avv:'+id, 60, 60)`.

La cassetta prende **gli stessi numeri del fratello più largo — `('dis:'+id,
60, 60)` — e nessun privilegio.** Il conto che ci deve stare dentro:

- per tiro, un telefono **imbuca 2 volte** (impegno, rivelazione);
- **ritira solo mentre aspetta**, non mentre sceglie: due finestre d'attesa da
  ~2,5 s a passo 1200 ms ≈ **4 ritiri**;
- un tiro dura ~10 s → **6 richieste / 10 s = 36 al minuto**, contro un tetto
  di 60.

**Il banco misura le richieste al minuto vere e le confronta col tetto**: se il
conto qui sopra fosse ottimista, deve uscire un rosso, non una nota. E se un
429 arriva lo stesso, il gioco **rallenta** (attesa progressiva) e non si
ferma — misurato in C4.

### 2.5 CHE COSA RESTA NON MISURATO — dichiarato qui, non in fondo

1. **S5 — WebRTC su CGNAT mobile italiano.** Non misurabile da questa
   macchina. Non è stato costruito niente che ci si appoggi.
2. **Il backend vero non esiste oggi**: il deployment di `calcetto-rete`
   risponde **503 `DEPLOYMENT_PAUSED`** e non c'è un progetto Supabase
   collegato (#145, cinque verifiche). **Tutte le misure di questo cantiere
   sono contro un server finto in memoria** — esattamente come già fanno
   `_q-sfida.js`, `_sfida-due-telefoni.js` e `rete/prove/tutte.js` per tutta
   la sfida asincrona che vive in questa casa da mesi. Il codice
   dell'endpoint e il suo freno sono scritti e provati; **che il vero server
   si comporti come il finto non è misurato, perché non c'è un vero server.**
3. **La latenza vera fra due telefoni italiani su operatori diversi** resta la
   misura S-prima del #145 §5.2, e non è stata fatta qui.

---

## 3. LA FIDUCIA — il punto duro, costruito coi pezzi di casa

### 3.1 Il problema, detto esatto

Se ognuno risolve il proprio duello sul proprio telefono, **chi parla per
secondo vince sempre**: vede la mossa dell'altro e sceglie di conseguenza. Il
portiere che sa dove tira il tiratore para sempre.

Non è un problema di rete: è un problema di **simultaneità**.

### 3.2 La cura: l'impegno in due tempi, e nessun arbitro acceso

Per ogni tiro `T`, quattro messaggi, due per parte:

1. **IMPEGNO** — ognuno calcola la propria mossa `m` e un nonce `n` (128 bit),
   e imbuca `h = H(T ‖ ruolo ‖ m ‖ n)`. **Nessuno rivela finché non ha
   ricevuto l'impegno dell'altro.**
2. **RIVELAZIONE** — imbuca `m`, `n`, e **l'esito che ha calcolato**.
3. **VERIFICA** — `H(T ‖ ruolo ‖ m ‖ n)` deve ricomporre l'impegno ricevuto.
4. **RISOLUZIONE** — entrambi chiamano le tre porte del `Duel` con gli stessi
   valori. Stesso motore, stesso seme, **stesso esito** (#143, #144).

**Il seme del tiro viene gratis dallo stesso meccanismo:**
`seme_T = mescola(n_A, n_B)`. Nessuno dei due lo controlla, perché nessuno dei
due conosce il nonce dell'altro quando sceglie il proprio. Lo stesso seme
decide anche **chi tira per primo**, quindi non lo sceglie una persona.

### 3.3 Che cosa chi bara NON può più fare — e come si vede

| tentativo | che cosa lo ferma | verdetto |
|---|---|---|
| vedere la mossa dell'altro prima di scegliere | l'impegno è un hash: non rivela niente | impossibile |
| cambiare la propria mossa dopo aver visto | `H` non ricompone | **accusa provata** |
| scegliere un seme favorevole | il seme è a due mani | impossibile |
| dichiarare un esito falso | l'altro lo calcola da sé e i due non coincidono | **astensione**, non accusa |
| mandare due impegni diversi per lo stesso tiro | la cassetta è **a scrittura sola una volta** per `(stanza, tiro, ruolo, tipo)` | rifiutato all'imbuco |
| far giudicare il nastro a un motore compiacente | il nastro porta impegni e rivelazioni: **il giudice li rifà** | vedi §3.5 |

### 3.4 Che cosa chi bara PUÒ ancora fare — e perché non gli conviene

**Sparire dopo aver letto la rivelazione dell'altro senza rivelare la
propria.** È l'unica strada che resta, e va detta in chiaro invece che
nascosta.

Chi lo fa **ha già impegnato**: non può cambiare la mossa, può solo non
giocarla. Quindi non vince quel tiro — **lo annulla**. E qui sta la scelta di
disegno che toglie l'incentivo invece di sorvegliarlo:

> **L'abbandono non è una vittoria di nessuno.** La serie si chiude
> **incompiuta**: zero punti a tutti e due, e il nastro si sigilla lo stesso
> perché è il ricordo.

Assegnare la vittoria a chi resta sarebbe il modo più corto per **far vincere
facendo cadere la rete dell'altro** — ed è lo stesso argomento con cui il #137
ha rifiutato un endpoint che accetta «questa sfida non torna»
(`rete/schema.sql`, sopra `segna_verdetto`). Un abbandono può essere una
galleria: **davanti a un dubbio ci si astiene, non si accusa** — il principio
che regge tutta l'onda D.

### 3.5 Il verdetto differito: chi conferma, e con che cosa

I pezzi esistono tutti e **non se ne costruisce uno nuovo**:

- **il giudice dentro il file** — `giudica(nastro, atteso, opz)` `:46514`, coi
  cinque verdetti `TORNA · NON TORNA · INCOMPLETO · ALTRO MOTORE · NON FINISCE`
  (`rete/lib/verdetto.js:50`), e **solo NON TORNA muove punti**;
- **il vaglio** — `vagliaNastro` `:46351`, porta unica dei rifiuti;
- **l'impronta del motore** — `improntaMotore()` `:14051`, riga di nastro di
  tipo 11 (#142);
- **l'astensione condizionata** — `nastroHaPixel()` `:46314` (#144);
- **la staffetta** — `strumenti/staffetta.js`, che apre il browser giusto e
  **non traduce**: manda la parola, mai un numero.

**Che cosa finisce nel nastro.** Una riga nuova, **tipo 14 — la testimonianza
del dischetto**: `[nTiro, ruolo, h0,h1,h2,h3, mossa…, nonce…]`. Non è un
comando: i comandi restano le righe di tipo 6, che il gioco già scrive. È la
**prova** che la mossa dell'avversario non me la sono inventata io.

**E qui c'è una misura da fare, non una scelta da dichiarare.** Il criterio di
`MOTORE_V` è «una cura cambia l'esito di sequenze di comandi identiche». Una
riga che non è un comando non dovrebbe cambiare nessun esito — **ma "non
dovrebbe" non è un numero.** Perciò il compito C3 misura **nei due versi**,
come ha fatto il #144:

- **verso 1** — nastri del merge-base rigiocati sul curato: devono essere
  identici;
- **verso 2** — nastri del curato (con le righe 14) rigiocati sul gioco di
  ieri: se sono identici, **`MOTORE_V` resta 4 ed è la misura a dirlo**; se
  divergono anche di un campione, **sale a 5**, con la rettifica a edizioni.

Il numero lo decide il banco `_t-146-motorev.js`, non questo documento.

### 3.6 Il telefono rimasto indietro: si ferma PRIMA, non dopo

`MOTORE_V` protegge chi **giudica** un nastro vecchio. Non protegge due
persone che si siedono a giocare con due versioni diverse. Per quello serve
una guardia **all'appuntamento**, non al verdetto:

`DISCHETTO_V = 1`, scambiato al primo messaggio. Versioni diverse → **la
sfida non comincia**, con la parola giusta sullo schermo. È più preciso di
`MOTORE_V` perché si accorge **prima** che qualcuno abbia giocato mezz'ora.

E le **impronte del motore diverse** non fermano l'appuntamento (escluderebbe
accoppiamenti validi: il #143 ha misurato che tre motori JS vedono la stessa
partita), ma **l'esito dichiarato a ogni tiro** le fa emergere subito: due
esiti diversi → la serie si ferma con astensione, non con un'accusa.

---

## 4. L'APPUNTAMENTO — il modello è la sfida di carta (#135)

Un **codice corto**, zero conti, nessuna identità che viaggia. Il codice non è
un nome di persona: **è il nome della cassetta**, e nient'altro.

1. A preme **SFIDA DAL DISCHETTO → CREA**: il gioco conia una stanza di sei
   caratteri dall'alfabeto della carta (`CARTA_ALF`) e la mostra.
2. B la digita: **ENTRA**.
3. I due si scambiano, in un messaggio solo: `DISCHETTO_V`, `MOTORE_V`,
   l'impronta del motore, la **rosa impaccata** (`impaccaRosa`, lo stesso
   imballo della carta) e un **nonce d'appuntamento**.
4. Si concordano **da soli**, senza che nessuno scelga:
   - **seme della serie** = `mescola(nonce_A, nonce_B)`;
   - **chi tira per primo** = un bit dello stesso seme;
   - **taglia = 5**, perché *il determinismo pieno vale a taglia 5* (a 7/11
     `rebuildCrowd` consuma PRNG in proporzione al campo e lo stream slitta —
     voce #98, seguito #129). Non è una semplificazione: è una regola di casa.

**Nessuna chiave, nessun conto.** L'identità resta quella che `/api/entra`
conia da sé e che sta nel salvataggio (`Authorization: Calcetto <id>.<segreto>`,
`:47103`) — la stessa di oggi, e non viaggia niente di nuovo.

**Zero rete all'avvio** resta intatto: la prima richiesta della sfida dal
dischetto parte **quando un dito preme il bottone**, e mai prima.

> **RETTIFICA a una convinzione con cui questo cantiere è partito
> (24 settembre 2026, fonte: lettura di `strumenti/senza-rete.js`,
> `_q-rete.js` e `_q-carta.js`).** «Il cancello `senza-rete` pretende che la
> prima richiesta parta al tocco su SFIDA» **è falso**, e chi lo ripete manda
> qualcuno a leggere il banco sbagliato. `senza-rete.js` blocca ogni richiesta
> con `pag.route('**/*')` e gioca **una partita normale**: non apre mai la
> schermata SFIDA, quindi misura una domanda diversa — «il gioco non chiama
> fuori **in condizioni normali**». La misura vera del giro della sfida vive
> in **`_q-carta.js` gruppo D5** (righe 759-831), ed è fatta bene in un modo
> che va copiato e non reinventato: apre la schermata SFIDA **con la rete già
> bloccata**, prende la **tacca** del contatore *dopo* quell'apertura — perché
> `Sfida.apri()` chiama `/api/entra` **per progetto**, e quella non è una
> colpa — e poi pretende che il contatore **non si muova più** per tutto il
> giro. **Si conta il delta, non il totale.**

Il banco di questo cantiere fa lo stesso: tacca dopo l'apertura della
schermata, e **zero richieste nuove** finché un dito non preme CREA o ENTRA.

---

## 5. IL GUASTO — che cosa vede chi resta

Quattro guasti, e per ognuno **che cosa vede chi resta**, non «che cosa fa il
codice». Tutti e quattro sono misurati in C4.

| guasto | come si inietta nel banco | che cosa vede chi resta |
|---|---|---|
| **l'altro sparisce** | la sua pagina smette di imbucare | attesa dichiarata, poi «L'ALTRO NON RISPONDE» e serie **incompiuta**: zero punti a tutti e due, nastro sigillato lo stesso |
| **un ritiro si perde** | il finto server butta la risposta | **niente**: la cassetta è cumulativa e indicizzata, il ritiro dopo recupera tutto. Nessuna traccia sullo schermo |
| **un imbuco si perde** | il finto server accetta e non scrive | si ritenta; l'imbuco è **idempotente** per `(stanza, tiro, ruolo, tipo)`, quindi il doppione non entra e un imbuco *diverso* viene rifiutato |
| **la rete singhiozza** (429/503/lenta) | il finto server risponde 429, o `stato.su=false` | l'attesa si allarga, la schermata dice «RETE LENTA» / «RETE ASSENTE», **nessun fotogramma si ferma**; se torna, si riprende dall'indice giusto perché l'indice sta sul server |

---

## 6. IL BANCO E I FALSI

### 6.1 Il banco a due telefoni

**L'impianto esiste e non si reinventa**: `strumenti/_sfida-due-telefoni.js`
dà `serviGioco`, `serviServer` (finto server in memoria, con `stato.su` per
spegnerlo), `apri`, `collega` (che punta `__test.reteBase` al finto). Il nuovo
`_q-dischetto.js` li riusa e aggiunge **la cassetta** e **l'iniezione dei
guasti**.

Due contesti di browser separati = due salvataggi, due identità, **due
telefoni**. Le tre porte del duello si chiamano da `pag.evaluate` via
`window.__test.Duel` (`:48285` espone `G, Duel, Tut`), perché in questo banco
`rAF` è zittito e la geometria del mirino non è mai stata disegnata — è
l'idioma già usato dal copione del #132.

### 6.2 I falsi, costruiti nel caso peggiore

**QUINDICI cantieri di fila hanno pagato la lezione**: il #144 ha scoperto che
senza una prova aggiunta il suo banco **promuoveva due falsi su cinque**, e il
#145 ha avuto una sonda che condannava l'intero P2P **misurando il proprio
numero di socket**. Quindi i falsi si costruiscono per vincere, non per
perdere, e **la bite list si riporta misurata**.

| falso | che cosa fa | deve essere |
|---|---|---|
| `_crit-dischetto-veggente` | rivela **dopo** aver letto la rivelazione dell'altro e sceglie la mossa che batte | **MORSO** |
| `_crit-dischetto-bugiardo` | rivela una mossa diversa da quella impegnata | **MORSO** |
| `_crit-dischetto-semesuo` | sceglie il proprio nonce **dopo** aver visto quello dell'altro, per pilotare il seme | **MORSO** |
| `_crit-dischetto-esitosuo` | dichiara un esito diverso da quello che il motore gli dà | **MORSO** (astensione) |
| `_crit-dischetto-muto` | sparisce a metà serie | **MORSO** se il banco dichiarasse una vittoria invece di un'incompiuta |
| `_crit-dischetto-sfrenato` | ritira a raffica e sfonda il freno | **MORSO** |
| `_crit-dischetto-gentile` | **il più cattivo**: non fa il giro degli impegni, risolve tutto in locale e *sembra funzionare* | **MORSO** dalla prova che gli impegni ci sono davvero |

**E il controllo del banco** (lezione del #145): almeno un falso che il banco
**non** morde va cercato e **dichiarato**. Un banco che morde sette su sette
senza aver cercato l'ottavo sta attestando, non misurando.

---

## 7. LE RETI DI SICUREZZA — verdi a ogni compito

`_q-motori`, `_q-casa`, `_q-schermi`, `_q-duello-impronta` (44/44),
`_q-giudice`, `_q-sigillo`, `_q-carta`, `_q-amici`, `_q-sospetto`,
`_q-staffetta`, `_q-finestra`, `_q-glicko`, `_q-motore-nastro`,
`_q-determinismo`, `_q-rete-latenza`, i quattro del #132, `_q-rete`,
`_q-sfida`, `senza-rete`, `salvataggio`, `rete/prove/tutte.js`.

**E la batteria INTERA a ogni compito**, a gruppi (`--solo <lista>`), non i
soli cancelli che il piano del compito nomina: cinque regressioni nel
programma sono state trovate solo così (lezione 22).

---

## 8. LE CINQUE COSE CHE QUESTO PROGETTO SI RIFIUTA DI SCRIVERE

1. **«WebRTC funziona sui telefoni italiani.»** È S5, dichiarata mancante. Non
   c'è una riga di codice che ci si appoggi.
2. **«La cassetta regge il carico vero.»** Il backend è in pausa (503) e non
   c'è un database: tutto è misurato contro un finto.
3. **«Il giudice smaschera chi bara.»** Smaschera **chi rivela una mossa che
   non aveva impegnato**. Chi sparisce non viene smascherato: viene
   **annullato**, ed è una scelta, non una svista (§3.4).
4. **«`MOTORE_V` resta 4»** — prima di averlo misurato nei due versi (§3.5).
5. **«Il polling sta nei freni.»** Il conto di §2.4 è un conto: il banco lo
   misura, e se sfora esce un rosso.
