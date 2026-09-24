# CALCETTO — Il manuale

*Scritto il 31 agosto 2026. Non è una brochure: ogni riga viene dal codice del
gioco, censito voce per voce da undici lettori indipendenti (269 funzioni ed
elementi, 171 id, 532 letture), e ogni affermazione su «che cosa fa un tasto»
è stata verificata sul gestore che lo ascolta, non sul suo nome. In fondo c'è
l'appendice delle incoerenze trovate durante il censimento: quelle curate il
giorno stesso e quelle a registro.*

---

## 1. Il primo avvio

All'apertura compare la schermata **DOPOLAVORO FC PRESENTA · CALCETTO** con la
scritta «tocca per entrare». Si entra toccando un punto qualsiasi — oppure si
aspetta: dopo 2,6 secondi il menu compare da solo. Non c'è registrazione, non
c'è account, non si chiede niente: si è già dentro.

Alla prima partita in singolo parte da solo il **tutorial**: tre passi
(«TIENI il tasto TIRA», «Mentre tieni TIRA trascina: miri in porta»,
«Trascina dal tasto CAMBIO: un compagno pressa»), che avanzano quando il gesto
riesce o dopo tre secondi l'uno. Si salta con **SALTA**, e finisce da solo al
primo gol di chiunque. Attenzione: una volta chiuso non è rigiocabile — l'unica
via per rivederlo è AZZERA TUTTI I DATI (che cancella tutto).

## 2. Il menu principale

Sette voci, più tre oggetti fissi:

| voce | che cosa apre |
|---|---|
| **GIOCA** *(amichevole · 1 o 2 giocatori)* | la schermata dell'amichevole |
| **STAGIONE** *(campionato a 8 · 14 giornate)* | il campionato |
| **TORNEO** *(tabellone a 8 · montepremi)* | l'eliminazione diretta |
| **SFIDA** *(contro la squadra di un altro)* | la modalità in rete |
| **SPOGLIATOIO** *(squadra · rosa · campi)* | nome, divise, giocatori, campi |
| **BACHECA** *(trofei e statistiche)* | obiettivi, albo d'oro, carriera |
| **NEGOZIO** *(la bacheca del campetto)* | gli sblocchi a monete |

- **⚙ (in alto a destra)**: apre IMPOSTAZIONI (preferenze, come si gioca,
  crediti). Sparisce durante la partita.
- **Pillola «N MONETE»**: il saldo, sempre aggiornato.
- **La lavagnetta appesa**: l'ultimo risultato giocato (0:0 da nuovi).
- Dietro i pannelli, il campetto gioca da solo: è scenografia.

Gli **avvisi a comparsa** (trofeo sbloccato, campo sbloccato, dati azzerati,
esiti di rete…) appaiono in alto a destra e spariscono da soli dopo tre
secondi: non si toccano.

## 3. GIOCA — l'amichevole

Sei scelte, poi si scende in campo:

- **Difficoltà CPU** — Facile / Normale / Duro. Governa velocità, reazione,
  rubata, potenza e portiere della macchina. Resta salvata come predefinita.
- **Rosa (la taglia)** — **5 contro 5** (la gabbia), **7 contro 7** (il
  campetto), **11 contro 11** (il campo grande). Cambia campo, porta, modulo,
  e anche la **durata**: i 90″ di base diventano 126″ a 7 e 180″ a 11.
  *La taglia scelta vale anche per Torneo e Stagione.*
- **Sponde** (voce #87) — **LA GABBIA** (di serie a 5/7: le fasce e il fondo
  rimbalzano come sempre, nessuna rimessa) o **IL CAMPO VERO** (rimesse
  laterali, calci d'angolo e rinvii dal fondo, con un fermo breve e la
  battuta comandata coi verbi di casa — PASSA/CROSS/FILTRANTE). **A 11 la
  riga si blocca su CAMPO VERO**: sul campo grande le rimesse sono
  obbligatorie, non una scelta. *La scelta vale anche per Torneo e
  Stagione* (in ogni partita, `startMatch` fotografa la scelta salvata in
  `G.campoVero` a inizio partita). **Non vale per le SFIDE**: a 5/7 una
  sfida gioca sempre LA GABBIA, qualunque cosa dica questa riga sul tuo
  telefono — è la stessa gabbia su ogni telefono che gioca, e il verbale
  della sfida regge solo se il motore che l'ha giocata è identico su
  entrambi i lati (seguito #105: portare le sponde nel nastro, per sfide
  a campo vero a 5/7).
- **Mentalità** — Difesa (blocco basso e stretto) / Equilibrio / Attacco
  (linea alta e larga). È la postura della TUA squadra; si può cambiare anche
  in partita, dalla pausa.
- **Campo** — mostra il campetto in uso; **CAMBIA CAMPO** apre la schermata
  dei sette campetti da sbloccare (l'Oratorio è di serie).
- **1 GIOCATORE** avvia contro la CPU. **2 GIOCATORI** divide lo schermo a
  metà: chi sta a sinistra comanda la squadra di casa, chi sta a destra la
  ROSA; ognuno ha la sua levetta e la sua colonna di dischi.
  *(In 2 giocatori l'opzione «mano sinistra» non si applica: i lati sono già
  tutti e due occupati. E la mentalità regolabile è solo quella di sinistra.)*

## 4. In partita — i comandi sul vetro

**La levetta** (pollice sinistro, o destro col mancino): si appoggia il dito
su un punto qualsiasi dell'erba e si trascina. Zona morta 12 px, corsa piena a
46; oltre 70 l'origine insegue il dito. Alzare il dito dalla levetta **non fa
mai partire niente**: il rilascio è inerte per costruzione.

**I cinque dischi** (pollice destro, in basso). Ogni disco ha **due facce**:
una col pallone, una senza. La faccia giusta si accende da sola.

| disco | col pallone | senza pallone |
|---|---|---|
| **grande** | **TIRA** — tieni e la carica cresce; lascia dentro l'arco ambra (0,50-0,80 s) per il **tiro perfetto**; mentre tieni, trascina su/giù per mirare (la tacca compare sulla porta) e trascina in SU oltre 66 px per il **pallonetto** (dalla loro metà campo). Tap secco = pizzata. A 1,25 s il tiro parte da solo. | **CONTRASTA** — tocco = contrasto in piedi (piede teso); tieni premuto = **contieni** (jockey); trascina e lascia = **scivolata mirata** dove punta il dito. |
| **medio** | **FILTRANTE** — tieni e trascina verso un compagno: la linea ciano mostra il passaggio, il compagno **parte in corsa**; lascia e la palla è tesa sulla sua corsa. Trascina oltre 66 px e il passaggio si **alza** sopra le teste. Senza trascinamento è l'appoggio sicuro. | **CAMBIO** — tocco = passa al compagno indicato dalla levetta; tieni e trascina verso un compagno = **RADDOPPIO** (lo mandi a pressare il portatore). |
| **piccolo alto** | **PASSA** — tocco e basta: appoggio al più smarcato, ai piedi. | **PRESSA** — tocco: il compagno migliore va a raddoppiare sul portatore. |
| **piccolo esterno** | **CROSS** — tocco: traversone alto verso il secondo palo, con un compagno chiamato sotto (arco di anteprima). Dalla propria metà campo è il lancio lungo. | **SCIVOLATA** — tocco: la scivolata di sempre, mirata sul pallone. |
| **quinto** | **SCUDO** — tienilo con la levetta ferma e il pallone al piede: il corpo si mette fra avversario e pallone (consuma fiato). | **SCATTO** — tienilo mentre spingi la levetta: +34% di velocità, consuma fiato. La pista della levetta si accende d'ambra. |

**Lo strappo (la finta)** — col pallone al piede, inverti di colpo la levetta
passando per il centro: di lato è uno **scarto**, all'indietro una **suola**.
Per un quinto di secondo il pallone non è di nessuno. (Solo con la levetta:
la tastiera non ha un centro da attraversare.)

**Ripensarci** — trascina il dito lontano dal disco (oltre 96 px) e alza:
l'atto muore, non parte niente. Con FILTRANTE il compagno chiamato continua
la corsa: è l'uno-due senza palla.

**Cose che il gioco fa da solo:** il comandato passa automaticamente al
compagno più vicino al pallone (il cambio manuale lo blocca per ¾ di
secondo); se il contesto cambia col dito ancora giù (ti rubano palla a metà
carica) il disco si ri-arma sul verbo nuovo senza eseguire; una notifica o
una chiamata alzano tutte le dita senza far partire calci; quando un verbo
non si può fare compare per un attimo il **segno rosso di divieto** sotto i
piedi.

**Gli aiuti visivi:** la linea di tiro (ambra = lascia adesso, gesso = fuori
tempo), l'arco del pallonetto e del cross, la linea del passaggio, l'anello
di carica attorno al corpo e sul bordo del disco, la tacca di mira sulla
porta, l'anello ambra con freccia sotto il TUO uomo, l'anello di gesso con
pozza dorata sotto chi ha palla, il cuneo **PORTA** sul bordo quando la porta
che attacchi è fuori quadro, la targhetta col nome del comandato (che diventa
freccia sul bordo se esce dall'inquadratura), la minimappa in basso (sparisce
quando il campo si vede quasi intero o quando il pallone le passa sopra), e
il pannello rosso «UN UOMO IN MENO PER n″» durante le espulsioni.

**La tastiera** (sul computer):

| | P1 | P2 |
|---|---|---|
| muovi | W A S D | frecce |
| passa | C | N |
| tira (con carica) | X | M |
| filtrante | E *(con Shift: cross)* | , *(virgola)* |
| scivolata | Z | B |
| cambio uomo | Q | / |
| scatto / scudo | Shift sinistro | Shift destro |
| pausa / indietro | ESC | ESC |

## 5. La pausa

Si apre con **❚❚** (in alto a sinistra), con ESC o col tasto Indietro del
telefono. Congela davvero la partita. Dentro: le statistiche oneste (possesso
solo dopo 3 secondi di gioco, falli solo se ce ne sono), la riga dei comandi
con il collegamento **cambia** (apre COMANDI SUL VETRO senza perdere la
partita), e quattro voci: **RIPRENDI**, **AUDIO**, **MENTALITÀ** (cicla
Difesa/Equilibrio/Attacco a partita in corso), **ABBANDONA** (butta la
partita e torna al menu: non viene contata, e in torneo/stagione il turno
resta da giocare).

**EDIZIONE DEL 21 SETTEMBRE 2026 (voce #132, compito 1), su MENTALITÀ.** In
una SFIDA il cambio a partita in corso **entra nel nastro** (riga di tipo 8):
chi rivedrà la partita vedrà la squadra cambiare postura nello stesso istante
in cui l'hai cambiata tu. Prima non ci entrava, e la partita rigiocata finiva
con un altro punteggio — misurato, una sfida su due. E **durante un replay la
voce è spenta**: la squadra in campo è quella di chi ti ha attaccato, e la sua
postura la decide il nastro, non il tuo pollice.

Quando l'app va in secondo piano, la partita **si mette in pausa da sola** e
il salvataggio si scrive. Col telefono in verticale compare **RUOTA IL
TELEFONO** e il gioco aspetta.

## 6. Il duello dal dischetto

Si entra in tre modi: fallo da scivolata in zona calda, terzo fallo di
squadra («TERZO FALLO: SI TIRA!»), o la serie di **rigori** quando il golden
goal non basta.

- **Tiratore col dito**: appoggia il dito sulla porta e compare il mirino;
  trascinalo nell'angolo e **alza il dito** per confermare. Più miri
  all'incrocio, più il mirino diventa rosso: la banda del tempismo si
  stringe e un tiro fuori tempo si accentra verso il portiere. Poi la
  **barra**: tocca ovunque per fermare il cursore dentro la finestra ambra
  (dentro = tiro perfetto).
- **Tiratore da tastiera**: A/S/D (o W per il centro; P2 con le frecce)
  sceglie il terzo di porta, senza mira fine e con banda fissa: il duello
  semplice, per chi non può mirare un punto.
- **Portiere umano**: da tastiera scegli il terzo in ogni momento; col dito
  aspetta «IL PORTIERE SI PREPARA…» e tocca il lato del tuffo (hai ~3
  secondi, poi il tuffo parte da solo).
- ESC durante il duello non fa nulla: dal dischetto non si scappa.

## 7. Fine partita

Sul pareggio ai 90″ scatta il **golden goal** (il prossimo gol vince); dopo
40 secondi senza reti, **si decide dal dischetto**. Una partita giocata non
finisce mai in pareggio.

Il tabellino: il momento della partita (gol decisivo con volto e minuto, o
la serie di rigori, o le parate a reti inviolate), il possesso, i marcatori
(autoreti dichiarate), e i numeri — tiri, nello specchio, precisione, tiri
perfetti, al volo, pallonetti, parate, scivolate pulite, falli, cartellini,
espulsioni temporanee, acciacchi, cambi.

La **lavagnetta delle monete**: partita giocata +10, vittoria +25, gol +5
l'uno, porta imbattuta +6, tiri perfetti +4, rubate pulite +3; in stagione
vittoria di campionato +35; in torneo il premio del turno (+40/+80/+250);
più le righe dei trofei sbloccati. Il conto che vedi è il conto che incassi.

**RIVINCITA** rigioca la stessa partita; dopo un torneo diventa TABELLONE,
in stagione CLASSIFICA, dopo una sfida ALTRA SFIDA. **MENU** torna alla home.

## 8. Le regole del campetto

- **Le sponde** (scelta in GIOCA, voce #87): **LA GABBIA** tiene il pallone
  sempre in gioco — niente rimesse, niente angoli, la palla rimbalza e si
  continua (di serie a 5/7). **IL CAMPO VERO** — obbligatorio a 11, a scelta
  a 5/7 — ferma il gioco quando il pallone esce: rimessa laterale (fermo
  ~0,8 s) se esce dalla fascia, calcio d'angolo (fermo 1,2 s a 5, 1,5 s a
  7/11) o rinvio dal fondo (fermo ~0,8 s) se esce dietro la linea di porta,
  a seconda di chi l'ha toccata per ultimo. Il battitore è comandato coi
  verbi di casa (PASSA/CROSS/FILTRANTE, TIRA spento finché non batte);
  senza tocco, la battuta parte da sola entro pochi secondi. Vale per
  amichevole, TORNEO e STAGIONE (la scelta salvata sul telefono); le
  SFIDE fanno eccezione — a 5/7 giocano sempre LA GABBIA, per costruzione
  identica su ogni telefono (voce #87, §3 e §11).
- Il **portiere** è un giocatore vero: esce sulla bisettrice, para per
  contatto, e i suoi esiti si vedono (PRESA!, PUGNI!, RESPINTA!, SFUGGE!).
- **Cartellini**: fallo da dietro o in ritardo = giallo; al secondo della
  stessa squadra un uomo esce per **12 secondi** (come nel futsal).
- **Acciacchi e cambi**: chi si fa male rallenta e la panchina lo cambia.
- La squadra **pensa**: ultimo uomo prudente, contropiede, e negli ultimi 15
  secondi chi perde manda tutti su.

## 9. TORNEO

Otto squadre di quartiere, eliminazione diretta: quarti (CPU facile, +40),
semifinale (normale, +80), finale (dura, +250). **NUOVO TORNEO** sorteggia il
tabellone; **GIOCA** avvia il turno contro l'avversaria indicata (che porta
in campo nome, colori, forza e mentalità propri). Le altre sfide del turno si
simulano da sole. Perdere chiude il torneo (si può solo risorteggiare);
vincere la finale mette la riga nell'**albo d'oro**, paga il trofeo RE DEL
QUARTIERE e mostra «HAI VINTO IL TORNEO!». Il torneo in corso resta salvato
anche chiudendo il gioco.

## 10. STAGIONE

Campionato a 8 squadre, andata e ritorno: **14 giornate**, tre punti a
vittoria. **NUOVA STAGIONE** sorteggia il calendario; **GIOCA LA GIORNATA**
avvia la partita (la difficoltà la impone la forza dell'avversaria — e non
tocca la tua preferenza); le altre tre partite si simulano. La classifica ha
le colonne vere (G V N P GF GS DR Pt) e la tua riga evidenziata.
**RISULTATI DELL'ULTIMA GIORNATA** rimostra le quattro partite appena
giocate. Chi chiude primo prende il **Titolo di campione** (+600), il
secondo e il terzo il **podio** (+200).

## 11. SFIDA — la modalità in rete

L'unica parte del gioco che tocca la rete, e **solo quando la apri tu**: il
resto funziona per sempre offline. Niente account: la prima volta con la
rete accesa il gioco si crea da solo un'identità anonima (un numero, non un
nome).

- **CERCA AVVERSARIO**: il server ti dà la squadra di un'altra persona (che
  non deve essere online) e un seme unico: si gioca UNA partita normale — a
  difficoltà e durata fisse di serie, con la postura dell'avversario ricavata
  da come gioca davvero («l'indole») — e a fine partita l'esito parte da solo
  verso il server. Se manca la rete, resta in coda e riparte al prossimo giro.
  **A 5/7 la sfida gioca sempre LA GABBIA** (a 11 il campo vero è comunque
  obbligatorio), a prescindere dalla tua scelta di SPONDE in GIOCA: due
  telefoni con SPONDE diverse devono rigiocare la stessa sfida sullo
  stesso motore, o il verbale del replay non torna (voce #87, correzione
  della revisione finale; seguito **#105** per portare le sponde nel
  nastro).
- **LE SFIDE CHE HAI SUBITO**: chi ti ha attaccato, con che risultato, e il
  bottone **GUARDA** — rivedi la partita **mossa per mossa**, perché ogni
  sfida viaggia col nastro dei comandi: quello che guardi è quello che è
  successo. (I replay non pagano monete e non fanno crescere nessuno.)
  **EDIZIONE DEL 21 SETTEMBRE 2026 (voce #132, compito 4).** GUARDA adesso
  sa dire di no in due casi in più, e lo dice in chiaro invece di mostrarti
  una partita inventata: quando il nastro è **vuoto** (non porta nemmeno un
  comando) e quando la partita ha prodotto **più comandi di quanti il nastro
  ne tenga** e il nastro si è fermato a metà. Prima passavano tutti e due, e
  la riga di stato dava la colpa alla rosa cresciuta di chi ti aveva
  attaccato — che non c'entrava niente. Il risultato, in tutti e due i casi,
  resta quello scritto nell'elenco: si perde il film, non il punto.
- **SFIDA DI CARTA** — *edizione del 22 settembre 2026, voce #135*. È
  l'unica voce di questa schermata che **funziona senza rete**: un codice
  di **79 caratteri** che contiene tutta la partita — seme, taglia, le due
  rose, le due posture, l'avversario e il punteggio da battere. **CREA UNA
  SFIDA** apre una partita a 5 contro 5 contro una squadra di quartiere
  pescata dal seme; al fischio finale il codice nasce col tuo punteggio
  dentro, si copia e si manda in un messaggio (ci sta in un SMS). Chi lo
  riceve lo incolla e gioca **la stessa identica partita** — stesso campo,
  stessa squadra, stesso avversario — e alla fine il gioco dice se ha
  fatto meglio (prima la differenza reti, poi i gol fatti). Una sfida di
  carta **non paga e non fa crescere nessuno**: in campo non c'è la tua
  squadra, c'è quella del codice.
  **DUE COSE DICHIARATE.** (1) *Non è un controllo*: il codice porta la
  partita, non la prova — chi lo riceve può dire il punteggio che vuole e
  nessuno può smentirlo, perché un nastro dei comandi non sta in un
  messaggio. È un gioco fra due persone che si fidano; per un risultato
  verificato c'è CERCA AVVERSARIO, che ha il giudice. (2) *Non è il codice
  del CAMBIO TELEFONO*: quello si tiene per sé, perché chi lo incolla
  diventa la tua squadra. I due codici non si possono confondere in nessuno
  dei due versi — quello della sfida comincia per `CARTA` e non ha punti
  dentro — e se incolli il codice del cambio telefono nel campo della
  sfida, il gioco te lo dice con quelle parole.
- **CLASSIFICA** — *edizione del 22 settembre 2026, voce #136*. Adesso le
  classifiche in questa schermata sono **due**, e la prima non ha bisogno
  di nessuno.
  **I TUOI TESTA A TESTA** stanno in cima e funzionano **senza rete**: una
  riga per amico, con le vinte, i pari, le perse, i gol, e i punti a destra
  (tre per una vinta, uno per un pari). Si riempie **dai codici che tornano
  indietro**. Quando giochi una SFIDA DI CARTA che hai *ricevuto*, al
  fischio finale il gioco ti dà un codice corto — comincia per `ESITO` ed è
  lungo **21 caratteri**, si detta anche al telefono — da rimandare a chi
  te l'ha mandata: dentro ci sono il seme della partita e i due punteggi, e
  **niente altro**. Chi lo riceve lo incolla nel campo della SFIDA DI
  CARTA, scrive con che nome segnarti, e la riga compare anche da lui.
  Dall'altra parte non serve aspettare niente: chi ha *ricevuto* la sfida i
  due punteggi li ha già tutti e due, scrive il nome e segna subito. **Il
  nome dell'amico resta sul tuo telefono** e non finisce in nessun codice:
  è per questo che questa classifica non ha bisogno né di un conto né di un
  server. Lo stesso codice incollato due volte **conta una volta sola**, e
  se qualcuno prova a rimandarti un punteggio tuo diverso da quello che hai
  fatto, vince quello che il tuo telefono si ricorda (e te lo dice). La
  lista tiene **20 amici**: quando ne arriva uno nuovo esce il più vecchio,
  e la riga sotto il campo lo dice per nome.
  **LA CLASSIFICA DI RETE** sta sotto ed è quella di prima: i primi 100 e
  la tua riga anche se sei più giù. Senza campo, al posto suo compare la
  riga che spiega perché — ma i testa a testa si vedono lo stesso.
- **CAMBIO TELEFONO**: il tuo codice di trasferimento (id + segreto). Va
  copiato e conservato: *se perdi il telefono, perdi la squadra* — il server
  non sa chi sei. Sull'altro telefono si incolla il codice in USA IL CODICE:
  da quel momento è quel telefono a essere quella squadra (passano punti,
  posto e sfide subite; nome e rosa restano quelli locali).
- Se qualcosa non va, la riga di stato lo dice in chiaro: serve campo, il
  server è lento, sei fuori classifica, e così via.

## 12. SPOGLIATOIO

- **SQUADRA**: il nome (fino a 12 lettere, maiuscole, salvato a ogni tasto;
  vuoto = DOPOLAVORO) e le **8 divise**. La prima è di serie; le altre si
  liberano col PACCHETTO DIVISE del negozio (una divisa col lucchetto, se
  toccata, porta al negozio).
- **ROSA**: i tuoi cinque uomini — portiere, due ali, due difensori — con
  ritratto, partite, gol e quattro attributi (VELOCITÀ, TIRO, TECNICA,
  CONTRASTO; per il portiere RIFLESSI e PRESA). Dopo ogni partita **uno**
  cresce di +1, scelto da quello che è successo in campo (chi segna cresce
  nel tiro, chi ruba nel contrasto…). Sola lettura: niente mercato.
- **CAMPI**: gli otto campetti, ognuno col suo carattere — L'ORATORIO (di
  serie), IL CORTILE (150), LA GABBIA (400), LA SPIAGGIA (800), IL
  PARCHEGGIO (1500), LA PALESTRA (2500), IL TETTO (4000), IL TORNEO NOTTURNO
  (6000). USA QUESTO CAMPO per sceglierlo, SBLOCCA per comprarlo (comprare
  seleziona anche). Il campo è estetica: non cambia la fisica.

## 13. NEGOZIO — la bacheca del campetto

Il patto, scritto in cima: *«Prezzi dichiarati una volta, per sempre. Niente
pubblicità, niente casse premio, niente attese: ogni cosa si sblocca anche
giocando.»* Cinque carte:

| carta | monete | che cosa dà |
|---|---|---|
| IL CAMPETTO COMPLETO | 2660 | tutto, per sempre |
| PACCHETTO CAMPI | 1330 | i sette campi oltre l'Oratorio |
| PACCHETTO DIVISE | 1330 | le sette divise oltre la prima |
| LA CURVA | 660 | cori, tamburo, coreografia al gol |
| LO SPONSOR DEL CAMPETTO | 2000 | scrivi tu i nomi sui cartelloni |

La CURVA e lo SPONSOR, una volta comprati, hanno l'interruttore IN CAMPO /
A RIPOSO. Lo sponsor apre **SCRIVI I TUOI CARTELLONI**: fino a quattro nomi
da 14 lettere, dipinti sulle insegne a bordo campo con **DIPINGI** (gratis).
Il bottone col prezzo in euro, in questa versione, apre solo il patto:
*qui tutto si sblocca giocando.* Nessun oggetto tocca la fisica o le
abilità: lo verifica un banco di prova dedicato.

## 14. BACHECA — trofei, albo, statistiche

**I 15 obiettivi**, con la condizione vera:

| trofeo | condizione | premio |
|---|---|---|
| PRIMO GOL | la tua squadra segna (una volta nella carriera) | 20 |
| TRIPLETTA | 3 gol in una partita | 60 |
| MORTE IMPROVVISA | vinci una partita finita in parità ai 90″ | 60 |
| CECCHINO | 5 tiri perfetti in una partita | 80 |
| MANI PULITE | 10 rubate pulite in carriera | 40 |
| SARACINESCA | vinci senza subire gol | 50 |
| FREDDO DAL DISCHETTO | segna un duello dal dischetto | 40 |
| VETERANO | vinci 10 partite | 120 |
| RE DEL QUARTIERE | vinci un torneo | 150 |
| SALVADANAIO | arriva a 1000 monete | 100 |
| GIRAMONDO | possiedi tutti gli 8 campi | 200 |
| CAMPIONE DEL QUARTIERE | vinci una stagione | 200 |
| SOMBRERO | tenta un pallonetto e segna nella stessa partita | 50 |
| AL VOLO | tenta un tiro al volo e segna nella stessa partita | 70 |
| MAI UN FALLO | vinci una partita senza commettere falli | 60 |

La **mensola** in alto mostra le sette coppe d'oro (velate finché non
vinte). L'**albo d'oro** ricorda ogni torneo vinto (numero, squadra, campo,
data) e ogni campionato. Le **STATISTICHE**: partite, vittorie con la
percentuale, gol fatti/subiti, differenza reti, tiri perfetti, rubate,
monete, trofei sbloccati su 15, tornei vinti.

## 15. IMPOSTAZIONI

Dall'ingranaggio: **PREFERENZE**, **COME SI GIOCA** (la lavagna del mister:
regole e comandi, sempre consultabile), **CREDITI E LICENZE** (i tre
caratteri tipografici con licenza SIL OFL 1.1).

Le PREFERENZE:

| voce | stati | note |
|---|---|---|
| AUDIO | ON / OFF | esiste anche in pausa |
| VIBRAZIONE | ON / OFF | accendendola vibra di conferma |
| COMANDI SUL VETRO | — | apre la pagina COMANDI (sotto) |
| MOVIMENTO | COMPLETO / RIDOTTO | scossa, coriandoli, transizioni; se il sistema chiede «riduci il movimento», il gioco obbedisce da solo |
| ALTO CONTRASTO | NO / SÌ | daltonismo: gli ospiti vestono sempre il kit blu dedicato |
| Difficoltà predefinita CPU | Facile / Normale / Duro | gemella della riga in GIOCA |
| DURATA PARTITA | 90″ / 120″ / 180″ | a 7 e a 11 il campo è più grande e la durata scala |
| MOVIOLA DOPO IL GOL | SÌ / NO | il replay si salta con un tocco |
| AZZERA TUTTI I DATI | due tocchi entro 4 s | cancella TUTTO, identità di rete compresa: irreversibile |

**COMANDI (sul vetro)** — raggiungibile anche dalla pausa col link «cambia»:
- **MANO**: destra o sinistra (specchia dischi, levetta e bussola).
- **TAGLIA DEI DISCHI**: 85-150%, a gradini.
- **DISTANZA FRA I DISCHI**: 100/120/140% (quando la taglia comanda, la voce
  lo dice).
- **Com'è adesso**: tre numeri **misurati sul tuo schermo** — diametro del
  disco grande, margine fra due prese, percentuale di schermo occupata.

## 16. Il salvataggio

Tutto vive sul telefono (localStorage): squadra, rosa, monete, campi,
trofei, torneo e stagione in corso, impostazioni, identità di rete. Si
scrive a ogni evento e anche quando l'app sparisce in secondo piano.
Disinstallare cancella tutto; l'identità di rete si porta altrove solo col
codice di CAMBIO TELEFONO.

**Il tasto Indietro** (Android) e **ESC**: chiudono la pagina COMANDI se
aperta; durante i rigori non fanno nulla; in partita aprono/chiudono la
pausa (mai uscire per sbaglio); dal tabellino di fine equivalgono a MENU;
da ogni altra schermata risalgono al menu; al menu, due pressioni entro due
secondi chiudono l'app.

---

# Appendice — le incoerenze del censimento (31 agosto 2026)

Il censimento è servito anche a questo: 98 sospetti, letti dal codice.
Qui il registro completo, a edizioni.

## Curate il giorno stesso

1. **La STAGIONE moriva alla seconda apertura** (TypeError su un elemento
   distrutto dal ridisegno): curata — e con lei è **nato** il bottone
   RISULTATI DELL'ULTIMA GIORNATA, che per quel crash non era mai comparso.
2. **Il duello dal dischetto era un fermo-immagine**: l'orologio delle
   animazioni non avanzava in quella scena — misurato: 0 campioni su 2408
   cambiati in 700 ms. Ora respira (22/2408), con un orologio di solo
   disegno che non tocca la fisica né i sorteggi.
3. **Sette bottoni «TORNA AL MENU» portavano altrove**: ora dicono la
   destinazione vera (ALLE IMPOSTAZIONI / ALLA BACHECA / ALLO SPOGLIATOIO).
4. **La riga comandi della pausa** diceva «quattro dischi» (sono cinque) e
   «Z contrasta» (è la scivolata): corretta, con il cross da tastiera
   (E+Shift) e lo scudo che prima taceva.
5. **La difficoltà scelta poteva non salvarsi** dopo un torneo, e una
   giornata di stagione la **sovrascriveva** con quella imposta dalla forza
   dell'avversaria: curate tutte e due le strade, e il contesto della
   partita finita si chiude tornando al menu.
6. **SOMBRERO e AL VOLO** promettevano un gol col gesto ma si sbloccavano
   col tentativo più un gol qualunque: le descrizioni ora dicono la
   condizione vera (legare il trofeo al gol del gesto è a registro).
7. **Il podio di stagione (+200)** era pagato senza riga in lavagnetta e
   non dichiarato: ora ha l'etichetta «Podio di campionato» e sta
   nell'intro dei premi.
8. **L'albo d'oro** chiamava «TORNEO N.x» anche i campionati, sfalsando la
   numerazione: ora i campionati si chiamano CAMPIONATO.
9. **«otto campetti da sbloccare»**: sono sette (l'Oratorio è di serie).
10. **Apostrofi al posto degli accenti** nelle etichette scritte da JS
    («e' piu' grande», «PIU' TIENI»): accentate vere.
11. *(Dal mattino, fuori censimento: i cinque cronometri che
    sopravvivevano a startMatch — coi quali anche la prima partita
    ereditava la pulsazione del menu — e il cancello dei comandi del dito
    che sbagliava 2-3 volte su 10.)*

## Curate la sera stessa (seconda passata: 83 ancoraggi in quattro toppe, più tre cure di simulazione)

12. **Il pareggio esiste**: in campionato lo 0-0 al 90″ chiude la
    giornata — PAREGGIO, +15, la X in classifica. Golden e rigori
    restano ad amichevole, torneo e sfida; il cancello del meta-gioco
    ora misura entrambe le leggi.
13. **I trofei si vincono, non si guardano**: riprodotto che il replay
    di una sfida sbloccava PRIMO GOL e pagava monete; cinque guardie.
    E MORTE IMPROVVISA esige il golden vero, FREDDO la punizione vera.
14. **Il dischetto entra in contabilità**: il gol del duello è nello
    specchio, la parata è del portiere (tabellino e crescita), e il
    marcatore a referto è il rigorista della targa.
15. **COME SI GIOCA completato**: il tiro che parte da solo a 1,25 s,
    W/↑ per il centro nel duello, i 3 secondi del portiere col dito,
    la taglia che vale anche per torneo e stagione, la mentalità del
    solo giocatore di sinistra in 2P. Lo splash dice il vero, RIPRENDI
    e il title della pausa parlano la lingua dell'input, la citazione
    di GIOCA non promette più 90 secondi ai campi grandi.
16. **Ganci morti estirpati** (31 ancoraggi): fieldRow, tourCoppa,
    campiResta, campiNome, tourPlaySub, le otto Tut.notify morte, il
    CSS orfano dello splash, SAVE.rete.visto (cinque scritture, una
    scovata dal controllo stesso), i 6 sponsor che erano 4, i commenti
    bugiardi, il «12» del banner composto dalla costante.
17. **La SFIDA onesta fino all'ultimo accento** (30 ancoraggi): tutti
    gli apostrofi-accento del dominio curati; duelMsg con aria-live
    (annunciato davvero); Invio conferma il codice; i bottoni si
    spengono visivamente mentre la rete gira; le partite scartate
    dalla coda hanno un toast col motivo; il trasferimento azzera i
    numeri del vecchio proprietario; l'aiuto esce dal campo readonly.
18. **Negozio e bacheca**: il COMPLETO comprato a pezzi si salva
    davvero; la schermata CAMPI dice quanto costa il pacchetto (letto
    dalla costante); SALVADANAIO conta il massimo storico; l'albo si
    tronca anche in scrittura; «Stagioni vinte» esiste; i cartellini
    di stato non rubano più il fuoco; «Monete in tasca» dichiara ciò
    che è.

## A registro — ciò che resta, e in che stato

- **LA DICHIARAZIONE AL COMMITTENTE — che cosa aveva chiesto, che cosa ha
  ricevuto, e che cosa NON ha ricevuto** (scritta dalla voce #149, 24
  settembre 2026, su rilievo della revisione d'insieme dell'onda E; sta in
  cima perché è la cosa che chi apre questo registro deve leggere per prima,
  e perché per tre cantieri non è stata scritta da nessuna parte).

  **CHE COSA IL COMMITTENTE AVEVA CHIESTO.** Il **live 1v1**, entrato in
  programma come **onda E** con la sua decisione del 17 settembre 2026:
  «progetto d'architettura dedicato (**lockstep** prima; il **server
  autoritativo** solo se la misura dice che il lockstep non basta)». Nel
  vocabolario agli atti di questa casa «onda E» **significa** «live 1v1»
  (`_analisi/MAPPA-MANDATO.md`, decisioni del committente, punto 2).

  **CHE COSA HA RICEVUTO.** Una **sfida dal dischetto**: una serie di rigori a
  cinque tiri per parte, a turni, fra due telefoni che si passano messaggi
  attraverso una cassetta REST.

  **PERCHÉ.** Lo dice una misura, ed è il **#145**: `S1` e `S2` non tengono
  (D_rete 30,6 e 23,3 tick contro 18 e 12), `S3` non tiene (D_stallo 38,4 e
  30,4 tick, e la scorciatoia della ridondanza è misurata invalida perché la
  coda arriva a raffica), `S4` tiene a metà, `S5` **non è misurata**, `S6`
  tiene. Il lockstep continuo a 60 Hz **non è ammesso**. Lo scrive senza
  attenuanti il progetto d'onda
  (`docs/superpowers/specs/2026-09-23-onda-e-architettura.md` §5.4): «**Non è
  il gioco che il committente ha chiesto**; è il gioco che l'infrastruttura
  che abbiamo sa davvero consegnare se la misura dice no».

  **E QUELLA FRASE, FINO A OGGI, ESISTEVA IN UNA COPIA SOLA.** Non qui, non in
  `PUNTO-DEL-LAVORO.md`, non nei verbali #146, #147 e #148 — che invece dicono
  **tre volte «ONDA E CHIUSA»**.

  **L'ELENCO DI CIÒ CHE NON È STATO CONSEGNATO**, per intero:

  1. **Il live 1v1, in nessuna forma.** C'è una serie di rigori a cinque tiri.
  2. **Il lockstep**, né continuo né a D ridotta: **non una riga**.
  3. **Il server autoritativo** — l'alternativa che il committente aveva messo
     lui sul tavolo — **scartato per ragionamento e costo, senza nessuna
     misura su di esso**.
  4. **Il DataChannel non ordinato**, che il #145 chiama «l'unica via tecnica
     che il NO lascia aperta» e che il #146 riclassifica come «latenza che la
     misura dice che non serve».
  5. **Un server vero.** `calcetto-rete` risponde **503**, nessun progetto
     Supabase esiste, e **la sfida dal dischetto non ha mai girato su nessuna
     rete**: ogni misura è contro una cassetta finta in memoria. **Due persone,
     oggi, non possono giocarla.**
  6. **La pubblicazione del nastro**: la classifica non si muove.
  7. **Le due misure che i cantieri stessi hanno dichiarato decisive**: **S5**
     (P2P ≥ 90% su mobile italiano, «NON MISURATA») e la **SOGLIA-UMANA** del
     #141 («**NON ESEGUITA — richiede il committente**»). L'onda è stata
     dichiarata chiusa **tre volte** senza di loro.
  8. **Un collaudo umano del pannello**: il volto del #147 **non è mai stato
     visto da un occhio umano**.

  **CHE COSA RESTA IN PIEDI, perché non è poco.** Il determinismo, il nastro e
  i suoi quindici tipi di riga, il giudice differito coi suoi cinque verdetti,
  la matematica scritta in casa del #143, il comando semantico del #142,
  l'astensione del #139, l'appuntamento del #144 e l'impegno in due tempi del
  #146: ogni pezzo serve anche al live 1v1, il giorno in cui una misura lo
  riaprisse. Il NO del #145 è sul **lockstep continuo a 60 Hz da rete fissa
  italiana**, non sull'idea.

  **LA DECISIONE NON È DI CHI SCRIVE.** Se il committente vuole il live 1v1, le
  strade misurate sono due e hanno un prezzo scritto: il **DataChannel non
  ordinato** (che chiede S5, cioè la misura mancante) e il **server
  autoritativo** (che chiede un host sempre acceso, una bolletta che non è più
  zero, e la revisione dell'intera postura «zero permessi, zero conti, nessuna
  chiave nell'HTML»). **Nessuna delle due è stata provata.**

- **IL NASTRO DEL DISCHETTO SI PUÒ CONFERMARE — #148 CANTIERE CHIUSO, e con
  lui l'ONDA E per davvero** (voce #148, 24 settembre 2026, quattro compiti
  dal merge-base `01265bc` — spec
  `docs/superpowers/specs/2026-09-24-nastro-giudicabile-design.md`, piano
  `docs/superpowers/plans/2026-09-24-nastro-giudicabile.md`). **`MOTORE_V`
  sale da 4 a 5** con una misura in tre versi (vedi (d)); **`DISCHETTO_V`
  resta 1**, e non è una dimenticanza: nessun *messaggio* del protocollo è
  cambiato.

  L'**onda D** (#133 giudice, #134 sigillo, #137 sospetto, #138 staffetta)
  ha costruito un verificatore differito perché «la classifica si ripulisce
  da sola» fosse un fatto misurato. L'**onda E** (#141-#147) ha costruito la
  sfida dal dischetto fra due telefoni. **Fino a oggi le due onde non si
  parlavano fino in fondo: i nastri della seconda non erano confermabili dal
  primo.** Questo cantiere le cuce.

  ### (a) LA DIAGNOSI DEL #147 ERA GIUSTA A METÀ, e la seconda metà era il contrario

  Il #147 lascia scritto che mancano tre righe e che «il seguito è piccolo:
  tre righe in `avvia`». **Misurato** (`strumenti/_sonda-148-differita.js`,
  merge-base `01265bc`, serie **vera, onesta e giocata fino in fondo** fra
  due telefoni):

  | gioco | nastro | verdetto su una serie onesta |
  |---|---|---|
  | merge-base | `{3:2, 6:12, 14:6, 15:1}` | `INCOMPLETO / rose-assenti` |
  | **con le tre righe e basta** | `{3:2, 6:30, 7:1, 10:1, 11:1, 14:18, 15:1}` | **`NON TORNA`** · atteso [4,3] · rigiocato [3,2] · **8462 passi** |

  **Ottomilaquattrocentosessantadue passi sono novanta secondi di calcio.**
  Il nastro di una serie non porta nessun atto di gioco aperto (tipi 12/13:
  zero): porta i **comandi del duello** (tipo 6), e senza una serie aperta
  quei comandi non hanno un duello in cui cadere. E il punteggio dichiarato è
  quello della **serie**, mentre `G.score` dopo una serie vale 1-0 (la rete
  che decide, `programmaRigore`). **Le tre righe da sole non confermavano una
  serie onesta: la facevano accusare** — e NON TORNA è l'unico dei cinque
  verdetti che muove punti, a *due* persone insieme. Meglio l'astensione di
  ieri.

  ### (b) LA CURA: una porta sola, e un ramo del giudice

  1. **`Reg.carta(mentA, mentD, pacA, pacD, iCar)`** scrive le tre righe
     d'identità — rose (7), schermo (10), impronta del motore (11) — in
     quell'ordine, che è quello su cui poggia ogni nastro già scritto (la
     lettura delle rose è *posizionale*). Non è codice nuovo: è il blocco che
     stava dentro `Sfida.gioca`, **spostato** coi commenti del #132, #133,
     #139 e #142 che ne spiegano il perché. Due copie divergono — è la
     lezione che il #134 ha già pagato con `vagliaNastro`.
  2. **`Dischetto.avvia` chiama la stessa porta**, con `1, 1` (le due posture
     che passa a `startMatch`), le due rose **per lato** (`rA`, `rB`) e
     `indiceCarattere('FUORI')`, che vale `-1`: `caratterePer('FUORI')` e
     `carPerIndice(-1)` danno tutti e due `CAR_NEUTRO`, quindi il giudice
     scende in campo con la stessa CPU.
  3. **La riga 15 porta anche chi tira per primo.** Sarebbe deducibile dal
     seme (`S.primo = (S.seme & 1) ? 'b' : 'a'`), e non lo si deduce: sarebbe
     una seconda copia della regola del sorteggio, e il giorno in cui il
     dischetto la cambiasse i nastri vecchi verrebbero rigiocati storti **in
     silenzio**. Il fatto sta nel nastro — la scelta del #133 per lo schermo
     e del #142 per il motore.
  4. **`giudica` apre la serie**: se `vagliaNastro` trova la riga 15, dopo
     `startMatch` fa `G.kickTeam = disco.primo; avviaRigori();` — le stesse
     due righe, nello stesso ordine, di `Dischetto.avvia` — e alla fine
     confronta **`G.rigori.seg`** invece di `G.score`. Per ogni altro nastro
     `disco` è `null` e non cambia niente.

  ### (c) LE ROSE SONO QUELLE VERE — e la misura che ha corretto il timore

  La riga di tipo 7 scritta dai **due** telefoni è identica numero per numero
  (45 numeri), e sono **le rose vere dei due telefoni, per lato**: il
  cancello le rifà in Node dal salvataggio di ciascuno e le confronta con
  quelle scritte (prova A6).

  **E qui la misura ha corretto il mandato.** Il timore era «se scrivessi
  rose sbagliate il giudice direbbe NON TORNA a un onesto». **Su una serie
  non succede**: tre falsi — rose scambiate, rose per possesso, due volte la
  propria rosa — danno **tutti e tre lo stesso punteggio rigiocato**, quindi
  `TORNA`. La ragione sta nel codice ed è netta: **il duello dei rigori non
  legge nessun attributo di nessun giocatore** — `Duel.resolve` guarda le
  zone, la banda di potenza, `pkCopertura` e `D.save`. Le rose nel nastro di
  una serie servono a passare il vaglio e a dire chi ha giocato; su una sfida
  *asincrona*, dove le rose scendono in campo davvero, il timore resta
  fondato. **Il cancello ha dovuto cambiare prova**, non aspettarsi un
  punteggio sbagliato.

  ### (d) `MOTORE_V` 4 → 5, e il criterio di casa va letto più largo di come è scritto

  `strumenti/_t-148-motorev.js`, tre versi:

  | verso | che cosa | esito |
  |---|---|---|
  | 1 | quattro nastri della **sfida** del merge-base rigiocati sul curato | **4 su 4 identici**, 80 campioni ciascuno |
  | 2 | un nastro di una **serie** del curato **letto** dal gioco di ieri | **34 righe contro 34**, 100 campioni identici, stesso punteggio; testimone: un comando sporcato diverge al campione 69 |
  | 3 | lo stesso nastro **giudicato** | oggi **TORNA** (2-3, 1011 passi) · ieri **NON TORNA** (1-3, **7156 passi**) |

  **È il terzo che comanda.** Il criterio scritto in casa — «`MOTORE_V` si
  incrementa quando una cura cambia l'esito di sequenze di comandi identiche»
  — guarderebbe il verso 2 e direbbe di no: i tipi 7, 10 e 11 il gioco di
  ieri li conosce da mesi, quindi lo scarto di righe è **zero**, che è
  esattamente il numero di righe dei tipi nuovi (nessuno) — il criterio del
  #147 tenuto **stretto**, non rilassato. Il pericolo sta un piano più su:
  **quel che è cambiato non è come si legge un nastro, è come si giudica.**
  Il numero va letto così: *se una cura cambia il verdetto che un altro
  telefono darebbe sullo stesso nastro, sale.* Il prezzo — i nastri v4
  ingiudicabili — si paga volentieri: v4 è del 23 settembre, e la riga resta
  a `verificata = 0`, quindi torna giudicabile da sé. Il numero protegge
  anche l'appuntamento: `chiudiAppuntamento` rifiuta un pari con
  `suo.mv !== MOTORE_V`. La **fixture congelata** è stata rigenerata
  (`_gen-nastro-duello-congelato.js`), come al #143.

  ### (e) IL CANCELLO, NATO ROSSO, E I SETTE FALSI

  `strumenti/_q-nastro-differito.js`, **12 prove**, nate **9 rosse su 11**
  sul merge-base (A tutto rosso, C tutto rosso; verdi solo B1 e B3, che il
  #147 e il #107 avevano già comprato — e il banco lo dice, se no un rosso
  grosso nasconderebbe un verde comprato con un'assenza). Sul curato:
  **12 su 12**. Giudica su una **terza pagina pulita**, che è quel che fa la
  staffetta.

  > **RETTIFICA A EDIZIONI (24 settembre 2026, voce #149).** Le prove erano
  > **13**, non 12: sette nel gruppo A, quattro in B, due in C — e
  > `PUNTO-DEL-LAVORO.md` scriveva 13 mentre questo registro scriveva 12, per
  > un giorno intero. **Dal #149 sono 17**: il gruppo B ne ha quattro in più
  > (B5..B8, i quattro modi di accusare due persone oneste che la revisione
  > d'insieme ha misurato). Nate **13 su 17** sul merge-base `b87f512`, cioè
  > quattro rosse; sul curato **17 su 17**.

  `strumenti/_q-nastro-falsi.js`, **7 su 7 morsi come dichiarato**, e ogni
  falso ha una firma diversa: `possesso` → A3+A6 (A1 verde), `scambiate` →
  **solo A6** (A1 e A3 verdi: la bugia è coerente e nessun confronto fra i
  due capi la vede), `mie` → A3+A6, `solo-a` → A2+A3+A6, `primo-storto` →
  **A7**, `serie-cieca` → A1+A2+**A5** (i passi esplodono), `punteggio` →
  A1+A2 con A5 verde. **L'ottavo è dichiarato e NON è morso**: chi scrive le
  tre righe *dopo* il primo tiro non lo distingue nessuna prova, perché per
  un nastro senza pixel l'ordine delle righe di testa non è un formato (le
  tre astensioni dello schermo, le uniche che guardino l'ordine, dal #144 non
  si applicano).

  **E UN SECONDO FALSO È SCAPPATO, nella batteria intera.** `primo-storto`
  era dichiarato «morso da A1+A2»: il giudice apre una serie diversa e quasi
  sempre ne esce un punteggio diverso — ma **quasi**, e in una corsa la serie
  sbagliata ha dato per caso lo stesso punteggio di quella vera. Un falso che
  morde a caso non condanna nessuno: condanna chi lo rilancia. Da lì nasce
  **A7**, che confronta la riga 15 con la verità (`primo`, letto dallo stato
  del dischetto) invece che col punteggio, ed è deterministica su qualunque
  serie. **È la stessa forma dell'errore delle rose** (§c): due volte, in
  questo cantiere, una prova è stata riscritta perché guardava l'effetto
  invece del fatto.

  **E il banco ha dovuto spegnere il freno della cassetta finta.** Per
  scegliere una serie col punteggio distinguibile servono più appuntamenti, e
  il freno finto vale 60 richieste al minuto per identità come quello vero:
  **misurato**, il terzo appuntamento finisce «incompiuta» e il quarto e il
  quinto muoiono su «rete» prima di cominciare, e il banco dichiarava PROVA
  NULLA dando la colpa alla serie. Col freno spento, sei appuntamenti di fila
  finiscono tutti e sei. Il freno lo misura `_q-dischetto` E1, che è il suo
  posto.

  ### (f) IL BANCO HA SBAGLIATO DUE VOLTE, E LE DUE VOLTE ACCUSAVA IL GIOCO

  1. **Confrontava le righe intere.** `0,7,0,…` contro `0,7,1,…` è **un
     millisecondo** di scarto d'orologio da muro, non una rosa: il banco
     dichiarava «le due rose sono DIVERSE» su due nastri che il giudice
     faceva tornare tutti e due. Due telefoni non possono avere lo stesso
     scarto, e non devono.
  2. **Leggeva le rose tardi.** Confrontate col salvataggio *dopo* la serie,
     due attributi su quaranta risultavano più bassi di uno: **una partita
     che finisce fa crescere qualche giocatore**, e il nastro l'aveva scritta
     prima.

  E una terza, che non era un difetto del banco ma una proprietà del gioco
  che nessuno aveva misurato: **le rose non muovono una serie di rigori**
  (§c). Tre falsi dichiarati «mordibili da A1» sono scappati tutti e tre, e
  la prova è stata riscritta.

  ### (g) LA STAFFETTA, senza un adattamento

  Un nastro del dischetto si raggruppa **come gli altri**: non porta pixel,
  quindi l'etichetta è `qualunque` (regola del #144) e la chiave è
  `qualunque@3274447767` (l'impronta del motore, regola del #142). La
  staffetta vera — il suo `giro()`, con un banco finto che fa due sole cose:
  dare la riga e ricevere la parola — lo pesca, lo giudica e manda **`TORNA`**
  al database. **Nessun adattamento è stato necessario**, e lo dice una
  misura (prove C1 e C2), non una lettura del codice.

  ### (g-bis) LA BATTERIA, INTERA — e le quattro ferite ereditate

  `node strumenti/tutti.js --tutto`, **76 cancelli**, 1570 s di orologio, sul
  file spedito: **73 cancelli che contano verdi, zero rossi**. Dentro ci sono i
  due nuovi, `nastro-differito` (18 s) e `nastro-falsi` (120 s), registrati
  `conta:true`. Gli altri tre: `avvio` informativo **verde**; `istantanea`
  informativo **rosso** con il referto **identico riga per riga a quello del
  #147** (42/56, 1/8, 8/8, 8/8, 5/8, 8/8, 7/8, 5/8), cioè non è una
  regressione ma un confronto contro un registro del 20 agosto il cui
  riferimento era una prova nulla; `avvio-telefono` **PROVA NULLA (uscita 3)**,
  perché non c'è nessun telefono Android collegato. **Il verdetto della
  batteria è quindi «prova nulla», non «verde»**, e si scrive così invece di
  arrotondare. Fuori dalla batteria: `rete/prove/tutte.js` **62/62**.
  `--ripetuto 3` sui due nuovi: **stabili**, nessuna divergenza fra le tre
  corse.

  **E la batteria intera ha trovato quel che il piano non nominava** (lezione
  22, sesta occorrenza). Spostare tre righe dentro `Reg.carta` ha cambiato
  `Reg.motore();` in `this.motore();` e `Reg.schermo(…)` in `this.schermo(…)`,
  e **quattro mutanti di altri cantieri ancoravano su quelle stringhe**:
  `_crit-motore-muto` (che fa rosso `motore-falsi`) e i tre
  `_crit-finestra-*`. È la regola 4 nella sua seconda metà — «quando ripari
  uno strumento, cerca subito la stessa ferita negli strumenti che l'hanno
  copiato» — e qui l'origine non era una riparazione ma uno spostamento.
  Riparati tutti e quattro, con la ragione scritta accanto.

  ### (h) CHE COSA RESTA APERTO

  **Nessuno pubblica ancora un nastro del dischetto su un server.** La serie
  è fra due telefoni e resta lì: questo cantiere rende il nastro
  **giudicabile**, non lo spedisce. Che ci arrivi è un altro cantiere. Resta
  il **residuo (2) del #147** — chi toglie *tutte* le 14 *e* la 15 — e resta
  per statuto: chiuderlo vuol dire firmare, e firmare vuole una chiave.
  Restano **S5** (WebRTC sul CGNAT mobile) e il **backend vero a 503**.

  > **RETTIFICA A EDIZIONI (24 settembre 2026, voce #149), e sono tre cose.**
  >
  > **(1) Il residuo non restava per statuto: restava perché era stato
  > guardato da un lato solo.** Il nastro di una serie è fatto di comandi di
  > duello, e novanta secondi di calcio non ne raccolgono nemmeno uno: 12
  > avanzati su 12, misurato (`strumenti/_sonda-149-duelli.js`). Curato dal
  > #149 senza nessuna firma e senza nessuna chiave
  > (`INCOMPLETO/duelli-mai-letti`). E finché è restato aperto **non era
  > un'astensione ma un'accusa**: NON TORNA a due persone oneste.
  >
  > **(2) IL SERVER DELLA CASSETTA È FINTO, e questa §(h) non lo diceva** —
  > lo diceva il #146 e poi è sparito. Tutte le misure di questo cantiere e di
  > quelli del dischetto girano contro una **cassetta in memoria scritta in
  > Node** (`strumenti/_dischetto-due-telefoni.js`): `calcetto-rete` risponde
  > **503 `DEPLOYMENT_PAUSED`** e **nessun progetto Supabase esiste**. **La
  > sfida dal dischetto non ha mai girato su nessuna rete vera, e due persone
  > oggi non possono giocarla.**
  >
  > **(3) «con lui l'ONDA E per davvero» va letto con la dichiarazione al
  > committente in testa a questo registro**: l'onda E doveva essere il live
  > 1v1, e quel che è stato consegnato è una serie di rigori.
- **IL VOLTO — #147 CANTIERE CHIUSO, e con lui l'ONDA E** (voce #147, 24
  settembre 2026, cinque compiti dal merge-base `999fbf8` — spec
  `docs/superpowers/specs/2026-09-24-il-volto-design.md`, piano
  `docs/superpowers/plans/2026-09-24-il-volto.md`). **`MOTORE_V` resta 4 e
  `DISCHETTO_V` resta 1**, e lo dice una misura nei due versi (vedi (f)).
  Sette cantieri di misura avevano costruito una sfida dal dischetto fra due
  telefoni che funziona e che **nessuno poteva giocare**: il #146 l'aveva
  dichiarato da sé («il pannello sullo schermo non c'è: chi gioca non la
  vede»). Questo cantiere chiude quella riga, mette in scena il ritardo, e
  cura — restringendolo, non chiudendolo — il buco di verifica differita.

  > **LIMITE DICHIARATO, RIMESSO DOVE SI LEGGE (rettifica a edizioni, 24
  > settembre 2026, voce #149).** **Questo pannello non è mai stato visto da
  > un occhio umano.** È stato disegnato, misurato al pixel da due cancelli e
  > guidato da un banco a due telefoni; nessuna persona l'ha aperto, letto e
  > usato. Il limite stava scritto **solo** in `PUNTO-DEL-LAVORO.md`, e non
  > nel verbale del cantiere che l'ha costruito: chi leggesse solo il registro
  > crederebbe il contrario. Un pannello che nessuno ha guardato può essere
  > corretto al pixel e illeggibile — e il #141 aveva già una soglia apposta
  > per questo, la **SOGLIA-UMANA**, dichiarata «NON ESEGUITA — richiede il
  > committente» e mai più nominata da nessun cantiere.
  ### (a) LA PIEGA, che è il vincolo che ha comandato il cantiere

  La schermata SFIDA è misurata a due formati (`_q-sigillo` B3, `_q-carta`
  D4) e il commento accanto a `btnSfidaCarta` porta i tre numeri che il #135
  ha pagato. **Misurati prima** (`strumenti/_sonda-147-piega.js`, merge-base
  `999fbf8`, **identici a 800x360 e a 915x412**):

  | bersaglio | prima | dopo | scarto |
  |---|---|---|---|
  | CERCA AVVERSARIO | **220** | **220** | **0** |
  | prima riga della lista | **329** | **329** | **0** |
  | primo GUARDA | **308** | **308** | **0** |
  | SFIDA DI CARTA (lista vuota) | **347** | **347** | **0** |
  | SFIDA DAL DISCHETTO | — | **403** | voce nuova |
  | TORNA AL MENU | 418 | **474** | +56 |
  | altezza scorribile | 466 | **522** | +56 |

  **Il posto non è stato scelto: è stato dedotto e poi misurato.** I tre
  bersagli stanno tutti e tre *sopra* `btnSfidaCarta`, e in un flusso
  verticale la loro posizione dipende solo da ciò che li precede: quindi la
  voce nuova va **dopo** la carta e non può muoverli. Il 418 di prima dice
  l'altra metà: **la riga delle azioni stava già sotto la piega ai due
  formati**, e `.ov` ha `overflow-y:auto`. In questa schermata «sotto la
  piega» vuol dire **una scrollata**, non un bottone perduto.

  **E una misura ha cambiato una riga di CSS.** La prima stesura metteva la
  voce e basta, e il banco dava CERCA/riga/GUARDA/CARTA fermi e la voce
  nuova… **allo stesso identico posto della carta, 301-347 tutte e due**
  (`strumenti/_diag-147-voce.js`). Causa: `.voce` non dichiara `display`,
  quindi un `<button>` è `inline-block`, e `.box` è larga 640 a tutti i
  formati — le due voci stavano **sulla stessa riga**. Costava **zero pixel
  di piega**, ed è stata la tentazione. È stata rifiutata, e la ragione
  vale più del pixel risparmiato: **una disposizione che dipende dalla
  larghezza non si misura una volta sola**. Basta un telefono più stretto o
  una parola più lunga e le due voci vanno a capo — e in quell'istante la
  piega si muove **a casa di qualcun altro, dove nessun banco guarda**.
  `#btnSfidaDischetto{display:block}`, e i 56 px si pagano e si dichiarano.

  ### (b) IL PANNELLO — che cosa si può fare, col dito

  Dalla schermata SFIDA: **creare** una sfida e ottenere il codice di sei
  caratteri da mandare a un amico; **entrare** con un codice ricevuto;
  **vedere la serie** mentre va — chi tira, chi para, il punteggio, i tiri
  già fatti come pallini pieni e vuoti, il codice della stanza; **vedere
  come finisce**, con la causa vera detta in italiano.

  **Nessuna delle frasi accusa**, tranne una, ed è l'unica in cui non c'è un
  dubbio ma un hash che non torna (`impegno-non-torna`). Chi sparisce legge
  «la serie si annulla, perché una connessione caduta non è una resa».

  **La fascia sopra il duello** (`#dsFascia`) è `position:fixed`: non entra
  nel flusso di nessuna schermata, quindi non può muovere nessuna piega. È
  lì che si vede la serie mentre si tira, perché il duello ha bisogno dello
  schermo intero per la mira.

  ### (c) IL PEZZO DURO: il dito che diventa una mossa

  Il protocollo pretende che la mossa si chiuda **al buio**, e le tre porte
  vere (`pickZone`/`stopPower`/`pickKeeper`) le chiama `risolviDuello`
  quando le due mosse sono sul tavolo. Se le chiamasse il dito, il duello si
  risolverebbe in locale, le righe di tipo 6 uscirebbero doppie e
  `risolviDuello` non troverebbe mai `phase === 'zone'`.

  **Le tre porte si avvolgono una seconda volta**, e l'avvolgimento sta
  *fuori* da quello del nastro (il blocco del dischetto viene dopo nel file:
  chi arriva dopo sta fuori). A cattura accesa — solo a fase `scegli` — le
  porte **registrano invece di passare**. La barra di cattura ha la **legge
  della barra vera** (`cursor += dir*dt*1.15`), perché i suoi tick sono
  esattamente quelli che l'altro telefono rigiocherà uno per uno.

  **E un cancello sul duello, che è anche l'immagine del cantiere.** Con
  `rAF` vivo, `Duel.update` farebbe due cose che in una sfida fra due
  persone non deve fare: la CPU tira da sé (`s.pickZone((dado()*3)|0)`) e la
  CPU si tuffa da sé — e `dado()` è il PRNG **di gioco**. Finché il
  dischetto aspetta, il duello avanza **solo i suoi orologi di
  presentazione**. Il fiato trattenuto del progetto d'onda non è una scelta
  di regia: **è la correttezza**.

  **E i due ruoli si dicono la verità**: chi gioca dal lato `b` ha
  `G.cpu[1]` vero e senza una riga leggerebbe «TIRA LA CPU» mentre tira lui.
  Di più: nel rigore normale il portiere sceglie in fase `wait`, *dopo* che
  il tiratore ha fermato la barra; qui i due scelgono insieme in fase
  `zone`, quindi il dito passa sempre dal gesto della mira e a dividere i
  ruoli è la cattura, non il gestore del tocco.

  ### (d) IL RESPIRO — il ritardo messo in scena, e i suoi quattro numeri

  Progetto d'onda §6: «quando dai un comando, il giocatore non parte di
  scatto: **prende fiato**». L'anello del comandato si **stringe** mentre il
  comando matura e arriva al colmo **sul tick in cui esegue**, con un arco
  d'anticipazione color avorio — non verde-lime, che è l'anello del
  fiato-fatica del #112: due anelli, due cose, due tinte.

  **La carica non conta i fotogrammi: legge l'orologio del ritardo.** È 1
  meno quanto manca, diviso K. Così «dura esattamente K e finisce sul tick
  in cui il comando esegue» è la **definizione**, non una taratura — e non
  può sfasarsi su un telefono lento.

  | | misura | soglia dichiarata prima |
  |---|---|---|
  | E1 | K = 12, carica a 0/6/12 tick = **0 / 0,5 / 1,0** | colmo al tick K, valori crescenti |
  | E2 | **0,5 → 0,5** dopo **90 fotogrammi** a orologio fermo | invariata e > 0 |
  | E3 | impronta **1072987814 = 1072987814**, pallone **965082173,382998999** identico, punteggio 0-0 | identici |
  | E4 | sorteggi di gioco **176 con · 176 senza · delta 0** | delta 0 |

  **E3 ed E4 sono le due che contano**: il respiro **non cambia la partita di
  un bit** e **non consuma un sorteggio di gioco**. Il tremolio esce da
  `dadoDeco()`, il PRNG dedicato della cosmetica (cura #129) — e il #132
  aveva trovato che l'**audio** mangiava sorteggi, quindi qui non si è
  ragionato, si è contato.

  **A K = 0 il respiro non esiste**: nessuna coda, nessuna carica, nessun
  pixel diverso. È la ragione per cui `_q-istantanea` non si muove e per cui
  `MOTORE_V` resta 4.

  **E l'indicatore di connessione è lo stesso oggetto**, come chiedeva il
  progetto: nella fascia del dischetto non c'è un numero di millisecondi,
  c'è la stessa carica, e quando l'altro tarda il fiato resta trattenuto.
  Un oggetto, due significati, zero interfaccia nuova.

  ### (e) LA CURA DEL BUCO DI VERIFICA DIFFERITA — e il buco era più grande

  Il #146 aveva scritto: «`vagliaNastro` non pretende le righe di tipo 14;
  un nastro a cui fossero tolte passerebbe come partita normale».
  **Misurando si è trovato di peggio** (`strumenti/_sonda-147-quattordici.js`,
  serie vera fra due telefoni, tre tiri, merge-base `999fbf8`):

  ```
  righe in memoria 17 · righe rilette 11 · nastro 173 caratteri
  per tipo nel testo: {3: 2, 6: 9}      <- ZERO righe di tipo 14
  verdetto del giudice: INCOMPLETO / rose-assenti
  ```

  **Le 14 non arrivavano nemmeno nel nastro**: `Reg.serializza` non aveva un
  ramo per il tipo 14 e `Reg.deserializza` neppure. `Dischetto.testimonia`
  scriveva la riga in memoria e la prima serializzazione la buttava. Il #146
  aveva letto il codice del giudice e aveva ragione su quello; **la riga a
  monte non l'aveva guardata nessuno, e ragionando non si sarebbe trovata.**

  **La cura, doppia:** (1) `serializza`/`deserializza` imparano il tipo 14 e
  il tipo **15** — la *carta d'identità* della serie, `[DISCHETTO_V]`, scritta
  da `Dischetto.avvia`; (2) `vagliaNastro` pretende le testimonianze e **si
  astiene** se mancano (`INCOMPLETO / testimonianze-assenti`, mai un'accusa).

  **Perché serve la 15 e non basta guardare le 14**: chiedere «se ci sono
  righe di tipo 14, controllale» è **circolare** — chi le toglie tutte non
  lascia niente da controllare. Il riconoscimento è nei due versi (15
  *oppure* almeno una 14), così prende anche chi ne togliesse *alcune*.

  **Dove sta il controllo, e perché lì**: subito dopo `duello-marchiato` e
  **prima** di `rose-assenti`, e la collocazione è una misura — un nastro
  vero oggi è già `INCOMPLETO/rose-assenti`, quindi un controllo in coda non
  sarebbe mai stato raggiunto su un nastro vero e sarebbe stato verificabile
  solo su un nastro costruito dal banco, cioè **non verificato**.

  **MISURATO dopo la cura** (`_q-volto` G, serie vera fra due telefoni):

  ```
  nastro: 1111 caratteri, per tipo {3: 2, 6: 12, 14: 8, 15: 1}
  con le 14:            INCOMPLETO / rose-assenti
  tolte le 8 righe 14:  INCOMPLETO / testimonianze-assenti
  ```

  Il falso **non è un mutante del gioco: è un mutante del nastro** — si
  tolgono otto righe vere da un nastro vero, riversando i loro due delta sul
  primo pezzo superstite perché il nastro resti valido. Un mutante del gioco
  avrebbe provato che il gioco sa rifiutare il *proprio* nastro rotto, non
  quello di un altro.

  **IL RESIDUO, dichiarato.** Chi toglie **tutte** le 14 **e** la 15 ottiene
  un nastro indistinguibile da una partita normale: il punteggio rigioca
  giusto, **nessun innocente viene accusato**, e la prova di lealtà non
  viene rifatta. Questa cura **restringe** il buco, non lo chiude, e la
  ragione è strutturale: chiuderlo vorrebbe dire **firmare** la 15, una
  firma vuole una chiave, e in questo gioco non c'è nessuna chiave — per
  statuto (`rete/LEGGIMI.md:181-183`), non per dimenticanza.

  > **RETTIFICA A EDIZIONI (24 settembre 2026, voce #149). QUESTO PARAGRAFO È
  > FALSO IN DUE PUNTI, ed è stato misurato.**
  >
  > **(1) «nessun innocente viene accusato» non è vero.** La revisione
  > d'insieme dell'onda E ha giudicato il nastro di una serie **onesta** (2-1,
  > seme 1561173679, 1068 caratteri) togliendo **solo la riga 15** e lasciando
  > le 14: **NON TORNA**, rigiocato [1,3] in **7839 passi**, cioè novanta
  > secondi di calcio al posto di una serie. Rimisurato in modo indipendente
  > dal banco del #149 su un'altra serie onesta (2-1, 1069 caratteri): **NON
  > TORNA**, rigiocato [0,1] in **5984 passi**. La guardia del #147 era **a
  > senso unico** — pretendeva «la 15 vuole le 14» e mai «le 14 vogliono la
  > 15» — e il verdetto che ne usciva toglieva punti a **due** persone.
  > Curato dal #149 (`INCOMPLETO/dischetto-assente`).
  >
  > **(2) «indistinguibile da una partita normale» era vero per
  > IDENTIFICARE la serie e falso per ASTENERSI.** Il nastro di una serie è
  > fatto di **comandi di duello** (tipo 6) e nient'altro: novanta secondi di
  > calcio non ne raccolgono **nemmeno uno**. Misurato
  > (`strumenti/_sonda-149-duelli.js`): il residuo lascia **12 comandi
  > avanzati su 12**, un nastro onesto ne lascia **0**. Non serviva nessuna
  > firma e nessuna chiave: bastava guardare il cursore dei duelli. Curato dal
  > #149 (`INCOMPLETO/duelli-mai-letti`), e il verdetto giusto era
  > un'astensione, non un'accusa. **Il residuo del #147 non era inchiudibile:
  > era stato guardato da un lato solo.**

  ### (f) `MOTORE_V`, misurato nei due versi — e un criterio rettificato

  `strumenti/_t-147-motorev.js` non riscrive niente: lancia i due attrezzi
  che esistono già coi file di questo cantiere.

  - **VERSO 1** — nastri del merge-base rigiocati sul curato
    (`_t-144-motorev.js`): **4 su 4 identici**, **80 campioni** ciascuno,
    **2749 righe**, punteggi 0-1 / 0-2 / 0-1 / 0-0.
  - **VERSO 2** — un nastro di una serie di rigori **vera** fra due telefoni
    (21 righe, 12 di tipo 6, 6 di tipo 14, 1 di tipo 15) letto dal gioco di
    ieri (`_t-146-motorev.js`): **nessuna eccezione**, **100 campioni
    identici**, **stesso punteggio 1-0**, col testimone che diverge al
    **campione 69** su un nastro sporcato in un comando.
  - **`MOTORE_V` RESTA 4**, e lo dice la misura.

  **E UN CRITERIO DEL #146 È STATO RETTIFICATO A EDIZIONI, non rilassato.**
  `_t-146-motorev.js` pretendeva che il gioco di ieri leggesse *le stesse
  righe* del curato, e al #146 era esatto — ma per una ragione che allora
  non era stata misurata: **le 14 non arrivavano nel nastro**, quindi i due
  giochi leggevano per forza lo stesso numero. Dal #147 le 14 e la 15
  viaggiano, e un gioco di ieri le butta — `deserializza` aggiorna i due
  delta **prima** di smistare il tipo, quindi una riga sconosciuta non
  sposta di un tick quelle dopo. Il criterio nuovo **stringe**: lo scarto
  deve essere **esattamente** il numero di righe dei tipi nuovi. **Misurato**:
  oggi **21** righe, ieri **14**, righe dei tipi nuovi **7**, atteso **14**.
  Se ne mancasse una in più o in meno, il gioco di ieri starebbe leggendo
  male un comando — che è il difetto che il #144 ha trovato (170 su 2749).

  **IL PREZZO, dichiarato**: un giudice di ieri non *controlla* le
  testimonianze. Non accusa un innocente (è quel che `MOTORE_V` protegge);
  assolve un colpevole. Per quello c'è `DISCHETTO_V`, che se ne accorge
  **prima**: la sfida non comincia nemmeno.

  ### (g) IL DIFETTO CHE IL BANCO NON AVEVA CERCATO, e che è nato rosso

  CHIUDI spegneva il protocollo e **lasciava la partita in piedi** — e
  appena il protocollo è spento il cancello sul duello non trattiene più
  niente, quindi la CPU riprendeva a tirare e a tuffarsi al posto delle due
  persone. Chi premeva CHIUDI restava chiuso dentro a guardare una serie che
  si gioca da sola. **Misurato prima della cura** (`_q-volto` B5): prima di
  CHIUDI scena `freekick`, duello `zone`, in partita `true`; **dopo, gli
  stessi tre**. La cura usa la porta che il gioco ha già, `abbandonaSfida()`,
  e riapre SFIDA col pannello.

  ### (h) IL BANCO, E I NOVE FALSI

  `_q-volto.js`, sette gruppi. **Nato rosso** sul merge-base — e due dei
  suoi quattro verdi erano **comprati con un'assenza**, smascherati dal
  banco stesso prima di avere un solo mutante: C1 cercava la mossa
  dell'altro in un tabellone che non esiste, G3 assolveva un giudice che si
  ferma prima.

  **E C1 è stata riscritta una seconda volta, per una scoperta che vale più
  della prova.** Misurando si è visto che la proprietà che voleva
  sorvegliare **non è raggiungibile dal pannello**: la mossa dell'altro non
  arriva *mai* sul telefono prima che io mi sia impegnato, perché `manda()`
  spedisce la rivelazione solo se ha in casa l'impegno dell'altro. È del
  **protocollo** (#146, falso `gentile`), non del volto — e un cancello che
  la rimisurasse qui **passerebbe sempre, anche su un pannello scritto
  male**. Al suo posto C1 misura l'istante che il pannello *può* rompere:
  **mentre la barra corre sotto il dito, l'impegno non deve essere partito**
  — col testimone che dopo il rilascio la rivelazione arriva eccome
  (**0 rivelazioni con la barra in corsa, 2 dopo**).

  **BITE LIST 9 su 9**, col controllo positivo:

  | falso | prova | esito |
  |---|---|---|
  | `volto-sopra` (la voce sopra la lista) | A1 | **MORSO** |
  | `volto-muto` (il pannello che non fa niente) | B2 | **MORSO** |
  | `volto-ansioso` (l'impegno a gesto non finito) | C1 | **MORSO** |
  | `volto-svelto` (la cattura spenta, le porte vere) | D1 | **MORSO** |
  | `volto-rete` (il pannello che parla alla rete all'apertura) | F1 | **MORSO** |
  | `respiro-piatto` (la carica ferma) | E1 | **MORSO** |
  | `respiro-rotella` (la carica azzerata a orologio fermo) | E2 | **MORSO** |
  | `respiro-motore` (il respiro che sposta il giocatore) | E3 | **MORSO** |
  | `respiro-dado` (il tremolio da `dado()`) | E4 | **MORSO** |

  **E DUE DICHIARATI NON MORSI**, perché un banco che morde nove su nove
  senza aver cercato il decimo sta attestando: **il pannello brutto** (un
  volto che funziona e parla male — la qualità di una frase non si misura
  con un cancello) e **il tabellone spione**, che *non si può costruire* per
  la ragione detta sopra.

  ### (i) CHE COSA RESTA APERTO, e il seguito che nasce qui

  **Un nastro di una serie dal dischetto non è ancora giudicabile in
  differita, e non per le testimonianze.** Gli mancano la riga delle **rose**
  (tipo 7), quella dello **schermo** (10) e quella dell'**impronta del
  motore** (11): `Reg.scrivi(7, …)` vive dentro `Sfida.gioca`, cioè nel
  percorso della sfida *asincrona*, e `Dischetto.avvia` non ci passa.
  **Misurato**: il verdetto su un nastro vero è `INCOMPLETO / rose-assenti`
  sia prima sia dopo questo cantiere. Non accusa nessuno — è un'astensione —
  ma **una serie onesta non si può confermare in differita**. È un seguito, ed
  è piccolo: tre righe in `avvia`, e il giudice sa già leggerle. Va scritto
  qui perché è la cosa che chi legge il verbale crederebbe fatta.

  > **RETTIFICA A EDIZIONI (24 settembre 2026, voce #148).** Il buco è
  > **chiuso**, e la stima era **giusta a metà**. La prima metà regge parola
  > per parola: misurata di nuovo su una serie giocata **fino in fondo**
  > (`strumenti/_sonda-148-differita.js`), una serie vera dà
  > `INCOMPLETO / rose-assenti`. **La seconda metà no: «tre righe in `avvia`»
  > non era la cura, era il danno.** Con le tre righe e basta, la stessa serie
  > onesta prende **NON TORNA** (atteso [4,3], rigiocato [3,2], **8462
  > passi** — cioè novanta secondi di calcio invece di una serie di rigori),
  > perché `giudica` non apriva la serie e confrontava `G.score` invece dei
  > rigori segnati. La cura vera sono le tre righe **più** un ramo del
  > giudice, e `MOTORE_V` è salito a **5** con la prova in mano. Il verbale
  > del #148, in cima a questo registro, porta i numeri.

  E restano, invariati: il **residuo della cura (c)** (§e), **S5** (WebRTC sul
  CGNAT mobile) e il **backend vero a 503**, quindi tutte le misure di rete di
  questo cantiere sono contro un server finto in memoria.

  ### (h-bis) LA BATTERIA, INTERA

  `node strumenti/tutti.js --tutto`, **74 cancelli**, 2679 s di orologio, sul
  file spedito: **71 cancelli che contano verdi, zero rossi**. Dentro ci sono i
  due nuovi, `volto` (100 s) e `volto-falsi` (381 s), registrati `conta:true`.
  Gli altri tre: `avvio` informativo **verde**; `istantanea` informativo
  **rosso** — e **misurato sul merge-base dà lo stesso identico referto, riga
  per riga** (42/56, 1/8, 8/8, 8/8, 5/8, 8/8, 7/8, 5/8), quindi non è una
  regressione di questo cantiere ma un confronto contro un registro del 20
  agosto il cui riferimento era **una prova nulla**; `avvio-telefono`
  **PROVA NULLA (uscita 3)**, perché non c'è nessun telefono Android collegato
  — e un cancello che diventasse verde quando non può misurare sarebbe peggio
  di nessun cancello. **Il verdetto della batteria è quindi «prova nulla», non
  «verde»**, e si scrive così invece di arrotondare.

  E fuori dalla batteria: `rete/prove/tutte.js` **62/62**.

  ### (h-ter) IL BANCO NON E' RIPETIBILE, E ADESSO LO DICE

  `_q-volto` apre due contesti di browser e gioca serie intere contro una
  cassetta finta: **non è ripetibile**, come tutti i banchi a due telefoni.
  **MISURATO: dodici corse di fila, undici a 25/25 e una a 22/23** — e in
  quella dodicesima le prove mancanti erano **due**, non una rossa: un gruppo
  non era arrivato a misurare mentre la stessa macchina copiava cinque file da
  2,8 MB. Un cancello `conta:true` che in quel caso dicesse «rosso»
  accuserebbe il gioco col proprio affanno.

  Percio' i fallimenti di **preparazione** — la sfida che non si apre, i due
  telefoni che non arrivano a scegliere, il testimone di C1 che non vede la
  rivelazione nemmeno dopo il rilascio — escono `??` e portano l'uscita a
  **3**, non a 1. **Un rosso vince su tutto**: se anche una sola prova è rossa
  l'uscita resta 1, perché un difetto trovato non si cancella dicendo che il
  banco era stanco. Dopo la cura: **quindici corse, quindici a 25/25, uscita
  0**; sul merge-base **4/20, sedici rosse, uscita 1**.

  ### (j) UNA VERIFICA D'INTEGRITÀ CHE VALE LA PENA RIPETERE

  Le **quattro toppe** di questo cantiere (`_toppa-147-pannello.js`,
  `-respiro.js`, `-testimonianze.js`, `-chiudi.js`) applicate in fila al
  merge-base `999fbf8` riproducono il gioco spedito **byte per byte**. È la
  prova, e non la promessa, che il file da 2,8 MB è stato toccato **solo**
  dagli attrezzi ad ancore — e nel frattempo ha anche pescato una sciatteria:
  dodici accenti erano finiti **decomposti** (`e` + U+0300) invece che
  precomposti, e sono stati normalizzati sia nel gioco sia nella toppa, così
  che la riapplicazione torni identica.

- **LA SFIDA DAL DISCHETTO — #146 CANTIERE CHIUSO** (voce #146, 24 settembre
  2026, cinque compiti dal merge-base `5038eee` — spec
  `docs/superpowers/specs/2026-09-24-sfida-dal-dischetto-design.md`, piano
  `docs/superpowers/plans/2026-09-24-sfida-dal-dischetto.md`). **È il cuore
  dell'ONDA E nella forma che la misura le ha assegnato**, non in quella che il
  progetto d'onda teneva come primo ramo. **`MOTORE_V` resta 4, e lo dice una
  misura** (vedi (f)).

  ### (a) PERCHÉ QUESTA FORMA, e non il lockstep

  Il committente aveva posto la regola: «lockstep prima; il server autoritativo
  SOLO SE la misura dice che il lockstep non basta». La misura ha parlato
  quattro volte, e questo cantiere è la conseguenza:

  | voce | misura | conseguenza |
  |---|---|---|
  | #141 | il danno è un **gradino**: da 50 a 300 ms si paga lo stesso, 18 tick e nessun verbo muore | la soglia è `D_rete ≤ 18 tick` |
  | #143 | i tre motori JS vedono la stessa partita | il determinismo regge fra macchine |
  | #144 | l'atto risolto al posto del pixel | due telefoni diversi, stessa partita |
  | #145 | **NO al lockstep continuo**: non per la mediana (67 ms) ma per la coda, che vale 3,7-5,5× e **arriva a raffica nel 78,4% dei casi** — quindi la ridondanza non aiuta. 9-17 stalli al minuto contro una soglia di meno di uno | fattore nove, non margine stretto |

  E la derivazione che sceglie *questo* cantiere invece del VPS: **il danno da
  stallo scala con la FREQUENZA del canale** (`600 invii/min × P(coda)`). Dieci
  scambi per duello danno **0,017 stalli per duello**. Il server autoritativo
  **non risolve il problema misurato**: non toglie la coda, la tollera
  estrapolando o riavvolgendo, e il gioco non ha né l'una né l'altro.

  ### (b) LA FORMA DEL GIOCO, come è stata costruita

  Una **serie di rigori fra due telefoni**. Cinque tiri per parte, poi a
  oltranza; a ogni tiro uno tira e l'altro para, e al tiro dopo i ruoli si
  scambiano. Non è un modo nuovo: è **lo shoot-out che il gioco già sapeva
  fare** (`avviaRigori` `:19910`, `programmaRigore` `:19916`, `esitoRigore`
  `:19932`), portato fra due telefoni. I verbi sono le **tre porte vere** del
  duello — `pickZone(z,u,v)`, `stopPower()`, `pickKeeper(z)` — e non una
  simulazione riscritta accanto: **per questo le righe di nastro di tipo 6
  escono da sé e il nastro resta rigiocabile** senza che il blocco di rete ne
  sappia niente. La taglia è fissata a **5**, perché il determinismo pieno vale
  lì (voce #98, seguito #129).

  **Le due rose stanno negli stessi posti sui due telefoni**: il lato `a` è la
  squadra 0 anche sul telefono di `b`. Se ognuno si mettesse in casa, i due
  `resolve()` leggerebbero attributi diversi e la stessa mossa darebbe esiti
  diversi — la partita divergerebbe per costruzione, e la colpa sembrerebbe del
  protocollo.

  ### (c) IL TRASPORTO SCELTO, e che cosa resta NON misurato

  **La cassetta**: un buca-lettere indicizzato (`/api/dischetto`, tabella
  `cassetta`) letto a polling. **Quattro ragioni, nessuna è un gusto:**

  1. il beneficio di WebRTC è latenza che la misura dice che **non serve**;
  2. il rischio di WebRTC **non è misurabile da qui** — la riuscita su CGNAT
     mobile è **S5, dichiarata mancante** dal #145;
  3. **WebRTC non toglie la cassetta, la somma**: il segnale (SDP, 1-2 kB) deve
     passare da un punto d'incontro, e quel punto è la cassetta stessa. Quindi
     (a) è sempre **(b) più altro codice**, mai (b) in meno;
  4. la frequenza ci sta nei freni di oggi — **misurato**, vedi (e).

  **Il degrado non è una caduta da provare: è lo stato di riposo.** La via
  scelta *è* già la più degradata delle tre. Quello che è stato progettato e
  misurato è il comportamento della cassetta **quando la rete fa male** (g).

  **NON MISURATO, dichiarato:**
  - **S5** — WebRTC su CGNAT mobile italiano. Non c'è una riga di codice che ci
    si appoggi.
  - **Il backend vero non esiste oggi**: il deployment di `calcetto-rete`
    risponde **503 `DEPLOYMENT_PAUSED`** e non c'è un progetto Supabase (#145,
    cinque verifiche). **Tutte le misure di questo cantiere sono contro un
    server finto in memoria** — come già `_q-sfida.js`, `_sfida-due-telefoni.js`
    e `rete/prove/tutte.js` per tutta la sfida asincrona che vive qui da mesi.
    Il codice dell'endpoint e il suo freno sono scritti e provati; **che il vero
    server si comporti come il finto non è misurato, perché non c'è un vero
    server.**
  - La latenza vera fra due telefoni italiani su operatori diversi (misura
    S-prima del #145 §5.2).

  ### (d) LA FIDUCIA — una riga la tiene in piedi, e un falso lo dimostra

  L'**impegno in due tempi**: l'hash della mossa più un nonce da 128 bit
  viaggia prima, la mossa dopo, e **nessuno rivela finché non ha l'impegno
  dell'altro**. Quella clausola è una riga sola, e il falso `gentile` prova che
  è tutta la fiducia: togli la condizione di mezzo e **la serie finisce lo
  stesso, i punteggi coincidono lo stesso, il nastro è completo lo stesso, il
  giudice dice TORNA lo stesso** — solo che chi parla per secondo vince sempre.

  **Il seme non lo sceglie nessuno, e viene gratis**: è l'hash dei due nonce
  d'appuntamento, e quando scegli il tuo non conosci quello dell'altro. Lo
  stesso numero decide chi tira per primo.

  **LA SHA-256 È SCRITTA A MANO** (sessanta righe: il gioco è un file solo, e
  `crypto.subtle` è asincrona e su `file://` non è garantita). Confrontata con
  quella di Node su **409 casi** prima di entrare nel gioco — compresi i tre
  bordi di riempimento (55, 56, 64 byte) e il testo con accenti, che è dove le
  implementazioni scritte a mano sbagliano: **identiche tutte e 409**.

  > **RETTIFICA A EDIZIONI (24 settembre 2026, voce #149).** Quei 409 casi
  > **non avevano nessuno strumento che li producesse**: «409» non compariva
  > in `strumenti/`, né in `rete/`, né nel piano, né nella spec. Il confronto
  > era stato fatto **una volta, a mano**, e il numero era finito a verbale
  > senza un banco che lo rifacesse — mentre la funzione regge `dsImpegno`,
  > cioè l'unica accusa di tutto il cantiere del dischetto. La regola di casa
  > è «o si scrive il banco, o si ritira il numero»: **il banco adesso c'è**
  > (`strumenti/_q-sha256.js`, in batteria come `sha256`, `conta:true`,
  > deterministico e veloce). I 409 casi sono ricostruiti e dichiarati: 256
  > lunghezze da 0 a 255 byte (dentro ci sono i tre bordi), 128 stringhe da un
  > generatore seminato, 25 casi scomodi (accenti, emoji fuori dal piano base,
  > forme vere del protocollo). Col testimone: un carattere in più deve
  > cambiare il digest, e cambiarlo **come lo cambia Node**.

  **Che cosa succede se uno bara — misurato, non ragionato:**

  | tentativo | esito misurato |
  |---|---|
  | **pari veggente** (aspetta la rivelazione dell'altro prima di impegnarsi) | **0 sbirciate su 6 tiri**, col testimone accanto: a veggenza spenta la stessa rivelazione **arriva eccome**, dopo l'impegno |
  | **pari bugiardo** (impegna una mossa, ne rivela un'altra) | **smascherato**, `impegno-non-torna` — è **l'unica strada di tutto il cantiere che porta a un'accusa** |
  | **pari che dichiara un esito suo** | la serie si ferma con `esiti-diversi`, cioè **un'astensione**: due esiti diversi possono nascere da due motori JS diversi, ed è il caso che l'impronta del #142 esiste per riconoscere |
  | **cambiare idea dopo aver parlato** | rifiutato all'imbuco: la cassetta è a **scrittura sola una volta** per `(stanza, tiro, lato, tipo)`, e lo fa il **vincolo di unicità del database**, non un `if` che due richieste simultanee scavalcherebbero tutte e due |

  **E CHI SPARISCE NON VIENE ACCUSATO: VIENE ANNULLATO.** La serie si chiude
  **incompiuta**, zero punti a tutti e due, nastro sigillato lo stesso. Dare la
  vittoria a chi resta sarebbe il modo più corto per **vincere facendo cadere la
  rete dell'altro** — lo stesso argomento con cui il #137 rifiutò un endpoint
  capace di dire «questa sfida non torna». **Davanti a un dubbio ci si astiene,
  non si accusa.**

  ### (e) I FRENI, misurati e non promessi

  Il freno della cassetta prende **gli stessi numeri del fratello più largo**
  (`dis:<id>`, 60 al minuto, come `sfl:` e `avv:`): **nessun privilegio**. La
  spec stimava 36 richieste al minuto; **misurato: 5,8 richieste per tiro, cioè
  34,5 al minuto contro un tetto di 60**. E accanto il testimone: una raffica
  di 80 richieste ne prende **20 rifiutate con 429**, quindi il freno morde
  davvero — senza quella prova, «sta sotto il tetto» potrebbe essere vero
  perché il freno non esiste.

  > **RETTIFICA A EDIZIONI (24 settembre 2026, voce #149). «34,5 al minuto
  > contro un tetto di 60» È FALSO, e lo era per come il numero veniva
  > ottenuto.** Il cancello E1 pedalava `battito()` a mano il più in fretta
  > possibile e convertiva «richieste per tiro» in «al minuto» moltiplicando
  > per `DISCHETTO_SEC_TIRO = 10` — **una costante che nel gioco non
  > scandisce niente**. Il ritmo della rete lo decide `Dischetto.ritmo()`
  > (900 ms, 2200 quando la rete è dichiarata lenta), e la guida che lo usa
  > partiva dai due bottoni, non da `crea`/`entra`: **nei banchi non aveva
  > mai girato**. Quel 34,5 era il ritmo del banco travestito da ritmo del
  > gioco.
  >
  > **RIMISURATO** col gioco che si guida da solo (`avviaGuida`, aperta al
  > banco dal #149) e col metro giusto (`puntaAlMinuto`, la finestra
  > scorrevole di 60 s più affollata per identità, che esisteva già e non
  > usava nessuno), su 70 s di orologio e quattro serie:
  > **la punta è 76 e 75 richieste/min per identità, contro un tetto di 60.**
  > (La revisione d'insieme, che l'aveva trovato per prima, aveva misurato
  > 76-77.)
  >
  > **IL DANNO D'USO RESTA NULLO, e anche questo è misurato**: il gioco prende
  > i 429 (26 nella corsa), dichiara la rete **lenta**, allarga il ritmo da
  > **900 a 2200 ms**, e **dal primo 429 in poi il ritmo rientra a 52,0
  > richieste/min, sotto il tetto**; tre serie su quattro arrivano in fondo
  > col freno acceso. **Ma la frase «sta sotto il tetto» era falsa**, e con
  > lei le altre due dello stesso paragrafo (le 5,8 per tiro e la conversione
  > con `DISCHETTO_SEC_TIRO`). Il cancello adesso misura la punta vera e
  > pretende il **rientro** — ed è stato un falso a insegnarglielo:
  > `_crit-dischetto-sfrenato` (sette ritiri per giro) **se ne accorge**
  > benissimo e continua a chiedere sette volte tanto, quindi «accorgersene»
  > non era la proprietà da pretendere.

  ### (f) `MOTORE_V` RESTA 4, E LO DICE UNA MISURA

  Il nastro guadagna una riga nuova — **il tipo 14, la testimonianza**, che
  porta impegno e nonce dei due lati. Il criterio di casa parla di *comandi*,
  non di testimonianze; ma «non dovrebbe cambiare niente» **non è un numero**, e
  il #144 ha dimostrato quanto costa crederci. **Misurato nei due versi**
  (`strumenti/_t-146-motorev.js`, più `_t-144-motorev.js` per il verso 1):

  - **verso 1** — quattro nastri del merge-base rigiocati sul curato: **quattro
    su quattro identici**, ottanta campioni ciascuno, 2749 righe;
  - **verso 2** — un nastro di una serie di rigori **vera** fra due telefoni (30
    righe: 18 di tipo 6, 10 di tipo 14) letto dal gioco di ieri: **nessuna
    eccezione, le stesse 20 righe lette, 100 campioni identici, stesso
    punteggio**. Il #144, nello stesso punto, ne leggeva **170 su 2749**;
  - **col testimone**: un nastro sporcato in **un comando** diverge al campione
    69, quindi il confronto sa distinguere.

  **Il prezzo, dichiarato:** un giudice di ieri **non controlla** le
  testimonianze. Non accusa un innocente — è quel che `MOTORE_V` protegge — ma
  **assolve un colpevole**. Per quello c'è **`DISCHETTO_V`**, che se ne accorge
  **prima**: con versioni diverse la sfida non comincia nemmeno.

  ### (g) IL GUASTO — che cosa vede chi resta

  | guasto | che cosa vede chi resta |
  |---|---|
  | tre **ritiri** persi | **niente**: l'indice è del server, il ritiro dopo riporta tutto. Serie finita |
  | tre **imbuchi** persi | il ritentativo li recupera, perché l'imbuco è idempotente. Serie finita |
  | otto **429** di fila | la serie **rallenta e non si ferma** |
  | **l'altro sparisce** | `incompiuta`, esito `null`: **zero punti a tutti e due** |
  | **server spento** | `rete = giù`, e il gioco non si schianta |

  ### (h) I SETTE FALSI, con la bite list misurata — e l'OTTAVO dichiarato

  **Controllo positivo prima di tutto**: il gioco onesto passa 7 prove su 7
  *prima* che un falso venga costruito. Senza, un banco rotto in modo da essere
  rosso sempre «condannerebbe» tutti e sette senza discriminare niente.

  `gentile`→B1 · `credulone`→B3 · `semesuo`→A3 · `fidato`→C6 · `vincitore`→G5 ·
  `sfrenato`→E1 · `cieco`→F1. **Sette morsi su sette.**

  **L'OTTAVO, scritto perché un banco che morde sette su sette senza averlo
  cercato sta attestando:** *il pari che sparisce al momento giusto.* Chi ha già
  impegnato e ha letto la rivelazione dell'altro può non rivelare la propria e
  far annullare il tiro. Il banco lo **vede** (G4 misura l'incompiuta) e non lo
  **condanna**, e non può: un abbandono può essere una galleria. Si toglie
  l'incentivo invece di sorvegliarlo — l'abbandono non è una vittoria di
  nessuno. **Non è una svista: è il prezzo.**

  ### (i) I DUE ROSSI CHE LA BATTERIA INTERA HA TROVATO, e nessuno dei due era nel piano

  1. **`_q-sospetto` D8, `_q-glicko` D2/D8 e `_q-staffetta` F1** — guardie dei
     cantieri #137, #140 e #138 che congelano la superficie di rete (cinque
     endpoint, sei tabelle). **La terza è saltata fuori solo dalla batteria dei
     cancelli LENTI**, che nessun piano di compito nominava: è la lezione 22
     alla seconda occasione nella stessa giornata.
     Facevano **esattamente il loro mestiere**: servivano a impedire che una
     superficie nascesse *in silenzio*, non a impedire che nascesse.
     **Rettificate a edizioni**, con data e fonte accanto, e **le tre proprietà
     vere non si sono toccate**: `senzaRls`, `fuoriRevoke` e `senzaFreno`
     restano zero e ora coprono anche la tabella e l'endpoint nuovi. È la
     lezione 22 che si ripaga alla prima occasione.
  2. **La cucitura del banco confrontava due partite diverse.** Il gruppo D
     metteva a confronto una serie sul filo ordinato e una sul filo sballato —
     ma ogni serie nasce da un appuntamento nuovo, quindi da un **seme nuovo**.
     Passava **due volte su tre per fortuna**, e la terza stampava «ordinato
     gggf · sballato ggfg» come se il filo avesse cambiato il gioco: **il banco
     stava misurando il proprio sorteggio.** La proprietà vera si misura
     **dentro una serie sola** — sul filo che ritarda e consegna alla rovescia,
     i due telefoni devono vedere lo stesso esito tiro per tiro — ed è anche la
     proprietà **giusta**, perché è quella che servirebbe a un DataChannel a
     `maxRetransmits:0`.

  3. **Il controllo positivo dei falsi confondeva «rossa» e «assente».** Sotto
     il carico della batteria il referto del gioco onesto è arrivato senza la
     riga G5, e il banco ha stampato «G5 è rossa GIÀ sul gioco onesto» —
     **un'accusa al gioco fatta col silenzio del banco**. Non riprodotta né a
     macchina scarica (4 corse) né a macchina carica (2 corse con tre cancelli
     in parallelo): **la causa resta non isolata**, e si scrive così invece di
     inventarne una. La cura non è indovinare la causa ma **togliere al banco
     la possibilità di concludere quando non ha misurato**: ora guarda tre cose
     — codice d'uscita, prove rosse e prove **assenti** — e un'assenza vale
     **prova nulla, uscita 3**, con le ultime righe del referto stampate
     accanto. *Un banco che non ha misurato non assolve e non condanna.*
     Nello stesso giro è stata tolta una fragilità vera che **poteva** produrre
     quel referto: G4 aspettava che `tiro` arrivasse a 2 prima di far sparire
     l'altro, ma una serie può essere **già decisa** al secondo tiro (2-0) — e
     allora l'altro spariva da una partita già finita. Ora si cerca il momento
     giusto (almeno un tiro risolto **e** la serie ancora aperta) e, se in
     cinque appuntamenti non si trova, **la prova si dichiara nulla**.

  E un quarto, minore ma della stessa famiglia: A6 pretendeva che i due telefoni
  vedessero rose diverse e le rose erano **identiche**, perché l'impianto le
  variava su `nome.length` e ALFA e BETA hanno quattro lettere tutte e due. Il
  banco stava misurando la propria tavola dei nomi.

  ### (j) CHE COSA RESTA DA FARE, in chiaro

  > **RETTIFICA A EDIZIONI (24 settembre 2026, voce #149).** Questo elenco è
  > **superato in due voci su tre**, e fino a oggi nessuna riga lo diceva: la
  > revisione d'insieme dell'onda E ha trovato che `PUNTO-DEL-LAVORO.md`
  > rettificava correttamente le stesse due cose mentre **il registro — cioè
  > la fonte — non le rettificava affatto** (zero occorrenze di «RETTIFICA» in
  > tutta la voce #146). Le due voci superate sono segnate qui sotto una per
  > una. **Resta vera** solo la terza, S5.

  - **Il pannello sullo schermo.** La sfida dal dischetto oggi si guida da
    `window.__test.dischetto` e dal motore; **i due bottoni CREA/ENTRA accanto a
    SFIDA DI CARTA non sono stati disegnati.** Il cancello F misura già che
    aprirlo non costi una richiesta, ma chi gioca non lo vede ancora.
    **Non è stato rimandato per fretta, ed è giusto che chi lo farà lo sappia:**
    la schermata SFIDA è misurata a **due formati** (`_q-sigillo` B3 e `_q-carta`
    D4 controllano dove cade la piega a 915×412 e a 800×360), e il commento
    accanto a `btnSfidaCarta` (`:3148`) racconta che quel bottone fu inserito
    apposta dove **non muove di un pixel** CERCA AVVERSARIO (220), la prima riga
    (329) né il primo GUARDA (308). **Una `voce` in più sposta il taglio**, cioè
    è un cantiere di disposizione con i suoi due cancelli, non una riga di HTML
    da aggiungere in coda a questo.

    > **SUPERATA (24 settembre 2026, voce #147, rettificata qui dal #149).** I
    > bottoni **ci sono**: dalla schermata SFIDA si crea una sfida dal
    > dischetto, si entra col codice, si gioca e si finisce col dito. E il
    > cantiere di disposizione è stato fatto davvero: la piega **non si è
    > mossa di un pixel su quattro bersagli** (CERCA 220→220, prima riga
    > 329→329, GUARDA 308→308, CARTA 347→347) e **si è mossa di +56 px su
    > due** (TORNA AL MENU 418→474, fine scorribile 466→522), perché la voce
    > nuova sta a 403. Fonti: `strumenti/_q-volto.js`,
    > `strumenti/_sonda-147-piega.js`.
  - **Il giudice non pretende ancora le testimonianze.** `vagliaNastro` non ha
    un ramo per il tipo 14: un nastro a cui le righe 14 fossero state *tolte*
    verrebbe giudicato come una partita normale. Il punteggio rigiocherebbe
    comunque giusto (i comandi sono le righe di tipo 6), quindi **nessun
    innocente viene accusato**; ma la prova di lealtà non verrebbe rifatta.

    > **SUPERATA DUE VOLTE (24 settembre 2026, voci #147 e #149).** (a) Il
    > ramo per il tipo 14 **c'è** dal #147 — e il buco era più grande di come
    > è scritto qui: le righe 14 **non arrivavano nemmeno nel nastro**, perché
    > `serializza` non aveva un ramo per quel tipo (misurato,
    > `strumenti/_sonda-147-quattordici.js`). (b) **«nessun innocente viene
    > accusato» è FALSO**, e l'ha misurato la revisione d'insieme dell'onda E:
    > un nastro di una serie **onesta** a cui si tolga la sola riga 15 prende
    > **NON TORNA** (rigiocato [1,3] in 7839 passi; rimisurato dal #149 su
    > un'altra serie: [0,1] in 5984 passi). La frase gemella sta a `:910-916`
    > ed è rettificata lì con gli stessi numeri. Curato dal #149.
  - **S5**, e la misura a due telefoni veri del #145 §5.2.


- **La misura della rete e del trasporto — #145 CANTIERE CHIUSO, e IL VERDETTO
  È NO** (voce #145, 23 settembre 2026 — **tutte le misure di rete sono del 23,
  come dice il deposito; il cantiere si è chiuso nella notte sul 24** —, cinque compiti dal merge-base
  `55267d0` — spec `docs/superpowers/specs/2026-09-23-misura-rete-design.md`,
  piano `docs/superpowers/plans/2026-09-23-misura-rete.md`, referto completo
  `_analisi/MISURA-RETE-145.md`, dati grezzi
  `_analisi/misura-rete-145.json`, progetto d'onda
  `docs/superpowers/specs/2026-09-23-onda-e-architettura.md` §1 e §2.8).
  **Secondo bivio dell'ONDA E**, e come il #141 non costruisce niente: produce
  un numero e un verdetto, e il verdetto poteva essere no. **Il gioco non è
  stato toccato: `MOTORE_V` resta 4.**

  **LE SEI SOGLIE SONO STATE SCRITTE E COMMITTATE PRIMA CHE UN BANCO GIRASSE**
  (`53d5ffa`, compito 0).

  ---

  ### (a) IL NODO SCIOLTO PRIMA DI MISURARE, o il NO sarebbe stato comprato a credito

  Il #141 aveva scritto **`D_gioco = 0 tick`**, applicando la regola di casa
  dell'estremo alto dell'intervallo. Preso alla lettera, `D_rete ≤ D_gioco`
  è **falsa senza misurare niente**: nessuna rete consegna in zero
  millisecondi. Sarebbe stato un no comprato a credito, e il committente ha
  chiesto una misura che *possa* dire no, non una che dica no per costruzione.

  La lettura onesta del gradino è un'altra, ed è stata scritta al compito 0:
  **sotto il gradino (K=0) il gioco è intatto; sopra il gradino, da 50 a 300
  ms il gioco costa lo stesso** (scarto 0,01 ± 0,22, non distinguibili,
  #141). Quindi la domanda non è «quale D evita il danno» — non ce n'è
  nessuno — ma **«il trasporto sta dentro l'intervallo che il #141 ha davvero
  guardato, cioè D ≤ 18 tick?»**. Oltre i 300 ms non c'è misura del gioco:
  c'è estrapolazione, che è il modo elegante di attestare.

  ### (b) LA DERIVAZIONE CHE NESSUN DOCUMENTO DI CASA AVEVA SCRITTO

  **Lo stallo non si sceglie, si calcola.** Un invio ogni 100 ms sono **600
  pacchetti al minuto**; per stare sotto uno stallo al minuto serve
  `P(andata > D) < 1/600 = 0,167%`, cioè **D deve coprire il p99,83 della
  sola andata. Non il p95.** È la coda a decidere se un lockstep si può
  giocare, e sotto si vede che è proprio lei a dire no.

  E una regola che il metro incarna in un campo invece che nella testa di chi
  legge: **su un relay il percorso utile è `A→server→B`, due gambe, e l'eco
  `A→server→A` ne misura due — quel numero È GIÀ la sola andata e NON si
  divide per due.** Su un P2P è l'opposto. Due situazioni che si somigliano e
  chiedono il contrario.

  ### (c) I NUMERI (tutti in ms; sorgente: **una macchina sola, connessione fissa italiana**)

  | # | che cosa | tipo | n | p50 | p95 | p99 | p99,83 | persi |
  |---|---|---|---|---|---|---|---|---|
  | A | il **nostro** edge Vercel `fra1` | http | 300 | 51,6 | 71,4 | 233,5 | (n insuff.) | 0% |
  | B1 | relay `ws.postman-echo.com` | relay | 3000 | 134 | **203** | **493** | **623** | 0% |
  | B2 | relay `echo.websocket.org` | relay | 800 | 67 | **88** | **371** | **490** | 0% |
  | E | **controllo**: stesso client su loopback | relay | 3000 | 1 | 2 | 2 | **2** | 0% |
  | C | DataChannel fra due pari, stessa macchina | p2p | 400 | 2,0 | 2,5 | 2,7 | 2,8 | 0% |

  **D_rete: 23,3 tick (B2) e 30,6 tick (B1). D_stallo: 30,4 e 38,4 tick.**
  Intervalli di confidenza del p95 (non parametrici, binomiale sulle
  statistiche d'ordine): semiampiezza **19,5** e **22,5 ms**, sotto il tetto
  di 25 dichiarato: il campione regge e i numeri si possono trascrivere.

  **E LA STESSA DOMANDA, DETTA DALLA PARTE DI CHI GIOCA.** «Quanto ritardo
  serve per non stallare» è il modo in cui la chiede un architetto; chi gioca
  la chiede al contrario: **se prendo il ritardo massimo che il gioco tollera,
  quante volte al minuto la partita si ferma?**

  | relay | D = 12 tick (200 ms) | D = **18 tick (300 ms)**, il massimo misurato dal #141 |
  |---|---|---|
  | B1 | **30,8 stalli/minuto**, media 157 ms (peggiore 444) | **17,2 stalli/minuto**, media 147 ms (peggiore 344) |
  | B2 | **14,3 stalli/minuto**, media 148 ms (peggiore 354) | **9,0 stalli/minuto**, media 111 ms (peggiore 254) |

  La soglia dichiarata era **meno di UNO al minuto**. Anche col ritardo più
  generoso che il gioco sopporta, e sul migliore dei due relay, la partita si
  fermerebbe **nove volte al minuto**: non è un margine stretto, è un fattore
  nove. E la *durata* del singolo stallo starebbe quasi sempre dentro i 250 ms
  dichiarati (111-157 ms in media): **non è la lunghezza dello stallo a
  uccidere il lockstep, è la frequenza** — che è esattamente la ragione per cui
  la misura favorisce la terza via, punto (i).

  **LA RIGA E È LA PIÙ IMPORTANTE DI TUTTE, e senza di lei il resto non
  varrebbe niente.** La sonda B misura con `Date.now()` dentro un processo
  Node a un filo solo: se l'anello degli eventi si fermasse 200 ms per una
  raccolta di memoria, quel ritardo diventerebbe «coda della rete» e **il
  verdetto sarebbe mio, non della rete**. Lo stesso client, con le stesse
  dormite e lo stesso parsing dei fotogrammi, è stato rigirato contro un relay
  WebSocket **scritto a mano sul loopback** (il progetto non ha dipendenze e
  non era il caso di aggiungerne una per un controllo): **3.000 pacchetti,
  p99,83 = 2 ms, massimo 3 ms.** Il banco non ha code.

  ### (d) LA MISURA CHE HA CAMBIATO IL VERDETTO MENTRE LO SCRIVEVO

  Il progetto d'onda (§2.4) propone la mitigazione a buon mercato: ogni
  pacchetto porta **gli ultimi R comandi**, quindi uno stallo chiede R
  pacchetti *consecutivi* in ritardo. Col conto `600 · P^R`, a R=3:

  > B1: D_stallo scende da 38,4 a **8,4 tick**. B2: da 30,4 a **4,6 tick**.

  **Sono i due numeri che avrebbero fatto dire SÌ a questo cantiere.** Quel
  conto assume ritardi **indipendenti**, e l'indipendenza si misura invece di
  assumerla: fra i pacchetti sopra il p95, quanti ne hanno **un altro sopra il
  p95 subito prima**? Se indipendenti, il 5%.

  | | sopra il p95 | attaccati | quota | atteso |
  |---|---|---|---|---|
  | B1 | 148 | 116 | **78,4%** | 5% |
  | B2 | 39 | 26 | **66,7%** | 5% |

  **La coda arriva a raffica, tredici e sedici volte più di quanto l'indipendenza
  preveda.** È il blocco in testa alla fila di un canale ordinato su TCP:
  quando un pacchetto si ferma, tutti quelli dietro si fermano con lui, e **le
  R copie stanno tutte nella stessa fila ferma.** Senza questa misura il
  verbale avrebbe scritto «con la ridondanza il lockstep passa a 8,4 tick».

  **E la coda non è nemmeno stabile.** Stesso relay, due corse a mezz'ora di
  distanza la stessa sera: la mediana non si muove di un millisecondo (134 e
  134), il p99 si muove del **47%** (335 → 493).

  ### (e) I TRASPORTI

  **Supabase Realtime NON ESISTE**, e nessun verbale lo aveva mai verificato:
  nessun riferimento `<ref>.supabase.co` nel repo, nessuna variabile
  `SUPABASE_*`, **zero variabili configurate** sul progetto Vercel
  `calcetto-rete` (via API Vercel), il deployment di produzione risponde
  **503 `DEPLOYMENT_PAUSED`**, e il DNS di un riferimento inventato dà
  NXDOMAIN (niente carattere jolly, quindi l'assenza è un'assenza).
  Quel che regge, **LETTO dalla documentazione ufficiale, non misurato**: il
  protocollo Phoenix **si parla con un `WebSocket` nudo** — «zero dipendenze»
  sopravvive. Non sopravvive «nessuna chiave nell'HTML»: l'`apikey` è
  obbligatoria nell'URL.

  **WebRTC con solo STUN: da qui passa** — 3 STUN su 3 rispondono, **una sola
  porta esterna distinta** interrogandoli dallo **stesso socket**, tre giri su
  tre: mappatura **indipendente dall'endpoint**. Zero candidati di relay
  (nessun TURN). DataChannel aperto.

  **IL BANCO SI È CONDANNATO DA SOLO, ed è la lezione del cantiere.** La
  prima versione apriva **tre** `RTCPeerConnection`, una per STUN, e
  confrontava le porte mappate: ne usciva 54986, 53587, 54035 e lo strumento
  stampava **«NAT SIMMETRICO, serve un TURN»** — cioè condannava il P2P
  dell'intera onda E. Era falso: **tre connessioni usano tre socket locali
  diversi**, e qualunque NAT dà a socket diversi porte esterne diverse. Quel
  banco misurava il proprio numero di socket. Il test giusto interroga più
  STUN **dallo stesso socket** e conta i riflessi distinti — **e vuole la
  guardia**, o mente al contrario: se due server tacessero il candidato
  sarebbe uno solo lo stesso e si concluderebbe «a cono» misurando il
  silenzio.

  **Polling sulle funzioni di oggi**, riverificato sul codice e non ereditato:
  `frenato('sfida:'+id, 30, 60)` (`rete/api/sfida.js:190`), `60,60`
  (`:161` e `rete/api/avversario.js:106`) — **30-60 richieste al minuto**
  contro le **600** di un lockstep a 10 Hz: dieci-venti volte sopra. **Ma un
  duello non è 600 al minuto: sono pochi scambi, e ci sta dentro.**

  ### (f) LA LETTERATURA, MARCATA, E L'ASSENZA DICHIARATA

  **AGCOM, «Misura Internet Mobile 2025»** (Fondazione Ugo Bordoni, 45 centri
  urbani italiani, settembre-dicembre 2025): RTT medio statico **27,97 ms**,
  dinamico urbano **36,34**, extraurbano **44,02**, perdita **0,71%**. Tre
  limiti che il rapporto stesso dichiara: è un RTT verso un **server** e non
  un percorso fra pari; è una **media**, e qui decide la coda — **i
  percentili non sono pubblicati**; ed è misurato a «migliore tecnologia
  disponibile», quindi è un limite inferiore ottimistico.

  **E ciò che si è cercato e non si è trovato è depositato come ASSENZA**,
  non inventato: i percentili della latenza mobile italiana. Opensignal
  (403), nPerf (PDF coi dati dentro immagini), Speedtest Global Index (non
  raggiungibile). **È precisamente il numero che deciderebbe questo
  cantiere.**

  ### (g) I CINQUE FALSI, e il controllo positivo

  `_q-rete-falsi.js` **6/6**, ognuno morso dalla prova che il suo file
  dichiara, e nessuno fa la cosa ovvia: `due-campioni` lascia intatte le
  porte della sorgente e del percorso (o lo prenderebbero loro, e non
  proverebbe niente sulla numerosità); `locale` **non toglie** il controllo
  della sorgente, gli **lava l'etichetta** prima di arrivarci; `potatore`
  toglie il 5% peggiore lasciando mediana e media esatte al millesimo;
  `mezzo-giro` dimezza il relay lasciando il P2P corretto e i percentili
  grezzi intatti, **e il testo del campo continua a dire "nessuna
  divisione"** mentre il codice divide; `sordo` riporta i persi in un campo
  suo, giusto e inerte. Più il controllo positivo — il metro onesto passa
  tutte e dieci le prove — che è la metà che manca a quasi tutti i banchi di
  falsi.

  ### (h) IL VERDETTO, applicando le soglie dichiarate il 23 settembre PRIMA di misurare

  | soglia | esito | il numero |
  |---|---|---|
  | **S6 — campione** | **TIENE** | 3000 e 800 campioni, semiampiezza IC del p95 19,5 e 22,5 ms (tetto 25) |
  | **S1 — `D_rete ≤ 18 tick`** | **NON TIENE** | **23,3** e **30,6 tick** |
  | **S2 — `D_rete ≤ 12 tick`** | **NON TIENE** | idem |

  > **RETTIFICA A EDIZIONI (24 settembre 2026, voce #149).** Le due righe qui
  > sopra portavano l'etichetta **`D_rete(p95)`**, e la quantità confrontata
  > **non è il p95**: `D_rete = andata_p95 + (p99 − p95) + 1 tick`, cioè
  > **`andata_p99 + 1 tick`** (la formula sta in chiaro nel referto,
  > `_analisi/MISURA-RETE-145.md:26-27`, e nel codice di
  > `strumenti/_145-metro-rete.js`). **Non è pedanteria: con la lettura
  > letterale S1 TERREBBE** — 203 ms + 1 tick = **13,2 tick** su B1 e 88 ms
  > + 1 tick = **6,3 tick** su B2, tutti e due sotto i 18. **Il NO del #145
  > regge lo stesso**, perché a farlo cadere è S3 (lo stallo, 30,4 e 38,4
  > tick contro 18) — ma il verbale faceva credere che a sfondare fosse il
  > p95, e non è vero. L'etichetta è corretta qui, nel referto e nello
  > strumento.
  | **S3 — stallo, `D ≥ p99,83`** | **NON TIENE** | **30,4** e **38,4 tick**, e la scorciatoia della ridondanza è **misurata invalida** |
  | **S4 — trasporto** | **TIENE A METÀ** | esiste **WebRTC con STUN**; Supabase Realtime **non esiste** e chiederebbe una chiave che non ha dove stare |
  | **S5 — P2P ≥ 90% su mobile italiano** | **NON MISURATA** | da rete fissa passa; sul CGNAT mobile è l'ignoto |

  > **IL LOCKSTEP CONTINUO A 60 Hz NON È AMMESSO. IL VERDETTO È NO.**

  **E il NO non è quello che si temeva.** Non è «la rete italiana è lenta»:
  le mediane stanno benissimo — 67 ms a due gambe verso un relay pubblico
  lontano, e AGCOM dà 28 ms di RTT medio sul mobile italiano. **Il NO
  è la coda**: il p99 vale 3,7 e 5,5 volte il p50, non sta fermo nemmeno fra
  due corse della stessa sera, e **arriva a raffica**, il che toglie di mezzo
  l'unica mitigazione a buon mercato che il progetto d'onda aveva in mano.
  **E c'è un secondo NO, più semplice e più duro: il trasporto del progetto
  non esiste.**

  ### (i) QUALE RAMO LA MISURA FAVORISCE: **LA TERZA VIA**, e per una ragione misurata

  Il danno dello stallo è `600 invii/minuto × P(coda)`: **scala con la
  FREQUENZA del canale**. Il calcio continuo a 60 Hz è il caso peggiore
  possibile per una coda a raffica; **un duello no** — pochi scambi, non
  seicento al minuto. Con dieci scambi per duello, la stessa coda che fa tre
  stalli al minuto nel gioco aperto dà **0,017 stalli per duello**, e mezzo
  secondo fra il tiro e il tuffo del portiere non è un blocco: è il momento.
  E la terza via **sta dentro l'architettura di oggi, misurata**: i verbi del
  duello sono già semantici nel nastro (`pickZone(z,u,v)`, `stopPower()`,
  `pickKeeper(z)`, u/v al millesimo), il duello ha già il suo orologio
  (`Duel.nDuello`/`Duel.passo`), e il polling di oggi **ci sta nei freni**.
  Zero servizi nuovi, zero chiavi nuove, zero buchi in RLS, zero bolletta.

  **Il server autoritativo, invece, non risolve il problema misurato**: una
  flotta di browser headless costa un host sempre acceso, un sesto servizio e
  una bolletta (progetto d'onda §5.2), e **non toglie la coda** — la tollera
  in un altro modo, estrapolando o riavvolgendo, e il gioco non ha né l'uno né
  l'altro. Si comprerebbe la parte cara senza comprare la cura.

  ### (j) CHE COSA CAMBIEREBBE IL VERDETTO, e quale misura va fatta per prima

  Scritto al compito 0, **prima** di misurare, e non cambiato dopo. Un relay
  **nella stessa regione dell'edge**: i due misurati sono lontani (posizione
  geografica non verificata: verificata è la loro latenza), e dal nostro `fra1` (p50 51,6, p99 233,5) un relay europeo darebbe
  `D_rete ≈ 15 tick` — **S1 terrebbe**; ma il p99,83 di quella stessa misura
  è 504 ms = 31 tick e **S3 non terrebbe lo stesso** (DERIVAZIONE, non
  misura: a 300 campioni il p99,83 è il massimo, cioè un campione solo, e il
  metro lo dichiara non misurabile sotto 600). Oppure un trasporto **non
  ordinato**: la raffica è il blocco in testa alla fila di TCP, e un
  DataChannel **inaffidabile e non ordinato** non ce l'ha per costruzione —
  **è l'unica via tecnica che il NO lascia aperta**, e dipende tutta da S5,
  che non è misurata.

  **LA MISURA DA FARE PER PRIMA quando i telefoni ci saranno**, una sola e in
  quest'ordine: due telefoni italiani, **operatori diversi**, rete mobile, un
  pacchetto ogni 100 ms **per un'ora** (36.000 campioni — sotto i 600 il
  p99,83 non esiste, e per misurarlo invece di vederlo ne servono decine di
  migliaia), su un relay vero, con marcatura a sola andata; si riportano p50,
  p95, p99, **p99,83**, massimo, jitter, perdita **e la quota di raffica**. E
  nello stesso giro il tasso di riuscita di un DataChannel con solo STUN fra
  quei due telefoni, che è S5 e l'altra metà del verdetto.

  ### (k) RETTIFICA A EDIZIONI

  `rete/LEGGIMI.md:167-173` conteneva **tre affermazioni non misurate
  presentate come fatti** — che il trasporto sia Supabase Realtime, che 100
  ms bastino, e che alla caduta «il gioco continua contro la CPU». Rettificate
  in chiaro accanto al testo vecchio, con data, numeri e fonte. La terza non
  è realizzabile in lockstep per costruzione: nell'istante in cui un lato
  sostituisce una CPU non esiste più una verità condivisa; il degrado onesto è
  troncare i due nastri allo stesso tick e sottomettere il proprio come sfida
  asincrona.

  **CANCELLI.** `rete-latenza` in batteria **`conta:true`** (15/15): offline,
  deterministico, pochi secondi. `rete-falsi` in batteria **`conta:true`**
  (6/6). La **campagna** (`_145-campagna.js`) NON è in batteria ed è la
  scelta giusta: tocca servizi di altri, non è ripetibile, ed esce **3** se
  non può misurare — mai un verde senza misura. Ha una modalità `--rileggi`
  che rigiudica il deposito **senza toccare la rete**, perché il metro è puro.

  **E IL METRO È DETERMINISTICO SU DATI VERI, misurato e non asserito**: la
  rilettura del deposito (`--rileggi`, che non tocca la rete) riproduce un
  file **byte per byte identico**. Un metro che desse due referti diversi
  sullo stesso campione non avrebbe prodotto un verdetto, avrebbe prodotto
  un'opinione.

  **E UNA GUARDIA PAGATA SUBITO, sullo strumento e non sulla memoria**: una
  corsa con `--sonde E` fatta per provare una modifica ha **riscritto il
  deposito con un campione al posto di cinque**. La misura buona era già
  committata e si è ripresa da lì; la prossima volta poteva non esserlo. Ora
  una corsa **parziale non sovrascrive un deposito più ricco**: si ferma, dice
  quali sonde perderebbe e come forzarla. Un attrezzo che cancella una misura
  per distrazione è peggio di un attrezzo che non misura.

  **RETI DI SICUREZZA, a cantiere chiuso.** **Il gioco non è stato toccato, ed
  è verificato e non affermato**: `git diff main -- CALCETTO-il-gioco.html
  sw.js index.html` è **vuoto**, il file è bit-identico a `main`. La batteria
  intera, a cinque gruppi, **tutti i cancelli che contano verdi**: gruppo 1
  **16/16**, gruppo 2 **18/18**, gruppo 3 **17/17**, gruppo 4 **9/9** (i
  cronometrici da soli: `verbi-ritardo`, `motori` **19/19**, `casa` **20/20**,
  `perimetro` **5/5**, `casa-falsi` **9/9**, `motore-nastro` **11/11**,
  `motore-falsi` **14/14**, più i due nuovi), gruppo 5 **9/9 dei cancelli che
  contano** (`abbandono`, `soak`, `determinismo-11`, `audio`, `volti`,
  `giocata`, `prestazione`), e `rete/prove/tutte.js` **46/46**.

  **E DUE ESITI CHE NON SONO ROSSI, e vanno detti per nome o il verde è
  bugiardo.** `avvio-telefono` esce **3 (PROVA NULLA)**: `adb` c'è ma nessun
  telefono è collegato, quindi non c'è misura e non c'è verdetto — e un
  cancello che diventa verde quando non può misurare è peggio di nessun
  cancello. `istantanea` (informativo, `conta:false`) esce **NO 42/56**
  contro un registro del **20 agosto** fatto su un file diverso: è lo stesso
  scostamento noto che il #141 e i cantieri prima di lui hanno già messo a
  registro. **E qui non serve nemmeno confrontarlo, si dimostra**:
  `istantanea` misura soltanto il file del gioco, e il file del gioco è
  **bit-identico a `main`** — quindi il suo esito su questo ramo è per
  costruzione lo stesso che su `main`. Non è una regressione, e non è una
  diagnosi: è un'identità.

- **Il comando senza schermo — #144 CANTIERE CHIUSO** (voce #144, 23 settembre
  2026, cinque compiti dal merge-base `c71a83e` — spec
  `docs/superpowers/specs/2026-09-23-comando-senza-schermo-design.md`, piano
  `docs/superpowers/plans/2026-09-23-comando-senza-schermo.md`, progetto d'onda
  `docs/superpowers/specs/2026-09-23-onda-e-architettura.md` §3.1). Paga **due
  debiti in una volta** — il seguito più grosso del progetto (#133, i tocchi in
  coordinate di schermo) e il prezzo dichiarato del #139 («un nastro con la
  finestra mossa resta aperto per sempre») — e consegna i due prerequisiti che
  il censimento dell'onda E aveva messo per primi (§3.2, punti 1 e 2).

  **IL DIFETTO, MISURATO, ED È PEGGIO DI COM'ERA SCRITTO.** Un comando era un
  PIXEL. Dove finisce un pixel lo decidono tre cose che nel nastro non ci sono:
  la FINESTRA (`touchBtnLayout` parte da `bx = right ? VW : 0`), il POLLICE
  (`pollice()`: scala 85-150%, spazio 100-140%, mancino) e la TACCA
  (`insertiSicuri()`: `env(safe-area-inset-*)`). Una sfida vera registrata a
  915x412 e dichiarata **2-3** si rigioca **0-5** a 800x360, **0-5** a 844x390,
  **0-1** a 1280x720, **0-0** col pollice al massimo e **0-2** con la tacca di
  un telefono. Dei primi tre il gioco sapeva qualcosa e si asteneva
  (`schermo-diverso`); **sugli ultimi due no, e lì non si asteneva affatto**:
  lo schermo è IDENTICO — 915x412 da tutte e due le parti — quindi il giudice
  procedeva, rigiocava un'altra partita e diceva **NON TORNA** a un onesto che
  aveva soltanto il pollice grosso o un telefono con la tacca. NON TORNA è
  l'unico verdetto che muove punti: li toglie a DUE persone, alza un sospetto
  che non decade mai e chiude la riga per sempre. **I due canali gemelli non
  stavano in nessun verbale**: il censimento dell'onda E li aveva trovati
  leggendo il codice, e qui si misurano per la prima volta.

  **LA CURA, E PERCHÉ È PICCOLA.** Non è «normalizzare la risoluzione»: è
  **trasportare e registrare l'ATTO RISOLTO invece del PUNTO**. `Touch5.start`
  faceva due mestieri in un corpo solo — RISOLVERE (che squadra? che disco? o
  erba? o morto?) e APPLICARE — e i due si separano **senza duplicare una
  riga**: `risolvi` è pura, `applica` è il corpo di prima riga per riga,
  `avvia` è la porta che i due capi (il dito vero e il riproduttore del nastro)
  attraversano insieme. Fra loro passa un atto di cinque numeri:

  | campo | cosa dice |
  |---|---|
  | `t` | **la squadra**, 0 o 1 — il prerequisito §3.2 punto 2 dell'onda E |
  | `esito` | 0 disco preso · 1 erba · 2 cella spenta · 3 anello d'esclusione |
  | `slot` | quale disco, per INDICE (0 il grande, 1 il piccolo) |
  | `ux, uy` | il punto di posa **in unità della geometria dei comandi**, al millesimo |

  **LA NORMALIZZAZIONE NON È INVENTATA: è quella che il gioco usa già per
  decidere.** Le due passate di `Touch5.start` scelgono il disco col minimo di
  `d/(r+10)` e uccidono il tocco col minimo di `d/(r+18)`; il punto di posa si
  scrive in QUELLE unità, e la distanza normalizzata diventa invariante **per
  costruzione** — il denominatore è la geometria LOCALE di chi rilegge. **Il
  verbo non viaggia**: si rilegge da `touchBtnLayout(t)[slot].act`, perché
  dipende dal POSSESSO, e il possesso è simulazione, cioè già identico ai due
  capi. Quel che si può ricavare non si spedisce.

  **I TRASCINAMENTI VIAGGIANO COME SCOSTAMENTI** dal punto di posa, in pixel
  assoluti, ed è l'unica forma corretta: **tutte** le soglie che li leggono sono
  in pixel assoluti e non scalate (`SOGLIA_LEVETTA` 6, `STICK_DEAD` 12,
  `STICK_FULL` 46, `MAXR` 70, `R_ARMA`, `R_ANNULLA` 96). Quaranta pixel di
  trascinamento vogliono dire la stessa cosa dappertutto; quel che cambia è il
  punto da cui partono, ed è esattamente ciò che l'atto risolve.

  **DUE TIPI DI RIGA NUOVI** — 12 (l'atto) e 13 (lo scostamento) — e **i tipi 0
  e 1 restano LEGGIBILI**: un nastro di prima si rigioca come si rigiocava. Il
  gioco non li scrive più, tranne in un ripiego dichiarato: un movimento che
  arriva per un dito di cui non si è visto l'atto si scrive come pixel invece
  che buttarlo, e quel nastro porta un pixel — ed è proprio la presenza del
  pixel che fa scattare l'astensione.

  **E LA SQUADRA SMETTE DI ESSERE UNA DEDUZIONE.** `Touch5.teamOf` è avvolto
  dall'esterno con la stessa dottrina delle quattro porte: in rilettura torna la
  squadra **scritta nel nastro**, non quella dedotta da `innerWidth/2`.
  MISURATO (prova F, l'unica che gira in modalità 2): un tocco a `x = 500`
  registrato su una finestra da 1280 è della squadra 0; prima della cura lo
  stesso nastro riletto su una da 800 muoveva la levetta della squadra **1**.

  **LA VERIFICA STATICA CHE IL CENSIMENTO NON AVEVA FATTO.** Il progetto d'onda
  marcava «LETTO, non riverificato» la riga che rende piccolo tutto il
  cantiere: fra `function step(){` e la mira del duello — cioè per tutta la
  simulazione, `updatePlayer`, `updateBall` e `aiDecide` compresi — le
  occorrenze di `VW`, `VH`, `SCALE`, `OX`, `OY`, `innerWidth`, `innerHeight` e
  `devicePixelRatio` **nel codice sono ZERO**, e l'unica che si trova sta dentro
  un commento. **La simulazione non legge lo schermo**: confermato. E il DUELLO
  era già a posto — il tipo 6 porta `u,v` in millesimi, `duelMira` li arrotonda
  PRIMA di scriverli e `Reg.eseguiDuello` rigioca senza toccare un pixel —
  quindi questo cantiere non lo tocca.

  **IL BANCO — `strumenti/_q-schermi.js`, 8/30 → 30/30.** Un nastro onesto
  solo, registrato a 915x412 da due telefoni e da un server finto, giudicato
  su **sei bracci**: 800x360, 844x390, 915x412 (il controllo), 1280x720, un
  braccio col POLLICE al massimo (scala 150%, spazio 140%, mancino) e uno con
  la TACCA di un telefono in orizzontale (`env(safe-area-inset)` 44/59/21/59).
  **Due misure per braccio**, e la seconda è quella che conta: il VERDETTO, e
  il PUNTEGGIO rigiocato con l'astensione **aggirata** (la riga 10 riscritta
  alla misura locale, `_nastri-bugiardi.conSchermo`, il gemello esatto di
  `conMotore` del #142 e nato dalla stessa lezione) — senza il secondo il banco
  misurerebbe solo la propria guardia. Dopo la cura: **sei verdetti TORNA e sei
  punteggi 2-3**, cioè quello dichiarato, compresi il braccio del pollice e
  quello della tacca.
  **IL BANCO SI È CORRETTO DUE VOLTE, E TUTTE E DUE LE VOLTE PERCHÉ ATTESTAVA.**
  (1) La tacca a 34 px su tutti i lati spostava i dischi di **dieci** pixel, e
  quel braccio era verde **anche prima della cura**: adesso porta gli inserti
  veri di un telefono in orizzontale (35 px di spostamento, più di mezza presa)
  e un dito sul **bordo** della presa — a 45 px dal centro, `u = 0,9` — che è
  il caso peggiore e l'unico che valga costruire. Da lì la tacca smette di
  essere una curiosità e diventa un **NON TORNA**. (2) La prova **G** non
  esisteva, e senza di lei il banco **promuoveva due falsi su cinque**: una
  volta che l'atto porta l'esito e il disco, il punto ricostruito non decide
  più il PUNTEGGIO — tutto quel che viene dopo si misura in scostamenti dal
  punto di posa, che si cancellano — quindi un gioco che registrasse l'atto e
  poi rigiocasse dal PIXEL dava 21 prove su 24, **identiche alla cura onesta**.
  G guarda dove il riproduttore ha davvero posato le dita (`Reg.origine` dopo
  un giudizio, contro la geometria locale) e pretende che ogni posa di disco
  cada nella PRESA del disco che l'atto nomina.
  **E UNA MISURA CHE HA CORRETTO LA PROVA STESSA**: un atto d'erba **non** dice
  «il dito era fuori dagli anelli», dice «la risoluzione dei dischi non si è
  applicata» (squadra della macchina, o scena che non è di gioco) — e allora il
  dito può benissimo essere posato sopra un disco. Misurato: **112 atti d'erba
  su 197 cadono dentro un anello, e cadono dentro su tutti e sei i bracci nello
  stesso numero**. Non è un difetto di schermo: è quel che l'atto significa.
  Perciò G confronta il numero con quello del controllo, che è la domanda
  giusta.

  **CINQUE FALSI, tutti bocciati, bite list MISURATA su 30 prove** —
  `_crit-schermi-*`, impianto condiviso in `_crit-schermi.js`, due
  sostituzioni ciascuno (la porta che SCRIVE e il riproduttore che LEGGE: un
  falso che ne toccasse una sola sarebbe rotto, non bugiardo):

  | falso | la bugia | morde | prove |
  |---|---|---|---|
  | `pixel` | registra l'atto e rigioca dal PIXEL del registratore | G1 G2 G4 G5 G6 | 25/30 |
  | **`mezza`** | **la mezza cura**: normalizza il punto sull'ANGOLO della finestra e lascia aperti pollice e tacca | **G5 G6** | 28/30 |
  | `ricalcola` | la squadra sta nel comando e in rilettura si deduce di nuovo dalla x | F1 F2 | 28/30 |
  | `mossa` | le pose diventano atti, i trascinamenti restano pixel | B1 B4 B5 B6 · C1 C4 C5 C6 · D1 D2 · G1 G4 G5 G6 | 16/30 |
  | `grana` | lo scostamento quantizzato a sedici pixel | A2 | 29/30 |

  **LA MEZZA CURA È BOCCIATA, ed è il falso che conta.** Normalizza il punto
  contando dall'angolo in basso a destra (`VW - x`, `VH - y`), che è **esatto**
  come cura della finestra — i dischi sono ancorati proprio a quell'angolo,
  quindi i quattro bracci di sola finestra restano tutti verdi — e lascia
  aperti gli altri due canali. La bite list è la più stretta dei cinque:
  **due prove su trenta, G5 e G6**, cioè esattamente i due bracci gemelli. È la
  cura che chiunque scriverebbe leggendo solo il #133, e senza i bracci del
  pollice e della tacca sarebbe passata. `grana` morde **solo A2**, il
  controllo di esercizio, e lo dichiara in testa: un vettore corrotto è
  corrotto su ogni geometria, e la cosa che dice — diversa da quella degli
  altri quattro — è che il banco vede anche un comando CORROTTO, non solo un
  comando SPOSTATO.

  **`MOTORE_V` 3 → 4, DECISO COL NUMERO E NEI DUE VERSI**
  (`strumenti/_t-144-motorev.js`). *Verso 1*: quattro nastri registrati sul
  merge-base e rigiocati sul curato sono **identici 4 su 4**, ottanta campioni
  d'impronta ciascuno, nessuno scarto — la cura, di suo, **non cambia nessuna
  partita**, e il primo criterio del numero non scatta. *Verso 2*: quattro
  nastri registrati sul curato e rigiocati sul gioco di ieri finiscono in una
  partita **diversa 4 su 4**, tutti allo stesso campione (il primo, cioè entro
  il primo mezzo secondo), con **170 righe lette su 2749** — il gioco vecchio
  non ha un ramo per i tipi 12 e 13, li butta in silenzio e rigioca una partita
  in cui nessuno ha toccato lo schermo. Quel telefono non è un'ipotesi: è una
  copia in cache, e il service worker di casa **ignora la query string**,
  quindi restare indietro è facile. Senza il numero direbbe NON TORNA a un
  onesto; con il numero dice `ALTRO MOTORE / motore-diverso`, che è
  un'astensione con la causa vera. **IL PREZZO, DICHIARATO**: i nastri v3
  diventano ingiudicabili — si astengono, non vengono accusati — e costa poco
  perché il #143 ha alzato `MOTORE_V` a 3 **ieri**.

  **LE TRE ASTENSIONI DELLO SCHERMO NON SI TOLGONO: SI CONDIZIONANO.**
  Toglierle renderebbe giudicabili i nastri vecchi, che giudicabili non sono, e
  si tornerebbe ad accusare proprio la gente che il #133 aveva smesso di
  accusare; tenerle com'erano renderebbe inutile la cura. La regola nuova sta in
  una riga e **non è una data né una versione**: il nastro si astiene sullo
  schermo **se e solo se porta un PIXEL**, cioè se ha almeno una riga di tipo 0
  o di tipo 1 (`nastroHaPixel()`, letta dal giudice e dalla staffetta — una
  funzione sola, perché i due capi devono guardare la stessa cosa). Un nastro
  costruito a mano con un pixel dentro si astiene; un nastro di soli atti no. E
  **la riga 10 resta scritta**: non decide più niente, ma un referto deve poter
  dire su che telefono si è giocato.

  **LA STAFFETTA SI SEMPLIFICA, E CONTINUA A FUNZIONARE.** Raggruppava per
  `misura@impronta` per aprire una finestra della misura giusta. Un nastro di
  soli atti **non chiede nessuna finestra**: `misuraDelNastro` torna `null` e la
  chiave diventa `qualunque@impronta`. **Tre etichette e non due**: `qualunque`
  (i nastri di atti, che si giudicano dove capita), `ignota` (i nastri di prima
  del #133, che una finestra la chiederebbero e non sanno quale) e la misura
  vera (i nastri con un pixel dentro). Confonderle farebbe leggere un referto
  come se metà delle righe fossero casi persi, e non lo sono più. **Rettifica a
  edizioni** sul commento di `MISURA_SERIE`, che diceva «serve solo a sentirsi
  dire schermo-ignoto dal giudice»: dal #144 quella misura è la casa della
  maggior parte delle righe, non l'angolo dei casi persi.

  **LE RETI, E QUATTRO ROSSI CHE NON ERANO REGRESSIONI — sono il PREZZO,
  e si e' pagato dove andava pagato.** Alla prima corsa della batteria
  `giudice`, `sigillo`, `staffetta` e `finestra` sono usciti rossi, e le cause
  erano due, tutte e due previste dalla cura:

  1. **La fixture congelata** (`_nastro-duello-congelato.js`) era di un
     `MOTORE_V` piu' vecchio e veniva respinta con `ALTRO MOTORE` da quattro
     banchi in una volta — **esattamente quel che era successo al #143 ieri**,
     e la regola scritta allora vale oggi: «il rifiuto e' GIUSTO, e la cura e'
     **rigenerare**, non allentare». Rigenerata con
     `_gen-nastro-duello-congelato.js` (seme 20260803, 3-2, un duello vero dal
     dischetto).
  2. **Le prove che misuravano l'astensione dello schermo** non la trovavano
     piu': i nastri che quei banchi registrano oggi sono di ATTI, e un nastro
     di atti non si astiene — **e' la cura**. Ma le tre astensioni servono
     ancora ai nastri che stanno sul server adesso, quindi vanno ancora
     misurate, e con un nastro che un pixel ce l'abbia. Il coltellino nuovo e'
     `_nastri-bugiardi.conPixel`: **una riga di tipo 1 inerte in testa al
     nastro** — un movimento per un identificativo che non esiste, a (1,1), al
     tick 0 — che non muove niente e fa rispondere VERO a `nastroHaPixel()`.
     Usato in `_q-giudice` (P, Q), `_q-finestra` (tutto il gruppo B e i
     bisturi del gruppo C) e `_q-staffetta` (la fixture e la sfida vera).
     **Con una rettifica a edizioni in ogni file**, perche' quei banchi adesso
     misurano LA GUARDIA e non piu' IL DANNO: il danno non c'e' piu', e a
     misurare che non c'e' e' `_q-schermi`.
     **E `_q-sigillo` C3 si rettifica invece di essere puntellata**:
     pretendeva che la causa nominasse lo schermo, cioe' che il verdetto fosse
     un'astensione. Adesso e' **TORNA** — la sfida si verifica davvero su uno
     schermo diverso — e l'invariante che quel banco difende resta quella di
     sempre, soddisfatta piu' forte di prima: **MAI NON TORNA**.
     **E una prova NUOVA in `_q-staffetta`** (A4b): un nastro di atti finisce
     nel gruppo `qualunque@…`, uno con un pixel nella sua misura — se no il
     banco misurerebbe l'assenza del raggruppamento invece del
     raggruppamento.

  Dopo le due cure, **tutti e quattro verdi**: `giudice` 37 s, `sigillo` 37 s,
  `staffetta` 113 s, `finestra` 49 s. Batteria intera a gruppi, tutti i
  cancelli che contano VERDI: `duello-impronta`, `carta`, `amici`, `sospetto`,
  `collaudo`, `misura`, `senza-rete`, `eventi`, `salvataggio`, `replay`,
  `cpu-ordine`, `mira`, `invarianti`, `determinismo`, `determinismo-11`,
  `rete`, `sfida`, `ment-nastro`, `carattere-nastro`, `rosa-scala`,
  `nastro-tronco`, `glicko`, `fuzzer` 37 s, `soak` 53 s, `ritardo` 48 s,
  `ritardo-falsi` 92 s, `verbi-ritardo` 108 s, `motori`, `casa`, `perimetro`,
  `casa-falsi` 92 s, `motore-nastro` 66 s, `motore-falsi` 236 s, `schermi`
  49 s, `tocco` 150 s, e i ventidue della grafica e dell'interfaccia
  (`equita-sonda`, `equita`, `silhouette`, `folla`, `seme`, `gabbia`,
  `diritti`, `testo-fuori`, `carattere`, `disposizione`, `meta`, `divisioni`,
  `record`, `abbandono`, `volo`, `proporzioni`, `battute`, `regole`,
  `accessibile`, `fotosensibile`, `nomi`, `umore`). **Cinquantasette
  esecuzioni-cancello in tutto, tutte verdi.** Fuori batteria, i
  cancelli dello strato d'ingresso che questo cantiere tocca da vicino:
  `_q-precedenza` **9/9**, `_q-pollice` **8/8** (`_q-dischi` da PROVA NULLA
  — «da touchBtnLayout ho letto 7 dischi, ne servono almeno 8» — **anche sul
  merge-base**: pre-esistente, verificato). E `rete/prove/tutte.js`
  **46/46**.

  **QUEL CHE NON FA, DICHIARATO**: non tocca la simulazione (INV-12 regge: zero
  sorteggi nuovi, zero rami nuovi nella fisica); non tocca il duello (già
  semantico); non tocca la coda del ritardo del #141 (sta più fuori del
  registro, e l'ordine dito → coda → registro → `Touch5` non cambia); e resta
  **un residuo dichiarato**: la riadozione della levetta dopo una pausa
  (`Touch5.move`) chiede «questo dito è su un pulsante?» sulla posizione
  CORRENTE, cioè dopo il trascinamento. Il punto di POSA è invariante per
  costruzione, il punto dopo un trascinamento no, e la differenza fra i due capi
  è limitata dalla differenza dei raggi. Il banco lo esercita e oggi non morde;
  se un giorno mordesse, la cura è un bit in più sul tipo 13, non un disegno
  diverso.

- **La matematica in casa — #143 CANTIERE CHIUSO** (voce #143, 23 settembre
  2026, sei compiti dal merge-base `a2607d0` — spec
  `docs/superpowers/specs/2026-09-23-matematica-in-casa-design.md`, piano
  `docs/superpowers/plans/2026-09-23-matematica-in-casa.md`). È **la cura vera
  del blocco che il #141 aveva misurato e il #142 aveva solo aggirato**: tre
  motori JavaScript non facevano la stessa partita, e il #142 aveva curato
  l'**accusa ingiusta** che ne derivava dichiarandosi un ripiego. Qui il
  difetto si toglie alla radice, e il lockstep dell'onda E smette di essere
  impossibile.

  **LA CAUSA, IN UNA RIGA DI NORMA.** ECMA-262 lascia le trascendenti
  «implementation-approximated»: due motori possono dare l'ultimo bit diverso e
  restare tutti e due conformi. Misurato su 200 valori irrazionali, fra
  Chromium (V8), WebKit (JSC) e Firefox (SpiderMonkey): **`hypot` 103 su 200,
  `atan2` 24, `exp` 21, `tan` 9, `sin` 7, `log` 6, `cos` 3**. `sqrt` e `pow`
  **0 su 200** — la prima perché IEEE-754 la obbliga, la seconda per fatto e
  non per norma. In un motore caotico a sessanta passi al secondo un ultimo bit
  diventa un gol: **otto semi su otto** davano partite diverse.

  **IL PERIMETRO, MISURATO E NON DEDOTTO** (`strumenti/_q-perimetro.js`,
  compito 1). Uno scanner che salta commenti, stringhe, template ed espressioni
  regolari — perché metà del file è fatta di verbali che *parlano* di
  `Math.hypot` — conta **452 siti eseguibili** (sin 161, cos 105, sqrt 45, exp
  45, hypot 34, pow 30, atan2 27, tan 3, log 2). Accesi in una partita di
  novanta secondi a taglia 5: **53 dentro la simulazione, 100 solo nel disegno,
  74 solo al caricamento, 225 mai**. **243 chiamate per passo di simulazione,
  1187 per fotogramma disegnato.** E la **sostituzione sporca** (si guasta una
  funzione per volta e si guarda se l'impronta della partita cambia): **dentro**
  sin, cos, exp, atan2, hypot, pow, sqrt; **fuori** log (chiamata 259 volte,
  l'impronta non si muove nemmeno a 1e-9); **non misurata** tan (zero chiamate:
  che non è «innocente», è «non guardata»).

  **E LA PRIMA PROVA SPORCA ERA STATA RIFATTA**: aggiungeva un ulp a *ogni*
  valore e dava zero semi cambiati per tutte e sei le funzioni — avrebbe assolto
  l'intero perimetro in un colpo. Uno scarto sistematico verso l'alto si
  semplifica nelle differenze e nei rapporti che il gioco fa subito dopo. Due
  motori non sbagliano così: sbagliano metà dei valori, metà in su e metà in
  giù. Rifatta come sbagliano loro, il referto cambia verdetto.

  **LA SOSTITUZIONE È TOTALE, ED È UNA DECISIONE MISURATA**: **370 chiamate**
  dirottate (160 `Msin`, 104 `Mcos`, 44 `Mexp`, 33 `Mhypot`, 26 `Matan2`, 2
  `Mtan`, 1 `Mlog`), non le 53 viste. Sono i **225 mai accesi** il motivo:
  dentro ci stanno il rigore, la rimessa, la taglia 11, i verbi che in CPU
  contro CPU non escono mai. Innestare solo i 53 misurati sarebbe l'elenco
  troncato che questa casa ha già pagato dodici volte — verde al cancello, e la
  prima partita con un rigore che ricomincia a divergere fra due telefoni.

  **LE FUNZIONI** (`strumenti/_143-matematica.js`, copia sola: lo stesso testo
  che il gioco esegue e che il banco misura). Riduzione d'argomento di fdlibm —
  π/2 spezzato in tre pezzi da 33 bit perché `n * pezzo` resti **esatto** — e
  polinomi minimax, con sole operazioni che IEEE-754 obbliga a essere
  correttamente arrotondate (`+ - * /`, `sqrt`) più le intere, esatte per
  specifica. **Nessuna chiamata nativa dentro**: una sola rimetterebbe l'ultimo
  bit nelle mani del telefono. Il **tetto è dichiarato invece che scoperto
  dopo**: sopra 2^31 la via media di fdlibm perde i decimali senza dirlo, e lì
  si dà NaN — un seno sbagliato cammina nella fisica per novanta secondi, un NaN
  lo vede il primo passo. Il gioco, misurato, non supera 5,21e5.

  **LA SOGLIA, TENUTA** (`strumenti/_q-motori.js`, `_q-casa.js`). Sul dominio
  **vero** — gli argomenti che la partita passa davvero, raccolti chiamata per
  chiamata — le sette di casa danno **zero differenze su 12.242 valori** fra i
  tre motori, mentre sugli **stessi** argomenti le native divergono (`hypot`
  1120/3000 su WebKit e 1099/3000 su Firefox, `atan2` 507/3000 su Firefox,
  `log` 4/37). Lo scarto della casa dalla nativa sta entro **1 ulp** per sin,
  cos, exp, log e atan2 e **2 ulp** per hypot, contro un tetto di 4. E il
  cancello che decide, `_q-motori`, passa da **0 semi concordi su 8** a
  **20 su 20**: stessa impronta, stesso punteggio, stesso conto dei sorteggi.

  **`pow` E `sqrt` RESTANO NATIVE PERCHÉ MISURATO, non per fiducia**: 0
  differenze su 3000 argomenti veri. `pow` sta **dentro** il perimetro (120.016
  chiamate in 90 s), quindi non è un dettaglio: è un fatto delle implementazioni
  di oggi, e c'è una riga in `_q-casa.js` e una in `_q-motori.js` che diventano
  **rosse** il giorno in cui smettesse di esserlo, e dicono anche qual è la cura
  (scriverle in casa come le altre).

  **UN POSTO RESTA NATIVO PER FORZA**: `improntaMotore()` del #142, che dichiara
  *quale* motore ha calcolato un nastro e lo fa chiamando le sette native.
  Passandola da casa direbbe sempre «stesso motore» — attesterebbe invece di
  misurare, cioè il falso `_crit-motore-piatto` rinato dentro la cura. Il suo
  blocco è protetto per nome, e la toppa rifà la scansione dopo l'innesto e **si
  rifiuta di scrivere** se resta anche una sola chiamata nativa fuori di lì.

  **`MOTORE_V` 2 → 3, DECISO COL NUMERO** (`strumenti/_t-143-motorev.js`,
  compito 4). Sei nastri registrati sul gioco di `main` (`a2607d0`) e rigiocati
  sul curato, taglia 5, 2400 passi: **sei su sei finiscono in una partita
  diversa**, e tutti e sei divergono **entro il quarto campione** (uno al terzo,
  cinque al quarto), cioè entro il primo secondo e mezzo. Gli stessi nastri
  rigiocati sul gioco che li ha scritti tornano **6 su 6**, quindi il confronto
  non misura rumore. Con `MOTORE_V` a 3 la guardia che già esisteva in
  `vagliaNastro` scatta da sola: verdetto **ALTRO MOTORE**, causa
  `motore-diverso`, nessun accusato, nessun punto mosso — si perde il film, non
  la persona. Il blocco del marchio di tipo 5 **non si toglie lo stesso**, ed è
  una scelta dichiarata nel gioco: è l'unica guardia che separa «il duello non
  c'era nel nastro» da «il motore è cambiato», e costa un confronto di interi.

  **LA PRESTAZIONE, DUE VOLTE, E LA PRIMA NON VALE** (`strumenti/prestazione.js
  --contro fuori/143-prima.html`, compito 4). Alla prima corsa lo strumento **si
  è dichiarato cieco**: la sua prova (a) — lo stesso identico file contro sé
  stesso — ha dato **−28,6%** sul fotogramma medio con un ballo fra repliche del
  **1164%**, e la sua quinta avvertenza dice cosa fare in quel caso (non si
  allarga la soglia, e **il numero non si trascrive da nessuna parte**). Il
  referto che quella corsa aveva prodotto — un lusinghiero −29,4% sul fotogramma
  medio — **è stato buttato**, perché era indistinguibile dal suo stesso errore.
  Rifatta più tardi, a banco meno occupato (carico 44% contro 69%), **la prova
  (a) è passata: risoluzione 4,6%**, e il confronto appaiato col gioco di `main`
  dà **fotogramma medio 146,7 → 136,9 ms (−6,7%), tipico 146,4 → 144,7 ms
  (−1,2%), p95 191,7 → 191,7 ms (−0,0%)**, tutti e tre entro il +25% ammesso.
  **Letto onestamente**: il tipico e il p95 stanno **sotto la risoluzione**,
  quindi lì non c'è nessuna differenza credibile; il fotogramma medio è appena
  sopra, e va nella stessa direzione della misura per funzione. **Il gioco non
  scatta, e non rallenta.**

  **IL COSTO, MISURATO DOVE IL LAVORO È COSTANTE** (`strumenti/_t-143-costo.js`,
  compito 4). Un cancello che si dichiara cieco metà delle volte non basta a
  rispondere alla domanda seria di questo cantiere — 370 chiamate del gioco che
  passano da funzioni scritte in JavaScript — perché il rumore di un banco
  occupato è dello stesso ordine dell'effetto cercato. Il costo si è misurato
  anche dove il lavoro
  dentro il cronometro è costante: **duecentomila chiamate identiche, minimo su
  sette ripetizioni**. Per chiamata la casa costa `sin` ×1,86, `log` ×1,71,
  `cos` ×1,33, `exp` ×1,31, `tan` ×1,10 — ma `atan2` ×0,71 e **`hypot` ×0,50**,
  e `hypot` da sola è **191,7 chiamate per passo sulle 276** perché `len`, la
  distanza, passa di lì. Pesando ogni funzione per le chiamate che fa davvero:
  **−0,0026 ms a passo di simulazione**, cioè **−0,015% del budget** di un
  fotogramma a sessanta al secondo e −3,2% del passo (che costa 0,0799 ms).
  **La cura non costa: rende.** La misura diretta a partita intera (quattro semi,
  quattro ripetizioni della stessa partita, minimo) concorda nel segno: mediana
  **−32,8%**, gamma da −45,1% a −9,3%, risoluzione 9,0% — ma è la meno solida
  delle tre, perché fra i due file la partita non è la stessa. **Tre strumenti
  diversi, tre numeri diversi, un solo segno**: −0,015% del budget per funzione,
  −6,7% sul fotogramma medio appaiato, −32,8% sul passo a partita intera. In
  batteria `prestazione --contro HEAD` è **verde**.

  **DUE STESURE DELLO STRUMENTO DEL COSTO BUTTATE, E VANNO RACCONTATE.** La
  prima tirava avanti la stessa partita per settemila passi su una partita che
  ne dura cinquemilaquattrocento: dopo il fischio finale `simulate` torna
  subito, e il minimo teneva **i lotti vuoti** (0,0133 ms contro una mediana di
  0,1367 — l'impronta di un numero che misura il niente). La seconda riavviava
  la partita e apriva una **terza scheda** sullo stesso file per dichiarare la
  risoluzione, e quella terza scheda ha detto la cosa vera: fra un file e sé
  stesso la differenza era **0,0000 esatto** mentre fra i due file era il 160%.
  Due schede sullo stesso gioco col solito seme giocano *la stessa partita*: il
  minimo non misurava il rumore del banco, misurava **la fase più leggera della
  partita**. La cura non è una statistica più furba, è rendere costante il
  lavoro dentro il cronometro.

  **I QUATTRO FALSI, E LA LISTA DEI MORSI MISURATA**
  (`strumenti/_q-casa-falsi.js`, 9 controlli su 9). Prima di tutto
  l'**andata e ritorno**: `innesta(sguaina(gioco))` è il gioco **parola per
  parola**, 370 chiamate tolte e rimesse — così i mutanti nascono dal gioco di
  prima *ricostruito da quello di adesso* e non da un commit, e si prova per
  giunta che la cura è esattamente una libreria più un cambio di nome.

  | falso | la bugia | chi lo morde |
  |---|---|---|
  | `solo-hypot` | cura solo `hypot`, come il #141 aveva già in mano | `_q-motori` prova B: **4 semi concordi su 8**, e il primo che la smaschera è il **terzo** — un cancello a due semi l'avrebbe promossa |
  | `storta` | `M_S1` con tredici cifre invece di ventuno: uguale ovunque, e sbagliata | `_q-casa` prova U: **28 ulp** contro un tetto di 4, mentre la prova C (la SOGLIA) resta **verde** — ed è quel che la rende pericolosa |
  | `una-nativa` | 369 chiamate su 370, e quella che manca è `len` | la **guardia strutturale** della toppa (1 chiamata nativa fuori dal blocco protetto) **e** `_q-motori` prova B: **0 semi concordi su 8** |
  | `impronta` | anche `improntaMotore()` passa da casa | il confronto delle impronte del #142: col mutante **62859382 su tutti e tre**, col gioco vero chromium 3274447767 · webkit 4281245088 · firefox 1495105755 |

  Il numero di semi **non è un parametro del banco, è parte della soglia**: è
  la sola cosa che separa `solo-hypot` dalla promozione.

  **SETTE PROVE CHE NON POTEVANO PIÙ ESSERE VERDI, E NON ERANO GUASTI**
  (compito 4). `_q-motori` chiudeva con «21 controlli, 14 passati, 7 falliti»
  **seguito da** «SOGLIA-MOTORE TENUTA» e uscita 0. Le sette rosse erano le
  sette native che divergono — rosse **per costruzione**, perché la norma
  *permette* quella divergenza, e nessun lavoro dentro questa casa poteva
  renderle verdi. Uno strumento che conta fra i propri fallimenti sette righe
  che non possono passare insegna a leggere i suoi rossi senza crederci. Ed
  erano anche cieche: dopo il compito 3 il gioco non chiama più nessuna di
  quelle sette. Adesso **T è una misura dichiarata** più i due soli verdetti
  che può dare onestamente (almeno una nativa diverga ancora — altrimenti la
  prova H sarebbe verde per il motivo sbagliato, ed è la stessa guardia di
  `_q-casa` prova N; `sqrt` e `pow` concordi, che sono le due lasciate native
  apposta), e il cancello che mancava è la **prova H nuova**: le sette *di
  casa*, lette da `window.Msin` **sulla pagina del gioco vero** e non da una
  copia portata dal banco, perché una copia direbbe che la libreria di
  `strumenti/` è uguale ovunque, che non è la domanda. Conto finale:
  **21 controlli, 21 passati**. E l'uscita è stata riparata: prima si usciva 0
  appena la prova B era verde, e da oggi un rosso fuori da B è comunque un
  rosso. La **prova C** (la cura del #141, `hypot` riscritta come
  `sqrt(x*x+y*y)`) adesso **si salta dichiarandolo** quando la libreria c'è:
  rimetterebbe a posto una `Math.hypot` che il gioco non chiama più, e direbbe
  «la cura non basta» per il motivo sbagliato.

  **LA TORNATA DI RITARATURE, OGNUNA CON LA SUA RAGIONE** (compito 5). Cinque
  ancore si sono mosse, e **nessuna era una regressione**: ognuna misurata anche
  sul gioco di `main` con `--gioco fuori/143-prima.html`.

  1. **`_q-mira` PIENO-IDENTICO.** Chiedeva che il gioco e `base113` combaciassero
     **bit per bit**, e la riga diceva da sé «se combaciano, `MOTORE_V` non si
     incrementa». `MOTORE_V` è salito. Misurato prima di toccare niente: la
     traccia diverge al primo fotogramma di **5e-16 in relativo, cioè due ulp**,
     con **gli stessi indici** (chi mira chi) e tutti gli altri campi identici.
     La prova cambia **forma e non severità**: prima si chiede ancora
     l'identità esatta (e su `main` la si ottiene ancora, `MOTORE_V` 1 contro 2),
     e **solo quando l'identità è già rotta** si guarda se un cambio di motore
     *dichiarato* la spieghi, con gli indici uguali e lo scarto sotto **1e-9** —
     un tetto che sta sette ordini di grandezza sopra un ulp e quattro sotto un
     cambio di decisione. Misurato oggi: **2,4e-14**.
  2. **`_nastro-duello-congelato.js` rigenerato.** La fixture portava `MOTORE_V`
     2 e quattro banchi in una volta la respingevano con **ALTRO
     MOTORE/motore-diverso**: `giudice` (due prove), `finestra` (una),
     `staffetta` (**sette**). Il rifiuto era **giusto** — è la guardia che fa il
     suo mestiere — e il generatore prevedeva già questo giorno («si può
     rilanciare se una cura futura del motore invalida questa fixture»).
     Rigenerata: seme 20260803, 2-3, 19.508 byte stretti. `staffetta` e
     `finestra` tornano verdi da sole. **Il generatore è stato corretto prima**,
     perché il suo modello aveva perso due paragrafi di sapere pagato (il numero
     di sfide *non* è fisso da sessione a sessione; forzare `rigori()` a metà
     partita rompe la ripetibilità del nastro): una rigenerazione che cancella
     un verbale è una regressione di documentazione.
  3. **`_q-giudice` prova H.** «Cambia il seme e il verdetto deve diventare NON
     TORNA» — cioè «il giudice rigioca invece di leggere». Col seme `…7` la
     rigiocata incontra un calcio piazzato di cui il nastro non ha i comandi e
     il giudice **si astiene** (INCOMPLETO/duello-senza-righe): la dottrina del
     #133 e del #139 che fa il suo mestiere, non un guasto. Un seme solo rende
     la prova un sorteggio: adesso se ne provano **quattro** e ne basta uno, e
     tutti si stampano con la loro causa (misurato: `+7`
     INCOMPLETO/duello-senza-righe, `+13` **NON TORNA**), così un'astensione
     *sistematica* resterebbe rossa.
  4. **`_q-sfida` sezione 10 — una prova ferma al 21 settembre che nessuno aveva
     più svegliato.** Pretendeva che una partita passata dal dischetto **non si
     facesse vedere affatto**: era la cura del #132, su un gioco in cui i comandi
     del duello non entravano nel nastro. Il **#131** ce li ha messi, e da allora
     quel marchio non si scrive più. Era rimasta verde per due giorni perché
     **non si esercitava**: quando nessuna sfida della sessione incontra un
     calcio piazzato, il ramo `else` dà un verde gratis — e sul gioco di `main`
     quella sessione non ne aveva nessuna. Sul gioco del #143, che a parità di
     copione gioca partite diverse, ce n'era una, e la prova è diventata rossa
     **tre volte su tre**. Riscritta: o il replay **parte e finisce col punteggio
     dichiarato**, o **non parte e il gioco dice la causa**. Misurato al primo
     colpo: **tabellone 3-2, replay 3-2** — la promessa del #131 verificata da
     capo a fondo per la prima volta. E il ramo del verde gratis adesso si
     chiama **«PROVA NON ESERCITATA»**.
  5. **`_q-motore-nastro` A1 e la bite list di `_q-motore-falsi`.** A1 era
     l'esercizio del #142: col motore mascherato, il nastro di WebKit rigiocato
     su Chromium **deve** dare NON TORNA. Non lo dà più, e **non è un guasto, è
     la cura**: quel nastro adesso rigioca e **TORNA, 6 su 6**. A1 misura oggi
     proprio quello — che è una domanda **più forte** di «nessuno lo accusa»,
     perché quella la supererebbe anche un giudice che si astiene sempre — e la
     condanna del #142 si riproduce quando serve col gioco di prima
     (`--gioco fuori/143-prima.html`). Di conseguenza `A2` non può più mordere i
     falsi `muto` e `piatto`: col nastro che rigioca uguale, **nemmeno un
     giudice rotto accusa un onesto**. `A2` passa da `cade` a `tiene` per quei
     due — e i due restano bocciati lo stesso, da `E/F/F2` e da `C/F/F2`
     (`_q-motore-falsi` 14 su 14). **Il #142 non decade**: restano fuori dalla
     cura il disegno, `pow` e `sqrt` (native per misura, non per norma) e tutti
     i nastri scritti prima, che portano `MOTORE_V` 2.

  **`_q-duello-impronta` (44/44), `folla`, `seme`, `_q-volo`, il fuzzer, il
  soak, `_q-carta`, `_q-amici`, `_q-glicko`, `determinismo` e
  `determinismo-11` non hanno avuto bisogno di nessuna ritaratura**: sono
  passati al primo colpo sul gioco curato.

  **LA BATTERIA**, a sei gruppi (`--tutto` chiede più del tempo di un comando):
  19/19, 14/14, 5/5, 6/6, 15/15, e il gruppo dei cronometrici con `tocco`,
  `volti`, `giocata` e **`prestazione` verdi**. Più una corsa intera dei
  non-lenti in un colpo solo, a chiusura: **47 cancelli in 706 s, i 46 che
  contano tutti passati**. `audio` e `avvio-telefono`
  escono **3** (prova nulla: niente audio in questo banco, nessun telefono
  collegato) e **un 3 non accusa il gioco**; `istantanea` e `avvio` sono
  informativi e il loro registro di riferimento è del 20 agosto, su un file
  diverso da quello di oggi. **`istantanea` è rossa anche sul gioco di `main`**
  (45 quote su 56 contro le 42 su 56 del curato, stessi rilievi: erba senza
  soggetti oltre il tetto, terzo centrale vuoto, ombre): **non è il #143**, ed è
  un informativo il cui riferimento registrato era a sua volta una prova nulla,
  cioè nessuna quota da confrontare.

  > **RETTIFICA A EDIZIONI (24 settembre 2026, voce #149). QUESTA CONCLUSIONE
  > È ROVESCIATA, E LO ROVESCIA IL SUO STESSO NUMERO.** «45 su 56 prima, 42 su
  > 56 dopo» non è la prova che *non* è il #143: è **la prova che è il #143**,
  > e sono **tre quote perse**. La frase le ha lette come «rosso prima, rosso
  > anche dopo, quindi non è mio», ma il cancello non dà un rosso e basta: dà
  > un **conteggio**, e il conteggio è sceso di tre nel cantiere che stava
  > misurando sé stesso.
  >
  > **RIMISURATO IL 24 SETTEMBRE 2026, tre versioni, stesso seme (20260728),
  > stessa macchina, stesso strumento** (`strumenti/istantanea.js --gioco`):
  >
  > | versione | quote | ombre | terzo centrale abitato |
  > |---|---|---|---|
  > | `a2607d0` (merge-base del #143, cioè PRIMA) | **45 / 56** | 7 / 8 | 6 / 8 |
  > | `b87f512` (`main` di oggi) | **42 / 56** | 5 / 8 | 5 / 8 |
  > | il gioco del #149 | **42 / 56** | 5 / 8 | 5 / 8 |
  >
  > **Le tre quote perse sono due di OMBRE e una di TERZO CENTRALE ABITATO**, e
  > le altre cinque famiglie (erba, palla, figura, prato, centro sera) non si
  > muovono di una quota. **Non sono mai tornate**: da `a2607d0` a oggi il
  > numero è fermo a 42, e il #149 — che non tocca un pixel — lo lascia
  > esattamente lì.
  >
  > **E IL DANNO NON È SOLO DI TRE QUOTE.** Da quella frase in poi **42/56 è
  > diventata la base**, e il #145, il #147 e il #148 hanno archiviato lo
  > stesso rosso come «identico al merge-base» senza che nessuno riaprisse il
  > conto. **Un numero letto al contrario una volta diventa il riferimento di
  > tutti quelli dopo**: è la ragione per cui una quota che scende si
  > attribuisce subito, anche quando il cancello non conta.
  >
  > **Che cosa NON dice questa rettifica**: non dice *quale* riga del #143 ha
  > perso le tre quote. Dice che il confronto che il #143 ha fatto — `a2607d0`
  > contro il proprio curato — è il confronto giusto, e che il suo esito è
  > l'opposto di quello scritto. Trovare la riga è un cantiere di grafica, non
  > di aritmetica.

  **IN BATTERIA DA OGGI**: `motori` passa a **`conta:true`** — la riga che lo
  teneva informativo diceva «finché il guasto non ha un cantiere», e il cantiere
  c'è stato — più tre cancelli nuovi, `casa`, `perimetro` e `casa-falsi`, tutti
  `lento` e `solo` perché aprono tre motori veri (`casa-falsi` ne rilancia
  quattro corse).

  **COSA RESTA APERTO, dichiarato**: il **disegno** non passa da casa (la cura
  rende identica la simulazione, non la pittura: 1187 chiamate per fotogramma
  restano native, e non spostano la partita perché la cottura delle tele è già
  dietro il suo seme); **`pow` e `sqrt` native per misura e non per norma**, con
  due righe rosse pronte il giorno che cambiasse; **`tan` non misurata** nel
  perimetro (zero chiamate in novanta secondi a taglia 5) e innestata lo stesso,
  che è la scelta giusta ma resta una cosa non guardata; il **determinismo pieno
  vale a taglia 5** (voce #98, `rebuildCrowd` consuma PRNG in proporzione al
  campo).

- **Il motore nel nastro — #142 CANTIERE CHIUSO** (voce #142, 23 settembre
  2026, cinque compiti dal merge-base `fc25184` — spec
  `docs/superpowers/specs/2026-09-23-motore-nel-nastro-design.md`, piano
  `docs/superpowers/plans/2026-09-23-motore-nel-nastro.md`). Cura un
  **CRITICO IN PRODUZIONE dell'onda D** scoperto dal #141: **un giocatore
  onesto poteva essere accusato perché aveva un telefono di un'altra marca.**

  **LA CONDANNA, MISURATA SULLA CATENA VERA E NON RAGIONATA**
  (`strumenti/_q-motore-nastro.js`, compito 1). Due telefoni, il server finto,
  sfide giocate fino al fischio finale, e il nastro preso **dalla riga che il
  server ha ricevuto** — stretto e riallargato come fa la staffetta. Otto
  sfide oneste registrate su WebKit e rigiudicate con la finestra che il nastro
  dichiara (915×412, DPR 1, banco identico sui tre motori):
  **WebKit TORNA 8/8 · Chromium NON TORNA 7/8 · Firefox NON TORNA 1/8.** Alla
  corsa a sei nastri del banco definitivo: **5 accuse su 6 su Chromium, 2 su 6
  su Firefox.** Il critico è **peggiore dell'ipotesi**, non «qualche volta»: è
  la norma, perché fra un iPhone e un Android il motore JavaScript è **sempre**
  diverso e `staffetta.js` apriva `chromium.launch()` a riga fissa. NON TORNA è
  l'unico verdetto che muove punti: disfa `delta_a` e `delta_d` (li toglie a
  **due** persone), alza un `sospetto` che non decade mai e chiude la riga per
  sempre. L'unico nastro salvo su Chromium si era salvato **per fortuna** — la
  rigiocata era già divergiuta (3-3 contro lo 0-2 dichiarato) e si era fermata
  su un duello dal dischetto di cui il nastro non aveva i comandi: un'astensione
  per la causa sbagliata, non una cura.

  **LA CAUSA** è quella isolata dal #141: ECMA-262 lascia le trascendenti
  «implementation-approximated», e `Math.hypot` (`:8710`, 33 usi, una è `len`,
  la distanza) dà l'ultimo bit diverso su **100 valori su 200** fra V8 e JSC.
  Il nastro portava lo **schermo** (riga 10, #133) e non il **motore**, e
  `motore-diverso` — la causa che esisteva già — parla di `MOTORE_V`, cioè
  della versione del motore **di gioco**.

  **LA CURA È LA DOTTRINA DEL #133 E DEL #139: ci si astiene, non si accusa.**
  Una riga di tipo **11** nel nastro con l'**impronta funzionale** del motore.
  **Non lo `userAgent`**, per tre ragioni che non sono preferenze: è un dato
  personale che finirebbe su un server e nelle mani dell'avversario; cambia a
  ogni aggiornamento del browser senza che il motore cambi davvero; e si
  riscrive da una console in tre caratteri, mentre un conto **dev'essere
  fatto**. Il motore si dichiara **facendo il conto**: 64 ingressi irrazionali
  costruiti con sole moltiplicazioni e addizioni (che IEEE-754 obbliga a essere
  esatte, così quel che si misura è la *funzione* e non il valore), sette
  trascendenti ciascuno (`hypot`, `sin`, `cos`, `tan`, `exp`, `atan2`, `log`),
  i 448 risultati letti **a bit** — `Float64Array`→`Uint32Array`, perché
  `toString` arrotonda a 17 cifre e nasconde proprio l'ultimo bit — e ridotti
  con **FNV-1a a 32 bit**, che usa solo `^` e `Math.imul`, cioè operazioni
  intere esatte per norma, altrimenti l'impronta divergerebbe per colpa
  dell'impronta. **Mai zero**: lo zero è già la parola che dice «non c'è».

  **`pow` e `sqrt` sono escluse APPOSTA, ed è misurato perché**: IEEE-754 le
  obbliga a essere correttamente arrotondate, e un'impronta fatta con loro vale
  **1634607669 su tutti e tre i motori** — direbbe sempre «stesso motore».
  **L'impronta vera separa tutti e tre**: chromium **3274447767**, webkit
  **4281245088**, firefox **1495105755**, **stabile** su contesti freschi
  (misurato due volte per motore dal banco, più tre volte per motore dalla
  sonda `fuori/_sonda-142c.js`).

  **IL GIUDICE SI ASTIENE**, in coda ai controlli dello schermo (lo schermo ha
  tre cause che dicono cose diverse, una non riparabile in nessuna finestra; il
  motore è binario): impronta diversa → `INCOMPLETO/motore-js-diverso`, **col
  numero nel referto** perché chi chiama possa aprire il motore giusto;
  impronta **assente** → `INCOMPLETO/motore-js-ignoto`, **e ci si astiene lo
  stesso** — è la correzione di revisione che il #133 ha già pagato una volta
  (IMPORTANTE-1). **L'esito, misurato: da 5 accuse su 6 a ZERO**, tutte
  diventate `INCOMPLETO/motore-js-diverso`, e **su firefox da 2 a 0**. **E la
  copertura non si è mangiata niente: sullo stesso motore i sei nastri danno
  ancora TORNA 6 su 6.** 11 controlli su 11.

  **IL PREZZO DEI NASTRI VECCHI, DICHIARATO E NON STIMATO.** Tutti i nastri
  registrati prima di oggi diventano `INCOMPLETO/motore-js-ignoto`. **Quanti
  siano non si può contare da qui, e si dice invece di inventarlo**: il
  database di esercizio non sta nel repo e la staffetta non è mai stata
  lanciata contro un Supabase vero (le sue due credenziali stanno
  nell'ambiente). Quel che si è misurato è l'effetto: la prova E del banco
  porta un nastro vero da TORNA a INCOMPLETO, e **l'unica fixture di nastro del
  repo** (`_nastro-duello-congelato.js`, 142 222 caratteri, tipi di riga
  0,1,2,3,6,7,10) **non ha la riga 11: 1 su 1.** Si paga perché
  **l'alternativa all'astensione non è «verificarli», è ACCUSARLI** — quegli
  stessi nastri, sul motore sbagliato, danno NON TORNA 5 volte su 6 — e perché
  la riga resta a `verificata = 0`, cioè torna giudicabile da sé quando la
  staffetta apre il motore giusto.

  **E IL PREZZO SI È FATTO SENTIRE SUBITO, dove era giusto.** **Tre** reti di
  sicurezza usano quella fixture per misurare **altro** (il duello dal
  dischetto in `_q-giudice`, i cinque verdetti in `_q-staffetta`, la finestra
  che cambia in `_q-finestra`) e avrebbero smesso di misurare quel che dicono.
  Le prime due si sono viste subito; **la terza l'ha trovata la batteria**, ed
  è la ragione per cui la si rilancia intera a ogni compito: `_q-finestra` C1
  è uscita `INCOMPLETO/motore-js-ignoto` dove diceva `TORNA`. Si completa **a runtime** con l'impronta
  di chi giudica — che è vera: quel nastro fu registrato su un Chromium di
  questa macchina — invece di rigenerare la fixture con un numero fisso: quel
  numero cambia con la versione del browser, e una fixture legata al Chromium
  installato si spegne da sola altrove. Che un nastro **senza** riga 11 faccia
  astenere il giudice resta misurato dove deve esserlo, nella prova E.

  **LA STAFFETTA APRE IL MOTORE GIUSTO**, così l'astensione è una
  **complicazione operativa** e non una perdita di copertura — è il giudizio
  che la revisione del #133 ha dato per lo schermo. Il raggruppamento passa
  dalla misura alla **coppia (misura, impronta)** (`915x412@3274447767`), e
  all'avvio la staffetta **chiede** a ogni motore disponibile la sua impronta
  invece di indovinarla dal nome — l'impronta è una proprietà della *versione*,
  e una tabella per nome invecchierebbe in silenzio. **Misurato sul giro vero**
  (`_t-142-staffetta-motori.js`, 8/8): due sfide giocate davvero su due motori,
  con tutti e due in mano **due contesti, due TORNA, ognuna sul suo motore**;
  **con un motore solo**, la riga che chiede l'altro **non si giudica su quello
  che c'è** — resta a `verificata = 0`, non entra nel taccuino, nessuna parola
  parte per lei, e il referto la grida. Ripiegare sarebbe tornare al difetto.

  **E I REPLAY NON SI SPENGONO, MISURATO E NON DEDOTTO DAL CODICE**
  (`fuori/_sonda-142d.js`). `Sfida.guarda` usa lo stesso vaglio ma
  intercetta solo quattro cause **per nome**, e queste due non ci sono.
  La stessa sfida vera, guardata tre volte dal telefono del difensore —
  nastro intatto, nastro che dichiara un motore che non è quello di chi
  guarda, nastro senza nessuna riga 11 — parte tutte e tre le volte
  (`registroModo = 2`, scena `kickoff`, cinque uomini in campo), mentre il
  giudizio sugli stessi tre dice `TORNA`, `INCOMPLETO/motore-js-diverso`
  (col numero chiesto nel referto) e `INCOMPLETO/motore-js-ignoto`. Un film
  approssimato costa niente; un verdetto approssimato costa punti a
  qualcuno.

  **QUATTRO FALSI NEL CASO PEGGIORE, 14 su 14**, e ognuno morso dalla prova che
  dichiara, con la **bite list misurata**: **`muto`** (scrive l'impronta e non
  la guarda — il difetto di oggi travestito da cura, e la terza volta che la
  stessa ferita si presenta nello stesso posto dopo #132 e #133) cade su
  **A2, E, F, F2**; **`accusa`** (se ne accorge e dice NON TORNA invece di «non
  lo so» — il difetto del #133, già pagato una volta) su **A2, A3, F, F2**;
  **`piatto`** (impronta di sole `pow` e `sqrt`) su **C, A2, F, F2**;
  **`pauroso`** (si astiene sempre) su **A1b e B**, e passa **tutte** le altre
  otto — è la perdita di copertura mascherata da prudenza. Più il **controllo
  positivo**: il gioco vero passa **11 verdi su 11** e esce 0.

  **E DUE FALSI HANNO CORRETTO IL BANCO, ed è la parte che vale più del
  codice.** (1) `pauroso` faceva uscire il banco **3 invece di 1**: la prova A1
  contava le accuse col motore mascherato e, trovandone zero, dichiarava «prova
  nulla» — ma *zero accuse perché i nastri tornano* e *zero accuse perché il
  giudice si è astenuto* sono due cose diverse, e **un 3 non accusa nessuno**;
  per giunta si usciva prima di stampare la prova B, che è proprio quella che
  lo morde. Da lì **A1b** e la prova nulla spostata in fondo. (2) Lo stesso
  falso ha scoperto che il lettore di etichette di `_q-motore-falsi` filtrava
  `[A-Z0-9]+`: **la `b` minuscola di A1b non entrava**, la riga spariva da
  verdi e rosse, e il falso risultava «non morso». Da lì **V2**, che conta le
  undici etichette lette.

  **A1, IL CONTROLLO DI ESERCIZIO**, è la metà che manca a quasi tutti i banchi
  di questo genere: dopo la cura il giudice si astiene *prima* di rigiocare,
  quindi «zero accuse» potrebbe voler dire «non c'era niente da accusare». A1
  maschera l'impronta del nastro con quella di chi giudica
  (`_nastri-bugiardi.conMotore`), il giudice non si accorge di niente, rigioca,
  e dice quel che avrebbe detto senza la cura — **5 accuse su 6**. Se non ne
  trova nessuna il banco **esce 3** invece di dichiararsi verde, ed è successo
  davvero alla corsa da una sfida sola.

  **`MOTORE_V` RESTA 2, MISURATO** come nei #131/#132/#133/#139
  (`_t-132-motorev.js --prima fuori/gioco-142-base.html`): **30 nastri su 30**
  registrati sul gioco di `main` e rigiocati sul curato danno la stessa
  partita, impronta campione per campione, punteggio e conto dei sorteggi; zero
  semi dichiarati nulli, uno dei trenta passa dal dischetto. Le cure sono
  additive: per un nastro vecchio il codice nuovo non gira mai. Il diff del
  gioco è **216 righe aggiunte e 2 tolte** (le 2 sono la firma di `out` e la
  riga del referto, riscritte per estensione).

  **DUE ROSSI CHE NON ERANO REGRESSIONI, e misurati prima di scrivere la
  parola**: al primo giro della batteria `verbi-ritardo` e `audio` sono usciti
  rossi. Rimisurati **tre volte per versione, su due versioni**: sul gioco di
  oggi **3/3 verdi tutti e due**; sul gioco di `main` (`fc25184`)
  `verbi-ritardo` **NO-OK-OK**, e il banco si è dichiarato da sé «RUMOROSO
  OGGI». Era rumore, e lo era già prima del cantiere.

  **IN BATTERIA**: `motore-nastro` (conta, 6 sfide, ~68 s) e `motore-falsi`
  (conta, 4 sfide × 5 corse), tutti e due **`solo:true`** — e non per il
  cronometro: MISURATO che lanciati in compagnia di altri tre cancelli il
  `goto` scade a 30 s (tre motori veri e un file da 2,7 MB a sei contesti), e
  `motore-nastro` esce **2** («il banco è esploso», che non accusa il gioco ma
  non misura nemmeno) mentre `motore-falsi`, che lo rilancia, conta **zero
  etichette**. Da soli sono verdi; dentro il banco i tempi sono stati portati a
  120 s come seconda rete. `motori` del #141 resta a **conta:false**: è
  rosso per un guasto vero e aperto, e metterlo a true tingerebbe di rosso
  l'intera batteria per una cosa già a registro.

  **QUEL CHE QUESTA VOCE NON FA, ED È IL SEGUITO.** **La matematica scritta in
  casa** — le trascendenti dalle sole operazioni IEEE-esatte — che farebbe
  *convergere* i motori invece di far astenere il giudice. È il prerequisito
  che il #141 ha messo prima del #145, e la misura da tenere accanto è la sua:
  **sostituire il solo `hypot` con `sqrt(x*x+y*y)` fa convergere 7 semi su 8,
  non 8**; restano `sin` 7/200, `cos` 3/200, `tan` 9/200, `exp` 2/200. Cambia
  tutti i numeri del gioco e muove `MOTORE_V`. **E va detto che l'impronta è
  una condizione NECESSARIA, non sufficiente**: due motori che la danno uguale
  potrebbero ancora divergere su un valore non campionato, quindi il rischio
  residuo di accusa ingiusta è **ridotto, non azzerato**. La direzione
  dell'errore dell'impronta invece è sicura per costruzione — se cambia senza
  che il motore cambi (una versione nuova del browser, una macchina
  big-endian) si ottiene **un'astensione in più, mai un'accusa in più**. Terzo
  seguito: **il conto vero dei nastri vecchi in esercizio**, che si potrà fare
  solo con un database in mano.

- **Il metro del ritardo — #141 CANTIERE CHIUSO, e IL VERDETTO È NO** (voce
  #141, 23 settembre 2026, sei compiti dal merge-base `2e728d6` — spec
  `docs/superpowers/specs/2026-09-23-metro-ritardo-design.md`, piano
  `docs/superpowers/plans/2026-09-23-metro-ritardo.md`, progetto d'onda
  `docs/superpowers/specs/2026-09-23-onda-e-architettura.md`). **Primo
  cantiere dell'ONDA E**, e non costruisce niente: **è la misura che decide
  l'architettura**. Regola del committente sopra tutte
  (`_analisi/MAPPA-MANDATO.md:792-795`): «lockstep prima; il server
  autoritativo solo se **la misura dice** che il lockstep non basta».
  Cantiere di MOTORE solo per due agganci additivi, tutti per ancore
  (`_toppa-141-ritardo.js`, 2 ancore); **`MOTORE_V` resta 2, misurato**.

  **LE SEI SOGLIE SONO STATE SCRITTE E COMMITTATE PRIMA CHE UN BANCO
  GIRASSE** (`df4da67`, compito 0). Una soglia decisa dopo è un'opinione, e
  questo cantiere esiste per produrre un verdetto onesto — cioè un banco che
  **possa dire no**.

  ---

  ### (a) LA GAMBA D — DUE MOTORI, NON DUE SCHEDE. **È QUI CHE ESCE IL NO.**

  Fatta **per prima**, come il progetto d'onda chiede: costa un pomeriggio e
  può annullare l'intera onda. Il repo non aveva uno strumento che la
  vedesse. `_q-determinismo.js` dice «due telefoni vedono la stessa partita»
  facendo **un solo** `chromium.launch()` e aprendo due contesti della stessa
  istanza: la parola *telefono* lì dentro era un'**inferenza**, non una
  misura. Due telefoni veri sono un V8 su Android e un JavaScriptCore su
  iPhone.

  **`strumenti/_q-motori.js`** apre Chromium (V8), WebKit (JavaScriptCore) e
  Firefox (SpiderMonkey) e confronta la stessa impronta di `_q-determinismo`
  — parola per parola la stessa, o tre rossi diversi non sarebbero
  confrontabili.

  **MISURATO, e la SOGLIA-MOTORE NON TIENE.** Stesso seme **del gioco**
  (`__test.semina`, non `Math.random` seminato da fuori: quello nasconderebbe
  proprio ciò che si cerca), stesso copione, stesso banco, partite intere da
  90 s: **8 semi su 8 divergono al secondo 1**, e non di poco — punteggi
  finali `1-1` contro `2-0`, `0-0` contro `0-2`, `2-0` contro `1-3`; conto
  dei sorteggi 5.123 contro 4.284, 6.708 contro 3.761.

  **LA CAUSA È ISOLATA E SI CHIAMA `Math.hypot`.** ECMA-262 la lascia
  *implementation-approximated*, e V8 ne sbaglia l'ultimo bit rispetto a
  JavaScriptCore e SpiderMonkey su **100 e 103 valori su 200**. Il gioco la
  chiama **33 volte**, e una di queste è `const len=(x,y)=>Math.hypot(x,y)`
  (`CALCETTO-il-gioco.html:8710`), cioè la distanza, cioè il pezzo più caldo
  della fisica. La tavola completa, 200 valori, bit per bit:

  | funzione (usi nel gioco) | chromium vs webkit | chromium vs firefox |
  |---|---|---|
  | `hypot` (33) | **100/200** | **103/200** |
  | `sin` (160) | 7/200 | 7/200 |
  | `cos` (104) | 3/200 | 3/200 |
  | `tan` (2) | 9/200 | 9/200 |
  | `exp` (44) | 2/200 | 21/200 |
  | `atan2` (26) | 0/200 | **24/200** |
  | `log` (1) | 0/200 | 6/200 |
  | `pow` (30), `sqrt` (45) | 0/200 | 0/200 |

  **E QUI LA MISURA SI È CORRETTA DA SOLA, che è la ragione per cui otto semi
  invece di tre.** Rimettendo `Math.hypot` a `Math.sqrt(x*x+y*y)` in tutti e
  tre i motori — lecito **per norma**, perché IEEE-754 obbliga `sqrt` a
  essere correttamente arrotondata mentre `hypot` no — **a tre semi i motori
  tornavano identici** e il verbale avrebbe scritto «il guasto è una riga».
  **A otto semi sette convergono e uno no**: al seme `20260929` WebKit si
  stacca al secondo 44. **Una riga non basta.** Restano `sin`, `cos`, `tan`,
  `exp`, che il gioco chiama 160, 104, 2 e 44 volte.

  **DUE PROVE ESISTONO PER NON ACCUSARE LA COSA SBAGLIATA**, e una delle due
  ha già pagato per sé. **S) lo stesso banco** — schermo, DPR, campo, uomini
  e sorteggi al fischio d'inizio devono coincidere. Nasce da un **falso
  allarme pagato oggi**: la prima versione passava `isMobile: true` **solo a
  Chromium** (Playwright non lo accetta su Firefox), il DPR di 3 faceva
  cuocere tele diverse, e lo strumento stampava un **NO all'intera onda E**
  mentre misurava il proprio `deviceScaleFactor` — 1.323 sorteggi contro 880.
  **A) dentro ogni motore la partita si ripete**: se non si ripete, il rosso
  è del banco e si esce 2 senza accusare nessun motore. Tutti e tre: verdi.

  **CONSEGUENZA PER L'ONDA E, in chiaro.** Il lockstep puro come lo descrive
  il progetto d'onda §2 — due telefoni che simulano la stessa partita dai
  soli comandi — **oggi non esiste fra motori diversi**, e la rete non
  c'entra: divergono da soli. Prima del #145 serve un **prerequisito nuovo,
  non previsto dal progetto d'onda**: *la matematica scritta in casa*, cioè i
  trascendenti caldi implementati in JavaScript a partire dalle sole
  operazioni che IEEE-754 obbliga a essere esatte (`+ − × ÷ sqrt`). È
  esattamente la ragione per cui i netcode deterministici seri usano il
  fixed-point, e il mandato lo fa (`SimCore Q20.12`,
  `_analisi/MANDATO-STADIUM-ROAR.md:414`). **`_q-motori` è in batteria con
  `conta:false`**: oggi è rosso per un difetto vero e aperto, e metterlo a
  `true` renderebbe rossa l'intera batteria per un guasto già a registro —
  il modo più sicuro di far smettere di guardare la batteria.

  ---

  ### (b) LA GAMBA A — IL NASTRO TRASLATO, e la forma della curva vale più del sì/no

  `strumenti/_q-ritardo.js`: **120 nastri onesti** a taglia 5, partite intere
  (5.400 tick), registrati col copione fisso di `_q-sfida.js` — quello che
  tocca tutti i verbi e non sorteggia niente — e rigiocati traslando **ogni
  comando di +K tick**, K ∈ {0,3,6,9,12,15,18}. In testa al banco sta la
  dichiarazione che lo rende onesto: **misura il CASO PEGGIORE**, il
  giocatore che non si adatta. È un **limite superiore al danno**, non
  l'esperienza umana.

  | K | ms | gol comandato | tiri nello specchio | tiri | fedeltà |
  |---|---|---|---|---|---|
  | 0 | 0 | **1,01 ± 0,07** | **1,27 ± 0,09** | 5,70 ± 0,18 | 0,786 |
  | 3 | 50 | 0,71 ± 0,07 | 0,95 ± 0,10 | 5,71 ± 0,17 | 0,769 |
  | 6 | 100 | 0,68 ± 0,07 | 0,91 ± 0,08 | 6,00 ± 0,17 | 0,765 |
  | 9 | 150 | 0,77 ± 0,08 | 0,98 ± 0,09 | 5,27 ± 0,16 | 0,742 |
  | 12 | 200 | **0,78 ± 0,08** | **1,03 ± 0,10** | 5,16 ± 0,19 | 0,542 |
  | 15 | 250 | 0,65 ± 0,07 | 0,87 ± 0,08 | 5,33 ± 0,19 | 0,317 |
  | 18 | 300 | 0,72 ± 0,09 | 1,02 ± 0,10 | 5,51 ± 0,20 | 0,174 |

  **LA FORMA DELLA CURVA È UN GRADINO, NON UNA RAMPA, ed è la cosa più utile
  che esca da questo cantiere.** Danno sui gol a K=3: **29,8%**; a K=18:
  **28,9%**; scarto fra i due **0,01 ± 0,22 → non distinguibili**. Sullo
  specchio: 25,0% contro 19,7%, scarto 0,07 ± 0,27 → non distinguibili. **Il
  costo del ritardo si paga TUTTO nei primi 50 millisecondi**: a 50 ms il
  nastro ha già smesso di sapere dove sta la palla, e ritardarlo ancora non
  peggiora niente di misurabile.
  Per un lockstep sono **due notizie insieme**. La buona: **scegliere D fra 3
  e 18 tick costa quasi niente in gioco**, quindi il margine contro il jitter
  — che è la cosa che rende un lockstep vivibile — **si può comprare senza
  pagarlo**. La cattiva: **non esiste un D piccolo che eviti il danno**; o si
  accetta il gradino, o non c'è nessun K>0.
  E **la fedeltà invece cala davvero** (0,786 → 0,174): il comandato smette
  di fare quel che gli si chiede. Il gioco lo assorbe; **la persona forse no,
  ed è la gamba C**.

  **SOGLIA-DANNO alla D dichiarata (12 tick = 200 ms): gol 23,1% ± 20,7%
  (estremo alto 43,8%), specchio 18,4% ± 20,9% (estremo alto 39,4%).** Le due
  stime puntuali stanno **sotto** il 25%; l'intervallo **non esclude** il 44%.
  Il banco confronta con la soglia l'**estremo alto** — la domanda del
  committente è «può essere peggio?» — quindi **D_gioco misurato = 0 tick**,
  contro i 12 che la SOGLIA-D richiede.

  **IL BANCO SI È CONDANNATO DA SOLO TRE VOLTE, e ogni volta ha imparato un
  cancello.**
  1. Su 3 nastri da 15 s la squadra comandata aveva fatto **zero gol e zero
     tiri nello specchio**, a K=0 come a K=18. Il peggioramento risultava
     «0,0%», sotto il 25%, e il banco stampava **SOGLIA-DANNO TENUTA** — un
     sì all'intera onda E — **misurando il nulla**. Il venticinque per cento
     di zero è zero. Adesso sotto 20 tiri nello specchio e 8 gol si esce 3.
  2. A 24 nastri da 90 s gli eventi ci sono, ma la media dei gol vale 1,00
     con scarto tipo 0,88: **errore della media 18% contro una soglia del
     25%**. La stessa misura con altri ventiquattro semi darebbe «8%» o
     «40%» senza che il gioco cambi di un bit. Adesso il danno si stampa col
     suo intervallo, e quando l'intervallo scavalca la soglia il banco
     dichiara **PROVA NULLA e dice quanti nastri servono**: ne ha chiesti
     **119**, e sono stati fatti 120.
  3. **Tre prove che guardano il BANCO invece del gioco**, prima della
     misura, perché un metro storto non va riconosciuto dai suoi numeri.
     **0a** chiede a ogni riga di essersi mossa **nel campo giusto** — i
     comandi sul tick, il dischetto sul **passo** (`Duel.passo`: il suo tick
     è un campo morto, perché durante un duello `Reg.tick` sta fermo), i
     metadati fermi. **0b** chiede che il metro **vari** fra 120 partite
     diverse. **0c** è il **controllo negativo**: rigiocato lo stesso nastro
     con **ogni** comando tolto, la squadra comandata deve andare molto
     peggio (misurato: 14 gol → 0, 20 tiri nello specchio → 0).

  **E UN DIFETTO DEL BANCO TROVATO DAL BANCO.** A 120 nastri il cancello di
  K=0 ha morso **1 volta su 120** (seme `20260950`, registrato 1-3 con 4
  tiri, rigiocato 1-3 con 3 tiri). Non divergeva niente: **tre rigiocate di
  fila identiche fra loro e identiche in tutto il resto** — stesso punteggio,
  stesso specchio, **stessi 6.251 sorteggi**. Mancava l'ultimo rilascio del
  dito, che è un tiro: il copione chiudeva le dita **dopo** il ciclo, cioè al
  tick `passiMax`, e la rigiocata gira esattamente `passiMax` passi e
  attraversa i tick da 0 a `passiMax-1`. **La stessa ferita sta nel copione
  di `_q-sfida.js:274-275`**, dove non fa danno perché quel banco non
  confronta una registrazione con una rigiocata a tetto fisso: è scritto nel
  codice perché chi lo copierà lo sappia.

  ---

  ### (c) LA GAMBA B — I CINQUE VERBI SOTTO RITARDO

  **Non si è copiato `giocata.js`: gli si è aggiunto `--ritardo K` e basta.**
  Una copia è un posto in più dove la stessa ferita si riapre da sola.
  `_q-verbi-ritardo.js` orchestra le ripetute, perché **il banco a tocchi
  veri non è ripetibile** (regola di casa) e un solo rosso non è una prova.

  Sei ripetute per K ∈ {0, 6, 12, 18}, **semi appaiati** (stessa scena a ogni
  K):

  | verbo | K=0 | K=6 | K=12 | K=18 |
  |---|---|---|---|---|
  | carica (TIRA) | 6/6 | 6/6 | **6/6** | 6/6 |
  | filtrante | 6/6 | 5/6 | **6/6** | 6/6 |
  | cross | 6/6 | 6/6 | **6/6** | 5/6 |
  | cambio | 6/6 | 6/6 | **6/6** | 6/6 |
  | contrasto | 6/6 | 6/6 | **6/6** | 5/6 |

  **Nessun verbo muore a 200 ms.** I tre 5/6 sparsi sono il rumore del banco
  a tempo reale, misurato: su gioco sano **a ritardo zero** il cross è caduto
  in una corsa e la filtrante in quella dopo.

  **E LA CARICA — il punto che il progetto d'onda dava per il più fragile —
  NON LO È, e la ragione è istruttiva.** Carica maturata: a K=12 **6/6 dentro
  la finestra dolce 0,50-0,80 s**, valori 0,63 0,63 0,63 0,65 0,65 0,65.
  **Un ritardo d'ingresso UNIFORME non cambia la durata di un gesto tenuto**:
  ritarda di K sia la pressione sia il rilascio, e la carica è la differenza
  fra i due. La finestra dolce è al sicuro dal ritardo **fisso**; sarebbe in
  pericolo dal ritardo **variabile**, dove pressione e rilascio slittano di
  quantità diverse — ed è precisamente ciò che il #143 e il #146 devono
  misurare.

  **QUANTO PUÒ DIRE QUESTO CAMPIONE, detto dal banco stesso.** Per decidere
  «≥ 95%» servono **60 tentativi per verbo e per K** (regola del tre): con 6
  l'estremo basso è 61%. **La SOGLIA-VERBI al 95% NON è decisa**, e lo
  strumento non finge di averla decisa. Ciò che il campione decide comunque è
  **se un verbo muore**, ed è la porta del NO che questa gamba tiene.

  ---

  ### (d) LA GAMBA C — **NON ESEGUITA, IN ATTESA DEL COMMITTENTE**

  È l'unica delle quattro capace di pronunciare la parola **«ingiocabile»**,
  e l'unica che un banco non può fare al posto di una persona. **Fingerla
  sarebbe il peggiore dei verdetti falsi**, perché sarebbe l'unico a parlare
  a nome di chi gioca. Non è stata sostituita con un'opinione né dedotta
  dalla gamba A.

  **È PRONTA:** l'aggancio `__test.ritardo(K)` nel gioco,
  `strumenti/_prova-umana-ritardo.js` (sei partite da 90 s, K pescato in
  cieco dal mazzo {0,3,6,9,12,18}, **sigillo dell'ordine scritto nel verbale
  prima della prima partita**, riscaldamento non votato, due voti per
  partita) e il protocollo in
  `docs/superpowers/plans/2026-09-23-protocollo-prova-umana.md`.

  **IL LIMITE CHE LO STRUMENTO SI GUARDA DA SÉ: serve un dito, non una
  tastiera.** `__test.ritardo` accoda **le quattro porte di `Touch5`** e
  basta; la tastiera entra dritta in `Keys[e.code]`
  (`CALCETTO-il-gioco.html:12698`, `:12734`) e **non subisce nessun ritardo**.
  Una partita ai tasti direbbe «bellissimo» di una cosa non provata. Lo
  strumento registra il nastro di ogni partita, conta le righe, e **scarta il
  voto** se trova righe di tastiera o meno di 50 righe di tocco.

  **CHE COSA CAMBIEREBBE SE L'UOMO DICESSE NO** sta scritto nel protocollo
  §6: cadrebbe la SOGLIA-D e con essa il margine, e resterebbero tre strade
  in quest'ordine — D più piccola (solo se il #143 misura una rete che la
  regge), **il 1v1 a turni** del progetto d'onda **§5.4** (rettifica a
  edizioni, 24 settembre 2026, voce #149: il puntatore diceva §5.3, che è
  «che cosa sopravvive a un NO»; la terza via sta al §5.4, ed è lì che sta
  anche la frase «non è il gioco che il committente ha chiesto») (che sta
  dentro l'architettura di oggi), e il server autoritativo col prezzo scritto in
  chiaro. **Nessuna delle tre butterebbe il lavoro già fatto.**

  ---

  ### (e) I TRE FALSI, ognuno nel caso peggiore, e il controllo positivo

  `_q-ritardo-falsi.js`, **7/7**. Ogni falso porta scritto nel proprio file
  quale prova deve farlo cadere, e cade su quella:

  | falso | che cosa fa | morso da | altre prove |
  |---|---|---|---|
  | `_crit-traslazione-sorda` | muove **i metadati e il tick del dischetto**, cioè i soli campi che nessuno legge: la partita resta identica al bit | **0a** | uscita 2 prima delle altre |
  | `_crit-traslazione-cieca` | ritarda **solo i `touchmove`**: la levetta sbanda, la curva del danno esce plausibile, ma i **verbi partono in orario** perché l'atto si risolve al `touchstart` | **0a** | uscita 2 prima delle altre |
  | `_crit-ritardo-attestatore` | traslazione **onesta**, ma legge `G.stats[1]` — i numeri della CPU — come se fossero della squadra comandata: numeri veri, che variano, che riempiono le soglie di eventi, e che non mostrano danno perché la CPU non è ritardata | **0c** | **0a: OK, 0b: OK** |

  Nessuno dei tre è la versione ingenua: «non toccare niente» morirebbe
  contando le righe; «torna sempre zero» morirebbe sul cancello della prova
  nulla; «torna sempre lo stesso numero» morirebbe sulla 0b. **E c'è il
  controllo positivo**, che è la metà che manca a quasi tutti i banchi di
  falsi: prima si verifica che il banco **onesto** passi le tre prove
  strutturali. Senza, un banco rotto in modo da essere rosso *sempre*
  «condannerebbe» tutti e tre i falsi senza discriminare niente — ed è il
  modo in cui un banco di falsi diventa a sua volta un attestatore.

  ---

  ### (f) I DUE AGGANCI NEL GIOCO, e `MOTORE_V` misurato

  `_toppa-141-ritardo.js`, 2 ancore.

  **`__test.ritardo(K)`** accoda i comandi di K tick **senza rete di mezzo**.
  L'avvolgimento sta **più fuori** di quello del registratore, e l'ordine è
  tutto: *dito → coda → registratore → `Touch5` vero*. Così il comando si
  **registra al tick in cui esegue**, non a quello in cui il dito lo ha dato:
  il nastro deve raccontare quel che è successo, se no il replay di una
  partita ritardata non sarebbe quella partita. **L'orologio è suo**, perché
  `Reg.tick` avanza solo a registro acceso (`passo()` esce subito se
  `modo === 0`) e la prova umana si gioca a registro spento: una coda appesa
  a un orologio fermo non scade mai. **In rilettura la coda non c'è**, se no
  la traslazione del nastro e il ritardo del dito si sommerebbero. E **la
  coda si svuota con `Reg.azzeraComandi`**: un comando accodato che
  sopravvive a una partita è la stessa malattia dell'origine della levetta,
  in forma peggiore — arriverebbe dentro la partita **dopo**.

  **`__test.dita(dx,dy,premi)`** inietta un comando **passando dalle quattro
  porte vere**, non scrivendo dentro `Touch5.stick`.

  **MISURATO che i due agganci sono additivi**: a ritardo spento il gioco
  nuovo e quello vecchio giocano la stessa identica partita, impronta per
  impronta, con le stesse **627 righe di nastro**. **`MOTORE_V` resta 2**, e
  lo dice una misura invece di un'affermazione.

  ---

  ### (g) LE DUE RETTIFICHE A EDIZIONI

  1. **`strumenti/_q-determinismo.js`, prova C — era INERTE, adesso misura.**
     Quel banco diceva da mesi «con le dita: la stessa sequenza rigiocata dà
     la stessa partita» e la dichiarava **«la prova che riguarda il
     multigiocatore»**, ma chiamava `t.dita(...)` dentro un `if (t.dita)` e
     quella chiave **non esisteva**. Stampava una riga di scuse in mezzo a
     dieci righe verdi, e chi leggeva «determinismo 10/10» credeva coperta la
     gamba dell'**ingresso** — proprio quella che decide se sulla rete
     bastano i comandi. Dal 23 settembre la chiave c'è e il banco fa
     **11/11**. Rettifica in chiaro accanto al testo vecchio in
     `strumenti/tutti.js`.
  2. **`strumenti/_q-invarianti.js:425-431`, INV-13 e INV-14 «N/A perché
     CALCETTO è locale».** **INV-14 è superata**: «una volta sola» è
     garantito dal DELETE che consuma l'impegno (`rete/api/sfida.js:163-164`),
     e il ruolo dell'«hash di replay» lo fa **il nastro**, che il giudice
     dentro il gioco rigioca e confronta (guardato da `_q-giudice` 21/21 e
     `_q-sospetto` 39/39); resta scoperta **solo** la firma, e la postura
     «nessuna chiave nell'HTML» è la ragione per cui non c'è. **INV-13** è
     N/A **per assenza di server simulante**, non per assenza di rete: la
     rete esiste dal #133, e il server non simula per scelta scritta
     (`rete/LEGGIMI.md:76-79`).

  ---

  ### (h) IL VERDETTO, applicando le soglie dichiarate il 23 settembre

  | soglia | esito |
  |---|---|
  | **SOGLIA-MOTORE** (impronte identiche fra motori) | **NON TENUTA — 8 semi su 8 divergono. È il NO, ed è il più pesante** |
  | **SOGLIA-DANNO** (≤ 25% a D=12) | stima puntuale **sotto** (23,1% e 18,4%), intervallo **non la esclude** (44%). D_gioco misurato **0 tick** contro i 12 richiesti |
  | **SOGLIA-VERBI** (≥ 95%, carica ≥ 90%) | **nessun verbo muore**, carica 6/6 in finestra a 200 ms; il 95% **non è deciso** da 6 tentativi, e il banco lo dichiara |
  | **SOGLIA-UMANA** | **NON ESEGUITA — richiede il committente** |
  | **SOGLIA-D** (`D_gioco ≥ 12 tick`) | **non raggiunta** |
  | **SOGLIA-STALLO** | fuori da questo cantiere, si verifica al #143 |

  **IL LOCKSTEP PURO NON È AMMESSO OGGI, e il blocco non è quello che si
  temeva.** Non è il ritardo: è **il motore JavaScript**. Il gioco, al caso
  peggiore, perde il 23-30% di gol a *qualunque* K>0 — ma quel numero è
  **piatto**, quindi la scelta di D è quasi libera e il margine contro il
  jitter è comprabile. Il vero ostacolo è che **due telefoni divergono da
  soli, senza che la rete c'entri**, e la causa è un ultimo bit di
  `Math.hypot`.

  **COSA CAMBIA NEL PIANO DEI CANTIERI.** Prima del #145 (il filo) entra un
  prerequisito che il progetto d'onda non aveva: **la matematica scritta in
  casa** — i trascendenti caldi implementati in JavaScript dalle sole
  operazioni IEEE-esatte. Il #142 (il comando senza schermo) **non cambia**:
  paga il debito del #133 in tutti i rami. Il #143 (la misura della rete)
  **non cambia** ed è più urgente di prima, perché ora sappiamo che D può
  essere generosa e la domanda diventa «quanta ne serve». Il #144 (la stanza)
  sopravvive a qualunque verdetto.

  **CANCELLI.** `_q-ritardo` **in batteria con `conta:true` in modo
  `--solo-banco`**: guarda che la macchina regga (la traslazione trasla, il
  metro varia, il controllo negativo morde, a K=0 il nastro si riproduce
  esatto, a 300 ms il ritardo si vede) e **non applica la SOGLIA-DANNO**,
  perché per quella servono 120 nastri e un quarto d'ora — in batteria
  direbbe PROVA NULLA a ogni corsa, e un cancello che ogni giorno dice «non
  ho potuto misurare» insegna a ignorarsi. `_q-ritardo-falsi` in batteria,
  `conta:true`, 7/7. `_q-verbi-ritardo` in batteria, `conta:true`,
  `solo:true` (banco a tempo reale: in compagnia misurerebbe il carico della
  macchina), con la porta stretta apposta — «un verbo **muore**», non «un
  verbo riesce nel 95%». `_q-motori` in batteria **`conta:false`**, oggi
  rosso per un difetto vero e aperto (12/23). `_q-determinismo` **11/11**
  (era 10/10 con una prova inerte). `giocata.js` prende `--ritardo K` e a
  `--ritardo 0` è identico a ieri.

  **RETI DI SICUREZZA, a cantiere chiuso:** `_q-duello-impronta` **44/44**,
  `_q-giudice` **21/21**, `_q-sigillo` **14/14**, `_q-carta` **22/22**,
  `_q-amici` **23/23**, `_q-sospetto` **39/39**, `_q-staffetta` **42/42**,
  `_q-finestra` **20/20**, `_q-glicko` **58/58**, `_q-invarianti` **12/12**,
  i quattro del #132, `_q-rete`, `_q-sfida` **54/54**, `senza-rete`,
  `salvataggio`, `rete/prove/tutte.js` **46/46**. **Batteria intera a cinque
  gruppi, tutti i cancelli che contano verdi.**

  **E UN ROSSO CHE NON ERA UNA REGRESSIONE.** Al primo giro `sfida` è uscito
  rosso su una prova su sei («ogni sfida senza duello si lascia rivedere»,
  5/6). Misurato **tre volte** prima di scrivere la parola regressione: da
  solo sul gioco di oggi **54/54**, da solo sul gioco di `main` **54/54**, e
  col gruppo intero a `--ripetuto 2` **54/54 e 54/54**, con il banco che
  dichiara «nessun cancello diverge su 2 corse: oggi la batteria è stabile».
  Era rumore di un banco a tempo reale.

- **Il rating nascosto, Glicko-2 — #140 CANTIERE CHIUSO** (voce #140, 23
  settembre 2026, cinque compiti dal merge-base `562e62e` — spec
  `docs/superpowers/specs/2026-09-23-glicko-design.md`, piano
  `docs/superpowers/plans/2026-09-23-glicko.md`). **Il punto 13 del
  programma, l'ultimo dell'onda D** (`_analisi/MAPPA-MANDATO.md:767`).
  Cantiere di SERVER: `git diff main -- CALCETTO-il-gioco.html` è
  **vuoto**, `MOTORE_V` resta **2**.

  **(a) LA DECISIONE, presa con una misura e non con una lettura.** Il
  mandato si può leggere in due modi, e i due modi stanno scritti in due
  righe diverse dei nostri stessi documenti: il rating nascosto
  **accanto** ai punti visibili (`MANDATO-STADIUM-ROAR.md:163-164`,
  «hidden rating» e «visible trophy ladder» come due cose) oppure **al
  posto** dell'Elo (`MAPPA-MANDATO.md:479`, «sostituire `elo()`»).

  Si è fatta la prima, e la ragione non è di lettura: **i punti di
  CALCETTO non sono un rating e non possono diventarlo**. Quattro
  decisioni prese apposta e scritte in chiaro in `rete/api/sfida.js` —
  il difensore perde metà di quel che l'attaccante guadagna, la serie di
  vittorie moltiplica fino a ×1,3, c'è un pavimento a 100, contro un
  avversario costruito si prende metà senza toglierlo a nessuno — e
  ognuna delle quattro **crea valore dal nulla**. È giusto che lo
  faccia: i punti sono una *valuta* che premia il giocare. Un rating
  invece si conserva. Misurato su una popolazione simulata di 400
  allenatori e 18.546 sfide: il totale dei punti deriva del **+1,6 % in
  sessanta giorni**. E la (b) riscriverebbe la classifica di tutti in
  una notte senza avere il posto dove farlo, perché il committente ha
  **escluso ogni azzeramento stagionale** (`MAPPA-MANDATO.md:707`).

  L'altra metà della decisione: il rating nascosto stima l'abilità vera
  **meglio** dei punti — rho di Spearman 0,974 contro 0,956 su 400
  allenatori, 0,985 contro 0,967 fra i veterani. Poco in valore
  assoluto, e tutto nella coda: è nella coda che si decide chi incontri.

  **(b) LA VERIFICA CONTRO L'IMPLEMENTAZIONE DI RIFERIMENTO**, che è il
  cancello che il mandato chiede per nome (milestone M9: «Glicko-2 and
  trophies verified against a reference implementation»). L'esempio
  lavorato di Glickman — 1500 con RD 200 e volatilità 0,06, τ = 0,5, tre
  partite contro 1400/30 vinta, 1550/100 persa, 1700/300 persa —
  riprodotto **numero per numero**:

  | | paper | nostro |
  |---|---|---|
  | g(φ_j) | 0,9955 · 0,9531 · 0,7242 | uguali |
  | E | 0,639 · 0,432 · 0,303 | uguali |
  | v | 1,7785 | 1,77898 |
  | Δ | −0,4834 | −0,48393 |
  | σ' | 0,05999 | 0,059996 |
  | φ* | 1,1529 | 1,15290 |
  | φ' | 0,8722 | 0,87220 |
  | μ' | −0,2069 | −0,20694 |
  | **r'** | **1464,06** | **1464,05** |
  | **RD'** | **151,52** | **151,52** |

  I due valori che non coincidono — v e Δ — **non sono stati fatti
  passare allargando la tolleranza**. Il banco rifà il conto **con i g e
  gli E stampati dal paper** (0,9955/0,9531/0,7242 e 0,639/0,432/0,303) e
  ritrova esattamente 1,7785 e −0,4834: lo scarto è l'arrotondamento del
  paper, non un nostro errore. Un'implementazione sbagliata non cadrebbe
  su **tutti e due** i valori.

  **(c) I TRE NUMERI, E DOVE VIVONO.** `nascosto` (1500), `incertezza`
  (350, la *deviation*), `volatilita` (0,06), più `periodo` e `giri`:
  **cinque colonne su `punti`**, non una tabella nuova. RLS è acceso con
  zero policy su tutte e sei le tabelle e ognuna sta nel `revoke`: una
  tabella nuova sarebbe l'unica porta aperta del database, **e lo sarebbe
  in silenzio**.

  `periodo` sta apposta accanto a `stagione`, perché è lì che le due si
  confonderebbero: **il giorno nuovo non azzera niente**. Il rating resta
  quello di ieri, e a crescere è soltanto l'incertezza (φ' = √(φ²+σ²) per
  ogni giorno saltato, applicato *in differita* al prossimo aggiornamento
  invece che da un lavoratore notturno). Il mandato parla anche di
  `season reset every 4 weeks`: non è questa colonna, ed è una riga già
  esclusa in casa.

  `giri` è la **guardia**. `muovi_punti` risolve la corsa con
  l'atomicità di un incremento; Glicko-2 non è un incremento — ha bisogno
  di leggere prima di scrivere — quindi `posa_nascosto` scrive solo se
  nessun altro è passato nel frattempo. Tre tentativi, poi ci si arrende
  **senza rompere la sfida**: i punti visibili si sono già mossi, il
  replay è già registrato, e un rating nascosto perso è un'informazione
  in meno, non un danno.

  **Contro un avversario costruito il rating NON si muove**, e non è la
  stessa scelta dei punti: `forza_avv * 20` vale mezzi punti perché una
  classifica ferma è morta, ma non è una *misura*, e darla in pasto al
  rating vorrebbe dire insegnargli una favola. Conseguenza detta: chi fa
  solo allenamenti resta a incertezza 350 — «non lo so» — ed è anche
  quel che gli fa trovare un avversario.

  **(d) L'ABBINAMENTO USA IL RATING NASCOSTO**, estendendo la finestra
  del #137 e non riscrivendola: il gradino era un numero, poi una
  coppia, adesso è una **terna**.

  E la terza coordinata **non è una distanza**. Confrontare i rating a
  distanza è stato provato e misurato quasi inutile — su 400 allenatori
  lo scarto di abilità vera passa da 136 a 122, perché l'incertezza di
  due assestati vale 124 e si mangia la banda. La grandezza giusta
  Glicko-2 ce l'ha già in casa: l'**atteso**, dove l'incertezza di tutti
  e due entra per costruzione perché g(φ) appiattisce verso 0,5 quando il
  sistema non sa. Un gradino non dice «vicini di rating», dice **«la
  partita non dev'essere decisa prima del fischio»**: |E − 0,5| ≤
  `equilibrio`. Ed è la stessa grandezza che il mandato nomina nella
  formula dei trofei.

  Misurato, 5000 ricerche, stessa popolazione e stesso seme per il prima
  e il dopo. **La grandezza non è lo scarto di punti** — sarebbe
  giudicare un metro con sé stesso — ma lo scarto di **abilità latente**,
  che né i punti né il rating conoscono:

  | popolazione | | mediano | p90 | «entro 100» | peggio servito | a vuoto |
  |---|---|---|---|---|---|---|
  | **400** | oggi (#137) | 133 | 355 | 40 % | 8 | 0 |
  | | **col nascosto** | **72** | **183** | **65 %** | 7 | 0 |
  | **60** | oggi | 151 | 340 | 34 % | 6 | 0 |
  | | **col nascosto** | **94** | **249** | **52 %** | 5 | 0 |
  | **12** | oggi | 291 | 554 | 21 % | 4 | 0 |
  | | **col nascosto** | **185** | **391** | **30 %** | 4 | 0 |

  **Zero ricerche in più senza avversario**, su tutte e tre le
  popolazioni e su quattro semi.

  **IL RATING NON ESCE DAL DATABASE**, come il `sospetto` del #137 e per
  la stessa ragione: la tupla di `trova_avversario` finisce dritta nel
  corpo della risposta di `/api/avversario`, cioè sul telefono di
  un'altra persona. Conseguenza, detta perché toglie una rete:
  `ammissibile` **non può ricontrollare** la terza coordinata, e se un
  giorno `equilibrato` e `atteso_glicko` divergessero l'endpoint non se
  ne accorgerebbe. Il cambio è buono: l'alternativa è mandare il rating
  di un'altra persona sul telefono di chi la sfida. E i *miei* due numeri
  non li legge nemmeno l'endpoint: se li prende la CTE `mia`, dove il
  dato già sta.

  **(e) IL BANCO HA CORRETTO IL PROGETTO TRE VOLTE**, ed è la parte di
  questo cantiere che vale più del codice.

  1. **I gradini sono CINQUE, non quattro.** Con quattro, su una base di
     dodici, stringere i primi tre faceva cadere la ricerca sull'ultimo
     molto più spesso (gradino medio da 2,00 a 3,24) — e l'ultimo, per
     costruzione, non ha limiti. Misurato: lo scarto mediano migliorava
     (291 → 226) e **la coda peggiorava**, p90 da 554 a **666**. Partite
     più giuste per quasi tutti, e qualche partita più assurda di prima
     per chi finiva in fondo alla scala. Il gradino in più è un
     **atterraggio**: forza e punti già senza limite, ma l'equilibrio
     ancora a 0,40. Col quinto gradino il p90 su dodici va a **391**.
  2. **Il pavimento è 7/5/4/2/1, non 8/6/4/1.** 8/6/4 protegge il mazzo
     meglio di chiunque e costa altrove: su dodici persone un gradino che
     ne chiede otto non si soddisfa quasi mai, la ricerca cade più in
     basso, e **una misura del #137 si disfaceva** — lo scarto mediano di
     *punti* sulla base da dodici da 147 a 213 (`_q-sospetto` C5, che con
     7/5/4 resta a 147). Il pavimento giusto è il più alto che non
     disfaccia una misura già pagata.
  3. **E 7/5/3 è stato scartato da un SECONDO SEME, non da un'idea.** Su
     20260923 dava quattro avversari possibili sulla base da dodici e
     sembrava a posto; su 987654 e 555 ne dava **tre**. Da lì il banco
     prende `--seme`, e i suoi 58 controlli sono verdi su quattro
     popolazioni: un numero misurato su una popolazione sola è un
     aneddoto, e qui l'aneddoto avrebbe fatto passare una finestra che
     affama qualcuno una volta su due.

  **(f) IL BANCO E I SEI FALSI.** `strumenti/_q-glicko.js`, **58/58**,
  quattro secondi, `conta:true`, e **non apre il gioco** — il secondo
  cancello della batteria che misura il server, dopo `sospetto`. Cinque
  gruppi: **A** il riferimento di Glickman, **B** le proprietà che
  l'esempio non esercita, **C** l'abbinamento misurato sull'abilità
  latente, **D** le porte del server (e questo gruppo **dichiara di
  attestare**: qui non c'è un Postgres), **E** il periodo e la
  concorrenza.

  Sei falsi, ognuno costruito nel caso peggiore, con la **bite list
  misurata** su 58 prove:

  | falso | morde | quante |
  |---|---|---|
  | `ferma` (l'incertezza non decade per chi non gioca) | B3, B4, E1 | 3 |
  | `cresce` (la certezza va dalla parte sbagliata) | A8, B1, B2, B3, B5, B5b, C6400, C812, C9, C10, E7 | 11 |
  | `sorda` (la volatilità non si ricalcola mai) | B8, B8b | 2 |
  | `visibile` (abbina sui punti invece che sul rating) | C4, C5, C6400, C9 | 4 |
  | `stagione` (il periodo trattato come una stagione) | E4b | 1 |
  | `fantasma` (il rating impara dagli avversari costruiti) | E4 | 1 |

  Due meritano una riga. **`sorda` passa il gruppo A per intero**: nell'
  esempio del paper la differenza fra ricalcolare la volatilità e
  lasciarla ferma a 0,06 è di **quattro milionesimi**, sotto la
  precisione con cui il riferimento è pubblicato — una verifica contro
  il paper, da sola, non lo vede. È la ragione per cui il gruppo B
  esiste. E **`cresce` passa A9**: il rating resta esatto, sbaglia solo
  la certezza, che è una firma che lo identifica invece di un'esplosione.

  **E `stagione` ha trovato un buco nel banco**, che è la ragione per cui
  i falsi si costruiscono: alla prima costruzione **passava tutte e 57 le
  prove**. E1 ed E2 guardavano `inattivo` da sola, che lì era intatta, ed
  E4 ed E5 chiamavano `dopoLaSfida` nel giorno stesso, dove il periodo
  non cambia. Nessuna riga chiedeva la cosa che conta — **il rating di
  ieri sopravvive alla notte** — e senza quella riga il banco avrebbe
  dichiarato verde una classifica che si riscrive ogni notte. **E4b è
  nata da lì.**

  **(g) I LIMITI, DICHIARATI.** (1) **L'SQL non si esegue**: non c'è un
  Postgres nel repo, la regola vive in JavaScript e l'SQL ne è la
  traduzione; il gruppo D confronta le due **per testo** e lo dice. Per
  questo la formula dell'atteso in SQL sta in una funzione sua
  (`atteso_glicko`) e non sepolta in un `where` di sei righe: l'unica
  difesa contro una divergenza è che le due lingue si possano leggere una
  accanto all'altra. (2) **Un rating solo, non uno per modo** come chiede
  il mandato — e si misura perché: spezzare in tre la stessa evidenza
  porta l'incertezza mediana **da 63 a 88** (400 allenatori) e **da 65 a
  93** (12), e un rating più incerto abbina peggio. Si riapre quando la
  base lo regge. (3) **Il periodo di rating è di una partita, non di un
  giorno**: le formule sono le stesse (Glicko-2 è definito per m partite,
  e uno è un m valido) e la divergenza è **misurata invece che promessa**
  — stessa storia giocata due volte, scarto mediano **25** punti di
  rating, massimo 50. (4) Nessun trofeo, nessuna lega, nessuna stagione,
  **nessun piazzamento contro bot calibrati** (i nostri bot non sono
  calibrati: calibrarli è un cantiere a parte). (5) **La popolazione è
  simulata**, col modello dichiarato dentro il banco.

  **(h) LA RETTIFICA DELL'ONDA D.** «ONDA D CHIUSA», scritto dal #137 in
  poi e ripetuto dal #138 e dal #139, **era vero sui punti 11 e 12 del
  programma, non su tutta l'onda**: l'onda D ne ha **tre**
  (`_analisi/MAPPA-MANDATO.md:763-768`) e il 13 — il Glicko-2 — non era
  fatto. Nessuno dei tre verbali diceva il falso su quel che *aveva*
  fatto; tutti e tre chiamavano «chiusa» un'onda a cui mancava un punto
  su tre. Rettificato a edizioni in `PUNTO-DEL-LAVORO.md`, senza
  cancellare il testo vecchio. **Con questo cantiere l'onda D è chiusa
  davvero, 3 punti su 3.**

  *Prova:* `rete/lib/glicko.js`, `rete/lib/abbinamento.js`,
  `rete/api/sfida.js`, `rete/api/avversario.js`, `rete/schema.sql`,
  `rete/prove/tutte.js` (46/46, con l'esempio di Glickman ripetuto anche
  lì — due porte, come la tavola dei cinque verdetti del #137);
  `strumenti/_q-glicko.js` 58/58 su quattro semi, `strumenti/_crit-glicko-*.js`.

- **La finestra che cambia — #139 CANTIERE CHIUSO** (voce #139, 22
  settembre 2026, quattro compiti dal merge-base `1d5b946` — spec
  `docs/superpowers/specs/2026-09-22-finestra-che-cambia-design.md`,
  piano `docs/superpowers/plans/2026-09-22-finestra-che-cambia.md`).
  **Un CRITICO dell'onda D, trovato dalla revisione d'insieme**, e non
  di un cantiere solo: sta nella *giuntura* fra il #133 (che ha scoperto
  il canale dei pixel) e il #137/#138 (che hanno dato al verdetto la
  forza di togliere punti).

  **(a) IL DIFETTO.** Il #133 aveva visto che i tocchi del nastro sono
  in **coordinate di schermo** — dove finisce un tocco lo decidono
  `touchBtnLayout` e `SCALE`/`OX`/`OY`, che vengono tutti e tre da
  `innerWidth`/`innerHeight` — e aveva messo la misura nel nastro (riga
  di tipo 10). **Ma la scriveva una volta sola**, in `Sfida.gioca`,
  subito prima di `startMatch`. Intanto `addEventListener('resize',
  resize)` resta vivo per tutta la partita e ricuoce `SCALE`/`OX`/`OY`,
  e `checkOrientation` ferma **solo il portrait**. La guardia del
  giudice verificava che il nastro e il giudice *dicessero la stessa
  cosa*, non che quella cosa *fosse stata vera dall'inizio alla fine*.

  **(b) MISURATO, DUE BRACCI CHE CAMBIANO UNA COSA SOLA** (stesso seme
  `20260801`, stesso copione di dita, stesse rose, dischi calcolati una
  volta sola alla misura di partenza, e le stesse pause agli stessi
  fotogrammi in tutti i bracci):

  | braccio | finestra | tabellone | riga 10 | giudizio a 915x412 |
  |---|---|---|---|---|
  | FERMA | 915x412 sempre | 3-4 | 915x412 | **TORNA** (3-4 in 8819 passi) |
  | CAMBIA | 915x412 → 352 al fotogramma 1200 | 1-2 | 915x412 *(la misura di partenza)* | **NON TORNA** (3-4 in 8631 passi) |

  Il secondo è un giocatore **onesto**: gli è comparsa la barra dell'URL
  a metà partita (`SCALE` 0,7067 → 0,6017, `OX` 51 → 112). `NON TORNA` è
  **l'unico verdetto che muove punti**: `segna_verdetto` disfa `delta_a`
  *e* `delta_d` — due persone — alza `allenatore.sospetto`, che non
  decade mai per disegno e a `SOSPETTO_SEPARA = 3` segrega chi lo porta
  nel mazzo degli abusatori, **e chiude la riga per sempre** (`and
  verificata = 0`). Un `INCOMPLETO` si ripara domani; questo no. Nell'APK
  è mitigato (fullscreen + `configChanges`) ma non chiuso — split-screen,
  multi-finestra, pieghevoli; servito come **PWA in un browser di
  telefono la barra dell'URL è il caso normale**, ed è proprio nella
  banda dei 56-90 px.

  **(c) LA CURA: un «non lo so» invece di un'accusa**, in due metà che
  servono tutt'e due — una riga che nessuno guarda è un commento, e chi
  guarda una riga che non c'è non vede niente. `Reg.schermo(w, h)` scrive
  una riga di tipo 10 **a ogni cambio di misura**, e `resize()` la chiama
  in fondo, quando `SCALE`/`OX`/`OY` e i pulsanti sono già quelli nuovi;
  `vagliaNastro` si astiene — **`INCOMPLETO / schermo-cambiato`** — su
  qualunque nastro porti **più di una misura distinta**. *Distinte* e non
  «righe»: una finestra che va e torna lascia tre righe e due misure, ed
  è il numero delle **misure** a dire se il nastro si può rigiocare.
  **Prima di `schermo-diverso`**, e l'ordine non è un gusto: uno schermo
  diverso si ripara aprendo la finestra giusta (è quel che fa la
  staffetta), uno schermo **cambiato non si ripara in nessuna finestra**
  — è una proprietà del nastro, non di chi lo legge. E il giudice **non
  offre più una finestra da riaprire dove non ce n'è nessuna**: al posto
  di `schermo` restituisce `schermi`, tutte, così la staffetta non va a
  cercare per sempre un telefono che non esiste e la regola della
  «finestra negata» del #138 non scatta.

  **(d) IL RESIZE A RAFFICA NON RIEMPIE IL NASTRO.** Due guardie in fila:
  quella che `resize()` ha già («se la misura non è cambiata non si
  ricuoce niente», e il suo commento nomina la barra del browser da sé) e
  quella di `Reg.schermo`, che serve perché `resize()` gira per intero
  anche a finestra immutata quando `RESIZE_FORZA` è acceso — lo accende
  `setTaglia`. **Misurato: 24 eventi di resize su 6 misure → 6 righe.**
  Costo: una riga di cinque numeri per misura distinta, contro un tetto
  di 40.000 righe (#132).

  **(e) QUEL CHE LA CURA COSTA, dichiarato invece che nascosto.** Con
  **12 px** di cambio (412 → 400) la partita non si muove di un passo —
  stesso 3-4, stessi 8819 passi, nastro identico — e il verdetto oggi è
  `TORNA`: domani sarà `INCOMPLETO / schermo-cambiato`. Si paga
  volentieri: un onesto non confermato resta in lista a `verificata = 0`
  e non perde niente, un onesto accusato perde i punti, il sospetto e la
  riga per sempre. **E una soglia in pixel sarebbe un'opinione**: il #133
  ha misurato «dodici no, settanta sì» su *un* nastro, e dove passi il
  confine di un motore caotico non lo sa nessuno. La strada che renderebbe
  quel nastro **giudicabile** invece che inservibile — rigiocare il
  cambio, ricalcolando `SCALE`/`OX`/`OY` al tick della seconda riga —
  chiede di spezzare l'invariante `VW === innerWidth`, cioè di
  ridimensionare la tela lontano dalla finestra vera davanti a un umano
  che sta guardando un film: è il seguito grosso già aperto dal #133,
  **«i tocchi indipendenti dallo schermo»**, e non è una toppa.

  **(f) IL GIOCO DI CHI GIOCA NON CAMBIA DI UN PASSO.** I tre bracci
  finiscono con gli stessi passi e lo stesso tabellone di prima della
  cura (8819 / 7643 / 8693): quel che cambia è che il nastro dice la
  verità. L'alternativa più brutale — trattare il resize in partita come
  il portrait (`G.rotateHold`) — è stata **scartata qui**: punirebbe chi
  gioca per una cosa che fa il suo telefono.

  **(g) `MOTORE_V` RESTA 2, E NON PER OPINIONE.** Quattro sfide vere
  registrate sul gioco di `main` più la fixture congelata, ognuna
  giudicata due volte — da una pagina del gioco vecchio e da una del
  nuovo: **5 su 5 identici** in verdetto, causa, gol e passi (3-4/8819,
  1-3/7295, 1-0/5966, 1-2/8419, 1-2/9367). `Reg.esegui` non ha un ramo
  per il tipo 10, quindi in rilettura la riga non muove niente — né la
  prima né la seconda. **I nastri vecchi non si rompono**: ne portano
  *una* di righe di tipo 10, cioè una misura, e si giudicano esattamente
  come oggi; la prima riga resta nel punto esatto di prima, quindi un
  nastro a finestra ferma è identico a quello di ieri.

  **(h) IL BANCO**: `strumenti/_q-finestra.js`, **20 su 20**, nato a
  **8 su 20** — a bracci, e ogni rosso era il difetto vero.

      FERMA    915x412 sempre        TORNA
      CAMBIA   915x412 -> 352        INCOMPLETO/schermo-cambiato a 412 E a 352
      TORNA    412 -> 352 -> 412     INCOMPLETO/schermo-cambiato (3 righe, 2 misure)
      RAFFICA  24 eventi, 6 misure   6 righe di tipo 10, non 24

  **Il terzo braccio esiste per un falso solo.** Un gioco che scrivesse
  solo la *prima* e l'*ultima* misura sarebbe verde su FERMA e su CAMBIA
  e accuserebbe un innocente su TORNA, dove la finestra se ne va e
  ritorna: senza quel braccio `_crit-finestra-estremi` passava con
  **diciotto verdi su venti**. **E D4 è la prova che nessuno pensa a
  scrivere**: lo *stesso* nastro con **tre attesi diversi** — quello
  dichiarato, quello che la rigiocata produce e uno assurdo (99-0) — deve
  dare tre volte la stessa risposta, perché l'astensione è una proprietà
  del **nastro** e non del conto. Prima della cura, col secondo dei tre,
  il giudice diceva `TORNA` su un nastro inverificabile: una cura pigra
  («mi astengo solo quando il conto non torna») sarebbe passata di lì.

  **CINQUE FALSI**, ognuno con la lista **misurata** di ciò che morde:
  `sorda` (resize non lo dice al registro) 10 prove, `cieca` (le misure
  viaggiano e il vaglio ne guarda una sola) 7, `accusa` (il cambio
  diventa `NON TORNA` invece di un'astensione) 6, `estremi` 3 — e **solo
  lui morde B5** — e `raffica` (una riga a ogni resize, anche a misura
  immutata) **1 sola su 20**, che è la ragione per cui il braccio RAFFICA
  esiste.

  **QUEL CHE IL BANCO NON MISURA**, dichiarato invece che taciuto: i
  nastri di `window.__test.registra()` (non portano la prima riga di tipo
  10, la scrive `Sfida.gioca`: se lì la finestra si muove, la prima riga
  che compare è quella del cambio — non è un cammino di produzione,
  quei nastri non si giudicano come sfide); la finestra che cambia
  **durante un replay** (in rilettura il registro non scrive, modo 2, e
  non c'è niente da dire); e il verticale, che resta affare di
  `checkOrientation`.

  **Reti di sicurezza, tutte identiche al numero**: `sfida` 54/54,
  `giudice` 21/21, `sigillo` 14/14, `carta` 22/22, `amici` 23/23,
  `sospetto` 39/39, `staffetta` 42/42, `rete` 22/22, `salvataggio`
  11/11, `senza-rete` 6/6, i quattro del #132 (6/6, 4/4, 4/4, 5/5),
  `determinismo` 10/10 a 5 **e** a 11. Batteria intera a gruppi, tutti i
  cancelli che contano verdi. `_q-finestra` è in batteria con
  `conta:true` (`lento:true`: gioca tre sfide intere).

- **La staffetta — #138 CANTIERE CHIUSO** (voce #138, 22 settembre 2026,
  quattro compiti dal merge-base `8127f6c` — spec
  `docs/superpowers/specs/2026-09-22-la-staffetta-design.md`, piano
  `docs/superpowers/plans/2026-09-22-la-staffetta.md`). **Il pezzo
  mancante che chiude l'onda D** — e rettifica a edizioni della voce #137
  qui sotto, che si era dichiarata «ultimo cantiere dell'onda D»: lo era
  dei cantieri *progettati*, non dei pezzi *mancanti*, e lo diceva lei
  stessa in fondo («quel che ancora non c'è: la staffetta»).
  `git diff main -- CALCETTO-il-gioco.html`
  è **vuoto** e `MOTORE_V` resta **2**: la capacità c'era già. Di `rete/`
  cambiano **solo commenti** — due rettifiche a edizioni, perché due file
  dicevano in chiaro che questa cosa non esisteva.

  **Il fatto da cui parte tutto.** L'onda D aveva costruito tre capi su
  quattro, e li aveva dichiarati uno per uno: la **capacità**
  (`giudica()`, cinque verdetti, e solo `NON TORNA` muove punti — #133),
  il **tubo** che porta la colonna `verificata` fino alla riga della
  lista (#134), l'**altro capo** nel database (`segna_verdetto`, il
  sospetto che nasce solo da un `NON TORNA` — #137). Mancava **il
  mezzo**, e tre file del repo lo scrivevano con queste parole: «il
  processo che pesca le righe a `verificata = 0`, apre il browser della
  misura giusta, chiama `giudica` e riporta la parola. **Manca quello, e
  non manca altro**» (`rete/schema.sql`, seguito del #137). Finché non
  esisteva, «la classifica si ripulisce da sola» era una **promessa
  architetturale** — cioè esattamente ciò che il mandato §10.5 chiede di
  ribaltare.

  **(a) DOVE VIVE, E PERCHÉ NON È UN ENDPOINT.** `strumenti/staffetta.js`,
  un processo che si lancia. Due ragioni, e nessuna è una preferenza:
  una funzione Vercel **non ha un browser**, e il giudice *è* il gioco
  (un secondo motore scritto in Node divergerebbe per costruzione e
  toglierebbe punti a innocenti — è l'argomento con cui il #133 ha messo
  `giudica` dentro all'HTML); e «un endpoint che accetta *questa sfida
  non torna* sarebbe il modo più corto per far togliere i punti a un
  avversario scrivendo il suo identificativo», che stava già scritto
  sopra `segna_verdetto`. Gli endpoint restano **cinque**, RLS resta
  acceso su tutte e sei le tabelle con zero policy, nessuna tabella,
  nessuna colonna, nessun `grant`.

  **(b) IL GIRO, IN SEI PASSI.** Pesca le righe a `verificata = 0` (a
  pagine, con un cursore: l'indice parziale `sfida_daverificare` c'era
  dal primo giorno) → allarga il replay (deflate-raw + base64url) →
  **raggruppa per la misura scritta nella riga di tipo 10** → apre **un
  contesto per misura, non uno per riga** → chiama
  `window.__test.giudica` → manda **la parola** a `segna_verdetto`.

  **(c) LA MISURA SI LEGGE IN NODE, E NON PUÒ ACCUSARE NESSUNO.** Va
  letta *prima* di aprire il browser, perché è lei a decidere quale
  browser aprire. Se il lettore in Node sbagliasse, `giudica` — che la
  ricontrolla da sé dentro `vagliaNastro` — risponderebbe
  `INCOMPLETO / schermo-diverso`, cioè **un «non lo so», mai un `NON
  TORNA`**. Il lettore in Node può far perdere tempo; non può far
  togliere punti. È la riga che rende sicura tutta questa parte.

  **(d) LA STAFFETTA NON TRADUCE**, ed è la cosa più importante del
  cantiere. Manda la parola così com'è, **tutti e cinque i verdetti,
  sempre**, compresi i tre «non lo so»: costano una chiamata che non
  muove niente e comprano **un cammino solo**. Una staffetta che
  decidesse da sé quali verdetti spedire avrebbe dentro di sé un `if`
  sulla tavola dei cinque, cioè una **terza porta** scritta peggio delle
  due che ci sono. La tavola resta del database.

  **(e) DUE STRATI DI IDEMPOTENZA, E NON SONO LA STESSA COSA.**
  Confonderli è il modo di credere di essere protetti quando non lo si è.
  La **struttura** (`where id = s_id and verificata = 0`) protegge dalle
  **accuse doppie**; il **taccuino** — un file locale, `id → {verdetto,
  causa, misura, quando}` — protegge solo dal **lavoro sprecato**, perché
  i tre «non lo so» restano a 0 per disegno e tornerebbero nella pesca a
  ogni giro. La riga che li tiene insieme: **il taccuino può sparire
  senza che nessuno venga accusato due volte.** Una eccezione misurata:
  un `INCOMPLETO / schermo-diverso` su una riga per cui la staffetta
  aveva chiesto *proprio quella misura* non è un «non lo so» del nastro,
  è **la finestra negata** dalla macchina che ospita — si grida nel
  referto e la riga torna al giro dopo. *(Era una regola affermata in tre
  punti e misurata in nessuno: C6/C6b sono nate al compito 3, e il falso
  `rassegnata` — che scrive anche quella riga nel taccuino — per
  condannarle. Misurato: la riga non entra nel taccuino, il referto grida
  «chiesta 915x412, serve 1024x460», e il giro dopo la stessa riga
  `TORNA`.)*

  **(f) I FRENI, e il fatto che andava detto: nessun freno del server
  tocca questo processo.** I sei `frenato(...)` stanno negli **endpoint**,
  e la staffetta non passa da nessun endpoint — parla a PostgREST con la
  chiave di servizio, come le funzioni Vercel. Proprio per questo **si
  frena da sé**, con lo stesso meccanismo e nello stesso posto
  (`frena('staffetta:<nome>', 60, 60)`), perché due staffette lanciate
  insieme non condividono memoria. Più due freni locali: `--tetto` righe
  per giro (50) e `--pausa` fra una riga e l'altra (1000 ms).

  **(g) IL FILO, aggiunto al compito 3 perché era un buco.** La spec
  dichiarava «PostgREST non si interroga: di `bancoVero` si misura la
  forma, non il viaggio» — e da quel buco ci passava un difetto che non
  si sarebbe visto da nessun'altra parte: l'argomento di
  `segna_verdetto` chiamato `id` invece di `s_id`. La staffetta
  pescherebbe bene, aprirebbe la finestra giusta, giudicherebbe bene,
  riferirebbe sei verdetti corretti — e **nessuna riga si chiuderebbe
  mai**, perché PostgREST risponde 400. Adesso il gruppo **G** misura il
  filo contro un `http` che parla la **forma** di PostgREST (`eq.`/`gt.`,
  `order`, `limit`, `select`, le funzioni sotto `/rpc/` che tornano un
  array), e chiude con **il programma vero**: `node
  strumenti/staffetta.js` con le due variabili d'ambiente, che apre il
  suo server del gioco e il suo browser, chiude le righe, scrive il
  taccuino e non stampa la chiave. È l'unico gruppo che tocca `main()` e
  la riga di comando.

  **LE MISURE**, tutte del 22 settembre 2026 su questa macchina
  (`strumenti/_q-staffetta.js`, **42 controlli su 42** in sette gruppi;
  nasceva a **29 rossi su 32**, e i tre verdi erano guardie di repo che
  non parlano della staffetta):

  | che cosa | numero |
  |---|---|
  | aprire un contesto e caricare il gioco | **1 077 ms** |
  | un giudizio (≈8 800 passi rigiocati) | **773 ms** medi su sei righe |
  | un secondo giudizio sulla **stessa** pagina | **938 ms** (sonda) |
  | giro di sei righe, tre finestre | **7,9 s** |
  | ritmo con la pausa di serie | **34 righe/minuto** contro un tetto di 60 |
  | chiamate al database | **2 per riga** + 1 per giro |

  **Il giro completo, misurato.** Sei sfide finte con quattro verdetti
  diversi in una corsa sola (il quinto, `NON FINISCE`, in un giro a parte
  con la rigiocata stretta a 300 fotogrammi): `TORNA` · `NON TORNA` ·
  `NON TORNA` · `ALTRO MOTORE` · `TORNA` · `INCOMPLETO/schermo-ignoto`.
  **Due righe si chiudono a 1, due a −1, e due restano aperte a 0.** Il
  sospetto sale **solo** sull'attaccante dei due `NON TORNA` e **di uno
  per riga** (B=2, A=0, C=0); i suoi punti tornano indietro **per
  intero** (1038 → 1000); e l'invariante del #137 regge dopo il giro — il
  sospetto di ognuno **è** il numero delle sue righe a −1.

  **La misura giusta, e non si prova con la fixture congelata.** Il banco
  **gioca una sfida vera a 1024x460** dentro la corsa, e quella riga deve
  tornare `TORNA`: quattro righe su sei sono a 915x412, e senza quella
  riga «apre la misura giusta» sarebbe un racconto verde anche su una
  staffetta cieca. Lo **stesso** nastro aperto di forza a 915x412 dice
  `INCOMPLETO / schermo-diverso` e dichiara quale schermo serve: **mai**
  `NON TORNA`. Tre contesti per sei righe.

  **La ripartenza, in quattro modi.** La risposta persa (la chiamata è
  arrivata, l'esito no): il giro si ferma, quello dopo finisce il lavoro,
  **nessuna riga giudicata due volte** e lo stato finale è quello del
  giro pulito. La chiamata mai partita: **quella riga — e solo quella —**
  si rigiudica. Il taccuino cancellato: cambia il *lavoro*, non
  l'*esito*. E due staffette che pescarono insieme (la pesca stantia):
  la seconda rimanda tutti e tre i verdetti e **la guardia della
  struttura non fa disfare niente due volte** — è l'unico caso in cui
  quella guardia viene davvero esercitata, ed è la ragione per cui
  esiste.

  **SA FALLIRE: dieci falsi** (`_crit-staffetta-*`), ognuno costruito nel
  caso peggiore, ognuno con la lista **misurata** di ciò che morde —
  `accusa` (i tre «non lo so» diventano `NON TORNA`) · `cieca` (apre
  sempre la sua finestra) · `numero` (manda −1 invece della parola: il
  chiamante che le due porte del #137 esistono per non credere) ·
  `smemorata` (il taccuino ricorda solo ciò che il database ricorda già)
  · `sfrenata` (chiede il permesso al freno e tira dritto) · `zitta`
  (manda solo le accuse) · `sprecona` (un contesto per riga) · `filo`
  (l'argomento si chiama `id` invece di `s_id`) · `rassegnata` (anche la
  finestra negata finisce nel taccuino) · `avvelenata` (la prova a vuoto
  scrive nel taccuino). Le liste per esteso stanno in testa a ciascun
  falso.

  **E DUE HANNO RIPARATO IL BANCO PRIMA DI ESSERNE BOCCIATI**, che è la
  ragione per cui i falsi si costruiscono invece di raccontarli.
  `cieca` **passava** C2: la prova leggeva la **chiave del gruppo** —
  cioè quel che il *nastro dichiara* — invece della finestra **aperta
  davvero**. `filo` **passava** G7: la prova lanciava
  `strumenti/staffetta.js` per percorso fisso, quindi provava sempre
  quella onesta qualunque cosa le si puntasse contro con `--staffetta`.
  Due righe che attestavano invece di misurare, in un banco scritto per
  non farlo, e a trovarle non è stato chi le ha scritte.

  **E QUATTRO FALSI SONO NATI DALLA DOMANDA OPPOSTA** — *quale
  asserzione, qui dentro, non ha un giudice?* — che è la stessa
  disciplina vista dall'altro capo: `sprecona` per C4 (l'unica
  asserzione che nessuno degli altri condannava), `filo` per tutto il
  gruppo G, `rassegnata` per la **finestra negata** (una regola scritta
  in tre documenti e misurata in nessuno), `avvelenata` per E3b.
  Un'asserzione senza falso è un attestato.

  **E L'ULTIMA DI QUELLE QUATTRO HA TROVATO UN DIFETTO VERO**, non un
  buco del banco: la staffetta **scriveva nel taccuino anche durante il
  giro a vuoto** (`--asciutto`). Quel giro giudica e non manda niente,
  quindi le righe restano a `verificata = 0`: messe nel taccuino, il
  giro vero del giorno dopo le avrebbe **saltate**, e non le avrebbe
  guardate mai più nessuno — una riga onesta «DA VERIFICARE» per sempre,
  e una disonesta pure. Il referto era pieno di verdetti giusti, il
  database intatto, nessuno accusato. **Non sbagliava niente:
  dimenticava.** Curato al compito 3, con la sua prova (E3b) e il suo
  falso.

  **E I LIMITI, dichiarati invece che taciuti** (la stessa dichiarazione
  del #137): **l'SQL non si esegue** — non c'è un Postgres nel repo, il
  lato-database del banco è `applica()` di `rete/lib/verdetto.js`, e la
  corrispondenza con `segna_verdetto` è guardata *per testo* da
  `_q-sospetto` D5, che dichiara di attestare; **PostgREST si interroga
  ma è finto** — il gruppo G misura il filo, non il Postgres vero, e se
  un giorno la funzione cambiasse firma nello schema qui non si
  vedrebbe; **il ritmo è di questa macchina**, non di un CI; **si gira a
  taglia 5**, dove il determinismo è pieno (voce #98) — che il *giudice*
  torni anche a 7 e a 11 lo misura `giudice`, 14 partite oneste su 14,
  zero falsi `NON TORNA` (#133), e il *giro* non cambia con la taglia; e
  **quattro comportamenti della staffetta non hanno una prova** — il
  ripiego del *freno rotto* (se `/rpc/frena` non risponde il giro va
  avanti, come in `comuni.js`), `--riprova`, `--gioco` puntato a
  un'altra copia, e il rifiuto di `serviGioco` quando il file non c'è:
  tutti e quattro, al peggio, fanno lavoro in più o non partono, e
  **nessuno dei quattro può muovere un punto**. E
  **quattordici asserzioni su quarantadue non hanno un falso che le
  condanni**, contate e non stimate (A1 A2 A3 A5 · D2 D5 · E3 E4 · F1 F2
  F3 F4 · G2 G5): A ed F sono guardie di *forma* e di *porte* — restano
  verdi anche senza la staffetta, e non devono sembrare di provare il
  giro.

  **La chiave non è nel repo**, e non è un'assicurazione: è un controllo
  del cancello, che cerca nei **1 898 file tracciati** le due forme di
  una chiave di servizio (un JWT `eyJ…`, o la variabile assegnata a un
  valore lungo). Zero su 1 898 — e la soglia dei trenta caratteri è
  deliberata, perché i banchi del repo assegnano credenziali *finte e
  corte* apposta e un cancello che le chiamasse chiavi urlerebbe al lupo
  finché nessuno lo guarda più.

  **RETTIFICA A EDIZIONI (22 settembre 2026, voce #139).** Il **1 898**
  qui sopra è il conto di quando fu preso, prima che i file del compito 3
  entrassero nell'indice: al commit `1d5b946` il cancello ne stampa
  **1 911**, e il comando di casa che lo riproduce è `git ls-files | wc
  -l`. **Il verdetto non cambia — zero è zero** — ma un numero che non si
  riproduce col comando di casa invecchia da solo e fa dubitare della
  misura che accompagna: quel conto **cresce a ogni cantiere**, e va
  letto come «i file tracciati di quel giorno», non come una costante.
  La prova è questa stessa rettifica — il #139 ne aggiunge nove (una
  spec, un piano, un banco, un impianto, cinque falsi e un attrezzo) e
  chiude a **1 921**. Il controllo, quello, non si muove: **zero**.

  `_q-staffetta` è in batteria con `conta:true` (70 s, `lento:true`).

- **L'abbinamento per punti e il sospetto — #137 CANTIERE CHIUSO** (voce
  #137, 22 settembre 2026, quattro compiti dal merge-base `8a9b33d` —
  spec `docs/superpowers/specs/2026-09-22-abbinamento-punti-design.md`,
  piano `docs/superpowers/plans/2026-09-22-abbinamento-punti.md`).
  **Ultimo cantiere dell'onda D**, e l'unico che sta quasi tutto nel
  server: `git diff main -- CALCETTO-il-gioco.html` è **vuoto**, e non
  per pigrizia — il sospetto non si vede per disegno, e un abbinamento
  più giusto si sente giocando, non si legge in un pixel. `MOTORE_V`
  resta **2** per costruzione.

  Due colonne esistevano e non le usava nessuno: i **punti** nella tupla
  di `trova_avversario` e il **sospetto** in `allenatore`. Il mandato le
  chiede per nome (§5 punto 12c, e §10.5 «fair play score continuo»).

  **(a) LA SECONDA COORDINATA.** La finestra che si allarga a gradini
  *esisteva già* (`for (const banda of [8, 20, 99])`, da mesi): non si
  riscrive, le si aggiunge una coordinata. Il gradino smette di essere un
  numero e diventa una coppia, e la scala vive in `rete/lib/abbinamento.js`
  invece che in una riga dell'endpoint. **Perché serviva**: forza e punti
  misurano due cose diverse — la forza dice quanto hai *giocato*, i punti
  quanto *vinci* — e dentro `forza 75 ±8` ci stanno 203 allenatori su 400
  con punti da 402 a 1486 (forbice **1084**, misurato).

  Misurato su 5000 ricerche, prima e dopo **nella stessa corsa**
  (`strumenti/_q-sospetto.js`, gruppo C):

  | base | scarto mediano | entro 150 punti | oltre 500 | senza avversario | chiamate/ricerca |
  |---|---|---|---|---|---|
  | 400 | 188 → **60** | 41% → **99%** | 7% → **0%** | 0 → **0** | 1,00 → 1,01 |
  | 60 | 180 → **63** | 43% → **93%** | 5% → **0%** | 0 → **0** | 1,00 → 1,11 |
  | 12 | 255 → **147** | 28% → **52%** | 19% → **7%** | 0 → **0** | 1,00 → 2,17 |

  **Nessuna sfida si perde**, e per costruzione: l'ultimo gradino della
  scala *è* l'ultimo gradino di prima (`forza ±99`, punti senza limite).
  È anche ciò che rende sicuro il **ricontrollo** che l'endpoint fa con
  `ammissibile` sul candidato tornato dal database: se un giorno SQL e
  JavaScript divergessero, il peggio è finire sull'ultimo gradino, cioè
  sull'abbinamento di oggi.

  **IL PREZZO CHE IL PROGETTO NON AVEVA PREVISTO, e l'ha trovato il
  banco.** In due tempi, ed è la parte da ricordare. *Primo*: il banco
  misurava sé stesso — la prova sulla varietà tirava duecento generatori
  con **semi consecutivi** e ne usava la prima uscita, e duecento semi
  consecutivi di quello xorshift danno **sedici** valori distinti su
  mille. Diceva «4 avversari» dove ce n'erano 99. *Secondo*: riparata la
  misura (un generatore solo, tirato duecento volte, su **tutta** la
  popolazione e non su uno), è uscito il difetto vero — una finestra più
  stretta dà abbinamenti più giusti **e meno gente dentro**, e il peggio
  servito restava con **UN** avversario possibile. Lo stesso, tutte le
  sere: esattamente ciò che l'`order by random()` esiste per impedire,
  arrivato però dalla *finestra* invece che dall'ordinamento. La scala ha
  preso un terzo numero, il **pavimento del mazzo** (`minimo`, 6/4/2/1, e
  l'ultimo gradino ne chiede uno così nessuna sfida si perde). Misurato,
  «avversari distinti in 200 ricerche», il peggio servito: base 400 →
  oggi 10, senza pavimento **1**, col pavimento **7**; base 12 → oggi 3,
  senza pavimento 1, col pavimento **5**. *Sulla base vera da dodici
  persone il pavimento fa meglio di oggi in tutte e due le grandezze.*

  **(b) IL SOSPETTO, e da quale verdetto nasce.** Da **NON TORNA**, e da
  nessun altro. INCOMPLETO, ALTRO MOTORE e NON FINISCE sono «non lo so»
  — un nastro scritto prima di una cura, il gioco di ieri, un tetto
  nostro troppo stretto — e un sospetto che nasce da un «non lo so» è un
  innocente accusato. La tavola sta in un posto solo
  (`rete/lib/verdetto.js`) e **il suo ripiego è l'innocenza**: ventidue
  ingressi storti misurati — la stringa vuota, il nullo, il minuscolo
  `non torna`, `NONTORNA`, un verdetto inventato — non muovono niente.

  **L'invariante che rende scrivibile un'accusa**: `allenatore.sospetto`
  di X **È** il numero di righe `sfida` con `attaccante = X` e
  `verificata = -1`. Non un punteggio tarato a mano: un conteggio di
  righe, e ogni riga porta seme, taglia, gol e replay. Chi è segnato lo è
  per partite che chiunque abbia la chiave può **rigiocare una per una**
  e ottenere lo stesso NON TORNA. Verificato dal banco su cento verdetti
  mescolati, venti conti su venti. Per questo il sospetto **non decade**:
  un numero che cala col tempo smetterebbe di essere ricostruibile dalle
  righe.

  **Che cosa comporta, per intero.** Non toglie punti (li toglie il
  disfacimento di *quella* partita, che è un'altra cosa), non bandisce,
  non compare in nessuna risposta di nessun endpoint, non compare nella
  classifica, non è visibile a chi ce l'ha né a nessun altro. Fa **una**
  cosa: da `SOSPETTO_SEPARA = 3` in su, `trova_avversario` cerca solo fra
  chi sta dalla stessa parte della soglia. Misurato coi sospetti al 3%
  della base: un onesto ne incontra uno il **3,93%** delle volte senza
  separazione e lo **0,00%** con. I due prezzi, detti: un sospetto che
  non trova altri sospetti riceve un avversario costruito («allenamento,
  mezzi punti», etichetta che il gioco scrive già), e un onesto in una
  base piccolissima dove l'unico altro è un sospetto riceve anche lui un
  avversario costruito.

  **La soglia è tre e non uno**, e il perché è scritto accanto: un solo
  NON TORNA può essere un difetto del nostro giudice, che è di ieri; tre
  sono un comportamento.

  **Zero endpoint nuovi, zero tabelle nuove, zero freni nuovi.**
  `segna_verdetto(s_id, verdetto)` è una funzione del database, non un
  endpoint: un endpoint che accettasse «questa sfida non torna» sarebbe
  il modo più corto per far togliere i punti a un avversario scrivendone
  l'identificativo. Prende la **parola** e non il numero, così le porte
  sono due (JavaScript e SQL) e nessuna delle due accetta un `-1` passato
  a mano. Ha la guardia `and verificata = 0` — la stessa forma del DELETE
  che consuma l'impegno — quindi un verdetto applicato due volte muove
  tutto una volta sola. Disfa i punti di entrambi usando `delta_a` e
  `delta_d`, che esistevano dal primo giorno con scritto accanto «per
  poterli disfare». La `serie` **non** si disfa, e il perché sta scritto:
  non è ricostruibile da una riga sola.

  **La trappola di Postgres, pagata e scritta nello schema**: `create or
  replace function` con una **firma diversa** non sostituisce, *affianca*
  — e la nuova nascerebbe senza `revoke`, cioè aperta. Le firme vecchie
  si buttano prima.

  **Il banco**: `strumenti/_q-sospetto.js`, **39/39**, in batteria con
  `conta:true`. È il primo cancello della batteria che **non apre il
  gioco**: misura il server, costa 4 s e non accende Chrome. Otto falsi
  (`_crit-sospetto-*`, `_crit-abbinamento-*`), ognuno bocciato dalla sua
  prova e da nessun'altra. Due li merita la memoria: `-largo`, che *ha* la
  colonna, il parametro, il predicato e i commenti e non cambia niente
  (cade solo sulla misura); e `-unico`, che è **la cura come era scritta
  nel progetto**, senza pavimento — ha numeri migliori della cura vera su
  ogni grandezza che il progetto aveva previsto di misurare, e lascia
  qualcuno con un avversario solo.

  **Quel che ancora non c'è, detto in chiaro**: la **staffetta**. Il
  processo che pesca le righe a `verificata = 0`, apre il browser della
  misura giusta, chiama `giudica` e riporta la parola non esiste. La
  #133 ha costruito la capacità, la #134 il tubo fino all'occhio di chi
  gioca, la #137 l'altro capo — che cosa succede quando un verdetto
  arriva. Manca il pezzo in mezzo, ed è lavoro di un'altra voce.
  Costruire la conseguenza prima della staffetta è l'ordine giusto: è
  qui che sta il difetto che fa male.

- **La classifica degli amici — #136 CANTIERE CHIUSO** (voce #136, 22
  settembre 2026, quattro compiti dal merge-base `66b17fe` — spec
  `docs/superpowers/specs/2026-09-22-classifica-amici-design.md`, piano
  `docs/superpowers/plans/2026-09-22-classifica-amici.md`). **Sesto
  cantiere dell'onda D, e chiude il giro che la #135 aveva aperto a
  metà.** La sfida di carta va in un verso solo: mando 79 caratteri, tu
  giochi la mia partita, il tuo gioco ti dice se hai fatto meglio — e il
  mio telefono non lo saprà mai. Il mandato (§5, punto 12a) chiede la
  **classifica amici**: qui si costruisce **dai codici che tornano
  indietro**, senza aggiungere un server, un conto o un identificatore.
  Cantiere di MOTORE, SALVATAGGIO e SCHERMATA: il gioco toccato solo per
  ancore (`_toppa-amici-codice.js` nove ancore,
  `_toppa-amici-schermata.js` sette). `git diff main --
  CALCETTO-il-gioco.html`: **570 righe in più, 7 tolte**. Nessun file di
  `rete/` toccato.

  **IL CODICE DI RISPOSTA STA IN 21 CARATTERI**: `ESITO` + 12 simboli +
  4 di controllo, nello stesso alfabeto base32 di Crockford della #135
  (un alfabeto solo: due sarebbero due modi di sbagliare a ricopiare).
  Dentro, **60 bit tondi**: versione (4), `MOTORE_V` (4), seme (32) e i
  **quattro** numeri dei due punteggi (5 l'uno) — quello di chi ha
  sfidato e quello di chi risponde. Misurato 21..21 su mille risposte a
  caso, giro impacca-e-spacca identità **1000/1000**. Ci sta in un SMS,
  in una riga da 80 colonne, e — la differenza vera con i 79 caratteri
  della sfida — **si detta al telefono**: ventuno lettere si leggono in
  dieci secondi. La parola `ESITO` ha una `I` e una `O`, cioè le due
  lettere che l'alfabeto butta via: il prefisso si confronta dopo la
  stessa normalizzazione del corpo, quindi chi ricopia a mano `ES1T0`
  viene capito lo stesso (misurato).

  **PORTA TUTTI E DUE I PUNTEGGI, E NON E' RIDONDANZA.** Il telefono che
  aveva creato la sfida può essere stato spento una settimana, e il
  codice della sua sfida vive quanto la sessione (#135): il codice deve
  bastare da solo. Ma se quel telefono il seme se lo ricorda, **vince il
  ricordo**: in `SAVE.amici.mie` finiscono le ultime venti sfide create,
  seme e punteggio, e una risposta che dichiarasse un punteggio tuo
  diverso viene corretta e lo dice in chiaro. È l'unica verifica
  possibile senza un server, e costa venti numeri.

  **LE SERRATURE SONO TRE**, perché i codici che si incollano nello
  stesso campo adesso sono tre: il cambio telefono (`id.segreto.controllo`,
  che **regala la squadra** a chi lo incolla), la sfida (`CARTA…`), il
  risultato (`ESITO…`). Ognuno dei tre lettori riconosce gli altri due e
  **li chiama per nome** invece di rispondere «codice sbagliato»: a un
  risultato incollato nel campo della sfida il gioco dice che è un
  risultato e dove si segna, e al codice del cambio telefono dice che
  non si manda a nessuno.

  **QUATTRO SIMBOLI DI CONTROLLO, misurati su CINQUANTA codici e non su
  uno** — un corpo di dodici simboli è corto, e una misura su un codice
  solo è un aneddoto. Una cifra cambiata: **24.800 su 24.800**
  (esaustivo). Due cifre scambiate: **5.788 su 5.788** (esaustivo). Da 1
  a 4 simboli a caso: **99.136 su 99.139 = 99,997%**, e **le sei fughe
  del compito 0 stanno tutte sulla stessa coppia**, posizioni 11 e 15:
  l'ultimo simbolo del carico pesa `31⁰ = 1` nell'accumulatore, quindi
  una sua variazione di `d` e una variazione di `d` sull'ultimo simbolo
  di controllo si annullano — e quel che esce è un **codice valido di
  un'altra partita**, non un codice storto accettato. È la classe che
  nessun controllo può prendere, perché il controllo è funzione del
  carico. Si dice invece di nasconderla dietro una percentuale. **Con un
  simbolo solo** (misurato al compito 0) le due cifre scambiate
  scenderebbero al **66,06%**: su un corpo corto un controllo corto non
  tiene.

  **`SAVE.amici` È ADDITIVA E IL SALVATAGGIO RESTA v4**, e non è una
  scommessa: misurato su un salvataggio vissuto di **37 chiavi**,
  togliere la chiave nuova non ne perde **nemmeno una** delle altre 36,
  e aggiungerne una sconosciuta non ne perde nessuna. Il precedente era
  già dichiarato nel gioco accanto a `div` («chiave additiva, versione
  ferma a v4»). Venti amici pesano **+5.695 byte**, lo **0,143%** del
  tetto di `localStorage`. **Il prezzo, detto**: chi gioca con questa
  versione e poi riapre una versione *vecchia* del gioco perde la
  classifica degli amici — la vecchia rilegge a whitelist e riscrive
  senza. Non è un guasto nuovo, è come questo salvataggio si comporta da
  sempre per qualunque chiave; ma lì dentro c'è il lavoro di un mese di
  sfide.

  **I TETTI SONO TRE E NESSUNO È SILENZIOSO**: **20 amici** (entra il
  nuovo, esce il più vecchio per data — a parità di data il primo
  entrato — e la riga sotto il campo lo dice **per nome**; la coda delle
  sfide fa lo stesso da sempre, ma senza dirlo), **12 semi ricordati per
  amico** (così lo stesso codice incollato due volte non conta due
  volte, che è lo sbaglio più probabile di tutti; il prezzo dichiarato è
  che una risposta più vecchia di dodici partite *con quell'amico*,
  reincollata, conterebbe due volte), **20 sfide create** ricordate. E in
  rilettura i tre tetti si riapplicano, come fa già la coda: un
  salvataggio manomesso non può iniettare duemila amici.

  **LA CLASSIFICA STA DENTRO CLASSIFICA, SOPRA QUELLA DI RETE**, e la
  ragione è un numero misurato (tre viste, quattro riempimenti): sotto,
  con la classifica di rete piena, il primo amico finirebbe a **876 px**,
  cioè fuori da qualunque telefono; sopra sta a **114** su tutte e due le
  viste orizzontali (136 col riempimento vero del gioco). La cosa che
  funziona **sempre** non può stare sotto la cosa che funziona solo con
  la rete. **E la schermata SFIDA non si tocca di un pixel** — il
  bottone CLASSIFICA c'era già — quindi i quattro bersagli delle voci
  #134 e #135 restano identici: **CERCA@220, prima riga@329, GUARDA@308,
  SFIDA DI CARTA@347** a 800x360. L'attrezzo a ancore confronta quella
  fetta di pagina **byte per byte** prima di scrivere. Il prezzo, detto:
  con cinque amici la prima riga della classifica di rete scende da
  94/118 a 326, e TORNA ALLE SFIDE da 317/341 a 549.

  **E UN DIFETTO DEL GIOCO SPEDITO, trovato misurando dove sarebbero
  cadute le aggiunte.** Il pannello della sfida di carta è alto **542
  px**; la piega di un telefono in orizzontale è 412 o 360; e
  `align-items:center` su un contenitore che scorre manda la **cima** del
  figlio sopra lo zero — misurato, `top` a **−65** e a **−91**, con
  `scrollHeight` 493 contro 574 di contenuto: **ottantun pixel persi in
  cima, e nessuno scorrimento li raggiunge**. Il titolo *SFIDA DI CARTA*
  stava a −44: su un telefono in orizzontale **non si poteva leggere**.
  Nessun banco lo vedeva perché nessuno misurava la cima. La cura è una
  parola, `align-items:flex-start`, e si mette **solo su `#sfidaCarta`**:
  il pannello del cambio telefono è alto 349 px e la cima ce l'ha sempre
  avuta (32 / 6 / 135), e cambiargli il centraggio sarebbe un ritocco
  gratuito a una schermata spedita. Dopo: cima a **16**, titolo a **37**,
  tutto raggiungibile. Il prezzo, detto: GIOCA LA SFIDA passa da 326 a
  407, cioè sotto la piega di 360 — in cambio di un pannello in cui
  *tutto* si raggiunge.

  **IL CANCELLO**: `strumenti/_q-amici.js`, **23 controlli**, in batteria
  con `conta:true` (17-18 s, ripetibile: tre corse, stessi numeri). Il
  gruppo C non si accontenta di far girare il giro: fa giocare la stessa
  partita a due telefoni **in due modi diversi** — uno con la CPU, l'altro
  col copione del pollice — perché due telefoni che giocano con la CPU
  finiscono **pari per costruzione** (è la garanzia della #135) e uno
  specchio di pari è uguale a sé stesso: passerebbe anche un gioco che si
  confonde i due punteggi. Misurato: ANNA 0-1 contro BRUNO 1-3, e le due
  righe dicono **«vinta» da una parte e «persa» dall'altra**, sulla
  stessa partita, senza che nessun dato sia passato da un server.

  **OTTO FALSI, e ognuno cade su una prova sola** (17 verdi su 18, o 4 su
  5 nel gruppo D): `identita` (60 bit dell'identificatore in coda al
  carico) e `nome` (il nome della squadra) cadono **solo su B1**;
  `doppio` su C2; `senzatetto` su C3; `scordone` su C4; `credulone` su
  C6; `centrato` su D4; `rete` (segnare manda una copia al server) su
  D5. **Tre cose imparate dai falsi, e sono le più utili del cantiere:**
  (1) la ricerca di **sottostringhe non protegge niente** — il falso che
  fa viaggiare il nome della squadra la passa, perché nell'alfabeto di
  Crockford la `O` è uno zero e «DOPOLAVORO» esce scritto `D0P01A`, in
  chiaro e invisibile a una ricerca di testo; (2) **«la riga c'è dopo un
  riavvio» non prova che sia stata scritta** — il gioco salva anche
  mentre la pagina se ne va (`salvaPerSparizione`), e il falso che non
  scrive sul disco passava la ricarica: C4 guarda il disco **subito**,
  senza chiudere niente; (3) **la rete va contata col server acceso** —
  il falso che manda la classifica a un endpoint non partirebbe nemmeno
  con l'indirizzo vuoto, quindi D5 conta in **tre tacche**: zero per il
  giro col server acceso, una per la classifica *di rete* che chiede da
  sempre, zero per la classifica a rete spenta che mostra i testa a
  testa lo stesso.

  **Reti di sicurezza a ogni compito, tutte ferme**: `duello-impronta` 44
  duelli firmati, `giudice` 21/21, `sigillo` 14/14, `carta` 22/22,
  `sfida` 54/54, `rete` 22/22, `ment-nastro` 6/6, `carattere-nastro`
  4/4, `rosa-scala` 4/4, `nastro-tronco` 5/5, `senza-rete` 6/6,
  `salvataggio` 11/11. Batteria intera a gruppi a ogni compito: **51
  cancelli che contano, tutti verdi**. Fuori dal conto `istantanea`
  (informativo, stessi identici numeri prima e dopo: 45/56 1/8 8/8 8/8
  7/8 8/8 7/8 6/8) e `avvio-telefono` (uscita 3, nessun telefono
  collegato). **`MOTORE_V` resta 2**: il codice di risposta *porta* il
  numero — un risultato fatto con un altro motore non è confrontabile —
  ma non lo cambia, e né il nastro né la simulazione sono stati toccati.

- **La sfida di carta — #135 CANTIERE CHIUSO** (voce #135, 22 settembre
  2026, cinque compiti dal merge-base `602a13e` — spec
  `docs/superpowers/specs/2026-09-22-sfida-di-carta-design.md`, piano
  `docs/superpowers/plans/2026-09-22-sfida-di-carta.md`). **Quinto
  cantiere dell'onda D, e il primo che non ha bisogno del server.** Le
  quattro voci precedenti (#130-#134) hanno costruito la sfida di rete e
  il suo giudizio, e tutte e quattro presuppongono un server: il mandato
  (§5, punto 12b) chiede l'altra metà — due persone che si sfidano
  incollandosi un codice. Cantiere di solo MOTORE e SCHERMATA: il gioco
  toccato solo per ancore (`_toppa-carta-codice.js` otto ancore,
  `_toppa-carta-rettifica.js` una di solo commento,
  `_toppa-carta-schermata.js` dieci). `git diff main --
  CALCETTO-il-gioco.html`: **604 righe in più, 13 tolte**. Nessun file di
  `rete/` toccato, e non è una dimenticanza: è la funzione che esiste per
  non averne bisogno.

  **IL CODICE STA IN 79 CARATTERI**, una parola sola:
  `CARTA` + 70 simboli + 4 di controllo, in base32 di Crockford (niente
  `I`, `L`, `O`, `U` — le quattro lettere che chi ricopia a mano
  sbaglia). Dentro: versione (4 bit), `MOTORE_V` (4), taglia (2), seme
  (32), le due posture (2+2), l'indice di carattere (4), il punteggio da
  battere (5+5), quanti uomini per parte (5+5) e i quaranta attributi
  delle due rose (7 bit l'uno) — 350 bit tondi. Misurato identico su
  1000 sfide a caso (79..79). **Ci sta in un SMS** (che ne regge 160),
  in un messaggio di WhatsApp o Telegram, e in una riga di 80 colonne. È
  una parola sola e non a gruppi separati da trattino perché su un
  telefono il doppio tocco seleziona una parola: un codice spezzato si
  copia a metà.

  **IL DIVIETO CHE REGGE IL CANTIERE.**
  `Rete.codiceTrasferimento()` produce `id.segreto.controllo` e
  `Rete.accettaTrasferimento` scrive `m.id` e `m.segreto`: **chi lo
  incolla diventa quella squadra**. Mandarlo a un amico per sfidarlo
  vuol dire regalargli la squadra, i punti e la facoltà di giocare a tuo
  nome. Di quel codice qui si riusa **solo la forma del controllo**
  (`s = (s*31 + v) >>> 0`) e nient'altro: nel codice della sfida non
  entra niente che dipenda da chi lo scrive — non l'id, non il segreto,
  non il nome della squadra, non i nomi dei giocatori. Dell'avversario
  viaggia l'**indice** di carattere (−1..9), come già fa il nastro dalla
  #132. Due serrature, una per verso: la sfida non ha punti dentro
  (`accettaTrasferimento` ne pretende tre pezzi separati da punto), il
  trasferimento non comincia per `CARTA`. E chi incolla per sbaglio il
  codice del cambio telefono nel campo della sfida riceve **la frase
  giusta**, non «codice sbagliato»: «non si manda a nessuno, perché chi
  lo incolla diventa la tua squadra».

  **QUATTRO SIMBOLI DI CONTROLLO E NON UNO, misurati in modo
  esaustivo.** Una cifra cambiata: **2294 su 2294** (ogni posizione per
  ogni altro valore). Due cifre scambiate: **2624 su 2624** (ogni
  coppia). Da 1 a 4 simboli a caso: **29.762 su 29.762**. Cento per
  cento tutte e tre. Non è fortuna: una cifra cambiata sposta
  l'accumulatore di `delta·31^k`, e `31^k` è dispari quindi invertibile
  modulo `2^20`, e `|delta| ≤ 31` non può annullarlo; uno scambio lo
  sposta di `(a−b)·31^m·(31^d − 1)`, e la potenza di due che divide
  `31^d − 1` vale 1 per `d` dispari e `5+v₂(d)` per `d` pari, quindi per
  arrivare a 20 servirebbe `d ≥ 2048`, cioè un codice trenta volte più
  lungo. **Con un carattere solo** (il falso `_crit-carta-controllo`, 5
  bit) il tasso misurato **crolla al 54,5% sugli scambi e al 97,97%
  sulle mutazioni a caso**: un codice storto su quaranta passerebbe, e
  chi lo gioca giocherebbe una partita diversa senza saperlo. Tre
  caratteri su settantanove.

  **LO SCHERMO NON ENTRA NEL CODICE, e non per ragionamento: per
  misura.** La #133 ha scoperto che il nastro porta i tocchi in
  coordinate di schermo e che `800x360` contro `915x412` dà 0-3 dove il
  tabellone dice 3-4. Qui non si scambia un nastro, si scambia una
  partita da rigiocare da zero: nessuno rigioca i tocchi di un altro.
  **Misurato** (`_q-carta` C1): sei codici, quattro viste (`915x412`,
  `800x360`, `380x640`, `1024x460`) e quattro salvataggi davvero diversi
  — identità di rete, nome squadra, cinque nomi di rosa pescati dalle
  tabelle vere, sponde, mira guidata, durata, mentalità, taglia,
  difficoltà — con la partita portata **fino al fischio finale**:
  punteggio, sorteggi, durata, posizioni di tutti a ogni campione,
  titolari con nomi e numeri, numeri di tutti alla fine. **Ventiquattro
  aperture, tutte identiche.** Quel che lo rende vero e che il codice
  porta o forza: `G.sfida` valorizzato (così `durataPartita()` fissa il
  cronometro al valore di serie invece che a `SAVE.durata`),
  `sponde:'gabbia'` e `miraGuidata:'pieno'` (le due righe che le voci #87
  e #113 hanno messo apposta), le due rose passate per intero, e i **due
  nomi fissi** — `SFIDANTE` e la squadra di quartiere che l'indice
  nomina — perché il nome della squadra decide i nomi dei rincalzi e
  delle panchine, e `rosaAvversaria` legge `SAVE.rosa`.

  **L'UNICA COSA CHE PUÒ CAMBIARE, dichiarata invece che nascosta**
  (`_q-carta` C1b): fra due telefoni, **28 nomi su 240 confrontati** sono
  diversi, e sono **tutti** rincalzi entrati dalla panchina a partita in
  corso — «Ivano il Professore» contro «Ivano Fulmine», con gli stessi
  identici `54/53/42/64`. `rosaAvversaria` scarta i cognomi già usati da
  `SAVE.rosa`, che è locale. È cosmetica e il confine è duro: se a
  cambiare fosse il nome di un **titolare**, la prova diventa rossa,
  perché il codice non starebbe schierando la stessa squadra.

  **CINQUE CONTRO CINQUE, e la ragione del compito 2 era sbagliata
  (rettifica a edizioni, compito 3).** Il compito 2 aveva scritto, nel
  gioco e nella spec, che a sette «due telefoni con rose diverse
  schiererebbero due squadre diverse», perché `formaSquadre` sparge i
  rincalzi di quartiere usando il loro nome. **Misurato: falso.** A
  sette, due pagine con rose diverse schierano quattordici uomini con
  gli **stessi numeri** (zero differenze su quattordici) e la partita
  finisce uguale — `2-0` contro `2-0`, stessi sorteggi, stesse posizioni
  a ogni campione. Cambia **un nome su quattordici**. La ragione vera,
  quella che la misura lascia in piedi: a sette e a undici **il codice
  non descrive tutta la squadra** — la rosa del gioco è da cinque
  (`nuovaRosa`), quindi due uomini su sette e sei su undici li
  ricostruisce il telefono, con un nome pescato da un dato locale. A
  cinque il codice descrive ogni uomo che scende in campo. Il testo
  vecchio resta citato, con data e fonte accanto, sia nel gioco
  (`CARTA_TAGLIE`) sia nella spec. Il formato porta la taglia lo stesso,
  e il codice resta di 79 caratteri a qualunque taglia: aprire 7 e 11
  domani non costa un carattere, costa la descrizione degli uomini che
  oggi mancano.

  **IL GIRO, DALLA PARTE DI CHI GIOCA.** SFIDA → **SFIDA DI CARTA** →
  CREA UNA SFIDA: il gioco pesca un seme, ne ricava un avversario (una
  delle dieci squadre di quartiere, con una rosa costruita dal seme
  attorno alla forza della tua) e apre la partita. Si gioca; al fischio
  finale il codice nasce **col punteggio vero dentro** e il bottone di
  fine partita dice `IL CODICE` (`G.sfidaFine === 3`) e apre il pannello
  da solo. Chi lo riceve lo incolla e gioca la stessa identica partita;
  alla fine il gioco dice se ha fatto meglio, uguale o peggio — prima la
  differenza reti, poi i gol fatti. **Una sfida di carta non paga e non
  insegna**: `G.matchRewarded = true` (niente monete, niente crescita
  della rosa, niente trofei) e `Rete.imparaIndole` non gira — in campo
  non c'è la tua squadra, c'è quella del codice.

  **E NON PORTA UNA PROVA, scritto nel gioco e non solo qui.** Nel codice
  non c'è un nastro (un nastro pesa migliaia di byte, misurato alla
  #133), quindi non c'è niente da giudicare: chi riceve il codice può
  dichiarare il punteggio che vuole e nessuno può smentirlo. È un gioco
  fra due persone che si fidano. Chi vuole un risultato verificato ha la
  SFIDA di rete, che il giudice ce l'ha. Sta scritto nel pannello, in
  grassetto, accanto al codice.

  **LA PIEGA, misurata prima di scegliere e non dopo.** Tre posti
  possibili per l'ingresso, misurati sul gioco di allora iniettando il
  nodo nel DOM (`fuori/_sonda-135-bottone.js`): un quarto bottone nella
  barra `.azioni` manda la barra su due file e fa cadere il bottone nuovo
  **sotto** la piega; una voce grande **sopra** la lista porta la prima
  riga a **375** su una piega di 360, cioè **rompe `_q-sigillo` B3**; una
  voce grande **sotto** la lista non muove niente — `CERCA AVVERSARIO`
  resta a **220**, la prima riga a **329**, il primo GUARDA a **308**,
  identici al pixel su tutte e tre le viste, e l'ingresso nuovo sta sopra
  la piega a lista vuota su tutte e tre (**347 / 347 / 471** contro
  pieghe di 412 / 360 / 640). **Il prezzo, detto**: la barra dei tre
  bottoni scende di 46 px e a `915x412` con la lista vuota finisce 6 px
  sotto la piega, dove ci si arriva con lo stesso scorrimento che quella
  schermata chiede già oggi appena la lista ha una riga (barra a 692 con
  cinque righe). Si paga lì perché lì c'è TORNA AL MENU, che chiunque sa
  cercare.

  **ZERO RETE, contata come delta.** Tutto il giro — creare, giocare,
  incollare, rigiocare — non fa **una sola** richiesta
  (`_q-carta` D5, con l'impianto di `senza-rete.js`: si intercetta tutto
  e passa solo il documento del gioco). Si conta il **delta** dopo
  l'apertura della schermata SFIDA, che una richiesta la fa da sempre e
  per progetto: contarla come colpa della sfida di carta vorrebbe dire
  misurare la funzione sbagliata. Tacca a 1 (`/api/entra`, abortita),
  richieste nuove nel giro: **0**, e il giro arriva in fondo.

  **IL BANCO PRIMA DELLA COSA, e nasce 0/19.**
  `strumenti/_q-carta.js` (in batteria, `conta:true`, `lento:true`, ~75
  s, diciotto contesti di browser) chiude a **22 su 22**. **SEI FALSI**,
  ognuno costruito nel caso peggiore e ognuno rosso **solo** sulla sua
  prova: `_crit-carta-segreto` (sessanta bit dell'identificatore in coda
  al carico: passa **tutto** il gruppo A — 79→91 caratteri, controllo
  intatto — e tutto C, e passa perfino la ricerca di sottostringhe; cade
  su B1) · `_crit-carta-nomi` (sei lettere del nome della squadra, che
  l'alfabeto scrive `D0P01A` e la ricerca di sottostringhe non trova →
  B1) · `_crit-carta-controllo` (un simbolo invece di quattro → A3b,
  A3c) · `_crit-carta-locale` (sponde e mira guidata dal salvataggio:
  passa A e B **per intero** → C1, 3-4 su un telefono e 1-2 su un altro)
  · `_crit-carta-lungo` (tre cifre decimali per attributo, 143 caratteri
  → A2) · `_crit-carta-sopra` (l'ingresso in alto, «dove si vede
  meglio», che porta l'ingresso perfino più su — 266 invece di 347 → D4,
  la prima riga a 375). **Il più importante è `segreto`**: passa
  diciotto controlli su venti e cade su uno solo, il confronto fra due
  telefoni con identità diverse. È la prova che il gruppo B misura invece
  di attestare — una ricerca di sottostringhe non l'avrebbe mai trovato.

  **L'attrezzo si rifiuta di scrivere il file** se il blocco della sfida
  di carta nomina `mem()`, `segreto`, `codiceTrasferimento` o
  `teamName`: il divieto non sta solo nei commenti, sta nella catena che
  produce il gioco. E la toppa della rettifica dimostra da sé di essere
  solo un commento: fuori dai commenti il file prima e dopo è identico.

  **`MOTORE_V` resta 2**: non si è toccato né il nastro né la
  simulazione. Il codice della sfida **porta** il numero e rifiuta un
  codice scritto su un altro motore (`altro-motore`), ma non lo cambia.
  **Reti di sicurezza a ogni compito**: impronta del duello **44/44**,
  giudice **21/21**, sigillo **14/14**, ment-nastro 6/6,
  carattere-nastro 4/4, rosa-scala 4/4, nastro-tronco 5/5, rete 22/22,
  sfida 54/54, senza-rete 6/6. Batteria intera a cinque gruppi a ogni
  compito, verde; `istantanea` resta il solito NO informativo,
  pre-esistente e misurato uguale sul merge-base.

- **Il sigillo — #134 CANTIERE CHIUSO** (voce #134, 22 settembre 2026,
  quattro compiti dal merge-base `6dee72b` — spec
  `docs/superpowers/specs/2026-09-22-il-sigillo-design.md`, piano
  `docs/superpowers/plans/2026-09-22-il-sigillo.md`). **Quarto cantiere
  dell'onda D, e quello che chiude il cerchio aperto dalla #130.** Le tre
  voci precedenti hanno costruito il giudizio; questa lo fa arrivare
  all'occhio di chi gioca. Cantiere di MOTORE **e di SERVER**: il gioco
  per ancore (`_toppa-sigillo-vaglio.js` undici ancore,
  `_toppa-sigillo-riga.js` quattro, `_toppa-sigillo-guarda.js` sei di cui
  una a quattro teste), `rete/api/sfida.js` con Edit. `git diff main --
  CALCETTO-il-gioco.html`: **248 righe in più, 80 tolte**.
  `git diff main -- rete/`: **28 in più, 1 tolta**, tutte in
  `api/sfida.js`.

  **IL MURO ERA ALTO DUE MATTONI, misurati prima di scrivere una riga.**
  (1) `grep -c verificata rete/api/*.js` = **1**, ed era dentro a un
  commento: la colonna esiste in `schema.sql:125`, ha il suo indice
  parziale `sfida_daverificare`, ha tre valori documentati, e non era
  nella `select` del `GET /api/sfida`. Il dato c'era, il tubo no. (2)
  `Sfida.dipingi` stampava quattro cose per riga e nessuna era la
  verifica. Il giudice poteva anche lavorare: non se ne accorgeva
  nessuno.

  **UNA PORTA SOLA PER I NOVE CONTROLLI (`vagliaNastro`).** È la
  decisione che conta. I nove controlli che decidono se un nastro basta a
  rifare una partita stavano scritti **due volte** — in `giudica` (#133)
  e in `Sfida.guarda` — e i due elenchi **non erano identici**: `guarda`
  ripiega sul profilo di oggi dove `giudica` si rifiuta, e dello schermo
  non sapeva niente. Finché ne usciva solo un film, la doppia scrittura
  costava manutenzione; dal momento in cui ne esce un **verdetto scritto
  in lista**, la riga direbbe «non torna» esattamente dove il
  verificatore differito direbbe «incompleto». `vagliaNastro(righe)` è la
  porta comune. Che cosa se ne fa resta diverso, ed è giusto che lo
  resti: il giudice si ferma su tutti e nove i rifiuti, `Sfida.guarda` su
  quattro (`motore-diverso`, `nastro-vuoto`, `nastro-troncato`,
  `duello-marchiato`); sugli altri quattro (`rose-assenti`,
  `carattere-assente`, `schermo-ignoto`, `schermo-diverso`) **il film si
  vede lo stesso** — rifiutare ogni replay fra schermi diversi vorrebbe
  dire spegnere la funzione per quasi tutti — ma il verdetto no.
  **RETTIFICA A EDIZIONI (23 settembre 2026, voce #142).** I rifiuti del
  vaglio non sono più nove ma **undici**: il #139 ha aggiunto
  `schermo-cambiato` e il #142 `motore-js-diverso` e `motore-js-ignoto`,
  l'impronta del motore JavaScript che il nastro adesso dichiara (riga di
  tipo 11). `Sfida.guarda` continua a fermarsi sugli stessi quattro e non
  su questi — li intercetta **per nome**, e questi due nomi non sono in
  quella lista — quindi **i replay non si spengono**, per la stessa
  ragione dello schermo: un film approssimato costa niente, un verdetto
  approssimato costa punti a qualcuno. **E non è un'inferenza dal codice,
  è misurato** (`fuori/_sonda-142d.js`, 23 settembre 2026): la stessa
  sfida vera guardata tre volte dal telefono del difensore — nastro
  intatto, nastro che dichiara un motore che non è quello di chi guarda,
  nastro senza nessuna riga 11 — dà tutte e tre le volte
  `registroModo = 2`, scena `kickoff`, cinque uomini in campo, mentre il
  giudizio sugli stessi tre nastri dice `TORNA`,
  `INCOMPLETO/motore-js-diverso` (col numero chiesto nel referto) e
  `INCOMPLETO/motore-js-ignoto`. Il testo sopra resta dov'è.
  Comportamento visibile invariato: `_q-giudice` 21/21 e `_q-sfida` 54/54
  prima e dopo l'estrazione.

  **LE CINQUE PAROLE, una famiglia sola.** `DA VERIFICARE` (server, 0) ·
  `VERIFICATA` (server, 1) · `NON TORNA` (server, -1) · `TORNA` (questo
  telefono, il replay appena guardato torna) · `NON VERIFICABILE` (questo
  telefono, il replay non era giudicabile). **`DA VERIFICARE` e non «da
  guardare»** (che è la parola dello schema): nella stessa riga ci sono
  già il pallino ambra e il bottone GUARDA, e una terza cosa che dicesse
  «da guardare» parlerebbe di un'altra faccenda con le stesse parole.
  **`TORNA` e non `VERIFICATA` quando lo dice il telefono**: sono due
  fatti diversi, e chi difende è parte in causa — il suo telefono può
  dire che cosa ha visto, non timbrare la classifica.

  **NESSUN INNOCENTE ACCUSATO, ANCHE NELLE PAROLE.** `NON TORNA` è
  l'unico verdetto che può muovere punti e resta l'unica parola che
  accusa; `INCOMPLETO`, `ALTRO MOTORE` e `NON FINISCE` diventano `NON
  VERIFICABILE` con la causa vera nella riga di stato (`Sfida.causaSigillo`,
  sei cause in italiano). Non è un caso di scuola: in produzione due
  telefoni con lo **stesso** schermo sono l'eccezione, e senza questa
  distinzione la lista darebbe del baro a quasi tutti — la #133 ha
  misurato `800x360` contro `915x412` che dà 0-3 dove il tabellone dice
  3-4.

  **L'AUTORITÀ È DEL SERVER, e il verdetto locale NON parte per la
  rete.** Il sigillo di questo telefono si vede solo dove il server dice
  ancora `0`. E non esiste nessun endpoint che lo accetti: chi ha subìto
  la sfida ha un interesse diretto a che quel risultato cada, e «il mio
  telefono dice che il tuo replay non torna» sarebbe una leva per
  togliere punti a un innocente. Il verdetto che muove punti lo darà il
  lavoratore differito, che una squadra in classifica non ce l'ha.

  **IL SERVER: una colonna e un freno.** `verificata` entra nella
  `select` del `GET /api/sfida`. Nessuna tabella nuova, quindi nessuna
  riga di RLS da scrivere — una tabella senza `enable row level security`
  + `revoke` sarebbe l'unica porta aperta del database. **E il freno**:
  quel GET ne era rimasto senza da quando è stato scritto (il POST ha
  `sfida:` 30/60, il GET della classifica ha `cla:` 60/60, questo
  niente). Non è una conseguenza della cura, è un buco trovato perché la
  cura toccava la riga accanto: `sfl:<id>`, 60 al minuto, e il gioco ne
  fa **una** chiamata per apertura della schermata.

  **LA PIEGA, misurata e non sperata.** Il sigillo sta sotto il nome,
  dentro la riga che già scorre. La fascia di riepilogo in cima («3 da
  verificare, 1 non torna») è la tentazione del cantiere ed è il difetto
  già pagato del TORNEO (grep «LE OTTO SQUADRE SOPRA LA PIEGA»). A
  800x360 con cinque righe: CERCA AVVERSARIO chiude a **220**, la prima
  riga a **329** (era 308), il primo GUARDA a **308**; la riga passa da
  **46 a 67 px**. Trentun pixel di margine sulla piega. Il falso
  `_crit-sigillo-fascia` porta la prima riga a **418** su una piega di
  360.

  **IL BANCO PRIMA DELLA COSA, e nasce 5/5 rosso poi 9/14 rosso.**
  `strumenti/_q-sigillo.js` (in batteria, `conta:true`, ~13 s) percorre
  il tubo intero, e il pezzo che lo rende una misura invece di un
  attestato è il gruppo A: carica il modulo **vero** `rete/api/sfida.js`
  con `import()` dinamico e gli mette al posto di `db` un finto che
  **onora la `select`** come PostgREST. Un finto che restituisse la riga
  intera direbbe verde anche con la colonna fuori dalla `select` — cioè
  proprio nel caso che il cancello esiste per trovare. **CINQUE FALSI**,
  ognuno costruito nel caso peggiore e ognuno rosso **solo** sulla sua
  prova: `_crit-sigillo-server-sordo` (colonna fuori dalla `select`,
  freno intatto → A1, A2) · `_crit-sigillo-muto` (il sigillo si calcola e
  non si stampa → B1, B2, C5) · `_crit-sigillo-accusa` (ogni scarto è una
  colpa → C3, C4b) · `_crit-sigillo-timbro` (a fine replay dice sempre
  TORNA → C2, C5) · `_crit-sigillo-fascia` (il riepilogo sopra la lista →
  B3). Il più importante è `accusa`: dice TORNA quando torna, NON TORNA
  sul punteggio gonfiato, stampa i sigilli giusti — **passa dieci prove
  su dodici** e cade su una cosa sola, uno schermo diverso da quello del
  nastro.

  **`MOTORE_V` resta 2**, e non è una speranza: non si è toccato né il
  nastro né la simulazione, e la prova sono l'impronta del duello **44 su
  44** e il giudice **21 su 21** a ogni compito. **Quel che NON fa questo
  cantiere**: non scrive il lavoratore differito (resta fuori, come dopo
  la #133), non manda verdetti al server, non tocca lo schema. **Reti di
  sicurezza a ogni compito**: impronta 44/44, giudice 21/21, ment-nastro
  6/6, carattere-nastro 4/4, rosa-scala 4/4, nastro-tronco 5/5, rete
  22/22, sfida 54/54, senza-rete 6/6. Batteria intera a gruppi, verde;
  `istantanea` 45/56 **sia sul gioco di oggi sia su quello di `main`**
  (misurato a due versioni: pre-esistente, ed è informativo).

- **Il giudice — #133 CANTIERE CHIUSO** (voce #133, 22 settembre 2026,
  cinque compiti dal merge-base `e7aa605` — spec
  `docs/superpowers/specs/2026-09-22-il-giudice-design.md`, piano
  `docs/superpowers/plans/2026-09-22-il-giudice.md`). **Cuore dell'onda
  D.** Il mandato §10.5 chiede il **verificatore differito** delle sfide:
  «la classifica si ripulisce da sola» è scritto in `rete/LEGGIMI.md` da
  mesi, la colonna `verificata` è nello schema, e il lavoratore che
  rigioca davvero la partita non esisteva — zero righe di codice.
  Cantiere di MOTORE, tutto per ancore (`strumenti/_toppa-giudice.js`
  quattro ancore, `_toppa-giudice-schermo.js` sei, `_toppa-133-motorev.js`
  una di solo commento, e la correzione di revisione del 22 settembre
  2026 `_toppa-giudice-schermo-ignoto.js` una). `git diff main --
  CALCETTO-il-gioco.html`: **384 righe in più, 6 tolte** (era 375/6
  prima della correzione).

  **LA DECISIONE D'ARCHITETTURA: il giudice vive NEL FILE, non nel
  server.** Un verificatore che rigioca con un SECONDO motore scritto in
  Node è la peggiore idea possibile per questo problema: due
  implementazioni della stessa fisica divergono per costruzione, e ogni
  divergenza toglie punti a un innocente invece di trovare un baro. Il
  motore vero è uno solo. `Sfida.guarda` faceva già il lavoro — prende un
  nastro, lo rigioca, confronta il punteggio con quello dichiarato — ma
  la capacità stava dentro a una schermata. `giudica(nastro, atteso,
  {seme, taglia})` è quella stessa capacità chiamabile da un browser
  senza finestra. Un verificatore è allora: pesca la riga, allargala
  (`deflate-raw`, in Node), apri il file, chiama, leggi una stringa.

  **I CINQUE VERDETTI, e uno solo può muovere punti.** `TORNA` ·
  `NON TORNA` (l'unico su cui sia lecito agire) · `INCOMPLETO` (nove
  cause distinte: `nastro-assente`, `nastro-illeggibile`, `nastro-vuoto`,
  `nastro-troncato`, `duello-marchiato`, `rose-assenti`,
  `carattere-assente`, `duello-senza-righe`, `schermo-diverso`, più
  `seme-assente`/`taglia-assente`/`atteso-assente`) · `ALTRO MOTORE` ·
  `NON FINISCE`. **Il contratto, quattro punti**: (1) forza
  `sponde:'gabbia'` e `miraGuidata:'pieno'` come fanno `Sfida.gioca` e
  `Sfida.guarda`, perché sono impostazioni del TELEFONO e un giudice che
  le seguisse direbbe NON TORNA per colpa del motore; (2) legge le rose
  DAL NASTRO e — qui è **più stretto di `Sfida.guarda`** — se la testa di
  tipo 7 manca si rifiuta invece di ripiegare sul profilo vivo (un film
  approssimato costa niente, un verdetto approssimato costa punti); (3)
  non muove mai un punto su un verdetto diverso da NON TORNA; (4) è
  deterministico e ripetibile. **Il tetto è `tettoFotogrammi(taglia)`**
  (18.000/21.000/27.000, voce #130), non un numero fisso: tarato su
  taglia 5 boccerebbe ogni sfida legittima a 11. Si può solo STRINGERE
  dall'esterno, mai allargare.

  **IL SALVATAGGIO SI FOTOGRAFA E SI RIMETTE COM'ERA.** Misurato
  (`fuori/_sonda-133-fermo.js`): una partita che finisce muove
  `SAVE.lastRes` e `SAVE.inviti` anche quando non paga niente
  (`Inviti.usato` scrive SEMPRE, anche a inviti zittiti). Un verificatore
  ne fa mille al giorno: senza la fotografia si ritroverebbe sulla
  lavagna di casa il risultato di partite mai giocate. Si fotografa
  TUTTO e non le due chiavi trovate, perché l'elenco dei posti in cui una
  partita può scrivere non è una cosa che si dichiari chiusa guardandola
  una volta. E `chiudiSfida` non chiama più `Rete.imparaIndole` durante
  un giudizio: chi ne verificasse mille diventerebbe la media di mille
  sconosciuti.

  **IL BANCO PRIMA DELLA COSA, e nasce 0/16.** `_q-giudice.js` gira a
  **TRE pagine e non due**: una sfida si registra solo attaccando e si
  rivede solo difendendo, ma il giudice non è nessuno dei due — è un
  browser che apre il file e basta. La terza pagina non si collega, non
  entra, non gioca, ha la rosa vergine e **le impostazioni locali
  sbagliate apposta** (sponde CAMPO VERO, mira ESSENZIALE), così la prova
  B non prova solo che il giudice funziona: prova il primo punto del
  contratto. **SETTE FALSI, e ognuno passa tutte le prove tranne la sua**
  — `cieco` (dice sempre TORNA) cade su C/H/M, `vivo` (rose dal profilo
  vivo) su B/B2/M, `sordo` (il ripiego di `Sfida.guarda` portato dentro
  al giudice) sulla **sola** F, `fisso` (tetto 18.000 a ogni taglia)
  sulla **sola** K, `locale` (sponde e mira dal salvataggio) su B/C/M,
  `lento` (il tetto raggiunto diventa un'accusa) su I/M, `sbadato` (la
  versione del motore si legge e non si guarda) su G/M. **Il falso
  `locale` ha insegnato una cosa che il progetto non prevedeva**: con le
  sponde sbagliate la rigiocata DIVAGA e finisce su un calcio piazzato
  che il nastro non ha, quindi `INCOMPLETO/duello-senza-righe` e non NON
  TORNA — il giudice sbagliato non accusa nessuno, semplicemente non
  verifica più niente.

  **IL TASSO DI FALSI «NON TORNA» SU PARTITE ONESTE: 0 su 14**
  (`_t-giudice-onesto.js`: 10 sfide vere a taglia 5, 2 a 7, 2 a 11,
  giocate con dita simulate e giudicate una per una — **14 TORNA su
  14**). I nomi non spostano un verdetto (GIUDICE UNO contro GASOMETRO,
  che nella tabella dei caratteri c'è, rose diverse) e nemmeno l'audio
  (la cura del #132 tiene, rimisurata dalla parte del giudice).
  **RETTIFICA A EDIZIONI (22 settembre 2026, correzione di revisione,
  MINORE-1): «0 su 14» non è «il tasso è zero».** La regola dei tre dice
  che 0 successi su 14 prove è compatibile con un tasso vero fino a
  circa il **19%** al 95% di confidenza: si può dire «non abbiamo visto
  falsi accuse», non «il tasso è zero». E il numero vale SOLO nella
  condizione davvero misurata — **nastri del gioco nuovo, con lo schermo
  uguale o dichiarato** — non fuori da essa: la voce IMPORTANTE-1 qui
  sotto ha trovato una condizione (schermo IGNOTO, cioè nastro senza la
  riga di tipo 10) in cui il giudice PRIMA della cura dava proprio
  quell'accusa, su una sfida onesta.

  **IL SESTO CANALE, TROVATO MISURANDO — ed è il più grosso.** Il terzo
  canale sospetto era la finestra, in lista per la ragione SBAGLIATA (i
  sorteggi della cosmetica, che la voce #129 ha spostato su `DECO` e che
  non c'entrano). **Il canale passa dai PIXEL**: il nastro registra i
  tocchi in coordinate di SCHERMO, e dove finisce un tocco lo decidono
  `touchBtnLayout` e `SCALE/OX/OY`, che derivano tutti da
  `innerWidth`/`innerHeight` (`function resize`). Lo stesso tocco a
  (841, 342) preme il disco grande su 915x412 e non preme NIENTE su
  800x360, dove quel punto è fuori dalla finestra. MISURATO
  (`fuori/_sonda-133-finestra.js`, nove viste sullo stesso nastro,
  partita dichiarata 3-4): `915x413`/`916x412`/`930x412`/`915x430`
  tornano 3-4; `1024x460` **NON TORNA 1-3**; `1280x720`
  **INCOMPLETO/duello-senza-righe 0-4**; `844x390` (iPhone 14) e
  `800x360` **NON TORNA 0-3**. Non è una lama: quindici pixel non
  spostano niente, settanta spostano tutto. **E NON È UN DIFETTO DEL
  GIUDICE: C'ERA GIÀ, IN PRODUZIONE** — misurato col replay vero
  (`fuori/_sonda-133-schermi.js`), schermi uguali 3-4 contro 3-4, e
  915x412/844x390 → 0-3, 844x390/915x412 → 1-3, 915x412/800x360 → 0-3,
  **con il gioco che scrive testualmente «La squadra di chi ti ha
  attaccato è cambiata da allora»**. L'innocente accusato, la stessa
  frase che il #132 ha tolto di mezzo cinque volte, detta quasi sempre —
  perché in produzione due telefoni con lo stesso schermo sono
  l'eccezione, non la regola. **CURA** (non la definitiva): il nastro
  porta lo schermo su cui è stato registrato (**riga di tipo 10**, due
  numeri, scritta da `Sfida.gioca` accanto alle due rose); il GIUDICE, su
  uno schermo diverso, si RIFIUTA (`INCOMPLETO`, causa `schermo-diverso`)
  **e dichiara quale schermo serve**, così chi lo chiama riapre il
  browser di quella misura e giudica davvero; il REPLAY di produzione il
  film lo mostra lo stesso — rifiutarlo vorrebbe dire spegnere la
  funzione per quasi tutti — ma quando il punteggio non torna dà la CAUSA
  VERA invece di dare la colpa alla rosa. La cura DEFINITIVA (tocchi
  registrati in coordinate che non dipendono dallo schermo) è **fuori
  perimetro, dichiarata seguito**.

  **MOTORE_V RESTA 2, MISURATO** (`_t-132-motorev.js --prima
  fuori/gioco-133-base.html`, cioè `main` `e7aa605`): 30 nastri
  registrati sul gioco di prima e rigiocati sul curato, taglia 5, 3600
  passi, semi da 20260801, **30 su 30 identici** (impronta, punteggio,
  sorteggi); zero nulli, uno dei trenta passato dal dischetto. La misura
  è scritta accanto al numero nel sorgente. **Non si è scritto un
  `_t-133-motorev.js`**: sarebbe stata la copia di un attrezzo di
  trecento righe per cambiare un valore di default, e in questa casa una
  copia è un posto in più dove la stessa ferita si riapre da sola.

  **CANCELLI**: `_q-giudice` 0/16 → 16/16 (C2) → 18/18 (C3, con le prove
  O e P dello schermo) → **21/21** (correzione di revisione del 22
  settembre 2026: prova Q sullo schermo IGNOTO, prove R/S sul duello
  deterministico — vedi sotto), **registrato in `strumenti/tutti.js` con
  `conta:true` insieme alla cura** — non un cantiere dopo, che è il
  rilievo di revisione già pagato dal #131 e dal #132;
  `_t-giudice-schermo` 2/5 → **5/5**; `_t-giudice-onesto` **14/14 TORNA**
  e i quattro canali concordi; impronta del duello **44/44 a ogni
  compito** (cinque volte); i quattro cancelli dei canali del #132
  (`_q-ment-nastro` 6/6, `_q-carattere-nastro` 4/4, `_q-rosa-scala` 4/4,
  `_q-nastro-tronco` 5/5) verdi a ogni compito. **Batteria intera a sei
  gruppi a ogni compito**, tutti i cancelli che contano VERDI; `audio`
  esce 3 in compagnia (rumore già dichiarato dal #132) e **28/28 da
  solo**; `avvio-telefono` esce 3 perché non c'è nessun telefono
  collegato; `istantanea` (informativo, non conta) 45/56, lo stesso
  rumore dichiarato dai cantieri precedenti.

  **RETTIFICA A EDIZIONI (22 settembre 2026): questo paragrafo era «UNA
  PROVA CHE PUÒ NON ESERCITARSI», e la correzione IMPORTANTE-2 qui sotto
  lo ha chiuso davvero.** Il testo vecchio diceva: il caso
  `INCOMPLETO/duello-senza-righe` si costruisce da un nastro che ABBIA
  righe di tipo 6, e col copione fisso una sfida su trenta ci passa
  (misurato dal #132); quando nessuna delle due sfide del banco ne ha
  una, la prova si stampa come NON ESERCITATA e non si conta; il caso
  resta comunque esercitato dal falso `locale`. **QUEST'ULTIMA RIGA NON
  REGGEVA** (rilievo di revisione): su `locale` le prove B e C cadono per
  un'altra ragione (INCOMPLETO al posto di TORNA/NON TORNA) e
  passerebbero lo stesso se il giudice avesse detto NON TORNA su
  `divagata` — il falso ESERCITA il cammino, non lo CONDANNA. Due falsi
  del revisore (uno su `divagata`, uno su `rigiocata-esplosa`) passavano
  **18/18**. La cura è la sfida CONGELATA (sotto): il caso ora è
  **deterministico**, non più «può non esercitarsi».

  **FUORI PERIMETRO, dichiarato**: il lavoratore lato server (questo
  cantiere costruisce la CAPACITÀ e la prova; il ciclo che pesca le righe
  con `verificata=0` e scrive `verificata=-1` con `muovi_punti(-delta)` è
  il cantiere dopo — un lavoratore si prova contro un database, questo si
  prova contro il motore); il punteggio di sospetto continuo; alzare il
  tetto delle 40.000 righe; i tocchi indipendenti dallo schermo;
  `rigiocata-esplosa` (l'altro «non lo so» della rigiocata, un'eccezione
  vera dentro il motore — non si è trovata una costruzione deterministica
  in tempo ragionevole, e si dichiara invece di fingere una copertura che
  non c'è, correzione di revisione del 22 settembre 2026).

  **CORREZIONI DI REVISIONE (22 settembre 2026, voce #133), applicate in
  un commit a parte dopo il «Ready to merge: YES previa correzione» con
  due rilievi IMPORTANTE e due MINORE, nessun CRITICO. Cantiere di
  MOTORE: il gioco è stato toccato per una riga di codice più commento,
  via attrezzo a ancore (`strumenti/_toppa-giudice-schermo-ignoto.js`).**

  (IMPORTANTE-1) **Il giudice rifiutava lo schermo DIVERSO ma non lo
  schermo IGNOTO.** `schermoDelNastro()` torna `null` quando la riga di
  tipo 10 manca, e il controllo di allora — `if(sc && (...))` — era
  falso su `null`: il giudice PROCEDEVA. Asimmetrico col resto del
  giudice, che si rifiuta perfino su un dato che sposta molto meno
  (`carattere-assente`) ma non sul canale che questo stesso cantiere ha
  misurato come il più grosso. **MISURATO DALLA REVISIONE** (sfida
  onesta 3-4 giocata col gioco `e7aa605`, dove la riga 10 non esiste
  ancora, rigiocata dal gioco nuovo): `915x412` **TORNA** 3-4;
  `1024x460` **NON TORNA** 1-3; `844x390` e `800x360` **NON TORNA**
  0-3 — un innocente accusato su tre schermi su quattro, e il ramo era
  protetto **per accidente** (un nastro pre-#132 cade prima su
  `carattere-assente`), non per progetto. **CURA**: `if(!sc) return
  fermo('INCOMPLETO','schermo-ignoto');`, subito dopo il controllo del
  carattere. **COSTO ZERO**: ogni nastro vero ha sempre la riga 10
  (`Sfida.gioca` la scrive ad ogni partita), i nastri sintetici del
  banco escono prima su `nastro-vuoto` o un'altra causa più specifica.
  **VERIFICATO**: `1024x460` sul nastro senza riga 10 dà ora
  `INCOMPLETO/schermo-ignoto`, non più `NON TORNA`; tutte le 18 prove
  precedenti restano verdi; nuova prova Q nel banco.

  (IMPORTANTE-2) **Il cancello non difendeva i «non lo so» prodotti
  DURANTE la rigiocata.** I due cammini `duello-senza-righe` e
  `rigiocata-esplosa` non erano condannati da nessuna asserzione — vedi
  la rettifica sopra. **CURA**: `strumenti/_nastro-duello-congelato.js`,
  una sfida vera con un duello NATURALE dal dischetto (nessuna
  forzatura fuori banda: si è provato e scartato forzare `rigori()` a
  metà partita, che rompe la ripetibilità del nastro — misurato,
  giudicato intatto dava NON TORNA invece di TORNA). Rigiocata intatta
  **TORNA** (prova R); senza i comandi di quel duello (`N.senzaDuelli`)
  dà **INCOMPLETO/duello-senza-righe** (prova S), **deterministico**,
  non più legato a quante delle sfide di una sessione passino dal
  dischetto (era una su trenta). Costruito e **BOCCIATO** il falso
  `_crit-giudice-accusa.js` (il «non lo so» diventa un verdetto vero e
  proprio): il banco cade **solo** sulla prova S (20/21), tutte le
  altre restano verdi. `rigiocata-esplosa` resta dichiarata NON
  ESERCITATA (vedi FUORI PERIMETRO).

  (MINORE-1) **Rettifica del tasso «0 su 14»**: vedi sopra, nel
  paragrafo del tasso di falsi.

  (MINORE-2) **Il devicePixelRatio, MISURATO**: `function resize` calcola
  `SCALE`/`OX`/`OY` solo da `innerWidth`/`innerHeight` (pixel CSS), e il
  DPR entra solo in `cv.width`/`cv.height` e nella chiave di cache — mai
  nella geometria logica. **MISURATO** (`deviceScaleFactor` 1, 2 e 3,
  stessa finestra 915x412, sfida congelata): **verdetto, gol e passi
  identici** ai tre DPR (`TORNA` 1-2, 9367 passi). Il canale è
  confermato innocuo, non solo «quasi certamente».

  `_q-giudice` **21/21** (era 18/18); `_q-duello-impronta` **44/44**; i
  quattro cancelli del #132 (`_q-ment-nastro` 6/6, `_q-carattere-nastro`
  4/4, `_q-rosa-scala` 4/4, `_q-nastro-tronco` 5/5) verdi; batteria
  intera a cinque gruppi, tutti i cancelli che contano VERDI
  (`istantanea`, informativo, segnala un riferimento nullo — nessuna
  quota da confrontare, non pertinente al giudice).

- **Nessun innocente accusato — #132 CANTIERE CHIUSO** (voce #132, 21
  settembre 2026, sei compiti dal merge-base `3deb807` — spec
  `docs/superpowers/specs/2026-09-21-nessun-innocente-design.md`, piano
  `docs/superpowers/plans/2026-09-21-nessun-innocente.md`). Secondo
  cantiere dell'**onda D**. Il #131 ha dato al giudice qualcosa da
  misurare (il duello nel nastro); questo gli toglie di mezzo i **falsi
  positivi**, cioè le strade per cui una partita ONESTA rigiocata finisce
  diversa da come è finita. Un giudice che sbaglia in un verso lascia
  passare un punto rubato; uno che sbaglia nell'altro **toglie punti a chi
  non ha barato**, e quello non si vede e non si corregge. Cantiere di
  MOTORE, tutto per ancore (`strumenti/_toppa-*.js`, cinque attrezzi, 25
  ancoraggi).

  **CORREZIONI DI REVISIONE (21 settembre 2026, voce #132), applicate in
  un commit a parte dopo il «Ready to merge: YES» con quattro rilievi
  MINORE, nessun CRITICO. Cantiere di MOTORE: il gioco è stato toccato
  per una riga di codice più otto di commento, via attrezzo a ancore
  (`strumenti/_toppa-132-cardif.js`).**
  (1) **MINORE — un numero del verbale non si riproduceva col comando di
  casa.** `strumenti/_t-132-motorev.js` aveva `PASSI` di default a 2400,
  ma il commento accanto a `MOTORE_V` nel gioco e questo stesso manuale
  dichiarano **3.600 passi** e «uno dei trenta passa dal dischetto»: col
  comando nudo uscivano 2.400 passi e zero dal dischetto, e solo
  `--passi 3600` rifaceva i numeri scritti. **CURA**: il default è salito
  a 3.600 e `--passi` è entrato nella riga `uso:`. **RIMISURATO col
  comando nudo**: 30 semi provati, 0 nulli, **30 su 30 identici**, **1 dei
  trenta dal dischetto** — lo stesso verdetto, adesso riproducibile senza
  flag.
  (2) **MINORE — una cifra sbagliata nel verbale.** Il punto (d) qui sotto
  attribuiva al gioco CURATO «40.001 comandi in 7.295 passi»: **misurato
  di nuovo**, il curato dà **40.002** (il tetto più la riga di marchio di
  tipo 9) e **40.001** è invece il numero che esce sul gioco di PRIMA
  (`main` `3deb807`, senza marchio). Corretto nel punto (d) e in
  `PUNTO-DEL-LAVORO.md`, col numero vecchio lasciato accanto e non
  cancellato. Il verdetto dei cinque controlli non cambia.
  (3) **MINORE — `carDif` non ricadeva col resto.** Nel ripiego di
  `Sfida.guarda` (quando il nastro non porta una rosa valida — tipicamente
  una testa di tipo 7 malformata) si rimettevano `mentAtt`/`mentDif`/
  `rosaAtt`/`rosaDif` ai valori di ieri, ma non `carDif`, che restava
  quello letto dalla stessa testa malformata. `carPerIndice` lo limita
  comunque (fuori range → `CAR_NEUTRO`), quindi il danno massimo era un
  carattere sbagliato-ma-valido in un cammino già degradato, raggiungibile
  solo con un nastro corrotto o OSTILE — e in un'onda dove i nastri
  ostili contano, l'asimmetria si chiude. **CURA**: `carDif = undefined;`
  in coda al ripiego, per simmetria con gli altri quattro valori — via
  attrezzo a ancore (`strumenti/_toppa-132-cardif.js`, un'ancora,
  `--out` verificato byte-per-byte prima di `--dentro`). **VERIFICATO**:
  `git diff main -- CALCETTO-il-gioco.html` sale da 310/13 a **319/14**
  righe — nove aggiunte (il commento più la riga di codice), una tolta (la
  riga sostituita) — e `_q-duello-impronta.js` resta **44/44**, impronta
  non mossa.
  (4) **MINORE — i cancelli nuovi non erano in batteria**, lo stesso
  rilievo già pagato dal #131 per il duello. I quattro attrezzi dei
  cinque canali (`_t-ment-nastro.js`, `_t-carattere-nastro.js`,
  `_t-rosa-scala.js`, `_t-nastro-tronco.js`) erano rimasti `_t-*`, e
  `strumenti/tutti.js` non li nominava: nessun cancello della batteria si
  sarebbe accorto di una regressione su nessuno dei cinque canali. **CURA:
  promossi TUTTI E QUATTRO** (non solo `_t-ment-nastro.js`, il minimo
  suggerito dal revisore): ciascuno misura un canale che gli altri tre
  non toccano, nessuno costruisce mutanti a ogni corsa, nessuno dipende da
  un cronometro di produzione, e il costo totale misurato (~11 s + ~11 s +
  ~22 s + ~11 s, macchina di sviluppo) è sotto la soglia dei 30-40 s che
  qui chiede `lento:true` (modello `audio.js`): tutti e quattro
  `lento:false`. Rinominati (`git mv`) `_q-ment-nastro.js`/
  `_q-carattere-nastro.js`/`_q-rosa-scala.js`/`_q-nastro-tronco.js` e
  registrati in `tutti.js` con `conta:true`. Tutti i riferimenti al nome
  vecchio aggiornati (`strumenti/`, questo manuale, `PUNTO-DEL-LAVORO.md`,
  `docs/superpowers/`, con una nota di edizione dove il riferimento era in
  un piano o una spec datati). **RIMISURATI**: `ment-nastro` 6/6,
  `carattere-nastro` 4/4, `rosa-scala` 4/4, `nastro-tronco` 5/5.
  **OSSERVAZIONE CHIARITA (non un rilievo)**: `.gitignore` porta
  `_z-log/` dal compito 0 di questo cantiere — verificato, è la cartella
  dove chi ha lavorato il cantiere ha scritto i log della batteria
  rilanciata ad ogni compito (`bat-c0-*.txt` … `bat-c5-*.txt`,
  `motorev.txt`), non tracciata e rigenerata ad ogni corsa: resta, e resta
  ignorata.
  **BATTERIA**: rilanciata a gruppi dopo tutte le cure, tutti i cancelli
  che contano verdi, i quattro nuovi compresi.
  `git diff main -- CALCETTO-il-gioco.html`: **319 inserite, 14 tolte**
  (contro le 310/13 di prima di questa correzione — la sola differenza è
  `carDif`, punto 3).

  **I CANALI ERANO QUATTRO NEL PIANO. SONO CINQUE, E IL QUINTO È STATO
  TROVATO MISURANDO** — il cancello del compito 1 restava rosso su una
  sfida su due anche a cura applicata, e la causa non era la mentalità.

  **(a) LA MENTALITÀ CAMBIATA IN PAUSA** (`:40888-40924`). Girava
  `G.ment[0]` senza nessuna guardia su `G.sfida` né su `Reg.modo`, e senza
  scrivere niente nel registro. Due buchi opposti: chi ATTACCA cambia
  postura a metà partita e il nastro non se ne accorge; chi GUARDA può
  aprire la pausa e cambiare la mentalità della squadra di chi l'ha
  attaccato — da lì in poi il replay è una partita inventata dal pollice
  di chi la sta guardando. Il commento accanto lo diceva già: «IL FATTO
  CHE NON EMETTO: qui nasce un evento buono per il REGISTRO DEI FATTI».
  **RETTIFICA al piano**: la mentalità INIZIALE nel nastro c'era già
  (`Reg.scrivi(7, [mentMia, mentSua] …)`), il buco era il CAMBIO a partita
  in corso, che per natura non può stare in una riga di testa. **CURA**:
  riga di **tipo 8** `[tick, 8, ms, chi, ment]`, e `posaMentalita()` —
  una funzione sola per i due capi, come `Reg.eseguiDuello` per i tre
  verbi del dischetto. **REGISTRATA E NON IMPEDITA**, dichiarato:
  `sponde` e `miraGuidata` la sfida le forza perché sono il MOTORE e due
  telefoni devono averle identiche; la mentalità è una MOSSA di chi gioca,
  come un tocco, e una mossa si annota. **MISURATO**: 5 semi su 5 in CPU
  contro CPU (primo scarto al passo 80); in sfida, punteggio rigiocato
  **0 su 2 identico** (2-1 contro 3-2, 2-3 contro 0-1) → **2 su 2** dopo.

  **(b) IL CARATTERE DELLA CPU DIPENDEVA DAL NOME** (`:11356`,
  `G.car = [CAR_NEUTRO, caratterePer(G.oppName)]`). Il nome nel nastro non
  viaggia — ed è giusto, è il dato di una persona — ma allora il carattere
  non lo decideva niente che stesse dentro la partita: chi attacca lo
  legge da `a.nome`, chi guarda da `dif.nome` col ripiego `SAVE.teamName`.
  Basta che il difensore **cambi il nome della sua squadra** fra la
  partita subita e il momento in cui la guarda. **CURA**: `CAR_NOMI`,
  `indiceCarattere`, `carPerIndice`, e un **indice fra -1 e 9 in CODA
  alla riga di tipo 7** — in coda perché la lettura è posizionale
  (`spaccaRosa` torna già `fine`), quindi un nastro vecchio finisce prima
  e `startMatch` ricade sul nome, cioè su quello che faceva ieri. E
  `Sfida.gioca` passa a `startMatch` **lo stesso numero** che scrive nel
  nastro: chi registra e chi rigioca attraversano la stessa porta.
  **DA OGGI L'ORDINE DI `CARATTERE` È UN FORMATO**, ed è scritto accanto
  alla tabella: chi lo riordina deve alzare `MOTORE_V`. **MISURATO**:
  difensore GASOMETRO che si rinomina, CPU giocata `0.75/2/1/0.9/1/1.15`
  contro CPU rigiocata `1/1/1/1/1/1`, punteggio **0 su 2 identico** (1-2
  contro 1-6, 0-1 contro 2-3) → **2 su 2** dopo.

  **(c) QUATTRO PORTE, QUATTRO RISPOSTE.** Un attributo di rosa entrava da
  quattro porte e nessuna concordava: `loadSave` (`s.rosa=j.rosa`, nessun
  controllo — l'unica chiave di quel blocco che non guardava i propri
  valori), `setupPlayers` (copia grezza), `impaccaRosa`
  (`max(1,min(99,v|0))`), `startMatch` (`round`, 1..99, ripiego 62).
  Misurato su otto casi: **sei discordi su otto**, e per `"abc"` quattro
  risposte diverse allo stesso ingresso. In una sfida `Sfida.gioca` non
  passa `mia.rosa`, quindi `setupPlayers` legge `SAVE.rosa` GREZZA: la
  partita si giocava con **250** e il nastro registrava **99**. **CURA**:
  `attrRosa`, una regola sola, chiamata **alla SORGENTE** — la dottrina
  già scritta per il pixel intero e applicata dal #131 al dischetto: si
  quantizza dove nasce il dato, così campo e nastro sono lo stesso numero
  per costruzione. Assente resta diverso da zero (null/undefined →
  ripiego; uno zero scritto per davvero → 1). **MISURATO**: 2 porte
  concordi su 8 → **8 su 8**, 3 risposte in scala su 8 → **8 su 8**,
  punteggio rigiocato 0 su 2 → **2 su 2**.

  **(d) IL REGISTRO TACEVA QUANDO TRONCAVA** (`:13419`, `if(this.righe.length
  > 40000) return;`) **e un nastro VUOTO passava** (`let righe = testo ? 0
  : -1`: un testo senza comandi dà `righe === 0`, che non è `< 0`).
  **E IL TETTO NON È LONTANO**: il registro scrive **una riga per dito per
  fotogramma** — misurato 1,00 / 3,01 / 6,01 / 10,02 con uno, tre, sei,
  dieci dita — quindi arriva a 663 s con un dito ma a **111 s con sei** e
  67 s con dieci, cioè DENTRO una sfida che va al golden goal. **CURA**:
  riga di **tipo 9**, tre caratteri, scritta una volta sola, e due rifiuti
  in più in `Sfida.guarda` con la causa VERA. Il tetto resta a 40.000: è
  una guardia contro un ciclo, non una taratura (fuori perimetro,
  dichiarato). **MISURATO**: il cancello raggiunge il tetto **con le
  dita** su una sfida vera, dieci dita, in 7.295 passi — **40.002 comandi
  sul gioco CURATO** (il tetto più la riga di marchio di tipo 9), contro
  **40.001 sul gioco di PRIMA** (`main`, senza marchio: la differenza è
  esattamente la riga aggiunta dalla cura). Prima: nessun marchio, troncato
  rigiocato **0-3 contro 1-3**; nastro vuoto accettato, rigiocato **0-4
  contro 3-0**, e il gioco spiegava «La squadra di chi ti ha attaccato è
  cambiata da allora» — l'innocente accusato, testualmente.
  **CORREZIONE DI REVISIONE (21 settembre 2026)**: il verbale originale
  attribuiva 40.001 al gioco CURATO; la cifra vera del curato, MISURATA di
  nuovo con `strumenti/_q-nastro-tronco.js` (`_t-nastro-tronco.js` prima
  della promozione a cancello di qualità, stessa data), è **40.002** — 40.001 è il
  numero che esce sul gioco di PRIMA (`main`, `git show main:CALCETTO-il-gioco.html`),
  non sul curato. Il verdetto dei cinque controlli non cambia.

  **(e) IL CASO DELL'AUDIO ERA IL CASO DELLA PARTITA.** `Audio5.init` →
  `startCrowd` → `noiseBuf` riempiva **un secondo di campionamento** con
  `dado()`, cioè col generatore SEMINATO. **MISURATO**
  (`strumenti/_sonda-132-rumore.js`): il primo `Audio5.unlock()` di una
  pagina costa **48.000 sorteggi** a 48 kHz — e la frequenza la decide
  l'APPARECCHIO (44.100 o 48.000), quindi due telefoni che sbloccano nello
  stesso istante consumano quantità DIVERSE. **Canale LATENTE e non
  misurato sul campo**, e va detto per non gonfiare il difetto: nel gioco
  spedito lo sblocco arriva da un bottone di menu o dal tocco sulla
  copertina, cioè prima che `SEME.accendi` riazzeri il flusso. Ma un
  canale latente in una modalità che TOGLIE PUNTI non si lascia aperto per
  un byte. **CURA**: `Math.random()` — correzione di categoria, il rumore
  bianco è audio.

  **I CINQUE FALSI, E LA PROVA CHE I BANCHI LI BOCCIANO** (la revisione
  del #131 aveva bocciato una prova che passava sia col gioco giusto sia
  col falso: qui ogni cura ha il suo mutante e ogni mutante esce 1).
  `_crit-ment-muta.js` — il tipo 8 si scrive, si serializza, si
  deserializza, e `Reg.esegui` non ha il ramo: **A verde, B e C rosse**.
  `_crit-car-nome.js` — l'indice è nel nastro ed è LETTO in `carDif`, e non
  si passa a `startMatch`: **A e D verdi, B e C rosse** (1-6 contro 1-2).
  `_crit-rosa-meta.js` — la mezza cura che verrebbe in mente per prima (la
  regola unica c'è, il nastro e `startMatch` la usano, la sorgente resta
  spalancata): **4 prove su 4 rosse**. `_crit-tronco-muto.js` — il marchio
  c'è e nessuno lo guarda: **A verde, B rossa**. Più il mutante del #131,
  `_q-duello-impronta.js`, **44 su 44 a ogni compito**, mai mosso di un
  numero.

  **UN ROSSO DEL BANCO, PAGATO E SCRITTO**: il primo giro di
  `_q-rosa-scala.js` (`_t-rosa-scala.js` prima della promozione a cancello
  di qualità, 21 settembre 2026) iniettava il numero storto in memoria DOPO l'avvio,
  cioè saltava proprio la porta in esame — il campo restava a 250 anche a
  cura applicata, e il banco stava misurando la propria iniezione. Adesso
  il salvataggio si sporca e la pagina si RICARICA, che è la strada vera
  di un salvataggio manomesso.

  **UN ROSSO DELLA BATTERIA, DIAGNOSTICATO INVECE CHE SUPPOSTO**: `audio`
  è uscito 3 (prova nulla) a due compiti, 0 a uno e **1 (rosso)** al
  compito 3, su versioni diverse del gioco. Misurato con `--ripetuto 3`
  **da solo**: 28/28 su tutte e tre le corse sia sul gioco curato sia su
  quello di `main`. È un cancello che misura audio in tempo reale e soffre
  la macchina carica — dal compito 4 in poi gira in un gruppo tutto suo, e
  la batteria chiude **42 su 42**.

  **MOTORE_V RESTA 2, MISURATO** (`strumenti/_t-132-motorev.js`, due
  versioni, il modo di casa): 30 nastri registrati sul gioco di prima (`main` `3deb807`) e rigiocati sul curato, taglia 5, 3600 passi, semi da 20260801, **30 su 30 identici** — impronta campione per campione, punteggio finale e conto dei sorteggi; zero nulli, uno dei trenta passato dal dischetto. La misura è scritta accanto al numero nel sorgente. Le cinque cure sono
  additive — due tipi di riga nuovi (8 e 9) che un nastro vecchio non ha,
  un campo in CODA al tipo 7 che un nastro vecchio non ha, una scala che
  su un salvataggio sano è l'identità, e un rumore che nel gioco spedito
  non toccava comunque il flusso seminato.

  **FUORI PERIMETRO, dichiarato**: costruire il GIUDICE vero (è il
  cantiere dopo, e questo gli toglie di mezzo i falsi positivi); alzare il
  tetto delle 40.000 righe; validare il NOME di un uomo di rosa al
  caricamento; la rosa che il server rilegge viva invece di conservarne
  una copia; il tasto registrato e morto fuori dal duello (#131); il
  determinismo pieno a 7/11 (#98/#129).

- **Il duello entra nel nastro — #131 CANTIERE CHIUSO** (voce #131, 21
  settembre 2026, sette compiti dal merge-base `7fbe9bf` — dossier
  `docs/superpowers/specs/2026-09-21-duello-nastro-dossier.md`, spec
  `…-duello-nastro-design.md`, piano
  `docs/superpowers/plans/2026-09-21-duello-nastro.md`). È il **P0
  dell'onda D**: il #130 ha aggiustato il metro del giudice, questo gli dà
  qualcosa da misurare.

  **CORREZIONI DI REVISIONE (21 settembre 2026, voce #131), applicate in
  un commit a parte dopo il «Ready to merge: YES» col rilievo IMPORTANTE
  e i tre MINORE. Cantiere di BANCO/DOCUMENTI: il gioco NON è stato
  toccato.**
  (1) **IMPORTANTE — la prova D era VUOTA.**
  `strumenti/_t-duello-contatore.js` leggeva `Duel.nDuello` dopo
  `Reg.accendi()` su una pagina che non aveva mai giocato un duello, dove
  il contatore vale già zero per conto suo: l'asserzione `=== 0` passava
  con o senza l'azzeramento vero. **MISURATO dal revisore**: un gioco
  identico privato della sola riga `Duel.nDuello = 0` dentro
  `Reg.azzeraComandi` (`CALCETTO-il-gioco.html:13406`) superava comunque
  l'intera batteria del duello. **CURA**: il contatore si sporca a un
  valore non nullo (3) PRIMA di ciascun azzeramento e si legge SUBITO
  DOPO, sia per `Reg.accendi()` sia per `Reg.deserializza()` (prova nuova,
  D bis). **VERIFICATO col mutante dedicato**
  (`strumenti/_crit-duello-contatore.js`, che toglie `Duel.nDuello = 0` da
  `azzeraComandi`): la prova corretta è **ROSSA sul falso** (7 prove su 9,
  D e D bis entrambe NO, `nDuello` resta 3) e **VERDE sul gioco vero** (9
  prove su 9, `nDuello` torna 0 in entrambi i casi).
  (2) **MINORE — un'affermazione superata, rettificata a edizioni.**
  `strumenti/_q-fuzzer.js` e `strumenti/tutti.js` dicevano ancora che il
  duello «si LOGGA A PARTE … Reg non lo cattura». Dopo il #131 **Reg lo
  cattura**: il `logDuelli` riapplicato a mano nel fuzzer è ormai
  neutralizzato dalla guardia di rilettura del gioco (`Reg.modo===2 &&
  !Reg.dentro && !daMotore`, `CALCETTO-il-gioco.html:43898`) — peso morto
  senza doppio effetto, il cancello resta verde. Corretto in chiaro nei
  due file, col testo vecchio lasciato accanto e non cancellato.
  (3) **MINORE — due banchi non coprivano la quantizzazione della mira, e
  non lo dichiaravano.** `_t-duello-nastro.js` e `_t-duello-rigioca.js`
  portano il COPIONE già a tre decimali su u,v: la quantizzazione a un
  millesimo del compito 3 (`duelMira`) vi è invisibile — la copre
  `_t-duello-tacca.js` (3/4). Dichiarato ora in testata a entrambi, sul
  modello di `_t-duello-impronta.js` (oggi `_q-duello-impronta.js`, vedi
  punto 4) che già lo faceva.
  (4) **MINORE — la rete di sicurezza non era in batteria.** Nessun
  `_t-duello-*` era registrato in `strumenti/tutti.js`, mentre il
  commento accanto a `MOTORE_V` nel gioco promette «si rimisura con
  quello strumento il giorno che qualcuno tocchi di nuovo il duello» —
  un'istruzione a memoria senza cancello dietro, proprio mentre l'onda D
  sta per rientrare nel duello col GIUDICE (voce #133). **CURA**:
  `strumenti/_t-duello-impronta.js` promosso a cancello di qualità,
  rinominato (`git mv`) `strumenti/_q-duello-impronta.js` e registrato in
  `tutti.js` (`conta:true`, `lento:false`: misurato 3,1 s). Tutti i
  riferimenti al vecchio nome aggiornati (`strumenti/`, questo manuale,
  `PUNTO-DEL-LAVORO.md`, `docs/superpowers/`). Il file congelato
  `strumenti/duello-impronta.json` **non è stato toccato**
  (`git diff` vuoto). **`_t-duello-rigioca.js` NON è stato promosso,
  scelta dichiarata**: è più un attrezzo di compito (`_t-*`) che un
  cancello generale — costruisce due mutanti via sottoprocesso
  (`_crit-duello-scarto.js`/`_crit-duello-passo.js`) a OGNI corsa, quindi
  un giorno un'ancora di testo spostata per un motivo qualunque lo
  farebbe ESPLODERE (uscita 2) invece di dare un rosso vero; costa 23 s
  contro i 3,1 s dell'impronta; e la fedeltà di registrazione/riproduzione
  che dimostra è già coperta in permanenza dall'impronta promossa, a un
  ottavo del costo. La sua prova C (i due mutanti, con la rettifica al
  dossier sul mutante uniforme) resta preziosa ma puntuale: si rilancia a
  mano quando il motore del duello cambia ancora, non ad ogni commit
  qualunque nel gioco.
  **BANCHI RIESEGUITI**: `_t-duello-contatore.js` 9/9,
  `_q-duello-impronta.js` **44/44 — impronta non mossa di un numero**,
  `_t-duello-nastro.js` 5/5, `_t-duello-rigioca.js` 7/7,
  `_t-duello-tacca.js` 4/4, `_t-duello-porte.js` 8/8, `_q-fuzzer.js`
  **14/14** (rimisurato due volte, stesso esito: il conteggio delle prove
  del fuzzer non è lo stesso 15/15 registrato altrove in questo manuale —
  differenza pre-esistente alla correzione di revisione, non toccata qui,
  la modifica al fuzzer è stata solo nel commento). Batteria intera
  rilanciata a gruppi, tutti i cancelli che contano verdi.
  `git diff main -- CALCETTO-il-gioco.html` **IDENTICO** a prima di
  questa correzione: il gioco non è stato toccato.

  **IL DIFETTO, in tre buchi.** I pointer del duello erano appesi a
  `#duel` e a `#powerWrap` e non passavano dalle quattro porte avvolte del
  registratore; la tastiera veniva registrata (tipo 4) ma `Reg.esegui` non
  ridispacciava il gestore. Restavano due ripieghi onesti: il marchio di
  tipo 5 («io sono incompleto») e `fermaReplayAlDischetto`. **Frequenza
  misurata** (dossier): fra il **43%** (umano fermo) e il **100%** (dita
  vere) delle sfide entra in almeno un duello, e in modalità un giocatore
  **ogni duello ha un umano dentro, 169 su 169**. Il giudice differito non
  avrebbe potuto verificare proprio le partite decise dal dischetto — e
  chi voleva barare aveva una via deterministica e a costo zero.

  **L'OROLOGIO È IL CONTATORE DI `Duel.update`, NON I MILLISECONDI**, e
  adesso è un cancello e non solo un'affermazione: giocando due secondi
  `Reg.tick` arriva a 120, poi attraversa **18 rigori e 3.919
  aggiornamenti restando UN SOLO valore** (in `freekick` il giro chiama
  `Duel.update` e non `step()`, e `Reg.passo()` gira solo dentro
  `step()`). I millisecondi non servirebbero: nel corpo del duello non c'è
  un solo `performance.now`, e `frame()` butta tempo quando il telefono
  arranca. `Duel` guadagna tre contatori (`nDuello`, `passo`,
  `dentroUpdate`) e `Reg` guadagna `passoDuello()`, il fratello minore di
  `passo()`.

  **IL FORMATO** è il tipo 6, `[tick, 6, ms, nDuello, passo, verbo, a, b,
  c]`, a lunghezza variabile come il tipo 7; il `tick` è congelato e i
  millisecondi sono **dichiarati non letti**. Ad ancorare è la coppia
  `(nDuello, passo)`.

  **IL CUORE È UNA DISUGUAGLIANZA STRETTA.** `Duel.passo` conta gli
  aggiornamenti già compiuti; dal vivo il dito cade FRA due aggiornamenti,
  quindi un tocco arrivato fra il k-esimo e il (k+1)-esimo legge un
  cursore avanzato k volte. In rilettura quel comando va rimesso in scena
  all'INIZIO del (k+1)-esimo: la guardia è `riga.passo < Duel.passo`, non
  `<=`.

  **LE DUE TRAPPOLE, entrambe misurate.** (a) `Duel.update` chiama da sé
  tutte e tre le porte, e il ripiego del portiere a `cpuT=3,0` **gira
  anche col portiere umano**: senza `dentroUpdate`, in rilettura
  `keeperZone` si fisserebbe per primo, il `dado()` del ripiego non si
  consumerebbe e tutti i sorteggi successivi slitterebbero di uno. Il
  banco costruisce apposta il caso peggiore (portiere umano che non tocca
  mai) e verifica che il motore abbia davvero tuffato per lui e che nel
  nastro non ci sia un solo verbo 2. (b) `duelMira` dipende da VW/VH e
  dalle altezze DOM: **lo stesso pixel dello schermo dà mire diverse su
  915×412 e 782×299 in 117 dita su 117, con scarto fino a 0,7810 su `u`**
  — nel nastro entra la mira, non il pixel. E la mira si posa su una tacca
  intera (un millesimo, alla sorgente, in tutte e tre le modalità, come il
  pixel intero del dito): prima della cura **234 mire su 234 non
  sopravvivevano al giro nel nastro**.

  **IL RIPIEGO NON È CANCELLATO, È RIARMATO.**
  `fermaReplayAlDischetto` resta: cambia la condizione, da «c'è un duello
  con un umano» (sempre vera) a «il nastro non ha righe per questo
  `nDuello`». Misurato su un nastro troncato a mano: tolte le righe del
  duello 3, `Reg.righeDuello(3)` risponde `false`, il gioco risolve 2
  duelli su 3 e **non inventa il terzo**; e su un nastro intero risponde
  `true` per 3 duelli su 3 con un umano dentro (senza questa metà, un
  «no» non proverebbe niente). Il troncamento si fa su un duello col
  **tiratore** umano, non uno qualunque: togliere le righe di un duello in
  cui l'umano era solo il portiere non lo blocca affatto, perché il motore
  ha il ripiego a tre secondi — correzione di una prova che sarebbe
  passata per il motivo sbagliato.

  **LA RETE DI SICUREZZA, congelata prima di toccare qualunque cosa.**
  `strumenti/_q-duello-impronta.js` misura il duello nudo a seme fisso —
  44 duelli su tre semi, in due regimi (CPU contro CPU e umano a copione
  deterministico) — e ne congela esito, cursore a cinque decimali,
  `powerQ`, terzi, passo e sorteggi
  (`strumenti/duello-impronta.json`). Verificata ripetibile (due giri
  identici) e **non vuota** (un mutante che ritarda il cursore di un
  aggiornamento la fa arrossire). **Rimisurata a ogni compito: non si è
  mossa di un numero, 44 su 44, sette volte.**

  **LA RETTIFICA AL DOSSIER, misurata (21 settembre 2026).** Il dossier
  dava per letale il mutante «gancio spostato di un fotogramma»
  (`_crit-duello-passo.js`). **NON lo è**: su tre semi e otto duelli la
  partita rigiocata sul mutante è identica a quella registrata sul
  mutante, cursore alla quinta cifra. E non è un buco del banco, è una
  proprietà vera del duello: **`pickZone` azzera il cursore**, quindi il
  cursore che `stopPower` legge dipende solo dall'INTERVALLO fra i due
  comandi, e uno spostamento uniforme lo conserva (15 aggiornamenti prima,
  15 dopo, 0,2875 in entrambi i casi). Il falso che il dossier aveva
  davvero misurato — «spostare `stopPower` di 1 aggiornamento cambia 6/132
  esiti» — sposta UN verbo solo, e l'intervallo cambia: vive in
  `strumenti/_crit-duello-scarto.js` ed è **bocciato su 3 semi su 3**
  (cursore 0,2875 contro 0,30667, `powerQ` 0,00774 contro 0,05758). Il
  mutante uniforme resta come guardia della misura: il banco verifica a
  ogni corsa che il suo nastro differisca da quello sano, se no «il gioco
  lo sopravvive» diventerebbe vero per il motivo sbagliato.

  **IL CANCELLO ROSSO PAGATO, e il confine fra i compiti che ne è uscito.**
  La prima stesura del compito 4 metteva insieme alla scrittura anche la
  guardia «in rilettura le dita vere sono ignorate». `_q-fuzzer.js` è
  diventato rosso sulla riproduzione: riapplica il suo `log-duelli` a
  mano, a registro in rilettura, e la guardia gliela sbarrava. Misurato
  sul commit precedente (`6e84885`): lì era verde 14/14 — quindi la mia
  toppa, non un difetto pre-esistente. La cura non è allargare la guardia
  ma **spostarla**: il compito 4 scrive soltanto, la guardia arriva col
  compito 5 insieme alla rilettura vera. E al compito 5 **il fuzzer è
  tornato verde da solo**, come previsto: la guardia che gli sbarrava il
  log è arrivata insieme al nastro che quei comandi li porta — una
  conferma indipendente della rilettura, da un banco che non sa niente di
  questo cantiere.

  **`MOTORE_V` RESTA 2, E NON PERCHÉ SEMBRAVA GIUSTO.** La catena
  (ogni sfida è a un giocatore → ogni duello ha un umano, 169/169 → il
  marchio di tipo 5 scattava sempre → `Sfida.guarda` li rifiuta → i nastri
  vecchi accettati sono esattamente quelli SENZA duello) finisce in
  un'inferenza, e un'inferenza non basta per una costante che decide quali
  partite si rifiutano. **MISURATO** (`strumenti/_t-duello-motorev.js`,
  due versioni): **30 nastri senza duello su 30** registrati sul gioco di
  prima (`main` `7fbe9bf`) e rigiocati sul curato danno la stessa partita
  — impronta campione per campione, punteggio e conto dei sorteggi. Zero
  semi scartati, zero dichiarati nulli dal controllo (ogni nastro è stato
  rigiocato anche sul gioco di PRIMA: se non fosse tornato lì, quel seme
  non avrebbe potuto dire niente). La misura è scritta **accanto al
  numero** nel sorgente. Il controllo `incompleto` di `Sfida.guarda` è
  **conservato** — rettificato a edizioni: non riguarda più i nastri di
  oggi, resta necessario per quelli di prima.

  **I CANCELLI.** `_t-duello-nastro.js` rosso 1/4 al compito 1 → **verde
  5/5** al compito 5, e condanna il mutante letale (uscita 1, cursore
  0,2875 → 0,30667). `_t-duello-contatore.js` 9/9 (col confronto a due
  versioni: stessi 159 sorteggi, stesso tick 120, stesso 1-0, stessi 18
  esiti). `_t-duello-tacca.js` 3/4 → **4/4**. `_t-duello-porte.js` 5/8 →
  **8/8**. `_t-duello-rigioca.js` 2/4 → **7/7** (8 duelli su tre semi
  identici campo per campo). `_t-duello-motorev.js` 30/30.
  **Batteria intera rilanciata a ogni compito**, a tre o quattro gruppi
  (`--tutto` chiede ~12 minuti): tutti i cancelli che contano verdi;
  `avvio-telefono` uscita 3 (nessun telefono collegato, non un rosso del
  gioco) e `istantanea` informativo NO contro un riferimento che era una
  prova nulla — lo stesso schema già dichiarato da
  #113/#114/#122/#125/#128/#129/#130.

  **`git diff main -- CALCETTO-il-gioco.html`**: `Duel` (tre campi),
  `Reg` (due campi, `accendi`, `azzeraComandi`, `passoDuello`,
  `eseguiDuello`, `righeDuello`, `serializza`, `deserializza`),
  `duelMira`, `startFreeKick`, `fermaReplayAlDischetto` (messaggio e
  verbale), il blocco avvolgente nuovo accanto alle quattro porte di
  `Touch5`, e due commenti (`MOTORE_V`, il controllo `incompleto`).
  Nessun corpo di `Duel.update`, `resolve`, `pickZone`, `stopPower` o
  `pickKeeper` toccato: l'avvolgimento sta fuori.

  **RESTA FUORI, dichiarato.** Il terzo buco, **la tastiera**: le tre
  porte avvolte lo coprono per il duello (`Duel.key` chiama le tre
  funzioni, che ora sono avvolte), ma il tasto in sé resta registrato e
  morto per tutto il resto del gioco — è un difetto del tipo 4, non del
  duello. E il **pointermove del mirino** non entra nel nastro: non decide
  niente, entra il punto di rilascio; chi guarderà il replay vedrà il
  mirino comparire dove il dito l'ha lasciato invece di seguirlo.

- **Il metro prima del giudice — #130 CANTIERE CHIUSO** (voce #130, 21
  settembre 2026, quattro compiti dal merge-base `d08a1e5` — spec
  `docs/superpowers/specs/2026-09-21-il-metro-design.md`, piano
  `docs/superpowers/plans/2026-09-21-il-metro.md`). Cantiere di
  BANCO/documenti: `git diff main -- CALCETTO-il-gioco.html` **VUOTO**
  per l'intero cantiere.

  **IL PERCHÉ.** Prima dell'onda D (competizione — `_analisi/
  MAPPA-MANDATO.md` riga 763, il verificatore differito delle sfide) serve
  un GIUDICE che rigioca il nastro di una sfida e ne confermi il
  punteggio. Due difetti del METRO con cui misurerà, trovati e curati
  prima di costruirlo:

  1. **Il tetto INV-15 era ancorato a taglia 5 ma applicato a ogni
     taglia.** `TETTO_FOTOGRAMMI=18000` (voce #127) è la somma di due
     componenti misurate SOLO a taglia 5: pre-rigori (12000) + oltranza
     teorica (18×328=5904). A taglia 11 `durataPartita()`
     (`CALCETTO-il-gioco.html:4105-4123`, `round(MATCH_SEC*FW/1150)`) vale
     già **180s** (FW=2300) invece di 90s (FW=1150): un rigore a oltranza
     legittimo arriva molto più vicino al tetto tarato per un'altra
     taglia, e lo sfonda.
  2. **`_q-determinismo.js` non era registrato in `strumenti/tutti.js`.**
     È la prova di INV-01 (il gioco è deterministico dato il seme) — il
     FONDAMENTO della verificabilità di una sfida — e la batteria non la
     sorvegliava.

  **LA RETTIFICA (compito 1, misurata con `fuori/_misura-seme-20260924.js`,
  non committato — convenzione di casa per le sonde usa-e-getta, come
  `fuori/_misura-oltranza.js`/`fuori/_misura-pre-rigori.js` del #127).**
  Il verbale #129 dichiarava «seme 20260924 a taglia 11 bloccato in
  `freekick`, pre-esistente, difetto di gioco». **FALSO, misurato di
  nuovo**: stesso seme, stessa taglia, ordine giusto, NESSUN tetto (limite
  locale 40.000 fotogrammi) — la partita raggiunge `'end'` al fotogramma
  **19.502 (325,0s) con punteggio 2-1**, passando per una serie a rigori
  (`G.rigori===true`). Non è bloccata. Il rosso era il tetto flat
  applicato a una taglia dove la partita di regolamento dura già 180s, non
  un difetto del gioco. La misura del #129 (fotogramma/stato letti allora)
  era vera; l'inferenza («difetto di gioco», «pre-esistente») era
  sbagliata sopra una misura vera. Rettificato a edizioni sia qui (dentro
  la voce #129, sotto) sia in `PUNTO-DEL-LAVORO.md` (riga 11).

  **LA CURA (compito 1): `tettoFotogrammi(taglia)`** in
  `strumenti/_q-invarianti.js`, al posto della costante unica. Ogni
  numero MISURATO, non stimato per proporzione (un tentativo di scalare
  linearmente col rapporto delle durate di regolamento è stato scartato:
  il rapporto durata-orologio/fotogrammi-reali misurato NON è costante fra
  le taglie sui campioni raccolti — 1,538 a 5, 1,230 a 7, 1,298 a 11 —
  probabile effetto di taglia-campione, non una legge fisica affidabile):
    - **taglia 5**: **18000** (300s), INVARIATA — il numero storico del
      #127 (campione 427 partite, margine ~10,6%). Nessun banco a taglia 5
      cambia numero.
    - **taglia 7**: **21000** (350s) — MISURATO (`fuori/
      _misura-preRigori.js --taglia 7 --n 100 --semeBase 20260921 --tetto
      25000`): massimo fotogramma di decisione (rigori innescati o `'end'`
      diretto) **12252** su 100 partite (13 arrivate ai rigori, 0
      incomplete). Margine +20% (più prudente del 10,6% storico: campione
      100 contro 427) → 14702, + oltranza teorica 5904 = 20606,
      arrotondato a 21000.
    - **taglia 11**: **27000** (450s) — MISURATO (stesso attrezzo,
      `--taglia 11 --n 150 --tetto 35000`): massimo **17136** su 150
      partite (23 ai rigori, 0 incomplete). Margine +20% → 20563, +
      oltranza teorica 5904 = 26467, arrotondato a 27000. Copre il seme
      20260924 (19502) con margine comodo.
  **L'oltranza è taglia-indipendente — VERIFICATO, non solo ragionato**:
  il codice del `Duel` (fase power, `~22479-22497`) avanza il cursore con
  `dt*1,15` e decide con `dado()`, nessuno dei due legge FW/taglia.
  Confermato con `fuori/_misura-oltranza.js` (t.rigori() forzato
  ripetuto): massimo per-un-solo-tiro **276/948 tiri** a taglia 5,
  **277/2882 tiri** a taglia 11 — stesso ordine di grandezza del
  **328/46.776** storico di taglia 5 (#127, campione molto più grande, che
  resta la base del teorico 18×328=5904 per ogni taglia).

  **IL TEST-CONDANNA** (`strumenti/_t-metro-taglia.js`, mandato §13.3):
  gioca il seme 20260924 a taglia 11 e confronta la durata osservata sia
  contro il tetto flat storico (sempre sforato, per costruzione) sia
  contro `tettoFotogrammi(11)`. **PRIMA della cura**: rosso strutturale
  (`tettoFotogrammi` non esiste ancora — `2 prove su 3`, eseguito e
  verificato rosso PRIMA di scrivere la funzione). **DOPO**: verde
  (`3 prove su 3`, `19502 <= 27000`). `_q-soak.js` e `_q-cpu-ordine.js`
  aggiornati a usare `tettoFotogrammi(TAGLIA_BANCO)` (altrimenti
  riprodurrebbero lo stesso falso positivo a `--taglia 11`): verificato,
  `_q-soak.js --taglia 11 --partite 40` **10/10** (prima: falso positivo
  sicuro, max osservato 20.526/27.000, 76,0% del tetto). **L'hang vero
  resta colto**: `_q-soak.js --bugiardo durata` **ROSSO** sia a taglia 5
  (max 18000/18000, 100%) sia a taglia 11 (max 27000/27000, 100%, 14/20
  semi incastrati in `'freekick'`) — un tetto più largo non nasconde
  l'artefatto #108, verificato e non solo attestato.

  **IL METRO ENTRA IN BATTERIA (compito 2).** `determinismo` non era mai
  stato registrato in `strumenti/tutti.js` nonostante provi INV-01.
  MISURATO qui: dopo la cura #129 della #98 il banco è **10/10 anche a
  taglia 7 e 11** (contro l'8/10 di prima della #129) — nessuna ragione
  per restare a taglia 5 sola. **Due voci**, non una (registrarne una sola
  a taglia 5 avrebbe ricreato dentro il cancello proprio il buco che
  questo cantiere doveva chiudere): `determinismo` (default, taglia 5,
  ~16-68s a seconda della contesa del banco) e `determinismo-11`
  (`--taglia 11`, ~60-122s, `lento:true`, misurato molto più lento —
  partite doppie e quattro corse per pagina). `_q-rete.js` (**22/22**) e
  `_q-sfida.js` (**54/54**) entrano anch'essi: verificato leggendo il
  codice che entrambi aprono un server finto IN MEMORIA sulla stessa
  macchina (`http.createServer` locale, mai una richiesta a Internet) —
  nessun conflitto con `senza-rete.js`, che verifica una domanda diversa
  (il gioco non chiama nessuno in condizioni normali).

  **LE RETTIFICHE #98 A EDIZIONI (compito 3).** Cercato con `grep -rn
  "#98" strumenti/*.js`: sette file (`_q-soak.js`, `_q-determinismo.js`,
  `_q-invarianti.js`, `_q-umore.js`, `strumenti/tutti.js`) portavano
  ancora commenti che dichiaravano la #98 (determinismo instabile a 7/11)
  come stato ATTUALE, mentre è CHIUSA dalla voce #129 dal 20 settembre.
  Corretti a edizioni (annotato «CHIUSA dal #129», testo vecchio non
  cancellato), senza cambiare il PERIMETRO di nessun banco (le taglie di
  default restano quelle di sempre — un cambio di default sarebbe un
  cantiere a parte). Verificato di persona che `_q-soak.js` è oggi
  bit-ripetibile anche a taglia 11 (due corse `--taglia 11 --semeBase
  20260920 --partite 10`, stessa impronta `d4e5dc74`): l'ancoraggio a
  taglia 5 del cancello di batteria resta, ma per una ragione diversa
  (le BANDE statistiche sono tarate sulla rosa/campo di taglia 5), non più
  per il determinismo. `CLAUDE.md` porta anch'esso un riferimento alla
  #98 come "seguito aperto" (righe 61-62): NON toccato per mandato
  esplicito del committente su questo file, dichiarato qui a registro
  invece di corretto in silenzio.

  **BATTERIA INTERA RILANCIATA A GRUPPI** (lezione 22; una corsa sola
  avrebbe ecceduto il tempo dell'agente, ~12 minuti a `--tutto`): tre
  gruppi via `--solo`, **45 esecuzioni-cancello, TUTTI quelli che contano
  VERDI**. Gruppo 1 (15 cancelli statici/veloci): **15/15 verde**, 267s di
  orologio. Gruppo 2 (contenuti, MIND, regole, invarianti, fuzzer): **17/17
  verde**, 109s. Gruppo 3 (soak, determinismo×2, rete, sfida, tocco, audio,
  istantanea, volti, i quattro cronometrici): tutti i cancelli che contano
  **verdi** (soak, determinismo, determinismo-11, rete, sfida, tocco,
  volti, giocata, prestazione tutti OK); `audio` e `avvio-telefono` escono
  **3 (prova nulla)** — nessun contesto audio reale e nessun telefono
  collegato in questo banco, DICHIARATO dai cancelli stessi, non un rosso
  del gioco (regola di casa: un 3 non accusa il gioco); `istantanea`
  (informativo, `conta:false`) **45/56**, stesso schema di rumore già
  dichiarato dalle voci #113/#114/#122/#125/#128/#129 contro un registro
  del 20 agosto ormai lontano. **Nessun cancello che conta è rosso.**

  **Definizione di fatto**: il tetto INV-15 è una funzione della taglia,
  misurata e non stimata, con l'hang vero ancora colto; INV-01
  (determinismo) e la modalità SFIDA sono ora sorvegliate in batteria; la
  diagnosi falsa del #129 sul seme 20260924 è rettificata a edizioni; il
  gioco non è stato toccato. Il metro è pronto per il giudice dell'onda D.

- **La cosmetica fuori dal PRNG di gioco — #129 CANTIERE CHIUSO, E LA VOCE
  #98 SI CHIUDE** (#129, seguito tecnico dell'onda C, 20 settembre 2026, due
  compiti dal merge-base `81bb961` — spec
  `docs/superpowers/specs/2026-09-20-rebuildcrowd-prng-design.md`, piano
  `docs/superpowers/plans/2026-09-20-rebuildcrowd-prng.md`).

  **RETTIFICA A EDIZIONI DELLA DIAGNOSI #128.** Il #128 aveva isolato la
  causa della #98 (determinismo instabile a 7/11) in `rebuildCrowd`, che
  consuma `dado()` in proporzione al perimetro del campo. Il compito 1 di
  qui ha MISURATO che la diagnosi era imprecisa su due punti, e li
  corregge in chiaro senza cancellare il testo vecchio (vedi la voce #128
  qui sotto, lasciata intatta):
  1. **La funzione isolata era MINORITARIA.** Misurato `SEME.n` a taglia
     11, stessa pagina, due partite: la prima (la taglia cambia) **114.093**
     sorteggi, la seconda (la guardia di `setTaglia` la salta) **67**.
     `rebuildCrowd` da sola vale solo **~8.920** di quei 114.093 (**8%**).
     Il consumatore DOMINANTE (**~92%**) è `resize()` → `buildFieldTex()`
     → `paintField(vivo=true)` (`:27502`, il pennello del campo: grana del
     piazzale, gradinate/pubblico, erba, insegne), chiamato da `setTaglia`
     PRIMA di `rebuildCrowd`. Un salva/ripristina scoperto SOLO su
     `rebuildCrowd` (la prima cura tentata in questo stesso cantiere, prima
     stesura) lasciava fuori il 92% del problema — misurato: `_q-determinismo
     --taglia 11` restava **8/10**, identico al non curato, bit per bit
     sullo stesso seme e sullo stesso campione di scarto.
  2. **C'erano DUE CANALI, non uno.** `_q-determinismo.js` (prove A/B/C)
     semina `Math.random` GLOBALE (`window.__caso`, iniettato via
     `addInitScript` PRIMA che la pagina esegua una riga), **non** `SEME`:
     `dado()` a `SEME.on===false` fa `return Math.random()` e non tocca mai
     `SEME.s`/`SEME.n`. Un salva/ripristina di `SEME` (qualunque sia il suo
     perimetro) è quindi un no-op PROVATO per quel canale — solo la prova D
     (che semina davvero via `t.semina`→`SEME.accendi`) ne sarebbe stata
     curata, e passava già prima per una ragione strutturale (confronta
     sempre due pagine fresche, quindi paga lo stesso costo su entrambi i
     lati, simmetricamente).

  **LA CURA DECISA DAL COMMITTENTE: OPZIONE 2, PRNG DEDICATO PER LA
  COSMETICA.** Vicino a `SEME`/`dado`/`rnd` (`:8593-8608`) un generatore
  SEPARATO, `DECO` (xorshift32 con stato tutto suo, `dadoDeco`/`rndDeco`),
  che non legge né scrive né `SEME` né `Math.random`. `paintField` e
  `rebuildCrowd` lo RISEMINANO con una costante fissa al proprio ingresso
  (`0x9E3779B9` e `0x85EBCA6B`) e convertono OGNI `dado()`/`rnd()` interno
  a `dadoDeco()`/`rndDeco()` — inclusa `buildGrain` (chiamata da
  `paintField` per la grana cotta una volta sola). **`buildGrain` NON
  riseminta, ed è memoizzata** (`if(grainTex) return`, `:29642-29650`):
  la sua grana eredita lo stato di `DECO` lasciato dalla prima
  `paintField` che gira, quindi dipende da quale tema/taglia è stato
  dipinto per primo — innocuo per il PRNG di GIOCO (è `DECO`, non `SEME`
  né `Math.random`), ma è la sola cosmetica che NON è funzione dei soli
  parametri. Rilievo MINORE della revisione finale, dichiarato qui invece
  che curato: aggiungere il reseed vorrebbe dire toccare il gioco a
  batteria già verde. **Seconda nota della revisione**: col reseed fisso
  ogni `paintField` (ogni tema, ogni anteprima, ogni taglia) parte dalla
  STESSA sequenza, dove prima ognuna proseguiva lo stream condiviso — la
  grana e le gradinate condividono ora lo stesso schema relativo. È
  dentro il costo accettato dell'opzione 2, ma va detto per intero: non
  solo «l'aspetto cambia», anche «lo schema è condiviso». La `dado()` buttata,
  storica di `rebuildCrowd` (voce ~#100, serviva a tenere ferma la
  sequenza quando la folla condivideva il PRNG di gioco), è ELIMINATA: non
  serve più consumare-e-buttare quando il generatore è già separato. Il
  commento storico di `rebuildCrowd` resta in chiaro, con la rettifica
  accanto. `buildVignette` e `buildCrowdAtlas` verificati (grep): zero
  `dado()`/`rnd()`, nessuna conversione necessaria. `campoVivoDisegna` (lo
  zoom del gol) aveva già un trucco proprio (swap temporaneo di
  `Math.random`) per non consumare il caso della partita quando chiama
  `paintField`: con `paintField` spostata su `DECO` quel trucco diventa
  ridondante ma innocuo, lasciato — fuori perimetro, non è una `dado()` di
  caricamento rimasta scoperta.

  **MISURATO: ENTRAMBI I CANALI CURATI, 7/11 A 10/10.** `_q-determinismo`
  passa da **8/10 a 10/10** sia a taglia 7 sia a taglia 11 (10/10
  confermato anche a taglia 5, invariato) — il test-condanna nato rosso
  sulla base `81bb961` e diventato verde con la cura, sulle STESSE prove
  A/B che il canale `Math.random`-globale rendeva insensibili a qualsiasi
  cura su `SEME`. **Valore pratico**: due corse di `_q-soak --taglia 11
  --seme 20260920 --partite 12` danno la STESSA impronta (`fb5d47b1`):
  impronta stabile a taglia piena. **RETTIFICA (revisione finale del
  #129)**: la prima stesura aggiungeva qui «cosa che la #98 impediva
  strutturalmente» — AFFERMAZIONE FALSA, misurata dal revisore: anche la
  base `81bb961` è bit-ripetibile corsa-su-corsa (due corse, impronta
  `f5a869ab` entrambe). La misura era vera, l'inferenza no: la #98
  rompeva l'uguaglianza FRA partite e FRA pagine, non la ripetibilità
  dello stesso banco su due corse. **La prova della cura resta una sola**:
  `_q-determinismo` 8/10 → 10/10 a taglia 7 e 11.

  **NON-REGRESSIONE DI GIOCO A TAGLIA 5, BIT PER BIT** (l'avvertimento a
  `:8590`). `_eventi.js`, 30 partite CPU-CPU, seme 20260803: il campo
  `crudo` del JSON (le voci evento per evento di ogni partita) è
  **byte-per-byte IDENTICO** prima e dopo la cura — non solo le mediane
  (tutte a +0%), il dato grezzo per partita. A taglia 5 la guardia di
  `setTaglia` salta sia `rebuildCrowd` sia `resize()`/`buildFieldTex`
  fin dal boot del menu: la cosmetica non gira mai dentro `startMatch`,
  quindi nessuna `dado()` di GIOCO è stata toccata — è la prova che il
  perimetro della cura è quello dichiarato e non uno più largo.
  `_q-invarianti` **12/12**, `_q-fuzzer` **14/14** (include la sua prova
  di determinismo cross-partita a taglia 5, verde), `_q-soak` **17/17**
  (impronta `21f65940`, invariata), `collaudo.js` **36/36**, `_q-battute.js`
  **11/11**. Un fallimento incontrato in corsia (`_q-soak --taglia 11`,
  INV-15, seme 20260924 partita #4 bloccata in `freekick` a 18.000
  fotogrammi) è stato misurato anche sul gioco NON curato: stesso seme,
  stesso stato finale, stesso fotogramma — **PRE-ESISTENTE**, un difetto
  di gioco a taglia 11 scollegato dalla cosmetica, non indagato qui
  (fuori perimetro, a registro per chi riprenderà taglia 11 in volume).

  **RETTIFICA A EDIZIONI (21 settembre 2026, voce #130 "il metro prima
  del giudice", fonte `fuori/_misura-seme-20260924.js`).** L'affermazione
  qui sopra era FALSA, e il compito 1 del #130 l'ha misurata di nuovo:
  seme 20260924, taglia 11, stesso ordine giusto (`startMatch` poi
  `setCpuVsCpu`), **NESSUN tetto** (limite locale 40.000 fotogrammi, solo
  di sicurezza). La partita **NON resta bloccata**: raggiunge `'end'` al
  fotogramma **19.502 (325,0 s) con punteggio 2-1**, dopo essere passata
  per una serie a rigori (`G.rigori===true`). Il rosso incontrato dal
  #129 non era un difetto del gioco: era `TETTO_FOTOGRAMMI=18000`, tarato
  sul caso peggiore di **taglia 5** (partite di regolamento da 90s) e
  applicato tale e quale a taglia 11, dove `durataPartita()`
  (`CALCETTO-il-gioco.html:4105-4123`, `round(MATCH_SEC*FW/1150)`) vale
  già **180s** (FW=2300 contro FW=1150 a taglia 5) — un rigore a oltranza
  legittimo a quella taglia arriva molto più vicino al tetto tarato per
  un'altra taglia, e lo sfonda. La MISURA del #129 (fotogramma/stato
  letti allora, verosimilmente `'freekick'` di passaggio al taglio dei
  18.000) era vera; l'INFERENZA ("difetto di gioco", "pre-esistente")
  era sbagliata sopra una misura vera. Cura: `tettoFotogrammi(taglia)`
  (voce #130, compito 1, `strumenti/_q-invarianti.js`) — il tetto diventa
  funzione della taglia (18000/300s a 5, invariato; 21000/350s a 7;
  27000/450s a 11, misurati con lo stesso metodo del #127) invece di una
  costante unica applicata a ogni taglia. Il testo precedente resta sopra,
  non cancellato.

  **LA REGRESSIONE COSMETICA, DICHIARATA E VOLUTA.** La texture del campo
  e il layout della folla CAMBIANO aspetto (partono da un seme diverso):
  `istantanea.js` (non contato in batteria, `conta:false` in `tutti.js`
  proprio per questo genere di scarto) passa da **46/56 a 45/56** — un
  solo campione, dentro il rumore che lo strumento stesso dichiara fra
  corse diverse della STESSA pagina (differenze di rasterizzazione fra
  processi Chromium). Non è un difetto: è il costo accettato dell'opzione
  2, scritto qui perché chi rilancia `tutti.js --registra` sappia perché
  il numero si è mosso.

  **MOTORE_V RESTA 2.** A taglia 5 l'esito di gioco è bit-identico (sopra):
  ogni nastro/sfida registrato a taglia 5 rigioca IDENTICO, verificato
  senza bisogno di toccare l'ancora — `_q-replay.js` **10/10** e
  `_q-regole.js` **16/16** (compresa la prova 13/NASTRO-VERSIONE, che
  verifica proprio il rigetto dei nastri di motore vecchio) restano verdi
  senza alcuna modifica. A taglia 7/11 non esiste alcun nastro affidabile
  precedente da rompere: era esattamente la #98 a impedirne l'esistenza —
  quindi non c'è alcun caso di «stessi comandi, esito diverso» da
  proteggere con un incremento di versione.

  **BATTERIA INTERA RILANCIATA** (lezione 22): `node strumenti/tutti.js
  --tutto` — **41 cancelli**, tutti quelli che contano **VERDI** (`audio`
  e `avvio-telefono` prova nulla per assenza di telefono/contesto audio
  headless, dichiarati a registro e non letti; `avvio` e `istantanea`
  informativi, non contano). Due cancelli sono usciti ROSSI alla prima
  corsa e sono stati indagati e chiusi, non ignorati:
  - **`folla.js`** («la sagoma della folla cresce con lo scoppio del gol»):
    6,8% contro la soglia 8%. **Causa vera**: questo banco semina
    `Math.random` GLOBALE una volta sola all'avvio pagina (seme fisso
    20260728) e non lo riseminta più — è sensibile a QUANTO Math.random
    viene consumato durante il boot prima del suo `startMatch(1,1)`.
    Prima della cura, `resize()`→`buildFieldTex()`→`rebuildCrowd()`
    consumavano un numero enorme di sorteggi da quello stesso
    Math.random durante il boot (a QUALSIASI taglia, anche 5): il punto
    di partenza dei sorteggi reali di partita era spostato in avanti
    della stessa quantità, sempre, con lo stesso seme. Tolta la
    cosmetica dallo stream condiviso, la partita che nasce dal seme
    20260728 è un'ALTRA partita (posizioni/telecamera diverse dopo i 4 s
    di simulazione), e la striscia di tribuna misurata non è più quella
    giusta per coincidenza — non un difetto della folla, è cambiato il
    campione. **Cura**: cercato un nuovo seme (banco reale, ~20
    candidati — il numero scritto nel banco, `folla.js:126`; una prima
    stesura di questa voce diceva ~30) con margine comodo —
    **20260901, 13,6%** — verificato stabile su corse ripetute; gli altri
    quattro controlli del file restano verdi con qualunque seme.
    **`folla.js` 5/5**. **Quanto è selettiva la misura** (verificato dalla
    revisione finale, sweep di 10 semi): 3 passano, 7 no (5,5-7,6%) — la
    misura è BIMODALE, o lo scoppio del gol cade nelle 8 fasi campionate
    (~13,6%) o non ci cade (~6-7,6%), coerente con l'ancora storica del
    file (14,3% viva contro -0,1% gelata). Ricampionare su un seme che
    ESERCITA il fenomeno è metodo corretto; chi ritara domani sappia che
    il rosso, qui, è la maggioranza dei semi.
  - **`_q-volo.js`** (D «tenendo TIRA esce una volee»: volee 0; B «la
    faccia non cambia senza cambiare il possesso»: 1 bugia). **Causa
    vera, e una PRECISAZIONE della diagnosi**: questo banco semina
    `SEME` per davvero (`t.semina()`→`SEME.accendi()`) e i suoi due
    scenari girano `startMatch(...,{size:7})` poi `{size:5}` sulla
    STESSA pagina — cioè proprio le TRANSIZIONI di taglia. La cura non
    rende neutra solo la PRIMA partita a una taglia mai vista da una
    pagina fresca: rende neutra OGNI transizione di taglia, comprese
    quelle che tornano a 5 da 7/11. Prima della cura, sia il cambio 5→7
    sia il cambio 7→5 consumavano `dado()` dal seme APPENA seminato da
    `t.semina()`, spostando il punto di partenza dei sorteggi veri (IA,
    traiettorie) della stessa quantità per lo stesso seme: le costanti
    `SEME_VOLO=88001`/`SEME_INSEGUE=88002` erano state trovate (a
    tentativi, a suo tempo) contro QUEL punto di partenza spostato,
    senza che l'autore lo sapesse. Con la cura, stesso seme → ALTRA
    partita: i vecchi numeri magici non riproducono più lo scenario.
    **Questo NON è un buco della non-regressione a taglia 5** dichiarata
    sopra: `_eventi.js` misura partite a taglia 5 raggiunta da un
    AVVIO FRESCO di pagina (mai un cambio di taglia, guardia già a
    riposo), mentre qui la taglia 5 è raggiunta DOPO un cambio da 7 —
    un caso che nessun nastro/sfida reale incontra mai (le sfide non
    cambiano taglia a partita in corso) ma che questo banco sì. **Cura**:
    ricercati (banco reale) nuovi semi vicini agli originali che
    riproducano lo stesso TIPO di scenario sotto il motore curato:
    `SEME_VOLO=88005` (una volee vera, non zero), `SEME_INSEGUE=88012`
    (zero bugie su DUE cambi di possesso VERI, non uno scenario degenere
    a zero cambi). `SEME_TENUTA` e i controlli E-K, indipendenti dalle
    transizioni, non toccati. **`_q-volo.js` 11/11**.
    **QUANTO È SELETTIVO QUESTO CANCELLO** (rilievo IMPORTANTE della
    revisione finale, misurato dal revisore e ora scritto anche nel banco,
    `_q-volo.js:95-131`): il controllo B non passa con qualunque seme.
    Sweep `SEME_INSEGUE` 88012-88019 a `SEME_VOLO` di produzione: **4 su 8
    passano, 4 falliscono** (1-3 bugie), e dei 4 verdi uno è degenere
    (88013: zero bugie su zero cambi) — verde genuino ≈ **37%**. NON è un
    effetto della cura: sul gioco non curato lo stesso quadro (base+88003
    → 3 bugie su 8 cambi; base+88012 → 1 bugia su 1). A FAVORE dell'autore
    della ritaratura, e va detto: sulla base 5 semi su 9 passavano B in
    modo DEGENERE (zero bugie su zero cambi); sceglierne uno sarebbe
    passato inosservato, e invece è stato scelto un seme con cambi di
    possesso veri e l'ha dichiarato — l'opposto del cherry-picking.
    **SEGUITO APERTO** (a registro, non numerato): il fenomeno «la faccia
    cambia senza un cambio di possesso» è PRE-ESISTENTE, e non è deciso se
    sia un difetto vero dell'inseguimento o un ORACOLO TROPPO STRETTO —
    `lato === precLato` non distingue il pallone vagante da quello
    posseduto. Va deciso con una misura dedicata.

  **LA VOCE #98 SI CHIUDE QUI.** Isolata parzialmente al #128 (solo
  `rebuildCrowd`, solo il canale `SEME`), isolata per intero e curata al
  #129 (i due consumatori, i due canali, e ORA precisata: OGNI
  transizione di taglia, non solo la prima partita a una taglia nuova):
  il determinismo cross-partita a taglia 7/11 è ora **pieno, 10/10**,
  allo stesso titolo di taglia 5. `git diff main -- CALCETTO-il-gioco.html`:
  due zone, `DECO` (definizione vicino a `SEME`/`dado`) e le tre funzioni
  cosmetiche convertite (`paintField`, `buildGrain`, `rebuildCrowd`) —
  nessuna funzione di gioco toccata. Due semi ritarati in `strumenti/`
  (`folla.js`, `_q-volo.js`), zero righe di gioco toccate da quella
  ritaratura.

- **Il soak con bande — #127 CANTIERE CHIUSO, e L'ONDA C CHIUSA** (#127,
  onda C — terzo e ultimo anello, 20 settembre 2026, tre compiti dal
  merge-base `ddf6604` — spec `docs/superpowers/specs/2026-09-20-soak-design.md`,
  piano `docs/superpowers/plans/2026-09-20-soak.md`).

  **COSA FA.** Il mandato (§13.1.5) chiede "soak: 1.000 partite bot-vs-bot
  a notte, zero crash, zero violazioni di invariante, nessuna partita più
  lunga della durata attesa +25%". `strumenti/_q-soak.js` guida un VOLUME
  di partite CPU-contro-CPU a taglia 5 (rosa rigenerata con `nuovaRosa()`
  a ogni partita — la lezione di SAVE.rosa del fuzzer #126 — ordine
  `setCpuVsCpu` dopo `startMatch`), e su OGNI partita riusa le invarianti
  di `_q-invarianti.js` (`verificaTickInvarianti`/`verificaCronometriFratelli`,
  via `require`) + INV-15 (arriva a `'end'` entro il tetto). È il
  COMPLEMENTO del fuzzer: il fuzzer cerca il caso avversariale con input
  casuale, il soak cerca il caso raro nel VOLUME. Campione di batteria
  **60 partite, 17/17 verde**, 429.064 fotogrammi, max osservato
  10.172/18.000 (56,5%), 32,9 s (`lento:true` in `tutti.js`); impronta
  ripetibile `21f65940`; il volume del mandato resta un lancio manuale
  `--partite 1000` (~8 min).

  **LA RICALIBRAZIONE DEL TETTO INV-15 (13.200 → 18.000 fotogrammi), il
  valore del soak sul volume.** Su 1.000 partite il soak ha trovato che
  lo 0,5% supera i 13.200 fotogrammi (220 s): NON un hang (raggiungono
  `'end'`), ma un raro **rigore a oltranza** (sudden-death, cap del gioco
  a 18 tiri, `:18523`) che arriva a ~236 s — un caso LEGITTIMO. Il tetto
  era tarato senza quel caso. Ricalibrato al caso peggiore MISURATO:
  pre-rigori max 180,9 s su 427 partite + 18 tiri × 328 fotogrammi (il
  tiro più lungo su 46.776 campionati) → **18.000 fotogrammi (300 s)**;
  il +25% del mandato ora è speso sul caso peggiore legittimo, non sulla
  durata ordinaria. L'HANG resta colto (è infinito: supera qualunque
  tetto finito — `--bugiardo durata` ROSSO). Ancorato a taglia 5; 7/11
  hanno orologi più lunghi, non ri-analizzati (stanno sotto in campione
  piccolo, dichiarato). La ricalibrazione ha ESPOSTO e curato due bug dei
  banchi: `_q-cpu-ordine.js` teneva un duplicato locale del tetto (ora
  importa lo shared del #126); `_q-invarianti.js` validava i flag senza
  la guardia `require.main` (crashava se requerito) — chiuso.

  **LE BANDE.** Misurate su 150 partite a taglia 5 (gol/90 s, tiri, tiri
  in porta, parate, legni, durata gioco vivo ~92,3 s, %0-0): ancorate come
  costanti datate, con larghezza GENEROSA dichiarata (non una recinzione
  di Tukey letterale: l'IQR della durata viva era ~0,7 s, troppo stretto
  per un cambiamento legittimo domani — la filosofia di `_eventi.js`). Un
  caso di controllo (`--bugiardo bande`, `tiri=0`) fa rossa SOLO la banda
  tiri (le altre sei verdi): il cancello condanna una deviazione vera.
  Le bande DIVERGONO da `_eventi.js` (tiri 13 vs 10, gol 3,00 vs 1,42) —
  DICHIARATO onestamente, non un errore: il soak rigenera `SAVE.rosa` a
  ogni partita, `_eventi.js` no. A 7/11 misurate ma solo informative (non
  bit-ripetibili, #98).

  **L'ONDA C È CHIUSA.** I suoi tre anelli sono in `main`: l'invariant-checker
  (#125, la rete che verifica), il fuzzer (#126, l'input casuale che stana
  il caso avversariale), il soak (#127, il volume che stana il caso raro).
  Cosa ha dato l'onda C: una rete di robustezza PERMANENTE in batteria; DUE
  P0 vere trovate dal fuzzer e curate (#128, cross-proiettile e battitore
  espulso); la causa della voce #98 (determinismo instabile a 7/11)
  ISOLATA (#129, `rebuildCrowd` consuma il PRNG in proporzione al campo); il
  tetto di durata ancorato al caso peggiore reale. **Seguiti aperti**:
  **#129** (togliere `rebuildCrowd`/`setTaglia` dallo stream del PRNG di
  gioco, per il determinismo a 7/11 — RETTIFICA A EDIZIONI: **#129 CHIUSO**,
  in cima a questo registro, con PRNG dedicato per la cosmetica; **#98
  CHIUSA**, 7/11 deterministici 10/10); **INV-06/07** (validità del gol /
  ripresa da fermo, servono asserzioni dedicate — il fuzzer/soak danno
  l'esposizione, non l'assert); **#123** (banco fotosensibile per-regione);
  la nota che la fase `power` del duello non ha un tetto a livello di
  codice (il bound 18.000 è empirico su 46.776 tiri, non closed-form).

- **Il fuzzer di comandi — #126 CANTIERE CHIUSO** (#126, onda C — secondo
  anello, 20 settembre 2026, tre compiti dal merge-base `f27d951` — spec
  `docs/superpowers/specs/2026-09-20-fuzzer-design.md`, piano
  `docs/superpowers/plans/2026-09-20-fuzzer.md`; il primo giro di questo
  stesso cantiere aveva trovato le due P0 curate alla voce #128, sopra).

  **COSA È E COSA ESERCITA.** Il mandato (§13.1.2) chiede "property-based
  tests: random inputs for thousands of ticks must never violate the
  invariants". `strumenti/_q-invarianti.js` (#125/#128) sa VERIFICARLE ma
  le esercita solo con partite CPU-contro-CPU: `G.swLock`/`G.swTimer`
  (scritti solo da un cambio-giocatore/strappo UMANO) restano vacui, e
  nessuna posizione è mai spinta a fondo scala verso i confini del campo.
  `strumenti/_q-fuzzer.js` genera INPUT CASUALE deterministico su DUE
  semi separati e dichiarati (`semeGioco` governa IA/fisica, `semeComandi`
  — un xorshift proprio del banco, mai `Math.random` — decide i comandi):
  guida `Reg`+`Touch5` (lo stesso alfabeto di un pollice vero: lo stick e
  i cinque dischi, letti da `pulsanti(0)`) su una squadra umana(fuzzata)
  contro CPU, taglia 5, a cadenza REALISTICA (5-15 fotogrammi fra un
  comando e l'altro, non ogni tick — vigilando il tetto
  `Reg.righe>40000`, che tronca in silenzio: **max osservato 745 righe su
  un singolo seme**, mai oltre la soglia di allarme di 32.000). Il disco
  FILTRANTE/CAMBIO (peso doppio: è `cambiaGiocatore`, lo swap) e i
  tentativi di strappo (`provaStrappo`) sono privilegiati apposta — i due
  soli scrittori di `G.swLock` in tutto il gioco. Dopo ogni fotogramma le
  DODICI invarianti di `_q-invarianti.js` sono RIUSATE, non riscritte
  (`require` porta il codice sorgente, `.toString()`, di
  `verificaCronometriFratelli`+`verificaTickInvarianti` dentro lo script
  di pagina): DIECI si verificano a ogni fotogramma (le prove 1-9 più la
  12, INV-04 confini+margine); le prove 10/11 (DOCROSS/KICKOFF-ESPULSO,
  voce #128) restano scenari diretti one-shot dentro `_q-invarianti.js`
  stesso — nessun traffico casuale garantisce da solo un cross lunghissimo
  o un cartellino differito pendente — già verificate lì, **11/11**.

  **IL DUELLO, GESTITO** (compito 2). `__test.simulate` chiama
  `Duel.update()` quando `G.scene==='freekick'`, non `step()`: il nastro
  `Reg` sta fermo e il duello non vi finisce, per dichiarazione del gioco
  stesso (`CALCETTO-il-gioco.html:43301-43336`). Senza intervento le fasi
  `zone`/`power` del tiratore umano non hanno nessun timeout e la partita
  si incastrerebbe per sempre — un falso hang, indistinguibile da INV-15
  rotta davvero. Il banco risolve con `Duel.pickZone/stopPower/pickKeeper`
  (stesso PRNG dei comandi, tempo di reazione probabilistico: 0,35 per
  tick), LOGGATO A PARTE (`logDuelli`: {seme, fotogramma, metodo,
  argomenti}) perché `Reg` non lo cattura: **0 semi esclusi su 20**
  (misurato due volte, stessa cifra entrambe le volte), 6 azioni di
  duello osservate in una corsa (pickZone=1, stopPower=1, pickKeeper=4).

  **SWLOCK/SWTIMER ESERCITATI** — il cronometro-fratello più a rischio
  della prova 6 (cinque regressioni pagate a mano su questo campo: #86/
  #87/#107/#117/#122), vacuo in ogni partita CPU-contro-CPU: **20 semi su
  20** hanno osservato `G.swLock!=[0,0]` almeno una volta, **147.134
  fotogrammi-tick su 150.589** (97,7%) con swLock attivo.

  **INV-04 — CONFINI+MARGINE, nuova**, aggiunta a `_q-invarianti.js`
  (prova 12) per questo cantiere: ogni giocatore entro
  [-110, FW+110] × [-110, FH+110] unità (110 = 5 metri, mandato),
  verificata anche dentro il duello. Lo stick a fondo scala verso i bordi
  (il 55% delle coordinate cade nel 25% esterno dell'intervallo) la
  stressa per la prima volta — un banco CPU-contro-CPU a seme fisso non
  spinge mai un giocatore vicino al bordo. **Verde su 150.589 fotogrammi
  campionati.**

  **LA RIPRODUZIONE**: pagina fresca, `t.semina(semeGioco)`, `startMatch`,
  `t.rigioca(nastro)` col log-duelli riapplicato per tick nello stesso
  loop di `simulate` — senza, un seme che passa da un dischetto
  divergerebbe dal fotogramma del duello in poi. **Verde**: 351 campioni
  identici, risultato 0-3, 564 comandi riletti.

  **LA SCOPERTA SAVE.ROSA, e la RETTIFICA A EDIZIONI della voce #128**
  (20 settembre 2026, misurata durante la messa a punto del determinismo
  cross-partita di questo stesso banco — compito 2, ripresa e riverificata
  qui al compito 3). La voce #128 aveva scritto: «il canale che
  sopravvive... a taglia 5 è quello dei TOCCHI» (`stick.ox/oy` e affini),
  con la consegna esplicita al fuzzer di azzerarli fra le partite. Quella
  era la miglior misura disponibile in quel momento — nessun fuzzer
  esisteva ancora per generare partite in sequenza a dita vere — ma
  generalizzava un sospetto plausibile senza il confronto campo-per-campo
  che solo questo compito ha fatto: `Touch5.stick` è risultato IDENTICO
  fra le due corse al fotogramma della prima divergenza — quel canale è
  già sano, la cura preesistente di `Reg.accendi()`/`azzeraComandi()`
  basta da sola. **LA CAUSA VERA**, trovata misurando
  (`fuori/_diag-crosspartita-scratch.js`, usa-e-getta, non committato):
  `G.players[i].tecnica` differiva GIÀ al fotogramma 0, PRIMA di ogni
  comando (69 contro 63 per un giocatore, 55 contro 53 per un altro) — non
  è il canale input-a-dita, è `SAVE.rosa`, la rosa di carriera, creata UNA
  sola volta al caricamento della pagina
  (`if(!SAVE.rosa) SAVE.rosa=nuovaRosa()`, `CALCETTO-il-gioco.html:10137`)
  e fatta CRESCERE di un attributo a caso a ogni fine-partita (righe
  41623-41635: la progressione di carriera, un pregio del gioco vero, non
  un difetto). Su una pagina che gioca N semi in sequenza la rosa al seme
  k è già cresciuta di k partite; su una pagina isolata nasce sempre
  fresca. **Il primo tentativo di cura era sbagliato**, misurato:
  nullare `SAVE.rosa` fa cadere `setupPlayers` nel ramo "nessuna rosa"
  (cloni a statistica media, `p.piatto=1`), non nella rosa vera — un'ALTRA
  partita, non la stessa. **La cura vera**: `t.save.rosa =
  window.nuovaRosa()`, una RIGENERAZIONE esplicita (non un azzeramento)
  della stessa rosa-base pura che il caricamento scrive una volta sola
  (`nuovaRosa()` è pura, hash del solo indice `i`, mai di `SEME`/`dado()`
  — verificato a numeri: stesso JSON, tecnica 63/53/62/58/56). **Il
  gioco non è stato toccato**: la rigenerazione vive dentro il banco, a
  ogni seme del fuzzer, prima di `startMatch`. Verificato sui due indici
  scelti apposta (k=1, il più sensibile — la diagnosi originaria misurava
  già una divergenza al secondo giro; k=19, l'ultimo della batteria, il
  più carico di stato): **327 e 476 campioni identici** rispettivamente,
  seme in sequenza contro seme isolato su pagina fresca. `Touch5`/`Reg`
  restano parte della disciplina giusta (uno stato di tocco a metà va
  comunque azzerato da chi chiama), ma NON erano la causa del residuo
  osservato: quella era `SAVE.rosa`. **Consegna al SOAK #127**: rigenerare
  la rosa (`nuovaRosa()`) a ogni partita in sequenza, come qui — il SOAK
  non usa dita (zero `Touch5`), quindi non aveva mai avuto bisogno della
  cura sui tocchi, ma avrebbe lo stesso questo residuo se girasse N
  partite sulla stessa pagina senza rigenerare la rosa.

  **NESSUNA P0 NUOVA**: le due violazioni vere trovate dal primo giro di
  questo stesso fuzzer (il cross-proiettile e il battitore espulso,
  cantiere dedicato #128, sopra) sono CURATE e CONFERMATE ASSENTI da
  questa corsa — dodici invarianti tutte verdi (dieci a ogni tick, due
  dedicate già verdi in #128), zero fixture nuove scritte in `fuori/`. Il
  gioco regge lo stress del fuzzer. **Il fuzzer resta una RETE
  PERMANENTE**: se un domani un tocco al motore riaprisse una di queste
  dodici proprietà, la prossima corsa in batteria diventerebbe rossa — e
  per il mandato (§13.3) una violazione vera sarebbe una P0 che blocca,
  non un numero da rincorrere.

  **COSA NON COPRE** (dichiarato dal piano, non regalato). **INV-06/07**
  (validità del gol / ripresa da fermo): il fuzzer genera l'ESPOSIZIONE
  (traffico denso di tiri/cross/scivolate ovunque) ma verificarle richiede
  un'invariante DEDICATA che oggi non esiste — non "coperta gratis":
  seguito aperto, un assert nuovo. **Umano-contro-umano** (due nastri,
  `G.mode===2`): più complesso, nessun vantaggio chiaro per le invarianti,
  rimandato — il fuzzer gioca solo umano(fuzzato) contro CPU.

  **COMPITO 3 — BATTERIA E NUMERI VERI.** `_q-fuzzer` registrato in
  `strumenti/tutti.js` (`conta:true`, sul modello di
  `regole`/`umore`/`invarianti`/`cpu-ordine`): misurato due volte da solo,
  stesso esito bit per bit entrambe le volte, **~17 s** (16,976 e
  16,985 s) — ben sotto la soglia 30-40 s che avrebbe chiesto
  `lento:true` (il modello `audio.js`/`avvio`): corre IN COMPAGNIA. **In
  cifre, dalla corsa di verifica**: 20 semi lanciati, 0 esclusi per
  duello, 20 eseguiti nella statistica, 150.589 fotogrammi totali
  simulati, 11.812 comandi emessi, 1.096 finte/strappi tentati, 1.255
  avvii del disco swap-privilegiato.

  Batteria intera rilanciata DUE volte, per lo stesso motivo che chiede
  il mandato («ogni bug ha prima un test fallito», qui rovesciato: ogni
  rosso va indagato prima di richiuderlo). **Prima corsa** (banco
  occupato 3,4 volte il suo minimo, misurato dalla guardia di `tutti.js`):
  35 cancelli eseguiti in 713 s di orologio, ROSSO su `prestazione`
  (cronometrico, gira da solo a campo libero per costruzione): «il 95°
  percentile sotto: 141,7 → 183,4 ms (+29,4%, ammesso +25%)». **Indagato,
  non richiuso a occhi chiusi**: `prestazione` è il cancello di casa già
  documentato come rumoroso sotto contesa (vedi il commento in testa a
  `tutti.js` — il 20 agosto ha dichiarato +26,9%/+26,3% su due file
  BYTE-IDENTICI sotto carico), e la stessa corsa lo segnala da sola
  («misura un tempo su un banco occupato 3,4x: sospetto, non condanna»).
  Rimisurato DA SOLO (`node strumenti/tutti.js --solo prestazione`)
  subito dopo, su banco più libero: **3 confronti su 3 passati, VERDE**.
  **Seconda corsa intera**, di nuovo dall'inizio (nessuna riga toccata fra
  le due): **35 cancelli eseguiti in 716 s di orologio (2,4 volte più
  veloce che in fila), i 34 che contano TUTTI VERDI** — `prestazione`
  incluso, questa volta pulito dal primo colpo (3/3), a conferma che il
  rosso della prima corsa era contesa del banco, non un difetto
  introdotto da questo cantiere (che oltretutto non tocca il motore).
  `_q-fuzzer` **41 s** dentro la corsa in compagnia (contro i ~17 s
  misurati da solo su banco libero: la differenza è la contesa dei
  quattro cancelli paralleli, lo stesso motivo per cui `prestazione`/
  `giocata` girano DA SOLI e non IN COMPAGNIA nella lista).

  `_q-invarianti.js` **12/12** (11/11 di suo, più l'esercizio del
  fuzzer); `_q-fuzzer.js` **15/15**; `audio.js` (lento, escluso dalla
  corsa di default) stato dichiarato dal #122, non toccato qui; l'unico
  informativo `istantanea.js` (non conta) **NO 46/56** in entrambe le
  corse — lo stesso schema già dichiarato dalle voci #113/#114/#122/
  #125/#128, non un peggioramento di questo cantiere. **Verdetto della
  seconda corsa (quella pulita)**: «VERDE CON RISERVA: tutti i 34
  cancelli che contano sono passati», la riserva è solo l'informativo
  `istantanea` contro un riferimento del 20 agosto che era già una prova
  NULLA (nessuna quota valida da confrontare). `git diff main --
  CALCETTO-il-gioco.html` **VUOTO** per l'intero cantiere #126 (compiti
  1-3): il gioco non è mai stato toccato da questo ramo — le due cure del
  cross/kickoff vivono nel cantiere #128, non qui.

  **DOMANDA APERTA, NON RISOLTA QUI**: se `SAVE.rosa` cresce per carriera
  e le SFIDE (`Sfida.gioca`/`guarda`) portano un nastro fra due telefoni
  diversi, la rosa di ciascun giocatore in quel momento può differire da
  telefono a telefono — va verificato se le sfide già forzano una rosa
  canonica nel nastro (come già fanno per `sponde:'gabbia'`/
  `miraGuidata:'pieno'`, voci #105/#113) o se questo è un canale di
  non-determinismo delle sfide non ancora censito. Non indagato da
  questo cantiere di banco: bandiera per chi apre il prossimo.

- **Le due crepe del fuzzer, curate — #128 CANTIERE CHIUSO** (#128, 20
  settembre 2026, tre compiti dal merge-base `bc2d802`, primo cantiere di
  MOTORE aperto dal primo giro del fuzzer #126 — spec
  `docs/superpowers/specs/2026-09-20-crepe-fuzzer-design.md`, piano
  `docs/superpowers/plans/2026-09-20-crepe-fuzzer.md`).

  **P0-1 — IL CROSS-PROIETTILE (`doCross`), curato** (compito 1).
  `doCross` (`CALCETTO-il-gioco.html:15925`) calcolava `speed=dist/T` con
  `T` bloccato in [0,66; 0,75] ma `dist` NON limitato — l'unico tiro del
  gioco che non passava da `tiroVelocità()`/`TIRO_TETTO` (:16212, valore
  860). Un cross lungo diventava un proiettile: **misurato 1433,8 u/s**,
  il 67% sopra il tetto. Test (prova 10/DOCROSS di `_q-invarianti.js`,
  scenario diretto — crossatore in fondo al proprio campo, bersaglio vero
  `puntoCross`, zero `dado()` nuovo) nato ROSSO sul gioco di allora, VERDE
  dopo la cura. Cura (attrezzo `strumenti/_t-crepe-docross.js`, un'ancora):
  `Math.min(TIRO_TETTO, dist/T)` nella chiamata a `kickBall` (:15946) — lo
  stesso pavimento già applicato agli altri tiri. Il cross NORMALE resta
  bit-per-bit identico (verificato a mano: 399,07 u/s invariati).

  **P0-2 — IL BATTITORE ESPULSO (`resetKickoff`), curato** (compito 2).
  `resetKickoff` (:10904) scaricava il cartellino differito PRIMA
  (`scaricaCardVantaggio`→`infliggiCartellino`, che marca `p.out`), ma
  sceglieva il battitore del calcio d'inizio per team+idx FISSO
  (`p.team===kt && p.idx===1`) SENZA controllare `out<=0`: un giocatore
  appena espulso, se era l'idx1 della squadra che batte, veniva rimesso in
  campo e riceveva `G.ball.owner` — **misurato: owner=1, out=12**
  (ESPULSIONE_SEC). Test (prova 11/KICKOFF-ESPULSO di `_q-invarianti.js`,
  scenario diretto — cartellino differito su team0/idx1, squadra già a un
  giallo così il secondo la espelle, `kickTeam=team0`) nato ROSSO, VERDE
  dopo la cura. Cura (attrezzo `strumenti/_t-crepe-kickoff.js`): `&&
  p.out<=0` in più sulla condizione (:10967), con fallback a
  `diMovimentoInCampo(kt)[0]` (:10978 — lo stesso pattern già usato da
  `infliggiCartellino`) se idx1 non è eleggibile (mai vuoto per
  costruzione: la regola di casa vieta di scendere sotto 2 uomini di
  movimento). Il kickoff NORMALE resta bit-per-bit identico (20 semi
  verificati: owner/ctrl/posizione invariati).

  **MOTORE_V: 1 → 2** (compito 3, attrezzo `strumenti/_t-crepe-motorev.js`,
  `CALCETTO-il-gioco.html:13190`). Le due cure toccano la SIMULAZIONE in
  un modo che PUÒ cambiare come una partita rigiocata FINISCE — misurato,
  non supposto: **(a)** un nastro con un cross lungo, seme **20260812**
  (taglia 5, CPU-contro-CPU, `fuori/base128.html` = pre-cura P0-1 contro il
  gioco curato) DIVERGE al **fotogramma 1059** (17,65 s) — riprodotto oggi
  bit per bit; **(b)** un kickoff dopo un'espulsione differita, seme
  **20260836** (taglia 5), fa uscire **3-4 invece di 1-2** (misurato nel
  compito 2, con le 33 partite precedenti della stessa sequenza
  bit-identiche fra le due versioni — la causa è isolata a quella
  partita). Due sequenze di comandi identiche, due esiti diversi: un
  nastro registrato a MOTORE_V=1 rigiocato oggi userebbe quegli stessi
  comandi su un motore che si comporta diversamente in questi due casi.
  **`Sfida.guarda` gestisce già la versione** (meccanismo della voce #107
  compito 4, non toccato qui): confronta `Reg.motoreV !== MOTORE_V`
  (:43051) PRIMA di `startMatch` e chiude con causa vera («un'altra
  versione del motore») e ZERO PENALITÀ. **Verificato coi numeri**:
  `strumenti/_q-regole.js`, prova 13/NASTRO-VERSIONE, estesa con un CASO C
  — un nastro con MOTORE_V=1 ESPLICITO (`'1|1||'`, non il vecchio
  artefatto senza campo del CASO A) rigiocato sul gioco a MOTORE_V=2 viene
  RIFIUTATO (`motoreV letto: 1`, `partita avviata: false`, messaggio a
  causa vera) — il caso preciso di questa cura, e un nastro vero v1
  NON verrebbe mai lasciato passare per buono. **Un buco trovato e chiuso
  nella prova stessa**: il CASO B (nastro alla versione corrente)
  confrontava `motoreVLetto === 1` — un valore INCHIODATO che si sarebbe
  rotto da solo proprio oggi, il giorno in cui MOTORE_V sale a 2 (misurato:
  la corsa con la sola costante incrementata dava già `motoreV letto: 2`
  contro un `atteso 1` scritto nel banco); riscritto `motoreVLetto > 0` —
  un nastro scritto e riletto dalla stessa istanza porta per costruzione
  la versione corrente, qualunque essa sia, e la prova non si romperà da
  sola al prossimo incremento.

  **IL DUE-VERSIONI, DICHIARATO PER TAGLIA** (`_c3-sorteggi.js`,
  `fuori/base128.html`/`base128b.html` — pre-cura — contro il gioco
  curato: DIVERGE per costruzione, è la firma delle due cure, non un
  difetto): doCross **16 partite su 60** con un conto sorteggi/punteggio
  diverso (taglie 5/7/11, semi 20260803..20260822 — misurato di nuovo in
  questo compito); resetKickoff **1 partita su 120** (sequenza
  CPU-contro-CPU, taglia 5, seme 20260836, misurato nel compito 2).
  `_q-determinismo` resta **10/10** (l'invariante del multigiocatore,
  stesso seme e stessi comandi, intatta — il due-versioni confronta
  VERSIONI diverse del gioco, non due corse della stessa versione).

  **IL RESIDUO DI DETERMINISMO CROSS-PARTITA, DIAGNOSTICATO come
  artefatto A TAGLIA 5 — NON una P0 del gioco A QUELLA TAGLIA**
  (correzione di revisione: la diagnosi originaria generalizzava oltre
  quanto misurato — vedi il secondo canale, separato e vero, subito
  sotto). Durante la diagnosi di P0-2 era emerso un dubbio: la stessa
  coppia di semi dava partite diverse a seconda di quante partite la
  precedevano sulla stessa pagina. Isolato **A TAGLIA 5**, la sola su cui
  questo compito ha misurato: la simulazione resta deterministica
  rispetto a {seme, comandi} — una pagina fresca e una pagina dopo N
  partite danno stati BYTE-IDENTICI a parità di `startMatch`
  (`G.stats`/`G.players` sono già azzerati lì, e restano gli unici stati
  cross-partita che il sospetto poteva chiamare in causa, **a questa
  taglia**). Il canale che sopravvive fra partite sulla stessa pagina, a
  taglia 5, è quello dei TOCCHI (input-a-dita): il gioco stesso lo
  documenta accanto a `Reg` (~:13183 — la levetta misura la velocità del
  dito con `performance.now()`), e uno stato di tocco lasciato a metà
  (la levetta attiva, un verbo a tenuta non rilasciato) non viene
  azzerato da `Reg.azzeraComandi()`/`Touch5.azzera()` a meno che sia il
  CHIAMANTE a farlo prima della partita successiva. **A taglia 5**, non
  è un bug del motore: il SOAK (CPU-contro-CPU, #127) non ne è affetto
  (zero dita, zero levetta), è il FUZZER (#126) — che gioca «come un
  dito vero» — a dover azzerare esplicitamente i tocchi (`Touch5`/`Reg`,
  o una pagina fresca) fra una partita e la successiva prima di fidarsi
  di un confronto seme-a-seme, **a quella taglia**.

  **UN SECONDO CANALE, SEPARATO E VERO, A TAGLIA 7/11 — LA VOCE #98, CON
  LA CAUSA ORA ISOLATA.** «Zero dita» non è una garanzia di determinismo
  cross-partita in generale: a taglia 7 e 11 esiste una divergenza
  CPU-contro-CPU VERA fra due pagine fresche con lo stesso seme, zero
  dita e zero levetta — già a registro come voce #98, `_q-determinismo`
  **8/10** a taglia 7 e a taglia 11 (prove A e B, contro **10/10** a
  taglia 5 — rimisurato in questo compito). La causa, cercata da tempo
  in quella voce, è ORA ISOLATA: `startMatch` → `setTaglia` →
  `rebuildCrowd` (`CALCETTO-il-gioco.html:29922-29949`) consuma
  `dado()`/`SEME` in un numero PROPORZIONALE al perimetro del campo —
  misurato **~114.026 estrazioni in più** alla prima partita giocata a
  taglia 11 (`SEME.n` **114.093** contro **67** su una pagina che gioca
  subito a taglia 5). `setTaglia` (:29977) ritorna subito se la taglia
  richiesta è già quella corrente (`if(n===TAGLIA) return TAGLIA`), quindi
  SOLO la prima partita giocata a una data taglia paga quelle estrazioni:
  lo stream del PRNG di gioco SLITTA, e una pagina fresca produce una
  partita CPU-contro-CPU DIVERSA da una pagina che ha già giocato N
  partite alla stessa taglia, con lo stesso seme — un canale
  cross-partita che non passa dai tocchi, e che colpisce anche il SOAK
  (#127) se gira a 7/11. **PRE-ESISTENTE su `main` (verificato su
  `bc2d802`, il merge-base di questo cantiere): non è una regressione
  delle due cure P0-1/P0-2 né del passaggio MOTORE_V 1→2.** Non si cura
  qui (fuori dal perimetro dei tre compiti): si dichiara la causa e si
  apre il **seguito #129** (sotto l'ombrello della voce #98) per la cura
  ingegneristica — un seme proprio per la folla (sul modello di
  `usuraSeme` della grana pista), oppure sospendere `SEME` attorno a
  `rebuildCrowd`, oppure chiamare `setTaglia` PRIMA della semina.
  **RETTIFICA A EDIZIONI (20 settembre 2026, voce #129, in cima a questo
  registro): la causa qui sopra era SOLO PARZIALE (rebuildCrowd è l'8% del
  consumo, non il tutto; il dominante è `paintField`) e il #129 l'ha
  CURATA con un PRNG dedicato per la cosmetica — la voce #98 è CHIUSA,
  7/11 sono ora deterministici 10/10 allo stesso titolo di taglia 5.**
  **Consegna a #126 (fuzzer) e #127 (soak)**: girare a TAGLIA 5 (dove il
  determinismo cross-partita è pieno, 10/10) finché la voce #98 non è
  curata, oppure dichiarare esplicitamente la #98 se si gira a 7/11. **Nota
  per il #126/#127, non una cura di qui**: nessuna riga del motore è
  stata toccata per questo residuo.

  **Batteria intera rilanciata** (le cure toccano la simulazione):
  `_q-invarianti.js` **11/11** (le nove ereditate da #125 + DOCROSS +
  KICKOFF-ESPULSO); `_q-regole.js` **16/16** (coerente con MOTORE_V=2,
  prova 13 riscritta come sopra); `_q-replay.js` **10/10**;
  `_q-determinismo` **10/10**. `node strumenti/tutti.js`: **34 cancelli
  eseguiti in 949 s di orologio (2,3 volte più veloce che in fila), i 33
  che contano tutti VERDI** (`abbandono`/`audio`/`volti`/`avvio`/
  `avvio-telefono` esclusi dalla corsa di default, `lento:true`).
  `audio.js` verificato a parte: **28/28 VERDE** (stato dichiarato dal
  #122, non toccato qui). Il solo informativo `istantanea.js` (non conta)
  **NO 46/56**, PEGGIORATO rispetto al registro SOLO perché quel
  riferimento (20 agosto) era una prova NULLA — lo stesso schema già
  dichiarato dalle voci #113/#114/#122/#125, non un peggioramento di
  questo cantiere — **«VERDE CON RISERVA»** complessivo. `git diff
  CALCETTO-il-gioco.html` per il solo compito 3: un'ancora (MOTORE_V
  1→2, con la nota del perché accanto alla costante). Fixture delle due
  P0 in `fuori/` (`base128.html`, `base128b.html`), promuovibili a prova
  permanente se servirà rigiocarle.

- **Il banco delle invarianti — L'ONDA C COMINCIA, #125 e #124 CHIUSI** (#125,
  20 settembre 2026, due compiti dal merge-base `a7561d0`, primo anello
  dell'onda C del mandato — `_analisi/MAPPA-MANDATO.md` righe 574-641,
  753-760; spec `docs/superpowers/specs/2026-09-20-invarianti-design.md`,
  piano `docs/superpowers/plans/2026-09-20-invarianti.md`).

  **PERCHE' UN BANCO, NON CODICE NEL MOTORE.** Il mandato (§13, Appendice A)
  chiede un property-based test (input casuali per migliaia di tick che non
  violino mai le invarianti) e un soak (1000 partite/notte, zero
  violazioni, durata mai oltre l'attesa +25%) — ma prima di tutto chiede DI
  SAPERE cosa cercare: senza le invarianti, input casuali non dicono
  niente. `strumenti/_q-invarianti.js` è quel prerequisito, ed è un BANCO,
  non codice sempre-attivo: legge lo stato vivo del motore via
  `window.__test` (lo stesso canale di `_diag-nan.js`/`_q-determinismo.js`/
  `_q-umore.js`), non una guardia dentro `CALCETTO-il-gioco.html`. La mappa
  citava «dentro il motore, sotto un flag di collaudo» come opzione NON
  decisa (riga 621 del progetto): resta un seguito futuro se il fuzzer lo
  chiederà davvero (per fermarsi al primo tick rotto), non una scelta presa
  qui. Il gioco non paga nessun costo a runtime, e non si rischia di
  introdurre un bug nel motore per costruire lo strumento che lo misura —
  la ragione dichiarata dal piano.

  **LE NOVE PROVE, CIASCUNA NATA ROSSA SU UN BUGIARDO** (metodo di casa: una
  invariante che non sa condannare non misura). Partite CPU-CPU a seme
  fisso (20260920), taglia 5 (#98: il determinismo è instabile a 7/11), 8
  semi, **56.984 fotogrammi campionati** per corsa (verificato di nuovo
  oggi, 9/9 verde):
  1. **NaN/Infinity** su `ball.{x,y,z,vx,vy,vz}` e `p.{x,y,vx,vy,aiTX,aiTY}`
     (assorbe `_diag-nan.js` come invariante permanente) — bugiardo:
     `ball.x=NaN`.
  2. **owner valido**: -1 oppure 0..N-1, e se >=0 il giocatore non è
     `out>0` — bugiardo: owner=999 (fuori range).
  3. **punteggio monotono** (`G.score` non decresce mai fra due campioni)
     — bugiardo: un decremento dopo una salita lecita.
  4. **timeLeft monotono**, mai <0 — bugiardo: +5 secondi di risalita.
  5. **durata<=13200 fotogrammi/220s (INV-15)**, generalizza
     `_q-cpu-ordine.js` a N semi (10 semi di serie per questa sola prova,
     perché l'ordine sbagliato non blocca ogni seme) — bugiardo: l'ordine
     `setCpuVsCpu` invertito, lo scenario-hang #119.
  6. **cronometri-fratelli** (`recT`/`vantaggio`/`possOwner`/`possT`/
     `pulse`/`crowdSndT`/`swLock`/`swTimer`) al riposo SUBITO dopo
     `startMatch` — LA PIÙ A RISCHIO: cinque regressioni pagate a mano
     (#86/#87/#107/#117/#122) — bugiardo: `_crit-inv-cronometri.js`, che
     toglie l'azzeramento di `G.pulse` (NON `G.swLock`: vedi caveat (a) —
     `swLock`/`swTimer` non sono esercitati in CPU-CPU, quindi un bugiardo
     su di loro resterebbe verde; `G.pulse` cresce a ogni fotogramma e
     condanna in modo affidabile).
  7. **clamp fiato/cond**: `p.fiato`/`p.cond` in [0,100] per ogni
     giocatore (`p.umore`/`p.nervi`/`G.spinta` restano coperti da
     `_q-umore.js`, non duplicati qui) — bugiardo: `fiato=150`.
  8. **>=2 uomini di movimento in campo** per squadra (`role!=='gk'` e
     `out<=0` — la stessa regola che `infliggiCartellino` già rispetta,
     qui ricontrollata dall'esterno, sulla stessa definizione) — bugiardo:
     `out>0` su 3 uomini di movimento della stessa squadra, scavalcando di
     proposito la guardia del gioco.
  9. **palla mai sotto il piano** (`z>=0` sempre) e **velocità entro un
     tetto SOLO a palla libera** (`owner<0`) — bugiardo: `z=-10`, oppure
     `vx=999999` a `owner=-1`.

  **IL TETTO DELLA PROVA 9, DICHIARATO EMPIRICO, NON TEORICO.**
  `TETTO_VEL_PALLA=1353` u/s e `TETTO_VZ_PALLA=402` u/s vengono da una
  calibrazione su 30 semi/222.282 fotogrammi a palla libera (massimo
  osservato 902/268 u/s), poi osservato ×1,5 come margine dichiarato — non
  un limite teorico del motore. Un'ancora più difendibile sarebbe
  `TIRO_TETTO` (860 u/s, il tetto che il gioco stesso dichiara in
  `fireShotMirato`/`sparaTiro`) più lo spin sommato dopo il clamp: **a
  registro come seguito**, non fatto qui — la calibrazione empirica già
  condanna il proprio bugiardo e non falso-positiva sul gioco vero, ma
  resta tarata sul comportamento di oggi, non su una costante del gioco.

  **LA MAPPA INV-01..15** (mandato, Appendice A — un mandato generico da
  simulatore 11-a-side; CALCETTO è futsal a taglia 5/7/11, molte INV non
  hanno un analogo, dichiarato onestamente invece di forzare una copertura
  che non c'è):
  - **QUI**: INV-02 (parziale — posizione finita e velocità/piano, non
    «una sola palla» né l'equivalenza in m/s del mandato), INV-15
    (durata<=tetto).
  - **QUI, ADATTATA**: INV-03 (la regola di casa è ">=2 uomini di
    movimento", non "mai <7" — CALCETTO è 5/7/11, non 11 fisso; e
    l'espulsione è temporanea in secondi, non permanente).
  - **QUI (parziale)**: INV-05 (timeLeft monotono; recupero calcolato e
    cambi-solo-a-fermo non modellati, N/A), INV-11 (clamp fiato/cond;
    "non crescente durante i fermi oltre il recupero base" non verificato
    esplicitamente, dichiarato SCOPERTO).
  - **ALTROVE**: INV-01 (`_q-determinismo.js`), INV-08 parziale
    (`_q-regole.js` per la sequenza cartellino; "i conteggi non
    diminuiscono mai" è vero per costruzione — unico sito `p.gialli++` —
    ma NESSUN banco lo asserisce oggi, SCOPERTO NON TESTATO), INV-10
    parziale (`_q-umore.js`, range con segno diversi dal mandato,
    dichiarati), INV-12 (il metodo due-versioni/disegno-puro dei cantieri
    di resa).
  - **RIMANDATA al fuzzer/soak**: INV-04 (confini di campo dei
    giocatori), INV-06 (validità del gol, non solo il conteggio), INV-07
    (ripresa di gioco dopo un fermo, palla nel punto giusto).
  - **N/A**: INV-09 (fuorigioco — non esiste in futsal), INV-13/INV-14
    (rete/submission — CALCETTO è locale, nessun multiplayer nel gioco).

  **TRE CAVEAT, IN CHIARO — candidati per il fuzzer (onda C-2).**
  (a) `G.swLock`/`G.swTimer` (dentro la prova 6) sono scritti SOLO da un
  cambio di controllo umano: un banco CPU-CPU come questo non li esercita
  mai attivamente, quindi la prova 6 resta DEBOLE proprio su quei due
  campi — verifica "sono a riposo dopo startMatch", non "vengono azzerati
  attivamente da qualcosa che li aveva sporcati" — finché un fuzzer con
  input umano-simulato non li mette sotto pressione vera.
  (b) Il tetto della prova 9 (sopra) è tarato empiricamente su CPU-CPU di
  serie, non ancorato a una costante del gioco: `TIRO_TETTO+spin` sarebbe
  più difendibile, a registro come seguito.
  (c) INV-08 ("i conteggi cartellino non diminuiscono mai") e INV-11
  ("fatica non crescente durante i fermi oltre il recupero base") sono
  scoperte-ma-non-testate: vere per come il codice è scritto oggi, ma
  nessuna prova lo asserisce esplicitamente — a registro, non testate qui.

  **#124 CHIUSO — il cambio di base di misura, dichiarato.**
  `strumenti/_c3-sorteggi.js` (:46-47) faceva l'errore #108
  (`setCpuVsCpu(true)` PRIMA di `startMatch`, che lo annulla
  incondizionatamente): la squadra 0 restava "umana immobile" invece di
  una CPU vera. Cura: scambio di due righe (`startMatch` PRIMA,
  `setCpuVsCpu(true)` DOPO), sul modello già applicato a
  `_q-battute.js`/`_q-regole.js`/`_q-umore.js` dal #121. **AVVISO
  dichiarato**: correggere l'ordine cambia la BASE DI MISURA di questo
  strumento, non il gioco — i totali dei sorteggi di ogni confronto
  futuro non sono più comparabili con quelli di prima della cura. Misurato
  su 15 partite identiche: ordine vecchio **300.424** sorteggi contro
  ordine nuovo **322.283** (la squadra 0 ora gioca davvero e tira i suoi
  dadi). I confronti storici RESTANO validi (erano simmetrici, entrambi i
  lati sbagliati allo stesso modo su ogni confronto passato), ma i NUMERI
  di oggi in poi non si confrontano con quelli di ieri senza dichiararlo.
  `_q-cpu-ordine.js` non intercetta questo difetto (verifica il gioco, non
  il codice degli strumenti): la correzione è stata a mano.

  **LA NON-SCOPERTA SULLA PALLA.** Nessuna violazione P0: `z>=0` è vero
  per costruzione (la fisica di volo, `updateBall`, integra `b.z` solo
  quando `b.z>0 || b.vz>0` e lo schiaccia a 0 non appena scenderebbe
  sotto), e la velocità resta sempre entro il tetto calibrato su 222.282
  fotogrammi di calibrazione, zero eccezioni. Un ramo che sembrava violare
  il tetto a un esame superficiale — il "furto col corpo"
  (`b.vx=(tx-b.x)*14`, fino a 5974 u/s osservati a schermo fermo) — è una
  CORREZIONE PER-FRAME verso il piede del portatore quando la palla è
  POSSEDUTA, non cinematica di volo: escluso di proposito dalla prova 9
  (che guarda solo `owner<0`), altrimenti il banco avrebbe prodotto un
  falso allarme sul suo stesso meccanismo di dribbling — la lezione
  #112/#114.

  **Batteria**: `_q-invarianti` (**9/9 verde**, OK in 12 s) registrato in
  `strumenti/tutti.js` (`conta:true`, modello `regole`/`umore`/
  `cpu-ordine`/`accessibile`, corre in compagnia). Batteria intera
  rilanciata (`strumenti/tutti.js`, corsa di default): **34 cancelli
  eseguiti in 588 s di orologio (2,3 volte più veloce che in fila), 33
  cancelli che contano tutti VERDI**; `audio.js` (lento, escluso dalla
  corsa di default) verificato a parte **28/28 VERDE** (stato dichiarato
  dal #122, non toccato qui); il solo informativo `istantanea.js` (non
  conta) **NO 46/56**, PEGGIORATO rispetto al registro del 20 agosto
  **per costruzione del confronto** (il riferimento era una prova NULLA,
  «nessuna quota da confrontare» — non un peggioramento di questo
  cantiere, lo stesso schema già dichiarato dalle voci #113/#114/#122) —
  **«VERDE CON RISERVA»** complessivo. `git diff CALCETTO-il-gioco.html`
  vuoto per l'intero cantiere: il gioco non è mai stato toccato (solo
  `strumenti/_q-invarianti.js`, `strumenti/_c3-sorteggi.js`,
  `strumenti/tutti.js`, questo verbale, il punto del lavoro). **Restano**:
  il fuzzer (onda C-2) e il soak (onda C-3), che useranno queste nove
  invarianti come rete; i tre caveat sopra come candidati specifici per il
  fuzzer; **#123** (fotosensibile per-regione) resta fuori onda, a
  registro.

- **La mira guidata a due pesi — #113 CHIUSO** (#113, 19 settembre 2026, tre
  compiti dal merge-base `d3169d3`, seguito §9.2 del mandato, chiude assieme
  al #114 la coppia di accessibilità scelta dal committente dopo quella
  voce). Spec `docs/superpowers/specs/2026-09-19-mira-guidata-design.md`,
  piano `docs/superpowers/plans/2026-09-19-mira-guidata.md`.

  **LA SCELTA (A), DICHIARATA.** «Mira guidata a due pesi» non è nel mandato
  grezzo (che al §9.2 parla di profili Beginner/Standard/Pro con
  auto-switch/auto-sprint/scudo) — è un conio della mappa di lavoro
  (`_analisi/MAPPA-MANDATO.md` righe 398-401). Fra tre interpretazioni la
  ricognizione ne ha messe tre sul tavolo, e il committente ha scelto **(A)**:
  due pesi sullo SCOPE del salto di controllo post-passaggio
  (`switchControlled`, meccanismo della voce #88), **NON** (B) un vero aiuto
  geometrico alla precisione del tiro/passaggio, **NON** (C) un ibrido dei
  due. **Perché non (B)/(C)**: entrambe avrebbero riaperto il codice
  geometrico tarato di #88 (il cono della filtrante `scegliFiltrante`,
  l'errore angolare di `fireShot`/`fireShotMirato`, 297 tiri misurati) — la
  parte più delicata e già collaudata del motore dei verbi. (A) non la tocca
  affatto: cambia solo CHI riceve il controllo dopo che la palla è già
  partita, non DOVE va la palla. È la scelta più snella e a rischio più
  basso, ed è per questo che il committente l'ha preferita.

  **IL MECCANISMO.** `switchControlled` esiste dalla voce #88 ed è SEMPRE
  attivo: dopo un passaggio/cross umano con un destinatario dichiarato
  (`b.passTo`/`b.crossTo`), il controllo salta a quel destinatario invece che
  al compagno più vicino alla palla. «Due pesi» = due AMPIEZZE di questo
  salto: **'pieno'** (comportamento di sempre — salta per QUALSIASI
  destinatario dichiarato, passaggio corto o cross) e **'essenziale'**
  (ristretto ai soli cross/palloni alti — sui passaggi corti a terra il
  salto non vale più, il controllo resta al compagno più vicino come se
  nessun destinatario fosse dichiarato). Non esiste uno stato "OFF": il
  salto è sempre esistito, questo cantiere lo rende configurabile in
  AMPIEZZA. `SAVE.miraGuidata` vive in `{'pieno','essenziale'}`, **default
  'pieno'** (additivo e sanificato con whitelist in `loadSave`, sul modello
  di `SAVE.sponde`/`vibInt`/`sott`): un salvataggio vecchio senza il campo
  rigioca bit-identico. Letto UNA VOLTA in `startMatch`
  (`G.miraGuidata = opts.miraGuidata || SAVE.miraGuidata || 'pieno'`) e mai
  più riletto da SAVE a partita in corso, come `G.campoVero`. La UI: una riga
  in IMPOSTAZIONI a due bottoni (pattern `vibInt`/`sponde`), aria-pressed
  sincronizzato, sottotitolo onesto («il controllo salta al ricevente solo
  sui palloni alti, non sui passaggi corti»).

  **LA CPU-CECITÀ, FIRMA DEL BASSO RISCHIO.** `switchControlled` salta già le
  squadre CPU per costruzione (`if(G.ctrl[t]<0) continue`, riga di guardia
  che esiste dalla #88): la mira guidata è strutturalmente scoped
  all'input UMANO, senza bisogno di nessuna guardia nuova. Il due-versioni
  CPU-CPU (`_c3-sorteggi.js`, base `fuori/base113.html` contro il curato,
  taglie 5/7/11) è **0/60 PER COSTRUZIONE** a entrambi i pesi — il ramo
  nuovo non gira mai in una partita CPU-contro-CPU, quindi non può spostare
  un sorteggio. È una garanzia più netta del canale MIND (#117), che invece
  divergeva per costruzione sulle stesse partite.

  **L'ESITO MOTORE_V: NON INCREMENTATO.** La prova PIENO-IDENTICO
  (`strumenti/_q-mira.js`) rigioca, col peso 'pieno' esplicito, le stesse
  due scene (un cross e un passaggio corto, seme 113001, taglia 5) sia sul
  gioco pre-cantiere (`fuori/base113.html`, dove `G.miraGuidata` non esiste
  affatto) sia sul gioco curato, e confronta **fotogramma per fotogramma**
  — controllo, pallone (posizione/velocità/quota/crossTo/passTo) e la
  posizione/velocità di TUTTI i ventidue giocatori, non solo il giudizio
  finale. Risultato: **0 differenze su 60 fotogrammi, su entrambe le
  scene** (120 campioni totali) — il percorso 'pieno' è dimostrato
  carattere per carattere identico a quello di ieri. `MOTORE_V` resta a
  **1**, invariato: nessun nastro vecchio smette di rigiocarsi identico.

  **IL LIMITE DELLE SFIDE ONLINE, A REGISTRO.** `Sfida.gioca`
  (`CALCETTO-il-gioco.html:42908`) e `Sfida.guarda` (:43095) forzano
  `miraGuidata:'pieno'` negli `opts` dello `startMatch` che aprono,
  esattamente come già forzano `sponde:'gabbia'` — ignorando il
  `SAVE.miraGuidata` locale di ciascun telefono. Senza questa riga, due
  telefoni con un peso locale diverso (uno 'pieno', l'altro 'essenziale')
  muoverebbero lo STESSO nastro su due motori diversi, e `chiudiSfida`
  imputerebbe lo scarto di punteggio al profilo cresciuto invece che al
  motore diverso — lo stesso ragionamento, e la stessa cura, di
  `sponde:'gabbia'` prima del seguito #105 (le sponde nel nastro). **LIMITE
  dichiarato**: la mira guidata non vale nelle sfide online in v1,
  **parallelo al seguito #105**, a registro finché le due non viaggeranno
  col nastro.
  **Verificato dal vivo** (compito 3, `Sfida.gioca` invocata con un
  risultato sintetico, bypassando la rete): con `SAVE.miraGuidata` locale
  impostato a **'essenziale'**, dopo `Sfida.gioca(r)` `G.miraGuidata` legge
  **'pieno'** — il SAVE locale è ignorato per costruzione. `_q-replay.js`
  prova B (la partita rigiocata è identica campione per campione) resta
  **verde** a peso fissato: **120 campioni** (due giri da 60), nessuna
  divergenza.

  **LA GIOCABILITÀ, MISURATA (seme 113001, taglia 5, input umano
  simulato — soglia di lettura 20 fotogrammi = 0,33 s).** Col peso
  'pieno': un cross fa saltare il controllo al fotogramma **13**, un
  passaggio corto ANCH'ESSO al fotogramma **13** — nessuna distinzione,
  il comportamento di sempre. Col peso 'essenziale': il cross salta
  ANCORA al fotogramma **13** (identico al pieno: l'aiuto sul pallone
  alto resta intatto, nessun nuovo fastidio introdotto lì), il passaggio
  corto **NON salta più** entro la soglia — il controllo resta al
  giocatore comandato dall'utente, e passa al compagno solo al fotogramma
  **32**, quando quello diventa DAVVERO il più vicino al pallone (il
  fallback naturale pre-#88, non il salto della mira guidata). Il
  "fastidio" che il progetto #88 §4.2 aveva previsto come possibile
  ripiego — il salto di controllo sui passaggi brevi — è risolto per chi
  sceglie 'essenziale', senza far perdere l'aiuto utile sui cross.

  **NOTA SU `_c3-sorteggi.js` (dal compito 1, riconfermata qui).**
  Invocato as-is, questo banco usa l'ordine sbagliato di `setCpuVsCpu`
  rispetto a `startMatch` — l'artefatto #108 (escluso dal censimento
  batteria di #121 perché non è uno dei banchi IN batteria): testa un
  lato CPU vera e un lato "umano" fermo, non due CPU vere l'una contro
  l'altra. Per codice condizionato su `G.ctrl` umano (come questo ramo,
  che salta solo se `G.ctrl[t]>=0`), l'ordine sbagliato può dare risultati
  fuorvianti se non corretto: il compito 1 ha osservato, su un confronto
  DIRETTO pieno-contro-essenziale (non il gate ufficiale) fatto con
  l'ordine invertito, **58/60** partite con un conto di sorteggi diverso —
  perché la squadra "umana ferma" resta dentro la guardia di
  `switchControlled` (`G.ctrl[t]>=0` anche senza nessun dito vero), e il
  peso decide quale giocatore resta "congelato" dopo un passaggio,
  cambiando quale IA smette di tirare dadi in proprio e quindi l'intera
  sequenza dei sorteggi successivi. Il gate ufficiale della voce #113 è un
  altro confronto — base113 contro il curato, ENTRAMBI forzati a
  'pieno' — e lì il verdetto non cambia con l'ordine: **0/60
  pieno-contro-pieno in ENTRAMBI gli ordini** (quello sbagliato del tool e
  quello corretto verificato a mano), perché i due file eseguono lo
  STESSO codice 'pieno' (PIENO-IDENTICO lo dimostra bit a bit) — qualunque
  cosa faccia la squadra "ferma", la fa identica su entrambi i lati, zero
  divergenza per costruzione. Si registra comunque il **seguito #124**
  (correggere l'ordine di `setCpuVsCpu` dentro `_c3-sorteggi.js`, sul
  modello della cura già applicata a `_q-battute.js`/`_q-regole.js`/
  `_q-umore.js` dal #121): finché non è corretto, ogni futuro banco che
  legge `_c3-sorteggi.js` su codice condizionato sull'input umano deve
  ripetere questa verifica a mano.

  **Il banco `strumenti/_q-mira.js`** (calco di `_q-volo.js`/`_q-battute.js`,
  seme 113001, taglia 5, zero `dado()` nuovi): SCOPE + SCOPE-BASE113 +
  PIENO-IDENTICO (compito 1), MIRA-UI-STILE + MIRA-ARIA (compito 2) — **5/5
  verdi**. Da questo compito **registrato in `strumenti/tutti.js`**
  (`conta:true`, sul modello di `regole`/`accessibile`/`umore`/
  `cpu-ordine`). **Cancelli**: `_q-mira` 5/5; `_c3-sorteggi` 0/60
  pieno-contro-pieno (entrambi gli ordini di `setCpuVsCpu`, vedi la nota
  sopra su #124); `_q-determinismo --partite 4` **13/13** (invariante del
  multigiocatore, intatta); `_q-replay` **10/10** (prova B verificata a
  peso fissato). **Batteria intera rilanciata con `_q-mira` dentro**
  (`strumenti/tutti.js`, corsa di default, file 1c562e6a4d49): **33
  cancelli eseguiti, 32 che contano tutti VERDI** (`mira` **OK, 12s, 5/5**
  compreso), l'unico informativo `istantanea.js` (non conta) **«NO»,
  46/56** contro il registro del 20 agosto — lo stesso schema noto già
  dichiarato in voce #122/#114 (il riferimento era una prova NULLA:
  «peggiorato» qui significa solo che oggi c'è una quota da confrontare,
  non che qualcosa di questo cantiere abbia spostato un pixel) —
  **PRE-ESISTENTE, non di questo compito**. `audio.js` e i lenti
  (`abbandono`, `volti`, `avvio`, `avvio-telefono`) restano fuori dalla
  corsa di default (`--tutto` per averli): `audio.js` verificato a parte,
  **VERDE dopo #122** (stato dichiarato, non toccato da questo cantiere).
  «VERDE CON RISERVA» complessivo, la stessa dizione delle voci #114/#122.
  `git diff CALCETTO-il-gioco.html` vuoto per l'intero cantiere (il file
  del gioco non è mai stato toccato da questo ultimo compito).

  **#113 CHIUSO.** Seguito nuovo: **#124** (l'ordine di `setCpuVsCpu` in
  `_c3-sorteggi.js`, sopra). Chiude, insieme al #114, la coppia di
  accessibilità voluta dal committente dopo la chiusura dell'onda B/MIND.

- **Il banco fotosensibile ancorato a WCAG — #114 CHIUSO** (#114) —
  **CURATA il 19 settembre 2026** (tre compiti dal merge-base `ebf6bb1`,
  seguito del #112: spec
  `docs/superpowers/specs/2026-09-19-fotosensibile-wcag-design.md`, piano
  `docs/superpowers/plans/2026-09-19-fotosensibile-wcag.md`):
  `strumenti/_q-fotosensibile.js` (nato col #112, compito 6, 18 settembre)
  smette di misurare su una soglia TARATA sul gioco di oggi (`PROMINENZA_MIN`)
  e misura ora sulle soglie CLINICHE di WCAG 2.3.1 "Three Flashes or Below
  Threshold" (Livello A), W3C Recommendation WCAG 2.2, **5 ottobre 2023**
  (invariata da WCAG 2.0, 11 dicembre 2008) —
  https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html.

  **Le soglie, con fonte e data**:
  - **General flash threshold**: un flash è una coppia di transizioni
    OPPOSTE nella luminanza relativa di almeno **0,10** (10% della
    luminanza relativa massima, 1,0), dove la luminanza del più scuro
    dei due estremi che la delimitano è **sotto 0,80**.
  - **Criterio d'area**: il flash conta per 2.3.1 solo se l'area
    combinata dei flash concorrenti supera **0,006 steradianti (25% di
    un campo visivo di 10 gradi)** — risoluzione di riferimento WCAG:
    rettangolo 341x256 px su schermo 1024x768 px, cioè **2,7751%**
    dello schermo di riferimento (341×256×0,25 / (1024×768) =
    0,0277506...; il commento del compito 2 nel banco arrotondava a
    2,7753%, un refuso di calcolo a mano di due decimillesimi, corretto
    in questo compito — `strumenti/_q-fotosensibile.js:437-455`).
  - **Red flash threshold**: coppia di transizioni opposte dove almeno
    uno dei due stati ha **R/(R+G+B) >= 0,8** (sui byte sRGB grezzi) e
    la distanza fra i due stati nel diagramma di cromaticità CIE 1976
    UCS (u',v') supera **0,2**.
  - **Luminanza relativa WCAG** (glossario,
    https://www.w3.org/TR/WCAG22/#dfn-relative-luminance):
    `L = 0,2126·R + 0,7152·G + 0,0722·B`, dove per c in {R,G,B}:
    `csRGB=c/255`, `c_lin = csRGB/12,92` se `csRGB<=0,04045` (soglia IN
    VIGORE, corretta dal W3C nel 2021-2022 rispetto al vecchio 0,03928
    di WCAG 2.0/2.1 — si cita quella attuale, non quella superata,
    studi a edizioni), altrimenti `c_lin = ((csRGB+0,055)/1,055)^2,4`.
  - Harding/PEAT/broadcast (ITU-R BT.1702, Ofcom — Fulton et al., ACM
    TACCESS 2024/25, PMC11872230): usano cd/m2 assoluti e pattern
    spaziali a strisce — **fuori perimetro** (CALCETTO non ha strisce ad
    alto contrasto pulsanti; cd/m2 dipende dal display, non misurabile a
    banco). La cifra ITU-R esatta della revisione in vigore NON è stata
    verificata sul documento originale: non si cita un numero clinico
    non verificato.

  **Il banco, riscritto in tre compiti**: (1, 19 settembre) `__luce()`
  misura ora la luminanza relativa WCAG VERA (LUT di linearizzazione
  gamma per canale, 256 valori, calcolata una volta all'installazione),
  non più la media pesata sui byte sRGB grezzi del #112; il rilevatore
  (`trovaFlashWCAG`, su `trovaEstremi`) sostituisce `PROMINENZA_MIN=1,5`
  con la definizione clinica — coppie di transizioni opposte sugli
  estremi locali della serie, senza sovrapposizione, finestra di un
  secondo, verdetto **<=3 flash in ogni finestra = <=3 Hz**. (2) Il
  criterio d'area (`SOGLIA_AREA_FRAZ`, 2,7751%) filtra A VALLE i flash
  già rilevati dalla media (non un rilevatore d'area indipendente: uno è
  stato provato e scartato, misurato falso positivo 4-7%/s su SERA senza
  nulla iniettato — dichiarato nel commento del banco); il red flash
  (`trovaRedFlashWCAG`) è un canale indipendente sulla saturazione rossa
  media, stessa lettura di `__luce()`, nessun secondo giro sui pixel.
  (3, questo compito) la verifica autorevole e il verbale.

  **I numeri veri, misurati oggi** (seme 112601, canvas 915×412,
  `node strumenti/_q-fotosensibile.js` / `--controllo` / `--calibra`):
  - **`--controllo` (il cancello obbligatorio)**: GRANDE (lampo bianco a
    schermo intero, 4 Hz) **ROSSO** — 15 flash rilevati, tutti sopra
    soglia d'area (100% di picco), **5 flash/s di picco** (cadenza vera
    4,000 Hz esatti; il 5 è un effetto di bordo della finestra chiusa
    [-0,5s,+0,5s] su un segnale a passo esatto — dichiarato nel commento
    del banco, non un artefatto nascosto). PICCOLO (quadratino 100×100 px
    sotto soglia d'area + lavaggio di sfondo sotto soglia d'ampiezza
    pixel-per-pixel) **VERDE** — 15 flash rilevati ma **tutti e 15
    esenti** (area di picco 2,65%, sotto soglia 2,7751%): l'esenzione
    d'area esenta DAVVERO, non è solo "invisibile alla media". RED FLASH
    (schermo intero, #ff0000, 4 Hz) **ROSSO** su entrambi i canali — 5
    flash/s generali e 5 red flash/s di picco. Verdetto complessivo del
    comando `--controllo`: **1 prova verde su 3, per costruzione** — è
    il risultato atteso (due condanne, un'esenzione), non un fallimento.
  - **Le sei scene reali, verifica autorevole di questo compito** (gol
    ravvicinati, sera, dischetto; moto on/off), **TUTTE VERDI**:
    - gol moto=on: 1 flash rilevato, 1 sopra soglia d'area (33,14% di
      picco), **1 flash/s** di picco (a t=3,82 s); 0 red flash. La festa
      del gol (schermo intero) qualifica per area ma resta a 1/s per il
      tetto strutturale della sua durata (>1,25 s, blocca una nuova
      festa finché non torna in play) — sotto 3 Hz per costruzione.
    - gol moto=off: 0 flash rilevati (il lampo/raggi sono dietro
      `SAVE.moto`); 0 red flash.
    - sera moto=on/off: 0 flash rilevati (area di picco 0,00% — la
      scena "più chiara" per i fari non legge mai come lampo: la sua
      escursione whole-canvas misurata, 0,0062/0,0077, resta un ordine
      di grandezza sotto la soglia 0,10); 0 red flash.
    - dischetto moto=on/off: 0 flash rilevati (DUEL_FLASH, escursione
      misurata 0,0022/0,0023, anch'essa un ordine di grandezza sotto
      soglia); 0 red flash.
    Nessuna scena supera 3 flash/s su nessun canale: **il gioco PASSA
    tutte le soglie WCAG 2.3.1 (generale + area + red flash) sulle scene
    provate, a seme fisso** — la verifica autorevole promessa dallo spec.
  - **La saturazione rossa massima misurata** su tutte le tinte-maglia
    del gioco (kit fissi + tutte le squadre CPU della rosa) è **0,649** di
    R/(R+G+B) (#7a4200) — sotto 0,80 anche a schermo intero: nessuna
    combinazione d'area farebbe mai qualificare una tinta di questo gioco
    per il red flash. Sulle sei scene di oggi la saturazione osservata
    resta fra 0,235 e 0,320, molto più bassa. (Rettifica di revisione, 19
    settembre 2026: il valore **0,623** scritto al compito 2 era #ff4d4d,
    un accento d'interfaccia, non una maglia; il massimo vero fra le
    maglie è 0,649 — comunque ben sotto 0,80, la conclusione non cambia.)

  **IL LIMITE, IN CHIARO** (la disciplina di casa: i limiti si
  dichiarano, non si nascondono dietro un verdetto verde):
  **(a)** il criterio d'area è **PREVALENTEMENTE FORMALE per questo
  gioco**: folla e duello (CROWD_FLASH, DUEL_FLASH) sono già sotto la
  sensibilità della MEDIA whole-canvas PRIMA che il filtro d'area entri
  in gioco — la loro escursione misurata (0,0092/0,0062/0,0077/0,0023,
  tutte sotto la soglia di flash 0,10) non li fa nemmeno rilevare come
  flash, non serve l'area a esentarli. È il limite già dichiarato dal
  compito 1, non chiuso da un puro filtro a valle (per costruzione
  aritmetica: v. il commento "IL DUBBIO ONESTO SUL FILTRO A VALLE" nel
  banco).
  **(b) ESISTE UN BUCO TEORICO**: il banco rileva i flash sulla MEDIA
  whole-canvas, quindi un lampo che copra fra il ~2,77% e il ~10% dello
  schermo ad alta frequenza sarebbe una violazione WCAG (l'area basta, la
  frequenza pure) che QUESTO banco NON coglie — quell'area non sposta la
  media abbastanza da qualificare come flash sulla luminanza whole-
  canvas, quindi la media non lo vede affatto (né come flash "esente",
  proprio come flash). Il gioco di oggi NON ha una sorgente in quella
  fascia (folla/duello <2% del canvas → esenti/invisibili per
  costruzione; il lampo del gol è ~100% del canvas → ampiamente
  rilevato), quindi il verdetto VERDE è **corretto PER QUESTO GIOCO** —
  ma il banco non è un analizzatore WCAG COMPLETO: per coprire quella
  fascia servirebbe il rilevamento PER-REGIONE (una griglia di celle,
  ciascuna con la propria serie di luminanza, non la sola media whole-
  canvas). Registrato come **seguito #123 (rilevamento fotosensibile
  per-regione)**.
  **(c)** il red flash, sulla saturazione media whole-canvas, soffre
  dello STESSO limite (b) — un red flash confinato a una piccola area
  che sposti la media sotto la sensibilità del rilevatore non verrebbe
  visto — e non ha nemmeno un filtro d'area PROPRIO (dichiarato già al
  compito 2). Innocuo per QUESTO gioco (saturazione massima delle
  tinte-maglia 0,649, sotto soglia anche a schermo intero — nessuna
  combinazione d'area la farebbe mai qualificare) ma non è una garanzia
  generale.

  **RETTIFICA A EDIZIONI** della frase del #112 (sopra in questo stesso
  registro, voce #112, "IL LIMITE DEL BANCO, DICHIARATO"): quella
  diceva «nessuno strobo FORTE oltre 3 Hz» su una soglia TARATA
  (`PROMINENZA_MIN=1,5`), dichiarando già allora di non garantire
  "fotosensibile-safe" in senso clinico — non si cancella, si rettifica
  in chiaro (con la data accanto, vedi il paragrafo aggiunto lì). **Da
  oggi (19 settembre 2026, voce #114)**: il banco è **conforme a WCAG
  2.3.1 sulle scene provate** (metrica di luminanza relativa vera,
  soglie cliniche 10%/0,80 + il criterio d'area + il red flash), coi
  limiti di copertura della media whole-canvas dichiarati sopra
  (punti a/b/c).

  **#114 CHIUSO**: le soglie sono ancorate a WCAG 2.3.1, non più tarate
  sul gioco di oggi. **Seguito nuovo #123** (rilevamento fotosensibile
  per-regione): estendere il banco a una griglia di celle indipendenti
  per chiudere il buco teorico (b) — non bloccante (il gioco di oggi non
  ha una sorgente nella fascia scoperta, misurato sopra).

  **Cancelli**: verifica autorevole (sopra) **sei scene su sei VERDI** a
  seme fisso; `--controllo` **1/3 per costruzione** (GRANDE e RED FLASH
  condannati, PICCOLO esentato — il verdetto atteso, non un fallimento);
  batteria (`strumenti/tutti.js`, `fotosensibile` registrato `conta:true`
  dal #112, invariato — dà il suo verdetto sulle sei scene, non su
  `--controllo`): eseguita per intero, **`fotosensibile` OK in 42 s**,
  **31 cancelli su 31 che contano tutti VERDI** (nessun rosso nuovo).
  `audio.js` (lento, escluso dalla corsa di default) verificato
  SEPARATAMENTE (`node strumenti/audio.js`): **28/28 VERDE** — il rosso
  pre-esistente del #120 resta curato dal #122, nessun rosso residuo da
  dichiarare. Il solo informativo `istantanea.js` (non conta) segna
  «NO» contro un riferimento NULLO del 20 agosto (nessuna quota vera da
  confrontare — pattern già noto, non un peggioramento di questo
  cantiere): verdetto complessivo «VERDE CON RISERVA», coerente con le
  corse precedenti (voce #112, #122). `git diff CALCETTO-il-gioco.html`
  vuoto in tutto il cantiere (tre compiti, zero righe toccate: banco
  puro, nessuna decisione di gioco).

- **Spiccioli di seguito: la parata, il sottotitolo onesto e la freccia che
  non copre il fiato** (#122) — **CURATA il 19 settembre 2026** (tre compiti
  dal merge-base `470149a`, cantierino di chiusura pendenze minori deciso dal
  committente dopo #117/#121; piano
  `docs/superpowers/plans/2026-09-19-spiccioli-seguiti.md`):

  **1. #120 — la parata ritrova il suo clack** (un difetto del BANCO, non del
  gioco): lo scenario "parata del portiere" di `strumenti/audio.js`
  teletrasportava il pallone verso il portiere senza azzerare
  `b.lastTouch`/`b.toccoPiede`. La guardia del retropassaggio (voce #107,
  `CALCETTO-il-gioco.html:19504-19505`) leggeva quello stato sporco e
  rifiutava il tiro come autopassaggio: `tentaPresa` non raggiungeva nessun
  esito e `Audio5.clack` (chiamato incondizionatamente a `:19650`) non
  scattava mai. Cura: `b.lastTouch=-1; b.toccoPiede=false;` accanto agli
  altri azzeramenti del pallone nello stesso scenario, PRIMA che la
  simulazione giri. Cancello: `node strumenti/audio.js` **28/28** (era
  27/28), "parata del portiere" verde con `clack:true` emesso. Il gioco non
  è toccato (`git diff CALCETTO-il-gioco.html` vuoto).

  **2. #116 — il sottotitolo dice solo il vero**: le due stringhe identiche
  del bottone SOTTOTITOLI («fischio, gol, palo — a video»,
  `CALCETTO-il-gioco.html:3677` e `:42096`, nate col compito 4 di #112)
  promettevano più di quanto `SAVE.sott` governi davvero — l'helper
  `sottotitolo()` protegge solo i tre fischi (inizio/fine/ripresa); GOL e
  PALO hanno banner sempre attivi, chiamati bare via `showBanner()`, mai
  spenti dal flag. Cura: «fischio — a video», due sostituzioni verbatim via
  attrezzo `strumenti/_t-sott-onesto.js`.

  **3. #115 — la freccia non mangia più il fiato**: dentro
  `anelloComandato(p)`, l'arco lime del fiato (voce #112, compito 5) si
  disegnava PRIMA della freccia di direzione, sulla STESSA ellisse — quando
  la corsa cadeva nella porzione accesa dell'arco, il cuneo pieno della
  freccia poteva coprirne un tratto. Cura: ordine di disegno invertito (la
  freccia PRIMA, l'arco del fiato DOPO, sopra di lei) — nessuna geometria
  toccata, stessi `arx`/`ary`, stesso centro, stesso angolo di partenza, la
  stessa proporzione `p.fiato/100`. Via attrezzo
  `strumenti/_t-freccia-fiato.js` (un ancoraggio, che sposta anche il
  commento originale insieme al suo codice, così la spiegazione resta
  accanto al disegno che descrive davvero). `strumenti/_q-accessibile.js`,
  prova 7 (ANELLO-FIATO), estesa con un confronto DIFFERENZIALE a fiato
  55/70: la stessa frazione si misura due volte, stesso fiato — una con la
  freccia nel margine sempre spento (il riferimento "pulito" già usato dai
  tre confronti originali), una con la freccia DENTRO la zona accesa.
  **RILIEVO ONESTO**: il cuneo della freccia si restringe dalla base (dove
  è largo ~53°) alla punta, e l'arco vive quasi alla punta — l'overlap VERO
  sul tratto sottile è molto più stretto dei 53° nominali (misurato: ~0,03
  di scarto su 360 campioni, non i ~15 punti che 53/360 farebbe pensare); un
  confronto ASSOLUTO con la tolleranza 0,05 delle altre righe non l'avrebbe
  mai scoperto — il confronto differenziale (soglia 0,015) sì, verificato a
  mano sul gioco PRE-#115 (diff 0,0333 a entrambi i fiato, ROSSO) e sul
  gioco corrente (diff 0,0000, VERDE).

  **Cancelli comuni a #116/#115**: due-versioni (`_c3-sorteggi`, base
  `470149a` contro la punta, taglie 5/7/11) **0/60**; `_q-determinismo`
  **10/10** intatto; `_q-accessibile.js` **7/7**; `istantanea.js` — stesso
  identico schema OK/NO prima e dopo (47 OK, 10 NO, nessuna riga cambiata).
  Attrezzi verificati a specchio: applicati a
  `git show 470149a:CALCETTO-il-gioco.html` riproducono
  `CALCETTO-il-gioco.html` byte per byte. Zero `dado()`/decisione CPU
  toccati in tutte e tre le cure — contorno puro, come il piano chiedeva.

- **Il registro dei fatti e il MIND v1 — L'ONDA B COMINCIA** (#117) —
  **CURATA il 19 settembre 2026** (sei compiti dal merge-base `f352af5`,
  prima voce dell'onda B del mandato: `_analisi/MAPPA-MANDATO.md` §2,
  spec `docs/superpowers/specs/2026-09-19-mind-v1-design.md`, piano
  `docs/superpowers/plans/2026-09-19-mind-v1.md`): il modello emotivo che
  il mandato mette al centro (§7) — un registro dei fatti passivo, tre
  stati continui che li osservano, un canale che li fa contare sulle
  decisioni della CPU entro tre tetti dichiarati, due canali d'occhio che
  li rendono sempre visibili, e un banco che condanna chi bara.

  **LA CONFERMA, non l'invenzione**: `p.celeb` e `p.mesto` erano già due
  stati emotivi PRIMA di questo cantiere (trigger il gol, decadimento a
  passo fisso, espressione nelle clip di posa) — il mandato §7.4 lo
  conferma. Il MIND v1 non li inventa: li rende l'espressione di stati
  CONTINUI (umore/nervi/spinta, aggiornati ogni fotogramma dai fatti)
  invece che di un unico trigger puntuale.

  **1. Il registro dei fatti** (`G.fatti`): un buffer PASSIVO, tetto 200
  con push+shift (modello di `G.rec`), che trascrive quindici tipi di
  evento già decisi altrove dal gioco (gol/autorete/rigore/giallo/
  espulsione/rubata/fallo/presa/pugni/sfugge/respinta/parata/legno/
  acciacco/cambio) con lo schema `{che,chi,dove,esito,t}`. Non decide
  niente: il conteggio dei fatti combacia ESATTAMENTE con `G.stats`/
  score/`G.cambi` per gli eventi che il gioco già contava altrove.

  **2. Gli stati**: `p.umore` (-1..+1) e `p.nervi` (0..1) per giocatore,
  `G.spinta[team]` (-1..+1) per squadra — derivati dai fatti, zero
  `dado()`, decadimento a mezza vita (30 s per gli stati del giocatore,
  20 s per la spinta di squadra via media mobile esponenziale),
  moltiplicatore di tempo continuo `1+0,6·(1-timeLeft/durata)` che
  scalda il finale.

  **3. Il canale di gioco — `manopolaDi(p)`**: qui il MIND comincia a
  contare sulle decisioni della CPU (mai sul dito umano — la squadra
  umana resta senza carattere). Tre manopole, formula identica per le
  due squadre, ritorno neutro esatto a stati zero:

  | manopola | formula | fattore dichiarato (tetto) | effetto REALE sul valore | massimo osservato dal banco (5 partite CPU-CPU, taglia 5) |
  |---|---|---|---|---|
  | passErr | base ÷ (1+0,15·umore) | ±15% | umore=+1: **-13,04%** (base/1,15); umore=-1: **+17,65%** (base/0,85) — ASIMMETRICO: la divisione non rispetta il fattore dichiarato dalla formula | ~~15,00% (esattamente al tetto)~~ EDIZIONE PRECEDENTE, ora **15,00%** (invariato, ri-ancorato 19/9/2026, voce #121 compito 2, vedi nota sotto) |
  | slideP | base × (1+0,25·nervi) | +25% | nervi=+1: **+25,00%** esatto — la moltiplicazione fa coincidere fattore ed effetto | ~~18,49% (sotto tetto)~~ EDIZIONE PRECEDENTE, ora **11,57%** (ri-ancorato 19/9/2026, vedi nota sotto) |
  | standoff | base × (1-0,12·spinta), guardia ≥0 | ±12% | spinta=+1: **-12,00%**; spinta=-1: **+12,00%** — moltiplicazione, simmetrico, fattore ed effetto coincidono | ~~8,44% (sotto tetto)~~ EDIZIONE PRECEDENTE, ora **10,08%** (ri-ancorato 19/9/2026, sotto tetto 12%, vedi nota sotto) |

  **NOTA SULLA COLONNA "MASSIMO OSSERVATO" (studi a edizioni)**: i tre
  numeri barrati sono stati misurati al compito 6 di #117 con
  l'ARTEFATTO #108 aperto in `_q-umore.js` (`setCpuVsCpu(true)` chiamato
  PRIMA di `startMatch`, riscritto subito da `startMatch`: la squadra 0
  restava "umana immobile", solo la squadra 1 giocava da CPU vera). Il
  cantiere #121 (compito 2, 19 settembre 2026) ha corretto l'ordine nei
  5 siti del banco: la squadra 0 gioca ora da CPU vera anche lei, più
  eventi, partite diverse, nuovi massimi. I tetti dichiarati (±15%/+25%/
  ±12%, colonna "fattore dichiarato") sono proprietà della FORMULA, non
  della partita: NESSUNO dei due scenari li supera, cambia solo il
  massimo osservato. Dettaglio nel registro qui sotto (voce #121,
  compito 2).

  **AVVERTENZA PER CHI LEGGE SOLO LA RIGA DEL FATTORE** (rilievo del
  revisore del compito 3): la prova TETTI del banco misura il FATTORE
  della formula (`|0,15·umore|`, simmetrico ±15%), non l'effetto reale
  sul valore. passErr dichiara "±15%" ma il valore vero si sposta fino
  al **17,65%** quando l'umore è negativo, perché la formula limita
  simmetricamente il fattore, e la DIVISIONE non è simmetrica come la
  moltiplicazione (slideP e standoff, dove fattore ed effetto
  coincidono).

  **4. I due canali d'occhio**: `p.mesto` si accende anche dai fatti
  negativi (non solo dal gol subìto), un uomo per volta per squadra;
  la folla sale con la spinta di chi attacca, con banner "TESTA ALTA"/
  "CI CREDONO" sui cambi di scalino — disegno/audio puri, rispettano
  `SAVE.moto` (MOVIMENTO RIDOTTO).

  **5. Il banco che condanna** (`strumenti/_q-umore.js`, nuovo, ora in
  batteria): nato ROSSO con la sola prova REGISTRO al compito 1,
  cresciuto compito per compito, arrivato a **30 prove su 30** verdi
  (REGISTRO, STATI, CANALE, TETTI, TESTIMONE, SPECCHIO, INPUT-SACRO) —
  le due versioni bugiarde costruite apposta (`_crit-mind-tetto.js` sul
  coefficiente di passErr, `_crit-mind-muto.js` sul canale mesto) lo
  condannano ciascuna sulla propria prova: il banco discrimina, non
  attesta.

  **6. La giocabilità, misurata non stimata** (`strumenti/_eventi.js`,
  prima=`f352af5` dopo=la punta del cantiere, 300 partite CPU-CPU per
  versione, stessi semi 20260803..20261102, taglia 5, Normale — la
  numerosità più grande usata, per stabilizzare un conteggio a piccoli
  interi):

  | voce | prima (mediana / media) | dopo (mediana / media) | delta sulla media |
  |---|---|---|---|
  | gol nei 90 s | 3,00 / 2,72 | 2,50 / 2,63 | **-3,3%** |
  | MOMENTI DA PORTA al minuto | 3,88 / 3,87 | 3,43 / 3,76 | -2,8% |
  | EVENTI al minuto (tutti) | 63,8 / 63,7 | 63,6 / 63,5 | -0,3% |
  | durata gioco vivo (s) | 92,5 / 96,9 | 92,5 / 96,5 | -0,4% |
  | tiri per partita | 13,0 / 13,7 | 13,0 / 13,6 | -0,7% |
  | parate per partita | 2,0 / 1,9 | 2,0 / 1,8 | -5,3% |

  **VERDETTO DEL COMMITTENTE: DENTRO BANDA.** Il MIND cambia il feel per
  disegno (è il suo scopo) ma non lo stravolge: -3,3% su gol/90s, ben
  dentro il ±20% di guardia.

  **NOTA METODOLOGICA ONESTA**: la MEDIANA di "gol nei 90 s" è un cattivo
  indicatore a questo campione — è un conteggio a piccoli interi (0-7 a
  partita) e vale +50% a N=30, -33% a N=100, -17% a N=300: tre segni e
  ampiezze diverse sulla STESSA coppia di versioni, puro rumore di
  campionamento sulla mediana di una variabile discreta a bassa
  numerosità. La MEDIA è stabile su tutte e tre le numerosità (-2,3% a
  N=30, -1,1% a N=100, -3,3% a N=300): è la media, non la mediana,
  l'indicatore di feel da leggere qui.

  **L'HANG #119** (bug preesistente, non di questo cantiere): guidando la
  prova REGISTRO del banco (una partita CPU-CPU vera, seme del cantiere
  20260919, taglia 5), la partita si è bloccata in scena 'freekick' dopo
  13.200 fotogrammi simulati (220 s, il tetto di sicurezza del banco)
  senza mai raggiungere 'end' — misurato direttamente, non dedotto. Nella
  misura di giocabilità sopra (860 partite CPU-CPU in tutto fra le due
  versioni, semi 20260803..20261102 a N=30/100/300 più un controllo di
  60 partite a un seme lontano, 20250000..20250059) **zero partite su
  860** si sono bloccate su nessuna delle due versioni: l'hang non si è
  manifestato in questo campione, quindi il confronto prima/dopo resta
  diretto, senza bisogno di scartare semi né di misurare su finestre
  parziali. Seguito **#119** aperto per un cantiere dedicato: è un
  difetto del motore (preesiste su `f352af5`), non del MIND.

  **7. La divergenza dei sorteggi, dichiarata per taglia**
  (`_c3-sorteggi.js`, `f352af5` contro la punta, 20 partite per taglia,
  tre invocazioni isolate — atteso: DIVERGENZA, il canale del compito 3
  cambia le decisioni della CPU): taglia 5 **18/20** partite divergenti
  (103.573 → 101.201 sorteggi totali); taglia 7 **19/20** (222.495 →
  208.468); taglia 11 **20/20** (274.986 → 275.325). Totale **57/60**,
  dichiarato per costruzione, non un difetto. `_q-determinismo --partite
  4` resta **13/13** (stessa versione, stesso seme, due corse identiche —
  l'invariante che serve al multigiocatore, intatta).

  **8. IL SESTO CRONOMETRO FRATELLO — UNA REGRESSIONE TROVATA E RIPARATA
  RILANCIANDO LA BATTERIA INTERA** (quinta occorrenza della lezione
  ricorrente: #86/#87/#107/#112 ne avevano già pagata una). La prima
  esecuzione della batteria intera su questo ramo ha trovato
  `strumenti/_q-replay.js` **ROSSO** sulla prova E ("registrare non
  cambia il gioco"): accendere il registro del nastro spostava la fisica
  della STESSA partita a seme fisso dal fotogramma 80 circa. Bisecato sui
  quattro compiti: verde su `cb23512` (compito 1) e `53007c5` (compito
  2), rosso da `8824222` (compito 3) in poi — nato dentro questo
  cantiere. La CAUSA VERA è però un difetto PRE-ESISTENTE del motore, non
  del canale MIND: `G.swLock`/`G.swTimer` (l'isteresi del cambio-
  giocatore automatico, `switchControlled`) sono dichiarati una volta
  sola nell'oggetto `G` iniziale e non venivano MAI azzerati da
  `startMatch` — la stessa malattia dei "cinque cronometri fratelli" di
  `G.recT` (riparata il 31 agosto 2026) e di `G.vantaggio` (voce #107):
  la fase sopravviveva da una partita all'altra sulla STESSA pagina. Si
  vede solo dal compito 3 perché prima `aiMove` leggeva `manopoleDi(p.team)`
  — la stessa manopola per tutti e undici, indifferente a chi è
  controllato in quel momento — mentre `manopolaDi(p)` è la prima lettura
  a far dipendere una decisione della CPU da QUALE giocatore specifico è
  sotto controllo umano: la fase residua di `G.swLock` sposta di alcuni
  fotogrammi il cambio automatico, e la differenza si propaga nella
  fisica. **Irrilevante per ogni misura CPU-CPU di questo verbale**
  (`switchControlled` esce subito quando `G.ctrl[t]<0`, cioè quando
  `setCpuVsCpu(true)` toglie il controllo umano a entrambe le squadre —
  verificato: i numeri di giocabilità e i totali dei sorteggi ai punti 6
  e 7 sono IDENTICI, cifra per cifra, prima e dopo la cura), riguarda
  solo la squadra umana di una sfida vera. Cura (`strumenti/_t-swlock-reset.js`,
  un ancoraggio, zero sorteggi nuovi): `G.swLock=[0,0]; G.swTimer=[0,0];`
  accanto ai cinque cronometri fratelli in `startMatch`. Verificata:
  `_q-replay.js` **10/10** su tre corse di controllo (era 9/10), `_q-umore.js`
  ancora **30/30**, `_q-determinismo --partite 4` ancora **13/13**.
  **L'altro rosso della prima esecuzione, `audio.js`** (27/28, "parata
  del portiere → crowdLevel×N jingleTick" atteso `clack:true` — l'N
  esatto oscilla di corsa in corsa, 8 o 9, ma la riga che fallisce e il
  verdetto no), è **PRE-ESISTENTE**: riprodotto IDENTICO su `f352af5`
  (stesso fallimento, prima ancora che questo cantiere cominciasse) —
  non una regressione di #117, fuori perimetro di questa cura (voce di
  audio/folla scollegata dal MIND). Seguito **#120** aperto
  per chi vorrà indagarlo.

  **Cancelli**: `_q-umore.js` **30/30**; `_eventi.js` (giocabilità)
  dentro banda; sorteggi dal merge-base **57/60 divergenti per
  costruzione** (dichiarato); `_q-determinismo --partite 4` **13/13**;
  `_q-replay.js` **10/10** (dopo la cura del punto 8). Batteria intera
  (`strumenti/tutti.js`, ora con `umore` registrato, `conta:true`)
  rilanciata a fine cantiere, DOPO la cura del sesto cronometro: **36
  cancelli eseguiti**, **33 con un verdetto valido che conta** (esclusi
  `istantanea` e `avvio`, informativi/`conta:false`, e `avvio-telefono`,
  PROVA NULLA — nessun telefono collegato in questo ambiente) — **32
  verdi, 1 rosso** (`audio.js`, il punto 8, pre-esistente e fuori
  perimetro). Nessun altro rosso: `replay` è tornato verde con la cura.

  **SEGUITI**: **#118 (MIND v2)** — contagio nel tempo e peso del
  capitano, regolazione senza intervallo, capitano che rallenta, la
  striscia del momento post-partita, il volto che cambia, il dischetto
  sotto pressione, l'HUD dell'umore (tutto il "Fuori perimetro" dello
  spec, mai assorbito qui); **#119 (l'hang del freekick)** — un cantiere
  dedicato al bug del motore misurato sopra, che colpisce entrambe le
  versioni allo stesso modo; **#120 (l'audio della parata)** — il rosso
  pre-esistente di `audio.js` (punto 8), scollegato dal MIND, mai
  indagato prima d'ora perché mai emerso finché la batteria intera non è
  stata rilanciata su questo file.

- **Spiccioli di UX e accessibilità — L'ONDA A SI CHIUDE** (#112) —
  **CURATA il 18 settembre 2026** (sei compiti dal merge-base `73c1c64`,
  ultima voce dell'onda A del mandato: `_analisi/MAPPA-MANDATO.md` aree 4
  e 6, spec `docs/superpowers/specs/2026-09-18-spiccioli-ux-design.md`):
  sei cure di puro contorno — nessuna tocca `dado()`, una decisione di
  gioco o uno stato che la CPU legge — più il banco che sorveglia la
  fotosensibilità.

  **1. Le etichette parlano allo screen reader**: `aria-pressed`
  sincronizzato con lo stato su tutti e **5** gli interruttori `.voce.sw`
  di IMPOSTAZIONI (stesso booleano di `refreshImpostUI`), e il
  rettangolo del banner — buco preesistente che `istantanea.js` contava
  come ombra sul manto — **dichiarato in `zoneInterfaccia()`**.

  **2. La vibrazione ha tre intensità**: `SAVE.vibInt` (0/1/2, default 1,
  additivo e sanificato come `sponde` di #87), `buzz(p)` scala la durata
  per `[0.5,1,1.6][vibInt]` prima di `navigator.vibrate`, ON/OFF resta.
  **Corretta in revisione**: la riga dei tre bottoni copiava solo
  markup e JS del pattern difficoltà, non il CSS — lo stato selezionato
  era invisibile a schermo pur essendo giusto in memoria — nuova prova
  **VIBRAZIONE-STILE** (via `getComputedStyle`) che protegge ogni
  `.diff-row` futura dallo stesso buco stato-logico-contro-rendering.

  **3. RIVEDI IL TUTORIAL**: voce nel pannello ingranaggio che azzera
  **entrambi** `SAVE.tutorialDone` e `SAVE.tutorialVisto` (azzerare solo
  il primo lo richiuderebbe subito, la trappola che la prova
  **RIVEDI-TUTORIAL** verifica fino a `Tut.active===true` al kickoff 1
  giocatore — e `false` a 2 giocatori, con gli stessi flag); sottotitolo
  onesto («lo rivedi alla prossima amichevole a un giocatore»), la
  macchina `Tut` e la sua guardia non toccate.

  **4. I sottotitoli degli eventi sonori**: `SAVE.sott` (default 1),
  interruttore con `aria-pressed`, e le chiamate a `sottotitolo()`
  **aggiunte ai 4 fischi che ne erano privi** (inizio, fine, le due
  ripresa gemelle dopo un gol) — gli altri **9 siti di codice** con
  banner preesistente non toccati e non spenti dal flag (**correzione
  di revisione del compito 6**: 13 occorrenze `Audio5.whistle(` totali
  − 4 curate = 9; il numero scritto qui prima, 11, contava
  RIMESSA/ANGOLO/RINVIO come tre voci mentre sono UN solo sito di
  codice — `showBanner(tipo.toUpperCase(),...)` — con tre varianti
  testuali dello stesso evento, non tre siti distinti).

  **5. L'anello del fiato**: arco parziale dentro `anelloComandato`,
  sulla stessa ellisse dell'ambra, quarta tinta lime
  (`rgba(190,255,120,.85)`), pieno a `p.fiato`=100 e degenere a 0,
  buco della palla ereditato per costruzione dallo stesso `clip` —
  **misurato pixel per pixel** (0,000 / 0,419 / 0,828 a fiato 0/40/80),
  non attestato.

  **6. Il banco della fotosensibilità** (`strumenti/_q-fotosensibile.js`,
  nuovo): misura la frequenza dei lampi **a schermo intero** su tre
  sorgenti — non solo la folla, il «falso troppo gentile» che le regole
  di casa mettono in guardia (§19) — `CROWD_FLASH`, `DUEL_FLASH` e il
  lampo+nove raggi del gol (l'unico che copre l'intero schermo, spento
  da `SAVE.moto` mentre i due flash di folla e dischetto non lo sono mai:
  provati entrambi gli stati). Sei scene (gol ravvicinati, sera a fari
  accesi come controllo negativo, il dischetto — ciascuna a moto acceso
  e spento) tutte **verdi** (mai più di 1 lampo in nessuna finestra di un
  secondo, contro un tetto di 3); un caso `--controllo` che inietta un
  lampo vero a 4 Hz **condannato** (picco di 5 lampi nella stessa
  finestra) — la prova che il banco discrimina invece di attestare.
  Registrato in batteria (`strumenti/tutti.js`, `conta:true`), insieme a
  `_q-accessibile.js` (7/7, censito nel piano ma mai registrato prima
  d'ora).

  **IL LIMITE DEL BANCO, DICHIARATO** (correzione di revisione del
  compito 6): il banco filtra i lampi per ESCURSIONE di luminanza
  (`PROMINENZA_MIN=1,5`, sulla scala 0-255 della luminanza percettiva
  0,2126R+0,7152G+0,0722B) PRIMA di contarne la frequenza — è quindi
  cieco a uno strobo la cui escursione resti sotto quella soglia, a
  QUALUNQUE frequenza (dimostrato in revisione: una serie iniettata a
  5 Hz con ampiezza 1,4 dà 0 lampi rilevati, VERDE; da 1,6 in su
  condanna). È corretto in principio — un lampo che non raggiunge la
  soglia di escursione non è un flash clinicamente pericoloso — ma la
  taratura è **sul gioco di oggi**, e le sorgenti reali deboli (folla,
  dischetto) stanno a cavallo della soglia. La frase onesta: il banco
  garantisce «nessuno strobo FORTE (escursione oltre soglia) oltre
  3 Hz», NON «il gioco è fotosensibile-safe» in senso assoluto (regola
  di casa: non vendere più di quello che la misura garantisce). Limite
  registrato come noto, seguito **#114**: ancorare `PROMINENZA_MIN` a
  una soglia clinica documentata (tipo WCAG/Harding, sull'escursione di
  luminanza relativa) invece che sulla taratura odierna del gioco.

  **RETTIFICA A EDIZIONI (19 settembre 2026, voce #114)**: il seguito
  promesso nel paragrafo sopra è stato fatto — non si cancella il
  paragrafo, si rettifica (studi a edizioni). `PROMINENZA_MIN` non
  esiste più nel banco: la frase «nessuno strobo FORTE (escursione oltre
  soglia) oltre 3 Hz» descrive il banco DI ALLORA (18 settembre), non
  quello di oggi. Da oggi il banco è **conforme a WCAG 2.3.1 sulle scene
  provate** (metrica di luminanza relativa vera, soglie cliniche
  10%/0,80, il criterio d'area, il red flash), coi limiti di copertura
  della media whole-canvas dichiarati in chiaro — fonti, date, numeri e
  il limite per esteso nella voce **#114** più sotto in questo registro.

  **UNA REGRESSIONE TROVATA E CURATA CHIUDENDO IL CANTIERE**: eseguendo
  per la prima volta la batteria intera su questo ramo (nessun compito
  precedente aveva `disposizione.js` nell'elenco dei cancelli da
  sorvegliare), `disposizione.js` — già in batteria da prima di #112,
  verde sul merge-base — risultava **ROSSO** sul gioco di oggi: «1
  ORFANO, 1 BUCATA» sulla riga di SOTTOTITOLI. Causa vera: prima del
  compito 4 la sezione «Accessibilità» del pannello IMPOSTAZIONI aveva
  due voci (MOVIMENTO, ALTO CONTRASTO), un numero pari che riempiva la
  griglia a due colonne; il compito 4 ha aggiunto SOTTOTITOLI come terza
  voce, dispari, lasciando l'ultima orfana sulla propria riga — la
  stessa forma di difetto per cui il CSS aveva già una cura generica
  pronta (`.setwrap>.sola{grid-column:1/-1}`, scritta apposta: «chi
  domani aggiunge una sezione da una voce scrive `class="voce sola"` e
  ha finito»), mai applicata quando serviva. Curata via attrezzo a àncore
  (`strumenti/_t-sottotitoli-sola.js`, un ancoraggio: aggiunge `sola` alle
  classi del bottone, nessuna riga di CSS nuova, nessun'altra voce
  toccata) — `disposizione.js` torna **VERDE**, due-versioni ancora
  **0/60**, `_q-accessibile` ancora **7/7**, `_q-determinismo` ancora
  **13/13**: la cura è puro CSS, zero `dado()`.

  **IL DUE-VERSIONI 0/60 DELL'INTERO CANTIERE, LA FIRMA DEL CONTORNO**:
  `_c3-sorteggi.js` dal merge-base `73c1c64` a HEAD, taglie 5/7/11,
  **0 partite su 60 con un conto di chiamate a `dado()` diverso**
  (567.871 = 567.871) — nessuna delle sei cure, in nessuno dei sei
  compiti, ha spostato un solo sorteggio. `_q-determinismo --partite 4`
  **13/13**. È la promessa che l'intero piano aveva scritto in testa: il
  contorno non tocca la simulazione.

  **I DUE MINORI DEL COMPITO 4, CHIUSI QUI NEL TESTO**: (a) GOL non usa
  `showBanner` ma un overlay canvas proprio (`G.banner` viene azzerato al
  gol) — il flag SOTTOTITOLI non lo controlla e non potrebbe: GOL, PALO
  e FALLO/CARTELLINO restano **sempre visibili**, a prescindere da
  `SAVE.sott`, esattamente come i banner di casa già mostravano prima di
  questa cura. Il sottotitolo del flag copre solo i **fischi** (inizio,
  fine, ripresa, vantaggio) che ne erano privi. (b) Il sottotesto del
  bottone («fischio, gol, palo — a video») può far credere che il flag
  governi anche gol e palo: non è così, e questa nota lo chiarisce in
  chiaro — un sottotesto più onesto (solo «fischio») è una rifinitura
  futura, non bloccante.

  **ONDA A DICHIARATA CHIUSA.** Le cinque voci del programma approvato
  dal committente (`_analisi/MAPPA-MANDATO.md`, «Le decisioni del
  committente») sono tutte curate: **#86** (la vernice, le proporzioni
  ufficiali del campo, chiusa il 7 settembre), **#85** (la moviola
  fluida, chiusa il 7 settembre), **#87** (rimesse laterali e calci
  d'angolo, chiusa il 18 settembre), **#107** (le regole a leva corta e
  la versione del motore nel nastro — chiude anche la voce #96, chiusa
  il 18 settembre), **#112** (questi spiccioli di UX e accessibilità,
  chiusa oggi). Cosa resta: **l'onda B** (il registro dei fatti,
  prerequisito, e MIND v1). Seguito nominato **#113** (MIRA GUIDATA a
  due pesi sull'intent-resolution di #88, mandato §9.2, 2 g — tocca
  l'intent-resolution del gameplay, quasi una feature: fuori perimetro
  del contorno); **seguito #115** (correzione di revisione del compito
  6: numerato invece che lasciato in prosa) per i due residui a
  registro dall'anello del fiato (compito 5): la freccia di direzione,
  disegnata sopra la stessa ellisse, può coprire ~53° di lime quando la
  corsa cade nella zona accesa; la leggibilità della quota intermedia
  (55% contro 70%) non è stata misurata oltre i due estremi.

  **Cancelli**: `_q-accessibile.js` **7/7**; `_q-fotosensibile.js`
  **6/6** (verde sul gioco, `--controllo` condannato **0/1**, come deve);
  `disposizione.js` tornato **VERDE**; `_q-determinismo --partite 4`
  **13/13**; due-versioni dal merge-base **0/60** a tutte le taglie
  (5/7/11). Batteria intera (`strumenti/tutti.js`, ora con `accessibile` e
  `fotosensibile` registrati) eseguita in 8 spezzoni — 28 cancelli a
  quattro alla volta più i due cronometrici (`giocata`, `prestazione`)
  da soli — **29 cancelli che contano, tutti verdi**; il solo
  informativo `istantanea.js` (non conta) segna «VERDE CON RISERVA»
  contro un registro fermo al 20 agosto (una prova nulla, nessuna quota
  vera da confrontare — non un peggioramento di questo cantiere).

- **Le regole a leva corta, e la versione del motore nel nastro** (#107) —
  **CURATA il 18 settembre 2026** (quattro compiti dal merge-base `cabf7e4`,
  prima voce dell'onda A del mandato: `_analisi/MAPPA-MANDATO.md` aree 1 e
  5, spec `docs/superpowers/specs/2026-09-18-regole-leva-corta-design.md`;
  attrezzi ad ancore per compito in `strumenti/_t-*.js`: `_t-rigore-area`
  (1), `_t-retropassaggio` + `_t-tocco-guardia` (2, correzione di
  revisione), `_t-vantaggio` + `_t-vantaggio-taratura` + `_t-card-non-si-
  perde` (3, con la chiusura arbitrale), `_t-nastro-versione` (4)): quattro
  regole vere con le leve già in casa, e il nastro delle sfide impara la
  sua versione.

  **1. Il rigore legge l'area vera** (compito 1): la decisione che apre il
  duello (`checkSlideContact`) leggeva `zonaCalda = |goalX-p.x| < 260`, una
  fascia 1D fissa; ora legge `dentroArea(carrier.team,p.x,p.y)`, l'area
  vera del ramo #86. Divergenza scelta nella BANDA-Y (non nella banda-x
  173-260, che a 7/11 si inverte perché `areaProf` la supera): a x=60
  (dentro fascia e area a ogni taglia) è la y a decidere — confine
  dell'area a 64/104/304 unità (5/7/11), 30 unità oltre = fuori. `zonaCalda`
  muore nel codice (0 usi vivi, il commento a edizioni la nomina per
  dichiararne la morte).

  **2. Il portiere rifiuta il retropassaggio** (compito 2): `b.toccoPiede`,
  bandiera nuova scritta a ogni tocco del pallone — **17 siti censiti**
  (`kickBall`, scivolate, contrasti, raccolte: piede; testa, furto-corpo,
  prese, rinvii: non-piede) più la GUARDIA aggiunta in revisione
  (`segnaTocco` senza flag esplicito → `false`, mai un default ereditato
  dal tocco precedente). `tentaPresa` nega la presa con le mani su un
  passaggio di piede di un COMPAGNO e **respinge da corpo** invece di un
  `return` nudo (la prima stesura lasciava la raccolta generica dare
  comunque possesso — bocciata dal banco stesso): il pallone resta vivo,
  mai posseduto. Divergenza vera dichiarata per taglia: **3/20 (5), 7/20
  (7), 2/20 (11)** partite con un conto di sorteggi diverso. `_eventi`
  (compito 2): gol/90s **2,50 → 2,50**, invariato.

  **3. Il vantaggio esiste** (compito 3, con taratura F1/F3 e chiusura
  arbitrale): un fallo la cui azione prosegue apre `G.vantaggio` invece di
  fischiare subito; se la squadra offesa CONSERVA e avanza fino a `VANT_T`
  (2,5 s di moto libero dal momento in cui il fallito si rialza — F1),
  banner VANTAGGIO e cartellino pendente; se la perde, fischio ritardato
  dal punto SALVATO (F3: il sostituto viene co-locato, la punizione REGGE
  nel tempo, non solo nel fotogramma del fischio). **LA CONTABILITÀ
  ARBITRALE, RETTIFICATA** (sonda a quadratura, CPU-vero-contro-CPU-vero —
  vedi «il giro che insegna» sotto): **~1 finestra/partita**, sfumato
  **67,1% → 65,2%**, **PIENO 26,2% → 26,8%** (26-27%), silenzioso 3,4% →
  5,1%, cascata 2,0% → 2,2%. F1 elimina le morti-lampo dello sfumato (età
  reale sotto 0,6 s: **30% → 0%**) al prezzo dichiarato di `VANT_T` reale a
  2,867 s. Il SENTINEL curato (W1): un secondo fallo su un vantaggio già
  CONCESSO (il sentinel `{team:-1,...,card}` che porta il cartellino in
  differita) fischiava subito invece di aprire la propria finestra —
  **5,0% → 0,0%** dei falli (misurato 4,7% → 0,0% sulla contabilità
  indipendente), guardia `G.vantaggio && G.vantaggio.team>=0`. Il
  cartellino non muore più sovrascritto (micro-coda): il sentinel pendente
  si scarica PRIMA che una finestra nuova lo rimpiazzi. Falli/partita
  **~1,0** (148/150, CPU vera contro CPU vera). Banco `_q-regole.js` a
  **12/12** dopo il compito 3.

  **IL GIRO CHE INSEGNA, coi numeri rettificati in chiaro**: la prima
  misura dell'implementatore diceva "vantaggio pieno 0/260, 93% degli
  sfumati morti al primo controllo"; la rimisura del correttore dava 28% e
  NON riproduceva lo zero; l'ARBITRO (sonda indipendente a quadratura, semi
  dichiarati) ha trovato la CAUSA VERA — `setCpuVsCpu(true)` chiamato
  PRIMA di `startMatch(...)` viene annullato in silenzio da
  `G.cpu=[false,true]`, scritto dentro `startMatch` stesso: la squadra 0
  restava un "umano" immobile per tutta la partita, e nessun difensore
  vero tentava mai di rompere una conservazione — **un banco che congela
  una squadra misura il banco, non il gioco** (lezione a registro, vedi
  «Le regole pagate» in `PUNTO-DEL-LAVORO.md`). **SEGUITO #108**:
  l'idioma sbagliato (`setCpuVsCpu` chiamato prima di `startMatch`) vive,
  committato, in **dieci strumenti** (`strumenti/_c3-sorteggi.js`,
  `_crit10-nome.js`, `_crit10-sorteggi.js`, `_crit10-tab.js`,
  `_crit8-caccia.js`, `_crit8-foto.js`, `_crit8-pixel.js`,
  `_crit8-radar.js`, `_crit8-sonda.js`, `_crit8-velo.js`) — i confronti
  DUE-VERSIONI fatti con questi strumenti RESTANO validi (simmetrici: A e
  B girano sotto lo stesso banco congelato), ma nessuno di quegli scenari
  era mai stato CPU-CPU vero. Proposta di cura lato gioco (`setCpuVsCpu` a
  prova d'ordine: l'intento si memorizza e si consuma dentro `startMatch`
  qualunque sia l'ordine di chiamata) con una NOTA sulla comparabilità
  storica — cambierebbe la semantica di tutte le corse due-versioni
  passate appoggiate a quell'idioma — **decisione del committente**, non
  applicata in questo cantiere.

  **4. Il nastro conosce il suo motore, e la voce #96 SI CHIUDE** (compito
  4): `MOTORE_V = 1` (costante nuova accanto a `Reg`/`SEME`, con commento:
  sale di uno a ogni ramo che tocca la simulazione; nasce a **1**, non a
  0, perché i rami #87 e #107 hanno già cambiato il motore prima che
  questa costante esistesse — ogni nastro di ieri è già invalido di
  fatto). `Reg.serializza()` porta la versione in un campo di testa nuovo
  (`'1|MOTORE_V|tasti|pezzi'`, subito dopo il marcatore di formato che
  c'era già — nessun tipo-riga nuovo, il posto meno invasivo);
  `Reg.deserializza()` la legge, e un nastro SENZA quel campo (3 pezzi
  invece di 4: ogni nastro di prima di oggi) vale **versione 0**, mai un
  errore — retro-compatibilità provata (`_q-replay.js`, prova A: scritto,
  riletto e riscritto, stesso testo). `Sfida.guarda()` confronta
  `Reg.motoreV` con `MOTORE_V` SUBITO dopo la lettura, PRIMA di
  `startMatch`: se non combaciano, il messaggio dice la CAUSA VERA
  ("questa partita è stata giocata con un'altra versione del motore...
  non quella che hai subito davvero") invece dell'accusa sbagliata "la
  squadra è cambiata da allora" che `chiudiSfida` avrebbe dato lasciando
  correre la partita fino in fondo. ZERO PENALITÀ dichiarata e verificata:
  nessuna partita si avvia (`sfidaStato.replay` resta `false`), nessun
  punto, nessuna classifica, nessun invio al server (un replay non paga
  comunque) — si perde solo il film, come il caso già esistente del
  duello dal dischetto (`fermaReplayAlDischetto`). Banco `_q-regole.js`
  guadagna la **tredicesima prova, NASTRO-VERSIONE**: un nastro artefatto
  a versione 0 rigiocato via `Sfida.guarda` con dati finti (`Rete.replay`
  sostituita, zero rete vera) chiude col messaggio onesto e zero
  penalità; un nastro a versione corrente (preso dal gioco stesso, non
  scritto a mano) rigioca come sempre. NATA ROSSA sulla base pre-cura
  (`700f775`): **12/13**, la sola tredicesima rossa (un nastro vecchio
  passava per buono e avviava la partita).

  **L'ESPERIENZA DEL PRIMO AVVIO DOPO L'AGGIORNAMENTO** (m10, onda di
  correzione della revisione finale, 18 settembre 2026): al primo avvio
  dopo che il motore è salito di versione, OGNI replay ancora in lista
  registrato prima dell'aggiornamento è a versione 0 (o comunque diversa
  da `MOTORE_V` di oggi) — non uno alla volta, tutti insieme, perché
  nessuno di loro porta il campo nuovo. Non c'è un avviso unico per
  l'intera lista: il messaggio onesto compare quando il giocatore APRE
  quel replay (`Sfida.guarda`, non al solo caricamento della lista), UNA
  VOLTA per quel replay — e la stessa riga che mostra il messaggio scrive
  anche `this.vistoQui[id]=1` PRIMA di ridipingere (`dipingi()`), cosicché
  quel replay smette di comparire come "nuovo/non visto" nella lista da
  quel momento in poi. Riaprirlo una seconda volta mostra di nuovo lo
  stesso messaggio onesto (non è un divieto, resta un film che si può
  rileggere): quello che cambia è solo il badge di lista, non l'accesso.

  **Perché `Sfida.gioca`/`chiudiSfida` restano fuori dal perimetro di
  questo controllo (rilievo Minore, correzione di revisione del compito
  4)**: non è una svista, è per costruzione. `Sfida.gioca` (~42182) CREA
  un nastro nuovo — `Reg.accendi()` da zero, mai `Reg.deserializza()` su
  uno vecchio — quindi nasce già alla versione di oggi, non c'è nulla da
  confrontare. `chiudiSfida` (~42487) serializza sempre col `MOTORE_V`
  corrente di chi chiude la partita, mai con uno letto da altrove. Il
  caso del motore diverso è già stato intercettato PRIMA, dentro
  `Sfida.guarda`, che non arriva mai a chiamare `startMatch` (e quindi
  mai a `chiudiSfida`) quando `Reg.motoreV !== MOTORE_V`.

  **La voce #96 (cancello di pubblicazione) SI CHIUDE**: la condizione
  originaria (6 settembre 2026, §"La giornata del 6 settembre") era
  DISGIUNTIVA — "il nastro porta la versione del motore, **o** il
  messaggio dice la causa vera (entrambe le cause possibili, mai solo il
  profilo)" — non una congiunzione. RETTIFICA (onda di correzione della
  revisione finale, voce #107, m9/#96, 18 settembre 2026): una lettura
  precedente di questa voce l'aveva citata con una "e", come se
  servissero entrambi i pezzi; bastava UNO solo. Consegnato il PRIMO
  disgiunto per intero (`MOTORE_V` nel nastro, `Sfida.guarda` che
  intercetta prima di `startMatch`): gia' sufficiente da solo a
  soddisfare la condizione e a chiudere la voce. Il SECONDO disgiunto —
  `chiudiSfida` che dichiari da sola entrambe le cause possibili
  (profilo cambiato O motore cambiato) quando il punteggio non torna —
  NON e' stato fatto: `chiudiSfida` continua a citare solo il profilo
  cambiato, perche' il caso motore-diverso e' ormai intercettato PRIMA,
  dentro `Sfida.guarda`, e non arriva mai fin li'. Soddisfatta e provata
  dal banco. Il prossimo APK si sblocca. Le
  voci #104/#105/#106 restano aperte.

  **Cancelli**: `_q-regole.js` **13/13** (12/13 sulla base `700f775`,
  la sola NASTRO-VERSIONE rossa); `_q-determinismo --partite 4` **13/13**;
  `_q-replay.js` **10/10** (il round-trip serializza→deserializza,
  prova A, regge il formato nuovo). Sorteggi complessivi del cantiere dal
  merge-base `cabf7e4` (DIVERGE per costruzione, tre regole nuove sulla
  simulazione): taglia 5 **19/20** (100.829→100.838 chiamate a `dado()`),
  taglia 7 **20/20** (213.679→227.627), taglia 11 **18/20**
  (275.636→286.471). `regole` registrato in batteria (`strumenti/tutti.js`,
  `conta:true`); batteria intera verde in 4 spezzoni, **28 cancelli che
  contano, tutti verdi** (2+11+8+7 — `proporzioni` incluso a pieno titolo,
  vedi la RETTIFICA datata qui sotto). `_eventi.js` dal merge-base, 60
  partite: gol/90s **2,50 → 2,50** (+0%, dentro la soglia ±20% dello
  spec), falli/partita **1,0 → 1,0** (+0%); vantaggi PIENI/partita
  **~0,25** (misurato dalla sonda arbitrale del compito 3 — `_eventi.js`
  non ha una colonna dedicata, dichiarato). Banchi di contorno:
  `_q-battute` 11/11, `_q-precedenza` 9/9, `_q-volo` 11/11.

  **RETTIFICA DATATA (correzione di revisione del compito 4, 18
  settembre 2026)**: il paragrafo qui sopra, come lo aveva scritto il
  compito 4, dichiarava «27 cancelli che contano» e diceva l'uscita
  BANCO di `proporzioni` «pre-esistente e non una regressione» —
  **entrambe le affermazioni erano false**, trovate dal ri-verdetto
  della revisione. Il colpevole non era il gioco, era il BANCO: lo
  scenario PUGNI di `strumenti/_q-proporzioni.js` chiama `startMatch`
  UNA sola volta e poi teletrasporta il pallone addosso al portiere
  4000 volte SENZA MAI azzerare `b.lastTouch`/`b.toccoPiede`, che
  restano quello che il calcio d'inizio aveva scritto — un tocco di
  piede di un COMPAGNO del portiere. La guardia del retropassaggio
  (giusta, nata nel compito 2, `tentaPresa` riga ~19192) nega quindi le
  mani ad ogni singolo tentativo: **0/4000 rami PUGNI**, su tutte e tre
  le taglie. Non era pre-esistente al cantiere: è nata insieme a quella
  stessa guardia, in **81d8c59 (compito 2 di QUESTO cantiere)** —
  «pre-esistente» era vero solo confrontato con la base immediata del
  compito 4 (`700f775`, già successiva al compito 2), mai col
  merge-base `cabf7e4`. È rimasta invisibile perché fra il compito 2 e
  il compito 4 nessuno aveva rilanciato la batteria intera che include
  `proporzioni` — la stessa lezione del «giro che insegna» sul
  vantaggio, qui sopra, un'altra volta (vedi anche «Le regole pagate»,
  lezione 21, in `PUNTO-DEL-LAVORO.md`). Cura, SOLO nel banco, non nel
  gioco: ogni tentativo arma `b.lastTouch` su un AVVERSARIO del
  portiere (`segnaTocco`) prima del teletrasporto, perché il pugno che
  questo banco misura è sempre stato, semanticamente, un tiro
  avversario — mai un compagno che passa al proprio portiere. Prova che
  il gioco non era mai stato colpevole: banco curato **30/30 verde su
  HEAD E su `81d8c59`** (`git show 81d8c59:CALCETTO-il-gioco.html`).
  Zero `dado()` toccati dalla cura: `_c3-sorteggi.js` fra la base del
  compito 4 e HEAD, taglie 5/7/11, **0/60** — la cura è solo banco più
  documenti, come atteso.

  Verbale completo: spec `docs/superpowers/specs/2026-09-18-regole-leva-
  corta-design.md`, piano `docs/superpowers/plans/2026-09-18-regole-leva-
  corta.md`, rapporti `.git/sdd/brief/107-compito-*-report.md`.

  **ONDA DI CORREZIONE DELLA REVISIONE FINALE** (voce #107, ramo
  `voce-107-regole-leva-corta`, 18 settembre 2026, un commit). La
  revisione finale del ramo (dopo il compito 4) ha misurato un rilievo
  **CRITICO** e tre **Importanti**, più una postilla di metodo.

  **C1 (CRITICO) — il retropassaggio non mordeva a taglia 11.** Il ramo
  di respinta di `tentaPresa` riposizionava il pallone a `(P_R+B_R)*
  dist_` dal portiere; la raccolta generica di `updateBall` lo riafferra
  a `d<KICK_R*0.8` (**20,8**, `KICK_R` è una COSTANTE fissa, mai scalata
  dalla taglia). La tavola `CORPI` dà `P_R+B_R=21` a 5/7 — un margine di
  **0,2 unità: un rasoio** — ma **solo 7,5** a 11 (`P_R=5, B_R=2.5`): la
  palla respinta restava DENTRO il cerchio della raccolta, e il portiere
  la riprendeva un fotogramma dopo per la via generica (misurato: presa
  al fotogramma 99). Il retropassaggio, curato al compito 2, **non
  mordeva mai** a quella taglia. CURA: il raggio diventa
  `Math.max((P_R+B_R)*dist_, KICK_R*0.8+0.5)` — la respinta esce SEMPRE
  dal cerchio della raccolta, a ogni taglia. **Il pavimento non è
  innocuo nemmeno a 5/7**: con la respinta ravvicinata (`dist_=1`, il
  portiere in piedi, non a metà di un tuffo) il raggio pre-cura era
  esattamente **21** (`(P_R+B_R)*1`), e il pavimento nuovo lo alza a
  **21,3** (`KICK_R*0.8+0.5`) — un morso piccolo ma vero anche dove il
  margine sembrava già sufficiente (il rasoio di 0,2 unità sopra), ed è
  parte del perché il confronto due-versioni diverge **3/20** a taglia
  5 (Cancello 3 sotto), non zero. Cancello:
  `_q-regole.js --taglia 11` — le prove **3 (RETRO-PRESA) e 7
  (RETRO-FERMO) diventano VERDI** (rosse prima della cura); a taglia 5
  resta **16/16** (13+3, vedi I2/I3/I5 sotto).

  **I2 — il cartellino non attraversava le partite.** `startMatch` non
  azzerava `G.vantaggio`: un sentinel con un cartellino pendente
  (`{team:-1,...,card}`, lasciato da un vantaggio CONCESSO per intero
  nella partita precedente) sopravviveva, e `resetKickoff` (dentro
  `startMatch` stesso) lo leggeva già con la rosa NUOVA —
  `scaricaCardVantaggio()` ammoniva un giocatore INNOCENTE al fischio
  d'inizio della partita nuova (misurato). CURA: `G.vantaggio=null;`
  accanto a `G.rigori=null`. Prova nuova **CARD-NON-ATTRAVERSA**
  (quattordicesima), nata rossa su `b837824`.

  **I3 — la palla ferma non perdonava due volte.** `setScene` scaricava
  il cartellino pendente ANCHE con una finestra di vantaggio ANCORA VIVA
  (`team>=0`): un pallone spedito fuori campo durante la finestra faceva
  sparire il cartellino SENZA fischio né punizione — il **5,1%
  "silenzioso"** della contabilità arbitrale del compito 3, mai spiegato
  allora. CURA, in tre parti: (a) il ramo SFUMATO di `step()` (era
  inline) si estrae nella funzione `eseguiSfumato(vTeam,vx,vy)`; (b)
  `pallaFuori()`, PRIMA di costruire la battuta, intercetta una finestra
  ANCORA VIVA e le dà l'esito vero — SFUMATO, fischio ritardato dal
  punto salvato, **il fallo originario vince sulla rimessa**, come la
  regola vera; (c) `setScene` scarica il cartellino SOLO per il
  sentinel (`G.vantaggio.team<0`). Prova nuova
  **PALLA-FUORI-IN-FINESTRA** (quindicesima), nata rossa: fallo →
  finestra viva → palla spedita fuori → fischio dal punto salvato
  (punizione rapida o duello, secondo l'area), NIENTE battuta,
  cartellino (se dovuto) al fischio. **Questa cura chiude anche il
  seguito #111** (sotto): il caso "silenzioso" sarebbe stato altrimenti
  un follow-up aperto, ed è invece assorbito qui per intero.

  **I4 — il censimento vero di #108, e la PROVA 1 resa robusta.** Il
  censimento del compito 3 ("dieci strumenti") era incompleto: il conto
  vero è **25 file** sotto `strumenti/` che chiamano `setCpuVsCpu`
  PRIMA di `startMatch` (misurato per pattern, non per sospetto),
  COMPRESI **`_q-regole.js` (15 siti a HEAD — erano 11 a `b837824`: le
  prove nuove di quest'onda ne hanno aggiunti 4) e `_q-battute.js` (5
  siti)** — entrambi **IN BATTERIA** (`strumenti/tutti.js`, `conta:true`), non
  strumenti diagnostici isolati. Conseguenza pratica: applicare oggi la
  cura di #108 (ordine `setCpuVsCpu`/`startMatch` a prova d'ordine)
  farebbe CADERE la PROVA 1 (RIGORE-DENTRO) di `_q-regole.js`, perché
  con la CPU vera il duello verrebbe battuto e lo stato al fotogramma
  200 non sarebbe più `freekick`. **RISCRITTA (I4b)**: l'asserzione
  della PROVA 1 non legge più lo stato FINALE, legge se la scena
  `freekick` è stata ATTRAVERSATA in qualunque fotogramma (campionata a
  ogni passo) — verde oggi, e robusta a un futuro #108. Vedi **#110**
  sotto.

  **#108 CHIUSO su `_q-regole.js` e `_q-battute.js` (voce #121, compito
  1, 19 settembre 2026)**: applicata qui la stessa cura #108 (ordine
  `setCpuVsCpu`/`startMatch`) a `_q-regole.js` (15 siti) e
  `_q-battute.js` (5 siti). `_q-battute.js` riletto riga per riga:
  **11/11 verde**, nessuna partita bloccata in `freekick`, numeri
  ri-ancorati (squadra 0 ora CPU vera). `_q-regole.js`, con la sola cura
  dell'ordine, si scopriva **15/16**: la PROVA 1 (RIGORE-DENTRO, I4b) —
  proprio quella già riscritta per essere "robusta a un futuro #108" —
  tornava ROSSA, ma non per un hang in `freekick` (il sintomo #108/
  #119): lo stato non attraversava mai `freekick`, la scena finiva
  direttamente in `goal` ("freekick vista: false ... stato al
  fotogramma 200: goal"). Causa: con la difesa (squadra 0) davvero
  mobile, il vantaggio in area a volte si chiude con un gol della
  squadra offesa prima che l'arbitro fischi il rigore ritardato — un
  esito LECITO della regola del vantaggio (voce #107, già decisa: se
  l'offesa segna nella finestra, il rigore non si batte più), non un
  bug. L'asserzione I4b ("solo freekick attraversata") era tarata su
  uno scenario a squadra 0 congelata e non copriva questo esito.
  **RISCRITTA (#121)**: l'invariante diventa "freekick attraversata
  OPPURE gol della squadra OFFESA nella finestra" (si verifica DI CHI è
  il gol via `t.score`, non un gol qualsiasi — un gol della squadra che
  ha commesso il fallo resterebbe rosso), condannando ancora l'esito
  illecito (stabilizzarsi in `play`/punizione rapida come se il fallo
  fosse fuori area, la condanna gemella di PROVA 2). Con la riscrittura,
  `_q-regole.js` **16/16 verde**, letto riga per riga, nessuna partita
  bloccata in `freekick`. Gli altri ~22 strumenti del censimento dei 25
  (archivio, fuori batteria) restano APERTI, fuori dal perimetro di
  questa voce (vedi `docs/superpowers/specs/2026-09-19-pulizia-108-
  design.md`).

  **#108 CHIUSO anche su `_q-umore.js` (voce #121, compito 2, 19
  settembre 2026, RISCHIO CONCRETO dichiarato dal progetto)**: stessa
  cura, 5 siti (`:335-336`, `:636-637`, `:715-716`, `:850-851`,
  `:886-887` — REGISTRO/STATI, CANALE, TETTI, NIENTE-FALSI-BANNER,
  SPECCHIO). Qui il rischio non era teorico: le prove TETTI/TESTIMONE
  misurano su partite CPU-CPU REALMENTE giocate, e con la squadra 0
  congelata i tetti erano stati misurati su una CPU sola, non due.
  Corretto l'ordine, **`_q-umore.js` 30/30 verde**, riletto riga per
  riga. Nessuna partita bloccata in `freekick`: la partita di REGISTRO/
  STATI/TESTIMONE finisce in `end` a 6427 fotogrammi (punteggio 0-2); le
  5 partite di TETTI finiscono tutte in `end` (6425/6121/8019/7920/7107
  fotogrammi, verificato con uno script diagnostico ad hoc che riproduce
  il solo ciclo — il banco stesso non stampava lo stato finale per
  partita) — coerente con la diagnosi #119 (esperimento A: ordine giusto
  → 0/31 bloccate). SPECCHIO resta insensibile all'ordine (le sei coppie
  gemelle si iniettano da stati ancora a zero, prima di qualunque
  simulate() con eventi veri) e INPUT-SACRO resta a **0 violazioni** (il
  numero di chiamate a `manopolaDi` sale a 19536 in questa corsa, la
  squadra 0 ora gioca davvero e produce più attività, ma la garanzia — 0
  chiamate per il comandato dal dito — non dipende dal conteggio). I due
  bugiardi (`_crit-mind-tetto.js`, `_crit-mind-muto.js`) restano
  condannati con un rosso localizzato: il primo dà **28/30** (rosso su
  `a-tetti` e `b-canale`, la stessa formula di passErr forzata da 0,15 a
  0,60), il secondo **29/30** (rosso SOLO su `a-testimone`, il canale
  mesto spento) — il banco discrimina ancora.
  **RI-ANCORAGGIO DEI MASSIMI OSSERVATI** (tavola del punto 3 più sopra,
  "Il canale di gioco — `manopolaDi(p)`", misurata al compito 6 di
  #117 con la squadra 0 congelata da #108): i vecchi massimi **15,00% /
  18,49% / 8,44%** sono dichiarati SUPERATI da questa corsa a CPU-CPU
  vera (stesso banco, stessa taglia 5, stesso seme 20260919, 5 partite):
  nuovi massimi **passErr 15,00%** (invariato — il clamp di umore=±1
  satura comunque: anche a squadra 0 congelata la squadra 1, già CPU
  allora, raggiungeva lo stesso limite), **slideP 11,57%** (era 18,49%,
  ora più basso), **standoff 10,08%** (era 8,44%, ora più alto, ma sotto
  al tetto 12% dichiarato dalla formula). Nessun tetto superato in
  nessuno dei due scenari: i tetti sono proprietà della formula
  (passErr ±15%, slideP +25%, standoff ±12%), non della partita — solo
  il massimo OSSERVATO cambia. Il vecchio numero resta scritto nella
  tavola qui sopra, marcato superato: non si cancella una misura,
  si dichiara chi l'ha rimpiazzata e perché.

  **I5 — il vantaggio si apre ANCHE in area** (commento nuovo,
  `checkSlideContact`, nessun codice cambiato: il comportamento era già
  quello giusto). La riga che apre `G.vantaggio` non guarda mai
  `dentroArea()` — un fallo dentro l'area non è mai un rigore SUBITO, un
  rigore SFUMATO arriva con un ritardo di **0,85-2,85 s**
  (`VANT_VALUTA`/`VANT_T` meno lo stordimento). Misurato (sonda
  dedicata, 21 finestre aperte da un fallo in area): **~0 casi su 21
  restano PIENI** — la geometria di "restare più avanti mentre si resta
  ancora dentro l'area" è una striscia stretta, non una regola che
  favorisce l'area. Prova nuova **VANTAGGIO-IN-AREA** (sedicesima),
  CONTROLLO DISCRIMINANTE, nata verde: fallo in area con azione che
  prosegue → niente rigore immediato, finestra aperta; se sfuma →
  RIGORE dal punto (scena `freekick`).

  **m7 — la correzione del commento di `scaricaCardVantaggio()`**: diceva
  "tre punti", ma i siti veri erano già CINQUE prima di questa onda —
  `resetKickoff`, `setScene`, `checkSlideContact` (due volte: il fischio
  immediato e la micro-coda) ed `eseguiSfumato()` (il quinto, estratto
  da I3a e oggi RAGGIUNGIBILE DA DUE chiamanti — `step()` quando la
  conservazione si perde da sola, `pallaFuori()` quando la palla esce
  dal campo con la finestra ancora viva — non uno solo).

  **m6 — attrezzo retroattivo `strumenti/_t-vantaggio-sentinel.js`**:
  riproduce, a posteriori, l'hunk di gioco della chiusura arbitrale
  `832cff2` (il sentinel che non chiude più la finestra) — verificato a
  specchio: applicato a `git show b241c43:...` (l'antenato diretto di
  `832cff2`), il risultato è BYTE-IDENTICO a `git show 832cff2:...` su
  tutto il file. **RETTIFICA (ri-verdetto, micro-onda finale, 18
  settembre 2026)**: questa voce diceva prima «applicato a `700f775`»,
  una corsa impossibile — `700f775` è GIÀ successivo a `832cff2`, la
  guardia è già presente, e l'attrezzo (che cerca l'ancora PRIMA
  dell'inserimento) su quel commit esce con codice 1 e «trovato 0 volte»,
  come dichiara la sua stessa intestazione: non un secondo successo, un
  rifiuto onesto. La garanzia resta PIÙ DEBOLE di un attrezzo nato
  insieme al suo commit (prova che l'attrezzo riproduce l'edit già
  fatto, non che l'edit sia nato ancorato) — lo stesso precedente
  dichiarato in coda alla voce #87 per `_t-sfide-sponde.js`.

  **m9 — la precisione sui cancelli in batteria.** `strumenti/tutti.js`
  registra **31** strumenti con `conta:true` in tutto, non 28: tre di
  loro (`giocata`, `prestazione`, `avvio-telefono`) portano `solo:true`
  — girano SOLO se invocati per nome (`--solo`), mai dentro un `--tutto`
  nudo, perché sono cronometrici (girano meglio in isolamento) o
  (`avvio-telefono`) chiedono un telefono vero. **28 cancelli che
  contano nei 4 spezzoni di serie** di questo cantiere resta la cifra
  corretta per QUELLA convenzione (i quattro comandi `--solo` di questa
  voce, che includono esplicitamente `giocata`/`prestazione`), non 31 —
  la differenza non è un errore, è la distinzione fra "registrato" e
  "incluso in una corsa data".

  **#121 compito 3 — la rete che coglie il prossimo banco rotto** (19
  settembre 2026, commit `39810c4`; verbale mancante, aggiunto qui il 19
  settembre 2026, voce #122 compito 3): il censimento di #108 (I4 sopra) è
  una fotografia del passato — non vede quel che nasce DOPO, ed è proprio
  così che `_q-umore.js` (compito 2 sopra) è nato con lo stesso difetto,
  scoperto solo perché ha causato l'hang #119. Nuovo banco
  anti-regressione `strumenti/_q-cpu-ordine.js`: due prove sullo stesso
  schema in direzioni opposte. ORDINE-GIUSTO (`setCpuVsCpu(true)` DOPO
  `startMatch`, il contratto di ogni banco CPU-CPU) verifica
  `G.cpu=[true,true]` e una partita CPU-CPU a seme fisso che raggiunge
  `'end'` entro 13200 fotogrammi senza incastrarsi in `'freekick'`;
  ORDINE-SBAGLIATO (lo stesso schema invertito — il controllo
  discriminante, non un contratto) verifica che `G.cpu[0]` risulti
  `false`, la condanna che dimostra che la prima prova misura qualcosa di
  reale e non una tautologia. Registrato in `strumenti/tutti.js`
  (`conta:true`, dopo `umore`); un commento in testa a `posaFerma`
  (`strumenti/_posa.js`) documenta l'ordine giusto per chi scrive un
  banco CPU-CPU nuovo. `CALCETTO-il-gioco.html` non toccato. Cancello:
  **3/3 verde**.

  **Seguiti nuovi**: **#109** "il corpo del portiere scala come il
  campo" — `P_R+B_R` (tavola `CORPI`, scala con la taglia) e `KICK_R*0.8`
  (costante fissa) vivono sotto DUE verità di scala diverse, riconciliate
  qui solo con un pavimento (`Math.max`, C1) in UN punto; un seguito
  vero controllerebbe ogni altro punto del file dove le due grandezze si
  confrontano per lo stesso motivo (anti-tunneling ad alta velocità
  quando il corpo del portiere si rimpicciolisce più in fretta del passo
  di simulazione; il caso dichiarato ma non ricostruito qui di una
  punizione-senza-movimento che potrebbe urtare lo stesso confine). **NON
  MISURATO in questa onda**: dichiarato per chi aprirà il seguito, non
  investigato a fondo. **#110** "il banco che non congela" —
  **CHIUSO (voce #121, compito 3, commit `39810c4`, 19 settembre 2026,
  verbale registrato qui il 19 settembre 2026, voce #122 compito 3)**: il
  censimento vero dei 25 strumenti (I4 sopra) e la PROVA 1 di
  `_q-regole.js` resa robusta (I4b) erano il prerequisito, ma #110
  chiedeva l'ANTI-REGRESSIONE vera e propria — una rete che veda un
  banco NUOVO nascere rotto, non un elenco chiuso del passato. Quella
  rete ora esiste (`strumenti/_q-cpu-ordine.js`, paragrafo sopra): due
  prove che interrogano il comportamento del gioco ad ogni corsa in
  batteria, in entrambe le direzioni dell'ordine `setCpuVsCpu`/
  `startMatch`. La decisione se rendere il GIOCO stesso a-prova-d'ordine
  (la cura lato-gioco proposta a I4, mai applicata) resta del
  committente — #110 non chiedeva quella decisione, chiedeva la rete che
  ne rendesse il costo visibile, ed è quella che chiude qui. **#111** —
  sarebbe stato il seguito per il 5,1% "silenzioso"
  della contabilità arbitrale del compito 3 (la palla ferma durante una
  finestra viva): **CHIUSO nello stesso respiro dall'onda I3 sopra**, mai
  rimasto aperto.

- **Rimesse laterali e calci d'angolo** (#87) — **CURATA il 18 settembre
  2026** (cinque compiti più il verbale, dal merge-base `7ed570a` fino
  alla coda della revisione finale — l'intervallo non si fissa su uno
  SHA finale, che la coda stessa ha già superato una volta; attrezzi ad
  ancore per compito in `strumenti/_t-*.js`:
  `_t-sponde-interruttore` (1: l'interruttore), `_t-battuta-finestra` (2,
  correzione di revisione: il fermo torna breve e la finestra vive),
  `_t-battuta-verbi` (3: i verbi del battitore), `_t-rimessa-clip` (3,
  correzione di revisione: la clip viaggia su `p.rimT`), `_t-battuta-fondo`
  (4: l'angolo e il rinvio), `_t-gioca-sponde-fit` (5: la schermata GIOCA
  ritrova il suo margine, sotto)): il campo impara le sue linee — a **11
  sempre**, a **5/7 a scelta** — e la GABBIA resta byte-identica al gioco
  di sempre dove il piano lo promette.

  **Il perimetro deciso dal committente**: un interruttore solo,
  `SAVE.sponde` (di serie **LA GABBIA**: le sponde rimbalzano come sempre,
  nessuna rimessa), a scelta **IL CAMPO VERO** a 5/7, **obbligatorio a
  11**. **Rettifica dichiarata rispetto al censimento** (`_analisi/
  RIMESSE-E-ANGOLI.md`, che proponeva gli angoli SEMPRE su tutte e tre le
  taglie anche restando in gabbia sulle fasce): il design approvato
  (`docs/superpowers/specs/2026-09-17-rimesse-e-angoli-design.md`) lega
  invece rimessa, angolo e rinvio allo STESSO interruttore — a 5/7 sono
  tutti presenti insieme (campo vero) o tutti assenti insieme (gabbia),
  mai gli angoli soli; solo a 11 il campo vero è un obbligo, non una
  scelta, e la riga di GIOCA si blocca su di esso.

  **La tavola di cosa esiste ora**:
  | cosa | dove |
  |---|---|
  | rimessa laterale | fascia, ultimo tocco squadra opposta, fermo ~0,8 s |
  | calcio d'angolo | fondo fuori luce, tocco della difesa, fermo 1,2 s a 5 / 1,5 s a 7-11, camera sul punto |
  | rinvio dal fondo | fondo fuori luce, tocco dell'attacco, fermo ~0,8 s, dalle mani del portiere (y=FH/2 fisso, niente `rnd`) |
  | finestra di battuta | hold 3 s, auto-battuta se nessun tocco; la CPU batte al suo timer ~0,5 s dopo la comparsa |
  | verbi del battitore | PASSA/CROSS/FILTRANTE (i verbi di casa); TIRA spento finché non batte (guardia unica `inBattuta`, letta da 3 punti: layout, `startCharge`, `aiDecide` — i ganci in `doPassaggio`/`doCrossUmano` furono rimossi dalla correzione di revisione del compito 3) |
  | rispetto dell'avversario | nessun avversario punta (bersaglio del passo, `aiTX/aiTY`) a meno di 40 unità dal battitore durante la finestra |
  | clip della rimessa | viaggia su `p.rimT` (non su `chargeClip`, cieco in partita vera: rettifica di revisione del compito 3), visibile ≥6 fotogrammi, arriva fino in moviola |
  | angolo giocato | battitore sull'arco, 2/3 attaccanti in area a `areaProf*0,6`, marcature senza doppioni (`Set`), portiere sulla linea, auto-battuta via `doCross`; la palla entra davvero in area entro 2,5 s dalla ripresa |

  **I numeri chiave, con la prova accanto**:
  - Banco dedicato `strumenti/_q-battute.js`, in batteria da questo
    compito: **11/11 verde** — nato **7 prove** al compito 1 (2/7 verdi,
    le 5 prove di scena dichiarate rosse per costruzione, la condanna a
    registro). **Quattro prove aggiunte in corsa**, non due: **+2 al
    compito 3** (BATTUTA-UMANA e RISPETTO, prove 8-9) → **9**; **+1 nella
    correzione di revisione del compito 3** (CLIP-RIMESSA, prova 10,
    `strumenti/_q-battute.js` §F2) → **10**; **+1 al compito 4**
    (ANGOLO-IN-AREA, prova 11) → **11** (fonte: brief e rapporto del
    compito 3, rapporto del compito 4, ledger di questa voce).
  - GABBIA: **0/40 dal merge-base** (`7ed570a`, `_c3-sorteggi.js`) —
    **0/20 a taglia 5** e **0/20 a taglia 7** (100.829=100.829 e
    213.679=213.679 chiamate a `dado()`) — la promessa della gabbia
    mantenuta fino all'ultimo compito. Il compito 3 aveva già misurato un
    risultato ANCORA più forte per la sua sola cura (0/60 A TUTTE LE
    TAGLIE, 11 compresa: quella toppa era di puro disegno, la divergenza
    a 11 nasce solo dal compito 4).
  - Divergenza a 11 **dichiarata, non nascosta**: dal merge-base,
    **18/20** partite con un conto diverso (284.912 → 275.636 chiamate a
    `dado()`), causa unica il campo vero obbligatorio (rimesse/angoli/
    rinvii che il gioco di ieri non conosceva). Coerente con le
    divergenze già a registro per compito (2: 15/20; 3: 0/60 a tutte le
    taglie, cura di puro disegno; 4: 18/20) — numeri diversi perché presi
    contro basi diverse (il compito, non il merge-base), stessa causa.
  - **Giocabilità** (`strumenti/_eventi.js`, 20 partite, semi
    20260803..20260822, contro l'HEAD pre-ramo `7ed570a`): a `7ed570a`
    `G.campoVero` non esiste ancora, a nessuna taglia — la 11 di ieri
    rimbalzava come la gabbia. Tutte e due le righe sotto sono quindi lo
    stesso confronto, "gabbia di ieri contro campo vero di oggi" — la
    domanda giusta, quanto costa il campo vero rispetto al gioco di ieri.
    A **11** (il confronto usa i banchi ufficiali: a questa taglia
    `G.campoVero` è sempre acceso, non serve un flag `--sponde`) MOMENTI
    DA PORTA/minuto **1,96 contro 2,21** (**88,9%**, soglia ≥80%), 0-0
    **5% contro 0%** (soglia ≤33%). A **5 campo vero** (una variante non
    committata di `_eventi.js`, `fuori/_eventi-campo.js`, che forza
    `save.sponde='campo'` prima di `startMatch` — il banco del repo non
    ha il flag) contro **5 gabbia del pre-ramo**: **3,87 contro 4,36**
    (**88,9%**), 0-0 **10% contro 5%**. Tutte e due le taglie sopra la
    soglia, nessuna manopola da tarare.
  - **La lezione del banco-più-forte-dello-spec** (compito 2): la prima
    stesura del banco pretendeva che la battuta si sciogliesse ESATTAMENTE
    al fotogramma d'uscita dalla scena — più dello spec — e la prima
    implementazione aveva piegato il design per superarla (fermo umano
    3,8 s, la finestra viva non esisteva mai). Curato ripristinando il
    design approvato E la prova (FERMO BREVE ≤1,2 s + SCIOGLIMENTO ≤5 s),
    con doppia ri-condanna prima di fidarsene.
  - **La cura camera del compito 4**: lo snap-camera sulla battuta,
    scritto al compito 2, era CODICE MORTO dietro la guardia `inPlay` di
    `updateCamera` — la camera inquadrava il centrocampo durante ogni
    rimessa/angolo/rinvio. Cura di una parola, zero sorteggi, verificata
    con screenshot pre/post.
  - **La regressione trovata e curata da questa stessa batteria**
    (compito 5): `tocco.js` rosso **5/722** — `#btnCambiaCampo` sulla
    schermata GIOCA, visibile ma dietro la barra fissa a 811x384,
    812x375, 740x360, 640x360, 568x320. Causa: la riga SPONDE (compito 1)
    costa ~70 px in più su una schermata che la toppa del 28 agosto 2026
    aveva già portata a un margine di soli 2 px a 915x412 — lo stesso
    difetto di allora, riaperto. Cura SOLO CSS (`_t-gioca-sponde-fit.js`,
    4 ancore, zero `dado()`): imbottitura delle pastiglie 5px→3px sotto i
    540 px, margini di `.eti`/`.diff-row`/titolo ristretti, e
    un'omissione chiusa (`.sponde` non era mai stata aggiunta alle regole
    che comprimono/nascondono `.taglia`/`.ment` sotto i 540 e i 340 px).
    Bersaglio del pollice **42→37 px** (sette sotto il riferimento di 44,
    dichiarato nel commento del gioco in stile edizioni, non addolcito).
    `tocco.js` torna **722/722**. Il rosso isolato di `collaudo` visto UNA
    volta dentro la batteria a tre cancelli insieme ("nessun errore in
    console", 399 s invece dei ~35 s tipici) è un **artefatto di contesa**
    — rilanciato da solo più volte, sempre 36/36: non è entrato nel
    conto finale.

  **La copertura onesta**: i cancelli di batteria girano a **taglia 5
  GABBIA** (default). `_q-battute.js` è IN batteria e tocca il campo vero
  — la sua PROVA 1 fa un `startMatch(1,1,{size:11})` sincrono (una
  fotografia, non un rendering) e 10 delle 11 prove impostano
  `save.sponde='campo'` per costruire una scena ferma — ma questo non è
  SIMULARE una partita: nessuna di quelle prove fa avanzare i fotogrammi
  di una partita intera a quella taglia o con quella sponda, cosa che
  fanno invece `_eventi.js` e `_c3-sorteggi.js`. Quel rendering esteso
  vive solo nelle corse dedicate di questo compito (`_eventi` a 11 e a
  5-campo-vero, `_c3-sorteggi` a 11 e la corsa dedicata 5-campo-vero
  sotto), NON in batteria. Le due corse a 5-campo-vero vivono su varianti
  NON committate (`fuori/` è gitignorato): `fuori/_eventi-campo.js` e
  `fuori/_c3-sorteggi-campo.js`, perché gli strumenti ufficiali
  (`strumenti/_eventi.js`, `strumenti/_c3-sorteggi.js`) non hanno un flag
  `--sponde`. **Intenzione dichiarata**: portare quel flag `--sponde` nei
  banchi ufficiali quando il campo vero entrerà in batteria — si aggancia
  alla voce **#99**, che resta aperta in questo senso preciso: nessun
  cancello IN BATTERIA SIMULA una partita intera a taglia 11 o a
  `sponde='campo'` (le fotografie sincrone di `_q-battute.js` non
  contano come simulazione).

  **Sorteggi**: `_q-determinismo --partite 4` **13/13** (convenzione del
  ramo; il piano scriveva 10/10, disallineamento già a registro dal
  compito 4). Una corsa DEDICATA a **5-campo-vero** (variante non
  committata `fuori/_c3-sorteggi-campo.js`, flag `--sponde` che il banco
  del repo non ha): **17/20 DIVERGE** (100.829 → 85.358) — fuori canone
  per costruzione (confronta "5 gabbia di ieri" con "5 campo vero di
  oggi"), dichiarata e non nascosta.

  **Batteria**: intera verde in quattro spezzoni, **27 cancelli che
  contano** (incluso `battute`, nuovo da questo compito, con un commento
  che dichiara cosa protegge: l'interruttore, la classificazione delle
  uscite, la gabbia identica, la finestra di battuta, la clip). I banchi
  a rischio del censimento (§8): le sei copie sorelle di `collaudo.js`
  (`_p/_q/_t-p/_tb/_z/_x-collaudo.js`) sono tutte **VERDI** sul controllo
  "nessuno esce dal mondo" (il difetto storico della voce #66) a campo
  vero taglia 11 — **provato, non dedotto**; condividono però (scoperta
  fuori perimetro, non curata qui: non è un difetto di questo ramo) una
  tabella `ATT[11].FH=1120` mai aggiornata dopo il compito 3 della voce
  #86 (dovrebbe essere 1490) — le fa fallire sulla coerenza campo/porta,
  causa estranea alle rimesse. I banchi-camera (`_z-verbo.js`,
  `_z-verbo-prova.js`, `_t3-verbo.js`), lanciati a **`--partite 2-3`**
  invece del default 16 per contenere il tempo (ogni partita costa
  150-350 s di rendering reale — fonte: rapporto compito 5, Dubbi §4),
  girano puliti, zero eccezioni: la
  scena `battuta` non compare nel campionamento camera-alto/bassa
  (guardia `scena==='play'||'golden'`), i numeri non si muovono per
  costruzione, come previsto.

  **CORREZIONE DELLA REVISIONE FINALE** (18 settembre 2026, un solo
  commit). **C1, CRITICO**: `startMatch` fotografava `G.campoVero`
  sempre da `SAVE.sponde`, il salvataggio DEL DISPOSITIVO — mai da un
  parametro della chiamata. Le due partenze di sfida (`Sfida.gioca`,
  `Sfida.guarda`) passavano a `startMatch` solo la taglia: a 5/7, due
  telefoni con `SAVE.sponde` diversa rigiocavano la STESSA sfida (stesso
  seme, stessa taglia, stesso nastro) su due motori diversi, e
  `chiudiSfida` imputava lo scarto di punteggio solo al profilo cresciuto
  nel frattempo, mai al motore diverso. Curato: `startMatch` onora
  `opts.sponde` quando presente (vince su `SAVE.sponde` in tutti e due i
  versi), e le due partenze di sfida passano sempre `sponde:'gabbia'` a
  5/7 — la gabbia e' identica al bit su ogni telefono per costruzione
  (voce #87, compito 2), quindi e' la sponda giusta per una sfida finche'
  le sponde non viaggiano col nastro (seguito #105). A 11 nessun
  cambiamento: il campo vero resta forzato comunque. **I5, Importante**:
  le tre pose della battuta (`posaBattuta`/`posaBattutaAngolo`/
  `posaBattutaRinvio`) lasciavano `G.battuta` pendente per sempre quando
  la squadra che doveva battere non aveva un uomo di movimento
  disponibile (rosa azzerata) — lo stesso buco gia' chiuso su
  `ballOverBar` dopo un rilievo CRITICO. Cura centrale in `pallaFuori`:
  palla libera, `G.battuta=null` (questa prima cura era incompleta —
  vedi la rettifica subito sotto, coda della revisione finale). Via
  attrezzo a ancore `strumenti/_t-sfide-sponde.js` (4 ancoraggi,
  verificato riproducendo byte per byte la patch sulla copia
  pre-correzione). **Due postille del ri-verdetto sul metodo, non sul
  comportamento**: (a) l'attrezzo NON e' una ricetta completa di quel
  commit — una riga di solo testo (M3, l'allineamento delle due liste di
  risoluzioni nel commento RETTIFICA del gioco, vicino a righe
  2455-2468) resta un edit a mano, fuori dall'attrezzo, dichiarato nel
  rapporto del compito 5 e non nell'attrezzo stesso; (b) la verifica
  "byte per byte" prova che l'attrezzo RIPRODUCE l'edit gia' fatto, non
  che l'edit sia NATO ancorato — l'ordine vero fu edit a mano prima,
  attrezzo scritto a specchio dopo (Dubbi §1 del rapporto del compito
  5), l'inverso della disciplina di casa "attrezzo prima, applicato da
  esso": una garanzia piu' debole, annotata come tale, non una
  regressione di comportamento. Cinque rilievi minori di solo testo
  chiusi in `MANUALE.md`/`strumenti/_q-battute.js`/
  `strumenti/_t-gioca-sponde-fit.js` (numeri e liste disallineati fra
  file, nessun cambio di comportamento). **Cancelli**:
  `_q-battute` **11/11**, `_q-determinismo --partite 4` **13/13**,
  `_c3-sorteggi` (`fuori/fw-base.html`, il gioco al commit pre-correzione,
  contro `CALCETTO-il-gioco.html`, taglie 5/7/11) **0/60** — il percorso
  amichevole/CPU-contro-CPU non passa mai `opts.sponde`, quindi C1 non lo
  tocca; I5 e' un ramo morto li' salvo rose azzerate, che nessun banco di
  batteria costruisce — `tocco.js` **722/722**, `_q-precedenza` **9/9**.
  Sonda mirata di C1 (`fuori/_sonda-c1-sponde.js`, non committata): con
  `SAVE.sponde` fissata sull'uno o sull'altro, `opts.sponde` la ribalta
  sempre nei due versi, e senza `opts.sponde` la fotografia segue ancora
  `SAVE.sponde` come prima — quattro casi, quattro verdi.

  **CODA DELLA REVISIONE FINALE** (rettifica successiva, 18 settembre
  2026, un solo commit in piu'). Il ri-verdetto ha bocciato la cura I5
  appena descritta: **bloccante**, la guardia liberava l'owner ma NON
  riportava il pallone dentro la banda — la palla restava ferma
  esattamente FUORI dal campo. A campo vero `ballWalls()` gira ogni
  fotogramma sulla fisica libera del pallone (`updateBall`, mai gestito
  dalla guardia di scena): al fotogramma successivo lo stesso varco si
  ripresentava, `pallaFuori()` veniva richiamata, la guardia riliberava
  di nuovo — la scena `play`/`battuta` si alternava a fotogrammi
  alterni, all'infinito. Il commento che descriveva la cura era anche
  lui falso («la scena battuta resta comunque per il fermo breve»):
  `duraBattuta()` ritorna 0 quando `G.battuta` e' nullo (proprio lo
  stato che questa guardia produce), quindi `setScene('play')` scatta
  SUBITO — non c'e' nessun fermo da conservare, perche' non c'e' nessun
  battitore ad aspettare. Misurato con una sonda dedicata (rosa di
  movimento della squadra che deve battere tutta fuori, `out=99`,
  rimessa provocata sulla fascia nord, 400 fotogrammi): **169 ingressi
  in scena 'battuta' PRIMA della cura, 1 DOPO**. Cura, minima: dentro la
  stessa guardia, PRIMA di azzerare, un `clamp` riporta la palla dentro
  la banda (`B_R`/`FW-B_R` in orizzontale, `B_R`/`FH-B_R` in verticale) —
  stesso PRINCIPIO di `ballOverBar` quando "deep" e' null (mai lasciare
  la palla fuori dal mondo che la fisica ripete), non la stessa cura
  carattere per carattere: `ballOverBar` assegna un owner su un punto di
  gioco preciso, qui non c'e' nessun uomo disponibile a cui darla, la
  palla torna libera sul bordo del campo. Il commento e' stato riscritto
  con la storia vera. Rilievo minore accolto nella stessa coda: nessun
  cancello in repo misurava la riga che le sfide attraversano per
  davvero a taglia 11 (`startMatch` chiamato con `opts.sponde` esplicito,
  non con `SAVE.sponde` impostato prima) — `_q-battute.js` PROVA 1
  guadagna una quarta sotto-condizione,
  `startMatch(1,1,{size:11,sponde:'gabbia'})` → `campoVero===true`. Via
  attrezzo ad ancore `strumenti/_t-battuta-ripiego.js` (1 ancoraggio).
  **Cancelli**: `_q-battute` **11/11** (col sotto-caso nuovo dentro la
  PROVA 1), `_q-determinismo --partite 4` **13/13**, `_c3-sorteggi`
  (`git show 4bd253f:CALCETTO-il-gioco.html`, il gioco alla coda
  precedente, contro `CALCETTO-il-gioco.html`, taglie 5/7/11) **0/60** (i
  due `clamp` vivono in un ramo irraggiungibile nei percorsi normali —
  serve una rosa di movimento azzerata per l'intera squadra che deve
  battere), `_q-precedenza` **9/9**.

  **I seguiti nuovi**: **#102** (i piazzati evoluti — portiere che sale
  sul corner disperato e pressione per fase, dal paragone `MINIERA-FCM.md`
  scavo 7 — più la regia panoramica dell'angolo a 11, il cui quadro
  ordinario non fa entrare l'area coi corpi, scoperto al compito 4);
  **#103** (la coda dell'angolo: gol olimpico e statistica corner in
  lavagnetta); **#104** (la battuta è scena di partita anche per il
  disegno: le sei liste di scena del disegno e `forceWinMatch` andrebbero
  in una sola `fermoDiPartita(s)`; la soglia FERMO BREVE dovrebbe essere
  proporzionale a `duraBattuta()`; l'HUD non deve lampeggiare a ogni
  rimessa — misurato dalla revisione finale: zone toccabili 6→0→6);
  **#105** (le sponde viaggiano col nastro delle sfide, per sfide a campo
  vero a 5/7 — vedi C1 qui sotto); **#106** (`tocco.js` misura la
  raggiungibilità del bersaglio ma non la sua TAGLIA: il bersaglio del
  pollice a 37 px del compito 5, §"la regressione trovata e curata",
  resta senza un pavimento misurato).

  **Nota corretta (revisione finale)**: la voce **#96** (cancello di
  pubblicazione) copre la VERSIONE del motore — i nastri delle sfide
  registrati col motore di ieri non si riproducono più a 11/campo vero
  perché `ballWalls`, `resetKickoff` e dintorni sono cambiati; questo
  resta a registro, si cita e basta. Un caso DIVERSO, non coperto dalla
  #96 perché non è un cambio di versione ma un'IMPOSTAZIONE PER
  DISPOSITIVO: due telefoni sulla STESSA versione del motore ma con
  SPONDE diversa in locale rigiocavano la stessa sfida su un motore
  diverso (uno in gabbia, l'altro a campo vero), perché `startMatch`
  leggeva sempre `SAVE.sponde` del dispositivo invece della sponda con
  cui la sfida era stata giocata. Questo era il rilievo **C1** della
  revisione finale, ora curato: le sfide a 5/7 forzano LA GABBIA su
  entrambi i lati, per costruzione identica su ogni telefono (a 11 sono
  già allineate, il campo vero è obbligatorio). Seguito **#105**
  registrato per quando si vorranno sfide a campo vero anche a 5/7.
  **AGGIORNAMENTO (voce #107, 18 settembre 2026): la voce #96 SI CHIUDE**
  — il nastro porta `MOTORE_V` e `Sfida.guarda` dice la causa vera quando
  non combacia, invece dell'accusa al profilo; vedi la voce #107 più in
  alto in questa sezione.

  Verbale completo: `docs/superpowers/specs/2026-09-17-rimesse-e-angoli-
  design.md`, `docs/superpowers/plans/2026-09-17-rimesse-e-angoli.md`,
  `_analisi/RIMESSE-E-ANGOLI.md`, `_analisi/MAPPA-MANDATO.md` §1, rapporti
  `.git/sdd/brief/87-compito-*-report.md`.
- **La moviola fluida** (#85, con le voci #68 e #98 a bordo) — **CURATA il
  7 settembre 2026** (diagnosi `15410bf`, piano `90fe5b9`, cinque compiti
  in commit `3c560d6..3372268` — dal banco che nasce rosso al verbale, con
  le due code di revisione dei compiti 2 e 4 (`d48058c`, `6beea19`);
  attrezzi ad ancore per i tre compiti che toccano il gioco — 2:
  `_t-touch5-azzera`+`_t-touch5-riadotta`, 3: `_t-campione-pose`, 4:
  `_t-moviola-blend` — mentre i compiti 1 e 5 toccano solo banco e
  documenti): il replay dei gol smette di tenere congelati i
  cronometri dei gesti mentre il corpo scorre liscio, il campione della
  moviola porta anche le pose di contrasto e di parata, e la prova E del
  banco del replay (`strumenti/_q-replay.js`, ora anche in batteria) torna
  a dare un verdetto vero invece di dichiararsi nulla.

  **Il reclamo del committente (testuale, dal mandato originario)**: «il
  replay dei goal va a scatti» e «nel replay si vede tutta l'azione fino
  al goal di rovesciata, quindi anche il dribbling le finte e le azioni
  con tante catene di possesso palla e dribbling».

  **Metà del reclamo era già risolta dal 1° settembre 2026** (commit
  `21ff404`): la finestra del replay risale all'ultimo cambio di possesso,
  tetto 9 s, `REC_HZ` 20 — un fatto già in produzione da una settimana,
  non un lavoro di questo ramo. La metà rimasta aperta («va a scatti») era
  vera solo per i cronometri dei gesti, ed è quella misurata e curata qui.

  **Le tre decisioni del committente (7 settembre 2026,**
  **`docs/superpowers/specs/2026-09-07-moviola-fluida-design.md`)**: (1)
  lo scatto si cura con ENTRAMBE le cure — interpolare i cronometri dei
  gesti E registrare i cinque campi di posa mancanti; (2) la finestra
  resta 9 s / `REC_HZ` 20, invariata (si riapre solo con una misura
  futura, non con un'impressione); (3) la cura profonda di `Touch5` entra
  in questo ramo, per chiudere la voce #68 e misurare la voce #98.

  1. **Scatto — i cronometri dei gesti bloccati**
     (`kickT/kickB/charge/chargeT/slide/dive/rove/roveT1`): venivano
     copiati di peso dal campione della moviola, restando bit-identici
     fino a **5 fotogrammi di schermo consecutivi** mentre il corpo del
     giocatore avanzava (seme dichiarato 20260907, prova SCATTO). Curato
     interpolando anche questi otto campi (`mixSu`), con la guardia sui
     riavvii — `(v<u) || ((u===-1)!==(v===-1))` — perché un cronometro
     che RIPARTE fra due campioni (valore nuovo minore del precedente, o
     un passaggio da/verso la sentinella -1 che segna "gesto assente")
     non va spalmato: scatta al nuovo invece di mescolarsi col vecchio.
     Dopo la cura: **0 fotogrammi congelati su 16 transizioni con un
     gesto attivo** (prima: 5 su 16, di cui 13 congelate).
  2. **Campi — le pose di contrasto e parata assenti dal campione**:
     `contrasto, presaT, gkManiT, rinvT, recover` non venivano registrati:
     un gol nato da un contrasto vinto o da una respinta del portiere
     mostrava nel replay lo stato ATTUALE di quei campi, non quello
     davvero registrato al momento del gesto. Ora i cinque campi sono
     scritti a ogni campione e ripristinati nel disegno. Prova CAMPI: da
     assenti a presenti e variabili. Peso dichiarato: **19.800 numeri in
     più a taglia 11** (5 campi × 22 giocatori × 180 campioni),
     **~396 kB di sola RAM per eccesso** (stima arrotondata per eccesso),
     mai serializzati — `G.rec` è un buffer locale di solo disegno,
     azzerato a ogni fine replay, indipendente dal nastro delle sfide che
     il server ri-simula.
  3. **Prova E — «registrare non cambia il gioco» — e la voce #68
     CHIUSA**: il banco poteva dichiararsi **PROVA NULLA** perché due
     partite identiche sulla stessa pagina (registro spento/acceso/
     spento) divergevano a causa di uno stato di `Touch5` che sopravviveva
     a `startMatch()`. La bisezione **ha smentito la diagnosi iniziale**:
     `stick.ox/oy` — l'origine del joystick sintetico, il sospetto di
     partenza — è di per sé INERTE; le cause vere sono `stick.active/id/
     dx/dy/hist` (la divergenza compare al campione 6) e il verbo a
     tenuta orfano `atti`/`btnTouch` (compare al campione 7). Curato in
     `startMatch()` chiamando `Touch5.azzera()` — la stessa funzione che
     pausa/ripresa già usa — che chiude quei campi SENZA azzerare
     `stick.ox/oy` (sempre sovrascritto prima del riuso, per non perdere
     il gesto di chi torna col pollice ancora premuto): una riadozione
     morbida, non un azzeramento a martello. Misurato: prima della cura
     una rivincita ravvicinata lasciava un **dito fantasma**
     (riagganciato=false, `vx=0` per 30 fotogrammi dopo il calcio
     d'inizio); dopo, il dito vivo si riaggancia con la sua velocità vera
     (`vx` 0 → 82,63 dopo 30 fotogrammi di tocco), senza orfanare la
     rivincita. Prova E: da **PROVA NULLA** a **verde**, mai più tornata
     nulla nei compiti successivi. **Voce #68 CHIUSA** — con la nota
     onesta che la stabilità osservata viene anche da una toppa di banco
     preesistente (`Reg.azzeraComandi` in partenza), non dalla sola cura:
     se la prova E tornasse nulla in futuro, sospettare prima quella
     componente.
  4. **Determinismo, e la voce #98 RIDIMENSIONATA (non chiusa qui)**: a
     taglia 5 resta **10/10** a ogni compito. Misurato dopo la cura
     Touch5 anche a **7 e 11**, come deciso: resta **8/10, IDENTICO prima
     e dopo la cura** — il seme 20260803 diverge già fra **due pagine
     FRESCHE** in CPU-contro-CPU (zero `Touch5`, zero dita) al primo
     campione. La causa non è il tocco: è un difetto vero del motore,
     indipendente da questo ramo e dalla sua cura. La voce #98 non si
     chiude: si **ridimensiona**, con il dossier aggiornato nella voce
     stessa (il perimetro Touch5 è escluso per misura diretta, non per
     congettura).

     **AGGIORNAMENTO (voce #128, correzione di revisione, 20 settembre
     2026): la CAUSA è ORA ISOLATA.** `startMatch` → `setTaglia` →
     `rebuildCrowd` (`CALCETTO-il-gioco.html:29922-29949`) consuma
     `dado()`/`SEME` in un numero proporzionale al perimetro del campo
     (misurato ~114.026 estrazioni in più alla prima partita a taglia 11,
     pagata solo perché `setTaglia` (:29977) ritorna subito quando la
     taglia richiesta è già quella corrente): lo stream del PRNG di
     gioco slitta, e una pagina fresca diverge da una pagina che ha già
     giocato N partite alla stessa taglia. Non è il tocco, non è un
     difetto generico del motore: è QUESTA catena, ora isolata. Seguito
     ingegneristico aperto: **#129** (verbale completo alla voce #128,
     paragrafo del residuo di determinismo).

  **La nota onesta sull'occhio** (soglia 6 dello spec): la cura arriva
  fino al rig — la catena `kickB → posa` è stata verificata nel sorgente
  (gradi veri di gamba, nessuna quantizzazione a valle, LOD escluso) — ma
  nell'episodio campionato (seme 20260907, il "seguito della gamba" dopo
  un tocco leggero, non un calcio pieno) **la differenza a occhio è
  impercettibile**: un confronto pixel-per-pixel fra due fotogrammi con
  lo stesso spostamento in schermo dà **145.007/608.400 pixel diversi
  (23,8%)** prima della cura e **144.603/608.400 (23,77%)** dopo, con la
  stessa `mediaDelta` (16,385 in entrambi i casi) — praticamente lo
  stesso conteggio. Detto con questa franchezza: **la verifica percettiva
  su un gesto ampio (scivolata, tuffo, rovesciata) o in gioco vero resta
  aperta**, prima di dichiarare il reclamo «va a scatti» percettivamente
  chiuso e non solo numericamente chiuso. La prova numerica (SCATTO)
  resta comunque l'unica che conta per il cancello, ed è inequivocabile.

  **Sorteggi**: `_q-determinismo` a taglia 5 **10/10** a ogni compito. Il
  confronto due-versioni COMPLESSIVO del ramo (base `3bced51`, prima
  della diagnosi, contro `CALCETTO-il-gioco.html` di oggi,
  `_c3-sorteggi.js --taglie 5,7,11`): **0 partite divergenti su 60**
  (601.370 = 601.370 chiamate a `dado()`) — il **primo ramo di questa
  voce che chiude senza dichiarare una sola divergenza**: registrazione e
  disegno sono osservazione pura, e la cura di Touch5 non tocca i
  percorsi CPU-contro-CPU.

  **Batteria**: intera verde in quattro spezzoni (26 cancelli che
  contano, incluso `replay` — nuovo in batteria da oggi, con le prove
  SCATTO/CAMPI/E di questa voce dentro). Verbale completo:
  `docs/superpowers/specs/2026-09-07-moviola-fluida-design.md`,
  `_analisi/MOVIOLA-OGGI.md`, `_analisi/PROVA-E-DIAGNOSI.md`, rapporti
  `.git/sdd/brief/85-compito-*-report.md`.
- **Le proporzioni ufficiali del campo** (#86) — **CURATA il 7 settembre
  2026** (sette compiti, commit `544e617..6528cf8` — dal compito 1 al
  verbale del compito 7; `55bbc4e` è il commit del progetto e `eeb081b`
  chiude solo il compito 6, escludendo il verbale stesso — un attrezzo
  ad ancore
  per compito in `strumenti/_t-*.js`: `_t-tavola-vernice`,
  `_t-area-unica`, `_t-forma-undici`, `_t-vernice-vera`, `_t-porta-area`,
  `_t-leva-corpi` — più due dalla revisione: `_t-usura-vernice` (le
  chiazze d'usura ai dischetti e alle mezzelune seguono la stessa tavola
  del gesso, non più i vecchi letterali) e `_t-diritti-fifa` (tre
  commenti dei compiti 4/5 smettono di citare il marchio nella fonte
  della misura, IFAB e UISP restano)): il campo, il gesso, la porta e —
  a 11 — i corpi
  entrano nella scala dei campi veri, misurati da un banco
  (`strumenti/_q-proporzioni.js`, ora in batteria) che confronta le
  costanti LETTE DAL GIOCO VIVO dopo `setTaglia()` con le misure
  ufficiali con fonte primaria di `_analisi/MISURE-UFFICIALI.md`. Le
  quattro decisioni del committente (6 settembre 2026,
  `docs/superpowers/plans/2026-09-06-proporzioni-ufficiali.md`): vernice
  ufficiale entro **±10%**; area disegnata e applicata dalla stessa
  costante (zero formule duplicate); forma a 11 e corpi a 11 entro
  **±15%**; porta entro **±20%** su tutte e tre le taglie con
  `GK_AREA_X` ricalibrata sulla stessa costante dell'area.

  Tavola prima/dopo, con lo scarto residuo dalla misura ufficiale:
  | grandezza | 5 | 7 | 11 | fonte |
  |---|---|---|---|---|
  | forma del campo (FH) | 560 (inv.) | 784 (inv.) | **1120 → 1490** (68,0 m; aspetto 1,5436 vs 1,5441 IFAB, −0,03%) | IFAB Regola 1 |
  | porta (GOAL_H, tetto ±20%) | 150 → **103** (+19,4%) | 172 → **172** (+16,6%, già nel tetto) | 196 → **192** (+19,8%) | FIFA Futsal/UISP/IFAB |
  | area di rigore (profondità) | 118 → **173** | 136 → **268** | 153 → **361** | FIFA Futsal/UISP/IFAB |
  | area di rigore (semilarghezza) | assente → **216** | assente → **288** | assente → **441** | derivata dalla profondità/porta |
  | cerchio di centrocampo (raggio) | 62 → **86** | 62 → **106** (convenzione) | 62 → **200** | FIFA Futsal/convenzione/IFAB |
  | corpi a 11 (P_R / B_R) | 13/8 (inv.) | 13/8 (inv.) | **13→5 / 8→2,5** (diametro +11,3%/+3,8%) | A4 (proxy spalle) / A2 |

  **Le tre CONVENZIONI del 7** (cerchio 106, angolo 27, arco della "D"
  106): nessuna fonte dà un numero per queste tre voci a 7
  (`_analisi/MISURE-UFFICIALI.md` A3 "non trovato"). Scelta dichiarata,
  non misura: cerchio e "D" alla stessa frazione di larghezza del campo
  dell'11 (9,15/68 → 106), angolo al valore famiglia-11 (1 m → 27). Il
  banco le verifica per **uguaglianza** al valore convenuto, non per
  scarto percentuale, e non le conta nel verdetto ±10%.

  Il banco `_q-proporzioni` nasce **ROSSO 4/24** sul gioco del 6
  settembre 2026 (cerchio a 11 −69,1%, area a 11 −57,7%, area di porta
  assente, porta a 5 +73,9%, corpi +189,6%/+232,1%) e arriva a **27/27**
  coi sei compiti.

  **Conseguenza misurata a 11 contro 11** (l'unico posto dove questo
  numero è a registro): i contatti fisici puri calano del **−70%**, per
  costruzione — la soglia di collisione corpo-palla (`P_R+B_R`) scende
  da 21 a 7,5 unità, quindi corpo e palla si sfiorano per caso molto
  meno spesso. La partita a 11 **non ne risente**: i momenti da porta al
  minuto salgono da **5,0 a 7,5**, e lo 0-0 nei 90 secondi simulati resta
  **0%** prima e dopo (`strumenti/_eventi.js --taglia 11`).

  **Copertura onesta**: i cancelli di batteria (`giocata`, `eventi`,
  `istantanea`, `folla`) girano a taglia 5 di default e non esercitano
  l'11; la garanzia sull'11 viene dai lanci `--taglia 11` fatti a mano in
  ogni compito e dagli screenshot ispezionati (`fuori/vernice-11.png`,
  `fuori/porta-area-11.png`, `fuori/corpi-11.png`).

  **Bug latente trovato e curato al compito 5**: `GOAL_H` e
  `GK_AREA_X` nascevano come letterali di modulo, e il `setTaglia(5)`
  d'avvio usciva subito per la guardia `n===TAGLIA` — la partita a 5 di
  default non avrebbe mai visto i valori nuovi. Curato con due ancore
  sui letterali iniziali.

  **Conseguenza dichiarata della revisione finale, CURATA alla voce
  #100** (7 settembre 2026): con l'area vera, il rinvio a pugno del
  portiere poteva cadere dentro l'area a 7 e a 11 (242 contro 268 e 361:
  prima cadeva sempre fuori, 242-590 su tutte e tre le taglie). Il
  committente decide: «allungare il rinvio in proporzione così da
  renderlo più realistico al calcio vero» — non un effetto da subire, una
  scelta posseduta. Le due componenti orizzontali del pugno (avanti e
  laterale) scalano per `GK_PUGNO_SCALA = VERNICE.areaProf /
  VERNICI[5].areaProf` (`strumenti/_t-rinvio-scala.js`); il tempo di volo
  (vz) resta invariato, è lo stesso gesto delle mani a ogni taglia. A 5 il
  fattore è 1, taglia **identica al bit**: atterraggio 242-590 unità
  invariato. A 7 (fattore 1,549) diventa **375-914**; a 11 (fattore
  2,087) diventa **505-1231** unità — 23-56 m a 21,90 unità/metro, un
  rinvio a pugno realistico. La proprietà storica «sempre fuori
  dall'area» torna vera a ogni taglia, misurata in
  `strumenti/_q-proporzioni.js` (tre prove nuove, una per taglia: 27→30).

  **Scoperta fuori perimetro, voce #98**: `_q-determinismo --taglia 7`
  dà partite divergenti già al primo campione fra due corse sulla stessa
  pagina — PRE-esistente su `HEAD` prima di questo ramo (il banco di
  batteria gira solo a taglia 5 e non l'aveva mai visto). **AGGIORNAMENTO
  (voce #128, 20 settembre 2026): la causa è ora isolata** —
  `rebuildCrowd`/`setTaglia` consuma il PRNG di gioco in proporzione alla
  taglia sulla prima partita giocata a quella taglia (dettaglio e numeri
  alla voce #128, paragrafo del residuo di determinismo); seguito
  ingegneristico **#129**.

  **Sorteggi**: `_q-determinismo` **10/10**. Il confronto due-versioni
  COMPLESSIVO del ramo (base `791877e`, prima del piano, contro
  `CALCETTO-il-gioco.html` di oggi, `_c3-sorteggi.js --taglie 5,7,11`)
  **DIVERGE per costruzione**: 58 partite su 60 con un conto di sorteggi
  diverso, 542.275 → 601.224 chiamate a `dado()` totali. Le tre corse
  SEPARATE per taglia danno **60/60**: lo scarto della corsa combinata
  (58/60) è il non-determinismo PRE-esistente a taglia 7 e 11, già a
  registro alla voce #98 (sopra) e fuori dal perimetro di questo ramo —
  non una cura parziale. Non è un rosso da nascondere: è la conseguenza
  dichiarata del piano — porta e area
  cambiano a tutte le taglie dal compito 5, forma e corpi a 11 dai
  compiti 3 e 6. Le divergenze dichiarate per compito, verificate al bit
  nel loro compito: 1 (tavola+banco) identico a 5/7/11; 2 (costante
  unica) identico a 5/7/11; 3 (forma dell'11) identico a 5/7, DIVERGE a
  11 (20/20); 4 (vernice) identico a 5/7/11; 5 (porta+area) DIVERGE a
  5/7/11 (20/20, 20/20, 19/20); 6 (corpi a 11) identico a 5/7, DIVERGE a
  11 (20/20). Ogni "identico" del piano è stato provato al bit nel suo
  compito, non solo promesso.

  **CONSEGUENZA**: i nastri delle sfide registrati col motore precedente
  non si riproducono più (stessa conseguenza già a registro per la voce
  #88); la voce **#96** (cancello di pubblicazione) copre anche questo
  ramo. **AGGIORNAMENTO (voce #107, 18 settembre 2026): la voce #96 SI
  CHIUDE** — vedi la voce #107 in cima a questa sezione. Verbale completo:
  `docs/superpowers/plans/2026-09-06-proporzioni-ufficiali.md`, rapporti
  `.git/sdd/brief/86-compito-*-report.md`, misure con fonte in
  `_analisi/MISURE-UFFICIALI.md`.
- **La pulsantiera che mentiva sul possesso** (#88) — **CURATA il 6
  settembre 2026** (nove compiti, attrezzi ad ancore in
  `strumenti/_t-*.js`: `_t-ricevente`, `_t-cella-spenta`,
  `_t-cella-spenta-alfa`, `_t-contrasto-specchio`, `_t-difesa-ferma`,
  `_t-raddoppio-tenuta`, `_t-crossto-palo` fra gli altri): la faccia dei
  dischi smette di dipendere da una soglia geometrica sul pallone e
  dipende dal possesso (`squadraDelPallone()`, già in casa dalla voce
  #82); le celle si spengono invece di travestirsi da un altro verbo; il
  comando segue il destinatario dichiarato del passaggio; il raddoppio
  diventa una tenuta invece di un impulso. Le sei soglie decise **prima**
  dell'esecuzione (progetto approvato,
  `docs/superpowers/specs/2026-09-01-pulsantiera-contesto-design.md` §5),
  tutte VERDI oggi su `strumenti/_q-volo.js` (11 prove su 11):
  1. TIRA premibile durante il volo di un nostro cross: **9% → 100%**
     (soglia dello spec; oggi 232/232 fotogrammi, prova A — il campione
     si allarga da 56 a 232 dopo la correzione del palo del compito 9,
     che rende legittimi 184 fotogrammi prima esclusi come «dopo il
     cambio di lato»);
  2. Cambi di faccia bugiardi in 6 s di inseguimento senza cambio di
     possesso: **3 → 0** su 4 cambi totali (i cambi che restano seguono
     un vero cambio di possesso, e la prova B li lascia passare apposta —
     i due numeri vengono da strumenti diversi, entrambi veri: 6 cambi
     osservati da `_p-sfarfallio` (commit abe425d) di cui 4 bugiardi
     spariti; il banco B conta le bugie, non i cambi: 3 → 0);
  3. Comando al destinatario del passaggio: **38 → 17 fotogrammi**
     (0,63 s → 0,28 s, soglia 0,5 s, prova C);
  4. Volée eseguibili tenendo TIRA durante il volo: **0 → 1** (prova D);
  5. Celle accese che rifiutano l'atto: **147 → 0 fotogrammi** (prova E);
     direzione opposta, prova nuova G — celle spente che nascondono un
     atto possibile: **0 su 361 fotogrammi** (rossa a 1/361 sulla guardia
     rotta, verificato apposta con un file guasto per costruzione);
  6. Furti riusciti (il prezzo dichiarato prima di scrivere il codice):
     **non calano** — scivolate riuscite a dita vere, due misure prima e
     due dopo la cura di §4.3: 19/20 e 17/20 prima, 17/20 e 17/20 dopo.

  Fuori dalle sei soglie ma nello stesso lavoro: il raddoppio non scade
  più da solo sotto il dito — durante 5 s di tenuta continua il
  cronometro del compagno non scende sotto **2,78 s** e si azzera da sé
  al rilascio (prova K). Sorteggi identici al bit su tutta la
  lavorazione: `_q-determinismo` 10/10; `_c3-sorteggi` 0 partite
  divergenti su 60 (542275 = 542275 chiamate a `dado()`);
  `_crit10-sorteggi` verde (sei partite identiche sui due file, conto
  statico di `dado()` invariato 89→89). Minori a registro per la
  revisione finale: (1) `swLock` a 0,75 s può superare il volo di un
  cross e vanificare la volée appena sbloccata; (2) durante la tenuta del
  raddoppio il bersaglio si rideriva ogni 0,2 s dalla direzione corrente,
  quindi a metà presa l'uomo chiamato può cambiare; (3) il numero della
  prova A col seme scelto (5%) cade fuori dal ballo senza seme (8-22% su
  più semi). Verbale del progetto:
  `docs/superpowers/specs/2026-09-01-pulsantiera-contesto-design.md`.
- **Il palleggio avversario mangia la scivolata trascinata** (#82) —
  **CURATA il 1 settembre 2026** (`strumenti/_t-isteresi-disco.js`, 5
  ancoraggi): il ri-armo scatta solo se il pallone CAMBIA LATO
  (`squadraDelPallone`: il padrone se c'è, altrimenti la squadra
  dell'ultimo tocco). Misure: sonda dei 20 contrasti da 11/20 a ~18/20
  con **zero falliti per sfarfallio** (i residui sono furti veri a metà
  gesto); `giocata` 20/20; `_q-riarmo` 7/7 per tre corse; tracce dei
  duelli a seme fisso identiche al bit prima/dopo. Il verbale intero:
  `_analisi/PROGETTO-ISTERESI-DISCO.md` §8, comprese le sei riparazioni
  ai banchi che accusavano l'innocente.
- **Il gioco aereo della macchina** (#72) — **SEI STADI APPLICATI il
  1 settembre 2026** (`_t-aereo.js`…`_t-aereo6.js`): la punta taglia in
  area e parte prima, il volo si calcola per bersaglio, il tetto di
  raccolta scala col campo, in fascia il cross con bersaglio vero batte
  la carica di tiro e si guarda a ogni fotogramma anche nella striscia
  contesa. Cross per partita: da 0,3/0,0/0,0 a **1,0/1,0/0,2** (primo
  cross a 11 della storia del gioco); regressioni tutte nelle forbici
  (batteria §5, otto banchi verdi + prestazione 3/3). RESIDUO dichiarato
  a registro come **#84**: bersaglio [2,6] non raggiunto e «con uomo» a
  0 — l'appuntamento fra crossatore e corridore è ritmo tattico, altra
  cura. Verbale: `_analisi/PROGETTO-GIOCO-AEREO.md` §8.
- **La prima onda di contenuti** — **I TRE CONTENUTI SONO IN CAMPO**
  (1 settembre 2026, ordine 2→1→3): ABBANDONO = sconfitta a tavolino
  0-3 in torneo e stagione col doppio tocco (banco 14/14); DIVISIONI
  DEL QUARTIERE a nove gradini in tre fasce, premi a formula (401 una
  tantum), pavimento di fascia, schermata in bacheca e riga di fine
  partita (banco 18/18); RECORD personali con la data e seconda mensola
  da 15 a 24 trofei (banco 12/12). Restano dell'onda: la misura del
  tasso monete/partita (§6.8, prerequisito della taratura fine), la
  giuria dei dieci minuti, il collaudo a mano su telefono. ASSALTO a
  onda 2 col formato già risolto dalla miniera (MINIERA-FCM.md §2).
- **Il 2 giocatori paga monete senza guardia** (#83, scoperta del
  progettista): due pollici che si accordano incassano all'infinito —
  da decidere con la taratura dei premi delle divisioni.
- **MOVIMENTO: COMPLETO** viene riportato a RIDOTTO in silenzio a ogni
  avvio se il sistema chiede riduzione: serve un avviso o un terzo
  stato «rispetta il sistema».
- **ESC/Indietro e i bottoni a schermo** divergono sulle schermate a
  due livelli (ESC salta sempre al menu): serve una regola sola,
  decisa e dichiarata.
- **Il tutorial non è rigiocabile** se non azzerando tutto: manca una
  voce «rivedi il tutorial».
- **Il trasferimento di squadra** porta identità e punti ma non rosa e
  nome (la tessera ora almeno non mente più); e il campo «vero/finto»
  dell'avversario di rete non è ancora letto (contro l'avversario di
  allenamento si dice comunque «SFIDA»).
- **Il tetto dei rigori** (9 tiri a testa) a parità perfetta premia la
  squadra di casa senza dichiararlo.
