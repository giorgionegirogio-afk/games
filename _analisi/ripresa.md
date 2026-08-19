# Ripresa — stato al 19 agosto 2026, sera

Il gioco e' a **df10ac97e47e**. Cinque toppe entrate oggi, una alla volta, con la
batteria in mezzo.

## Cosa e' entrato nel gioco

| voce | cosa fa | misura prima -> dopo |
|---|---|---|
| **L1.1** | motore d'ingresso: punto di posa, anello di 8 posizioni, scarto degli ultimi 60 ms, R_ARMA che cresce con la tenuta, annullo per SPOSTAMENTO (non percorso), ri-armo sul cambio di contesto | cancello `_q-l11` 3/7 -> **8/8** |
| **L2.2a** | l'attrito del pallone si applica solo a terra (`if(b.z<=0 && b.vz<=0)`) | cross corti del **21,5-31,2%** -> 0-2,2% (il residuo e' il passo del fotogramma) |
| **L0.4b** | l'etichetta dei dischi risponde a «cosa otterrebbe il dito», non a «di chi e' il pallone». Le guardie ESTRATTE in `puoTirare/puoPassare/puoContrastare`, chiamate sia dai comandi sia dall'etichetta | «dice TIRA e premere non fa niente» **67,68% -> 1,39%**; passaggio **53,42% -> 0,00%**; costo 0,32 microsecondi per fotogramma; 31.000 fotogrammi identici |
| **L2.2b** | il primo tocco puo' sporcarsi, con probabilita' che dipende da velocita' d'arrivo, angolo, pressione avversaria e tecnica — zero esatto sotto 170 unita' | **0 su 359** contatti -> **14 su 347** (4,0%) |
| **L0.3** | i dischi escono dagli inserti di sistema, piu' `setSystemGestureExclusionRects` nella shell Java | sul telefono vero: Android rubava **20 tocchi su 20** -> **0 su 20** |

APK ricostruito e installato (`apk/CALCETTO.apk`, 649 kB; `android/Gioco.java` ora
a `cf7679e68fd5`). Partita giocata in autonomia sul OnePlus 6: **4 tiri** e
pallone a **96 unita'** dalla porta, contro 1 e 285 di stamattina.

## Il rosso aperto, e non e' una regressione

`collaudo.js`: **contrasto maglia/erba P1 = 2,61:1** contro un minimo di 3.
Il dettaglio per partita: **2,05 / 4,57 / 2,13** — due su tre sotto soglia.
Nessuna toppa l'ha creato: il primo tocco sporco ha cambiato il consumo di
sorteggi, e il gioco ha cominciato a pescare coppie di divise che prima non
usciva mai. **Il difetto c'era sempre, nascosto dal seme fisso e da una media
che sommava due rossi e un verde.** In corso: misura esaustiva di tutte le
divise nel caso PEGGIORE (striscia chiara/scura per inizio/fine partita, perche'
la rampa termica della sera cambia il verde) e correzione del cancello.

## Le tre bocciature, che valgono quanto le toppe

- **Il pallonetto acceso per difetto**: accusa FALSA, gia' riparata da
  `_t-lob.js`. Misurato sulla quota vera del pallone, non sul contatore: 6 tiri
  alti su 48 oggi, 35 su 48 rimettendo la riga incriminata (la sonda sa fallire).
- **L'etichetta curata leggendo `b.passTo`**: il sintomo era VERO e tre volte
  piu' grande dell'accusa (1073 ms per passaggio, non 350), ma la cura era
  peggiore del male — il campo va rancido quando un passaggio viene
  intercettato, e «dice TIRA e non farebbe niente» saliva da 9,70% a 22,19%.
- **La carica del tiro al volo oltre `KICK_R*1.4`**: gia' fatta. E il difetto
  vero e' un altro: la soglia dev'essere **funzione della velocita'**, perche' a
  300 unita'/s bisognerebbe premere a 74,9 unita' e a 540 a 110,9. Zero tiri al
  volo in 4 partite su 54 occasioni. **Voce ancora aperta.**

## Gli strumenti trovati ciechi oggi (23, 24, 25)

- **23 — `folla.js` muore quando il gioco migliora.** Misurava la tribuna in una
  fascia dove il gioco scrive anche i cartelli. Insegnando alla CPU a crossare
  e' comparso il banner «TIRO PERFETTO!», e i pixel accesi a riposo sono passati
  da 2.656 a 16.944: la crescita percentuale e' crollata da 12,8% a 1,6%
  **mentre le braccia alzate valevano gli stessi pixel** (+339 contro +274).
  Curato: si spegne il cartello, e un quinto controllo verifica che resti spento.
  Controllo negativo intatto (tribuna congelata -0,2%).
- **24 — `giocata.js` accusa l'innocente a banco occupato.** 4/7 mentre gli
  specialisti lavoravano, 7/7 tre volte di fila appena finiti. Stessa classe di
  `prestazione.js`. **Il corridore `tutti.js --insieme` non e' un cancello
  valido per gli strumenti sensibili al tempo.**
- **25 — i banchi che ricostruiscono un pezzo di gioco.** `_q-precedenza.js`
  estrae pezzi veri e li monta in una `new Function`: ogni toppa che dava a
  `touchBtnLayout` una dipendenza nuova lo uccideva e faceva dichiarare **nove
  cancelli rossi su nove**, cioe' accusare il gioco di un guasto suo. Successo
  DUE volte in un'ora. Curato: si tira dietro le funzioni chiamate, con guardia
  sulla lunghezza del taglio (sopra 2000 caratteri il taglio testuale e' quasi
  certamente sbagliato — ci si tirava dietro tanto codice da dichiarare due
  volte `SAVE_KEY`); i dati globali restano dichiarati per nome e OPZIONALI,
  cosi' il cancello gira anche sul gioco senza la toppa degli inserti.
  E **C6 pretendeva il NOME del verbo** (`presa:through`) invece di chiedere al
  disco come si chiama in quell'istante: usciva rosso su 47 punti su 47 che
  erano tutti presi correttamente.

## Il forno alla Diablo 2: dove sta

Catena provata. Cycles su CPU **3,3 s a cella** (EEVEE non conviene: 42,7 s di
compilazione shader a ogni lancio, che si ripagano ogni volta). Peso **418 KB a
verbo**, circa **3,7 MB per nove verbi**: l'APK passerebbe da 649 kB a circa
4 MB. **Nessuna GPU necessaria.** Ricolorazione a maschera RGB (R maglia,
G calzoncini, B calzettoni) verificata su cinque divise dalla stessa cottura.

**Il provino cieco ha dato verdetti OPPOSTI, ed e' il risultato piu' utile:**
- *leggibilita'* -> vince il rig di oggi. Le figure cotte sono tutte uguali e
  senza numero: «con ventidue in campo sarebbe una poltiglia». Il rig vince con
  tre cose che sopravvivono al rimpicciolimento: contorno scuro continuo, tinta
  di squadra satura, numero leggibile a 100 px.
- *fattura* -> vince il forno, **4/10 contro 3/10, e il riferimento commerciale
  sta a 9**. E vince «perche' e' piu' FATTO, non perche' e' fatto meglio»: il
  rig quei problemi non li ha risolti, li ha **rimossi**.

Verificato per misura, contro l'accusa di un giudice: le due camere sono
**entrambe a 42 gradi** (42,004 misurato sul render con tre riferimenti di
posizione nota). Il giudice leggeva il CORPO, non la camera: quando la camera
passo' da 50 a 42, le larghezze trasversali furono allargate del 13,5% per
tenere la figura larga uguale, e un corpo piu' largo del 13,5% si legge come 49.

**Numero che decide la strada:** a 8 direzioni la figura scatta di 45 gradi
**1,87 volte al secondo** con la migliore isteresi (2,43 senza); il rig ruota
continuo e ne fa **zero**. Quindi lo sprite non sostituisce il rig.
Strada scelta: **Blender produce qualcosa che il rig USA** — rampe di
illuminazione applicate agli arti, +1,8 ms su 3,15-3,65 di margine a otto
giocatori. In verifica il vincolo dell'undici contro undici (a ventidue sarebbe
4,3 ms e non ci starebbe: va legata al LOD che il gioco ha gia').
Scartate col preventivo: cuocere i pezzi che non ruotano (con lo yaw ruota
tutto, e a 40 px una scarpa e' 3-4 pixel) e le mappe di normali (canvas 2D non
ha shader: circa 54.000 pixel di JS a fotogramma).

**Trappola trovata e da non dimenticare:** `globalCompositeOperation='overlay'`
costa **342 ms a fotogramma**, ottantotto volte `multiply`.

## Cose che costano care se si dimenticano

- il pollice sinistro **resta giu' per tutta la partita**: si muove trascinando,
  non si rialza. Ogni banco che alza il dito misura un gioco che non esiste.
- `folla.js` ha il percorso del gioco scritto dentro: non onora `--gioco`.
  Per bisezionare si scambia il file e si ripristina.
- `startMatch(taglia, 1)` misura sempre il cinque contro cinque: la taglia si
  passa con `startMatch(1, 1, {size: N})`.
- i backtick dentro un template literal chiudono la stringa: ogni commento
  iniettato nel gioco (o in un banco) ne dev'essere privo. Costato due volte.
- il telefono dipinge **meno** pixel del banco: 1620x768 = 1,24 Mpx, il 71%
  della risoluzione lineare vera. Margine 3,15-3,65 ms su 16,7.
  Avvio vero da icona a pallone toccabile: **1424 ms**.
- `strumenti/_vetro.js` e' il vetro condiviso (eventi binari sul dispositivo di
  ingresso del kernel); taratura in `strumenti/pollici-taratura.json`
  (rotazione 90 gradi, scala 0,35554 = 1/2,8125, residuo peggiore 0,06 px).

## Lavori aperti piu' grandi

- **#41** le divise contro l'erba (sopra), in corso.
- **#31/#42** la parata: `para` leggibile al 63,3%. E' la POSA, non la camera —
  il portiere si tuffa lungo la bocca della porta, che sullo schermo e'
  verticale (`tuffo` dz 1,382 contro dy 0,605).
- **#25** rivotazione della giuria dei 26.
- **#44** il fotogramma del duello costa 24 volte uno normale: disegna il mondo
  e poi lo copre con un fondale a schermo pieno.
- Onde 1-3 di `_analisi/agente28.md`: L1.2-L1.5 (i verbi che leggono il
  trascinamento) e la scoperta (la linea, gli inviti, il tutorial).
- Tempi ingresso->piede dal video del controller di FC 25.
- `_t-bordi.js` resta **trattenuta**: il suo critico l'ha rifiutata perche' il
  suo cancello usciva rosso una volta su tre.

---

# Nota storica: la conclusione sbagliata del mattino

Sotto sta scritto cio' che credevo prima di misurare, perche' una rettifica
senza l'affermazione rettificata non si puo' controllare.

Il mattino del 19 agosto il cancello `folla` era rosso e la bisezione accusava
**la toppa del cross**: pre-cross 4/4, pre-lob 2/4. Ho scritto che la toppa del
cross aveva spento la folla. **Era falso.** La toppa era innocente: aveva
insegnato alla CPU a crossare, e quindi a produrre EVENTI — e uno di questi
accendeva un cartello dentro la finestra di misura. Il cancello e' uscito rosso
**perche' il gioco era migliorato**. Escluso che fosse la camera con una prova
incrociata: scambiando la camera fra i due file i numeri non si muovono.
