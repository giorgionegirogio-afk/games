# Il metro — che cosa fa un gioco da vetrina, misurato sulle immagini vere

Questo documento non è un'opinione: è ricavato guardando le schermate che gli
studi stessi mettono in vetrina sullo store. Le immagini sono nelle cartelle
qui accanto. **Guardale prima di dare qualunque voto.**

A che serve: **calibrare**. A che *non* serve: copiare. Niente marchi, nomi,
stemmi, divise o disegni altrui entra nel nostro gioco, che deve restare
originale e vendibile. Questo materiale resta in locale e non va nel repository.

---

## Chi è nella cartella e perché

| cartella | che cos'è | perché è lì |
|---|---|---|
| `fifa-mobile/` | il metro indicato dal committente | il capo della categoria, 3D con licenze |
| `soccer-stars/` | calcio dall'alto a pedine | **il concorrente più vicino a noi**: stessa inquadratura |
| `head-ball-2/` | arcade veloce | rifinitura alta su un gioco semplice |
| `8-ball-pool/` | biliardo | non è calcio: è lì per la cura dell'interfaccia |

---

## Il divario vero, in ordine di quanto pesa

### 1. Saturazione e materia — è il primo colpo d'occhio

Soccer Stars ha un **verde acceso e saturo**, strisce di taglio nettissime,
linee bianche piene. Il nostro campo è verde scuro e desaturato: sembra una
fotografia notturna sottoesposta accanto a un manifesto.

Ma attenzione, e qui c'è una trappola già pagata: schiarire il manto e basta
ha spento le maglie e mandato il contrasto sotto 3:1. **La saturazione si alza
sul manto tenendo le divise ancora più sature**, non schiarendo tutto.

Ogni oggetto, in tutti e quattro i riferimenti, ha:
- un **bordo illuminato** dal lato della luce e uno scuro dall'altro (biselli);
- una **ombra portata** vera, non un alone;
- un **alone di stacco** attorno a ciò che conta (in Soccer Stars la pedina
  attiva ha un anello ciano che la solleva dal campo).

Il nostro gioco ha ombre sotto i giocatori, ma nessun bisello, nessun bordo
illuminato, nessun alone di stacco. Sono tre tecniche, tutte a costo quasi zero
su canvas.

### 2. Un oggetto-eroe per schermata

La schermata del tabellone di FIFA Mobile è viola piatto, righe tutte uguali —
e in mezzo **un trofeo in cromo e oro con i riflessi**, illuminato da un faro,
che occupa un quinto dello schermo. È l'unica cosa ricca della pagina, e regge
tutto il resto.

Le nostre schermate di servizio non hanno un oggetto-eroe: sono elenchi. Ogni
schermata importante ne merita uno — una coppa, un pallone, una maglia appesa,
un cartello del campetto — disegnato meglio di tutto il resto.

### 3. Una tinta dominante e UN accento

FIFA Mobile: tutto viola, e un solo verde acceso per il pulsante che conta e
per la squadra che ha vinto. Nient'altro in tutta la schermata usa quel verde.

Da noi il lime e il rosa delle divise ricompaiono ovunque — nei menu, nei
bordi, nei titoli — e quando ricompaiono non vogliono dire più niente.
**Regola da adottare: le due tinte delle divise sono riservate alle divise e a
ciò che le rappresenta. L'accento che dice "premi qui" è una terza tinta e non
compare mai per decorazione.**

### 4. Densità: meno cose, più grandi

Contate sulle immagini: la schermata del tabellone di FIFA Mobile ha sedici
righe e nient'altro. Soccer Stars in partita ha punteggio, due avatar, due
livelli, un contatore di monete. Basta.

I nostri schermi di gioco portano contemporaneamente punteggio, cronometro,
possesso, falli, minimappa, tutorial, pulsante pausa, pulsante audio. **Ogni
elemento che togliamo fa sembrare più curati quelli che restano.**

### 5. Il movimento — dove siamo più indietro di tutto

Questo NON si vede nelle schermate di vetrina: si vede con
`node strumenti/striscia.js`. Misurato sul nostro gioco: in dieci fotogrammi
consecutivi (0,72 s) le figure sono **identiche a sé stesse, solo spostate**.
Nessun passo, nessuna inclinazione in curva, nessuna carica prima del tiro.

Le quattro cose che mancano, e che sono il confine fra dilettante e mestiere:

- **anticipo** — il gesto si prepara prima di partire;
- **peso** — si accelera e si decelera, non si va a velocità costante;
- **seguito** — il gesto finisce invece di spegnersi di colpo;
- **deformazione** — schiacciamento e allungamento su passo, impatto, parata.

---

## Dove invece siamo già avanti, e va difeso

Detto onestamente, guardando i riferimenti: il nostro campo ha **erba con
trama e usura, folla di sagome sulle gradinate, reti sulle porte, cartelloni
delle botteghe**. Soccer Stars ha un campo piatto con una texture ripetuta e
due striscioni. Su *materia del campo* siamo già più ricchi.

Il problema non è che il nostro gioco è povero: è che è **spento e fermo**.
Saturazione, stacco, e movimento sono le tre leve. Non serve rifare tutto.

---

## La decisione sugli strumenti di animazione — presa, e perché

Ho valutato le strade percorribili:

- **Rive** — motore open source, ma serve il suo editor (servizio a pagamento,
  usabile solo da una persona) e porta con sé un runtime WebAssembly di
  centinaia di kB. Rompe il file unico, che è anche il nostro argomento di
  vendita.
- **Lottie** — famoso e con licenza permissiva, ma le animazioni si creano in
  After Effects. Un agente non può usare After Effects.
- **Spine** — licenza a pagamento. Fuori discussione per un prodotto da vendere.
- **Librerie di interpolazione** — utili per animare proprietà del DOM; il
  nostro gioco disegna su canvas con un ciclo proprio. Aggiungerebbero peso
  senza risolvere il problema, che non è *interpolare*, è *avere uno scheletro*.

**Decisione: lo scheletro procedurale si scrive dentro il file.** Bacino,
busto, due gambe e due braccia come punti mossi da funzioni di fase, più una
manciata di curve di attenuazione. Sono cinque-dieci kB di codice, zero
dipendenze, funziona offline, e — la cosa che decide — **un agente lo può
scrivere e modificare**, mentre un file di animazione fatto in un editor no.

Non è un ripiego: per figure che sullo schermo sono alte trenta pixel, è anche
tecnicamente la scelta giusta.

---

## Come si misura, adesso

| strumento | che domanda risponde |
|---|---|
| `scatta.js` | com'è composta la schermata (25 scene ripetibili) |
| `confronta.js` | che cosa è cambiato davvero, prima accanto a dopo |
| `striscia.js` | **il movimento ha anticipo, peso, seguito, deformazione?** |
| `filmato.js` | com'è a velocità vera (per una persona, non per un agente) |
| `misura.js` | numeri sul movimento: la velocità è a gradini o ha una curva? |
| `prestazione.js` | **regge a CPU rallentata?** Sotto i 16 ms per fotogramma |
| `collaudo.js` | non si è rotto niente (contrasto, tabellino, portiere) |
| `senza-rete.js` | non scarica niente da nessuno |
| `giocata.js` | **com'è toccare la palla?** Gesti touch veri, latenza e risposta in numeri |
