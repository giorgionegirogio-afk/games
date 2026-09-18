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
- **CLASSIFICA**: i primi 100 e la tua riga anche se sei più giù.
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
  ripresa gemelle dopo un gol) — gli altri 11 siti con banner
  preesistente non toccati e non spenti dal flag.

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
  del contorno), più due rifiniture minori a registro dall'anello del
  fiato (compito 5): la freccia di direzione, disegnata sopra la stessa
  ellisse, può coprire ~53° di lime quando la corsa cade nella zona
  accesa; la leggibilità della quota intermedia (55% contro 70%) non è
  stata misurata oltre i due estremi.

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
  investigato a fondo. **#110** "il banco che non congela" — il
  censimento vero dei 25 strumenti (I4 sopra) e la PROVA 1 di
  `_q-regole.js` ormai resa robusta (I4b) sono il prerequisito che
  mancava per decidere #108 senza rompere la batteria: la decisione
  resta del committente, ma il costo di prenderla oggi è più basso di
  ieri. **#111** — sarebbe stato il seguito per il 5,1% "silenzioso"
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
  batteria gira solo a taglia 5 e non l'aveva mai visto).

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
