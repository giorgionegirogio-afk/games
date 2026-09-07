# La moviola fluida — piano di esecuzione (voce #85, con #68 e #98 a bordo)

> **Per chi esegue:** SOTTO-SKILL RICHIESTA: usare `superpowers:subagent-driven-development` (consigliata) oppure `superpowers:executing-plans` per eseguire il piano un compito alla volta. I passi usano caselle (`- [ ]`) per il tracciamento.

**Obiettivo:** la moviola smette di andare a scatti (i cronometri dei gesti si interpolano e i cinque campi di posa mancanti entrano nel campione), la prova E torna a dare un verdetto vero, e il determinismo fra partite sulla stessa pagina si cura alla radice — misurando se questo chiude anche la voce #98.

**Architettura:** nessun cambio al formato del nastro delle sfide né alla finestra (9 s / `REC_HZ` 20, decisione 2). Tre cure indipendenti e TUTTE identiche al bit nei percorsi CPU-contro-CPU: l'azzeramento dello stato residuo di `Touch5` in `startMatch` (il tocco nasce solo da dita umane), la registrazione dei cinque campi (osservazione pura), l'interpolazione nel disegno (`disegnaMoviola`). Il banco della moviola nasce PRIMA delle cure e le condanna.

**Tecnologia:** un solo file HTML (`CALCETTO-il-gioco.html`), banchi in `strumenti/*.js` con Node e Playwright, attrezzi a àncore (`_t-*.js`) applicati con `--dentro`.

## Vincoli globali

- **Questo ramo NON dichiara divergenze**: ogni compito prova l'identità al bit col confronto due-versioni (`_c3-sorteggi --a base --b curato --taglie 5,7,11`); una divergenza qualunque è un difetto del compito. `_q-determinismo` (taglia 5) resta 10/10 a ogni compito.
- Ogni modifica al gioco passa da un **attrezzo a àncore** con `cerca`/`metti` esatti e conteggi `attesi`; si cerca per nome, mai per riga (i `file:riga` qui sotto sono delle analisi del 7 settembre, da riverificare col grep).
- Ogni prova nuova deve **saper condannare** prima di essere creduta (rossa sul gioco pre-cura, lasciando la copia in `fuori/`).
- **Lezione dei letterali di boot** (voce #86 c5): `startMatch` e `setTaglia` hanno guardie che al primo avvio non mordono — ogni azzeramento nuovo va verificato anche sul primo avvio della pagina.
- Commenti nel codice senza lettere accentate; documenti con gli accenti veri. Un commit per compito, col verbale nel messaggio.
- **Le fonti tecniche sono le analisi committate**: `_analisi/MOVIOLA-OGGI.md` (struttura del campione, `disegnaMoviola`, l'elenco esatto dei cronometri copiati di peso e dei cinque campi assenti, la sonda `fuori/_sonda-moviola-scatti.js` col seme 20260907) e `_analisi/PROVA-E-DIAGNOSI.md` (il banco `_q-replay.js`, la prova E righe ~287-362, la catena causale su `Touch5.stick`, le sonde di bisezione in `fuori/`). Ogni compito le legge PRIMA di scrivere àncore.

## Soglie di accettazione (dallo spec, vincolanti)

1. Scatto: nessun cronometro di gesto bit-identico per ≥3 fotogrammi di schermo consecutivi mentre la posizione avanza (oggi 4-5), a seme dichiarato.
2. I cinque campi (`contrasto, presaT, gkManiT, rinvT, recover`) registrati e ripristinati, verificati su una scena che li esercita.
3. Prova E: verdetto vero (mai più NULLA), verde.
4. Determinismo: taglia 5 10/10 sempre; a 7 e 11 SI MISURA dopo la cura Touch5 e l'esito si dichiara (verdi → #98 chiusa; rossi → #98 ridimensionata con la componente residua).
5. Zero divergenze di sorteggi in tutto il ramo.
6. L'occhio umano: sequenza di fotogrammi della moviola prima/dopo in `fuori/`, guardata e descritta.

---

### Compito 1: Il banco della moviola nasce rosso

**File:**
- Modificare: `strumenti/_q-replay.js` (due prove nuove; la prova E NON si tocca qui)
- Nessun cambio al gioco.

**Interfacce:**
- Consuma: la logica della sonda `fuori/_sonda-moviola-scatti.js` (cattura la moviola fotogramma per fotogramma), promossa a prova di banco; il seme dichiarato 20260907.
- Produce: prova «SCATTO» — durante il replay di un gol, per ogni giocatore in quadro, il massimo numero di fotogrammi di schermo consecutivi con TUTTI i cronometri di gesto bit-identici MENTRE la posizione dello stesso corpo avanza (>0,2 unità/fotogramma): verde se <3, rosso altrimenti, col valore misurato nel dettaglio. Prova «CAMPI» — il campione della moviola contiene i cinque campi e almeno uno di essi VARIA durante una scena che li esercita (leggere il campione da `G.rec` via `__test`; la scena: un contrasto o una presa del portiere prodotti a seme fisso — le analisi dicono come). Entrambe con la disciplina «non ho misurato» (uscita 2) se la scena non si costruisce.

- [ ] **Passo 1**: leggere `_analisi/MOVIOLA-OGGI.md` §2-3 e la sonda; rileggere `_q-replay.js` per capire dove vivono le prove esistenti e il loro stile.
- [ ] **Passo 2**: scrivere le due prove; lanciare il banco sul gioco di oggi: SCATTO rossa (4-5 fotogrammi congelati), CAMPI rossa (campi assenti dal campione). Salvare l'uscita nel rapporto: è la condanna. Le altre prove del banco restano al loro esito di oggi (compresa la E NULLA: si cura al compito 2).
- [ ] **Passo 3**: `_q-determinismo` 10/10 (il banco non tocca il gioco, ma va provato che il banco stesso sia ripetibile: due corse consecutive stessi numeri — ATTENZIONE alla diagnosi della prova E: sulla stessa pagina lo stato Touch5 residuo può sporcare la seconda corsa; se le tue prove usano tocchi sintetici, azzera Touch5 fra i giri DENTRO il banco come tappo dichiarato, finché il compito 2 non cura la radice).
- [ ] **Passo 4**: commit — `git commit -m "Il banco della moviola nasce rosso: lo scatto e i campi assenti hanno un giudice (voce #85, compito 1)"`

---

### Compito 2: La cura Touch5 — il determinismo fra le partite, e la prova E torna a parlare

**File:**
- Creare: `strumenti/_t-touch5-azzera.js`
- Modificare: `CALCETTO-il-gioco.html` — `startMatch` (azzeramento dello stato residuo di Touch5)

**Interfacce:**
- Consuma: `_analisi/PROVA-E-DIAGNOSI.md` (la catena causale: `Touch5.stick[0].ox/oy` sopravvive; le sonde di bisezione in `fuori/` per trovare TUTTI i campi residui, non solo il primo); `Touch5.azzera()` se esiste già come funzione di casa.
- Produce: `startMatch` azzera lo stato Touch5 residuo (stick, pend, btnTouch, atti — il perimetro esatto lo decide la bisezione COMPLETATA, non l'intuito), con la cautela dichiarata su pausa/ripresa (il ri-ingresso da pausa NON passa da startMatch: verificare che l'azzeramento non rompa la riadozione del dito — leggere come pausa/ripresa reggono il Touch5 vivo).

- [ ] **Passo 1**: completare la bisezione (le sonde sono in `fuori/`): QUALI campi esatti di Touch5 causano la divergenza fra due partite sulla stessa pagina. Verbale con la lista e la misura per ciascuno.
- [ ] **Passo 2**: attrezzo con l'azzeramento in `startMatch` (àncora per nome; commento con la storia: stessa famiglia della toppa del 31 agosto sui cronometri, estesa al tocco su diagnosi della prova E — senza accentate).
- [ ] **Passo 3**: cancelli — `_q-determinismo` 10/10 a taglia 5; **`--taglia 7` e `--taglia 11`: MISURARE e dichiarare l'esito** (è la soglia 4 dello spec: se verdi, la #98 si chiude qui); la prova E di `_q-replay` da NULLA a VERDETTO VERO e verde; due-versioni 0 divergenze a 5/7/11 (CPU-contro-CPU non usa Touch5); il primo avvio di pagina intatto (lezione dei letterali: il gioco carica e la prima partita è identica al bit — coperta dal due-versioni, ma va detto nel rapporto); una verifica esplicita di pausa/ripresa (manuale via sonda: pausa a metà partita con dito sintetico giù, ripresa, il dito continua a governare — descritta nel rapporto).
- [ ] **Passo 4**: se il tappo provvisorio del compito 1 nel banco è diventato inutile, RIMUOVERLO nello stesso commit (la cura vera lo sostituisce; un tappo che resta nasconde regressioni future).
- [ ] **Passo 5**: commit — `git commit -m "Il tocco non sopravvive piu' alla partita: la prova E torna a parlare (voce #85, compito 2)"`

---

### Compito 3: I cinque campi entrano nel campione

**File:**
- Creare: `strumenti/_t-campione-pose.js`
- Modificare: `CALCETTO-il-gioco.html` — la scrittura del campione (dove `G.rec` registra i giocatori) e la lettura in `disegnaMoviola` (ripristino dei campi)

**Interfacce:**
- Consuma: `_analisi/MOVIOLA-OGGI.md` (la struttura esatta del campione e il punto di scrittura, ~`:34270-34283` di allora; i cinque campi: `contrasto, presaT, gkManiT, rinvT, recover`).
- Produce: i cinque campi registrati per giocatore a ogni campione e COPIATI (non interpolati: qui si registra e si ripristina; l'interpolazione è del compito 4) nel corpo disegnato dalla moviola.

- [ ] **Passo 1**: attrezzo (àncora sulla scrittura del campione e sul ripristino); attenzione al PESO: cinque numeri × giocatori × 20 Hz × 9 s — dichiarare nel rapporto quanto cresce il buffer (stima aritmetica, es. 5×22×180 numeri) e perché è accettabile.
- [ ] **Passo 2**: cancelli — la prova CAMPI del banco diventa VERDE; SCATTO resta rossa (compito 4); `_q-determinismo` 10/10; due-versioni 0 divergenze (registrare è osservazione pura); `_q-precedenza` 9/9.
- [ ] **Passo 3**: commit — `git commit -m "Il contrasto e la parata entrano nel campione: la moviola smette di inventare le pose (voce #85, compito 3)"`

---

### Compito 4: L'interpolazione dei cronometri, con le guardie sui riavvii

**File:**
- Creare: `strumenti/_t-moviola-blend.js`
- Modificare: `CALCETTO-il-gioco.html` — `disegnaMoviola` (i cronometri copiati di peso diventano interpolati con guardia)

**Interfacce:**
- Consuma: `_analisi/MOVIOLA-OGGI.md` (l'elenco esatto: `kickT/kickB/charge/chargeT/slide/dive/rove/roveT1` copiati a ~`:34436-34444` di allora, accanto ai campi GIÀ interpolati ~`:34426-34435` — il modello c'è già in casa, due righe sopra).
- Produce: per ogni cronometro, interpolazione lineare fra campione e successivo CON GUARDIA sul riavvio: se il valore del campione successivo è minore del precedente (il gesto è ripartito o finito), si usa il valore del campione più vicino senza blend — un calcio non si spalma attraverso il proprio riavvio. Stessa guardia per i cinque campi nuovi del compito 3 dove ha senso (i cronometri sì, le bandiere no — decidere campo per campo e dichiararlo in commento).

- [ ] **Passo 1**: attrezzo; il commento spiega la guardia con l'esempio del riavvio.
- [ ] **Passo 2**: cancelli — la prova SCATTO diventa VERDE (<3 fotogrammi congelati, col valore misurato); prova E resta verde; `_q-determinismo` 10/10; due-versioni 0 divergenze (disegno puro); `_q-precedenza` 9/9.
- [ ] **Passo 3**: **l'occhio umano** — con la sonda di `fuori/` cattura 8-10 fotogrammi della moviola dello stesso gol (seme 20260907) prima e dopo la cura (la copia pre-cura in `fuori/` c'è dal confronto due-versioni), salvali come immagini in `fuori/moviola-prima-*.png` e `fuori/moviola-dopo-*.png`, GUARDALI e descrivi nel rapporto la differenza sul gesto (il calcio che prima congelava e ora scorre).
- [ ] **Passo 4**: commit — `git commit -m "I gesti scorrono anche in moviola: l'interpolazione impara a non spalmare i riavvii (voce #85, compito 4)"`

---

### Compito 5: La batteria, il verbale, il registro

**File:**
- Modificare: `MANUALE.md` (voce #85 CURATA; voce #68 CHIUSA; voce #98 aggiornata con l'esito MISURATO del compito 2), `PUNTO-DEL-LAVORO.md` (giornata del 7 settembre; i seguiti aggiornati), `strumenti/tutti.js` SOLO SE il banco del replay non è già in batteria (verificare: `grep -n "replay" strumenti/tutti.js`).

- [ ] **Passo 1**: batteria intera in spezzoni (i quattro comandi di casa, letti da `.git/sdd/brief/compito-8-brief.md` della voce #88, col banco `proporzioni` già dentro dall'ultimo ramo e `replay` se è in batteria): tutti i cancelli che contano verdi; se `prestazione` è rosso in batteria, rimisurarlo da solo.
- [ ] **Passo 2**: sorteggi — `_q-determinismo` 10/10 (e la rimisura a 7/11 citata dal compito 2); il due-versioni complessivo del ramo (base = merge-base con main): **0 divergenze attese a tutte le taglie** — questo ramo è il primo che chiude senza dichiararne.
- [ ] **Passo 3**: verbale — ogni numero con la prova accanto: lo scatto prima/dopo (4-5 → <3), i cinque campi, la prova E (NULLA → verde), l'esito del determinismo a 7/11 con la conseguenza sulla #98, il peso nuovo del buffer.
- [ ] **Passo 4**: commit — `git commit -m "La moviola fluida: gesti interpolati, pose vere, e la prova E che torna a parlare (voce #85)"`

---

## Autoverifica del piano (fatta scrivendolo)

- **Copertura dello spec:** soglia 1 → compiti 1+4; soglia 2 → 1+3; soglia 3 → 2; soglia 4 → 2 (misura dichiarata) + 5 (verbale); soglia 5 → ogni compito (due-versioni); soglia 6 → 4 Passo 3. Decisione 2 (finestra/REC_HZ invariati) → nessun compito la tocca, vincolo dichiarato.
- **Ordine motivato:** il banco prima delle cure (condanna), Touch5 prima dei campi/blend (il banco a tocchi sintetici ha bisogno di pagine deterministiche; il tappo provvisorio del compito 1 è dichiarato e viene rimosso al compito 2).
- **Coerenza dei nomi:** prove «SCATTO»/«CAMPI», attrezzi `_t-touch5-azzera`/`_t-campione-pose`/`_t-moviola-blend`, campi `contrasto/presaT/gkManiT/rinvT/recover` — usati identici nei compiti 1-5.
