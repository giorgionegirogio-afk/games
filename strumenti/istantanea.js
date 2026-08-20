/* =====================================================================
   ISTANTANEA — il FREEZE-FRAME TEST, misurato al pixel.

   Perché esiste. Dieci giudici su ventisei hanno scritto la stessa frase
   con parole diverse: «metto in pausa in un istante QUALSIASI dell'azione
   — scelto da me, non coreografato — e il fotogramma deve reggere da solo
   come illustrazione da manifesto. Il giorno in cui il fotogramma casuale
   dell'AZIONE vale quanto la lavagnetta di fine partita, il 9 lo scrivo».
   È, alla lettera, il criterio con cui la giuria ha promesso di riscrivere
   il voto. Finché quel criterio resta un'opinione da guardare a occhio,
   ogni onda di lavoro finisce in una discussione; qui diventa un numero
   che nessuno può discutere, ripetibile al bit.

   Cosa misura, e su che cosa. Otto istanti pescati a caso ma dal SEME —
   quindi gli stessi otto a ogni esecuzione, e diversi se si cambia seme —
   dentro una partita vera CPU contro CPU, STRATIFICATI (uno per fetta di
   finestra) perché due campioni non possano cadere sullo stesso
   fotogramma. Su ognuno, sette cancelli:

     1. ERBA VUOTA   quanta parte dell'AREA GIOCABILE — il quadro meno
                     l'interfaccia che il gioco dichiara — è manto senza
                     soggetti (griglia di celle: tinta in famiglia prato e
                     poca varianza = cella vuota).       sotto il 50%
                     (il numero sul quadro intero si stampa accanto)
     2. PALLA        la palla è fra gli oggetti più chiari del quadro e
                     abbastanza grande da trovarla in un secondo.
                                        luminanza >= 2x la mediana, e
                                        diametro >= 1,8% della larghezza
     3. FIGURA       quanto è alta a schermo la figura del giocatore
                     attivo, misurata sulla sagoma vera che il rig
                     disegna.                      >= 6% dell'altezza
     4. OMBRE        la misura chiave del tema 1: direzione e lunghezza
                     dell'ombra di OGNI figura, lette nei pixel attorno
                     ai piedi.   deviazione standard delle direzioni <= 5
                                 gradi, e lunghezza media >= 1,2 volte
                                 l'altezza della figura
     5. PRATO        il gradiente termico: differenza di tinta fra due
                     zone opposte del quadro.            >= 12 gradi
     6. CENTRO SERA  il manto del TERZO CENTRALE contro lo stesso campo a
                     mezzogiorno: quanto è calata la luminanza mediana e
                     quanto la saturazione.  nel secondo tempo >= 15% e
                                             15%; nel primo, solo che la
                                             luce non torni indietro
     7. CENTRO       quanti SOGGETTI — corpi e pallone — stanno nel TERZO
        ABITATO      CENTRALE, cioè dove cade l'occhio. Stessa griglia
                     della misura 1, ma si contano le celle che un
                     soggetto ABITA, non quelle di manto vuoto: i corpi
                     dalla SILHOUETTE vera (il rig del gioco ridisegnato
                     in nero), il pallone dal suo disco misurato.
                                                   almeno 4 celle su 32

   IL METRO RIPARATO — 18 agosto 2026, seconda passata. DUE DIFETTI, E
   IL SECONDO SPIEGA IL PRIMO.

   A. LA MISURA 7 NON CONTAVA I CORPI. Contava celle di MANTO VUOTO nel
      terzo centrale, col tetto al 40%. Tre prove, tutte rifatte qui:
        1. IL TETTO ERA IRRAGGIUNGIBILE PER ARITMETICA. Il terzo centrale
           sono 32 celle; per stare sotto il 40% ne servono 19,2 non
           vuote, e una figura ne rompe due. Diciannove celle vogliono
           dieci uomini dentro un riquadro di 273x123 unità di campo: in
           un cinque contro cinque non succede mai, e la spazzata di
           venti inquadrature per istante col renderer vero (vedi
           strumenti/_toppa-centro.js) non ha trovato UNA posizione di
           camera che tenesse il pallone in quadro e scendesse sotto
           quattro rossi su otto.
        2. IL NUMERO ERA CIECO AI CORPI. Portando i corpi che toccano il
           terzo centrale da 12 a 21 su otto istanti (+75%) e i pixel di
           corpo dal 13,7% al 25,9%, l'erba vuota del terzo centrale
           restava 49,6%: IDENTICA. Un numero che non si muove quando
           raddoppia la cosa che dovrebbe misurare non la sta misurando.
        3. C'ERA UN VERDE FALSO. L'istante 8 leggeva 6,3% e questo file
           lo chiamava «il fotogramma che regge da manifesto». E' prato
           deserto con un pallone e mezzo giocatore sul bordo basso, e
           passava per il difetto B qui sotto.
      E LA PROVA CHE IL NUMERO ERA ROVESCIATO sta in un fotogramma solo:
      l'istante 2, che il metro vecchio dichiarava il PEGGIORE degli otto
      (75,0% di erba vuota), ha il pallone e il suo portatore esattamente
      in mezzo al quadro. Il metro nuovo lo mette fra i migliori.

      COSA MISURA ADESSO. La maschera dei SOGGETTI: i corpi presi dalla
      silhouette — che non è una stima, è la stessa Rig3D.disegna del
      fotogramma vero con una divisa tutta nera — più il disco del
      pallone, posizione dallo stato e raggio MISURATO sui pixel. Sulle
      32 celle del terzo centrale si contano quelle che un soggetto
      ABITA. Il colore del manto non entra più: chiazze di terra battuta,
      righe di gesso, ombre lunghe e ambra dei fari non comprano più
      niente, perché la misura non le guarda.

      DA DOVE VIENE IL TETTO — IL CONTO, non un numero tondo. Misurato
      sugli otto istanti (12 figure e 6 palloni dentro il riquadro):
        · una figura abita        1,42 celle  (17 celle su 12 figure)
        · il pallone abita        1,83 celle  (11 celle su 6 palloni)
        · il duello più il pallone fanno 2x1,42 + 1,83 = 4,67 celle
          lorde; sul gioco vero quella configurazione ha dato 4, 5, 5 e 6
          celle NETTE — le sovrapposizioni si mangiano il resto.
      Il tetto è il MINIMO che quella configurazione ha davvero prodotto:
      QUATTRO celle su 32. Sotto quattro il quadro ha meno del duello,
      oppure ha perso il pallone: che è, alla lettera, la cosa che il
      giudice ha visto.
      ED E' RAGGIUNGIBILE, misurato e non sperato: su 696 fotogrammi di
      partita vera (uno ogni sei, ottanta secondi di gioco) il terzo
      centrale ha almeno DUE figure nel 76,3% dei fotogrammi e il pallone
      nel 69,4%, mediana 2 figure, massimo 5. Il tetto chiede quello che
      il gioco fa tre volte su quattro, non quello che non può fare mai.
      E ALMENO DUE DI QUELLE QUATTRO CELLE DEVONO AVERE UN CORPO — la
      clausola non c'era, e l'ha imposta il falso. Costruito lo sgombro
      del riquadro (tutte le figure fuori, PALLONE lasciato dov'era), in
      un fotogramma su sei il cancello restava VERDE: il disco del
      pallone, quando cade sull'incrocio di quattro celle, ne riempie il
      10% di ciascuna e da solo ne abita quattro. Un pallone su un prato
      deserto è alla lettera il vuoto che questa misura cura, quindi non
      può bastare. Il numero viene dallo stesso conto — una figura abita
      1,42 celle, quindi due celle di corpo sono «almeno una figura
      intera, non il suo mignolo» — e non cambia di un istante l'esito
      sul gioco vero (4/8 con e senza la clausola, 6/8 con la manovra del
      duello): serve contro il falso, che è il suo mestiere. Questa riga
      è scritta qui perché resti chiaro l'ordine dei fatti: prima il
      falso, poi la soglia. Non il contrario.

      I DUE FALSI, E PERCHE' SONO NEL CASO PEGGIORE (--controllo):
        · IL RIQUADRO SGOMBRATO (controllo 5) deve diventare ROSSO. Ogni
          figura che tocca il riquadro esce dello STRETTO indispensabile,
          di lato, alla stessa profondità — stessa taglia, stessa ombra —
          e il PALLONE non si tocca. E' lo svuotamento più gentile che si
          possa costruire: se il cancello passasse lo stesso, non starebbe
          contando i corpi.
        · IL DUELLO AL CENTRO (controllo 6) deve diventare VERDE. Dentro
          il riquadro ci stanno ESATTAMENTE due figure e il pallone —
          l'aritmetica del tetto e nient'altro, perché tutti gli altri
          sono stati sgombrati prima. Se non passasse, il tetto
          chiederebbe più di quanto il suo conto promette.
      Nessuno dei due dipinge: SPOSTA GLI ATTORI e lascia ridisegnare il
      gioco con la sua render(), tenendo ferma la camera (e verificando
      che sia ferma davvero, perché un falso che cambia anche
      l'inquadratura non prova niente). Un falso di vernice non avrebbe
      toccato la maschera dei corpi, e sarebbe stato uno di quei falsi
      troppo gentili che qui hanno già fatto «passare» tre cancelli.
      Esito, 18 agosto, --controllo --n 6: sgombrato rosso 6/6 con
      riquadro davvero vuoto 6/6, duello verde 6/6 con le due figure e il
      pallone dentro 6/6, camera ferma 6/6.

      LA SOGLIA DI COPERTURA NON COMANDA. Una cella è abitata se almeno
      il 5% dei suoi pixel è soggetto — un nono di figura: un braccio,
      una testa, un piede intero. Che quel 5% non sia il numero che
      decide è misurato e si può rifare: da 2% a 10% di cella l'esito
      della corsa non cambia di un istante (4/8 sul gioco di oggi, 6/8
      con la manovra del duello), e il guadagno della manovra resta fra
      il +42% e il +58% di celle abitate su tutta la banda.
      LA DICHIARAZIONE DELL'INTERFACCIA PUO' SOLO NUOCERE, come per la
      misura 1 e per le ombre: un soggetto sotto una zona dichiarata NON
      conta, perché non si vede, mentre il denominatore resta le 32 celle
      del riquadro. Dichiarare interfaccia sopra il centro toglie
      soggetti e basta. Misurato: l'interfaccia sul terzo centrale vale
      0,0% in tutti e otto gli istanti, quindi oggi la guardia non morde
      — ma è la STRUTTURA a tenere chiusa la porta, non un tetto d'area.

   B. LA FAMIGLIA DEL PRATO COMINCIAVA TROPPO IN ALTO (hueMin 90).
      La nota di ieri diceva «sotto i 90 gradi non c'è prato, ci sono i
      comandi». Era una deduzione, non una misura, ed è falsa. La prova
      è col metro più severo che ci sia: i pixel che IL GIOCO STESSO
      dipinge come prato al fischio d'inizio — stessa zolla, stessa
      camera, solo il cronometro a zero, cioè il riferimento della misura
      6 — riguardati la sera nello stesso posto. Su 1,25 milioni di quei
      pixel, otto istanti:
        sotto 90°   9,95% di tutto il manto  ·  50,1% sotto la pozza dei fari
        sotto 70°   3,00%                    ·  14,4%
        sotto 60°   0,86%                    ·   2,2%
        sotto 50°   0,60%                    ·   1,4%
      A 90 si buttava via METÀ dell'erba illuminata dalle lampade: ecco
      perché l'istante 8, prato deserto sotto quattro fari, leggeva 6,3%
      di erba vuota. Non era un fotogramma da manifesto, era un
      fotogramma che usciva dalla famiglia del verde.
      IL PAVIMENTO VA A 60 GRADI. La curva ha lì il suo ginocchio: da 60
      a 50 si recupera un quarto di punto e si comincia a prendere la
      TERRA BATTUTA, che sul campo sta fra 20 e 56 gradi. L'istogramma
      della stessa popolazione ha il suo unico avvallo nel bin 58-60°
      (101 pixel contro 931 sotto e 2537 sopra): il pavimento sta due
      gradi sopra l'avvallo e tiene il 99,1% del manto che il gioco
      dichiara suo (97,8% sotto la pozza) contro il 90,0% (49,9%) di
      ieri.
      IL MARGINE DALL'ALTRO LATO, dichiarato: nella banda 60-90 gradi i
      pixel di CAMPO stanno a quelli delle zone dichiarate interfaccia
      come 19 a 1 (56.587 contro 2.994, otto istanti); i pulsanti «oliva
      a 73-81» che la nota temeva valgono 2.321 pixel in tutto, sparsi, e
      non fanno una cella piatta.
      E IL PREZZO SI PAGA IN CHIARO, perché allargare la famiglia rende
      il banco PIU' SEVERO: la misura 1 passava 8/8 con hueMin 90 e passa
      4/8 con hueMin 60, perché le chiazze ambra sotto i fari sono erba
      vuota e venivano contate come «non erba». Non è una regressione
      introdotta qui: è un conto che era già sbagliato e adesso si vede.

   QUATTRO DIFETTI DEL BANCO, TROVATI DAL GIUDICE E RIPARATI IL 18 AGOSTO.
   Vanno letti prima di tutto il resto, perché sono la ragione per cui i
   numeri dell'edizione precedente vanno riletti — e perché sono tutti la
   stessa famiglia di errore, quella che questa cartella paga da quindici
   volte: IL BANCO MISURAVA UNA COSA E NE DICHIARAVA UN'ALTRA. Il giudice
   della giuria a 26, dopo aver votato 8,2, invece di fidarsi ha rifatto
   la corsa con un seme suo, ha riscritto la griglia di misura da zero
   (ottenendo gli stessi numeri al decimale) e ha provato a imbrogliare il
   cancello. Il cancello non ha ceduto. Lo strumento sì, in quattro punti:

     1. GLI OTTO CAMPIONI ERANO SEI. «istante-04 e istante-05 differiscono
        di 0,67 su 255 in media assoluta: è lo STESSO fotogramma con lo
        stick sbiadito. 07 e 08 di 4,66.» Vero, e la causa erano tre righe
        di aritmetica: gli istanti si pescavano uniformi (due potevano
        cadere vicinissimi) e il passo da fare era max(0, bersaglio -
        orologio) — se l'istante precedente veniva spostato avanti per
        uscire da una celebrazione, il successivo cadeva alle sue spalle,
        il passo diventava zero e si rimisurava la stessa tela. Peggio:
        non identica, perché i due ridisegni del riferimento di
        mezzogiorno avevano intanto mosso la camera di due fotogrammi
        senza aggiornare la trasformazione letta dallo strumento — ed è
        per questo che nell'istante 8 la palla «non c'era»: non era un
        difetto del gioco, era il banco che guardava due fotogrammi
        indietro. Il cronometro stampato, poi, tornava indietro (t=39,0s
        dopo un t=40,1s) e nessuno ci aveva fatto caso.
        RIPARATO in tre modi: campionamento stratificato, passo minimo di
        due secondi di partita fra due fotogrammi misurati, e soprattutto
        LA MISURA DELLA PROPRIA INDIPENDENZA — la differenza media
        assoluta fra ogni coppia di istanti, stampata in tabella, con la
        corsa che fallisce sotto la soglia. Un banco che non sa di avere
        sei campioni su otto conta due volte lo stesso voto.
     2. IL CANCELLO DELLA PALLA E L'ANELLO DI POSSESSO. «48,0 px misurati
        contro 35,1 attesi dallo stato: sta misurando l'ANELLO BIANCO come
        palla, un 36% di regalo.» Qui il giudice ha visto un sintomo vero
        e ne ha dedotto la causa sbagliata, e la causa vera era peggiore:
        i 35,1 «attesi» ERANO IL NUMERO FALSO. Lo strumento deduceva il
        raggio da B_R (il raggio degli urti, 8 unità) mentre il gioco
        disegna il pallone a B_R x B_DIS = 10,72 e lo dichiara in
        __test.pallaRaggio() — hook che il gioco aveva scritto apposta,
        con tanto di verbale, e che nessuno leggeva. I 48,0 px misurati
        erano la palla, giusti al 2%: il banco stava suonando un allarme
        contro sé stesso e per giunta al momento sbagliato.
        Il sospetto restava però fondato per costruzione: il gioco lascia
        2,6 unità di erba fra pallone e anello (bucoPalla) e il buco
        perdonato dal raggio ne valeva 3,2 — mezza unità di troppo.
        RIPARATO in due modi: l'atteso si LEGGE dal gioco invece di
        dedurlo, e il buco si perdona solo dove un buco può stare (pixel
        neutri e non manto: i pentagoni sì, l'erba e la pozza dorata no).
        Il conto vecchio si continua a fare e a stampare accanto al nuovo.
     3. IL TETTO DELL'ERBA VUOTA ERA PIU' LARGO DI QUANTO DICESSE. «E'
        50%, l'estremo largo del 40-50% chiesto, ed è calcolato sul quadro
        intero INCLUSA l'interfaccia dichiarata (12,8%), che erba non può
        essere: il tetto effettivo sull'area giocabile è 57%.» Esatto.
        RIPARATO misurando sull'AREA GIOCABILE e stampando accanto, a ogni
        istante, il numero sul quadro intero e il tetto che gli
        corrisponde. Il tetto non è stato abbassato di nascosto: è stato
        ALZATO, perché lo stesso quadro che leggeva 29,2% adesso legge
        33,4%.
     4. IL NUMERO CHE BOCCIAVA ERA GIA' CALCOLATO E NON AVEVA CANCELLO, ed
        è il più caro dei quattro. «Il vuoto si è spostato in mezzo: 41,7%
        sul quadro intero ma 53,1% sul TERZO CENTRALE; il vostro strumento
        STAMPA il conto delle sue celle vuote a ogni istante senza
        metterci sopra alcun cancello.» Era lì da due giorni, in fondo
        alla riga della misura 6, e nessuno l'aveva giudicato.
        RIPARATO con la misura 7. Non è prudenza lasciare un numero senza
        cancello: è scegliere di non vedere.

   IL BUCO DEL METRO, APERTO DAL GIUDICE E CHIUSO IL 16 AGOSTO. La misura
   6 è nata da una frase sola, del giudice della giuria a 26: «il banco
   passa 8/8 sulla temperatura e le due metà partita differiscono davvero,
   MA a occhio quattro istanti su otto hanno ancora il centro campo a
   mezzogiorno: la sera sta nelle ombre, nei bordi e nelle pozze, non nel
   colore del prato». Aveva ragione, e il difetto era della MISURA prima
   che del gioco: la misura 5 campiona DUE ZONE OPPOSTE — sinistra/destra
   e alto/basso — e quindi legge benissimo la rampa AI BORDI, che è dove
   il velo è più spesso e dove la vignettatura vira al viola, mentre in
   mezzo al quadro non guarda affatto. Passava 8/8 su un fotogramma in cui
   l'occhio vedeva mezzogiorno. Le due misure adesso stanno accanto: la
   quinta dice se una legge della luce esiste, la sesta se arriva dove
   cade l'occhio.
   Il riferimento di mezzogiorno non è una tinta scritta a mano: è il
   gioco stesso col cronometro riportato al fischio d'inizio e NIENT'ALTRO
   cambiato — stessi corpi, stessa camera, stessa palla, stessi pixel
   campionati. Chi domani ridipinge il manto di un altro verde non sposta
   di un centesimo questo cancello.
   COSA HA TROVATO, e vale più del cancello: nel secondo tempo la
   SATURAZIONE del centro cala come promesso (-14 / -32 per cento) ma la
   LUMINANZA smette di calare e poi TORNA SU man mano che i fari salgono —
   -15,4% al 63% di partita, -11,3% al 71%, -9,0% al 78%, -5,4% al 79%.
   Il centro del quadro diventa più chiaro mentre la sera si fa più buia:
   è l'esatto contrario di quello che un time-lapse promette, ed è la cosa
   che il giudice ha visto a occhio senza poterla nominare.

   DUE BUGIE DEL BANCO, TROVATE E RIPARATE (15 agosto sera). Vanno lette
   prima dei numeri, perché sono la ragione per cui i numeri di stamattina
   erano da buttare — e perché è la stessa trappola che questa cartella ha
   già pagato otto volte, in una forma nuova:

     1. LA FOTOGRAFIA NON ERA DEL GIOCO. Le misure leggono la TELA con
        getImageData; la fotografia la scatta Playwright sulla PAGINA. Lo
        splash che sfuma (mezzo secondo di transizione CSS) e le bande
        diagonali della transizione fra schermate (#wipe) coprivano il PNG
        salvato mentre la tela sotto era perfetta: numeri veri, prove
        false. Adesso si aspetta che gli strati si tolgano (come fa
        scatta.js), si congelano le animazioni, e a ogni scatto lo
        strumento ENUMERA gli strati del DOM grandi e visibili: se ce n'è
        uno, lo dice e la corsa fallisce. Una prova falsa è peggio di una
        misura falsa, perché nessuno la controlla.
     2. MISURAVO FOTOGRAMMI CHE NESSUNO VEDE. In questo gioco la camera
        vive dentro render() — updateCamera(rdt) è la prima riga — e
        __test.simulate fa avanzare i corpi SENZA disegnare. Ventisette
        secondi di sola fisica lasciavano l'inquadratura ferma al fischio
        d'inizio: azione al bordo, palla sotto i pulsanti, erba vuota
        gonfiata di quindici punti. Adesso la partita corre a fotogrammi
        veri (__banco.passo), un disegno per ogni passo di fisica, come in
        partita. Costa un minuto e mezzo per otto istanti, e vale ogni
        secondo: senza, il freeze-frame test giudicava una regia che il
        giocatore non ha mai davanti.

   COSA DICE OGGI — 18 agosto 2026, col metro a SETTE cancelli e col
   campionamento stratificato; otto istanti, seme 20260728, telefono in
   orizzontale 915x412 a due punti per pixel: 48 misure su 56.
     erba vuota 8/8 · palla 8/8 · figura 8/8 · ombre 6/8 · prato 8/8 ·
     centro sera 7/8 · CENTRO PIENO 3/8
   · IL CENTRO PIENO, la colonna nuova, ed è quella che boccia. Erba vuota
     nel terzo centrale, in ordine d'ora: 34,4% · 75,0% · 62,5% · 68,8% ·
     71,9% · 37,5% · 43,8% · 6,3%. Mediana 40,6, tetto 40, cinque istanti
     su otto rossi. Nello stesso quadro l'erba vuota complessiva sta fra
     il 18,3% e il 47,8% dell'area giocabile e passa OTTO volte su otto:
     il difetto non è che il manifesto sia vuoto, è che il vuoto si è
     spostato IN MEZZO. Nei cinque istanti rossi il centro è da 1,6 a 2,4
     volte più vuoto del quadro che lo contiene; nei tre verdi l'azione ci
     sta davvero in mezzo (nell'ultimo il centro è quasi pieno, 6,3%
     contro il 23,1% del quadro — è il fotogramma che regge da manifesto).
     Chi ripara ha la strada segnata: non serve aggiungere soggetti, serve
     che la camera e la coreografia ne tengano due o tre DENTRO il terzo
     centrale invece di distribuirli sulla larghezza.
   · L'ERBA VUOTA passa 8/8, ma il numero è cambiato di sotto: adesso è
     sull'area giocabile, e lo stesso quadro che leggeva 29,2% legge
     33,4%. Il caso peggiore della corsa (istante 2) è 41,7% sul quadro
     intero e 47,8% sull'area giocabile, cioè a due punti dal tetto: col
     conto di ieri sembrava averne otto di margine.
   · LA PALLA passa 8/8 e adesso i due numeri coincidono: 48,0 px misurati
     contro 48,0 disegnati, 53,0 contro 53,1, 50,0 contro 50,0. Lo scarto
     peggiore è +5,9% (56,0 contro 52,9) ed è la coda del raggio che si
     allunga sulla macchia di contatto del pallone, che è scura e neutra
     quanto il suo contorno: è dichiarato, non nascosto, e si legge in
     ogni riga. Il conto permissivo — quello che poteva comprare l'anello
     — dà gli stessi identici pixel in tutt'e otto: sul gioco di OGGI
     l'anello non è mai stato venduto come palla. Che potesse esserlo lo
     dimostra il banco, dipingendolo (+38%).
   · LE OMBRE 6/8 e il CENTRO SERA 7/8 non sono un peggioramento del
     gioco rispetto al 16 agosto: sono ALTRI OTTO ISTANTI. Il
     campionamento stratificato ha spostato tutti i bersagli, e due
     fotogrammi con la camera stretta (zoom 1,29 e 1,11) lasciano meno di
     due figure con l'ombra misurabile. Confrontare queste sette colonne
     con quelle di ieri riga per riga non si può, e dirlo è meglio che
     lasciarlo credere.
   COSA DICEVA IL 16 AGOSTO — l'edizione col metro a SEI cancelli; stessi
   otto istanti nominali, ma pescati uniformi: 39 misure su 48.
     erba vuota 3/8 · palla 8/8 · figura 8/8 · ombre 6/8 · prato 8/8 ·
     CENTRO SERA 6/8
   DUE RETTIFICHE, da leggere accanto a ogni numero di questa edizione:
   quella corsa aveva SEI campioni indipendenti su otto (le coppie 04/05 e
   07/08 erano lo stesso fotogramma, misurato il 18 agosto a 0,67 e 4,66
   su 255), e l'erba vuota era calcolata sul quadro intero, cioè con un
   tetto effettivo del 57% sull'area giocabile invece del 50% dichiarato.
   Il resto del blocco resta valido e vale la pena tenerlo, perché la
   curva della luce al centro è ancora la strada per chi ripara:
   · IL CENTRO, la colonna nuova. Sei istanti su otto passano, ma sono i
     sei del PRIMO tempo, dove il cancello chiede soltanto che la luce non
     torni indietro (e non torna: -2,6% -4,0% -8,4% -10,0% -10,7% -14,9%
     di luminanza, in ordine d'ora — una discesa pulita). Nei DUE istanti
     in cui il cancello morde davvero, cioè oltre metà partita, è rosso
     tutt'e due le volte: al 55% di partita -6,7% di luce contro il 15%
     chiesto, al 57% -11,4%. La saturazione invece ci arriva (-23,2% e
     -17,8%). Con una finestra pesata sul secondo tempo (--da 46 --a 88,
     otto istanti fra il 53% e il 79% di partita) il centro è rosso 0/8 —
     e la TEMPERATURA DEL PRATO, nella stessa identica corsa, resta 8/8.
     E' alla lettera la contraddizione che il giudice ha scritto, adesso
     misurata invece che vista a occhio. Si vede anche la FORMA del
     difetto, in ordine d'ora: -8,9% -12,3% -15,4% -11,3% -11,3% -12,9%
     -9,0% -5,4% di luminanza. NON è che la sera non arriva al centro: è
     che arriva fino a metà ripresa e poi TORNA INDIETRO, perché i fari
     salgono e rischiarano il centro più di quanto il velo lo scurisca.
     Il colore se ne va (la saturazione scende fino a -32,4%) mentre la
     luce risale: al 79% di partita il centro del quadro è più chiaro che
     al 63%.
     Chi ripara ha la strada segnata dai numeri: non serve calcare il
     velo, serve che le pozze dei fari non paghino il centro campo.
   Le altre cinque colonne erano misurate quel giorno sullo stesso gioco e
   rettificavano l'edizione del 15 agosto qui sotto: l'erba vuota
   peggiorata (3/8 contro 4/8), le ombre migliorate (6/8 contro 3/8).
   Aggiungere la misura 6 non ha spostato di un carattere le altre cinque:
   verificato eseguendo la versione precedente del file sullo stesso gioco
   e confrontando riga per riga (i due ridisegni che servono al
   riferimento restituiscono la camera esattamente dov'era).

   COSA DICEVA IL 15 AGOSTO — l'edizione precedente, col metro a cinque
   cancelli; 15 agosto 2026 sera, dopo l'onda della luce; otto istanti,
   seme 20260728, stesso quadro: 31 misure su 40 (erano 24 su 40 prima
   dell'onda, con un banco che per giunta guardava dalla parte sbagliata).
     · OMBRE  3 istanti su 8. La DIREZIONE è perfetta dappertutto: 20-24
       gradi misurati, deviazione fra le figure 0,2-0,7 gradi contro un
       tetto di 5, e il gioco ne dichiara 20 — scarto misurato-dichiarato
       0-4 gradi. Le ellissi sotto i piedi non ci sono più. Cade la
       LUNGHEZZA: 1,14-1,75 volte la figura, cioè a cavallo del cancello
       di 1,2 — contro i ~1,9 che il gioco DICHIARA (230-248 px di capsula
       su ~125 px di figura). Non è un errore di misura: è la punta,
       schiarita al 40%, che sotto il 15% di stacco dal manto non si
       distingue più dalle strisce di rasatura. Chi vuole il cancello
       verde con margine deve SCURIRE la punta, non allungarla. In un
       istante su otto, per giunta, le figure misurabili sono meno di due:
       con la camera stretta si accavallano, e lo strumento preferisce
       dire «non si può dare» che dare un numero inventato.
     · ERBA VUOTA  31,3-69,1%, quattro istanti su otto sotto il 50%.
       Resta il difetto più caro: nei fotogrammi larghi il quadro è ancora
       due terzi di manto.
     · PALLA  OK in tutti e otto: 3,35-3,81 volte la mediana del quadro,
       diametro 1,80-2,51% (misurato contro i 41,7-43,2 px che lo stato
       dichiara). La giuria chiede il 2,5% e a quella soglia cadrebbe
       quasi sempre: si controlla con --pallaDiamMin 0.025.
     · FIGURA  OK: 12,5-16,3% dell'altezza contro il 6%.
     · PRATO  OK: 14-21 gradi di tinta fra due zone opposte contro 12.
   Dopo l'onda della luce questo file doveva dire OK senza cambiare una
   riga sulle direzioni, e lo dice. Le soglie non sono state toccate per
   farlo: quella dell'ombra è stata ALZATA da 0,72 a 0,85 perché la
   capsula nuova è più tenue, e il numero è misurato sui pixel (vedi
   ombraSu), non scelto per far passare il gioco.

   Ogni istante produce anche una SILHOUETTE (figure di nero puro su
   fondo bianco): serve al test del tema 2, in cui un estraneo deve poter
   dire «corre / tira / contrasta» guardando solo il nero. Non è una
   sagoma ridisegnata a mano — è lo STESSO rig, con la stessa clip, la
   stessa fase e la stessa scala del fotogramma vero, ridipinto in nero:
   se la posa è illeggibile lì, è illeggibile anche in partita.

   OTTO CAMPIONI SONO OTTO, e non è un modo di dire: lo strumento MISURA
   la propria indipendenza e la stampa in fondo a ogni corsa — la
   differenza media assoluta di luminanza fra ogni coppia di istanti, e
   quanta parte del quadro cambia. Se due istanti sono lo stesso
   fotogramma, il conteggio finale conta due volte lo stesso voto ed è
   aritmeticamente falso: la corsa fallisce e lo dice. Il 18 agosto, sul
   gioco di oggi: coppia più vicina 9,29 su 255 (35% di quadro cambiato)
   contro una soglia di 7,0 e del 20%.

   RIPRODUCIBILITÀ, la regola già pagata due volte in questa cartella:
   prima che la pagina esegua una riga si sostituisce Math.random con un
   generatore a seme fisso (xorshift32, lo stesso di scatta.js) e si
   prende in mano l'orologio del disegno, così la partita, gli istanti e
   i pixel sono identici a ogni esecuzione. Un cancello che lancia i dadi
   prima o poi copre una regressione vera con una finestra fortunata.
   Verificato su tre esecuzioni di fila: uscita identica al carattere e
   tutti i numeri identici. Quindici PNG su sedici sono uguali al byte; in
   uno differiscono 79 pixel su un milione e mezzo (lo 0,005%, sul filo
   inferiore del tabellone), che è rumore di rasterizzazione fra processi
   diversi di Chromium e non tocca nessuna misura: la stessa pagina,
   fotografata due volte, dà due file identici.

   uso:
     node strumenti/istantanea.js
     node strumenti/istantanea.js --dir istantanee --n 8 --da 3 --a 80
     node strumenti/istantanea.js --soglie
     node strumenti/istantanea.js --dettaglio      (l'ombra figura per figura)
     node strumenti/istantanea.js --controllo      (il banco di prova)
     node strumenti/istantanea.js --controllo --da 46 --a 88 --n 6
                                    (il banco con istanti del secondo
                                     tempo: è lì che morde la misura 6, ed
                                     è lì che le figure hanno l'ombra
                                     misurabile abbastanza spesso perché i
                                     falsi delle ombre abbiano popolazione)
     node strumenti/istantanea.js --rampa          (la curva della luce al
                                     centro: lo stesso fotogramma a undici
                                     ore diverse. Non è un cancello, è il
                                     documento da cui escono le soglie
                                     della misura 6)
     node strumenti/istantanea.js --pratoHueMin 15 (ogni soglia si sposta)
     node strumenti/istantanea.js --centroLumCalo 0.05   (anche le nuove)

   --controllo è la prova che lo strumento non sta attestando. Rifà lo
   STESSO istante altre SETTE volte e ci dipinge sopra sette falsi
   dichiarati:
     · IL SOLE SPOSTATO — si spiana il manto e si ridipingono ombre lunghe
       tutte a 145 gradi, con i corpi ridisegnati sopra perché l'ombra
       stia sotto la figura come nel vero, più un gradiente termico
       marcato. Il gioco continua a DICHIARARE 20 gradi: la misura deve
       dire 145, se dicesse 20 starebbe copiando la risposta.
     · IL PRATO SPIANATO — ogni pixel di manto portato alla stessa tinta:
       un campo senza alcuna legge di luce. Le ombre non si devono più
       trovare e il gradiente deve cadere a zero.
     · IL CENTRO SPIANATO A MEZZOGIORNO — il falso più onesto dei quattro,
       perché non è vernice inventata: è il terzo centrale VERO del
       fotogramma a ora=0, messo da parte quando si è preso il riferimento
       e incollato sopra la scena della sera. Ombre lunghe, bordi velati,
       fari accesi, ora tarda dichiarata — e in mezzo mezzogiorno. E' il
       difetto che il giudice ha visto a occhio, riprodotto al pixel: il
       calo deve crollare a zero e il cancello deve diventare rosso.
     · IL CENTRO PORTATO A SERA — l'opposto: il manto del terzo centrale
       smorzato e scurito a mano di un quarto (V e S per 0,75). Il calo
       deve scavalcare tutt'e due le soglie e il cancello diventare verde.
       Un cancello che non sa passare è rumore, non un metro.
     · IL TERZO CENTRALE SPIANATO A MANTO — il tetto nuovo, dal lato in
       cui deve bocciare: si stende sul centro del quadro il manto medio
       del fotogramma, tutto uguale. Trentadue celle su trentadue
       diventano erba vuota e il cancello deve andare al 100% e al rosso.
     · IL TERZO CENTRALE RIEMPITO — lo stesso tetto dall'altro lato: una
       sagoma d'ardesia per cella, soggetti di cartone ma soggetti.
       Nessuna cella resta manto uniforme, il cancello deve scendere a
       zero e diventare verde.
     · L'ANELLO DI POSSESSO ATTORNO ALLA PALLA — il falso che il giudice
       ha descritto e che nessuno aveva dipinto. Si posa attorno al
       pallone l'anello nel CASO PEGGIORE: concentrico invece che attorno
       ai piedi, e ritagliato con lo stesso taglio pari-dispari che usa il
       gioco, così il primo pixel di gesso cade nel punto esatto in cui il
       gioco lo consente. Il diametro misurato non deve crescere; il conto
       permissivo — quello di ieri — deve gonfiarsi, se no il falso non
       sta mettendo alla prova niente.
   E c'è un ottavo controllo che non si dipinge, IL GEMELLO SPORCO: lo
   stesso fotogramma rimisurato dopo i due ridisegni del riferimento di
   mezzogiorno, cioè esattamente la coppia che il banco di ieri produceva
   da sé senza saperlo. Il guardiano dell'indipendenza deve riconoscerla.
   Il banco è verde solo se: la direzione misurata segue i pixel (145),
   il disaccordo col dichiarato viene gridato, sul prato spianato tutt'e
   due le misure sanno dire NO, la misura del centro sa dire zero quando
   il centro è mezzogiorno e sera quando è sera, il tetto del centro sa
   fallire al 100% e passare a zero, la palla non compra l'anello, e il
   gemello sporco viene riconosciuto.

   COM'E' MESSO IL BANCO, 18 agosto 2026 (--controllo --n 6, finestra
   piena). Undici prove su undici tornano nel merito:
     direzione sul falso 145° in 3/3 · disaccordo gridato 6/6 · prato
     spianato 6/6 e 6/6 · gradiente dipinto 6/6 · mezzogiorno incollato
     6/6 con calo a zero · centro rosso 2/2 dove morde · centro a sera
     verde 6/6 · TERZO CENTRALE spianato rosso 6/6 e riempito verde 6/6 ·
     ANELLO: il diametro non cresce 6/6 mentre il conto permissivo si
     gonfia 4/6 (fino a +38%) · INDIPENDENZA: nessuna coppia sotto la
     soglia, gemello sporco riconosciuto a 5,12.
   Il verdetto complessivo però è NO, e per una ragione sola che va detta
   invece di essere aggirata: la POPOLAZIONE del falso delle ombre. La
   condizione chiede che almeno il 60% degli istanti dia una direzione
   misurabile sul fotogramma falsificato, e oggi ne dà il 50% (3 su 6) —
   nel falso si spiana il manto e con esso il riferimento locale, e nella
   metà dei fotogrammi non resta abbastanza traccia perché una figura
   passi tutti i filtri. E' un difetto del FALSO, non della misura, ed è
   PRECEDENTE a questa passata: eseguendo sul gioco di oggi la versione
   committata dello strumento (git show HEAD:strumenti/istantanea.js) la
   stessa prova dà 0 fotogrammi su 1 e il banco è rosso lo stesso, con in
   più «sa passare» a 4/6. La condizione NON è stata toccata per far
   diventare verde questa consegna: chi abbassa un cancello per farsi
   passare non sta collaudando, sta attestando.

   COM'E' MESSO IL BANCO, EDIZIONE DEL METRO RIPARATO (18 agosto, seconda
   passata, --controllo --n 6). Undici prove su undici, e stavolta anche
   il verdetto complessivo è OK:
     direzione sul falso 145° in 5/5 · disaccordo gridato 6/6 · prato
     spianato 6/6 e 6/6 · gradiente dipinto 6/6 · mezzogiorno incollato
     6/6 con calo a zero · centro rosso 2/2 dove morde · centro a sera
     verde 6/6 · CENTRO ABITATO: riquadro sgombrato rosso 6/6 con
     riquadro davvero vuoto 6/6, duello al centro verde 6/6 con le due
     figure e il pallone dentro 6/6, camera ferma 6/6 · ANELLO: diametro
     fermo 6/6 e conto permissivo gonfiato 4/6 · INDIPENDENZA: nessuna
     coppia sotto la soglia, gemello sporco riconosciuto a 5,12.
   LA POPOLAZIONE DEL FALSO DELLE OMBRE E' PASSATA DA 3/6 A 5/6, e non è
   stata toccata la condizione: è la conseguenza del pavimento di tinta
   sceso da 90 a 60 gradi. Sul manto spianato del falso restano dentro la
   famiglia del verde anche le zone virate dai fari, quindi il
   riferimento locale c'è dove prima mancava e le figure passano i
   filtri. Il difetto del falso era vero e si è chiuso da sé; se un
   giorno tornasse, va riparato il FALSO, non la soglia.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');

/* --- IL GIOCO PUO' ARRIVARE DA FUORI: --gioco <file> oppure GIOCO_PROVA.
   PERCHE': il percorso del gioco era scritto qui dentro, e un percorso
   cablato ha gia' fatto sbagliare una bisezione — tre misure «prima»
   erano identiche perche' leggevano tutte lo stesso file. Con --gioco lo
   stesso cancello misura una copia fuori dal repo (una toppa da provare,
   la versione di ieri) senza scambiare file a mano. Senza --gioco non
   cambia un byte: il default resta il file del repo. --- */
const GIOCO_FUORI = (() => {
  const i = process.argv.indexOf('--gioco');
  const v = i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')
    ? process.argv[i + 1] : (process.env.GIOCO_PROVA || '');
  if (!v) return '';
  const a = path.resolve(v);
  /* uscita 3 = prova nulla: non e' il gioco a essere rosso, e' il banco
     che non ha niente da misurare (codici di casa: 0 verde, 1 rosso,
     2 banco esploso, 3 prova nulla) */
  if (!fs.existsSync(a)) { console.error('PROVA NULLA: il gioco indicato non esiste: ' + a); process.exit(3); }
  return a;
})();
const ridirigi = f => (GIOCO_FUORI && /CALCETTO-il-gioco\.html$/i.test(f)) ? GIOCO_FUORI : f;

/* =================================================== LE SOGLIE, IN CHIARO
   Una soglia nascosta è una soglia che nessuno può contestare. Qui ci
   sono tutte, cancelli e parametri interni delle misure, e --soglie le
   stampa senza aprire una partita. ==================================== */
const SOGLIE = {
  /* --- i cinque cancelli --- */
  /* IL TETTO E' SULL'AREA GIOCABILE, NON SUL QUADRO INTERO — 18 agosto.
     Il giudice della giuria a 26: «il tetto è 50%, cioè l'estremo largo del
     40-50% chiesto, ed è calcolato sul quadro intero INCLUSA la vostra
     interfaccia dichiarata (12,8%), che non può mai essere erba vuota: il
     tetto effettivo sull'area giocabile è 57%». Ha ragione, ed era
     esattamente il vizio di casa: il banco misurava una cosa e ne
     dichiarava un'altra. Il numero adesso è la frazione di AREA GIOCABILE
     — il quadro meno le zone che il gioco dichiara come interfaccia — e il
     tetto resta 50%, cioè quello che la giuria ha chiesto, applicato dove
     l'erba può davvero esserci. Il numero del QUADRO INTERO si continua a
     stampare accanto, così le due edizioni restano confrontabili e nessuno
     deve fidarsi di una conversione.
     NON E' UN TETTO ABBASSATO DI NASCOSTO: è alzato. La stessa erba che
     ieri leggeva 41,7% oggi legge 47,8%, perché il denominatore si è
     ristretto. E la dichiarazione dell'interfaccia, qui, può solo NUOCERE
     a chi la fa: dichiarare più interfaccia rimpicciolisce il denominatore
     e fa SALIRE la percentuale. Come per le ombre, la guardia non è un
     numero ma la struttura della cosa. */
  erbaVuotaMax: 0.50,     // erba vuota / area giocabile (giuria: 40-50%)
  pallaLumMin: 2.0,       // luminanza della palla / mediana del quadro
  pallaDiamMin: 0.018,    // diametro della palla / larghezza del quadro
  figuraAltMin: 0.06,     // altezza della figura attiva / altezza del quadro
  ombreDevMax: 5.0,       // gradi: deviazione standard delle direzioni
  ombreLungMin: 1.2,      // lunghezza media dell'ombra / altezza della figura
  pratoHueMin: 12.0,      // gradi di tinta fra due zone opposte

  /* --- 6. IL CENTRO E' SERA: quanto deve calare il manto del terzo
     centrale rispetto allo STESSO campo a mezzogiorno ---
     I due numeri sono misurati, non scelti: vedi la rampa stampata da
     --rampa e il cappello di questo file. Il cancello pieno vale nel
     SECONDO TEMPO (ora oltre centroSecondoTempo); nel primo si chiede
     soltanto che la luce non vada all'indietro, cioè che il centro non sia
     più chiaro né più carico del fischio d'inizio oltre il rumore. */
  /* DA DOVE VENGONO I DUE QUINDICI PER CENTO. Sono letti sulla RAMPA che
     il gioco disegna di suo — --rampa congela lo stato e ridisegna lo
     stesso fotogramma a undici ore diverse — su tre inquadrature, e poi
     controllati su otto fotogrammi veri del secondo tempo (16 agosto
     2026, due finestre di campionamento). Il numero è UNO SOLO per tutt'e
     due perché a quindici succedono due cose opposte, ed è questo il
     senso della misura:
     I DIECI fotogrammi veri del secondo tempo (le due finestre insieme,
     dal 53% al 79% di partita) danno, ordinati:
       luminanza     -5,4 -6,7 -8,9 -9,0 -11,3 -11,3 -11,4 -12,3 -12,9 -15,4
       saturazione  -14,3 -15,9 -17,7 -17,8 -23,2 -24,5 -25,6 -26,6 -30,8 -32,4
       · LA SATURAZIONE è la parte di sera che al centro ARRIVA GIA': nove
         volte su dieci è sopra quindici. Il cancello qui non chiede
         niente di nuovo, blocca una cosa che il gioco fa già — cioè la
         trasforma da accidente in promessa. (L'una volta su dieci che
         manca è al 63% di partita e sbaglia di sette decimi di punto: si
         dichiara, non si arrotonda.)
       · LA LUMINANZA è la parte che NON arriva, ed è il difetto che il
         giudice ha visto a occhio: una volta su dieci sopra quindici.
         Quindici non è scelto perché il gioco lo manchi — è quello che il
         gioco FA GIA' al 60% di partita nelle due inquadrature in cui
         NESSUNA pozza di faro cade in mezzo al quadro (-15,5% e -16,6%);
         dove invece una pozza ci cade, alla stessa ora il centro RISALE a
         -2,7%, e al 40% tocca +0,1%, cioè più chiaro di mezzogiorno. Il
         cancello chiede al centro di fare dappertutto quello che il gioco
         già fa dove le lampade non si posano.
     Il rumore della misura è zero, e non è un modo di dire: i due numeri
     escono dagli STESSI pixel della STESSA scena, con l'unica differenza
     del cronometro, e due esecuzioni di fila danno un'uscita identica al
     carattere. Ogni punto percentuale qui è segnale, non tolleranza. */
  centroLumCalo: 0.15,    // calo minimo della luminanza mediana (frazione)
  centroSatCalo: 0.15,    // calo minimo della saturazione mediana (frazione)
  centroTolleranza: 0.01, // primo tempo: quanto si perdona di risalita
  centroSecondoTempo: 0.5,// l'ora oltre la quale scatta il cancello pieno
  centroFrazione: 1 / 3,  // quanto è largo il "terzo centrale", per lato
  centroCampioniMin: 3000,// pixel di manto vuoto sotto i quali non si misura

  /* --- 7. IL CENTRO E' ABITATO: quante celle del TERZO CENTRALE devono
     avere un SOGGETTO dentro, cioè un corpo o il pallone ---
     IL CONTO DEL TETTO, misurato e non scelto (per esteso nel cappello):
     una figura abita 1,42 celle, il pallone 1,83; il duello più il
     pallone fanno 4,67 celle lorde e da 4 a 6 nette sul gioco vero. Il
     tetto è il MINIMO osservato di quella configurazione: QUATTRO celle
     su 32. E' raggiungibile — su 696 fotogrammi di partita vera il terzo
     centrale ha almeno due figure nel 76,3% dei casi e il pallone nel
     69,4% — e sa dire di no: sugli otto istanti del banco è verde
     quattro volte e rossa quattro. */
  centroAbitatoMin: 4,    // celle del terzo centrale con un soggetto dentro
  /* E ALMENO DUE DI QUELLE QUATTRO DEVONO AVERE UN CORPO. Non è una
     seconda soglia messa per prudenza: è la riparazione che il falso
     dello sgombro ha imposto, ed è stata scritta DOPO che il falso l'ha
     trovata. Sgombrando il riquadro da tutte le figure e lasciando il
     PALLONE dov'era, in un fotogramma su sei il cancello restava VERDE:
     il disco del pallone, quando cade sull'incrocio di quattro celle, ne
     riempie il 10% di ciascuna e da solo ne abita quattro. Un pallone su
     un prato deserto è alla lettera il vuoto che questa misura cura.
     IL NUMERO VIENE DALLO STESSO CONTO: una figura abita 1,42 celle,
     quindi chiedere DUE celle di corpo è chiedere che dentro ci sia
     almeno una figura intera e non il suo mignolo. Misurato sugli otto
     istanti, le celle di solo corpo sono 2·4·0·5·0·3·2·1: la clausola
     non cambia di un istante l'esito sul gioco di oggi (4/8 con e senza)
     e non cambia niente con la manovra del duello (6/8) — serve solo
     contro il falso, che è il suo mestiere. */
  centroCorpoMin: 2,      // di quelle celle, quante devono avere un CORPO
  /* quanta parte di una cella dev'essere soggetto perché la cella conti
     come ABITATA. Il 5% di cella è un nono di figura — un braccio, una
     testa, un piede intero; meno di così è un dito che sfiora. Il numero
     non comanda l'esito: da 2% a 10% la corsa dà lo stesso identico
     verdetto, e il guadagno della manovra del duello resta fra +42% e
     +58% su tutta la banda (misurato, vedi il cappello). */
  cellaSoggMin: 0.05,

  /* --- il conto di IERI, che resta calcolato e stampato ma NON giudica
     più: quanta erba vuota c'è nel TERZO CENTRALE ---
     IL NUMERO ERA GIA' CALCOLATO E NON AVEVA CANCELLO, ed è il difetto
     più caro trovato dal giudice il 18 agosto: «il vuoto si è spostato in
     mezzo — 41,7% sul quadro intero ma 53,1% sul terzo centrale; 45,8%
     contro 75,0%; 63,2% contro 78,1%; gli otto istanti mediana ~65% sul
     terzo centrale. Il vostro strumento STAMPA il conto delle sue celle
     vuote a ogni istante SENZA METTERCI SOPRA ALCUN CANCELLO».
     DA DOVE VIENE IL QUARANTA PER CENTO, in pixel veri:
       · la giuria ha chiesto una banda, «l'erba senza soggetti resta sotto
         il 40-50%». Il quadro intero prende l'estremo largo (50%) perché
         comprende i bordi, dove un manifesto può respirare; il centro
         prende l'estremo STRETTO, perché è lì che cade l'occhio;
       · misurato sul gioco del 18 agosto, otto istanti, seme 20260728: il
         quadro sta fra il 18,3% e il 47,8% di erba vuota (sull'area
         giocabile) mentre il suo terzo centrale sta fra il 6,3% e il
         75,0%. Nei cinque fotogrammi peggiori il centro è da 1,6 a 2,4
         volte più vuoto del quadro che lo contiene: la composizione mette
         i soggetti ai bordi e lascia il buco in mezzo, che è l'esatto
         contrario di un manifesto;
       · a 40 il cancello DISTINGUE invece di bocciare tutto: sugli stessi
         otto istanti è rosso cinque volte (43,8% · 62,5% · 68,8% · 71,9%
         · 75,0%) e verde tre (34,4% · 37,5% · 6,3%), e i tre verdi sono
         proprio i fotogrammi in cui l'azione sta in mezzo al quadro.
     Un tetto è onesto quando sa dire di sì a qualcosa che il gioco già fa
     in qualche fotogramma: questo lo sa. */
  /* NON E' PIU' UN CANCELLO — 18 agosto, seconda passata. Era un numero
     che si comprava con le chiazze di terra battuta, le righe, le ombre
     e l'ambra dei fari, e che non si muoveva di un decimo quando i corpi
     al centro raddoppiavano. Si continua a calcolare e a stampare
     accanto al nuovo, perché il giorno che i due divergono si deve
     vedere quale; ma il giudizio lo dà la misura dei SOGGETTI. */
  centroVuotoMax: 0.40,   // erba vuota / celle giocabili: solo stampato

  /* --- che gli otto campioni siano OTTO ---
     18 agosto. Il giudice ha rifatto il banco con un seme suo e ha
     trovato che «istante-04 e istante-05 differiscono di 0,67 su 255 in
     media assoluta: è lo STESSO fotogramma. Il banco a otto campioni ne
     ha sei». Aveva ragione e la causa è qui sotto, in tre righe di
     aritmetica: gli istanti si pescavano a caso uniforme nella finestra,
     quindi due potevano cadere a mezzo secondo l'uno dall'altro; e se
     l'istante precedente veniva spostato in avanti per uscire da una
     celebrazione, il successivo poteva finire ALLE SUE SPALLE — il passo
     da fare diventava zero e si misurava due volte la stessa tela, con
     in più lo scarto dei due ridisegni del riferimento di mezzogiorno.
     Due rimedi e una misura:
       · gli istanti si pescano STRATIFICATI (uno per fetta, con lo
         scarto pescato nel 70% centrale della fetta): il seme comanda
         ancora, ma due istanti non possono più avvicinarsi oltre il 30%
         della fetta;
       · a ogni istante si avanza comunque di almeno istantiPassoMin
         secondi di partita rispetto al fotogramma appena misurato, e lo
         spostamento si dichiara;
       · e soprattutto lo strumento MISURA LA PROPRIA INDIPENDENZA: la
         differenza media assoluta di luminanza fra ogni coppia di
         istanti, stampata in tabella. Sotto indipMin la coppia è
         dichiarata NON INDIPENDENTE e la corsa fallisce. Un banco che
         non sa di avere sei campioni su otto conta due volte lo stesso
         voto e nessuno se ne accorge. */
  istantiPassoMin: 2.0,   // secondi di partita fra due fotogrammi misurati
  /* DUE NUMERI PER LA STESSA COPPIA, E DA DOVE VENGONO.
       · indipMin   sulla differenza media assoluta di luminanza (0-255):
         è il numero che il giudice ha usato, e va tenuto perché i suoi
         conti e i nostri devono restare confrontabili;
       · indipQuota sulla FRAZIONE DI QUADRO che cambia di più di otto
         livelli: due fotogrammi diversi si muovono dappertutto, lo
         stesso fotogramma con lo stick sbiadito si muove sullo stick e
         basta. Separa tre volte meglio del primo.
     LE QUATTRO POPOLAZIONI, misurate il 18 agosto sul gioco di oggi:
       tela identica, rimisurata            0,00   ·   0,0% del quadro
       GEMELLO SPORCO — lo stesso fotogramma dopo i due ridisegni del
         riferimento, cioè esattamente la coppia che il banco di ieri
         produceva da sé e che il giudice ha misurato a 0,67 e 4,66
                                            4,74   ·   9,8%
       coppie vere, 49 misurate su tre corse   >= 9,29   ·   >= 30%
     Le soglie stanno in mezzo ai due varchi, con margine da tutt'e due i
     lati (1,5x e 1,3x sulla media; 2,0x e 1,5x sulla quota). Una coppia
     è dichiarata NON indipendente se ANCHE UNA SOLA delle due misure la
     chiama gemella: sbagliare gridando si vede e si corregge, sbagliare
     tacendo è il difetto che questo guardiano esiste per impedire. */
  indipMin: 7.0,          // differenza media assoluta di luminanza (0-255)
  indipQuota: 0.20,       // frazione di quadro che cambia di oltre 8 livelli
  indipPasso: 4,          // ogni quanti pixel si campiona l'impronta

  /* --- l'interfaccia dichiarata dal gioco (__test.zoneInterfaccia) ---
     Sotto questa alfa l'elemento si è tolto di mezzo davvero (la rampa
     dello scartoHUD scende a 0,10) e i suoi pixel tornano prato. Sopra,
     lì non si cerca ombra. Non c'è un tetto d'area, e il perché sta nel
     blocco di misura: l'esclusione può solo togliere prove d'ombra, mai
     fabbricarne. */
  ifaccAlfaMin: 0.15,

  /* --- come si riconosce una cella di erba vuota --- */
  celleX: 24, celleY: 12, // la griglia
  cellaVarMax: 12,        // deviazione standard di luminanza dentro la cella (0-255)
  cellaErbaMin: 0.97,     // frazione di pixel in famiglia prato dentro la cella

  /* --- la famiglia del verde-prato (HSV) ---
     valMin tiene fuori il quasi-nero, che di verde ha solo l'anagrafe: il
     contorno delle figure (8,16,11) e — soprattutto — il nastro dell'HUD,
     che è un verde scurissimo (val 0,10 contro lo 0,45 del manto). Senza
     questo pavimento il nastro contava come prato: come CELLA VUOTA nella
     prima misura, e peggio, come OMBRA nella quarta — la marcia lo
     risaliva per duecentotrenta pixel e assegnava alla figura sotto il
     tabellone un'ombra lunga il doppio, nella direzione sbagliata. */
  /* IL PAVIMENTO DI TINTA ERA A 90 E TAGLIAVA IL PRATO — riparato il 18
     agosto, seconda passata. La nota vecchia diceva: «sotto i 90 gradi
     non c'è prato, ci sono i comandi (pulsanti oliva a 73-81 gradi)».
     Era una deduzione, non una misura.
     LA MISURA. Si prendono i pixel che IL GIOCO STESSO dipinge come
     prato al fischio d'inizio — stessa zolla, stessa camera, solo il
     cronometro portato a zero, cioè lo stesso riferimento della misura 6
     — e si guarda che tinta hanno la SERA nello stesso posto. Su 1,25
     milioni di quei pixel, otto istanti:
       sotto 90°   9,95% di tutto il manto  ·  50,1% sotto la pozza dei fari
       sotto 70°   3,00%                    ·  14,4%
       sotto 60°   0,86%                    ·   2,2%
       sotto 50°   0,60%                    ·   1,4%
     A 90 si buttava via METÀ dell'erba illuminata dalle lampade, ed è
     per questo che l'istante 8 — prato deserto sotto quattro fari —
     leggeva 6,3% di erba vuota e passava da manifesto.
     PERCHE' 60, E NON 50 NE' 70. La curva ha lì il suo ginocchio: da 60
     a 50 si recupera un quarto di punto e si comincia a prendere la
     TERRA BATTUTA, che sul campo sta fra 20 e 56 gradi. L'istogramma
     della stessa popolazione ha il suo unico avvallo nel bin 58-60°
     (101 pixel contro 931 sotto e 2537 sopra): il pavimento sta due
     gradi sopra l'avvallo.
     IL MARGINE DALL'ALTRO LATO, dichiarato: nella banda 60-90 gradi i
     pixel di CAMPO stanno a quelli delle zone dichiarate interfaccia
     come 19 a 1 (56.587 contro 2.994); i pulsanti oliva di cui sopra
     valgono 2.321 pixel in tutto, sparsi, e non fanno una cella piatta.
     E il verso dell'errore è quello giusto: allargare la famiglia FA
     SALIRE l'erba vuota e rende il banco più severo, mai più gentile —
     la misura 1 è passata da 8/8 a 4/8 il giorno che questa riga è
     scesa da 90 a 60, e quei quattro rossi c'erano già. */
  hueMin: 60, hueMax: 175, satMin: 0.12, valMin: 0.18,

  /* --- la palla: fin dove si cerca e quanto buio si perdona ---
     il disegno della palla ha pentagoni scuri e un contorno nero: un
     raggio che si fermasse al primo pixel non bianco misurerebbe il
     pentagone, non la palla. Si perdona un buco lungo fino a
     pallaBuco volte il raggio atteso.
     IL BUCO SI PERDONA SOLO DOVE UN BUCO PUO' STARE — 18 agosto. Il
     giudice: «istanti 7 e 8, 48,0 px misurati contro 35,1 attesi dallo
     stato: sta misurando l'ANELLO BIANCO DI POSSESSO come palla». Il
     sospetto era fondato per costruzione, ed è la stessa trappola delle
     SCARPE del portatore già pagata a luglio, in forma nuova: il gioco
     interrompe l'anello attorno al pallone lasciando 2,6 unità di campo
     di erba fra i due (bucoPalla), e il buco che si perdonava ne valeva
     0,40 x 8 = 3,2 — cioè MEZZA UNITA' PIU' DEL VARCO. Il raggio poteva
     saltare, e in qualche fotogramma saltava.
     LA CURA NON E' UN NUMERO PIU' STRETTO, E' LA FIRMA DELL'OGGETTO. La
     palla è un disco pieno di pixel NEUTRI: i suoi buchi interni —
     pentagoni, contorno, velo d'ombra — sono scuri ma restano neutri e
     non sono mai manto. L'anello è un ARCO col buco in mezzo, e per
     arrivarci dal centro della palla bisogna per forza attraversare
     l'erba (o la pozza dorata del portatore, che di neutro non ha
     niente). Quindi: il buco si perdona solo su pixel NEUTRI E NON
     MANTO; sul primo pixel di erba, o sul primo pixel carico di colore,
     la palla è finita e non si discute. Il conto vecchio — quello che
     saltava — si continua a fare e a STAMPARE accanto al nuovo, così il
     giorno che uno dei due si muove si vede quale. */
  pallaCerca: 2.6, pallaBuco: 0.40, pallaSatMax: 0.25,

  /* --- come si riconosce un pixel d'ombra: prato IMBRUNITO ---
     le due soglie sono frazioni del prato ILLUMINATO LI' ATTORNO (terzo
     quartile di un blocco di tre celle per tre, vedi la misura 4), non
     di una mediana unica del quadro: sopra la banda è manto al sole,
     sotto è contorno nero o oggetto scuro, e nessuno dei due è ombra.

     QUANTO E' TENUE LA PUNTA CHE ACCETTO: 0,85, cioè un manto imbrunito
     del 15%. Non è un numero scelto a occhio, è misurato sul gioco del
     15 agosto sera (capsula d'ombra schiarita al 40% per costo) su
     quattro istanti, campionando due popolazioni sullo stesso fotogramma:
       · DENTRO la capsula DICHIARATA da __test.ombraCapsula, fra il 35%
         e il 100% della lunghezza: decimo 0,75, mediana 0,85-0,90;
       · FUORI da ogni ombra e da ogni figura — cioè le strisce di
         rasatura, che sono la trappola: quinto 0,75-0,85, DECIMO 0,90,
         mediana 0,95.
     Le due popolazioni si sovrappongono: non esiste una soglia che prenda
     tutta l'ombra senza prendere anche un po' di manto. A 0,85 si prende
     circa metà della capsula (la parte vicino all'asse, dove l'ombra è
     davvero ombra) e solo il 6-8% del manto, sparso e mai in bande
     coerenti; a 0,90 entrerebbero le strisce scure INTERE e la marcia le
     seguirebbe per tutto il campo — è il difetto già pagato una volta.
     Margine reale fra la punta accettata (0,85) e la striscia scura
     (0,90): cinque centesimi. Chi schiarisce ancora l'ombra sotto il 15%
     di stacco deve saperlo: da lì in giù nessuno strumento la distingue
     dalla rasatura, e nemmeno un occhio. */
  ombraGiu: 0.25, ombraSu: 0.85,
  /* di quanti gradi la direzione MISURATA può discostarsi da quella
     DICHIARATA dal gioco (__test.ombraCapsula): oltre, uno dei due mente
     e lo strumento non sa quale — ma sa dire che c'è una bugia */
  ombraScartoDich: 12,
  ombraPixelMin: 150,     // meno di così e l'ombra non c'è: figura scartata
  /* UN'OMBRA HA UNA LARGHEZZA. Quanti pixel scuri deve avere il cono per
     ogni pixel di lunghezza: una capsula vera ne porta 14-17 (misurato),
     un graffio scuro qualsiasi — il bordo di una striscia di rasatura, la
     riga d'ombra di un'altra figura vista di taglio — ne porta 3-4, e
     senza questa regola vinceva lui: una figura a -76 gradi dove tutte le
     altre stavano a 22. */
  ombraDensita: 8,
  /* quanto il corridoio vincente deve battere il migliore degli altri
     (a più di sessanta gradi da lui) per essere DAVVERO il suo: sotto
     questo rapporto la figura ha due ombre addosso, o la sua è tagliata,
     e in ogni caso non si può dire quale sia la sua */
  ombraDominanza: 0.65,
  ombraFigureMin: 2,      // meno di così e la misura non si può dare
  ombraCorsaMax: 4.0,     // fin dove si insegue la punta dell'ombra
  ombraFinestra: 0.12,    // semilarghezza della finestra di marcia (altezze figura)
  ombraFrazione: 0.35,    // quanta parte della finestra dev'essere ombra
  /* quanto vuoto si perdona prima di dichiarare finita l'ombra, in
     frazione dell'altezza della figura: attorno a ogni sagoma c'è l'alone
     di stacco, una striscia CHIARA larga un quinto di figura, e una
     marcia che si arrendesse al primo pixel non scuro morirebbe lì —
     misurato: con sei passi fissi tre ombre lunghe su sei uscivano lunghe
     zero. */
  ombraBuco: 0.35,

  /* --- il gradiente termico: due zone opposte, larghe un terzo di quadro --- */
  zonaFrazione: 0.32,
};

/* ---------------------------------------------------------------- server */
const TIPI = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
};
function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const p = decodeURIComponent(req.url.split('?')[0]);
      const f = ridirigi(path.join(RADICE, p === '/' ? 'index.html' : p));
      if ((!f.startsWith(RADICE) && f !== GIOCO_FUORI) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        res.writeHead(404); res.end('no'); return;
      }
      res.writeHead(200, {
        'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* ------------------------------------------------------------ argomenti */
function argomenti() {
  const a = process.argv.slice(2), o = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith('--')) o[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : true;
  }
  return o;
}

/* --------------------------------------------------------- il caso, in mano
   xorshift32: la stessa sequenza a ogni esecuzione, in pagina (Math.random)
   e qui (gli istanti da fotografare). Sono due flussi separati apposta —
   cambiare il numero di istanti non deve cambiare la partita. */
function dado(seme) {
  let s = seme >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return (s >>> 0) / 4294967296;
  };
}

/* Le animazioni CSS si fermano e si portano a un istante FISSO (copia di
   scatta.js): quelle che finiscono alla fine, quelle infinite all'inizio.
   Senza, fra il disegno e lo scatto continua a muoversi il DOM. */
function congelaAnimazioni() {
  const st = document.createElement('style');
  st.textContent = '*,*::before,*::after{animation-play-state:paused !important;' +
    'transition:none !important;caret-color:transparent !important}';
  document.head.appendChild(st);
  if (!document.getAnimations) return;
  for (const an of document.getAnimations()) {
    try {
      const c = an.effect && an.effect.getComputedTiming ? an.effect.getComputedTiming() : null;
      const infinita = !c || c.iterations === Infinity || !isFinite(c.endTime);
      an.pause();
      an.currentTime = infinita ? 0 : c.endTime;
    } catch (e) { /* un'animazione che non si lascia spostare non ferma il collaudo */ }
  }
}

/* ====================================================== BANCO DI PROVA ===
   L'orologio del gioco, preso in mano (copia di scatta.js). Senza, fra la
   simulazione e lo scatto passa un numero di fotogrammi che dipende dal
   carico del computer e la stessa istantanea esce diversa a ogni giro. */
function bancoDiProva() {
  const PASSO = 1000 / 60;
  let t = 0, coda = [], muto = false;
  window.requestAnimationFrame = cb => { if (muto) return 0; coda.push(cb); return coda.length; };
  window.cancelAnimationFrame = () => {};
  try { performance.now = () => t; } catch (e) {}
  window.__banco = {
    get tempo() { return t; },
    passo(n) {
      n = Math.max(0, Math.round(+n || 0));
      for (let i = 0; i < n; i++) {
        const c = coda; coda = []; t += PASSO;
        for (const f of c) { try { f(t); } catch (e) {} }
      }
      return t;
    },
    zitto() { muto = true; coda.length = 0; },
  };
}

/* ================================================== IL CENTRO E' SERA ====
   L'ATTREZZO, INSTALLATO IN PAGINA UNA VOLTA SOLA.

   Perché esiste, e perché sta ACCANTO alla temperatura del prato invece di
   sostituirla. Il giudice della giuria a 26 ha aperto un buco nel metro con
   una frase sola: «il banco passa 8/8 sulla temperatura e le due metà
   partita differiscono davvero, MA a occhio quattro istanti su otto hanno
   ancora il centro campo a mezzogiorno: la sera sta nelle ombre, nei bordi
   e nelle pozze, non nel colore del prato». Ha ragione, ed è un difetto
   della MISURA prima che del gioco: la temperatura del prato campiona DUE
   ZONE OPPOSTE (sinistra/destra, alto/basso) e quindi vede benissimo la
   rampa ai BORDI — che è dove il velo della sera è più spesso e dove la
   vignettatura vira al viola — anche quando il centro, dove cade l'occhio
   e dove sta l'azione, è rimasto verde saturo da mezzogiorno. Due misure
   che guardano posti diversi non sono una ridondanza: una dice se la legge
   della luce esiste, l'altra se arriva dove si guarda.

   COSA MISURA. Sul TERZO CENTRALE del quadro (un terzo per lato: con la
   griglia 24x12 sono le celle 8-15 per 4-7), e SOLO dentro le celle di
   erba vuota — la stessa regola della prima misura, così nel campione non
   entrano né le figure, né le righe di gesso, né la minimappa:
     · la SATURAZIONE mediana (HSV) del manto;
     · la LUMINANZA mediana (0-255, lo stesso grigio percettivo del resto
       del file).
   Poi confronta i due numeri con quelli dello STESSO CAMPO A MEZZOGIORNO:
   non con una tinta scritta a mano, ma col fotogramma che il gioco stesso
   disegna quando gli si porta il cronometro al fischio d'inizio (ora=0) e
   NIENT'ALTRO cambia — stessi corpi, stessa camera, stessa palla. La
   misura resta così relativa al gioco: chi domani ridipinge il manto di un
   altro verde non sposta di un centesimo questo cancello.

   PERCHE' SI CAMPIONANO GLI STESSI PIXEL DUE VOLTE. La maschera — quali
   pixel sono manto vuoto — si calcola UNA volta, sul fotogramma sotto
   esame, e la si riusa tale e quale sul riferimento: i due numeri
   descrivono letteralmente la stessa zolla d'erba. Calcolarla due volte
   sarebbe peggio che inutile, sarebbe sbagliato in una direzione precisa —
   di sera il velo smorza il manto e qualche pixel esce dalla famiglia del
   verde, quindi una maschera ricalcolata terrebbe solo i pixel PIU' VERDI
   della sera e racconterebbe una sera più simile a mezzogiorno di quanto
   sia. Prendendo la maschera dal fotogramma della sera l'errore residuo
   tira nell'altro verso: la misura è severa con sé stessa, non col gioco.
   ====================================================================== */
function attrezzoCentro() {
  const famiglia = (r, g, b, par) => {
    const mx = r > g ? (r > b ? r : b) : (g > b ? g : b);
    const mn = r < g ? (r < b ? r : b) : (g < b ? g : b);
    const dl = mx - mn;
    if (mx <= 0) return false;
    let hh = 0;
    if (dl > 0) {
      if (mx === r) hh = 60 * (((g - b) / dl) % 6);
      else if (mx === g) hh = 60 * ((b - r) / dl + 2);
      else hh = 60 * ((r - g) / dl + 4);
      if (hh < 0) hh += 360;
    }
    return hh >= par.hueMin && hh <= par.hueMax && dl / mx >= par.satMin && mx / 255 >= par.valMin;
  };
  const mediana = v => {
    if (!v.length) return null;
    const s = Float64Array.from(v).sort();
    const n = s.length;
    return n % 2 ? s[(n - 1) >> 1] : (s[n / 2 - 1] + s[n / 2]) / 2;
  };
  window.__centro = {
    indici: null,        // i pixel campionati, fissati sul fotogramma vero
    riquadro: null,      // il terzo centrale, in pixel di tela
    celleVuote: 0, celleTot: 0,
    mezzogiorno: null,   // l'ImageData del terzo centrale a ora=0

    /* il riquadro e la maschera: si ricalcolano solo quando si dichiara
       nuovo il fotogramma (una volta per istante) */
    fissa(par) {
      const cv = document.getElementById('gioco');
      const cx = cv.getContext('2d');
      const W = cv.width, H = cv.height;
      const dati = cx.getImageData(0, 0, W, H).data;
      const fx = par.centroFrazione;
      const ci0 = Math.round(par.celleX * (1 - fx) / 2), ci1 = par.celleX - ci0;
      const cj0 = Math.round(par.celleY * (1 - fx) / 2), cj1 = par.celleY - cj0;
      this.riquadro = {
        x0: Math.floor(ci0 * W / par.celleX), x1: Math.floor(ci1 * W / par.celleX),
        y0: Math.floor(cj0 * H / par.celleY), y1: Math.floor(cj1 * H / par.celleY),
      };
      const idx = [];
      let vuote = 0, tot = 0;
      for (let cj = cj0; cj < cj1; cj++) for (let ci = ci0; ci < ci1; ci++) {
        const x0 = Math.floor(ci * W / par.celleX), x1 = Math.floor((ci + 1) * W / par.celleX);
        const y0 = Math.floor(cj * H / par.celleY), y1 = Math.floor((cj + 1) * H / par.celleY);
        let n = 0, ne = 0, s = 0, s2 = 0;
        const dentro = [];
        for (let y = y0; y < y1; y += 2) {
          for (let x = x0; x < x1; x += 2) {
            const i = y * W + x, j = i * 4;
            const L = 0.2126 * dati[j] + 0.7152 * dati[j + 1] + 0.0722 * dati[j + 2];
            n++; s += L; s2 += L * L;
            if (famiglia(dati[j], dati[j + 1], dati[j + 2], par)) { ne++; dentro.push(i); }
          }
        }
        tot++;
        if (!n) continue;
        const m = s / n, dev = Math.sqrt(Math.max(0, s2 / n - m * m));
        /* la STESSA regola della prima misura: quasi tutto manto e poca
           varianza di luminanza dentro la cella */
        if (ne / n >= par.cellaErbaMin && dev <= par.cellaVarMax) {
          vuote++;
          for (const i of dentro) idx.push(i);
        }
      }
      this.indici = Int32Array.from(idx);
      this.celleVuote = vuote; this.celleTot = tot;
      return this.indici.length;
    },

    /* la misura vera e propria, sui pixel che ci sono ADESSO sulla tela */
    misura(par, opts) {
      opts = opts || {};
      if (opts.nuova || !this.indici) this.fissa(par);
      const cv = document.getElementById('gioco');
      const cx = cv.getContext('2d');
      const W = cv.width, H = cv.height;
      const dati = cx.getImageData(0, 0, W, H).data;
      const sat = [], lum = [], hue = [], rr = [], gg = [], bb = [];
      for (let k = 0; k < this.indici.length; k++) {
        const j = this.indici[k] * 4;
        const r = dati[j], g = dati[j + 1], b = dati[j + 2];
        const mx = r > g ? (r > b ? r : b) : (g > b ? g : b);
        const mn = r < g ? (r < b ? r : b) : (g < b ? g : b);
        const dl = mx - mn;
        let hh = 0;
        if (dl > 0) {
          if (mx === r) hh = 60 * (((g - b) / dl) % 6);
          else if (mx === g) hh = 60 * ((b - r) / dl + 2);
          else hh = 60 * ((r - g) / dl + 4);
          if (hh < 0) hh += 360;
        }
        sat.push(mx > 0 ? dl / mx : 0);
        lum.push(0.2126 * r + 0.7152 * g + 0.0722 * b);
        hue.push(hh); rr.push(r); gg.push(g); bb.push(b);
      }
      return {
        n: this.indici.length,
        celleVuote: this.celleVuote, celleTot: this.celleTot,
        sat: mediana(sat), lum: mediana(lum), tinta: mediana(hue),
        rgb: [mediana(rr), mediana(gg), mediana(bb)].map(v => v === null ? 0 : Math.round(v)),
        riquadro: this.riquadro,
      };
    },

    /* i pixel del terzo centrale a mezzogiorno, messi da parte: servono al
       falso dichiarato numero 3, che è il più onesto dei falsi possibili —
       un centro di mezzogiorno VERO, incollato sulla scena della sera */
    ricorda() {
      const cv = document.getElementById('gioco');
      const cx = cv.getContext('2d');
      const q = this.riquadro;
      this.mezzogiorno = cx.getImageData(q.x0, q.y0, q.x1 - q.x0, q.y1 - q.y0);
      return true;
    },
    incolla() {
      if (!this.mezzogiorno) return false;
      const cv = document.getElementById('gioco');
      const cx = cv.getContext('2d');
      const q = this.riquadro;
      cx.putImageData(this.mezzogiorno, q.x0, q.y0);   // putImageData ignora la trasformazione
      return true;
    },
    /* il falso opposto: il manto del terzo centrale portato a sera a mano,
       V e S moltiplicate per un fattore dichiarato. Si tocca solo la
       famiglia del verde, così le figure e le righe restano quelle. */
    porta(par, kv, ks) {
      const cv = document.getElementById('gioco');
      const cx = cv.getContext('2d');
      const q = this.riquadro;
      const im = cx.getImageData(q.x0, q.y0, q.x1 - q.x0, q.y1 - q.y0), d = im.data;
      for (let j = 0; j < d.length; j += 4) {
        const r = d[j], g = d[j + 1], b = d[j + 2];
        if (!famiglia(r, g, b, par)) continue;
        const mx = r > g ? (r > b ? r : b) : (g > b ? g : b);
        /* c' = mx - (mx - c)*ks  smorza la saturazione tenendo fermo V;
           poi *kv abbassa V tenendo ferma S */
        d[j] = Math.round((mx - (mx - r) * ks) * kv);
        d[j + 1] = Math.round((mx - (mx - g) * ks) * kv);
        d[j + 2] = Math.round((mx - (mx - b) * ks) * kv);
      }
      cx.putImageData(im, q.x0, q.y0);
      return true;
    },
  };
}

/* =========================================================================
   LA MISURA, IN PAGINA.
   Tutto quello che segue gira dentro il browser: legge i pixel del canvas
   con getImageData (nessuna libreria, nessun formato di mezzo) e lo stato
   vero del gioco con gli hook __test. Restituisce numeri, non giudizi: i
   cancelli li applica il lato Node, così le soglie stanno in un posto solo.
   ====================================================================== */
function misuraInPagina(arg) {
  const par = arg.par, controllo = arg.controllo;
  /* ---------- accesso allo stato e alla trasformazione della camera ---- */
  const t = window.__test;
  const G = t.G;
  const cv = document.getElementById('gioco');
  const cx = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  const dpr = (typeof DPR !== 'undefined' && DPR) ? DPR : 1;

  /* ========= I DUE FALSI DEL CANCELLO 7, E PERCHE' STANNO QUI IN CIMA ==
     Il cancello nuovo non guarda i pixel del manto: guarda i SOGGETTI, e
     i soggetti li ridisegna questo strumento dal rig del gioco. Un falso
     che ridipingesse la tela — come fanno i controlli 3 e 4 — non
     toccherebbe la maschera dei corpi, e il cancello non se ne
     accorgerebbe nemmeno: sarebbe un falso troppo gentile, cioè
     esattamente quello che in questa cartella ha già fatto «passare» tre
     cancelli senza metterli alla prova. Quindi qui non si dipinge
     niente: SI SPOSTANO GLI ATTORI e si lascia ridisegnare il gioco, con
     la sua render(), la sua luce e le sue ombre. Quello che ne esce è
     una scena vera, non una vernice.
     LA CAMERA RESTA FERMA. render() comincia con updateCamera: se la si
     lasciasse correre, il falso cambierebbe anche l'inquadratura e non
     sarebbe più confrontabile col vero. Si mette updateCamera a riposo
     per il tempo di un disegno e si VERIFICA che la camera non si sia
     mossa; se si è mossa lo si dichiara, invece di tacerlo.
     Tutto si rimette com'era prima di uscire da questa funzione: la tela
     resta quella del falso — è lei che va fotografata — lo stato no. */
  const scena = { attiva: false, pos: null, palla: null, cam: null, view: null,
    uc: null, ferma: null, spostate: 0, dentro: 0, nota: '' };
  if (controllo === 5 || controllo === 6) {
    const Wp = cv.width, Hp = cv.height;
    const S2p = (G.view.S2 || 1);
    const Axp = (G.view.Ax || 0) + (G.view.sx || 0);
    const Ayp = (G.view.Ay || 0) + (G.view.sy || 0);
    const PD = (typeof P_DIS !== 'undefined') ? P_DIS : 1.18;
    const RH = (typeof RIG_H !== 'undefined') ? RIG_H : 34;
    const RP = (typeof RIG_PIEDI !== 'undefined') ? RIG_PIEDI : 10;
    const fxp = par.centroFrazione;
    const ai0 = Math.round(par.celleX * (1 - fxp) / 2), ai1 = par.celleX - ai0;
    const aj0 = Math.round(par.celleY * (1 - fxp) / 2), aj1 = par.celleY - aj0;
    const rx0 = Math.floor(ai0 * Wp / par.celleX), rx1 = Math.floor(ai1 * Wp / par.celleX);
    const ry0 = Math.floor(aj0 * Hp / par.celleY), ry1 = Math.floor(aj1 * Hp / par.celleY);
    const versoX = px => (px / dpr - Axp) / S2p;
    const versoY = py => (py / dpr - Ayp) / S2p;
    const inX = x => (x * S2p + Axp) * dpr;
    const inY = y => (y * S2p + Ayp) * dpr;
    scena.attiva = true;
    scena.pos = G.players.map(p => ({ p, x: p.x, y: p.y }));
    scena.palla = { x: G.ball.x, y: G.ball.y, z: G.ball.z || 0 };
    scena.cam = { x: G.cam.x, y: G.cam.y, z: G.cam.z };
    scena.view = { Ax: G.view.Ax, Ay: G.view.Ay, S2: G.view.S2 };
    /* il riquadro di UNA figura a schermo, con la stessa geometria della
       silhouette qui sotto: un solo posto dove è scritta */
    const riquadroDi = p => {
      const hPx = (RH / (p.squash || 1)) * PD * S2p * dpr;
      const gx = inX(p.x), gy = inY(p.y + RP * PD);
      /* LA SAGOMA E' LARGA QUANTO E' ALTA, e questa riga è costata una
         corsa: con la mezza larghezza a 0,225 il riquadro stimato era
         meno di metà di quello vero e lo sgombro lasciava dentro delle
         figure. Misurato sulle sagome vere (31 figure, due corse): la
         larghezza sta fra 0,65 e 1,09 volte l'altezza, quindi la mezza
         larghezza arriva a 0,545. Qui si usa 0,60 — sopra il massimo
         misurato — e in verticale si abbonda di un quarto d'altezza,
         perché il riquadro del nero non è centrato sui piedi. Un falso
         che sbaglia il riquadro non è severo, è rotto. */
      return { x0: gx - 0.60 * hPx, x1: gx + 0.60 * hPx, y0: gy - 1.25 * hPx, y1: gy + 0.15 * hPx };
    };
    const tocca = r => r.x1 >= rx0 && r.x0 < rx1 && r.y1 >= ry0 && r.y0 < ry1;
    /* SGOMBRO, NEL CASO PEGGIORE: ogni figura che tocca il riquadro si
       sposta dello STRETTO indispensabile per uscirne, di lato, restando
       alla stessa profondità — stessa taglia, stessa ombra, stessa luce
       — e il PALLONE non si tocca. E' lo svuotamento più gentile che si
       possa costruire: se il cancello passasse lo stesso, non starebbe
       contando i corpi ma qualcos'altro. */
    for (const p of G.players) {
      if (p.out > 0) continue;
      const r = riquadroDi(p);
      if (!tocca(r)) continue;
      const aSinistra = (rx0 - r.x1 - 1) / (S2p * dpr);   // negativo
      const aDestra = (rx1 - r.x0 + 1) / (S2p * dpr);     // positivo
      p.x += Math.abs(aSinistra) <= Math.abs(aDestra) ? aSinistra : aDestra;
      scena.spostate++;
    }
    if (controllo === 6) {
      /* IL DUELLO AL CENTRO, ED E' IL CASO PEGGIORE PER UN FALSO CHE DEVE
         PASSARE: dentro il riquadro non ci si mette una folla, ci si
         mette ESATTAMENTE l'aritmetica del tetto — due figure e il
         pallone, e nient'altro, perché tutti gli altri sono appena stati
         sgombrati. Se il cancello non diventasse verde qui, il tetto
         chiederebbe più di quanto il suo stesso conto promette e andrebbe
         rifatto. */
      const xc = versoX((rx0 + rx1) / 2), yc = versoY((ry0 + ry1) / 2);
      const vivi = G.players.filter(p => p.out <= 0);
      const dist2 = p => (p.x - scena.palla.x) * (p.x - scena.palla.x) +
                         (p.y - scena.palla.y) * (p.y - scena.palla.y);
      const vicini = vivi.slice().sort((a, b) => dist2(a) - dist2(b)).slice(0, 2);
      const yFigura = yc + 0.5 * RH * PD - RP * PD;
      const mezzoDuello = 23;            // il duello, per il gioco, sta sotto le 46 unità
      vicini.forEach((p, k) => { p.x = xc + (k === 0 ? -mezzoDuello : mezzoDuello); p.y = yFigura; });
      G.ball.x = xc; G.ball.y = yc; G.ball.z = 0;
      scena.dentro = vicini.length;
    }
    try {
      if (typeof updateCamera === 'function') {
        scena.uc = updateCamera;
        updateCamera = function () {};
      } else { scena.nota = 'updateCamera non si vede da qui'; }
    } catch (e) { scena.nota = 'updateCamera non si lascia mettere a riposo'; }
    t.disegna();
    scena.ferma = Math.abs(G.cam.x - scena.cam.x) < 1e-6 &&
      Math.abs(G.cam.y - scena.cam.y) < 1e-6 &&
      Math.abs((G.view.S2 || 1) - scena.view.S2) < 1e-9;
  }

  const S2 = (G.view.S2 || 1);
  const Ax = (G.view.Ax || 0) + (G.view.sx || 0);
  const Ay = (G.view.Ay || 0) + (G.view.sy || 0);
  /* mondo -> pixel della tela (la tela è grande DPR volte il viewport) */
  const sx = x => (x * S2 + Ax) * dpr;
  const sy = y => (y * S2 + Ay) * dpr;

  /* costanti del disegno delle figure: sono del gioco, non nostre. Se un
     giorno spariscono la misura lo dice invece di inventarsele. */
  const mancanti = [];
  const preso = (nome, v, d) => { if (v === undefined) { mancanti.push(nome); return d; } return v; };
  const P_DIS_ = preso('P_DIS', typeof P_DIS !== 'undefined' ? P_DIS : undefined, 1.18);
  const RIG_H_ = preso('RIG_H', typeof RIG_H !== 'undefined' ? RIG_H : undefined, 34);
  const RIG_PIEDI_ = preso('RIG_PIEDI', typeof RIG_PIEDI !== 'undefined' ? RIG_PIEDI : undefined, 10);
  const RIG_YAW_K_ = preso('RIG_YAW_K', typeof RIG_YAW_K !== 'undefined' ? RIG_YAW_K : undefined, Math.PI / 2);
  const B_R_ = preso('B_R', typeof B_R !== 'undefined' ? B_R : undefined, 8);
  const rig = (typeof Rig3D !== 'undefined') ? Rig3D : null;
  const statoDi = (typeof rigStato === 'function') ? rigStato : null;
  if (!rig) mancanti.push('Rig3D');
  if (!statoDi) mancanti.push('rigStato');

  /* =========================================================== SILHOUETTE
     Le figure ridipinte di nero puro su fondo bianco. Non è una sagoma
     approssimata: è la stessa Rig3D.disegna del fotogramma vero, con la
     stessa clip, la stessa fase, lo stesso yaw e la stessa scala — solo
     con una divisa tutta nera. Serve a tre cose insieme: il test della
     silhouette del tema 2, la maschera dei corpi (sotto un corpo l'ombra
     non si vede, e misurarla lì sarebbe misurare la maglia) e l'altezza
     vera della figura a schermo, presa dal riquadro del nero e non da una
     costante dichiarata. ============================================== */
  const NERO = {
    maglia: '#000', maglia2: '#000', disegno: 'tinta',
    pantaloncini: '#000', calze: '#000', risvolto: '#000',
    pelle: '#000', capelli: '#000', scarpe: '#000',
    palla: null, taglio: 0,
  };
  const sil = document.createElement('canvas');
  sil.width = W; sil.height = H;
  const sc = sil.getContext('2d');
  sc.fillStyle = '#ffffff'; sc.fillRect(0, 0, W, H);
  const scr = document.createElement('canvas');

  const figure = [];
  if (rig && statoDi) {
    /* lo stesso scarto di quadro di render(): chi è fuori non si disegna */
    const qx0 = (-Ax) / S2 - 34, qx1 = (W / dpr - Ax) / S2 + 34;
    const qy0 = (-Ay) / S2 - 34, qy1 = (H / dpr - Ay) / S2 + 34;
    for (const p of G.players) {
      if (p.out > 0) continue;
      if (p.x < qx0 || p.x > qx1 || p.y < qy0 || p.y > qy1) continue;
      if (typeof fermoCoperto === 'function' && fermoCoperto(p)) continue;
      const pi = G.players.indexOf(p);
      const hasBall = G.ball && G.ball.owner === pi;
      const isCtrl = !G.cpu[p.team] && G.ctrl[p.team] === pi;
      const celeb = p.celeb > 0;
      const lod = !isCtrl && !hasBall && !celeb &&
        (typeof figuraLontana === 'function' ? figuraLontana(p) : false);
      /* la posa: la decide il gioco, non noi */
      const st = statoDi(p);
      let clip = st.clip, u = st.u;
      if (lod) { clip = 'fermo'; u = 0.30; }
      /* lo yaw: la stessa catena di casi di drawPlayer */
      const gk = p.role === 'gk';
      let a;
      if (p.dive > 0 || (gk && p.recover > 0)) a = Math.atan2(p.diveDY, p.diveDX);
      else if (p.rove >= 0 || (p.charge >= 0 && p.chargeKind === 'rovesciata'))
        a = Math.atan2(-(p.roveDY || p.fy), -(p.roveDX || p.fx));
      else if (p.slide >= 0 || p.recover > 0) a = Math.atan2(p.slideDY || p.fy, p.slideDX || p.fx);
      else if (celeb) a = Math.PI / 2 + ((p.idx & 1) ? 0.38 : -0.38);
      else a = p.ang;
      const yaw = a + RIG_YAW_K_;
      /* altezza in pixel di tela e punto a terra, con le stesse due scale
         del gioco: quella della camera (S2), quella del disegno (P_DIS) e
         quella della tela (DPR) */
      const hPx = (RIG_H_ / (p.squash || 1)) * P_DIS_ * S2 * dpr;
      const gx = sx(p.x), gy = sy(p.y + RIG_PIEDI_ * P_DIS_);
      const box = Math.max(24, Math.ceil(hPx * 3));
      scr.width = box; scr.height = box;
      const s2 = scr.getContext('2d');
      const cxs = box / 2, cys = box * 0.72;
      const clipDef = rig.CLIPS[clip];
      if (!clipDef) continue;
      /* pxs: il gioco passa (S2 x P_DIS), cioè pixel CSS per unità di
         disegno. Qui l'altezza è già in pixel di tela (DPR volte più
         grandi), quindi 1/DPR riporta la stessa decisione di dettaglio. */
      try {
        s2.save();
        const tilt = (typeof SAVE !== 'undefined' && SAVE.moto) ? (p.rollio || 0) * 0.30 : 0;
        if (tilt > 0.02 || tilt < -0.02) {
          s2.translate(cxs, cys); s2.rotate(tilt); s2.translate(-cxs, -cys);
        }
        rig.disegna(s2, cxs, cys, hPx, yaw, 'alto', clip, u / clipDef.freq, NERO, true, 1 / dpr);
        s2.restore();
      } catch (e) { continue; }
      /* il riquadro del nero: è l'altezza VERA della figura a schermo */
      const d = s2.getImageData(0, 0, box, box).data;
      let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
      for (let y = 0; y < box; y++) {
        for (let x = 0; x < box; x++) {
          if (d[(y * box + x) * 4 + 3] > 24) {
            if (x < x0) x0 = x; if (x > x1) x1 = x;
            if (y < y0) y0 = y; if (y > y1) y1 = y;
          }
        }
      }
      if (x1 < 0) continue;
      const ox = gx - cxs, oy = gy - cys;
      sc.drawImage(scr, ox, oy);
      figure.push({
        idx: p.idx, team: p.team, ruolo: p.role, clip, palla: !!hasBall,
        x0: x0 + ox, y0: y0 + oy, x1: x1 + ox, y1: y1 + oy,
        h: (y1 - y0) + 1, w: (x1 - x0) + 1,
        piedeX: (x0 + x1) / 2 + ox, piedeY: y1 + oy,
        /* il punto del corpo da cui il gioco DICHIARA di gettare l'ombra
           (__test.ombraCapsula: piedeX/piedeY in unità di campo dal centro
           del giocatore). E' l'ancora giusta per la marcia: partendo dal
           pixel nero più basso — un piede in falcata, anche quindici unità
           più avanti — il corridoio nasce di lato alla capsula e la
           manca, perché la capsula è semilarga diciannove pixel su
           duecentoventi di lunghezza. Misurato: la marcia sulla direzione
           dichiarata dava 0 px su cinque figure su sei; con l'ancora
           giusta le trova tutte. */
        ancoraX: null, ancoraY: null,
        px: p.x, py: p.y,
      });
    }
  }
  /* il nero si porta a nero puro e il resto a bianco: una silhouette con
     mezzetinte non è una silhouette */
  {
    const im = sc.getImageData(0, 0, W, H), q = im.data;
    for (let i = 0; i < q.length; i += 4) {
      const L = 0.2126 * q[i] + 0.7152 * q[i + 1] + 0.0722 * q[i + 2];
      const nero = L < 200 ? 0 : 255;
      q[i] = q[i + 1] = q[i + 2] = nero; q[i + 3] = 255;
    }
    sc.putImageData(im, 0, 0);
  }

  /* ============================================ I FALSI DICHIARATI
     Solo con --controllo, e mai per conto loro. Da quando il gioco le
     ombre lunghe ce le ha davvero, il banco serve a dimostrare due cose
     diverse e più difficili della prima versione:

       controllo 1 — IL SOLE SPOSTATO. Si spiana il manto (via ogni ombra
         vera) e si ridipingono ombre lunghe tutte a 145 gradi, dove il
         gioco continua a DICHIARARNE 20. La misura deve seguire i PIXEL
         e dire 145, non la dichiarazione: se dicesse 20 starebbe
         copiando la risposta invece di misurarla. E il confronto col
         dichiarato deve accendersi e gridare che uno dei due mente.
       controllo 2 — IL PRATO SPIANATO: ogni pixel di manto portato alla
         stessa tinta, cioè un campo senza alcuna legge di luce. Le ombre
         non si devono più trovare e il gradiente deve cadere a zero.

     Se una misura non cambia fra i due falsi, non sta misurando niente. */
  const spianaPrato = () => {
    const im = cx.getImageData(0, 0, W, H), q = im.data;
    let sr = 0, sg = 0, sb = 0, ng = 0;
    const verde = j => {
      const r = q[j], g = q[j + 1], b = q[j + 2];
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), dl = mx - mn;
      if (!dl) return false;
      let hh;
      if (mx === r) hh = 60 * (((g - b) / dl) % 6);
      else if (mx === g) hh = 60 * ((b - r) / dl + 2);
      else hh = 60 * ((r - g) / dl + 4);
      if (hh < 0) hh += 360;
      return hh >= par.hueMin && hh <= par.hueMax && dl / mx >= par.satMin && mx / 255 >= par.valMin;
    };
    for (let j = 0; j < q.length; j += 4) if (verde(j)) { sr += q[j]; sg += q[j + 1]; sb += q[j + 2]; ng++; }
    if (!ng) return;
    const mr = Math.round(sr / ng), mg = Math.round(sg / ng), mb = Math.round(sb / ng);
    for (let j = 0; j < q.length; j += 4) if (verde(j)) { q[j] = mr; q[j + 1] = mg; q[j + 2] = mb; }
    cx.save(); cx.setTransform(1, 0, 0, 1, 0, 0);
    cx.putImageData(im, 0, 0);
    cx.restore();
  };
  if (controllo === 1) {
    const ang = 145 * Math.PI / 180;      // sole spostato: ombre a sinistra-giù
    spianaPrato();                        // prima si toglie di mezzo la luce vera
    cx.save();
    cx.setTransform(1, 0, 0, 1, 0, 0);
    for (const f of figure) {
      const L = 2.0 * f.h;
      cx.save();
      cx.translate(f.piedeX, f.piedeY);
      cx.rotate(ang);
      cx.globalAlpha = 0.45; cx.fillStyle = '#000';
      cx.beginPath(); cx.ellipse(L / 2, 0, L / 2, 0.22 * f.h, 0, 0, 6.2832); cx.fill();
      cx.restore();
    }
    cx.globalAlpha = 1;
    /* e i CORPI si ridisegnano sopra: un'ombra vera sta SOTTO la figura e
       sotto il suo alone di stacco, e la misura deve fare i conti con
       quel pezzo di ombra che non si vede. Un falso più facile del vero
       non dimostrerebbe niente. E' la stessa drawPlayer del gioco, con la
       stessa trasformazione di camera. */
    if (typeof drawPlayer === 'function') {
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx.translate(Ax, Ay); cx.scale(S2, S2);
      const lista = G.players.filter(p => p.out <= 0).slice().sort((a, b) => a.y - b.y);
      for (const p of lista) { try { drawPlayer(p); } catch (e) {} }
      cx.setTransform(1, 0, 0, 1, 0, 0);
    }
    const g = cx.createLinearGradient(0, 0, W, H * 0.35);
    g.addColorStop(0, 'rgba(255,170,60,0.10)');
    g.addColorStop(1, 'rgba(30,90,255,0.10)');
    cx.fillStyle = g; cx.fillRect(0, 0, W, H);
    cx.restore();
  } else if (controllo === 2) {
    spianaPrato();
  } else if (controllo === 3) {
    /* controllo 3 — IL CENTRO SPIANATO A MEZZOGIORNO. Non è vernice
       inventata: è il terzo centrale VERO del fotogramma a ora=0, messo
       da parte quando si è preso il riferimento e incollato qui sopra la
       scena della sera. Il gioco continua a dichiarare l'ora tarda, le
       ombre restano lunghe, i bordi restano velati: solo il centro è
       tornato mezzogiorno. E' esattamente il difetto che il giudice ha
       visto a occhio, riprodotto al pixel — la misura DEVE dire NO. */
    window.__centro.incolla();
  } else if (controllo === 4) {
    /* controllo 4 — IL CENTRO PORTATO A SERA. L'opposto: il manto del
       terzo centrale smorzato e scurito a mano di un quarto (V e S per
       0,75). Se la misura non diventa verde qui, non sa passare — e un
       cancello che non sa passare è rumore, non un metro. */
    window.__centro.porta(par, 0.75, 0.75);
  } else if (controllo === 5 || controllo === 6) {
    /* LA SCENA DEI DUE FALSI SI PREPARA IN CIMA A QUESTA FUNZIONE, prima
       che la silhouette venga costruita: qui non c'è più niente da
       dipingere. Quello che segue — il terzo centrale spianato a manto e
       riempito di sagome d'ardesia — era il falso del cancello VECCHIO,
       quello che contava l'erba; resta scritto e non si esegue più,
       perché ridipingere la tela non tocca la maschera dei corpi e
       quindi non metterebbe alla prova un bel niente. */
  } else if (controllo === -5 || controllo === -6) {
    /* controlli 5 e 6 — IL TERZO CENTRALE SVUOTATO e RIEMPITO, i due
       falsi del cancello nuovo. Il quinto stende sul terzo centrale il
       manto medio del quadro, tutto uguale: trentadue celle su trentadue
       diventano erba vuota e il cancello DEVE diventare rosso al 100%.
       Il sesto ci posa sopra una sagoma d'ardesia per cella — soggetti di
       cartone, ma soggetti — e nessuna cella resta manto uniforme: il
       cancello DEVE diventare verde a zero. Un tetto che non sa fare
       tutt'e due le cose non è un tetto, è un'opinione. */
    const fx = par.centroFrazione;
    const ci0 = Math.round(par.celleX * (1 - fx) / 2), ci1 = par.celleX - ci0;
    const cj0 = Math.round(par.celleY * (1 - fx) / 2), cj1 = par.celleY - cj0;
    const qx0 = Math.floor(ci0 * W / par.celleX), qx1 = Math.floor(ci1 * W / par.celleX);
    const qy0 = Math.floor(cj0 * H / par.celleY), qy1 = Math.floor(cj1 * H / par.celleY);
    cx.save(); cx.setTransform(1, 0, 0, 1, 0, 0);
    if (controllo === 5) {
      /* la tinta non è inventata: è la media del manto di QUESTO
         fotogramma, la stessa che usa il prato spianato */
      const im = cx.getImageData(0, 0, W, H), q = im.data;
      let sr = 0, sg = 0, sb = 0, ng = 0;
      for (let j = 0; j < q.length; j += 4) {
        const r = q[j], g = q[j + 1], bl = q[j + 2];
        const mx = Math.max(r, g, bl), mn = Math.min(r, g, bl), dl = mx - mn;
        if (!dl) continue;
        let hh;
        if (mx === r) hh = 60 * (((g - bl) / dl) % 6);
        else if (mx === g) hh = 60 * ((bl - r) / dl + 2);
        else hh = 60 * ((r - g) / dl + 4);
        if (hh < 0) hh += 360;
        if (hh >= par.hueMin && hh <= par.hueMax && dl / mx >= par.satMin && mx / 255 >= par.valMin) {
          sr += r; sg += g; sb += bl; ng++;
        }
      }
      if (ng) {
        cx.fillStyle = `rgb(${Math.round(sr / ng)},${Math.round(sg / ng)},${Math.round(sb / ng)})`;
        cx.fillRect(qx0, qy0, qx1 - qx0, qy1 - qy0);
      }
    } else {
      cx.fillStyle = '#2b3138';
      for (let cj = cj0; cj < cj1; cj++) for (let ci = ci0; ci < ci1; ci++) {
        const x0 = Math.floor(ci * W / par.celleX), x1 = Math.floor((ci + 1) * W / par.celleX);
        const y0 = Math.floor(cj * H / par.celleY), y1 = Math.floor((cj + 1) * H / par.celleY);
        const mw = (x1 - x0) * 0.5, mh = (y1 - y0) * 0.5;
        cx.fillRect(x0 + mw / 2, y0 + mh / 2, mw, mh);
      }
    }
    cx.restore();
  } else if (controllo === 7) {
    /* controllo 7 — L'ANELLO ATTORNO ALLA PALLA, il falso che il giudice
       ha descritto senza poterlo dipingere. Si posa attorno al pallone
       l'anello di possesso NEL CASO PEGGIORE: concentrico (il vero è
       un'ellisse attorno ai piedi, che tocca la palla solo da un lato) e
       alla distanza minima che il gioco stesso garantisce — il raggio
       disegnato più le 2,6 unità di erba di bucoPalla. Stessi colori del
       gioco: lo zoccolo nero sotto, il gesso sopra.
       Il conto SEVERO non si deve muovere di un pixel; quello
       PERMISSIVO, che è il conto di ieri, deve gonfiarsi. E' la prova
       che la riparazione ripara qualcosa che esisteva davvero. */
    const bb = G.ball;
    let rd = 0;
    try { rd = (typeof t.pallaRaggio === 'function') ? +t.pallaRaggio() : 0; } catch (e) { rd = 0; }
    if (!(rd > 0)) {
      /* BANCO ONESTO: nessun ripiego muto. Cinque costanti del disegno
         (P_DIS, RIG_H, RIG_PIEDI, RIG_YAW_K, B_R) passano gia' da
         preso(), che le DICHIARA quando mancano; questo raggio no:
         ripiegava su B_R in silenzio. E qui pesa il doppio, perche' il
         banco 7 posa il falso ATTORNO al pallone: col raggio sbagliato
         l'anello finisce dove il gioco non lo mette mai, il conto severo
         non si muove per il motivo sbagliato e il banco dichiara
         riparato un difetto che non ha messo alla prova.
         Il lancio lo raccoglie chi chiama (vedi "controllo: 7"): uccide
         il banco 7, non le altre tredici misure dell'istante. */
      throw new Error("banco 7: __test.pallaRaggio non c'e'. Senza il raggio dichiarato l'anello falso " +
        'non si posa dove il gioco lo posa, e il controllo direbbe verde per il motivo sbagliato.');
    }
    const cxp = sx(bb.x), cyp = sy(bb.y - (bb.z || 0) * 0.55);
    const u = S2 * dpr;                       // unità di campo -> pixel di tela
    /* IL CASO PEGGIORE VERO, e ci sono voluti due tentativi per trovarlo.
       Il primo metteva il bordo interno dello ZOCCOLO NERO sul varco, e
       così il gesso — che è la cosa chiara, quella che il raggio può
       scambiare per palla — finiva tre pixel più in là e nessun raggio
       ci arrivava: un falso troppo gentile, che avrebbe dichiarato
       riparato un difetto senza averlo messo alla prova. Il gioco però
       taglia l'anello col vuoto (bucoPalla, regola pari-dispari), e il
       taglio passa DENTRO il tratto: quando l'ellisse dell'anello
       attraversa il cerchio del taglio, il primo pixel superstite può
       benissimo essere gesso. Quindi qui si fa esattamente così — stesso
       taglio evenodd del gioco, tratto centrato SUL taglio — e il bianco
       comincia al pixel esatto in cui il gioco lo consente. */
    const rTaglio = (rd + 2.6) * u;
    cx.save(); cx.setTransform(1, 0, 0, 1, 0, 0);
    cx.beginPath();
    cx.rect(0, 0, W, H);
    cx.arc(cxp, cyp, rTaglio, 0, 6.2832);
    cx.clip('evenodd');
    cx.strokeStyle = 'rgba(0,0,0,.38)'; cx.lineWidth = 3.8 * 1.18 * u;
    cx.beginPath(); cx.arc(cxp, cyp, rTaglio, 0, 6.2832); cx.stroke();
    cx.strokeStyle = 'rgba(242,245,239,.92)'; cx.lineWidth = 2.2 * 1.18 * u;
    cx.beginPath(); cx.arc(cxp, cyp, rTaglio, 0, 6.2832); cx.stroke();
    cx.restore();
  }

  /* ================================================== I PIXEL DEL QUADRO
     Una passata sola: luminanza, appartenenza alla famiglia del prato e
     tinta. Da qui in poi nessuna misura tocca più il canvas. */
  const dati = cx.getImageData(0, 0, W, H).data;
  const N = W * H;
  /* ============================ SOTTO L'INTERFACCIA NON C'E' PRATO
     Il gioco DICHIARA i rettangoli che la sua interfaccia occupa sulla
     tela (__test.zoneInterfaccia: tabellone, stick, pulsanti, bussola,
     ciascuno con l'alfa che ha in QUESTO fotogramma). Quei pixel non
     entrano nella famiglia del prato, e non è una cortesia: una
     pastiglia scura semitrasparente stesa sul manto ha la TINTA del
     prato e la LUMINANZA di un'ombra, quindi la marcia delle ombre ci
     entra dentro e ne esce con una direzione che non è quella del sole.
     Misurato il 17 agosto 2026 sul freeze-frame test: tre istanti su
     otto del cancello «ombre parallele» erano figure che avevano
     marciato dentro la bussola (59° e 62°, larghe 86 e 74) o dentro il
     tabellone velato da velaTabellone (-20°), mentre le ombre vere degli
     stessi fotogrammi stavano a 20-23 gradi e larghe 18-26.

     E' UNA DICHIARAZIONE DEL MISURATO, QUINDI VA RESA INNOCUA — e il modo
     giusto NON è un tetto numerico. Il primo tentativo toglieva quei
     pixel dalla FAMIGLIA DEL PRATO, cioè da tutte e sei le misure, e
     allora sì che serviva un tetto: un gioco poteva dichiarare
     interfaccia sopra l'erba vuota e comprarsi il cancello del quadro
     pieno. Misurato: l'interfaccia vera di un telefono in orizzontale
     occupa il 12,8% della tela, cioè già oltre il tetto che le si voleva
     dare, e il tetto la rifiutava in blocco — la guardia funzionava e la
     riparazione no.
     LA DICHIARAZIONE SI RESTRINGE A CIO' CHE HA DAVVERO GUASTATO: sotto
     l'interfaccia non c'è OMBRA. Nient'altro cambia — erba vuota, palla,
     figura, temperatura e centro leggono gli stessi identici pixel di
     prima. E così la guardia non è più un numero ma la STRUTTURA della
     cosa: escludere pixel dal buio può solo TOGLIERE prove d'ombra, mai
     aggiungerne. Un gioco che dichiarasse mezzo schermo d'interfaccia
     non si comprerebbe un cancello: perderebbe le ombre e cadrebbe sul
     «solo N figure hanno un'ombra misurabile». Una dichiarazione che può
     solo nuocere a chi la fa non ha bisogno di essere creduta.
     Restano due guardie, e sono cautele, non puntelli:
       1. si scarta solo ciò che è DAVVERO dipinto: sotto ifaccAlfaMin
          l'elemento si è tolto di mezzo e i pixel tornano prato;
       2. la superficie dichiarata si stampa a ogni istante, così nessuno
          la fa crescere in silenzio da un'onda all'altra. */
  const ifacc = { zone: 0, pixel: 0, frazione: 0, dichiarata: false, tipi: '', perche: '' };
  const sottoUI = new Uint8Array(N);
  /* BANCO ONESTO: nessun ripiego muto. Tre modi di restare muti,
     tutti chiusi: la funzione che manca, la funzione che esplode, e —
     quello che la prima edizione lasciava aperto — la funzione che torna
     un elenco VUOTO. Succede in menu, fine partita, pausa e moviola,
     dove TOUCH_ZONE e' vuoto: li' l'esclusione non c'e' e va detto, non
     lasciato intendere. E il catch adesso avvolge SOLO la chiamata
     all'hook: prima incolpava zoneInterfaccia di qualunque eccezione
     nascesse nelle venti righe sotto, che e' la stessa malattia
     dall'altro lato. */
  let zz = null;
  if (typeof t.zoneInterfaccia !== 'function') { mancanti.push('__test.zoneInterfaccia'); ifacc.perche = 'la funzione non esiste'; }
  else {
    try { zz = t.zoneInterfaccia(); }
    catch (e) { mancanti.push('__test.zoneInterfaccia'); ifacc.perche = "la funzione e' esplosa: " + e.message; }
    if (!ifacc.perche && !Array.isArray(zz)) { mancanti.push('__test.zoneInterfaccia'); ifacc.perche = 'non torna un elenco'; zz = null; }
    else if (!ifacc.perche && !zz.length) ifacc.perche = "l'elenco e' VUOTO (succede in menu, pausa, moviola e fine partita, dove il gioco non dipinge comandi)";
  }
  try {
    if (zz && zz.length) {
      ifacc.dichiarata = true;
      const usate = zz.filter(z => (z.alfa === undefined ? 1 : z.alfa) >= par.ifaccAlfaMin);
      ifacc.tipi = usate.map(z => z.tipo).join('+');
      for (const z of usate) {
        const x0 = Math.max(0, Math.floor(z.x0 * dpr)), y0 = Math.max(0, Math.floor(z.y0 * dpr));
        const x1 = Math.min(W, Math.ceil(z.x1 * dpr)), y1 = Math.min(H, Math.ceil(z.y1 * dpr));
        if (x1 <= x0 || y1 <= y0) continue;
        ifacc.zone++;
        for (let y = y0; y < y1; y++) {
          const b = y * W;
          for (let x = x0; x < x1; x++) { if (!sottoUI[b + x]) { sottoUI[b + x] = 1; ifacc.pixel++; } }
        }
      }
      ifacc.frazione = ifacc.pixel / N;
    }
  } catch (e) { ifacc.perche = "il conto delle zone e' esploso: " + e.message; }
  const Lm = new Float32Array(N);
  const erba = new Uint8Array(N);
  const Hue = new Float32Array(N);
  const Sat = new Float32Array(N);
  const istL = new Uint32Array(256);
  const istErba = new Uint32Array(256);
  for (let i = 0, j = 0; i < N; i++, j += 4) {
    const r = dati[j], g = dati[j + 1], b = dati[j + 2];
    const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    Lm[i] = L;
    istL[L | 0]++;
    const mx = r > g ? (r > b ? r : b) : (g > b ? g : b);
    const mn = r < g ? (r < b ? r : b) : (g < b ? g : b);
    const dl = mx - mn;
    let hh = 0;
    if (dl > 0) {
      if (mx === r) hh = 60 * (((g - b) / dl) % 6);
      else if (mx === g) hh = 60 * ((b - r) / dl + 2);
      else hh = 60 * ((r - g) / dl + 4);
      if (hh < 0) hh += 360;
    }
    Hue[i] = hh;
    const sat = mx > 0 ? dl / mx : 0;
    Sat[i] = sat;
    if (hh >= par.hueMin && hh <= par.hueMax && sat >= par.satMin && mx / 255 >= par.valMin) {
      erba[i] = 1; istErba[L | 0]++;
    }
  }
  const mediana = ist => {
    let tot = 0; for (let k = 0; k < 256; k++) tot += ist[k];
    if (!tot) return 0;
    let acc = 0;
    for (let k = 0; k < 256; k++) { acc += ist[k]; if (acc >= tot / 2) return k; }
    return 255;
  };
  const Lquadro = mediana(istL);
  const Lprato = mediana(istErba);

  /* ============================== L'IMPRONTA DELL'ISTANTE
     Un campione di luminanza ogni indipPasso pixel per lato — quattro su
     quattro, cioè un sedicesimo della tela, quattrocentomila numeri: più
     che abbastanza perché una differenza media assoluta sia una misura e
     non una stima. Serve a una cosa sola, e non è una diagnostica: a
     dimostrare che gli otto campioni sono OTTO. Si prende sul fotogramma
     VERO (controllo 0) e mai sui falsi dichiarati, che ridipingono. */
  if (arg.impronta) {
    const ps = Math.max(1, par.indipPasso | 0);
    const nw = Math.ceil(W / ps), nh = Math.ceil(H / ps);
    const imp = new Uint8Array(nw * nh);
    let q = 0;
    for (let y = 0; y < H; y += ps) for (let x = 0; x < W; x += ps) imp[q++] = Lm[y * W + x] | 0;
    const dove = arg.impronta === 'gemello' ? '__gemello' : '__impronte';
    (window[dove] = window[dove] || []).push(imp);
  }

  /* maschera dei corpi, dalla silhouette */
  const corpo = new Uint8Array(N);
  {
    const q = sc.getImageData(0, 0, W, H).data;
    for (let i = 0, j = 0; i < N; i++, j += 4) corpo[i] = q[j] < 128 ? 1 : 0;
  }

  /* ============================================== 1. L'ERBA VUOTA
     Una cella è vuota se quasi tutti i suoi pixel stanno nella famiglia
     del prato E la luminanza dentro la cella varia poco: un giocatore,
     una riga di gesso, la palla, un cartellone o un pannello dell'HUD
     rompono l'una o l'altra condizione. */
  /* SOTTO L'INTERFACCIA NON C'E' ERBA, E NEMMENO POSTO PER L'ERBA. Ogni
     cella porta con sé quanta parte di sé sta sotto una zona dichiarata:
     la somma è la superficie che dall'area giocabile va tolta. Il
     numeratore — le celle vuote — non si tocca: se una pastiglia è così
     trasparente che sotto si legge ancora manto uniforme, quel manto
     l'occhio lo vede vuoto e deve contare. Il conto è quindi severo con
     chi dichiara: dichiarare interfaccia rimpicciolisce il denominatore e
     fa salire la percentuale, non scendere. */
  let celleVuote = 0, pesoUI = 0;
  const celle = par.celleX * par.celleY;
  const mappaCelle = [];
  const vuota1 = new Uint8Array(celle);
  /* il TERZO CENTRALE, con gli stessi confini dell'attrezzo della misura 6
     (celle 8-15 per 4-7 sulla griglia 24x12): un solo posto dove è
     definito, così le due misure non possono divergere */
  const fxT = par.centroFrazione;
  const T = {
    ci0: Math.round(par.celleX * (1 - fxT) / 2), cj0: Math.round(par.celleY * (1 - fxT) / 2),
  };
  T.ci1 = par.celleX - T.ci0; T.cj1 = par.celleY - T.cj0;
  T.x0 = Math.floor(T.ci0 * W / par.celleX); T.x1 = Math.floor(T.ci1 * W / par.celleX);
  T.y0 = Math.floor(T.cj0 * H / par.celleY); T.y1 = Math.floor(T.cj1 * H / par.celleY);
  let cenVuote = 0, cenCelle = 0, cenUI = 0;
  for (let cy = 0; cy < par.celleY; cy++) {
    let riga = '';
    for (let cxi = 0; cxi < par.celleX; cxi++) {
      const x0 = Math.floor(cxi * W / par.celleX), x1 = Math.floor((cxi + 1) * W / par.celleX);
      const y0 = Math.floor(cy * H / par.celleY), y1 = Math.floor((cy + 1) * H / par.celleY);
      let n = 0, ne = 0, s = 0, s2 = 0, nu = 0;
      for (let y = y0; y < y1; y += 2) {
        for (let x = x0; x < x1; x += 2) {
          const i = y * W + x, L = Lm[i];
          n++; s += L; s2 += L * L; if (erba[i]) ne++; if (sottoUI[i]) nu++;
        }
      }
      const m = s / n, dev = Math.sqrt(Math.max(0, s2 / n - m * m));
      const vuota = (ne / n >= par.cellaErbaMin) && dev <= par.cellaVarMax;
      const qUI = n ? nu / n : 0;
      if (vuota) celleVuote++;
      pesoUI += qUI;
      vuota1[cy * par.celleX + cxi] = vuota ? 1 : 0;
      if (cxi >= T.ci0 && cxi < T.ci1 && cy >= T.cj0 && cy < T.cj1) {
        cenCelle++; cenUI += qUI; if (vuota) cenVuote++;
      }
      riga += vuota ? '.' : '#';
    }
    mappaCelle.push(riga);
  }
  const celleGioc = Math.max(1e-6, celle - pesoUI);
  const cenGioc = Math.max(1e-6, cenCelle - cenUI);

  /* ================================================ 2. LA PALLA TROVABILE
     Posizione presa dallo stato (mai indovinata dai pixel: se la palla è
     invisibile la misura deve dirlo, non perderla). Luminanza mediana del
     nucleo contro la mediana del quadro; diametro misurato sui pixel con
     sedici raggi, così una palla disegnata più piccola di quanto lo stato
     dichiara non passa lo stesso. */
  const b = G.ball;
  const k = 1 + (b.z || 0) * 0.012;
  const bx = sx(b.x), by = sy(b.y - (b.z || 0) * 0.55);
  /* IL RAGGIO ATTESO SI LEGGE, NON SI DEDUCE — 18 agosto, e questa riga
     da sola spiega un allarme che ha ingannato un giudice. Lo strumento
     deduceva l'atteso da B_R (il raggio degli URTI, 8 unità) mentre il
     gioco il pallone lo DISEGNA più grande — B_R x B_DIS = 10,72, con in
     più un pavimento sul quadro — e lo dichiara in __test.pallaRaggio().
     Risultato: la riga «48,0 px misurati contro 35,1 attesi» non
     denunciava una palla gonfiata dalla misura, denunciava un atteso
     sbagliato del 34%. Il gioco lo aveva scritto in chiaro nel proprio
     verbale («questo hook è la via perché un giorno smetta di dedurre e
     legga»): oggi legge. Se l'hook non c'è si torna a dedurre, e lo si
     dichiara fra gli hook mancanti invece di stampare un numero muto.
     L'atteso NON entra nel cancello — il cancello misura i pixel — ma
     entra nella finestra di ricerca e nel buco tollerato, e un atteso
     troppo piccolo li stringe entrambi: era per questo che il varco
     dell'anello (2,6 unità) sembrava più largo del buco perdonato (3,2
     dedotte da B_R, che con il raggio vero diventano 4,3). */
  let rDich = null;
  try { if (t.pallaRaggio) rDich = +t.pallaRaggio(); } catch (e) { rDich = null; }
  if (!(rDich > 0)) { mancanti.push('__test.pallaRaggio'); rDich = B_R_ * k; }
  const rAtteso = Math.max(2, rDich * S2 * dpr);
  const dentro = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  /* IL PALLONE E' L'UNICO OGGETTO NEUTRO DEL QUADRO: bianco sporco con
     pentagoni scuri, velo d'ombra e riflesso — croma quasi nulla. Il
     manto, le divise (fluo 0,85 di croma, rosa 0,31), la pelle e i segni
     a terra sono tutti molto più carichi. E' questa la sola cosa che
     separa il pallone dal piede su cui poggia: la maschera dei corpi qui
     NON serve e sarebbe sbagliata, perché drawBall dipinge il pallone
     DOPO tutte le figure — non è mai coperto da nessuno. */
  /* il NUCLEO chiaro del pallone: il novantesimo percentile di luminanza
     là dove lo stato dice che sta. Serve da riferimento per il bordo: si
     misura il DISCO CHIARO, e i pentagoni scuri dentro li scavalca il
     buco tollerato. Senza il pavimento di luminanza il raggio scappava
     nelle SCARPE del portatore — neutre e scure quanto basta — e la
     palla usciva larga 46 px invece di 32. */
  let Lnucleo = 0;
  {
    const v = [];
    const R0 = Math.ceil(rAtteso);
    const bx0 = Math.round((G.ball.x * S2 + Ax) * dpr);
    const by0 = Math.round(((G.ball.y - (G.ball.z || 0) * 0.55) * S2 + Ay) * dpr);
    for (let dy = -R0; dy <= R0; dy++) for (let dx = -R0; dx <= R0; dx++) {
      if (dx * dx + dy * dy > R0 * R0) continue;
      const x = bx0 + dx, y = by0 + dy;
      if (x < 0 || y < 0 || x >= W || y >= H) continue;
      const i = y * W + x;
      if (!erba[i]) v.push(Lm[i]);
    }
    v.sort((a, b) => a - b);
    Lnucleo = v.length ? v[Math.floor(v.length * 0.9)] : 255;
  }
  const pallosa = i => !erba[i] && Sat[i] < par.pallaSatMax && Lm[i] >= 0.5 * Lnucleo;
  /* UN BUCO DENTRO LA PALLA E' SCURO MA RESTA NEUTRO E NON E' MANTO: i
     pentagoni, il contorno nero, il velo d'ombra. Fuori dalla palla, in
     ogni direzione, c'è manto (o la pozza dorata del portatore, o una
     divisa): tutta roba che di questo non è. E' la sola porta da cui il
     raggio può proseguire dopo aver perso il bianco — e non si apre né
     sull'erba né sul colore, che sono le due strade per l'anello. */
  const bucoDentroPalla = i => !erba[i] && Sat[i] < par.pallaSatMax;
  const raccogli = (cx0, cy0, r0, r1, soloPalla) => {
    const v = [];
    const R = Math.ceil(r1);
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
      const d2 = dx * dx + dy * dy;
      if (d2 < r0 * r0 || d2 > r1 * r1) continue;
      const x = Math.round(cx0 + dx), y = Math.round(cy0 + dy);
      if (!dentro(x, y)) continue;
      const i = y * W + x;
      if (soloPalla && !pallosa(i)) continue;
      v.push(Lm[i]);
    }
    v.sort((p, q) => p - q);
    return v;
  };
  const med = v => v.length ? v[v.length >> 1] : 0;
  const attorno = raccogli(bx, by, rAtteso * 2.4, rAtteso * 3.2);
  const Lintorno = med(attorno) || Lprato;
  /* DIAMETRO. Si esce dal centro in sedici direzioni finché il pixel è
     ancora pallone: non manto, poco carico di croma e abbastanza chiaro.
     I pentagoni scuri dentro la sfera li scavalca il buco tollerato (un
     raggio che si fermasse al primo pixel non bianco misurerebbe il
     pentagono, non la palla); il contorno nero, che della palla fa parte,
     lo aggiunge la coda qui sotto. */
  /* La marcia si fa DUE VOLTE con la stessa geometria: una col buco che si
     perdona solo dove un buco può stare (severa: è la misura), una col
     buco che si perdona dovunque (permissiva: è il conto vecchio, quello
     che poteva saltare nell'anello di possesso). Le due si stampano
     accanto; se divergono, lo strumento lo dice invece di lasciarlo
     scoprire a un giudice fra un mese. */
  const marciaPalla = (ux, uy, severa) => {
    let r = 0, fermato = 'lontananza';
    for (let d = 0.5; d <= rAtteso * par.pallaCerca; d += 0.5) {
      const x = Math.round(bx + ux * d), y = Math.round(by + uy * d);
      if (!dentro(x, y)) { fermato = 'bordo'; break; }
      const i = y * W + x;
      /* senza il filtro sulla croma, con la palla al piede il raggio
         entrava nella maglia del portatore e la palla risultava larga il
         triplo e scura: 70 px misurati invece di 39 */
      if (pallosa(i)) { r = d; continue; }
      /* la regola severa vale DA QUANDO IL RAGGIO E' STATO SULLA PALLA, e
         non prima: un buco dentro la palla esiste solo se dentro la palla
         ci sei entrato. Finché r vale zero si sta ancora cercando il
         pallone attorno al punto che lo stato dichiara — lo stato dà un
         centro, non un pixel — e lì la tolleranza serve, come è sempre
         servita. Senza questa distinzione la misura moriva sul primo filo
         d'erba e dichiarava «palla assente» a una palla che c'era,
         scambiando un errore di centratura per un difetto del gioco. */
      if (severa && r > 0 && !bucoDentroPalla(i)) { fermato = erba[i] ? 'manto' : 'colore'; break; }
      if (d - r > rAtteso * par.pallaBuco) { fermato = 'buco'; break; }
    }
    /* IL CONTORNO SCURO FA PARTE DEL PALLONE. Il disco chiaro finisce a
       15 px dal centro, ma l'occhio vede la palla fin dove arriva il suo
       profilo nero, due o tre pixel più in là: fermarsi al bianco
       misurava una palla del 25% più piccola di quella disegnata (30 px
       contro i 40 che lo stato dichiara). Si prosegue di poco — non
       abbastanza per arrivare a una scarpa — e si ferma al primo pixel di
       manto, che è dove il pallone finisce davvero. */
    if (r > 0) {
      for (let d = r + 0.5; d <= r + rAtteso * 0.35; d += 0.5) {
        const x = Math.round(bx + ux * d), y = Math.round(by + uy * d);
        if (!dentro(x, y)) break;
        const i2 = y * W + x;
        if (erba[i2] || corpo[i2]) break;   // manto o corpo: il pallone finisce qui
        r = d;
      }
    }
    return { r, fermato };
  };
  const raggi = [], raggiLarghi = [], fermate = {};
  let raggiScappati = 0;
  for (let a = 0; a < 16; a++) {
    const th = a * Math.PI / 8, ux = Math.cos(th), uy = Math.sin(th);
    const sev = marciaPalla(ux, uy, true);
    const lar = marciaPalla(ux, uy, false);
    raggi.push(sev.r); raggiLarghi.push(lar.r);
    fermate[sev.fermato] = (fermate[sev.fermato] || 0) + 1;
    if (lar.r > sev.r + 1) raggiScappati++;
  }
  raggi.sort((p, q) => p - q);
  raggiLarghi.sort((p, q) => p - q);
  /* IL DODICESIMO DEI SEDICI, non la mediana. Quando il pallone sta al
     piede del portatore, quattro o cinque raggi su sedici finiscono
     subito dentro il corpo e la mediana li segue: la palla usciva larga
     30 px invece di 40 in due istanti su otto, e la misura raccontava
     una palla che si rimpicciolisce quando qualcuno la conduce. I raggi
     liberi sono la maggioranza, e sono loro a dire quanto è grande. */
  const rMis = raggi[11], rLargo = raggiLarghi[11];
  /* la luminanza della palla si legge DENTRO il diametro misurato, non
     dentro quello dichiarato dallo stato: se la palla è disegnata più
     piccola, la misura guarda comunque la palla */
  const Lpalla = med(raccogli(bx, by, 0, Math.max(2, rMis * 0.75), true));

  /* ============================================ 3. L'ALTEZZA DELLA FIGURA
     Il giocatore attivo: chi ha la palla, se no il più vicino a lei.
     L'altezza è il riquadro del nero della silhouette, cioè quanto la
     figura occupa davvero sullo schermo. */
  let attivo = null;
  if (figure.length) {
    attivo = figure.find(f => f.palla) || null;
    if (!attivo) {
      let dm = 1e18;
      for (const f of figure) {
        const d = (f.piedeX - bx) * (f.piedeX - bx) + (f.piedeY - by) * (f.piedeY - by);
        if (d < dm) { dm = d; attivo = f; }
      }
    }
  }

  /* ================================================== 4. LE OMBRE
     La misura chiave del tema 1, e la più difficile da fare onesta.

     Un pixel è OMBRA se è prato IMBRUNITO: tinta ancora nella famiglia
     del verde e luminanza fra un quarto e settantadue centesimi del prato
     illuminato lì attorno. Sotto un corpo non si giudica — lì l'ombra non
     si vede — e fuori dal quadro nemmeno.

     Per ogni figura si cerca l'ombra ATTACCATA ai suoi piedi: si marcia
     dai piedi verso ogni direzione con una finestra perpendicolare e
     vince la direzione in cui l'ombra arriva più lontano; poi si affina
     al grado sull'altopiano del massimo e, per l'ultimo grado, col
     baricentro del buio dentro quel corridoio. Direzione e lunghezza
     escono insieme, e sono le due cose che la giuria ha chiesto per
     nome: «tutte parallele entro ±5 gradi, lunghe almeno 1,5 volte la
     figura». Chi sta sul bordo, chi è appiccicato a un altro e chi ha i
     piedi fuori dal manto non si giudica: sono i tre casi in cui il
     numero direbbe qualcosa che non è della luce. */
  /* IL PRATO ILLUMINATO, ZONA PER ZONA. Il confronto non si fa con la
     mediana di tutto il quadro: il manto ha le strisce di rasatura (una
     chiara e una scura, oggi al 15% di distanza) e una velatura che
     scurisce i bordi, e con una soglia sola le strisce scure diventavano
     "ombra" — la marcia le seguiva per tutta la loro lunghezza e misurava
     ombre lunghe come la figura su un gioco che non ne ha nessuna
     (misurato: 0,19x diventava 1,05x, a un passo dal cancello).
     Il riferimento è il TERZO QUARTILE del prato in un blocco di tre
     celle per tre — grande due figure, dove un'ombra non può arrivare a
     essere la maggioranza — cioè "quanto è chiara qui l'erba al sole". */
  const gX = par.celleX, gY = par.celleY;
  const isto = new Uint32Array(gX * gY * 64);
  for (let y = 0; y < H; y += 2) {
    const cy = Math.min(gY - 1, (y * gY / H) | 0);
    for (let x = 0; x < W; x += 2) {
      const i = y * W + x;
      if (!erba[i]) continue;
      const ci = Math.min(gX - 1, (x * gX / W) | 0);
      isto[(cy * gX + ci) * 64 + Math.min(63, Lm[i] / 4 | 0)]++;
    }
  }
  const Lloc = new Float32Array(gX * gY);
  for (let cy = 0; cy < gY; cy++) for (let ci = 0; ci < gX; ci++) {
    const acc = new Uint32Array(64); let tot = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const yy = cy + dy, xx = ci + dx;
      if (yy < 0 || xx < 0 || yy >= gY || xx >= gX) continue;
      const b0 = (yy * gX + xx) * 64;
      for (let k = 0; k < 64; k++) { acc[k] += isto[b0 + k]; tot += isto[b0 + k]; }
    }
    let v = Lprato;
    if (tot >= 200) {
      let a2 = 0;
      for (let k = 0; k < 64; k++) { a2 += acc[k]; if (a2 >= tot * 0.75) { v = k * 4 + 2; break; } }
    }
    Lloc[cy * gX + ci] = v;
  }
  const buio = i => {
    /* sottoUI: là c'è l'interfaccia dichiarata dal gioco, e sotto
       l'interfaccia non c'è ombra — vedi il blocco in testa alla misura */
    if (corpo[i] || !erba[i] || sottoUI[i]) return 0;
    const x = i % W, y = (i / W) | 0;
    const liv = Lloc[Math.min(gY - 1, (y * gY / H) | 0) * gX + Math.min(gX - 1, (x * gX / W) | 0)];
    const hi2 = par.ombraSu * liv, lo2 = par.ombraGiu * liv;
    const L = Lm[i];
    return (L >= lo2 && L <= hi2) ? (hi2 - L) : 0;
  };
  /* LA LUCE DICHIARATA DAL GIOCO. Da agosto il gioco espone la geometria
     della propria ombra (__test.ombraCapsula), l'ora della partita e i
     fari accesi: sono la seconda campana. Lo strumento misura per conto
     suo e poi confronta — non li usa per misurare, li usa per smentire. */
  let dichiarata = null;
  try {
    if (t.ombraCapsula) {
      const c = t.ombraCapsula();
      dichiarata = {
        dir: Math.atan2(c.uy, c.ux) * 180 / Math.PI,
        lungPx: c.lungRiposo * S2 * dpr,
        lungMaxPx: c.l1 * S2 * dpr,
        semiPx: c.semiCorto * S2 * dpr,
        ora: t.ora !== undefined ? +t.ora.toFixed(3) : null,
        fari: t.fari ? t.fari.map(x => +x.toFixed(2)) : null,
      };
    } else mancanti.push('__test.ombraCapsula');
  } catch (e) { mancanti.push('__test.ombraCapsula'); }

  /* l'ancora dell'ombra, figura per figura: quella dichiarata dal gioco
     se c'è, il pixel nero più basso della sagoma se non c'è */
  let ancoraDichiarata = false;
  try {
    if (t.ombraCapsula) {
      const c = t.ombraCapsula();
      for (const f of figure) {
        f.ancoraX = sx(f.px + c.piedeX);
        f.ancoraY = sy(f.py + c.piedeY);
      }
      ancoraDichiarata = true;
    }
  } catch (e) { /* niente hook: si resta sul pixel nero più basso */ }
  for (const f of figure) {
    if (f.ancoraX == null) { f.ancoraX = f.piedeX; f.ancoraY = f.piedeY; }
  }

  const ombre = [];
  for (const f of figure) {
    const ax = Math.round(f.ancoraX), ay = Math.round(f.ancoraY), h = f.h;
    /* CHI HA I PIEDI FUORI DAL QUADRO NON SI GIUDICA — ma solo lui. Il
       margine era di un'altezza intera di figura e con la camera stretta
       (figure da 120 px su 824) buttava via quattro sagome su otto: la
       misura restava senza popolazione proprio nei fotogrammi più pieni,
       cioè i migliori. Adesso il margine copre l'ancora e il primo tratto
       d'ombra; se poi la marcia esce dal quadro, la LUNGHEZZA di quella
       figura si dichiara troncata e non entra nella media, mentre la sua
       DIREZIONE — che si legge nel tratto vicino ai piedi — resta buona. */
    if (ax < 0.55 * h || ay < 0.55 * h || ax > W - 0.55 * h || ay > H - 0.55 * h) {
      ombre.push({ idx: f.idx, pixel: 0, ombra: false, bordo: true, x: ax, y: ay });
      continue;
    }
    /* NEMMENO CHI E' IN DUELLO. Due figure a meno di mezza altezza l'una
       dall'altra hanno le ombre incollate: qualunque cosa si misuri lì è
       la macchia delle due insieme, e la sua inclinazione la decide la
       posizione reciproca, non la luce. Misurato sul banco: una coppia a
       76 px dava 128° e 159° dove tutte le altre davano 145°. */
    let vicino = false;
    for (const g of figure) {
      if (g === f) continue;
      if (Math.hypot(g.ancoraX - f.ancoraX, g.ancoraY - f.ancoraY) < 0.7 * h) { vicino = true; break; }
    }
    if (vicino) { ombre.push({ idx: f.idx, pixel: 0, ombra: false, duello: true, x: ax, y: ay }); continue; }
    /* E NEMMENO CHI HA L'OMBRA FUORI DAL MANTO. Un'ombra si legge come
       manto imbrunito: se attorno ai piedi c'è la fascia dei cartelloni,
       la folla o un pulsante dei comandi, lì non c'è niente da imbrunire
       e la misura direbbe "nessuna ombra" a una figura che ce l'ha. */
    {
      let tot = 0, pra = 0;
      const RR = Math.round(1.5 * h);
      for (let dy = -RR; dy <= RR; dy += 3) for (let dx = -RR; dx <= RR; dx += 3) {
        if (dx * dx + dy * dy > RR * RR) continue;
        const x = ax + dx, y = ay + dy;
        if (!dentro(x, y)) continue;
        const i = y * W + x;
        tot++; if (erba[i] || corpo[i]) pra++;
      }
      if (!tot || pra / tot < 0.72) {
        ombre.push({ idx: f.idx, pixel: 0, ombra: false, fuoriManto: true, x: ax, y: ay });
        continue;
      }
    }
    /* DIREZIONE, in due tempi.
       (a) si CERCA il raggio: per ogni angolo si somma il buio lungo una
           striscia che parte dai piedi, e vince l'angolo più scuro. Un
           baricentro secco sul disco intero non basta — misurato: con
           ombre lunghe dipinte tutte a 145 gradi dava 138°±65, perché
           l'ombra del compagno vicino entrava nel disco e tirava il
           baricentro dove voleva lei.
       (b) si AFFINA: baricentro pesato sul buio dentro un cono stretto
           attorno al raggio vinto, saltando la zona sotto i piedi (dove
           sta la macchia di contatto, uguale in tutte le direzioni) e i
           pixel che appartengono più al vicino che a noi. */
    /* più vicino a un altro paio di piedi che ai nostri: non è nostra.
       Senza questa regola l'ombra del compagno vicino entra nel conto e
       la direzione la decide lei. */
    /* NON è una spartizione secca: due figure in duello stanno a mezza
       figura l'una dall'altra e le loro ombre, se sono parallele, si
       accavallano — una spartizione secca ne assegnerebbe una a chi non
       le appartiene e l'altra resterebbe senza. Si reclama tutto ciò che
       non sia MOLTO più vicino a un altro paio di piedi (il doppio):
       l'ombra del vicino sotto i suoi piedi resta sua, la parte lunga che
       passa sopra di noi la contiamo tutt'e due — e siccome quando sono
       parallele contarle insieme non sposta la direzione, va bene così. */
    const mio = (x, y) => {
      const d0 = (x - f.ancoraX) * (x - f.ancoraX) + (y - f.ancoraY) * (y - f.ancoraY);
      for (const g of figure) {
        if (g === f) continue;
        const d1 = (x - g.ancoraX) * (x - g.ancoraX) + (y - g.ancoraY) * (y - g.ancoraY);
        if (d0 > 4 * d1) return false;      // 4 = (il doppio)²
      }
      return true;
    };
    /* LA MARCIA. Da sotto i piedi, in una direzione, finché la finestra
       perpendicolare smette di essere scura. Restituisce fin dove arriva
       l'ombra ATTACCATA alla figura: è questa la differenza fra un'ombra
       propria e quella del vicino che passa di lì, che nella striscia
       compare per la sua larghezza e poi finisce. */
    const win = Math.max(3, par.ombraFinestra * h);
    const buchiMax = Math.max(4, Math.round(par.ombraBuco * h / 2));
    let bordoTocco = false, primoBuio = -1;
    const marcia = (ux, uy, segna) => {
      const px = -uy, py = ux;
      let lung = 0, buchi = 0;
      if (segna) primoBuio = -1;
      for (let d = 2; d <= par.ombraCorsaMax * h; d += 2) {
        let tot = 0, om = 0;
        for (let q = -4; q <= 4; q++) {
          const tt = q * win / 4;
          const x = Math.round(ax + ux * d + px * tt), y = Math.round(ay + uy * d + py * tt);
          /* FUORI DAL QUADRO NON C'E' OMBRA, e non è "non si sa": un
             corridoio che esce dall'inquadratura deve morire lì. Contato
             come ignoto, la marcia usciva dal fotogramma e tornava a
             pescare il buio della barra dell'HUD dall'altra parte,
             regalando due altezze di ombra a una figura che non ce
             l'aveva (misurato: 2,31x nella direzione sbagliata). */
          if (!dentro(x, y)) { tot++; if (segna) bordoTocco = true; continue; }
          const i = y * W + x;
          if (corpo[i]) continue;           // coperto da un corpo: si sospende il giudizio
          tot++;
          if (buio(i) && mio(x, y)) om++;
        }
        if (tot < 3) continue;
        if (om / tot >= par.ombraFrazione) { lung = d; buchi = 0; if (segna && primoBuio < 0) primoBuio = d; }
        else if (++buchi >= buchiMax) break;
      }
      return lung;
    };
    /* (a) IL RAGGIO SI CERCA CON LA MARCIA STESSA, non con la somma del
       buio: vince la direzione in cui l'ombra attaccata arriva PIU'
       LONTANO. Con la somma, un compagno controsole a mezza figura di
       distanza portava via la direzione — la sua ombra passa sopra di noi
       ed è tanto buio quanto la nostra. Con la marcia no: quella del
       vicino attraversa la striscia e finisce, la nostra continua. */
    let miglior = -1, mAng = 0, lunghi = 0; const profilo = [];
    for (let g = 0; g < 36; g++) {
      const th = g * Math.PI / 18;
      const s = marcia(Math.cos(th), Math.sin(th));
      profilo.push(Math.round(s));
      if (s >= 0.8 * h) lunghi++;
      if (s > miglior) { miglior = s; mAng = th; }
    }
    /* DUE OMBRE, UNA FIGURA: NON SI GIUDICA. Se oltre al corridoio
       vincente ce n'è un altro quasi altrettanto lungo in una direzione
       lontana più di sessanta gradi, la figura ha addosso anche l'ombra
       di qualcun altro — tipicamente quella del compagno controsole, che
       le passa sopra — e non c'è modo di dire quale delle due è sua.
       Misurato: una figura dava -175 gradi (154 px) contro i 23 gradi
       della sua (128 px), e da sola portava la deviazione da 0,3 a 56,6.
       Dichiararlo è l'unica cosa onesta: assegnarle la direzione più
       vicina a quella delle altre sarebbe fabbricare il risultato. */
    {
      let secondo = 0;
      for (let g = 0; g < 36; g++) {
        let d = Math.abs(g * 10 - mAng * 180 / Math.PI); if (d > 180) d = 360 - d;
        if (d >= 60 && profilo[g] > secondo) secondo = profilo[g];
      }
      if (miglior > 0 && secondo >= par.ombraDominanza * miglior) {
        ombre.push({ idx: f.idx, pixel: 0, ombra: false, ambigua: true, x: ax, y: ay });
        continue;
      }
    }
    /* CHI STA GIA' NEL BUIO NON SI GIUDICA. Da quando esistono le ombre
       lunghe delle strutture, una figura può trovarsi dentro la macchia
       scura di una porta o della recinzione: lì il manto è imbrunito in
       OGNI direzione e la marcia trova un corridoio lungo dovunque, così
       la direzione la decide il rumore (misurato: una figura a -76 gradi
       dove tutte le altre stavano a 22). Se più di due quinti delle
       trentasei direzioni danno un'ombra lunga, non è la sua: si scarta. */
    if (lunghi > 36 * 0.40) {
      ombre.push({ idx: f.idx, pixel: 0, ombra: false, buioAttorno: true, x: ax, y: ay });
      continue;
    }
    /* (b) SI AFFINA al grado, sempre con la marcia. Il massimo non è un
       punto ma un altopiano largo qualche grado (l'ombra ha una sua
       larghezza): la direzione è la media circolare degli angoli che
       arrivano almeno al 95% del massimo, pesata sulla lunghezza. Un
       baricentro del buio, provato prima, sbandava di venti gradi quando
       metà ombra finiva sotto un altro corpo. */
    let mx = 0; const prove = [];
    for (let g = -12; g <= 12; g++) {
      const th = mAng + g * Math.PI / 180;
      const s = marcia(Math.cos(th), Math.sin(th));
      prove.push({ th, s });
      if (s > mx) mx = s;
    }
    let sc = 0, ss = 0, sp = 0;
    for (const q of prove) {
      if (q.s < 0.95 * mx || !q.s) continue;
      sc += Math.cos(q.th) * q.s; ss += Math.sin(q.th) * q.s; sp += q.s;
    }
    const pAng = sp ? Math.atan2(ss, sc) : mAng;
    const lung = mx;      // il massimo dell'altopiano: serve alla densità
    /* (c) L'ASSE DELL'OMBRA. L'altopiano della marcia dà la direzione a
       un paio di gradi; l'ultimo grado lo dà il baricentro del buio
       DENTRO il corridoio appena trovato (cono stretto, e non oltre la
       punta): l'ombra è simmetrica attorno al proprio asse, quindi il suo
       baricentro ci sta sopra. Qui si conta anche quanta ombra c'è: sotto
       una manciata di pixel non si misura niente, e dirlo è meglio che
       dare un numero. */
    const R = Math.round(Math.max(0.8 * h, Math.min(lung, 3 * h)));
    const cux = Math.cos(pAng), cuy = Math.sin(pAng);
    let n = 0, sw = 0, vx = 0, vy = 0;
    for (let dy = -R; dy <= R; dy++) {
      const y = ay + dy; if (y < 0 || y >= H) continue;
      for (let dx = -R; dx <= R; dx++) {
        const x = ax + dx; if (x < 0 || x >= W) continue;
        const rr = Math.sqrt(dx * dx + dy * dy);
        if (rr > R || rr < 0.3 * h) continue;
        if ((dx * cux + dy * cuy) / rr < 0.978) continue;    // cono di ±12 gradi
        const i = y * W + x;
        const w = buio(i);
        if (!w || !mio(x, y)) continue;
        n++; sw += w; vx += w * dx; vy += w * dy;
      }
    }
    const dir = sw > 0 ? Math.atan2(vy, vx) : pAng;
    let larghezza = 0;
    bordoTocco = false;
    const lungFin = marcia(Math.cos(dir), Math.sin(dir), true);
    /* UN'OMBRA E' PIU' LUNGA CHE LARGA. A metà del corridoio si misura
       quanto è larga la macchia scura, di traverso, fino a un'altezza e
       mezza di figura per lato. La capsula del gioco è larga quaranta
       pixel su duecentocinquanta di lunghezza; una POZZA di buio — la
       proiezione della recinzione, l'ombra della porta, la penombra oltre
       la linea — è larga quanto il campo, e prima di questa regola una
       figura che ci stava dentro dichiarava un'ombra a -88 gradi lunga
       2,35 volte la figura, con ottomila pixel di buio attorno. Sopra
       sei decimi della lunghezza non è più un'ombra portata: è una zona
       in ombra, e non dice niente sulla direzione della luce. */
    if (lungFin > 0) {
      const ux2 = Math.cos(dir), uy2 = Math.sin(dir), px2 = -uy2, py2 = ux2;
      const mx2 = ax + ux2 * lungFin * 0.5, my2 = ay + uy2 * lungFin * 0.5;
      let larg = 0;
      for (const verso of [1, -1]) {
        let vuoti = 0;
        for (let q = 1; q <= 1.5 * h; q += 2) {
          const x = Math.round(mx2 + px2 * q * verso), y = Math.round(my2 + py2 * q * verso);
          if (!dentro(x, y)) break;
          const i2 = y * W + x;
          if (corpo[i2]) continue;
          if (buio(i2)) { larg = Math.max(larg, q); vuoti = 0; }
          else if (++vuoti > 4) break;
        }
      }
      larghezza = larg * 2;
      if (larghezza > 0.6 * lungFin) {
        ombre.push({ idx: f.idx, pixel: n, ombra: false, pozza: true, x: ax, y: ay });
        continue;
      }
    }
    /* UN'OMBRA E' ATTACCATA AI PIEDI CHE LA GETTANO. Se il corridoio
       comincia a essere scuro solo dopo mezza figura, quella macchia non
       nasce da qui: è l'ombra del compagno controsole che passa di là, e
       misurarla vorrebbe dire attribuire a una figura la luce di un'altra.
       Misurato: è l'ultimo caso che portava una direzione a 79 gradi dalle
       altre in un fotogramma dove il gioco le disegna tutte a 20. */
    if (primoBuio < 0 || primoBuio > 0.5 * h) {
      ombre.push({ idx: f.idx, pixel: n, ombra: false, staccata: true, x: ax, y: ay });
      continue;
    }
    /* la stessa marcia lungo la direzione DICHIARATA dal gioco: se qui
       l'ombra arriva piu' lontano che nella direzione trovata, non e' il
       gioco a sbagliare, e' la ricerca */
    const lungDich = dichiarata
      ? marcia(Math.cos(dichiarata.dir * Math.PI / 180), Math.sin(dichiarata.dir * Math.PI / 180)) : -1;
    if (n < par.ombraPixelMin) { ombre.push({ idx: f.idx, pixel: n, ombra: false }); continue; }
    if (lung > 0 && n < par.ombraDensita * lung) {
      ombre.push({ idx: f.idx, pixel: n, ombra: false, sottile: true, x: ax, y: ay });
      continue;
    }
    ombre.push({
      idx: f.idx, pixel: n, ombra: true, x: ax, y: ay, profilo, lungDich,
      dir: dir * 180 / Math.PI,
      lung: lungFin, h, rapporto: lungFin / h, troncata: bordoTocco, larghezza,
    });
  }

  /* ========================================= 5. LA TEMPERATURA DEL PRATO
     La tinta mediana del prato in due zone opposte. Le coppie sono due
     (sinistra/destra e alto/basso) perché lo strumento non sa da che
     parte il gioco metterà il sole: vince la differenza maggiore.

     SI CAMPIONA SOLO DENTRO LE CELLE DI ERBA VUOTA, ed è la differenza
     fra una misura e un numero qualsiasi. Prendendo tutti i pixel in
     famiglia verde del terzo di quadro usciva uno scarto di 13-14 gradi
     su un campo che ha DUE soli verdi a 2,6 gradi l'uno dall'altro: la
     differenza non era il sole, erano la rete, i cartelloni, la folla e
     le toppe di terra che stanno più da una parte che dall'altra. Dentro
     una cella di erba vuota c'è solo manto, e un gradiente termico vero
     lo sposta tutto insieme. */
  const tintaZona = (ci0, ci1, cj0, cj1) => {
    const ist = new Uint32Array(360);
    let tot = 0;
    for (let cj = cj0; cj < cj1; cj++) for (let ci = ci0; ci < ci1; ci++) {
      if (!vuota1[cj * par.celleX + ci]) continue;
      const x0 = Math.floor(ci * W / par.celleX), x1 = Math.floor((ci + 1) * W / par.celleX);
      const y0 = Math.floor(cj * H / par.celleY), y1 = Math.floor((cj + 1) * H / par.celleY);
      for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) {
        const i = y * W + x;
        if (!erba[i]) continue;
        ist[Math.min(359, Math.max(0, Math.round(Hue[i])))]++; tot++;
      }
    }
    if (tot < 500) return null;
    let acc = 0;
    for (let k2 = 0; k2 < 360; k2++) { acc += ist[k2]; if (acc >= tot / 2) return k2; }
    return null;
  };
  const zf = par.zonaFrazione;
  const nzx = Math.max(1, Math.round(par.celleX * zf)), nzy = Math.max(1, Math.round(par.celleY * zf));
  const hSin = tintaZona(0, nzx, 0, par.celleY);
  const hDes = tintaZona(par.celleX - nzx, par.celleX, 0, par.celleY);
  const hAlt = tintaZona(0, par.celleX, 0, nzy);
  const hBas = tintaZona(0, par.celleX, par.celleY - nzy, par.celleY);
  const dLR = (hSin != null && hDes != null) ? Math.abs(hSin - hDes) : null;
  const dAB = (hAlt != null && hBas != null) ? Math.abs(hAlt - hBas) : null;

  /* ============================== GLI STRATI DEL DOM SOPRA LA TELA
     LA LEZIONE PIU' CARA DI QUESTO FILE. Le misure leggono la TELA con
     getImageData; la fotografia la scatta Playwright sulla PAGINA. Sono
     due cose diverse, e per un giro intero non lo sono state per me: lo
     splash che sfuma (mezzo secondo di transizione CSS) e le bande
     diagonali della transizione fra schermate (#wipe) coprivano il
     fotogramma salvato mentre la tela sotto era perfetta. I numeri erano
     giusti e le prove no — cioè lo strumento produceva prove false pur
     misurando bene, che è il modo peggiore di sbagliare perché nessuno
     lo controlla. Adesso lo strumento GUARDA CHI HA DAVANTI: enumera gli
     strati grandi, visibili e non trasparenti sopra la tela, e se ce
     n'è uno lo dice e fallisce. Costa una passata sul DOM. */
  const strati = [];
  for (const el of document.body.querySelectorAll('*')) {
    if (el === cv) continue;
    const st = getComputedStyle(el);
    if (st.position !== 'fixed' && st.position !== 'absolute') continue;
    if (st.display === 'none' || st.visibility === 'hidden') continue;
    const op = +st.opacity;
    if (!(op > 0.02)) continue;
    const r = el.getBoundingClientRect();
    const quota = (r.width * r.height) / (innerWidth * innerHeight);
    if (quota < 0.20) continue;
    strati.push({ id: el.id || el.className || el.tagName, op: +op.toFixed(2), quota: +quota.toFixed(2) });
  }

  /* ==================================== 7. IL CENTRO E' ABITATO
     Quanti SOGGETTI stanno dove cade l'occhio. La maschera è la somma di
     due cose che il colore del manto non può falsificare:
       · i CORPI, dalla silhouette — la stessa Rig3D.disegna del
         fotogramma vero ridisegnata in nero: non è una stima, è la
         figura;
       · il PALLONE, centro dallo stato e raggio MISURATO sui pixel,
         quello che il cancello 2 ha appena verificato contro il raggio
         che il gioco dichiara.
     Sotto una zona dichiarata interfaccia un soggetto NON si vede e
     quindi non conta: la dichiarazione può solo togliere soggetti, mai
     regalare celle, e il denominatore resta le 32 celle del riquadro. */
  const centroAbitato = (() => {
    const rPal = Math.max(2, rMis > 0 ? rMis : rAtteso);
    const corpoM = new Uint8Array(N), pallaM = new Uint8Array(N);
    for (let i = 0; i < N; i++) if (corpo[i] && !sottoUI[i]) corpoM[i] = 1;
    {
      const R = Math.ceil(rPal);
      for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
        if (dx * dx + dy * dy > rPal * rPal) continue;
        const x = Math.round(bx + dx), y = Math.round(by + dy);
        if (x < 0 || y < 0 || x >= W || y >= H) continue;
        const i = y * W + x;
        if (!sottoUI[i]) pallaM[i] = 1;
      }
    }
    let abitate = 0, abitateCorpo = 0, celleT = 0, nTot = 0, nCorpo = 0, nPalla = 0, nSogg = 0;
    const mappa = [];
    for (let cj = T.cj0; cj < T.cj1; cj++) {
      let riga = '';
      for (let ci = T.ci0; ci < T.ci1; ci++) {
        const x0 = Math.floor(ci * W / par.celleX), x1 = Math.floor((ci + 1) * W / par.celleX);
        const y0 = Math.floor(cj * H / par.celleY), y1 = Math.floor((cj + 1) * H / par.celleY);
        let n = 0, ns = 0, nc = 0;
        for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) {
          const i = y * W + x; n++;
          if (corpoM[i]) { ns++; nc++; nCorpo++; }
          else if (pallaM[i]) { ns++; nPalla++; }
        }
        nTot += n; nSogg += ns; celleT++;
        const q = n ? ns / n : 0, qc = n ? nc / n : 0;
        /* IL CORPO SI CONTA ANCHE DA SOLO, e non è pignoleria: è la
           riparazione che il falso dello sgombro ha imposto. Lasciando il
           PALLONE dov'era e togliendo tutte le figure, in un fotogramma
           su sei il cancello restava VERDE — perché il disco del pallone,
           se cade sull'incrocio di quattro celle, ne riempie il 10% di
           ciascuna e da solo ne abita quattro. Un pallone su un prato
           deserto è esattamente il vuoto che questa misura cura, quindi
           non può bastare: vedi centroCorpoMin. */
        if (qc >= par.cellaSoggMin) abitateCorpo++;
        if (q >= par.cellaSoggMin) { abitate++; riga += qc >= par.cellaSoggMin ? 'O' : 'o'; }
        else riga += q > 0 ? ':' : '.';
      }
      mappa.push(riga);
    }
    /* quante figure TOCCANO il riquadro e se il pallone c'è: due numeri
       che spiegano il conto invece di lasciarlo nudo */
    let figCen = 0;
    for (const f of figure) if (f.x1 >= T.x0 && f.x0 < T.x1 && f.y1 >= T.y0 && f.y0 < T.y1) figCen++;
    const pxCella = nTot / Math.max(1, celleT);
    return {
      abitate, abitateCorpo, celle: celleT,
      frazione: abitate / Math.max(1, celleT),
      figure: figCen,
      palla: (bx >= T.x0 && bx < T.x1 && by >= T.y0 && by < T.y1) ? 1 : 0,
      qCorpo: nCorpo / Math.max(1, nTot),
      qPalla: nPalla / Math.max(1, nTot),
      qSogg: nSogg / Math.max(1, nTot),
      cellePiene: nSogg / Math.max(1, pxCella),
      mappa,
    };
  })();

  /* lo STATO dei due falsi si rimette com'era: la tela no, perché è
     quella del falso che va fotografata */
  if (scena.attiva) {
    for (const s of scena.pos) { s.p.x = s.x; s.p.y = s.y; }
    G.ball.x = scena.palla.x; G.ball.y = scena.palla.y; G.ball.z = scena.palla.z;
    G.cam.x = scena.cam.x; G.cam.y = scena.cam.y; G.cam.z = scena.cam.z;
    G.view.Ax = scena.view.Ax; G.view.Ay = scena.view.Ay; G.view.S2 = scena.view.S2;
    try { if (scena.uc) updateCamera = scena.uc; } catch (e) { /* già dichiarato sopra */ }
  }

  return {
    mancanti, strati,
    centroAbitato,
    scenaFalso: scena.attiva
      ? { spostate: scena.spostate, dentro: scena.dentro, ferma: scena.ferma, nota: scena.nota }
      : null,
    vista: { W, H, dpr, S2: +S2.toFixed(3) },
    scena: t.state, punteggio: G.score.slice(), tempo: +G.timeLeft.toFixed(1),
    erba: {
      vuote: celleVuote, celle, giocabili: +celleGioc.toFixed(1),
      frazione: celleVuote / celleGioc,          // sull'AREA GIOCABILE: è il cancello
      frazioneQuadro: celleVuote / celle,        // sul quadro intero: per confronto
      ifaccFraz: pesoUI / celle,
      mappa: mappaCelle,
    },
    /* 7. IL CENTRO E' PIENO — le stesse celle, la stessa regola, contate
       dove cade l'occhio. Il numero c'era già e non aveva cancello. */
    centroErba: {
      vuote: cenVuote, celle: cenCelle, giocabili: +cenGioc.toFixed(1),
      frazione: cenVuote / cenGioc, ifaccFraz: cenUI / Math.max(1, cenCelle),
    },
    palla: {
      Lpalla, Lquadro, Lintorno, rapporto: Lquadro ? Lpalla / Lquadro : 0,
      diamPx: rMis * 2, diamFraz: (rMis * 2) / W, rAtteso: rAtteso * 2,
      /* il conto vecchio, quello che poteva saltare nell'anello: si porta
         fuori sempre, perché una divergenza che nessuno stampa è una
         divergenza che un giudice trova al posto tuo */
      diamLargo: rLargo * 2, raggiScappati, fermate,
      rDich: +(rDich || 0).toFixed(2),
      cx: Math.round(bx), cy: Math.round(by),
      z: +(b.z || 0).toFixed(1), fuori: !dentro(Math.round(bx), Math.round(by)),
      /* SE LA PALLA NON C'E', COS'E' CHE C'E'? Senza questa riga la
         misura diceva solo "0,00x" e sembrava rotta; invece la palla era
         finita sotto il pulsante TIRA, che la copre — un difetto vero,
         del gioco, non della misura. */
      sotto: (() => {
        const x = Math.round(bx), y = Math.round(by);
        if (!dentro(x, y)) return null;
        const i = y * W + x, j = i * 4;
        return { r: dati[j], g: dati[j + 1], b: dati[j + 2], erba: !!erba[i], corpo: !!corpo[i] };
      })(),
    },
    figura: attivo ? {
      idx: attivo.idx, altPx: attivo.h, altFraz: attivo.h / H,
      largPx: attivo.w, clip: attivo.clip, palla: attivo.palla,
    } : null,
    figure: figure.length,
    ombre,
    /* CIO' CHE IL GIOCO DICHIARA sulla propria luce, per confrontarlo con
       cio' che si vede nei pixel: se le due cose non coincidono, uno dei
       due mente e il numero da solo non basta piu' */
    luce: dichiarata,
    /* quanta tela il gioco ha dichiarato come interfaccia, e se la
       dichiarazione è stata accettata: si porta fuori sempre, perché una
       zona d'esclusione che nessuno stampa è una zona che cresce */
    ifacc,
    prato: { hSin, hDes, hAlt, hBas, dLR, dAB, delta: Math.max(dLR || 0, dAB || 0) },
    /* 6. IL CENTRO E' SERA. La maschera si fissa UNA volta per istante, sul
       fotogramma vero (controllo 0), e la riusano sia il riferimento di
       mezzogiorno sia i falsi dichiarati: tutti guardano la stessa zolla. */
    centro: window.__centro.misura(par, { nuova: controllo === 0 }),
    ora: (t.ora !== undefined && t.ora !== null) ? +t.ora.toFixed(3) : null,
    Lprato,
    silhouette: sil.toDataURL('image/png'),
  };
}

/* =========================================================== I CANCELLI
   Applicati qui, in un posto solo, sui numeri che la pagina ha misurato.
   Ogni cancello restituisce {ok, testo, nota}. ======================== */
function statisticaCircolare(gradi) {
  /* deviazione standard circolare: le direzioni sono angoli, e la media
     aritmetica di 179 e -179 gradi non è 0 ma 179. */
  let sc = 0, ss = 0;
  for (const g of gradi) { const r = g * Math.PI / 180; sc += Math.cos(r); ss += Math.sin(r); }
  const n = gradi.length || 1;
  const R = Math.hypot(sc / n, ss / n);
  const media = Math.atan2(ss / n, sc / n) * 180 / Math.PI;
  const dev = R > 0 ? Math.sqrt(Math.max(0, -2 * Math.log(R))) * 180 / Math.PI : 999;
  let peggio = 0;
  for (const g of gradi) {
    let d = Math.abs(g - media); if (d > 180) d = 360 - d;
    if (d > peggio) peggio = d;
  }
  return { media, dev, peggio };
}

function cancelli(m, S) {
  const out = [];
  /* 1 — L'ERBA VUOTA, SULL'AREA GIOCABILE.
     Il tetto è quello che la giuria ha chiesto (50%) applicato dove
     l'erba può stare: il quadro meno l'interfaccia che il gioco dichiara.
     Il numero sul QUADRO INTERO si stampa accanto insieme al tetto che
     gli corrisponderebbe, così chi legge sa esattamente cosa compra e le
     edizioni vecchie restano confrontabili senza conversioni. */
  const eb = m.erba;
  const tettoQuadro = S.erbaVuotaMax * (1 - eb.ifaccFraz);
  out.push({
    nome: 'erba vuota',
    ok: eb.frazione < S.erbaVuotaMax,
    testo: `erba senza soggetti ${(eb.frazione * 100).toFixed(1)}% dell'area giocabile (tetto ${(S.erbaVuotaMax * 100).toFixed(0)}%)`,
    nota: `${eb.vuote} celle vuote su ${eb.celle}, di cui ${(eb.ifaccFraz * eb.celle).toFixed(1)} sotto l'interfaccia dichiarata: giocabili ${eb.giocabili}` +
      `\n         sul QUADRO INTERO la stessa erba è il ${(eb.frazioneQuadro * 100).toFixed(1)}%, e lo stesso tetto del ${(S.erbaVuotaMax * 100).toFixed(0)}% varrebbe ${(tettoQuadro * 100).toFixed(1)}%` +
      ` — cioè il ${(S.erbaVuotaMax * 100).toFixed(0)}% sul quadro intero regalerebbe il ${(eb.ifaccFraz > 0 ? (S.erbaVuotaMax / (1 - eb.ifaccFraz) * 100).toFixed(1) : (S.erbaVuotaMax * 100).toFixed(1))}% di area giocabile`,
  });
  /* 2 */
  const p = m.palla;
  const okLum = p.rapporto >= S.pallaLumMin, okDia = p.diamFraz >= S.pallaDiamMin;
  out.push({
    nome: 'palla trovabile',
    ok: okLum && okDia && !p.fuori,
    testo: `palla ${p.rapporto.toFixed(2)}x la mediana del quadro (min ${S.pallaLumMin}), diametro ${(p.diamFraz * 100).toFixed(2)}% della larghezza (min ${(S.pallaDiamMin * 100).toFixed(1)}%)`,
    nota: p.fuori ? 'la palla è fuori dal quadro'
      : (p.diamPx > 0
        ? `luminanza palla ${p.Lpalla.toFixed(0)}, quadro ${p.Lquadro.toFixed(0)}, intorno ${p.Lintorno.toFixed(0)}; ${p.diamPx.toFixed(1)} px misurati contro ${p.rAtteso.toFixed(1)} DISEGNATI dal gioco (raggio dichiarato ${p.rDich} unità)` +
        /* la divergenza fra il conto severo e quello permissivo è la
           misura di quanto l'anello di possesso stava per essere
           venduto come palla: si stampa sempre, verde o rossa che sia */
        (p.diamLargo > p.diamPx + 1
          ? `\n         col buco perdonato dovunque (il conto di ieri) sarebbero ${p.diamLargo.toFixed(1)} px, +${((p.diamLargo / p.diamPx - 1) * 100).toFixed(0)}%: ${p.raggiScappati} raggi su 16 scappavano fuori dalla palla`
          : `\n         il conto permissivo dà gli stessi ${p.diamLargo.toFixed(1)} px: nessun raggio è uscito dalla palla`)
        : `dove lo stato mette la palla — ${p.cx},${p.cy} sulla tela, quota ${p.z} — non c'è nessuna palla: c'è rgb(${p.sotto ? p.sotto.r + ',' + p.sotto.g + ',' + p.sotto.b : '?'})` +
        (p.sotto && !p.sotto.erba && !p.sotto.corpo ? ' — la palla è finita SOTTO UN ELEMENTO DELL\'HUD, che la copre' :
          p.sotto && p.sotto.corpo ? ' — la palla è coperta da un corpo' : '')),
  });
  /* 3 */
  const f = m.figura;
  out.push({
    nome: 'altezza figura',
    ok: !!f && f.altFraz >= S.figuraAltMin,
    testo: f ? `figura attiva alta ${(f.altFraz * 100).toFixed(2)}% dello schermo, ${f.altPx} px (min ${(S.figuraAltMin * 100).toFixed(0)}%)`
      : 'nessuna figura in quadro',
    nota: f ? `giocatore ${f.idx}, posa "${f.clip}"${f.palla ? ', con la palla' : ''}` : '',
  });
  /* 4 */
  const con = m.ombre.filter(o => o.ombra);
  const dirs = con.map(o => o.dir);
  const st = con.length ? statisticaCircolare(dirs) : { dev: 999, media: 0, peggio: 999 };
  /* la media della lunghezza si fa sulle ombre INTERE: una troncata dal
     bordo del quadro dice solo "almeno tanto", e mediarla abbasserebbe il
     numero per un motivo d'inquadratura, non di luce */
  const intere = con.filter(o => !o.troncata);
  const lungMedia = intere.length ? intere.reduce((a, o) => a + o.rapporto, 0) / intere.length : 0;
  const abbastanza = con.length >= S.ombraFigureMin;
  const scartate = m.ombre.filter(o => !o.ombra);
  const perche = (k, t) => { const q = scartate.filter(o => o[k]).length; return q ? q + ' ' + t : null; };
  const motivi = [perche('bordo', 'sul bordo del quadro'), perche('duello', 'in duello'),
  perche('fuoriManto', 'con i piedi fuori dal manto'),
  perche('buioAttorno', 'già dentro un altro cono d ombra'),
  perche('sottile', 'con una traccia troppo sottile per essere un ombra'),
  perche('ambigua', 'con due ombre addosso e nessuna attribuibile'),
  perche('staccata', 'con la macchia scura staccata dai piedi'),
  perche('pozza', 'dentro una pozza di buio larga quanto lunga')].filter(Boolean).join(', ');
  /* LA SECONDA CAMPANA: quanto dista la direzione MISURATA da quella che
     il gioco DICHIARA. Se le due non coincidono, o la luce non fa quello
     che dice o la misura non vede quello che c'è: in un caso o nell'altro
     il fotogramma non è quello promesso, e il cancello resta rosso. */
  let scartoDich = null;
  if (abbastanza && m.luce) {
    let d = Math.abs(st.media - m.luce.dir); if (d > 180) d = 360 - d;
    scartoDich = d;
  }
  const dichOk = scartoDich === null || scartoDich <= S.ombraScartoDich;
  out.push({
    nome: 'ombre parallele',
    ok: abbastanza && intere.length > 0 && st.dev <= S.ombreDevMax && lungMedia >= S.ombreLungMin && dichOk,
    testo: abbastanza
      ? `ombre: deviazione delle direzioni ${st.dev.toFixed(1)}° (tetto ${S.ombreDevMax}°), lunghezza media ${intere.length ? lungMedia.toFixed(2) + 'x' : 'non misurabile (tutte troncate dal bordo)'} l'altezza della figura (min ${S.ombreLungMin}x)`
      : `ombre: solo ${con.length} figure su ${m.ombre.length} hanno un'ombra misurabile — con meno di ${S.ombraFigureMin} la misura non si dà`,
    nota: (abbastanza
      ? `direzione media ${st.media.toFixed(0)}°, scarto massimo ${st.peggio.toFixed(0)}°, su ${con.length} figure` +
      (con.length - intere.length ? ` (${con.length - intere.length} con l'ombra troncata dal bordo: contano per la direzione, non per la lunghezza)` : '')
      : (motivi ? 'scartate: ' + motivi : 'nessuna figura ha ombra attorno ai piedi')) +
      (abbastanza && motivi ? '; scartate: ' + motivi : '') +
      (m.luce ? `\n         il gioco dichiara ${m.luce.dir.toFixed(0)}° e ${(m.luce.lungPx).toFixed(0)} px di ombra a riposo` +
        (scartoDich !== null ? `: scarto misurato-dichiarato ${scartoDich.toFixed(0)}° (tetto ${S.ombraScartoDich}°)` +
          (dichOk ? '' : ' — UNO DEI DUE MENTE') : '') : ''),
  });
  /* 5 */
  const pr = m.prato;
  out.push({
    nome: 'temperatura prato',
    ok: pr.delta >= S.pratoHueMin,
    testo: `tinta del prato: ${pr.delta.toFixed(1)}° di scarto fra due zone opposte (min ${S.pratoHueMin}°)`,
    nota: `sinistra ${pr.hSin}° / destra ${pr.hDes}° = ${pr.dLR}°;  alto ${pr.hAlt}° / basso ${pr.hBas}° = ${pr.dAB}°`,
  });
  /* 6 — IL CENTRO E' SERA.
     La misura 5 guarda DUE ZONE OPPOSTE e vede la rampa ai bordi anche
     quando in mezzo è rimasto mezzogiorno; questa guarda solo dove cade
     l'occhio, e confronta il manto con lo stesso manto a ora=0. Le due
     stanno accanto apposta: la prima dice che una legge della luce
     esiste, la seconda che arriva al centro del quadro. */
  const ce = m.centro, rf = m.centroRif;
  const ora = m.ora !== null && m.ora !== undefined ? m.ora : (m.luce ? m.luce.ora : null);
  const secondoTempo = ora !== null && ora > S.centroSecondoTempo;
  const quando = ora === null ? 'ora ignota'
    : `ora ${(ora * 100).toFixed(0)}% (${secondoTempo ? 'secondo tempo' : 'primo tempo'})`;
  const minL = secondoTempo ? S.centroLumCalo : -S.centroTolleranza;
  const minS = secondoTempo ? S.centroSatCalo : -S.centroTolleranza;
  const chiede = secondoTempo
    ? `min -${(S.centroLumCalo * 100).toFixed(0)}% di luce e -${(S.centroSatCalo * 100).toFixed(0)}% di saturazione`
    : `nel primo tempo si chiede solo che la luce non torni indietro (tolleranza ${(S.centroTolleranza * 100).toFixed(0)}%)`;
  if (!ce || !ce.n || ce.n < S.centroCampioniMin) {
    out.push({
      nome: 'il centro è sera',
      ok: false,
      testo: `il centro è sera: non misurabile — il terzo centrale ha ${ce ? ce.n : 0} pixel di manto vuoto (min ${S.centroCampioniMin})`,
      nota: ce ? `${ce.celleVuote} celle vuote su ${ce.celleTot} nel terzo centrale: lì dentro c'è quasi solo azione, e su un pugno di pixel la mediana non dice niente` : '',
    });
  } else if (!rf || !rf.valido || !rf.lum || !rf.sat) {
    /* un riferimento a zero darebbe una divisione per zero, cioè un NaN
       travestito da numero: meglio dire che non si misura */
    out.push({
      nome: 'il centro è sera',
      ok: false,
      testo: 'il centro è sera: non misurabile — il riferimento di mezzogiorno non si è potuto prendere',
      nota: rf ? `portando il cronometro al fischio d'inizio il gioco dichiara ora ${(rf.oraRif * 100).toFixed(0)}% invece di 0%` +
        (rf.moto === false ? ' — è il movimento ridotto, che congela l\'ora a un valore fisso: a quel punto le due metà partita non esistono e la misura non si dà' : '')
        : 'il riferimento non è stato chiesto',
    });
  } else {
    const caloL = 1 - ce.lum / rf.lum;
    const caloS = 1 - ce.sat / rf.sat;
    const okL = caloL >= minL, okS = caloS >= minS;
    out.push({
      nome: 'il centro è sera',
      ok: okL && okS,
      testo: `centro del quadro contro lo stesso campo a mezzogiorno: luce ${(caloL * 100 >= 0 ? '-' : '+')}${Math.abs(caloL * 100).toFixed(1)}%${okL ? '' : ' NO'}, saturazione ${(caloS * 100 >= 0 ? '-' : '+')}${Math.abs(caloS * 100).toFixed(1)}%${okS ? '' : ' NO'}  (${quando}: ${chiede})`,
      nota: `manto del terzo centrale: sera L ${ce.lum.toFixed(1)} sat ${ce.sat.toFixed(3)} tinta ${ce.tinta.toFixed(0)}° rgb(${ce.rgb.join(',')})` +
        `  ·  mezzogiorno L ${rf.lum.toFixed(1)} sat ${rf.sat.toFixed(3)} tinta ${rf.tinta.toFixed(0)}° rgb(${rf.rgb.join(',')})` +
        /* le celle le conta la misura 1, sulla sua griglia: un numero solo,
           un posto solo — se qui ce ne fosse una copia, un giorno le due
           direbbero cose diverse e nessuno saprebbe a quale credere */
        `\n         ${m.centroErba.vuote} celle di erba vuota su ${m.centroErba.celle} del terzo centrale, ${ce.n} pixel, gli stessi nelle due misure`,
    });
  }
  /* 7 — IL CENTRO E' ABITATO.
     Il cancello vecchio contava CELLE DI MANTO VUOTO e si comprava con
     le chiazze di terra battuta, le righe di gesso, le ombre lunghe e
     l'ambra dei fari; non si muoveva di un decimo quando i corpi al
     centro raddoppiavano, e chiamava «manifesto» un fotogramma di prato
     deserto. Questo conta i SOGGETTI — i corpi dalla silhouette, il
     pallone dal suo disco — e il conto del tetto si stampa nella riga,
     perché un tetto che non dice da dove viene è un'opinione. */
  const ca = m.centroAbitato;
  const cg = m.centroErba;
  if (!ca || !ca.celle) {
    out.push({
      nome: 'centro abitato', ok: false,
      testo: 'il centro è abitato: non misurabile — il terzo centrale non ha celle',
      nota: '',
    });
  } else {
    out.push({
      nome: 'centro abitato',
      ok: ca.abitate >= S.centroAbitatoMin && ca.abitateCorpo >= S.centroCorpoMin,
      testo: `terzo centrale: ${ca.abitate} celle su ${ca.celle} hanno un soggetto dentro` +
        `${ca.abitate >= S.centroAbitatoMin ? '' : ' NO'}, di cui ${ca.abitateCorpo} un corpo` +
        `${ca.abitateCorpo >= S.centroCorpoMin ? '' : ' NO'}  ` +
        `(min ${S.centroAbitatoMin} e ${S.centroCorpoMin} = il duello e il pallone: una figura abita 1,42 celle, il pallone 1,83)`,
      nota: `${ca.figure} figure toccano il riquadro e il pallone ${ca.palla ? 'c\'è' : 'NON c\'è'}; ` +
        `i soggetti occupano il ${(ca.qSogg * 100).toFixed(2)}% dei pixel del terzo centrale ` +
        `(corpi ${(ca.qCorpo * 100).toFixed(2)}%, pallone ${(ca.qPalla * 100).toFixed(2)}%), ` +
        `cioè ${ca.cellePiene.toFixed(2)} celle piene su ${ca.celle}` +
        (ca.abitate >= S.centroAbitatoMin && ca.abitateCorpo >= S.centroCorpoMin
          ? ' — l\'azione sta in mezzo, che è dove deve stare'
          : ' — dove cade l\'occhio c\'è meno del duello') +
        (cg && cg.celle
          ? `\n         il conto di IERI, calcolato e senza più cancello: ${cg.vuote} celle di erba vuota su ${cg.celle}` +
            ` (${(cg.frazione * 100).toFixed(1)}%), col quadro intero al ${(m.erba.frazione * 100).toFixed(1)}%`
          : '') +
        '\n         ' + ca.mappa.join('\n         ') +
        '   (O cella con un corpo · o solo pallone · : soggetto che la sfiora · . niente)',
    });
  }
  return out;
}

/* ============================== IL RIFERIMENTO DI MEZZOGIORNO, DAL GIOCO
   Si porta il cronometro al fischio d'inizio (ora=0), si ridisegna UN
   fotogramma senza far avanzare di un millesimo la fisica, si misura il
   centro con la STESSA maschera, si mettono da parte i pixel per il banco
   di prova, e si rimette tutto com'era — cronometro, camera, micro-zoom.

   PERCHE' DAL GIOCO E NON DA UNA TINTA SCRITTA A MANO: perché una tinta
   scritta a mano invecchia il giorno dopo, e il giorno in cui qualcuno
   ridipinge il manto la misura comincia a mentire in silenzio. Qui il
   metro è il gioco stesso alla sua ora zero: se domani il prato diventa
   azzurro, il cancello continua a chiedere la stessa identica cosa —
   che al centro, di sera, ci sia MENO luce e MENO colore che al fischio
   d'inizio.

   LA CAMERA SI RIMETTE A POSTO. render() fa avanzare updateCamera di un
   passo: due disegni in più per istante lascerebbero l'inquadratura un
   pelo diversa da quella fotografata, e la corsa non sarebbe più
   confrontabile con quella di ieri. Micro-zoom (G.cam), banda, lato,
   punch e la trasformazione G.view si salvano prima e si rimettono dopo,
   così l'istante successivo parte esattamente da dove sarebbe partito. */
async function riferimentoMezzogiorno(pag, S) {
  return await pag.evaluate(par => {
    const t = window.__test, G = t.G;
    const durata = (typeof SAVE !== 'undefined' && SAVE.durata) ? SAVE.durata : 90;
    const moto = (typeof SAVE !== 'undefined') ? !!SAVE.moto : true;
    const oraScena = t.ora;
    const cam = { z: G.cam.z, x: G.cam.x, y: G.cam.y };
    const banda = G.camBanda, lato = G.camLato, punch = G.camPunch;
    const view = { Ax: G.view.Ax, Ay: G.view.Ay, S2: G.view.S2, sx: G.view.sx, sy: G.view.sy };
    const tl = G.timeLeft;
    t.setTimeLeft(durata);            // ora = 1 - timeLeft/durata = 0
    t.disegna();
    const oraRif = t.ora;
    const r = window.__centro.misura(par, { nuova: false });
    window.__centro.ricorda();        // i pixel di mezzogiorno, per il banco
    t.setTimeLeft(tl);
    t.disegna();
    G.cam.z = cam.z; G.cam.x = cam.x; G.cam.y = cam.y;
    G.camBanda = banda; G.camLato = lato; G.camPunch = punch;
    G.view.Ax = view.Ax; G.view.Ay = view.Ay; G.view.S2 = view.S2;
    if (view.sx !== undefined) { G.view.sx = view.sx; G.view.sy = view.sy; }
    r.ora = +oraScena.toFixed(3);
    r.oraRif = +oraRif.toFixed(3);
    r.moto = moto;
    r.durata = durata;
    /* VALIDO SOLO SE L'ORA E' DAVVERO TORNATA A ZERO. A movimento ridotto
       oraPartita() restituisce un valore fisso e il cronometro non la
       tocca: lì non esistono due metà partita, e dirlo è l'unica cosa
       onesta da fare. */
    r.valido = oraRif <= 0.02;
    return r;
  }, S);
}

/* LA RAMPA DELLA LUCE AL CENTRO (--rampa). Non è un cancello: è il
   documento con cui le soglie della misura 6 sono state scelte. Congela
   lo stato e ridisegna lo STESSO fotogramma a undici ore diverse,
   stampando che cosa fa il manto del terzo centrale. Da qui si legge
   quanto il gioco promette di suo a metà partita, e la soglia si mette
   sotto quella promessa, non sopra il risultato. */
async function rampaDellaLuce(pag, S) {
  return await pag.evaluate(par => {
    const t = window.__test, G = t.G;
    const durata = (typeof SAVE !== 'undefined' && SAVE.durata) ? SAVE.durata : 90;
    const cam = { z: G.cam.z, x: G.cam.x, y: G.cam.y };
    const banda = G.camBanda, lato = G.camLato, punch = G.camPunch;
    const view = { Ax: G.view.Ax, Ay: G.view.Ay, S2: G.view.S2 };
    const tl = G.timeLeft, out = [];
    for (const q of [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]) {
      t.setTimeLeft(durata * (1 - q));
      t.disegna();
      const r = window.__centro.misura(par, { nuova: false });
      out.push({ q, ora: +t.ora.toFixed(3), sat: r.sat, lum: r.lum, tinta: r.tinta, rgb: r.rgb });
    }
    t.setTimeLeft(tl); t.disegna();
    G.cam.z = cam.z; G.cam.x = cam.x; G.cam.y = cam.y;
    G.camBanda = banda; G.camLato = lato; G.camPunch = punch;
    G.view.Ax = view.Ax; G.view.Ay = view.Ay; G.view.S2 = view.S2;
    return out;
  }, S);
}

/* ================================================================= main = */
(async () => {
  const o = argomenti();
  const S = Object.assign({}, SOGLIE);
  /* le soglie si possono spostare da riga di comando: serve a mostrare che
     l'esito reagisce davvero al numero, e non è scritto nel codice */
  for (const k of Object.keys(S)) if (o[k] !== undefined) S[k] = +o[k];

  if (o.soglie) {
    console.log('\nLE SOGLIE DEL FREEZE-FRAME TEST\n');
    const righe = [
      ['erba vuota', `< ${(S.erbaVuotaMax * 100).toFixed(0)}% dell'area giocabile`, 'tema 6 — «l\'erba senza soggetti resta sotto il 40-50%»'],
      ['centro abitato', `>= ${S.centroAbitatoMin}/32 col soggetto, ${S.centroCorpoMin} col corpo`, 'tema 6 — dove cade l\'occhio ci devono stare i corpi'],
      ['palla, luminanza', `>= ${S.pallaLumMin}x la mediana del quadro`, 'tema 5 — «un estraneo trova la palla in meno di un secondo»'],
      ['palla, diametro', `>= ${(S.pallaDiamMin * 100).toFixed(1)}% della larghezza`, 'tema 5 — diametro +30/100%'],
      ['altezza figura', `>= ${(S.figuraAltMin * 100).toFixed(0)}% dell\'altezza`, 'tema 6 — «giocatori mai sotto 70-90 px a 1080p»'],
      ['ombre, direzioni', `deviazione <= ${S.ombreDevMax}°`, 'tema 1 — «tutte le ombre parallele entro ±5 gradi»'],
      ['ombre, lunghezza', `>= ${S.ombreLungMin}x l\'altezza della figura`, 'tema 1 — «ombre lunghe 1,5-4 volte la figura»'],
      ['temperatura prato', `>= ${S.pratoHueMin}° di tinta`, 'tema 1 — «col contagocce i due angoli differiscono»'],
      ['centro sera, luce', `-${(S.centroLumCalo * 100).toFixed(0)}% di luminanza sul mezzogiorno`, 'tema 1 — «la sera arriva anche al centro del quadro»'],
      ['centro sera, colore', `-${(S.centroSatCalo * 100).toFixed(0)}% di saturazione sul mezzogiorno`, 'tema 1 — dove cade l\'occhio, non solo ai bordi'],
    ];
    for (const r of righe) console.log('  ' + r[0].padEnd(20) + r[1].padEnd(36) + r[2]);
    console.log('\nLE DUE SOGLIE DEL CENTRO, DA DOVE VENGONO');
    console.log(`  Valgono nel SECONDO TEMPO, cioè oltre ora ${(S.centroSecondoTempo * 100).toFixed(0)}%. Nel primo tempo il cancello`);
    console.log(`  chiede soltanto che la luce non torni indietro: calo >= -${(S.centroTolleranza * 100).toFixed(0)}%, cioè il centro`);
    console.log('  non può essere PIU\' chiaro o PIU\' carico del fischio d\'inizio oltre il rumore.');
    console.log('  Il riferimento non è una tinta scritta a mano: è lo stesso campo, stesso');
    console.log('  fotogramma, cronometro riportato a zero. Le percentuali si leggono sulla');
    console.log('  rampa che il gioco disegna di suo: node strumenti/istantanea.js --rampa --n 1');
    console.log(`  Campione: il terzo centrale del quadro (celle ${Math.round(S.celleX * (1 - S.centroFrazione) / 2)}-${S.celleX - Math.round(S.celleX * (1 - S.centroFrazione) / 2) - 1} per ${Math.round(S.celleY * (1 - S.centroFrazione) / 2)}-${S.celleY - Math.round(S.celleY * (1 - S.centroFrazione) / 2) - 1}),`);
    console.log(`  solo celle di erba vuota, almeno ${S.centroCampioniMin} pixel: sotto, la misura non si dà.`);
    console.log('\nI DUE TETTI DELL\'ERBA VUOTA, E SU CHE COSA SONO CALCOLATI');
    console.log(`  Il tetto del ${(S.erbaVuotaMax * 100).toFixed(0)}% vale sull'AREA GIOCABILE — il quadro meno le zone`);
    console.log('  che il gioco dichiara come interfaccia (__test.zoneInterfaccia), che erba non');
    console.log('  possono essere. Su un telefono in orizzontale l\'interfaccia vale il 12,8% del');
    console.log(`  quadro: lo stesso ${(S.erbaVuotaMax * 100).toFixed(0)}% preteso sul QUADRO INTERO regalerebbe il ${(S.erbaVuotaMax / (1 - 0.128) * 100).toFixed(1)}% di`);
    console.log('  area giocabile, ed è il buco che il giudice della giuria a 26 ha trovato il 18');
    console.log('  agosto. Il numero sul quadro intero si continua a stampare accanto a ogni');
    console.log('  istante. Il TERZO CENTRALE non ha più un tetto sull\'ERBA: ha un pavimento sui');
    console.log(`  SOGGETTI (almeno ${S.centroAbitatoMin} celle su 32 con un corpo o il pallone dentro), perché`);
    console.log('  contare il manto lì in mezzo si comprava con le chiazze e con l\'ambra dei fari.');
    console.log('\nCHE GLI OTTO CAMPIONI SIANO OTTO');
    console.log(`  Gli istanti si pescano stratificati (uno per fetta) e si avanza sempre di almeno`);
    console.log(`  ${S.istantiPassoMin.toFixed(1)} s di partita. Poi lo strumento MISURA quanto sono diversi: differenza`);
    console.log(`  media assoluta di luminanza fra ogni coppia, tabella in fondo alla corsa, e`);
    console.log(`  sotto ${S.indipMin.toFixed(1)} su 255 la coppia è dichiarata NON indipendente e la corsa fallisce.`);
    console.log('\nParametri interni delle misure:');
    for (const k of Object.keys(S)) {
      if (['erbaVuotaMax', 'pallaLumMin', 'pallaDiamMin', 'figuraAltMin', 'ombreDevMax',
        'ombreLungMin', 'pratoHueMin', 'centroLumCalo', 'centroSatCalo', 'centroAbitatoMin',
        'centroCorpoMin'].includes(k)) continue;
      console.log('  ' + k.padEnd(20) + S[k]);
    }
    console.log('');
    return;
  }

  const n = Math.max(1, +(o.n || 8));
  const da = +(o.da || 3), a = +(o.a || 80);
  const seme = +(o.seme || 20260728);
  const dir = path.resolve(o.dir || 'istantanee');
  const vista = { w: +(o.w || 915), h: +(o.h || 412), dpr: +(o.dpr || 2) };
  const controllo = !!o.controllo;

  /* GLI ISTANTI: casuali ma dal seme, quindi gli stessi a ogni esecuzione —
     e STRATIFICATI, cioè uno per fetta di finestra, con lo scarto pescato
     nel 70% centrale della fetta. Il caso continua a scegliere dove
     guardare; quello che non può più fare è mettere due istanti a mezzo
     secondo l'uno dall'altro e farli contare per due. Con otto istanti fra
     il secondo 3 e l'80 la fetta è 9,6 s e due istanti non possono
     avvicinarsi sotto i 2,9 s di partita.
     Il campionamento uniforme, che c'era prima, dava a caso una coppia
     vicina ogni tanto — e il 17 agosto ne dava DUE su otto. */
  const r = dado(seme ^ 0x9e3779b9);
  const istanti = [];
  const fetta = (a - da) / n;
  for (let i = 0; i < n; i++) istanti.push(da + fetta * (i + 0.15 + 0.70 * r()));

  fs.mkdirSync(dir, { recursive: true });

  const srv = await servi();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: vista.w, height: vista.h },
    deviceScaleFactor: vista.dpr,
    isMobile: true, hasTouch: true, reducedMotion: 'no-preference', locale: 'it-IT',
  });
  const pag = await ctx.newPage();

  /* il caso governato PRIMA di ogni riga di pagina (xorshift32) */
  await pag.addInitScript(s0 => {
    let s = s0 >>> 0 || 1;
    const prossimo = () => {
      s ^= s << 13; s >>>= 0;
      s ^= s >>> 17;
      s ^= s << 5; s >>>= 0;
      return s >>> 0;
    };
    Math.random = () => prossimo() / 4294967296;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues = arr => { for (let i = 0; i < arr.length; i++) arr[i] = prossimo(); return arr; };
    }
  }, seme);
  await pag.addInitScript(bancoDiProva);
  /* l'attrezzo della misura 6 vive in pagina: lo chiamano sia la misura del
     fotogramma vero sia quella del riferimento di mezzogiorno, ed è
     UNA sola implementazione — due copie della stessa misura sono il modo
     più elegante di misurare due cose diverse credendo di confrontarle */
  await pag.addInitScript(attrezzoCentro);

  const errori = [];
  pag.on('console', m => { if (m.type() === 'error') errori.push(m.text()); });
  pag.on('pageerror', e => errori.push('ECCEZIONE: ' + e.message));

  const esiti = [];
  let mancantiVisti = [];
  let coperti = 0;
  let rampaFatta = 0;
  let indip = null;
  try {
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.waitForTimeout(500);
    await pag.evaluate(() => window.__banco.passo(30));

    /* la partita: vera, CPU contro CPU (per la ripetibilità), senza
       tutorial, con i comandi disegnati come li vede un giocatore */
    await pag.evaluate(taglia => {
      const t = window.__test;
      t.dismissSplash && t.dismissSplash();
      t.startMatch(1, 1, taglia ? { size: taglia } : undefined);
      t.Tut && t.Tut.finish && t.Tut.finish(true);
      t.posaHUD && t.posaHUD(true);
      t.setCpuVsCpu && t.setCpuVsCpu(true);
    }, o.taglia ? +o.taglia : 0);

    /* ============================ SI ASPETTA CHE IL DOM SI TOLGA DI MEZZO
       Lo splash sfuma in mezzo secondo e la transizione fra schermate
       (#wipe) spazza lo schermo con bande diagonali: sono animazioni CSS,
       che corrono sull'orologio VERO e non sul banco. Scattando subito
       dopo startMatch si fotografano LORO — la tela sotto è perfetta e la
       fotografia è di un sipario. E' costato un giro intero di lavoro e
       una diagnosi sbagliata («la tela è vuota»): la tela non era vuota,
       era coperta. Qui si aspetta la condizione, non l'orologio, e poi si
       congelano le animazioni perché non ne partano altre. */
    try {
      await pag.waitForFunction(() => {
        const w = document.getElementById('wipe');
        if (w && getComputedStyle(w).display !== 'none') return false;
        const s = document.getElementById('splash');
        if (s) { const cs = getComputedStyle(s); if (cs.display !== 'none' && +cs.opacity > 0.02) return false; }
        return document.getAnimations().every(an => {
          const c = an.effect && an.effect.getComputedTiming ? an.effect.getComputedTiming() : null;
          return !c || c.iterations === Infinity || !isFinite(c.endTime) || an.playState === 'finished';
        });
      }, null, { polling: 60, timeout: 15000 });
    } catch (e) {
      console.log('  ATTENZIONE: gli strati del DOM non si sono tolti in 15 s; le fotografie potrebbero essere coperte.');
    }
    await pag.evaluate(congelaAnimazioni);

    console.log(`\n=== FREEZE-FRAME TEST — ${n} istanti fra il secondo ${da} e il secondo ${a}, seme ${seme} ===`);
    console.log(`quadro ${vista.w}x${vista.h}@${vista.dpr}  (tela ${vista.w * vista.dpr}x${vista.h * vista.dpr} px)`);
    if (controllo) {
      console.log('\n!!! BANCO DI PROVA DELLO STRUMENTO — I FOTOGRAMMI SONO FALSIFICATI !!!');
      console.log('    Sette falsi dichiarati sopra la stessa scena vera: il sole spostato a 145');
      console.log('    gradi, il prato spianato, il centro riportato a mezzogiorno, il centro');
      console.log('    portato a sera, il terzo centrale spianato a manto, il terzo centrale');
      console.log('    riempito di sagome e l\'anello di possesso dipinto attorno al pallone.');
      console.log('    Serve a verificare che la misura segua i PIXEL, non la dichiarazione, e');
      console.log('    che sappia sia fallire sia passare.');
      console.log('    Il falso «centro a mezzogiorno» non è vernice: è il terzo centrale VERO del');
      console.log('    fotogramma a ora=0, incollato sulla scena della sera. Il cancello del centro');
      console.log('    morde nel SECONDO TEMPO, quindi il banco vuole istanti oltre ora 50%:');
      console.log('    con la finestra usuale (--da 3 --a 80) ne cadono pochi — per una prova');
      console.log('    piena conviene --controllo --da 46 --a 88.');
      console.log('    Nota: qui ogni istante costa due disegni in più (si ridipinge per');
      console.log('    falsificare) e la camera vive dentro render(), quindi la colonna');
      console.log('    "gioco vero" può differire di poco da quella della corsa normale.\n');
    }

    let orologio = 0;
    for (let i = 0; i < istanti.length; i++) {
      const bersaglio = istanti[i];
      /* si porta la partita all'istante voluto un pezzo per volta.
         E MAI MENO DI istantiPassoMin DAL FOTOGRAMMA APPENA MISURATO: se
         l'istante precedente è stato spostato in avanti per uscire da una
         celebrazione, il bersaglio di questo può restare ALLE SUE SPALLE,
         il passo diventare zero e la misura ricadere sulla stessa
         identica tela. E' successo il 17 agosto in due coppie su otto —
         04/05 e 07/08 — e nessuno se n'era accorto: la seconda volta la
         tela non era nemmeno più la stessa, perché i due ridisegni del
         riferimento di mezzogiorno avevano intanto mosso la camera di due
         fotogrammi, così l'istante 8 misurava una palla che nei pixel non
         c'era più. Lo spostamento si dichiara nella riga dell'istante. */
      const dovuto = Math.max(0, bersaglio - orologio);
      const avanti = i === 0 ? dovuto : Math.max(dovuto, S.istantiPassoMin);
      const forzato = avanti > dovuto + 1e-9;
      /* LA PARTITA SI FA CORRERE A FOTOGRAMMI VERI, non a sola fisica.
         __test.simulate fa avanzare i corpi e NON disegna; ma in questo
         gioco la camera vive dentro render() — updateCamera(rdt) è la
         prima riga di render — quindi ventisette secondi di sola fisica
         lasciano l'inquadratura ferma dov'era al fischio d'inizio, e al
         primo disegno la camera ha fatto UN sessantesimo di strada verso
         il pallone. Le misure erano vere ma di un fotogramma che nessun
         giocatore vede mai: azione al bordo, palla sotto i pulsanti,
         erba vuota gonfiata. Con __banco.passo() ogni passo di fisica ha
         il suo disegno, esattamente come in partita, e resta
         deterministico perché l'orologio è ancora il nostro. Costa: sono
         sessanta render al secondo di gioco. */
      const stato = await pag.evaluate(sec => {
        const t = window.__test, banco = window.__banco;
        banco.passo(Math.round(sec * 60));
        /* se l'istante cade dentro una celebrazione o una moviola si
           aspetta il ritorno in gioco: il freeze-frame test è sull'AZIONE,
           e uno scatto sulla festa direbbe di un'altra scena. Quanto si è
           aspettato viene dichiarato, non nascosto.
           Al rientro si aggiunge un secondo e due decimi: il primo
           fotogramma dopo il fischio è una formazione ferma in mezzo al
           campo — dieci figure in posa d'attesa — e fotografare SEMPRE
           quella sarebbe scegliersi l'istante, cioè il contrario di
           questo collaudo. */
        let extra = 0;
        for (let k = 0; k < 200; k++) {
          const s = t.state;
          if ((s === 'play' || s === 'golden') && !t.moviola) break;
          if (s === 'menu' || s === 'end') break;
          banco.passo(7); extra += 7 / 60;
        }
        if (extra > 0 && (t.state === 'play' || t.state === 'golden')) {
          banco.passo(72); extra += 1.2;
        }
        return { scena: t.state, extra: +extra.toFixed(2) };
      }, avanti);
      /* IL CRONOMETRO SI SOMMA, NON SI INDOVINA. Prima valeva
         "bersaglio + extra", che quando il passo veniva forzato a zero
         stampava un tempo INFERIORE a quello dell'istante precedente:
         nella riga si leggeva t=39,0s dopo un t=40,1s, cioè il banco
         dichiarava di essere tornato indietro nel tempo. */
      orologio += avanti + stato.extra;
      if (stato.scena === 'menu' || stato.scena === 'end') {
        console.log(`\n--- istante ${i + 1}: la partita è finita prima (${stato.scena}), si smette qui`);
        break;
      }

      /* NIENTE disegno in più qui: l'ultimo fotogramma del banco è già
         sulla tela, ed è quello che si misura e si fotografa. Ridisegnare
         farebbe fare alla camera un altro sessantesimo di strada, e la
         fotografia non sarebbe più il fotogramma misurato. */
      const nn = String(i + 1).padStart(2, '0');
      const m = await pag.evaluate(misuraInPagina, { par: S, controllo: 0, impronta: true });
      if (m.mancanti.length) mancantiVisti = mancantiVisti.concat(m.mancanti);

      await pag.screenshot({ path: path.join(dir, 'istante-' + nn + '.png') });
      fs.writeFileSync(path.join(dir, 'silhouette-' + nn + '.png'),
        Buffer.from(m.silhouette.split(',')[1], 'base64'));

      /* IL RIFERIMENTO DI MEZZOGIORNO, dopo la fotografia e mai prima: il
         PNG dev'essere il fotogramma misurato, non uno dei due ridisegni
         che servono al confronto. */
      m.centroRif = await riferimentoMezzogiorno(pag, S);

      /* IL GEMELLO SPORCO — la prova che il guardiano dell'indipendenza sa
         dire di no, e non è una copia di comodo: è ESATTAMENTE il
         fotogramma che il banco di ieri misurava due volte. Stessa
         partita ferma allo stesso millesimo, ma dopo i due ridisegni che
         il riferimento di mezzogiorno si porta dietro — cioè la coppia
         04/05 del 17 agosto, quella che il giudice ha misurato a 0,67 su
         255. Se il guardiano non la riconosce qui, non serve a niente.
         Costa una passata, e solo con --controllo. */
      if (controllo && i === 0) {
        await pag.evaluate(misuraInPagina, { par: S, controllo: 0, impronta: 'gemello' });
      }

      const c = cancelli(m, S);
      const passate = c.filter(x => x.ok).length;
      const luce = m.luce
        ? `  ora ${(m.luce.ora * 100).toFixed(0)}%  fari ${m.luce.fari ? m.luce.fari.filter(x => x > 0.5).length : '?'}/4`
        : '';
      console.log(`\n--- istante ${i + 1}: t=${orologio.toFixed(1)}s  scena ${m.scena}  ` +
        `${m.punteggio[0]}-${m.punteggio[1]}  ${m.figure} figure in quadro  ` +
        `zoom ${m.vista.S2}${luce}${stato.extra ? '  (spostato di ' + stato.extra.toFixed(1) + 's per uscire dalla scena del gol)' : ''}` +
        `${forzato ? '  (il bersaglio ' + bersaglio.toFixed(1) + 's era già passato: portato a ' + S.istantiPassoMin.toFixed(1) + 's dal fotogramma precedente)' : ''}`);
      /* la fotografia è del gioco o di un sipario? */
      if (m.strati.length) {
        coperti++;
        console.log('  NO   LA FOTOGRAFIA E\' COPERTA da uno strato del DOM: ' +
          m.strati.map(s => `${s.id} (opacità ${s.op}, ${Math.round(s.quota * 100)}% del quadro)`).join(', '));
        console.log('       le misure leggono la TELA e restano valide, ma il PNG non è del gioco.');
      }
      for (const x of c) {
        console.log((x.ok ? '  OK   ' : '  NO   ') + x.testo + (x.nota ? '\n         ' + x.nota : ''));
      }
      /* L'ESCLUSIONE DICHIARATA SI STAMPA A OGNI ISTANTE, verde o rossa
         che sia la riga: è l'unico modo perché non cresca in silenzio. */
      if (m.ifacc && m.ifacc.dichiarata) {
        console.log(`         interfaccia dichiarata: ${m.ifacc.zone} zone (${m.ifacc.tipi}), ` +
          `${(m.ifacc.frazione * 100).toFixed(1)}% del quadro — là non si cerca ombra`);
      } else if (m.ifacc && m.ifacc.perche) {
        console.log(`         interfaccia NON dichiarata: ${m.ifacc.perche} — si è misurato tutto il quadro`);
      }
      console.log(`         ${passate}/${c.length} — istante-${nn}.png, silhouette-${nn}.png`);
      /* --rampa: la curva della luce al centro, una volta sola, sul primo
         istante utile. E' il documento delle soglie della misura 6. */
      if (o.rampa && rampaFatta < 3) {
        rampaFatta++;
        const rp = await rampaDellaLuce(pag, S);
        const z = rp[0];
        console.log('\n   LA RAMPA DELLA LUCE AL CENTRO (stesso stato, undici ore) — è da qui che');
        console.log('   escono le soglie della misura 6: il calo che il gioco promette di suo.');
        console.log('     ora    L mediana   calo L    sat     calo sat   tinta   rgb');
        for (const p of rp) {
          console.log('     ' + (p.q * 100).toFixed(0).padStart(3) + '%   ' +
            p.lum.toFixed(1).padStart(6) + '   ' +
            ((1 - p.lum / z.lum) * 100).toFixed(1).padStart(7) + '%   ' +
            p.sat.toFixed(3) + '   ' +
            ((1 - p.sat / z.sat) * 100).toFixed(1).padStart(7) + '%   ' +
            p.tinta.toFixed(0).padStart(4) + '°   rgb(' + p.rgb.join(',') + ')');
        }
        console.log('');
      }
      /* --dettaglio: l'ombra figura per figura. Serve a chi ripara, non a
         chi giudica: dice QUALE sagoma esce dal fascio e di quanto. */
      if (o.dettaglio) {
        /* la griglia dell'erba vuota, come la vede la misura: il punto è
           manto senza soggetti, il cancelletto è tutto il resto. Se la
           mappa non somiglia al fotogramma, la misura è cieca e si vede
           a occhio in due secondi. */
        for (const r2 of m.erba.mappa) console.log('           ' + r2);
        /* i sedici raggi della palla: dove si sono fermati e perché. E'
           l'unico modo di distinguere «la palla è piccola» da «il raggio
           è scappato», che sono due difetti di due proprietari diversi. */
        console.log('           palla @' + m.palla.cx + ',' + m.palla.cy +
          '  raggi fermati da: ' + Object.keys(m.palla.fermate).map(k => k + ' ' + m.palla.fermate[k]).join(', ') +
          (m.palla.raggiScappati ? `  ·  ${m.palla.raggiScappati}/16 sarebbero usciti col buco perdonato dovunque` : ''));
        for (const ob of m.ombre) {
          /* IL MOTIVO DELLO SCARTO STA QUI E NON SOLO NEL RIEPILOGO: chi
             ripara deve sapere QUALE sagoma è uscita e PERCHE', altrimenti
             legge «3 in duello» e non sa quali tre. Il riepilogo conta, il
             dettaglio nomina. */
          const mot = ['bordo', 'duello', 'fuoriManto', 'buioAttorno', 'sottile',
            'ambigua', 'staccata', 'pozza'].filter(k => ob[k]).join('+') || 'traccia insufficiente';
          console.log('           fig ' + String(ob.idx).padStart(2) +
            ` @${String(ob.x).padStart(4)},${String(ob.y).padStart(4)}` +
            (ob.ombra ? `  dir ${ob.dir.toFixed(0).padStart(5)}°  lung ${ob.rapporto.toFixed(2)}x  (${ob.lung} px su ${ob.h} di figura, ${ob.pixel} pixel d'ombra; sulla dichiarata ${ob.lungDich} px, larga ${ob.larghezza})`
              : `  SCARTATA: ${mot} (${ob.pixel} pixel)`));
          /* IL PROFILO DELLA MARCIA, dieci gradi per casella: e' l'unico
             modo di distinguere «l'ombra punta altrove» da «attorno alla
             figura e' buio in ogni direzione». Il primo e' un difetto del
             gioco, il secondo un difetto della misura. */
          if (ob.profilo) console.log('               profilo 0..350°: ' + ob.profilo.join(' '));
        }
      }
      const riga = { i: i + 1, c, m };

      /* --controllo: lo STESSO fotogramma, altre due volte, falsificato in
         meglio e in peggio. Si ridisegna ogni volta dallo stato (disegna()
         non fa avanzare la fisica), quindi le tre versioni differiscono
         SOLO per la vernice. */
      if (controllo) {
        const lung = x => {
          const v = x.ombre.filter(y => y.ombra);
          return v.length ? v.reduce((s, y) => s + y.rapporto, 0) / v.length : 0;
        };
        await pag.evaluate(() => { window.__test.disegna(); });
        const mA = await pag.evaluate(misuraInPagina, { par: S, controllo: 1 });
        await pag.screenshot({ path: path.join(dir, 'controllo-meglio-' + nn + '.png') });
        await pag.evaluate(() => { window.__test.disegna(); });
        const mB = await pag.evaluate(misuraInPagina, { par: S, controllo: 2 });
        await pag.screenshot({ path: path.join(dir, 'controllo-peggio-' + nn + '.png') });
        const cA = cancelli(mA, S), cB = cancelli(mB, S);
        if (o.dettaglio) {
          for (const ob of mA.ombre) {
            console.log('           [meglio] fig ' + String(ob.idx).padStart(2) + ' @' + (ob.x||0) + ',' + (ob.y||0) +
              (ob.ombra ? `  dir ${ob.dir.toFixed(0).padStart(5)}°  lung ${ob.rapporto.toFixed(2)}x  (${ob.lung}/${ob.h} px, ${ob.pixel} pixel)`
                : `  nessuna ombra trovata (${ob.pixel} pixel)`));
            if (ob.profilo) console.log('                     profilo ' + ob.profilo.join(' '));
          }
        }
        const d = x => (x.ok ? 'OK' : 'NO');
        /* la direzione media misurata sul falso: è LEI la prova che la
           misura guarda i pixel e non la dichiarazione */
        const vA = mA.ombre.filter(y => y.ombra);
        riga.dirA = vA.length ? statisticaCircolare(vA.map(y => y.dir)).media : null;
        console.log(`   banco   ombre:  gioco vero ${d(c[3])}   sole spostato a 145° ${d(cA[3])} (misurata ${riga.dirA === null ? '—' : riga.dirA.toFixed(0) + '°'})   prato spianato ${d(cB[3])}`);
        const dirdi = x => {
          const v = x.ombre.filter(y => y.ombra);
          if (!v.length) return '—';
          const s = statisticaCircolare(v.map(y => y.dir));
          return s.media.toFixed(0) + '°±' + s.dev.toFixed(0);
        };
        console.log(`           lunghezza ${lung(m).toFixed(2)}x -> ${lung(mA).toFixed(2)}x -> ${lung(mB).toFixed(2)}x, ` +
          `direzione ${dirdi(m)} -> ${dirdi(mA)} -> ${dirdi(mB)}, ` +
          `ombre trovate ${m.ombre.filter(x => x.ombra).length} -> ${mA.ombre.filter(x => x.ombra).length} -> ${mB.ombre.filter(x => x.ombra).length}`);
        console.log(`           prato:  gioco vero ${d(c[4])}   gradiente dipinto ${d(cA[4])}   prato spianato ${d(cB[4])}`);
        console.log(`           tinta ${m.prato.delta.toFixed(0)}° -> ${mA.prato.delta.toFixed(0)}° -> ${mB.prato.delta.toFixed(0)}°`);

        /* i due falsi della misura 6, sullo stesso istante e sulla stessa
           zolla: il centro riportato a mezzogiorno (deve fallire) e il
           centro portato a sera a mano (deve passare). */
        await pag.evaluate(() => { window.__test.disegna(); });
        const mC = await pag.evaluate(misuraInPagina, { par: S, controllo: 3 });
        mC.centroRif = m.centroRif;
        await pag.screenshot({ path: path.join(dir, 'controllo-centro-giorno-' + nn + '.png') });
        await pag.evaluate(() => { window.__test.disegna(); });
        const mD = await pag.evaluate(misuraInPagina, { par: S, controllo: 4 });
        mD.centroRif = m.centroRif;
        await pag.screenshot({ path: path.join(dir, 'controllo-centro-sera-' + nn + '.png') });
        const cC = cancelli(mC, S), cD = cancelli(mD, S);
        const calo = x => {
          if (!x.centro || !x.centroRif || !x.centroRif.valido || !x.centro.lum) return null;
          return { L: 1 - x.centro.lum / x.centroRif.lum, S: 1 - x.centro.sat / x.centroRif.sat };
        };
        const scrivi = v => v ? `L ${(v.L * 100).toFixed(1)}% / S ${(v.S * 100).toFixed(1)}%` : '—';
        riga.caloC = calo(mC); riga.caloD = calo(mD);
        console.log(`           centro: gioco vero ${d(c[5])}   centro a mezzogiorno ${d(cC[5])}   centro a sera ${d(cD[5])}`);
        console.log(`           calo sul mezzogiorno  ${scrivi(calo(m))}  ->  ${scrivi(riga.caloC)}  ->  ${scrivi(riga.caloD)}`);

        /* i due falsi del CENTRO ABITATO, e non sono vernice: si spostano
           gli ATTORI e si lascia ridisegnare il gioco, con la camera
           tenuta ferma. Il quinto sgombra il riquadro nel caso peggiore
           — figure spostate dello stretto indispensabile, PALLONE
           lasciato dov'era — e deve diventare rosso; il sesto ci mette
           soltanto il duello e il pallone, cioè l'aritmetica del tetto e
           nient'altro, e deve diventare verde. E il falso della PALLA:
           l'anello di possesso dipinto attorno al pallone alla distanza
           minima consentita dal gioco. */
        await pag.evaluate(() => { window.__test.disegna(); });
        const mE = await pag.evaluate(misuraInPagina, { par: S, controllo: 5 });
        await pag.screenshot({ path: path.join(dir, 'controllo-centro-sgombro-' + nn + '.png') });
        await pag.evaluate(() => { window.__test.disegna(); });
        const mF = await pag.evaluate(misuraInPagina, { par: S, controllo: 6 });
        await pag.screenshot({ path: path.join(dir, 'controllo-centro-duello-' + nn + '.png') });
        await pag.evaluate(() => { window.__test.disegna(); });
        /* BANCO ONESTO: nessun ripiego muto. Il banco 7 puo' rifiutarsi
           di misurare (se __test.pallaRaggio non c'e' l'anello falso non
           si posa dove il gioco lo posa). Prima quel rifiuto usciva
           dall'evaluate, interrompeva il giro sugli istanti e buttava via
           TUTTE E QUATTORDICI le misure: un banco che si ferma non deve
           portarsi dietro i tredici risultati che aveva gia' in mano. */
        let mG = null, mGmotivo = null;
        try { mG = await pag.evaluate(misuraInPagina, { par: S, controllo: 7 }); }
        /* il messaggio vero comincia con "page.evaluate: Error: ", non con
           "Error: ": una cerca ancorata a inizio riga non mordeva e la
           riga usciva col doppio cappello. Misurato dal critico, corretto
           qui: si toglie tutto cio' che precede il primo "Error: ". */
        catch (e) { mGmotivo = String((e && e.message) || e).split('\n')[0].replace(/^.*?Error: /, ''); }
        if (mG) await pag.screenshot({ path: path.join(dir, 'controllo-anello-' + nn + '.png') });
        const cE = cancelli(mE, S), cF = cancelli(mF, S), cG = mG ? cancelli(mG, S) : null;
        console.log(`           centro abitato: gioco vero ${d(c[6])}   riquadro sgombrato ${d(cE[6])}   duello al centro ${d(cF[6])}`);
        console.log(`           celle abitate su ${m.centroAbitato.celle}: ${m.centroAbitato.abitate}  ->  ${mE.centroAbitato.abitate}  ->  ${mF.centroAbitato.abitate}` +
          `   (di cui col corpo ${m.centroAbitato.abitateCorpo} -> ${mE.centroAbitato.abitateCorpo} -> ${mF.centroAbitato.abitateCorpo})` +
          `   (figure nel riquadro ${m.centroAbitato.figure} -> ${mE.centroAbitato.figure} -> ${mF.centroAbitato.figure};` +
          ` pallone ${m.centroAbitato.palla} -> ${mE.centroAbitato.palla} -> ${mF.centroAbitato.palla})`);
        console.log(`           attori spostati: ${mE.scenaFalso ? mE.scenaFalso.spostate : '?'} fuori dal riquadro nel primo falso,` +
          ` ${mF.scenaFalso ? mF.scenaFalso.dentro : '?'} dentro nel secondo;  camera ferma` +
          ` ${mE.scenaFalso && mE.scenaFalso.ferma ? 'sì' : 'NO'}/${mF.scenaFalso && mF.scenaFalso.ferma ? 'sì' : 'NO'}`);
        if (mG) {
          console.log(`           palla:  gioco vero ${d(c[1])}   con l'anello di possesso dipinto attorno ${d(cG[1])}`);
          console.log(`           diametro severo ${m.palla.diamPx.toFixed(1)} -> ${mG.palla.diamPx.toFixed(1)} px;  ` +
            `permissivo (il conto di ieri) ${m.palla.diamLargo.toFixed(1)} -> ${mG.palla.diamLargo.toFixed(1)} px;  ` +
            `raggi scappati ${m.palla.raggiScappati} -> ${mG.palla.raggiScappati} su 16`);
        } else {
          console.log(`           palla:  BANCO 7 NON MISURATO — ${mGmotivo}`);
          console.log(`           (le altre misure di questo istante restano valide: erano gia' prese)`);
        }
        riga.cA = cA; riga.cB = cB; riga.cC = cC; riga.cD = cD;
        riga.cE = cE; riga.cF = cF; riga.cG = cG;
        riga.mE = mE; riga.mF = mF; riga.mG = mG;
      }
      esiti.push(riga);
    }

    /* ============================ QUANTO SONO INDIPENDENTI GLI OTTO
       Si calcola in pagina, dove le impronte già stanno: la differenza
       media assoluta di luminanza (0-255) fra ogni coppia di istanti. */
    indip = await pag.evaluate(soglia => {
      const A = window.__impronte || [], Gm = window.__gemello || [];
      /* DUE NUMERI PER LA STESSA COPPIA, e non è ridondanza.
         · d  = differenza media assoluta di luminanza. E' il numero che
                il giudice ha usato, quindi si continua a dare;
         · q  = quanta PARTE del quadro è cambiata di più di otto livelli.
                Due fotogrammi diversi si muovono dappertutto; lo stesso
                fotogramma con lo stick sbiadito si muove sullo stick e
                basta. Sulle stesse coppie il primo separa di due volte,
                il secondo di dieci: il fossato è dove si vede. */
      const dist = (a, b) => {
        const n = Math.min(a.length, b.length);
        let s = 0, c = 0;
        for (let k = 0; k < n; k++) { const v = Math.abs(a[k] - b[k]); s += v; if (v > 8) c++; }
        return n ? { d: +(s / n).toFixed(2), q: +(c / n).toFixed(4) } : { d: 0, q: 0 };
      };
      const cop = [];
      for (let i = 0; i < A.length; i++) for (let j = i + 1; j < A.length; j++) {
        const v = dist(A[i], A[j]);
        cop.push({ i, j, d: v.d, q: v.q });
      }
      const gem = (Gm.length && A.length) ? dist(A[0], Gm[0]) : null;
      return { n: A.length, campioni: A.length ? A[0].length : 0, coppie: cop, gemello: gem, soglia };
    }, S.indipMin);
  } finally {
    await ctx.close(); await browser.close(); srv.chiudi();
  }

  /* ------------------------------------------------------------ riepilogo */
  const nomi = ['erba vuota', 'palla trovabile', 'altezza figura', 'ombre parallele',
    'temperatura prato', 'centro sera', 'centro abitato'];
  const tot = esiti.length * nomi.length;
  const passate = esiti.reduce((a2, e) => a2 + e.c.filter(x => x.ok).length, 0);
  console.log('\n=== RIEPILOGO ===');
  console.log('  istante   ' + nomi.map(x => x.slice(0, 9).padEnd(10)).join(''));
  for (const e of esiti) {
    console.log('    ' + String(e.i).padEnd(9) +
      e.c.map(x => (x.ok ? 'OK' : 'NO').padEnd(10)).join(''));
  }
  console.log('  ---------');
  console.log('  su ' + esiti.length + '    ' +
    nomi.map((_, k) => (esiti.filter(e => e.c[k].ok).length + '/' + esiti.length).padEnd(10)).join(''));
  console.log(`\n${passate} misure passate su ${tot}.  I PNG stanno in ${dir}`);

  /* ============================ GLI OTTO CAMPIONI SONO OTTO?
     La tabella delle differenze medie assolute fra istanti. Non è una
     curiosità: se due istanti sono lo stesso fotogramma, il banco conta
     due volte lo stesso voto e la frazione «7 su 8» è una bugia
     aritmetica. Il 17 agosto ce n'erano due coppie e nessuno lo sapeva,
     perché il numero non veniva calcolato. */
  let coppieVicine = 0;
  if (indip && indip.n >= 2) {
    console.log('\n=== GLI ISTANTI SONO INDIPENDENTI? ===');
    console.log(`  Differenza media assoluta di luminanza (0-255) fra ogni coppia di fotogrammi,`);
    console.log(`  su ${indip.campioni} campioni per istante (un pixel ogni ${S.indipPasso} per lato), e accanto quanta`);
    console.log(`  PARTE del quadro cambia di più di otto livelli. Sotto ${S.indipMin.toFixed(1)} di media, o sotto il`);
    console.log(`  ${(S.indipQuota * 100).toFixed(0)}% di quadro cambiato, i due istanti sono lo STESSO fotogramma e la corsa`);
    console.log('  non vale: si conterebbe due volte lo stesso voto.');
    const q = (i, j) => indip.coppie.find(z => (z.i === i && z.j === j) || (z.i === j && z.j === i)) || null;
    console.log('        ' + Array.from({ length: indip.n }, (_, j) => String(j + 1).padStart(7)).join(''));
    for (let i = 0; i < indip.n; i++) {
      let riga = '    ' + String(i + 1).padStart(2) + '  ';
      for (let j = 0; j < indip.n; j++) {
        if (j <= i) { riga += '      .'; continue; }
        const v = q(i, j);
        riga += (v === null ? '      ?' : v.d.toFixed(1).padStart(7));
      }
      console.log(riga + '   ' + (i < indip.n - 1
        ? 'quadro cambiato: ' + indip.coppie.filter(z => z.i === i).map(z => (z.q * 100).toFixed(0) + '%').join(' ')
        : ''));
    }
    const gemella = z => z.d < S.indipMin || z.q < S.indipQuota;
    const vicine = indip.coppie.filter(gemella).sort((x, y) => x.d - y.d);
    coppieVicine = vicine.length;
    const minimo = indip.coppie.reduce((x, y) => (y.d < x.d ? y : x), indip.coppie[0]);
    console.log(`  coppia più vicina: ${minimo.i + 1}-${minimo.j + 1} a ${minimo.d.toFixed(2)} (quadro cambiato ${(minimo.q * 100).toFixed(0)}%)` +
      `  ·  coppie sotto la soglia: ${coppieVicine} su ${indip.coppie.length}`);
    if (coppieVicine) {
      for (const v of vicine) {
        console.log(`  NO   istanti ${v.i + 1} e ${v.j + 1} differiscono di ${v.d.toFixed(2)} su 255 e cambiano solo il ${(v.q * 100).toFixed(0)}%`);
        console.log('       del quadro: è lo stesso fotogramma, e il banco conterebbe due volte lo stesso voto.');
      }
    } else {
      console.log(`  OK   gli ${indip.n} campioni sono ${indip.n}: nessuna coppia sotto la soglia.`);
    }
    if (indip.gemello) {
      console.log(`  (controprova, il GEMELLO SPORCO: la stessa partita ferma allo stesso millesimo,`);
      console.log(`   rimisurata dopo i due ridisegni del riferimento — cioè la coppia che il banco di`);
      console.log(`   ieri produceva da sé — dà ${indip.gemello.d.toFixed(2)} e cambia il ${(indip.gemello.q * 100).toFixed(1)}% del quadro:`);
      console.log(`   ${(indip.gemello.d < S.indipMin || indip.gemello.q < S.indipQuota) ? 'sotto le soglie, il guardiano la riconosce' : 'SOPRA LE SOGLIE: il guardiano è cieco'}.`);
    }
  }
  if (coperti) {
    console.log(`\nPROVE NON VALIDE: ${coperti} fotografie su ${esiti.length} sono coperte da uno`);
    console.log('strato del DOM. Le misure leggono la tela e restano vere, ma quei PNG non');
    console.log('mostrano il gioco: chi giudica guarderebbe un sipario.');
  }
  if (mancantiVisti.length) {
    console.log('\nHOOK MANCANTI (la misura ha usato un ripiego): ' +
      Array.from(new Set(mancantiVisti)).join(', '));
  }
  if (errori.length) console.log('ERRORI IN PAGINA: ' + errori.slice(0, 3).join(' | '));

  if (controllo) {
    /* IL BANCO, sul gioco che le ombre lunghe ce le ha davvero. Tre cose
       da dimostrare, tutte sullo stesso istante di partita:
         1. la misura SEGUE I PIXEL: col sole spostato a 145 gradi deve
            dire 145, non i 20 che il gioco continua a dichiarare;
         2. la seconda campana suona: quel disaccordo dev'essere segnalato;
         3. la misura SA FALLIRE: col prato spianato non deve trovare
            nessuna ombra e il gradiente deve cadere sotto la soglia. */
    const n2 = esiti.length;
    const dirA = esiti.map(e => e.dirA).filter(x => x !== null && x !== undefined);
    const segue = dirA.filter(d => { let x = Math.abs(d - 145); if (x > 180) x = 360 - x; return x <= 12; }).length;
    const grida = esiti.filter(e => !e.cA[3].ok).length;
    const omB = esiti.filter(e => !e.cB[3].ok).length;
    const prA = esiti.filter(e => e.cA[4].ok).length, prB = esiti.filter(e => !e.cB[4].ok).length;
    /* la misura 6: il centro riportato a mezzogiorno deve FALLIRE, il
       centro portato a sera deve PASSARE. Si contano solo gli istanti in
       cui la misura era misurabile: dove il centro non ha manto vuoto a
       sufficienza non c'è niente da dimostrare, e contarlo come prova
       superata sarebbe esattamente il vizio che questo banco previene. */
    const misurabile = e => {
      const q = e.m.centro, r = e.m.centroRif;
      return !!(q && r && r.valido && q.n >= S.centroCampioniMin);
    };
    const misurabili = esiti.filter(misurabile).length;
    /* IL CENTRO A MEZZOGIORNO SI GIUDICA SOLO DOVE IL CANCELLO MORDE. Al
       minuto tre un centro di mezzogiorno non è un difetto: è l'ora. La
       prova «sa fallire» si conta quindi sugli istanti del SECONDO TEMPO
       e misurabili — e se non ce ne fossero abbastanza il banco lo dice
       invece di dichiararsi verde su una popolazione vuota, che è il
       vizio esatto che questo banco esiste per prevenire. */
    const tardi = esiti.filter(e => misurabile(e) && e.m.ora !== null && e.m.ora > S.centroSecondoTempo);
    const ceC = tardi.filter(e => e.cC && !e.cC[5].ok).length;
    const ceD = esiti.filter(e => misurabile(e) && e.cD && e.cD[5].ok).length;
    /* PRIMA DEL COLORE DEL CANCELLO, IL NUMERO. Il colore dipende anche
       dall'ora dell'istante; il NUMERO no, e il numero è la prova che la
       misura guarda i pixel e non la dichiarazione. Col centro di
       mezzogiorno incollato sopra, il calo deve crollare a zero mentre il
       gioco continua a dichiarare la sua ora tarda; col centro portato a
       sera a mano deve scavalcare tutt'e due le soglie. */
    const conC = esiti.filter(e => e.caloC), conD = esiti.filter(e => e.caloD);
    const zeroC = conC.filter(e => Math.abs(e.caloC.L) < 0.02 && Math.abs(e.caloC.S) < 0.02).length;
    const fortD = conD.filter(e => e.caloD.L >= S.centroLumCalo && e.caloD.S >= S.centroSatCalo).length;
    /* i tre cancelli riparati il 18 agosto: il centro abitato sa fallire
       e sa passare, e la palla non si lascia più comprare dall'anello */
    /* IL FALSO CHE DEVE FALLIRE è il caso PEGGIORE dal verso gentile: le
       figure escono dal riquadro dello stretto indispensabile e il
       PALLONE resta dov'era. Se il cancello passasse con il pallone e
       nessun corpo, starebbe ancora contando qualcos'altro.
       IL FALSO CHE DEVE PASSARE è il caso peggiore dall'altro verso: nel
       riquadro ci stanno ESATTAMENTE due figure e il pallone, cioè
       l'aritmetica del tetto e nient'altro, perché tutti gli altri sono
       stati sgombrati prima. Se non passasse, il tetto chiederebbe più
       di quanto il suo conto promette. */
    const vuotoE = esiti.filter(e => e.mE && e.mE.centroAbitato.figure === 0).length;
    const rossoE = esiti.filter(e => e.cE && !e.cE[6].ok).length;
    const pienoF = esiti.filter(e => e.mF && e.mF.centroAbitato.figure >= 2 && e.mF.centroAbitato.palla === 1).length;
    const verdeF = esiti.filter(e => e.cF && e.cF[6].ok).length;
    const fermaEF = esiti.filter(e => e.mE && e.mF && e.mE.scenaFalso && e.mF.scenaFalso &&
      e.mE.scenaFalso.ferma && e.mF.scenaFalso.ferma).length;
    /* la palla con l'anello dipinto attorno: il conto severo non deve
       CRESCERE (5% di tolleranza, che è mezzo pixel su dieci), quello
       permissivo deve gonfiarsi — se non si gonfiasse, il falso non
       starebbe mettendo alla prova niente.
       PERCHE' «non cresce» E NON «non si muove»: in un istante su quattro
       il conto severo CALA dell'11%, e non è la misura che sbaglia, è il
       falso che è invadente. Lì il pallone sta al piede e il diametro
       misurato (52 px) supera già quello disegnato (44) perché la coda
       del raggio si allunga sulla macchia di contatto del pallone, che
       scura e neutra lo è quanto il suo contorno; lo zoccolo nero
       dell'anello finto ci si posa sopra e la coda si accorcia. La cosa
       da dimostrare è una sola e resta intera: l'anello NON si vende
       come palla. */
    const conG = esiti.filter(e => e.mG && e.m.palla.diamPx > 0);
    const fermoG = conG.filter(e => e.mG.palla.diamPx <= e.m.palla.diamPx * 1.05).length;
    const gonfioG = conG.filter(e => e.mG.palla.diamLargo > e.mG.palla.diamPx * 1.10).length;
    console.log('\n=== BANCO DI PROVA DELLO STRUMENTO ===');
    console.log(`  1. segue i pixel      col sole dipinto a 145°, la misura dice 145° in ${segue}/${dirA.length} fotogrammi`);
    console.log(`     (se dicesse i 20° dichiarati dal gioco starebbe copiando la risposta)`);
    console.log(`  2. la seconda campana il disaccordo col dichiarato è segnalato in ${grida}/${n2}`);
    console.log(`  3. sa fallire         col prato spianato: ombre NO in ${omB}/${n2}, prato NO in ${prB}/${n2}`);
    console.log(`  4. sa passare         col gradiente dipinto: prato OK in ${prA}/${n2}`);
    console.log(`  5. il centro segue i pixel  incollando il mezzogiorno VERO sul terzo centrale, il`);
    console.log(`                            calo crolla sotto il 2% in ${zeroC}/${conC.length} fotogrammi, mentre il gioco`);
    console.log(`                            continua a dichiarare la sua ora tarda`);
    console.log(`  6. il centro sa fallire   su quegli stessi fotogrammi il cancello è NO in ${ceC}/${tardi.length}`);
    console.log(`                            istanti del secondo tempo, cioè dove morde (misurabili: ${misurabili}/${n2})`);
    console.log(`  7. il centro sa passare   portando a mano il centro a sera (V e S x0,75) il calo`);
    console.log(`                            scavalca le due soglie in ${fortD}/${conD.length} e il cancello è OK in ${ceD}/${misurabili}`);
    console.log(`  8. il centro abitato sa fallire  sgombrando il riquadro — figure spostate dello`);
    console.log(`                            stretto indispensabile, PALLONE lasciato dov'era — non resta`);
    console.log(`                            nessuna figura in ${vuotoE}/${n2} e il cancello è NO in ${rossoE}/${n2}`);
    console.log(`  9. il centro abitato sa passare  mettendoci il duello e basta (due figure e il`);
    console.log(`                            pallone, l'aritmetica del tetto e nient'altro) il riquadro li ha`);
    console.log(`                            in ${pienoF}/${n2} e il cancello è OK in ${verdeF}/${n2}`);
    console.log(`                            camera ferma sui due falsi in ${fermaEF}/${n2}: se si muovesse, il`);
    console.log(`                            falso cambierebbe anche l'inquadratura e non proverebbe niente`);
    console.log(` 10. la palla non compra l'anello  dipingendo l'anello di possesso attorno al`);
    console.log(`                            pallone alla distanza minima consentita dal gioco, il`);
    console.log(`                            diametro misurato non cresce (+5% al più) in ${fermoG}/${conG.length},`);
    console.log(`                            mentre il conto permissivo si gonfia in ${gonfioG}/${conG.length}`);
    console.log(`                            (se non si gonfiasse, il falso non proverebbe niente)`);
    console.log(` 11. gli istanti sono otto  la coppia più vicina misura ` +
      `${indip && indip.coppie.length ? indip.coppie.reduce((x, y) => (y.d < x.d ? y : x)).d.toFixed(2) : '—'}` +
      ` (soglia ${S.indipMin.toFixed(1)}), mentre il`);
    console.log(`                            gemello sporco — lo stesso fotogramma dopo i ridisegni del`);
    console.log(`                            riferimento — misura ` +
      `${indip && indip.gemello ? indip.gemello.d.toFixed(2) : '—'} e viene riconosciuto`);
    const indipOk = !!indip && indip.n >= 2 && coppieVicine === 0 &&
      !!indip.gemello && (indip.gemello.d < S.indipMin || indip.gemello.q < S.indipQuota);
    /* IL VERDETTO DICE CHE COSA E' CADUTO, e non è un dettaglio di
       cortesia: «il banco non torna» mandava chi legge a rileggersi
       undici righe per indovinare quale. Le condizioni si scrivono una a
       una, con il nome e i due numeri, e quelle rosse si stampano. */
    const cond = [
      ['popolazione delle ombre finte', dirA.length >= n2 * 0.6,
        `solo ${dirA.length} fotogrammi su ${n2} danno una direzione misurabile sul falso (ne servono ${Math.ceil(n2 * 0.6)}): ` +
        'non è la misura che sbaglia, è che il falso non ha su cosa lavorare — si sposta la finestra degli istanti'],
      ['la direzione segue i pixel', segue === dirA.length, `${segue} su ${dirA.length}`],
      ['il disaccordo col dichiarato è gridato', grida === n2, `${grida} su ${n2}`],
      ['sul prato spianato le ombre spariscono', omB === n2, `${omB} su ${n2}`],
      ['sul prato spianato il gradiente cade', prB === n2, `${prB} su ${n2}`],
      ['sul gradiente dipinto il prato passa', prA === n2, `${prA} su ${n2}`],
      ['popolazione del centro', misurabili >= n2 * 0.6, `${misurabili} su ${n2}`],
      ['il centro a mezzogiorno crolla a zero', conC.length === misurabili && zeroC === conC.length, `${zeroC} su ${conC.length}`],
      ['il centro sa fallire dove morde', tardi.length >= 1 && ceC === tardi.length, `${ceC} su ${tardi.length} istanti del secondo tempo`],
      ['il centro sa passare', fortD === conD.length && ceD === misurabili, `${ceD} su ${misurabili}`],
      ['il centro abitato sa fallire', vuotoE === n2 && rossoE === n2, `riquadro sgombro in ${vuotoE}, rosso in ${rossoE}, su ${n2}`],
      ['il centro abitato sa passare', pienoF === n2 && verdeF === n2, `duello dentro in ${pienoF}, verde in ${verdeF}, su ${n2}`],
      ['la camera non si muove sui due falsi', fermaEF === n2, `${fermaEF} su ${n2}`],
      ['la palla non compra l\'anello', conG.length >= n2 * 0.6 && fermoG === conG.length && gonfioG >= 1,
        `fermo ${fermoG}/${conG.length}, gonfiato ${gonfioG}/${conG.length}`],
      ['gli istanti sono indipendenti', indipOk, `${coppieVicine} coppie sotto la soglia`],
    ];
    const sano = cond.every(c => c[1]);
    if (sano) {
      console.log('  OK   la misura segue il fotogramma e non la dichiarazione: sa passare e sa fallire.');
    } else {
      console.log('  NO   il banco non torna. Cade:');
      for (const c of cond) if (!c[1]) console.log(`       · ${c[0]} — ${c[2]}`);
    }
    process.exit(sano ? 0 : 1);
  }

  if (coperti) process.exit(1);
  /* UNA CORSA CON DUE ISTANTI UGUALI NON E' UNA CORSA A OTTO: il conteggio
     finale sarebbe aritmeticamente falso, e un banco che si sa falso e
     stampa lo stesso il totale è peggio di nessun banco. */
  if (coppieVicine) {
    console.log('\nIL BANCO NON HA OTTO CAMPIONI: ' + coppieVicine + ' coppie di istanti sono lo stesso');
    console.log('fotogramma. Il totale qui sopra conta più volte lo stesso voto e non vale.');
    /* USCITA 3 E NON 1, ed e' una riparazione del 20 agosto: con l'uscita 1
       questa autodenuncia era indistinguibile da «il gioco e' rosso», e la
       batteria la ignorava — il totale non valido veniva letto come un
       totale. Codici di casa: 0 verde, 1 il gioco e' rosso, 2 il banco e'
       esploso, 3 la prova e' nulla. Questa e' la 3. */
    process.exit(3);
  }
  if (passate < tot) {
    console.log('\nOgni misura fallita è una riga della scheda della giuria: la luce delle');
    console.log('sette di sera, la palla protagonista, la regia del quadro. Il fotogramma');
    console.log('casuale dell\'azione non regge ancora come manifesto.');
    process.exit(1);
  }
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
