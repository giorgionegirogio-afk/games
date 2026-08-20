# Ripresa — stato al 20 agosto 2026, fermata per fine crediti

Il gioco e' a **`2febbc9807c9`**, committato e spinto su GitHub
(commit `c89d661`). **Tutto il lavoro e' al sicuro.**
Documento gemello: `_analisi/COSA-MANCA.md` (987 righe) — il censimento di
otto revisori piu' un critico contro il mandato del committente. Se leggi un
file solo, leggi quello; se ne leggi due, questo dice cosa e' cambiato dopo.

---

## DOVE SIAMO

**41,5%** rispetto al mandato — media di otto autodichiarazioni con otto metri
diversi, dichiarata per quello che e' e non per una misura. La forma del
divario: **il gioco vale molto piu' fotografato che giocato**. Contenuti 55% e
diritti 60%; presentazione contro FC 25 **22%** e comandi **32%**.

L'ultimo voto della giuria e' del **18 agosto (8,2)** e precede tutto cio' che
e' entrato dopo. **I concorrenti non li ha mai misurati nessuno**, in nessun
documento: il criterio «noi 8-9, loro 3-4» oggi ha una meta' sola.

---

## COSA E' ENTRATO NEL GIOCO IL 19 E IL 20 AGOSTO

    a9f8d15f -> 30279089 -> 2febbc98

| voce | cosa fa | misura prima -> dopo |
|---|---|---|
| **L1.1** | il motore d'ingresso: punto di posa, anello di 8 posizioni, scarto degli ultimi 60 ms, R_ARMA che cresce, annullo per SPOSTAMENTO, ri-armo sul cambio di contesto | cancello 3/7 -> 8/8 |
| **L0.3** | i dischi escono dagli inserti di sistema, piu' `setSystemGestureExclusionRects` nella shell Java | Android rubava **20 tocchi su 20** -> **0 su 20** (dita vere sul kernel) |
| **L0.4b** | l'etichetta dei dischi dice «cosa otterrebbe il dito», non «di chi e' il pallone». Guardie ESTRATTE in `puoTirare`/`puoPassare`/`puoContrastare` | «dice TIRA e premere non fa niente» **67,68% -> 1,39%**; passaggio **53,42% -> 0%** |
| **L2.2a** | l'attrito del pallone solo a terra | cross corti del **21,5-31,2%** -> 0-2,2% |
| **L2.2b** | il primo tocco puo' sporcarsi (velocita', angolo, pressione, tecnica — non un dado) | **0 su 359** contatti -> 14 su 347 |
| **divise** | sei divise stavano sotto 3:1 di contrasto contro l'erba | **6 sotto soglia -> 0**; la coppia PEGGIORE fra squadre migliora del 20% |
| **L2.3** | il compagno parte quando lo chiami | cancello 6/6 |
| **L1.3** | il tiro **si mira** trascinando, e la potenza e' una **rampa continua** al posto di tre gradini. L'anello del timing resta ma paga in PRECISIONE, non in potenza | cancello 5/5 |
| **ri-armo** | la soglia d'armo non crolla piu' quando il contesto cambia sotto il dito | il difetto valeva **8 scivolate non volute su 20** |
| **L1.5** | il cambio uomo va **verso una direzione** invece che in ciclo orario, e il trascinamento manda un compagno a **raddoppiare** | cancello 7/7 |
| **L2.1** | il pallone si allontana dal piede quando corri | vedi sotto: il rischio era INVERTITO |

**La scoperta di L2.1**, che ribalta una premessa: il pallone inseguiva un
bersaglio fisso a 16 unita' con un ritardo proporzionale alla velocita', quindi
la distanza vera piede-pallone era **16,0 da fermo, 6,9 in corsa, 3,8 in
sprint**. Chi correva a tutta era **il meglio protetto**, e nel corridoio
laterale sprintare faceva perdere MENO palloni che trottare (57,9% contro
68,3%).

**Sul telefono** (OnePlus 6, dita vere scritte sul kernel): il pallone arriva a
**69 unita' dalla porta** contro le 285 di ieri mattina. APK 665 kB,
`versionCode` 1385214, si installa sopra il precedente.

---

## LA BATTERIA HA SMESSO DI MENTIRE, E LA PROVA E' NEI SABOTAGGI

Tre cancelli che sorvegliavano le promesse del committente avevano
`conta:false`: la batteria diceva VERDE mentre `istantanea` peggiorava da 46
misure su 56 a 45 e l'erba senza soggetti da 4 istanti su 8 a 1.

Provato rompendo apposta, su copie fuori dal deposito:

| promessa rotta | esito | chi l'ha presa |
|---|---|---|
| il gol non accende piu' la folla | **ROSSA** | `folla` |
| una divisa entra nella tinta del prato | **ROSSA** | `collaudo` |
| il salvataggio si rompe | **ROSSA** | `salvataggio`, e di lato `meta` e `audio` |

**Quattro cancelli nuovi** dove prima non guardava nessuno: l'**audio** (firma
del grafo WebAudio per evento, 17 voci tutte distinte), il **salvataggio**
(giro completo, corruzione, migrazione da v3 e v2, `localStorage` assente), il
**meta-gioco** (un torneo intero e una stagione di 14 giornate con la
classifica ricalcolata da capo), e l'**avvio sul telefono vero** — che alla
prima corsa ha **rifiutato di scrivere il numero** perche' la dispersione era
23,3% contro il 20% ammesso: uscita «prova nulla», non verde.

Batteria di oggi: **16 cancelli verdi su 16 che contano**, piu' due informativi
dichiarati.

---

## LE COSE PIU' PESANTI CHE MANCANO, in ordine

### 1. La scoperta — e senza di lei i cinque verbi nuovi non esistono
Il giocatore preme e succede qualcosa, ma **non c'e' nessun segno che gli dica
cosa sta per succedere**. Il progetto (`_analisi/agente28.md` §5) prevede la
LINEA che parte dal pallone, il cambio di forma per dire quale verbo, l'arco
quando la palla si alza, e il rifiuto visibile quando il verbo non si puo'
fare — cosa che il gioco **sa gia' dire** (`puoTirare` e sorelle) e non mostra
a nessuno.
Vincolo che decide tutto: **la risposta si legge sul mondo, mai sotto il dito**
(il polpastrello e' un cuneo e copre al 100%). E un cono da 600 unita' costa
una passata alfa a schermo intero per fotogramma: per questo la LINEA.
**Lavoro fermato a meta': `strumenti/_q-linea.js` esiste, la toppa no.**

### 2. L'undici contro undici finisce 0-0 due volte su tre
**63% su 30 partite, 37,5% su una seconda serie di 24, 52% sul mucchio.** Gol
mediana zero. Era dichiarato CHIUSO in `PUNTO-DEL-LAVORO.md:138`: e' falso per
meta' (i «momenti da porta al minuto» reggono, 0,78 contro 0,79).
**La diagnosi e' fatta, la cura no.** Non e' il portiere (una parata mediana),
non e' che i tiri non partono (otto per partita), non e' che non arrivano
(2 su 59 muoiono prima). Sono tre colli:
 1. il tiro parte da 656-892 unita' e arriva a 210-340 u/s dentro venti corpi:
    **5,5 tiri su 9,5 murati** (58% contro 45% a cinque);
 2. la palla non e' di nessuno il **77% del tempo**, perche' il 22% degli
    appoggi e **tutti** i rinvii del portiere chiedono al pallone 1500 unita'
    quando l'attrito gliene concede **895**;
 3. la punta piu' avanzata sta a **726-735 unita'** dalla porta, cosi' la palla
    che arriva a quattro unita' dalla linea non trova nessuno.
Cure proposte: velocita' di appoggi e rinvii scalata sulla distanza voluta ·
zona di tiro della CPU stretta a ~600 unita' · popolare l'ultimo terzo.
Il cancello c'e' gia': `_q-meta.js --tre-taglie`, con la soglia dell'11 lasciata
**rossa apposta**. Il lavoro e' finito quando esce verde **senza toccare la
soglia**.

### 3. Le figure si teletrasportano a ogni cambio di posa
Ventuno clip, tutte pose vere, e **nessuna fusione fra l'una e l'altra**: il
giunto peggiore salta di **0,504 m mediani** (p95 1,070) in un sessantesimo di
secondo, contro 0,043 a clip invariata — **11,7 volte tanto**. E le soglie delle
andature non hanno isteresi: **1.567 cambi camminata-corsa in due partite**, e
il portiere sfarfalla piu' di seicento volte a partita.
Prima di prometterla va misurato il costo: fondere valuta due pose invece di
una, e a 22 figure il margine e' 3,15-3,65 ms su 16,7.

### 4. Il manto arriva all'occhio ingrandito quasi due volte, a filtro spento
1.969 righe di lavoro fine, e in partita si vedono sfocate: rapporto densita'
schermo/cotta **1,853x a 5, 2,106x a 7, 1,798x a 11**, e il manto riempie il
quadro intero nell'**87% dei fotogrammi a 11**. La cura **esiste gia' nel file**
(`campoVivoDisegna()`) ed e' chiusa dentro `if(gol && ...)` a `:23652`, perche'
accenderla in partita costava il doppio del fotogramma. Il compito non e'
«accendila», e' **trova come pagarla**.
Cancello proposto: rapporto densita' <= 1,05, e la prova sui pixel (oggi 1,52
in partita contro 1,03 nella scena del gol) <= 1,10.

### 5. La regia non esiste
Zero stacchi per partita contro i **2,16 al minuto** misurati su sette ore di
FC 25, dove il **31,9%** dei fotogrammi non ha nemmeno l'interfaccia. Il gioco
ha **gia' due camere** (42 gradi e 16) e ne usa una; ha **gia'** una moviola e
le ha dato **una sola inquadratura**.
Vincolo duro: **mai uno stacco durante il gioco attivo** — una camera che cambia
mentre conduci il pallone te lo fa perdere.
**Lavoro fermato a meta': `_t-regia.js`, `_q-regia.js`, `_p-regia.js` esistono
ma non sono stati verificati.**

### 6. La figura: due soli livelli di tono, e un dettaglio pagato che non si vede
Un provino cieco ha dato **3/10** di fattura contro il **9** del riferimento.
`lumiLook` produce `_lume` e `_ombra` e basta: niente mani, niente piedi, niente
volto, niente pieghe.
E il dettaglio ravvicinato (mani con le dita, volto, cuciture) **e' scritto e
pagato in byte**: si accende sopra `LOD_PX = 120`, la figura in partita e' alta
**94-111 px**, e su 4.261 figure **zero** superano la soglia.
Piu' un difetto piccolo e brutto: il numero sulla maglia e' disegnato **fuori
dall'ordine di profondita'** e finisce sopra la nuca quando la figura e' di
spalle.
**Lavoro fermato a meta': `_t-figura.js`, `_q-figura.js` esistono, non verificati.**

### 7. Il gioco aereo e' vietato da una riga sola
Sopra `Z_SOPRA_TESTA = 26` (`:2946`) il pallone passa e basta: **zero occorrenze
di «colpo di testa» in tutto il file**, niente stop di petto. Ed e' appena
diventato un problema vero, perche' la CPU adesso **crossa davvero** e quei
cross non li gioca nessuno.
**Fermato a meta': `_q-aereo.js`, `_sonda-aereo.js` esistono, la toppa no.**

### 8. Due verbi progettati e non entrati
- **il contrasto / contenimento / scivolata** (`_t-l12.js`, `_q-l12.js` pronti):
  bloccato dalla riserva sul ri-armo. La guardia e' entrata, ma il suo cancello
  non ha potuto comporre le altre toppe e ha dichiarato **prova nulla**, non
  verde. Va rifatto girare adesso che L1.5 e' dentro.
- **il passaggio mirato** (`_t-l14.js`, `_q-l14.js` pronti, critica fatta):
  approvato **con riserva**. Due cose da chiudere prima: dopo un ri-armo non
  produce un passaggio sbagliato, **non ne produce nessuno** (0 calci su 20); e
  **duplica** il meccanismo di chiamata gia' entrato con L2.3 — due cronometri e
  due rami per lo stesso concetto. Va **riscritto sopra `chiamaGiocatore`**.

---

## TRE COSE BLOCCANO LA PUBBLICAZIONE, a prescindere dalla qualita'

1. **Il testo della licenza dei caratteri non viaggia col gioco.** Nessun
   LICENSE o NOTICE in `git ls-files`, nessuna schermata crediti. La toppa
   `_t-crediti.js` e' pronta e **non applicata**.
2. **I due caratteri incorporati non contengono lettere ne' cifre**
   (sottoinsiemi latin-ext e vietnamita, misurato dalla cmap): si pagano ~29 kB
   e gli obblighi di licenza **per font che non disegnano nulla**. Da decidere:
   sostituirli coi sottoinsiemi veri, o toglierli e dichiarare i font di sistema.
3. **Il pulsante in euro.** Ogni articolo del negozio mostra «N,NN euro · una
   volta, per sempre»; al tocco si apre un pannello che spiega che li' tutto si
   sblocca giocando. **Non e' una truffa** — non raccoglie denaro, non chiede
   dati, non finge un acquisto completato. Il rischio e' di NEGOZIO: Google Play
   pretende il proprio sistema di pagamento per i beni digitali, e un prezzo
   esposto senza flusso d'acquisto puo' far respingere l'app. Tre strade:
   togliere le targhette · scrivere sul bottone «prezzo della versione store» ·
   portare Play Billing (e allora «zero librerie» finisce, e la libreria va
   iscritta nel NOTICE nello stesso commit).

E due nomi da guardare: **ROSSONERO** e' l'ultimo gancio verbale verso un club
vero (costa una parola: CORALLO); **BAR ROXY** e' a rischio molto basso ma
nessuno ha interrogato un registro.

---

## GLI STRUMENTI TROVATI CIECHI IL 19-20 AGOSTO (23-28)

- **23 — `folla.js` moriva quando il gioco migliorava.** Insegnando alla CPU a
  crossare e' comparso il banner «TIRO PERFETTO!» dentro la finestra di misura:
  i pixel accesi a riposo da 2.656 a 16.944, e la crescita percentuale e'
  crollata **mentre le braccia alzate valevano gli stessi pixel**.
- **24 — `giocata.js` era rumoroso, e non lo dichiarava.** La scena di quiete
  governava palla, portatore e avversari ma **non il ricevitore**: la distanza
  fra chi passa e chi riceve oscillava da 27,4 a 259,9 unita', e sotto le 40 il
  volo dura meno di un fotogramma. **Chiuso**: 10 corse, 10 verdetti uguali. Il
  rumore **non era nato oggi** (verificato sul commit di ieri: 1 rosso su 8).
- **25 — i banchi che ricostruiscono un pezzo di gioco.** `_q-precedenza.js`
  estrae pezzi veri e li monta in una `new Function`: ogni toppa che dava a
  `touchBtnLayout` una dipendenza nuova lo uccideva e faceva dichiarare **nove
  cancelli rossi su nove**. Successo due volte in un'ora.
- **26 — il gioco non si lasciava fotografare due volte uguale.** `disegna()`
  non e' una fotografia, e' **un passo di tempo**: `render()` fa avanzare la
  camera e `setPaused` ferma `step()`, non `render()`. Un sottopixel di zoom
  spostava il 14,3% del quadro. Piu' la tenda della transizione di scena, che
  vive su un timer d'orologio vero.
- **27 — le tre taglie erano lo stesso 5v5.** `setTaglia` fa
  `n = (n===7||n===11) ? n : 5`: passare 1/2/3 da' sempre cinque.
- **28 — `collaudo.js --gioco X` dava un verde su niente** (leggeva l'argomento
  come nome di suite): **riparato**, oggi esce 1 con un rosso.

E una regola nuova pagata: **verificare la sagoma sulla COPERTURA (il canale
alfa) non basta, va verificata la SEZIONE TONALE.** Il contorno che l'occhio
vede non e' il pixel nero, e' la banda scura, e un riempimento puo' ingrassarla
senza spostare un pixel di geometria.

---

## COSA E' STATO PROVATO E BOCCIATO (non rifarlo)

**Il volume dentro gli arti, tre versioni, tre giudici ciechi indipendenti:**
decalco bitmap da matcap (1,8 ms) · gradiente nel riempimento (0,9-1,5 ms) ·
due toni netti alla maniera della pixel art (0,4-0,9 ms). Verdetto finale:
«l'unica versione che non produce artefatti e' anche l'unica che a dimensione
vera non si vede — non e' una coincidenza, e' la forma del problema: **a 6-9
pixel di larghezza non c'e' spazio per un volume insieme visibile e pulito**».
Dove cercare invece, indicato dai giudici: **l'ombra a terra**.

**Gli sprite pre-renderizzati alla Diablo 2**: catena provata (Cycles su CPU
3,3 s a cella, nessuna GPU necessaria, 418 KB a verbo, ~3,7 MB per nove verbi),
ma a 8 direzioni la figura **scatta di 45 gradi 1,87 volte al secondo** con la
migliore isteresi, mentre il rig ruota continuo e ne fa **zero**. Lo sprite non
sostituisce il rig.
Verificato per misura contro l'accusa di un giudice: le due camere sono
**entrambe a 42 gradi** (42,004 misurato). Il giudice leggeva il CORPO: quando
la camera passo' da 50 a 42, le larghezze furono allargate del 13,5%.

**Tre accuse del progetto respinte con la misura**: il pallonetto acceso per
difetto (gia' riparato) · la cura dell'etichetta via `b.passTo` (peggiore del
male: il campo va rancido dopo un'intercettazione) · la soglia della carica al
volo (gia' giusta, e il difetto vero e' che dev'essere **funzione della
velocita'**: a 300 u/s bisognerebbe premere a 74,9 unita', a 540 a 110,9).

---

## LA PROVA CHE ASPETTA TE

`_analisi/PROVA-DIECI-MINUTI.md` — dieci minuti di gioco tuoi, con cinque
domande. Serve a misurare le due cose che nessuna macchina di questo progetto
sa dire: **se i comandi sono piacevoli** e **se si imparano**.
L'ultima domanda e' quella che potrebbe far crollare mezzo progetto: **il
pollice sinistro, quando giochi davvero, resta giu' o lo alzi?** Ogni banco di
prova e' costruito sull'ipotesi che resti giu'.

---

## COSE CHE COSTANO CARE SE SI DIMENTICANO

- **Un cancello rumoroso e' peggio di nessun cancello**: la prima volta che da'
  fastidio viene disattivato, e da quel momento non protegge piu' nemmeno
  quando ha ragione.
- **`--ripetuto 3` non e' mai stato fatto girare per intero** (20 minuti a
  corsa): **non sappiamo quali altri cancelli siano rumorosi.**
- I backtick dentro un template literal chiudono la stringa: **e' costato tre
  volte in due giorni**, l'ultima a me.
- `startMatch(taglia, 1)` misura sempre il cinque contro cinque: la taglia si
  passa con `startMatch(1, 1, {size: N})`.
- Le misure di TEMPO in parallelo accusano l'innocente. La batteria si fa **in
  fila** (`--insieme 1`), e ci mette venti minuti.
- Il telefono dipinge **meno** pixel del banco: 1620x768. Margine 3,15-3,65 ms
  su 16,7. Avvio vero **1345 ms**, dispersione 1,9%.
- `strumenti/_posa.js` congela il gioco in modo ripetibile (due scatti identici
  byte per byte): usalo prima di fotografare qualunque cosa.
