# La finestra che cambia — un onesto può essere accusato (voce #139)

22 settembre 2026. Merge-base `main` = `1d5b946`. Ramo `voce-139-finestra-che-cambia`.

**CRITICO**, trovato dalla revisione d'insieme dell'onda D. Non è un difetto di
un cantiere: è la giuntura fra due — il #133 (che ha scoperto il canale dei
pixel) e il #137/#138 (che hanno dato al verdetto la forza di togliere punti).

## Il fatto

L'onda D ha costruito un giudice che rigioca il nastro di una sfida.
`NON TORNA` è **l'unico verdetto che muove punti**: `segna_verdetto` disfa
`delta_a` **e** `delta_d` (due persone), alza `allenatore.sospetto` — che non
decade mai, per disegno — e a `SOSPETTO_SEPARA = 3` segrega chi lo porta nel
mazzo degli abusatori. E chiude la riga per sempre: la guardia
`and verificata = 0` impedisce di rigiudicarla. Un `INCOMPLETO` si ripara
domani; un `NON TORNA` no.

Il #133 aveva già visto il canale: i tocchi del nastro sono in **coordinate di
schermo**, e dove finisce un tocco lo decidono `touchBtnLayout` e
`SCALE`/`OX`/`OY`, che vengono tutti e tre da `innerWidth`/`innerHeight`. La
sua cura fu la **riga di tipo 10**: due numeri nel nastro, e il giudice si
astiene se la misura non coincide (`INCOMPLETO / schermo-diverso`) o se manca
(`INCOMPLETO / schermo-ignoto`).

**Ma quella riga si scrive UNA VOLTA SOLA**, in `Sfida.gioca`, subito prima di
`startMatch`. Intanto `addEventListener('resize', resize)` resta vivo per
tutta la partita e ricuoce `SCALE`/`OX`/`OY` ogni volta che la finestra si
muove; `checkOrientation` ferma **solo il PORTRAIT**. Quindi la guardia del
giudice verifica che il nastro e il giudice **dicano la stessa cosa**, non che
quella cosa **sia stata vera per tutta la partita**.

## Misurato, due volte, prima di scrivere una riga di cura

`fuori/_sonda-139-finestra.js`, due bracci. Cambia **una** cosa: la finestra.
Stesso seme (`20260801`, il server finto lo dà con un contatore azzerato fra i
due bracci), stesso copione di dita, stesse due rose, stessi dischi calcolati
una volta sola alla misura di partenza.

    --- braccio FERMA    915x412 per tutta la partita
        tabellone dichiarato 3-4, riga 10: 915x412
        GIUDIZIO a 915x412: TORNA        rigiocata 3-4 in 8819 passi

    --- braccio CAMBIA   915x412 fino al fotogramma 1200, poi 915x352
        SCALE 0,7067 -> 0,6017 · OX 51 -> 112
        tabellone dichiarato 1-2, riga 10: 915x412  (la misura di PARTENZA)
        GIUDIZIO a 915x412: NON TORNA    rigiocata 3-4 in 8631 passi

Il secondo è un giocatore **onesto**: ha giocato, ha segnato 1-2, e il suo
telefono ha fatto comparire la barra dell'URL a metà partita. Il giudice lo
accusa con piena confidenza, gli toglie i punti, ne toglie anche a chi si
difendeva, gli alza un sospetto che non scende mai, e chiude la riga.

**Non è una lama, ed è lo stesso confine del #133.** Con 12 px di cambio
(412 → 400) la partita non si muove di un passo: stesso 3-4, stessi 8819
passi, nastro identico byte per byte, verdetto `TORNA`. Con 60 px cambia
tutto. «Quindici pixel non spostano niente, settanta spostano tutto.»

**Dove morde davvero.** Nell'APK è mitigato (fullscreen + `configChanges`) ma
non chiuso: split-screen, multi-finestra, pieghevoli. Servito come PWA in un
browser di telefono, la barra dell'URL che compare e sparisce è il caso
**normale**, ed è proprio nella banda dei 56-90 px — quella che sposta tutto.
Il commento di `resize()` la nomina da sé: «la barra del browser che compare e
sparisce scatena resize a raffica».

## La cura: un «non lo so» invece di un'accusa

Due metà, e servono tutt'e due — una riga che nessuno guarda è un commento,
e uno che guarda una riga che non c'è non vede niente.

1. **Il registro scrive la misura a OGNI CAMBIO**, non solo all'inizio.
   `Reg.schermo(w, h)` scrive una riga di tipo 10 **solo se la misura è
   diversa dall'ultima scritta**, e `resize()` la chiama dopo aver ricalcolato
   `VW`/`VH`. `Sfida.gioca` chiama la stessa porta invece di
   `Reg.scrivi(10, …)`: così la prima riga resta dov'era, nella stessa
   posizione del nastro, e un nastro a finestra ferma è identico a quello di
   ieri.
2. **Il vaglio si astiene se il nastro porta più di una misura**:
   `INCOMPLETO / schermo-cambiato`. Prima di `schermo-diverso`, perché è più
   specifico: uno `schermo-diverso` si ripara aprendo la finestra giusta (ed è
   quel che fa la staffetta), uno `schermo-cambiato` **non si ripara in nessuna
   finestra** — è una proprietà del nastro, non di chi lo legge.

**Il resize a raffica non riempie il nastro.** Due guardie in fila: quella che
`resize()` ha già («se la misura non è cambiata non si ricuoce niente») e
quella di `Reg.schermo` (l'ultima misura scritta), che serve perché `resize()`
gira anche a finestra immutata quando `RESIZE_FORZA` è acceso — lo accende
`setTaglia`. Il costo è **una riga di cinque numeri per misura distinta**: due
per una partita in cui la barra compare una volta, contro un tetto di 40.000
righe con marchio di troncatura (#132).

## Quel che la cura costa, dichiarato invece che nascosto

Il caso dei 12 px misurato qui sopra **oggi dà `TORNA` e domani darà
`INCOMPLETO / schermo-cambiato`**: una partita onesta che il giudice
confermava smette di essere confermata. Si paga volentieri, e per due ragioni
che si possono difendere:

- un onesto non confermato resta in lista a `verificata = 0` e non perde
  niente; un onesto accusato perde i punti, il sospetto e la riga per sempre;
- **una soglia sarebbe un'opinione**. Il #133 ha misurato «12 px no, 60 px
  sì» su *un* nastro: dove passi il confine di un motore caotico non lo sa
  nessuno, e un numero inventato lì dentro sarebbe la porta da cui entra
  esattamente il difetto che stiamo chiudendo.

**E la strada che renderebbe il nastro giudicabile invece che inservibile non
è questa.** Sarebbe rigiocare il cambio — al tick della seconda riga di tipo
10 ricalcolare `SCALE`/`OX`/`OY` come se la finestra fosse quella — e chiede
di spezzare l'invariante `VW === innerWidth`, cioè di ridimensionare la tela
lontano dalla finestra vera davanti a un umano che sta guardando un film. È il
seguito grosso già aperto dal #133, **«i tocchi indipendenti dallo schermo»**,
e non è una toppa. Questo cantiere chiude il canale nella direzione
dell'astensione e lo lascia aperto a quella cura.

## Che cosa NON cambia

- **Il gioco di chi gioca**: due numeri in più nel nastro e nient'altro.
  Nessun `G.rotateHold`, nessun fermo, nessuna schermata. L'alternativa più
  brutale (trattare il resize in partita come il portrait) è stata scartata
  proprio qui: punirebbe chi gioca per una cosa che fa il suo telefono.
- **I nastri VECCHI**. Ne portano **una** riga di tipo 10: una misura
  distinta, quindi si giudicano esattamente come oggi. Quelli senza nessuna
  riga restano `schermo-ignoto`. Se i nastri vecchi diventassero tutti
  `INCOMPLETO` la cura sarebbe peggiore del difetto, e la prova di
  non-regressione (la fixture congelata di `_nastro-duello-congelato.js`)
  serve a dirlo con un numero.
- **`MOTORE_V` resta 2**, se la misura lo conferma. `Reg.esegui` non ha un
  ramo per il tipo 10: in rilettura la riga non muove niente, né la prima né
  la seconda. Ma non si decide per opinione: si misurano N nastri registrati
  sul gioco vecchio e giudicati sul nuovo, e devono dare gli stessi verdetti,
  gli stessi gol e gli stessi passi.
- **La staffetta** (#138) non cambia di una riga. Raggruppa per la misura
  della **prima** riga di tipo 10, apre quella finestra, e si sente rispondere
  `INCOMPLETO / schermo-cambiato`: la riga resta a `verificata = 0`, nessuno
  viene accusato. E **non** scatta la regola della «finestra negata», che
  vive su `schermo-diverso`: la causa nuova non la tocca.

## Il banco, e i falsi

`strumenti/_q-finestra.js`, **a bracci**, in batteria con `conta:true`. Nasce
ROSSO sul difetto: prima della cura il braccio «finestra che cambia» dà
`NON TORNA`.

| gruppo | che cosa misura |
|---|---|
| A | il gioco **scrive** la misura a ogni cambio: una riga per misura distinta, col tick del cambio, e il resize a raffica non ne aggiunge |
| B | il giudice **si astiene**: `INCOMPLETO / schermo-cambiato` su tutt'e due le finestre, e **mai** `NON TORNA` |
| C | i nastri **vecchi** restano giudicabili come oggi, e le due parole di sempre (`schermo-diverso`, `schermo-ignoto`) non cambiano |
| D | la **forma**: cinque verdetti, e la frase che l'occhio di chi gioca legge nomina le due misure invece di dare la colpa alla rosa |

**Tre bracci giocati, non due**, e il terzo esiste per un falso: la finestra
che **torna** (412 → 352 → 412). Un gioco che scrivesse solo la prima e
l'ultima misura sarebbe verde su tutt'e due i primi bracci e accuserebbe un
innocente sul terzo.

I falsi (`strumenti/_crit-finestra-*.js`), ognuno nel caso peggiore — deve
passare tutte le prove tranne la sua:

| falso | che cosa fa | deve mordere |
|---|---|---|
| `sorda` | `resize` non lo dice al registro (la metà che scrive non c'è) | A |
| `cieca` | la riga si scrive a ogni cambio, e il vaglio guarda solo la **prima** | B |
| `accusa` | il vaglio vede il cambio e lo tratta come `NON TORNA` invece che come astensione | B |
| `estremi` | si tiene **solo la prima e l'ultima** misura | solo il terzo braccio |
| `raffica` | scrive una riga a ogni `resize`, anche a misura immutata | A (il conto delle righe) |

## I file

    CALCETTO-il-gioco.html   Reg.schermo + resize() + Sfida.gioca +
                             schermiDelNastro + vagliaNastro + causaSigillo
                             + chiudiSfida  (via strumenti/_toppa-139-finestra.js)
    strumenti/_q-finestra.js       il banco a bracci (in batteria, conta:true)
    strumenti/_crit-finestra-*.js  i cinque falsi
    strumenti/_nastri-bugiardi.js  due bisturi in più (solo aggiunte)
    strumenti/tutti.js             la registrazione

E tre rettifiche documentali che stanno in questo cantiere perché sono dello
stesso genere — affermazioni superate lasciate in giro dove qualcuno le legge
per riprendere:

1. `PUNTO-DEL-LAVORO.md:24`, la riga «LO STATO VERO, oggi»: dice **nove**
   asserzioni di `_q-staffetta` senza falso dove sono **quattordici**
   (`MANUALE.md` e la testa di `_q-staffetta.js` le elencano: A1 A2 A3 A5 ·
   D2 D5 · E3 E4 · F1 F2 F3 F4 · G2 G5), e dice «**PostgREST non si
   interroga in nessun banco**» dove il `MANUALE` scrive giusto «PostgREST si
   interroga ma è finto».
2. `rete/api/sfida.js:25-26` e `:41`: «il lavoratore periodico non esiste
   ancora» e «manca ancora soltanto la staffetta». Il #138 ha rettificato
   `rete/LEGGIMI.md` e `rete/schema.sql` e ha dimenticato il terzo file.
3. Il conto dei file tracciati: `MANUALE.md` e `PUNTO-DEL-LAVORO.md` scrivono
   **1 898**, il cancello oggi stampa **1 911**. Il verdetto non cambia (zero
   è zero) ma **il numero non si riproduce col comando di casa**: si scrive
   accanto il comando (`git ls-files | wc -l`) e il commit su cui è stato
   preso, perché quel numero cresce a ogni cantiere e un numero senza data
   invecchia da solo.
