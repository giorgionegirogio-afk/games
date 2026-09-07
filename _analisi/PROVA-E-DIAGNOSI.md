# Perché la prova E si dichiara nulla (voce #68)

> **EDIZIONE del 7 settembre 2026, sera (dopo il compito 2 del ramo
> voce-85-moviola).** La bisezione ha SMENTITO l'anello che questa diagnosi
> lasciava aperto: `stick[0].ox/oy` da soli sono INERTI (Touch5.start crea
> sempre un'origine fresca); le cause vere della divergenza same-page sono
> `stick.active/id/dx/dy/hist` (diverge al campione 6) e gli atti a tenuta
> orfani `atti`/`btnTouch` (campione 7). La cura vive in `startMatch` via
> `Touch5.azzera()` (commit `8a207e1` + `d48058c`), la voce #68 è CHIUSA.
> RESTA APERTO, come voce #98: una componente NON-Touch5 — il seme
> 20260803 diverge perfino fra due pagine FRESCHE in CPU-contro-CPU a
> taglia 7/11 (8/10 identico prima e dopo la cura). Il riproduttore più
> pulito per chi riaprirà la #98 è quel seme a pagine fresche. Dettagli:
> `MANUALE.md` §A registro voce #85 e `.git/sdd/brief/85-compito-2-report.md`.
> Il testo sotto resta com'era: è la diagnosi PRE-bisezione, storia inclusa.

Diagnosi in sola lettura, 7 settembre 2026. Nessun file di gioco o di banco
è stato modificato; le sonde usa-e-getta vivono in `fuori/` e ci restano.
Verificato per nome/funzione contro il main pulito attuale (dopo la fusione
della voce #100) — i numeri di riga citati sono stati riletti oggi.

## Il banco e la prova

- **Banco**: `strumenti/_q-replay.js` — "LA PARTITA RIGIOCATA E' LA STESSA
  PARTITA?", cinque prove A-E sul multigiocatore/replay.
- **Prova E** (righe 287-362 del file): *"in registrazione il gioco NON
  cambia: la stessa partita giocata col registro acceso e col registro
  spento è la stessa partita"*. Il banco gioca quattro giri sulla **stessa
  pagina** (un riscaldamento scartato, poi spento/acceso/spento) e prima di
  giudicare fa un **controllo del controllo** (`kCtrl`, riga 347): se i due
  giri spenti a cavallo di quello acceso non sono già uguali fra loro,
  dichiara **PROVA NULLA** (codice 3) invece di un rosso — per non accusare
  il gioco di un difetto che è invece del banco.
- Il banco stesso documenta un precedente non chiuso: *"Misurato il 28
  agosto 2026: ... i due spenti divergono al campione 6, mentre
  `strumenti/_diag-campi.js` ... non trova una sola differenza"* — questa è
  la voce #68.

## Il sintomo, riprodotto

Lanciando il banco intero oggi (`node strumenti/_q-replay.js`, uscita
integrale in `fuori/prova-e-uscita.txt`) la prova E **è passata** — 8/8
controlli verdi. La prova E **non fallisce a ogni lancio**: dipende da
condizioni di sessione fragili (vedi sotto). Il sintomo però è reale e
riproducibile al 100% con lo strumento più diretto già presente in
`strumenti/`, `_diag-replay.js`, che isola la stessa domanda con un copione
più corto:

```
2) la stessa pagina, due volte, registro spento:  divergono al campione 8 (passo 80)
3) due pagine diverse, registro spento:           IDENTICHE
7) SENZA dita, due pagine (pietra di paragone):    IDENTICHE
9) azzerando i comandi prima di ogni partita:      IDENTICHE
```

Lanciato cinque volte di seguito, il punto 2 diverge **sempre allo stesso
campione**, con gli stessi numeri: non è rumore, è deterministico dato
"quale numero di esecuzione è, sulla stessa pagina".

## La catena causale, misura per misura

1. **Non è il generatore di casi (`dado()`).** Con sonde usa-e-getta in
   `fuori/_sonda-sorteggi.js` + `fuori/_sonda-sorteggi.html` (copia
   strumentata di `CALCETTO-il-gioco.html` con `dado()` che registra il
   chiamante), il fotogramma in cui due giri "spento" divergono per la
   prima volta **non consuma nessuna chiamata a `dado()`** in nessuno dei
   due giri. Misurato anche il calo dei sorteggi-per-partita su esecuzioni
   successive sulla stessa pagina (750 → 590 → 502 → 200, poi stabile),
   compatibile con più cause concomitanti (confetti/particelle di gol
   gated da `SAVE.moto`, tra l'altro) ma **non** con la causa del primo
   scarto di gioco, che precede qualunque gol.

2. **Non è la CPU-contro-CPU pura.** Lo strumento già esistente
   `strumenti/_zz-caccia-stato.js` (dump profondo fino a 3 livelli di `G` e
   `SAVE`, nessun tocco, solo `setCpuVsCpu(true)`) rigioca due partite sulla
   stessa pagina e non trova **nessuno scarto di gioco** in 102 campioni —
   solo residui cosmetici noti (`G.shakeMag/shakeDX/shakeDY/camPunch`,
   `G.view.*`, `G.goalTeam/bannerCol`). Quindi il difetto è specifico al
   percorso **col dito** (Touch5), non alla simulazione di base — coerente
   con l'intestazione stessa di `_q-replay.js` ("qui si aggiunge il pezzo
   che mancava — le DITA").

3. **Non è la cache dei ruoli/IA.** Con una sonda a fotogramma singolo
   (`fuori/_sonda-primo-scarto2.js`, un solo giro dentro un'unica
   `evaluate()` per restare fedele alla forma del banco vero) ho confrontato
   fotogramma per fotogramma lo stato profondo di **tutti** i giocatori, la
   palla, `G.brain` (il "cervello di squadra" che assegna i ruoli, letto da
   `ruoloDi()`), i bersagli IA (`p.aiTX/aiTY`), `Touch5.stick`,
   `G.particles`, `G.swLock`, `G.ctrl`: tutto **identico al bit** fino al
   fotogramma immediatamente precedente al primo scarto. Il fotogramma
   successivo diverge comunque (velocità, accelerazione, angolo, e un
   verdetto discreto: `p.sprint` passa da `true` a `false`).

4. **Non è rumore di JIT/tempo reale.** Ho rilanciato la stessa sonda con
   Chromium in `--js-flags=--jitless` (nessuna compilazione ottimizzata):
   lo scarto compare allo **stesso identico fotogramma, con gli stessi
   identici valori** al sesto decimale. Non è quindi un artefatto di
   temporizzazione o di livello di ottimizzazione del motore JS: è una
   funzione pura e riproducibile di "che numero di esecuzione è, su questa
   pagina" — cioè c'è uno stato nascosto reale, non rumore.

5. **È lo stato di Touch5 che sopravvive alla partita precedente (misura
   decisiva).** L'esperimento 8 di `_diag-replay.js` fotografa cosa
   sopravvive alla prima partita: `Touch5.stick[0]` passa da
   `{ox:0,oy:0,...}` (pagina fresca) a `{ox:180,oy:300,...}` — cioè
   **l'origine esatta del joystick sintetico del copione** (`LX=180,
   LY=300`, dichiarato sia in `_q-replay.js` che in `_diag-replay.js`), che
   non viene mai riportata a zero. `pend`, `btnTouch` e `atti` risultano
   invece già uguali dopo la partita. L'esperimento 9 chiude il cerchio:
   aggiungendo `Touch5.azzera(); Touch5.pend={}; Touch5.btnTouch={};
   Touch5.atti={};` prima di ogni esecuzione (oltre al reset già fatto dal
   banco), le due partite **tornano identiche**. Rilanciato oggi sul main
   pulito post voce #100: stesso risultato, byte per byte.

   **Anello ancora aperto, dichiarato come ipotesi**: ho letto per intero
   `Touch5.azzera()` (riga 13520 di `CALCETTO-il-gioco.html`, verificata
   oggi) e NON azzera `stick[t].ox/oy` — per scelta esplicita e motivata nel
   commento ("SI TIENE L'ORIGINE... ricentrare la levetta al ritorno
   sembrava la scelta prudente ma è sbagliata", per non perdere il gesto di
   chi torna dal secondo piano con il pollice ancora premuto). Azzera invece
   `active/id/dx/dy/hist` e prepara `s.riadotta`. La prova 9 funziona quindi
   per l'effetto combinato di `azzera()` **più** lo svuotamento manuale di
   `pend`/`btnTouch`/`atti` che scarta anche ciò che `azzera()` aveva appena
   preparato per la riadozione. Non ho isolato sperimentalmente se il
   meccanismo esatto sia `ox/oy` stesso o la prenotazione di riadozione che
   li porta con sé: la prossima misura da fare, prima di scrivere una cura,
   è ripetere l'esperimento 9 con i tre azzeramenti attivati uno alla volta.

   Questo spiega anche perché la caccia del 28 agosto non si chiuse:
   `_diag-campi.js`, lo strumento usato allora, fotografa solo
   `G.players`/`G.ball`/`G`/`Touch5.stick[]` "com'è" in quel momento — ma
   il campo che conta (`ox/oy`) è proprio quello che quello strumento non
   segnala come sospetto perché non lo confronta contro un secondo scarto
   di controllo mirato; il banco vero e proprio (`_q-replay.js`) non
   fotografa affatto Touch5.

6. **Come si propaga nel gioco** (osservazione di supporto, non
   indispensabile alla diagnosi ma utile a chi ripara): nella catena
   `aiMove()` → velocità bersaglio `spd`, la velocità dipende da `p.sprint`,
   deciso da `aiVuoleSprint(p)`; l'accelerazione finale è una miscela fra il
   vecchio `p.ax/ay` e il nuovo bersaglio (righe intorno a `wax=(ix*spd-p.vx)*...`
   nella funzione di movimento fisico, verificate oggi). Un `p.sprint` che
   si ribalta fra le due esecuzioni spiega l'ampiezza dello scarto misurato
   in accelerazione. Non ho isolato con misura diretta il singolo confronto
   che fa scattare `p.sprint` diversamente: resta anch'esso ipotesi aperta,
   subordinata al punto 5.

## Classificazione: GIOCO (con un tappo economico lato banco)

Non è un banco cieco che chiede una scena impossibile: due pagine fresche
danno sempre partite identiche (misure 3 e 7), quindi la domanda della
prova E — "a parità di tutto il resto, registrare cambia la partita?" — è
legittima e l'unico modo di isolarla è tenere ferma la pagina fra un giro e
l'altro, come il banco fa. Il difetto è che **`startMatch()` non azzera
tutto ciò che dovrebbe per garantire "stesso seme + stessi comandi ⇒ stessa
partita" quando una nuova partita nasce su una pagina già usata**. Il
progetto ha già riconosciuto e chiuso esattamente questa classe di bug il
31 agosto 2026 (i "cinque cronometri fratelli": `G.possOwner`, `G.possT`,
`G.pulse`, `G.crowdSndT`, `G.recT`, azzerati dentro `startMatch`, righe
10733-10800 di `CALCETTO-il-gioco.html`, verificate oggi) — quella toppa
semplicemente non copriva il sottosistema del tocco (`Touch5`), che vive
fuori da `G` e da `SAVE`. Questa è quindi un'istanza non ancora chiusa
della stessa famiglia, non un difetto nuovo di specie.

Ha anche un riflesso reale fuori dal banco: chiunque rigiochi una sfida a
seme fisso due volte sulla stessa pagina — un "Rivincita" ravvicinato, o un
verificatore automatico di replay che controlla più partite senza
ricaricare — rischia la stessa divergenza silenziosa che la prova E ha
segnalato onestamente invece di ignorarla.

## La cura proposta (non applicata)

**Immediata, lato banco** (costo: minuti, nessun rischio sul gioco):
in `_q-replay.js` (dentro `PARTENZA`, accanto a `Reg.azzeraComandi()`) e
nell'analogo reset di `_diag-replay2.js`/`_diag-campi.js`, aggiungere lo
svuotamento di `Touch5` prima di ogni giro:
`Touch5.azzera(); Touch5.pend={}; Touch5.btnTouch={}; Touch5.atti={};` —
verificato empiricamente (esperimento 9) che basta a rendere la prova E
misurabile in modo affidabile, senza toccare il gioco.

**Di fondo, lato gioco** (costo: mezza giornata, richiede la misura di
bisezione ancora aperta al punto 5 prima di scrivere una riga): dare a
`startMatch()` un azzeramento dedicato dello stato di Touch5 che
sopravvive fra partite (l'origine `ox/oy` della levetta e/o la prenotazione
di riadozione), **senza** toccare il comportamento di pausa/ripresa
dell'app che `Touch5.azzera()` esiste apposta per proteggere — quindi non
un semplice richiamo di `Touch5.azzera()` da `startMatch`, ma una funzione
nuova e più stretta, tarata sulla bisezione dei tre azzeramenti dell'
esperimento 9. Questa è la cura che chiude la voce #68 alla radice e
protegge anche il caso reale (rivincita/verifica ravvicinata), non solo il
banco.
