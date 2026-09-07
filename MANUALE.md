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

Cinque scelte, poi si scende in campo:

- **Difficoltà CPU** — Facile / Normale / Duro. Governa velocità, reazione,
  rubata, potenza e portiere della macchina. Resta salvata come predefinita.
- **Rosa (la taglia)** — **5 contro 5** (la gabbia), **7 contro 7** (il
  campetto), **11 contro 11** (il campo grande). Cambia campo, porta, modulo,
  e anche la **durata**: i 90″ di base diventano 126″ a 7 e 180″ a 11.
  *La taglia scelta vale anche per Torneo e Stagione.*
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

- **Le sponde tengono il pallone sempre in gioco**: niente rimesse, niente
  angoli — la palla rimbalza e si continua.
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

- **Le proporzioni ufficiali del campo** (#86) — **CURATA il 7 settembre
  2026** (sette compiti, commit `544e617..6528cf8` — dal compito 1 al
  verbale del compito 7; `55bbc4e` è il commit del progetto e `eeb081b`
  chiude solo il compito 6, escludendo il verbale stesso — un attrezzo
  ad ancore
  per compito in `strumenti/_t-*.js`: `_t-tavola-vernice`,
  `_t-costante-area`, `_t-forma-11`, `_t-vernice-vera`, `_t-porta-area`,
  `_t-leva-corpi`): il campo, il gesso, la porta e — a 11 — i corpi
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
  ramo. Verbale completo:
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
