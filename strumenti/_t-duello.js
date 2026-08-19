/* =====================================================================
   _t-duello.js — IL FOTOGRAMMA DEL DUELLO SMETTE DI DIPINGERE UN MONDO
   CHE NESSUNO VEDRA'.

   TERZA STESURA. La prima tagliava bene e apriva un buco: durante la
   SCOSSA, in fase 'zone', il fondale non copriva piu' il bordo dello
   schermo e sotto ci finiva il fotogramma precedente. Il difetto e' vero,
   l'ha trovato il critico, ed era invisibile alla prova che questa toppa
   portava con se'. Le due riparazioni della SECONDA stesura — l'ancoraggio
   (e) qui sotto e i tre casi nuovi della sonda — restano la parte
   importante del lavoro.

   LA SECONDA E' STATA APPROVATA CON RISERVA, e le riserve erano tutte e
   tre della stessa famiglia: NUMERI. Questa stesura le chiude.

     1. Il commento iniettato nel gioco portava «17.734 pixel diversi» e
        «1.258.798». Il primo era sbagliato di 22 pixel — l'isolamento
        pulito ne da' 17.712 esatti — e indeboliva proprio la cosa che
        doveva dimostrare, perche' 17.712 e' ANCHE il numero dei pixel che
        restavano scoperti: i due conti si incontrano invece di
        somigliarsi. Il secondo non lo sapeva ricostruire NESSUNO
        strumento consegnato, cioe' era della stessa famiglia dei «5,9
        secondi» che questa toppa aveva appena ritirato. Adesso: nel gioco
        c'e' 17.712 e la RICETTA per rifarlo, il milione e' uscito dal
        sorgente del gioco e sta qui nell'intestazione, e la variante
        scartata si costruisce con --dilata invece di doverla riscrivere a
        mano. Vedi (e).
     2. --conta, lanciato su un file GIA' TOPPATO, rispondeva «41 righe, 0
        delle quali codice» ed usciva zero. Adesso si RIFIUTA e dice
        perche'. Vedi conta().
     3. strumenti/_z-ripresa.js stampava «sui soli pixel deterministici:
        trapassa 4750 px», un numero falso che accusava il fondale di un
        difetto che non ha. La riga e' stata tolta e sostituita dal motivo
        per cui quel banco non puo' darla. Il numero vero — 1606 px prima,
        0 dopo — lo da' _zz-primer.js. Vedi la sezione sulla ripresa.

   E due riserve non bloccanti chiuse per misura invece che per riscrittura
   del testo: _z-scossona.js adesso spazza tutti e quattro i quadranti del
   segno (32 casi a segni misti su 65) e li DICHIARA, e il guadagno sul
   telefono e' rimisurato oggi con lo strumento di casa telefono.js, a cui
   e' stato aggiunto il modo --rigore.

   Toppa cerca/sostituisci. NON scrive dentro il gioco se non glielo si
   chiede: legge CALCETTO-il-gioco.html (o il file dato con --da),
   sostituisce CINQUE ancoraggi e scrive la copia altrove (--a). Se anche
   un solo ancoraggio non compare ESATTAMENTE UNA VOLTA si ferma con
   codice 1, dice quale manca e non scrive niente.

   uso:
     node strumenti/_t-duello.js --a fuori/dopo.html
     node strumenti/_t-duello.js --da altro.html --a fuori/dopo.html
     node strumenti/_t-duello.js --dentro          (scrive nel gioco)
     node strumenti/_t-duello.js --elenco          (solo i cinque punti)
     node strumenti/_t-duello.js --conta           (riconta le righe saltate;
                                   si RIFIUTA su un file gia' toppato invece
                                   di rispondere zero: vedi conta())
     node strumenti/_t-duello.js --solo a,b,c      (costruzioni parziali,
                                   per separare il taglio dal sigillo dal
                                   sigillo del bordo: vedi in fondo)
     node strumenti/_t-duello.js --solo a,b,c,d,e --dilata --a X.html
                                  (l'ancoraggio (e) nella CURA SCARTATA, il
                                   rettangolo dilatato, per poter rifare da
                                   capo il numero che l'ha scartata: vedi (e))

   la prova: node strumenti/_sonda-duello.js --prima X --dopo Z

   =====================================================================
   IL DIFETTO, IN DUE RIGHE DI POSIZIONE.

   In `render()` ci sono due inquadrature che coprono lo schermo intero e
   sostituiscono la vista dall'alto: la ripresa del gol e il duello dal
   dischetto. Erano scritte in due posti diversi.

   La ripresa esce SUBITO, in cima, prima della trasformazione di camera:

       if(G.scene==='goal' && G.ripresa){
         drawRipresaGol(); fasciaGolViva(true); return;
       }

   Il duello no. Il suo controllo stava IN FONDO, dopo la vignettatura e
   dopo drawBloom():

       if(G.scene==='freekick' && Duel.phase!=='off'){ drawDuelScene(); return; }

   Fra i due punti c'e' il MONDO: manto vivo, fari, insegne, folla, porte,
   scie, ombre dei giocatori, segni a terra, le figure ordinate per
   profondita', il pallone, le particelle, i lampi, la vignettatura a
   schermo pieno e il bloom. Poi arriva drawDuelScene(), che come prima
   cosa stende `duelFondo` — un fondale a schermo pieno con orizzonte e
   punto di fuga suoi — e copre tutto.

   QUANTO E' GROSSO IL BLOCCO SALTATO. `--conta` lo ricava dal file, non
   dalla memoria: conta le righe fra la chiusura del blocco della ripresa
   e la riga del vecchio controllo del duello, esclusi tutti e due gli
   estremi, con i commenti a blocco tolti. Sul file di oggi:

       304 righe di sorgente, 107 delle quali codice.

   (Il critico ne contava 108: e' la stessa cosa con un estremo dentro. Il
   numero che conta e' che sono tutte e sole DISEGNO, e quello e' verificato
   una per una qui sotto.)

   Il lavoro non e' «quasi sprecato»: e' sprecato al cento per cento.
   Nessuno di quei pixel sopravvive al fotogramma in cui e' stato scritto.

   =====================================================================
   QUANTO COSTA — e qui la prima stesura scriveva numeri che il suo stesso
   banco aveva respinto. Sono stati tolti tutti. Restano questi, e ognuno
   dice da dove viene.

   SUL TELEFONO VERO — OnePlus A6003 (OnePlus 6), Android 11, sdm845,
   schermo 1080x2280 a densita' 450. Due APK costruiti con
   strumenti/_t-apk.py dallo stesso HTML prima e dopo (base md5
   804328ee32d205024df6c265465e4ef5), misurati con

       node strumenti/telefono.js --rigore --apk X.apk --nome N --sec 15 --giri 2

   cioe' con LO STRUMENTO DI CASA, non con uno scritto per l'occasione: il
   modo --rigore e' stato aggiunto a telefono.js perche' quello che c'era
   misurava solo la partita, e la partita questa toppa non la tocca —
   misurarla avrebbe dato zero, che e' il modo piu' pulito di vincere sulla
   colonna che ci si e' scelti. Cronometra il LAVORO dentro window.frame,
   non l'intervallo fra i fotogrammi (quello e' il vsync e vale 16,7 ms
   qualunque cosa il gioco faccia), e RILEGGE la fase dal gioco a ogni
   fotogramma: se meno del 98% dei fotogrammi non e' di fase 'zone' la
   misura si butta invece di essere spacciata.
   Vista 810x384 a dpr 2,8125, tela 1620x768. Quattro passate ALTERNATE
   prima/dopo/prima/dopo, due giri da 15 secondi ciascuna, ~895 fotogrammi
   per giro, fase 'zone' 100% in tutti e otto i giri:

       lavoro mediano       prima 2,85 e 2,75 ms   dopo 2,20 e 2,20 ms
       p95                  prima 6,65 e 6,20      dopo 4,15 e 4,20
       fotogramma peggiore  prima  9,0 e  9,0      dopo  5,9 e  7,6
       fotogrammi persi     prima 0,2% e 0,2%      dopo 0,1% e 0,1%
       batteria da 31,1 a 32,6 gradi in tutta la sessione,
       mai piu' di +0,4 dentro una singola passata (soglia 4)

   Cioe': SEI DECIMI DI MILLISECONDO per fotogramma, il 21%, su un
   fotogramma che ne aveva 16,7 a disposizione — il margine passa dall'83%
   all'87%. E' un guadagno vero e piccolo, e va detto in questi termini.
   Dove si vede di piu' e' la CODA: il p95 scende da 6,2-6,7 a 4,2, cioe'
   un terzo, e il fotogramma peggiore da 9,0 a 5,9-7,6.

   I NUMERI DELLA PASSATA PRECEDENTE SONO SUPERATI, non confermati, e non
   si sommano a questi. Quelli («prima 2,50 e 2,70 / dopo 1,90 e 2,00»,
   «peggiore 22,7» e «persi 2,6%») venivano da strumenti/_z-telefono-duello.js
   su una base diversa e con una sessione diversa; il verso e l'ordine di
   grandezza del guadagno reggono, i valori assoluti no — in particolare i
   fotogrammi persi, che li' erano al 2,6-3,7% e qui allo 0,2%, cioe' erano
   di quella sessione e non del gioco. Valgono i numeri qui sopra.

   LA PROVA CHE SA FALLIRE, sulla stessa scena e con lo stesso strumento:
   telefono.js --rigore --sabota 20 sulla costruzione TOPPATA legge lavoro
   mediano 21,50 ms, p95 21,90, margine -29%. Se avesse continuato a dire
   «due millisecondi e due decimi», questa misura sarebbe da buttare.

   E QUI VA DETTA LA COSA SCOMODA: il fotogramma di duello sul telefono
   NON costava trenta millisecondi. Ne costava DUE E OTTO, cioe' MENO di un
   fotogramma di partita a 5 contro 5 (3,15 ms, misurato in una passata
   precedente con lo stesso strumento). Il «30,1 ms» della prima stesura
   era un numero del banco headless, dove il disegno e' in software, e non
   descriveva il dispositivo su cui gira il gioco. Detto altrimenti: la
   scena piu' sospetta del gioco era gia' la piu' leggera, e questa toppa
   la rende leggera di un altro quinto. Chi legge deve poterlo sapere
   prima di decidere quanto vale.

   AL BANCO HEADLESS: NON C'E' UN NUMERO IN MILLISECONDI CHE VALGA, e va
   detto perche' la prima stesura ne aveva tre. La sonda ha provato da sola
   che quel banco misura l'ORDINE DELLE CHIAMATE e non il duello:
   misurando il fotogramma di duello DOPO uno di partita usciva 26 ms
   anche sulla costruzione TOPPATA, cioe' su un ramo che fa una drawImage
   e due figure. E adesso lo prova anche il telefono, che sullo stesso
   fotogramma legge 2,8 ms contro i 30 del banco: un fattore dieci.
   Quindi «30,1 ms», «ventiquattro volte» e «da 48 a 78 volte piu'
   leggero» sono RITIRATI. Il banco headless serve ai PIXEL, che sa
   contare; ai millisecondi ci pensa il telefono.

   E anche «5,9 secondi a partita» e' ritirato: non l'ha prodotto nessuno
   strumento di questo deposito, era un numero senza fonte.

   LA CURA: uscire presto anche nel ramo del duello, come fa gia' la
   ripresa. Il controllo si sposta dal fondo alla cima, accanto a quello
   della ripresa, e le due inquadrature a schermo pieno diventano due
   righe che si leggono insieme invece di due righe distanti trecento.

   =====================================================================
   PERCHE' IL TAGLIO E' LECITO — le tre cose da verificare, perche' «esce
   prima» e' facile da dire e ognuna di queste tre, da sola, avrebbe reso
   il taglio una regressione muta.

   (1) LO STATO DELLA TELA AL PUNTO DI USCITA E' LO STESSO.
   In cima, `render()` ha gia' fatto `ctx.setTransform(DPR,0,0,DPR,0,0)`
   (ed e' l'ultima riga prima di updateCamera). In fondo, il vecchio punto
   di chiamata era preceduto da `ctx.setTransform(DPR,0,0,DPR,0,0)` subito
   dopo la vignettatura, e drawBloom() e' bilanciato in save/restore. Nei
   due punti la trasformazione e' identica. `updateCamera(rdt)` resta
   PRIMA di entrambe le uscite e continua a girare: la camera non si ferma
   perche' il duello non la disegna.

   (2) NIENTE DI CIO' CHE SI SALTA E' SIMULAZIONE.
   ATTENZIONE — LA PRIMA STESURA QUI SBAGLIAVA. Diceva: «il blocco saltato
   scrive esattamente due cose fuori da se'». E' falso, e l'esaustivita'
   era la parte che contava. Il Proxy su G.view aveva misurato bene UNA
   cosa e il rapporto l'aveva spacciata per tutto il blocco. Sono CINQUE, e
   il critico le ha trovate leggendo il codice; qui sono verificate una per
   una sul file di oggi, col numero di riga di chi le rilegge:

     · G.view.{Ax,Ay,S2,sx,sy} — la trasformazione mondo->schermo. Venti
       lettori, tutti di disegno, tutti a valle di questa uscita; e
       misurato, non dedotto: avvolgendo G.view in un Proxy che registra
       ogni accesso, durante un fotogramma di duello le letture sono ZERO.
     · G.hudTags.length=0 — lo rilegge solo drawHUD, che gia' prima del
       taglio non girava durante il duello.
     · campoVivoS2 (dichiarata :19134, azzerata :22037) — la rilegge SOLO
       campoVivoDisegna (:19147), che viene chiamata SOLO da dentro il
       blocco saltato (:22036). E' una variabile che non esce dal blocco.
       Non azzerarla vuol dire che al primo fotogramma dopo il duello il
       confronto «lo zoom e' fermo?» si fa contro lo zoom di PRIMA del
       duello: se la camera si e' mossa (e updateCamera continua a girare)
       il manto si ricuoce, che e' il verso sicuro dei due.
     · ordinaPerY (:22137, array di modulo dichiarato :22536) — usato solo
       dentro il blocco saltato, dalle righe :22145-:22166.
     · a.filo (:22156/:22159 — nel sorgente il nome della variabile di
       ciclo e' `a`, non `p`; l'oggetto e' il giocatore) — lo rilegge
       drawPlayer a :24401, e drawPlayer non gira durante il duello (le due
       figure del dischetto le disegna Rig3D). Al primo fotogramma dopo, il
       blocco lo riscrive prima che drawPlayer lo legga.
     · vigQ / buildVignette() (:22187) — e' la ricottura della cache della
       vignettatura quando scatta lo scalino dell'ora. Se lo scalino cade
       dentro i secondi del duello, la ricottura e' RIMANDATA al primo
       fotogramma dopo. La vignettatura non si disegna durante il duello,
       quindi nessuno la vede vecchia: si vede solo qualche millisecondo di
       cottura spostato di qualche secondo.

   Nessuna delle cinque tocca la simulazione. Ma «esattamente due» era
   un'affermazione di esaustivita' sbagliata, e va scritto che era
   sbagliata invece di correggerla in silenzio.

   Le particelle NON si muovono qui: avanzano in updateParticles(dt), che
   sta nel percorso di update e continua a girare. Se si fossero mosse nel
   disegno, saltare i secondi del rigore le avrebbe congelate e sarebbero
   ricomparse vive alla fine del duello.
   Nel blocco saltato non c'e' nessuna chiamata a Math.random: il flusso
   del generatore non cambia di un passo.

   (3) IL DUELLO COPRE DAVVERO OGNI PIXEL? NO, IN DUE MODI DIVERSI, e la
   prima stesura ne aveva visto uno solo.

   PRIMO BUCO — L'ORIZZONTE, all'8%. La riga in cui cielo e prato si
   incontrano a meta' di un pixel ha alfa 234 su 255. Vedi l'ancoraggio
   (c). Trovato dalla prima stesura, riparato dalla prima stesura.

   SECONDO BUCO — IL BORDO SOTTO LA SCOSSA, al 100%. E questo la prima
   stesura l'aveva ESCLUSO CON UN RAGIONAMENTO, che e' esattamente il
   genere di cosa che questo deposito non ammette. Il ragionamento diceva:
   «scossa e push-in dipendono dallo stesso SAVE.moto, e il push-in parte
   da 1,035, quindi il fondale e' sempre piu' grande della scossa». E'
   falso: il push-in vale 1,035 solo in fase 'result'. In fase 'zone' —
   quella in cui il dito mira, cioe' la piu' lunga — NON C'E' RAMO, e push
   resta esattamente 1. E la scossa in fase 'zone' c'e' eccome: il fallo
   chiama scossa(7.4, 0.30, ...) e startFreeKick() nello STESSO fotogramma,
   e niente azzera G.shake nel mezzo. Misurato con strumenti/_zz-fallo.js
   eseguendo le due righe vere del fallo:

       fotogrammi in fase 'zone' con scossa attiva dopo un fallo: 17 su 24
       scarto massimo 5,93 px css (11,9 px di periferica a dpr 2)

   E la conseguenza, misurata con strumenti/_zz-critica.js sulla
   costruzione toppata dalla PRIMA stesura (915x412 dpr2):

       zone  SENZA scossa   push 1,0000        0 px
       zone  CON  scossa    push 1,0000    17712 px  Δ255   <-- scoperto
       power poseT=0  CON   push 1,0000    17712 px  Δ255   <-- scoperto
       wait  poseT=0  CON   push 1,0000    17712 px  Δ255   <-- scoperto
       power poseT=.45 CON  push 1,0175        0 px
       result rt=0    CON   push 1,0350        0 px

   Δ255 vuol dire scoperto al cento per cento, non all'otto. Sedicimila
   pixel di cornice sfrangiata che sfarfalla, con sotto il fotogramma di
   duello precedente traslato da una scossa diversa, per tre decimi di
   secondo all'apertura di ogni rigore da fallo, nella configurazione DI
   SERIE (SAVE.moto=1). La prima stesura scriveva «differenza zero su otto
   fotogrammi con la scossa forzata al massimo»: era vero e vuoto, perche'
   la sonda accendeva la scossa solo nei cinque casi 'result', dove il
   push-in copre per costruzione. Verde per il motivo sbagliato — lo stesso
   errore del magenta che la prima stesura raccontava con orgoglio di aver
   corretto, un ripiano piu' in basso.

   La riparazione e' l'ancoraggio (e). E la sonda adesso prova i tre casi
   che mancavano: senza l'ancoraggio (e) ESCE 1.

   E LA SPAZZATA GROSSA ADESSO PROVA ANCHE GLI ANGOLI, che era l'ultima
   cosa che questo file DEDUCEVA invece di misurare. _z-scossona.js
   inchiodava shakeDX=0.80 e shakeDY=0.60, tutti e due positivi: il segno
   arrivava solo dalla fase del seno, quindi lo scarto SC finiva sempre
   sulla diagonale (+,+)/(-,-) e il caso A SEGNI MISTI — banda sinistra e
   banda inferiore insieme, cioe' un angolo — non veniva eseguito mai. Il
   rapporto scriveva «tutte e quattro le bande» e non era una misura.
   E non e' nemmeno un caso di laboratorio: la scossa del fallo e'
   scossa(..., p.slideDX, p.slideDY), cioe' la direzione in cui il
   difensore stava scivolando, di segno qualunque nei due assi.
   Adesso i quattro quadranti si spazzano tutti e il file DICHIARA quali ha
   eseguito, contandoli da scossaOff() invece che dai parametri:

       node strumenti/_z-scossona.js <cartella> DOPO.html
         65 casi (4 segni x 4 magnitudini x 4 istanti, piu' uno senza scossa)
         quadranti (+,+) 16 · (-,+) 16 · (+,-) 16 · (-,-) 16 · (0,0) 1
         a segni misti: 32 casi
         scarto massimo raggiunto 14,44 px css
         trapassano: 0 su 65                                    esito 0

       la stessa spazzata su SENZA_E.html (a,b,c,d senza il sigillo del
       bordo) trapassa in tutti i casi con la scossa, da 8.960 a oltre
       40.000 px Δ255                                            esito 1

   Cioe' la spazzata sa bocciare la costruzione che approva.

   =====================================================================
   QUELLO CHE IL TAGLIO CAMBIA DAVVERO NELL'IMMAGINE.

   A parita' di sigilli, il taglio lascia poche decine di pixel diversi in
   alcuni casi: UNA COLONNA larga un pixel sul bordo della coscia di una
   figura. Ecco i numeri, e il comando che li rifa' — perche' senza --solo
   la tabella «solo il taglio» non era rigenerabile e il critico aveva
   ragione a dirlo:

       node strumenti/_t-duello.js --solo c,d,e --a SOLOSIGILLI.html
       node strumenti/_t-duello.js              --a DOPO.html
       node strumenti/_sonda-duello.js --prima SOLOSIGILLI.html --dopo DOPO.html

       zone 23 px Δ10 · zone-SCOSSA 22 Δ6 · power-0 22 Δ6 · wait-0 22 Δ6
       power 24 Δ11 · wait 21 Δ5 · result-000 23 Δ7
       7 casi su 11, tutti nella fascia y558-587; gli altri 4 identici;
       CONTROLLO identiche in tutti e 11 (banco ripetibile)

   E il confronto va fatto proprio cosi'. Contro la costruzione NON
   sigillata lo stesso confronto legge 1598-3072 px, che sembrerebbe
   smentire il «poche decine»: ma quei pixel sono il sigillo
   dell'orizzonte, non il taglio. Senza --solo non si potevano distinguere,
   e «poche decine» sarebbe stato un eufemismo indimostrabile.

   LA CAUSA, trovata e provata, perche' «differenza piccola» non e' una
   spiegazione. Le due pennellate colpevoli hanno lo STESSO spessore
   (8,2612) e gli STESSI due colori (#7a4200 la coscia in luce, #5f3d1e
   quella in ombra): cambia solo QUALE DELLE DUE STA SOPRA.
   L'ordine di disegno dei segmenti lo decide ORD, un Int32Array di modulo
   riusato per OGNI figura di OGNI fotogramma e riordinato da un insertion
   sort che sfrutta apposta l'ordine rimasto. Il confronto e'
   `DEPTH[ORD[k]] < d`, stretto: a parita' di profondita' NON si scambia, e
   i due segmenti conservano l'ordine lasciato dalla figura precedente.
   Quella figura, prima del taglio, era un giocatore del mondo; dopo il
   taglio e' la figura precedente del duello.
   Cioe': l'immagine del duello dipendeva da cosa era stato disegnato
   prima. E' un difetto che c'era gia', e che il taglio rende visibile
   invece di introdurlo.

   LA CURA ESISTE ED E' MISURATA: azzerando ORD all'identita' prima del
   sort, le immagini tornano identiche, e sulla costruzione di oggi
   l'azzeramento non sposta un solo pixel nei fotogrammi del duello.
   NON E' IN QUESTA TOPPA, e il motivo va detto: quel sort serve OGNI
   figura di OGNI scena, e la neutralita' l'ho misurata SOLO sui fotogrammi
   del duello. Metterlo qui sarebbe scrivere un numero che non ho.

   =====================================================================
   LA RIPRESA DEL GOL — effetto collaterale dichiarato, e un difetto
   preesistente che questa toppa NON ripara.

   L'ancoraggio (c) sta dentro duelFondo, e duelFondo ha DUE chiamanti: il
   duello (:26790) e drawRipresaGol (:27685). Quindi il sigillo
   dell'orizzonte cambia anche i pixel della ripresa del gol. La prima
   stesura dichiarava «non tocca la ripresa del gol»: era falso, e il
   critico ha ragione.

   L'EFFETTO, MISURATO invece che sperato (strumenti/_z-ripresa.js e
   strumenti/_z-ripresa-dove.js, 915x412 dpr2, camera inchiodata):

     alfa della tessitura di duelFondo, letta texel per texel
         prima   1765 texel sotto 255, alfa minima 229, tutti su UNA riga
                 (y=80, l'orizzonte della geometria della ripresa)
         dopo    ZERO. La tessitura e' OPACA.

     copertura del SOLO fondale, disegnato da solo sulla tela primata
         prima   trapassa 1765 px, tutti sulla riga 80, Δ26
         dopo    trapassa 0 px

   Cioe': dopo il sigillo, nella ripresa del gol NIENTE puo' piu' passare
   da sotto il fondale. Il sigillo non e' un effetto collaterale
   «probabilmente benefico»: chiude il buco anche li', e si misura.

   E QUI LA STESURA SCORSA AVEVA RAGIONE NELLA CONCLUSIONE E TORTO NELLA
   PROVA, che e' il modo piu' facile di avere torto senza accorgersene.
   Diceva: il residuo «5362 px Δ217 scoperti dopo la toppa» NON E'
   STABILITO, perche' quel banco non e' ripetibile — sul fotogramma intero
   legge 9555 px ma legge anche che due render consecutivi dello stesso
   stato differiscono di 9383. Vero, e la conclusione («nella ripresa non
   passa piu' niente») e' giusta. Ma «il banco non sa rispondere» non e'
   una risposta, e' un rifiuto: lasciava aperta la possibilita' che sotto
   quei novemila pixel ci fosse davvero un trapasso.

   ADESSO LA RISPOSTA C'E', e non ha avuto bisogno di un banco ripetibile:
   basta un banco che sappia ESCLUDERE l'alternanza a periodo 2. La
   sequenza e' N N B B N N B B — un processo che si alterna a ogni render
   finisce in tutti e due i gruppi e si autoesclude — e un pixel conta come
   trapasso solo se i quattro scatti su nero coincidono fra loro, i quattro
   su bianco coincidono fra loro, e i due gruppi differiscono.
   Lo strumento l'ha scritto il critico (strumenti/_zz-primer.js) e questa
   passata l'ha rieseguito sulla base di oggi:

       scena 'gol'     prima  1606 px Δ26, TUTTI sulla riga y=80 (l'orizzonte)
                       dopo      0 px
       scena 'duello'  prima     0 px          senza (e)  17712 px Δ255
                       dopo      0 px
       instabili in tutte e due le costruzioni: 37784 su nero, 39004 su
       bianco — identici prima e dopo, cioe' la toppa non li tocca

   Cioe' il trapasso vero della ripresa era 1606 pixel e adesso e' zero, e
   i ~37.800 pixel instabili sono un'ALTRA cosa, che c'era prima e c'e'
   dopo. La prova con cui la stesura scorsa sosteneva la tesi non la
   sosteneva; questa si'.

   RESTA APERTO, ed e' un difetto preesistente che questa toppa non tocca:
   la ripresa del gol NON E' DETERMINISTICA fotogramma per fotogramma.
   ~37.800 pixel instabili fra scatti dello stesso stato, Δ fino a 237,
   raccolti attorno a poche colonne (x 1425-1429 e 1737-1740 di periferica)
   e alle righe 286-355. Il conteggio e' IDENTICO prima e dopo la toppa —
   verificato in questa passata — quindi la toppa non lo introduce e non lo
   ripara. E' la stessa famiglia del difetto di ORD descritto sopra —
   l'ordine lasciato dalla figura precedente — ma non l'ho provato, e
   finche' non l'ho provato lo scrivo come «non provato».

   Nota di metodo che il critico ha guadagnato: «finora sotto c'era il
   mondo e non se ne accorgeva nessuno» era una spiegazione GENERALE
   sbagliata. Vale per il duello, non per la ripresa. «Non se n'e' accorto
   nessuno» non prova che sotto ci fosse il mondo: prova che nessuno
   guardava.

   =====================================================================
   COSA NON FA QUESTA TOPPA, dichiarato.
   Non cambia una riga di simulazione: e' tutta nel disegno.
   Non tocca il ramo della moviola ne' il fermo composto di fine partita.
   Non tocca ORD ne' l'ordinamento dei segmenti (vedi sopra).
   Non ripara la non-ripetibilita' della ripresa del gol (vedi sopra).
   Non tocca il push-in: l'ancoraggio (d) sposta la DICHIARAZIONE di push
   fuori dal suo blocco e non tocca un solo valore che push assume.
   ===================================================================== */

const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const GIOCO = path.join(RADICE, 'CALCETTO-il-gioco.html');

const args = process.argv.slice(2);
const ha = (n) => args.includes('--' + n);
const arg = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d; };

/* ------------------------------------------------------------------ (a)
   L'USCITA ANTICIPATA DEL DUELLO, accanto a quella della ripresa.
   L'ancoraggio e' il blocco della ripresa per intero: e' il posto in cui
   la riga nuova deve stare, ed e' anche la prova che il posto esiste
   ancora. */
const A_VECCHIO = `  /* LA RIPRESA DEDICATA DEL GOL: un'altra inquadratura, come il duello
     dal dischetto — fondale suo, camera bassa del rig, fascia del gol
     sotto. Copre tutto: il mondo dall'alto non si disegna. */
  if(G.scene==='goal' && G.ripresa){
    drawRipresaGol();
    fasciaGolViva(true);
    return;
  }
`;

const A_NUOVO = `  /* LA RIPRESA DEDICATA DEL GOL: un'altra inquadratura, come il duello
     dal dischetto — fondale suo, camera bassa del rig, fascia del gol
     sotto. Copre tutto: il mondo dall'alto non si disegna. */
  if(G.scene==='goal' && G.ripresa){
    drawRipresaGol();
    fasciaGolViva(true);
    return;
  }

  /* IL DUELLO DAL DISCHETTO ESCE QUI, e per la stessa ragione della
     ripresa qui sopra: e' un'ALTRA INQUADRATURA, non un pannello posato
     sopra la partita. Fondale suo con orizzonte e punto di fuga propri,
     porta frontale, camera bassa del rig — copre lo schermo intero.

     QUESTO CONTROLLO STAVA TRECENTO RIGHE PIU' IN BASSO, dopo il bloom, e
     nel frattempo si dipingeva il mondo per intero. Il blocco che adesso
     si salta e' 304 righe di sorgente, 107 delle quali codice, ed e'
     TUTTO DISEGNO: manto vivo, fari, insegne, folla, porte, scie, ombre,
     le figure ordinate per profondita', il pallone, le particelle, i
     lampi, la vignettatura a schermo pieno e il bloom. Poi duelFondo ci
     passava sopra e cancellava tutto. Non era lavoro quasi sprecato: era
     sprecato per intero, e per tutti i secondi in cui il dito sta mirando
     un rigore — cioe' nel momento in cui il gioco ha piu' bisogno di
     essere pronto.

     PERCHE' SI PUO' USCIRE QUI. La trasformazione e' gia' quella giusta:
     il setTransform del DPR e' due righe sopra, ed e' lo stesso stato che
     c'era al vecchio punto di chiamata. Il blocco che si salta non simula
     niente: scrive fuori da se' CINQUE cose — G.view, G.hudTags,
     campoVivoS2, ordinaPerY, p.filo — piu' la ricottura della cache della
     vignettatura, e tutti i loro lettori sono di disegno e stanno a valle
     di questa uscita (cercati uno per uno, con le righe, in
     strumenti/_t-duello.js). Non e' solo un ragionamento: G.view e' stato
     avvolto in un Proxy che registra ogni lettura, e durante un fotogramma
     di duello le letture sono ZERO. Le particelle avanzano in
     updateParticles, non qui; e nel blocco non c'e' un Math.random, quindi
     il generatore non salta un passo.

     E IL FONDALE DEVE COPRIRE OGNI PIXEL, se no da qui in giu' trapela il
     fotogramma di prima. Non lo copriva in due punti, tutti e due
     riparati: la riga dell'orizzonte (trasparente all'8%, vedi duelFondo)
     e il BORDO SOTTO LA SCOSSA in fase 'zone', dove il push-in vale 1 e
     non allarga niente (vedi drawDuelScene). Il secondo l'aveva mancato
     la prima stesura di questa toppa, e la prova che la accompagnava non
     poteva vederlo.

     updateCamera resta SOPRA questa riga: la camera continua a seguire il
     gioco anche mentre il duello la nasconde, e al primo fotogramma dopo
     il rigore l'inquadratura e' quella giusta invece di un salto. */
  if(G.scene==='freekick' && Duel.phase!=='off'){ drawDuelScene(); return; }
`;

/* ------------------------------------------------------------------ (b)
   IL VECCHIO PUNTO DI CHIAMATA, che adesso e' irraggiungibile durante un
   duello e va tolto. Si tiene drawBloom() e si lascia al suo posto una
   nota che dice DOVE e' andato il controllo: una riga sparita senza
   spiegazione e' un enigma per chi legge fra un mese. */
const B_VECCHIO = `  drawBloom();
  /* Il duello dal dischetto copre tutto: e' un'altra inquadratura, non un
     pannello sopra la partita. Da qui in giu' il tabellone, le levette e
     gli striscioni tacciono — il loro posto lo prende il duello. */
  if(G.scene==='freekick' && Duel.phase!=='off'){ drawDuelScene(); return; }
`;

const B_NUOVO = `  drawBloom();
  /* IL DUELLO DAL DISCHETTO SI CONTROLLA IN CIMA, insieme alla ripresa
     del gol: cercalo subito dopo updateCamera. Stava qui, e da qui in giu'
     il tabellone, le levette e gli striscioni tacevano lo stesso — ma per
     arrivare a tacere si era gia' dipinto tutto il mondo sotto un fondale
     opaco che lo copriva. Adesso il ramo del duello non arriva mai fin
     qui: se ci arrivasse, la riga qui sotto sarebbe morta e questa nota
     sarebbe una bugia. */
`;

/* ------------------------------------------------------------------ (c)
   LA CUCITURA DELL'ORIZZONTE — primo dei due buchi del fondale.

   IL FATTO, misurato prima di scrivere il codice. Il fondale del duello
   NON E' OPACO su tutta la sua area: c'e' UNA riga — quella
   dell'orizzonte — in cui il canale alfa della tessitura scende a
   234 su 255. Il perche' e' aritmetico e non ha niente di misterioso:

     cielo   c.fillRect(0, 0,    VW, g.hz)
     prato   c.fillRect(0, g.hz, VW, VH-g.hz)

   e g.hz non e' intero — vale 130,4018 sulla vista di prova. Due
   riempimenti adiacenti che finiscono e cominciano a meta' di un pixel lo
   coprono tutti e due PARZIALMENTE, e due coperture parziali in
   source-over non fanno una copertura piena: restano circa otto punti
   percentuali di trasparenza sulla riga di confine.

   PERCHE' FINORA NON SI VEDEVA NEL DUELLO. Sotto quella riga c'era il
   mondo, disegnato opaco dallo stesso fotogramma. Uscendo presto, sotto
   c'e' il fotogramma PRECEDENTE, e un residuo che trapela all'8% e cambia
   a ogni fotogramma e' sporco che si muove.

   ATTENZIONE, EFFETTO FUORI DAL DUELLO: duelFondo lo usa anche
   drawRipresaGol. Questo sigillo cambia quindi anche i pixel della
   ripresa del gol — nel verso giusto (chiude due righe che trapelavano),
   ma non e' «una toppa che non tocca la ripresa». Vedi la sezione
   apposita in testa al file.

   LA CURA, di una parola: il cielo arriva fino a Math.ceil(g.hz) invece
   che a g.hz. Il prato si dipinge DOPO e parte sempre da g.hz, quindi il
   confine visibile non si sposta di un pixel: la spalla in piu' del cielo
   se la riprende il prato. Cambia solo che la riga di confine e' coperta
   due volte invece che due mezze volte, e l'alfa arriva a 255. */
const C_VECCHIO = `    c.fillStyle=sk; c.fillRect(0,0,VW,g.hz);`;
const C_NUOVO = `    /* IL CIELO SCAVALCA L'ORIZZONTE DI UN PIXEL, e non e' pignoleria.
       g.hz non e' intero (130,4018 sulla vista di prova): cielo e prato si
       fermavano e ripartivano a META' DI UN PIXEL, coprendolo tutti e due
       a meta'. Due coperture parziali in source-over non fanno una
       copertura piena — misurato: su quella riga l'alfa della tessitura
       vale 234 su 255, cioe' il fondale a schermo pieno era TRASPARENTE
       all'8% lungo tutto l'orizzonte.
       Finche' sotto c'era il mondo disegnato dallo stesso fotogramma non
       se ne accorgeva nessuno. Da quando il duello esce presto, sotto c'e'
       il fotogramma PRECEDENTE, e un residuo che trapela all'8% e cambia a
       ogni fotogramma e' sporco che si muove.
       Questa tessitura la usa anche drawRipresaGol: il sigillo vale per
       tutte e due le scene, ed e' giusto cosi' — un fondale a schermo
       pieno deve essere opaco in tutte e due.
       Il prato si dipinge dopo e parte sempre da g.hz: il confine visibile
       non si sposta, la spalla in piu' del cielo se la riprende lui. */
    c.fillStyle=sk; c.fillRect(0,0,VW,Math.ceil(g.hz));`;

/* ------------------------------------------------------------------ (d)
   IL PUSH-IN ESCE DAL SUO BLOCCO. Non cambia un valore: cambia solo dove
   e' visibile il nome, perche' l'ancoraggio (e) — settanta righe piu' in
   basso — deve sapere di quanto e' stato ingrandito il quadro per
   decidere quanto allargare il fondale. Il blocco graffa resta dov'era,
   cosi' il confronto fra le due versioni e' una riga. */
const D_VECCHIO = `  {
    let push=1;
    if(SAVE.moto){
      if(D.phase==='power'||D.phase==='wait') push=1+0.035*clamp((D.poseT||0)/0.90,0,1);
      else if(D.phase==='result')
        push=1+0.035+0.075*clamp(rt/0.30,0,1)-0.085*clamp((rt-0.80)/0.70,0,1);
    }
    if(push!==1){
      ctx.translate(VW/2, g.GLY); ctx.scale(push,push); ctx.translate(-VW/2,-g.GLY);
    }
  }
`;

const D_NUOVO = `  /* push VIVE FINO AL FONDALE. La dichiarazione esce dal blocco qui sotto
     perche' il fondale (poco piu' avanti) deve sapere se il quadro e' gia'
     stato ingrandito: quando push>1 il fondale copre da solo lo scarto
     della scossa, quando push==1 no. Nessun valore di push cambia. */
  let push=1;
  {
    if(SAVE.moto){
      if(D.phase==='power'||D.phase==='wait') push=1+0.035*clamp((D.poseT||0)/0.90,0,1);
      else if(D.phase==='result')
        push=1+0.035+0.075*clamp(rt/0.30,0,1)-0.085*clamp((rt-0.80)/0.70,0,1);
    }
    if(push!==1){
      ctx.translate(VW/2, g.GLY); ctx.scale(push,push); ctx.translate(-VW/2,-g.GLY);
    }
  }
`;

/* ------------------------------------------------------------------ (e)
   IL FONDALE COPRE IL BORDO ANCHE QUANDO LA SCOSSA LO SPOSTA.
   E' l'ancoraggio che questa toppa non aveva, ed e' quello per cui la
   prima stesura e' stata bocciata.

   IL FATTO. drawDuelScene apre con

       const SC=scossaOff(); ctx.save(); ctx.translate(SC[0],SC[1]);

   e stendeva il fondale su (0,0,VW,VH) DENTRO quella traslazione. Un
   rettangolo grande quanto lo schermo, traslato di SC, lascia scoperta una
   striscia larga SC su due lati. Finche' sotto c'era il mondo dello stesso
   fotogramma non si vedeva; con il taglio (a) sotto c'e' il fotogramma
   precedente, traslato da una scossa diversa: una cornice sfrangiata che
   sfarfalla.

   IL RAGIONAMENTO CHE AVEVA ASSOLTO QUESTO BORDO, e perche' era sbagliato.
   Diceva: «il push-in parte da 1,035 e ingrandisce attorno a un punto
   interno, quindi ogni lato esce dal quadro invece di rientrarci». Vero,
   ma solo in fase 'result'. Le fasi 'power' e 'wait' partono da push=1 (a
   poseT=0) e la fase 'zone' NON HA RAMO: push resta 1 per tutta la mira,
   che e' la fase piu' lunga del duello.
   E la scossa in fase 'zone' non e' un'ipotesi: il fallo esegue
   scossa(7.4,0.30,dx,dy) e startFreeKick() nello stesso fotogramma, e
   niente azzera G.shake in mezzo. Misurato (strumenti/_zz-fallo.js): 17
   fotogrammi di fase 'zone' su 24 con la scossa attiva, scarto massimo
   5,93 px css.

   LE TRE CURE PROVATE, E PERCHE' HA VINTO LA TERZA. Questo pezzo sta qui
   perche' la scelta e' stata MISURATA e le prime due erano peggio.

   (1) DARE A push UN PAVIMENTO. Copre, ma con uno ZOOM del quadro: il
       punto fisso del push e' (VW/2, g.GLY), non il centro dello schermo,
       quindi per coprire 6 px in basso ci vorrebbe un push attorno a 1,07
       — un sussulto d'inquadratura del sette per cento all'apertura del
       rigore. Scartata senza misurarla: e' un movimento di camera, e si
       vede.

   (2) STENDERE IL FONDALE SU UN RETTANGOLO DILATATO, cioe' drawImage su
       (-e,-e, VW+2e, VH+2e). Copre, ed e' la cura che il critico
       proponeva. Scritta, applicata, MISURATA — e scartata sul numero:
       dilatare il rettangolo RISCALA tutta la tessitura, e su un fondale
       pieno di tribuna e di grana questo sposta ogni pixel di quanto
       basta a cambiarlo. Lo spostamento e' zero al centro e cresce verso i
       bordi fino a 4-5 px css, e l'orizzonte — che sta in alto — e' fra i
       pezzi che si spostano di piu'. Riparare un bordo di 4 px muovendo
       quasi tutto il quadro non e' una riparazione, e' uno scambio.

       IL NUMERO CHE LA SCARTA SI RIFA' DA CAPO, ed e' il motivo per cui
       questa cura non e' stata cancellata ma tenuta viva dietro --dilata.
       La stesura scorsa incideva nel gioco «1.258.798 pixel diversi» —
       un numero che NESSUNO STRUMENTO CONSEGNATO sapeva ricostruire, cioe'
       esattamente la famiglia dei «5,9 secondi» che questa toppa aveva
       ritirato un ripiano piu' su. Adesso la variante si costruisce:

           node strumenti/_t-duello.js --solo a,b,c,d --a SENZA.html
           node strumenti/_t-duello.js --a CLAMP.html
           node strumenti/_t-duello.js --solo a,b,c,d,e --dilata --a DILAT.html
           node strumenti/_sonda-duello.js --prima SENZA.html --dopo DILAT.html
           node strumenti/_sonda-duello.js --prima SENZA.html --dopo CLAMP.html

       MISURATO COSI' sulla base di oggi (md5 804328ee32d205024df6c265465e4ef5,
       915x412 dpr 2, tela 1830x824 = 1.507.920 px per fotogramma) — i
       numeri stanno qui, nell'intestazione dello strumento che li rifa',
       e NON nel sorgente del gioco:

           cura (2) dilatata   da 1.241.678 a 1.307.361 px diversi, Δ≤122,
                               in DIECI casi su undici (tutti quelli in cui
                               la scossa e' accesa, anche quelli in cui il
                               push-in copriva gia' il bordo da solo)
           cura (3) applicata  17.712 px diversi, Δ113, in TRE casi su
                               undici — gli stessi tre in cui il bordo
                               restava scoperto; gli altri otto identici
                               al bit

       Cioe' l'82-87% del quadro contro l'1,2%. E i 17.712 della cura (3)
       sono lo STESSO numero, alla unita', dei pixel che la sonda conta
       come scoperti sulla costruzione senza (e): la cura tocca il buco e
       nient'altro, e i due conti si incontrano invece di somigliarsi.
       (La stesura scorsa scriveva 17.734 e li incideva nel gioco: 22 pixel
       di troppo, presi da un isolamento sporco, che indebolivano proprio la
       cosa che dimostravano. Il numero giusto e' 17.712.)

       Nel caso 'zone' senza scossa tutte e due le cure non fanno niente e
       le immagini restano identiche al bit: la riparazione e' un
       NON-INTERVENTO dove non c'era niente da riparare.

   (3) QUELLA APPLICATA: IL BORDO DELLA TESSITURA SI ESTENDE, e basta.
       Il fondale resta steso su (0,0,VW,VH) — non si sposta, non si
       riscala, non si ricampiona: i pixel visibili del fondale restano
       IDENTICI AL BIT a quelli di prima. Poi, e SOLO se la scossa e'
       accesa, si riempiono le bande rimaste fuori ristendendoci la RIGA o
       la COLONNA di bordo della tessitura. E' esattamente quello che fa un
       campionatore in CLAMP_TO_EDGE, ed e' il minimo possibile: cambia i
       pixel che prima non erano scritti da nessuno, e nessun altro.

           I pixel che la cura (3) cambia sono ESATTAMENTE quelli che
           prima restavano scoperti — stesso numero, non «circa»: vedi la
           tabella qui sopra e il conto della copertura nella sonda.
           Cioe' la cura (3) tocca il buco e nient'altro.

       Costa due drawImage sottili (una banda verticale e una
       orizzontale), solo nei fotogrammi con la scossa, e zero negli
       altri. duelFondo non si tocca: stessa tessitura, stessa chiave,
       nessuna ricottura.

   IL CONTO DELLE BANDE. Dopo translate(SC) e il push (che scala di push
   attorno a P=(VW/2, g.GLY)), un punto locale r finisce sullo schermo in
   s = SC + P + push*(r-P). Invertendo, il quadro [0,VW]x[0,VH] viene da
   r = P + (s-SC-P)/push. Le bande da riempire sono le parti di
   quell'antimmagine che cadono fuori da [0,VW]x[0,VH], arrotondate in
   fuori di un pixel intero. Con SC=(0,0) l'antimmagine sta tutta dentro e
   non si disegna niente: la riparazione e' un NON-INTERVENTO in tutti i
   fotogrammi in cui non c'era niente da riparare — comprese tutte le
   misure d'immagine fatte finora.

   PROVATO: strumenti/_sonda-duello.js ha adesso i tre casi che mancavano
   (zone, power a poseT=0, wait a poseT=0, tutti CON la scossa). Senza
   questo ancoraggio la sonda esce 1 e stampa la striscia. */
const E_VECCHIO = `  ctx.drawImage(duelFondo(g, 1, 0), 0,0, VW, VH);`;
const E_NUOVO = `  const fondo=duelFondo(g, 1, 0);
  ctx.drawImage(fondo, 0,0, VW, VH);
  /* LE BANDE CHE LA SCOSSA LASCIA SCOPERTE, chiuse col bordo del fondale.
     Il fondale e' steso su (0,0,VW,VH) DENTRO la translate(SC): un
     rettangolo grande quanto lo schermo ma spostato lascia scoperta una
     striscia larga SC su due lati. In fase 'result' non si vede, perche'
     il push-in vale gia' 1,035 e allarga tutto; ma in fase 'zone' — la
     mira, la fase piu' lunga — push vale ESATTAMENTE 1, e il fallo che
     apre il rigore lascia la scossa accesa per 17 fotogrammi su 24
     (misurato). Finche' il mondo si dipingeva sotto, quella striscia la
     copriva lui; da quando il duello esce presto, sotto c'e' il fotogramma
     precedente: 17.712 pixel di cornice sfrangiata che sfarfalla, Δ255.
     Qui NON si sposta e NON si riscala il fondale — i suoi pixel visibili
     restano identici al bit — si ristende solo la riga o la colonna di
     BORDO della tessitura sulle bande rimaste fuori, che e' quello che fa
     un campionatore in clamp-to-edge. La cura alternativa (stendere il
     fondale su un rettangolo dilatato) copriva uguale ma RISCALAVA tutta
     la tessitura, e cambiava i pixel del quadro a milioni invece che a
     migliaia. Nessuno di questi due numeri va creduto sulla parola: si
     rifanno da capo, e i comandi che li rifanno sono questi tre —
        node strumenti/_t-duello.js --solo a,b,c,d --a SENZA.html
        node strumenti/_t-duello.js --a CLAMP.html
        node strumenti/_t-duello.js --solo a,b,c,d,e --dilata --a DILAT.html
     poi _sonda-duello.js --prima SENZA.html --dopo CLAMP.html e lo stesso
     con DILAT.html. Il primo confronto e' il numero qui sopra.
     Le bande sono l'antimmagine del quadro attraverso translate+push
     (s = SC + P + push*(r-P), P=(VW/2,g.GLY)) meno il quadro stesso. Con
     la scossa ferma non si disegna niente: costo zero, pixel zero. */
  if(SC[0]!==0 || SC[1]!==0){
    const cx=VW/2, cy=g.GLY, ip=1/push;
    let a0=cx+(0 -SC[0]-cx)*ip, a1=cx+(VW-SC[0]-cx)*ip;
    let b0=cy+(0 -SC[1]-cy)*ip, b1=cy+(VH-SC[1]-cy)*ip;
    a0=a0<0?Math.floor(a0)-1:0;  a1=a1>VW?Math.ceil(a1)+1:VW;
    b0=b0<0?Math.floor(b0)-1:0;  b1=b1>VH?Math.ceil(b1)+1:VH;
    const TW=fondo.width, TH=fondo.height;
    if(a0<0)  ctx.drawImage(fondo, 0,0, 1,TH,  a0,0, -a0,VH);
    if(a1>VW) ctx.drawImage(fondo, TW-1,0, 1,TH,  VW,0, a1-VW,VH);
    if(b0<0)  ctx.drawImage(fondo, 0,0, TW,1,  a0,b0, a1-a0,-b0);
    if(b1>VH) ctx.drawImage(fondo, 0,TH-1, TW,1,  a0,VH, a1-a0,b1-VH);
  }`;

/* LA CURA (2), QUELLA SCARTATA, tenuta viva dietro --dilata e SOLO per
   ricostruire il numero che l'ha scartata. Non entra mai nel gioco: --dentro
   con --dilata si rifiuta.
   Perche' esiste un file per una cura bocciata: perche' la stesura scorsa
   incideva nel sorgente del gioco il numero che la bocciava senza consegnare
   niente che sapesse rifarlo. Un numero cosi' non si difende, si crede — ed
   e' la trappola di casa. Adesso si rifa' con un comando.
   La dilatazione e' condizionata alla scossa esattamente come la cura (3):
   se non lo fosse, il confronto sarebbe fra due cose diverse e il numero
   direbbe anche quanto costa dilatare quando non serve. */
const E_DILATA = `  const fondo=duelFondo(g, 1, 0);
  {
    /* CURA SCARTATA — rettangolo dilatato. Vedi strumenti/_t-duello.js (e). */
    const e = (SC[0]!==0 || SC[1]!==0)
      ? Math.ceil(Math.max(Math.abs(SC[0]), Math.abs(SC[1]))) + 1 : 0;
    ctx.drawImage(fondo, -e,-e, VW+2*e, VH+2*e);
  }`;

const DILATA = args.includes('--dilata');

const TOPPE = [
  { id: 'a', nome: 'uscita-in-cima', dove: "render: l'uscita anticipata del duello accanto a quella della ripresa", da: A_VECCHIO, a: A_NUOVO },
  { id: 'b', nome: 'vecchio-punto', dove: 'render: il controllo del duello in fondo, dopo drawBloom', da: B_VECCHIO, a: B_NUOVO },
  { id: 'c', nome: 'sigillo-orizzonte', dove: "duelFondo: il cielo copre la riga di confine, che era trasparente all'8%", da: C_VECCHIO, a: C_NUOVO },
  { id: 'd', nome: 'push-visibile', dove: 'drawDuelScene: la dichiarazione di push esce dal blocco (nessun valore cambia)', da: D_VECCHIO, a: D_NUOVO },
  DILATA
    ? { id: 'e', nome: 'sigillo-bordo-DILATATO', dove: 'drawDuelScene: CURA SCARTATA (rettangolo dilatato) — solo per rifare il numero che la scarta', da: E_VECCHIO, a: E_DILATA }
    : { id: 'e', nome: 'sigillo-bordo', dove: 'drawDuelScene: il fondale copre il bordo anche sotto la scossa', da: E_VECCHIO, a: E_NUOVO },
];

/* Le coppie che non si possono spezzare: (e) legge `push`, che esiste
   fuori dal blocco solo grazie a (d). Una costruzione parziale con (e) e
   senza (d) sarebbe un ReferenceError a fotogramma, cioe' un cancello
   rotto invece di una misura. */
const DIPENDE = { e: ['d'] };

if (ha('elenco')) {
  for (const t of TOPPE) console.log('(' + t.id + ') ' + t.nome.padEnd(20) + t.dove);
  process.exit(0);
}

/* ------------------------------------------------------------------ --conta
   IL BLOCCO SALTATO SI RICONTA DAL FILE, non si ricorda. Fra la chiusura
   del blocco della ripresa e la riga del vecchio controllo del duello,
   estremi esclusi, con i commenti a blocco tolti.

   E PRIMA DI CONTARE, IL RIFIUTO. La stesura scorsa, lanciata su un file
   GIA' TOPPATO, trovava il ramo del duello nella sua posizione NUOVA —
   subito sotto il blocco della ripresa — misurava le poche righe di
   commento rimaste in mezzo e rispondeva

       «41 righe di sorgente, 0 delle quali codice»   con esito 0.

   Cioe' rispondeva ZERO a una domanda a cui non poteva rispondere, e lo
   faceva con l'aria di aver misurato. Nel frattempo il commento inciso nel
   gioco prometteva «304 righe, 107 delle quali codice» e diceva che
   --conta le rifa': sul file spedito non le rifaceva. Un cancello che dice
   zero e' peggio di un cancello che non c'e'.

   IL RICONOSCIMENTO NON E' UN'EURISTICA — niente soglie sul numero di
   righe, che sarebbe lo stesso male con un vestito nuovo. Si cercano due
   fatti strutturali, tutti e due definiti qui sopra come ancoraggi di
   questa stessa toppa:
     · il VECCHIO PUNTO DI CHIAMATA (ancoraggio b) deve esserci una volta:
       e' quello che chiude il blocco da contare, e la toppa lo cancella;
     · il ramo del duello deve comparire UNA volta sola: se ce ne sono due
       (costruzione --solo a senza b) non si sa quale dei due delimita.
   Se uno dei due non torna, si dice cosa manca, si dice cosa fare, e si
   esce 1 SENZA STAMPARE UN NUMERO. */
const RAMO_DUELLO = "if(G.scene==='freekick' && Duel.phase!=='off'){ drawDuelScene(); return; }";

function conta(testo) {
  const nRami = testo.split(RAMO_DUELLO).length - 1;
  const nVecchio = testo.split(B_VECCHIO).length - 1;
  if (nVecchio !== 1 || nRami !== 1) {
    return {
      errore:
        'MI RIFIUTO DI CONTARE: questo file non e\' quello a cui --conta sa rispondere.\n' +
        `  ramo del duello trovato ${nRami} volte (ne serve 1)\n` +
        `  vecchio punto di chiamata, ancoraggio (b), trovato ${nVecchio} volte (ne serve 1)\n` +
        (nVecchio === 0 && nRami === 1
          ? '  Il file e\' GIA\' TOPPATO: il ramo del duello sta in cima e fra i due estremi non\n' +
          '  resta piu' + '\' niente da saltare. La risposta sarebbe «0 righe di codice», che non e\'\n' +
          '  una misura: e\' un numero falso con l\'aria di una misura.\n'
          : '  Il file non ha la forma che questa toppa si aspetta.\n') +
        '  --conta misura il blocco che il ramo del duello SALTAVA quando stava in fondo,\n' +
        '  quindi ha senso solo sul gioco NON toppato:\n' +
        '      node strumenti/_t-duello.js --conta\n' +
        '      node strumenti/_t-duello.js --da <il-file-di-partenza.html> --conta',
    };
  }
  const L = testo.split('\n');
  const iRip = L.findIndex(r => r.indexOf("if(G.scene==='goal' && G.ripresa){") >= 0);
  const iDue = L.findIndex(r => r.indexOf(RAMO_DUELLO) >= 0);
  if (iRip < 0 || iDue < 0) return null;
  if (iDue < iRip) return { errore: 'MI RIFIUTO DI CONTARE: il ramo del duello sta PRIMA del blocco della ripresa.' };
  /* la chiusura del blocco della ripresa: la prima riga '  }' dopo iRip */
  let iFine = -1;
  for (let k = iRip; k < iDue; k++) if (L[k] === '  }') { iFine = k; break; }
  if (iFine < 0) return null;
  let dentro = false, codice = 0, tot = 0;
  for (let k = iFine + 1; k < iDue; k++) {
    tot++;
    let out = '', s = L[k];
    for (let j = 0; j < s.length; j++) {
      if (!dentro && s[j] === '/' && s[j + 1] === '*') { dentro = true; j++; continue; }
      if (dentro && s[j] === '*' && s[j + 1] === '/') { dentro = false; j++; continue; }
      if (!dentro) out += s[j];
    }
    if (out.replace(/\/\/.*$/, '').trim()) codice++;
  }
  return { da: iFine + 2, a: iDue, tot, codice };
}

const da = path.resolve(arg('da', GIOCO));
if (!fs.existsSync(da)) { console.error('FALLITO: non trovo ' + da); process.exit(2); }
let testo = fs.readFileSync(da, 'utf8');
/* I BYTE SONO BYTE, NON CARATTERI. La stesura scorsa stampava testo.length
   chiamandolo «byte»: su un file pieno di accenti italiani sono due cose
   diverse (1.689.382 contro 1.694.101 sul gioco di oggi), e chi confrontava
   quel numero con l'md5 del file trovava una discrepanza che non c'era. */
const partenza = Buffer.byteLength(testo, 'utf8');

if (ha('conta')) {
  const c = conta(testo);
  if (!c) { console.error('FALLITO: non trovo i due estremi del blocco in ' + da); process.exit(1); }
  if (c.errore) { console.error(c.errore + '\n  file: ' + da); process.exit(1); }
  console.log(`${da}`);
  console.log(`blocco saltato: righe ${c.da}-${c.a} = ${c.tot} righe di sorgente, ${c.codice} delle quali codice`);
  console.log('(commenti a blocco tolti; estremi — la chiusura della ripresa e la riga del duello — esclusi)');
  process.exit(0);
}

const dentro = ha('dentro');
/* --dilata costruisce la cura SCARTATA. Serve a rifare il numero che la
   scarta, e non deve poter finire nel gioco nemmeno per sbaglio. */
if (DILATA && dentro) {
  console.error('FALLITO: --dilata costruisce la cura (2), quella MISURATA E SCARTATA.\n' +
    "  Esiste solo per poter rifare il numero che la scarta, e non si scrive dentro il gioco.\n" +
    '  Usa --a <file di uscita>. Niente e\' stato scritto.');
  process.exit(2);
}
const a = dentro ? da : (arg('a', '') ? path.resolve(arg('a', '')) : '');
if (!a) { console.error('serve --a <file di uscita> (oppure --dentro, --elenco, --conta)'); process.exit(2); }

/* --solo a,c  ->  costruzioni parziali, per separare gli effetti nella
   tabella della sonda. Non e' una comodita': senza questa bandiera la
   tabella «solo taglio / solo sigillo» del rapporto non era rigenerabile
   con gli strumenti consegnati, e il critico aveva ragione a dirlo. */
const soloS = arg('solo', '');
let SCELTE = TOPPE;
if (soloS) {
  const v = String(soloS).split(/[,\s]+/).filter(Boolean);
  const ignoti = v.filter(x => !TOPPE.some(t => t.id === x));
  if (ignoti.length) { console.error('FALLITO: ancoraggi ignoti in --solo: ' + ignoti.join(',')); process.exit(2); }
  for (const x of v) for (const dip of (DIPENDE[x] || [])) {
    if (!v.includes(dip)) {
      console.error(`FALLITO: --solo ${v.join(',')} e' una costruzione che non gira.\n` +
        `  (${x}) ha bisogno di (${dip}): senza, il gioco tira un ReferenceError a ogni fotogramma di duello.\n` +
        `  Niente e' stato scritto.`);
      process.exit(2);
    }
  }
  SCELTE = TOPPE.filter(t => v.includes(t.id));
}

const mancanti = [];
for (const t of SCELTE) {
  const n = testo.split(t.da).length - 1;
  if (n !== 1) mancanti.push(`  (${t.id}) ${t.nome.padEnd(20)} trovato ${n} volte (ne serve 1) — ${t.dove}`);
}
if (mancanti.length) {
  console.error('FALLITO: ancoraggi non validi in ' + da + '\n' + mancanti.join('\n') +
    '\nNiente e\' stato scritto. Il file di gioco e\' cambiato: rifare l\'ancoraggio a mano.');
  process.exit(1);
}

for (const t of SCELTE) testo = testo.replace(t.da, t.a);

/* Controllo di ritorno: il nuovo c'e' una volta sola, e il vecchio non c'e'
   piu'. La seconda meta' va detta con cura: la toppa (a) e' additiva —
   tiene il blocco della ripresa e gli appende sotto l'uscita del duello —
   quindi il testo NUOVO contiene il VECCHIO per costruzione, e cercare il
   vecchio nel file darebbe sempre un falso allarme. Il controllo giusto
   e' allora: il vecchio non deve comparire piu' di quanto il nuovo se lo
   porti dentro. */
const rotti = [];
for (const t of SCELTE) {
  if (testo.split(t.a).length - 1 !== 1) rotti.push(`(${t.id}) il testo nuovo non compare una volta sola`);
  const atteso = t.a.split(t.da).length - 1;      // quante volte il nuovo se lo porta dentro
  const trovato = testo.split(t.da).length - 1;
  if (trovato !== atteso) rotti.push(`(${t.id}) il testo vecchio compare ${trovato} volte (ne servono ${atteso})`);
}
/* IL CONTROLLO CHE CONTA: con (a) e (b) applicate, il ramo del duello deve
   esistere UNA volta sola in tutto il file. Se ne restassero due, il
   vecchio sarebbe ancora raggiungibile e la toppa non avrebbe tagliato
   niente — un cancello verde su un lavoro non fatto. Con --solo il conto
   atteso cambia, e va calcolato invece che dato per scontato: se (a) c'e'
   ma (b) no, i rami sono DUE (ed e' una costruzione che non serve a
   niente: la si rifiuta subito qui sotto). */
const cA = SCELTE.some(t => t.id === 'a'), cB = SCELTE.some(t => t.id === 'b');
if (cA !== cB) rotti.push("(a) e (b) sono lo stesso taglio in due punti: o tutte e due o nessuna delle due");
else {
  const atteso = 1;
  for (const [che, quanto] of [
    ["la condizione del ramo duello", `if(G.scene==='freekick' && Duel.phase!=='off')`],
    ['la chiamata a drawDuelScene', 'drawDuelScene();'],
  ]) {
    const n = testo.split(quanto).length - 1;
    if (n !== atteso) rotti.push(`${che} compare ${n} volte (ne serve ${atteso})`);
  }
}
/* E il controllo che il critico ha guadagnato: se (e) e' entrata, `push`
   deve essere dichiarato FUORI dal blocco, se no il file non gira. Si
   verifica sul testo prodotto, non sulla fiducia. */
if (SCELTE.some(t => t.id === 'e')) {
  if (testo.split('  let push=1;\n  {\n').length - 1 !== 1)
    rotti.push("(e) e' applicata ma `push` non e' dichiarato fuori dal blocco: il duello tirerebbe un ReferenceError");
  if (testo.split('const fondo=duelFondo(g, 1, 0);').length - 1 !== 1)
    rotti.push("(e): il fondale non viene preso una volta sola col codice nuovo");
  if (!DILATA && testo.split('ctx.drawImage(fondo, 0,0, 1,TH,  a0,0, -a0,VH);').length - 1 !== 1)
    rotti.push("(e): la banda sinistra non c'e'");
  if (DILATA && testo.split('ctx.drawImage(fondo, -e,-e, VW+2*e, VH+2*e);').length - 1 !== 1)
    rotti.push("(e --dilata): la stesura dilatata non c'e'");
  if (DILATA && testo.split('ctx.drawImage(fondo, 0,0, VW, VH);').length - 1 !== 0)
    rotti.push("(e --dilata): il fondale viene ancora steso anche su (0,0,VW,VH): sarebbero due stesure");
}

if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(a), { recursive: true });
fs.writeFileSync(a, testo);
console.log(`toppa applicata: ${SCELTE.length} ancoraggi su ${TOPPE.length}${soloS ? '  (--solo ' + soloS + ')' : ''}`);
for (const t of SCELTE) console.log(`  ok   (${t.id}) ${t.nome.padEnd(20)} ${t.dove}`);
for (const t of TOPPE) if (!SCELTE.includes(t)) console.log(`  --   (${t.id}) ${t.nome.padEnd(20)} NON applicata`);
const arrivo = Buffer.byteLength(testo, 'utf8');
console.log(`  --   ${da}\n  ->   ${a}\n  --   ${partenza} -> ${arrivo} byte (${arrivo - partenza >= 0 ? '+' : ''}${arrivo - partenza})`);
