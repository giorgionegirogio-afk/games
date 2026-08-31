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

## A registro — gravi o medie, da progettare prima di toccare

- **Il pareggio promesso e irraggiungibile**: la stagione dichiara
  «PAREGGIO +15» e la classifica ha la colonna N, ma ogni partita pari va a
  golden goal e rigori: il giocatore non può pareggiare MAI. Decidere: in
  stagione il pareggio deve esistere (niente golden), o la promessa va
  tolta. Tocca il gioco, non i testi.
- **La contabilità del duello**: i tiri dal dischetto contano nei «Tiri» ma
  mai in «Nello specchio» (la precisione ne esce diluita), e le parate del
  duello non esistono per il tabellino né per la crescita del portiere.
- **Il marcatore della punizione può non essere chi ha tirato** (il gol va
  all'ultimo toccatore prima del fallo).
- **MORTE IMPROVVISA** si sblocca anche vincendo ai rigori (il gioco stesso
  distingue golden e rigori); **FREDDO DAL DISCHETTO** anche col rigore
  della serie (è pensato per la punizione-duello).
- **I replay delle sfide possono sbloccare trofei di metà partita**
  (primo gol, tripletta…): sospetto letto dal codice, da riprodurre.
- **Il trasferimento di squadra** porta identità e punti ma non rosa e nome,
  e la tessera mostra i numeri del vecchio proprietario finché la rete non
  risponde; il campo «vero/finto» dell'avversario di rete non è mai letto
  (contro l'avversario di allenamento si dice comunque «SFIDA»).
- **MOVIMENTO: COMPLETO** viene riportato a RIDOTTO a ogni avvio se il
  sistema chiede riduzione del movimento, in silenzio: serve un avviso o un
  terzo stato «rispetta il sistema».
- **ESC/Indietro e i bottoni a schermo divergono** sulle schermate a due
  livelli (ESC salta sempre al menu): decidere una regola sola.
- **Il tutorial non è rigiocabile** se non azzerando tutto.
- **Il tetto dei rigori** (9 tiri a testa) a parità perfetta premia la
  squadra di casa, senza dichiararlo.
- **Portiere umano al duello col dito**: il limite dei 3 secondi non è
  scritto da nessuna parte.
- **In 2 giocatori** il secondo umano non può cambiare la propria mentalità
  e nessun testo lo dice.
- **Il palleggio avversario mangia la scivolata trascinata** *(trovato la
  sera stessa, con una sonda dedicata)*: mentre il portatore palleggia
  verso di te, il possesso «sfarfalla» a ogni tocco e il disco CONTRASTA
  si ri-arma cambiando faccia — il trascinamento perde l'origine e il
  rilascio non produce la scivolata (~1 volta su 5 nella scena tipica).
  Serve un'isteresi sull'atto mentre il dito tiene: a registro, perché
  tocca la semantica dell'input e chiede il giro completo dei cancelli
  dei verbi.

## A registro — minori

Testi e residui: lo splash dice «tocca per entrare» ma entra da solo dopo
2,6 s · «oppure premi ESC» e «Pausa (ESC)» compaiono anche su telefono ·
la citazione di GIOCA promette «90 secondi» senza dire che 7 e 11 allungano ·
COME SI GIOCA dice «in amichevole si sale a 7 e 11» ma vale anche per
torneo e stagione · due schermate si chiamano entrambe IMPOSTAZIONI e il
bottone che le separa si chiama PREFERENZE · «BACHECA» e «la bacheca del
campetto» sono due luoghi diversi · il banner «FUORI 12 SECONDI!» ha il 12
scritto a mano accanto alla costante · «VINCE CPU (CPU)» e «VINCE X (CPU)»
dopo una stagione · il minuto della lavagnetta finale è sempre «90» anche
ai supplementari · «RIGORI  X - Y» ha una doppia spaziatura · W/↑ tirano al
centro ma i testi dicono solo A/S/D · i messaggi JS della SFIDA usano
l'apostrofo al posto degli accenti · l'aiuto del duello e della pausa
tastiera omettono la mappa del P2 · il piccolo del disco grande «mente» da
terra (dichiarato nel codice) · lo SHOT_HARDCAP (il tiro che parte da solo a
1,25 s) non è documentato in nessun aiuto.

Codice morto e ganci: `fieldRow` e `tourCoppa` sono riferimenti a elementi
inesistenti (guardie li rendono innocui) · `campiResta` è scritto ma
invisibile per sempre · `campiNome` è un id mai letto · `tourPlaySub` è il
gemello senza crash del difetto della stagione · `SAVE.rete.visto` si
scrive e non si legge mai · `SAVE.rete.nome` è predisposto e mai scritto ·
`Tut.notify` riceve chiavi di un tutorial che non esiste più · CSS morto
dello splash (`.spl-logo`) e del vecchio selettore campi (`.fchip`) ·
`#duelMsg` è «per i lettori di schermo» ma senza `aria-live` non viene
annunciato · la carta COMPLETO comprando i 4 pezzi si mostra posseduta ma
`shop.completo` resta 0 · l'albo si tronca a 200 voci solo alla rilettura ·
la barra del SALVADANAIO regredisce spendendo · «SBLOCCATO — PER SEMPRE» e
«IN USO» sono bottoni inerti ma focusabili · i 7 campi singoli costano
15.350 contro le 1.330 del pacchetto e nessuno lo segnala · CERCA/GUARDA
ignorano il tocco in silenzio mentre la rete gira · Invio non conferma il
codice di trasferimento · le partite scartate dalla coda di rete non
avvisano · la finestra del passo alto usa la stessa soglia dello scatto
(66 px) senza dichiararlo.
